// Stagione — parametri della stagione in corso, modificabili dagli admin
// senza codice (D086/D087). Vivono in leagues/{lega}/config/season.
// Se il documento non esiste ancora si usano i DEFAULT, che descrivono la
// stagione 2025/26 così com'è oggi nel database (nessun cambiamento di
// comportamento finché un admin non salva).
(function(root) {
  'use strict';

  const DEFAULTS = {
    id: '2025-26',
    label: '2025/26',
    stato: 'in_corso',            // preparazione | in_corso | chiusa
    numSquadre: 18,
    numGiornate: null,            // null = decide il calendario Athletic
    modalita: 'classica',         // classica | scontri | entrambe
    h2h: {
      key: '2024-25',             // cartella del calendario scontri (storica, D086)
      vittoria: 3, pareggio: 1, sconfitta: 0,
      conversione: 'soglie',      // soglie = punti → gol a fasce (stile fantacalcio) | diretta = vince chi fa più punti
      primaSoglia: 66,            // punti per il primo gol  (DA CONFERMARE con gli admin)
      ampiezza: 6,                // ogni quanti punti in più un altro gol (DA CONFERMARE)
      forfaitVincente: 3,         // come oggi in matchday.html
      forfaitPerdente: -10,
      minTitolari: 1              // sotto questo numero di titolari la formazione conta come mancante (1 = serve almeno un titolare)
    },
    contest: { punti: 10, aperturaOre: 24, chiusuraMinuti: 30 }
  };

  let cache = null;

  function merge(base, over) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(over || {}).forEach(k => {
      const v = over[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base && typeof base[k] === 'object' && base[k] !== null) out[k] = merge(base[k], v);
      else if (v !== undefined) out[k] = v;
    });
    return out;
  }

  function raw() { return root.__LEGACY_DB__ || root.firebase.firestore(); }

  function waitAuth() {
    return new Promise(resolve => {
      let n = 0;
      (function tick() {
        if (root.auth || (root.firebase && root.firebase.apps && root.firebase.apps.length)) {
          const a = root.auth || root.firebase.auth();
          const off = a.onAuthStateChanged(u => { off && off(); resolve(u); });
          return;
        }
        if (++n > 100) return resolve(null);
        setTimeout(tick, 100);
      })();
    });
  }

  async function leagueId() {
    if (root.currentLeague && root.currentLeague.id) return root.currentLeague.id;
    const user = await waitAuth();
    if (user) {
      try {
        const u = (await raw().collection('users').doc(user.uid).get()).data() || {};
        if (u.currentLeague) return u.currentLeague;
        if (Array.isArray(u.leagues) && u.leagues.length) return typeof u.leagues[0] === 'string' ? u.leagues[0] : u.leagues[0].id;
      } catch (e) { /* ignora */ }
    }
    const h = root.LeagueHelper && root.LeagueHelper.getCurrentLeagueId && root.LeagueHelper.getCurrentLeagueId();
    return h && h !== root.DEFAULT_LEAGUE_ID ? h : null;
  }

  function ref(lid) { return raw().collection('leagues').doc(lid).collection('config').doc('season'); }

  // Carica i parametri (DEFAULT + quanto salvato). saved=false se il documento non esiste.
  async function load(force) {
    if (cache && !force) return cache;
    const lid = await leagueId();
    let saved = null;
    if (lid) {
      try { const d = await ref(lid).get(); if (d.exists) saved = d.data(); } catch (e) { console.warn('[Season] lettura', e && (e.code || e.message)); }
    }
    cache = merge(DEFAULTS, saved || {});
    cache.leagueId = lid;
    cache.saved = !!saved;
    applyToContest(cache);
    return cache;
  }

  async function save(values) {
    const lid = (cache && cache.leagueId) || await leagueId();
    if (!lid) throw new Error('Lega non trovata');
    const user = root.auth ? root.auth.currentUser : null;
    const clean = JSON.parse(JSON.stringify(values));
    delete clean.leagueId; delete clean.saved;
    clean.updatedAt = root.firebase.firestore.FieldValue.serverTimestamp();
    clean.updatedBy = user ? user.uid : null;
    await ref(lid).set(clean, { merge: true });
    return load(true);
  }

  // Il mini-gioco legge i suoi numeri dalla stagione
  function applyToContest(s) {
    const CS = root.ContestScoring;
    if (CS && typeof CS.configure === 'function') CS.configure(s.contest);
  }

  // Punti della giornata → gol (stile fantacalcio): sotto la prima soglia 0 gol,
  // poi uno in più ogni "ampiezza" punti.
  function goalsFromPoints(points, h2h) {
    const p = Number(points) || 0;
    const first = Number(h2h.primaSoglia), step = Number(h2h.ampiezza);
    if (!(step > 0) || p < first) return 0;
    return 1 + Math.floor((p - first) / step);
  }

  const api = { DEFAULTS, load, save, leagueId, goalsFromPoints, merge };
  root.Season = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
