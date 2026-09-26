# Firebase ↔ locale: cosa vive dove e come si tiene allineato

Allineato a: D118

**Regola (decisa dall'utente il 24/09/2026)**: tutto ciò che si fa su
Firebase deve avere la sua copia in questo progetto. Si scrive PRIMA qui,
poi si applica su Firebase. Se si cambia qualcosa direttamente in Console,
va riportato qui subito.

## Cosa esiste su Firebase e dove sta la copia locale

| Cosa | Su Firebase | Copia locale (fonte) | Stato |
|---|---|---|---|
| Regole di sicurezza Firestore | Console → Firestore → Regole | `firestore.rules` | **allineato**: pubblicate dall'utente il 25/09/2026 sera (scelta allenatore + `coachLocked`, D108) |
| Indici Firestore | Console → Firestore → Indici | *(manca; copia storica nov. 2025 in `docs/firebase-storico/`)* | da esportare; noto 1: `notifications` (userId ↑ + createdAt ↓, D037) |
| Catalogo bonus/malus | `leagues/{lega}/rules` | `resources/rules.json` (seme per leghe nuove) | allineato al seme; le leghe esistenti si modificano da `admin-rules.html` |
| Giocatori / allenatori | `leagues/{lega}/players`, `coaches` | `resources/players.json`, `coaches.json` | seme locale |
| Calendario Athletic | `athletic_calendar` | *(solo online)* | fonte partite del contest; **vuoto dal 25/09/2026** (azzeramento D096), lo ricompilano gli admin |
| Configurazione Hosting | — | `firebase.json` + `.firebaserc` (ricreati D101) | cosa si pubblica e cosa no, cache |
| Regole Storage | Console → Storage → Regole | *(copia storica nov. 2025 in `docs/firebase-storico/`, da confrontare)* | non collegate a `firebase.json` |
| Hosting (i file del sito) | Firebase Hosting (pubblicato 25/09/2026 09:11, commit `9e3b8fd`, D106) | questa cartella | **allineato** al commit `9e3b8fd`; si ripubblica solo su conferma (D106) |
| Dati utenti (email, nomi) | `users` | *non si copia* | dati personali: restano solo su Firebase |

## Struttura dati aggiunta per Curva Morello vs Piana (D069–D074)

- `users/{uid}`: `fazione` (`curva`|`piana`), `fazioneAt`, `fazioneDa`
  (`squadra`|`admin`), `nomeReale`.
- `leagues/{lega}/teams/{n}.fazione`: fazione della squadra (una volta sola).
- `contest_predictions/{G}_{uid}`: `uid`, `matchKey`, `giornata`, `pick`
  (`1`|`X`|`2`), `faction`, `name`, `timestamp`, `points` (null finché
  l'admin non calcola), `scoredAt`.
- `contest_standings/current`: `users`, `teams`, `byMatch`, `updatedAt`
  (scritto solo da `admin-contest.html`).
- `leagues/{lega}/rules/{id}`: campi nuovi `ambito` (`squadra`|`fazione`, assente = globale) e `fazione` (`comune`|`curva`|`piana`) — D080.
- `leagues/{lega}/days/{g}` e `matchday_temp/{g}`: nella mappa `curva` chiavi nuove `tm:<squadra>:<regola>` (bonus per squadra) e `fz:<fazione>:<regola>` (evento di fazione).
- `leagues/{lega}/results/{g}`: campo `faction_bonus` (`curva`/`piana` → `squadre`, `eventi`, `total`); `results/{g}/teams/{n}`: `breakdown.fazione` e `faction`.
- `leagues/{lega}/config/season`: parametri della stagione (D087) — nome, stato, modalità, scontri diretti, mini-gioco. Nessuna regola nuova (percorso già coperto).
- `leagues/{lega}/archive/{stagione}` + `/items/{id}`: archivio stagioni (D087), `{kind, path, data}` per ogni documento copiato. **Regola nuova in `firestore.rules`.**
- `leagues/{lega}/h2h_results/{chiave}/giornate/{G}`: ora anche `pointsHome/Away`, `esito`, `ptsHome/Away`, `regole` (quando la modalità scontri è attiva).
- `leagues/{lega}/live/{G}`: stato della Partita live (`aperta`/`provvisorio`/`definitivo`), `agreed`, `disputes`, `resolutions`, `corrections`, `deadline`, `sheetsUsed`, `final` (D093). **Regola nuova in `firestore.rules`.**
- `leagues/{lega}/live/{G}/sheets/{uid}`: foglio di ciascun admin (`players`, `coaches`, `curva`, `log`, `closed`) — ognuno scrive solo il proprio.
- `leagues/{lega}/results/{G}`: campi nuovi `stato` (`provvisorio`|`definitivo`) e `revisioneEntro`, letti dall'avviso "punti provvisori" dei giocatori (nessun indice composto: filtro su un solo campo).
- Globali (non per lega): `athletic_calendar`, `contest_predictions`,
  `contest_standings`.
- Nessuna regola Firestore nuova richiesta da D080 (tutto sotto percorsi già coperti, scrittura admin).

## Come applicare le regole (chi ha accesso alla Console)

1. Console Firebase → progetto **fanta-athletic** → Firestore → **Regole**.
2. Copia il testo attuale in un file di backup.
3. Apri `firestore.rules` di questo progetto, seleziona tutto, copia.
4. Nell'editor della Console: seleziona tutto, incolla, **Pubblica**.
5. Prima di pubblicare, prova col **Simulatore regole** (vedi
   `docs/firebase-storico/FIRESTORE_RULES_CONTEST.md`, sezione "Come provarle").
6. Segna qui sotto la data di pubblicazione e aggiorna lo stato in tabella.

Pubblicazioni fatte:
- 24/09/2026 — `firestore.rules` intero (D075/D076/D077). Verificato in lettura su 25 percorsi e 14 pagine: nessuna regressione (D078).
- 25/09/2026 — `firestore.rules` intero con regola archivio stagioni (D087). Verificato su 22 percorsi e 6 pagine: nessuna regressione (D089).

Archivi presenti: `leagues/4rq1Rr0TquRfuPLmqQTn/archive/2025-26` (931 documenti, verificato campo per campo col backup, D089).

## Da fare per allineare del tutto

- Esportare gli indici Firestore in `firestore.indexes.json`.
- Decidere se usare la Firebase CLI da questo progetto (serve il login
  dell'utente, che Claude non usa mai): `firebase deploy --only firestore:rules`
  lo eseguirebbe l'utente stesso.
