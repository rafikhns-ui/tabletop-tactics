// Military actions — 5 of 20.

import {
  factionById,
  bumpSentiment,
  setRelation,
  getRelation,
  hasResources,
  deductResources,
} from './_helpers';

/** Truthy when a reparations bag has at least one non-zero entry. */
function hasAnyValue(bag) {
  return !!bag && Object.values(bag).some((v) => v);
}

export const DECLARE_WAR = {
  type: 'DECLARE_WAR',
  category: 'military',
  llmHint:
    'Formally declare war. Ends all trade routes with the target and sets relations to "war". Cannot be undone without PROPOSE_PEACE. Blocked while an active NON_AGGRESSION_PACT exists between the pair.',
  schema: { casusBelli: 'string' },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) === 'war')
      return { ok: false, reason: 'already_at_war' };
    // Active non-aggression pact blocks war declarations, per the NAP
    // llmHint contract. The LLM would have to wait for the pact to
    // expire (tracked via turnTick's EXPIRING_COLLECTIONS) before it
    // can declare war.
    const turn = state.turn || 0;
    const pacts = state?.diplomacy?.pacts || [];
    const blocking = pacts.find(
      (p) =>
        p.kind === 'non_aggression' &&
        ((p.a === action.proposer && p.b === action.target) ||
          (p.a === action.target && p.b === action.proposer)) &&
        (p.expiresOnTurn == null || p.expiresOnTurn > turn),
    );
    if (blocking) return { ok: false, reason: 'blocked_by_pact' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    setRelation(next, action.proposer, action.target, 'war');
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.wars = next.diplomacy.wars || [];
    next.diplomacy.wars.push({
      attacker: action.proposer,
      defender: action.target,
      declaredTurn: state.turn || 0,
      casusBelli: action.payload.casusBelli,
    });
    // End trade routes between the pair.
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) =>
        !(
          (r.a === action.proposer && r.b === action.target) ||
          (r.a === action.target && r.b === action.proposer)
        ),
    );
    bumpSentiment(next, action.target, action.proposer, -40);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} declares war on ${a.target} (${a.payload.casusBelli || 'no stated reason'}).`,
};

export const PROPOSE_PEACE = {
  type: 'PROPOSE_PEACE',
  category: 'military',
  llmHint:
    'Offer to end a war, optionally with reparations flowing one way. Target must accept to resolve.',
  schema: { reparations: 'ResourceBag?' },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) !== 'war')
      return { ok: false, reason: 'not_at_war' };
    // Reparations are escrowed at propose time (mirrors PROPOSE_RESOURCE_TRADE's
    // 'give' escrow). If the proposer can't fund the bag now, reject up front
    // rather than letting the offer sit until accept/expire and silently no-op.
    //
    // Pre-fix bug: acceptPeace ended the war unconditionally, then skipped the
    // reparations transfer if hasResources was false. Target committed to peace
    // and received nothing. By escrowing at propose time and unconditionally
    // crediting the target on accept, the transfer is either funded or the
    // peace offer never enters the queue.
    const reps = action.payload?.reparations;
    if (hasAnyValue(reps)) {
      const proposer = factionById(state, action.proposer);
      if (!proposer) return { ok: false, reason: 'unknown_proposer' };
      if (!hasResources(proposer, reps))
        return { ok: false, reason: 'insufficient_to_pay_reparations' };
    }
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    // Escrow reparations on the proposer. The bag stays in offer.payload and
    // is credited to the target on accept, refunded on reject/expire.
    const reps = action.payload?.reparations;
    if (hasAnyValue(reps)) {
      const proposer = factionById(next, action.proposer);
      if (proposer) deductResources(proposer, reps);
    }
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: 'pending',
      expiresOnTurn: (state.turn || 0) + 3,
    });
    return next;
  },
  summarize: (a) => `${a.proposer} proposes peace to ${a.target}.`,
};

export const DEMAND_VASSALAGE = {
  type: 'DEMAND_VASSALAGE',
  category: 'military',
  llmHint:
    'Demand that the target become your vassal. Extremely hostile; typically backed by threat of invasion.',
  schema: { tributePerTurn: 'ResourceBag' },
  validate(action, state) {
    // A faction can only have ONE overlord at a time. If the target is
    // already a vassal of someone else, reject at propose time — accepting
    // would push a second {overlord, vassal} entry into the array, leaving
    // the target paying tribute to two overlords each turn and making
    // reconcileRelations flip between them on successive ticks. The
    // acceptVassalage handler has a matching safety-net for the window
    // between propose and accept, but catching it here is cheaper and
    // gives the LLM a clear failure reason.
    const vassalages = state?.diplomacy?.vassalages || [];
    if (vassalages.some((v) => v.vassal === action.target))
      return { ok: false, reason: 'target_already_vassal' };
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
    bumpSentiment(next, action.target, action.proposer, -20);
    return next;
  },
  summarize: (a) => `${a.proposer} demands ${a.target} become a vassal.`,
};

export const GRANT_MILITARY_ACCESS = {
  type: 'GRANT_MILITARY_ACCESS',
  category: 'military',
  llmHint:
    "Record a grant of military access to the target for a fixed number of turns and bump their sentiment toward you by +5. Diplomatic signal only — the movement system does not consult the militaryAccess list, so this grant does not mechanically permit or block any troop movement.",
  schema: { duration: 'number>0' },
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.militaryAccess = next.diplomacy.militaryAccess || [];
    next.diplomacy.militaryAccess.push({
      granter: action.proposer,
      grantee: action.target,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
    });
    bumpSentiment(next, action.target, action.proposer, +5);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} grants ${a.target} military access for ${a.payload.duration} turns.`,
};

