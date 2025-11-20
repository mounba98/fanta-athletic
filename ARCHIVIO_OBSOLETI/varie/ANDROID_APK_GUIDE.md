# 📱 GUIDA CREAZIONE APK ANDROID - FANTA ATHLETIC

## 🎯 OPZIONI DISPONIBILI

### **Opzione 1: TWA (Trusted Web Activity) - CONSIGLIATA** ⭐
**Pro**: 
- ✅ Veloce (30 min setup)
- ✅ Aggiornamenti automatici (modifica web = aggiorna app)
- ✅ Nessun codice Android
- ✅ Play Store ready
- ✅ Push notifications supportate

**Contro**:
- ⚠️ Richiede dominio HTTPS (già hai fanta-athletic.web.app)
- ⚠️ Icona app + splash screen custom

---

### **Opzione 2: Capacitor - AVANZATA**
**Pro**:
- ✅ Controllo totale
- ✅ Plugin nativi (fotocamera, GPS, etc)
- ✅ Offline completo

**Contro**:
- ❌ Setup complesso (4-6h)
- ❌ Richiede Node.js + Android Studio
- ❌ Aggiornamenti manuali

---

### **Opzione 3: PWA2APK - VELOCE** 🚀
**Pro**:
- ✅ 5 minuti setup
- ✅ Zero codice
- ✅ Gratis

**Contro**:
- ⚠️ Non su Play Store
- ⚠️ Installazione manuale

---

## 🚀 METODO 1: TWA (CONSIGLIATO)

### **Step 1: Installa Bubblewrap**
```bash
npm install -g @bubblewrap/cli
```

### **Step 2: Inizializza Progetto**
```bash
cd C:\Users\nicol\CascadeProjects\fantacalcio
bubblewrap init --manifest https://fanta-athletic.web.app/manifest.json
```

**Rispondi alle domande**:
- Package name: `com.fantathletic.app`
- App name: `Fanta Athletic`
- Start URL: `https://fanta-athletic.web.app/`
- Icon: `resources/logo.png`

### **Step 3: Build APK**
```bash
bubblewrap build
```

**Output**: `app-release-signed.apk` (pronto per distribuzione)

### **Step 4: Testa APK**
```bash
adb install app-release-signed.apk
```

