/**
 * Player Photo Loader - implementazione semplificata (solo SDK, niente REST manuale)
 * Versione: 2025-11-07
 *
 * - Prova una serie di path noti in ordine (lega → globale)
 * - Memorizza localmente i path mancanti per evitare richieste ripetute
 * - Usa esclusivamente firebase.storage().ref(path).getDownloadURL()
 */

(function(){
  'use strict';

  const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
  const MISSING_PATHS_KEY = '__fa_player_photo_missing_v1';
  const MISSING_COMBOS_KEY = '__fa_player_photo_combo_v1';

  const cache = new Map();               // (league|global):playerId → URL/null
  const missingPaths = new Set();        // path singoli già risultati 404
  const missingCombos = new Set();       // chiave league:player senza foto

  restoreSet(MISSING_PATHS_KEY, missingPaths);
  restoreSet(MISSING_COMBOS_KEY, missingCombos);

  let persistPathsTimer = null;
  let persistCombosTimer = null;

  function storageRef(path){
    const storage = window.storage || (window.firebase && window.firebase.storage && window.firebase.storage());
    if (!storage) throw new Error('Firebase Storage non inizializzato');
    return storage.ref(path);
  }

  function normalizePlayerId(id){
    if (!id) return null;
    return String(id).trim().toUpperCase();
  }

  function restoreSet(key, target){
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach(val => {
          if (typeof val === 'string' && val.length) {
            target.add(val);
          }
        });
      }
    } catch (_) {
      // ignore
    }
  }

  function schedulePersist(set, key, timerRefSetter){
    if (timerRefSetter.current) return;
    timerRefSetter.current = setTimeout(() => {
      timerRefSetter.current = null;
      try {
        localStorage.setItem(key, JSON.stringify(Array.from(set)));
      } catch (_) {
        // ignore storage errors
      }
    }, 400);
  }

  const pathsTimerRef = { current: null };
  const combosTimerRef = { current: null };

  function rememberMissingPath(path){
    if (!path) return;
    if (!missingPaths.has(path)) {
      missingPaths.add(path);
      schedulePersist(missingPaths, MISSING_PATHS_KEY, pathsTimerRef);
    }
  }

  function rememberFoundPath(path){
    if (!path) return;
    if (missingPaths.delete(path)) {
      schedulePersist(missingPaths, MISSING_PATHS_KEY, pathsTimerRef);
    }
  }

  function rememberMissingCombo(key){
    if (!key) return;
    if (!missingCombos.has(key)) {
      missingCombos.add(key);
      schedulePersist(missingCombos, MISSING_COMBOS_KEY, combosTimerRef);
    }
  }

  function removeMissingCombo(key){
    if (!key) return;
    if (missingCombos.delete(key)) {
      schedulePersist(missingCombos, MISSING_COMBOS_KEY, combosTimerRef);
    }
  }

  async function tryPath(path){
    if (!path || missingPaths.has(path)) return null;
    try {
      const url = await storageRef(path).getDownloadURL();
      if (url && url.includes('token=')) {
        rememberFoundPath(path);
        return url;
      }
    } catch (error) {
      const code = error && error.code;
      if (code === 'storage/object-not-found' || code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
        rememberMissingPath(path);
        return null;
      }
      console.debug('[photo-loader] getDownloadURL fallita per', path, code || error?.message || error);
    }
    return null;
  }

  function buildCandidatePaths(playerId, leagueId, hint){
    const options = window.PLAYER_PHOTO_OPTIONS || {};
    const allowLeagueFolders = Boolean(options.enableLeagueFolders);
    const allowGlobal = options.enableGlobal !== false;

    const paths = [];
    const add = path => { if (path) paths.push(path); };

    if (hint) {
      add(hint);
    }

    const variants = Array.from(new Set([playerId, playerId.toLowerCase()]));

    if (allowLeagueFolders && leagueId) {
      variants.forEach(idVariant => {
        EXTENSIONS.forEach(ext => add(`leagues/${leagueId}/players/${idVariant}.${ext}`));
        EXTENSIONS.forEach(ext => add(`leagues/${leagueId}/players/${idVariant}/photo.${ext}`));
        EXTENSIONS.forEach(ext => add(`players/${leagueId}/${idVariant}.${ext}`));
        EXTENSIONS.forEach(ext => add(`players/${leagueId}/${idVariant}/photo.${ext}`));
      });
    }

    if (allowGlobal) {
      variants.forEach(idVariant => {
        EXTENSIONS.forEach(ext => add(`players/${idVariant}.${ext}`));
        EXTENSIONS.forEach(ext => add(`players/${idVariant}/photo.${ext}`));
      });
    }

    return paths;
  }

  async function resolvePhoto(playerId, leagueId, hint){
    const normalizedId = normalizePlayerId(playerId);
    if (!normalizedId) return null;

    const leagueKey = (leagueId && leagueId !== 'default') ? leagueId : null;
    const comboKey = `${leagueKey || 'global'}:${normalizedId}`;

    if (missingCombos.has(comboKey)) {
      return null;
    }

    const candidates = buildCandidatePaths(normalizedId, leagueKey, hint);
    for (const path of candidates) {
      const url = await tryPath(path);
      if (url) {
        removeMissingCombo(comboKey);
        return url;
      }
    }

    rememberMissingCombo(comboKey);
    return null;
  }

  async function setPlayerImg(img, playerId, leagueId = null){
    if (!img || !playerId) {
      console.warn('[player-photo-loader] setPlayerImg chiamato senza img o playerId');
      return;
    }

    if (!window.firebase || !window.firebase.storage) {
      console.warn('[player-photo-loader] Firebase Storage non disponibile');
      img.src = '/assets/player-placeholder.svg';
      return;
    }

    if (!leagueId) {
      if (window.LeagueHelper && typeof window.LeagueHelper.getCurrentLeagueId === 'function') {
        leagueId = window.LeagueHelper.getCurrentLeagueId();
      } else if (window.getCurrentLeagueId && typeof window.getCurrentLeagueId === 'function') {
        leagueId = window.getCurrentLeagueId();
      }
    }

    const hintsMap = window.__PLAYER_PHOTO_HINTS || {};
    const normalized = normalizePlayerId(playerId);
    const hint = hintsMap[playerId] || hintsMap[normalized] || hintsMap[normalized ? normalized.toLowerCase() : ''] || null;
    const url = await getPlayerPhotoURL(playerId, leagueId, hint);
    img.src = url || '/assets/player-placeholder.svg';
  }

  async function getPlayerPhotoURL(playerId, leagueId = null, hintOverride = null){
    if (!playerId) return null;

    if (!window.firebase || !window.firebase.storage) {
      console.warn('[player-photo-loader] Firebase Storage non disponibile');
      return null;
    }

    if (!leagueId) {
      if (window.LeagueHelper && typeof window.LeagueHelper.getCurrentLeagueId === 'function') {
        leagueId = window.LeagueHelper.getCurrentLeagueId();
      } else if (window.getCurrentLeagueId && typeof window.getCurrentLeagueId === 'function') {
        leagueId = window.getCurrentLeagueId();
      }
    }

    const normalizedId = normalizePlayerId(playerId);
    const hintsMap = window.__PLAYER_PHOTO_HINTS || {};
    const hint = hintOverride || hintsMap[normalizedId] || (normalizedId ? hintsMap[normalizedId.toLowerCase()] : undefined) || null;
    const leagueKey = (leagueId && leagueId !== 'default') ? leagueId : null;
    const cacheKey = `${leagueKey || 'global'}:${normalizedId}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const url = await resolvePhoto(normalizedId, leagueKey, hint);
    cache.set(cacheKey, url);
    return url;
  }

  window.setPlayerImg = setPlayerImg;
  window.getPlayerPhotoURL = getPlayerPhotoURL;

  console.log('✅ Player Photo Loader inizializzato (solo SDK, niente REST)');
})();

