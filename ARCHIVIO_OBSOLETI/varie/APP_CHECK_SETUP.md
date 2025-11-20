# 🔒 FIREBASE APP CHECK - GUIDA SETUP

**Data**: 21 Ottobre 2025  
**Problema**: Storage 403 causato da App Check enforcement  
**Soluzione**: Integrare App Check con reCAPTCHA v3

---

## 📋 CHECKLIST SETUP

### 1. ✅ Registra reCAPTCHA v3 Site Key

1. Vai su **Google Cloud Console**:  
   https://console.cloud.google.com/security/recaptcha

2. Seleziona progetto: **fanta-athletic**

3. Clicca **CREATE KEY**

4. Compila form:
   - **Label**: `Fanta Athletic Web`
   - **reCAPTCHA type**: **Score based (v3)**
   - **Domains**: 
     - `fanta-athletic.web.app`
     - `fanta-athletic.firebaseapp.com`
     - `localhost` (per dev)

5. Clicca **CREATE**

6. **COPIA LA SITE KEY** (formato: `6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

---

### 2. ✅ Configura App Check in Firebase Console

1. Vai su **Firebase Console**:  
   https://console.firebase.google.com/project/fanta-athletic/appcheck

2. Clicca **Get started** (se prima volta)

3. Seleziona app: **Fanta Athletic (Web)**

4. Clicca **Add provider**

5. Seleziona **reCAPTCHA v3**

6. Incolla la **Site Key** copiata al passo 1

7. Clicca **Save**

8. **IMPORTANTE**: Imposta enforcement:
   - **Storage**: `Enforced` ✅ (già attivo, causa del 403)
   - **Firestore**: `Unenforced` (opzionale)

---

### 3. ✅ Aggiorna Codice con Site Key

1. Apri file: `resources/app-check-config.js`

2. Trova riga:
   ```javascript
   const RECAPTCHA_SITE_KEY = '6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // TODO: Sostituire!
   ```

3. Sostituisci con la tua **Site Key reale**:
   ```javascript
   const RECAPTCHA_SITE_KEY = '6LeIL2sqAAAAABcT...'; // La tua chiave
   ```

4. Salva file

---

### 4. ✅ Setup Debug Token (Solo Sviluppo Locale)

**IMPORTANTE**: Fai questo SOLO se sviluppi in locale (localhost)!

1. Apri app in locale: `http://localhost:5000` (o porta Firebase Hosting)

2. Apri **Console Browser** (F12)

3. Cerca messaggio:
   ```
   Firebase App Check debug token: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
   ```

4. **COPIA IL TOKEN**

5. Vai su **Firebase Console → App Check → Debug tokens**:  
   https://console.firebase.google.com/project/fanta-athletic/appcheck/debugtokens

6. Clicca **Add debug token**

7. Incolla token copiato

8. Aggiungi descrizione: `Dev Local - [TUO NOME]`

9. Clicca **Save**

10. **Ricarica pagina locale** → Upload dovrebbe funzionare!

---

## 🧪 TEST FUNZIONAMENTO

### Test Produzione (fanta-athletic.web.app)

1. Vai su: https://fanta-athletic.web.app/upload-foto-giocatori.html

2. Apri **Console Browser** (F12)

3. Verifica messaggi:
   ```
   🔒 App Check: Modalità PRODUZIONE (reCAPTCHA v3)
   ✅ App Check attivato con reCAPTCHA v3
   ```

4. Prova **upload foto giocatore**

5. Verifica **NO errore 403**

6. Verifica in **Network tab**:
   - Request a `firebasestorage.googleapis.com`
   - Header `X-Firebase-AppCheck` presente
   - Status `200 OK`

---

### Test Sviluppo (localhost)

1. Avvia server locale: `firebase serve`

2. Vai su: `http://localhost:5000/upload-foto-giocatori.html`

3. Apri **Console Browser** (F12)

4. Verifica messaggi:
   ```
   🔧 App Check: Modalità SVILUPPO (debug token)
   ⚠️ IMPORTANTE: Copia il debug token dalla console...
   Firebase App Check debug token: "XXXXXXXX-..."
   ```

5. **COPIA debug token** e registralo (vedi step 4 sopra)

6. **Ricarica pagina**

7. Prova **upload foto** → Deve funzionare!

---

## 🔧 TROUBLESHOOTING

### Errore: "App Check token is invalid"

**Causa**: Site Key errata o non configurata  
**Soluzione**:
1. Verifica Site Key in `app-check-config.js`
2. Verifica Site Key in Firebase Console → App Check
3. Devono essere identiche!

---

### Errore: "storage/unauthorized" persiste

**Causa 1**: App Check non attivato correttamente  
**Soluzione**:
1. Apri Console Browser (F12)
2. Verifica messaggio `✅ App Check attivato`
3. Se manca, controlla errori JavaScript

**Causa 2**: Debug token non registrato (localhost)  
**Soluzione**:
1. Copia debug token da console
2. Registra in Firebase Console → Debug tokens
3. Ricarica pagina

**Causa 3**: Storage rules errate  
**Soluzione**:
1. Verifica `storage.rules` linea 50-57
2. Deploy: `firebase deploy --only storage`

---

### reCAPTCHA badge visibile in basso a destra

**Normale!** reCAPTCHA v3 mostra badge per policy Google.

**Per nasconderlo** (opzionale):
```css
.grecaptcha-badge {
  visibility: hidden;
}
```

**IMPORTANTE**: Se nascondi badge, DEVI mostrare disclaimer:
```html
This site is protected by reCAPTCHA and the Google
<a href="https://policies.google.com/privacy">Privacy Policy</a> and
<a href="https://policies.google.com/terms">Terms of Service</a> apply.
```

---

## 📊 FILES MODIFICATI

### Nuovi File:
- `resources/app-check-config.js` (configurazione App Check)
- `APP_CHECK_SETUP.md` (questa guida)

### File Modificati:
- `upload-foto-giocatori.html` (aggiunto App Check)
- `user-profile-upload.html` (aggiunto App Check)

### File da Modificare (TODO):
Tutti i file che usano Firebase Storage devono includere App Check:
- Aggiungi `<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check-compat.js"></script>`
- Aggiungi `<script src="resources/app-check-config.js?v=20251021-1"></script>`
- Chiama `activateAppCheck()` dopo `firebase.initializeApp()`

---

## 🚀 DEPLOY

Dopo aver configurato Site Key:

```bash
# Deploy hosting con nuovo codice
firebase deploy --only hosting

# Hard refresh browser
# Desktop: Ctrl+Shift+R
# Mobile: Cancella cache
```

---

## 📝 NOTE IMPORTANTI

### Perché App Check?

Firebase App Check protegge le tue risorse backend (Storage, Firestore, Functions) da:
- Bot e script automatici
- Abuso di API
- Accessi non autorizzati da app non verificate

### Come Funziona?

1. **Produzione**: reCAPTCHA v3 verifica che richiesta venga da utente reale
2. **Sviluppo**: Debug token bypassa verifica per testing locale
3. Firebase genera **App Check token** valido
4. Token inviato con ogni richiesta Storage/Firestore
5. Firebase verifica token prima di eseguire operazione

### Costi?

- **reCAPTCHA v3**: GRATUITO fino a 1M richieste/mese
- **App Check**: GRATUITO (incluso in Firebase)

---

## ✅ CHECKLIST FINALE

Prima di considerare setup completo:

- [ ] Site Key reCAPTCHA v3 creata
- [ ] Site Key configurata in Firebase Console → App Check
- [ ] Site Key aggiornata in `app-check-config.js`
- [ ] Debug token registrato (se sviluppo locale)
- [ ] Codice deployed: `firebase deploy --only hosting`
- [ ] Test upload foto giocatore in produzione → ✅ Funziona
- [ ] Test upload foto profilo in produzione → ✅ Funziona
- [ ] Console browser → NO errori 403
- [ ] Network tab → Header `X-Firebase-AppCheck` presente

---

**SETUP APP CHECK COMPLETATO! 🔒**

**Upload foto dovrebbe funzionare senza errori 403!**
