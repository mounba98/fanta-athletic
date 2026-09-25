# Decision Log — Fanta Athletic

Storico delle decisioni prese lavorando su questo progetto. Si legge a inizio
sessione, si aggiorna nel momento in cui una decisione viene presa (non a fine
sessione).

---

## D001 — Avvio revisione del progetto ereditato

**Data:** 2026-09-19

**Cosa:** iniziata analisi approfondita della cartella `fanta-athletic-code`
(copia locale della repository GitHub condivisa dall'amico che ha costruito il
sito) per capire struttura, stato del codice e criticità, prima di qualunque
modifica.

**Perché:** il sito è in produzione con utenti reali che se ne servono; prima
di toccare qualunque cosa serve un quadro completo di cosa c'è.

**Fatto:** analisi completata su quattro fronti — architettura generale,
sicurezza/qualità del codice, inventario dei 103 file HTML, storia del
progetto ricostruita dai 14 documenti Markdown scritti dall'amico. Dettaglio
tecnico completo in [`docs/AUDIT_INIZIALE_2026-09-19.md`](AUDIT_INIZIALE_2026-09-19.md).

**Prossimo passo:** scritto `CLAUDE.md` (D006). Da concordare con l'utente
come e quando riallineare la cartella alla struttura standard.

---

## D002 — Regola: si lavora solo in locale finché non validato

**Data:** 2026-09-19

**Cosa:** nessun commit, push o altra modifica sulla repository GitHub finché
l'utente non conferma esplicitamente, dopo aver verificato e testato in
locale.

**Perché:** su GitHub c'è l'unica versione stabile del sito, usata da molti
utenti reali. Un errore introdotto lì avrebbe impatto diretto su di loro.

**Prossimo passo:** questa regola resta valida per l'intero progetto di
revisione; verrà esplicitamente ridiscussa quando si arriverà alla fase
"pubblicazione su GitHub".

---

## D003 — Segnalata criticità di sicurezza: escalation privilegi admin

**Data:** 2026-09-19

**Cosa:** `set-admin.html` e `set-first-admin.html` permettono a qualsiasi
utente loggato di assegnarsi il ruolo di amministratore scrivendo
direttamente sulla collezione Firestore `admins`, senza alcun controllo
lato server visibile in questa cartella (non esiste un file
`firestore.rules` nel progetto).

**Perché è un problema:** se le regole di sicurezza configurate nella
Console Firebase non bloccano esplicitamente le scritture su `admins` da
parte di utenti non-admin, chiunque potrebbe autonominarsi amministratore.

**Fatto:** segnalato all'utente il 2026-09-19, confermato leggendo
direttamente il codice dei due file.

**Prossimo passo:** l'utente controllerà le regole Firestore sulla Console
Firebase (console.firebase.google.com → progetto fanta-athletic → Firestore
→ Regole). Non ancora verificato/risolto — riprendere in una prossima
sessione finché non chiuso esplicitamente.

**Aggiornamento 2026-09-19:** vedi D007 — l'utente ha condiviso le regole
reali, il rischio descritto qui NON è sfruttabile. Chiuso.

---

## D004 — Mini-gioco di carte (games-hub + famiglia wirc-*): messo in sospeso

**Data:** 2026-09-19

**Cosa:** il cluster di pagine del mini-gioco di carte collezionabili
(`games-hub.html`, `wirc-snap-marvel.html`, `wirc-battle-v2.html`,
`wirc-royale.html`, `wirc-card-gallery.html`, `osm-manager-v2.html`,
`athletic-manager.html`, `athletic-cards-battle.html`) è funzionante ma
scollegato dal menu principale del sito. Resta così com'è, non viene toccato
né promosso né archiviato.

**Perché:** decisione esplicita dell'utente — è una funzionalità già
predisposta che verrà ripresa quando si integreranno nuove funzionalità
nell'app, non ora.

**Fatto:** nessuna modifica ai file del cluster.

**Prossimo passo:** riconsiderare quando si pianificano nuove funzionalità
per l'app.

---

## D005 — Corretta un'informazione sbagliata su admin-leghe.html

**Data:** 2026-09-19

**Cosa:** l'amico che ha sviluppato il sito, interpellato dall'utente,
ricordava che `admin-leghe.html` fosse stata rimossa durante la migrazione
multileghe. Verificato nel codice: **non è vero** — il file è tuttora
attivo (31 funzioni, sezioni "Lega Attiva", "Crea Nuova Competizione",
"Unisciti a Competizione", "Le Mie Competizioni") ed è collegato da tre file
JS condivisi usati in tutto il sito: `resources/auth-guard.js` (banner
"nessuna lega selezionata"), `resources/league-context.js` e
`resources/league-selector.js` (voce "Crea Nuova" nel menu a tendina delle
leghe).

**Perché:** prima di archiviare un file bisogna sempre verificare nel
codice con un controllo incrociato (grep), non fidarsi solo della memoria
di chi ha scritto il progetto originariamente — la memoria umana su un
progetto di un anno fa può sbagliare.

**Fatto:** verificato con grep incrociato su tutta la cartella il
2026-09-19.

**Prossimo passo:** NON archiviare `admin-leghe.html` nella futura pulizia
dei file. Eventualmente segnalarlo all'amico, la sua ricostruzione era
sbagliata su questo punto.

---

## D006 — Scritto CLAUDE.md del progetto

**Data:** 2026-09-19

**Cosa:** creato `CLAUDE.md` con il contesto del progetto, lo stato reale
(non quello ottimistico dei documenti storici), le criticità aperte e le
regole di lavoro specifiche di questo progetto.

**Perché:** primo passo richiesto dall'utente prima di procedere con
qualunque riorganizzazione della cartella o modifica del codice.

**Fatto:** `CLAUDE.md` creato, allineato a questa voce (D006).

**Prossimo passo:** discutere con l'utente il piano di riallineamento della
cartella alla struttura standard (README.md, `.env.example` se necessario,
eventuale archiviazione dei file obsoleti elencati in
`docs/AUDIT_INIZIALE_2026-09-19.md`). Nessuna modifica al codice o alla
struttura ancora eseguita a questa data.

---

## D007 — Regole Firestore verificate: D003 chiuso, nuova criticità minore trovata

**Data:** 2026-09-19

**Cosa:** l'utente ha copiato il contenuto reale di `firestore.rules` dalla
Console Firebase. Verificato che `match /admins/{adminId} { allow write: if
isAdmin(); }` blocca correttamente le scritture da parte di chi non è già
admin — `set-admin.html`/`set-first-admin.html` falliscono per un utente
normale, il rischio D003 **non è reale**. Restano solo pagine morte da
archiviare per pulizia (probabile relitto di un'epoca in cui questa regola
non esisteva ancora).

Analizzando tutto il resto delle regole è emersa una criticità diversa,
minore: la regola su `leagues/{leagueId}` permette a **qualsiasi utente
autenticato** di aggiungersi all'array `members` di una lega qualsiasi
(`allow update: if ... !(uid in resource.data.members) && uid in
request.resource.data.members && diff...hasOnly(['members'])`), senza
verificare che l'utente conosca il vero codice invito — quel controllo
esiste solo nell'interfaccia del sito, non nella regola. In più
`allow read: if isSignedIn()` sul documento della lega (commento nel file:
"così il codice invito può essere verificato anche da chi non è ancora
membro") rende leggibile il codice invito stesso a chiunque sia loggato.
Combinati: un utente tecnicamente smaliziato potrebbe unirsi a una lega
altrui senza il codice invito e vedere squadre/formazioni/risultati/bacheca
di quella lega.

**Perché non è urgente come D003:** non porta a furto di dati sensibili né
a takeover dell'account/app — è fantacalcio tra amici, il danno è "vedere
dati di una lega non tua". Richiede comunque una minima competenza tecnica
(non capita per sbaglio a un utente normale).

**Fatto:** analisi delle regole completata, nessuna modifica al codice.

**Prossimo passo:** da mettere in coda per una futura sessione dedicata al
codice: aggiungere un controllo del codice invito dentro la regola stessa
(o spostare il join dietro una funzione lato server) prima di considerare
il progetto pronto per una fase "multileghe" pubblica. Non blocca il lavoro
di riordino cartelle.

---

## D008 — Riorganizzazione della cartella: 26 file archiviati, README.md aggiunto

**Data:** 2026-09-19

**Cosa:**
1. Creata una copia di backup completa della cartella prima di qualunque
   modifica: `/Users/iacopofratini/Claude/fanta-athletic-code-BACKUP-2026-09-19`
   (15MB, copia identica di tutto). Nessuna modifica su GitHub, solo file
   locali.
2. Rifatta la verifica incrociata (grep su tutta la cartella) sui 26 file
   candidati identificati in `docs/AUDIT_INIZIALE_2026-09-19.md` §4,
   **esclusi** i 12 file del cluster giochi (restano dove sono, vedi D004)
   e tutti i file della lista "richiede conferma umana" (`admin-leghe.html`
   su tutti, vedi D005). Confermato: nessuno dei 26 è raggiungibile da
   codice live al di fuori di `admin-old.html` (anch'esso archiviato).
3. Spostati i 26 file in `archive/`, suddivisi per categoria:
   - `archive/fix-debug-migrazione/` (16 file: fix/debug/migrazione one-off)
   - `archive/test/` (2 file: test-penalties.html, test-responsive.html)
   - `archive/admin-legacy/` (6 file: admin-old.html, admin-organized.html,
     admin-cards.html, admin-admins.html, admin-roster.html,
     admin-import-players.html)
   - `archive/pagine-abbandonate/` (2 file: matchday_live.html,
     squadre_live.html)
4. Rimossa da `resources/auth-guard.js` la voce `'adsense-preview.html'`
   nell'array `PUBLIC_PAGES` (whitelist di pagine senza login richiesto):
   il file è stato archiviato, la voce era diventata superflua ma innocua.
5. Creato `README.md` nella root (mancava), per chi legge il progetto da
   umano — punta a `CLAUDE.md` per il contesto operativo.
6. Verificato in locale nel browser (pannello Browser integrato, sito
   servito su `http://localhost:8899`): `index.html` identica a prima,
   `admin.html` reindirizza correttamente al login (comportamento atteso,
   non è protetto da login pubblico), nessun errore nuovo in console.

**Perché:** richiesta esplicita dell'utente di "snellire" la cartella
seguendo l'analisi già fatta e le regole di struttura standard di
`claude-config` (`STRUTTURA_STANDARD.md`). Solo i file con zero
riferimenti verificati sono stati toccati; tutto il resto (cluster
giochi, `admin-leghe.html`, le pagine "one-off ma ancora linkate dal menu
admin", le pagine di stato incerto) è stato lasciato esattamente dov'era.

**Fatto:** vedi sopra. Nessuna modifica su GitHub.

**Prossimo passo:** restano da decidere in una sessione futura, con calma:
gli 8 file JS "orfani" in `resources/` individuati nell'audit (
`version-check.js`, `clear-old-data.js`, `achievements-system.js`, ecc. —
più rischiosi da toccare perché condivisi tra pagine, non ancora
verificati con la stessa profondità dei file HTML); le pagine della lista
"richiede conferma umana" (`admin-users.html`, `admin-teams.html`,
`h2h-standings.html`, `formazioni-basket.html`/`formazioni-volley.html`,
ecc. — vedi `docs/AUDIT_INIZIALE_2026-09-19.md`); valutare se e quando
inizializzare un repository git locale per avere una cronologia delle
modifiche invece delle copie di backup manuali; valutare `.env.example`
(al momento non risultano segreti gestiti via variabili d'ambiente, quindi
non è stato creato).

---

## D009 — Centralizzata la funzione "lega corrente" (5 pagine, zero copie)

**Data:** 2026-09-19

**Cosa:** decisione dell'utente: niente riscrittura completa (SPA) né
riorganizzazione ulteriore delle cartelle (troppo rischiosa senza un
router — vedi discussione in sessione), ma sì a "compattare senza cambiare
il funzionamento" via centralizzazione del codice duplicato.

Prima modifica: le funzioni `getCurrentLeagueIdCached`, `getCurrentLeagueId`
e `ensureLeagueReady` erano ridefinite (verificate byte-per-byte identiche,
a parte l'etichetta di un log interno) in `classifiche.html`,
`matchday.html`, `squadre.html`, `formazioni.html`, `lineup-summary.html`.
Spostate in `resources/league-helper.js` (file già esistente ma orfano,
mai caricato da nessuna pagina). Ogni pagina ora carica
`<script src="resources/league-helper.js?v=20260919-1">` subito dopo
`firebase-config.js`, e la definizione locale è stata rimossa (lasciata
intatta la riga `const leagueHelper = window.LeagueHelper || null;`,
ancora usata da altro codice nelle stesse pagine).

**Perché:** riduce 5 copie a 1 sola fonte di verità, senza toccare
l'architettura a pagine indipendenti né il posizionamento dei file. Rischio
basso: nessuna pagina spostata, nessun link cambiato, solo codice
duplicato spostato in un file condiviso già pensato per questo scopo.

**Fatto:** modifica applicata, verificata nel browser locale su tutte e 5
le pagine: nessun errore nuovo in console (solo i consueti
"permission-denied" attesi perché non loggati), comportamento identico a
prima (le pagine protette da login reindirizzano correttamente ad
`auth.html`, le altre caricano normalmente).

**Prossimo passo:** stessa tecnica da applicare alla duplicazione di
`toast`/`showToast` (13 file) e, se il tempo lo consente, rivalutare gli 8
file JS "orfani" segnalati nell'audit.

---

## D010 — Centralizzato il messaggio di conferma "toast" (4 pagine)

**Data:** 2026-09-19

**Cosa:** analizzate le 13 pagine con una funzione `toast`/`showToast`:
non sono tutte uguali, esistono **tre famiglie diverse** (verificato
byte-per-byte, non solo a occhio):
1. `toast(msg)` con box blu a stile inline, 2 secondi — identica in
   `formazioni.html`, `matchday.html`, `squadre.html`, `auth.html` (4
   file). **Centralizzata** in `resources/toast.js` (nuovo file), caricato
   dopo `firebase-config.js`; rimossa la definizione locale dalle 4
   pagine.
2. `toast(msg)` basata su classe CSS `.toast`, 3 secondi — identica in
   `admin-calendario.html` e `contest.html` (2 file), ma diversa dalla
   famiglia 1. **Non toccata in questa sessione**: solo 2 file, beneficio
   piccolo, andrebbe centralizzata insieme al CSS associato per essere
   sicuri al 100%.
3. `showToast(message, type = 'success')` con colori diversi per tipo di
   messaggio — presente in `admin-leghe.html`, `admin-rules.html`,
   `bacheca.html`, `classifiche.html`, `lineup-summary.html` (5 file), ma
   **con differenze reali tra un file e l'altro** (non copie identiche).
   **Non toccata**: unificarle senza guardarle una per una rischierebbe di
   cambiare l'aspetto di pagine diverse — da rivedere con calma in una
   sessione dedicata, file per file.

Lasciate stare anche le occorrenze in `athletic-manager.html` e
`games-hub.html` (cluster giochi, D004).

**Perché:** l'utente ha chiesto di "compattare senza cambiare il
funzionamento" (non riscrivere, non riorganizzare cartelle). Ho
centralizzato solo la famiglia verificata identica al 100%; le altre due
famiglie sono state lasciate intatte per non rischiare di alterare
l'aspetto di pagine diverse senza un confronto attento caso per caso.

**Fatto:** creato `resources/toast.js`. Aggiornati `formazioni.html`,
`matchday.html`, `squadre.html`, `auth.html` (script tag aggiunto,
funzione locale rimossa). Verificato nel browser locale su tutte e 4:
`window.toast` è definita, richiamata manualmente mostra lo stesso box blu
di prima, nessun errore nuovo in console.

**Prossimo passo:** se si vuole continuare la pulizia del codice in una
prossima sessione: (1) confrontare con calma le 5 varianti di
`showToast(message, type)` per capire se unificabili senza cambiare
l'aspetto; (2) valutare se centralizzare anche la famiglia CSS-based di
`admin-calendario.html`/`contest.html`; (3) i file JS orfani in
`resources/` restano da valutare.

---

## D011 — Centralizzata anche la seconda famiglia di "toast" (2 pagine)

**Data:** 2026-09-19

**Cosa:** completata la famiglia 2 di D010 (`toast(msg)` basata su classe
CSS `.toast`, identica in `admin-calendario.html` e `contest.html`).
Creato `resources/toast-css-class.js` (nome diverso da `toast.js` di
proposito: le due varianti hanno lo stesso nome di funzione `toast` ma
comportamento diverso — non vanno mai caricate insieme sulla stessa
pagina). Il CSS `.toast { ... }` resta in ciascuna pagina, non spostato
(fuori scope, e le due pagine hanno un'animazione leggermente diversa che
non vale la pena forzare a coincidere).

**Fatto:** aggiornati entrambi i file, verificato nel browser locale:
`window.toast` definita su entrambe, nessun errore nuovo introdotto dalla
modifica.

**Scoperta collaterale (non risolta oggi, solo segnalata):** sia
`admin-calendario.html` che `contest.html` caricano
`firebase-app-compat.js` in versione **9.22.0** da CDN, mentre
`firebase-auth-compat.js` e `firebase-firestore-compat.js` sono in
versione **10.14.1** — un disallineamento di versioni preesistente
(confermato confrontando con `../fanta-athletic-code-BACKUP-2026-09-19`,
non introdotto da questa sessione) che genera in console l'errore
`Uncaught TypeError: Oi._isFirebaseServerApp is not a function`. Inoltre
`admin-calendario.html` non carica affatto `resources/firebase-config.js`:
ha un proprio `firebaseConfig` incollato a mano e inizializza Firebase per
conto suo, quindi probabilmente non passa dall'adapter multilega. Da
approfondire in una sessione dedicata al codice, non è stato toccato ora.

**Prossimo passo:** restano da valutare le 5 varianti di `showToast` (con
differenze reali) e gli 8 file JS orfani in `resources/`. Nuovo elemento
in coda: il disallineamento di versione Firebase in
`admin-calendario.html`/`contest.html`.

---

## D012 — Due bug preesistenti risolti e verificati (versione Firebase, link CSS morto)

**Data:** 2026-09-19

**Cosa:**
1. Corretto il bug D011: in `admin-calendario.html` e `contest.html`
   `firebase-app-compat.js` era caricato in versione 9.22.0 mentre
   `firebase-auth-compat.js`/`firebase-firestore-compat.js` erano in
   10.14.1 — allineato tutto a 10.14.1. Errore `Uncaught TypeError:
   Oi._isFirebaseServerApp is not a function` sparito, verificato.
2. Rimosso un `<link rel="stylesheet" href="resources/theme.css">` che
   punta a un file **mai esistito** in questa cartella, presente in 3
   pagine: `contest.html`, `contest-leaderboard.html`,
   `calendario-athletic.html`. Innocuo (il browser lo ignorava e basta,
   lo stile arriva da `<style>` inline in ciascuna pagina), ma toglieva
   un 404 inutile in console.

**Perché:** l'utente ha chiesto di continuare la pulizia e, per bug
piccoli e isolati come questi, di correggerli subito invece di limitarsi
a segnalarli.

**Fatto:** modifiche applicate e **verificate con metodo corretto**: ho
scoperto durante la verifica che il pannello Browser accumula i messaggi
di console tra una pagina e l'altra nella stessa scheda (una pagina
sana come `index.html` mostrava ancora l'errore vecchio, residuo di
navigazioni precedenti nella stessa scheda) — quindi ho riverificato
tutte e 3 le pagine aprendo una scheda nuova per ciascun controllo, unico
modo per essere sicuri che l'errore fosse davvero sparito e non solo
nascosto dalla cronologia. Tutte e 3 confermate pulite (resta solo il
consueto "permission denied" perché non si è loggati).

**Nota per le prossime verifiche in questa sessione:** usare sempre una
scheda nuova (`tabs_create`) prima di controllare la console per un bug
specifico, non fidarsi della lista cumulativa nella scheda già aperta.

**Prossimo passo:** restano da valutare le 5 varianti di `showToast` e gli
8 file JS orfani in `resources/`.

---

## D013 — Centralizzata la sotto-famiglia identica di "showToast" (2 pagine)

**Data:** 2026-09-19

**Cosa:** delle 5 pagine con `showToast`, 2 (`classifiche.html`,
`lineup-summary.html`) avevano una coppia di funzioni
(`showToast`/`showFallbackToast`) identica byte-per-byte tra loro.
Centralizzate in un nuovo file `resources/toast-with-fallback.js`
(comportamento invariato: usa `window.toast` se disponibile, altrimenti
mostra un box blu di fallback con ombra/durata leggermente diverse da
`resources/toast.js` — valori originali mantenuti esattamente).

Le altre 3 varianti (`admin-leghe.html`, `admin-rules.html`,
`bacheca.html`) sono risultate **davvero diverse** tra loro (icone
diverse, gestione diversa del contenitore del toast) — non toccate, per
non rischiare di cambiare l'aspetto.

**Fatto:** creato il file condiviso, aggiornati i 2 file. **Verifica
parziale**: sono entrambe pagine protette da login, quindi (come già
successo con D009) il browser reindirizza al login prima che lo script
della pagina arrivi a usare le funzioni — non è stato possibile vedere il
toast apparire dal vivo senza credenziali. Ho verificato invece che il
codice sia sintatticamente corretto (letto a occhio il punto esatto della
modifica su entrambi i file, nessuna parentesi orfana) e che il tag
`<script>` del nuovo file sia posizionato correttamente prima del codice
che lo usa. Da confermare con un test reale da loggati.

**Prossimo passo:** restano gli 8 file JS orfani in `resources/` da
valutare — prossimo compito.

---

## D014 — Archiviati 7 file JS orfani: sembrano funzionalità mai collegate

**Data:** 2026-09-19

**Cosa:** dei 9 file JS "orfani" in `resources/` (nessuna pagina li carica
con `<script src>`, verificato con grep su tutta la cartella incluse
eventuali stringhe di riferimento dinamico — zero risultati per tutti):
- `league-helper.js` era già stato ricollegato in D009 (non più orfano).
- `wirc-snap-game.js` fa parte del cluster giochi in sospeso (D004) —
  **non toccato**, lasciato in `resources/`.
- Gli altri **7 file** sono stati spostati in `archive/resources-orfani/`:
  `version-check.js`, `clear-old-data.js`, `achievements-system.js`,
  `admin-navbar.js`, `defense-modifier-calculator.js`, `player-photos.js`,
  `trades-system.js`.

**Osservazione importante per l'utente**: leggendo l'inizio di ciascun
file, non sembra codice morto o abbandonato per errore — sembrano
**funzionalità scritte per intero ma mai collegate a nessuna pagina**:
un sistema di achievement/badge, un sistema di scambi giocatori, gestione
foto giocatori, un calcolo automatico del bonus/malus difesa, un
controllo automatico di nuove versioni dell'app. Vale la pena chiedere
all'amico sviluppatore se erano funzionalità pianificate e mai finite,
prima di considerarle definitivamente da buttare.

**Perché è sicuro**: zero pagine le caricavano già prima di oggi, quindi
spostarle non cambia nulla di ciò che funziona ora. Sono in `archive/`,
non cancellate: recuperabili in un secondo se servono.

**Fatto:** spostati i 7 file, riverificato che nessun riferimento resti
fuori da `archive/`, testato `index.html` in una scheda pulita — nessun
errore nuovo in console.

**Prossimo passo:** chiedere all'utente/sviluppatore originale se queste
funzionalità (achievement, scambi, foto giocatori, calcolo difesa,
controllo versione) sono da riprendere o da abbandonare definitivamente.

---

## D015 — Tolto un residuo di debug dal titolo di squadre.html

**Data:** 2026-09-19

**Cosa:** il tag `<title>` di `squadre.html` conteneva ancora
`DEBUG_SQUADRE_2025_11_19_01` (visibile nella scheda del browser).
Rimosso, ora è semplicemente "Fanta Athletic - Squadre". Modifica di solo
testo, zero rischio funzionale.

**Fatto:** verificato nel browser, titolo corretto, pagina si comporta
come prima (reindirizza al login, comportamento invariato).

---

## D016 — Bug reale trovato e risolto: admin-squadre.html completamente rotta

**Data:** 2026-09-19

**Cosa:** cercando altri link a file inesistenti (stesso tipo di
controllo che aveva trovato `theme.css`), trovato che `admin-squadre.html`
caricava `resources/firebase-init.js` — **file mai esistito in questa
cartella**. Risultato: Firebase non si inizializzava mai su questa
pagina, causando 4 errori bloccanti in console
(`No Firebase App '[DEFAULT]' has been created`). **Questa è una pagina
admin attiva**, collegata al menu vero — non un file abbandonato.

Corretto puntando al file giusto: `resources/firebase-config.js` (lo
stesso usato da tutte le altre pagine).

**Scoperta positiva collaterale**: prima della correzione, essendo
Firebase rotto, anche il controllo "sei loggato / sei admin?" della
pagina non veniva mai eseguito — quindi la pagina mostrava il pannello
admin vuoto senza controllare i permessi (anche se, non funzionando i
dati, non c'era comunque nulla di sensibile da vedere: usa
`localStorage`, non Firestore, per i dati delle squadre — altra cosa
degna di nota, sembra una versione più vecchia/semplice rispetto a
`admin-teams.html`/`squadre.html`). Con la correzione, ora la pagina
reindirizza correttamente al login se non si è autenticati, come dovrebbe.

**Metodo importante scoperto durante la verifica**: il pannello Browser
usato per i test **tiene in cache le pagine già visitate**, anche aprendo
una scheda nuova (la cache è del browser, non della scheda). La prima
verifica di questa correzione sembrava fallita perché stavo vedendo la
versione vecchia e rotta della pagina, ancora in cache da quando l'avevo
aperta per la prima volta prima di correggerla. Risolto aggiungendo un
parametro finto all'indirizzo (es. `?_cb=1`) per forzare il browser a
scaricare di nuovo la pagina, ignorando la cache.

**Conseguenza**: ho dovuto **riverificare tutte le pagine già "confermate
funzionanti" in questa sessione** (D009, D010, D011, D012, D013) con
questo metodo più rigoroso, perché alcune di quelle verifiche potevano
essere state fatte su contenuto cache invece che sul contenuto vero
appena modificato. Rifacendo il controllo ho trovato che **il bug D012
(versione Firebase disallineata) era presente anche in altri due file mai
controllati prima**: `contest-leaderboard.html` e `join-team.html`.
Corretti anche questi (stessa modifica: versione allineata a 10.14.1).

Tutte le pagine toccate in questa sessione sono state riverificate con il
metodo corretto (scheda nuova + indirizzo anti-cache): `matchday.html`,
`formazioni.html` (verificate leggendo direttamente `window.toast` ecc.
da codice, non protette da login), `classifiche.html`, `squadre.html`,
`lineup-summary.html` (verificate controllando che i file condivisi
vengano scaricati con successo prima del redirect al login, essendo
pagine protette), `admin-calendario.html`, `contest.html` (nessun errore
residuo). Tutte confermate genuinamente a posto.

**Prossimo passo:** se si riprende la pulizia in futuro, ricordarsi
sempre di usare un indirizzo con parametro anti-cache quando si riverifica
una pagina già visitata in precedenza nella stessa sessione di test.

---

## D017 — In pausa: in attesa di risposta dall'amico sviluppatore

**Data:** 2026-09-19

**Cosa:** l'utente ha inviato al sviluppatore originale il messaggio con
le domande/segnalazioni riassunte in questa sessione (vedi
`docs/PUNTI_APERTI.md`, sezione "Da chiedere all'amico sviluppatore").

**Perché:** prima di andare avanti con altre decisioni di prodotto
(cluster giochi, stato reale della migrazione multileghe, destino dei 7
file JS archiviati, ecc.) serve la sua risposta.

**Fatto:** nessuna modifica al codice in questo passaggio, solo il blocco
registrato.

**Prossimo passo:** riprendere quando arriva la risposta. Nel frattempo
resta disponibile procedere con il test in locale usando l'account reale
dell'utente (vedi `docs/PUNTI_APERTI.md`, sezione "Da verificare con un
test da loggati").

---

## D018 — Risposte dell'amico sviluppatore alle domande di D017

**Data:** 2026-09-20

**Cosa:** l'amico sviluppatore ha risposto a tutti i punti inviati:

1. **`admin-leghe.html`**: confermato, si ricordava male — è davvero
   attiva. Nessuna azione ulteriore.
2. **7 file JS archiviati (D014)**: NON sono codice morto/abbandonato per
   caso — erano un **ampliamento futuro pianificato**, per far diventare
   l'app un concorrente diretto di "Leghe Fantacalcio" (piattaforma nota
   del settore). Achievement, scambi, foto giocatori, calcolo difesa,
   controllo versione erano pezzi di quel piano più ampio.
3. **`admin-squadre.html` (D016)**: confermato che la correzione va bene.
4. **Sicurezza invito lega (D007)**: l'amico (con l'utente) accetta il
   rischio per ora, non è prioritario finché non si apre il multileghe a
   più persone esterne.
5. **Stato multileghe**: l'amico dice che **"multilega funziona ed era
   già testato"**. ⚠️ **Attenzione — questo non coincide con quanto
   emerso dall'analisi dei documenti storici** (`docs/AUDIT_INIZIALE_2026-09-19.md`
   §5): `STATO_SITO.md` riportava la migrazione delle query nelle pagine
   core (formazioni, squadre, matchday, classifiche) ferma a 0 pagine su
   31. È il secondo caso in questa sessione (dopo `admin-leghe.html`) in
   cui il ricordo dell'amico e la documentazione/il codice non
   coincidono — non necessariamente ha torto lui (potrebbe aver testato
   con successo un caso specifico, o la documentazione potrebbe essere
   vecchia), ma **non va dato per assodato senza una prova pratica**:
   creare una seconda lega di test e verificare che formazioni/squadre/
   classifiche funzionino davvero con dati propri e separati dalla lega
   originale, prima di considerarlo chiuso.
6. **Backup Firestore**: vengono lanciati manualmente, **una volta
   all'anno, a inizio stagione**. Da tenere presente: se durante la
   stagione cambia molto (nuove leghe, migrazioni, ecc.), l'ultimo backup
   utile potrebbe essere vecchio di mesi.
7. **`formazioni-basket.html`/`formazioni-volley.html`**: confermato,
   erano un esperimento embrionale per un multi-sport, **non rilevante**.
   Via libera per trattarle come le altre pagine archiviabili.

**Fatto:** nessuna modifica al codice in questo passaggio, solo
registrazione delle risposte.

**Prossimo passo:**
- Aggiornare `docs/PUNTI_APERTI.md` spostando i punti chiusi.
- Proporre all'utente di archiviare `formazioni-basket.html` e
  `formazioni-volley.html` (via libera ricevuta al punto 7).
- Segnalare chiaramente all'utente la discrepanza sul multileghe (punto
  5) prima di considerarla un fatto assodato.
- I 7 file JS (punto 2) restano in `archive/resources-orfani/`: non sono
  più "da chiedere", ma la decisione se e quando riprenderli per il nuovo
  progetto resta da fare con calma, non ora. Non includere questi file
  nella riorganizzazione/archiviazione della cartella.

---

## D019 — Archiviate formazioni-basket.html e formazioni-volley.html

**Data:** 2026-09-20

**Cosa:** con la conferma dell'amico (D018: "esperimento embrionale, non
rilevante"), spostate `formazioni-basket.html` e `formazioni-volley.html`
in `archive/pagine-abbandonate/`. Verificato zero riferimenti vivi prima
di spostarle (stesso metodo delle altre archiviazioni), testato
`index.html` dopo lo spostamento: nessun errore.

**Nota collaterale**: anche `data/basket-config.json` e
`data/volley-config.json` risultano ora completamente orfani (erano usati
solo da queste due pagine). Non spostati in questa passata — bassa
priorità, i file dati occupano poco spazio e non creano confusione quanto
le pagine HTML.

**Fatto:** spostamento eseguito e verificato.

**Prossimo passo:** nessuno specifico per questo punto, chiuso.

---

## D020 — Multileghe riclassificato come progetto futuro, non verifica urgente

**Data:** 2026-09-20

