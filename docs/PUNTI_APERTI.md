Allineato a: D107

# FASE 3 — cosa manca, in ordine (stato al 25/09/2026, D096)

**⚠️ SICUREZZA, URGENTE (D101)**
- [ ] Nel ramo GitHub `feature/uniform-pitch-bench` c'è `fanta-athletic-firebase-adminsdk.json` (chiave di servizio admin di Firebase, dal nome). **Mocci** (o chi ha i permessi sul progetto) deve **revocarla** in Google Cloud Console → IAM e amministrazione → Account di servizio → `firebase-adminsdk…` → Chiavi → elimina quella chiave (se qualche script la usa, crearne una nuova e tenerla SOLO in locale). Poi togliere il file dalla repository. Revocare è ciò che conta: il file resta comunque nella storia di Git.

**Fatto il 25/09 (D095–D106):** app 2026/27 online e su GitHub (D106). regola "Partita live" pubblicata e verificata; prova completa della Partita live con un solo admin superata; **stagione 2025/26 azzerata e 2026/27 aperta vuota** (backup pre-azzeramento su disco). Ora tocca agli admin compilarla dal percorso guidato.

**Prove ancora da fare (niente è stato provato "a metà": queste parti non sono mai state eseguite sul database vero):**
- [ ] **Partita live con DUE admin** (il percorso con un admin solo è provato, D095): serve la prima giornata della 2026/27 o una giornata di prova, poi pulizia (ora l'azzeramento non c'è più a pulire: togliere a mano `days`, `results`, `matchday_temp`, `live` della giornata di prova).
- [ ] **Calcolo giornata con i bonus di fazione** (D080) — mai salvato davvero.
- [ ] **Account non admin**: scelta fazione/nome, tentativo di cambio fazione (deve fallire), eredità della fazione di squadra, voto nel mini-gioco.
- [ ] **Swipe dal bordo** su un telefono vero (D067).

**Da fare, nuova richiesta (D107):**
- [ ] **Scelta allenatore obbligatoria al primo accesso della stagione**, insieme alla tifoseria (Curva/Piana), come `faction-gate.js`. Oggi gli allenatori 2025/26 sono rimasti sulle squadre (l'azzeramento non li tocca) e la scelta in `squadre.html` compare solo per squadre senza allenatore. Decidere: azzerarli per la 2026/27 (+ aggiungerli all'azzeramento futuro), schermata obbligatoria, chi può cambiarlo dopo. Poi commit + pubblicazione.
- [x] Correzione D107 (admin → propria squadra in Formazioni/Squadre) committata e pubblicata il 25/09/2026.

**Da fare nell'app (dati, non codice):**
- [ ] Creare le 4 regole bonus (presenza in casa +1, in trasferta +2, coro contro la Piana +2 Curva Morello, offese ai giocatori +2 Piana) da `admin-rules.html`.
- [ ] Fazioni delle 18 squadre: nessuna ce l'ha ancora (le sceglieranno i giocatori o gli admin da `admin-fazioni.html`).
- [ ] **Stagione 2026/27 (aperta vuota, D096)**: la compilano gli admin dal percorso guidato (`admin-stagione.html#percorso`): calendario Athletic, fazioni, controllo giocatori e regole, rose dopo l'asta (la pagina Asta **non** riempie le rose: si fanno da Squadre), stato "In corso".
- [ ] Giocatore senza nome (id `c4fyWntWj1mTj4fekijO`, compare come codice): sistemarlo da `admin-players.html`.
- [ ] Dire agli admin: la "sconfitta a tavolino" degli scontri diretti ora funziona davvero (prima falliva sempre, D095).

**Da decidere con gli admin:**
- [ ] **Scontri diretti (D087, logica pronta D100)**: decidere anche cosa vuol dire "formazione mancante" (oggi: nessun titolare; il vecchio codice: meno di 5). Dopo aver salvato i valori, se la stagione è già iniziata usare "Ricalcola tutti gli scontri" nelle Impostazioni. Mai provato sul database vero (generazione + giornata + ricalcolo). Resto del punto: soglie punti→gol adatte alla scala Fanta Athletic (5–30 punti a giornata; con 66/6 del fantacalcio finirebbe sempre 0-0), risultato a tavolino (oggi 3 a -10, scritto per punti), punti V/N/P; poi generare il calendario sfide con le squadre nuove. (3/1 fissi e numerazione già sistemati, D100.)

