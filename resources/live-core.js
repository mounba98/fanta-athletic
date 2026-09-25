// Partita live — logica pura (nessun database), D093.
// Ogni admin compila un "foglio" con lo stesso formato delle selezioni di
// matchday.html:  players[pid][ruleId] = n,  coaches[cid][ruleId] = n,
// curva[chiave] = n  (chiave = ruleId, tm:<squadra>:<regola|presenza>, fz:<fazione>:<regola>)
// Al fischio finale i fogli si incrociano: le voci uguali diventano i punti
// provvisori, quelle diverse vanno in revisione.
(function(root) {
  'use strict';

  // Stesse regole "ripetibili" di matchday.html (righe REPEATABLE_*): se si
  // cambiano là vanno cambiate anche qui.
  const REPEATABLE = {
    players: new Set(['R040','R041','R042','R072','R075','R089','R097','R044','R045','R056','R057','R058','R061','R070','R063','R073','R092']),
    coaches: new Set(['R020','R036']),
    curva: new Set(['R008','R027','R028','R029','R015','R003','R002'])
  };
  const MAX = { players: 10, coaches: 10, curva: 50 };
  // La convocazione si segna con la regola "Convocazione" (R099, +1), come fanno gli
  // admin dalla G4 in poi. Il vecchio '__convocato' non si usa (nella G3 contava doppio, D093).
  const SPECIAL_CURVA = 'infortunati_squalificati_curva';

  function isScoped(r) { return !!r && (r.ambito === 'squadra' || r.ambito === 'fazione'); }
  function rid(r) { return String(r.rule_id || r.id || ''); }
  function label(r) { return r.nome_bonus || r.descrizione || r.nome || rid(r); }

  function inputOf(r, scope) {
    let t = r.input_type || r.input;
    if (!t || t === 'auto') t = REPEATABLE[scope].has(rid(r)) ? 'counter' : 'toggle';
    return t;
  }

  // Divide le regole attive per "chi" riguardano, come matchday.html
  function groupRules(rules) {
    // un solo documento per rule_id (nel database alcune regole sono doppie): vince 'ordine' più basso
    const byId = new Map();
    (rules || []).filter(r => r && r.attivo !== false && r.visible !== false).forEach(r => {
      const k = rid(r), cur = byId.get(k);
      const o = x => typeof x.ordine === 'number' ? x.ordine : Infinity;
      if (!cur || o(r) < o(cur) || (o(r) === o(cur) && !cur.soggetto && r.soggetto)) byId.set(k, r);
    });
    const ok = [...byId.values()];
    const pick = (scope, f) => ok.filter(f).map(r => Object.assign({}, r, { rule_id: rid(r), input: inputOf(r, scope), max: inputOf(r, scope) === 'counter' ? MAX[scope] : 1 }));
    return {
      players: pick('players', r => r.soggetto === 'Giocatore'),
      coaches: pick('coaches', r => r.soggetto === 'Allenatore'),
      curva: pick('curva', r => r.soggetto === 'Curva' && !isScoped(r)),
      scoped: ok.filter(isScoped)
    };
  }

  function emptySheet() { return { players: {}, coaches: {}, curva: {}, log: [] }; }

  // Aggiunge/toglie un'unità. target = pid | cid | null (curva)
  function bump(sheet, scope, target, key, delta, rule) {
    const max = rule ? (rule.input === 'counter' ? rule.max : 1) : (scope === 'curva' ? MAX.curva : 1);
    const box = scope === 'curva' ? sheet.curva : (sheet[scope][target] = sheet[scope][target] || {});
    const before = Number(box[key] || 0);
    const after = Math.max(0, Math.min(max, before + delta));
    if (after === before) return false;
    if (after === 0) delete box[key]; else box[key] = after;
    if (scope !== 'curva' && !Object.keys(box).length) delete sheet[scope][target];
    sheet.log.push({ at: Date.now(), scope, target: target || null, key, delta: after - before });
    return true;
  }

  function undo(sheet) {
    const last = sheet.log.pop();
    if (!last) return null;
    const box = last.scope === 'curva' ? sheet.curva : (sheet[last.scope][last.target] = sheet[last.scope][last.target] || {});
    const v = Number(box[last.key] || 0) - last.delta;
    if (v <= 0) delete box[last.key]; else box[last.key] = v;
    if (last.scope !== 'curva' && !Object.keys(box).length) delete sheet[last.scope][last.target];
    return last;
  }

  // Foglio → mappa piatta "p|pid|regola" = n
  function flat(sheet) {
    const out = {};
    ['players', 'coaches'].forEach(sc => Object.entries((sheet && sheet[sc]) || {}).forEach(([t, m]) =>
      Object.entries(m || {}).forEach(([k, v]) => { if (Number(v)) out[sc[0] + '|' + t + '|' + k] = Number(v); })));
    Object.entries((sheet && sheet.curva) || {}).forEach(([k, v]) => { if (Number(v)) out['v||' + k] = Number(v); });
    return out;
  }

  function unflat(map) {
    const s = { players: {}, coaches: {}, curva: {} };
    Object.entries(map || {}).forEach(([key, v]) => {
      if (!Number(v)) return;
      const [sc, t, ...rest] = key.split('|');
      const k = rest.join('|');
      if (sc === 'v') s.curva[k] = Number(v);
      else { const box = sc === 'p' ? s.players : s.coaches; (box[t] = box[t] || {})[k] = Number(v); }
    });
    return s;
  }

  // Incrocio di 1 o 2 fogli. Con un foglio solo vale tutto (D092).
  function merge(sheets) {
    const list = (sheets || []).filter(Boolean);
    if (list.length <= 1) return { agreed: flat(list[0] || {}), disputes: [] };
    const A = flat(list[0]), B = flat(list[1]);
    const agreed = {}, disputes = [];
    new Set([...Object.keys(A), ...Object.keys(B)]).forEach(k => {
      const a = A[k] || 0, b = B[k] || 0;
      if (a === b) agreed[k] = a; else disputes.push({ key: k, a, b });
    });
    return { agreed, disputes };
  }

  // Versione finale = concordi + decisioni sulle discrepanze + correzioni
  function finalMap(agreed, resolutions, corrections) {
    const out = Object.assign({}, agreed || {});
    Object.entries(resolutions || {}).forEach(([k, v]) => { if (Number(v)) out[k] = Number(v); else delete out[k]; });
    (corrections || []).forEach(c => { if (Number(c.value)) out[c.key] = Number(c.value); else delete out[c.key]; });
    return out;
  }

  function convocationRule(playerRules) {
    return (playerRules || []).find(r => /^convocazione$/i.test(label(r)));
  }

  // Punti di una mappa di selezioni per un gruppo di regole (stesso calcolo di matchday)
  function points(sel, rules) {
    let t = (rules || []).reduce((s, r) => {
      const v = Number((sel || {})[r.rule_id] || 0);
      return s + (r.input === 'counter' ? v * Number(r.valore) : (v ? Number(r.valore) : 0));
    }, 0);
    return Math.round(t * 2) / 2;
  }

  // Scorciatoie: le voci più usate, trovate per nome
  function shortcuts(playerRules) {
    const find = re => playerRules.find(r => re.test(label(r)));
    return [
      { icon: '⚽', text: 'Gol', rule: find(/^gol segnato/i) },
      { icon: '🅰️', text: 'Assist', rule: find(/^assist/i) },
      { icon: '🟨', text: 'Giallo', rule: find(/^ammonizione$/i) || find(/^ammonizione/i) },
      { icon: '🟥', text: 'Rosso', rule: find(/^espulso$/i) || find(/^espuls/i) }
    ].filter(s => s.rule);
  }

  const api = { REPEATABLE, SPECIAL_CURVA, convocationRule, groupRules, label, rid, emptySheet, bump, undo, flat, unflat, merge, finalMap, points, shortcuts };
  root.LiveCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
