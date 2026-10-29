## Para qué sirve

Muchos problemas se pueden plantear como **buscar un camino** desde un estado inicial hasta un estado solución. Los métodos de búsqueda son las estrategias para recorrer ese espacio. En la materia importan además porque son lo que usa el **Motor de Inferencias** de un Sistema Basado en Conocimientos para decidir qué regla aplicar.

En el parcial el **Anexo B** trae un árbol (en realidad un grafo: un nodo puede tener dos padres) con valores heurísticos al lado de cada nodo y costos sobre los arcos. Dice qué nodos son solución y si **conviene el valor mayor o el menor**. Las preguntas piden listas de nodos o qué método llega a qué solución.

## Vocabulario

- **Estado**: toda la información que describe la situación en un momento.
- **Espacio de estados**: inicial, intermedios y finales (solución).
- **Operadores o reglas**: acciones que pasan de un estado *padre* a un estado *hijo*.
- **Estrategia de control**: la técnica para elegir qué regla o estado aplicar → el método de búsqueda.

Dos familias:

| Sin información del dominio (ciegos) | Con información del dominio (heurísticos) |
|---|---|
| Primero en Amplitud | Escalada Simple |
| Primero en Profundidad | Escalada por Máxima Pendiente |
| Generación y Prueba | Primero el Mejor |
| Bidireccional | Beam Search |
| | A* |

Los heurísticos usan una **función heurística** h (un número por nodo que dice qué tan prometedor es) y A* además el **costo de los arcos**.

## Los métodos ciegos

| Método | Cómo recorre | Cuándo termina | Memoria | Útil cuando |
|---|---|---|---|---|
| **Primero en Amplitud** | Por niveles (cola FIFO) | Recorre todo el árbol | Mucha | Pocas soluciones y cerca de la raíz |
| **Primero en Profundidad** | Por ramas (pila LIFO) | En la **primera** solución que encuentra | Poca | Muchas soluciones lejos de la raíz. No garantiza la óptima. |
| **Generación y Prueba** | Como profundidad, sin cortar | Recorre todo: encuentra **todas** las soluciones | Media | Problemas sencillos |
| **Bidireccional** | Dos búsquedas a la vez (desde arriba y desde la solución); al menos una en amplitud | Cuando se encuentran en un estado intermedio | — | Se conocen el estado inicial y el final |

Detalles que usa la cátedra:
- Se pueden recorrer **de izquierda a derecha** o **de derecha a izquierda** (te lo dice la pregunta). Cambia el orden en que se exploran los hijos.
- Los ciegos recorren el grafo **como si fuera un árbol**: si un nodo tiene dos padres, aparece dos veces en el recorrido.
- En profundidad, el "recorrido" de la cátedra muestra los retrocesos: A, B, E, I, E, J (vuelve a E y baja por J).

## Las escaladas

Las dos solo avanzan a un hijo **estrictamente mejor** que el nodo actual. Si ningún hijo mejora, **se detienen**, aunque no hayan llegado a una solución (se traban en un máximo local). Por eso pueden **no llegar a ninguna solución**.

**Escalada Simple**: genera los hijos **de a uno**, en el sentido pedido, y se mueve al **primero** que mejora.
- *Nodos generados*: la raíz y cada hijo que fue mirando hasta encontrar uno mejor.
- *Nodos visitados*: el camino por el que se movió.

**Escalada por Máxima Pendiente**: genera **todos** los hijos del nodo actual, elige el mejor de todos y se mueve solo si es estrictamente mejor que el actual.

> Trampa: "mejor" depende del anexo. Si dice "cuanto **menor** es el valor heurístico, más deseable", entonces 650 es mejor que 900. Fijate eso antes de cualquier cosa.

## Primero el Mejor

Usa dos listas: **abiertos** (nodos generados que todavía no se expandieron) y **cerrados** (los ya expandidos). En cada iteración:

1. Se toma de abiertos el mejor nodo según h → es el **nodo actual**.
2. Se pregunta si es solución. Si lo es, termina.
3. Si no, pasa a cerrados y sus hijos entran a abiertos (ordenados por h).

