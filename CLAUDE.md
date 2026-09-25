Allineato a: D102

# Fanta Athletic — contesto per Claude

## Il piano generale, in ordine (D034 — importante, leggere prima di tutto)

**Non c'è una stagione in corso.** La stagione 2025/2026 non è ancora
iniziata: tutti i dati visti finora testando l'app (squadra "Curva
gonfi", giornata 21, punteggi, formazioni) sono **della stagione
passata**, non della corrente. L'utente sta revisionando l'app in
preparazione della stagione nuova. Questo non significa "si può fare
tutto senza pensarci" (i dati restano reali e vanno trattati con
rispetto), ma cambia la finestra di rischio: non c'è pericolo di rompere
una giornata live o formazioni schierate questa settimana, perché nessuno
sta giocando attivamente adesso.

Il piano dell'utente, in ordine:
1. ✅ **Revisione/bugfix — CHIUSA DAVVERO AL 100%** il 2026-09-20 (D037):
   pulizia cartelle/codice (D008-D022), primo test con account reale
   (D023-D024), test completo di **tutte** le pagine attive del sito,
   utente e admin (D028-D035), e le 3 azioni Firebase Console (2 regole +
   1 indice) fatte dall'utente e verificate funzionanti da Claude
   (D037) — comprese `contest.html` e `asta.html`, ora senza errori.
   Trovato e corretto anche un bug nuovo emerso solo dopo aver sbloccato
   i permessi (lettura data calendario in `contest.html`, D037). Nessuna
   azione rimasta in sospeso su questo fronte.
2. **Redesign grafico** dell'app — fatto in gran parte (D039-D067);
   rifiniture estetiche e velocità rimandate a dopo la Fase 3 (D085).
   **Fase attiva ora: 3** (D085) — vedi "PROSSIMA SESSIONE" sotto.
3. **Aggiungere le funzioni nuove** (dopo il redesign): foto giocatori
   con stile uniforme (D025); ricostruire per bene le funzioni di
   `admin-squadre.html` (cambio numero squadre, generazione calendario,
   reset competizione), archiviate il 2026-09-20 (D034) proprio perché
   richiedono lavoro vero, non un bugfix veloce; e la lista di richieste
   dei 2 admin storici della lega, **ricevuta il 2026-09-20 (D038)** —
   betting fittizio 1X2, pannello bonus/malus (verificare sovrapposizione
   con `admin-rules.html`/`matchday.html` già esistenti), modifica dei
   valori bonus/malus, scontri diretti "stile fantacalcio" (verificare
   sovrapposizione con `h2h-standings.html` già esistente), aggiornamento
   lista giocatori — dettaglio completo in `docs/PUNTI_APERTI.md` e
   `docs/DECISION_LOG.md` D038.
4. **Solo a quel punto**: inserire i giocatori corretti, le squadre
   corrette, impostare la stagione nuova e far ripartire il campionato.

## Riprendi da qui (prossima sessione)

**▶ PROSSIMA SESSIONE — PARTI DA QUI (D096, 25/09/2026)**
Fase 3 quasi finita, obiettivo: pronti prima dell'asta di ottobre 2026.
**Fatto il 25/09**: regola "Partita live" pubblicata e verificata (D095);
prova completa della Partita live con un admin solo, superata (D095);
**stagione 2025/26 AZZERATA e 2026/27 APERTA VUOTA** (D096), dopo backup
completo (`backups-firestore/backup-completo-pre-azzeramento-…json` + copia
in `~/Claude/fanta-athletic-backups/02-database/`). La 2025/26 vive solo
nell'archivio (albo d'oro). La compilazione della 2026/27 la fanno gli
admin dal percorso guidato (`admin-stagione.html#percorso`).
**Attenzione**: il database è uno solo → il sito online mostra già la
stagione vuota, ma **online l'albo d'oro e le pagine nuove non ci sono
ancora**: la pubblicazione del sito è diventata più urgente.
Codice ancora **solo in locale** (sito online e GitHub non toccati).
Prossimi passi: Partita live con due admin, account non admin, 4 regole
bonus e fazioni (con gli admin), dettagli scontri diretti, tutorial PDF
(D090), poi pubblicazione. Lista ordinata in cima a `docs/PUNTI_APERTI.md`.
Lezioni: la console si legge **una parola alla volta** (D094); nel
pannello di test le conferme del browser (`confirm`) si chiudono da sole
→ per provarle vanno fatte rispondere "OK" via script (D095).

