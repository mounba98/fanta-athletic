// Competizioni della stagione (D112/D113) — Lega → Stagione → Competizioni → Giornate
// (docs/GLOSSARIO_LEGHE.md). Sa quali competizioni sono accese e quale ha scelto
// l'utente (ricordata su questo dispositivo, per lega). La competizione scelta
// "guida" Classifiche e Calendario, come nelle app di fantacalcio.
//  - Campionato:      acceso se la modalità della stagione è "classica" o "entrambe"
//  - Scontri diretti: acceso se la modalità è "scontri" o "entrambe"
//  - Coppa:           accesa se leagues/{lega}.settings.cupSystem.enabled
(function(root) {
  'use strict';

  const ALL = [
    { id: 'campionato', label: 'Campionato', desc: 'Classifica a punti', page: 'classifiche.html#squadre' },
    { id: 'scontri', label: 'Scontri diretti', desc: 'Una sfida a giornata', page: 'classifiche.html#h2h' },
    { id: 'coppa', label: 'Coppa', desc: 'Eliminazione diretta', page: 'calendario.html#coppa' }
  ];
  const KEY = lid => 'fa_competizione_' + lid;
  const raw = () => root.__LEGACY_DB__ || root.firebase.firestore();
  const cache = {};

  function leagueId() {
    try {
      if (root.LeagueHelper && typeof root.LeagueHelper.getCurrentLeagueId === 'function') {
        const id = root.LeagueHelper.getCurrentLeagueId();
        if (id) return id;
      }
    } catch (e) {}
    if (root.currentLeague && root.currentLeague.id) return root.currentLeague.id;
    try { return localStorage.getItem('last_league_id'); } catch (e) { return null; }
  }

  // Competizioni accese nella stagione in corso della lega
  async function active(lid) {
    lid = lid || leagueId();
    if (!lid) return [ALL[0]];
    if (cache[lid]) return cache[lid];
    let modalita = 'classica', cup = false, label = '';
    try {
      const L = raw().collection('leagues').doc(lid);
      const [cfg, lg] = await Promise.all([L.collection('config').doc('season').get(), L.get()]);
      if (cfg.exists) { modalita = cfg.data().modalita || 'classica'; label = cfg.data().label || ''; }
      if (lg.exists) {
        const s = lg.data().settings || {};
        cup = !!(s.cupSystem && s.cupSystem.enabled);
        if (!label) label = lg.data().season || '';
      }
    } catch (e) { /* senza permessi o offline: solo il Campionato */ }
    const on = {
      campionato: modalita !== 'scontri',
      scontri: modalita === 'scontri' || modalita === 'entrambe',
      coppa: cup
    };
    const list = ALL.filter(c => on[c.id]);
    const out = list.length ? list : [ALL[0]];
    out.seasonLabel = label;
    return (cache[lid] = out);
  }

  // Competizione scelta (valida tra quelle accese), altrimenti la prima accesa
  async function current(lid) {
    lid = lid || leagueId();
    const list = await active(lid);
    let saved = null;
    try { saved = localStorage.getItem(KEY(lid)); } catch (e) {}
    return list.find(c => c.id === saved) || list[0];
  }

  function choose(lid, id) {
    lid = lid || leagueId();
    try { localStorage.setItem(KEY(lid), id); } catch (e) {}
    try { root.dispatchEvent(new CustomEvent('competition-changed', { detail: { leagueId: lid, id } })); } catch (e) {}
  }

  const api = { ALL, active, current, choose, leagueId };
  root.Competitions = api;
})(typeof window !== 'undefined' ? window : globalThis);
