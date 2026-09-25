/**
 * PWA Install Prompt Handler
 * Version: 2025102002
 */
(function() {
  'use strict';
  
  let deferredPrompt;
  let promptShown = false; // Evita duplicati
  
  /**
   * Listen for beforeinstallprompt event
   */
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const dismissedAt = localStorage.getItem('pwa_install_dismissed_at');
    
    // Show again after 7 days
    if (dismissed && dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        console.log('PWA install prompt dismissed recently, waiting...');
        return;
      }
    }
    
    // Show install prompt after 3 seconds
    setTimeout(() => {
      showInstallPrompt();
    }, 3000);
  });
  
  /**
   * Show custom install prompt
   */
  function showInstallPrompt() {
    if (!deferredPrompt || promptShown) return;
    promptShown = true;
    
    // Create custom prompt
    const promptEl = document.createElement('div');
    promptEl.id = 'pwaInstallPrompt';
    promptEl.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #0c0f6d 0%, #920100 100%);
      color: white;
      padding: 18px 28px;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 90%;
      animation: slideUp 0.4s ease-out;
    `;
    
    promptEl.innerHTML = `
      <style>
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">
          📱 Installa Fanta Athletic
        </div>
        <div style="font-size: 13px; opacity: 0.9;">
          Aggiungi alla Home per un'esperienza migliore!
        </div>
      </div>
      <button id="pwaInstallBtn" style="
        background: white;
        color: #0c0f6d;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      ">
        Installa
      </button>
      <button id="pwaDismissBtn" style="
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
      ">
        ✕
      </button>
    `;
    
    document.body.appendChild(promptEl);
    
    // Install button
    document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa_install_dismissed', 'true');
        localStorage.setItem('pwa_install_dismissed_at', Date.now().toString());
      }
      
      // Clear the deferredPrompt
      deferredPrompt = null;
      promptEl.remove();
    });
    
    // Dismiss button
    document.getElementById('pwaDismissBtn').addEventListener('click', () => {
      localStorage.setItem('pwa_install_dismissed', 'true');
      localStorage.setItem('pwa_install_dismissed_at', Date.now().toString());
      promptEl.remove();
    });
  }
  
  /**
   * Check if app is installed
   */
  function isInstalled() {
    // Check if running as PWA
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }
  
  /**
   * Show install instructions for iOS
   */
  function showIOSInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone;
    
    if (isIOS && !isInStandaloneMode) {
      // Show iOS-specific instructions
      const instructionsEl = document.createElement('div');
      instructionsEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        color: #333;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 90%;
        text-align: center;
      `;
      
      instructionsEl.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">
          📱 Installa l'App
        </div>
        <div style="font-size: 14px; margin-bottom: 12px;">
          Tocca <span style="font-weight: 600;">Condividi</span> 
          poi <span style="font-weight: 600;">Aggiungi a Home</span>
        </div>
        <button onclick="this.parentElement.remove()" style="
          background: #0c0f6d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">
          OK
        </button>
      `;
      
      document.body.appendChild(instructionsEl);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        instructionsEl.remove();
      }, 10000);
    }
  }
  
  // Show iOS instructions on first visit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const hasSeenIOS = localStorage.getItem('ios_install_shown');
      if (!hasSeenIOS) {
        showIOSInstructions();
        localStorage.setItem('ios_install_shown', 'true');
      }
    });
  }
  
  // Log install status
  console.log('PWA Installed:', isInstalled());
  
  // Expose API
  window.PWAInstall = {
    isInstalled,
    showInstallPrompt
  };
  
})();
