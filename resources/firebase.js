// Firebase bootstrap for web app using compat SDK
// Requires: firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js, and resources/firebase-config.js loaded before this.
(function(){
  if (!window.firebaseConfig) { console.warn('firebaseConfig not found'); return; }
  if (!window.firebase) { console.warn('Firebase SDK not loaded'); return; }
  try {
    const app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(window.firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    window.firebaseApp = app;
    window.auth = auth;
    window.db = db;
    window.signIn = async function(email, password){ return auth.signInWithEmailAndPassword(email, password); };
    window.signOutFirebase = async function(){ return auth.signOut(); };
  } catch(e){ console.error('Firebase init error', e); }
})();
