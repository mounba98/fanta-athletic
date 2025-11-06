// 🔍 SCRIPT: Verifica utenti senza team_index assegnato
// Esegui nella console Firebase (formazioni.html, loggato come admin)

async function checkUsersWithoutTeam() {
  console.log('🔍 Checking users without team_index...');
  
  if (!window.db) {
    console.error('❌ Database non disponibile');
    return;
  }
  
  try {
    const usersSnapshot = await window.db.collection('users').get();
    const problematicUsers = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      const teamIdx = data.team_index;
      
      if (typeof teamIdx !== 'number') {
        problematicUsers.push({
          uid: doc.id,
          email: data.email || 'N/A',
          displayName: data.displayName || 'N/A',
          team_index: teamIdx
        });
      }
    });
    
    if (problematicUsers.length === 0) {
      console.log('✅ Tutti gli utenti hanno team_index assegnato!');
    } else {
      console.log('⚠️ Utenti SENZA team_index:', problematicUsers.length);
      console.table(problematicUsers);
      
      // Mostra comando per fixare
      console.log('\n📝 Per assegnare team_index, usa:');
      problematicUsers.forEach((user, i) => {
        console.log(`
// Utente ${i + 1}: ${user.email}
window.db.collection('users').doc('${user.uid}').update({
  team_index: 0  // ← Metti l'indice corretto (0-18)
}).then(() => console.log('✅ ${user.email} assegnato a squadra'));
        `);
      });
    }
    
    return problematicUsers;
  } catch (error) {
    console.error('❌ Errore durante il check:', error);
  }
}

// Esegui
checkUsersWithoutTeam();

/* 
COME USARE:

1. Apri formazioni.html
2. Fai login come admin
3. Apri Console (F12)
4. Copia e incolla questo script
5. Premi Invio
6. Vedi lista utenti problematici
7. Usa i comandi suggeriti per fixare

ESEMPIO ASSEGNAZIONE:
window.db.collection('users').doc('USER_UID_QUI').update({
  team_index: 5  // Squadra 6 (0-indexed)
}).then(() => console.log('✅ Assegnato'));
*/
