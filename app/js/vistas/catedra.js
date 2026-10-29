// Ejercicios de la cátedra: guías prácticas, ejercicios resueltos en clase y recuperatorio.
import * as P from '../progreso.js';
import * as D from '../datos.js';
import { h } from '../componentes.js';
import * as B from '../motores/busqueda.js';
import * as E from '../motores/emparrillado.js';
import { svgArbol, tablaMatriz } from '../motores/dibujo.js';

const FUENTE = {
  oficial: ['ok', 'Resolución oficial'],
  calculada: ['', 'Resolución calculada por el motor'],
  propuesta: ['ia', 'Resolución propuesta por IA'],
};
const TIPO = { protocolo: 'Análisis de Protocolos', emparrillado: 'Emparrillado', busqueda: 'Métodos de Búsqueda', texto: 'Otros' };
const ESTADO = { hecho: ['ok', 'hecho solo'], ayuda: ['', 'hecho con ayuda'] };
const md = s => (window.marked ? window.marked.parse(s) : s);
const INF = 1e9;
const fmtH = v => (v === null || v === undefined ? '' : v >= INF ? '∞' : v);

function arbolMotor(a) {
  // el JSON usa 1e9 para ∞; el motor trabaja con números comunes
  return { ...a, nodos: Object.fromEntries(Object.entries(a.nodos).map(([k, v]) => [k, { ...v, h: v.h === null ? 0 : v.h }])) };
}

export function vistaCatedra(main) {
  const ejs = D.CATEDRA.ejercicios;
  const cont = h('div', { class: 'columna' },
    h('h1', {}, 'Ejercicios de la cátedra'),
    h('p', { class: 'bajada' }, 'Las guías prácticas, los ejercicios resueltos en clase y el recuperatorio. Cada uno dice de dónde sale y qué tipo de resolución tiene: oficial (de la cátedra), calculada (por el motor, que coincide con todas las resoluciones oficiales) o propuesta (escrita por IA siguiendo el formato oficial).'));
  for (const tipo of ['protocolo', 'emparrillado', 'busqueda', 'texto']) {
    const lista = ejs.filter(e => e.tipo === tipo);
    if (!lista.length) continue;
    const hechos = lista.filter(e => P.estadoCatedra(e.id)).length;
    const t = h('table', { class: 'tabla' }, h('thead', {}, h('tr', {}, h('th', {}, 'Ejercicio'), h('th', {}, 'De dónde sale'), h('th', {}, 'Resolución'), h('th', {}, 'Tu estado'))));
    const tb = h('tbody');
    for (const e of lista) {
      const st = P.estadoCatedra(e.id), [cls, txt] = FUENTE[e.fuente];
      tb.append(h('tr', {},
        h('td', {}, h('a', { href: `#/catedra/${e.id}` }, e.titulo)),
        h('td', { class: 'chico suave' }, e.origen),
        h('td', {}, h('span', { class: 'etiqueta ' + cls }, txt)),
        h('td', {}, st ? h('span', { class: 'etiqueta ' + ESTADO[st][0] }, ESTADO[st][1]) : h('span', { class: 'suave chico' }, 'pendiente'))));
    }
    t.append(tb);
    cont.append(h('h2', {}, `${TIPO[tipo]} (${hechos} de ${lista.length} hechos)`), h('div', { class: 'envoltura-tabla' }, t));
  }
  main.append(cont);
}

export function vistaEjercicio(main, id) {
  const e = D.CATEDRA.ejercicios.find(x => x.id === id);
  if (!e) { main.append(h('p', { class: 'vacio' }, 'No existe ese ejercicio.')); return; }
  const [cls, txt] = FUENTE[e.fuente];
  const cont = h('div', { class: 'columna' },
    h('p', { class: 'chico suave', style: 'margin:0 0 4px' }, h('a', { href: '#/catedra' }, 'Ejercicios de la cátedra'), ` / ${TIPO[e.tipo]}`),
    h('h1', {}, e.titulo),
    h('p', { class: 'suave chico' }, e.origen, ' · ', h('span', { class: 'etiqueta ' + cls }, txt)),
    e.nota_fuente ? h('p', { class: 'chico suave' }, e.nota_fuente) : null,
    h('div', { class: 'teoria', html: md(e.enunciado) }));
  main.append(cont);
  let ayuda = false;
  const usarAyuda = () => { ayuda = true; };
  if (e.tipo === 'busqueda') ejercicioBusqueda(cont, e, usarAyuda);
  else if (e.tipo === 'emparrillado') ejercicioEmparrillado(cont, e, usarAyuda);
  else if (e.tipo === 'protocolo') ejercicioProtocolo(cont, e, usarAyuda);
  else cont.append(botonRevelar('Ver resolución', () => h('div', { class: 'teoria hoja', html: md(e.resolucion) }), usarAyuda));
  const st = P.estadoCatedra(id);
  cont.append(h('div', { class: 'acciones' },
    h('button', { class: 'boton', type: 'button', onclick: () => { P.marcarCatedra(id, ayuda ? 'ayuda' : 'hecho'); location.hash = '#/catedra'; } }, 'Marcar como hecho'),
    st ? h('span', { class: 'suave chico', style: 'align-self:center' }, `Ya lo marcaste: ${ESTADO[st][1]}.`) : null));
}

