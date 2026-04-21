// Event triggers — deterministic detectors that look at game state
// and decide WHETHER an event should fire. The LLM doesn't trigger events;
// the game does. The LLM only authors flavor and endorses proposals once
// the trigger has fired.
//
// Each trigger returns either:
//   null                  — nothing to fire
//   { kind, fromFactionId, toFactionId, summary, candidateActions }
//
// where candidateActions are ActionDef shells the dispatcher can validate.

import { makeActionId } from '../schema';
import { getPersonality } from '../personalities';

/**
 * Fires when a faction's patience for a standing situation has broken.
 * Crude version: if sentiment < -40 toward the player AND the faction has
 * a priorityAction of DEMAND_VASSALAGE / DECLARE_WAR / EXTORT_TRIBUTE.
 */
export function detectPatienceBroken(state, speakerId, playerId) {
  const key = `${speakerId}->${playerId}`;
  const sentiment = state?.diplomacy?.sentiment?.[key] ?? 0;
  if (sentiment > -40) return null;

  const personality = getPersonality(speakerId);
  if (!personality) return null;

  const aggressiveAction = personality.priorityActions.find((a) =>
    ['DEMAND_VASSALAGE', 'DECLARE_WAR', 'EXTORT_TRIBUTE', 'THREATEN_INVASION'].includes(
      a,
    ),
  );
  if (!aggressiveAction) return null;

  const candidateActions = [
    {
      id: makeActionId(aggressiveAction),
      type: aggressiveAction,
      proposer: speakerId,
      target: playerId,
      payload: defaultPayloadFor(aggressiveAction, state, speakerId, playerId),
      reason: 'Patience exhausted.',
      turn: state.turn || 0,
    },
    {
      id: makeActionId('OFFER_GOLD_TRIBUTE'),
      type: 'OFFER_GOLD_TRIBUTE',
      proposer: playerId,
      target: speakerId,
      payload: { gold: Math.max(5, Math.floor(Math.abs(sentiment) / 10)) },
      reason: 'An appeasement the player could choose to offer.',
      turn: state.turn || 0,
    },
  ];

  return {
    kind: 'patience_broken',
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} has lost patience with the player.`,
    candidateActions,
  };
}

/**
 * Fires when the player has a disproportionate amount of a resource
 * compared to the speaker, and the speaker is mercantile.
 */
export function detectTradeOpportunity(state, speakerId, playerId) {
  const me = findPlayer(state, speakerId);
  const them = findPlayer(state, playerId);
  if (!me || !them) return null;

  const personality = getPersonality(speakerId);
  if (!personality) return null;
  if (personality.values.greed < 0.3) return null;

  const myGold = me.resources?.gold || 0;
  const theirGold = them.resources?.gold || 0;
  const myWheat = me.resources?.wheat || 0;
  const theirWheat = them.resources?.wheat || 0;

  // Mercantile opportunity: player has gold-rich, speaker has grain-rich, or vice versa.
  let give = null;
  let receive = null;
  if (theirGold > myGold + 15 && myWheat > theirWheat + 5) {
    give = { wheat: 5 };
    receive = { gold: 10 };
  } else if (myGold > theirGold + 15 && theirWheat > myWheat + 5) {
    give = { gold: 10 };
    receive = { wheat: 5 };
  }
  if (!give || !receive) return null;

  return {
    kind: 'trade_disruption', // using this enum slot loosely for "opportunity"
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} sees a mercantile opportunity.`,
    candidateActions: [
      {
        id: makeActionId('PROPOSE_RESOURCE_TRADE'),
        type: 'PROPOSE_RESOURCE_TRADE',
        proposer: speakerId,
        target: playerId,
        payload: { give, receive },
        reason: 'Prices are right.',
        turn: state.turn || 0,
      },
      {
        id: makeActionId('GRANT_TRADE_RIGHTS'),
        type: 'GRANT_TRADE_RIGHTS',
        proposer: speakerId,
        target: playerId,
        payload: { duration: 6 },
        reason: 'A longer-term arrangement.',
        turn: state.turn || 0,
      },
    ],
  };
}

/**
 * Fires for a pious faction when the player's troops are near a sacred hex.
 * In the vertical slice we approximate "sacred hex" as any hex owned by
 * the speaker marked with `sacred: true`. The hex data format may vary;
 * if the flag is absent, this detector returns null.
 */
