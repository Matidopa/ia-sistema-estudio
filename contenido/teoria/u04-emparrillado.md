## Para qué sirve

El **Emparrillado** (*Repertory Grid*, George Kelly, 1955) es una técnica de educción basada en el modelo de pensamiento humano: cada persona ve el mundo a su manera. Se le pide al experto que puntúe una lista de **elementos** contra una lista de **características bipolares**, y con esas puntuaciones se descubre qué elementos considera parecidos, qué características van juntas y cómo se relacionan entre sí.

**Definición de la cátedra**: test de clasificación en el que se vincula una lista de elementos homogéneos y representativos sobre la base de un conjunto bipolar de características. La bipolaridad está dada por un conjunto de valores, y aplicando la técnica se extrae la similitud de un conjunto de elementos y la diferencia de ese conjunto con otros.

En el parcial el **Anexo C** trae los elementos, las características y **las matrices de distancias ya calculadas**, más un texto del experto. Preguntan: cuántos grupos hay, qué grupos son y qué tipo de relación hay entre dos características.

## Las etapas

1. **Identificación de los elementos**: deben ser representativos, homogéneos, separables y no solapados (no se puede ser dos elementos a la vez).
2. **Identificación de las características**: cualidades bipolares, cada una con sus dos polos (alto / bajo).
3. **Diseño de la parrilla**: la matriz característica × elemento. Puede ser:
   - **dicotómica** (0/1: tiene o no tiene la característica),
   - **clasificatoria** (1 a n, donde n es la cantidad de elementos; es un ranking, sin empates),
   - **evaluativa** (escala 1 a N elegida por el experto; es la que se usa en los parciales, por ejemplo [1,5]).
4. **Formalización**: distancias y árboles (abajo).
5. **Interpretación**: análisis de los árboles y red de relaciones entre características.

Ventajas: el experto reflexiona sobre el tema, queda una representación gráfica, asocia elementos con características y refina el problema. Desventajas: los valores son subjetivos, captura conocimiento superficial, se complica con muchos elementos o características y **sola no alcanza para armar una base de conocimientos**.

## Formalización 1: distancias entre elementos

Distancia entre dos elementos = **suma de las diferencias absolutas** entre sus columnas (se "baja en vertical"):

```
       E1  E2  E3  E4
  C1    3   3   4   2
  C2    3   4   4   3        d(E1,E2) = |3-3| + |3-4| + |4-3| + |1-3| = 0+1+1+2 = 4
  C3    4   3   3   2
  C4    1   3   4   2
```

Se arma la matriz triangular de distancias entre todos los pares.

## Formalización 2: distancias entre características (d1 y d2)

Las características son bipolares y el orden de los polos es arbitrario ("rápido/lento" podría haberse escrito "lento/rápido"), así que hay que mirar las dos orientaciones:

- **d1(Ci, Cj)** = Σ |Ci − Cj| con la parrilla original (se compara "en horizontal").
- **Parrilla opuesta**: se invierte la escala: opuesto(v) = (máximo + 1) − v. En escala [1,4]: 1↔4, 2↔3. En [1,5]: 1↔5, 2↔4, 3↔3.
- **d2(Ci, Cj)** = Σ |Ci original − Cj opuesta|.

En la matriz de características la cátedra pone **d1 arriba de la diagonal y d2 abajo**. Para agrupar se usa, para cada par, **el mínimo entre d1 y d2**.

> Trampa: en el parcial la matriz ya viene calculada. Lo que tenés que hacer es tomar el **menor** de los dos números simétricos (el de arriba y el de abajo de la diagonal) para cada par antes de agrupar.

## Agrupar por mínima distancia (para elementos y para características)

1. Buscá la **menor distancia** de la matriz.
2. Uní ese par en un grupo. **Si hay empates, se unen todos a la vez**; si los pares empatados comparten un miembro (E1–E2 y E1–E3), forman un solo grupo [E1, E2, E3].
3. Recalculá: la distancia entre el grupo nuevo y cualquier otro = **la mínima** entre sus miembros: d([E1,E4], E2) = mín(d(E1,E2), d(E4,E2)).
4. Repetí hasta que quede todo unido. El orden y el nivel de cada unión forman el **árbol ordenado**.

## Cómo se cuentan los grupos (esto define la mitad de las preguntas)

Se lee el árbol de la siguiente manera:
- Cada vez que se unen **ítems sueltos** entre sí, se forma un **grupo**.
- Si un ítem suelto se une **más tarde a un grupo ya formado**, ese ítem queda como **grupo propio**.
- La unión de **dos grupos ya formados** no crea un grupo nuevo.

