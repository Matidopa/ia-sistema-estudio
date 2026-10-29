#!/usr/bin/env python3
"""
Sistema de estudio — Inteligencia Artificial (UTN FRBA)
Servidor local mínimo: sirve la app y guarda el progreso de cada persona en la carpeta progreso/.

Uso:  python servidor.py            (abre el navegador solo)
      python servidor.py --puerto 9000 --sin-navegador

Solo usa la librería estándar de Python (3.8 o más nuevo). No sube nada a internet:
escucha únicamente en 127.0.0.1 (tu propia compu).

Cómo se guarda:
- Cada persona tiene su archivo progreso/<id>.json (el id sale del nombre que carga en la página).
- Cada guardado se escribe al disco en el momento (archivo temporal + fsync + reemplazo atómico)
  y recién después el servidor responde OK. Si después se corta la luz o se cierra la ventana,
  lo guardado queda guardado.
- El progreso.json de versiones anteriores NO se toca: se copia al primer usuario que se crea.
"""
import argparse
import datetime
import http.server
import json
import os
import re
import shutil
import socket
import sys
import threading
import unicodedata
import urllib.parse
import webbrowser

RAIZ = os.path.dirname(os.path.abspath(__file__))
CARPETA = os.path.join(RAIZ, "progreso")
LEGADO = os.path.join(RAIZ, "progreso.json")  # formato viejo (un solo usuario)
MARCA_MIGRADO = os.path.join(CARPETA, ".legado-migrado")
BACKUPS = os.path.join(RAIZ, "backups")
_lock = threading.Lock()
_servidor = None
_cerrado_por_app = False


def ahora():
    return datetime.datetime.now().isoformat(timespec="seconds")


def vacio():
    return {"version": 2, "creado": ahora(), "preguntas": {}, "examenes": {}, "unidades": {},
            "catedra": {}, "ajustes": {}}


def slug(nombre):
    s = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode("ascii").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:40] or "usuario"


ID_VALIDO = re.compile(r"^[a-z0-9][a-z0-9-]{0,59}$")


def ruta_usuario(uid):
    if not ID_VALIDO.match(uid or ""):
        raise ValueError("usuario inválido")
    return os.path.join(CARPETA, uid + ".json")


def escribir_atomico(ruta, datos):
    """Escribe el JSON de forma que nunca quede a medio escribir y queda en disco antes de volver."""
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    tmp = ruta + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, ruta)
    if hasattr(os, "O_DIRECTORY"):  # en Linux/Mac, asegurar también la entrada del directorio
        try:
            fd = os.open(os.path.dirname(ruta), os.O_DIRECTORY)
            try:
                os.fsync(fd)
            finally:
                os.close(fd)
        except OSError:
            pass


def leer_json(ruta):
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)


def legado_pendiente():
    return os.path.exists(LEGADO) and not os.path.exists(MARCA_MIGRADO)


def listar_usuarios():
    res = []
    if os.path.isdir(CARPETA):
        for n in sorted(os.listdir(CARPETA)):
            if not n.endswith(".json") or n.startswith("."):
                continue
            uid = n[:-5]
            if not ID_VALIDO.match(uid):
                continue
            try:
                d = leer_json(os.path.join(CARPETA, n))
                u = d.get("usuario") or {}
                res.append({"id": uid, "nombre": u.get("nombre") or uid,
                            "actualizado": d.get("actualizado"), "modo": d.get("modo")})
            except Exception:
                res.append({"id": uid, "nombre": uid, "actualizado": None, "error": True})
    return res


def crear_usuario(nombre):
    nombre = " ".join(str(nombre or "").split())[:40]
    if not nombre:
        raise ValueError("Escribí un nombre.")
    with _lock:
        existentes = {u["id"]: u for u in listar_usuarios()}
        for u in existentes.values():  # mismo nombre (sin importar mayúsculas): es la misma persona
            if u["nombre"].lower() == nombre.lower():
                return u, False
        base = slug(nombre)
        uid, i = base, 2
        while uid in existentes:
            uid, i = f"{base}-{i}", i + 1
        migrado = False
        datos = vacio()
        if legado_pendiente():
            try:
                viejo = leer_json(LEGADO)
                if isinstance(viejo, dict) and "preguntas" in viejo:
                    datos = viejo
                    datos["migradoDe"] = "progreso.json"
                    migrado = True
            except Exception:
                pass  # si el viejo está roto, se arranca de cero y el archivo queda intacto
        for k in ("preguntas", "examenes", "unidades", "catedra", "ajustes"):
            datos.setdefault(k, {})
        datos["version"] = 2
        datos["usuario"] = {"nombre": nombre, "id": uid}
        datos["actualizado"] = ahora()
        escribir_atomico(ruta_usuario(uid), datos)
        if migrado or legado_pendiente():
            escribir_atomico(MARCA_MIGRADO, {"usuario": uid, "fecha": ahora()})
        return {"id": uid, "nombre": nombre, "migrado": migrado}, True


