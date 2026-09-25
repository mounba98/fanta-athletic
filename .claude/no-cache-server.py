#!/usr/bin/env python3
"""Server statico locale per Fanta Athletic, senza cache del browser.

Il server standard di Python (python -m http.server) non manda header
anti-cache: il browser puo' quindi mostrare pagine/script/css vecchi
gia' visitati in questa sessione anche dopo una modifica sul disco.
Questo script aggiunge "Cache-Control: no-store" a ogni risposta, cosi'
il browser scarica sempre la versione attuale dei file. Solo per lo
sviluppo in locale, non riguarda il sito reale su GitHub/hosting.
"""
import http.server
import os
import re
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # Backup locale del database (D088): la pagina manda un JSON e il server lo
    # salva in backups-firestore/. Solo richieste dal computer stesso.
    def do_POST(self):
        if not self.path.startswith("/__backup__/") or self.client_address[0] not in ("127.0.0.1", "::1"):
            self.send_error(403)
            return
        name = re.sub(r"[^A-Za-z0-9._-]", "_", self.path[len("/__backup__/"):])[:120] or "backup.json"
        length = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(length)
        folder = os.path.join(os.getcwd(), "backups-firestore")
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, name), "wb") as f:
            f.write(data)
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(("salvato %d byte" % len(data)).encode())


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
    http.server.test(HandlerClass=NoCacheHandler, port=port)
