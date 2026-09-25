// Bonus di fazione — logica pura (nessun database), D080.
// Regole con `ambito`:
//   (assente)  = globale: uguale per tutte le squadre (come i bonus "Curva" di sempre)
//   'squadra'  = si spunta per ogni squadra
//                Con `luogo` ('casa'|'trasferta') è una PRESENZA: l'admin spunta solo
//                "presente" per la squadra e il sistema applica il bonus giusto
//                guardando se la partita del calendario è in casa o in trasferta.
//   'fazione'  = evento della fazione, si spunta una volta e vale per tutte le
//                squadre di quella fazione (es. coro contro la piana)
// `fazione` della regola: 'comune' (default) | 'curva' | 'piana'.
// Selezioni salvate nella stessa mappa `curva` della giornata, con chiavi:
//   tm:<idSquadra>:<idRegola>   e   fz:<curva|piana>:<idRegola>
(function(root) {
  'use strict';

  const FACTIONS = ['curva', 'piana'];
  const PRESENCE = 'presenza';   // chiave: tm:<squadra>:presenza

  function isScoped(rule) {
    return !!rule && (rule.ambito === 'squadra' || rule.ambito === 'fazione');
  }

  function ruleId(rule) { return String((rule && (rule.rule_id || rule.id)) || ''); }

  function isCounter(rule) {
    const t = rule.input_type || rule.input;
    return t === 'counter';
  }

  function points(rule, n) {
    const v = Number(rule.valore || 0);
    const k = Number(n || 0);
    if (!k) return 0;
    return isCounter(rule) ? k * v : v;
  }

  function round(x) { return Math.round(x * 2) / 2; }

  function active(rules) {
    return (rules || []).filter(r => isScoped(r) && r.attivo !== false && r.visible !== false);
  }

  // La regola per squadra vale per questa squadra? ('comune' o la sua fazione)
  function appliesToTeam(rule, faction) {
    const f = rule.fazione || 'comune';
    return f === 'comune' || f === faction;
  }

  // ctx = { venue: 'casa'|'trasferta'|null } dal calendario della giornata
  function isPresent(teamId, sel) {
    return Number((sel || {})['tm:' + teamId + ':' + PRESENCE] || 0) > 0;
  }

  // Bonus per squadra: presenza + altri bonus per squadra + eventi della sua fazione
  function teamBonus(teamId, faction, sel, rules, ctx) {
    let squadra = 0, fazione = 0;
    const venue = ctx && ctx.venue;
    active(rules).forEach(r => {
      if (r.ambito === 'squadra' && r.luogo) {
        if (isPresent(teamId, sel) && venue === r.luogo && appliesToTeam(r, faction)) squadra += Number(r.valore || 0);
      } else if (r.ambito === 'squadra' && appliesToTeam(r, faction)) {
        squadra += points(r, (sel || {})['tm:' + teamId + ':' + ruleId(r)]);
      } else if (r.ambito === 'fazione' && faction && r.fazione === faction) {
        fazione += points(r, (sel || {})['fz:' + faction + ':' + ruleId(r)]);
      }
    });
    return { squadra: round(squadra), fazione: round(fazione), total: round(squadra + fazione) };
  }

  // Punti bonus della classifica di fazione: le presenze di tutte le squadre
  // della fazione + ogni evento della fazione contato UNA volta.
  // teams: [{ id, fazione }]
  function factionTotals(teams, sel, rules, ctx) {
    const out = {};
    FACTIONS.forEach(f => { out[f] = { squadre: 0, eventi: 0, total: 0 }; });
    (teams || []).forEach(t => {
      if (!out[t.fazione]) return;
      const b = teamBonus(t.id, t.fazione, sel, rules, ctx);
      out[t.fazione].squadre += b.squadra;
    });
    FACTIONS.forEach(f => {
      active(rules).forEach(r => {
        if (r.ambito === 'fazione' && r.fazione === f) {
          out[f].eventi += points(r, (sel || {})['fz:' + f + ':' + ruleId(r)]);
        }
      });
      out[f].squadre = round(out[f].squadre);
      out[f].eventi = round(out[f].eventi);
      out[f].total = round(out[f].squadre + out[f].eventi);
    });
    return out;
  }

  const api = { FACTIONS, PRESENCE, isPresent, isScoped, ruleId, isCounter, points, appliesToTeam, teamBonus, factionTotals };
  root.FactionBonus = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
