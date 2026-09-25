Allineato a: D111

# Lega, stagione, competizioni — le parole giuste (per il multilega futuro)

Deciso con l'utente il 25/09/2026 (D111). Vale per il codice, l'interfaccia e i
documenti: usare sempre queste parole, con questo significato.

## La gerarchia

```
LEGA            Fanta Athletic                     chi gioca insieme
 └─ STAGIONE    2026/27 (in corso) · 2025/26 (archiviata)    quando
     └─ COMPETIZIONI   Campionato · Scontri diretti · Coppa · Curva vs Piana    a cosa si gioca
         └─ GIORNATE   G1, G2, …                    ogni partita dell'Athletic
```

Nel fantacalcio "classico" (es. Leghe Fantacalcio) si parla di **Lega** e dentro di
**Competizioni**. Da noi c'è in mezzo la **Stagione**, perché ogni anno si riparte
(asta, rose nuove) e la stagione passata va nell'Albo d'oro. Le competizioni vivono
**dentro** una stagione: finita la stagione, finiscono anche loro.

## Le quattro parole

| Parola | Cos'è | Esempio | Dove vive (database) | Dove si vede (app) |
|---|---|---|---|---|
| **Lega** | Il gruppo di persone e squadre che giocano insieme, con i suoi admin, il codice invito, la lista giocatori, le regole bonus/malus | Fanta Athletic | `leagues/{idLega}` (+ `teams`, `players`, `rules`, `admins`, `members`) | Selettore 🏆 nell'intestazione (D110); in futuro più leghe per utente |
| **Stagione** | Il periodo di gioco di una lega: si apre, si gioca, si archivia. Una sola "in corso" per lega | 2026/27 | `leagues/{idLega}/config/season` (impostazioni), `archive/{idStagione}` (stagioni passate) | Badge "2026/2027" nell'intestazione; Pannello › Stagione; Albo d'oro |
| **Competizione** | Un torneo giocato dentro la stagione, con le stesse squadre e le stesse giornate | Campionato (classifica a punti), Scontri diretti, Coppa, Curva vs Piana (mini-gioco) | Campionato: `results/{G}/teams`; Scontri: `h2h_schedule`/`h2h_results/{chiaveStagione}`; Coppa: `cups`/`cup_*`; Curva vs Piana: `contest_*` | Schede di Classifiche (Squadre = Campionato, Scontri, Fazioni); Pannello › Stagione › "Modalità di gioco" |
| **Giornata** | Una partita dell'Athletic, su cui si calcolano i punti di tutte le competizioni | G3 | `days/{G}`, `results/{G}`, `live/{G}` | Calcolo giornata, Partita live, Formazioni |

**Oggi**: una lega (Fanta Athletic), una stagione in corso, e come competizioni il
**Campionato** (modalità "classica") + **Curva vs Piana**; gli **Scontri diretti** si
accendono dalle Impostazioni della stagione ("Scontri" o "Entrambe"); la **Coppa**
esiste nel codice ma è spenta.

## Regole per il multilega (da rispettare da ora)

1. **Tutto ciò che appartiene a una lega sta sotto `leagues/{idLega}/…`.** Niente dati di gioco in raccolte "globali".
2. **Ciò che appartiene a una stagione porta la chiave della stagione** (come già `h2h_*/{chiaveStagione}` e l'archivio) oppure viene azzerato/archiviato con la stagione.
3. Nell'interfaccia: "Lega" = il gruppo; "Stagione" = l'anno; "Competizione" = il torneo. Non usare "Campionato" per dire "lega" né "Stagione" per dire "competizione".

## Debiti da saldare prima di attivare davvero il multilega

Raccolte oggi **globali** (valgono per tutti, non per lega) che con due leghe si mescolerebbero:
- `athletic_calendar` — il calendario della squadra vera (se più leghe seguono la stessa squadra potrebbe restare condiviso: da decidere);
- `contest_predictions`, `contest_standings` — il mini-gioco Curva vs Piana;
- `posts` nella posizione vecchia (radice) — la Bacheca li legge ancora da lì come piano B;
- `auction/current` — l'asta;
- `admins` globali accanto agli admin di lega (`leagues/{id}.admins`).

Più le verifiche già note: il codice invito controllato solo dall'interfaccia (D007/D018)
e lo stato reale del multilega mai provato sul campo (D020).
