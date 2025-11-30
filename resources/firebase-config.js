window.firebaseConfig = {
  apiKey: "AIzaSyDnQMuPvx_Gr8VjBJf_Hrx39O8w2dm67co",
  authDomain: "fanta-athletic.firebaseapp.com",
  projectId: "fanta-athletic",
  storageBucket: "fanta-athletic.firebasestorage.app",
  messagingSenderId: "845950461193",
  appId: "1:845950461193:web:04475bb0eaa2dc459a9fd8",
  measurementId: "G-289T0N4D8L"
};

window.FIREBASE_CONFIG_VERSION = 'debug-2025-11-19-01';
console.log('[firebase-config] build debug-2025-11-19-01 caricata');

(function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('⚠️ Firebase SDK non caricato prima di firebase-config.js');
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
  }

  // Rileva automaticamente se gli emulatori sono attivi (localhost)
  // Nota: Se gli emulatori non sono disponibili, l'app userà Firestore/Auth di produzione
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    // Prova a connettere agli emulatori (opzionale - se non disponibili usa produzione)
    try {
      // Connetti Firestore all'emulatore (solo se disponibile)
      // Se l'emulatore non è attivo, Firestore userà automaticamente produzione
      if (window.location.search.includes('useEmulators=true')) {
        firebase.firestore().useEmulator('localhost', 8080);
        firebase.auth().useEmulator('http://localhost:9099');
        console.log('🔧 [Firebase] Connesso agli emulatori locali (Firestore:8080, Auth:9099)');
      } else {
        console.log('ℹ️ [Firebase] Su localhost ma emulatori non forzati. Usa ?useEmulators=true nell\'URL per attivarli.');
        console.log('ℹ️ [Firebase] Connessione a Firestore/Auth di produzione.');
      }
    } catch (err) {
      console.warn('⚠️ [Firebase] Impossibile connettere agli emulatori, uso produzione:', err);
    }
  }

  const DEFAULT_LEAGUE_ID = 'fanta-athletic-legacy';
  if (!window.DEFAULT_LEAGUE_ID) {
    window.DEFAULT_LEAGUE_ID = DEFAULT_LEAGUE_ID;
  }

  const MULTI_COLLECTIONS = new Set([
    'teams',
    'players',
    'coaches',
    'rules',
    'results',
    'days',
    'deadlines',
    'matchday_temp',
    'h2h_schedule',
    'h2h_results',
    'posts',
    'matchdays',
    'matchday_summaries',
    'notifications',
    'teamInvites',
    'cups',
    'achievements',
    'trades',
    'lineups',
    'standings',
    'standings_cache',
    'rules_cache'
  ]);

  let multiLeagueModeFlag = true;
  try {
    const storedFlag = localStorage.getItem('multi_league_enabled');
    if (storedFlag === 'false') {
      multiLeagueModeFlag = false;
    }
  } catch (err) {
    console.warn('[MultiLeague] impossibile leggere flag multi_league_enabled', err);
  }

  let cachedLeagueId = null;
  let cachedLeagueData = null;

  function saveLastLeagueId(id) {
    if (!id) return;
    try {
      localStorage.setItem('last_league_id', id);
    } catch (err) {
      console.warn('[MultiLeague] impossibile salvare last_league_id', err);
    }
  }

  function getStoredLastLeagueId() {
    try {
      return localStorage.getItem('last_league_id');
    } catch (err) {
      console.warn('[MultiLeague] impossibile leggere last_league_id', err);
      return null;
    }
  }

  function setCachedLeague(league) {
    if (!league) return;
    const leagueId = league.id || league.leagueId;
    if (!leagueId) return;
    cachedLeagueData = league;
    cachedLeagueId = leagueId;
    saveLastLeagueId(leagueId);
  }

  function resolveLeagueId() {
    if (window.currentLeague && window.currentLeague.id) {
      if (!cachedLeagueId || cachedLeagueId !== window.currentLeague.id) {
        setCachedLeague(window.currentLeague);
      }
      return window.currentLeague.id;
    }

    if (cachedLeagueId) {
      return cachedLeagueId;
    }

    const storedId = getStoredLastLeagueId();
    if (storedId) {
      cachedLeagueId = storedId;
      return storedId;
    }

    if (window.DEFAULT_LEAGUE_ID) {
      cachedLeagueId = window.DEFAULT_LEAGUE_ID;
      return cachedLeagueId;
    }

    return null;
  }

  const originalFirestoreFn = firebase.firestore.bind(firebase);
  const originalFirestoreStatic = firebase.firestore;
  const proxyCache = new WeakMap();
  const rawDbInstance = originalFirestoreFn();

  function wrapFirestore(db) {
    if (!db) return db;
    if (proxyCache.has(db)) {
      return proxyCache.get(db);
    }

    const proxy = new Proxy(db, {
      get(target, prop, receiver) {
        if (prop === '__isMultiLeagueProxy') {
          return true;
        }

        if (prop === 'collection') {
          return function collectionWithLeague(path, ...rest) {
            let finalPath = path;
            if (multiLeagueModeFlag && typeof path === 'string') {
              const trimmed = path.replace(/^\/+|\/+$/g, '');
              const firstSegment = trimmed.split('/')[0];
              const alreadyScoped = trimmed.startsWith('leagues/');

              if (!alreadyScoped && MULTI_COLLECTIONS.has(firstSegment)) {
                const leagueId = resolveLeagueId();
                if (leagueId) {
                  finalPath = `leagues/${leagueId}/${trimmed}`;
                } else {
                  console.warn(`[MultiLeague] League ID non pronto per la collection "${firstSegment}" — uso percorso legacy`);
                }
              }
            }
            return target.collection.call(target, finalPath, ...rest);
          };
        }

        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return value;
      }
    });

    proxyCache.set(db, proxy);
    return proxy;
  }

  function patchedFirestore(...args) {
    const instance = originalFirestoreFn(...args);
    return wrapFirestore(instance);
  }

  Object.assign(patchedFirestore, originalFirestoreStatic);
  firebase.firestore = patchedFirestore;

  const wrappedDbInstance = wrapFirestore(rawDbInstance);
  window.__LEGACY_DB__ = rawDbInstance;
  window.db = wrappedDbInstance;

  function setupLeagueHelper() {
    if (window.LeagueHelper) {
      return window.LeagueHelper;
    }

    let multiLeagueEnabled = multiLeagueModeFlag;
    const readyCallbacks = [];
    const changeCallbacks = [];

    function getCurrentLeagueId() {
      return resolveLeagueId();
    }

    function getCurrentLeague() {
      if (window.currentLeague && window.currentLeague.id) {
        return window.currentLeague;
      }
      if (cachedLeagueData && cachedLeagueData.id === resolveLeagueId()) {
        return cachedLeagueData;
      }
      const id = resolveLeagueId();
      return id ? { id } : null;
    }

    function getLeaguePath(collection, leagueId = null) {
      const targetLeagueId = leagueId || resolveLeagueId();
      if (!multiLeagueEnabled || !targetLeagueId) {
        return collection;
      }
      const trimmed = collection.replace(/^\/+|\/+$/g, '');
      if (trimmed.startsWith('leagues/')) {
        return trimmed;
      }
      return `leagues/${targetLeagueId}/${trimmed}`;
    }

    function getLeagueCollection(collection, leagueId = null) {
      const targetDb = window.db || wrapFirestore(originalFirestoreFn());
      if (!targetDb) {
        console.warn('[LeagueHelper] Firestore non inizializzato');
        return null;
      }
      return targetDb.collection(getLeaguePath(collection, leagueId));
    }

    function getLeagueDoc(collection, docId, leagueId = null) {
      const targetDb = window.db || wrapFirestore(originalFirestoreFn());
      if (!targetDb) {
        console.warn('[LeagueHelper] Firestore non inizializzato');
        return null;
      }
      const targetLeagueId = leagueId || resolveLeagueId();
      if (!multiLeagueEnabled || !targetLeagueId) {
        return targetDb.collection(collection).doc(docId);
      }
      return targetDb.collection(`leagues/${targetLeagueId}/${collection}`).doc(docId);
    }

    function getLeagueSubcollection(collection, parentId, subcollection, leagueId = null) {
      const targetDb = window.db || wrapFirestore(originalFirestoreFn());
      if (!targetDb) {
        console.warn('[LeagueHelper] Firestore non inizializzato');
        return null;
      }
      const targetLeagueId = leagueId || resolveLeagueId();
      if (!multiLeagueEnabled || !targetLeagueId) {
        return targetDb.collection(collection).doc(parentId).collection(subcollection);
      }
      return targetDb.collection(`leagues/${targetLeagueId}/${collection}`).doc(parentId).collection(subcollection);
    }

    function ensureLeagueId(data = {}, leagueId = null) {
      const targetLeagueId = leagueId || resolveLeagueId();
      if (targetLeagueId && !data.leagueId) {
        data.leagueId = targetLeagueId;
      }
      return data;
    }

    async function migrateLegacyCollection(collection, leagueId) {
      const legacyDb = window.__LEGACY_DB__ || originalFirestoreFn();
      const targetDb = window.db || wrapFirestore(originalFirestoreFn());

      if (!legacyDb || !targetDb || !leagueId) {
        console.warn('[LeagueHelper] migrateLegacyCollection chiamata senza parametri validi');
        return 0;
      }

      try {
        const snapshot = await legacyDb.collection(collection).get();
        if (snapshot.empty) {
          console.log(`[LeagueHelper] Nessun documento da migrare in ${collection}`);
          return 0;
        }

        const batch = targetDb.batch();
        let count = 0;
        const now = firebase.firestore.Timestamp.now();

        snapshot.forEach(doc => {
          const ref = targetDb.collection(`leagues/${leagueId}/${collection}`).doc(doc.id);
          const payload = { ...doc.data(), leagueId, migratedAt: now };
          batch.set(ref, payload, { merge: true });
          count += 1;
        });

        if (count > 0) {
          await batch.commit();
          console.log(`[LeagueHelper] Migrati ${count} documenti dalla collection ${collection}`);
        }

        return count;
      } catch (error) {
        console.error(`[LeagueHelper] Errore durante la migrazione di ${collection}:`, error);
        return 0;
      }
    }

    function isLegacyMode() {
      return !multiLeagueEnabled || !resolveLeagueId();
    }

    function isMultiLeagueEnabled() {
      return multiLeagueEnabled;
    }

    function getCurrentLeagueType() {
      const league = getCurrentLeague();
      try {
        if (typeof window.getLeagueType === 'function') {
          return window.getLeagueType(league);
        }
      } catch (err) {
        console.warn('[LeagueHelper] getLeagueType globale ha generato un errore:', err);
      }
      return (league && league.leagueType) || 'sport_league';
    }

    function isRealityLeagueHelper() {
      const league = getCurrentLeague();
      try {
        if (typeof window.isRealityLeague === 'function') {
          return window.isRealityLeague(league);
        }
      } catch (err) {
        console.warn('[LeagueHelper] isRealityLeague globale ha generato un errore:', err);
      }
      const lt = (league && league.leagueType) || 'sport_league';
      return lt === 'reality_show';
    }

    function enableMultiLeague(persist = false) {
      multiLeagueEnabled = true;
      multiLeagueModeFlag = true;
      if (persist) {
        try { localStorage.setItem('multi_league_enabled', 'true'); } catch (_) {}
      }
      console.log('[LeagueHelper] Multi-league mode ENABLED');
    }

    function disableMultiLeague(persist = false) {
      multiLeagueEnabled = false;
      multiLeagueModeFlag = false;
      if (persist) {
        try { localStorage.setItem('multi_league_enabled', 'false'); } catch (_) {}
      }
      console.log('[LeagueHelper] Multi-league mode DISABLED');
    }

    function onReady(callback) {
      if (typeof callback !== 'function') return;
      const leagueId = resolveLeagueId();
      if (multiLeagueEnabled && leagueId) {
        try {
          callback({ id: leagueId, league: getCurrentLeague() });
        } catch (callbackError) {
          console.error('[LeagueHelper] Errore eseguendo callback onReady', callbackError);
        }
        return;
      }
      readyCallbacks.push(callback);
    }

    function waitForLeague(timeoutMs = 0) {
      const leagueId = resolveLeagueId();
      if (multiLeagueEnabled && leagueId) {
        return Promise.resolve({ id: leagueId, league: getCurrentLeague() });
      }

      return new Promise((resolve, reject) => {
        let timer = null;
        if (timeoutMs && timeoutMs > 0) {
          timer = setTimeout(() => {
            reject(new Error('Timeout attesa lega'));
          }, timeoutMs);
        }

        onReady(info => {
          if (timer) clearTimeout(timer);
          resolve(info);
        });
      });
    }

    function onChange(callback) {
      if (typeof callback === 'function') {
        changeCallbacks.push(callback);
      }
    }

    function notifyReady(league) {
      if (!readyCallbacks.length) return;
      const callbacks = readyCallbacks.splice(0, readyCallbacks.length);
      callbacks.forEach(cb => {
        try {
          cb({ id: resolveLeagueId(), league: league || getCurrentLeague() });
        } catch (err) {
          console.error('[LeagueHelper] Errore in callback ready', err);
        }
      });
    }

    function notifyChange(leagueInfo) {
      if (!changeCallbacks.length) return;
      changeCallbacks.forEach(cb => {
        try {
          cb(leagueInfo);
        } catch (err) {
          console.error('[LeagueHelper] Errore in callback onChange', err);
        }
      });
    }

    window.addEventListener('league-ready', event => {
      const league = event.detail?.league || null;
      if (league && league.id) {
        setCachedLeague(league);
      }
      notifyReady(league || getCurrentLeague());
      notifyChange({ id: resolveLeagueId(), league: league || getCurrentLeague() });
    });

    window.addEventListener('league-changed', event => {
      const leagueId = event.detail?.leagueId || resolveLeagueId();
      if (leagueId) {
        setCachedLeague({ id: leagueId });
      }
      notifyChange({ id: leagueId, league: getCurrentLeague() });
    });

    const initialId = resolveLeagueId();
    if (initialId && !cachedLeagueData) {
      setCachedLeague({ id: initialId });
    }

    window.LeagueHelper = {
      getCurrentLeagueId,
      getCurrentLeague,
      getCurrentLeagueType,
      isRealityLeague: isRealityLeagueHelper,
      getLeaguePath,
      getLeagueCollection,
      getLeagueDoc,
      getLeagueSubcollection,
      ensureLeagueId,
      migrateLegacyCollection,
      isLegacyMode,
      enableMultiLeague,
      disableMultiLeague,
      isMultiLeagueEnabled,
      waitForLeague,
      onReady,
      onChange
    };

    console.log('✅ League Helper inizializzato (multi-league mode)');
    return window.LeagueHelper;
  }

  window.setupLeagueHelper = setupLeagueHelper;
  setupLeagueHelper();

  if (!window.auth && firebase.auth) {
    try {
      window.auth = firebase.auth();
    } catch (err) {
      console.warn('Impossibile inizializzare auth globale', err);
    }
  }

  if (!window.storage && firebase.storage) {
    try {
      window.storage = firebase.storage();
    } catch (err) {
      console.warn('Impossibile inizializzare storage globale', err);
    }
  }
})();
