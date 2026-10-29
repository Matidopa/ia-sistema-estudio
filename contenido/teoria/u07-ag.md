## Para qué sirve

Los **Algoritmos Genéticos** (AG) son algoritmos de **optimización** de propósito general inspirados en la evolución: mantienen una población de posibles soluciones, se quedan con las más aptas, las combinan y las mutan, generación tras generación. Dan **buenas soluciones** (no necesariamente la mejor) en problemas con muchísimas combinaciones posibles, sin tener que revisarlas todas.

Son Inteligencia Computacional. Cuando en un caso del parcial aparece "la **mejor combinación** de…, que **maximice / minimice**…", la respuesta es un Algoritmo Genético.

## La analogía con la evolución

| Evolución | Algoritmo Genético |
|---|---|
| Ecosistema / ambiente | El problema |
| Individuo | Una **posible solución** |
| Genotipo / cromosoma | La descripción de esa solución (por ejemplo, una cadena de bits) |
| Gen | Una característica o atributo de la solución |
| Fenotipo | La **función de aptitud**: qué tan buena es la solución |

Ideas de Darwin que usa: las especies evolucionan de forma gradual, la selección natural favorece al más apto y la variabilidad aparece por modificaciones espontáneas (mutaciones).

## El ciclo

```
Población inicial
   └─► Selección ─► Cruzamiento ─► Mutación ─► ¿criterio de paro? ── no ─┐
              ▲                                                        │
              └────────────────────────────────────────────────────────┘
                                         sí ─► Población final
```

- Una **vuelta** (ciclo o generación) ejecuta selección, cruzamiento y mutación.
- Una **corrida** es el conjunto de vueltas hasta que se cumple el criterio de paro.
- Es **estable**: la cantidad de individuos se mantiene durante toda la corrida.
- Tiene azar: **con la misma población inicial y los mismos parámetros no se garantiza la misma población final.** Por eso, para saber si un AG sirve, se evalúan **varias corridas**.

## Estructura del cromosoma y función de aptitud

**Estructura del cromosoma**: cómo se representa una solución. Cada gen es una característica y se debe definir una estructura **completa, coherente y consistente con la función de aptitud**. Para diseñarla es imprescindible conocer **los conceptos** que hay que representar.

**Función de aptitud**: evalúa y compara las posibles soluciones. Es lo más difícil de definir y es **donde está el conocimiento del problema**. Se arma así:
- Sumar aptitud por cada condición que la solución cumple (lo que se busca).
- Restar por cada restricción que viola.
- **Penalizar** las combinaciones de genes inválidas (por ejemplo, restar un valor chico como −10 por cada valor inválido, en vez de descartar al individuo).
- Debe dar **pequeños cambios en la valoración ante pequeños cambios en el individuo** (así el algoritmo puede "subir la pendiente").

> Trampa: "el conocimiento necesario para resolver el problema se guarda en…" → **la función de aptitud**. "La representación y codificación de las soluciones se implementa en…" → **la estructura del cromosoma**. "La penalización por no cumplir una condición" → **la función de aptitud**.

## Población inicial

Se puede generar **al azar** o **ad hoc** (individuos válidos armados a mano). Las dos son válidas, y puede o no definirse manualmente. Se define la cantidad de individuos y si es constante o variable. La cantidad ideal de individuos y de vueltas **solo se encuentra probando** en varias corridas.

## Selección

Arma el subconjunto de individuos que pasa a reproducirse. Un mismo individuo puede ser elegido más de una vez.

