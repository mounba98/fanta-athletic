# Regole del Contest Curva Morello vs Piana — MODIFICHE ESATTE (D075, corrette D076)

Allineato a: D094

Stato: **APPLICATE** — pubblicate in Console il 24/09/2026 (D078). La fonte
completa oggi è `firestore.rules`; questo file resta come spiegazione. Basate sul file di
regole reale copiato dalla Console il 24/09/2026. Sono 4 modifiche
puntuali: il resto del file non si tocca.

## Cosa cambia in parole semplici

- La **fazione di una squadra** si può impostare una sola volta da un
  membro di quella squadra; poi solo un admin la cambia.
- La **fazione di un utente** idem: una volta scelta non si cambia da soli.
- Nuove collezioni del mini-gioco: `contest_predictions` (i voti) e
  `contest_standings` (la classifica calcolata dall'admin).
- Un voto deve riportare la fazione vera dell'utente (non si può votare
  "per l'altra squadra") e nessuno può assegnarsi punti da solo.

## MODIFICA 1 — aggiungere due funzioni di aiuto

Subito dopo la funzione `isLeagueAdmin(leagueId) { ... }` (prima del
commento `// ========== Leagues/Competizioni ==========`) aggiungere:

```
    // Vero se l'operazione cambierebbe una fazione GIÀ impostata (la prima scelta è libera)
    function factionLocked() {
      return ('fazione' in resource.data) &&
             request.resource.data.get('fazione', null) != resource.data.fazione;
    }

    // Vero se la fazione, quando presente, è un valore valido
    function factionValid() {
      return !('fazione' in request.resource.data) ||
             request.resource.data.fazione in ['curva', 'piana'];
    }
```

## MODIFICA 2 — squadra: regola `allow update` in `match /teams/{teamId}` (dentro `leagues`)

**Sostituire** l'intero blocco `allow update: if isSignedIn() && ( ... );` di
`/leagues/{leagueId}/teams/{teamId}` (quello con `resource.data.owner`) con:

```
        allow update: if isSignedIn() && (
          request.auth.uid in get(/databases/$(database)/documents/leagues/$(leagueId)).data.admins ||
          isAdmin() ||
          (!factionLocked() && factionValid() && (
            request.auth.uid == resource.data.owner ||
            ((!('owner' in resource.data) || resource.data.owner == null || resource.data.owner == '') &&
             request.resource.data.owner == request.auth.uid)
          )) ||
          // un membro della squadra può impostare la fazione UNA volta, se non c'è ancora
          (!('fazione' in resource.data) &&
           request.resource.data.diff(resource.data).affectedKeys().hasOnly(['fazione']) &&
           request.resource.data.fazione in ['curva', 'piana'] &&
           isLeagueMember(leagueId) &&
           string(get(/databases/$(database)/documents/users/$(request.auth.uid)).data.team_index) == teamId)
        );
```

## MODIFICA 3 — utenti: sostituire il blocco `match /users/{userId}`

```
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow create, delete: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      // la fazione, una volta scelta, la cambia solo un admin
      allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin()) &&
                       (isAdmin() || (!factionLocked() && factionValid()));
    }
```

## MODIFICA 4 — mini-gioco: nuovi blocchi

Aggiungere subito dopo il blocco `// ========== Contest pronostici ==========`
(dopo `match /contest/predictions/{uid}/{predictionId} { ... }`):

```
    // Voti del contest: una riga per utente e partita ("G3_<uid>")
    match /contest_predictions/{predId} {
      allow read: if isSignedIn();

      allow create, update: if isSignedIn()
        && request.resource.data.uid == request.auth.uid
        && predId == request.resource.data.matchKey + '_' + request.auth.uid
        && request.resource.data.pick in ['1', 'X', '2']
        && request.resource.data.points == null
        && (resource == null || resource.data.points == null)
        && request.resource.data.faction ==
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('fazione', null);

      // l'admin assegna i punti (admin-contest.html) e può correggere o cancellare
      allow update, delete: if isAdmin();
    }

    // Classifica calcolata da admin-contest.html
    match /contest_standings/{docId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
```

## Cosa NON cambia

Tutto il resto del file. Le vecchie regole `/contest/matches`, `/contest/scores`,
`/contest/predictions/...` restano (inutilizzate, innocue).

## Come provarle senza rischi (Simulatore)

Nell'editor delle Regole c'è il pulsante **Simulatore regole**. Prima di
"Pubblica" prova, con "Get" / "Create" / "Update":
1. Utente normale: `users/<suo uid>` update cambiando `fazione` già impostata → deve essere **negato**.
2. Utente normale: `contest_predictions/G2_<suo uid>` create con `pick: '1'`, `points: null`, `uid` = suo uid, `faction` = la sua → **consentito**; con `points: 10` → **negato**.
3. Admin: `contest_standings/current` write → **consentito**.

## Note emerse dalla lettura del file

- `users`: **solo il proprietario e gli admin** leggono un profilo. Quindi il
  nome reale NON è leggibile dagli altri utenti (correzione a D072).
- Il voto controlla la fazione leggendo il profilo dell'utente: costa una
  lettura in più per voto (trascurabile).
- Apertura/chiusura dei voti (24h / 30 min) restano controllate solo
  dall'interfaccia: chi manipola le richieste a mano potrebbe votare fuori
  finestra. Rischio basso in una lega tra amici.
- Il mini-gioco è globale: `athletic_calendar`, `contest_predictions`,
  `contest_standings` non stanno sotto `leagues/`.
- La modifica 2 usa `team_index` dell'utente per riconoscere "un membro
  della squadra": funziona solo per chi ha `team_index` impostato.
