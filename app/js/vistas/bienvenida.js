// Bienvenida: nombre de quien estudia (cada persona tiene su progreso) y elección del modo de estudio.
import * as P from '../progreso.js';
import * as D from '../datos.js';
import { h } from '../componentes.js';
import * as PL from '../plan.js';
import { pintarGuardado } from '../shell.js';

const refrescar = () => dispatchEvent(new HashChangeEvent('hashchange'));

export async function vistaBienvenida(main, q) {
  const cambiar = /cambiar=1/.test(q || '');
  const elegirModo = /modo=1/.test(q || '');
  document.body.classList.add('modo-bienvenida');
  if (P.usuarioActual() && !cambiar) return pantallaModo(main);
  const { usuarios, legado } = await P.listarUsuarios();
  const input = h('input', { type: 'text', id: 'nombre', name: 'nombre', autocomplete: 'given-name', maxlength: 40, placeholder: 'Por ejemplo: Matias', required: true });
  const error = h('p', { class: 'error-form', role: 'alert' });
  const form = h('form', { class: 'form-nombre' },
    h('label', { for: 'nombre' }, usuarios.length ? 'O empezá con un nombre nuevo' : '¿Cómo te llamás?'),
    h('div', { class: 'fila-input' }, input, h('button', { class: 'boton', type: 'submit' }, 'Empezar')), error);
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    error.textContent = '';
    try {
      const u = await P.crearUsuario(input.value);
      await P.entrar(u.id);
      pintarGuardado();
      location.hash = P.modoEstudio() && !elegirModo ? '#/' : '#/bienvenida';
      refrescar();
    } catch (e) { error.textContent = e.message; }
  });
  const actual = P.usuarioActual();
  main.append(h('div', { class: 'bienvenida' },
    h('div', { class: 'bv-marca', 'aria-hidden': 'true' }),
    h('p', { class: 'previo-titulo' }, 'Inteligencia Artificial · UTN FRBA'),
    h('h1', {}, cambiar ? 'Cambiar de usuario' : 'Bienvenido. Arranquemos.'),
    h('p', { class: 'bajada' }, 'Cada persona que usa esta copia tiene su propio progreso, guardado con su nombre en esta compu. Así pueden estudiar varios en la misma compu sin pisarse.'),
    usuarios.length ? h('div', { class: 'usuarios' },
      h('p', { class: 'etiqueta-form' }, '¿Ya estudiaste acá? Elegí tu nombre'),
      h('div', { class: 'lista-usuarios' }, ...usuarios.map(u => h('button', {
        class: 'tarjeta-usuario' + (actual && actual.id === u.id ? ' actual' : ''), type: 'button',
        onclick: async () => { await P.entrar(u.id); pintarGuardado(); location.hash = P.modoEstudio() ? '#/' : '#/bienvenida'; refrescar(); },
      }, h('span', { class: 'avatar' }, u.nombre.charAt(0).toUpperCase()), h('span', {}, h('b', {}, u.nombre),
        h('small', {}, u.actualizado ? 'Último guardado: ' + new Date(u.actualizado).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin actividad todavía')))))) : null,
    form,
    legado && !usuarios.length ? h('p', { class: 'nota-info' }, 'Encontramos un progreso guardado de antes (progreso.json). Se va a pasar al nombre que cargues ahora, sin perder nada.') : null,
    cambiar && actual ? h('p', {}, h('a', { href: '#/' }, `Seguir como ${actual.nombre}`)) : null));
  input.focus();
}

function pantallaModo(main) {
  const r = PL.resumenExpres();
  const totalCompleto = D.RUTA.unidades.reduce((s, u) => s + u.minutos, 0);
  const actual = P.modoEstudio();
  const elegir = m => { P.setModoEstudio(m); P.guardarAhora(); document.body.classList.remove('modo-bienvenida'); location.hash = m === 'expres' ? '#/expres' : '#/'; refrescar(); };
  const u = P.usuarioActual();
  main.append(h('div', { class: 'bienvenida ancha' },
    h('p', { class: 'previo-titulo' }, `Hola, ${u.nombre}`),
    h('h1', {}, '¿Cómo querés estudiar?'),
    h('p', { class: 'bajada' }, 'Podés cambiarlo cuando quieras desde Inicio o Ajustes. El progreso es uno solo: lo que hagas en un modo cuenta en el otro.'),
    h('div', { class: 'modos' },
      tarjetaModo('completo', 'Modo completo', 'Con tiempo', `Las ${D.RUTA.unidades.length} unidades en orden, a ritmo tranquilo: teoría desde cero con ejemplos, chequeo de cada unidad, ejercicios de la cátedra y práctica.`,
        [`≈ ${PL.fmtMin(totalCompleto)} solo de lectura, más chequeos, práctica y ejercicios`, 'Ideal para entender todo y llegar sobrado', 'Incluye todos los temas'], actual === 'completo', () => elegir('completo')),
      tarjetaModo('expres', 'Modo exprés', 'Jugado de tiempo', 'Directo a lo que más se toma: Emparrillado, Búsqueda y Protocolos (≈15 de 25 preguntas) y la teoría que más se repite, con fichas cortas, práctica dirigida y un simulacro final.',
        [`≈ ${PL.fmtMin(r.total)} en total (con práctica y simulacro), en ${r.pasos.length} pasos`, 'Armado con la frecuencia real de cada tema', 'Al terminar te muestra qué te falta del completo'], actual === 'expres', () => elegir('expres')))));
}

function tarjetaModo(id, titulo, sub, texto, puntos, actual, fn) {
  return h('button', { class: 'tarjeta-modo modo-' + id + (actual ? ' actual' : ''), type: 'button', onclick: fn },
    h('span', { class: 'modo-sub' }, sub),
    h('span', { class: 'modo-titulo' }, titulo),
    h('span', { class: 'modo-texto' }, texto),
    h('ul', {}, ...puntos.map(p => h('li', {}, p))),
    h('span', { class: 'modo-cta' }, actual ? 'Seguir en este modo →' : 'Elegir este modo →'));
}
