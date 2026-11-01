## Para qué sirve

La IA usa la lógica para dos cosas:
1. **Representar conocimiento** educido del experto y guardarlo en la Base de Conocimientos.
2. **Hacer deducciones**, que es el trabajo del Motor de Inferencias.

Hasta 2023 la lógica era un bloque entero del parcial (traducciones y deducción natural). En 2024 y 2025 quedó sobre todo **lógica difusa** dentro de teoría. Conviene saber las dos cosas.

## Lógica proposicional y de primer orden

**Proposicional**: proposiciones con valor de verdad (V o F) unidas con operadores (∧ y, ∨ o, → entonces, ↔ si y solo si, ¬ no). Es demasiado simple para implementar IA.

**Primer orden (de predicados)**: además tiene
- **variables** (objetos indeterminados: x, y) y **constantes** (objetos determinados: Juan);
- **funciones de verdad** que dicen una característica de un objeto: H(x) "x es humano" → sirven para **representar características de las entidades del dominio**;
- **relaciones** entre objetos: P(x, y) "x posee y", T(x, y, z);
- **cuantificadores**: ∀ (para todo) y ∃ (existe), que indican si una variable se refiere a **muchos individuos o a uno**.

La lógica de primer orden **representa más conocimiento** que la proposicional.

## Traducir una frase a lógica de primer orden

Dos reglas de oro de la cátedra:
- Si el cuantificador principal es **∀** ("Los …", "Todos los …"), la fórmula tiene una **implicación** →. Lo que describe al sujeto va a la izquierda; lo que hace o tiene, a la derecha.
- Si el cuantificador principal es **∃** ("Algunos …"), la fórmula **no tiene implicación**: todo va unido con ∧.

Además, los objetos que aparecen en el **antecedente** (la descripción del sujeto) suelen ir con ∀ y los que aparecen solo en el **consecuente** (lo que "tiene", "genera", "produce") con ∃.

**Ejemplo (parcial 2023).** "Todos los guitarristas que tocan con los Guns N' Roses usan guitarras fabricadas por Gibson."

```
∀x ∀y ∃z ∃w [ Gx ∧ T(x,y) ∧ Ry  →  U(x,z) ∧ Sz ∧ F(z,w) ∧ Iw ]
   x: guitarrista   y: Guns N' Roses   z: guitarra   w: Gibson
```

**Ejemplo con "algunos".** "Algunos lenguajes de programación poseen tipos de datos que soportan operadores para poder generar nuevos valores."

```
∃x ∃y ∃z ∃w [ Px ∧ R(x,y) ∧ Ty ∧ S(y,z) ∧ Oz ∧ G(z,w) ∧ Vw ∧ Nw ]
```

> Trampa: mirá **quién se relaciona con quién**. En el último ejemplo los operadores los soportan los *tipos de datos* (S(y, z)), no el lenguaje (S(x, z)). Las opciones incorrectas suelen cambiar una sola variable de lugar, meter una → en una frase con "algunos" o poner ∨ donde va ∧.

## Deducción Natural

Es un método para demostrar que una **tesis** se deduce de un conjunto de **hipótesis**, usando solo reglas de inferencia. Se escribe en tres columnas: número de línea, fórmula y justificación (qué regla y sobre qué líneas). La numeración da la **trazabilidad** de la demostración.

**Reglas (introducción y eliminación de cada operador)**

| Regla | Qué permite |
|---|---|
| Eliminación de la implicación (**Modus Ponens**) | De A → B y A, obtener B: acceder al consecuente a partir de un antecedente verdadero |
| Introducción de la implicación (**II**) | Suponer A; si se llega a B, cerrar el supuesto y concluir A → B. **Solo** se usa cuando la tesis tiene una implicación |
| Introducción de la conjunción (**IC**) | De A y de B, obtener A ∧ B. Los dos términos tienen que existir ya en la demostración (ser verdaderos) |
| Eliminación de la conjunción (**EC**) | De A ∧ B, obtener A (o B). Todos los términos que salen son verdaderos |
| Introducción de la disyunción (**ID**) | De A, obtener A ∨ C. Alcanza con que **al menos uno** exista en la demostración |
| Eliminación de la disyunción (**ED**) | De A ∨ B: suponer A y llegar a C, suponer B y llegar a C → C. Lo que se deduce en el camino de A **solo** sirve en ese camino |
| Negación | Suponer A y llegar a una contradicción → ¬A. Doble negación = sin negación |
| ∀ y ∃ | Eliminar ∀: lo que vale para todos vale para uno. Introducir ∃: si uno lo cumple, existe uno que lo cumple |

**Los tips que más se toman**
- Se deben usar **todas** las hipótesis.
- Si la tesis **tiene una implicación**, se empieza **suponiendo el antecedente de la tesis** (y se cierra con II).
- Si la tesis **no tiene implicación**, **no se puede suponer nada** (salvo dentro de una eliminación de la disyunción).
- Si **todas** las hipótesis tienen ∀, la tesis puede tener ∀ o ∃.
- Si **una** hipótesis tiene ∃ (y el resto ∀), la tesis **tiene** ∃.
- Si la tesis tiene ∀, todas las hipótesis deben tener ∀.

> Trampa: en "la hipótesis faltante" o "la única tesis válida", primero descartá por cuantificadores (con una hipótesis existencial la tesis tiene que ser existencial) y por implicación. Después encadená las hipótesis como un camino: cada consecuente tiene que alimentar el antecedente de la siguiente.

## Lógica Difusa