function botonRevelar(texto, crear, alUsar) {
  const zona = h('div');
  const b = h('button', { class: 'boton secundario', type: 'button' }, texto);
  b.addEventListener('click', () => { if (alUsar) alUsar(); zona.innerHTML = ''; zona.append(crear()); b.remove(); });
  return h('div', {}, b, zona);
}

// ---------------- Búsqueda ----------------
const norm = s => s.toUpperCase().replace(/\s+/g, '').replace(/[.;]/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
function ejercicioBusqueda(cont, e, usarAyuda) {
  const t = arbolMotor(e.arbol);
  const dib = JSON.parse(JSON.stringify(e.arbol));
  for (const k in dib.nodos) dib.nodos[k].h = fmtH(dib.nodos[k].h);
  cont.append(h('div', { class: 'lienzo', html: svgArbol(dib) }));
  cont.append(h('p', { class: 'chico suave' }, `Cuanto ${t.mejor} es el valor heurístico, más deseable es el nodo. Soluciones: ${Object.keys(t.nodos).filter(k => t.nodos[k].sol).join(' y ')}.`));
  if (e.oficial) cont.append(botonRevelar('Ver la resolución oficial', () => h('div', { class: 'hoja' }, e.oficial), usarAyuda));
  const pest = h('div', { class: 'acciones' });
  const zona = h('div');
  cont.append(h('h2', {}, 'Resolvelo vos'), pest, zona);
  e.consignas.forEach((k, i) => {
    const b = h('button', { class: 'boton secundario', type: 'button' }, B.METODOS[k].nombre);
    b.addEventListener('click', () => { pest.querySelectorAll('button').forEach(x => x.classList.add('secundario')); b.classList.remove('secundario'); mostrar(k); });
    pest.append(b);
    if (i === 0) setTimeout(() => b.click());
  });
  function mostrar(k) {
    zona.innerHTML = '';
    const r = B.METODOS[k].fn(t);
    if (r.iteraciones) {
      zona.append(h('p', { class: 'suave' }, 'Completá cada iteración. Las listas se escriben separadas por comas; en abiertos, con el valor entre paréntesis: C(3), B(5). Para A* escribí el valor de f ya sumado.'));
      const tabla = h('table', { class: 'tabla tabla-iter' }, h('thead', {}, h('tr', {}, h('th', {}, 'It.'), h('th', {}, 'Nodo actual'), h('th', {}, '¿Solución?'), h('th', {}, 'Abiertos'), h('th', {}, 'Cerrados'), h('th', {}, ''))));
      const tb = h('tbody');
      for (const it of r.iteraciones) {
        const inA = h('input', { type: 'text', size: 3, 'aria-label': `Nodo actual iteración ${it.num}` });
        const inS = h('select', { 'aria-label': `¿Es solución? iteración ${it.num}` }, h('option', { value: '' }, '—'), h('option', { value: 'no' }, 'no'), h('option', { value: 'si' }, 'sí'));
        const inO = h('input', { type: 'text', size: 26, 'aria-label': `Abiertos iteración ${it.num}` });
        const inC = h('input', { type: 'text', size: 18, 'aria-label': `Cerrados iteración ${it.num}` });
        const res = h('span', { class: 'chico' });
        const ab = it.abiertos.map(a => `${a.n}(${fmtH(a.v)})`).join(', ');
        const ok = () => {
          const bien = [norm(inA.value) === it.actual, inS.value === (it.esSolucion ? 'si' : 'no'), norm(inO.value) === norm(ab), norm(inC.value) === norm(it.cerrados.join(','))];
          [inA, inS, inO, inC].forEach((el, i) => { el.style.borderColor = bien[i] ? 'var(--resaltador-texto)' : 'var(--rojo)'; });
          res.textContent = bien.every(Boolean) ? 'bien' : 'revisá lo marcado en rojo';
        };
        const ver = () => { usarAyuda(); inA.value = it.actual; inS.value = it.esSolucion ? 'si' : 'no'; inO.value = ab || '(vacía)'; inC.value = it.cerrados.join(', '); ok(); };
        tb.append(h('tr', {}, h('td', { 'data-l': 'Iteración' }, it.num), h('td', { 'data-l': 'Actual' }, inA), h('td', { 'data-l': '¿Solución?' }, inS), h('td', { 'data-l': 'Abiertos' }, inO), h('td', { 'data-l': 'Cerrados' }, inC),
          h('td', { class: 'acc' }, h('button', { class: 'boton secundario', type: 'button', onclick: ok }, 'Comprobar'), ' ', h('button', { class: 'boton secundario', type: 'button', onclick: ver }, 'Ver'), ' ', res)));
      }
      tabla.append(tb);
      zona.append(h('div', { class: 'envoltura-tabla' }, tabla));
      zona.append(botonRevelar('¿Dónde termina?', () => h('p', {}, r.solucion ? `Termina en la solución ${r.solucion}.` : 'No llega a ninguna solución.'), usarAyuda));
    } else {
      const campos = [];
      if (r.generados) campos.push(['Nodos generados', r.generados]);
      campos.push([r.generados ? 'Nodos visitados' : 'Recorrido (nodos visitados en orden)', r.visitados || r.recorrido]);
      for (const [lab, val] of campos) {
        const inp = h('input', { type: 'text', size: 50, 'aria-label': lab });
        const res = h('span', { class: 'chico' });
        const ok = () => { const b = norm(inp.value) === norm(val.join(',')); inp.style.borderColor = b ? 'var(--resaltador-texto)' : 'var(--rojo)'; res.textContent = b ? 'bien' : 'no coincide'; };
        zona.append(h('div', { class: 'fila', style: 'margin:10px 0' }, h('label', { class: 'campo' }, lab, inp),
          h('button', { class: 'boton secundario', type: 'button', onclick: ok }, 'Comprobar'),
          h('button', { class: 'boton secundario', type: 'button', onclick: () => { usarAyuda(); inp.value = val.join(', '); ok(); } }, 'Ver'), res));
      }
      zona.append(botonRevelar('¿Llega a una solución?', () => h('p', {}, r.solucion ? `Sí, llega a ${r.solucion}.` : 'No llega a ninguna solución: se detiene porque ningún hijo mejora al nodo actual (o recorrió todo).'), usarAyuda));
    }
  }
}

// ---------------- Emparrillado ----------------
function ejercicioEmparrillado(cont, e, usarAyuda) {
  const A = E.analizar(e.grid ? { grid: e.grid, max: e.max } : { matrizE: { 'E1-E2': 0 }, matrizC: e.matrizC });
  // datos
  const nombres = h('div', { class: 'fila', style: 'align-items:start;gap:30px' },
    e.elementos.length ? h('div', {}, h('b', {}, 'Elementos'), h('br'), ...e.elementos.flatMap((x, i) => [`E${i + 1}: ${x}`, h('br')])) : null,
    h('div', {}, h('b', {}, 'Características'), h('br'), ...e.caracteristicas.flatMap((c, i) => [`C${i + 1}: ${c[0]} (${c[1]} / ${c[2]})`, h('br')])));
  cont.append(h('div', { class: 'hoja' }, nombres));
  if (e.grid) {
    cont.append(h('p', { class: 'chico' }, `Parrilla, escala [1, ${e.max}]:`), h('div', { html: tablaGrid(e.grid) }));
  } else {
    cont.append(h('p', { class: 'chico' }, 'Matriz de distancias entre características (d1 arriba de la diagonal, d2 abajo):'),
      h('div', { html: tablaMatriz(A.C, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.d1, a, b) : E.dist(A.d2, a, b))) }));
  }
  if (e.texto) cont.append(h('p', { class: 'hoja', style: 'font-family:var(--serif);font-style:italic' }, e.texto));

  cont.append(h('h2', {}, 'Resolvelo vos'));
  if (e.grid && e.elementos.length) {
    cont.append(h('h3', {}, '1. Matriz de distancias entre elementos'), matrizInput(A.E, (a, b) => E.dist(A.dE, a, b), usarAyuda));
    cont.append(h('h3', {}, '2. Parrilla opuesta y distancias d1 / d2'),
      botonRevelar('Ver la parrilla opuesta', () => h('div', { html: tablaGrid(e.grid.map(f => f.map(v => e.max + 1 - v))) }), usarAyuda),
      h('p', { class: 'chico suave' }, 'Completá d1 arriba de la diagonal y d2 abajo.'),
      matrizInput(A.C, (a, b) => (+a.slice(1) < +b.slice(1) ? E.dist(A.d1, a, b) : E.dist(A.d2, a, b)), usarAyuda, true));
  }
  cont.append(h('h3', {}, '3. Árboles y grupos'));
  if (e.elementos.length && e.grid) cont.append(campoGrupos('Grupos de elementos', A.gruposE, A.arbolE, usarAyuda));
  cont.append(campoGrupos('Grupos de características', A.gruposC, A.arbolC, usarAyuda));
  cont.append(h('h3', {}, '4. Red de relaciones entre características'),
    h('p', { class: 'chico suave' }, 'Para cada par, elegí el tipo de relación. Solo se relacionan características del mismo grupo.'));
  for (const r of e.relaciones || []) {
    const mismo = A.gruposC.some(g => g.includes(r.ci) && g.includes(r.cj));
    const esperado = E.tipoRelacion(r.flechas, mismo);
    const sel = h('select', {}, h('option', { value: '' }, 'elegí…'), ...['paralela', 'recíproca', 'ortogonal', 'ambigua', 'no tipificada', 'no existe relación'].map(x => h('option', { value: x }, x)));
    const res = h('div', { class: 'chico' });
    const ci = e.caracteristicas[+r.ci.slice(1) - 1], cj = e.caracteristicas[+r.cj.slice(1) - 1];
    const explicar = () => {
      res.innerHTML = '';
      const polos = `A = ${ci[1]}, B = ${ci[2]} (${r.ci}); X = ${cj[1]}, Y = ${cj[2]} (${r.cj})`;
      res.append(h('p', {}, sel.value ? (sel.value === esperado ? 'Bien. ' : `No: es ${esperado}. `) : `Es ${esperado}. `,
        mismo ? `Polos: ${polos}. Flechas del texto: ${r.flechas.map(([a, b]) => `${a}→${b}`).join(', ')}: ${r.explicacion}` : 'Están en grupos distintos, así que no se analizan juntas.'));
    };
    sel.addEventListener('change', explicar);
    cont.append(h('div', { class: 'hoja fila', style: 'margin:8px 0' }, h('b', {}, `${r.ci} (${ci[0]}) y ${r.cj} (${cj[0]})`), sel,
      h('button', { class: 'boton secundario', type: 'button', onclick: () => { usarAyuda(); explicar(); } }, 'Ver'), res));
  }
}
function tablaGrid(grid) {
  let s = '<table class="matriz"><tr><th></th>' + grid[0].map((_, i) => `<th>E${i + 1}</th>`).join('') + '</tr>';
  grid.forEach((f, i) => { s += `<tr><th>C${i + 1}</th>${f.map(v => `<td>${v}</td>`).join('')}</tr>`; });
  return s + '</table>';
}
function matrizInput(etqs, valor, usarAyuda, completa = false) {
  const t = h('table', { class: 'matriz' });
  t.append(h('tr', {}, h('th'), ...etqs.map(x => h('th', {}, x))));
  const inputs = [];
  for (const a of etqs) {
    const tr = h('tr', {}, h('th', {}, a));
    for (const b of etqs) {
      if (a === b) { tr.append(h('td', { class: 'diag' })); continue; }
      const arriba = +a.slice(1) < +b.slice(1);
      if (!arriba && !completa) { tr.append(h('td')); continue; }
      const inp = h('input', { type: 'text', inputmode: 'numeric', 'aria-label': `${a}-${b}` });
      inputs.push([inp, valor(a, b)]);
      tr.append(h('td', {}, inp));
    }
    t.append(tr);
  }
  const res = h('span', { class: 'chico' });
  const ok = () => { let bien = 0; for (const [inp, v] of inputs) { const b = String(v) === inp.value.trim(); inp.style.borderColor = b ? 'var(--resaltador-texto)' : 'var(--rojo)'; if (b) bien++; } res.textContent = `${bien} de ${inputs.length} bien`; };
  return h('div', {}, t, h('div', { class: 'acciones' },
    h('button', { class: 'boton secundario', type: 'button', onclick: ok }, 'Comprobar'),
    h('button', { class: 'boton secundario', type: 'button', onclick: () => { usarAyuda(); inputs.forEach(([i, v]) => { i.value = v; }); ok(); } }, 'Ver'), res));
}
function campoGrupos(lab, grupos, arbol, usarAyuda) {
  const inp = h('input', { type: 'text', size: 40, placeholder: '(E1, E3); (E2, E4)' });
  const res = h('div', { class: 'chico' });
  const parse = s => { const out = []; const re = /\(([^)]*)\)|\b([EC]\d)\b/gi; let m; while ((m = re.exec(s))) out.push(m[1] ? (m[1].match(/[EC]\d/gi) || []).map(x => x.toUpperCase()) : [m[2].toUpperCase()]); return out; };
  const key = g => g.map(x => x.slice().sort().join(',')).sort().join('|');
  const pasos = () => arbol.pasos.map(p => `nivel ${p.nivel}: ${p.une.map(u => '[' + u.join(', ') + ']').join(' + ')}`).join(' · ');
  const ok = () => { const b = key(parse(inp.value)) === key(grupos); inp.style.borderColor = b ? 'var(--resaltador-texto)' : 'var(--rojo)'; res.textContent = b ? `Bien: ${grupos.length} grupo(s).` : 'No coincide.'; };
  return h('div', { class: 'fila', style: 'margin:8px 0' }, h('label', { class: 'campo' }, lab, inp),
    h('button', { class: 'boton secundario', type: 'button', onclick: ok }, 'Comprobar'),
    h('button', { class: 'boton secundario', type: 'button', onclick: () => { usarAyuda(); inp.value = grupos.map(g => '(' + g.join(', ') + ')').join('; '); ok(); res.textContent += ' Árbol: ' + pasos(); } }, 'Ver'), res);
}

