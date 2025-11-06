// WIRC SNAP v5 - UI Controller
// Marvel-style animations and interactions

let currentUser = null;
let timerInterval = null;
let currentDeck = [];
let allCards = [];

// ========== FIREBASE AUTH ==========
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById('userName').textContent = user.displayName || 'Player';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('buildDeckBtn').style.display = 'block';
    
    // Load cards data for deck builder
    loadCardsForDeckBuilder();
  } else {
    currentUser = null;
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('buildDeckBtn').style.display = 'none';
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  try {
    await firebase.auth().signInAnonymously();
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
});

// ========== DECK BUILDER ==========
async function loadCardsForDeckBuilder() {
  try {
    const res = await fetch('data/wirc-snap-cards-full.json');
    allCards = await res.json();
    console.log(`✅ Loaded ${allCards.length} cards for deck builder`);
  } catch (error) {
    console.error('Failed to load cards:', error);
  }
}

document.getElementById('buildDeckBtn').addEventListener('click', () => {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('deckBuilderScreen').classList.add('active');
  renderDeckBuilder();
});

document.getElementById('backToAuthBtn').addEventListener('click', () => {
  document.getElementById('deckBuilderScreen').classList.remove('active');
  document.getElementById('authScreen').style.display = 'flex';
});

document.getElementById('startGameFromDeck').addEventListener('click', () => {
  if (currentDeck.length !== 12) {
    alert('⚠️ Devi selezionare esattamente 12 carte!');
    return;
  }
  
  // Save selected deck
  localStorage.setItem('selectedDeck', JSON.stringify(currentDeck));
  
  // Start game with custom deck
  document.getElementById('deckBuilderScreen').classList.remove('active');
  startGameWithDeck();
});

document.getElementById('saveDeckBtn').addEventListener('click', () => {
  if (currentDeck.length !== 12) {
    alert('⚠️ Il mazzo deve avere esattamente 12 carte!');
    return;
  }
  
  const deckName = document.getElementById('deckName').value || 'My Deck';
  const savedDecks = JSON.parse(localStorage.getItem('wirc_snap_decks') || '[]');
  
  savedDecks.push({
    name: deckName,
    cards: currentDeck,
    created: new Date().toISOString()
  });
  
  localStorage.setItem('wirc_snap_decks', JSON.stringify(savedDecks));
  showEffectNotification(`💾 Mazzo "${deckName}" salvato!`);
});

document.getElementById('loadDeckBtn').addEventListener('click', () => {
  const savedDecks = JSON.parse(localStorage.getItem('wirc_snap_decks') || '[]');
  
  if (savedDecks.length === 0) {
    alert('⚠️ Nessun mazzo salvato!');
    return;
  }
  
  const deckNames = savedDecks.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
  const choice = prompt(`Carica mazzo:\n\n${deckNames}\n\nInserisci il numero:`);
  
  if (choice) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < savedDecks.length) {
      currentDeck = savedDecks[index].cards;
      document.getElementById('deckName').value = savedDecks[index].name;
      renderDeckBuilder();
      showEffectNotification(`📂 Mazzo "${savedDecks[index].name}" caricato!`);
    }
  }
});

document.getElementById('cardSearch').addEventListener('input', (e) => {
  renderDeckBuilder();
});

function renderDeckBuilder() {
  const searchTerm = document.getElementById('cardSearch').value.toLowerCase();
  const filtered = allCards.filter(c => 
    c.name.toLowerCase().includes(searchTerm) ||
    c.category.toLowerCase().includes(searchTerm) ||
    c.effect.toLowerCase().includes(searchTerm)
  );
  
  // Render available cards
  const availableList = document.getElementById('availableCardsList');
  availableList.innerHTML = '';
  
  for (const card of filtered) {
    const cardEl = createSelectableCard(card);
    cardEl.addEventListener('click', () => addCardToDeck(card));
    availableList.appendChild(cardEl);
  }
  
  // Render current deck
  const deckList = document.getElementById('yourDeckList');
  deckList.innerHTML = '';
  
  if (currentDeck.length === 0) {
    deckList.innerHTML = '<div class="deck-empty-message">Clicca sulle carte per aggiungerle</div>';
  } else {
    for (let i = 0; i < currentDeck.length; i++) {
      const card = currentDeck[i];
      const itemEl = document.createElement('div');
      itemEl.className = 'deck-card-item';
      itemEl.innerHTML = `
        <div class="deck-card-info">
          <div class="deck-card-emoji">${getCategoryEmoji(card.category)}</div>
          <div>
            <div class="deck-card-name">${card.name}</div>
            <div class="deck-card-cost">Cost: ${card.cost} | Power: ${card.power}</div>
          </div>
        </div>
        <button class="remove-card-btn" onclick="removeCardFromDeck(${i})">✕</button>
      `;
      deckList.appendChild(itemEl);
    }
  }
  
  // Update counters
  document.getElementById('availableCount').textContent = filtered.length;
  document.getElementById('deckCount').textContent = currentDeck.length;
}

