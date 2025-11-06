// WIRC SNAP v4.0 - UI Controller with Drag&Drop + Timer + Modal
// Connects Game Engine to DOM

// Init Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

let game = null;
let currentUser = null;
let turnTimer = null;
let timerSeconds = 60;
let draggedCard = null;
let dragPreview = null;

// ========== AUTH ==========
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    document.getElementById('userName').textContent = user.displayName || user.email;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('loginBtn').textContent = '🎮 Start Game';
    document.getElementById('loginBtn').onclick = startGame;
  } else {
    currentUser = null;
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginBtn').textContent = '🎮 Login con Fanta Athletic';
    document.getElementById('loginBtn').onclick = () => {
      auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    };
  }
});

// ========== PARTICLES ==========
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (8 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}
createParticles();

// ========== TIMER ==========
function startTurnTimer() {
  stopTurnTimer();
  timerSeconds = 60;
  updateTimerBar();
  
  turnTimer = setInterval(() => {
    timerSeconds--;
    updateTimerBar();
    
    if (timerSeconds <= 0) {
      stopTurnTimer();
      // Auto end turn
      handleEndTurn();
    }
  }, 1000);
}

function stopTurnTimer() {
  if (turnTimer) {
    clearInterval(turnTimer);
    turnTimer = null;
  }
}

function updateTimerBar() {
  const fill = document.getElementById('timerFill');
  if (fill) {
    const percentage = (timerSeconds / 60) * 100;
    fill.style.width = percentage + '%';
  }
}

// ========== GAME FUNCTIONS ==========
function startGame() {
  if (!currentUser) return;
  
  game = new GameEngine();
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('gameScreen').classList.add('active');
  
  renderGame();
  startTurnTimer();
  
  // Event listeners
  document.getElementById('endTurnBtn').onclick = handleEndTurn;
  document.getElementById('snapBtn').onclick = handleSnap;
  document.getElementById('retreatBtn').onclick = handleRetreat;
  document.getElementById('playAgainBtn').onclick = resetGame;
  document.getElementById('detailModalClose').onclick = closeDetailModal;
}

function renderGame() {
  renderHeader();
  renderLocations();
  renderHand();
}

function renderHeader() {
  document.getElementById('turnNumber').textContent = game.turn;
  document.getElementById('energyAmount').textContent = `${game.energy}/${game.maxEnergy}`;
  document.getElementById('cubesAmount').textContent = game.cubes;
  
  // Update button states
  document.getElementById('snapBtn').disabled = game.snapped;
  document.getElementById('snapBtn').textContent = game.snapped ? '✓ Snapped' : '⚡ Snap';
}

function renderLocations() {
  const container = document.getElementById('battleField');
  container.innerHTML = '';
  
  game.locations.forEach((location, index) => {
    const locationDiv = document.createElement('div');
    locationDiv.className = 'location';
    if (location.revealed) locationDiv.classList.add('revealed');
    if (!location.revealed) locationDiv.classList.add('locked');
    
    // Double click to view detail
    locationDiv.ondblclick = () => showLocationDetail(location);
    
    const powers = game.calculateLocationPower(index);
    const playerWinning = powers.player > powers.opponent;
    const opponentWinning = powers.opponent > powers.player;
    
    locationDiv.innerHTML = `
      <div class="location-header">
        ${location.revealed ? `
          <div class="location-scores">
            <div class="location-score opponent ${opponentWinning ? 'winning' : ''}">
              ${powers.opponent}
            </div>
            <div class="location-score player ${playerWinning ? 'winning' : ''}">
              ${powers.player}
            </div>
          </div>
        ` : ''}
        <div class="location-name">${location.revealed ? location.emoji + ' ' + location.name : '🔒 Locked'}</div>
        ${location.revealed && location.effect ? `
          <div class="location-effect">${location.description}</div>
        ` : ''}
      </div>
      <div class="zone zone-opponent" id="zone-opponent-${index}"></div>
      <div class="zone zone-player" id="zone-player-${index}" data-location-index="${index}"></div>
    `;
    
    container.appendChild(locationDiv);
    
    // Render cards in zones
    if (location.revealed) {
      renderZone(index, 'opponent');
      renderZone(index, 'player');
      
      // Make player zone droppable
      const playerZone = document.getElementById(`zone-player-${index}`);
      setupDropZone(playerZone, index);
    }
  });
}

