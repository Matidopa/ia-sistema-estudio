// Progreso del estudiante, por persona.
// Con el servidor: progreso/<id>.json (vía /api/progreso?u=<id>). Cada guardado queda escrito en
// disco antes de que el servidor responda OK, así que lo que la página muestra como guardado está
// a salvo aunque se cierre la ventana o se apague la compu.
// Sin servidor (app abierta como archivo): almacenamiento del navegador como respaldo.

const CLAVE_USUARIO = 'ia-estudio-usuario';
const CLAVE_LOCAL = 'ia-estudio-progreso'; // + ':' + id en modo navegador
const DIA = 24 * 3600 * 1000;
const RETRASO_AUTOGUARDADO = 700; // ms
// Repaso espaciado con 5 cajas (sistema Leitner): días hasta volver a mostrar la pregunta
export const INTERVALOS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };

let datos = null;
let usuario = null; // { id, nombre }
let modo = 'servidor'; // 'servidor' | 'navegador'
let timer = null;
let cambios = 0, confirmados = 0; // contador de cambios hechos y de cambios ya escritos en disco
let enVuelo = null; // promesa del guardado en curso
let st = { tipo: 'guardado', hora: null, error: null };
const oyentes = new Set();

const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* nada */ } },
};

export function vacio() {
  return { version: 2, creado: new Date().toISOString(), preguntas: {}, examenes: {}, unidades: {}, catedra: {}, ajustes: {} };
}

// Completa campos que faltan en progresos viejos (versión 1) sin perder nada.
export function migrar(d) {
  d = d && typeof d === 'object' ? d : vacio();
  for (const k of ['preguntas', 'examenes', 'unidades', 'catedra', 'ajustes', 'dias', 'notas']) d[k] = d[k] || {};
  d.expres = d.expres || { pasos: {} };
  d.expres.pasos = d.expres.pasos || {};
  if (d.modo !== 'completo' && d.modo !== 'expres') d.modo = null;
  d.version = 2;
  return d;
}

