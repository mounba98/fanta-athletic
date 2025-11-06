// WIRC SNAP MOBILE UI
let engine = null;
let currentUser = null;
let currentDeck = [];

// Wait for Firebase
window.addEventListener('DOMContentLoaded', async () => {
  await waitForFirebase();
  initAuth();
});

async function waitForFirebase() {
  let retries = 0;
  while (!window.firebase && retries < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
}

function initAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      document.getElementById('userName').textContent = user.displayName || 'Player';
      document.getElementById('userInfo').style.display = 'block';
      document.getElementById('loginBtn').style.display = 'none';
    }
  });
  
  document.getElementById('loginBtn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });
  
  document.getElementById('deckBtn').addEventListener('click', showDeckScreen);
  document.getElementById('backToAuth').addEventListener('click', () => {
    showScreen('authScreen');
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  document.getElementById(screenId).style.display = 'flex';
}

// DECK MANAGER
function showDeckScreen() {
  showScreen('deckScreen');
  loadDecks();
}

function loadDecks() {
  const decksJson = localStorage.getItem('wirc_decks') || '[]';
  const decks = JSON.parse(decksJson);
  
  const list = document.getElementById('decksList');
  list.innerHTML = '';
  
  decks.forEach((deck, idx) => {
    const div = document.createElement('div');
    div.className = 'deck-item';
    div.innerHTML = `
      <h3>${deck.name}</h3>
      <p>${deck.cards.length} carte</p>
    `;
    div.addEventListener('click', () => {
      currentDeck = deck.cards;
      localStorage.setItem('wirc_current_deck', JSON.stringify(deck.cards));
      startGame();
    });
    list.appendChild(div);
  });
}

document.getElementById('newDeckBtn').addEventListener('click', () => {
  showScreen('builderScreen');
  loadBuilder();
});

document.getElementById('backToDecks').addEventListener('click', () => {
  showDeckScreen();
});

// DECK BUILDER
async function loadBuilder() {
  const res = await fetch('data/wirc-snap-cards-full.json');
  const cards = await res.json();
  
  const collection = document.getElementById('cardsCollection');
  collection.innerHTML = '';
  
  cards.forEach(card => {
    const div = createMiniCard(card);
    div.addEventListener('click', () => addToDeck(card));
    collection.appendChild(div);
  });
  
  renderCurrentDeck();
}

function createMiniCard(card) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <div class="card-power">${card.power}</div>
    <div class="card-name">${card.name}</div>
  `;
  return div;
}

function addToDeck(card) {
  if (currentDeck.length >= 12) {
    alert('Mazzo completo (12/12)');
    return;
  }
  if (currentDeck.includes(card.name)) {
    alert('Carta già nel mazzo');
    return;
  }
  currentDeck.push(card.name);
  renderCurrentDeck();
}

function removeFromDeck(cardName) {
  const idx = currentDeck.indexOf(cardName);
  if (idx > -1) currentDeck.splice(idx, 1);
  renderCurrentDeck();
}

async function renderCurrentDeck() {
  const res = await fetch('data/wirc-snap-cards-full.json');
  const allCards = await res.json();
  
  const container = document.getElementById('currentDeck');
  container.innerHTML = '';
  
  currentDeck.forEach(name => {
    const card = allCards.find(c => c.name === name);
    if (card) {
      const div = createMiniCard(card);
      div.addEventListener('click', () => removeFromDeck(name));
      container.appendChild(div);
    }
  });
  
  document.getElementById('deckCounter').textContent = currentDeck.length;
}

document.getElementById('saveDeckBtn').addEventListener('click', () => {
  const name = document.getElementById('deckNameInput').value || 'Mazzo';
  
  const decksJson = localStorage.getItem('wirc_decks') || '[]';
  const decks = JSON.parse(decksJson);
  
  decks.push({ name, cards: currentDeck });
  localStorage.setItem('wirc_decks', JSON.stringify(decks));
  
  alert('Mazzo salvato!');
});

document.getElementById('startGameBtn').addEventListener('click', () => {
  if (currentDeck.length < 12) {
    alert('Serve un mazzo di 12 carte');
    return;
  }
  localStorage.setItem('wirc_current_deck', JSON.stringify(currentDeck));
  startGame();
});

// GAME
async function startGame() {
  showScreen('gameScreen');
  
  engine = new WircSnapEngine();
  await engine.init();
  
  renderGame();
  setupGameEvents();
}

function renderGame() {
  // Update UI
  document.getElementById('turnDisplay').textContent = `${engine.turn}/${engine.maxTurn}`;
  document.getElementById('energyDisplay').textContent = `${engine.energy}/${engine.maxEnergy}`;
  document.getElementById('cubesDisplay').textContent = engine.cubes;
  
  // Render locations
  engine.locations.forEach((loc, i) => {
    const locEl = document.querySelector(`.location[data-loc="${i}"]`);
    locEl.querySelector('.loc-name').textContent = loc.revealed ? loc.name : '???';
    locEl.querySelector('.loc-effect').textContent = loc.revealed ? loc.effect : 'Hidden';
  });
  
  // Render boards
  for (let i = 0; i < 3; i++) {
    renderZone(`opp-${i}`, engine.opponentBoard[`loc${i}`]);
    renderZone(`player-${i}`, engine.playerBoard[`loc${i}`]);
  }
  
  // Render hand
  renderHand();
  
  // Update scores
  const scores = engine.calculateScores();
  for (let i = 0; i < 3; i++) {
    document.getElementById(`score-opp-${i}`).textContent = scores.opponent[i];
    document.getElementById(`score-player-${i}`).textContent = scores.player[i];
  }
}

function renderZone(zoneId, cards) {
  const zone = document.querySelector(`[data-zone="${zoneId}"]`);
  zone.innerHTML = '';
  
  cards.forEach(card => {
    const el = createMiniCard(card);
    el.classList.add('play-anim');
    el.addEventListener('click', () => showCardModal(card));
    zone.appendChild(el);
  });
}

function renderHand() {
  const hand = document.getElementById('handCards');
  hand.innerHTML = '';
  
  engine.playerHand.forEach(card => {
    const el = createMiniCard(card);
    
    if (card.cost > engine.energy) {
      el.classList.add('disabled');
    } else {
      el.addEventListener('click', () => selectCardToPlay(card));
    }
    
    hand.appendChild(el);
  });
}

function selectCardToPlay(card) {
  if (card.cost > engine.energy) return;
  
  // Show location picker
  const msg = `Dove giocare ${card.name}?\n\n`;
  const locs = engine.locations.map((l, i) => {
    const canPlay = l.revealed && engine.playerBoard[`loc${i}`].length < 4;
    return `${i + 1}: ${l.name} ${canPlay ? '✓' : '✗'}`;
  }).join('\n');
  
  const choice = prompt(msg + locs + '\n\nScegli 1-3:');
  const loc = parseInt(choice) - 1;
  
  if (loc >= 0 && loc <= 2) {
    const success = engine.playCard(card, loc, true);
    if (success) {
      renderGame();
    } else {
      alert('Non puoi giocare qui!');
    }
  }
}

function setupGameEvents() {
  document.getElementById('endTurnBtn').addEventListener('click', () => {
    const result = engine.endTurn();
    renderGame();
    
    if (result) {
      showGameOver(result);
    }
  });
  
  document.getElementById('snapBtn').addEventListener('click', () => {
    if (engine.snap()) {
      renderGame();
      alert('SNAP! Cubi raddoppiati!');
    }
  });
  
  document.getElementById('retreatBtn').addEventListener('click', () => {
    if (confirm('Ritirarsi e perdere cubi?')) {
      showGameOver(engine.retreat());
    }
  });
  
  // Space = End Turn
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && engine && !engine.gameOver) {
      e.preventDefault();
      document.getElementById('endTurnBtn').click();
    }
  });
}

// CARD MODAL
function showCardModal(card) {
  const modal = document.getElementById('cardModal');
  const front = document.getElementById('cardFront');
  
  front.innerHTML = `
    <div class="card" style="width:100%;height:100%;position:relative;">
      <div class="card-cost">${card.cost}</div>
      <div class="card-power">${card.power}</div>
      <div class="card-name">${card.name}</div>
      <div style="position:absolute;bottom:40px;left:10px;right:10px;background:rgba(0,0,0,0.8);padding:10px;border-radius:8px;font-size:12px;text-align:center;">
        <div style="color:#fbbf24;font-weight:900;margin-bottom:5px;">${card.type.replace('_', ' ').toUpperCase()}</div>
        <div style="color:#fff;line-height:1.4;">${card.effect}</div>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  document.querySelector('.modal-close').onclick = () => {
    modal.style.display = 'none';
  };
  
  document.getElementById('flipBtn').onclick = () => {
    document.querySelector('.card-zoom').classList.toggle('flipped');
  };
}

// GAME OVER
function showGameOver(result) {
  const modal = document.getElementById('gameOverModal');
  const title = document.getElementById('resultTitle');
  const stats = document.getElementById('resultStats');
  
  if (result === 'victory') {
    title.textContent = '🏆 VITTORIA!';
    title.style.color = '#00FF9D';
  } else if (result === 'defeat') {
    title.textContent = '💀 SCONFITTA';
    title.style.color = '#E53935';
  } else if (result === 'retreat') {
    title.textContent = '🏳️ RITIRATO';
    title.style.color = '#AAB2C8';
  } else {
    title.textContent = '🤝 PAREGGIO';
    title.style.color = '#00BFFF';
  }
  
  const scores = engine.calculateScores();
  stats.innerHTML = `
    <div style="margin:20px 0;font-size:18px;">
      ${engine.locations.map((loc, i) => `
        <div style="margin:10px 0;">
          <strong>${loc.name}</strong><br>
          Tu: ${scores.player[i]} | AI: ${scores.opponent[i]}
        </div>
      `).join('')}
    </div>
    <div style="font-size:24px;margin-top:20px;">
      Cubi: ${engine.cubes}
    </div>
  `;
  
  modal.style.display = 'flex';
  
  document.getElementById('newGameBtn').onclick = () => {
    modal.style.display = 'none';
    startGame();
  };
  
  // Save to Firestore
  if (currentUser && window.db) {
    saveGameResult(result);
  }
}

async function saveGameResult(result) {
  try {
    await window.db.collection('wirc_snap_games').add({
      userId: currentUser.uid,
      userName: currentUser.displayName,
      result: result,
      cubes: engine.cubes,
      turn: engine.turn,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error('Save error:', err);
  }
}
