// Carica il tema salvato quanto prima per evitare flash
(function() {
  try {
    const savedTheme = localStorage.getItem('fantaAthletic_theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } catch (_) {
    // Se localStorage non è disponibile, resta in tema chiaro
  }
})();