**Cosa:** l'utente ha deciso di non dare priorità alla verifica pratica
dello stato del multileghe (segnalata in D018 come discrepanza tra quanto
detto dall'amico e quanto risultava dai documenti). Il sito oggi funziona
con una sola lega attiva, quindi il multileghe non blocca l'uso
quotidiano. Raggruppato insieme agli altri elementi "futuri" già
individuati: cluster giochi (D004) e i 7 file JS per l'eventuale futuro
progetto concorrente di "Leghe Fantacalcio" (D018).

**Perché:** decisione di prodotto dell'utente — si concentra il lavoro
sulla stabilità e pulizia di quello che è realmente in uso ora, rimandando
le funzionalità non ancora necessarie.

**Fatto:** riorganizzato `docs/PUNTI_APERTI.md` con una sezione dedicata
"Progetti futuri (in coda)".

**Prossimo passo:** se in futuro si decide di riprendere una di queste
tre iniziative, la verifica pratica del multileghe (creare una seconda
lega di test) resta il primo passo prima di costruirci sopra qualunque
altra cosa.

---

## D021 — Errore: 20 file del cluster giochi persi dalla copia locale

**Data:** 2026-09-20

**Cosa è successo:** su richiesta dell'utente di archiviare "in modo
ordinato" anche il cluster giochi (D004), ho provato a spostare i 20 file
HTML del mini-gioco di carte (`games-hub.html`, famiglia `wirc-*`,
`athletic-manager.html`, `athletic-cards-battle.html`, `osm-manager*.html`,
`clash-cards.html`) in `archive/mini-gioco-carte/`, correggendo prima i
percorsi verso `resources/`/`data/` (necessario perché altrimenti quei
riferimenti si sarebbero rotti spostando i file più in profondità).

**Il problema trovato**: dopo lo spostamento, la pagina risultava
raggiungibile ma **il redirect al login (generato da `resources/auth-guard.js`,
uno script condiviso da tutto il sito) puntava a un indirizzo sbagliato**
(l'errore compariva SOLO quando la pagina veniva aperta da un browser vero,
non da una semplice lettura del codice) — perché quello script assume
sempre che ogni pagina stia nella cartella principale del sito, cosa che
la mia correzione dei percorsi non copriva (avevo sistemato solo i
riferimenti scritti dentro le 20 pagine stesse, non il comportamento degli
script condivisi che tutte richiamano). Ho deciso di annullare lo
spostamento per questo motivo.

**L'errore vero e proprio**: nel tentativo di annullare, ho **cancellato le
20 copie modificate prima di verificare che il ripristino dal backup
(`../fanta-athletic-code-BACKUP-2026-09-19`, creato in D008) fosse andato a
buon fine**. Il backup **non era raggiungibile al momento del controllo**
(vedi aggiornamento sotto) — quindi il ripristino è fallito e le 20 pagine
+ 1 script (`resources/wirc-snap-game.js`, poi ritrovato ancora presente
in `archive/resources-orfani/`, quello si è salvato) sono risultate
**mancanti dalla copia locale**.

**Perché non è grave**: sono esattamente le pagine del cluster giochi già
considerato "in pausa" (D004), mai raggiungibili dal menu del sito, senza
alcun impatto sulle funzionalità che gli utenti usano davvero. **L'unica
copia corretta e intatta di questi file esiste comunque sempre sulla
repository GitHub**, mai toccata in questa sessione.

Elenco dei 20 file coinvolti: `games-hub.html`, `wirc-snap-marvel.html`,
`wirc-battle-v2.html`, `wirc-royale.html`, `wirc-card-gallery.html`,
`osm-manager-v2.html`, `athletic-manager.html`, `athletic-cards-battle.html`,
`wirc-card-maker.html`, `wirc-batch-card-maker.html`, `clash-cards.html`,
`osm-manager.html`, `wirc-battle.html`, `wirc-snap.html`,
`wirc-snap-v2.html`, `wirc-snap-v2.5.html`, `wirc-snap-v3.html`,
`wirc-snap-v5.html`, `wirc-snap-full.html`, `wirc-snap-mobile.html`.

**Lezione per il futuro (da applicare sempre)**: prima di cancellare
qualunque copia di lavoro per "tornare indietro", **verificare sempre che
il ripristino/backup di destinazione esista e sia completo PRIMA di
cancellare**, non dopo. In questa occasione ho invertito l'ordine
(cancellato, poi provato a ripristinare, poi scoperto che la fonte non
era raggiungibile) — l'ordine corretto è: verificare la fonte →
copiare/ripristinare → solo allora cancellare la versione da rimuovere.

**Aggiornamento 2026-09-20, poco dopo**: falso allarme parziale — l'utente
aveva spostato lui stesso la cartella di backup (non era sparita/cancellata
da terzi), rimettendola poi **dentro la cartella di lavoro del progetto**
(`fanta-athletic-code/fanta-athletic-code-BACKUP-2026-09-19/`). Recuperati
da lì tutti i 20 file, verificati identici byte-per-byte all'originale di
backup, e testato `games-hub.html` nel browser: reindirizza di nuovo
correttamente alla vera `auth.html`, comportamento tornato quello di
partenza. **Nessuna perdita di dati reale, alla fine.**

Resta comunque valida la lezione sull'ordine verifica-poi-cancella: se il
backup fosse stato davvero irraggiungibile, la perdita sarebbe stata reale.

**Nuovo punto da sistemare**: la cartella di backup ora vive DENTRO la
cartella del progetto (`fanta-athletic-code/fanta-athletic-code-BACKUP-2026-09-19/`,
~15MB, contenuto duplicato). Aggiunta a `.gitignore` come rete di
sicurezza. Da spostare fuori o eliminare quando l'utente conferma di non
averne più bisogno — lasciata lì di proposito, l'utente la toglierà prima
di un eventuale commit.

**Prossimo passo:** nessuno specifico, chiuso. Promemoria sulla cartella
di backup registrato in `docs/PUNTI_APERTI.md`.

---

## D022 — Controllo finale di sessione: tutto verificato, nessun danno

**Data:** 2026-09-20

**Cosa:** su richiesta dell'utente, controllo completo di tutto il lavoro
di pulizia fatto in questa sessione (D008-D021), prima di allineare la
documentazione e passare alla fase di test.

**Verifiche fatte:**
1. **Struttura cartelle**: 75 file HTML attivi in root + 28 archiviati in
   `archive/` (6 admin-legacy, 16 fix-debug-migrazione, 4
   pagine-abbandonate, 2 test) + 8 script JS orfani in
   `archive/resources-orfani/` = 103 file HTML totali, combacia
   esattamente con il conteggio di partenza. Nessun file perso o
   duplicato per errore.
2. **Nessun riferimento rotto verso i file archiviati**: ripetuto il
   controllo incrociato su tutti i 28 file — tutti i riferimenti residui
   sono interni ad `archive/` stesso (pagine morte che si linkano a
   vicenda), zero riferimenti da codice live.
3. **Nessun link rotto nuovo**: ripetuta la scansione automatica di tutti
   i link a `resources/`/`data/` su tutte le 75 pagine live — unico
   risultato: `resources/favicon.ico` (mai esistito, cosmetico, 5 pagine,
   non impatta il funzionamento). Stessa scansione sui riferimenti a
   script locali: solo i 5 file del cluster giochi già noti come rotti
   in origine (D021), invariati.
4. **Sintassi**: parentesi graffe/tonde bilanciate in tutti i file
   condivisi creati (`league-helper.js`, `toast.js`, `toast-css-class.js`,
   `toast-with-fallback.js`) e in tutte le 11 pagine HTML modificate.
5. **Browser, scheda pulita + indirizzo anti-cache, su tutte le pagine
   toccate in sessione**: `index.html`, `admin.html`, `admin-calendario.html`,
   `admin-squadre.html`, `contest.html`, `contest-leaderboard.html`,
   `calendario-athletic.html`, `join-team.html`, `matchday.html`,
   `formazioni.html`, `classifiche.html`, `squadre.html`,
   `lineup-summary.html`, `auth.html` — nessun errore nuovo o inatteso,
   solo i consueti "permission denied" per assenza di login.
6. **Cluster giochi**: confermato tornato esattamente allo stato
   originale (D021), nessuna cartella residua dal tentativo annullato.
7. **Ordine del diario**: durante questo controllo trovato che alcune
   voci precedenti (D005, D006, D008, D018) erano finite fuori ordine nel
   file per un errore nelle modifiche testuali fatte in sessione (i
   comandi di modifica avevano agganciato il punto di inserimento
   sbagliato). Il file è stato riscritto interamente in ordine
   cronologico D001→D022, contenuto invariato.

**Esito: nessun danno, tutto il lavoro di questa sessione è solido.**

**Fatto:** verifica completa eseguita e documentata; diario decisioni
riordinato cronologicamente.

**Prossimo passo:** aggiornare `CLAUDE.md`, `docs/MAPPA_PAGINE.md` e
`docs/PUNTI_APERTI.md` per allinearli a questo checkpoint (D022), poi
passare alla fase di test con l'account reale dell'utente.

---

## D023 — Test con account reale: trovati e risolti 3 bug veri in squadre.html

**Data:** 2026-09-20

**Cosa:** l'utente si è loggato con il suo account reale
(account di Iacopo, squadra "Curva gonfi", team_index 6, non
admin). Primo test da loggati di tutta la sessione — ha fatto emergere
subito problemi reali, mai visibili nei test precedenti da non loggati.

**Bug 1 — Home page**: il riquadro "La Mia Squadra" mostra "Squadra non
trovata" per un errore di programmazione (`legacyDb is not defined` in
`index.html`, righe 1168/1297) nel tentativo di lettura di fallback della
squadra. **Non ancora corretto** (bug isolato in `index.html`, diverso da
quelli di `squadre.html` sotto — da riprendere in una prossima sessione).

