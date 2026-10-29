// Modo exprés: plan corto armado con la frecuencia real de cada tema en los parciales.
import * as P from '../progreso.js';
import * as D from '../datos.js';
import { h, articuloTeoria, barra } from '../componentes.js';
import { sesion } from './sesion.js';
import { examen, armarSimulacro } from './examen.js';
import * as PL from '../plan.js';

const SIM = { 'u5-busqueda': ['#/simuladores/busqueda', 'Simulador de búsqueda paso a paso'], 'u4-emparrillado': ['#/simuladores/emparrillado', 'Simulador de emparrillado'], 'u3-protocolos': ['#/catedra/ga-01', 'Protocolo interactivo de la guía (marcás y corrige)'], 'u7-ag': ['#/simuladores/ag', 'Ruleta de algoritmos genéticos'] };
const CRITERIO = { mecanica: 0.7, teoria: 0.75 };

export function vistaExpres(main) {
  const r = PL.resumenExpres();
  const sig = PL.siguientePasoExpres();
  const cont = h('div', { class: 'columna' },
    h('p', { class: 'previo-titulo' }, 'Modo exprés · jugado de tiempo'),
    h('h1', {}, 'Tu plan exprés'),
    h('p', { class: 'bajada' }, `Directo a lo que más se toma. Armado con las ${D.PARCIALES.preguntas.length} preguntas de los ${D.PARCIALES.examenes.length} parciales reales: primero las tres técnicas que se aprenden con práctica mecánica (son unas 15 de las 25 preguntas), después la teoría que más se repite y al final un simulacro.`),
    h('div', { class: 'hoja resumen-plan' },
      h('div', { class: 'resumen-datos' },
        dato(PL.fmtMin(r.total), 'tiempo total estimado'),
        dato(`${r.hechos} de ${r.pasos.length}`, 'pasos hechos'),
        dato(r.restante ? PL.fmtMin(r.restante) : '¡Listo!', 'te queda')),
      barra(r.hechos / r.pasos.length, true),
      sig ? h('div', { class: 'acciones', style: 'margin-bottom:0' }, h('a', { class: 'boton', href: `#/expres/${sig.id}` }, r.hechos ? `Seguir: ${sig.titulo}` : 'Empezar el plan'), h('span', { class: 'chico suave' }, `${PL.fmtMin(sig.minutos)} este paso`)) : null),
    P.modoEstudio() !== 'expres' ? h('p', { class: 'chico suave' }, 'Estás en modo completo. Igual podés hacer este plan: el progreso es uno solo. ', h('button', { class: 'enlace', type: 'button', onclick: () => { P.setModoEstudio('expres'); location.hash = '#/expres'; dispatchEvent(new HashChangeEvent('hashchange')); } }, 'Pasarme a modo exprés')) : null);
  if (r.terminado) cont.append(bloqueFaltante(true));
  const ol = h('ol', { class: 'pasos-plan' });
  r.pasos.forEach((p, i) => {
    const hecho = PL.pasoHecho(p), info = P.pasoExpres(p.id);
    const actual = sig && sig.id === p.id;
    ol.append(h('li', { class: 'paso-plan' + (hecho ? ' hecho' : '') + (actual ? ' actual' : '') },
      h('span', { class: 'nodo', 'aria-hidden': 'true' }, hecho ? '✓' : String(i + 1)),
      h('div', { class: 'paso-cuerpo' },
        h('a', { class: 'titulo', href: `#/expres/${p.id}` }, p.titulo),
        h('div', { class: 'meta' }, h('span', { class: 'etiqueta' }, PL.fmtMin(p.minutos)), ' ', etiquetaTipo(p.tipo),
          hecho ? h('span', { class: 'etiqueta ok' }, info && info.nota != null ? `hecho · ${info.nota}/${info.total}` : info ? 'hecho' : 'aprobada en la ruta') : null),
        h('p', { class: 'chico' }, p.detalle))));
  });
  cont.append(h('h2', {}, 'Los pasos'), ol);
  if (!r.terminado) cont.append(h('details', { class: 'hoja plegable' }, h('summary', {}, '¿Qué me queda del camino completo?'), bloqueFaltante(false)));
  main.append(cont);
}
const dato = (v, t) => h('div', { class: 'dato-chico' }, h('b', {}, v), h('span', {}, t));
const etiquetaTipo = t => h('span', { class: 'etiqueta tipo-' + t }, { intro: 'lectura', mecanica: 'técnica + práctica', bloque: 'mini simulacro', teoria: 'teoría + preguntas', repaso: 'repaso', final: 'simulacro' }[t]);

