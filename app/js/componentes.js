// Componentes reutilizables de la interfaz
import * as P from './progreso.js';
import { porId, examen, unidad, EXPLICACIONES } from './datos.js';
import { explicarReal } from './explicador.js';

export const h = (tag, attrs = {}, ...hijos) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat()) if (c !== null && c !== undefined && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
};
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function barra(frac, verde = false) {
  return h('div', { class: 'barra' + (verde ? ' verde' : ''), role: 'progressbar', 'aria-valuenow': Math.round(frac * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('span', { style: `width:${Math.round(frac * 100)}%` }));
}

export function anexoDe(p, abierto = false) {
  const a = datosAnexo(p);
  if (!a) return null;
  return h('details', { class: 'anexo', open: abierto },
    h('summary', {}, `Ver ${a.titulo}`),
    h('img', { src: '../contenido/' + a.img, alt: a.titulo, loading: 'lazy', class: 'ampliable' }));
}
export function datosAnexo(p) {
  if (p.tipo !== 'real' || !p.anexo) return null;
  const e = examen(p.examen); const a = e && e.anexos[p.anexo];
  if (!a) return null;
  return { clave: p.examen + ':' + p.anexo, titulo: a.titulo.replace(/\s+/g, ' '), img: a.img };
}

// Visor de imagen a pantalla completa (anexos y recortes): tocar una imagen .ampliable la abre.
export function abrirVisor(src, alt = '') {
  const cerrar = () => { v.remove(); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if (e.key === 'Escape') cerrar(); };
  const img = h('img', { src, alt });
  const v = h('div', { class: 'visor', role: 'dialog', 'aria-label': alt || 'Imagen ampliada' },
    h('button', { class: 'visor-cerrar', type: 'button', 'aria-label': 'Cerrar' }, '×'), h('div', { class: 'visor-lienzo' }, img));
  v.addEventListener('click', e => { if (e.target === v || e.target.classList.contains('visor-cerrar')) cerrar(); });
  img.addEventListener('click', () => img.classList.toggle('zoom'));
  document.addEventListener('keydown', tecla);
  document.body.append(v);
}
document.addEventListener('click', e => {
  const img = e.target.closest && e.target.closest('img.ampliable, img.recorte');
  if (img && !img.closest('.visor')) abrirVisor(img.src, img.alt);
});

// Los enunciados transcriptos del PDF traen cortes de línea a mitad de frase: se unen,
// pero se respetan los saltos que separan bloques (listas, fórmulas, párrafos).
const limpiarSaltos = t => t.trim().replace(/([^\n.:;)])\n(?=[a-záéíóúñ(“"«])/g, '$1 ');

// Pregunta interactiva.
// opciones: modo 'inmediato' | 'examen'; onRespuesta(qid, elegida, correcta); historial: muestra "la última vez bien/mal".
export function tarjetaPregunta(p, { modo = 'inmediato', numero = null, onRespuesta = null, mostrarRef = true, anexo = true, historial = true, anexoAbierto = false, origen = null } = {}) {
  const est = historial ? P.estadoPregunta(p.id) : null;
  const ref = p.tipo === 'real' ? p.ref : (p.basada_en && p.basada_en.length ? 'Basada en: ' + p.basada_en.map(id => (porId[id] ? porId[id].ref : id)).join('; ') : '');
  const cab = h('div', { class: 'cabeza' },
    h('span', { class: 'etiquetas' },
      numero ? h('b', { class: 'num-preg' }, `${numero}`) : null,
      p.tipo === 'real' ? h('span', { class: 'etiqueta real' }, 'Parcial real') : p.tipo === 'algo' ? h('span', { class: 'etiqueta ia' }, 'Ejercicio nuevo') : h('span', { class: 'etiqueta ia' }, 'Práctica generada'),
      est && est.intentos ? h('span', { class: 'etiqueta ' + (est.ultimaBien ? 'ok' : 'mal'), title: `${est.aciertos} de ${est.intentos} bien` }, est.ultimaBien ? 'la última vez bien' : 'la última vez mal') : null),
    mostrarRef && ref ? h('span', { class: 'ref' }, ref) : null);
  const cuerpo = h('div', { class: 'pregunta', id: 'q-' + p.id, 'data-qid': p.id }, cab);
  // Si está el escaneo completo, el recorte sería repetido: se muestra uno solo.
  if (p.img && !p.img_completa) cuerpo.append(h('img', { class: 'recorte', src: '../contenido/' + p.img, alt: 'Recorte del enunciado original', loading: 'lazy' }));
  if (p.enunciado) cuerpo.append(h('p', { class: 'enunciado' }, limpiarSaltos(p.enunciado)));
  if (p.img_completa) cuerpo.append(h('img', { class: 'recorte', src: '../contenido/' + p.img_completa, alt: 'Enunciado y opciones originales', loading: 'lazy' }));
  if (anexo) { const a = anexoDe(p, anexoAbierto); if (a) cuerpo.append(a); }
  if (p.extra) cuerpo.append(h('div', { class: 'extra', html: p.extra }));

  const lista = h('div', { class: 'opciones', role: 'group', 'aria-label': 'Opciones' });
  const botones = p.opciones.map((o, i) => {
    const b = h('button', { class: 'opcion', type: 'button', 'aria-keyshortcuts': String(i + 1) }, h('span', { class: 'n' }, `${i + 1}`), h('span', { class: 'txt' }, o || `Opción ${i + 1} (ver imagen)`));
    b.addEventListener('click', () => elegir(i + 1));
    lista.append(b);
    return b;
  });
  cuerpo.append(lista);
  const zonaExp = h('div', { class: 'zona-exp', 'aria-live': 'polite' });
  cuerpo.append(zonaExp);
  let elegida = null, cerrada = false;

  function elegir(n) {
    if (cerrada || n < 1 || n > botones.length) return;
    elegida = n;
    botones.forEach((b, i) => { b.classList.toggle('elegida', i + 1 === n); b.setAttribute('aria-pressed', i + 1 === n ? 'true' : 'false'); });
    cuerpo.classList.add('respondida');
    if (modo === 'inmediato') corregir();
    if (onRespuesta) onRespuesta(p.id, n, p.correcta);
  }
  function corregir(registrar = true) {
    if (cerrada) return;
    cerrada = true;
    cuerpo.classList.add('corregida', elegida === p.correcta ? 'bien' : elegida ? 'mal' : 'sin-resp');
    botones.forEach((b, i) => {
      b.disabled = true;
      if (i + 1 === p.correcta) b.classList.add('correcta');
      else if (i + 1 === elegida) b.classList.add('incorrecta');
    });
    if (registrar && elegida) {
      if (p.tipo === 'algo') P.registrarAlgo(p.unidad, elegida === p.correcta);
      else P.registrarRespuesta(p.id, elegida, p.correcta, origen || p.tipo);
    }
    zonaExp.append(bloqueExplicacion(p, elegida));
  }
  cuerpo.corregir = corregir;
  cuerpo.elegir = elegir;
  cuerpo.elegida = () => elegida;
  cuerpo.cerrada = () => cerrada;
  cuerpo.pregunta = p;
  return cuerpo;
}

export function bloqueExplicacion(p, elegida) {
  const bien = elegida === p.correcta;
  const caja = h('div', { class: 'explicacion' + (elegida && !bien ? ' mal' : elegida ? ' bien' : '') });
  caja.append(h('h4', {}, elegida == null ? `Respuesta correcta: opción ${p.correcta}` : (bien ? '¡Bien! Es la ' + p.correcta + '.' : `No. La correcta es la ${p.correcta}.`)));
  const propia = p.explicacion, ia = EXPLICACIONES[p.id];
  if (propia) caja.append(h('div', { class: 'teoria-chica', html: md(propia) }));
  if (ia) caja.append(h('div', { class: 'teoria-chica', html: md(ia) }), h('p', { class: 'firma' }, 'Explicación escrita con IA en base al material de la cátedra.'));
  const auto = p.tipo === 'real' ? explicarReal(p) : null;
  if (auto) {
    const det = h('details', { class: 'traza', open: !ia }, h('summary', {}, 'Resolución paso a paso con el motor de la app'), h('pre', {}, auto));
    caja.append(det);
  }
  if (!propia && !ia && !auto) caja.append(h('p', { class: 'chico suave' }, 'Esta pregunta todavía no tiene explicación escrita. Repasá la unidad del link.'));
  if (p.nota) caja.append(h('p', { class: 'chico suave' }, p.nota));
  const u = unidad(p.unidad);
  if (u) caja.append(h('p', { class: 'chico repasa' }, 'Repasá: ', h('a', { href: `#/unidad/${u.id}` }, u.titulo)));
  return caja;
}
const md = s => (window.marked ? window.marked.parse(s) : esc(s));

export function mezclar(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Markdown de teoría a un <article>: los blockquote que empiezan con "Trampa:" se pintan como nota roja.
export function articuloTeoria(mdTexto, clase = 'teoria') {
  const art = h('article', { class: clase, html: window.marked ? window.marked.parse(mdTexto) : esc(mdTexto) });
  art.querySelectorAll('blockquote').forEach(bq => {
    if (/^\s*trampa:/i.test(bq.textContent)) { bq.className = 'nota-margen'; bq.innerHTML = bq.innerHTML.replace(/Trampa:\s*/i, ''); }
  });
  return art;
}
