// Motor de examen: simulacro con cronómetro, índice de preguntas, anexo al costado, marcar para revisar
// y resultado por tema. Lo usan los parciales reales, el simulacro mezclado y los pasos del modo exprés.
import * as P from '../progreso.js';
import * as D from '../datos.js';
import { h, tarjetaPregunta, datosAnexo, abrirVisor, mezclar } from '../componentes.js';
import { sesion, anillo } from './sesion.js';
import { distribucion, MECANICAS, ANEXO_DE, esReciente } from '../plan.js';

const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
let teclas = null;
document.addEventListener('keydown', e => {
  if (!teclas || !document.body.contains(teclas.raiz)) { teclas = null; return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
  if (/^[1-4]$/.test(e.key) && teclas.elegir(+e.key)) e.preventDefault();
});

// preguntas: lista. opciones: { eid, modo: 'simulacro'|'guiado', titulo, onFin(res), cronometro }
export function examen(cont, preguntas, { eid = null, modo = 'simulacro', onFin = null, accionesFin = null } = {}) {
  const guiado = modo === 'guiado';
  const respuestas = {}, marcadas = new Set();
  const inicio = Date.now();
  let terminado = false, activa = 0;

  const raiz = h('div', { class: 'examen' + (guiado ? ' guiado' : '') });
  const reloj = h('span', { class: 'reloj', 'aria-label': 'Tiempo transcurrido' }, '0:00');
  const cuenta = h('span', { class: 'cuenta-resp' });
  const btnFin = h('button', { class: 'boton', type: 'button' }, guiado ? 'Terminar' : 'Terminar y corregir');
  const barra = h('div', { class: 'examen-barra' },
    h('span', { class: 'reloj-caja' }, relojIcono(), reloj), cuenta,
    h('span', { class: 'pista-teclado solo-escritorio' }, h('kbd', {}, '1'), '–', h('kbd', {}, '4'), ' responde la pregunta en pantalla'),
    btnFin);
  const indice = h('div', { class: 'indice', role: 'navigation', 'aria-label': 'Índice de preguntas' });
  const panelAnexo = h('div', { class: 'panel-anexo' });
  const lateral = h('aside', { class: 'examen-lateral' }, h('h3', {}, 'Preguntas'), indice,
    h('p', { class: 'leyenda chico suave' }, h('span', { class: 'cuad resp' }), ' respondida ', h('span', { class: 'cuad marc' }), ' para revisar'), panelAnexo);
  const lista = h('div', { class: 'examen-lista' });
  const resultado = h('div', { class: 'examen-resultado' });
  raiz.append(barra, resultado, h('div', { class: 'examen-cuerpo' }, lista, lateral));
  cont.append(raiz);

  const tick = setInterval(() => {
    if (!document.body.contains(raiz) || terminado) { clearInterval(tick); return; }
    reloj.textContent = mmss(Math.floor((Date.now() - inicio) / 1000));
  }, 1000);

  let anexoPrevio = null;
  const tarjetas = preguntas.map((p, k) => {
    const t = tarjetaPregunta(p, { modo: guiado ? 'inmediato' : 'examen', numero: k + 1, mostrarRef: false, anexo: false, historial: false,
      onRespuesta: (id, n) => { respuestas[id] = n; pintarIndice(); } });
    const a = datosAnexo(p);
    const cab = t.querySelector('.cabeza');
    const extra = h('span', { class: 'acciones-preg' });
    if (a) {
      // Cuando cambia el anexo (otro bloque), se marca con un separador como en el parcial
      if (a.clave !== anexoPrevio) lista.append(h('div', { class: 'separador-anexo' }, h('span', {}, a.titulo)));
      anexoPrevio = a.clave;
      extra.append(h('button', { class: 'chip-anexo', type: 'button', onclick: () => abrirVisor('../contenido/' + a.img, a.titulo) }, `Anexo ${p.anexo}`));
    }
    const flag = h('button', { class: 'chip-marcar', type: 'button', 'aria-pressed': 'false', title: 'Marcar para revisar' }, '⚑ Revisar');
    flag.addEventListener('click', () => { const on = !marcadas.has(p.id); on ? marcadas.add(p.id) : marcadas.delete(p.id); flag.setAttribute('aria-pressed', on); t.classList.toggle('marcada', on); pintarIndice(); });
    extra.append(flag);
    cab.append(extra);
    t.dataset.k = k;
    lista.append(t);
    return t;
  });

  const botonesIdx = preguntas.map((p, k) => {
    const b = h('button', { class: 'idx', type: 'button', 'aria-label': `Ir a la pregunta ${k + 1}`, onclick: () => irA(k) }, String(k + 1));
    indice.append(b);
    return b;
  });
  function pintarIndice() {
    const n = Object.keys(respuestas).length;
    cuenta.textContent = `${n} de ${preguntas.length} respondidas`;
    preguntas.forEach((p, k) => {
      let cls = 'idx';
      if (terminado) cls += respuestas[p.id] === p.correcta ? ' bien' : ' mal';
      else if (respuestas[p.id]) cls += ' resp';
      if (marcadas.has(p.id)) cls += ' marc';
      if (k === activa) cls += ' activa';
      if (botonesIdx[k].className !== cls) botonesIdx[k].className = cls;
    });
  }
  function irA(k) {
    const t = tarjetas[k];
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    activa = k; pintarIndice(); pintarAnexo();
  }
  function pintarAnexo() {
    const p = preguntas[activa];
    const a = p && datosAnexo(p);
    if (panelAnexo.dataset.clave === (a ? a.clave : '')) return;
    panelAnexo.dataset.clave = a ? a.clave : '';
    panelAnexo.innerHTML = '';
    if (!a) return;
    panelAnexo.append(h('h3', {}, a.titulo), h('img', { src: '../contenido/' + a.img, alt: a.titulo, class: 'ampliable' }),
      h('p', { class: 'chico suave' }, 'Tocá la imagen para verla grande.'));
  }
  // La pregunta "activa" es la que está más cerca de la parte de arriba de la pantalla
  const obs = new IntersectionObserver(ents => {
    const vis = ents.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (vis.length) { activa = +vis[0].target.dataset.k; pintarIndice(); pintarAnexo(); }
  }, { rootMargin: '-90px 0px -55% 0px' });
  tarjetas.forEach(t => obs.observe(t));
  teclas = {
    raiz,
    elegir(n) {
      if (terminado) return false;
      const t = tarjetas[activa];
      if (!t || t.cerrada() || n > t.pregunta.opciones.length) return false;
      t.elegir(n);
      if (activa + 1 < tarjetas.length) setTimeout(() => irA(activa + 1), 250);
      return true;
    },
  };

  btnFin.addEventListener('click', () => {
    const sinResp = preguntas.filter(p => !respuestas[p.id]).length;
    if (!guiado && sinResp && !confirm(`Te quedan ${sinResp} sin responder. ¿Corrijo igual?`)) return;
    terminar();
  });

  function terminar() {
    terminado = true;
    obs.disconnect();
    tarjetas.forEach(t => t.corregir(!guiado));
    const segundos = Math.floor((Date.now() - inicio) / 1000);
    const bien = preguntas.filter(p => respuestas[p.id] === p.correcta).length;
    const porUnidad = {};
    for (const p of preguntas) { const k = p.unidad; porUnidad[k] = porUnidad[k] || [0, 0]; porUnidad[k][1]++; if (respuestas[p.id] === p.correcta) porUnidad[k][0]++; }
    const erradas = preguntas.filter(p => respuestas[p.id] !== p.correcta);
    if (eid) P.registrarExamen(eid, { bien, total: preguntas.length, modo, minutos: Math.max(1, Math.round(segundos / 60)), respuestas, porUnidad });
    btnFin.disabled = true; btnFin.textContent = 'Corregido';
    pintarIndice();
    const res = { bien, total: preguntas.length, porUnidad, erradas, segundos };
    const frac = bien / preguntas.length;
    resultado.innerHTML = '';
    const temas = Object.entries(porUnidad).sort((a, b) => (a[1][0] / a[1][1]) - (b[1][0] / b[1][1]));
    resultado.append(h('div', { class: 'hoja resultado-examen' },
      h('div', { class: 'resultado-top' },
        anillo(frac, `${bien}/${preguntas.length}`),
        h('div', {},
          h('h2', {}, `${Math.round(frac * 100)}% bien`),
          h('p', { class: 'suave' }, `Tardaste ${mmss(segundos)}. ${erradas.length ? `Las ${erradas.length} que erraste quedaron en Repaso.` : '¡Sin errores!'} Abajo tenés la corrección de cada pregunta con su explicación.`))),
      h('h3', {}, 'Por tema (de lo más flojo a lo mejor)'),
      h('ul', { class: 'por-tema' }, ...temas.map(([k, [b, t]]) => {
        const u = D.unidad(k);
        return h('li', {},
          h('span', { class: 'tema-nombre' }, u ? u.corto : k),
          h('span', { class: 'tema-barra' }, h('span', { class: b / t >= 0.6 ? 'ok' : 'mal', style: `width:${Math.round(100 * b / t)}%` })),
          h('span', { class: 'tema-n' }, `${b}/${t}`),
          b < t ? h('a', { class: 'chico', href: `#/practica?u=${k}&f=real&filtro=falladas&n=10` }, 'Practicar') : h('span'));
      })),
      h('div', { class: 'acciones' },
        erradas.length ? h('button', { class: 'boton', type: 'button', onclick: () => rehacer(erradas) }, `Rehacer las ${erradas.length} erradas`) : null,
        ...(accionesFin ? accionesFin(res) : []))));
    window.scrollTo({ top: resultado.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    if (onFin) onFin(res);
  }
  function rehacer(erradas) {
    const zona = h('div', { class: 'columna texto' }, h('h2', {}, 'Rehacé las que erraste'));
    resultado.append(zona);
    sesion(zona, erradas, { accionesFin: () => [h('a', { class: 'boton secundario', href: '#/repaso' }, 'Ir a Repaso')] });
    zona.scrollIntoView({ behavior: 'smooth' });
  }

  pintarIndice(); pintarAnexo();
  return { terminar };
}

function relojIcono() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '16'); s.setAttribute('height', '16'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = '<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4l3 2M9 2h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  return s;
}

// ---------- Armado de un simulacro mezclado con la distribución real ----------
// Las técnicas mecánicas van en bloque con su anexo (como en el parcial): cada una sale de un parcial reciente.
export function armarSimulacro(total = 25) {
  const dist = distribucion(total);
  const recientes = D.PARCIALES.examenes.filter(e => esReciente({ examen: e.id }));
  const usados = new Set();
  const pregs = [];
  const yaHecho = eid => P.intentosExamen(eid).length > 0;
  for (const u of MECANICAS) {
    const n = dist[u] || 0;
    if (!n) continue;
    const cands = mezclar(recientes).sort((a, b) => (yaHecho(a.id) - yaHecho(b.id)));
    let bloque = [];
    for (const e of cands) {
      if (usados.has(e.id)) continue;
      bloque = e.preguntas.map(id => D.porId[id]).filter(p => p.unidad === u && p.anexo === ANEXO_DE[u]);
      if (bloque.length >= Math.min(n, 4)) { usados.add(e.id); break; }
    }
    pregs.push(...bloque.slice(0, n));
  }
  const teoricas = [];
  for (const [u, n] of Object.entries(dist)) {
    if (MECANICAS.includes(u)) continue;
    const pool = D.realesDeUnidad(u).filter(p => !p.img_completa && !p.anexo);
    const orden = mezclar(pool).sort((a, b) => valor(b) - valor(a));
    teoricas.push(...orden.slice(0, n));
  }
  // si algún bloque vino más corto, se completa con teoría de los temas que más pesan
  const usadosIds = new Set([...pregs, ...teoricas].map(p => p.id));
  const ordenU = Object.entries(dist).filter(([u]) => !MECANICAS.includes(u)).sort((a, b) => b[1] - a[1]).map(([u]) => u);
  for (let i = 0; pregs.length + teoricas.length < total && i < 50; i++) {
    const u = ordenU[i % ordenU.length];
    const extra = mezclar(D.realesDeUnidad(u).filter(p => !p.img_completa && !p.anexo && !usadosIds.has(p.id)))[0];
    if (extra) { teoricas.push(extra); usadosIds.add(extra.id); }
  }
  // en el parcial la teoría va primero y las técnicas al final, agrupadas por anexo
  return [...mezclar(teoricas), ...pregs.sort((a, b) => ANEXO_DE[a.unidad].localeCompare(ANEXO_DE[b.unidad]))];
}
function valor(p) {
  const e = P.estadoPregunta(p.id);
  return (esReciente(p) ? 1.5 : 0) + (!e ? 2 : e.ultimaBien ? 0 : 1) + Math.random();
}
