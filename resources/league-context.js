// League Context Manager
// Version: 2025101901
// Gestisce la lega attiva corrente per multi-lega support

(function() {
  'use strict';
  
  window.LeagueContext = {
    /**
     * Get current active league ID from localStorage
     * @returns {string|null} League ID or null if none selected
     */
    getCurrentLeagueId() {
      return localStorage.getItem('current_league_id') || null;
    },
    
    /**
     * Set current active league ID
     * @param {string} leagueId - The league ID to set as active
     */
    setCurrentLeagueId(leagueId) {
      if (leagueId) {
        localStorage.setItem('current_league_id', leagueId);
      } else {
        localStorage.removeItem('current_league_id');
      }
    },
    
    /**
     * Get current league data from Firestore
     * @param {object} db - Firestore database instance
     * @returns {Promise<object|null>} League data or null
     */
    async getCurrentLeague(db) {
      const leagueId = this.getCurrentLeagueId();
      if (!leagueId) return null;
      
      try {
        const doc = await db.collection('leagues').doc(leagueId).get();
        if (!doc.exists) {
          console.warn('League not found:', leagueId);
          this.setCurrentLeagueId(null);
          return null;
        }
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        console.error('Error loading league:', error);
        return null;
      }
    },
    
    /**
     * Build Firestore path with league context
     * @param {string} collection - Base collection name
     * @returns {string} Full collection path with league context
     */
    getCollectionPath(collection) {
      const leagueId = this.getCurrentLeagueId();
      if (!leagueId) {
        // Fallback to root collection for backward compatibility
        return collection;
      }
      return `leagues/${leagueId}/${collection}`;
    },
    
    /**
     * Show league selector prompt if no league is selected
     * @returns {boolean} True if league is selected, false otherwise
     */
    ensureLeagueSelected() {
      const leagueId = this.getCurrentLeagueId();
      if (!leagueId) {
        if (confirm('Nessuna lega selezionata.\n\nVuoi andare alla pagina di gestione leghe?')) {
          window.location.href = 'admin-leghe.html';
        }
        return false;
      }
      return true;
    },
    
    /**
     * Get league display badge HTML
     * @param {object} league - League data object
     * @returns {string} HTML string for league badge
     */
    getLeagueBadge(league) {
      if (!league) return '';
      return `<div style="display:inline-block;background:var(--primary);color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;margin-left:8px;">
        ${league.name || 'Lega'}
      </div>`;
    },
    
    /**
     * Initialize league context warning banner
     * Shows a warning if no league is selected
     */
    initWarningBanner() {
      const leagueId = this.getCurrentLeagueId();
      if (leagueId) return;
      
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff9800;color:white;padding:12px;text-align:center;z-index:9999;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
      banner.innerHTML = `
        ⚠️ Nessuna lega selezionata. 
        <a href="admin-leghe.html" style="color:white;text-decoration:underline;margin-left:8px;">Seleziona una lega</a>
      `;
      document.body.prepend(banner);
      
      // Adjust body padding to account for banner
      document.body.style.paddingTop = '48px';
    }
  };
  
  // Auto-init warning banner on pages that need league context
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Only show banner on specific pages
      const needsLeague = ['matchday.html', 'squadre.html', 'classifiche.html', 'formazioni.html'];
      const currentPage = window.location.pathname.split('/').pop();
      if (needsLeague.includes(currentPage)) {
        window.LeagueContext.initWarningBanner();
      }
    });
  }
  
})();
