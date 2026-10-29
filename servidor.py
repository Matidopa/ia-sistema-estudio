#!/usr/bin/env python3
"""
Sistema de estudio — Inteligencia Artificial (UTN FRBA)
Servidor local mínimo: sirve la app y guarda tu progreso en progreso.json.

Uso:  python servidor.py            (abre el navegador solo)
      python servidor.py --puerto 9000 --sin-navegador

Solo usa la librería estándar de Python (3.8 o más nuevo). No sube nada a internet:
escucha únicamente en 127.0.0.1 (tu propia compu).
"""
import argparse
import datetime
import http.server
import json
import os
import shutil
import socket
import sys
import threading
import webbrowser

RAIZ = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = os.path.join(RAIZ, "progreso.json")
BACKUPS = os.path.join(RAIZ, "backups")
VACIO = {"version": 1, "creado": None, "preguntas": {}, "examenes": {}, "unidades": {}, "catedra": {}, "ajustes": {}}
_lock = threading.Lock()


def leer_progreso():
    if not os.path.exists(ARCHIVO):
        d = dict(VACIO)
        d["creado"] = datetime.datetime.now().isoformat(timespec="seconds")
        return d
    with open(ARCHIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def guardar_progreso(datos):
    with _lock:
        # backup diario (uno por día, se pisan dentro del mismo día)
        if os.path.exists(ARCHIVO):
            os.makedirs(BACKUPS, exist_ok=True)
            hoy = datetime.date.today().isoformat()
            shutil.copy2(ARCHIVO, os.path.join(BACKUPS, f"progreso-{hoy}.json"))
        tmp = ARCHIVO + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(datos, f, ensure_ascii=False, indent=1)
        os.replace(tmp, ARCHIVO)  # escritura atómica: nunca queda un archivo a medio escribir


class Manejador(http.server.SimpleHTTPRequestHandler):
    # Tipos fijos: en Windows Python lee los tipos del registro y a veces sirve .js como
    # text/plain, y el navegador se niega a ejecutar los módulos (la app queda "Cargando…").
    extensions_map = {
        "": "application/octet-stream",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".md": "text/markdown; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".woff2": "font/woff2",
        ".woff": "font/woff",
        ".ttf": "font/ttf",
        ".ico": "image/x-icon",
    }

    def guess_type(self, path):
        ext = os.path.splitext(str(path))[1].lower()
        return self.extensions_map.get(ext, "application/octet-stream")

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=RAIZ, **kw)

    def log_message(self, fmt, *args):  # consola limpia: no se loguea cada pedido
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, codigo, obj):
        cuerpo = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def do_GET(self):
        if self.path.startswith("/api/progreso"):
            try:
                return self._json(200, leer_progreso())
            except Exception as e:  # archivo corrupto: no lo pisamos, avisamos
                return self._json(500, {"error": f"No pude leer progreso.json: {e}"})
        if self.path.startswith("/api/estado"):
            return self._json(200, {"ok": True, "archivo": ARCHIVO})
        if self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/app/index.html")
            self.end_headers()
            return
        return super().do_GET()

    def do_PUT(self):
        if not self.path.startswith("/api/progreso"):
            return self._json(404, {"error": "no existe"})
        try:
            largo = int(self.headers.get("Content-Length", 0))
            datos = json.loads(self.rfile.read(largo).decode("utf-8"))
            if not isinstance(datos, dict) or "preguntas" not in datos:
                return self._json(400, {"error": "formato inválido"})
            guardar_progreso(datos)
            return self._json(200, {"ok": True})
        except Exception as e:
            return self._json(500, {"error": str(e)})

    do_POST = do_PUT


def puerto_libre(preferido):
    for p in [preferido] + list(range(preferido + 1, preferido + 20)):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    raise SystemExit("No encontré un puerto libre.")


def main():
    if sys.version_info < (3, 8):
        raise SystemExit("Necesitás Python 3.8 o más nuevo.")
    ap = argparse.ArgumentParser()
    ap.add_argument("--puerto", type=int, default=8765)
    ap.add_argument("--sin-navegador", action="store_true")
    a = ap.parse_args()
    puerto = puerto_libre(a.puerto)
    url = f"http://127.0.0.1:{puerto}/app/index.html"
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", puerto), Manejador)
    print("=" * 60)
    print("  Sistema de estudio — Inteligencia Artificial")
    print(f"  Abrí: {url}")
    print(f"  Tu progreso se guarda en: {ARCHIVO}")
    print("  Para cerrar: Ctrl+C (o cerrá esta ventana)")
    print("=" * 60)
    if not a.sin_navegador:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nListo, cerrado. Tu progreso quedó guardado.")


if __name__ == "__main__":
    main()
