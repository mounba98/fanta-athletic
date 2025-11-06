// WIRC SNAP v5 - Game Engine
// Marvel-style card battle game with WIRC characters

class GameEngine {
  constructor() {
    this.cards = [];
    this.locations = [];
    this.loadedData = false;
    this.reset();
  }

  async loadData() {
    try {
      // Load 67 cards from JSON
      const cardsRes = await fetch('data/wirc-snap-cards-full.json');
      const cardsData = await cardsRes.json();
      this.cards = cardsData.map(c => ({
        id: c.name.toLowerCase().replace(/\s+/g, '_'),
        name: c.name,
        cost: c.cost,
        power: c.power,
        type: c.type,
        effect: c.effect,
        category: c.category,
        emoji: this.getCategoryEmoji(c.category)
      }));

      // Load 17 locations
      const locsRes = await fetch('data/wirc-locations.json');
      this.locations = await locsRes.json();

      this.loadedData = true;
      console.log(`✅ Loaded ${this.cards.length} cards and ${this.locations.length} locations`);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    }
  }

  getCategoryEmoji(category) {
    const emojis = {
      'Tech': '💻', 'Support': '🛡️', 'Tempo': '⏱️', 'Chaos': '🎲',
      'Destroy': '💥', 'Ramp': '⚡', 'Discard': '🗑️', 'Move': '🔄',
      'Swarm': '👥', 'Zoo': '🦁', 'Control': '🎯', 'Combo': '🔗'
    };
    return emojis[category] || '🎴';
  }

  reset() {
    this.turn = 1;
    this.energy = 1;
    this.maxEnergy = 1;
    this.cubes = 1;
    this.snapped = false;
    this.opponentSnapped = false;
    this.selectedCard = null;
    this.selectedLocation = null;
    this.gameOver = false;
    this.timerSeconds = 60;
    
    if (!this.loadedData || this.cards.length === 0) return;

    // Create decks (12 random cards each)
    const shuffled = this.shuffle([...this.cards]);
    this.playerDeck = shuffled.slice(0, 12).map(c => ({ ...c, instanceId: `p_${Math.random()}` }));
    this.opponentDeck = shuffled.slice(12, 24).map(c => ({ ...c, instanceId: `o_${Math.random()}` }));
    
    // Initial hands (4 cards each)
    this.playerHand = this.drawCards(this.playerDeck, 4);
    this.opponentHand = this.drawCards(this.opponentDeck, 4);
    
    // Boards (max 4 cards per location)
    this.playerBoard = { loc0: [], loc1: [], loc2: [] };
    this.opponentBoard = { loc0: [], loc1: [], loc2: [] };
    
    // Select 3 random locations
    const shuffledLocs = this.shuffle([...this.locations]);
    this.gameLocations = shuffledLocs.slice(0, 3).map((loc, i) => ({
      ...loc,
      revealed: i === 0, // First location revealed immediately
      revealTurn: i === 0 ? 1 : (i === 1 ? 2 : 3),
      locked: false
    }));
  }

  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  drawCards(deck, count) {
    const drawn = [];
    for (let i = 0; i < count && deck.length > 0; i++) {
      drawn.push(deck.shift());
    }
    return drawn;
  }

  canDrawCard(hand) {
    return hand.length < 7;
  }

  playCard(card, locationIndex, isPlayer = true) {
    if (!card || locationIndex < 0 || locationIndex > 2) return false;
    
    const board = isPlayer ? this.playerBoard : this.opponentBoard;
    const hand = isPlayer ? this.playerHand : this.opponentHand;
    const locationKey = `loc${locationIndex}`;
    
    // Check location revealed
    if (!this.gameLocations[locationIndex].revealed) return false;
    
    // Check energy cost
    if (isPlayer && card.cost > this.energy) return false;
    
    // Check space (max 4 cards per location = 2x2 grid)
    if (board[locationKey].length >= 4) return false;
    
    // Remove from hand
    const handIndex = hand.findIndex(c => c.instanceId === card.instanceId);
    if (handIndex === -1) return false;
    hand.splice(handIndex, 1);
    
    // Add to board
    board[locationKey].push({ ...card, played: true });
    
    // Spend energy
    if (isPlayer) {
      this.energy -= card.cost;
    }
    
    // Trigger On Reveal effects
    if (card.type === 'on_reveal') {
      this.triggerOnReveal(card, locationIndex, isPlayer);
    }
    
    return true;
  }

  triggerOnReveal(card, locationIndex, isPlayer) {
    // Simplified - full implementation needed per card
    this.showEffect(`✨ ${card.name}: ${card.effect}`);
  }

  calculateLocationPower(locationIndex) {
    const playerCards = this.playerBoard[`loc${locationIndex}`];
    const opponentCards = this.opponentBoard[`loc${locationIndex}`];
    const location = this.gameLocations[locationIndex];
    
    let playerPower = 0;
    let opponentPower = 0;
    
    // Calculate player power
    for (const card of playerCards) {
      let power = card.power;
      
      // Apply ongoing effects (multiplicative system)
      if (card.type === 'ongoing') {
        // Ongoing cards multiply power - e.g. Sala Musica x2
        const multiplier = this.calculateOngoingMultiplier(card, locationIndex, true);
        power = Math.floor(power * multiplier);
      }
      
      // Apply location effects
      power = this.applyLocationEffect(power, card, location);
      
      playerPower += power;
    }
    
    // Calculate opponent power
    for (const card of opponentCards) {
      let power = card.power;
      
      if (card.type === 'ongoing') {
        const multiplier = this.calculateOngoingMultiplier(card, locationIndex, false);
        power = Math.floor(power * multiplier);
      }
      
      power = this.applyLocationEffect(power, card, location);
      opponentPower += power;
    }
    
    return { playerPower, opponentPower };
  }