function renderZone(locationIndex, side) {
  const zoneId = `zone-${side}-${locationIndex}`;
  const zone = document.getElementById(zoneId);
  if (!zone) return;
  
  const board = side === 'player' ? game.playerBoard : game.opponentBoard;
  const cards = board[`loc${locationIndex}`] || [];
  
  zone.innerHTML = '';
  
  // Render cards
  cards.forEach(card => {
    const cardDiv = createCardElement(card, false);
    cardDiv.classList.add('revealed');
    // Double click to view detail
    cardDiv.ondblclick = () => showCardDetail(card);
    zone.appendChild(cardDiv);
  });
}

function renderHand() {
  const container = document.getElementById('hand');
  container.innerHTML = '';
  
  game.playerHand.forEach(card => {
    const cardDiv = createCardElement(card, true);
    cardDiv.classList.add('hand-card');
    
    // Check if playable
    const canPlay = card.cost <= game.energy;
    if (!canPlay) {
      cardDiv.classList.add('disabled');
    } else {
      // Setup drag
      setupDraggableCard(cardDiv, card);
      // Double click to view detail
      cardDiv.ondblclick = () => showCardDetail(card);
    }
    
    container.appendChild(cardDiv);
  });
}

function createCardElement(card, clickable) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <div class="card-power">${card.power}</div>
    <div class="card-emoji">${card.emoji}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-effect">${card.description || ''}</div>
  `;
  return div;
}

// ========== DRAG & DROP ==========
function setupDraggableCard(cardDiv, card) {
  cardDiv.draggable = true;
  
  cardDiv.addEventListener('dragstart', (e) => {
    draggedCard = card;
    cardDiv.classList.add('dragging');
    
    // Create drag preview
    dragPreview = cardDiv.cloneNode(true);
    dragPreview.classList.add('drag-preview');
    dragPreview.style.position = 'fixed';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '10000';
    document.body.appendChild(dragPreview);
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', cardDiv.innerHTML);
    
    // Hide default drag image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  });
  
  cardDiv.addEventListener('drag', (e) => {
    if (dragPreview && e.clientX && e.clientY) {
      dragPreview.style.left = (e.clientX - 50) + 'px';
      dragPreview.style.top = (e.clientY - 60) + 'px';
    }
  });
  
  cardDiv.addEventListener('dragend', (e) => {
    cardDiv.classList.remove('dragging');
    if (dragPreview) {
      document.body.removeChild(dragPreview);
      dragPreview = null;
    }
    draggedCard = null;
    
    // Remove all drop-target highlights
    document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
  });
}

function setupDropZone(zone, locationIndex) {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    zone.classList.add('drop-target');
  });
  
  zone.addEventListener('dragleave', (e) => {
    zone.classList.remove('drop-target');
  });
  
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drop-target');
    
    if (draggedCard) {
      const success = game.playCard(draggedCard, locationIndex, true);
      
      if (success) {
        renderGame();
        
        // Vibration feedback
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        
        // Show effect
        game.showEffect(`${draggedCard.name} played!`);
      }
    }
  });
}

// ========== MODALS ==========
function showCardDetail(card) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailModalBody');
  
  const cardDiv = createCardElement(card, false);
  cardDiv.classList.add('detail-card-large');
  
  body.innerHTML = `
    <h2 style="color:#fbbf24; font-size:28px; margin-bottom:20px;">${card.emoji} ${card.name}</h2>
    ${cardDiv.outerHTML}
    <div class="detail-description">${card.description || 'No special effect'}</div>
    <div class="detail-stats">
      <div class="detail-stat">
        <div class="detail-stat-label">Cost</div>
        <div class="detail-stat-value">${card.cost}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">Power</div>
        <div class="detail-stat-value">${card.power}</div>
      </div>
      ${card.trigger ? `
        <div class="detail-stat">
          <div class="detail-stat-label">Trigger</div>
          <div class="detail-stat-value" style="font-size:14px;">${card.trigger.replace('_', ' ')}</div>
        </div>
      ` : ''}
    </div>
  `;
  
  modal.classList.add('show');
}

function showLocationDetail(location) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailModalBody');
  
  body.innerHTML = `
    <h2 style="color:#fbbf24; font-size:32px; margin-bottom:20px;">${location.emoji} ${location.name}</h2>
    <div class="detail-description" style="font-size:18px; margin:30px 0;">
      ${location.description || 'Standard location with no special effect'}
    </div>
    ${location.effect ? `
      <div class="detail-stats">
        <div class="detail-stat">
          <div class="detail-stat-label">Effect Type</div>
          <div class="detail-stat-value" style="font-size:16px;">${location.effect.replace(/_/g, ' ')}</div>
        </div>
      </div>
    ` : ''}
  `;
  
  modal.classList.add('show');
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('show');
}

// ========== HANDLERS ==========
function handleEndTurn() {
  if (game.gameOver) return;
  
  const result = game.endTurn();
  renderGame();
  startTurnTimer();
  
  if (result) {
    stopTurnTimer();
    showGameOver(result);
  }
}

function handleSnap() {
  if (game.snapped) return;
  game.snap();
  renderHeader();
}

function handleRetreat() {
  if (confirm('Retreat from this match? You will lose cubes!')) {
    stopTurnTimer();
    const result = game.retreat();
    showGameOver(result);
  }
}

function showGameOver(result) {
  const modal = document.getElementById('gameOverModal');
  const title = document.getElementById('gameOverTitle');
  const subtitle = document.getElementById('gameOverSubtitle');
  
  title.className = 'modal-title ' + result.result;
  
  if (result.result === 'victory') {
    title.textContent = '🏆 VICTORY!';
    subtitle.textContent = `You won ${result.playerWins} locations!`;
  } else if (result.result === 'defeat') {
    title.textContent = '💀 DEFEAT';
    subtitle.textContent = `Opponent won ${result.opponentWins} locations`;
  } else if (result.result === 'retreat') {
    title.textContent = '🏃 RETREAT';
    subtitle.textContent = 'You retreated from the match';
  } else {
    title.textContent = '🤝 DRAW';
    subtitle.textContent = 'It\'s a tie!';
  }
  
  document.getElementById('playerFinalScore').textContent = result.playerTotalPower;
  document.getElementById('opponentFinalScore').textContent = result.opponentTotalPower;
  document.getElementById('cubesWon').textContent = result.cubesWon > 0 ? `+${result.cubesWon}` : result.cubesWon;
  
  modal.classList.add('show');
  
  // Save stats to Firestore
  if (currentUser) {
    saveGameStats(result);
  }
}

async function saveGameStats(result) {
  try {
    await db.collection('wirc_snap_games').add({
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      result: result.result,
      playerWins: result.playerWins,
      opponentWins: result.opponentWins,
      playerScore: result.playerTotalPower,
      opponentScore: result.opponentTotalPower,
      cubesWon: result.cubesWon,
      turn: game.turn,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Game stats saved to Firestore');
  } catch (error) {
    console.error('❌ Error saving game stats:', error);
  }
}

function resetGame() {
  document.getElementById('gameOverModal').classList.remove('show');
  game = new GameEngine();
  renderGame();
  startTurnTimer();
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  if (!game || game.gameOver) return;
  
  // ESC = Close modal
  if (e.code === 'Escape') {
    closeDetailModal();
    return;
  }
  
  // Space = End Turn
  if (e.code === 'Space') {
    e.preventDefault();
    handleEndTurn();
  }
  
  // S = Snap
  if (e.code === 'KeyS') {
    e.preventDefault();
    handleSnap();
  }
  
  // R = Retreat
  if (e.code === 'KeyR') {
    e.preventDefault();
    handleRetreat();
  }
  
  // Number keys = Open card detail
  if (e.code.startsWith('Digit')) {
    const index = parseInt(e.code.replace('Digit', '')) - 1;
    if (game.playerHand[index]) {
      showCardDetail(game.playerHand[index]);
    }
  }
});

// Close modal on background click
document.getElementById('detailModal').addEventListener('click', (e) => {
  if (e.target.id === 'detailModal') {
    closeDetailModal();
  }
});

console.log('🎮 WIRC SNAP v4.0 loaded!');
console.log('Controls:');
console.log('  Drag & Drop cards to locations');
console.log('  Double-click cards/locations for details');
console.log('  Space = End Turn');
console.log('  S = Snap');
console.log('  R = Retreat');
console.log('  ESC = Close modal');
console.log('  1-9 = View card detail');
