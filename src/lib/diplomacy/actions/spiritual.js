// Spiritual actions — 4 of 41.
//
// Spiritual actions matter disproportionately for pious factions
// (tlalocayotlan, kadjimaran, sultanate, nimrudan, inuvak). They are
// cheap for matched beliefs and near-useless for secular ones.

import {
  factionById,
  hasResources,
  deductResources,
  bumpSentiment,
} from './_helpers';

export const SWEAR_OATH_BY_SKY = {
  type: 'SWEAR_OATH_BY_SKY',
  category: 'spiritual',
  llmHint:
    "Swear a formal oath binding both parties to a stated commitment for the duration. Modest bilateral sentiment gain on signing. The oath auto-expires on expiresOnTurn (via EXPIRING_COLLECTIONS in turnTick); there is no unilateral break action and nothing flips oath.broken to true today, so the oath-breaking consequences are not currently triggered.",
  schema: { clause: 'string', duration: 'number>0' },
  validate(action) {
    if (!action.payload?.clause) return { ok: false, reason: 'missing_clause' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.oaths = next.diplomacy.oaths || [];
    next.diplomacy.oaths.push({
      a: action.proposer,
      b: action.target,
      clause: action.payload.clause,
      sworn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
      broken: false,
    });
    bumpSentiment(next, action.target, action.proposer, +10);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} and ${a.target} swear oath: "${a.payload.clause}" (${a.payload.duration} turns).`,
};

export const SEND_PILGRIMAGE = {
  type: 'SEND_PILGRIMAGE',
  category: 'spiritual',
  llmHint:
    'Send pilgrims to the target\'s sacred sites. Costs Spiritual Points; raises sentiment durably. Deeply meaningful for pious factions.',
  schema: { sp: 'number>0' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { sp: action.payload.sp }))
      return { ok: false, reason: 'insufficient_sp' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { sp: action.payload.sp });
    // Larger sentiment bump scales with sp, capped to preserve balance.
    const delta = Math.min(18, 6 + action.payload.sp * 2);
    bumpSentiment(next, action.target, action.proposer, +delta);
    return next;
  },
  summarize: (a) =>
    `Pilgrimage from ${a.proposer} arrives at ${a.target}'s shrines (${a.payload.sp} sp).`,
};

export const CONSECRATE_HEX = {
  type: 'CONSECRATE_HEX',
  category: 'spiritual',
  llmHint:
    "Consecrate a hex you own as sacred. Sets hex.sacred=true with consecratedBy and consecratedTurn. No direct sentiment change — pious-faction-approval and secular-faction-offense are narrative-only today (no automated trigger propagates either), and violation detection is not implemented.",
  schema: { hexId: 'string' },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: 'unknown_hex' };
    if (hex.owner !== action.proposer)
      return { ok: false, reason: 'not_owned_by_proposer' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.sacred = true;
    hex.consecratedBy = action.proposer;
    hex.consecratedTurn = state.turn || 0;
    return next;
  },
  summarize: (a) => `${a.proposer} consecrates hex ${a.payload.hexId}.`,
};

export const CURSE_FACTION = {
  type: 'CURSE_FACTION',
  category: 'spiritual',
  llmHint:
    "A public spiritual curse against the target. Costs SP. Heavy bilateral sentiment loss (target → proposer drops by a large amount) and a record pushed to diplomacy.curses. Third-party pious-faction sentiment propagation is NOT implemented — the penalty stays bilateral, unlike SPREAD_PROPAGANDA which does drag third parties.",
  schema: { sp: 'number>0', reason: 'string' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { sp: action.payload.sp }))
      return { ok: false, reason: 'insufficient_sp' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { sp: action.payload.sp });
    bumpSentiment(next, action.target, action.proposer, -22);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.curses = next.diplomacy.curses || [];
    next.diplomacy.curses.push({
      from: action.proposer,
      against: action.target,
      reason: action.payload.reason,
      turn: state.turn || 0,
    });
    return next;
  },
  summarize: (a) =>
    `${a.proposer} curses ${a.target} before all gods: "${a.payload.reason}".`,
};
