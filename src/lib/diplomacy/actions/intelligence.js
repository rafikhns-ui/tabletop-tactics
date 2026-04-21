// Intelligence actions — 4 of 41.

import {
  bumpSentiment,
  factionById,
  hasResources,
  deductResources,
} from './_helpers';

export const SHARE_INTEL = {
  type: 'SHARE_INTEL',
  category: 'intelligence',
  llmHint:
    'Share what you know about a third faction (military, economy, or disposition). Raises trust, but may commit you to a side.',
  schema: { aboutFaction: 'string', summary: 'string' },
  validate(action, state) {
    if (!action.payload.aboutFaction)
      return { ok: false, reason: 'missing_subject' };
    // The LLM will happily hallucinate faction ids it hasn't been told
    // about. Unknown subjects leak into intelLog and the prompt builder,
    // confusing future turns. Sharing intel about self or the target is
    // a weird-but-legal signalling move, so only unknown ids are blocked.
    if (!factionById(state, action.payload.aboutFaction))
      return { ok: false, reason: 'unknown_subject' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.intelLog = next.diplomacy.intelLog || [];
    next.diplomacy.intelLog.push({
      from: action.proposer,
      to: action.target,
      about: action.payload.aboutFaction,
      summary: action.payload.summary,
      turn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, +6);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} shares intel about ${a.payload.aboutFaction} with ${a.target}.`,
};

export const DEMAND_INTEL = {
  type: 'DEMAND_INTEL',
  category: 'intelligence',
  llmHint:
    'Demand intel about a third faction. Rude if relations are cool; fine between allies.',
  schema: { aboutFaction: 'string' },
  validate(action, state) {
    if (!action.payload.aboutFaction)
      return { ok: false, reason: 'missing_subject' };
    // Same phantom-id guard as SHARE_INTEL — the DEMAND_INTEL offer
    // records aboutFaction and acceptIntel writes it into intelLog on
    // the proposer's side on accept. Unknown subjects create dangling
    // references in durable state.
    if (!factionById(state, action.payload.aboutFaction))
      return { ok: false, reason: 'unknown_subject' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: 'pending',
      expiresOnTurn: (state.turn || 0) + 2,
    });
    bumpSentiment(next, action.target, action.proposer, -3);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} demands intel about ${a.payload.aboutFaction} from ${a.target}.`,
};

export const PLANT_SPY = {
  type: 'PLANT_SPY',
  category: 'intelligence',
  llmHint:
    "Covertly plant an agent in the target's court. Costs IP. No immediate sentiment change (secret). Recorded in diplomacy.spies with exposed:false; detection, counter-intelligence, and discovery-triggered penalties are not yet implemented — the plant is effectively permanent and invisible until a future mechanic flips `exposed` or consumes the record.",
  // cover is optional so the `|| 'envoy'` fallback in apply() is
  // actually reachable. Requiring a non-empty string at the schema
  // level made the default dead code.
  schema: { ip: 'number>0', cover: 'string?' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: action.payload.ip }))
      return { ok: false, reason: 'insufficient_ip' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: action.payload.ip });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.spies = next.diplomacy.spies || [];
    next.diplomacy.spies.push({
      handler: action.proposer,
      inside: action.target,
      cover: action.payload.cover || 'envoy',
      plantedTurn: state.turn || 0,
      exposed: false,
    });
    // No immediate sentiment change — it's a secret.
    return next;
  },
  summarize: (a) =>
    `${a.proposer} plants a spy in ${a.target}'s court (cover: ${a.payload.cover || 'envoy'}).`,
};

export const BRIBE_COURTIER = {
  type: 'BRIBE_COURTIER',
  category: 'intelligence',
  llmHint:
    "Bribe a named courtier of the target's court. Costs gold. Not public — no sentiment change. Recorded in diplomacy.bribes for flavor/history; there is no 'call in the debt' action and no consumer of bribes[] today, so the bribe currently has no mechanical follow-up effect.",
  schema: { gold: 'number>0', courtierName: 'string' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.gold }))
      return { ok: false, reason: 'insufficient_gold' };
    if (!action.payload?.courtierName)
      return { ok: false, reason: 'missing_courtier' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { gold: action.payload.gold });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.bribes = next.diplomacy.bribes || [];
    next.diplomacy.bribes.push({
      briber: action.proposer,
      court: action.target,
      courtier: action.payload.courtierName,
      gold: action.payload.gold,
      turn: state.turn || 0,
      exposed: false,
    });
    return next;
  },
  summarize: (a) =>
    `${a.proposer} bribes courtier ${a.payload.courtierName} at ${a.target}'s court (${a.payload.gold}g).`,
};
