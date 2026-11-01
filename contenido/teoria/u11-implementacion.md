## Para qué sirve

La IA tiene dos caras: **ciencia** (estudia el comportamiento inteligente) e **ingeniería** (provee herramientas y métodos para construir sistemas). Esta unidad es la cara de ingeniería: un **proceso** para implementar un sistema inteligente en una organización real, aplicando principios ingenieriles con un fin práctico. Se toma con preguntas de "en qué fase se hace tal cosa".

## Las cinco fases

| Fase | Qué se hace | Palabras clave del parcial |
|---|---|---|
| **1. Definición del Problema** | Entender qué hay que resolver y cómo: identificar fuentes, elicitar y comprender requerimientos, estudiar la viabilidad, definir alcance y diseñar los módulos | fuentes de información, stakeholders, expertos, **extracción y educción**, viabilidad, alcance, módulos |
| **2. Identificación y Transformación de los Datos** | Solo si hay datos: **recolección, estudio y preparación** | normalización, limpieza, ¿son representativos? |
| **3. Selección de la Tecnología** | Según el tipo de tarea de cada módulo, elegir ML, IA Tradicional o Inteligencia Computacional | tipo de tarea → tecnología |
| **4. Construcción del Modelo** | Usar la tecnología de IA para desarrollar cada módulo | entrenamiento, validación y prueba; cargar reglas; diseñar y probar el AG |
| **5. Aplicación del Sistema Inteligente** | Integrar, instalar y mantener | interfaces, **canalizaciones**, integración con sistemas existentes, puesta en producción, monitoreo, mantenimiento |

## Fase 1 en detalle: Definición del Problema

Hay que identificar **qué** resolver (metas, expectativas, contexto, necesidades, deseos, restricciones) y **cómo**. Áreas problemáticas típicas: información informal, funcionalidades implícitas, suposiciones no comunicadas y mala documentación.

**1.1 Elicitar los requerimientos**
- **Identificar las fuentes de información** (es **lo primero** que se hace al iniciar el proyecto): recursos propios de la organización (bases de datos, formularios, manuales), recursos externos (datos públicos, normas, leyes), **stakeholders** (los afectados en sus rutinas, identificados mirando la organización formal e informal) y **expertos**.
- **Recolectar hechos y necesidades** con extracción (análisis de documentación y de datos) y educción (entrevistas, cuestionarios, prototipado, observación, tormenta de ideas, emparrillado, análisis de protocolos). Hay que poder responder: qué incluye el problema, dónde se produce, a quién más afecta, por qué resolverlo, cómo se manifiesta y qué puede impedirlo.
- Problemas típicos: el conocimiento no está explícito, está repartido, tiene contradicciones, está en lenguaje natural, y la presencia del elicitador puede cambiar el problema. Además los requerimientos pueden cambiar durante el proyecto y los miembros de la organización pueden no conocer bien el problema.

Según Joe Goguen, los requerimientos no están solo "en la mente del cliente" sino en el **sistema social de la organización**: hay que inventarlos en un trabajo cooperativo entre cliente, usuarios y desarrolladores, y las dificultades son sobre todo **sociales, políticas y culturales**, no técnicas.

**1.2 Comprender los requerimientos**: **abstraer, descomponer, proyectar y modularizar**, y armar **modelos conceptuales** (representaciones simplificadas que ayudan a entender el problema, detectar metas y ver si falta conocimiento).

| Técnica | Qué es | Para qué | Ojo |
|---|---|---|---|
| **Abstraer** | Ignorar diferencias entre conceptos parecidos para agruparlos | Panorama general y características esenciales | Hay que elegir qué es lo importante |
| **Descomponer** | Dividir el problema en partes más simples | Entender cada elemento con sus detalles | Las partes no son del todo independientes |
| **Proyectar** | Describir distintas visiones de los mismos elementos | Ver patrones e identificar conflictos entre stakeholders | Las visiones pueden ser inconsistentes |
| **Modularizar** | Combinar lo entendido en módulos | Estructuras estables y reutilizables; organizar tareas y equipos | Algunos módulos son más fáciles que otros |

El modelado sirve para entender mejor los requerimientos, **detectar problemas** (requerimientos ocultos, mal definidos, inconsistentes, confusiones de terminología, fuera de alcance, conflictos no resueltos) y **comunicarlos**. Herramientas: diagramas **UML** (secuencia, actividades, casos de uso, clases, estados), **árbol de descomposición funcional** (meta principal → metas → submetas), **tablas de decisión**, **árboles de decisión**, **fórmulas** y **pseudo-reglas** ("SI EDAD(p) ≥ 21 ENTONCES p.CONDICIÓN = Adulto").

