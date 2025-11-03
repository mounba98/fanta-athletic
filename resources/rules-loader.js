/*
 * rules-loader.js
 * Centralized loader for bonus/malus rules.
 * Tries Firestore cache first (config/rules_cache.rules), then falls back to static resources/rules.json.
 */
(function (global) {
  const FIRESTORE_PATH = { collection: 'config', doc: 'rules_cache' };
  let cachedResult = null;
  let inFlightPromise = null;

  async function fetchFromFirestore() {
    try {
      if (!global.firebase || !global.firebase.firestore) return null;
      const db = global.db || global.firebase.firestore();
      if (!db || !db.collection) return null;

      const docRef = db.collection(FIRESTORE_PATH.collection).doc(FIRESTORE_PATH.doc);
      const snap = await docRef.get();
      if (!snap.exists) return null;
      const data = snap.data() || {};
      if (Array.isArray(data.rules)) {
        return { rules: normalizeRules(data.rules), source: 'firestore' };
      }
      if (data.rules && typeof data.rules === 'object') {
        const arr = Object.values(data.rules);
        if (Array.isArray(arr) && arr.length) {
          return { rules: normalizeRules(arr), source: 'firestore' };
        }
      }
      return null;
    } catch (error) {
      console.warn('[rules-loader] Firestore fetch failed:', error);
      return null;
    }
  }

  async function fetchFromJson() {
    try {
      const response = await fetch('resources/rules.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const rules = Array.isArray(data?.rules) ? data.rules : [];
      return { rules: normalizeRules(rules), source: 'json' };
    } catch (error) {
      console.error('[rules-loader] Errore lettura rules.json:', error);
      return { rules: [], source: 'error', error };
    }
  }

  function normalizeRules(rules) {
    return rules.map(rule => ({
      ...rule,
      valore: Number(rule?.valore ?? 0)
    }));
  }

  async function loadRulesInternal() {
    const fromFirestore = await fetchFromFirestore();
    if (fromFirestore && fromFirestore.rules.length) {
      return fromFirestore;
    }
    return fetchFromJson();
  }

  function loadRules() {
    if (cachedResult) {
      return Promise.resolve(cachedResult);
    }
    if (!inFlightPromise) {
      inFlightPromise = loadRulesInternal()
        .then(result => {
          cachedResult = result || { rules: [], source: 'empty' };
          inFlightPromise = null;
          return cachedResult;
        })
        .catch(error => {
          console.error('[rules-loader] errore inatteso:', error);
          inFlightPromise = null;
          cachedResult = { rules: [], source: 'error', error };
          return cachedResult;
        });
    }
    return inFlightPromise;
  }

  global.rulesLoader = {
    loadRules
  };

  global.loadRulesJSON = async function () {
    return loadRules();
  };
})(window);

