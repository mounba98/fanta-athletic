/**
 * Defense Modifier Calculator - Calcolo Automatico Modificatore Difesa
 * Prende portiere + top 3 difensori e calcola bonus/malus
 * v2025101906
 */

(function() {
  'use strict';
  
  /**
   * Calculate defense modifier for a matchday formation
   * @param {Array} players - Array of player objects with {ruolo, voto}
   * @param {Object} settings - League defense modifier settings
   * @returns {Object} {bonus, avgRating, topPlayers}
   */
  function calculateDefenseModifier(players, settings) {
    if (!settings?.enabled) {
      return { bonus: 0, avgRating: 0, topPlayers: [] };
    }
    
    // Filter defenders (P + D)
    const defenders = players.filter(p => p.ruolo === 'P' || p.ruolo === 'D');
    
    if (defenders.length < 4) {
      return { bonus: 0, avgRating: 0, topPlayers: [], error: 'Servono almeno 4 difensori (P+D)' };
    }
    
    // Sort by rating (descending) and take top 4
    const topDefenders = defenders
      .filter(p => p.voto && p.voto > 0)
      .sort((a, b) => b.voto - a.voto)
      .slice(0, 4);
    
    if (topDefenders.length < 4) {
      return { bonus: 0, avgRating: 0, topPlayers: topDefenders, error: 'Non ci sono 4 difensori con voto' };
    }
    
    // Calculate average rating (WITHOUT bonus/malus)
    const avgRating = topDefenders.reduce((sum, p) => sum + p.voto, 0) / 4;
    
    // Find applicable threshold
    const threshold = settings.thresholds.find(t => {
      const min = t.min || 0;
      const max = t.max || 999;
      return avgRating >= min && avgRating < max;
    });
    
    const bonus = threshold ? threshold.bonus : 0;
    
    return {
      bonus: bonus,
      avgRating: avgRating,
      topPlayers: topDefenders,
      threshold: threshold
    };
  }
  
  /**
   * Check if formation is valid for defense modifier
   * Must have 4 or 5 defenders
   */
  function isValidFormation(formation) {
    if (!formation) return false;
    
    const parts = formation.split('-');
    if (parts.length < 3) return false;
    
    const defenders = parseInt(parts[0]);
    return defenders >= 4; // 4 or 5 defenders
  }
  
  /**
   * Apply defense modifier to matchday score
   */
  async function applyDefenseModifierToMatchday(leagueId, matchdayId, teamId) {
    const db = firebase.firestore();
    
    try {
      // Get league settings
      const leagueDoc = await db.collection('leagues').doc(leagueId).get();
      if (!leagueDoc.exists) {
        throw new Error('League not found');
      }
      
      const league = leagueDoc.data();
      const defenseSettings = league.settings?.defenseModifier;
      
      if (!defenseSettings?.enabled) {
        return { applied: false, reason: 'Defense modifier disabled' };
      }
      
      // Get matchday data
      const matchdayDoc = await db.collection(`leagues/${leagueId}/matchdays`).doc(matchdayId).get();
      if (!matchdayDoc.exists) {
        throw new Error('Matchday not found');
      }
      
      const matchday = matchdayDoc.data();
      const teamData = matchday.teams?.[teamId];
      
      if (!teamData) {
        throw new Error('Team data not found in matchday');
      }
      
      // Check formation
      if (!isValidFormation(teamData.formation)) {
        return { 
          applied: false, 
          reason: 'Formazione non valida per modificatore difesa (servono 4 o 5 difensori)' 
        };
      }
      
      // Calculate modifier
      const result = calculateDefenseModifier(teamData.players || [], defenseSettings);
      
      if (result.error) {
        return { applied: false, reason: result.error };
      }
      
      // Update matchday with modifier
      await db.collection(`leagues/${leagueId}/matchdays`).doc(matchdayId).update({
        [`teams.${teamId}.defenseModifier`]: {
          bonus: result.bonus,
          avgRating: result.avgRating,
          topPlayers: result.topPlayers.map(p => ({
            id: p.id,
            nome: p.nome,
            voto: p.voto
          })),
          calculatedAt: firebase.firestore.Timestamp.now()
        },
        [`teams.${teamId}.totalScore`]: firebase.firestore.FieldValue.increment(result.bonus)
      });
      
      return {
        applied: true,
        bonus: result.bonus,
        avgRating: result.avgRating,
        topPlayers: result.topPlayers
      };
      
    } catch (error) {
      console.error('Apply defense modifier error:', error);
      return { applied: false, error: error.message };
    }
  }
  
  /**
   * Render defense modifier info for UI
   */
  function renderDefenseModifierInfo(result) {
    if (!result || result.bonus === 0) {
      return '';
    }
    
    const sign = result.bonus > 0 ? '+' : '';
    const color = result.bonus > 0 ? '#4caf50' : '#f44336';
    
    return `
      <div style="padding: 12px; background: #e8f5e9; border-radius: 8px; margin: 12px 0;">
        <strong>🛡️ Modificatore Difesa</strong>
        <div style="margin-top: 8px;">
          <div>Media top 4 difensori: <strong>${result.avgRating.toFixed(2)}</strong></div>
          <div style="color: ${color}; font-size: 18px; font-weight: 700; margin-top: 4px;">
            ${sign}${result.bonus} punti
          </div>
          <div style="font-size: 12px; color: var(--muted); margin-top: 8px;">
            Top 4: ${result.topPlayers.map(p => `${p.nome} (${p.voto})`).join(', ')}
          </div>
        </div>
      </div>
    `;
  }
  
  // Expose API
  window.DefenseModifier = {
    calculate: calculateDefenseModifier,
    isValidFormation,
    applyToMatchday: applyDefenseModifierToMatchday,
    renderInfo: renderDefenseModifierInfo
  };
  
})();
