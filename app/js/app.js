import * as P from './progreso.js';
import * as D from './datos.js';
import { h, barra, mezclar, articuloTeoria } from './componentes.js';
import { vistaCatedra, vistaEjercicio } from './vistas/catedra.js';
import { vistaSimuladores } from './vistas/simuladores.js';
import { vistaBienvenida } from './vistas/bienvenida.js';
import { vistaTarjetas } from './vistas/tarjetas.js';
import { vistaExpres, vistaPasoExpres, bloqueFaltante } from './vistas/expres.js';
import { sesion, pistaTeclado } from './vistas/sesion.js';
import { examen, armarSimulacro } from './vistas/examen.js';
import { generarPreguntaAlgoritmica, TIPOS_ALGORITMICOS } from './generadores.js';
import { iniciarMarco, pintarGuardado, guardarConAviso, cerrarApp, aviso } from './shell.js';
import * as PL from './plan.js';

const $main = () => document.getElementById('principal');

// ---------------- Navegación ----------------
const RUTAS = [
  [/^#\/?$/, vistaInicio],
  [/^#\/bienvenida(\?.*)?$/, vistaBienvenida],
  [/^#\/expres$/, vistaExpres],
  [/^#\/expres\/([\w-]+)$/, vistaPasoExpres],
  [/^#\/ruta$/, vistaRuta],
  [/^#\/unidad\/([\w-]+)$/, vistaUnidad],
  [/^#\/practica(\?.*)?$/, vistaPractica],
  [/^#\/examen$/, vistaExamen],
  [/^#\/parciales$/, vistaParciales],
  [/^#\/parcial\/([\w-]+)(\?.*)?$/, vistaParcial],
  [/^#\/repaso$/, vistaRepaso],
  [/^#\/tarjetas(\?.*)?$/, vistaTarjetas],
  [/^#\/catedra$/, vistaCatedra],
  [/^#\/catedra\/([\w-]+)$/, vistaEjercicio],
  [/^#\/simuladores(\/[\w-]+)?$/, vistaSimuladores],
  [/^#\/ajustes$/, vistaAjustes],
];

let navegando = 0;
async function navegar() {
  let hash = location.hash || '#/';
  // Sin usuario (o sin modo elegido) se pasa primero por la bienvenida
  if (!P.usuarioActual() || (!P.modoEstudio() && !hash.startsWith('#/bienvenida'))) {
    if (!hash.startsWith('#/bienvenida')) { history.replaceState(null, '', '#/bienvenida'); hash = '#/bienvenida'; }
  }
  document.body.classList.toggle('modo-bienvenida', hash.startsWith('#/bienvenida'));
  const yo = ++navegando;
  const main = $main();
  main.innerHTML = '';
  main.classList.remove('entra'); void main.offsetWidth; main.classList.add('entra');
  let encontrada = false;
  for (const [re, fn] of RUTAS) {
    const m = hash.match(re);
    if (m) {
      encontrada = true;
      try { await fn(main, ...m.slice(1)); } catch (e) { console.error(e); main.append(h('div', { class: 'vacio' }, 'Algo falló al mostrar esta sección: ' + e.message)); }
      break;
    }
  }
  if (!encontrada) main.append(h('div', { class: 'vacio' }, 'No existe esta sección. ', h('a', { href: '#/' }, 'Volver al inicio')));
  if (yo !== navegando) return;
  marcarNav();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}
function parametros(q) { return Object.fromEntries(new URLSearchParams((q || '').replace(/^\?/, ''))); }
const refrescar = () => navegar();

function marcarNav() {
  const hash = location.hash || '#/';
  const modo = P.usuarioActual() ? P.modoEstudio() : null;
  document.querySelectorAll('.nav a').forEach(a => {
    const k = a.getAttribute('href');
    const activo = k === '#/' ? hash === '#/' || hash === '' : hash.startsWith(k) || (k === '#/ruta' && hash.startsWith('#/unidad')) || (k === '#/parciales' && hash.startsWith('#/parcial/'));
    if (activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    a.classList.toggle('modo-activo', !!modo && a.dataset.modo === modo);
  });
  if (!P.usuarioActual()) return;
  const rep = P.paraRepasar().length;
  const c = document.getElementById('cuenta-repaso');
  if (c) { c.textContent = rep; c.hidden = rep === 0; }
  pintarRutaMini();
}

function pintarRutaMini() {
  const ul = document.getElementById('ruta-mini');
  if (!ul) return;
  ul.innerHTML = '';
  const hash = location.hash;
  for (const u of D.RUTA.unidades) {
    const e = P.estadoUnidad(u.id);
    const actual = hash === `#/unidad/${u.id}`;
    ul.append(h('li', { class: (e.aprobada ? 'hecha' : e.leida ? 'leida' : '') + (actual ? ' actual' : '') },
      h('a', { href: `#/unidad/${u.id}`, 'aria-current': actual ? 'page' : null }, h('span', { class: 'punto' }), `${u.num}. ${u.corto}`)));
  }
}

// ---------------- Estadísticas ----------------
function statsUnidad(uid) {
  const reales = D.realesDeUnidad(uid), gen = D.generadasDeUnidad(uid);
  const todas = [...reales, ...gen];
  let hechas = 0, bien = 0;
  for (const p of todas) { const e = P.estadoPregunta(p.id); if (e && e.intentos) { hechas++; if (e.ultimaBien) bien++; } }
  return { total: todas.length, reales: reales.length, generadas: gen.length, hechas, bien };
}
function statsGlobal() {
  const reales = D.PARCIALES.preguntas.filter(p => (P.estadoPregunta(p.id) || {}).intentos).length;
  const examenesReales = D.PARCIALES.examenes.filter(e => P.intentosExamen(e.id).length).length;
  return { reales, totalReales: D.PARCIALES.preguntas.length, examenesReales };
}

// ---------------- Inicio: qué hacer hoy ----------------
function siguienteCompleto() {
  return D.RUTA.unidades.find(u => !P.estadoUnidad(u.id).aprobada) || null;
}
function vistaInicio(main) {
  const modo = P.modoEstudio();
  const u = P.usuarioActual();
  const rep = P.paraRepasar().length;
  const s = statsGlobal();
  const racha = P.racha(), hoy = P.respuestasHoy();
  const META = 20;
  let hoyBloque;
  if (modo === 'expres') {
    const r = PL.resumenExpres();
    const sig = PL.siguientePasoExpres();
    hoyBloque = h('div', { class: 'destacada' },
      h('p', { class: 'previo' }, `Modo exprés · paso ${Math.min(r.hechos + 1, r.pasos.length)} de ${r.pasos.length}`),
      sig ? h('h2', {}, sig.titulo) : h('h2', {}, '¡Terminaste el plan exprés!'),
      h('p', {}, sig ? `${sig.detalle} Te lleva ≈ ${PL.fmtMin(sig.minutos)}. Te queda ≈ ${PL.fmtMin(r.restante)} de plan.` : 'Mirá abajo lo que te queda del camino completo para seguir sin repetir.'),
      h('div', { class: 'barra-destacada' }, h('span', { style: `width:${Math.round(100 * r.hechos / r.pasos.length)}%` })),
      h('div', { class: 'acciones', style: 'margin:16px 0 0' },
        sig ? h('a', { class: 'boton', href: `#/expres/${sig.id}` }, r.hechos ? 'Seguir con este paso' : 'Empezar el plan') : h('a', { class: 'boton', href: '#/examen' }, 'Hacer otro simulacro'),
        h('a', { class: 'boton secundario', href: '#/expres' }, 'Ver el plan'),
        rep ? h('a', { class: 'boton secundario', href: '#/repaso' }, `Repasar ${rep}`) : null));
  } else {
    const sig = siguienteCompleto();
    const aprob = D.RUTA.unidades.filter(x => P.estadoUnidad(x.id).aprobada).length;
    hoyBloque = h('div', { class: 'destacada' },
      h('p', { class: 'previo' }, `Modo completo · ${aprob} de ${D.RUTA.unidades.length} unidades aprobadas`),
      sig ? h('h2', {}, `${sig.num}. ${sig.titulo}`) : h('h2', {}, '¡Aprobaste todas las unidades!'),
      h('p', {}, sig ? `${sig.resumen} ≈ ${sig.minutos} min de lectura + chequeo de 5 preguntas.` : 'Ahora lo que más suma es rendir simulacros y repasar lo que erraste.'),
      h('div', { class: 'barra-destacada' }, h('span', { style: `width:${Math.round(100 * aprob / D.RUTA.unidades.length)}%` })),
      h('div', { class: 'acciones', style: 'margin:16px 0 0' },
        sig ? h('a', { class: 'boton', href: `#/unidad/${sig.id}` }, P.estadoUnidad(sig.id).leida ? 'Seguir con esta unidad' : 'Estudiar esta unidad') : h('a', { class: 'boton', href: '#/examen' }, 'Hacer un simulacro'),
        rep ? h('a', { class: 'boton secundario', href: '#/repaso' }, `Repasar ${rep} pendiente${rep > 1 ? 's' : ''}`) : null));
  }
  const est = PL.estimacion();
  main.append(
    h('div', { class: 'columna' },
      h('div', { class: 'saludo' },
        h('div', {}, h('p', { class: 'previo-titulo' }, saludo() + ', ' + u.nombre), h('h1', {}, 'Qué hacer hoy')),
        h('a', { class: 'chip-modo', href: '#/bienvenida?modo=1', title: 'Cambiar de modo' }, modo === 'expres' ? '⚡ Modo exprés' : '📚 Modo completo', h('span', { class: 'chico' }, ' · cambiar'))),
      hoyBloque,
      h('div', { class: 'grilla mini-datos' },
        tarjetaDato(racha ? `${racha} día${racha > 1 ? 's' : ''}` : '—', racha ? 'seguidos estudiando' : 'Respondé una pregunta hoy para arrancar tu racha', null),
        tarjetaDato(`${Math.min(hoy, META)}/${META}`, hoy >= META ? 'Meta de hoy cumplida' : 'preguntas hoy (meta diaria)', Math.min(1, hoy / META), true),
        tarjetaDato(`${s.reales}/${s.totalReales}`, 'preguntas reales respondidas', s.reales / s.totalReales),
        tarjetaDato(est.cubierto >= 10 ? `≈ ${est.esperado}/25` : '—', est.cubierto >= 10 ? `estimado en un parcial (sobre ${est.cubierto} preguntas de temas que practicaste)` : 'Practicá más temas para ver tu nota estimada', est.cubierto >= 10 ? est.esperado / 25 : 0, true)),
      h('div', { class: 'titulo-seccion' }, h('h2', {}, 'Tu dominio por tema'), h('p', { class: 'chico suave' }, 'Ordenado por cuántas preguntas toma en los parciales recientes. Tocá un tema para practicarlo.')),
      mapaDominio(),
      modo === 'expres' && PL.resumenExpres().terminado ? bloqueFaltante(true) : null,
      h('div', { class: 'accesos' },
        acceso('#/examen', 'Simulacro de parcial', '25 preguntas mezcladas como en el parcial real, con cronómetro'),
        acceso('#/tarjetas', 'Tarjetas de memoria', 'Definiciones, convenciones y trampas en ratos cortos'),
        acceso('#/practica', 'Práctica libre', 'Por tema, reales o generadas, con corrección al instante'),
        acceso('#/simuladores', 'Simuladores', 'Búsqueda iteración por iteración, emparrillado y ruleta'),
        acceso('#/catedra', 'Ejercicios de la cátedra', 'Las guías prácticas para resolver paso a paso'))));
}
function saludo() { const hr = new Date().getHours(); return hr < 6 ? 'Buenas noches' : hr < 13 ? 'Buen día' : hr < 20 ? 'Buenas tardes' : 'Buenas noches'; }
function tarjetaDato(valor, texto, frac, verde) {
  return h('div', { class: 'hoja dato' }, h('div', { class: 'valor' }, valor), h('p', { class: 'chico suave', style: 'margin:2px 0 10px' }, texto), frac === null ? null : barra(frac, verde));
}
function acceso(href, t, d) { return h('a', { class: 'acceso hoja', href }, h('b', {}, t), h('span', { class: 'chico suave' }, d)); }
function mapaDominio() {
  const fr = PL.frecuencias();
  const ids = D.RUTA.unidades.map(u => u.id).filter(k => fr[k] && fr[k].total > 0).sort((a, b) => fr[b].reciente - fr[a].reciente || fr[b].historico - fr[a].historico);
  return h('div', { class: 'mapa-dominio' }, ...ids.map(k => {
    const u = D.unidad(k), d = PL.dominio(k);
    const peso = fr[k].reciente;
    return h('a', { class: 'baldosa nivel-' + d.nivel, href: `#/practica?u=${k}&f=ambas&filtro=${d.nivel === 'sin-ver' ? 'nuevas' : 'todas'}&n=10` },
      h('span', { class: 'b-nombre' }, u.corto),
      h('span', { class: 'b-nivel' }, PL.NIVEL_TXT[d.nivel] + (d.n ? ` · ${Math.round(d.frac * 100)}%` : '')),
      h('span', { class: 'b-peso' }, peso >= 0.5 ? `≈${String(Math.round(peso * 2) / 2).replace('.', ',')} por parcial` : 'casi no se toma'));
  }));
}

// ---------------- Ruta ----------------
function vistaRuta(main) {
  const actual = siguienteCompleto();
  const ol = h('ol', { class: 'ruta' });
  for (const u of D.RUTA.unidades) {
    const e = P.estadoUnidad(u.id), s = statsUnidad(u.id);
    ol.append(h('li', { class: (e.aprobada ? 'hecha ' : '') + (actual && actual.id === u.id ? 'actual' : '') },
      h('span', { class: 'nodo', 'aria-hidden': 'true' }, e.aprobada ? '✓' : u.num),
      h('a', { class: 'titulo', href: `#/unidad/${u.id}` }, `${u.num}. ${u.titulo}`),
      h('div', { class: 'meta' }, `${u.peso || ''}${u.peso ? ' · ' : ''}${u.minutos} min de lectura · ${s.reales} preguntas reales · ${s.generadas} de práctica`,
        e.aprobada ? h('span', { class: 'etiqueta ok' }, e.viaExpres && !e.leida ? 'aprobada en exprés · falta la teoría completa' : 'aprobada') : e.leida ? h('span', { class: 'etiqueta' }, 'leída') : null),
      h('p', { style: 'margin:4px 0 0', class: 'chico' }, u.resumen)));
  }
  main.append(h('div', { class: 'columna texto' },
    P.modoEstudio() === 'expres' ? h('p', { class: 'previo-titulo' }, 'Estás en modo exprés: esto es el camino completo, por si querés más detalle') : h('p', { class: 'previo-titulo' }, 'Modo completo'),
    h('h1', {}, 'La ruta completa'),
    h('p', { class: 'bajada' }, D.RUTA.intro),
    ol));
}

// ---------------- Unidad ----------------
async function vistaUnidad(main, uid) {
  const u = D.unidad(uid);
  if (!u) { main.append(h('div', { class: 'vacio' }, 'No existe esa unidad.')); return; }
  const mdTxt = await D.texto('teoria/' + u.archivo);
  const s = statsUnidad(uid);
  const e = P.estadoUnidad(uid);
  const idx = D.RUTA.unidades.indexOf(u);
  const sig = D.RUTA.unidades[idx + 1], ant = D.RUTA.unidades[idx - 1];
  const art = articuloTeoria(mdTxt);
  // índice de secciones
  const hs = [...art.querySelectorAll('h2')];
  hs.forEach((x, i) => { x.id = `s-${i}`; });
  const indice = hs.length > 2 ? h('nav', { class: 'indice-teoria', 'aria-label': 'En esta unidad' }, h('p', {}, 'En esta unidad'),
    h('ol', {}, ...hs.map(x => h('li', {}, h('a', { href: '#', onclick: ev => { ev.preventDefault(); x.scrollIntoView({ behavior: 'smooth' }); } }, x.textContent))),
      h('li', { class: 'ir-chequeo' }, h('a', { href: '#', onclick: ev => { ev.preventDefault(); document.getElementById('chequeo').scrollIntoView({ behavior: 'smooth' }); } }, 'Chequeo de la unidad →')))) : null;
  if (!e.leida) P.marcarUnidad(uid, { leida: true });
  const lectura = h('div', { class: 'progreso-lectura', 'aria-hidden': 'true' }, h('span'));
  const chequeo = h('div');
  main.append(lectura, h('div', { class: 'columna con-indice' },
    h('div', { class: 'unidad-cabeza' },
      h('p', { class: 'miga chico suave' }, h('a', { href: '#/ruta' }, 'Ruta'), ` / Unidad ${u.num}`),
      h('h1', {}, u.titulo),
      h('p', { class: 'bajada' }, u.resumen),
      h('div', { class: 'fila-meta' }, h('span', { class: 'etiqueta' }, `${u.minutos} min de lectura`), u.peso ? h('span', { class: 'etiqueta' }, u.peso) : null,
        e.aprobada ? h('span', { class: 'etiqueta ok' }, 'aprobada') : null),
      h('div', { class: 'acciones' },
        h('a', { class: 'boton secundario', href: `#/practica?u=${uid}&f=real` }, `Preguntas reales (${s.reales})`),
        h('a', { class: 'boton secundario', href: `#/practica?u=${uid}&f=ia` }, `Práctica generada (${s.generadas})`),
        h('a', { class: 'boton secundario', href: `#/tarjetas?u=${uid}` }, 'Tarjetas'),
        h('button', { class: 'boton secundario', type: 'button', onclick: () => document.getElementById('chequeo').scrollIntoView({ behavior: 'smooth' }) }, 'Ir al chequeo'))),
    h('div', { class: 'unidad-cuerpo' }, art, indice),
    h('h2', { id: 'chequeo' }, 'Chequeo de la unidad'),
    h('p', { class: 'suave' }, 'Cinco preguntas de esta unidad, priorizando las que todavía no acertaste. Con 4 de 5 bien la unidad queda aprobada (también cuenta para el modo exprés).'),
    chequeo,
    h('div', { class: 'acciones nav-unidad' },
      ant ? h('a', { class: 'boton secundario', href: `#/unidad/${ant.id}` }, `← ${ant.corto}`) : null,
      sig ? h('a', { class: 'boton', href: `#/unidad/${sig.id}` }, `${sig.corto} →`) : null)));
  armarChequeo(chequeo, uid);
  const barraL = lectura.firstChild;
  const onScroll = () => {
    if (!document.body.contains(art)) { removeEventListener('scroll', onScroll); return; }
    const r = art.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    barraL.style.width = `${Math.round(frac * 100)}%`;
  };
  addEventListener('scroll', onScroll, { passive: true });
}

function armarChequeo(cont, uid) {
  cont.innerHTML = '';
  // Prioriza preguntas que nunca acertaste; evita repetir la misma familia
  const base = [...D.generadasDeUnidad(uid), ...D.realesDeUnidad(uid).filter(p => !p.img_completa)];
  const peso = p => { const e = P.estadoPregunta(p.id); return (!e ? 2 : e.ultimaBien ? 0 : 1.5) + Math.random(); };
  const orden = mezclar(base).sort((a, b) => peso(b) - peso(a));
  const fams = new Set(), pool = [];
  for (const p of orden) { const f = PL.familia(p); if (p.tipo === 'real' && fams.has(f)) continue; fams.add(f); pool.push(p); if (pool.length >= 5) break; }
  if (!pool.length) { cont.append(h('div', { class: 'vacio' }, 'Esta unidad todavía no tiene preguntas.')); return; }
  sesion(cont, pool, {
    titulo: 'Chequeo de la unidad',
    onFin: r => {
      const aprobada = r.bien >= Math.min(4, pool.length);
      if (aprobada) { P.marcarUnidad(uid, { aprobada: true, chequeo: r.bien }); aviso('¡Unidad aprobada!'); }
      pintarRutaMini();
    },
    accionesFin: r => {
      const aprobada = r.bien >= Math.min(4, pool.length);
      const idx = D.RUTA.unidades.findIndex(x => x.id === uid);
      const sig = D.RUTA.unidades[idx + 1];
      return [
        h('p', { class: 'chico', style: 'width:100%;margin:0' }, aprobada ? '✓ Unidad aprobada.' : 'Necesitás 4 de 5 para aprobarla. Mirá las explicaciones y probá otra vez.'),
        aprobada && sig ? h('a', { class: 'boton', href: `#/unidad/${sig.id}` }, `Siguiente: ${sig.corto}`) : null,
        h('button', { class: aprobada ? 'boton secundario' : 'boton', type: 'button', onclick: () => armarChequeo(cont, uid) }, 'Otro chequeo'),
      ];
    },
  });
}

// ---------------- Práctica ----------------
function vistaPractica(main, q) {
  const prm = parametros(q);
  const unidades = prm.u ? prm.u.split(',') : [];
  let fuente = prm.f || 'ambas'; // real | ia | ambas | algo
  const filtro = prm.filtro || 'todas'; // todas | nuevas | falladas
  const cuantas = +(prm.n || 10);
  const fam = prm.fam ? decodeURIComponent(prm.fam) : '';
  const tiposAlgo = TIPOS_ALGORITMICOS.filter(t => !unidades[0] || t.unidad === unidades[0]);

  const form = h('form', { class: 'hoja fila form-practica' },
    h('label', { class: 'campo' }, 'Tema', selectUnidades(unidades[0] || '')),
    h('label', { class: 'campo' }, 'De dónde', h('select', { name: 'f' },
      opt('ambas', 'Reales + generadas', fuente), opt('real', 'Solo parciales reales', fuente), opt('ia', 'Solo generadas por IA', fuente), opt('algo', 'Ejercicios nuevos (búsqueda, emparrillado, ruleta, métricas, difusa)', fuente))),
    h('label', { class: 'campo' }, 'Cuáles', h('select', { name: 'filtro' }, opt('todas', 'Todas', filtro), opt('nuevas', 'Las que nunca hice', filtro), opt('falladas', 'Las que erré', filtro))),
    unidades[0] && PL.familiasDeUnidad(unidades[0]).length ? h('label', { class: 'campo campo-ancho' }, 'Tipo de pregunta', h('select', { name: 'fam' },
      h('option', { value: '' }, 'Todos los tipos'), ...PL.familiasDeUnidad(unidades[0]).map(f => opt(f.clave, `${f.nombre} (salió ${f.n} veces)`, fam)))) : null,
    h('label', { class: 'campo' }, 'Cantidad', h('select', { name: 'n' }, ...[5, 10, 20, 40].map(n => opt(String(n), String(n), String(cuantas))))),
    h('button', { class: 'boton', type: 'submit' }, q ? 'Otra tanda' : 'Empezar'));
  form.querySelector('select[name=u]').addEventListener('change', () => { const c = form.querySelector('.campo-ancho'); if (c) c.remove(); });
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(form);
    const famSel = fd.get('u') === (unidades[0] || '') && fd.get('fam') ? `&fam=${encodeURIComponent(fd.get('fam'))}` : '';
    const nuevo = `#/practica?u=${fd.get('u')}&f=${fd.get('f')}&filtro=${fd.get('filtro')}&n=${fd.get('n')}${famSel}`;
    if (location.hash === nuevo) navegar(); else location.hash = nuevo;
  });
  const col = h('div', { class: 'columna texto' }, h('h1', {}, 'Práctica'));
  main.append(col);
  if (!q) {
    col.append(h('p', { class: 'bajada' }, 'Elegí un tema (o todos, mezclados como en el parcial). Cada respuesta se corrige al instante, con la explicación, y queda guardada en tu progreso.'), form, pistaTeclado());
    return;
  }
  // con la sesión empezada, el formulario queda plegado arriba
  const u0 = unidades[0] ? D.unidad(unidades[0]) : null;
  col.append(h('details', { class: 'plegable-form' }, h('summary', {}, `${u0 ? u0.corto : 'Todos los temas'} · ${{ ambas: 'reales + generadas', real: 'reales', ia: 'generadas', algo: 'ejercicios nuevos' }[fuente]} · ${{ todas: 'todas', nuevas: 'nunca hechas', falladas: 'erradas' }[filtro]} — cambiar`), form));
  let pool, aviso2 = null;
  if (fuente === 'algo') {
    if (!tiposAlgo.length) {
      aviso2 = h('p', { class: 'nota-info' }, `${u0 ? u0.corto : 'Este tema'} no tiene ejercicios generados por algoritmo (hay para Búsqueda, Emparrillado, Algoritmos Genéticos, Machine Learning y Lógica difusa). Te muestro preguntas reales y generadas del tema.`);
      fuente = 'ambas';
    } else {
      pool = Array.from({ length: cuantas }, () => generarPreguntaAlgoritmica(tiposAlgo[Math.floor(Math.random() * tiposAlgo.length)]));
    }
  }
  if (!pool) {
    pool = [];
    if (fuente !== 'ia') pool.push(...D.PARCIALES.preguntas);
    if (fuente !== 'real') pool.push(...D.GENERADAS.preguntas);
    if (unidades[0]) pool = pool.filter(p => unidades.includes(p.unidad));
    if (fam) pool = pool.filter(p => p.tipo === 'real' && PL.familia(p) === fam);
    if (filtro === 'nuevas') pool = pool.filter(p => !(P.estadoPregunta(p.id) || {}).intentos);
    if (filtro === 'falladas') pool = pool.filter(p => { const e = P.estadoPregunta(p.id); return e && e.aciertos < e.intentos; });
    pool = mezclar(pool).slice(0, cuantas);
  }
  if (aviso2) col.append(aviso2);
  sesion(col, pool, {
    vacio: filtro === 'nuevas' ? '¡Ya hiciste todas las de este filtro! Probá con "Las que erré" o con "Todas".' : filtro === 'falladas' ? 'No tenés preguntas erradas con este filtro. ¡Bien ahí!' : 'No hay preguntas con ese filtro. Probá con "Todas".',
    accionesFin: () => [h('button', { class: 'boton', type: 'button', onclick: () => navegar() }, 'Otra tanda'), h('a', { class: 'boton secundario', href: '#/repaso' }, 'Ir a Repaso')],
  });
}
function opt(v, t, sel) { return h('option', { value: v, selected: v === sel }, t); }
function selectUnidades(sel) {
  return h('select', { name: 'u' }, h('option', { value: '' }, 'Todos mezclados'), ...D.RUTA.unidades.map(u => opt(u.id, `${u.num}. ${u.corto}`, sel)));
}

// ---------------- Simulacro mezclado ----------------
function vistaExamen(main) {
  const dist = PL.distribucion(25);
  const ints = P.intentosExamen('simulacro');
  const col = h('div', { class: 'columna' },
    h('h1', {}, 'Simulacro de parcial'),
    h('p', { class: 'bajada' }, '25 preguntas reales, mezcladas con la misma distribución por tema que los parciales recientes. Las de Protocolos, Emparrillado y Búsqueda vienen en bloque con su anexo, como en el parcial. Corregís al final.'),
    h('div', { class: 'hoja distribucion' },
      h('h3', { style: 'margin-top:0' }, 'Cómo se reparte'),
      h('div', { class: 'chips' }, ...Object.entries(dist).sort((a, b) => b[1] - a[1]).map(([k, n]) => h('span', { class: 'chip' }, `${D.unidad(k).corto}: ${n}`))),
      h('div', { class: 'acciones', style: 'margin-bottom:0' }, h('button', { class: 'boton', type: 'button', onclick: empezar }, 'Empezar simulacro'),
        h('span', { class: 'chico suave' }, 'Cronómetro de referencia · índice de preguntas · marcá las dudosas para revisar'))),
    ints.length ? h('div', {}, h('h2', {}, 'Tus simulacros'), h('ul', { class: 'historial' }, ...ints.slice(-8).reverse().map(x => h('li', {}, h('b', {}, `${x.bien}/${x.total}`), ` · ${new Date(x.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}${x.minutos ? ` · ${x.minutos} min` : ''}`)))) : null);
  main.append(col);
  function empezar() {
    col.innerHTML = '';
    col.append(h('h1', {}, 'Simulacro de parcial'));
    examen(col, armarSimulacro(25), { eid: 'simulacro', accionesFin: () => [h('button', { class: 'boton secundario', type: 'button', onclick: () => navegar() }, 'Otro simulacro')] });
  }
}

// ---------------- Parciales reales ----------------
function vistaParciales(main) {
  const grupos = {};
  for (const e of D.PARCIALES.examenes) (grupos[e.periodo] = grupos[e.periodo] || []).push(e);
  const cont = h('div', { class: 'columna' },
    h('h1', {}, 'Parciales reales'),
    h('p', { class: 'bajada' }, `${D.PARCIALES.examenes.length} parciales (${D.PARCIALES.preguntas.length} preguntas) con la respuesta oficial. Rendilos como simulacro, con cronómetro y anexo al costado, y te queda registrado cuáles hiciste y con qué nota.`),
    h('p', {}, h('a', { class: 'boton secundario', href: '#/examen' }, 'O hacé un simulacro mezclado de 25')));
  for (const per of Object.keys(grupos).sort().reverse()) {
    const t = h('table', { class: 'tabla' }, h('thead', {}, h('tr', {}, h('th', {}, 'Parcial'), h('th', { class: 'ocultar-movil' }, 'Formato'), h('th', {}, 'Tu mejor nota'), h('th', { class: 'ocultar-movil' }, 'Rendido'), h('th', {}, ''))));
    const tb = h('tbody');
    for (const e of grupos[per]) {
      const ints = P.intentosExamen(e.id);
      const mejor = ints.length ? Math.max(...ints.map(x => x.bien)) : null;
      tb.append(h('tr', {},
        h('td', {}, h('a', { href: `#/parcial/${e.id}` }, `${e.dia} · ${e.tema}`)),
        h('td', { class: 'chico suave ocultar-movil' }, e.formato),
        h('td', {}, mejor === null ? '—' : `${mejor} / ${e.preguntas.length}`),
        h('td', { class: 'chico ocultar-movil' }, ints.length ? `${ints.length} ${ints.length === 1 ? 'vez' : 'veces'}, última ${new Date(ints[ints.length - 1].fecha).toLocaleDateString('es-AR')}` : h('span', { class: 'suave' }, 'nunca')),
        h('td', {}, h('a', { class: 'boton secundario chico-boton', href: `#/parcial/${e.id}` }, ints.length ? 'Otra vez' : 'Rendir'))));
    }
    t.append(tb);
    cont.append(h('h2', {}, tituloPeriodo(per)), h('div', { class: 'envoltura-tabla' }, t));
  }
  main.append(cont);
}
const tituloPeriodo = per => per === '2025' ? '2025' : per.replace(/(\d{4})-(\d)C/, '$1 · $2º cuatrimestre');

function vistaParcial(main, eid, q) {
  const e = D.examen(eid);
  if (!e) { main.append(h('div', { class: 'vacio' }, 'No existe ese parcial.')); return; }
  const prm = parametros(q);
  const modo = prm.modo || null;
  const preguntas = e.preguntas.map(id => D.porId[id]);
  const cont = h('div', { class: 'columna' },
    h('p', { class: 'miga chico suave' }, h('a', { href: '#/parciales' }, 'Parciales'), ' / ', e.titulo),
    h('h1', {}, e.titulo),
    h('p', { class: 'suave chico' }, `Archivo original: ${e.archivo_original}`));
  main.append(cont);
  if (!modo) {
    const porU = {};
    for (const p of preguntas) porU[p.unidad] = (porU[p.unidad] || 0) + 1;
    cont.append(h('p', { class: 'bajada' }, `${preguntas.length} preguntas de opción múltiple. Elegí cómo rendirlo:`),
      h('div', { class: 'chips' }, ...Object.entries(porU).sort((a, b) => b[1] - a[1]).map(([k, n]) => h('span', { class: 'chip' }, `${D.unidad(k).corto}: ${n}`))),
      h('div', { class: 'opciones-modo' },
        h('a', { class: 'tarjeta-opcion', href: `#/parcial/${eid}?modo=simulacro` }, h('b', {}, 'Simulacro'), h('span', {}, 'Como el día del parcial: respondés todo y corregís al final. Con cronómetro e índice.')),
        h('a', { class: 'tarjeta-opcion', href: `#/parcial/${eid}?modo=guiado` }, h('b', {}, 'Guiado'), h('span', {}, 'Corrección y explicación inmediata en cada pregunta. Para aprender.'))),
      historial(eid));
    return;
  }
  examen(cont, preguntas, { eid, modo: modo === 'guiado' ? 'guiado' : 'simulacro', accionesFin: () => [h('a', { class: 'boton secundario', href: '#/parciales' }, 'Volver a los parciales')] });
}
function historial(eid) {
  const ints = P.intentosExamen(eid);
  if (!ints.length) return h('p', { class: 'suave' }, 'Todavía no lo rendiste.');
  return h('div', {}, h('h2', {}, 'Tus intentos'), h('ul', { class: 'historial' }, ...ints.map(x => h('li', {}, h('b', {}, `${x.bien}/${x.total}`), ` · ${new Date(x.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} · ${x.modo === 'guiado' ? 'guiado' : 'simulacro'}${x.minutos ? `, ${x.minutos} min` : ''}`))));
}

// ---------------- Repaso ----------------
function vistaRepaso(main) {
  const ids = P.paraRepasar();
  const pool = ids.map(id => D.porId[id]).filter(Boolean);
  const cont = h('div', { class: 'columna texto' }, h('h1', {}, 'Repaso'),
    h('p', { class: 'bajada' }, 'Acá vuelven las preguntas que erraste. Cada vez que la acertás, tarda más en volver (1, 3, 7 y 16 días). Si la errás, vuelve a empezar. Es la forma más eficiente de fijar lo que te cuesta.'));
  main.append(cont);
  if (pool.length > 30) cont.append(h('p', { class: 'chico suave' }, `Tenés ${pool.length} pendientes: te muestro las 30 más urgentes.`));
  sesion(cont, pool.slice(0, 30), {
    vacio: 'No tenés nada pendiente para hoy. Cuando erres preguntas en la práctica o en un parcial, aparecen acá en el momento justo para repasarlas.',
    origen: 'repaso',
    accionesFin: () => [h('button', { class: 'boton', type: 'button', onclick: () => navegar() }, 'Seguir repasando'), h('a', { class: 'boton secundario', href: '#/' }, 'Volver al inicio')],
  });
}

// ---------------- Ajustes ----------------
function vistaAjustes(main) {
  const inp = h('input', { type: 'file', accept: 'application/json', hidden: true });
  inp.addEventListener('change', async () => {
    try { const ok = await P.importar(inp.files[0]); aviso(ok ? 'Progreso importado y guardado.' : 'Importado, pero no se pudo guardar todavía.', ok ? 'ok' : 'error'); navegar(); } catch (e) { aviso(e.message, 'error', 5000); }
  });
  const tema = P.get().ajustes.tema || 'auto';
  const sel = h('select', {}, opt('auto', 'Según el sistema', tema), opt('claro', 'Claro', tema), opt('oscuro', 'Oscuro', tema));
  sel.addEventListener('change', () => { P.get().ajustes.tema = sel.value; aplicarTema(); P.guardar(); });
  const u = P.usuarioActual();
  const modo = P.modoEstudio();
  const servidor = P.modoGuardado() === 'servidor';
  main.append(h('div', { class: 'columna texto' }, h('h1', {}, 'Ajustes'),
    h('section', { class: 'hoja ajuste' },
      h('h2', {}, 'Quién está estudiando'),
      h('p', {}, `Estás como `, h('b', {}, u.nombre), '. Cada persona tiene su progreso aparte.'),
      h('div', { class: 'acciones' }, h('a', { class: 'boton secundario', href: '#/bienvenida?cambiar=1' }, 'Cambiar de usuario o crear uno nuevo'))),
    h('section', { class: 'hoja ajuste' },
      h('h2', {}, 'Modo de estudio'),
      h('p', {}, modo === 'expres' ? 'Estás en modo exprés (jugado de tiempo).' : 'Estás en modo completo (con tiempo).', ' El progreso es uno solo para los dos modos.'),
      h('div', { class: 'acciones' }, h('button', { class: 'boton secundario', type: 'button', onclick: () => { P.setModoEstudio(modo === 'expres' ? 'completo' : 'expres'); aviso(`Listo: modo ${modo === 'expres' ? 'completo' : 'exprés'}.`); navegar(); } }, modo === 'expres' ? 'Pasar a modo completo' : 'Pasar a modo exprés'))),
    h('section', { class: 'hoja ajuste' },
      h('h2', {}, 'Tu progreso'),
      h('p', {}, servidor
        ? `Se guarda solo cada vez que respondés algo, en el archivo progreso/${u.id}.json de la carpeta del sistema (más una copia por día en backups/). Lo que figura como guardado ya está escrito en el disco: podés cerrar la pestaña o la ventana negra cuando quieras. Ese archivo no se sube a GitHub.`
        : 'Abriste la app sin el servidor, así que el progreso se guarda en este navegador. Para guardarlo en un archivo, abrí la app con iniciar.bat.'),
      h('div', { class: 'acciones' },
        h('button', { class: 'boton', type: 'button', onclick: guardarConAviso }, 'Guardar progreso ahora'),
        h('button', { class: 'boton secundario', type: 'button', onclick: () => P.exportar() }, 'Descargar copia'),
        h('button', { class: 'boton secundario', type: 'button', onclick: () => inp.click() }, 'Importar progreso'), inp)),
    servidor ? h('section', { class: 'hoja ajuste' },
      h('h2', {}, 'Cerrar la app'),
      h('p', {}, 'Guarda todo y apaga el servidor (la ventana negra se cierra sola). Es opcional: cerrar la ventana con la X también está bien.'),
      h('button', { class: 'boton secundario', type: 'button', onclick: cerrarApp }, 'Cerrar la app')) : null,
    h('section', { class: 'hoja ajuste' }, h('h2', {}, 'Apariencia'), h('label', { class: 'campo' }, 'Tema', sel)),
    h('section', { class: 'hoja ajuste peligro' },
      h('h2', {}, 'Empezar de cero'),
      h('p', { class: 'suave' }, `Borra todas las respuestas, notas de parciales y unidades aprobadas de ${u.nombre}. Antes descargá una copia por las dudas.`),
      h('button', { class: 'boton secundario', type: 'button', onclick: () => { if (confirm(`¿Borrar todo el progreso de ${u.nombre}? No se puede deshacer.`)) { P.reiniciar(); navegar(); } } }, 'Borrar mi progreso'))));
}
function aplicarTema() {
  const t = ((P.get() || {}).ajustes || {}).tema || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-tema'); else document.documentElement.setAttribute('data-tema', t);
}

// ---------------- Arranque ----------------
async function iniciar() {
  try {
    await D.cargarTodo();
    await P.cargar();
  } catch (e) {
    $main().innerHTML = `<p class="vacio">No pude cargar el contenido (${e.message}). Abrí la app con <b>iniciar.bat</b> (o <code>python servidor.py</code>) en vez de abrir el archivo directamente.</p>`;
    return;
  }
  iniciarMarco();
  P.alCambiar(aplicarTema);
  aplicarTema();
  window.addEventListener('hashchange', navegar);
  navegar();
}
iniciar();
export { navegar, refrescar };
