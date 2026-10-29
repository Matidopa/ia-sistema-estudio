// Marco de la app: estado de guardado, botón "Guardar progreso", usuario, cerrar la app, avisos y menú de celular.
import * as P from './progreso.js';
import { h } from './componentes.js';

const hora = d => d ? d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

// ---------- Avisos flotantes ----------
export function aviso(texto, tipo = 'ok', ms = 3200) {
  const cont = document.getElementById('avisos');
  if (!cont) return;
  const el = h('div', { class: 'aviso ' + tipo }, texto);
  cont.append(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 300); }, ms);
}

// ---------- Guardado ----------
function textoEstado() {
  const st = P.estado();
  if (st.tipo === 'guardando') return { cls: 'guardando', txt: 'Guardando…' };
  if (st.tipo === 'sucio') return { cls: 'sucio', txt: 'Cambios sin guardar' };
  if (st.tipo === 'error') return { cls: 'error', txt: 'No se pudo guardar' };
  return { cls: 'ok', txt: st.hora ? `Todo guardado · ${hora(st.hora)}` : 'Todo guardado' };
}

export async function guardarConAviso() {
  const ok = await P.guardarAhora(true);
  if (ok) aviso(`Guardado a las ${hora(new Date())}`);
  else aviso(P.modoGuardado() === 'servidor'
    ? 'No se pudo guardar. ¿Se cerró la ventana negra del servidor? Volvé a abrir iniciar.bat: se reintenta solo.'
    : 'No se pudo guardar en este navegador.', 'error', 6000);
  return ok;
}

export function pintarGuardado() {
  const panel = document.getElementById('panel-guardado');
  const movil = document.getElementById('guardado-movil');
  if (!panel || !movil) return;
  const u = P.usuarioActual();
  if (!u) { panel.innerHTML = ''; movil.innerHTML = ''; document.body.classList.add('sin-usuario'); return; }
  document.body.classList.remove('sin-usuario');
  const { cls, txt } = textoEstado();
  const st = P.estado();
  panel.innerHTML = '';
  panel.append(...[
    h('div', { class: 'usuario-fila' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, (u.nombre || '?').trim().charAt(0).toUpperCase()),
      h('span', { class: 'usuario-nombre', title: u.nombre }, u.nombre),
      h('a', { class: 'cambiar', href: '#/bienvenida?cambiar=1' }, 'Cambiar')),
    h('p', { class: 'estado-guardado ' + cls, role: 'status' }, h('span', { class: 'punto-estado', 'aria-hidden': 'true' }), txt),
    st.tipo === 'error' && st.error ? h('p', { class: 'error-detalle' }, st.error) : null,
    h('button', { class: 'boton btn-guardar', type: 'button', title: 'Guardar progreso (Ctrl+S)', onclick: guardarConAviso }, iconoGuardar(), 'Guardar progreso'),
    h('button', { class: 'btn-cerrar-app', type: 'button', onclick: cerrarApp }, 'Cerrar la app'),
    P.modoGuardado() === 'navegador' ? h('p', { class: 'error-detalle' }, 'Sin servidor: se guarda solo en este navegador. Abrí la app con iniciar.bat.') : null].filter(Boolean));
  movil.innerHTML = '';
  movil.append(h('button', { class: 'pill-guardar ' + cls, type: 'button', onclick: guardarConAviso, title: txt, 'aria-label': `Guardar progreso (${txt})` },
    h('span', { class: 'punto-estado', 'aria-hidden': 'true' }), cls === 'ok' ? 'Guardado' : cls === 'sucio' ? 'Guardar' : cls === 'guardando' ? 'Guardando' : 'Reintentar'));
}
function iconoGuardar() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '18'); s.setAttribute('height', '18'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 3v6h9V3M7 21v-7h10v7" fill="none" stroke="currentColor" stroke-width="2"/>';
  return s;
}

// ---------- Cerrar la app ----------
export async function cerrarApp() {
  if (!confirm('¿Cerrar la app? Se guarda todo y se apaga el servidor. Para volver, abrí iniciar.bat de nuevo.')) return;
  try {
    await P.cerrarApp();
    document.body.innerHTML = '';
    document.body.append(h('div', { class: 'pantalla-final' },
      h('div', { class: 'tarjeta-final' },
        h('div', { class: 'tilde', 'aria-hidden': 'true' }, '✓'),
        h('h1', {}, 'Listo, ya podés cerrar esta pestaña'),
        h('p', {}, `Tu progreso quedó guardado a las ${hora(new Date())}. La ventana negra del servidor se cierra sola.`),
        h('p', { class: 'suave chico' }, 'Para volver a estudiar, abrí iniciar.bat (o iniciar.command en Mac).'))));
  } catch (e) {
    aviso('No pude cerrar: ' + e.message + ' Tu progreso no se tocó.', 'error', 6000);
  }
}

// ---------- Menú de celular ----------
function menuMovil() {
  const btn = document.getElementById('btn-menu');
  const lat = document.getElementById('lateral');
  if (!btn || !lat) return;
  const poner = abierto => { lat.classList.toggle('abierto', abierto); btn.setAttribute('aria-expanded', abierto ? 'true' : 'false'); btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú'); };
  btn.addEventListener('click', () => poner(!lat.classList.contains('abierto')));
  window.addEventListener('hashchange', () => poner(false));
}

// ---------- Arranque del marco ----------
export function iniciarMarco() {
  P.alCambiar(pintarGuardado);
  pintarGuardado();
  menuMovil();
  // Ctrl+S / Cmd+S guarda
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (P.usuarioActual()) guardarConAviso(); }
  });
  // Al ocultar la pestaña (cambiar de app en el celu, minimizar) se guarda lo pendiente.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && P.pendiente()) P.mandarAlCerrar(); });
  // Al cerrar: si queda algo sin confirmar, se manda igual y se pide confirmación al navegador.
  window.addEventListener('beforeunload', e => {
    if (!P.usuarioActual() || !P.pendiente()) return;
    P.mandarAlCerrar();
    e.preventDefault();
    e.returnValue = '';
  });
}
