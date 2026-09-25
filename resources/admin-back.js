// Link "← Pannello admin" in cima alle pagine admin (D097).
// Uso: <script src="resources/admin-back.js?v=…" data-block="squadre" defer></script>
// data-block = id del blocco di admin.html a cui tornare (live, stagione,
// squadre, regole, minigioco, archivio). Se la pagina ha già un link
// a.back verso admin.html non aggiunge nulla.
(function () {
  'use strict';
  var me = document.currentScript;
  var block = (me && me.getAttribute('data-block')) || '';

  function add() {
    if (document.querySelector('a.back[href^="admin.html"], a.admin-back')) return;
    if (!document.getElementById('admin-back-css')) {
      var st = document.createElement('style');
      st.id = 'admin-back-css';
      st.textContent =
        'a.admin-back{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;justify-self:start;width:auto;' +
        'max-width:max-content;margin:10px 16px 6px;padding:7px 16px;border-radius:999px;' +
        'font:600 14px/1.2 Inter,system-ui,sans-serif;color:#fff !important;' +
        'background:linear-gradient(135deg,#0c0f6d,#1b1f8a);border:1px solid rgba(255,255,255,.18);' +
        'box-shadow:0 2px 6px rgba(0,0,0,.18);text-decoration:none;position:relative;z-index:5}' +
        'a.admin-back:hover{filter:brightness(1.15)}';
      document.head.appendChild(st);
    }
    var a = document.createElement('a');
    a.className = 'admin-back';
    a.href = 'admin.html' + (block ? '#' + block : '');
    a.textContent = '← Pannello admin';
    var target = document.querySelector('main') || document.querySelector('.container') || document.body;
    target.insertBefore(a, target.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
})();
