## Para qué sirve

**Machine Learning** (Aprendizaje Automático) es el subcampo que estudia algoritmos capaces de **generalizar comportamientos a partir de ejemplos**. La idea de la cátedra:

> Datos → Algoritmo → **Modelo**. Como cultivar una planta: la maceta es el algoritmo, el agua son los datos y la planta crecida es el modelo (el sistema inteligente).

Siempre se obtiene **un modelo**, siempre se usan fórmulas matemáticas o estadísticas y **siempre hacen falta ejemplos representativos** del problema. Las **Redes Neuronales Artificiales** (RNA) son el algoritmo de ML que más se toma.

## Estrategias de aprendizaje

| | Supervisado | No supervisado |
|---|---|---|
| Qué se le da | Entradas **y la salida deseada** (datos etiquetados) | **Solo** las entradas |
| Qué hace | Aprende la relación entrada → salida para clasificar o predecir | Descubre grupos o patrones solo |
| Ejemplo | Clasificar flores iris en 3 especies; predecir la temperatura | Agrupar vestidos parecidos |
| Tipo de RNA | **Heteroasociativa** | **Autoasociativa** |

**Tipos de entrenamiento**
- **Offline (estático)**: aprende en una fase de entrenamiento y, ya instalado, no aprende más. Ante cambios en la organización hay que hacer mantenimiento manual (reentrenar).
- **Online (dinámico)**: sigue aprendiendo en producción. Hay que monitorearlo para que no rompa lo que ya funcionaba, y con la misma entrada puede dar resultados distintos a los del entrenamiento.

## Algoritmos de inducción (árboles de decisión)

Supervisados y offline. Toman una tabla con atributos y un **atributo objetivo** y generan un árbol de decisión (TDIDT: se elige el atributo con mayor ganancia de información, se parte la tabla y se repite). Del árbol salen **reglas** SI-ENTONCES.

> Trampa: si el caso pide "encontrar **las reglas** que permitan reconocer/identificar…" a partir de datos o jugadas históricas → **Algoritmo de Inducción**.

## Entrenamiento, validación y prueba

Los datos se dividen en tres partes y **siempre** se usan las tres:
1. **Entrenamiento**: para ajustar el modelo.
2. **Validación**: para controlar el entrenamiento y elegir parámetros (cuándo parar, cuántas neuronas).
3. **Prueba**: datos que el modelo nunca vio, para medir la **capacidad de generalización**.

Antes de entrenar se **normalizan** los datos (llevarlos a escalas comparables para facilitar el entrenamiento), y la misma normalización se aplica a entrenamiento, validación **y** prueba. Se suelen hacer **varios prototipos** para experimentar con distintos parámetros.

## Métricas

**Salida continua** (estimar un número): **error absoluto** (diferencia entre real y estimado) y/o **error relativo** (el error como porcentaje).

**Salida discreta** (clasificar): la **matriz de confusión** y sus métricas.

| | Predice positivo | Predice negativo |
|---|---|---|
| **Real positivo** | VP (verdadero positivo) | FN (falso negativo) |
| **Real negativo** | FP (falso positivo) | VN (verdadero negativo) |

- **Exactitud (accuracy)** = (VP + VN) / total: proporción de identificaciones correctas.
- **Precisión (precision)** = VP / (VP + FP): de los que **dijo** positivos, cuántos lo eran.
- **Recuperación (recall)** = VP / (VP + FN): de los positivos **reales**, cuántos encontró.
- **F1** combina precisión y recuperación. Mejorar una suele empeorar la otra.

> Trampa: una exactitud alta engaña si las clases están **desbalanceadas**. Si el 90% de los datos son "no tiene la enfermedad", un modelo que siempre dice "no tiene" ya tiene 90% de exactitud.

## La neurona artificial

```
 x1 ──w1──┐
 x2 ──w2──┼──► NET = Σ wi·xi ──► activación A(NET) con umbral ──► salida y = S[A(NET)]
 x3 ──w3──┘
```

- **Dendritas** = entradas xj, cada una con su **peso** wji. **En los pesos se guarda todo el conocimiento** aprendido.
- **Entrada neta**: NET = Σ wji · xj.
- **Cuerpo**: tiene un **umbral** de activación; la regla de activación decide si la neurona se activa.
- **Axón**: una salida única que puede ir a varias neuronas.
- Pesos: mayor que cero = conexión **excitadora**; igual a cero = **neutra**; menor que cero = **inhibitoria**.

