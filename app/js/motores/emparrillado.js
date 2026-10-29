// Motor de Emparrillado (Repertory Grid) — criterio de MÍNIMA distancia, convenciones de la cátedra.
//
// Parrilla: grid[c][e] = valor de la característica c para el elemento e, escala [1, max].
// - Distancia entre elementos Ei, Ej = Σ_c |grid[c][i] - grid[c][j]|  (se "baja en vertical")
// - d1(Ci, Cj) = Σ_e |Ci[e] - Cj[e]|                 (parrilla original contra original)
// - d2(Ci, Cj) = Σ_e |Ci[e] - opuesta(Cj)[e]|         opuesta(v) = (max + 1) - v
//   En la matriz de características la cátedra pone d1 arriba de la diagonal y d2 abajo.
//   Para agrupar se usa min(d1, d2) de cada par.
// - Agrupamiento: se toma la mínima distancia; si hay empates se fusionan todos juntos
//   (si comparten un miembro quedan en un único grupo). Distancia entre grupos = la mínima
//   entre sus miembros. Se repite hasta que queda un único grupo.
// - Grupos resultantes (análisis del árbol): cada fusión entre ítems SUELTOS forma un grupo.
//   Un ítem que se une más tarde a un grupo ya formado queda como grupo propio, y la unión
//   de dos grupos ya formados no crea un grupo nuevo.
//   (Ej. de la clase: C1-C2 a nivel 1, luego C4 y luego C3 → 3 grupos: (C1,C2), (C4), (C3).)

export function opuesto(v, max) { return max + 1 - v; }

export function distanciasElementos(grid) {
  const nE = grid[0].length, d = {};
  for (let i = 0; i < nE; i++) for (let j = i + 1; j < nE; j++) {
    let s = 0; for (const fila of grid) s += Math.abs(fila[i] - fila[j]);
    d[`E${i + 1}-E${j + 1}`] = s;
  }
  return d;
}

export function distanciasCaracteristicas(grid, max) {
  const nC = grid.length, d1 = {}, d2 = {}, d = {};
  for (let i = 0; i < nC; i++) for (let j = i + 1; j < nC; j++) {
    let a = 0, b = 0;
    for (let e = 0; e < grid[i].length; e++) {
      a += Math.abs(grid[i][e] - grid[j][e]);
      b += Math.abs(grid[i][e] - opuesto(grid[j][e], max));
    }
    const k = `C${i + 1}-C${j + 1}`;
    d1[k] = a; d2[k] = b; d[k] = Math.min(a, b);
  }
  return { d1, d2, d };
}

const par = (a, b) => [a, b].sort((x, y) => +x.slice(1) - +y.slice(1)).join('-');
export function dist(d, a, b) { return d[par(a, b)] ?? d[`${a}-${b}`] ?? d[`${b}-${a}`]; }

// Agrupamiento por mínima distancia. etiquetas: ['E1','E2',...]; d: {'E1-E2': 5, ...}
export function agrupar(etiquetas, d) {
  let clusters = etiquetas.map(x => [x]);
  const pasos = [];
  const dc = (A, B) => Math.min(...A.flatMap(a => B.map(b => dist(d, a, b))));
  while (clusters.length > 1) {
    let min = Infinity;
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) min = Math.min(min, dc(clusters[i], clusters[j]));
    // unir todos los pares con distancia mínima (componentes conexas)
    const padre = clusters.map((_, i) => i);
    const raiz = i => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++)
      if (dc(clusters[i], clusters[j]) === min) padre[raiz(j)] = raiz(i);
    const comp = {};
    clusters.forEach((c, i) => { (comp[raiz(i)] = comp[raiz(i)] || []).push(c); });
    const nuevos = [];
    for (const partes of Object.values(comp)) {
      if (partes.length > 1) pasos.push({ nivel: min, une: partes.map(p => p.slice()), resultado: partes.flat() });
      nuevos.push(partes.flat());
    }
    clusters = nuevos;
  }
  return { pasos, orden: clusters[0] };
}

