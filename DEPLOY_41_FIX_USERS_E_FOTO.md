# 🚀 DEPLOY #41 - FIX USERS + FOTO DUAL COLLECTION

**Data**: 21 Ottobre 2025, ore 19:42  
**Status**: ✅ DEPLOY IN CORSO

---

## 🎯 BUG #1: "No document to update: users/..."

### PROBLEMA

Quando utente si unisce a lega con codice CSJVAV:

```
✅ [MODAL] League found: 4rq1Rr0TquRfuPLmqQTn
❌ Error: No document to update: projects/fanta-athletic/databases/(default)/documents/users/dlWlzaUHStZIQzzdo61l12Q9Mid2
```

**Causa**: 
- User autenticato con Firebase Auth ✅
- Ma documento `/users/{uid}` NON ESISTE in Firestore ❌
- `.update()` fallisce perché non può aggiornare un documento inesistente

### FIX

**PRIMA** (❌):
```javascript
await db.collection('users').doc(uid).update({
  leagues: firebase.firestore.FieldValue.arrayUnion(leagueId),
  currentLeague: leagueId
});
```

**DOPO** (✅):
```javascript
await db.collection('users').doc(uid).set({
  leagues: firebase.firestore.FieldValue.arrayUnion(leagueId),
  currentLeague: leagueId,
  uid: uid,
  email: user.email,
  displayName: user.displayName || 'User',
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true });
```

**Differenza**:
- `.update()` → Fallisce se doc non esiste
- `.set(..., {merge: true})` → Crea doc se non esiste, altrimenti aggiorna

---

## 🎯 BUG #2: Foto Caricate Ma Non Visibili

### PROBLEMA

Utente dice:
> "in upload foto giocatori ci sono 5 giocatori con foto, messi di pomeriggio. Ma test-foto-live.html [non le mostra]"

**Causa**: Mismatch tra Collections Firestore

**Situazione**:
```
upload-foto-giocatori.html
  ↓ salva foto in:
  /leagues/{leagueId}/players/{playerId}
  
test-foto-live.html + matchday.html
  ↓ leggono da:
  /players/{playerId}
  
❌ Collection diverse! Foto non trovate!
```

### SCHEMA FIRESTORE

**PRIMA**:
```
/leagues/{leagueId}/players/{playerId}
  - nome_completo
  - role
  - photoURL ← QUI venivano salvate

/players/{playerId}
  - nome_completo
  - role
  - photoURL ← VUOTO! test-foto-live legge qui
```

**Risultato**: test-foto-live.html mostra 0 foto anche se ce ne sono 5.

### FIX

Ora `upload-foto-giocatori.html` salva in **ENTRAMBE** le collections:

**DOPO**:
```javascript
// 🔄 Aggiorna Firestore in ENTRAMBE le collections
const db = firebase.firestore();

// 1. Salva in /leagues/{leagueId}/players/{playerId}
await db.collection('leagues')
  .doc(currentLeagueId)
  .collection('players')
  .doc(selectedPlayerId)
  .update({ photoURL });

// 2. Salva ANCHE in /players/{playerId} (per matchday.html e test-foto-live.html)
await db.collection('players')
  .doc(selectedPlayerId)
  .set({ photoURL }, { merge: true });
```

**Stesso fix anche per DELETE**:
```javascript
// Rimuovi da ENTRAMBE le collections
await db.collection('leagues')...update({ photoURL: FieldValue.delete() });
await db.collection('players')...update({ photoURL: FieldValue.delete() });
```

---

## 🧪 COSA DEVI FARE ORA

### STEP 1: Clear SW
```
1. https://fanta-athletic.web.app/clear-sw.html
2. PULISCI TUTTO
3. Versione v2025102104 attiva
```

### STEP 2: Test Join con Codice (Incognito)
```
1. CTRL+SHIFT+N (finestra incognito)
2. Login con user NON in lega
3. Modal popup appare
4. Inserisci: CSJVAV
5. Click "Unisciti"
6. Console log:
   ✅ [MODAL] League found: [id]
   ✅ [MODAL] User document updated/created
7. Alert: "✅ Ti sei unito alla lega con successo!"
8. Redirect a index.html
```

**NON DEVE** più dare errore "No document to update" ✅

### STEP 3: Ri-Carica Foto (OBBLIGATORIO)

Le 5 foto che hai caricato sono in `/leagues/{leagueId}/players/{playerId}`.  
Ora devi ri-caricarle per popolare anche `/players/{playerId}`:

```
1. https://fanta-athletic.web.app/upload-foto-giocatori.html
2. Scegli STESSI 5 giocatori (Calosi, D'Amico, Fantechi, Pinzauti, Sarri)
3. Upload STESSE foto
4. Sistema sovrascrive in ENTRAMBE le collections
5. Ora test-foto-live.html le vede ✅
```

**Alternativa**: Apri Firebase Console e copia manualmente i 5 `photoURL` da `/leagues/{leagueId}/players` a `/players`.

### STEP 4: Verifica Foto
```
1. https://fanta-athletic.web.app/test-foto-live.html
2. Statistiche:
   📊 Totale: 30
   ✅ Con foto: 5 (PRIMA era 0)
   🖼️ Caricate OK: 5
3. Vedi le 5 foto caricate ✅
```

### STEP 5: Matchday
```
1. https://fanta-athletic.web.app/matchday.html
2. Seleziona giornata
3. Lista giocatori → FOTO appaiono per i 5 giocatori
4. Non più solo iniziali SVG blu
```

---

## 📊 FILES MODIFICATI

### 1. resources/auth-guard.js (v2025102104)
- ✅ `.update()` → `.set(..., {merge: true})`
- ✅ Crea documento `/users/{uid}` se non esiste
- ✅ Log: `✅ [MODAL] User document updated/created`

