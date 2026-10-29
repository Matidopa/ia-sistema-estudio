// Cálculos con datos reales: cuánto pesa cada tema en el parcial, familias de preguntas que más
// se repiten, dominio por tema y el plan del modo exprés.
import * as D from './datos.js';
import * as P from './progreso.js';
import { mezclar } from './componentes.js';

export const MECANICAS = ['u4-emparrillado', 'u5-busqueda', 'u3-protocolos'];
export const ANEXO_DE = { 'u3-protocolos': 'A', 'u5-busqueda': 'B', 'u4-emparrillado': 'C' };

let cache = null;
function periodos() {
  return [...new Set(D.PARCIALES.examenes.map(e => e.periodo))].sort();
}
// Los dos períodos más nuevos marcan el formato actual del parcial.
export function periodosRecientes() { return periodos().slice(-2); }
export const esReciente = p => { const e = D.examen(p.examen); return !!e && periodosRecientes().includes(e.periodo); };

// Promedio de preguntas por parcial de cada unidad (en los parciales recientes y en todos).
export function frecuencias() {
  if (cache) return cache;
  const rec = periodosRecientes();
  const exRec = D.PARCIALES.examenes.filter(e => rec.includes(e.periodo));
  const porU = {}, porUTodos = {};
  for (const p of D.PARCIALES.preguntas) {
    porUTodos[p.unidad] = (porUTodos[p.unidad] || 0) + 1;
    if (rec.includes(D.examen(p.examen).periodo)) porU[p.unidad] = (porU[p.unidad] || 0) + 1;
  }
  const res = {};
  for (const u of D.RUTA.unidades) {
    res[u.id] = {
      reciente: (porU[u.id] || 0) / exRec.length,
      historico: (porUTodos[u.id] || 0) / D.PARCIALES.examenes.length,
      total: porUTodos[u.id] || 0,
    };
  }
  cache = res;
  return res;
}

// Reparte 25 preguntas según la frecuencia reciente (método del mayor resto).
export function distribucion(total = 25) {
  const f = frecuencias();
  const ids = Object.keys(f).filter(k => f[k].reciente > 0);
  const suma = ids.reduce((s, k) => s + f[k].reciente, 0);
  const base = ids.map(k => { const x = f[k].reciente * total / suma; return { k, n: Math.floor(x), r: x - Math.floor(x) }; });
  let falta = total - base.reduce((s, b) => s + b.n, 0);
  base.sort((a, b) => b.r - a.r).forEach(b => { if (falta > 0) { b.n++; falta--; } });
  return Object.fromEntries(base.filter(b => b.n > 0).map(b => [b.k, b.n]));
}