**Da fare a fine Fase 3:**
- [x] ~~Recuperare `firebase.json` / `.firebaserc`~~ **ricreati (D101)**; per pubblicare serve la Firebase CLI (Node.js non installato: da decidere). Vecchio: (configurazione Hosting, non presenti nella cartella, D099): servono per pubblicare. Chiederli all'amico o ricrearli; valutare lì intestazioni di cache lunghe per i file etichettati `?v=`.
- [~] **Tutorial PDF per gli admin (D090)**: versione testuale fatta (D098, `~/Claude/fanta-athletic-backups/03-documenti-admin/`); da aggiornare con gli screenshot a schermate definitive.
- [x] **Pubblicazione del sito + GitHub fatte il 25/09/2026 (D103, D106).** Da qui: commit e deploy separati, su conferma. La copia del 19/09 è già fuori dal progetto (D101); `backups-firestore/` è escluso da Git e da `firebase.json`.

**Note tecniche emerse (non urgenti):**
- [ ] Restyling: `admin-calendario.html` su telefono a due colonne strette; ovale "Campionato H2H" in `calendario.html` (D102).
- [x] `calendario-athletic.html`: stagione collegata alla lega e pagina nel menu ☰ (D098).
- [x] `live.html` crea la partita solo al primo dato segnato (D102).
- [ ] Le regole "ripetibili" (gol, ammonizioni…) sono scritte in due posti: `matchday.html` (REPEATABLE_*) e `resources/live-core.js`. Se si cambiano, cambiarle in entrambi (meglio: un file condiviso, quando si tocca `matchday.html`).
- [ ] Regola "Convocazione" doppia nel catalogo (due documenti R099): innocuo (si usa quello con `soggetto`), da pulire da `admin-rules.html`.
- [ ] Nella G3 2025/26 i convocati hanno preso +2 (R099 + vecchio `__convocato`): dato storico già archiviato, lasciato com'è (D093).
- [ ] Tema scuro: una regola generale di `sheet.css` ricolora di grigio tutti i pulsanti senza classe `.btn`; sulle pagine nuove è neutralizzata, sulle vecchie può spiegare pulsanti "spenti". Da rivedere nel restyling (D084).

**Chiusi in questa fase:**
- [x] Regola archivio pubblicata e **stagione 2025/26 archiviata e verificata** campo per campo (D089).
- [x] Backup completo del database su disco (D088): `backups-firestore/` + `~/Claude/fanta-athletic-backups/02-database/`.

**In coda (dopo la Fase 3):** restyling generale "da app" (D084), velocità (D066), sfarfallio banner (D063), notifiche push (D082).

# Punti aperti — da riprendere

Checklist viva (a differenza di `DECISION_LOG.md`, che è uno storico e non
si riscrive): quando un punto si chiude, spostarlo in fondo con la data e
il riferimento alla decisione che lo chiude, non cancellarlo.

**Contesto importante (aggiornato D086/D089)**: non c'è una stagione in
corso. La stagione passata è la **2025/26** (dati della squadra "Curva
gonfi", giornata 21, ecc.), già **archiviata e verificata** (D089); la
prossima è la **2026/27**, che apriranno gli admin prima dell'asta di
ottobre. Il piano completo, in ordine, è in cima a `CLAUDE.md`.

**Fase 1 (revisione/bugfix) chiusa davvero al 100% il 2026-09-20
(D037).** Testate tutte le pagine attive tranne il cluster giochi (in
pausa, D004), incluse le 3 azioni Firebase (chiuse e verificate
funzionanti, D037). Fase 2 (redesign) fatta in gran parte; **ora Fase 3**
(D085), vedi la lista in cima.

## Da decidere con l'utente (Iacopo)

- [ ] **Notifiche push vere per "voto aperto" (D082)**: possibili con
      Firebase Cloud Messaging; mancano SDK, chiave VAPID, salvataggio
      token e un mittente programmato (Cloud Functions su piano Blaze, o
      GitHub Actions con chiave di servizio, o OneSignal). Su iPhone solo
      con app aggiunta alla Home. Da scegliere la strada.
- [ ] **Banner/logo che "sfarfallano" per un istante ad ogni cambio
      pagina prima di assestarsi** (segnalato dall'utente il
      2026-09-21, indagato in D063, causa analizzata più a fondo in
      D066): lo stile corretto del banner su telefono (e lo scambio
      logo↔hamburger ☰) dipendono da script che aspettano il segnale
      del browser "pagina pronta" (`DOMContentLoaded`), che scatta solo
      dopo che tutto il contenuto e tutti gli script della pagina sono
      stati letti. **Il pezzo più pesante di quell'attesa (Firebase
      dalla CDN esterna) è già stato tolto (D066)** — resta da vedere
      se lo sfarfallio è ancora percepibile con questo miglioramento, o
      se serve ancora l'intervento più strutturale (CSS puro per lo
      stile mobile del banner, invece di una classe aggiunta da uno
      script). Da riverificare quando si riprende questo punto.
