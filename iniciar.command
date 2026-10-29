#!/usr/bin/env bash
# Mac: doble clic en este archivo para abrir la app (se abre una ventana de Terminal).
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
  python3 servidor.py "$@"
  codigo=$?
  # Si se cerró bien (botón «Cerrar la app»), no hace falta tocar nada más: podés cerrar esta ventana.
  if [ "$codigo" -eq 0 ]; then exit 0; fi
  echo
  echo "Algo falló al abrir la app (mirá el mensaje de arriba). Tu progreso guardado no se pierde."
else
  echo
  echo "No encontré Python 3."
  echo "Instalalo desde https://www.python.org/downloads/ (o con: xcode-select --install) y volvé a abrir este archivo."
fi
echo
read -n 1 -s -r -p "Apretá cualquier tecla para cerrar..."
