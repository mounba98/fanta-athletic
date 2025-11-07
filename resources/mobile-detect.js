// Mobile Device Detection & Responsive Utilities
// Version: 2025101802 - Supporto DevTools mobile view
(function() {
  'use strict';

  // Detect device type
  const userAgent = navigator.userAgent;
  const viewportWidth = window.innerWidth;
  
  // Rileva mobile basandosi su userAgent OPPURE larghezza viewport (per DevTools)
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isMobileViewport = viewportWidth < 768; // Se viewport < 768px, considera mobile
  const isMobile = isMobileUA || isMobileViewport;
  
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Migliore detection tablet (include landscape)
  const isTablet = (
    (/iPad/i.test(userAgent)) || 
    (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) ||
    (hasTouch && viewportWidth >= 600 && viewportWidth <= 1366) ||
    (!isMobileUA && viewportWidth >= 600 && viewportWidth < 1024) // Tablet in DevTools
  );
  
  const isSmartphone = (isMobile && !isTablet && viewportWidth < 768) || (!isMobileUA && viewportWidth < 600);
  
  const orientation = window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait';
  
  // Store in global object
  window.deviceInfo = {
    isMobile: isMobile,
    isTablet: isTablet,
    isSmartphone: isSmartphone,
    isDesktop: !isMobile && !isTablet,
    hasTouch: hasTouch,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: orientation
  };

  // Add CSS classes to body
  document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    
    if (window.deviceInfo.isSmartphone) {
      body.classList.add('device-smartphone');
    } else if (window.deviceInfo.isTablet) {
      body.classList.add('device-tablet');
    } else {
      body.classList.add('device-desktop');
    }
    
    body.classList.add(`orientation-${window.deviceInfo.orientation}`);
    
    // Update on resize/orientation change
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
  });

  function updateDeviceInfo() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newOrientation = newWidth > newHeight ? 'landscape' : 'portrait';
    const userAgent = navigator.userAgent;
    
    // Ricalcola device type basandosi su viewport (per DevTools)
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isMobileViewport = newWidth < 768;
    const isMobileNow = isMobileUA || isMobileViewport;
    
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isTabletNow = (
      (/iPad/i.test(userAgent)) || 
      (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) ||
      (hasTouch && newWidth >= 600 && newWidth <= 1366) ||
      (!isMobileUA && newWidth >= 600 && newWidth < 1024) // Tablet in DevTools
    );
    
    const isSmartphoneNow = (isMobileNow && !isTabletNow && newWidth < 768) || (!isMobileUA && newWidth < 600);
    
    // Update deviceInfo
    window.deviceInfo.isMobile = isMobileNow;
    window.deviceInfo.isTablet = isTabletNow;
    window.deviceInfo.isSmartphone = isSmartphoneNow;
    window.deviceInfo.isDesktop = !isMobileNow && !isTabletNow;
    window.deviceInfo.screenWidth = newWidth;
    window.deviceInfo.screenHeight = newHeight;
    window.deviceInfo.orientation = newOrientation;
    
    // Update body classes
    const body = document.body;
    body.classList.remove('orientation-landscape', 'orientation-portrait');
    body.classList.add(`orientation-${newOrientation}`);
    
    // Update device class
    body.classList.remove('device-smartphone', 'device-tablet', 'device-desktop');
    if (isSmartphoneNow) {
      body.classList.add('device-smartphone');
    } else if (isTabletNow) {
      body.classList.add('device-tablet');
    } else {
      body.classList.add('device-desktop');
    }
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('deviceInfoUpdated', { detail: window.deviceInfo }));
  }

  // Utility: Check if viewport matches breakpoint
  window.matchesBreakpoint = function(breakpoint) {
    const breakpoints = {
      'xs': 0,
      'sm': 480,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1600
    };
    return window.innerWidth >= (breakpoints[breakpoint] || 0);
  };

  // Utility: Get current breakpoint
  window.getCurrentBreakpoint = function() {
    const w = window.innerWidth;
    if (w < 480) return 'xs';
    if (w < 768) return 'sm';
    if (w < 1024) return 'md';
    if (w < 1280) return 'lg';
    if (w < 1600) return 'xl';
    return 'xxl';
  };

  // Log device info
  console.log('Device Info:', window.deviceInfo);
})();
