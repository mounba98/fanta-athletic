// Archivio stagioni e apertura della stagione nuova (D087).
//
// ARCHIVIA (non cancella niente): copia ogni documento della stagione in
//   leagues/{lega}/archive/{stagione}            → riepilogo (classifica, conteggi, stato)
//   leagues/{lega}/archive/{stagione}/items/{id} → { kind, path, data } uno per documento
// poi rilegge l'archivio e confronta i conteggi con l'originale: solo se
// tornano tutti lo stato diventa "verificato".
//
// NUOVA STAGIONE (cancella): possibile solo con archivio "verificato" della
// stagione in corso. Azzera giornate, risultati, formazioni, mini-gioco,
// calendario Athletic, Partita live (D095) e rose (l'asta si rifà ogni anno, D086). Restano:
// utenti, lega, squadre (nome, fazione, allenatori), giocatori, regole.
(function(root) {
  'use strict';

  const MAX_G = 50;          // giornate sondate una per una (i "cassetti" dei risultati non sono elencabili)
  const BATCH = 400;

  function raw() { return root.__LEGACY_DB__ || root.firebase.firestore(); }
  function FV() { return root.firebase.firestore.FieldValue; }
  function itemId(path) { return path.replace(/\//g, '|'); }

  async function listDocs(col, kind, out) {
    const snap = await col.get();
    snap.docs.forEach(d => out.push({ kind, path: d.ref.path, ref: d.ref, data: d.data() }));
    return snap.docs;
  }

  // Tutto ciò che appartiene alla stagione. step(msg) per mostrare l'avanzamento.
  async function collect(lid, season, step) {
    const db = raw();
    const L = db.collection('leagues').doc(lid);
    const out = [];
    const say = m => step && step(m);

    say('Lega e impostazioni');
    const lg = await L.get();
    out.push({ kind: 'league', path: lg.ref.path, ref: lg.ref, data: lg.data() });
    const cfg = await L.collection('config').doc('season').get();
    if (cfg.exists) out.push({ kind: 'season_config', path: cfg.ref.path, ref: cfg.ref, data: cfg.data() });

    say('Squadre e formazioni salvate');
    const teams = await listDocs(L.collection('teams'), 'teams', out);
    for (const t of teams) await listDocs(t.ref.collection('saved'), 'saved', out);

    for (const c of ['players', 'coaches', 'rules', 'days', 'matchday_temp', 'deadlines', 'posts']) {
      say('Raccolta: ' + c);
      await listDocs(L.collection(c), c, out);
    }

    say('Risultati, giornata per giornata');
    const resParents = await L.collection('results').get();
    resParents.docs.forEach(d => out.push({ kind: 'results', path: d.ref.path, ref: d.ref, data: d.data() }));
    const gs = [];
    for (let i = 1; i <= MAX_G; i++) gs.push('G' + i);
    await Promise.all(gs.map(g => listDocs(L.collection('results').doc(g).collection('teams'), 'results_teams', out)));

    say('Scontri diretti');
    const key = (season && season.h2h && season.h2h.key) || '2024-25';
    await listDocs(L.collection('h2h_schedule').doc(key).collection('giornate'), 'h2h_schedule', out);
    await listDocs(L.collection('h2h_results').doc(key).collection('giornate'), 'h2h_results', out);

    say('Partita live');
    const lives = await listDocs(L.collection('live'), 'live', out);
    for (const lv of lives) await listDocs(lv.ref.collection('sheets'), 'live_sheets', out);

    say('Calendario Athletic e mini-gioco');
    await listDocs(db.collection('athletic_calendar'), 'athletic_calendar', out);
    await listDocs(db.collection('contest_predictions'), 'contest_predictions', out);
    await listDocs(db.collection('contest_standings'), 'contest_standings', out);

    return out;
  }

  function countByKind(items) {
    const c = {};
    items.forEach(i => { c[i.kind] = (c[i.kind] || 0) + 1; });
    return c;
  }

  // Classifica finale (somma dei punti di ogni giornata) per il riepilogo
  function standings(items) {
    const names = {};
    items.filter(i => i.kind === 'teams').forEach(i => { names[i.ref.id] = (i.data && i.data.name) || ('Squadra ' + i.ref.id); });
    const tot = {};
    items.filter(i => i.kind === 'results_teams').forEach(i => {
      const id = i.ref.id;
      const g = i.ref.parent.parent.id;
      tot[id] = tot[id] || { teamId: id, name: names[id] || ('Squadra ' + id), total: 0, days: 0, byDay: {} };
      const p = Number(i.data && i.data.points) || 0;
      tot[id].total += p; tot[id].days += 1; tot[id].byDay[g] = p;
    });
    return Object.values(tot)
      .map(t => Object.assign(t, { total: Math.round(t.total * 2) / 2 }))
      .sort((a, b) => b.total - a.total);
  }

  async function writeInChunks(ops, step, label) {
    const db = raw();
    for (let i = 0; i < ops.length; i += BATCH) {
      const b = db.batch();
      ops.slice(i, i + BATCH).forEach(fn => fn(b));
      await b.commit();
      step && step(label + ' ' + Math.min(i + BATCH, ops.length) + '/' + ops.length);
    }
  }

  function archiveRef(lid, seasonId) {
    return raw().collection('leagues').doc(lid).collection('archive').doc(seasonId);
  }

  async function archiveSeason(lid, season, step) {
    const user = root.auth && root.auth.currentUser;
    const items = await collect(lid, season, step);
    const counts = countByKind(items);
    const ref = archiveRef(lid, season.id);

    await ref.set({
      id: season.id, label: season.label, stato: 'in_copia',
      startedAt: FV().serverTimestamp(), archivedBy: user ? user.uid : null,
      counts, total: items.length
    }, { merge: true });

    await writeInChunks(items.map(it => b => b.set(ref.collection('items').doc(itemId(it.path)),
      { kind: it.kind, path: it.path, data: it.data || {} })), step, 'Copia');

    const league = items.find(i => i.kind === 'league');
    await ref.set({
      stato: 'copiato', archivedAt: FV().serverTimestamp(),
      standings: standings(items),
      leagueName: league && league.data ? league.data.name || null : null,
      season: JSON.parse(JSON.stringify(season))
    }, { merge: true });

    return verify(lid, season.id, step);
  }

  // Rilegge l'archivio e confronta con i conteggi registrati alla copia
  async function verify(lid, seasonId, step) {
    step && step('Verifica della copia');
    const ref = archiveRef(lid, seasonId);
    const head = await ref.get();
    if (!head.exists) return { ok: false, problems: ['Archivio inesistente'] };
    const expected = head.data().counts || {};
    const snap = await ref.collection('items').get();
    const found = {};
    snap.docs.forEach(d => { const k = d.data().kind; found[k] = (found[k] || 0) + 1; });
    const problems = [];
    Object.keys(expected).forEach(k => { if ((found[k] || 0) !== expected[k]) problems.push(k + ': attesi ' + expected[k] + ', trovati ' + (found[k] || 0)); });
    const ok = problems.length === 0 && snap.size === head.data().total;
    await ref.set({ stato: ok ? 'verificato' : 'incompleto', verifiedAt: FV().serverTimestamp(), problems }, { merge: true });
    return { ok, problems, counts: found, total: snap.size };
  }

  async function list(lid) {
    const snap = await raw().collection('leagues').doc(lid).collection('archive').get();
    return snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
  }

  async function items(lid, seasonId, kind) {
    const snap = await archiveRef(lid, seasonId).collection('items').where('kind', '==', kind).get();
    return snap.docs.map(d => d.data());
  }

  // Cosa verrebbe cancellato/azzerato (per mostrarlo prima di confermare)
  function resetPlan(items) {
    const del = ['saved', 'days', 'matchday_temp', 'deadlines', 'results_teams', 'results', 'live_sheets', 'live',
                 'athletic_calendar', 'contest_predictions', 'contest_standings'];
    const c = countByKind(items);
    return {
      delete: del.filter(k => c[k]).map(k => ({ kind: k, n: c[k] })),
      emptyRosters: c.teams || 0
    };
  }

  async function startNewSeason(lid, current, next, step) {
    const head = await archiveRef(lid, current.id).get();
    if (!head.exists || head.data().stato !== 'verificato') {
      throw new Error('Prima serve l\'archivio VERIFICATO della stagione ' + current.label);
    }
    const all = await collect(lid, current, step);
    const plan = resetPlan(all);
    const kinds = new Set(plan.delete.map(p => p.kind));
    const ops = all.filter(i => kinds.has(i.kind)).map(i => b => b.delete(i.ref));
    all.filter(i => i.kind === 'teams').forEach(i => ops.push(b => b.update(i.ref, { roster: [] })));
    await writeInChunks(ops, step, 'Azzeramento');

    const db = raw();
    const user = root.auth && root.auth.currentUser;
    const cfg = JSON.parse(JSON.stringify(next));
    delete cfg.leagueId; delete cfg.saved;
    cfg.updatedAt = FV().serverTimestamp();
    cfg.updatedBy = user ? user.uid : null;
    cfg.previous = current.id;
    await db.collection('leagues').doc(lid).collection('config').doc('season').set(cfg);
    await db.collection('leagues').doc(lid).update({ season: next.label.replace(/^(\d{4})\/(\d{2})$/, (m, a, b) => a + '/20' + b) });
    step && step('Stagione ' + next.label + ' aperta');
    return plan;
  }

  const api = { collect, countByKind, standings, archiveSeason, verify, list, items, resetPlan, startNewSeason, archiveRef };
  root.SeasonArchive = api;
})(typeof window !== 'undefined' ? window : globalThis);
