Allineato a: D118

# Checklist di ogni aggiornamento — cosa deve seguire una modifica

**Regola dell'utente (D116)**: ogni modifica all'app si porta dietro, **senza che
l'utente debba chiederlo**, l'aggiornamento di tutto ciò che la racconta o ne dipende.
Niente deve restare indietro. Il collegamento è esplicito in due modi:
1. questa tabella, da ripassare a ogni modifica;
2. `python3 scripts/check-coerenza.py`, da lanciare **prima di ogni commit**: se segnala
   PROBLEMI non si committa finché non sono risolti (gli AVVISI si leggono e si valutano).

## Se cambi… → aggiorna anche…

| Se la modifica… | …aggiorna anche | Controllato dallo script |
|---|---|---|
| **qualunque cosa** (è una decisione) | voce in `docs/DECISION_LOG.md` (subito); `Allineato a` di `CLAUDE.md`, `PUNTI_APERTI.md`, `FIREBASE_ALLINEAMENTO.md`, `GLOSSARIO_LEGHE.md`, `MAPPA_PAGINE.md` e di questo file dopo averli riletti | sì |
| cambia qualcosa che **vedono i giocatori** | una novità `audience: "all"` in `resources/news.json`, scritta per chi gioca (cosa cambia per te, dove si trova); compare in finestra all'apertura, nella casella in Home e in Bacheca › Novità app | sì: `allineato` di news.json = ultima decisione |
| cambia qualcosa che **usano gli admin** (pannello, calcolo, stagione, live, regole) | una novità `audience: "admin"` in news.json **e** la guida `guida-admin.html` (testo + `meta guida-allineata`), poi il PDF con `python3 scripts/guida-admin-pdf.py` | sì: meta della guida, caselle del pannello citate, PDF più vecchio della pagina |
| aggiunge una **funzione nuova** visibile | etichetta `<span class="fa-new" data-new-until="AAAA-MM-GG">New</span>` sulla sua casella, con scadenza **2 settimane dalla pubblicazione** dell'aggiornamento | sì: "New" senza scadenza / scaduta |
| aggiunge, rinomina o archivia una **pagina** | `docs/MAPPA_PAGINE.md` (e il conteggio in cima); menu ☰ (`resources/mobile-menu.js`) se è per tutti; casella in `admin.html` + guida se è per admin; `admin-back.js` sulle pagine admin | sì: pagine mancanti nella mappa, caselle admin nella guida |
| modifica un **file condiviso** in `resources/` (.js/.css) | nuova etichetta `?v=` in **tutte** le pagine che lo usano (il service worker tiene i file etichettati) | sì: file cambiato senza etichetta nuova; etichette diverse tra pagine |
| tocca **Firebase** (regole, indici, struttura dati) | `firestore.rules` + `docs/FIREBASE_ALLINEAMENTO.md` prima; l'utente pubblica in Console | no: da ricordare |
| cambia **parole** (lega, stagione, competizione…) | `docs/GLOSSARIO_LEGHE.md` e la memoria di Claude | no: da ricordare |
| cambia qualcosa di **visivo** | prova su telefono e computer, tema chiaro e scuro; caselle con il bordo oro `var(--tile-border)` (`resources/ui-kit.css`) | no: da verificare a occhio |
| cambia i **backup** o i documenti fuori dal progetto | `~/Claude/fanta-athletic-backups/LEGGIMI.md` | no: da ricordare |
| aggiunge un **file nuovo** o ne sposta uno | mettilo nella cartella giusta secondo `README.md` › "Struttura della cartella"; copie "prima della modifica" in `archive/versioni-precedenti/` col numero di decisione nel nome; mai dati personali o backup dentro il progetto | sì: file fuori posto nella cartella principale, file richiamati che non esistono |
| va **online** | commit+push e pubblicazione sono due passi separati, ognuno su conferma dell'utente | — |

## Cose che non si scrivono nelle Novità
Correzioni puramente interne (documenti, script, pulizie di codice senza effetti visibili):
basta alzare `allineato` in news.json dopo aver verificato che non c'è nulla da dire.
