// Promemoria "Salva giornata" per gli admin (D132): se la Partita live ha pubblicato
// punti provvisori o definitivi ma il Calcolo giornata non li ha ancora salvati
// (live.calcolato !== live.stato), compare un pop-up con il pulsante che porta lì.
// Nella G2 l'admin si era fermato dopo "Pubblica provvisori": nessun punto calcolato.
// Usato in Home e Partita live; il Calcolo giornata ha un pop-up suo. Se non riesce, tace.
// D135: anche la partita FINITA ma mai pubblicata (live "aperta" con risultato salvato o
// iniziata da più di 3 ore): nella G3 il risultato era salvato ma nessuno aveva premuto
// "Pubblica punti provvisori", e questo pop-up taceva perché guardava solo le pubblicate.
(function() {
  'use strict';
  let tries = 0;
  function start() {
    if (!window.auth || !window.Season) { if (++tries > 100) return; return setTimeout(start, 100); }
    window.auth.onAuthStateChanged(u => { if (u) check(u); });
  }
  async function check(user) {
    try {
      const db = window.__LEGACY_DB__ || firebase.firestore();
      const admin = await db.collection('admins').doc(user.uid).get().catch(() => null);
      if (!admin || !admin.exists) return;
      const s = await window.Season.load();
      if (!s.leagueId) return;
      const snap = await db.collection('leagues').doc(s.leagueId).collection('live').where('stato', 'in', ['provvisorio', 'definitivo']).get();
      let todo = snap.docs.map(d => Object.assign({ id: d.id }, d.data()))
        .filter(x => x.calcolato !== x.stato);
      // partite finite e mai pubblicate (D135); nella Partita live no: lì c'è già il pulsante
      if (!/live\.html/.test(location.pathname)) todo = todo.concat(await finishedOpen(db, s.leagueId));
      todo.sort((a, b) => parseInt(a.id.slice(1), 10) - parseInt(b.id.slice(1), 10));
      if (!todo.length) return;
      const g = todo[0];
      const key = 'salvaGiornataVisto_' + g.id + '_' + g.stato;
      try { if (sessionStorage.getItem(key)) return; } catch (e) {}
      show(g, key);
    } catch (e) { console.warn('[salva-giornata]', e && (e.code || e.message)); }
  }
  async function finishedOpen(db, leagueId) {
    const CS = window.ContestScoring;
    const open = await db.collection('leagues').doc(leagueId).collection('live').where('stato', '==', 'aperta').get();
    if (open.empty) return [];
    const cal = (await db.collection('athletic_calendar').get()).docs.map(d => d.data());
    const y = CS && CS.seasonStartYear ? CS.seasonStartYear(new Date()) : null;
    return open.docs.map(d => Object.assign({ id: d.id }, d.data())).filter(x => {
      const m = cal.find(c => parseInt(c.giornata, 10) === parseInt(x.id.slice(1), 10) && !c.postponed);
      if (!m) return false;
      const scored = typeof m.homeScore === 'number' && typeof m.awayScore === 'number';
      const start = CS && CS.matchStart && y !== null ? CS.matchStart(m, y) : null;
      return scored || (start && Date.now() - start.getTime() > 3 * 3600000);
    }).map(x => Object.assign(x, { stato: 'aperta' }));
  }
  function show(g, key) {
    if (document.getElementById('sgRemind')) return;
    // Mai sopra la finestra delle Novità: si aspetta che venga chiusa
    if (document.querySelector('.fa-news-veil')) return setTimeout(() => show(g, key), 700);
    const num = g.id.replace(/\D/g, '');
    const tipo = g.stato === 'definitivo' ? 'definitivi' : 'provvisori';
    const mai = g.stato === 'aperta';
    const ov = document.createElement('div');
    ov.id = 'sgRemind';
    ov.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML = '<div role="dialog" aria-modal="true" aria-labelledby="sgTitle" style="background:var(--card,#fff);color:var(--text,#111);' +
      'border-radius:20px;max-width:380px;width:100%;padding:22px 20px;box-shadow:0 20px 50px rgba(0,0,0,.35);text-align:center;font-family:inherit;">' +
      '<div style="font-size:34px;line-height:1;">💾</div>' +
      (mai
        ? '<h3 id="sgTitle" style="margin:10px 0 6px;font-size:20px;">Punti da pubblicare</h3>' +
          '<p style="margin:0 0 16px;font-size:14px;line-height:1.45;color:var(--muted,#555);">La partita della <b>Giornata ' + num + '</b> è finita, ' +
          'ma i punti <b>non sono ancora pubblicati</b>: i giocatori non vedono classifica e sfide. Apri la Partita live e premi <b>Pubblica punti provvisori</b>.</p>' +
          '<a id="sgGo" href="live.html?g=' + encodeURIComponent(g.id) + '" style="display:block;padding:13px 16px;border-radius:999px;background:#16a34a;color:#fff;font-weight:700;text-decoration:none;font-size:16px;">Vai alla Partita live</a>'
        : '<h3 id="sgTitle" style="margin:10px 0 6px;font-size:20px;">Manca un passo: Salva giornata</h3>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.45;color:var(--muted,#555);">I punti ' + tipo + ' della <b>Giornata ' + num + '</b> sono pubblicati nella Partita live, ' +
        'ma <b>non sono ancora calcolati</b>: finché non premi <b>Salva giornata</b> i giocatori non vedono i risultati.</p>' +
        '<a id="sgGo" href="matchday.html?g=' + encodeURIComponent(g.id) + '&from=live" style="display:block;padding:13px 16px;border-radius:999px;background:#16a34a;color:#fff;font-weight:700;text-decoration:none;font-size:16px;">💾 Vai a Salva giornata</a>') +
      '<button id="sgLater" type="button" style="margin-top:10px;background:none;border:0;color:var(--muted,#555);font:inherit;font-size:14px;text-decoration:underline;cursor:pointer;">Più tardi</button>' +
      '</div>';
    document.body.appendChild(ov);
    // "Più tardi" lo nasconde fino alla prossima apertura dell'app, non per sempre
    ov.querySelector('#sgLater').onclick = () => { try { sessionStorage.setItem(key, '1'); } catch (e) {} ov.remove(); };
  }
  start();
})();
