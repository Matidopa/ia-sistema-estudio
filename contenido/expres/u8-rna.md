## Lo que sí o sí tenés que saber

- **Machine Learning**: Datos → Algoritmo → **Modelo**. Siempre sale un modelo, siempre usa fórmulas matemáticas o estadísticas y siempre necesita **ejemplos representativos**.
- **Supervisado** = entradas y salidas conocidas (heteroasociativa). **No supervisado** = solo entradas (autoasociativa).
- Los datos se dividen en **entrenamiento, validación y prueba**, y se usan los tres. La **generalización** se mide con **prueba**.
- La **normalización** lleva los datos a escalas similares para facilitar el entrenamiento y se aplica igual a los tres conjuntos.
- **Todo el conocimiento** de una RNA está en los **pesos de las conexiones** (por eso es caja negra y no justifica).
- **Perceptrón**: una sola neurona, monocapa, supervisado, corrección de error, solo dos clases **linealmente separables**.
- **Backpropagation**: varias capas hacia adelante (ocultas: varias o ninguna), supervisado offline, corrección de error, aproxima **cualquier función**, necesita función **derivable**. Cuántas capas y neuronas: **prueba y error**.
- **Hopfield**: monocapa con **conexiones laterales**, no supervisada, **hebbiana**, autoasociativa; entrena en **una pasada**, funciona **iterando** hasta dos salidas iguales seguidas; patrones **ortogonales**.
- Salida **continua** → error absoluto o relativo. Salida **discreta** → matriz de confusión (exactitud, precisión, recuperación).

## Cómo te lo preguntan

- «La red con tal topología es…»: laterales → Hopfield; capa oculta hacia adelante → Backpropagation; una neurona monocapa → Perceptrón.
- «Ventaja / desventaja de…»: la opción que describe a *otra* red es la trampa.
- «Qué métrica usar»: preguntate si estima un número o elige una clase.
- «El gráfico de error muestra…»: validación que sube → sobreentrenamiento; los dos planos en valor alto → cambiar topología.
- «Para mejorar el entrenamiento se modifica…»: Perceptrón → **α**; Hopfield → **cantidad de neuronas**.
- Casos de hospital: "asignar" recursos → optimización → AG; "encontrar las reglas" → Algoritmo de Inducción.

## Trampas típicas

> Trampa: Backpropagation tiene conexiones **hacia adelante**; lo que va hacia atrás es el error.

> Trampa: patrones ortogonales es de Hopfield, no de Backpropagation ni del Perceptrón.

> Trampa: una exactitud alta engaña con clases desbalanceadas.

> Trampa: "se estabiliza" es Hopfield, "aptitud" es AG, "heurística" es búsqueda; en una red supervisada se mira precisión o recall.

## Fórmulas y convenciones

| Métrica | Fórmula | Qué mide |
|---|---|---|
| Exactitud | (VP + VN) / total | Aciertos totales |
| Precisión | VP / (VP + FP) | De los que dijo positivos, cuántos lo eran |
| Recuperación | VP / (VP + FN) | De los positivos reales, cuántos encontró |

- Entrada neta: NET = Σ wi · xi. Peso > 0 excitador, = 0 neutro, < 0 inhibitorio.
- Capa de salida: dos clases → **1 neurona sigmoidal**; varias excluyentes → **varias softmax**. Fotos color en CNN → **3 canales RGB**.
- Tasa alta → esquiva el óptimo; pocas épocas → no termina; demasiadas → sobreentrena.
