/**
 * Social Notifications System
 * Gestisce notifiche per post, commenti e reazioni
 * v2025102404
 */

(function() {
  'use strict';
  
  /**
   * Crea notifica Firestore
   */
  async function createNotification(recipientUid, data) {
    if (!window.db || !recipientUid) return;
    
    try {
      await window.db.collection('notifications').doc(recipientUid).collection('items').add({
        ...data,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Notifica creata per', recipientUid, data.type);
    } catch (error) {
      console.error('❌ Errore creazione notifica:', error);
    }
  }
  
  /**
   * Notifica proprietario post quando riceve commento
   */
  window.notifyPostComment = async function(postId, postAuthorUid, commenterUid, commenterName) {
    if (postAuthorUid === commenterUid) return; // Non notificare se commenta il proprietario
    
    await createNotification(postAuthorUid, {
      type: 'post_comment',
      postId: postId,
      actorUid: commenterUid,
      actorName: commenterName,
      message: `${commenterName} ha commentato il tuo post`,
      link: `/bacheca.html?post=${postId}`
    });
  };
  
  /**
   * Notifica proprietario post quando riceve reazione
   */
  window.notifyPostReaction = async function(postId, postAuthorUid, reactorUid, reactorName, reactionType) {
    if (postAuthorUid === reactorUid) return;
    
    const emoji = reactionType === 'like' ? '👍' : '❤️';
    
    await createNotification(postAuthorUid, {
      type: 'post_reaction',
      postId: postId,
      actorUid: reactorUid,
      actorName: reactorName,
      reactionType: reactionType,
      message: `${reactorName} ha reagito ${emoji} al tuo post`,
      link: `/bacheca.html?post=${postId}`
    });
  };
  
  /**
   * Notifica autore commento quando riceve reazione
   */
  window.notifyCommentReaction = async function(postId, commentId, commentAuthorUid, reactorUid, reactorName, reactionType) {
    if (commentAuthorUid === reactorUid) return;
    
    const emoji = reactionType === 'like' ? '👍' : '❤️';
    
    await createNotification(commentAuthorUid, {
      type: 'comment_reaction',
      postId: postId,
      commentId: commentId,
      actorUid: reactorUid,
      actorName: reactorName,
      reactionType: reactionType,
      message: `${reactorName} ha reagito ${emoji} al tuo commento`,
      link: `/bacheca.html?post=${postId}`
    });
  };
  
  /**
   * Notifica altri commentatori quando qualcuno commenta lo stesso post
   */
  window.notifyOtherCommenters = async function(postId, postAuthorUid, newCommenterUid, newCommenterName, existingCommentersUids) {
    // Filtra: non notificare il nuovo commentatore e il proprietario del post
    const toNotify = existingCommentersUids.filter(uid => 
      uid !== newCommenterUid && uid !== postAuthorUid
    );
    
    // Rimuovi duplicati
    const uniqueUids = [...new Set(toNotify)];
    
    for (const uid of uniqueUids) {
      await createNotification(uid, {
        type: 'also_commented',
        postId: postId,
        actorUid: newCommenterUid,
        actorName: newCommenterName,
        message: `${newCommenterName} ha anche commentato un post`,
        link: `/bacheca.html?post=${postId}`
      });
    }
  };
  
  /**
   * Notifica admin quando giornata calcolata
   */
  window.notifyGiornataCalcolata = async function(giornata, adminName) {
    if (!window.db) return;
    
    try {
      // Ottieni tutti gli utenti della lega corrente
      const leagueId = localStorage.getItem('last_league_id');
      if (!leagueId) return;
      
      const leagueDoc = await window.db.collection('leagues').doc(leagueId).get();
      if (!leagueDoc.exists) return;
      
      const members = leagueDoc.data().members || [];
      
      // Notifica tutti i membri
      for (const uid of members) {
        await createNotification(uid, {
          type: 'giornata_calcolata',
          giornata: giornata,
          actorName: adminName,
          message: `📊 ${giornata} calcolata! Vai al recap`,
          link: `/recap-giornata.html?g=${giornata}`
        });
      }
      
      console.log(`✅ Notificate ${members.length} persone per ${giornata}`);
    } catch (error) {
      console.error('❌ Errore notifica giornata:', error);
    }
  };
  
  console.log('✅ Social Notifications System loaded');
  
})();