**Bug 2 — squadre.html mostrava sempre la squadra sbagliata di default**
(la prima della lista, "Mocci e Canni", invece della propria, "Curva
gonfi"), risolto in tre passaggi concatenati, ciascuno verificato:
1. `loadAuth()` cercava il `team_index` dell'utente in
   `getLeagueCollection('users', leagueId)` (percorso "di lega"), ma
   `users` **non è tra le collezioni multilega** (non è in
   `MULTI_COLLECTIONS` in `firebase-config.js`) — il dato vive nel
   percorso classico `users/{uid}`, come già fanno correttamente
   `formazioni.html` e `resources/navbar-profile-icon.js`. Cambiato a
   `window.db.collection('users').doc(user.uid).get()`.
2. Anche dopo questa correzione, il bug persisteva: il controllo "admin
   per lega specifica" (`getLeagueCollection('admins', leagueId)`) fallisce
   **sempre** con permission-denied (non esiste una regola Firestore per
   quel percorso) e l'eccezione, non isolata, interrompeva l'intera
   funzione prima di arrivare a leggere il `team_index` subito sotto.
   Isolato in un try/catch proprio.
3. Ancora dopo le prime due correzioni, il menu a tendina della squadra
   restava visivamente fermo sulla squadra sbagliata: la sincronizzazione
   `sel.value = state.selectedTeamIdx` avviene solo dentro `initLockUI()`,
   eseguita **prima** che `loadAuth()` scopra la vera squadra dell'utente
   — mai più risincronizzata dopo. Aggiunta la risincronizzazione anche
   dentro `loadAuth()`.

Ognuna delle tre correzioni è stata verificata singolarmente leggendo lo
stato interno della pagina via console (`state.userTeamIdx`,
`state.selectedTeamIdx`) prima di passare alla successiva, poi il tutto
riverificato insieme con una scheda di test completamente nuova (sessione
di login riutilizzata, verificato che persiste tra schede): la pagina ora
mostra correttamente "Curva gonfi" fin dal primo caricamento.

**Bug 3 — squadre.html andava in crash per un giocatore con dato
incompleto**: "Jacopo Pinzauti" ha nel database `ruolo: "P"` invece del
campo `role: "Portiere"` che il codice si aspetta (probabile residuo di
un import con una convenzione diversa — verificato che è un caso isolato,
1 solo giocatore su 32 nella lega ha questa incoerenza). Il codice faceva
`grouped.get(p.role).push(p)` assumendo che `p.role` fosse sempre uno dei
4 valori validi: con `role` assente, andava in crash **l'intera pagina**,
bloccando anche il rendering di tutto il resto (comprese le correzioni
del Bug 2, che altrimenti avrebbero comunque fallito in questo caso).
Reso il codice difensivo: un giocatore con ruolo mancante/non valido
viene ora escluso dalla lista con un avviso in console, invece di far
crashare tutto.

**Non corretto (dato, non codice)**: il campo `role` mancante di Jacopo
Pinzauti stesso — l'utente ha confermato che il ruolo corretto è
"Portiere" e ha autorizzato la scrittura, ma **verificato che l'account
di test non è admin di questa lega**: la scrittura su
`leagues/{leagueId}/players/{playerId}` verrebbe rifiutata dalle regole
di sicurezza (corrette, è voluto). Non esiste modo di scriverla con questo
account — serve un account admin (l'amico, o dare admin a questo account,
o farlo tramite `admin-players.html` direttamente).

**Trovato ma non toccato (bassa priorità, nessun crash)**: `fetchOwnersForTeam()`
tenta di leggere il nome del proprietario di ogni squadra facendo una
query su tutti gli utenti (`users.where('team_index','==', idx)`) — le
regole Firestore per `users` permettono a un utente normale di leggere
solo il proprio documento, quindi la query fallisce sempre con
permission-denied per chi non è admin. La funzione ha già un try/catch e
ritorna una lista vuota, quindi **non rompe nulla**, produce solo rumore
in console (4 errori ripetuti a ogni caricamento). Non è un bug da
correggere con urgenza: è una conseguenza voluta delle regole di privacy,
la funzione andrebbe eventualmente ripensata per gli utenti non-admin
(es. non tentarla proprio), non è una priorità.

**Osservazione dell'utente**: giocatori, ruoli e squadre hanno bisogno di
una revisione più ampia prima dell'inizio della prossima stagione — questo
bug (Jacopo Pinzauti) è probabilmente solo il primo di una serie di
incoerenze dati da sistemare, non un caso isolato da risolvere e
dimenticare.

**Fatto:** 2 correzioni di codice applicate e verificate a fondo in
`squadre.html` (percorso lettura `users`, isolamento try/catch admin,
risincronizzazione menu, difesa su ruolo mancante — 4 modifiche mirate in
totale). Nessuna scrittura sul database (bloccata dai permessi, come
deve essere). Nessun'altra pagina toccata.

**Prossimo passo:**
- Bug 1 (home page, `legacyDb is not defined`) da correggere in una
  prossima sessione — stesso tipo di indagine già fatta qui, non ancora
  fatta per `index.html`.
- Chiedere a un admin (l'amico, o dare admin temporaneo a questo account)
  di correggere il ruolo di Jacopo Pinzauti da `admin-players.html`.
- Continuare il test da loggati sulle altre pagine (formazioni, matchday,
  classifiche, bacheca, asta) non ancora provate con l'account reale.
- Tenere presente l'indicazione dell'utente: revisione più ampia di
  giocatori/ruoli/squadre prevista prima della prossima stagione.

---

## D024 — Corretto il bug 1 di D023: home page, legacyDb mancante

**Data:** 2026-09-20

**Cosa:** in `index.html` la costante `legacyDb` era usata in 3 punti
(righe 1034, 1077, 1297) come fallback quando la lettura multilega
fallisce, ma **non veniva mai dichiarata** — un `ReferenceError`
silenzioso (catturato da un `try/catch` che lo logga solo come warning)
interrompeva la ricerca della squadra dell'utente. Aggiunta la
dichiarazione mancante accanto a `primaryDb`, che già segue lo stesso
schema: `const legacyDb = window.__LEGACY_DB__ || firebase.firestore();`
(`window.__LEGACY_DB__` è impostato da `resources/firebase-config.js`).

**Fatto:** verificato con l'account reale dell'utente loggato: la home
mostra ora correttamente "La Mia Squadra: Curva gonfi" invece di
"Squadra non trovata". Nessun errore nuovo in console.

**Continuato il test da loggati** su `formazioni.html`, `classifiche.html`,
`bacheca.html`: tutte e tre caricano correttamente con dati reali (rosa,
formazione con foto, classifica squadre, post in bacheca), nessun errore
oltre al solito rumore noto di `fetchOwnersForTeam` (D023, non
bloccante).

**Prossimo passo:** continuare il test su matchday, asta, statistiche,
profilo, store, calendario quando si riprende.

---

## D025 — Contesto per le prossime sessioni: struttura admin e idee future

**Data:** 2026-09-20

**Cosa:**
1. **Struttura admin della lega**: 4 amministratori totali — 2 admin di
   lega "storici", il developer originale (l'amico) come 3° admin, e
   l'utente (Iacopo) sarà il 4° admin/nuovo sviluppatore (da impostare
   domani, vedi punto sopra sull'account non ancora admin).
2. **Esiste già una lista di modifiche/richieste future** compilata dai 2
   admin di lega storici — non ancora condivisa in questa sessione, da
   raccogliere quando disponibile prima di pianificare i prossimi
   miglioramenti.
3. **Foto giocatori mancanti**: l'utente vuole che vengano integrate,
   con uno stile uniforme per tutti i giocatori, ispirato alle vere app
   di fantacalcio. Segnalato come idea per una futura sessione di
   miglioramento (non correzione di bug, è una richiesta di
   funzionalità/estetica).
4. **Direzione concordata sul "potenziamento"**: l'utente ha chiarito
   che non vuole una riscrittura enorme — "migliorarla, anche a livello
   grafico, con qualche chicca in più, niente di esagerato" — ma prima
   serve "la base pulita e solida" (cioè completare questo giro di
   recupero/bugfix prima di aggiungere qualsiasi cosa nuova).

**Perché:** contesto di prodotto da tenere per quando si pianificherà la
prossima fase (miglioramenti/funzionalità), distinta da questa fase di
recupero/stabilizzazione.

**Fatto:** nessuna modifica al codice, solo registrazione del contesto.

**Prossimo passo:** quando si chiude il giro di recupero attuale,
raccogliere la lista di richieste dei 2 admin storici e pianificare con
l'utente le prime migliorie (partendo probabilmente dalle foto
giocatori), tenendo la sequenza: prima stabilità, poi estetica/funzioni
nuove.

---

## D026 — Utente impostato admin: verificato, l'app lo riconosce correttamente

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** l'utente, su indicazione dell'amico, si è aggiunto da solo alla
collezione globale `admins` in Firebase Console (percorso consigliato in
D025/sessione precedente, per evitare il problema del campo "di lega" non
letto correttamente dal codice). Documento creato con ID uguale al proprio
UID (`YnOsJqXKlLdt1V7hu31tGlLZmnD3`) e un campo `email`.

**Scoperta collaterale**: controllati tutti e 4 i documenti della
collezione `admins` — 2 dei 3 admin preesistenti hanno un campo
malformato, letteralmente chiamato `"enabled: true"` con valore vuoto
(errore di battitura fatto nella stessa schermata "Aggiungi un documento"
di Firebase Console: probabilmente scritto tutto insieme nel campo
"Campo" invece di separare nome e valore). **Nessun impatto pratico**: il
codice controlla solo l'esistenza del documento, non i campi al suo
interno. Il documento dell'utente, con solo `email`, è il più pulito dei
quattro. Da segnalare agli altri 2 admin "quando li senti", non urgente.

**Verificato**: `state.isAdmin` è ora `true` su `squadre.html`. Confermata
anche una scoperta secondaria: da admin la pagina mostra di default la
prima squadra della lista (indice 0) invece di quella dell'utente — è
**comportamento voluto dal codice** (`if (!state.isAdmin && ...)
state.selectedTeamIdx = state.userTeamIdx;`, salta l'auto-selezione
proprio quando sei admin), non un ritorno del bug di D023. Inoltre, ora
che l'utente è admin, gli errori `fetchOwnersForTeam` (D023, permission-
denied per i non-admin) sono spariti del tutto — conferma che la diagnosi
di ieri era esatta.

**Fatto:** nessuna modifica al codice, solo verifica. Server locale
riavviato a inizio sessione (si era fermato di nuovo durante la pausa,
come previsto in `CLAUDE.md`).

**Prossimo passo:** ora che l'utente è admin, riprendere da dove
indicato in `CLAUDE.md`/"Riprendi da qui": correggere il ruolo di Jacopo
Pinzauti da `admin-players.html`, poi continuare il test sulle pagine
admin mai provate.

---

## D027 — Prima scrittura reale della sessione: ruolo di Jacopo Pinzauti corretto

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** con l'utente ora admin, corretto il documento
`leagues/4rq1Rr0TquRfuPLmqQTn/players/jacopo_pinzauti`: aggiunto il campo
`role: "Portiere"` (mancante, D023) con una `.update()` mirata — non un
`.set()`, per non toccare gli altri campi esistenti (`ruolo: "P"` lasciato
invariato, non serve rimuoverlo, il codice non lo legge più). Confermato
dall'utente il valore corretto in D023.

**Perché ora e non prima**: bloccato in D023 perché l'account di test non
era admin; l'utente si è procurato i permessi (D026) proprio per poter
chiudere questo punto.

**Fatto:** scrittura eseguita ed **verificata su due fronti**: (1) letto
di nuovo il documento subito dopo la scrittura, campo presente e altri
campi intatti; (2) ricaricata `squadre.html` e controllato
`state.players`: zero giocatori con ruolo mancante/non valido (prima
erano 1 su 32), Jacopo Pinzauti ora finisce correttamente nel gruppo
"Portiere" della lista giocatori.

**Prima scrittura reale su Firestore di produzione in tutta questa serie
di sessioni** — tutte le modifiche precedenti erano state solo al codice
locale, mai al database. Eseguita solo dopo conferma esplicita
dell'utente (data in D023, riconfermata oggi) e solo perché l'account
aveva finalmente i permessi necessari.

**Prossimo passo:** continuare il test sulle pagine admin (`admin.html` e
sotto-pagine), mai provate con login in questa serie di sessioni.

---

## D028 — Test pagine admin: trovato e corretto un link rotto vecchio

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** `admin.html` (l'hub admin, mai testato da loggati finora)
carica correttamente ora che l'utente è admin (prima reindirizzava al
login). Controllati tutti i 19 link del pannello contro i file
realmente presenti: **solo uno rotto**, "Gestione Giornate" puntava a
`admin-giornate.html`, file **mai esistito in questa cartella**. Bug
vecchio: presente anche negli hub admin archiviati (`admin-old.html`,
`admin-organized.html`), quindi non introdotto di recente — semplicemente
mai notato perché nessuno aveva ancora cliccato quella card durante un
test.

Il titolo di `matchday.html` è letteralmente "Fanta Athletic - Giornate"
e la sua funzione (creare giornate, inserire risultati, calcolare
punteggi) combacia esattamente con la descrizione della card ("Crea
giornate, scontri, calcola punteggi fanta") — chiaramente la pagina
giusta. Corretto l'`href` e l'`onclick` della card in `admin.html` da
`admin-giornate.html` a `matchday.html`.

**Fatto:** corretto, verificato cliccando davvero la card nel pannello
admin (non solo controllando il codice): porta ora a `matchday.html`,
che carica con dati reali (giornata G19, punteggi calcolati). Nessun
errore nuovo in console.

**Altri 18 link del pannello admin**: tutti verificati, puntano a file
esistenti — non ci sono altri collegamenti rotti in `admin.html`.

**Prossimo passo:** continuare il test entrando dentro le singole
sotto-pagine admin (giocatori, squadre, regole, setup, ecc.) non solo
verificando che l'hub le raggiunga.

---

## D029 — admin-squadre.html funziona su dati fantasma, non sul database vero

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** `admin-players.html` testato: nessun errore, conta
correttamente 32 giocatori (3 portieri, inclusa la correzione di Jacopo
Pinzauti da D027). `admin-squadre.html` (già corretta ieri in D016 per il
crash da `firebase-init.js` mancante) si apre senza errori, ma mostra
**"Attualmente: 0 squadre"** — mentre sappiamo che ce ne sono 19 vere
(confermato ieri in D023/squadre.html).

**Causa**: come già notato di sfuggita in D016, questa pagina usa
`localStorage.getItem('teams_data')` — un meccanismo di salvataggio
locale del browser, **completamente scollegato da Firestore** (il
database vero). Verificato: `localStorage.getItem('teams_data')` è
`null` nel browser di test. La pagina non ha errori perché non c'è nulla
che vada in crash — semplicemente legge un dato locale mai popolato.

**Perché è degno di nota, anche se non "rotto" in senso stretto**: la
sezione "Zona Pericolosa" di questa pagina (Imposta numero squadre,
Rigenera Calendario, Reset Competizione — descritte come "azioni
irreversibili che influenzano l'intera competizione") **in realtà non
tocca la competizione vera**, perché opera sul `localStorage` vuoto. Il
rischio non è di rompere dati reali, ma di **confondere un admin** che
pensasse di gestire la lega vera da qui e si chiedesse perché "non
succede nulla" nella pratica. Probabile relitto di una versione
precedente/embrionale della gestione squadre, mai completata o mai
ricollegata a Firestore, rimasta comunque raggiungibile dal menu admin
vero.

**Fatto:** solo diagnosi, nessuna modifica al codice — non è chiaro se
questa pagina vada corrisposta al Firestore reale, sostituita
completamente da `squadre.html`/`admin-teams.html`, o rimossa: è una
decisione di prodotto da fare con l'utente, non un bug da correggere al
volo.

**Prossimo passo:** chiedere all'utente se vuole che questa pagina venga
ricollegata ai dati veri, sostituita, o segnalata chiaramente come "non
funzionante rispetto al database" finché non si decide. Continuare il
test sulle altre sotto-pagine admin (`admin-rules.html`,
`admin-setup.html`, `admin-cards-manager.html`, `admin-deadline.html`,
`admin-debug.html`, `admin-calendario.html`).

**Aggiornamento — continuato il test**: `admin-players.html` (32
giocatori, 3 portieri corretti dopo D027, nessun errore),
`admin-rules.html` (101 regole caricate, nessun errore), `admin-setup.html`
(pagina di bootstrap, "Firebase Ready", 97 regole nel JSON locale da
caricare — numero diverso dalle 101 già in Firestore, non allarmante, solo
disallineamento tra il file statico di partenza e quanto aggiunto dopo
via interfaccia) — tutte pulite.

---

## D030 — admin-calendario.html: manca una regola di sicurezza Firestore

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** `admin-calendario.html` mostra un errore reale
(`permission-denied`) nel caricare il calendario, **anche da admin**.
Causa individuata nel codice: legge dalla collezione
`window.db.collection('athletic_calendar')` — un percorso che **non
compare in nessuna regola** delle `firestore.rules` condivise
dall'utente in D007. Firestore nega per difetto qualunque accesso a una
collezione priva di una regola esplicita che lo permetta: per questo
fallisce per chiunque, incluso un admin globale (`isAdmin()` funziona
solo dentro una regola che lo richiama — se la regola per quella
collezione non esiste proprio, non c'è nulla da bypassare).

**Perché non l'ho corretto io**: le regole di sicurezza si modificano
solo dalla Console Firebase (scheda "Regole") o da riga di comando con
le credenziali giuste — non sono un file in questa cartella, non sono
modificabili dall'app né da uno script lato client. È fuori dalla portata
di quello che posso fare direttamente.

**Regola suggerita da aggiungere** (stesso schema di `clubs`/`taxonomies`
già presenti — lettura pubblica, scrittura solo admin, coerente con lo
scopo della pagina, un calendario informativo delle partite reali):

```
match /athletic_calendar/{matchId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

**Fatto:** solo diagnosi e regola proposta, nessuna modifica (non
possibile da qui). L'utente dovrà aggiungerla lui stesso in Console
Firebase.

**Prossimo passo:** l'utente aggiunge la regola quando ha modo di
accedere alla Console Firebase, poi si riverifica `admin-calendario.html`.
Continuare nel frattempo il test sulle sotto-pagine admin rimanenti
(`admin-cards-manager.html`, `admin-deadline.html`, `admin-debug.html`).

---

## D031 — Completato il giro di test sulle pagine admin: ultimi 3 controlli

**Data:** 2026-09-20 (sessione successiva)

**Cosa:**
- `admin-cards-manager.html`: nessun errore. Conferma coerente con quanto
  già saputo: 0 foto caricate su 30/32 giocatori (0% completamento) — in
  linea con l'idea futura dell'utente di aggiungere le foto (D025).
- `admin-deadline.html`: **corretto un bug di codifica del file** — il
  file dichiarava `charset="UTF-8"` ma era salvato fisicamente in
  Windows-1252/Latin-1, causando caratteri accentati mostrati male
  ("mercoled?" invece di "mercoledì"). Convertiti i byte del file al
  formato dichiarato (UTF-8 reale), verificato che ora "mercoledì" e
  "possibilità" si leggono correttamente. **Non recuperabile**: due
  emoji nella stessa pagina risultano già perse in origine (sostituite
  con "?" letterali prima ancora di questo problema di codifica) — non è
  possibile "ricostruirle" da una ri-codifica, resta un difetto
  cosmetico minore, priorità bassissima.
  **Trovato lo stesso problema di codifica anche in**
  `admin-teams.html` e `admin-users.html` (non ancora corretti, pagine di
  stato incerto secondo l'audit iniziale) — e in `clash-cards.html` e
  `wirc-battle.html`, che però fanno parte del cluster giochi in pausa
  (D004) e **non vanno toccati**.
- `admin-debug.html`: pagina di monitoraggio errori integrata
  nell'app stessa — funziona, mostra "0 errori", Firebase connesso,
  utente loggato. Nessun problema.

**Fatto:** 1 correzione di codifica applicata e verificata
(`admin-deadline.html`), il resto solo diagnosi/conferma.

**Riepilogo completo del giro di test sulle pagine admin (D028-D031)**,
in attesa dell'intervento finale concordato con l'utente ("continuiamo e
sistemiamo tutto alla fine"):
1. ✅ Link rotto "Gestione Giornate" → corretto e verificato (D028).
2. ⏳ `admin-squadre.html` su dati fantasma (localStorage, non Firestore)
   — decisione di prodotto da prendere, non ancora risolta (D029).
3. ⏳ Regola Firestore mancante per `athletic_calendar`, blocca
   `admin-calendario.html` per chiunque — serve intervento dell'utente
   in Console Firebase, regola pronta in D030.
4. ✅ Codifica `admin-deadline.html` corretta e verificata (D031).
5. ⏳ Stessa codifica da correggere in `admin-teams.html` e
   `admin-users.html` (bassa priorità, cosmetico).

**Prossimo passo:** con l'utente, decidere l'ordine per chiudere i punti
2, 3, 5 rimasti aperti.

---

## D032 — Punto 5 chiuso: codifica corretta anche in admin-teams.html e admin-users.html

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** stessa correzione di D031 (conversione byte da Windows-1252 a
UTF-8 reale, il tag `<meta charset="UTF-8">` era già presente ma
sbagliato rispetto al contenuto). Verificato in browser su entrambe:
nessun errore, accenti corretti dove presenti. Restano alcune emoji
mostrate come "?"/"???" — stesso caso di `admin-deadline.html`, già
perse nel file originale prima di questo problema, non recuperabili,
cosmetico e non prioritario.

**Scoperta utile per il punto 2 (admin-squadre.html)**: verificato che
**`admin-teams.html`, a differenza di `admin-squadre.html`, è
correttamente collegata ai dati veri** — mostra le squadre reali della
lega con i nomi giusti (non il "localStorage vuoto" di
`admin-squadre.html`). Anche `admin-users.html` funziona bene, mostra i
41 utenti reali registrati. Nessuna delle due è raggiungibile dal menu
`admin.html` attuale (restano pagine "orfane" dalla navigazione, ma
funzionalmente sane).

**Fatto:** correzione applicata e verificata su entrambi i file.

**Prossimo passo:** punto 5 chiuso. Restano punto 2
(`admin-squadre.html`) e punto 3 (regola Firestore mancante per
`athletic_calendar`) — vedi discussione con l'utente su come procedere,
tenendo conto che `admin-teams.html` potrebbe essere già un'alternativa
funzionante per la gestione base delle squadre (anche se non ha le
funzioni "Zona Pericolosa" di `admin-squadre.html`: numero squadre,
rigenera calendario, reset competizione).

---

## D033 — Punto 3 chiuso: regola Firestore pubblicata e verificata

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** l'utente ha aggiunto e pubblicato dalla Console Firebase la
regola proposta in D030 per `athletic_calendar`. Verificato con una
scheda di test completamente nuova (nessun residuo di cronologia
possibile): `admin-calendario.html` carica ora correttamente le partite
reali (G1, G2, G3...), zero errori in console.

**Fatto:** verifica completata, nessuna modifica al codice necessaria
(il codice era già corretto, mancava solo il permesso lato database).

**Prossimo passo:** resta solo il punto 2 (`admin-squadre.html`) — in
discussione con l'utente se archiviarla ora o investire il tempo per
ricollegarla per bene ai dati veri.

---

## D034 — Punto 2 chiuso, e correzione importante: non c'è una stagione in corso

**Data:** 2026-09-20 (sessione successiva)

**Cosa:**
1. **Chiuso il punto 2**: card "Gestione Squadre" in `admin.html`
   ripuntata da `admin-squadre.html` (dati fantasma) ad
   `admin-teams.html` (dati veri, D032). `admin-squadre.html` spostata in
   `archive/admin-legacy/` — verificato zero riferimenti vivi prima di
   spostarla, verificato con un click vero dal menu admin che ora si
   apre `admin-teams.html` con le squadre reali, zero errori in console.
2. **Correzione importante di contesto, non tecnica**: per tutta questa
   sessione (e quella precedente) avevo descritto lo stato del progetto
   come "una stagione in corso" (es. "il sito oggi gira con una sola
   lega attiva", giornata 21, ecc. — D020, D023). **Non è così**:
   l'utente ha chiarito che **la stagione 2025/2026 non è ancora
   iniziata** — tutti i dati visti finora (Curva gonfi, giornata 21,
   punteggi, formazioni) sono **della stagione passata**, non cancellati.
   L'utente sta revisionando l'app in preparazione della stagione nuova,
   non lavorando su una competizione live.

**Perché cambia le valutazioni fatte finora**: alcune cautele di questa
sessione erano calibrate su "non toccare nulla perché c'è gente che ci
gioca sopra ORA" — resta vero che i dati sono reali e vanno trattati con
rispetto, ma **non c'è il rischio di rompere una giornata in corso o
formazioni schierate questa settimana**, perché nessuno sta giocando
attivamente in questo momento. Questo non è un liberi tutti, ma cambia la
finestra temporale entro cui certe azioni (es. le funzioni "Zona
Pericolosa" di `admin-squadre.html", o un futuro reset per la stagione
nuova) sono legittime da programmare con calma, non necessariamente da
evitare per sempre.

**Il piano dell'utente per le prossime fasi, in ordine**:
1. **Finire questa revisione/bugfix** (fase attuale, questa serie di
   sessioni).
2. **Redesign grafico** dell'app.
3. **Aggiungere le funzioni nuove** (foto giocatori con stile uniforme,
   D025, e altre da valutare — inclusa probabilmente la ricostruzione
   per bene delle funzioni di `admin-squadre.html` messe in pausa oggi:
   cambio numero squadre, generazione calendario, reset competizione).
4. **Solo a quel punto**: inserire i giocatori corretti, le squadre
   corrette, impostare la stagione nuova e ripartire con il campionato.

Questo si collega direttamente alla nota già presente in D023 ("revisione
più ampia di giocatori/ruoli/squadre prevista prima della prossima
stagione") — ora è chiaro che fa parte dello stesso piano generale, non
un'osservazione isolata.

**Fatto:** archiviazione e correzione del link eseguite e verificate;
contesto aggiornato in `CLAUDE.md`.

**Prossimo passo:** tutti e 3 i punti aperti (2, 3, 5) sono ora chiusi.
Il giro di test/pulizia di questa serie di sessioni può considerarsi
concluso. Prossimo passo naturale secondo il piano dell'utente: fase di
redesign grafico e nuove funzioni (non ancora iniziata).

---

## D035 — Sweep finale su tutte le pagine rimaste (in corso)

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** l'utente ha chiesto un giro completo su tutte le pagine non
ancora testate (utente e resto), per poter dichiarare concluso il test
di tutto ciò che già esiste, prima di passare alla fase 2 del piano
(redesign). Escluso il cluster giochi (19 file, D004, in pausa per
decisione esplicita — non testato).

**`asta.html`**: nessun errore.

**`statistiche.html`**: **bug reale trovato**, `ensureLeagueReady is not
defined` — la pagina chiama questa funzione ma non carica
`resources/league-helper.js` (che la definisce dal 2026-09-19, D009).
Bug preesistente, non introdotto da questa sessione, mai scoperto prima
perché nessuno aveva ancora testato questa pagina con un login reale.
Corretto aggiungendo lo script mancante, stessa tecnica già usata 5
volte in D009. Verificato con scheda pulita: zero errori dopo la
correzione.

**Fatto finora:** 1 correzione applicata e verificata.

**Prossimo passo:** continuare il giro su tutte le pagine restanti
(elenco completo nella risposta all'utente), aggiornare questa voce con
l'esito finale quando concluso.

**`profile.html`, `store.html`, `calendario.html`**: nessun errore.

**`contest.html`**: stesso tipo di bug di D030 — manca una regola
Firestore per la collezione `contest`, usata da tre punti diversi (letta
e verificata nel codice):
- `contest/matches` (documento, calendario delle partite del contest)
- `contest/scores` (documento, punteggi calcolati per la classifica)
- `contest/predictions/{uid}/{predictionId}` (sottocollezione per
  utente, i pronostici salvati)

Nessuno di questi tre percorsi ha una regola nelle `firestore.rules`
condivise dall'utente — bloccato per chiunque, admin compreso, stesso
meccanismo di D030 (Firestore nega di default). **Serve l'intervento
dell'utente in Console Firebase.** Regola proposta:

```
match /contest/matches {
  allow read: if isSignedIn();
  allow write: if isAdmin();
}

match /contest/scores {
  allow read: if isSignedIn();
  allow write: if isAdmin();
}

match /contest/predictions/{uid}/{predictionId} {
  allow read: if isSignedIn();
  allow write: if isSignedIn() && request.auth.uid == uid;
}
```

Anche `contest-leaderboard.html` (già toccata in D012/D016 solo per la
versione Firebase, mai per questo) userà `contest/scores` — verificato
nel codice, stesso problema.

**Correzione di metodo**: scoperto che il filtro "solo errori" usato per
tutta la sessione **non cattura i `console.warn`** (solo `console.error`
e le eccezioni non gestite) — alcuni degli errori Firestore più
interessanti di oggi (permission-denied "gestiti" con un warning invece
di un errore vero) sarebbero passati inosservati. Rifatto il controllo su
`asta.html` (già segnata erroneamente "pulita") con la lista completa dei
log, non solo gli errori.

**`asta.html`**: **quarto caso della stessa famiglia** — "Auction
listener error", permission-denied su `auction/current` (documento) e
`auction/current/bids` (sottocollezione), usati per leggere/scrivere lo
stato live dell'asta e la cronologia offerte. Nessuna regola nelle
`firestore.rules` per `auction`. Regola proposta:

```
match /auction/current {
  allow read: if isSignedIn();
  allow write: if isSignedIn();

  match /bids/{bidId} {
    allow read: if isSignedIn();
    allow create: if isSignedIn();
  }
}
```

**`notifications.html`**: problema diverso, non di permessi — **manca un
indice composito** in Firestore per la query
`leagues/{id}/notifications` filtrata per `userId` e ordinata per
`createdAt`. Firestore stesso fornisce il link diretto per crearlo con un
clic (recuperato eseguendo la query e leggendo il messaggio di errore
completo):

```
https://console.firebase.google.com/v1/r/project/fanta-athletic/firestore/indexes?create_composite=ClRwcm9qZWN0cy9mYW50YS1hdGhsZXRpYy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90aWZpY2F0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC
```

Anche osservata una stranezza minore (dati utente incompleti in un log
del navbar al primo caricamento) — **ricontrollata con un ricaricamento,
non riprodotta**: probabile fluttuazione temporanea di rete/cache, non un
bug.

**`calendario.html`**: un `console.warn` a bassa priorità
("Impossibile caricare dati cup da lega: cup_schedule/cup_rounds",
permission-denied) — riguarda la funzionalità Coppa, ancora un semplice
stub non completato (`admin-cup.html` dice esplicitamente "Coppa in
Sviluppo"). Il codice gestisce già il fallimento con eleganza (prova più
percorsi, non rompe la pagina). Bassa priorità, non urgente: la
funzionalità stessa non è pronta, quindi la regola mancante non è il
collo di bottiglia principale.

**Osservazione generale**: oggi trovate **4 collezioni Firestore diverse
senza alcuna regola di sicurezza** (`athletic_calendar`, `contest`,
`auction`, e la coppia `cup_schedule`/`cup_rounds` a priorità minore) più
un indice mancante — sembra un pattern sistemico: funzionalità aggiunte
nel tempo (calendario reale, contest pronostici, asta, coppa) senza
aggiornare le regole del database in parallelo. Vale la pena, quando si
aggiornano le regole, ricontrollare se ce ne sono altre ancora non
scoperte.

**`lineup-summary.html`, `scegli-squadra.html` (reindirizza correttamente
a Home, già in una squadra), `join-league.html` (reindirizza
correttamente, già in una lega), `league-invite.html`,
`recap-giornata.html`, `standings.html`, `h2h-standings.html`,
`user-profile-upload.html`**: nessun errore nuovo, solo il consueto
indice mancante per le notifiche (compare su ogni pagina, essendo il
widget notifiche globale — un'unica correzione dell'indice risolve tutte
queste occorrenze insieme).

**`admin-leghe.html`: bug reale grave trovato e corretto** — un
`RangeError: Maximum call stack size exceeded` (ricorsione infinita). La
pagina definiva una funzione locale `computeLeagueTypeFromSportType` con
**lo stesso nome esatto** della funzione condivisa in
`resources/sport-config.js` e una logica interna **identica**
(byte-per-byte): dichiarare la funzione locale (uno script normale, non
un modulo — ogni funzione dichiarata a livello principale diventa
automaticamente `window.NomeFunzione`) sovrascriveva silenziosamente
`window.computeLeagueTypeFromSportType` con se stessa. La funzione
faceva `if (typeof window.computeLeagueTypeFromSportType === 'function')
return window.computeLeagueTypeFromSportType(sportType);` — ma a quel
punto `window.computeLeagueTypeFromSportType` era già se stessa, quindi
si richiamava all'infinito. Rimossa la funzione locale (era comunque un
doppione inutile, la versione condivisa fa esattamente la stessa cosa),
aggiornato l'unico punto che la usava per chiamare
`window.computeLeagueTypeFromSportType(sportType)` direttamente.
Verificato con scheda pulita: zero errori.

**`admin-cup.html`, `admin-store.html`, `cache-buster.html`, `clear-sw.html`,
`force-update.html`, `sblocca-formazioni-temp.html`**: nessun errore.

**`test-foto-live.html`: bug reale trovato e corretto** — la pagina non
caricava affatto `firebase-auth-compat.js` (solo app e firestore),
quindi anche restando loggati altrove nello stesso browser, questa
pagina non aveva mai un contesto di autenticazione attivo e ogni lettura
Firestore veniva trattata come utente anonimo → permission-denied sulla
regola legacy `players` (richiede `isSignedIn()`). Aggiunto lo script
mancante. Verificato **cliccando davvero il bottone "Testa Foto"** (sola
lettura, nessuna scrittura): ora funziona, mostra 32 giocatori totali, 2
con foto già caricata. Nota a margine, non urgente: questo numero (2 con
foto) non coincide con "0 con foto" mostrato da
`admin-cards-manager.html` (D031) — probabile differenza tra la lista
statica JSON usata da Cards Manager e i dati reali completi di Firestore
letti qui direttamente; da capire se si riprende il lavoro sulle foto
(D025). Notato anche "Nome sconosciuto" per i giocatori mostrati — quasi
certamente un altro caso di nome di campo diverso (come `ruolo`/`role`,
D023), non approfondito ora per priorità.

**`upload-foto-giocatori.html`, `upload-rules-to-firestore.html`,
`verifica-squadre-utenti.html`, `privacy.html`, `terms.html`,
`cookie-policy.html`, `download-app.html`, `404.html`**: nessun errore.

**`adsense-verification.html`: bug reale trovato e corretto** — la
pagina caricava `resources/firebase-config.js` senza aver mai caricato
`firebase-firestore-compat.js` (il commento nel codice diceva "Firebase
solo per analytics, non per auth/Firestore" — intento legittimo, ma
`firebase-config.js` assume sempre che Firestore sia già disponibile e
fa `firebase.firestore.bind(firebase)` senza controllare, causando un
crash silenzioso ad ogni visita). Aggiunto lo script mancante (fix
minimo, non toccato il file condiviso usato da altre 70 pagine).
Verificato con scheda pulita: zero errori.

**Ricontrollate con il metodo corretto (log completo, non solo errori)
anche `profile.html` e `store.html`**, già segnate pulite in precedenza
con il metodo vecchio: confermate genuinamente pulite.

## Esito finale del giro di test — D035 concluso

Testate in questa sessione (D023-D035) tutte le pagine attive tranne il
cluster giochi (19 file, D004, in pausa per decisione esplicita
dell'utente). Riepilogo di tutto quello trovato e sistemato:

**Bug di codice corretti e verificati (9 in totale, oggi + sessioni
precedenti di questa serie):**
1. Squadra sbagliata mostrata di default (`squadre.html`, `index.html`) — D023, D024
2. Crash per giocatore con ruolo in formato inatteso (`squadre.html`) — D023
3. Link rotto "Gestione Giornate" (`admin.html`) — D028
4. Codifica file sbagliata, 3 pagine admin — D031, D032
5. `ensureLeagueReady` non definita (`statistiche.html`) — D035
6. Ricorsione infinita per nome di funzione duplicato (`admin-leghe.html`) — D035
7. Libreria di autenticazione mai caricata (`test-foto-live.html`) — D035
8. Medesimo tipo di problema, Firestore invece di auth (`adsense-verification.html`) — D035
9. `admin-squadre.html` su dati fantasma → archiviata, non "corretta" — D034

**Regole/indici Firestore mancanti, segnalati all'utente (4, servono
azioni in Console Firebase, non modificabili da qui):**
1. `athletic_calendar` — regola aggiunta e verificata (D030, D033) ✅
2. `contest` (matches/scores/predictions) — regola proposta, **da fare**
3. `auction` (current/bids) — regola proposta, **da fare**
4. Indice composito per `notifications` (userId + createdAt) — link diretto fornito, **da fare** (risolverebbe l'errore su OGNI pagina in un colpo solo, essendo il widget notifiche globale)

**Bassa priorità, non urgente (funzionalità già note come incomplete):**
- `cup_schedule`/`cup_rounds` senza regola — collegato alla Coppa, ancora
  "in sviluppo" per stessa ammissione del progetto (`admin-cup.html`)

**Verdetto**: il giro di test di tutto ciò che già esiste può
considerarsi **concluso**. Tutti i bug di codice trovati sono stati
corretti e verificati uno per uno. Restano 3 azioni lato database che
solo l'utente può fare (2 regole + 1 indice, tutte pronte da incollare/
cliccare) prima di poter dire che anche quelle funzionalità (contest,
asta, notifiche) sono davvero a posto end-to-end — il codice è pronto,
manca solo il permesso Firestore.

## D036 — Fase 1 (revisione/bugfix) chiusa ufficialmente, si passa alla Fase 2

Confermato esplicitamente dall'utente il 2026-09-20: la Fase 1 del piano
generale (vedi `CLAUDE.md`) è chiusa. Non si torna a ritestare le pagine
già verificate in D023-D035 salvo segnalazione di un problema specifico.

Le 3 azioni in Console Firebase ancora aperte (regola `contest`, regola
`auction`, indice `notifications` — testo pronto in D035) **non
bloccano** l'inizio della Fase 2: sono permessi di database indipendenti
dal lavoro di redesign, restano tracciate in `docs/PUNTI_APERTI.md` finché
l'utente non le esegue.

Prossimo passo naturale per aprire la Fase 2 (redesign grafico): recuperare
dall'utente la lista di richieste già raccolta dai 2 admin storici della
lega (mai condivisa con Claude finora, citata per la prima volta in D025).

## D037 — Le 3 azioni Firebase Console chiuse, verificate; trovato e corretto un bug nuovo in contest.html

**Data:** 2026-09-20 (sessione successiva)

**Fatto dall'utente in Console Firebase:**
1. Indice composito per `notifications` (userId + createdAt) — creato, stato "Abilitato".
2. Regole per `contest` (matches/scores/predictions) e `auction`
   (current/bids) — pubblicate, incollando il testo completo del file
   `firestore.rules` con i due blocchi nuovi aggiunti in fondo (dopo
   `athletic_calendar`). Confermato che la cronologia delle versioni in
   Console Firebase non viene persa sostituendo il testo integrale: ogni
   pubblicazione crea semplicemente una nuova voce in cima, le precedenti
   restano consultabili/ripristinabili.

**Verificato da Claude nel browser, con l'account reale dell'utente
(admin):**
- `contest.html`: **nessun errore di permessi**. La regola funziona.
- `asta.html`: **nessun errore "Auction listener error"**. La regola
  funziona. Pagina mostra correttamente "in attesa che l'admin avvii
  l'asta" (nessuna asta attiva ora, stato corretto).

**Bug nuovo scoperto durante la verifica di `contest.html`** (era
nascosto dietro l'errore di permessi, non visibile finché quello
bloccava tutto): la funzione che calcola la scadenza dei pronostici
leggeva `match.date` aspettandosi un'unica stringa "22 Ottobre", ma
`athletic_calendar` salva giorno e mese in **due campi separati**
(`date: "22"`, `month: "Ottobre"`) e l'ora come sola ora senza minuti
(`time: "21"`, non "21:00"). Il risultato era una data non valida
("Invalid time value"), che impediva il caricamento delle giornate dal
calendario reale — il menu "Seleziona Giornata" restava vuoto.

**Corretto**: la funzione ora legge `match.date` e `match.month`
separatamente (invece di provare a spezzare un'unica stringa mai
esistita) e gestisce `match.time` sia nel formato "21" (sola ora) sia
"21:00" (ora:minuti). Verificato con una scheda pulita: il menu
"Seleziona Giornata" ora si popola correttamente da G1 a G24, zero
errori in console.

**Nota per il futuro, non un bug**: la stessa funzione calcola l'anno
della partita con una regola fissa (`monthIndex >= 8 ? 2024 : 2025`,
cioè stagione 2024/2025) — coerente con il fatto che tutti i dati visti
finora sono della stagione passata (D034). Andrà aggiornata quando si
imposteranno i dati della stagione nuova (Fase 4 del piano generale),
non prima.

**Esito**: tutte e 3 le azioni Firebase erano effettivamente le uniche
rimaste, come previsto in D035/D036. Nessun'altra azione in sospeso per
chiudere davvero il lavoro di revisione iniziale — bug di codice trovati
in totale: 10 (i 9 di D023-D035 + questo).

## D038 — Ricevuta la lista di richieste dei 2 admin storici della lega

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** l'utente ha condiviso la lista di modifiche/funzioni richieste
dai 2 admin storici della lega (mai arrivata finora, citata per la prima
volta in D025). Archiviata come "modifiche future" per la Fase 3,
insieme a quanto già annotato in precedenza. **Non si implementa ora**:
l'utente ha chiesto esplicitamente di sistemare prima un po' di design
(Fase 2) e passare alle modifiche strutturali solo dopo.

**Lista ricevuta (testuale, dagli admin):**
1. Interfaccia di "betting" fittizio sul risultato della partita, con
   sondaggio vittoria/pareggio/sconfitta.
2. Pannello di controllo admin per inserire bonus/malus.
3. Bonus e malus da modificare rispetto all'elenco attuale (non ancora
   ricevuto il dettaglio di cosa cambiare).
4. Scontri diretti tra squadre — nuova funzione, "più stile fantacalcio
   che Fanta Sanremo".
5. Aggiornamento della lista giocatori (cessioni e nuovi ingressi).

**Prima ricognizione nel codice esistente (da verificare con calma
quando si riprende in Fase 3, non blocca l'archiviazione della lista
ora):**
- Punto 1 sembra diverso da `contest.html`, che già esiste ma con un
  meccanico differente: lì si indovina il **risultato esatto** (es.
  "2-1"), non si vota tra vittoria/pareggio/sconfitta. Da capire se è
  un'evoluzione/sostituzione di `contest.html` o una funzione separata.
- Punti 2 e 3 si intrecciano con quanto già esiste: `admin-rules.html`
  è già un pannello admin per il catalogo di bonus/malus (101 regole
  già in Firestore, D016/D032), e `matchday.html` già applica quelle
  regole per singolo giocatore/giornata tramite checkbox (verificato nel
  codice, righe con `prules`/`crules`/`vrules`). Da capire con gli admin
  se vogliono: (a) solo cambiare i valori/nomi delle regole esistenti,
  o (b) un'interfaccia diversa da quella attuale.
- Punto 4 potrebbe sovrapporsi con una funzione "scontri diretti" **già
  esistente** nel codice: `h2h-standings.html` ("Classifica Scontri
  Diretti"), più le collezioni `h2h_schedule`/`h2h_results` (per lega e
  legacy) viste nelle regole Firestore. Da chiarire con gli admin se
  intendono sostituire/ridisegnare quella già presente o è
  effettivamente un meccanismo diverso.
- Punto 5 è aggiornamento dati (non una funzione da costruire),
  collegato naturalmente alla Fase 4 (nuova stagione, giocatori
  corretti) del piano generale — ma potrebbe anche essere anticipato se
  gli admin vogliono correggere la rosa attuale prima ancora di
  ripartire.

**Prossimo passo:** procedere ora con la Fase 2 (redesign grafico, per
esplicita richiesta dell'utente). Tornare su questa lista con gli admin
per i chiarimenti sopra quando si arriva alla Fase 3.

## D039 — Fase 2 (redesign) avviata: primo cambiamento, il font

**Data:** 2026-09-20 (sessione successiva)

**Contesto:** l'utente ha dato una prima indicazione generale per il
redesign (D038 sequenza confermata: prima design, poi le modifiche
strutturali): stile "vecchio", font "troppo standalone", banner/menu
sproporzionati, testi che si sovrappongono, interfaccia da ripulire.

**Ricognizione fatta prima di toccare codice:** verificato che
**54 delle 74 pagine attive** condividono un unico foglio di stile
(`resources/sheet.css`, con variabili CSS per colori/font/spaziature) —
un redesign lì si riflette automaticamente ovunque, senza dover toccare
pagina per pagina. Fanno eccezione 3 pagine utente con stile proprio,
separato (`contest.html`, `contest-leaderboard.html`,
`calendario-athletic.html`) e alcuni strumenti admin/cluster giochi,
non prioritari.

**Fatto:** cambiato il font da quello di sistema (Segoe UI/Arial,
percepito "anonimo") a **Inter** (font moderno, molto diffuso nelle app
recenti, gratuito), con lo stack di sistema tenuto come riserva se il
font esterno non si carica. Modificato **un solo punto**
(`resources/sheet.css`, variabile `--font-sans`).

**Lezione tecnica trovata sul momento**: cambiare il contenuto di
`sheet.css` non basta — tutte le pagine lo richiamano con un numero di
versione nell'indirizzo (es. `?v=202510172227`) usato apposta per
"rompere" la cache del browser; lasciandolo invariato, browser (mio e
degli utenti) continuano a servire la versione vecchia anche dopo la
modifica. Aggiornata la versione su **tutte e 49 le occorrenze** nei
file `.html` (erano già disallineate tra loro prima di questa sessione:
alcune senza versione, alcune con 4 numeri diversi — ora tutte unificate
a `?v=20260920-redesign1`). Da ripetere (nuovo numero) ogni volta che si
tocca `sheet.css` in questa fase.

**Verificato**: font caricato correttamente (controllato via
`document.fonts`), nessun errore nuovo in console, testato desktop e
mobile su `index.html` e `squadre.html`.

**Prossimo passo:** l'utente sta guardando l'app con il font nuovo per
farsi un'idea e preparare una lista più precisa di cosa cambiare
(proporzioni banner/menu, sovrapposizioni, pulizia generale). Le
richieste dei 2 admin storici (D038) restano in coda per la Fase 3,
dopo il redesign.

## D040 — Prima lista di design del utente: doppione, angoli, spaziatura

**Data:** 2026-09-20 (sessione successiva)

**Segnalato dall'utente** (screenshot della home): il tab "Fanta Athletic"
sotto l'intestazione sembra un doppione, gli angoli non sono coerenti
(alcuni tondeggianti, altri squadrati), lo spazio verso il banner "La
Mia Squadra" è eccessivo. Chiesto anche di controllare e correggere le
stesse ridondanze nel resto dell'app.

**Diagnosi:**
1. **Doppione reale**: l'intestazione mostra già un badge automatico
   "NOME LEGA · stagione" (generato da `resources/navbar.js`), e subito
   sotto il tab selettore lega (da `resources/league-selector.js`)
   ripete lo stesso nome. Sono due file **condivisi da quasi tutte le
   pagine**, quindi il doppione non è solo sulla home.
2. **Angoli incoerenti**: il tab selettore lega usava un arrotondamento
   di 8px, mentre badge/pulsanti/barra di navigazione nel resto dell'app
   usano già uno stile "a pillola" (arrotondamento pieno, 999px) — era
   l'elemento fuori standard, non il resto dell'app.
3. **Spaziatura eccessiva**: 4 margini diversi si sommavano uno sopra
   l'altro tra il tab lega e il banner sotto (margine del tab, spaziatura
   del layout della pagina, padding del contenitore, margine proprio del
   banner) — nessuno dei quattro guardava gli altri tre.

**Corretto:**
- `resources/navbar.js`: il badge in alto ora mostra solo sport/stagione
  (es. "2025/2026"), non più il nome lega — elimina il doppione
  ovunque compare (quasi tutte le pagine).
- `resources/league-selector.js`: raggio del tab selettore lega portato
  a 999px (coerente con badge/nav esistenti); rimosso il margine
  proprio del contenitore mobile, la spaziatura ora è affidata solo al
  gap del layout condiviso.
- `index.html`: rimosso il margine proprio duplicato del banner "La Mia
  Squadra" (ridondante con il padding del contenitore, specifico di
  questa pagina).
- Versione cache aggiornata su tutte le pagine per `navbar.js` e
  `league-selector.js` (stessa necessità già vista per `sheet.css` in
  D039), altrimenti il browser continua a mostrare le versioni vecchie.

**Verificato**: `index.html` (desktop e mobile) e `bacheca.html`
(desktop) — doppione sparito, angoli coerenti, spaziatura
proporzionata, nessun errore in console su nessuna delle due.

**Osservazione a parte, non toccata**: durante questa correzione notato
in `index.html` un blocco `@media (min-width: 1200px)` per una colonna
pubblicitaria laterale, annidato per errore dentro un
`@media (max-width: 600px)` — le due condizioni non possono mai essere
vere insieme, quindi quella colonna non si attiva mai. Bug preesistente,
non collegato a questa sessione di design, probabilmente codice per una
funzione pubblicitaria mai attivata. Segnalato per una correzione futura,
non urgente.

**Prossimo passo**: l'utente continua a guardare l'app pagina per pagina
e segnala altri punti da sistemare.

## D041 — Rimosso lo "sfondo intermedio" e uniformata la forma di pulsanti/menu

**Data:** 2026-09-20 (sessione successiva)

**Segnalato dall'utente** (screenshot del tab lega): un alone/sfondo
visibile tra il tab e lo sfondo pagina, "non so perché è così". Chiesto
anche di allineare tutti i pulsanti/menu alla forma del tab "Fanta
Athletic" (angoli pieni "a pillola"), per iniziare a unificare lo stile.

**Diagnosi dell'alone**: il contenitore attorno al tab
(`.league-selector-mobile`, in `resources/league-selector.js`) aveva un
proprio sfondo (#1e293b in tema scuro), bordo inferiore e ombra propri —
un secondo "strato" visibile tra la pagina e il tab vero e proprio, che
in tema scuro aveva addirittura lo stesso colore dello sfondo pagina
(quasi invisibile), lasciando visibile solo il contenitore esterno.

**Corretto**:
- `resources/league-selector.js`: tolto sfondo/bordo/ombra dal
  contenitore (resta solo un layout vuoto); spostato il colore visibile
  del tab direttamente sul pulsante stesso, che ora è l'unico strato
  colorato.
- `resources/sheet.css`: uniformato l'arrotondamento a "pillola" (999px,
  stesso valore già usato da tab lega, badge e barra di navigazione) su
  tutti gli elementi pulsante/menu condivisi trovati fuori standard:
  `.btn`/`.btn-secondary` (pulsanti generici), `.btn-detail`, `.tab`
  (usato in `matchday.html` per i filtri Giocatori/Coach/Curva/Squadre),
  `.chip` (filtri per ruolo), `.role-count` (contatore ruolo), `.bottom-
  nav-item` (barra di navigazione in basso), `.hamburger-btn` (icona
  menu ☰ in alto a sinistra).
- Aggiornata di nuovo la versione cache di `sheet.css` e
  `league-selector.js` su tutte le pagine (stessa necessità di D039/D040).

**Non toccato di proposito**: i pannelli dei menu a tendina (es. il menu
che si apre cliccando sul tab lega) restano con il loro arrotondamento
attuale (12px) — sono contenitori grandi con liste dentro, categoria
diversa da un "pulsante/tab"; renderli anch'essi a pillola avrebbe dato
un effetto "stadio" innaturale su un pannello alto. Segnalato
esplicitamente, da confermare con l'utente se vuole includerli comunque
in un giro successivo.

**Verificato**: `index.html` (alone sparito, tab pulito) e
`matchday.html` (tab filtri, chip ruoli, pulsanti azione tutti coerenti
"a pillola") — nessun errore in console su nessuna delle due.

**Prossimo passo**: l'utente continua a scorrere l'app e segnala altri
punti.

## D042 — Trovata la causa vera dei "non vedo modifiche": il server locale, non il codice

**Data:** 2026-09-20 (sessione successiva)

**Segnalato dall'utente**: dopo D041, "non vedo modifiche, per me sembra
tutto come prima".

**Causa reale**: non un problema nel codice (le modifiche erano corrette
sul disco, verificate) ma nel server di prova locale
(`python3 -m http.server`, avviato da `.claude/launch.json`), che non
manda alcun header anti-cache. Il browser quindi può mostrare pagine,
script o fogli di stile già visti in questa sessione anche dopo una
modifica — non solo quando manca un parametro anti-cache nell'indirizzo
(lezione già nota di D016), ma **anche con un semplice click su un link
interno dell'app** (es. i pulsanti della barra di navigazione in basso),
perché quei link non hanno mai un parametro di versione. Bastava che
l'utente cliccasse in giro nell'app per rivedere pagine vecchie.

**Corretto alla radice**: creato `.claude/no-cache-server.py`, un
server locale equivalente ma che aggiunge `Cache-Control: no-store` (e
`Pragma`/`Expires`) a ogni risposta — il browser non tiene più nulla in
cache durante lo sviluppo. Aggiornato `.claude/launch.json` per usare
questo script al posto di `python -m http.server`. Riguarda solo
l'ambiente di prova locale, nessun effetto sul sito reale.

**Metodo per il resto della Fase 2 (richiesto esplicitamente
dall'utente)**: da ora, dopo ogni modifica visiva, fermo e riavvio il
server e ricarico la pagina **io stesso** prima di dire all'utente che è
pronta da guardare — non deve più essere l'utente a doversi ricordare
di aggiornare o evitare la cache.

**Verificato**: header `Cache-Control: no-store` presente nella
risposta del server; ricaricata la pagina nella stessa scheda condivisa
con l'utente, le correzioni di D040/D041 sono visibili correttamente
(tab arrotondato, badge senza doppioni, pulsanti "Salva/Svuota" e barra
di navigazione a pillola).

## D043 — Causa reale del "doppio bordo" persistente: doppio caricamento dello stesso script

**Data:** 2026-09-20 (sessione successiva)

**Segnalato dall'utente**: dopo D042 (fix del server), il tab lega
mostrava ancora l'alone/doppio bordo di D041, con uno screenshot che lo
confermava chiaramente.

**Causa reale, stavolta nel codice, non nella cache**: `resources/
app-init.js` inietta dinamicamente **una seconda copia** di
`league-selector.js`, con un numero di versione proprio (`?v=2025101905`,
mai aggiornato da nessuna sessione precedente), indipendente dal tag
`<script>` principale nelle pagine. La pagina caricava quindi lo stesso
file due volte con due indirizzi diversi: la funzione che inietta lo
stile nel file (`injectStyles`) si blocca al primo inserimento
(controllo "già presente, non rifare"), quindi **la prima copia a
partire vince** — e il browser, avendo già in cache quell'indirizzo
specifico (`?v=2025101905`) da molto prima di questa sessione, poteva
tornare a servire il file con il CSS vecchio da lì, vanificando la mia
correzione anche a server sistemato.

**Trovato anche un secondo problema reale nel CSS** durante la verifica:
la correzione di D041 aveva tolto lo sfondo del contenitore solo per il
tema chiaro — la stessa proprietà era ripetuta anche nella regola per il
tema scuro (`:root.dark .league-selector-mobile`), che l'app usa di
default, e lì non era stata toccata.

**Corretto**:
- `resources/app-init.js`: aggiornato il riferimento interno a
  `league-selector.js` alla versione corrente.
- `resources/league-selector.js`: rimosso lo sfondo/bordo duplicato
  anche dalla regola del tema scuro.
- Aggiornata la versione cache di `league-selector.js` e `app-init.js`
  (quest'ultimo mai versionato prima su 21 pagine — aggiunto per la
  prima volta un parametro di versione, così si potrà aggiornare in
  sicurezza anche in futuro).

**Verificato con controlli automatici** (non solo screenshot, per
essere certi): via console, confermato un solo script caricato con la
versione corretta, sfondo del contenitore trasparente, ombra assente,
raggio del tab a 999px. Riscontro visivo positivo su schermata pulita.

**Lezione di metodo**: un fix di cache lato server (D042) non basta se
il bug è un doppio caricamento dello stesso file da un punto nascosto
del codice (qui, un "loader" dinamico dentro un altro file JS, non un
tag `<script>` visibile nell'HTML). Da ora, quando una correzione visiva
non si vede nonostante server e cache siano a posto, controllare anche
se lo stesso file venga caricato più volte da punti diversi (grep del
nome file su tutta la cartella `resources/`, non solo sui file `.html`).

## D044 — Fix definitivo della cache: cambiata la porta del server locale

**Data:** 2026-09-20 (sessione successiva)

**Segnalato dall'utente**: il tab era corretto su "home" e "squadre" ma
ancora con l'alone su "bacheca"; tornando su "home" è ricomparso l'alone
anche lì. Richiesta esplicita: quando si corregge un elemento ridondante,
verificarlo **ovunque** compaia nell'app, non solo sulle pagine
controllate al momento.

**Causa reale, definitiva**: il fix di D042 (header anti-cache sul
server) impedisce alla cache di formarsi **da quel momento in poi**, ma
non cancella le pagine già salvate dal browser **prima** di quel fix —
e questa sessione di test è andata avanti per ore, visitando ogni pagina
più volte fin da stamattina. Pagine come `bacheca.html`, visitate la
prima volta molto prima di oggi, erano rimaste "congelate" nella cache
del browser con la versione di allora (font di sistema, tab squadrato,
script vecchissimi) — e un semplice click su un link interno (che non ha
mai un parametro anti-cache) poteva far riemergere quella copia vecchia
in qualunque momento, spiegando perché il problema "si spostava" da una
pagina all'altra in modo apparentemente casuale.

**Fix definitivo**: cambiata la porta del server locale da 8899 a 8912
in `.claude/launch.json`. Per il browser, un indirizzo con porta diversa
è un sito completamente nuovo, senza nessuna cache pregressa — non serve
più nessun trucco (`?v=`, `?_cb=`) per garantire di vedere sempre
l'ultima versione, la porta nuova parte "pulita" per definizione.

**Effetto collaterale spiegato all'utente prima che lo notasse**:
cambiare porta cambia anche l'indirizzo da cui l'app legge la sessione
di accesso salvata nel browser — il login è stato perso una volta, va
rifatto (fatto dall'utente stesso, non da Claude, come da regola di
sicurezza). Dopo il nuovo login, tutto il resto (squadra, permessi
admin) torna come prima.

**Verificato con controlli automatici su tutte e 3 le pagine segnalate**
(`index.html`, `squadre.html`, `bacheca.html`, ciascuna su una scheda
pulita separata): contenitore del tab trasparente, nessuna ombra, raggio
a 999px, un solo caricamento del file corretto — su tutte e 3, nessuna
eccezione.

**Regola di lavoro adottata da qui in avanti per il resto della Fase 2**
(richiesta esplicita dell'utente): quando si corregge un elemento
condiviso (ridondanza, forma, colore...), verificarlo su **più pagine
diverse** prima di dire che è risolto, non fermarsi alla prima pagina
che sembra a posto — un fix su un file condiviso può sembrare corretto
in un punto e non esserlo altrove per motivi indipendenti dal fix stesso
(come in questo caso, la cache).

## D045 — Colori ufficiali confermati dal logo + Instagram di riferimento

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** l'utente ha condiviso il logo ufficiale di Athletic 2018 e
confermato: i colori dell'app vanno ricostruiti da zero unificando tutto
sotto rosso e blu (i colori della squadra, usati anche nei cori), presi
con riferimento dal logo — poi si valuta se "smorzarli" (renderli meno
intensi) una volta visto l'effetto generale.

**Colori campionati con precisione dal file del logo** (non a occhio,
via script Python su pixel reali dell'immagine):
- Rosso (stella): `#920100` — un rosso mattone/bordeaux scuro, più cupo
  dell'attuale `#dc143c` (rosso acceso tipo "crimson").
- Blu navy (sfondo): `#0c0f6d` — blu notte profondo, più scuro
  dell'attuale `#1e3a8a`.
- Oro (piccola foglia, dettaglio minore): `#b08937` — non usato per ora,
  annotato per un eventuale accento futuro (es. evidenziare il miglior
  giocatore/il primo in classifica), da NON usare come colore decorativo
  diffuso.

**Riferimento utile per il futuro**: Instagram ufficiale della squadra,
`https://www.instagram.com/athletic.2018/` — segnalato dall'utente come
possibile fonte futura (es. foto per il lavoro sui giocatori, D025).

**Verifica pratica fatta subito**: cambiata la variabile CSS
`--primary`/`--secondary` in `resources/sheet.css` (usata già in 188
punti diversi del sito per il rosso) e mostrato il risultato live
sull'intestazione della home — confermato dall'utente che il risultato
va bene, e che la sensazione "clash" viene proprio dal fatto che il
resto dell'app (gradienti scritti a mano) non segue ancora questi
colori. Richiesta esplicita: procedere a sistemarli ovunque prima di
valutare se attenuarli, per "rendersi conto dell'effetto generale" (per
ora erano visibili in troppo pochi punti per giudicare).

**Scoperta collaterale utile**: il tema **chiaro** è in realtà il tema
di default dell'app (`resources/theme-preload.js`, chiave
`fantaAthletic_theme`, default `'light'`) — il tema scuro visto per
tutta la sessione era un'impostazione salvata dall'utente nel browser,
persa con il cambio di porta di D044. Da ricordare: controllare il
redesign in **entrambi** i temi, non solo quello scuro.

---

## D046 — Sostituiti tutti i colori "fuori standard" con rosso/blu del logo

**Data:** 2026-09-20 (sessione successiva)

**Cosa:** su richiesta esplicita dell'utente ("procedi con la
sistemazione ovunque"), sostituiti sistematicamente tutti i colori
decorativi non coerenti con rosso/blu Athletic, su tutte le 54 pagine
attive (cluster giochi escluso, D004) più i file JS/CSS condivisi.

**Metodo**: script Python con sostituzione di stringa esatta (non
regex generica) per ogni combinazione di colore "fuori standard"
trovata, sia in formato esadecimale che decimale (rgba), per non
rischiare di toccare colori non intenzionali:
- Gradiente viola-indaco/rosa `#667eea`/`#764ba2` (il più diffuso, 40+
  occorrenze) → gradiente navy-rosso `#0c0f6d`/`#920100`, stesso verso
  già usato nell'intestazione.
- Varianti di indaco/violetto/magenta decorative (`#6366f1`, `#ec4899`,
  `#8b5cf6`, `#3b82f6` quando usati in coppia con questi) → stessa
  coppia navy/rosso.
- Le 5-6 varianti leggermente diverse di "rosso acceso → rosso scuro"
  usate qua e là (`#dc143c`, `#dc2626`, `#d91847`, `#991b1b`,
  `#7f1d1d`, `#8b0000`, `#b91846`, `#b01030`) → consolidate in un'unica
  coppia coerente (`#920100` base, `#740100` hover, `#5c0000` per gli
  stop più scuri dei gradienti).

**Totale**: 268 sostituzioni su 38 file (34 pagine attive + 4 file
condivisi: `sheet.css`, `notifications-dropdown.js`, `auth-guard.js`,
`classifiche-preview.js`, oltre a `league-selector.js`, `pwa-install.js`,
`cookie-consent.js`, `footer.js` toccati per la versione cache).

**Lasciato volutamente invariato** (non è "clash decorativo", ha un
significato funzionale):
- Verde per "Salva/Conferma", arancione per azioni intermedie, grigio
  per azioni neutre (visti ad es. in `matchday.html`).
- Colori del podio (oro/argento/bronzo in classifica).
- Grigi/blu neutri delle card (`#1e293b`/`#0f172a`, ecc.) — non erano
  parte del problema.
- Oro/ambra (`#fde68a`/`#fbbf24`/`#f59e0b`) e rosa pastello
  (`#fecaca`/`#fca5a5`) — non toccati in questo giro, da rivedere
  insieme se si vuole eliminarli o tenerli come accento sporadico
  (l'oro in particolare richiama la foglia nel logo).

**Aggiornata la versione cache** di tutti i file condivisi toccati
(unificata a `?v=20260920-colors1`).

**Verificato**: `index.html` (tema chiaro e scuro), `classifiche.html`,
`matchday.html` — intestazione e banner ora usano lo stesso gradiente
navy-rosso, pulsanti funzionali (verde/arancione/grigio) intatti,
colori podio intatti, zero errori in console su tutte e 3.

**Prossimo passo**: l'utente valuta l'effetto generale su più pagine;
poi si decide se attenuare l'intensità dei due colori (più desaturati/
chiari) o tenerli così.

## D047 — Verdi unificati al colore del campo, pulsante bacheca corretto, tendine squadre allineate

**Data:** 2026-09-20 (sessione successiva)

**Feedback dell'utente**: i colori ufficiali (rosso/blu dal logo) sono
piaciuti molto. Richiesto: (1) prendere il verde del campo da calcio di
`formazioni.html` e usarlo per unificare tutti i pulsanti verdi; (2) in
`bacheca.html` il pulsante "Pubblica come squadra" da blu a verde; (3)
segnalare eventuali pulsanti di colori diversi da rosso/blu/verde/grigio
(emoji escluse); (4) in `squadre.html` i menu a tendina non erano stati
allineati allo stile arrotondato del tab lega.

**Verde scelto**: `#16a34a` (base) / `#15803d` (variante scura/hover) —
sono i due colori più vivi del gradiente radiale del campo in
`.pitch` (`formazioni.html`), non un colore nuovo inventato.

**Sostituite 49 occorrenze su 24 file**: erano in uso **6 verdi diversi**
per pulsanti "successo/salva" (`#10b981`, `#059669`, `#22c55e`,
`#2ecc71`, `#27ae60`, `#28a745|), sparsi tra pagine admin, contest,
classifiche, giornate, ecc. — stesso tipo di "mosaico" già visto per
rosso/blu, ora consolidato in una sola coppia coerente con il campo da
gioco.

**`bacheca.html`**: pulsante "Pubblica come squadra" cambiato da blu
(`#1e40af`) a verde brand (`#16a34a`), angoli arrotondati a pillola
(era 8px, coerente con l'unificazione di forma di D041).

**`squadre.html` (e tutte le pagine che usano le stesse classi
condivise)**: aggiunta in `resources/sheet.css` una regola per menu a
tendina e campi su una riga (`select`, input di testo/email/numero/
ricerca, classe `.input`) con lo stesso arrotondamento a pillola del tab
lega (999px) — **esclusa la textarea**, che con angoli così estremi su
un riquadro alto avrebbe un aspetto innaturale. Effetto visibile su
tutte le 13 pagine che usano `.input` o i tipi di campo elencati, non
solo su Squadre.

**Colori "diversi da rosso/blu/verde/grigio" trovati, segnalati come
richiesto — nessuno toccato, da decidere insieme**:
- **Giallo/ambra** `#f59e0b` (bordo `#d97706`): pulsante "Salva Live" in
  `matchday.html` — sembra un colore intenzionale ("salvataggio
  temporaneo/in corso", diverso dal salvataggio definitivo verde), non
  necessariamente un errore.
- **Giallo/ambra** `#ffc107`: pulsante "Attenzione" (`.btn-warning`) in
  `cache-buster.html` — stesso discorso, probabile scelta intenzionale
  per un avviso.
- **Oro/ambra decorativo** (`#fde68a`/`#fbbf24`/`#f59e0b` in gradiente) e
  **rosa pastello** (`#fecaca`/`#fca5a5`) — già segnalati in D046, non
  ancora decisi.
- Trovate anche **sfumature diverse di rosso e blu** non ancora allineate
  al brand (es. `#e74c3c`/`#3498db` per toast di errore/info in
  `bacheca.html`, `#dc3545`/`#e53e3e`/`#ef4444` per pulsanti "elimina" in
  alcune pagine admin, `#2d6cdf`/`#1e5bbf` per un pulsante primario in
  `admin-calendario.html`) — restano nella stessa famiglia rosso/blu
  quindi non sono "un colore diverso", ma sono comunque leggermente
  fuori dal brand esatto; non toccate in questo giro, da vedere se
  allinearle anche loro in un prossimo passaggio.

**Verificato**: `squadre.html` (tendine arrotondate, campo formazione
verde, nessun errore), `bacheca.html` (pulsante verde arrotondato,
pulsante "Pubblica" rosso brand), `matchday.html` (pulsante "Salva
giornata" verde campo, "Reset" grigio, "Salva Live" ambra intatto) — zero
errori console su tutte e 3.

## D048 — Sfumature rosso/blu allineate, oro/giallo unificato, icone barra colorate, bug di contrasto risolto

**Data:** 2026-09-20 (sessione successiva)

**Richiesto dall'utente**: (1) sistemare le sfumature di rosso/blu
segnalate come "da decidere" in D047 — confermato di procedere; (2)
prendere il giallo/oro del bordo della card "capitano" e unificare tutti
i dettagli gialli/oro dell'app; (3) colorare le icone della barra di
navigazione in basso; (4) colorare i "pallini" e il punteggio nella
card "Top giocatori settimana".

**1) Sfumature rosso/blu**: sostituiti altri 136 casi su 32 file — toast
di errore/informazione (`#e74c3c`→rosso brand, `#3498db`→blu brand),
pulsanti "elimina" con rosso non allineato (`#dc3545`, `#e53e3e`,
`#ef4444`), un pulsante primario con blu non allineato in
`admin-calendario.html` (`#2d6cdf`).

**2) Oro/giallo unificato**: colore di riferimento preso dal bordo
"capitano" già esistente in `formazioni.html`/`squadre.html`
(`#facc15` base, `#fde047` per la variante chiara) — sostituite 57
occorrenze su 24 file, tra cui il colore "oro" del podio classifiche,
diversi pulsanti di avviso/successo scritti con gialli diversi tra loro
(`#ffd700`, `#f59e0b`, `#ffc107`, `#fbbf24`, `#f39c12`, e altri 8 casi
minori).

**3) Icone barra di navigazione**: erano immagini PNG nere semplici
(non testo, non colorabili via CSS `color`) — quindi non seguivano mai
lo stato attivo/inattivo nonostante l'etichetta sotto sì. Ricolorate
direttamente i file immagine (`resources/icons/*.png`): grigio-blu
(`#94a3b8`, stesso valore già usato altrove per il testo secondario) per
lo stato normale, e create 5 nuove varianti `*-active.png` in rosso
brand (`#920100`) per la sezione corrente. Aggiornato
`resources/bottom-nav.js` per scegliere il file giusto in base alla
pagina attiva.

**4) Bug di contrasto in "Top giocatori settimana"** (non un problema di
scelta colori, un errore vero): le prime 3 card dovrebbero avere sfondo
oro/argento/rosa con testo scuro sopra (stile "podio"), ma una regola
del tema scuro troppo generica (`:root.dark .top-player-card-home`,
senza escludere le prime 3 posizioni) sovrascriveva lo sfondo con un blu
scuro neutro lasciando però il testo scuro pensato per lo sfondo chiaro
— risultato: punteggio e ruolo giocatore quasi illeggibili. Stesso
identico bug ripetuto due volte (sfondo card + colore etichetta ruolo).
Corretto escludendo esplicitamente `.rank-1/.rank-2/.rank-3` dalle due
regole del tema scuro, così la card "podio" resta leggibile come
previsto anche in tema scuro.

**Aggiornate le versioni cache** di tutti i file condivisi toccati
(`sheet.css`, `podium-animation.js`, `classifiche-preview.js`,
`league-context.js`, `standings-export.js`, `notifications-dropdown.js`,
`toast.js`, `toast-with-fallback.js`, `bottom-nav.js`, unificate a
`?v=20260920-colors3`).

**Verificato**: `index.html` — "Top giocatori settimana" ora
perfettamente leggibile su tutte e 3 le card podio, icone barra di
navigazione visibili e colorate (rosso sulla sezione attiva, grigio-blu
sulle altre, verificato passando da Home a Squadre), zero errori
console.

## D049 — Font del box messaggi, pulsanti bacheca, e scala tipografica unica per tutta l'app

**Data:** 2026-09-20 (sessione successiva)

**Richiesto dall'utente** (screenshot del form di pubblicazione in
bacheca): (1) il font dentro il box messaggi è diverso da quello
dell'app; (2) centrare il pulsante verde; (3) togliere l'emoji dal
pulsante "Pubblica"; (4) controllare le proporzioni degli elementi
rispetto alle scritte; (5) in generale allineare le dimensioni dei font
in tutta l'app ("Classifica Squadre" era sproporzionata).

**1) Font del box messaggi**: le `textarea` **non ereditano** il font
della pagina — senza una riga esplicita il browser usa un font a
spaziatura fissa (tipo macchina da scrivere). Aggiunto
`font-family: inherit` a `.post-textarea` in `bacheca.html`: ora usa
Inter come il resto dell'app.

**2) Pulsante verde centrato**: il contenitore era un blocco normale e
il pulsante restava a sinistra. Contenitore reso `flex` con
`justify-content: center`, e aggiunto `justify-content: center` anche
dentro il pulsante.

**3) Emoji rimossa** dal pulsante "Pubblica" (🚀). Tolto anche il
`font-size: 14px` forzato sul pulsante verde, che lo rendeva più piccolo
degli altri: ora tutti i pulsanti di quella riga hanno la stessa misura
del testo.

**4-5) Scala tipografica unica (il lavoro più grosso)**: prima **non
esisteva nessuna regola condivisa per i titoli**. Ogni pagina usava o la
misura di default del browser (h1 32px fisso, h2 24px) o un valore
scelto a mano: risultato, titoli da **14px a 48px** senza una logica, e
in un caso (`admin-players.html`) un h3 più grande del suo h2.

