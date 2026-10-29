## Para qué sirve esta unidad

Un sistema inteligente es **conocimiento + tecnología**. Esta unidad responde de dónde sale el conocimiento y con qué técnicas se lo saca. Es la puerta de entrada a Análisis de Protocolos y Emparrillado, que son dos de esas técnicas.

## Dato, información y conocimiento

- **Dato**: un valor suelto ("38,5").
- **Información**: el dato con significado ("el paciente tiene 38,5 °C").
- **Conocimiento**: saber qué hacer con eso dentro del dominio ("con más de 38 °C y estos síntomas, sospecho X").

El software tradicional transforma **datos en noticias** (información). Un sistema inteligente transforma **datos en conocimiento**: les encuentra significado y utilidad dentro del dominio.

## De dónde sale el conocimiento: fuentes públicas y privadas

| Fuente | Qué es | Ejemplos | Cómo se obtiene |
|---|---|---|---|
| **Pública** | Está escrita y cualquiera la puede leer | Libros, manuales, normas, papers, bases de datos | **Extracción** |
| **Privada** | Está en la cabeza del experto: su experiencia, sus trucos | Cómo un médico "se da cuenta" de un diagnóstico | **Educción** |

> Trampa: el conocimiento público se **extrae**; el privado se **educe**. "Educción" con c es la palabra de la cátedra (no "deducción").

## Declarativo y procedimental

- **Declarativo**: *qué* hay en el dominio. Los objetos, sus características, sus valores y las relaciones entre ellos.
- **Procedimental**: *cómo* se resuelve. Los pasos y reglas que aplica el experto ("si pasa esto, entonces hago aquello").

Esto se conecta con las técnicas: el Análisis de Protocolos da los dos (el declarativo en la codificación, el procedimental en las reglas de la interpretación). El Emparrillado da conocimiento declarativo: agrupaciones y relaciones entre características.

## Técnicas para adquirir conocimiento

**Extracción (conocimiento público)**
- Análisis de documentación.
- Análisis de datos.

**Educción (conocimiento privado)**
- Entrevistas y cuestionarios.
- Observación y análisis de tareas habituales.
- Tormenta de ideas.
- Clasificación de conceptos.
- **Análisis de Protocolos** → unidad 3.
- **Emparrillado** → unidad 4.

## El Ingeniero de Conocimiento

Es quien lleva adelante la adquisición: entrevista al experto, aplica las técnicas, valida con él lo que interpretó y lo convierte en algo que una máquina pueda usar. La **Ingeniería del Conocimiento** tiene cuatro pasos: adquirir conocimientos (ciclos de educción), conceptualizar (entender el dominio y su terminología), formalizar (expresarlo con una técnica de representación) e implementar.

Para qué usa cada técnica, como se pregunta en los parciales:

| Técnica | El Ingeniero la usa para… |
|---|---|
| Análisis de Protocolos | identificar las **reglas** que aplica el experto al resolver el problema |
| Emparrillado | identificar la **relación entre los conceptos** (elementos y características) que usa el experto |

> Trampa: ninguna técnica de educción "genera un mecanismo que resuelve el problema automáticamente" ni "encuentra datos que el experto no mencionó". Educir es sacar lo que el experto sabe, no inventar.
