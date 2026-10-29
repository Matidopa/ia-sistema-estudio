// Simuladores: búsqueda paso a paso, emparrillado completo y ruleta de algoritmos genéticos.
import * as D from '../datos.js';
import { h } from '../componentes.js';
import * as B from '../motores/busqueda.js';
import * as E from '../motores/emparrillado.js';
import { svgArbol, tablaMatriz } from '../motores/dibujo.js';
import { ARBOLES } from '../../../contenido/arboles_parciales.js';
import { arbolAleatorio, emparrilladoAleatorio } from '../generadores.js';

const INF = 1e9;
export function vistaSimuladores(main, sub) {
  const cual = (sub || '/busqueda').slice(1);
  const nav = h('div', { class: 'acciones' },
    ...[['busqueda', 'Métodos de búsqueda'], ['emparrillado', 'Emparrillado'], ['ag', 'Ruleta de AG']].map(([k, t]) =>
      h('a', { class: 'boton' + (k === cual ? '' : ' secundario'), href: `#/simuladores/${k}` }, t)));
  const cont = h('div', { class: 'columna' }, h('h1', {}, 'Simuladores'), nav);
  main.append(cont);
  if (cual === 'emparrillado') simEmparrillado(cont);
  else if (cual === 'ag') simAG(cont);
  else simBusqueda(cont);
}

