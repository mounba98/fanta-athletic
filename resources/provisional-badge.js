// Avviso "punti provvisori" per i giocatori (D092/D093): se una giornata è
// uscita dalla Partita live come provvisoria, lo si dice senza dettagli.
// Legge leagues/{lega}/results con stato == 'provvisorio'. Se non riesce, tace.
(function() {
  'use strict';
  let tries = 0;
  function start() {
    if (!window.auth || !window.Season) { if (++tries > 100) return; return setTimeout(start, 100); }
    window.auth.onAuthStateChanged(u => { if (u) check(); });
  }
  async function check() {
    try {
      const s = await window.Season.load();
      if (!s.leagueId) return;
      const db = window.__LEGACY_DB__ || firebase.firestore();
      const snap = await db.collection('leagues').doc(s.leagueId).collection('results').where('stato', '==', 'provvisorio').get();
      if (snap.empty || document.getElementById('provBadge')) return;
      const gs = snap.docs.map(d => d.id).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
      const until = Math.max(...snap.docs.map(d => Number(d.data().revisioneEntro) || 0));
      const el = document.createElement('div');
      el.id = 'provBadge';
      // Snello e allineato ai riquadri "avviso" della Home (D130): una riga, sfondo ambra tenue
      el.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:2px 10px;' +
        'padding:10px 14px;border-radius:16px;background:rgba(217,119,6,.14);border:1px solid rgba(217,119,6,.5);' +
        'color:var(--text);font-size:13px;line-height:1.35;';
      const when = until ? new Date(until).toLocaleString('it-IT', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      el.innerHTML = '<span>⏳ <b>Punti ' + gs.join(', ') + ' provvisori</b></span>' +
        '<span style="color:var(--muted);font-size:12px;">' + (when ? 'definitivi entro ' + when : 'in ricontrollo dagli admin') + '</span>';
      const anchor = document.getElementById('myTeamCard') || document.querySelector('header');
      if (anchor && anchor.id === 'myTeamCard') { el.style.margin = '0 0 10px'; anchor.insertAdjacentElement('beforebegin', el); }
      else { el.style.margin = '12px 16px'; if (anchor) anchor.insertAdjacentElement('afterend', el); else document.body.prepend(el); }
    } catch (e) { console.warn('[provisional-badge]', e && (e.code || e.message)); }
  }
  start();
})();
