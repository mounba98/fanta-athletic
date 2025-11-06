#!/bin/bash

# Script Backup Firestore - Fanta Athletic
# Esegui questo script prima di iniziare la migrazione multileghe

echo "🔄 Backup Firestore - Fanta Athletic"
echo "======================================"
echo ""

# Configurazione
PROJECT_ID="fanta-athletic"
BACKUP_BUCKET="gs://fanta-athletic.appspot.com/backups"
BACKUP_NAME="backup-pre-multilega-$(date +%Y%m%d-%H%M%S)"

echo "📅 Data backup: $(date)"
echo "📦 Progetto: $PROJECT_ID"
echo "💾 Destinazione: $BACKUP_BUCKET/$BACKUP_NAME"
echo ""

# Verifica Firebase CLI installato
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI non trovato!"
    echo "📦 Installa con: npm install -g firebase-tools"
    exit 1
fi

# Verifica login Firebase
echo "🔐 Verifica autenticazione Firebase..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Non sei autenticato in Firebase!"
    echo "🔑 Esegui: firebase login"
    exit 1
fi

# Verifica progetto selezionato
echo "✅ Firebase CLI disponibile"
echo ""

# Conferma backup
read -p "⚠️  Questo creerà un backup completo di Firestore. Continuare? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Backup annullato"
    exit 1
fi

# Esegui backup
echo ""
echo "🔄 Inizio backup..."
echo "⏳ Questo potrebbe richiedere alcuni minuti..."
echo ""

firebase firestore:export "$BACKUP_BUCKET/$BACKUP_NAME" --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅ BACKUP COMPLETATO CON SUCCESSO! ✅ ✅ ✅"
    echo ""
    echo "📍 Percorso backup: $BACKUP_BUCKET/$BACKUP_NAME"
    echo ""
    echo "📋 Prossimi passi:"
    echo "   1. Verifica backup in Firebase Console → Cloud Storage → backups"
    echo "   2. Puoi procedere con la migrazione multileghe"
    echo "   3. In caso di problemi, restore con:"
    echo "      firebase firestore:import $BACKUP_BUCKET/$BACKUP_NAME --project=$PROJECT_ID"
    echo ""
else
    echo ""
    echo "❌ ❌ ❌ ERRORE DURANTE BACKUP! ❌ ❌ ❌"
    echo ""
    echo "⚠️  NON procedere con la migrazione fino a backup completato!"
    echo "🔍 Controlla errori sopra e riprova"
    exit 1
fi

