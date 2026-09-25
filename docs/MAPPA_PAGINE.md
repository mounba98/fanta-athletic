Allineato a: D106

# Mappa delle pagine — a cosa serve ogni file

Indice rapido dei 79 file `.html` ancora attivi nella cartella principale,
così non serve aprirli uno per uno per capire cosa fanno. Aggiornare
questa mappa quando si aggiunge, rinomina o archivia una pagina.

I 29 file vecchi/abbandonati non sono più qui: sono in `archive/` (vedi
`docs/DECISION_LOG.md` D008, D019, D034 per l'elenco completo e il
perché).

**Nota sul foglio di stile (D050)**: quasi tutte le pagine usano
`resources/sheet.css` (che importa i colori da
`resources/theme-tokens.css`). Fanno eccezione `contest.html`,
`contest-leaderboard.html` e `calendario-athletic.html`, che hanno
un'impaginazione propria e caricano **solo** `theme-tokens.css`: se si
collega loro il foglio completo il layout si scompone, perché usano
nomi di classe generici che vanno in conflitto.

## App — pagine per l'utente che gioca

| File | A cosa serve |
|---|---|
| `index.html` | Home page, dashboard con la propria squadra e ultimi risultati |
| `auth.html` | Login e registrazione |
| `bacheca.html` | Bacheca/news della lega |
| `squadre.html` | Gestione della propria squadra |
| `formazioni.html` | Composizione della formazione da schierare |
| `lineup-summary.html` | Riepilogo dettagliato di una formazione schierata |
| `classifiche.html` | Classifica generale e per giornata |
| `matchday.html` | Inserimento/calcolo risultati di una giornata (uso principalmente admin, ma non protetta da login) |
| `statistiche.html` | Statistiche giocatori, allenatori, curve di rendimento |
| ~~`standings.html`~~ | Archiviata (D102): leggeva la memoria del browser, non il database |
| `h2h-standings.html` | Classifica scontri diretti |
| `profile.html` | Profilo utente |
| `user-profile-upload.html` | Upload foto profilo — verificare se sovrapposta a `profile.html` |
| `store.html` | Negozio ufficiale (prodotti/gadget) |
| `asta.html` | Asta giocatori |
| `contest.html` | Mini-gioco Curva vs Piana: voto 1-X-2 sulla partita Athletic (D069/D071) |
| `contest-leaderboard.html` | Classifica del contest pronostici |
| `calendario.html` | Calendario degli scontri di fantacalcio |
| `calendario-athletic.html` | Calendario reale della squadra Athletic Brescia (non è un doppione del precedente) |
| `scegli-squadra.html` | Selezione/creazione della propria squadra |
| `join-league.html` | Iscrizione a una lega |
| `join-team.html` | Iscrizione a una squadra |
| `league-invite.html` | Pagina di invito a una lega |
| `notifications.html` | Centro notifiche |
| `recap-giornata.html` | Riepilogo di una giornata conclusa |
| `giornata-calcolata-popup.html` | Popup "giornata calcolata" (aperto dinamicamente da altre pagine) |
| `results-h2h-modal.html` | Finestra con risultato di uno scontro diretto (aperta dinamicamente) |
| `download-app.html` | Pagina promozionale per scaricare/installare l'app (probabile uso da link esterni/social) |

## Pagine legali / infrastruttura

| File | A cosa serve |
|---|---|
| `privacy.html` | Informativa privacy |
| `terms.html` | Termini di servizio |
| `cookie-policy.html` | Informativa cookie |
| `adsense-verification.html` | Verifica proprietà sito per Google — non toccare anche se non linkata internamente |
| `404.html` | Pagina "indirizzo sbagliato". Riscritta il 2026-09-20 (D051): prima era quella di default di Firebase, in inglese e senza modo di tornare all'app |

## Admin — pannello di gestione della lega

