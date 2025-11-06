# 🚀 DEPLOY #29 - JOIN LEAGUE FIX

**Data**: 21 Ottobre 2025, ore 16:25  
**Status**: 🔄 **IN CORSO**

---

## 🐛 PROBLEMA RISOLTO

### Join League Non Funzionava
**Descrizione**: Quando un utente non loggato riceve un link di invito con codice (es. `join-league.html?code=ABC123`), dopo login/registrazione il parametro `code` veniva PERSO.

**Cause**:
1. **auth.html** hardcodava il redirect a `index.html` dopo login
2. **auth.html** hardcodava il redirect a `join-league.html` (senza code) dopo registrazione
3. Il parametro `redirect` nell'URL non veniva usato correttamente

---

## 🔧 FIX IMPLEMENTATI

### 1. auth.html - Login Standard
**PRIMA**:
```javascript
await window.signIn(email, password); 
toast('Accesso effettuato'); 
setTimeout(()=>{ 
  window.location.href = 'index.html'; // ❌ Hardcoded
}, 300);
```

**DOPO**:
```javascript
await window.signIn(email, password); 
toast('Accesso effettuato'); 
setTimeout(()=>{ 
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');
  window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'index.html'; // ✅ Usa redirect param
}, 300);
```

### 2. auth.html - Login Google
**PRIMA**:
```javascript
await firebase.auth().signInWithPopup(provider);
toast('Accesso effettuato');
setTimeout(()=>{ 
  window.location.href = 'index.html'; // ❌ Hardcoded
}, 300);
```

**DOPO**:
```javascript
await firebase.auth().signInWithPopup(provider);
toast('Accesso effettuato');
setTimeout(()=>{ 
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');
  window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'index.html'; // ✅ Usa redirect param
}, 300);
```

### 3. auth.html - Registrazione
**PRIMA**:
```javascript
toast('✅ Registrazione completata! Unisciti a una lega per iniziare.');
setTimeout(()=>{ 
  window.location.href = 'join-league.html'; // ❌ Senza code
}, 1500);
```

**DOPO**:
```javascript
toast('✅ Registrazione completata! Unisciti a una lega per iniziare.');
setTimeout(()=>{ 
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');
  // Se c'è un redirect (es. join-league.html?code=XXX), usalo, altrimenti join-league generico
  window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'join-league.html'; // ✅ Usa redirect param
}, 1500);
```

### 4. join-league.html - Inizializzazione Firebase
**AGGIUNTO**:
```javascript
window.db = firebase.firestore();
window.auth = firebase.auth();
```

### 5. join-league.html - Timeout CheckCode
**PRIMA**:
```javascript
setTimeout(() => checkCode().catch(err => console.error('Error in checkCode:', err)), 500);
```

**DOPO**:
```javascript
setTimeout(() => {
  console.log('🔍 Verifica automatica codice...');
  checkCode().catch(err => console.error('Error in checkCode:', err));
}, 1000); // ✅ Aumentato da 500ms a 1000ms
```

**AGGIUNTO ANCHE**:
```javascript
console.log('✅ Codice precompilato da URL:', codeParam);
console.log('🔍 Verifica automatica codice...');
```

---

## 📊 FLUSSO CORRETTO (DOPO FIX)

### Scenario 1: Utente NON Loggato con Link Invito
1. **Riceve link**: `https://fanta-athletic.web.app/join-league.html?code=ABC123`
2. **Redirect automatico**: `auth.html?redirect=join-league.html%3Fcode%3DABC123`
3. **Login/Registrazione**
4. **Redirect corretto**: `join-league.html?code=ABC123` ✅
5. **Auto-check codice**: Verifica automatica dopo 1s
6. **Mostra lega**: Info lega + squadre disponibili
7. **Join**: Utente clicca "Unisciti" → Successo! 🎉

### Scenario 2: Utente Loggato con Link Invito
1. **Riceve link**: `https://fanta-athletic.web.app/join-league.html?code=ABC123`
2. **Pagina carica**: Nessun redirect (già loggato)
3. **Auto-check codice**: Verifica automatica dopo 1s
4. **Mostra lega**: Info lega + squadre disponibili
5. **Join**: Utente clicca "Unisciti" → Successo! 🎉

### Scenario 3: Utente Loggato Senza Codice
1. **Apre pagina**: `https://fanta-athletic.web.app/join-league.html`
2. **Input manuale**: Utente digita codice `ABC123`
3. **Auto-check**: Verifica ogni volta che digita 6° carattere
4. **Mostra lega**: Info lega + squadre disponibili
5. **Join**: Utente clicca "Unisciti" → Successo! 🎉

---

## 🧪 TEST DA FARE