- [ ] **Due interventi più grandi per alleggerire ulteriormente il
      caricamento, individuati in D066 ma non eseguiti** (l'utente ha
      scelto di fermarsi dopo il fix Firebase→locale, 2026-09-23):
      1. Unire i ~20 file JS/CSS separati di ogni pagina in pochi
         bundle — riduce il numero di richieste di rete, ma richiede
         attenzione all'ordine di esecuzione degli script.
      2. Passare dalla versione "compat" di Firebase (~550KB) a quella
         "modulare" moderna, molto più leggera — richiede riscrivere il
         modo in cui tutto il codice parla con Firebase
         (`firebase.auth()`/`firebase.firestore()` usati ovunque),
         cambiamento ampio e rischioso, da fare con test estesi.
- [ ] **Pagine di stato ancora incerto** (elenco completo in
      `docs/AUDIT_INIZIALE_2026-09-19.md`): `giornata-calcolata-popup.html`,
      `results-h2h-modal.html` — mai aperte perché sembrano componenti
      dinamici (popup/modal), non pagine a sé; verificare come/se vengono
      richiamate prima di decidere. Tutte le altre pagine "di stato
      incerto" segnalate nell'audit iniziale sono state testate in questa
      sessione e risultano pulite.
- [ ] **Discrepanza foto giocatori**: `admin-cards-manager.html` mostra
      "0 con foto" su 30/32 giocatori, `test-foto-live.html` (dopo la
      correzione D035) ne mostra 2 con foto — probabile differenza tra
      lista statica JSON e dati reali completi di Firestore. Da chiarire
      quando si riprende il lavoro sulle foto (Fase 3).
- [ ] **"Nome sconosciuto"** mostrato per i giocatori in
      `test-foto-live.html` — probabile altro caso di nome di campo
      diverso da quello atteso (come `ruolo`/`role`, D023), non
      approfondito per bassa priorità.
- [ ] Valutare se e quando inizializzare un repository git **locale** (solo
      per avere una cronologia delle modifiche, non collegato a GitHub) al
      posto delle copie di backup manuali.
- [ ] Decidere quando e come procedere con l'allineamento a GitHub (D002):
      resta sospeso finché non tutto è verificato e testato.
- [x] (fatto D101, spostata in `~/Claude/fanta-athletic-backups/01-codice/`) **⚠️ PRIMA DI QUALUNQUE COMMIT GIT**: rimuovere/spostare fuori dalla
      cartella del progetto `fanta-athletic-code-BACKUP-2026-09-19/`
      (D021) — è già esclusa via `.gitignore` come rete di sicurezza, ma
      va comunque tolta fisicamente per tenere la cartella pulita.
      Lasciata lì di proposito il 2026-09-20, in attesa che l'utente la
      sposti quando preferisce.
- [ ] Segnalare agli altri 2 admin storici della lega il campo malformato
      `"enabled: true"` nei loro documenti admin (D026) — innocuo, solo da
      sistemare quando capita di sentirli.
- [ ] **Bug preesistente trovato per caso in `index.html`** (D040, non
      collegato al redesign): un blocco CSS per una colonna pubblicitaria
      laterale (`@media (min-width: 1200px)`) è annidato per errore
      dentro un blocco per schermi piccoli (`@media (max-width: 600px)`)
      — le due condizioni non possono mai essere vere insieme, quindi
      quella colonna non si attiva mai. Bassa priorità, probabile
      funzione pubblicitaria mai attivata.
- [ ] **Le 3 pagine legali senza menu hamburger su telefono** (trovato
      per caso in D061): `privacy.html`, `terms.html`,
      `cookie-policy.html` non caricano `mobile-detect.js`/
      `mobile-menu.js` come tutte le altre pagine — su schermo stretto
      l'intestazione resta tutta su una riga (logo, titolo, badge,
      campanella, profilo) e il titolo tronca più del necessario.
      Basso impatto (pagine lette raramente), da sistemare aggiungendo i
      due script mancanti quando si riprende la coerenza generale.
