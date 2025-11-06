// WIRC SNAP MOBILE ENGINE
class WircSnapEngine {
  constructor() {
    this.turn = 1;
    this.maxTurn = 6;
    this.energy = 1;
    this.maxEnergy = 1;
    this.cubes = 1;
    
    this.playerHand = [];
    this.playerBoard = { loc0: [], loc1: [], loc2: [] };
    this.opponentBoard = { loc0: [], loc1: [], loc2: [] };
    
    this.locations = [];
    this.allCards = [];
    this.playerDeck = [];
    this.opponentDeck = [];
    
    this.snapped = false;
    this.gameOver = false;
  }

  async init() {
    // Load cards
    const res = await fetch('data/wirc-snap-cards-full.json');
    this.allCards = await res.json();
    
    // Load deck from localStorage or use random
    const savedDeck = localStorage.getItem('wirc_current_deck');
    if (savedDeck) {
      const deckNames = JSON.parse(savedDeck);
      this.playerDeck = deckNames.map(name => 
        this.allCards.find(c => c.name === name)
      ).filter(Boolean);
    }
    
    if (this.playerDeck.length < 12) {
      this.playerDeck = this.getRandomCards(12);
    }
    
    this.opponentDeck = this.getRandomCards(12);
    this.shuffleArray(this.playerDeck);
    this.shuffleArray(this.opponentDeck);
    
    // Draw initial hand (3 cards)
    for (let i = 0; i < 3; i++) {
      if (this.playerDeck.length > 0) {
        this.playerHand.push(this.playerDeck.pop());
      }
    }
    
    // Setup locations
    const allLocs = [
      { name: 'Bar Wirc', effect: 'Nessun effetto', revealTurn: 1 },
      { name: 'Tribune', effect: 'Carte costano -1', revealTurn: 2 },
      { name: 'Sala Musica', effect: 'Effetti continui x2', revealTurn: 3 },
      { name: 'Parcheggio', effect: '+2 forza ultima carta', revealTurn: 1 },
      { name: 'Cucina', effect: 'Prima carta +3 forza', revealTurn: 2 }
    ];
    
    this.shuffleArray(allLocs);
    this.locations = allLocs.slice(0, 3);
  }

  getRandomCards(count) {
    const shuffled = [...this.allCards];
    this.shuffleArray(shuffled);
    return shuffled.slice(0, count);
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  playCard(card, locationIndex, isPlayer) {
    if (card.cost > this.energy) return false;
    
    const board = isPlayer ? this.playerBoard : this.opponentBoard;
    const locKey = `loc${locationIndex}`;
    
    if (board[locKey].length >= 4) return false;
    if (!this.locations[locationIndex].revealed) return false;
    
    board[locKey].push(card);
    this.energy -= card.cost;
    
    if (isPlayer) {
      const idx = this.playerHand.indexOf(card);
      if (idx > -1) this.playerHand.splice(idx, 1);
    }
    
    return true;
  }

  endTurn() {
    // AI plays
    this.aiTurn();
    
    // Draw cards
    if (this.playerDeck.length > 0 && this.playerHand.length < 7) {
      this.playerHand.push(this.playerDeck.pop());
    }
    
    // Next turn
    this.turn++;
    this.maxEnergy = Math.min(this.turn, 6);
    this.energy = this.maxEnergy;
    
    // Reveal locations
    this.locations.forEach(loc => {
      if (loc.revealTurn === this.turn) {
        loc.revealed = true;
      }
    });
    
    // Check game over
    if (this.turn > 6) {
      this.gameOver = true;
      return this.calculateWinner();
    }
    
    return null;
  }

  aiTurn() {
    const playable = this.opponentDeck.filter(c => c.cost <= this.energy);
    playable.sort((a, b) => b.cost - a.cost);
    
    for (const card of playable) {
      if (this.energy < card.cost) continue;
      
      const locs = [0, 1, 2].filter(i => 
        this.locations[i].revealed && 
        this.opponentBoard[`loc${i}`].length < 4
      );
      
      if (locs.length > 0) {
        const loc = locs[Math.floor(Math.random() * locs.length)];
        this.playCard(card, loc, false);
        const idx = this.opponentDeck.indexOf(card);
        if (idx > -1) this.opponentDeck.splice(idx, 1);
      }
    }
  }

  calculateScores() {
    const scores = { player: [0, 0, 0], opponent: [0, 0, 0] };
    
    for (let i = 0; i < 3; i++) {
      const playerCards = this.playerBoard[`loc${i}`];
      const oppCards = this.opponentBoard[`loc${i}`];
      
      scores.player[i] = playerCards.reduce((sum, c) => sum + c.power, 0);
      scores.opponent[i] = oppCards.reduce((sum, c) => sum + c.power, 0);
    }
    
    return scores;
  }

  calculateWinner() {
    const scores = this.calculateScores();
    let playerWins = 0;
    let oppWins = 0;
    
    for (let i = 0; i < 3; i++) {
      if (scores.player[i] > scores.opponent[i]) playerWins++;
      else if (scores.opponent[i] > scores.player[i]) oppWins++;
    }
    
    if (playerWins > oppWins) return 'victory';
    if (oppWins > playerWins) return 'defeat';
    return 'draw';
  }

  snap() {
    if (this.snapped) return false;
    this.snapped = true;
    this.cubes *= 2;
    return true;
  }

  retreat() {
    this.gameOver = true;
    return 'retreat';
  }
}

window.WircSnapEngine = WircSnapEngine;
