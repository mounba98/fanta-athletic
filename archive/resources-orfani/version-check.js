// ⚡ AUTO-UPDATE CHECKER
// Controlla se c'è una nuova versione app e forza reload

(async function() {
  try {
    // Skip se non c'è Firebase
    if (!window.db) return;
    
    // Get version da Firestore
    const versionDoc = await window.db.collection('app_config').doc('version').get();
    
    if (!versionDoc.exists) return;
    
    const serverVersion = versionDoc.data().version;
    const localVersion = localStorage.getItem('app_version');
    
    // Se versione server più recente, forza reload
    if (localVersion && serverVersion > parseInt(localVersion)) {
      console.log(`🔄 Nuova versione disponibile: ${serverVersion} (attuale: ${localVersion})`);
      
      // Mostra toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2d6cdf;
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999999;
        font-weight: 600;
        animation: slideDown 0.3s;
      `;
      toast.textContent = '🔄 Aggiornamento disponibile! Ricarico...';
      document.body.appendChild(toast);
      
      // Pulisci cache e ricarica
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
        }
      }
      
      // Aggiorna versione locale
      localStorage.setItem('app_version', serverVersion.toString());
      
      // Reload dopo 2s
      setTimeout(() => {
        window.location.reload(true);
      }, 2000);
      
      return;
    }
    
    // Salva versione corrente se non esiste
    if (!localVersion) {
      localStorage.setItem('app_version', serverVersion.toString());
    }
    
  } catch (e) {
    console.warn('Version check error:', e);
  }
})();
