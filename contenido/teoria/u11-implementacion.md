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

**1.2 Comprender los requerimientos**: **abstraer, descomponer, proyectar y modularizar**, y armar **modelos conceptuales** (representaciones simplificadas que ayudan a entender el problema, detectar metas y ver si falta conocimiento).

**1.3 Articulación**: definir el **alcance** (objetivos, **criterios de éxito**, riesgos) y estudiar la **viabilidad**: ¿es posible aplicar IA?, ¿es la mejor alternativa? La viabilidad sirve para **delimitar y confirmar el alcance**.

**1.4 Formalización**: transformar los objetivos en tareas (optimización, clasificación, predicción, regresión, clustering, reglas de asociación, detección de anomalías) y diseñar los módulos.

> Trampa: comprender el problema **facilita todo**: elegir la tecnología, identificar las fuentes de datos útiles y estudiar si los datos son representativos. Las preguntas de "el ingeniero debe…" en esta fase suelen tener "todas las anteriores".

## Fase 2: Datos (opcional)

Solo se hace **si hay datos**; por eso es obligatoria para una **Red Neuronal** y no para un Algoritmo Genético ni un Sistema Experto Tradicional.
- **Recolección**: bases transaccionales, planillas, logs, informes, datos públicos. Se recomienda versionarlos y cuidar la privacidad.
- **Estudio**: ¿cuántos hacen falta?, ¿todos los atributos sirven?, ¿hay ruido, errores o duplicados?, ¿son **representativos y válidos**?, ¿generan sesgo?
- **Preparación**: integración (una tabla por módulo), formateo (incluida la **normalización**) y limpieza.

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

- Diseñar y desarrollar las **canalizaciones** (interfaces entre los modelos) y las interfaces externas con los sistemas existentes.
- **Probar los modelos en forma integrada**.
- Instalar en producción, monitorear y mantener. El mantenimiento puede cambiar las interfaces, la cantidad de módulos o modelos, los datos y hasta la tecnología.

> Trampa: un proyecto puede **fracasar** si no se integra con los sistemas existentes o si los objetivos están mal identificados. No fracasa por "no usar Machine Learning" ni por "no tener datos" (hay otras tecnologías).
