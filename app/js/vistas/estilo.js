// Teoría estilo parcial: preguntas inventadas que imitan cómo pregunta la cátedra en las teóricas 2024–2026
// (casos de negocio, "si pasa X, entonces…", comparaciones siempre/a veces/nunca, opciones gemelas).
// Es un banco aparte de "Práctica de teoría" y nunca usa preguntas reales.
import * as P from '../progreso.js';
import * as D from '../datos.js';
import { h, barra, mezclar } from '../componentes.js';
import { sesion, pistaTeclado } from './sesion.js';

const parametros = q => Object.fromEntries(new URLSearchParams((q || '').replace(/^\?/, '')));
const opt = (v, t, sel) => h('option', { value: v, selected: v === sel }, t);

function statsDe(lista) {
  let hechas = 0, bien = 0;
  for (const p of lista) {
    const e = P.estadoPregunta(p.id);
    if (e && e.intentos) { hechas++; if (e.ultimaBien) bien++; }
  }
  return { total: lista.length, hechas, bien };
}

export function vistaEstilo(main, q) {
  const prm = parametros(q);
  const u = prm.u || '';
  const filtro = prm.filtro || 'nuevas';
  const cuantas = +(prm.n || 10);
  const todas = D.estiloParcial();
  const porUnidad = D.RUTA.unidades.map(un => ({ un, lista: todas.filter(p => p.unidad === un.id) })).filter(x => x.lista.length)
    .sort((a, b) => b.lista.length - a.lista.length);

  const ir = (uid, f = filtro, n = cuantas) => {
    const nuevo = `#/estilo?u=${uid}&filtro=${f}&n=${n}`;
    if (location.hash === nuevo) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = nuevo;
  };

  const form = h('form', { class: 'hoja fila form-practica' },
    h('label', { class: 'campo' }, 'Tema', h('select', { name: 'u' }, h('option', { value: '' }, 'Todos mezclados'),
      ...porUnidad.map(({ un, lista }) => opt(un.id, `${un.num}. ${un.corto} (${lista.length})`, u)))),
    h('label', { class: 'campo' }, 'Cuáles', h('select', { name: 'filtro' },
      opt('nuevas', 'Las que nunca hice', filtro), opt('todas', 'Todas', filtro), opt('falladas', 'Las que erré', filtro))),
    h('label', { class: 'campo' }, 'Cantidad', h('select', { name: 'n' }, ...[5, 10, 20, 40].map(n => opt(String(n), String(n), String(cuantas))))),
    h('button', { class: 'boton', type: 'submit' }, q ? 'Otra tanda' : 'Empezar'));
  form.addEventListener('submit', ev => { ev.preventDefault(); const fd = new FormData(form); ir(fd.get('u'), fd.get('filtro'), fd.get('n')); });

  const st = statsDe(todas);
  const col = h('div', { class: 'columna texto' },
    h('h1', {}, 'Teoría estilo parcial'),
    h('p', { class: 'bajada' }, `${todas.length} preguntas nuevas armadas como las teóricas de los parciales 2024–2026: casos de empresas donde hay que elegir tecnología y tipo de problema a la vez, "si pasa tal cosa, entonces…", comparaciones de métodos (siempre, a veces, nunca), cuentas cortas y opciones gemelas que cambian en un detalle. Son más rebuscadas que las de Práctica de teoría y nunca son preguntas reales.`));
  main.append(col);

  if (!q) {
    col.append(form, pistaTeclado(),
      h('p', { class: 'chico suave' }, `Llevás ${st.hechas} de ${st.total} hechas${st.hechas ? `, con ${Math.round(100 * st.bien / st.hechas)}% bien en la última respuesta de cada una` : ''}. Los temas están ordenados por cuánto se toman. Las que erres vuelven en Repaso.`),
      h('h2', {}, 'Por tema'));
    const grilla = h('div', { class: 'grilla' });
    for (const { un, lista } of porUnidad) {
      const s = statsDe(lista);
      grilla.append(h('div', { class: 'hoja dato tarjeta-tema' },
        h('h3', { style: 'margin:0 0 4px' }, `${un.num}. ${un.corto}`),
        h('p', { class: 'chico suave', style: 'margin:0 0 10px' }, `${s.hechas} de ${s.total} hechas${s.hechas ? ` · ${Math.round(100 * s.bien / s.hechas)}% bien` : ''}`),
        barra(s.total ? s.hechas / s.total : 0, s.hechas && s.bien / s.hechas >= 0.75),
        h('div', { class: 'acciones', style: 'margin:12px 0 0' },
          h('button', { class: 'boton', type: 'button', onclick: () => ir(un.id, s.hechas < s.total ? 'nuevas' : 'todas', 10) }, s.hechas < s.total ? 'Practicar' : 'Repasar todo'),
          s.hechas > s.bien ? h('button', { class: 'boton secundario', type: 'button', onclick: () => ir(un.id, 'falladas', 10) }, 'Las que erré') : null)));
    }
    col.append(grilla);
    return;
  }

  const un = u ? D.unidad(u) : null;
  col.append(h('details', { class: 'plegable-form' },
    h('summary', {}, `${un ? un.corto : 'Todos los temas'} · ${{ todas: 'todas', nuevas: 'nunca hechas', falladas: 'erradas' }[filtro]} — cambiar`), form));
  let pool = u ? todas.filter(p => p.unidad === u) : todas;
  if (filtro === 'nuevas') pool = pool.filter(p => !(P.estadoPregunta(p.id) || {}).intentos);
  if (filtro === 'falladas') pool = pool.filter(p => { const e = P.estadoPregunta(p.id); return e && e.aciertos < e.intentos; });
  pool = mezclar(pool).slice(0, cuantas);
  sesion(col, pool, {
    titulo: 'Teoría estilo parcial',
    vacio: filtro === 'nuevas' ? '¡Ya hiciste todas las de este tema! Elegí "Todas" para repasarlas o "Las que erré".' : filtro === 'falladas' ? 'No tenés preguntas erradas en este tema. ¡Bien ahí!' : 'No hay preguntas para este tema.',
    accionesFin: () => [h('button', { class: 'boton', type: 'button', onclick: () => ir(u, filtro, cuantas) }, 'Otra tanda'), h('a', { class: 'boton secundario', href: '#/estilo' }, 'Elegir otro tema')],
  });
}