// ---------------- Protocolos ----------------
// ---------- Marcado interactivo de la transcripción ----------
const TIPOS_AP = [
  ['concepto', 'Concepto'], ['caracteristica', 'Característica'], ['valor', 'Valor'], ['relacion', 'Relación'],
  ['operador', 'Operador'], ['sinonimo', 'Sinónimo'], ['metacomentario', 'Metacomentario'], ['incertidumbre', 'Incertidumbre'],
];
let anotaciones = null;
async function cargarAnotaciones() {
  if (!anotaciones) { try { anotaciones = JSON.parse(await D.texto('protocolos_anotados.json')).ejercicios; } catch { anotaciones = {}; } }
  return anotaciones;
}
function marcadoProtocolo(zona, e, usarAyuda) {
  cargarAnotaciones().then(an => {
    const clave = an[e.id];
    if (!clave || clave.length !== e.lineas.length) {
      zona.append(h('h2', {}, 'Transcripción'), h('div', { class: 'hoja' }, h('ol', { class: 'transcripcion' }, ...e.lineas.map(l => h('li', {}, l)))));
      return;
    }
    const elegidos = e.lineas.map(() => new Set());
    const previo = P.marcadoProtocolo(e.id);
    const res = h('div', { class: 'marcado-res', 'aria-live': 'polite' });
    const filas = e.lineas.map((l, i) => {
      const chips = TIPOS_AP.map(([k, t]) => {
        const b = h('button', { class: 'chip-ap tipo-' + k, type: 'button', 'aria-pressed': 'false' }, t);
        b.addEventListener('click', () => {
          if (fila.classList.contains('corregida')) return;
          const on = !elegidos[i].has(k); on ? elegidos[i].add(k) : elegidos[i].delete(k);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        b.dataset.k = k;
        return b;
      });
      const nota = h('p', { class: 'nota-linea', hidden: true });
      const fila = h('li', { class: 'linea-ap' },
        h('span', { class: 'num-linea' }, String(i + 1)),
        h('div', { class: 'linea-cuerpo' }, h('p', { class: 'linea-texto' }, l), h('div', { class: 'chips-ap', role: 'group', 'aria-label': `Elementos de la línea ${i + 1}` }, ...chips), nota));
      fila._chips = chips; fila._nota = nota;
      return fila;
    });
    const btnCorr = h('button', { class: 'boton', type: 'button' }, 'Corregir el marcado');
    const btnOtra = h('button', { class: 'boton secundario', type: 'button', hidden: true }, 'Volver a intentar');
    const btnVer = h('button', { class: 'boton secundario', type: 'button' }, 'Mostrar la respuesta');
    function corregir(mostrandoRespuesta) {
      let perfectas = 0;
      filas.forEach((f, i) => {
        const ok = new Set(clave[i].tipos);
        if (mostrandoRespuesta) { elegidos[i] = new Set(ok); }
        let bien = true;
        f._chips.forEach(c => {
          const k = c.dataset.k, sel = elegidos[i].has(k), deb = ok.has(k);
          c.classList.toggle('acierto', sel && deb);
          c.classList.toggle('falto', !sel && deb);
          c.classList.toggle('sobra', sel && !deb);
          c.setAttribute('aria-pressed', sel ? 'true' : 'false');
          if (sel !== deb) bien = false;
        });
        if (bien) perfectas++;
        f.classList.add('corregida'); f.classList.toggle('mal', !bien);
        f._nota.textContent = clave[i].nota; f._nota.hidden = false;
      });
      if (mostrandoRespuesta) usarAyuda(); else P.registrarMarcadoProtocolo(e.id, perfectas, filas.length);
      res.innerHTML = '';
      res.append(h('div', { class: 'hoja resultado-marcado' },
        h('b', {}, mostrandoRespuesta ? 'Esta es la respuesta, línea por línea.' : `${perfectas} de ${filas.length} líneas perfectas (${Math.round(100 * perfectas / filas.length)}%).`),
        h('p', { class: 'chico suave' }, 'En verde lo que marcaste bien, con borde punteado lo que faltó y tachado lo que sobra. Debajo de cada línea está el porqué. Después armá la tabla CCV y las reglas abajo.')));
      btnCorr.hidden = true; btnVer.hidden = true; btnOtra.hidden = false;
    }
    btnCorr.addEventListener('click', () => corregir(false));
    btnVer.addEventListener('click', () => corregir(true));
    btnOtra.addEventListener('click', () => {
      filas.forEach((f, i) => { elegidos[i].clear(); f.classList.remove('corregida', 'mal'); f._nota.hidden = true; f._chips.forEach(c => { c.classList.remove('acierto', 'falto', 'sobra'); c.setAttribute('aria-pressed', 'false'); }); });
      res.innerHTML = ''; btnCorr.hidden = false; btnVer.hidden = false; btnOtra.hidden = true;
    });
    zona.append(h('h2', {}, 'Paso 1: marcá la transcripción'),
      h('p', { class: 'suave' }, 'Para cada línea, tocá qué elementos del protocolo tiene (puede ser más de uno o ninguno). Después corregí: la app compara con la resolución del ejercicio.',
        previo ? ` Tu último intento: ${previo.bien} de ${previo.total} líneas perfectas.` : ''),
      h('div', { class: 'leyenda-ap' }, ...TIPOS_AP.map(([k, t]) => h('span', { class: 'chip-ap tipo-' + k, 'aria-hidden': 'true' }, t))),
      h('ol', { class: 'lineas-ap' }, ...filas),
      h('div', { class: 'acciones' }, btnCorr, btnVer, btnOtra), res,
      h('p', { class: 'firma' }, 'Corrección armada con IA a partir de la resolución del ejercicio (' + (e.fuente === 'oficial' ? 'oficial de la cátedra' : 'propuesta siguiendo el formato oficial') + ').'));
  });
}

function ejercicioProtocolo(cont, e, usarAyuda) {
  const zonaMarcado = h('div');
  cont.append(zonaMarcado);
  marcadoProtocolo(zonaMarcado, e, usarAyuda);
  const clave = 'ia-notas-' + e.id;
  let previo = P.nota(clave);
  if (!previo) { try { previo = localStorage.getItem(clave) || ''; } catch { /* sin almacenamiento */ } }
  const notas = h('textarea', { rows: 10, style: 'width:100%', placeholder: 'Escribí acá tu tabla CCV, relaciones, sinónimos, metacomentarios, incertidumbres y reglas. Se guarda con tu progreso.' }, previo);
  notas.addEventListener('input', () => P.setNota(clave, notas.value));
  cont.append(h('h2', {}, 'Paso 2: tu análisis completo'),
    h('p', { class: 'chico suave' }, 'Seguí las etapas: tabla de conceptos-características-valores, relaciones implícitas, búsqueda (estados y operadores), sinónimos, metacomentarios, incertidumbres y reglas.'),
    notas,
    h('h2', {}, 'Resolución'),
    botonRevelar('Ver la resolución', () => h('div', { class: 'teoria hoja', html: md(e.resolucion) }), usarAyuda));
}
