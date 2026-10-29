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
3. Se abre el navegador en `http://127.0.0.1:8765`. Dejá la ventana negra abierta mientras estudiás; para cerrar, cerrala o apretá Ctrl+C.

Necesitás **Python 3.8 o más nuevo**. Si no lo encuentra, instalalo desde [python.org](https://www.python.org/downloads/) (en Windows, tildá *Add python.exe to PATH*; en Mac también sirve `xcode-select --install`).

> No abras `app/index.html` con doble clic: el navegador bloquea la carga del contenido. Siempre entrá con el archivo `iniciar`.

## Qué tiene

| Sección | Para qué sirve |
|---|---|
| **Ruta de estudio** | 13 unidades en el orden recomendado, desde cómo es el parcial hasta IA en 2026. Cada una tiene teoría pensada para arrancar de cero, las trampas típicas marcadas en rojo y un chequeo de 5 preguntas (4 bien = unidad aprobada). |
| **Práctica** | Preguntas por unidad: reales de parciales, generadas por IA en base a las reales, o generadas por algoritmo (árboles de búsqueda, emparrillados, ruleta, métricas, lógica difusa: infinitas y corregidas por el motor). |
| **Parciales reales** | 28 parciales de 2020 a 2025 (684 preguntas), cada uno con su fecha y tema. Modo simulacro (corregís al final) o guiado (corrección inmediata). Queda registrado cuáles hiciste y con qué nota. |
| **Repaso** | Las preguntas que erraste vuelven con repetición espaciada (1, 3, 7 y 16 días). |
| **Ejercicios de la cátedra** | Las guías prácticas (Búsqueda, Emparrillado, Análisis de Protocolos), los ejercicios de clase y el recuperatorio, para resolver paso a paso y comprobar. |
| **Simuladores** | Búsqueda iteración por iteración sobre árboles de parciales reales o aleatorios, emparrillado completo con parrilla editable y tipificador de relaciones, y ruleta de algoritmos genéticos. |

## Tu progreso

Se guarda en `progreso.json`, en la misma carpeta, cada vez que respondés algo (y una copia diaria en `backups/`). Ese archivo **no se sube al repo**: cada uno tiene el suyo. Si actualizás con `git pull`, tu progreso queda intacto.

Desde **Ajustes** podés exportarlo, importarlo o reiniciarlo.

## De dónde sale el contenido

- **Preguntas reales:** transcriptas de los parciales resueltos. La respuesta correcta es la que marca la resolución.
- **Preguntas generadas por IA:** escritas imitando el estilo de las reales; cada una dice en qué preguntas reales se basa. Están marcadas como *IA*.
- **Ejercicios de la cátedra:** cada uno indica si la resolución es *oficial* (de la cátedra), *calculada* (por los motores de la app) o *propuesta* (escrita por IA siguiendo el formato oficial).
- **Motores de búsqueda y emparrillado:** siguen las convenciones de la cátedra y están validados contra 99 preguntas reales de búsqueda, 48 de emparrillado y todas las resoluciones oficiales de las guías (`node tests/test_*.mjs`).

Es material de estudio armado por alumnos, no oficial. Si encontrás un error, avisá.

## Para desarrolladores

Sin build ni dependencias: `servidor.py` (stdlib) sirve `app/` y guarda el progreso en `/api/progreso`. El frontend es JavaScript en módulos ES; el contenido está en `contenido/` (JSON + Markdown).
