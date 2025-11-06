@echo off
setlocal enabledelayedexpansion
REM Script Backup Firestore - Fanta Athletic (Windows)
REM Esegui questo script prima di iniziare la migrazione multileghe

echo.
echo ========================================
echo Backup Firestore - Fanta Athletic
echo ========================================
echo.

REM Configurazione
set PROJECT_ID=fanta-athletic
set BACKUP_BUCKET=gs://fanta-athletic-firestore-backups
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set BACKUP_DATE=%%c
    if %%a LSS 10 set BACKUP_DATE=%%c0%%a
    if %%a GEQ 10 set BACKUP_DATE=%%c%%a
    set BACKUP_MONTH=%%b
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set BACKUP_HOUR=%%a
    set BACKUP_HOUR=!BACKUP_HOUR: =0!
    set BACKUP_MIN=%%b
    set BACKUP_MIN=!BACKUP_MIN: =0!
)
set BACKUP_NAME=backup-pre-multilega-%BACKUP_DATE%%BACKUP_MONTH%-%BACKUP_HOUR%%BACKUP_MIN%

echo Data backup: %date% %time%
echo Progetto: %PROJECT_ID%
echo Destinazione: %BACKUP_BUCKET%/%BACKUP_NAME%
echo.

REM Verifica Google Cloud SDK installato
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: Google Cloud SDK non trovato!
    echo Scarica da: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Verifica autenticazione gcloud
echo Verifica autenticazione Google Cloud...
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if errorlevel 1 (
    echo ERRORE: Non sei autenticato in Google Cloud!
    echo Esegui: gcloud auth login
    pause
    exit /b 1
)

REM Verifica progetto configurato
echo Verifica progetto configurato...
gcloud config set project %PROJECT_ID% >nul 2>&1
if errorlevel 1 (
    echo ERRORE: Impossibile configurare progetto %PROJECT_ID%!
    echo Verifica che il progetto esista e che tu abbia i permessi
    pause
    exit /b 1
)

REM Verifica/Crea bucket backup (regione EU per Firestore)
echo Verifica bucket backup...
gsutil ls "%BACKUP_BUCKET%" >nul 2>&1
if errorlevel 1 (
    echo Bucket non trovato, creazione bucket in regione EU...
    gsutil mb -l eu "%BACKUP_BUCKET%" >nul 2>&1
    if errorlevel 1 (
        echo ERRORE: Impossibile creare bucket %BACKUP_BUCKET%!
        echo Verifica permessi o crea manualmente con: gsutil mb -l eu %BACKUP_BUCKET%
        pause
        exit /b 1
    )
    echo Bucket creato con successo in regione EU
)

echo Google Cloud SDK disponibile
echo Progetto configurato: %PROJECT_ID%
echo Bucket backup: %BACKUP_BUCKET%
echo.

REM Conferma backup
set /p CONFIRM="Questo creerà un backup completo di Firestore. Continuare? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Backup annullato
    pause
    exit /b 1
)

REM Esegui backup
echo.
echo Inizio backup...
echo Questo potrebbe richiedere alcuni minuti...
echo.

gcloud firestore export "%BACKUP_BUCKET%/%BACKUP_NAME%" --project="%PROJECT_ID%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BACKUP COMPLETATO CON SUCCESSO!
    echo ========================================
    echo.
    echo Percorso backup: %BACKUP_BUCKET%/%BACKUP_NAME%
    echo.
    echo Prossimi passi:
    echo   1. Verifica backup in Firebase Console - Cloud Storage - backups
    echo   2. Puoi procedere con la migrazione multileghe
    echo   3. In caso di problemi, restore con:
    echo      firebase firestore:import %BACKUP_BUCKET%/%BACKUP_NAME% --project=%PROJECT_ID%
    echo.
) else (
    echo.
    echo ========================================
    echo ERRORE DURANTE BACKUP!
    echo ========================================
    echo.
    echo NON procedere con la migrazione fino a backup completato!
    echo Controlla errori sopra e riprova
)

pause