**1.3 Articulación**: definir el **alcance** (objetivos, **criterios de éxito**, riesgos) y estudiar la **viabilidad**: ¿es posible aplicar IA?, ¿es la mejor alternativa? La viabilidad sirve para **delimitar y confirmar el alcance**.

Lo que se articula, con el ejemplo de clase (una tienda que quiere vender más):
- **Expectativas**: lo que el cliente espera lograr ("vender más productos").
- **Deseos y necesidades**: lo pedido por los stakeholders, que puede ser opcional u obligatorio, urgente o no, estable o voluble ("mejorar el sitio web").
- **Restricciones**: limitaciones operativas o legales ("solo hay datos de los últimos 6 meses").
- **Suposiciones**: lo que no se sabe con certeza o puede cambiar ("el comportamiento de los clientes se mantiene").
- **Objetivos**: lo que la IA debería hacer (recomendar productos a clientes existentes y nuevos).
- **Criterios de éxito**: qué tiene que pasar para considerar exitoso el proyecto, **con métricas objetivas** (al menos tres recomendaciones por cliente, 75% de probabilidad de que mire una y 10% de que la compre).
- **Riesgos**: lo que puede afectar el proyecto (las preferencias cambian; los clientes nuevos son distintos).
- **Alcance**: la delimitación de lo que entra en el proyecto (un módulo de recomendación en el sitio web). Hay que fijarlo con cuidado para que tenga sentido usar IA, y no meter "todas las funcionalidades que pidieron".

Viabilidad en tres preguntas: ¿**se puede** aplicar IA?, ¿es la **mejor alternativa**? ("no la trates como un martillo para todos tus problemas"), ¿se **justifica**? ("no tengas miedo de lanzar tu producto sin IA"). Anécdota de clase: una fábrica de jabón quería detectar cajas vacías con rayos X y un sistema inteligente; la mejor solución fue **un ventilador** que volaba las cajas vacías de la cinta.

**1.4 Formalización**: transformar los objetivos en tareas y diseñar los módulos. Cada **módulo** (uno por objetivo) tiene **precondiciones** y **poscondiciones**; cada **tarea** tiene **propósito, entradas, acción y salida**. Tipos de acción:

| Acción | Qué hace | Ejemplo |
|---|---|---|
| Optimización | Encontrar la combinación de valores que maximice o minimice una función | Qué cajas meter en una mochila de 15 kg para ganar más |
| Clasificación | Determinar la clase de un elemento entre 2 o más opciones | |
| Predicción | Determinar un comportamiento futuro (con algo de incertidumbre) | Temperatura según el viento |
| Regresión | Encontrar una función que represente valores numéricos | y = a·x + b |
| Clustering | Identificar grupos de elementos similares | Grupos de clientes por historial de compras |
| Reglas de asociación | Inferir condiciones que relacionan características | |
| Detección de anomalías | Identificar elementos que se comportan distinto al resto | |
| Generativa | Generar texto, imágenes u otros medios a partir de una entrada | |

En el ejemplo de recomendación, el objetivo 1 (cliente con compras) se arma con: tarea 1.1 clustering de clientes por historial, tarea 1.2 clustering de productos similares, tarea 1.3 predicción de los productos que el cliente podría comprar.

> Trampa: comprender el problema **facilita todo**: elegir la tecnología, identificar las fuentes de datos útiles y estudiar si los datos son representativos. Las preguntas de "el ingeniero debe…" en esta fase suelen tener "todas las anteriores".

## Fase 2: Datos (opcional)

Solo se hace **si hay datos**; por eso es obligatoria para una **Red Neuronal** y no para un Algoritmo Genético ni un Sistema Experto Tradicional.
- **Recolección**: bases transaccionales, planillas, logs, informes, datos públicos. Se recomienda versionarlos y cuidar la privacidad.
- **Estudio**: ¿cuántos hacen falta?, ¿todos los atributos sirven?, ¿hay ruido, errores o duplicados?, ¿son **representativos y válidos**?, ¿generan sesgo?
- **Preparación**: integración (una tabla por módulo), formateo (incluida la **normalización**) y limpieza.

Vocabulario: los **datos** son la información concreta del problema, normalmente en una **tabla**. Cada **columna o atributo** es una propiedad (hay **atributos de entrada** y un **atributo clase, objetivo o etiqueta**); cada **fila, tupla o ejemplo** es una instancia con sus valores.