Es un mecanismo de **razonamiento aproximado** que obtiene conclusiones a partir de datos **vagos, ambiguos, imprecisos, con ruido o incompletos**. En vez de verdadero o falso usa una **función de pertenencia** μ con valores continuos entre 0 y 1:

- μ = 0 → no pertenece; μ = 1 → pertenece totalmente; en el medio, pertenece en cierto grado.
- La función de pertenencia es **el grado en que un elemento se ajusta a una definición**. **No es una probabilidad**: los grados no tienen que sumar 1.

Ejemplos del parcial: "la poción es bastante poderosa" → μ_PODER(poción) = 0,8 o 0,9; "poco poderosa" → 0,2; "la glucosa es baja" → μ_glucosa(paciente) = 0,2; "bastante fiebre" → 0,8.

| Lógica tradicional | Lógica polivalente | Lógica difusa |
|---|---|---|
| Solo V (1) o F (0) | V, F y medio verdadero (0,5) | Cualquier valor continuo en [0, 1] |

**Por qué hace falta** (presentación 2026): la lógica proposicional y la de primer orden usan valores discretos, necesitan datos precisos, **no imitan bien cómo piensan las personas** y es difícil agregarles conocimiento. El **razonamiento aproximado** busca imitar cómo piensan y deciden las personas. Hay dos grandes familias: los **modelos probabilistas** (**modelos de Markov**, que analizan cómo evoluciona un sistema en el tiempo, y **redes bayesianas**, que analizan dependencias probabilísticas) y la **lógica con valores continuos** (difusa). La difusa se basa en el "sentido común" y el lenguaje natural, tolera datos imprecisos, **no hay una transición brusca** de falso a verdadero y es fácil agregarle conocimiento nuevo. **No es un modelo probabilístico.**

**Ejemplo completo de clase: altura y contextura**

Funciones de pertenencia de la altura:
- μ_ALTA(x) = 1 si x ≥ 1,80 m; entre 0 y 1 si 1,65 < x < 1,80; 0 si x ≤ 1,65.
- μ_MEDIANA(x) = 1 si x = 1,65 m; entre 0 y 1 entre 1,50 y 1,65 y entre 1,65 y 1,80; 0 si x ≤ 1,50 o x ≥ 1,80.
- μ_BAJA(x) = 1 si x ≤ 1,50 m y baja hasta 0 en 1,65.

Para una persona de **1,78 m**: μ_ALTA = 0,8; μ_MEDIANA = 0,2; μ_BAJA = 0,0. Se interpreta: "casi alta, un poco mediana y nada baja". Para una muñeca de 14 cm: μ_FINA = 0,9; μ_GRUESA = 0,3; μ_MUY-GRUESA = 0,0.

- SI muñeca fina ENTONCES contextura pequeña → μ_PEQUEÑA = 0,9.
- SI (alta O mediana) Y muñeca gruesa ENTONCES mediana → min{ max(0,8; 0,2); 0,3 } = min{0,8; 0,3} = **0,3**.
- SI baja Y NO muñeca fina ENTONCES grande → min{ 0,0; 1 − 0,9 } = **0,0**.

Para resolver una implicación: (a) calcular la pertenencia de cada entrada del antecedente, (b) resolver los operadores del antecedente hasta tener **un solo valor**, (c) **propagar ese valor al consecuente**.

**Operadores difusos**

| Operador | Cálculo |
|---|---|
| Conjunción (Y, ∧) | **mínimo** de las pertenencias |
| Disyunción (O, ∨) | **máximo** |
| Negación (NO) | 1 − μ (en la presentación: \|1 − μ\|) |
| Implicación (SI A ENTONCES B) | Se resuelven los operadores del antecedente hasta tener un solo grado y ese grado **se propaga al consecuente** |

Ejemplo: SI (efectos.intensidad = graves) Y (efectos.molestia = molestos) ENTONCES hechizo muy poderoso → PODER(hechizo) = **mínimo**[INTENSIDAD, MOLESTIA]. Con (A ∨ B ∨ C) → D, μ_D = **máximo**(μ_A, μ_B, μ_C).

**Sistemas difusos**: fuzzificación (pasar las entradas a pertenencias) → base de conocimientos con reglas difusas (del experto o de libros) → motor de inferencias → desfuzzificación. Dos modelos: **Mamdani** (simple, pero necesita muchas reglas; combina con centro de masa o promedio del máximo) y **Takagi-Sugeno** (el consecuente es una función lineal y se combina con media ponderada). Se usan en control (frenos ABS, tracción, aire acondicionado). Críticas: aprenden poco, funcionan peor que un modelo matemático cuando lo hay y las reglas no se refuerzan entre sí. Si no hay experto, las reglas se pueden sacar con algoritmos de inducción.

**Aplicaciones** que nombra la cátedra: lavarropas (inferir el mejor modo de lavado), autos inteligentes (frenos y dirección), robots que interactúan con el mundo real, diagnóstico médico, control de semáforos en ciudades inteligentes y administración de energías renovables.

**Sistemas neuro-difusos**: combinan la capacidad de las **redes neuronales para reconocer patrones** con la capacidad de la lógica difusa para **razonar como una persona**. Ganan dos cosas: patrones difusos y **explicabilidad** para lo que aprende la red.

**Incertidumbre e imprecisión**: incertidumbre es falta de seguridad o certeza; imprecisión es vaguedad o desconocimiento del valor exacto de una variable. Vienen del mundo real (complejo, no determinista, con excepciones) y de deficiencias en la información (incompleta, errónea, contradictoria).
