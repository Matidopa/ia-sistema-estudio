// Anexo C (Emparrillado) de los parciales reales, transcripto a datos.
// Formato "parrilla": grid[c][e], escala [1, max].
// Formato "matrices": matrizE (distancias entre elementos) y matrizC.d1 (arriba de la diagonal), matrizC.d2 (abajo).

function matrices(E, C) {
  // E: filas triangulares superiores de la matriz de elementos (E1: [d12, d13, ...], E2: [d23, ...])
  // C: matriz completa 5x5 con null en la diagonal; arriba d1, abajo d2
  const matrizE = {};
  E.forEach((fila, i) => fila.forEach((v, k) => { matrizE[`E${i + 1}-E${i + 2 + k}`] = v; }));
  const d1 = {}, d2 = {};
  for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {
    d1[`C${i + 1}-C${j + 1}`] = C[i][j];
    d2[`C${i + 1}-C${j + 1}`] = C[j][i];
  }
  return { matrizE, matrizC: { d1, d2 } };
}
const _ = null;

export const EMPARRILLADOS = {
  '2022-1c-lunes': { max: 5, grid: [[5, 5, 3, 5], [4, 2, 3, 3], [4, 4, 2, 4], [4, 5, 2, 1], [4, 2, 2, 1]] },
  '2022-1c-miercoles': { max: 5, grid: [[5, 4, 3, 3], [5, 3, 2, 2], [3, 4, 3, 1], [4, 2, 2, 4], [4, 3, 4, 3]] },
  '2022-2c-lunes': { max: 5, grid: [[1, 1, 2, 3], [2, 4, 5, 1], [2, 3, 2, 4], [5, 2, 2, 3], [1, 1, 4, 5]] },
  '2022-2c-miercoles': { max: 5, grid: [[4, 2, 3, 5], [4, 3, 2, 2], [3, 5, 1, 2], [4, 5, 4, 1], [5, 1, 3, 2]] },
  '2023-1c-lunes': { max: 5, grid: [[4, 2, 4, 5, 5], [4, 2, 1, 1, 5], [1, 3, 4, 5, 1], [3, 2, 4, 3, 5], [3, 3, 3, 3, 4]] },
  '2023-1c-miercoles': { max: 5, grid: [[1, 5, 1, 1], [3, 3, 4, 1], [5, 5, 4, 3], [4, 5, 3, 1]] },
  '2023-2c-lunes': { max: 5, ...matrices(
    [[5, 3, 6, 8], [8, 7, 6], [4, 4], [3]],
    [[_, 3, 2, 5, 4], [2, _, 4, 5, 7], [3, 5, _, 8, 9], [4, 6, 5, _, 8], [9, 8, 7, 3, _]]) },
  '2023-2c-miercoles': { max: 5, ...matrices(
    [[4, 3, 5, 4], [5, 6, 5], [3, 6], [7]],
    [[_, 3, 5, 7, 6], [4, _, 3, 4, 5], [3, 3, _, 5, 7], [5, 6, 10, _, 9], [6, 8, 5, 3, _]]) },
  '2024-1c-lunes': { max: 5, ...matrices(
    [[9, 5, 11], [10, 2], [12]],
    [[_, 12, 5, 10, 12], [2, _, 11, 2, 7], [11, 5, _, 9, 8], [2, 10, 6, _, 7], [7, 7, 4, 9, _]]) },
  '2024-1c-miercoles': { max: 5, ...matrices(
    [[5, 4, 11], [10, 5], [12]],
    [[_, 10, 9, 8, 3], [10, _, 7, 3, 5], [3, 5, _, 7, 9], [9, 5, 6, _, 10], [12, 6, 7, 8, _]]) },
  '2025-lunes': { max: 5, ...matrices(
    [[5, 9, 5], [8, 6], [12]],
    [[_, 3, 9, 10, 2], [9, _, 6, 7, 4], [2, 6, _, 5, 8], [3, 1, 7, _, 9], [11, 8, 6, 5, _]]) },
  '2025-miercoles': { max: 5, ...matrices(
    [[4, 7, 5], [9, 6], [4]],
    [[_, 3, 9, 10, 3], [7, _, 6, 7, 5], [7, 6, _, 3, 8], [10, 12, 7, _, 9], [11, 7, 6, 5, _]]) },
};

export function emparrilladoDeExamen(id) {
  const k = id.replace(/-t\d$/, '');
  return EMPARRILLADOS[k] ? k : null;
}
