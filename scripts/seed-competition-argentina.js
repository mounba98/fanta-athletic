#!/usr/bin/env node
/**
 * Seed competition data for Argentina Primera División 2025 (football demo).
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/creds.json \
 *   node scripts/seed-competition-argentina.js --project fanta-athletic \
 *     --file public/data/competitions/argentina-primera-2025.json
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith('--')) continue;
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    opts[key.replace('--', '')] = value;
    if (value !== true) i += 1;
  }
  return opts;
}

async function main() {
  const args = parseArgs();
  const projectId = args.project || process.env.GCLOUD_PROJECT || 'fanta-athletic';
  const filePath = args.file || path.resolve(__dirname, '../public/data/competitions/argentina-primera-2025.json');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File JSON non trovato: ${filePath}`);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!payload.competitionId) {
    console.error('❌ competitionId mancante nel JSON');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault()
    });
  }

  const db = admin.firestore();
  const competitionRef = db.collection('competitions').doc(payload.competitionId);
  console.log(`🚀 Scrivo competitions/${payload.competitionId} (sport=${payload.sportType})`);

  await competitionRef.set({
    sportType: payload.sportType || 'football',
    season: payload.season || '2025',
    label: payload.label || payload.competitionId,
    metadata: payload.metadata || {},
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  if (Array.isArray(payload.teams) && payload.teams.length) {
    console.log(`📝 Scrivo ${payload.teams.length} team docs`);
    const batchSize = 400;
    let batch = db.batch();
    let count = 0;
    payload.teams.forEach(team => {
      const docId = team.teamId || team.id || team.shortName || `team_${count}`;
      const ref = competitionRef.collection('teams').doc(docId);
      batch.set(ref, {
        teamId: docId,
        name: team.name || docId,
        shortName: team.shortName || docId.slice(0, 3).toUpperCase(),
        city: team.city || '',
        stadium: team.stadium || '',
        primaryColor: team.primaryColor || null,
        secondaryColor: team.secondaryColor || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count += 1;
      if (count % batchSize === 0) {
        batch.commit();
        batch = db.batch();
      }
    });
    await batch.commit();
  }

  if (!Array.isArray(payload.players) || !payload.players.length) {
    console.log('ℹ️ Nessun giocatore definito, seed completato.');
    return;
  }

  console.log(`📝 Scrivo ${payload.players.length} giocatori in competitions/${payload.competitionId}/participants`);
  const batchSize = 400;
  let batch = db.batch();
  let counter = 0;

  payload.players.forEach(player => {
    const pid = player.player_id || player.participantId || admin.firestore().collection('_').doc().id;
    const ref = competitionRef.collection('participants').doc(pid);
    batch.set(ref, {
      player_id: pid,
      role: player.role || '',
      roleCode: player.roleCode || '',
      nome_completo: player.nome_completo || player.name || '',
      teamId: player.teamId || '',
      teamName: player.teamName || '',
      shirtNumber: player.shirtNumber || null,
      marketValue: player.marketValue || null,
      nationality: player.nationality || '',
      meta: player.meta || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    counter += 1;
    if (counter % batchSize === 0) {
      batch.commit();
      batch = db.batch();
    }
  });

  await batch.commit();
  console.log(`✅ Seed completato per ${payload.players.length} giocatori`);
}

main().catch(err => {
  console.error('❌ Errore seed competition argentina:', err);
  process.exit(1);
});


