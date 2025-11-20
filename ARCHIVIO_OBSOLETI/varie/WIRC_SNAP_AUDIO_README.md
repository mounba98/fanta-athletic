# 🎵 WIRC SNAP AUDIO SYSTEM

Sistema audio completo per WIRC Snap v4.0

---

## 📁 STRUTTURA FILE

```
/sounds/
├── card_draw.mp3        # Pesca carta
├── card_play.mp3        # Gioca carta
├── card_drag.mp3        # Drag carta (sottile)
├── card_drop.mp3        # Drop carta
├── location_reveal.mp3  # Location rivelata
├── location_flip.mp3    # Location flip
├── turn_start.mp3       # Inizio turno
├── turn_end.mp3         # Fine turno
├── timer_warning.mp3    # Timer < 5s
├── snap.mp3             # SNAP!
├── retreat.mp3          # Retreat
├── victory.mp3          # Vittoria
├── defeat.mp3           # Sconfitta
├── button_click.mp3     # Click bottone
├── button_hover.mp3     # Hover bottone (opzionale)
├── modal_open.mp3       # Apri modal
└── modal_close.mp3      # Chiudi modal

/music/
├── game_music.mp3       # Musica di gioco (loop)
└── menu_music.mp3       # Musica menu (loop)
```

---

## 🎮 INTEGRAZIONE

### 1. HTML (wirc-snap.html)

```html
<!-- Aggiungi PRIMA di wirc-snap-ui.js -->
<script src="wirc-snap-audio.js"></script>
```

### 2. Preload all'avvio

```javascript
// In wirc-snap-ui.js, funzione init() o startGame()
wircAudio.preloadAll();

// Opzionale: avvia musica di gioco
playMusic('music/game_music.mp3', true);
```

### 3. Hook eventi

#### Card Actions
```javascript
// Quando pesca carta
function drawCard() {
  playSfx('card_draw');
  // ... resto logica
}

// Quando gioca carta
function playCard(card, location) {
  playSfx('card_play');
  // ... resto logica
}

// Drag start (in handleDragStart)
function handleDragStart(e) {
  playSfx('card_drag', { volume: 0.3 });
  // ... resto logica
}

// Drop (in handleCardPlay)
function handleCardPlay(card, location) {
  playSfx('card_drop');
  // ... resto logica
}
```

#### Location
```javascript
// Quando location rivelata
function revealLocation(location) {
  playSfx('location_reveal');
  // ... resto logica
}
```

#### Turn Events
```javascript
// Inizio turno
function startTurn() {
  playSfx('turn_start');
  startTurnTimer();
  // ... resto logica
}

// Fine turno
function endTurn() {
  playSfx('turn_end');
  // ... resto logica
}

// Timer warning (quando remainingTime <= 5)
function updateTimerBar(remainingTime) {
  if (remainingTime === 5) {
    playSfx('timer_warning');
  }
  // ... resto logica
}
```

#### Game Actions
```javascript
// SNAP
function handleSnap() {
  playSfx('snap');
  // ... resto logica
}

// Retreat
function handleRetreat() {
  playSfx('retreat');
  // ... resto logica
}

// Victory
function showGameResult(won) {
  if (won) {
    playSfx('victory');
  } else {
    playSfx('defeat');
  }
  // ... resto logica
}
```

#### UI
```javascript
// Button clicks
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playSfx('button_click', { volume: 0.5 });
  });
});

// Modal open
function showCardDetail(card) {
  playSfx('modal_open', { volume: 0.4 });
  // ... resto logica
}

// Modal close
function closeDetailModal() {
  playSfx('modal_close', { volume: 0.4 });
  // ... resto logica
}
```

---

## 🎚️ SETTINGS UI

### HTML Settings Panel

```html
<div id="audioSettings" class="settings-panel" style="display:none;">
  <h3>🎵 Audio Settings</h3>
  
  <div class="setting-row">
    <label>SFX Volume</label>
    <input type="range" id="sfxVolume" min="0" max="100" value="70">
    <span id="sfxVolumeValue">70%</span>
  </div>
  
  <div class="setting-row">
    <label>Music Volume</label>
    <input type="range" id="musicVolume" min="0" max="100" value="30">
    <span id="musicVolumeValue">30%</span>
  </div>
  
  <div class="setting-row">
    <label>SFX</label>
    <button id="toggleSfx" class="btn">🔊 ON</button>
  </div>
  
  <div class="setting-row">
    <label>Music</label>
    <button id="toggleMusic" class="btn">🎵 ON</button>
  </div>
  
  <button id="muteAll" class="btn btn-secondary">🔇 Mute All</button>
</div>
```

### JS Settings Handlers

