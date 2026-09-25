/**
 * Auth Guard v2025102103 - Login Obbligatorio
 * Protegge tutte le pagine da accesso non autenticato
 * v2025101905
 */

(function() {
  'use strict';
  // Caricato sia dalla pagina sia da app-init.js: il secondo avvio si ferma qui (D099)
  if (window.__FA_AUTH_GUARD_ON) return;
  window.__FA_AUTH_GUARD_ON = true;
  
  const USERNAME_REGEX = /^[a-z0-9._-]{3,20}$/;
  const RESERVED_USERNAMES = new Set(['utente', 'admin', 'administrator', 'root', 'supporto', 'support', 'moderator', 'mod']);
  let ensureUsernamePromise = null;
  let usernameMappingDisabled = false;
  try {
    usernameMappingDisabled = localStorage.getItem('username_mapping_disabled') === '1';
  } catch (_) {}
  
  // Check se auth guard è disabilitato globalmente
  if (window.__DISABLE_AUTH_GUARD__) {
    console.log('🔓 Auth guard disabilitato per questa pagina');
    return;
  }
  
  // Pages che NON richiedono login
  const PUBLIC_PAGES = ['auth.html', 'login.html', 'register.html', 'index.html', 'store.html', 'adsense-verification.html', 'privacy.html', 'terms.html', 'join-league.html', 'scegli-squadra.html', 'join-team.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  // Se è pagina pubblica, esci
  if (PUBLIC_PAGES.includes(currentPage)) {
    return;
  }
  
  // Whitelist per bot Google AdSense e crawler
  function isGoogleBot() {
    const userAgent = navigator.userAgent || '';
    const referrer = document.referrer || '';
    const isGoogleCrawler = /googlebot|google|mediapartners-google|adsbot-google/i.test(userAgent);
    const isGoogleReferrer = /google\.com|googlebot\.com|adsense|doubleclick/i.test(referrer);
    const isGoogleIP = /66\.249\.|64\.233\.|72\.14\.|74\.125\.|209\.85\.|216\.239\.|66\.102\.|108\.177\.|172\.217\.|142\.250\.|216\.58\./i.test(window.location.hostname);
    
    // Check anche per query params che AdSense potrebbe usare
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdSenseParam = urlParams.has('adsense') || urlParams.has('googlebot');
    
    return isGoogleCrawler || isGoogleReferrer || hasAdSenseParam;
  }
  
  // Se è un bot Google, lascia passare
  if (isGoogleBot()) {
    console.log('🤖 Google bot detected, allowing access for AdSense verification');
    return;
  }
  
  // Attendi che Firebase sia pronto
  function initAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.warn('⚠️ Firebase non ancora caricato, retry in 100ms...');
      setTimeout(initAuth, 100);
      return;
    }
    
    // Verifica autenticazione
    firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      // Non autenticato → redirect a login
      localStorage.setItem('redirect_after_login', window.location.href);
      window.location.href = 'auth.html';
      return;
    }
    
    // Utente autenticato
    window.currentUser = user;
    
    try {
      await ensureUsernameForUser(user);
    } catch (err) {
      console.error('[auth-guard] Impossibile verificare username utente:', err);
    }
    
    // Auto-load ultima lega vista
    await loadLastLeague();
    
    // Trigger evento per altre funzioni
    window.dispatchEvent(new CustomEvent('auth-ready', { detail: { user } }));
  });
  } // Fine initAuth()
  
  // Avvia auth quando il file viene caricato
  initAuth();
  
  /**
   * Carica ultima lega vista dall'utente
   */
  async function loadLastLeague() {
    // Se siamo in modalità legacy (permission denied), salta onboarding
    if (window.__LEAGUE_PERMISSION_DENIED__) {
      console.warn('[auth-guard] Legacy mode - skipping league loading and onboarding');
      return;
    }
    
    const lastLeagueId = localStorage.getItem('last_league_id');
    
    if (!lastLeagueId) {
      // Prima volta: verifica se ha leghe
      const userLeagues = await getUserLeagues();
      
      // Se dopo getUserLeagues siamo in legacy mode, non mostrare onboarding
      if (window.__LEAGUE_PERMISSION_DENIED__) {
        console.warn('[auth-guard] Permission denied after getUserLeagues - skipping onboarding');
        return;
      }
      
      if (userLeagues.length === 0) {
        // Nessuna lega → mostra onboarding solo se non siamo in legacy mode
        if (!window.__LEAGUE_PERMISSION_DENIED__) {
          showOnboardingModal();
        }
      } else {
        // Ha leghe ma nessuna selezionata → prendi la prima
        setCurrentLeague(userLeagues[0].id);
      }
    } else {
      // Ha una lega salvata → caricala
      const leagueExists = await checkLeagueExists(lastLeagueId);
      
      if (!leagueExists) {
        // Lega non più accessibile → reset
        localStorage.removeItem('last_league_id');
        await loadLastLeague(); // Ricorsione
      } else {
        setCurrentLeague(lastLeagueId);
      }
    }
  }
  
  /**
   * Ottieni tutte le leghe dell'utente
   */
  async function getUserLeagues() {
    try {
      const db = firebase.firestore();
      const user = window.currentUser;
      if (!user) return [];
      
      // PRIMA: Prova a leggere la lega dal documento utente (funziona per non-admin)
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentLeagueId = userData.currentLeague || (userData.leagues && userData.leagues[0]);
          
          if (currentLeagueId) {
            try {
              const leagueDoc = await db.collection('leagues').doc(currentLeagueId).get();
              if (leagueDoc.exists) {
                const leagueData = leagueDoc.data();
                // Verifica che l'utente sia effettivamente membro
                if (leagueData.members && leagueData.members.includes(user.uid)) {
                  return [{ id: leagueDoc.id, ...leagueData }];
                }
              }
            } catch (err) {
              console.warn('[auth-guard] Error loading league from user doc:', err);
            }
          }
        }
      } catch (err) {
        console.warn('[auth-guard] Error reading user doc:', err);
      }
      
      // FALLBACK: Prova query (funziona solo per admin)
      try {
        const snapshot = await db.collection('leagues')
          .where('members', 'array-contains', user.uid)
          .get();
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (error?.code === 'permission-denied') {
          console.warn('[auth-guard] Permission denied on leagues query - user may not have leagues');
        } else {
          console.error('[auth-guard] Error loading user leagues:', error);
        }
        return [];
      }
    } catch (error) {
      console.error('[auth-guard] Error in getUserLeagues:', error);
      return [];
    }
  }
  
  /**
   * Verifica se lega esiste e utente ha accesso
   */
  async function checkLeagueExists(leagueId) {
    try {
      const doc = await firebase.firestore()
        .collection('leagues')
        .doc(leagueId)
        .get();
      
      if (!doc.exists) return false;
      
      const data = doc.data();
      return data.members && data.members.includes(window.currentUser.uid);
    } catch (error) {
      console.error('Error checking league:', error);
      return false;
    }
  }
  
  /**
   * Imposta lega corrente
   */
  function setCurrentLeague(leagueId) {
    localStorage.setItem('last_league_id', leagueId);
    window.currentLeagueId = leagueId;
    window.dispatchEvent(new CustomEvent('league-changed', { detail: { leagueId } }));
  }
  
  /**
   * Mostra modal onboarding per nuovi utenti
   */
  async function showOnboardingModal() {
    // Check if user is super admin - they don't need onboarding
    if (window.__LEAGUE_PERMISSION_DENIED__) {
      console.warn('[auth-guard] onboarding skipped: league access denied');
      return;
    }

    try {
      const adminDoc = await firebase.firestore().collection('admins').doc(window.currentUser.uid).get();
      if (adminDoc.exists) {
        console.log('Super admin detected - skipping onboarding');
        return; // Super admin can access everything without a league
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    
    // Verifica se esiste già il modal
    if (document.getElementById('onboardingModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'onboardingModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px; text-align: center; position: relative;">
        <button onclick="document.getElementById('onboardingModal').remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--muted); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">×</button>
        <div style="font-size: 64px; margin-bottom: 20px;">🏆</div>
        <h2 style="margin-bottom: 12px;">Benvenuto in Fanta Athletic!</h2>
        <p style="color: var(--muted); margin-bottom: 30px;">
          Per iniziare, crea una nuova competizione o unisciti a una esistente.
        </p>
        
        <div style="display: grid; gap: 12px;">
          <a href="admin-leghe.html" class="btn btn-primary" style="text-decoration: none; display: block; padding: 14px;">
            ➕ Crea Nuova Competizione
          </a>
          <button class="btn btn-secondary" onclick="window.showJoinModal?window.showJoinModal():alert('Funzione non disponibile')" style="width: 100%; padding: 14px;">
            🔍 Unisciti con Codice
          </button>
        </div>
        
        <p style="font-size: 12px; color: var(--muted); margin-top: 20px; cursor: pointer;" onclick="document.getElementById('onboardingModal').remove()">
          Salta per ora
        </p>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Stili modal
    if (!document.getElementById('onboardingStyles')) {
      const styles = document.createElement('style');
      styles.id = 'onboardingStyles';
      styles.textContent = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        .modal-content {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          animation: slideUp 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        :root.dark .modal-content {
          background: #1e293b;
        }
      `;
      document.head.appendChild(styles);
    }
  }
  
  /**
   * Mostra modal per join con codice
   */
  window.showJoinModal = function() {
    const existingModal = document.getElementById('joinModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'joinModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 400px;">
        <h3 style="margin-bottom: 12px;">🔍 Unisciti a Competizione</h3>
        <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">
          Inserisci il codice invito ricevuto
        </p>
        
        <input 
          type="text" 
          id="joinCodeInput" 
          class="input" 
          placeholder="Codice (es. ABC123)" 
          maxlength="6"
          style="width: 100%; text-transform: uppercase; margin-bottom: 16px; font-size: 18px; text-align: center; letter-spacing: 3px;"
        />
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button class="btn btn-secondary" onclick="closeJoinModal()">Annulla</button>
          <button class="btn btn-primary" onclick="joinWithCode()">Unisciti</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus su input
    setTimeout(() => {
      document.getElementById('joinCodeInput').focus();
    }, 100);
    
    // Enter per conferma
    document.getElementById('joinCodeInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') window.joinWithCode();
    });
  };
  
  window.closeJoinModal = function() {
    const modal = document.getElementById('joinModal');
    if (modal) modal.remove();
  };
  
  window.joinWithCode = async function() {
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    
    console.log('🔍 [MODAL] Searching for code:', code);
    
    if (!code || code.length !== 6) {
      alert('❌ Inserisci un codice valido (6 caratteri)');
      return;
    }
    
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        alert('⚠️ Devi effettuare il login prima di unirti a una lega');
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `auth.html?redirect=${currentUrl}`;
        return;
      }

      // Verifica che firestore sia caricato
      if (!firebase.firestore || !window.db) {
        console.error('Firestore not loaded!');
        alert('❌ Errore: Database non caricato. Ricarica la pagina.');
        return;
      }

      const uid = user.uid;
      const db = window.db || firebase.firestore();
      
      console.log('🔍 [MODAL] Querying Firestore for inviteCode:', code);
      
      // Cerca lega per codice (FIX: inviteCode invece di joinCode)
      const leaguesSnapshot = await db
        .collection('leagues')
        .where('inviteCode', '==', code)
        .limit(1)
        .get();
      
      console.log('📊 [MODAL] Query results:', leaguesSnapshot.size);
      
      let leagueId, leagueData;

      if (leaguesSnapshot.empty) {
        console.log('❌ [MODAL] Code not found, trying client-side fallback...');
        
        // Fallback: carica tutte le leghe e filtra client-side
        const allLeagues = await db.collection('leagues').get();
        console.log('📋 [MODAL] All leagues:', allLeagues.size);
        
        let foundLeague = null;
        allLeagues.docs.forEach(doc => {
          const data = doc.data();
          const storedCode = (data.inviteCode || '').trim().toUpperCase();
          console.log(`  - ${doc.id}: inviteCode="${data.inviteCode}" (stored: "${storedCode}", searching: "${code}")`);
          
          if (storedCode === code) {
            console.log('✅ [MODAL] FOUND via client-side filter!');
            foundLeague = { id: doc.id, data };
          }
        });
        
        if (!foundLeague) {
          console.error('❌ [MODAL] Code not found after fallback');
          alert('❌ Codice non valido');
          return;
        }
        
        // Usa lega trovata
        leagueId = foundLeague.id;
        leagueData = foundLeague.data;
      } else {
        leagueId = leaguesSnapshot.docs[0].id;
        leagueData = leaguesSnapshot.docs[0].data();
        console.log('✅ [MODAL] League found:', leagueId);
      }

      // Verifica se già membro
      if (leagueData.members && leagueData.members.includes(uid)) {
        alert('⚠️ Sei già membro di questa lega');
        window.location.href = 'index.html';
        return;
      }

      // Aggiungi alla lega
      await db.collection('leagues').doc(leagueId).update({
        members: firebase.firestore.FieldValue.arrayUnion(uid)
      });

      // Aggiorna/Crea utente (set con merge crea doc se non esiste)
      await db.collection('users').doc(uid).set({
        leagues: firebase.firestore.FieldValue.arrayUnion(leagueId),
        currentLeague: leagueId,
        uid: uid,
        email: user.email,
        displayName: user.displayName || 'User',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log('✅ [MODAL] User document updated/created');
      
      // Chiudi modal
      closeJoinModal();

      alert('✅ Ti sei unito alla lega con successo! Ora scegli una squadra.');
      
      // Redirect a pagina selezione squadra
      window.location.href = 'scegli-squadra.html';
    } catch (error) {
      console.error('Error joining league:', error);
      alert(`❌ Errore: ${error.message || 'Riprova'}`);
    }
  };
  
  function normalizeUsername(value) {
    if (!value) return '';
    return value.trim().toLowerCase();
  }
  
  function isStoredUsernameValid(value) {
    if (!value || typeof value !== 'string') return false;
    const normalized = normalizeUsername(value);
    if (!normalized) return false;
    if (RESERVED_USERNAMES.has(normalized)) return false;
    return USERNAME_REGEX.test(normalized);
  }
  
  function buildUsernameVariants(base) {
    const variants = new Set();
    if (!base) return variants;
    variants.add(base);
    const noDots = base.replace(/\./g, '');
    variants.add(noDots);
    const noUnderscore = base.replace(/_/g, '');
    variants.add(noUnderscore);
    const noHyphen = base.replace(/-/g, '');
    variants.add(noHyphen);
    const alnumOnly = base.replace(/[^a-z0-9]/g, '');
    variants.add(alnumOnly);
    return new Set(Array.from(variants).filter(Boolean));
  }
  
function detectExistingUsername(data = {}, user = null) {
  const candidates = [
    data.username,
    data.usernameLower,
    data.profile?.username,
    data.profile?.nickname,
    data.nickname,
    data.display_name,
    data.displayName,
    user?.displayName
  ];
  for (const raw of candidates) {
    if (isStoredUsernameValid(raw)) return raw;
  }
  return '';
}

  function disableUsernameMapping() {
    if (usernameMappingDisabled) return;
    usernameMappingDisabled = true;
    try { localStorage.setItem('username_mapping_disabled', '1'); } catch (_) {}
  }

  async function ensureUsernameMapping(db, userId, username, existingVariants = []) {
    if (!db || !userId || !username) return;
    const normalized = normalizeUsername(username);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    const userRef = db.collection('users').doc(userId);

    if (usernameMappingDisabled) {
      await userRef.set({
        username: normalized,
        usernameLower: normalized,
        usernameUpdatedAt: timestamp
      }, { merge: true });
      window.currentUsername = normalized;
      return;
    }

    const variants = buildUsernameVariants(normalized);
    const staleVariants = Array.isArray(existingVariants)
      ? existingVariants.filter(v => v && !variants.has(v))
      : [];
    
    const staleToDelete = [];
    for (const variant of staleVariants) {
      try {
        const snap = await db.collection('usernames').doc(variant).get();
        if (snap.exists && snap.data()?.uid === userId) {
          staleToDelete.push(variant);
        }
      } catch (err) {
        console.warn('[auth-guard] impossibile verificare variant username da rimuovere', variant, err);
      }
    }
    
    const batch = db.batch();
    
    variants.forEach(variant => {
      const ref = db.collection('usernames').doc(variant);
      batch.set(ref, {
        uid: userId,
        username: normalized,
        updatedAt: timestamp
      }, { merge: true });
    });
    
    staleToDelete.forEach(variant => {
      batch.delete(db.collection('usernames').doc(variant));
    });
    
  batch.set(userRef, {
      username: normalized,
      usernameLower: normalized,
      usernameVariants: Array.from(variants),
      usernameUpdatedAt: timestamp
    }, { merge: true });
    
  try {
    await batch.commit();
    window.currentUsername = normalized;
  } catch (err) {
    if (err?.code === 'permission-denied') {
      console.warn('[auth-guard] impossibile aggiornare mapping username (permessi). Salvo solo nel profilo utente.', err);
      disableUsernameMapping();
      await userRef.set({
        username: normalized,
        usernameLower: normalized,
        usernameUpdatedAt: timestamp
      }, { merge: true });
      window.currentUsername = normalized;
      return;
    }
    throw err;
  }
    window.currentUsername = normalized;
  }
  
  async function ensureUsernameForUser(user) {
    if (!user || !firebase.firestore) return null;
    if (ensureUsernamePromise) return ensureUsernamePromise;
    
    ensureUsernamePromise = (async () => {
      const db = firebase.firestore();
      const docRef = db.collection('users').doc(user.uid);
      let userData = {};
      try {
        const snap = await docRef.get();
        if (snap.exists) {
          userData = snap.data() || {};
        } else {
          userData = {};
        }
      } catch (err) {
        console.warn('[auth-guard] impossibile leggere documento utente per username', err);
      }
      
      const storedUsername = detectExistingUsername(userData, user);
      if (isStoredUsernameValid(storedUsername)) {
        if (usernameMappingDisabled) {
          const normalized = normalizeUsername(storedUsername);
          try {
            await db.collection('users').doc(user.uid).set({
              username: normalized,
              usernameLower: normalized,
              usernameUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } catch (err) {
            console.warn('[auth-guard] impossibile aggiornare username profilo (mapping disabilitato)', err);
          }
          window.currentUsername = normalized;
          return normalized;
        }
        try {
          await ensureUsernameMapping(db, user.uid, storedUsername, userData.usernameVariants);
        } catch (err) {
          console.warn('[auth-guard] impossibile sincronizzare mapping username esistente', err);
        }
        return storedUsername;
      }
      
      const modalResult = await showUsernameRequiredModal({
        defaultValue: normalizeUsername(storedUsername),
        displayName: userData.displayName || user.displayName || '',
        email: userData.email || user.email || '',
        onSubmit: async (rawValue) => {
          const candidate = normalizeUsername(rawValue);
          if (!candidate) {
            return { ok: false, error: 'Inserisci un nome utente.' };
          }
          if (candidate.length < 3) {
            return { ok: false, error: 'Il nome utente deve avere almeno 3 caratteri.' };
          }
          if (candidate.length > 20) {
            return { ok: false, error: 'Massimo 20 caratteri consentiti.' };
          }
          if (!USERNAME_REGEX.test(candidate)) {
            return { ok: false, error: 'Sono ammessi solo lettere, numeri, punto, trattino e underscore.' };
          }
          if (RESERVED_USERNAMES.has(candidate)) {
            return { ok: false, error: 'Questo nome utente non è disponibile.' };
          }
          
          if (!usernameMappingDisabled) {
            try {
              const existingDoc = await db.collection('usernames').doc(candidate).get();
              if (existingDoc.exists && existingDoc.data()?.uid && existingDoc.data().uid !== user.uid) {
                return { ok: false, error: 'Nome utente già utilizzato. Scegline un altro.' };
              }
            } catch (err) {
              if (err?.code === 'permission-denied') {
                console.warn('[auth-guard] impossibile verificare disponibilità username (permessi). Procedo comunque.', err);
              } else {
                console.error('[auth-guard] errore verifica disponibilità username', err);
                return { ok: false, error: 'Errore di rete. Riprova.' };
              }
            }
          }
          
          try {
            await ensureUsernameMapping(db, user.uid, candidate, userData.usernameVariants);
            userData.username = candidate;
            return { ok: true, username: candidate };
          } catch (err) {
            console.error('[auth-guard] errore salvataggio username', err);
            return { ok: false, error: 'Impossibile salvare. Riprova.' };
          }
        }
      });
      
      return modalResult;
    })();
    
    return ensureUsernamePromise;
  }
  
  function showUsernameRequiredModal(options = {}) {
    return new Promise((resolve) => {
      const { defaultValue = '', displayName = '', email = '', onSubmit } = options;
      const existingModal = document.getElementById('usernameRequiredModal');
      if (existingModal) existingModal.remove();
      
      const overlay = document.createElement('div');
      overlay.id = 'usernameRequiredModal';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.88);display:flex;align-items:center;justify-content:center;z-index:20000;padding:16px;';
      overlay.innerHTML = `
        <div style="background:var(--card, #0f172a);color:var(--text, #e2e8f0);padding:24px 28px;border-radius:16px;max-width:420px;width:100%;box-shadow:0 24px 48px rgba(0,0,0,0.35);border:1px solid rgba(148,163,184,0.35);display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;flex-direction:column;gap:8px;">
            <h2 style="margin:0;font-size:20px;font-weight:700;">Scegli il tuo nome utente</h2>
            <p style="margin:0;font-size:14px;line-height:1.5;color:var(--muted,#94a3b8);">
              Per partecipare alla lega devi impostare un nome utente unico. Sarà visibile agli altri membri.
            </p>
            ${(displayName || email) ? `<div style="font-size:13px;background:rgba(12,15,109,0.08);padding:10px 12px;border-radius:10px;border:1px solid rgba(12,15,109,0.18);">
              <strong>Profilo:</strong> ${displayName || email}
            </div>` : ''}
          </div>
          <form id="usernameRequiredForm" style="display:flex;flex-direction:column;gap:12px;">
            <label style="display:flex;flex-direction:column;gap:6px;font-size:14px;">
              <span>Nome utente</span>
              <input id="usernameRequiredInput" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" value="${defaultValue || ''}" style="padding:12px 14px;border-radius:10px;border:1px solid rgba(148,163,184,0.35);background:rgba(15,23,42,0.68);color:#e2e8f0;font-size:15px;" placeholder="es. mounba" />
            </label>
            <div style="font-size:12px;color:var(--muted,#94a3b8);line-height:1.5;">
              • Minimo 3, massimo 20 caratteri<br>
              • Lettere, numeri, punto, trattino e underscore consentiti<br>
              • Non sono ammessi spazi
            </div>
            <div id="usernameRequiredError" style="font-size:13px;color:#f97316;min-height:18px;"></div>
            <button type="submit" class="btn" style="padding:12px 16px;font-weight:600;">Salva nome utente</button>
          </form>
        </div>
      `;
      
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.appendChild(overlay);
      
      const form = overlay.querySelector('#usernameRequiredForm');
      const input = overlay.querySelector('#usernameRequiredInput');
      const errorEl = overlay.querySelector('#usernameRequiredError');
      if (input) {
        setTimeout(() => {
          input.focus();
          input.select();
        }, 60);
      }
      
      const submitHandler = async (event) => {
        event.preventDefault();
        if (!onSubmit || typeof onSubmit !== 'function') {
          resolve(null);
          overlay.remove();
          document.body.style.overflow = prevOverflow;
          return;
        }
        const rawValue = input.value;
        const result = await onSubmit(rawValue);
        if (result && result.ok) {
          overlay.remove();
          document.body.style.overflow = prevOverflow;
          resolve(result.username);
        } else {
          errorEl.textContent = (result && result.error) ? result.error : 'Impossibile salvare. Riprova.';
        }
      };
      
      form.addEventListener('submit', submitHandler);
    });
  }
  
})();
