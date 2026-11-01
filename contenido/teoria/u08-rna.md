## Para qué sirve

**Machine Learning** (Aprendizaje Automático) es el subcampo que estudia algoritmos capaces de **generalizar comportamientos a partir de ejemplos**. La idea de la cátedra:

> Datos → Algoritmo → **Modelo**. Como cultivar una planta: la maceta es el algoritmo, el agua son los datos y la planta crecida es el modelo (el sistema inteligente).

Siempre se obtiene **un modelo**, siempre se usan fórmulas matemáticas o estadísticas y **siempre hacen falta ejemplos representativos** del problema. Las **Redes Neuronales Artificiales** (RNA) son el algoritmo de ML que más se toma.

ML está muy relacionado con la **estadística** y con la **optimización matemática**, pero se diferencia de ellas porque se centra en la **complejidad computacional** de los problemas y sus soluciones. **Entrenar** es el proceso que busca determinar (aprender) los valores correctos para construir un modelo que represente el conjunto de datos disponibles.

**Familias de algoritmos de ML**: de **inducción** (árboles de decisión), de **regresión** (lineal, polinómica, logística), de **clustering**, **basados en Bayes** y **redes neuronales**. El **teorema de "No Free Lunch"** dice que no existe un algoritmo que sea el mejor para todos los problemas: hay que elegir (y probar) según el problema.

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

**Cómo arma el árbol (TDIDT, "divide y triunfarás")**, con algoritmos como ID3, C4.5 y C5.0 (Quinlan). A partir de un conjunto de datos T:
1. Si T está vacío → terminar.
2. Si todos los ejemplos de T tienen **el mismo valor en el atributo objetivo** → generar una **hoja**.
3. Si no: elegir el atributo de entrada con **mayor ganancia**, partir T por cada valor de ese atributo y repetir el proceso en cada parte.

La ganancia mide cuánto ordena un atributo: Ganancia(O, A) = Entropía(O) − Entropía(O, A), con Entropía(X) = Σ −P(v)·log₂ P(v). En el ejemplo de clase ("¿usar ML?" según tipo de problema, tipo de datos y complejidad), el primer atributo elegido fue **Tipo de Problema** (ganancia 0,592) y salieron reglas como "SI Problema = Optimización ENTONCES ML = No" y "SI Problema = Clasificación y Datos = Ejemplos ENTONCES ML = Sí".

**Algoritmos de regresión**: buscan una función y = f(x) que represente el comportamiento de valores numéricos. En clase, una regresión polinómica sobre datos de cinemática "redescubrió" la fórmula D = V·T + A·T²/2 (todos los demás coeficientes le dieron prácticamente cero).

## Entrenamiento, validación y prueba

Los datos se dividen en tres partes y **siempre** se usan las tres:
1. **Entrenamiento**: para ajustar el modelo.
2. **Validación**: para controlar el entrenamiento y elegir parámetros (cuándo parar, cuántas neuronas).
3. **Prueba**: datos que el modelo nunca vio, para medir la **capacidad de generalización**.

Antes de entrenar se **normalizan** los datos (llevarlos a escalas comparables para facilitar el entrenamiento), y la misma normalización se aplica a entrenamiento, validación **y** prueba. Se suelen hacer **varios prototipos** para experimentar con distintos parámetros.

**Validar** es evaluar los resultados de distintos parámetros de entrenamiento para optimizar el modelo. **Probar** es evaluar si el modelo tiene buena capacidad de **generalización** (que funcione bien con datos que nunca vio, no solo con los ejemplos de entrenamiento).

