// Generadores de ejercicios NUEVOS, al estilo de los parciales.
// Las respuestas las calculan los motores (validados contra los parciales reales), no se inventan.
import * as B from './motores/busqueda.js';
import { evaluarPregunta, correr } from './motores/busqueda_preguntas.js';
import * as E from './motores/emparrillado.js';
import { svgArbol, tablaMatriz } from './motores/dibujo.js';

const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const elegir = arr => arr[Math.floor(Math.random() * arr.length)];
const mezclar = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let contador = 0;
const nuevoId = pref => `algo-${pref}-${Date.now().toString(36)}-${(contador++).toString(36)}`;

// =============== Árboles aleatorios ===============
export function arbolAleatorio() {
  const letras = mezclar('ABCDEFGHIJKLMNOPQRSTUVWXZ'.split(''));
  const mejor = Math.random() < 0.5 ? 'menor' : 'mayor';
  const n = azar(10, 13);
  const usados = letras.slice(0, n);
  const raiz = usados[0];
  const niveles = [[raiz]];
  let resto = usados.slice(1);
  const hijos = {};
  // 3 o 4 niveles debajo de la raíz
  const prof = azar(3, 4);
  for (let l = 1; l <= prof && resto.length; l++) {
    const cant = l === prof ? resto.length : Math.min(resto.length, azar(2, 4));
    niveles.push(resto.slice(0, cant));
    resto = resto.slice(cant);
  }
  const costo = () => 5 * azar(1, 8);
  for (let l = 1; l < niveles.length; l++) {
    const padres = niveles[l - 1];
    niveles[l].forEach((c, i) => {
      const p = padres[Math.min(padres.length - 1, Math.floor(i * padres.length / niveles[l].length))];
      (hijos[p] = hijos[p] || []).push([c, costo()]);
    });
    // algún nodo con dos padres (como en los parciales)
    if (padres.length > 1 && Math.random() < 0.7) {
      const c = elegir(niveles[l]);
      const p = elegir(padres.filter(x => !(hijos[x] || []).some(([h]) => h === c)));
      if (p) (hijos[p] = hijos[p] || []).push([c, costo()]);
    }
  }
  // ordenar hijos por la posición en el nivel (izquierda a derecha)
  const posicion = {}; niveles.forEach(f => f.forEach((x, i) => (posicion[x] = i)));
  for (const p in hijos) hijos[p].sort((a, b) => posicion[a[0]] - posicion[b[0]]);
  // heurísticas: tienden a mejorar al bajar, con ruido
  const nodos = {};
  const base = mejor === 'menor' ? 900 : 50;
  niveles.forEach((fila, l) => fila.forEach(x => {
    const tendencia = mejor === 'menor' ? base - l * azar(40, 160) : base + l * azar(15, 60);
    nodos[x] = { h: Math.max(0, Math.round((tendencia + azar(-60, 60)) / 10) * 10) };
  }));
  // dos soluciones entre las hojas o nodos profundos
  const profundos = niveles.slice(2).flat();
  const sols = mezclar(profundos).slice(0, 2);
  for (const s of sols) { nodos[s].sol = true; nodos[s].h = mejor === 'menor' ? azar(1, 25) * 10 : azar(30, 60) * 10; }
  return { raiz, mejor, nodos, hijos };
}

function listaTxt(l) { return l.length ? l.join(', ') + '.' : 'la lista queda vacía.'; }
function abiertosTxt(l) { return l.length ? l.map(x => `${x.n} (${x.v})`).join(', ') + '.' : 'la lista queda vacía.'; }
function variante(l) { // distractor plausible: cambia un nodo o corta la lista
  const a = l.slice();
  if (a.length > 2 && Math.random() < 0.5) a.pop();
  else if (a.length > 1) { const i = azar(1, a.length - 1); [a[i], a[i - 1]] = [a[i - 1], a[i]]; }
  return a;
}
const NOMBRE = {
  pm: 'El Primero Mejor', beam1: 'Beam Search n=1', beam2: 'Beam Search n=2', astar: 'A*', maxpend: 'Escalada por Máxima Pendiente',
  escalada_izq: 'Escalada Simple (recorriendo de izquierda a derecha el árbol)', escalada_der: 'Escalada Simple (recorriendo de derecha a izquierda el árbol)',
  profundidad_izq: 'Primero en Profundidad (recorriendo de izquierda a derecha el árbol)', profundidad_der: 'Primero en Profundidad (recorriendo de derecha a izquierda el árbol)',
  amplitud_izq: 'Primero en Amplitud (recorriendo de izquierda a derecha el árbol)',
};

