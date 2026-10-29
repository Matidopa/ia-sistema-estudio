## Lo que sí o sí tenés que saber

- **Sistema Inteligente = Conocimientos + Tecnología**: racional, no omnisciente, no infalible, puede aprender, flexible y robusto.
- **Software tradicional y SI** tienen en común que **satisfacen deseos y necesidades de los stakeholders**. Algorítmico y procedimental es del tradicional; declarativo, flexible y robusto, del SI.
- Tres familias: **IA Tradicional** (reglas explícitas + búsqueda), **Inteligencia Computacional** (inspiración biológica: RNA, AG, enjambre) y **Machine Learning** (Datos → Algoritmo → Modelo).
- Con **Base de Conocimientos** el conocimiento es **explícito**; sin BC, **implícito**.
- **SBC**: BC siempre explícita, fuentes **públicas**. **SET**: fuentes **privadas y públicas**. **SE**: puede o no tener BC explícita.
- En el SBC, la **Base de Conocimientos** guarda reglas en **lógica de 1er orden** y el **Motor de Inferencias** elige cuáles aplicar con **métodos de búsqueda**.
- Solo el **SET** justifica sus resultados (**Trazador de Explicaciones** + Memoria de Trabajo). La RNA es **caja negra**.
- **Sistema Experto Difuso**: reglas subjetivas del experto sobre datos imprecisos.
- **Offline** no aprende más en producción (mantenimiento manual); **online** sigue aprendiendo.

## Cómo te lo preguntan

- «Un ejemplo de problema de Optimización/Predicción/Clasificación es…»: mirá la **salida**. Categoría → clasificación; número → predicción; mejor combinación que maximiza o minimiza → optimización.
- «Para… debería usar…»: optimización → **AG**; clasificar o predecir con datos → **RNA Multi-Perceptrón Backpropagation**; reglas subjetivas educidas → **Sistema Experto Difuso**.
- «Los sistemas que… son»: justificar → SET; búsqueda de reglas o fuentes públicas → SBC; ejemplos o caja negra → RNA.
- «Si la organización no tiene datos pero sí…»: reglas → todas; solo heurísticas → Inteligencia Computacional.
- «Para que un lavarropas/heladera sea realmente inteligente…»: la opción en la que **decide a partir de datos**.

## Trampas típicas

> Trampa: "identificar la cantidad de lados" es estimación, aunque diga "identificar". Manda el tipo de salida.

> Trampa: Memoria de Trabajo y Trazador de Explicaciones son del SET, no de todo Sistema Experto.

> Trampa: la BC **guarda** reglas; el Motor de Inferencias las **elige**. No los cruces.

> Trampa: definir conocimientos automáticamente desde una tabla es Machine Learning; reglas explícitas con búsqueda es IA Tradicional. IA Fuerte nunca es una arquitectura.

> Trampa: el Perceptrón simple solo resuelve problemas lineales y Hopfield reconstruye patrones; para clasificar o predecir de verdad va Backpropagation.

## Fórmulas y convenciones

| Situación | Tecnología |
|---|---|
| Mejor combinación (max/min) | Algoritmo Genético |
| Clasificar o predecir con datos etiquetados | RNA Multi-Perceptrón Backpropagation |
| Obtener reglas de clasificación desde datos | Algoritmo de Inducción |
| Repetir las reglas del experto | Sistema Experto Tradicional |
| Reglas subjetivas, datos imprecisos | Sistema Experto Difuso |

| Qué tiene la organización | Qué se puede usar |
|---|---|
| Datos | Machine Learning |
| Sin datos, con reglas | Todas |
| Sin datos ni reglas, con heurísticas | Inteligencia Computacional |
| Nada | No se puede aplicar IA |