### Test Obbligatori (DOPO DEPLOY #29)

**1. Link Invito → Login → Join**
- [ ] Logout dal sito
- [ ] Clicca su link invito (chiedilo all'admin o generalo da league-invite.html)
- [ ] Verifica redirect a auth.html con parametro `redirect`
- [ ] Fai login
- [ ] Verifica redirect a join-league.html **CON code**
- [ ] Verifica che codice sia precompilato
- [ ] Verifica che info lega appaiano automaticamente dopo 1s
- [ ] Seleziona squadra disponibile
- [ ] Clicca "Unisciti alla Lega"
- [ ] Verifica redirect a index.html dopo successo

**2. Link Invito → Registrazione → Join**
- [ ] Logout dal sito
- [ ] Clicca su link invito
- [ ] Verifica redirect a auth.html con parametro `redirect`
- [ ] Fai registrazione nuovo utente
- [ ] Verifica redirect a join-league.html **CON code**
- [ ] Verifica che codice sia precompilato
- [ ] Verifica che info lega appaiano automaticamente dopo 1s
- [ ] Seleziona squadra disponibile
- [ ] Clicca "Unisciti alla Lega"
- [ ] Verifica redirect a index.html dopo successo

**3. Link Invito → Google Login → Join**
- [ ] Logout dal sito
- [ ] Clicca su link invito
- [ ] Verifica redirect a auth.html con parametro `redirect`
- [ ] Fai login con Google
- [ ] Verifica redirect a join-league.html **CON code**
- [ ] Verifica che codice sia precompilato
- [ ] Verifica che info lega appaiano automaticamente dopo 1s
- [ ] Seleziona squadra disponibile
- [ ] Clicca "Unisciti alla Lega"
- [ ] Verifica redirect a index.html dopo successo

**4. Codice Manuale (già loggato)**
- [ ] Vai su join-league.html (senza code)
- [ ] Digita codice manualmente
- [ ] Verifica che info lega appaiano dopo 6° carattere
- [ ] Seleziona squadra disponibile
- [ ] Clicca "Unisciti alla Lega"
- [ ] Verifica redirect a index.html dopo successo

---

## 🔍 CONSOLE LOGS ATTESI

### join-league.html (con code da URL)
```
User authenticated: fTaDr6Odn0fBpWS6e7QWOujmLlj1 babaali2808@gmail.com
✅ Codice precompilato da URL: ABC123
🔍 Verifica automatica codice...
Joining league: 4rq1Rr0TquRfuPLmqQTn Team: team-01 User: fTaDr6Odn0fBpWS6e7QWOujmLlj1
✅ Join league success!
```

### auth.html (con redirect)
```
User logged in: fTaDr6Odn0fBpWS6e7QWOujmLlj1
Redirecting to: join-league.html?code=ABC123
```

---

## 📁 FILE MODIFICATI

1. **auth.html**
   - Fix login standard: usa redirect param
   - Fix login Google: usa redirect param
   - Fix registrazione: usa redirect param
   - Total: 3 fix

2. **join-league.html**
   - Aggiunto `window.db` e `window.auth` init
   - Aumentato timeout checkCode: 500ms → 1000ms
   - Aggiunto console logs per debug
   - Total: 3 fix

---

## 🎯 RISULTATO ATTESO

### PRIMA (Deploy #1-28)
❌ Utente riceve link → Login → **Perde codice** → Deve inserire manualmente

### DOPO (Deploy #29)
✅ Utente riceve link → Login → **Mantiene codice** → Auto-check → Join automatico

---

## 💡 NOTE TECNICHE

### Perché il Codice Veniva Perso?

Il problema era nel redirect flow di Firebase Auth:

```
1. URL Iniziale: join-league.html?code=ABC123
2. Redirect Auth: auth.html?redirect=join-league.html%3Fcode%3DABC123
3. Login Success: window.location.href = 'index.html' ❌ SBAGLIATO
```

Il parametro `redirect` c'era nell'URL ma non veniva USATO!

### Soluzione

Ora leggiamo il parametro `redirect` e lo usiamo:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const redirectUrl = urlParams.get('redirect');
window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'index.html';
```

Questo mantiene **TUTTO** l'URL originale, inclusi i parametri query string.

---

## 🚀 DEPLOY STATUS

```bash
# Command
firebase deploy --only hosting

# Expected Output
✔ hosting[fanta-athletic]: file upload complete
✔ Deploy complete!

Hosting URL: https://fanta-athletic.web.app
```

---

**DEPLOY #29 FIXATO** ✅  
**Files Changed**: 2 (auth.html, join-league.html)  
**Lines Changed**: ~30  
**Breaking**: 🟢 ZERO  
**Risk**: 🟢 LOW
