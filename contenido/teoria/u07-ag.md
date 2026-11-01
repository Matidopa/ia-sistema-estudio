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

Biología mínima para no confundirse: el **genotipo** es el conjunto completo de la información genética y los **cromosomas** la portan; el **gen** es la unidad de información que codifica una característica; el **fenotipo** es la manifestación observable de ese genotipo en un entorno. Postulados de Darwin (1859) que retoma la presentación 2026: hay **variación** entre individuos, parte es **heredable**, nacen más individuos de los que el ambiente sostiene (**sobreproducción**), **compiten** por recursos, los más aptos tienen más probabilidad de dejar descendencia y los cambios se **acumulan** con el tiempo. La selección natural "no es una elección deliberada: es una consecuencia de la aptitud".

Los AG los propuso **John Holland en 1975**. Son simples de implementar comparados con otros modelos de IA, pero exigen un diseño cuidadoso y un buen manejo de parámetros. Sirven para problemas no lineales, complejos y con muchas variables que no se pueden resolver con métodos exactos. Buscan en varias regiones del espacio a la vez una solución **suficientemente buena**, sin garantizar que sea la mejor.

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

**Cromosoma simple o compuesto**: en el ejemplo de clase, una empresa elige hasta 3 de 5 tecnologías con un presupuesto de $45.000. El cromosoma simple es una cadena de 5 bits (1 = la elige): [1, 0, 1, 0, 1]. Si además hay que decidir **cómo** implementar cada una (enfoque tradicional o avanzado, on-premise o cloud), cada gen principal lleva **genes auxiliares**: eso es un cromosoma compuesto.

**Propiedades de un buen cromosoma** (presentación de Ingeniería de Sistemas Inteligentes): **conciso** (tamaño fijo y lo más corto posible, con poca redundancia), **completo** (todas las soluciones posibles se pueden representar), **coherente** (evita representar soluciones inválidas), **uniforme** (todas las soluciones tienen la misma posibilidad de generarse) y **sencillo** (fácil de interpretar).

**Propiedades de una buena función de aptitud**: usar al máximo el conocimiento del problema (la **heurística**), ser **consistente** con el cromosoma, ser **robusta** (reducir la influencia del ruido), tener **causalidad fuerte o adyacencia** (pequeños cambios en el individuo → pequeños cambios en la aptitud) y manejar bien la **penalización** de soluciones inválidas: **pena de muerte** (aptitud 0, la "penalización dura" del ejemplo de tecnologías), **niveles de penas constantes**, o **penas adaptativas** en el tiempo o según la aptitud de la población. La aptitud se puede **maximizar** (beneficio, eficiencia) o **minimizar** (error, tiempo, costo): f(x): Cromosoma → ℝ.

Ojo con esto que repite la cátedra: el cromosoma y la función de aptitud son un modelo simplificado del problema. No tienen que ser perfectos, pero **si no se corresponden con el problema, el algoritmo va a encontrar la solución correcta para el problema equivocado**.

> Trampa: "el conocimiento necesario para resolver el problema se guarda en…" → **la función de aptitud**. "La representación y codificación de las soluciones se implementa en…" → **la estructura del cromosoma**. "La penalización por no cumplir una condición" → **la función de aptitud**.

## Población inicial

Se puede generar **al azar** o **ad hoc** (individuos válidos armados a mano). Las dos son válidas, y puede o no definirse manualmente. Se define la cantidad de individuos y si es constante o variable. La cantidad ideal de individuos y de vueltas **solo se encuentra probando** en varias corridas.

Al azar es lo más común y **promueve la diversidad**; ad hoc (dirigido, con soluciones conocidas o heurísticas) **mejora la calidad inicial pero puede limitar la exploración**. Parámetros: el **tamaño de la población** (afecta diversidad y tiempo de cómputo) y la **varianza inicial** (qué tan dispersos son los valores de los genes; constante o variable por atributo).

## Selección

Arma el subconjunto de individuos que pasa a reproducirse. Un mismo individuo puede ser elegido más de una vez.

| Método | Cómo funciona | Consecuencia |
|---|---|---|
| **Torneo** | Los individuos compiten **de a pares**; pasa el de mayor aptitud | Siempre pasa el mejor de cada pareja; se puede perder el segundo mejor si le tocó contra el primero |
| **Ranking** | Se ordenan por aptitud y pasan los mejores | Siempre elige al mejor, pero los de baja aptitud nunca participan: pierde diversidad y tiene **mayor riesgo de convergencia prematura** |
| **Ruleta** | Cada individuo tiene una porción de la ruleta proporcional a su aptitud (aptitud / total) y se tira al azar | Mantiene diversidad (**menor riesgo de convergencia prematura**), pero **no garantiza** que pasen los mejores ni los que superan el promedio: depende del azar |
| **Control sobre Número Esperado** | Valor de selección = aptitud / promedio. La **parte entera** son copias directas; con las **partes decimales** se completa usando **ruleta** | Garantiza que el mejor pase; usa la ruleta en su proceso |

**Ejemplo de control sobre número esperado**: aptitudes 40, 25, 20, 15 (total 100, promedio 25). Valores de selección: 1,6 / 1,0 / 0,8 / 0,6. Pasan directo: una copia del primero y una del segundo (partes enteras). Las otras dos plazas se sortean con una ruleta armada con 0,6 / 0 / 0,8 / 0,6.

