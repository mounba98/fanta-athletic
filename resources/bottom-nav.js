// Bottom Navigation Bar for Mobile - Stile Fantagazzetta
// Version: 2025101802
(function() {
  'use strict';

  // Solo su mobile e tablet
  if (!window.deviceInfo || (!window.deviceInfo.isSmartphone && !window.deviceInfo.isTablet)) {
    return;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠', href: 'index.html' },
    { id: 'formazioni', label: 'Formazioni', icon: '⚽', href: 'formazioni.html' },
    { id: 'squadre', label: 'Squadre', icon: '🏆', href: 'squadre.html' },
    { id: 'classifiche', label: 'Classifiche', icon: '📊', href: 'classifiche.html' },
    { id: 'bacheca', label: 'Bacheca', icon: '💬', href: 'bacheca.html' }
  ];

  function createBottomNav() {
    // Rimuovi bottom nav esistente se presente
    const existingNav = document.getElementById('bottomNav');
    if (existingNav) {
      existingNav.remove();
    }

    // Su tablet, non creare bottom nav - usa navbar compatta
    if (window.deviceInfo.isTablet) {
      return;
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.className = 'bottom-nav';
    
    nav.innerHTML = navItems.map(item => {
      const isActive = currentPage === item.href;
      return `
        <a href="${item.href}" class="bottom-nav-item ${isActive ? 'active' : ''}" data-id="${item.id}">
          <span class="bottom-nav-icon">${item.icon}</span>
          <span class="bottom-nav-label">${item.label}</span>
        </a>
      `;
    }).join('');
    
    document.body.appendChild(nav);
    
    // Aggiungi padding al body per non coprire il contenuto
    document.body.style.paddingBottom = '70px';
    
    console.log('Bottom nav created on:', currentPage);
  }

  // Crea navbar quando DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBottomNav);
  } else {
    createBottomNav();
  }
})();