// Familia de una pregunta: el comienzo normalizado del enunciado ("La cantidad de grupos…").
const normal = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[“”"«»'‘’]/g, '').replace(/\b(c|e)\d\b/g, 'x').replace(/\s+/g, ' ').trim();
export function familia(p) {
  const t = normal(p.enunciado);
  if (!t) return p.unidad + ':img';
  return p.unidad + ':' + t.split(' ').slice(0, 6).join(' ');
}
let familiasCache = null;
export function familias() {
  if (familiasCache) return familiasCache;
  const m = {};
  for (const p of D.PARCIALES.preguntas) (m[familia(p)] = m[familia(p)] || []).push(p);
  familiasCache = m;
  return m;
}
export const vecesQueSalio = p => (familias()[familia(p)] || []).length;

// Las preguntas reales más repetidas de una unidad: una por familia, de la familia más grande a la más chica.
// Dentro de cada familia prefiere una reciente que todavía no hiciste.
export function masRepetidas(uid, n) {
  const fams = Object.entries(familias()).filter(([k]) => k.startsWith(uid + ':') && !k.endsWith(':img'))
    .sort((a, b) => b[1].length - a[1].length);
  const res = [];
  for (const [, lista] of fams) {
    const candidatas = lista.filter(p => !p.img_completa);
    if (!candidatas.length) continue;
    const orden = [...candidatas].sort((a, b) => puntaje(b) - puntaje(a));
    res.push(orden[0]);
    if (res.length >= n) break;
  }
  return res;
}
function puntaje(p) {
  const e = P.estadoPregunta(p.id);
  return (esReciente(p) ? 2 : 0) + (!e || !e.intentos ? 3 : e.ultimaBien ? 0 : 1) + Math.random();
}

// Práctica dirigida de una técnica mecánica: preguntas reales recientes nunca hechas primero.
export function practicaDirigida(uid, n) {
  const reales = D.realesDeUnidad(uid).filter(p => !p.img_completa);
  const orden = mezclar(reales).sort((a, b) => puntaje(b) - puntaje(a));
  // variar familias: no más de 3 de la misma
  const cuenta = {}, res = [];
  for (const p of orden) {
    const f = familia(p);
    if ((cuenta[f] || 0) >= 3) continue;
    cuenta[f] = (cuenta[f] || 0) + 1;
    res.push(p);
    if (res.length >= n) break;
  }
  return res;
}

// ---------- Dominio por tema ----------
// Acierto en las últimas respuestas (de cada pregunta, la última) de la unidad, con preguntas reales y generadas.
export function dominio(uid) {
  const ids = [...D.realesDeUnidad(uid), ...D.generadasDeUnidad(uid)].map(p => p.id);
  const hechas = ids.map(id => P.estadoPregunta(id)).filter(e => e && e.intentos).sort((a, b) => b.ultima - a.ultima).slice(0, 12);
  if (!hechas.length) return { nivel: 'sin-ver', frac: 0, n: 0 };
  const frac = hechas.filter(e => e.ultimaBien).length / hechas.length;
  const nivel = hechas.length < 4 ? (frac >= 0.75 ? 'bien' : 'flojo') : frac >= 0.85 ? 'dominado' : frac >= 0.65 ? 'bien' : 'flojo';
  return { nivel, frac, n: hechas.length };
}
export const NIVEL_TXT = { 'sin-ver': 'Sin practicar', flojo: 'Flojo', bien: 'Bien', dominado: 'Dominado' };

// Estimación de preguntas bien en un parcial de 25 con tu dominio actual (solo temas practicados).
export function estimacion() {
  const dist = distribucion();
  let esperado = 0, cubierto = 0;
  for (const [u, n] of Object.entries(dist)) {
    const d = dominio(u);
    if (d.n >= 3) { esperado += d.frac * n; cubierto += n; }
  }
  return { esperado: Math.round(esperado), cubierto };
}

// ---------- Modo exprés ----------
// Minutos de lectura de una ficha según su largo (≈180 palabras por minuto, mínimo 3).
export const minutosLectura = md => Math.max(3, Math.round((md || '').split(/\s+/).length / 180));

const MIN_POR_PREGUNTA = { mecanica: 3, teoria: 1.5 };

// Pasos del plan exprés. Las técnicas mecánicas primero (son ≈15 de 25 y se aprenden con práctica),
// después la teoría ordenada por cuántas preguntas toma en los parciales recientes.
export function pasosExpres() {
  const f = frecuencias();
  const pasos = [];
  pasos.push({ id: 'x-parcial', tipo: 'intro', unidades: ['u0-parcial'], titulo: 'Cómo es el parcial y cómo encararlo', minutos: 4,
    detalle: 'Qué entra, cómo se reparten las 25 preguntas y una estrategia para rendir.' });
  const mec = [...MECANICAS].sort((a, b) => f[b].reciente - f[a].reciente);
  for (const u of mec) {
    const un = D.unidad(u);
    pasos.push({ id: 'x-' + u, tipo: 'mecanica', unidades: [u], titulo: un.titulo, nPreguntas: 8,
      minutos: 6 + 8 * MIN_POR_PREGUNTA.mecanica, frecuencia: f[u].reciente,
      detalle: `≈${redondo(f[u].reciente)} preguntas por parcial. Ficha con la receta, simulador y 8 preguntas reales recientes.` });
  }
  pasos.push({ id: 'x-bloque', tipo: 'bloque', unidades: MECANICAS, titulo: 'Mini simulacro de las tres técnicas', minutos: 30,
    detalle: 'Las preguntas de Protocolos, Emparrillado y Búsqueda de un parcial reciente, con sus anexos y cronómetro.' });
  const teoricas = D.RUTA.unidades.map(u => u.id)
    .filter(u => !MECANICAS.includes(u) && f[u] && f[u].reciente >= 0.5)
    .sort((a, b) => f[b].reciente - f[a].reciente);
  for (const u of teoricas) {
    const un = D.unidad(u);
    const n = Math.max(4, Math.min(8, Math.round(f[u].reciente * 2.5)));
    pasos.push({ id: 'x-' + u, tipo: 'teoria', unidades: [u], titulo: un.titulo, nPreguntas: n,
      minutos: 5 + Math.round(n * MIN_POR_PREGUNTA.teoria), frecuencia: f[u].reciente,
      detalle: `≈${redondo(f[u].reciente)} pregunta${f[u].reciente >= 1.5 ? 's' : ''} por parcial. Lo que sí o sí tenés que saber y las ${n} preguntas que más se repiten.` });
  }
  pasos.push({ id: 'x-repaso', tipo: 'repaso', unidades: [], titulo: 'Repaso de lo que erraste', minutos: 15,
    detalle: 'Vuelven las preguntas que fallaste en los pasos anteriores, hasta 15.' });
  pasos.push({ id: 'x-final', tipo: 'final', unidades: [], titulo: 'Simulacro final de 25 preguntas', minutos: 75,
    detalle: 'Mezcladas con la distribución real por tema, con anexos y cronómetro. Al final ves la nota por tema.' });
  return pasos;
}
const redondo = x => (Math.round(x * 2) / 2).toString().replace('.', ',');

// Un paso cuenta como hecho si se completó en exprés o si su unidad ya está aprobada en el camino completo.
export function pasoHecho(paso) {
  if (P.pasoExpres(paso.id)) return true;
  if ((paso.tipo === 'mecanica' || paso.tipo === 'teoria') && paso.unidades.every(u => P.estadoUnidad(u).aprobada)) return true;
  return false;
}
export function siguientePasoExpres() {
  return pasosExpres().find(p => !pasoHecho(p)) || null;
}
export function resumenExpres() {
  const pasos = pasosExpres();
  const hechos = pasos.filter(pasoHecho);
  const total = pasos.reduce((s, p) => s + p.minutos, 0);
  const restante = pasos.filter(p => !pasoHecho(p)).reduce((s, p) => s + p.minutos, 0);
  return { pasos, hechos: hechos.length, total, restante, terminado: hechos.length === pasos.length };
}

// Lo que queda del camino completo (para seguir después del exprés sin repetir).
export function faltanteCompleto() {
  const unidades = D.RUTA.unidades.map(u => {
    const e = P.estadoUnidad(u.id);
    const reales = D.realesDeUnidad(u.id);
    const sinVer = reales.filter(p => !(P.estadoPregunta(p.id) || {}).intentos).length;
    return { u, aprobada: !!e.aprobada, leida: !!e.leida, sinVer, reales: reales.length };
  });
  const catedra = {};
  for (const ej of D.CATEDRA.ejercicios) {
    const c = catedra[ej.tipo] = catedra[ej.tipo] || { hechos: 0, total: 0 };
    c.total++; if (P.estadoCatedra(ej.id)) c.hechos++;
  }
  return {
    sinAprobar: unidades.filter(x => !x.aprobada),
    sinLeer: unidades.filter(x => x.aprobada && !x.leida),
    unidades, catedra,
  };
}

export const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`;
