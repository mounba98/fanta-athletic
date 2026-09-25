// Navbar Component Unico per Fanta Athletic 2018
// Version: 2025101901 - Refactored with Admin tab and responsive fixes
(function() {
  'use strict';

  const APP_VERSION = '2025.12.01-1';
  const APP_VERSION_STORAGE_KEY = 'fantaAthletic_app_version';

  function trackAppVersion() {
    try {
      const previous = localStorage.getItem(APP_VERSION_STORAGE_KEY);
      if (previous === APP_VERSION) {
        return;
      }

      localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
      window.FantaAthleticAppVersion = APP_VERSION;
      console.log('[FantaAthletic] App version', APP_VERSION, '(previous:', previous || 'none', ')');

      // Mostra un piccolo avviso solo quando la versione cambia realmente
      if (previous && typeof window.toast === 'function') {
        window.toast(`App aggiornata alla versione ${APP_VERSION}`);
      }
    } catch (e) {
      console.warn('[FantaAthletic] Impossibile tracciare la versione app', e);
    }
  }

  function createNavbar(currentPage, isAdmin = false) {
    // Store è sempre visibile, non dipende da isAdmin
    const allPages = [
      { href: 'index.html', label: 'Home', icon: '<img src="resources/icons/home.png" alt="Home" />', desktop: true, mobile: true },
      { href: 'squadre.html', label: 'Squadre', icon: '<img src="resources/icons/squadre.png" alt="Squadre" />', desktop: true, mobile: false },
      { href: 'formazioni.html', label: 'Formazioni', icon: '<img src="resources/icons/formazioni.png" alt="Formazioni" />', desktop: true, mobile: true },
      { href: 'contest.html', label: 'Mini-gioco', icon: '', desktop: true, mobile: false },
      { href: 'classifiche.html', label: 'Classifiche', icon: '<img src="resources/icons/classifica.png" alt="Classifiche" />', desktop: true, mobile: false },
      { href: 'statistiche.html', label: 'Statistiche', icon: '<img src="resources/icons/statistiche.png" alt="Statistiche" />', desktop: true, mobile: false },
      { href: 'store.html', label: 'Store', icon: '<img src="resources/icons/store.png" alt="Store" />', desktop: true, mobile: true },
      { href: 'bacheca.html', label: 'Bacheca', icon: '<img src="resources/icons/bacheca.png" alt="Bacheca" />', desktop: true, mobile: true }
    ];
    
    // Calcolo (ex Giornate) solo per admin
    if (isAdmin) {
      allPages.splice(4, 0, { href: 'matchday.html', label: 'Calcolo', icon: '<img src="resources/icons/calcolo.png" alt="Calcolo" />', desktop: true, mobile: false, isAdminOnly: true });
      allPages.push({ href: 'admin-setup.html', label: 'Setup', icon: '<img src="resources/icons/impostazioni.png" alt="Setup" />', desktop: true, mobile: false, isAdmin: true });
      allPages.push({ href: 'admin.html', label: 'Admin', icon: '<img src="resources/icons/admin.png" alt="Admin" />', desktop: true, mobile: false, isAdmin: true });
    }

    let navHTML = '<nav class="nav" role="navigation">';
    
    // Crea link navbar
    allPages.forEach(page => {
      const isActive = currentPage === page.href ? ' aria-current="page"' : '';
      const mobileClass = page.mobile && !page.desktop ? ' nav-mobile-only' : (page.mobile && page.desktop ? ' nav-both' : ' nav-desktop');
      const adminClass = page.isAdmin ? ' nav-admin' : '';
      
      navHTML += `<a href="${page.href}"${isActive} class="nav-link${mobileClass}${adminClass}" title="${page.label}">
        <span class="nav-icon">${page.icon}</span>
        <span class="nav-label">${page.label}</span>
      </a>`;
    });
    
    // Theme toggle button con icona dinamica
    const isDark = document.documentElement.classList.contains('dark');
    navHTML += `<button class="theme-btn nav-desktop" onclick="window.toggleTheme && window.toggleTheme()" title="Toggle Theme" aria-label="Toggle Theme">
      <span class="theme-icon">${isDark ? '☀️' : '🌙'}</span>
    </button>`;
    
    // Campanella notifiche (placeholder, script separato la popola)
    navHTML += `<div id="notificationDropdownIcon" style="margin-left: 12px;"></div>`;
    
    // Profile icon con foto se disponibile
    navHTML += `<div id="navbarProfileIcon" style="margin-left: 12px;"></div>`;
    
    navHTML += '</nav>';
    
    // Aggiungi pulsante "Accedi" se non loggato (dopo la navbar)
    navHTML += `<div id="navbarAuthBtn" style="margin-left: 12px;"></div>`;
    
    return navHTML;
  }

  const BADGE_ID = 'currentLeagueBadge';

  // Avvolge il testo del titolo (es. "Squadre") in uno <span> che può
  // crescere per riempire lo spazio libero nell'intestazione — così i
  // badge aggiunti dopo (stagione, "Nessuna squadra"...) restano sempre
  // raggruppati sulla destra, qualunque sia il loro numero, invece di
  // sparpagliarsi con margin-left:auto su ciascuno (D059).
  function wrapHeaderTitleText(h1) {
    if (!h1 || h1.querySelector('.header-title-text')) return;
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    const textNode = walker.nextNode();
    if (textNode && textNode.textContent.trim()) {
      const span = document.createElement('span');
      span.className = 'header-title-text';
      span.textContent = textNode.textContent;
      textNode.parentNode.replaceChild(span, textNode);
    }
  }
  window.__wrapHeaderTitleText = wrapHeaderTitleText;

  async function fetchLeagueDoc(leagueId) {
    if (!leagueId || !window.firebase || !firebase.firestore) return null;
    try {
      const snap = await firebase.firestore().collection('leagues').doc(leagueId).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...(snap.data() || {}) };
    } catch (err) {
      console.warn('[navbar] impossibile leggere lega', err);
      return null;
    }
  }

  function ensureLeagueBadge(hostElement) {
    if (!hostElement) return null;
    wrapHeaderTitleText(hostElement);
    let badge = document.getElementById(BADGE_ID);
    if (badge) return badge;
    badge = document.createElement('span');
    badge.id = BADGE_ID;
    badge.style.cssText = `
      display:none;
      flex-shrink:0;
      padding:4px 12px;
      border-radius:999px;
      background:rgba(255,255,255,0.14);
      border:1px solid rgba(250,204,21,0.55);
      color:#fff;
      font-size:11px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.04em;
      white-space:nowrap;
    `;
    hostElement.appendChild(badge);
    return badge;
  }

  async function updateLeagueBadge(leagueHint) {
    const header = document.querySelector('header');
    if (!header) return;
    const h1 = header.querySelector('h1');
    if (!h1) return;
    const badge = ensureLeagueBadge(h1);
    if (!badge) return;

    const helper = window.LeagueHelper;
    const currentId = leagueHint?.id || helper?.getCurrentLeagueId?.() || window.LeagueContext?.getCurrentLeagueId?.();
    if (!currentId) {
      badge.style.display = 'none';
      badge.textContent = '';
      return;
    }

    let leagueData = leagueHint;
    if (!leagueData || !leagueData.name) {
      leagueData = await fetchLeagueDoc(currentId);
    }
    if (!leagueData) {
      badge.style.display = 'none';
      badge.textContent = '';
      return;
    }

    const config = window.getSportConfig?.(leagueData.sportType) || null;
    const extras = [];
    if (config?.label) extras.push(config.label);
    if (leagueData.season) extras.push(leagueData.season);
    // Il nome della lega è già mostrato nel tab selettore lega subito sotto
    // l'intestazione: ripeterlo qui creava un doppione visivo (2026-09-20).
    badge.textContent = extras.length ? extras.join(' · ') : (leagueData.name || 'Lega');
    badge.style.display = 'inline-flex';
  }

  async function initNavbar() {
    const header = document.querySelector('header');
    if (!header) return;

    // Trova la pagina corrente
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Wait for Firebase to be ready
    let currentUser = null;
    await new Promise(resolve => {
      if (window.firebase && firebase.auth && firebase.firestore) {
        firebase.auth().onAuthStateChanged((user) => {
          currentUser = user;
          resolve();
        });
      } else {
        setTimeout(() => {
          if (window.firebase && firebase.auth && firebase.firestore) {
            firebase.auth().onAuthStateChanged((user) => {
              currentUser = user;
              resolve();
            });
          } else {
            resolve();
          }
        }, 500);
      }
    });
    
    // Check se è admin
    let isAdmin = false;
    if (window.firebase && firebase.auth && firebase.firestore && currentUser) {
      try {
        const adminDoc = await firebase.firestore().collection('admins').doc(currentUser.uid).get();
        isAdmin = adminDoc.exists;
        console.log('Admin check:', currentUser.email, 'isAdmin:', isAdmin);
      } catch (e) {
        console.error('Admin check error:', e);
        if (window.logFirebaseError) {
          window.logFirebaseError('admin_check', e, { userId: currentUser?.uid });
        }
      }
    }
    
    // Fallback: controlla anche localStorage per compatibilità
    if (!isAdmin) {
      try {
        const adminEnabled = localStorage.getItem('admin_enabled');
        isAdmin = adminEnabled === 'true';
      } catch (e) {
        console.warn('LocalStorage admin check failed:', e);
      }
    }
    
    // Crea navbar
    const navbarHTML = createNavbar(currentPage, isAdmin);
    
    // Inserisci dopo h1
    const h1 = header.querySelector('h1');
    if (h1) {
      h1.insertAdjacentHTML('afterend', navbarHTML);
    }
    updateLeagueBadge();
    
    // Aggiorna pulsante auth
    updateAuthButton(currentUser);
    
    if (!window.__navbarReadyOnce) {
      window.__navbarReadyOnce = true;
      window.dispatchEvent(new CustomEvent('navbar-ready'));
    }
    
    // Aggiorna link auth
    updateAuthLink();
    
    // Aggiorna navbar quando cambia lo stato di autenticazione
    if (window.firebase && firebase.auth && firebase.firestore) {
      firebase.auth().onAuthStateChanged(async (user) => {
        updateAuthButton(user);
        if (user) {
          try {
            const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
            const newIsAdmin = adminDoc.exists;
            if (newIsAdmin !== isAdmin) {
              // Ricarica la navbar se lo stato admin è cambiato
              location.reload();
            }
          } catch (e) {
            console.error('Admin check error on auth change:', e);
            if (window.logFirebaseError) {
              window.logFirebaseError('admin_check_auth_change', e, { userId: user.uid });
            }
          }
        }
      });
    }
    
    // Traccia versione app per distinguere utenti su build vecchia/nuova
    trackAppVersion();
    
    // Scroll handler per navbar compatta
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.classList.add('scrolled');
        // Su mobile, mostra solo icone
        if (window.innerWidth <= 768) {
          header.classList.add('compact');
        }
      } else {
        header.classList.remove('scrolled');
        header.classList.remove('compact');
      }
      
      lastScroll = currentScroll;
    });
  }

  function updateAuthLink() {
    // Auth link rimosso - ora solo nel menu hamburger mobile
    // Desktop/tablet users usano menu hamburger o possono fare logout da profile page
  }
  
  function updateAuthButton(user) {
    const authBtnContainer = document.getElementById('navbarAuthBtn');
    if (!authBtnContainer) return;
    
    if (!user) {
      // Mostra pulsante "Accedi" se non loggato
      authBtnContainer.innerHTML = `
        <a href="auth.html" class="nav-link nav-desktop" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);">
          <span class="nav-icon">🔐</span>
          <span class="nav-label">Accedi</span>
        </a>
      `;
    } else {
      // Nascondi pulsante se loggato (il profile icon è già presente)
      authBtnContainer.innerHTML = '';
    }
  }

  window.addEventListener('league-ready', (event) => {
    const league = event.detail?.league;
    if (league) {
      updateLeagueBadge(league);
    } else {
      updateLeagueBadge();
    }
  });

  window.addEventListener('league-changed', (event) => {
    const leagueId = event.detail?.leagueId;
    if (leagueId) {
      updateLeagueBadge({ id: leagueId });
    } else {
      updateLeagueBadge();
    }
  });

  // Inizializza
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
