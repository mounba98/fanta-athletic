# Fanta Athletic

Web app di fantacalcio/fantasport per una lega di amici, con pannello di
amministrazione per chi gestisce la lega. Sito statico (HTML + JavaScript,
nessun framework, nessun build tool) con backend Firebase (Firestore +
Auth).

**In produzione**, usata da utenti reali. Il codice "ufficiale" vive su una
repository GitHub gestita dallo sviluppatore originale del progetto.

## Come avviarla in locale

Non serve installare nulla: basta un piccolo server che serva i file così
come sono (il sito non funziona bene aperto direttamente da file, serve un
indirizzo `http://`).

```bash
python3 .claude/no-cache-server.py 8912
```

Poi apri `http://localhost:8912/index.html` nel browser. È un server
semplice che impedisce al browser di usare versioni vecchie dei file (D042)
e sa ricevere i backup del database, che salva direttamente fuori dal progetto
in `~/Claude/fanta-athletic-backups/02-database/` (D088, D118).

**Attenzione:** anche in locale il sito si collega al database Firebase
reale (di produzione), non a una copia di prova — vedi
`docs/DECISION_LOG.md` per i dettagli. Va bene navigare senza fare login;
prima di accedere con un account e usare funzioni che salvano dati, va
valutato caso per caso.

## Struttura della cartella (riordinata il 26/09/2026, D118)

**Cartella principale** — solo ciò che il sito o gli strumenti richiedono lì:
- file `.html` — le pagine dell'app (utente e admin). Restano tutte qui perché
  l'app non ha un "navigatore interno": i collegamenti tra pagine assumono che
  siano nella cartella principale (vedi `docs/MAPPA_PAGINE.md` per cosa fa ognuna);
- `sw.js`, `manifest.json`, `favicon.ico` — service worker, dati dell'app
  installabile, icona (devono stare nella cartella principale);
- `firebase.json`, `.firebaserc` — configurazione della pubblicazione
  (Firebase Hosting: cosa si pubblica e cosa no);
- `firestore.rules` — regole di sicurezza del database: questa è la fonte,
  si incollano in Console Firebase (vedi `docs/FIREBASE_ALLINEAMENTO.md`);
- `README.md` (questo file) e `CLAUDE.md` (contesto per lavorare con Claude).

**Cartelle:**
- `resources/` — script, stili, icone e dati condivisi tra le pagine
  (`app-icons/`, `icons/`, `catalog/`).
- `data/` — dati statici dei giochi (configurazioni sport, carte).
- `assets/` — immagine segnaposto dei giocatori.
- `scripts/` — strumenti che **non** vanno online: controllo di coerenza
  (`check-coerenza.py`), PDF della guida admin (`guida-admin-pdf.py`),
  backup cloud di Mocci (`backup-firestore.sh/.bat`), migrazione catalogo
  (`catalog-migration/`, Node + Admin SDK).
- `docs/` — documentazione: diario delle decisioni (`DECISION_LOG.md`),
  cosa resta da fare (`PUNTI_APERTI.md`), checklist di ogni aggiornamento
  (`CHECKLIST_AGGIORNAMENTO.md`), mappa delle pagine, glossario, allineamento
  Firebase; `firebase-storico/` (configurazioni e regole vecchie, solo
  riferimento); `storico-originali/` (documenti di progettazione dello
  sviluppatore originale, contesto storico); `catalogo/`.
- `archive/` — file tenuti per riferimento ma non più usati dall'app:
  `versioni-precedenti/` (copie prima di una modifica grossa, col numero di
  decisione nel nome), `resources-orfani/` (script e dati non più caricati),
  pagine abbandonate/obsolete, vecchi strumenti admin, fix/debug, test.
  Dettagli in `archive/LEGGIMI.md`.

**Fuori dal progetto** (mai su Git né online): i backup del database (contengono
email) e la guida PDF per gli admin, in `~/Claude/fanta-athletic-backups/`
(indice in `LEGGIMI.md` lì).

> `fanta-athletic-code-BACKUP-*/`, se presente, è una copia di sicurezza
> temporanea creata durante una sessione di revisione — non fa parte del
> progetto, va rimossa prima di un commit (già esclusa via `.gitignore`).

## Per lavorare su questo progetto con Claude

Vedi [`CLAUDE.md`](CLAUDE.md): contesto, stato reale del progetto, criticità
note, regole di lavoro specifiche.
