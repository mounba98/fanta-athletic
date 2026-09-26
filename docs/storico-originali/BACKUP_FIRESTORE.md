# 💾 Guida Backup Firestore - Fanta Athletic

**Data:** Dicembre 2024

---

## 🎯 PERCHÉ FARE BACKUP

Prima di iniziare la migrazione multileghe, è **fondamentale** fare un backup completo di Firestore per:
- **Sicurezza:** Recuperare dati in caso di errori durante migrazione
- **Rollback:** Tornare allo stato precedente se qualcosa va storto
- **Testing:** Testare migrazione su copia dei dati senza rischi
- **Pace mentale:** Sapere di avere un backup sicuro

---

## 📦 METODO 1: Firebase Console (Manuale)

### Passo 1: Accedi a Firebase Console
1. Vai su https://console.firebase.google.com/
2. Seleziona il progetto `fanta-athletic`
3. Vai su **Firestore Database** → **Data**

### Passo 2: Esporta Dati
1. Clicca su **"..."** (menu) in alto a destra
2. Seleziona **"Export"** o **"Esporta"**
3. Scegli destinazione:
   - **Cloud Storage bucket:** `gs://fanta-athletic.firebasestorage.app/backups`
   - Oppure crea nuovo bucket dedicato

### Passo 3: Configura Esportazione
- **Collection IDs:** Seleziona tutte le collezioni o specifiche
- **Nome backup:** `backup-pre-migration-YYYY-MM-DD`
- **Formato:** `JSON` o `Firestore format` (raccomandato)

### Passo 4: Avvia Esportazione
- Clicca **"Export"**
- Attendi completamento (può richiedere tempo per grandi database)

### Passo 5: Verifica Backup
- Vai su **Cloud Storage** → **backups**
- Verifica che i file siano presenti

---

## 🔧 METODO 2: Firebase CLI (Raccomandato)

### Prerequisiti
1. **Installa Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login Firebase:**
   ```bash
   firebase login
   ```

3. **Seleziona progetto:**
   ```bash
   firebase use fanta-athletic
   ```

### Backup Completo Firestore

#### Opzione A: Backup su Cloud Storage (Raccomandato)
```bash
# IMPORTANTE: Il bucket deve essere nella stessa regione del database Firestore (EU)
# Crea bucket se non esiste (regione EU)
gsutil mb -l eu gs://fanta-athletic-firestore-backups

# Crea backup su Cloud Storage
gcloud firestore export gs://fanta-athletic-firestore-backups/backup-$(date +%Y%m%d-%H%M%S) --project=fanta-athletic
```

**Nota Windows PowerShell:**
```powershell
# Crea bucket se non esiste
gsutil mb -l eu gs://fanta-athletic-firestore-backups

# Backup con data/ora
$backupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
gcloud firestore export "gs://fanta-athletic-firestore-backups/$backupName" --project=fanta-athletic
```

#### Opzione B: Backup Locale
```bash
# Crea cartella backup
mkdir -p backups/firestore

# Esporta in formato JSON locale (richiede script personalizzato)
# Nota: Firebase CLI non supporta export locale diretto
# Usa Cloud Storage e poi scarica
```

#### Opzione C: Script Automatico Backup
**Windows:** Usa `backup-firestore.bat` (già presente nel progetto)
```batch
.\backup-firestore.bat
```

**Linux/Mac:** Crea file `backup-firestore.sh`:
```bash
#!/bin/bash

# Configurazione
PROJECT_ID="fanta-athletic"
BACKUP_BUCKET="gs://fanta-athletic-firestore-backups"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"

echo "🔄 Inizio backup Firestore..."
echo "📅 Data: $(date)"
echo "📦 Progetto: $PROJECT_ID"
echo "💾 Destinazione: $BACKUP_BUCKET/$BACKUP_NAME"

# Esegui backup
firebase firestore:export "$BACKUP_BUCKET/$BACKUP_NAME" --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo "✅ Backup completato con successo!"
    echo "📍 Percorso: $BACKUP_BUCKET/$BACKUP_NAME"
else
    echo "❌ Errore durante backup!"
    exit 1
fi
```

Esegui:
```bash
chmod +x backup-firestore.sh
./backup-firestore.sh
```

> ℹ️ Dopo il backup, la migrazione multilega utilizza l'ID fisso `fanta-athletic-legacy` come lega "default". Verifica che l'esportazione includa anche le collezioni legacy (`teams`, `players`, `coaches`, `results`, `days`, `deadlines`) prima di procedere con lo script `migrate-existing-data.html`.

---

## 📥 DOWNLOAD BACKUP DA CLOUD STORAGE

