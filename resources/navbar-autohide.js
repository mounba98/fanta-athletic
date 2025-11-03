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

  // Ensure header is positioned correctly
  const header = document.querySelector('header');
  if (header) {
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.zIndex = '1000';
    header.style.willChange = 'transform';
    header.style.transform = 'translateY(0)';
    header.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  }
  
  // Add padding to body to compensate for fixed header
  if (header && isMobile) {
    const headerHeight = header.offsetHeight;
    document.body.style.paddingTop = headerHeight + 'px';
  }
  
  console.log('✅ Navbar auto-hide initialized (mobile:', isMobile + ')');
})();
