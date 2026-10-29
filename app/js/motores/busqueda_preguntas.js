// Interpreta preguntas tipo parcial sobre métodos de búsqueda y las resuelve con el motor.
// Se usa para validar el motor y para corregir/generar preguntas nuevas.
import * as M from './busqueda.js';

export function metodoDeTexto(txt) {
  const t = txt.toLowerCase();
  const der = /derecha a izquierda/.test(t);
  if (/beam search\s*\(?\s*n\s*=\s*(\d)/.test(t)) return 'beam' + t.match(/n\s*=\s*(\d)/)[1];
  if (/m[áa]xima pendiente/.test(t)) return 'maxpend';
  if (/escalada/.test(t)) return der ? 'escalada_der' : 'escalada_izq';
  if (/primero (el )?mejor/.test(t)) return 'pm';
  if (/a\s*\*/.test(t)) return 'astar';
  if (/profundidad/.test(t)) return der ? 'profundidad_der' : 'profundidad_izq';
  if (/amplitud/.test(t)) return der ? 'amplitud_der' : 'amplitud_izq';
  if (/generaci[óo]n y prueba/.test(t)) return 'gyp_izq';
  return null;
}

const cache = new WeakMap();
export function correr(t, key) {
  let c = cache.get(t); if (!c) { c = {}; cache.set(t, c); }
  if (!c[key]) c[key] = M.METODOS[key].fn(t);
  return c[key];
}

function letras(s) {
  if (/vac[íi]a/i.test(s)) return [];
  return (s.match(/\b[A-Z]\b/g) || []);
}
function valores(s) {
  if (/vac[íi]a/i.test(s)) return [];
  return [...s.matchAll(/([A-Z])\s*\(\s*(-?\d+)\s*\)/g)].map(m => m[1] + ':' + m[2]);
}
const igual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const mismoConjunto = (a, b) => igual([...a].sort(), [...b].sort());

function lista(r, tipo) {
  if (tipo === 'generados') return r.generados || r.recorrido || r.visitados;
  if (tipo === 'visitados') return r.visitados || r.recorrido;
  if (tipo === 'cerrados') return r.cerrados || r.visitados || r.recorrido;
  return null;
}

// Devuelve un array de booleanos (una por opción) o null si no se reconoce la pregunta
export function evaluarPregunta(t, enunciado, opciones) {
  const e = enunciado.replace(/\s+/g, ' ');
  let m;
  // si la dirección está en el enunciado, aplica a las opciones que no la dicen
  const dirEnun = /recorre el árbol de derecha a izquierda/i.test(e) ? ' (recorriendo de derecha a izquierda)' : '';
  const metodoOpc = o => metodoDeTexto(/izquierda|derecha/i.test(o) ? o : o + dirEnun);
  const ninguno = o => /^ning[úu]n m[ée]todo/i.test(o.trim());
  const todas = o => /^todas las (opciones|anteriores)/i.test(o.trim());
  const porMetodo = (pred) => {
    const r = opciones.map(o => { if (ninguno(o) || todas(o)) return null; const k = metodoOpc(o); return k ? pred(correr(t, k)) : false; });
    const algun = r.some(x => x === true), todos = r.filter(x => x !== null).every(x => x === true);
    if (opciones.some(todas) && todos) return opciones.map(o => todas(o));
    return r.map((x, i) => x === null ? (ninguno(opciones[i]) ? !algun : false) : x);
  };
  const comillas = e.match(/[“"]([^”"]+)[”"]/);
  const metEnun = comillas ? metodoDeTexto(comillas[1]) : null;

  // "lista final de nodos cerrados ... “X” es la misma que se logra al aplicar …"
  if ((m = e.match(/lista final de nodos (\w+).*es la misma que/i)) && metEnun) {
    const tipo = m[1].toLowerCase();
    const base = lista(correr(t, metEnun), tipo);
    return opciones.map(o => { const k = metodoDeTexto(o); return k ? igual(lista(correr(t, k), tipo), base) : false; });
  }
  // "lista final de nodos X que se obtiene utilizando “M” es …"
  if ((m = e.match(/lista final de nodos (\w+)/i)) && metEnun) {
    const tipo = m[1].toLowerCase();
    const r = correr(t, metEnun);
    if (tipo === 'abiertos') {
      const fin = (r.abiertosFinal || []).map(x => x.n + ':' + x.v);
      return opciones.map(o => mismoConjunto(valores(o), fin) && (valores(o).length > 0 || /vac/i.test(o)) || (fin.length === 0 && /vac[íi]a/i.test(o)));
    }
    const l = lista(r, tipo);
    return opciones.map(o => igual(letras(o.replace(/\(.*?\)/g, '')), l));
  }
  // "en la iteración N° k del algoritmo, el valor del nodo Y es …"
  if ((m = e.match(/iteraci[óo]n N° ?(\d+).*valor del nodo ([A-Z])/i)) && metEnun) {
    const k = +m[1], nodo = m[2];
    const it = correr(t, metEnun).iteraciones[k - 1];
    const x = it && it.abiertos.find(a => a.n === nodo);
    return opciones.map(o => { const v = valores(o); return !!x && v.length === 1 && v[0] === nodo + ':' + x.v; });
  }
  // "en la iteración N° k ..., la lista de nodos abiertos es …"
  if (((m = e.match(/iteraci[óo]n N° ?(\d+).*lista de nodos (abiertos|cerrados)/i)) ||
       (m = e.match(/lista de nodos (abiertos|cerrados) en la iteraci[óo]n N° ?(\d+)/i)) && (m = [m[0], m[2], m[1]])) && metEnun) {
    const k = +m[1];
    const it = correr(t, metEnun).iteraciones[k - 1];
    if (!it) return opciones.map(() => false);
    if (m[2] === 'abiertos') {
      const l = it.abiertos.map(a => a.n + ':' + a.v);
      return opciones.map(o => mismoConjunto(valores(o), l));
    }
    return opciones.map(o => igual(letras(o), it.cerrados));
  }
  // "el único método de búsqueda que alcanza la solución S"
  if ((m = e.match(/alcanza la soluci[óo]n ([A-Z])/i))) { const s = m[1]; return porMetodo(r => r.solucion === s); }
  if (/(no llega|no alcanza)( a)? ninguna soluci[óo]n/i.test(e)) return porMetodo(r => !r.solucion);
  if (/(alcanza|llega a) (una|alguna) soluci[óo]n/i.test(e)) return porMetodo(r => !!r.solucion);
  // "El método de búsqueda cuya lista final de nodos cerrados es “S, I, C, J, F” es …"
  if ((m = e.match(/cuya lista final de nodos (\w+) es [“"]([^”"]+)[”"]/i))) {
    const tipo = m[1].toLowerCase(), base = letras(m[2]);
    return porMetodo(r => igual(lista(r, tipo), base));
  }
  // "La cantidad total de iteraciones que utiliza “M” para llegar al nodo solución"
  if (/cantidad (total )?de iteraciones/i.test(e) && metEnun) {
    const n = correr(t, metEnun).iteraciones.length;
    return opciones.map(o => { const x = o.match(/\d+/); return !!x && +x[0] === n; });
  }
  // "el método que genera el mismo recorrido que X"
  if ((m = e.match(/mismo recorrido que (.+?) es/i))) {
    const base = metodoDeTexto(m[1]);
    if (!base) return null;
    const b = M.recorridoDe(correr(t, base));
    return opciones.map(o => { const k = metodoDeTexto(o); return k ? igual(M.recorridoDe(correr(t, k)), b) : false; });
  }
  return null;
}
