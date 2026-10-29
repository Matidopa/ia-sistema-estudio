// Dibuja un árbol/grafo de búsqueda en SVG, con el estilo del Anexo B de los parciales.
// resaltar: { actual: 'A', abiertos: ['B'], cerrados: ['C'] } (opcional, para el simulador)
export function svgArbol(t, resaltar = {}, estatico = false) {
  // nivel = profundidad máxima desde la raíz (los hijos siempre quedan abajo de sus padres)
  const nivel = { [t.raiz]: 0 };
  const orden = [t.raiz];
  const cola = [t.raiz];
  while (cola.length) {
    const n = cola.shift();
    for (const [c] of t.hijos[n] || []) {
      const nv = nivel[n] + 1;
      if (nivel[c] === undefined || nivel[c] < nv) { nivel[c] = nv; }
      if (!orden.includes(c)) { orden.push(c); }
      cola.push(c);
      if (cola.length > 500) break;
    }
  }
  const niveles = [];
  for (const n of orden) (niveles[nivel[n]] = niveles[nivel[n]] || []).push(n);
  // ordenar cada nivel por la posición promedio de sus padres (menos cruces)
  const x = {};
  const W = 640, AN = 46, AL = 26, DY = 78;
  niveles.forEach((fila, li) => {
    if (li > 0) {
      const pos = n => {
        const ps = Object.entries(t.hijos).filter(([, hs]) => hs.some(([c]) => c === n)).map(([p]) => x[p]).filter(v => v !== undefined);
        const idxEnPadre = Object.entries(t.hijos).flatMap(([p, hs]) => hs.map(([c], i) => (c === n ? i / 10 : null))).filter(v => v !== null)[0] || 0;
        return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length + idxEnPadre : 0;
      };
      fila.sort((a, b) => pos(a) - pos(b));
    }
    const paso = W / (fila.length + 1);
    fila.forEach((n, i) => { x[n] = paso * (i + 1); });
  });
  const y = n => 30 + nivel[n] * DY;
  const H = 30 + (niveles.length - 1) * DY + 50;
  let tinta, birome, papel, verde, amarillo;
  if (estatico) { // para incrustar en la teoría: colores por variables CSS (respeta modo oscuro)
    tinta = 'var(--tinta)'; birome = 'var(--birome)'; papel = 'var(--papel-2)'; verde = 'var(--resaltador)'; amarillo = 'var(--amarillo)';
  } else {
    const css = getComputedStyle(document.documentElement);
    tinta = css.getPropertyValue('--tinta').trim() || '#222';
    birome = css.getPropertyValue('--birome').trim() || '#1d3f8f';
    papel = css.getPropertyValue('--papel-2').trim() || '#fff';
    verde = css.getPropertyValue('--resaltador').trim() || '#a6eb7e';
    amarillo = css.getPropertyValue('--amarillo').trim() || '#ffe766';
  }
  const pint = (attr, c) => (estatico ? `style="${attr}:${c}"` : `${attr}="${c}"`);
  const idSvg = Math.random().toString(36).slice(2, 7);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Árbol de búsqueda" font-family="Atkinson, sans-serif">`;
  s += `<defs><marker id="fl${idSvg}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" ${pint('fill', tinta)}/></marker></defs>`;
  for (const [p, hs] of Object.entries(t.hijos)) for (const [c, costo] of hs) {
    const x1 = x[p], y1 = y(p) + AL / 2, x2 = x[c], y2 = y(c) - AL / 2;
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2 - 2}" ${pint('stroke', tinta)} stroke-width="1.2" marker-end="url(#fl${idSvg})"/>`;
    if (costo !== undefined && costo !== null) {
      const mx = (x1 + x2) / 2 + (x2 >= x1 ? 8 : -8), my = (y1 + y2) / 2;
      s += `<text x="${mx}" y="${my}" font-size="12" ${pint('fill', birome)} text-anchor="middle">${costo}</text>`;
    }
  }
  for (const n of orden) {
    const nd = t.nodos[n];
    const sol = nd.sol;
    let fondo = papel;
    if ((resaltar.cerrados || []).includes(n)) fondo = verde;
    if ((resaltar.abiertos || []).includes(n)) fondo = amarillo;
    const esAct = resaltar.actual === n;
    s += `<g><rect x="${x[n] - AN / 2}" y="${y(n) - AL / 2}" width="${AN}" height="${AL}" rx="4" style="fill:${fondo};stroke:${esAct ? birome : tinta}" stroke-width="${sol ? 3.2 : esAct ? 3 : 1.2}"/>`;
    s += `<text x="${x[n]}" y="${y(n) + 4}" font-size="13" font-weight="700" text-anchor="middle" ${pint('fill', tinta)}>${n}</text>`;
    s += `<text x="${x[n] + AN / 2 + 4}" y="${y(n) + 4}" font-size="12" ${pint('fill', tinta)}>${nd.h === Infinity ? '∞' : nd.h}</text></g>`;
  }
  s += '</svg>';
  return s;
}

// Matriz de distancias en el formato del Anexo C (tabla HTML)
export function tablaMatriz(etiquetas, valor) {
  let s = '<table class="matriz"><tr><th></th>' + etiquetas.map(e => `<th>${e}</th>`).join('') + '</tr>';
  for (const a of etiquetas) {
    s += `<tr><th>${a}</th>`;
    for (const b of etiquetas) {
      if (a === b) s += '<td class="diag"></td>';
      else { const v = valor(a, b); s += `<td>${v === null || v === undefined ? '' : v}</td>`; }
    }
    s += '</tr>';
  }
  return s + '</table>';
}
