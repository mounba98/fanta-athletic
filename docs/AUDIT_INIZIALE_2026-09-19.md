# Audit iniziale — Fanta Athletic

Allineato a: D007 (riferimento intenzionalmente congelato — vedi nota sotto)

Fotografia dello stato del progetto al 2026-09-19, fatta analizzando il
codice presente in questa cartella (copia locale della repository GitHub
condivisa dall'amico che ha costruito il sito). Documento di riferimento
tecnico — il `CLAUDE.md` del progetto ne riporta solo la sintesi.

> **Nota:** a differenza di `CLAUDE.md`, `docs/PUNTI_APERTI.md` e
> `docs/MAPPA_PAGINE.md` (che si aggiornano ad ogni sessione e vanno
> confrontati con l'ultima voce di `docs/DECISION_LOG.md`), questo
> documento è una fotografia storica del 2026-09-19 e resta volutamente
> fermo a D007: non va "riallineato", eventuali scoperte successive che
> lo smentiscono (es. D023 sul dato di Jacopo Pinzauti, diverso da quanto
> ipotizzato qui) sono registrate nel decision log, non qui.

Nessuna modifica è stata fatta al codice per produrre questo documento.

---

## 1. Architettura generale

- Sito statico: 103 file `.html` nella cartella principale, nessun build
  tool, nessun `package.json`, nessun router — ogni pagina è un documento
  indipendente che include a mano ~15-25 tag `<script>`.
- Backend: Firebase — Firestore come database, Auth con email/password e
  Google Sign-In. SDK "compat" v10.14.1, caricato da CDN Google con
  fallback su copie locali in `resources/firebase-*-compat.js`
  (`resources/firebase-cdn-loader.js` gestisce il fallback).
- Configurazione Firebase centralizzata in `resources/firebase-config.js`,
  ma **ricopiata a mano anche in altri 7 file**: `set-admin.html`,
  `athletic-manager.html`, `download-app.html`, `fix-mark-g1-computed.html`,
  `admin-calendario.html`, `wirc-snap-v2.html`, `wirc-snap-v2.5.html`.
  L'`apiKey` è comunque pubblica per natura (normale per app Firebase
  client-side) — il problema è solo la manutenzione (va aggiornata a mano
  in più punti).
- `resources/firebase-config.js` contiene anche un **adapter multilega**:
  un Proxy JavaScript che intercetta le chiamate a
  `firebase.firestore().collection()` per riscriverle verso
  `leagues/{leagueId}/...`. È un livello di complessità notevole,
  incoerente con la semplicità del resto del progetto.
- PWA con service worker (`sw.js`), versionamento manuale tramite stringhe
  di data (`CACHE_NAME`) da aggiornare a ogni deploy, più query-string di
  versione (`?v=...`) su ogni tag `<script>` di ogni pagina, anch'esse da
  aggiornare a mano. Tre pagine (`cache-buster.html`, `force-update.html`,
  `clear-sw.html`) sono strumenti di emergenza per sbloccare utenti rimasti
  su versioni vecchie — prova diretta che l'aggiornamento automatico non è
  mai stato del tutto affidabile.
- Navigazione generata via JS: `resources/navbar.js`/`bottom-nav.js` per
  gli utenti, `resources/admin-navbar.js` per gli admin. Nessun router,
  ogni pagina ricarica lo stesso menu da zero.

## 2. Sicurezza — criticità aperte

### ✅ Escalation privilegi admin — verificata, NON sfruttabile (D003 → D007)

`set-admin.html` e `set-first-admin.html` scrivono direttamente su
`admins/{uid}` in Firestore dal browser, senza alcun controllo lato client
che chi chiama sia già admin. Il 2026-09-19 l'utente ha condiviso le
regole reali di Firestore: `match /admins/{adminId} { allow write: if
isAdmin(); }` — la scrittura è bloccata lato server per chiunque non sia
già admin. **Il rischio non è reale.** Le due pagine restano solo relitti
da archiviare (probabilmente scritte prima che questa regola esistesse).

Nota minore residua: `set-admin.html` riga 22 ha un'email personale
precompilata come valore di default — da rimuovere quando si archivia.

### 🟡 Join a una lega senza verifica del codice invito lato server

Dalle regole condivise dall'utente (`firestore.rules`, letto per intero il
2026-09-19): la regola di update su `leagues/{leagueId}` permette a
qualunque utente autenticato di aggiungersi all'array `members` (join)
senza che la regola verifichi il possesso del codice invito reale — quel
controllo vive solo nell'interfaccia del sito. Inoltre lo stesso documento
di lega è leggibile da chiunque sia autenticato (`allow read: if
isSignedIn()`, commento esplicito nel file: serve per permettere la
verifica del codice invito anche a chi non è ancora membro), quindi anche
il codice invito stesso è di fatto leggibile senza essere membri.
Combinando i due punti, un utente in grado di chiamare direttamente le API
Firestore (bypassando l'interfaccia) potrebbe unirsi a una lega altrui e
leggerne squadre/formazioni/risultati/bacheca senza conoscere il vero
codice invito.

**Severità:** bassa-media. Nessun dato finanziario o sensibile in gioco
(è un fantacalcio tra amici), richiede una minima competenza tecnica per
essere sfruttato, non è alla portata di un utente qualunque per errore. Da
sistemare (validare il codice invito dentro la regola stessa, o spostare
il join dietro una funzione lato server) prima di una eventuale apertura
pubblica del sistema multileghe.

### Altri punti (bassa urgenza)

- `resources/error-logger.js` scrive errori anche su Firestore
  (`error_logs`) lato client senza autenticazione esplicitamente richiesta
  — possibile vettore di spam/costo se le regole non limitano le scritture
  (collegato al punto sopra).
- Nessuna credenziale di terze parti, password o token trovati hardcoded
  nel codice (oltre alla normale apiKey Firebase pubblica).
- `scripts/catalog-migration/migrate-athletic-roster.js` (script Node lato
  server, usa Admin SDK con `applicationDefault()`) riporta come
  esempio/default un `legacyLeagueId` e un `superadminUid` reali nei
  commenti — non critico, ma da anonimizzare se la repo diventasse
  pubblica.

## 3. Qualità del codice — debito tecnico (non urgente)

- **Duplicazione di funzioni condivise:**
  - `getCurrentLeagueId`: centralizzata in `resources/firebase-config.js:212`
    ma ridefinita localmente in almeno 6 pagine (`formazioni.html`,
    `matchday.html`, `classifiche.html`, `squadre.html`,
    `lineup-summary.html`).
  - `toast`/`showToast`: almeno 13 implementazioni quasi identiche sparse
    in altrettante pagine, mai centralizzata.
- **~113 `console.log`** dimenticati in `resources/*.js`, ~126 negli
  `.html` — rumore, non pericolo.
- **File JS orfani** (non referenziati da nessun `.html`, andrebbero
  verificati prima di eliminare): `resources/version-check.js`,
  `resources/clear-old-data.js` (contiene un fix hardcoded per una data
  specifica, "19 ottobre" — hack temporaneo mai rimosso),
  `achievements-system.js`, `admin-navbar.js` (verificare, potrebbe essere
  caricato dinamicamente), `defense-modifier-calculator.js`,
  `league-helper.js`, `player-photos.js`, `trades-system.js`,
  `wirc-snap-game.js`.
- **5 link rotti** verso pagine mai create: `games-hub.html` linka a
  `memory-game.html`, `penalty-shootout.html`, `athletic-quiz.html`
  (inesistenti); `wirc-royale.html` linka a `wirc-deck-builder.html` e
  `wirc-game.html` (inesistenti).
- Due file dati con nome ID casuale (`coaches_y3GQ05GhHsMSZLZj1Oew.json`,
  `players_y3GQ05GhHsMSZLZj1Oew.json` in `resources/`) contengono solo dati
  di test fittizi ("Coach Test 1") — da eliminare, nessun rischio privacy.

## 4. Inventario dei 103 file HTML

Nessuna cartella separa pagine app / admin / strumenti diagnostici / test /
esperimenti: sono tutte mescolate nella root. Categorie individuate:

| Categoria | N. file | Note |
|---|---|---|
| Pagine app principali (utente finale) | 31 | index, auth, bacheca, squadre, formazioni, classifiche, matchday, ecc. |
| Pagine admin | 20 | prefisso `admin-*`, alcune attive (in `admin.html`/navbar), altre orfane |
| Fix/debug/migrazione one-off | 24 | script scritti per risolvere un bug specifico, in gran parte non più referenziati |
| File di test | 3 | prefisso `test-*` |
| Giochi/feature secondarie (cluster carte) | 20 | vedi D004 — messo in sospeso, non toccare |
| Non chiaro / da verificare caso per caso | 8 | vedi lista sotto |

### Candidati sicuri per l'archiviazione (34 file, zero riferimenti vivi verificati)

Fix/debug/migrazione: `FIX_MAURO_PLAYER.html`, `RESET_CURVA_FIX.html`,
`fix-mark-g1-computed.html`, `fix-remove-player.html`,
`fix-users-leagues.html`, `debug-foto-db.html`, `debug-join-code.html`,
`debug-league-structure.html`, `check-duplicate-rules.html`,
`migrate-athletic-to-catalog.html`, `migrate-existing-data.html`,
`populate-data.html`, `set-admin.html`, `set-first-admin.html`,
`add-invite-code-to-leagues.html`, `adsense-preview.html`.

Test: `test-penalties.html`, `test-responsive.html`.

Hub admin vecchi: `admin-old.html`, `admin-organized.html`.

Pagine "_live" abbandonate: `matchday_live.html`, `squadre_live.html`.

Admin superate: `admin-cards.html`, `admin-admins.html`,
`admin-roster.html`, `admin-import-players.html`.

Giochi vecchi/orfani (parte del cluster D004, quindi NON toccare comunque
per ora): `osm-manager.html`, `wirc-battle.html`, `wirc-card-maker.html`,
`wirc-batch-card-maker.html`, `clash-cards.html`, `wirc-snap.html`,
`wirc-snap-v2.html`, `wirc-snap-v2.5.html`, `wirc-snap-v3.html`,
`wirc-snap-v5.html`, `wirc-snap-full.html`, `wirc-snap-mobile.html`.

> Nota: `set-admin.html` e `set-first-admin.html` sono anche il punto della
> criticità di sicurezza D003. Prima di archiviarli va comunque chiarito se
> servono ancora per bootstrap di emergenza (es. nuovo ambiente di test).

### Richiedono conferma umana prima di toccare

- `sblocca-formazioni-temp.html`, `cache-buster.html`, `clear-sw.html`,
  `force-update.html`, `test-foto-live.html`, `upload-foto-giocatori.html`,
  `upload-rules-to-firestore.html`, `verifica-squadre-utenti.html` —
  nome da "one-off" ma **attivamente linkati dal menu admin corrente**
  (`admin.html`): non archiviare, al massimo rinominare/documentare.
- `admin-teams.html` — orfano dall'hub ma ha ancora un link vivo da
  `verifica-squadre-utenti.html`.
- `admin-users.html` — orfano ma unica pagina che gestisce gli utenti
  registrati; verificare se c'è un sostituto prima di archiviare.
- `admin-leghe.html` — **NON archiviare**, vedi D005: è attivo e collegato
  da tre file condivisi (`auth-guard.js`, `league-context.js`,
  `league-selector.js`).
- `admin-cup.html` — stub "Coppa in Sviluppo", feature non completata, non
  abbandonata.
- `adsense-verification.html` — probabile requisito esterno di Google
  (AdSense), non toccare anche se non collegata internamente.
- `h2h-standings.html`, `standings.html` — verificare sovrapposizione con
  `classifiche.html`.
- `giornata-calcolata-popup.html`, `results-h2h-modal.html` — zero
  riferimenti testuali ma nomi da componente dinamico: verificare nel
  codice JS come vengono aperti prima di archiviare.
- `user-profile-upload.html` — verificare sovrapposizione con
  `profile.html`.
- `download-app.html` — verificare se linkata da canali esterni
  (social/QR) prima di archiviare.
- `formazioni-basket.html`, `formazioni-volley.html` — esistono config
  dati dedicati (`data/basket-config.json`, `data/volley-config.json`) ma
  nessuna pagina/menu le collega: multi-sport pianificato e mai agganciato,
  o abbandonato? Da chiedere all'amico.

## 5. Storia del progetto (dai 14 documenti Markdown scritti dall'amico)

- **Timeline**: novembre 2024 prima architettura (V1, in
  `docs/storico-originali/ARCHITETTURA_SISTEMA_COMPLETA.md`), sostituita a stretto giro da una V2
  più matura (`docs/storico-originali/ARCHITETTURA_SISTEMA_V2.md`, basata su una specifica
  prodotta con ChatGPT). Dicembre 2024: bilancio più realistico dello
  stato (`docs/storico-originali/STATO_SITO.md`). Novembre 2025 (un anno dopo): ripreso il
  filone V2 con `docs/catalogo/TASSONOMIE.md` e
  `docs/catalogo/ROSTER_ATHLETIC_2018.md`, ancora allo stadio di piano.
- **Migrazione multileghe: SOLO PIANIFICATA, mai completata.** Secondo la
  checklist più affidabile (`docs/storico-originali/STATO_SITO.md`): l'adapter di base è pronto
  al 100%, ma la migrazione delle query nelle pagine principali (formazioni,
  squadre, calcolo giornate, classifiche) è ferma a **0 pagine su 31**, le
  regole di sicurezza multilega sono allo **0%**, il sistema di ruoli
  (superadmin/admin lega/admin store) è solo scritto come requisiti, mai
  implementato. Oggi creare una seconda lega probabilmente non funziona
  bene: l'infrastruttura c'è ma le pagine che usano i dati non sono state
  aggiornate.
- **Contraddizioni tra documenti**: alcuni documenti di novembre 2024
  (`docs/storico-originali/STRUTTURA_FIRESTORE_POST_MIGRAZIONE.md`, `docs/storico-originali/GUIDA_TEST_MIGRAZIONE.md`)
  descrivono una migrazione di prova già eseguita su una lega, mentre
  `docs/storico-originali/STATO_SITO.md` (più recente) la elenca ancora come "da fare" — probabile
  che quel test non sia stato consolidato. AdSense risulta implementato in
  `docs/storico-originali/ADSENSE_SETUP.md` ma poi rimosso su richiesta esplicita dell'utente
  originale, secondo `docs/storico-originali/STATO_SITO.md`.
- **Bug noto documentato**: durante una migrazione di prova, il campo
  `roster` di alcune squadre conteneva ID documento invece del codice
  giocatore corretto — fix proposto ma non confermato come applicato.
  Andrebbe verificato se questo dato è ancora così nel database reale.
- **Backup**: gli script `scripts/backup-firestore.sh`/`.bat` sono reali e
  correttamente scritti (chiamano `firebase firestore:export` /
  `gcloud firestore export`), ma nei documenti non c'è traccia di backup
  effettivamente eseguiti e verificati di recente — da chiedere
  all'utente/amico se vengono lanciati regolarmente.
