(function (global) {
  const FIRESTORE_PATH = { collection: 'config', doc: 'feature_flags' };
  const LOCAL_OVERRIDE_PREFIX = 'featureFlagOverride:';
  const DEFAULT_FLAGS = {
    formation_bonus_enabled: false,
    formation_bonus_value: 5
  };

  let cache = null;
  let inFlight = null;

  function mergeFlags(base, extra) {
    return Object.assign({}, base || {}, extra || {});
  }

  function normalizeBoolean(value, fallback = true) {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase();
      if (['false', '0', 'off', 'disabled', 'no'].includes(lowered)) return false;
      if (['true', '1', 'on', 'enabled', 'si', 'sì', 'yes'].includes(lowered)) return true;
    }
    return Boolean(value);
  }

  function parseNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function readOverrides(remoteFlags) {
    const overrides = {};
    if (!global.localStorage) return overrides;

    Object.keys(remoteFlags || DEFAULT_FLAGS).forEach((key) => {
      try {
        const stored = localStorage.getItem(LOCAL_OVERRIDE_PREFIX + key);
        if (stored !== null) {
          overrides[key] = stored;
        }
      } catch (error) {
        console.warn('[feature-flags] Impossibile leggere override locale per', key, error);
      }
    });

    return overrides;
  }

  async function fetchRemoteFlags() {
    try {
      if (!global.firebase || !global.firebase.firestore) {
        return {};
      }
      const db = global.db || global.firebase.firestore();
      if (!db || !db.collection) return {};
      const snap = await db.collection(FIRESTORE_PATH.collection).doc(FIRESTORE_PATH.doc).get();
      if (!snap.exists) return {};
      const data = snap.data() || {};
      return data.flags || data || {};
    } catch (error) {
      console.warn('[feature-flags] Lettura Firestore fallita:', error);
      return {};
    }
  }

  async function loadFlagsInternal() {
    const remote = await fetchRemoteFlags();
    const overrides = readOverrides(remote);
    const merged = mergeFlags(DEFAULT_FLAGS, mergeFlags(remote, overrides));

    const normalized = Object.assign({}, merged, {
      formation_bonus_enabled: normalizeBoolean(merged.formation_bonus_enabled, DEFAULT_FLAGS.formation_bonus_enabled),
      formation_bonus_value: parseNumber(merged.formation_bonus_value, DEFAULT_FLAGS.formation_bonus_value)
    });

    return normalized;
  }

  function getCachedFlags() {
    return cache || DEFAULT_FLAGS;
  }

  function getFlag(key, fallback) {
    const flags = getCachedFlags();
    if (flags && Object.prototype.hasOwnProperty.call(flags, key)) {
      return flags[key];
    }
    return fallback;
  }

  function isEnabled(key, fallback = true) {
    if (!cache) return fallback;
    return normalizeBoolean(cache[key], fallback);
  }

  function setOverride(key, value) {
    if (!global.localStorage) return;
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(LOCAL_OVERRIDE_PREFIX + key);
      } else {
        localStorage.setItem(LOCAL_OVERRIDE_PREFIX + key, String(value));
      }
      cache = null;
    } catch (error) {
      console.warn('[feature-flags] Impossibile memorizzare override per', key, error);
    }
  }

  async function loadFlags() {
    if (cache) {
      return cache;
    }
    if (!inFlight) {
      inFlight = loadFlagsInternal()
        .then((flags) => {
          cache = flags;
          inFlight = null;
          return cache;
        })
        .catch((error) => {
          console.error('[feature-flags] Errore inatteso:', error);
          cache = DEFAULT_FLAGS;
          inFlight = null;
          return cache;
        });
    }
    return inFlight;
  }

  global.featureFlagsLoader = {
    loadFlags,
    getFlag,
    isEnabled,
    setOverride
  };

  global.getFeatureFlag = function (key, fallback) {
    return getFlag(key, fallback);
  };
})(window);


