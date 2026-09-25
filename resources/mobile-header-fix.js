// Mobile Header Fix - Forza stile identico a home su tutte le pagine
// Version: 20251107
(function() {
  'use strict';
  // Caricato sia dalla pagina sia da app-init.js: il secondo avvio si ferma qui (D099)
  if (window.__FA_MOBILE_HEADER_FIX_ON) return;
  window.__FA_MOBILE_HEADER_FIX_ON = true;
  
  // Solo su mobile
  if (window.innerWidth > 768) {
    return;
  }
  
  function fixHeaderStyles() {
    const header = document.querySelector('header');
    if (!header) {
      // Retry dopo un po'
      setTimeout(fixHeaderStyles, 100);
      return;
    }
    
    // Rimuovi TUTTI gli stili inline che potrebbero interferire
    header.style.position = '';
    header.style.top = '';
    header.style.left = '';
    header.style.right = '';
    header.style.zIndex = '';
    header.style.willChange = '';
    header.style.transform = '';
    header.style.transition = '';
    header.style.margin = '';
    header.style.width = '';
    header.style.maxWidth = '';
    header.style.padding = '';
    
    // Rimuovi padding-top dal body se presente
    document.body.style.paddingTop = '';
    
    // Aggiungi classe per identificare che è stato fixato
    header.classList.add('mobile-header-fixed');
  }
  
  // Esegui subito e dopo DOM ready
  fixHeaderStyles();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixHeaderStyles);
  }
  
  // Esegui anche dopo che altri script hanno finito
  setTimeout(fixHeaderStyles, 500);
  setTimeout(fixHeaderStyles, 1000);
  
  // Monitora cambiamenti di stile e ripristina
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const header = document.querySelector('header');
          if (header && window.innerWidth <= 768) {
            // Se viene applicato position fixed, rimuovilo
            if (header.style.position === 'fixed') {
              header.style.position = '';
              header.style.top = '';
              header.style.left = '';
              header.style.right = '';
            }
          }
        }
      });
    });
    
    const header = document.querySelector('header');
    if (header) {
      observer.observe(header, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
  }
  
  // Fix anche su resize
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      fixHeaderStyles();
    }
  });
  
  console.log('✅ Mobile header fix initialized');
})();