// Lo que falta del camino completo, ordenado por peso en el parcial
export function bloqueFaltante(destacado) {
  const f = PL.faltanteCompleto();
  const fr = PL.frecuencias();
  const orden = arr => [...arr].sort((a, b) => (fr[b.u.id] ? fr[b.u.id].reciente : 0) - (fr[a.u.id] ? fr[a.u.id].reciente : 0));
  const sigUnidad = D.RUTA.unidades.find(u => !P.estadoUnidad(u.id).aprobada);
  const tipos = { protocolo: 'Protocolos', emparrillado: 'Emparrillado', busqueda: 'Búsqueda', texto: 'Otros' };
  const caja = h('div', { class: destacado ? 'hoja faltante destacado' : 'faltante' },
    destacado ? h('h2', {}, '¡Terminaste el exprés! Esto es lo que te queda del camino completo') : null,
    h('p', {}, 'Lo que ya hiciste cuenta en los dos modos: si seguís con el camino completo, arrancás desde lo que te falta, sin repetir.'),
    f.sinAprobar.length ? h('div', {}, h('h3', {}, `Unidades sin aprobar (${f.sinAprobar.length})`),
      h('ul', { class: 'lista-faltante' }, ...orden(f.sinAprobar).map(x => h('li', {},
        h('a', { href: `#/unidad/${x.u.id}` }, `${x.u.num}. ${x.u.titulo}`),
        h('span', { class: 'chico suave' }, ` · ${x.u.minutos} min${x.u.peso ? ' · ' + x.u.peso : ''}`))))) : h('p', {}, '✓ Todas las unidades aprobadas.'),
    f.sinLeer.length ? h('div', {}, h('h3', {}, `Teoría completa sin leer (${f.sinLeer.length})`),
      h('p', { class: 'chico suave' }, 'Las aprobaste con la ficha corta; la teoría completa tiene ejemplos resueltos y más detalle.'),
      h('ul', { class: 'lista-faltante' }, ...orden(f.sinLeer).map(x => h('li', {}, h('a', { href: `#/unidad/${x.u.id}` }, `${x.u.num}. ${x.u.titulo}`), h('span', { class: 'chico suave' }, ` · ${x.u.minutos} min`))))) : null,
    h('h3', {}, 'Ejercicios de la cátedra'),
    h('ul', { class: 'lista-faltante' }, ...Object.entries(f.catedra).map(([t, c]) => h('li', {}, h('a', { href: '#/catedra' }, tipos[t] || t), h('span', { class: 'chico suave' }, ` · ${c.hechos} de ${c.total} hechos`)))),
    h('h3', {}, 'Preguntas reales que nunca hiciste'),
    h('ul', { class: 'lista-faltante' }, ...orden(f.unidades.filter(x => x.sinVer > 0)).slice(0, 8).map(x => h('li', {}, h('a', { href: `#/practica?u=${x.u.id}&f=real&filtro=nuevas&n=10` }, x.u.corto), h('span', { class: 'chico suave' }, ` · ${x.sinVer} de ${x.reales}`)))),
    h('div', { class: 'acciones' },
      sigUnidad ? h('button', { class: 'boton', type: 'button', onclick: () => { P.setModoEstudio('completo'); location.hash = `#/unidad/${sigUnidad.id}`; } }, `Seguir con el camino completo: ${sigUnidad.corto}`)
        : h('a', { class: 'boton', href: '#/examen' }, 'Hacer otro simulacro')));
  return caja;
}

