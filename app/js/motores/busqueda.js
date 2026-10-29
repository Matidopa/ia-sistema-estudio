// Motor de Métodos de Búsqueda — convenciones de la cátedra (UTN FRBA, IA)
// Validado contra las respuestas de los parciales resueltos (ver tests/test_busqueda.mjs).
//
// Árbol/grafo:
// {
//   raiz: 'A',
//   mejor: 'menor' | 'mayor',          // si un valor heurístico menor o mayor es más deseable
//   nodos: { A: {h: 12, sol: false}, ... },
//   hijos: { A: [['B', 1], ['C', 1]], ... }   // orden de izquierda a derecha, [hijo, costo]
// }
//
// Convenciones (sacadas de las clases y verificadas con los parciales):
// - Ciegos (amplitud, profundidad, generación y prueba) recorren el grafo como ÁRBOL:
//   si un nodo tiene dos padres, aparece dos veces.
// - Escalada Simple: genera hijos de a uno (en el sentido pedido) y se mueve al PRIMERO que sea
//   estrictamente mejor que el actual. "Nodos generados" incluye la raíz. Si ningún hijo mejora, termina.
// - Escalada por Máxima Pendiente: genera TODOS los hijos y se mueve al mejor, sólo si es
//   estrictamente mejor que el actual (nunca con igual valor).
// - Primero el Mejor: lista de abiertos ordenada por heurística; ante empate, prioridad al más viejo.
// - Beam Search N: igual que Primero el Mejor pero antes de elegir el próximo nodo la lista de abiertos
//   se recorta a los N mejores; los descartados no vuelven.
// - A*: f = h + g (si "menor es mejor") o f = h − g (si "mayor es mejor"), g = suma de costos desde la raíz.
//   Si un nodo reaparece con mejor f se actualiza su valor.
// - Iteración 1 = cuando el nodo actual es la raíz.

export function esMejor(t, a, b) { // a estrictamente mejor que b
  return t.mejor === 'mayor' ? a > b : a < b;
}
function hijosDe(t, n, dir = 'izq') {
  const hs = (t.hijos[n] || []).slice();
  return dir === 'der' ? hs.reverse() : hs;
}
function esSol(t, n) { return !!(t.nodos[n] && t.nodos[n].sol); }
const fmt = (n, v) => `${n}(${v})`;

// ---------- Ciegos ----------
export function amplitud(t, dir = 'izq') {
  const cola = [t.raiz], recorrido = [], soluciones = [];
  while (cola.length) {
    const n = cola.shift();
    recorrido.push(n);
    if (esSol(t, n) && !soluciones.includes(n)) soluciones.push(n);
    for (const [h] of hijosDe(t, n, dir)) cola.push(h);
  }
  return { metodo: 'Primero en Amplitud', recorrido, soluciones, solucion: soluciones[0] || null,
    nota: 'Recorre todo el árbol nivel por nivel (cola FIFO).' };
}

export function profundidad(t, dir = 'izq') {
  // recorrido con retrocesos (como lo muestra la cátedra: A, B, E, I, E, J)
  const recorrido = [], visitados = [];
  let solucion = null;
  function dfs(n) {
    recorrido.push(n); visitados.push(n);
    if (esSol(t, n)) { solucion = n; return true; }
    for (const [h] of hijosDe(t, n, dir)) {
      if (dfs(h)) return true;
      recorrido.push(n); // vuelve al padre
    }
    return false;
  }
  dfs(t.raiz);
  return { metodo: 'Primero en Profundidad', recorrido, visitados, solucion,
    nota: 'Recorre por ramas (pila LIFO) y termina en el primer estado final.' };
}

export function generacionYPrueba(t, dir = 'izq') {
  const recorrido = [], soluciones = [];
  function dfs(n) {
    recorrido.push(n);
    if (esSol(t, n) && !soluciones.includes(n)) soluciones.push(n);
    for (const [h] of hijosDe(t, n, dir)) { dfs(h); recorrido.push(n); }
  }
  dfs(t.raiz);
  // la cátedra no repite la raíz al final
  while (recorrido.length > 1 && recorrido[recorrido.length - 1] === t.raiz) recorrido.pop();
  return { metodo: 'Generación y Prueba', recorrido, soluciones, solucion: soluciones[0] || null,
    nota: 'Igual que profundidad pero sigue hasta recorrer todo el árbol: encuentra todas las soluciones.' };
}

// ---------- Escaladas ----------
export function escaladaSimple(t, dir = 'izq') {
  let actual = t.raiz;
  const generados = [actual], visitados = [actual];
  while (!esSol(t, actual)) {
    let movio = false;
    for (const [h] of hijosDe(t, actual, dir)) {
      generados.push(h);
      if (esMejor(t, t.nodos[h].h, t.nodos[actual].h)) { actual = h; visitados.push(h); movio = true; break; }
    }
    if (!movio) break;
  }
  return { metodo: 'Escalada Simple', generados, visitados, solucion: esSol(t, actual) ? actual : null, final: actual };
}