export const JOINT_STRIKE = {
  type: 'JOINT_STRIKE',
  category: 'military',
  llmHint:
    'Propose a coordinated attack on a third faction. Requires target acceptance.',
  schema: { commonEnemy: 'string', targetHex: 'string?' },
  validate(action, state) {
    if (action.payload.commonEnemy === action.target)
      return { ok: false, reason: 'cannot_target_partner' };
    // The proposer cannot be the common enemy — that's just a confused
    // self-strike, and would record a jointStrikes entry with
    // a === commonEnemy. Mirrors the target guard.
    if (action.payload.commonEnemy === action.proposer)
      return { ok: false, reason: 'cannot_target_self' };
    // commonEnemy drives the actual attack flow at acceptance time. An
    // unknown faction id would queue a pending offer that can never
    // resolve sensibly and pollute jointStrikes on accept.
    if (!factionById(state, action.payload.commonEnemy))
      return { ok: false, reason: 'unknown_common_enemy' };
    // A JOINT_STRIKE commitment while either side has a live
    // non-aggression pact with the commonEnemy writes two contradictory
    // durable records: pacts[{non_aggression with commonEnemy}] AND
    // jointStrikes[{commonEnemy}]. DECLARE_WAR's NAP guard blocks the
    // eventual war, but the commitment itself is nonsense. Mirror the
    // DECLARE_WAR block_by_pact shape but split reasons so the LLM can
    // see which side is the blocker and react (e.g. DENOUNCE_PACT).
    const turn = state.turn || 0;
    const pacts = state?.diplomacy?.pacts || [];
    const liveNapBetween = (x, y) =>
      pacts.some(
        (p) =>
          p.kind === 'non_aggression' &&
          ((p.a === x && p.b === y) || (p.a === y && p.b === x)) &&
          (p.expiresOnTurn == null || p.expiresOnTurn > turn),
      );
    if (liveNapBetween(action.proposer, action.payload.commonEnemy))
      return { ok: false, reason: 'proposer_has_pact_with_enemy' };
    if (liveNapBetween(action.target, action.payload.commonEnemy))
      return { ok: false, reason: 'target_has_pact_with_enemy' };
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
    return next;
  },
  summarize: (a) =>
    `${a.proposer} proposes joint strike on ${a.payload.commonEnemy} with ${a.target}.`,
};

export const NON_AGGRESSION_PACT = {
  type: 'NON_AGGRESSION_PACT',
  category: 'military',
  llmHint:
    "Formal non-aggression pact binding both sides. While active: DECLARE_WAR between the pair is rejected by the validator, and neither side may JOINT_STRIKE with their NAP partner as the common enemy. The pact ends only by reaching its expiresOnTurn — there is no unilateral break or denunciation action. Modest sentiment gain on signing.",
  schema: { duration: 'number>0' },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) === 'war')
      return { ok: false, reason: 'at_war' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.pacts = next.diplomacy.pacts || [];
    next.diplomacy.pacts.push({
      a: action.proposer,
      b: action.target,
      kind: 'non_aggression',
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
    });
    setRelation(next, action.proposer, action.target, 'non_aggression');
    bumpSentiment(next, action.target, action.proposer, +10);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} and ${a.target} sign a non-aggression pact (${a.payload.duration} turns).`,
};

export const MILITARY_REPOSITION = {
  type: 'MILITARY_REPOSITION',
  category: 'military',
  llmHint:
    "Publicly announce a troop movement toward a specific border. Ambiguous signal — deterrent or threat depending on context. No forces actually move; this is a diplomatic declaration.",
  schema: { toward: 'string', intent: 'string' },
  validate(action) {
    if (!action.payload?.toward) return { ok: false, reason: 'missing_toward' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.postures = next.diplomacy.postures || [];
    next.diplomacy.postures.push({
      faction: action.proposer,
      toward: action.payload.toward,
      intent: action.payload.intent,
      turn: state.turn || 0,
    });
    // If repositioning against the target, mild negative signal.
    if (action.target && action.payload.toward.includes(action.target)) {
      bumpSentiment(next, action.target, action.proposer, -6);
    }
    return next;
  },
  summarize: (a) =>
    `${a.proposer} repositions forces toward ${a.payload.toward} (${a.payload.intent}).`,
};