**Cómo preparar los datos**
- **Normalización / estandarización** cuando los atributos tienen escalas distintas: **Standard Scaler** (x' = (x − promedio) / desvío: queda centrado en cero), **Min-Max Scaler** (x' = (x − mín) / (máx − mín): queda en [0; 1], o en [−1; 1] si hay negativos) y **Robust Scaler** (primero saca los valores atípicos y después aplica una de las anteriores).
- Los datos de **prueba no se usan para tomar ninguna decisión de diseño** de la red.
- Cómo separar: **método de retención** (muestreo simple, al azar) o **muestreo estratificado** (cuidando que cada clase esté representada en cada conjunto). Proporciones típicas: 70% entrenamiento+validación / 30% prueba, y dentro del primero 80% entrenamiento / 20% validación.
- **Imágenes**: todas con el mismo tamaño (alto × ancho) y la misma cantidad de canales (RGB = 3, escala de grises = 1), porque la capa de entrada tiene un tamaño fijo. Si hay pocas, se aplica **data augmentation** (voltear, girar, acercar, recortar, trasladar, cambiar brillo o contraste). Se guardan en carpetas por clase, replicadas para entrenamiento, validación y prueba.

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
- **F1** = 2·P·R / (P + R) combina precisión y recuperación. Mejorar una suele empeorar la otra. Existe la variante **Fβ**, donde β dice cuánta más importancia tiene la recuperación sobre la precisión.

> Trampa: una exactitud alta engaña si las clases están **desbalanceadas**. Si el 90% de los datos son "no tiene la enfermedad", un modelo que siempre dice "no tiene" ya tiene 90% de exactitud.

**Ejemplo de la cátedra**: 100 clientes, 9 compran y 91 no. El modelo da VP = 1, FP = 1, VN = 90, FN = 8. Exactitud = 91/100 = **91%** (parece bueno). Precisión = 1/2 = **50%** (como tirar una moneda). Recuperación = 1/9 = **11%** (casi no encuentra a los que compran). Conclusión: **el modelo no sirve**, aunque la exactitud sea alta.

**Ejemplo con salida continua**: un error relativo promedio chico puede esconder casos con errores enormes (por ejemplo, cuando el valor real es cercano a cero el error relativo se dispara). Hay que mirar mínimo, promedio y máximo del error, no solo el promedio.

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

**Funciones de activación y de salida**: escalón, identidad, lineal mixta, **sigmoidal**, gaussiana, tangente hiperbólica y **ReLU** = máx(0, x). En la práctica se usa una sola función que combina las dos: F(NET) = S[A(NET)]. Con funciones identidad, escalón o lineal mixta los cálculos son más fáciles, pero **la red no puede aprender funciones no lineales**. Para entradas y salidas binarias se usa la sigmoidal; para valores reales, la gaussiana o la tangente hiperbólica; **hoy se recomienda ReLU**, porque se parece a una lineal sin serlo y da gradientes grandes y consistentes. La información de entrada y salida puede ser **discreta** (binaria 0/1) o **continua** (reales).

Una RNA combina muchas neuronas iguales que trabajan en paralelo. Ventajas: aprendizaje adaptativo, autoorganización, tolerancia a fallos, operación en tiempo real y fácil inserción en tecnología existente. Desventaja: es una **caja negra**, porque el conocimiento queda implícito y no puede justificar sus resultados.

**Topología**: cantidad de capas (monocapa o multicapa), neuronas por capa, conectividad (total o parcial) y forma de conexión (**hacia adelante**, **lateral** dentro de la misma capa, hacia atrás o recursiva).

**Reglas de aprendizaje**: por **corrección de error** (conoce la salida deseada y ajusta pesos para reducir la diferencia; la más usada), estocástico (como corrección de error, pero ajusta los pesos con cambios al azar), por refuerzo (como corrección de error, pero ajusta según una valoración de la salida generada, sin conocer la salida exacta), **hebbiano** (si dos neuronas conectadas se activan juntas, la conexión se refuerza) y competitivo/cooperativo (en dos etapas: ordenación global y ajuste fino).

## El Perceptrón paso a paso

Rosenblatt, 1958. Aprende **por repetición**: ingresar la entrada → generar la salida → calcular el error → ajustar los pesos → ¿parar? Ejemplo de clase, función AND (Y) con dos entradas:

- A(NET) = x1·w1 + x2·w2 − Θ, y la salida es 1 si A(NET) > 0, si no 0.
- Pesos iniciales w1 = w2 = 0,50, umbral Θ = 0,20, coeficiente α = 0,35. Patrón: x1 = 1, x2 = 0, salida deseada Yd = 0.
- A(NET) = 0,50 − 0,20 = 0,30 → salida 1. Error.
- **Corrección de error**: ΔWi = (Y − Yd)·Xi·α y W'i = Wi − ΔWi. ΔW1 = (1 − 0)·1·0,35 = 0,35 → W1 = 0,15; ΔW2 = 0 (porque x2 = 0).
- Ahora A(NET) = 0,15 − 0,20 = −0,05 → salida 0. Patrón aprendido.

Recomendaciones: el umbral Θ se puede ajustar como si fuera un peso más, pero se suele dejar **constante** para que el aprendizaje sea estable; se trabaja con valores binarios normalizados en [0; 1]; **α entre 0,05 y 0,35**; pesos iniciales entre 0,00 y 0,50. Aproxima funciones lineales, pero **nunca podrá aprender funciones no lineales** como XOR.

## Diseñar una Backpropagation

Rumelhart, Hinton y Williams, 1986: "red multi-perceptrón con regla delta generalizada (o gradiente decreciente), o de aprendizaje por retropropagación del error". Se usa para **clasificar** y para **estimar o predecir**. Como no se conoce la salida deseada de las neuronas ocultas, el error de la salida se **propaga hacia atrás** según el aporte de cada neurona, y la función tiene que ser **derivable** (por eso la sigmoidal en el ejemplo de clase).

- **Neuronas de entrada**: dependen de los atributos y su codificación. Atributo real → **1 neurona**; atributo binario → **N neuronas** (N = bits necesarios para codificarlo). Usan función identidad.
- **Neuronas ocultas**: el **Teorema de Aproximación Universal** dice que existe una red lo suficientemente grande para aprender cualquier conjunto de datos con la precisión deseada, **pero no dice cuántas capas ni neuronas**. No hay regla general: más neuronas y capas dan más capacidad pero más tiempo; **una capa oculta suele alcanzar** (aunque puede necesitar muchas neuronas); **dos capas ocultas aprenden más rápido** con la misma cantidad de neuronas; **más de tres** pueden dificultar el ajuste de las capas profundas (**desvanecimiento del gradiente**, *vanishing gradient*). Se define con fórmulas o cotas (no sirven siempre), experimentación manual o experimentación automática (computación evolutiva como NEAT, o AutoKeras).
- **Neuronas de salida**: salida continua → **1 neurona identidad**; salida binaria → **1 neurona sigmoidal** con un umbral de clasificación; varias clases → 1 neurona identidad con umbrales, o **C neuronas softmax** (C = cantidad de clases), que dan la probabilidad de cada clase.
- **Pesos iniciales**: aleatorios en un rango chico (0,00 a 0,50) y **distintos entre neuronas de la misma capa** para "romper simetrías".
- Si **nunca aprende** (cayó en un mínimo local): probar otros pesos iniciales, normalizar los datos, cambiar los parámetros de aprendizaje, **cambiar el orden en que entran los patrones**, agregar capas o neuronas ocultas y revisar los datos de entrenamiento.

## Hopfield paso a paso

Hopfield, 1982. Se basa en el **postulado de Hebb** (1949): si una neurona A participa repetidamente en activar a B, la eficiencia de A para excitar a B aumenta.

- **Aprender** (una sola pasada): por cada patrón V se calcula Vᵀ·V y se suman las matrices. **La diagonal se pone en cero**, porque ninguna neurona se conecta consigo misma.
- **Identificar**: se multiplica el patrón de entrada por la matriz de pesos, se aplica F (1 si el valor es positivo, −1 si no) y se **repite hasta que la salida no cambie** (se estabiliza). Si oscila entre dos resultados sin estabilizarse, el patrón **no se identifica**.
- Capacidad para N neuronas: los patrones deben ser **ortogonales**; recupera **sin error** menos de N / (4·ln N) patrones y **con error mínimo** hasta ≈ 0,15·N.

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
| Para mejorarla | Cambiar el **coeficiente de entrenamiento α** (entre 0,05 y 0,35) | Más neuronas o capas, otros pesos iniciales, normalizar, cambiar la tasa de aprendizaje | Cambiar la **cantidad de neuronas** |

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