Convenciones de la cátedra:
- **Iteración 1** es cuando el nodo actual es la raíz.
- Ante **empate**, va primero el que entró antes a la lista (el más viejo).
- Un nodo que ya está en abiertos o en cerrados no se agrega de nuevo.
- La "lista final" de abiertos es la que queda cuando el nodo actual es la solución (sin la solución).
- **Siempre encuentra una solución si existe**, porque puede volver atrás a cualquier nodo abierto.

## Beam Search (n)

Es Primero el Mejor con la lista de abiertos **limitada a n**: antes de elegir el próximo nodo, la lista se recorta a los n mejores y **los descartados no vuelven nunca más**. Usa menos memoria, pero por haber descartado puede no llegar a la solución que hubiera encontrado Primero el Mejor.

> Trampa: con **n = 1** la lista final de abiertos queda **vacía** (al elegir la solución se descarta todo lo demás). Esa opción, "la lista queda vacía", sale seguido.

## A*

Igual que Primero el Mejor, pero cada nodo se evalúa con **f = h + g**, donde g es la suma de los costos del camino desde la raíz. Si en el anexo "mayor es mejor", la cátedra usa f = h − g (el costo resta).

- Se anota como "C(770 + 70)" o directamente "C(840)".
- Si un nodo vuelve a aparecer por **otro camino con mejor f**, se actualiza su valor.
- Es el más completo: considera lo que promete el nodo y lo que costó llegar.

## Ejemplo resuelto 1: Primero el Mejor (guía, resuelto)

Menor h es mejor. Soluciones: M y K.

<figure class="lienzo"><svg viewBox="0 0 640 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Árbol de búsqueda" font-family="Atkinson, sans-serif"><defs><marker id="flxv7j6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--tinta)"/></marker></defs><line x1="320" y1="43" x2="213.33333333333334" y2="93" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="320" y1="43" x2="426.6666666666667" y2="93" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="213.33333333333334" y1="121" x2="128" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="213.33333333333334" y1="121" x2="256" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="426.6666666666667" y1="121" x2="384" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="426.6666666666667" y1="121" x2="512" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="128" y1="199" x2="160" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="128" y1="199" x2="320" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="384" y1="199" x2="320" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="384" y1="199" x2="480" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="512" y1="199" x2="480" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="512" y1="199" x2="426.6666666666667" y2="327" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="320" y1="277" x2="426.6666666666667" y2="327" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="160" y1="277" x2="213.33333333333334" y2="327" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="213.33333333333334" y1="355" x2="213.33333333333334" y2="405" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><line x1="213.33333333333334" y1="355" x2="426.6666666666667" y2="405" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flxv7j6)"/><g><rect x="297" y="17" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="320" y="34" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">A</text><text x="347" y="34" font-size="12" style="fill:var(--tinta)">14</text></g><g><rect x="190.33333333333334" y="95" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="213.33333333333334" y="112" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">B</text><text x="240.33333333333334" y="112" font-size="12" style="fill:var(--tinta)">5</text></g><g><rect x="403.6666666666667" y="95" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="426.6666666666667" y="112" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">C</text><text x="453.6666666666667" y="112" font-size="12" style="fill:var(--tinta)">3</text></g><g><rect x="105" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="128" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">D</text><text x="155" y="190" font-size="12" style="fill:var(--tinta)">7</text></g><g><rect x="233" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="256" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">E</text><text x="283" y="190" font-size="12" style="fill:var(--tinta)">9</text></g><g><rect x="361" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="384" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">F</text><text x="411" y="190" font-size="12" style="fill:var(--tinta)">6</text></g><g><rect x="489" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="512" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">G</text><text x="539" y="190" font-size="12" style="fill:var(--tinta)">8</text></g><g><rect x="137" y="251" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="160" y="268" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">H</text><text x="187" y="268" font-size="12" style="fill:var(--tinta)">5</text></g><g><rect x="297" y="251" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="320" y="268" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">I</text><text x="347" y="268" font-size="12" style="fill:var(--tinta)">1</text></g><g><rect x="457" y="251" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="480" y="268" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">J</text><text x="507" y="268" font-size="12" style="fill:var(--tinta)">2</text></g><g><rect x="403.6666666666667" y="329" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="3.2"/><text x="426.6666666666667" y="346" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">K</text><text x="453.6666666666667" y="346" font-size="12" style="fill:var(--tinta)">0</text></g><g><rect x="190.33333333333334" y="329" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="213.33333333333334" y="346" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">L</text><text x="240.33333333333334" y="346" font-size="12" style="fill:var(--tinta)">2</text></g><g><rect x="190.33333333333334" y="407" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="213.33333333333334" y="424" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">N</text><text x="240.33333333333334" y="424" font-size="12" style="fill:var(--tinta)">3</text></g><g><rect x="403.6666666666667" y="407" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="3.2"/><text x="426.6666666666667" y="424" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">M</text><text x="453.6666666666667" y="424" font-size="12" style="fill:var(--tinta)">0</text></g></svg></figure>

