/**
 * Trades System - Sistema Scambi Ruolo per Ruolo
 * v2025101906
 */

(function() {
  'use strict';
  
  const ROSTER_LIMITS = {
    P: 3,
    D: 8,
    C: 8,
    A: 6
  };
  
  /**
   * Validate trade between two teams
   */
  async function validateTrade(leagueId, fromTeamId, toTeamId, offerPlayerId, requestPlayerId) {
    const db = firebase.firestore();
    
    try {
      // Get players
      const [offerDoc, requestDoc] = await Promise.all([
        db.collection(`leagues/${leagueId}/players`).doc(offerPlayerId).get(),
        db.collection(`leagues/${leagueId}/players`).doc(requestPlayerId).get()
      ]);
      
      if (!offerDoc.exists || !requestDoc.exists) {
        return { valid: false, error: 'Giocatori non trovati' };
      }
      
      const offerPlayer = offerDoc.data();
      const requestPlayer = requestDoc.data();
      
      // Check same role
      if (offerPlayer.ruolo !== requestPlayer.ruolo) {
        return { valid: false, error: 'I giocatori devono avere lo stesso ruolo' };
      }
      
      // Check players are active
      if (offerPlayer.status !== 'active' || requestPlayer.status !== 'active') {
        return { valid: false, error: 'Uno dei giocatori non è disponibile' };
      }
      
      // Check players belong to correct teams
      if (offerPlayer.teamId !== fromTeamId || requestPlayer.teamId !== toTeamId) {
        return { valid: false, error: 'I giocatori non appartengono alle squadre corrette' };
      }
      
      return { valid: true, offerPlayer, requestPlayer };
      
    } catch (error) {
      console.error('Validation error:', error);
      return { valid: false, error: error.message };
    }
  }
  
  /**
   * Execute trade swap
   */
  async function executeTrade(leagueId, tradeId) {
    const db = firebase.firestore();
    
    try {
      const tradeDoc = await db.collection(`leagues/${leagueId}/trades`).doc(tradeId).get();
      if (!tradeDoc.exists) {
        throw new Error('Trade not found');
      }
      
      const trade = tradeDoc.data();
      
      // Validate before execution
      const validation = await validateTrade(
        leagueId,
        trade.fromTeamId,
        trade.toTeamId,
        trade.offerPlayerId,
        trade.requestPlayerId
      );
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Execute swap
      const batch = db.batch();
      
      const offerPlayerRef = db.collection(`leagues/${leagueId}/players`).doc(trade.offerPlayerId);
      const requestPlayerRef = db.collection(`leagues/${leagueId}/players`).doc(trade.requestPlayerId);
      const tradeRef = db.collection(`leagues/${leagueId}/trades`).doc(tradeId);
      
      batch.update(offerPlayerRef, {
        teamId: trade.toTeamId,
        lastTradeAt: firebase.firestore.Timestamp.now(),
        tradeHistory: firebase.firestore.FieldValue.arrayUnion({
          tradeId: tradeId,
          fromTeam: trade.fromTeamId,
          toTeam: trade.toTeamId,
          date: firebase.firestore.Timestamp.now()
        })
      });
      
      batch.update(requestPlayerRef, {
        teamId: trade.fromTeamId,
        lastTradeAt: firebase.firestore.Timestamp.now(),
        tradeHistory: firebase.firestore.FieldValue.arrayUnion({
          tradeId: tradeId,
          fromTeam: trade.toTeamId,
          toTeam: trade.fromTeamId,
          date: firebase.firestore.Timestamp.now()
        })
      });
      
      batch.update(tradeRef, {
        status: 'completed',
        completedAt: firebase.firestore.Timestamp.now()
      });
      
      await batch.commit();
      
      return { success: true };
      
    } catch (error) {
      console.error('Execute trade error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Cancel trade (admin only within 24h)
   */
  async function cancelTradeAdmin(leagueId, tradeId, userId) {
    const db = firebase.firestore();
    
    try {
      // Check admin
      const adminDoc = await db.collection('admins').doc(userId).get();
      if (!adminDoc.exists) {
        throw new Error('Solo admin può annullare scambi');
      }
      
      const tradeDoc = await db.collection(`leagues/${leagueId}/trades`).doc(tradeId).get();
      if (!tradeDoc.exists) {
        throw new Error('Trade not found');
      }
      
      const trade = tradeDoc.data();
      
      // Check within 24h
      const completedAt = trade.completedAt?.toDate();
      if (completedAt) {
        const hoursSince = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince > 24) {
          throw new Error('Troppo tempo passato. Scambi annullabili solo entro 24h');
        }
      }
      
      // Revert swap
      const batch = db.batch();
      
      const offerPlayerRef = db.collection(`leagues/${leagueId}/players`).doc(trade.offerPlayerId);
      const requestPlayerRef = db.collection(`leagues/${leagueId}/players`).doc(trade.requestPlayerId);
      const tradeRef = db.collection(`leagues/${leagueId}/trades`).doc(tradeId);
      
      batch.update(offerPlayerRef, {
        teamId: trade.fromTeamId
      });
      
      batch.update(requestPlayerRef, {
        teamId: trade.toTeamId
      });
      
      batch.update(tradeRef, {
        status: 'cancelled',
        cancelledAt: firebase.firestore.Timestamp.now(),
        cancelledBy: userId
      });
      
      await batch.commit();
      
      return { success: true };
      
    } catch (error) {
      console.error('Cancel trade error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Expose API
  window.TradesSystem = {
    validateTrade,
    executeTrade,
    cancelTradeAdmin,
    ROSTER_LIMITS
  };
  
})();
