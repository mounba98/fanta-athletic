# Piano Multilega - Fanta Athletic

## Stato Attuale

### ✅ Già Implementato
- Collezione `leagues` con struttura base
- `league-selector.js` che carica le leghe dell'utente
- `rules` collection usa già `where('leagueId', '==', leagueId)`
- Alcune query usano già `/leagues/{leagueId}/players` e `/leagues/{leagueId}/teams`
- Sistema di inviti base (`league-invite-modal.js`)

### ❌ Da Migrare
- `teams` → `/leagues/{leagueId}/teams`
- `players` → `/leagues/{leagueId}/players` (parzialmente implementato)
- `coaches` → `/leagues/{leagueId}/coaches`
- `results` → `/leagues/{leagueId}/results`
- `teams/{id}/saved/{giornata}` → `/leagues/{leagueId}/teams/{id}/saved/{giornata}`
- `config/rules_cache` → `/leagues/{leagueId}/config/rules_cache` (opzionale)

## Struttura Dati Firestore

### Collezione `leagues`
```
leagues/{leagueId}
  - name: string
  - owner: string (uid)
  - admins: string[] (uid[])
  - members: string[] (uid[])
  - sport: 'calcio' | 'basket' | 'pallavolo'
  - type: 'multi' | 'mono'
  - createdAt: timestamp
  - inviteCode: string (opzionale)
  - settings: {
      maxTeams: number
      maxPlayers: number
      ...
    }
```

### Subcollezioni
```
leagues/{leagueId}/teams/{teamId}
  - name: string
  - coach_ids: string[]
  - roster: string[]
  - logo: string (url)
  - leagueId: string

leagues/{leagueId}/teams/{teamId}/saved/{giornata}
  - lineup: string[]
  - captain: string
  - name: string
  - leagueId: string

leagues/{leagueId}/players/{playerId}
  - player_id: string
  - nome_completo: string
  - ruolo: string
  - photo_url: string
  - leagueId: string
  - ... (altri campi)

leagues/{leagueId}/coaches/{coachId}
  - coach_id: string
  - nome: string
  - photo_url: string
  - leagueId: string
  - ... (altri campi)

leagues/{leagueId}/rules/{ruleId}
  - rule_id: string
  - soggetto: 'Giocatore' | 'Allenatore' | 'Curva'
  - valore: number
  - leagueId: string
  - ... (altri campi)

leagues/{leagueId}/results/{giornata}/teams/{teamId}
  - teamId: string
  - teamName: string
  - points: number
  - breakdown: {
      curva: number
      players: number
      captain: number
      coach: number
      formation: number
    }
  - lineup: object[]
  - captain: string
  - coachId: string
  - leagueId: string
  - updatedAt: timestamp
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isLeagueOwner(leagueId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/leagues/$(leagueId)).data.owner == request.auth.uid;
    }
    
    function isLeagueAdmin(leagueId) {
      return isAuthenticated() && (
        isLeagueOwner(leagueId) ||
        request.auth.uid in get(/databases/$(database)/documents/leagues/$(leagueId)).data.admins
      );
    }
    
    function isLeagueMember(leagueId) {
      return isAuthenticated() && (
        isLeagueAdmin(leagueId) ||
        request.auth.uid in get(/databases/$(database)/documents/leagues/$(leagueId)).data.members
      );
    }
    
    // Leagues collection
    match /leagues/{leagueId} {
      allow read: if isLeagueMember(leagueId);
      allow create: if isAuthenticated() && request.resource.data.owner == request.auth.uid;
      allow update: if isLeagueAdmin(leagueId);
      allow delete: if isLeagueOwner(leagueId);
      
      // Teams subcollection
      match /teams/{teamId} {
        allow read: if isLeagueMember(leagueId);
        allow write: if isLeagueAdmin(leagueId);
        
        match /saved/{giornata} {
          allow read: if isLeagueMember(leagueId);
          allow write: if isLeagueMember(leagueId); // Ogni membro può salvare la propria formazione
        }
      }
      
      // Players subcollection
      match /players/{playerId} {
        allow read: if isLeagueMember(leagueId);
        allow write: if isLeagueAdmin(leagueId);
      }
      
      // Coaches subcollection
      match /coaches/{coachId} {
        allow read: if isLeagueMember(leagueId);
        allow write: if isLeagueAdmin(leagueId);
      }
      
      // Rules subcollection
      match /rules/{ruleId} {
        allow read: if isLeagueMember(leagueId);
        allow write: if isLeagueAdmin(leagueId);
      }
      
      // Results subcollection
      match /results/{giornata}/teams/{teamId} {
        allow read: if isLeagueMember(leagueId);
        allow write: if isLeagueAdmin(leagueId);
      }
      
      // Config subcollection
      match /config/{configId} {
        allow read: if isLeagueMember(leagueId);
        allow write: if isLeagueAdmin(leagueId);
      }
    }
    
    // Legacy collections (backward compatibility - da rimuovere dopo migrazione)
    match /teams/{teamId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // TODO: rimuovere dopo migrazione
    }
    
    match /players/{playerId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // TODO: rimuovere dopo migrazione
    }
    
    match /coaches/{coachId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // TODO: rimuovere dopo migrazione
    }
    
    match /results/{giornata}/teams/{teamId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // TODO: rimuovere dopo migrazione
    }
  }
}
```