function preguntaBusqueda() {
  for (let intento = 0; intento < 60; intento++) {
    const t = arbolAleatorio();
    const plantilla = elegir(['cerrados', 'visitados', 'alcanza', 'ninguna', 'astar_valor', 'astar_lista', 'beam_abiertos', 'mismo']);
    let enunciado, opciones, correcta = 0;
    const sols = Object.keys(t.nodos).filter(k => t.nodos[k].sol);
    try {
      if (plantilla === 'cerrados') {
        const k = elegir(['pm', 'beam1', 'beam2', 'astar']);
        const ok = correr(t, k).cerrados;
        const otros = ['pm', 'beam1', 'beam2', 'astar', 'maxpend'].filter(x => x !== k).map(x => correr(t, x).visitados);
        enunciado = `La lista final de nodos cerrados que se obtiene utilizando el método de búsqueda “${NOMBRE[k]}” es …`;
        opciones = [listaTxt(ok), ...otros.map(listaTxt), listaTxt(variante(ok)), listaTxt(variante(ok))];
      } else if (plantilla === 'visitados') {
        const k = elegir(['escalada_izq', 'escalada_der', 'maxpend']);
        const ok = correr(t, k).visitados;
        enunciado = `La lista final de nodos visitados que se obtiene utilizando el método de búsqueda “${NOMBRE[k]}” es …`;
        opciones = [listaTxt(ok), ...['escalada_izq', 'escalada_der', 'maxpend', 'profundidad_izq', 'pm'].filter(x => x !== k).map(x => listaTxt(correr(t, x).visitados)), listaTxt(variante(ok))];
      } else if (plantilla === 'alcanza' || plantilla === 'ninguna') {
        const keys = Object.keys(NOMBRE);
        const S = elegir(sols);
        const pred = plantilla === 'alcanza' ? (k => correr(t, k).solucion === S) : (k => !correr(t, k).solucion);
        const si = keys.filter(pred), no = keys.filter(k => !pred(k));
        if (!si.length || no.length < 3) continue;
        const elegido = elegir(si);
        enunciado = plantilla === 'alcanza' ? `De los siguientes, el único método de búsqueda que alcanza la solución ${S} es …` : 'De los siguientes, el único método de búsqueda que no llega a ninguna solución es …';
        opciones = [NOMBRE[elegido] + '.', ...mezclar(no).slice(0, 3).map(k => NOMBRE[k] + '.')];
      } else if (plantilla === 'astar_valor' || plantilla === 'astar_lista') {
        const r = correr(t, 'astar');
        if (r.iteraciones.length < 3) continue;
        const k = azar(2, Math.min(4, r.iteraciones.length - 1));
        const it = r.iteraciones[k - 1];
        if (!it.abiertos.length) continue;
        if (plantilla === 'astar_valor') {
          const x = elegir(it.abiertos);
          enunciado = `Si se recorre el árbol utilizando el método de búsqueda “A*”, en la iteración N° ${k} del algoritmo, el valor del nodo ${x.n} es …`;
          const tn = t.nodos[x.n].h;
          const vals = [...new Set([x.v, tn, x.v + 10, x.v - 10, x.v + 20, t.mejor === 'menor' ? x.v - 2 * (x.v - tn) : x.v + 2 * (tn - x.v)])].filter(v => v !== undefined);
          opciones = vals.map(v => `${x.n} (${v}).`);
        } else {
          enunciado = `Si se recorre el árbol utilizando el método de búsqueda “A*”, en la iteración N° ${k} del algoritmo, la lista de nodos abiertos es …`;
          const ok = it.abiertos;
          const ant = r.iteraciones[k - 2].abiertos, sig = (r.iteraciones[k] || it).abiertos;
          const sinCosto = ok.map(a => ({ n: a.n, v: t.nodos[a.n].h }));
          opciones = [abiertosTxt(ok), abiertosTxt(ant), abiertosTxt(sig), abiertosTxt(sinCosto), abiertosTxt(ok.slice(0, -1))];
        }
      } else if (plantilla === 'beam_abiertos') {
        const k = elegir(['beam1', 'beam2']);
        const ok = correr(t, k).abiertosFinal;
        enunciado = `La lista final de nodos abiertos que se obtiene utilizando el método de búsqueda “${NOMBRE[k]}” es …`;
        opciones = [abiertosTxt(ok), abiertosTxt(correr(t, 'pm').abiertosFinal), abiertosTxt(correr(t, k === 'beam1' ? 'beam2' : 'beam1').abiertosFinal), abiertosTxt(ok.slice(0, 1)), 'la lista queda vacía.'];
      } else if (plantilla === 'mismo') {
        const base = elegir(['pm', 'beam1', 'escalada_izq', 'escalada_der']);
        const b = B.recorridoDe(correr(t, base));
        const keys = Object.keys(NOMBRE).filter(k => k !== base);
        const si = keys.filter(k => B.recorridoDe(correr(t, k)).join() === b.join());
        const no = keys.filter(k => !si.includes(k));
        if (!si.length || no.length < 3) continue;
        enunciado = `El método de búsqueda que genera el mismo recorrido que “${NOMBRE[base]}” es …`;
        opciones = [NOMBRE[elegir(si)] + '.', ...mezclar(no).slice(0, 3).map(k => NOMBRE[k] + '.')];
      }
    } catch (e) { continue; }
    // quedarse con 4 opciones distintas, la correcta primero
    opciones = [...new Set(opciones)];
    if (opciones.length < 4) continue;
    const correctaTxt = opciones[0];
    opciones = mezclar([correctaTxt, ...mezclar(opciones.slice(1)).slice(0, 3)]);
    correcta = opciones.indexOf(correctaTxt) + 1;
    // doble chequeo con el evaluador validado: tiene que haber UNA sola opción correcta
    const ev = evaluarPregunta(t, enunciado, opciones);
    if (!ev || ev.filter(Boolean).length !== 1 || !ev[correcta - 1]) continue;
    const consid = `Los nodos ${sols.join(' y ')} son solución. Cuanto ${t.mejor} es el valor heurístico, más deseable es el nodo. El costo de transición está sobre cada arco.`;
    return {
      id: nuevoId('busq'), tipo: 'algo', unidad: 'u5-busqueda', enunciado, opciones, correcta,
      extra: `<div class="lienzo">${svgArbol(t)}</div><p class="chico suave">${consid}</p>`,
      explicacion: explicacionBusqueda(t, enunciado),
      basada_en: [], ref: 'Ejercicio nuevo (árbol aleatorio)',
    };
  }
  throw new Error('No pude generar un árbol con una única respuesta correcta.');
}

