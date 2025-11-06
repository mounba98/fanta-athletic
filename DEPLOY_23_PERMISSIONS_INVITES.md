# 🔒 DEPLOY #23 - FIRESTORE PERMISSIONS + SISTEMA INVITI

**Data**: 21 Ottobre 2025, 12:20 PM  
**URL Live**: https://fanta-athletic.web.app/  
**Status**: ✅ **DEPLOYED**

---

## ❌ PROBLEMA RISOLTO

### Firestore Permissions Error su Scores
**Errore Console**:
```
Error reading scores for team X: FirebaseError: Missing or insufficient permissions
```

**Causa**: Firestore rules bloccavano lettura `scores` subcollection  
**Impatto**: Classifica home non caricava, 17+ errori console

---

## ✅ FIX FIRESTORE RULES

### Prima (ERRATO):
```javascript
match /{subcollection}/{docId} {
  allow read: if isSignedIn() && (
    request.auth.uid in get(...).data.members || isAdmin()
  );
}
```
**Problema**: `scores` subcollection bloccata per tutti

### Dopo (CORRETTO):
```javascript
// Teams subcollection
match /teams/{teamId} {
  allow read: if isSignedIn() && (...);
  
  // Scores subcollection (PUBBLICO per classifica)
  match /scores/{scoreId} {
    // Read: TUTTI i membri della lega
    allow read: if isSignedIn() && (
      request.auth.uid in get(...).data.members || isAdmin()
    );
    
    // Write: solo admin
    allow write: if isSignedIn() && (...);
  }
}
```

**File**: `firestore.rules` linee 208-237

---

## 🎉 NUOVO: SISTEMA INVITI LEGA

### 1. join-league.html - Unisciti alla Lega

**URL**: https://fanta-athletic.web.app/join-league.html

**Features**:
- ✅ Input codice invito (6 caratteri)
- ✅ Verifica codice in tempo reale
- ✅ Mostra info lega (nome, membri, squadre)
- ✅ Lista squadre disponibili (senza owner)
- ✅ Selezione squadra
- ✅ Unione automatica (update lega + squadra + user)
- ✅ Redirect a home dopo successo

**Come Funziona**:
1. Utente riceve codice (es: `CSJVAV`)
2. Inserisce codice in input
3. Sistema verifica codice in Firestore
4. Mostra info lega e squadre disponibili
5. Utente seleziona squadra
6. Click "Unisciti alla Lega"
7. Sistema:
   - Aggiunge UID a `leagues/{id}/members`
   - Assegna owner a `leagues/{id}/teams/{teamId}`
   - Aggiunge lega a `users/{uid}/leagues`
8. Redirect a home

**URL con Codice Precompilato**:
```
https://fanta-athletic.web.app/join-league.html?code=CSJVAV
```

---

### 2. league-invite.html - Invita Membri

**URL**: https://fanta-athletic.web.app/league-invite.html

**Features**:
- ✅ Mostra codice invito lega corrente
- ✅ Copia codice negli appunti
- ✅ Copia link diretto
- ✅ Condividi su WhatsApp
- ✅ Statistiche (membri, squadre, disponibili)
- ✅ QR Code (placeholder)

**Come Funziona**:
1. Admin/membro apre pagina
2. Sistema carica lega corrente da `window.currentLeague`
3. Mostra codice invito (es: `CSJVAV`)
4. Genera link: `join-league.html?code=CSJVAV`
5. Bottoni condivisione:
   - **Copia Codice**: Copia `CSJVAV`
   - **Copia Link**: Copia URL completo
   - **WhatsApp**: Apre WhatsApp con messaggio precompilato

**Messaggio WhatsApp**:
```
🏆 Unisciti alla mia lega Fanta Athletic!

Lega: Fanta Athletic
Codice: CSJVAV

Link diretto: https://fanta-athletic.web.app/join-league.html?code=CSJVAV
```

---

## 📊 STATISTICHE DEPLOY

**Firestore Rules**: ✅ Deployed  
**Hosting**: ✅ Deployed (198 files)

### Nuovi File (2):
1. `join-league.html` (400+ linee)
2. `league-invite.html` (350+ linee)

### File Modificati (1):
1. `firestore.rules` (scores permissions)

---

## 🧪 TEST

### Test 1: Classifica Home (Permissions Fix)

1. Vai su: https://fanta-athletic.web.app/
2. Hard refresh: `Ctrl+Shift+R`
3. Console (F12) → Verifica:
   ```
   ✅ Lega trovata: 4rq1Rr0TquRfuPLmqQTn
   ⏳ Caricamento...
   ```
