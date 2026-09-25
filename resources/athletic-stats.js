// Statistiche dei giocatori VERI dell'Athletic 2018 (D109).
// Si ricavano dagli eventi che gli admin segnano per il fanta in ogni giornata
// (leagues/{lega}/days/{G}.players = { idGiocatore: { idRegola: valore } }):
// un "Gol segnato" nel fanta è un gol vero, un'"Ammonizione" è un giallo vero, ecc.
// Le regole si riconoscono dal NOME (gli id cambiano da lega a lega).
// Usato dalla Home (marcatori della stagione) e da archivio-athletic.html.
(function(root) {
  'use strict';

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

  // Categorie "vere": nome della regola (normalizzato) → categoria
  const CATEGORIES = {
    gol: ['gol segnato', 'gol panchina'],
    assist: ['assist'],
    autogol: ['autogol'],
    gialli: ['ammonizione', 'ammonizione protesta', 'giallo rissa'],
    rossi: ['espulso', 'espulso protesta', 'espulso rissa', 'espulso ultimi 10 min'],
    mvp: ['mvp'],
    presenze: ['convocazione'],
    inviolata: ['porta inviolata'],
    parate: ['parata decisiva'],
    rigoriParati: ['rigore parato'],
    golSubiti: ['gol subiti'],
    rigoriSbagliati: ['rigore sbagliato']
  };
  const LABELS = {
    gol: 'Gol', assist: 'Assist', autogol: 'Autogol', gialli: 'Ammonizioni', rossi: 'Espulsioni',
    mvp: 'MVP', presenze: 'Presenze', inviolata: 'Porta inviolata', parate: 'Parate decisive',
    rigoriParati: 'Rigori parati', golSubiti: 'Gol subiti', rigoriSbagliati: 'Rigori sbagliati'
  };
  const BY_NAME = {};
  Object.keys(CATEGORIES).forEach(k => CATEGORIES[k].forEach(n => { BY_NAME[n] = k; }));

  function ruleName(r) { return r.nome_bonus || r.nome || r.name || r.descrizione || r.rule_id || ''; }

  // Valore di una spunta: contatore → numero, interruttore → 1/0
  function amount(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v === true) return 1;
    if (typeof v === 'string') { const n = Number(v); return isFinite(n) ? n : (v ? 1 : 0); }
    if (v && typeof v === 'object') return amount(v.value != null ? v.value : v.count);
    return 0;
  }

  // Mappa regole: id → { cat | curiosity, name }
  function ruleMap(rules) {
    const m = {};
    (rules || []).forEach(r => {
      const id = r.rule_id || r.id;
      if (!id) return;
      const soggetto = norm(r.soggetto);
      const cat = BY_NAME[norm(ruleName(r))];
      if (cat) m[id] = { cat, name: ruleName(r) };
      else if (!soggetto || soggetto === 'giocatore') m[id] = { curiosity: true, name: ruleName(r) };
    });
    m.__convocato = { cat: 'presenze', name: 'Convocazione' };
    return m;
  }

  function playerName(p) {
    if (!p) return '';
    const full = p.name || p.nome_completo || [p.nome, p.cognome].filter(Boolean).join(' ');
    return p.soprannome && full && norm(p.soprannome) !== norm(full) ? full + ' (' + p.soprannome + ')' : (full || p.soprannome || '');
  }

  // days: [{ id, players }] ; rules: [...] ; players: { id: dati }
  // → { players: { id: { id, name, role, giornate:Set, gol, …, curiosita: { nome: n } } }, giornate: n }
  function compute(days, rules, players) {
    const rm = ruleMap(rules);
    const out = {};
    let giornate = 0;
    (days || []).forEach(d => {
      const sel = d.players || {};
      if (Object.keys(sel).length) giornate++;
      Object.keys(sel).forEach(pid => {
        const ev = sel[pid] || {};
        let row = out[pid];
        if (!row) {
          const info = (players || {})[pid] || {};
          row = out[pid] = { id: pid, name: playerName(info) || pid, role: info.role || '', presenze: 0, curiosita: {} };
          Object.keys(CATEGORIES).forEach(k => { if (k !== 'presenze') row[k] = 0; });
        }
        let present = false;
        Object.keys(ev).forEach(rid => {
          const n = amount(ev[rid]);
          if (!n) return;
          const r = rm[rid];
          if (!r) return;
          if (r.cat === 'presenze') { present = true; return; }
          if (r.cat) { row[r.cat] += n; present = true; return; }
          if (r.curiosity) row.curiosita[r.name] = (row.curiosita[r.name] || 0) + n;
        });
        if (present) row.presenze++;
      });
    });
    // giocatori senza nome (id tecnici) restano con l'id: meglio visibili che persi
    return { players: out, giornate };
  }

  // Classifica per una categoria (solo chi ha almeno 1)
  function top(stats, cat, limit) {
    return Object.values(stats.players).filter(p => p[cat] > 0)
      .sort((a, b) => b[cat] - a[cat] || b.presenze - a.presenze || a.name.localeCompare(b.name, 'it'))
      .slice(0, limit || 100);
  }

  // Curiosità: per ogni voce goliardica, chi l'ha fatta di più
  function curiosities(stats) {
    const best = {};
    Object.values(stats.players).forEach(p => Object.keys(p.curiosita).forEach(k => {
      const n = p.curiosita[k];
      if (!best[k] || n > best[k].n) best[k] = { voce: k, n, players: [p.name] };
      else if (n === best[k].n) best[k].players.push(p.name);
    }));
    return Object.values(best).sort((a, b) => b.n - a.n);
  }

  // Somma più stagioni (per "Tutte le stagioni" e per la scheda giocatore)
  function merge(list) {
    const out = { players: {}, giornate: 0 };
    list.forEach(s => {
      out.giornate += s.giornate;
      Object.values(s.players).forEach(p => {
        const r = out.players[p.id] || (out.players[p.id] = { id: p.id, name: p.name, role: p.role, presenze: 0, curiosita: {} });
        if (!r.name || r.name === r.id) r.name = p.name;
        Object.keys(CATEGORIES).forEach(k => { r[k] = (r[k] || 0) + (p[k] || 0); });
        Object.keys(p.curiosita).forEach(k => { r.curiosita[k] = (r.curiosita[k] || 0) + p.curiosita[k]; });
      });
    });
    return out;
  }

  // Risultati della squadra dal calendario (solo partite con risultato)
  function record(calendar) {
    const r = { giocate: 0, v: 0, n: 0, p: 0, gf: 0, gs: 0, partite: [] };
    (calendar || []).forEach(c => {
      const h = c.homeScore, a = c.awayScore;
      if (typeof h !== 'number' || typeof a !== 'number') return;
      const home = norm(c.homeTeam).includes('athletic');
      const f = home ? h : a, s = home ? a : h;
      r.giocate++; r.gf += f; r.gs += s;
      if (f > s) r.v++; else if (f < s) r.p++; else r.n++;
      r.partite.push(c);
    });
    return r;
  }

  const api = { CATEGORIES, LABELS, ruleMap, compute, top, curiosities, merge, record, playerName, _norm: norm, _amount: amount };
  root.AthleticStats = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
