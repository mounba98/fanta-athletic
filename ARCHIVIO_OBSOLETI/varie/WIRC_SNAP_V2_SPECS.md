# 🎮 WIRC SNAP V2 - SPECIFICHE MARVEL SNAP STYLE

**Data**: 21 Ottobre 2025, ore 23:00  
**Richiesta**: Rifare con layout Marvel Snap

---

## 📱 LAYOUT RICHIESTO (da screenshot)

### Header
- **Sinistra**: Avatar esagonale opponent + nome
- **Centro**: SNAP counter (8 MAX) con glow animation
- **Destra**: Avatar esagonale player + nome

### Stats Bar
- **Sinistra**: Timer 1:00 (countdown)
- **Centro**: Turno X/6
- **Destra**: Energia ⚡ X

### Battlefield (3 Location verticali)
Ogni location:
1. **Opponent Zone**: 4 slot cards (grid 2x2 o 4x1)
2. **Location Card**: Grande, centrale, cliccabile
   - Nome location
   - Effetto descrizione
   - Power totale (numero grande)
3. **Player Zone**: 4 slot cards (grid 2x2 o 4x1)
4. **Score Bar**: Punti opponent vs player

### Hand (bottom)
- 4-6 carte visibili
- Grid 4 colonne
- Carte GRANDI leggibili

### Controls
- Pulsante "FINE TURNO" largo

---

## 🎯 FEATURES RICHIESTE

### 1. Layout Mobile-First
- Max width 500px anche su desktop
- Tutto verticale
- Cards grandi e leggibili
- Click su carta → detail modal

### 2. Timer
- Countdown 1 minuto
- Warning animato ultimi 10 secondi
- Auto-pass se scade tempo

### 3. SNAP System
- Valuta iniziale: 8
- Si scommette ogni partita
- Vinci → +SNAP
- Perdi → -SNAP
- Classifica basata su SNAP

### 4. Detail Modal
- Click su carta → mostra GRANDE
- Nome, emoji, stats, effetto completo
- Click su location → mostra effetto completo

### 5. Victory Conditions
- Vince chi controlla 2/3 location
- In caso pareggio → conta differenza punti totale
- Modal vittoria con stats

### 6. Cards
- 30 personaggi WIRC
- Max 4 cards per location
- Effetti "Continuo" e "Alla Scoperta"
- Stats: Costo, Forza

### 7. Locations
- 12 locations disponibili
- 3 random per partita
- Effetti unici per location
- Power display real-time

---

## 🎨 STYLE GUIDE

### Colors
- Background: Dark gradient (#0a0e27 → #1a1f3a)
- Primary: Crimson red (#dc143c)
- Secondary: Gold (#fbbf24)
- Player: Green (#22c55e)
- Opponent: Red (#ef4444)
- Energy: Blue (#3b82f6)

### Animations
- SNAP counter: pulse glow
- Timer warning: blink red
- Card hover: lift + glow
- Card select: green border glow
- Victory: bounce title

### Typography
- Headings: 900 weight, uppercase
- Body: 700 weight
- Effects: 400 weight, italic
- Monospace for numbers

---

## 🧩 COMPONENTS

### Avatar (Hexagon)
```css
clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
border: 3px solid #fbbf24;
width: 50px;
height: 50px;
```

### Card
- Border radius: 12px
- Cost badge: top-left circle
- Power badge: top-right circle
- Emoji: center large
- Name: below emoji, gold
- Effect: bottom, small, gray

### Location Card
- Bigger than regular cards
- Gradient background red
- Name uppercase center
- Effect italic center
- Power badge top-right
- Click → detail

### Score Display
- Opponent left (red)
- Player right (green)
- Winner badge center (gold)

---

## ⚙️ GAME LOGIC

### Turn Flow
1. Start turn: energy +1, draw 1 card
2. Timer starts 60s
3. Player plays cards (click card → select location)
4. Click "Fine Turno" or timer ends
5. Opponent AI turn
6. Check turn 6 → calculate winner

### AI Logic
- Play random affordable cards
- Prioritize locations with most cards
- Max 4 cards per location

### Victory Check
1. Count location winners (higher power)
2. If 2/3 → winner
3. If tie → sum all powers, higher wins
4. Update SNAP (±1-3 based on game)

---

## 📝 TODO IMPLEMENTAZIONE

### File Structure
```
wirc-snap-v2.html (nuovo file pulito)
- HTML structure
- CSS inline styles
- JavaScript game logic
- 30 cards data
- 12 locations data
```

### Priority Features
1. ✅ Layout mobile-first
2. ✅ 3 locations verticali
3. ✅ 4 cards max per location
4. ✅ Hand 4-6 cards
5. ✅ Detail modal click
6. ⏳ Timer countdown
7. ⏳ SNAP system
8. ⏳ AI logic improved
9. ⏳ Victory with tiebreaker
10. ⏳ Animations polish

---

## 🚀 DEPLOY PLAN

### Fase 1 (Stanotte - se possibile)
- Layout base corretto
- Cards + locations visible
- Basic gameplay funzionante

### Fase 2 (Domani)
- Timer implementato
- SNAP system completo
- AI migliorato
- Animations polish
- Sound effects (opzionale)

### Fase 3 (Futuro)
- Multiplayer Firebase
- Deck builder
- Card unlock system
- Ranking/leaderboard

---

**STATUS**: Specifiche complete  
**Prossimo step**: Implementazione file nuovo pulito

**Tempo stimato**: 1-2 ore sviluppo concentrato domani mattina