Definita in `resources/sheet.css` una scala proporzionata al testo
(16px), che si adatta alla larghezza dello schermo:
- `h1`: `clamp(24px, 3.2vw, 30px)`
- `h2`: `clamp(19px, 2.2vw, 23px)`
- `h3`: `clamp(16px, 1.7vw, 18px)`

Il titolo nella barra in alto non è toccato (le regole `header h1` sono
più specifiche e continuano a vincere).

Riallineati poi i titoli "fuori scala" definiti dalle singole pagine —
14 sostituzioni su 10 file: i titoloni delle pagine "vetrina"
(`store.html` 42px, `recap-giornata.html` 48px, `download-app.html`
3rem, `calendario-athletic.html` e `contest.html` 2.5rem,
`contest-leaderboard.html`, `admin.html`, `scegli-squadra.html`,
`admin-cards-manager.html`) portati tutti a `clamp(26px, 5vw, 36px)`,
così scalano sui telefoni invece di restare giganti; corretta anche la
gerarchia invertita in `admin-players.html`.

**Non toccati di proposito**: i numeri grandi delle statistiche
(`.stat-value`, `.stat-card h3`) — sono dati in evidenza, non titoli, e
devono restare grandi.

**Verificato**: `bacheca.html` (font corretto, pulsante verde centrato,
"Pubblica" senza emoji, pulsanti della stessa misura), `classifiche.html`
("Classifica Squadre (Cumulata)" ora proporzionata al resto),
`store.html` e `contest.html` (titoli vetrina ridimensionati),
`index.html` (nessuna regressione) — zero errori console.

**Problema preesistente notato, NON collegato a questa modifica**: in
`contest.html` la scritta "Seleziona Giornata" è nera su sfondo scuro,
quasi illeggibile. È una delle 3 pagine con foglio di stile tutto loro
(`contest.html`, `contest-leaderboard.html`, `calendario-athletic.html`,
vedi D039) che non seguono il tema dell'app: vanno allineate con un
passaggio dedicato.

## D050 — Allineate le 3 pagine con stile proprio, icone oro, pulsanti meno "plasticosi"

**Data:** 2026-09-20 (sessione successiva)

**Richiesto dall'utente**: (1) allineare subito le 3 pagine con foglio di
stile separato; (2) correzione: le icone della barra in basso dovevano
essere **oro** (il colore estratto dal bordo "capitano"), non
grigio/rosso; (3) i pulsanti sembrano "finti/plasticosi", serve uno
stile più da tasto vero.

**1) Le 3 pagine separate — causa trovata**: `contest.html`,
`contest-leaderboard.html` e `calendario-athletic.html` usavano
`var(--bg)`, `var(--text)`, `var(--card)` **senza mai caricare il foglio
di stile che definisce quelle variabili**. Risultato: le variabili non
avevano valore, quindi sfondo trasparente e testo nero di default (il
"Seleziona Giornata" illeggibile su scuro segnalato in D049), font
diverso dal resto.

**Primo tentativo, fallito e corretto subito**: collegato `sheet.css`
intero. `calendario-athletic.html` si è **scomposta**: la pagina usa
nomi di classe generici (`.card`, `.match-card`, `.team-logo`) che
collidono con quelli di `sheet.css`, che le impagina in modo diverso.

**Soluzione adottata**: creato `resources/theme-tokens.css`, che
contiene **solo** colori e font (nessuna impaginazione). `sheet.css`
ora importa quel file invece di tenere una copia delle variabili, quindi
**i colori del tema vivono in un posto solo**; le 3 pagine con layout
proprio caricano soltanto `theme-tokens.css`, così seguono il tema
dell'app senza ereditarne il layout. Aggiunte anche le variabili
`--success`, `--success-hover`, `--gold`, `--gold-light` per avere in un
unico posto tutti i colori decisi in D045-D048.

Convertiti poi nelle 3 pagine i colori chiari "fissi" (riquadri bianchi,
testi grigi) in variabili del tema, così funzionano in chiaro e in
scuro.

**Bug vero trovato e corretto durante la verifica** (preesistente, non
causato dal redesign): su schermo stretto il "VS" tra le due squadre
veniva ruotato di 90°, ma essendo largo quanto la card la rotazione ne
faceva sbordare l'ingombro di ~150px sopra e sotto, finendo **sopra gli
stemmi delle squadre**. Tolta la rotazione su mobile in
`calendario-athletic.html` e `contest.html` (con le squadre incolonnate
"VS" si legge benissimo anche dritto).

**2) Icone della barra in oro**: ricolorate tutte e 5 in `#facc15` (lo
stesso oro del bordo "capitano"), uguali in tutte le sezioni. Eliminate
le varianti rosse `-active` create in D048 e semplificato
`resources/bottom-nav.js`: la sezione attiva si riconosce già dalla
scritta rossa e dallo sfondo sotto l'icona.

**3) Pulsanti meno "plasticosi"**: `.btn`/`.btn-secondary` erano tinta
unita piatta. Ora hanno una sfumatura leggera dall'alto verso il basso
(come la luce su un tasto vero), un bordo appena accennato, un'ombra
morbida, e alla pressione si abbassano di un pixel. Stesso trattamento
dato al pulsante verde "Pubblica come squadra" in bacheca, che essendo
scritto a mano era rimasto piatto. Tolta anche da lì l'emoji, come sul
pulsante "Pubblica".

**Verificato**: tutte e 3 le pagine (layout intatto, tema applicato,
testi leggibili), `bacheca.html` (pulsanti nuovi, icone oro) — zero
errori console.

**Aggiunta a D050, stessa sessione**: tolta l'emoji anche dal pulsante
verde "Pubblica come squadra", ridotto di misura (testo 14px, meno
spazio interno, casella più piccola) e centrato verticalmente in modo
corretto: lo spazio sopra era di 4px contro i 15px sotto, perché le
caselle di testo multiriga lasciano sotto di sé qualche pixel vuoto
(sono elementi "in linea"). Reso il box un elemento a blocco e
pareggiati i margini: ora 15px sopra e 15px sotto, verificato
misurando gli elementi nel browser.

## D051 — Menu, emoji, navigazione: rifinitura finale della giornata di redesign

**Data:** 2026-09-20 (sessione successiva)

**Richiesto dall'utente**: menu con scritta "veramente brutta", icone non
tutte oro, sfondo del menu a gradiente come la home, icona "night shift"
al posto dell'emoji del tema, togliere in generale le emoji "da chat",
titoli dei riquadri in home illeggibili, nuovo testo nel box della
bacheca, scritte bianche sulla barra in basso quando attive, e infine un
controllo generale con studio della navigazione.

**Menu**: intestazione ora con lo stesso gradiente rosso-blu della barra
in alto (era rosso pieno); titolo "MENU" in maiuscoletto spaziato con
sopra l'etichetta "FANTA ATHLETIC" in oro; pulsante di chiusura tondo.
Le voci "Tema" ed "Esci" sono `<button>` mentre le altre sono link:
prendevano lo stile generico dei pulsanti e sembravano riquadri diversi
— uniformate. L'emoji 🌓 del tema sostituita da una **luna disegnata
(SVG)**, che segue il colore del testo.

**Icone**: ricolorate in oro **tutte** le icone (14 file), non solo le 5
della barra in basso. Tre di esse (profilo, logout, impostazioni) non
erano silhouette a tinta unita ma immagini con sfumature: ricolorate
mappando la luminosità sulla trasparenza, così i bordi restano morbidi.

**Emoji rimosse** da titoli di pagina, titoli di sezione, pulsanti,
link-pulsante, titoli dei riquadri admin e titoli delle schede del
browser: **240 in totale**. Mantenute dove sono contenuto e non
decorazione (reazioni della bacheca, pannello emoji, medaglie del podio).

**⚠️ Errore commesso e corretto durante questa pulizia**: il primo
passaggio ha **svuotato 19 pulsanti** che contenevano soltanto
un'emoji (i 15 del pannello emoji in bacheca, due pulsanti "chiudi",
il pulsante "capitano" e "elimina foto"). Causa: il controllo "lascia
stare se dopo l'emoji non c'è testo" guardava anche oltre il tag di
chiusura, trovando il testo del pulsante successivo. Tutti ripristinati
— quelli della bacheca dall'attributo `onclick` (che contiene la stessa
emoji), gli altri 4 recuperando il contenuto originale dalla cartella di
backup. Verificato che non resti nessun pulsante o titolo vuoto.
**Lezione**: dopo una sostituzione automatica di massa, cercare sempre
gli elementi rimasti vuoti (`><\/button>`, titoli senza testo), non
fidarsi del solo conteggio delle sostituzioni.

**Leggibilità**: titoli dei riquadri in home ("Store Ufficiale",
"Formazioni"...) erano rosso scuro su sfondo scuro — in tema scuro ora
sono chiari. Barra in basso: la sezione attiva ha la scritta **bianca**
sull'alone rosso (prima era rossa su rosso).

**Bacheca**: nuovo testo del box messaggi come richiesto dall'utente,
senza emoji.

**Navigazione — studio e correzioni**: controllati automaticamente tutti
i link interni delle 54 pagine attive: **nessun link rotto**. Trovate
però 6 pagine da cui non si poteva uscire (nessuna barra, nessun menu,
nessun link alla home):
- **`404.html`**: era la pagina generata di default da Firebase, in
  inglese, con istruzioni per lo sviluppatore e **nessun modo per
  tornare all'app**. Riscritta in italiano, in stile app, con il
  pulsante "Torna alla Home". È la correzione più importante: la vede
  chiunque sbagli un indirizzo.
- **`calendario-athletic.html`** (pagina per gli utenti): aggiunto un
  link "Torna alla Home" nell'intestazione.
- **`test-foto-live.html`** e **`upload-rules-to-firestore.html`**
  (strumenti admin): aggiunto "Torna al pannello admin".
- `results-h2h-modal.html` e `giornata-calcolata-popup.html` lasciate
  invariate: sono finestre aperte da altre pagine, non pagine a sé.

**Pulizia finale delle versioni cache**: i riferimenti ai file condivisi
avevano versioni diverse tra loro (problema che esisteva già prima di
oggi: alcune pagine senza versione, altre con numeri diversi per lo
stesso file). **Unificati tutti i 540 riferimenti** a un'unica versione
`?v=20260920-final`. Trovato così anche un problema concreto:
`bottom-nav.js` era stato modificato senza aggiornare la versione, quindi
i browser avrebbero potuto continuare a usare la versione vecchia, che
cercava file di icone ormai eliminati.

**Verificato**: caricate una per una le pagine principali (home, squadre,
formazioni, classifiche, giornate, statistiche, calendario, profilo,
asta, notifiche, store, contest, calendario Athletic, bacheca, admin) —
**zero errori in console su tutte**.

## D052 — Footer duplicato risolto su 12 pagine, credito a Nicola Mocci

**Data:** 2026-09-20 (sessione successiva)

**Richiesto dall'utente**: partendo dal doppio footer notato in
`bacheca.html` (punto aperto della Fase 2), sistemarlo.

**Scoperta più ampia del previsto**: non era solo `bacheca.html`. Un
footer scritto a mano ("© Nicola Mocci") esisteva in **12 pagine**
(`admin-players.html`, `asta.html`, `bacheca.html`, `matchday.html`,
`statistiche.html`, `formazioni.html`, `download-app.html`,
`profile.html`, `store.html`, `index.html`, `squadre.html`,
`standings.html`). Di queste, solo 3 (`bacheca.html`, `formazioni.html`,
`index.html`) caricavano anche lo script condiviso `resources/footer.js`
(quello più recente, con i link Privacy/Termini/Cookie e "© 2025 Fanta
Athletic") — quindi solo su quelle 3 si vedeva davvero il doppione.

**Fatto**: rimosso il footer scritto a mano da tutte e 12; aggiunto lo
script `resources/footer.js` alle 9 pagine che non lo caricavano ancora
(altrimenti sarebbero rimaste senza nessun footer). Rimossa anche una
riga di script ormai orfana in tutte e 12 (`document.getElementById
('year').textContent = ...`), che puntava allo `<span id="year">` del
footer manuale appena tolto — causava un errore reale in console
("Cannot set properties of null"), trovato verificando subito dopo la
modifica, non dandola per buona a occhio.

**Aggiunto su richiesta esplicita**: riga "Created by Nicola Mocci" nel
footer condiviso, sotto ai link legali — per non perdere il riferimento
a chi ha costruito il sito.

**Bug di leggibilità corretto** (segnalato dall'utente vedendo la pagina
dal vivo): i link legali usavano il rosso di brand (`--primary`,
`#920100`) anche in tema scuro, su sfondo blu notte — contrasto troppo
basso, quasi illeggibili. `--primary` in `theme-tokens.css` non cambia
tra tema chiaro e scuro (a differenza di `--bg`/`--card`/`--text`), per
cui la correzione è stata fatta direttamente in `footer.js`: in tema
scuro i link usano un rosso più chiaro (`#f87171`) invece della
variabile del tema. In tema chiaro restano invariati (`#920100`, già
leggibile su sfondo chiaro).

**Versione cache aggiornata**: tutti i riferimenti a `footer.js` portati
da `?v=20260920-final` a `?v=20260920-final2` in tutte le pagine che lo
caricano, per evitare che un browser tenga in cache la versione con il
bug di leggibilità.

**Verificato**: `index.html`, `bacheca.html`, `squadre.html`,
`asta.html` — zero errori console, footer presente e leggibile, testato
anche a larghezza mobile (375px): la fila di link va a capo su due righe
ma resta centrata e leggibile.

**Addendum, stessa sessione**: su richiesta dell'utente, pannello reso
più compatto (meno spazio verticale tra le righe: margini e spaziatura
tra copyright/link/credito ridotti). Versione cache di `footer.js`
avanzata di nuovo a `?v=20260920-final3`.

## D053 — Scoperta: il sito online (Firebase Hosting) non è allineato al
repository Git, indipendentemente da qualunque cache

**Data:** 2026-09-20 (stessa sessione)

**Segnalato dall'utente**: aprendo l'app dal telefono (sito vero,
`fanta-athletic.web.app`), 3 pagine (Formazioni, Classifiche) appaiono
visivamente più curate e con più funzioni di quanto visto nei test
locali — in particolare "Classifica Squadre" con badge numerati, avatar,
filtri, esportazione CSV/Excel, vista compatta/estesa.

**Verificato**: l'utente ha confermato che il repository Git ricevuto
dall'amico è esattamente questa cartella locale (nessuna versione
"nascosta" più recente che lui conosca) — quindi la spiegazione non è
"repository Git più vecchio della versione online". La spiegazione
corretta è un'altra: **Firebase Hosting (il sito online) e il
repository Git sono due cose indipendenti**. Chi ha accesso può
pubblicare (`firebase deploy`) una versione dei file direttamente dal
proprio computer, senza che sia mai passata da un commit Git. Scaricato
il codice sorgente pubblico delle pagine online (senza login, solo
lettura HTML/CSS pubblici, nessuna credenziale coinvolta) e confrontato
con quello locale:
- `classifiche.html` online: **3531 righe**, con filtri, esportazione
  CSV/Excel, vista compatta/estesa, righe con badge/avatar. Nel
  repository Git: **989 righe**, solo tabella semplice. Queste funzioni
  **non esistono da nessuna parte nel repository Git** ricevuto
  dall'utente.
- `formazioni.html` online: contiene una regola CSS in più (media query
  per schermi stretti che porta la panchina a 2 colonne) assente nel
  repository Git (dove la panchina resta sempre a 3 colonne).
- Header HTTP del file online: `last-modified: 17 dicembre 2025` — il
  sito non riceve un nuovo deploy da quella data.