1. **Fase 1 chiusa al 100% (D037). Fase 2 (redesign) fatta in gran parte
   il 2026-09-20 (D039-D051)**: font, colori, forme, tipografia, menu,
   icone, navigazione — vedi "Il sistema grafico" qui sotto e la
   checklist in `docs/PUNTI_APERTI.md` per cosa resta. La lista di
   richieste dei 2 admin storici della lega è già stata ricevuta (D038)
   ed è archiviata per la Fase 3, **non va implementata ora**.
   **Fase di recupero/allineamento locale↔Firebase — CHIUSA il
   2026-09-21 (D053-D058)**: scoperto che Firebase Hosting (il sito
   online) non era allineato al repository Git — non per una questione
   di cache, ma perché sono due cose indipendenti (chi ha accesso può
   pubblicare senza passare da un commit). Fatto un confronto
   sistematico di tutte le 74 pagine attive e **recuperato tutto** quello
   che viveva solo online: panchina mobile in `formazioni.html`, popup
   scelta giocatore/campo/panchina/pulsante inviti in `squadre.html`, e
   l'intera scheda "Classifica Giocatori" più filtri/ordinamento/vista
   compatta in `classifiche.html` (il pezzo più grande). Ricontrollate
   anche le uniche altre due pagine con differenze mai analizzate a
   fondo (`matchday.html`, `lineup-summary.html`): nessun contenuto
   mancante, solo codice condiviso duplicato (D058). **Da qui in avanti
   lo sviluppo avviene solo in locale → Git; Firebase resta solo "parte
   web", non si tocca mai più direttamente.** Si torna ora alla Fase 2
   (rifinitura grafica). **Titoli di intestazione unificati il
   2026-09-21 (D059)**: stile unico per tutte le pagine (più grande,
   grassetto), badge stagione "2025/2026" restilizzato e spostato a
   destra, robusto anche quando compare un secondo badge (es. "Nessuna
   squadra") grazie al testo del titolo che si allarga per riempire lo
   spazio libero invece di margini automatici multipli (che si erano
   dimostrati inaffidabili). Verificato su più pagine, mobile e desktop,
   zero errori console. **Banner "Squadre" disallineato dal resto,
   causa vera trovata e corretta (D060-D062)**: non bastava allineare i
   fogli di stile (D060-D061, comunque giusto da fare e fatto su altre
   34 pagine minori) — la causa reale era una riga scritta apposta
   dentro `squadre.html` per il campo a tutto schermo su mobile, che
   per errore azzerava anche lo spazio verticale condiviso dell'header.
   Corretta, verificato che ora Home/Formazioni/Squadre/Classifiche/
   Bacheca sono identiche pixel per pixel, confermato anche
   dall'utente. **Sfarfallio banner/logo al cambio pagina, indagato non
   risolto (D063)**: stesso script che regola lo stile mobile del
   banner dipende dal segnale "pagina pronta" del browser, che scatta
   tardi per colpa degli stessi tanti file caricati in sequenza già
   segnalati come lentezza generale — i due problemi sono la stessa
   causa, uniti in un solo punto in `docs/PUNTI_APERTI.md`, **non
   affrontarlo con un altro fix rapido**: richiede o CSS puro per lo
   stile mobile del banner (invece di classi aggiunte da script) o una
   vera revisione della velocità di caricamento — l'utente ha scelto
   esplicitamente di rimandarlo a quando si affronta la velocità.
   **Dubbio dell'amico sviluppatore su Firebase/Git: chiuso il
   2026-09-22 (D064)** — inizialmente contestava che ci fosse codice su
   Firebase Hosting, ma ha poi dato il nulla osta ("non starei a
   impazzire"). Le funzioni recuperate in D053-D058 restano come sono,
   nessuna azione ulteriore su questo fronte. **3 stili diversi di
   "toast" unificati (D065, 2026-09-22)**: `admin-leghe.html`,
   `admin-rules.html`, `bacheca.html` mostravano il messaggio di
   conferma in modo diverso (etichetta testuale vs icone, colore "info"
   diverso o assente, tema scuro non sempre gestito) — ora identici in
   tutte e tre, verificato chiaro/scuro/tutti i tipi, zero errori.
   Pannelli menu a tendina e layout desktop **non toccati** (il primo è
   voluto per distinguerli, il secondo rimandato su richiesta
   dell'utente). Prossimo passo dichiarato dall'utente: fluidità e
   navigazione (probabilmente il punto lentezza/sfarfallio di D063).
   **Analisi lentezza avviata (D066, 2026-09-22/23)**: misurato con
   Performance API + rete reale (non solo impressioni). Causa più
   pesante trovata: 58 pagine caricavano Firebase (~550KB) dalla CDN di
   Google invece che dalla copia locale identica — **corretto subito**
   (stessa versione, zero rischio), verificato senza errori su più
   pagine con dati reali. **Non toccato**, richiede conferma prima:
   passare alla versione "modulare" di Firebase (più leggera ma
   richiede riscrivere tutto il codice che parla con Firebase) e unire
   i ~20 file JS/CSS separati di ogni pagina in pochi bundle (riduce le
   richieste di rete ma richiede attenzione all'ordine di esecuzione).
   Il punto D063 (sfarfallio banner) resta comunque da chiudere.
   **Navigabilità "da app" (D067, 2026-09-23)**: chiusi 4 vicoli ciechi
   veri (`join-team.html`, `scegli-squadra.html`, `contest.html`,
   `contest-leaderboard.html` — pagine usate da giocatori reali senza
   alcun modo di tornare indietro se non il tasto fisico del telefono),
   aggiunto menu ☰/barra in basso o un link home minimo a seconda del
   caso. Aggiunta anche la gesture "swipe dal bordo sinistro → apre il
   menu" al posto del back nativo del browser (nuovo script
   `resources/edge-swipe-menu.js`, su 23 pagine), verificata via eventi
   touch simulati (nessun touchscreen reale nel pannello di test) — **da
   riprovare su un telefono vero appena possibile** per calibrare la
   sensibilità. Una decina di pagine admin/debug minori con lo stesso
   problema dei vicoli ciechi restano aperte, priorità bassa.
   **FASE 3 ANTICIPATA — Curva Morello vs Piana (D068-D081, 2026-09-24)**,
   checkpoint completo in `docs/DECISION_LOG.md` D081. Costruito:
   fazione per squadra + nome reale obbligatori (`resources/faction.js`,
   `faction-gate.js`, `admin-fazioni.html`); mini-gioco voto 1-X-2, 10
   punti, apertura 24h prima (`contest.html`, `admin-contest.html`,
   `contest-leaderboard.html`, `resources/contest-scoring.js`,
   `contest-reminder.js`); bonus di fazione (`resources/faction-bonus.js`,
   campo "Assegnazione" in `admin-rules.html`, tab "Fazioni" in
   `matchday.html`: un solo "presente" per squadra, casa/trasferta dal
   calendario); tab "Curva vs Piana" in `classifiche.html`. Regole
   Firestore: `firestore.rules` è la fonte locale, **pubblicate
   il 24/09/2026** (D078); regola fissa D077: Firebase e locale sempre
   allineati (`docs/FIREBASE_ALLINEAMENTO.md`). **Test con scritture
   vere del contest superato (D079).** Mancano: creare le 4 regole bonus
   nella lega, provare con un account non admin, provare il salvataggio
   del Calcolo giornata con i bonus.
   **FASE 3 "A GAMBA TESA" (D085-D087, 2026-09-25)** — obiettivo: finire
   prima dell'asta di ottobre 2026. Stagione passata = 2025/26, nuova =
   2026/27; le rose si svuotano (asta ogni anno); archiviare/aprire
   stagione: tutti e 4 gli admin. Fatto: `admin.html` a 6 blocchi,
   `admin-stagione.html` (parametri in `leagues/{lega}/config/season`,
   archivia, nuova stagione), `archivio.html` (albo d'oro),
   `resources/season.js`, `season-archive.js`, `h2h.js` (scontri
   diretti predisposti, spenti finché modalità = classica). Regola archivio pubblicata e
   **2025/26 archiviata e verificata** (D089, backup su disco D088).
   **Partita live** (D091-D093): `live.html` + `resources/live-core.js`,
   doppio foglio admin → incrocio → provvisori → revisione 48h →
   definitivi, calcolo sempre con `matchday.html` (`?from=live`); avviso
   "punti provvisori" ai giocatori (`resources/provisional-badge.js`).
   Regola Firestore della live scritta, **non ancora pubblicata**.
   Manca: pubblicare la regola della live, le prove sul database vero,
   i dettagli degli scontri diretti dagli admin. Checklist in
   `docs/PUNTI_APERTI.md`.
2. Il server locale di test si avvia con
   `mcp__Claude_Browser__preview_start` (config `static-server` in
   `.claude/launch.json`, **porta 8912 dal 2026-09-20, D044** — cambiata
   apposta da 8899 per eliminare cache vecchia accumulata in ore di test,
   vedi sotto) — **si ferma da solo tra una sessione e l'altra**
   (successo più volte), va sempre verificato/riavviato a inizio
   sessione, senza darlo per scontato. Usa `.claude/no-cache-server.py`
   invece del normale `python -m http.server` (D042), apposta per
   mandare sempre `Cache-Control: no-store`.
3. **Lezione importante sulla cache (D042-D044)**: l'header anti-cache
   del server impedisce alla cache di formarsi **da quel momento in
   poi**, ma non cancella pagine già viste prima dal browser — in una
   sessione lunga (ore di test), pagine visitate all'inizio possono
   restare "congelate" alla versione di allora e riemergere con un
   semplice click su un link interno, in modo apparentemente casuale.
   **Se ricapita "vedo ancora la versione vecchia" nonostante il server
   sia a posto**: cambiare di nuovo la porta in `.claude/launch.json`
   (origine nuova = nessuna cache pregressa), non solo riavviare il
   server. Effetto collaterale da spiegare all'utente: cambiare porta
   fa perdere il login salvato, va rifatto (da lui, non da Claude).
4. **Durante il redesign (Fase 2), dopo ogni modifica visiva: fermare e
   riavviare il server e ricaricare la pagina prima di dire all'utente
   che è pronta da guardare** — richiesta esplicita dell'utente. **E
   verificare ogni correzione su più pagine diverse, non solo una**
   (richiesta esplicita dopo D044): un fix su un file condiviso può
   sembrare a posto in un punto e non esserlo altrove per motivi
   indipendenti dal fix (come la cache in questo caso). Usare sempre
   `read_console_messages` **senza il filtro "solo errori"** quando si
   cerca un bug: il filtro non cattura i `console.warn`, e alcuni bug
   reali di questa sessione (permission-denied "gestiti" con un warning)
   sarebbero passati inosservati con il solo filtro errori
   (lezione di D035). Anche la cronologia console del pannello Browser è
   **cumulativa per scheda**, non per caricamento pagina: per un
   controllo davvero pulito dopo una correzione, aprire una scheda nuova
   con `tabs_create` invece di ricaricare quella esistente (lezione di
   D037).
5. **Il giro di test di tutto ciò che già esiste è concluso** (D035,
   D037) — non serve ripetere il test delle pagine già verificate.
6. **Dopo una sostituzione automatica di massa** (colori, emoji, testi)
   cercare sempre gli elementi rimasti **vuoti**, non fidarsi del solo
   conteggio delle sostituzioni: una pulizia delle emoji ha svuotato 19
   pulsanti che contenevano solo un'emoji, accorgersene è stato possibile
   solo cercando `></button>` (lezione di D051).

## Il sistema grafico (dal 2026-09-20, D039-D051)

Prima non esisteva: colori, font e misure erano scelti a mano pagina per
pagina. Ora c'è un sistema unico, e **modificarlo in un posto solo
aggiorna tutta l'app**.

- **`resources/theme-tokens.css` è l'unico posto dove vivono i colori e
  il font.** `resources/sheet.css` lo importa (non ne tiene una copia).
  Le 3 pagine con impaginazione propria (`contest.html`,
  `contest-leaderboard.html`, `calendario-athletic.html`) caricano
  **solo** i token, non `sheet.css`: usano nomi di classe generici
  (`.card`, `.match-card`) che con il foglio completo mandavano in
  conflitto il layout (D050).
- **Colori ufficiali**, campionati dal logo Athletic 2018: rosso
  `#920100`, blu navy `#0c0f6d`. Verde `#16a34a` preso dal campo da
  gioco di `formazioni.html`, oro `#facc15` dal bordo "capitano".
  Grigio/neutro per il resto. Colori "funzionali" mantenuti dove hanno
  un significato: verde = salva/conferma, ambra = in corso/avviso,
  oro/argento/bronzo = podio.
- **Font**: Inter (le `textarea` vanno sempre impostate con
  `font-family: inherit`, altrimenti il browser usa un font a
  spaziatura fissa — D049).
- **Forme**: pulsanti, tab, chip e campi su una riga hanno angoli "a
  pillola" (`999px`); le `textarea` no. I pulsanti hanno una sfumatura
  leggera + ombra morbida, e si abbassano di 1px alla pressione.
- **Titoli**: scala unica in `sheet.css` (`h1`/`h2`/`h3` con `clamp`),
  più uno stile "vetrina" `clamp(26px, 5vw, 36px)` per i titoloni delle
  pagine promozionali.
- **Icone**: file PNG in `resources/icons/`, tutti ricolorati in oro.
  Sono immagini, quindi **non si colorano via CSS**: per cambiarne il
  colore va rigenerato il file (si fa con uno script che tiene la
  trasparenza e sostituisce il colore). Dove serve un'icona nuova,
  meglio un SVG scritto nel codice (come la luna del tema), che segue
  automaticamente il colore del testo.
- **Versioni cache**: i riferimenti ai file condivisi usano un'etichetta
  `?v=…` (in origine `20260920-final`; i file toccati dopo hanno la data
  della modifica, es. menu/barra `20260925`). **Ogni volta che si
  modifica un file condiviso va cambiata**, altrimenti i browser
  continuano a usare la versione vecchia. **Dal D099 è ancora più
  importante**: il service worker tiene i file etichettati nel magazzino
  del telefono e non li richiede più finché l'etichetta non cambia.
  Il service worker in locale (localhost) è spento apposta; per provarlo
  aprire `http://[::1]:8912/` e poi disattivarlo e ripulirlo.

## Cos'è

Web app di fantacalcio/fantasport "Fanta Athletic", costruita manualmente
(senza framework né build tool) da un amico dell'utente nell'arco
dell'ultimo anno. **In uso da una comunità reale di giocatori** (la
stagione passata è quella che abbiamo testato), attualmente in pausa tra
una stagione e l'altra — vedi sezione sopra. Il codice vive su una
repository GitHub che l'amico ha condiviso con l'utente; questa cartella
locale ne è una copia.

## Regola di lavoro più importante per questo progetto

**Non modificare GitHub, non fare commit/push, finché l'utente non lo
conferma esplicitamente dopo aver verificato e testato in locale.** La
versione su GitHub è l'unica versione stabile su cui si appoggiano molti
utenti — vedi [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) D002. Questa
cartella al momento **non è un repository git** (nessuna cartella `.git`):
prima di inizializzarne uno, chiedere all'utente.

**Backup**: tutte le copie (codice, repository GitHub prima della sostituzione,
database, documenti admin) sono in `~/Claude/fanta-athletic-backups/` (indice in `LEGGIMI.md`), fuori dal progetto (D101). La
vecchia copia del 19/09 non è più dentro la cartella del progetto.

**Repository GitHub**: `https://github.com/mounba98/fanta-athletic` (di Mocci,
Iacopo collaboratore, accesso via Git del terminale). Il ramo `main` al 25/09/2026
coincide con la copia di partenza del 19/09. Firebase Hosting si pubblica con
`firebase.json` ricreato il 25/09 (D101).

## Stack tecnico

- Sito statico: file `.html` indipendenti nella root (74 attivi + 29
  archiviati = 103 totali al 2026-09-20), nessun `package.json`, nessun
  bundler, nessun router — ogni pagina include a mano i propri script.
- Backend: Firebase (Firestore + Auth, SDK compat v10.14.1). Config
  centralizzata in `resources/firebase-config.js` (contiene anche
  l'adapter per il multilega, un Proxy che riscrive i path Firestore).
- PWA con service worker (`sw.js`), versionamento cache manuale.
- Regole di sicurezza Firestore: copia locale completa in `firestore.rules`
  (fonte, D077), pubblicata in Console il 24/09/2026 (D078). Si modifica
  prima qui, poi si incolla in Console.

## Stato reale del progetto (non quello ottimistico dei documenti storici)

- **Escalation admin: verificata, NON è un rischio reale** — le regole
  Firestore bloccano correttamente la scrittura su `admins` a chi non è
  già admin. `set-admin.html`/`set-first-admin.html` restano solo pagine
  morte, archiviate. Vedi [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) D003/D007.
- **Criticità di sicurezza aperta, minore, accettata per ora**: il join a
  una lega non verifica lato server il codice invito — solo l'interfaccia
  lo controlla. Rischio accettato esplicitamente da amico e utente (D018),
  da sistemare prima di una fase multileghe pubblica. Vedi
  [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) D007.
- **Struttura cartelle riallineata allo standard** (D008, D019, D034):
  aggiunto `README.md`; 29 file HTML obsoleti (fix/debug/migrazione
  one-off, hub admin vecchi, pagine "_live" abbandonate, file di test,
  esperimento multi-sport embrionale, `admin-squadre.html` su dati finti)
  spostati in `archive/`, con sottocartelle per categoria — sempre con
  verifica incrociata dei riferimenti prima di ogni spostamento. Restano
  74 pagine attive in root. Mappa di cosa fa ciascuna in
  [`docs/MAPPA_PAGINE.md`](docs/MAPPA_PAGINE.md).
- **Codice duplicato centralizzato, non riscritto** (D009-D013): niente
  SPA né spostamento di pagine attive tra cartelle (troppo rischioso senza
  un router — vedi anche l'episodio D021 sotto). Centralizzati invece: la
  funzione "lega corrente" (5 pagine → `resources/league-helper.js`) e i
  "toast" di conferma verificati byte-per-byte identici (→
  `resources/toast.js`, `resources/toast-css-class.js`,
  `resources/toast-with-fallback.js`). Non toccate 3 varianti di
  `showToast` genuinamente diverse tra loro (`admin-leghe.html`,
  `admin-rules.html`, `bacheca.html`).
- **Tutte le pagine attive testate, ogni bug di codice trovato corretto
  e verificato** (D012, D016, D028, D031, D032, D035 — 9 bug in totale):
  versione Firebase disallineata in 4 pagine, link a un CSS mai esistito
  in 3 pagine, un link rotto nell'hub admin ("Gestione Giornate" → ora
  `matchday.html`), codifica file sbagliata in 3 pagine admin,
  `ensureLeagueReady` non definita (`statistiche.html`), una ricorsione
  infinita per una funzione locale con lo stesso nome di una condivisa
  (`admin-leghe.html`), libreria di autenticazione mai caricata
  (`test-foto-live.html`), stesso tipo di problema con Firestore
  (`adsense-verification.html`), lettura data calendario sbagliata in
  `contest.html` (D037, emersa solo dopo aver sbloccato i permessi
  sotto). Nessuno di questi bug è stato introdotto da questa sessione.
  **Le 3 azioni in Console Firebase sono state fatte dall'utente e
  verificate funzionanti** (2 regole per `contest` e `auction`, 1 indice
  per `notifications`) — dettagli in
  [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) D035/D037. Nessuna
  azione rimasta in sospeso su questo fronte.
- **Lezione di metodo (D035)**: il filtro "solo errori" del pannello
  Browser non cattura i `console.warn` — usare sempre il log completo
  quando si cerca un bug, altrimenti permission-denied "gestiti" con un
  warning invece di un errore vero passano inosservati.
- **`admin-squadre.html` archiviata** (D034): usava dati finti
  (`localStorage` mai popolato invece di Firestore) per le funzioni
  "cambia numero squadre / rigenera calendario / reset competizione" —
  sembrava funzionante ma non toccava mai il database vero. L'hub admin
  ("Gestione Squadre") ora punta ad `admin-teams.html`, verificata
  collegata ai dati veri. Le 3 funzioni "Zona Pericolosa" restano da
  ricostruire per bene (non con una correzione veloce, richiedono capire
  l'algoritmo di generazione calendario e mappare con certezza cosa tocca
  un reset) — in coda per la fase 3 del piano generale sopra.
- **Regola di sicurezza Firestore mancante, trovata e risolta** (D030,
  D033): `admin-calendario.html` (gestione calendario reale della
  squadra Athletic) era bloccata per chiunque, admin incluso, perché la
  collezione `athletic_calendar` non aveva nessuna regola. Non
  correggibile da codice: l'utente ha aggiunto la regola in Console
  Firebase, verificato che ora funziona.
- **7 file JS "ampliamento futuro" archiviati** (D014, D018): non codice
  morto per errore — erano l'inizio di un progetto per rendere l'app
  concorrente di "Leghe Fantacalcio" (achievement, scambi giocatori, foto
  giocatori, calcolo bonus difesa, controllo versione app), confermato
  dall'amico. Restano in `archive/resources-orfani/`, in coda per il
  futuro — vedi [`docs/PUNTI_APERTI.md`](docs/PUNTI_APERTI.md).
- **Multileghe e cluster mini-gioco di carte: entrambi riclassificati
  come progetti futuri** (D020), non prioritari perché il sito oggi gira
  con una sola lega. Il multileghe ha uno stato incerto (l'amico dice che
  funziona, i documenti storici dicono di no — da verificare praticamente
  se e quando si riprende, non fidarsi della sola parola). Il cluster
  giochi (`games-hub.html` + famiglia `wirc-*` + `athletic-manager.html` +
  altri, 20 file) resta **in root, invariato**: un tentativo di archiviarlo
  il 2026-09-20 è stato annullato perché gli script di navigazione
  condivisi (menu, redirect login) assumono sempre che ogni pagina sia in
  root — spostarlo lo romperebbe. 5 delle 20 pagine sono già rotte di
  loro (script locali mancanti), indipendentemente da questa sessione.
  Dettagli completi in [`docs/PUNTI_APERTI.md`](docs/PUNTI_APERTI.md).
- **Primo test con account reale (D023, D024): trovati e risolti bug
  veri, invisibili nei test precedenti da non loggati.** `squadre.html` e
  `index.html` mostravano sempre la squadra sbagliata (quella di un altro
  utente) invece della propria — causato da 3-4 problemi concatenati nel
  codice (percorso Firestore sbagliato per leggere `team_index`, un
  controllo permessi che falliva sempre e bloccava tutto il resto, il
  menu a tendina mai risincronizzato, una `const legacyDb` mai
  dichiarata). Tutti corretti e riverificati con l'account reale
  dell'utente. Un giocatore con un dato in formato inatteso
  (`ruolo: "P"` invece di `role: "Portiere"`) mandava in crash l'intera
  pagina Squadre — reso il codice difensivo. **L'utente non risulta admin
  da nessuna parte nel database** (né globalmente né in questa lega): da
  sistemare quando avrà i permessi. Vedi `docs/DECISION_LOG.md` D023/D024
  per il dettaglio tecnico completo — utile schema da riconoscere se
  ricompare altrove: quando qualcosa "non trova" dati che dovrebbero
  esserci, controllare sempre se il codice sta leggendo dal percorso
  Firestore giusto (classico vs multilega) prima di sospettare i dati.

## Attenzione prima di archiviare o rinominare un file HTML

Non c'è un router: i collegamenti tra pagine sono link sparsi in tanti file
diversi (HTML e JS condivisi in `resources/`). **Verificare sempre con un
grep incrociato su tutta la cartella prima di spostare o rinominare
qualunque `.html`.** Esempio concreto: `admin-leghe.html` sembrava
abbandonato (anche l'amico che l'ha scritto pensava fosse stato rimosso),
ma è in realtà collegato da tre file condivisi
(`resources/auth-guard.js`, `league-context.js`, `league-selector.js`) —
vedi [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) D005.

## Documenti di riferimento

- [`docs/DECISION_LOG.md`](docs/DECISION_LOG.md) — storico decisioni, leggere a inizio sessione.
- [`docs/AUDIT_INIZIALE_2026-09-19.md`](docs/AUDIT_INIZIALE_2026-09-19.md) — dettaglio tecnico completo dell'analisi (architettura, sicurezza, inventario dei 103 file HTML, storia del progetto).
- [`docs/MAPPA_PAGINE.md`](docs/MAPPA_PAGINE.md) — a cosa serve ciascuno dei 74 file HTML attivi, senza doverli aprire uno per uno. Non abbiamo spostato le pagine in sottocartelle (troppo rischioso senza un router, vedi D011 e l'episodio D021): questa mappa è la soluzione scelta per l'ordine "a colpo d'occhio".
- [`docs/FIREBASE_ALLINEAMENTO.md`](docs/FIREBASE_ALLINEAMENTO.md) + [`firestore.rules`](firestore.rules) — **regola fissa (D077): tutto ciò che si fa su Firebase (regole, indici, struttura dati) si scrive prima qui in locale e poi si applica; ogni modifica fatta in Console va riportata subito.** Le regole vere sono in `firestore.rules`.
- [`docs/PUNTI_APERTI.md`](docs/PUNTI_APERTI.md) — checklist viva di cosa resta da fare/decidere/chiedere, aggiornarla quando un punto si chiude o se ne apre uno nuovo.
- Documenti originali dell'amico (root del progetto) — raccontano piani e stato passato, **non sempre coincidono con lo stato reale del codice**, usarli come contesto storico non come fonte di verità: `STATO_SITO.md`, `ARCHITETTURA_SISTEMA_V2.md` (sostituisce `ARCHITETTURA_SISTEMA_COMPLETA.md`, la V1), `ANALISI_MIGRAZIONE_MULTILEGHE.md`, `MULTILEGA-PLAN.md`, `CONSIGLIO_MIGRAZIONE.md`, `REQUISITI_STORE_E_ADMIN.md`, `STRUTTURA_FIRESTORE_POST_MIGRAZIONE.md`, `GUIDA_TEST_MIGRAZIONE.md`, `BACKUP_FIRESTORE.md`, `docs/catalogo/TASSONOMIE.md`, `docs/catalogo/ROSTER_ATHLETIC_2018.md`.

## Regole generali di lavoro

Valgono anche qui le regole generali dell'utente (spiegare in linguaggio
semplice, distinguere modifiche sicure da modifiche rischiose, aggiornare
il decision log al momento della decisione, non dare per scontato che una
pratica sia attiva senza verificarla) — vivono in `~/.claude/CLAUDE.md`,
non ripetute qui.
