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

  // schedule = [{home, away}], byTeam = { "0": {points, missing}, ... }
  function computeDay(schedule, byTeam, cfg) {
    return (schedule || []).filter(m => typeof m.home === 'number' && typeof m.away === 'number')
      .map(m => Object.assign({ home: m.home, away: m.away }, match(byTeam[String(m.home)], byTeam[String(m.away)], cfg)));
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
      h.pts += m.ptsHome != null ? m.ptsHome : (e === '1' ? cfg.vittoria : e === 'X' ? cfg.pareggio : cfg.sconfitta);
      a.pts += m.ptsAway != null ? m.ptsAway : (e === '2' ? cfg.vittoria : e === 'X' ? cfg.pareggio : cfg.sconfitta);
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

  const api = { goals, match, computeDay, standings, active, saveDay };
  root.H2H = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