function createSelectableCard(card) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card selectable-card';
  
  const emoji = getCategoryEmoji(card.category);
  
  cardEl.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <div class="card-power">${card.power}</div>
    <div class="card-emoji">${emoji}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-effect">${card.effect.substring(0, 50)}...</div>
  `;
  
  // Highlight if already in deck
  if (currentDeck.find(c => c.name === card.name)) {
    cardEl.classList.add('selected');
  }
  
  return cardEl;
}

function getCategoryEmoji(category) {
  const emojis = {
    'Tech': '💻', 'Support': '🛡️', 'Tempo': '⏱️', 'Chaos': '🎲',
    'Destroy': '💥', 'Ramp': '⚡', 'Discard': '🗑️', 'Move': '🔄',
    'Swarm': '👥', 'Zoo': '🦁', 'Control': '🎯', 'Combo': '🔗'
  };
  return emojis[category] || '🎴';
}

function addCardToDeck(card) {
  if (currentDeck.length >= 12) {
    showEffectNotification('⚠️ Mazzo pieno! (max 12 carte)');
    return;
  }
  
  // No duplicates
  if (currentDeck.find(c => c.name === card.name)) {
    showEffectNotification('⚠️ Carta già nel mazzo!');
    return;
  }
  
  currentDeck.push(card);
  renderDeckBuilder();
  
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

window.removeCardFromDeck = function(index) {
  currentDeck.splice(index, 1);
  renderDeckBuilder();
  
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
};

async function startGameWithDeck() {
  await window.gameEngine.loadData();
  window.gameEngine.reset();
  
  // Override player deck with custom deck
  window.gameEngine.playerDeck = currentDeck.map(c => ({
    ...c,
    instanceId: `p_${Math.random()}`,
    emoji: getCategoryEmoji(c.category)
  }));
  
  // Draw initial hand
  window.gameEngine.playerHand = window.gameEngine.drawCards(window.gameEngine.playerDeck, 4);
  
  // Switch to game
  document.getElementById('gameScreen').classList.add('active');
  createParticles();
  renderBoard();
  renderHand();
  updateUI();
  startTimer();
}

// ========== GAME INIT ==========
async function startGame() {
  // Load data
  await window.gameEngine.loadData();
  
  // Reset game
  window.gameEngine.reset();
  
  // Switch to game screen
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('gameScreen').classList.add('active');
  
  // Create particles
  createParticles();
  
  // Render board
  renderBoard();
  renderHand();
  updateUI();
  
  // Start timer
  startTimer();
}

// ========== PARTICLES ========== 
function createParticles() {
  const container = document.getElementById('particles');
  container.innerHTML = '';
  
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (5 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

// ========== TIMER ==========
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    const result = window.gameEngine.tick();
    updateTimerUI();
    
    if (result) {
      // Game ended
      clearInterval(timerInterval);
      showGameOver(result);
    }
  }, 1000);
}

function updateTimerUI() {
  const seconds = window.gameEngine.timerSeconds;
  document.getElementById('timerText').textContent = seconds;
  
  // Update circle progress
  const circle = document.getElementById('timerCircle');
  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = seconds / 60;
  const offset = circumference * (1 - progress);
  circle.style.strokeDashoffset = offset;
  
  // Change color based on time
  if (seconds > 40) {
    circle.style.stroke = '#22c55e';
  } else if (seconds > 20) {
    circle.style.stroke = '#fbbf24';
  } else {
    circle.style.stroke = '#ef4444';
  }
}

// ========== RENDER BOARD ==========
function renderBoard() {
  const engine = window.gameEngine;
  
  for (let i = 0; i < 3; i++) {
    const location = engine.gameLocations[i];
    const locElement = document.querySelector(`.location[data-location="${i}"]`);
    
    // Update location header
    const nameEl = locElement.querySelector('.location-name');
    const effectEl = locElement.querySelector('.location-effect');
    
    if (location.revealed) {
      nameEl.textContent = location.name;
      effectEl.textContent = location.description;
      locElement.classList.add('revealed');
    } else {
      nameEl.textContent = '???';
      effectEl.textContent = 'Hidden';
      locElement.classList.remove('revealed');
    }
    
    // Update scores
    const { playerPower, opponentPower } = engine.calculateLocationPower(i);
    const playerScoreEl = locElement.querySelector('.location-score.player');
    const opponentScoreEl = locElement.querySelector('.location-score.opponent');
    
    playerScoreEl.textContent = playerPower;
    opponentScoreEl.textContent = opponentPower;
    
    // Highlight winner
    playerScoreEl.classList.toggle('winning', playerPower > opponentPower);
    opponentScoreEl.classList.toggle('winning', opponentPower > playerPower);
    
    // Render cards
    renderLocationCards(i, 'player');
    renderLocationCards(i, 'opponent');
  }
}

function renderLocationCards(locationIndex, zone) {
  const engine = window.gameEngine;
  const board = zone === 'player' ? engine.playerBoard : engine.opponentBoard;
  const cards = board[`loc${locationIndex}`];
  
  const gridEl = document.querySelector(`.cards-grid[data-zone="${zone}"][data-location="${locationIndex}"]`);
  gridEl.innerHTML = '';
  
  // Always create 4 slots (2x2 grid)
  for (let i = 0; i < 4; i++) {
    const slotEl = document.createElement('div');
    slotEl.className = 'card-slot';
    
    if (cards[i]) {
      const cardEl = createCardElement(cards[i]);
      cardEl.classList.add('revealed');
      
      // FIX 7: Animation quando carta giocata
      setTimeout(() => {
        cardEl.style.animation = 'card-play-effect 0.5s ease-out';
      }, i * 100);
      
      // FIX 10: Double-click per zoom
      cardEl.addEventListener('dblclick', () => showCardDetail(cards[i]));
      
      slotEl.appendChild(cardEl);
    } else {
      slotEl.classList.add('empty');
      
      // Make drop targets for player zone
      if (zone === 'player') {
        slotEl.addEventListener('dragover', handleDragOver);
        slotEl.addEventListener('dragleave', (e) => {
          const zone = e.currentTarget.closest('.zone');
          if (zone) zone.classList.remove('drop-target');
        });
        slotEl.addEventListener('drop', (e) => handleDrop(e, locationIndex));
      }
    }
    
    gridEl.appendChild(slotEl);
  }
}

// ========== RENDER HAND ==========
function renderHand() {
  const engine = window.gameEngine;
  const handEl = document.getElementById('hand');
  handEl.innerHTML = '';
  
  for (const card of engine.playerHand) {
    const cardEl = createCardElement(card);
    cardEl.draggable = true;
    cardEl.addEventListener('dragstart', handleDragStart);
    cardEl.addEventListener('click', () => selectCard(card));
    cardEl.addEventListener('dblclick', () => showCardDetail(card));
    
    // Highlight if selected
    if (engine.selectedCard?.instanceId === card.instanceId) {
      cardEl.classList.add('selected');
    }
    
    // Disable if not enough energy
    if (card.cost > engine.energy) {
      cardEl.classList.add('disabled');
      cardEl.draggable = false;
    }
    
    handEl.appendChild(cardEl);
  }
}

// ========== CREATE CARD ELEMENT ==========
function createCardElement(card) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.dataset.instanceId = card.instanceId;
  
  cardEl.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <div class="card-power">${card.power}</div>
    <div class="card-emoji">${card.emoji}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-effect">${card.effect}</div>
  `;
  
  return cardEl;
}

