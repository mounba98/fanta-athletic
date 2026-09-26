# Configurazioni Firebase storiche (dal ramo GitHub `feature/uniform-pitch-bench`, novembre 2025)

Recuperate il 25/09/2026 (D101) dalla repository `mounba98/fanta-athletic`.
**Solo riferimento**: NON sono collegate a `firebase.json` e non vanno pubblicate
così come sono, perché possono essere diverse da quelle attive in Console
(es. l'indice `notifications` userId+createdAt aggiunto a settembre 2026, D037).

- `storage.rules` — regole di Firebase Storage (foto profilo, copertine, loghi, post, card, foto giocatori).
- `firestore.indexes.json` — indici Firestore di allora.
- `firebase.json.vecchio` — configurazione Hosting vecchia (cartella `public/`, tutto rimandato a `index.html`).

Prima di usarle: confrontarle con la Console Firebase (Storage → Regole, Firestore → Indici).

Aggiunti il 26/09/2026 (D118, riordino della cartella):
- `FIRESTORE_RULES_CONTEST.md` — le modifiche alle regole per il mini-gioco (D075/D076), **già applicate** e confluite in `firestore.rules` (la fonte vera).
- `cors.json` — impostazione CORS del bucket di Firebase Storage (si applica con `gsutil cors set`), prima in `resources/` dove però nessuna pagina la usava.
