// Swipe dal bordo sinistro verso destra → apre il menu laterale (D067, D113).
// Il telefono ha un suo gesto "torna indietro" dal bordo (Safari su iPhone,
// navigazione a gesti su Android) che ha la precedenza sul sito e non si può
// spegnere del tutto: qui si fa il massimo per vincere noi —
//  - si riconosce lo swipe anche partendo un po' dentro lo schermo (fino a 40 px);
//  - si prova a bloccare il gesto del browser già al primo tocco sul bordo
//    (solo nei primi 16 px e mai sopra pulsanti/link, es. ☰);
//  - si apre il menu dopo un movimento corto (28 px), prima che parta il gesto di sistema.
// Nell'app installata sulla schermata Home (iPhone) il gesto di Safari non esiste.
// Version: 20260925
(function() {
  'use strict';

  if (!window.deviceInfo || (!window.deviceInfo.isSmartphone && !window.deviceInfo.isTablet)) {
    return;
  }

  const EDGE_ZONE = 40;     // px dal bordo sinistro in cui può iniziare il gesto
  const BLOCK_ZONE = 16;    // px dal bordo in cui si blocca subito il gesto del browser
  const THRESHOLD = 28;     // px di spostamento orizzontale per aprire il menu
  const MAX_VERTICAL = 45;  // oltre questa tolleranza verticale è uno scroll, non uno swipe

  let startX = null, startY = null, tracking = false, triggered = false;

  const isInteractive = el => !!(el && el.closest && el.closest('a, button, input, select, textarea, label, [role="button"]'));
  const menuOpen = () => { const m = document.getElementById('mobileMenu'); return !!(m && m.classList.contains('open')); };

  document.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    if (!touch || e.touches.length > 1 || menuOpen()) { tracking = false; return; }
    if (touch.clientX <= EDGE_ZONE) {
      startX = touch.clientX; startY = touch.clientY;
      tracking = true; triggered = false;
      // tocco proprio sul bordo e non su un pulsante: si ferma subito il "torna indietro"
      if (touch.clientX <= BLOCK_ZONE && !isInteractive(e.target) && e.cancelable) e.preventDefault();
    } else {
      tracking = false;
    }
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    if (!tracking || triggered) return;
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startX;
    const deltaY = Math.abs(touch.clientY - startY);
    if (deltaY > MAX_VERTICAL && deltaY > deltaX) { tracking = false; return; }
    if (deltaX > 4 && e.cancelable) e.preventDefault();   // niente "indietro" né scorrimento laterale
    if (deltaX > THRESHOLD) {
      triggered = true; tracking = false;
      if (!menuOpen() && typeof window.toggleMobileMenu === 'function') window.toggleMobileMenu();
    }
  }, { passive: false });

  document.addEventListener('touchend', function() { tracking = false; }, { passive: true });
  document.addEventListener('touchcancel', function() { tracking = false; }, { passive: true });

  console.log('✅ Edge-swipe → menu inizializzato');
})();
