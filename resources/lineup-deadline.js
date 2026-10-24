// Scadenza delle formazioni (D122): una regola sola per Formazioni e Squadre.
//  1. se un admin ha impostato a mano la scadenza della giornata
//     (leagues/{lega}/deadlines/giornata_N, anche "Sblocco rapido") vale quella:
//     la legge la pagina e la passa qui;
//  2. altrimenti la scadenza è l'orario della partita della giornata nel
//     Calendario Athletic (athletic_calendar) meno BEFORE_MINUTES.
// Senza scadenza manuale né partita in calendario le formazioni restano aperte.
(function (root) {
  'use strict';

  // 1 ora prima del calcio d'inizio (decisione dell'utente 24/10, da confermare con gli admin)
  const BEFORE_MINUTES = 60;

  const MONTHS = ['gennaio','febbraio','marzo','aprile','maggio','giugno',
                  'luglio','agosto','settembre','ottobre','novembre','dicembre'];

  // Anno d'inizio della stagione: da luglio in poi è l'anno corrente (come contest-scoring.js)
  function seasonStartYear(now) {
    const d = now || new Date();
    return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  }

  // "21.15", "21:15", "21" → [21, 15]; mancante → 15:00 (come contest-scoring.js)
  function parseTime(t) {
    const m = String(t == null ? '' : t).match(/(\d{1,2})(?:[:.](\d{2}))?/);
    if (!m) return [15, 0];
    return [parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0];
  }

  // Doc di athletic_calendar ({ month: 'Ottobre', date: '26 ottobre', time: '21.15' }) → Date o null
  function kickoff(cal, startYear) {
    if (!cal) return null;
    const monthIndex = MONTHS.indexOf(String(cal.month || '').trim().toLowerCase());
    const day = parseInt(cal.date, 10);
    if (monthIndex < 0 || isNaN(day)) return null;
    const sy = startYear || seasonStartYear();
    const year = monthIndex >= 6 ? sy : sy + 1;
    const [h, min] = parseTime(cal.time);
    return new Date(year, monthIndex, day, h, min);
  }

  let calP = null;
  function loadCalendar() {
    if (!calP) {
      const db = root.db || (root.firebase && root.firebase.firestore());
      calP = db ? db.collection('athletic_calendar').get()
        .then(s => s.docs.map(d => d.data()))
        .catch(e => { calP = null; console.warn('[scadenza] calendario non letto', e && (e.code || e.message)); return []; })
        : Promise.resolve([]);
    }
    return calP;
  }

  // Scadenza dal calendario per la giornata N: { deadline, kickoff, match } o null
  async function fromCalendar(giornataNum) {
    const list = await loadCalendar();
    const match = list.find(c => parseInt(c.giornata, 10) === giornataNum);
    const k = kickoff(match);
    return k ? { deadline: new Date(k.getTime() - BEFORE_MINUTES * 60000), kickoff: k, match } : null;
  }

  root.FALineupDeadline = { BEFORE_MINUTES, parseTime, kickoff, fromCalendar };
})(window);