// ---------------- Búsqueda ----------------
function simBusqueda(cont) {
  const fuentes = [['aleatorio', 'Árbol aleatorio nuevo']];
  for (const k of Object.keys(ARBOLES)) fuentes.push(['p:' + k, `Parcial ${k.replace(/-/g, ' ')}`]);
  for (const e of D.CATEDRA.ejercicios.filter(x => x.tipo === 'busqueda')) fuentes.push(['c:' + e.id, `Cátedra: ${e.titulo}`]);
  const selA = h('select', {}, ...fuentes.map(([v, t]) => h('option', { value: v }, t)));
  const selM = h('select', {}, ...Object.entries(B.METODOS).map(([k, m]) => h('option', { value: k }, m.nombre)));
  selM.value = 'astar';
  const lienzo = h('div', { class: 'lienzo' }), pasos = h('div', { class: 'pasos' }), info = h('p', { class: 'chico suave' });
  const ant = h('button', { class: 'boton secundario', type: 'button' }, 'Anterior');
  const sig = h('button', { class: 'boton', type: 'button' }, 'Siguiente paso');
  const contador = h('span', { class: 'chico' });
  const play = h('button', { class: 'boton secundario', type: 'button' }, 'Reproducir');
  cont.append(h('p', { class: 'bajada' }, 'Elegí un árbol y un método y avanzá de a una iteración. En amarillo, los nodos abiertos; en verde, los cerrados; con borde grueso azul, el nodo actual.'),
    h('div', { class: 'hoja fila' }, h('label', { class: 'campo' }, 'Árbol', selA), h('label', { class: 'campo' }, 'Método', selM)),
    h('div', { class: 'sim' }, h('div', {}, lienzo, info), h('div', {}, h('div', { class: 'acciones' }, ant, sig, play, contador), pasos)));
  let t = null, r = null, paso = 0, total = 0;
  function cargar() {
    const v = selA.value;
    if (v === 'aleatorio') t = arbolAleatorio();
    else if (v.startsWith('p:')) t = ARBOLES[v.slice(2)];
    else { const e = D.CATEDRA.ejercicios.find(x => x.id === v.slice(2)); t = { ...e.arbol, nodos: Object.fromEntries(Object.entries(e.arbol.nodos).map(([k, n]) => [k, { ...n, h: n.h === null ? 0 : n.h }])) }; }
    correr();
  }
  function correr() {
    r = B.METODOS[selM.value].fn(t);
    total = r.iteraciones ? r.iteraciones.length : (r.visitados || r.recorrido).length;
    paso = 0;
    parar();
    pintar();
  }
  function pintar() {
    contador.textContent = `${paso} de ${total}`;
    info.textContent = `Cuanto ${t.mejor} es el valor, más deseable. Soluciones: ${Object.keys(t.nodos).filter(k => t.nodos[k].sol).join(', ')}.` +
      (paso >= total ? ` Resultado: ${r.solucion ? 'llega a ' + r.solucion : 'no llega a ninguna solución'}.` : ' Avanzá hasta el final para ver el resultado.');
    play.textContent = reproduciendo ? 'Pausa' : paso >= total ? 'Repetir' : 'Reproducir';
    ant.disabled = paso === 0; sig.disabled = paso >= total;
    const dib = { ...t, nodos: Object.fromEntries(Object.entries(t.nodos).map(([k, n]) => [k, { ...n, h: n.h >= INF ? '∞' : n.h }])) };
    pasos.innerHTML = '';
    if (r.iteraciones) {
      const it = r.iteraciones[paso - 1];
      lienzo.innerHTML = svgArbol(dib, it ? { actual: it.actual, abiertos: it.abiertos.map(a => a.n), cerrados: it.cerrados } : { actual: t.raiz });
      r.iteraciones.slice(0, paso).forEach(i => pasos.append(h('div', { class: 'paso' + (i === it ? ' activo' : '') },
        h('b', {}, `Iteración ${i.num}: `), `actual ${i.actual}${i.esSolucion ? ' (¡solución!)' : ''}`, h('br'),
        `Abiertos: ${i.abiertos.map(a => `${a.n}(${a.v >= INF ? '∞' : a.v})`).join(', ') || '(vacía)'}`, h('br'), `Cerrados: ${i.cerrados.join(', ')}`)));
    } else {
      const seq = r.visitados || r.recorrido;
      const vistos = seq.slice(0, paso);
      lienzo.innerHTML = svgArbol(dib, { actual: vistos[vistos.length - 1], cerrados: vistos });
      if (r.generados) pasos.append(h('div', { class: 'paso' }, h('b', {}, 'Generados (total): '), r.generados.join(', ')));
      pasos.append(h('div', { class: 'paso activo' }, h('b', {}, r.generados ? 'Visitados: ' : 'Recorrido: '), vistos.join(', ') || '—'));
      if (r.recorrido && r.visitados) pasos.append(h('div', { class: 'paso' }, h('b', {}, 'Con retrocesos: '), r.recorrido.join(', ')));
    }
  }
  let reproduciendo = null;
  function parar() { clearInterval(reproduciendo); reproduciendo = null; }
  play.addEventListener('click', () => {
    if (reproduciendo) { parar(); pintar(); return; }
    if (paso >= total) paso = 0;
    reproduciendo = setInterval(() => {
      if (!document.body.contains(play) || paso >= total) { parar(); if (document.body.contains(play)) pintar(); return; }
      paso++; pintar();
    }, 1100);
    pintar();
  });
  ant.addEventListener('click', () => { parar(); paso = Math.max(0, paso - 1); pintar(); });
  sig.addEventListener('click', () => { parar(); paso = Math.min(total, paso + 1); pintar(); });
  selA.addEventListener('change', cargar);
  selM.addEventListener('change', correr);
  cargar();
}

