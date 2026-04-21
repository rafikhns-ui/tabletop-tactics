// Open-offer resolver.
//
// Several action types don't fully apply when proposed — they queue an
// offer in diplomacy.openOffers with status:'pending' and wait for the
// target to accept, reject, or let it expire. This module closes that
// loop.
//
// Why live here rather than in /actions: acceptance is a *response*,
// not a fresh proposal from the LLM. The LLM never calls resolveOffer
// directly; the UI or an AI policy layer does.

import {
  factionById,
  hasResources,
  deductResources,
  addResources,
  bumpSentiment,
  setRelation,
  getRelation,
} from './actions/_helpers';

/**
 * Return pending offers targeting a given faction (or all, if omitted).
 */
export function listOpenOffers(gameState, forFactionId) {
  const offers = gameState?.diplomacy?.openOffers || [];
  if (!forFactionId) return offers.filter((o) => o.status === 'pending');
  return offers.filter(
    (o) => o.status === 'pending' && o.target === forFactionId,
  );
}

/**
 * Resolve an open offer.
 *   resolveOffer(gameState, offerId, 'accept' | 'reject')
 *
 * Returns { ok, reason?, state } where state is the updated game state
 * (equal to the input if ok is false).
 */
export function resolveOffer(gameState, offerId, choice) {
  const offer = findOffer(gameState, offerId);
  if (!offer) return fail(gameState, 'unknown_offer');
  if (offer.status !== 'pending') return fail(gameState, 'already_resolved');

  if (choice !== 'accept' && choice !== 'reject')
    return fail(gameState, 'invalid_choice');

  const next = structuredClone(gameState);
  const updated = next.diplomacy.openOffers.find((o) => o.id === offerId);
  updated.status = choice === 'accept' ? 'accepted' : 'rejected';
  updated.resolvedTurn = next.turn || 0;

  const handlerResult =
    choice === 'accept'
      ? applyAcceptance(next, updated)
      : applyRejection(next, updated);
  if (!handlerResult.ok) return fail(gameState, handlerResult.reason);

  // Prune the resolved offer — keep a small audit trail on the side.
  next.diplomacy.offerLog = next.diplomacy.offerLog || [];
  next.diplomacy.offerLog.push({ ...updated });
  next.diplomacy.openOffers = next.diplomacy.openOffers.filter(
    (o) => o.id !== offerId,
  );

  return { ok: true, state: next };
}

// — acceptance handlers ————————————————————————————

function applyAcceptance(state, offer) {
  switch (offer.type) {
    case 'PROPOSE_RESOURCE_TRADE':
      return acceptResourceTrade(state, offer);
    case 'PROPOSE_PEACE':
      return acceptPeace(state, offer);
    case 'DEMAND_VASSALAGE':
      return acceptVassalage(state, offer);
    case 'DEMAND_HOSTAGES':
      return acceptHostages(state, offer);
    case 'EXTORT_TRIBUTE':
      return acceptExtortion(state, offer);
    case 'DEMAND_INTEL':
      return acceptIntel(state, offer);
    case 'JOINT_STRIKE':
      return acceptJointStrike(state, offer);
    default:
      return { ok: false, reason: `unhandled_offer_type:${offer.type}` };
  }
}

function acceptResourceTrade(state, offer) {
  const proposer = factionById(state, offer.proposer);
  const target = factionById(state, offer.target);
  if (!proposer || !target) return { ok: false, reason: 'unknown_faction' };
  const receive = offer.payload?.receive || {};
  if (!hasResources(target, receive))
    return { ok: false, reason: 'target_cannot_fulfill' };
  // Proposer's 'give' was already debited at propose time; now pay them
  // the 'receive' side and debit the target.
  deductResources(target, receive);
  addResources(proposer, receive);
  // The 'give' bag was held in escrow on the proposer side; credit it to
  // the target.
  const give = offer.payload?.give || {};
  addResources(target, give);
  bumpSentiment(state, offer.target, offer.proposer, +4);
  bumpSentiment(state, offer.proposer, offer.target, +4);
  return { ok: true };
}