def guardar_usuario(uid, datos):
    ruta = ruta_usuario(uid)
    with _lock:
        if os.path.exists(ruta):
            os.makedirs(BACKUPS, exist_ok=True)  # una copia por día y por persona
            hoy = datetime.date.today().isoformat()
            shutil.copy2(ruta, os.path.join(BACKUPS, f"{uid}-{hoy}.json"))
        datos["usuario"] = {**(datos.get("usuario") or {}), "id": uid}
        escribir_atomico(ruta, datos)


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
        ".txt": "text/plain; charset=utf-8",
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

    def _consulta(self):
        partes = urllib.parse.urlsplit(self.path)
        return partes.path, dict(urllib.parse.parse_qsl(partes.query))

    def _origen_ok(self):
        # Solo se aceptan cambios desde la propia app (evita que otra página web toque tu progreso).
        if self.client_address[0] not in ("127.0.0.1", "::1"):
            return False
        origen = self.headers.get("Origin")
        if not origen or origen == "null":
            return True
        host = urllib.parse.urlsplit(origen).hostname
        return host in ("127.0.0.1", "localhost")

    def _cuerpo_json(self):
        largo = int(self.headers.get("Content-Length", 0) or 0)
        return json.loads(self.rfile.read(largo).decode("utf-8")) if largo else {}

    def do_GET(self):
        ruta, q = self._consulta()
        if ruta == "/api/usuarios":
            return self._json(200, {"usuarios": listar_usuarios(), "legado": legado_pendiente()})
        if ruta == "/api/progreso":
            uid = q.get("u")
            try:
                if not uid:  # compatibilidad con la versión vieja de la app
                    return self._json(200, leer_json(LEGADO) if os.path.exists(LEGADO) else vacio())
                r = ruta_usuario(uid)
                if not os.path.exists(r):
                    return self._json(404, {"error": "No existe ese usuario."})
                return self._json(200, leer_json(r))
            except Exception as e:  # archivo corrupto: no lo pisamos, avisamos
                return self._json(500, {"error": f"No pude leer el progreso: {e}"})
        if ruta == "/api/estado":
            return self._json(200, {"ok": True, "carpeta": CARPETA})
        if ruta == "/":
            self.send_response(302)
            self.send_header("Location", "/app/index.html")
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        ruta, q = self._consulta()
        if not self._origen_ok():
            return self._json(403, {"error": "Solo se acepta desde la app en esta compu."})
        try:
            if ruta == "/api/progreso":
                datos = self._cuerpo_json()
                if not isinstance(datos, dict) or "preguntas" not in datos:
                    return self._json(400, {"error": "formato inválido"})
                uid = q.get("u") or (datos.get("usuario") or {}).get("id")
                if not uid:
                    return self._json(400, {"error": "falta el usuario"})
                guardar_usuario(uid, datos)
                return self._json(200, {"ok": True, "guardado": ahora()})
            if ruta == "/api/usuarios":
                cuerpo = self._cuerpo_json()
                u, nuevo = crear_usuario(cuerpo.get("nombre"))
                return self._json(200, {"ok": True, "usuario": u, "nuevo": nuevo})
            if ruta == "/api/cerrar":
                self._json(200, {"ok": True})
                global _cerrado_por_app
                _cerrado_por_app = True
                threading.Thread(target=_servidor.shutdown, daemon=True).start()
                return
            return self._json(404, {"error": "no existe"})
        except ValueError as e:
            return self._json(400, {"error": str(e)})
        except Exception as e:
            return self._json(500, {"error": str(e)})

    do_PUT = do_POST


def puerto_libre(preferido):
    for p in [preferido] + list(range(preferido + 1, preferido + 20)):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if os.name != "nt":  # igual que el servidor: permite reusar el puerto recién liberado
                s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    raise SystemExit("No encontré un puerto libre.")


def main():
    global _servidor
    if sys.version_info < (3, 8):
        raise SystemExit("Necesitás Python 3.8 o más nuevo.")
    ap = argparse.ArgumentParser()
    ap.add_argument("--puerto", type=int, default=8765)
    ap.add_argument("--sin-navegador", action="store_true")
    a = ap.parse_args()
    puerto = puerto_libre(a.puerto)
    url = f"http://127.0.0.1:{puerto}/app/index.html"
    _servidor = http.server.ThreadingHTTPServer(("127.0.0.1", puerto), Manejador)
    print("=" * 66)
    print("  Sistema de estudio — Inteligencia Artificial")
    print(f"  Abrí: {url}")
    print()
    print("  Tu progreso se guarda solo. Para salir, usá el botón")
    print("  «Cerrar la app» o cerrá esta ventana con la X.")
    print("=" * 66)
    if not a.sin_navegador:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        _servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nListo, cerrado. Todo lo que guardaste quedó guardado.")
        print("(Si Windows pregunta «¿Desea terminar el trabajo por lotes (S/N)?», no tiene nada")
        print(" que ver con tu progreso: ya está guardado. Podés responder S.)")
        return 0
    if _cerrado_por_app:
        print("\nListo, cerraste la app desde la página. Tu progreso está guardado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