**Cómo se arma la ruleta**: proporción = aptitud / total; después se acumulan las proporciones fila por fila (29,61% → 34,95% → 50,97% → … → 100%) y se tira un número al azar: sale el individuo en cuyo tramo cae. Es **sensible a valores extremos** y puede pasar que se elija una población con todos individuos de baja aptitud. El control sobre número esperado **garantiza a los mejores manteniendo diversidad**, pero es menos directo, varía poco entre ejecuciones y en poblaciones chicas puede no reflejar bien las proporciones.

**Convergencia prematura**: la población se vuelve homogénea demasiado rápido y queda atrapada en una solución subóptima. Un **máximo (o mínimo) local** es un pico o valle intermedio con buena aptitud pero que no es la mejor solución; el **óptimo global** es la mejor de todo el espacio de búsqueda.

> Trampa: la **presentación 2026** define distinto dos métodos. **Torneo**: se eligen al azar k individuos (2, 3 o más) y gana el más apto; torneos grandes eliminan la diversidad muy rápido. **Ranking**: se ordenan por aptitud, se asignan **probabilidades según la posición** y se sortea; ahí dice que tiene **menor** riesgo de convergencia prematura que la ruleta, aunque tiende a perder heterogeneidad. **Todos los parciales 2020–2025 se corrigieron con la versión clásica**: torneo de a pares, ranking que siempre elige al mejor y **ranking con mayor** riesgo de convergencia prematura que la ruleta. Si te toman una de esas preguntas, respondé con la clásica salvo que el enunciado describa explícitamente la versión nueva.

## Cruzamiento

Combina los genes de dos padres para generar dos hijos (los padres se eliminan).

- **Cruza simple**: **siempre un** punto de corte (nunca en medio de un gen). Hijo 1 = primera parte del padre A + segunda del B; hijo 2 = al revés.
- **Cruza multipunto**: varios puntos de corte. Un hijo es una mezcla de A y B y el otro es su **complemento**.
- **Cruza binomial con máscara complemento**: una máscara dice de qué padre sale cada gen del hijo 1; el hijo 2 es todo lo que el hijo 1 no es.
- **Cruza binomial con máscara doble**: una máscara para cada hijo; **se pueden repetir características** (los dos hijos pueden heredar el mismo gen del mismo padre). Puede generar hijos iguales a un padre, iguales entre sí, etc.
- **Cruza binomial al azar**: por cada gen se tira un número; si supera un valor, viene del padre, si no, de la madre. El segundo hijo puede ser complemento o también al azar.

Pros y contras de cada cruza (presentación 2026):

| Cruza | A favor | En contra |
|---|---|---|
| Simple | Muy sencilla y eficiente; conserva bloques de genes de los padres | **Sesgo posicional** (genes que siempre quedan del mismo lado del corte tardan en combinarse); puede romper una buena combinación |
| Multipunto | Más diversidad; reduce el sesgo posicional | Cuantos más cortes, más probable romper bloques estables; más costosa |
| Binomial con máscara | Máxima mezcla gen a gen; más robusta frente a la convergencia prematura | Más riesgo de combinaciones inconsistentes; la máscara complemento puede dar lo mismo que un multipunto; con máscara doble se pueden repetir genes de un solo padre |
| Binomial al azar | Variabilidad genética máxima; útil contra el estancamiento | Alto riesgo de romper relaciones importantes entre genes; casi no preserva herencia estructural |

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

Por cantidad de vueltas (generaciones), por tiempo, porque un individuo supera cierta aptitud, porque el promedio la supera, o por **estancamiento** (la aptitud no mejora durante varias generaciones seguidas). Sirve para evitar ciclos infinitos y decidir cuándo tomar la mejor solución encontrada.

**La población final**: se elige el mejor individuo (o los N mejores) como solución, y se pueden analizar estadísticas (diversidad, promedio de aptitud) para ver si el algoritmo convergió, mantuvo diversidad o se estancó. También puede servir de punto de partida para otra ejecución. Lo que **no** es: no garantiza el óptimo global, no implica que todos sus individuos sean buenos o válidos y no debe tomarse como definitiva si el problema pide explorar más. En el ejemplo del **acertijo de Einstein** (¿quién es el dueño del pececito?), el AG llega a la respuesta: el alemán.

Sobre la mutación: el mecanismo **siempre se activa** en cada ciclo, pero **se ejecuta o no** según la probabilidad (si el número al azar es menor o igual a la probabilidad de mutación, muta). Mutación baja favorece la estabilidad de las buenas soluciones pero puede estancar en óptimos locales; mutación alta explora más pero rompe la herencia y se parece a una búsqueda al azar. En la adaptativa por temperatura **descendente**, la probabilidad baja con el tiempo, favoreciendo la explotación de lo ya encontrado.

> Trampa: si el criterio de paro se basa en la **aptitud**, la corrida **puede no terminar nunca** (si nunca la alcanza). Si se basa en la **cantidad de vueltas**, termina siempre, encuentre o no una solución aceptable.

## Diagnóstico: cómo leer los síntomas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Todos los individuos idénticos durante muchos ciclos; la aptitud se estabiliza temprano en un valor malo | **Convergencia prematura**: mutación muy baja o selección por ranking | Aumentar la probabilidad de mutación, usar ruleta |
| La aptitud oscila sin llegar nunca al valor buscado | El algoritmo **no converge**: la función de aptitud está mal diseñada | Revisar la función de aptitud |
| Converge muy lento | Poca combinación entre individuos | Aumentar los puntos de corte, usar máscara doble |
| La población final | Puede salir de la última vuelta, del criterio de paro, de la población mutada… | Cualquiera es válida |

> Trampa: "cruzar los dos mejores individuos" o "mutar al mejor individuo" puede dar cualquier resultado: hijos mejores, peores o iguales. Por eso la respuesta suele ser "todas las anteriores".
