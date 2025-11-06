const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./fanta-athletic-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'fanta-athletic.appspot.com'
});

// Le regole Storage non possono essere deployate via Admin SDK
// Ma possiamo verificare che il bucket funzioni
async function testStorage() {
  const bucket = admin.storage().bucket();
  
  // Test upload
  const testFile = bucket.file('test-upload.txt');
  await testFile.save('Test upload funzionante!');
  console.log('✅ Upload test OK');
  
  // Test download
  const [content] = await testFile.download();
  console.log('✅ Download test OK:', content.toString());
  
  // Cleanup
  await testFile.delete();
  console.log('✅ Delete test OK');
  
  console.log('\n🎯 Storage funziona correttamente!');
  console.log('📋 Le regole vanno deployate manualmente dalla console:');
  console.log('   https://console.firebase.google.com/project/fanta-athletic/storage/rules');
}

testStorage().catch(console.error);