function acceptPeace(state, offer) {
  if (getRelation(state, offer.proposer, offer.target) !== 'war')
    return { ok: false, reason: 'not_at_war' };
  setRelation(state, offer.proposer, offer.target, 'neutral');
  // Close the live war record(s) — skip already-ended entries so we
  // don't overwrite their endedTurn / outcome with this peace's turn.
  const wars = state.diplomacy?.wars || [];
  for (const w of wars) {
    if (w.endedTurn) continue;
    if (
      (w.attacker === offer.proposer && w.defender === offer.target) ||
      (w.attacker === offer.target && w.defender === offer.proposer)
    ) {
      w.endedTurn = state.turn || 0;
      w.outcome = 'peace';
    }
  }
  // Reparations were escrowed from the proposer at propose time
  // (PROPOSE_PEACE.apply). Credit the target unconditionally — the bag is
  // already held, so there's nothing to re-verify on the proposer side.
  const reps = offer.payload?.reparations;
  if (reps) {
    const target = factionById(state, offer.target);
    if (target) addResources(target, reps);
  }
  bumpSentiment(state, offer.proposer, offer.target, +10);
  bumpSentiment(state, offer.target, offer.proposer, +10);
  return { ok: true };
}

function acceptVassalage(state, offer) {
  // Safety net mirroring DEMAND_VASSALAGE.validate(): between propose
  // and accept the target may have become someone else's vassal (a
  // different DEMAND_VASSALAGE resolved first, a DYNASTIC union
  // landed, etc.). Rejecting here leaves the offer pending in
  // resolveOffer's fail() path so the target can reject it explicitly;
  // without this, we'd silently end up with a dual-overlord target.
  const existing = state.diplomacy?.vassalages || [];
  if (existing.some((v) => v.vassal === offer.target))
    return { ok: false, reason: 'target_already_vassal' };
  setRelation(state, offer.proposer, offer.target, 'overlord_of');
  state.diplomacy.vassalages = state.diplomacy.vassalages || [];
  state.diplomacy.vassalages.push({
    overlord: offer.proposer,
    vassal: offer.target,
    tributePerTurn: offer.payload?.tributePerTurn || {},
    sinceTurn: state.turn || 0,
  });
  // Subjugation ends any war between the pair — the vassal has bent the
  // knee, so there is no longer anyone to fight. Mirrors acceptPeace's
  // endedTurn pattern (see task #67) but records the outcome as
  // 'subjugation' rather than 'peace' so historical context is preserved.
  // Skip already-ended entries to avoid clobbering prior endedTurn/outcome.
  const wars = state.diplomacy?.wars || [];
  for (const w of wars) {
    if (w.endedTurn) continue;
    if (
      (w.attacker === offer.proposer && w.defender === offer.target) ||
      (w.attacker === offer.target && w.defender === offer.proposer)
    ) {
      w.endedTurn = state.turn || 0;
      w.outcome = 'subjugation';
    }
  }
  bumpSentiment(state, offer.target, offer.proposer, -10);
  return { ok: true };
}

function acceptHostages(state, offer) {
  const count = offer.payload?.count || 1;
  state.diplomacy.wards = state.diplomacy.wards || [];
  for (let i = 0; i < count; i++) {
    state.diplomacy.wards.push({
      host: offer.proposer,
      origin: offer.target,
      name: `hostage_${state.turn || 0}_${i}`,
      arrivedTurn: state.turn || 0,
      kind: 'coerced',
    });
  }
  bumpSentiment(state, offer.target, offer.proposer, -8);
  return { ok: true };
}

