// Navbar Auto-Hide on Scroll - Mobile Optimized
// Version: 2025102201
(function() {
  'use strict';

  let lastScrollTop = 0;
  let isHidden = false;
  const isMobile = window.innerWidth <= 768;

  function handleScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = Math.abs(scrollTop - lastScrollTop);
    
    // Solo su mobile e con scroll significativo (>10px)
    if (!isMobile || scrollDelta < 10) {
      lastScrollTop = scrollTop;
      return;
    }
    
    // Scroll down - hide navbar (dopo 50px)
    if (scrollTop > lastScrollTop && scrollTop > 50 && !isHidden) {
      header.style.transform = 'translateY(-100%)';
      header.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      isHidden = true;
      console.log('📱 Navbar hidden (scroll down)');
    }
    // Scroll up - show navbar
    else if (scrollTop < lastScrollTop && isHidden) {
      header.style.transform = 'translateY(0)';
      header.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      isHidden = false;
      console.log('📱 Navbar shown (scroll up)');
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
  if (header && !isMobile) {
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
  if (header && isMobile) {
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
  
  console.log('✅ Navbar auto-hide initialized (mobile:', isMobile + ')');
})();
