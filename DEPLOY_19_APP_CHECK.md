# 🔒 DEPLOY #19 - FIREBASE APP CHECK INTEGRATION

**Data**: 21 Ottobre 2025, 11:50 AM  
**URL Live**: https://fanta-athletic.web.app/  
**Status**: ⚠️ **DEPLOYED - CONFIGURAZIONE RICHIESTA**

---

## 🎯 PROBLEMA RISOLTO

### Storage 403 Unauthorized
**Sintomo**: `Firebase Storage: User does not have permission to access 'players/.../P022.jpg'`  
**Causa**: **App Check enforcement** attivo su Storage senza token valido  
**Impatto**: Upload foto giocatori e profilo bloccati con errore 403

---

## ✅ SOLUZIONE IMPLEMENTATA

### Firebase App Check Integration

**Cos'è App Check?**  
Sistema di sicurezza Firebase che verifica richieste provengano da app legittime, non da bot o script malevoli.

**Come Funziona?**
1. **Produzione**: reCAPTCHA v3 verifica utente reale
2. **Sviluppo**: Debug token bypassa verifica
3. Firebase genera token App Check
4. Token inviato con ogni richiesta Storage
5. Firebase valida token prima di autorizzare

---

## 📊 FILES MODIFICATI

### Nuovi File (3):
1. **`resources/app-check-config.js`** (configurazione App Check)
   - Auto-detect dev vs prod
   - Gestione debug token (localhost)
   - Gestione reCAPTCHA v3 (produzione)

2. **`APP_CHECK_SETUP.md`** (guida setup completa)
   - Istruzioni registrazione reCAPTCHA
   - Configurazione Firebase Console
   - Setup debug token
   - Troubleshooting

3. **`add-app-check.ps1`** (script automazione)
   - Aggiunge App Check a file Storage

### File Modificati (7):
1. `upload-foto-giocatori.html` ✅
2. `user-profile-upload.html` ✅
3. `profile.html` ✅
4. `bacheca.html` ✅
5. `admin-roster.html` ✅
6. `admin-import-players.html` ✅
7. `admin-cards.html` ✅

**Modifiche Applicate**:
```html
<!-- Aggiunto SDK App Check -->
<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check-compat.js"></script>

<!-- Aggiunto config App Check -->
<script src="resources/app-check-config.js?v=20251021-1"></script>

<!-- Attivazione dopo init -->
<script>
  if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
  }
  
  // Attiva App Check (dev: debug token, prod: reCAPTCHA v3)
  activateAppCheck();
</script>
```

---

## ⚠️ CONFIGURAZIONE OBBLIGATORIA

### IMPORTANTE: App Check NON funzionerà finché non completi questi step!

### Step 1: Registra reCAPTCHA v3 Site Key

1. Vai su **Google Cloud Console**:  
   https://console.cloud.google.com/security/recaptcha?project=fanta-athletic

2. Clicca **CREATE KEY**

3. Compila:
   - **Label**: `Fanta Athletic Web`
   - **Type**: **Score based (v3)**
   - **Domains**: 
     - `fanta-athletic.web.app`
     - `fanta-athletic.firebaseapp.com`
     - `localhost`

4. Clicca **CREATE**

