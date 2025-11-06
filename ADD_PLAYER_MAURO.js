// 🚨 SCRIPT RAPIDO: Aggiungi player Mauro a Firestore
// Copia e incolla nella Console di Firebase (Authentication deve essere loggato come admin)

const playerData = {
  player_id: "c4fyWntWj1mTj4fekijO",
  nome_completo: "Mauro Lupi",  // ← METTI IL NOME CORRETTO QUI
  nickname: "mauro",
  role: "Centrocampista",
  team: "Nome Squadra",  // ← METTI LA SQUADRA CORRETTA
  eta: null,
  altezza: null,
  peso: null,
  foto_url: ""
};

// Esegui questo nella console Firebase (F12 > Console)
firebase.firestore().collection('players').doc('c4fyWntWj1mTj4fekijO').set(playerData)
  .then(() => console.log('✅ Player Mauro aggiunto!'))
  .catch(err => console.error('❌ Errore:', err));

/* 
ALTERNATIVE RAPIDE:

1. Via Firebase Console (più semplice):
   - Vai su https://console.firebase.google.com/project/fanta-athletic/firestore
   - Collection: players
   - Add document
   - Document ID: c4fyWntWj1mTj4fekijO
   - Add fields sopra

2. Via questa pagina:
   - Apri formazioni.html
   - Console (F12)
   - Incolla:
*/

// Copia questo se sei su formazioni.html come admin:
if (window.db && window.auth.currentUser) {
  window.db.collection('players').doc('c4fyWntWj1mTj4fekijO').set({
    player_id: "c4fyWntWj1mTj4fekijO",
    nome_completo: "Mauro Lupi",
    nickname: "mauro",
    role: "Centrocampista",
    team: "Squadra X"
  }).then(() => alert('✅ Mauro aggiunto!')).catch(e => alert('❌ ' + e));
}
