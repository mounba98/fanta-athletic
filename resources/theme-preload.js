// Carica tema IMMEDIATAMENTE per evitare flash
(function() {
  const savedTheme = localStorage.getItem('fantaAthletic_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
