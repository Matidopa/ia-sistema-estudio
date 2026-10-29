#!/usr/bin/env bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null; then exec python3 servidor.py "$@"; else exec python servidor.py "$@"; fi
