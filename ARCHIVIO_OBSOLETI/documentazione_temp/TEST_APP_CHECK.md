# 🧪 TEST APP CHECK - SCRIPT CONSOLE BROWSER

**URL Test**: https://fanta-athletic.web.app/upload-foto-giocatori.html

---

## 📋 STEP 1: Verifica Configurazione

Apri Console Browser (F12) e incolla:

```javascript
// Verifica Firebase inizializzato
console.log('Firebase apps:', firebase.apps.length); // Deve essere 1

// Verifica Storage Bucket corretto
console.log('Storage Bucket:', firebase.app().options.storageBucket);
// Deve essere: "fanta-athletic.firebasestorage.app"

// Verifica App Check attivato
console.log('App Check ON:', window.__APP_CHECK_ON__);
// Deve essere: true
```

**Output Atteso**:
```
Firebase apps: 1
Storage Bucket: fanta-athletic.firebasestorage.app
App Check ON: true
✅ App Check attivato (reCAPTCHA v3)
```

---

## 📋 STEP 2: Verifica Token App Check

```javascript
// Ottieni token App Check
firebase.appCheck().getToken()
  .then(result => {
    console.log('✅ AppCheck token OK:', !!result.token);
    console.log('Token (primi 20 char):', result.token.substring(0, 20) + '...');
  })
  .catch(error => {
    console.error('❌ AppCheck token FAIL:', error);
  });
```

**Output Atteso**:
```
✅ AppCheck token OK: true
Token (primi 20 char): eyJhbGciOiJSUzI1NiIs...
```

**Se FAIL**: Controlla Firebase Console → App Check → Richieste recenti

---

## 📋 STEP 3: Test Upload File Minimo

```javascript
// Test upload file di prova (players/<lega>/__test.txt)
const league = window.currentLeague?.id || '4rq1Rr0TquRfuPLmqQTn';
const ref = firebase.storage().ref(`players/${league}/__test.txt`);
const blob = new Blob(['hello from app check test'], { type: 'text/plain' });

console.log('🚀 Tentativo upload a:', `players/${league}/__test.txt`);

ref.put(blob, { 
  customMetadata: { 
    uploader: firebase.auth().currentUser?.uid || 'unknown',
    testDate: new Date().toISOString()
  } 
})
.then(snapshot => {
  console.log('✅ UPLOAD OK!', snapshot);
  console.log('Bytes trasferiti:', snapshot.bytesTransferred);
  console.log('Metadata:', snapshot.metadata);
  
  // Ottieni URL download
  return snapshot.ref.getDownloadURL();
})
.then(url => {
  console.log('📥 Download URL:', url);
})
.catch(error => {
  console.error('❌ UPLOAD FAIL:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
});
```

**Output Atteso (SUCCESS)**:
```
🚀 Tentativo upload a: players/4rq1Rr0TquRfuPLmqQTn/__test.txt
✅ UPLOAD OK! UploadTaskSnapshot {...}
Bytes trasferiti: 25
Metadata: {...}
📥 Download URL: https://firebasestorage.googleapis.com/v0/b/...
```

**Output Errore (FAIL)**:
```
❌ UPLOAD FAIL: FirebaseError: Firebase Storage: User does not have permission...
Error code: storage/unauthorized
Error message: Firebase Storage: User does not have permission to access 'players/...'
```

---

## 🔧 TROUBLESHOOTING

### ❌ Errore: "storage/unauthorized" (403)

**Possibili Cause**:

#### 1. App Check Token Non Valido
```javascript
// Verifica token
firebase.appCheck().getToken()
  .then(r => console.log('Token valido:', !!r.token))
  .catch(e => console.error('Token invalido:', e));
```

**Soluzione**:
- Verifica Site Key corretta in `app-check-config.js`
- Hard refresh: `Ctrl+Shift+R`
- Verifica Firebase Console → App Check → Provider configurato

---

#### 2. Non Sei Admin
```javascript
// Verifica se sei admin
const uid = firebase.auth().currentUser?.uid;
console.log('Current UID:', uid);

// Verifica in Firestore
firebase.firestore().collection('admins').doc(uid).get()
  .then(doc => {
    console.log('Sei admin:', doc.exists);
    if (doc.exists) {
      console.log('Admin data:', doc.data());
    }
  });
```

**Soluzione**:
- Aggiungi il tuo UID in Firestore: `admins/{uid}` con campo `isAdmin: true`
- Oppure modifica Storage rules per test

---

#### 3. Storage Rules Errate
```javascript
// Verifica path upload
const league = window.currentLeague?.id || '4rq1Rr0TquRfuPLmqQTn';
console.log('League ID:', league);
console.log('Upload path:', `players/${league}/__test.txt`);
```

**Soluzione**:
- Verifica `storage.rules` linea 50-57
- Path deve essere: `players/{leagueId}/{playerId}`
- Deploy rules: `firebase deploy --only storage`

