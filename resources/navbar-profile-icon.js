/**
 * Navbar Profile Icon with Photo
 * Version: 2025102001
 */

(function() {
  'use strict';

  let retryCount = 0;
  const MAX_RETRIES = 50; // 5 secondi max

  /**
   * Renderizza icona profilo con foto o placeholder
   */
  function renderProfileIcon() {
    const container = document.getElementById('navbarProfileIcon');
    if (!container) return;

    if (typeof firebase === 'undefined' || !firebase.auth) {
      if (retryCount >= MAX_RETRIES) {
        console.error('❌ Firebase non disponibile dopo 5s, navbar-profile-icon disabilitato');
        return;
      }
      retryCount++;
      setTimeout(renderProfileIcon, 100);
      return;
    }
    
    console.log('✅ Firebase ready, navbar-profile-icon initialized');

    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        container.innerHTML = '';
        return;
      }

      try {
        // Prova a leggere foto da Firestore users/{uid}
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        const photoURL = userData.photoURL || user.photoURL || null;

        if (photoURL) {
          // Mostra foto profilo
          container.innerHTML = `
            <a href="profile.html" style="display: block; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.4); transition: all 0.2s;">
              <img src="${photoURL}" alt="Profilo" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;\\'>👤</div>'">
            </a>
          `;
        } else {
          // Icona default 👤
          container.innerHTML = `
            <a href="profile.html" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); font-size: 20px; transition: all 0.2s; text-decoration: none;">
              👤
            </a>
          `;
        }

        // Hover effect
        const link = container.querySelector('a');
        if (link) {
          link.addEventListener('mouseenter', () => {
            link.style.transform = 'scale(1.1)';
            link.style.borderColor = 'rgba(255,255,255,0.8)';
          });
          link.addEventListener('mouseleave', () => {
            link.style.transform = 'scale(1)';
            link.style.borderColor = 'rgba(255,255,255,0.4)';
          });
        }

      } catch (error) {
        console.error('Error loading profile photo:', error);
        // Fallback icona default
        container.innerHTML = `
          <a href="profile.html" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); font-size: 20px;">
            👤
          </a>
        `;
      }
    });
  }

  // Init quando navbar è pronta
  const checkNavbar = setInterval(() => {
    if (document.getElementById('navbarProfileIcon')) {
      clearInterval(checkNavbar);
      renderProfileIcon();
    }
  }, 100);

  // Timeout dopo 5 secondi
  setTimeout(() => clearInterval(checkNavbar), 5000);

})();
