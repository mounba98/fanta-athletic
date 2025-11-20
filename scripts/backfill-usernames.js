#!/usr/bin/env node
/**
 * Backfill della collection "usernames" a partire dai documenti in /users.
 * Utile per ristabilire il login tramite username senza dover fornire accesso pubblico a /users.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/creds.json \
 *   node scripts/backfill-usernames.js --project fanta-athletic
 *
 * Opzioni:
 *   --project <id>       (default: fanta-athletic)
 *   --dry-run            Mostra cosa verrebbe scritto senza modificare Firestore
 *   --limit <n>          Limita il numero di utenti processati (per test)
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

function sanitizeVariant(value) {
  if (!value || typeof value !== 'string') return null;
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\.+/g, '')
    .replace(/[^a-z0-9_-]/g, '');
}

async function main() {
  const args = parseArgs();
  const projectId = args.project || process.env.GCLOUD_PROJECT || 'fanta-athletic';
  const dryRun = args['dry-run'] === true;
  const limit = args.limit ? Number(args.limit) : null;

  if (!admin.apps.length) {
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault()
    });
  }

  const db = admin.firestore();
  const usersCol = db.collection('users');
  const usernamesCol = db.collection('usernames');

  console.log(`🚀 Backfill usernames (project=${projectId}, dryRun=${dryRun ? 'yes' : 'no'})`);

  let processed = 0;
  let updatedVariants = 0;

  const snapshot = await usersCol.get();
  console.log(`👤 Trovati ${snapshot.size} utenti in /users`);

  const batchSize = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    if (limit && processed >= limit) break;
    processed += 1;

    const data = doc.data() || {};
    const variants = new Set();

    const candidateFields = [
      data.username,
      data.displayName,
      data.displayNameLower,
      data.firstName && data.lastName ? `${data.firstName}.${data.lastName}` : null,
      data.firstName && data.lastName ? `${data.firstName}${data.lastName}` : null,
      ...(Array.isArray(data.usernameVariants) ? data.usernameVariants : [])
    ];

    candidateFields.forEach(value => {
      const variant = sanitizeVariant(value);
      if (variant) variants.add(variant);
    });

    if (!variants.size) {
      console.warn(`⚠️ Nessun username valido per utente ${doc.id} (${data.email || 'email sconosciuta'})`);
      continue;
    }

    const payload = {
      uid: doc.id,
      email: (data.email || '').toLowerCase(),
      displayName: data.displayName || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (dryRun) {
      console.log(`· [dry-run] ${doc.id} -> ${Array.from(variants).join(', ')}`);
      continue;
    }

    variants.forEach(variant => {
      const ref = usernamesCol.doc(variant);
      batch.set(ref, payload, { merge: true });
      updatedVariants += 1;
      batchCount += 1;
      if (batchCount >= batchSize) {
        batch.commit().catch(err => console.error('❌ Errore commit batch:', err));
        batch = db.batch();
        batchCount = 0;
      }
    });
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Elaborati ${processed} utenti`);
  if (!dryRun) {
    console.log(`✅ Aggiornati ${updatedVariants} username variants`);
  } else {
    console.log('ℹ️ Dry-run completato (nessuna scrittura eseguita)');
  }
}

main().catch(err => {
  console.error('❌ Errore backfill usernames:', err);
  process.exit(1);
});