4. **NO errori** "Error reading scores"
5. Widget classifica mostra TOP 5 squadre ✅

---

### Test 2: Invita Membri

1. Vai su: https://fanta-athletic.web.app/league-invite.html
2. Verifica codice invito mostrato (es: `CSJVAV`)
3. Click **Copia Codice** → Verifica clipboard
4. Click **Copia Link** → Verifica clipboard
5. Click **WhatsApp** → Verifica messaggio

---

### Test 3: Unisciti alla Lega

**Scenario A**: Con codice
1. Vai su: https://fanta-athletic.web.app/join-league.html
2. Inserisci codice: `CSJVAV`
3. Verifica info lega mostrate
4. Verifica squadre disponibili
5. Seleziona squadra
6. Click "Unisciti alla Lega"
7. Verifica redirect a home

**Scenario B**: Con link diretto
1. Apri: `https://fanta-athletic.web.app/join-league.html?code=CSJVAV`
2. Codice già precompilato ✅
3. Info lega già mostrate ✅
4. Continua da step 4 sopra

---

## 🔧 FLUSSO COMPLETO INVITI

### 1. Admin Crea Lega
- Lega ha campo `inviteCode` (es: `CSJVAV`)
- Generato automaticamente (6 caratteri uppercase)

### 2. Admin Condivide Invito
- Apre `league-invite.html`
- Copia codice o link
- Condivide via WhatsApp/Email/SMS

### 3. Nuovo Utente Riceve Invito
- Riceve codice `CSJVAV` o link diretto
- Clicca link o va su `join-league.html`

### 4. Nuovo Utente Si Unisce
- Inserisce codice (se non precompilato)
- Vede info lega
- Seleziona squadra disponibile
- Click "Unisciti"

### 5. Sistema Aggiorna Firestore
```javascript
// Update lega
leagues/{leagueId}.members += [uid]

// Update squadra
leagues/{leagueId}/teams/{teamId}.owner = uid

// Update user
users/{uid}.leagues += [leagueId]
users/{uid}.currentLeague = leagueId
```

### 6. Redirect a Home
- Utente vede dashboard con nuova lega
- Può iniziare a giocare

---

## 💡 FEATURES IMPLEMENTATE

### join-league.html:
- [x] Input codice invito
- [x] Verifica codice real-time
- [x] Mostra info lega
- [x] Lista squadre disponibili
- [x] Selezione squadra
- [x] Unione automatica
- [x] Error handling
- [x] Success message
- [x] Redirect automatico
- [x] URL params support (`?code=XXX`)

### league-invite.html:
- [x] Mostra codice invito
- [x] Copia codice
- [x] Copia link
- [x] Condividi WhatsApp
- [x] Statistiche lega
- [x] Link diretto generato
- [x] Responsive design
- [ ] QR Code (TODO)

---

## 🎯 PROSSIMI MIGLIORAMENTI

### Sistema Inviti:
- [ ] QR Code generator (libreria `qrcode.js`)
- [ ] Email invito automatica
- [ ] Notifica push quando qualcuno si unisce
- [ ] Limite membri per lega
- [ ] Inviti con scadenza
- [ ] Revoca inviti

### Gestione Squadre:
- [ ] Trasferimento ownership squadra
- [ ] Rimozione membro da lega
- [ ] Squadre multiple per utente
- [ ] Co-ownership squadra

---

## 📝 NOTE TECNICHE

### Firestore Rules Hierarchy
```
leagues/{leagueId}
├── teams/{teamId}
│   └── scores/{scoreId}  ← FIX: readable by members
├── players/{playerId}
└── (other subcollections)
```

### Permissions Logic
- **Read scores**: Tutti i membri lega (per classifica)
- **Write scores**: Solo admin lega
- **Read teams**: Tutti i membri lega
- **Write teams**: Admin lega + owner squadra

### Security
- ✅ Codice invito univoco per lega
- ✅ Verifica utente loggato
- ✅ Verifica squadra disponibile (no owner)
- ✅ Atomic updates (lega + squadra + user)
- ✅ Error handling completo

---

## 🔗 LINK DIRETTI

**Unisciti alla Lega**:  
https://fanta-athletic.web.app/join-league.html

**Invita Membri**:  
https://fanta-athletic.web.app/league-invite.html

**Home (test classifica)**:  
https://fanta-athletic.web.app/

---

**DEPLOY #23 COMPLETATO! 🎉**

**Classifica funziona + Sistema inviti completo!**  
**Testa tutto e invita i tuoi amici! 🚀**
