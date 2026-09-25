// Bottom Navigation Bar for Mobile - Stile Fantagazzetta
// Version: 2025101802
(function() {
  'use strict';

  // Solo su mobile e tablet
  if (!window.deviceInfo || (!window.deviceInfo.isSmartphone && !window.deviceInfo.isTablet)) {
    return;
  }

  // Icone ricolorate in oro (#facc15, lo stesso del bordo "capitano"):
  // uguali in tutte le sezioni, la sezione attiva si riconosce dalla
  // scritta rossa e dallo sfondo sotto l'icona (2026-09-20).
  const navItems = [
    { id: 'dashboard', label: 'Home', iconFile: 'home', href: 'index.html' },
    { id: 'formazioni', label: 'Formazioni', iconFile: 'formazioni', href: 'formazioni.html' },
    { id: 'squadre', label: 'Squadre', iconFile: 'squadre', href: 'squadre.html' },
    { id: 'classifiche', label: 'Classifiche', iconFile: 'classifica', href: 'classifiche.html' },
    { id: 'bacheca', label: 'Bacheca', iconFile: 'bacheca', href: 'bacheca.html' }
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
      const iconSrc = `resources/icons/${item.iconFile}.png`;
      return `
        <a href="${item.href}" class="bottom-nav-item ${isActive ? 'active' : ''}" data-id="${item.id}">
          <span class="bottom-nav-icon"><img src="${iconSrc}" alt="${item.label}" /></span>
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
