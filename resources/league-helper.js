/**
 * League Helper - wrapper legacy per compatibilità.
 * L'implementazione reale vive in firebase-config.js (setupLeagueHelper).
 */

(function bootstrapLeagueHelperFallback() {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.setupLeagueHelper === 'function') {
    window.setupLeagueHelper();
    return;
  }

  // Fallback minimale in caso firebase-config non sia stato caricato.
  if (!window.LeagueHelper) {
    console.warn('[LeagueHelper] setupLeagueHelper non trovato. Carica resources/firebase-config.js prima di questo file.');
    window.LeagueHelper = {
      getCurrentLeagueId() {
        return window.currentLeague?.id || null;
      },
      getLeaguePath(collection) {
        return collection;
      },
      ensureLeagueId(data) {
        return data;
      },
      getLeagueCollection(collection) {
        return (window.db || firebase.firestore()).collection(collection);
      },
      getLeagueDoc(collection, docId) {
        return (window.db || firebase.firestore()).collection(collection).doc(docId);
      },
      getLeagueSubcollection(collection, parentId, subcollection) {
        return (window.db || firebase.firestore()).collection(collection).doc(parentId).collection(subcollection);
      },
      isLegacyMode() {
        return true;
      },
      migrateLegacyCollection() {
        console.warn('[LeagueHelper] migrateLegacyCollection non disponibile senza setupLeagueHelper');
        return Promise.resolve(0);
      },
      enableMultiLeague() {
        console.warn('[LeagueHelper] enableMultiLeague non disponibile senza setupLeagueHelper');
      },
      disableMultiLeague() {
        console.warn('[LeagueHelper] disableMultiLeague non disponibile senza setupLeagueHelper');
      },
      isMultiLeagueEnabled() {
        return false;
      },
      waitForLeague() {
        return Promise.resolve({ id: null, league: null });
      },
      onReady() {},
      onChange() {}
    };
  }
})();

/**
 * getCurrentLeagueIdCached / getCurrentLeagueId / ensureLeagueReady
 *
 * Prima erano ridefinite (identiche) in classifiche.html, matchday.html,
 * squadre.html, formazioni.html e lineup-summary.html. Centralizzate qui
 * il 2026-09-19 senza cambiare la logica: stesso comportamento, un solo
 * posto da aggiornare in futuro. Ogni pagina deve caricare questo file
 * DOPO resources/firebase-config.js.
 */
if (typeof window !== 'undefined') {
  if (typeof window.getCurrentLeagueIdCached !== 'function') {
    window.getCurrentLeagueIdCached = function getCurrentLeagueIdCached() {
      if (window.LeagueHelper && typeof window.LeagueHelper.getCurrentLeagueId === 'function') {
        const id = window.LeagueHelper.getCurrentLeagueId();
        if (id) return id;
      }
      if (window.currentLeague && window.currentLeague.id) {
        return window.currentLeague.id;
      }
      return null;
    };
  }

  if (typeof window.getCurrentLeagueId !== 'function') {
    // Compatibilità con codice esistente che usa getCurrentLeagueId()
    window.getCurrentLeagueId = function getCurrentLeagueId() {
      return window.getCurrentLeagueIdCached();
    };
  }

  if (typeof window.ensureLeagueReady !== 'function') {
    window.ensureLeagueReady = async function ensureLeagueReady(timeoutMs = 7000) {
      if (window.LeagueHelper && typeof window.LeagueHelper.waitForLeague === 'function') {
        try {
          const info = await window.LeagueHelper.waitForLeague(timeoutMs);
          if (info && info.id) {
            return info.id;
          }
        } catch (err) {
          console.warn('[league-helper] Timeout attesa lega:', err?.message || err);
        }
      }
      return window.getCurrentLeagueIdCached();
    };
  }
}

