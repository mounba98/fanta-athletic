const admin = require('firebase-admin');
const serviceAccount = require('./fanta-athletic-firebase-adminsdk.json'); // Sostituisci con il nome del tuo service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'fanta-athletic.firebasestorage.app'
});

const bucket = admin.storage().bucket();
console.log('✅ Bucket inizializzato:', bucket.name);
console.log('📍 Metadata:', bucket.metadata);