### **Step 5: Pubblica su Play Store**
1. Vai su [Google Play Console](https://play.google.com/console)
2. Crea nuova app
3. Upload APK
4. Compila store listing
5. Pubblica

---

## ⚡ METODO 2: PWA2APK (VELOCE)

### **Step 1: Vai su PWA Builder**
https://www.pwabuilder.com/

### **Step 2: Inserisci URL**
```
https://fanta-athletic.web.app/
```

### **Step 3: Click "Package For Stores"**
- Seleziona Android
- Download APK

### **Step 4: Condividi APK**
- Carica su Google Drive
- Condividi link con amici
- Installazione manuale

---

## 🔧 METODO 3: CAPACITOR (AVANZATO)

### **Step 1: Installa Capacitor**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

### **Step 2: Aggiungi Android**
```bash
npm install @capacitor/android
npx cap add android
```

### **Step 3: Copia Files**
```bash
npx cap copy
npx cap sync
```

### **Step 4: Apri Android Studio**
```bash
npx cap open android
```

### **Step 5: Build APK**
In Android Studio:
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- Trova APK in `android/app/build/outputs/apk/`

---

## 📋 REQUISITI MANIFEST.JSON

Il tuo `manifest.json` deve avere:

```json
{
  "name": "Fanta Athletic 2018",
  "short_name": "Athletic",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#dc143c",
  "theme_color": "#dc143c",
  "orientation": "portrait",
  "icons": [
    {
      "src": "resources/logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "resources/logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

✅ **Il tuo manifest è già OK!**

---

## 🎨 ICONE NECESSARIE

### **Dimensioni Richieste**:
- 192x192 (mdpi)
- 512x512 (xxxhdpi)
- 1024x1024 (Play Store)

### **Tool Generazione**:
https://realfavicongenerator.net/

Upload `resources/logo.png` → Download pack completo

---

## 🔐 FIRMA APK (Play Store)

### **Genera Keystore**
```bash
keytool -genkey -v -keystore fanta-athletic.keystore -alias fantathletic -keyalg RSA -keysize 2048 -validity 10000
```

**Salva password in posto sicuro!**

### **Firma APK**
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore fanta-athletic.keystore app-release-unsigned.apk fantathletic
```

---

## 📊 CONFRONTO METODI

| Feature | TWA | PWA2APK | Capacitor |
|---------|-----|---------|-----------|
| **Tempo Setup** | 30 min | 5 min | 4-6h |
| **Play Store** | ✅ | ❌ | ✅ |
| **Auto-update** | ✅ | ✅ | ❌ |
| **Offline** | ⚠️ | ⚠️ | ✅ |
| **Push Notif** | ✅ | ✅ | ✅ |
| **Difficoltà** | 🟢 | 🟢 | 🔴 |

---

## 🚀 RACCOMANDAZIONE

**Per Fanta Athletic**: Usa **TWA (Bubblewrap)**

**Perché**:
1. ✅ Già hai PWA funzionante
2. ✅ Manifest.json pronto
3. ✅ HTTPS attivo
4. ✅ Aggiornamenti automatici
5. ✅ Play Store compatible

**Tempo totale**: 30-45 minuti

---

## 📝 CHECKLIST PRE-BUILD

- [x] Manifest.json configurato
- [x] Service Worker attivo (sw.js)
- [x] HTTPS (Firebase Hosting)
- [x] Icone 192x192 e 512x512
- [ ] Logo 1024x1024 per Play Store
- [ ] Screenshot app (min 2)
- [ ] Descrizione app (max 4000 char)
- [ ] Privacy policy URL

---

## 🎯 STEP-BY-STEP VELOCE

### **Metodo Velocissimo (5 min)**
1. Vai su https://www.pwabuilder.com/
2. Inserisci `https://fanta-athletic.web.app/`
3. Click "Package For Stores"
4. Download APK
5. Condividi su WhatsApp/Drive

### **Metodo Play Store (45 min)**
1. `npm install -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://fanta-athletic.web.app/manifest.json`
3. `bubblewrap build`
4. Upload su Play Console
5. Pubblica

---

## 🐛 TROUBLESHOOTING

**Errore: "Icon not found"**
- Verifica `resources/logo.png` esiste
- Dimensione minima 192x192

**Errore: "Invalid manifest"**
- Valida su https://manifest-validator.appspot.com/

**APK non installa**
- Abilita "Origini sconosciute" su Android
- Settings → Security → Unknown sources

**App si apre in browser**
- Verifica `display: "standalone"` in manifest
- Riavvia device

---

## 📱 DISTRIBUZIONE

### **Opzione A: Play Store** (Ufficiale)
- Costo: $25 una tantum
- Review: 1-3 giorni
- Reach: Globale

### **Opzione B: Direct APK** (Veloce)
- Costo: Gratis
- Review: Nessuna
- Reach: Link diretto

### **Opzione C: App Store Alternative**
- APKPure
- F-Droid
- Amazon Appstore

---

## 🎉 CONCLUSIONE

**Per iniziare SUBITO**:
```bash
# 1. Installa Bubblewrap
npm install -g @bubblewrap/cli

# 2. Build APK
cd C:\Users\nicol\CascadeProjects\fantacalcio
bubblewrap init --manifest https://fanta-athletic.web.app/manifest.json
bubblewrap build

# 3. Condividi
# File: app-release-signed.apk
```

**Tempo**: 5 comandi, 30 minuti, APK pronto! 🚀

---

**📞 SUPPORTO**:
- Bubblewrap docs: https://github.com/GoogleChromeLabs/bubblewrap
- PWA Builder: https://www.pwabuilder.com/
- Play Console: https://play.google.com/console
