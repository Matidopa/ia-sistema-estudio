## Lo que sí o sí tenés que saber

- La IA usa lógica para **representar conocimiento** y para **hacer deducciones** (Motor de Inferencias).
- **Primer orden** representa más que la proposicional: suma **funciones de verdad** (características de las entidades), relaciones y **cuantificadores** (si la variable es uno o muchos).
- Traducción: con **∀** («Los…») hay **una sola →**; con **∃** («Algunos…») todo va con **∧**.
- Deducción natural: se usan **todas las hipótesis**.
- Tesis **con →**: se **supone el antecedente** y se cierra con **II**. Tesis sin →: **no se supone nada** (salvo en una eliminación de la disyunción).
- **Una hipótesis ∃** ⇒ tesis ∃. **Todas ∀** ⇒ tesis ∀ o ∃. **Tesis ∀** ⇒ todas ∀.
- **Lógica difusa**: razonamiento con datos imprecisos o incompletos; la **función de pertenencia** μ ∈ [0, 1] es el grado en que un elemento se ajusta a una definición, **no una probabilidad**.
- **Y = mínimo**, **O = máximo**, NO = 1 − μ; la implicación **propaga** el grado del antecedente al consecuente.

## Cómo te lo preguntan

- «La única tesis válida es…»: descartá por cuantificador, encadená las hipótesis y fijate qué sale en **todos** los caminos de la disyunción. Elegí la que **usa todas** las hipótesis.
- «La hipótesis faltante es…»: une lo que ya obtenés con lo que le falta a la tesis. Tesis ∀ ⇒ faltante ∀; si ya hay una ∃, la faltante va con ∀.
- «La traducción en lenguaje lógico…»: contá las →, chequeá que estén todas las relaciones y que unan las variables correctas.
- Reglas sueltas: IC, ID, EC, Modus Ponens, numeración de líneas (**trazabilidad**).
- Difusa: «bastante» ⇒ 0,8 o 0,9; «poco» o «baja» ⇒ 0,2; qué operador va con Y u O.

## Trampas típicas

> Trampa: lo deducido en un camino de la eliminación de la disyunción sirve **solo en ese camino**; si sale en uno solo, no va en la tesis.

> Trampa: una opción deducible que **deja una hipótesis sin usar** es incorrecta.

> Trampa: un predicado que no está en ninguna hipótesis solo entra a la tesis con **∨** (ID), nunca con ∧.

> Trampa: en las traducciones la opción mala cambia una variable de lugar (F(x,w) en vez de F(z,w)), encadena varias → o pone → con «algunos».

> Trampa: μ = 0,8 no es «80 % de probabilidad», ni «VERDADERO», ni «39 °C».

## Fórmulas y convenciones

| Regla | Qué pide / qué da |
|---|---|
| IC | **Todos** los términos ya demostrados |
| ID | Alcanza con **al menos uno** |
| EC | Los términos que salen son verdaderos |
| Modus Ponens | De A → B y A, obtenés B |
| II | Suponés A, llegás a B, cerrás A → B |
| ED | Suponés cada término y llegás a lo mismo por todos los caminos |

| Difusa | Cálculo |
|---|---|
| (A ∧ B ∧ C) → D | μD = mínimo(μA, μB, μC) |
| (A ∨ B ∨ C) → D | μD = máximo(μA, μB, μC) |
| ¬A | 1 − μA |