| File | A cosa serve |
|---|---|
| `admin.html` | Hub centrale admin, punto di ingresso a tutte le altre |
| `admin-setup.html` | Impostazioni generali della lega |
| `admin-players.html` | Gestione giocatori |
| `admin-teams.html` | Gestione squadre (collegata al menu dal 2026-09-20, D034 — sostituisce `admin-squadre.html`, archiviata perché lavorava su dati finti) |
| `admin-rules.html` | Gestione regole bonus/malus (con campo "Assegnazione": globale / squadra / presenza / fazione, D080) |
| `live.html` | Partita live: pannello a tasti per segnare bonus/malus durante la partita, doppio controllo tra admin, revisione 48h (D093) |
| `admin-stagione.html` | Parametri della stagione, archiviazione, apertura stagione nuova (D087) |
| `archivio.html` | Archivio stagioni / albo d'oro, per tutti (D087) |
| `admin-contest.html` | Mini-gioco Curva vs Piana: calcolo punti, classifica, testo WhatsApp (D069) |
| `admin-fazioni.html` | Fazione delle squadre e nomi reali dei giocatori (D073) |
| `admin-calendario.html` | Gestione calendario reale Athletic |
| `admin-deadline.html` | Gestione scadenze/deadline formazioni |
| `admin-cards-manager.html` | Gestione card mostrate in home |
| `admin-store.html` | Gestione prodotti dello store |
| `admin-debug.html` | Pannello di debug/monitoraggio permanente |
| `admin-leghe.html` | Crea/gestisci una lega — **attiva** nonostante il nome sembri superato, vedi D005 |
| `admin-cup.html` | Gestione Coppa — funzione ancora in sviluppo (stub) |
| `admin-users.html` | Gestione utenti registrati (41 utenti reali) — non nel menu admin attuale ma verificata funzionante e collegata ai dati veri (D032) |
| `admin-teams.html` | Versione alternativa di gestione squadre, ancora linkata da `verifica-squadre-utenti.html` |

## Strumenti admin dal nome "temporaneo" ma tuttora in uso

Nome da "prova/fix", ma sono nel menu di `admin.html` — **non sono da buttare**:

| File | A cosa serve |
|---|---|
| `cache-buster.html` | Genera le istruzioni per forzare l'aggiornamento cache dopo un deploy |
| `clear-sw.html` | Disattiva il Service Worker per utenti bloccati su versioni vecchie |
| `force-update.html` | Forza l'aggiornamento dell'app lato utente |
| `sblocca-formazioni-temp.html` | Sblocco manuale formazioni oltre la scadenza |
| `test-foto-live.html` | Verifica che le foto giocatori si vedano correttamente in produzione |
| `upload-foto-giocatori.html` | Upload foto giocatori/allenatori |
| `upload-rules-to-firestore.html` | Sincronizza le regole verso Firestore |
| `verifica-squadre-utenti.html` | Controllo di integrità squadre/utenti |

## Cluster giochi — in sospeso (D004, non toccare)

Mini-gioco di carte collezionabili, funzionante ma scollegato dal menu
principale dell'app. Deciso di lasciarlo così com'è finché non si integra
con nuove funzionalità.

| File | Nota |
|---|---|
| `games-hub.html` | Hub del cluster (alcuni link interni puntano a pagine mai create) |
| `wirc-snap-marvel.html` | Versione attuale del gioco "snap" |
| `wirc-battle-v2.html` | Versione attuale di "battle" |
| `wirc-royale.html` | Modalità royale |
| `wirc-card-gallery.html` | Galleria carte |
| `osm-manager-v2.html` | Gioco manageriale (versione attuale) |
| `athletic-manager.html` | Gioco manageriale Athletic |
| `athletic-cards-battle.html` | Battaglia carte Athletic |
| `wirc-card-maker.html`, `wirc-batch-card-maker.html` | Strumenti per creare carte (uso manuale/offline) |
| `clash-cards.html` | Prototipo isolato |
| `osm-manager.html`, `wirc-battle.html`, `wirc-snap.html`, `wirc-snap-v2.html`, `wirc-snap-v2.5.html`, `wirc-snap-v3.html`, `wirc-snap-v5.html`, `wirc-snap-full.html`, `wirc-snap-mobile.html` | Versioni precedenti, superate ma lasciate ferme insieme al resto del cluster |
