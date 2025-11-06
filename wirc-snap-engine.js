// WIRC SNAP - Game Engine
// Card Battle Game - WIRC Characters - FULL ROSTER 24 CARDS

// ========== CARD DATABASE - ALL 24 WIRC CHARACTERS ==========
const CARDS = [
  { id: 'fracks', name: 'Fracks', cost: 4, power: 6, emoji: '👔', trigger: 'ongoing', effect: 'boost_blortz', value: 1, description: 'Blortz qui +1 Forza' },
  { id: 'tommy', name: 'Tommy Guardu', cost: 5, power: 8, emoji: '⚽', trigger: 'ongoing', effect: 'enemy_debuff', value: 1, description: 'Nemici qui -1 Forza' },
  { id: 'bosi', name: 'Bosi', cost: 2, power: 3, emoji: '🌿', trigger: 'ongoing', effect: 'regen', value: 1, description: '+1 Forza ogni turno' },
  { id: 'dux', name: 'Dux', cost: 2, power: 3, emoji: '🧘', trigger: 'on_reveal', effect: 'boost_if_relaxato', value: 2, description: '+2 se hai Relaxato' },
  { id: 'chep', name: 'Chep', cost: 3, power: 2, emoji: '💭', trigger: 'on_reveal', effect: 'disable_ongoing', description: 'Disattiva Continuo nemico' },
  { id: 'toti', name: 'Toti', cost: 3, power: 4, emoji: '☕', trigger: 'ongoing', effect: 'boost_allenatori', value: 1, description: 'Allenatori +1' },
  { id: 'paolino', name: 'Paolino', cost: 1, power: 1, emoji: '🔍', trigger: 'on_reveal', effect: 'draw_card', description: 'Pesca 1 carta' },
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
];

const LOCATIONS = [
  { id: 'bar_wirc', name: 'Bar WIRC', emoji: '🍺', effect: null, description: 'Nessun effetto' },
  { id: 'campo_atletico', name: 'Campo Atletico', emoji: '⚽', effect: 'plus_one_energy', description: '+1 Energia a entrambi' },
  { id: 'palestra', name: 'Palestra', emoji: '💪', effect: 'cards_plus_two', description: 'Card qui +2 Forza' },
  { id: 'circolo', name: 'Circolo', emoji: '🏛️', effect: null, description: 'Nessun effetto' },
  { id: 'spogliatoi', name: 'Spogliatoi', emoji: '👕', effect: 'destroy_lowest', description: 'Distrugge carta -forza T5' },
  { id: 'canna_relax', name: 'Zona Relax', emoji: '🌿', effect: 'add_bonus', description: 'Aggiunge bonus T3' },
  { id: 'tribune', name: 'Tribune', emoji: '🎪', effect: 'cost_plus_one', description: 'Card costano +1' },
  { id: 'sala_giochi', name: 'Sala Giochi', emoji: '🎮', effect: 'draw_on_play', description: 'Gioca qui = pesca 1' },
];

