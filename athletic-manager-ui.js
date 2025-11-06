/**
 * ⚽ ATHLETIC MANAGER - UI CONTROLLER
 * Gestione rendering dinamico e interazioni
 */

class AthleticManagerUI {
  constructor(engine) {
    this.engine = engine;
    this.selectedPlayers = {
      starters: [],
      bench: []
    };
  }

  // ========== DASHBOARD ==========
  
  renderDashboard() {
    if (!this.engine.state.team) return;
    
    const team = this.engine.state.team;
    const players = this.engine.state.players;
    
    document.getElementById('teamName').textContent = team.name;
    document.getElementById('funds').textContent = team.funds;
    document.getElementById('fundsDisplay').textContent = `💰 ${team.funds}`;
    document.getElementById('moraleValue').textContent = team.morale;
    document.getElementById('moraleFill').style.width = team.morale + '%';
    document.getElementById('playerCount').textContent = players.length;
    
    const avgOverall = Math.floor(
      players.reduce((sum, p) => sum + p.overall, 0) / players.length
    );
    document.getElementById('avgOverall').textContent = avgOverall;
    
    // Render recent matches
    this.renderRecentMatches();
  }

  async renderRecentMatches() {
    const matchesSnap = await this.engine.db.collection('manager_matches')
      .where('homeTeamId', '==', this.engine.state.teamId)
      .orderBy('timestamp', 'desc')
      .limit(3)
      .get();
    
    const container = document.getElementById('recentMatches');
    container.innerHTML = '';
    
    if (matchesSnap.empty) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;">Nessuna partita giocata</p>';
      return;
    }
    
