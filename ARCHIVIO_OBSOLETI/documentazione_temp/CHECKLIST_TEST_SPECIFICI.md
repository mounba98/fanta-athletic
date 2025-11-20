# ✅ CHECKLIST TEST SPECIFICI - Fanta Athletic

**Data**: 27 Ottobre 2025  
**Istruzioni**: Esegui un test alla volta, segna ✅ o ❌ e fornisci feedback specifico.

---

## 🔐 TEST 1: LOGIN E AUTENTICAZIONE

**Cosa testare:**
1. Vai su https://fanta-athletic.web.app
2. Clicca su "Accedi" o "Login"
3. Prova login con email/password (se hai un account)
4. Prova login con Google (se disponibile)
5. Verifica che dopo il login vieni reindirizzato alla home
6. Verifica che il tuo nome/username appare in navbar

**Cosa verificare:**
- [v ] Login funziona senza errori
- [ v] Dopo login vedi la home correttamente
- [ x] Il tuo nome/username appare in navbar
- [ x] Nessun errore in console (F12 → Console)

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Se non funziona: descrivi cosa succede e copia eventuali errori dalla console

---

## 👤 TEST 2: USERNAME E PROFILO

**Cosa testare:**
1. Se non hai username o hai "Utente" come username, dovrebbe apparire un modal
2. Prova a inserire un username (es: "testuser123")
3. Se username già esistente, dovrebbe dare errore
4. Vai su "Profilo" (icona utente in navbar)
5. Verifica che vedi i tuoi dati
6. Prova a caricare una foto profilo (se possibile)

**Cosa verificare:**
- [ ?] Modal username appare se necessario
- [ ?] Username viene salvato correttamente
- [ ?] Errore se username già esistente
- [ x] Pagina profilo mostra i dati corretti
- [x ] Upload foto profilo funziona (se testato)

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Se username già esistente: funziona il controllo?
- Se non funziona: descrivi cosa succede

---

## 🏠 TEST 3: HOME E DASHBOARD

**Cosa testare:**
1. Dalla home, verifica che vedi:
   - Widget carousel (se presente)
   - "Ultimi 3 risultati" (su mobile dovrebbe mostrare G1, G2, G3)
   - "Ultima giornata calcolata"
   - Podio squadre (top 3)
   - Top giocatori settimana
2. Clicca su "Vedi tutte le classifiche"
3. Verifica che i dati sono corretti

