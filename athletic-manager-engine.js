/**
 * ⚽ ONLINE ATHLETIC MANAGER - GAME ENGINE
 * Sistema completo gestione squadra, allenamenti, mercato, partite
 */

class AthleticManagerEngine {
  constructor(db, auth) {
    this.db = db;
    this.auth = auth;
    this.state = {
      user: null,
      teamId: null,
      team: null,
      players: [],
      league: null,
      matches: []
    };
  }

  // ========== INIZIALIZZAZIONE ==========
  
  async init() {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          window.location.href = 'auth.html';
          return;
        }
        
        this.state.user = user;
        await this.loadUserTeam();
        resolve();
      });
    });
  }

  async loadUserTeam() {
    try {
      // Check if user has a team
      const userDoc = await this.db.collection('users').doc(this.state.user.uid).get();
      
      if (!userDoc.exists || !userDoc.data().managerTeamId) {
        console.log('⚠️ User has no team, creating default...');
        await this.createDefaultTeam();
        return;
      }
      
      this.state.teamId = userDoc.data().managerTeamId;
      await this.loadTeamData();
      
    } catch (e) {
      console.error('Error loading team:', e);
    }
  }

  async createDefaultTeam() {
    const defaultPlayers = this.generateDefaultPlayers();
    
    const teamData = {
      name: `Athletic ${new Date().getFullYear() - 6}`, // Athletic 2018
      owner: this.state.user.uid,
      ownerName: this.state.user.displayName || 'Manager',
      funds: 1200,
      morale: 85,
      stadium: {
        tribune: 1,
        campo: 1,
        spogliatoi: 1,
        luci: 1
      },
      sponsor: {
        name: 'Nike',
        weeklyIncome: 300,
        expiresAt: null
      },
      retreat: {
        active: false,
        endsAt: null
      },
      formation: {
        starters: [], // 5 player IDs
        bench: [] // 3 player IDs
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Create team
    const teamRef = await this.db.collection('manager_teams').add(teamData);
    this.state.teamId = teamRef.id;
    
    // Add players
    const batch = this.db.batch();
    defaultPlayers.forEach(player => {
      const playerRef = this.db.collection('manager_teams').doc(this.state.teamId)
        .collection('players').doc();
      batch.set(playerRef, player);
    });
    await batch.commit();
    
    // Update user
    await this.db.collection('users').doc(this.state.user.uid).update({
      managerTeamId: this.state.teamId
    });
    
    await this.loadTeamData();
  }

  generateDefaultPlayers() {
    const names = [
      'Pato', 'Beppe', 'Luca', 'Marco', 'Ale', 'Simo', 'Fede', 'Dani'
    ];
    const roles = ['P', 'D', 'D', 'C', 'C', 'C', 'A', 'A'];
    
    return names.map((nome, i) => ({
      nome,
      cognome: 'Athletic',
      ruolo: roles[i],
      overall: 68 + Math.floor(Math.random() * 8), // 68-75
      xp: Math.floor(Math.random() * 50),
      age: 20 + Math.floor(Math.random() * 10),
      value: 300 + Math.floor(Math.random() * 200),
      morale: 85,
      injured: false,
      suspended: false
    }));
  }

  async loadTeamData() {
    const teamDoc = await this.db.collection('manager_teams').doc(this.state.teamId).get();
    this.state.team = { id: this.state.teamId, ...teamDoc.data() };
    
    // Load players
    const playersSnap = await this.db.collection('manager_teams').doc(this.state.teamId)
      .collection('players').get();
    
    this.state.players = playersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // ========== SISTEMA XP / OVERALL ==========
  
  async addXP(playerId, amount) {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return;
    
    let newXP = player.xp + amount;
    let newOverall = player.overall;
    
    // Level up check
    while (newXP >= 100) {
      newXP -= 100;
      newOverall += 1;
    }
    
    // Update Firestore
    await this.db.collection('manager_teams').doc(this.state.teamId)
      .collection('players').doc(playerId).update({
        xp: newXP,
        overall: newOverall
      });
    
    // Update local state
    player.xp = newXP;
    player.overall = newOverall;
    
    if (newOverall > player.overall) {
      return { leveledUp: true, newOverall };
    }
    
    return { leveledUp: false };
  }

  // ========== ALLENAMENTI ==========
  
  async startTraining(type) {
    // Check if training already done today
    const today = new Date().toISOString().split('T')[0];
    const trainingDoc = await this.db.collection('manager_teams').doc(this.state.teamId)
      .collection('training').doc(today).get();
    
    if (trainingDoc.exists && trainingDoc.data()[type]) {
      return { success: false, message: 'Allenamento già fatto oggi!' };
    }
    
    // Determine which players get XP
    let affectedPlayers = [];
    const xpAmount = 5 + Math.floor(Math.random() * 6); // 5-10 XP
    
    switch(type) {
      case 'attack':
        affectedPlayers = this.state.players.filter(p => p.ruolo === 'A');
        break;
      case 'defense':
        affectedPlayers = this.state.players.filter(p => ['P', 'D'].includes(p.ruolo));
        break;
      case 'technical':
        affectedPlayers = this.state.players.filter(p => p.ruolo === 'C');
        break;
      case 'fitness':
        affectedPlayers = [...this.state.players];
        break;
    }
    
    // Apply XP with retreat bonus
    const retreatBonus = this.state.team.retreat?.active ? 1.1 : 1.0;
    const finalXP = Math.floor(xpAmount * retreatBonus);
    
    const levelUps = [];
    for (const player of affectedPlayers) {
      const result = await this.addXP(player.id, finalXP);
      if (result.leveledUp) {
        levelUps.push({ name: player.nome, newOverall: result.newOverall });
      }
    }
    
    // Mark training as done
    await this.db.collection('manager_teams').doc(this.state.teamId)
      .collection('training').doc(today).set({
        [type]: true,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    return {
      success: true,
      xpGained: finalXP,
      playersAffected: affectedPlayers.length,
      levelUps
    };
  }

  // ========== FORMAZIONE ==========
  
  async saveFormation(starters, bench) {
    // Validate: 1P, 2D, 2C, 1A
    const roles = starters.map(id => {
      const p = this.state.players.find(pl => pl.id === id);
      return p ? p.ruolo : null;
    });
    
    const roleCount = {
      P: roles.filter(r => r === 'P').length,
      D: roles.filter(r => r === 'D').length,
      C: roles.filter(r => r === 'C').length,
      A: roles.filter(r => r === 'A').length
    };
    
    if (roleCount.P !== 1 || roleCount.D !== 2 || roleCount.C !== 2 || roleCount.A !== 1) {
      return { success: false, message: 'Formazione non valida! Serve: 1P-2D-2C-1A' };
    }
    
    await this.db.collection('manager_teams').doc(this.state.teamId).update({
      'formation.starters': starters,
      'formation.bench': bench
    });
    
    this.state.team.formation = { starters, bench };
    
    return { success: true, message: 'Formazione salvata!' };
  }

  // ========== STADIO ==========
  
  async upgradeStadium(facilityName) {
    const costs = {
      tribune: [500, 800, 1200, 2000],
      campo: [400, 700, 1000, 1500],
      spogliatoi: [300, 600, 900, 1300],
      luci: [250, 500, 800, 1200]
    };
    
    const currentLevel = this.state.team.stadium[facilityName] || 1;
    const cost = costs[facilityName][currentLevel - 1];
    
    if (!cost) {
      return { success: false, message: 'Livello massimo raggiunto!' };
    }
    
    if (this.state.team.funds < cost) {
      return { success: false, message: 'Fondi insufficienti!' };
    }
    
    // Apply upgrade
    await this.db.collection('manager_teams').doc(this.state.teamId).update({
      [`stadium.${facilityName}`]: currentLevel + 1,
      funds: this.state.team.funds - cost
    });
    
    this.state.team.stadium[facilityName] = currentLevel + 1;
    this.state.team.funds -= cost;
    
    return { success: true, newLevel: currentLevel + 1, cost };
  }

  // ========== RITIRO ==========
  
  async startRetreat() {
    const cost = 500;
    
    if (this.state.team.funds < cost) {
      return { success: false, message: 'Fondi insufficienti!' };
    }
    
    if (this.state.team.retreat?.active) {
      return { success: false, message: 'Ritiro già attivo!' };
    }
    
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + 24);
    
    await this.db.collection('manager_teams').doc(this.state.teamId).update({
      'retreat.active': true,
      'retreat.endsAt': endsAt.toISOString(),
      funds: this.state.team.funds - cost,
      morale: Math.min(100, this.state.team.morale + 10)
    });
    
    this.state.team.retreat = { active: true, endsAt: endsAt.toISOString() };
    this.state.team.funds -= cost;
    this.state.team.morale = Math.min(100, this.state.team.morale + 10);
    
    return { success: true, endsAt };
  }

  // ========== SIMULAZIONE PARTITA ==========
  
  async simulateMatch(homeTeamId, awayTeamId) {
    // Load both teams
    const homeDoc = await this.db.collection('manager_teams').doc(homeTeamId).get();
    const awayDoc = await this.db.collection('manager_teams').doc(awayTeamId).get();
    
    const homeTeam = { id: homeTeamId, ...homeDoc.data() };
    const awayTeam = { id: awayTeamId, ...awayDoc.data() };
    
    // Load players
    const homePlayersSnap = await this.db.collection('manager_teams').doc(homeTeamId)
      .collection('players').get();
    const awayPlayersSnap = await this.db.collection('manager_teams').doc(awayTeamId)
      .collection('players').get();
    
    const homePlayers = homePlayersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const awayPlayers = awayPlayersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Calculate team strength
    const homeStrength = this.calculateTeamStrength(homeTeam, homePlayers);
    const awayStrength = this.calculateTeamStrength(awayTeam, awayPlayers);
    
    // Simulate goals
    const homeGoals = this.calculateGoals(homeStrength, awayStrength);
    const awayGoals = this.calculateGoals(awayStrength, homeStrength);
    
    // Determine result
    let result;
    if (homeGoals > awayGoals) result = 'H';
    else if (awayGoals > homeGoals) result = 'A';
    else result = 'D';
    
    // Save match
    const matchData = {
      homeTeamId,
      awayTeamId,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      homeGoals,
      awayGoals,
      result,
      homeStrength,
      awayStrength,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await this.db.collection('manager_matches').add(matchData);
    
    // Update team stats and add XP to players
    await this.updateTeamAfterMatch(homeTeamId, result === 'H', homeGoals, awayGoals);
    await this.updateTeamAfterMatch(awayTeamId, result === 'A', awayGoals, homeGoals);
    
    return matchData;
  }

  calculateTeamStrength(team, players) {
    // Get starter players
    const starters = team.formation?.starters || [];
    const starterPlayers = starters.map(id => players.find(p => p.id === id)).filter(Boolean);
    
    if (starterPlayers.length === 0) {
      // Use best 5 players
      starterPlayers.push(...players.sort((a, b) => b.overall - a.overall).slice(0, 5));
    }
    
    const avgOverall = starterPlayers.reduce((sum, p) => sum + p.overall, 0) / starterPlayers.length;
    const moraleBonus = team.morale / 20; // Max +5 at 100 morale
    const stadiumBonus = Object.values(team.stadium).reduce((sum, level) => sum + level, 0) * 0.5;
    
    return avgOverall + moraleBonus + stadiumBonus + (Math.random() * 4 - 2); // ±2 random
  }

  calculateGoals(attackStrength, defenseStrength) {
    const diff = attackStrength - defenseStrength;
    const baseGoals = Math.max(0, Math.floor((diff + 20) / 15));
    const randomGoals = Math.random() < 0.3 ? 1 : 0;
    
    return Math.min(5, baseGoals + randomGoals);
  }

  async updateTeamAfterMatch(teamId, won, goalsFor, goalsAgainst) {
    const teamDoc = await this.db.collection('manager_teams').doc(teamId).get();
    const team = teamDoc.data();
    
    // Points
    const points = won ? 3 : (goalsFor === goalsAgainst ? 1 : 0);
    
    // Morale change
    let moraleChange = 0;
    if (won) moraleChange = +5;
    else if (goalsFor === goalsAgainst) moraleChange = +1;
    else moraleChange = -3;
    
    const newMorale = Math.max(20, Math.min(100, team.morale + moraleChange));
    
    // Income from match
    const tribuneLevel = team.stadium?.tribune || 1;
    const baseIncome = 100;
    const income = Math.floor(baseIncome * (1 + tribuneLevel * 0.1));
    
    // Update team
    await this.db.collection('manager_teams').doc(teamId).update({
      morale: newMorale,
      funds: team.funds + income
    });
    
    // Add XP to all starters
    const starters = team.formation?.starters || [];
    for (const playerId of starters) {
      await this.addXP(playerId, 2);
    }
  }

  // ========== LEGA & CAMPIONATO ==========
  
  async createLeague(leagueName, numTeams = 8) {
    // Create league
    const leagueData = {
      name: leagueName,
      createdBy: this.state.user.uid,
      creatorTeamId: this.state.teamId,
      teams: [this.state.teamId],
      numTeams,
      matchday: 1,
      totalMatchdays: (numTeams - 1) * 2, // Round-robin home & away
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const leagueRef = await this.db.collection('manager_leagues').add(leagueData);
    const leagueId = leagueRef.id;
    
    // Generate AI teams
    for (let i = 1; i < numTeams; i++) {
      const aiTeamData = {
        name: `Athletic ${2010 + i}`,
        owner: 'AI',
        ownerName: `Manager ${i}`,
        funds: 1000 + Math.floor(Math.random() * 500),
        morale: 70 + Math.floor(Math.random() * 20),
        stadium: {
          tribune: 1,
          campo: 1,
          spogliatoi: 1,
          luci: 1
        },
        formation: { starters: [], bench: [] },
        isAI: true,
        leagueId
      };
      
      const aiTeamRef = await this.db.collection('manager_teams').add(aiTeamData);
      
      // Generate AI players
      const aiPlayers = this.generateDefaultPlayers();
      const batch = this.db.batch();
      aiPlayers.forEach(player => {
        const playerRef = this.db.collection('manager_teams').doc(aiTeamRef.id)
          .collection('players').doc();
        batch.set(playerRef, player);
      });
      await batch.commit();
      
      // Add to league
      await leagueRef.update({
        teams: firebase.firestore.FieldValue.arrayUnion(aiTeamRef.id)
      });
    }
    
    // Generate match calendar
    await this.generateCalendar(leagueId);
    
    return { leagueId, name: leagueName };
  }

  async generateCalendar(leagueId) {
    const leagueDoc = await this.db.collection('manager_leagues').doc(leagueId).get();
    const teams = leagueDoc.data().teams;
    
    const matches = [];
    const n = teams.length;
    
    // Round-robin algorithm
    for (let round = 0; round < (n - 1) * 2; round++) {
      const matchday = round + 1;
      const isReturn = round >= n - 1;
      
      for (let i = 0; i < n / 2; i++) {
        const home = teams[(round + i) % n];
        const away = teams[(n - 1 - i + round) % n];
        
        matches.push({
          leagueId,
          matchday,
          homeTeamId: isReturn ? away : home,
          awayTeamId: isReturn ? home : away,
          played: false,
          result: null
        });
      }
    }
    
    // Save matches
    const batch = this.db.batch();
    matches.forEach(match => {
      const matchRef = this.db.collection('manager_calendar').doc();
      batch.set(matchRef, match);
    });
    await batch.commit();
  }

  async getLeagueStandings(leagueId) {
    const matchesSnap = await this.db.collection('manager_matches')
      .where('leagueId', '==', leagueId)
      .get();
    
    const standings = {};
    
    matchesSnap.docs.forEach(doc => {
      const match = doc.data();
      
      // Init teams
      if (!standings[match.homeTeamId]) {
        standings[match.homeTeamId] = {
          teamId: match.homeTeamId,
          name: match.homeTeamName,
          played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, points: 0
        };
      }
      if (!standings[match.awayTeamId]) {
        standings[match.awayTeamId] = {
          teamId: match.awayTeamId,
          name: match.awayTeamName,
          played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, points: 0
        };
      }
      
      const home = standings[match.homeTeamId];
      const away = standings[match.awayTeamId];
      
      home.played++;
      away.played++;
      home.goalsFor += match.homeGoals;
      home.goalsAgainst += match.awayGoals;
      away.goalsFor += match.awayGoals;
      away.goalsAgainst += match.homeGoals;
      
      if (match.result === 'H') {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (match.result === 'A') {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
      }
    });
    
    // Sort by points, then goal difference
    return Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gda = a.goalsFor - a.goalsAgainst;
      const gdb = b.goalsFor - b.goalsAgainst;
      return gdb - gda;
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AthleticManagerEngine;
}
