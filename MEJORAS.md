# Qué cambió en la app

Resumen para leer con el café. Para tenerlo en tu compu alcanza con `git pull` en la carpeta del sistema (o volver a bajar el repo). Tu `progreso.json` no se toca: la primera vez que abras la app te pide tu nombre y se pasa solo a ese nombre.

## Lo que pediste

**Guardado simple y visible, todo en la página**
- La primera vez la app te pide el nombre. Cada persona tiene su archivo en `progreso/`, así pueden usar la misma copia varios sin pisarse. Se cambia de usuario desde el lateral o Ajustes.
- Botón **Guardar progreso** siempre a la vista (abajo del lateral; en el celu, arriba). Confirma con «Guardado a las 22:15» recién cuando el servidor escribió el archivo. Si falla, lo dice y reintenta solo.
- Estado siempre visible: «Todo guardado · 22:15» o «Cambios sin guardar».
- Igual se guarda solo a los 0,7 segundos de cada respuesta. Si cerrás la pestaña con algo pendiente, se manda igual y el navegador te avisa.
- El servidor escribe con `fsync` y reemplazo atómico antes de responder. Lo probé respondiendo, guardando y matando el servidor de golpe (como cerrar la ventana con la X): no se perdió nada. Lo mismo sin apretar Guardar, solo con el automático.
- Botón **Cerrar la app**: guarda, apaga el servidor y te dice «Listo, ya podés cerrar esta pestaña». Es opcional: cerrar la ventana con la X también está bien.
- `iniciar.bat` explica cómo salir y la ventana se cierra sola cuando cerrás la app desde la página. Si alguna vez aparece «¿Desea terminar el trabajo por lotes (S/N)?», no tiene nada que ver con tu progreso: ya está guardado.

**Dos modos de estudio** (se elige al entrar y se cambia desde Inicio o Ajustes)
- **Completo:** la ruta de 13 unidades en orden, como antes.
- **Exprés:** 13 pasos armados con la frecuencia real de cada tema en los 28 parciales:
  - Las tres técnicas (≈15 de 25 preguntas), cada una con su ficha «lo que sí o sí tenés que saber» (trampas, convenciones, cómo te lo preguntan) y 8 preguntas reales recientes.
  - Un mini simulacro de técnicas con los anexos de un parcial real.
  - La teoría que más se repite: una pregunta de cada tipo, del más repetido al menos.
  - Repaso y un simulacro final de 25.
  - Tiempo estimado total (≈4 h 48 min) y de cada paso.
- El progreso es uno solo: lo que aprobás en exprés cuenta en el completo. Al terminar el exprés ves qué te queda del camino completo (unidades, teoría completa sin leer, ejercicios de la cátedra y preguntas que nunca hiciste) y seguís desde ahí sin repetir.

## Otras mejoras (de mayor a menor impacto)

- **Explicaciones para 512 preguntas reales** que antes solo decían «la correcta es la 3»: Protocolos, Lógica, RNA, AG, Sistemas, Implementación, PLN y las relaciones de Emparrillado. Cada una incluye «por qué no las otras». Están escritas con IA en base al material de la cátedra y lo dicen debajo. Búsqueda y Emparrillado siguen con la resolución del motor; la de emparrillado ahora muestra las distancias usadas y la regla para contar grupos.
- **Simulacro de parcial** nuevo:
  - 25 preguntas mezcladas con la distribución real por tema (técnicas en bloque con su anexo).
  - Cronómetro, índice de preguntas y «marcar para revisar».
  - Anexo fijo al costado en pantalla grande; en el celu, un botón lo abre a pantalla completa con zoom.
  - Resultado arriba, por tema y con link para practicar. Botón «Rehacer las erradas».
  - Los parciales reales usan el mismo formato y ya no muestran «la última vez bien/mal» mientras rendís.
- **Atajos de teclado:** 1–4 responde y Enter sigue.
- **Práctica por tipo de pregunta:** por ejemplo «La relación establecida entre…» (salió 64 veces) o «Son sinónimos…». Cada pregunta real muestra cuántas veces salió. El formulario se pliega cuando empezás.
- **Inicio «Qué hacer hoy»:** el próximo paso de tu modo con su tiempo, racha de días, meta diaria de 20 preguntas, nota estimada en un parcial y **mapa de dominio por tema** (ordenado por cuánto se toma; tocás un tema y practicás).
- **Tarjetas de memoria:** 146 tarjetas (definiciones, convenciones, trampas) con repaso espaciado y animación al darlas vuelta. Están escritas con IA.
- **Unidades:** índice lateral, barra de lectura, botón «Ir al chequeo». El chequeo prioriza lo que no acertaste y no repite el mismo tipo de pregunta.
- **Simulador de búsqueda:** botón «Reproducir» para ver el algoritmo animado. El resultado ya no aparece antes de llegar al final (antes era spoiler).
- **Celular:** menú desplegable (la navegación ya no ocupa media pantalla), botón de guardar arriba y tablas de iteraciones como tarjetas. No hay scroll horizontal en ninguna pantalla.
- **Modo oscuro** pulido: se ven las letras de los nodos del árbol y la etiqueta «Parcial real».
- **Arreglos:**
  - Preguntas de 2020 que mostraban el enunciado escaneado dos veces.
  - Enunciados cortados por saltos de línea del PDF.
  - «Ejercicios nuevos» de temas sin generador ahora avisa en vez de mostrar Búsqueda.
  - Las notas de protocolos ahora se guardan con tu progreso.
  - Un error en la teoría de Emparrillado: «no tiene relación directa» la cátedra la marca **ambigua**, no «sin flechas» (2025 Lunes T2 y Miércoles T2, pregunta d).

## Quedó pendiente

- Ejercicio de Análisis de Protocolos interactivo (marcar segmentos y que la app corrija). Hoy se practica con las 113 preguntas reales, filtrando por tipo de pregunta.
- Diagnóstico inicial que saltee pasos del exprés que ya dominás.
- Algunas preguntas parecen estar en una unidad que no es la suya; no las moví:
  - 2025-lunes-t2-q (está en Intro y es de aprendizaje supervisado).
  - 2023-2c-miercoles-t1-m y -t2-u (están en Conocimiento y son de elegir tecnología).
  - 2020-2c-t1-e, -t2-e y -t4-e (están en Lógica y son de Protocolos).
  - 2022-1c-lunes-t1-l (está en Lógica y es de Sistemas).
- `iniciar.bat` no lo pude probar en Windows (la nube es Linux). Si algo raro pasa al abrir o cerrar, avisame.
