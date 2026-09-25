/**
 * League Selector - Dropdown Navbar
 * Permette switch tra competizioni multiple
 * v2025101905
 */

window.LEAGUE_SELECTOR_VERSION = 'debug-2025-11-19-01';
console.log('[league-selector] build debug-2025-11-19-01 caricata');

(function() {
  'use strict';
  // Caricato sia dalla pagina sia da app-init.js: il secondo avvio si ferma qui (D099)
  if (window.__FA_LEAGUE_SELECTOR_ON) return;
  window.__FA_LEAGUE_SELECTOR_ON = true;
  
  let currentLeague = null;
  let userLeagues = [];
  let attachRetries = 0;
  let listenersAttached = false;
  let initialized = false;
  let bootstrapScheduled = false;
  const MAX_ATTACH_RETRIES = 15;
  const INVITE_SCRIPT_SRC = window.LEAGUE_INVITE_SCRIPT_SRC || 'resources/league-invite-modal.js?v=20260920-final';
  let inviteModalPromise = null;
  
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

      // Se l'utente non ha ancora leghe, mostriamo comunque il selettore
      // vuoto con le azioni Crea/Unisciti, invece di saltare il render.
      if (userLeagues.length === 0 && !window.__LEAGUE_PERMISSION_DENIED__) {
        console.log('[LEAGUE-SELECTOR] No leagues found for user, rendering empty selector with join/create actions');
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
      
      console.log('🔍 [LEAGUE-SELECTOR] Loading leagues for user:', user.uid);
      const db = firebase.firestore();
      const leagueMap = new Map();
      let permissionDenied = false;

      // PRIMA: Prova a leggere la lega dal documento utente (più efficiente e funziona per non-admin)
      const leagueIdsFromUserDoc = new Set();
      const pushLeagueId = (id) => {
        if (typeof id === 'string' && id.trim()) {
          leagueIdsFromUserDoc.add(id.trim());
        }
      };

      const isUserInLeague = (leagueData = {}) => {
        if (leagueData.owner === user.uid) return true;
        if (Array.isArray(leagueData.members) && leagueData.members.includes(user.uid)) return true;
        if (leagueData.members && typeof leagueData.members === 'object' && leagueData.members[user.uid]) return true;
        if (Array.isArray(leagueData.admins) && leagueData.admins.includes(user.uid)) return true;
        if (leagueData.admins && typeof leagueData.admins === 'object' && leagueData.admins[user.uid]) return true;
        return false;
      };

      let userDocData = null;
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          userDocData = userDoc.data() || {};
          pushLeagueId(userDocData.currentLeague);
          if (Array.isArray(userDocData.leagues)) {
            userDocData.leagues.forEach(pushLeagueId);
          } else if (userDocData.leagues && typeof userDocData.leagues === 'object') {
            Object.keys(userDocData.leagues).forEach(pushLeagueId);
          }
          if (Array.isArray(userDocData.joinedLeagues)) {
            userDocData.joinedLeagues.forEach(pushLeagueId);
          }
        }
      } catch (err) {
        console.warn('[LEAGUE-SELECTOR] Error reading user doc:', err);
      }

      if (leagueIdsFromUserDoc.size > 0) {
        console.log('📋 [LEAGUE-SELECTOR] fetching leagues from user doc map', leagueIdsFromUserDoc.size);
        const fetches = Array.from(leagueIdsFromUserDoc).map(async (leagueId) => {
          try {
            const doc = await db.collection('leagues').doc(leagueId).get();
            if (doc.exists) {
              const leagueData = doc.data() || {};
              if (isUserInLeague(leagueData)) {
                leagueMap.set(doc.id, { id: doc.id, ...leagueData });
                console.log('✅ [LEAGUE-SELECTOR] added league from user doc:', doc.id);
              } else {
                console.warn(`[LEAGUE-SELECTOR] user ${user.uid} non presente in members/admins di ${doc.id}, skip`);
              }
            }
          } catch (err) {
            console.warn('[LEAGUE-SELECTOR] Error loading league from user doc list:', err);
          }
        });
        await Promise.all(fetches);
      }

      // SECONDA: Prova query (funziona solo per admin, ma proviamo comunque)
      const queries = [
        db.collection('leagues').where('members', 'array-contains', user.uid).get(),
        db.collection('leagues').where('admins', 'array-contains', user.uid).get(),
        db.collection('leagues').where('owner', '==', user.uid).get()
      ];

      const snapshots = await Promise.allSettled(queries);

      let permissionErrorLogged = false;
      // Se abbiamo già caricato leghe dal documento utente, non loggare errori sulle query
      const hasLeaguesFromUserDoc = leagueMap.size > 0;
      
      snapshots.forEach(result => {
        if (result.status !== 'fulfilled') {
          if (result.reason?.code === 'permission-denied') {
            permissionDenied = true;
            // Non loggare se abbiamo già trovato leghe dal documento utente
            if (!permissionErrorLogged && !hasLeaguesFromUserDoc) {
              console.warn('[LEAGUE-SELECTOR] Permission denied - using legacy mode (this is expected for non-admin users)');
              permissionErrorLogged = true;
            }
          } else {
            // Log altri errori solo una volta e solo se non abbiamo già leghe
            if (!permissionErrorLogged && !hasLeaguesFromUserDoc) {
              console.warn('[LEAGUE-SELECTOR] query failed', result.reason);
            }
          }
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
      
      // Se abbiamo trovato leghe dal documento utente, non siamo in legacy mode
      if (userLeagues.length > 0) {
        permissionDenied = false;
        window.__LEAGUE_PERMISSION_DENIED__ = false;
        // Se abbiamo già caricato la lega, non loggare il warning sulle query
        permissionErrorLogged = true;
      }

      if (permissionDenied && userLeagues.length === 0) {
        // Solo se non abbiamo trovato leghe e c'è stato un permission denied, logga
        if (!permissionErrorLogged) {
          console.warn('[LEAGUE-SELECTOR] Permission denied - using legacy mode (this is expected for non-admin users)');
          permissionErrorLogged = true;
        }
        window.__LEAGUE_PERMISSION_DENIED__ = true;
        try {
          if (window.LeagueHelper && typeof window.LeagueHelper.disableMultiLeague === 'function') {
            window.LeagueHelper.disableMultiLeague();
          }
        } catch (err) {
          console.warn('[LEAGUE-SELECTOR] impossibile disabilitare multi-league automaticamente', err);
        }
      }
    } catch (error) {
      // Non loggare errori permission-denied (sono attesi per non-admin)
      if (error?.code !== 'permission-denied') {
        console.error('Error loading leagues:', error);
      }
      
      // Se abbiamo già trovato leghe dal documento utente, non impostare legacy mode
      if (userLeagues.length > 0) {
        // Abbiamo già leghe, non fare nulla
        return;
      }
      
      userLeagues = [];
      window.currentLeague = null;
      if (error?.code === 'permission-denied') {
        // Solo se non abbiamo trovato leghe, logga il warning
        console.warn('[LEAGUE-SELECTOR] Permission denied - using legacy mode (this is expected for non-admin users)');
        window.__LEAGUE_PERMISSION_DENIED__ = true;
        try {
          if (window.LeagueHelper && typeof window.LeagueHelper.disableMultiLeague === 'function') {
            window.LeagueHelper.disableMultiLeague();
          }
        } catch (err) {
          console.warn('[LEAGUE-SELECTOR] impossibile disabilitare multi-league dopo errore', err);
        }
      }
    }
  }
  
  /**
   * Carica lega corrente con ordine di priorità robusto
   */
  async function loadCurrentLeague() {
    console.log('[league-selector] Inizio loadCurrentLeague');
    
    if (window.__LEAGUE_PERMISSION_DENIED__) {
      console.log('[league-selector] Permission denied detected, nessuna lega');
      currentLeague = null;
      window.currentLeague = null;
      try { localStorage.removeItem('last_league_id'); } catch (_) {}
      window.dispatchEvent(new CustomEvent('league-ready', { detail: { league: null } }));
      return;
    }
    
    let targetLeagueId = null;
    const user = firebase.auth().currentUser;
    
    // 1) PRIORITÀ MASSIMA: users/{uid}.currentLeague
    if (user) {
      try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data() || {};
          if (userData.currentLeague) {
            targetLeagueId = userData.currentLeague;
            console.log('[league-selector] currentLeague trovato da users doc:', targetLeagueId);
          }
        }
      } catch (err) {
        console.warn('[league-selector] Errore lettura users/{uid}.currentLeague:', err);
      }
    }
    
    // 2) SECONDARIO: localStorage.last_league_id
    if (!targetLeagueId) {
      targetLeagueId = localStorage.getItem('last_league_id');
      if (targetLeagueId) {
        console.log('[league-selector] currentLeague trovato da localStorage:', targetLeagueId);
      }
    }
    
    // 3) FALLBACK: prima lega disponibile
    if (!targetLeagueId && userLeagues.length > 0) {
      targetLeagueId = userLeagues[0].id;
      console.log('[league-selector] currentLeague defaulted to prima lega disponibile:', targetLeagueId);
    }
    
    if (!targetLeagueId) {
      console.log('[league-selector] Nessuna lega disponibile');
      currentLeague = null;
      window.currentLeague = null;
      window.dispatchEvent(new CustomEvent('league-ready', { detail: { league: null } }));
      return;
    }
    
    // Carica i dati della lega target
    let league = userLeagues.find(l => l.id === targetLeagueId);
    if (!league) {
      try {
        const doc = await firebase.firestore().collection('leagues').doc(targetLeagueId).get();
        if (doc.exists) {
          const data = doc.data() || {};
          league = { id: doc.id, ...data };
          const existingIndex = userLeagues.findIndex(l => l.id === doc.id);
          if (existingIndex >= 0) {
            userLeagues[existingIndex] = league;
          } else {
            userLeagues.unshift(league);
          }
          console.log('[league-selector] lega caricata on-demand:', doc.id);
        } else {
          console.warn('[league-selector] lega target non trovata su Firestore:', targetLeagueId);
        }
      } catch (err) {
        console.warn('[league-selector] Errore caricamento lega target:', err);
      }
    }
    
    // Imposta la lega corrente
    if (league) {
      currentLeague = league;
      window.currentLeague = currentLeague;
      localStorage.setItem('last_league_id', currentLeague.id);
      console.log('[league-selector] currentLeague impostato:', currentLeague.name, '(ID:', currentLeague.id, ')');

      // Log meta leagueType/sportType per debug UI (reality_show vs sport_league)
      if (currentLeague) {
        if (typeof window.getLeagueType === 'function') {
          console.log('[league-selector] currentLeague meta:', {
            id: currentLeague.id,
            name: currentLeague.name,
            sportType: currentLeague.sportType || 'football',
            leagueType: window.getLeagueType(currentLeague)
          });
        } else {
          console.log('[league-selector] currentLeague meta:', {
            id: currentLeague.id,
            name: currentLeague.name,
            sportType: currentLeague.sportType || 'football',
            leagueType: currentLeague.leagueType || 'sport_league'
          });
        }
      }
    } else {
      // Fallback alla prima lega disponibile se la target non esiste
      if (userLeagues.length > 0) {
        currentLeague = userLeagues[0];
        window.currentLeague = currentLeague;
        localStorage.setItem('last_league_id', currentLeague.id);
        console.log('[league-selector] fallback to prima lega disponibile:', currentLeague.id);
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
  // D110: su telefono il selettore va NELL'intestazione, tra il titolo e il
  // badge della stagione (#currentLeagueBadge, creato da navbar.js magari dopo):
  // si riprova per qualche secondo, altrimenti resta sotto l'intestazione come prima.
  function placeInHeader(host, tries) {
    tries = tries || 0;
    const badge = document.querySelector('header h1 #currentLeagueBadge');
    if (badge && badge.parentNode) {
      badge.parentNode.insertBefore(host, badge);
      host.classList.add('in-header');
      return;
    }
    if (tries < 30) setTimeout(function() { placeInHeader(host, tries + 1); }, 150);
  }

  // D113: sezione "Competizioni" della stagione (Lega → Stagione → Competizioni).
  // La competizione scelta guida Classifiche e Calendario (resources/competitions.js).
  function loadCompetitionsLib() {
    if (window.Competitions) return Promise.resolve(window.Competitions);
    if (window.__competitionsLoading) return window.__competitionsLoading;
    window.__competitionsLoading = new Promise(resolve => {
      const sc = document.createElement('script');
      sc.src = 'resources/competitions.js?v=20260925';
      sc.onload = () => resolve(window.Competitions || null);
      sc.onerror = () => resolve(null);
      document.head.appendChild(sc);
    });
    return window.__competitionsLoading;
  }

  async function fillCompetitions(dropdown) {
    const box = dropdown && dropdown.querySelector('#leagueDropdownComps');
    if (!box) return;
    const C = await loadCompetitionsLib();
    if (!C || !currentLeague) { box.innerHTML = ''; return; }
    const lid = currentLeague.id;
    const list = await C.active(lid);
    const cur = await C.current(lid);
    const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    box.innerHTML = '<div class="league-sport-header">Competizioni' + (list.seasonLabel ? ' ' + esc(list.seasonLabel) : '') + '</div>' +
      list.map(c => '<button type="button" class="league-comp-item' + (c.id === cur.id ? ' active' : '') + '" data-comp="' + c.id + '">' +
        '<span class="league-comp-dot"></span><span class="league-comp-info"><b>' + esc(c.label) + '</b><small>' + esc(c.desc) + '</small></span>' +
        (c.id === cur.id ? '<span class="league-item-check">✓</span>' : '') + '</button>').join('');
    box.querySelectorAll('[data-comp]').forEach(b => b.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const comp = list.find(x => x.id === b.dataset.comp);
      C.choose(lid, comp.id);
      const [page, hash] = comp.page.split('#');
      const here = (location.pathname.split('/').pop() || 'index.html') === page;
      if (here) { location.hash = hash; location.reload(); }
      else location.href = comp.page;
    }));
  }

  function renderLeagueSelector() {
    // Anche senza permessi, mostra selettore in modalità disabled
    const hasPermissionDenied = window.__LEAGUE_PERMISSION_DENIED__;
    if (hasPermissionDenied) {
      // Su mobile/tablet: crea container se non esiste
      const isMobileOrTablet = (window.deviceInfo && (window.deviceInfo.isSmartphone || window.deviceInfo.isTablet))
        || window.matchMedia('(max-width: 820px)').matches;
      
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
          placeInHeader(host);
        }
        host.innerHTML = '<div style="padding:8px 12px;background:rgba(148,163,184,0.1);border-radius:8px;color:var(--muted);font-size:13px;text-align:center;">Modalità legacy (nessuna lega selezionata)</div>';
        return;
      } else {
        // Desktop: mostra selettore disabled nella navbar
        const existing = document.getElementById('leagueSelector');
        if (existing) {
          existing.innerHTML = '<select disabled style="opacity:0.6;cursor:not-allowed;"><option>Modalità legacy (nessuna lega selezionata)</option></select>';
          return;
        }
        // Se non esiste, crealo nella navbar
        const nav = document.querySelector('header .nav');
        if (nav) {
          const selector = document.createElement('div');
          selector.id = 'leagueSelector';
          selector.className = 'league-selector';
          selector.innerHTML = '<select disabled style="opacity:0.6;cursor:not-allowed;"><option>Modalità legacy (nessuna lega selezionata)</option></select>';
          nav.insertBefore(selector, nav.firstChild);
        }
        return;
      }
    }
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
        placeInHeader(host);
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
   * Render contenuto dropdown con raggruppamento per sport
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
    
    // Raggruppa leghe per sportType
    const leaguesBySport = {};
    userLeagues.forEach(league => {
      const sportType = league.sportType || 'football';
      if (!leaguesBySport[sportType]) {
        leaguesBySport[sportType] = [];
      }
      leaguesBySport[sportType].push(league);
    });
    
    // Funzione helper per ottenere configurazione sport
    const getSportConfig = (sportType) => {
      const configs = {
        'football': { label: '⚽ Calcio', icon: '⚽' },
        'basketball': { label: '🏀 Basket', icon: '🏀' },
        'volleyball': { label: '🏐 Volley', icon: '🏐' },
        'sanremo': { label: '🎤 Sanremo', icon: '🎤' },
        'reality_tv': { label: '📺 Reality TV', icon: '📺' },
        'default': { label: '📋 Altro', icon: '📋' }
      };
      return configs[sportType] || configs.default;
    };
    
    // Genera HTML per ogni gruppo sport
    let leaguesHTML = '';
    Object.keys(leaguesBySport).forEach(sportType => {
      const sportConfig = getSportConfig(sportType);
      const sportLeagues = leaguesBySport[sportType];
      
      leaguesHTML += `
        <div class="league-sport-group">
          <div class="league-sport-header">${sportConfig.label}</div>
          <div class="league-sport-list">
      `;
      
      sportLeagues.forEach(league => {
        const isActive = currentLeague && league.id === currentLeague.id;
        const teamCount = league.stats?.teamCount || league.teamCount || 0;
        const isMulti = teamCount > 1;
        // D111: lega → stagione → competizioni (docs/GLOSSARIO_LEGHE.md): qui si mostra la stagione
        const typeLabel = isMulti ? 'Stagione non impostata' : 'Squadra unica';
        
        leaguesHTML += `
          <div class="league-dropdown-item ${isActive ? 'active' : ''}" data-league-id="${league.id}">
            <span class="league-item-icon">${getLeagueIcon(league)}</span>
            <div class="league-item-info">
              <div class="league-item-name">${league.name}</div>
              <div class="league-item-meta">${league.season ? `Stagione ${league.season}` : typeLabel}</div>
            </div>
            ${isActive ? '<span class="league-item-check">✓</span>' : ''}
          </div>
        `;
      });
      
      leaguesHTML += `
          </div>
        </div>
      `;
    });
    
    return `
      <div class="league-dropdown-list">
        ${leaguesHTML}
      </div>
      <div class="league-dropdown-comps" id="leagueDropdownComps"></div>
      <div class="league-dropdown-actions">
        <a href="admin-leghe.html" class="league-dropdown-action">
          <span>➕</span> Crea Nuova
        </a>
        <button class="league-dropdown-action league-join-action" type="button">
          <span>🔍</span> Unisciti
        </button>
        <button class="league-dropdown-action league-invite-action" type="button" style="background: linear-gradient(135deg, #0c0f6d 0%, #920100 100%); color: white;">
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

    // D113: velo dietro la tendina — un tocco fuori la chiude e NON attiva ciò che c'è sotto
    const removeVeil = () => { const v = document.getElementById('leagueDropdownVeil'); if (v) v.remove(); };
    const addVeil = () => {
      removeVeil();
      const v = document.createElement('div');
      v.id = 'leagueDropdownVeil';
      v.style.cssText = 'position:fixed;inset:0;z-index:9990;background:rgba(2,6,23,.35);-webkit-tap-highlight-color:transparent;';
      const swallow = ev => { ev.preventDefault(); ev.stopPropagation(); closeDropdown(); };
      v.addEventListener('click', swallow);
      v.addEventListener('touchend', swallow, { passive: false });
      document.body.appendChild(v);
    };
    const closeDropdown = () => {
      dropdown.classList.remove('show');
      resetDropdownStyles();
      btn.setAttribute('aria-expanded', 'false');
      removeVeil();
    };

    const applyMobileDropdownPosition = () => {
      if (window.innerWidth > 820) {
        resetDropdownStyles();
        return;
      }
      const selector = btn.closest('.league-selector');
      if (!selector) return;
      // D110: selettore nell'intestazione → la tendina esce dall'intestazione (che
      // "intrappola" gli elementi fissi) e si apre a tutta larghezza sotto di essa
      if (btn.closest('.league-selector-mobile-host.in-header')) {
        if (dropdown.parentNode !== document.body) document.body.appendChild(dropdown);
        const hb = document.querySelector('header') ? document.querySelector('header').getBoundingClientRect().bottom : 60;
        dropdown.style.position = 'fixed';
        dropdown.style.left = '12px';
        dropdown.style.right = '12px';
        dropdown.style.top = Math.round(hb + 6) + 'px';
        dropdown.style.width = 'auto';
        dropdown.style.maxWidth = 'none';
        dropdown.style.maxHeight = '70vh';
        dropdown.style.zIndex = '10050';
        return;
      }
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
        fillCompetitions(dropdown);
        // il velo solo se la tendina è stata spostata nella pagina (telefono, D110):
        // su computer vive dentro la barra in alto e il velo la coprirebbe
        if (dropdown.parentNode === document.body) addVeil();
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

    const joinAction = dropdown.querySelector('.league-join-action');
    if (joinAction) {
      joinAction.addEventListener('click', (event) => {
        event.preventDefault();
        closeDropdown();
        if (typeof window.showJoinModal === 'function') {
          window.showJoinModal();
        } else {
          alert('Funzione join non disponibile');
        }
      });
    }

    const inviteAction = dropdown.querySelector('.league-invite-action');
    if (inviteAction) {
      inviteAction.addEventListener('click', async (event) => {
        event.preventDefault();
        closeDropdown();
        try {
          await ensureInviteModalLoaded();
          if (typeof window.showInviteModal === 'function') {
            window.showInviteModal();
          } else {
            throw new Error('showInviteModal non è disponibile');
          }
        } catch (error) {
          console.error('[LEAGUE-SELECTOR] Impossibile aprire la finestra inviti', error);
          alert('Errore nell\'apertura della finestra inviti. Riprova più tardi.');
        }
      });
    }
  }
  
  /**
   * Aggiorna contenuto selettore esistente
   */
  function updateLeagueSelectorContent() {
    const selector = document.getElementById('leagueSelector');
    if (!selector) return;
    // tendina spostata nella pagina (D110): si toglie prima di ricrearla, niente doppioni
    document.querySelectorAll('body > .league-dropdown').forEach(n => n.remove());
    
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
  async function switchLeague(leagueId) {
    console.log('[league-selector] Inizio switchLeague a:', leagueId);
    
    const dropdown = document.getElementById('leagueDropdown');
    if (currentLeague && leagueId === currentLeague.id) {
      console.log('[league-selector] Stessa lega selezionata, nessun cambio');
      // Stessa lega, chiudi dropdown
      if (dropdown) {
        dropdown.classList.remove('show');
        dropdown.removeAttribute('style');
      }
      return;
    }
    
    // Reset cache locale quando cambia lega (evita mix di dati)
    clearLeagueLocalCache();
    
    // Aggiorna localStorage e globali
    localStorage.setItem('last_league_id', leagueId);
    window.currentLeagueId = leagueId;
    
    // Trova i dati della lega selezionata
    const selectedLeague = userLeagues.find(l => l.id === leagueId);
    if (selectedLeague) {
      window.currentLeague = selectedLeague;
      console.log('[league-selector] window.currentLeague aggiornato:', selectedLeague.name);
    }
    
    // Aggiorna users/{uid}.currentLeague su Firestore (async, non bloccante)
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).update({
          currentLeague: leagueId
        });
        console.log('[league-selector] currentLeague aggiornato su Firestore per utente:', user.uid);
      }
    } catch (err) {
      console.warn('[league-selector] Errore aggiornamento currentLeague su Firestore:', err);
      // Non bloccare l'esperienza utente se fallisce la scrittura
    }
    
    // Dispatch evento per le pagine che ascoltano
    window.dispatchEvent(new CustomEvent('league-changed', { detail: { leagueId, league: selectedLeague } }));
    console.log('[league-selector] Evento league-changed dispatchato');
    
    // Reload pagina per aggiornare dati
    console.log('[league-selector] Reload pagina per applicare cambiamenti');
    window.location.reload();
  }

  /**
   * Pulisce la cache localStorage per evitare dati mischiati tra leghe
   */
  function clearLeagueLocalCache() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('teams_') || 
          key.startsWith('teams_data') ||
          key.startsWith('team_logo_') ||
          key.startsWith('teams_saved_') ||
          key.startsWith('players_G') ||
          key.startsWith('coaches_G') ||
          key.startsWith('curva_G') ||
          key.startsWith('results_') ||
          key.startsWith('days_') ||
          key.startsWith('matchday_') ||
          key.startsWith('lineup_') ||
          key.startsWith('classifica_') ||
          key.startsWith('convocati_') ||
          key.startsWith('saved_') ||
          key.startsWith('standings_') ||
          key.startsWith('schedule_') ||
          key.startsWith('h2h_')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 [league-selector] Cache pulita (${keysToRemove.length} chiavi) per cambio lega`);
    } catch (err) {
      console.warn('[league-selector] Errore pulizia cache:', err);
    }
  }

  async function ensureInviteModalLoaded() {
    if (typeof window.showInviteModal === 'function') {
      return;
    }

    if (!inviteModalPromise) {
      const existingScript = document.querySelector('script[src*="league-invite-modal.js"]');
      inviteModalPromise = new Promise((resolve, reject) => {
        if (existingScript) {
          const state = existingScript.readyState;
          if (typeof window.showInviteModal === 'function' || state === 'complete' || state === 'loaded') {
            resolve();
            return;
          }
          existingScript.addEventListener('load', resolve, { once: true });
          existingScript.addEventListener('error', reject, { once: true });
        } else {
          const script = document.createElement('script');
          script.src = INVITE_SCRIPT_SRC;
          script.async = true;
          script.dataset.leagueInvite = 'true';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        }
      }).then(() => {
        if (typeof window.showInviteModal !== 'function') {
          throw new Error('Script degli inviti caricato ma showInviteModal non definita');
        }
      }).catch((error) => {
        throw error;
      }).finally(() => {
        inviteModalPromise = null;
      });
    }

    await inviteModalPromise;
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
        border-radius: 999px;
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
      
      /* Sport grouping */
      .league-sport-group {
        margin-bottom: 12px;
      }
      
      .league-sport-header {
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
        color: var(--muted);
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .league-sport-list {
        padding: 0 4px;
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
      
      /* League selector mobile: riga sotto navbar NON sticky.
         Il contenitore è solo layout: niente sfondo/bordo/ombra propri,
         altrimenti si vede un "alone" tra questo box e il tab dentro
         (segnalato 2026-09-20) — il colore visibile del tab lo dà solo
         il pulsante stesso, qui sotto. */
      .league-selector-mobile {
        width: 100%;
        margin: 0;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 900;
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
      
      /* Dark mode mobile: il contenitore resta senza sfondo proprio
         (vedi commento sopra su .league-selector-mobile) — qui si
         colora solo il tab vero e proprio. */
      :root.dark .league-selector-mobile .league-selector-btn {
        background: #1e293b;
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
        z-index: 900;
        padding: 0 16px;
        /* Spaziatura affidata al gap del flex layout del body (sheet.css),
           non a un margine proprio: evita di sommare due distanze diverse
           tra header/tab-lega e tab-lega/contenuto (2026-09-20). */
        margin: 0;
      }
    `;
    
    // D110: pillola compatta nell'intestazione (stile del badge stagione)
    styles.textContent += `
      .league-selector-mobile-host.in-header { flex: 0 0 auto !important; width: auto !important; max-width: none !important; margin: 0 6px 0 4px !important; padding: 0 !important; display: inline-flex !important; align-items: center; }
      .league-selector-mobile-host.in-header .league-selector-mobile { width: auto; padding: 0; margin: 0; z-index: 1200; }
      /* D110b: solo la coppa in un cerchietto (il nome della lega è nella tendina) */
      :root .league-selector-mobile-host.in-header .league-selector-btn.league-selector-btn {
        width: 26px; height: 26px; min-width: 26px; padding: 0; gap: 0; justify-content: center; align-items: center;
        border-radius: 50%; background: rgba(255,255,255,.14); border: 1px solid rgba(250,204,21,.55); box-shadow: none;
      }
      .league-selector-mobile-host.in-header .league-icon { font-size: 13px; line-height: 1; margin: 0; }
      .league-selector-mobile-host.in-header .league-name,
      .league-selector-mobile-host.in-header .dropdown-arrow { display: none !important; }
    `;
    styles.textContent += `
      .league-dropdown-comps { padding: 4px 8px 8px; border-top: 1px solid rgba(148,163,184,.25); }
      .league-dropdown-comps:empty { display: none; }
      .league-comp-item { display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:10px 12px; margin-top:6px; border-radius:12px; border:1px solid rgba(148,163,184,.25) !important; background:transparent !important; color:inherit !important; cursor:pointer; font-family:inherit; }
      .league-comp-item.active { border-color: rgba(250,204,21,.6) !important; background: rgba(250,204,21,.08) !important; }
      .league-comp-dot { width:12px; height:12px; border-radius:50%; border:2px solid rgba(148,163,184,.7); flex:none; }
      .league-comp-item.active .league-comp-dot { border-color:#facc15; background:#facc15; }
      .league-comp-info { flex:1; display:flex; flex-direction:column; line-height:1.25; }
      .league-comp-info b { font-size:14px; } .league-comp-info small { font-size:12px; opacity:.7; }
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