- [ ] **20 delle 34 pagine "minori" corrette in D061 non ricontrollate
      con uno screenshot diretto** (solo per pattern, stesso file CSS
      già provato su 14 pagine molto diverse) — elenco completo in
      `docs/DECISION_LOG.md` D061. Se aprendo una di queste emerge
      qualcosa di strano nel banner in alto, segnalarlo.

## Piano generale, fase per fase (dettaglio in CLAUDE.md)

**Fase 1 — Revisione/bugfix**: ✅ **chiusa davvero al 100%** il
2026-09-20 (D037), dopo pulizia cartelle D008-D022, primo test login
D023-D024, test completo di tutte le pagine D028-D035, e le 3 azioni
Firebase Console (2 regole + 1 indice) fatte e verificate funzionanti
(D037). Nessuna azione rimasta in sospeso.

**Fase 2 — Redesign grafico**: fatta in gran parte, rifiniture rimandate a dopo la Fase 3 (D085) (dal 2026-09-20,
D036/D037), per esplicita richiesta dell'utente: prima il design, poi le
modifiche strutturali della Fase 3 sotto.
- [x] **Font cambiato** da quello di sistema a Inter, in
      `resources/sheet.css` — si riflette su 54/74 pagine attive.
      Verificato senza errori, desktop e mobile (D039).
- [x] **Tab lega doppione, angoli e spaziatura** corretti in
      `resources/navbar.js` e `resources/league-selector.js` (file
      condivisi, si vede su quasi tutte le pagine) — dettaglio in
      `docs/DECISION_LOG.md` D040.
- [x] **Sfondo intermedio dietro al tab lega** rimosso, e **forma
      unificata a "pillola"** su tutti i pulsanti/menu condivisi
      (`.btn`, `.btn-detail`, `.tab`, `.chip`, `.role-count`,
      `.bottom-nav-item`, `.hamburger-btn`) — dettaglio in
      `docs/DECISION_LOG.md` D041.
- [ ] **Da confermare con l'utente**: i pannelli dei menu a tendina
      (es. apertura del tab lega) sono stati lasciati con
      l'arrotondamento attuale (12px), non a pillola — categoria diversa
      da un pulsante/tab. Chiedere se vanno inclusi anche quelli.
- [x] **Colori unificati sotto rosso/blu Athletic 2018** (D045, D046):
      colori ufficiali campionati dal logo (rosso `#920100`, navy
      `#0c0f6d`), sostituite 268 occorrenze di colori decorativi "fuori
      standard" su 34 pagine + 8 file condivisi. **Piaciuto molto
      all'utente.**
- [x] **Verdi unificati al colore del campo da calcio** (D047):
      `#16a34a`/`#15803d` presi da `.pitch` in `formazioni.html`,
      sostituiti 6 verdi diversi su 24 file. Pulsante "Pubblica come
      squadra" in `bacheca.html` cambiato da blu a verde.
- [x] **Tendine di `squadre.html` allineate** allo stile "a pillola" del
      tab lega (D047) — regola condivisa in `sheet.css`, effetto anche
      sulle altre 12 pagine che usano `select`/`.input`.
- [x] **Sfumature di rosso/blu allineate al brand** (D048): toast
      errore/info, pulsanti "elimina" fuori standard, un pulsante
      primario in `admin-calendario.html` — 136 sostituzioni su 32 file.
- [x] **Oro/giallo unificato** (D048): preso il colore del bordo
      "capitano" (`#facc15`/`#fde047`) e sostituiti tutti gli altri
      gialli/oro trovati (podio, avvisi, successi) — 57 occorrenze su
      24 file.
- [x] **Icone barra di navigazione colorate** (D048): erano immagini
      PNG nere non colorabili via CSS — ricolorate (grigio-blu normale,
      rosso brand quando la sezione è attiva).
- [x] **Bug di contrasto in "Top giocatori settimana" risolto** (D048):
      in tema scuro le prime 3 card (oro/argento/bronzo) perdevano lo
      sfondo chiaro ma mantenevano il testo scuro, quasi illeggibili —
      corretto escludendole dalla regola generica del tema scuro.
- [x] **Scala tipografica unica per tutta l'app** (D049): prima non
      esisteva nessuna regola condivisa per i titoli (andavano da 14px a
      48px). Definita in `sheet.css` una scala proporzionata al testo e
      riallineati 14 titoli "fuori scala" su 10 pagine.
- [x] **Form bacheca** (D049): font del box messaggi allineato all'app
      (le textarea non ereditano il font di default), pulsante verde
      centrato, emoji tolta dal pulsante "Pubblica", misure dei pulsanti
      uniformate.
