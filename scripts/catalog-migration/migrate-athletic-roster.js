#!/usr/bin/env node
/**
 * Migrazione Roster Athletic 2018 → Catalogo Globale (V2)
 *
 * Requisiti:
 *  - node >= 18
 *  - npm install firebase-admin@latest
 *  - Service account JSON con permessi Firestore (set via GOOGLE_APPLICATION_CREDENTIALS o percorso nel config)
 *
 * Uso:
 *  node scripts/catalog-migration/migrate-athletic-roster.js \
 *    --project fanta-athletic \
 *    --legacyLeague 4rq1Rr0TquRfuPLmqQTn \
 *    --superadminUid fTaDr6Odn0fBpWS6e7QWOujmLlj1
 *
 * Opzioni:
 *  --dryRun        Non scrive nulla, mostra solo azioni (default: false)
 *  --playersJson   Percorso alternativo a JSON locale players.json (fallback se Firestore legacy vuoto)
 */

const fs = require('fs');
const path = require('path');
const { argv } = require('node:process');

// ----------------------
// Configurazione base
// ----------------------

const DEFAULTS = {
  projectId: 'fanta-athletic',
  legacyLeagueId: '4rq1Rr0TquRfuPLmqQTn',
  clubId: 'athletic-2018',
  clubName: 'Athletic 2018',
  rosterId: 'athletic-2018-2024-25-v1',
  rosterVersion: '1.0.0',
  championshipRef: 'AICS_FI_B1',
  regionRef: 'TOSCANA',
  seasonRef: '2024_2025',
  visibility: 'public',
  status: 'published',
};

function parseArgs() {
  const args = new Map();
  argv.slice(2).forEach((arg, idx, all) => {
    if (!arg.startsWith('--')) return;
    const key = arg.replace(/^--/, '');
    const next = all[idx + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, true);
    } else {
      args.set(key, next);
    }
  });
  return args;
}

const args = parseArgs();

const CONFIG = {
  projectId: args.get('project') || DEFAULTS.projectId,
  legacyLeagueId: args.get('legacyLeague') || DEFAULTS.legacyLeagueId,
  clubId: args.get('clubId') || DEFAULTS.clubId,
  clubName: args.get('clubName') || DEFAULTS.clubName,
  rosterId: args.get('rosterId') || DEFAULTS.rosterId,
  rosterVersion: args.get('version') || DEFAULTS.rosterVersion,
  championshipRef: args.get('championship') || DEFAULTS.championshipRef,
  regionRef: args.get('region') || DEFAULTS.regionRef,
  seasonRef: args.get('season') || DEFAULTS.seasonRef,
  visibility: args.get('visibility') || DEFAULTS.visibility,
  status: args.get('status') || DEFAULTS.status,
  superadminUid: args.get('superadminUid') || process.env.SUPERADMIN_UID || null,
  dryRun: args.has('dryRun'),
  playersJsonPath: args.get('playersJson') || path.resolve(__dirname, '../../resources/players.json'),
};

if (!CONFIG.superadminUid) {
  console.error('❌ SUPERADMIN UID mancante. Passa --superadminUid <uid> o esporta env SUPERADMIN_UID');
  process.exit(1);
}

console.log('⚙️  Config:', CONFIG);

// ----------------------
// Firebase Admin setup
// ----------------------

const admin = require('firebase-admin');

function initFirebase() {
  if (admin.apps.length) return admin.app();

  const credential = admin.credential.applicationDefault();

  admin.initializeApp({
    credential,
    projectId: CONFIG.projectId,
  });
  return admin.app();
}

const app = initFirebase();
const db = app.firestore();

// ----------------------
// Helper
// ----------------------

function normalize(str = '') {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildCanonicalKey(player, clubId, seasonRef) {
  const { firstName, lastName, role } = player;
  return [normalize(lastName), normalize(firstName), role.toLowerCase(), clubId, seasonRef].join('|');
}

function splitFullName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const lastName = parts.pop();
  const firstName = parts.join(' ');
  return { firstName, lastName };
}