## Piano di Migrazione

### Fase 1: Helper Functions
1. Creare `resources/league-helper.js` con funzioni:
   - `getCurrentLeagueId()` - ritorna `window.currentLeague.id` o `localStorage.getItem('last_league_id')`
   - `getLeaguePath(collection)` - ritorna `/leagues/{leagueId}/{collection}`
   - `ensureLeagueId(data)` - aggiunge `leagueId` ai dati se non presente

### Fase 2: Migrazione Query
Per ogni file che usa Firestore:
1. `squadre.html` - migrare `teams` e `teams/{id}/saved`
2. `formazioni.html` - migrare `teams` e `teams/{id}/saved`
3. `matchday.html` - migrare `results`
4. `statistiche.html` - migrare `results`, `players`, `coaches`
5. `classifiche.html` - migrare `results`
6. `admin-rules.html` - migrare `rules` (già parzialmente fatto)
7. `admin-players.html` - migrare `players`
8. Altri file admin - migrare rispettive collezioni

### Fase 3: UI Updates
1. Creare pagina "Crea Lega" (`create-league.html`)
2. Aggiornare `admin-leghe.html` per gestione completa
3. Aggiungere selector lega in tutte le pagine admin
4. Mostrare/nascondere elementi in base al ruolo (owner/admin/member)

### Fase 4: Migration Script
1. Creare script di migrazione dati esistenti (`migrate-to-multilega.html`)
2. Migrare dati da collezioni legacy a `/leagues/{leagueId}/...`
3. Assegnare tutti i dati esistenti a una lega "default"

### Fase 5: Testing & Cleanup
1. Testare tutte le funzionalità con multilega
2. Rimuovere collezioni legacy dopo migrazione completa
3. Aggiornare security rules per rimuovere backward compatibility

## Note Implementative

### Backward Compatibility
Durante la migrazione, mantenere supporto per:
- Query senza `leagueId` (fallback a lega "default")
- Collezioni legacy (`teams`, `players`, etc.) fino a migrazione completa

### Performance
- Usare `where('leagueId', '==', leagueId)` in tutte le query
- Creare index Firestore per `leagueId` su tutte le collezioni
- Considerare cache locale per `window.currentLeague`

### UI/UX
- League selector sempre visibile in header
- Mostrare nome lega in tutte le pagine
- Indicatore visivo per tipo lega (multi/mono)
- Badge per ruolo utente (owner/admin/member)

