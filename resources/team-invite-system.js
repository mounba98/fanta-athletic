/**
 * Team Invite System - Inviti Squadra con Codice/Link
 * v2025101907
 * 
 * Sistema per invitare vice-allenatori a una squadra:
 * - Admin lega manda link invito lega
 * - User entra e diventa primo allenatore di una squadra
 * - Primo allenatore invita vice tramite codice/mail
 */

(function() {
  'use strict';
  
  /**
   * Genera codice invito per squadra
   */
  function generateTeamInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'T-'; // T = Team
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  /**
   * Crea invito squadra
   */
  async function createTeamInvite(leagueId, teamId, createdBy, role = 'assistant') {
    const db = firebase.firestore();
    
    try {
      const code = generateTeamInviteCode();
      const link = `${window.location.origin}/join-team.html?leagueId=${leagueId}&code=${code}`;
      
      const inviteData = {
        leagueId: leagueId,
        teamId: teamId,
        code: code,
        link: link,
        role: role, // 'head' or 'assistant'
        createdBy: createdBy,
        createdAt: firebase.firestore.Timestamp.now(),
        expiresAt: firebase.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 giorni
        ),
        usedBy: null,
        status: 'active'
      };
      
      await db.collection(`leagues/${leagueId}/teamInvites`).doc(code).set(inviteData);
      
      return { success: true, code, link };
      
    } catch (error) {
      console.error('Create team invite error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Verifica e usa codice invito squadra
   */
  async function useTeamInvite(code, userId, leagueIdHint = null) {
    const db = firebase.firestore();
    
    try {
      const inviteFetch = await fetchInviteDocument(db, code, leagueIdHint);
      if (!inviteFetch) {
        return { success: false, error: 'Codice non valido' };
      }
      
      const { snapshot, leagueId } = inviteFetch;
      const invite = snapshot.data();
      
      // Validazioni
      if (invite.status !== 'active') {
        return { success: false, error: 'Invito già usato o scaduto' };
      }
      
      if (invite.expiresAt.toDate() < new Date()) {
        await snapshot.ref.update({ status: 'expired' });
        return { success: false, error: 'Invito scaduto' };
      }
      
      const numericTeamIndex = parseInt(invite.teamId, 10);
      if (!Number.isFinite(numericTeamIndex)) {
        return { success: false, error: 'Invito non valido (team non riconosciuta)' };
      }

      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? (userSnap.data() || {}) : {};

      const existingMembersSnap = await db.collection('users')
        .where('currentLeague', '==', leagueId)
        .where('team_index', '==', numericTeamIndex)
        .get();

      const alreadyOnTeam = userData.currentLeague === leagueId && userData.team_index === numericTeamIndex;
      if (!alreadyOnTeam && existingMembersSnap.size >= 3) {
        return { success: false, error: 'Questa squadra ha già il numero massimo di allenatori (3).' };
      }

      // Aggiungi utente alla squadra (lista coaches per tracking ruoli)
      await db.collection(`leagues/${leagueId}/teams`).doc(invite.teamId).update({
        coaches: firebase.firestore.FieldValue.arrayUnion({
          userId: userId,
          role: invite.role,
          joinedAt: firebase.firestore.Timestamp.now()
        })
      });
      
      // Aggiungi utente alla lega se non presente
      await db.collection('leagues').doc(leagueId).update({
        members: firebase.firestore.FieldValue.arrayUnion(userId)
      });

      // Aggiorna profilo utente con lega e squadra corrente
      const authUser = firebase.auth().currentUser;
      const userPayload = {
        currentLeague: leagueId,
        leagues: firebase.firestore.FieldValue.arrayUnion(leagueId),
        team_index: numericTeamIndex,
        updatedAt: firebase.firestore.Timestamp.now()
      };
      if (authUser && authUser.uid === userId) {
        if (authUser.email) {
          userPayload.email = authUser.email;
        }
        if (authUser.displayName) {
          userPayload.displayName = authUser.displayName;
        }
        userPayload.uid = userId;
      }
      await userRef.set(userPayload, { merge: true });
      
      // Mark invite as used
      await snapshot.ref.update({
        status: 'used',
        usedBy: userId,
        usedAt: firebase.firestore.Timestamp.now()
      });
      
      return { 
        success: true, 
        leagueId: leagueId,
        teamId: invite.teamId,
        role: invite.role
      };
      
    } catch (error) {
      console.error('Use team invite error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Invia invito via email
   */
  async function sendInviteEmail(code, recipientEmail, senderName, teamName, leagueId) {
    const link = `${window.location.origin}/join-team.html?code=${code}${leagueId ? `&leagueId=${leagueId}` : ''}`;
    
    // TODO: Integrare con servizio email (SendGrid, Firebase Email Extension, etc.)
    // Per ora, mostriamo il link da copiare
    
    return {
      success: true,
      message: 'Link generato (integra servizio email per invio automatico)',
      link: link
    };
  }
  
  /**
   * Render UI per invito squadra
   */
  function renderInviteUI(container, leagueId, teamId, teamName) {
    container.innerHTML = `
      <div style="background: var(--card); padding: 24px; border-radius: 12px; box-shadow: var(--shadow);">
        <h3>👥 Invita Vice-Allenatori</h3>
        <p>Invita altri utenti a gestire <strong>${teamName}</strong></p>
        
        <div style="margin: 20px 0;">
          <button id="generateCodeBtn" style="background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🔗 Genera Codice Invito
          </button>
        </div>
        
        <div id="inviteResult" style="display: none; margin-top: 20px;"></div>
      </div>
    `;
    
    document.getElementById('generateCodeBtn').addEventListener('click', async () => {
      const userId = firebase.auth().currentUser.uid;
      const result = await createTeamInvite(leagueId, teamId, userId, 'assistant');
      
      const resultDiv = document.getElementById('inviteResult');
      resultDiv.style.display = 'block';
      
      if (result.success) {
        resultDiv.innerHTML = `
          <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; border-left: 4px solid #4caf50;">
            <h4 style="margin-top: 0;">✅ Invito Creato!</h4>
            <p><strong>Codice:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 18px;">${result.code}</code></p>
            <p><strong>Link:</strong></p>
            <input type="text" value="${result.link}" readonly style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;">
            <button onclick="navigator.clipboard.writeText('${result.link}')" style="margin-top: 8px; background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              📋 Copia Link
            </button>
            <p style="font-size: 13px; color: #666; margin-top: 12px;">
              Condividi questo link con gli utenti che vuoi invitare. Valido per 7 giorni.
            </p>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="background: #ffebee; padding: 16px; border-radius: 8px; border-left: 4px solid #f44336;">
            <strong>❌ Errore:</strong> ${result.error}
          </div>
        `;
      }
    });
  }

  async function fetchInviteDocument(db, code, leagueIdHint) {
    if (leagueIdHint) {
      const docRef = db.collection(`leagues/${leagueIdHint}/teamInvites`).doc(code);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        return { snapshot, leagueId: leagueIdHint };
      }
    }

    const cgSnapshot = await db.collectionGroup('teamInvites')
      .where('code', '==', code)
      .limit(1)
      .get();

    if (cgSnapshot.empty) {
      return null;
    }

    const snapshot = cgSnapshot.docs[0];
    const pathSegments = snapshot.ref.path.split('/');
    const leaguesIndex = pathSegments.indexOf('leagues');
    const derivedLeagueId = leaguesIndex >= 0 ? pathSegments[leaguesIndex + 1] : snapshot.data().leagueId;

    return { snapshot, leagueId: derivedLeagueId };
  }
  
  // Expose API
  window.TeamInviteSystem = {
    createTeamInvite,
    useTeamInvite,
    sendInviteEmail,
    renderInviteUI
  };
  
})();
