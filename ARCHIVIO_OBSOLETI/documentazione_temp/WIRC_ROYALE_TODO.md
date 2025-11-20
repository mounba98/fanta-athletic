# 🍺 WIRC ROYALE - COSA DEVI FARE TU

## 📋 RIEPILOGO

Ho creato:
✅ **Landing Page** (`wirc-royale.html`) - Menu principale con tutte le info
✅ **Card Gallery** (`wirc-card-gallery.html`) - Galleria carte navigabile
✅ **JSON Structure** (`data/wirc-cards.json`) - Template dati carte
✅ **UI/UX Complete** - Design pronto

**ORA SERVE CHE TU FACCIA:**

---

## 1️⃣ COMPLETARE IL FILE JSON CARTE

### File: `data/wirc-cards.json`

**Status**: Template con 2 carte → SERVE COMPLETARE TUTTE LE 40+

### Cosa fare:
1. Apri `data/wirc-cards.json`
2. Copia il JSON completo che ti ha dato ChatGPT (con tutte le 40+ carte)
3. Sostituisci il contenuto del file
4. Verifica che ogni carta abbia:
   - ✅ id, nome, ruolo, rarita
   - ✅ costo_birra, hp, dps, velocita, range
   - ✅ abilita {nome, descrizione, cd_sec}
   - ✅ battute {spawn, win, ko}
   - ✅ audio {spawn, win, ko} (path placeholder ok per ora)

**Esempio da aggiungere per ogni personaggio:**
```json
{
  "id": "tommy_guardu",
  "nome": "Tommy Guardu",
  "ruolo": "Tank",
  "rarita": "Raro",
  "costo_birra": 6,
  "hp": 1000,
  "dps": 80,
  "velocita": "lenta",
  "range": 60,
  "bersagli": "terra",
  "abilita": {
    "nome": "Motivatore",
    "descrizione": "Raddoppia i danni degli alleati vicini per 3s.",
    "cd_sec": 15,
    "durata_sec": 3
  },
  "battute": {
    "spawn": "Forza ragazzi, su!",
    "win": "Athletic imbattibile!",
    "ko": "Mi serve un panino..."
  },
  "audio": {
    "spawn": "audio/tommy_guardu/spawn.mp3",
    "win": "audio/tommy_guardu/win.mp3",
    "ko": "audio/tommy_guardu/ko.mp3"
  }
}
```

---

## 2️⃣ CREARE GLI AUDIO FILES

### Struttura:
```
/assets
  /audio
    /nicola
      spawn.mp3
      win.mp3
      ko.mp3
    /fracks
      spawn.mp3
      win.mp3
      ko.mp3
    /tommy_guardu
      ...
    (una cartella per ogni personaggio)
    
    /spells
      canna.mp3
      caffe_porto_tonic.mp3
      fernet_cola.mp3
```

### Come registrare:
1. **Software**: Audacity (gratis) o Voice Memos su phone
2. **Formato**: 44.1kHz, mono, MP3 128kbps
3. **Lunghezza**: Max 2.5 secondi (ideale 1-2s)
4. **Processing**:
   - Normalizza a -1dB
   - Taglia silenzi prima/dopo
   - Export MP3

### Battute da registrare per OGNI personaggio:
- **spawn.mp3**: Frase quando esce in campo (es: "Tranquilli, fixo tutto!")
- **win.mp3**: Frase quando vinci (es: "Ottimizzato pure il Bar!")
- **ko.mp3**: Frase quando muore (es: "Era la cache, giuro...")

### Tips:
- Puoi registrare tu imitando i vari personaggi
- Oppure chiedi agli amici di registrare le LORO battute (più autent ico!)
- Oppure usa AI voice generator (ElevenLabs, Play.ht)
- Tieni tono scherzoso e leggero

---

## 3️⃣ AGGIUNGERE SPRITE/ICONE

### Opzioni:

#### A) Placeholder Emoji (Quick Start)
Nel JSON ho già messo emoji placeholders:
- Nicola: 💻
- Fracks: 🏛️
- Tommy: 💪
- etc.

**Questa è OK per testare subito!**

#### B) Foto Profilo Reali
1. Usa foto profilo dei ragazzi
2. Crop cerchio 200x200px
3. Salva in `/assets/sprites/{id}.png`
4. Update JSON: `"sprite": "assets/sprites/nicola.png"`

#### C) AI Generated Cartoon (Figata)
1. Usa Replicate API o DALL-E
2. Prompt: "cartoon character of [nome], style clash royale, full body, dynamic pose"
3. Edit e salva sprite
4. Update JSON

---

## 4️⃣ COMPLETARE I FILE CONSUMABILI

### File: `data/wirc-spells.json`

```json
{
  "spells": [
    {
      "id": "canna",
      "nome": "Canna",
      "costo_birra": 3,
      "effetto": "ApplyChill",
      "descrizione": "Zona fumosa: -25% velocità e -15% DPS ai nemici per 6s.",
      "durata_sec": 6,
      "raggio": 140,
      "audio": "audio/spells/canna.mp3"
    },
    {
      "id": "caffe_porto_tonic",
      "nome": "Caffè Porto Tonic",
      "costo_birra": 2,
      "effetto": "Haste",
      "descrizione": "+30% velocità e +20% ricarica abilità agli alleati in area per 5s.",
      "durata_sec": 5,
      "raggio": 120,
      "audio": "audio/spells/caffe_porto_tonic.mp3"
    },
    {
      "id": "fernet_cola",
      "nome": "Fernet & Cola",
      "costo_birra": 4,
      "effetto": "PurgeHeal",
      "descrizione": "Cura 250HP e rimuove debuff agli alleati in area.",
      "raggio": 110,
      "audio": "audio/spells/fernet_cola.mp3"
    }
  ]
}
```

