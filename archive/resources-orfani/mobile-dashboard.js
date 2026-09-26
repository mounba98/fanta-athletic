// Mobile Dashboard - Stile Fantagazzetta
// Version: 2025101804
(function() {
  'use strict';

  // Solo su mobile e solo su index.html
  if (!window.deviceInfo || !window.deviceInfo.isSmartphone) {
    return;
  }

  if (document.body && document.body.dataset.disableMobileDashboard === 'true') {
    return;
  }

  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage !== 'index.html' && currentPage !== '') {
    return;
  }

  function createMobileDashboard() {
    const main = document.querySelector('main');
    if (!main) return;

    // Nascondi contenuto desktop (dashboard + grid cards)
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) dashboardSection.style.display = 'none';
    
    const sections = main.querySelectorAll('.section');
    sections.forEach(s => s.style.display = 'none');

    // Crea dashboard mobile
    const dashboard = document.createElement('div');
    dashboard.className = 'mobile-dashboard';
    dashboard.innerHTML = `
      <div class="team-logo-section">
        <div class="team-logo-placeholder">
          <span style="font-size:60px;">🏆</span>
        </div>
        <h2 class="team-name" id="myTeamName">La Mia Squadra</h2>
      </div>

      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-label">Posizione</div>
          <div class="stat-value" id="teamPosition">-</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Punti</div>
          <div class="stat-value" id="teamPoints">0</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Partite</div>
          <div class="stat-value" id="teamMatches">0</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Pt. Totali</div>
          <div class="stat-value" id="teamTotalPoints">0</div>
        </div>
      </div>

      <div class="last-match-section">
        <h3>Ultima Giornata</h3>
        <div class="match-card" id="lastMatch">
          <div class="match-team match-team-horizontal">
            <div class="match-logo">🏆</div>
            <div>
              <div class="match-team-name" id="lastMatchTeamName">La Mia Squadra</div>
              <div class="match-meta" id="lastMatchLabel">Giornata --</div>
          </div>
          </div>
          <div class="match-score-single" id="lastMatchScore">0.0</div>
        </div>
        <button class="btn-detail" id="lastMatchDetailBtn">Dettaglio giornata</button>
      </div>

      <div class="next-match-section">
        <h3>Prossima Giornata</h3>
        <div class="match-card" id="nextMatch">
          <div class="match-team match-team-horizontal">
            <div class="match-logo">📅</div>
            <div>
              <div class="match-team-name" id="nextMatchLabel">Giornata --</div>
              <div class="match-meta" id="nextMatchSubtitle">In arrivo</div>
          </div>
          </div>
        </div>
        <button class="btn-detail" onclick="location.href='formazioni.html'">Imposta formazione</button>
      </div>

      <div class="recent-results">
        <h3>Ultimi 3 Risultati</h3>
        <div class="results-timeline" id="resultsTimeline"></div>
      </div>
    `;

    main.insertBefore(dashboard, main.firstChild);
    
    // Carica dati
    loadDashboardData();
  }

  async function loadDashboardData() {
    if (!window.firebase || !firebase.auth) return;

    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const db = firebase.firestore();
        if (!window.LeagueHelper || typeof window.LeagueHelper.waitForLeague !== 'function') {
          console.warn('[mobile-dashboard] LeagueHelper non disponibile, esco');
          return;
        }

        const leagueInfo = await window.LeagueHelper.waitForLeague().catch(() => null);
        if (!leagueInfo || !leagueInfo.id) {
          console.warn('[mobile-dashboard] Nessuna lega selezionata, widget disabilitato');
          return;
        }
        const leagueId = leagueInfo.id;
        const getLeagueCollection = (name) => window.LeagueHelper.getLeagueCollection(name, leagueId);
        
        let myTeam = null;
        let teamId = null;

        // prova dal profilo utente (team_index)
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data() || {};
            if (data.team_index !== undefined && data.team_index !== null) {
              teamId = String(data.team_index);
              const teamDoc = await getLeagueCollection('teams').doc(teamId).get();
              if (teamDoc.exists) {
                myTeam = { id: teamDoc.id, ...teamDoc.data() };
              }
            }
          }
        } catch (error) {
          console.warn('mobile-dashboard: impossibile leggere profilo utente', error);
        }

        // fallback: cerca tra squadre
        if (!myTeam) {
          const teamsSnap = await getLeagueCollection('teams').get();
          teamsSnap.forEach(doc => {
            const team = doc.data() || {};
            if (team.owner === user.uid || (Array.isArray(team.members) && team.members.includes(user.uid))) {
            myTeam = { id: doc.id, ...team };
              teamId = doc.id;
          }
        });
        }

        if (!myTeam) {
          document.getElementById('myTeamName').textContent = 'Nessuna squadra';
          return;
        }

          document.getElementById('myTeamName').textContent = myTeam.name || 'La Mia Squadra';
          
        const daysSnap = await getLeagueCollection('days').where('computed', '==', true).get();
        const giornate = daysSnap.docs
          .map(doc => ({
            id: doc.id,
            num: Number(doc.id.replace(/[^0-9]/g, '')) || 0,
            updatedAt: doc.data()?.updatedAt?.toMillis?.() || doc.updateTime?.toMillis?.() || 0
          }))
          .sort((a, b) => (a.num - b.num) || (a.updatedAt - b.updatedAt));

        const allResults = [];
        for (const entry of giornate) {
          try {
            const resultDoc = await getLeagueCollection('results').doc(entry.id).collection('teams').doc(myTeam.id).get();
            if (resultDoc.exists) {
              allResults.push({ giornataId: entry.id, num: entry.num, data: resultDoc.data() || {} });
            }
          } catch (error) {
            console.warn('mobile-dashboard: errore lettura risultato', entry.id, error);
          }
        }

        // Aggiorna statistiche
        const matchesPlayed = allResults.length;
        const totalPoints = allResults.reduce((sum, res) => sum + Number(res.data.points || 0), 0);
        document.getElementById('teamMatches').textContent = matchesPlayed;
        document.getElementById('teamTotalPoints').textContent = totalPoints.toFixed(1);
        document.getElementById('teamPoints').textContent = totalPoints.toFixed(1);
        document.getElementById('teamPosition').textContent = '-';

        // Ultima giornata
        const lastMatch = allResults[allResults.length - 1];
        const lastMatchScoreEl = document.getElementById('lastMatchScore');
        const lastMatchLabelEl = document.getElementById('lastMatchLabel');
        const lastMatchDetailBtn = document.getElementById('lastMatchDetailBtn');
        const lastMatchTeamName = document.getElementById('lastMatchTeamName');

        if (lastMatch && lastMatchScoreEl && lastMatchLabelEl && lastMatchDetailBtn) {
          lastMatchTeamName.textContent = myTeam.name || 'La Mia Squadra';
          lastMatchScoreEl.textContent = Number(lastMatch.data.points || 0).toFixed(1);
          lastMatchLabelEl.textContent = `Giornata ${lastMatch.num}`;
          lastMatchDetailBtn.disabled = false;
          lastMatchDetailBtn.onclick = () => {
            const params = new URLSearchParams({ g: lastMatch.giornataId, team: myTeam.id });
            window.location.href = `lineup-summary.html?${params.toString()}`;
          };
        } else if (lastMatchDetailBtn) {
          lastMatchTeamName.textContent = myTeam.name || 'La Mia Squadra';
          lastMatchScoreEl.textContent = '0.0';
          lastMatchLabelEl.textContent = 'Nessuna giornata calcolata';
          lastMatchDetailBtn.disabled = true;
        }

        // Timeline ultimi 5
        const timelineEl = document.getElementById('resultsTimeline');
        if (timelineEl) {
          const lastThree = allResults.slice(-3);
          if (lastThree.length) {
            timelineEl.innerHTML = lastThree.map(res => `
              <div class="result-circle neutral">
                <div class="result-round">G${res.num}</div>
                <div class="result-score">${Number(res.data.points || 0).toFixed(1)}</div>
              </div>
            `).join('');
          } else {
            timelineEl.innerHTML = '<div class="timeline-placeholder">Nessun risultato disponibile</div>';
          }
        }

        // Prossima giornata
        const nextLabelEl = document.getElementById('nextMatchLabel');
        const nextSubtitleEl = document.getElementById('nextMatchSubtitle');
        const lastNumber = giornate.length ? giornate[giornate.length - 1].num : 0;
        const nextNumber = lastNumber + 1;
        if (nextLabelEl) {
          nextLabelEl.textContent = `Giornata ${nextNumber}`;
        }
        if (nextSubtitleEl) {
          nextSubtitleEl.textContent = matchesPlayed ? 'Prepara la formazione' : 'Inizia dalla prima giornata';
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  // Crea dashboard quando DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMobileDashboard);
  } else {
    createMobileDashboard();
  }
})();