function explicacionBusqueda(t, enunciado) {
  const keys = new Set();
  for (const [k, n] of Object.entries(NOMBRE)) if (enunciado.includes(n)) keys.add(k);
  if (!keys.size) ['pm', 'astar', 'escalada_izq', 'escalada_der', 'maxpend', 'profundidad_izq', 'profundidad_der', 'beam1'].forEach(k => keys.add(k));
  let s = '';
  for (const k of keys) {
    const r = correr(t, k);
    if (r.iteraciones) {
      s += `**${NOMBRE[k]}**\n\n| It. | Actual | ¿Solución? | Abiertos | Cerrados |\n|---|---|---|---|---|\n`;
      for (const i of r.iteraciones) s += `| ${i.num} | ${i.actual} | ${i.esSolucion ? 'sí' : 'no'} | ${i.abiertos.map(a => a.txt).join(', ') || '—'} | ${i.cerrados.join(', ')} |\n`;
      s += '\n';
    } else {
      s += `**${NOMBRE[k]}**: ${r.generados ? `generados ${r.generados.join(', ')}; ` : ''}visitados ${(r.visitados || r.recorrido).join(', ')} → ${r.solucion ? 'solución ' + r.solucion : 'no llega a ninguna solución'}.\n\n`;
    }
  }
  return s;
}

