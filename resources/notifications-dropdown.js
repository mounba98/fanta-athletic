/**
 * Notifications Dropdown - Global in All Pages
 * Version: 2025102002
 */

(function() {
  'use strict';

  let unsubscribe = null;
  let retryCount = 0;
  const MAX_RETRIES = 50; // 5 secondi max
  let latestNotifications = [];
  let lastRenderedNotifications = [];
  let unreadCount = 0;
  const leagueNameCache = new Map();
  const pendingLeagueFetches = new Map();
  primeLeagueNameCache();
  window.addEventListener('league-ready', event => {
    const league = event.detail?.league || null;
    if (league?.id) {
      const displayName = league.name || league.league?.name || league.id;
      leagueNameCache.set(league.id, displayName);
      refreshNotificationRender();
    }
  });
  window.addEventListener('league-changed', event => {
    const leagueId = event.detail?.leagueId;
    if (leagueId) {
      fetchLeagueName(leagueId);
    }
  });

  /**
   * Inizializza dropdown notifiche globale
   */
  function initNotificationsDropdown() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      if (retryCount >= MAX_RETRIES) {
        console.error('❌ Firebase non disponibile dopo 5s, notifications-dropdown disabilitato');
        return;
      }
      retryCount++;
      setTimeout(initNotificationsDropdown, 100);
      return;
    }
    
    console.log('✅ Firebase ready, notifications-dropdown initialized');
    
    firebase.auth().onAuthStateChanged((user) => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      latestNotifications = [];
      updateBadge(0);
      updateMarkAllButtonState(unreadCount);
      renderNotifications([]);

      if (!user) return;

      // Crea icona notifiche in navbar
      createNotificationIcon();

      // Ascolta notifiche real-time
      listenToNotifications(user.uid);
    });
  }

  /**
   * Crea icona notifiche in navbar (usa placeholder già esistente)
   */
  let iconRetryCount = 0;
  function createNotificationIcon() {
    // Cerca placeholder creato da navbar.js
    const placeholder = document.getElementById('notificationDropdownIcon');
    if (!placeholder) {
      if (iconRetryCount >= 25) return; // Max 5s
      iconRetryCount++;
      setTimeout(createNotificationIcon, 200);
      return;
    }
    
    // Check se già popolato
    if (placeholder.innerHTML) return;

    // Popola placeholder con contenuto campanella
    placeholder.style.cssText = `
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      transition: all 0.2s;
    `;
    
    // Mobile visibility fix
    if (window.innerWidth <= 768) {
      placeholder.style.width = '32px';
      placeholder.style.height = '32px';
    }

    placeholder.innerHTML = `
      <span style="font-size: 20px;">🔔</span>
      <span id="notifBadge" style="
        position: absolute;
        top: -2px;
        right: -2px;
        background: #e53e3e;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 700;
        display: none;
      ">0</span>
    `;

    placeholder.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleDropdown();
    });

    // Tastiera accessibile
    placeholder.setAttribute('role', 'button');
    placeholder.setAttribute('tabindex', '0');
    placeholder.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDropdown();
      }
    });

    // Hover
    placeholder.addEventListener('mouseenter', () => {
      placeholder.style.transform = 'scale(1.1)';
      placeholder.style.background = 'rgba(255,255,255,0.25)';
    });
    placeholder.addEventListener('mouseleave', () => {
      placeholder.style.transform = 'scale(1)';
      placeholder.style.background = 'rgba(255,255,255,0.15)';
    });

    // Crea dropdown (nascosto)
    createDropdownPanel();
  }

  /**
   * Crea pannello dropdown notifiche
   */
  function createDropdownPanel() {
    if (document.getElementById('notificationDropdownPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'notificationDropdownPanel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 360px;
      max-width: calc(100vw - 40px);
      max-height: 500px;
      background: var(--card);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 2000;
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    panel.innerHTML = `
      <div style="padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; background: var(--primary); color: white;">
        <h3 style="margin: 0; font-size: 16px;">🔔 Notifiche</h3>
        <button id="closeNotifDropdown" style="background: transparent; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 28px; height: 28px;">✕</button>
      </div>
      <div id="notificationDropdownList" style="flex: 1; overflow-y: auto; padding: 12px;">
        <div style="text-align: center; color: var(--muted); padding: 40px 20px;">
          Caricamento...
        </div>
      </div>
      <div style="padding: 12px 20px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <button id="markAllNotifDropdown" style="background: rgba(99,102,241,0.12); color: var(--primary); border: 1px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">Segna tutte lette</button>
        <a href="notifications.html" style="color: var(--primary); text-decoration: none; font-weight: 600; font-size: 14px;">Vedi tutte</a>
      </div>
    `;

    document.body.appendChild(panel);

    // Close button
    document.getElementById('closeNotifDropdown').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    // Azione "segna tutte lette"
    const markAllBtn = document.getElementById('markAllNotifDropdown');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', async () => {
        if (markAllBtn.disabled) return;
        const originalLabel = markAllBtn.textContent;
        markAllBtn.disabled = true;
        markAllBtn.textContent = 'In corso…';
        markAllBtn.style.opacity = '0.6';
        try {
          await markAllNotificationsRead();
        } finally {
          markAllBtn.textContent = originalLabel;
          updateMarkAllButtonState(unreadCount);
        }
      });
    }

    // Click fuori per chiudere
    document.addEventListener('click', (e) => {
      const icon = document.getElementById('notificationDropdownIcon');
      if (icon && !panel.contains(e.target) && !icon.contains(e.target)) {
        panel.style.display = 'none';
      } else if (!icon && !panel.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    // ESC per chiudere
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        panel.style.display = 'none';
      }
    });

    updateMarkAllButtonState(unreadCount);
  }

  /**
   * Toggle dropdown aperto/chiuso
   */
  function toggleDropdown() {
    const panel = document.getElementById('notificationDropdownPanel');
    if (!panel) return;

    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'flex';
      updateMarkAllButtonState(unreadCount);
    }
  }

  /**
   * Ascolta notifiche real-time
   */
  async function listenToNotifications(userId) {
    const leagueInfo = await window.LeagueHelper?.waitForLeague().catch(() => null);
    if (!leagueInfo || !leagueInfo.id) {
      console.warn('[notifications-dropdown] league non disponibile, listener disabilitato');
      return;
    }
    const { id: leagueId } = leagueInfo;
    const notifCol = window.LeagueHelper.getLeagueCollection('notifications', leagueId);
    if (!notifCol) {
      console.warn('[notifications-dropdown] collezione notifiche non accessibile');
      return;
    }

    if (unsubscribe) unsubscribe();

    const query = notifCol.where('userId', '==', userId);

    unsubscribe = query.onSnapshot(
        (snapshot) => {
          const docs = snapshot.docs.slice();

          const sortedDocs = docs.sort((a, b) => {
            const aData = a.data() || {};
            const bData = b.data() || {};
            const aDate = aData.createdAt?.toDate ? aData.createdAt.toDate() : (aData.createdAt ? new Date(aData.createdAt) : new Date(0));
            const bDate = bData.createdAt?.toDate ? bData.createdAt.toDate() : (bData.createdAt ? new Date(bData.createdAt) : new Date(0));
            return bDate - aDate;
          });

          const topDocs = sortedDocs.slice(0, 20);
          const notifications = topDocs.map(doc => {
            const data = doc.data() || {};
            const leagueId = data.leagueId || getLeagueIdFromRef(doc.ref);
            if (leagueId) {
              fetchLeagueName(leagueId);
            }
            return {
            id: doc.id,
            ref: doc.ref,
              ...data,
              leagueId
            };
          });

          const unreadDocs = docs.filter(doc => {
            const data = doc.data();
            return !data || data.read !== true;
          });

          unreadCount = unreadDocs.length;
          updateBadge(unreadCount);
          updateMarkAllButtonState(unreadCount);

          latestNotifications = unreadDocs
            .slice(0, 40)
            .filter(doc => {
              const data = doc.data();
              return !data || data.read !== true;
            })
            .map(doc => ({
              id: doc.id,
              ref: doc.ref,
              leagueId: (doc.data() && doc.data().leagueId) || getLeagueIdFromRef(doc.ref)
            }));

          renderNotifications(notifications);
        },
        (error) => {
          console.warn('Notification listener error:', error.message);
          if (error?.code === 'permission-denied' && typeof window.toast === 'function') {
            window.toast('Non hai accesso alle notifiche di questa lega');
          }
          latestNotifications = [];
          unreadCount = 0;
          updateBadge(unreadCount);
          updateMarkAllButtonState(unreadCount);
          renderNotifications([]); // Mostra "Nessuna notifica" invece di "Caricamento..."
        }
      );
  }

  /**
   * Segna tutte le notifiche recenti come lette
   */
  async function markAllNotificationsRead() {
    if (!latestNotifications.length) return;
    const db = firebase.firestore();
    const batch = db.batch();
    latestNotifications.forEach(notif => {
      if (notif.ref) {
        batch.update(notif.ref, { read: true });
      }
    });
    try {
      await batch.commit();
      latestNotifications = [];
      unreadCount = 0;
      updateMarkAllButtonState(unreadCount);
    } catch (error) {
      console.error('Errore markAllNotificationsRead:', error);
    }
  }

  /**
   * Aggiorna badge numero notifiche
   */
  function updateBadge(count) {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;

    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  function updateMarkAllButtonState(count) {
    const btn = document.getElementById('markAllNotifDropdown');
    if (!btn) return;
    const disabled = count <= 0;
    btn.disabled = disabled;
    btn.style.opacity = disabled ? '0.6' : '1';
    btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
  }

  /**
   * Renderizza lista notifiche in dropdown
   */
  function renderNotifications(notifications) {
    const list = document.getElementById('notificationDropdownList');
    if (!list) return;
    lastRenderedNotifications = notifications || [];

    if (notifications.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; color: var(--muted); padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
          <div>Nessuna notifica</div>
        </div>
      `;
      return;
    }

    console.debug('[notifications-dropdown] render', notifications.length);
    list.innerHTML = notifications.map(notif => {
      const timeAgo = getTimeAgo(notif.createdAt);
      const link = getNotificationLink(notif) || 'index.html';
      const safeLink = link.replace(/'/g, "\\'");
      const isUnread = notif.read !== true;
      const leagueName = getLeagueDisplayName(notif.leagueId);
      const leagueBadge = notif.leagueId
        ? `<div style="font-size:11px;color:var(--muted);margin-bottom:6px;">🏅 ${leagueName}</div>`
        : '';
      const bgDefault = isUnread ? 'rgba(99,102,241,0.18)' : 'rgba(0,0,0,0.03)';
      const hoverBg = isUnread ? 'rgba(99,102,241,0.26)' : 'rgba(0,0,0,0.08)';
      const borderColor = isUnread ? 'var(--primary)' : 'rgba(148,163,184,0.45)';
      const titlePrefix = isUnread ? `<span style="color: var(--primary); margin-right: 6px;">•</span>` : '';
      const body = notif.body || notif.message || '';

      return `
        <div class="notif-item" onclick="window.handleNotificationClick('${notif.id}', '${safeLink}', '${notif.leagueId || ''}')" style="
          padding: 12px;
          margin-bottom: 8px;
          background: ${bgDefault};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid ${borderColor};
        " onmouseenter="this.style.background='${hoverBg}'" onmouseleave="this.style.background='${bgDefault}'">
          ${leagueBadge}
          <div style="font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 4px; display: flex; align-items: center;">
            ${titlePrefix}${notif.title || 'Notifica'}
          </div>
          <div style="font-size: 13px; color: var(--muted); margin-bottom: 6px;">
            ${body}
          </div>
          <div style="font-size: 11px; color: var(--muted);">
            ${timeAgo}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Determina link notifica in base al tipo
   */
  function getNotificationLink(notif) {
    if (notif.link) return notif.link;
    if (notif.type === 'matchday_completed' || notif.type === 'giornata_calcolata') {
      return `classifiche.html?day=${notif.matchday || notif.giornata || ''}`;
    } else if (notif.type === 'new_post' || notif.type === 'post_comment' || notif.type === 'post_reaction' || notif.type === 'comment_reaction' || notif.type === 'also_commented') {
      return `bacheca.html?post=${notif.postId || ''}`;
    } else if (notif.type === 'match_result' || notif.type === 'matchday') {
      return `calendario.html?day=${notif.matchday || notif.giornata || ''}`;
    }
    return 'index.html';
  }

  /**
   * Calcola tempo trascorso
   */
  function getTimeAgo(timestamp) {
    if (!timestamp) return 'Ora';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Ora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`;
    return `${Math.floor(seconds / 86400)}g fa`;
  }

  /**
   * Handler click notifica
   */
  window.handleNotificationClick = async function(notifId, link, leagueId) {
    try {
      // Segna come letta
      if (notifId && latestNotifications.length) {
        const target = latestNotifications.find(n => n.id === notifId);
        if (target?.ref) {
          await target.ref.update({ read: true });
        }
      }

      if (leagueId) {
        try {
          localStorage.setItem('last_league_id', leagueId);
          localStorage.setItem('current_league_id', leagueId);
          window.currentLeagueId = leagueId;
        } catch (err) {
          console.warn('[notifications-dropdown] impossibile aggiornare lega dalla notifica', err);
        }
      }

      // Chiudi dropdown
      const panel = document.getElementById('notificationDropdownPanel');
      if (panel) panel.style.display = 'none';

      // Redirect
      window.location.href = link;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      window.location.href = link;
    }
  };

  function getLeagueIdFromRef(ref) {
    if (!ref) return null;
    try {
      const segments = ref.path.split('/');
      const leagueIndex = segments.indexOf('leagues');
      if (leagueIndex >= 0) {
        return segments[leagueIndex + 1];
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  function getLeagueDisplayName(leagueId) {
    if (!leagueId) return 'Lega sconosciuta';
    if (leagueNameCache.has(leagueId)) {
      return leagueNameCache.get(leagueId);
    }
    fetchLeagueName(leagueId);
    return `Lega ${leagueId.slice(0, 6)}`;
  }

  function fetchLeagueName(leagueId) {
    if (!leagueId || leagueNameCache.has(leagueId) || pendingLeagueFetches.has(leagueId)) {
      return;
    }
    const promise = firebase.firestore().collection('leagues').doc(leagueId).get()
      .then(doc => {
        if (doc.exists) {
          const name = doc.data().name || doc.id;
          leagueNameCache.set(leagueId, name);
          refreshNotificationRender();
        }
      })
      .catch(err => {
        console.warn('[notifications-dropdown] impossibile recuperare nome lega', err);
      })
      .finally(() => pendingLeagueFetches.delete(leagueId));
    pendingLeagueFetches.set(leagueId, promise);
  }

  function refreshNotificationRender() {
    if (lastRenderedNotifications && lastRenderedNotifications.length) {
      renderNotifications(lastRenderedNotifications);
    }
  }

  function primeLeagueNameCache() {
    try {
      const leagues = window.leagueSelector?.getUserLeagues?.() || [];
      leagues.forEach(league => {
        if (league.id && league.name) {
          leagueNameCache.set(league.id, league.name);
        }
      });
    } catch (err) {
      // ignore
    }
  }

  // Init quando DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationsDropdown);
  } else {
    initNotificationsDropdown();
  }

})();
