// Genera muchas preguntas de cada tipo y verifica que sean consistentes.
globalThis.document = { documentElement: {} };
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
const { TIPOS_ALGORITMICOS } = await import('../app/js/generadores.js');
let fallas = 0;
for (const t of TIPOS_ALGORITMICOS) {
  const N = t.id === 'busqueda' ? 300 : 500; let err = 0; const plantillas = {};
  for (let i = 0; i < N; i++) {
    try {
      const p = t.fn();
      if (p.opciones.length !== 4 || new Set(p.opciones).size !== 4) throw new Error('opciones repetidas: ' + JSON.stringify(p.opciones));
      if (!(p.correcta >= 1 && p.correcta <= 4)) throw new Error('correcta inválida');
      const k = p.enunciado.slice(0, 45); plantillas[k] = (plantillas[k] || 0) + 1;
    } catch (e) { err++; if (err < 3) console.log(t.id, e.message); }
  }
  console.log(`${t.id}: ${N - err}/${N} OK, ${Object.keys(plantillas).length} formas de pregunta`);
  fallas += err;
}
process.exit(fallas ? 1 : 0);
