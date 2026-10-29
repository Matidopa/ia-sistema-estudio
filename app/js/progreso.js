// Progreso del estudiante.
// Se guarda en progreso.json (al lado de servidor.py) a través de /api/progreso.
// Si la app se abre sin el servidor, usa el almacenamiento del navegador como respaldo.

const CLAVE_LOCAL = 'ia-estudio-progreso';
const DIA = 24 * 3600 * 1000;
// Repaso espaciado con 5 cajas (sistema Leitner): días hasta volver a mostrar la pregunta
export const INTERVALOS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };

let datos = null;
let modo = 'servidor'; // 'servidor' | 'navegador'
let timer = null;
const oyentes = new Set();

function vacio() {
  return { version: 1, creado: new Date().toISOString(), preguntas: {}, examenes: {}, unidades: {}, catedra: {}, ajustes: {} };
}

export async function cargar() {
  try {
    const r = await fetch('/api/progreso', { cache: 'no-store' });
    if (!r.ok) throw new Error('sin servidor');
    datos = await r.json();
    modo = 'servidor';
  } catch {
    modo = 'navegador';
    try { datos = JSON.parse(localStorage.getItem(CLAVE_LOCAL)) || vacio(); } catch { datos = vacio(); }
  }
  for (const k of ['preguntas', 'examenes', 'unidades', 'catedra', 'ajustes']) datos[k] = datos[k] || {};
  return datos;
}

export const modoGuardado = () => modo;
export const get = () => datos;
export function alCambiar(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

let estadoGuardado = 'guardado';
export const estado = () => estadoGuardado;

export function guardar() {
  datos.actualizado = new Date().toISOString();
  estadoGuardado = 'guardando';
  oyentes.forEach(f => f());
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      if (modo === 'servidor') {
        const r = await fetch('/api/progreso', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
        if (!r.ok) throw new Error();
      } else {
        localStorage.setItem(CLAVE_LOCAL, JSON.stringify(datos));
      }
      estadoGuardado = 'guardado';
    } catch {
      estadoGuardado = 'error';
    }
    oyentes.forEach(f => f());
  }, 400);
}

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
  guardar();
  return p;
}

export const estadoPregunta = qid => datos.preguntas[qid] || null;

export function paraRepasar(ahora = Date.now()) {
  return Object.entries(datos.preguntas)
    // vencidas, sin contar las que se acertaron siempre (ya están dominadas)
    .filter(([, p]) => p.intentos > 0 && (p.caja || 1) < 5 && p.proxima <= ahora && p.aciertos < p.intentos)
    .sort((a, b) => (a[1].caja - b[1].caja) || (a[1].proxima - b[1].proxima))
    .map(([id]) => id);
}

// ---------- Exámenes (simulacros de parciales reales) ----------
export function registrarExamen(eid, resultado) {
  (datos.examenes[eid] = datos.examenes[eid] || []).push({ fecha: new Date().toISOString(), ...resultado });
  guardar();
}
export const intentosExamen = eid => datos.examenes[eid] || [];

// ---------- Unidades de la ruta ----------
export function marcarUnidad(uid, cambios) {
  datos.unidades[uid] = { ...(datos.unidades[uid] || {}), ...cambios, fecha: new Date().toISOString() };
  guardar();
}
export const estadoUnidad = uid => datos.unidades[uid] || {};

// ---------- Ejercicios de la cátedra ----------
export function marcarCatedra(id, estado) {
  datos.catedra[id] = { estado, fecha: new Date().toISOString() };
  guardar();
}
export const estadoCatedra = id => (datos.catedra[id] || {}).estado || null;

// ---------- Exportar / importar ----------
export function exportar() {
  const blob = new Blob([JSON.stringify(datos, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `progreso-ia-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
export async function importar(file) {
  const txt = await file.text();
  const nuevo = JSON.parse(txt);
  if (!nuevo || typeof nuevo !== 'object' || !nuevo.preguntas) throw new Error('El archivo no es un progreso válido.');
  datos = nuevo;
  guardar();
}
export function reiniciar() { datos = vacio(); guardar(); }