```javascript
// SFX Volume
const sfxSlider = document.getElementById('sfxVolume');
const sfxValue = document.getElementById('sfxVolumeValue');

sfxSlider.addEventListener('input', () => {
  const value = sfxSlider.value / 100;
  wircAudio.setSfxVolume(value);
  sfxValue.textContent = sfxSlider.value + '%';
});

// Music Volume
const musicSlider = document.getElementById('musicVolume');
const musicValue = document.getElementById('musicVolumeValue');

musicSlider.addEventListener('input', () => {
  const value = musicSlider.value / 100;
  wircAudio.setMusicVolume(value);
  musicValue.textContent = musicSlider.value + '%';
});

// Toggle SFX
const toggleSfxBtn = document.getElementById('toggleSfx');
toggleSfxBtn.addEventListener('click', () => {
  const enabled = wircAudio.toggleSfx();
  toggleSfxBtn.textContent = enabled ? '🔊 ON' : '🔇 OFF';
});

// Toggle Music
const toggleMusicBtn = document.getElementById('toggleMusic');
toggleMusicBtn.addEventListener('click', () => {
  const enabled = wircAudio.toggleMusic();
  toggleMusicBtn.textContent = enabled ? '🎵 ON' : '🔇 OFF';
});

// Mute All
const muteAllBtn = document.getElementById('muteAll');
muteAllBtn.addEventListener('click', () => {
  wircAudio.muteAll();
  toggleSfxBtn.textContent = '🔇 OFF';
  toggleMusicBtn.textContent = '🔇 OFF';
});
```

---

## 🎨 CSS Settings Panel

```css
.settings-panel {
  background: var(--card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  max-width: 400px;
  margin: 20px auto;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.setting-row label {
  flex: 0 0 120px;
  font-weight: 600;
}

.setting-row input[type="range"] {
  flex: 1;
}

.setting-row span {
  flex: 0 0 50px;
  text-align: right;
  color: var(--muted);
}
```

---

## 📦 DOVE SCARICARE SUONI

### Free Sound Libraries

1. **Freesound.org** (CC0 / CC-BY)
   - https://freesound.org/
   - Cerca: "card shuffle", "button click", "victory fanfare"

2. **Mixkit** (Free License)
   - https://mixkit.co/free-sound-effects/
   - Sezione: Game / UI

3. **Zapsplat** (Free con attribution)
   - https://www.zapsplat.com/
   - Sezione: Game Audio

4. **OpenGameArt** (CC0 / CC-BY)
   - https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13
   - Filter: Sound Effects

### Recommended Sounds

- **card_draw**: "card flip", "paper shuffle"
- **card_play**: "card place", "thud soft"
- **snap**: "finger snap", "pop"
- **victory**: "fanfare", "win jingle"
- **button_click**: "UI click", "soft beep"

---

## 🔧 ADVANCED OPTIONS

### Playback Rate
```javascript
// Suono più veloce
playSfx('card_draw', { playbackRate: 1.2 });

// Suono più lento
playSfx('defeat', { playbackRate: 0.8 });
```

### Custom Volume per SFX
```javascript
// Suono sottile
playSfx('card_drag', { volume: 0.3 });

// Suono enfatizzato
playSfx('snap', { volume: 1.5 });
```

### Music Fade In/Out (da implementare)
```javascript
// TODO: Fade in 2 secondi
function fadeInMusic(url, duration = 2000) {
  // ...
}

// TODO: Fade out 2 secondi
function fadeOutMusic(duration = 2000) {
  // ...
}
```

---

## 🐛 TROUBLESHOOTING

### Suoni non si sentono

1. **Check browser autoplay policy**
   ```javascript
   // Richiedi user interaction prima di play
   document.addEventListener('click', () => {
     wircAudio.preloadAll();
   }, { once: true });
   ```

2. **Check volume settings**
   ```javascript
   console.log('SFX:', wircAudio.sfxVolume, wircAudio.sfxEnabled);
   console.log('Music:', wircAudio.musicVolume, wircAudio.musicEnabled);
   ```

3. **Check file paths**
   ```javascript
   // Test singolo suono
   wircAudio.preloadSound('test', 'sounds/card_draw.mp3');
   wircAudio.play('test');
   ```

### Performance

- Usa MP3 (compatibilità cross-browser)
- Dimensione file < 100KB per SFX
- Bitrate 128kbps per SFX, 192kbps per musica
- Preload solo suoni essenziali

---

## 📝 TODO FUTURE

- [ ] Fade in/out musica
- [ ] Spatial audio (pan left/right per location)
- [ ] Sound pools (multiple istanze pre-create)
- [ ] Adaptive music (cambia in base a game state)
- [ ] Accessibility: visual feedback quando suono disabled

---

**Developed by**: Cascade AI  
**Date**: 22 October 2025  
**Version**: Audio System v1.0  

**🎵 Ready for implementation!**