Una RNA combina muchas neuronas iguales que trabajan en paralelo. Ventajas: aprendizaje adaptativo, autoorganización, tolerancia a fallos, operación en tiempo real y fácil inserción en tecnología existente. Desventaja: es una **caja negra**, porque el conocimiento queda implícito y no puede justificar sus resultados.

**Topología**: cantidad de capas (monocapa o multicapa), neuronas por capa, conectividad (total o parcial) y forma de conexión (**hacia adelante**, **lateral** dentro de la misma capa, hacia atrás o recursiva).

**Reglas de aprendizaje**: por **corrección de error** (conoce la salida deseada y ajusta pesos para reducir la diferencia; la más usada), estocástico (cambios al azar), por refuerzo (premia o castiga la salida), **hebbiano** (si dos neuronas conectadas se activan juntas, la conexión se refuerza) y competitivo/cooperativo.

## Los tres modelos que se toman

| | **Perceptrón** | **Multi-Perceptrón Backpropagation** | **Hopfield** |
|---|---|---|---|
| Asociación | Heteroasociativa | Heteroasociativa | **Autoasociativa** |
| Aprendizaje | Supervisado, corrección de error (regla delta), offline | Supervisado, corrección de error (regla delta generalizada), offline | **No supervisado, hebbiano**, offline |
| Arquitectura | **Monocapa, una sola neurona**, hacia adelante | 2 o más capas (puede tener varias ocultas o ninguna), **hacia adelante** | **Monocapa** con **conexiones laterales** |
| Entrenamiento | Varias iteraciones por patrón | Varias iteraciones por patrón | **Una sola** pasada por patrón |
| Funcionamiento | Una pasada | Una pasada | **Itera** hasta estabilizarse |
| Sirve para | Separar **dos clases linealmente separables** | Aproximar **cualquier función, lineal o no lineal**: clasificar y predecir | Completar datos faltantes, reconocer patrones |
| Limitación | No resuelve funciones no lineales (por ejemplo XOR) | No hay regla para saber cuántas capas y neuronas: se prueba y se mira el error | Los patrones deben ser **ortogonales**; capacidad limitada (sin error, menos de N / (4·ln N) patrones) |
| Para mejorarla | Cambiar el **coeficiente de entrenamiento α** (entre 0,05 y 0,3) | Más neuronas o capas, otros pesos iniciales, normalizar, cambiar la tasa de aprendizaje | Cambiar la **cantidad de neuronas** |

**Backpropagation** necesita que la función de las neuronas sea **derivable**, porque calcula el gradiente del error y lo **propaga hacia atrás** para ajustar los pesos de las capas ocultas. Las conexiones igual son hacia adelante: lo que va hacia atrás es el error.

> Trampa: "3 neuronas de entrada, 2 ocultas y 1 de salida, todas hacia adelante" → **Backpropagation**. "5 neuronas con conexiones laterales entre sí" → **Hopfield**. "Monocapa sin conexiones hacia atrás" → **Perceptrón**.

## Diagnóstico del entrenamiento

| Lo que ves | Qué pasa | Qué hacer |
|---|---|---|
| Error de entrenamiento baja, error de validación baja y **después sube** | **Sobreentrenamiento** (overfitting): demasiadas épocas; memorizó los ejemplos y no generaliza | Cortar antes |
| Va bien en entrenamiento pero falla con imágenes nuevas | Sobreentrenamiento por demasiadas épocas | Ídem |
| Los dos errores bajan y quedan **planos en un valor alto** | La red **no tiene capacidad** para aprender el problema | Cambiar la topología (más neuronas o capas) |
| No aprende todos los ejemplos aunque la topología es buena | **Tasa de aprendizaje muy alta** (esquiva el óptimo) o **muy pocas épocas** | Bajar la tasa, entrenar más |
| Recall de entrenamiento 23% y de validación 22% | El entrenamiento todavía no terminó | Seguir con los pesos actuales |

Tasa de aprendizaje: muy grande esquiva el óptimo, muy chica aprende lentísimo. Cantidad de ciclos: pocos, no termina de aprender; demasiados, sobreentrena.

## Redes convolucionales y capa de salida

- Las **convolucionales** (CNN) procesan imágenes: aplican filtros (kernels) que detectan bordes y formas, con capas de *pooling* que reducen el tamaño. Para fotos en color, la capa de entrada debe admitir **tres canales (R, G, B)**.
- **Capa de salida**: para dos clases (es o no es), **una neurona sigmoidal**. Para varias clases excluyentes, **varias neuronas con softmax** (dan probabilidades que suman 1).
- Las redes recurrentes procesan secuencias (texto, tiempo); Google las usó en traducción.
