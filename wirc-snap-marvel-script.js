// WIRC SNAP MARVEL - Complete Game Script
// Mobile-first Marvel Snap-style card battle

// ========== WIRC CHARACTERS (24 Cards) ==========
const CARDS = [
  { id: 'fracks', name: 'Fracks', cost: 4, power: 6, emoji: '👔', trigger: 'ongoing', effect: 'boost_blortz', value: 1, description: 'Blortz qui +1 Forza' },
  { id: 'tommy', name: 'Tommy Guardu', cost: 5, power: 8, emoji: '⚽', trigger: 'ongoing', effect: 'enemy_debuff', value: 1, description: 'Nemici qui -1 Forza' },
  { id: 'bosi', name: 'Bosi', cost: 2, power: 3, emoji: '🌿', trigger: 'ongoing', effect: 'regen', value: 1, description: '+1 Forza ogni turno' },
  { id: 'dux', name: 'Dux', cost: 2, power: 3, emoji: '🧘', trigger: 'on_reveal', effect: 'boost_if_relaxato', value: 2, description: '+2 se hai Relaxato' },
  { id: 'chep', name: 'Chep', cost: 3, power: 2, emoji: '💭', trigger: 'on_reveal', effect: 'disable_ongoing', description: 'Disattiva Continuo nemico' },
  { id: 'toti', name: 'Toti', cost: 3, power: 4, emoji: '☕', trigger: 'ongoing', effect: 'boost_allenatori', value: 1, description: 'Allenatori +1' },
  { id: 'paolino', name: 'Paolino', cost: 1, power: 2, emoji: '🔍', trigger: 'on_reveal', effect: 'draw_card', description: 'Pesca 1 carta' },
  { id: 'pippo', name: 'Pippo Bongia', cost: 2, power: 3, emoji: '🎯', trigger: 'ongoing', effect: 'boost_scout', value: 1, description: 'Scout +1 Forza' },
  { id: 'giulietto', name: 'Giulietto', cost: 2, power: 2, emoji: '🧒', trigger: 'ongoing', effect: 'boost_cost1', value: 1, description: 'Costo 1 +1' },
  { id: 'wabione', name: 'Wabione', cost: 4, power: 7, emoji: '🧱', trigger: 'ongoing', effect: 'boost_if_2relaxato', value: 3, description: '+3 con 2 Relaxati' },
  { id: 'calosi', name: 'Calosi', cost: 3, power: 5, emoji: '🎨', trigger: 'on_reveal', effect: 'boost_after_festaiolo', value: 2, description: '+2 dopo Festaiolo' },
  { id: 'giabba', name: 'Giabba', cost: 3, power: 4, emoji: '🎸', trigger: 'ongoing', effect: 'boost_per_turn', value: 1, description: '+1 ogni turno' },
  { id: 'santo', name: 'Santo', cost: 3, power: 4, emoji: '🎵', trigger: 'on_reveal', effect: 'boost_creativi', value: 2, description: 'Creativi +2' },
  { id: 'trendiu', name: 'Trendiu', cost: 2, power: 2, emoji: '🎭', trigger: 'on_reveal', effect: 'copy_effect', description: 'Copia effetto alleato' },
  { id: 'pato', name: 'Pato', cost: 3, power: 5, emoji: '💪', trigger: 'ongoing', effect: 'boost_if_atleta', value: 2, description: '+2 con Atleta' },
  { id: 'beppe', name: 'Beppe', cost: 3, power: 5, emoji: '⚽', trigger: 'ongoing', effect: 'boost_atleti', value: 1, description: 'Atleti +1' },
  { id: 'gcazzi', name: 'G Cazzi', cost: 2, power: 3, emoji: '🏋️', trigger: 'on_reveal', effect: 'boost_if_atleta', value: 3, description: '+3 con Atleta' },
  { id: 'cocci', name: 'Cocci', cost: 1, power: 1, emoji: '💥', trigger: 'ongoing', effect: 'boost_on_hit', value: 2, description: '+2 se colpito' },
  { id: 'meme', name: 'Meme', cost: 3, power: 3, emoji: '📊', trigger: 'on_reveal', effect: 'copy_ongoing', description: 'Copia Continuo nemico' },
  { id: 'momo', name: 'Momo', cost: 4, power: 6, emoji: '🕺', trigger: 'on_reveal', effect: 'disable_random', description: 'Disattiva Continuo random' },
  { id: 'titti', name: 'Titti', cost: 3, power: 4, emoji: '🎓', trigger: 'ongoing', effect: 'boost_atleti_global', value: 2, description: 'Tutti Atleti +2' },
  { id: 'nicola', name: 'Nicola Mocci', cost: 4, power: 6, emoji: '💻', trigger: 'on_reveal', effect: 'double_next', description: 'Duplica prossimo effetto' },
  { id: 'wengi', name: 'Wengi', cost: 3, power: 4, emoji: '🤕', trigger: 'ongoing', effect: 'boost_on_enemy_play', value: 1, description: '+1 per carta nemica' },
  { id: 'canni', name: 'Canni', cost: 2, power: 3, emoji: '🤖', trigger: 'ongoing', effect: 'boost_if_skip', value: 2, description: '+2 se salti turno' },
  { id: 'boro', name: 'Boro', cost: 3, power: 5, emoji: '🍺', trigger: 'on_reveal', effect: 'energy_boost', value: 1, description: '+1 Energia max' },
  { id: 'wonia', name: 'Wonia', cost: 3, power: 4, emoji: '💃', trigger: 'ongoing', effect: 'boost_if_wabione', value: 2, description: '+2 se hai Wabione' },
  { id: 'lisa', name: 'Lisa', cost: 2, power: 3, emoji: '👩', trigger: 'on_reveal', effect: 'boost_if_ale', value: 2, description: '+2 se hai Ale Lapi' }
];

