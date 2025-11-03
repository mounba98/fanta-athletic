/**
 * Notifications System - Sistema Notifiche
 * v2025101906
 */

(function() {
  'use strict';
  
  async function createNotification(userId, notification) {
    const db = firebase.firestore();
    
    await db.collection('notifications').add({
      userId: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link || null,
      read: false,
      createdAt: firebase.firestore.Timestamp.now()
    });
  }
  
  async function getUnreadCount(userId) {
    const db = firebase.firestore();
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    return snapshot.size;
  }
  
  window.NotificationsSystem = {
    create: createNotification,
    getUnreadCount: getUnreadCount
  };
  
})();
