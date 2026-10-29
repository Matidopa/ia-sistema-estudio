// Valida el motor de emparrillado contra las preguntas de grupos y distancias de los parciales reales.
import fs from 'node:fs';
import { analizar, dist } from '../app/js/motores/emparrillado.js';
import { EMPARRILLADOS, emparrilladoDeExamen } from '../contenido/emparrillados_parciales.js';
const v = process.argv.includes('-v');
const data = JSON.parse(fs.readFileSync(new URL('../contenido/parciales.json', import.meta.url)));
const norm = g => g.map(x => x.slice().sort().join(',')).sort().join(' | ');
function gruposDeOpcion(o) {
  // "(E1, E4); (E2, E3)."  "(C1, C2, C3, C4), C5."  "E3"
  const s = o.replace(/\.$/, '');
  const partes = []; const re = /\(([^)]*)\)|\b([EC]\d)\b/g; let m;
  while ((m = re.exec(s))) partes.push(m[1] ? m[1].match(/[EC]\d/g) : [m[2]]);
  return partes;
}
let ok = 0, mal = 0, skip = 0;
for (const p of data.preguntas) {
  if (p.unidad !== 'u4-emparrillado') continue;
  const k = emparrilladoDeExamen(p.examen); if (!k) continue;
  const A = analizar(EMPARRILLADOS[k]);
  const e = p.enunciado.replace(/\s+/g, ' ');
  let res = null, m;
  if (/cantidad de grupos/.test(e)) {
    const g = /caracter/.test(e) ? A.gruposC : A.gruposE;
    res = p.opciones.map(o => +o.match(/\d+/)[0] === g.length);
  } else if (/grupos resultantes/.test(e)) {
    const g = /caracter/.test(e) ? A.gruposC : A.gruposE;
    res = p.opciones.map(o => norm(gruposDeOpcion(o)) === norm(g));
  } else if ((m = e.match(/\bd([12]) entre (C\d) y (C\d)/))) {
    const val = dist(m[1] === '1' ? A.d1 : A.d2, m[2], m[3]);
    res = p.opciones.map(o => +o.match(/-?\d+/)[0] === val);
  }
  if (!res) { skip++; continue; }
  const c = res.map((x, i) => x ? i + 1 : 0).filter(Boolean);
  if (c.length === 1 && c[0] === p.correcta) ok++;
  else { mal++; console.log('XX', p.id, 'motor', c, 'cátedra', p.correcta, '|', e, '\n   ', p.opciones.join(' || '), '\n    gruposC', JSON.stringify(A.gruposC), 'gruposE', JSON.stringify(A.gruposE)); }
}
console.log(`Emparrillado: ${ok} OK, ${mal} distintas, ${skip} de relaciones (dependen del texto)`);
process.exit(mal ? 1 : 0);
