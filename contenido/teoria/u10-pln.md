## Para qué sirve

El **Procesamiento de Lenguaje Natural** (PLN o NLP) es la rama de la IA que trabaja con texto y habla humanos: traducir, clasificar mensajes, agrupar opiniones, corregir ortografía, responder preguntas. Entró al parcial en 2025, con preguntas del tipo "qué enfoque de NLP conviene para…".

## Lenguaje natural y lenguaje artificial

El **lenguaje natural** evolucionó entre las personas por repetición, sin planificación (definición que cita la cátedra, en la línea de Chomsky). Es difícil de procesar por su **variabilidad** (entre 6.000 y 7.000 idiomas, unas 1.000 palabras nuevas por año en inglés), su **ambigüedad** (al menos el 20% de las palabras de un texto típico son ambiguas) y las **metáforas** (alrededor del 6% del lenguaje cotidiano).

| Forma de comunicación | Qué es | Ejemplos |
|---|---|---|
| Verbal | Palabras habladas o escritas | Oral, escrito |
| No verbal | Sin palabras | Corporal, visual, contacto físico |
| **Artificial** | Creado deliberadamente para un contexto | Lenguajes de programación, técnico, científico |

> Trampa: para procesar un **lenguaje artificial no hace falta un sistema inteligente**: tiene reglas gramaticales estrictas y una estructura predecible, y alcanza con la teoría de autómatas y lenguajes formales (un procesador de lenguaje común). El **lenguaje natural** sí necesita un sistema inteligente (un procesador de lenguaje natural).

**Áreas de la lingüística**: **fonología** (los sonidos distintivos, entonación y acento), **morfología** (cómo se forman las palabras a partir de morfemas), **sintaxis** (reglas para combinar palabras en oraciones) y **semántica** (el significado de palabras, frases y oraciones en un contexto).

**NLP** es la rama de la IA que se enfoca en la interacción entre computadoras y lenguaje humano, para que las máquinas lo **comprendan, interpreten y generen**. Tiene dos orientaciones:
- **NLU** (comprensión del lenguaje natural): análisis sintáctico y semántico para entender el significado de una oración. Incluye análisis **sintáctico** (descomponer en unidades y entender la estructura gramatical), **semántico** (el significado de las palabras y cómo se combinan), **de sentimiento** (tono y polaridad: positivo, negativo, neutral) y **extracción de información** (eventos, relaciones entre entidades, opiniones).
- **NLG** (generación del lenguaje natural): los modelos generativos, que en vez de comprender **generan texto** completo a partir de una entrada (contenido personalizado, informes y resúmenes a partir de datos, control de estilo y tono).

Tareas típicas: análisis de sentimientos, generación de lenguaje, traducción automática, extracción de información, respuestas a preguntas y clasificación de textos.

## El pipeline básico

1. **Preprocesamiento**: limpiar y normalizar el texto.
   - **Tokenización**: partir el texto en unidades (palabras, signos). Las expresiones regulares ayudan a definir los cortes.
   - **Normalización**: minúsculas, sacar acentos, unificar formatos.
   - **Stemming**: recortar la palabra a su raíz con reglas ("conversational" → "conversate"; "classes" → "class").
   - **Lematización**: llevar la palabra a su forma de diccionario ("comiendo" → "comer").
   - **Segmentación** en oraciones.
2. **Representación**: convertir el texto en números.
3. **Modelo**: aplicar un algoritmo de ML según la tarea.

Detalles de la presentación: la tokenización facilita el análisis, permite **indexar y buscar**, estandariza y mejora el rendimiento ("El procesamiento del lenguaje natural es fascinante." da 8 tokens, contando el punto). La normalización reduce la variabilidad para aprender patrones consistentes: **lematización** lleva a la forma de diccionario ("correr", "corriendo", "corrió" → "correr"), **stemming** recorta a la raíz, y se pasan todas las letras a minúsculas y se sacan signos y caracteres especiales. La **segmentación** agrupa los tokens en oraciones o párrafos. Al terminar los tres pasos se pasa de un montón de caracteres a un **vocabulario** de tokens normalizado y agrupado en oraciones.

**Categorización** (etiquetar cada palabra): las **categorías léxicas o clases abiertas** pueden recibir palabras nuevas en cualquier momento (**sustantivo, adjetivo, verbo y adverbio**); las **categorías funcionales o clases cerradas** casi nunca suman palabras nuevas (**pronombres, preposiciones, conjunciones, interjecciones, determinantes**, signos y símbolos). "La inteligencia artificial mejora…" → La: determinante; inteligencia: sustantivo; artificial: adjetivo; mejora: verbo.