**Non ancora deciso**: se recuperare queste funzioni (soprattutto la
classifica squadre con filtri/esportazione, molto apprezzata
dall'utente) dentro il nostro codice attuale, o lasciarle perdere.
Sarebbe un vero recupero di funzionalità perse, non un ritocco
cosmetico — da trattare come voce a sé nella Fase 3, non da fare al
volo. Riportato in `docs/PUNTI_APERTI.md`.

**Nota di sicurezza applicata durante l'indagine**: per confrontare il
codice del sito online non è stato fatto nessun accesso con le
credenziali dell'utente — solo lettura di file pubblici via `curl`,
senza login. Coerente con `SAFE_PRACTICES.md` (mai in condizione di
poter usare le credenziali dell'utente).

**Confermato dall'utente**: il repository Git ricevuto è esattamente
questa cartella — non esiste una versione "più recente" che l'utente
conosca. La spiegazione è quindi che **Firebase Hosting e il
repository Git sono due cose indipendenti**: chi ha accesso può
pubblicare (`firebase deploy`) senza che sia mai passato da un commit.
**Deciso con l'utente**: da qui in avanti lo sviluppo deve avvenire
**solo** in locale → Git; Firebase resta solo "parte web" (dove gira il
sito), non si tocca mai più direttamente. Prima di qualunque
pubblicazione futura, il repository locale deve quindi contenere
**tutto** quello che oggi vive solo online, altrimenti pubblicare
farebbe sparire funzioni che i giocatori usano oggi. Questo diventa un
requisito bloccante prima del deploy, non solo una preferenza estetica.

**Confronto sistematico completato** su tutte le 74 pagine attive
(scaricato il codice pubblico di ognuna via `curl`, confrontato con
quello locale, righe di codice + funzioni JavaScript definite).
Risultato:
- **`classifiche.html`**: differenza reale e grande. Online esistono
  decine di funzioni assenti in locale (pannelli filtri, vista "per
  giornata" dei giocatori, ordinamento colonne, vista
  compatta/estesa, righe con avatar/badge invece della tabella
  semplice). 3531 righe online contro 989 in locale.
- **`squadre.html`**: differenza reale ma piccola — 5 funzioni assenti
  (`handleMobileClickPlayer`, `openPlayerPickerForSlot`, `toast`,
  `ensureLeagueReady`, `getCurrentLeagueIdCached`), sembrano
  implementare la scelta di un giocatore **toccando lo schermo** su
  mobile, alternativa al trascinamento.
- **`formazioni.html`**: differenza minima, solo CSS — mancava la
  regola che porta la panchina a 2 colonne su schermi stretti
  (nessuna funzione JavaScript mancante). **Corretta e verificata in
  questa stessa sessione** (vedi sotto).
- **`statistiche.html`**: falso allarme, le sezioni combaciano quasi
  riga per riga — la differenza di 149 righe è irrilevante (spazi/
  commenti), nessuna funzione mancante.
- Tutte le altre pagine: solo differenze piccole (0-30 righe), coerenti
  con le modifiche del redesign di oggi non ancora pubblicate.
- Le pagine del cluster giochi (`wirc-*`, `athletic-manager.html`,
  `athletic-cards-battle.html`, `clash-cards.html`) risultano tutte
  uguali online: 1424 righe identiche per tutte, che corrispondono al
  contenuto della Home — probabile redirect di Firebase per pagine mai
  pubblicate. Coerente con lo stato "in pausa" già noto (D004/D020),
  non è una perdita di funzionalità.

**Corretto in questa sessione**: aggiunta a `formazioni.html` la regola
CSS mancante (`#benchStrip .bench-chip { flex: 0 0 calc(50% - 6px); ...
}` dentro il media query per schermi stretti) — verificato a 375px di
larghezza, la panchina ora è a 2 colonne come nel sito online, zero
errori console.

**Priorità decisa con l'utente per il recupero delle funzioni
mancanti**: Formazioni (fatto) → Squadre (scelta giocatore col tocco) →
Classifiche (il lavoro più corposo, filtri/ordinamento/vista
compatta).

**`squadre.html` completato in questa sessione**: delle 5 funzioni che
sembravano mancanti, 3 (`toast`, `ensureLeagueReady`,
`getCurrentLeagueIdCached`) in realtà esistevano già in locale tramite
script condivisi (`toast.js`, `league-helper.js`) — il confronto
automatico per nomi di funzione le aveva segnalate per errore.
Aggiunta solo la vera funzione mancante: `openPlayerPickerForSlot`
(popup con foto e ruolo dei giocatori disponibili), collegata al tocco
su uno **slot vuoto** quando non è già stato selezionato un giocatore
dalla panchina — **senza rimuovere** il flusso già esistente e
funzionante "tocca il giocatore in panchina poi tocca lo slot"
(`state.mobilePick`): ora convivono entrambi, come richiesto
dall'utente. Verificato passo passo nel browser (rimosso un giocatore,
riaperto il popup, provato un giocatore con ruolo sbagliato → rifiutato
correttamente col vincolo di ruoli, poi uno giusto → aggiunto con
successo, zero errori console).

**Chiarito con l'utente sul trascinamento**: il trascinamento con il
mouse su desktop esiste già (non toccato). Il trascinamento **con il
dito su mobile** non esiste né in locale né nella versione online
(entrambe lo evitano deliberatamente, perché la tecnologia standard dei
browser per il drag-and-drop non supporta bene lo schermo touch — è per
questo che esistono i flussi alternativi "tocca poi tocca"/popup).
Implementarlo sarebbe quindi una **funzione nuova da costruire da zero**,
non un recupero. **Registrata come richiesta futura per la Fase 3** (vedi
`docs/PUNTI_APERTI.md`), non inclusa in questo lavoro di allineamento.

## D054 — Bug pre-esistente trovato dall'utente: menu desktop sovrapposto
al titolo in `auth.html`

**Data:** 2026-09-20 (stessa sessione)

**Come emerso**: l'utente ha aperto `http://localhost:8912` nel suo
Chrome normale (diverso dalla scheda di test isolata usata da Claude,
per questo lì il login non era già fatto) a schermo largo, e ha trovato
il menu orizzontale (Home, Formazioni, Classifiche...) sovrapposto al
titolo "Accesso TEST LOCALE" nella pagina di login.

**Causa**: `auth.html` caricava `resources/navbar.js` (più
`navbar-profile-icon.js` e `notifications-dropdown.js`), che inserisce
l'intero menu del sito **dentro lo stesso** `<header>` che contiene già
il titolo della pagina — bug pre-esistente, non introdotto dal redesign
di oggi, mai notato prima perché nessun test precedente aveva aperto
`auth.html` a una larghezza desktop ampia.

**Corretto**: rimossi i 3 script da `auth.html` — non hanno senso su una
pagina di login (prima di autenticarsi non si può comunque navigare nel
resto del sito). Nessuna altra pagina o script dipende da quei 3 file
essendo caricati lì. **Da riverificare**: Claude non può vedere la
schermata di login dal vivo (la propria scheda di test è già loggata,
il login lo fa sempre l'utente) — verifica visiva delegata all'utente
nel suo Chrome.

## D055 — `squadre.html`: confronto più approfondito dopo segnalazione
dell'utente (foto del campo, panchina, giocatore selezionato)

**Data:** 2026-09-21 (stessa sessione, dopo mezzanotte)

**Segnalato dall'utente**: confrontando screenshot del telefono e del
test locale fianco a fianco, ha notato che il confronto automatico di
prima (solo nomi di funzioni JavaScript) non bastava — restavano
differenze visive vere non trovate. Aveva ragione: il metodo era troppo
superficiale per queste due pagine.

**Trovato e corretto**:
- **Sfondo del campo**: `squadre.html` online usa una vera foto
  (`resources/campo-5v5.jpg`), non la sfumatura verde piatta che
  avevamo in locale — il file immagine **non esisteva per niente** in
  locale. Scaricato dal sito pubblico (senza login), **ridotto da 5,9
  MB a 180 KB** (era a risoluzione assurda per il web, 4204×5946px) e
  aggiunto a `resources/`. Il "contain" copiato dal CSS online lasciava
  però vuoti sopra/sotto (il nostro campo è più alto, 5 slot impilati,
  di quello online) — cambiato in "cover" dopo verifica visiva, su
  segnalazione dell'utente ("proporzioni iper decentrate").
- **Panchina non a colonne fisse**: `squadre.html` non aveva **nessuna**
  regola di larghezza per i chip della panchina (a differenza di
  `formazioni.html`, che già ce l'aveva) — risultato: righe piene
  larghezza intera invece di una griglia ordinata. Aggiunta la stessa
  struttura di `formazioni.html`: 3 colonne di base, 2 su schermi
  stretti. **Errore corretto durante il lavoro**: la prima versione
  della regola non funzionava perché scritta *prima* di un'altra
  regola equivalente più in basso nel file — in CSS, a parità di
  precisione, vince quella scritta dopo. Risolto riscrivendo la
  media query nel punto giusto, verificato che ora vince davvero.
- **Nessuna evidenza visiva del giocatore selezionato su mobile**: il
  flusso "tocca il giocatore poi tocca lo slot" esisteva già
  (`state.mobilePick`) ma non mostrava mai quale fosse stato scelto —
  bug pre-esistente, non introdotto oggi. Aggiunta la classe
  `.selected` (bordo azzurro), verificata via click reale nel browser.

**Non è un bug, chiarito con l'utente**: il pulsante "Invita
vice-allenatori" visto nelle foto del telefono non esiste né in locale
né nella versione online attuale — trovato solo come testo di ruolo
dentro `join-team.html` ("Vice-Allenatore"). Probabile residuo di una
versione ancora più vecchia rimasta in cache nell'app installata sul
telefono (un terzo stato del codice, oltre a locale e online attuale).
Non azionabile da qui — l'utente può verificare svuotando la cache
dell'app sul telefono se vuole vedere la versione più recente.

**Verificato**: nessun errore console, sfondo del campo senza vuoti,
panchina a 2 colonne su mobile, evidenziazione del giocatore selezionato
funzionante (bordo azzurro), testato anche il deseleziona.

**Ripensato subito dopo, stessa sessione**: la foto del campo, provata
con "cover" (tagliava le linee bianche del bordo) e poi con "contain" +
sfondo verde di riserva (cuciture di colore visibili, comunque
innaturale), non ha convinto l'utente: **"andava bene prima delle
modifiche, erano solo i riquadri da adattare"**. Foto rimossa del tutto
(anche il file scaricato in `resources/campo-5v5.jpg`, per non lasciare
file inutilizzati), ripristinata la sfumatura verde piatta originale.
**Tenuta invece la vera correzione richiesta**: lo slot del portiere
(`line.one`) su mobile veniva allargato a tutta larghezza dello schermo
da una regola pensata per quando non c'era nessuna linea da rispettare
("ALLARGA slots al massimo") — ora è limitato al 55% e centrato, come
già faceva `formazioni.html`, per un posizionamento più ordinato.
**Lezione**: quando si copia uno stile dalla versione online, verificare
subito che le proporzioni tornino nel nostro layout (diverso da quello
online) prima di darlo per buono — qui il contenitore locale era troppo
alto per l'immagine e nessuna delle due modalità CSS standard
("contain"/"cover") ha dato un risultato pulito.

**Soluzione finale, su proposta dell'utente**: invece di una foto,
copiate in `squadre.html` le stesse **linee di campo disegnate via CSS**
già usate in `formazioni.html` (area di rigore, area piccola, dischetto,
cerchio di centrocampo — tutte in percentuale, si adattano da sole a
qualunque dimensione del contenitore, senza i problemi di proporzione di
un'immagine). Aggiunte le stesse classi (`.pitch-lines`, `.pitch-circle`,
`.penalty-area-top/bottom`, `.small-area-top/bottom`,
`.penalty-arc-top/bottom`) sia alla versione desktop che mobile del
campo. Verificato su tre larghezze diverse (375px, 800px, 1440px):
campo con le linee ovunque, portiere dentro l'area di rigore, zero
errori console.

## D056 — Pulsante "Invita Vice-Allenatori" recuperato in `squadre.html`

**Data:** 2026-09-21 (stessa sessione)

**Contesto**: durante l'indagine su "Invita vice-allenatori" (visto solo
in una cache vecchia sul telefono, D055), trovato che la funzione
**esiste già completa** in `resources/team-invite-system.js`
(`createTeamInvite`, `useTeamInvite`, `sendInviteEmail`,
`renderInviteUI`) — non era mai stata collegata a nessun pulsante nelle
pagine attuali. L'utente ha confermato: la funzione serve, va aggiunta.

**Fatto**:
- Aggiunto il pannello in `squadre.html` (posizione scelta
  dall'utente), sia nella sezione mobile che desktop.
- **Bug corretto durante l'implementazione**: i due pannelli (mobile e
  desktop) generavano entrambi un pulsante con lo stesso id
  `generateCodeBtn` — `document.getElementById` in `renderInviteUI`
  agganciava sempre il primo trovato (quello desktop, nascosto su
  mobile), quindi il pulsante visibile su mobile non faceva nulla.
  Risolto cercando gli elementi dentro il proprio contenitore
  (`container.querySelector`) invece che nell'intero documento.
- **Corretto su richiesta esplicita dell'utente**: il pannello deve
  riferirsi sempre alla **propria** squadra (`state.userTeamIdx`), non a
  quella eventualmente sfogliata dal menu "Squadra" come admin — prima
  mostrava "Mocci e Canni" (squadra sfogliata) invece di "Curva gonfi"
  (squadra reale dell'utente).
- **Ristilizzato** per allinearsi al resto dell'app: testo e pulsanti
  centrati, pulsante "a pillola" (classe `.btn`/`.btn-secondary`
  condivisa invece di stile scritto a mano), colori dai token del tema
  invece di colori fissi (che in tema scuro sarebbero rimasti chiari e
  fuori posto).
- Script `resources/team-invite-system.js` caricato in `squadre.html`.

**Verificato end-to-end nel browser**: generato un vero codice invito
(`T-F0U8FN`) con il pulsante, comparso correttamente link + codice +
pulsante copia; **poi eliminato subito** il documento di test dal
database (`leagues/.../teamInvites/T-F0U8FN`), su richiesta dell'utente
di non lasciare dati di prova nel database reale.

**Verificato anche l'impatto dei test precedenti sul database**: la
funzione che salva davvero la formazione per giornata
(`saveCurrentTeamFormation`) si attiva solo premendo "Salva formazione
titolari", mai cliccato durante le prove del popup di scelta giocatore
(D055) — quei test toccavano solo lo stato temporaneo della pagina, mai
il database. Nessun'altra pulizia necessaria.

**Segnalato di nuovo dall'utente con foto (dopo D055)**: i riquadri dei
giocatori in `squadre.html` continuavano a sbordare dalle linee guida, e
il testo "Vincolo" si sovrapponeva al campo — cosa che in
`formazioni.html` non succede. Due cause distinte, entrambe di
proporzioni ereditate dalla vecchia versione "a foto":
- `.pitch` aveva ancora `min-height: 600px` (residuo di quando gli slot
  erano grandi tile fisse) — rimosso, ora l'altezza segue il contenuto
  come in `formazioni.html`.
- Gli slot (`.slot`, `.pitch-grid`, avatar) erano ancora dimensionati
  per la vecchia grafica (180px, avatar 64px fissi anche su mobile) —
  riallineati ai valori di `formazioni.html` (88px base, 50px avatar e
  120px di altezza minima su mobile).
- **Trovato durante il fix**: i pulsanti ⭐/× dentro ogni riquadro
  giocatore erano posizionati con `position: absolute`, mentre in
  `formazioni.html` scorrono normalmente sotto il nome — con la scheda
  più compatta, il nome del giocatore finiva sotto ai pulsanti invece
  che sopra. Tolto il posizionamento assoluto, ora i pulsanti stanno in
  una riga dopo il nome, come nell'altra pagina.
- **Trovata anche la causa del testo "Vincolo" sovrapposto**: nella
  versione mobile di `formazioni.html` quel testo è **fuori** dal
  contenitore verde del campo (elemento fratello, non figlio) — in
  `squadre.html` era rimasto dentro. Spostato fuori, stesso schema.
  Lasciata invece invariata la versione desktop, dove anche
  `formazioni.html` lo tiene dentro il campo senza che sia mai stato un
  problema.

**Verificato**: schermata mobile confrontata fianco a fianco con
`formazioni.html` — stessi margini, nomi completi leggibili, pulsanti
non più sovrapposti, box "Vincolo" staccato dal campo, zero errori
console.

**Segnalato ancora dall'utente**: anche la "Panchina" restava diversa
dal telefono. Confrontando il CSS con `formazioni.html` (non solo con
l'online, per restare coerenti tra le nostre due pagine): la foto nel
chip era **56px in `squadre.html` contro 32px in `formazioni.html`**
(quest'ultimo già allineato all'online), e il nome del giocatore era
forzato su una riga sola senza troncamento (`white-space: nowrap` senza
`text-overflow: ellipsis`), rischiando di tagliarsi brutalmente sui nomi
lunghi. Allineato `squadre.html` ai valori di `formazioni.html`: foto
32px, nome con puntini di sospensione se troppo lungo. Verificato senza
errori console.

## D057 — `classifiche.html`: recuperato tutto quello che viveva solo su
Firebase (il pezzo più grande della migrazione)

**Data:** 2026-09-21 (stessa sessione)

**Contesto**: confermato con l'utente che il recupero da Firebase andava
fatto per intero, non solo l'aspetto visivo. Analizzato a fondo il file
online (3531 righe contro 989 in locale) e trovato che mancava:
- Un'intera **quarta scheda** ("Classifica Giocatori", classifica
  stagionale dei singoli giocatori: punti, gol, assist, gialli, rossi,
  bonus/malus) — la logica vive in un file a parte,
  `resources/players-leaderboard-classifiche.js` (885 righe), che non
  esisteva per niente in locale. Scaricato e aggiunto.
- **Filtri con intervallo di giornate** ("Intervallo" / "Fino a" /
  "Singola giornata") per classifica squadre e classifica giocatori.
- **Ordinamento cliccabile** su ogni colonna delle 4 tabelle principali.
- L'interruttore **"Compatta/Estesa"**: sulla vista mobile trasforma le
  righe della tabella nelle card con foto/badge che piacevano
  all'utente (vista già presente nel codice come card ma mai attivata
  perché la struttura a schede/filtri/ordinamento che la richiama non
  c'era).
- Nella scheda "Per Giornata": una seconda vista interna "Giocatori"
  (oltre a "Squadre"), con filtro dedicato per bonus/malus.

**Scoperta tecnica**: il file online usa ancora funzioni scritte a mano
(`getCurrentLeagueIdCached`, `ensureLeagueReady`, `getLeagueCollection`
ecc.) invece del file condiviso `resources/league-helper.js` — segno che
è una versione precedente al lavoro di centralizzazione fatto altrove
nel progetto. Le funzioni duplicate sono state **rimosse** nel portare
il codice, mantenendo invece il collegamento al file condiviso già
usato nel resto dell'app (stesso comportamento, meno codice duplicato).

**Fatto**: riscritta `classifiche.html` per intero (stile, markup delle
4 schede, tutta la logica JavaScript), portando la ricchezza della
versione online ma:
- adattata ai token di colore del nostro tema (`var(--primary)` ecc.)
  invece dei colori fissi della versione online — l'interruttore
  Compatta/Estesa e i badge già usano il rosso del brand, non il blu
  generico originale;
- tolte le classi CSS trovate **non usate da nessun template reale**
  (varianti di riga più vecchie, mai referenziate dal codice che genera
  l'HTML) — per non lasciare codice morto, come da indicazione
  dell'utente di tenere tutto snello;
- aggiunto `resources/rules-loader.js` (già usato altrove nel progetto)
  al posto del fetch diretto di `rules.json` usato online.

**Verificato uno per uno nel browser, con dati reali**: tutte e 4 le
schede caricano dati veri (17 squadre in classifica, giocatori con
gol/assist reali); interruttore "Estesa" attivato → card aperte con
dettaglio Capitano/Curva/Giocatori/Coach; filtri "Mostra/Nascondi
filtri" aperti correttamente con selettore intervallo giornate G1→G21;
ordinamento cambiato su "Capitano" → classifica riordinata
correttamente (82.5 → 61.5 → 59.0) con etichetta "CAPITANO" al posto di
"TOTALI"; scheda "Per Giornata" con sotto-vista "Giocatori" funzionante;
scheda H2H con tabella classica (dati a zero perché nessuna partita
registrata per questa lega — non un problema di codice). **Zero errori
console in tutti i test.**

## D058 — Fase di recupero/allineamento locale ↔ Firebase: chiusa

**Data:** 2026-09-21 (stessa sessione)

**Richiesto dall'utente**: confermare se davvero tutto il materiale che
viveva solo su Firebase è stato riportato in locale, prima di tornare a
rifinire la grafica (Fase 2).

**Controllo finale fatto prima di rispondere**: oltre alle 3 pagine già
sistemate (`formazioni.html`, `squadre.html`, `classifiche.html`),
ricontrollate a fondo (non solo per numero di righe, stavolta anche per
nomi di funzione) le uniche due pagine rimaste con una differenza
superiore a 30 righe mai analizzata davvero: `matchday.html` (+99) e
`lineup-summary.html` (+45). In entrambe le uniche funzioni "solo
online" sono `ensureLeagueReady`/`getCurrentLeagueIdCached`/`toast` —
lo stesso schema già visto ovunque (funzioni scritte a mano online
invece che richiamate dal file condiviso `league-helper.js`/`toast.js`
usato in locale): non è contenuto mancante, è solo codice duplicato che
in locale è già stato centralizzato. Tutte le altre pagine con
differenze grandi sono già spiegate da D053: il cluster giochi
(`wirc-*`, `athletic-manager.html`, `athletic-cards-battle.html`,
`clash-cards.html`) non è mai stato pubblicato online (restituisce la
Home), e alcune pagine (`404.html`, `calendario-athletic.html`) sono
già più avanti in locale grazie al redesign di oggi, non ancora
pubblicato.

**Conclusione**: la fase di recupero è chiusa. Le uniche 3 pagine con
funzionalità vere rimaste indietro sul repository Git sono state
identificate e riportate in locale, verificate una per una nel browser
con dati reali, zero errori console. Da qui in avanti lo sviluppo vive
solo in locale → Git; Firebase resta solo "parte web".

**Un'avvertenza onesta da tenere a mente**: il metodo di confronto
(differenza di righe + nomi di funzione) si è dimostrato non del tutto
affidabile da solo — su `squadre.html` aveva inizialmente nascosto
differenze vere di aspetto (dimensioni del campo, della panchina)
trovate solo grazie ai tuoi screenshot dal telefono, non dal confronto
automatico. Non c'è motivo concreto per sospettare che accada di nuovo
altrove, ma se in futuro dovessi notare ancora qualcosa di diverso tra
una pagina e il telefono, vale la pena controllarlo subito invece di
darlo per scontato.

**Si torna ora alla Fase 2 (rifinitura grafica)**, come richiesto
dall'utente.

## D059 — Unificazione titoli intestazione + badge stagione a destra

**Data:** 2026-09-21 (stessa sessione)

**Richiesto dall'utente**: ogni pagina aveva il titolo in alto con uno
stile diverso (chi con emoji, chi senza, dimensioni diverse). Voleva un
unico stile più curato per tutte le pagine, mantenendo il riferimento
alla stagione "2025/2026" ma spostato a destra invece che accanto al
titolo.

**Fatto**:
- Nuovo stile unico per tutti i titoli (`header h1` in
  `resources/sheet.css`): più grande (21px, 19px su mobile/tablet),
  grassetto (800), leggera spaziatura tra le lettere — stesso stile su
  tutte le pagine, testo del titolo (es. "Squadre") allineato a
  sinistra.
- Il badge stagione (`resources/navbar.js`) è stato restilizzato: sfondo
  semi-trasparente con bordo dorato sottile, più leggibile del grigio
  scuro di prima.
- **Problema tecnico trovato e risolto**: il badge stagione non è
  l'unico che può comparire nell'intestazione — su pagine come
  "Squadre", quando l'utente non ha ancora una squadra assegnata,
  compare anche un secondo badge rosso "Nessuna squadra"
  (`resources/navbar-profile-icon.js`). Il primo tentativo
  (`justify-content: space-between`) si rompeva proprio in questo caso
  a 3 elementi, spingendo il secondo badge fuori dallo schermo. Il
  secondo tentativo (dare `margin-left:auto` a entrambi i badge) è
  stato scartato dopo una verifica diretta nel browser: quando PIÙ
  elementi hanno `margin-left:auto` sulla stessa riga, lo spazio libero
  viene diviso in parti uguali tra loro invece di raggrupparli — i due
  badge finivano separati da un grosso spazio vuoto invece di stare
  vicini.
- **Soluzione adottata**: il testo del titolo stesso (es. "Squadre")
  viene avvolto in uno `<span class="header-title-text">` che cresce
  per riempire tutto lo spazio libero disponibile — così, qualunque sia
  il numero di badge che seguono (uno o due), restano sempre
  raggruppati vicini sul lato destro, senza bisogno di sapere in
  anticipo quanti sono. Implementato in modo indipendente sia in
  `navbar.js` sia in `navbar-profile-icon.js` (i due script possono
  caricare in ordine diverso a seconda della pagina).
- Versioni cache aggiornate: `sheet.css`, `navbar.js` e
  `navbar-profile-icon.js` passati a `?v=20260921-header` su tutte le
  pagine che li richiamano.

**Verificato nel browser**: misurazioni dirette (`getBoundingClientRect`)
confermano che titolo e badge non si sovrappongono più e restano
raggruppati a destra sia con 1 badge (caso normale) sia con 2 badge
(simulato e anche osservato nel caso reale di "Squadre" senza squadra
assegnata). Controllato visivamente su `bacheca.html` (mobile 375px),
`formazioni.html`, `squadre.html` (caso reale a 2 badge) e
`classifiche.html` (desktop) — stile identico e coerente ovunque,
titolo leggibile, badge stagione ben visibile con il nuovo bordo dorato.
Zero errori console nuovi introdotti da questa modifica (un errore di
rete "ERR_CONNECTION_CLOSED" osservato è preesistente e non collegato,
compare identico anche navigando prima di questa modifica).

## D060 — Banner "Squadre" più sottile delle altre schede: trovata causa e corretto

**Data:** 2026-09-21 (stessa sessione, subito dopo D059)

**Segnalato dall'utente**: dopo aver visto la nuova unificazione dei
titoli, ha notato che il banner colorato in alto di "Squadre" è più
sottile rispetto alle altre pagine, con il titolo attaccato in alto.

**Causa trovata**: `squadre.html` è l'unica delle 5 schede principali
(Home, Formazioni, Squadre, Classifiche, Bacheca) a NON caricare i fogli
`resources/tablet-support.css` e `resources/tablet-landscape.css`, che
invece Home/Formazioni/Bacheca/Classifiche/Calcolo/Statistiche caricano
già. Una regola dentro `tablet-support.css` (pensata per tablet ma
scritta con `@media (min-width: 1024px) and (orientation: landscape)`
**senza limite massimo di larghezza**, quindi valida anche su schermi
desktop normali) è quella che dà alle altre pagine il banner più alto
(80px, padding 16px 40px) invece di quello base più sottile (64px,
padding 8px 24px) che `squadre.html` usava senza saperlo.

**Fatto**: aggiunti a `squadre.html` gli stessi due riferimenti CSS già
usati dalle altre schede principali (`tablet-support.css`,
`tablet-landscape.css?v=20260920-final`) — nessuna riscrittura, solo
allineamento a un pattern già in uso e già testato altrove.

**Verificato nel browser**: banner ora a 80px, identico alle altre
schede, su desktop (1440px). Controllato anche a 1024×768 (una
larghezza limite dove sia `formazioni.html` sia ora `squadre.html`
mostrano un riquadro vuoto invece del contenuto — comportamento
preesistente e già presente identico su `formazioni.html` prima di
questa modifica, non introdotto ora: è un difetto di rilevamento
dispositivo già noto, non nuovo, e ora almeno è coerente tra le due
pagine invece di comportarsi diversamente). Controllato anche su
mobile (375px): campo da gioco, panchina e badge tutti identici a
prima, nessuna regressione. Zero errori console.

**Nota per dopo**: `store.html` e le pagine `admin-*.html` (fuori dai 5
tab principali) hanno lo stesso banner "sottile" di `squadre.html`
prima di questa correzione — non toccate ora perché fuori dallo scope
dei 5 tab principali segnalato dall'utente, da considerare nel prossimo
giro di coerenza generale (richiesto subito dopo dall'utente, in corso).

## D061 — Stesso banner sottile esteso a tutte le altre 34 pagine

**Data:** 2026-09-21 (stessa sessione, subito dopo D060)

**Richiesto dall'utente**: dopo la correzione di "Squadre" (D060), ha
chiesto un controllo di coerenza su tutta l'app, non solo sui 5 tab
principali. Confermato "tutte insieme ora" quando gli ho segnalato che
altre 34 pagine avevano lo stesso problema.

**Trovato**: oltre a `squadre.html`, altre 34 pagine attive (10
amministrative, 10 rivolte a utenti/giocatori come `asta.html`,
`calendario.html`, `standings.html`, `h2h-standings.html`, `store.html`,
`auth.html`, `join-league.html`, `league-invite.html`,
`recap-giornata.html`, le 3 pagine legali, il cluster giochi da 7 pagine
`wirc-*`/`clash-cards.html`/`games-hub.html`/`osm-manager*.html`, e 3
pagine tecniche minori) non caricavano `tablet-support.css` e
`tablet-landscape.css` — stessa causa di D060.

**Fatto**: aggiunti gli stessi due riferimenti CSS (identici a quelli
già usati con successo dalle schede principali) a tutte e 34, con uno
script che ha individuato automaticamente la riga `<link>` di
`sheet.css` in ciascun file e inserito le due righe subito dopo — stessa
posizione usata ovunque, nessuna riscrittura di contenuto.

**Verificato nel browser con schermate dirette (14 delle 34, una per
ogni categoria)**: `admin.html`, `admin-players.html`, `admin-teams.html`
(amministrative); `store.html`, `asta.html`, `standings.html`,
`h2h-standings.html`, `calendario.html`, `recap-giornata.html`,
`privacy.html` (utente); `games-hub.html`, `wirc-royale.html` (cluster
giochi) — su desktop (1440px) e mobile (375px), zero errori console,
nessuna rottura visiva. `auth.html` e `join-league.html` hanno
reindirizzato automaticamente alla Home (comportamento atteso, utente
già loggato/con lega) invece di mostrare la pagina da testare
direttamente — non un problema della modifica di oggi.

**Un'onestà da segnalare, come già in D058**: le restanti 20 pagine
(soprattutto `admin-cards-manager.html`, `admin-cup.html`,
`admin-deadline.html`, `admin-debug.html`, `admin-leghe.html`,
`admin-rules.html`, `admin-store.html`, `admin-users.html`,
`cache-buster.html`, `clash-cards.html`, `cookie-policy.html`,
`terms.html`, `league-invite.html`, `osm-manager.html`,
`osm-manager-v2.html`, `upload-foto-giocatori.html`,
`user-profile-upload.html`, `wirc-battle.html`, `wirc-battle-v2.html`,
`wirc-card-gallery.html`) hanno ricevuto la stessa modifica meccanica ma
**non sono state controllate una per una con uno screenshot** — solo
per pattern (stessa riga, stesso file CSS condiviso, già provato su 14
pagine molto diverse tra loro senza sorprese). Se una di queste,
aprendola, mostrasse qualcosa di strano, va segnalato subito.

**Trovato per caso, non toccato (fuori scope)**: le 3 pagine legali
(`privacy.html`, `terms.html`, `cookie-policy.html`) non caricano
`resources/mobile-detect.js`/`resources/mobile-menu.js` come tutte le
altre pagine — su schermo stretto (telefono) questo significa che il
menu ad hamburger non compare mai e l'intestazione (logo, titolo, badge
stagione, campanella notifiche, icona profilo) resta tutta su una riga,
con il titolo troncato più del necessario. Bug preesistente, non
introdotto oggi e non collegato alla correzione del banner — da
sistemare a parte se si vuole (aggiungere i due script mancanti a
queste 3 pagine).

## D062 — Vera causa del banner "Squadre" ancora sfalsato dopo D060/D061

**Data:** 2026-09-21 (stessa sessione, subito dopo D061)

**Segnalato dall'utente**: dopo D060/D061, ha continuato a vedere il
banner di "Squadre" più stretto delle altre pagine, con screenshot alla
mano che mostravano chiaramente 3 misure diverse (Home/Formazioni,
Classifiche/Bacheca, Squadre) nonostante il codice sembrasse allineato.

**Perché D060 non bastava**: la correzione precedente (aggiungere
`tablet-support.css`/`tablet-landscape.css`) era corretta ma risolveva
solo la larghezza **desktop**. Le mie verifiche precedenti su mobile
erano state fatte a larghezze (375px, 800px) diverse da quella
effettiva della finestra di anteprima condivisa con l'utente (437px) —
lezione di metodo: **misurare sempre alla larghezza reale che l'utente
sta guardando**, non a una qualunque larghezza "mobile" di comodo.

**Causa reale trovata**: dentro `squadre.html` stessa (non in un file
condiviso) esiste dal codice originale una regola scritta apposta per
far occupare tutta la larghezza schermo al campo da gioco su mobile:
`body.page-squadre { padding: 0 !important; ... }` (dentro
`@media (max-width: 640px)`). Il problema è che quella regola azzerava
**tutto** il padding del `body`, non solo quello orizzontale che
serviva davvero — cancellando anche i 18px di padding superiore che il
sistema condiviso (`sheet.css`) usa per compensare il margine negativo
dell'header (`margin-top:-18px`). Risultato: su "Squadre" l'header
veniva tirato su di 18px in più rispetto alle altre pagine, apparendo
tagliato/più stretto. Le altre pagine (Formazioni, Bacheca, Classifiche)
non hanno mai avuto questo problema.

**Fatto**: modificata quella riga in `squadre.html` per azzerare solo
`padding-left`/`padding-right` (che è l'unica cosa che serve per il
campo a tutta larghezza), lasciando che il `padding-top` resti quello
definito una volta sola in `sheet.css` — coerente con il principio del
sistema grafico unico del progetto.

**Verificato con misure dirette** (`getBoundingClientRect`,
`getComputedStyle`) alla larghezza esatta della finestra condivisa
(437px, quella usata dall'utente): `squadre.html`, `formazioni.html`,
`bacheca.html`, `classifiche.html` ora hanno tutte header identico
(altezza 56px, arrotondamento 10px, padding 14px 16px, `top:0`).
Controllato anche che il campo da gioco resti a tutta larghezza come
prima (nessuna regressione sull'effetto voluto dalla regola originale).
Zero errori console.

**Lezione per la prossima volta**: quando un problema visivo persiste
dopo un primo fix apparentemente corretto, non fidarsi delle sole
misure "di comodo" (larghezze standard tipo 375/768/1440) — confrontare
sempre alla larghezza esatta a cui l'utente sta effettivamente
guardando, e quando due pagine sembrano avere lo stesso CSS calcolato
ma appaiono diverse, controllare anche la **posizione** dell'elemento
(`getBoundingClientRect().top`), non solo le sue dimensioni: un
`margin`/`padding` negativo cancellato da una regola concorrente non
cambia l'altezza calcolata di un elemento, ma ne sposta la posizione.

**Ultimo controllo (stesso giorno)**: l'utente ha segnalato che
"classifiche" e "bacheca" sembravano leggermente più grandi delle altre
3. Ricontrollate con le stesse misure dirette: risultato identico al
pixel su tutte e 5 le pagine (Home, Formazioni, Squadre, Classifiche,
Bacheca), nessuna regola propria nascosta in quei due file. Confermato
anche visivamente con un nuovo screenshot: l'utente ha verificato che
ora appare tutto uguale. Il punto è chiuso.

## D063 — Banner "grande" per un istante al cambio pagina, poi si allinea

**Data:** 2026-09-21 (stessa sessione, subito dopo D062)

**Segnalato dall'utente**: cliccando su un tab (es. "Bacheca"), il
banner appare per un istante più grande, poi scatta alla misura giusta
appena la pagina finisce di caricare i dati. Ha chiesto anche di
registrare a parte, come punto aperto, la lentezza generale di
caricamento di tutte le sezioni — cosa fatta subito in
`docs/PUNTI_APERTI.md`, non affrontata in questa decisione.

**Causa trovata**: la misura giusta del banner su telefono dipende da
uno script (`resources/mobile-detect.js`) che riconosce "sei su
telefono" e aggiunge un'etichetta al codice della pagina; finché quello
script non ha girato, il banner usa uno stile di scorta pensato per
schermi larghi (più padding, font più grande). Il problema è che quello
script era caricato quasi per ultimo nella pagina — dopo tutto il
contenuto HTML e dopo gli script di Firebase — quindi più la pagina
impiegava a caricare, più a lungo restava visibile il banner "di
scorta" prima di scattare a quello giusto. Confermato con un test
diretto: rimuovendo artificialmente l'etichetta "sei su telefono" dal
codice della pagina già caricata, il banner passa da 56px/padding
14x16/font 19px a 60px/padding 10x15/font 16px — la controprova esatta
del salto visto dall'utente.

**Fatto**: spostato lo script `mobile-detect.js` subito dopo i fogli di
stile in cima alla pagina, su tutte le 36 pagine che lo caricano —
invece che alla fine, dopo contenuto e script Firebase. Lo script è
scritto in modo da aspettare comunque che la pagina sia pronta prima di
toccare gli elementi (usa `DOMContentLoaded`), quindi spostarlo più in
alto è sicuro: riconosce il telefono molto prima, eliminando (o
riducendo drasticamente) la finestra in cui si vede il banner sbagliato.

**Verificato nel browser**: nessun errore console su Bacheca, Formazioni,
Squadre, Classifiche, Admin Hub, Wirc Royale (campione di pagine
utente/admin/cluster giochi); banner e resto della pagina identici a
prima su mobile (437px) e desktop (1440px) — l'unico cambiamento è il
momento in cui lo script gira, non il risultato finale.

**Correzione importante, trovata subito dopo dall'utente**: questo fix
aiuta solo in parte. L'utente ha notato che, oltre al banner, anche il
logo nell'intestazione appare per un istante prima di scomparire
(sostituito dal pulsante ☰). Controllando meglio: sia lo scatto del
banner sia lo scambio logo↔hamburger dipendono da un secondo script
(`resources/mobile-menu.js`) e, cosa più importante, **entrambi
aspettano lo stesso segnale del browser** ("pagina pronta",
`DOMContentLoaded`), che scatta solo dopo che tutto il contenuto e
tutti gli script della pagina (inclusi i 5 file Firebase caricati uno
dopo l'altro) sono stati letti. Spostare `mobile-detect.js` più in alto
nella pagina (fatto sopra) non anticipa quel segnale — cambia solo
*dove* nel codice viene registrata l'attesa, non *quando* scatta.
**Questo problema è quindi la stessa causa della lentezza generale di
caricamento già segnalata dall'utente**, non un bug indipendente — unito
a quel punto in `docs/PUNTI_APERTI.md`, non risolto oggi: l'utente ha
scelto esplicitamente di affrontarlo insieme in una sessione dedicata
alla velocità, invece di un secondo patch rapido oggi.

## D064 — Dubbio dell'amico sviluppatore su Firebase/Git: chiuso

**Data:** 2026-09-22

**Contesto**: l'amico sviluppatore, sentendo che alcune funzioni
(`formazioni.html`, `classifiche.html`) erano state recuperate dal sito
online (D053), ha inizialmente contestato: "non ho messo codice su
Firebase, lì c'è solo database e regole". Spiegato all'utente (e
girato all'amico) che l'indirizzo confrontato
(`fanta-athletic.web.app`) è inequivocabilmente Firebase **Hosting**
del progetto "fanta-athletic" — un servizio separato dal database, che
può contenere codice pubblicato solo tramite un comando di deploy
esplicito, mai generato dal database. Coerente con la data
`last-modified: 17 dicembre 2025` già trovata in D053 (molto prima
dell'inizio di questo progetto).

**Risposta finale dell'amico**: ha ammesso che, se ha fatto modifiche
mai salvate su Git, erano "probabilmente solo lato estetico" — e ha
detto esplicitamente di non preoccuparsene ("non starei a impazzire
perché non tornano i riquadri"). L'utente lo considera un **nulla
osta**: nessuna obiezione sostanziale alle funzioni recuperate.

**Deciso**: punto chiuso. Le funzioni recuperate in D053-D058 restano
come sono (già testate al 100% con dati reali, zero errori — la
correttezza non dipendeva comunque dal risolvere l'origine del
codice). Nessuna azione ulteriore richiesta su questo fronte.

## D065 — Unificati i 3 stili diversi di "toast" (conferma temporanea)

**Data:** 2026-09-22

**Contesto**: `admin-leghe.html`, `admin-rules.html` e `bacheca.html`
avevano ciascuna una propria implementazione di `showToast()`, mai
centralizzata (D013) perché a quel tempo sembravano "genuinamente
diverse" — rivalutato su richiesta esplicita dell'utente di allinearle
visivamente adesso, nel giro di rifiniture grafiche. **Non toccati** i
pannelli dei menu a tendina (l'utente ha confermato che l'arrotondamento
diverso è voluto, per distinguerli) né il layout desktop (rimandato).

**Differenze trovate**: `admin-leghe.html` mostrava un'etichetta di
testo in grassetto ("OK"/"ERR"/"INFO") invece delle icone (✓/✕/ℹ) usate
dalle altre due; il colore del tipo "info" era diverso in ognuna
(grigio neutro in admin-leghe, blu navy in bacheca, assente del tutto
in admin-rules — con type='info' che sarebbe apparso verde per errore);
solo `admin-rules.html` aveva un adattamento per il tema scuro (sfondo
meno acceso), le altre due restavano con colori troppo accesi anche in
scuro.

**Fatto**: uniformato tutto allo stile più completo già in uso
(icone ✓/✕/ℹ, colori di marca verde/rosso/blu navy, adattamento tema
scuro) — aggiunto il colore "info" mancante ad `admin-rules.html`,
aggiunto l'adattamento tema scuro mancante a `bacheca.html` e
`admin-leghe.html`, sostituita l'etichetta testuale con le icone in
`admin-leghe.html`.

**Verificato nel browser** (chiamando `showToast` direttamente per
ogni tipo, senza dover riprodurre ogni azione che lo attiva): le tre
pagine producono ora lo stesso identico markup HTML e gli stessi
identici colori, sia in tema chiaro sia in tema scuro. Zero errori
console. Screenshot di conferma su `bacheca.html`.

## D066 — Analisi lentezza caricamento: Firebase caricato dalla CDN
esterna invece che dalla copia locale, corretto su 58 pagine

**Data:** 2026-09-22/23

**Richiesto dall'utente**: analizzare cosa rende lento il caricamento
delle pagine (switch tra pagine, caricamenti), distinguendo cosa si può
sistemare subito senza perdere funzionalità da cosa richiede conferma
prima.

**Misurato nel browser** (Performance API + elenco richieste di rete
reali, non solo impressioni): ogni pagina carica una ventina di file
separati (nessun bundle, coerente con l'architettura senza build tool
già nota). Il pezzo più pesante: le librerie Firebase (App, Auth,
Firestore, Storage — insieme ~550 KB) vengono caricate da **61 delle 74
pagine attive** dall'indirizzo esterno di Google
(`https://www.gstatic.com/firebasejs/10.14.1/...`), usando la copia
identica già presente in `resources/` **solo come "piano B"** se Google
non risponde (13 pagine) o, in molte altre (48 pagine), **senza nemmeno
un piano B** — se la CDN fosse irraggiungibile quelle pagine
smetterebbero di funzionare del tutto.

**Verificato che il cambio è a rischio zero**: il file locale
(`resources/firebase-app-compat.js` e affini) contiene la stringa di
versione `"10.14.1"`, **la stessa identica versione** richiamata dalla
CDN — non è un downgrade né un file diverso, è lo stesso contenuto
servito da un indirizzo più vicino invece che da un dominio esterno
(un dominio esterno in più costa una connessione+DNS aggiuntiva ad ogni
caricamento, specialmente pesante su rete mobile).

**Fatto** (nessuna funzionalità persa, per questo eseguito subito senza
attendere conferma, come richiesto): sostituito su 58 pagine il
riferimento alla CDN Google con quello alla copia locale identica,
rimossa anche `resources/firebase-cdn-loader.js` (lo script di
"ripiego automatico" verso il locale, non più necessario perché ora si
parte già dal locale) dalle 13 pagine che lo usavano. **Non toccate**,
di proposito:
- `user-profile-upload.html`: usa anche `firebase-app-check-compat.js`
  dalla CDN, di cui non esiste copia locale — lasciata come CDN-only.
- `wirc-snap-v2.html`/`wirc-snap-v2.5.html` (cluster giochi, già in
  pausa): usano una versione Firebase più vecchia (9.17.1) diversa da
  quella locale (10.14.1) — cambiarle sarebbe un vero aggiornamento di
  versione, non uno spostamento a costo zero, quindi lasciate intatte.

**Verificato nel browser**: `formazioni.html` (con dati reali, 18/19
squadre caricate da Firestore), `bacheca.html` (post e reazioni reali),
`admin-leghe.html`, `asta.html`, `games-hub.html` — zero errori
console, confermato via elenco richieste di rete che ora usano solo
`resources/firebase-*.js` locale, nessun riferimento residuo a
`gstatic.com` o al vecchio script di fallback in nessun file.

**Non affrontato ora, richiede conferma prima** (segnalato all'utente,
non eseguito):
- Le librerie Firebase pesano ~550 KB perché usano lo stile "compat"
  (v8): esiste una versione moderna ("modulare", v9+) molto più
  leggera, ma richiederebbe riscrivere il modo in cui tutto il codice
  parla con Firebase (`firebase.auth()`/`firebase.firestore()` usati
  ovunque) — cambiamento ampio, non eseguito.
- Unire i ~20 file JS/CSS separati di ogni pagina in pochi file
  ridurrebbe il numero di richieste di rete (ognuna costa tempo a
  prescindere dalla dimensione), ma va fatto con attenzione all'ordine
  di caricamento degli script — non eseguito, da valutare a parte.

**Confermato invece che vanno bene così, non toccare**: il
precaricamento delle pagine probabili successive e la connessione
anticipata verso Google (`resources/lazy-load.js`) sono ottimizzazioni
già presenti e sensate.

## D067 — Navigabilità: chiusi 4 vicoli ciechi veri, in corso lo swipe-menu

**Data:** 2026-09-23

**Richiesto dall'utente**: audit di navigabilità — mai restare
"bloccati" in una schermata senza modo di tornare indietro, rendere
l'app meno "da sito" e più "da app" (menu, tab cliccabili, gesture).

**Trovato (controllo sistematico di tutte le 74 pagine attive)**: 4
pagine usate da giocatori reali non avevano né il menu ☰, né la barra
in basso, né un link home — `join-team.html`, `scegli-squadra.html`,
`contest.html`, `contest-leaderboard.html`. 3 di queste avevano un
contenitore vuoto `<div id="navbar-container">` mai riempito da nessuno
script — probabile resto di un vecchio sistema di navigazione mai
completato. Una decina di pagine admin/debug di servizio (usate
raramente, solo da voi due) hanno lo stesso problema, priorità più
bassa, non toccate ora.

**Fatto**:
- `join-team.html`: aggiunto header standard (logo+titolo),
  `mobile-detect.js`/`tablet-support.css`/`tablet-landscape.css`,
  menu ☰ (`mobile-menu.js`) e barra in basso (`bottom-nav.js`) — stesso
  schema già usato con successo su altre pagine minimali come
  `recap-giornata.html`.
- `scegli-squadra.html`: stesso trattamento, ma ha richiesto un
  accorgimento in più — il `body` usava `display:flex` per centrare la
  card, il che avrebbe messo l'header (anch'esso figlio diretto del
  body) in riga accanto alla card invece che sopra. Risolto spostando
  quello stile di centratura su un nuovo contenitore proprio
  (`.scegli-squadra-wrap`), lasciando il body libero di ospitare
  l'header normalmente in cima.
- `contest.html`/`contest-leaderboard.html`: **non toccato** il fatto
  che non caricano `sheet.css` (scelta voluta, D050, per evitare
  conflitti con i loro nomi di classe generici) — aggiunta invece una
  barra minima autosufficiente ("Home" col logo), scritta con CSS
  proprio della pagina, senza dipendere dal foglio di stile condiviso.

**Verificato nel browser**, mobile e desktop, tutte e 4: menu ☰ e
barra in basso funzionanti dove aggiunti, "Home" sempre visibile e
cliccabile, zero errori console. `scegli-squadra.html` reindirizza da
solo alla Home se l'utente ha già una squadra (comportamento suo
preesistente, catturato uno screenshot nella finestra prima del
redirect per verificare comunque il risultato visivo).

**Swipe dal bordo sinistro → apre il menu (fatto, stessa sessione)**:
aggiunta una regola CSS (`overscroll-behavior-x: none` su html/body,
sheet.css) che disattiva la gesture nativa di "indietro" del browser,
e un nuovo script condiviso `resources/edge-swipe-menu.js` che
riconosce lo stesso gesto (tocco a meno di 24px dal bordo sinistro +
scorrimento orizzontale, non verticale) e apre il menu ☰ al posto di
tornare indietro. Aggiunto sulle 23 pagine che già hanno il menu ☰
(subito dopo `mobile-menu.js`, da cui dipende). **Coerente col
requisito di non restare mai bloccati**: la gesture è solo una
scorciatoia in più, non sostituisce ☰/barra in basso/link home, che
restano sempre presenti e cliccabili.

**Verificato**: dato che il pannello di test non ha un touchscreen
reale, la logica è stata verificata simulando via codice i tocchi
(`TouchEvent` sintetici) su `formazioni.html`: uno swipe dal bordo
apre davvero il menu (confermato anche visivamente con screenshot); un
tocco lontano dal bordo o uno scorrimento verticale (scroll normale)
**non** aprono il menu per sbaglio. Zero errori console su
`formazioni.html` e `squadre.html` (quest'ultima ha già una sua
gestione del tocco per spostare i giocatori in campo — nessun
conflitto, perché il nuovo script agisce solo entro i 24px dal bordo
sinistro dello schermo). Su desktop lo script non fa nulla (si
disattiva da solo se il dispositivo non è telefono/tablet).

**Nota per il test reale**: questa è una verifica di logica, non
sostituisce una prova su un telefono vero — quando possibile, andrebbe
riprovato con un dito reale per sentire se la sensibilità (24px di
partenza, 60px di soglia) è giusta o va regolata.

## D068 — Fase 3 anticipata: funzione "Curva vs Piana" (analisi, nulla implementato)

**Data:** 2026-09-24

**Contesto**: l'utente, con uno degli admin, salta alla Fase 3 per
progettare insieme una nuova funzione: ogni account sceglie "Curva" o
"Piana" (scelta vincolante), con bonus di giornata comuni/di fazione,
un mini-gioco pre-partita (1X2) che alimenta una classifica per
fazione, pop-up obbligatorio per gli utenti già iscritti, e una nuova
sezione Curva vs Piana dentro Classifiche.

**Trovato (solo lettura, nulla modificato)**:
- **Conflitto di nome**: "Curva" esiste già come *categoria di
  punteggio* per squadra fantasy (28 regole con `soggetto: "Curva"` in
  `resources/rules.json`, colonna "Curva" in Classifiche accanto a
  Giocatori/Capitano/Coach). La nuova "Curva vs Piana" è
  un'*appartenenza dell'utente*: concetti diversi, serve un nome
  distinto (es. "Fazione") per non confonderli.
- Bonus richiesti: "presenza in casa/trasferta" e "coro contro la
  piana" non esistono; "offese ai giocatori" esiste già ma come MALUS
  Curva (R029, -4) — la richiesta è un BONUS Piana, semantica opposta.
  Il catalogo regole ha `soggetto` (Squadra/Curva/Giocatore/Allenatore)
  ma nessun campo "fazione": serve un campo nuovo.
- Mini-gioco: `contest.html` (codice di Mocci) esiste, ma è
  "pronostico del risultato esatto" (`contest/matches`,
  `contest/predictions/{uid}/...`, `contest/scores`), non 1X2 pesato
  per fazione. Si sovrappone alla richiesta 1X2 già in
  `docs/PUNTI_APERTI.md` (D038).
- Registrazione: il documento utente si crea in `auth.html` (`users/{uid}`):
  qui va aggiunto il campo fazione; per gli utenti esistenti serve un
  controllo condiviso su tutte le pagine (pop-up bloccante).
- Regole Firestore vivono solo in Console (non verificabili da qui):
  ogni nuovo campo/collezione va verificato/aggiunto lì da chi ha
  accesso. Nessun accesso alle credenziali dell'utente (SAFE_PRACTICES).

**Non fatto**: nessuna implementazione, in attesa di 4 decisioni
di prodotto dell'utente/admin (nome fazione e attribuzione punti,
regole del mini-gioco, chi crea la lega nuova, screenshot "spazio
vuoto" in Classifiche mai ricevuto).

**Aggiornamento D068 (stessa sessione, risposte dell'utente)**:
- "Curva" e "Piana" = i **nomi dei 2 team** ("Curva Morello" e "Piana"),
  non una categoria di punteggio. Alcuni bonus comuni rientrano già nei
  bonus "Curva" generici (da rivedere dopo).
- Punti a due livelli: (a) alcuni bonus contano anche per la stagione di
  gioco; (b) i punti dei **mini-giochi** creano una nuova categoria in
  Classifiche con la classifica per team (Curva Morello vs Piana).
- **Mini-gioco di Mocci, com'è oggi nel codice** (`contest.html`): ogni
  utente pronostica il **risultato esatto** della partita dell'Athletic
  fino a 30 minuti prima; un pronostico per partita
  (`contest/predictions/{uid}/{G}`); punteggi previsti in
  `contest/settings.points`: risultato esatto 10, differenza reti 5,
  solo segno 1X2 = 2; premio stagionale (felpa). **Lacuna**: nel
  repository non esiste nessun codice che inserisca il risultato reale,
  calcoli i punti e aggiorni `totalPoints`/`contest/scores`
  (nessuna Cloud Function, nessuna pagina admin) — quella parte o è
  stata fatta a mano/altrove da Mocci, o non è mai stata scritta.
- Lega nuova: l'utente parte il 29/09 e torna il 24/10; se non c'è
  tempo, la prepara Mocci e si integra al ritorno.

## D069 — Mini-gioco (contest) rifatto: fazioni, punteggi, classifica per team

**Data:** 2026-09-24

**Richiesto dall'utente**: sistemare il mini-gioco (database "embrionale"
secondo Mocci) integrando ciò che manca; punti per team Curva Morello /
Piana.

**Trovato leggendo il database (sola lettura)**: `contest/matches` e
`contest/scores` **non esistono**; `contest/settings` è bloccato dalle
regole; nessun pronostico salvato. La vera fonte partite+risultati è
`athletic_calendar` (3 partite; `homeScore/awayScore` = risultato).
Bug del vecchio codice: caricava solo partite senza risultato (i punti
non si vedevano mai) e l'anno era fisso 2024/2025.

**Fatto** (nuova struttura, nessuna migrazione: non c'erano dati):
- `resources/contest-scoring.js`: logica pura. Punti di Mocci
  mantenuti: esatto 10, differenza reti 5, solo esito 1X2 = 2. Anno di
  stagione calcolato dalla data (da luglio in poi = anno corrente).
  Testata nel browser su 9 casi + date + classifica: tutto ok.
- `resources/faction.js`: fazione in `users/{uid}.fazione`
  (`curva` = "Curva Morello", `piana` = "Piana"); finestra **non
  chiudibile** con doppia conferma ("definitiva"). Pronta per essere
  richiamata in tutta l'app (pop-up per chi è già iscritto): oggi la
  usa solo il contest.
- `contest.html`: chiede la fazione; usa `athletic_calendar` come
  fonte (anche partite passate/con risultato); salva i pronostici in
  **`contest_predictions/{G}_{uid}`** (collezione piatta, con fazione e
  nome dentro: così l'admin può leggerli tutti; la vecchia
  sottocollezione per-utente non era elencabile dal client).
- `admin-contest.html` (nuova, solo admin): per ogni giornata con
  risultato inserito da Gestione Calendario, "Calcola punti" valuta i
  pronostici e ricalcola **da zero** `contest_standings/current`
  (rifacibile senza rischi).
- `contest-leaderboard.html`: legge `contest_standings/current`, mostra
  il blocco **Curva Morello vs Piana** (punti, giocatori, media per
  giocatore: la media serve perché una fazione più numerosa vince
  sempre in somma) e i nomi ora sono protetti da HTML iniettato.

**Verificato**: logica punteggi, finestra fazione, caricamento
calendario reale, render partita, pagina admin (blocca i non-admin).
**NON verificato** end-to-end con scritture vere: le nuove collezioni
non hanno ancora regole → oggi danno `permission-denied` (atteso). Non
ho scritto nulla nel database vero.

**Da fare in Console Firebase (chi ha accesso)** — aggiungere:
```
match /contest_predictions/{predId} {
  allow read: if isSignedIn();
  allow create, update: if isSignedIn()
    && request.resource.data.uid == request.auth.uid
    && predId == request.resource.data.matchKey + '_' + request.auth.uid
    && request.resource.data.points == null
    && (resource == null || resource.data.points == null);
  allow update, delete: if isAdmin();
}
match /contest_standings/{docId} {
  allow read: if isSignedIn();
  allow write: if isAdmin();
}
```
e nella regola già esistente di `users/{uid}` (senza sostituirla)
aggiungere il vincolo che `fazione`, una volta impostata, non si può
cambiare dall'utente (solo admin):
`!('fazione' in resource.data) || request.resource.data.fazione == resource.data.fazione`.

**Ancora aperto**: sezione "Curva vs Piana" dentro Classifiche (serve lo
screenshot dello spazio vuoto), pop-up fazione obbligatorio su tutta
l'app per gli iscritti dell'anno scorso, campo "fazione" nelle regole
bonus (comuni/Curva/Piana), calendario da aggiornare alla stagione
nuova (date attuali = ottobre 2025), test reale con un admin dopo le
regole. Le fazioni nel `contest` sono globali (non per lega).

## D070 — Bozza regole del contest scritta (non ancora su Firebase)

**Data:** 2026-09-24

Su richiesta dell'utente scritto `docs/FIRESTORE_RULES_CONTEST.md`:
tabella dei parametri di gioco (punti di Mocci, chiusura, criterio di
classifica per team) + testo Firestore pronto da incollare (D069) con il
vincolo "la fazione non si cambia" e la regola anti-auto-assegnazione
punti. **Non applicata.** Servono: il file di regole attuale completo (per
inserirle senza rompere nulla) e le decisioni sui parametri.

## D071 — Regole del contest decise: voto 1-X-2, 10 punti, apertura 24h prima

**Data:** 2026-09-24

**Decisioni dell'utente** (con l'admin): (1) classifica Curva Morello vs
Piana = **somma dei punti**; (2) il voto è **1-X-2** (vittoria casa /
pareggio / vittoria ospite): **10 punti se l'esito è giusto, 0
altrimenti** — sostituisce lo schema di Mocci (risultato esatto 10/5/2);
lo scopo è ridurre lo squilibrio tra fazioni; (3) i punti restano
**nel codice** (nessuna pagina admin per cambiarli); (4) le votazioni
**si aprono 24 ore prima** della partita; la chiusura resta 30 minuti
prima (valore di Mocci, non discusso: da confermare).

**Interpretazione da confermare**: "prende punti solo chi azzecca il
risultato esatto" letto come "azzecca l'esito 1-X-2" (coerente con
"Vittoria-Pareggio-Sconfitta"). Se invece intendeva il punteggio esatto
(es. 2-1), va detto: è una modifica piccola.

**Fatto**: `resources/contest-scoring.js` (10/0, finestre di voto),
`contest.html` (tre pulsanti "Vince casa / Pareggio / Vince ospite",
stato "si vota da…", salva `pick`), `contest_predictions` ora ha
`pick` al posto di `home/away`, statistiche `hits` invece di `exact`,
bozza regole `docs/FIRESTORE_RULES_CONTEST.md` aggiornata (valida
`pick in ['1','X','2']`). Testati 11 casi di punteggio, finestre
(apre 21/10 21:00, chiude 22/10 20:30 per una partita del 22/10 21:00),
classifica per team, schermata con votazione aperta (simulata in
pagina). Nessuna scrittura nel database vero.

**Reminder**: una notifica push dall'app **non è fattibile** oggi (serve
un server/Cloud Functions, il sito è statico). Fattibili: (a) un
avviso dentro l'app ("voto aperto, non hai ancora votato") in Home;
(b) testo pronto da incollare nel gruppo WhatsApp. Da decidere.

## D072 — Fazione per squadra, nome reale, avviso in Home, WhatsApp; modello bonus definito

**Data:** 2026-09-24

**Decisioni dell'utente**: la fazione si sceglie **una volta per la
squadra** (i compagni ereditano); nome e cognome reali (o soprannome
riconoscibile) **obbligatori**, per aiutare gli admin; valori dei nuovi
bonus proposti da Claude e corretti dall'utente; il voto del mini-gioco
è l'**esito 1-X-2** (confermato); chiusura voti: non contestata (30 min).

**Modello dei bonus (dettato dall'utente, da implementare)**:
- Ogni bonus ha una **fazione di riferimento**: comune (vale per
  entrambe), "Curva Morello" (solo per squadre di quella fazione),
  "Piana" (solo Piana). I bonus comuni oggi "Curva" da rivedere dopo.
- I punti dei bonus di fazione contano **due volte**: nella lega
  fantasy (punteggio della squadra) e nella classifica di fazione.
- I punti del **mini-gioco** contano solo nella classifica di fazione,
  **fuori dalla lega fantasy**.
- Classifica di fazione = mini-gioco + bonus di fazione sommati.
- Li assegna l'**admin dopo la partita**, per squadra (es. "Curva gonfi
  è andata in trasferta" → presenza → punti a squadra e a fazione).
- Per aiutare gli admin: accanto a ogni squadra mostrare i nomi reali.

**Fatto in questa tornata** (nessuna scrittura nel DB da parte mia):
- `resources/faction.js`: chi non ha fazione la eredita dalla squadra
  (`leagues/{lega}/teams/{n}.fazione`) se già scelta, altrimenti sceglie
  (doppia conferma, definitiva) e la salva su utente e, se le regole lo
  permettono, sulla squadra; poi chiede il **nome reale**
  (`users/{uid}.nomeReale`, minimo 2 caratteri), finestre non chiudibili.
- `resources/faction-gate.js`: la finestra compare su 14 pagine utente
  (Home, Squadre, Formazioni, Classifiche, Bacheca, Calcolo, Statistiche,
  Profilo, Store, Calendario, Notifiche, Classifica, Recap, Riepilogo
  formazione), ricordando l'esito per la sessione.
- `resources/contest-reminder.js` (Home): avviso "Voto aperto, non hai
  ancora votato" se c'è una partita con votazione aperta e nessun voto.
  **Non è una notifica push** (impossibile senza server): compare aprendo
  l'app. Non ancora visto a schermo (serve una partita aperta + regole).
- `admin-contest.html`: messaggio **WhatsApp** pronto per la prossima
  partita con pulsante "Copia"; la pagina non si blocca più se mancano
  le regole.

**Verificato**: finestra nome (validazione, non chiudibile), messaggio
WhatsApp con dati reali del calendario, zero errori nuovi.

**Da notare**: il profilo dell'utente Iacopo risulta già con
`fazione: curva` (scritta il 24/09 alle 21:57 dal suo stesso test, non
da Claude). **Privacy**: `nomeReale` sta in `users/`, leggibile da ogni
utente loggato per come sono le regole attuali (lettura di altri utenti
consentita): "solo admin" è una scelta di interfaccia, non di sicurezza.

**Prossimo**: campo "fazione di riferimento" nel catalogo bonus, nuovi
bonus (presenza casa/trasferta, coro contro la piana, offese ai
giocatori Piana) con valori proposti, assegnazione per squadra con nomi
reali in `matchday.html`, sezione Curva vs Piana in Classifiche.

## D073 — Bonus esistenti, correzioni, pagina admin Fazioni

**Data:** 2026-09-24

**Decisioni dell'utente**: i 28 bonus "Curva" esistenti partono tutti
come **"comuni"** (poi si rivedono); i bonus di giornata sono **sempre
modificabili dall'admin** (i totali si ricalcolano); la sezione
"Curva vs Piana" in Classifiche deve essere **il più approfondita
possibile, a più sezioni/statistiche**; la fazione sbagliata si corregge
**solo da un admin, da una pagina dedicata**.

**Fatto**: `admin-fazioni.html` (nuova, solo admin, collegata da
`admin.html` insieme a `admin-contest.html`): squadre con i loro utenti,
fazione per squadra (aggiorna squadra + utenti con conferma), nome reale
modificabile per utente. Verificata in sola lettura con dati veri: 35
utenti nella lega, 19 squadre, 34 senza fazione, 35 senza nome reale.
Le scritture non sono state provate (servono regole di scrittura admin
su `users` e `leagues/{lega}/teams`).

**Valori proposti per i nuovi bonus (da correggere dall'utente)**:
presenza in casa +1 (comune), presenza in trasferta +2 (comune), coro
contro la piana +2 (solo Curva Morello), offese ai giocatori della
squadra +2 (solo Piana; distinto dal malus R029 "Offese ai propri
giocatori" -4 già esistente).

**Prossimo**: campo "fazione di riferimento" nel catalogo bonus
(`admin-rules.html`), assegnazione per squadra con nomi reali in
`matchday.html`, classifica di fazione = mini-gioco + bonus, sezioni
multiple in Classifiche.

## D074 — Classifiche: nuovo tab "Curva vs Piana" (lo spazio vuoto)

**Data:** 2026-09-24

Lo screenshot dell'utente mostrava la barra dei tab (Squadre, H2H,
Giornate, Giocatori) con spazio libero a destra: è il posto del quinto
tab. Aggiunto in `classifiche.html` il tab "Curva vs Piana" (su mobile
"Fazioni"), caricato solo quando si apre; legge
`contest_standings/current`. Sezioni: totale per fazione (mini-gioco;
bonus "in arrivo"), partecipazione (giocatori, voti, media), precisione
dei voti, andamento per giornata, classifica individuale del mini-gioco.
`buildStandings()` ora salva anche `byMatch` e i voti azzeccati per
fazione; `admin-contest.html` li scrive.

**Verificato**: tab su una riga a 437px; con la lettura vera mostra
"dati non disponibili (permessi)" (regole mancanti, atteso); layout con
dati finti in pagina ok; zero errori. **Da fare**: sezioni su bonus e
presenze quando esistono i bonus di fazione; provarlo con dati veri dopo
le regole Firestore.

## D075 — Regole Firestore reali lette: modifiche esatte pronte (non applicate)

**Data:** 2026-09-24

L'utente ha incollato il file di regole reale dalla Console. Letto per
intero; riscritto `docs/FIRESTORE_RULES_CONTEST.md` con **4 modifiche
puntuali** (il resto del file non cambia): (1) funzione
`factionUnchanged()`; (2) regola `update` delle squadre: un membro può
impostare la fazione **una volta**, poi solo admin; (3) regola `users`:
la fazione non si cambia da soli; (4) nuovi blocchi
`contest_predictions` (voto con fazione vera e senza auto-punti) e
`contest_standings`. Incluse istruzioni per provarle con il Simulatore
regole prima di pubblicare.

**Correzione a D072**: in `users/{uid}` **solo il proprietario e gli
admin** possono leggere: il nome reale NON è visibile agli altri utenti
(il mio test "lettura di altri utenti ok" valeva perché l'utente è
admin). La nota sulla privacy di D072 era sbagliata.

**Altre scoperte dalle regole**: `athletic_calendar` è leggibile da
tutti (ok per Home/contest); le squadre si leggono solo da membri della
lega; le regole `contest/*` vecchie restano ma sono inutilizzate;
`contest/settings` non ha regola (non serve più).

**Non applicato**: serve incollare in Console (chi ha accesso) e
provare col Simulatore; poi test vero con un admin.

## D076 — Corretto errore nella bozza regole (prima scelta fazione bloccata)

**Data:** 2026-09-24

Rileggendo la bozza D075 prima che venisse applicata: `factionUnchanged()`
avrebbe negato anche la **prima** scelta della fazione (da assente a
"curva"), rendendo impossibile sceglierla. Sostituita con
`factionLocked()` (blocca solo il cambio di una fazione già presente) e
`factionValid()` (solo 'curva'/'piana'). File
`docs/FIRESTORE_RULES_CONTEST.md` aggiornato. Nulla era ancora stato
incollato in Console.

## D077 — Regola: Firebase e locale sempre allineati; regole in `firestore.rules`

**Data:** 2026-09-24

**Deciso dall'utente**: tutto ciò che si fa su Firebase deve essere
allineato in locale; si aggiorna tutto da qui, database compresi.
**Fatto**: creato `firestore.rules` (fonte locale integrale delle regole:
quelle reali copiate dalla Console + modifiche D075/D076) e
`docs/FIREBASE_ALLINEAMENTO.md` (tabella cosa vive dove, struttura dati
aggiunta, procedura di pubblicazione, cosa manca: indici da esportare,
hosting non allineato). L'utente incolla in Console il file **intero**
al posto delle 4 modifiche a mano. **Regola per il futuro**: prima si
scrive in locale, poi si applica; ogni modifica fatta in Console va
riportata subito. I dati personali (`users`) non si copiano in locale.

## D078 — Regole nuove pubblicate: verifica, nessuna regressione

**Data:** 2026-09-24

L'utente ha pubblicato `firestore.rules` in Console. Verificato subito
(account dell'utente, admin) **in sola lettura**: lega, squadre,
giocatori, allenatori, regole, risultati, giornate, scadenze, post,
temporanei, calendario H2H, inviti, coppe, config, admins, calendario
Athletic, store, cataloghi globali, username, lista utenti, asta: **tutti
ok**. Nuove: `contest_predictions` e `contest_standings` **leggibili**.
Un'unica scrittura innocua (stessa fazione già presente, nessun cambio)
su `users`: **consentita**. Unico "permission-denied": lettura non
filtrata di `leagues/{lega}/notifications`, che è il comportamento
**già presente nelle regole originali** (la regola richiede
`userId == uid`); con il filtro usato dall'app funziona (5 risultati).
Caricate 14 pagine in una scheda pulita: **zero errori di permessi**
(prima le due collezioni contest davano permission-denied).

**Non verificato ancora** (servono scritture vere o il Simulatore): che
il cambio di una fazione già scelta sia negato; che un voto con `points`
o con fazione diversa sia negato; che un voto valido venga accettato;
che l'admin possa assegnare i punti; ereditarietà fazione squadra.
Proposta: farlo con un voto di prova a nome dell'utente, subito
cancellato, previo ok esplicito. `firestore.rules` e
`docs/FIREBASE_ALLINEAMENTO.md` aggiornati come pubblicati.

## D079 — Test con scritture vere del contest: superato, dati di prova rimossi

**Data:** 2026-09-24 (con ok dell'utente: "procediamo, finalizziamo")

Con l'account admin dell'utente, usando il codice vero delle pagine:
- **Voto valido** da `contest.html` (G2, pick 1, fazione curva): salvato
  in `contest_predictions/G2_<uid>` con `points: null`. ✔
- **5 scritture non valide, tutte NEGATE** dalle regole: punti
  auto-assegnati, fazione sbagliata, scelta non valida ('3'), id diverso
  dal proprio, uid di un altro. ✔
- **Calcolo admin** da `admin-contest.html` (risultato 2-0 simulato solo in
  memoria, calendario non toccato): voto → 10 punti, `contest_standings/
  current` scritta con team, andamento per giornata e classifica
  individuale. ✔
- **Classifiche → Curva vs Piana** con questi dati veri: totale 10-0,
  partecipazione, precisione 100%, andamento G2. ✔
- **Pulizia**: cancellati `G2_<uid>` e `contest_standings/current`;
  verificato: 0 pronostici, nessuna classifica, profilo dell'utente
  invariato (fazione curva, nome reale ancora da inserire).

**Non verificabile con un account admin** (l'admin passa sempre per la
regola admin): cambio di fazione negato a un utente normale; voto di un
non-admin; ereditarietà della fazione tra compagni di squadra. Da provare
con un secondo account NON admin (es. un giocatore): (1) scegliere fazione
e nome; (2) tentare di cambiare fazione (deve fallire); (3) un compagno
della stessa squadra deve trovare la fazione già scelta; (4) votare
quando la finestra è aperta.

## D080 — Bonus di fazione: regole, Calcolo giornata, Classifiche

**Data:** 2026-09-24

**Decisioni dell'utente**: presenze **per squadra** (casa/trasferta),
coro contro la piana e offese ai giocatori come **eventi di fazione**
(si spuntano una volta, valgono per tutte le squadre di quella fazione);
i bonus "Curva" comuni già esistenti **non contano** nella classifica di
fazione (uguali per tutti: si annullano); restano validi per la lega
fantasy. Classifica di fazione = mini-gioco + bonus.

**Fatto** (nessuna scrittura nel DB, tutto verificato in lettura o con
dati finti in pagina):
- `resources/faction-bonus.js`: logica pura, 9 controlli superati.
- `admin-rules.html`: campo **Assegnazione** (globale / per squadra /
  evento Curva Morello / evento Piana) nel form e per ogni regola Curva;
  salva `ambito` e `fazione` (anche nella cache regole). Questo è il
  "pannello admin delle regole bonus".
- `matchday.html`: nuovo tab **Fazioni** (eventi di fazione + presenze
  per squadra con i nomi reali dei membri); i bonus con `ambito` sono
  esclusi dalla Curva globale; il calcolo aggiunge il bonus di fazione
  al totale di ogni squadra (`breakdown.fazione`) e salva
  `results/{g}.faction_bonus` per la classifica.
- `classifiche.html` (tab Curva vs Piana): totale = mini-gioco + bonus,
  tabella "Bonus di giornata".

**Assunzioni da confermare**: un evento di fazione conta UNA volta nella
classifica di fazione (ma a ogni squadra della fazione nel fantasy); una
squadra senza fazione prende solo le presenze; con formazione mancante il
totale fantasy resta 0 ma le presenze contano per la fazione.

**Non fatto**: le 4 regole nuove non sono ancora create nella lega
esistente (si aggiungono da `admin-rules.html`; da aggiungere anche a
`resources/rules.json` come seme per leghe nuove: presenza casa +1,
trasferta +2, coro contro la piana +2 Curva Morello, offese ai giocatori
+2 Piana). Il salvataggio del Calcolo giornata con bonus non è stato
provato con scritture vere.

## D081 — CHECKPOINT: Curva Morello vs Piana (stato al 24/09/2026)

**Presenza semplificata (richiesta dell'utente)**: l'admin spunta solo
"Presente alla partita" per squadra; il sistema legge dal calendario
Athletic se la giornata è in casa o in trasferta e applica il bonus
giusto (regole "Presenza IN CASA" +1 / "IN TRASFERTA" +2, campo `luogo`).
Se la giornata non è nel calendario, il tab lo segnala. Testata la
logica (5 casi) e la schermata con dati reali.

**FATTO E VERIFICATO con scritture vere (D079)**: regole Firestore
pubblicate senza regressioni (25 percorsi, 14 pagine); voto valido
salvato; 5 scritture non valide negate; calcolo punti admin; classifica
di fazione; dati di prova rimossi.

**FATTO, verificato solo in lettura / dati finti**: pagina Fazioni e
nomi (`admin-fazioni.html`); avviso "voto aperto" in Home; messaggio
WhatsApp; campo Assegnazione in `admin-rules.html`; tab Fazioni in
`matchday.html`; tab Curva vs Piana con bonus in `classifiche.html`.

**NON FATTO**: le 4 regole bonus nella lega (si creano da
`admin-rules.html`; seme in `resources/rules.json` da aggiungere);
salvataggio del Calcolo giornata con bonus mai provato; account non
admin (fazione non modificabile, ereditarietà, voto); scelta di fazione
alla registrazione in `auth.html` (oggi la chiede la finestra
obbligatoria dopo l'accesso); sezioni statistiche su presenze; indici
Firestore da esportare; calendario Athletic da aggiornare alla stagione
nuova (date ottobre 2025); nome reale ancora da inserire (finestra
obbligatoria); revisione funzioni admin e navigazione generale (prossimo
passo dichiarato).

**Assunzioni da confermare**: evento di fazione conta una volta nella
classifica di fazione e a ogni squadra della fazione nel fantasy; chiusura
voti 30 min prima; una squadra senza fazione prende solo la presenza.

## D082 — Correzione: le notifiche push VERE sono possibili (D071/D072 dicevano "impossibile")

**Data:** 2026-09-24

Su domanda dell'utente ("non c'è modo di mandare una notifica stile app
normale?") rivista l'affermazione di D071/D072, troppo netta. **Le push
vere sono possibili** con Firebase Cloud Messaging. Stato nel progetto:
`sw.js` ha già l'ascoltatore `push` che mostra la notifica;
`resources/notifications.js` sa chiedere il permesso e mostrare
notifiche locali; **manca tutto il resto**: SDK di messaggistica, chiave
VAPID (Console → Cloud Messaging → Web Push), salvataggio dei token
dei dispositivi, e soprattutto **un mittente** che invii nel momento
giusto. `resources/push-notifications.js` NON è push di sistema: scrive
solo notifiche interne nella collezione `notifications` (campanella).

**Vincoli veri**: iPhone solo se l'app è aggiunta alla schermata Home
(iOS 16.4+) e l'utente accetta; Android anche dal browser. Il mittente
richiede una di queste strade: (a) Cloud Functions programmate — piano
Firebase Blaze (carta, a questa scala costo ~0); (b) GitHub Actions
programmata con chiave di servizio come segreto GitHub (gratis, ma una
chiave sensibile che imposta l'utente, mai Claude); (c) servizio esterno
tipo OneSignal (gratis, invio da dashboard/programmato, dati dei
dispositivi su terzi). Il reminder in Home e il messaggio WhatsApp
restano come rete di sicurezza per chi non attiva le notifiche.

**Deciso**: da scegliere dall'utente (vedi PUNTI_APERTI).

## D083 — Il mini-gioco Curva vs Piana diventa raggiungibile dai giocatori (2026-09-24)
- **Deciso**: i giocatori devono poter vedere e votare, non solo l'admin. Su richiesta: card elegante in Home sotto "La Mia Squadra".
- **Fatto**: `resources/contest-reminder.js` riscritto come card fissa (stato: voto aperto / già votato / prossimo voto + punti delle due fazioni); voce "Mini-gioco" nel menu mobile e nella barra desktop; `classifiche.html#fazioni` apre direttamente la scheda + pulsante "Vota la prossima partita". Verificato in Home (mobile) e Classifiche, nessun errore.
- **Prossimo passo**: 4 regole bonus nella lega + Calcolo giornata di prova (con ok esplicito); test con account non admin.

## D084 — Selettore giornate del Mini-gioco + restyling generale in coda (2026-09-24)
- **Fatto**: in `contest.html` il selettore giornate è una griglia a pillole; le giornate passate (chiuse o con risultato) hanno una "/" sopra, quelle votabili un bordo verde, con legenda. Verificato su mobile.
- **Rimandato (idea dell'utente)**: restyling generale di tutte le pagine, più eleganti e coerenti "da app". Proposta: a tappe (1 pagine giocatori, 2 admin, 3 componente per componente). Motivo: prima ci sono cose in sospeso più importanti (4 regole bonus, Calcolo giornata di prova, test con account non admin, revisione admin/navigazione).

## D085 — Punto della situazione e avvio "Fase 3 a gamba tesa" (2026-09-25)
**Deciso dall'utente**: si chiude la Fase 3 prima delle rifiniture (estetica e velocità dopo). Obiettivi: (1) calcolo scontri diretti (dettagli dagli admin in arrivo), (2) pannello admin a blocchi, usabile da chi non scrive codice, con parametri della stagione modificabili, (3) bonus/malus in tempo reale durante la partita (idee dell'utente da approfondire), (4) archiviare la stagione vecchia (consultabile) e crearne una nuova. **Tutto in locale, niente pubblicazione finché non funziona al 100%.**

**Verifiche fatte (sola lettura, dati veri):**
- Curva/Piana lato Firebase: **nessuna azione in Console mancante**. Regole pubblicate (D078), nessun indice composto richiesto dalle query nuove (solo filtri su un campo). Restano azioni *da app*, non da Console: fazioni delle squadre non ancora impostate (nessuna squadra ha `fazione`), 4 regole bonus da creare, test con un account non admin.
- Inventario Firestore della lega: 18 squadre, 32 giocatori, 0 allenatori, 100 regole, giornate `days` G1–G21 calcolate, `results` con squadre fino a G21 (i documenti "genitore" esistono solo per G1–G3: per archiviare vanno letti per numero di giornata, non elencati), formazioni salvate `teams/{n}/saved`, 11 inviti, `matchday_temp` G1–G21, 2 `deadlines`. Globali: 41 utenti, 4 admin, 3 partite in `athletic_calendar` (date ottobre 2025), `config/homeCards`.
- **Scontri diretti già a metà**: esiste il generatore di calendario (`calendario.html`, round-robin) e c'è un calendario salvato di 34 giornate per 18 squadre sotto la stagione `2024-25`; esiste la classifica che li legge (`classifiche.html` tab, `h2h-standings.html`). **Manca il pezzo che trasforma i punti della giornata in risultato della sfida**: oggi `h2h_results` è vuoto e l'unico codice che ci scrive è quello delle sconfitte a tavolino (formazione mancante). La stagione `'2024-25'` è scritta a mano in 4 file (`calendario.html`, `classifiche.html`, `h2h-standings.html`, `matchday.html`) mentre la lega dice `season: "2025/2026"`.
- Parametri già nel documento lega (`settings`): budget, max squadre, moduli, wildcard, coppa, modificatore difesa. Il mini-gioco invece ha 10 punti / 24h / 30 min scritti nel codice.
- Regole: `leagues/{lega}/config/*` è già scrivibile dagli admin di lega (utile per i parametri di stagione senza toccare la Console). Un archivio stagioni richiederà **una regola nuova** (da scrivere prima in `firestore.rules`).

**Documenti riallineati**: `CLAUDE.md` (sezione regole Firestore non più vera; fase attiva), `docs/MAPPA_PAGINE.md` (mancavano `admin-contest.html`, `admin-fazioni.html`; 76 pagine), `docs/FIRESTORE_RULES_CONTEST.md` (diceva "non applicate"), `docs/PUNTI_APERTI.md`.

**Proposta "Stagione"** (da confermare): la stagione in corso resta nei percorsi di oggi (nessuna riscrittura delle 76 pagine); i suoi parametri stanno in `leagues/{lega}/config/season`; alla chiusura si fa una **copia completa** in `leagues/{lega}/archive/{stagione}` (consultabile in sola lettura), verificata, e solo dopo si azzera per la nuova.

**Prossimo passo**: risposte dell'utente sulle decisioni aperte (definizione di stagione, cosa si azzera, chi può chiudere), poi pannello admin a blocchi.

## D086 — Decisioni sulla Stagione (2026-09-25)
- **L'asta si rifà ogni anno** (ottobre 2026): alla nuova stagione le rose si svuotano. Scadenza pratica: finire la Fase 3 prima dell'asta di ottobre.
- **Chiusura/archiviazione stagione: tutti e 4 gli admin**, con doppia conferma e archivio verificato obbligatorio prima di azzerare.
- **Stagione passata = 2025/26** (quella dei dati attuali), **nuova = 2026/27**. Il `'2024-25'` scritto nel codice è un'etichetta sbagliata/storica del calendario scontri diretti.
- Modello "Stagione" e pannello admin a 6 blocchi approvati come proposti in D085.
- **Ordine di lavoro**: (1) pannello admin a blocchi, (2) blocco Stagione (parametri → archivio → nuova stagione) + pagina Archivio consultabile, (3) Partita live (idee dell'utente), (4) scontri diretti: **predisporre ora** (logica + parametri), attivare quando arriva la lista squadre/dettagli degli admin.
- Tutto in locale, nulla online finché non funziona al 100%.

## D087 — Pannello admin a 6 blocchi, Stagione, Archivio, scontri diretti predisposti (2026-09-25)
**Fatto (tutto in locale, niente online):**
- `admin.html` riscritto: 6 blocchi (Partita live, Stagione, Squadre e giocatori, Regole, Mini-gioco, Archivio e sistema), barra per saltare tra i blocchi, riquadro con la stagione in corso, accesso solo admin (prima la pagina non controllava). Strumenti tecnici chiusi in una tendina. Collegate anche 3 pagine esistenti che l'hub vecchio non linkava (`admin-users`, `admin-cup`, `admin-store`). Copia del vecchio hub in `archive/admin-hub-pre-D087.html`.
- **Stagione** (`resources/season.js`): parametri in `leagues/{lega}/config/season` (percorso già scrivibile dagli admin di lega, nessuna regola nuova). Se il documento non c'è valgono i DEFAULT = comportamento di oggi. Parametri: nome, stato, n. squadre, n. giornate, modalità (classica/scontri/entrambe), scontri diretti (punti V/N/P, conversione punti→gol a fasce o diretta, soglie, risultato a tavolino), mini-gioco (punti, apertura, chiusura).
- Il mini-gioco legge ora punti/orari dalla Stagione (`ContestScoring.configure`); le "giocate azzeccate" si contano come punti > 0 (così cambiare i punti a metà stagione non falsa lo storico).
- **`admin-stagione.html`** (nuova): 3 schede — Impostazioni, Archivia stagione (conta → copia → verifica), Nuova stagione (solo con archivio verificato + "NUOVA STAGIONE" scritto + doppia conferma).
- **`resources/season-archive.js`**: raccoglie 931 documenti della stagione 2025/26 (verificato in lettura), li copia in `leagues/{lega}/archive/{stagione}/items`, rilegge e confronta i conteggi. I risultati per squadra si leggono giornata per giornata G1–G50 (i documenti "genitore" G4+ non esistono, D085). Classifica finale calcolata = identica a `classifiche.html` per tutte le 18 squadre.
- **`archivio.html`** (nuova, per tutti): campione e podio, classifica finale, punti giornata per giornata, Curva vs Piana, partite Athletic. Voce "Albo d'oro" nel menu.
- **Scontri diretti predisposti** (`resources/h2h.js`): esito della sfida, a tavolino, classifica; agganciato al Calcolo giornata ma **attivo solo con modalità scontri/entrambe** (oggi classica → non scrive nulla). La cartella della stagione non è più `'2024-25'` fisso in 4 pagine ma arriva dalla Stagione (`seasonKey()`), con lo stesso valore di oggi come partenza.
- Etichetta cache di menu/barra portata a `20260925` su tutte le pagine.

**Scoperta da portare agli admin**: le squadre fanno 5–30 punti a giornata (G1: 4–16). Con le fasce del fantacalcio classico (1° gol a 66, poi ogni 6) finirebbe sempre 0-0: le soglie vanno scelte sulla scala Fanta Athletic. Anche il "risultato a tavolino" oggi è 3 a -10 (scritto per punti, non per gol): da decidere.

**Serve su Firebase (una volta, dall'utente)**: pubblicare `firestore.rules` aggiornato (regola nuova `leagues/{lega}/archive/...`). Senza, archiviare dà "permesso negato".

**Prossimo passo**: pubblicazione regola → archiviazione vera della 2025/26 (non cancella niente) → poi Partita live.

## D088 — Backup completo del database + percorso "Creazione nuova stagione" (2026-09-25)
**Richiesta dell'admin (via utente)**: Iacopo archivia la stagione corrente; gli admin trovano pronto un percorso per creare la stagione nuova nella lega "Fanta Athletic" e partire puliti, sicuri dell'archiviazione. "Mi raccomando i backup."

**Precisazione data all'utente**: le pagine sono in locale, ma il database è uno solo (Firebase vero). Archiviare = scrivere su Firebase (solo copia, non cancella). Per questo prima un backup indipendente su disco.

**Fatto:**
- **Backup completo su disco** (sola lettura dal database): `backups-firestore/backup-completo-2025-26-2026-09-25-00-33-11.json`, 989 documenti (stagione intera + 41 utenti + 4 admin + inviti + configurazioni), 694 KB. Verificato: JSON leggibile, 989 percorsi unici, totale Mocci e Canni = 524,5 come in classifica. **Seconda copia** fuori dal progetto: `~/Claude/fanta-athletic-BACKUP-DATABASE/`. Contiene dati personali (email): cartella esclusa da Git (`.gitignore`), mai da pubblicare.
- Il server locale di sviluppo (`.claude/no-cache-server.py`) ora riceve i backup (`POST /__backup__/…`, solo dal computer stesso) e li salva in `backups-firestore/`. Riguarda solo lo sviluppo in locale.
- **Percorso guidato** in `admin-stagione.html` (scheda "Percorso nuova stagione", anche `admin-stagione.html#percorso`, e tessera "Creazione nuova stagione" nel blocco Stagione del pannello): 11 passi con stato automatico dal database — archivio verificato, apertura stagione nuova, impostazioni, calendario Athletic, squadre, fazioni, giocatori, regole, asta (rose piene), calendario scontri diretti (solo se modalità scontri), avvio "In corso".

**Da fare adesso**: l'utente pubblica `firestore.rules` (regola archivio) → Claude archivia la 2025/26 dal pannello e verifica. **L'azzeramento (passo 2) NON lo fa Claude**: resta agli admin, che partono dal percorso.

## D089 — Regola archivio pubblicata, stagione 2025/26 ARCHIVIATA e verificata (2026-09-25)
- **Regola pubblicata dall'utente** (`firestore.rules` intero, blocco nuovo "Archivio stagioni"). Verificato: l'archivio passa da "permesso negato" a leggibile; nessuna regressione su 22 letture (lega, squadre, formazioni, giocatori, regole, giornate, risultati, scontri diretti, inviti, utenti, admin, calendario, mini-gioco, config) con gli stessi numeri del backup, e 6 pagine (Squadre, Formazioni, Classifiche, Mini-gioco, Bacheca, Regole) senza errori né permessi negati nella console completa.
- **Archiviazione eseguita** da `admin-stagione.html` (stesso percorso che useranno gli admin): 931 documenti copiati in `leagues/4rq1Rr0TquRfuPLmqQTn/archive/2025-26`, in 14 secondi, stato **verificato**.
- **Controllo indipendente più severo**: ogni documento archiviato confrontato **campo per campo** con il backup su disco (D088): 931/931 identici, nessuno mancante, nessuno in più. Originali intatti (nulla cancellato). Classifica nel riepilogo: 1° Pettecivi 558, 2° Mocci e Canni 524,5, 3° Ricchi e Poveri 498 = `classifiche.html`.
- **Albo d'oro** (`archivio.html`) mostra la 2025/26 dall'archivio vero.
- Corretto il percorso guidato: il passo 1 ora riconosce l'archivio della stagione in corso anche prima dell'azzeramento.
- **Non fatto (di proposito)**: l'azzeramento/apertura 2026/27 — lo fanno gli admin dal percorso. Attenzione: fino ad allora il sito online continua a mostrare la stagione 2025/26 (i dati sono ancora lì, intatti).
- **Prossimo passo**: Partita live (idee dell'utente); dettagli scontri diretti dagli admin.

## D090 — Richiesta: tutorial PDF per gli admin (2026-09-25)
- **Deciso dall'utente**: alla fine della Fase 3 serve una "guida PDF" per gli admin (non tecnologici) su come creare la stagione nuova e usare le funzioni nuove senza sbagliare.
- **Come**: passi del percorso guidato (`admin-stagione.html#percorso`) con screenshot veri e linguaggio semplice; da fare quando pannello e Partita live sono definitivi (altrimenti gli screenshot invecchiano subito).
- Si parte ora con la Partita live: in attesa delle idee dell'utente.

## D091 — Partita live: idee dell'utente e schema proposto (2026-09-25, NON implementato)
**Idee dell'utente**: (1) la usano entrambi gli admin, senza dividersi i compiti: doppio controllo incrociato per trovare discrepanze; (2) i giocatori non devono vedere i punti crescere in diretta; (3) pannello a tasti a più livelli, facile e intuitivo, con "Annulla"; (4) al fischio finale i due admin chiudono i dati → incrocio: i dati uguali escono, quelli diversi (es. segnati da uno solo) vanno "in revisione"; entro 48h esce la versione revisionata, che può includere anche correzioni da "segnalazioni esterne" validate.

**Schema proposto** (in attesa di 4 risposte: doppio foglio anche per curva/fazioni; un solo admin presente; chi decide in revisione; cosa vedono i giocatori):
- Livelli: Chi? (convocati / allenatore / curva / fazioni) → Bonus o Malus (+ scorciatoie Gol, Assist, Giallo, Rosso) → voce (tocchi ripetuti per le voci a conteggio). Annulla ultimo, diario della partita, punti parziali per giocatore.
- Un foglio per admin, "cieco" durante la partita; "Chiudo il mio foglio"; incrocio → provvisorio (solo voci concordi) + revisione (voci discordi) → "Pubblica definitivi" entro 48h, correzioni con nota e autore.
- Il motore di calcolo resta quello di `matchday.html` (la Partita live compila le stesse selezioni `players/coaches/curva`). Salvataggio anche offline (segnale scarso allo stadio). Servirà una regola Firestore nuova per i fogli.
- Regole reali: soggetto Giocatore 57 (31 bonus / 26 malus), Allenatore 9, Curva 30, Squadra 3.

## D092 — Partita live: risposte dell'utente, schema definitivo (2026-09-25)
1. **Doppio controllo su tutto** (giocatori, allenatori, curva, fazioni/presenze).
2. **Un solo admin presente**: niente doppio controllo, ci si fida di lui — il suo foglio vale direttamente (esce comunque "provvisorio", così le segnalazioni esterne entro 48h restano possibili).
3. **Revisione**: la vedono entrambi, chiunque dei due può chiudere (resta scritto chi).
4. **Giocatori**: vedono solo che i punti sono "provvisori", senza dettagli sulle discrepanze.

## D093 — Partita live costruita (in locale), in attesa della regola Firestore (2026-09-25)
**Fatto:**
- `live.html` (nuova, per admin, pensata per il telefono): livello 1 Convocati / Giocatori / Allenatori / Curva / Fazioni; livello 2-3 pannello del giocatore con scorciatoie ⚽ Gol, 🅰️ Assist, 🟨 Giallo, 🟥 Rosso, poi Bonus/Malus con +/−; curva divisa in Generali / In casa / In trasferta con evidenziata quella della partita (dal calendario Athletic); fazioni: presenze e eventi. Barra fissa: Annulla, Diario (ogni voce si toglie), Fischio finale. Punti parziali sui tasti.
- Un foglio per admin, "cieco"; salvato sul telefono (localStorage) e sul database (`leagues/{lega}/live/{G}/sheets/{uid}`): se manca la rete il foglio non si perde (verificato: ricaricando la pagina il foglio torna).
- Dopo il fischio: incrocio → "Pubblica punti provvisori" (solo voci uguali; con un solo admin vale il suo foglio) → revisione con conto alla rovescia 48h: per ogni discrepanza "Vale A / Vale B / 0", correzioni da segnalazione con nota e autore → "Pubblica punti definitivi" (solo quando tutte le discrepanze sono decise). Basta uno dei due admin.
- Il calcolo resta quello di `matchday.html`: la live scrive le selezioni in `matchday_temp/{G}` e apre `matchday.html?g=G&from=live`; lì un banner avvisa "Dati dalla Partita live — PROVVISORI/DEFINITIVI", si usano SOLO quei dati, e al "Salva giornata" le selezioni sostituiscono per intero quelle vecchie (una voce tolta in revisione sparisce davvero) e si segna `results/{G}.stato` = provvisorio/definitivo. Senza `from=live` `matchday.html` si comporta come prima.
- Giocatori: avviso "⏳ Punti Gx provvisori — definitivi entro …" in Home e Classifiche (`resources/provisional-badge.js`), senza dettagli.
- `resources/live-core.js`: logica pura, 11/11 prove superate + prove dell'interfaccia (convocati, gol, giallo, annulla, diario, persistenza, incrocio, revisione, pubblicazione bloccata finché ci sono discrepanze).
- Tessera "Partita live" nel blocco 1 del pannello admin.

**Scoperte:**
- La convocazione vera è la regola R099 "Convocazione" (+1); il vecchio `__convocato` aggiungeva un altro +1: **nella G3 della 2025/26 i convocati hanno preso +2** (dato storico, archiviato, non toccato). La Partita live usa solo R099.
- Nel tema scuro una regola generale di `sheet.css` ricolora di grigio tutti i pulsanti: sulle pagine nuove (`live.html`, `admin-stagione.html`, `archivio.html`) i colori ora sono prioritari (la scheda attiva di Stagione/Archivio prima non si evidenziava).
- "Convocazione" è doppia nel catalogo regole (due documenti R099): la live tiene un solo documento per regola.

**Serve su Firebase**: pubblicare `firestore.rules` (blocco nuovo "Partita live"). Verificato che oggi la scrittura è bloccata e che nulla è stato scritto. Poi: prova completa con due admin veri (Iacopo + un altro) su una giornata di prova.

## D094 — CHECKPOINT: revisione completa del blocco Curva/Piana → Stagione → Partita live (2026-09-25)
**Richiesta dell'utente**: fermarsi, revisionare l'INTERO blocco da Curva/Piana in poi (D068–D093), allineare tutti i file MD, testare, consolidare, salvare e predisporre la sessione dopo. Niente commit Git.

**Test fatti in questa revisione:**
- Tutte le pagine toccate dal blocco (29 aperte una per una, in una scheda pulita, con la console letta subito dopo ciascuna): Home, Classifiche (+ scheda Curva vs Piana), Mini-gioco, Classifica mini-gioco, Calcolo giornata, Squadre, Formazioni, Bacheca, Regole, Pannello admin, Stagione, Archivio, Admin mini-gioco, Fazioni, Partita live, Calendario scontri, Classifica scontri, Statistiche, Profilo, Classifica, Recap, Calendario Athletic, Riepilogo titolari. **Nessun errore, nessun permesso negato** tranne due casi attesi: Partita live (regola non ancora pubblicata, D093) e Coppa in `calendario.html` (preesistente, Coppa disattivata).
- **Lezione di metodo**: lo strumento che legge la console filtra per **una parola sola**; le ricerche "A|B" non trovano mai niente (anche quando c'è). Un primo giro di controlli era quindi falsamente pulito: scoperto con un avviso-sonda scritto apposta, rifatto tutto parola per parola. Inoltre la console tiene al massimo 500 messaggi: leggerla dopo ogni pagina, non a fine giro.
- Logica pura: contest (D069), fazioni/bonus (D080), stagione/archivio (D087, verificato campo per campo D089), scontri diretti (D087, su dati veri G1), Partita live (11/11 + prove interfaccia, D093).

**Documenti riallineati**: `CLAUDE.md` (blocco "PROSSIMA SESSIONE — PARTI DA QUI", Fase attiva 3, nota sulle etichette cache non più tutte `20260920-final`), `README.md` (server locale giusto `.claude/no-cache-server.py` porta 8912, `firestore.rules`, `backups-firestore/`), `docs/PUNTI_APERTI.md` (lista Fase 3 unica e ordinata; contesto stagioni aggiornato: passata 2025/26 archiviata, nuova 2026/27), `docs/MAPPA_PAGINE.md` (+ `live.html`, 79 pagine), `docs/FIREBASE_ALLINEAMENTO.md` (regole: locale più avanti per la live; strutture `live/…` e `results.stato`).

**Stato Firebase ↔ locale**: `firestore.rules` locale ha in più solo il blocco "Partita live" (da pubblicare). Nessun indice nuovo necessario. Dati: unica scrittura della fase = archivio 2025/26 (+ prove del contest D079, già ripulite).

**Mai eseguito sul database vero (onestamente)**: Partita live completa, Calcolo giornata con bonus di fazione, "Apri stagione nuova" (azzeramento), account non admin. Sono in cima a `docs/PUNTI_APERTI.md`.

**Salvataggio**: copia completa del codice in `~/Claude/fanta-athletic-code-BACKUP-2026-09-25/` (252 file, verificata identica con `diff`, senza i backup del database e senza la vecchia copia del 19/09); backup del database del 25/09 in `backups-firestore/` + `~/Claude/fanta-athletic-BACKUP-DATABASE/`. Git: non inizializzato (su richiesta), siamo vicini.

**Prossima sessione**: vedi "PROSSIMA SESSIONE — PARTI DA QUI" in `CLAUDE.md`.

## D095 — Regola "Partita live" pubblicata e verificata; controllo "archivio completo" (2026-09-25)
- **Regola pubblicata dall'utente** (`firestore.rules` intero). Verificato: `live.html` non dà più permesso negato; 12 pagine (Partita live, Home, Classifiche, Calcolo giornata, Mini-gioco, Stagione, Archivio, Squadre, Formazioni, Pannello admin, Fazioni, Bacheca) senza errori né permessi negati, cercando parola per parola.
- **Effetto collaterale della verifica**: aprire `live.html` crea da solo il documento `leagues/{lega}/live/G19` (`stato: aperta`, nessun foglio) — la pagina sceglie la prima giornata non calcolata, che nei dati 2025/26 è la G19. Innocuo, da togliere con la pulizia della prova live.
- **Domanda dell'utente: "la stagione scorsa è archiviata ovunque? Le classifiche mostrano ancora l'anno scorso."** Controllo in sola lettura: raccolta di oggi = 931 documenti, archivio = 931, **identici campo per campo, nessuno mancante, cambiato o sparito** dall'archiviazione (D089). Le classifiche mostrano ancora la 2025/26 perché archiviare è una copia: l'azzeramento ("Apri stagione nuova") non è stato fatto (D088/D089, voluto).
- Cartelle fuori dall'archivio, verificate: `contest/matches|scores`, `auction/current` (+ offerte), `cups` vuote/assenti; `contest/settings` (vecchia pagina `admin-setup.html`) non leggibile, non usata. **`live` non è né archiviata né azzerata** da "Apri stagione nuova": da aggiungere se si vuole che l'azzeramento la pulisca.
- Dato da sistemare: un giocatore con id `c4fyWntWj1mTj4fekijO` compare in `live.html` senza nome (mostra l'id).
- **In attesa della scelta dell'utente**: fare noi l'azzeramento e aprire la 2026/27 vuota (cambierebbe D088, dove era lasciato agli admin) e in che ordine rispetto alla prova della Partita live.
- **Deciso dall'utente (2026-09-25)**: (a) prima la prova della Partita live sui dati 2025/26 ancora presenti, poi l'azzeramento; (b) **l'azzeramento e l'apertura della 2026/27 vuota li facciamo noi** (cambia D088, dove era lasciato agli admin): gli admin troveranno il percorso guidato già avviato e compileranno il resto; (c) la **bacheca si tiene**; (d) prova live **prima con il solo Iacopo** (vale il suo foglio), il doppio foglio con un secondo admin dopo. Accettato che, dopo l'azzeramento, il sito online mostri classifiche vuote finché non si pubblica anche `archivio.html`.
- **Aggiunta la Partita live all'azzeramento** (`resources/season-archive.js`: raccolta `live` + `live_sheets`, entrambe tra le cose cancellate da "Apri stagione nuova"; etichette e testo in `admin-stagione.html`; cache `season-archive.js?v=20260925b`). L'archivio 2025/26 già verificato non cambia (la verifica confronta l'archivio con i conteggi registrati da lui stesso).
- **Prova completa della Partita live con un solo admin (Iacopo), SUPERATA**, su G22 2025/26 (vuota), dal browser integrato: 4 convocati, gol + giallo a Sarri (+2,5 corretto), curva +2 → Fischio finale → "vale il tuo foglio" → provvisori → `matchday.html?from=live` con banner PROVVISORI, totali giusti (giocatori 5,5, curva 2) → Salva → `results/G22.stato = provvisorio`, punti squadra calcolati → revisione (47h58) → correzione da segnalazione "giallo Sarri → 0" con nota e autore → definitivi → banner DEFINITIVI, giocatori 6,0 → Salva → `stato = definitivo`, la voce tolta sparisce davvero da `days/G22`. Nel pannello di test le conferme del browser si chiudono da sole: fatte rispondere "OK" in automatico solo per la prova.
- **Bug vecchio trovato e corretto** (`matchday.html`, `applyForfeitPenalties`, codice dell'amico): la "sconfitta a tavolino" degli scontri diretti metteva una data "del server" dentro una lista, cosa che Firebase rifiuta → falliva **sempre** quando una squadra non aveva la formazione (nel backup: zero penalità registrate in tutta la 2025/26). Non bloccava il salvataggio. Corretto con una data normale (`Timestamp.now()`), riverificato: il documento ora si scrive. Nota: la funzione gira anche in modalità classica se esiste il calendario scontri della cartella in uso (dopo la stagione nuova la cartella sarà `2026-27`, vuota → non gira).
- Pulizia: tolto a mano `h2h_results/2024-25/giornate/G22` (creato dalla prova, l'azzeramento non lo avrebbe tolto). Il resto della prova (G22, live G19/G22) lo cancella l'azzeramento.
- **Backup nuovo prima dell'azzeramento**: `backups-firestore/backup-completo-pre-azzeramento-2026-09-25T05-04-34.json` (1.944 documenti: stagione + live + utenti + admin + config + inviti + archivio completo 931), copia identica in `~/Claude/fanta-athletic-BACKUP-DATABASE/`. Rispetto al backup D088 cambiano davvero solo i dati della prova, il profilo di Iacopo e `config/rules_cache` (le altre 895 "differenze" erano solo il formato delle date nel file).

## D096 — AZZERAMENTO fatto: stagione 2026/27 aperta, vuota (2026-09-25)
**Decisione dell'utente**: "tutto verificato, tutto funziona e tutto backuppato, procediamo". Solo l'azzeramento: la compilazione della stagione nuova (impostazioni, calendario Athletic, fazioni, giocatori, regole, asta/rose, avvio "In corso") resta agli admin dal percorso guidato (`admin-stagione.html#percorso`).
- **Eseguito** da `admin-stagione.html` → Nuova stagione (stesso percorso degli admin): 786/786 operazioni (cancellati 336 formazioni salvate, 22 giornate, 21 bozze, 2 scadenze, 377 risultati per squadra + 4 intestazioni, 3 documenti Partita live, 3 partite Athletic; svuotate le rose di 18 squadre). `config/season` = 2026-27 "preparazione" (precedente 2025-26, cartella scontri `2026-27`); la lega mostra "2026/2027".
- **Verificato subito dopo, sul database**: restano lega, 18 squadre (rose vuote), 32 giocatori, 101 regole, 41 utenti, 4 admin; archivio 2025/26 "verificato" con 931 documenti; la vecchia cartella scontri `2024-25` (34 giornate) resta, non più usata.
- **Pagine a stagione vuota** (scheda pulita, console parola per parola): Home, Classifiche, Squadre, Formazioni, Calcolo giornata, Partita live, Mini-gioco, Classifica mini-gioco, Albo d'oro (2025/26 intatta: Pettecivi 558), Stagione/Percorso, Calendario scontri, Statistiche, Bacheca, Pannello admin, Squadre admin, Calendario Athletic, Classifica scontri. **Nessun errore**; solo avvisi attesi ("nessuna giornata calcolata") e quelli già noti della Coppa disattivata.
- Percorso guidato: passi 1–2 ✓; da fare per gli admin: calendario Athletic (0 partite), fazioni (0/18), controllo giocatori e regole, rose (0/18), avvio.
- Piccolezza trovata: `calendario-athletic.html` ha "Stagione 2024/25" scritto a mano nel titolo e nel badge (da collegare alla Stagione).
- **Effetto online**: il sito pubblicato legge lo stesso database → mostra già classifiche e rose vuote; l'albo d'oro esiste solo in locale finché non si pubblica l'Hosting (accettato dall'utente, D095).
- Backup di riferimento per un eventuale ripristino manuale: `backup-completo-pre-azzeramento-2026-09-25T05-04-34.json` (D095).

## D097 — Piano verso la pubblicazione (2026-09-25)
**Deciso dall'utente**, in quest'ordine: (1) revisione della navigazione (pulsanti per tornare indietro/avanti ovunque); (2) alleggerire l'app e velocizzare i caricamenti; (3) integrare la logica degli scontri diretti, sapendo che mancano ancora le scelte degli admin (soglie, tavolino, punti: valori provvisori ben segnalati); (4) copia ZIP in più del codice (l'utente ha già la repository Git); (5) test completo; (6) se tutto ok: Git + pubblicazione per tutti. Giocatore senza nome e titolo "Stagione 2024/25" del Calendario Athletic: annotati come punti aperti (D096).

## D098 — Navigazione: ritorno al pannello su tutte le pagine admin, calendario partite nel menu (2026-09-25)
- **Controllo automatico di tutte le 79 pagine** (menu ☰, barra in basso, link indietro/home, pagine collegate da nessuno). Pagine dei giocatori: a posto (D067). Pagine admin: solo 3 su 22 riportavano al pannello; 4 senza **nessuna** uscita (`admin-calendario`, `admin-setup`, `force-update`, `verifica-squadre-utenti`). Cluster giochi (`wirc-*` ecc.) in pausa, non toccato; `giornata-calcolata-popup.html` e `results-h2h-modal.html` non collegati da nessuno (frammenti, da valutare).
- **Nuovo `resources/admin-back.js`**: aggiunge "← Pannello admin" in cima alla pagina, verso il blocco giusto di `admin.html` (`data-block`). Stile proprio (pillola blu navy, testo bianco) che si legge su pagine chiare e scure. Messo su 19 pagine admin. Verificato: Calendario admin (pagina chiara), Calcolo giornata, Squadre, Utenti, Scadenze; nessun errore; non compare sulle pagine dei giocatori.
- **Simboli rotti "??"/"???"** (emoji perse in una vecchia conversione, c'erano già nel backup): sostituiti con testo in `admin-teams` (Elimina / Rimuovi / + Aggiungi), `admin-users` (Modifica / Elimina), `admin-cup`, `admin-deadline`, `index` (titoli).
- **`calendario-athletic.html`** (partite della squadra vera, per i giocatori) non era collegata da nessuna parte: aggiunta al menu ☰ come **"Partite Athletic"** (dopo Mini-gioco); la scritta fissa "Stagione 2024/25" ora legge la stagione della lega ("Stagione 2026/2027"). Cache: `mobile-menu.js?v=20260925b`, `admin-back.js?v=20260925b`.
- **Richiesta nuova dell'utente**: PDF per gli admin sui pannelli nuovi, **fuori dalla cartella del progetto** (non deve finire su Git).
- **Guida PDF per gli admin fatta** (anticipa D090, versione senza screenshot): `~/Claude/fanta-athletic-DOCUMENTI-ADMIN/Guida-admin-Fanta-Athletic-2026-27.pdf` (10 pagine) + sorgente modificabile `Guida-admin-sorgente.html` nella stessa cartella, **fuori dal progetto** (non va su Git). Contenuto: accesso al pannello, 6 blocchi, percorso stagione 2026/27, impostazioni, Partita live, Calcolo giornata, fazioni e bonus di fazione (le 4 regole da creare), mini-gioco, archivio/stagione nuova, cose da non fare e FAQ. PDF generato con Chrome "senza finestra" e profilo temporaneo (scelta dell'utente), processo chiuso subito dopo. Quando le schermate saranno definitive si può rifare con gli screenshot (D090).

## D099 — Velocità: service worker "prima il magazzino" per i file etichettati, niente più script avviati due volte (2026-09-25)
**Misurato** (file per pagina, pesi, doppioni, richieste reali al server): ogni pagina carica 25–38 file e ~550–900 KB, di cui ~515 KB sono Firebase. Il service worker (`sw.js`) faceva "prima la rete" per **tutti** i JS/CSS: a ogni cambio pagina il telefono richiedeva di nuovo ogni file, anche se identico.
- **Falso allarme verificato**: in `admin.html`, `admin-rules.html`, `lineup-summary.html` Firebase sembra caricato due volte, ma il secondo è un "piano B" che scatta solo se il primo fallisce (resto di D066): nessun peso in più.
- **Doppioni veri corretti**: `app-init.js` carica da solo `league-selector.js`, `mobile-header-fix.js`, `auth-guard.js`, ma diverse pagine (Home, Squadre, Classifiche, Notifiche…) li includevano anche direttamente → partivano due volte (letture doppie delle leghe dal database, doppi ascoltatori). Aggiunto in cima a ciascuno un controllo "se sono già partito, mi fermo". Verificato: ora 1 avvio per pagina, nessun errore (Home, Squadre, Classifiche, Notifiche, Formazioni, Partite Athletic).
- **`sw.js` riscritto** (vecchio in `archive/sw-pre-D099.js`, cache `fanta-athletic-v2026092501`): JS/CSS con etichetta `?v=` e librerie Firebase locali → **prima il magazzino** (la prima volta chiede al server, non alla cache del browser); HTML e file senza etichetta → prima la rete, con copia di riserva offline; quando arriva un'etichetta nuova la versione vecchia dello stesso file viene tolta. Precarica Firebase all'installazione. Toglie dalla lista file che non esistono più. Ignora le richieste verso altri domini (Firebase/Google).
- **Provato davvero** (in locale il service worker è spento apposta; provato da `http://[::1]:8912`, stesso computer, poi disattivato e ripulito): pagina Accesso, **11 richieste al server al primo caricamento → 1 al secondo** (solo la pagina). File con etichetta nuova: scaricato e copia vecchia tolta.
- Etichette aggiunte a `theme-preload.js` (46 pagine) e `firebase.js` (18); nuove etichette per i file toccati (`20260925c`).
- **Conseguenza importante (regola che diventa critica)**: ora un file condiviso modificato **senza cambiare l'etichetta `?v=`** resterebbe vecchio sui telefoni finché non cambia l'etichetta. Scritto in `CLAUDE.md`.
- **Non fatto (non serve più / muro portante)**: unire i file in pochi bundle e passare a Firebase "modulare" — col magazzino il numero di file conta molto meno. Da tenere per il restyling se servirà.
- **Scoperta per la pubblicazione**: nella cartella **non c'è `firebase.json`** (la configurazione dell'Hosting, serve per pubblicare): va chiesta all'amico/recuperata prima del deploy. Lì si potranno anche impostare intestazioni di cache più lunghe per i file etichettati.

## D100 — Scontri diretti integrati (regole dalla Stagione), generatore e numerazione corretti (2026-09-25)
**Deciso dall'utente**: integrare la logica completa degli scontri diretti anche senza le scelte finali degli admin; i valori restano provvisori e ben segnalati, così basterà cambiare i numeri nelle Impostazioni.

**Due errori trovati nel codice vecchio (mai emersi: in 2025/26 si giocava in classica):**
1. **Generatore del calendario sfide sbagliato** (`calendario.html`, `roundRobinN`): ruotava tutte le squadre invece di tenerne una ferma → con 18 squadre, nell'andata ognuno incontrava **solo 9 avversari, due volte**, e 8 mai (81 sfide diverse su 153). Verificato con una simulazione.
2. **Numerazione delle squadre incoerente**: il calendario numerava in ordine alfabetico, la classifica scontri in ordine di testo dell'id ("0","1","10"…), Calcolo giornata e Classifiche per numero di database → la stessa sfida poteva riferirsi a squadre diverse a seconda della pagina.

**Fatto (vecchie versioni in `archive/h2h-pre-D100.js`, `archive/calendario-pre-D100.html`):**
- `resources/h2h.js`: **generatore corretto** (metodo a rotazione: andata con tutti contro tutti una volta, ritorno a campi invertiti, dispari = un riposo a testa); **classifica sempre con i punti V/N/P attuali della Stagione** (cambiarli vale subito, anche per le giornate passate); conteggio tavolini; `recomputeAll` (rifà tutte le sfide già giocate dai punti salvati in `results/{G}/teams`); `loadStandings`. Verificato: 18 squadre = 153/153 sfide, nessun doppione, casa 8–9 a testa; 17 squadre = 17 riposi diversi; esiti (soglie, diretta, tavolino, entrambe mancanti = nessuno prende punti) e classifica con 3-1-0 e 2-1-0 corretti.
- **Numero squadra = id del documento ovunque**: `calendario.html` (mappa e generatore), `h2h-standings.html` (riscritta: niente più "18 squadre" fisse né 3/1), `classifiche.html` (già corretta).
- `calendario.html`: generatore nuovo; giornate proposte = quelle della Stagione o andata+ritorno (34 con 18 squadre); **non rigenera se ci sono già risultati**; se c'è già un calendario avvisa e lo sostituisce per intero (prima restavano giornate vecchie in più); nota per gli admin.
- `classifiche.html`: punti V/N/P dalla Stagione; scheda "Scontri" visibile **solo** con modalità scontri/entrambe; riga delle regole dinamica.
- `matchday.html`: tolta la chiamata al vecchio tavolino `applyForfeitPenalties` (3 a -10 fisso, numerazione diversa, e prima falliva sempre, D095): il tavolino lo fa `H2H.saveDay` con le regole della Stagione. La funzione vecchia resta nel file, non usata.
- `admin-stagione.html`: riquadro **"Valori provvisori, da decidere insieme"** negli scontri diretti; pulsante **"Ricalcola tutti gli scontri con le regole salvate"** (rifiuta con modalità classica, verificato).
- Cache: `h2h.js?v=20260925d`.
- **Verificato in lettura** (modalità classica, niente scritto sul database): Impostazioni, Calendario sfide (18 squadre, numeri giusti, 34 giornate proposte), Classifica scontri, Classifiche (scheda nascosta), Calcolo giornata: nessun errore.

**Da decidere con gli admin (restano in PUNTI_APERTI):** soglie punti→gol o "vince chi fa più punti", punti V/N/P, risultato a tavolino (oggi "3 a -10" come gol: entra nella differenza reti), e **cosa vuol dire "formazione mancante"**: oggi = nessun titolare (come per i punti della giornata); il vecchio codice dell'amico usava "meno di 5 titolari".
**Non provato sul database vero**: generazione del calendario, calcolo di una giornata con modalità scontri, ricalcolo. Si può fare con una prova e poi pulizia, oppure quando gli admin attivano la modalità.

## D101 — Backup riorganizzati, repository GitHub salvata, `firebase.json` ricreato, chiave admin esposta su GitHub (2026-09-25)
**Decisioni dell'utente**: scontri diretti, prova sul database vero rimandata a quando gli admin li attivano (opzione b); gli admin devono poter gestire **tutti** i parametri degli scontri dal pannello; prima volta autorizzato l'uso del Git del terminale sulla repository condivisa con Mocci; ZIP della repository nella cartella `~/Claude/fanta-athletic-backups/` e riorganizzazione dell'archivio; poi test completo prima di sostituire la repository.

**Scontri diretti — ultimo parametro al pannello**: nuovo campo in Impostazioni stagione "Formazione mancante se i titolari sono meno di…" (`h2h.minTitolari`, default 1 = come oggi). `h2h.js` decide "mancante" con questa regola, sia nel Calcolo giornata (riceve il numero di titolari) sia nel ricalcolo (lo legge da `results/{G}/teams.lineup`). Cache `h2h.js`/`season.js` `?v=20260925e`. Ora ogni parametro degli scontri è modificabile dagli admin senza passare da Iacopo.

**Backup** (`~/Claude/fanta-athletic-backups/`, indice `LEGGIMI.md`): `01-codice/` (copia originale 19/09 — tolta dalla cartella del progetto —, copia del mattino, ZIP del pomeriggio 256/256 file verificati senza dati personali, ZIP COMPLETO della repository con 3 rami e 118 commit verificato con `git fsck`, ZIP del ramo `main`), `02-database/`, `03-documenti-admin/`. Percorsi aggiornati in `CLAUDE.md`, `README.md`, `PUNTI_APERTI.md`.

**Repository** `https://github.com/mounba98/fanta-athletic` (Iacopo collaboratore, accesso diretto da terminale funzionante): rami `main` (01/12/2025, predefinito), `master` (06/11/2025), `feature/uniform-pitch-bench` (20/11/2025, 9 commit non in `main`). **`main` coincide esattamente con la copia di partenza del 19/09** (solo i nostri documenti in più): sostituendola non si perde nulla del ramo principale.

**`firebase.json` + `.firebaserc` ricreati** (Mocci: "va ricreato"): Hosting dalla cartella principale, con esclusione esplicita di `backups-firestore/` (dati personali), `archive/`, `docs/`, `scripts/`, `*.md`, script, file nascosti, `firestore.rules`; `sw.js` e HTML senza cache, immagini 7 giorni. Simulato: 187 file pubblicati, nessun dato personale né chiave. Il vecchio `firebase.json` (ramo feature) usava una cartella `public/` e mandava ogni indirizzo a `index.html`: struttura diversa da quella attuale. Recuperati come **riferimento storico, non collegati** (potrebbero differire dalla Console): `docs/firebase-storico/` (regole Storage, indici Firestore, vecchio firebase.json).

**⚠️ SICUREZZA — da sistemare subito (non dipende dal lancio)**: nel ramo `feature/uniform-pitch-bench` è committato `fanta-athletic-firebase-adminsdk.json`, dal nome la **chiave di servizio "admin" del progetto Firebase**. Il contenuto NON è stato aperto (lettura bloccata dal sistema di sicurezza, giustamente). Una chiave così scavalca tutte le regole di Firestore. Anche se la repository è privata: va **revocata/eliminata** in Google Cloud Console (IAM → Account di servizio → firebase-adminsdk → Chiavi) da chi ha i permessi sul progetto (Mocci), e il file tolto dalla repository. Cancellarlo dal ramo non basta (resta nella storia): conta la revoca. Anche lo ZIP COMPLETO nei backup la contiene → trattato come riservato.

**Per pubblicare servirà** la Firebase CLI, che richiede Node.js (non installato su questo Mac): da decidere al momento del deploy (installazione = download da internet, da autorizzare).

## D102 — Test completo prima della pubblicazione: superato, con 2 correzioni (2026-09-25)
**Metodo**: 57 pagine attive aperte una a una (cluster giochi escluso, in pausa), a gruppi di 6–8 in schede nuove, console letta parola per parola dopo ogni gruppo (errori, "ermission", "rror", "not defined", "fail", ❌, ⚠) e verificato che la console registrasse davvero; per ogni pagina controllati indirizzo finale e contenuto caricato. Pagine tecniche controllate PRIMA di aprirle (agiscono solo premendo pulsanti). Poi desktop (1280×800) e tema chiaro su pagine campione, tema dell'utente ripristinato.
**Esito**: nessun errore, nessun permesso negato. Solo avvisi attesi: "nessuna giornata calcolata" (stagione vuota) e Coppa disattivata in `calendario.html` (preesistente). `join-league`/`scegli-squadra`/`auth` rimandano alla Home per chi è già dentro: previsto.
**Corretti durante il test:**
1. **`standings.html` archiviata** (`archive/pagine-obsolete/`): mostrava la "Giornata 22" della prova live di stamattina perché **leggeva la memoria del browser, non il database** (sul database la G22 non esiste più). Ogni giocatore avrebbe visto dati diversi a seconda del telefono. Unici collegamenti: 2 notifiche push in `resources/notifications.js` → ora puntano a `classifiche.html` (`notifications.js?v=20260925`, etichetta aggiunta anche dove mancava). Controllato che nessun'altra pagina mostri dati dalla memoria del browser (`statistiche.html` ha codice simile ma mai eseguito).
2. **`live.html` non crea più la partita alla sola apertura** (punto aperto D095): la crea al primo dato segnato (`pushSheet`). Provato sul database vero: apertura → nessun documento; un tocco su un convocato → partita + foglio creati; poi tutto cancellato (anche l'avanzo `live/G1` creato alle 07:11 dal controllo post-azzeramento) e ripulita la copia locale del foglio. Database: 0 documenti live.
**Annotati per il restyling (preesistenti)**: `admin-calendario.html` su telefono resta a due colonne strette; `calendario.html` ha un grande ovale "Campionato H2H".
**Stato**: pronto per la pubblicazione, salvo conferme dell'utente (modalità del push, installazione strumenti per Firebase Hosting).

## D103 — App aggiornata su GitHub (2026-09-25)
- **Ok dell'utente** a GitHub e (dopo) a Firebase Hosting; prima GitHub.
- Ultimo ZIP del codice prima dell'invio: `~/Claude/fanta-athletic-backups/01-codice/codice-locale-2026-09-25-FINALE-prima-di-GitHub.zip` (262/262 file). Controllo prima del commit: nessuna chiave o segreto; email presenti solo come contatto pubblico in privacy/termini (già nella repository); tolta l'email di Iacopo da una riga del diario.
- **La cartella del progetto è ora una copia Git collegata a `https://github.com/mounba98/fanta-athletic` (ramo `main`)**: storia di Mocci conservata, nuovo commit sopra (`8ada412`, 188 file: 43 nuovi, 107 modificati, 38 spostati in `archive/`, nessuno perso). Verificato sul server: 262 file, nessun backup del database né chiave.
- **Da qui in poi**: modifiche e commit direttamente in questa cartella, ai "punti compiuti" con conferma dell'utente (regola generale). **Git ≠ sito online**: il push aggiorna solo il codice su GitHub; il sito che usano i giocatori cambia solo con la pubblicazione su Firebase Hosting (`firebase deploy --only hosting`), passo separato.
- Gli altri due rami della repository (`master`, `feature/uniform-pitch-bench`, quest'ultimo con la chiave admin esposta, D101) non sono stati toccati.

## D104 — Programma Firebase installato, anteprima online, due problemi della pubblicazione trovati e corretti (2026-09-25)
- **Strumento**: Homebrew non ha Node.js pronto per macOS 13 e stava compilando tutto da zero (ore) → fermato; usato il **programma Firebase ufficiale "file unico"** (`~/.local/bin/firebase`, da `github.com/firebase/firebase-tools`, niente Node). La versione 15.31.0 ha un difetto suo (`ERR_REQUIRE_ESM` alla pubblicazione) → usata la **15.30.2** (la 15.31.0 è rimasta in `~/.local/bin/firebase-15.31.0-difettosa`, eliminabile). Login fatto dall'utente (token salvato solo su questo Mac; si ritira con `firebase logout`). Gemini e statistiche: no.
- **Anteprima**: canale `anteprima` → `https://fanta-athletic--anteprima-gsi0yw8o.web.app` (scade il 02/10/2026), stesso database. Sito dei giocatori (`live`) NON toccato: ultima pubblicazione ancora 17/12/2025.
- **Problema 1 (sicurezza), corretto in pochi minuti**: la prima anteprima conteneva **`.git/`** (storia del codice, ~190 file) e **`.claude/`**: l'esclusione `**/.*` di `firebase.json` non copre le cartelle nascoste in cima. Verificato: `.git/config` senza credenziali, la storia pubblicata (ramo `main`) non contiene la chiave admin; esposizione solo sull'indirizzo di anteprima non condiviso. Aggiunte esclusioni esplicite (`.*`, `.git/**`, `.claude/**`, `**/.git/**`, `firebase-debug.log`); ripubblicato e riprovato indirizzo per indirizzo: `.git`, `.claude`, backup, documenti → 404. Spiega anche i "377 file" (ora 183).
- **Problema 2 (peso)**, su richiesta dell'utente "niente doppioni/appesantimenti": nessun file duplicato; ma `resources/tommy_guardu.png` (foto allenatore, 2880×2880, **8,7 MB**, più di metà del sito) mostrata in riquadri di ~50–130 px → ridotta a **400×400, 0,3 MB** (−96%); `logo_old.png` (2,2 MB, non usato) tolto dal sito; `firebase-cdn-loader.js` (non più usato da D066) in `archive/resources-orfani/`. Originali in `~/Claude/fanta-athletic-backups/04-immagini-originali/`. Peso del sito: da ~14,7 MB a ~4 MB. Restano piccoli file JSON del cluster giochi non collegati (pochi KB, lasciati).
- Da committare: queste correzioni + D103/D104 (in attesa di conferma dell'utente).

## D105 — Tema scuro di default, icona dell'app col logo nuovo, pubblicazione (2026-09-25)
**Utente**: prova dal telefono sull'anteprima ok ("come l'anteprima su Mac"; le prove vere le faranno gli admin) → committare e pubblicare. Due richieste: tema scuro di default ("fatto meglio"); icona della web app col logo nuovo Athletic 2018, sfondo nero fedele alla foto, centrata, senza tagliare nulla.
- **Tema**: default `dark` in `resources/theme-preload.js`, `resources/theme.js`, `download-app.html` (chi ha già scelto un tema lo tiene). La casella "Tema scuro" del Profilo ora mostra il tema davvero in uso (prima risultava spenta anche col tema scuro). Etichette `theme*.js?v=20260925b` ovunque.
- **Icone**: dall'immagine inviata (910×913) misurato lo sfondo (`#0c1318`) e il cerchio del logo; generate in `resources/app-icons/`: `icon-512.png`, `icon-192.png` (logo al 78%, margine sicuro per il ritaglio rotondo/"maskable" di Android), `apple-touch-icon.png` 180 px (84%), `favicon-32/48.png`; `/favicon.ico` (copia del 48). **Nessuna delle icone a cui puntavano le pagine esisteva** (`/favicon.svg`, `/favicon.ico`, `resources/favicon.ico`): tolti 90 collegamenti rotti e messo su tutte le 78 pagine lo stesso blocco (icona scheda, icona iPhone, manifest; prima il manifest era solo su 2 pagine). `manifest.json`: icone nuove (any + maskable), sfondo di avvio `#0c1318`. Service worker `fanta-athletic-v2026092502`.
- Verificato: utente senza preferenza → tema scuro; tutte le icone e il manifest rispondono; giro di pagine senza errori.

## D106 — SITO PUBBLICATO: stagione 2026/27 online (2026-09-25, 09:11)
- Commit `9e3b8fd` su GitHub (`mounba98/fanta-athletic`, `main`), poi `firebase deploy --only hosting` (solo sito: regole e database non toccati), messaggio "Stagione 2026/27 - commit 9e3b8fd". Sito live `https://fanta-athletic.web.app` rilasciato alle 09:11:58 (il precedente era del 17/12/2025).
- **Verificato sul sito vero**: pagine nuove, icone, manifest e service worker `v2026092502` rispondono; `.git`, `.claude`, backup del database, documenti, `CLAUDE.md`, `firebase.json` → 404.
- Canale di anteprima eliminato (niente doppioni).
- Chi ha il sito già aperto: il vecchio service worker prendeva HTML/JS/CSS dalla rete, quindi riceve subito il codice nuovo e il service worker si aggiorna da solo.
- **Da qui**: Git e sito si aggiornano con due passi separati, entrambi su conferma dell'utente: commit+push, poi `~/.local/bin/firebase deploy --only hosting --project fanta-athletic` (versione CLI 15.30.2; login già fatto, si ritira con `firebase logout`).

## D107 — "Vedo Tommy invece di Trendiu": era la squadra sbagliata, non l'allenatore (2026-09-25)
- **Segnalazione dell'utente**: da Curva gonfi vede l'allenatore Tommy, ma aveva Trendiu. Dubbio: stesso allenatore messo a tutti?
- **Verificato sul database**: NO. Le 18 squadre hanno gli stessi allenatori di prima dell'azzeramento (confronto col backup): Curva gonfi = T2 = Trendiu. La foto ridotta (D104) cambia solo il file dell'immagine di Tommy.
- **Causa vera (codice originale)**: in `formazioni.html` e `squadre.html`, per un **admin** la pagina non apriva la propria squadra ma la prima dell'elenco (squadra 0, Mocci e Canni, allenatore Tommy). Iacopo è admin → vedeva la squadra di Mocci. **Corretto**: anche gli admin partono dalla propria squadra (possono comunque cambiarla). Verificato: entrambe le pagine aprono Curva gonfi con la foto di Trendiu, nessun errore. **In locale, da committare e pubblicare** (su conferma).
- **Richiesta nuova (da fare)**: l'allenatore si sceglie all'asta, ogni stagione → al primo accesso della stagione ogni squadra deve **scegliere esplicitamente allenatore e tifoseria**, come per Curva/Piana. Scoperto: `squadre.html` permette già al proprietario di scegliere l'allenatore, ma **solo se la squadra non ne ha uno** — e l'azzeramento (D096) ha lasciato gli allenatori dell'anno scorso, quindi oggi non viene chiesto a nessuno. Da decidere con l'utente: azzerare gli allenatori per la 2026/27 (e aggiungerli all'azzeramento futuro), schermata obbligatoria al primo accesso (tipo `faction-gate.js`), chi può cambiarlo dopo (solo admin?).
- **Deciso dall'utente**: la scelta allenatore + tifoseria resta punto aperto per la prossima sessione (le 3 decisioni in `PUNTI_APERTI.md`); la correzione admin → propria squadra si committa e pubblica subito.

## D108 — Allenatore e tifoseria: restano alla squadra, scelta obbligatoria solo per chi non li ha (2026-09-25)
**Decisioni dell'utente** (sulle 3 domande di D107 + una sulla tifoseria):
1. **Gli allenatori NON si azzerano** a ogni stagione: restano alla squadra. Chi vuole cambiare lo chiede all'asta e lo cambiano gli admin.
2. **Tifoseria (Curva/Piana): idem** — resta alla squadra; una volta l'anno, all'asta, si può chiedere agli admin di cambiarla.
3. **Scelta dell'allenatore obbligatoria, finestra non chiudibile come Curva/Piana** — compare solo se la squadra non ha ancora un allenatore (oggi tutte e 18 ce l'hanno: servirà per squadre nuove).
4. **Dopo la scelta, lo cambiano solo gli admin.**
**Prossimo passo**: passo "allenatore" nella finestra di `resources/faction.js` + regola Firestore che permette a un membro della squadra di impostare l'allenatore UNA volta, solo se manca (da pubblicare in Console dall'utente).
**Fatto (in locale):**
- `resources/faction.js` (vecchia versione in `archive/faction-pre-D108.js`): nuovo passo **"Chi è il vostro allenatore?"** nella stessa finestra non chiudibile di tifoseria e nome, **solo se la squadra dell'utente non ha un allenatore**. Elenco = `resources/coaches.json` + allenatori della lega (Tommy, Trendiu con foto; Mario con l'iniziale). Conferma → `teams/{n}.coach_ids = [id]`. Se il salvataggio è rifiutato si avvisa ("avvisa un admin") e si lascia entrare: nessuno resta bloccato fuori. Testi della tifoseria aggiornati: non più "definitiva", ma "resta alla squadra; per cambiarla, una volta l'anno all'asta, chiedi agli admin". Cache `faction.js?v=20260925f` (14 pagine).
- `firestore.rules`: (a) un membro della squadra può impostare l'allenatore **una volta**, solo se manca, solo quel campo, un solo allenatore; (b) nuova `coachLocked()`: il **proprietario** non può più cambiare un allenatore già scelto (prima poteva, perché può modificare il documento squadra) → lo cambiano solo gli admin. **Da pubblicare in Console** (utente).
- Provato senza scrivere sul database (salvataggio intercettato): finestra con foto, conferma, salvataggio di T2, chiusura; salvataggio rifiutato → messaggio + "Continua"; squadra vera con allenatore → nessuna finestra.
- **Richiesta dell'utente**: se il salvataggio dell'allenatore fallisce, all'avvio successivo la scelta va riproposta. **Già così, verificato** (simulazione, nessuna scrittura vera): rifiuto → si entra → alla riapertura la finestra ricompare (sul database non c'è nulla) → salvataggio riuscito → alle aperture successive non chiede più. Nella stessa sessione non si ripropone a ogni pagina (il controllo è ricordato in `sessionStorage`, che si svuota alla chiusura dell'app).
- **Regole pubblicate dall'utente** (25/09/2026 sera). Verificato: 10 letture del database ok (lega, squadre, giocatori, regole, stagione, archivio verificato, utenti, admin, live, calendario) e 6 pagine (Home, Squadre, Formazioni, Squadre admin, Fazioni, Classifiche) senza nuovi permessi negati.

## D109 — Ritocchi grafici + decisione: nuova Home "centro di controllo" e Archivio Athletic (2026-09-25)
- **Classifiche**: le 4 schede ora occupano tutto lo spazio in parti uguali, e la scheda attiva è di nuovo evidenziata in rosso nel tema scuro (la regola generale di `sheet.css` la spegneva, D084).
- **Home**: le card "La mia squadra" e "Curva vs Piana" ora hanno stesso stile (margini 18 px, angoli, ombra) e colori nello stesso verso (rosso a sinistra, blu a destra); "VS" esattamente al centro (`contest-reminder.js?v=20260925g`).
- **Decisione dell'utente ("l'ultima modifica sostanziale")**: nuova Home in 3 fasce, secondo la bozza approvata — (1) **Adesso**: prossima partita Athletic, stato formazione con scadenza, mini-gioco; cambia col momento (punti provvisori, banner asta a ottobre); (2) **Il mio fanta**: la mia squadra (allenatore, tifoseria, posizione, ultima giornata), accessi Classifica/Squadre/Statistiche, Bacheca con ultimo messaggio; (3) **Athletic 2018**: ultima partita e marcatori, accessi Partite/Archivio/Albo d'oro/Store; + fascia **solo admin** (Partita live, Calcolo, Pannello). I 9 "biglietti" in fondo spariscono (Profilo nel menu, Asta/Giornate solo quando/a chi servono). **Archivio Athletic**: nuova pagina con statistiche dei giocatori veri (gol, assist, presenze, cartellini, MVP…) stagione per stagione, dai dati che gli admin segnano già; 2025/26 dall'archivio.
**Fatto (in locale):**
- **`resources/athletic-stats.js`**: motore delle statistiche dei giocatori veri, condiviso da Home e Archivio. Riconosce le regole dal **nome** (gol segnato/panchina, assist, autogol, ammonizioni, espulsioni, MVP, convocazione, porta inviolata, parate, rigori, gol subiti); tutte le altre voci del giocatore diventano **Curiosità**. Verificato sui dati veri 2025/26 (archivio): 21 giornate, 32 gol, 17 assist, 21 gialli, 4 rossi, 14 MVP; capocannoniere Moreno Fantechi "momo" 9. (Il backup pre-azzeramento dava 33 gol: il 33° era la prova live di D095, giustamente non archiviata.)
- **`archivio-athletic.html`** (nuova, nel menu ☰ "Archivio Athletic"): stagioni (in corso + archiviate + "Tutte le stagioni"), riquadro squadra, classifiche Marcatori/Assist/Presenze/MVP/Cartellini/Portieri, tutta la rosa ordinabile, Curiosità, partite con risultato; **scheda giocatore** con la storia stagione per stagione. Il bilancio V-N-P compare solo se i risultati inseriti coprono almeno metà delle giornate (2025/26: 1 partita su 21 con risultato → nascosto, per non dire cose false).
- **Nuova Home** (`index.html` + `resources/home-dashboard.js`, vecchia versione in `archive/index-pre-D109.html`): banner (asta aperta / stagione in preparazione), **Adesso** (prossima partita dal Calendario Athletic con casa/trasferta e "tra N giorni"; Formazione della prossima giornata: consegnata / da consegnare entro la scadenza / scadenza passata; Mini-gioco: voto aperto / votato / in arrivo), **Il mio fanta** (squadra con foto e nome dell'allenatore, tifoseria, posizione e punti dalle giornate calcolate; Classifica/Squadre/Statistiche; Bacheca con l'ultimo messaggio — anche dalla posizione vecchia dei post, come fa `bacheca.html`), **Athletic 2018** (ultima partita, marcatori della stagione o dell'ultima archiviata; Partite/Archivio/Albo d'oro/Store), **Solo admin** (Partita live, Calcolo, Pannello). Tolti dalla Home i 9 "biglietti", i vecchi blocchi e i loro script (`matchday-summary.js`, `classifiche-preview.js`, `mobile-dashboard.js`, `contest-reminder.js` non più caricati in Home).
- Verificato: nessun errore; dati veri (Curva gonfi, Trendiu, Curva Morello, stagione non iniziata, messaggio di Bacheca, marcatori 2025/26); desktop centrato; fascia "Adesso" attiva **simulata** senza scrivere sul database (partita tra 2 giorni, formazione da consegnare entro la scadenza, voto in arrivo, ultima partita con risultato).
- **Richiesta aggiuntiva dell'utente (da fare subito dopo)**: spostare il selettore di lega nell'intestazione, tra titolo e badge della stagione.

## D110 — Selettore di lega nell'intestazione (2026-09-25)
**Richiesta dell'utente**: spostare il menu a tendina della lega tra il titolo della pagina e il badge "2026/2027", pensando al multilega futuro.
- `resources/league-selector.js` (vecchio in `archive/league-selector-pre-D110.js`): su telefono il contenitore del selettore viene inserito nell'intestazione subito prima di `#currentLeagueBadge` (creato da `navbar.js`: si riprova per qualche secondo, altrimenti resta sotto come prima). Aspetto: pillola compatta come il badge della stagione (🏆 + freccia; il nome della lega compare da 421 px in su). La tendina, quando il selettore è nell'intestazione, viene spostata nella pagina e si apre a tutta larghezza sotto l'intestazione (l'intestazione "intrappola" gli elementi fissi); prima di ricrearla si toglie quella vecchia (niente doppioni). Su computer invariato (nella barra in alto). Cache `league-selector.js?v=20260925f`, `app-init.js?v=20260925f`.
- Verificato su telefono: Home, Classifiche, Formazioni, Squadre admin, Notifiche → "titolo · 🏆▾ · 2026/2027" su una riga, niente sconfinamenti (titoli lunghi accorciati coi puntini); tendina aperta a tutta larghezza con la lega e "Crea nuova / Unisciti / Invita amici", si chiude toccando fuori; nessun errore. Computer: selettore nella barra come prima.
- **D110b — correzione su richiesta dell'utente** ("non mi piace: costringe il nome delle sezioni a non essere visibile"): la pillola "🏆 ▾" diventa **solo la coppa in un cerchietto da 26 px** (bordo oro come il badge stagione), senza nome né freccia; il nome della lega resta nella tendina. Misurato su telefono (375 px) pagina per pagina: i titoli corti restano interi con margine; erano tagliati — **anche prima del selettore** — i titoli troppo lunghi: accorciati **solo nell'intestazione** (non il titolo della scheda del browser) con i nomi usati nel menu/pannello: Scontri diretti, Squadre e rose, Scadenze, Utenti, Lega, Foto giocatori, Unisciti, Calendario, Bonus e malus, Foto profilo (prima "?? Foto Profilo"), Store, Debug, Coppa, Invita. Rimisurati: tutti interi. Cache `league-selector.js?v=20260925g`, `app-init.js?v=20260925g`.

## D111 — Terminologia per il multilega: Lega → Stagione → Competizioni → Giornate (2026-09-25)
**Ragionamento dell'utente**: nel fantacalcio tradizionale c'è la LEGA (per noi Fanta Athletic) e dentro le COMPETIZIONI; noi finora abbiamo chiamato "Stagione" l'unica competizione, supponendo una sola competizione per lega. Chiede di definirlo bene per il multilega futuro e di tenerlo in memoria.
**Definizione concordata** (documento `docs/GLOSSARIO_LEGHE.md`): il ragionamento è coerente, con una precisazione — la **Stagione non è una competizione** ma il periodo (2026/27) in cui si giocano le competizioni; gerarchia **Lega → Stagione → Competizioni (Campionato, Scontri diretti, Coppa, Curva vs Piana) → Giornate**. Corrisponde a come il codice è già organizzato (`leagues/{id}`, `config/season` + `archive/`, `results`/`h2h_*`/`cup*`/`contest_*`, `days/{G}`). Nel glossario anche le regole per il multilega (tutto sotto `leagues/{id}`, dati di stagione con chiave o azzerati/archiviati) e i **debiti** da saldare prima di attivarlo: raccolte globali `athletic_calendar`, `contest_*`, `posts` (radice), `auction/current`, `admins` globali.
- Tendina del selettore di lega: "🏆 Campionato • 2026/2027" → **"Stagione 2026/2027"** (il "Campionato" è una competizione, non il tipo di lega). `league-selector.js?v=20260925h`.
- Salvato anche nella memoria di lungo periodo di Claude (memoria "fanta-athletic-terminologia-leghe").
