// Coercion actions — 2 of 20.

import { bumpSentiment, factionById, hasResources } from './_helpers';

export const THREATEN_INVASION = {
  type: 'THREATEN_INVASION',
  category: 'coercion',
  llmHint:
    'Threaten war unless the target complies with a demand. No state change yet, but sentiment tanks and a standing threat is recorded.',
  schema: { demand: 'string', deadlineInTurns: 'number>0' },
  validate(action) {
    if ((action.payload.deadlineInTurns || 0) < 1)
      return { ok: false, reason: 'deadline_must_be_positive' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.standingThreats = next.diplomacy.standingThreats || [];
    next.diplomacy.standingThreats.push({
      from: action.proposer,
      against: action.target,
      demand: action.payload.demand,
      expiresOnTurn: (state.turn || 0) + action.payload.deadlineInTurns,
    });
    bumpSentiment(next, action.target, action.proposer, -18);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} threatens ${a.target}: "${a.payload.demand}" within ${a.payload.deadlineInTurns} turns.`,
};

export const EXTORT_TRIBUTE = {
  type: 'EXTORT_TRIBUTE',
  category: 'coercion',
  llmHint:
    'Demand resources under implicit threat. Target can pay to ease sentiment or refuse at the risk of escalation.',
  schema: { demanded: 'ResourceBag' },
  validate(action) {
    const bag = action.payload.demanded || {};
    const any = Object.values(bag).some((v) => v > 0);
    if (!any) return { ok: false, reason: 'empty_demand' };
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
    bumpSentiment(next, action.target, action.proposer, -10);
    return next;
  },
  summarize: (a) => `${a.proposer} extorts tribute from ${a.target}.`,
};

export const DEMAND_HOSTAGES = {
  type: 'DEMAND_HOSTAGES',
  category: 'coercion',
  llmHint:
    "Demand noble hostages as insurance against future betrayal. Pending offer; if accepted, no separate hostage-backed binding exists yet. Sharply negative sentiment regardless of existing relations (flat -16 on propose; validator does not vary by alliance or vassalage status).",
  schema: { count: 'number>0' },
  validate(action) {
    if ((action.payload.count || 0) < 1)
      return { ok: false, reason: 'invalid_count' };
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
    bumpSentiment(next, action.target, action.proposer, -16);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} demands ${a.payload.count} hostage(s) from ${a.target}.`,
};

export const BLOCKADE = {
  type: 'BLOCKADE',
  category: 'coercion',
  llmHint:
    "Blockade the target's trade. Suspends all of their trade routes for the duration — they earn nothing from trade while blockaded, but you gain no income from this action yourself. Severe sentiment loss.",
  schema: { duration: 'number>0' },
  validate(action) {
    if ((action.payload.duration || 0) < 1)
      return { ok: false, reason: 'invalid_duration' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.blockades = next.diplomacy.blockades || [];
    next.diplomacy.blockades.push({
      blockader: action.proposer,
      against: action.target,
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
    });
    // Disable target's trade routes for the blockade's duration. Take the
    // MAX of any prior suspendedUntilTurn and this blockade's expiry —
    // a shorter overlapping blockade must not shorten an already-running
    // longer one (the longer blockade is still in force).
    const newExpiry = (state.turn || 0) + action.payload.duration;
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).map((r) => {
      if (r.a === action.target || r.b === action.target) {
        const prior = r.suspendedUntilTurn ?? 0;
        return { ...r, suspendedUntilTurn: Math.max(prior, newExpiry) };
      }
      return r;
    });
    bumpSentiment(next, action.target, action.proposer, -26);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} blockades ${a.target} for ${a.payload.duration} turns.`,
};

export const ULTIMATUM_WITH_DEADLINE = {
  type: 'ULTIMATUM_WITH_DEADLINE',
  category: 'coercion',
  llmHint:
    "Formal ultimatum: comply by turn X or face a specified consequence. Upon expiry the consequence is expected (enforced at the fiction/GM layer).",
  schema: {
    demand: 'string',
    deadlineInTurns: 'number>0',
    consequence: 'string',
  },
  validate(action) {
    if (!action.payload?.demand) return { ok: false, reason: 'missing_demand' };
    if (!action.payload?.consequence)
      return { ok: false, reason: 'missing_consequence' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.ultimatums = next.diplomacy.ultimatums || [];
    next.diplomacy.ultimatums.push({
      from: action.proposer,
      against: action.target,
      demand: action.payload.demand,
      consequence: action.payload.consequence,
      expiresOnTurn: (state.turn || 0) + action.payload.deadlineInTurns,
    });
    bumpSentiment(next, action.target, action.proposer, -14);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} delivers ultimatum to ${a.target}: "${a.payload.demand}" (or ${a.payload.consequence}) within ${a.payload.deadlineInTurns} turns.`,
};
