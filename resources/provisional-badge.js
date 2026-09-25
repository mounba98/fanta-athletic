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
      el.style.cssText = 'margin:12px 16px;padding:12px 16px;border-radius:14px;background:#b45309;color:#fff;font-weight:700;font-size:14px;';
      el.innerHTML = '⏳ Punti ' + gs.join(', ') + ' provvisori' +
        '<div style="font-weight:500;font-size:12px;opacity:.95;margin-top:3px;">Gli admin li stanno ricontrollando' +
        (until ? ': definitivi entro ' + new Date(until).toLocaleString('it-IT', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '') + '.</div>';
      const anchor = document.getElementById('myTeamCard') || document.querySelector('header');
      if (anchor && anchor.id === 'myTeamCard') anchor.insertAdjacentElement('beforebegin', el);
      else if (anchor) anchor.insertAdjacentElement('afterend', el); else document.body.prepend(el);
    } catch (e) { console.warn('[provisional-badge]', e && (e.code || e.message)); }
  }
  start();
})();
