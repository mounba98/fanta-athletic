// Error Logger per Fanta Athletic
// Version: 20251018
(function() {
  'use strict';

  const ERROR_TYPES = {
    JAVASCRIPT: 'javascript',
    FIREBASE: 'firebase',
    NETWORK: 'network',
    UI: 'ui'
  };

  function logError(type, message, error = null, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    // Log in console
    console.error(`[${type.toUpperCase()}] ${message}`, errorData);

    // Salva in localStorage per debug
    try {
      const existingLogs = JSON.parse(localStorage.getItem('fanta_errors') || '[]');
      existingLogs.push(errorData);
      // Mantieni solo gli ultimi 50 errori
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      localStorage.setItem('fanta_errors', JSON.stringify(existingLogs));
    } catch (e) {
      console.warn('Impossibile salvare errore in localStorage:', e);
    }

    // Invia a Firebase se disponibile (opzionale)
    if (window.firebase && window.firebase.firestore) {
      try {
        window.firebase.firestore().collection('error_logs').add(errorData);
      } catch (e) {
        console.warn('Impossibile inviare errore a Firebase:', e);
      }
    }
  }

  // Cattura errori JavaScript globali
  window.addEventListener('error', (event) => {
    logError(ERROR_TYPES.JAVASCRIPT, event.message, event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Cattura Promise rejection non gestite
  window.addEventListener('unhandledrejection', (event) => {
    logError(ERROR_TYPES.JAVASCRIPT, 'Unhandled Promise Rejection', event.reason, {
      promiseState: 'rejected'
      // Non includiamo event.promise per evitare errori Firestore con custom objects
    });
  });

  // Funzione per loggare errori Firebase
  window.logFirebaseError = function(operation, error, context = {}) {
    logError(ERROR_TYPES.FIREBASE, `Firebase ${operation} failed`, error, context);
  };

  // Funzione per loggare errori di rete
  window.logNetworkError = function(url, error, context = {}) {
    logError(ERROR_TYPES.NETWORK, `Network request failed: ${url}`, error, context);
  };

  // Funzione per loggare errori UI
  window.logUIError = function(component, error, context = {}) {
    logError(ERROR_TYPES.UI, `UI Error in ${component}`, error, context);
  };

  // Funzione per ottenere tutti gli errori
  window.getErrorLogs = function() {
    try {
      return JSON.parse(localStorage.getItem('fanta_errors') || '[]');
    } catch (e) {
      return [];
    }
  };

  // Funzione per pulire i log
  window.clearErrorLogs = function() {
    localStorage.removeItem('fanta_errors');
    console.log('Error logs cleared');
  };

  // Clear old errors (older than 24h)
  try {
    const errors = window.getErrorLogs();
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentErrors = errors.filter(e => {
      const errorTime = new Date(e.timestamp).getTime();
      return errorTime > dayAgo;
    });
    
    if (recentErrors.length !== errors.length) {
      localStorage.setItem('fanta_errors', JSON.stringify(recentErrors));
    }
    
    // Mostra solo errori recenti (ultime 24h)
    if (recentErrors.length > 0) {
      console.group('🔍 Recent Errors (24h)');
      recentErrors.forEach((error, index) => {
        console.error(`[${index + 1}] ${error.type.toUpperCase()}: ${error.message}`, error);
      });
      console.groupEnd();
    }
  } catch (e) {
    console.warn('Error cleaning old logs:', e);
  }

  console.log('Error logger initialized');
})();
