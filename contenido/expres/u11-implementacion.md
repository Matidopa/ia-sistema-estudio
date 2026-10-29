## Lo que sí o sí tenés que saber

- Son **cinco fases**: Definición del Problema, Identificación y Transformación de los Datos, Selección de la Tecnología, Construcción del Modelo y Aplicación del Sistema Inteligente.
- **Lo primero** es **identificar las fuentes de información**: recursos propios, externos, **stakeholders** y **expertos**.
- En **Definición del Problema** se **elicitan** (extracción y educción) y se **comprenden** los requerimientos, se fija el **alcance** con la **viabilidad** y se **diseñan los módulos**.
- Comprender = **abstraer, descomponer, proyectar y modularizar**, más modelos conceptuales.
- La **viabilidad** sirve para **delimitar y confirmar el alcance**.
- Fase de **Datos**: **recolección, estudio y preparación** (ahí va la **normalización**). Es la única **opcional**: obligatoria para RNA, no para AG ni SET.
- **Construcción del Modelo** se hace **siempre**: RNA → entrenamiento, validación y prueba; SBC → reglas de conocimientos **extraídos**; SET → reglas de conocimientos **educidos**.
- **Aplicación**: **canalizaciones**, interfaces externas, **prueba integrada**, producción y mantenimiento.

## Cómo te lo preguntan

- «La fase que se ocupa de…»: buscá la palabra clave en la tabla de abajo; diseñar es fase 1, construir es fase 4, integrar es fase 5.
- «Después de construir los modelos se debe…»: algo de la Aplicación (probar integrado, canalizaciones).
- «El ingeniero debe… / tener en cuenta…» en la fase 1: casi siempre **todas**.
- «Puede fracasar si…»: **no se integra** o **los objetivos están mal identificados**.
- «Durante el mantenimiento pueden cambiar…»: **todas** (interfaces, módulos, modelos, datos, tecnología).

## Trampas típicas

> Trampa: diseñar los módulos es Definición del Problema; construirlos es Construcción del Modelo.

> Trampa: la fase de Datos no es obligatoria siempre; Construcción del Modelo sí.

> Trampa: el SBC usa conocimientos extraídos y el SET educidos. El Motor de Inferencias no se entrena y las reglas no tienen pesos.

> Trampa: no usar Machine Learning, no tener datos o usar solo conocimiento público no hacen fracasar un proyecto.

> Trampa: "analizar las últimas tecnologías de la IA como ciencia" no es parte de ninguna fase.

## Fórmulas y convenciones

| Fase | Palabras clave |
|---|---|
| 1. Definición del Problema | fuentes, stakeholders, extracción y educción, comprender, modelos conceptuales, alcance, criterios de éxito, viabilidad, módulos |
| 2. Datos | recolección, estudio (representativos y válidos), preparación, normalización, limpieza |
| 3. Selección de la Tecnología | tipo de tarea → ML, IA Tradicional o IC |
| 4. Construcción del Modelo | entrenamiento/validación/prueba, cargar reglas, diseñar y probar el AG |
| 5. Aplicación | canalizaciones, interfaces externas, prueba integrada, producción, mantenimiento |