const LOCATIONS = [
  { id: 'bar_wirc', name: 'Bar WIRC', emoji: '🍺', effect: null, description: 'Nessun effetto speciale' },
  { id: 'campo_atletico', name: 'Campo Atletico', emoji: '⚽', effect: 'plus_one_energy', description: '+1 Energia entrambi i giocatori' },
  { id: 'palestra', name: 'Palestra', emoji: '💪', effect: 'cards_plus_two', description: 'Carte qui hanno +2 Forza' },
  { id: 'circolo', name: 'Circolo', emoji: '🏛️', effect: null, description: 'Nessun effetto speciale' },
  { id: 'spogliatoi', name: 'Spogliatoi', emoji: '👕', effect: 'destroy_lowest', description: 'Turno 5: Distrugge carta con forza minore' },
  { id: 'canna_relax', name: 'Zona Relax', emoji: '🌿', effect: 'add_bonus', description: 'Turno 3: Aggiunge bonus casuale' },
  { id: 'tribune', name: 'Tribune', emoji: '🎪', effect: 'cost_plus_one', description: 'Carte qui costano +1 energia' },
  { id: 'sala_giochi', name: 'Sala Giochi', emoji: '🎮', effect: 'draw_on_play', description: 'Giocare qui fa pescare 1 carta' }
];

// ========== GAME STATE ==========
class WircSnapGame {
  constructor() {
    this.turn = 1;
    this.energy = 1;
    this.maxEnergy = 1;
    this.cubes = 1;
    this.snapped = false;
    this.opponentSnapped = false;
    this.gameOver = false;
    this.timerSeconds = 60;
    this.timerInterval = null;
    
    // Shuffle and create decks
    const shuffled = this.shuffle([...CARDS]);
    this.playerDeck = shuffled.slice(0, 12).map((c, i) => ({ ...c, instanceId: `p${i}` }));
    this.opponentDeck = shuffled.slice(12, 24).map((c, i) => ({ ...c, instanceId: `o${i}` }));
    
    // Draw initial hands
    this.playerHand = [];
    this.opponentHand = [];
    for (let i = 0; i < 3; i++) {
      this.drawCard('player');
      this.drawCard('opponent');
    }
    
    // Boards (3 locations x 2 players)
    this.playerBoard = { loc0: [], loc1: [], loc2: [] };
    this.opponentBoard = { loc0: [], loc1: [], loc2: [] };
    
    // Select 3 random locations
    const shuffledLocs = this.shuffle([...LOCATIONS]);
    this.locations = shuffledLocs.slice(0, 3).map((loc, i) => ({
      ...loc,
      revealed: i === 0, // First location revealed immediately
      revealTurn: i === 0 ? 1 : (i === 1 ? 2 : 3),
      locked: false
    }));
  }
  
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  drawCard(player) {
    const deck = player === 'player' ? this.playerDeck : this.opponentDeck;
    const hand = player === 'player' ? this.playerHand : this.opponentHand;
    
    if (deck.length > 0 && hand.length < 7) {
      hand.push(deck.pop());
      return true;
    }
    return false;
  }
  