export function detectOmenWitnessed(state, speakerId, playerId) {
  const personality = getPersonality(speakerId);
  if (!personality || personality.values.piety < 0.5) return null;

  const sacredHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === speakerId && h?.sacred,
  );
  if (sacredHexes.length === 0) return null;

  // Does the player have a unit adjacent to any sacred hex?
  // Without a proper adjacency map we approximate: any player-owned hex
  // that is within the sacredHexes' neighboring set (if provided).
  const playerHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === playerId,
  );
  const adjacent = sacredHexes.some(([sid, sh]) => {
    const neighbors = sh.neighbors || [];
    return playerHexes.some(([pid]) => neighbors.includes(pid));
  });
  if (!adjacent) return null;

  return {
    kind: 'omen_witnessed',
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `Smoke drifts over the Sacred Valley near the player's lines.`,
    candidateActions: [
      {
        id: makeActionId('ACCUSE_OF_BETRAYAL'),
        type: 'ACCUSE_OF_BETRAYAL',
        proposer: speakerId,
        target: playerId,
        payload: {
          accusation: 'Provocation at the edge of the Sacred Valley.',
        },
        reason: 'A warning shot in public.',
        turn: state.turn || 0,
      },
      {
        id: makeActionId('DEMILITARIZE_ZONE'),
        type: 'DEMILITARIZE_ZONE',
        proposer: speakerId,
        target: playerId,
        payload: { hexIds: sacredHexes.map(([id]) => id) },
        reason: 'Withdraw troops. Let the wind clear.',
        turn: state.turn || 0,
      },
    ],
  };
}

/**
 * Fires when sentiment is strongly positive (≥ +30) and no pact/oath is
 * already holding the pair. The faction reaches out with an overture —
 * a non-aggression pact (all temperaments) or a sacred oath (pious).
 */
export function detectWarmthOffered(state, speakerId, playerId) {
  const personality = getPersonality(speakerId);
  if (!personality) return null;

  const sentiment = sentimentKey(state, speakerId, playerId);
  if (sentiment < 30) return null;

  const pairHeld = hasActivePactOrOath(state, speakerId, playerId);
  if (pairHeld) return null;

  const candidateActions = [
    {
      id: makeActionId('NON_AGGRESSION_PACT'),
      type: 'NON_AGGRESSION_PACT',
      proposer: speakerId,
      target: playerId,
      payload: { duration: 6 },
      reason: 'A formal hand extended.',
      turn: state.turn || 0,
    },
  ];

  if (personality.values.piety >= 0.5) {
    candidateActions.push({
      id: makeActionId('SWEAR_OATH_BY_SKY'),
      type: 'SWEAR_OATH_BY_SKY',
      proposer: speakerId,
      target: playerId,
      payload: {
        clause: 'Neither house will raise a blade against the other.',
        duration: 8,
      },
      reason: 'Bound before the Sky.',
      turn: state.turn || 0,
    });
  }

  return {
    kind: 'warmth_offered',
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} wishes to formalize goodwill.`,
    candidateActions,
  };
}

/**
 * Fires when the pair is already at war and the speaker has been at it
 * for a few turns — enough to be reasonable about peace.
 */
export function detectWarFatigue(state, speakerId, playerId) {
  const wars = state.diplomacy?.wars || [];
  // Only live wars — peace-treated wars stay in state with `endedTurn`
  // set (offers.js#acceptPeace marks rather than splices). Ignoring
  // that flag here would let war_fatigue fire on a long-ago war and
  // commission a PROPOSE_PEACE that immediately fails not_at_war.
  const war = wars.find(
    (w) =>
      !w.endedTurn &&
      ((w.attacker === speakerId && w.defender === playerId) ||
        (w.attacker === playerId && w.defender === speakerId)),
  );
  if (!war) return null;
  const turn = state.turn || 0;
  // `??` not `||`: declaredTurn=0 is a valid starting turn (military.js
  // stamps `state.turn || 0`). With `||` a war declared on turn 0
  // collapses elapsed to 0 for the life of the game and war_fatigue
  // never fires — detector dead for anyone who opens with a declaration.
  const elapsed = turn - (war.declaredTurn ?? turn);
  if (elapsed < 2) return null;

  const personality = getPersonality(speakerId);
  if (!personality) return null;

  return {
    kind: 'war_fatigue',
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} seeks a way out of the war.`,
    candidateActions: [
      {
        id: makeActionId('PROPOSE_PEACE'),
        type: 'PROPOSE_PEACE',
        proposer: speakerId,
        target: playerId,
        payload: {},
        reason: 'Peace, if they will accept it.',
        turn,
      },
      {
        id: makeActionId('PROPOSE_PEACE'),
        type: 'PROPOSE_PEACE',
        proposer: speakerId,
        target: playerId,
        payload: { reparations: { gold: 15 } },
        reason: 'Peace with a balm of gold.',
        turn,
      },
    ],
  };
}

/**
 * Fires at mild warmth (+10 ≤ sentiment < +30) for honor- or piety-
 * leaning factions — an opening to deepen the relationship short of a
 * binding pact.
 */
