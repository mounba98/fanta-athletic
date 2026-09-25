// Scontri diretti — dal punteggio della giornata al risultato della sfida (D087).
// PREDISPOSTO: entra in funzione solo se nella Stagione la modalità è
// "scontri" o "entrambe". Con "classica" (oggi) non scrive niente.
//
// Calendario: leagues/{lega}/h2h_schedule/{chiave}/giornate/{G}  → { matches: [{home, away}] }
// Risultati:  leagues/{lega}/h2h_results/{chiave}/giornate/{G}   → { matches: [...] }
// home/away sono i numeri delle squadre (id documento "0", "1", …).
// scoreHome/scoreAway = gol (conversione "soglie") o punti (conversione "diretta"):
// è quello che già leggono classifiche.html e h2h-standings.html.
(function(root) {
  'use strict';

  function goals(points, cfg) {
    if (cfg.conversione === 'diretta') return Math.round((Number(points) || 0) * 2) / 2;
    return root.Season.goalsFromPoints(points, cfg);
  }

  // Esito di una sfida. home/away = { points, missing }
  function match(home, away, cfg) {
    const out = { pointsHome: home ? home.points : null, pointsAway: away ? away.points : null };
    const hm = !home || home.missing, am = !away || away.missing;
    if (hm || am) {
      // a tavolino: chi ha schierato vince, se mancano entrambi perdono entrambi
      out.scoreHome = hm ? cfg.forfaitPerdente : cfg.forfaitVincente;
      out.scoreAway = am ? cfg.forfaitPerdente : cfg.forfaitVincente;
      out.forfeitHome = hm; out.forfeitAway = am;
    } else {
      out.scoreHome = goals(home.points, cfg);
      out.scoreAway = goals(away.points, cfg);
      out.forfeitHome = false; out.forfeitAway = false;
    }
    out.esito = out.scoreHome > out.scoreAway ? '1' : out.scoreHome < out.scoreAway ? '2' : 'X';
    if (hm && am) out.esito = '0'; // nessuno prende punti
    out.ptsHome = out.esito === '1' ? cfg.vittoria : out.esito === 'X' ? cfg.pareggio : cfg.sconfitta;
    out.ptsAway = out.esito === '2' ? cfg.vittoria : out.esito === 'X' ? cfg.pareggio : cfg.sconfitta;
    return out;
  }

  // Formazione mancante secondo la regola della Stagione (D100): meno di
  // cfg.minTitolari titolari. Se il numero di titolari non c'è, vale "missing".
  function withMissing(t, cfg) {
    if (!t) return t;
    const min = Number(cfg.minTitolari) > 0 ? Number(cfg.minTitolari) : 1;
    return typeof t.starters === 'number' ? Object.assign({}, t, { missing: t.starters < min }) : t;
  }

  // schedule = [{home, away}], byTeam = { "0": {points, starters, missing}, ... }
  function computeDay(schedule, byTeam, cfg) {
    return (schedule || []).filter(m => typeof m.home === 'number' && typeof m.away === 'number')
      .map(m => Object.assign({ home: m.home, away: m.away },
        match(withMissing(byTeam[String(m.home)], cfg), withMissing(byTeam[String(m.away)], cfg), cfg)));
  }

  // Classifica dagli esiti salvati (tutte le giornate)
  function standings(days, cfg) {
    const t = {};
    const row = id => (t[id] = t[id] || { team: id, g: 0, v: 0, n: 0, p: 0, gf: 0, gs: 0, pts: 0 });
    (days || []).forEach(d => (d.matches || []).forEach(m => {
      if (m.scoreHome == null || m.scoreAway == null) return;
      const h = row(m.home), a = row(m.away);
      h.g++; a.g++; h.gf += m.scoreHome; h.gs += m.scoreAway; a.gf += m.scoreAway; a.gs += m.scoreHome;
      const e = m.esito || (m.scoreHome > m.scoreAway ? '1' : m.scoreHome < m.scoreAway ? '2' : 'X');
      if (e === '1') { h.v++; a.p++; } else if (e === '2') { a.v++; h.p++; } else if (e === 'X') { h.n++; a.n++; } else { h.p++; a.p++; }
      // punti sempre dalle regole ATTUALI della Stagione (se gli admin le cambiano vale subito)
      h.pts += e === '1' ? cfg.vittoria : e === 'X' ? cfg.pareggio : cfg.sconfitta;
      a.pts += e === '2' ? cfg.vittoria : e === 'X' ? cfg.pareggio : cfg.sconfitta;
      if (m.forfeitHome) h.tavolino = (h.tavolino || 0) + 1;
      if (m.forfeitAway) a.tavolino = (a.tavolino || 0) + 1;
    }));
    return Object.values(t).sort((x, y) => y.pts - x.pts || (y.gf - y.gs) - (x.gf - x.gs) || y.gf - x.gf);
  }

  function active(season) { return !!season && (season.modalita === 'scontri' || season.modalita === 'entrambe'); }

  // Scrive gli esiti della giornata. Ritorna null se la modalità non li prevede
  // o se per quella giornata non c'è calendario sfide.
  async function saveDay(lid, season, giornata, byTeam) {
    if (!active(season)) return null;
    const db = root.__LEGACY_DB__ || root.firebase.firestore();
    const L = db.collection('leagues').doc(lid);
    const key = season.h2h.key;
    const sched = await L.collection('h2h_schedule').doc(key).collection('giornate').doc(String(giornata)).get();
    if (!sched.exists) return null;
    const matches = computeDay(sched.data().matches, byTeam, season.h2h);
    await L.collection('h2h_results').doc(key).collection('giornate').doc(String(giornata)).set({
      giornata: String(giornata), matches, computedAt: root.firebase.firestore.FieldValue.serverTimestamp(),
      regole: JSON.parse(JSON.stringify(season.h2h))
    });
    return matches;
  }

  // Calendario "tutti contro tutti" (metodo a rotazione, D100). teamIds = numeri
  // delle squadre (id documento). Andata: ognuno incontra tutti una volta;
  // ritorno: stesse sfide a campi invertiti; oltre, si ricomincia.
  // Con squadre dispari ogni giornata una riposa (bye).
  function generate(teamIds, rounds) {
    const ids = teamIds.map(Number).filter(n => Number.isFinite(n)).sort((x, y) => x - y);
    const list = ids.length % 2 ? ids.concat([null]) : ids.slice();
    const n = list.length;
    if (n < 2) return [];
    const half = [];
    let rot = list.slice();
    for (let r = 0; r < n - 1; r++) {
      const matches = []; let bye = null;
      for (let i = 0; i < n / 2; i++) {
        const a = rot[i], b = rot[n - 1 - i];
        if (a === null || b === null) { bye = a === null ? b : a; continue; }
        // alterna casa/trasferta: la squadra fissa cambia campo ogni giornata
        const swap = i === 0 ? r % 2 === 1 : i % 2 === 1;
        matches.push(swap ? { home: b, away: a } : { home: a, away: b });
      }
      half.push({ matches, bye });
      rot = [rot[0]].concat([rot[n - 1]], rot.slice(1, n - 1));
    }
    const total = Number(rounds) > 0 ? Number(rounds) : half.length * 2;
    const out = [];
    for (let r = 0; r < total; r++) {
      const base = half[r % half.length];
      const leg = Math.floor(r / half.length) % 2;
      out.push({
        matches: base.matches.map(m => leg ? { home: m.away, away: m.home } : { home: m.home, away: m.away }),
        bye: base.bye
      });
    }
    return out;
  }

  // Ricalcola TUTTE le giornate già calcolate con le regole attuali della
  // Stagione (serve quando gli admin cambiano soglie/tavolino a stagione iniziata).
  // Legge i punti di ogni squadra da results/{G}/teams (points, missingLineup).
  async function recomputeAll(lid, season, step) {
    if (!active(season)) return { giornate: 0, skipped: 'modalità classica' };
    const db = root.__LEGACY_DB__ || root.firebase.firestore();
    const L = db.collection('leagues').doc(lid);
    const key = season.h2h.key;
    const sched = await L.collection('h2h_schedule').doc(key).collection('giornate').get();
    let done = 0;
    for (const d of sched.docs) {
      const g = d.id;
      const teams = await L.collection('results').doc(g).collection('teams').get();
      if (teams.empty) continue;                       // giornata non ancora calcolata
      const byTeam = {};
      teams.docs.forEach(t => {
        const x = t.data() || {};
        const starters = Array.isArray(x.lineup) ? x.lineup.filter(Boolean).length : undefined;
        byTeam[t.id] = { points: Number(x.points) || 0, starters, missing: !!x.missingLineup };
      });
      const matches = computeDay(d.data().matches, byTeam, season.h2h);
      await L.collection('h2h_results').doc(key).collection('giornate').doc(g).set({
        giornata: g, matches, computedAt: root.firebase.firestore.FieldValue.serverTimestamp(),
        regole: JSON.parse(JSON.stringify(season.h2h))
      });
      done++;
      step && step('Ricalcolata ' + g);
    }
    return { giornate: done };
  }

  // Classifica leggendo i risultati salvati della stagione
  async function loadStandings(lid, season) {
    const db = root.__LEGACY_DB__ || root.firebase.firestore();
    const snap = await db.collection('leagues').doc(lid).collection('h2h_results').doc(season.h2h.key).collection('giornate').get();
    return standings(snap.docs.map(d => d.data() || {}), season.h2h);
  }

  const api = { goals, match, computeDay, standings, active, saveDay, generate, recomputeAll, loadStandings };
  root.H2H = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
