# WIRC SNAP - Marvel Style Refactor TODO

## 🎯 Obiettivo
Creare una versione mobile-first di WIRC Snap con stile Marvel Snap.

## 📋 Requisiti Chiave

### Layout
- ✅ 3 campi (locations) sempre visibili NO SCROLL
- ✅ Aspect ratio 9:16 (mobile vertical)
- ✅ Carte disposte sopra/sotto ogni campo
- ✅ Mano in basso con fan-out effect
- ✅ HUD top con Turn/Energy/Timer

### Stile Visivo
- **Palette**: #121220 (bg), #6C63FF, #FF0040, #00E0FF, #FFFFFF
- **Font**: Bebas Neue (titoli), Roboto Condensed (testo)
- **Effetti**: Depth glass, glow, neon, particles
- **Animazioni**: Tilt 3D, reveal, energy flow

### Interazioni
- Tap carta → Modal fullscreen dettagli
- Tap campo → Highlight pulsante
- End turn → Banner scroll orizzontale
- Match end → Results screen

### Extra
- Parallasse sfondo
- Bordi carte dinamici (blu/viola/oro)
- Stats con glow (blu=costo, rosso=forza)
- Particles luminose su campo attivo

## 📁 Files da Creare

1. **wirc-snap-marvel.html** - Main game HTML
2. **wirc-snap-marvel-styles.css** - All CSS separated
3. **wirc-snap-marvel-script.js** - Game logic

## 🚀 Implementation Plan

### Phase 1: HTML Structure ✅
- Auth screen
- Game screen container
- HUD top (turn/energy/timer/buttons)
- 3 Locations grid
- Hand area
- Modal overlay

### Phase 2: CSS Styling
- Marvel Snap color palette
- Glass morphism effects
- Neon gradients
- Card fan-out
- Animations (glow, pulse, reveal)

### Phase 3: JavaScript Logic
- Card database (24 WIRC characters)
- Game engine (turns, energy, effects)
- Drag & drop / Tap to play
- AI opponent
- Modal interactions

### Phase 4: Polish
- Particles effect
- Sound hooks (prepared)
- Smooth animations
- Mobile optimizations

## ⏰ Timeline
- Phase 1-2: 2h
- Phase 3: 3h
- Phase 4: 1h
- **Total**: ~6h

## 📝 Status
- [x] Requirements defined
- [ ] HTML structure
- [ ] CSS styling
- [ ] JS game logic
- [ ] Testing
- [ ] Deploy
