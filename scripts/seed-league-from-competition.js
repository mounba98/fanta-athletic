#!/usr/bin/env node
/**
 * Utility per popolare una lega partendo da una competition condivisa.
 * Copia teams e players da competitions/{competitionId} dentro leagues/{leagueId}.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/creds.json \
 *   node scripts/seed-league-from-competition.js \
 *     --project fanta-athletic \
 *     --leagueId y3GQ05GhHsMSZLZj1Oew \
 *     --competitionId argentina-primera-2025
 *
 * Opzioni:
 *   --dry-run         Mostra operazioni senza scrivere nulla.
 *   --teamSlots <n>   Numero di slot da riempire (default 19, utile per calcio legacy).
 */

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

function chunkArray(items, size = 400) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const args = parseArgs();
  const projectId = args.project || process.env.GCLOUD_PROJECT || 'fanta-athletic';
  const leagueId = args.leagueId;
  const competitionId = args.competitionId;
  const dryRun = args['dry-run'] === true;
  const teamSlots = Math.max(1, parseInt(args.teamSlots || args.teamslots || 19, 10));

  if (!leagueId || !competitionId) {
    console.error('❌ Specifica sia --leagueId che --competitionId');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault()
    });
  }

  const db = admin.firestore();
  const leagueRef = db.collection('leagues').doc(leagueId);
  const competitionRef = db.collection('competitions').doc(competitionId);

  const [leagueSnap, competitionSnap] = await Promise.all([
    leagueRef.get(),
    competitionRef.get()
  ]);

  if (!leagueSnap.exists) {
    console.error(`❌ Lega ${leagueId} non trovata`);
    process.exit(1);
  }
  if (!competitionSnap.exists) {
    console.error(`❌ Competition ${competitionId} non trovata`);
    process.exit(1);
  }

  const competition = competitionSnap.data() || {};
  const [teamsSnap, playersSnap] = await Promise.all([
    competitionRef.collection('teams').get(),
    competitionRef.collection('participants').get()
  ]);

  const teams = teamsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
  const players = playersSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));

  console.log(`📦 Competition ${competitionId}: ${teams.length} squadre, ${players.length} giocatori`);

  const teamPlayerMap = new Map();
  players.forEach(player => {
    const bucket = teamPlayerMap.get(player.teamId) || [];
    bucket.push(player.player_id || player.id);
    teamPlayerMap.set(player.teamId, bucket);
  });

  if (dryRun) {
    console.log('🧪 Dry run attivo – nessun dato verrà scritto');
  }

  // 1) Aggiorna meta lega
  if (!dryRun) {
    await leagueRef.set({
      sportType: competition.sportType || 'football',
      competitionId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Aggiornato documento lega con sportType/competitionId');
  } else {
    console.log(`ℹ️ [dry-run] leagueRef.set({ sportType: ${competition.sportType || 'football'}, competitionId: ${competitionId} })`);
  }

  // 2) Scrivi giocatori nella subcollection leagues/{leagueId}/players
  if (players.length) {
    const playerChunks = chunkArray(players, 400);
    for (const chunk of playerChunks) {
      if (dryRun) {
        console.log(`ℹ️ [dry-run] Scriverei ${chunk.length} giocatori`);
        continue;
      }
      const batch = db.batch();
      chunk.forEach(player => {
        const docId = player.player_id || player.id;
        if (!docId) return;
        const ref = leagueRef.collection('players').doc(docId);
        batch.set(ref, {
          player_id: docId,
          role: player.role || player.roleLabel || '',
          roleCode: player.roleCode || '',
          nome_completo: player.nome_completo || player.name || '',
          teamId: player.teamId || '',
          teamName: player.teamName || '',
          nationality: player.nationality || '',
          marketValue: player.marketValue || null,
          shirtNumber: player.shirtNumber || null,
          competitionId,
          leagueId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
      console.log(`✅ Scritti ${chunk.length} giocatori nella lega`);
    }
  } else {
    console.warn('⚠️ Nessun giocatore trovato nella competition');
  }

  // 3) Scrivi teams (rispettando numero di slot attesi dalla UI legacy)
  const orderedTeams = teams.slice(0, teamSlots);
  if (orderedTeams.length < teamSlots) {
    console.warn(`ℹ️ Competition ha ${orderedTeams.length} squadre, ma la UI legacy richiede ${teamSlots} slot. I restanti resteranno segnaposto.`);
  }

  if (!dryRun) {
    const teamChunks = chunkArray(Array.from({ length: teamSlots }, (_, idx) => idx), 200);
    for (const chunk of teamChunks) {
      const batch = db.batch();
      chunk.forEach(index => {
        const slotId = String(index);
        const sourceTeam = orderedTeams[index] || null;
        const roster = sourceTeam ? (teamPlayerMap.get(sourceTeam.teamId) || []) : [];
        const name = sourceTeam ? sourceTeam.name : `Slot ${index + 1}`;
        const docRef = leagueRef.collection('teams').doc(slotId);
        const payload = {
          name,
          shortName: sourceTeam?.shortName || name.slice(0, 3).toUpperCase(),
          externalTeamId: sourceTeam?.teamId || null,
          competitionId,
          leagueId,
          city: sourceTeam?.city || '',
          colors: {
            primary: sourceTeam?.primaryColor || null,
            secondary: sourceTeam?.secondaryColor || null
          },
          stadium: sourceTeam?.stadium || '',
          coach_ids: sourceTeam?.coach ? [sourceTeam.coach] : [],
          headCoach: sourceTeam?.coach || null,
          roster,
          logo: sourceTeam?.logo || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        batch.set(docRef, payload, { merge: true });
      });
      await batch.commit();
    }
    console.log(`✅ Squadre importate nella lega (slot totali ${teamSlots})`);
  } else {
    orderedTeams.forEach((team, index) => {
      console.log(`ℹ️ [dry-run] set team slot ${index} -> ${team?.name || 'Slot ' + (index + 1)} (${(team && teamPlayerMap.get(team.teamId)?.length) || 0} giocatori)`);
    });
  }

  console.log('🎉 Import completato');
}

main().catch(err => {
  console.error('❌ Errore seed league from competition:', err);
  process.exit(1);
});


