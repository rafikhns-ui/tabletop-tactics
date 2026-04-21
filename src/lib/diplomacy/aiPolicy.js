// AI offer-resolution policy.
//
// Runs at end of turn (before the maintenance tick) to auto-resolve any
// open offers whose target is an AI faction. The policy is deliberately
// transparent: every decision is a score computed from personality
// values + current sentiment + offer-specific signals, compared against
// a per-offer-type threshold.
//
// Design notes:
//   - Pure function; returns a new state and a log of decisions.
//   - Never writes to game state directly — defers to resolveOffer so
//     all side effects flow through the same channel the UI uses.
//   - If personality data is missing for a faction, falls back to a
//     neutral-pragmatic profile so we never crash on unknown factions.

import { resolveOffer } from './offers';
import { getPersonality } from './personalities';
import { factionById, getSentiment, hasResources } from './actions/_helpers';

const DEFAULT_PROFILE = {
  values: {
    aggression: 0,
    greed: 0.3,
    honor: 0.3,
    piety: 0,
    pragmatism: 0.7,
    xenophobia: 0,
  },
};

/**
 * Resolve every pending offer whose target is NOT the human player.
 *
 *   resolveAIOffers(gameState, { playerFactionId })
 *   → { state, decisions: [{ offerId, target, choice, reason }] }
 *
 * Decisions are returned for optional display in the inbox ("Gojeon
 * accepted your trade" / "Ruskel refused your pact").
 *
 * @param {Object} gameState
 * @param {{ playerFactionId?: string }} [opts]
 */
export function resolveAIOffers(gameState, { playerFactionId } = {}) {
  const pending = (gameState?.diplomacy?.openOffers || []).filter(
    (o) => o.status === 'pending' && o.target && o.target !== playerFactionId,
  );

  let state = gameState;
  const decisions = [];
  for (const offer of pending) {
    const decision = decideOffer(state, offer);
    const result = resolveOffer(state, offer.id, decision.choice);
    if (result.ok) {
      state = result.state;
      decisions.push({
        offerId: offer.id,
        target: offer.target,
        type: offer.type,
        choice: decision.choice,
        reason: decision.reason,
      });
    } else {
      // Resolution failed (e.g. target_cannot_fulfill). Force-reject so
      // the offer doesn't loop forever.
      const fallback = resolveOffer(state, offer.id, 'reject');
      if (fallback.ok) {
        state = fallback.state;
        decisions.push({
          offerId: offer.id,
          target: offer.target,
          type: offer.type,
          choice: 'reject',
          reason: `fallback:${result.reason}`,
        });
      }
    }
  }
  return { state, decisions };
}

// — decision engine ————————————————————————————————

function decideOffer(state, offer) {
  const profile = getPersonality(offer.target) || DEFAULT_PROFILE;
  const v = profile.values || DEFAULT_PROFILE.values;
  const sentiment = getSentiment(state, offer.target, offer.proposer); // -100..100

  switch (offer.type) {
    case 'PROPOSE_RESOURCE_TRADE':
      return decideTrade(state, offer, v, sentiment);
    case 'PROPOSE_PEACE':
      return decidePeace(offer, v, sentiment);
    case 'DEMAND_VASSALAGE':
      return decideVassalage(offer, v, sentiment);
    case 'DEMAND_HOSTAGES':
      return decideHostages(offer, v, sentiment);
    case 'EXTORT_TRIBUTE':
      return decideExtortion(state, offer, v, sentiment);
    case 'DEMAND_INTEL':
      return decideIntel(offer, v, sentiment);
    case 'JOINT_STRIKE':
      return decideJointStrike(state, offer, v, sentiment);
    default:
      return { choice: 'reject', reason: `unhandled_type:${offer.type}` };
  }
}

function decideTrade(state, offer, v, sentiment) {
  const target = factionById(state, offer.target);
  if (!target || !hasResources(target, offer.payload?.receive || {})) {
    return { choice: 'reject', reason: 'cannot_fulfill' };
  }
  // Score: greed pushes toward yes, honor enforces consistency with
  // existing sentiment, xenophobia penalizes outsiders.
  const receiveMag = bagMagnitude(offer.payload?.receive);
  const giveMag = bagMagnitude(offer.payload?.give);
  const gain = giveMag - receiveMag; // positive means target gets more than they give
  const score = sentiment * 0.5 + gain * (1 + v.greed) - v.xenophobia * 10;
  return scoreToChoice(score, 0, 'trade');
}

function decidePeace(offer, v, sentiment) {
  // Pragmatic and peace-leaning factions accept even at low sentiment;
  // aggressive factions demand reparations and high sentiment.
  const repAmount = bagMagnitude(offer.payload?.reparations);
  const aggressionPenalty = v.aggression * 30;
  const score = sentiment + repAmount * 2 - aggressionPenalty + v.pragmatism * 15;
  return scoreToChoice(score, -10, 'peace');
}

function decideVassalage(offer, v, sentiment) {
  // Only accept vassalage under very negative sentiment AND low honor.
  // Even then, most factions refuse.
  const score = -sentiment * 0.5 - v.honor * 40 - v.pragmatism * 10;
  return scoreToChoice(score, 40, 'vassalage');
}

function decideHostages(offer, v, sentiment) {
  const score = sentiment * 0.5 - v.honor * 20 + v.pragmatism * 5;
  return scoreToChoice(score, 20, 'hostages');
}

function decideExtortion(state, offer, v, sentiment) {
  const target = factionById(state, offer.target);
  if (!target || !hasResources(target, offer.payload?.demanded || {})) {
    return { choice: 'reject', reason: 'cannot_pay' };
  }
  // Pay extortion only when scared (low sentiment, high pragmatism,
  // low honor). Proud / honorable factions refuse.
  const demandMag = bagMagnitude(offer.payload?.demanded);
  const score = -sentiment * 0.3 + v.pragmatism * 15 - v.honor * 25 - demandMag;
  return scoreToChoice(score, 10, 'extortion');
}

function decideIntel(offer, v, sentiment) {
  // Share intel freely with friends, refuse rivals.
  const score = sentiment + v.pragmatism * 10 - v.xenophobia * 10;
  return scoreToChoice(score, 0, 'intel');
}

function decideJointStrike(state, offer, v, sentiment) {
  // Accept joint strikes when we already dislike the common enemy and
  // trust the proposer. Previously the score only read sentiment toward
  // the proposer — a faction with +80 sentiment toward its supposed
  // 'common enemy' would accept a joint strike exactly as readily as one
  // with -80. That violated the policy's stated rationale. Now read
  // sentiment toward the commonEnemy as well: negative sentiment (we
  // dislike them) contributes positively to accept.
  const commonEnemy = offer.payload?.commonEnemy;
  const enemySentiment = commonEnemy
    ? getSentiment(state, offer.target, commonEnemy)
    : 0;
  const score =
    sentiment * 0.4 +
    -enemySentiment * 0.3 +
    v.aggression * 25 +
    v.pragmatism * 5;
  return scoreToChoice(score, 10, 'joint_strike');
}

// — helpers ————————————————————————————————————————

function scoreToChoice(score, threshold, label) {
  if (score >= threshold) {
    return { choice: 'accept', reason: `${label}_score:${score.toFixed(1)}` };
  }
  return { choice: 'reject', reason: `${label}_score:${score.toFixed(1)}` };
}

function bagMagnitude(bag) {
  if (!bag) return 0;
  return Object.values(bag).reduce((sum, v) => sum + (Number(v) || 0), 0);
}
