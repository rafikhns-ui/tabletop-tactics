// Trade actions — 5 of the 20 vertical-slice actions.
//
// Each action exports an ActionDef descriptor with:
//   - schema:       payload validation
//   - validate:     pure check against game state (no mutation)
//   - apply:        returns a new game state with the action applied
//   - summarize:    short human-readable line for the inbox
//   - llmHint:      one-line description shown to the LLM in its tool spec

import {
  resourcesOf,
  hasResources,
  deductResources,
  addResources,
  factionById,
  bumpSentiment,
  bagToString,
} from './_helpers';

export const OFFER_GOLD_TRIBUTE = {
  type: 'OFFER_GOLD_TRIBUTE',
  category: 'trade',
  llmHint: 'Send a one-time gold payment to another faction. Reversible: no.',
  schema: { gold: 'number>0' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!proposer) return { ok: false, reason: 'unknown_proposer' };
    // apply() credits the target directly, so a hallucinated id would
    // dereference null and crash. Reject up front.
    if (!factionById(state, action.target))
      return { ok: false, reason: 'unknown_target' };
    const need = { gold: action.payload.gold };
    if (!hasResources(proposer, need))
      return { ok: false, reason: 'insufficient_gold' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, { gold: action.payload.gold });
    addResources(t, { gold: action.payload.gold });
    bumpSentiment(next, action.target, action.proposer, +8);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} offers ${a.payload.gold}g tribute to ${a.target}.`,
};

export const PROPOSE_RESOURCE_TRADE = {
  type: 'PROPOSE_RESOURCE_TRADE',
  category: 'trade',
  llmHint:
    'Propose a one-shot exchange (give X, receive Y). Other side may accept or counter.',
  schema: { give: 'ResourceBag', receive: 'ResourceBag' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    // Without this guard, an empty `give` bag trivially passes hasResources
    // (vacuous truth) and apply() would crash trying to debit a null faction.
    if (!proposer) return { ok: false, reason: 'unknown_proposer' };
    // A missing target would queue an orphan offer that no-one can accept.
    if (!factionById(state, action.target))
      return { ok: false, reason: 'unknown_target' };
    if (!hasResources(proposer, action.payload.give))
      return { ok: false, reason: 'insufficient_to_give' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    // Only debit the proposer's side; recipient acceptance is a separate action.
    deductResources(p, action.payload.give);
    // Trade is queued as an offer; settlement happens on accept.
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
    `${a.proposer} offers ${bagToString(a.payload.give)} for ${bagToString(a.payload.receive)}.`,
};

export const GRANT_TRADE_RIGHTS = {
  type: 'GRANT_TRADE_RIGHTS',
  category: 'trade',
  llmHint:
    'Open a recurring trade route. Both factions gain +2 gold/turn while in effect.',
  schema: { duration: 'number>0' },
  validate(action, state) {
    if ((action.payload.duration || 0) < 1)
      return { ok: false, reason: 'invalid_duration' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = next.diplomacy.tradeRoutes || [];
    next.diplomacy.tradeRoutes.push({
      a: action.proposer,
      b: action.target,
      yieldPerTurn: { gold: 2 },
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
    });
    bumpSentiment(next, action.target, action.proposer, +4);
    return next;
  },
  summarize: (a) =>
    `Trade rights between ${a.proposer} and ${a.target} for ${a.payload.duration} turns.`,
};

export const EMBARGO = {
  type: 'EMBARGO',
  category: 'trade',
  llmHint:
    'Refuse to trade with the target. Hostile signal; closes any open routes between you.',
  schema: {},
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) =>
        !(
          (r.a === action.proposer && r.b === action.target) ||
          (r.a === action.target && r.b === action.proposer)
        ),
    );
    next.diplomacy.embargoes = next.diplomacy.embargoes || [];
    // EMBARGO is a directed, permanent state (no LIFT_EMBARGO action
    // exists, and embargoes is not in EXPIRING_COLLECTIONS — so entries
    // never leave on their own). Without dedup, an LLM that re-issues
    // EMBARGO against the same target every turn pushes one entry per
    // call forever, both bloating save state and surfacing as duplicate
    // "EMBARGO" rows in RelationsView. Skip the push when an entry for
    // this directed pair already exists; keep the sentiment bump so
    // reaffirming an embargo still registers as a diplomatic insult.
    const already = next.diplomacy.embargoes.some(
      (e) => e.from === action.proposer && e.against === action.target,
    );
    if (!already) {
      next.diplomacy.embargoes.push({
        from: action.proposer,
        against: action.target,
        sinceTurn: state.turn || 0,
      });
    }
    bumpSentiment(next, action.target, action.proposer, -12);
    return next;
  },
  summarize: (a) => `${a.proposer} embargoes ${a.target}.`,
};

export const CARAVAN_CONTRACT = {
  type: 'CARAVAN_CONTRACT',
  category: 'trade',
  llmHint:
    'Hire a caravan to deliver a one-shot resource bundle to the target. Costs gold up front; useful as a sweetener.',
  schema: { bundle: 'ResourceBag', cost: 'number>0' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!proposer) return { ok: false, reason: 'unknown_proposer' };
    // apply() credits the bundle directly to the target — bail if it's a
    // hallucinated id.
    if (!factionById(state, action.target))
      return { ok: false, reason: 'unknown_target' };
    if (!hasResources(proposer, { gold: action.payload.cost }))
      return { ok: false, reason: 'insufficient_gold_for_caravan' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, { gold: action.payload.cost });
    addResources(t, action.payload.bundle);
    bumpSentiment(next, action.target, action.proposer, +6);
    return next;
  },
  summarize: (a) =>
    `Caravan from ${a.proposer} brings ${bagToString(a.payload.bundle)} to ${a.target}.`,
};

export const CONFISCATE_CARAVAN = {
  type: 'CONFISCATE_CARAVAN',
  category: 'trade',
  llmHint:
    "Seize a caravan belonging to the target that is crossing your territory. Aggressive: gold gain, major sentiment loss, voids any active trade rights.",
  schema: { gold: 'number>0' },
  validate(action, state) {
    // Proposer pockets the seized gold — crash if they don't exist.
    if (!factionById(state, action.proposer))
      return { ok: false, reason: 'unknown_proposer' };
    const target = factionById(state, action.target);
    if (!target) return { ok: false, reason: 'unknown_target' };
    if (!hasResources(target, { gold: action.payload.gold }))
      return { ok: false, reason: 'target_lacks_gold' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(t, { gold: action.payload.gold });
    addResources(p, { gold: action.payload.gold });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) =>
        !(
          (r.a === action.proposer && r.b === action.target) ||
          (r.a === action.target && r.b === action.proposer)
        ),
    );
    bumpSentiment(next, action.target, action.proposer, -24);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} confiscates a ${a.payload.gold}g caravan belonging to ${a.target}.`,
};

// bagToString, bumpSentiment, clamp used to be redefined here. Both
// now come from ./_helpers so every action module shares a single
// implementation — see that file for the canonical versions.
