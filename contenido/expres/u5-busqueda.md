## Lo que sí o sí tenés que saber

- Antes de nada, leé en el **Anexo B** qué nodos son **solución** y si conviene el valor **mayor o menor**.
- **Ciegos** (amplitud, profundidad, generación y prueba): no usan h y recorren el grafo **como árbol** (un nodo con dos padres aparece dos veces).
- **Profundidad** termina en la **primera** solución; **amplitud** y **generación y prueba** recorren todo el árbol.
- **Escaladas**: solo avanzan a un hijo **estrictamente mejor**; si ninguno mejora, se traban y pueden **no llegar a ninguna solución**.
- **Primero el Mejor**: lista de **abiertos** ordenada por h; vuelve atrás, así que **encuentra solución si existe**.
- **Beam Search (n)**: Primero el Mejor con abiertos **recortada a n**; lo descartado no vuelve.
- **A\***: f = h + g (menor es mejor) o **f = h − g** (mayor es mejor), con g = costo acumulado desde la raíz.
- **Iteración 1** = el nodo actual es la raíz.

## Cómo te lo preguntan

- «En la iteración N° k, el valor del nodo Y es…»: casi siempre A\*. Armá la tabla de iteraciones y mirá abiertos en esa fila.
- «La lista final de abiertos/cerrados de X…»: es la fila en la que el actual es la solución. Cerrados **incluye** la solución; abiertos **no**.
- «El único método que alcanza la solución S»: anotá en borrador dónde termina cada método (escaladas y profundidad en los dos sentidos).
- «El único que no llega a ninguna solución»: buscá la escalada que se traba.
- «El método que genera el mismo recorrido que X»: compará las listas de visitados nodo por nodo.

## Trampas típicas

> Trampa: si el anexo dice que **menor es mejor**, 650 le gana a 900. Invertir esto arruina todo el ejercicio.

> Trampa: Beam Search con **n = 1** deja la lista final de abiertos **vacía**.

> Trampa: con A\* y "mayor es mejor" el costo **resta** (f = h − g), no suma.

> Trampa: en las escaladas un hijo **igual** al actual no sirve: tiene que ser estrictamente mejor.

> Trampa: la solución se reconoce cuando el nodo pasa a ser el **actual**, no cuando aparece en abiertos.

## Fórmulas y convenciones

| Método | Cómo elige el siguiente | Desempate / sentido | Termina cuando | ¿Garantiza solución? |
|---|---|---|---|---|
| Amplitud | Cola FIFO, por niveles | Izq → der o der → izq, según la pregunta | Recorre todo el árbol | — |
| Profundidad | Pila LIFO, por ramas; muestra retrocesos (A, B, E, I, E, J) | Ídem | Primera solución | No la óptima |
| Generación y Prueba | Como profundidad, sin cortar | Ídem | Recorre todo: todas las soluciones | — |
| Escalada Simple | Hijos **de a uno**; va al **primero** estrictamente mejor | Ídem | Solución o ningún hijo mejora | No |
| Máxima Pendiente | **Todos** los hijos; va al mejor si es estrictamente mejor | — | Solución o el mejor no mejora | No |
| Primero el Mejor | Mejor nodo de abiertos según h | Empate: el que entró **antes** | El actual es solución | Sí, si existe |
| Beam Search (n) | Igual, recortando abiertos a n antes de elegir | Empate: el más viejo | Solución o abiertos vacía | No |
| A\* | Mejor de abiertos según f = h ± g | Empate: el más viejo | El actual es solución | Sí, si existe |

Receta para Primero el Mejor, Beam y A\*, en cada iteración:

1. Ordená abiertos (Beam: recortá a n). Sacá el mejor: es el **actual** y pasa a **cerrados**.
2. ¿Es solución? Fin. Abiertos final = lo que quedó (sin la solución).
3. Si no, agregá sus hijos a abiertos. Un hijo que ya está en cerrados o en abiertos **no se repite**; en A\* se actualiza su f si llegó por un camino mejor.
4. Anotá A\* como C(770 + 70) = C(840).

Listas en escaladas: **generados** = raíz + cada hijo mirado; **visitados** = el camino por el que se movió.
