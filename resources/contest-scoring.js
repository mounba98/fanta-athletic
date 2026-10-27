// Contest pronostici — logica pura (D069), più scoreMatch che scrive sul database (D130).
// Usata da contest.html, admin-contest.html e contest-leaderboard.html.
(function(root) {
  'use strict';

  // Regole decise il 24/09/2026 (D071): si vota 1-X-2 (vittoria casa /
  // pareggio / vittoria ospite); 10 punti se l'esito è giusto, altrimenti 0.
  // (Il vecchio schema di Mocci era 10/5/2 sul risultato esatto.)
  // Valori di partenza; dal 25/09/2026 (D087) li sovrascrive la Stagione
  // (resources/season.js → configure), modificabili dagli admin senza codice.
  const POINTS = { correct: 10 };
  const CFG = { openHours: 24, closeMinutes: 30 }; // apertura 24h prima, chiusura 30 min prima
  const PICKS = ['1', 'X', '2'];

  const FACTIONS = {
    curva: { id: 'curva', name: 'Curva Morello' },
    piana: { id: 'piana', name: 'Piana' }
  };

  const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

  function outcomeOf(h, a) { return h > a ? '1' : (h < a ? '2' : 'X'); }

  // pred: { pick: '1'|'X'|'2' }; result: { home, away } interi. Ritorna i punti (o null se non valido).
  function scorePrediction(pred, result) {
    if (!pred || !result) return null;
    if (PICKS.indexOf(pred.pick) < 0) return null;
    const rh = Number(result.home), ra = Number(result.away);
    if (!Number.isInteger(rh) || !Number.isInteger(ra) || rh < 0 || ra < 0) return null;
    return pred.pick === outcomeOf(rh, ra) ? POINTS.correct : 0;
  }

  // Anno d'inizio della stagione: da luglio in poi è l'anno corrente,
  // altrimenti quello prima (sostituisce l'anno fisso 2024/2025 del vecchio codice).
  function seasonStartYear(now) {
    const d = now || new Date();
    return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  }

  // Doc di athletic_calendar → data/ora d'inizio partita (o null se incompleto)
  function matchStart(cal, startYear) {
    const monthIndex = MONTHS.indexOf(cal.month);
    const day = parseInt(cal.date, 10);
    if (monthIndex < 0 || isNaN(day)) return null;
    const year = monthIndex >= 8 ? startYear : startYear + 1;
    // "21:15" o "21.15" (nel calendario gli admin scrivono col punto: prima 21.15 diventava 21:00, D122)
    const parts = String(cal.time == null ? '15:00' : cal.time).split(/[:.]/);
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;
    return new Date(year, monthIndex, day, isNaN(hours) ? 15 : hours, isNaN(minutes) ? 0 : minutes);
  }

  // Chiusura voti = 30 minuti prima del calcio d'inizio
  function deadlineOf(start) {
    return start ? new Date(start.getTime() - CFG.closeMinutes * 60000) : null;
  }

  // Apertura voti = 24 ore prima del calcio d'inizio
  function opensOf(start) {
    return start ? new Date(start.getTime() - CFG.openHours * 3600000) : null;
  }

  // Ha un risultato inserito? (homeScore/awayScore numerici, non null)
  function resultOf(cal) {
    const h = cal.homeScore, a = cal.awayScore;
    if (typeof h === 'number' && typeof a === 'number') return { home: h, away: a };
    return null;
  }

  // Ricalcola le classifiche da zero a partire dai pronostici già valutati.
  // Dal 27/10/2026 (D130) si gioca UN voto per squadra: la classifica è per squadra
  // (chiave "T<indice>", nome = nome della squadra) e resta nel campo `users` per
  // non cambiare chi la legge (Home, Classifiche, classifica del mini-gioco).
  // I voti a persona rimasti senza squadra (prima del D130) contano per persona.
  // Si saltano i voti "superati" da un voto più recente della stessa squadra.
  function buildStandings(predictions) {
    const users = {};
    const teams = {
      curva: { points: 0, players: 0, predictions: 0, hits: 0 },
      piana: { points: 0, players: 0, predictions: 0, hits: 0 }
    };
    const byMatch = {};
    predictions.forEach(p => {
      if (typeof p.points !== 'number' || p.superseded) return;
      if (p.faction && teams[p.faction] && p.matchKey) {
        const m = byMatch[p.matchKey] || (byMatch[p.matchKey] = {
          giornata: p.giornata,
          curva: { points: 0, votes: 0, hits: 0 },
          piana: { points: 0, votes: 0, hits: 0 }
        });
        m[p.faction].points += p.points;
        m[p.faction].votes += 1;
        if (Number(p.points) > 0) m[p.faction].hits += 1;
      }
      const isTeam = typeof p.team_index === 'number';
      const id = isTeam ? 'T' + p.team_index : p.uid;
      const u = users[id] || (users[id] = {
        name: (isTeam ? p.teamName : p.name) || 'Squadra', faction: p.faction || null, points: 0, predictions: 0, hits: 0, team: isTeam
      });
      if (isTeam && p.teamName) u.name = p.teamName;
      u.points += p.points;
      u.predictions += 1;
      if (Number(p.points) > 0) u.hits += 1;
      if (p.faction && !u.faction) u.faction = p.faction;
    });
    Object.values(users).forEach(u => {
      if (u.faction && teams[u.faction]) {
        teams[u.faction].points += u.points;
        teams[u.faction].players += 1;
        teams[u.faction].predictions += u.predictions;
        teams[u.faction].hits += u.hits;
      }
    });
    return { users, teams, byMatch };
  }

  // Tutte le squadre della lega in classifica, anche chi non ha mai votato (0 punti, D130):
  // non cambiano i totali delle fazioni (contano solo chi ha giocato).
  // teams: { "<indice>": { name, fazione } }
  function withAllTeams(st, teams) {
    Object.entries(teams || {}).forEach(([id, t]) => {
      const k = 'T' + id;
      if (st.users[k]) { if (t.name) st.users[k].name = t.name; return; }
      st.users[k] = { name: t.name || ('Squadra ' + id), faction: t.fazione || null, points: 0, predictions: 0, hits: 0, team: true };
    });
    return st;
  }

  // Id del voto di una squadra per una partita: "G3_T6"
  function teamPredId(matchKey, teamIndex) { return matchKey + '_T' + teamIndex; }

  // Fra più voti della stessa squadra vale l'ultimo (D130)
  function latest(list) {
    return (list || []).slice().sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')))[0] || null;
  }

  // c = { punti, aperturaOre, chiusuraMinuti } dalla Stagione
  function configure(c) {
    if (!c) return;
    if (Number(c.punti) > 0) POINTS.correct = Number(c.punti);
    if (Number(c.aperturaOre) > 0) CFG.openHours = Number(c.aperturaOre);
    if (Number(c.chiusuraMinuti) >= 0 && c.chiusuraMinuti !== null && c.chiusuraMinuti !== '') CFG.closeMinutes = Number(c.chiusuraMinuti);
  }

  // Unica parte che usa il database (D130): valuta i voti di una partita e ricalcola
  // la classifica. La chiamano admin-contest.html (pulsante) e, da sole, la Partita live
  // e Gestione Calendario quando si salva il risultato. Solo admin (legge gli utenti).
  //  - un voto per squadra: i voti vecchi a persona si attribuiscono alla squadra
  //    dell'autore (team_index scritto sul voto); per ogni squadra conta l'ultimo,
  //    gli altri restano segnati come `superseded`.
  //  - segna quali squadre hanno votato e quali no (solo un elenco, nessun malus).
  async function scoreMatch(db, key, result, leagueId) {
    const raw = root.__LEGACY_DB__ || db;
    const snap = await db.collection('contest_predictions').where('matchKey', '==', key).get();
    const teamNames = {}, teamFaction = {};
    if (leagueId) {
      const ts = await raw.collection('leagues/' + leagueId + '/teams').get();
      ts.docs.forEach(d => { teamNames[d.id] = d.data().name || ('Squadra ' + d.id); teamFaction[d.id] = d.data().fazione || null; });
    }
    const userTeam = {};
    const byTeam = {};
    for (const d of snap.docs) {
      const p = Object.assign({ _ref: d.ref }, d.data());
      let idx = typeof p.team_index === 'number' ? p.team_index : undefined;
      if (idx === undefined && p.uid) {
        if (!(p.uid in userTeam)) {
          const u = await raw.collection('users').doc(p.uid).get().catch(() => null);
          const t = u && u.exists ? u.data().team_index : null;
          userTeam[p.uid] = typeof t === 'number' ? t : null;
        }
        idx = userTeam[p.uid];
      }
      p._team = (idx === null || idx === undefined) ? null : idx;
      const k = p._team === null ? 'u:' + p.uid : 't:' + p._team;
      (byTeam[k] = byTeam[k] || []).push(p);
    }
    let batch = db.batch(), ops = 0, done = 0;
    const voted = new Set();
    for (const list of Object.values(byTeam)) {
      const win = latest(list);
      for (const p of list) {
        const upd = { scoredAt: new Date().toISOString() };
        if (p._team !== null) {
          upd.team_index = p._team;
          if (teamNames[p._team]) upd.teamName = teamNames[p._team];
          if (teamFaction[p._team]) upd.faction = teamFaction[p._team];
        }
        if (p === win) {
          const pts = scorePrediction(p, result);
          if (pts === null) continue;
          upd.points = pts; upd.superseded = false; done++;
          if (p._team !== null) voted.add(String(p._team));
        } else {
          upd.points = 0; upd.superseded = true;
        }
        batch.update(p._ref, upd);
        if (++ops === 400) { await batch.commit(); batch = db.batch(); ops = 0; }
      }
    }
    if (ops) await batch.commit();
    const ref = db.collection('contest_standings').doc('current');
    const prev = await ref.get().catch(() => null);
    const participation = Object.assign({}, (prev && prev.exists && prev.data().participation) || {});
    if (Object.keys(teamNames).length) {
      const sort = a => a.sort((x, y) => x.localeCompare(y, 'it'));
      const ids = Object.keys(teamNames);
      participation[key] = { voted: sort(ids.filter(i => voted.has(i)).map(i => teamNames[i])),
        missing: sort(ids.filter(i => !voted.has(i)).map(i => teamNames[i])), at: new Date().toISOString() };
    }
    const all = (await db.collection('contest_predictions').get()).docs.map(d => d.data());
    const teamsMap = {};
    Object.keys(teamNames).forEach(id => { teamsMap[id] = { name: teamNames[id], fazione: teamFaction[id] }; });
    const st = withAllTeams(buildStandings(all), teamsMap);
    await ref.set({ users: st.users, teams: st.teams, byMatch: st.byMatch, participation, updatedAt: new Date().toISOString() });
    return { done, total: snap.size, participation: participation[key] || null };
  }

  const api = { POINTS, PICKS, CFG, configure, FACTIONS, MONTHS, outcomeOf,
                scorePrediction, seasonStartYear, matchStart, deadlineOf, opensOf,
                resultOf, buildStandings, withAllTeams, scoreMatch, teamPredId, latest };
  root.ContestScoring = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
