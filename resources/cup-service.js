/**
 * CupService – supporto opzionale per coppe e tornei all'interno di una lega.
 * Tutte le funzioni sono sicure da usare anche se la lega non ha coppe attive.
 */

(function initCupService(){
  if (typeof firebase === 'undefined') {
    console.warn('[CupService] Firebase non disponibile');
    return;
  }

  const leagueHelper = window.LeagueHelper || null;
  const getDb = () => window.db || firebase.firestore();

  function resolveLeagueId(explicitId) {
    if (explicitId) return explicitId;
    if (leagueHelper && typeof leagueHelper.getCurrentLeagueId === 'function') {
      return leagueHelper.getCurrentLeagueId();
    }
    return window.currentLeague?.id || null;
  }

  function getCupCollection(leagueId) {
    if (leagueHelper && typeof leagueHelper.getLeagueCollection === 'function') {
      return leagueHelper.getLeagueCollection('cups', leagueId);
    }
    const db = getDb();
    if (leagueId) {
      return db.collection(`leagues/${leagueId}/cups`);
    }
    return db.collection('cups');
  }

  function getCupDoc(leagueId, cupId) {
    if (!cupId) throw new Error('[CupService] cupId obbligatorio');
    if (leagueHelper && typeof leagueHelper.getLeagueDoc === 'function') {
      return leagueHelper.getLeagueDoc('cups', cupId, leagueId);
    }
    return getCupCollection(leagueId).doc(cupId);
  }

  function getRoundsCollection(leagueId, cupId) {
    if (leagueHelper && typeof leagueHelper.getLeagueSubcollection === 'function') {
      return leagueHelper.getLeagueSubcollection('cups', cupId, 'rounds', leagueId);
    }
    return getCupDoc(leagueId, cupId).collection('rounds');
  }

  function getMatchesCollection(leagueId, cupId, roundId) {
    return getRoundsCollection(leagueId, cupId).doc(roundId).collection('matches');
  }

  async function listCups(options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    const snap = await getCupCollection(leagueId).get();
    return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
  }

  async function getCup(cupId, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    const doc = await getCupDoc(leagueId, cupId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() || {}) };
  }

  async function saveCup(cupId, data, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    const docRef = getCupDoc(leagueId, cupId);
    const payload = Object.assign({
      name: data?.name || `Coppa ${cupId}`,
      type: data?.type || 'elimination',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      isActive: data?.isActive !== false,
      metadata: data?.metadata || {}
    }, data || {});
    await docRef.set(payload, { merge: true });
    return docRef;
  }

  async function deleteCup(cupId, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    await getCupDoc(leagueId, cupId).delete();
  }

  async function upsertRound(cupId, roundId, data, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    const docRef = getRoundsCollection(leagueId, cupId).doc(roundId);
    const payload = Object.assign({
      name: data?.name || `Round ${roundId}`,
      order: Number(data?.order ?? 0),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      metadata: data?.metadata || {}
    }, data || {});
    await docRef.set(payload, { merge: true });
    return docRef;
  }

  async function setMatchResult(cupId, roundId, matchId, data, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    const docRef = getMatchesCollection(leagueId, cupId, roundId).doc(matchId);
    const payload = Object.assign({
      homeTeam: data?.homeTeam || null,
      awayTeam: data?.awayTeam || null,
      homeScore: data?.homeScore ?? null,
      awayScore: data?.awayScore ?? null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: data?.status || 'scheduled',
      metadata: data?.metadata || {}
    }, data || {});
    await docRef.set(payload, { merge: true });
    return docRef;
  }

  function subscribeCup(cupId, callback, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    return getCupDoc(leagueId, cupId).onSnapshot(snapshot => {
      callback(snapshot.exists ? { id: snapshot.id, ...(snapshot.data() || {}) } : null);
    });
  }

  function subscribeRounds(cupId, callback, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    return getRoundsCollection(leagueId, cupId)
      .orderBy('order', 'asc')
      .onSnapshot(snapshot => {
        const rounds = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
        callback(rounds);
      });
  }

  function subscribeMatches(cupId, roundId, callback, options = {}) {
    const leagueId = resolveLeagueId(options.leagueId || null);
    return getMatchesCollection(leagueId, cupId, roundId)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(snapshot => {
        const matches = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
        callback(matches);
      });
  }

  window.CupService = {
    listCups,
    getCup,
    saveCup,
    deleteCup,
    upsertRound,
    setMatchResult,
    subscribeCup,
    subscribeRounds,
    subscribeMatches,
    _internal: {
      resolveLeagueId,
      getCupCollection,
      getCupDoc,
      getRoundsCollection,
      getMatchesCollection
    }
  };

  console.log('✅ CupService inizializzato (coppe opzionali pronte)');
})();

