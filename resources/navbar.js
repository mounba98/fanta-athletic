// Navbar Component Unico per Fanta Athletic 2018
// Version: 2025101901 - Refactored with Admin tab and responsive fixes
(function() {
  'use strict';

  function createNavbar(currentPage, isAdmin = false) {
    const allPages = [
      { href: 'index.html', label: 'Home', icon: '🏠', desktop: true, mobile: true },
      { href: 'squadre.html', label: 'Squadre', icon: '🏆', desktop: true, mobile: false },
      { href: 'formazioni.html', label: 'Formazioni', icon: '⚽', desktop: true, mobile: true },
      { href: 'classifiche.html', label: 'Classifiche', icon: '📊', desktop: true, mobile: false },
      { href: 'statistiche.html', label: 'Statistiche', icon: '📈', desktop: true, mobile: false },
      { href: 'bacheca.html', label: 'Bacheca', icon: '💬', desktop: true, mobile: true }
    ];
    
    // Calcolo (ex Giornate) solo per admin
    if (isAdmin) {
      allPages.splice(4, 0, { href: 'matchday.html', label: 'Calcolo', icon: '🧮', desktop: true, mobile: false, isAdminOnly: true });
      allPages.push({ href: 'admin.html', label: 'Admin', icon: '🛠️', desktop: true, mobile: false, isAdmin: true });
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
    
    return navHTML;
  }

  async function initNavbar() {
    const header = document.querySelector('header');
    if (!header) return;

    // Trova la pagina corrente
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Wait for Firebase to be ready
    await new Promise(resolve => {
      if (window.firebase && firebase.auth && firebase.firestore) {
        firebase.auth().onAuthStateChanged(resolve);
      } else {
        setTimeout(() => {
          if (window.firebase && firebase.auth && firebase.firestore) {
            firebase.auth().onAuthStateChanged(resolve);
          } else {
            resolve();
          }
        }, 500);
      }
    });
    
    // Check se è admin
    let isAdmin = false;
    if (window.firebase && firebase.auth && firebase.firestore) {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const adminDoc = await firebase.firestore().collection('admins').doc(user.uid).get();
          isAdmin = adminDoc.exists;
          console.log('Admin check:', user.email, 'isAdmin:', isAdmin);
        }
      } catch (e) {
        console.error('Admin check error:', e);
        if (window.logFirebaseError) {
          window.logFirebaseError('admin_check', e, { userId: user.uid });
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
    
    // Aggiorna link auth
    updateAuthLink();
    
    // Aggiorna navbar quando cambia lo stato di autenticazione
    if (window.firebase && firebase.auth && firebase.firestore) {
      firebase.auth().onAuthStateChanged(async (user) => {
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

  // Inizializza
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
