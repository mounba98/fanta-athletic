# 🏀🏐 FORMAZIONI FLESSIBILI MULTI-SPORT

## 📋 OVERVIEW

Sistema formazioni adattabile per leghe con **pochi giocatori** o **regole custom**.
Ogni lega può scegliere numero titolari (3-7) e sistema punteggio H2H.

---

## 🏀 BASKET - CONFIGURAZIONI

### **Config 1: Basket 5v5 (Standard)**
```json
{
  "name": "Basket 5v5",
  "starters": 5,
  "bench": 3,
  "positions": ["PG", "SG", "SF", "PF", "C"],
  "lineup": {
    "PG": 1,
    "SG": 1,
    "SF": 1,
    "PF": 1,
    "C": 1
  }
}
```

### **Config 2: Basket 3v3 (Mini)**
```json
{
  "name": "Basket 3v3",
  "starters": 3,
  "bench": 2,
  "positions": ["GUARD", "FORWARD", "CENTER"],
  "lineup": {
    "GUARD": 1,
    "FORWARD": 1,
    "CENTER": 1
  }
}
```

### **Config 3: Basket 4v4 (Medio)**
```json
{
  "name": "Basket 4v4",
  "starters": 4,
  "bench": 2,
  "positions": ["G", "G/F", "F", "C"],
  "lineup": {
    "G": 1,
    "G/F": 1,
    "F": 1,
    "C": 1
  }
}
```

---

## 🏐 VOLLEY - CONFIGURAZIONI

### **Config 1: Volley 6v6 (Standard)**
```json
{
  "name": "Volley 6v6",
  "starters": 6,
  "bench": 3,
  "positions": ["P", "S", "S", "O", "C", "L"],
  "lineup": {
    "P": 1,
    "S": 2,
    "O": 1,
    "C": 1,
    "L": 1
  }
}
```

### **Config 2: Volley 4v4 (Beach)**
```json
{
  "name": "Beach Volley 4v4",
  "starters": 4,
  "bench": 2,
  "positions": ["ATT", "ATT", "DEF", "DEF"],
  "lineup": {
    "ATT": 2,
    "DEF": 2
  }
}
```

### **Config 3: Volley 5v5 (Medio)**
```json
{
  "name": "Volley 5v5",
  "starters": 5,
  "bench": 2,
  "positions": ["P", "S", "O", "C", "L"],
  "lineup": {
    "P": 1,
    "S": 1,
    "O": 1,
    "C": 1,
    "L": 1
  }
}
```

---

## ⚽ CALCIO - CONFIGURAZIONI (Bonus)

### **Config 1: Calcio 11v11 (Standard)**
```json
{
  "name": "Calcio 11v11",
  "starters": 11,
  "bench": 7,
  "positions": ["P", "D", "D", "D", "D", "C", "C", "C", "C", "A", "A"],
  "lineup": {
    "P": 1,
    "D": 4,
    "C": 4,
    "A": 2
  }
}
```

### **Config 2: Calcio 8v8 (Mini)**
```json
{
  "name": "Calcio 8v8",
  "starters": 8,
  "bench": 4,
  "positions": ["P", "D", "D", "C", "C", "C", "A", "A"],
  "lineup": {
    "P": 1,
    "D": 2,
    "C": 3,
    "A": 2
  }
}
```

---

## 🎯 SISTEMA H2H PUNTEGGI

### **Basket: Sistema "Canestri"**
**Formula**: `Canestri = floor(Punti / 4)`
- 0-3 punti = 0 canestri
- 4-7 punti = 1 canestro
- 8-11 punti = 2 canestri
- 12-15 punti = 3 canestri
- etc.

**Esempio**:
- Squadra A: 78 punti → 19 canestri
- Squadra B: 65 punti → 16 canestri
- **Risultato H2H**: 19-16

### **Volley: Sistema "Set"**
**Formula**: `Set = floor(Punti / 25)`
- 0-24 punti = 0 set
- 25-49 punti = 1 set
- 50-74 punti = 2 set
- 75-99 punti = 3 set

**Vittoria**: Chi vince 3 set per primo
**Esempio**:
- Squadra A: 82 punti → 3 set
- Squadra B: 58 punti → 2 set
- **Risultato H2H**: 3-2

### **Calcio: Sistema "Gol" (già esistente)**
**Formula**: `Gol = floor((Punti - 66) / 4)`
- 66 punti = 0 gol (pareggio base)
- 70 punti = 1 gol
- 74 punti = 2 gol
- etc.

---

## 🔧 IMPLEMENTAZIONE DATABASE

