/**
 * Firebase App Check Configuration
 * Version: 20251021-5
 * FIX: Previene errore "reCAPTCHA placeholder element must be empty"
 */

// reCAPTCHA v3 Site Key (da Firebase Console → App Check)
const RECAPTCHA_SITE_KEY = '6LchzvErAAAAAKZESKjmvc4RMeDxYfOnVqYy0LO0';

/**
 * Attiva App Check con reCAPTCHA v3 (invisibile)
 */
window.activateAppCheck = () => {
  if (!firebase.apps.length) {
    console.warn('⚠️ Firebase non inizializzato, App Check non attivato');
    return;
  }
  
  if (firebase.appCheck && !window.__APP_CHECK_ON__) {
    try {
      // Verifica se già attivato
      if (window.__APP_CHECK_ACTIVATING__) {
        console.log('⏳ App Check già in attivazione...');
        return;
      }
      
      window.__APP_CHECK_ACTIVATING__ = true;
      
      // Crea provider ReCaptchaV3 (invisibile, no container)
      const provider = new firebase.appCheck.ReCaptchaV3Provider(RECAPTCHA_SITE_KEY);
      
      // Attiva con auto-refresh
      firebase.appCheck().activate(provider, true);
      
      window.__APP_CHECK_ON__ = true;
      window.__APP_CHECK_ACTIVATING__ = false;
      console.log('✅ App Check attivato (reCAPTCHA v3 invisibile)');
    } catch (error) {
      window.__APP_CHECK_ACTIVATING__ = false;
      console.error('❌ Errore attivazione App Check:', error);
      // Non bloccare l'app, continua senza App Check
    }
  }
};
