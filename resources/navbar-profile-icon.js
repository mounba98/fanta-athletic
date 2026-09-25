/**
 * Navbar Profile Icon with Photo
 * Version: 2025102001
 */

(function() {
  'use strict';

  let retryCount = 0;
  const MAX_RETRIES = 50; // 5 secondi max

  const NO_TEAM_BADGE_ID = 'noTeamBadge';

  function getNoTeamBadgeHost() {
    const header = document.querySelector('header');
    if (!header) return null;
    const h1 = header.querySelector('h1');
    return h1 || header;
  }

  function updateNoTeamBadge(show) {
    const host = getNoTeamBadgeHost();
    if (!host) return;

    // Stesso avvolgimento del testo titolo usato da navbar.js (D059) —
    // qui ripetuto in modo indipendente perché questo script può
    // caricare prima o dopo navbar.js, e la funzione è idempotente.
    if (host.tagName === 'H1' && !host.querySelector('.header-title-text')) {
      if (typeof window.__wrapHeaderTitleText === 'function') {
        window.__wrapHeaderTitleText(host);
      } else {
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        const textNode = walker.nextNode();
        if (textNode && textNode.textContent.trim()) {
          const span = document.createElement('span');
          span.className = 'header-title-text';
          span.textContent = textNode.textContent;
          textNode.parentNode.replaceChild(span, textNode);
        }
      }
    }

    let badge = document.getElementById(NO_TEAM_BADGE_ID);
    if (!badge) {
      badge = document.createElement('span');
      badge.id = NO_TEAM_BADGE_ID;
      badge.textContent = 'Nessuna squadra';
      badge.title = 'Clicca per scegliere la tua squadra';
      badge.style.cssText = [
        'display:inline-flex',
        'align-items:center',
        'justify-content:center',
        'flex-shrink:0',
        'padding:3px 8px',
        'border-radius:999px',
        'background:#b91c1c',
        'color:#fff',
        'font-size:11px',
        'font-weight:600',
        'letter-spacing:0.06em',
        'text-transform:uppercase',
        'cursor:pointer'
      ].join(';');
      badge.addEventListener('click', () => {
        try {
          window.location.href = 'scegli-squadra.html';
        } catch (_) {}
      });
      host.appendChild(badge);
    }

    badge.style.display = show ? 'inline-flex' : 'none';
  }

  /**
   * Renderizza icona profilo con foto o placeholder
   */
  function renderProfileIcon() {
    const container = document.getElementById('navbarProfileIcon');
    if (!container) return;

    if (typeof firebase === 'undefined' || !firebase.auth) {
      if (retryCount >= MAX_RETRIES) {
        console.error('❌ Firebase non disponibile dopo 5s, navbar-profile-icon disabilitato');
        return;
      }
      retryCount++;
      setTimeout(renderProfileIcon, 100);
      return;
    }
    
    console.log('✅ Firebase ready, navbar-profile-icon initialized');

    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        container.innerHTML = '';
        updateNoTeamBadge(false);
        return;
      }

      try {
        // Prova a leggere foto da Firestore users/{uid}
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        const photoURL = userData.photoURL || user.photoURL || null;

        if (photoURL) {
          // Mostra foto profilo con fallback alla PNG profilo
          container.innerHTML = `
            <a href="profile.html" style="display: block; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.4); transition: all 0.2s;">
              <img src="${photoURL}" alt="Profilo" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='resources/icons/profilo.png'; this.style.objectFit='contain';">
            </a>
          `;
        } else {
          // Icona default: PNG profilo
          container.innerHTML = `
            <a href="profile.html" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); font-size: 20px; transition: all 0.2s; text-decoration: none;">
              <img src="resources/icons/profilo.png" alt="Profilo" style="width: 22px; height: 22px; object-fit: contain;" />
            </a>
          `;
        }

        // Badge "Nessuna squadra" per utenti senza team_index
        try {
          const hasTeam = typeof userData.team_index === 'number';
          console.log('[navbar] userData:', userData);
          console.log('[navbar] team_index:', userData.team_index, 'type:', typeof userData.team_index);
          console.log('[navbar] hasTeam:', hasTeam);
          updateNoTeamBadge(user && !hasTeam);
        } catch (_) {
          console.error('[navbar] Errore check team:', _);
          updateNoTeamBadge(false);
        }

        // Hover effect
        const link = container.querySelector('a');
        if (link) {
          link.addEventListener('mouseenter', () => {
            link.style.transform = 'scale(1.1)';
            link.style.borderColor = 'rgba(255,255,255,0.8)';
          });
          link.addEventListener('mouseleave', () => {
            link.style.transform = 'scale(1)';
            link.style.borderColor = 'rgba(255,255,255,0.4)';
          });
        }

      } catch (error) {
        console.error('Error loading profile photo:', error);
        // Fallback icona default
        container.innerHTML = `
          <a href="profile.html" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); font-size: 20px;">
            <img src="resources/icons/profilo.png" alt="Profilo" style="width: 22px; height: 22px; object-fit: contain;" />
          </a>
        `;
      }
    });
  }

  // Init quando navbar è pronta
  const checkNavbar = setInterval(() => {
    if (document.getElementById('navbarProfileIcon')) {
      clearInterval(checkNavbar);
      renderProfileIcon();
    }
  }, 100);

  // Timeout dopo 5 secondi
  setTimeout(() => clearInterval(checkNavbar), 5000);

})();
