/**
 * Auth Guard v2025102103 - Login Obbligatorio
 * Protegge tutte le pagine da accesso non autenticato
 * v2025101905
 */

(function() {
  'use strict';
  
  // Check se auth guard è disabilitato globalmente
  if (window.__DISABLE_AUTH_GUARD__) {
    console.log('🔓 Auth guard disabilitato per questa pagina');
    return;
  }
  
  // Pages che NON richiedono login
  const PUBLIC_PAGES = ['auth.html', 'login.html', 'register.html', 'index.html', 'store.html', 'adsense-verification.html', 'adsense-preview.html', 'privacy.html', 'terms.html'];
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
    const lastLeagueId = localStorage.getItem('last_league_id');
    
    if (!lastLeagueId) {
      // Prima volta: verifica se ha leghe
      const userLeagues = await getUserLeagues();
      
      if (userLeagues.length === 0) {
        // Nessuna lega → mostra onboarding
        showOnboardingModal();
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
      const snapshot = await firebase.firestore()
        .collection('leagues')
        .where('members', 'array-contains', window.currentUser.uid)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading user leagues:', error);
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
  
})();
