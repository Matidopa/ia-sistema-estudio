import * as P from './progreso.js';
import * as D from './datos.js';
import { h, barra, tarjetaPregunta, mezclar, anexoDe } from './componentes.js';
import { vistaCatedra, vistaEjercicio } from './vistas/catedra.js';
import { vistaSimuladores } from './vistas/simuladores.js';
import { generarPreguntaAlgoritmica, TIPOS_ALGORITMICOS } from './generadores.js';

const $main = () => document.getElementById('principal');
const NOMBRE_BLOQUE = { u5: 'Métodos de Búsqueda', u4: 'Emparrillado', u3: 'Análisis de Protocolos', u9: 'Lógica' };

// ---------------- Navegación ----------------
const RUTAS = [
  [/^#\/?$/, vistaInicio],
  [/^#\/ruta$/, vistaRuta],
  [/^#\/unidad\/([\w-]+)$/, vistaUnidad],
  [/^#\/practica(\?.*)?$/, vistaPractica],
  [/^#\/parciales$/, vistaParciales],
  [/^#\/parcial\/([\w-]+)(\?.*)?$/, vistaParcial],
  [/^#\/repaso$/, vistaRepaso],
  [/^#\/catedra$/, vistaCatedra],
  [/^#\/catedra\/([\w-]+)$/, vistaEjercicio],
  [/^#\/simuladores(\/[\w-]+)?$/, vistaSimuladores],
  [/^#\/ajustes$/, vistaAjustes],
];

async function navegar() {
  const hash = location.hash || '#/';
  const main = $main();
  main.innerHTML = '';
  for (const [re, fn] of RUTAS) {
    const m = hash.match(re);
    if (m) {
      try { await fn(main, ...m.slice(1)); } catch (e) { console.error(e); main.append(h('p', { class: 'vacio' }, 'Algo falló al mostrar esta sección: ' + e.message)); }
      break;
    }
  }
  marcarNav();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}
function parametros(q) { return Object.fromEntries(new URLSearchParams((q || '').replace(/^\?/, ''))); }

function marcarNav() {
  const hash = location.hash || '#/';
  document.querySelectorAll('.nav a').forEach(a => {
    const k = a.getAttribute('href');
    const activo = k === '#/' ? hash === '#/' || hash === '' : hash.startsWith(k);
    if (activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const rep = P.paraRepasar().length;
  const c = document.getElementById('cuenta-repaso');
  if (c) { c.textContent = rep; c.hidden = rep === 0; }
  pintarRutaMini();
}

function pintarRutaMini() {
  const ul = document.getElementById('ruta-mini');
  if (!ul) return;
  ul.innerHTML = '';
  for (const u of D.RUTA.unidades) {
    const hecha = !!P.estadoUnidad(u.id).aprobada;
    ul.append(h('li', { class: hecha ? 'hecha' : '' }, h('a', { href: `#/unidad/${u.id}` }, h('span', { class: 'punto' }), `${u.num}. ${u.corto}`)));
  }
}

function pintarGuardado() {
  const el = document.getElementById('guardado');
  if (!el) return;
  const st = P.estado();
  const donde = P.modoGuardado() === 'servidor' ? 'en progreso.json' : 'en este navegador (abrí la app con iniciar.bat para guardar en archivo)';
  el.className = 'guardado' + (st === 'error' ? ' error' : '');
  el.innerHTML = st === 'guardando' ? 'Guardando…' : st === 'error' ? '<b>No se pudo guardar.</b> ¿Cerraste la ventana del servidor?' : `<b>Progreso guardado</b> ${donde}`;
}

// ---------------- Estadísticas ----------------
function statsUnidad(uid) {
  const reales = D.realesDeUnidad(uid), gen = D.generadasDeUnidad(uid);
  const todas = [...reales, ...gen];
  let hechas = 0, bien = 0;
  for (const p of todas) { const e = P.estadoPregunta(p.id); if (e && e.intentos) { hechas++; if (e.ultimaBien) bien++; } }
  return { total: todas.length, reales: reales.length, generadas: gen.length, hechas, bien };
}
function statsGlobal() {
  const preg = Object.values(P.get().preguntas);
  const hechas = preg.filter(p => p.intentos).length;
  const bien = preg.filter(p => p.ultimaBien).length;
  const reales = D.PARCIALES.preguntas.filter(p => (P.estadoPregunta(p.id) || {}).intentos).length;
  return { hechas, bien, reales, totalReales: D.PARCIALES.preguntas.length };
}

// ---------------- Inicio ----------------
function vistaInicio(main) {
  const s = statsGlobal();
  const siguiente = D.RUTA.unidades.find(u => !P.estadoUnidad(u.id).aprobada) || D.RUTA.unidades[0];
  const rep = P.paraRepasar().length;
  const examenesHechos = Object.keys(P.get().examenes).length;
  main.append(
    h('div', { class: 'columna' },
      h('h1', {}, 'Inteligencia Artificial, de cero al parcial'),
      h('p', { class: 'bajada' }, 'Seguí la ruta en orden: cada unidad tiene la teoría explicada desde cero, un ejemplo resuelto, las trampas que más se repiten en los parciales y práctica. Después medite con los parciales reales.'),
      h('div', { class: 'destacada' },
        h('p', { class: 'previo' }, 'Seguí por acá'),
        h('h2', {}, `${siguiente.num}. ${siguiente.titulo}`),
        h('p', { style: 'margin:0 0 18px' }, siguiente.resumen),
        h('div', { class: 'acciones', style: 'margin:0' },
          h('a', { class: 'boton', href: `#/unidad/${siguiente.id}` }, 'Estudiar esta unidad'),
          rep ? h('a', { class: 'boton secundario', href: '#/repaso' }, `Repasar ${rep} pendiente${rep > 1 ? 's' : ''}`) : null)),
      h('h2', {}, 'Cómo vas'),
      h('div', { class: 'grilla' },
        tarjetaDato(`${s.reales} de ${s.totalReales}`, 'preguntas de parciales reales respondidas', s.reales / s.totalReales),
        tarjetaDato(s.hechas ? `${Math.round(100 * s.bien / s.hechas)}%` : '—', 'de acierto en la última respuesta de cada pregunta', s.hechas ? s.bien / s.hechas : 0, true),
        tarjetaDato(`${examenesHechos} de ${D.PARCIALES.examenes.length}`, 'parciales completos rendidos como simulacro', examenesHechos / D.PARCIALES.examenes.length)),
      h('h2', {}, 'Por unidad'),
      tablaUnidades()));
}
function tarjetaDato(valor, texto, frac, verde) {
  return h('div', { class: 'hoja dato' }, h('div', { class: 'valor' }, valor), h('p', { class: 'chico suave', style: 'margin:2px 0 10px' }, texto), barra(frac, verde));
}
function tablaUnidades() {
  const t = h('table', { class: 'tabla' }, h('thead', {}, h('tr', {}, h('th', {}, 'Unidad'), h('th', {}, 'Teoría'), h('th', {}, 'Preguntas hechas'), h('th', {}, 'Acierto'), h('th', {}, 'En parciales'))));
  const tb = h('tbody');
  for (const u of D.RUTA.unidades) {
    const s = statsUnidad(u.id), e = P.estadoUnidad(u.id);
    tb.append(h('tr', {},
      h('td', {}, h('a', { href: `#/unidad/${u.id}` }, `${u.num}. ${u.titulo}`)),
      h('td', {}, e.aprobada ? h('span', { class: 'etiqueta ok' }, 'aprobada') : e.leida ? h('span', { class: 'etiqueta' }, 'leída') : '—'),
      h('td', {}, `${s.hechas} / ${s.total}`),
      h('td', {}, s.hechas ? `${Math.round(100 * s.bien / s.hechas)}%` : '—'),
      h('td', { class: 'suave chico' }, u.peso || '')));
  }
  t.append(tb);
  return h('div', { class: 'envoltura-tabla' }, t);
}

// ---------------- Ruta ----------------
function vistaRuta(main) {
  const actual = D.RUTA.unidades.find(u => !P.estadoUnidad(u.id).aprobada);
  const ol = h('ol', { class: 'ruta' });
  for (const u of D.RUTA.unidades) {
    const e = P.estadoUnidad(u.id), s = statsUnidad(u.id);
    ol.append(h('li', { class: (e.aprobada ? 'hecha ' : '') + (actual && actual.id === u.id ? 'actual' : '') },
      h('span', { class: 'nodo', 'aria-hidden': 'true' }, u.num),
      h('a', { class: 'titulo', href: `#/unidad/${u.id}` }, u.titulo),
      h('div', { class: 'meta' }, `${u.peso || ''}${u.peso ? ' · ' : ''}${u.minutos} min de lectura · ${s.reales} preguntas reales · ${s.generadas} de práctica`),
      h('p', { style: 'margin:4px 0 0', class: 'chico' }, u.resumen)));
  }
  main.append(h('div', { class: 'columna texto' },
    h('h1', {}, 'La ruta'),
    h('p', { class: 'bajada' }, D.RUTA.intro),
    ol));
}

// ---------------- Unidad ----------------
async function vistaUnidad(main, uid) {
  const u = D.unidad(uid);
  if (!u) { main.append(h('p', { class: 'vacio' }, 'No existe esa unidad.')); return; }
  const md = await D.texto('teoria/' + u.archivo);
  const html = window.marked.parse(md);
  const s = statsUnidad(uid);
  const e = P.estadoUnidad(uid);
  const idx = D.RUTA.unidades.indexOf(u);
  const sig = D.RUTA.unidades[idx + 1], ant = D.RUTA.unidades[idx - 1];
  const art = h('article', { class: 'teoria', html });
  // notas al margen: blockquotes que empiezan con "Trampa:"
  art.querySelectorAll('blockquote').forEach(bq => {
    const t = bq.textContent.trim();
    if (/^trampa:/i.test(t)) { bq.className = 'nota-margen'; bq.innerHTML = bq.innerHTML.replace(/Trampa:\s*/i, ''); }
  });
  if (!e.leida) P.marcarUnidad(uid, { leida: true });

  const chequeo = h('div');
  main.append(h('div', { class: 'columna' },
    h('p', { class: 'chico suave', style: 'margin:0 0 4px' }, h('a', { href: '#/ruta' }, 'Ruta'), ` / Unidad ${u.num}`),
    h('h1', {}, u.titulo),
    h('p', { class: 'bajada' }, u.resumen),
    h('div', { class: 'acciones' },
      h('a', { class: 'boton secundario', href: `#/practica?u=${uid}&f=ia` }, `Práctica generada (${s.generadas})`),
      h('a', { class: 'boton secundario', href: `#/practica?u=${uid}&f=real` }, `Preguntas reales de este tema (${s.reales})`)),
    art,
    h('h2', {}, 'Chequeo de la unidad'),
    h('p', { class: 'suave' }, 'Cinco preguntas al azar de esta unidad. Con 4 de 5 bien la unidad queda aprobada en la ruta.'),
    chequeo,
    h('div', { class: 'acciones' },
      ant ? h('a', { class: 'boton secundario', href: `#/unidad/${ant.id}` }, `Anterior: ${ant.corto}`) : null,
      sig ? h('a', { class: 'boton', href: `#/unidad/${sig.id}` }, `Siguiente: ${sig.corto}`) : null)));
  armarChequeo(chequeo, uid);
}

function armarChequeo(cont, uid) {
  cont.innerHTML = '';
  const pool = mezclar([...D.generadasDeUnidad(uid), ...D.realesDeUnidad(uid).filter(p => !p.img_completa)]).slice(0, 5);
  if (!pool.length) { cont.append(h('p', { class: 'vacio' }, 'Esta unidad todavía no tiene preguntas.')); return; }
  const respuestas = {};
  const tarjetas = pool.map((p, i) => tarjetaPregunta(p, { modo: 'examen', numero: i + 1, onRespuesta: (id, n) => { respuestas[id] = n; } }));
  const res = h('div');
  const btn = h('button', { class: 'boton', type: 'button' }, 'Corregir chequeo');
  btn.addEventListener('click', () => {
    tarjetas.forEach(t => t.corregir());
    const bien = pool.filter(p => respuestas[p.id] === p.correcta).length;
    const aprobada = bien >= Math.min(4, pool.length);
    if (aprobada) P.marcarUnidad(uid, { aprobada: true, chequeo: bien });
    res.innerHTML = '';
    res.append(h('div', { class: 'hoja' }, h('h3', { style: 'margin-top:0' }, `${bien} de ${pool.length} bien. ${aprobada ? 'Unidad aprobada.' : 'Repasá lo que fallaste y probá otra vez.'}`),
      h('button', { class: 'boton secundario', type: 'button', onclick: () => armarChequeo(cont, uid) }, 'Otro chequeo')));
    btn.disabled = true;
    pintarRutaMini();
  });
  cont.append(...tarjetas, h('div', { class: 'acciones' }, btn), res);
}

// ---------------- Práctica ----------------
function vistaPractica(main, q) {
  const prm = parametros(q);
  const unidades = prm.u ? prm.u.split(',') : [];
  const fuente = prm.f || 'ambas'; // real | ia | ambas
  const filtro = prm.filtro || 'todas'; // todas | nuevas | falladas
  const cuantas = +(prm.n || 10);

  const form = h('form', { class: 'hoja fila' },
    h('label', { class: 'campo' }, 'Unidad', selectUnidades(unidades[0] || '')),
    h('label', { class: 'campo' }, 'De dónde', h('select', { name: 'f' },
      opt('ambas', 'Reales + generadas', fuente), opt('real', 'Solo parciales reales', fuente), opt('ia', 'Solo generadas por IA', fuente), opt('algo', 'Ejercicios nuevos de búsqueda/emparrillado', fuente))),
    h('label', { class: 'campo' }, 'Cuáles', h('select', { name: 'filtro' }, opt('todas', 'Todas', filtro), opt('nuevas', 'Las que nunca hice', filtro), opt('falladas', 'Las que erré', filtro))),
    h('label', { class: 'campo' }, 'Cantidad', h('select', { name: 'n' }, ...[5, 10, 20, 40].map(n => opt(String(n), String(n), String(cuantas))))),
    h('button', { class: 'boton', type: 'submit' }, 'Empezar'));
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const fd = new FormData(form);
    location.hash = `#/practica?u=${fd.get('u')}&f=${fd.get('f')}&filtro=${fd.get('filtro')}&n=${fd.get('n')}`;
  });
  main.append(h('div', { class: 'columna texto' }, h('h1', {}, 'Práctica'),
    h('p', { class: 'bajada' }, 'Elegí una unidad (o todas, mezcladas como en el parcial). Cada respuesta se corrige al instante y queda guardada en tu progreso.'), form));

  if (!q) return;
  let pool;
  if (fuente === 'algo') {
    const tipos = TIPOS_ALGORITMICOS.filter(t => !unidades[0] || t.unidad === unidades[0]);
    pool = Array.from({ length: cuantas }, () => generarPreguntaAlgoritmica(tipos[Math.floor(Math.random() * tipos.length)] || TIPOS_ALGORITMICOS[0]));
  } else {
    pool = [];
    if (fuente !== 'ia') pool.push(...D.PARCIALES.preguntas);
    if (fuente !== 'real') pool.push(...D.GENERADAS.preguntas);
    if (unidades[0]) pool = pool.filter(p => unidades.includes(p.unidad));
    if (filtro === 'nuevas') pool = pool.filter(p => !(P.estadoPregunta(p.id) || {}).intentos);
    if (filtro === 'falladas') pool = pool.filter(p => { const e = P.estadoPregunta(p.id); return e && e.aciertos < e.intentos; });
    pool = mezclar(pool).slice(0, cuantas);
  }
  sesion(main.firstChild, pool, 'No hay preguntas con ese filtro. Probá con "Todas".');
}
function opt(v, t, sel) { return h('option', { value: v, selected: v === sel }, t); }
function selectUnidades(sel) {
  return h('select', { name: 'u' }, h('option', { value: '' }, 'Todas mezcladas'), ...D.RUTA.unidades.map(u => opt(u.id, `${u.num}. ${u.corto}`, sel)));
}

// Sesión de preguntas de a una, con corrección inmediata
function sesion(cont, pool, msgVacio) {
  if (!pool.length) { cont.append(h('p', { class: 'vacio' }, msgVacio)); return; }
  let i = 0, bien = 0;
  const zona = h('div'), pie = h('div', { class: 'acciones' });
  const progreso = h('p', { class: 'suave chico' });
  cont.append(progreso, zona, pie);
  function mostrar() {
    zona.innerHTML = ''; pie.innerHTML = '';
    progreso.textContent = `Pregunta ${i + 1} de ${pool.length} · ${bien} bien hasta ahora`;
    const p = pool[i];
    const tarjeta = tarjetaPregunta(p, { modo: 'inmediato', onRespuesta: (id, n, c) => {
      if (n === c) bien++;
      progreso.textContent = `Pregunta ${i + 1} de ${pool.length} · ${bien} bien hasta ahora`;
      pie.innerHTML = '';
      pie.append(i + 1 < pool.length
        ? h('button', { class: 'boton', type: 'button', onclick: () => { i++; mostrar(); } }, 'Siguiente')
        : h('button', { class: 'boton', type: 'button', onclick: fin }, 'Ver resultado'));
      pie.querySelector('button').focus();
    } });
    zona.append(tarjeta);
  }
  function fin() {
    zona.innerHTML = ''; pie.innerHTML = '';
    progreso.textContent = '';
    zona.append(h('div', { class: 'hoja' }, h('span', { class: 'nota-final' }, `${bien}/${pool.length}`),
      h('p', {}, bien === pool.length ? 'Impecable.' : 'Las que erraste quedaron en Repaso: van a volver a aparecer en los próximos días.'),
      h('div', { class: 'acciones' }, h('button', { class: 'boton', type: 'button', onclick: () => navegar() }, 'Otra tanda'), h('a', { class: 'boton secundario', href: '#/repaso' }, 'Ir a Repaso'))));
    marcarNav();
  }
  mostrar();
}

// ---------------- Parciales reales ----------------
function vistaParciales(main) {
  const grupos = {};
  for (const e of D.PARCIALES.examenes) (grupos[e.periodo] = grupos[e.periodo] || []).push(e);
  const cont = h('div', { class: 'columna' },
    h('h1', {}, 'Parciales reales'),
    h('p', { class: 'bajada' }, `${D.PARCIALES.examenes.length} parciales distintos (${D.PARCIALES.preguntas.length} preguntas) con la respuesta oficial. Cada pregunta indica de qué parcial y letra viene. Rendilos como simulacro y te queda registrado cuáles hiciste y con qué nota.`));
  for (const per of Object.keys(grupos).sort().reverse()) {
    const t = h('table', { class: 'tabla' }, h('thead', {}, h('tr', {}, h('th', {}, 'Parcial'), h('th', {}, 'Formato'), h('th', {}, 'Tu mejor nota'), h('th', {}, 'Rendido'), h('th', {}, ''))));
    const tb = h('tbody');
    for (const e of grupos[per]) {
      const ints = P.intentosExamen(e.id);
      const mejor = ints.length ? Math.max(...ints.map(x => x.bien)) : null;
      tb.append(h('tr', {},
        h('td', {}, h('a', { href: `#/parcial/${e.id}` }, `${e.dia} · ${e.tema}`)),
        h('td', { class: 'chico suave' }, e.formato),
        h('td', {}, mejor === null ? '—' : `${mejor} / ${e.preguntas.length}`),
        h('td', { class: 'chico' }, ints.length ? `${ints.length} ${ints.length === 1 ? "vez" : "veces"}, última ${new Date(ints[ints.length - 1].fecha).toLocaleDateString('es-AR')}` : h('span', { class: 'suave' }, 'nunca')),
        h('td', {}, h('a', { class: 'boton secundario', href: `#/parcial/${e.id}` }, ints.length ? 'Rendir de nuevo' : 'Rendir'))));
    }
    t.append(tb);
    cont.append(h('h2', {}, tituloPeriodo(per)), h('div', { class: 'envoltura-tabla' }, t));
  }
  main.append(cont);
}
const tituloPeriodo = per => per === '2025' ? '2025' : per.replace(/(\d{4})-(\d)C/, '$1 · $2º cuatrimestre');

function vistaParcial(main, eid, q) {
  const e = D.examen(eid);
  if (!e) { main.append(h('p', { class: 'vacio' }, 'No existe ese parcial.')); return; }
  const prm = parametros(q);
  const modo = prm.modo || null;
  const preguntas = e.preguntas.map(id => D.porId[id]);
  const cont = h('div', { class: 'columna texto' },
    h('p', { class: 'chico suave', style: 'margin:0 0 4px' }, h('a', { href: '#/parciales' }, 'Parciales'), ' / ', e.titulo),
    h('h1', {}, e.titulo),
    h('p', { class: 'suave chico' }, `Archivo original: ${e.archivo_original}`));
  main.append(cont);
  if (!modo) {
    cont.append(h('p', { class: 'bajada' }, `${preguntas.length} preguntas de opción múltiple. Elegí cómo rendirlo:`),
      h('div', { class: 'acciones' },
        h('a', { class: 'boton', href: `#/parcial/${eid}?modo=simulacro` }, 'Simulacro: corrijo al final'),
        h('a', { class: 'boton secundario', href: `#/parcial/${eid}?modo=guiado` }, 'Pregunta por pregunta, con corrección inmediata')),
      historial(eid));
    return;
  }
  // anexos arriba (como en el parcial)
  const anexos = Object.entries(e.anexos);
  if (anexos.length) cont.append(h('h2', {}, 'Anexos'), ...anexos.map(([k, a]) => h('details', { class: 'anexo' }, h('summary', {}, a.titulo.replace(/\s+/g, ' ')), h('img', { src: '../contenido/' + a.img, alt: a.titulo }))));
  const respuestas = {};
  const tarjetas = preguntas.map((p, i) => tarjetaPregunta(p, { modo: modo === 'guiado' ? 'inmediato' : 'examen', numero: p.letra, mostrarRef: false, anexo: false, onRespuesta: (id, n) => { respuestas[id] = n; } }));
  cont.append(h('h2', {}, 'Preguntas'), ...tarjetas);
  const res = h('div');
  const inicio = Date.now();
  const btn = h('button', { class: 'boton', type: 'button' }, 'Terminar y corregir');
  btn.addEventListener('click', () => {
    const sinResp = preguntas.filter(p => !respuestas[p.id]).length;
    if (sinResp && !confirm(`Te quedan ${sinResp} sin responder. ¿Corrijo igual?`)) return;
    tarjetas.forEach(t => t.corregir(modo !== 'guiado'));
    const bien = preguntas.filter(p => respuestas[p.id] === p.correcta).length;
    const porUnidad = {};
    for (const p of preguntas) { const k = p.unidad; porUnidad[k] = porUnidad[k] || [0, 0]; porUnidad[k][1]++; if (respuestas[p.id] === p.correcta) porUnidad[k][0]++; }
    P.registrarExamen(eid, { bien, total: preguntas.length, modo, minutos: Math.round((Date.now() - inicio) / 60000), respuestas });
    res.innerHTML = '';
    res.append(h('div', { class: 'hoja' }, h('span', { class: 'nota-final' }, `${bien}/${preguntas.length}`),
      h('h3', {}, 'Por tema'),
      h('ul', {}, ...Object.entries(porUnidad).map(([k, [b, t]]) => { const u = D.unidad(k); return h('li', {}, `${u ? u.titulo : k}: ${b} de ${t}`); })),
      h('p', { class: 'chico suave' }, 'Bajá para ver la corrección de cada pregunta. Las que erraste quedaron en Repaso.')));
    btn.disabled = true;
    res.scrollIntoView({ behavior: 'smooth' });
    marcarNav();
  });
  cont.append(h('div', { class: 'acciones' }, btn), res);
}
function historial(eid) {
  const ints = P.intentosExamen(eid);
  if (!ints.length) return h('p', { class: 'suave' }, 'Todavía no lo rendiste.');
  return h('div', {}, h('h2', {}, 'Tus intentos'), h('ul', {}, ...ints.map(x => h('li', {}, `${new Date(x.fecha).toLocaleString('es-AR')}: ${x.bien}/${x.total} (${x.modo === 'simulacro' ? 'simulacro' : 'guiado'}${x.minutos ? `, ${x.minutos} min` : ''})`))));
}

// ---------------- Repaso ----------------
function vistaRepaso(main) {
  const ids = P.paraRepasar();
  const pool = ids.map(id => D.porId[id]).filter(Boolean);
  const cont = h('div', { class: 'columna texto' }, h('h1', {}, 'Repaso'),
    h('p', { class: 'bajada' }, 'Acá vuelven las preguntas que erraste. Cada vez que la acertás, tarda más en volver (1, 3, 7 y 16 días). Si la errás, vuelve a empezar. Es la forma más eficiente de fijar lo que te cuesta.'));
  main.append(cont);
  sesion(cont, pool.slice(0, 30), 'No tenés nada pendiente para hoy. Cuando erres preguntas en la práctica o en un parcial, aparecen acá.');
}

// ---------------- Ajustes ----------------
function vistaAjustes(main) {
  const inp = h('input', { type: 'file', accept: 'application/json', hidden: true });
  inp.addEventListener('change', async () => {
    try { await P.importar(inp.files[0]); alert('Progreso importado.'); navegar(); } catch (e) { alert(e.message); }
  });
  const tema = P.get().ajustes.tema || 'auto';
  const sel = h('select', {}, opt('auto', 'Según el sistema', tema), opt('claro', 'Claro', tema), opt('oscuro', 'Oscuro', tema));
  sel.addEventListener('change', () => { P.get().ajustes.tema = sel.value; aplicarTema(); P.guardar(); });
  main.append(h('div', { class: 'columna texto' }, h('h1', {}, 'Ajustes'),
    h('h2', {}, 'Dónde está tu progreso'),
    h('p', {}, P.modoGuardado() === 'servidor'
      ? 'Se guarda en el archivo progreso.json, en la carpeta del sistema. Además se hace una copia por día en la carpeta backups. Ese archivo no se sube a GitHub: es solo tuyo.'
      : 'Abriste la app sin el servidor, así que el progreso se guarda en este navegador. Para guardarlo en un archivo, abrí la app con iniciar.bat.'),
    h('div', { class: 'acciones' },
      h('button', { class: 'boton secundario', type: 'button', onclick: () => P.exportar() }, 'Descargar copia del progreso'),
      h('button', { class: 'boton secundario', type: 'button', onclick: () => inp.click() }, 'Importar progreso'), inp),
    h('h2', {}, 'Apariencia'), h('label', { class: 'campo' }, 'Tema', sel),
    h('h2', {}, 'Empezar de cero'),
    h('p', { class: 'suave' }, 'Borra todas tus respuestas, notas de parciales y unidades aprobadas. Antes descargá una copia por las dudas.'),
    h('button', { class: 'boton secundario', type: 'button', onclick: () => { if (confirm('¿Borrar todo tu progreso? No se puede deshacer.')) { P.reiniciar(); navegar(); } } }, 'Borrar mi progreso')));
}
function aplicarTema() {
  const t = (P.get().ajustes || {}).tema || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-tema'); else document.documentElement.setAttribute('data-tema', t);
}

// ---------------- Arranque ----------------
async function iniciar() {
  try {
    await Promise.all([P.cargar(), D.cargarTodo()]);
  } catch (e) {
    $main().innerHTML = `<p class="vacio">No pude cargar el contenido (${e.message}). Abrí la app con <b>iniciar.bat</b> (o <code>python servidor.py</code>) en vez de abrir el archivo directamente.</p>`;
    return;
  }
  aplicarTema();
  P.alCambiar(pintarGuardado);
  pintarGuardado();
  window.addEventListener('hashchange', navegar);
  navegar();
}
iniciar();
export { navegar, sesion };
