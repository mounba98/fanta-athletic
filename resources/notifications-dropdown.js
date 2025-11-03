/**
 * Notifications Dropdown - Global in All Pages
 * Version: 2025102002
 */

(function() {
  'use strict';

  let unsubscribe = null;
  let retryCount = 0;
  const MAX_RETRIES = 50; // 5 secondi max

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
      <div id="notificationsList" style="flex: 1; overflow-y: auto; padding: 12px;">
        <div style="text-align: center; color: var(--muted); padding: 40px 20px;">
          Caricamento...
        </div>
      </div>
      <div style="padding: 12px 20px; border-top: 1px solid rgba(0,0,0,0.1); text-align: center;">
        <a href="notifications.html" style="color: var(--primary); text-decoration: none; font-weight: 600; font-size: 14px;">Vedi tutte</a>
      </div>
    `;

    document.body.appendChild(panel);

    // Close button
    document.getElementById('closeNotifDropdown').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    // Click fuori per chiudere
    document.addEventListener('click', (e) => {
      const icon = document.getElementById('notificationDropdownIcon');
      if (icon && !panel.contains(e.target) && !icon.contains(e.target)) {
        panel.style.display = 'none';
      } else if (!icon && !panel.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  }

  /**
   * Toggle dropdown aperto/chiuso
   */
  function toggleDropdown() {
    const panel = document.getElementById('notificationDropdownPanel');
    if (!panel) return;

    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
  }

  /**
   * Ascolta notifiche real-time
   */
  function listenToNotifications(userId) {
    const db = firebase.firestore();

    // Unsubscribe precedente se esiste
    if (unsubscribe) unsubscribe();

    unsubscribe = db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          updateBadge(notifications.length);
          renderNotifications(notifications);
        },
        (error) => {
          console.warn('Notification listener error:', error.message);
          updateBadge(0);
        }
      );
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

  /**
   * Renderizza lista notifiche in dropdown
   */
  function renderNotifications(notifications) {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; color: var(--muted); padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
          <div>Nessuna notifica</div>
        </div>
      `;
      return;
    }

    list.innerHTML = notifications.map(notif => {
      const timeAgo = getTimeAgo(notif.createdAt);
      const link = getNotificationLink(notif);

      return `
        <div class="notif-item" onclick="window.handleNotificationClick('${notif.id}', '${link}')" style="
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(0,0,0,0.03);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid var(--primary);
        " onmouseenter="this.style.background='rgba(0,0,0,0.08)'" onmouseleave="this.style.background='rgba(0,0,0,0.03)'">
          <div style="font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 4px;">
            ${notif.title || 'Notifica'}
          </div>
          <div style="font-size: 13px; color: var(--muted); margin-bottom: 6px;">
            ${notif.body || ''}
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
    if (notif.type === 'matchday_completed') {
      return `classifiche.html?day=${notif.matchday || ''}`;
    } else if (notif.type === 'new_post') {
      return `bacheca.html?post=${notif.postId || ''}`;
    } else if (notif.type === 'match_result') {
      return `calendario.html?day=${notif.matchday || ''}`;
    } else if (notif.type === 'comment') {
      return `bacheca.html?post=${notif.postId || ''}`;
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
  window.handleNotificationClick = async function(notifId, link) {
    try {
      // Segna come letta
      await firebase.firestore()
        .collection('notifications')
        .doc(notifId)
        .update({ read: true });

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

  // Init quando DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationsDropdown);
  } else {
    initNotificationsDropdown();
  }

})();