export function detectSuccessionInterest(state, speakerId, playerId) {
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  const softDisposition =
    personality.values.honor >= 0.5 || personality.values.piety >= 0.5;
  if (!softDisposition) return null;

  const sentiment = sentimentKey(state, speakerId, playerId);
  if (sentiment < 10 || sentiment >= 30) return null;

  return {
    kind: 'succession_rumor',
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName}'s court whispers of closer ties.`,
    candidateActions: [
      {
        id: makeActionId('CULTURAL_EXCHANGE'),
        type: 'CULTURAL_EXCHANGE',
        proposer: speakerId,
        target: playerId,
        payload: { theme: 'An exchange of scholars and mosaics.' },
        reason: 'Soft diplomacy — slow but durable.',
        turn: state.turn || 0,
      },
      {
        id: makeActionId('PRAISE_PUBLICLY'),
        type: 'PRAISE_PUBLICLY',
        proposer: speakerId,
        target: playerId,
        payload: { occasion: 'festival of the long rains' },
        reason: 'A gesture of open recognition.',
        turn: state.turn || 0,
      },
    ],
  };
}

/**
 * Fires when sentiment is negative (≤ -15) AND the player owns a hex
 * adjacent to one the speaker owns — a territorial flash-point. The
 * speaker either opens a formal dispute or demands a buffer.
 */
export function detectBorderFriction(state, speakerId, playerId) {
  const sentiment = sentimentKey(state, speakerId, playerId);
  if (sentiment > -15) return null;

  const personality = getPersonality(speakerId);
  if (!personality) return null;

  const speakerHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === speakerId,
  );
  const playerHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === playerId,
  );
  if (speakerHexes.length === 0 || playerHexes.length === 0) return null;

  // Adjacency: a speaker hex lists a player hex as a neighbor.
  let contestedHexId = null;
  outer: for (const [sid, sh] of speakerHexes) {
    const neighbors = sh.neighbors || [];
    for (const [pid] of playerHexes) {
      if (neighbors.includes(pid)) {
        contestedHexId = pid;
        break outer;
      }
    }
  }
  if (!contestedHexId) return null;

  return {
    kind: 'border_incident',
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName}'s scouts report trouble on the border.`,
    candidateActions: [
      {
        id: makeActionId('CLAIM_HEX_DISPUTE'),
        type: 'CLAIM_HEX_DISPUTE',
        proposer: speakerId,
        target: playerId,
        payload: {
          hexId: contestedHexId,
          grounds: 'Ancestral tenancy — a grievance kept alive.',
        },
        reason: 'Lodge a formal dispute before blood is spilled.',
        turn: state.turn || 0,
      },
      {
        id: makeActionId('DEMILITARIZE_ZONE'),
        type: 'DEMILITARIZE_ZONE',
        proposer: speakerId,
        target: playerId,
        payload: { hexIds: [contestedHexId] },
        reason: 'Pull the swords back and let the field rest.',
        turn: state.turn || 0,
      },
    ],
  };
}

/** Runs all detectors, returns the first-firing event or null. */
export function detectNextEventForFaction(state, speakerId, playerId) {
  return (
    detectWarFatigue(state, speakerId, playerId) ||
    detectPatienceBroken(state, speakerId, playerId) ||
    detectBorderFriction(state, speakerId, playerId) ||
    detectOmenWitnessed(state, speakerId, playerId) ||
    detectWarmthOffered(state, speakerId, playerId) ||
    detectSuccessionInterest(state, speakerId, playerId) ||
    detectTradeOpportunity(state, speakerId, playerId)
  );
}

// — shared helpers for detectors ———————————————————————

function sentimentKey(state, fromId, towardId) {
  const k = `${fromId}->${towardId}`;
  return state?.diplomacy?.sentiment?.[k] ?? 0;
}

function hasActivePactOrOath(state, a, b) {
  const turn = state.turn || 0;
  const pacts = state.diplomacy?.pacts || [];
  const oaths = state.diplomacy?.oaths || [];
  const live = (o) => o.expiresOnTurn == null || o.expiresOnTurn > turn;
  const involves = (x, y) =>
    (x === a && y === b) || (x === b && y === a);
  return (
    pacts.some((p) => involves(p.a, p.b) && live(p)) ||
    oaths.some((o) => involves(o.a, o.b) && live(o) && !o.broken)
  );
}

// — helpers ——————————————————————————————————————————————

function findPlayer(state, factionId) {
  return (
    (state?.players || []).find(
      (p) =>
        p.faction?.id === factionId ||
        p.id === factionId ||
        p.factionId === factionId,
    ) || null
  );
}

function defaultPayloadFor(type, state, speakerId, playerId) {
  switch (type) {
    case 'DECLARE_WAR':
      return { casusBelli: 'Accumulated grievances.' };
    case 'DEMAND_VASSALAGE':
      return { tributePerTurn: { gold: 3 } };
    case 'EXTORT_TRIBUTE':
      return { demanded: { gold: 8 } };
    case 'THREATEN_INVASION':
      return { demand: 'Withdraw from the border.', deadlineInTurns: 3 };
    default:
      return {};
  }
}
