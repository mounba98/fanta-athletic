// ========== WIRC SNAP AUDIO SYSTEM ==========
// Sistema audio completo per WIRC Snap v4.0
// Gestisce SFX, musica, volume, mute

class WircAudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.3;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    
    // Load settings from localStorage
    this.loadSettings();
  }
  
  // ========== SETTINGS ==========
  loadSettings() {
    try {
      const saved = localStorage.getItem('wirc_audio_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.sfxVolume = settings.sfxVolume ?? 0.7;
        this.musicVolume = settings.musicVolume ?? 0.3;
        this.sfxEnabled = settings.sfxEnabled ?? true;
        this.musicEnabled = settings.musicEnabled ?? true;
      }
    } catch(e) {
      console.warn('Failed to load audio settings:', e);
    }
  }
  
  saveSettings() {
    try {
      const settings = {
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume,
        sfxEnabled: this.sfxEnabled,
        musicEnabled: this.musicEnabled
      };
      localStorage.setItem('wirc_audio_settings', JSON.stringify(settings));
    } catch(e) {
      console.warn('Failed to save audio settings:', e);
    }
  }
  
  // ========== PRELOAD SOUNDS ==========
  preloadSound(name, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = this.sfxVolume;
    this.sounds[name] = audio;
    return audio;
  }
  
  preloadAll() {
    // SFX - Card Actions
    this.preloadSound('card_draw', 'sounds/card_draw.mp3');
    this.preloadSound('card_play', 'sounds/card_play.mp3');
    this.preloadSound('card_drag', 'sounds/card_drag.mp3');
    this.preloadSound('card_drop', 'sounds/card_drop.mp3');
    
    // SFX - Location
    this.preloadSound('location_reveal', 'sounds/location_reveal.mp3');
    this.preloadSound('location_flip', 'sounds/location_flip.mp3');
    
    // SFX - Turn
    this.preloadSound('turn_start', 'sounds/turn_start.mp3');
    this.preloadSound('turn_end', 'sounds/turn_end.mp3');
    this.preloadSound('timer_warning', 'sounds/timer_warning.mp3');
    
    // SFX - Game Events
    this.preloadSound('snap', 'sounds/snap.mp3');
    this.preloadSound('retreat', 'sounds/retreat.mp3');
    this.preloadSound('victory', 'sounds/victory.mp3');
    this.preloadSound('defeat', 'sounds/defeat.mp3');
    
    // SFX - UI
    this.preloadSound('button_click', 'sounds/button_click.mp3');
    this.preloadSound('button_hover', 'sounds/button_hover.mp3');
    this.preloadSound('modal_open', 'sounds/modal_open.mp3');
    this.preloadSound('modal_close', 'sounds/modal_close.mp3');
    
    console.log('✅ Preloaded', Object.keys(this.sounds).length, 'sounds');
  }
  
  // ========== PLAY SOUND ==========
  play(soundName, options = {}) {
    if (!this.sfxEnabled) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn('Sound not found:', soundName);
      return;
    }
    
    try {
      // Clone per permettere overlap (multiple istanze)
      const clone = sound.cloneNode();
      clone.volume = (options.volume ?? 1.0) * this.sfxVolume;
      clone.playbackRate = options.playbackRate ?? 1.0;
      
      const playPromise = clone.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Audio play failed:', soundName, err);
        });
      }
      
      return clone;
    } catch(e) {
      console.warn('Failed to play sound:', soundName, e);
    }
  }
  
  // ========== MUSIC ==========
  playMusic(url, loop = true) {
    if (!this.musicEnabled) return;
    
    this.stopMusic();
    
    this.music = new Audio(url);
    this.music.loop = loop;
    this.music.volume = this.musicVolume;
    
    const playPromise = this.music.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Music play failed:', err);
      });
    }
  }
  
  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
      this.music = null;
    }
  }
  
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }
  
  resumeMusic() {
    if (this.music && this.musicEnabled) {
      const playPromise = this.music.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Music resume failed:', err);
        });
      }
    }
  }
  
  // ========== VOLUME CONTROL ==========
  setSfxVolume(value) {
    this.sfxVolume = Math.max(0, Math.min(1, value));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.sfxVolume;
    });
    this.saveSettings();
  }
  
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
    this.saveSettings();
  }
  
  // ========== MUTE/UNMUTE ==========
  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    this.saveSettings();
    return this.sfxEnabled;
  }
  
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.resumeMusic();
    } else {
      this.pauseMusic();
    }
    this.saveSettings();
    return this.musicEnabled;
  }
  
  muteAll() {
    this.sfxEnabled = false;
    this.musicEnabled = false;
    this.pauseMusic();
    this.saveSettings();
  }
  
  unmuteAll() {
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.resumeMusic();
    this.saveSettings();
  }
}

// ========== GLOBAL INSTANCE ==========
const wircAudio = new WircAudioManager();

// ========== CONVENIENCE FUNCTIONS ==========
function playSfx(soundName, options) {
  return wircAudio.play(soundName, options);
}

function playMusic(url, loop = true) {
  return wircAudio.playMusic(url, loop);
}

function stopMusic() {
  return wircAudio.stopMusic();
}

// ========== INTEGRATION HOOKS ==========
// Chiamate da inserire in wirc-snap-ui.js:

// 1. Card draw
// playSfx('card_draw');

// 2. Card play
// playSfx('card_play');

// 3. Card drag start
// playSfx('card_drag', { volume: 0.3 });

// 4. Card drop
// playSfx('card_drop');

// 5. Location reveal
// playSfx('location_reveal');

// 6. Turn start
// playSfx('turn_start');

// 7. Turn end
// playSfx('turn_end');

// 8. Timer warning (5s rimasti)
// playSfx('timer_warning');

// 9. Snap!
// playSfx('snap');

// 10. Retreat
// playSfx('retreat');

// 11. Victory
// playSfx('victory');

// 12. Defeat
// playSfx('defeat');

// 13. Button click
// playSfx('button_click', { volume: 0.5 });

// 14. Modal open
// playSfx('modal_open', { volume: 0.4 });

// 15. Modal close
// playSfx('modal_close', { volume: 0.4 });

console.log('🎵 WIRC Audio System loaded');
