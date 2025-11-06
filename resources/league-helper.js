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

