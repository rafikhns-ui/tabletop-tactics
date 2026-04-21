// Territory actions — 3 of 20.

import {
  factionById,
  bumpSentiment,
  hexesOwnedBy,
} from './_helpers';

export const CEDE_HEX = {
  type: 'CEDE_HEX',
  category: 'territory',
  llmHint:
    'Transfer ownership of a hex from proposer to target. Strong gesture; usually follows a war or deal.',
  schema: { hexId: 'string' },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: 'unknown_hex' };
    if (hex.owner !== action.proposer)
      return { ok: false, reason: 'not_owned_by_proposer' };
    // apply() writes `hex.owner = action.target` unconditionally. An
    // unknown target id would silently orphan the hex — no real
    // faction's hexesOwnedBy() query would match, so no faction's turn
    // logic ever touches it again. Over a long game multiple hallucinated
    // cessions can leak territory off the board. Reject at propose time.
    if (!factionById(state, action.target))
      return { ok: false, reason: 'unknown_target' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.owner = action.target;
    bumpSentiment(next, action.target, action.proposer, +15);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} cedes hex ${a.payload.hexId} to ${a.target}.`,
};

export const CLAIM_HEX_DISPUTE = {
  type: 'CLAIM_HEX_DISPUTE',
  category: 'territory',
  llmHint:
    "Formally dispute the target faction's ownership of a hex. Records the claim and bumps target->proposer sentiment by -8. The dispute has no mechanical effect on ownership, combat, or later actions — no validator reads the disputes list as a precondition. Stale entries are reconciled away when the hex changes hands.",
  schema: { hexId: 'string', grounds: 'string' },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: 'unknown_hex' };
    if (hex.owner !== action.target)
      return { ok: false, reason: 'target_does_not_own_hex' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.disputes = next.diplomacy.disputes || [];
    // Disputes are a directed triple (claimant → holder, hexId) with no
    // LIFT_DISPUTE action and no expiresOnTurn — entries never leave on
    // their own. Without this guard an LLM that re-files the same claim
    // each turn (expected from a faction that's "pressing" a grievance)
    // piles up identical rows, bloating save state and surfacing as
    // duplicate "DISPUTE" lines in RelationsView. The reconciliation
    // sweep in turnTick handles staleness (ownership changes); this
    // handles same-turn serial re-issues. Keep the sentiment bump: a
    // reaffirmed claim is still a diplomatic jab.
    const already = next.diplomacy.disputes.some(
      (d) =>
        d.claimant === action.proposer &&
        d.holder === action.target &&
        d.hexId === action.payload.hexId,
    );
    if (!already) {
      next.diplomacy.disputes.push({
        claimant: action.proposer,
        holder: action.target,
        hexId: action.payload.hexId,
        grounds: action.payload.grounds,
        sinceTurn: state.turn || 0,
      });
    }
    bumpSentiment(next, action.target, action.proposer, -8);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} disputes ${a.target}'s claim on hex ${a.payload.hexId}.`,
};

export const DEMILITARIZE_ZONE = {
  type: 'DEMILITARIZE_ZONE',
  category: 'territory',
  llmHint:
    "Declare a demilitarized zone over named hexes and record a +6 sentiment gesture. The DMZ entry is purely declarative — no validator blocks troop movement into these hexes, and there is no BREAK_DMZ action that fires a sentiment penalty on violation. Durable for reputation purposes until the code adds an enforcement path.",
  schema: { hexIds: 'string[]' },
  validate(action) {
    if (
      !Array.isArray(action.payload.hexIds) ||
      action.payload.hexIds.length === 0
    )
      return { ok: false, reason: 'no_hexes' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.dmz = next.diplomacy.dmz || [];
    next.diplomacy.dmz.push({
      a: action.proposer,
      b: action.target,
      hexIds: action.payload.hexIds.slice(),
      sinceTurn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, +6);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} and ${a.target} demilitarize ${a.payload.hexIds.length} hex(es).`,
};

export const SETTLE_COLONY = {
  type: 'SETTLE_COLONY',
  category: 'territory',
  llmHint:
    "Plant a colony in an unclaimed hex. If the target claims the same region, this is provocative; otherwise a legitimate expansion.",
  schema: { hexId: 'string' },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: 'unknown_hex' };
    if (hex.owner && hex.owner !== action.proposer)
      return { ok: false, reason: 'hex_already_owned' };
    // apply() writes `hex.owner = action.proposer`. A hallucinated
    // proposer would orphan the colony hex into a phantom faction. Mirror
    // CEDE_HEX's unknown_target guard on the proposer side.
    if (!factionById(state, action.proposer))
      return { ok: false, reason: 'unknown_proposer' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.owner = action.proposer;
    hex.settledTurn = state.turn || 0;
    hex.isColony = true;
    if (action.target && action.target !== action.proposer) {
      bumpSentiment(next, action.target, action.proposer, -6);
    }
    return next;
  },
  summarize: (a) =>
    `${a.proposer} plants a colony at hex ${a.payload.hexId}.`,
};

export const GRANT_RIGHT_OF_PASSAGE = {
  type: 'GRANT_RIGHT_OF_PASSAGE',
  category: 'territory',
  llmHint:
    "Record a grant of right-of-passage to the target for a fixed number of turns and bump their sentiment toward you by +7. Purely a diplomatic signal — the movement system does not consult the rightsOfPassage list, so this grant does not mechanically permit or block any troop crossing.",
  schema: { duration: 'number>0' },
  validate(action) {
    if (!action.target) return { ok: false, reason: 'missing_target' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.rightsOfPassage = next.diplomacy.rightsOfPassage || [];
    next.diplomacy.rightsOfPassage.push({
      host: action.proposer,
      guest: action.target,
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
    });
    bumpSentiment(next, action.target, action.proposer, +7);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} grants ${a.target} right of passage for ${a.payload.duration} turns.`,
};
