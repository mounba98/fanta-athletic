#!/usr/bin/env python3
"""Controllo di coerenza prima di ogni commit/pubblicazione (D116).

Collegamento esplicito tra una modifica e tutto ciò che deve seguirla: guida admin,
Novità, mappa pagine, documenti "Allineato a", etichette ?v=, etichette "New", PDF.
Regole complete in docs/CHECKLIST_AGGIORNAMENTO.md.

Uso:  python3 scripts/check-coerenza.py
Esce con codice 1 se c'è qualcosa da sistemare (PROBLEMI); gli AVVISI vanno letti
ma non bloccano. Non contatta la rete e non tocca il database.
"""
import json, re, sys, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
problems, warnings = [], []

def read(p):
    return (ROOT / p).read_text(encoding='utf-8')

# 1) Ultima decisione del diario
log = read('docs/DECISION_LOG.md')
last_d = max(int(n) for n in re.findall(r'^## D(\d+)', log, re.M))
LAST = f'D{last_d}'

# 2) Documenti che dichiarano "Allineato a"
for f in ['CLAUDE.md', 'docs/PUNTI_APERTI.md', 'docs/FIREBASE_ALLINEAMENTO.md',
          'docs/GLOSSARIO_LEGHE.md', 'docs/MAPPA_PAGINE.md', 'docs/CHECKLIST_AGGIORNAMENTO.md']:
    m = re.search(r'Allineato a:\s*(D\d+)', read(f))
    if not m:
        problems.append(f'{f}: manca la riga "Allineato a"')
    elif m.group(1) != LAST:
        problems.append(f'{f}: allineato a {m.group(1)}, ultima decisione {LAST} → rileggilo e aggiornalo')

# 3) Guida admin e Novità: devono dichiarare di aver considerato l'ultima decisione
guide = read('guida-admin.html')
m = re.search(r'<meta name="guida-allineata" content="(D\d+)"', guide)
if not m or m.group(1) != LAST:
    problems.append(f'guida-admin.html: guida-allineata = {m.group(1) if m else "assente"}, ultima decisione {LAST} '
                    '→ la modifica cambia qualcosa per gli admin? aggiorna la guida (e il PDF), poi alza il meta')
news = json.loads(read('resources/news.json'))
if news.get('allineato') != LAST:
    problems.append(f'resources/news.json: allineato = {news.get("allineato")}, ultima decisione {LAST} '
                    '→ la modifica cambia qualcosa per giocatori/admin? scrivi la novità, poi alza "allineato"')
ids = [n.get('id') for n in news.get('news', [])]
if len(ids) != len(set(ids)):
    problems.append('resources/news.json: id ripetuti')
for n in news.get('news', []):
    for k in ('id', 'date', 'audience', 'title', 'items'):
        if not n.get(k):
            problems.append(f'resources/news.json: novità {n.get("id")} senza "{k}"')
    if n.get('audience') not in ('all', 'admin'):
        problems.append(f'resources/news.json: {n.get("id")} audience deve essere all/admin')

# 4) Ogni casella del pannello admin (fuori dagli strumenti tecnici) è citata nella guida
admin = read('admin.html')
main_part = admin.split('<details class="tech">')[0]
guide_text = re.sub(r'<[^>]+>', ' ', guide)
guide_text = re.sub(r'&[a-z]+;', ' ', guide_text).lower()
for title in re.findall(r'<div class="t">([^<]+)</div>', main_part):
    words = title.strip().lower()
    if words not in guide_text:
        problems.append(f'guida-admin.html non cita la casella del pannello "{title.strip()}"')

# 5) Ogni pagina .html attiva è nella mappa
mappa = read('docs/MAPPA_PAGINE.md')
for p in sorted(ROOT.glob('*.html')):
    if f'`{p.name}`' not in mappa:
        problems.append(f'docs/MAPPA_PAGINE.md: manca {p.name}')

# 6) Etichette ?v=: lo stesso file condiviso deve avere la stessa etichetta ovunque
refs = {}
for p in ROOT.glob('*.html'):
    for f, v in re.findall(r'(resources/[\w./-]+\.(?:js|css))\?v=([\w-]+)', p.read_text(encoding='utf-8', errors='ignore')):
        refs.setdefault(f, {}).setdefault(v, []).append(p.name)
for f, vs in sorted(refs.items()):
    if len(vs) > 1:
        detail = '; '.join(f'{v}: {len(ps)} pagine' for v, ps in vs.items())
        warnings.append(f'{f} ha etichette ?v= diverse ({detail}) — va bene solo se voluto')

# 7) File condivisi modificati dopo l'ultimo commit senza cambiare etichetta
try:
    import subprocess
    changed = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.split()
    diff_html = subprocess.run(['git', 'diff', 'HEAD', '--', '*.html'], cwd=ROOT, capture_output=True, text=True).stdout
    for f in changed:
        if f.startswith('resources/') and f.endswith(('.js', '.css')) and f in refs:
            if not re.search(re.escape(f) + r'\?v=', '\n'.join(l for l in diff_html.splitlines() if l.startswith('+'))):
                problems.append(f'{f} è cambiato ma nessuna pagina ha una nuova etichetta ?v= → i telefoni userebbero la vecchia')
except Exception as e:
    warnings.append(f'controllo git non eseguito: {e}')

# 8) Etichette "New": devono avere una scadenza
for p in ROOT.glob('*.html'):
    t = p.read_text(encoding='utf-8', errors='ignore')
    for m in re.finditer(r'<span class="fa-new"([^>]*)>', t):
        if 'data-dyn' in m.group(1):
            continue  # creata dal codice (Novità non lette), non ha scadenza
        if 'data-new-until' not in m.group(1):
            problems.append(f'{p.name}: etichetta "New" senza data-new-until')
        else:
            d = re.search(r'data-new-until="([\d-]+)"', m.group(1)).group(1)
            if d > (datetime.date.today() + datetime.timedelta(days=21)).isoformat():
                warnings.append(f'{p.name}: etichetta "New" fino al {d}: la regola è 2 settimane dalla pubblicazione')
            if d < datetime.date.today().isoformat():
                warnings.append(f'{p.name}: etichetta "New" scaduta il {d}, si può togliere dal codice')

# 9) PDF della guida più vecchio della pagina
pdf = pathlib.Path.home() / 'Claude/fanta-athletic-backups/03-documenti-admin/Guida-admin-Fanta-Athletic-2026-27.pdf'
if pdf.exists() and pdf.stat().st_mtime < (ROOT / 'guida-admin.html').stat().st_mtime:
    warnings.append('PDF della guida più vecchio di guida-admin.html → python3 scripts/guida-admin-pdf.py')

print(f'Ultima decisione: {LAST}')
for w in warnings:
    print('AVVISO   ', w)
for p in problems:
    print('PROBLEMA ', p)
print('OK: tutto coerente.' if not problems else f'{len(problems)} problemi da sistemare prima di committare.')
sys.exit(1 if problems else 0)