### Metodo 1: Firebase Console
1. Vai su **Cloud Storage** → **backups**
2. Clicca sul backup desiderato
3. Clicca **"Download"**

### Metodo 2: gsutil CLI
```bash
# Installa gsutil (parte di Google Cloud SDK)
# macOS: brew install google-cloud-sdk
# Windows: Download da https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Scarica backup
gsutil -m cp -r gs://fanta-athletic.firebasestorage.app/backups/backup-YYYYMMDD-HHMMSS ./local-backup/
```

---

## 🔄 RESTORE BACKUP

### Metodo 1: Firebase Console
1. Vai su **Firestore Database** → **Data**
2. Clicca **"..."** → **"Import"**
3. Seleziona backup da Cloud Storage
4. **⚠️ ATTENZIONE:** Questo sovrascrive i dati esistenti!
5. Conferma importazione

### Metodo 2: Firebase CLI
```bash
# Importa backup da Cloud Storage
firebase firestore:import gs://fanta-athletic.firebasestorage.app/backups/backup-YYYYMMDD-HHMMSS --project=fanta-athletic
```

**⚠️ ATTENZIONE:** Questo sovrascrive i dati esistenti!

---

## 📋 BACKUP PRIMA DELLA MIGRAZIONE

### Checklist Pre-Migrazione

1. **Backup Completo:**
   ```bash
firebase firestore:export gs://fanta-athletic.firebasestorage.app/backups/backup-pre-migration-$(date +%Y%m%d-%H%M%S)
   ```

2. **Verifica Backup:**
   - Controlla dimensione (non deve essere 0)
   - Verifica presenza file in Cloud Storage
   - Testa restore su progetto di test (opzionale ma raccomandato)

3. **Documenta:**
   - Data backup
   - Percorso backup
   - Dimensioni backup
   - Note particolari

4. **Backup Aggiuntivi:**
   - Firebase Storage (immagini giocatori, coach, loghi)
   - Firebase Authentication (se necessario)

---

## 🗂️ STRUTTURA BACKUP

Un backup Firestore contiene:
- **Metadata:** Informazioni sulle collezioni
- **Dati:** Documenti e subcollezioni
- **Index:** Index definiti (opzionale)

Struttura tipica:
```
backup-YYYYMMDD-HHMMSS/
  ├── all_namespaces/
  │   └── all_kinds/
  │       ├── teams/
  │       ├── players/
  │       ├── coaches/
  │       ├── results/
  │       └── ...
  └── metadata
```

---

## ⚠️ NOTE IMPORTANTI

### Limitazioni
- **Dimensione:** Backup grandi possono richiedere molto tempo
- **Costo:** Cloud Storage ha costi di storage (minimali)
- **Restore:** Il restore sovrascrive dati esistenti (irreversibile!)

### Best Practices
1. **Backup regolari:** Prima di ogni modifica importante
2. **Backup multipli:** Mantieni almeno 2-3 backup recenti
3. **Test restore:** Prova restore su progetto di test prima di produzione
4. **Documentazione:** Tieni traccia di ogni backup (data, motivo, dimensione)

### Backup Automatici
- Firebase offre backup automatici per progetti Enterprise
- Per progetti standard, fare backup manuali prima di modifiche importanti

---

## 🎯 RACCOMANDAZIONE PER MIGRAZIONE

### Prima di Iniziare Migrazione:

1. **Backup Completo:**
   ```bash
   firebase firestore:export gs://fanta-athletic.firebasestorage.app/backups/backup-pre-multilega-$(date +%Y%m%d-%H%M%S)
   ```

2. **Backup Storage (immagini):**
   ```bash
   gsutil -m cp -r gs://fanta-athletic.firebasestorage.app/player-photos ./backups/player-photos/
   gsutil -m cp -r gs://fanta-athletic.firebasestorage.app/coach-photos ./backups/coach-photos/
   ```

3. **Verifica:**
   - Controlla che backup sia completo
   - Verifica dimensioni ragionevoli
   - Documenta percorso backup

4. **Test (Opzionale ma Raccomandato):**
   - Crea progetto Firebase di test
   - Restore backup su progetto di test
   - Testa migrazione su progetto di test
   - Se tutto ok, procedi su produzione

---

## 📞 SUPPORTO

Se hai problemi con backup:
- **Firebase Console:** https://console.firebase.google.com/
- **Documentazione:** https://firebase.google.com/docs/firestore/manage-data/export-import
- **Support:** https://firebase.google.com/support

---

**⚠️ RICORDA:** Un backup è inutile se non lo testi! Fai sempre un restore di test prima di modifiche importanti.

