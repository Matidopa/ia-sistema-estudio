## Para qué sirve

El **Análisis de Protocolos** (AP) es una técnica de educción: se le pide al experto que **piense en voz alta mientras resuelve un problema real**, se graba, se transcribe y se analiza. Sirve para sacar lo que el experto usa pero no sabe explicar conscientemente: sus conceptos, cómo los describe y las reglas con las que decide.

En el parcial te dan un **Anexo A** con la transcripción numerada por líneas y te hacen unas 5 preguntas: segmentos de frase, relaciones implícitas, sinónimos, extractos de la tabla y características de un concepto.

## Las cuatro etapas

| Etapa | Qué se hace |
|---|---|
| 1. **Grabación del protocolo** | El Ingeniero de Conocimiento (IC) le explica al experto el objetivo y la metodología, lo pone en situación con ejercicios chicos, le da confianza y graba. Si el experto se queda callado, lo interrumpe para que siga hablando. |
| 2. **Transcripción** | Se pasa la grabación a texto **segmentado en frases numeradas**. También se anotan las acciones que el experto hace sin hablar. |
| 3. **Codificación** | El análisis propiamente dicho (ver abajo). |
| 4. **Interpretación** | Se escriben las **reglas de razonamiento** del experto en pseudocódigo: `SI (concepto.característica = valor) Y … ENTONCES …` |

## La codificación, paso a paso

**3.1. Identificar los elementos del protocolo**

| Elemento | Qué es | Analogía con una base de datos |
|---|---|---|
| **Concepto** | Una entidad del dominio | Tabla |
| **Característica** | Un atributo de un concepto | Campo |
| **Valor** | Lo que toma esa característica | Valor del campo |
| **Relación** | Vínculo entre conceptos (o con características y valores) | Clave foránea |
| **Operador** | La expresión con la que el experto pasa de un estado a otro más cerca de la solución ("deduzco que", "concluimos que se trata de") | — |

Se arma la **tabla de Conceptos – Características – Valores** (tabla CCV). Si el experto dice un valor pero no nombra la característica ("pequeños filamentos"), la característica se escribe **implícita, entre paréntesis**: filamentos → (tamaño) → pequeños.

Reglas de la tabla CCV:
- No puede tener huecos: cada característica tiene su valor.
- Todo lo implícito se **valida con el experto**.
- Los conceptos que son **estados** (las posibles respuestas, por ejemplo "alga Corallina") no tienen características.
- Los **sinónimos** no tienen características propias ni relaciones entre sí.

**3.2. Relaciones implícitas.** Vínculos entre conceptos que el experto da por sentados pero no dice con esas palabras: "alga *es tipo* alga Corallina", "alga *tiene* ramas", "ramas *formadas por* filamentos".

**3.3. Identificación de la búsqueda.** Los estados por los que pasó el experto (cada conclusión parcial), las características que observó en cada uno y los operadores que lo llevaron de uno a otro.

**3.4. Sinónimos, metacomentarios e incertidumbres.**
- **Sinónimos**: palabras distintas para el mismo concepto ("alga" y "planta").
- **Metacomentario**: algo que el experto dice pero que **no aporta información directa a su razonamiento**: comentarios, aclaraciones, consecuencias, opiniones o conectores ("asimismo"). Se indica la línea y qué significa.
- **Incertidumbre**: una duda del experto **sobre el cambio de estado**, es decir sobre su conclusión ("deduzco que *se podría tratar* de…").

## Ejemplo resuelto (el de la clase: un alga)

```
 1  En este alga,                     10  de una cualidad del
 2  podemos observar                  11  Alga Corallina.
 3  sus ramas ligeramente rígidas     12  Asimismo,
 4  de tonos verdes y amarillos.      13  en esta planta,
 5  Sus ramas                         14  podemos distinguir
 6  están formadas por                15  que sus paredes celulares son planas y
 7  pequeños filamentos               16  contienen celulosa.
 8  que miden 3mm de ancho.           17  Concluimos que se trata del
 9  Deduzco que se podría tratar      18  Alga Nostoc.
```

**Tabla CCV**

