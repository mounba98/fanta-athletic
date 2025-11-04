/**
 * League Selector - Dropdown Navbar
 * Permette switch tra competizioni multiple
 * v2025101905
 */

(function() {
  'use strict';
  
  let currentLeague = null;
  let userLeagues = [];
  let attachRetries = 0;
  let listenersAttached = false;
  let initialized = false;
  let bootstrapScheduled = false;
  const MAX_ATTACH_RETRIES = 15;
  
  // Esponi globalmente
  window.currentLeague = null;
  
  /**
   * Inizializza selettore lega
   */
  async function initLeagueSelector() {
    if (initialized) return;

    if (!window.firebase || !firebase.auth) {
      setTimeout(initLeagueSelector, 400);
      return;
    }

    // On desktop wait until navbar is available
    if (window.innerWidth > 820 && !document.querySelector('header .nav')) {
      if (!bootstrapScheduled) {
        bootstrapScheduled = true;
        window.addEventListener('navbar-ready', () => {
          bootstrapScheduled = false;
          initLeagueSelector();
        }, { once: true });
      }
      setTimeout(initLeagueSelector, 200);
      return;
    }

    initialized = true;

    firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        console.log('No user logged in, skipping league selector');
        return;
      }

      await loadUserLeagues();
      await loadCurrentLeague();

      if (userLeagues.length === 0) {
        console.warn('[LEAGUE-SELECTOR] No leagues found, skipping render');
        return;
      }

      renderLeagueSelector();
      attachEventListeners();
    });
  }
  
  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeagueSelector);
  } else {
    initLeagueSelector();
  }
  
  /**
   * Carica tutte le leghe dell'utente
   */
  async function loadUserLeagues() {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        console.log('No user logged in for league selector');
        userLeagues = [];
        window.currentLeague = null;
        return;
      }
      
      console.log('🔍 [LEAGUE-SELECTOR] Querying leagues for user:', user.uid);
      const db = firebase.firestore();
      const leagueMap = new Map();

      const queries = [
        db.collection('leagues').where('members', 'array-contains', user.uid).get(),
        db.collection('leagues').where('admins', 'array-contains', user.uid).get(),
        db.collection('leagues').where('owner', '==', user.uid).get()
      ];

      const snapshots = await Promise.allSettled(queries);

      snapshots.forEach(result => {
        if (result.status !== 'fulfilled') {
          console.warn('[LEAGUE-SELECTOR] query failed', result.reason);
          return;
        }
        result.value.docs.forEach(doc => {
          if (!leagueMap.has(doc.id)) {
            leagueMap.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });
      });

      userLeagues = Array.from(leagueMap.values());

      userLeagues.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      
      console.log(`✅ [LEAGUE-SELECTOR] Loaded ${userLeagues.length} leagues for user`);
    } catch (error) {
      console.error('Error loading leagues:', error);
      userLeagues = [];
      window.currentLeague = null;
    }
  }
  
  /**
   * Carica lega corrente
   */
  async function loadCurrentLeague() {
    const leagueId = localStorage.getItem('last_league_id');
    
    if (!leagueId) {
      if (userLeagues.length > 0) {
        currentLeague = userLeagues[0];
        window.currentLeague = currentLeague;
        localStorage.setItem('last_league_id', currentLeague.id);
        console.log('✅ currentLeague defaulted to', currentLeague.id);
      } else {
        currentLeague = null;
        window.currentLeague = null;
      }
      return;
    }
    
    const league = userLeagues.find(l => l.id === leagueId);
    if (league) {
      currentLeague = league;
      window.currentLeague = league;
      console.log('✅ currentLeague loaded:', league.id);
    } else {
      if (userLeagues.length > 0) {
        currentLeague = userLeagues[0];
        window.currentLeague = currentLeague;
        localStorage.setItem('last_league_id', currentLeague.id);
        console.log('✅ currentLeague set from fallback:', currentLeague.id);
      } else {
        currentLeague = null;
        window.currentLeague = null;
      }
    }
    
    window.dispatchEvent(new CustomEvent('league-ready', { detail: { league: currentLeague } }));
  }
  
  /**
   * Renderizza selettore in navbar
   */
  function renderLeagueSelector() {
    // Su mobile/tablet: sotto la navbar, sopra il main
    // Su desktop: dentro la navbar
    const isMobileOrTablet = (window.deviceInfo && (window.deviceInfo.isSmartphone || window.deviceInfo.isTablet))
      || window.matchMedia('(max-width: 820px)').matches;
    
    let targetContainer;
    if (isMobileOrTablet) {
      let host = document.getElementById('leagueSelectorMobileHost');
      if (!host) {
        host = document.createElement('div');
        host.id = 'leagueSelectorMobileHost';
        host.className = 'league-selector-mobile-host';
        const header = document.querySelector('header');
        if (header && header.parentNode) {
          header.parentNode.insertBefore(host, header.nextSibling);
        } else {
          document.body.insertBefore(host, document.body.firstChild);
        }
      }
      targetContainer = host;
    } else {
      const nav = document.querySelector('header .nav');
      if (!nav) {
        // Navbar non ancora pronta, riprova tra poco
        setTimeout(renderLeagueSelector, 150);
        return;
      }
      targetContainer = nav;
    }
    
    // Check if already rendered
    if (document.getElementById('leagueSelector')) {
      // Già renderizzato, aggiorna solo content
      updateLeagueSelectorContent();
      return;
    }
    
    // Crea container
    const selector = document.createElement('div');
    selector.id = 'leagueSelector';
    selector.className = isMobileOrTablet ? 'league-selector league-selector-mobile' : 'league-selector';
    
    // Inserisci
    targetContainer.insertBefore(selector, targetContainer.firstChild);
    
    // Render content
    const leagueName = currentLeague ? currentLeague.name : 'Nessuna lega';
    const leagueIcon = currentLeague ? getLeagueIcon(currentLeague) : '📋';
    
    selector.innerHTML = `
      <button class="league-selector-btn" id="leagueSelectorBtn" aria-haspopup="true" aria-expanded="false">
        <span class="league-icon">${leagueIcon}</span>
        <span class="league-name">${truncate(leagueName, 20)}</span>
        <span class="dropdown-arrow">▾</span>
      </button>
      
      <div class="league-dropdown" id="leagueDropdown">
        ${renderDropdownContent()}
      </div>
    `;
    
    // Aggiungi stili se non esistono
    injectStyles();
    listenersAttached = false;
  }
  
  /**
   * Render contenuto dropdown
   */
  function renderDropdownContent() {
    if (userLeagues.length === 0) {
      return `
        <div class="league-dropdown-empty">
          <p>Non sei membro di nessuna competizione</p>
          <a href="admin-leghe.html" class="league-dropdown-action">
            ➕ Crea Nuova
          </a>
        </div>
      `;
    }
    
    const leaguesHTML = userLeagues.map(league => {
      const isActive = currentLeague && league.id === currentLeague.id;
      const teamCount = league.stats?.teamCount || league.teamCount || 0;
      const isMulti = teamCount > 1;
      const typeLabel = isMulti ? '🏆 Campionato' : '👤 Squadra unica';
      
      return `
        <div class="league-dropdown-item ${isActive ? 'active' : ''}" data-league-id="${league.id}">
          <span class="league-item-icon">${getLeagueIcon(league)}</span>
          <div class="league-item-info">
            <div class="league-item-name">${league.name}</div>
            <div class="league-item-meta">${typeLabel}${league.season ? ` • ${league.season}` : ''}</div>
          </div>
          ${isActive ? '<span class="league-item-check">✓</span>' : ''}
        </div>
      `;
    }).join('');
    
    return `
      <div class="league-dropdown-list">
        ${leaguesHTML}
      </div>
      <div class="league-dropdown-actions">
        <a href="admin-leghe.html" class="league-dropdown-action">
          <span>➕</span> Crea Nuova
        </a>
        <button class="league-dropdown-action" onclick="window.showJoinModal()">
          <span>🔍</span> Unisciti
        </button>
        <button class="league-dropdown-action" onclick="window.showInviteModal()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <span>📤</span> Invita Amici
        </button>
      </div>
    `;
  }
  
  /**
   * Ottieni icona per tipo lega
   */
  function getLeagueIcon(league) {
    if (league.type === 'multi') return '🏆';
    if (league.type === 'mono') return '👤';
    return '📋';
  }
  
  /**
   * Tronca stringa
   */
  function truncate(str, maxLen) {
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen - 3) + '...';
  }
  
  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    const btn = document.getElementById('leagueSelectorBtn');
    const dropdown = document.getElementById('leagueDropdown');
    
    if (!btn || !dropdown) {
      if (attachRetries < MAX_ATTACH_RETRIES) {
        attachRetries += 1;
        setTimeout(attachEventListeners, 200);
      } else {
        console.warn('⚠️ League selector elements not found after retries:', { btn: !!btn, dropdown: !!dropdown });
      }
      return;
    }
    
    if (listenersAttached) {
      return;
    }
    
    listenersAttached = true;
    attachRetries = 0;

    console.log('✅ Attaching league selector listeners');
    
    const resetDropdownStyles = () => {
      dropdown.style.position = '';
      dropdown.style.left = '';
      dropdown.style.right = '';
      dropdown.style.top = '';
      dropdown.style.maxWidth = '';
      dropdown.style.width = '';
      dropdown.style.maxHeight = '';
      dropdown.style.zIndex = '';
    };

    const closeDropdown = () => {
      dropdown.classList.remove('show');
      resetDropdownStyles();
      btn.setAttribute('aria-expanded', 'false');
    };

    const applyMobileDropdownPosition = () => {
      if (window.innerWidth > 820) {
        resetDropdownStyles();
        return;
      }
      const selector = btn.closest('.league-selector');
      if (!selector) return;
      dropdown.style.position = 'absolute';
      dropdown.style.left = '0';
      dropdown.style.right = '0';
      dropdown.style.top = `${btn.offsetHeight + 8}px`;
      dropdown.style.maxWidth = 'none';
      dropdown.style.width = '100%';
      dropdown.style.maxHeight = '70vh';
      dropdown.style.zIndex = '3000';
    };

    let touchTriggered = false;
    const toggleDropdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willShow = !dropdown.classList.contains('show');
      document.querySelectorAll('.league-dropdown.show').forEach(panel => {
        if (panel !== dropdown) {
          panel.classList.remove('show');
          panel.removeAttribute('style');
        }
      });
      if (willShow) {
        applyMobileDropdownPosition();
        dropdown.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        closeDropdown();
      }
    };

    btn.addEventListener('click', (e) => {
      if (touchTriggered) {
        touchTriggered = false;
        return;
      }
      toggleDropdown(e);
    });

    btn.addEventListener('touchstart', (e) => {
      touchTriggered = true;
      toggleDropdown(e);
    }, { passive: false });

    const handleDocumentClick = (e) => {
      if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        closeDropdown();
      }
    };

    const handleResize = () => {
      if (!dropdown.classList.contains('show')) return;
      if (window.innerWidth > 820) {
        closeDropdown();
        return;
      }
      applyMobileDropdownPosition();
    };

    const handleScroll = () => {
      if (dropdown.classList.contains('show') && window.innerWidth <= 820) {
        applyMobileDropdownPosition();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    dropdown.querySelectorAll('.league-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const leagueId = item.dataset.leagueId;
        console.log('📋 Switching to league:', leagueId);
        closeDropdown();
        switchLeague(leagueId);
      });
    });
  }
  
  /**
   * Aggiorna contenuto selettore esistente
   */
  function updateLeagueSelectorContent() {
    const selector = document.getElementById('leagueSelector');
    if (!selector) return;
    
    const leagueName = currentLeague ? currentLeague.name : 'Nessuna lega';
    const leagueIcon = currentLeague ? getLeagueIcon(currentLeague) : '📋';
    
    selector.innerHTML = `
      <button class="league-selector-btn" id="leagueSelectorBtn" aria-haspopup="true" aria-expanded="false">
        <span class="league-icon">${leagueIcon}</span>
        <span class="league-name">${truncate(leagueName, 20)}</span>
        <span class="dropdown-arrow">▾</span>
      </button>
      <div class="league-dropdown" id="leagueDropdown">
        ${renderDropdownContent()}
      </div>
    `;
    
    listenersAttached = false;
    setTimeout(attachEventListeners, 0);
  }
  
  /**
   * Switch a un'altra lega
   */
  function switchLeague(leagueId) {
    const dropdown = document.getElementById('leagueDropdown');
    if (currentLeague && leagueId === currentLeague.id) {
      // Stessa lega, chiudi dropdown
      if (dropdown) {
        dropdown.classList.remove('show');
        dropdown.removeAttribute('style');
      }
      return;
    }
    
    localStorage.setItem('last_league_id', leagueId);
    window.dispatchEvent(new CustomEvent('league-changed', { detail: { leagueId } }));
    
    // Reload pagina per aggiornare dati
    window.location.reload();
  }
  
  /**
   * Inject CSS styles
   */
  function injectStyles() {
    if (document.getElementById('leagueSelectorStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'leagueSelectorStyles';
    styles.textContent = `
      /* League Selector */
      .league-selector {
        position: relative;
        margin-right: 12px;
      }
      
      .league-selector-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: rgba(255,255,255,0.15);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 8px;
        color: white;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      
      .league-selector-btn:hover {
        background: rgba(255,255,255,0.25);
        border-color: rgba(255,255,255,0.5);
      }
      
      .league-icon {
        font-size: 18px;
      }
      
      .league-name {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .dropdown-arrow {
        font-size: 12px;
        transition: transform 0.2s;
      }
      
      .league-selector-btn:hover .dropdown-arrow {
        transform: translateY(2px);
      }
      
      /* Dropdown */
      .league-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 2000;
        max-height: 500px;
        overflow-y: auto;
      }
      
      .league-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .league-dropdown-list {
        padding: 8px;
        max-height: 350px;
        overflow-y: auto;
      }
      
      .league-dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .league-dropdown-item:hover {
        background: #f8f9fa;
      }
      
      .league-dropdown-item.active {
        background: #e3f2fd;
      }
      
      .league-item-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .league-item-info {
        flex: 1;
        min-width: 0;
      }
      
      .league-item-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .league-item-meta {
        font-size: 12px;
        color: var(--muted);
        margin-top: 2px;
      }
      
      .league-item-check {
        color: var(--primary);
        font-weight: bold;
        font-size: 18px;
      }
      
      .league-dropdown-empty {
        padding: 24px;
        text-align: center;
        color: var(--muted);
      }
      
      .league-dropdown-actions {
        border-top: 1px solid #e9ecef;
        padding: 8px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .league-dropdown-action {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        background: transparent;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        color: var(--text);
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .league-dropdown-action:hover {
        background: #f8f9fa;
        border-color: var(--primary);
        color: var(--primary);
      }
      
      /* Dark mode */
      :root.dark .league-dropdown {
        background: #1e293b;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
      
      :root.dark .league-dropdown-item:hover {
        background: #334155;
      }
      
      :root.dark .league-dropdown-item.active {
        background: #1e3a5f;
      }
      
      :root.dark .league-dropdown-actions {
        border-top-color: #334155;
      }
      
      :root.dark .league-dropdown-action {
        border-color: #334155;
      }
      
      :root.dark .league-dropdown-action:hover {
        background: #334155;
      }
      
      /* League selector mobile: riga sotto navbar NON sticky */
      .league-selector-mobile {
        width: 100%;
        margin: 0;
        background: #f8f9fa;
        padding: 6px 12px;
        border-bottom: 1px solid #dee2e6;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 1500;
      }
      
      .league-selector-mobile .league-selector-btn {
        width: 100%;
        justify-content: space-between;
        background: white;
        border: 2px solid #dee2e6;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      /* Dark mode mobile */
      :root.dark .league-selector-mobile {
        background: #1e293b;
        border-bottom-color: #334155;
      }
      
      :root.dark .league-selector-mobile .league-selector-btn {
        background: #0f172a;
        border-color: #334155;
        color: #e2e8f0;
      }
      
      /* Desktop: assicurati che sia visibile e cliccabile */
      @media (min-width: 769px) {
        .league-selector {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        
        .league-selector-btn {
          pointer-events: auto !important;
          cursor: pointer !important;
          display: flex !important;
        }
        
        .league-dropdown {
          right: 0;
          left: auto;
          z-index: 1000 !important;
        }
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .league-selector {
          width: 100%;
          margin: 0 0 8px 0;
          position: relative;
          z-index: 100;
          overflow: visible !important;
        }
        
        .league-selector-btn {
          width: 100%;
          justify-content: space-between;
        }
        
        .league-name {
          max-width: none;
          flex: 1;
        }
        
        .league-dropdown {
          left: 0;
          right: 0;
          min-width: auto;
          z-index: 10000 !important;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .league-dropdown.show {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      }
      
      @media (max-width: 480px) {
        .league-selector-btn {
          padding: 6px 12px;
          font-size: 12px;
        }
        
        .league-icon {
          font-size: 16px;
        }
      }

      .league-selector-mobile-host {
        width: 100%;
        position: relative;
        z-index: 1400;
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  // Esponi funzioni globali
  window.leagueSelector = {
    refresh: async () => {
      await loadUserLeagues();
      await loadCurrentLeague();
      renderLeagueSelector();
      attachEventListeners();
    },
    getCurrentLeague: () => currentLeague,
    getUserLeagues: () => userLeagues
  };
  
})();






