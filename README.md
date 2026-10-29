# Sistema de estudio · Inteligencia Artificial (UTN FRBA)

Una app local para preparar Inteligencia Artificial desde cero: teoría ordenada como ruta de estudio, todos los parciales reales que conseguimos, preguntas de práctica nuevas, los ejercicios de la cátedra con resolución interactiva y simuladores de los temas prácticos.

Funciona en tu compu, sin internet y sin instalar nada aparte de Python.

## Cómo usarla

1. Cloná el repo (o bajalo como ZIP desde el botón verde **Code → Download ZIP** y descomprimilo):
   ```
   git clone https://github.com/Matidopa/ia-sistema-estudio.git
   ```
2. Abrí la app:
   - **Windows:** doble clic en `iniciar.bat`.
   - **Mac:** doble clic en `iniciar.command`. La primera vez, si macOS dice que no puede abrirlo, hacé clic derecho → **Abrir** → **Abrir**.
   - **Linux:** `./iniciar.sh` (o `python3 servidor.py`).
3. Se abre el navegador en `http://127.0.0.1:8765`. La primera vez te pide tu nombre y cómo querés estudiar. Dejá la ventana negra abierta mientras estudiás; para salir usá el botón **Cerrar la app** o cerrá la ventana con la X.

Necesitás **Python 3.8 o más nuevo**. Si no lo encuentra, instalalo desde [python.org](https://www.python.org/downloads/) (en Windows, tildá *Add python.exe to PATH*; en Mac también sirve `xcode-select --install`).

> No abras `app/index.html` con doble clic: el navegador bloquea la carga del contenido. Siempre entrá con el archivo `iniciar`.

## Tu progreso

Se guarda solo cada vez que respondés algo, y además tenés el botón **Guardar progreso**, que confirma la hora: lo que figura como guardado ya está escrito en el disco, aunque después cierres la pestaña, la ventana negra o apagues la compu.
Cada persona carga su nombre la primera vez y tiene su propio archivo en `progreso/` (pueden usar la misma copia varios sin pisarse); un `progreso.json` de la versión anterior se pasa solo al primer nombre que cargues.

La carpeta `progreso/` no se sube al repo: con `git pull` tu progreso queda igual. Desde **Ajustes** podés cambiar de usuario, exportar, importar o reiniciar.

## Dos modos de estudio

Al entrar elegís cómo estudiar (y lo cambiás cuando quieras desde Inicio o Ajustes):

- **Modo completo (con tiempo):** las 13 unidades en orden, con toda la teoría, chequeo de cada unidad, ejercicios de la cátedra y práctica.
- **Modo exprés (jugado de tiempo):** un plan de 14 pasos armado con la frecuencia real de cada tema en los 28 parciales. Arranca con un diagnóstico opcional de 17 preguntas que saltea los temas que ya dominás. Después Emparrillado, Protocolos y Búsqueda (≈15 de las 25 preguntas), con una ficha de lo que sí o sí tenés que saber y práctica dirigida; después un mini simulacro de técnicas, la teoría que más se repite, repaso y un simulacro final de 25. Muestra el tiempo estimado total y de cada paso.

El progreso es uno solo: una unidad aprobada en exprés cuenta en el completo. Cuando terminás el exprés, la app te muestra qué te queda del camino completo y te deja seguir desde ahí sin repetir.

## Qué tiene

| Sección | Para qué sirve |
|---|---|
| **Inicio** | Qué hacer hoy según tu modo, racha, meta diaria, nota estimada y tu dominio por tema (ordenado por cuánto se toma). |
| **Plan exprés** / **Ruta completa** | Los dos modos. Cada unidad tiene teoría desde cero, las trampas típicas en rojo y un chequeo de 5 preguntas (4 bien = aprobada). |
| **Práctica** | Por tema y por **tipo de pregunta** (las familias que más se repiten, por ejemplo «La relación establecida entre…», que salió 64 veces). Reales, generadas por IA o generadas por algoritmo. Atajos: <kbd>1</kbd>–<kbd>4</kbd> para responder y <kbd>Enter</kbd> para seguir. |
| **Simulacro de parcial** | 25 preguntas reales mezcladas con la distribución real por tema, con cronómetro, índice, «marcar para revisar», anexo fijo al costado y resultado por tema. |
| **Parciales reales** | 28 parciales de 2020 a 2025 (684 preguntas), en simulacro o guiado. |
| **Repaso** | Las preguntas que erraste vuelven con repetición espaciada (1, 3, 7 y 16 días). |
| **Tarjetas de memoria** | 146 tarjetas con definiciones, convenciones y trampas, con repaso espaciado. |
| **Ejercicios de la cátedra** | Las guías prácticas (Búsqueda, Emparrillado, Análisis de Protocolos), los ejercicios de clase y el recuperatorio. En los protocolos marcás cada línea (concepto, característica, valor, relación, operador, sinónimo, metacomentario, incertidumbre) y la app corrige. |
| **Simuladores** | Búsqueda iteración por iteración (con reproducción automática), emparrillado con parrilla editable y ruleta de algoritmos genéticos. |

## De dónde sale el contenido

- **Preguntas reales:** transcriptas de los parciales resueltos. La respuesta correcta es la que marca la resolución.
- **Explicaciones de las preguntas reales:** las de Búsqueda y Emparrillado las arma el motor paso a paso; las demás (Protocolos, Lógica, RNA, AG, Sistemas, Implementación, PLN y las relaciones de Emparrillado) están escritas con IA en base al material de la cátedra y lo dicen debajo. Las fichas del modo exprés y las tarjetas de memoria también están escritas con IA.
- **Preguntas generadas por IA:** escritas imitando el estilo de las reales; cada una dice en qué preguntas reales se basa. Están marcadas como *IA*.
- **Ejercicios de la cátedra:** cada uno indica si la resolución es *oficial* (de la cátedra), *calculada* (por los motores de la app) o *propuesta* (escrita por IA siguiendo el formato oficial).
- **Motores de búsqueda y emparrillado:** siguen las convenciones de la cátedra y están validados contra 99 preguntas reales de búsqueda, 48 de emparrillado y todas las resoluciones oficiales de las guías (`node tests/test_*.mjs`).

Es material de estudio armado por alumnos, no oficial. Si encontrás un error, avisá.

## Para desarrolladores

Sin build ni dependencias: `servidor.py` (stdlib) sirve `app/` y guarda el progreso de cada persona en `progreso/<id>.json` (`/api/usuarios`, `/api/progreso?u=<id>`, `/api/cerrar`), con escritura atómica y `fsync` antes de responder. El frontend es JavaScript en módulos ES; el contenido está en `contenido/` (JSON + Markdown).
