/**
 * Dashboard Widgets - Carosello Statistiche
 * Widgets scorrevoli per home page
 * v2025101906
 */

(function() {
  'use strict';
  
  let currentLeague = null;
  let widgets = [];
  let currentWidgetIndex = 0;
  let autoRotateInterval = null;
  
  /**
   * Format season from "2024/2025" to "24/25"
   */
  function formatSeason(season) {
    if (!season) return '24/25';
    
    // Se è già nel formato breve, ritorna così
    if (season.length <= 5) return season;
    
    // Converte 2024/2025 → 24/25
    const parts = season.split('/');
    if (parts.length === 2) {
      const year1 = parts[0].slice(-2);
      const year2 = parts[1].slice(-2);
      return `${year1}/${year2}`;
    }
    
    return season;
  }
  
  // Wait for auth
  window.addEventListener('auth-ready', initDashboard);
  window.addEventListener('league-changed', reloadDashboard);
  
  async function initDashboard() {
    await loadLeagueData();
    renderDashboard();
    startAutoRotate();
  }
  
  async function reloadDashboard() {
    stopAutoRotate();
    await loadLeagueData();
    renderDashboard();
    startAutoRotate();
  }
  
  async function loadLeagueData() {
    const leagueId = localStorage.getItem('last_league_id');
    if (!leagueId) {
      currentLeague = null;
      return;
    }
    
    try {
      const doc = await firebase.firestore().collection('leagues').doc(leagueId).get();
      if (doc.exists) {
        currentLeague = { id: doc.id, ...doc.data() };
        await loadWidgetsData();
      }
    } catch (error) {
      console.error('Error loading league:', error);
    }
  }
  
  async function loadWidgetsData() {
    if (!currentLeague) return;
    
    widgets = [];
    
    try {
      // Widget 1: Classifica Top 5 (da ultima giornata calcolata)
      // Fix: rimuovo orderBy per evitare index, loop manuale
      const daysSnap = await firebase.firestore()
        .collection('days')
        .where('computed', '==', true)
        .get();
      
      if (!daysSnap.empty) {
        // Trova ultima giornata manualmente (G1, G2, G3...)
        const sortedDays = daysSnap.docs
          .map(doc => ({ id: doc.id, num: parseInt(doc.id.substring(1)) }))
          .sort((a, b) => b.num - a.num);
        const lastDay = sortedDays[0].id; // es. G2
        const resultsSnap = await firebase.firestore()
          .collection(`results/${lastDay}/teams`)
          .get();
        
        if (!resultsSnap.empty) {
          const teams = resultsSnap.docs
            .map(doc => ({
              name: doc.data().name || doc.id,
              points: doc.data().total || 0
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 5)
            .map((t, i) => ({
              pos: i + 1,
              name: t.name,
              points: t.points
            }));
          
          widgets.push({
            id: 'standings',
            title: `🏆 Classifica ${lastDay}`,
            type: 'list',
            data: teams
          });
        }
      }
      
      // Widget 2: Top Giocatori REALI da Firestore
      const playersSnap = await firebase.firestore()
        .collection('players')
        .limit(100)
        .get();
      
      if (!playersSnap.empty) {
        const playersList = playersSnap.docs.map(doc => {
          const data = doc.data();
          const totalPoints = (data.points || []).reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
          return {
            name: data.nome_completo || data.nome || 'Sconosciuto',
            value: totalPoints,
            label: 'pt totali'
          };
        });
        
        const top5 = playersList
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        widgets.push({
          id: 'topplayers',
          title: '⭐ Top Giocatori',
          type: 'list',
          data: top5.map((s, i) => ({ pos: i + 1, ...s }))
        });
      }
      
      // Widget 3: Prossima Giornata (da days collection)
      const nextDaySnap = await firebase.firestore()
        .collection('days')
        .where('computed', '==', false)
        .get();
      
      const nextDays = nextDaySnap.docs
        .map(doc => ({ id: doc.id, num: parseInt(doc.id.substring(1)), data: doc.data() }))
        .sort((a, b) => a.num - b.num);
      
      const nextDay = nextDays[0];
      
      if (nextDay) {
        widgets.push({
          id: 'nextmatchday',
          title: '📅 Prossima Giornata',
          type: 'info',
          data: {
            number: nextDay.id,
            date: nextDay.data.deadline?.toDate?.() || new Date(),
            matches: nextDay.data.scontri?.length || 0
          }
        });
      }
      
      // Widget 4: Stats Lega (reali da Firestore)
      const teamsCount = await firebase.firestore()
        .collection('teams')
        .where('league_id', '==', currentLeague.id)
        .get();
      
      const playersCount = await firebase.firestore()
        .collection('players')
        .where('league_id', '==', currentLeague.id)
        .get();
      
      widgets.push({
        id: 'leaguestats',
        title: '📊 Statistiche Lega',
        type: 'stats',
        data: {
          teams: teamsCount.size || 14,
          players: playersCount.size || 154,
          members: currentLeague.members?.length || 14,
          season: formatSeason(currentLeague.season || '2024/2025')
        }
      });
      
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  }
  
  function renderDashboard() {
    let container = document.getElementById('dashboardCarousel');
    
    if (!container) {
      // Create container in main page
      const main = document.querySelector('main') || document.querySelector('.container');
      if (!main) return;
      
      const dashSection = document.createElement('section');
      dashSection.className = 'dashboard-carousel';
      dashSection.innerHTML = `
        <div class="dashboard-header">
          <h2>📊 Dashboard</h2>
          <div class="dashboard-nav">
            <button class="dash-nav-btn" onclick="window.dashboardPrev()">←</button>
            <span class="dash-pagination" id="dashPagination">1 / 1</span>
            <button class="dash-nav-btn" onclick="window.dashboardNext()">→</button>
          </div>
        </div>
        <div class="dashboard-widgets" id="dashboardWidgets">
          <!-- Widgets here -->
        </div>
      `;
      
      // Insert at top of main
      main.insertBefore(dashSection, main.firstChild);
      container = document.getElementById('dashboardWidgets');
      injectStyles();
    }
    
    if (!currentLeague) {
      container.innerHTML = '<div class="dash-empty">Seleziona una lega per vedere le statistiche</div>';
      return;
    }
    
    if (widgets.length === 0) {
      container.innerHTML = '<div class="dash-empty">Nessun dato disponibile</div>';
      return;
    }
    
    // Render widgets
    container.innerHTML = widgets.map((widget, index) => renderWidget(widget, index)).join('');
    
    // Show first widget
    showWidget(0);
    
    // Update pagination
    updatePagination();
  }
  
  function renderWidget(widget, index) {
    const activeClass = index === currentWidgetIndex ? 'active' : '';
    
    switch (widget.type) {
      case 'list':
        return `
          <div class="dash-widget ${activeClass}" data-index="${index}">
            <h3 class="dash-widget-title">${widget.title}</h3>
            <div class="dash-widget-content">
              ${widget.data.map(item => `
                <div class="dash-list-item">
                  <span class="dash-list-pos">${item.pos}</span>
                  <span class="dash-list-name">${item.name}</span>
                  <span class="dash-list-value">${item.value || item.points} ${item.label || 'pt'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      
      case 'info':
        return `
          <div class="dash-widget ${activeClass}" data-index="${index}">
            <h3 class="dash-widget-title">${widget.title}</h3>
            <div class="dash-widget-content dash-info-content">
              <div class="dash-info-main">
                <div class="dash-info-number">Giornata ${widget.data.number}</div>
                <div class="dash-info-date">${formatDate(widget.data.date)}</div>
                <div class="dash-info-matches">${widget.data.matches} partite</div>
              </div>
            </div>
          </div>
        `;
      
      case 'stats':
        return `
          <div class="dash-widget ${activeClass}" data-index="${index}">
            <h3 class="dash-widget-title">${widget.title}</h3>
            <div class="widget-body">
              <div class="stat-grid">
                <div class="stat-item">
                  <div class="stat-value">${widget.data.teams}</div>
                  <div class="stat-label">Squadre</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${widget.data.players}</div>
                  <div class="stat-label">Giocatori</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${widget.data.members}</div>
                  <div class="stat-label">Membri</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${formatSeason(widget.data.season)}</div>
                  <div class="stat-label">Stagione</div>
                </div>
              </div>
            </div>
          </div>
        `;
      
      default:
        return '';
    }
  }
  
  function showWidget(index) {
    const widgetElements = document.querySelectorAll('.dash-widget');
    widgetElements.forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    currentWidgetIndex = index;
    updatePagination();
  }
  
  function updatePagination() {
    const pagination = document.getElementById('dashPagination');
    if (pagination) {
      pagination.textContent = `${currentWidgetIndex + 1} / ${widgets.length || 1}`;
    }
  }
  
  function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }
  
  function startAutoRotate() {
    stopAutoRotate();
    if (widgets.length <= 1) return;
    
    autoRotateInterval = setInterval(() => {
      nextWidget();
    }, 5000); // 5 secondi per widget
  }
  
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval);
      autoRotateInterval = null;
    }
  }
  
  function nextWidget() {
    const next = (currentWidgetIndex + 1) % widgets.length;
    showWidget(next);
  }
  
  function prevWidget() {
    const prev = (currentWidgetIndex - 1 + widgets.length) % widgets.length;
    showWidget(prev);
  }
  
  function injectStyles() {
    if (document.getElementById('dashboardWidgetStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'dashboardWidgetStyles';
    styles.textContent = `
      .dashboard-carousel {
        background: var(--card);
        border-radius: 16px;
        padding: 24px;
        margin: 20px 0;
        box-shadow: var(--shadow);
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .dashboard-header h2 {
        margin: 0;
        font-size: 28px;
        color: var(--text);
      }
      
      .dashboard-nav {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .dash-nav-btn {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .dash-nav-btn:hover {
        background: var(--primary-hover);
        transform: scale(1.1);
      }
      
      .dash-pagination {
        font-size: 14px;
        color: var(--muted);
        min-width: 60px;
        text-align: center;
      }
      
      .dashboard-widgets {
        position: relative;
        min-height: 200px;
      }
      
      .dash-widget {
        display: none;
        animation: fadeIn 0.3s ease;
      }
      
      .dash-widget.active {
        display: block;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .dash-widget-title {
        font-size: 20px;
        margin: 0 0 16px;
        color: var(--text);
        font-weight: 700;
      }
      
      .dash-widget-content {
        padding: 12px 0;
      }
      
      .dash-list-item {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        transition: background 0.2s;
      }
      
      .dash-list-item:hover {
        background: rgba(0,0,0,0.03);
      }
      
      .dash-list-pos {
        width: 32px;
        height: 32px;
        background: var(--primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
      }
      
      .dash-list-name {
        font-weight: 600;
        color: var(--text);
      }
      
      .dash-list-value {
        font-weight: 700;
        color: var(--primary);
        font-size: 18px;
      }
      
      .dash-info-content {
        text-align: center;
        padding: 20px;
      }
      
      .dash-info-number {
        font-size: 48px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 12px;
      }
      
      .dash-info-date {
        font-size: 20px;
        color: var(--text);
        margin-bottom: 8px;
      }
      
      .dash-info-matches {
        font-size: 14px;
        color: var(--muted);
      }
      
      .dash-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
      }
      
      .dash-stat {
        text-align: center;
        padding: 16px;
        background: rgba(12, 15, 109, 0.05);
        border-radius: 12px;
      }
      
      .dash-stat-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 8px;
      }
      
      .dash-stat-label {
        font-size: 14px;
        color: var(--muted);
      }
      
      .dash-empty {
        text-align: center;
        padding: 40px;
        color: var(--muted);
        font-size: 16px;
      }
      
      /* Mobile */
      @media (max-width: 768px) {
        .dashboard-carousel {
          padding: 16px;
          margin: 12px 0;
        }
        
        .dashboard-header h2 {
          font-size: 20px;
        }
        
        .dash-nav-btn {
          width: 32px;
          height: 32px;
          font-size: 16px;
        }
        
        .dash-list-item {
          grid-template-columns: 32px 1fr auto;
          gap: 8px;
          padding: 8px;
        }
        
        .dash-info-number {
          font-size: 36px;
        }
        
        .dash-stat-value {
          font-size: 24px;
        }
      }
      
      /* Dark mode */
      :root.dark .dash-list-item:hover {
        background: rgba(255,255,255,0.05);
      }
      
      :root.dark .dash-stat {
        background: rgba(12, 15, 109, 0.1);
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  // Expose functions
  window.dashboardNext = nextWidget;
  window.dashboardPrev = prevWidget;
  window.dashboardReload = reloadDashboard;
  
})();