  playCard(player, cardIndex, locationIndex) {
    const hand = player === 'player' ? this.playerHand : this.opponentHand;
    const board = player === 'player' ? this.playerBoard : this.opponentBoard;
    const card = hand[cardIndex];
    
    if (!card) return false;
    // Solo il player consuma energia, l'AI ha energia illimitata
    if (player === 'player' && this.energy < card.cost) return false;
    if (board[`loc${locationIndex}`].length >= 4) return false;
    
    // Play card
    if (player === 'player') {
      this.energy -= card.cost;
    }
    board[`loc${locationIndex}`].push(card);
    hand.splice(cardIndex, 1);
    
    // Trigger on_reveal effects
    if (card.trigger === 'on_reveal') {
      this.triggerEffect(card, player, locationIndex);
    }
    
    return true;
  }
  
  triggerEffect(card, player, locationIndex) {
    // Simplified effect system
    if (card.effect === 'draw_card') {
      this.drawCard(player);
    } else if (card.effect === 'energy_boost') {
      this.maxEnergy += (card.value || 1);
    }
    // Altri effetti semplificati per ora
  }
  
  calculatePower(player, locationIndex) {
    const board = player === 'player' ? this.playerBoard : this.opponentBoard;
    const cards = board[`loc${locationIndex}`] || [];
    let total = cards.reduce((sum, card) => sum + (card.power || 0), 0);
    
    // Apply location effects
    const loc = this.locations[locationIndex];
    if (loc.effect === 'cards_plus_two') {
      total += cards.length * 2;
    }
    
    return total;
  }
  
  endTurn() {
    // Draw cards
    this.drawCard('player');
    this.drawCard('opponent');
    
    // Next turn
    this.turn++;
    this.maxEnergy = Math.min(6, this.turn);
    this.energy = this.maxEnergy;
    
    // Reveal locations
    this.locations.forEach(loc => {
      if (loc.revealTurn === this.turn) {
        loc.revealed = true;
      }
    });
    
    // AI opponent play
    this.aiPlay();
    
    // Check game end
    if (this.turn > 6) {
      this.endGame();
    } else {
      this.resetTimer();
    }
  }
  
  aiPlay() {
    // Simple AI: play random affordable card in random location
    // AI ha energia illimitata, ma gioca massimo 2 carte per turno
    const playableCards = this.opponentHand.filter(c => c.cost <= this.maxEnergy);
    if (playableCards.length === 0) return;
    
    const numCards = Math.min(2, playableCards.length);
    for (let i = 0; i < numCards; i++) {
      if (this.opponentHand.length === 0) break;
      
      const card = playableCards[Math.floor(Math.random() * playableCards.length)];
      const loc = Math.floor(Math.random() * 3);
      const handIndex = this.opponentHand.indexOf(card);
      
      if (handIndex !== -1) {
        this.playCard('opponent', handIndex, loc);
        // Rimuovi carta giocata da playableCards
        const playableIndex = playableCards.indexOf(card);
        if (playableIndex !== -1) playableCards.splice(playableIndex, 1);
      }
    }
  }
  
  endGame() {
    this.gameOver = true;
    
    // Calculate winners per location
    const playerWins = [0, 1, 2].filter(i => {
      return this.calculatePower('player', i) > this.calculatePower('opponent', i);
    }).length;
    
    const opponentWins = [0, 1, 2].filter(i => {
      return this.calculatePower('opponent', i) > this.calculatePower('player', i);
    }).length;
    
    // Determine winner
    const result = playerWins > opponentWins ? 'win' : (playerWins < opponentWins ? 'loss' : 'draw');
    
    // Show match end screen
    showMatchEnd(result, playerWins, opponentWins, this.cubes);
    
    // Save stats to Firebase
    if (window.auth && window.auth.currentUser) {
      saveGameStats(result, playerWins, opponentWins, this.cubes);
    }
  }
  
