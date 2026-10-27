// Squadra solo con invito a stagione in corso (D130).
// A stagione "in_corso" (leagues/{lega}/config/season.stato) chi non è admin non può
// scegliersi una squadra: ci entra solo con il codice invito di un compagno (T-…).
// Le regole del database fanno lo stesso controllo (teamJoinAllowed in firestore.rules);
// qui serve a non mostrare la scelta e a spiegare cosa fare.
//  - TeamJoinLock.locked(leagueId, uid) → true se la scelta libera è chiusa
//  - TeamJoinLock.html() → riquadro con la spiegazione e il link per scrivere il codice
(function (root) {
  'use strict';

  function raw() { return root.__LEGACY_DB__ || root.firebase.firestore(); }

  async function locked(leagueId, uid) {
    if (!leagueId) return false;
    try {
      if (uid && (await raw().collection('admins').doc(uid).get()).exists) return false;
    } catch (e) {}
    try {
      const s = await raw().collection('leagues/' + leagueId + '/config').doc('season').get();
      return s.exists && s.data().stato === 'in_corso';
    } catch (e) { return false; } // se non si legge decide il database
  }

  function html() {
    return '<div style="padding:16px;border-radius:14px;background:rgba(250,204,21,.12);border:1px solid rgba(250,204,21,.45);line-height:1.5;font-size:14px;text-align:left;">' +
      '<b>La stagione è in corso</b>: in una squadra si entra solo con l\'invito di un compagno.<br>' +
      'Chiedi a chi è già nella squadra di aprire <b>Formazioni › Invita vice-allenatori</b> e di mandarti il codice (inizia con <b>T-</b>).' +
      '<div style="margin-top:12px;"><a href="join-team.html" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#16a34a;color:#fff;font-weight:700;text-decoration:none;">Ho un codice invito</a></div></div>';
  }

  root.TeamJoinLock = { locked, html };
})(typeof window !== 'undefined' ? window : globalThis);
