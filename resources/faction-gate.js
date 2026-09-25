// Pop-up fazione obbligatorio su tutta l'app (D072): chi non ha ancora
// scelto Curva Morello / Piana vede la finestra non chiudibile di
// faction.js. Dopo la prima verifica ricorda l'esito per la sessione
// (sessionStorage) per non rileggere il database a ogni pagina.
(function() {
  'use strict';

  let tries = 0;
  function start() {
    if (!window.auth || !window.db || !window.FactionSystem) {
      if (++tries > 100) return;
      return setTimeout(start, 100);
    }
    window.auth.onAuthStateChanged(function(user) {
      if (!user) return;
      const key = 'faction_ok_' + user.uid;
      try { if (sessionStorage.getItem(key) === '1') return; } catch (_) {}
      window.FactionSystem.ensure(user).then(function() {
        try { sessionStorage.setItem(key, '1'); } catch (_) {}
      }).catch(function(e) {
        console.warn('[faction-gate] impossibile verificare la fazione', e);
      });
    });
  }
  start();
})();
