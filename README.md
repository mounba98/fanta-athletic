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
e sa ricevere i backup del database in `backups-firestore/` (D088).

**Attenzione:** anche in locale il sito si collega al database Firebase
reale (di produzione), non a una copia di prova — vedi
`docs/DECISION_LOG.md` per i dettagli. Va bene navigare senza fare login;
prima di accedere con un account e usare funzioni che salvano dati, va
valutato caso per caso.

## Struttura della cartella

- File `.html` nella root — le pagine dell'app (utente e admin).
- `resources/` — script e stili condivisi tra le pagine.
- `data/` — dati statici (configurazioni sport, carte, cataloghi).
- `scripts/` — script di migrazione lato server (Node, Admin SDK).
- `archive/` — pagine vecchie/abbandonate, tenute per riferimento storico
  ma non più raggiungibili dall'app (vedi `docs/DECISION_LOG.md` per come e
  perché sono state spostate qui).
- `firestore.rules` — regole di sicurezza del database: questa è la fonte,
  si incollano in Console Firebase (vedi `docs/FIREBASE_ALLINEAMENTO.md`).
- `backups-firestore/` — backup completi del database (contengono email:
  mai pubblicarli, esclusi da Git). Seconda copia in
  `~/Claude/fanta-athletic-backups/02-database/` (indice di tutti i backup in `~/Claude/fanta-athletic-backups/LEGGIMI.md`).
- `docs/` — documentazione del progetto: lo storico delle decisioni
  (`DECISION_LOG.md`), una checklist di cosa resta da fare (`PUNTI_APERTI.md`),
  una mappa di cosa fa ogni pagina (`MAPPA_PAGINE.md`) e i documenti di
  progettazione originali dello sviluppatore.

> `fanta-athletic-code-BACKUP-*/`, se presente, è una copia di sicurezza
> temporanea creata durante una sessione di revisione — non fa parte del
> progetto, va rimossa prima di un commit (già esclusa via `.gitignore`).

## Per lavorare su questo progetto con Claude

Vedi [`CLAUDE.md`](CLAUDE.md): contesto, stato reale del progetto, criticità
note, regole di lavoro specifiche.
