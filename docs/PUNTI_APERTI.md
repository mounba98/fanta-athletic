Allineato a: D125

# Stagione 2026/27 in corso — cosa manca, in ordine (stato al 24/10/2026, D124)

**▶ PROSSIMA SESSIONE (D124) — in quest'ordine:**
1. **Dopo il calcolo della G1** (26–27/10): controllare che gli esiti delle sfide (pareggio entro 2 punti), la classifica Scontri, la Supremo, il riquadro "La mia sfida" e la pagina della sfida escano giusti con i dati veri.
2. **Prima del calcolo della G2** (2/11): riprovare in sola lettura la regola "formazione precedente" (D124 punto 8) con le formazioni G1 vere, squadra per squadra.
3. **Ricollegare gli utenti** con la lista squadre che gli admin stanno raccogliendo (D123: colleghiamo per nome, le email solo per chi resta): `team_index` come fa Verifica squadre; prima prova a vuoto, copia, scrittura, verifica. Controllare chi ha già scelto da solo. Elenco dei 18 senza squadra e delle 9 squadre senza utenti in DECISION_LOG D123.
4. **Foto giocatori nello stile nuovo** (l'utente le manda, con il nome di ciascuno): 450 px, `resources/players/{id}.jpg` (Diana già lì, `P026.jpg`, da alleggerire), pubblicare, **poi** `image_url` nel database; controllare il Riepilogo formazioni (legge le foto vecchie dallo Storage).
5. **Console Firebase › Authentication**: l'utente cancella i 6 accessi di prova (elenco sotto, "Da decidere con gli admin"), con Claude che guida.
6. **Prove sul telefono vero** (sezione "Dopo l'asta" sotto) e bug segnalati dopo la G1.
7. **Sessione dedicata velocità** (interventi grossi, sotto), poi **notifiche push**.


**⚠️ SICUREZZA, URGENTE (D101)**
- [ ] Nel ramo GitHub `feature/uniform-pitch-bench` c'è `fanta-athletic-firebase-adminsdk.json` (chiave di servizio admin di Firebase, dal nome). **Mocci** (o chi ha i permessi sul progetto) deve **revocarla** in Google Cloud Console → IAM e amministrazione → Account di servizio → `firebase-adminsdk…` → Chiavi → elimina quella chiave (se qualche script la usa, crearne una nuova e tenerla SOLO in locale). Poi togliere il file dalla repository. Revocare è ciò che conta: il file resta comunque nella storia di Git.

**Fatto il 25/09 (D095–D106):** app 2026/27 online e su GitHub (D106). regola "Partita live" pubblicata e verificata; prova completa della Partita live con un solo admin superata; **stagione 2025/26 azzerata e 2026/27 aperta vuota** (backup pre-azzeramento su disco). Ora tocca agli admin compilarla dal percorso guidato.

**Prove ancora da fare (niente è stato provato "a metà": queste parti non sono mai state eseguite sul database vero):**
- [ ] **Partita live con DUE admin** (il percorso con un admin solo è provato, D095): serve la prima giornata della 2026/27 o una giornata di prova, poi pulizia (ora l'azzeramento non c'è più a pulire: togliere a mano `days`, `results`, `matchday_temp`, `live` della giornata di prova).
- [ ] **Calcolo giornata con i bonus di fazione** (D080) — mai salvato davvero.
- [ ] **Account non admin** (rimandato dall'utente, D114: serve un secondo telefono/account): scelta fazione/nome, tentativo di cambio fazione (deve fallire), eredità della fazione di squadra, voto nel mini-gioco.
- [ ] **Swipe dal bordo** su un telefono vero (D067).

**Fatto (D108–D111), pubblicato il 25/09 sera:** finestra allenatore, nuova Home, Archivio Athletic, selettore di lega nell'intestazione (cerchietto), titoli accorciati, glossario leghe.
- [ ] Home: la fascia "Adesso" è stata provata solo in simulazione; verificarla alla prima partita vera inserita nel Calendario Athletic.
- [ ] Archivio Athletic: il bilancio V-N-P compare solo quando gli admin inseriscono i risultati delle partite (2025/26: 1 su 21).

- [ ] Home, card "La mia squadra": seguire la competizione scelta (posizione/punti degli Scontri) — **da decidere quando gli admin accendono gli Scontri diretti** (D113).
- [ ] Swipe dal bordo: riprovare sul telefono vero dopo D113 (il gesto di sistema ha comunque la precedenza; nell'app installata su iPhone no).

**Da fare, nuova richiesta (D107):**
- [x] **Scelta allenatore obbligatoria per squadre senza allenatore (D108)**, regole e sito pubblicati., insieme alla tifoseria (Curva/Piana), come `faction-gate.js`. Oggi gli allenatori 2025/26 sono rimasti sulle squadre (l'azzeramento non li tocca) e la scelta in `squadre.html` compare solo per squadre senza allenatore. Decidere: azzerarli per la 2026/27 (+ aggiungerli all'azzeramento futuro), schermata obbligatoria, chi può cambiarlo dopo. Poi commit + pubblicazione.
- [x] Correzione D107 (admin → propria squadra in Formazioni/Squadre) committata e pubblicata il 25/09/2026.

**Asta 23/10/2026 — richieste degli admin (D121):**
- [x] "Curva" → "Tifo" nella pagina Regole (solo scritta; nel database resta `Curva`). Da decidere: "Tifo" anche in Calcolo giornata, Partita live, Classifiche.
- [x] Nascoste le voci "Per squadra – solo Curva/Piana" (nessuna regola le usa, verificato).
- [x] Giocatori "fuori rosa" (pulsante in Pannello › Giocatori; esclusi dall'elenco di Squadre). Fatti da Claude: Cecchi (chep), Roti (toti), Lupi Matteo (carlos), Nostri (Edo).
- [x] Imbattibilità automatica nel Calcolo giornata dal risultato del Calendario Athletic. Regola R104 creata da Claude. Admin: inserire sempre il risultato (Partita live o Calendario).
- [x] Doppione "jacopo_pinzauti" eliminato (mai usato; il vero è P002 "pinzo").
- [x] **Moduli 1-2-2, 2-2-1, 2-1-2, 3-1-1 con menu a tendina** in Formazioni (controllo anche in Squadre). Da riprovare con una rosa vera dopo l'asta, su telefono.
- [x] Risultato della partita inseribile dalla Partita live (serve per l'Imbattibilità).
- [x] R099 "Convocazione" rimessa tipologia Giocatore (serve alla live); R043 "Porta inviolata" ora +1.
- [x] Fogli live di prova G1: partita cancellata; i fogli si svuotano quando mounba e marta riaprono la live. Regola del database invariata (decisione dell'utente: le pulizie le facciamo noi dal codice).
- [x] PDF rifatti dall'utente il 23/10 alle 20:29 (guida admin 563.848 byte, presentazione 935.313 byte).

**▶ Dopo l'asta — prove sul telefono e prima giornata (D121–D122):**
- [ ] **Formazioni con una rosa vera, dal telefono** (moduli e caselle per ruolo provati solo con una rosa finta): scegliere il modulo, schierare con tocco/trascinamento/popup, cambiare modulo, salvare; anche dalla pagina Squadre.
- [ ] **Prove online dell'utente** delle funzioni nuove non legate all'asta (riquadro risultato nella Partita live, Regole, fuori rosa, menu Modulo): raccogliere i bug segnalati.
- [ ] **Aggiornamento automatico alla riapertura** (D120, `app-fresh.js`): la pubblicazione del 23/10 è la prima con il controllo già sui telefoni → verificare su iPhone e Android che riaprendo l'app si veda subito la versione nuova.
- [ ] **Prima giornata vera con la Partita live**: salvare il risultato prima di pubblicare e controllare che l'Imbattibilità arrivi ai giocatori (provata solo con risultati finti). Controllare anche che i fogli di prova di mounba e marta si siano svuotati alla loro riapertura.
- [ ] **Novità sul telefono (D122)**: dopo la prossima pubblicazione, verificare su iPhone e Android che Bacheca › Novità app mostri anche quella del 24/10 (prima il magazzino dell'app teneva ferma la prima copia di `news.json`).
- [ ] **Pannello dal telefono (D122)**: Regole e Giocatori a schede, Calendario admin rinnovato, margini uguali ovunque: guardarli sul telefono vero dopo la pubblicazione.
- [x] **Revisione velocità (24/10, D122)**: misurata; alleggerite le immagini (icone a 128 px, foto Trendiu a 450 px: comando lanciato dall'utente).
- [ ] **Velocità, interventi grossi (sessione dedicata, D122)**: unire i ~30 file di codice di ogni pagina in pochi pacchetti, Firebase modulare, squadre lette con una sola richiesta (oggi 19 in Formazioni/Squadre, più 19 per le formazioni salvate), sfarfallio del banner (D063); foto `tommy_guardu.png` (306 KB) da convertire in JPG (cambia il nome del file in 3 punti del codice).
- [ ] Etichette "New" scadono il **30/10**: dopo, toglierle dal codice (`index.html`, `admin.html`; lo segnala `check-coerenza.py`).

**Piccole cose notate il 23/10, non urgenti (D121):**
- [ ] Decidere se scrivere "Tifo" anche in Calcolo giornata, Partita live, Classifiche (oggi solo nella pagina Regole; nel database resta `Curva`).
- [ ] Nel Calcolo giornata aperto a mano "Convocazione" (R099) compare tra i bonus dei giocatori **e** c'è il tasto Convocati (+1): se un admin li spunta entrambi il giocatore prende +2 (era così anche a ottobre). Valutare di nascondere R099 nel Calcolo giornata o avvisare.
- [ ] I giocatori **fuori rosa** compaiono ancora nella griglia Convocati della Partita live (non sono in nessuna rosa, quindi non danno punti a nessuno: è solo ingombro).
- [ ] La pagina Squadre salva la formazione senza il campo `modulo` (Formazioni lo ricava dai giocatori): va bene, ma se si usa Squadre per schierare il modulo scelto potrebbe non essere ricordato.
- [ ] `admin-rules.html`: al primo caricamento una volta ha mostrato 0 regole (ricaricando 97): probabile caricamento lento della lega, da osservare.

- [ ] Calendario admin (`admin-calendario.html`) senza intestazione con menu (come contest e calendario-athletic): si torna indietro col pulsante "← Pannello admin". Valutare se aggiungerla (D122).
- [ ] `user-profile-upload.html` non è collegata da nessuna pagina e ha emoji rovinate ("??"): da archiviare dopo un controllo dei riferimenti (D122).
- [ ] `results-h2h-modal.html` non è collegata da nessuna pagina e sul telefono sborda: da archiviare dopo un controllo dei riferimenti (D122).

**Da fare nell'app (dati, non codice):**
- [x] Create le 4 regole bonus (D120, 04/10): R100 presenza in casa +1, R101 in trasferta +2, R102 coro contro la Piana +2 (evento Curva Morello), R103 offese ai giocatori +2 (evento Piana). Viste nel Calcolo giornata › Fazioni.
- [x] Regole doppie R098/R099: al 23/10 ce n'è una sola per codice (sistemate dagli admin); R099 rimessa "Giocatore" (D121).
- [ ] Bacheca: provare in una lega di prova (di Mocci) che si vedano solo i suoi messaggi (D120; nella lega vera i 3 storici ci sono ancora, verificato).
- [x] PDF della guida admin rifatto (23/10, D121).
- [ ] Fazioni delle **16** squadre (D122): le hanno le 6 che continuano con le stesse persone (Fanta Dirigenti, Curva gonfi, Shœrty Team, Gli ArraPATO, Minis Blortzos; Pettegole no); le nuove la scelgono i giocatori al primo accesso o gli admin da `admin-fazioni.html`.
- [x] **Stagione 2026/27 avviata** (24/10, D122): rose inserite, 16 squadre, stato "In corso". Restano il calendario completo e il ricollegamento degli utenti (sotto).
- [x] Giocatore senza nome (id `c4fyWntWj1mTj4fekijO`): sistemato dagli admin, ora è Guglielmo Cesari (verificato il 23/10, D121).
- [ ] Dire agli admin: la "sconfitta a tavolino" degli scontri diretti ora funziona davvero (prima falliva sempre, D095).

**Da decidere con gli admin:**
- [x] **Regole "Civi in porta"** (R071, R095): spente il 24/10 (D123), si riaccendono se Civi torna in rosa.
- [x] **Lorenzo Diana (P026) è anche portiere?** No, centrocampista: tolto dalle regole da portiere e dal ruolo secondario (D123). Era:: ha ereditato da Civi il ruolo secondario Portiere e le regole da portiere R043 Porta inviolata, R044 Rigore parato, R045 Parata decisiva, R072 Gol subiti (giocatori P001, P002, P026). Se non lo è, togliere P026 da quelle regole e il ruolo secondario.
- [ ] **Consiglio agli admin per il futuro** (D123): un giocatore nuovo va creato nuovo in Pannello › Giocatori, non scritto sopra uno vecchio; a stagione in corso i punti già fatti passerebbero al nuovo nome (l'Albo d'oro invece è al sicuro). Valutare un avviso nella pagina Giocatori quando si cambia il nome di uno esistente.
- [ ] **Foto giocatori nello stile nuovo** (D123): l'utente le manda tutte (Diana già arrivata, `resources/players/P026.jpg`). Poi: 450 px, file in `resources/players/{id}.jpg`, pubblicare, **solo dopo** scrivere `image_url` nel database; controllare che Riepilogo formazioni (`player-photo-loader.js`, legge lo Storage con le foto vecchie) preferisca la foto nuova. Regole Storage: caricare è bloccato anche agli admin, copia locale da recuperare (`docs/FIREBASE_ALLINEAMENTO.md`).
- [ ] **Console Firebase › Authentication: cancellare 6 accessi** (D123, lo fa l'utente quando ha tempo): a@a.com, test@gmail.com, sfssd@gmail.com, sdsfsdfsdfsfsss@gmail.com, asad@a.com e l'accesso senza email con id `xx5Aa02vdjXz07MMuf1ZyejOZOG2` (doppione di Sissiana). I loro dati nell'app sono già tolti (copia in `backups-firestore/account-prova-D123-2026-10-24.json`).
- [ ] Copia di sicurezza nel database `leagues/{lega}/config/backup-squadre-20261024` (squadre di prima, loghi compresi; email tolte perché leggibile dai membri della lega): cancellarla quando il ricollegamento è finito e nessuno ha segnalato problemi (D122).
- [ ] **Messaggio sul gruppo (admin, D122)**: per ogni squadra il nome e tutti i partecipanti, ciascuno con l'**email con cui entra nell'app** (più email possono stare nella stessa squadra). Servirà a ricollegare i 21 utenti scollegati il 24/10. Scelta dell'utente: ognuno entra con la sua email e sceglie la squadra da solo; con la lista colleghiamo prima noi il più possibile, così le scelte a mano restano poche (gli admin correggono da Verifica squadre).
- [x] **Foto dell'allenatore Mario**: arrivata e inserita (`resources/mario_athletic.jpg`, D123). Alleggerita a 450×600 px (84 KB).
- [x] **Lista giocatori: nomi nuovi confermati corretti e database + `players.json` riallineati (D123).** Vecchio testo: aggiornata dagli admin in Pannello › Giocatori (D123), Taruntoli = Guido. DA CONFERMARE con gli admin 8 giocatori il cui nome è cambiato in una persona diversa (P007, P013, P014, P015, P024, P026, P029, P030): giocatori sostituiti o nomi vecchi sbagliati? Poi allineare i campi vecchi `name`/`nome`/`cognome` a `nome_completo` (oggi l'app mostra `nome_completo`, alcune pagine leggono ancora `name`) e unire `soprannome` in `nickname`.** (D122): nome, cognome e soprannome di ognuno. Nel database i soprannomi sono pochi; manca il nome di battesimo di **Taruntoli**.
- [x] **Chiusura automatica delle formazioni: 1 ora prima** — nessuna obiezione degli admin, confermata in modo implicito (D123). (D122, scelta provvisoria dell'utente; si cambia in un punto solo, `BEFORE_MINUTES` in `resources/lineup-deadline.js`).
- [x] **Calendario Athletic da Tuttocampo (D123)**: scartato, lo aggiornano a mano gli admin. Analisi:: gli admin chiedono che si aggiorni da solo da Tuttocampo. Tuttocampo non ha un'API pubblica: serve un "postino" esterno (Cloud Function = piano Blaze, o GitHub Actions + chiave di servizio) che legga la pagina, fragile e forse contro i termini del sito; alternativa leggera: "incolla da Tuttocampo" in Calendario admin. Da decidere con l'utente, non prima della G1. **Calendario Athletic completo**: al 24/10 ci sono solo 4 partite (G1–G4). Gli admin lo completano man mano, oppure l'utente si fa mandare il calendario intero e lo inseriamo noi (D122). Serve anche per la chiusura automatica delle formazioni: una giornata senza partita resta aperta.
- [x] **Giornate degli scontri (D124)**: 20 + eventuali playoff/playout (admin). G1–G15 andata, G16–G20 ritorno parziale, spareggi con il ritorno; `numGiornate` = 20.
- [x] **Scontri diretti dalla G1**: impostati e calendario generato (D124). Da fare: **pubblicare prima del calcolo della G1**; dopo il calcolo controllare esiti e Supremo; **prima del calcolo della G2** riprovare in sola lettura la ricerca "formazione precedente" (D124 punto 8) con le formazioni G1 vere.: oggi **non sono predisposti** (stagione in modalità "classica", nessun calendario delle sfide). Se li vogliono subito: in Pannello › Stagione scegliere la modalità (solo scontri o entrambe), decidere i valori qui sotto e generare il calendario delle sfide con le 16 squadre **prima della G1**; altrimenti si possono accendere più avanti.
- [ ] **Scontri diretti (D087, logica pronta D100)**: decidere anche cosa vuol dire "formazione mancante" (oggi: nessun titolare; il vecchio codice: meno di 5). Dopo aver salvato i valori, se la stagione è già iniziata usare "Ricalcola tutti gli scontri" nelle Impostazioni. Mai provato sul database vero (generazione + giornata + ricalcolo). Resto del punto: soglie punti→gol adatte alla scala Fanta Athletic (5–30 punti a giornata; con 66/6 del fantacalcio finirebbe sempre 0-0), risultato a tavolino (oggi 3 a -10, scritto per punti), punti V/N/P; poi generare il calendario sfide con le squadre nuove. (3/1 fissi e numerazione già sistemati, D100.)

**Da fare a fine Fase 3:**
- [x] ~~Recuperare `firebase.json` / `.firebaserc`~~ **ricreati (D101)**; per pubblicare serve la Firebase CLI (Node.js non installato: da decidere). Vecchio: (configurazione Hosting, non presenti nella cartella, D099): servono per pubblicare. Chiederli all'amico o ricrearli; valutare lì intestazioni di cache lunghe per i file etichettati `?v=`.
- [x] **Novità dell'app** (D116, spostate in Bacheca D117): scheda **Novità app** in `bacheca.html#novita`, finestra all'apertura, casella in Home, collegamento da Notifiche; comunicati in `resources/news.json`, scritti da Claude a ogni aggiornamento.
- [ ] **Notifiche push** (D082; **in coda, decisione dell'utente 24/10, D122**): sessione dedicata dopo la revisione della velocità, con prove su due telefoni. Ricevere: permesso + token salvato (il service worker ha già il gestore `push`). Inviare in automatico: Cloud Functions → piano Firebase "a consumo" (Blaze, carta collegata, costo atteso ~0) da decidere con l'utente; in alternativa invio manuale degli admin dalla Console. Su iPhone solo con l'app sulla schermata Home (iOS 16.4+).
- [x] ~~Etichette "New" al 13/10~~ superato: scadenza spostata al 30/10 (D121).
- [x] **Guida per gli admin anche in app** (D115, `guida-admin.html`, fonte del PDF). Da tenere aggiornata a ogni modifica di una funzione admin.
- [x] **Guida PDF per gli admin**: versione 2 del 26/09 (D114, 12 pagine, con schemi disegnati di Home e tendina 🏆) in `~/Claude/fanta-athletic-backups/03-documenti-admin/`; la v1 in `versioni-precedenti/`. Screenshot veri dell'app: non fatti (servirebbero la cattura dello schermo, esclusa dalle regole di sicurezza, o foto dal telefono dell'utente).
- [x] **Pubblicazione del sito + GitHub fatte il 25/09/2026 (D103, D106).** Da qui: commit e deploy separati, su conferma. La copia del 19/09 è già fuori dal progetto (D101); `backups-firestore/` è escluso da Git e da `firebase.json`.

**Note tecniche emerse (non urgenti):**
- [ ] Restyling: ovale "Campionato H2H" in `calendario.html` (D102). (`admin-calendario.html` riallineata in D122.)
- [x] `calendario-athletic.html`: stagione collegata alla lega e pagina nel menu ☰ (D098).
- [x] `live.html` crea la partita solo al primo dato segnato (D102).
- [ ] Le regole "ripetibili" (gol, ammonizioni…) sono scritte in due posti: `matchday.html` (REPEATABLE_*) e `resources/live-core.js`. Se si cambiano, cambiarle in entrambi (meglio: un file condiviso, quando si tocca `matchday.html`).
- [ ] Regola "Convocazione" doppia nel catalogo (due documenti R099): innocuo (si usa quello con `soggetto`), da pulire da `admin-rules.html`.
- [ ] Nella G3 2025/26 i convocati hanno preso +2 (R099 + vecchio `__convocato`): dato storico già archiviato, lasciato com'è (D093).
- [ ] Tema scuro: una regola generale di `sheet.css` ricolora di grigio tutti i pulsanti senza classe `.btn`; sulle pagine nuove è neutralizzata, sulle vecchie può spiegare pulsanti "spenti". Da rivedere nel restyling (D084).

**Chiusi in questa fase:**
- [x] Regola archivio pubblicata e **stagione 2025/26 archiviata e verificata** campo per campo (D089).
- [x] Backup completo del database su disco (D088): `~/Claude/fanta-athletic-backups/02-database/` (la copia doppia dentro il progetto è stata tolta in D118; il server locale salva i backup nuovi direttamente lì).

**In coda:** restyling generale "da app" (D084). **Velocità (D066) e sfarfallio banner (D063)**: prima rimandati a fine stagione (D114); **il 24/10 l'utente ha chiesto una sessione dedicata a breve** (D122), poi le notifiche push (D082). Toccano file usati da tutte le pagine: farla tra una giornata e l'altra, provare tutto in locale e pubblicare lontano dalle scadenze delle formazioni.

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

**Fase 4 — Nuova stagione**: ✅ **fatta il 24/10/2026 (D122)**: rose
dell'asta inserite, 16 squadre, stagione 2026/27 "In corso".

## Progetti "in pausa", non legati alle fasi sopra (D004, D020)

- **Multileghe**: l'amico dice "funziona ed era già testato" (D018), ma
  questo **non coincide** con quanto risultava dai documenti storici del
  progetto (migrazione query ferma a 0/31 pagine core secondo
  `docs/storico-originali/STATO_SITO.md`). Secondo caso in sessione (dopo `admin-leghe.html`,
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
  In più (trovato nel riordino D118): 5 collegamenti a pagine mai esistite —
  `games-hub.html` → `athletic-quiz.html`, `memory-game.html`, `penalty-shootout.html`;
  `wirc-royale.html` → `wirc-deck-builder.html`, `wirc-game.html`. Da decidere se
  e quando si riprende il cluster (togliere i link o costruire le pagine).

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