// ---------- Un paso del plan ----------
export async function vistaPasoExpres(main, id) {
  const pasos = PL.pasosExpres();
  const k = pasos.findIndex(p => p.id === id);
  if (k < 0) { main.append(h('div', { class: 'vacio' }, 'No existe ese paso.')); return; }
  const paso = pasos[k];
  let sig = pasos[k + 1];
  const hecho = PL.pasoHecho(paso);
  const cont = h('div', { class: 'columna' },
    h('p', { class: 'miga chico suave' }, h('a', { href: '#/expres' }, 'Plan exprés'), ` / Paso ${k + 1} de ${pasos.length}`),
    h('h1', {}, paso.titulo),
    h('p', { class: 'bajada' }, paso.detalle),
    h('div', { class: 'fila-meta' }, h('span', { class: 'etiqueta' }, `≈ ${PL.fmtMin(paso.minutos)}`), etiquetaTipo(paso.tipo), hecho ? h('span', { class: 'etiqueta ok' }, 'hecho') : null));
  main.append(cont);
  const zonaFin = h('div');
  const terminarPaso = (info, aprobada) => {
    if (aprobada) {
      P.marcarPasoExpres(paso.id, info);
      for (const u of paso.unidades) if (paso.tipo === 'mecanica' || paso.tipo === 'teoria') P.marcarUnidad(u, { aprobada: true, viaExpres: true });
      sig = PL.siguientePasoExpres(); // el próximo que falta, no necesariamente el de al lado
    }
    zonaFin.innerHTML = '';
    zonaFin.append(h('div', { class: 'hoja paso-fin ' + (aprobada ? 'ok' : 'mal') },
      h('h3', {}, aprobada ? '✓ Paso completado' : 'Todavía no: probá otra tanda'),
      h('p', {}, aprobada ? (sig ? `Siguiente: ${sig.titulo} (${PL.fmtMin(sig.minutos)}).` : 'Terminaste todos los pasos.') : `Para completar el paso necesitás ${Math.round((CRITERIO[paso.tipo] || 0.7) * 100)}% bien. Releé la ficha, mirá las explicaciones de lo que erraste y volvé a intentar.`),
      h('div', { class: 'acciones' },
        aprobada && sig ? h('a', { class: 'boton', href: `#/expres/${sig.id}` }, 'Siguiente paso') : null,
        aprobada && !sig ? h('a', { class: 'boton', href: '#/expres' }, 'Ver qué me queda') : null,
        !aprobada ? h('button', { class: 'boton', type: 'button', onclick: () => dispatchEvent(new HashChangeEvent('hashchange')) }, 'Otra tanda') : null,
        h('a', { class: 'boton secundario', href: '#/expres' }, 'Volver al plan'))));
  };

  if (paso.tipo === 'intro' || paso.tipo === 'mecanica' || paso.tipo === 'teoria') {
    const u = paso.unidades[0];
    let md = '';
    try { md = await D.texto(`expres/${u}.md`); } catch { md = ''; }
    const un = D.unidad(u);
    cont.append(h('section', { class: 'ficha' },
      h('div', { class: 'ficha-cabeza' }, h('h2', {}, 'Ficha: lo esencial'), h('span', { class: 'chico suave' }, `${PL.minutosLectura(md)} min de lectura · resumen escrito con IA en base al material de la cátedra`)),
      md ? articuloTeoria(md, 'teoria ficha-texto') : h('p', { class: 'vacio' }, 'Esta ficha no está disponible.'),
      h('p', { class: 'chico' }, '¿Querés más detalle? ', h('a', { href: `#/unidad/${u}` }, `Teoría completa de ${un.corto} (${un.minutos} min)`),
        SIM[u] ? [' · ', h('a', { href: SIM[u][0] }, SIM[u][1])] : null,
        paso.tipo !== 'intro' ? [' · ', h('a', { href: `#/tarjetas?u=${u}` }, 'Tarjetas de memoria del tema')] : null)));
    if (paso.tipo === 'intro') {
      cont.append(h('div', { class: 'acciones' }, h('button', { class: 'boton', type: 'button', onclick: () => terminarPaso({}, true) }, 'Listo, entendido')), zonaFin);
      return;
    }
    const pool = paso.tipo === 'mecanica' ? PL.practicaDirigida(u, paso.nPreguntas) : PL.masRepetidas(u, paso.nPreguntas);
    const zona = h('section', { class: 'practica-paso' },
      h('h2', {}, paso.tipo === 'mecanica' ? 'Práctica dirigida' : 'Las preguntas que más se repiten'),
      h('p', { class: 'suave' }, paso.tipo === 'mecanica'
        ? `${pool.length} preguntas reales de parciales recientes, priorizando las que nunca hiciste. Con ${Math.round(CRITERIO.mecanica * 100)}% bien el paso queda hecho y la unidad aprobada en los dos modos.`
        : `Una pregunta de cada tipo que más se repite en los parciales. Con ${Math.round(CRITERIO.teoria * 100)}% bien el paso queda hecho y la unidad aprobada.`));
    cont.append(zona, zonaFin);
    sesion(zona, pool, { origen: 'expres', onFin: r => terminarPaso({ nota: r.bien, total: r.total }, r.bien / r.total >= (CRITERIO[paso.tipo] || 0.7)) });
    return;
  }
  if (paso.tipo === 'bloque') {
    const recientes = D.PARCIALES.examenes.filter(e => PL.periodosRecientes().includes(e.periodo));
    const e = recientes.find(x => !P.intentosExamen(x.id).length && !P.intentosExamen('bloque:' + x.id).length) || recientes[Math.floor(Math.random() * recientes.length)];
    const pregs = e.preguntas.map(q => D.porId[q]).filter(p => PL.MECANICAS.includes(p.unidad) && p.anexo);
    cont.append(h('p', { class: 'suave' }, `Sale del parcial ${e.titulo}: ${pregs.length} preguntas con sus anexos, igual que en el parcial. Corregís al final. En pantalla grande el anexo queda fijo al costado.`));
    const z = h('div');
    cont.append(z, zonaFin);
    examen(z, pregs, { eid: 'bloque:' + e.id, onFin: r => terminarPaso({ nota: r.bien, total: r.total }, true) });
    return;
  }
  if (paso.tipo === 'repaso') {
    const ids = P.paraRepasar();
    const pool = ids.map(q => D.porId[q]).filter(Boolean).slice(0, 15);
    const z = h('section');
    cont.append(z, zonaFin);
    if (!pool.length) {
      z.append(h('div', { class: 'vacio' }, 'No tenés errores pendientes para repasar. ¡Bien ahí!'), h('div', { class: 'acciones' }, h('button', { class: 'boton', type: 'button', onclick: () => terminarPaso({}, true) }, 'Marcar como hecho')));
      return;
    }
    sesion(z, pool, { origen: 'repaso', onFin: r => terminarPaso({ nota: r.bien, total: r.total }, true) });
    return;
  }
  if (paso.tipo === 'final') {
    const pregs = armarSimulacro(25);
    cont.append(h('p', { class: 'suave' }, `${pregs.length} preguntas reales mezcladas con la distribución de los parciales recientes. Corregís al final; el cronómetro es solo de referencia.`));
    const z = h('div');
    cont.append(z, zonaFin);
    examen(z, pregs, { eid: 'simulacro', onFin: r => { terminarPaso({ nota: r.bien, total: r.total }, true); zonaFin.append(bloqueFaltante(true)); } });
  }
}
