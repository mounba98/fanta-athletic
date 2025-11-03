/**
 * Navbar Auto-Hide on Scroll Down, Show on Scroll Up
 * Version: 2025102002
 */

(function() {
  'use strict';

  let lastScrollY = 0;
  let ticking = false;
  let header = null;

  function init() {
    header = document.querySelector('header');
    if (!header) {
      console.warn('Header not found for scroll hide');
      return;
    }

    // Solo su mobile/tablet
    if (!window.deviceInfo || window.deviceInfo.isDesktop) {
      return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function onScroll() {
    lastScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  let previousScrollY = 0;
  
  function updateHeader() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
      // Scroll giù: nascondi
      if (currentScrollY > previousScrollY) {
        header.style.transform = 'translateY(-100%)';
      } else {
        // Scroll su: mostra
        header.style.transform = 'translateY(0)';
      }
    } else {
      // Vicino al top: sempre visibile
      header.style.transform = 'translateY(0)';
    }

    previousScrollY = currentScrollY;
    ticking = false;
  }

  // Init quando DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
