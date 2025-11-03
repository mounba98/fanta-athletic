/**
 * League Helper Functions
 * Utility functions for multi-league support
 */

(function() {
  'use strict';

  let multiLeagueEnabled = false;

  try {
    const stored = localStorage.getItem('multi_league_enabled');
    if (stored === 'true') multiLeagueEnabled = true;
  } catch (err) {
    console.warn('[LeagueHelper] Unable to read multi_league_enabled flag:', err);
  }

  function shouldUseMultiLeague(leagueId) {
    return multiLeagueEnabled && !!leagueId;
  }

  /**
   * Get current league ID
   * @returns {string|null} Current league ID or null
   */
  function getCurrentLeagueId() {
    if (window.currentLeague && window.currentLeague.id) {
      return window.currentLeague.id;
    }
    const stored = localStorage.getItem('last_league_id');
    if (stored) return stored;
    return null;
  }

  /**
   * Get league path for a collection
   * @param {string} collection - Collection name (e.g., 'teams', 'players')
   * @param {string|null} leagueId - Optional league ID, defaults to current
   * @returns {string} Firestore path
   */
  function getLeaguePath(collection, leagueId = null) {
    const lid = leagueId || getCurrentLeagueId();
    if (!shouldUseMultiLeague(lid)) {
      if (!lid) {
        console.warn('[LeagueHelper] No league ID, using legacy path');
      }
      return collection;
    }
    return `leagues/${lid}/${collection}`;
  }

  /**
   * Ensure leagueId is present in data object
   * @param {object} data - Data object
   * @param {string|null} leagueId - Optional league ID
   * @returns {object} Data with leagueId
   */
  function ensureLeagueId(data, leagueId = null) {
    const lid = leagueId || getCurrentLeagueId();
    if (lid && !data.leagueId) {
      data.leagueId = lid;
    }
    return data;
  }

  /**
   * Get Firestore collection reference for league
   * @param {string} collection - Collection name
   * @param {string|null} leagueId - Optional league ID
   * @returns {FirebaseFirestore.CollectionReference|null}
   */
  function getLeagueCollection(collection, leagueId = null) {
    if (!window.db) {
      console.warn('[LeagueHelper] Firestore not initialized');
      return null;
    }
    const path = getLeaguePath(collection, leagueId);
    return window.db.collection(path);
  }

  /**
   * Get Firestore document reference for league
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {string|null} leagueId - Optional league ID
   * @returns {FirebaseFirestore.DocumentReference|null}
   */
  function getLeagueDoc(collection, docId, leagueId = null) {
    if (!window.db) {
      console.warn('[LeagueHelper] Firestore not initialized');
      return null;
    }
    const lid = leagueId || getCurrentLeagueId();
    if (!shouldUseMultiLeague(lid)) {
      return window.db.collection(collection).doc(docId);
    }
    return window.db.collection(`leagues/${lid}/${collection}`).doc(docId);
  }

  /**
   * Get Firestore subcollection reference
   * @param {string} collection - Parent collection
   * @param {string} parentId - Parent document ID
   * @param {string} subcollection - Subcollection name
   * @param {string|null} leagueId - Optional league ID
   * @returns {FirebaseFirestore.CollectionReference|null}
   */
  function getLeagueSubcollection(collection, parentId, subcollection, leagueId = null) {
    if (!window.db) {
      console.warn('[LeagueHelper] Firestore not initialized');
      return null;
    }
    const lid = leagueId || getCurrentLeagueId();
    if (!shouldUseMultiLeague(lid)) {
      return window.db.collection(collection).doc(parentId).collection(subcollection);
    }
    return window.db.collection(`leagues/${lid}/${collection}`).doc(parentId).collection(subcollection);
  }

  /**
   * Check if using legacy paths (no leagueId)
   * @returns {boolean}
   */
  function isLegacyMode() {
    return !shouldUseMultiLeague(getCurrentLeagueId());
  }

  /**
   * Migrate legacy data to league structure
   * @param {string} collection - Collection name
   * @param {string} leagueId - Target league ID
   * @returns {Promise<number>} Number of migrated documents
   */
  async function migrateLegacyCollection(collection, leagueId) {
    if (!window.db || !leagueId) {
      console.warn('[LeagueHelper] Cannot migrate: missing db or leagueId');
      return 0;
    }

    try {
      const legacyRef = window.db.collection(collection);
      const snapshot = await legacyRef.get();
      
      if (snapshot.empty) {
        console.log(`[LeagueHelper] No documents to migrate in ${collection}`);
        return 0;
      }

      const batch = window.db.batch();
      let count = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        data.leagueId = leagueId;
        
        const newRef = window.db.collection(`leagues/${leagueId}/${collection}`).doc(doc.id);
        batch.set(newRef, data);
        count++;
      }

      if (count > 0) {
        await batch.commit();
        console.log(`[LeagueHelper] Migrated ${count} documents from ${collection} to league ${leagueId}`);
      }

      return count;
    } catch (error) {
      console.error(`[LeagueHelper] Migration error for ${collection}:`, error);
      return 0;
    }
  }

  // Expose functions globally
  function enableMultiLeague(persist = false) {
    multiLeagueEnabled = true;
    if (persist) {
      try { localStorage.setItem('multi_league_enabled', 'true'); } catch {}
    }
    console.log('[LeagueHelper] Multi-league mode ENABLED');
  }

  function disableMultiLeague(persist = false) {
    multiLeagueEnabled = false;
    if (persist) {
      try { localStorage.setItem('multi_league_enabled', 'false'); } catch {}
    }
    console.log('[LeagueHelper] Multi-league mode DISABLED');
  }

  function isMultiLeagueEnabled() {
    return multiLeagueEnabled;
  }

  window.LeagueHelper = {
    getCurrentLeagueId,
    getLeaguePath,
    ensureLeagueId,
    getLeagueCollection,
    getLeagueDoc,
    getLeagueSubcollection,
    isLegacyMode,
    migrateLegacyCollection,
    enableMultiLeague,
    disableMultiLeague,
    isMultiLeagueEnabled
  };

  console.log('✅ League Helper loaded');
})();

