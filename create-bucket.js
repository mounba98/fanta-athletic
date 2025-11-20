const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('./fanta-athletic-firebase-adminsdk.json');

const storage = new Storage({
  projectId: 'fanta-athletic',
  credentials: serviceAccount
});

async function createBucket() {
  try {
    const bucketName = 'fanta-athletic.firebasestorage.app';
    
    console.log('🔨 Creazione bucket:', bucketName);
    
    const [bucket] = await storage.createBucket(bucketName, {
      location: 'EUROPE-WEST1',
      storageClass: 'STANDARD',
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true
        }
      }
    });
    
    console.log('✅ Bucket creato con successo!');
    console.log('📦 Nome:', bucket.name);
    console.log('📍 Location:', bucket.metadata.location);
    console.log('🎯 Ora esegui: firebase deploy --only storage');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Bucket già esistente!');
      console.log('🎯 Esegui: firebase deploy --only storage');
    } else {
      console.error('❌ Errore:', error.message);
      console.error('Dettagli:', error);
    }
  }
}

createBucket();