function acceptExtortion(state, offer) {
  const proposer = factionById(state, offer.proposer);
  const target = factionById(state, offer.target);
  if (!proposer || !target) return { ok: false, reason: 'unknown_faction' };
  const demanded = offer.payload?.demanded || {};
  if (!hasResources(target, demanded))
    return { ok: false, reason: 'target_cannot_pay' };
  deductResources(target, demanded);
  addResources(proposer, demanded);
  // Paying off extortion is bitter — sentiment slides further.
  bumpSentiment(state, offer.target, offer.proposer, -6);
  return { ok: true };
}

function acceptIntel(state, offer) {
  const about = offer.payload?.aboutFaction;
  state.diplomacy.intelLog = state.diplomacy.intelLog || [];
  state.diplomacy.intelLog.push({
    from: offer.target,
    to: offer.proposer,
    about,
    summary: 'shared on demand',
    turn: state.turn || 0,
  });
  bumpSentiment(state, offer.target, offer.proposer, +2);
  return { ok: true };
}

function acceptJointStrike(state, offer) {
  // Safety-net mirroring JOINT_STRIKE.validate(): the target may have
  // signed a non-aggression pact with the commonEnemy between propose
  // and accept (or the proposer may have — less likely, but symmetric).
  // Without this guard we'd record jointStrikes[] alongside a live
  // pact with the common enemy — the same contradictory durable state
  // that validate() rejects at propose time.
  const turn = state.turn || 0;
  const pacts = state?.diplomacy?.pacts || [];
  const commonEnemy = offer.payload?.commonEnemy;
  const liveNapBetween = (x, y) =>
    pacts.some(
      (p) =>
        p.kind === 'non_aggression' &&
        ((p.a === x && p.b === y) || (p.a === y && p.b === x)) &&
        (p.expiresOnTurn == null || p.expiresOnTurn > turn),
    );
  if (liveNapBetween(offer.proposer, commonEnemy))
    return { ok: false, reason: 'proposer_has_pact_with_enemy' };
  if (liveNapBetween(offer.target, commonEnemy))
    return { ok: false, reason: 'target_has_pact_with_enemy' };
  state.diplomacy.jointStrikes = state.diplomacy.jointStrikes || [];
  state.diplomacy.jointStrikes.push({
    a: offer.proposer,
    b: offer.target,
    commonEnemy,
    targetHex: offer.payload?.targetHex || null,
    agreedTurn: state.turn || 0,
  });
  bumpSentiment(state, offer.target, offer.proposer, +8);
  bumpSentiment(state, offer.proposer, offer.target, +8);
  return { ok: true };
}

// — rejection handlers ————————————————————————————

function applyRejection(state, offer) {
  // Refund proposer goods held in escrow where applicable.
  if (offer.type === 'PROPOSE_RESOURCE_TRADE') {
    const proposer = factionById(state, offer.proposer);
    if (proposer) addResources(proposer, offer.payload?.give || {});
  }
  // PROPOSE_PEACE also escrows the reparations bag on the proposer —
  // rejection returns it. Mirror turnTick.refundEscrow which handles the
  // expiry path the same way.
  if (offer.type === 'PROPOSE_PEACE') {
    const reps = offer.payload?.reparations;
    if (reps) {
      const proposer = factionById(state, offer.proposer);
      if (proposer) addResources(proposer, reps);
    }
  }
  // Coercive offers refused are felt as insult by the proposer.
  const insultByType = {
    DEMAND_VASSALAGE: 12,
    DEMAND_HOSTAGES: 10,
    EXTORT_TRIBUTE: 8,
    JOINT_STRIKE: 4,
    PROPOSE_PEACE: 6, // refusing peace during war is notable
    PROPOSE_RESOURCE_TRADE: 2,
    DEMAND_INTEL: 3,
  };
  const delta = insultByType[offer.type] ?? 2;
  bumpSentiment(state, offer.proposer, offer.target, -delta);
  return { ok: true };
}

// — util ————————————————————————————————————————

function findOffer(state, offerId) {
  return (state?.diplomacy?.openOffers || []).find((o) => o.id === offerId);
}

function fail(state, reason) {
  return { ok: false, reason, state };
}
