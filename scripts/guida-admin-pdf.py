#!/usr/bin/env python3
"""Rigenera il PDF della guida admin da guida-admin.html (D115).

La pagina dell'app è la FONTE; il PDF da mandare agli admin resta FUORI dal
progetto (~/Claude/fanta-athletic-backups/03-documenti-admin/). Usa Chrome
"invisibile" (headless) su un file locale: nessuna connessione, nessun login.
Uso:  python3 scripts/guida-admin-pdf.py
"""
import os, re, subprocess, tempfile, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = pathlib.Path.home() / 'Claude/fanta-athletic-backups/03-documenti-admin'
OUT = OUT_DIR / 'Guida-admin-Fanta-Athletic-2026-27.pdf'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

page = (ROOT / 'guida-admin.html').read_text(encoding='utf-8')
css = re.search(r'<style>(.*?)</style>', page, re.S).group(1)
body = re.search(r'<!-- GUIDA:INIZIO -->(.*?)<!-- GUIDA:FINE -->', page, re.S).group(1)
html = f'''<!DOCTYPE html><html lang="it"><head><meta charset="utf-8">
<title>Fanta Athletic — Guida per gli admin</title>
<style>:root{{--text:#1f2330;--muted:#5b6275}}
body{{margin:0;font-family:-apple-system,"Helvetica Neue",Helvetica,Arial,sans-serif}}
*{{box-sizing:border-box}}{css}</style></head>
<body><article class="guide">{body}</article></body></html>'''
html = html.replace('<button type="button" class="g-print" onclick="window.print()">Salva come PDF / stampa</button>', '')

with tempfile.TemporaryDirectory() as tmp:
    src = pathlib.Path(tmp) / 'guida.html'
    src.write_text(html, encoding='utf-8')
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                        f'--user-data-dir={tmp}/prof', f'--print-to-pdf={OUT}', src.as_uri()],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
    except subprocess.TimeoutExpired:
        pass  # Chrome a volte non si chiude da solo dopo aver scritto il PDF
print('PDF:', OUT, OUT.stat().st_size if OUT.exists() else 'NON CREATO')
