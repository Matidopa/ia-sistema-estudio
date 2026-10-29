## Lo que sí o sí tenés que saber

- **PLN** (NLP) trabaja con texto y habla humanos: clasificar mensajes, agrupar opiniones, traducir, corregir.
- El pipeline es **preprocesamiento → representación → modelo**.
- **Preprocesamiento**: tokenización, normalización (minúsculas, acentos), **stemming** (recortar a la raíz) y **lematización** (forma de diccionario).
- **Representación**: bolsa de palabras, **TF-IDF**, PPMI y **embeddings** (word2vec, **GloVe**). Convierten texto en números; no clasifican ni agrupan.
- **Asignar etiquetas o valores** a textos (spam, puntaje de sentimiento) → supervisado → **regresión logística** (o Naive Bayes, redes).
- **Clasificar en categorías ya conocidas** → supervisado → **árboles de decisión y ensambles** (random forest, boosting).
- **Agrupar por similitud** sin categorías previas → no supervisado → **clustering**: **K-Means**, DBSCAN.
- En redes para PLN: **ReLU** en ocultas, **softmax** en la salida para varias clases.

## Cómo te lo preguntan

- «El enfoque de NLP más adecuado para…»: buscá en el enunciado si las categorías **ya existen** ("temas ya conocidos") o hay que **descubrirlas** ("agruparlos según similitud").
- «Los algoritmos que descubren agrupaciones naturales…»: K-Means (o DBSCAN).
- «Los algoritmos que asignan etiquetas o valores…»: regresión logística.
- Las opciones mezclan las cuatro familias (regresión, clustering, árboles y ensambles, representación): descartá primero representación, que nunca resuelve la tarea por sí sola.

## Trampas típicas

> Trampa: GloVe y word2vec son modelos de **representación**, no de clasificación ni de agrupamiento.

> Trampa: "temas ya conocidos" es supervisado; no lo confundas con clustering porque diga "clasificación de publicaciones".

> Trampa: K-Means y DBSCAN no asignan etiquetas: descubren grupos.

> Trampa: stemming recorta con reglas ("classes" → "class"); lematización lleva a la palabra de diccionario ("comiendo" → "comer").

## Fórmulas y convenciones

| Tarea | Tipo | Modelo |
|---|---|---|
| Asignar etiquetas o valores | Supervisado | Regresión logística |
| Categorías ya conocidas | Supervisado | Árboles y ensambles |
| Agrupar por similitud | No supervisado | Clustering (K-Means, DBSCAN) |
| Pasar texto a números | Paso previo | Bolsa de palabras, TF-IDF, embeddings |

- **TF-IDF**: frecuencia de la palabra en el documento (TF) por qué tan rara es en la colección (IDF); las palabras comunes pesan poco.
- **Distancia mínima de edición**: inserciones, borrados y sustituciones entre dos palabras (corrector).
- **N-gramas**: probabilidad de una palabra dadas las anteriores.
- **Softmax**: convierte puntajes en probabilidades que suman 1. **ReLU** = máx(0, z).
