// Navbar Auto-Hide on Scroll - Mobile Optimized
// Version: 2025102201
(function() {
  'use strict';

  let lastScrollTop = 0;
  let isHidden = false;
  const MOBILE_BREAKPOINT = 768;
  const SHOW_THRESHOLD = 6;

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function handleScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = Math.abs(scrollTop - lastScrollTop);
    
    // Solo su mobile e con scroll significativo (>10px)
    if (!isMobileViewport() || scrollDelta < 4) {
      lastScrollTop = scrollTop;
      return;
    }
    
    // Scroll down - hide navbar (dopo 50px)
    if (scrollTop > lastScrollTop && scrollTop > 50 && !isHidden) {
      header.style.transform = 'translateY(-100%)';
      header.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      isHidden = true;
    }
    // Scroll up - show navbar
    else if (scrollTop < lastScrollTop && isHidden && ((lastScrollTop - scrollTop) > SHOW_THRESHOLD || scrollTop < 40)) {
      header.style.transform = 'translateY(0)';
      header.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      isHidden = false;
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  // Throttle scroll event
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Ensure header is positioned correctly - SOLO su desktop, non su mobile
  const header = document.querySelector('header');
  if (header && !isMobileViewport()) {
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.zIndex = '1000';
    header.style.willChange = 'transform';
    header.style.transform = 'translateY(0)';
    header.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  }
  
  // Su mobile, rimuovi qualsiasi stile inline che potrebbe interferire
  if (header && isMobileViewport()) {
    // Rimuovi tutti gli stili inline che potrebbero interferire
    header.style.position = '';
    header.style.top = '';
    header.style.left = '';
    header.style.right = '';
    header.style.zIndex = '';
    header.style.willChange = '';
    header.style.transform = '';
    header.style.transition = '';
    // Non aggiungere padding-top al body su mobile
    document.body.style.paddingTop = '';
  }
  
  // Su resize, ricontrolla se siamo su mobile e rimuovi stili se necessario
  window.addEventListener('resize', function() {
    const nowMobile = window.innerWidth <= 768;
    if (header && nowMobile) {
      header.style.position = '';
      header.style.top = '';
      header.style.left = '';
      header.style.right = '';
      header.style.zIndex = '';
      header.style.willChange = '';
      header.style.transform = '';
      header.style.transition = '';
      document.body.style.paddingTop = '';
  }
  });
  
  console.log('✅ Navbar auto-hide initialized (mobile:', isMobileViewport() + ')');
})();