  snap() {
    if (!this.snapped) {
      this.snapped = true;
      this.cubes = Math.min(this.cubes * 2, 8);
    }
  }
  
  retreat() {
    this.gameOver = true;
    showMatchEnd('retreat', 0, 3, -this.cubes);
  }
  
  resetTimer() {
    this.timerSeconds = 60;
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      updateTimerUI(this.timerSeconds);
      
      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.endTurn();
      }
    }, 1000);
  }
}

// ========== GLOBAL GAME INSTANCE ==========
let game = null;
let selectedCard = null;

// ========== FIREBASE AUTH ==========
window.addEventListener('load', async () => {
  // Wait for Firebase init with retry
  let retries = 0;
  while ((!window.auth || !window.firebase) && retries < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!window.auth || !window.firebase) {
    console.error('Firebase Auth not available after 5s');
    alert('⚠️ Firebase non disponibile. Ricarica la pagina.');
    return;
  }
  
  console.log('✅ Firebase ready for WIRC Snap');
  
  window.auth.onAuthStateChanged(user => {
      if (user) {
        document.getElementById('userName').textContent = user.displayName || 'Player';
        document.getElementById('userEmail').textContent = user.email || '';
        document.getElementById('authUser').style.display = 'block';
        document.getElementById('loginBtn').textContent = '🎮 START GAME';
      } else {
        document.getElementById('authUser').style.display = 'none';
        document.getElementById('loginBtn').textContent = '🔐 LOGIN TO PLAY';
      }
    });
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  if (!window.auth || !window.firebase) {
    alert('⚠️ Firebase non ancora pronto. Attendi qualche secondo e riprova.');
    return;
  }
  
  const user = window.auth.currentUser;
  if (user) {
    // Start game
    startGame();
  } else {
    // Login
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await window.auth.signInWithPopup(provider);
      // After login success, start game automatically
      startGame();
    } catch (error) {
      console.error('Login error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert('Login failed: ' + error.message);
      }
    }
  }
});

function startGame() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'flex';
  
  game = new WircSnapGame();
  renderGame();
  game.resetTimer();
}

// ========== RENDER FUNCTIONS ==========
function renderGame() {
  renderHUD();
  renderLocations();
  renderHand();
}

function renderHUD() {
  document.getElementById('turnNumber').textContent = game.turn;
  document.getElementById('energyValue').textContent = `${game.energy}/${game.maxEnergy}`;
  updateTimerUI(game.timerSeconds);
}

function updateTimerUI(seconds) {
  document.getElementById('timerValue').textContent = seconds;
  const percent = (seconds / 60) * 100;
  document.getElementById('timerFill').style.width = percent + '%';
}

function renderLocations() {
  game.locations.forEach((loc, i) => {
    // Location name
    const nameEl = document.getElementById(`loc${i}Name`);
    const effectEl = document.getElementById(`loc${i}Effect`);
    
    if (loc.revealed) {
      nameEl.textContent = `${loc.emoji} ${loc.name}`;
      effectEl.textContent = loc.description;
    } else {
      nameEl.textContent = '???';
      effectEl.textContent = `Revealed Turn ${loc.revealTurn}`;
    }
    
    // Render cards
    const playerZone = document.getElementById(`playerLoc${i}`);
    const opponentZone = document.getElementById(`opponentLoc${i}`);
    
    playerZone.innerHTML = game.playerBoard[`loc${i}`].map(c => createCardHTML(c)).join('');
    opponentZone.innerHTML = game.opponentBoard[`loc${i}`].map(c => createCardHTML(c)).join('');
    
    // Add card click listeners
    playerZone.querySelectorAll('.card').forEach(el => {
      el.addEventListener('click', () => {
        const cardData = JSON.parse(el.dataset.card);
        openCardModal(cardData);
      });
    });
    
    // Scores
    document.getElementById(`scorePlayer${i}`).textContent = game.calculatePower('player', i);
    document.getElementById(`scoreOpp${i}`).textContent = game.calculatePower('opponent', i);
  });
}

