// Influence actions — 3 of 20.

import {
  factionById,
  hasResources,
  deductResources,
  bumpSentiment,
} from './_helpers';

export const COURT_FAVOR = {
  type: 'COURT_FAVOR',
  category: 'influence',
  llmHint:
    'Spend gold and Influence Points to court the target\'s court. Raises their sentiment toward you.',
  schema: { gold: 'number>0', ip: 'number>0' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.gold, ip: action.payload.ip }))
      return { ok: false, reason: 'insufficient_resources' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { gold: action.payload.gold, ip: action.payload.ip });
    const delta = Math.min(
      20,
      Math.floor(2 + action.payload.gold / 3 + action.payload.ip * 1.5),
    );
    bumpSentiment(next, action.target, action.proposer, +delta);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} courts favor with ${a.target} (${a.payload.gold}g, ${a.payload.ip}ip).`,
};

export const CULTURAL_EXCHANGE = {
  type: 'CULTURAL_EXCHANGE',
  category: 'influence',
  llmHint:
    "Send artists, scholars, or sacred objects. Records a culturalTies entry and grants +10 target->proposer sentiment. The tie is otherwise descriptive — no validator reads culturalTies to unlock dialogue, topics, or other actions.",
  schema: { theme: 'string' },
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.culturalTies = next.diplomacy.culturalTies || [];
    next.diplomacy.culturalTies.push({
      a: action.proposer,
      b: action.target,
      theme: action.payload.theme,
      sinceTurn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, +10);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} opens cultural exchange with ${a.target} (${a.payload.theme}).`,
};

export const ACCUSE_OF_BETRAYAL = {
  type: 'ACCUSE_OF_BETRAYAL',
  category: 'influence',
  llmHint:
    'Publicly accuse the target of breaking a pact or norm. Costs IP, damages their reputation with third parties.',
  schema: { accusation: 'string' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: 2 }))
      return { ok: false, reason: 'insufficient_ip' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: 2 });
    bumpSentiment(next, action.target, action.proposer, -15);
    // Third parties slightly dislike the accused.
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, -4);
    });
    return next;
  },
  summarize: (a) =>
    `${a.proposer} accuses ${a.target} of betrayal: "${a.payload.accusation}"`,
};

export const SPREAD_PROPAGANDA = {
  type: 'SPREAD_PROPAGANDA',
  category: 'influence',
  llmHint:
    "Mount a propaganda campaign against the target. Costs IP. Modest direct sentiment loss; lasting reputational drag with third parties.",
  schema: { ip: 'number>0', narrative: 'string' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: action.payload.ip }))
      return { ok: false, reason: 'insufficient_ip' };
    if (!action.payload?.narrative)
      return { ok: false, reason: 'missing_narrative' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: action.payload.ip });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.propaganda = next.diplomacy.propaganda || [];
    next.diplomacy.propaganda.push({
      from: action.proposer,
      against: action.target,
      narrative: action.payload.narrative,
      turn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, -8);
    const drag = Math.min(6, 2 + Math.floor(action.payload.ip / 2));
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, -drag);
    });
    return next;
  },
  summarize: (a) =>
    `${a.proposer} spreads propaganda against ${a.target}: "${a.payload.narrative}".`,
};

export const PRAISE_PUBLICLY = {
  type: 'PRAISE_PUBLICLY',
  category: 'influence',
  llmHint:
    "Publicly praise the target. Mild direct sentiment gain; modest reputational lift with third parties. Cheap and friendly.",
  schema: { occasion: 'string' },
  validate(action) {
    if (!action.payload?.occasion)
      return { ok: false, reason: 'missing_occasion' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.praise = next.diplomacy.praise || [];
    next.diplomacy.praise.push({
      from: action.proposer,
      about: action.target,
      occasion: action.payload.occasion,
      turn: state.turn || 0,
    });
    bumpSentiment(next, action.target, action.proposer, +6);
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, +2);
    });
    return next;
  },
  summarize: (a) =>
    `${a.proposer} publicly praises ${a.target} (${a.payload.occasion}).`,
};

export const SPONSOR_FACTION_AT_COURT = {
  type: 'SPONSOR_FACTION_AT_COURT',
  category: 'influence',
  llmHint:
    "Sponsor the target inside a third faction's court — paying IP and gold to advocate on their behalf. The sponsored target gains favor with the court faction.",
  schema: { courtFaction: 'string', ip: 'number>0', gold: 'number>0' },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, {
      ip: action.payload.ip,
      gold: action.payload.gold,
    }))
      return { ok: false, reason: 'insufficient_resources' };
    if (!action.payload?.courtFaction)
      return { ok: false, reason: 'missing_court' };
    if (action.payload.courtFaction === action.target)
      return { ok: false, reason: 'court_must_be_third_party' };
    // "Sponsor themselves at their own court" is incoherent: the
    // bumpSentiment(courtFaction, target, +lift) would be a self-from
    // entry on the sponsor. Reject symmetrically with the target guard.
    if (action.payload.courtFaction === action.proposer)
      return { ok: false, reason: 'court_must_be_third_party' };
    // Unknown courtFaction ids leak into sponsorships[] and create
    // phantom sentiment keys that never clear.
    if (!factionById(state, action.payload.courtFaction))
      return { ok: false, reason: 'unknown_court' };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, {
      ip: action.payload.ip,
      gold: action.payload.gold,
    });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.sponsorships = next.diplomacy.sponsorships || [];
    next.diplomacy.sponsorships.push({
      sponsor: action.proposer,
      sponsored: action.target,
      court: action.payload.courtFaction,
      turn: state.turn || 0,
    });
    const lift = Math.min(14, 4 + action.payload.ip + Math.floor(action.payload.gold / 4));
    bumpSentiment(next, action.payload.courtFaction, action.target, +lift);
    bumpSentiment(next, action.target, action.proposer, +6);
    return next;
  },
  summarize: (a) =>
    `${a.proposer} sponsors ${a.target} at the court of ${a.payload.courtFaction}.`,
};