**Autocorrección** en cuatro pasos: (1) identificar la palabra que **no está en el vocabulario**; (2) proponer las más cercanas con una **distancia de edición** (por ejemplo, **Levenshtein**); (3) sustituir por las propuestas; (4) elegir la de **mayor probabilidad según el contexto** ("Inteligenca" → "Inteligencia").

**Autocompletado**: recopila un **corpus** (documentos, conversaciones, búsquedas), aprende la probabilidad de las palabras en secuencia con un **modelo de lenguaje** (el básico es el de **n-gramas**), predice la palabra más probable dadas las últimas n y la sugiere.

Otras técnicas del material: **distancia mínima de edición** (cuántas inserciones, borrados y sustituciones separan dos palabras; la usa el corrector del teclado), **etiquetado gramatical** (decir si cada palabra es verbo, nombre, adjetivo; se puede hacer con modelos ocultos de Markov) y **modelos de n-gramas** (probabilidad de una palabra dadas las anteriores, por ejemplo P(pantalones | hoy compré dos)).

## NLP tradicional: para qué sirve y dónde falla

El enfoque tradicional (reglas, lingüística y estadística básica) **sigue siendo útil**: es **simple y transparente**, necesita **pocos datos**, corre en máquinas modestas y es fácil de implementar y mantener. Falla en escenarios abiertos por:
1. **Ambigüedad léxica y estructural**: "El banco está cerrado" (¿institución o asiento?), "Vi a Juan con unos binoculares" (¿quién los tiene?).
2. **Dependencia entre palabras**: "El perro mordió al cartero" y "El cartero mordió al perro" tienen las mismas palabras y significan otra cosa.
3. **Falta de contexto**: analiza las palabras aisladas ("el jugador estrella" podría leerse como un astro).

Por esas limitaciones aparece el **NLP con Machine Learning** (algoritmos estadísticos sin redes profundas), después con **Deep Learning** y después con **mecanismos de atención**.

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

Detalles de cada modelo según la presentación: **regresión lineal** predice un **número** a partir del texto (la calificación de una reseña); **regresión logística** clasifica, sobre todo en problemas **binarios** (sentimiento positivo o negativo); un **árbol de decisión** es una jerarquía donde cada nodo decide según una característica del texto y **random forest** es un ensamble de muchos árboles (clasificar noticias en deportes, política, tecnología); **K-Means** agrupa por distancia en un espacio vectorial (descubrir tópicos en redes); **DBSCAN** encuentra grupos de cualquier forma y **detecta puntos atípicos o ruido**. El ML tradicional sirve sobre todo para **comprender** (NLU); generar (NLG) llegó con los modelos más nuevos.

## Redes neuronales en PLN

Una neurona calcula z = W·x + b y le aplica una función de activación: **ReLU** = máx(0, z) en capas ocultas y **softmax** en la salida para elegir entre varias clases (convierte puntajes en probabilidades que suman 1). Los modelos de lenguaje actuales (transformers, LLM) se apoyan en embeddings y en mecanismos de atención para procesar secuencias largas.

## Novedades 2026: qué cambió y qué no

La clase de actualización 2026 insiste en una idea: **los fundamentos siguen; lo que cambió es cómo se usan**. Preprocesamiento, representación (TF-IDF, embeddings) y tareas (clasificación, sentimiento, extracción, traducción) siguen ahí.

1. **Tokenizar todavía importa**: parece un paso resuelto pero no lo es. Con idiomas de pocos recursos, lenguaje informal, romanización (escribir un idioma con letras latinas), variaciones ortográficas o morfología compleja, los tokenizadores se degradan mucho, y eso **condiciona el rendimiento final**.
2. **Multilingüe no es igual en todos los idiomas**: "multilingüe" describe **cobertura**, no garantiza **equidad**. Modelos evaluados en 12 idiomas comprendían distinto según la lengua (y el inglés no siempre fue el mejor).
3. **Más grande no siempre es mejor**: un **LLM grande** tiene capacidad general y anda bien en tareas diversas, pero cuesta más, consume más y necesita más infraestructura; un **modelo pequeño o especializado** tiene menos latencia, se puede desplegar localmente, cuida la privacidad y **puede alcanzar para una tarea concreta** (aunque pequeño no es automáticamente eficiente). Elegir el modelo vuelve a ser una decisión de ingeniería.
4. **Representar significado sigue siendo central**: se pasó de contar palabras (TF-IDF) a vectores (GloVe, word2vec) y a **embeddings contextuales**, donde la misma palabra tiene otra representación según el contexto ("encendí una **vela**" contra "la **vela** del barco"). La ambigüedad sigue; cambió cómo se representa.

Los LLM resuelven muchas tareas con una sola interfaz (resumen, extracción de entidades, traducción, generación), pero son **una parte** de la evolución, no todo el campo. Se sigue estudiando PLN para **entender** qué hace el modelo, **detectar** cuándo falla y **elegir** cuándo no hace falta un LLM.