// Grupos según la lectura del árbol que hace la cátedra
export function grupos(etiquetas, pasos) {
  const grupoDe = {}; // item -> índice de grupo
  const gs = [];
  for (const p of pasos) {
    const sueltas = p.une.filter(part => part.length === 1 && grupoDe[part[0]] === undefined).map(x => x[0]);
    const yaAgrupadas = p.une.filter(part => !(part.length === 1 && grupoDe[part[0]] === undefined));
    if (yaAgrupadas.length === 0 && sueltas.length >= 2) {
      gs.push(sueltas.slice()); sueltas.forEach(s => (grupoDe[s] = gs.length - 1));
    } else {
      // ítems sueltos que se pegan a un grupo existente quedan como grupo propio
      for (const s of sueltas) { gs.push([s]); grupoDe[s] = gs.length - 1; }
    }
  }
  for (const e of etiquetas) if (grupoDe[e] === undefined) { gs.push([e]); grupoDe[e] = gs.length - 1; }
  return gs;
}

export function analizar({ grid, max, matrizE, matrizC }) {
  // Se puede partir de la parrilla (grid) o directamente de las matrices de distancias (como en los parciales)
  let dE, dC, d1, d2;
  if (grid) {
    dE = distanciasElementos(grid);
    ({ d1, d2, d: dC } = distanciasCaracteristicas(grid, max));
  } else {
    dE = matrizE; d1 = matrizC.d1; d2 = matrizC.d2;
    dC = {}; for (const k in d1) dC[k] = Math.min(d1[k], d2[k]);
  }
  const E = [...new Set(Object.keys(dE).flatMap(k => k.split('-')))].sort((a, b) => +a.slice(1) - +b.slice(1));
  const C = [...new Set(Object.keys(dC).flatMap(k => k.split('-')))].sort((a, b) => +a.slice(1) - +b.slice(1));
  const aE = agrupar(E, dE), aC = agrupar(C, dC);
  return { dE, d1, d2, dC, E, C, arbolE: aE, arbolC: aC, gruposE: grupos(E, aE.pasos), gruposC: grupos(C, aC.pasos) };
}

// Clasificación de la relación entre dos características a partir de las implicaciones del texto.
// Polos en el orden en que los da el enunciado: Ci = (A / B), Cj = (X / Y).
// Se dibujan A y B arriba, X e Y abajo; A queda sobre X y B sobre Y.
// flechas: lista de [desde, hacia], p.ej. [['A','X'], ['B','Y']] = "si A entonces X" y "si B entonces Y".
// Patrones tomados de las diapositivas de la cátedra (2026) y calibrados con los parciales:
//   PARALELA:  A→X y B→Y   (o X→A e Y→B)
//   RECÍPROCA: A↔X y B↔Y
//   ORTOGONAL: una sola flecha vertical (A→X, B→Y, X→A o Y→B), o dos flechas que llegan al mismo polo
//   AMBIGUA:   un polo implica los dos polos de la otra (abanico), con o sin una flecha vertical extra,
//              o las cuatro flechas cruzadas en el mismo sentido
//   NO TIPIFICADA: cualquier otra combinación (ej.: una sola flecha "cruzada" A→Y)
//   NO EXISTE RELACIÓN: no hay implicaciones entre ellas, o están en grupos distintos
const PATRONES = {
  'paralela': [['A>X', 'B>Y'], ['X>A', 'Y>B']],
  'recíproca': [['A>X', 'X>A', 'B>Y', 'Y>B']],
  'ortogonal': [['A>X'], ['B>Y'], ['X>A'], ['Y>B'], ['A>X', 'B>X'], ['A>Y', 'B>Y'], ['X>A', 'Y>A'], ['X>B', 'Y>B']],
  'ambigua': [['A>X', 'A>Y'], ['B>X', 'B>Y'], ['X>A', 'X>B'], ['Y>A', 'Y>B'],
    ['A>X', 'A>Y', 'B>Y'], ['A>X', 'B>X', 'B>Y'], ['X>A', 'X>B', 'Y>B'], ['X>A', 'Y>A', 'Y>B'],
    ['A>X', 'A>Y', 'B>X', 'B>Y'], ['X>A', 'X>B', 'Y>A', 'Y>B']],
};
export function tipoRelacion(flechas, mismoGrupo = true) {
  if (!mismoGrupo) return 'no existe relación';
  const f = [...new Set(flechas.map(([a, b]) => a + '>' + b))].sort();
  if (f.length === 0) return 'no existe relación';
  for (const [tipo, pats] of Object.entries(PATRONES))
    if (pats.some(p => p.length === f.length && [...p].sort().every((x, i) => x === f[i]))) return tipo;
  return 'no tipificada';
}
export const PATRONES_RELACION = PATRONES;