// =============== Emparrillado ===============
const DOMINIOS = [
  { titulo: 'Clasifica Bicicletas', objetos: 'bicicletas', E: ['Ruta', 'Montaña', 'Urbana', 'Plegable'],
    C: [['Peso', 'liviana', 'pesada'], ['Velocidad', 'rápida', 'lenta'], ['Precio', 'alto', 'bajo'], ['Comodidad', 'alta', 'baja'], ['Resistencia al terreno', 'alta', 'baja']] },
  { titulo: 'Clasifica Lenguajes de Programación', objetos: 'lenguajes', E: ['Python', 'C', 'Java', 'JavaScript'],
    C: [['Curva de aprendizaje', 'suave', 'empinada'], ['Velocidad de ejecución', 'alta', 'baja'], ['Tipado', 'estático', 'dinámico'], ['Comunidad', 'grande', 'chica'], ['Uso de memoria', 'bajo', 'alto']] },
  { titulo: 'Clasifica Perros de Raza', objetos: 'perros', E: ['Labrador', 'Chihuahua', 'Ovejero Alemán', 'Bulldog'],
    C: [['Tamaño', 'grande', 'pequeño'], ['Energía', 'alta', 'baja'], ['Necesidad de espacio', 'mucha', 'poca'], ['Cuidado del pelaje', 'alto', 'bajo'], ['Facilidad de entrenamiento', 'alta', 'baja']] },
  { titulo: 'Clasifica Cafés de Especialidad', objetos: 'cafés', E: ['Espresso', 'Filtrado', 'Cold Brew', 'Latte'],
    C: [['Intensidad', 'fuerte', 'suave'], ['Acidez', 'alta', 'baja'], ['Tiempo de preparación', 'largo', 'corto'], ['Cafeína', 'mucha', 'poca'], ['Cuerpo', 'denso', 'ligero']] },
  { titulo: 'Clasifica Celulares', objetos: 'celulares', E: ['Gama alta', 'Gama media', 'Gama baja', 'Plegable'],
    C: [['Precio', 'alto', 'bajo'], ['Duración de batería', 'larga', 'corta'], ['Calidad de cámara', 'alta', 'baja'], ['Peso', 'liviano', 'pesado'], ['Resistencia a golpes', 'alta', 'baja']] },
];

export function emparrilladoAleatorio() {
  const dom = elegir(DOMINIOS);
  const nC = 5, nE = 4, max = 5;
  const grid = Array.from({ length: nC }, () => Array.from({ length: nE }, () => azar(1, max)));
  return { dom, grid, max, A: E.analizar({ grid, max }) };
}

function htmlEmparrillado(x, conParrilla) {
  const { dom, grid, A } = x;
  let s = `<div class="hoja"><b>EMPARRILLADO: ${dom.titulo}</b> <span class="suave chico">(criterio de mínima distancia)</span><div class="fila" style="align-items:start;gap:30px;margin-top:6px"><div>`;
  s += dom.E.map((e, i) => `E${i + 1}: ${e}`).join('<br>') + '</div><div>';
  s += dom.C.map((c, i) => `C${i + 1}: ${c[0]} (${c[1]} / ${c[2]})`).join('<br>') + '</div></div>';
  if (conParrilla) {
    s += `<p class="chico">Parrilla evaluativa, escala [1, ${x.max}]:</p><table class="matriz"><tr><th></th>${dom.E.map((_, i) => `<th>E${i + 1}</th>`).join('')}</tr>`;
    grid.forEach((f, i) => { s += `<tr><th>C${i + 1}</th>${f.map(v => `<td>${v}</td>`).join('')}</tr>`; });
    s += '</table>';
  } else {
    s += '<p class="chico">Matriz de distancias entre elementos y entre características (d1 arriba de la diagonal, d2 abajo):</p><div class="fila" style="align-items:start">';
    s += tablaMatriz(A.E, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.dE, a, b) : null));
    s += tablaMatriz(A.C, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.d1, a, b) : E.dist(A.d2, a, b)));
    s += '</div>';
  }
  return s + '</div>';
}
const fmtGrupos = g => g.map(x => (x.length > 1 ? '(' + x.join(', ') + ')' : x[0])).join('; ') + '.';

function frase(dom, ci, pi, cj, pj) {
  const [ni, ...polosI] = dom.C[ci], [nj, ...polosJ] = dom.C[cj];
  const a = `${ni.toLowerCase()} ${polosI[pi]}`, b = `${nj.toLowerCase()} ${polosJ[pj]}`;
  return elegir([
    `Los ${dom.objetos} con ${a} suelen tener ${b}.`,
    `Según el experto, si un ${dom.objetos.replace(/s$/, '')} tiene ${a}, entonces tiene ${b}.`,
    `En general, una ${a} implica una ${b}.`.replace('una ', '').replace(' una ', ' '),
    `Se observó que aquellos ${dom.objetos} de ${a} presentan ${b}.`,
  ]);
}

