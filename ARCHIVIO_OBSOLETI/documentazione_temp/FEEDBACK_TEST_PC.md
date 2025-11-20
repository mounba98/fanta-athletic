# Feedback Test PC - 10 Novembre 2025

## ⚠️ ERRORI COMUNI (da sistemare prioritariamente)

### Errore Auth-Guard (ricorrente in più pagine)
- **Errore**: `[auth-guard] impossibile aggiornare mapping username (permessi). Salvo solo nel profilo utente. FirebaseError: Missing or insufficient permissions. auth-guard.js:568:15`
- **Pagine interessate**: HOME, CLASSIFICA, MATCHDAY (lineup summary), SQUADRE
- **Priorità**: ALTA - Errore ricorrente che appare in console

### Errori CORS Upload/Delete Foto Profilo
- **Problema**: Errori CORS quando si tenta di uploadare o eliminare foto profilo
- **Errori specifici**:
  - `CORS Preflight Did Not Succeed`
  - `404` su `fanta-athletic.appspot.com`
  - URL sembra usare bucket sbagliato: `fanta-athletic.firebasestorage.app` vs `fanta-athletic.appspot.com`
- **Limite**: 2MB troppo poco per foto profilo
- **Priorità**: ALTA - Blocca funzionalità upload/delete foto

---

## 📋 FEEDBACK PER PAGINA

### 🏠 HOME (PC)
- ✅ **OK**: Podio squadre top 5 funziona
- ❌ **PROBLEMA**: Non vedo "Top giocatori settimana"
- ⚠️ **ERRORE**: Errore giallo auth-guard (vedi sopra)

### 📊 CLASSIFICA (PC)
- ✅ **OK**: Classifica pare ok
- ⚠️ **ERRORE**: 2 errori gialli auth-guard (vedi sopra)

### 👤 PROFILO
- ✅ **OK**: "0 post pubblicati" inizialmente ok
- ❌ **PROBLEMA**: Contatore post non si aggiorna dopo pubblicazione nuovo post
- ❌ **PROBLEMA**: Punti totali = 0. **SOLUZIONE**: Se non c'è classifica H2H, mostrare punti per giornata invece
- ❌ **PROBLEMA**: Posizione mostra "-" invece di "1" (è primo ora)
- ⚠️ **NOTA**: Skrotz 0 è sbagliato, ma non vogliamo sistemarlo ora (da fare dopo)
- ❌ **PROBLEMA CRITICO**: Upload foto profilo - tanti errori CORS (vedi sopra)
- ❌ **PROBLEMA CRITICO**: DELETE foto profilo non funziona - errori CORS (vedi sopra)
- ❌ **PROBLEMA**: Limite 2MB troppo poco per foto profilo

### ⚽ FORMAZIONI (PC)
- ✅ **OK**: Sembra ottimo, funziona anche upload foto

### 📅 MATCHDAY
- ✅ **OK**: Calcolo giocatore funziona
- ⚠️ **MIGLIORAMENTO**: Parziale si aggiorna solo in riepilogo, non nel counter del giocatore (almeno fino a salvataggio)
- ❌ **PROBLEMA**: In modalità "Convocati" - tasti Salva/Annulla devono essere sempre visibili
- ❌ **PROBLEMA**: Filtri bonus "da curva" - manca "giocatore squalificato canta (in curva)" che dà +5
- ✅ **OK**: Test 12 - Reset funzionano
- ⚠️ **ERRORE**: Test 13 - Errore giallo auth-guard in lineup summary
- ❌ **PROBLEMA LAYOUT**: Riepilogo punteggi - 5 caselle verticali prendono troppo spazio, allinearle meglio
- ❌ **PROBLEMA UX**: Selettori non chiusi di default e non si chiudono
- ❌ **PROBLEMA**: Badge "convocato" - non voglio vederlo nei giocatori in dettaglio giornata in campo, ma sì nella visuale a lista
- ❌ **PROBLEMA**: Panchina non si vede
- ⏸️ **NON TESTATO**: Test 10 (mobile - da fare dopo), Test 11 (non testato perché giocano oggi)

