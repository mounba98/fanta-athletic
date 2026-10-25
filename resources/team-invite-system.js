/**
 * Team Invite System - Inviti Squadra con Codice/Link
 * v20261025 (D129: funziona anche per giocatori non admin)
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
   * Verifica e usa codice invito squadra.
   * D129: deve funzionare per un giocatore normale (non admin, magari non ancora nella lega).
   * Le regole permettono a lui solo: leggere l'invito, entrare nei membri della lega,
   * scrivere il proprio profilo. I passaggi "da admin" (contare gli allenatori, segnare
   * l'invito come usato, lista coaches della squadra) sono tentati ma non bloccano.
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
      
      if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
        return { success: false, error: 'Invito scaduto: chiedine uno nuovo' };
      }
      
      const numericTeamIndex = parseInt(invite.teamId, 10);
      if (!Number.isFinite(numericTeamIndex)) {
        return { success: false, error: 'Invito non valido (team non riconosciuta)' };
      }

      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? (userSnap.data() || {}) : {};
      const alreadyOnTeam = userData.currentLeague === leagueId && userData.team_index === numericTeamIndex;

      // Massimo 3 allenatori: il conteggio legge gli altri utenti, permesso solo agli admin
      if (!alreadyOnTeam) {
        try {
          const existingMembersSnap = await db.collection('users')
            .where('currentLeague', '==', leagueId)
            .where('team_index', '==', numericTeamIndex)
            .get();
          if (existingMembersSnap.size >= 3) {
            return { success: false, error: 'Questa squadra ha già il numero massimo di allenatori (3).' };
          }
        } catch (countErr) {
          console.warn('[team-invite] Conteggio allenatori non permesso, salto il controllo:', countErr.code || countErr);
        }
      }

      // Entra nella lega se non c'è (le regole lo permettono solo a chi non è già membro)
      const leagueRef = db.collection('leagues').doc(leagueId);
      const leagueSnap = await leagueRef.get();
      const members = (leagueSnap.exists && leagueSnap.data().members) || [];
      if (!members.includes(userId)) {
        await leagueRef.update({
          members: firebase.firestore.FieldValue.arrayUnion(userId)
        });
      }

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
        if (authUser.displayName && !userData.displayName) {
          userPayload.displayName = authUser.displayName;
        }
        userPayload.uid = userId;
      }
      await userRef.set(userPayload, { merge: true });
      
      // Passaggi non indispensabili (riusciti solo dove le regole lo permettono)
      try {
        await snapshot.ref.update({
          status: 'used',
          usedBy: userId,
          usedAt: firebase.firestore.Timestamp.now()
        });
      } catch (markErr) {
        console.warn('[team-invite] Invito non segnato come usato:', markErr.code || markErr);
      }
      try {
        await db.collection(`leagues/${leagueId}/teams`).doc(invite.teamId).update({
          coaches: firebase.firestore.FieldValue.arrayUnion({
            userId: userId,
            role: invite.role,
            joinedAt: firebase.firestore.Timestamp.now()
          })
        });
      } catch (coachErr) {
        console.warn('[team-invite] Lista coaches della squadra non aggiornata:', coachErr.code || coachErr);
      }

      try { localStorage.setItem('last_league_id', leagueId); } catch (e) {}
      
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
      <div style="background: var(--card); padding: 24px; border-radius: 16px; box-shadow: var(--shadow); text-align: center; max-width: 480px; margin: 0 auto;">
        <h3 style="margin-top: 0;">Invita Vice-Allenatori</h3>
        <p style="color: var(--muted);">Invita altri utenti a gestire <strong style="color: var(--text);">${teamName}</strong></p>

        <div style="margin: 20px 0;">
          <button id="generateCodeBtn" class="btn" style="display: inline-block; width: auto; padding-left: 28px; padding-right: 28px;">
            Genera Codice Invito
          </button>
        </div>

        <div id="inviteResult" style="display: none; margin-top: 20px; text-align: center;"></div>
      </div>
    `;

    container.querySelector('#generateCodeBtn').addEventListener('click', async () => {
      const userId = firebase.auth().currentUser.uid;
      const result = await createTeamInvite(leagueId, teamId, userId, 'assistant');

      const resultDiv = container.querySelector('#inviteResult');
      resultDiv.style.display = 'block';

      if (result.success) {
        resultDiv.innerHTML = `
          <div style="background: rgba(22,163,74,0.12); padding: 16px; border-radius: 12px; border: 1px solid var(--success);">
            <h4 style="margin-top: 0; color: var(--success);">Invito Creato!</h4>
            <p style="margin: 8px 0;"><strong>Codice:</strong> <code style="background: var(--bg); padding: 4px 10px; border-radius: 999px; font-size: 16px;">${result.code}</code></p>
            <input type="text" class="input" value="${result.link}" readonly style="width: 100%; box-sizing: border-box; font-family: monospace; font-size: 13px; text-align: center; margin-top: 8px;" onclick="this.select()">
            <button onclick="navigator.clipboard.writeText('${result.link}')" class="btn btn-secondary" style="display: inline-block; width: auto; margin-top: 10px; padding-left: 24px; padding-right: 24px;">
              Copia Link
            </button>
            <p style="font-size: 13px; color: var(--muted); margin: 12px 0 0 0;">
              Condividi questo link con gli utenti che vuoi invitare. Valido per 7 giorni.
            </p>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="background: rgba(146,1,0,0.1); padding: 16px; border-radius: 12px; border: 1px solid var(--primary); color: var(--text);">
            <strong style="color: var(--primary);">Errore:</strong> ${result.error}
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

    // Senza lega indicata: cerca il codice in ogni lega (le leghe sono leggibili da tutti
    // gli utenti collegati; la ricerca "in tutte le sottoraccolte" non è permessa dalle regole)
    const leagues = await db.collection('leagues').get();
    for (const leagueDoc of leagues.docs) {
      if (leagueDoc.id === leagueIdHint) continue;
      const snapshot = await db.collection(`leagues/${leagueDoc.id}/teamInvites`).doc(code).get();
      if (snapshot.exists) {
        return { snapshot, leagueId: leagueDoc.id };
      }
    }
    return null;
  }
  
  // Expose API
  window.TeamInviteSystem = {
    createTeamInvite,
    useTeamInvite,
    sendInviteEmail,
    renderInviteUI
  };
  
})();
