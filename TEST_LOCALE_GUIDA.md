# 🧪 COME TESTARE LOCALMENTE (Senza Deploy)

## 🚀 METODO RAPIDO: Firebase Serve

### Comando:
```bash
firebase serve --only hosting
```

### Risultato:
- Server locale su: **http://localhost:5000**
- Apri nel browser: http://localhost:5000
- Funziona come se fosse su Firebase Hosting
- **NON fa deploy** - solo test locale

### Stop Server:
- Premi `CTRL+C` nel terminale

---

## 📋 ALTRI METODI

### 1. **Python HTTP Server** (Semplice)
```bash
# Se hai Python installato
cd public
python -m http.server 8000
```
Apri: http://localhost:8000

### 2. **Node.js http-server** (Se hai Node.js)
```bash
# Installa una volta
npm install -g http-server

# Poi usa
cd public
http-server -p 8000
```
Apri: http://localhost:8000

### 3. **VS Code Live Server** (Extension)
- Installa estensione "Live Server" in VS Code
- Click destro su `index.html` → "Open with Live Server"
- Si apre automaticamente nel browser

---

## ⚠️ LIMITAZIONI TEST LOCALE

### Cosa FUNZIONA:
- ✅ HTML/CSS/JS locali
- ✅ Layout e UI
- ✅ JavaScript base
- ✅ Service Worker (se configurato)

### Cosa NON FUNZIONA:
- ❌ Firebase (autenticazione, Firestore, Storage)
- ❌ API esterne
- ❌ PWA install (alcune funzionalità)

**Per testare Firebase serve sempre su Firebase Hosting!**

---

## 🎯 WORKFLOW RACCOMANDATO

1. **Test Locale** (firebase serve)
   - Verifica layout/navbar/UI
   - Controlla errori JavaScript base
   - Test rapido senza aspettare deploy

2. **Deploy su Firebase**
   - Test completo con Firebase funzionante
   - Test finale prima di usare in produzione

---

## 💡 SUGGERIMENTO

**Per cambiamenti CSS/HTML rapidi**: Usa `firebase serve`  
**Per test completi con Firebase**: Deploy su hosting

---

**Comando attuale**: `firebase serve --only hosting`  
**URL**: http://localhost:5000


