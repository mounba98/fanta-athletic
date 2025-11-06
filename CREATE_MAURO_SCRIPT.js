// Script per creare il player "Mauro" nel database Firestore
// Esegui questo nella console del browser (F12) mentre sei su fanta-athletic.web.app

// STEP 1: Verifica se sei loggato
if (!firebase.auth().currentUser) {
  console.error('❌ NON SEI LOGGATO!');
  console.log('Prima fai login con:');
  console.log('firebase.auth().signInWithEmailAndPassword("tua-email@example.com", "tua-password")');
} else {
  console.log('✅ Loggato come:', firebase.auth().currentUser.email);
  
  // STEP 2: Crea il player
  const playerData = {
    player_id: 'c4fyWntWj1mTj4fekijO',
    nome_completo: 'Mauro Lupi',
    nickname: 'mauro',
    role: 'Centrocampista',
    team: '',
    eta: null,
    altezza: null,
    peso: null,
    foto_url: ''
  };
  
  // STEP 3: Salva su Firestore
  firebase.firestore().collection('players').doc('c4fyWntWj1mTj4fekijO').set(playerData)
    .then(() => {
      console.log('✅ ✅ ✅ PLAYER CREATO CON SUCCESSO! ✅ ✅ ✅');
      console.log('Player ID:', playerData.player_id);
      console.log('Nome:', playerData.nome_completo);
      console.log('Ruolo:', playerData.role);
      console.log('');
      console.log('🔄 ORA RICARICA LA PAGINA squadre.html per vedere "Mauro Lupi" invece dell\'ID!');
    })
    .catch(err => {
      console.error('❌ ERRORE:', err.message);
    });
}
