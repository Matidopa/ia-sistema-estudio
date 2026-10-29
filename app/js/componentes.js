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

export function anexoDe(p) {
  if (p.tipo !== 'real' || !p.anexo) return null;
  const e = examen(p.examen); const a = e && e.anexos[p.anexo];
  if (!a) return null;
  return h('details', { class: 'anexo' },
    h('summary', {}, `Ver ${a.titulo.replace(/\s+/g, ' ')}`),
    h('img', { src: '../contenido/' + a.img, alt: a.titulo, loading: 'lazy' }));
}

// Pregunta interactiva. opciones: { modo: 'inmediato' | 'examen', onRespuesta(qid, elegida, correcta) }
export function tarjetaPregunta(p, { modo = 'inmediato', numero = null, onRespuesta = null, mostrarRef = true, anexo = true } = {}) {
  const est = P.estadoPregunta(p.id);
  const cab = h('div', { class: 'cabeza' },
    h('span', {},
      numero ? h('b', {}, `${numero}. `) : null,
      p.tipo === 'real' ? h('span', { class: 'etiqueta real' }, 'Parcial real') : h('span', { class: 'etiqueta ia' }, 'Práctica generada'),
      ' ',
      est && est.intentos ? h('span', { class: 'etiqueta ' + (est.ultimaBien ? 'ok' : 'mal'), title: `${est.aciertos} de ${est.intentos} bien` }, est.ultimaBien ? 'la última vez bien' : 'la última vez mal') : null),
    mostrarRef ? h('span', { class: 'ref' }, p.tipo === 'real' ? p.ref : (p.basada_en && p.basada_en.length ? 'Basada en: ' + p.basada_en.map(id => (porId[id] ? porId[id].ref : id)).join('; ') : '')) : null);
  const cuerpo = h('div', { class: 'pregunta', id: 'q-' + p.id }, cab);
  if (p.img) cuerpo.append(h('img', { class: 'recorte', src: '../contenido/' + p.img, alt: 'Recorte del enunciado original', loading: 'lazy' }));
  if (p.enunciado) cuerpo.append(h('p', { class: 'enunciado' }, p.enunciado));
  if (p.img_completa) cuerpo.append(h('img', { class: 'recorte', src: '../contenido/' + p.img_completa, alt: 'Enunciado y opciones originales', loading: 'lazy' }));
  if (anexo) { const a = anexoDe(p); if (a) cuerpo.append(a); }
  if (p.extra) cuerpo.append(h('div', { class: 'extra', html: p.extra }));

  const lista = h('div', { class: 'opciones', role: 'group', 'aria-label': 'Opciones' });
  const botones = p.opciones.map((o, i) => {
    const b = h('button', { class: 'opcion', type: 'button' }, h('span', { class: 'n' }, `${i + 1}.`), h('span', {}, o || `Opción ${i + 1} (ver imagen)`));
    b.addEventListener('click', () => elegir(i + 1));
    lista.append(b);
    return b;
  });
  cuerpo.append(lista);
  const zonaExp = h('div');
  cuerpo.append(zonaExp);
  let elegida = null, cerrada = false;

  function elegir(n) {
    if (cerrada) return;
    elegida = n;
    botones.forEach((b, i) => b.classList.toggle('elegida', i + 1 === n));
    if (modo === 'inmediato') corregir();
    if (onRespuesta) onRespuesta(p.id, n, p.correcta);
  }
  function corregir(registrar = true) {
    if (cerrada) return;
    cerrada = true;
    botones.forEach((b, i) => {
      b.disabled = true;
      if (i + 1 === p.correcta) b.classList.add('correcta');
      else if (i + 1 === elegida) b.classList.add('incorrecta');
    });
    if (registrar && elegida) P.registrarRespuesta(p.id, elegida, p.correcta, p.tipo);
    zonaExp.append(bloqueExplicacion(p, elegida));
  }
  cuerpo.corregir = corregir;
  cuerpo.elegida = () => elegida;
  return cuerpo;
}

export function bloqueExplicacion(p, elegida) {
  const bien = elegida === p.correcta;
  const caja = h('div', { class: 'explicacion' + (elegida && !bien ? ' mal' : '') });
  caja.append(h('h4', {}, elegida == null ? `Respuesta correcta: opción ${p.correcta}` : (bien ? 'Correcto.' : `No. La correcta es la ${p.correcta}.`)));
  let exp = p.explicacion || EXPLICACIONES[p.id];
  if (exp) caja.append(h('div', { class: 'teoria-chica', html: window.marked ? window.marked.parse(exp) : esc(exp) }));
  const auto = p.tipo === 'real' ? explicarReal(p) : null;
  if (auto) caja.append(h('pre', {}, auto));
  if (p.nota) caja.append(h('p', { class: 'chico suave' }, p.nota));
  const u = unidad(p.unidad);
  if (u) caja.append(h('p', { class: 'chico' }, 'Repasá: ', h('a', { href: `#/unidad/${u.id}` }, u.titulo)));
  return caja;
}

export function mezclar(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
