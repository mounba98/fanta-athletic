// Calcolo dei punti di una giornata — unico per Calcolo giornata e Partita live (D133).
// Prima viveva solo dentro matchday.html (saveTeamResults): spostato qui SENZA cambiare
// le regole, così le due pagine danno per forza gli stessi punti.
//   computeTeams(...)  calcolo puro (nessun database): punti di ogni squadra
//   loadInputs(...)    legge dal database regole, squadre, formazioni, stagione, calendario
//   saveDay(...)       salva tutto come "Salva giornata": giornata, punti, scontri,
//                      bonus di fazione, stato provvisorio/definitivo, notifica, mini-gioco
(function(root) {
  'use strict';

  // Stesse regole "ripetibili" di matchday.html e live-core.js
  const REPEATABLE_PLAYERS = new Set(['R040','R041','R042','R072','R075','R089','R097','R044','R045','R056','R057','R058','R061','R070','R063','R073','R092']);
  const REPEATABLE_COACH = new Set(['R020','R036']);
  const REPEATABLE_CURVA = new Set(['R008','R027','R028','R029','R015','R003','R002']);

  // Un documento per rule_id (nel database alcune regole sono doppie), come matchday.html
  function dedupeRules(rules) {
    const map = new Map(), extras = [];
    for (const rule of Array.isArray(rules) ? rules : []) {
      const key = ((rule && (rule.rule_id || rule.id)) || '').toString().trim();
      if (!key) { extras.push(rule); continue; }
      if (!map.has(key)) { map.set(key, rule); continue; }
      const current = map.get(key);
      const co = typeof current?.ordine === 'number' ? current.ordine : Infinity;
      const no = typeof rule?.ordine === 'number' ? rule.ordine : Infinity;
      if (no < co) { map.set(key, rule); continue; }
      if (no === co) {
        const cu = typeof current?.updatedAt === 'number' ? current.updatedAt : (current?.updatedAt?.toMillis?.() ?? 0);
        const nu = typeof rule?.updatedAt === 'number' ? rule.updatedAt : (rule?.updatedAt?.toMillis?.() ?? 0);
        if (nu > cu) map.set(key, rule);
      }
    }
    return [...map.values(), ...extras];
  }

  function isScoped(r) { return !!r && (r.ambito === 'squadra' || r.ambito === 'fazione'); }

  function normalize(rules, soggetto, repeatable, max, extraFilter) {
    return (rules || []).filter(r => r.soggetto === soggetto && r.visible !== false && (!extraFilter || extraFilter(r))).map(r => {
      let inputType = r.input_type || r.input;
      if (!inputType || inputType === 'auto') inputType = repeatable.has(r.rule_id) ? 'counter' : 'toggle';
      return Object.assign({}, r, { input: inputType, max: inputType === 'counter' ? max : 1 });
    });
  }
  function playerRules(rules) { return normalize(rules, 'Giocatore', REPEATABLE_PLAYERS, 10); }
  function coachRules(rules) { return normalize(rules, 'Allenatore', REPEATABLE_COACH, 10); }
  function curvaRules(rules) { return normalize(rules, 'Curva', REPEATABLE_CURVA, 50, r => !isScoped(r)); }

  // Curva (uguale per tutti), come computeTotalRules di matchday.html
  function curvaTotal(selections, rules) {
    let total = rules.reduce((sum, r) => {
      const v = Number(r.valore);
      const selVal = selections[r.rule_id];
      if (r.input === 'counter') return sum + (Number(selVal || 0) * v);
      return sum + ((selVal ? 1 : 0) * v);
    }, 0);
    total += Number(selections['infortunati_squalificati_curva'] || 0) * 1;
    return Math.round(total * 2) / 2;
  }

  function selPoints(sel, prules) {
    return prules.reduce((s, r) => s + ((r.rule_id in sel) ? (r.input === 'counter' ? Number(sel[r.rule_id] || 0) * Number(r.valore) : (sel[r.rule_id] ? Number(r.valore) : 0)) : 0), 0) + (sel['__convocato'] ? 1 : 0);
  }

  // Formazione da usare per una squadra: quella della giornata o, se manca e la Stagione
  // lo prevede, l'ultima salvata prima (solo giocatori ancora in rosa), D124.
  // saved = { current: dati|null, prev: [{ g: 'G1', data }] in ordine dalla più recente }
  function pickLineup(team, saved, fmRule, gNow) {
    let lineup = null, captain = null, coachId = null, lineupFrom = null;
    const cur = saved && saved.current;
    if (cur) {
      lineup = cur.lineup || [];
      captain = cur.captain || null;
      coachId = (Array.isArray(cur.coach_ids) && cur.coach_ids.length ? cur.coach_ids[0] : (cur.coach_id || cur.coachId || null));
    }
    if (!Array.isArray(lineup)) lineup = [];
    lineup = lineup.map(slot => slot || null);
    if (fmRule.usaPrecedente && !lineup.some(Boolean) && gNow > 1) {
      const roster = Array.isArray(team.roster) ? team.roster.map(String) : [];
      for (const p of (saved && saved.prev) || []) {
        const pd = p.data || {};
        const pl = (pd.lineup || []).map(pid => (pid && (!roster.length || roster.includes(String(pid)))) ? pid : null);
        if (!pl.some(Boolean)) continue;
        lineup = pl;
        captain = pl.includes(pd.captain) ? pd.captain : null;
        coachId = (Array.isArray(pd.coach_ids) && pd.coach_ids.length ? pd.coach_ids[0] : (pd.coach_id || pd.coachId || null));
        lineupFrom = p.g;
        break;
      }
    }
    return { lineup, captain, coachId, lineupFrom };
  }

  // Calcolo puro. inp = { giornata, rules, sel: {players, coaches, curva}, teams: [{id,...}],
  //   saved: { [teamId]: { current, prev, meta } }, fmRule, gNow, venue, formation: {enabled, value} }
  function computeTeams(inp) {
    const FB = root.FactionBonus;
    const prules = playerRules(inp.rules), crules = coachRules(inp.rules), vrules = curvaRules(inp.rules);
    const selPlayers = inp.sel.players || {}, selCoaches = inp.sel.coaches || {}, selCurva = inp.sel.curva || {};
    const curvaBase = curvaTotal(selCurva, vrules);
    const fbCtx = { venue: inp.venue || null };
    const fmRule = inp.fmRule || { usaPrecedente: false, malus: 0 };
    const formation = inp.formation || { enabled: false, value: 5 };
    const payloads = [], h2hByTeam = {};

    for (const team of inp.teams) {
      const saved = (inp.saved || {})[team.id] || {};
      let { lineup, captain, coachId, lineupFrom } = pickLineup(team, saved, fmRule, inp.gNow || 0);
      const lineupMalus = lineupFrom ? Math.min(0, Number(fmRule.malus) || 0) : 0;

      const starters = lineup.filter(Boolean);
      const missingLineup = starters.length === 0;
      let playerSum = 0;
      const playerContribs = new Map();
      for (const pid of starters) {
        const sel = selPlayers[pid] || {};
        const pts = selPoints(sel, prules);
        playerSum += pts;
        const existing = playerContribs.get(pid) || { playerId: pid, points: 0, breakdown: JSON.parse(JSON.stringify(sel || {})) };
        existing.points += pts;
        playerContribs.set(pid, existing);
      }

      // Capitano (raddoppia)
      let captainBonus = 0;
      if (captain) {
        captainBonus = selPoints(selPlayers[captain] || {}, prules);
        if (playerContribs.has(captain)) playerContribs.get(captain).points += captainBonus;
      }

      // Allenatore
      let coachPts = 0;
      if (!coachId) {
        const teamCoach = Array.isArray(team.coach_ids) && team.coach_ids.length ? team.coach_ids[0] : (team.coach_id || team.coachId || null);
        if (teamCoach) coachId = teamCoach;
      }
      if (coachId && !missingLineup) {
        const selCoach = selCoaches[coachId] || {};
        coachPts = crules.reduce((s, r) => s + ((r.rule_id in selCoach) ? (r.input === 'counter' ? Number(selCoach[r.rule_id] || 0) * Number(r.valore) : (selCoach[r.rule_id] ? Number(r.valore) : 0)) : 0), 0);
      }

      // "Formazione pubblicata" (spento oggi) non spetta a chi gioca con quella di prima (D124)
      let formationBonus = (formation.enabled && starters.length >= 5 && !lineupFrom) ? formation.value : 0;
      // Bonus di fazione (presenze per squadra + eventi della sua fazione), D080
      let factionBonus = FB ? FB.teamBonus(team.id, team.fazione, selCurva, inp.rules, fbCtx).total : 0;

      let total = curvaBase + playerSum + captainBonus + coachPts + formationBonus + factionBonus + lineupMalus;
      if (missingLineup) { factionBonus = 0; total = 0; playerSum = 0; captainBonus = 0; coachPts = 0; formationBonus = 0; }
      h2hByTeam[String(team.id)] = { points: total, starters: starters.length, missing: !!missingLineup };

      payloads.push({
        teamId: team.id,
        teamName: team.name || `Squadra ${parseInt(team.id) + 1}`,
        points: total,
        breakdown: {
          curva: missingLineup ? 0 : curvaBase, players: playerSum, captain: captainBonus, coach: coachPts,
          formation: formationBonus, fazione: factionBonus, malusFormazione: missingLineup ? 0 : lineupMalus
        },
        faction: team.fazione || null,
        lineup,
        missingLineup,
        lineupFrom: missingLineup ? null : lineupFrom,
        captain,
        coachId,
        players: Array.from(playerContribs.values()).map(e => ({ playerId: e.playerId, points: Number((e.points || 0).toFixed(2)), breakdown: e.breakdown || {} })),
        giornata: inp.giornata,
        fromSaved: !!saved.current,
        savedMeta: saved.current ? { by: saved.current.userId || null, at: saved.current.savedAt || null } : null
      });
    }

    const factionTotals = FB ? FB.factionTotals(inp.teams.map(t => ({ id: t.id, fazione: t.fazione })), selCurva, inp.rules, fbCtx) : null;
    return { payloads, h2hByTeam, factionTotals };
  }

  function rawDb() { return root.__LEGACY_DB__ || (root.firebase && root.firebase.firestore()); }

  function venueOf(calendar, giornata) {
    const n = parseInt(String(giornata).replace(/\D/g, ''), 10);
    const m = (calendar || []).find(c => parseInt(c.giornata, 10) === n);
    if (!m) return { venue: null, match: null };
    const isAth = x => /athletic/i.test(x || '');
    return { venue: isAth(m.homeTeam) ? 'casa' : (isAth(m.awayTeam) ? 'trasferta' : null), match: m };
  }

  // Legge dal database tutto ciò che serve al calcolo (nessuna scrittura).
  // opts.rules: regole già caricate (altrimenti quelle attive della lega)
  async function loadInputs(leagueId, giornata, opts) {
    opts = opts || {};
    const db = rawDb();
    const L = 'leagues/' + leagueId;
    let rules = opts.rules;
    if (!rules) {
      const rs = await db.collection(L + '/rules').where('attivo', '==', true).get();
      rules = rs.docs.map(d => Object.assign({ id: d.id }, d.data()));
      if (!rules.length) {
        const gs = await db.collection('rules').where('attivo', '==', true).get();
        rules = gs.docs.map(d => Object.assign({ id: d.id }, d.data()));
      }
      rules = dedupeRules(rules);
    }
    const ts = await db.collection(L + '/teams').orderBy(root.firebase.firestore.FieldPath.documentId()).get();
    const teams = ts.docs.map(d => Object.assign({ id: d.id }, d.data()));

    let fmRule = { usaPrecedente: false, malus: 0 };
    try { if (root.Season) fmRule = (await root.Season.load()).formazioneMancante || fmRule; } catch (_) {}
    const gNow = parseInt(String(giornata).replace(/\D/g, ''), 10) || 0;

    const saved = {};
    for (const team of teams) {
      const ref = db.collection(L + '/teams').doc(team.id).collection('saved');
      const cur = await ref.doc(giornata).get().catch(() => null);
      const entry = { current: cur && cur.exists ? cur.data() : null, prev: [] };
      const hasLineup = entry.current && Array.isArray(entry.current.lineup) && entry.current.lineup.some(Boolean);
      if (fmRule.usaPrecedente && !hasLineup && gNow > 1) {
        for (let k = gNow - 1; k >= 1; k--) {
          const p = await ref.doc('G' + k).get().catch(() => null);
          if (p && p.exists) entry.prev.push({ g: 'G' + k, data: p.data() });
        }
      }
      saved[team.id] = entry;
    }

    let calendar = [];
    try { calendar = (await db.collection('athletic_calendar').get()).docs.map(d => d.data()); } catch (_) {}

    let formation = { enabled: false, value: 5 };
    try {
      if (root.featureFlagsLoader && root.featureFlagsLoader.loadFlags) {
        const f = await root.featureFlagsLoader.loadFlags();
        const b = v => v === true || v === 1 || ['true', '1', 'on', 'yes', 'si', 'sì', 'enabled'].includes(String(v).trim().toLowerCase());
        formation = { enabled: f && f.formation_bonus_enabled !== undefined ? b(f.formation_bonus_enabled) : false,
          value: Number.isFinite(Number(f && f.formation_bonus_value)) ? Number(f.formation_bonus_value) : 5 };
      }
    } catch (_) {}

    return { giornata, rules, teams, saved, fmRule, gNow, calendar, venue: venueOf(calendar, giornata).venue, formation };
  }

  // Imbattibilità (D121): Athletic senza gol subiti → regola "Imbattibilità" a tutti i
  // portieri e difensori, se non è già spuntata a nessuno. Come matchday.html e live.html.
  function withImbattibilita(sel, rules, players, match) {
    const rule = playerRules(rules).find(r => /imbattibil/i.test(r.nome_bonus || r.descrizione || ''));
    if (!rule || !match) return 0;
    const num = v => (v === null || v === undefined || v === '' || isNaN(Number(v))) ? null : Number(v);
    const h = num(match.homeScore), a = num(match.awayScore);
    if (h === null || a === null) return 0;
    const conceded = /athletic/i.test(match.homeTeam || '') ? a : (/athletic/i.test(match.awayTeam || '') ? h : null);
    if (conceded !== 0) return 0;
    const rid = rule.rule_id;
    sel.players = sel.players || {};
    if (Object.values(sel.players).some(s => s && Number(s[rid]) > 0)) return 0;
    const DEF = { Portiere: 1, Difensore: 1, P: 1, D: 1 };
    let n = 0;
    (players || []).filter(p => DEF[p.role || p.ruolo] && !p.fuori_rosa).forEach(p => {
      const id = p.player_id || p.id;
      (sel.players[id] = sel.players[id] || {})[rid] = 1; n++;
    });
    return n;
  }

  // Salva la giornata come "Salva giornata" del Calcolo giornata.
  // o = { leagueId, giornata, sel, stato ('provvisorio'|'definitivo'|null), liveDeadline, adminName, label }
  async function saveDay(o) {
    const db = rawDb();
    const fv = root.firebase.firestore.FieldValue;
    const L = 'leagues/' + o.leagueId;
    const inp = await loadInputs(o.leagueId, o.giornata, { rules: o.rules });
    inp.sel = o.sel;
    const res = computeTeams(inp);
    const uid = ((root.firebase.auth().currentUser) || {}).uid || 'system';

    // 1) giornata: mappe sostituite per intero (D131)
    const dayRef = db.collection(L + '/days').doc(o.giornata);
    await dayRef.set({ giornata: o.giornata, label: o.label || o.giornata, data: o.data || '', players: o.sel.players || {}, coaches: o.sel.coaches || {}, curva: o.sel.curva || {} }, { merge: true });
    await dayRef.update({ players: o.sel.players || {}, coaches: o.sel.coaches || {}, curva: o.sel.curva || {} });
    await dayRef.set({ updatedAt: fv.serverTimestamp(), computedBy: uid, status: 'computed' }, { merge: true });

    // 2) punti delle squadre
    let batch = db.batch(), pending = 0;
    for (const p of res.payloads) {
      batch.set(db.collection(L + '/results').doc(o.giornata).collection('teams').doc(String(p.teamId)), Object.assign({}, p, { updatedAt: fv.serverTimestamp() }), { merge: true });
      if (++pending >= 400) { await batch.commit(); batch = db.batch(); pending = 0; }
    }
    if (pending) await batch.commit();

    // 3) scontri diretti (solo se la Stagione li prevede)
    const warnings = [];
    try {
      if (root.H2H && root.Season) await root.H2H.saveDay(o.leagueId, await root.Season.load(), o.giornata, res.h2hByTeam);
    } catch (e) { console.warn('[day-calc] scontri diretti', e); warnings.push('scontri diretti'); }

    // 4) bonus di fazione
    try {
      if (res.factionTotals) await db.collection(L + '/results').doc(o.giornata).set({ faction_bonus: res.factionTotals, factionBonusAt: fv.serverTimestamp() }, { merge: true });
    } catch (e) { console.warn('[day-calc] bonus di fazione', e); warnings.push('bonus di fazione'); }

    await dayRef.update({ computed: true });

    // 5) provvisori/definitivi (avviso ai giocatori) e live "calcolata"
    if (o.stato === 'provvisorio' || o.stato === 'definitivo') {
      await db.collection(L + '/results').doc(o.giornata).set({ stato: o.stato, revisioneEntro: o.stato === 'provvisorio' ? (o.liveDeadline || null) : null, statoAt: fv.serverTimestamp() }, { merge: true });
      await db.collection(L + '/live').doc(o.giornata).set({ calcolato: o.stato, calcolatoAt: Date.now() }, { merge: true });
    }

    // 6) notifica ai giocatori
    try { if (typeof root.notifyGiornataCalcolata === 'function') await root.notifyGiornataCalcolata(o.giornata, o.adminName || 'Admin'); }
    catch (e) { console.warn('[day-calc] notifica', e); }

    // 7) mini-gioco, se il risultato c'è e restano voti non contati
    let contest = null;
    try { if (root.ContestScoring && root.ContestScoring.ensureScored) contest = await root.ContestScoring.ensureScored(db, o.giornata, o.leagueId); }
    catch (e) { console.warn('[day-calc] mini-gioco', e); warnings.push('mini-gioco'); }

    try { root.dispatchEvent && root.dispatchEvent(new CustomEvent('results-updated', { detail: { giornata: o.giornata } })); } catch (_) {}
    return { teams: res.payloads.length, payloads: res.payloads, factionTotals: res.factionTotals, contest, warnings };
  }

  const api = { dedupeRules, playerRules, coachRules, curvaRules, curvaTotal, pickLineup, computeTeams, loadInputs, venueOf, withImbattibilita, saveDay };
  root.DayCalc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
