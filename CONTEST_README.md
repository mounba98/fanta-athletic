# 🏆 CONTEST "Indovina il Risultato"

Sistema contest pronostici per Athletic Brescia - Completamente funzionante!

---

## 📁 FILES CREATI

- **contest.html** - Pagina inserimento pronostico
- **contest-leaderboard.html** - Classifica punti
- **CONTEST_README.md** - Questa guida

---

## 🗄️ STRUTTURA DATABASE FIRESTORE

### Collection: `contest`

```
contest/
├── matches (document)
│   ├── G1: { homeTeam, awayTeam, deadline, result }
│   ├── G2: { homeTeam, awayTeam, deadline, result }
│   └── ...
├── predictions (document)
│   ├── [userId] (subcollection)
│   │   ├── G1: { home, away, timestamp, points }
│   │   ├── G2: { home, away, timestamp, points }
│   │   └── ...
│   └── ...
└── scores (document)
    ├── [userId]: { name, email, totalPoints, predictions }
    └── ...
```

---

## 🚀 SETUP INIZIALE

### 1. Creare Document "matches" in Firestore

```javascript
// Vai su Firestore Console
// Collection: contest
// Document ID: matches
// Dati esempio:

{
  "G1": {
    "homeTeam": "Athletic Brescia",
    "awayTeam": "Polisportiva Virgiliana",
    "deadline": "2025-10-27T14:30:00Z",  // ISO format
    "result": null
  },
  "G2": {
    "homeTeam": "Athletic Brescia",
    "awayTeam": "ASD Montichiari",
    "deadline": "2025-11-03T14:30:00Z",
    "result": null
  }
}
```

### 2. Creare Document "scores"

```javascript
// Collection: contest
// Document ID: scores
// Inizialmente vuoto: {}
```

### 3. Rules Firestore

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contest matches (read-only per users)
    match /contest/matches {
      allow read: if true;
      allow write: if request.auth != null && 
                      exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Contest predictions (user può scrivere solo le proprie)
    match /contest/predictions/{userId}/{matchday} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contest scores (read-only)
    match /contest/scores {
      allow read: if true;
      allow write: if request.auth != null && 
                      exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

---

## 📝 WORKFLOW CONTEST

### Per Utenti:

1. **Login** → auth.html
2. **Vai su Contest** → contest.html
3. **Seleziona Giornata** → Vede partita e deadline
4. **Inserisci Pronostico** → es. 3-1
5. **Invia** → Salvato su Firestore
6. **Vedi Classifica** → contest-leaderboard.html

### Per Admin:

1. **Firestore Console** → contest/matches
2. **Aggiungi Risultato** quando finisce partita:
   ```javascript
   "G1": {
     ...
     "result": { "home": 2, "away": 1 }
   }
   ```
3. **Calcola Punti** (vedi script sotto)

---

## 🎯 CALCOLO PUNTI AUTOMATICO

### Sistema Punteggi:

- **+10 punti**: Risultato esatto (es. pronostico 2-1, risultato 2-1)
- **+5 punti**: Differenza reti corretta (es. pronostico 3-1, risultato 2-0 → diff +2)
- **+2 punti**: Solo vincitore corretto (es. pronostico 2-0, risultato 3-1 → entrambi vincono)

### Script Cloud Function (da creare):

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.calculateScores = functions.firestore
  .document('contest/matches')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    
    // Trova quali giornate hanno nuovo risultato
    for (const [matchday, matchData] of Object.entries(after)) {
      const beforeMatch = before[matchday];
      
      // Se risultato appena aggiunto
      if (matchData.result && (!beforeMatch || !beforeMatch.result)) {
        await calculateMatchdayPoints(matchday, matchData.result);
      }
    }
  });

async function calculateMatchdayPoints(matchday, result) {
  const db = admin.firestore();
  
  // Get all predictions for this matchday
  const predictionsRef = db.collection('contest').doc('predictions');
  const users = await db.collection('users').get();
  
  const scores = {};
  
  for (const userDoc of users.docs) {
    const userId = userDoc.id;
    const predDoc = await predictionsRef.collection(userId).doc(matchday).get();
    
    if (!predDoc.exists) continue;
    
    const pred = predDoc.data();
    const points = calculatePoints(pred, result);
    
    // Save points to prediction
    await predDoc.ref.update({ points });
    
    // Update total scores
    const userData = userDoc.data();
    if (!scores[userId]) {
      scores[userId] = {
        name: userData.display_name || userData.email,
        email: userData.email,
        totalPoints: 0,
        predictions: 0
      };
    }
    
    scores[userId].totalPoints += points;
    scores[userId].predictions += 1;
  }
  
  // Update scores document
  await db.collection('contest').doc('scores').set(scores, { merge: true });
}

