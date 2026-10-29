// Sesión de preguntas de a una con corrección inmediata, atajos de teclado y resultado al final.
import { h, tarjetaPregunta } from '../componentes.js';
import * as D from '../datos.js';

// Atajos globales: solo la última sesión montada los escucha.
let activa = null;
document.addEventListener('keydown', e => {
  if (!activa || !document.body.contains(activa.raiz)) { activa = null; return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
  if (/^[1-4]$/.test(e.key)) { if (activa.elegir(+e.key)) e.preventDefault(); }
  else if (e.key === 'Enter') { if (activa.avanzar()) e.preventDefault(); }
});

export function pistaTeclado() {
  return h('p', { class: 'pista-teclado' }, 'Atajos: ', h('kbd', {}, '1'), '–', h('kbd', {}, '4'), ' para responder · ', h('kbd', {}, 'Enter'), ' para seguir');
}

// pool: preguntas. opciones: { vacio, onFin({bien,total,erradas}), accionesFin(resultado) => [nodos], origen }
export function sesion(cont, pool, { vacio = 'No hay preguntas con ese filtro.', onFin = null, accionesFin = null, origen = null, titulo = null } = {}) {
  if (!pool.length) { cont.append(h('div', { class: 'vacio' }, vacio)); return null; }
  let i = 0, bien = 0;
  const resultados = []; // true/false por pregunta
  const raiz = h('section', { class: 'sesion', 'aria-label': titulo || 'Sesión de preguntas' });
  const puntos = h('ol', { class: 'puntos', 'aria-hidden': 'true' }, ...pool.map(() => h('li')));
  const contador = h('span', { class: 'contador' });
  const cabeza = h('div', { class: 'sesion-cabeza' }, contador, puntos);
  const zona = h('div', { class: 'sesion-zona' }), pie = h('div', { class: 'acciones sesion-pie' });
  raiz.append(cabeza, zona, pie, pistaTeclado());
  cont.append(raiz);
  let tarjeta = null, btnSig = null;

  function pintarCabeza() {
    contador.textContent = `${Math.min(i + 1, pool.length)} de ${pool.length}`;
    [...puntos.children].forEach((li, k) => {
      li.className = k < resultados.length ? (resultados[k] ? 'ok' : 'mal') : k === i ? 'actual' : '';
    });
  }
  function mostrar() {
    zona.innerHTML = ''; pie.innerHTML = ''; btnSig = null;
    pintarCabeza();
    const p = pool[i];
    tarjeta = tarjetaPregunta(p, { modo: 'inmediato', origen, onRespuesta: (id, n, c) => {
      resultados.push(n === c);
      if (n === c) bien++;
      pintarCabeza();
      btnSig = i + 1 < pool.length
        ? h('button', { class: 'boton', type: 'button', onclick: () => { i++; mostrar(); arriba(); } }, 'Siguiente ', h('kbd', {}, 'Enter'))
        : h('button', { class: 'boton', type: 'button', onclick: fin }, 'Ver resultado ', h('kbd', {}, 'Enter'));
      pie.append(btnSig);
      btnSig.focus({ preventScroll: true });
    } });
    zona.append(tarjeta);
  }
  function arriba() {
    const top = raiz.getBoundingClientRect().top + window.scrollY - 12;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }
  function fin() {
    activa = null;
    const erradas = pool.filter((p, k) => resultados[k] === false);
    const res = { bien, total: pool.length, erradas };
    raiz.innerHTML = '';
    const frac = bien / pool.length;
    raiz.append(h('div', { class: 'hoja resultado' },
      anillo(frac, `${bien}/${pool.length}`),
      h('div', {},
        h('h3', {}, frac === 1 ? 'Impecable.' : frac >= 0.8 ? 'Muy bien.' : frac >= 0.6 ? 'Vas bien, ajustá lo que fallaste.' : 'Hay que reforzar este tema.'),
        erradas.length ? h('p', { class: 'chico suave' }, `Las ${erradas.length} que erraste quedaron en Repaso: vuelven en los próximos días hasta que las fijes.`) : null,
        erradas.length ? h('ul', { class: 'lista-erradas' }, ...erradas.slice(0, 8).map(p => {
          const u = D.unidad(p.unidad);
          return h('li', {}, h('span', {}, (p.enunciado || 'Pregunta con imagen').slice(0, 90) + ((p.enunciado || '').length > 90 ? '…' : '')), u ? h('a', { href: `#/unidad/${u.id}`, class: 'chico' }, u.corto) : null);
        })) : null,
        h('div', { class: 'acciones' }, ...(accionesFin ? accionesFin(res) : [])))));
    if (onFin) onFin(res);
    arriba();
  }
  const ctl = {
    raiz,
    elegir(n) {
      if (!tarjeta || tarjeta.cerrada() || n > tarjeta.pregunta.opciones.length) return false;
      const r = tarjeta.querySelector('.opciones').getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return false; // solo si las opciones están a la vista
      tarjeta.elegir(n); return true;
    },
    avanzar() { if (btnSig && document.body.contains(btnSig)) { btnSig.click(); return true; } return false; },
  };
  activa = ctl;
  mostrar();
  return ctl;
}

// Anillo de progreso (resultado de una sesión o un simulacro)
export function anillo(frac, texto) {
  const r = 34, c = 2 * Math.PI * r;
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 80 80'); s.setAttribute('class', 'anillo'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', texto);
  s.innerHTML = `<circle cx="40" cy="40" r="${r}" class="anillo-fondo"/><circle cx="40" cy="40" r="${r}" class="anillo-valor ${frac >= 0.6 ? 'ok' : 'mal'}" stroke-dasharray="${c * frac} ${c}" transform="rotate(-90 40 40)"/><text x="40" y="45" text-anchor="middle">${texto}</text>`;
  return s;
}
