// Explicaciones automáticas para preguntas reales de Búsqueda y Emparrillado:
// se resuelven con los motores (validados contra las respuestas de la cátedra) y se muestra el paso a paso.
import * as B from './motores/busqueda.js';
import { metodoDeTexto, correr } from './motores/busqueda_preguntas.js';
import * as E from './motores/emparrillado.js';
import { ARBOLES, arbolDeExamen } from '../../contenido/arboles_parciales.js';
import { EMPARRILLADOS, emparrilladoDeExamen } from '../../contenido/emparrillados_parciales.js';

export function resumenMetodo(t, key) {
  const r = correr(t, key);
  const nombre = B.METODOS[key].nombre;
  const sol = r.solucion ? `llega a la solución ${r.solucion}` : 'NO llega a ninguna solución';
  if (r.iteraciones) {
    return `${nombre}: cerrados ${r.cerrados.join(', ')} → ${sol}. Abiertos al final: ${r.abiertosFinal.length ? r.abiertosFinal.map(x => x.txt).join(', ') : '(vacía)'}`;
  }
  if (r.generados) return `${nombre}: generados ${r.generados.join(', ')} | visitados ${r.visitados.join(', ')} → ${sol}`;
  return `${nombre}: recorre ${(r.visitados || r.recorrido).join(', ')} → ${sol}`;
}

export function tablaIteraciones(t, key, hasta = Infinity) {
  const r = correr(t, key);
  if (!r.iteraciones) return '';
  return r.iteraciones.filter(i => i.num <= hasta).map(i =>
    `Iteración ${i.num}: actual ${i.actual}${i.esSolucion ? ' (¡solución!)' : ''} | abiertos: ${i.abiertos.map(a => a.txt).join(', ') || '(vacía)'} | cerrados: ${i.cerrados.join(', ')}`).join('\n');
}

function explicarBusqueda(p) {
  const k = arbolDeExamen(p.examen); if (!k) return null;
  const t = ARBOLES[k];
  const e = p.enunciado.replace(/\s+/g, ' ');
  const keys = new Set();
  const q = e.match(/[“"]([^”"]+)[”"]/); if (q && metodoDeTexto(q[1])) keys.add(metodoDeTexto(q[1]));
  const mr = e.match(/mismo recorrido que (.+?) es/i); if (mr && metodoDeTexto(mr[1])) keys.add(metodoDeTexto(mr[1]));
  const dirEnun = /de derecha a izquierda/i.test(e) && !q ? ' (derecha a izquierda)' : '';
  for (const o of p.opciones) { const kk = metodoDeTexto(/izquierda|derecha/.test(o) ? o : o + dirEnun); if (kk) keys.add(kk); }
  if (!keys.size) return null;
  const lineas = [`Resuelto con el motor (${t.mejor} valor heurístico = más deseable):`];
  for (const kk of keys) lineas.push('• ' + resumenMetodo(t, kk));
  const it = e.match(/iteraci[óo]n N° ?(\d+)/i);
  if (it && q) lineas.push('', tablaIteraciones(t, metodoDeTexto(q[1]), +it[1]));
  return lineas.join('\n');
}

function explicarEmparrillado(p) {
  const k = emparrilladoDeExamen(p.examen); if (!k) return null;
  const A = E.analizar(EMPARRILLADOS[k]);
  const e = p.enunciado;
  const fmt = g => g.map(x => '(' + x.join(', ') + ')').join('; ');
  const pasos = arr => arr.map(s => `  nivel ${s.nivel}: une ${s.une.map(u => '[' + u.join(',') + ']').join(' + ')}`).join('\n');
  if (/caracter[íi]stica/i.test(e) && /grupo/i.test(e))
    return `Árbol de características (mínima distancia entre min(d1, d2)):\n${pasos(A.arbolC.pasos)}\nGrupos: ${fmt(A.gruposC)} → ${A.gruposC.length} grupo(s)`;
  if (/elemento/i.test(e) && /grupo/i.test(e))
    return `Árbol de elementos (mínima distancia):\n${pasos(A.arbolE.pasos)}\nGrupos: ${fmt(A.gruposE)} → ${A.gruposE.length} grupo(s)`;
  const m = e.match(/relaci[óo]n establecida entre (C\d) y (C\d)/i);
  if (m) {
    const g = A.gruposC.find(x => x.includes(m[1]));
    const mismo = g && g.includes(m[2]);
    return `Grupos de características: ${fmt(A.gruposC)}.\n${m[1]} y ${m[2]} ${mismo ? 'están en el MISMO grupo: hay que leer el texto y armar las flechas entre polos para tipificar la relación.' : 'están en grupos DISTINTOS → no existe relación (solo se relacionan características del mismo grupo).'}`;
  }
  const d = e.match(/\bd([12]) entre (C\d) y (C\d)/);
  if (d) return `d${d[1]}(${d[2]}, ${d[3]}) = ${E.dist(d[1] === '1' ? A.d1 : A.d2, d[2], d[3])}`;
  return null;
}

export function explicarReal(p) {
  try {
    if (p.unidad === 'u5-busqueda') return explicarBusqueda(p);
    if (p.unidad === 'u4-emparrillado') return explicarEmparrillado(p);
  } catch (err) { console.warn(err); }
  return null;
}
