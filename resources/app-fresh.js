// App sempre aggiornata alla riapertura (D120)
// Quando si riapre l'app (iPhone e Android) il telefono spesso NON ricarica la
// pagina: rimostra quella tenuta in memoria, magari di giorni prima, e le
// novità compaiono solo cambiando scheda. Qui: all'apertura della pagina ci si
// segna la sua "impronta" (ETag del server, cambia quando la pagina cambia);
// quando l'app torna in primo piano la si richiede (una richiesta minuscola,
// senza contenuto) e, se è diversa, cioè se nel frattempo abbiamo pubblicato,
// la pagina si ricarica da sola. Se non è cambiato niente non succede nulla.
// Non incluso in live.html e matchday.html: lì ci possono essere dati di
// partita non ancora salvati.
(function () {
  'use strict';
  if (!window.fetch || !document.addEventListener) return;

  var base = null, checking = false, lastCheck = 0;

  function fingerprint() {
    return fetch(location.pathname, { method: 'HEAD', cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) return null;
        // l'ETag di Firebase finisce con la compressione usata (-br, -gzip): la togliamo
        var tag = r.headers.get('etag');
        if (tag) return tag.replace(/-(br|gzip|deflate)"?$/, '').replace(/"/g, '');
        return r.headers.get('last-modified');
      })
      .catch(function () { return null; });
  }

  function check() {
    if (checking || !base) return;
    if (Date.now() - lastCheck < 30000) return; // al massimo una volta ogni 30 secondi
    checking = true;
    lastCheck = Date.now();
    fingerprint().then(function (tag) {
      checking = false;
      if (tag && tag !== base) location.reload();
    });
  }

  fingerprint().then(function (tag) { base = tag; });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') check();
  });
  // pagina ripresa dalla memoria del browser (tasto indietro, app riaperta)
  window.addEventListener('pageshow', function (e) { if (e.persisted) check(); });
})();