// ---------------- Emparrillado ----------------
function simEmparrillado(cont) {
  let nC = 5, nE = 4, max = 5;
  let grid = emparrilladoAleatorio().grid;
  const zonaGrid = h('div'), zonaRes = h('div');
  const inC = h('input', { type: 'number', min: 2, max: 8, value: nC, style: 'width:4em' });
  const inE = h('input', { type: 'number', min: 2, max: 8, value: nE, style: 'width:4em' });
  const inM = h('input', { type: 'number', min: 2, max: 9, value: max, style: 'width:4em' });
  const rehacer = () => {
    nC = +inC.value; nE = +inE.value; max = +inM.value;
    grid = Array.from({ length: nC }, (_, i) => Array.from({ length: nE }, (_, j) => Math.min(max, (grid[i] && grid[i][j]) || 1 + Math.floor(Math.random() * max))));
    armarGrid(); calcular();
  };
  [inC, inE, inM].forEach(x => x.addEventListener('change', rehacer));
  cont.append(h('p', { class: 'bajada' }, 'Cargá una parrilla (o usá la aleatoria) y mirá todo el emparrillado calculado: distancias, árboles y grupos. Abajo hay una herramienta para tipificar relaciones dibujando las flechas.'),
    h('div', { class: 'hoja fila' }, h('label', { class: 'campo' }, 'Características', inC), h('label', { class: 'campo' }, 'Elementos', inE), h('label', { class: 'campo' }, 'Escala máxima', inM),
      h('button', { class: 'boton secundario', type: 'button', onclick: () => { grid = []; rehacer(); } }, 'Parrilla aleatoria')),
    zonaGrid, zonaRes);
  function armarGrid() {
    const t = h('table', { class: 'matriz' }, h('tr', {}, h('th'), ...Array.from({ length: nE }, (_, j) => h('th', {}, `E${j + 1}`))));
    grid.forEach((fila, i) => t.append(h('tr', {}, h('th', {}, `C${i + 1}`), ...fila.map((v, j) => {
      const inp = h('input', { type: 'number', min: 1, max, value: v });
      inp.addEventListener('input', () => { grid[i][j] = Math.max(1, Math.min(max, +inp.value || 1)); calcular(); });
      return h('td', {}, inp);
    }))));
    zonaGrid.innerHTML = ''; zonaGrid.append(h('h2', {}, 'Parrilla'), t);
  }
  function calcular() {
    const A = E.analizar({ grid, max });
    const minE = Math.min(...Object.values(A.dE)), minC = Math.min(...Object.values(A.dC));
    zonaRes.innerHTML = '';
    const pasos = arb => h('ol', {}, ...arb.pasos.map(p => h('li', {}, `Nivel ${p.nivel}: se unen ${p.une.map(u => '[' + u.join(', ') + ']').join(' + ')}`)));
    zonaRes.append(
      h('h2', {}, 'Elementos'),
      h('div', { html: resaltarMin(tablaMatriz(A.E, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.dE, a, b) : null)), minE) }),
      pasos(A.arbolE), h('p', {}, h('b', {}, 'Grupos: '), A.gruposE.map(g => '(' + g.join(', ') + ')').join('; ')),
      h('h2', {}, 'Características'),
      h('p', { class: 'chico suave' }, 'Parrilla opuesta: cada valor v pasa a ser (máximo + 1) − v. d1 arriba de la diagonal, d2 abajo; para agrupar se usa el menor de los dos.'),
      h('div', { html: tablaMatriz(A.C, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.d1, a, b) : E.dist(A.d2, a, b))) }),
      h('div', { html: resaltarMin(tablaMatriz(A.C, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.dC, a, b) : null)), minC) }),
      pasos(A.arbolC), h('p', {}, h('b', {}, 'Grupos: '), A.gruposC.map(g => '(' + g.join(', ') + ')').join('; ')),
      herramientaRelacion(A));
  }
  armarGrid(); calcular();
}
function resaltarMin(html, min) {
  return html.replace(new RegExp(`<td>${min}</td>`, 'g'), `<td class="min">${min}</td>`);
}
function herramientaRelacion(A) {
  const opciones = A ? A.C : ['C1', 'C2'];
  const sCi = h('select', {}, ...opciones.map(c => h('option', {}, c)));
  const sCj = h('select', {}, ...opciones.map(c => h('option', {}, c)));
  if (opciones[1]) sCj.value = opciones[1];
  const flechas = ['A>X', 'A>Y', 'B>X', 'B>Y', 'X>A', 'X>B', 'Y>A', 'Y>B'];
  const checks = flechas.map(f => { const c = h('input', { type: 'checkbox', value: f }); return [f, c]; });
  const res = h('p', { style: 'font-size:1.15rem' });
  const upd = () => {
    const fs = checks.filter(([, c]) => c.checked).map(([f]) => f.split('>'));
    const mismo = !A || A.gruposC.some(g => g.includes(sCi.value) && g.includes(sCj.value));
    res.innerHTML = '';
    res.append(h('b', {}, E.tipoRelacion(fs, mismo)), mismo ? '' : ` — ${sCi.value} y ${sCj.value} están en grupos distintos; si estuvieran juntas, el patrón sería: ${E.tipoRelacion(fs, true)}.`);
  };
  [sCi, sCj, ...checks.map(([, c]) => c)].forEach(x => x.addEventListener('change', upd));
  const box = h('div', { class: 'hoja' }, h('h2', { style: 'margin-top:0' }, 'Tipificar una relación'),
    h('p', { class: 'chico suave' }, 'A y B son los polos de Ci en el orden del enunciado; X e Y los de Cj. Tildá las implicaciones que dice el texto.'),
    h('div', { class: 'fila' }, h('label', { class: 'campo' }, 'Ci', sCi), h('label', { class: 'campo' }, 'Cj', sCj)),
    h('div', { class: 'fila', style: 'margin:10px 0' }, ...checks.map(([f, c]) => h('label', { style: 'display:flex;gap:4px;align-items:center' }, c, f.replace('>', ' → ')))),
    res);
  upd();
  return box;
}

