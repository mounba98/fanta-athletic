/**
 * Social Notifications System
 * Gestisce notifiche per post, commenti e reazioni
 * v2025102404
 */

(function() {
  'use strict';
  
  /**
   * Crea notifica Firestore (collezione piatta `notifications`)
   */
  async function createNotification(recipientUid, payload = {}) {
    if (!window.db || !recipientUid) return;
    
    const storedLeagueId = (() => {
      try {
        return localStorage.getItem('last_league_id');
      } catch (_) {
        return null;
      }
    })();
    
    const targetLeagueId = storedLeagueId || (await window.LeagueHelper.waitForLeague()).id;
    
    const doc = {
      userId: recipientUid,
      leagueId: targetLeagueId,
      type: payload.type || 'generic',
      title: payload.title || payload.message || 'Notifica',
      body: payload.body || payload.message || '',
      link: payload.link || null,
      postId: payload.postId || null,
      commentId: payload.commentId || null,
      actorUid: payload.actorUid || null,
      actorName: payload.actorName || null,
      reactionType: payload.reactionType || null,
      giornata: payload.giornata || null,
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (payload.extra && typeof payload.extra === 'object') {
      doc.extra = payload.extra;
    }
    
    try {
      await window.LeagueHelper
        .getLeagueCollection('notifications', targetLeagueId)
        .add(doc);
    } catch (error) {
      console.error('❌ Errore creazione notifica:', error);
    }
  }
  
  /**
   * Notifica proprietario post quando riceve commento
   */
  window.notifyPostComment = async function(postId, postAuthorUid, commenterUid, commenterName, commentText = '') {
    if (postAuthorUid === commenterUid) return; // Non notificare se commenta il proprietario
    
    await createNotification(postAuthorUid, {
      type: 'post_comment',
      title: `${commenterName} ha commentato il tuo post`,
      body: commentText ? commentText.substring(0, 120) : `${commenterName} ha lasciato un commento`,
      postId: postId,
      actorUid: commenterUid,
      actorName: commenterName,
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
      title: `${reactorName} ha reagito ${emoji} al tuo post`,
      body: 'Apri la bacheca per vedere la reazione.',
      postId: postId,
      actorUid: reactorUid,
      actorName: reactorName,
      reactionType: reactionType,
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
      title: `${reactorName} ha reagito ${emoji} al tuo commento`,
      body: 'Apri la bacheca per leggere la reazione.',
      postId: postId,
      commentId: commentId,
      actorUid: reactorUid,
      actorName: reactorName,
      reactionType: reactionType,
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
        title: `${newCommenterName} ha commentato un post che segui`,
        body: 'Clicca per leggere il nuovo commento.',
        postId: postId,
        actorUid: newCommenterUid,
        actorName: newCommenterName,
        link: `/bacheca.html?post=${postId}`
      });
    }
  };
  
  /**
   * Notifica utente taggato in un post
   */
  window.notifyPostTag = async function(postId, taggedUid, taggerUid, taggerName, postContent = '') {
    if (!taggedUid || taggedUid === taggerUid) return;

    await createNotification(taggedUid, {
      type: 'post_tag',
      title: `${taggerName} ti ha taggato in un post`,
      body: postContent ? postContent.substring(0, 120) : 'Apri la bacheca per vedere il post.',
      postId: postId,
      actorUid: taggerUid || null,
      actorName: taggerName || null,
      link: `/bacheca.html?post=${postId}`
    });
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
          title: `📊 ${giornata} calcolata`,
          body: `${adminName} ha aggiornato i punteggi. Vai al recap.`,
          giornata: giornata,
          actorName: adminName,
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