Más detalle de cada paso:
- **Recolección**: fuentes como bases transaccionales, planillas, logs, informes estadísticos, datos públicos, datos generados con heurísticas o por otros sistemas inteligentes. Preguntas: ¿es confiable?, ¿quién los crea, modifica y usa?, ¿están viejos o se siguen actualizando?, ¿cuesta mucho acceder y lo justifica la utilidad? Ojo con la **privacidad** y **versioná** los datos.
- **Estudio**: se hace con **visualización**, técnicas estadísticas, minería de datos o métodos ad hoc. La cátedra propone incluso un **método basado en el Emparrillado** para evaluar si los datos sirven para entrenar ML (por ejemplo, con el conjunto Iris de Fisher).
- **Preparación**: **puede llevar el 50% del esfuerzo**. Conviene diseñarla en papel, automatizarla y probarla.
  - **Integración**: unificar los datos en una única tabla.
  - **Limpieza**: valores nulos, incompletos o con ruido, en columnas o filas. Se puede **asignar un valor nuevo** (mínimo, promedio, máximo, especial o estimado) o **eliminar** el ejemplo o el atributo.
  - **Formateo**: los atributos pueden ser **continuos** (binarios, enteros, decimales) o **discretos** (lógicos, alfanuméricos, fecha-hora). Se crean atributos nuevos para cambiar el tipo, normalizar o combinar otros. Continuo → discreto: **discretizar** en rangos manuales, de igual ancho, de igual frecuencia, de tamaño fijo, según el atributo objetivo o según el aporte de información (entropía). Discreto → continuo: un código numérico por valor (mejor si los parecidos quedan cerca) o **un atributo binario por cada valor**. Fechas: separar en día, mes, año, hora; calcular tiempo transcurrido desde un momento; o codificar día de semana, feriado, estación.

## Fases 3 y 4: Tecnología y Modelo

La **Selección de la Tecnología** evalúa el tipo de tarea de cada módulo:
- **Machine Learning** (clasificación o predicción con datos): hay que definir métricas, prototipar y experimentar, evaluar la generalización y seleccionar patrones.
- **IA Tradicional** (SBC, SET): requiere reglas y conceptos.
- **Inteligencia Computacional** (AG): definir el cromosoma y la función de aptitud; requiere conceptos, características, reglas o heurísticas.

La **Construcción del Modelo** se hace **siempre**, sea cual sea la tecnología:
- RNA: entrenamiento, validación y prueba.
- SBC: los conocimientos **extraídos** sirven para identificar las reglas a cargar en la Base de Conocimientos.
- SET: los conocimientos **educidos** sirven para identificar las reglas a cargar en la Base de Conocimientos.
- AG: diseño, desarrollo y prueba.

## Fase 5: Aplicación

- Diseñar y desarrollar las **canalizaciones** (interfaces entre los modelos) y las interfaces externas con los sistemas existentes. Una canalización define cómo se ejecuta en producción todo lo del sistema inteligente de forma integrada: recolección de datos, preparación, ejecución del modelo y ajuste de sus resultados.
- **Regla de oro** (*Golden Rule*): en producción hay que hacer **exactamente las mismas acciones de recolección y preparación de datos** que en el desarrollo. Si no, el modelo puede comportarse de forma inesperada.
- **Modelo del pan de pasas** (Esther Dyson): las aplicaciones de IA más exitosas son aquellas donde la IA está repartida como las pasas en el pan: no ocupan mucho lugar, pero suelen ser lo que más alimenta. Ejemplos: segmentación de clientes, pronóstico de demanda, análisis de riesgo financiero, asistencia a clientes.
- Ejemplo de mala integración que usa la cátedra: un sistema de reconocimiento facial que detectaba bien a las personas, pero generaba detenciones erróneas porque los datos de los pedidos judiciales estaban desactualizados o mal cargados. **Una integración incorrecta lleva a la falta de confianza en el sistema inteligente**, aunque el modelo funcione.
- **Probar los modelos en forma integrada**.
- Instalar en producción, monitorear y mantener. El mantenimiento puede cambiar las interfaces, la cantidad de módulos o modelos, los datos y hasta la tecnología.

> Trampa: un proyecto puede **fracasar** si no se integra con los sistemas existentes o si los objetivos están mal identificados. No fracasa por "no usar Machine Learning" ni por "no tener datos" (hay otras tecnologías).
