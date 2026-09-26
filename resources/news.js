// Novità dell'app (D116): comunicati sugli aggiornamenti, scritti in resources/news.json
// e pubblicati insieme al sito (niente database, niente regole Firestore).
//  - audience 'all' = tutti, 'admin' = solo admin (contrassegnate "Solo admin").
//  - "già lette" ricordate su questo dispositivo (localStorage fa_news_seen); su un
//    dispositivo nuovo le novità più vecchie di 30 giorni contano come già lette.
//  - FANews.homeCard(el): casella in Home; FANews.popup(): finestra all'apertura con
//    l'ultima novità non letta (mai sopra la finestra obbligatoria di tifoseria/allenatore).
//  - FANews.renderList(el): elenco completo, nella scheda "Novità app" della Bacheca
//    (bacheca.html#novita); segna tutto come letto.
//  - Etichette "New" con data-new-until="AAAA-MM-GG": spariscono da sole dopo quella data.
(function (root) {
  'use strict';

  const SEEN_KEY = 'fa_news_seen';
  const INIT_KEY = 'fa_news_init';
  let dataP = null, adminP = null;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);

  function load() {
    if (!dataP) dataP = fetch('resources/news.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { news: [] })
      .then(j => (j.news || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)) || (a.audience === 'admin') - (b.audience === 'admin')))
      .catch(() => []);
    return dataP;
  }

  function currentUser() {
    return new Promise(resolve => {
      try {
        if (!root.firebase || !root.firebase.auth) return resolve(null);
        const off = root.firebase.auth().onAuthStateChanged(u => { off(); resolve(u || null); });
      } catch (e) { resolve(null); }
    });
  }

  function isAdmin() {
    if (!adminP) adminP = (async () => {
      const u = await currentUser();
      if (!u) return false;
      try {
        const db = root.__LEGACY_DB__ || root.firebase.firestore();
        return (await db.collection('admins').doc(u.uid).get()).exists;
      } catch (e) { return false; }
    })();
    return adminP;
  }

  function getSeen() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch (e) { return []; }
  }
  function setSeen(ids) {
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(new Set(ids)).slice(-200))); } catch (e) {}
  }
  function markSeen(ids) { setSeen(getSeen().concat(ids)); }

  async function visible() {
    const [list, admin] = await Promise.all([load(), isAdmin()]);
    return { list: list.filter(n => n.audience !== 'admin' || admin), admin };
  }

  async function unread() {
    const { list } = await visible();
    // primo avvio su questo dispositivo: le novità vecchie contano come lette
    try {
      if (!localStorage.getItem(INIT_KEY)) {
        const limit = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
        markSeen(list.filter(n => String(n.date) < limit).map(n => n.id));
        localStorage.setItem(INIT_KEY, today());
      }
    } catch (e) {}
    const seen = new Set(getSeen());
    return list.filter(n => !seen.has(n.id));
  }

  function itemsHtml(n) {
    return (n.intro ? '<p style="margin:0 0 4px">' + n.intro + '</p>' : '') +
      '<ul>' + (n.items || []).map(i => '<li>' + i + '</li>').join('') + '</ul>';
  }

  async function homeCard(el) {
    if (!el) return;
    const [{ list }, un] = await Promise.all([visible(), unread()]);
    const last = un[0] || list[0];
    if (!last) { el.hidden = true; return; }
    el.hidden = false;
    el.href = 'bacheca.html#novita';
    el.innerHTML = (un.length ? '<span class="fa-new">New</span>' : '') +
      '<span class="ic">' + esc(last.icon || '📣') + '</span>' +
      '<span class="tx"><span class="k">Novità dell\'app' + (un.length ? '<span class="fa-news-dot">' + un.length + '</span>' : '') + '</span>' +
      '<span class="t">' + esc(last.title) + '</span></span><span class="go">Leggi →</span>';
  }

  async function popup() {
    const un = await unread();
    if (!un.length) return;
    await new Promise(r => setTimeout(r, 1500));
    if (document.getElementById('factionOverlay') || document.querySelector('.fa-news-veil')) return;
    const n = un[0];
    const veil = document.createElement('div');
    veil.className = 'fa-news-veil';
    veil.setAttribute('role', 'dialog');
    veil.setAttribute('aria-modal', 'true');
    const more = un.length > 1 ? ' (e altre ' + (un.length - 1) + ')' : '';
    veil.innerHTML = '<div class="fa-news-box"><div class="hd"><small>' + esc(n.icon || '📣') + ' Novità' +
      (n.audience === 'admin' ? ' · solo admin' : '') + '</small><b>' + esc(n.title) + '</b></div>' +
      '<div class="bd">' + itemsHtml(n) + '</div>' +
      '<div class="ft"><button type="button" data-close>Ho capito</button><a href="bacheca.html#novita">Tutte le novità' + esc(more) + '</a></div></div>';
    const close = () => { markSeen([n.id]); veil.remove(); };
    veil.addEventListener('click', e => { if (e.target === veil || e.target.hasAttribute('data-close')) close(); });
    veil.querySelector('a').addEventListener('click', () => markSeen([n.id]));
    document.body.appendChild(veil);
  }

  async function renderList(el) {
    if (!el) return;
    const [{ list }, un] = await Promise.all([visible(), unread()]);
    const fresh = new Set(un.map(n => n.id));
    if (!list.length) { el.innerHTML = '<p class="nw-empty">Ancora nessuna novità.</p>'; return; }
    const fmt = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } };
    el.innerHTML = '<p class="nw-intro">Cosa cambia nell\'app a ogni aggiornamento, spiegato in breve.</p>' + list.map(n =>
      '<article class="nw' + (n.audience === 'admin' ? ' admin' : '') + '" id="n-' + esc(n.id) + '">' +
        (fresh.has(n.id) ? '<span class="fa-new" data-dyn>New</span>' : '') +
        '<div class="nw-hd"><div class="nw-ic">' + esc(n.icon || '📣') + '</div><div>' +
          '<div class="nw-meta">' + esc(fmt(n.date)) + (n.audience === 'admin' ? ' · <span class="fa-admin-tag">Solo admin</span>' : '') + '</div>' +
          '<h2 class="nw-title">' + esc(n.title) + '</h2></div></div>' +
        '<div class="nw-bd">' + itemsHtml(n) +
          (n.link ? '<a class="nw-link" href="' + esc(n.link) + '">' + esc(n.linkLabel || 'Apri') + ' →</a>' : '') +
        '</div></article>').join('');
    markSeen(list.map(n => n.id));
  }

  function expireNewTags() {
    const t = today();
    document.querySelectorAll('[data-new-until]').forEach(el => {
      if (String(el.getAttribute('data-new-until')) < t) el.remove();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', expireNewTags);
  else expireNewTags();

  root.FANews = { load, isAdmin, visible, unread, markSeen, homeCard, popup, renderList, itemsHtml, esc };
})(window);