// ---------------- AG: ruleta y número esperado ----------------
function simAG(cont) {
  const inp = h('input', { type: 'text', value: '40, 25, 20, 15', size: 30 });
  const zona = h('div');
  const calc = () => {
    const apt = inp.value.split(/[,; ]+/).map(Number).filter(v => !isNaN(v) && v >= 0);
    zona.innerHTML = '';
    if (apt.length < 2) { zona.append(h('p', { class: 'vacio' }, 'Ingresá al menos dos aptitudes.')); return; }
    const total = apt.reduce((a, b) => a + b, 0), prom = total / apt.length;
    let acum = 0;
    const r2 = v => Math.round(v * 100) / 100;
    const filas = apt.map((a, i) => {
      const p = a / total; acum += p; const vs = a / prom;
      return h('tr', {}, h('td', {}, `I${i + 1}`), h('td', {}, a), h('td', {}, r2(100 * p) + '%'), h('td', {}, r2(100 * acum) + '%'), h('td', {}, r2(vs)), h('td', {}, Math.floor(vs)), h('td', {}, r2(vs - Math.floor(vs))));
    });
    const directas = apt.reduce((s, a) => s + Math.floor(a / prom), 0);
    zona.append(h('div', { class: 'envoltura-tabla' }, h('table', { class: 'tabla' },
      h('thead', {}, h('tr', {}, ...['Individuo', 'Aptitud', 'Porción de ruleta', 'Acumulada', 'Valor de selección', 'Copias directas', 'Parte decimal'].map(x => h('th', {}, x)))),
      h('tbody', {}, ...filas))),
      h('p', {}, `Total = ${total}; promedio = ${r2(prom)}. En Control sobre Número Esperado pasan ${directas} individuo(s) directo (las partes enteras) y los ${Math.max(0, apt.length - directas)} lugares restantes se sortean con una ruleta armada con las partes decimales.`));
  };
  inp.addEventListener('input', calc);
  cont.append(h('p', { class: 'bajada' }, 'Escribí las aptitudes de la población separadas por comas. La tabla muestra cómo se arma la ruleta y cuántas copias directas da el Control sobre Número Esperado.'),
    h('label', { class: 'campo hoja' }, 'Aptitudes', inp), zona);
  calc();
}