| Concepto | Característica | Valor |
|---|---|---|
| alga | — | — |
| ramas | rígidas | ligeramente |
| | tonos | verdes y amarillos |
| filamentos | (tamaño) | pequeños |
| | ancho | 3 mm |
| alga Corallina | (estado) | — |
| planta | (sinónimo de alga) | — |
| paredes celulares | (forma) | planas |
| | (contenido) | celulosa |
| alga Nostoc | (estado) | — |

**Relaciones implícitas**: alga —es tipo→ alga Corallina; alga —es tipo→ alga Nostoc; alga —tiene→ ramas; ramas —formadas por→ filamentos; alga —tiene→ paredes celulares.

**Operadores**: "de una cualidad del" (línea 10) y "concluimos que se trata del" (línea 17).

**Sinónimos**: alga y planta. **Metacomentario**: "asimismo" (línea 12, separa subetapas). **Incertidumbre**: "deduzco que se podría tratar" (línea 9).

**Interpretación (reglas)**
```
SI (ramas.rígidas = ligeramente) Y (ramas.tonos = verdes y amarillos) Y
   (filamentos.tamaño = pequeños) Y (filamentos.ancho = 3 mm)
ENTONCES asignar (tipo de alga, Alga Corallina)

SI (paredes celulares.forma = planas) Y (paredes celulares.contenido = celulosa)
ENTONCES asignar (tipo de alga, Alga Nostoc)
```

**Conocimiento obtenido**: el **declarativo** (objetos, características, valores y relaciones) sale de la codificación; el **procedimental** (cómo resolvió) sale de las reglas de la interpretación.

## Cómo responder cada tipo de pregunta del parcial

**"El segmento de frase completo «…» es…"** Las opciones son siempre: incertidumbre, metacomentario, sinónimo de algo, o valor de una característica de un concepto. Preguntate:
1. ¿Describe un rasgo observable de un concepto? Entonces es **valor** (aunque traiga matices: "generalmente bien", "casi normal", "ligeramente" son parte del valor).
2. ¿Es una duda sobre la conclusión ("podría ser la opción", "se podría tratar de")? → **incertidumbre**.
3. ¿Es una consecuencia, explicación, comparación u opinión que no suma un dato al diagnóstico ("lo que indica leucocitosis", "con lo cual podría limitar tareas largas", "parece asemejarse a las uñas en gel")? → **metacomentario**.

> Trampa: que la frase tenga "podría" o "puede" **no** la convierte en incertidumbre. Si la duda no es sobre el estado al que llega el experto, es un metacomentario.

**"Una relación implícita podría ser…"** La correcta une **dos conceptos** con un verbo que el texto no dice así. Descartá:
- relaciones entre **sinónimos** ("dispositivo —es un→ equipo" cuando son sinónimos);
- relaciones hacia un **valor** de una característica ("dispositivo —tiene→ aplicaciones rápidas": "rápidas" es valor);
- relaciones con algo que aparece **solo en un metacomentario** ("se utiliza en aulas");
- relaciones que el texto dice **explícitamente** con esas palabras.

**"El siguiente extracto de la tabla CCV es…"** Verificá que cada característica sea de ese concepto, que no le falte ninguna que el texto le atribuye y que ningún valor salga de un metacomentario. Las opciones "falta la característica implícita X con su valor Y" suelen ser trampas: proponen como característica algo que en realidad es una relación o pertenece a otro concepto.

> Trampa: si un valor del extracto aparece dentro de un metacomentario (por ejemplo "muy resistentes" dicho como comentario), el extracto es **incorrecto** por eso.

**"Si X fuera considerado como concepto, algunas de sus características serían…"** Elegí la lista **más corta** que tenga solo lo que el texto le atribuye a X. Las opciones largas agregan algo que es de otro concepto, una relación ("tecnología incorporada", "utilización") o algo de un metacomentario.

**"Son sinónimos…"** Solo palabras que el experto usa para **el mismo concepto**. Una palabra que solo aparece en un metacomentario, o que es otro concepto parecido, no cuenta. "No existen sinónimos en este protocolo" es una respuesta que sale seguido.

**"En este protocolo se observan N estados…"** Los estados son las conclusiones a las que llega el experto (las hipótesis entre las que decide), no cada concepto que nombra.