Ejemplos de la cátedra:
- Elementos: E1–E4 a nivel 2, E2–E3 a nivel 3, todo junto a nivel 4 → **2 grupos**: (E1, E4); (E2, E3).
- Características: C1–C2 a nivel 1, después se suma C4, después C3 → **3 grupos**: (C1, C2); (C4); (C3).
- Harinas (guía): E2–E3 a nivel 2, después E1 y E4 se suman al mismo tiempo a nivel 4 → **3 grupos**: (E2, E3); (E1); (E4).
- Si a nivel 2 se unen C1–C2, C1–C3 y C1–C4 (todo empatado y conectado) → **1 grupo** con las cuatro.

Interpretación: cuanto **más bajo el nivel** en que se unen, **más parecidos** son desde el punto de vista del experto.

## Interpretación: la red de relaciones entre características

Solo se analiza la relación entre características **del mismo grupo**. Si están en grupos distintos: **no existe relación**, diga lo que diga el texto.

Para tipificar una relación:
1. Escribí los polos en el orden del enunciado: Ci = (A / B), Cj = (X / Y). Por ejemplo C1: Tamaño de Pantalla (grande / pequeño) → A = grande, B = pequeño.
2. Pasá cada frase del texto a una flecha: "las pantallas grandes tienen batería corta" = grande → corta.
3. Compará el dibujo con estos patrones:

<figure><div style="display:flex;flex-wrap:wrap;gap:6px;color:var(--birome)"><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Paralela"><defs><marker id="m4924" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m4924)"/><line x1="115.0" y1="42.0" x2="115.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m4924)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Paralela</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Paralela (al revés)"><defs><marker id="m596" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="84.0" x2="45.0" y2="42.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m596)"/><line x1="115.0" y1="84.0" x2="115.0" y2="42.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m596)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Paralela (al revés)</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Recíproca"><defs><marker id="m5162" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5162)"/><line x1="45.0" y1="84.0" x2="45.0" y2="42.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5162)"/><line x1="115.0" y1="42.0" x2="115.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5162)"/><line x1="115.0" y1="84.0" x2="115.0" y2="42.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5162)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Recíproca</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Ortogonal: una flecha"><defs><marker id="m3623" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m3623)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Ortogonal: una flecha</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Ortogonal: llegan 2"><defs><marker id="m4651" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m4651)"/><line x1="105.1" y1="37.9" x2="54.9" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m4651)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Ortogonal: llegan 2</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Ambigua: abanico"><defs><marker id="m1666" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m1666)"/><line x1="54.9" y1="37.9" x2="105.1" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m1666)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Ambigua: abanico</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Ambigua: abanico + 1"><defs><marker id="m9344" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m9344)"/><line x1="54.9" y1="37.9" x2="105.1" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m9344)"/><line x1="115.0" y1="42.0" x2="115.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m9344)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Ambigua: abanico + 1</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="Ambigua: cruzada"><defs><marker id="m5672" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="42.0" x2="45.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5672)"/><line x1="54.9" y1="37.9" x2="105.1" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5672)"/><line x1="105.1" y1="37.9" x2="54.9" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5672)"/><line x1="115.0" y1="42.0" x2="115.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m5672)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">Ambigua: cruzada</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="No tipificada"><defs><marker id="m6319" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="54.9" y1="37.9" x2="105.1" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m6319)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">No tipificada</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="No tipificada"><defs><marker id="m6319" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="54.9" y1="37.9" x2="105.1" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m6319)"/><line x1="105.1" y1="37.9" x2="54.9" y2="88.1" stroke="currentColor" stroke-width="1.6" marker-end="url(#m6319)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">No tipificada</text></svg><svg viewBox="0 0 150 140" width="150" height="140" xmlns="http://www.w3.org/2000/svg" font-family="Atkinson, sans-serif" role="img" aria-label="No tipificada"><defs><marker id="m6319" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="6" y="32" font-size="12" fill="currentColor">Ci</text><text x="6" y="102" font-size="12" fill="currentColor">Cj</text><text x="45" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">A</text><text x="115" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">B</text><text x="45" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">X</text><text x="115" y="102" font-size="15" font-weight="700" text-anchor="middle" fill="currentColor">Y</text><line x1="45.0" y1="84.0" x2="45.0" y2="42.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m6319)"/><line x1="115.0" y1="42.0" x2="115.0" y2="84.0" stroke="currentColor" stroke-width="1.6" marker-end="url(#m6319)"/><text x="75.0" y="132" font-size="12" text-anchor="middle" fill="currentColor">No tipificada</text></svg></div><figcaption>Polos en el orden del enunciado: Ci = (A / B) arriba, Cj = (X / Y) abajo. Cada flecha es una implicación que dice el texto ("si A entonces X").</figcaption></figure>

| Tipo | Patrón |
|---|---|
| **Paralela** | Dos flechas en el mismo sentido, de cada polo a su polo de abajo: A→X y B→Y (o X→A e Y→B). |
| **Recíproca** | Ida y vuelta en los dos pares: A↔X y B↔Y. |
| **Ortogonal** | Una sola flecha "derecha" (A→X, B→Y, X→A o Y→B), o dos flechas que **llegan al mismo polo** desde los dos polos de la otra característica. |
| **Ambigua** | Un polo implica **los dos** polos de la otra (abanico), con o sin una flecha derecha extra; o las cuatro flechas cruzadas en el mismo sentido. |
| **No tipificada** | Cualquier otra combinación. Por ejemplo una sola flecha **cruzada** (A→Y), dos cruzadas (A→Y y B→X) o dos flechas en sentidos opuestos (X→A y B→Y). |
| **No existe relación** / sin información | Están en grupos distintos, o el texto no dice nada de ellas. |

> Trampa: el orden de los polos importa. "Mecánicos (experto / inexperto)" y "Estrategia (conservadora / agresiva)" con "expertos → agresivas, inexpertos → conservadoras" da flechas **cruzadas** (A→Y, B→X) y la cátedra la marcó **no tipificada**, no paralela.

> Trampa: "la usabilidad no tiene una relación directa con la portabilidad" o "pueden tener alta o baja sensibilidad de frenos" son frases para que veas que **no hay flechas** entre esas dos.

## Ejemplo resuelto completo (guía, Harinas)

Parrilla en escala [1,4]:

| | E1 Integral | E2 Garbanzos | E3 Mandioca | E4 Centeno |
|---|---|---|---|---|
| C1 Fuerza (fuerte / débil) | 3 | 3 | 4 | 2 |
| C2 Proteínas (mayor / menor) | 3 | 4 | 4 | 3 |
| C3 Valor nutritivo (mayor / menor) | 4 | 3 | 3 | 2 |
| C4 Absorción de agua (mayor / menor) | 1 | 3 | 4 | 2 |

**Elementos**: d(E1,E2)=4, d(E1,E3)=6, d(E1,E4)=4, d(E2,E3)=2, d(E2,E4)=4, d(E3,E4)=6. Mínimo 2: [E2,E3]. Después todo a 4 (E1 y E4 se suman juntos) → **3 grupos**: (E2, E3); (E1); (E4).

**Características**: la parrilla opuesta cambia 1↔4 y 2↔3. Quedan d1 = 2, 2, 2, 4, 4, 4 y d2 = 6, 6, 6, 6, 6, 4 (C1C2, C1C3, C1C4, C2C3, C2C4, C3C4). Con el mínimo de cada par: C1 está a 2 de C2, C3 y C4 al mismo tiempo → se unen las cuatro de una → **1 grupo**.

**Relaciones** (todas en el mismo grupo):
- C1–C2: "para ser fuerte necesita muchas proteínas, las débiles tienen poca; muchas proteínas generan harina fuerte y poca, débil" → A↔X y B↔Y → **recíproca**.
- C1–C3: "una harina fuerte puede generar alto valor nutritivo, pero una débil también" → A→X y B→X → **ortogonal**.
- C2–C3: "las de alto valor nutritivo tienen muchas proteínas y las de menos proteínas son de menor valor" → X→A y B→Y → **no tipificada**.
- C3–C4: "las de mayor absorción pueden tener valor mayor o menor; las de menor absorción siempre valor bajo" → X→A, X→B, Y→B → **ambigua**.
- C1–C4 y C2–C4: el texto no dice nada → **sin información** (no existe relación).

## Qué conocimiento da el emparrillado

Conocimiento **declarativo** y **privado**: agrupaciones entre elementos (similitudes y cantidad), agrupaciones entre características y relaciones entre las características agrupadas (válidas, no tipificadas o sin información). Por eso se dice que el ingeniero lo usa para **identificar la relación entre los conceptos** que aplica el experto.