function preguntaEmparrillado() {
  for (let intento = 0; intento < 80; intento++) {
    const x = emparrilladoAleatorio();
    const { A, dom } = x;
    const tipo = elegir(['grupos_c', 'grupos_e', 'cant_c', 'cant_e', 'relacion', 'relacion', 'd1d2']);
    let enunciado, opciones, conParrilla = false, texto = '', expl = '';
    if (tipo === 'cant_c' || tipo === 'cant_e') {
      const g = tipo === 'cant_c' ? A.gruposC : A.gruposE;
      enunciado = `Considerando los resultados del emparrillado, la cantidad de grupos resultantes del análisis de ${tipo === 'cant_c' ? 'las características' : 'los elementos'} es …`;
      opciones = ['1 grupo.', '2 grupos.', '3 grupos.', '4 grupos.'];
      if (g.length > 4) continue;
      expl = explicacionArbol(A, tipo === 'cant_c');
      return armar(x, enunciado, opciones, g.length, conParrilla, texto, expl);
    }
    if (tipo === 'grupos_c' || tipo === 'grupos_e') {
      const g = tipo === 'grupos_c' ? A.gruposC : A.gruposE;
      const pref = tipo === 'grupos_c' ? 'C' : 'E';
      const etiquetas = tipo === 'grupos_c' ? A.C : A.E;
      const ok = fmtGrupos(g);
      const dis = new Set();
      for (let k = 0; k < 30 && dis.size < 3; k++) {
        const per = mezclar(etiquetas); const cortes = azar(1, 3);
        const gg = []; let i = 0;
        for (let c = 0; c < cortes; c++) { const tam = azar(1, Math.max(1, per.length - i - (cortes - c - 1))); gg.push(per.slice(i, i + tam).sort()); i += tam; }
        if (i < per.length) gg.push(per.slice(i).sort());
        const f = fmtGrupos(gg.sort((a, b) => a[0].localeCompare(b[0])));
        if (f !== ok) dis.add(f);
      }
      if (dis.size < 3) continue;
      enunciado = `Considerando los resultados del emparrillado, los grupos resultantes del análisis de ${pref === 'C' ? 'las características' : 'los elementos'} son …`;
      opciones = mezclar([ok, ...[...dis].slice(0, 3)]);
      expl = explicacionArbol(A, pref === 'C');
      return armar(x, enunciado, opciones, opciones.indexOf(ok) + 1, conParrilla, texto, expl);
    }
    if (tipo === 'd1d2') {
      conParrilla = true;
      const [ci, cj] = mezclar([0, 1, 2, 3, 4]).slice(0, 2).sort();
      const cual = elegir(['1', '2']);
      const ki = `C${ci + 1}`, kj = `C${cj + 1}`;
      const v = E.dist(cual === '1' ? A.d1 : A.d2, ki, kj);
      const otro = E.dist(cual === '1' ? A.d2 : A.d1, ki, kj);
      const vals = [...new Set([v, otro, v + 1, v - 1, v + 2, v + 3])].filter(n => n >= 0);
      if (vals.length < 4) continue;
      opciones = mezclar([v, ...mezclar(vals.slice(1)).slice(0, 3)]).map(String);
      enunciado = `La d${cual} entre ${ki} y ${kj} es …`;
      const fi = x.grid[ci], fj = x.grid[cj];
      expl = cual === '1'
        ? `d1 compara la parrilla original contra la original: Σ|${ki} − ${kj}| = ${fi.map((a, e) => `|${a}−${fj[e]}|`).join(' + ')} = **${v}**.`
        : `d2 compara ${ki} original contra ${kj} en la parrilla OPUESTA (opuesto = ${x.max + 1} − valor): ${kj} opuesta = (${fj.map(b => x.max + 1 - b).join(', ')}). Σ = ${fi.map((a, e) => `|${a}−${x.max + 1 - fj[e]}|`).join(' + ')} = **${v}**.`;
      return armar(x, enunciado, opciones, opciones.indexOf(String(v)) + 1, conParrilla, texto, expl);
    }
    if (tipo === 'relacion') {
      // elegir par y patrón de flechas
      const tipoRel = elegir(['paralela', 'ortogonal', 'ambigua', 'no tipificada', 'no existe relación', 'recíproca']);
      let par = null;
      if (tipoRel === 'no existe relación' && A.gruposC.length > 1) {
        const g1 = A.gruposC[0], g2 = A.gruposC[1]; par = [elegir(g1), elegir(g2)];
      } else {
        const g = A.gruposC.filter(z => z.length >= 2); if (!g.length) continue;
        const gg = elegir(g); par = mezclar(gg).slice(0, 2);
      }
      par.sort((a, b) => +a.slice(1) - +b.slice(1));
      const ci = +par[0].slice(1) - 1, cj = +par[1].slice(1) - 1;
      let flechas;
      if (tipoRel === 'no existe relación' && A.gruposC.length > 1) flechas = elegir([[['A', 'X'], ['B', 'Y']], [['A', 'X']]]); // aunque el texto las relacione, están en grupos distintos
      else if (tipoRel === 'no existe relación') continue;
      else {
        const pats = tipoRel === 'no tipificada' ? [[['A', 'Y']], [['A', 'Y'], ['B', 'X']], [['X', 'B']], [['Y', 'A']], [['B', 'X']]] : E.PATRONES_RELACION[tipoRel];
        flechas = elegir(pats).map(p => (typeof p === 'string' ? p.split('>') : p));
      }
      const mismo = A.gruposC.some(z => z.includes(par[0]) && z.includes(par[1]));
      const esperado = E.tipoRelacion(flechas, mismo);
      const polo = p => ({ A: [ci, 0], B: [ci, 1], X: [cj, 0], Y: [cj, 1] }[p]);
      const oraciones = flechas.map(([d, a]) => { const [c1, p1] = polo(d), [c2, p2] = polo(a); return frase(dom, c1, p1, c2, p2); });
      // ruido: una oración sobre otro par de características
      const otros = [0, 1, 2, 3, 4].filter(k => k !== ci && k !== cj);
      const [o1, o2] = mezclar(otros);
      oraciones.push(frase(dom, o1, azar(0, 1), o2, azar(0, 1)));
      texto = `<p class="hoja" style="font-family:var(--serif);font-style:italic">${mezclar(oraciones).join(' ')}</p>`;
      enunciado = `Considerando los resultados del emparrillado, la relación establecida entre ${par[0]} y ${par[1]} es una …`;
      const todas = ['relación paralela.', 'relación recíproca.', 'relación ortogonal.', 'relación ambigua.', 'relación no tipificada.', 'no existe relación.'];
      const ok = esperado === 'no existe relación' ? 'no existe relación.' : `relación ${esperado}.`;
      opciones = mezclar([ok, ...mezclar(todas.filter(t => t !== ok)).slice(0, 3)]);
      const nombres = { A: `${dom.C[ci][0]} ${dom.C[ci][1]}`, B: `${dom.C[ci][0]} ${dom.C[ci][2]}`, X: `${dom.C[cj][0]} ${dom.C[cj][1]}`, Y: `${dom.C[cj][0]} ${dom.C[cj][2]}` };
      expl = `Grupos de características: ${fmtGrupos(A.gruposC)} ${mismo ? `${par[0]} y ${par[1]} están en el mismo grupo, así que se analiza el texto.` : `${par[0]} y ${par[1]} están en grupos distintos → **no existe relación**, diga lo que diga el texto.`}\n\n` +
        (mismo ? `Polos: A = ${nombres.A}, B = ${nombres.B} (${par[0]}); X = ${nombres.X}, Y = ${nombres.Y} (${par[1]}).\n\nFlechas que dice el texto: ${flechas.map(([d, a]) => `${d}→${a}`).join(', ')} → **${esperado}**.` : '');
      return armar(x, enunciado, opciones, opciones.indexOf(ok) + 1, false, texto, expl);
    }
  }
  throw new Error('No pude generar el emparrillado.');
}
function explicacionArbol(A, caracteristicas) {
  const arbol = caracteristicas ? A.arbolC : A.arbolE;
  const g = caracteristicas ? A.gruposC : A.gruposE;
  return `${caracteristicas ? 'Para características se usa min(d1, d2) de cada par. ' : ''}Fusiones por mínima distancia:\n\n` +
    arbol.pasos.map(p => `- nivel ${p.nivel}: ${p.une.map(u => '[' + u.join(', ') + ']').join(' + ')}`).join('\n') +
    `\n\nGrupos: ${fmtGrupos(g)} Recordá: si un ítem suelto se pega a un grupo ya formado, queda como grupo propio; y la unión de dos grupos no forma uno nuevo.`;
}
function armar(x, enunciado, opciones, correcta, conParrilla, texto, expl) {
  return { id: nuevoId('emp'), tipo: 'algo', unidad: 'u4-emparrillado', enunciado, opciones, correcta,
    extra: htmlEmparrillado(x, conParrilla) + texto, explicacion: expl, basada_en: [], ref: 'Ejercicio nuevo (parrilla aleatoria)' };
}

