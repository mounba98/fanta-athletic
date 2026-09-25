/**
 * Achievements System - Badge e Riconoscimenti
 * v2025101906
 */

(function() {
  'use strict';
  
  const ACHIEVEMENTS = {
    // Gol e Attacco
    hat_trick: {
      id: 'hat_trick',
      name: 'Hat-trick',
      description: '3 gol con lo stesso giocatore in una giornata',
      icon: '🔥',
      points: 50,
      check: (matchdayData) => {
        const players = matchdayData.players || [];
        return players.some(p => (p.stats?.goals || 0) >= 3);
      }
    },
    
    poker: {
      id: 'poker',
      name: 'Poker',
      description: '4+ gol con lo stesso giocatore',
      icon: '⚡',
      points: 100,
      check: (matchdayData) => {
        const players = matchdayData.players || [];
        return players.some(p => (p.stats?.goals || 0) >= 4);
      }
    },
    
    // Difesa
    muro: {
      id: 'muro',
      name: 'Il Muro',
      description: 'Clean sheet con media difesa ≥ 7',
      icon: '🛡️',
      points: 40,
      check: (matchdayData) => {
        const defMod = matchdayData.defenseModifier;
        return defMod && defMod.avgRating >= 7;
      }
    },
    
    fortezza: {
      id: 'fortezza',
      name: 'Fortezza Inespugnabile',
      description: '3 clean sheet consecutivi',
      icon: '🏰',
      points: 80,
      check: (teamHistory) => {
        if (teamHistory.length < 3) return false;
        const last3 = teamHistory.slice(-3);
        return last3.every(m => m.cleanSheet === true);
      }
    },
    
    // Voti
    perfect_10: {
      id: 'perfect_10',
      name: 'Perfect 10',
      description: 'Un giocatore con voto 10',
      icon: '💎',
      points: 60,
      check: (matchdayData) => {
        const players = matchdayData.players || [];
        return players.some(p => p.voto >= 10);
      }
    },
    
    dream_team: {
      id: 'dream_team',
      name: 'Dream Team',
      description: 'Media voto squadra ≥ 7',
      icon: '⭐',
      points: 50,
      check: (matchdayData) => {
        const players = matchdayData.players || [];
        if (players.length === 0) return false;
        const avg = players.reduce((sum, p) => sum + (p.voto || 0), 0) / players.length;
        return avg >= 7;
      }
    },
    
    // Vittorie
    comeback_king: {
      id: 'comeback_king',
      name: 'Comeback King',
      description: 'Vinto recuperando da -20 punti',
      icon: '📈',
      points: 70,
      check: (matchdayData, opponentData) => {
        if (!matchdayData.won) return false;
        const halfwayDiff = matchdayData.halfwayScore - opponentData.halfwayScore;
        return halfwayDiff <= -20;
      }
    },
    
    dominio: {
      id: 'dominio',
      name: 'Dominio Assoluto',
      description: 'Vinto con +30 punti',
      icon: '👑',
      points: 60,
      check: (matchdayData, opponentData) => {
        if (!matchdayData.won) return false;
        const diff = matchdayData.totalScore - opponentData.totalScore;
        return diff >= 30;
      }
    },
    
    streak_3: {
      id: 'streak_3',
      name: 'On Fire',
      description: '3 vittorie consecutive',
      icon: '🎯',
      points: 50,
      check: (teamHistory) => {
        if (teamHistory.length < 3) return false;
        const last3 = teamHistory.slice(-3);
        return last3.every(m => m.won === true);
      }
    },
    
    streak_5: {
      id: 'streak_5',
      name: 'Unstoppable',
      description: '5 vittorie consecutive',
      icon: '🚀',
      points: 100,
      check: (teamHistory) => {
        if (teamHistory.length < 5) return false;
        const last5 = teamHistory.slice(-5);
        return last5.every(m => m.won === true);
      }
    },
    
    // Capitano
    captain_fantastic: {
      id: 'captain_fantastic',
      name: 'Captain Fantastic',
      description: 'Capitano con 20+ punti',
      icon: '⭐',
      points: 40,
      check: (matchdayData) => {
        const captain = matchdayData.players?.find(p => p.isCaptain);
        return captain && (captain.totalScore || 0) >= 20;
      }
    },
    
    // Speciali
    lucky_7: {
      id: 'lucky_7',
      name: 'Lucky 7',
      description: '7 giocatori con voto ≥ 7',
      icon: '🍀',
      points: 50,
      check: (matchdayData) => {
        const players = matchdayData.players || [];
        const count = players.filter(p => p.voto >= 7).length;
        return count >= 7;
      }
    },
    
    iron_man: {
      id: 'iron_man',
      name: 'Iron Man',
      description: 'Nessun giocatore sotto il 6',
      icon: '💪',
      points: 40,
      check: (matchdayData) => {
        const players = matchdayData.players || [];
        if (players.length === 0) return false;
        return players.every(p => p.voto >= 6);
      }
    }
  };
  
  /**
   * Check and award achievements for a matchday
   */
  async function checkAchievements(leagueId, matchdayId, teamId) {
    const db = firebase.firestore();
    
    try {
      // Get matchday data
      const matchdayDoc = await db.collection(`leagues/${leagueId}/matchdays`).doc(matchdayId).get();
      if (!matchdayDoc.exists) return [];
      
      const matchday = matchdayDoc.data();
      const teamData = matchday.teams?.[teamId];
      if (!teamData) return [];
      
      // Get team history
      const historySnap = await db.collection(`leagues/${leagueId}/matchdays`)
        .where(`teams.${teamId}`, '!=', null)
        .orderBy('number', 'asc')
        .get();
      
      const teamHistory = historySnap.docs.map(doc => doc.data().teams[teamId]);
      
      // Check each achievement
      const awarded = [];
      
      for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
        try {
          if (achievement.check(teamData, null, teamHistory)) {
            awarded.push(achievement);
          }
        } catch (error) {
          console.error(`Error checking achievement ${key}:`, error);
        }
      }
      
      // Save achievements
      if (awarded.length > 0) {
        const batch = db.batch();
        
        awarded.forEach(achievement => {
          const achievementRef = db.collection(`leagues/${leagueId}/achievements`).doc();
          batch.set(achievementRef, {
            achievementId: achievement.id,
            teamId: teamId,
            matchdayId: matchdayId,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
            awardedAt: firebase.firestore.Timestamp.now()
          });
        });
        
        await batch.commit();
      }
      
      return awarded;
      
    } catch (error) {
      console.error('Check achievements error:', error);
      return [];
    }
  }
  
  /**
   * Get all achievements for a team
   */
  async function getTeamAchievements(leagueId, teamId) {
    const db = firebase.firestore();
    
    try {
      const snapshot = await db.collection(`leagues/${leagueId}/achievements`)
        .where('teamId', '==', teamId)
        .orderBy('awardedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get achievements error:', error);
      return [];
    }
  }
  
  /**
   * Render achievement badge
   */
  function renderAchievementBadge(achievement, size = 'medium') {
    const sizes = {
      small: { icon: '24px', padding: '8px', fontSize: '11px' },
      medium: { icon: '32px', padding: '12px', fontSize: '13px' },
      large: { icon: '48px', padding: '16px', fontSize: '15px' }
    };
    
    const s = sizes[size] || sizes.medium;
    
    return `
      <div style="
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: ${s.padding};
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 100px;
      " title="${achievement.description}">
        <div style="font-size: ${s.icon};">${achievement.icon}</div>
        <div style="color: white; font-weight: 600; font-size: ${s.fontSize}; text-align: center;">
          ${achievement.name}
        </div>
        <div style="color: rgba(255,255,255,0.8); font-size: 11px;">
          ${achievement.points} pt
        </div>
      </div>
    `;
  }
  
  /**
   * Render achievements grid
   */
  function renderAchievementsGrid(achievements) {
    if (achievements.length === 0) {
      return `
        <div style="text-align: center; padding: 40px; color: var(--muted);">
          <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
          <p>Nessun achievement ancora</p>
        </div>
      `;
    }
    
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px;">
        ${achievements.map(a => renderAchievementBadge(a)).join('')}
      </div>
    `;
  }
  
  // Expose API
  window.AchievementsSystem = {
    ACHIEVEMENTS,
    checkAchievements,
    getTeamAchievements,
    renderBadge: renderAchievementBadge,
    renderGrid: renderAchievementsGrid
  };
  
})();
