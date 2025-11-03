/**
 * Classifiche Preview for Home Dashboard
 * Version: 2025102002
 * FIX: Auth check + error handling permissions
 */

(function() {
  'use strict';

  let currentLeagueId = null;
  let cachedResults = null;
  let cacheTimestamp = 0;
  const CACHE_DURATION = 60000; // 1 minuto

  /**
   * Inizializza preview classifiche con cache
   */
  async function initClassifichePreview() {
    console.log('🏆 Inizializzazione classifiche preview...');
    
    // Check cache valida
    if (cachedResults && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log('✅ Uso cache classifiche');
      const container = document.getElementById('classifichePreview');
      if (container) {
        const top5 = cachedResults.slice(0, 5);
        renderClassificaPreview(container, top5, null);
      }
      return;
    }
    
    // Aspetta che league sia caricata (max 3 secondi)
    let attempts = 0;
    const maxAttempts = 6; // Ridotto a 3 secondi
    
    const checkLeague = setInterval(async () => {
      attempts++;
      
      if (window.currentLeague && window.currentLeague.id) {
        clearInterval(checkLeague);
        currentLeagueId = window.currentLeague.id;
        console.log('✅ Lega trovata:', currentLeagueId, `(tentativo ${attempts})`);
        await loadClassifichePreview();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkLeague);
        console.warn('⚠️ Timeout: currentLeague non caricata dopo 3s');
        const container = document.getElementById('classifichePreview');
        if (container) {
          container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">⚠️ Nessuna lega selezionata</div>';
        }
      }
    }, 500);
  }

  /**
   * Carica TOP 5 squadre dalla classifica
   */
  async function loadClassifichePreview() {
    const container = document.getElementById('classifichePreview');
    if (!container) return;

    // Loading state
    container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">⏳ Caricamento...</div>';

    try {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;
      
      if (!user) {
        container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">⚠️ Effettua il login</div>';
        return;
      }
      
      // Leggi squadre della lega con error handling
      let teamsSnapshot;
      try {
        teamsSnapshot = await db.collection('leagues')
          .doc(currentLeagueId)
          .collection('teams')
          .get();
      } catch (permError) {
        console.error('Permission error reading teams:', permError);
        container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">⚠️ Permessi insufficienti</div>';
        return;
      }

      if (teamsSnapshot.empty) {
        container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">Nessuna squadra trovata</div>';
        return;
      }

      // Trova giornate calcolate (cache)
      const daysSnap = await db.collection('days').where('computed', '==', true).get();
      const computedDays = daysSnap.docs.map(doc => doc.id);
      const sortedDays = daysSnap.docs
        .map(doc => ({ id: doc.id, num: parseInt(doc.id.substring(1)) }))
        .sort((a, b) => b.num - a.num);
      const lastDay = sortedDays[0];
      
      console.log(`📊 Caricamento ${teamsSnapshot.size} squadre, ${computedDays.length} giornate calcolate`);
      
      // Calcola punteggi totali SOLO per giornate calcolate
      const teams = [];
      
      for (const doc of teamsSnapshot.docs) {
        const teamData = doc.data();
        let totalPoints = 0;
        let lastDayPoints = 0;

        try {
          // Loop SOLO giornate già calcolate (ottimizzazione)
          for (const giornataId of computedDays) {
            try {
              const resultDoc = await db.collection('results')
                .doc(giornataId)
                .collection('teams')
                .doc(doc.id)
                .get();
              
              if (resultDoc.exists) {
                const result = resultDoc.data();
                const pts = parseFloat(result.points) || parseFloat(result.total) || parseFloat(result.totalPoints) || 0;
                totalPoints += pts;
                
                // Salva punti ultima giornata
                if (lastDay && giornataId === lastDay.id) {
                  lastDayPoints = pts;
                }
              }
            } catch (giornataError) {
              // Errore permessi
              continue;
            }
          }
        } catch (scoreError) {
          console.warn(`Error reading scores for team ${doc.id}:`, scoreError);
          // Continua con 0 punti
        }

        teams.push({
          id: doc.id,
          name: teamData.name || 'Sconosciuta',
          points: totalPoints,
          lastDayPoints: lastDayPoints,
          owner: teamData.owner || '',
          isUserTeam: teamData.owner === user.uid
        });
      }

      // Ordina per punti totali
      teams.sort((a, b) => b.points - a.points);
      
      // Salva cache
      cachedResults = teams;
      cacheTimestamp = Date.now();
      
      // TOP 5
      const top5 = teams.slice(0, 5);
      renderClassificaPreview(container, top5, lastDay ? lastDay.id : null);

    } catch (error) {
      console.error('Error loading classifica preview:', error);
      container.innerHTML = `<div style="text-align: center; color: #dc2626; padding: 20px;">
        ❌ Errore: ${error.message || 'Caricamento fallito'}
      </div>`;
    }
  }

  /**
   * Renderizza preview classifica
   */
  function renderClassificaPreview(container, teams, lastDayId) {
    if (teams.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">Nessun dato disponibile</div>';
      return;
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    const userTeam = teams.find(t => t.isUserTeam);
    
    const html = teams.map((team, index) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: ${team.isUserTeam ? 'rgba(59, 130, 246, 0.1)' : index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0,0,0,0.03)'}; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${team.isUserTeam ? '#3b82f6' : index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--primary)'};">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
          <span style="font-size: 20px;">${medals[index]}</span>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 15px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${team.name}${team.isUserTeam ? ' (Tu)' : ''}</div>
            <div style="font-size: 11px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${team.lastDayPoints > 0 ? `Ultima giornata: ${team.lastDayPoints.toFixed(1)} pt` : 'N/A'}
            </div>
          </div>
        </div>
        <div style="font-weight: 800; font-size: 16px; color: var(--primary); margin-left: 8px;">
          ${team.points.toFixed(1)}
        </div>
      </div>
    `).join('');
    
    const viewDetailBtn = lastDayId && userTeam ? `
      <div style="margin-top: 12px; text-align: center;">
        <a href="/recap-giornata.html?g=${lastDayId}" class="btn btn-primary" style="display: inline-block; padding: 10px 20px; text-decoration: none;">
          📊 Vedi Dettaglio ${lastDayId}
        </a>
      </div>
    ` : '';

    container.innerHTML = html + viewDetailBtn;
  }

  // Init quando DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClassifichePreview);
  } else {
    initClassifichePreview();
  }

})();
