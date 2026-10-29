## Para qué sirve

El **Procesamiento de Lenguaje Natural** (PLN o NLP) es la rama de la IA que trabaja con texto y habla humanos: traducir, clasificar mensajes, agrupar opiniones, corregir ortografía, responder preguntas. Entró al parcial en 2025, con preguntas del tipo "qué enfoque de NLP conviene para…".

## El pipeline básico

1. **Preprocesamiento**: limpiar y normalizar el texto.
   - **Tokenización**: partir el texto en unidades (palabras, signos). Las expresiones regulares ayudan a definir los cortes.
   - **Normalización**: minúsculas, sacar acentos, unificar formatos.
   - **Stemming**: recortar la palabra a su raíz con reglas ("conversational" → "conversate"; "classes" → "class").
   - **Lematización**: llevar la palabra a su forma de diccionario ("comiendo" → "comer").
   - **Segmentación** en oraciones.
2. **Representación**: convertir el texto en números.
3. **Modelo**: aplicar un algoritmo de ML según la tarea.

Otras técnicas del material: **distancia mínima de edición** (cuántas inserciones, borrados y sustituciones separan dos palabras; la usa el corrector del teclado), **etiquetado gramatical** (decir si cada palabra es verbo, nombre, adjetivo; se puede hacer con modelos ocultos de Markov) y **modelos de n-gramas** (probabilidad de una palabra dadas las anteriores, por ejemplo P(pantalones | hoy compré dos)).

## Representar texto

| Técnica | Idea |
|---|---|
| **Bolsa de palabras** / matriz término-documento | Cuenta cuántas veces aparece cada palabra en cada documento |
| **TF-IDF** | Pondera la frecuencia de una palabra en el documento (TF) por qué tan rara es en toda la colección (IDF): las palabras comunes pesan poco |
| **PPMI** | Mide si dos palabras aparecen juntas más de lo esperable por azar |
| **Embeddings** (word2vec con skip-gram, **GloVe**) | Cada palabra es un vector denso; palabras de significado parecido quedan cerca |

> Trampa: GloVe y word2vec **no clasifican ni agrupan**: son modelos de **representación de texto**. Son el paso previo.

## Qué modelo usar según la tarea

| Tarea | Aprendizaje | Modelos |
|---|---|---|
| **Asignar etiquetas o valores** a textos (spam / no spam, puntaje de sentimiento) | Supervisado | **Regresión logística**, Naive Bayes, redes neuronales |
| **Clasificar en categorías ya conocidas** (publicaciones por temas definidos) | Supervisado | **Árboles de decisión y ensambles** (random forest, boosting) |
| **Agrupar por similitud** sin categorías previas (comentarios de una campaña) | No supervisado | **Clustering**: **K-Means**, DBSCAN |

> Trampa: si las categorías **ya existen** ("temas ya conocidos", "datos etiquetados") es supervisado (clasificación). Si hay que **descubrir** grupos ("agruparlos según similitud") es **clustering**.

## Redes neuronales en PLN

Una neurona calcula z = W·x + b y le aplica una función de activación: **ReLU** = máx(0, z) en capas ocultas y **softmax** en la salida para elegir entre varias clases (convierte puntajes en probabilidades que suman 1). Los modelos de lenguaje actuales (transformers, LLM) se apoyan en embeddings y en mecanismos de atención para procesar secuencias largas.
