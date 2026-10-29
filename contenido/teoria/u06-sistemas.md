## Para qué sirve

Acá se arma el mapa de toda la materia: qué es un sistema inteligente, qué familias de tecnologías hay y **cuál conviene para cada problema**. Es la unidad de la que salen las preguntas tipo caso ("un hospital quiere…, entonces se debe usar…").

## Qué hace inteligente a un sistema

Un **Sistema Inteligente** es un artefacto con algún tipo de comportamiento inteligente:

- **Racional**: toma decisiones consistentes con su objetivo.
- **No omnisciente**: no tiene todos los conocimientos ni todos los datos.
- **No infalible**: no siempre acierta.
- **Puede aprender**: mejora con el uso.
- **Flexible y robusto**: soporta cambios en el dominio.

**Sistema Inteligente = Conocimientos + Tecnología.** Se usa en **dominios complejos**: el problema no se entiende del todo, no se pueden anticipar todas las situaciones ni los cambios, hay tantas soluciones posibles que no se pueden revisar todas, o un modelo tradicional habría que simplificarlo tanto que la solución no serviría.

**Software tradicional contra sistema inteligente**

| | Software tradicional | Sistema inteligente |
|---|---|---|
| Tareas | Sistemáticas y procedimentales, datos numéricos | Poco conocidas o que requieren conocimiento especializado |
| Implementación | Algorítmica | Declarativa |
| Comportamiento | Determinista | Flexible y robusto |
| Requerimientos | Deseos y necesidades, características del dominio | Características de la tarea; conocimientos públicos y privados |
| Stakeholders | Directivos, gerentes, usuarios | Expertos |
| Mantenimiento | Correctivo y adaptativo | Perfectivo |
| **En común** | **Resuelven problemas y satisfacen deseos y necesidades de los stakeholders** | |

> Trampa: "una característica común entre el software tradicional y los sistemas inteligentes" es **satisfacer los deseos y necesidades de los stakeholders**. Lo algorítmico y lo procedimental es solo del tradicional; lo flexible y robusto, solo del inteligente.

> Trampa: un lavarropas o una heladera son "realmente inteligentes" solo si **deciden algo a partir de datos** (calcular agua y tiempo según el peso de la ropa, armar la lista de compras según el consumo). Tener wifi, pantalla o programas predefinidos no es inteligencia.

## Las tres familias de tecnologías

| Familia | Idea | Ejemplos | Conocimiento |
|---|---|---|---|
| **IA Tradicional** | Reglas, métodos heurísticos y lógica, desarrollados por la Ingeniería del Conocimiento | Sistemas Basados en Conocimientos, Sistemas Expertos Tradicionales | **Explícito** (se puede leer) |
| **Inteligencia Computacional** | Tecnologías de inspiración biológica, en contraposición al razonamiento simbólico | Redes neuronales, computación evolutiva (algoritmos genéticos), inteligencia de enjambre, sistemas inmunológicos artificiales | Implícito |
| **Machine Learning** | Algoritmos que generalizan comportamientos a partir de ejemplos: Datos → Algoritmo → Modelo | Algoritmos de inducción (árboles de decisión), regresión, clustering, Bayes, redes neuronales | Implícito |

La **visión tradicional** de la IA exige una base de conocimientos explícita que el usuario puede ver y entender. La **visión nueva** (ML) no tiene base de conocimientos: la tecnología guarda y usa el conocimiento, pero no se puede leer directamente.

> Trampa: si el sistema **no tiene base de conocimientos**, representa el conocimiento en forma **implícita**. Si la tiene, en forma **explícita**. Lo de fuentes públicas o privadas es otra cosa.

## Sistema Experto, SBC y SET

**Sistema Experto (SE)**: sistema cuyas prestaciones intentan emular parte del comportamiento de un experto humano para resolver ciertas tareas en un dominio acotado. Usa conocimiento **privado** (del experto). *Puede o no* tener base de conocimientos explícita: una red neuronal entrenada para diagnosticar también es un sistema experto.

**Sistema Basado en Conocimientos (SBC)**: su desempeño depende más de la presencia **explícita** de un cuerpo de conocimientos que de procedimientos computacionales ingeniosos. **Siempre** tiene base de conocimientos explícita. Usa conocimiento de **fuentes públicas** (declarativo y explícito).

