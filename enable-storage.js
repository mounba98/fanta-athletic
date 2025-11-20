const admin = require('firebase-admin');
const serviceAccount = require('./fanta-athletic-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'fanta-athletic.firebasestorage.app'
});

const bucket = admin.storage().bucket();

// Crea un file dummy per attivare Storage
async function enableStorage() {
  try {
    const file = bucket.file('.firebase-storage-enabled');
    await file.save('Firebase Storage is now enabled!', {
      metadata: {
        contentType: 'text/plain'
      }
    });
    console.log('✅ Firebase Storage attivato con successo!');
    console.log('📦 Bucket:', bucket.name);
    console.log('🌍 Ora puoi fare: firebase deploy --only storage');
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

enableStorage();
