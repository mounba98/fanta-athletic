# 🧪 Guida Test Migrazione Multilega

**Data:** Novembre 2024

---

## ✅ Checklist Test Post-Migrazione

### 1. **Verifica Dati Migrati**

#### Controlla in Firebase Console:
1. Vai su https://console.firebase.google.com/project/fanta-athletic/firestore
2. Verifica che esistano:
   - ✅ `leagues/{leagueId}/teams` (18 squadre)
   - ✅ `leagues/{leagueId}/players` (31 giocatori)
   - ✅ `leagues/{leagueId}/results` (se presenti)
   - ✅ `leagues/{leagueId}/days` (se presenti)
3. Controlla che ogni documento abbia il campo `leagueId`

#### Comando rapido:
```javascript
// Apri console browser (F12) su qualsiasi pagina
// Verifica che i dati siano nella struttura multilega
firebase.firestore().collection('leagues').doc('4rq1Rr0TquRfuPLmqQTn').collection('teams').get()
  .then(snap => console.log('Squadre migrate:', snap.size));
```

---

### 2. **Test Funzionalità Core**

#### 🏠 Home (`index.html`)
- [ ] La pagina carica senza errori
- [ ] Le card sono in layout 3x3 (desktop)
- [ ] Vedi "Ultimo Risultato" se loggato
- [ ] Vedi "Ultimi 3 risultati" se loggato
- [ ] Preview classifiche funziona
- [ ] League selector visibile e funzionante

#### 🏆 Squadre (`squadre.html`)
- [ ] Layout corretto: sidebar sinistra + panel centrale + colonna destra
- [ ] Lista squadre visibile (18 squadre)
- [ ] Click su squadra → carica dati nel panel centrale
- [ ] Top 3 giocatori visibili (se dati disponibili)
- [ ] Status "Schierata/Non schierata" corretto
- [ ] Form campi squadra funzionanti (nome, allenatori, rosa)

#### ⚽ Formazioni (`formazioni.html`)
- [ ] Tendina "Rosa della squadra" **chiusa** di default ✅
- [ ] Click sulla tendina → si apre/chiude correttamente
- [ ] Campo verde con formazione visibile
- [ ] Drag & drop giocatori funziona
- [ ] Salvataggio formazione funziona
- [ ] Capitano selezionabile

#### 📊 Classifiche (`classifiche.html`)
- [ ] Classifica generale mostra tutte le squadre
- [ ] Punteggi corretti
- [ ] Export CSV/Excel funziona
- [ ] Filtro per giornata funziona

#### 🧮 Calcolo Giornate (`matchday.html`) - Solo Admin
- [ ] Lista squadre visibile
- [ ] Calcolo punti funziona
- [ ] Salvataggio risultati funziona
- [ ] Risultati salvati in `leagues/{leagueId}/results`

#### 📈 Statistiche (`statistiche.html`)
- [ ] Dati giocatori corretti
- [ ] Filtri per ruolo funzionano
- [ ] Panel dettaglio funziona

---

### 3. **Test Multilega (Isolamento Dati)**

#### Creare Nuova Lega di Test:
1. Vai su `admin-leghe.html`
2. Crea nuova lega "Test Lega"
3. Nota l'ID della nuova lega (es. `test-league-123`)

#### Verifica Isolamento:
1. **Seleziona lega "Fanta Athletic"** (legacy)
   - Vedi 18 squadre
   - Vedi 31 giocatori
   - Vedi risultati esistenti

2. **Seleziona lega "Test Lega"** (nuova)
   - ✅ Dovrebbe essere **vuota** (0 squadre)
   - ✅ 0 giocatori
   - ✅ 0 risultati

3. **Aggiungi squadra in "Test Lega"**
   - Vai su `squadre.html`
   - Seleziona "Test Lega" dal selector
   - Aggiungi una squadra di test
   - Verifica che:
     - ✅ Appare solo in "Test Lega"
     - ✅ NON appare in "Fanta Athletic"
     - ✅ I dati sono in `leagues/{test-league-id}/teams`

4. **Torna a "Fanta Athletic"**
   - ✅ Le 18 squadre originali sono ancora lì
   - ✅ La squadra di test NON è visibile

---

### 4. **Test Navbar e UI**

#### Navbar (`admin.html`, `store.html`, tutte le pagine)
- [ ] Profilo icon visibile (se loggato)
- [ ] Notifiche icon visibile (se loggato)
- [ ] League selector visibile e funzionante
- [ ] Theme toggle funziona
- [ ] Navbar ha gradient rosso-blu uniforme