Crea questo file e aggiungilo alla cartella `data/`.

---

## 5️⃣ GAME ENGINE (PHASER 3)

### Cosa NON ho fatto (serve sviluppo completo):

Il vero game engine Phaser richiede:
- Setup Phaser 3 + TypeScript
- Scene system (Boot, Menu, Match)
- Physics + Collision
- Pathfinding A*
- Network multiplayer
- Audio system
- Particle effects
- UI in-game

### Opzioni:

#### A) Tu lo fai (se sai TypeScript)
1. Installa Phaser: `npm install phaser`
2. Setup TypeScript
3. Segui la struttura che ti ha dato ChatGPT
4. Tempo stimato: **40-80 ore**

#### B) Lo chiedi a ChatGPT (o a me dopo)
1. Chiedi a ChatGPT di scrivere il game engine completo
2. Forniscigli i JSON
3. Implementa pezzo per pezzo
4. Test e debug

#### C) Usa un Template (Più veloce)
1. Cerca "Phaser 3 tower defense template" su GitHub
2. Adatta al tuo gioco
3. Sostituisci assets e logic
4. Tempo stimato: **10-20 ore**

---

## 6️⃣ COLLEGAMENTI NAVBAR

### File da modificare: `resources/navbar.js`

Aggiungi link a Wirc Royale nel menu:

```javascript
// Cerca la sezione desktop links
const desktopNav = `
  ...
  <a class="nav-link" href="wirc-royale.html">
    <span class="nav-icon">🍺</span>
    <span class="nav-label">Wirc Royale</span>
  </a>
  ...
`;
```

Oppure aggiungi bottone nel **Profilo** (profile.html):

```html
<a href="wirc-royale.html" class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  🍺 Gioca a Wirc Royale
</a>
```

---

## 7️⃣ FIREBASE SETUP (Multiplayer)

### Per Online 1v1:

1. **Firestore Rules** (`firestore.rules`):
```
match /wirc_matches/{matchId} {
  allow read, write: if request.auth != null;
}

match /wirc_queues/1v1 {
  allow read, write: if request.auth != null;
}
```

2. **Deploy rules**:
```bash
firebase deploy --only firestore
```

3. **Matchmaking Logic**:
- User entra in queue: `wirc_queues/1v1/users/{uid}`
- Cloud Function abbina 2 users
- Crea match: `wirc_matches/{matchId}`
- Client ascolta `/wirc_matches/{matchId}/commands`

---

## 8️⃣ PWA + DOMINIO

### PWA (già fatto per Fanta Athletic):
- manifest.json ✅
- service-worker.js ✅
- Icons ✅

### Dominio nuovo (opzionale):
1. Compra `wircroyale.it` o `wircroyale.com` su Namecheap
2. Firebase Hosting → Add custom domain
3. DNS: CNAME → `fanta-athletic.web.app`

---

## 📊 PRIORITÀ

### 🔴 URGENTE (per testare):
1. Completa `wirc-cards.json` con tutte le 40+ carte
2. Aggiungi audio placeholder (anche 1 solo file ripetuto va bene per test)
3. Crea `wirc-spells.json`

### 🟡 IMPORTANTE (per demo):
4. Registra audio veri per top 10 personaggi
5. Aggiungi sprite/foto
6. Collega navbar

### 🟢 NICE TO HAVE (per produzione):
7. Game engine Phaser completo
8. Multiplayer online
9. Dominio dedicato
10. AI voice professional

---

## 🎯 QUICK START (10 minuti)

1. **Copia tutto il JSON di ChatGPT** in `data/wirc-cards.json`
2. **Crea `data/wirc-spells.json`** (copia da sopra)
3. **Test landing page**: Apri `wirc-royale.html` nel browser
4. **Test gallery**: Apri `wirc-card-gallery.html`

✅ Funziona? OK! Ora puoi:
- Registrare audio
- Aggiungere sprite
- Sviluppare game engine

---

## 💬 COSA POSSO FARE IO DOPO

Una volta che hai completato:
1. ✅ JSON completo
2. ✅ Audio registrati
3. ✅ Sprite aggiunti

Posso:
- Implementare Deck Builder completo
- Creare match simulator vs Bot
- Setup Firebase multiplayer
- Ottimizzare UI/UX
- Implementare sistema Fritzelle
- Creare sistema tornei

**MA PRIMA SERVE CHE TU COMPLETI I PUNTI 1-3!**

---

## 🔗 FILES CREATI PER TE

1. **`wirc-royale.html`** - Landing page principale ✅
2. **`wirc-card-gallery.html`** - Galleria carte ✅
3. **`data/wirc-cards.json`** - Template dati (DA COMPLETARE)
4. **`WIRC_ROYALE_TODO.md`** - Questo documento ✅

---

## 📞 PROSSIMI STEP

1. Leggi questo documento
2. Completa il JSON con le 40+ carte
3. Crea almeno 5-10 audio files di test
4. Dimmi quando è pronto
5. Procediamo con game engine!

**FORZA CIRCOLO!** 🍺⚽🎮
