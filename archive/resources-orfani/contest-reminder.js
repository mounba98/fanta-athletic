// Card "Curva Morello vs Piana" in Home, sotto "La Mia Squadra" (D083).
// Mostra lo stato del mini-gioco: voto aperto / già votato / prossimo voto,
// più i punti delle due fazioni. Se non si può leggere il database, resta invisibile.
(function() {
  'use strict';

  let tries = 0;
  function start() {
    if (!window.auth || !window.db || !window.ContestScoring) {
      if (++tries > 100) return;
      return setTimeout(start, 100);
    }
    window.auth.onAuthStateChanged(function(user) { if (user) check(user); });
  }

  async function check(user) {
    try {
      if (window.Season) { try { await window.Season.load(); } catch (e) {} }
      const CS = window.ContestScoring;
      const now = new Date();
      const startYear = CS.seasonStartYear(now);
      const cal = await window.db.collection('athletic_calendar').get();

      let next = null;
      cal.docs.forEach(function(d) {
        const c = d.data();
        const n = parseInt(c.giornata, 10);
        const start = CS.matchStart(c, startYear);
        if (isNaN(n) || !start || c.postponed || CS.resultOf(c)) return;
        if (now >= CS.deadlineOf(start)) return;
        if (!next || start < next.start) next = { n: n, start: start, cal: c };
      });

      let state = 'none', pick = null;
      if (next) {
        if (now >= CS.opensOf(next.start)) {
          const pred = await window.db.collection('contest_predictions').doc('G' + next.n + '_' + user.uid).get();
          state = pred.exists ? 'voted' : 'open';
          if (pred.exists) pick = pred.data().pick;
        } else state = 'soon';
      }

      let pts = { curva: null, piana: null };
      try {
        const st = await window.db.collection('contest_standings').doc('current').get();
        if (st.exists) {
          pts = { curva: 0, piana: 0 };
          Object.values(st.data().users || {}).forEach(function(u) {
            if (pts[u.faction] !== undefined) pts[u.faction] += Number(u.points || 0);
          });
        }
      } catch (e) { /* classifica non ancora calcolata */ }

      show(next, state, pick, pts, CS);
    } catch (e) {
      console.warn('[contest-reminder]', e && (e.code || e.message));
    }
  }

  function show(next, state, pick, pts, CS) {
    if (document.getElementById('contestReminder')) return;
    const a = document.createElement('a');
    a.id = 'contestReminder';
    a.href = state === 'open' || state === 'voted' ? 'contest.html' : 'classifiche.html#fazioni';
    // D109: stesso stile della card "La Mia Squadra" (margini, colori, ombra) se siamo in Home
    if (document.getElementById('myTeamCard')) a.className = 'home-highlight-card';
    else a.style.cssText = 'margin:12px 0;padding:16px;border-radius:16px;' +
      'background:linear-gradient(135deg,#920100,#0c0f6d);box-shadow:0 4px 14px rgba(0,0,0,.3);';
    a.style.display = 'block'; a.style.color = '#fff'; a.style.textDecoration = 'none';
    const score = pts.curva === null ? '' :
      '<div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin:10px 0 2px;font-weight:800;font-size:22px;">' +
      '<span>' + pts.curva + '</span><span style="font-size:12px;font-weight:600;opacity:.8;">punti mini-gioco</span><span style="text-align:right;">' + pts.piana + '</span></div>';
    let line = 'Il mini-gioco parte con la prossima partita • tocca per la classifica';
    if (next) {
      const opp = esc((next.cal.homeTeam || '') + ' - ' + (next.cal.awayTeam || ''));
      if (state === 'open') {
        const hh = CS.deadlineOf(next.start).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        line = '🗳️ <b>Voto aperto: ' + opp + '</b><br>Non hai ancora votato • chiude ' + esc(hh) + ' • <u>Vota ora</u>';
      } else if (state === 'voted') {
        line = '✅ Hai votato <b>' + esc(pick) + '</b> per ' + opp + ' • tocca per modificare';
      } else {
        const hh = CS.opensOf(next.start).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        line = 'Prossima: ' + opp + ' • si vota da ' + esc(hh);
      }
    }
    // "VS" esattamente al centro anche se i due nomi hanno lunghezze diverse (D109)
    a.innerHTML = '<div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">' +
      '<span>Curva Morello</span><span style="padding:0 10px;">vs</span><span style="text-align:right;">Piana</span></div>' + score +
      '<div style="font-size:13px;opacity:.95;margin-top:8px;">' + line + '</div>';
    const anchor = document.getElementById('myTeamCard');
    if (anchor) anchor.insertAdjacentElement('afterend', a);
    else { const m = document.querySelector('main') || document.body; m.prepend(a); }
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function(c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; });
  }

  start();
})();