// =============== Algoritmos genéticos: ruleta ===============
function preguntaRuleta() {
  const n = azar(4, 5);
  const apt = Array.from({ length: n }, () => azar(2, 30) * 5);
  const total = apt.reduce((a, b) => a + b, 0), prom = total / n;
  const i = azar(0, n - 1);
  const tipo = elegir(['porcentaje', 'seleccion', 'copias']);
  const tabla = `<table class="matriz"><tr><th>Individuo</th>${apt.map((_, k) => `<th>I${k + 1}</th>`).join('')}</tr><tr><th>Aptitud</th>${apt.map(a => `<td>${a}</td>`).join('')}</tr></table>`;
  let enunciado, ok, dis, expl;
  const r2 = v => Math.round(v * 100) / 100;
  if (tipo === 'porcentaje') {
    ok = r2(100 * apt[i] / total);
    enunciado = `Usando el método de Ruleta, el porcentaje de participación (porción de la ruleta) del individuo I${i + 1} es …`;
    dis = [r2(100 / n), r2(100 * apt[i] / Math.max(...apt)), r2(apt[i] / prom * 10)];
    expl = `Porción = aptitud / total de aptitud = ${apt[i]} / ${total} = **${ok}%**.`;
    return armarAG(enunciado, [ok + '%', ...dis.map(d => d + '%')], tabla, expl);
  }
  if (tipo === 'seleccion') {
    ok = r2(apt[i] / prom);
    enunciado = `En el método de Control sobre Número Esperado, el valor de selección (aptitud / promedio) del individuo I${i + 1} es …`;
    dis = [r2(apt[i] / total), r2(prom / apt[i]), r2(apt[i] / Math.max(...apt))];
    expl = `Promedio = ${total} / ${n} = ${r2(prom)}. Valor de selección = ${apt[i]} / ${r2(prom)} = **${ok}**. La parte entera son las copias que pasan directo; con la parte decimal se hace la ruleta.`;
    return armarAG(enunciado, [ok, ...dis].map(String), tabla, expl);
  }
  const copias = apt.map(a => Math.floor(a / prom));
  ok = copias.reduce((a, b) => a + b, 0);
  enunciado = 'En el método de Control sobre Número Esperado, ¿cuántos individuos pasan directamente (por la parte entera del valor de selección), antes de completar con ruleta?';
  dis = [n, ok + 1, Math.max(0, ok - 1), apt.filter(a => a > prom).length + 1];
  expl = `Promedio = ${r2(prom)}. Valores de selección: ${apt.map((a, k) => `I${k + 1} = ${r2(a / prom)}`).join(', ')}. Partes enteras: ${copias.join(' + ')} = **${ok}**.`;
  return armarAG(enunciado, [ok, ...dis].map(String), tabla, expl);
}
function armarAG(enunciado, ops, extra, expl) {
  const ok = ops[0];
  const opciones = mezclar([ok, ...mezclar([...new Set(ops.slice(1))].filter(o => o !== ok)).slice(0, 3)]);
  if (opciones.length < 4) return preguntaRuleta();
  return { id: nuevoId('ag'), tipo: 'algo', unidad: 'u7-ag', enunciado, opciones, correcta: opciones.indexOf(ok) + 1, extra, explicacion: expl, basada_en: [], ref: 'Ejercicio nuevo (cálculo)' };
}

