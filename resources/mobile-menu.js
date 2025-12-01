// Mobile Hamburger Menu
// Version: 2025101901 - Refactored with Admin support
(function() {
  'use strict';

  // Su mobile e tablet
  if (!window.deviceInfo || (!window.deviceInfo.isSmartphone && !window.deviceInfo.isTablet)) {
    return;
  }

  const menuItems = [
    { href: 'index.html', label: 'Dashboard', icon: '<img src="resources/icons/home.png" alt="Home" />', priority: 1 },
    { href: 'squadre.html', label: 'Squadre', icon: '<img src="resources/icons/squadre.png" alt="Squadre" />', priority: 2 },
    { href: 'formazioni.html', label: 'Formazioni', icon: '<img src="resources/icons/formazioni.png" alt="Formazioni" />', priority: 3 },
    { href: 'calendario.html', label: 'Calendario', icon: '<img src="resources/icons/calendario.png" alt="Calendario" />', priority: 4 },
    { href: 'classifiche.html', label: 'Classifiche', icon: '<img src="resources/icons/classifica.png" alt="Classifiche" />', priority: 5 },
    { href: 'matchday.html', label: 'Giornate', icon: '🎯', priority: 6 },
    { href: 'statistiche.html', label: 'Statistiche', icon: '📈', priority: 7 },
    { href: 'bacheca.html', label: 'Bacheca', icon: '<img src="resources/icons/bacheca.png" alt="Bacheca" />', priority: 8 },
    { href: 'profile.html', label: 'Profilo', icon: '👤', priority: 9 },
    { href: 'notifications.html', label: 'Notifiche', icon: '🔔', priority: 10 }
  ];

  function createHamburgerMenu() {
    // Crea hamburger button NELLA NAVBAR
    const header = document.querySelector('header');
    if (!header) {
      console.warn('Header not found for hamburger');
      return;
    }
    
    const hamburger = document.createElement('button');
    hamburger.id = 'hamburgerBtn';
    hamburger.className = 'hamburger-btn';
    hamburger.type = 'button';
    hamburger.innerHTML = '☰';
    hamburger.onclick = toggleMenu;
    
    // Inserisci hamburger come PRIMO elemento del header
    header.insertBefore(hamburger, header.firstChild);
    
    // Crea overlay
    const overlay = document.createElement('div');
    overlay.id = 'menuOverlay';
    overlay.className = 'menu-overlay';
    overlay.onclick = closeMenu;
    
    // Crea menu
    const menu = document.createElement('div');
    menu.id = 'mobileMenu';
    menu.className = 'mobile-menu';
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    menu.innerHTML = `
      <div class="mobile-menu-header">
        <h2>Menu</h2>
        <button class="close-btn" onclick="window.closeMobileMenu()">✕</button>
      </div>
      <nav class="mobile-menu-nav">
        ${menuItems.map(item => {
          const isActive = currentPage === item.href;
          return `
            <a href="${item.href}" class="mobile-menu-item ${isActive ? 'active' : ''}">
              <span class="menu-icon">${item.icon}</span>
              <span class="menu-label">${item.label}</span>
            </a>
          `;
        }).join('')}
        <div id="adminMenuSlot"></div>
        <div class="menu-separator"></div>
        <button class="mobile-menu-item" onclick="window.toggleThemeFromMenu()">
          <span class="menu-icon">🌓</span>
          <span class="menu-label" id="themeToggleLabel">Tema Scuro</span>
        </button>
        <button class="mobile-menu-item logout-btn" onclick="window.handleMobileLogout()">
          <span class="menu-icon">🚪</span>
          <span class="menu-label">Esci</span>
        </button>
      </nav>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(menu);
    updateThemeLabel();
    
    // Aggiungi link admin se necessario
    checkAdminStatus();
  }

  function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');
    const isOpen = menu.classList.contains('open');
    
    if (isOpen) {
      closeMenu();
    } else {
      menu.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');
    menu.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function checkAdminStatus() {
    if (!window.firebase || !firebase.auth) {
      // Retry after Firebase is loaded
      setTimeout(checkAdminStatus, 500);
      return;
    }
    
    firebase.auth().onAuthStateChanged(async (user) => {
      const adminSlot = document.getElementById('adminMenuSlot');
      if (!adminSlot) return;
      
      if (!user) {
        adminSlot.innerHTML = '';
        return;
      }
      
      try {
        const db = firebase.firestore();
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        
        if (adminDoc.exists) {
          const currentPage = window.location.pathname.split('/').pop() || 'index.html';
          const isActive = currentPage === 'admin.html';
          
          adminSlot.innerHTML = `
            <div class="admin-separator">
              <span>Amministrazione</span>
            </div>
            <a href="admin.html" class="mobile-menu-item mobile-menu-admin ${isActive ? 'active' : ''}">
              <span class="menu-icon">🛠️</span>
              <span class="menu-label">Admin Panel</span>
            </a>
          `;
        } else {
          adminSlot.innerHTML = '';
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        adminSlot.innerHTML = '';
      }
    });
  }

  // Funzione logout con conferma
  function handleMobileLogout() {
    if (confirm('Sei sicuro di voler uscire?')) {
      if (window.firebase && firebase.auth) {
        firebase.auth().signOut().then(() => {
          closeMenu();
          window.location.href = 'index.html';
        }).catch(err => {
          console.error('Logout error:', err);
          alert('Errore durante il logout. Riprova.');
        });
      }
    }
  }
  
  // Toggle tema dal menu
  function toggleThemeFromMenu() {
    const label = document.getElementById('themeToggleLabel');
    let isDark;

    if (typeof window.toggleTheme === 'function') {
      isDark = window.toggleTheme();
    } else {
      const html = document.documentElement;
      const nextDark = !html.classList.contains('dark');
      html.classList.toggle('dark', nextDark);
      try {
        localStorage.setItem('fantaAthletic_theme', nextDark ? 'dark' : 'light');
      } catch (_) {}
      isDark = nextDark;
    }

    if (label) {
      label.textContent = isDark ? 'Tema Chiaro' : 'Tema Scuro';
    }
  }
  
  // Update tema label on load
  function updateThemeLabel() {
    const label = document.getElementById('themeToggleLabel');
    if (label) {
      const isDark = document.documentElement.classList.contains('dark');
      label.textContent = isDark ? 'Tema Chiaro' : 'Tema Scuro';
    }
    if (typeof window.updateThemeButton === 'function') {
      window.updateThemeButton();
    }
  }

  // Esponi funzioni globali
  window.toggleMobileMenu = toggleMenu;
  window.closeMobileMenu = closeMenu;
  window.handleMobileLogout = handleMobileLogout;
  window.toggleThemeFromMenu = toggleThemeFromMenu;
  
  // Update label quando menu si apre
  const originalToggle = toggleMenu;
  toggleMenu = function() {
    originalToggle();
    setTimeout(updateThemeLabel, 50);
  };

  // Crea menu quando DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createHamburgerMenu);
  } else {
    createHamburgerMenu();
  }
})();
