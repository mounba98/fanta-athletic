// Contest pronostici — logica pura (nessun accesso al database), D069.
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
    const parts = String(cal.time == null ? '15:00' : cal.time).split(':');
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
  // predictions: [{ uid, name, faction, points }] con points numerico.
  function buildStandings(predictions) {
    const users = {};
    const teams = {
      curva: { points: 0, players: 0, predictions: 0, hits: 0 },
      piana: { points: 0, players: 0, predictions: 0, hits: 0 }
    };
    const byMatch = {};
    predictions.forEach(p => {
      if (typeof p.points !== 'number') return;
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
      const u = users[p.uid] || (users[p.uid] = {
        name: p.name || 'Giocatore', faction: p.faction || null, points: 0, predictions: 0, hits: 0
      });
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

  // c = { punti, aperturaOre, chiusuraMinuti } dalla Stagione
  function configure(c) {
    if (!c) return;
    if (Number(c.punti) > 0) POINTS.correct = Number(c.punti);
    if (Number(c.aperturaOre) > 0) CFG.openHours = Number(c.aperturaOre);
    if (Number(c.chiusuraMinuti) >= 0 && c.chiusuraMinuti !== null && c.chiusuraMinuti !== '') CFG.closeMinutes = Number(c.chiusuraMinuti);
  }

  const api = { POINTS, PICKS, CFG, configure, FACTIONS, MONTHS, outcomeOf,
                scorePrediction, seasonStartYear, matchStart, deadlineOf, opensOf,
                resultOf, buildStandings };
  root.ContestScoring = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