---

#### 4. App Check Enforcement Non Attivo
**Verifica Firebase Console**:
1. Vai su: App Check → Servizi
2. Cloud Storage → Stato deve essere: **Applicazione (enforced)**
3. Se è "Monitoraggio", clicca **Applica protezione**

---

### ❌ Errore: "App Check token is invalid"

**Causa**: Site Key errata o non configurata

**Verifica**:
```javascript
// Controlla se App Check è attivo
console.log('App Check attivo:', window.__APP_CHECK_ON__);
console.log('Firebase appCheck:', !!firebase.appCheck);
```

**Soluzione**:
1. Verifica Site Key in `app-check-config.js` linea 7
2. Verifica Site Key in Firebase Console → App Check → Provider
3. Devono essere identiche!
4. Hard refresh dopo modifica

---

### ✅ Test Completo Passato

Se vedi:
```
✅ AppCheck token OK: true
✅ UPLOAD OK!
📥 Download URL: https://...
```

**Sei pronto!** Prova upload foto giocatore dalla UI:
1. Seleziona giocatore
2. Carica immagine
3. Crop
4. Salva
5. ✅ Deve funzionare senza errori 403!

---

## 📊 CHECKLIST FINALE

Prima di testare upload foto:

- [ ] Console: `firebase.apps.length` = 1 ✅
- [ ] Console: `storageBucket` = "fanta-athletic.firebasestorage.app" ✅
- [ ] Console: `__APP_CHECK_ON__` = true ✅
- [ ] Console: `getToken()` → token valido ✅
- [ ] Console: Upload test file → SUCCESS ✅
- [ ] Firebase Console → App Check → Storage = Enforced ✅
- [ ] Sei loggato come admin ✅
- [ ] Hard refresh fatto (`Ctrl+Shift+R`) ✅

---

## 🎯 SCRIPT COMPLETO (COPIA/INCOLLA)

```javascript
// ========================================
// TEST COMPLETO APP CHECK + STORAGE
// ========================================

console.log('🧪 Inizio test App Check + Storage...\n');

// 1. Verifica configurazione
console.log('1️⃣ CONFIGURAZIONE');
console.log('Firebase apps:', firebase.apps.length);
console.log('Storage Bucket:', firebase.app().options.storageBucket);
console.log('App Check ON:', window.__APP_CHECK_ON__);
console.log('User UID:', firebase.auth().currentUser?.uid || 'NOT LOGGED IN');
console.log('');

// 2. Verifica token App Check
console.log('2️⃣ APP CHECK TOKEN');
firebase.appCheck().getToken()
  .then(result => {
    console.log('✅ Token valido:', !!result.token);
    console.log('Token preview:', result.token.substring(0, 30) + '...');
    console.log('');
    
    // 3. Test upload
    console.log('3️⃣ TEST UPLOAD');
    const league = window.currentLeague?.id || '4rq1Rr0TquRfuPLmqQTn';
    const ref = firebase.storage().ref(`players/${league}/__test.txt`);
    const blob = new Blob(['test ' + new Date().toISOString()], { type: 'text/plain' });
    
    console.log('Upload path:', `players/${league}/__test.txt`);
    
    return ref.put(blob, { 
      customMetadata: { 
        uploader: firebase.auth().currentUser?.uid || 'test',
        timestamp: Date.now().toString()
      } 
    });
  })
  .then(snapshot => {
    console.log('✅ UPLOAD SUCCESS!');
    console.log('Bytes:', snapshot.bytesTransferred);
    return snapshot.ref.getDownloadURL();
  })
  .then(url => {
    console.log('📥 Download URL:', url);
    console.log('');
    console.log('🎉 TUTTI I TEST PASSATI!');
    console.log('✅ App Check funziona correttamente');
    console.log('✅ Storage upload funziona');
    console.log('');
    console.log('👉 Ora prova upload foto dalla UI!');
  })
  .catch(error => {
    console.error('');
    console.error('❌ TEST FALLITO!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('');
    console.error('🔧 TROUBLESHOOTING:');
    if (error.code === 'storage/unauthorized') {
      console.error('1. Verifica di essere loggato come admin');
      console.error('2. Verifica App Check token valido');
      console.error('3. Verifica Storage rules');
      console.error('4. Hard refresh (Ctrl+Shift+R)');
    } else if (error.code === 'app-check/token-error') {
      console.error('1. Verifica Site Key in app-check-config.js');
      console.error('2. Verifica Provider in Firebase Console');
      console.error('3. Hard refresh (Ctrl+Shift+R)');
    }
  });
```

---

**COPIA LO SCRIPT COMPLETO E INCOLLALO NELLA CONSOLE!**

**Se tutti i test passano → Upload foto funzionerà! 🎉**
