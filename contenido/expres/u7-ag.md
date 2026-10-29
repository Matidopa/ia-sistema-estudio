## Lo que sí o sí tenés que saber

- Un AG es **optimización**: da **una buena solución**, no necesariamente la mejor. "Mejor combinación que maximice/minimice…" → AG.
- **Individuo/cromosoma** = una posible solución. La **estructura del cromosoma** es la representación: completa, coherente y consistente con la aptitud.
- La **función de aptitud** evalúa soluciones y guarda **el conocimiento** del problema; también es donde se **penaliza**.
- **Selección**: Torneo (de a pares), Ranking (pasan los mejores), Ruleta (proporcional a la aptitud), Control sobre Número Esperado (aptitud/promedio; enteros directos, decimales por ruleta).
- **Cruza** combina genes existentes; **mutación** hace aparecer valores que no habían aparecido.
- Hay azar: misma población inicial y mismos parámetros **no garantizan** la misma población final → se evalúan **varias corridas**.
- La población inicial puede ser **al azar o ad hoc**. Cantidad de individuos y de vueltas: solo **probando**.
- **Convergencia prematura** = todos iguales y aptitud plana temprano: mutación muy baja o ranking.

## Cómo te lo preguntan

- «El método X…»: Ruleta "puede o no" elegir al mejor; Ranking, Torneo y Número Esperado lo eligen siempre.
- «Mayor/menor riesgo de convergencia prematura»: Ranking mayor, Ruleta menor.
- Gráfico de aptitud por ciclo: si oscila sin llegar al objetivo → **no converge**, revisar la aptitud; si queda plano temprano debajo del objetivo → **prematura**, subir la mutación; si empeora sin otra pista → "cualquiera".
- «Qué tecnología usar»: mejor combinación → AG; encontrar reglas desde datos → Inducción; predecir un valor → Backpropagation.
- «Cruzar/mutar al mejor», «población final/inicial»: suele ser "todas las anteriores".

## Trampas típicas

> Trampa: "conocimiento" y "penalización" van en la función de aptitud; "representación y codificación" va en la estructura del cromosoma.

> Trampa: paro por aptitud puede no terminar nunca; paro por ciclos termina siempre, con o sin solución aceptable.

> Trampa: mutación muy alta no causa convergencia prematura: da diversidad pero pierde soluciones buenas. La baja es la que limita nuevas combinaciones.

> Trampa: la aptitud debe *reducir* el ruido, y los inválidos se penalizan por niveles (−10 por gen inválido), no con −9999 ni eliminándolos.

> Trampa: multipunto da siempre mezcla + complemento; con máscara doble puede pasar cualquier cosa (hijos iguales a los padres o entre sí).

## Fórmulas y convenciones

| Concepto | Regla |
|---|---|
| Ruleta | porción = aptitud / suma total |
| Número esperado | valor = aptitud / promedio; parte entera = copias directas; decimales → ruleta |
| Cruza simple | siempre 1 punto de corte |
| Multipunto / máscara complemento | hijo 2 = complemento del hijo 1 |
| Máscara doble | una máscara por hijo, se pueden repetir genes |
| Convergencia lenta | más puntos de corte o máscara doble |
| Aptitud deseable | usa el conocimiento, cambio chico → valoración chica, robusta al ruido, penaliza por niveles |