### 2. upload-foto-giocatori.html
- ✅ Salva `photoURL` in ENTRAMBE le collections
- ✅ `/leagues/{leagueId}/players/{playerId}`
- ✅ `/players/{playerId}`
- ✅ Delete cancella da entrambe

### 3. sw.js
- ✅ Cache v2025102104

---

## 🔍 PERCHÉ DUE COLLECTIONS?

### Architettura Firestore

**Collection 1**: `/leagues/{leagueId}/players/{playerId}`
- Dati giocatori specifici per lega
- Punti, voti, formazione, foto
- Usato da: upload-foto-giocatori.html

**Collection 2**: `/players/{playerId}`
- Dati giocatori globali (tutte le leghe)
- Nome, ruolo, foto
- Usato da: matchday.html, test-foto-live.html, debug-foto-db.html

**Problema**: Due fonti di verità → Sincronizzazione necessaria

**Soluzione**: Ora upload salva in ENTRAMBE automaticamente

---

## ⚠️ MIGRATION NECESSARIA

### Dati Esistenti

Le 5 foto che hai caricato oggi pomeriggio sono in:
```
/leagues/{leagueId}/players/{playerId}.photoURL
```

Ma test-foto-live.html legge da:
```
/players/{playerId}.photoURL
```

### Opzioni per Migrare

**Opzione 1**: Ri-carica foto (FACILE)
```
1. upload-foto-giocatori.html
2. Ri-upload STESSE 5 foto
3. Sistema copia in entrambe le collections
```

**Opzione 2**: Script Firebase Console (AVANZATO)
```javascript
// Apri Firebase Console → Firestore
// Per ogni giocatore con foto:
const leaguePlayersRef = db.collection('leagues').doc(leagueId).collection('players');
const globalPlayersRef = db.collection('players');

leaguePlayersRef.where('photoURL', '!=', null).get().then(snap => {
  snap.forEach(doc => {
    const photoURL = doc.data().photoURL;
    globalPlayersRef.doc(doc.id).set({ photoURL }, { merge: true });
  });
});
```

**Opzione 3**: Manuale (TEDIOSO)
```
1. Firebase Console → Firestore
2. Copia photoURL da /leagues/{id}/players/{id}
3. Incolla in /players/{id}
4. Ripeti per 5 giocatori
```

**Consiglio**: Opzione 1 (ri-carica foto) = più veloce e sicuro ✅

---

## 🧪 TEST RISULTATI ATTESI

### Join League
```
PRIMA:
❌ Error: No document to update: users/...

DOPO:
✅ [MODAL] League found: [id]
✅ [MODAL] User document updated/created
✅ Ti sei unito alla lega con successo!
→ Redirect index.html
```

### test-foto-live.html
```
PRIMA (con 5 foto caricate):
📊 Totale: 30
✅ Con foto: 0 ← PROBLEMA!
❌ Senza foto: 30

DOPO (ri-carica stesse 5 foto):
📊 Totale: 30
✅ Con foto: 5 ← RISOLTO!
❌ Senza foto: 25
🖼️ Caricate OK: 5
```

### matchday.html
```
PRIMA:
- Solo iniziali SVG blu per tutti

DOPO:
- Foto reali per 5 giocatori
- Iniziali SVG per altri 25
```

---

## 🔧 TROUBLESHOOTING

### "Ancora errore No document to update"
```
Causa: Service Worker vecchio

Fix:
1. clear-sw.html → PULISCI TUTTO
2. F12 → Application → Clear Storage → Clear site data
3. CTRL+SHIFT+F5
4. Finestra incognito nuova
5. Riprova
```

### "Foto ancora 0 dopo ri-upload"
```
Causa: Non hai ri-caricato le foto

Fix:
1. upload-foto-giocatori.html
2. Ricarica STESSE 5 foto
3. Sistema le salva in ENTRAMBE le collections
4. test-foto-live.html → refresh → vedi 5 foto
```

### "Upload foto dà errore"
```
Causa: Permessi Firestore o Storage

Fix:
1. Firebase Console → Firestore Rules
2. Verifica: /players/{playerId} allow write: if request.auth != null;
3. Firebase Console → Storage Rules
4. Verifica: allow write: if request.auth != null;
```

---

## 📞 QUANDO TORNI DIMMI:

1. **Join league** → Funziona senza errore "No document"?
2. **Ri-caricato foto?** Quante (5 o di più)?
3. **test-foto-live.html** → Mostra 5 foto o ancora 0?
4. **matchday** → Foto appaiono per i 5 giocatori?

Screenshot console se problemi! 📸

---

## 🎮 PROSSIMO STEP: GIOCHI

Dopo che hai testato tutto:
1. Completo OSM Athletic Manager HTML
2. Completo Wirc Snap HTML
3. Deploy #42 finale con giochi

---

## 🔥 RIASSUNTO ULTRA-VELOCE

```
BUG #1: Join League
❌ .update() falliva se user doc non esiste
✅ .set({merge:true}) crea doc se manca

BUG #2: Foto 5 ma test-foto-live mostra 0
❌ Upload salvava solo in /leagues/{id}/players
✅ Ora salva in ENTRAMBE (/players + /leagues)

DA FARE:
1. clear-sw.html → PULISCI
2. Test join incognito con CSJVAV
3. ⚠️ RI-CARICA 5 FOTO (stesso file, stesso giocatore)
4. test-foto-live.html → verifica 5 foto
5. matchday → vedi foto reali

IMPORTANTE:
Le 5 foto del pomeriggio sono in collection sbagliata!
DEVI ri-caricarle per popolare /players/{id}
```

**Fine Deploy #41! 🚀**
