// Gestione tema scuro persistente per Fanta Athletic 2018
(function() {
  'use strict';

  // Carica tema IMMEDIATAMENTE (prima del DOM)
  const savedTheme = localStorage.getItem('fantaAthletic_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Toggle tema
  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('fantaAthletic_theme', isDark ? 'dark' : 'light');
    
    // Update icon
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = isDark ? '☀️' : '🌙';
    }
    
    // Aggiorna pulsante tema
    updateThemeButton();
    
    return isDark;
  }

  // Aggiorna icona pulsante tema
  function updateThemeButton() {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      const isDark = document.documentElement.classList.contains('dark');
      btn.textContent = isDark ? '☀️' : '🌙';
      btn.title = isDark ? 'Modalità chiara' : 'Modalità scura';
    }
  }

  // Esporta funzioni globali
  window.toggleTheme = toggleTheme;
  window.updateThemeButton = updateThemeButton;

  // Gestione scroll navbar
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const header = document.querySelector('header');
    
    if (header) {
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    lastScroll = currentScroll;
  });

  // Inizializza pulsante tema quando il DOM è pronto
  function initThemeButton() {
    updateThemeButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeButton);
  } else {
    initThemeButton();
  }
})();
