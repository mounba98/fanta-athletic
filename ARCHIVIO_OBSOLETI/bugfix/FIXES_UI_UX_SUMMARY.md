# 🎨 UI/UX Fixes Summary - Fanta Athletic

## Data: 2025-10-24

---

## ✅ FIX COMPLETATI E DEPLOYATI

### 1. **Selettore Lega - "Nessuna lega" ❌→✅**
**Problema**: Selettore mostrava "Nessuna lega" anche quando l'utente aveva leghe.

**Soluzione**:
- Aggiunto controllo: se `userLeagues.length === 0`, non renderizzare il selettore
- Evita rendering prematuro mentre carica i dati

```javascript
if (userLeagues.length === 0) {
  console.warn('[LEAGUE-SELECTOR] No leagues found, skipping render');
  return;
}
```

**File**: `resources/league-selector.js` - Linee 35-39

---

### 2. **Selettore Lega sopra Menu Hamburger ❌→✅**
**Problema**: z-index 9999 faceva rimanere il selettore sopra il menu hamburger mobile.

**Soluzione**:
- Ridotto z-index da 9999 a 100
- Menu hamburger ha z-index più alto (1000+)

```css
.league-selector {
  z-index: 100;  /* Era 9999 */
}
```

**File**: `resources/league-selector.js` - Linea 569

---

### 3. **"Nessuna Squadra" in Home ❌→✅**
**Problema**: Home mostrava "Nessuna squadra" invece del nome team corretto.

**Soluzione**:
- Aumentato tempo di attesa per `window.currentLeague` (da 5s a 10s)
- Aggiunto fallback per caricare lega da `localStorage` se non trovata
- Carica direttamente da Firestore se `last_league_id` esiste

```javascript
// Aspetta che window.currentLeague sia caricata (max 10s)
let attempts = 0;
while (!window.currentLeague && attempts < 100) {
  await new Promise(r => setTimeout(r, 100));
  attempts++;
}

// Fallback: carica da localStorage
if (!window.currentLeague) {
  const lastLeagueId = localStorage.getItem('last_league_id');
  if (lastLeagueId) {
    const leagueDoc = await firebase.firestore()
      .collection('leagues')
      .doc(lastLeagueId)
      .get();
    if (leagueDoc.exists) {
      window.currentLeague = { id: leagueDoc.id, ...leagueDoc.data() };
    }
  }
}
```

**File**: `index.html` - Linee 251-276

---

## ⚠️ FIX DA IMPLEMENTARE

### 4. **Ultimi 5 Risultati - Mostrare Punteggi ⏳**
**Problema**: Widget "Ultimi 5 Risultati" non esiste ancora o non mostra i punteggi.

**Soluzione necessaria**:
1. Verificare se esiste widget in `index.html`
2. Query Firestore: `results/{giornata}/teams/{teamId}`
3. Estrarre ultimi 5 punteggi ordinati per giornata
4. Mostrare formato: `G15: 76pt | G14: 82pt | G13: 68pt...`

**Query da implementare**:
```javascript
const last5 = await firebase.firestore()
  .collection('results')
  .where('teamId', '==', myTeamId)
  .orderBy('giornata', 'desc')
  .limit(5)
  .get();

last5.docs.forEach(doc => {
  const data = doc.data();
  console.log(`${data.giornata}: ${data.totalPoints}pt`);
});
```

**File da modificare**: `index.html` (aggiungere widget)

---

### 5. **Classifica PC - Punti tutti a 0 ⏳**
**Problema**: `classifiche.html` mostra tutti i team con 0 punti invece dei punti corretti.

**Causa probabile**:
- Query Firestore non trova i dati `results/{giornata}/teams/{teamId}`
- Oppure calcolo punti non funziona
- Oppure struttura dati cambiata

**Debug necessario**:
```javascript
console.log('🔍 Results data:', state.results);
console.log('🔍 Teams data:', state.teams);

// Verificare struttura:
// results/{giornataId}/teams/{teamId} = { totalPoints, ... }
```

**Soluzione**:
1. Controllare console log in `classifiche.html`
2. Verificare struttura dati Firestore
3. Assicurarsi che `matchday.html` salvi correttamente i punti
4. Fix query o calcolo punti

**File da analizzare**: `classifiche.html`

---

### 6. **Widget Classifica Mobile - Non si aggiorna ⏳**
**Problema**: Su mobile, widget sotto "La mia squadra" mostra dati vecchi.

**Descrizione**:
- C'è un piccolo widget/card che mostra info classifica
- Non si aggiorna in real-time
- Probabilmente usa dati cached o non ascolta Firestore

**Soluzione necessaria**:
1. Trovare widget in `index.html` o file mobile-specifico
2. Aggiungere listener Firestore real-time:
```javascript
firebase.firestore()
  .collection('standings')
  .doc(leagueId)
  .onSnapshot(doc => {
    // Aggiorna widget
    updateStandingsWidget(doc.data());
  });
```

**File da analizzare**: `index.html`, `resources/mobile-dashboard.js`

---

## 📊 Riepilogo Status

| Fix | Status | File | Priorità |
|-----|--------|------|----------|
| 1. Selettore "Nessuna lega" | ✅ FATTO | league-selector.js | 🔴 Alta |
| 2. Z-index selettore vs menu | ✅ FATTO | league-selector.js | 🔴 Alta |
| 3. "Nessuna squadra" in home | ✅ FATTO | index.html | 🔴 Alta |
| 4. Ultimi 5 risultati punteggi | ⏳ DA FARE | index.html | 🟡 Media |
| 5. Classifica punti tutti a 0 | ⏳ DA FARE | classifiche.html | 🔴 Alta |
| 6. Widget mobile classifica | ⏳ DA FARE | index.html | 🟡 Media |

---

## 🚀 Deploy

**Status**: ✅ DEPLOYATO  
**URL**: https://fanta-athletic.web.app  
**Versione**: 2025102409

**Fix Deployati**: 1, 2, 3  
**Fix Rimanenti**: 4, 5, 6

---

## 🔍 Next Steps per Completare

### Per Fix 4 (Ultimi 5 Risultati):
1. Aprire `index.html`
2. Cercare o creare widget "Ultimi 5 risultati"
3. Query last 5 giornate calcolate
4. Mostrare punteggi

### Per Fix 5 (Classifica Punti):
1. Aprire `classifiche.html`
2. Controllare console log
3. Verificare query `results/{giornata}/teams/{teamId}`
4. Fix calcolo o query

### Per Fix 6 (Widget Mobile):
1. Trovare widget mobile in `index.html`
2. Aggiungere listener Firestore real-time
3. Testare su mobile

---

**Note**: I fix 1-3 sono stati completati e deployati. I fix 4-6 richiedono analisi più approfondita dei file specifici per capire la struttura dati e implementare le correzioni necessarie.
