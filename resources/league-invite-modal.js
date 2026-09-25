/**
 * League Invite Modal
 * Sistema inviti con codice, link e WhatsApp
 * v2025102403
 */

(function() {
  'use strict';
  
  /**
   * Mostra modal inviti
   */
  window.showInviteModal = async function() {
    const leagueId = localStorage.getItem('last_league_id');
    
    if (!leagueId) {
      alert('⚠️ Seleziona prima una lega!');
      return;
    }
    
    // Carica dati lega
    let league = null;
    try {
      const doc = await firebase.firestore().collection('leagues').doc(leagueId).get();
      if (!doc.exists) {
        alert('❌ Lega non trovata!');
        return;
      }
      league = { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error loading league:', error);
      alert('❌ Errore caricamento lega');
      return;
    }
    
    // Genera codice invito (se non esiste)
    let inviteCode = league.inviteCode;
    if (!inviteCode) {
      inviteCode = generateInviteCode();
      try {
        await firebase.firestore().collection('leagues').doc(leagueId).update({
          inviteCode: inviteCode
        });
      } catch (error) {
        console.error('Error saving invite code:', error);
      }
    }
    
    // Crea modal
    const modal = document.createElement('div');
    modal.id = 'inviteModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    `;
    
    const inviteUrl = `${window.location.origin}/join-league.html?leagueId=${leagueId}&code=${inviteCode}`;
    const userName = firebase.auth().currentUser?.displayName || 'Un utente';
    const whatsappMessage = encodeURIComponent(
      `🏆 ${userName} ti ha invitato a unirti alla lega "${league.name}" su Fanta Athletic!\n\n` +
      `📋 Codice: ${inviteCode}\n` +
      `🔗 Link: ${inviteUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
    
    modal.innerHTML = `
      <div style="
        background: var(--card);
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        padding: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px;">📤 Invita Amici</h2>
          <button onclick="window.closeInviteModal()" style="
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: var(--muted);
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
        
        <div style="margin-bottom: 16px;">
          <div style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">Lega:</div>
          <div style="font-weight: 700; font-size: 18px; color: var(--primary);">${league.name}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">📋 Codice Invito:</div>
          <div style="
            display: flex;
            gap: 8px;
            align-items: center;
            background: var(--bg);
            padding: 12px;
            border-radius: 10px;
            border: 2px solid var(--primary);
          ">
            <input
              id="inviteCodeInput"
              value="${inviteCode}"
              readonly
              style="
                flex: 1;
                background: transparent;
                border: none;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 2px;
                color: var(--text);
                text-align: center;
              "
            />
            <button onclick="window.copyInviteCode()" style="
              background: var(--primary);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              white-space: nowrap;
            ">📋 Copia</button>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">🔗 Link Diretto:</div>
          <div style="
            display: flex;
            gap: 8px;
            align-items: center;
            background: var(--bg);
            padding: 12px;
            border-radius: 10px;
          ">
            <input
              id="inviteLinkInput"
              value="${inviteUrl}"
              readonly
              style="
                flex: 1;
                background: transparent;
                border: none;
                font-size: 12px;
                color: var(--text);
                overflow: hidden;
                text-overflow: ellipsis;
              "
            />
            <button onclick="window.copyInviteLink()" style="
              background: var(--secondary);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              white-space: nowrap;
            ">📋 Copia</button>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <a href="${whatsappUrl}" target="_blank" style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
            color: white;
            padding: 14px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            <span style="font-size: 24px;">💬</span>
            Condividi su WhatsApp
          </a>
        </div>
        
        <div style="
          background: var(--bg);
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          color: var(--muted);
          text-align: center;
        ">
          💡 Gli amici potranno unirsi inserendo il codice o cliccando il link
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Chiudi con ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        window.closeInviteModal();
      }
    };
    document.addEventListener('keydown', handleEsc);
    modal.dataset.escListener = 'true';
  };
  
  /**
   * Chiudi modal
   */
  window.closeInviteModal = function() {
    const modal = document.getElementById('inviteModal');
    if (modal) {
      modal.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => modal.remove(), 200);
      document.removeEventListener('keydown', handleEsc);
    }
  };
  
  /**
   * Copia codice invito
   */
  window.copyInviteCode = function() {
    const input = document.getElementById('inviteCodeInput');
    input.select();
    document.execCommand('copy');
    
    // Toast
    showToast('✅ Codice copiato!');
  };
  
  /**
   * Copia link invito
   */
  window.copyInviteLink = function() {
    const input = document.getElementById('inviteLinkInput');
    input.select();
    document.execCommand('copy');
    
    // Toast
    showToast('✅ Link copiato!');
  };
  
  /**
   * Genera codice invito univoco
   */
  function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  /**
   * Toast notification
   */
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #16a34a;
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      font-weight: 600;
      animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2000);
  }
  
  // CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
})();
