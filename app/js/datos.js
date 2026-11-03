// Carga del contenido (todo local, desde /contenido)
const cache = {};
async function json(ruta) {
  if (!cache[ruta]) cache[ruta] = fetch('../contenido/' + ruta, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error('No se pudo cargar ' + ruta);
    return r.json();
  });
  return cache[ruta];
}
export async function texto(ruta) {
  const r = await fetch('../contenido/' + ruta, { cache: 'no-store' });
  if (!r.ok) throw new Error('No se pudo cargar ' + ruta);
  return r.text();
}

export let RUTA = null, PARCIALES = null, GENERADAS = null, CATEDRA = null, EXPLICACIONES = {};
export let TEORIA = { preguntas: [] }; // banco de práctica de teoría: solo preguntas inventadas
export let ESTILO = { preguntas: [] }; // teoría estilo parcial: inventadas imitando las teóricas 2024–2026
export const porId = {}; // índice de todas las preguntas (reales y generadas)

export async function cargarTodo() {
  [RUTA, PARCIALES, GENERADAS, CATEDRA] = await Promise.all([
    json('ruta.json'), json('parciales.json'), json('preguntas_generadas.json'), json('catedra.json'),
  ]);
  try { EXPLICACIONES = await json('explicaciones_reales.json'); } catch { EXPLICACIONES = {}; }
  try { TEORIA = await json('practica_teoria.json'); } catch { TEORIA = { preguntas: [] }; }
  try { ESTILO = await json('estilo_parcial.json'); } catch { ESTILO = { preguntas: [] }; }
  for (const p of PARCIALES.preguntas) { p.tipo = 'real'; porId[p.id] = p; }
  for (const p of GENERADAS.preguntas) { p.tipo = 'ia'; porId[p.id] = p; }
  for (const p of TEORIA.preguntas) { p.tipo = 'ia'; p.banco = 'teoria'; porId[p.id] = p; }
  for (const p of ESTILO.preguntas) { p.tipo = 'ia'; p.banco = 'estilo'; porId[p.id] = p; }
}

export const unidad = id => RUTA.unidades.find(u => u.id === id);
export const examen = id => PARCIALES.examenes.find(e => e.id === id);
export const realesDeUnidad = uid => PARCIALES.preguntas.filter(p => p.unidad === uid);
export const generadasDeUnidad = uid => GENERADAS.preguntas.filter(p => p.unidad === uid);
// Todo lo inventado para practicar teoría (nunca preguntas reales): el banco nuevo más las generadas por IA.
export const inventadasDeTeoria = () => [...TEORIA.preguntas, ...GENERADAS.preguntas];
export const estiloParcial = () => ESTILO.preguntas;
export function refCorta(p) {
  return p.tipo === 'real' ? p.ref : 'Generada por IA';
}
