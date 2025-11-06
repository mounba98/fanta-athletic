/**
 * Push Notifications System
 * v2025101907
 * 
 * Sistema notifiche per:
 * - Tag su bacheca
 * - Reazioni post/commenti
 * - Giornata calcolata
 * - Inviti squadra
 */

(function() {
  'use strict';
  
  /**
   * Request notification permission
   */
  async function requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  /**
   * Show browser notification
   */
  function showNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    
    const defaultOptions = {
      icon: '/resources/logo.png',
      badge: '/resources/logo.png',
      vibrate: [200, 100, 200],
      tag: 'fanta-athletic',
      requireInteraction: false,
      ...options
    };
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Use Service Worker for persistent notifications
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, defaultOptions);
      });
    } else {
      // Fallback to regular notification
      new Notification(title, defaultOptions);
    }
  }
  
  /**
   * Create notification in Firestore
   */
  async function createNotification(userId, notification) {
    const db = firebase.firestore();
    
    await db.collection('notifications').add({
      userId: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link || null,
      data: notification.data || {},
      read: false,
      createdAt: firebase.firestore.Timestamp.now()
    });
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      showNotification(notification.title, {
        body: notification.message,
        data: { url: notification.link }
      });
    }
  }
  
  /**
   * Send notification for tag on post
   */
  async function notifyTag(taggedUserId, post, taggerName) {
    await createNotification(taggedUserId, {
      type: 'tag',
      title: `${taggerName} ti ha taggato`,
      message: post.content.substring(0, 100) + '...',
      link: `/bacheca.html#post-${post.id}`,
      data: { postId: post.id }
    });
  }
  
  /**
   * Send notification for reaction
   */
  async function notifyReaction(postAuthorId, post, reactorName, reactionType) {
    const emoji = {
      'like': '👍',
      'love': '❤️',
      'fire': '🔥',
      'laugh': '😂',
      'wow': '😮'
    }[reactionType] || '👍';
    
    await createNotification(postAuthorId, {
      type: 'reaction',
      title: `${reactorName} ha reagito ${emoji}`,
      message: post.content.substring(0, 100) + '...',
      link: `/bacheca.html#post-${post.id}`,
      data: { postId: post.id, reactionType }
    });
  }
  
  /**
   * Send notification for comment
   */
  async function notifyComment(postAuthorId, post, commenterName, commentText) {
    await createNotification(postAuthorId, {
      type: 'comment',
      title: `${commenterName} ha commentato`,
      message: commentText.substring(0, 100) + '...',
      link: `/bacheca.html#post-${post.id}`,
      data: { postId: post.id }
    });
  }
  
  /**
   * Send notification for matchday calculated
   */
  async function notifyMatchdayCalculated(leagueId, matchdayNumber) {
    const db = firebase.firestore();
    
    // Get all league members
    const leagueDoc = await db.collection('leagues').doc(leagueId).get();
    if (!leagueDoc.exists) return;
    
    const league = leagueDoc.data();
    const members = league.members || [];
    
    // Send to all members
    const promises = members.map(memberId => 
      createNotification(memberId, {
        type: 'matchday',
        title: `Giornata ${matchdayNumber} calcolata! 🏆`,
        message: `Vedi come è andata la tua squadra`,
        link: `/classifiche.html`,
        data: { matchdayNumber }
      })
    );
    
    await Promise.all(promises);
  }
  
  /**
   * Send notification for team invite
   */
  async function notifyTeamInvite(userId, teamName, inviterName) {
    await createNotification(userId, {
      type: 'invite',
      title: `Invito da ${inviterName}`,
      message: `Sei stato invitato a gestire ${teamName}`,
      link: `/squadre.html`,
      data: { teamName }
    });
  }
  
  /**
   * Get unread notifications count
   */
  async function getUnreadCount(userId) {
    const db = firebase.firestore();
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    return snapshot.size;
  }
  
  /**
   * Mark notification as read
   */
  async function markAsRead(notificationId) {
    const db = firebase.firestore();
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: firebase.firestore.Timestamp.now()
    });
  }
  
  /**
   * Listen to new notifications
   */
  function listenToNotifications(userId, callback) {
    const db = firebase.firestore();
    
    return db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(
        snapshot => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(notifications);
        },
        error => {
          console.warn('Notification listener error (index building?):', error.message);
          // Callback con array vuoto per evitare crash
          callback([]);
        }
      );
  }
  
  /**
   * Render notifications icon in navbar (DISABILITATO - usa notifications-dropdown.js)
   * Questa funzione è stata sostituita da notifications-dropdown.js che gestisce
   * una campanella con dropdown invece di reindirizzare a bacheca.html
   */
  function renderNotificationBadge(count) {
    // DISABILITATO - campanella gestita da notifications-dropdown.js
    // Non creare più una seconda campanella duplicata
    return;
  }
  
  /**
   * Initialize notifications for current user
   */
  function initNotifications() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.warn('⚠️ Firebase non ancora caricato in push-notifications, retry in 100ms...');
      setTimeout(initNotifications, 100);
      return;
    }
    
    firebase.auth().onAuthStateChanged(async user => {
      if (!user) return;
      
      // Non chiedere più automaticamente: il permesso va richiesto con gesto utente
      const hasShownInfo = localStorage.getItem('notification_permission_prompt_info');
      if (!hasShownInfo && Notification.permission === 'default') {
        console.info('Notifiche: mostra un pulsante o una UI per richiedere il permesso con un gesto utente.');
        localStorage.setItem('notification_permission_prompt_info', 'true');
      }
      
      // Listen to new notifications
      listenToNotifications(user.uid, notifications => {
        renderNotificationBadge(notifications.length);
      });
    });
  }
  
  // Auto-init on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
  } else {
    initNotifications();
  }
  
  // Expose API
  window.PushNotifications = {
    requestPermission,
    showNotification,
    notifyTag,
    notifyReaction,
    notifyComment,
    notifyMatchdayCalculated,
    notifyTeamInvite,
    getUnreadCount,
    markAsRead,
    listenToNotifications
  };
  
})();
