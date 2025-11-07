#!/usr/bin/env node
/**
 * Migrazione dati legacy → multilega.
 *
 * Utilizzo:
 *   1. Creare un service account Firebase e salvare il JSON in locale.
 *   2. Impostare la variabile d'ambiente GOOGLE_APPLICATION_CREDENTIALS
 *      verso il file JSON.
 *   3. Eseguire: node scripts/migrate-legacy-to-multilega.js
 *
 * Lo script copia:
 *   - results/{giornata}/teams/{teamId}
 *     → leagues/{leagueId}/results/{giornata}/teams/{teamId}
 *   - teams/{teamId}/saved/{giornata}
 *     → leagues/{leagueId}/teams/{teamId}/saved/{giornata}
 *
 * La mappa teamId → leagueId viene dedotta da:
 *   - campo `leagueId` dentro il documento results o saved (se presente)
 *   - sottocollezione leagues/{leagueId}/teams/{teamId}
 *   - fallback: mapping statico da legacyTeamsMap (personalizzabile).
 */

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('⚠️  Imposta GOOGLE_APPLICATION_CREDENTIALS prima di eseguire lo script.');
  process.exit(1);
}

admin.initializeApp();

const db = admin.firestore();

const legacyTeamsMap = new Map();

async function buildTeamToLeagueMap() {
  const map = new Map(legacyTeamsMap);
  const leaguesSnap = await db.collection('leagues').get();
  for (const leagueDoc of leaguesSnap.docs) {
    const teamsSnap = await leagueDoc.ref.collection('teams').get();
    teamsSnap.forEach(teamDoc => {
      map.set(teamDoc.id, leagueDoc.id);
    });
  }
  return map;
}

async function migrateResults(teamToLeague) {
  const giornateSnap = await db.collection('results').get();
  for (const giornataDoc of giornateSnap.docs) {
    const teamsSnap = await giornataDoc.ref.collection('teams').get();
    if (teamsSnap.empty) continue;

    let batch = db.batch();
    let batchCount = 0;

    for (const teamDoc of teamsSnap.docs) {
      const data = teamDoc.data();
      const teamId = teamDoc.id;
      const leagueId = data.leagueId || teamToLeague.get(teamId);
      if (!leagueId) {
        console.warn('[migrateResults] leagueId mancante per team', teamId, 'giornata', giornataDoc.id);
        continue;
      }

      const destRef = db
        .collection('leagues').doc(leagueId)
        .collection('results').doc(giornataDoc.id)
        .collection('teams').doc(teamId);

      batch.set(destRef, data, { merge: true });
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount) {
      await batch.commit();
    }

    console.log(`[migrateResults] Copiata giornata ${giornataDoc.id}`);
  }
}

async function migrateSavedFormations(teamToLeague) {
  const teamsSnap = await db.collection('teams').get();
  for (const teamDoc of teamsSnap.docs) {
    const teamId = teamDoc.id;
    const leagueId = teamToLeague.get(teamId);
    if (!leagueId) {
      console.warn('[migrateSaved] leagueId mancante per team', teamId);
      continue;
    }

    const savedSnap = await teamDoc.ref.collection('saved').get();
    if (savedSnap.empty) continue;

    let batch = db.batch();
    let batchCount = 0;

    for (const savedDoc of savedSnap.docs) {
      const destRef = db
        .collection('leagues').doc(leagueId)
        .collection('teams').doc(teamId)
        .collection('saved').doc(savedDoc.id);
      batch.set(destRef, savedDoc.data(), { merge: true });
      batchCount++;
      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount) {
      await batch.commit();
    }

    console.log(`[migrateSaved] Copiate formazioni per team ${teamId}`);
  }
}

(async () => {
  console.log('🔁 Avvio migrazione legacy → multilega');
  const teamToLeague = await buildTeamToLeagueMap();
  console.log('🗺️  Mappa team/lega:', teamToLeague.size, 'team individuati');

  await migrateResults(teamToLeague);
  await migrateSavedFormations(teamToLeague);

  console.log('✅ Migrazione completata');
  process.exit(0);
})().catch(err => {
  console.error('❌ Errore migrazione', err);
  process.exit(1);
});