- [x] **Le 3 pagine con foglio di stile separato allineate** (D050):
      usavano le variabili di colore senza caricare il file che le
      definisce. Creato `resources/theme-tokens.css` (solo colori e
      font, nessuna impaginazione) — unico posto dove vivono i colori,
      importato da `sheet.css` e caricato direttamente da queste 3
      pagine. Risolto anche un bug preesistente: il "VS" ruotato che
      sbordava sugli stemmi su schermo stretto.
- [x] **Menu, icone oro, emoji, navigazione** (D051): menu con
      gradiente e titolo curato, icona luna disegnata per il tema, tutte
      e 14 le icone in oro, 240 emoji "da chat" rimosse da titoli e
      pulsanti (mantenute dove sono contenuto), titoli dei riquadri
      leggibili in tema scuro, scritta bianca sulla barra attiva.
      Navigazione: nessun link rotto su 54 pagine, e 4 vicoli ciechi
      risolti (fra cui `404.html`, riscritta da zero).
- [x] **Versioni cache unificate** (D051): tutti i 540 riferimenti ai
      file condivisi usano ora la stessa etichetta `?v=20260920-final`.
- [ ] **Ancora da decidere**: giallo/ambra per "Salva Live"
      (`matchday.html`) e "Attenzione" (`cache-buster.html`) — sembrano
      scelte intenzionali (stato "in corso"/avviso), non necessariamente
      da cambiare. Rosa pastello (D046) ancora da decidere se toccare.
- [ ] **Reference**: Instagram ufficiale della squadra
      (`https://www.instagram.com/athletic.2018/`), utile in futuro
      (es. foto giocatori, D025).
- [x] **Swipe dal bordo sinistro riassegnato al menu** (D067,
      2026-09-23): non apre più il "indietro" del browser, apre il menu
      ☰ — verificato via eventi touch simulati, **da riprovare su un
      telefono vero** appena possibile per calibrare la sensibilità
      (24px di zona di partenza, 60px di soglia, in
      `resources/edge-swipe-menu.js`).
- [ ] **"Meno scorrimento lungo pagina, più interazione a click/sezioni"**
      (resta aperto, non affrontato in D067): l'utente vorrebbe in
      generale un'app che si senta meno "pagina lunga da scorrere" e
      più "sezioni cliccabili" — tema di design più ampio, da valutare
      insieme quando si riprende questo filone, non ha una soluzione
      meccanica come lo swipe.
