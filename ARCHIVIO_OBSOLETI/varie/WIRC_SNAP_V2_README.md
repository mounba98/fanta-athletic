# 🎮 WIRC SNAP v2.0 - Marvel Style Edition

**67 Carte | 9 Locations | Layout Orizzontale | Sistema Moltiplicativo**

---

## ✨ FEATURES IMPLEMENTATE

### 🎴 Sistema Carte (67 Totali)
- **Boss Cards**: Nico, Thanoisi, Il Pres, Fracks, Bezza, G-Cazzi
- **Componenti Moto**: 6 carte speciali per Thanoisi deck
- **Cast Principale**: 50+ personaggi WIRC (Tommy G, Wabione, Dux, Giabba, etc.)
- **Vanilla**: 10 carte base senza abilità

**Tipi Effetti**:
- `on_reveal` (20 carte): Si attivano quando giocate
- `ongoing` (12 carte): Effetto permanente (MOLTIPLICABILE!)
- `static` (10 carte): Condizionale
- `start_of_game` (2 carte): Iniziano partita con bonus

**Categorie**:
- Tech, Support, Tempo, Discard, Control, Ramp, Destroy, Chaos, Swarm, Zoo, Move, Combo

---

## 🗺️ Locations (9 Campi)

| Nome | Effetto | Reveal Turn |
|------|---------|-------------|
| **Bar WIRC** | Neutro | T1 |
| **Veranda** | Carte +1 forza | T2 |
| **Sala** | ON REVEAL x2 | T2 |
| **Chiringuito** | Mano -1 costo | T3 |
| **Doccia** | Damage -1 random | T2 |
| **Palestra** | Costo 3+ → +3 forza | T3 |
| **Angolo Rotture** | 50% +4 o distrutta | T2 |
| **Sala Musica** | ONGOING x2 ⚡ | T3 |
| **Esterno Sala** | Lock dopo T4 | T1 |

---

## 🎯 REGOLA MOLTIPLICATIVA (UNICA!)

**Gli effetti ONGOING si MOLTIPLICANO, non sommano!**

### Esempio Combo Devastante:
```javascript
Carta: Il Pres (+1 a tutte) = base +1
Location: Sala Musica (x2 ongoing)
Carta: Nico Cartonato (copia ongoing)

CALCOLO:
Base +1 → Sala Musica (x2) = +2
Nico copia Il Pres → altro +1 → Sala Musica (x2) = +2
TOTALE: +4 PER CARTA! 🚀

Se aggiungi Titti (+1 qui): +1 → x2 = +2
FINALE: +6 PER CARTA NEL CAMPO!
```

**Formula**: `Ongoing1 x Moltiplicatore1 + Ongoing2 x Moltiplicatore2 + ...`

---

## 🕹️ GAMEPLAY

### Flusso Turno:
1. **Inizio Turno**: +1 Energia (max 6)
2. **Azioni**: Gioca carte dalla mano (costo ≤ energia)
3. **Fine Turno**: AI gioca 1-2 carte
4. **Pesca**: +1 carta dal mazzo
5. **Reveal**: Location svelate in T1/T2/T3

### Layout Marvel Snap:
```
┌────────────────────────────────────────────┐
│ Turno 3/6 │ ⚡ 3/3 │ Tu: 0 | Avv: 0      │ HUD Top
├────────────────────────────────────────────┤
│   ┌───────┐   ┌───────┐   ┌───────┐       │
│   │  BAR  │   │VERANDA│   │ SALA  │       │
│   ├───────┤   ├───────┤   ├───────┤       │
│   │ Opp   │   │ Opp   │   │ Opp   │       │ Opponent Zone
│   │ [2x2] │   │ [2x2] │   │ [2x2] │       │
│   ├───────┤   ├───────┤   ├───────┤       │
│   │ You   │   │ You   │   │ You   │       │ Player Zone
│   │ [2x2] │   │ [2x2] │   │ [2x2] │       │
│   └───────┘   └───────┘   └───────┘       │
├────────────────────────────────────────────┤
│ [Carta1] [Carta2] [Carta3] [Fine Turno]   │ Hand + Button
└────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Marvel Style

### Colori Saturi:
- **Primario**: `#667eea` → `#764ba2` (Gradient viola)
- **Energia**: `#00E0FF` (Cyan neon)
- **Player**: `#00ff88` (Verde)
- **Opponent**: `#ff4444` (Rosso)