// ========== DRAG & DROP ==========
let draggedCard = null;

function handleDragStart(e) {
  const engine = window.gameEngine;
  const instanceId = e.target.dataset.instanceId;
  draggedCard = engine.playerHand.find(c => c.instanceId === instanceId);
  
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', instanceId);
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';
  
  const slot = e.currentTarget;
  if (slot && slot.classList.contains('empty')) {
    const zone = slot.closest('.zone');
    if (zone && !zone.classList.contains('drop-target')) {
      zone.classList.add('drop-target');
    }
  }
}

function handleDrop(e, locationIndex) {
  e.preventDefault();
  e.stopPropagation();
  
  // Remove all drop-target highlights
  document.querySelectorAll('.zone.drop-target').forEach(z => {
    z.classList.remove('drop-target');
  });
  
  if (!draggedCard) {
    console.warn('No dragged card');
    return;
  }
  
  const engine = window.gameEngine;
  const success = engine.playCard(draggedCard, locationIndex, true);
  
  if (success) {
    // FIX 7: Show effect notification
    showEffectNotification(`✨ ${draggedCard.name} giocata! ${draggedCard.effect.substring(0, 40)}...`);
    
    renderBoard();
    renderHand();
    updateUI();
    
    // Vibrate on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  } else {
    showEffectNotification('❌ Non puoi giocare qui!');
  }
  
  draggedCard = null;
  
  // Remove dragging class from all cards
  document.querySelectorAll('.card.dragging').forEach(el => {
    el.classList.remove('dragging');
  });
}