- [ ] **Una decina di pagine admin/debug con lo stesso problema dei 4
      "vicoli ciechi" chiusi in D067** (setup, debug, strumenti
      one-off usati raramente solo dall'utente/amico): non hanno menu
      ☰/barra in basso/link home. Priorità bassa, non toccate.
- [x] **Causa vera dei "non vedo modifiche" trovata e risolta** (D042,
      D043, D044 — 3 cause concatenate, tutte diverse): (1) il server di
      prova non mandava header anti-cache → sostituito con
      `.claude/no-cache-server.py`; (2) `resources/app-init.js` caricava
      una seconda copia di `league-selector.js` con versione mai
      aggiornata → corretto; (3) pagine visitate a inizio sessione
      restavano "congelate" nella cache del browser da prima del fix (1)
      → risolto cambiando la porta del server (8899 → 8912), che
      azzera ogni cache pregressa. Verificato su home/squadre/bacheca
      con controlli automatici, non solo a occhio. Da questo momento:
      dopo ogni modifica visiva della Fase 2, il server va
      fermato/riavviato e la pagina ricaricata prima di mostrarla
      all'utente, **verificando la correzione su più pagine diverse**,
      non solo una — non deve più pensarci l'utente.

- [x] **Titoli di intestazione unificati su tutte le pagine, badge
      stagione a destra** (D059, 2026-09-21): stile unico (più grande,
      grassetto) per tutti i titoli, badge "2025/2026" restilizzato con
      bordo dorato e sempre raggruppato a destra insieme a eventuali
      altri badge (es. "Nessuna squadra"), qualunque sia il loro numero.
- [x] **Banner "Squadre" più sottile delle altre pagine, causa vera
      trovata e corretta** (D060-D062, 2026-09-21): non bastava
      allineare i fogli di stile condivisi (fatto comunque su altre 34
      pagine minori, D061) — la causa reale era una riga scritta apposta
      dentro `squadre.html` per il campo a tutto schermo su mobile, che
      per errore azzerava anche lo spazio verticale condiviso
      dell'header. Verificato pixel per pixel che ora
      Home/Formazioni/Squadre/Classifiche/Bacheca sono identiche,
      confermato anche dall'utente.

**Cosa resta aperto nella Fase 2** (al 2026-09-20, fine giornata):
- [ ] **Emoji nei contenuti**: tolte da titoli e pulsanti, restano dove
      sono contenuto (reazioni bacheca, pannello emoji, podio) e in
      qualche testo descrittivo dentro le pagine admin. Da decidere se
      spingersi oltre.
- [ ] **Comportamento "da app" su mobile**: lo swipe dal bordo è stato
      risolto (D067, voce sopra). Resta aperto il tema più grosso
      "meno scorrimento lungo pagina, più sezioni a click" (voce
      sopra).
- [ ] **Pannelli dei menu a tendina**: restano con arrotondamento 12px,
      non "a pillola" (voce già sopra, da confermare).

**Fase 3 — Nuove funzioni**: non ancora iniziata, in attesa che finisca
la Fase 2. Cose già individuate da includerci:
- [ ] **Foto giocatori mancanti**: da integrare, con uno stile uniforme
      per tutti i giocatori, ispirato alle vere app di fantacalcio
      (vedi anche la discrepanza sui numeri, sopra).
- [ ] **Lista di richieste dei 2 admin storici della lega — ricevuta il
      2026-09-20 (D038)**:
      1. Interfaccia di "betting" fittizio sul risultato della partita,
         con sondaggio vittoria/pareggio/sconfitta — **da chiarire con
         gli admin** se è un'evoluzione/sostituzione di `contest.html`
         (che già esiste ma indovina il risultato esatto, meccanica
         diversa) o una funzione separata.
      2. Pannello admin per inserire bonus/malus — **verificare prima**
         che non sia già coperto da `admin-rules.html` (catalogo
         bonus/malus) + `matchday.html` (applicazione per
         giocatore/giornata, già nel codice); potrebbe essere solo
         un'interfaccia diversa da quella attuale.
      3. Bonus e malus da modificare rispetto all'elenco attuale (le
         101 regole già in Firestore) — serve il dettaglio di cosa
         cambiare, non ancora ricevuto.
      4. Scontri diretti tra squadre, "più stile fantacalcio che Fanta
         Sanremo" — **verificare prima** che non si sovrapponga alla
         funzione "Scontri Diretti" già esistente
         (`h2h-standings.html` + collezioni `h2h_schedule`/
         `h2h_results`); da chiarire con gli admin se vogliono
         sostituirla/ridisegnarla o è un meccanismo diverso.
      5. Aggiornamento lista giocatori (cessioni, nuovi ingressi) —
         aggiornamento dati, collegato naturalmente alla Fase 4, ma
         valutabile anche prima se gli admin lo vogliono.
      Dettaglio completo in `docs/DECISION_LOG.md` D038.
- [ ] **Ricostruire per bene le 3 funzioni di `admin-squadre.html`**
      (archiviata in D034, non solo corretta al volo perché richiede
      lavoro vero): cambiare il numero di squadre, rigenerare il
      calendario degli scontri, resettare la competizione — tutte e tre
      da ricollegare al database reale, capendo prima l'algoritmo di
      generazione del calendario e mappando con certezza cosa tocca un
      reset completo.
- [ ] **7 file JS "ampliamento Leghe Fantacalcio concorrente"** (D014,
      D018): achievement/badge, scambi giocatori, foto giocatori,
      calcolo bonus difesa, controllo versione app — scritti per intero
      ma mai collegati a nessuna pagina, erano l'inizio di un progetto
      per rendere l'app concorrente di "Leghe Fantacalcio". Restano in
      `archive/resources-orfani/`, da riprendere qui se si vuole.
- [ ] **Revisione più ampia di giocatori/ruoli/squadre** (D023): il caso
      di Jacopo Pinzauti era solo il primo di probabili altre incoerenze
      dati da sistemare prima della stagione nuova.
- [ ] **Funzionalità Coppa** (`admin-cup.html`, ancora "in sviluppo") e
      relativa regola Firestore mancante per `cup_schedule`/`cup_rounds`
      (D035, bassa priorità finché la funzione stessa non è pronta).