async function readLegacyPlayers() {
  console.log('🔍 Lettura giocatori legacy da Firestore...');
  const snapshot = await db.collection('leagues').doc(CONFIG.legacyLeagueId).collection('players').get();
  if (!snapshot.empty) {
    console.log(`✅ Trovati ${snapshot.size} giocatori legacy`);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  console.warn('⚠️ Nessun giocatore legacy trovato, uso fallback JSON:', CONFIG.playersJsonPath);
  const raw = JSON.parse(fs.readFileSync(CONFIG.playersJsonPath, 'utf-8'));
  if (Array.isArray(raw?.players)) {
    return raw.players.map((p) => ({ id: p.player_id, ...p }));
  }
  throw new Error('Impossibile leggere giocatori da Firestore o JSON');
}

async function upsertClub() {
  const clubRef = db.collection('clubs').doc(CONFIG.clubId);
  const payload = {
    clubId: CONFIG.clubId,
    name: CONFIG.clubName,
    searchName: normalize(CONFIG.clubName),
    championshipRef: CONFIG.championshipRef,
    regionRef: CONFIG.regionRef,
    seasons: admin.firestore.FieldValue.arrayUnion(CONFIG.seasonRef),
    status: CONFIG.status,
    createdBy: CONFIG.superadminUid,
    updatedBy: CONFIG.superadminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (CONFIG.dryRun) {
    console.log('📦 [dry-run] club payload →', payload);
    return { ref: clubRef, payload };
  }

  await clubRef.set(
    {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...payload,
    },
    { merge: true }
  );
  console.log('✅ Club creato/aggiornato:', clubRef.path);
  return { ref: clubRef, payload };
}

async function upsertRoster(clubRef) {
  const rosterRef = db.collection('rosters').doc(CONFIG.rosterId);
  const payload = {
    rosterId: CONFIG.rosterId,
    clubRef: clubRef,
    clubId: CONFIG.clubId,
    seasonRef: CONFIG.seasonRef,
    version: CONFIG.rosterVersion,
    status: CONFIG.status,
    visibility: CONFIG.visibility,
    maintainers: admin.firestore.FieldValue.arrayUnion(CONFIG.superadminUid),
    championshipRef: CONFIG.championshipRef,
    regionRef: CONFIG.regionRef,
    searchKey: `${normalize(CONFIG.clubName)}-${CONFIG.seasonRef}-${CONFIG.rosterVersion}`,
    createdBy: CONFIG.superadminUid,
    updatedBy: CONFIG.superadminUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (CONFIG.dryRun) {
    console.log('📦 [dry-run] roster payload →', payload);
    return { ref: rosterRef, payload };
  }

  await rosterRef.set(
    {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...payload,
    },
    { merge: true }
  );
  console.log('✅ Roster creato/aggiornato:', rosterRef.path);
  return { ref: rosterRef, payload };
}

async function upsertPlayers(players) {
  const playerCollection = db.collection('players_global');
  const results = [];

  for (const player of players) {
    const { id, player_id, nome_completo, nomeCompleto, fullName, role, roleName, secondary_roles, secondaryRoles, nickname, nick } = player;
    const primaryId = player_id || id;
    const nameSource = nome_completo || nomeCompleto || fullName || player.fullName || '';
    const { firstName, lastName } = splitFullName(nameSource);
    const canonicalKey = buildCanonicalKey({ firstName, lastName, role: role || roleName || player.role }, CONFIG.clubId, CONFIG.seasonRef);

    const docRef = playerCollection.doc(primaryId);
    const payload = {
      playerId: primaryId,
      firstName,
      lastName,
      fullName: nameSource || `${firstName} ${lastName}`.trim(),
      role: role || roleName || player.role,
      secondaryRoles: secondary_roles || secondaryRoles || player.secondaryRoles || [],
      nickname: nickname || nick || player.nickname || '',
      defaultClubRef: CONFIG.clubId,
      canonicalKeys: admin.firestore.FieldValue.arrayUnion(canonicalKey),
      sources: {
        legacyLeagueId: CONFIG.legacyLeagueId,
        legacyPlayerId: primaryId,
      },
      createdBy: CONFIG.superadminUid,
      updatedBy: CONFIG.superadminUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (CONFIG.dryRun) {
      console.log(`👤 [dry-run] player ${primaryId} →`, payload);
      results.push({ ref: docRef, payload });
      continue;
    }

    await docRef.set(
      {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ...payload,
      },
      { merge: true }
    );
    results.push({ ref: docRef, payload });
  }

  console.log(`✅ ${results.length} giocatori scritti/aggiornati in players_global`);
  return results;
}

async function upsertRosterMembers(rosterRef, playersResults) {
  const batch = db.batch();
  const coll = rosterRef.collection('roster_members');
  const clubRef = db.collection('clubs').doc(CONFIG.clubId);

  playersResults.forEach(({ ref: playerRef, payload }) => {
    const memberRef = coll.doc(payload.playerId);
    const memberData = {
      playerRef,
      playerId: payload.playerId,
      role: payload.role,
      secondaryRoles: payload.secondaryRoles || [],
      clubRef,
      seasonRef: CONFIG.seasonRef,
      sourceRosterId: CONFIG.rosterId,
      addedBy: CONFIG.superadminUid,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      legacy: {
        leagueId: CONFIG.legacyLeagueId,
        playerId: payload.playerId,
      },
    };

    if (CONFIG.dryRun) {
      console.log(`🔗 [dry-run] roster_member ${memberRef.path}`, memberData);
      return;
    }

    batch.set(memberRef, memberData, { merge: true });
  });

  if (CONFIG.dryRun) {
    console.log('📦 [dry-run] roster_members batch pronto, nessuna scrittura eseguita.');
    return;
  }

  await batch.commit();
  console.log(`✅ ${playersResults.length} roster_members scritti/aggiornati`);
}

async function main() {
  try {
    console.log('🚀 Avvio migrazione roster Athletic 2018...');
    const players = await readLegacyPlayers();
    const { ref: clubRef } = await upsertClub();
    const { ref: rosterRef } = await upsertRoster(clubRef);
    const playersResults = await upsertPlayers(players);
    await upsertRosterMembers(rosterRef, playersResults);
    console.log('🎉 Migrazione completata.');
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    process.exit(1);
  } finally {
    await app.delete();
  }
}

main();