  calculateOngoingMultiplier(card, locationIndex, isPlayer) {
    let multiplier = 1.0;
    const location = this.gameLocations[locationIndex];
    
    // Sala Musica: ongoing effects activate twice
    if (location.id === 'sala_musica' && location.revealed) {
      multiplier *= 2.0;
    }
    
    // Additional ongoing multipliers can be added here
    return multiplier;
  }

  applyLocationEffect(power, card, location) {
    if (!location.revealed) return power;
    
    switch (location.effect) {
      case 'plus_one':
        return power + 1;
      case 'plus_one_per_card':
        // Bar: +1 per other card in location
        return power + 1;
      case 'boost_cost3_plus':
        // Palestra: cost 3+ cards get +3
        return card.cost >= 3 ? power + 3 : power;
      case 'boost_low_cost':
        // Palestrina: cost 1-2 get +2
        return (card.cost === 1 || card.cost === 2) ? power + 2 : power;
      default:
        return power;
    }
  }

  calculateTotalScore() {
    let playerWins = 0;
    let opponentWins = 0;
    
    for (let i = 0; i < 3; i++) {
      const { playerPower, opponentPower } = this.calculateLocationPower(i);
      
      if (playerPower > opponentPower) {
        playerWins++;
      } else if (opponentPower > playerPower) {
        opponentWins++;
      }
    }
    
    return { playerWins, opponentWins };
  }

  snap(isPlayer = true) {
    if (isPlayer && !this.snapped) {
      this.snapped = true;
      this.cubes = Math.min(this.cubes * 2, 8);
      this.showEffect('⚡ SNAP! Cubes doubled!');
      return true;
    }
    return false;
  }

  retreat(isPlayer = true) {
    if (isPlayer) {
      this.gameOver = true;
      this.showEffect('🏃 You retreated!');
      return { result: 'defeat', cubesLost: Math.floor(this.cubes / 2) };
    }
    return null;
  }

  endTurn() {
    // AI opponent plays
    this.opponentTurn();
    
    // Draw cards
    if (this.canDrawCard(this.playerHand) && this.playerDeck.length > 0) {
      this.playerHand.push(...this.drawCards(this.playerDeck, 1));
    }
    if (this.canDrawCard(this.opponentHand) && this.opponentDeck.length > 0) {
      this.opponentHand.push(...this.drawCards(this.opponentDeck, 1));
    }
    
    // Next turn
    this.turn++;
    // FIX 2: Energia incrementale +1 per turno (max 6)
    this.maxEnergy = Math.min(this.turn, 6);
    this.energy = this.maxEnergy;
    this.timerSeconds = 60;
    
    console.log(`🔋 Turno ${this.turn}: Energia ${this.energy}/${this.maxEnergy}`);
    
    // Reveal locations
    for (const loc of this.gameLocations) {
      if (loc.revealTurn === this.turn) {
        loc.revealed = true;
        this.showEffect(`🗺️ ${loc.name} rivelato!`);
      }
    }
    
    // Check game over (6 turns)
    if (this.turn > 6) {
      this.gameOver = true;
      return this.calculateFinalResult();
    }
    
    return null;
  }

  opponentTurn() {
    // FIX 8: AI più visibile con feedback
    const playableCards = this.opponentHand
      .filter(c => c.cost <= this.energy)
      .sort((a, b) => b.cost - a.cost);
    
    let cardsPlayed = 0;
    
    for (const card of playableCards) {
      if (this.energy < card.cost) continue;
      
      // Find location with space
      const availableLocs = [0, 1, 2].filter(i => 
        this.gameLocations[i].revealed && 
        this.opponentBoard[`loc${i}`].length < 4
      );
      
      if (availableLocs.length > 0) {
        const randomLoc = availableLocs[Math.floor(Math.random() * availableLocs.length)];
        const success = this.playCard(card, randomLoc, false);
        
        if (success) {
          cardsPlayed++;
          console.log(`🤖 AI gioca: ${card.name} (${card.cost}/${card.power}) → Location ${randomLoc}`);
          this.showEffect(`🤖 Avversario gioca ${card.name}!`);
        }
      }
    }
    
    if (cardsPlayed === 0) {
      console.log('🤖 AI: Nessuna carta giocabile');
    }
  }

  calculateFinalResult() {
    const { playerWins, opponentWins } = this.calculateTotalScore();
    
    let result;
    if (playerWins > opponentWins) {
      result = 'victory';
    } else if (opponentWins > playerWins) {
      result = 'defeat';
    } else {
      result = 'draw';
    }
    
    return {
      result,
      playerWins,
      opponentWins,
      cubesWon: result === 'victory' ? this.cubes : (result === 'defeat' ? -this.cubes : 0)
    };
  }

  showEffect(message) {
    // This will be called by UI controller
    if (window.showEffectNotification) {
      window.showEffectNotification(message);
    }
  }

  // Timer tick (call every second)
  tick() {
    if (this.timerSeconds > 0) {
      this.timerSeconds--;
    }
    if (this.timerSeconds === 0) {
      // Auto-end turn
      return this.endTurn();
    }
    return null;
  }
}

// Global instance
window.gameEngine = new GameEngine();