// =============== Métricas de clasificación ===============
function preguntaMetricas() {
  const VP = azar(10, 90), FN = azar(2, 40), FP = azar(2, 40), VN = azar(10, 200);
  const r = v => Math.round(v * 1000) / 10;
  const ex = r((VP + VN) / (VP + VN + FP + FN)), pr = r(VP / (VP + FP)), rc = r(VP / (VP + FN));
  const cual = elegir(['exactitud', 'precisión', 'recuperación']);
  const ok = { exactitud: ex, 'precisión': pr, 'recuperación': rc }[cual];
  const ops = [...new Set([ok, ex, pr, rc, r(VN / (VN + FP))])].filter(v => !isNaN(v));
  const opciones = mezclar([ok, ...mezclar(ops.filter(v => v !== ok)).slice(0, 3)]).map(v => v + '%');
  if (opciones.length < 4) return preguntaMetricas();
  return {
    id: nuevoId('ml'), tipo: 'algo', unidad: 'u8-rna',
    enunciado: `Un clasificador binario (positivo = "tiene la enfermedad") obtuvo esta matriz de confusión. Su ${cual} es …`,
    extra: `<table class="matriz"><tr><th></th><th>Predice +</th><th>Predice −</th></tr><tr><th>Real +</th><td>VP = ${VP}</td><td>FN = ${FN}</td></tr><tr><th>Real −</th><td>FP = ${FP}</td><td>VN = ${VN}</td></tr></table>`,
    opciones, correcta: opciones.indexOf(ok + '%') + 1,
    explicacion: `Exactitud = (VP+VN)/total = ${ex}%. Precisión = VP/(VP+FP) = ${pr}%. Recuperación (recall) = VP/(VP+FN) = ${rc}%. Pedían **${cual}** → ${ok}%.`,
    basada_en: [], ref: 'Ejercicio nuevo (cálculo)',
  };
}

