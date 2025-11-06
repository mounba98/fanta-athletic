// 🧹 SCRIPT: Pulisci Console Errors & LocalStorage Vecchio
// Esegui nella console di admin.html o profilo.html

console.log('🧹 Starting cleanup...');

// 1. PULISCI LOCALSTORAGE GIORNATE VECCHIE
console.log('📦 Cleaning old localStorage giornate...');
let cleanedKeys = 0;

for (let i = 1; i <= 24; i++) {
  const keys = [
    `teams_saved_G${i}`,
    `players_G${i}`,
    `coaches_G${i}`,
    `curva_G${i}`,
    `giornata_meta_G${i}`
  ];
  
  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleanedKeys++;
    }
  });
}

console.log(`✅ Removed ${cleanedKeys} old localStorage keys`);

// 2. PULISCI CACHE VECCHIA
console.log('🗑️ Cleaning old cache...');
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      if (!name.includes('2025102134')) { // Keep solo cache attuale
        caches.delete(name);
        console.log('Deleted cache:', name);
      }
    });
  });
}

// 3. CHECK SERVICE WORKER
console.log('⚙️ Checking Service Worker...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(`Found ${registrations.length} service workers`);
    registrations.forEach(reg => {
      console.log('SW scope:', reg.scope);
      console.log('SW state:', reg.active?.state);
    });
  });
}

// 4. VERIFICA CONSOLE ERRORS RIMANENTI
console.log('🔍 Checking for remaining errors...');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

setTimeout(() => {
  console.log(`📊 Errors counted in last 3s: ${errorCount}`);
  if (errorCount === 0) {
    console.log('✅ NO ERRORS! Console pulita!');
  } else {
    console.log('⚠️ Ancora', errorCount, 'errori. Verifica qui sopra.');
  }
  console.error = originalError; // Ripristina
}, 3000);

// 5. CLEAR SPECIFICI (SAFE)
console.log('🎯 Clearing specific deprecated keys...');
const deprecatedKeys = [
  'teams_data_old',
  'backup_formations',
  'temp_lineup',
  'draft_formation'
];

deprecatedKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  }
});

console.log('');
console.log('✅ CLEANUP COMPLETATO!');
console.log('');
console.log('📝 NEXT STEPS:');
console.log('1. Ricarica la pagina (F5)');
console.log('2. Verifica console errors');
console.log('3. Se ancora errori, screenshot e manda');
console.log('');
console.log('💡 TIP: Svuota cache browser (Ctrl+Shift+Del) se persistono');

/* 
==============================================
COME USARE QUESTO SCRIPT
==============================================

1. Apri admin.html o profilo.html
2. Apri Console (F12)
3. Copia TUTTO questo script
4. Incolla nella console
5. Premi Invio
6. Aspetta 3 secondi
7. Leggi i risultati
8. Ricarica pagina (F5)

==============================================
SE ANCORA 47 ERRORI
==============================================

Possibili cause:
- Firebase deprecated warnings
- React dev mode (se usato)
- Network requests falliti
- Third-party scripts

Debug ulteriore:
1. Filtra console per "error" (pulsante filtro)
2. Screenshot errori specifici
3. Controlla se bloccanti o solo warnings
4. Manda screenshot in chat

==============================================
SAFE TO RUN
==============================================

Questo script è SAFE:
- Non cancella teams_data (importante!)
- Non cancella user login
- Non cancella configurazioni
- Solo pulizia cache/temp

SAFE ✅
*/
