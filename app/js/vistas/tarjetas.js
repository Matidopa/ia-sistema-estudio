// Tarjetas de memoria: definiciones, convenciones y trampas que más se toman, con repaso espaciado.
import * as P from '../progreso.js';
import * as D from '../datos.js';
import { h } from '../componentes.js';

const DIA = 24 * 3600 * 1000;
const INTERVALO = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };
let mazo = null;
async function cargarMazo() {
  if (!mazo) mazo = JSON.parse(await D.texto('tarjetas.json')).tarjetas;
  return mazo;
}
const estado = id => ((P.get().tarjetas || {})[id]) || null;
function responder(id, sabia) {
  const d = P.get();
  d.tarjetas = d.tarjetas || {};
  const e = d.tarjetas[id] || { caja: 1, vistas: 0 };
  e.vistas++;
  e.caja = sabia ? Math.min(5, e.caja + 1) : 1;
  e.proxima = Date.now() + INTERVALO[e.caja] * DIA;
  d.tarjetas[id] = e;
  P.guardar();
}
const md = s => (window.marked ? window.marked.parseInline(s) : s);

let teclas = null;
document.addEventListener('keydown', e => {
  if (!teclas || !document.body.contains(teclas.raiz)) { teclas = null; return; }
  if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); teclas.girar(); }
  else if (e.key === '1') teclas.marcar(false);
  else if (e.key === '2') teclas.marcar(true);
});

export async function vistaTarjetas(main, q) {
  const todas = await cargarMazo();
  const prm = Object.fromEntries(new URLSearchParams((q || '').replace(/^\?/, '')));
  const uid = prm.u || '';
  const ahora = Date.now();
  const delTema = todas.filter(t => !uid || t.unidad === uid);
  const vencidas = delTema.filter(t => { const e = estado(t.id); return e && e.caja < 5 && e.proxima <= ahora; });
  const nuevas = delTema.filter(t => !estado(t.id));
  const sabidas = delTema.filter(t => { const e = estado(t.id); return e && e.caja >= 3; }).length;
  const unidades = [...new Set(todas.map(t => t.unidad))].map(id => D.unidad(id)).filter(Boolean).sort((a, b) => a.num - b.num);
  const sel = h('select', { 'aria-label': 'Tema' }, h('option', { value: '' }, 'Todos los temas'), ...unidades.map(u => h('option', { value: u.id, selected: u.id === uid }, `${u.num}. ${u.corto}`)));
  sel.addEventListener('change', () => { location.hash = sel.value ? `#/tarjetas?u=${sel.value}` : '#/tarjetas'; });
  const col = h('div', { class: 'columna texto' },
    h('h1', {}, 'Tarjetas de memoria'),
    h('p', { class: 'bajada' }, 'Las definiciones, convenciones y trampas que más se toman, para fijarlas en ratos cortos. Pensá la respuesta, dá vuelta la tarjeta y sé honesto: las que no sabías vuelven pronto, las que sabías tardan cada vez más.'),
    h('div', { class: 'hoja fila tarjetas-cabeza' }, h('label', { class: 'campo' }, 'Tema', sel),
      h('div', { class: 'chips' }, h('span', { class: 'chip' }, `${vencidas.length} para repasar`), h('span', { class: 'chip' }, `${nuevas.length} nuevas`), h('span', { class: 'chip' }, `${sabidas} de ${delTema.length} sabidas`))));
  main.append(col);
  const tanda = [...vencidas, ...nuevas].slice(0, 20);
  if (!tanda.length) {
    col.append(h('div', { class: 'vacio' }, '¡Al día! No tenés tarjetas para repasar en este tema. Volvé mañana o elegí otro tema.'));
    return;
  }
  let i = 0, bien = 0, girada = false;
  const zona = h('div', { class: 'zona-tarjeta' });
  const raiz = h('section', { class: 'sesion-tarjetas' }, zona,
    h('p', { class: 'pista-teclado' }, h('kbd', {}, 'Espacio'), ' da vuelta · ', h('kbd', {}, '1'), ' no la sabía · ', h('kbd', {}, '2'), ' la sabía'));
  col.append(raiz);
  function pintar() {
    zona.innerHTML = '';
    if (i >= tanda.length) {
      zona.append(h('div', { class: 'hoja resultado' }, h('div', {},
        h('h3', {}, `Listo: ${bien} de ${tanda.length} te las sabías.`),
        h('p', { class: 'suave' }, 'Las que no sabías vuelven en el próximo repaso.'),
        h('div', { class: 'acciones' }, h('button', { class: 'boton', type: 'button', onclick: () => dispatchEvent(new HashChangeEvent('hashchange')) }, 'Otra tanda'), h('a', { class: 'boton secundario', href: '#/' }, 'Volver al inicio')))));
      teclas = null;
      return;
    }
    const t = tanda[i], u = D.unidad(t.unidad);
    girada = false;
    const carta = h('button', { class: 'carta', type: 'button', 'aria-label': 'Dar vuelta la tarjeta' },
      h('span', { class: 'cara frente' }, h('span', { class: 'carta-tema' }, u ? u.corto : ''), h('span', { class: 'carta-texto', html: md(t.frente) }), h('span', { class: 'carta-pista' }, 'Tocá para ver la respuesta')),
      h('span', { class: 'cara dorso' }, h('span', { class: 'carta-tema' }, 'Respuesta'), h('span', { class: 'carta-texto', html: md(t.dorso) })));
    carta.addEventListener('click', girar);
    const botones = h('div', { class: 'acciones botones-carta', hidden: true },
      h('button', { class: 'boton secundario no-sabia', type: 'button', onclick: () => marcar(false) }, 'No la sabía ', h('kbd', {}, '1')),
      h('button', { class: 'boton si-sabia', type: 'button', onclick: () => marcar(true) }, 'La sabía ', h('kbd', {}, '2')));
    zona.append(h('p', { class: 'contador' }, `${i + 1} de ${tanda.length}`), carta, botones);
  }
  function girar() {
    const c = zona.querySelector('.carta'); if (!c) return;
    girada = !girada; c.classList.toggle('girada', girada);
    zona.querySelector('.botones-carta').hidden = !girada;
  }
  function marcar(sabia) {
    if (!girada || i >= tanda.length) return;
    responder(tanda[i].id, sabia); if (sabia) bien++;
    i++; pintar();
  }
  teclas = { raiz, girar, marcar };
  pintar();
}

export async function tarjetasPendientes() {
  try { const t = await cargarMazo(); const ahora = Date.now(); return t.filter(x => { const e = estado(x.id); return e && e.caja < 5 && e.proxima <= ahora; }).length; } catch { return 0; }
}