// ========== CARD SELECTION (click-based alternative) ==========
function selectCard(card) {
  const engine = window.gameEngine;
  
  if (card.cost > engine.energy) {
    showEffectNotification('❌ Not enough energy!');
    return;
  }
  
  // Toggle selection
  if (engine.selectedCard?.instanceId === card.instanceId) {
    engine.selectedCard = null;
  } else {
    engine.selectedCard = card;
  }
  
  renderHand();
}

// Make locations clickable when card selected
document.querySelectorAll('.location').forEach((locEl, index) => {
  locEl.addEventListener('click', (e) => {
    // Don't trigger if clicking on a card
    if (e.target.closest('.card')) return;
    
    const engine = window.gameEngine;
    if (!engine.selectedCard) return;
    
    const success = engine.playCard(engine.selectedCard, index, true);
    
    if (success) {
      engine.selectedCard = null;
      renderBoard();
      renderHand();
      updateUI();
      
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else {
      showEffectNotification('❌ Cannot play here!');
    }
  });
  
  // Double-click to show location details
  locEl.addEventListener('dblclick', () => {
    const location = window.gameEngine.gameLocations[index];
    showLocationDetail(location);
  });
});

// ========== UPDATE UI ==========
function updateUI() {
  const engine = window.gameEngine;
  
  // FIX 2: Show turn as X/6 and energy as X/6
  document.getElementById('roundValue').textContent = `${engine.turn}/6`;
  document.getElementById('energyValue').textContent = `${engine.energy}/6`;
  document.getElementById('cubesValue').textContent = engine.cubes;
  document.getElementById('playerName').textContent = currentUser?.displayName || 'You';
  
  // Enable/disable end turn button
  const endTurnBtn = document.getElementById('endTurnBtn');
  endTurnBtn.disabled = false;
}

// ========== BUTTONS ==========
document.getElementById('snapBtn').addEventListener('click', () => {
  const engine = window.gameEngine;
  if (engine.snap(true)) {
    updateUI();
  } else {
    showEffectNotification('⚠️ Already snapped!');
  }
});

document.getElementById('retreatBtn').addEventListener('click', () => {
  if (confirm('❌ Retreat and lose cubes?')) {
    const result = window.gameEngine.retreat(true);
    if (result) {
      clearInterval(timerInterval);
      showGameOver(result);
    }
  }
});

document.getElementById('endTurnBtn').addEventListener('click', async () => {
  const engine = window.gameEngine;
  
  // Disable button
  const btn = document.getElementById('endTurnBtn');
  btn.disabled = true;
  btn.textContent = '⏳ PROCESSING...';
  
  // Show opponent turn overlay
  showTurnStatus('🤖 Turno dell\'avversario...');
  
  // Wait 500ms for visual feedback
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // End turn
  const result = engine.endTurn();
  
  // Re-render
  renderBoard();
  renderHand();
  updateUI();
  startTimer();
  
  // Hide overlay
  hideTurnStatus();
  
  // Reset button
  btn.disabled = false;
  btn.textContent = '🚀 END TURN';
  
  if (result) {
    clearInterval(timerInterval);
    showGameOver(result);
  } else {
    // Show effects summary
    showEffectNotification(`✨ Turno ${engine.turn} iniziato!`);
  }
});

function showTurnStatus(message) {
  const overlay = document.getElementById('turnStatusOverlay');
  const messageEl = document.getElementById('turnStatusMessage');
  messageEl.textContent = message;
  overlay.style.display = 'block';
}

function hideTurnStatus() {
  document.getElementById('turnStatusOverlay').style.display = 'none';
}

// ========== MODALS ==========
function showCardDetail(card) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailModalBody');
  
  body.innerHTML = `
    <div class="detail-card-large">
      ${createCardElement(card).outerHTML}
    </div>
    <div class="detail-description">
      <strong>${card.type.replace('_', ' ').toUpperCase()}</strong><br>
      ${card.effect}
    </div>
    <div class="detail-stats">
      <div class="detail-stat">
        <div class="detail-stat-label">Cost</div>
        <div class="detail-stat-value">${card.cost}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">Power</div>
        <div class="detail-stat-value">${card.power}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">Category</div>
        <div class="detail-stat-value">${card.category}</div>
      </div>
    </div>
  `;
  
  modal.classList.add('show');
}