function renderHand() {
  const handEl = document.getElementById('hand');
  handEl.innerHTML = game.playerHand.map((card, i) => createCardHTML(card, i)).join('');
  
  // Add click listeners
  handEl.querySelectorAll('.card').forEach((el, i) => {
    el.addEventListener('click', () => {
      selectedCard = i;
      // Highlight selected
      handEl.querySelectorAll('.card').forEach(c => c.style.border = '2px solid rgba(108,99,255,0.5)');
      el.style.border = '3px solid #00E0FF';
      
      // Show modal on double-tap
      el.addEventListener('dblclick', () => {
        openCardModal(game.playerHand[i]);
      });
      
      // Prompt to select location
      document.querySelectorAll('.location').forEach((loc, locIndex) => {
        loc.style.cursor = 'pointer';
        loc.onclick = () => {
          if (selectedCard !== null) {
            const success = game.playCard('player', selectedCard, locIndex);
            if (success) {
              selectedCard = null;
              renderGame();
            } else {
              alert('Cannot play here!');
            }
          }
        };
      });
    });
  });
}

function createCardHTML(card, handIndex) {
  const dataAttr = handIndex !== undefined ? `data-index="${handIndex}"` : '';
  return `
    <div class="card" ${dataAttr} data-card='${JSON.stringify(card)}'>
      <div class="card-cost">${card.cost}</div>
      <div class="card-emoji">${card.emoji}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-power">${card.power}</div>
    </div>
  `;
}

// ========== BUTTONS ==========
document.getElementById('endBtn').addEventListener('click', () => {
  if (!game || game.gameOver) return;
  
  // Show banner
  showTurnBanner();
  
  setTimeout(() => {
    game.endTurn();
    renderGame();
  }, 2000);
});

document.getElementById('snapBtn').addEventListener('click', () => {
  if (!game || game.gameOver || game.snapped) return;
  game.snap();
  alert(`⚡ SNAP! Cubes now: ${game.cubes}`);
});

document.getElementById('retreatBtn').addEventListener('click', () => {
  if (!game || game.gameOver) return;
  if (confirm('Retreat and lose cubes?')) {
    game.retreat();
  }
});

function showTurnBanner() {
  const banner = document.getElementById('turnBanner');
  banner.classList.add('show');
  setTimeout(() => {
    banner.classList.remove('show');
  }, 2000);
}

// ========== MODAL ==========
function openCardModal(card) {
  document.getElementById('modalCost').textContent = card.cost;
  document.getElementById('modalEmoji').textContent = card.emoji;
  document.getElementById('modalName').textContent = card.name;
  document.getElementById('modalPower').textContent = card.power;
  document.getElementById('modalEffect').textContent = card.trigger.toUpperCase();
  document.getElementById('modalDescription').textContent = card.description;
  document.getElementById('cardModal').style.display = 'flex';
}

function closeCardModal() {
  document.getElementById('cardModal').style.display = 'none';
}

// ========== MATCH END ==========
function showMatchEnd(result, playerWins, opponentWins, cubes) {
  const resultText = result === 'win' ? 'VITTORIA!' : result === 'loss' ? 'SCONFITTA' : result === 'draw' ? 'PAREGGIO' : 'RITIRATO';
  
  document.getElementById('matchResult').textContent = resultText;
  document.getElementById('finalPlayerScore').textContent = playerWins;
  document.getElementById('finalOpponentScore').textContent = opponentWins;
  document.getElementById('cubesWon').textContent = result === 'win' ? `+${cubes}` : `-${Math.abs(cubes)}`;
  document.getElementById('matchEndScreen').style.display = 'flex';
}

// ========== FIREBASE STATS ==========
async function saveGameStats(result, playerWins, opponentWins, cubes) {
  if (!window.db || !window.auth || !window.auth.currentUser) return;
  
  try {
    await window.db.collection('wirc_snap_games').add({
      userId: window.auth.currentUser.uid,
      userName: window.auth.currentUser.displayName || 'Player',
      result,
      playerWins,
      opponentWins,
      cubesWon: result === 'win' ? cubes : -cubes,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Stats saved!');
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}