### **Firestore Schema**
```javascript
leagues/{leagueId}
  - sport: "basket" | "volley" | "calcio"
  - lineupConfig: {
      name: "Basket 5v5",
      starters: 5,
      bench: 3,
      positions: ["PG", "SG", "SF", "PF", "C"],
      lineup: { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 }
    }
  - h2hSystem: {
      type: "canestri" | "set" | "gol",
      formula: "floor(points / 4)",
      winThreshold: null | 3  // null per basket, 3 per volley
    }
```

### **UI Creazione Lega**
```html
<select id="sportSelect">
  <option value="calcio">⚽ Calcio</option>
  <option value="basket">🏀 Basket</option>
  <option value="volley">🏐 Volley</option>
</select>

<select id="lineupConfig">
  <!-- Basket -->
  <option value="basket_5v5">Basket 5v5 (Standard)</option>
  <option value="basket_4v4">Basket 4v4 (Medio)</option>
  <option value="basket_3v3">Basket 3v3 (Mini)</option>
  
  <!-- Volley -->
  <option value="volley_6v6">Volley 6v6 (Standard)</option>
  <option value="volley_5v5">Volley 5v5 (Medio)</option>
  <option value="volley_4v4">Beach Volley 4v4</option>
</select>

<select id="h2hSystem">
  <option value="canestri">Canestri (Basket)</option>
  <option value="set">Set (Volley)</option>
  <option value="gol">Gol (Calcio)</option>
</select>
```

---

## 📊 CALCOLO H2H

### **Funzione Universale**
```javascript
function calculateH2H(pointsA, pointsB, h2hSystem) {
  let scoreA, scoreB;
  
  switch(h2hSystem.type) {
    case 'canestri':
      scoreA = Math.floor(pointsA / 4);
      scoreB = Math.floor(pointsB / 4);
      break;
      
    case 'set':
      scoreA = Math.floor(pointsA / 25);
      scoreB = Math.floor(pointsB / 25);
      // Limita a max 3 set
      scoreA = Math.min(scoreA, 3);
      scoreB = Math.min(scoreB, 3);
      break;
      
    case 'gol':
      scoreA = Math.floor((pointsA - 66) / 4);
      scoreB = Math.floor((pointsB - 66) / 4);
      // Min 0 gol
      scoreA = Math.max(scoreA, 0);
      scoreB = Math.max(scoreB, 0);
      break;
  }
  
  return { scoreA, scoreB };
}
```

---

## 🎨 UI FORMAZIONI DINAMICHE

### **Render Slot Dinamico**
```javascript
function renderLineupSlots(lineupConfig) {
  const container = document.getElementById('lineupGrid');
  container.innerHTML = '';
  
  Object.entries(lineupConfig.lineup).forEach(([position, count]) => {
    for (let i = 0; i < count; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.position = position;
      slot.innerHTML = `
        <div class="slot-label">${position}</div>
        <div class="player-name">-</div>
      `;
      container.appendChild(slot);
    }
  });
}
```

---

## 🚀 VANTAGGI

✅ **Flessibilità**: Leghe da 3 a 11 titolari
✅ **Scalabilità**: Adatta a pochi giocatori disponibili
✅ **Realismo**: Sistema H2H sport-specifico
✅ **Vendibilità**: Più opzioni = più utenti
✅ **Semplicità**: Config JSON facile da gestire

---

## 📝 TODO IMPLEMENTAZIONE

1. **UI Creazione Lega** (2h)
   - Dropdown sport + config lineup
   - Preview formazione dinamica
   - Selezione sistema H2H

2. **Firestore Schema** (1h)
   - Aggiungi campi lineupConfig + h2hSystem
   - Migration leghe esistenti

3. **Formazioni Dinamiche** (3h)
   - Render slot basato su config
   - Validazione posizioni
   - Salvataggio formazione

4. **Calcolo H2H** (2h)
   - Funzione universale
   - Integrazione classifiche
   - Test tutti sistemi

5. **Testing** (2h)
   - Test 3v3, 4v4, 5v5, 6v6
   - Test H2H canestri/set/gol
   - Mobile responsive

**Totale**: ~10h implementazione completa

---

## 💡 ESEMPI USO

**Lega Basket Amatoriale** (8 giocatori disponibili)
- Config: Basket 4v4
- H2H: Canestri
- Roster: 4 titolari + 2 panchina

**Lega Beach Volley** (6 giocatori)
- Config: Beach Volley 4v4
- H2H: Set
- Roster: 4 titolari + 2 panchina

**Lega Calcetto** (10 giocatori)
- Config: Calcio 8v8
- H2H: Gol
- Roster: 8 titolari + 4 panchina

---

**🎯 READY FOR IMPLEMENTATION!**