// =============== Lógica difusa ===============
function preguntaDifusa() {
  const a = azar(1, 9) / 10, b = azar(1, 9) / 10;
  const op = elegir(['and', 'or', 'not']);
  const r = v => Math.round(v * 100) / 100;
  const ok = op === 'and' ? Math.min(a, b) : op === 'or' ? Math.max(a, b) : r(1 - a);
  const cand = [...new Set([ok, Math.min(a, b), Math.max(a, b), r(a * b), r(Math.min(1, a + b)), r(1 - a), r(1 - b), r(a + b - a * b), r(Math.abs(a - b)), r((a + b) / 2)])].filter(v => v !== ok);
  if (cand.length < 3) return preguntaDifusa();
  const opciones = mezclar([ok, ...mezclar(cand).slice(0, 3)]).map(String);
  const txt = { and: '“alta Y cara” (conjunción)', or: '“alta O cara” (disyunción)', not: '“NO alta” (negación)' }[op];
  return {
    id: nuevoId('ld'), tipo: 'algo', unidad: 'u9-logica',
    enunciado: `En Lógica Difusa, un producto tiene grado de pertenencia ${a} al conjunto "calidad alta" y ${b} al conjunto "precio caro". El grado de pertenencia a ${txt} es …`,
    opciones, correcta: opciones.indexOf(String(ok)) + 1,
    explicacion: 'Operadores difusos de la cátedra: conjunción (Y) = **mínimo**, disyunción (O) = **máximo**, negación = **1 − μ**. No son probabilidades: no se multiplican ni tienen que sumar 1.',
    basada_en: [], ref: 'Ejercicio nuevo (cálculo)',
  };
}

export const TIPOS_ALGORITMICOS = [
  { id: 'busqueda', unidad: 'u5-busqueda', nombre: 'Búsqueda sobre árbol aleatorio', fn: preguntaBusqueda },
  { id: 'emparrillado', unidad: 'u4-emparrillado', nombre: 'Emparrillado con parrilla aleatoria', fn: preguntaEmparrillado },
  { id: 'ruleta', unidad: 'u7-ag', nombre: 'Ruleta / número esperado', fn: preguntaRuleta },
  { id: 'metricas', unidad: 'u8-rna', nombre: 'Matriz de confusión', fn: preguntaMetricas },
  { id: 'difusa', unidad: 'u9-logica', nombre: 'Operadores difusos', fn: preguntaDifusa },
];
export function generarPreguntaAlgoritmica(tipo) { return tipo.fn(); }
