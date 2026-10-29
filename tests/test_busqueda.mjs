// Valida el motor de búsqueda contra TODAS las preguntas de búsqueda de los parciales reales
// que tienen el árbol transcripto. Uso: node tests/test_busqueda.mjs [-v]
import fs from 'node:fs';
import * as M from '../app/js/motores/busqueda.js';
import { ARBOLES, arbolDeExamen } from '../contenido/arboles_parciales.js';
import { metodoDeTexto, evaluarPregunta } from '../app/js/motores/busqueda_preguntas.js';

const verbose = process.argv.includes('-v');
const data = JSON.parse(fs.readFileSync(new URL('../contenido/parciales.json', import.meta.url)));
// Preguntas donde la propia cátedra marcó una respuesta por error de tipeo
const CONOCIDAS = { '2025-miercoles-t2-o': 'La cátedra aceptó "T, K, X, D" por error de tipeo; la convención de "generados" en Máxima Pendiente es ambigua.' };
let ok = 0, mal = 0, nose = 0;
for (const p of data.preguntas) {
  if (p.unidad !== 'u5-busqueda') continue;
  const k = arbolDeExamen(p.examen);
  if (CONOCIDAS[p.id]) { if (verbose) console.log('-- excluida:', p.id, CONOCIDAS[p.id]); continue; }
  if (!k) continue;
  const r = evaluarPregunta(ARBOLES[k], p.enunciado, p.opciones);
  if (r === null) { nose++; if (verbose) console.log('?? no entiendo:', p.id, p.enunciado.replace(/\n/g, ' ')); continue; }
  const correctas = r.map((v, i) => v ? i + 1 : null).filter(Boolean);
  const bien = correctas.length === 1 && correctas[0] === p.correcta;
  if (bien) ok++; else {
    mal++;
    console.log('XX', p.id, '| motor dice', JSON.stringify(correctas), '| cátedra', p.correcta, '|', p.enunciado.replace(/\n/g, ' '));
    if (verbose) p.opciones.forEach((o, i) => console.log('    ', i + 1, o));
  }
}
console.log(`\nBúsqueda: ${ok} OK, ${mal} distintas, ${nose} sin interpretar`);
process.exit(mal ? 1 : 0);