### 📈 CLASSIFICHE
- ❓ **DA VERIFICARE**: H2H non so se appare (non c'è competizione H2H in corso)
- ⚠️ **NOTA**: Punti coach rimossi perché non apparivano mai
- ⚠️ **ERRORE**: 2 errori gialli auth-guard
- ❌ **PROBLEMA**: Classifica per giornate - squadra senza formazione deve apparire ultima con 0 punti e asterisco "*" vicino al nome
- ❌ **PROBLEMA UX**: Quando entro in classifica per giornate, voglio vedere di default l'ultima giornata calcolata

### 📊 STATISTICHE
- ✅ **OK**: Ottimo
- ⚠️ **DUBBIO**: Conteggio punti potrebbe non essere quello effettivo (da verificare più avanti, solo sensazione)

### 👥 SQUADRE (PC)
- ❌ **PROBLEMA CRITICO LAYOUT**: Grossi problemi di layout nella lista squadre (vedi foto 1 allegata)
  - Elementi si sovrappongono
  - Logo "CANNI GAY" della squadra selezionata sovrappone altre squadre nella colonna centrale
- ⚠️ **ERRORE**: Errore giallo auth-guard

### 🏷️ TAG (Test 21)
- ❌ **PROBLEMA**: Non sicuro che trovi tutti gli utenti
- ❌ **PROBLEMA**: Cercare per username E nome/cognome reale
  - Esempio: cerco "nicola mocci", se scrivo "@mo" deve trovare "mounba" (nick associato a nicola mocci)
- ❓ **DA VERIFICARE**: Tag non so se presente nel post creato
  - Teoricamente dovrebbe apparire un link sul tag che riporta alle info dell'utente taggato

### 🔔 NOTIFICHE (Test 22-24)
- ❌ **PROBLEMA CRITICO**: Notifica tag non funziona - non vedo la notifica
- ⏸️ **NON TESTATO**: Test 23 e 24 non testabili perché notifica tag non funziona

### 📅 CALENDARIO (Test 25)
- ⏸️ **NON TESTABILE**: Nessuna icona calendario su PC
- ⏸️ **NON TESTABILE**: Nessun calendario H2H effettivo (non ci sono scontri H2H)

### ✅ Test 26
- ✅ **OK**: Sembra ok

### 🧭 NAVBAR (Test 29)
- ❌ **PROBLEMA RESPONSIVE**: Navbar va ricalibrata quando si stringe lo schermo
- 💡 **SUGGERIMENTO UX**: Menu a tendina/dropdown
  - Cursore su "Squadre" → tendina con: lista squadre, formazioni, dettagli giornate
  - Cursore su "Classifiche" → tendina con: classifiche, statistiche, ecc.
  - Cursore su "Social" → tendina con: bacheca, store, profilo (click su "Social" porta a bacheca)
- 💡 **SUGGERIMENTO MOBILE**: Su schermi piccoli usare solo icone
  - Store → icona busta da shopping
  - Statistiche → suo segno/icona
  - E così via

### 🔐 ACCEDI (Nota da foto 2)
- ❌ **PROBLEMA**: Ci sono 2 tasti "Accedi" visibili
- ⚠️ **NOTA**: Si risolve, ma gestione non ottimale

---

## 📝 PRIORITÀ FIX

### 🔴 CRITICO (blocca funzionalità)
1. Errori CORS upload/delete foto profilo
2. Notifiche tag non funzionano
3. Layout squadre (sovrapposizione elementi)

### 🟡 ALTO (errori ricorrenti)
4. Errore auth-guard mapping username (appare in molte pagine)
5. Contatore post profilo non si aggiorna
6. Punti totali profilo = 0 (mostrare punti per giornata se no H2H)
7. Posizione profilo mostra "-" invece di numero
8. Classifica per giornate: squadra senza formazione deve apparire ultima con *
9. Default ultima giornata calcolata in classifica per giornate

### 🟢 MEDIO (miglioramenti UX)
10. Parziale matchday si aggiorna solo in riepilogo
11. Tasti Salva/Annulla sempre visibili in convocati
12. Filtro bonus "da curva" manca giocatore squalificato canta
13. Layout riepilogo punteggi (5 caselle verticali)
14. Selettori non chiusi di default
15. Badge convocato: nascondere in campo, mostrare in lista
16. Panchina non visibile
17. Tag: cercare per username E nome/cognome
18. Tag: link nel post che porta a info utente
19. Navbar responsive con menu dropdown
20. Limite 2MB foto profilo troppo poco
21. Top giocatori settimana non visibile in HOME
22. Doppio tasto "Accedi"

### 🔵 BASSO (da verificare/da fare dopo)
23. Verificare conteggio punti statistiche
24. Verificare se H2H appare quando c'è competizione
25. Skrotz profilo (da sistemare dopo)
26. Icone navbar su mobile (da ragionare)

---

## 📸 RIFERIMENTI FOTO
- **Foto 1**: Problemi layout squadre (sovrapposizione logo)
- **Foto 2**: Doppio tasto "Accedi" visibile

---

## ✅ COSE CHE FUNZIONANO BENE
- Podio squadre top 5 (HOME)
- Classifica generale
- Formazioni PC (incluso upload foto)
- Calcolo giocatore matchday
- Reset matchday
- Statistiche (con dubbio minore su conteggio)
- Test 26

---

**Data feedback**: 10 Novembre 2025
**Piattaforma**: PC (mobile da fare dopo)
**Stato**: Solo nota - NON modificare codice per ora