### Animazioni:
- **Card Draw**: Scale + Translate
- **Hover Card**: Lift + Glow
- **Rare Glow**: Pulsating gold border
- **On Reveal**: Flash effect (TODO)

### Carte:
- **Proporzione**: 2:3 (card vert)
- **Badge Costo**: Top-left arancione
- **Badge Power**: Top-right blu
- **Grid**: 2x2 per location (max 4 carte)

---

## 🛠️ CARD MAKER TOOL

**URL**: `/wirc-card-maker.html`

### Workflow AUTOMATICO (3h risparmiate!):
1. **Dropdown**: Scegli carta (67 disponibili)
2. **Auto-fill**: Nome/Costo/Power compilati ✨
3. **Upload**: Solo foto PNG/JPG
4. **Download**: Card con badge overlay

**Tempo**:
- Prima: 2min/card x 67 = **2h 14min**
- Ora: 30sec/card x 67 = **33min**
- **Risparmio: 1h 41min** 🚀

---

## 📁 FILES STRUCTURE

```
fantacalcio/
├── wirc-snap-full.html           # Game principale (v2.0)
├── wirc-card-maker.html          # Tool generazione card
├── data/
│   ├── wirc-snap-cards-full.json # 67 carte complete
│   ├── wirc-locations.json       # 9 campi
│   ├── wirc-abilities.json       # Pool effetti
│   └── wirc-config.json          # Config regole
└── WIRC_SNAP_V2_README.md        # Questo file
```

---

## 🚀 DEPLOYMENT

### Local Dev:
```bash
cd fantacalcio
firebase serve
# Apri: http://localhost:5000/wirc-snap-full.html
```

### Production:
```bash
firebase deploy --only hosting
# URL: https://fanta-athletic.web.app/wirc-snap-full.html
```

---

## 🔥 FIREBASE INTEGRATION (Ready)

### Auth:
- Login Google OAuth
- User profile con stats

### Firestore Schema (Prepared):
```javascript
wirc_snap_games/{gameId}
  - userId: string
  - userName: string
  - result: 'win' | 'loss' | 'draw'
  - playerScore: number (0-3)
  - opponentScore: number (0-3)
  - deck: array<string> (card names)
  - timestamp: Timestamp

wirc_snap_stats/{userId}
  - totalGames: number
  - wins: number
  - losses: number
  - draws: number
  - winRate: number
  - favoriteCard: string
  - mostPlayedLocation: string
```

### 1v1 Online (TODO):
```javascript
// Crea match
const matchRef = db.collection('wirc_matches').doc();
await matchRef.set({
  player1: userId,
  player2: null, // Waiting
  status: 'waiting',
  created: firebase.firestore.FieldValue.serverTimestamp()
});

// Join match
const matches = await db.collection('wirc_matches')
  .where('status', '==', 'waiting')
  .limit(1)
  .get();

// Real-time sync
matchRef.onSnapshot(snap => {
  const data = snap.data();
  // Update game state
});
```

---

## 📊 STATS & BALANCE

### Card Distribution:
- **Costo 1**: 4 carte (6%)
- **Costo 2**: 25 carte (37%) ← Bulk
- **Costo 3**: 24 carte (36%)
- **Costo 4**: 8 carte (12%)
- **Costo 5+**: 6 carte (9%) ← Boss

### Power/Cost Ratio:
- **Avg Cost**: 2.7
- **Avg Power**: 3.5
- **Ratio**: 1.3 (balanced)