**Cosa verificare:**
- [v ] Home carica senza errori (senza dover fare F5)
- [v ] "Ultimi 3 risultati" mostra G1/G2/G3 (mobile) o "Giornata X" (desktop)
- [ v] Dati visualizzati sono corretti
- [v ] Link a classifiche funziona
- [? ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Su mobile: vedi G1/G2/G3 o "Giornata X"?
- I dati sono corretti?
- Se non funziona: descrivi cosa manca o è sbagliato

---

## ⚽ TEST 4: FORMAZIONI - CARICAMENTO E VISUALIZZAZIONE

**Cosa testare:**
1. Vai su "Formazioni"
2. **Su mobile**: verifica che NON vedi selettori giornata/squadra (dovrebbe mostrare direttamente la tua squadra)
3. **Su desktop**: verifica che vedi i selettori
4. Verifica che vedi il campo verde con i giocatori
5. Verifica che vedi la panchina
6. Verifica che le foto dei giocatori sono visibili
7. Verifica che la foto dell'allenatore è visibile e allineata correttamente

**Cosa verificare:**
- [v ] Pagina formazioni carica
- [ ] Su mobile: NO selettori, vedi direttamente la tua squadra
- [ v] Campo verde visibile con giocatori
- [ v] Panchina visibile
- [ x] Foto giocatori: tutte visibili (no immagini rotte)
- [ v] Foto allenatore: visibile e allineata (non troppo a destra)
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Su mobile: vedi selettori? (dovresti NON vederli)
- Foto giocatori: tutte visibili? Qualche foto mancante?
- Foto allenatore: allineata correttamente o troppo a destra?
- Se non funziona: descrivi cosa manca o è sbagliato

---

## ⚽ TEST 5: FORMAZIONI - DRAG & DROP E SALVATAGGIO

**Cosa testare:**
1. Nella pagina formazioni, prova a trascinare un giocatore dalla panchina al campo
2. Prova a trascinare un giocatore dal campo alla panchina
3. Prova a cambiare posizione di un giocatore sul campo
4. Seleziona un capitano (clicca su un giocatore e seleziona "Capitano")
5. Clicca su "Salva formazione"
6. Ricarica la pagina (F5)
7. Verifica che la formazione salvata è ancora presente

**Cosa verificare:**
- [ v] Drag & drop funziona (giocatori si muovono)
- [ v] Capitano può essere selezionato
- [ v] Salvataggio funziona senza errori
- [ v] Dopo ricaricamento, formazione è ancora salvata
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Drag & drop: funziona su mobile? (potrebbe essere difficile)
- Salvataggio: funziona? Vedi messaggio di conferma?
- Dopo ricaricamento: formazione salvata?
- Se non funziona: descrivi cosa non va

---

## 📊 TEST 6: MATCHDAY - CARICAMENTO E VISUALIZZAZIONE

**Cosa testare:**
1. Vai su "Giornate" o "Matchday"
2. Verifica che vedi la lista dei giocatori (Portieri, Difensori, Centrocampisti, Attaccanti)
3. Verifica che vedi la sezione Allenatori
4. Verifica che vedi la sezione Curva
5. **Su desktop**: verifica layout 2 colonne (lista giocatori a sinistra, dettaglio a destra)
6. **Su mobile**: verifica che la lista è in accordion

**Cosa verificare:**
- [ v] Pagina matchday carica
- [ v] Lista giocatori visibile (divisa per ruolo)
- [ v] Sezione Allenatori visibile
- [ v] Sezione Curva visibile
- [ v] Desktop: layout 2 colonne corretto
- [ ?] Mobile: accordion funziona
- [v ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Desktop: vedi layout 2 colonne?
- Mobile: accordion funziona?
- Se non funziona: descrivi cosa manca o è sbagliato

---

## 📊 TEST 7: MATCHDAY - INSERIMENTO VOTI E BONUS/MALUS

**Cosa testare:**
1. Nella pagina matchday, clicca su un giocatore
2. Inserisci un voto (es: 6.5)
3. Prova ad attivare un bonus (es: "Gol", "Assist")
   - **IMPORTANTE**: prova a cliccare direttamente sulla riga del bonus (non solo sulla checkbox)
4. Prova ad attivare un malus (es: "Ammonizione")
5. Prova a usare i counter (+/-) per i bonus/malus numerici
6. Verifica che il punteggio parziale si aggiorna in tempo reale

**Cosa verificare:**
- [ v] Clic su giocatore apre il pannello dettaglio
- [ v] Inserimento voto funziona
- [v ] Click su riga bonus/malus attiva la checkbox (non serve doppio click)
- [v ] Counter +/- funzionano
- [? ] Punteggio parziale si aggiorna in tempo reale
- [v ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Click su riga: attiva la checkbox con un solo click?
- Counter: funzionano correttamente?
- Punteggio parziale: si aggiorna subito?
- Se non funziona: descrivi cosa non va

---

## 📊 TEST 8: MATCHDAY - CONVOCATI

**Cosa testare:**
1. Nella pagina matchday, cerca il pulsante "Giocatori convocati" (dovrebbe essere nella sezione giocatori)
2. Clicca sul pulsante
3. Verifica che si apre un modal con la lista di tutti i giocatori
4. Verifica che i nomi sono mostrati come "Cognome, Nome" (non nickname prima)
5. Seleziona alcuni giocatori (es: 3-4)
6. Chiudi il modal
7. Verifica che i giocatori selezionati hanno il badge "Convocato" o "+1" nel loro punteggio
8. Verifica che il totale giocatori include il bonus +1 per ogni convocato

**Cosa verificare:**
- [v ] Pulsante "Giocatori convocati" è visibile e funziona
- [v ] Modal si apre correttamente
- [v ] Nomi mostrati come "Cognome, Nome" (non nickname prima)
- [v ] Selezione multipla funziona
- [v ] Badge "Convocato" o "+1" appare sui giocatori selezionati
- [ v] Totale giocatori include bonus +1 per convocati
- [v ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Pulsante: visibile e funziona?
- Modal: si apre? Nomi corretti?
- Badge: appare sui giocatori selezionati?
- Totale: include bonus +1?
- Se non funziona: descrivi cosa non va

---

## 📊 TEST 9: MATCHDAY - FILTRI

**Cosa testare:**
1. Nella pagina matchday, cerca i filtri nella sezione giocatori:
   - "Tutti", "Convocati", "Non Convocati"
   - "Tutti", "Da Campo", "Da Curva"
2. Clicca su "Convocati"
3. Verifica che vedi solo i giocatori convocati
4. Clicca su "Non Convocati"
5. Verifica che vedi solo i giocatori non convocati
6. Clicca su "Da Curva"
7. Verifica che vedi solo i bonus/malus da curva
8. Clicca su "Da Campo"
9. Verifica che vedi solo i bonus/malus da campo

**Cosa verificare:**
- [v ] Filtri sono visibili
- [ v] Filtro "Convocati" mostra solo convocati
- [ v] Filtro "Non Convocati" mostra solo non convocati
- [v ] Filtro "Da Curva" mostra solo bonus/malus curva
- [v ] Filtro "Da Campo" mostra solo bonus/malus campo
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Filtri: sono visibili?
- Filtri: funzionano correttamente?
- Se non funziona: descrivi cosa non va

---

## 📊 TEST 10: MATCHDAY - STICKY HEADER MOBILE

**Cosa testare:**
1. **IMPORTANTE**: questo test va fatto su mobile (o DevTools mobile mode)
2. Nella pagina matchday, clicca su un giocatore
3. Scorri la pagina verso il basso fino a far scomparire il nome del giocatore dallo schermo
4. Verifica che appare una barra fissa in alto con il nome del giocatore e un pulsante per chiudere
5. Scorri di nuovo verso l'alto fino a far riapparire il nome del giocatore
6. Verifica che la barra fissa scompare
7. Clicca su un altro giocatore
8. Verifica che la barra fissa si aggiorna con il nuovo giocatore

**Cosa verificare:**
- [ ] Barra fissa appare quando nome esce dallo schermo
- [ ] Barra fissa scompare quando nome riappare
- [ ] Barra fissa si aggiorna quando selezioni altro giocatore
- [ ] Pulsante chiudi funziona
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Barra fissa: appare quando nome esce dallo schermo?
- Barra fissa: scompare quando nome riappare?
- Se non funziona: descrivi cosa non va

---

## 📊 TEST 11: MATCHDAY - SALVATAGGIO

**Cosa testare:**
1. Nella pagina matchday, inserisci alcuni voti e bonus/malus
2. Clicca su "Salva Live" (se presente)
3. Verifica che non ci sono errori
4. Clicca su "Salva Giornata"
5. Verifica che appare un messaggio di conferma
6. Verifica che non ci sono errori in console
7. Ricarica la pagina (F5)
8. Verifica che i dati salvati sono ancora presenti

**Cosa verificare:**
- [ ] "Salva Live" funziona senza errori
- [ ] "Salva Giornata" funziona senza errori
- [ ] Messaggio di conferma appare
- [ ] Dati salvati persistono dopo ricaricamento
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Salvataggio: funziona? Vedi errori?
- Dopo ricaricamento: dati ancora presenti?
- Se non funziona: descrivi errore o cosa manca

---

## 📊 TEST 12: MATCHDAY - RESET

**Cosa testare:**
1. Nella pagina matchday, inserisci alcuni voti e bonus/malus per un giocatore
2. Clicca su "Reset Giocatore" (dovrebbe essere nella sezione riepilogo, sotto "Salva Giornata" su desktop)
3. Verifica che i voti e bonus/malus del giocatore vengono resettati
4. Inserisci alcuni voti per un allenatore
5. Clicca su "Reset Allenatore"
6. Verifica che i voti dell'allenatore vengono resettati
7. Inserisci alcuni voti per la curva
8. Clicca su "Reset Curva"
9. Verifica che i voti della curva vengono resettati

**Cosa verificare:**
- [ v] "Reset Giocatore" funziona
- [ v] "Reset Allenatore" funziona
- [ v] "Reset Curva" funziona
- [ v] Dati vengono effettivamente resettati
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Reset: funzionano tutti e tre?
- Dati: vengono effettivamente resettati?
- Se non funziona: descrivi cosa non va

---

## 📈 TEST 13: DETTAGLIO GIORNATA (LINEUP SUMMARY) - CARICAMENTO

**Cosa testare:**
1. Vai su "Dettaglio Giornata" o "Lineup Summary"
2. Verifica che vedi i selettori giornata e squadra (dovrebbero essere chiusi di default, come una card collassabile)
3. Apri i selettori e seleziona una giornata e una squadra
4. Verifica che la pagina carica i dati
5. Verifica che vedi il campo verde con i giocatori
6. Verifica che vedi la panchina
7. Verifica che le foto dei giocatori sono visibili

**Cosa verificare:**
- [ v] Pagina carica
- [x ] Selettori sono chiusi di default (card collassabile)
- [x ] Selettori si aprono correttamente
- [ v] Dati caricano dopo selezione
- [ v] Campo verde visibile con giocatori
- [x ] Panchina visibile
- [ x] Foto giocatori: tutte visibili (no immagini rotte)
- [ ?] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Selettori: chiusi di default?
- Foto giocatori: tutte visibili? Qualche foto mancante?
- Se non funziona: descrivi cosa manca o è sbagliato

---

## 📈 TEST 14: DETTAGLIO GIORNATA - BADGE CONVOCATI E PUNTEGGI

**Cosa testare:**
1. Nella pagina dettaglio giornata, seleziona una giornata e squadra dove ci sono giocatori convocati
2. Verifica che i giocatori convocati hanno un badge "Convocato +1" o simile
3. Verifica che il punteggio del giocatore include il bonus +1
4. Verifica che il "Totale Giocatori" nel riepilogo include i bonus +1 per i convocati
5. Verifica che il breakdown bonus/malus mostra correttamente tutti i punti

**Cosa verificare:**
- [ x] Badge "Convocato +1" appare sui giocatori convocati
- [v ] Punteggio giocatore include bonus +1
- [ v] Totale Giocatori include bonus +1 per convocati
- [ v] Breakdown bonus/malus è corretto
- [ ?] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Badge: appare sui giocatori convocati?
- Punteggi: includono bonus +1?
- Totale: include bonus +1?
- Se non funziona: descrivi cosa non va

---

## 🏆 TEST 15: CLASSIFICHE - VISUALIZZAZIONE

**Cosa testare:**
1. Vai su "Classifiche"
2. Verifica che vedi la "Classifica Generale"
3. Verifica che vedi la "Classifica per Giornata"
4. Verifica che vedi il "Dettaglio per Giornata"
5. Se la lega ha H2H abilitato, verifica che vedi "Scontri Diretti"
6. Se la lega NON ha H2H, verifica che NON vedi "Scontri Diretti"
7. Verifica che i punti coach sono visualizzati

**Cosa verificare:**
- [ v] Pagina classifica carica
- [v ] Tutte le sezioni sono visibili
- [ ?] "Scontri Diretti" appare solo se H2H abilitato
- [ x] Punti coach sono visualizzati
- [ v] Dati sono corretti
- [ ?] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Sezioni: tutte visibili?
- Scontri Diretti: appare solo se H2H?
- Punti coach: visualizzati?
- Se non funziona: descrivi cosa manca o è sbagliato

---

## 🏆 TEST 16: CLASSIFICHE - FILTRO SQUADRA

**Cosa testare:**
1. Nella pagina classifiche, vai alla sezione "Dettaglio per Giornata"
2. Verifica che c'è un selettore "Filtra Squadra"
3. Seleziona una squadra dal selettore
4. Verifica che la tabella mostra solo i dati di quella squadra
5. Seleziona "Tutte" o un'altra squadra
6. Verifica che la tabella si aggiorna

**Cosa verificare:**
- [v ] Selettore "Filtra Squadra" è visibile
- [ v] Selettore contiene tutte le squadre
- [ v] Filtro funziona correttamente
- [ v] Tabella si aggiorna quando cambi filtro
- [ ?] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Selettore: visibile e funziona?
- Filtro: mostra solo la squadra selezionata?
- Se non funziona: descrivi cosa non va

---

## 📊 TEST 17: STATISTICHE - VISUALIZZAZIONE E PANEL

**Cosa testare:**
1. Vai su "Statistiche"
2. Verifica che vedi la lista di giocatori/allenatori/curva
3. **Su mobile**: verifica che ci sono filtri per ruolo (P/D/C/A)
4. Clicca su un giocatore
5. Verifica che si apre un panel con i dettagli
6. Chiudi il panel (clicca X o fuori)
7. Verifica che la lista giocatori è ancora visibile (NON deve scomparire)
8. Clicca su un altro giocatore
9. Verifica che il panel si aggiorna con i nuovi dati

**Cosa verificare:**
- [ v] Pagina statistiche carica
- [v ] Lista giocatori/allenatori/curva visibile
- [? ] Filtri ruolo funzionano (mobile)
- [v ] Panel dettaglio si apre correttamente
- [ v] Panel si chiude correttamente
- [ v] Lista NON scompare dopo chiusura panel
- [v ] Panel si aggiorna quando selezioni altro giocatore
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Panel: si apre e chiude correttamente?
- Lista: rimane visibile dopo chiusura panel?
- Se non funziona: descrivi cosa non va

---

## 👥 TEST 18: SQUADRE - VISUALIZZAZIONE

**Cosa testare:**
1. Vai su "Squadre"
2. Verifica che vedi i selettori giornata e squadra
3. Verifica che di default è selezionata la tua squadra e l'ultima giornata calcolata
4. Verifica che vedi il "Top 3 giocatori" della squadra
5. Verifica che vedi il campo verde con la formazione salvata
6. Verifica che vedi la panchina
7. Verifica che le foto dei giocatori sono visibili

**Cosa verificare:**
- [v ] Pagina squadre carica
- [ v] Selettori sono presenti
- [v ] Default: tua squadra e ultima giornata
- [v ] Top 3 giocatori visibile
- [v ] Campo verde con formazione visibile
- [ v] Panchina visibile
- [ ?] Foto giocatori: tutte visibili
- [ ?] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Default: corretti (tua squadra, ultima giornata)?
- Foto giocatori: tutte visibili?
- Se non funziona: descrivi cosa manca o è sbagliato

---

## 💬 TEST 19: BACHECA - CREAZIONE POST E COMMENTI

**Cosa testare:**
1. Vai su "Bacheca"
2. Scrivi un post nel textarea
3. Clicca su "Pubblica" o "Invia"
4. Verifica che il post appare nella bacheca
5. Clicca su un post
6. Scrivi un commento
7. Clicca su "Invia commento"
8. Verifica che il commento appare sotto il post

**Cosa verificare:**
- [v ] Pagina bacheca carica
- [v ] Creazione post funziona
- [ v] Post appare nella bacheca
- [ V] Aggiunta commento funziona
- [ V] Commento appare sotto il post
- [ V] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Post: si pubblica correttamente?
- Commenti: si aggiungono correttamente?
- Se non funziona: descrivi errore o cosa manca

---

## 💬 TEST 20: BACHECA - REAZIONI

**Cosa testare:**
1. Nella pagina bacheca, trova un post
2. Clicca su una reazione (es: 👍, ❤️, 😂)
3. Verifica che la reazione viene aggiunta (contatore aumenta)
4. Clicca di nuovo sulla stessa reazione
5. Verifica che la reazione viene rimossa (contatore diminuisce)
6. Prova con diverse reazioni su post diversi

**Cosa verificare:**
- [ V] Reazioni sono visibili sui post
- [ V] Click su reazione la aggiunge
- [ V] Click di nuovo la rimuove
- [ V] Contatore si aggiorna correttamente
- [V ] Nessun errore in console (specialmente "post is undefined")

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Reazioni: funzionano correttamente?
- Contatore: si aggiorna?
- Errori console: vedi "post is undefined"?
- Se non funziona: descrivi errore

---

## 💬 TEST 21: BACHECA - TAG UTENTI

**Cosa testare:**
1. Nella pagina bacheca, scrivi un post
2. Scrivi "@" nel textarea
3. Verifica che si apre una lista di utenti della lega
4. Inizia a scrivere dopo "@" (es: "@nic")
5. Verifica che la lista si filtra man mano che scrivi
6. Clicca su un utente dalla lista
7. Verifica che il tag viene inserito nel post
8. Pubblica il post
9. Verifica che il tag è presente nel post pubblicato

**Cosa verificare:**
- [v ] Scrivendo "@" si apre lista utenti
- [ v] Lista contiene utenti della lega
- [ v] Filtro funziona mentre scrivi
- [ v] Click su utente inserisce il tag
- [ ?] Tag è presente nel post pubblicato
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Lista utenti: si apre quando scrivi "@"?
- Filtro: funziona mentre scrivi?
- Tag: viene inserito correttamente?
- Se non funziona: descrivi cosa non va

---

## 🔔 TEST 22: NOTIFICHE - DROPDOWN NAVBAR

**Cosa testare:**
1. In navbar, cerca l'icona campanella 🔔
2. Clicca sulla campanella
3. Verifica che si apre un dropdown con le notifiche
4. Verifica che vedi le notifiche recenti (se presenti)
5. Clicca su una notifica (se ha un link)
6. Verifica che vieni reindirizzato alla pagina corretta
7. Chiudi il dropdown

**Cosa verificare:**
- [ ] Icona campanella è visibile
- [ ] Dropdown si apre correttamente
- [ ] Notifiche sono visualizzate
- [ ] Click su notifica funziona (se ha link)
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Dropdown: si apre?
- Notifiche: sono visualizzate?
- Link: funzionano?
- Se non funziona: descrivi cosa non va

---

## 🔔 TEST 23: NOTIFICHE - PAGINA NOTIFICHE

**Cosa testare:**
1. Vai su "Notifiche" (dalla navbar o da un link)
2. Verifica che vedi la pagina con tutte le notifiche
3. Verifica che le notifiche sono ordinate per data (più recenti prima)
4. Clicca su una notifica (se ha un link)
5. Verifica che vieni reindirizzato alla pagina corretta
6. Torna indietro
7. Verifica che le notifiche sono ancora visibili

**Cosa verificare:**
- [ ] Pagina notifiche carica
- [ ] Notifiche sono visualizzate
- [ ] Ordinamento per data è corretto
- [ ] Link funzionano
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Notifiche: sono visualizzate correttamente?
- Link: funzionano?
- Se non funziona: descrivi cosa non va

---

## 🔔 TEST 24: NOTIFICHE - CREAZIONE AUTOMATICA

**Cosa testare:**
1. Fai un'azione che dovrebbe generare una notifica:
   - Commenta un post di un altro utente
   - Reagisci a un post di un altro utente
   - Tagga un utente in un post
2. Verifica che una notifica viene creata per l'utente interessato
3. Se sei admin, calcola una giornata
4. Verifica che una notifica viene creata per tutti gli utenti della lega

**Cosa verificare:**
- [ ] Notifiche vengono create per commenti
- [ ] Notifiche vengono create per reazioni
- [ ] Notifiche vengono create per tag
- [ ] Notifiche vengono create per giornata calcolata (se admin)
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Notifiche: vengono create correttamente?
- Se non funziona: descrivi cosa non va

---

## 📅 TEST 25: CALENDARIO

**Cosa testare:**
1. Vai su "Calendario"
2. Verifica che vedi il calendario H2H (se la lega ha H2H abilitato)
3. Verifica che ci sono tab "Campionato H2H" e "Coppa"
4. Se la lega ha coppa, verifica che il tab "Coppa" è attivo
5. Se la lega NON ha coppa, verifica che il tab "Coppa" è disabilitato
6. Verifica che le partite sono visualizzate correttamente
7. Verifica che i risultati sono visualizzati (se presenti)

**Cosa verificare:**
- [ ] Pagina calendario carica
- [ ] Calendario H2H è visibile (se abilitato)
- [ ] Tab Campionato/Coppa funzionano
- [ ] Tab Coppa è disabilitato se coppa non presente
- [ ] Partite e risultati sono visualizzati correttamente
- [ ] Nessun carattere strano (??) nei bottoni
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Calendario: è visibile?
- Tab: funzionano correttamente?
- Caratteri: vedi "??" o emoji corretti?
- Se non funziona: descrivi cosa non va

---

## 🎨 TEST 26: TEMA CHIARO/SCURO

**Cosa testare:**
1. In qualsiasi pagina, cerca il pulsante per cambiare tema (di solito in navbar o footer)
2. Clicca sul pulsante per passare a tema scuro (se sei in chiaro) o chiaro (se sei in scuro)
3. Verifica che il tema cambia immediatamente
4. Vai su un'altra pagina
5. Verifica che il tema è ancora quello che hai scelto
6. Ricarica la pagina (F5)
7. Verifica che il tema è ancora quello che hai scelto

**Cosa verificare:**
- [ v] Pulsante cambio tema è visibile
- [v ] Cambio tema funziona
- [v ] Tema persiste tra pagine
- [ v] Tema persiste dopo ricaricamento
- [ v] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Cambio tema: funziona?
- Persistenza: tema rimane tra pagine?
- Se non funziona: descrivi cosa non va

---

## 📱 TEST 27: NAVBAR AUTO-HIDE MOBILE

**Cosa testare:**
1. **IMPORTANTE**: questo test va fatto su mobile (o DevTools mobile mode)
2. In qualsiasi pagina, verifica che la navbar è visibile in alto
3. Scorri la pagina verso il basso
4. Verifica che la navbar scompare
5. Scorri la pagina leggermente verso l'alto (anche solo un po')
6. Verifica che la navbar riappare
7. Apri il menu hamburger
8. Verifica che il menu si apre correttamente

**Cosa verificare:**
- [ ] Navbar scompare quando scorri in basso
- [ ] Navbar riappare quando scorri in alto
- [ ] Menu hamburger funziona
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Auto-hide: funziona correttamente?
- Menu hamburger: funziona?
- Se non funziona: descrivi cosa non va

---

## 📱 TEST 28: RESPONSIVE - MOBILE

**Cosa testare:**
1. Apri il sito su mobile (o DevTools mobile mode)
2. Vai su diverse pagine (Home, Formazioni, Matchday, Classifiche, ecc.)
3. Verifica che:
   - Il layout si adatta allo schermo
   - I testi sono leggibili
   - I pulsanti sono cliccabili
   - Le immagini sono visibili
   - Non ci sono elementi che escono dallo schermo
4. Ruota il dispositivo (se possibile)
5. Verifica che il layout si adatta anche in landscape

**Cosa verificare:**
- [ ] Layout si adatta allo schermo mobile
- [ ] Testi sono leggibili
- [ ] Pulsanti sono cliccabili
- [ ] Immagini sono visibili
- [ ] Nessun elemento esce dallo schermo
- [ ] Layout funziona anche in landscape
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Layout: si adatta correttamente?
- Problemi specifici: descrivi se vedi qualcosa di strano
- Se non funziona: descrivi cosa non va

---

## 💻 TEST 29: RESPONSIVE - DESKTOP

**Cosa testare:**
1. Apri il sito su desktop
2. Vai su diverse pagine (Home, Formazioni, Matchday, Classifiche, ecc.)
3. Verifica che:
   - Il layout utilizza lo spazio disponibile
   - I testi sono leggibili
   - Le immagini sono visibili
   - Non ci sono elementi troppo grandi o troppo piccoli
4. Ridimensiona la finestra del browser
5. Verifica che il layout si adatta alle diverse dimensioni

**Cosa verificare:**
- [ ] Layout utilizza lo spazio disponibile
- [ ] Testi sono leggibili
- [ ] Immagini sono visibili
- [ ] Layout si adatta al ridimensionamento
- [ ] Nessun errore in console

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Layout: utilizza correttamente lo spazio?
- Problemi specifici: descrivi se vedi qualcosa di strano
- Se non funziona: descrivi cosa non va

---

## ⚡ TEST 30: PERFORMANCE E ERRORI CONSOLE

**Cosa testare:**
1. Apri DevTools (F12)
2. Vai su Console
3. Carica diverse pagine del sito
4. Verifica che:
   - Non ci sono errori rossi (solo warning gialli accettabili)
   - I tempi di caricamento sono ragionevoli (< 3 secondi)
5. Vai su Network
6. Verifica che:
   - Le richieste alle risorse (immagini, script) sono completate
   - Non ci sono richieste fallite (404, 403, CORS)
7. Vai su Application → Storage
8. Verifica che:
   - LocalStorage contiene i dati necessari
   - Service Worker è attivo (se presente)

**Cosa verificare:**
- [ ] Nessun errore rosso in console
- [ ] Tempi di caricamento < 3 secondi
- [ ] Nessuna richiesta fallita in Network
- [ ] LocalStorage contiene dati
- [ ] Service Worker attivo (se presente)

**Feedback richiesto:**
- ✅ Funziona / ❌ Non funziona
- Errori console: vedi errori rossi? Quali?
- Performance: tempi di caricamento accettabili?
- Network: richieste fallite? Quali?
- Se non funziona: descrivi errori o problemi

---

## 📝 NOTE FINALI

- **Esegui un test alla volta**
- **Fornisci feedback specifico per ogni test**
- **Se vedi errori, copiali dalla console (F12 → Console)**
- **Se qualcosa non funziona, descrivi esattamente cosa succede**

**Buon testing! 🧪**


