# 🧪 Guida Test Locale con Firebase Emulators

## Setup Iniziale

### 1. Installa Firebase CLI (se non l'hai già)
```bash
npm install -g firebase-tools
```

### 2. Login a Firebase
```bash
firebase login
```

### 3. Installa le dipendenze (se necessario)
```bash
npm install
```

## Avvio Emulatori

### Comando Base
```bash
firebase emulators:start
```

Questo comando:
- ✅ Avvia **Firestore** su `localhost:8080`
- ✅ Avvia **Auth** su `localhost:9099`
- ✅ Avvia **Hosting** su `localhost:5000`
- ✅ Avvia **UI Emulator** su `localhost:4000` (dashboard per vedere dati/regole)

### Opzioni Utili

**Avvia solo alcuni emulatori:**
```bash
firebase emulators:start --only firestore,hosting,auth
```

**Avvia con import dati esistenti:**
```bash
firebase emulators:start --import=./emulator-data
```

**Esporta dati dopo i test:**
```bash
firebase emulators:export ./emulator-data
```

## Come Testare

### 1. Avvia gli emulatori
```bash
firebase emulators:start
```

### 2. Apri l'app nel browser
Vai su: **http://localhost:5000**

L'app si connetterà automaticamente agli emulatori (rileva `localhost` e usa le porte configurate).

### 3. Usa l'UI Emulator (opzionale)
Apri: **http://localhost:4000**

Qui puoi:
- Vedere tutti i dati Firestore in tempo reale
- Creare/modificare documenti manualmente
- Testare le regole di sicurezza
- Gestire utenti Auth

## Importare Dati di Produzione (Opzionale)

Se vuoi testare con dati reali:

```bash
# Esporta da produzione (richiede Firebase Admin SDK)
# Oppure usa l'UI Emulator per creare dati manualmente
```

## Vantaggi del Test Locale

✅ **Velocità**: Nessun deploy, modifiche istantanee  
✅ **Sicurezza**: Non tocca produzione  
✅ **Debug**: Vedi tutti i dati in tempo reale nell'UI  
✅ **Regole**: Testa le Firestore rules senza deploy  
✅ **Offline**: Funziona anche senza connessione  

## Note Importanti

⚠️ **I dati negli emulatori sono temporanei**: si cancellano quando chiudi gli emulatori (a meno che non usi `--export`).

⚠️ **Auth locale**: Gli utenti creati negli emulatori sono separati da produzione. Puoi crearli manualmente nell'UI Emulator.

⚠️ **Storage**: Gli emulatori non includono Storage di default. Se serve, aggiungi `"storage": { "port": 9199 }` in `firebase.json`.

## Troubleshooting

**Porta già in uso:**
```bash
# Cambia le porte in firebase.json o termina il processo che usa la porta
```

**Emulatori non si connettono:**
- Verifica che `firebase.json` abbia la sezione `emulators`
- Controlla che le porte siano libere
- Riavvia gli emulatori

**L'app non vede i dati:**
- Verifica che `firebase-config.js` rilevi `localhost` correttamente
- Controlla la console del browser per errori di connessione
- Verifica che gli emulatori siano effettivamente avviati
