/**
 * Player Photos Management
 * Upload e gestione foto giocatori
 * v2025101906
 */

(function() {
  'use strict';
  
  const DEFAULT_COLORS = {
    P: '#FFD700', // Portiere - Oro
    D: '#4A90E2', // Difensore - Blu
    C: '#50C878', // Centrocampista - Verde
    A: '#E74C3C'  // Attaccante - Rosso
  };
  
  /**
   * Genera placeholder con iniziali giocatore
   */
  function generatePlaceholder(player) {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Background color based on role
    const bgColor = DEFAULT_COLORS[player.ruolo] || '#95A5A6';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 200, 200);
    
    // Initials
    const initials = getInitials(player);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 100, 100);
    
    return canvas.toDataURL('image/png');
  }
  
  function getInitials(player) {
    const nome = player.nome || '';
    const cognome = player.cognome || '';
    
    const first = nome.charAt(0).toUpperCase();
    const last = cognome.charAt(0).toUpperCase();
    
    return first + last || '??';
  }
  
  /**
   * Upload foto giocatore a Firebase Storage
   */
  async function uploadPlayerPhoto(file, playerId, leagueId) {
    if (!file) throw new Error('Nessun file selezionato');
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Il file deve essere un\'immagine');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('L\'immagine deve essere inferiore a 5MB');
    }
    
    try {
      // Create storage reference
      const storage = firebase.storage();
      const storageRef = storage.ref();
      const photoRef = storageRef.child(`leagues/${leagueId}/players/${playerId}/photo.jpg`);
      
      // Upload file
      const snapshot = await photoRef.put(file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      });
      
      // Get download URL
      const downloadURL = await snapshot.ref.getDownloadURL();
      
      // Update Firestore
      await firebase.firestore()
        .collection(`leagues/${leagueId}/players`)
        .doc(playerId)
        .update({
          photoURL: downloadURL,
          photoUpdatedAt: firebase.firestore.Timestamp.now()
        });
      
      return downloadURL;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Errore upload foto: ' + error.message);
    }
  }
  
  /**
   * Elimina foto giocatore
   */
  async function deletePlayerPhoto(playerId, leagueId) {
    try {
      const storage = firebase.storage();
      const storageRef = storage.ref();
      const photoRef = storageRef.child(`leagues/${leagueId}/players/${playerId}/photo.jpg`);
      
      // Delete from storage
      await photoRef.delete();
      
      // Update Firestore
      await firebase.firestore()
        .collection(`leagues/${leagueId}/players`)
        .doc(playerId)
        .update({
          photoURL: null,
          photoDeletedAt: firebase.firestore.Timestamp.now()
        });
      
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        // File già eliminato, aggiorna solo Firestore
        await firebase.firestore()
          .collection(`leagues/${leagueId}/players`)
          .doc(playerId)
          .update({ photoURL: null });
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Renderizza foto giocatore con fallback placeholder
   */
  function renderPlayerPhoto(player, size = 'medium') {
    const sizes = {
      small: 40,
      medium: 80,
      large: 150
    };
    
    const dimension = sizes[size] || sizes.medium;
    
    if (player.photoURL) {
      return `
        <img 
          src="${player.photoURL}" 
          alt="${player.nome_completo || player.nome}"
          class="player-photo player-photo-${size}"
          style="width: ${dimension}px; height: ${dimension}px; border-radius: 50%; object-fit: cover;"
          onerror="this.src='${generatePlaceholder(player)}'"
        />
      `;
    } else {
      // Use placeholder
      const placeholderURL = generatePlaceholder(player);
      return `
        <img 
          src="${placeholderURL}" 
          alt="${player.nome_completo || player.nome}"
          class="player-photo player-photo-${size} player-photo-placeholder"
          style="width: ${dimension}px; height: ${dimension}px; border-radius: 50%;"
        />
      `;
    }
  }
  
  /**
   * Create upload UI for player
   */
  function createUploadUI(player, leagueId, onUploadComplete) {
    const container = document.createElement('div');
    container.className = 'player-photo-upload';
    container.innerHTML = `
      <div class="photo-preview">
        ${renderPlayerPhoto(player, 'large')}
      </div>
      <div class="photo-actions">
        <input 
          type="file" 
          id="photoInput_${player.id}" 
          accept="image/*" 
          style="display: none;"
        />
        <button class="btn btn-primary" onclick="document.getElementById('photoInput_${player.id}').click()">
          📸 ${player.photoURL ? 'Cambia Foto' : 'Carica Foto'}
        </button>
        ${player.photoURL ? `
          <button class="btn btn-danger" onclick="window.deletePhoto_${player.id}()">
            🗑️ Elimina Foto
          </button>
        ` : ''}
      </div>
      <p style="font-size: 12px; color: var(--muted); margin-top: 8px;">
        Formato: JPG, PNG, GIF | Max: 5MB
      </p>
    `;
    
    // Attach event listeners
    setTimeout(() => {
      const input = document.getElementById(`photoInput_${player.id}`);
      if (input) {
        input.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const url = await uploadPlayerPhoto(file, player.id, leagueId);
              if (onUploadComplete) onUploadComplete(url);
              alert('Foto caricata con successo!');
              location.reload();
            } catch (error) {
              alert(error.message);
            }
          }
        });
      }
      
      // Delete function
      window[`deletePhoto_${player.id}`] = async () => {
        if (confirm('Eliminare la foto di questo giocatore?')) {
          try {
            await deletePlayerPhoto(player.id, leagueId);
            if (onUploadComplete) onUploadComplete(null);
            alert('Foto eliminata');
            location.reload();
          } catch (error) {
            alert('Errore eliminazione foto: ' + error.message);
          }
        }
      };
    }, 100);
    
    return container;
  }
  
  /**
   * Inject CSS for player photos
   */
  function injectStyles() {
    if (document.getElementById('playerPhotoStyles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'playerPhotoStyles';
    styles.textContent = `
      .player-photo {
        border: 2px solid #e0e0e0;
        transition: all 0.2s;
      }
      
      .player-photo:hover {
        border-color: var(--primary);
        transform: scale(1.05);
      }
      
      .player-photo-placeholder {
        border: 2px solid #ddd;
      }
      
      .player-photo-upload {
        text-align: center;
        padding: 20px;
      }
      
      .photo-preview {
        margin-bottom: 16px;
        display: flex;
        justify-content: center;
      }
      
      .photo-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .player-card-photo {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e0e0e0;
      }
      
      .formation-player-photo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 4px;
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  // Initialize styles
  injectStyles();
  
  // Expose public API
  window.PlayerPhotos = {
    generatePlaceholder,
    uploadPlayerPhoto,
    deletePlayerPhoto,
    renderPlayerPhoto,
    createUploadUI
  };
  
})();
