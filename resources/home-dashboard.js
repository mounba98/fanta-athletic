// Nuova Home "centro di controllo" (D109): tre fasce — Adesso, Il mio fanta,
// Athletic 2018 — più una fascia solo admin. Riempie i contenitori hd* di
// index.html. Ogni blocco si carica da solo: se un dato manca o non si può
// leggere, quel blocco mostra un messaggio semplice e gli altri vanno avanti.
(function() {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => String(Math.round(Number(n || 0) * 10) / 10).replace('.', ',');
  const raw = () => window.__LEGACY_DB__ || firebase.firestore();
  const isAthletic = s => String(s || '').toLowerCase().includes('athletic');
  const DAY = 86400000;
  const FACTIONS = { curva: 'Curva Morello', piana: 'Piana' };

  function when(d) {
    const days = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(new Date().setHours(0, 0, 0, 0))) / DAY);
    const rel = days === 0 ? 'oggi' : days === 1 ? 'domani' : days > 1 ? 'tra ' + days + ' giorni' : '';
    const txt = d.toLocaleString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    return txt.charAt(0).toUpperCase() + txt.slice(1) + (rel ? ' · ' + rel : '');
  }
  const gNum = id => parseInt(String(id).replace(/\D/g, ''), 10) || 0;
  async function safe(p, fallback) { try { return await p; } catch (e) { console.warn('[home]', e && (e.code || e.message)); return fallback; } }

  // ---------- dati comuni ----------
  async function loadCore(user) {
    const db = raw();
    const lid = await window.Season.leagueId();
    const S = await safe(window.Season.load(), null);
    const L = db.collection('leagues').doc(lid);
    const [uDoc, adminDoc, lDoc] = await Promise.all([
      db.collection('users').doc(user.uid).get(),
      safe(db.collection('admins').doc(user.uid).get(), null),
      safe(L.get(), null)
    ]);
    const u = uDoc.exists ? uDoc.data() : {};
    const leagueAdmins = (lDoc && lDoc.exists && lDoc.data().admins) || [];
    const isAdmin = !!(adminDoc && adminDoc.exists) || leagueAdmins.includes(user.uid);
    const idx = typeof u.team_index === 'number' ? u.team_index : null;
    const [teamsSnap, cal, days] = await Promise.all([
      safe(L.collection('teams').get(), null),
      safe(db.collection('athletic_calendar').get(), null),
      safe(L.collection('days').get(), null)
    ]);
    const teams = {};
    if (teamsSnap) teamsSnap.docs.forEach(d => { teams[d.id] = d.data(); });
    const calendar = cal ? cal.docs.map(d => d.data()) : [];
    const computed = days ? days.docs.filter(d => d.data().computed === true).map(d => d.id).sort((a, b) => gNum(a) - gNum(b)) : [];
    return { db, lid, L, S, user, u, idx, isAdmin, teams, calendar, days: days ? days.docs.map(d => Object.assign({ id: d.id }, d.data())) : [], computed };
  }

  // Prossima partita e ultima giocata dal calendario Athletic
  function matches(core) {
    const CS = window.ContestScoring;
    const now = new Date(), y = CS.seasonStartYear(now);
    let next = null, last = null;
    core.calendar.forEach(c => {
      const start = CS.matchStart(c, y);
      if (!start || c.postponed) return;
      const res = CS.resultOf(c);
      if (res) { if (!last || start > last.start) last = { start, c, res }; return; }
      if (start.getTime() > now.getTime() - 3 * 3600000 && (!next || start < next.start)) next = { start, c, n: parseInt(c.giornata, 10) };
    });
    return { next, last };
  }

  // ---------- fascia 1: adesso ----------
  function renderNext(m, core) {
    const el = $('hdNext');
    if (!m.next) {
      el.innerHTML = '<div class="hd-k">Prossima partita</div><div class="hd-big">Nessuna partita in calendario</div>' +
        '<div class="hd-sub">' + (core.isAdmin ? 'Inseriscila da Pannello admin › Calendario Athletic.' : 'Appena gli admin la inseriscono, la trovi qui.') + '</div>';
      return;
    }
    const c = m.next.c, home = isAthletic(c.homeTeam);
    el.innerHTML = '<div class="hd-row"><span class="hd-k">Prossima partita' + (m.next.n ? ' · ' + m.next.n + 'ª giornata' : '') + '</span>' +
      '<span class="hd-pill">' + (home ? 'In casa' : 'In trasferta') + '</span></div>' +
      '<div class="hd-vs"><span>' + esc(c.homeTeam) + '</span><small>vs</small><span>' + esc(c.awayTeam) + '</span></div>' +
      '<div class="hd-sub">' + esc(when(m.next.start)) + (c.location ? ' · ' + esc(c.location) : '') + '</div>';
    el.onclick = () => { location.href = 'calendario-athletic.html'; };
  }

  async function renderFormation(m, core) {
    const el = $('hdForm');
    const set = (cls, k, big, sub, href) => { el.className = 'hd-tile ' + cls; el.href = href; el.innerHTML = '<div class="hd-k">' + k + '</div><div class="hd-mid">' + big + '</div><div class="hd-sub">' + sub + '</div>'; };
    if (core.idx === null) return set('warn', 'Formazione', 'Nessuna squadra', 'Scegli la tua squadra', 'scegli-squadra.html');
    if (!m.next || !m.next.n) return set('', 'Formazione', 'Niente da fare', 'Nessuna giornata in arrivo', 'formazioni.html');
    const g = 'G' + m.next.n;
    const [saved, dl] = await Promise.all([
      safe(core.L.collection('teams').doc(String(core.idx)).collection('saved').doc(g).get(), null),
      safe(core.L.collection('deadlines').doc('giornata_' + m.next.n).get(), null)
    ]);
    const lineup = saved && saved.exists ? (saved.data().lineup || []) : [];
    const starters = lineup.filter(Boolean).length;
    const manual = dl && dl.exists && dl.data().deadline && dl.data().deadline.toDate ? dl.data().deadline.toDate() : null;
    // Senza scadenza manuale: orario della partita meno 1 ora, come Formazioni e Squadre (D122, lineup-deadline.js)
    const deadline = manual || (m.next.start && window.FALineupDeadline ? new Date(m.next.start.getTime() - FALineupDeadline.BEFORE_MINUTES * 60000) : null);
    const dtxt = deadline ? deadline.toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : null;
    if (starters >= 5) return set('ok', 'Formazione ' + g, 'Consegnata', 'Tocca per modificarla', 'formazioni.html');
    if (deadline && deadline < new Date()) return set('bad', 'Formazione ' + g, 'Scadenza passata', starters ? starters + '/5 titolari' : 'Non consegnata', 'formazioni.html');
    set('warn', 'Formazione ' + g, starters ? 'Incompleta ' + starters + '/5' : 'Da consegnare', dtxt ? 'Entro ' + esc(dtxt) : 'Prima della partita', 'formazioni.html');
  }

  async function renderGame(m, core) {
    const el = $('hdGame');
    const CS = window.ContestScoring;
    let state = 'none', pick = null;
    const now = new Date();
    if (m.next && m.next.n && now < CS.deadlineOf(m.next.start)) {
      if (now >= CS.opensOf(m.next.start)) {
        const pred = await safe(core.db.collection('contest_predictions').doc('G' + m.next.n + '_' + core.user.uid).get(), null);
        state = pred && pred.exists ? 'voted' : 'open';
        if (pred && pred.exists) pick = pred.data().pick;
      } else state = 'soon';
    }
    let pts = null;
    const st = await safe(core.db.collection('contest_standings').doc('current').get(), null);
    if (st && st.exists) {
      pts = { curva: 0, piana: 0 };
      Object.values(st.data().users || {}).forEach(u => { if (pts[u.faction] !== undefined) pts[u.faction] += Number(u.points || 0); });
    }
    const score = pts ? 'Curva ' + fmt(pts.curva) + ' · Piana ' + fmt(pts.piana) : 'Curva vs Piana';
    const map = {
      open: ['accent', 'Voto aperto', 'Chiude ' + (m.next ? CS.deadlineOf(m.next.start).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : ''), 'contest.html'],
      voted: ['ok', 'Hai votato ' + esc(pick || ''), score, 'contest.html'],
      soon: ['', 'Voto in arrivo', m.next ? 'Si apre ' + CS.opensOf(m.next.start).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : score, 'classifiche.html#fazioni'],
      none: ['', 'Mini-gioco', score, 'classifiche.html#fazioni']
    }[state];
    el.className = 'hd-tile ' + map[0]; el.href = map[3];
    el.innerHTML = '<div class="hd-k">Mini-gioco 1-X-2</div><div class="hd-mid">' + map[1] + '</div><div class="hd-sub">' + map[2] + '</div>';
  }

  // La mia sfida (D124): avversario della prossima giornata (o risultato dell'ultima
  // calcolata), solo se la stagione ha gli scontri diretti e il calendario sfide.
  async function renderSfida(m, core) {
    const el = $('hdSfida');
    const S = core.S;
    if (!el || !S || core.idx === null || !(S.modalita === 'scontri' || S.modalita === 'entrambe')) return;
    const key = S.h2h && S.h2h.key;
    const sched = await safe(core.L.collection('h2h_schedule').doc(key).collection('giornate').get(), null);
    if (!sched || sched.empty) return;
    const res = await safe(core.L.collection('h2h_results').doc(key).collection('giornate').get(), null);
    const results = {}; if (res) res.docs.forEach(d => { results[d.id] = d.data(); });
    const me = Number(core.idx);
    const find = doc => ((doc && doc.matches) || []).find(x => x.home === me || x.away === me);
    // giornata da mostrare: la prossima del calendario Athletic se non è ancora calcolata, altrimenti l'ultima calcolata
    const nextG = m.next && m.next.n ? 'G' + m.next.n : null;
    const lastDone = Object.keys(results).filter(g => (results[g].matches || []).length).sort((a, b) => gNum(b) - gNum(a))[0] || null;
    const recent = lastDone && (!nextG || gNum(lastDone) >= gNum(nextG) - 1) && m.last && m.last.start > new Date(Date.now() - 3 * DAY) ? lastDone : null;
    const g = recent || nextG || lastDone;
    const schedDoc = sched.docs.find(d => d.id === g);
    if (!g || !schedDoc) return;
    const mt = find(schedDoc.data());
    const name = id => (core.teams[String(id)] || {}).name || ('Squadra ' + id);
    el.href = 'sfida.html?g=' + encodeURIComponent(g);
    if (!mt) { el.hidden = false; el.innerHTML = '<div class="hd-row"><span class="hd-k">La mia sfida · ' + gNum(g) + 'ª giornata</span></div><div class="hd-big">Turno di riposo</div>'; return; }
    const opp = mt.home === me ? mt.away : mt.home;
    // posizione dell'avversario negli scontri (dagli esiti salvati)
    let pos = '';
    if (window.H2H && Object.keys(results).length) {
      const st = window.H2H.standings(Object.values(results), S.h2h);
      const i = st.findIndex(r => Number(r.team) === Number(opp));
      if (i >= 0) pos = (i + 1) + '° negli scontri';
    }
    const r = (results[g] && find(results[g])) || null;
    const fmtS = x => String(Math.round(Number(x) * 2) / 2).replace('.', ',');
    let mid, sub, pill = mt.home === me ? 'In casa' : 'In trasferta';
    if (r && r.scoreHome != null) {
      const mine = mt.home === me ? r.scoreHome : r.scoreAway, theirs = mt.home === me ? r.scoreAway : r.scoreHome;
      const e = r.esito === 'X' ? 'Pareggio' : r.esito === '0' ? 'Nessun punto' : ((r.esito === '1') === (mt.home === me) ? 'Vittoria' : 'Sconfitta');
      pill = e;
      mid = '<small style="white-space:nowrap"><b>' + fmtS(mine) + '</b>–<b>' + fmtS(theirs) + '</b></small>';
      sub = 'Tocca per vedere le due formazioni';
    } else {
      mid = '<small>vs</small>';
      const dl = m.next && m.next.start && window.FALineupDeadline ? new Date(m.next.start.getTime() - FALineupDeadline.BEFORE_MINUTES * 60000) : null;
      sub = (pos ? esc(pos) + ' · ' : '') + (dl && dl > new Date() ? 'La sua formazione si vede da ' + dl.toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'Tocca per vedere le due formazioni');
    }
    el.hidden = false;
    el.innerHTML = '<span class="fa-new" data-new-until="2026-11-07">New</span>' +
      '<div class="hd-row"><span class="hd-k">La mia sfida · ' + gNum(g) + 'ª giornata</span><span class="hd-pill">' + esc(pill) + '</span></div>' +
      '<div class="hd-vs"><span>' + esc(name(me)) + '</span>' + mid + '<span>' + esc(name(opp)) + '</span></div>' +
      '<div class="hd-sub">' + sub + '</div>';
  }

  async function renderBanner(core) {
    const el = $('hdBanner');
    const a = await safe(core.db.collection('auction').doc('current').get(), null);
    const status = a && a.exists ? a.data().status : null;
    if (status === 'active' || status === 'waiting' || status === 'paused') {
      el.innerHTML = '<a class="hd-banner" href="asta.html"><b>' + (status === 'active' ? 'Asta in corso' : 'Asta aperta') + '</b><span>Entra nell\'asta →</span></a>';
    } else if (core.S && core.S.stato === 'preparazione') {
      el.innerHTML = '<div class="hd-banner soft"><b>Stagione ' + esc(core.S.label) + ' in preparazione</b><span>Rose e calendario arrivano dopo l\'asta</span></div>';
    } else el.innerHTML = '';
  }

  // ---------- fascia 2: il mio fanta ----------
  async function renderTeam(core) {
    const name = $('myTeamName'), extra = $('hdTeamExtra'), stats = $('hdTeamStats');
    if (core.idx === null) { name.textContent = 'Nessuna squadra'; extra.textContent = 'Tocca per sceglierne una'; $('myTeamCard').onclick = () => { location.href = 'scegli-squadra.html'; }; return; }
    const t = core.teams[String(core.idx)] || {};
    name.textContent = t.name || 'La mia squadra';
    // allenatore e tifoseria
    let coachName = '', photo = '';
    const cid = Array.isArray(t.coach_ids) ? t.coach_ids[0] : null;
    if (cid) {
      const j = await safe(fetch('resources/coaches.json').then(r => r.json()), { coaches: [] });
      const c = (j.coaches || []).find(x => x.coach_id === cid) || {};
      const lc = await safe(core.L.collection('coaches').doc(cid).get(), null);
      const cc = Object.assign({}, c, lc && lc.exists ? lc.data() : {});
      coachName = cc.nome || cc.name || cid;
      photo = cc.photo_url || cc.photoUrl || cc.photo || cc.image_url || '';
      if (!photo && /tommy/i.test(coachName)) photo = 'resources/coaches/T1.jpg';
      if (!photo && /trendiu/i.test(coachName)) photo = 'resources/coaches/T2.jpg';
      if (!photo && /mario/i.test(coachName)) photo = 'resources/coaches/T3.jpg';
    }
    const fz = FACTIONS[t.fazione] || FACTIONS[core.u.fazione] || '';
    extra.textContent = [coachName ? 'All. ' + coachName : '', fz].filter(Boolean).join(' · ');
    if (photo) $('hdTeamFace').innerHTML = '<img src="' + esc(photo) + '" alt="' + esc(coachName) + '">';
    // posizione e punti dalle giornate calcolate
    const both = !!(core.S && core.S.modalita === 'entrambe' && window.H2H);
    const label = both ? '<span class="k">Classica</span>' : '';
    if (!core.computed.length) { stats.innerHTML = label + '<b>—</b><small>stagione non iniziata</small>'; if (both) renderRanks(core, null); return; }
    const tot = {}; let lastPts = null;
    const lastG = core.computed[core.computed.length - 1];
    const snaps = await Promise.all(core.computed.map(g => safe(core.L.collection('results').doc(g).collection('teams').get(), null)));
    snaps.forEach((s, i) => s && s.docs.forEach(d => {
      const p = Number(d.data().points) || 0;
      tot[d.id] = (tot[d.id] || 0) + p;
      if (core.computed[i] === lastG && d.id === String(core.idx)) lastPts = p;
    }));
    const order = Object.keys(tot).sort((a, b) => tot[b] - tot[a]);
    const pos = order.indexOf(String(core.idx)) + 1;
    stats.innerHTML = label + '<b>' + (pos ? pos + 'º' : '—') + '</b><small>' + fmt(tot[String(core.idx)] || 0) + ' pt' + (lastPts !== null ? ' · ' + lastG + ' ' + (lastPts >= 0 ? '+' : '') + fmt(lastPts) : '') + '</small>';
    if (both) renderRanks(core, tot);
  }

  // Scontri diretti e Supremo della mia squadra (D126): stessi criteri di Classifiche
  // (Supremo = posizione classica + posizione scontri, parità = stessa posizione).
  async function renderRanks(core, tot) {
    const el = $('hdTeamRanks');
    const me = String(core.idx);
    const chip = (href, k, v) => '<a href="' + href + '" onclick="event.stopPropagation()"><span>' + k + '</span><b>' + v + '</b></a>';
    const res = tot ? await safe(core.L.collection('h2h_results').doc(core.S.h2h.key).collection('giornate').get(), null) : null;
    const days = res ? res.docs.map(d => d.data() || {}).filter(d => (d.matches || []).some(m => m.scoreHome != null)) : [];
    if (!tot || !days.length) {
      el.innerHTML = chip('classifiche.html#h2h', 'Scontri', '—') + chip('classifiche.html#supremo', 'Supremo', '—');
      el.hidden = false; return;
    }
    const ids = Object.keys(core.teams);
    const h = window.H2H.standings(days, core.S.h2h);
    const same = (a, b) => a.pts === b.pts && (a.gf - a.gs) === (b.gf - b.gs) && a.gf === b.gf;
    const posH = {}; h.forEach((r, i) => { posH[String(r.team)] = i && same(r, h[i - 1]) ? posH[String(h[i - 1].team)] : i + 1; });
    const unplayed = h.length + 1;
    const cl = ids.map(id => ({ id, t: tot[id] || 0 })).sort((a, b) => b.t - a.t);
    const posC = {}; cl.forEach((r, i) => { posC[r.id] = i && r.t === cl[i - 1].t ? posC[cl[i - 1].id] : i + 1; });
    const sup = ids.map(id => ({ id, s: posC[id] + (posH[id] || unplayed), c: posC[id] })).sort((a, b) => a.s - b.s || a.c - b.c);
    const posS = {}; sup.forEach((r, i) => { posS[r.id] = i && r.s === sup[i - 1].s && r.c === sup[i - 1].c ? posS[sup[i - 1].id] : i + 1; });
    const mine = h.find(r => String(r.team) === me);
    el.innerHTML = chip('classifiche.html#h2h', 'Scontri', (posH[me] ? posH[me] + 'º' : '—') + (mine ? ' · ' + fmt(mine.pts) + ' pt' : '')) +
      chip('classifiche.html#supremo', 'Supremo', posS[me] ? posS[me] + 'º' : '—');
    el.hidden = false;
  }

  async function renderBoard() {
    const el = $('hdBoard');
    // come bacheca.html: prima i post della lega; se vuoti, quelli nella posizione
    // vecchia (radice), ma solo nella lega storica che li possiede (D120)
    let snap = await safe(window.db.collection('posts').orderBy('timestamp', 'desc').limit(1).get(), null);
    const leagueId = await safe(window.Season.leagueId(), null);
    if ((!snap || snap.empty) && leagueId === '4rq1Rr0TquRfuPLmqQTn') snap = await safe(raw().collection('posts').orderBy('timestamp', 'desc').limit(1).get(), null);
    const p = snap && !snap.empty ? snap.docs[0].data() : null;
    if (!p) { el.querySelector('.hd-sub').textContent = 'Nessun messaggio: scrivi il primo'; return; }
    const txt = String(p.content || (p.imageUrl || p.image ? '[foto]' : p.videoUrl ? '[video]' : '')).replace(/\s+/g, ' ');
    el.querySelector('.hd-sub').innerHTML = '<b>' + esc(p.authorName || 'Qualcuno') + ':</b> ' + esc(txt.length > 90 ? txt.slice(0, 88) + '…' : txt);
  }

  // ---------- fascia 3: athletic ----------
  async function renderAthletic(m, core) {
    const el = $('hdLast');
    let html = '';
    if (m.last) {
      const c = m.last.c;
      html += '<div class="hd-k">Ultima partita</div><div class="hd-vs"><span>' + esc(c.homeTeam) + '</span><b>' + m.last.res.home + ' – ' + m.last.res.away + '</b><span>' + esc(c.awayTeam) + '</span></div>';
    } else html += '<div class="hd-k">Athletic 2018</div>';
    // marcatori: stagione in corso, altrimenti l'ultima archiviata
    const AS = window.AthleticStats;
    let label = core.S ? core.S.label : '', st = null;
    const rules = await safe(core.L.collection('rules').get(), null);
    const players = await safe(core.L.collection('players').get(), null);
    const pmap = {}; if (players) players.docs.forEach(d => { pmap[d.id] = d.data(); });
    if (rules && core.days.length) st = AS.compute(core.days, rules.docs.map(d => Object.assign({ rule_id: d.id }, d.data())), pmap);
    if (!st || !AS.top(st, 'gol', 1).length) {
      const arch = await safe(window.SeasonArchive.list(core.lid), []);
      const a = arch.filter(x => x.stato === 'verificato').sort((x, y) => String(y.id).localeCompare(String(x.id)))[0];
      if (a) {
        const I = window.SeasonArchive.archiveRef(core.lid, a.id).collection('items');
        const get = k => safe(I.where('kind', '==', k).get().then(s => s.docs.map(x => x.data())), []);
        const [d, r, p] = await Promise.all([get('days'), get('rules'), get('players')]);
        const pm = {}; p.forEach(x => { pm[x.path.split('/').pop()] = x.data; });
        st = AS.compute(d.map(x => Object.assign({ id: x.path.split('/').pop() }, x.data)), r.map(x => Object.assign({ rule_id: x.path.split('/').pop() }, x.data)), pm);
        label = a.label || a.id;
      }
    }
    const top = st ? AS.top(st, 'gol', 3) : [];
    const short = n => String(n).replace(/\s*\(([^)]+)\)$/, (x, s) => ' "' + s + '"').split(' ').slice(-2).join(' ');
    html += top.length ? '<div class="hd-sub">Marcatori ' + esc(label) + ': ' + top.map(p => esc(short(p.name)) + ' ' + fmt(p.gol)).join(' · ') + '</div>'
      : '<div class="hd-sub">I marcatori compaiono dopo la prima giornata.</div>';
    el.innerHTML = html;
  }

  // ---------- avvio ----------
  async function run(user) {
    let core;
    try { core = await loadCore(user); }
    catch (e) { console.warn('[home] dati non disponibili', e && (e.code || e.message)); $('myTeamName').textContent = 'Dati non disponibili'; return; }
    if (core.isAdmin) $('hdAdmin').hidden = false;
    const m = matches(core);
    renderNext(m, core);
    await Promise.all([renderBanner(core), renderFormation(m, core), renderGame(m, core), renderSfida(m, core), renderTeam(core), renderBoard(), renderAthletic(m, core)]
      .map(p => p.catch(e => console.warn('[home] blocco', e && (e.code || e.message)))));
  }

  let tries = 0;
  function start() {
    if (!window.auth || !window.db || !window.Season || !window.ContestScoring || !window.AthleticStats || !window.SeasonArchive) {
      if (++tries > 100) return;
      return setTimeout(start, 100);
    }
    window.auth.onAuthStateChanged(user => {
      if (!user) { $('myTeamName').textContent = 'Accedi per vedere la tua squadra'; $('myTeamCard').onclick = () => { location.href = 'auth.html'; }; return; }
      run(user);
    });
  }
  start();
})();
