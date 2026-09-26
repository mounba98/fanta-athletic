// Swipe dal bordo sinistro verso destra → apre il menu, invece di
// "tornare indietro" come farebbe normalmente il browser (D067).
// Non sostituisce nessun altro modo di navigare (☰, barra in basso,
// link home restano sempre disponibili): questa è solo una scorciatoia
// in più, mai l'unica via.
// Version: 20260923
(function() {
  'use strict';

  if (!window.deviceInfo || (!window.deviceInfo.isSmartphone && !window.deviceInfo.isTablet)) {
    return;
  }

  const EDGE_ZONE = 24;    // px dal bordo sinistro per iniziare a riconoscere il gesto
  const THRESHOLD = 60;    // px di spostamento orizzontale per aprire il menu
  const MAX_VERTICAL = 50; // oltre questa tolleranza verticale è uno scroll, non uno swipe

  let startX = null;
  let startY = null;
  let tracking = false;
  let triggered = false;

  document.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    if (!touch) return;
    if (touch.clientX <= EDGE_ZONE) {
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
      triggered = false;
    } else {
      tracking = false;
    }
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!tracking || triggered) return;
    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - startX;
    const deltaY = Math.abs(touch.clientY - startY);

    if (deltaY > MAX_VERTICAL) {
      tracking = false;
      return;
    }

    if (deltaX > 10 && e.cancelable) {
      // Impedisce alla gesture nativa di "indietro" del browser di attivarsi
      e.preventDefault();
    }

    if (deltaX > THRESHOLD) {
      triggered = true;
      tracking = false;
      const menu = document.getElementById('mobileMenu');
      if (menu && !menu.classList.contains('open') && typeof window.toggleMobileMenu === 'function') {
        window.toggleMobileMenu();
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', function() {
    tracking = false;
  }, { passive: true });

  console.log('✅ Edge-swipe → menu inizializzato');
})();
