// Convocati per giornata (D129): gli admin li segnano in admin-convocati.html,
// Formazioni, Squadre e Home li mostrano. Un solo documento per lega:
//   leagues/{lega}/config/convocati = { giornate: { G1: { ids: [...], at, by, byName }, ... } }
// (config: lettura ai membri della lega, scrittura agli admin — regole già esistenti)
(function () {
  'use strict';
  const db = () => window.__LEGACY_DB__ || (window.firebase && firebase.firestore());
  const ref = lid => db().collection('leagues').doc(lid).collection('config').doc('convocati');
  let cache = { lid: null, data: null, at: 0 };

  async function loadAll(lid, fresh) {
    if (!lid) return {};
    if (!fresh && cache.lid === lid && cache.data && Date.now() - cache.at < 60000) return cache.data;
    try {
      const snap = await ref(lid).get();
      const data = (snap.exists && snap.data().giornate) || {};
      cache = { lid, data, at: Date.now() };
      return data;
    } catch (e) {
      console.warn('[convocati] lettura non riuscita', e && (e.code || e.message));
      return {};
    }
  }

  // Elenco della giornata: { ids: Set, at, byName } oppure null se non pubblicato
  async function forGiornata(lid, g, fresh) {
    const all = await loadAll(lid, fresh);
    const e = all[g];
    if (!e || !Array.isArray(e.ids)) return null;
    return { ids: new Set(e.ids), at: e.at || null, byName: e.byName || '' };
  }

  async function save(lid, g, ids, user) {
    const entry = { ids: Array.from(ids), at: Date.now(), by: user ? user.uid : null,
      byName: user ? (user.displayName || (user.email || '').split('@')[0]) : '' };
    await ref(lid).set({ giornate: { [g]: entry } }, { merge: true });
    cache.lid = null;
    return entry;
  }

  async function remove(lid, g) {
    await ref(lid).update({ ['giornate.' + g]: firebase.firestore.FieldValue.delete() });
    cache.lid = null;
  }

  window.Convocati = { loadAll, forGiornata, save, remove };
})();
