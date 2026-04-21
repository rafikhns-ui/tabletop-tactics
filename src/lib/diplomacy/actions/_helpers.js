// Shared helpers for action validate/apply implementations.
// Kept under an underscore-prefixed module name so the registry
// doesn't accidentally pick this up as an action.

export function factionById(state, id) {
  if (!state || !Array.isArray(state.players)) return null;
  return (
    state.players.find((p) => p.faction?.id === id || p.id === id || p.factionId === id) ||
    null
  );
}

export function resourcesOf(faction) {
  return faction?.resources || {};
}

export function hasResources(faction, bag) {
  const r = resourcesOf(faction);
  for (const k of Object.keys(bag || {})) {
    const need = bag[k] || 0;
    if (need <= 0) continue;
    if ((r[k] || 0) < need) return false;
  }
  return true;
}

export function deductResources(faction, bag) {
  faction.resources = faction.resources || {};
  for (const k of Object.keys(bag || {})) {
    faction.resources[k] = (faction.resources[k] || 0) - (bag[k] || 0);
  }
}

export function addResources(faction, bag) {
  faction.resources = faction.resources || {};
  for (const k of Object.keys(bag || {})) {
    faction.resources[k] = (faction.resources[k] || 0) + (bag[k] || 0);
  }
}

export function hexesOwnedBy(state, factionId) {
  const hexes = state.hexes || {};
  return Object.entries(hexes)
    .filter(([, h]) => h && h.owner === factionId)
    .map(([id]) => id);
}

export function countHexes(state, factionId) {
  return hexesOwnedBy(state, factionId).length;
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function bumpSentiment(state, fromId, towardId, delta) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.sentiment = state.diplomacy.sentiment || {};
  const key = `${fromId}->${towardId}`;
  const cur = state.diplomacy.sentiment[key] ?? 0;
  state.diplomacy.sentiment[key] = clamp(cur + delta, -100, 100);
}

export function getSentiment(state, fromId, towardId) {
  const key = `${fromId}->${towardId}`;
  return state.diplomacy?.sentiment?.[key] ?? 0;
}

export function setRelation(state, a, b, relation) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.relations = state.diplomacy.relations || {};
  const key = pairKey(a, b);
  // 'neutral' is semantically identical to a missing key — getRelation()
  // returns 'neutral' for missing keys. Writing 'neutral' instead of
  // deleting leaks a ghost entry for every pair that ever exited a war,
  // pact, or vassalage (see reconcileRelations). Same O(N²) unbounded-
  // growth shape #83 fixed for sentiment: every ghost is copied by every
  // structuredClone in the dispatcher. Delete instead.
  if (relation === 'neutral') {
    delete state.diplomacy.relations[key];
    return;
  }
  state.diplomacy.relations[key] = relation;
}

export function getRelation(state, a, b) {
  const key = pairKey(a, b);
  return state.diplomacy?.relations?.[key] || 'neutral';
}

export function pairKey(a, b) {
  return [a, b].sort().join('|');
}

export function bagToString(bag) {
  if (!bag) return 'nothing';
  return (
    Object.entries(bag)
      .filter(([, v]) => v)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ') || 'nothing'
  );
}