// ========== GAME STATE ==========
class GameEngine {
  constructor() {
    this.reset();
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
    
    // Decks
    const shuffled = this.shuffle([...CARDS]);
    this.playerDeck = shuffled.slice(0, 12).map(c => ({ ...c, instanceId: `p_${Math.random()}` }));
    this.opponentDeck = shuffled.slice(0, 12).map(c => ({ ...c, instanceId: `o_${Math.random()}` }));
    
    // Hands
    this.playerHand = this.drawCards(this.playerDeck, 4);
    this.opponentHand = this.drawCards(this.opponentDeck, 4);
    
    // Boards
    this.playerBoard = { loc0: [], loc1: [], loc2: [] };
    this.opponentBoard = { loc0: [], loc1: [], loc2: [] };
    
    // Locations
    const shuffledLocs = this.shuffle([...LOCATIONS]);
    this.locations = shuffledLocs.slice(0, 3).map((loc, i) => ({
      ...loc,
      revealed: i === 0,  // PRIMO CAMPO SCOPERTO SUBITO
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

  // Max 7 cards in hand
  canDrawCard(hand) {
    return hand.length < 7;
  }

  playCard(card, locationIndex, isPlayer = true) {
    if (!card || locationIndex < 0 || locationIndex > 2) return false;
    
    const board = isPlayer ? this.playerBoard : this.opponentBoard;
    const hand = isPlayer ? this.playerHand : this.opponentHand;
    const locationKey = `loc${locationIndex}`;
    
    // Check energy cost
    if (isPlayer && card.cost > this.energy) return false;
    
    // Check space (max 4 cards per location)
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
    
    // Trigger On Reveal
    this.triggerOnReveal(card, locationIndex, isPlayer);
    
    return true;
  }

  triggerOnReveal(card, locationIndex, isPlayer) {
    if (card.trigger !== 'on_reveal') return;
    
    const effect = card.effect;
    
    if (effect === 'move_enemy') {
      // Spider-Man: move random enemy card
      const oppBoard = isPlayer ? this.opponentBoard : this.playerBoard;
      const locationKey = `loc${locationIndex}`;
      if (oppBoard[locationKey].length > 0) {
        const randomIndex = Math.floor(Math.random() * oppBoard[locationKey].length);
        const movedCard = oppBoard[locationKey].splice(randomIndex, 1)[0];
        // Move to random other location
        const otherLocs = [0, 1, 2].filter(i => i !== locationIndex && oppBoard[`loc${i}`].length < 4);
        if (otherLocs.length > 0) {
          const newLoc = otherLocs[Math.floor(Math.random() * otherLocs.length)];
          oppBoard[`loc${newLoc}`].push(movedCard);
          this.showEffect(`${card.name} moved enemy card!`);
        }
      }
    } else if (effect === 'transform_location') {
      // Scarlet Witch: transform location
      const shuffled = this.shuffle([...LOCATIONS]);
      const newLoc = shuffled.find(l => !this.locations.find(loc => loc.id === l.id));
      if (newLoc) {
        this.locations[locationIndex] = { ...newLoc, revealed: true, revealTurn: this.turn, locked: false };
        this.showEffect(`Location transformed to ${newLoc.name}!`);
      }
    } else if (effect === 'boost_if_next') {
      // Hawkeye: +2 if next card played here
      // This is tracked in calculate power
    }
  }

  calculateLocationPower(locationIndex) {
    const playerCards = this.playerBoard[`loc${locationIndex}`];
    const opponentCards = this.opponentBoard[`loc${locationIndex}`];
    const location = this.locations[locationIndex];
    
    let playerPower = 0;
    let opponentPower = 0;
    
    // Calculate base power
    for (const card of playerCards) {
      let power = card.power;
      
      // Apply ongoing effects
      if (card.trigger === 'ongoing') {
        if (card.effect === 'loc_boost') {
          // Iron Man: +5 to others here
          power = 0;
        } else if (card.effect === 'allies_boost') {
          // Captain America: +1 to allies
          power += card.value;
        } else if (card.effect === 'boost_if_full') {
          // Ant-Man: +3 if location full
          if (playerCards.length + opponentCards.length >= 8) {
            power += card.value;
          }
        }
      }
      
      // Apply location effects
      if (location.effect === 'cards_plus_two') {
        power += 2;
      }
      
      playerPower += power;
    }
    
    // Iron Man effect
    const ironMan = playerCards.find(c => c.id === 'iron_man');
    if (ironMan) {
      playerPower += 5 * (playerCards.length - 1);
    }
    
    // Captain America effect
    const capCount = playerCards.filter(c => c.id === 'captain_america').length;
    if (capCount > 0) {
      playerPower += capCount * (playerCards.length - capCount);
    }
    
    // Same for opponent
    for (const card of opponentCards) {
      let power = card.power;
      if (card.trigger === 'ongoing') {
        if (card.effect === 'loc_boost') power = 0;
        else if (card.effect === 'allies_boost') power += card.value;
        else if (card.effect === 'boost_if_full') {
          if (playerCards.length + opponentCards.length >= 8) power += card.value;
        }
      }
      if (location.effect === 'cards_plus_two') power += 2;
      opponentPower += power;
    }
    
    const oppIronMan = opponentCards.find(c => c.id === 'iron_man');
    if (oppIronMan) {
      opponentPower += 5 * (opponentCards.length - 1);
    }
    
    const oppCapCount = opponentCards.filter(c => c.id === 'captain_america').length;
    if (oppCapCount > 0) {
      opponentPower += oppCapCount * (opponentCards.length - oppCapCount);
    }
    
    return { player: playerPower, opponent: opponentPower };
  }

  endTurn() {
    // Opponent plays (AI)
    this.aiTurn();
    
    // Next turn
    this.turn++;
    this.maxEnergy = Math.min(6, this.turn);
    this.energy = this.maxEnergy;
    
    // Draw cards (MAX 7 IN HAND)
    if (this.playerDeck.length > 0 && this.canDrawCard(this.playerHand)) {
      this.playerHand.push(this.playerDeck.shift());
    }
    if (this.opponentDeck.length > 0 && this.canDrawCard(this.opponentHand)) {
      this.opponentHand.push(this.opponentDeck.shift());
    }
    
    // Reveal locations
    for (const loc of this.locations) {
      if (!loc.revealed && this.turn >= loc.revealTurn) {
        loc.revealed = true;
        this.showEffect(`📍 ${loc.name} revealed!`);
        this.applyLocationRevealEffect(loc);
      }
    }
    
    // Check game over
    if (this.turn > 6) {
      this.gameOver = true;
      return this.calculateWinner();
    }
    
    return null;
  }

  applyLocationRevealEffect(location) {
    if (location.effect === 'plus_one_energy') {
      this.maxEnergy++;
      this.energy++;
    } else if (location.effect === 'add_raptor' && this.turn === 3) {
      const raptor = { id: 'raptor', name: 'Raptor', cost: 1, power: 3, emoji: '🦖', trigger: null, instanceId: `raptor_${Math.random()}` };
      for (let i = 0; i < 3; i++) {
        const locKey = `loc${i}`;
        if (this.playerBoard[locKey].length < 4) {
          this.playerBoard[locKey].push({ ...raptor, instanceId: `p_raptor_${i}` });
        }
        if (this.opponentBoard[locKey].length < 4) {
          this.opponentBoard[locKey].push({ ...raptor, instanceId: `o_raptor_${i}` });
        }
      }
    }
  }

  aiTurn() {
    // Simple AI: play highest cost affordable cards
    const playable = this.opponentHand
      .filter(c => c.cost <= this.maxEnergy)
      .sort((a, b) => b.cost - a.cost);
    
    let aiEnergy = this.maxEnergy;
    const played = [];
    
    for (const card of playable) {
      if (card.cost > aiEnergy) continue;
      
      // Find best location (with space)
      for (let i = 0; i < 3; i++) {
        if (this.opponentBoard[`loc${i}`].length < 4) {
          if (this.playCard(card, i, false)) {
            aiEnergy -= card.cost;
            played.push(card);
            break;
          }
        }
      }
      
      if (aiEnergy <= 0) break;
    }
    
    // AI Snap logic (30% chance if winning)
    if (!this.opponentSnapped && this.turn >= 3 && Math.random() < 0.3) {
      const winning = this.locations.filter((loc, i) => {
        const power = this.calculateLocationPower(i);
        return power.opponent > power.player;
      }).length;
      
      if (winning >= 2) {
        this.opponentSnapped = true;
        this.cubes = Math.min(8, this.cubes * 2);
        this.showEffect('🤖 Opponent SNAPPED!');
      }
    }
  }

  calculateWinner() {
    let playerWins = 0;
    let opponentWins = 0;
    let playerTotalPower = 0;
    let opponentTotalPower = 0;
    
    for (let i = 0; i < 3; i++) {
      const power = this.calculateLocationPower(i);
      playerTotalPower += power.player;
      opponentTotalPower += power.opponent;
      
      if (power.player > power.opponent) playerWins++;
      else if (power.opponent > power.player) opponentWins++;
    }
    
    let result = 'draw';
    if (playerWins > opponentWins) result = 'victory';
    else if (opponentWins > playerWins) result = 'defeat';
    
    return {
      result,
      playerWins,
      opponentWins,
      playerTotalPower,
      opponentTotalPower,
      cubesWon: result === 'victory' ? this.cubes : (result === 'defeat' ? -this.cubes : 0)
    };
  }

  snap() {
    if (!this.snapped) {
      this.snapped = true;
      this.cubes = Math.min(8, this.cubes * 2);
      this.showEffect('⚡ You SNAPPED! Cubes doubled!');
    }
  }

  retreat() {
    this.gameOver = true;
    return {
      result: 'retreat',
      playerWins: 0,
      opponentWins: 3,
      playerTotalPower: 0,
      opponentTotalPower: 999,
      cubesWon: -Math.floor(this.cubes / 2)
    };
  }

  showEffect(message) {
    const notification = document.createElement('div');
    notification.className = 'effect-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}

// Export for use
window.GameEngine = GameEngine;