### Type Distribution:
- **on_reveal**: 30 (45%)
- **ongoing**: 15 (22%)
- **static**: 12 (18%)
- **vanilla**: 10 (15%)

---

## 🎓 TUTORIAL (In-Game Coming)

### Turno 1:
1. **Energia**: Parti con 1/1
2. **Mano**: 3 carte iniziali
3. **Location**: Solo Bar WIRC rivelato
4. **Azione**: Gioca carta costo 1 (es. Wuenji, Bergit, Paolino)

### Turno 2:
1. **Energia**: 2/2
2. **Mano**: +1 carta (totale 3)
3. **Reveal**: Veranda + Sala
4. **Strategy**: Combo low cost o save energy

### Turno 3:
1. **Energia**: 3/3
2. **Reveal**: Sala Musica/Palestra/Chiringuito
3. **Power Plays**: ONGOING cards + location synergy

### Turno 4-6:
- **Boss Plays**: Thanoisi combo, Il Pres board buff
- **Control**: Chep, Momo disable ONGOING
- **Finisher**: Calculate winning locations

---

## 🧠 STRATEGY TIPS

### Deck Archetypes:

**1. ONGOING Stack** (Moltiplicativo!)
- Il Pres, Titti, Wabione, Fracks
- Win con Sala Musica location
- Nico Cartonato come copy

**2. On Reveal Spam**
- Trendiu (duplica reveal)
- Sala location (x2 reveal)
- Nico boss (copia tutti reveal)

**3. Discard/Ramp**
- Giabba, Ciorlas, Calo (discard)
- Toti, Marta, Santo (ramp)
- Late game domination

**4. Control**
- Chep, Momo (disable ongoing)
- Tapi (silence)
- Civi (debuff)

**5. Zoo/Swarm**
- Lil Swaolino (copy)
- Giulione (token)
- Pato, Mini Boro (cost 1 synergy)

---

## 🐛 KNOWN ISSUES (v2.0)

### TODO List:
- [ ] Implementa effetti carte completi (ora mock)
- [ ] Sistema moltiplicativo ONGOING nel codice
- [ ] Animazioni On Reveal (flash/particles)
- [ ] Sound effects (card play, win/loss)
- [ ] Mobile responsive (attualmente desktop-first)
- [ ] Snap/Retreat mechanics (Marvel Snap cubes)
- [ ] AI intelligente (ora random)
- [ ] 1v1 Online multiplayer
- [ ] Deck builder (scegli 12 carte)
- [ ] Achievements system

---

## 📝 CHANGELOG

### v2.0 (23 Oct 2025)
- ✅ 67 carte complete da JSON
- ✅ 9 locations con effetti
- ✅ Layout orizzontale Marvel Snap
- ✅ Card maker automatico
- ✅ Sistema base gameplay
- ✅ Firebase ready
- ✅ Modal card detail
- ✅ HUD top/bottom
- ✅ Animazioni base

### v1.0 (22 Oct 2025)
- ❌ 24 carte hardcoded
- ❌ Layout verticale mobile
- ❌ 8 locations
- ❌ No card maker

---

## 🏆 CREDITS

**Design**: Ispirato a Marvel Snap (Second Dinner)  
**Sviluppo**: WIRC Development Team  
**Carte**: Community WIRC personaggi reali  
**Testing**: Fanta Athletic crew  

**Special Thanks**:
- Nico (dev supremo)
- Simo (Thanoisi moto concept)
- Il Pres (boss card)
- Fracks (leader card)
- Tutti i 67 personaggi WIRC! 🎉

---

## 🔗 LINKS

**Game**: https://fanta-athletic.web.app/wirc-snap-full.html  
**Card Maker**: https://fanta-athletic.web.app/wirc-card-maker.html  
**Fanta Athletic**: https://fanta-athletic.web.app/  

---

**🎮 Buon gioco! Che la birra sia con te. 🍺**