#### Layout Responsive
- [ ] Desktop: layout 3 colonne
- [ ] Tablet: layout 2 colonne
- [ ] Mobile: layout 1 colonna

---

### 5. **Test Admin Panel**

#### Admin Hub (`admin.html`)
- [ ] Tutti i link admin funzionano
- [ ] Navbar mostra profilo e notifiche ✅

#### Admin Store (`admin-store.html`)
- [ ] Lista prodotti visibile
- [ ] Aggiungi/modifica/elimina prodotti funziona
- [ ] Upload foto funziona (se implementato)

#### Admin Leghe (`admin-leghe.html`)
- [ ] Lista leghe esistenti
- [ ] Creazione nuova lega funziona
- [ ] Modifica lega funziona

---

### 6. **Test Errori e Console**

#### Apri Console Browser (F12)
- [ ] **Nessun errore rosso** in console
- [ ] Warning accettabili (es. "League ID non pronto" solo al primo caricamento)
- [ ] Messaggi `[MultiLeague]` o `[LeagueHelper]` sono informativi, non errori

#### Verifica Log:
```
✅ Firebase initialized successfully
✅ League Helper inizializzato (multi-league mode)
✅ [LEAGUE-SELECTOR] Loaded X leagues for user
✅ currentLeague loaded: {leagueId}
```

---

### 7. **Test Performance**

#### Verifica Velocità:
- [ ] Home carica in < 2 secondi
- [ ] Squadre carica in < 3 secondi
- [ ] Formazioni carica in < 2 secondi
- [ ] Classifiche carica in < 3 secondi

#### Verifica Network (F12 → Network):
- [ ] Query Firestore vanno a `leagues/{leagueId}/...` (non legacy)
- [ ] Numero query ragionevole (non centinaia)
- [ ] Nessuna query duplicata

---

### 8. **Test Edge Cases**

#### Scenario 1: Utente senza Lega
- [ ] Logga con utente che NON è membro di nessuna lega
- [ ] Verifica che il sito non crasha
- [ ] Verifica messaggi informativi ("Non sei membro di nessuna lega")

#### Scenario 2: Switch Lega
- [ ] Seleziona "Fanta Athletic" → vedi dati legacy
- [ ] Seleziona "Test Lega" → vedi dati test
- [ ] Torna a "Fanta Athletic" → dati legacy ancora lì ✅

#### Scenario 3: Dati Legacy
- [ ] Verifica che le collezioni legacy (`teams`, `players`, etc.) esistano ancora
- [ ] Verifica che NON vengano più usate (solo multilega)

---

## 🐛 Problemi Comuni e Fix

### Problema: "League ID non pronto"
**Causa:** League selector non ancora caricato  
**Fix:** Attendi 1-2 secondi, refresh se necessario

### Problema: "Nessun dato visibile"
**Causa:** Dati non migrati o lega sbagliata  
**Fix:** Verifica che `migrate-existing-data.html` sia stato eseguito

### Problema: "Query va ancora a legacy"
**Causa:** Cache browser o script non aggiornato  
**Fix:** Hard refresh (Ctrl+Shift+R) o clear cache

### Problema: "Navbar non mostra profilo"
**Causa:** Script `navbar-profile-icon.js` non caricato  
**Fix:** Verifica che sia incluso nella pagina

---

## ✅ Criteri di Successo

La migrazione è **riuscita** se:
- ✅ Tutti i dati esistenti sono visibili e funzionanti
- ✅ Creare nuova lega → dati isolati correttamente
- ✅ Switch lega → dati cambiano correttamente
- ✅ Nessun errore critico in console
- ✅ Performance accettabili
- ✅ UI/UX invariata per l'utente finale

---

## 📝 Report Test

Compila questo report dopo i test:

```
✅/❌ Dati migrati: ____
✅/❌ Home funziona: ____
✅/❌ Squadre funziona: ____
✅/❌ Formazioni funziona: ____
✅/❌ Classifiche funziona: ____
✅/❌ Multilega isolamento: ____
✅/❌ Navbar/UI: ____
✅/❌ Errori console: ____
✅/❌ Performance: ____

Note: 
- Problemi trovati: ________________
- Da sistemare: ________________
```

---

## 🚀 Se Tutto Funziona

1. ✅ Migrazione completata con successo!
2. ✅ Puoi creare nuove leghe per altri utenti
3. ✅ I dati legacy possono rimanere (backup) o essere rimossi
4. ✅ Procedi con la pulizia del codice legacy (opzionale)