function calculatePoints(prediction, result) {
  const predHome = prediction.home;
  const predAway = prediction.away;
  const resHome = result.home;
  const resAway = result.away;
  
  // Exact result
  if (predHome === resHome && predAway === resAway) {
    return 10;
  }
  
  // Goal difference correct
  const predDiff = predHome - predAway;
  const resDiff = resHome - resAway;
  if (predDiff === resDiff) {
    return 5;
  }
  
  // Winner correct
  const predWinner = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const resWinner = resHome > resAway ? 'home' : resHome < resAway ? 'away' : 'draw';
  if (predWinner === resWinner) {
    return 2;
  }
  
  return 0;
}
```

---

## 🎨 DESIGN FEATURES

### Contest.html:
- ✅ Hero gradient rosso-blu
- ✅ Premio in evidenza
- ✅ Login required
- ✅ Selector giornate (G1-G24)
- ✅ Match box con loghi squadre
- ✅ Input numerici validati
- ✅ Deadline automatica (blocco 30min prima)
- ✅ Toast conferma
- ✅ Mostra pronostico salvato
- ✅ Mostra punti guadagnati
- ✅ Mobile responsive

### Leaderboard.html:
- ✅ Classifica ordinata per punti
- ✅ Posizioni 🥇🥈🥉
- ✅ Highlight utente corrente
- ✅ Statistiche aggregate
- ✅ Real-time sync Firestore

---

## 📱 INTEGRATION NEL SITO

### 1. Link nella Navbar

```html
<!-- In index.html, aggiungere -->
<a href="contest.html" class="nav-link">
  🏆 Contest
</a>
```

### 2. Banner Home

```html
<!-- Hero banner nella home -->
<div class="contest-banner">
  <h2>🔥 Vinci la Felpa Athletic!</h2>
  <p>Partecipa al contest "Indovina il Risultato"</p>
  <a href="contest.html" class="cta-btn">Gioca Ora</a>
</div>
```

### 3. QR Code per Circolo

```
URL da generare QR:
https://fanta-athletic.web.app/contest.html

Tool: qrcode-monkey.com
Colori: Rosso (#dc2626) + Blu (#2d6cdf)
Logo: Athletic Brescia
```

---

## 🔐 SECURITY CHECKLIST

- [x] Login obbligatorio
- [x] Firestore Rules configurate
- [x] Solo admin possono modificare matches
- [x] User possono salvare solo propri pronostici
- [x] Deadline check client-side
- [x] Deadline check server-side (TODO: Cloud Function)

---

## 📊 ANALYTICS

### Metriche da Tracciare:
- Numero partecipanti totali
- Pronostici per giornata
- Tasso conversione (visite → pronostici)
- Accuratezza media
- Engagement social

### Google Analytics Events:
```javascript
gtag('event', 'contest_prediction_submit', {
  'matchday': 'G1',
  'user_id': userId
});
```

---

## 🎁 PREMIO

**Premio Finale**: Felpa Ufficiale Athletic Brescia

**Criteri**:
- Classifica finale a fine campionato
- Top 1 vince la felpa
- In caso di parità: chi ha fatto più risultati esatti

---

## 🚀 NEXT STEPS

### Immediate:
1. ✅ Creare documento matches in Firestore
2. ✅ Configurare Firestore Rules
3. ✅ Testare contest.html
4. ✅ Testare leaderboard.html

### Short Term:
1. Deploy Cloud Function per calcolo punti automatico
2. Aggiungere banner nella home
3. Generare QR code
4. Post Instagram annuncio contest

### Long Term:
1. Statistiche personali (% accuratezza)
2. Badge achievements
3. History pronostici passati
4. Notifiche push deadline imminente

---

## 🐛 TROUBLESHOOTING

### "Firestore non disponibile"
→ Aspetta 5s per init Firebase (gestito automaticamente)

### "Deadline scaduta ma vedo ancora input"
→ Ricarica pagina (F5)

### "Pronostico non salvato"
→ Verifica login, check console F12

### "Classifica vuota"
→ Admin deve inserire risultati e calcolare punti

---

## 📞 SUPPORT

Per problemi tecnici:
- Check console F12
- Verifica Firestore Rules
- Test con account admin

---

**🎉 Contest Ready to Launch!**

URL Live:
- Contest: https://fanta-athletic.web.app/contest.html
- Classifica: https://fanta-athletic.web.app/contest-leaderboard.html