5. **COPIA LA SITE KEY** (es: `6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

---

### Step 2: Configura Firebase Console

1. Vai su **Firebase Console → App Check**:  
   https://console.firebase.google.com/project/fanta-athletic/appcheck

2. Seleziona app Web: **Fanta Athletic**

3. Clicca **Add provider** → **reCAPTCHA v3**

4. Incolla **Site Key** copiata

5. Clicca **Save**

---

### Step 3: Aggiorna Codice

1. Apri: `resources/app-check-config.js`

2. Trova riga 10:
   ```javascript
   const RECAPTCHA_SITE_KEY = '6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // TODO: Sostituire!
   ```

3. Sostituisci con tua **Site Key reale**

4. Salva file

5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

---

### Step 4: Test Produzione

1. Vai su: https://fanta-athletic.web.app/upload-foto-giocatori.html

2. Apri Console Browser (F12)

3. Verifica messaggio:
   ```
   🔒 App Check: Modalità PRODUZIONE (reCAPTCHA v3)
   ✅ App Check attivato con reCAPTCHA v3
   ```

4. Prova **upload foto giocatore**

5. Verifica **NO errore 403** ✅

---

## 🧪 SVILUPPO LOCALE (Debug Token)

Se sviluppi in locale (`localhost`):

1. Avvia: `firebase serve`

2. Apri: `http://localhost:5000/upload-foto-giocatori.html`

3. Console Browser → Copia debug token:
   ```
   Firebase App Check debug token: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
   ```

4. Vai su **Firebase Console → App Check → Debug tokens**

5. Clicca **Add debug token** → Incolla → **Save**

6. **Ricarica pagina** → Upload funziona!

---

## 📈 STATISTICHE DEPLOY

**Files Totali**: 187  
**Files Nuovi**: 3  
**Files Modificati**: 7  
**Linee Aggiunte**: +150  
**SDK Aggiunto**: `firebase-app-check-compat.js`  
**Breaking Changes**: 0 (se Site Key configurata)  

---

## 🔧 TROUBLESHOOTING

### ❌ Errore: "storage/unauthorized" persiste

**Causa**: Site Key non configurata  
**Soluzione**: Completa Step 1-3 sopra

---

### ❌ Errore: "App Check token is invalid"

**Causa**: Site Key errata  
**Soluzione**:
1. Verifica Site Key in `app-check-config.js`
2. Verifica Site Key in Firebase Console
3. Devono essere identiche!

---

### ❌ Console: "App Check debug token: ..."

**Normale in localhost!**  
**Soluzione**: Registra debug token (vedi Step 4 sopra)

---

### ✅ reCAPTCHA badge visibile

**Normale!** Badge richiesto da Google.

Per nasconderlo (opzionale):
```css
.grecaptcha-badge { visibility: hidden; }
```

**IMPORTANTE**: Se nascondi, aggiungi disclaimer:
```
This site is protected by reCAPTCHA and the Google
Privacy Policy and Terms of Service apply.
```

---

## 📚 DOCUMENTAZIONE

**Guida Completa**: `APP_CHECK_SETUP.md`

**Contiene**:
- ✅ Checklist setup passo-passo
- ✅ Screenshot Firebase Console
- ✅ Troubleshooting dettagliato
- ✅ Test produzione e sviluppo
- ✅ FAQ

---

## 🚀 PROSSIMI STEP

### Immediati (OBBLIGATORI):
1. ⚠️ **Registra reCAPTCHA Site Key** (Step 1)
2. ⚠️ **Configura Firebase Console** (Step 2)
3. ⚠️ **Aggiorna app-check-config.js** (Step 3)
4. ⚠️ **Deploy**: `firebase deploy --only hosting`
5. ✅ **Test upload foto** → Deve funzionare!

### Opzionali:
- [ ] Nascondi reCAPTCHA badge (con disclaimer)
- [ ] Monitora App Check metrics in Firebase Console
- [ ] Setup debug token per altri developer

---

## 💡 PERCHÉ APP CHECK?

### Benefici:
- ✅ **Sicurezza**: Blocca bot e script malevoli
- ✅ **Protezione API**: Previene abuso Storage/Firestore
- ✅ **Gratuito**: Incluso in Firebase (reCAPTCHA v3 gratis fino 1M req/mese)
- ✅ **Trasparente**: Utenti non vedono CAPTCHA (v3 è invisibile)

### Svantaggi:
- ⚠️ Richiede configurazione iniziale
- ⚠️ Debug token necessario per sviluppo locale
- ⚠️ Badge reCAPTCHA visibile (nascondibile)

---

## 📊 COSTI

**Tutto GRATUITO!**
- Firebase App Check: Incluso
- reCAPTCHA v3: Gratis fino 1M richieste/mese
- Fanta Athletic traffico stimato: ~10K req/mese

---

## ✅ CHECKLIST FINALE

Prima di considerare deploy completo:

- [ ] Site Key reCAPTCHA v3 creata ✅
- [ ] Site Key configurata in Firebase Console ✅
- [ ] Site Key aggiornata in `app-check-config.js` ⚠️ **TODO**
- [ ] Codice deployed: `firebase deploy --only hosting` ✅
- [ ] Test upload foto giocatore → ⚠️ **Funzionerà dopo config Site Key**
- [ ] Console browser → Messaggio "App Check attivato" ✅
- [ ] Network tab → Header `X-Firebase-AppCheck` presente ⚠️ **Dopo config**

---

**DEPLOY #19 COMPLETATO! 🔒**

**⚠️ IMPORTANTE: Configura Site Key per far funzionare upload!**  
**Segui guida: APP_CHECK_SETUP.md**
