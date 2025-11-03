// Gestione UI Accedi/Esci per Fanta Athletic 2018
(function(){
  'use strict';

  function updateAuthUI() {
    // Aspetta che Firebase sia pronto
    if (typeof firebase === 'undefined' || !firebase.auth) {
      setTimeout(updateAuthUI, 100);
      return;
    }

    firebase.auth().onAuthStateChanged(function(user){
      // Trova tutti i link "Accedi" nella navbar
      const authLinks = document.querySelectorAll('nav.nav a[href*="auth.html"]');
      
      authLinks.forEach(link => {
        if (user) {
          // Utente loggato
          link.textContent = '🚪 Esci';
          link.onclick = function(e) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
              window.location.href = 'index.html';
            });
          };
        } else {
          // Utente non loggato
          link.textContent = 'Accedi';
          link.onclick = null;
        }
      });
    });
  }

  // Inizializza quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
  } else {
    updateAuthUI();
  }
})();
