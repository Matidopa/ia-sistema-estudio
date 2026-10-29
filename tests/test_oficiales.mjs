// Compara los motores con las RESOLUCIONES OFICIALES de la cátedra (guías y clases).
import * as M from '../app/js/motores/busqueda.js';
import * as E from '../app/js/motores/emparrillado.js';
let ok = 0, mal = 0;
function check(nombre, real, esperado) {
  const a = JSON.stringify(real), b = JSON.stringify(esperado);
  if (a === b) ok++; else { mal++; console.log('XX', nombre, '\n   motor:  ', a, '\n   oficial:', b); }
}
const s = h => ({ h, sol: true }), n = h => ({ h });
const tabla = r => r.iteraciones.map(i => [i.actual, i.esSolucion, i.abiertos.map(a => `${a.n}(${a.v})`).join(', '), i.cerrados.join(', ')]);

// Guía de Métodos de Búsqueda, Ejercicio Resuelto 1: Primero el Mejor
const r1 = { raiz: 'A', mejor: 'menor', nodos: { A: n(14), B: n(5), C: n(3), D: n(7), E: n(9), F: n(6), G: n(8), H: n(5), I: n(1), J: n(2), K: s(0), L: n(2), N: n(3), M: s(0) },
  hijos: { A: [['B'], ['C']], B: [['D'], ['E']], C: [['F'], ['G']], D: [['H'], ['I']], F: [['I'], ['J']], G: [['J'], ['K']], I: [['K']], H: [['L']], L: [['N'], ['M']] } };
check('Guía búsqueda R1 (Primero el Mejor)', tabla(M.primeroMejor(r1)), [
  ['A', false, 'C(3), B(5)', 'A'], ['C', false, 'B(5), F(6), G(8)', 'A, C'], ['B', false, 'F(6), D(7), G(8), E(9)', 'A, C, B'],
  ['F', false, 'I(1), J(2), D(7), G(8), E(9)', 'A, C, B, F'], ['I', false, 'K(0), J(2), D(7), G(8), E(9)', 'A, C, B, F, I'], ['K', true, 'J(2), D(7), G(8), E(9)', 'A, C, B, F, I, K']]);

// Guía de Métodos de Búsqueda, Ejercicio Resuelto 2: A* (costo 1), camino que sigue por G
const r2 = { raiz: 'A', mejor: 'menor', nodos: { A: n(10), B: n(4), C: n(3), D: n(7), E: n(8), F: n(6), G: n(7), H: n(4), I: n(8), N: n(3), K: s(0), L: n(1), M: s(0) },
  hijos: { A: [['B', 1], ['C', 1]], B: [['D', 1], ['E', 1]], C: [['F', 1], ['G', 1]], D: [['H', 1], ['I', 1]], F: [['I', 1], ['N', 1]], G: [['N', 1], ['K', 1]], H: [['L', 1]], L: [['M', 1]] } };
const a2 = M.aEstrella(r2);
check('Guía búsqueda R2 (A*) cerrados', a2.cerrados, ['A', 'C', 'B', 'F', 'N', 'G', 'K']);
check('Guía búsqueda R2 (A*) iteración 4', a2.iteraciones[3].abiertos.map(x => `${x.n}(${x.v})`).sort(), ['N(6)', 'G(9)', 'D(9)', 'E(10)', 'I(11)'].sort());

// Clase 08/04/2026, Ejercicio 5: A* (costo 1)
const c5 = { raiz: 'A', mejor: 'menor', nodos: { A: n(12), B: n(7), C: n(6), D: n(3), E: n(4), F: n(9), G: n(10), H: n(8), I: n(1), J: s(0), K: n(2), L: s(0) },
  hijos: { A: [['B', 1], ['C', 1]], B: [['D', 1], ['E', 1]], C: [['F', 1], ['G', 1], ['H', 1]], E: [['I', 1], ['J', 1]], G: [['J', 1]], H: [['K', 1]], I: [['L', 1]], K: [['L', 1]] } };
check('Clase Ej. 5 (A*)', tabla(M.aEstrella(c5)), [
  ['A', false, 'C(7), B(8)', 'A'], ['C', false, 'B(8), H(10), F(11), G(12)', 'A, C'], ['B', false, 'D(5), E(6), H(10), F(11), G(12)', 'A, C, B'],
  ['D', false, 'E(6), H(10), F(11), G(12)', 'A, C, B, D'], ['E', false, 'J(3), I(4), H(10), F(11), G(12)', 'A, C, B, D, E'], ['J', true, 'I(4), H(10), F(11), G(12)', 'A, C, B, D, E, J']]);

// Guía de Emparrillado, Resuelto 1 (Harinas)
const h = E.analizar({ max: 4, grid: [[3, 3, 4, 2], [3, 4, 4, 3], [4, 3, 3, 2], [1, 3, 4, 2]] });
check('Harinas dE', h.dE, { 'E1-E2': 4, 'E1-E3': 6, 'E1-E4': 4, 'E2-E3': 2, 'E2-E4': 4, 'E3-E4': 6 });
check('Harinas d1', Object.values(h.d1), [2, 2, 2, 4, 4, 4]);
check('Harinas d2', Object.values(h.d2), [6, 6, 6, 6, 6, 4]);
check('Harinas grupos E', h.gruposE, [['E2', 'E3'], ['E1'], ['E4']]);
check('Harinas grupos C', h.gruposC, [['C1', 'C2', 'C3', 'C4']]);
check('Harinas C1-C2 recíproca', E.tipoRelacion([['A', 'X'], ['B', 'Y'], ['X', 'A'], ['Y', 'B']]), 'recíproca');
check('Harinas C1-C3 ortogonal', E.tipoRelacion([['A', 'X'], ['B', 'X']]), 'ortogonal');
check('Harinas C2-C3 no tipificada', E.tipoRelacion([['X', 'A'], ['B', 'Y']]), 'no tipificada');
check('Harinas C3-C4 ambigua', E.tipoRelacion([['X', 'A'], ['X', 'B'], ['Y', 'B']]), 'ambigua');

// Guía de Emparrillado, Resuelto 2 (Antivirus)
const av = E.analizar({ max: 4, grid: [[4, 4, 2, 1], [3, 4, 1, 3], [3, 2, 1, 3], [4, 4, 4, 3], [4, 3, 2, 1]] });
check('Antivirus grupos E', av.gruposE, [['E1', 'E2'], ['E3'], ['E4']]);
check('Antivirus grupos C', av.gruposC, [['C1', 'C5'], ['C2', 'C3'], ['C4']]);
check('Antivirus C1-C5 paralela', E.tipoRelacion([['A', 'X'], ['B', 'Y']]), 'paralela');
check('Antivirus C2-C3 ortogonal', E.tipoRelacion([['A', 'X']]), 'ortogonal');

// Clase 06/05/2026, Emparrillado Ejercicio 1 (Hormigas)
const ho = E.analizar({ max: 4, grid: [[1, 4, 1, 2], [4, 1, 3, 1], [2, 3, 2, 4], [3, 2, 2, 3]] });
check('Hormigas dE E1-E2', ho.dE['E1-E2'], 8);
check('Hormigas d2 C1-C2', ho.d2['C1-C2'], 3);
check('Hormigas grupos E', ho.gruposE, [['E1', 'E3'], ['E2', 'E4']]);
check('Hormigas grupos C', ho.gruposC, [['C2', 'C3'], ['C1'], ['C4']]);

console.log(`Resoluciones oficiales: ${ok} OK, ${mal} distintas`);
process.exit(mal ? 1 : 0);
