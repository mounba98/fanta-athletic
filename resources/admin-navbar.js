// AUTO-LOAD ADMIN NAVBAR
(function() {
  // Check if this is an admin page
  const isAdminPage = window.location.pathname.includes('admin');
  if (!isAdminPage) return;
  if (document.body) {
    document.body.dataset.disableAutoHeader = 'true';
  }
  
  // Create navbar HTML
  const navbarHTML = `
<style>
.admin-navbar {
  background: linear-gradient(135deg, #dc2626, #2d6cdf);
  padding: 15px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.admin-navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
.admin-navbar-brand {
  color: white;
  font-size: 24px;
  font-weight: 900;
  text-decoration: none;
}
.admin-navbar-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.admin-navbar-links a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
  font-size: 14px;
}
.admin-navbar-links a:hover {
  opacity: 0.8;
}
@media (max-width: 768px) {
  .admin-navbar-links {
    gap: 10px;
  }
  .admin-navbar-links a {
    font-size: 12px;
  }
}
</style>

<nav class="admin-navbar">
  <div class="container">
    <a href="admin.html" class="admin-navbar-brand">🔧 Admin Hub</a>
    <div class="admin-navbar-links">
      <a href="index.html">🏠 Home</a>
      <a href="admin-rules.html">📋 Regole</a>
      <a href="admin-calendario.html">📅 Calendario</a>
      <a href="admin-setup.html">⚙️ Setup</a>
      <a href="admin-squadre.html">👥 Squadre</a>
      <a href="admin-players.html">🏃 Giocatori</a>
      <a href="matchday.html">⚽ Matchday</a>
      <a href="classifiche.html">🏆 Classifiche</a>
    </div>
  </div>
</nav>
`;
  
  // Insert at start of body
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.firstChild) {
      document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }
  });
})();