export function maximaPendiente(t, dir = 'izq') {
  let actual = t.raiz;
  const generados = [actual], visitados = [actual];
  while (!esSol(t, actual)) {
    const hs = hijosDe(t, actual, dir);
    if (!hs.length) break;
    let mejor = null;
    for (const [h] of hs) {
      generados.push(h);
      if (mejor === null || esMejor(t, t.nodos[h].h, t.nodos[mejor].h)) mejor = h;
    }
    if (esMejor(t, t.nodos[mejor].h, t.nodos[actual].h)) { actual = mejor; visitados.push(mejor); }
    else break;
  }
  return { metodo: 'Escalada por Máxima Pendiente', generados, visitados, solucion: esSol(t, actual) ? actual : null, final: actual };
}

// ---------- Con lista de abiertos ----------
function ordenar(t, lista) {
  // orden estable: ante empate queda primero el más viejo (menor seq)
  return lista.sort((a, b) => (a.v === b.v ? a.seq - b.seq : (t.mejor === 'mayor' ? b.v - a.v : a.v - b.v)));
}

function conLista(t, { beam = null, costos = false, nombre, maxIter = 500 }) {
  let seq = 0;
  let abiertos = [{ n: t.raiz, v: t.nodos[t.raiz].h, g: 0, seq: seq++ }];
  const cerrados = [], iteraciones = [], generados = [t.raiz];
  let solucion = null;
  while (abiertos.length && iteraciones.length < maxIter) {
    ordenar(t, abiertos);
    if (beam) abiertos = abiertos.slice(0, beam);
    const act = abiertos.shift();
    cerrados.push(act.n);
    const it = { num: iteraciones.length + 1, actual: act.n, valorActual: act.v, esSolucion: esSol(t, act.n) };
    if (it.esSolucion) {
      solucion = act.n;
      it.abiertos = abiertos.map(x => ({ n: x.n, v: x.v, txt: fmt(x.n, x.v) }));
      it.cerrados = cerrados.slice();
      iteraciones.push(it);
      break;
    }
    for (const [h, c] of hijosDe(t, act.n, 'izq')) {
      if (cerrados.includes(h)) continue;
      const g = act.g + (costos ? (c || 0) : 0);
      const v = costos ? (t.mejor === 'mayor' ? t.nodos[h].h - g : t.nodos[h].h + g) : t.nodos[h].h;
      const ya = abiertos.find(x => x.n === h);
      generados.push(h);
      if (ya) {
        if (costos && esMejor(t, v, ya.v)) { ya.v = v; ya.g = g; }
        continue;
      }
      abiertos.push({ n: h, v, g, seq: seq++, expr: costos ? `${t.nodos[h].h}${t.mejor === 'mayor' ? '-' : '+'}${g}` : null });
    }
    ordenar(t, abiertos);
    it.abiertos = abiertos.map(x => ({ n: x.n, v: x.v, txt: fmt(x.n, x.v) }));
    it.cerrados = cerrados.slice();
    iteraciones.push(it);
  }
  const ult = iteraciones[iteraciones.length - 1];
  return { metodo: nombre, iteraciones, solucion, cerrados: cerrados.slice(), generados,
    abiertosFinal: ult ? ult.abiertos : [], visitados: cerrados.slice() };
}

export const primeroMejor = t => conLista(t, { nombre: 'Primero el Mejor' });
export const beamSearch = (t, n) => conLista(t, { beam: n, nombre: `Beam Search (n=${n})` });
export const aEstrella = t => conLista(t, { costos: true, nombre: 'A*' });

export const METODOS = {
  amplitud_izq: { nombre: 'Primero en Amplitud (izq → der)', fn: t => amplitud(t, 'izq') },
  amplitud_der: { nombre: 'Primero en Amplitud (der → izq)', fn: t => amplitud(t, 'der') },
  profundidad_izq: { nombre: 'Primero en Profundidad (izq → der)', fn: t => profundidad(t, 'izq') },
  profundidad_der: { nombre: 'Primero en Profundidad (der → izq)', fn: t => profundidad(t, 'der') },
  gyp_izq: { nombre: 'Generación y Prueba (izq → der)', fn: t => generacionYPrueba(t, 'izq') },
  escalada_izq: { nombre: 'Escalada Simple (izq → der)', fn: t => escaladaSimple(t, 'izq') },
  escalada_der: { nombre: 'Escalada Simple (der → izq)', fn: t => escaladaSimple(t, 'der') },
  maxpend: { nombre: 'Escalada por Máxima Pendiente', fn: t => maximaPendiente(t) },
  pm: { nombre: 'Primero el Mejor', fn: t => primeroMejor(t) },
  beam1: { nombre: 'Beam Search (n=1)', fn: t => beamSearch(t, 1) },
  beam2: { nombre: 'Beam Search (n=2)', fn: t => beamSearch(t, 2) },
  beam3: { nombre: 'Beam Search (n=3)', fn: t => beamSearch(t, 3) },
  astar: { nombre: 'A*', fn: t => aEstrella(t) },
};

// Lista de nodos que el método "visita" (para preguntas tipo "mismo recorrido que...")
export function recorridoDe(r) {
  return r.visitados || r.recorrido || [];
}