**Parámetros del entrenamiento**
- **Cómo se procesan los datos**: ejemplo por ejemplo (muchos cálculos con muchos datos), **batch completo** (calcula el error promedio de todos antes de ajustar: necesita mucha memoria), **estocástico** (elige uno al azar: sirve con muchos datos pero puede tardar en converger) y **mini-batch** (lotes chicos: converge rápido). Un **paso** (*step*) procesa un lote; una **época** (*epoch*) es cuando ya se procesaron todos los ejemplos.
- **Cantidad de épocas**: pocas → aprendizaje sin terminar, error de entrenamiento alto (**underfitting**); demasiadas → error de entrenamiento bajo pero error de prueba alto (**overfitting**). Se puede cortar de forma adaptativa mirando el error de validación (**early stopping**).
- **Función de error (loss)**: **error cuadrático medio** (MSE) para salidas con función identidad; **entropía cruzada** para salidas sigmoidales o softmax.
- **Tasa de aprendizaje**: conviene entre 0,01 y 0,40. Más grande → parálisis o inestabilidad (esquiva el óptimo); más chica → lentitud. Se puede usar una tasa **adaptativa**.
- **Algoritmos de ajuste de pesos** (optimizadores, buscan minimizar el error con el gradiente): **SGD** (gradiente decreciente), **Momentum** (usa el "impulso" de los gradientes anteriores para suavizar fluctuaciones), **NAG** (anticipa el cambio para corregir el impulso), **Adagrad** (baja la tasa según los cambios previos, pero puede bajarla demasiado), **AdaDelta** y **RMSProp** (resuelven esa lentitud con una media móvil de los gradientes), **Adam** y **Nadam** (combinan impulso y tasa adaptativa).

## Redes convolucionales y capa de salida

- Las **convolucionales** (CNN) procesan imágenes: aplican filtros (kernels) que detectan bordes y formas, con capas de *pooling* que reducen el tamaño. Para fotos en color, la capa de entrada debe admitir **tres canales (R, G, B)**.
- Se inspiran en la **corteza visual primaria (V1)**: representan la información en mapas bidimensionales y detectan los elementos relevantes **sin importar su ubicación ni orientación**. Sirven para cualquier dato en forma de matriz (alto × ancho × canales). Cada capa convolucional tiene **tres etapas**: (a) **convolución**: aplica filtros kernel combinando píxeles contiguos (es **la única etapa que se entrena**: los pesos son los valores de los filtros); (b) **detector**: aplica una función no lineal (sigmoidal, tangente hiperbólica o **ReLU**) para agregar no linealidad; (c) **pooling** (máximo o promedio): reduce dimensiones y permite reconocer el objeto aunque se haya movido o rotado. Después, una capa *reshape* pasa de matriz a vector, siguen capas tipo backpropagation y la capa de salida (identidad, sigmoidal o softmax).
- Ventajas frente a una red común: **conexión escasa** (cada neurona mira solo una zona, por ejemplo 10 × 10: de 160 millones de pesos se baja a 1,6 millones) y **parámetros compartidos** (el mismo filtro se usa en toda la imagen).
- Recomendaciones: las capas convolucionales se van **achicando** a medida que se profundiza, pero de a poco; **dos filtros de 3×3 aprenden más rápido que uno de 5×5**; equilibrar ancho (cantidad de filtros) y profundidad (cantidad de capas).
- **Capa de salida**: para dos clases (es o no es), **una neurona sigmoidal**. Para varias clases excluyentes, **varias neuronas con softmax** (dan probabilidades que suman 1).
- Las redes recurrentes procesan secuencias (texto, tiempo); Google las usó en traducción.
