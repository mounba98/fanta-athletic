// Clear Old Data Script - Run once to clean localStorage
// Version: 2025102001
(function() {
  'use strict';
  
  // Clear error logs older than 24h
  function clearOldErrors() {
    try {
      const errors = JSON.parse(localStorage.getItem('fanta_errors') || '[]');
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      const recentErrors = errors.filter(e => {
        const errorTime = new Date(e.timestamp).getTime();
        return errorTime > dayAgo;
      });
      
      if (recentErrors.length === 0) {
        localStorage.removeItem('fanta_errors');
        console.log('✅ Cleared all old errors');
      } else {
        localStorage.setItem('fanta_errors', JSON.stringify(recentErrors));
        console.log(`✅ Kept ${recentErrors.length} recent errors, removed ${errors.length - recentErrors.length} old ones`);
      }
    } catch (e) {
      console.warn('Error clearing old errors:', e);
    }
  }
  
  // Clear PWA dismiss if > 7 days
  function clearPWADismiss() {
    try {
      const dismissedAt = localStorage.getItem('pwa_install_dismissed_at');
      if (dismissedAt) {
        const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSince > 7) {
          localStorage.removeItem('pwa_install_dismissed');
          localStorage.removeItem('pwa_install_dismissed_at');
          console.log('✅ Cleared old PWA dismiss');
        }
      }
    } catch (e) {
      console.warn('Error clearing PWA dismiss:', e);
    }
  }
  
  // Force clear specific old errors (manual cleanup)
  function forceCleanSpecificErrors() {
    try {
      const errors = JSON.parse(localStorage.getItem('fanta_errors') || '[]');
      
      // Remove errors from Oct 19
      const filtered = errors.filter(e => {
        const errorDate = new Date(e.timestamp);
        return errorDate.getDate() !== 19 || errorDate.getMonth() !== 9; // Oct = 9
      });
      
      if (filtered.length < errors.length) {
        localStorage.setItem('fanta_errors', JSON.stringify(filtered));
        console.log(`✅ Force cleaned ${errors.length - filtered.length} old errors`);
      }
    } catch (e) {
      console.warn('Error force cleaning:', e);
    }
  }
  
  // Run cleanup on page load
  console.group('🧹 Cleaning Old Data...');
  clearOldErrors();
  clearPWADismiss();
  forceCleanSpecificErrors();
  console.groupEnd();
  
})();
