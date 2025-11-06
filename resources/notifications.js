// Sistema di notifiche push per PWA
class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.registration = null;
  }

  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker non supportato');
      return false;
    }

    if (!('PushManager' in window)) {
      console.log('Push notifications non supportate');
      return false;
    }

    const isSecureContext =
      window.isSecureContext === true ||
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1';

    if (!isSecureContext) {
      console.warn('Service Worker non registrato: contesto non sicuro (usa HTTPS o localhost).');
      return false;
    }

    try {
      // Verifica che siamo in un contesto sicuro prima di registrare
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('Service Worker non registrato: richiesto HTTPS o localhost');
        return false;
      }
      
      // Verifica che il Service Worker sia supportato
      if (!navigator.serviceWorker) {
        console.warn('Service Worker non supportato da questo browser');
        return false;
      }
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrato');
      return true;
    } catch (error) {
      // Non loggare errori di sicurezza come errori critici
      if (error.message && error.message.includes('insecure')) {
        console.warn('Service Worker non registrato: contesto non sicuro (normale in sviluppo)');
      } else {
        console.warn('Errore registrazione Service Worker:', error.message || error);
      }
      return false;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Notifiche non supportate');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    if (permission === 'granted') {
      console.log('Permesso notifiche concesso');
      return true;
    } else {
      console.log('Permesso notifiche negato');
      return false;
    }
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Permesso notifiche non concesso');
      return;
    }

    const defaultOptions = {
      icon: '/resources/logo.png',
      badge: '/resources/logo.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    if (this.registration) {
      await this.registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Notifiche predefinite
  async notifyDeadlineFormazione(giornata, ore) {
    await this.showNotification('⏰ Deadline Formazione!', {
      body: `Mancano ${ore} ore alla chiusura di ${giornata}. Imposta la tua formazione!`,
      tag: 'deadline-' + giornata,
      data: { url: '/squadre.html' }
    });
  }

  async notifyNuovaGiornata(giornata) {
    await this.showNotification('🎮 Nuova Giornata!', {
      body: `È iniziata ${giornata}! Vai a vedere i risultati.`,
      tag: 'giornata-' + giornata,
      data: { url: '/matchday.html' }
    });
  }

  async notifyClassificaAggiornata() {
    await this.showNotification('📊 Classifica Aggiornata!', {
      body: 'La classifica è stata aggiornata. Controlla la tua posizione!',
      tag: 'classifica',
      data: { url: '/standings.html' }
    });
  }

  async notifyAstaInizio(minuti) {
    await this.showNotification('🔨 Asta in Partenza!', {
      body: `L'asta inizierà tra ${minuti} minuti. Preparati!`,
      tag: 'asta-inizio',
      data: { url: '/asta.html' },
      requireInteraction: true
    });
  }

  async notifyMercatoAperto() {
    await this.showNotification('💰 Mercato Aperto!', {
      body: 'Il mercato di gennaio è aperto! Fai le tue offerte.',
      tag: 'mercato',
      data: { url: '/mercato.html' }
    });
  }

  async notifyTrashTalk(from, message) {
    await this.showNotification(`💬 ${from}`, {
      body: message,
      tag: 'trash-talk',
      data: { url: '/bacheca.html' }
    });
  }

  async notifyVittoria(giornata) {
    await this.showNotification('🏆 HAI VINTO!', {
      body: `Complimenti! Hai vinto ${giornata}!`,
      tag: 'vittoria-' + giornata,
      data: { url: '/standings.html' },
      requireInteraction: true
    });
  }
}

// Inizializza il manager
const notificationManager = new NotificationManager();

// Auto-init quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    notificationManager.init();
  });
} else {
  notificationManager.init();
}

// Esporta per uso globale
window.notificationManager = notificationManager;