Arquitectura del SBC:
- **Base de Conocimientos**: hechos y reglas, almacenados en **lógica de primer orden**.
- **Motor de Inferencias**: decide qué reglas aplicar usando **métodos de búsqueda**.
- **Interfaz de Entrada/Salida**.

**Sistema Experto Tradicional (SET)**: un sistema experto con base de conocimientos explícita, armado con conocimiento **privado y público**. Agrega componentes:

| Componente | Función |
|---|---|
| Base de Conocimientos | Reglas y hechos del dominio |
| Base de Datos | Los datos del problema actual (temporal) |
| Motor de Inferencias | Activa reglas según la base de datos y la memoria de trabajo |
| **Memoria de Trabajo** | Registro de todo lo que el motor fue aplicando: la **traza** del razonamiento |
| Trazador de Consultas | Permite que el motor le pregunte cosas al usuario |
| **Trazador de Explicaciones** | Lee la memoria de trabajo y le explica al usuario cómo llegó al resultado |
| Manejador de Comunicaciones | Ingreso de los datos del problema |

> Trampa: el **único** que tiene un componente para **justificar** sus resultados (y un repositorio que registra los pasos) es el **Sistema Experto Tradicional**. Las redes neuronales son "caja negra".

> Trampa: la diferencia principal entre SBC y SET es **la fuente de conocimiento**: el SBC usa fuentes públicas; el SET, privadas y públicas.

**Sistema Experto Difuso**: aplica reglas con lógica difusa, así puede usar datos imprecisos y evaluar subjetivamente cada dato como lo haría un experto ("más sana", "mejor sabor", prioridad alta/media/baja).

## Tipos de problema

| Tipo | La salida es… | Ejemplo de parcial |
|---|---|---|
| **Clasificación** | Una categoría de un conjunto acotado | Tipo de inmueble según fotos; malezas en un cultivo; personaje en una imagen |
| **Predicción / Estimación** | Un **número** (o un valor futuro) | Días de lluvia del mes que viene; tiempo de espera en una caja; cantidad de baches en una foto |
| **Optimización** | La **mejor combinación** que maximiza o minimiza algo | Itinerario de viaje sin repetir lugares; recorrido mínimo en el súper; distribución en las colas de un banco |
| Clustering | Grupos que el algoritmo descubre solo | Agrupar comentarios por similitud |
| Reglas de asociación, detección de anomalías | — | Consumo raro en una tarjeta |

> Trampa: "identificar **la cantidad** de lados de una figura" es **estimación** (la salida es un número), aunque empiece con "identificar". Mirá qué tipo de salida pide.

## Qué tecnología elegir

| Si el problema es… | Usá |
|---|---|
| Optimización (mejor combinación de muchas variables) | **Algoritmo Genético** |
| Clasificación o predicción, con datos históricos etiquetados | **RNA Multi-Perceptrón Backpropagation** (aprendizaje supervisado) |
| Encontrar las **reglas** que explican una clasificación a partir de datos | **Algoritmo de Inducción** (árbol de decisión) |
| Repetir lo que haría un experto aplicando siempre sus reglas educidas | **Sistema Experto Tradicional** |
| Reglas subjetivas del experto sobre datos imprecisos | **Sistema Experto Difuso** |
| Completar datos faltantes o reconocer patrones ruidosos | RNA de Hopfield |

Según qué tenga la organización:
- **Hay datos** → Machine Learning.
- **No hay datos pero sí reglas representativas** → IA Tradicional, pero también Inteligencia Computacional o ML (con las reglas se pueden generar ejemplos): **todas**.
- **No hay datos ni reglas, pero sí heurísticas** → **Inteligencia Computacional** (por ejemplo, un algoritmo genético con esas heurísticas en la función de aptitud).
- No hay datos, ni reglas, ni heurísticas → no se puede aplicar IA.

> Trampa: si el sistema **definió automáticamente** sus conocimientos a partir de una tabla de datos → **Machine Learning**. Si aplica **reglas explícitas seleccionadas con métodos de búsqueda** → **IA Tradicional**.

## Cómo se integran

Los sistemas inteligentes exitosos son los que están **vinculados a los sistemas de software tradicionales** de la organización. Integrar implica desarrollar interfaces con otros sistemas inteligentes, con el software tradicional y entre los propios modelos (las **canalizaciones** o *pipelines*).
