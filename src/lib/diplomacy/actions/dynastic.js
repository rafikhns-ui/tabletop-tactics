// Dynastic actions — 4 of 41.
//
// Dynastic actions create long-lived obligations between ruling houses.
// They are especially powerful with pride-driven and tradition-bound
// factions (ruskel, onishiman, nimrudan, kintei, sultanate).

import {
  factionById,
  bumpSentiment,
  setRelation,
} from './_helpers';

export const ARRANGE_MARRIAGE = {
  type: 'ARRANGE_MARRIAGE',
  category: 'dynastic',
  llmHint:
    "Bind two ruling houses through marriage. Large bilateral sentiment gain (+20 each way) and sets relation to 'married'. Note: marriage does NOT mechanically block DECLARE_WAR — the war-block check reads pacts[] (NON_AGGRESSION_PACT), not the 'married' relation. The non-aggression expectation is cultural/narrative only. No divorce or annulment action exists.",
  schema: { dowry: 'ResourceBag?', heirClaim: 'string?' },
  validate(action, state) {
    if (!action.target) return { ok: false, reason: 'missing_target' };
    if (action.target === action.proposer)
      return { ok: false, reason: 'cannot_marry_self' };
    // A pair may not be married more than once concurrently — without
    // this guard a repeat propose-apply cycle would silently push a second
    // marriage record and set the relation to 'married' a second time,
    // producing duplicated RelationsView tiles and a misleading signal to
    // prompt consumers that "two marriages" exist between one pair.
    const marriages = state?.diplomacy?.marriages || [];
    const a = action.proposer;
    const b = action.target;
    const alreadyMarried = marriages.some(
      (m) => (m.a === a && m.b === b) || (m.a === b && m.b === a),
    );
    if (alreadyMarried) return { ok: false, reason: 'already_married' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.marriages = next.diplomacy.marriages || [];
    next.diplomacy.marriages.push({
      a: action.proposer,
      b: action.target,
      dowry: action.payload?.dowry || null,
      heirClaim: action.payload?.heirClaim || null,
      turn: state.turn || 0,
    });
    bumpSentiment(next, action.proposer, action.target, +20);
    bumpSentiment(next, action.target, action.proposer, +20);
    // Relation values are strings throughout the codebase ('war',
    // 'non_aggression', 'overlord_of', 'neutral'); storing a structured
    // object here would be passed through getRelation as-is and end up in
    // promptBuilder.relationText as "[object Object]" in the LLM prompt.
    // The sinceTurn metadata is already on marriages[].turn.
    setRelation(next, action.proposer, action.target, 'married');
    return next;
  },
  summarize: (a) =>
    `Marriage arranged between ${a.proposer} and ${a.target}${
      a.payload?.heirClaim ? ` (heir clause: ${a.payload.heirClaim})` : ''
    }.`,
};

export const ACKNOWLEDGE_HEIR = {
  type: 'ACKNOWLEDGE_HEIR',
  category: 'dynastic',
  llmHint:
    "Formally recognize the target's chosen successor. Durable positive sentiment (+14). Recorded in diplomacy.heirRecognitions for history. No revocation action exists — recognition persists until age-pruned by the log-collection sweep.",
  schema: { heirName: 'string' },
  validate(action) {
    if (!action.payload?.heirName)
      return { ok: false, reason: 'missing_heir_name' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.heirRecognitions = next.diplomacy.heirRecognitions || [];
    next.diplomacy.heirRecognitions.push({
      recognizer: action.proposer,
      court: action.target,
      heir: action.payload.heirName,
      turn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, +14);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} acknowledges ${a.payload.heirName} as heir to ${a.target}.`,
};

export const ADOPT_HOSTAGE = {
  type: 'ADOPT_HOSTAGE',
  category: 'dynastic',
  llmHint:
    "Take a noble child from the target's house as a ward (hostage-guest). Stabilizes relations but creates a standing obligation; harming the ward is a red line.",
  schema: { wardName: 'string', duration: 'number>0' },
  validate(action) {
    if (!action.payload?.wardName)
      return { ok: false, reason: 'missing_ward_name' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.wards = next.diplomacy.wards || [];
    next.diplomacy.wards.push({
      host: action.proposer,
      origin: action.target,
      name: action.payload.wardName,
      arrivedTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
    });
    bumpSentiment(next, action.target, action.proposer, +8);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} takes ${a.payload.wardName} of ${a.target} as ward for ${a.payload.duration} turns.`,
};

export const RECOGNIZE_CLAIM = {
  type: 'RECOGNIZE_CLAIM',
  category: 'dynastic',
  llmHint:
    "Publicly recognize the target's historic or legal claim to a territory or title. Durable positive sentiment (+12). Recorded in diplomacy.recognizedClaims for history. No trade or rescind action exists today — recognition persists until age-pruned.",
  schema: { claim: 'string' },
  validate(action) {
    if (!action.payload?.claim)
      return { ok: false, reason: 'missing_claim' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.recognizedClaims = next.diplomacy.recognizedClaims || [];
    next.diplomacy.recognizedClaims.push({
      recognizer: action.proposer,
      holder: action.target,
      claim: action.payload.claim,
      turn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, +12);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} recognizes ${a.target}'s claim: "${a.payload.claim}".`,
};
