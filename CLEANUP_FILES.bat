@echo off
chcp 65001 >nul
echo ========================================
echo CLEANUP FILE OBSOLETI - Fanta Athletic
echo ========================================
echo.
echo Elimino 49 file obsoleti (2MB)
echo.
pause

cd /d "%~dp0"

echo Eliminazione in corso...

del /Q "DEPLOY_10_SUMMARY.md" 2>nul
del /Q "DEPLOY_11_FINAL.md" 2>nul
del /Q "DEPLOY_12_FINAL.md" 2>nul
del /Q "DEPLOY_14_FINAL_FIX.md" 2>nul
del /Q "DEPLOY_15_MEGA_BATCH.md" 2>nul
del /Q "DEPLOY_16_FINAL_FIX_BATCH.md" 2>nul
del /Q "DEPLOY_17_FINAL.md" 2>nul
del /Q "DEPLOY_18_FIREBASE_INIT_FIX.md" 2>nul
del /Q "DEPLOY_19_APP_CHECK.md" 2>nul
del /Q "DEPLOY_20_APP_CHECK_FINAL.md" 2>nul
del /Q "DEPLOY_21_FINAL_FIX.md" 2>nul
del /Q "DEPLOY_23_PERMISSIONS_INVITES.md" 2>nul
del /Q "DEPLOY_25_CRITICAL_FIXES.md" 2>nul
del /Q "DEPLOY_28_FINALE.md" 2>nul
del /Q "DEPLOY_28_FIX_FIREBASE.md" 2>nul
del /Q "DEPLOY_28_FIX_PARTE2.md" 2>nul
del /Q "DEPLOY_29_JOIN_LEAGUE_FIX.md" 2>nul
del /Q "DEPLOY_30_FIRESTORE_RULES_FIX.md" 2>nul
del /Q "DEPLOY_34_FOTO_GIOCATORI.md" 2>nul
del /Q "DEPLOY_35_FIX_FOTO_JOINLEAGUE.md" 2>nul
del /Q "DEPLOY_36_FIX_CRITICAL.md" 2>nul
del /Q "DEPLOY_37_FIX_SERVICE_WORKER.md" 2>nul
del /Q "DEPLOY_39_FIX_FINALE.md" 2>nul
del /Q "DEPLOY_40_FIX_MODAL_INVITECODE.md" 2>nul
del /Q "DEPLOY_41_FIX_USERS_E_FOTO.md" 2>nul
del /Q "DEPLOY_42_FIX_LEAGUE_SELECTOR.md" 2>nul
del /Q "DEPLOY_43_SCEGLI_SQUADRA.md" 2>nul
del /Q "DEPLOY_47_FIX_TEAMS_ARRAY.md" 2>nul
del /Q "DEPLOY_48_FIX_ARCHITETTURA_TEAMS_COMPLETO.md" 2>nul
del /Q "DEPLOY_50_FINALE_FLUSSO_COMPLETO.md" 2>nul
del /Q "DEPLOY_51_FIX_MOBILE_FORMAZIONI.md" 2>nul
del /Q "ADMIN_FIX.md" 2>nul
del /Q "ANALISI_PROBLEMI_GLOBALI.md" 2>nul
del /Q "AZIONI_URGENTI_DA_FARE.md" 2>nul
del /Q "BACHECA_IMPROVEMENTS.md" 2>nul
del /Q "BUG_FIXES_COMPETIZIONI.md" 2>nul
del /Q "COMPLETE_WORK_LOG.md" 2>nul
del /Q "CRITICAL_FIXES_FINAL.md" 2>nul
del /Q "DEBUG_MATCHDAY_CALCOLO.md" 2>nul
del /Q "FIRESTORE_RULES_DEPLOY.md" 2>nul
del /Q "FORMAZIONI_LOCK_FIX.md" 2>nul
del /Q "FRONTEND_FIXES.md" 2>nul
del /Q "GIOCATORI_MULTIPLI_FIX.md" 2>nul
del /Q "GIORNATA_1_CALCOLO_COMPLETO.md" 2>nul
del /Q "GIORNATA_1_CALCOLO_FIX.md" 2>nul
del /Q "GIORNATA_1_CALCOLO_SUMMARY.md" 2>nul
del /Q "GIORNATA_1_FINAL_FIX.md" 2>nul
del /Q "GIORNATA_2_CALCOLO_COMPLETO.md" 2>nul
del /Q "GIORNATA_2_FIX_FINALE.md" 2>nul
del /Q "H2H_RESULTS_FIX.md" 2>nul
del /Q "HOTFIX_GIORNATA_2.md" 2>nul
del /Q "HOTFIX_RESULTS_STRUCTURE.md" 2>nul
del /Q "JOIN_LEAGUE_FIX.md" 2>nul
del /Q "LEAGUE_SELECTOR_FIX.md" 2>nul
del /Q "MATCHDAY_REFACTORING.md" 2>nul
del /Q "NAVBAR_REFACTORING.md" 2>nul
del /Q "PHOTO_UPLOAD_GUIDE.md" 2>nul
del /Q "REGOLE_CALCOLO_SUMMARY.md" 2>nul
del /Q "RESULTS_STRUCTURE_FIX.md" 2>nul
del /Q "RULES_SYSTEM_SUMMARY.md" 2>nul
del /Q "SCEGLI_SQUADRA_FIX.md" 2>nul
del /Q "SESSION_REPORT_22_OCT_2025.md" 2>nul
del /Q "SETUP_GUIDE.md" 2>nul
del /Q "SQUADRE_UTENTI_FIX.md" 2>nul
del /Q "STORAGE_RULES_FIX.md" 2>nul
del /Q "TEAMS_ARRAY_FIX.md" 2>nul
del /Q "UPLOAD_FOTO_GUIDE.md" 2>nul
del /Q "USER_FLOW_COMPLETO.md" 2>nul
del /Q "WIRC_BATCH_GUIDE.md" 2>nul
del /Q "WIRC_ROYALE_TODO.md" 2>nul
del /Q "WIRC_SNAP_AUDIO_README.md" 2>nul
del /Q "WIRC_SNAP_V3_README.md" 2>nul
del /Q "WIRC_SNAP_V4_README.md" 2>nul
del /Q "DEPLOY_README.txt" 2>nul
del /Q "DEPLOY_SUCCESS_LOG.txt" 2>nul
del /Q "MESSAGGIO_WHATSAPP_FINALE.txt" 2>nul
del /Q "WIRC_SNAP_CARDS_BALANCED.txt" 2>nul

echo.
echo [OK] 49 file eliminati!
echo.
pause