| Método | Cómo funciona | Consecuencia |
|---|---|---|
| **Torneo** | Los individuos compiten **de a pares**; pasa el de mayor aptitud | Siempre pasa el mejor de cada pareja; se puede perder el segundo mejor si le tocó contra el primero |
| **Ranking** | Se ordenan por aptitud y pasan los mejores | Siempre elige al mejor, pero los de baja aptitud nunca participan: pierde diversidad y tiene **mayor riesgo de convergencia prematura** |
| **Ruleta** | Cada individuo tiene una porción de la ruleta proporcional a su aptitud (aptitud / total) y se tira al azar | Mantiene diversidad (**menor riesgo de convergencia prematura**), pero **no garantiza** que pasen los mejores ni los que superan el promedio: depende del azar |
| **Control sobre Número Esperado** | Valor de selección = aptitud / promedio. La **parte entera** son copias directas; con las **partes decimales** se completa usando **ruleta** | Garantiza que el mejor pase; usa la ruleta en su proceso |

**Ejemplo de control sobre número esperado**: aptitudes 40, 25, 20, 15 (total 100, promedio 25). Valores de selección: 1,6 / 1,0 / 0,8 / 0,6. Pasan directo: una copia del primero y una del segundo (partes enteras). Las otras dos plazas se sortean con una ruleta armada con 0,6 / 0 / 0,8 / 0,6.

## Cruzamiento

Combina los genes de dos padres para generar dos hijos (los padres se eliminan).

- **Cruza simple**: **siempre un** punto de corte (nunca en medio de un gen). Hijo 1 = primera parte del padre A + segunda del B; hijo 2 = al revés.
- **Cruza multipunto**: varios puntos de corte. Un hijo es una mezcla de A y B y el otro es su **complemento**.
- **Cruza binomial con máscara complemento**: una máscara dice de qué padre sale cada gen del hijo 1; el hijo 2 es todo lo que el hijo 1 no es.
- **Cruza binomial con máscara doble**: una máscara para cada hijo; **se pueden repetir características** (los dos hijos pueden heredar el mismo gen del mismo padre). Puede generar hijos iguales a un padre, iguales entre sí, etc.
- **Cruza binomial al azar**: por cada gen se tira un número; si supera un valor, viene del padre, si no, de la madre. El segundo hijo puede ser complemento o también al azar.

## Mutación

Cambia al azar algún gen de algún individuo de la población cruzada. Objetivo: **hacer aparecer valores de genes que no habían aparecido** en la corrida. Se tira un número al azar para ver si se activa; **puede activarse pero no ejecutarse** (no modificar nada). Puede generar individuos inválidos.

- **Simple**: probabilidad constante.
- **Adaptativa por convergencia**: la probabilidad depende del promedio de las aptitudes.
- **Adaptativa por temperatura** (ascendente o descendente): depende de la cantidad de vueltas.

| Probabilidad de mutación | Efecto |
|---|---|
| **Muy baja** | Se limita la creación de nuevas combinaciones; la población se vuelve idéntica: **convergencia prematura** |
| **Muy alta** | Más diversidad, pero se pueden **perder soluciones buenas** (se vuelve casi búsqueda al azar) |

## Criterio de paro

Por cantidad de vueltas, por tiempo, porque un individuo supera cierta aptitud o porque el promedio la supera.

> Trampa: si el criterio de paro se basa en la **aptitud**, la corrida **puede no terminar nunca** (si nunca la alcanza). Si se basa en la **cantidad de vueltas**, termina siempre, encuentre o no una solución aceptable.

## Diagnóstico: cómo leer los síntomas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Todos los individuos idénticos durante muchos ciclos; la aptitud se estabiliza temprano en un valor malo | **Convergencia prematura**: mutación muy baja o selección por ranking | Aumentar la probabilidad de mutación, usar ruleta |
| La aptitud oscila sin llegar nunca al valor buscado | El algoritmo **no converge**: la función de aptitud está mal diseñada | Revisar la función de aptitud |
| Converge muy lento | Poca combinación entre individuos | Aumentar los puntos de corte, usar máscara doble |
| La población final | Puede salir de la última vuelta, del criterio de paro, de la población mutada… | Cualquiera es válida |

> Trampa: "cruzar los dos mejores individuos" o "mutar al mejor individuo" puede dar cualquier resultado: hijos mejores, peores o iguales. Por eso la respuesta suele ser "todas las anteriores".