function avisar() { oyentes.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
function setEstado(tipo, extra = {}) { st = { ...st, tipo, ...extra }; avisar(); }

// ---------- Usuarios ----------
async function api(ruta, opciones) {
  const r = await fetch(ruta, { cache: 'no-store', ...opciones });
  let cuerpo = null;
  try { cuerpo = await r.json(); } catch { /* sin cuerpo */ }
  if (!r.ok) throw new Error((cuerpo && cuerpo.error) || `Error ${r.status}`);
  return cuerpo;
}

export async function listarUsuarios() {
  if (modo === 'navegador') {
    try { return { usuarios: JSON.parse(ls.get('ia-estudio-usuarios')) || [], legado: !!ls.get(CLAVE_LOCAL) }; } catch { return { usuarios: [], legado: false }; }
  }
  return api('/api/usuarios');
}

// Detecta si hay servidor y entra con el último usuario usado en este navegador (si existe).
// Devuelve true si quedó un usuario cargado, false si hay que mostrar la bienvenida.
export async function cargar() {
  try {
    await api('/api/estado');
    modo = 'servidor';
  } catch {
    modo = 'navegador';
  }
  const { usuarios } = await listarUsuarios();
  const ultimo = ls.get(CLAVE_USUARIO);
  const u = usuarios.find(x => x.id === ultimo);
  if (u) { await entrar(u.id); return true; }
  return false;
}

export async function crearUsuario(nombre) {
  nombre = String(nombre || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  if (!nombre) throw new Error('Escribí tu nombre.');
  if (modo === 'navegador') {
    const lista = (await listarUsuarios()).usuarios;
    let u = lista.find(x => x.nombre.toLowerCase() === nombre.toLowerCase());
    if (!u) {
      const base = nombre.normalize('NFKD').replace(/[^\w\s-]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'usuario';
      let id = base, i = 2;
      while (lista.some(x => x.id === id)) id = `${base}-${i++}`;
      u = { id, nombre };
      let d = vacio();
      const viejo = ls.get(CLAVE_LOCAL);
      if (viejo && !lista.length) { try { d = JSON.parse(viejo); u.migrado = true; } catch { /* nada */ } }
      d = migrar(d); d.usuario = { id, nombre };
      ls.set(CLAVE_LOCAL + ':' + id, JSON.stringify(d));
      lista.push({ id, nombre });
      ls.set('ia-estudio-usuarios', JSON.stringify(lista));
    }
    return u;
  }
  const r = await api('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
  return r.usuario;
}

export async function entrar(id) {
  if (datos && pendiente()) await guardarAhora();
  let d;
  if (modo === 'servidor') d = await api('/api/progreso?u=' + encodeURIComponent(id));
  else { try { d = JSON.parse(ls.get(CLAVE_LOCAL + ':' + id)); } catch { d = null; } }
  datos = migrar(d);
  usuario = { id, nombre: (datos.usuario && datos.usuario.nombre) || id };
  datos.usuario = { ...usuario };
  ls.set(CLAVE_USUARIO, id);
  cambios = confirmados = 0;
  st = { tipo: 'guardado', hora: datos.actualizado ? new Date(datos.actualizado) : null, error: null };
  avisar();
  return datos;
}

export async function salir() {
  if (datos && pendiente()) await guardarAhora();
  ls.del(CLAVE_USUARIO);
  datos = null; usuario = null;
}

export const usuarioActual = () => usuario;
export const modoGuardado = () => modo;
export const get = () => datos;
export function alCambiar(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }
export const estado = () => st;
export const pendiente = () => cambios !== confirmados || !!enVuelo;

// ---------- Guardado ----------
// Cada cambio llama a guardar(): marca "cambios sin guardar" y programa el guardado automático.
export function guardar() {
  if (!datos) return;
  datos.actualizado = new Date().toISOString();
  cambios++;
  if (st.tipo !== 'guardando') setEstado('sucio');
  clearTimeout(timer);
  timer = setTimeout(() => { guardarAhora(); }, RETRASO_AUTOGUARDADO);
}

// Guarda ya. Resuelve true solo cuando el servidor confirmó que escribió el archivo.
// forzar: escribe aunque no haya cambios (el botón "Guardar progreso" siempre confirma con el disco).
export async function guardarAhora(forzar = false) {
  clearTimeout(timer);
  if (!datos) return false;
  while (enVuelo) await enVuelo.catch(() => {});
  if (!forzar && !pendiente()) return st.tipo !== 'error';
  const hasta = cambios;
  const cuerpo = JSON.stringify(datos);
  setEstado('guardando');
  enVuelo = (async () => {
    if (modo === 'servidor') {
      await api('/api/progreso?u=' + encodeURIComponent(usuario.id), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: cuerpo });
    } else if (!ls.set(CLAVE_LOCAL + ':' + usuario.id, cuerpo)) {
      throw new Error('El navegador no deja guardar.');
    }
  })();
  try {
    await enVuelo;
    confirmados = hasta;
    enVuelo = null;
    if (cambios !== confirmados) { setEstado('sucio'); timer = setTimeout(() => guardarAhora(), RETRASO_AUTOGUARDADO); }
    else setEstado('guardado', { hora: new Date(), error: null });
    return true;
  } catch (e) {
    enVuelo = null;
    setEstado('error', { error: e.message || 'No se pudo guardar.' });
    clearTimeout(timer);
    timer = setTimeout(() => guardarAhora(), 5000); // reintenta solo
    return false;
  }
}

// Al cerrar la pestaña con algo pendiente: lo manda igual (sendBeacon o fetch keepalive).
export function mandarAlCerrar() {
  if (!datos || !pendiente()) return true;
  if (modo === 'navegador') return ls.set(CLAVE_LOCAL + ':' + usuario.id, JSON.stringify(datos));
  const url = '/api/progreso?u=' + encodeURIComponent(usuario.id);
  const cuerpo = JSON.stringify(datos);
  let ok = false;
  try { ok = navigator.sendBeacon && navigator.sendBeacon(url, new Blob([cuerpo], { type: 'text/plain' })); } catch { ok = false; }
  if (!ok) {
    try { fetch(url, { method: 'POST', body: cuerpo, keepalive: true, headers: { 'Content-Type': 'text/plain' } }); ok = true; } catch { ok = false; }
  }
  return ok;
}

export async function cerrarApp() {
  const ok = await guardarAhora();
  if (!ok) throw new Error('No se pudo guardar antes de cerrar.');
  if (modo === 'servidor') await api('/api/cerrar', { method: 'POST' });
  return true;
}

// ---------- Días de estudio (racha) ----------
export const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function sumarDia() { const k = hoyISO(); datos.dias[k] = (datos.dias[k] || 0) + 1; }
export function racha() {
  const dias = datos.dias || {};
  let n = 0; const d = new Date();
  if (!dias[hoyISO()]) d.setDate(d.getDate() - 1); // si hoy todavía no estudió, la racha sigue viva desde ayer
  for (;;) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dias[k]) break;
    n++; d.setDate(d.getDate() - 1);
  }
  return n;
}
export const respuestasHoy = () => (datos.dias || {})[hoyISO()] || 0;

// ---------- Preguntas ----------
export function registrarRespuesta(qid, elegida, correcta, origen = 'practica') {
  const p = datos.preguntas[qid] || { intentos: 0, aciertos: 0, caja: 1 };
  const bien = elegida === correcta;
  p.intentos++;
  if (bien) p.aciertos++;
  p.ultima = Date.now();
  p.ultimaBien = bien;
  p.ultimaRespuesta = elegida;
  p.origen = origen;
  // Leitner: acierto sube de caja, error vuelve a la 1
  p.caja = bien ? Math.min(5, (p.caja || 1) + 1) : 1;
  p.proxima = Date.now() + INTERVALOS[p.caja] * DIA;
  datos.preguntas[qid] = p;
  sumarDia();
  guardar();
  return p;
}

// Ejercicios generados por algoritmo: no se guardan uno por uno (son infinitos), solo el conteo por unidad.
export function registrarAlgo(uid, bien) {
  datos.algo = datos.algo || {};
  const a = datos.algo[uid] = datos.algo[uid] || { intentos: 0, aciertos: 0 };
  a.intentos++; if (bien) a.aciertos++;
  sumarDia();
  guardar();
}

export const estadoPregunta = qid => datos.preguntas[qid] || null;

export function paraRepasar(ahora = Date.now()) {
  return Object.entries(datos.preguntas)
    // vencidas, sin contar las que se acertaron siempre (ya están dominadas)
    .filter(([, p]) => p.intentos > 0 && (p.caja || 1) < 5 && p.proxima <= ahora && p.aciertos < p.intentos)
    .sort((a, b) => (a[1].caja - b[1].caja) || (a[1].proxima - b[1].proxima))
    .map(([id]) => id);
}

// ---------- Exámenes (simulacros) ----------
export function registrarExamen(eid, resultado) {
  (datos.examenes[eid] = datos.examenes[eid] || []).push({ fecha: new Date().toISOString(), ...resultado });
  guardar();
}
export const intentosExamen = eid => datos.examenes[eid] || [];

// ---------- Unidades de la ruta ----------
export function marcarUnidad(uid, cambiosU) {
  datos.unidades[uid] = { ...(datos.unidades[uid] || {}), ...cambiosU, fecha: new Date().toISOString() };
  guardar();
}
export const estadoUnidad = uid => datos.unidades[uid] || {};

// ---------- Modo de estudio y plan exprés ----------
export const modoEstudio = () => datos.modo;
export function setModoEstudio(m) { datos.modo = m; guardar(); }
export const pasoExpres = id => datos.expres.pasos[id] || null;
export function marcarPasoExpres(id, info = {}) {
  datos.expres.pasos[id] = { ...(datos.expres.pasos[id] || {}), ...info, hecho: true, fecha: new Date().toISOString() };
  guardar();
}
export function desmarcarPasoExpres(id) { delete datos.expres.pasos[id]; guardar(); }

// ---------- Ejercicios de la cátedra ----------
export function marcarCatedra(id, estadoC) {
  datos.catedra[id] = { estado: estadoC, fecha: new Date().toISOString() };
  guardar();
}
export const estadoCatedra = id => (datos.catedra[id] || {}).estado || null;

// ---------- Notas (por ejemplo, borradores de protocolos) ----------
export const nota = clave => (datos.notas || {})[clave] || '';
export function setNota(clave, texto) { datos.notas[clave] = texto; guardar(); }

// ---------- Exportar / importar ----------
export function exportar() {
  const blob = new Blob([JSON.stringify(datos, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `progreso-ia-${usuario ? usuario.id + '-' : ''}${hoyISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export async function importar(file) {
  const txt = await file.text();
  const nuevo = JSON.parse(txt);
  if (!nuevo || typeof nuevo !== 'object' || !nuevo.preguntas) throw new Error('El archivo no es un progreso válido.');
  datos = migrar(nuevo);
  datos.usuario = { ...usuario };
  guardar();
  return guardarAhora();
}
export function reiniciar() { datos = migrar(vacio()); datos.usuario = { ...usuario }; guardar(); }
