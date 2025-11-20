#!/usr/bin/env node
/**
 * Seed competition data for NBA 2024/2025.
 * Usage:
 *   node scripts/seed-competition-nba.js --project fanta-athletic \
 *     --file public/data/competitions/nba-2025.json
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith('--')) continue;
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    result[key.replace('--', '')] = value;
    if (value !== true) i += 1;
  }
  return result;
}

async function main() {
  const args = parseArgs();
  const projectId = args.project || process.env.GCLOUD_PROJECT || 'fanta-athletic';
  const filePath = args.file || path.resolve(__dirname, '../public/data/competitions/nba-2025.json');

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
    sportType: payload.sportType || 'basketball',
    season: payload.season || '2024/2025',
    label: payload.label || payload.competitionId,
    metadata: payload.metadata || {},
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  if (!Array.isArray(payload.participants) || !payload.participants.length) {
    console.log('ℹ️ Nessun partecipante nel JSON, finito.');
    return;
  }

  const batch = db.batch();
  payload.participants.forEach(participant => {
    const participantId = participant.participantId || participant.name?.toLowerCase().replace(/\s+/g, '_');
    if (!participantId) return;
    const ref = competitionRef.collection('participants').doc(participantId);
    batch.set(ref, {
      ...participant,
      participantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
  console.log(`✅ Scritti ${payload.participants.length} partecipanti per ${payload.competitionId}`);
}

main().catch(err => {
  console.error('❌ Errore seed competition:', err);
  process.exit(1);
});


