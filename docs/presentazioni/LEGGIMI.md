# Presentazioni per i partecipanti

- `asta-2026-27.html` — presentazione dell'asta di ottobre 2026 per i giocatori (D119):
  12 slide 16:9 con novità di gioco e dell'app. Tutti i dati sono verificati sull'app
  e sul diario: **se cambia una regola o una funzione citata, aggiornare anche questa**
  (vedi `docs/CHECKLIST_AGGIORNAMENTO.md`).

## Come si crea il PDF

Dal 28/09/2026 le regole di sicurezza impediscono a Claude di avviare Chrome (dovrebbe
toccare i dati del browser in `~/Library`): il PDF lo crea Iacopo con un comando nel
terminale (nell'app di Claude c'è il pulsante "Esegui"):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --user-data-dir="$TMPDIR/chrome-pdf" --print-to-pdf="$HOME/Claude/fanta-athletic-backups/03-documenti-admin/Fanta-Athletic-2026-27-presentazione-asta.pdf" "file://$HOME/Claude/fanta-athletic-code/docs/presentazioni/asta-2026-27.html"
```

Il PDF finisce accanto alla guida admin, fuori dal progetto (non va su Git né online).
Per vederla senza PDF: server locale acceso → `http://localhost:8912/docs/presentazioni/asta-2026-27.html`.
