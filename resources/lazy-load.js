// Lazy Loading ottimizzato per Fanta Athletic
// Version: 20251020
(function() {
  'use strict';

  // Lazy load immagini con Intersection Observer
  function initLazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback per browser senza IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }

  // Defer non-critical CSS
  function loadDeferredCSS() {
    const deferredLinks = document.querySelectorAll('link[data-defer]');
    deferredLinks.forEach(link => {
      link.rel = 'stylesheet';
      link.removeAttribute('data-defer');
    });
  }

  // Preconnect a domini esterni
  function addPreconnect() {
    const preconnectDomains = [
      'https://www.gstatic.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Prefetch pagine probabili
  function prefetchLikelyPages() {
    // Identifica la pagina corrente
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Map pagine → probabili prossime pagine
    const likelyNextPages = {
      'index.html': ['squadre.html', 'formazioni.html'],
      'squadre.html': ['formazioni.html', 'classifiche.html'],
      'formazioni.html': ['squadre.html', 'matchday.html'],
      'classifiche.html': ['statistiche.html'],
      'matchday.html': ['formazioni.html'],
      'bacheca.html': ['profile.html']
    };

    const nextPages = likelyNextPages[currentPage] || [];
    
    nextPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      link.as = 'document';
      document.head.appendChild(link);
    });
  }

  // Debounce function per ottimizzare eventi scroll/resize
  window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Throttle function per eventi ad alta frequenza
  window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Inizializza tutto quando DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLazyLoadImages();
      addPreconnect();
      
      // Defer CSS e prefetch dopo caricamento iniziale
      window.addEventListener('load', () => {
        setTimeout(() => {
          loadDeferredCSS();
          prefetchLikelyPages();
        }, 1000);
      });
    });
  } else {
    initLazyLoadImages();
    addPreconnect();
    window.addEventListener('load', () => {
      setTimeout(() => {
        loadDeferredCSS();
        prefetchLikelyPages();
      }, 1000);
    });
  }

  console.log('⚡ Lazy loading & performance optimizations initialized');
})();
