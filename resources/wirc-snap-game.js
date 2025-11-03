// WIRC SNAP v2.5 - Complete Game Logic
// Marvel Snap-like card game

(function() {
  'use strict';

  // === GAME STATE ===
  const gameState = {
    turn: 1,
    maxTurns: 6,
    energy: 1,
    maxEnergy: 1,
    locations: [],
    playerHand: [],
    playerDeck: [],
    aiHand: [],
    aiDeck: [],
    board: {
      0: { player: [], ai: [] },
      1: { player: [], ai: [] },
      2: { player: [], ai: [] }
    },
    selectedCard: null,
    allCards: [],
    allLocations: []
  };

  // === LOAD DATA ===
  async function loadGameData() {
    try {
      const [cardsRes, locationsRes] = await Promise.all([
        fetch('data/wirc-snap-cards.json'),
        fetch('data/wirc-snap-locations.json')
      ]);
      
      gameState.allCards = await cardsRes.json();
      gameState.allLocations = await locationsRes.json();
      
      console.log('✅ Loaded', gameState.allCards.length, 'cards');
      console.log('✅ Loaded', gameState.allLocations.length, 'locations');
    } catch (e) {
      console.error('❌ Error loading data:', e);
      alert('Errore caricamento dati! Verifica che i file JSON esistano.');
    }
  }

  // === SHUFFLE ===
  function shuffle(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  // === INIT GAME ===
  async function initGame() {
    await loadGameData();
    
    // Seleziona 3 location casuali
    const shuffledLocations = shuffle([...gameState.allLocations]);
    gameState.locations = shuffledLocations.slice(0, 3);
    
    // Crea mazzi (12 carte per giocatore e IA)
    const shuffledCards = shuffle([...gameState.allCards]);
    gameState.playerDeck = shuffledCards.slice(0, 12).map(c => ({...c, currentForza: c.forza}));
    gameState.aiDeck = shuffledCards.slice(12, 24).map(c => ({...c, currentForza: c.forza}));
    
    // Pesca mano iniziale (3 carte)
    for (let i = 0; i < 3; i++) {
      drawCard('player');
      drawCard('ai');
    }
    
    renderBoard();
    renderHand();
    updateUI();
    
    console.log('🎮 Game started!');
  }

  // === DRAW CARD ===
  function drawCard(player) {
    const deck = player === 'player' ? gameState.playerDeck : gameState.aiDeck;
    const hand = player === 'player' ? gameState.playerHand : gameState.aiHand;
    
    if (deck.length === 0) return null;
    if (hand.length >= 5) return null; // Max 5 carte in mano
    
    const card = deck.pop();
    hand.push(card);
    
    console.log(`🃏 ${player} drew:`, card.nome);
    return card;
  }

  // === RENDER BOARD ===
  function renderBoard() {
    const board = document.getElementById('gameBoard');
    if (!board) return;
    
    board.innerHTML = '';
    
    gameState.locations.forEach((location, idx) => {
      const col = document.createElement('div');
      col.className = 'location-column';
      col.dataset.locationIdx = idx;
      
      col.innerHTML = `
        <div class="location-header">
          <div class="location-name">${location.nome}</div>
          <div class="location-effect">${location.effetto}</div>
        </div>
        <div class="location-slots">
          <div class="player-area ai-area" data-location="${idx}" data-player="ai">
            <div class="area-label">IA</div>
            <div class="cards-container" id="aiCards${idx}"></div>
          </div>
          <div class="player-area user-area" data-location="${idx}" data-player="user">
            <div class="area-label">Tu</div>
            <div class="cards-container" id="userCards${idx}"></div>
          </div>
        </div>
      `;
      
      // Click su area per giocare carta
      const userArea = col.querySelector('.user-area');
      userArea.addEventListener('click', () => playCardToLocation(idx));
      
      board.appendChild(col);
    });
    
    updateBoardCards();
  }

  // === UPDATE BOARD CARDS ===
  function updateBoardCards() {
    for (let i = 0; i < 3; i++) {
      // IA cards
      const aiContainer = document.getElementById(`aiCards${i}`);
      if (aiContainer) {
        aiContainer.innerHTML = gameState.board[i].ai.map(card => createCardHTML(card, true)).join('');
      }
      
      // User cards
      const userContainer = document.getElementById(`userCards${i}`);
      if (userContainer) {
        userContainer.innerHTML = gameState.board[i].user.map(card => createCardHTML(card, false)).join('');
      }
    }
  }

  // === CREATE CARD HTML ===
  function createCardHTML(card, isAI) {
    const categories = card.categorie.map(c => `<span class="category-badge">${c}</span>`).join('');
    
    return `
      <div class="card ${isAI ? 'ai-card' : ''}" data-card-name="${card.nome}">
        <div class="card-header">
          <div class="card-cost">${card.costo}</div>
          <div class="card-power">${card.currentForza || card.forza}</div>
        </div>
        <div class="card-name">${card.nome}</div>
        <div class="card-categories">${categories}</div>
        <div class="card-effect">${card.effetto.descrizione}</div>
      </div>
    `;
  }

  // === RENDER HAND ===
  function renderHand() {
    const hand = document.getElementById('playerHand');
    if (!hand) return;
    
    hand.innerHTML = '';
    
    gameState.playerHand.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'hand-card';
      if (card.costo > gameState.energy) {
        cardEl.classList.add('disabled');
      }
      if (gameState.selectedCard === idx) {
        cardEl.classList.add('selected');
      }
      
      const categories = card.categorie.map(c => `<span class="category-badge">${c}</span>`).join('');
      
      cardEl.innerHTML = `
        <div class="card-header">
          <div class="card-cost">${card.costo}</div>
          <div class="card-power">${card.currentForza || card.forza}</div>
        </div>
        <div class="card-name">${card.nome}</div>
        <div class="card-categories">${categories}</div>
        <div class="card-effect">${card.effetto.descrizione}</div>
      `;
      
      cardEl.addEventListener('click', () => selectCard(idx));
      hand.appendChild(cardEl);
    });
  }

  // === SELECT CARD ===
  function selectCard(idx) {
    const card = gameState.playerHand[idx];
    if (card.costo > gameState.energy) {
      alert('⚠️ Energia insufficiente!');
      return;
    }
    
    gameState.selectedCard = idx;
    renderHand();
    console.log('✅ Carta selezionata:', card.nome);
  }

  // === PLAY CARD TO LOCATION ===
  function playCardToLocation(locationIdx) {
    if (gameState.selectedCard === null) {
      alert('⚠️ Seleziona prima una carta dalla mano!');
      return;
    }
    
    // Check max 4 carte per campo
    if (gameState.board[locationIdx].user.length >= 4) {
      alert('⚠️ Campo pieno! Max 4 carte per campo.');
      return;
    }
    
    const card = gameState.playerHand[gameState.selectedCard];
    
    // Rimuovi dalla mano
    gameState.playerHand.splice(gameState.selectedCard, 1);
    
    // Aggiungi al board
    gameState.board[locationIdx].user.push(card);
    
    // Riduci energia
    gameState.energy -= card.costo;
    
    // Applica effetti
    applyCardEffects(card, locationIdx, 'user');
    
    gameState.selectedCard = null;
    
    renderHand();
    updateBoardCards();
    updateUI();
    
    console.log('🎯 Giocata carta:', card.nome, 'in location', locationIdx);
  }

  // === APPLY CARD EFFECTS ===
  function applyCardEffects(card, locationIdx, player) {
    // Effetti "Alla Scoperta"
    if (card.effetto.tipo === 'Alla Scoperta') {
      console.log('✨ Effetto Alla Scoperta:', card.nome);
      
      // Dux +2 forza se c'è altro Relaxato
      if (card.nome === 'Dux') {
        const location = gameState.board[locationIdx][player];
        const hasRelaxato = location.some(c => c.nome !== 'Dux' && c.categorie.includes('Relaxato'));
        if (hasRelaxato) {
          card.currentForza = card.forza + 2;
          console.log('  → Dux +2 Forza!');
        }
      }
      
      // Paolino pesca carta
      if (card.nome === 'Paolino') {
        drawCard(player);
        renderHand();
        console.log('  → Paolino pesca 1 carta!');
      }
      
      // Boro +1 energia massima
      if (card.nome === 'Boro') {
        gameState.maxEnergy += 1;
        console.log('  → Boro +1 Energia massima!');
      }
    }
    
    // Effetti di Location
    applyLocationEffects(card, locationIdx);
  }

  // === APPLY LOCATION EFFECTS ===
  function applyLocationEffects(card, locationIdx) {
    const location = gameState.locations[locationIdx];
    
    // Check categorie bonus
    if (location.bonusCategorie && location.bonusCategorie.length > 0) {
      const hasCategory = card.categorie.some(c => location.bonusCategorie.includes(c));
      if (hasCategory) {
        card.currentForza = (card.currentForza || card.forza) + location.bonusValore;
        console.log(`  → ${card.nome} +${location.bonusValore} Forza da ${location.nome}!`);
      }
    }
    
    // Check forza condizionale (es. Sala Grande)
    if (location.condizione === 'forza >= 6' && card.forza >= 6) {
      card.currentForza = (card.currentForza || card.forza) + location.bonusValore;
      console.log(`  → ${card.nome} +${location.bonusValore} da ${location.nome}!`);
    }
  }

  // === AI TURN ===
  function aiTurn() {
    console.log('🤖 IA Turn...');
    
    if (gameState.aiHand.length === 0) {
      console.log('  → IA ha 0 carte in mano');
      return;
    }
    
    // Filtra carte giocabili
    const playableCards = gameState.aiHand.filter(c => c.costo <= gameState.energy);
    if (playableCards.length === 0) {
      console.log('  → IA non ha abbastanza energia');
      return;
    }
    
    // Gioca 1-2 carte casuali
    const numPlays = Math.min(Math.floor(Math.random() * 2) + 1, playableCards.length);
    
    for (let i = 0; i < numPlays; i++) {
      if (gameState.energy <= 0) break;
      
      const card = playableCards[Math.floor(Math.random() * playableCards.length)];
      if (!card || card.costo > gameState.energy) continue;
      
      // Trova location con spazio
      const availableLocations = [0, 1, 2].filter(idx => gameState.board[idx].ai.length < 4);
      if (availableLocations.length === 0) break;
      
      const locationIdx = availableLocations[Math.floor(Math.random() * availableLocations.length)];
      
      // Rimuovi dalla mano
      const handIdx = gameState.aiHand.indexOf(card);
      if (handIdx > -1) {
        gameState.aiHand.splice(handIdx, 1);
      }
      
      // Aggiungi al board
      gameState.board[locationIdx].ai.push(card);
      
      // Riduci energia
      gameState.energy -= card.costo;
      
      // Applica effetti
      applyCardEffects(card, locationIdx, 'ai');
      
      console.log('  → IA gioca:', card.nome, 'in location', locationIdx);
    }
    
    updateBoardCards();
    updateUI();
  }

  // === END TURN ===
  function endTurn() {
    // Disabilita bottone temporaneamente
    const btn = document.getElementById('endTurnBtn');
    if (btn) btn.disabled = true;
    
    // IA turn
    aiTurn();
    
    setTimeout(() => {
      // Avanza turno
      gameState.turn++;
      gameState.energy = Math.min(gameState.turn, 6);
      gameState.maxEnergy = Math.min(gameState.turn, 6);
      
      // Pesca 1 carta per player e AI
      drawCard('player');
      drawCard('ai');
      
      // Check game over
      if (gameState.turn > gameState.maxTurns) {
        endGame();
        return;
      }
      
      // Update UI
      renderHand();
      updateUI();
      
      if (btn) btn.disabled = false;
      
      console.log(`🔄 Turno ${gameState.turn}`);
    }, 1000);
  }

  // === UPDATE UI ===
  function updateUI() {
    const currentEnergyEl = document.getElementById('currentEnergy');
    const maxEnergyEl = document.getElementById('maxEnergy');
    const currentTurnEl = document.getElementById('currentTurn');
    
    if (currentEnergyEl) currentEnergyEl.textContent = gameState.energy;
    if (maxEnergyEl) maxEnergyEl.textContent = gameState.maxEnergy;
    if (currentTurnEl) currentTurnEl.textContent = gameState.turn;
  }

  // === END GAME ===
  function endGame() {
    console.log('🏁 Game Over!');
    
    // Calcola vincitore per ogni location
    const results = [0, 1, 2].map(idx => {
      const playerPower = gameState.board[idx].user.reduce((sum, c) => sum + (c.currentForza || c.forza), 0);
      const aiPower = gameState.board[idx].ai.reduce((sum, c) => sum + (c.currentForza || c.forza), 0);
      
      if (playerPower > aiPower) return 'player';
      if (aiPower > playerPower) return 'ai';
      return 'tie';
    });
    
    const playerWins = results.filter(r => r === 'player').length;
    const aiWins = results.filter(r => r === 'ai').length;
    
    // Show modal
    const modal = document.getElementById('gameOverModal');
    const userWinsEl = document.getElementById('userWins');
    const aiWinsEl = document.getElementById('aiWins');
    const finalResultEl = document.getElementById('finalResult');
    const modalTitleEl = document.getElementById('modalTitle');
    
    if (userWinsEl) userWinsEl.textContent = playerWins;
    if (aiWinsEl) aiWinsEl.textContent = aiWins;
    
    if (playerWins > aiWins) {
      if (modalTitleEl) modalTitleEl.textContent = '🏆 VITTORIA!';
      if (finalResultEl) finalResultEl.textContent = 'Hai vinto!';
    } else if (aiWins > playerWins) {
      if (modalTitleEl) modalTitleEl.textContent = '😢 SCONFITTA';
      if (finalResultEl) finalResultEl.textContent = 'Hai perso!';
    } else {
      if (modalTitleEl) modalTitleEl.textContent = '🤝 PAREGGIO';
      if (finalResultEl) finalResultEl.textContent = 'Parità!';
    }
    
    if (modal) modal.classList.add('active');
  }

  // === INIT ON LOAD ===
  window.addEventListener('DOMContentLoaded', () => {
    const endTurnBtn = document.getElementById('endTurnBtn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', endTurn);
    }
    
    initGame();
  });

})();