function showLocationDetail(location) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailModalBody');
  
  body.innerHTML = `
    <h2 style="font-size: 32px; color: #fbbf24; margin-bottom: 20px;">${location.name}</h2>
    <div class="detail-description">
      ${location.description}
    </div>
    <div class="detail-stats">
      <div class="detail-stat">
        <div class="detail-stat-label">Effect</div>
        <div class="detail-stat-value">${location.effect || 'None'}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">Reveal Turn</div>
        <div class="detail-stat-value">${location.revealTurn}</div>
      </div>
    </div>
  `;
  
  modal.classList.add('show');
}

document.getElementById('detailModalClose').addEventListener('click', () => {
  document.getElementById('detailModal').classList.remove('show');
});

// Close modal with ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('detailModal').classList.remove('show');
  }
});

function showGameOver(result) {
  const modal = document.getElementById('gameOverModal');
  const titleEl = document.getElementById('gameOverTitle');
  const subtitleEl = document.getElementById('gameOverSubtitle');
  
  const { playerWins, opponentWins } = window.gameEngine.calculateTotalScore();
  
  document.getElementById('playerFinalScore').textContent = playerWins;
  document.getElementById('opponentFinalScore').textContent = opponentWins;
  document.getElementById('cubesWon').textContent = result.cubesWon || 0;
  
  titleEl.className = 'modal-title';
  
  if (result.result === 'victory') {
    titleEl.textContent = 'VICTORY!';
    titleEl.classList.add('victory');
    subtitleEl.textContent = 'You won the game!';
  } else if (result.result === 'defeat') {
    titleEl.textContent = 'DEFEAT';
    titleEl.classList.add('defeat');
    subtitleEl.textContent = 'Better luck next time!';
  } else {
    titleEl.textContent = 'DRAW';
    titleEl.classList.add('draw');
    subtitleEl.textContent = 'It\'s a tie!';
  }
  
  modal.classList.add('show');
}

document.getElementById('playAgainBtn').addEventListener('click', () => {
  document.getElementById('gameOverModal').classList.remove('show');
  startGame();
});

// ========== EFFECT NOTIFICATION ==========
window.showEffectNotification = function(message) {
  const notif = document.getElementById('effectNotification');
  notif.textContent = message;
  notif.style.display = 'block';
  
  setTimeout(() => {
    notif.style.display = 'none';
  }, 2500);
};

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  // FIX 10: Space = End Turn
  if (e.code === 'Space') {
    e.preventDefault();
    const btn = document.getElementById('endTurnBtn');
    if (!btn.disabled) {
      btn.click();
    }
  } else if (e.code === 'KeyS') {
    document.getElementById('snapBtn').click();
  } else if (e.code === 'KeyR') {
    document.getElementById('retreatBtn').click();
  }
});