    matchesSnap.docs.forEach(doc => {
      const match = doc.data();
      const isHome = match.homeTeamId === this.engine.state.teamId;
      const won = (isHome && match.result === 'H') || (!isHome && match.result === 'A');
      const draw = match.result === 'D';
      
      const div = document.createElement('div');
      div.className = 'match-result';
      div.innerHTML = `
        <div class="match-teams">
          <span>${match.homeTeamName}</span>
          <span class="match-score">${match.homeGoals} - ${match.awayGoals}</span>
          <span>${match.awayTeamName}</span>
        </div>
        <div style="color:${won ? '#22c55e' : draw ? '#fbbf24' : '#ef4444'};font-weight:600;">
          ${won ? '✅ VITTORIA' : draw ? '🟰 PAREGGIO' : '❌ SCONFITTA'}
        </div>
      `;
      container.appendChild(div);
    });
  }

  // ========== TRAINING ==========
  
  renderTrainingPlayers() {
    if (!this.engine.state.players.length) return;
    
    const container = document.getElementById('trainingPlayerList');
    container.innerHTML = '';
    
    this.engine.state.players.forEach(player => {
      const div = document.createElement('div');
      div.className = 'player-item';
      div.innerHTML = `
        <div class="player-info">
          <div class="player-name">${player.nome} ${player.cognome}</div>
          <div class="player-stats">${player.ruolo} • Age ${player.age}</div>
          <div class="xp-bar">
            <div class="xp-fill" style="width:${player.xp}%"></div>
          </div>
          <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">
            XP: ${player.xp}/100
          </div>
        </div>
        <div class="player-overall">${player.overall}</div>
      `;
      container.appendChild(div);
    });
  }

  // ========== FORMATION ==========
  
  renderFormation() {
    const team = this.engine.state.team;
    if (!team || !team.formation) return;
    
    // Clear current formation
    document.querySelectorAll('.formation-slot').forEach(slot => {
      slot.classList.add('empty');
      slot.textContent = slot.dataset.pos;
    });
    
    // Render starters
    team.formation.starters.forEach((playerId, index) => {
      const player = this.engine.state.players.find(p => p.id === playerId);
      if (player) {
        const positions = ['A', 'C1', 'C2', 'D1', 'D2', 'P'];
        const slot = document.querySelector(`[data-pos="${positions[index]}"]`);
        if (slot) {
          slot.classList.remove('empty');
          slot.innerHTML = `
            <div style="font-size:0.7rem;">${player.nome}</div>
            <div style="font-size:0.6rem;">${player.overall}</div>
          `;
        }
      }
    });
    
    // Render bench
    const benchSlots = document.querySelectorAll('.bench-slot');
    team.formation.bench.forEach((playerId, index) => {
      const player = this.engine.state.players.find(p => p.id === playerId);
      if (player && benchSlots[index]) {
        benchSlots[index].classList.remove('empty');
        benchSlots[index].innerHTML = `
          <div style="font-size:0.7rem;">${player.nome}</div>
          <div style="font-size:0.6rem;">${player.overall}</div>
        `;
      }
    });
  }

  // ========== STADIUM ==========
  
  renderStadium() {
    const team = this.engine.state.team;
    if (!team || !team.stadium) return;
    
    const facilities = {
      tribune: { icon: '🏟️', name: 'Tribune', costs: [500, 800, 1200, 2000] },
      campo: { icon: '🌱', name: 'Campo', costs: [400, 700, 1000, 1500] },
      spogliatoi: { icon: '🚿', name: 'Spogliatoi', costs: [300, 600, 900, 1300] },
      luci: { icon: '💡', name: 'Illuminazione', costs: [250, 500, 800, 1200] }
    };
    
    const container = document.querySelector('.stadium-upgrades');
    container.innerHTML = '';
    
    Object.entries(facilities).forEach(([key, data]) => {
      const level = team.stadium[key] || 1;
      const nextCost = data.costs[level - 1];
      
      const div = document.createElement('div');
      div.className = 'upgrade-card';
      div.innerHTML = `
        <div>${data.icon} <strong>${data.name}</strong></div>
        <div class="upgrade-level">Lv. ${level}</div>
        <div style="font-size:0.85rem;color:#94a3b8;margin-bottom:15px;">
          ${this.getUpgradeEffect(key, level)}
        </div>
        <button class="btn btn-primary" onclick="upgradeStadium('${key}')" ${!nextCost || team.funds < nextCost ? 'disabled' : ''}>
          ${nextCost ? `Upgrade (${nextCost}💰)` : 'Max Level'}
        </button>
      `;
      container.appendChild(div);
    });
  }

  getUpgradeEffect(facility, level) {
    const effects = {
      tribune: `+${level * 10}% introiti`,
      campo: `+${level * 5} morale`,
      spogliatoi: `+${level * 5}% XP`,
      luci: `+${level * 3} morale`
    };
    return effects[facility];
  }

  // ========== LEAGUE ==========
  
  async renderLeagueStandings() {
    if (!this.engine.state.team.leagueId) {
      document.getElementById('leagueTable').innerHTML = `
        <div style="text-align:center;padding:40px;">
          <h3>Non sei in una lega</h3>
          <button class="btn btn-primary" onclick="createNewLeague()" style="margin-top:20px;">
            🏆 Crea Nuova Lega
          </button>
        </div>
      `;
      return;
    }
    
    const standings = await this.engine.getLeagueStandings(this.engine.state.team.leagueId);
    
    const container = document.getElementById('leagueTable');
    container.innerHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid rgba(255,255,255,0.2);">
            <th style="padding:12px;text-align:left;">Pos</th>
            <th style="padding:12px;text-align:left;">Squadra</th>
            <th style="padding:12px;text-align:center;">G</th>
            <th style="padding:12px;text-align:center;">V</th>
            <th style="padding:12px;text-align:center;">N</th>
            <th style="padding:12px;text-align:center;">P</th>
            <th style="padding:12px;text-align:center;">GF</th>
            <th style="padding:12px;text-align:center;">GS</th>
            <th style="padding:12px;text-align:center;">DR</th>
            <th style="padding:12px;text-align:center;"><strong>Pt</strong></th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((team, index) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.1);${team.teamId === this.engine.state.teamId ? 'background:rgba(220,38,38,0.2);' : ''}">
              <td style="padding:12px;">${index + 1}</td>
              <td style="padding:12px;font-weight:700;">${team.name}</td>
              <td style="padding:12px;text-align:center;">${team.played}</td>
              <td style="padding:12px;text-align:center;">${team.won}</td>
              <td style="padding:12px;text-align:center;">${team.drawn}</td>
              <td style="padding:12px;text-align:center;">${team.lost}</td>
              <td style="padding:12px;text-align:center;">${team.goalsFor}</td>
              <td style="padding:12px;text-align:center;">${team.goalsAgainst}</td>
              <td style="padding:12px;text-align:center;">${team.goalsFor - team.goalsAgainst}</td>
              <td style="padding:12px;text-align:center;font-weight:800;font-size:1.1rem;">${team.points}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ========== MATCH CALENDAR ==========
  
  async renderMatchCalendar() {
    if (!this.engine.state.team.leagueId) {
      document.getElementById('matchCalendar').innerHTML = '<p style="color:#94a3b8;text-align:center;">Non sei in una lega</p>';
      return;
    }
    
    const calendarSnap = await this.engine.db.collection('manager_calendar')
      .where('leagueId', '==', this.engine.state.team.leagueId)
      .orderBy('matchday')
      .limit(10)
      .get();
    
    const container = document.getElementById('matchCalendar');
    
    if (calendarSnap.empty) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;">Nessuna partita in calendario</p>';
      return;
    }
    
    // Load team names
    const teamCache = {};
    const teamIds = new Set();
    calendarSnap.docs.forEach(doc => {
      const match = doc.data();
      teamIds.add(match.homeTeamId);
      teamIds.add(match.awayTeamId);
    });
    
    // Fetch all team names
    for (const teamId of teamIds) {
      const teamDoc = await this.engine.db.collection('manager_teams').doc(teamId).get();
      if (teamDoc.exists) {
        teamCache[teamId] = teamDoc.data().name;
      }
    }
    
    // Group by matchday
    const matchdays = {};
    calendarSnap.docs.forEach(doc => {
      const match = { id: doc.id, ...doc.data() };
      match.homeTeamName = teamCache[match.homeTeamId] || 'Team';
      match.awayTeamName = teamCache[match.awayTeamId] || 'Team';
      
      if (!matchdays[match.matchday]) matchdays[match.matchday] = [];
      matchdays[match.matchday].push(match);
    });
    
    container.innerHTML = '';
    
    Object.entries(matchdays).forEach(([day, matches]) => {
      const div = document.createElement('div');
      div.style.marginBottom = '30px';
      
      div.innerHTML = `
        <h4 style="margin-bottom:15px;color:#dc2626;">Giornata ${day}</h4>
        ${matches.map(match => `
          <div class="match-result" style="${match.homeTeamId === this.engine.state.teamId || match.awayTeamId === this.engine.state.teamId ? 'border-left-color:#fbbf24;' : ''}">
            <div class="match-teams">
              <span>${match.homeTeamName}</span>
              <span class="match-score">${match.played ? `${match.homeGoals} - ${match.awayGoals}` : 'vs'}</span>
              <span>${match.awayTeamName}</span>
            </div>
            ${match.played ? `
              <div style="color:#22c55e;font-size:0.9rem;">✅ Giocata</div>
            ` : `
              <button class="btn btn-primary" onclick="simulateMatchNow('${match.id}')" style="margin-top:10px;">
                ⚡ Simula Ora
              </button>
            `}
          </div>
        `).join('')}
      `;
      
      container.appendChild(div);
    });
  }

  // ========== SPONSOR ==========
  
  renderSponsor() {
    const team = this.engine.state.team;
    if (!team) return;
    
    const sponsors = [
      { name: 'Nike', income: 300, logo: '✓' },
      { name: 'Adidas', income: 350, logo: '⚡' },
      { name: 'Puma', income: 280, logo: '🐆' },
      { name: 'Under Armour', income: 320, logo: '⚔️' }
    ];
    
    const container = document.getElementById('sponsorList');
    container.innerHTML = '';
    
    sponsors.forEach(sponsor => {
      const isActive = team.sponsor?.name === sponsor.name;
      
      const div = document.createElement('div');
      div.className = 'match-result';
      div.style.cursor = 'pointer';
      if (isActive) div.style.borderLeftColor = '#22c55e';
      
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:1.5rem;margin-bottom:8px;">${sponsor.logo}</div>
            <div style="font-weight:700;font-size:1.1rem;">${sponsor.name}</div>
            <div style="color:#fbbf24;margin-top:4px;">+${sponsor.income}💰 / settimana</div>
          </div>
          ${isActive ? `
            <div style="color:#22c55e;font-weight:700;">✅ ATTIVO</div>
          ` : `
            <button class="btn btn-primary" onclick="activateSponsor('${sponsor.name}', ${sponsor.income})">
              Attiva
            </button>
          `}
        </div>
      `;
      
      container.appendChild(div);
    });
  }

  // ========== RETREAT ==========
  
  renderRetreat() {
    const team = this.engine.state.team;
    if (!team) return;
    
    const isActive = team.retreat?.active;
    const endsAt = team.retreat?.endsAt ? new Date(team.retreat.endsAt) : null;
    
    const container = document.getElementById('retreat');
    const content = container.querySelector('.card') || container;
    
    if (isActive && endsAt) {
      const remaining = Math.max(0, endsAt - new Date());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      content.innerHTML = `
        <h3>⛰️ Ritiro Squadra</h3>
        <div style="text-align:center;padding:40px 0;">
          <div style="font-size:4rem;margin-bottom:20px;">🏔️</div>
          <div style="font-size:2rem;color:#fbbf24;margin-bottom:10px;">
            ${hours}h ${minutes}m rimanenti
          </div>
          <div style="color:#22c55e;font-weight:700;margin-bottom:20px;">
            ✅ Bonus Attivo: +10% XP, +10 Morale
          </div>
          <div style="color:#94a3b8;font-size:0.9rem;">
            Il ritiro terminerà automaticamente
          </div>
        </div>
      `;
    } else {
      content.innerHTML = `
        <h3>⛰️ Ritiro Squadra</h3>
        <p style="margin-bottom:20px;color:#94a3b8;">
          Porta la squadra in ritiro per 24 ore. Bonus: +10% XP e +10 morale.
        </p>
        <div style="text-align:center;padding:40px 0;">
          <div style="font-size:4rem;margin-bottom:20px;">🏔️</div>
          <button class="btn btn-primary" onclick="startRetreat()" style="font-size:1.2rem;padding:16px 32px;">
            🚌 Avvia Ritiro (500💰)
          </button>
        </div>
      `;
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AthleticManagerUI;
}
