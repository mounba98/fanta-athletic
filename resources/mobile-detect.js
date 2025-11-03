// Mobile Device Detection & Responsive Utilities
// Version: 2025101801
(function() {
  'use strict';

  // Detect device type
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Migliore detection tablet (include landscape)
  const isTablet = (
    (/iPad/i.test(userAgent)) || 
    (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) ||
    (hasTouch && window.innerWidth >= 600 && window.innerWidth <= 1366)
  );
  
  const isSmartphone = isMobile && !isTablet && window.innerWidth < 768;
  
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
    
    // Ricontrolla se è tablet
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isTabletNow = (
      (/iPad/i.test(navigator.userAgent)) || 
      (/Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent)) ||
      (hasTouch && newWidth >= 600 && newWidth <= 1366)
    );
    
    window.deviceInfo.isTablet = isTabletNow;
    window.deviceInfo.screenWidth = newWidth;
    window.deviceInfo.screenHeight = newHeight;
    window.deviceInfo.orientation = newOrientation;
    
    // Update body classes
    const body = document.body;
    body.classList.remove('orientation-landscape', 'orientation-portrait');
    body.classList.add(`orientation-${newOrientation}`);
    
    // Update device class
    body.classList.remove('device-smartphone', 'device-tablet', 'device-desktop');
    if (window.deviceInfo.isSmartphone) {
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