- [ ] **Layout desktop da rivedere**: il redesign si è concentrato finora
      su mobile (l'uso reale prevalente). Aprendo l'app da un browser
      desktop a schermo largo, l'impaginazione risulta poco curata in
      più punti — non un bug singolo da correggere al volo, ma un
      lavoro a sé da valutare in Fase 3. Segnalato dall'utente il
      2026-09-20 (D054), non prioritario per ora.
- [ ] **Nessun vincolo di ruolo per lo slot "portiere"**: il gioco
      accetta oggi qualunque ruolo in quello slot (disegnato come una
      porta), controllando solo il totale della squadra (almeno 1
      Difensore, 1 Centrocampista, 1 Attaccante — i Portieri contano
      come Difensori). Notato dall'utente il 2026-09-21 vedendo un
      Centrocampista (Santo) piazzato in porta in una formazione reale
      della stagione passata. Non è un bug introdotto oggi, è così da
      sempre. Da valutare in Fase 3 se aggiungere il vincolo (implica
      rivedere le formazioni già salvate).
- [ ] **Trascinamento col dito su mobile** in `squadre.html`/
      `formazioni.html`: oggi esiste solo con il mouse su desktop. Sul
      telefono si usa "tocca poi tocca"/popup perché il drag-and-drop
      standard dei browser non supporta bene il touch — farlo funzionare
      col dito è una funzione nuova da costruire, non un recupero
      (D053), richiesta dall'utente il 2026-09-20.
- [x] **Allineamento locale ↔ sito online, prima di ogni pubblicazione
      futura (D053)** — **CHIUSO DAVVERO** il 2026-09-21 (D058): confronto
      sistematico completato su tutte le 74 pagine attive, e recuperato
      tutto quello che era rimasto vivo solo su Firebase:
      `formazioni.html` (panchina a 2 colonne su mobile),
      `squadre.html` (popup scelta giocatore, campo, panchina,
      pulsante "Invita Vice-Allenatori"), `classifiche.html` (filtri,
      ordinamento, vista compatta/estesa, intera scheda "Classifica
      Giocatori" prima assente). Ricontrollate anche le altre due pagine
      con differenze mai analizzate a fondo (`matchday.html`,
      `lineup-summary.html`, D058): nessun contenuto mancante, solo
      codice condiviso duplicato. Nessuna azione rimasta in sospeso su
      questo fronte. Da qui in avanti lo sviluppo avviene
      solo in locale → Git; Firebase resta solo "parte web", non si
      tocca mai più direttamente (deciso con l'utente).

**Fase 4 — Nuova stagione**: inserire giocatori corretti, squadre
corrette, impostare la stagione e far ripartire il campionato. Non prima
di aver completato le fasi 2-3.

## Progetti "in pausa", non legati alle fasi sopra (D004, D020)

- **Multileghe**: l'amico dice "funziona ed era già testato" (D018), ma
  questo **non coincide** con quanto risultava dai documenti storici del
  progetto (migrazione query ferma a 0/31 pagine core secondo
  `STATO_SITO.md`). Secondo caso in sessione (dopo `admin-leghe.html`,
  D005) in cui il ricordo dell'amico e la documentazione/il codice non
  coincidono. Non prioritario, ma se si riprende: **verifica pratica
  prima di tutto** (creare una seconda lega di test), non fidarsi della
  sola parola.
- **Cluster mini-gioco di carte** (`games-hub.html` + famiglia `wirc-*` +
  `athletic-manager.html` + altri, 20 file, tutti in root, non toccati):
  funzionante solo in parte — 5 delle 20 pagine richiamano script locali
  mai esistiti, quindi già rotte a prescindere. Le altre 15 sembrano
  autosufficienti ma non testate cliccando dentro il gioco. Tentativo di
  archiviarlo il 2026-09-20 annullato (D021): gli script di navigazione
  condivisi assumono che ogni pagina sia in root, spostarle romperebbe
  quei meccanismi. **Resta in root, invariato.**

## Note raccolte dall'amico sviluppatore (2026-09-20, D018)

- **Backup Firestore**: lanciati manualmente, una volta all'anno a inizio
  stagione. Da tenere presente: se durante la stagione cambia molto,
  l'ultimo backup utile potrebbe essere vecchio di mesi.
- **Sicurezza invito lega (D007)**: rischio accettato per ora da amico e
  utente, non prioritario finché il multileghe non si apre a persone
  esterne.

## Tutto il resto, già chiuso (per riferimento, non richiede più azione)

- [x] Escalation admin via `set-admin.html`/`set-first-admin.html` —
      verificato NON sfruttabile, regole Firestore corrette (D003/D007).
- [x] Versione Firebase disallineata in `admin-calendario.html`,
      `contest.html`, `contest-leaderboard.html`, `join-team.html` (D012,
      D016).
- [x] Link a `resources/theme.css` mai esistito, 3 pagine (D012).
- [x] `admin-squadre.html`: crash corretto (D016), poi archiviata del
      tutto per uso di dati finti (D034).
- [x] Residuo di debug nel titolo di `squadre.html` (D015).
- [x] `formazioni-basket.html`/`formazioni-volley.html` archiviate, via
      libera dell'amico confermato (D019).
- [x] Episodio backup: nessuna perdita di dati reale (D021).
- [x] Controllo finale completo di sessione, diario riordinato
      cronologicamente (D022).
- [x] Bug vero del primo login reale: `squadre.html`/home mostravano
      sempre la squadra sbagliata di default — 4 cause concatenate,
      tutte corrette e verificate (D023, D024).
- [x] `squadre.html` andava in crash per un giocatore con ruolo in
      formato inatteso (Jacopo Pinzauti) — reso il codice difensivo
      (D023), poi corretto anche il dato con un account admin (D027).
- [x] **L'utente è admin** (D026), riconosciuto correttamente dall'app.
- [x] Link rotto "Gestione Giornate" nell'hub admin → `matchday.html`
      (D028).
- [x] Regola Firestore mancante per `athletic_calendar`, bloccava
      `admin-calendario.html` per chiunque — regola aggiunta dall'utente
      in Console Firebase, verificata (D030, D033).
- [x] Codifica sbagliata (accenti storpiati) in `admin-deadline.html`,
      `admin-teams.html`, `admin-users.html` — corretta e verificata
      (D031, D032). Alcune emoji restano perse in origine, cosmetico,
      non recuperabile con una ricodifica.
- [x] `admin-squadre.html` (dati finti) archiviata, hub admin ripuntato
      su `admin-teams.html` (dati veri) — D034.
- [x] `ensureLeagueReady` non definita in `statistiche.html` — corretto
      con lo stesso script condiviso usato altrove (D035).
- [x] Ricorsione infinita ("Maximum call stack size exceeded") in
      `admin-leghe.html` per una funzione locale con lo stesso nome di
      una condivisa — funzione locale rimossa (D035).
- [x] `test-foto-live.html` non caricava mai la libreria di
      autenticazione Firebase, ogni lettura falliva per permessi —
      script aggiunto, verificato cliccando davvero il bottone di test
      (D035).
- [x] `adsense-verification.html` andava in crash per lo stesso tipo di
      problema (mancava Firestore invece di auth) — script aggiunto
      (D035).
- [x] Giro di test completo su tutte le pagine rimanenti (utente, admin,
      strumenti, pagine legali/statiche) — concluso, esito e dettaglio
      completo in `docs/DECISION_LOG.md` D035.
- [x] Fase 1 (revisione/bugfix) chiusa ufficialmente dall'utente,
      2026-09-20 (D036) — si passa alla Fase 2 (redesign grafico).
- [x] **Regola Firestore per `contest`** (matches/scores/predictions) —
      pubblicata dall'utente, verificata funzionante su `contest.html`
      (D037).
- [x] **Regola Firestore per `auction`** (current/bids) — pubblicata
      dall'utente, verificata funzionante su `asta.html`, zero errori
      "Auction listener error" (D037).
- [x] **Indice composito per `notifications`** (userId + createdAt) —
      creato dall'utente, stato "Abilitato" (D037).
- [x] **Bug nuovo in `contest.html`**, emerso solo dopo aver sbloccato i
      permessi sopra: leggeva `match.date` aspettandosi un'unica
      stringa "22 Ottobre", ma `athletic_calendar` salva giorno e mese
      in due campi separati (`date`, `month`) e l'ora senza minuti —
      corretto e verificato, il menu "Seleziona Giornata" ora si popola
      da G1 a G24 (D037).
- [x] **Doppio footer**, in realtà presente su 12 pagine non solo
      `bacheca.html`: footer manuale rimosso ovunque, script condiviso
      aggiunto alle 9 pagine che ne erano prive, aggiunto credito
      "Created by Nicola Mocci", corretto un rosso illeggibile in tema
      scuro (D052).
- [x] **3 varianti di `showToast` diverse tra loro**
      (`admin-leghe.html`, `admin-rules.html`, `bacheca.html`, D013):
      uniformate allo stile più completo già in uso (icone, colori di
      marca, adattamento tema scuro) — verificato chiaro/scuro/tutti i
      tipi su tutte e tre, zero errori (D065, 2026-09-22).