| It. | Actual | ¿Solución? | Abiertos | Cerrados |
|---|---|---|---|---|
| 1 | A | no | C(3), B(5) | A |
| 2 | C | no | B(5), F(6), G(8) | A, C |
| 3 | B | no | F(6), D(7), G(8), E(9) | A, C, B |
| 4 | F | no | I(1), J(2), D(7), G(8), E(9) | A, C, B, F |
| 5 | I | no | K(0), J(2), D(7), G(8), E(9) | A, C, B, F, I |
| 6 | K | **sí** | J(2), D(7), G(8), E(9) | A, C, B, F, I, K |

Con el mismo árbol:
- **Beam Search n=1**: A → C → F → I → K. Abiertos final: vacía.
- **Escalada Simple (izq → der)**: A(14) → B(5) mejora → hijos de B: D(7) no, E(9) no → se traba en B. Generados A, B, D, E; **no llega a solución**.
- **Primero en Profundidad (izq → der)**: A, B, D, H, L, N, M → llega a **M** (otra solución distinta de la de Primero el Mejor).

## Ejemplo resuelto 2: A* (el de la clase)

Menor es mejor, costo 1 por arco. Soluciones: L y J.

<figure class="lienzo"><svg viewBox="0 0 640 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Árbol de búsqueda" font-family="Atkinson, sans-serif"><defs><marker id="flhh35w" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--tinta)"/></marker></defs><line x1="320" y1="43" x2="213.33333333333334" y2="93" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="258.6666666666667" y="69" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="320" y1="43" x2="426.6666666666667" y2="93" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="381.33333333333337" y="69" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="213.33333333333334" y1="121" x2="106.66666666666667" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="152" y="147" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="213.33333333333334" y1="121" x2="213.33333333333334" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="221.33333333333334" y="147" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="426.6666666666667" y1="121" x2="320" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="365.33333333333337" y="147" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="426.6666666666667" y1="121" x2="426.6666666666667" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="434.6666666666667" y="147" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="426.6666666666667" y1="121" x2="533.3333333333334" y2="171" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="488" y="147" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="213.33333333333334" y1="199" x2="160" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="178.66666666666669" y="225" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="213.33333333333334" y1="199" x2="320" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="274.6666666666667" y="225" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="426.6666666666667" y1="199" x2="320" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="365.33333333333337" y="225" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="533.3333333333334" y1="199" x2="480" y2="249" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="498.6666666666667" y="225" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="160" y1="277" x2="320" y2="327" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="248" y="303" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><line x1="480" y1="277" x2="320" y2="327" style="stroke:var(--tinta)" stroke-width="1.2" marker-end="url(#flhh35w)"/><text x="392" y="303" font-size="12" style="fill:var(--birome)" text-anchor="middle">1</text><g><rect x="297" y="17" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="320" y="34" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">A</text><text x="347" y="34" font-size="12" style="fill:var(--tinta)">12</text></g><g><rect x="190.33333333333334" y="95" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="213.33333333333334" y="112" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">B</text><text x="240.33333333333334" y="112" font-size="12" style="fill:var(--tinta)">7</text></g><g><rect x="403.6666666666667" y="95" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="426.6666666666667" y="112" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">C</text><text x="453.6666666666667" y="112" font-size="12" style="fill:var(--tinta)">6</text></g><g><rect x="83.66666666666667" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="106.66666666666667" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">D</text><text x="133.66666666666669" y="190" font-size="12" style="fill:var(--tinta)">3</text></g><g><rect x="190.33333333333334" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="213.33333333333334" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">E</text><text x="240.33333333333334" y="190" font-size="12" style="fill:var(--tinta)">4</text></g><g><rect x="297" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="320" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">F</text><text x="347" y="190" font-size="12" style="fill:var(--tinta)">9</text></g><g><rect x="403.6666666666667" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="426.6666666666667" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">G</text><text x="453.6666666666667" y="190" font-size="12" style="fill:var(--tinta)">10</text></g><g><rect x="510.33333333333337" y="173" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="533.3333333333334" y="190" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">H</text><text x="560.3333333333334" y="190" font-size="12" style="fill:var(--tinta)">8</text></g><g><rect x="137" y="251" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="160" y="268" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">I</text><text x="187" y="268" font-size="12" style="fill:var(--tinta)">1</text></g><g><rect x="297" y="251" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="3.2"/><text x="320" y="268" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">J</text><text x="347" y="268" font-size="12" style="fill:var(--tinta)">0</text></g><g><rect x="457" y="251" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="1.2"/><text x="480" y="268" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">K</text><text x="507" y="268" font-size="12" style="fill:var(--tinta)">2</text></g><g><rect x="297" y="329" width="46" height="26" rx="4" style="fill:var(--papel-2);stroke:var(--tinta)" stroke-width="3.2"/><text x="320" y="346" font-size="13" font-weight="700" text-anchor="middle" style="fill:var(--tinta)">L</text><text x="347" y="346" font-size="12" style="fill:var(--tinta)">0</text></g></svg></figure>

| It. | Actual | ¿Solución? | Abiertos (f = h + g) | Cerrados |
|---|---|---|---|---|
| 1 | A | no | C(6+1), B(7+1) | A |
| 2 | C | no | B(8), H(10), F(11), G(12) | A, C |
| 3 | B | no | D(5), E(6), H(10), F(11), G(12) | A, C, B |
| 4 | D | no | E(6), H(10), F(11), G(12) | A, C, B, D |
| 5 | E | no | J(0+3), I(1+3), H(10), F(11), G(12) | A, C, B, D, E |
| 6 | J | **sí** | I(4), H(10), F(11), G(12) | A, C, B, D, E, J |

## Cómo atacar el Anexo B en el parcial

1. Leé **qué nodos son solución** y si **conviene mayor o menor**.
2. Hacé en borrador la tabla completa de **Primero el Mejor** y de **A\*** (son las que más se preguntan, y Beam Search sale de la de Primero el Mejor recortando).
3. Anotá el camino de **Escalada Simple** en los dos sentidos y el de **Máxima Pendiente**.
4. Anotá dónde termina **Profundidad** en los dos sentidos.

Con eso respondés casi todo: "lista final de cerrados de X", "en la iteración N el valor del nodo Y", "el único método que alcanza la solución S", "el único que no llega a ninguna solución", "el método que genera el mismo recorrido que X".

> Trampa: "el único método que **no llega a ninguna solución**" casi siempre es una **escalada** (en algún sentido), porque son los únicos que se pueden trabar.

## Resumen comparativo de los heurísticos

| Método | ¿Vuelve atrás? | ¿Garantiza solución? | Elige el siguiente… |
|---|---|---|---|
| Escalada Simple | No | No | Primer hijo mejor que el actual |
| Máxima Pendiente | No | No | Mejor de todos los hijos, si mejora al actual |
| Primero el Mejor | Sí | Sí (si existe) | Mejor nodo abierto, aunque sea peor que el actual |
| Beam Search | Sí, dentro de la lista | No | Mejor abierto, con la lista limitada a n |
| A* | Sí | Sí (si existe) | Mejor abierto según h + costo acumulado |
