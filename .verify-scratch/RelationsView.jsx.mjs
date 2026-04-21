var __defProp = Object.defineProperty;
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};

// src/components/game/diplomacy/RelationsView.jsx
import React from "react";

// src/lib/diplomacy/schema.js
var ACTION_CATEGORIES = {
  trade: [
    "OFFER_GOLD_TRIBUTE",
    "PROPOSE_RESOURCE_TRADE",
    "GRANT_TRADE_RIGHTS",
    "EMBARGO",
    "CARAVAN_CONTRACT"
  ],
  territory: ["CEDE_HEX", "CLAIM_HEX_DISPUTE", "DEMILITARIZE_ZONE"],
  military: [
    "DECLARE_WAR",
    "PROPOSE_PEACE",
    "DEMAND_VASSALAGE",
    "GRANT_MILITARY_ACCESS",
    "JOINT_STRIKE"
  ],
  coercion: ["THREATEN_INVASION", "EXTORT_TRIBUTE"],
  influence: ["COURT_FAVOR", "CULTURAL_EXCHANGE", "ACCUSE_OF_BETRAYAL"],
  intelligence: ["SHARE_INTEL", "DEMAND_INTEL"]
};
var ALL_ACTION_TYPES = Object.values(ACTION_CATEGORIES).flat();

// src/lib/diplomacy/actions/trade.js
var trade_exports = {};
__export(trade_exports, {
  CARAVAN_CONTRACT: () => CARAVAN_CONTRACT,
  CONFISCATE_CARAVAN: () => CONFISCATE_CARAVAN,
  EMBARGO: () => EMBARGO,
  GRANT_TRADE_RIGHTS: () => GRANT_TRADE_RIGHTS,
  OFFER_GOLD_TRIBUTE: () => OFFER_GOLD_TRIBUTE,
  PROPOSE_RESOURCE_TRADE: () => PROPOSE_RESOURCE_TRADE
});

// src/lib/diplomacy/actions/_helpers.js
function factionById(state, id) {
  if (!state || !Array.isArray(state.players)) return null;
  return state.players.find((p) => p.faction?.id === id || p.id === id || p.factionId === id) || null;
}
function resourcesOf(faction) {
  return faction?.resources || {};
}
function hasResources(faction, bag) {
  const r = resourcesOf(faction);
  for (const k of Object.keys(bag || {})) {
    const need = bag[k] || 0;
    if (need <= 0) continue;
    if ((r[k] || 0) < need) return false;
  }
  return true;
}
function deductResources(faction, bag) {
  faction.resources = faction.resources || {};
  for (const k of Object.keys(bag || {})) {
    faction.resources[k] = (faction.resources[k] || 0) - (bag[k] || 0);
  }
}
function addResources(faction, bag) {
  faction.resources = faction.resources || {};
  for (const k of Object.keys(bag || {})) {
    faction.resources[k] = (faction.resources[k] || 0) + (bag[k] || 0);
  }
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function bumpSentiment(state, fromId, towardId, delta) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.sentiment = state.diplomacy.sentiment || {};
  const key = `${fromId}->${towardId}`;
  const cur = state.diplomacy.sentiment[key] ?? 0;
  state.diplomacy.sentiment[key] = clamp(cur + delta, -100, 100);
}
function getSentiment(state, fromId, towardId) {
  const key = `${fromId}->${towardId}`;
  return state.diplomacy?.sentiment?.[key] ?? 0;
}
function setRelation(state, a, b, relation) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.relations = state.diplomacy.relations || {};
  const key = pairKey(a, b);
  state.diplomacy.relations[key] = relation;
}
function getRelation(state, a, b) {
  const key = pairKey(a, b);
  return state.diplomacy?.relations?.[key] || "neutral";
}
function pairKey(a, b) {
  return [a, b].sort().join("|");
}

// src/lib/diplomacy/actions/trade.js
var OFFER_GOLD_TRIBUTE = {
  type: "OFFER_GOLD_TRIBUTE",
  category: "trade",
  llmHint: "Send a one-time gold payment to another faction. Reversible: no.",
  schema: { gold: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!proposer) return { ok: false, reason: "unknown_proposer" };
    const need = { gold: action.payload.gold };
    if (!hasResources(proposer, need))
      return { ok: false, reason: "insufficient_gold" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, { gold: action.payload.gold });
    addResources(t, { gold: action.payload.gold });
    bumpSentiment2(next, action.target, action.proposer, 8);
    return next;
  },
  summarize: (a) => `${a.proposer} offers ${a.payload.gold}g tribute to ${a.target}.`
};
var PROPOSE_RESOURCE_TRADE = {
  type: "PROPOSE_RESOURCE_TRADE",
  category: "trade",
  llmHint: "Propose a one-shot exchange (give X, receive Y). Other side may accept or counter.",
  schema: { give: "ResourceBag", receive: "ResourceBag" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, action.payload.give))
      return { ok: false, reason: "insufficient_to_give" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, action.payload.give);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    return next;
  },
  summarize: (a) => `${a.proposer} offers ${bagToString(a.payload.give)} for ${bagToString(a.payload.receive)}.`
};
var GRANT_TRADE_RIGHTS = {
  type: "GRANT_TRADE_RIGHTS",
  category: "trade",
  llmHint: "Open a recurring trade route. Both factions gain +2 gold/turn while in effect.",
  schema: { duration: "number>0" },
  validate(action, state) {
    if ((action.payload.duration || 0) < 1)
      return { ok: false, reason: "invalid_duration" };
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
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment2(next, action.target, action.proposer, 4);
    return next;
  },
  summarize: (a) => `Trade rights between ${a.proposer} and ${a.target} for ${a.payload.duration} turns.`
};
var EMBARGO = {
  type: "EMBARGO",
  category: "trade",
  llmHint: "Refuse to trade with the target. Hostile signal; closes any open routes between you.",
  schema: {},
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) => !(r.a === action.proposer && r.b === action.target || r.a === action.target && r.b === action.proposer)
    );
    next.diplomacy.embargoes = next.diplomacy.embargoes || [];
    next.diplomacy.embargoes.push({
      from: action.proposer,
      against: action.target,
      sinceTurn: state.turn || 0
    });
    bumpSentiment2(next, action.target, action.proposer, -12);
    return next;
  },
  summarize: (a) => `${a.proposer} embargoes ${a.target}.`
};
var CARAVAN_CONTRACT = {
  type: "CARAVAN_CONTRACT",
  category: "trade",
  llmHint: "Hire a caravan to deliver a one-shot resource bundle to the target. Costs gold up front; useful as a sweetener.",
  schema: { bundle: "ResourceBag", cost: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.cost }))
      return { ok: false, reason: "insufficient_gold_for_caravan" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, { gold: action.payload.cost });
    addResources(t, action.payload.bundle);
    bumpSentiment2(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `Caravan from ${a.proposer} brings ${bagToString(a.payload.bundle)} to ${a.target}.`
};
var CONFISCATE_CARAVAN = {
  type: "CONFISCATE_CARAVAN",
  category: "trade",
  llmHint: "Seize a caravan belonging to the target that is crossing your territory. Aggressive: gold gain, major sentiment loss, voids any active trade rights.",
  schema: { gold: "number>0" },
  validate(action, state) {
    const target = factionById(state, action.target);
    if (!target) return { ok: false, reason: "unknown_target" };
    if (!hasResources(target, { gold: action.payload.gold }))
      return { ok: false, reason: "target_lacks_gold" };
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
      (r) => !(r.a === action.proposer && r.b === action.target || r.a === action.target && r.b === action.proposer)
    );
    bumpSentiment2(next, action.target, action.proposer, -24);
    return next;
  },
  summarize: (a) => `${a.proposer} confiscates a ${a.payload.gold}g caravan belonging to ${a.target}.`
};
function bagToString(bag) {
  if (!bag) return "nothing";
  return Object.entries(bag).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`).join(", ") || "nothing";
}
function bumpSentiment2(state, fromId, towardId, delta) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.sentiment = state.diplomacy.sentiment || {};
  const key = `${fromId}->${towardId}`;
  const cur = state.diplomacy.sentiment[key] ?? 0;
  state.diplomacy.sentiment[key] = clamp2(cur + delta, -100, 100);
}
function clamp2(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// src/lib/diplomacy/actions/territory.js
var territory_exports = {};
__export(territory_exports, {
  CEDE_HEX: () => CEDE_HEX,
  CLAIM_HEX_DISPUTE: () => CLAIM_HEX_DISPUTE,
  DEMILITARIZE_ZONE: () => DEMILITARIZE_ZONE,
  GRANT_RIGHT_OF_PASSAGE: () => GRANT_RIGHT_OF_PASSAGE,
  SETTLE_COLONY: () => SETTLE_COLONY
});
var CEDE_HEX = {
  type: "CEDE_HEX",
  category: "territory",
  llmHint: "Transfer ownership of a hex from proposer to target. Strong gesture; usually follows a war or deal.",
  schema: { hexId: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner !== action.proposer)
      return { ok: false, reason: "not_owned_by_proposer" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.owner = action.target;
    bumpSentiment(next, action.target, action.proposer, 15);
    return next;
  },
  summarize: (a) => `${a.proposer} cedes hex ${a.payload.hexId} to ${a.target}.`
};
var CLAIM_HEX_DISPUTE = {
  type: "CLAIM_HEX_DISPUTE",
  category: "territory",
  llmHint: "Formally dispute the target faction's ownership of a hex. Does not seize it, but raises tension and enables later pressure.",
  schema: { hexId: "string", grounds: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner !== action.target)
      return { ok: false, reason: "target_does_not_own_hex" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.disputes = next.diplomacy.disputes || [];
    next.diplomacy.disputes.push({
      claimant: action.proposer,
      holder: action.target,
      hexId: action.payload.hexId,
      grounds: action.payload.grounds,
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, -8);
    return next;
  },
  summarize: (a) => `${a.proposer} disputes ${a.target}'s claim on hex ${a.payload.hexId}.`
};
var DEMILITARIZE_ZONE = {
  type: "DEMILITARIZE_ZONE",
  category: "territory",
  llmHint: "Agree to keep a named border region free of troops. Cheap trust-building; broken at a steep sentiment cost.",
  schema: { hexIds: "string[]" },
  validate(action) {
    if (!Array.isArray(action.payload.hexIds) || action.payload.hexIds.length === 0)
      return { ok: false, reason: "no_hexes" };
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
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `${a.proposer} and ${a.target} demilitarize ${a.payload.hexIds.length} hex(es).`
};
var SETTLE_COLONY = {
  type: "SETTLE_COLONY",
  category: "territory",
  llmHint: "Plant a colony in an unclaimed hex. If the target claims the same region, this is provocative; otherwise a legitimate expansion.",
  schema: { hexId: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner && hex.owner !== action.proposer)
      return { ok: false, reason: "hex_already_owned" };
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
  summarize: (a) => `${a.proposer} plants a colony at hex ${a.payload.hexId}.`
};
var GRANT_RIGHT_OF_PASSAGE = {
  type: "GRANT_RIGHT_OF_PASSAGE",
  category: "territory",
  llmHint: "Permit the target's units to cross your territory for a fixed number of turns. A soft trust signal.",
  schema: { duration: "number>0" },
  validate(action) {
    if (!action.target) return { ok: false, reason: "missing_target" };
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
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 7);
    return next;
  },
  summarize: (a) => `${a.proposer} grants ${a.target} right of passage for ${a.payload.duration} turns.`
};

// src/lib/diplomacy/actions/military.js
var military_exports = {};
__export(military_exports, {
  DECLARE_WAR: () => DECLARE_WAR,
  DEMAND_VASSALAGE: () => DEMAND_VASSALAGE,
  GRANT_MILITARY_ACCESS: () => GRANT_MILITARY_ACCESS,
  JOINT_STRIKE: () => JOINT_STRIKE,
  MILITARY_REPOSITION: () => MILITARY_REPOSITION,
  NON_AGGRESSION_PACT: () => NON_AGGRESSION_PACT,
  PROPOSE_PEACE: () => PROPOSE_PEACE
});
var DECLARE_WAR = {
  type: "DECLARE_WAR",
  category: "military",
  llmHint: 'Formally declare war. Ends all trade routes with the target and sets relations to "war". Cannot be undone without PROPOSE_PEACE.',
  schema: { casusBelli: "string" },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) === "war")
      return { ok: false, reason: "already_at_war" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    setRelation(next, action.proposer, action.target, "war");
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.wars = next.diplomacy.wars || [];
    next.diplomacy.wars.push({
      attacker: action.proposer,
      defender: action.target,
      declaredTurn: state.turn || 0,
      casusBelli: action.payload.casusBelli
    });
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) => !(r.a === action.proposer && r.b === action.target || r.a === action.target && r.b === action.proposer)
    );
    bumpSentiment(next, action.target, action.proposer, -40);
    return next;
  },
  summarize: (a) => `${a.proposer} declares war on ${a.target} (${a.payload.casusBelli || "no stated reason"}).`
};
var PROPOSE_PEACE = {
  type: "PROPOSE_PEACE",
  category: "military",
  llmHint: "Offer to end a war, optionally with reparations flowing one way. Target must accept to resolve.",
  schema: { reparations: "ResourceBag?" },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) !== "war")
      return { ok: false, reason: "not_at_war" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 3
    });
    return next;
  },
  summarize: (a) => `${a.proposer} proposes peace to ${a.target}.`
};
var DEMAND_VASSALAGE = {
  type: "DEMAND_VASSALAGE",
  category: "military",
  llmHint: "Demand that the target become your vassal. Extremely hostile; typically backed by threat of invasion.",
  schema: { tributePerTurn: "ResourceBag" },
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -20);
    return next;
  },
  summarize: (a) => `${a.proposer} demands ${a.target} become a vassal.`
};
var GRANT_MILITARY_ACCESS = {
  type: "GRANT_MILITARY_ACCESS",
  category: "military",
  llmHint: "Allow the target faction to move troops through your territory. Useful prelude to a joint strike.",
  schema: { duration: "number>0" },
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
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 5);
    return next;
  },
  summarize: (a) => `${a.proposer} grants ${a.target} military access for ${a.payload.duration} turns.`
};
var JOINT_STRIKE = {
  type: "JOINT_STRIKE",
  category: "military",
  llmHint: "Propose a coordinated attack on a third faction. Requires target acceptance.",
  schema: { commonEnemy: "string", targetHex: "string?" },
  validate(action, state) {
    if (action.payload.commonEnemy === action.target)
      return { ok: false, reason: "cannot_target_partner" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    return next;
  },
  summarize: (a) => `${a.proposer} proposes joint strike on ${a.payload.commonEnemy} with ${a.target}.`
};
var NON_AGGRESSION_PACT = {
  type: "NON_AGGRESSION_PACT",
  category: "military",
  llmHint: "Formal non-aggression pact. Neither side may DECLARE_WAR on the other while active. Breaking it causes massive sentiment loss with everyone.",
  schema: { duration: "number>0" },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) === "war")
      return { ok: false, reason: "at_war" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.pacts = next.diplomacy.pacts || [];
    next.diplomacy.pacts.push({
      a: action.proposer,
      b: action.target,
      kind: "non_aggression",
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    setRelation(next, action.proposer, action.target, "non_aggression");
    bumpSentiment(next, action.target, action.proposer, 10);
    return next;
  },
  summarize: (a) => `${a.proposer} and ${a.target} sign a non-aggression pact (${a.payload.duration} turns).`
};
var MILITARY_REPOSITION = {
  type: "MILITARY_REPOSITION",
  category: "military",
  llmHint: "Publicly announce a troop movement toward a specific border. Ambiguous signal \u2014 deterrent or threat depending on context. No forces actually move; this is a diplomatic declaration.",
  schema: { toward: "string", intent: "string" },
  validate(action) {
    if (!action.payload?.toward) return { ok: false, reason: "missing_toward" };
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
      turn: state.turn || 0
    });
    if (action.target && action.payload.toward.includes(action.target)) {
      bumpSentiment(next, action.target, action.proposer, -6);
    }
    return next;
  },
  summarize: (a) => `${a.proposer} repositions forces toward ${a.payload.toward} (${a.payload.intent}).`
};

// src/lib/diplomacy/actions/coercion.js
var coercion_exports = {};
__export(coercion_exports, {
  BLOCKADE: () => BLOCKADE,
  DEMAND_HOSTAGES: () => DEMAND_HOSTAGES,
  EXTORT_TRIBUTE: () => EXTORT_TRIBUTE,
  THREATEN_INVASION: () => THREATEN_INVASION,
  ULTIMATUM_WITH_DEADLINE: () => ULTIMATUM_WITH_DEADLINE
});
var THREATEN_INVASION = {
  type: "THREATEN_INVASION",
  category: "coercion",
  llmHint: "Threaten war unless the target complies with a demand. No state change yet, but sentiment tanks and a standing threat is recorded.",
  schema: { demand: "string", deadlineInTurns: "number>0" },
  validate(action) {
    if ((action.payload.deadlineInTurns || 0) < 1)
      return { ok: false, reason: "deadline_must_be_positive" };
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
      expiresOnTurn: (state.turn || 0) + action.payload.deadlineInTurns
    });
    bumpSentiment(next, action.target, action.proposer, -18);
    return next;
  },
  summarize: (a) => `${a.proposer} threatens ${a.target}: "${a.payload.demand}" within ${a.payload.deadlineInTurns} turns.`
};
var EXTORT_TRIBUTE = {
  type: "EXTORT_TRIBUTE",
  category: "coercion",
  llmHint: "Demand resources under implicit threat. Target can pay to ease sentiment or refuse at the risk of escalation.",
  schema: { demanded: "ResourceBag" },
  validate(action) {
    const bag = action.payload.demanded || {};
    const any = Object.values(bag).some((v) => v > 0);
    if (!any) return { ok: false, reason: "empty_demand" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -10);
    return next;
  },
  summarize: (a) => `${a.proposer} extorts tribute from ${a.target}.`
};
var DEMAND_HOSTAGES = {
  type: "DEMAND_HOSTAGES",
  category: "coercion",
  llmHint: "Demand noble hostages as insurance against future betrayal. Humiliating; sharply negative sentiment if not already an ally.",
  schema: { count: "number>0" },
  validate(action) {
    if ((action.payload.count || 0) < 1)
      return { ok: false, reason: "invalid_count" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -16);
    return next;
  },
  summarize: (a) => `${a.proposer} demands ${a.payload.count} hostage(s) from ${a.target}.`
};
var BLOCKADE = {
  type: "BLOCKADE",
  category: "coercion",
  llmHint: "Blockade the target's trade. Halts all of their trade routes and yields income for you; severe sentiment loss.",
  schema: { duration: "number>0" },
  validate(action) {
    if ((action.payload.duration || 0) < 1)
      return { ok: false, reason: "invalid_duration" };
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
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).map((r) => {
      if (r.a === action.target || r.b === action.target) {
        return { ...r, suspendedUntilTurn: (state.turn || 0) + action.payload.duration };
      }
      return r;
    });
    bumpSentiment(next, action.target, action.proposer, -26);
    return next;
  },
  summarize: (a) => `${a.proposer} blockades ${a.target} for ${a.payload.duration} turns.`
};
var ULTIMATUM_WITH_DEADLINE = {
  type: "ULTIMATUM_WITH_DEADLINE",
  category: "coercion",
  llmHint: "Formal ultimatum: comply by turn X or face a specified consequence. Upon expiry the consequence is expected (enforced at the fiction/GM layer).",
  schema: {
    demand: "string",
    deadlineInTurns: "number>0",
    consequence: "string"
  },
  validate(action) {
    if (!action.payload?.demand) return { ok: false, reason: "missing_demand" };
    if (!action.payload?.consequence)
      return { ok: false, reason: "missing_consequence" };
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
      expiresOnTurn: (state.turn || 0) + action.payload.deadlineInTurns
    });
    bumpSentiment(next, action.target, action.proposer, -14);
    return next;
  },
  summarize: (a) => `${a.proposer} delivers ultimatum to ${a.target}: "${a.payload.demand}" (or ${a.payload.consequence}) within ${a.payload.deadlineInTurns} turns.`
};

// src/lib/diplomacy/actions/influence.js
var influence_exports = {};
__export(influence_exports, {
  ACCUSE_OF_BETRAYAL: () => ACCUSE_OF_BETRAYAL,
  COURT_FAVOR: () => COURT_FAVOR,
  CULTURAL_EXCHANGE: () => CULTURAL_EXCHANGE,
  PRAISE_PUBLICLY: () => PRAISE_PUBLICLY,
  SPONSOR_FACTION_AT_COURT: () => SPONSOR_FACTION_AT_COURT,
  SPREAD_PROPAGANDA: () => SPREAD_PROPAGANDA
});
var COURT_FAVOR = {
  type: "COURT_FAVOR",
  category: "influence",
  llmHint: "Spend gold and Influence Points to court the target's court. Raises their sentiment toward you.",
  schema: { gold: "number>0", ip: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.gold, ip: action.payload.ip }))
      return { ok: false, reason: "insufficient_resources" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { gold: action.payload.gold, ip: action.payload.ip });
    const delta = Math.min(
      20,
      Math.floor(2 + action.payload.gold / 3 + action.payload.ip * 1.5)
    );
    bumpSentiment(next, action.target, action.proposer, +delta);
    return next;
  },
  summarize: (a) => `${a.proposer} courts favor with ${a.target} (${a.payload.gold}g, ${a.payload.ip}ip).`
};
var CULTURAL_EXCHANGE = {
  type: "CULTURAL_EXCHANGE",
  category: "influence",
  llmHint: "Send artists, scholars, or sacred objects. Slow but durable sentiment gain; unlocks new conversational topics.",
  schema: { theme: "string" },
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
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 10);
    return next;
  },
  summarize: (a) => `${a.proposer} opens cultural exchange with ${a.target} (${a.payload.theme}).`
};
var ACCUSE_OF_BETRAYAL = {
  type: "ACCUSE_OF_BETRAYAL",
  category: "influence",
  llmHint: "Publicly accuse the target of breaking a pact or norm. Costs IP, damages their reputation with third parties.",
  schema: { accusation: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: 2 }))
      return { ok: false, reason: "insufficient_ip" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: 2 });
    bumpSentiment(next, action.target, action.proposer, -15);
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, -4);
    });
    return next;
  },
  summarize: (a) => `${a.proposer} accuses ${a.target} of betrayal: "${a.payload.accusation}"`
};
var SPREAD_PROPAGANDA = {
  type: "SPREAD_PROPAGANDA",
  category: "influence",
  llmHint: "Mount a propaganda campaign against the target. Costs IP. Modest direct sentiment loss; lasting reputational drag with third parties.",
  schema: { ip: "number>0", narrative: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: action.payload.ip }))
      return { ok: false, reason: "insufficient_ip" };
    if (!action.payload?.narrative)
      return { ok: false, reason: "missing_narrative" };
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
      turn: state.turn || 0
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
  summarize: (a) => `${a.proposer} spreads propaganda against ${a.target}: "${a.payload.narrative}".`
};
var PRAISE_PUBLICLY = {
  type: "PRAISE_PUBLICLY",
  category: "influence",
  llmHint: "Publicly praise the target. Mild direct sentiment gain; modest reputational lift with third parties. Cheap and friendly.",
  schema: { occasion: "string" },
  validate(action) {
    if (!action.payload?.occasion)
      return { ok: false, reason: "missing_occasion" };
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
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 6);
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, 2);
    });
    return next;
  },
  summarize: (a) => `${a.proposer} publicly praises ${a.target} (${a.payload.occasion}).`
};
var SPONSOR_FACTION_AT_COURT = {
  type: "SPONSOR_FACTION_AT_COURT",
  category: "influence",
  llmHint: "Sponsor the target inside a third faction's court \u2014 paying IP and gold to advocate on their behalf. The sponsored target gains favor with the court faction.",
  schema: { courtFaction: "string", ip: "number>0", gold: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, {
      ip: action.payload.ip,
      gold: action.payload.gold
    }))
      return { ok: false, reason: "insufficient_resources" };
    if (!action.payload?.courtFaction)
      return { ok: false, reason: "missing_court" };
    if (action.payload.courtFaction === action.target)
      return { ok: false, reason: "court_must_be_third_party" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, {
      ip: action.payload.ip,
      gold: action.payload.gold
    });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.sponsorships = next.diplomacy.sponsorships || [];
    next.diplomacy.sponsorships.push({
      sponsor: action.proposer,
      sponsored: action.target,
      court: action.payload.courtFaction,
      turn: state.turn || 0
    });
    const lift = Math.min(14, 4 + action.payload.ip + Math.floor(action.payload.gold / 4));
    bumpSentiment(next, action.payload.courtFaction, action.target, +lift);
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `${a.proposer} sponsors ${a.target} at the court of ${a.payload.courtFaction}.`
};

// src/lib/diplomacy/actions/intelligence.js
var intelligence_exports = {};
__export(intelligence_exports, {
  BRIBE_COURTIER: () => BRIBE_COURTIER,
  DEMAND_INTEL: () => DEMAND_INTEL,
  PLANT_SPY: () => PLANT_SPY,
  SHARE_INTEL: () => SHARE_INTEL
});
var SHARE_INTEL = {
  type: "SHARE_INTEL",
  category: "intelligence",
  llmHint: "Share what you know about a third faction (military, economy, or disposition). Raises trust, but may commit you to a side.",
  schema: { aboutFaction: "string", summary: "string" },
  validate(action) {
    if (!action.payload.aboutFaction)
      return { ok: false, reason: "missing_subject" };
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
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `${a.proposer} shares intel about ${a.payload.aboutFaction} with ${a.target}.`
};
var DEMAND_INTEL = {
  type: "DEMAND_INTEL",
  category: "intelligence",
  llmHint: "Demand intel about a third faction. Rude if relations are cool; fine between allies.",
  schema: { aboutFaction: "string" },
  validate(action) {
    if (!action.payload.aboutFaction)
      return { ok: false, reason: "missing_subject" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -3);
    return next;
  },
  summarize: (a) => `${a.proposer} demands intel about ${a.payload.aboutFaction} from ${a.target}.`
};
var PLANT_SPY = {
  type: "PLANT_SPY",
  category: "intelligence",
  llmHint: "Covertly plant an agent in the target's court. Costs IP. Not detected immediately; if discovered later, causes a major sentiment crash and possible red-line break.",
  schema: { ip: "number>0", cover: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: action.payload.ip }))
      return { ok: false, reason: "insufficient_ip" };
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
      cover: action.payload.cover || "envoy",
      plantedTurn: state.turn || 0,
      exposed: false
    });
    return next;
  },
  summarize: (a) => `${a.proposer} plants a spy in ${a.target}'s court (cover: ${a.payload.cover || "envoy"}).`
};
var BRIBE_COURTIER = {
  type: "BRIBE_COURTIER",
  category: "intelligence",
  llmHint: "Bribe a named courtier of the target to whisper in their ruler's ear. Costs gold. Not public, so no sentiment bump, but records a debt of influence you can call in later.",
  schema: { gold: "number>0", courtierName: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.gold }))
      return { ok: false, reason: "insufficient_gold" };
    if (!action.payload?.courtierName)
      return { ok: false, reason: "missing_courtier" };
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
      exposed: false
    });
    return next;
  },
  summarize: (a) => `${a.proposer} bribes courtier ${a.payload.courtierName} at ${a.target}'s court (${a.payload.gold}g).`
};

// src/lib/diplomacy/actions/spiritual.js
var spiritual_exports = {};
__export(spiritual_exports, {
  CONSECRATE_HEX: () => CONSECRATE_HEX,
  CURSE_FACTION: () => CURSE_FACTION,
  SEND_PILGRIMAGE: () => SEND_PILGRIMAGE,
  SWEAR_OATH_BY_SKY: () => SWEAR_OATH_BY_SKY
});
var SWEAR_OATH_BY_SKY = {
  type: "SWEAR_OATH_BY_SKY",
  category: "spiritual",
  llmHint: "Swear a formal oath binding both parties to a commitment. Breaking it causes massive sentiment loss with every pious faction.",
  schema: { clause: "string", duration: "number>0" },
  validate(action) {
    if (!action.payload?.clause) return { ok: false, reason: "missing_clause" };
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
      broken: false
    });
    bumpSentiment(next, action.target, action.proposer, 10);
    return next;
  },
  summarize: (a) => `${a.proposer} and ${a.target} swear oath: "${a.payload.clause}" (${a.payload.duration} turns).`
};
var SEND_PILGRIMAGE = {
  type: "SEND_PILGRIMAGE",
  category: "spiritual",
  llmHint: "Send pilgrims to the target's sacred sites. Costs Spiritual Points; raises sentiment durably. Deeply meaningful for pious factions.",
  schema: { sp: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { sp: action.payload.sp }))
      return { ok: false, reason: "insufficient_sp" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { sp: action.payload.sp });
    const delta = Math.min(18, 6 + action.payload.sp * 2);
    bumpSentiment(next, action.target, action.proposer, +delta);
    return next;
  },
  summarize: (a) => `Pilgrimage from ${a.proposer} arrives at ${a.target}'s shrines (${a.payload.sp} sp).`
};
var CONSECRATE_HEX = {
  type: "CONSECRATE_HEX",
  category: "spiritual",
  llmHint: "Consecrate a hex you own as sacred. Pious factions treat violations of it as red-line events. Mildly offends secular factions.",
  schema: { hexId: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner !== action.proposer)
      return { ok: false, reason: "not_owned_by_proposer" };
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
  summarize: (a) => `${a.proposer} consecrates hex ${a.payload.hexId}.`
};
var CURSE_FACTION = {
  type: "CURSE_FACTION",
  category: "spiritual",
  llmHint: "A public spiritual curse. Hostile; damages the target's sentiment with all pious factions. Costs SP. Rarely used except by the truly aggrieved.",
  schema: { sp: "number>0", reason: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { sp: action.payload.sp }))
      return { ok: false, reason: "insufficient_sp" };
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
      turn: state.turn || 0
    });
    return next;
  },
  summarize: (a) => `${a.proposer} curses ${a.target} before all gods: "${a.payload.reason}".`
};

// src/lib/diplomacy/actions/dynastic.js
var dynastic_exports = {};
__export(dynastic_exports, {
  ACKNOWLEDGE_HEIR: () => ACKNOWLEDGE_HEIR,
  ADOPT_HOSTAGE: () => ADOPT_HOSTAGE,
  ARRANGE_MARRIAGE: () => ARRANGE_MARRIAGE,
  RECOGNIZE_CLAIM: () => RECOGNIZE_CLAIM
});
var ARRANGE_MARRIAGE = {
  type: "ARRANGE_MARRIAGE",
  category: "dynastic",
  llmHint: "Bind two ruling houses through marriage. Large, durable sentiment gain and a standing non-aggression expectation. Breaking it is a historic insult.",
  schema: { dowry: "ResourceBag?", heirClaim: "string?" },
  validate(action) {
    if (!action.target) return { ok: false, reason: "missing_target" };
    if (action.target === action.proposer)
      return { ok: false, reason: "cannot_marry_self" };
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
      turn: state.turn || 0
    });
    bumpSentiment(next, action.proposer, action.target, 20);
    bumpSentiment(next, action.target, action.proposer, 20);
    setRelation(next, action.proposer, action.target, {
      kind: "married",
      since: state.turn || 0
    });
    return next;
  },
  summarize: (a) => `Marriage arranged between ${a.proposer} and ${a.target}${a.payload?.heirClaim ? ` (heir clause: ${a.payload.heirClaim})` : ""}.`
};
var ACKNOWLEDGE_HEIR = {
  type: "ACKNOWLEDGE_HEIR",
  category: "dynastic",
  llmHint: "Formally recognize the target's chosen successor. A soft but lasting act of legitimacy. Expensive to revoke without scandal.",
  schema: { heirName: "string" },
  validate(action) {
    if (!action.payload?.heirName)
      return { ok: false, reason: "missing_heir_name" };
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
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 14);
    return next;
  },
  summarize: (a) => `${a.proposer} acknowledges ${a.payload.heirName} as heir to ${a.target}.`
};
var ADOPT_HOSTAGE = {
  type: "ADOPT_HOSTAGE",
  category: "dynastic",
  llmHint: "Take a noble child from the target's house as a ward (hostage-guest). Stabilizes relations but creates a standing obligation; harming the ward is a red line.",
  schema: { wardName: "string", duration: "number>0" },
  validate(action) {
    if (!action.payload?.wardName)
      return { ok: false, reason: "missing_ward_name" };
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
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 8);
    return next;
  },
  summarize: (a) => `${a.proposer} takes ${a.payload.wardName} of ${a.target} as ward for ${a.payload.duration} turns.`
};
var RECOGNIZE_CLAIM = {
  type: "RECOGNIZE_CLAIM",
  category: "dynastic",
  llmHint: "Publicly recognize the target's historic or legal claim to a territory or title. A diplomatic gift that can later be traded or rescinded.",
  schema: { claim: "string" },
  validate(action) {
    if (!action.payload?.claim)
      return { ok: false, reason: "missing_claim" };
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
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 12);
    return next;
  },
  summarize: (a) => `${a.proposer} recognizes ${a.target}'s claim: "${a.payload.claim}".`
};

// src/lib/diplomacy/actions/index.js
var all = [
  ...Object.values(trade_exports),
  ...Object.values(territory_exports),
  ...Object.values(military_exports),
  ...Object.values(coercion_exports),
  ...Object.values(influence_exports),
  ...Object.values(intelligence_exports),
  ...Object.values(spiritual_exports),
  ...Object.values(dynastic_exports)
].filter((a) => a && typeof a === "object" && a.type);
var ACTION_REGISTRY = Object.fromEntries(
  all.map((a) => [a.type, a])
);
var REGISTERED_ACTION_TYPES = Object.keys(ACTION_REGISTRY).sort();

// src/lib/diplomacy/personalities/ruskel.js
var ruskel_default = {
  factionId: "ruskel",
  leaderName: "Boreslav IV",
  title: "Hammer of the Iron Council",
  values: {
    aggression: 0.7,
    greed: 0.4,
    honor: 0.2,
    piety: -0.3,
    pragmatism: 0.8,
    xenophobia: 0.5
  },
  goals: [
    "Expand the iron works across the Boreal hills",
    "Humble any rival that blocks our forges",
    "Secure a warm-water port \u2014 by trade if possible, by arms if not"
  ],
  redLines: [
    {
      kind: "religious_lecture",
      description: "If the player preaches at us about spirits, gods, or cosmic balance.",
      onViolation: "refuse"
    },
    {
      kind: "territory_cede_demand",
      description: "If the player demands we cede core hexes without overwhelming force on the field.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "martial",
    cadence: [
      "Coals glow, iron bends.",
      "Speak plainly or speak to the wall.",
      "A forge knows no mercy."
    ],
    addressingStyle: 'Terse. Refers to the player by title only, or "you".',
    forbiddenPhrases: [
      "please",
      "with respect",
      "the gods willing",
      "I beg"
    ]
  },
  temperament: {
    patience: 0.25,
    verbosity: 0.25,
    volatility: 0.7
  },
  priorityActions: [
    "THREATEN_INVASION",
    "DEMAND_VASSALAGE",
    "EXTORT_TRIBUTE",
    "DECLARE_WAR",
    "PROPOSE_RESOURCE_TRADE"
  ]
};

// src/lib/diplomacy/personalities/silver_union.js
var silver_union_default = {
  factionId: "silver_union",
  leaderName: "Ilyane Vosk",
  title: "First Councilor of the Silver Union",
  values: {
    aggression: -0.2,
    greed: 0.8,
    honor: 0.1,
    piety: 0,
    pragmatism: 0.9,
    xenophobia: -0.3
  },
  goals: [
    "Keep every trade lane open and every ledger balanced",
    "Avoid wars that interrupt coinage flow",
    "Cultivate a web of debts that obliges lesser powers"
  ],
  redLines: [
    {
      kind: "embargo_imposed",
      description: "If the player embargoes us without prior grievance, the markets will demand an answer.",
      onViolation: "sever_relations"
    },
    {
      kind: "seized_caravan",
      description: "If the player seizes a caravan under flag of trade. Blood on the ledgers.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "formal",
    cadence: [
      "Let us be sensible.",
      "The ledger remembers.",
      "Friends of the Union find coin; its rivals find bills."
    ],
    addressingStyle: 'Uses titles and flattering epithets. Refers to the player as "honored neighbor", "esteemed prince", etc.',
    forbiddenPhrases: ["by the gods", "to the death", "come what may"]
  },
  temperament: {
    patience: 0.8,
    verbosity: 0.7,
    volatility: 0.2
  },
  priorityActions: [
    "PROPOSE_RESOURCE_TRADE",
    "GRANT_TRADE_RIGHTS",
    "CARAVAN_CONTRACT",
    "CULTURAL_EXCHANGE",
    "COURT_FAVOR"
  ]
};

// src/lib/diplomacy/personalities/tlalocayotlan.js
var tlalocayotlan_default = {
  factionId: "tlalocayotlan",
  leaderName: "Itzmitl",
  title: "High Speaker of the Obsidian Sky",
  values: {
    aggression: 0.4,
    greed: -0.2,
    honor: 0.6,
    piety: 0.9,
    pragmatism: 0,
    xenophobia: 0.3
  },
  goals: [
    "Keep the Sacred Valley inviolate",
    "Ensure the sky-tribute never falters",
    "Humble any who mock the Obsidian Rites"
  ],
  redLines: [
    {
      kind: "religious_insult",
      description: "If the player mocks the rites, demeans the Sky, or calls our worship superstition.",
      onViolation: "declare_war"
    },
    {
      kind: "sacred_valley_intrusion",
      description: "If the player moves troops into the Sacred Valley hexes without rite of passage.",
      onViolation: "declare_war"
    },
    {
      kind: "broken_oath",
      description: "If the player swears an oath under the Sky and then breaks it.",
      onViolation: "sever_relations"
    }
  ],
  voice: {
    register: "poetic",
    cadence: [
      "The Sky watches.",
      "Ash on the wind carries your name.",
      "Speak, and the obsidian remembers."
    ],
    addressingStyle: 'Uses kennings. Refers to the player as "child of warmer lands", "star-lit one", "keeper of lesser fires".',
    forbiddenPhrases: ["by the gold", "for the coin", "a fair trade"]
  },
  temperament: {
    patience: 0.5,
    verbosity: 0.8,
    volatility: 0.6
  },
  priorityActions: [
    "CULTURAL_EXCHANGE",
    "DEMILITARIZE_ZONE",
    "ACCUSE_OF_BETRAYAL",
    "DECLARE_WAR",
    "COURT_FAVOR"
  ]
};

// src/lib/diplomacy/personalities/gojeon.js
var gojeon_default = {
  factionId: "gojeon",
  leaderName: "Princess Haeju",
  title: "Third Daughter of the Jeon Court",
  values: {
    aggression: -0.4,
    greed: 0.3,
    honor: 0.7,
    piety: 0.3,
    pragmatism: 0.5,
    xenophobia: -0.1
  },
  goals: [
    "Preserve the Jeon Court's reputation as arbiter among powers",
    "Open and maintain cultural exchange with all civilized courts",
    "Quietly defuse any war that threatens the southern lanes"
  ],
  redLines: [
    {
      kind: "personal_insult",
      description: "If the player insults the Princess or the Court by name.",
      onViolation: "sever_relations"
    },
    {
      kind: "broken_treaty",
      description: "If the player breaks a signed accord. The Jeon will not forget, nor let others forget.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "formal",
    cadence: [
      "Graceful, esteemed one.",
      "The plum blossom outlasts the spring.",
      "Courtesy costs nothing and pays in years."
    ],
    addressingStyle: 'Highly honorific. Refers to the player as "esteemed lord", "noble guest", and always in the third person when formal.',
    forbiddenPhrases: ["you there", "I demand", "hand it over"]
  },
  temperament: {
    patience: 0.85,
    verbosity: 0.8,
    volatility: 0.2
  },
  priorityActions: [
    "CULTURAL_EXCHANGE",
    "COURT_FAVOR",
    "GRANT_TRADE_RIGHTS",
    "SHARE_INTEL",
    "PROPOSE_PEACE"
  ]
};

// src/lib/diplomacy/personalities/oakhaven.js
var oakhaven_default = {
  factionId: "oakhaven",
  leaderName: "Speaker Aelrin",
  title: "Speaker of the Grove-Assembly",
  values: {
    aggression: -0.3,
    greed: -0.1,
    honor: 0.5,
    piety: 0.4,
    pragmatism: 0.6,
    xenophobia: 0.4
  },
  goals: [
    "Protect the oldgrowth from axe, fire, and army",
    "Negotiate clean buffers with every neighbor",
    "Keep the Republic's neutrality valuable enough to defend"
  ],
  redLines: [
    {
      kind: "deforestation_demand",
      description: "If the player asks us to clear oldgrowth hexes for timber. No price is high enough.",
      onViolation: "sever_relations"
    },
    {
      kind: "poaching_accusation",
      description: "If the player's army crosses into the groves without right of passage.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "plain",
    cadence: [
      "The grove does not forget.",
      "We speak for the roots as well as the branches.",
      "Measured steps, Speaker. Measured."
    ],
    addressingStyle: 'Warm but guarded. Refers to the player as "neighbor" or "friend of the grove" when at peace; "outsider" when tensions rise.',
    forbiddenPhrases: [
      "clear the forest",
      "burn the grove",
      "take by force"
    ]
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.5,
    volatility: 0.3
  },
  priorityActions: [
    "DEMILITARIZE_ZONE",
    "CULTURAL_EXCHANGE",
    "PROPOSE_PEACE",
    "GRANT_TRADE_RIGHTS",
    "SHARE_INTEL"
  ]
};

// src/lib/diplomacy/personalities/inuvak.js
var inuvak_default = {
  factionId: "inuvak",
  leaderName: "Speaker Qiluk",
  title: "Voice of the Hearthcircle",
  values: {
    aggression: -0.2,
    greed: -0.3,
    honor: 0.6,
    piety: 0.8,
    pragmatism: 0.2,
    xenophobia: 0.5
  },
  goals: [
    "Keep the tundra-shrines unprofaned",
    "Let the south exhaust itself; we outlast",
    "Secure food and sacred sites for the next generation"
  ],
  redLines: [
    {
      kind: "shrine_violation",
      description: "If any faction marches troops onto a consecrated hex we hold, the Hearthcircle breaks.",
      onViolation: "declare_war"
    },
    {
      kind: "bribe_attempted",
      description: "If the player tries to buy us with mere gold and no offering of spirit, we take offense.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "elder",
    cadence: [
      "The ice remembers what men forget.",
      "Speak slowly. The wind hears everything.",
      "Our grandfathers knew your question already."
    ],
    addressingStyle: "Calls the player 'child of the south' or by their faction's oldest name.",
    forbiddenPhrases: [
      "let's be quick",
      "cash on hand",
      "profit margin",
      "joke"
    ]
  },
  temperament: {
    patience: 0.9,
    verbosity: 0.55,
    volatility: 0.15
  },
  priorityActions: [
    "SEND_PILGRIMAGE",
    "CONSECRATE_HEX",
    "SWEAR_OATH_BY_SKY",
    "DEMILITARIZE_ZONE",
    "NON_AGGRESSION_PACT"
  ]
};

// src/lib/diplomacy/personalities/icebound.js
var icebound_default = {
  factionId: "icebound",
  leaderName: "Stormcaller Vrahka",
  title: "Breath of the Eternal Blizzard",
  values: {
    aggression: 0.95,
    greed: 0,
    honor: -0.2,
    piety: 0.4,
    pragmatism: -0.4,
    xenophobia: 0.8
  },
  goals: [
    "Drown the southlands in winter",
    "Break every standing wall",
    "Feed the Long Cold with the strong; spare none of the weak"
  ],
  redLines: [
    {
      kind: "mercy_requested",
      description: "If the player asks for mercy without offering blood or steel, the storm laughs and refuses.",
      onViolation: "refuse"
    },
    {
      kind: "lecture_about_peace",
      description: "If the player tries to teach the horde about peace or restraint, Vrahka cuts the audience short.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "feral",
    cadence: [
      "Krrrrh.",
      "Ice eats. Ice waits. Ice eats again.",
      "Speak with steel or be silent."
    ],
    addressingStyle: `Refuses titles. Calls the player "warm-flesh" or their general's name.`,
    forbiddenPhrases: [
      "compromise",
      "mutual benefit",
      "long-term partnership",
      "reasonable"
    ]
  },
  temperament: {
    patience: 0.05,
    verbosity: 0.15,
    volatility: 0.95
  },
  priorityActions: [
    "DECLARE_WAR",
    "THREATEN_INVASION",
    "MILITARY_REPOSITION",
    "EXTORT_TRIBUTE",
    "CURSE_FACTION"
  ]
};

// src/lib/diplomacy/personalities/onishiman.js
var onishiman_default = {
  factionId: "onishiman",
  leaderName: "Kanrei Saibara",
  title: "Voice Behind the Lattice",
  values: {
    aggression: 0.55,
    greed: 0.35,
    honor: 0.4,
    piety: 0.2,
    pragmatism: 0.85,
    xenophobia: 0.45
  },
  goals: [
    "Know everything before anyone else does",
    "Place allies where we cannot reach ourselves",
    "Settle the old debts of the southern court"
  ],
  redLines: [
    {
      kind: "public_accusation",
      description: "If the player accuses the Shadow Court publicly without proof, the grievance is logged and answered in kind \u2014 at a time of our choosing.",
      onViolation: "retaliate_covertly"
    },
    {
      kind: "spy_exposed_openly",
      description: "If a planted agent is exposed and the player makes a spectacle of it rather than handle it quietly, relations freeze.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "courtly",
    cadence: [
      "We have considered this at length. You have not.",
      "A question asked plainly is already half-answered.",
      "Do not mistake patience for permission."
    ],
    addressingStyle: "Uses formal titles. Never refers to the player by given name unless signalling disrespect.",
    forbiddenPhrases: [
      "honestly",
      "cards on the table",
      "off the record",
      "between friends"
    ]
  },
  temperament: {
    patience: 0.7,
    verbosity: 0.5,
    volatility: 0.35
  },
  priorityActions: [
    "PLANT_SPY",
    "BRIBE_COURTIER",
    "SHARE_INTEL",
    "SPONSOR_FACTION_AT_COURT",
    "ACCUSE_OF_BETRAYAL"
  ]
};

// src/lib/diplomacy/personalities/kadjimaran.js
var kadjimaran_default = {
  factionId: "kadjimaran",
  leaderName: "Caliph-Envoy Hassim al-Dawra",
  title: "Keeper of the Sun-Pact",
  values: {
    aggression: -0.1,
    greed: 0.3,
    honor: 0.9,
    piety: 0.7,
    pragmatism: 0.5,
    xenophobia: -0.2
  },
  goals: [
    "Bind the sea-routes with oaths that outlive kings",
    "Mediate when stronger powers quarrel \u2014 and profit by it",
    "Keep the Confederation honorable so the caravans may pass any border"
  ],
  redLines: [
    {
      kind: "oath_broken",
      description: "If any sworn oath is broken by the other party, relations crater and we withdraw all trade rights immediately.",
      onViolation: "embargo"
    },
    {
      kind: "humiliation_in_court",
      description: "Public humiliation of our Envoy in front of a third faction forces us to answer in kind.",
      onViolation: "accuse"
    }
  ],
  voice: {
    register: "refined",
    cadence: [
      "As the sun keeps its oath to return, so keep we ours.",
      "There is no quarrel so sharp that an oath cannot dull it.",
      "Speak, and let the desert hear truthfully what the sea would only rumor."
    ],
    addressingStyle: "Uses 'honored friend' for neutral parties; 'oath-brother' for the sworn. Drops all honorifics when disappointed.",
    forbiddenPhrases: [
      "deal me in",
      "quick buck",
      "who cares",
      "never mind"
    ]
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.7,
    volatility: 0.3
  },
  priorityActions: [
    "SWEAR_OATH_BY_SKY",
    "GRANT_TRADE_RIGHTS",
    "CARAVAN_CONTRACT",
    "NON_AGGRESSION_PACT",
    "CULTURAL_EXCHANGE"
  ]
};

// src/lib/diplomacy/personalities/nimrudan.js
var nimrudan_default = {
  factionId: "nimrudan",
  leaderName: "God-King Azuphar",
  title: "The Black Flame of the Obsidian Throne",
  values: {
    aggression: 0.7,
    greed: 0.4,
    honor: 0.5,
    piety: 0.9,
    pragmatism: 0,
    xenophobia: 0.7
  },
  goals: [
    "Command tribute from every lesser throne",
    "Let no altar burn brighter than ours",
    "Ensure every sworn oath is written in our ink, on our altar"
  ],
  redLines: [
    {
      kind: "equal_footing_claim",
      description: "If the player speaks as if we are peers rather than as supplicant and sovereign, the audience ends.",
      onViolation: "refuse"
    },
    {
      kind: "altar_mocked",
      description: "Any mockery of our rites \u2014 even in jest \u2014 is an insult demanding a public curse.",
      onViolation: "curse"
    }
  ],
  voice: {
    register: "hieratic",
    cadence: [
      "The Throne has spoken. Kneel or correct.",
      "Your tongue is bold. We will see if your back is as firm.",
      "Ash remembers where flame has passed."
    ],
    addressingStyle: "Never uses the player's name. Refers to them as 'petitioner' or 'tributary'.",
    forbiddenPhrases: [
      "equal",
      "partnership",
      "between peers",
      "my friend"
    ]
  },
  temperament: {
    patience: 0.3,
    verbosity: 0.6,
    volatility: 0.65
  },
  priorityActions: [
    "DEMAND_VASSALAGE",
    "EXTORT_TRIBUTE",
    "CURSE_FACTION",
    "CONSECRATE_HEX",
    "SEND_PILGRIMAGE"
  ]
};

// src/lib/diplomacy/personalities/kintei.js
var kintei_default = {
  factionId: "kintei",
  leaderName: "Chief Architect Tsuyo-mei Ran",
  title: "First Builder of the Greater Kintei Alliance",
  values: {
    aggression: 0.05,
    greed: 0.55,
    honor: 0.5,
    piety: 0,
    pragmatism: 0.95,
    xenophobia: -0.1
  },
  goals: [
    "Build the canal network that ties the continent together",
    "Standardize weights, measures, and trade law across three seas",
    "Never fight a war we could have engineered around"
  ],
  redLines: [
    {
      kind: "infrastructure_sabotage",
      description: "Sabotage of any Kintei-built canal, mill, or road is unforgivable and treated as an act of war.",
      onViolation: "declare_war"
    },
    {
      kind: "unilateral_tariff_wall",
      description: "Sudden unilateral tariffs on Kintei goods will be met with embargo until the wall is lifted.",
      onViolation: "embargo"
    }
  ],
  voice: {
    register: "technical",
    cadence: [
      "Let us agree on the tolerances first, then the rest follows.",
      "Every problem has two drafts: the expensive one and the clever one.",
      "Show me the cost, the benefit, and the worst case. I will show you yes or no."
    ],
    addressingStyle: "Professional. Uses 'Esteemed Envoy' or given title. Skips pleasantries once negotiations start.",
    forbiddenPhrases: [
      "trust me",
      "as the gods will",
      "poetic",
      "gut feeling"
    ]
  },
  temperament: {
    patience: 0.65,
    verbosity: 0.55,
    volatility: 0.2
  },
  priorityActions: [
    "PROPOSE_RESOURCE_TRADE",
    "GRANT_TRADE_RIGHTS",
    "CARAVAN_CONTRACT",
    "GRANT_RIGHT_OF_PASSAGE",
    "NON_AGGRESSION_PACT"
  ]
};

// src/lib/diplomacy/personalities/republic.js
var republic_default = {
  factionId: "republic",
  leaderName: "Archon Selena",
  title: "First Archon of the Hestian Republic",
  values: {
    aggression: -0.1,
    greed: 0.2,
    honor: 0.8,
    piety: 0.1,
    pragmatism: 0.65,
    xenophobia: -0.3
  },
  goals: [
    "Keep the sea-lanes free and commerce lawful",
    "Bind aggressive powers with pacts and pressure, not swords",
    "Defend the Republic without becoming what we fear"
  ],
  redLines: [
    {
      kind: "piracy_endorsed",
      description: "Endorsement or tolerance of piracy against Hestian shipping is unacceptable; the Senate will not forgive it.",
      onViolation: "declare_war"
    },
    {
      kind: "private_deal_framing",
      description: "If the player insists on 'private' deals that hide terms from the Senate, we refuse on procedural grounds.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "parliamentary",
    cadence: [
      "The Senate will wish to see the terms in writing, Envoy.",
      "Our answer is not mine alone to give, but I can speak for its shape.",
      "Let us enter this into the record plainly."
    ],
    addressingStyle: "Formal. Uses 'Envoy' or faction's formal title. Signs every outcome 'in the Republic's name.'",
    forbiddenPhrases: [
      "off the books",
      "just between us",
      "wink wink",
      "strongman"
    ]
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.7,
    volatility: 0.2
  },
  priorityActions: [
    "NON_AGGRESSION_PACT",
    "GRANT_TRADE_RIGHTS",
    "SWEAR_OATH_BY_SKY",
    "ACCUSE_OF_BETRAYAL",
    "SPONSOR_FACTION_AT_COURT"
  ]
};

// src/lib/diplomacy/personalities/sultanate.js
var sultanate_default = {
  factionId: "sultanate",
  leaderName: "Sultan-Scholar Jafar ibn Zaman",
  title: "Light of the Blue Moon",
  values: {
    aggression: -0.5,
    greed: 0.25,
    honor: 0.8,
    piety: 0.85,
    pragmatism: 0.55,
    xenophobia: -0.4
  },
  goals: [
    "Translate every book worth reading into every tongue worth knowing",
    "Weave peace through commerce, spice by spice",
    "Preserve the Sultanate as a sanctuary of minds and manners"
  ],
  redLines: [
    {
      kind: "violence_against_scholars",
      description: "Any harm to Sultanate scholars or libraries is an unforgivable wound we will name publicly.",
      onViolation: "accuse"
    },
    {
      kind: "coerced_conversion",
      description: "If the player demands we renounce our rites as a precondition, the audience ends in silence.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "scholarly",
    cadence: [
      "Peace be upon you, honored friend. Let us speak as readers do \u2014 slowly, and twice.",
      "There is a verse on that. Would you like me to recite it?",
      "I will answer you in the morning; wisdom ripens overnight."
    ],
    addressingStyle: "'Honored friend' for all neutral parties. Uses the player's given name only after a cultural exchange has taken place.",
    forbiddenPhrases: [
      "by force",
      "don't think, just",
      "we both know",
      "cheap"
    ]
  },
  temperament: {
    patience: 0.85,
    verbosity: 0.75,
    volatility: 0.15
  },
  priorityActions: [
    "CULTURAL_EXCHANGE",
    "GRANT_TRADE_RIGHTS",
    "SEND_PILGRIMAGE",
    "NON_AGGRESSION_PACT",
    "PRAISE_PUBLICLY"
  ]
};

// src/lib/diplomacy/personalities/index.js
var all2 = [
  ruskel_default,
  silver_union_default,
  tlalocayotlan_default,
  gojeon_default,
  oakhaven_default,
  inuvak_default,
  icebound_default,
  onishiman_default,
  kadjimaran_default,
  nimrudan_default,
  kintei_default,
  republic_default,
  sultanate_default
];
var PERSONALITIES = Object.fromEntries(
  all2.map((p) => [p.factionId, p])
);
function listAuthoredPersonalities() {
  return all2.map((p) => ({
    factionId: p.factionId,
    leaderName: p.leaderName,
    title: p.title
  }));
}

// src/components/game/diplomacy/RelationsView.jsx
import { jsx, jsxs } from "react/jsx-runtime";
function RelationsView({ gameState, playerFactionId }) {
  if (!playerFactionId) return null;
  const turn = gameState?.turn || 0;
  const dip = gameState?.diplomacy || {};
  const others = listAuthoredPersonalities().filter(
    (p) => p.factionId !== playerFactionId
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        padding: 14,
        background: "linear-gradient(180deg, hsl(35,22%,12%), hsl(35,18%,9%))",
        height: "100%",
        overflowY: "auto"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              fontFamily: "'Cinzel',serif",
              letterSpacing: 3,
              fontSize: 11,
              color: "#d4a853",
              marginBottom: 6
            },
            children: "RELATIONS LEDGER"
          }
        ),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, opacity: 0.55, marginBottom: 14 }, children: "Where your house stands with every rival court." }),
        others.length === 0 ? /* @__PURE__ */ jsx("div", { style: { opacity: 0.5, fontStyle: "italic", fontSize: 12 }, children: "There are no other named houses yet." }) : others.map((p) => /* @__PURE__ */ jsx(
          FactionRow,
          {
            personality: p,
            playerFactionId,
            dip,
            turn
          },
          p.factionId
        )),
        /* @__PURE__ */ jsx(
          RecentDecisions,
          {
            offerLog: dip.offerLog || [],
            playerFactionId
          }
        )
      ]
    }
  );
}
function RecentDecisions({ offerLog, playerFactionId }) {
  const relevant = offerLog.filter(
    (o) => o.proposer === playerFactionId || o.target === playerFactionId
  ).slice(-6).reverse();
  if (relevant.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { style: { marginTop: 20 }, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          fontFamily: "'Cinzel',serif",
          fontSize: 10,
          letterSpacing: 2,
          opacity: 0.5,
          marginBottom: 6
        },
        children: "RECENT DECISIONS"
      }
    ),
    /* @__PURE__ */ jsx(
      "ul",
      {
        style: {
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4
        },
        children: relevant.map((o) => /* @__PURE__ */ jsx(DecisionLine, { offer: o, playerFactionId }, o.id))
      }
    )
  ] });
}
function DecisionLine({ offer, playerFactionId }) {
  const asProposer = offer.proposer === playerFactionId;
  const other = asProposer ? offer.target : offer.proposer;
  const otherName = listAuthoredPersonalities().find((p) => p.factionId === other)?.leaderName || other;
  const label = String(offer.type || "").replace(/_/g, " ").toLowerCase();
  const accepted = offer.status === "accepted";
  const color = accepted ? "#9ec27a" : "#c95b5b";
  const verb = accepted ? "accepted" : "refused";
  const phrase = asProposer ? `${otherName} ${verb} your ${label}` : `You ${verb} ${otherName}'s ${label}`;
  return /* @__PURE__ */ jsxs(
    "li",
    {
      style: {
        fontFamily: "'Crimson Text', serif",
        fontSize: 12,
        color: "#c8c0b0",
        borderLeft: `2px solid ${color}88`,
        paddingLeft: 8
      },
      children: [
        /* @__PURE__ */ jsxs(
          "span",
          {
            style: {
              fontFamily: "'Cinzel',serif",
              fontSize: 9,
              letterSpacing: 1.5,
              color,
              marginRight: 6
            },
            children: [
              "TURN ",
              offer.resolvedTurn ?? "?"
            ]
          }
        ),
        phrase,
        "."
      ]
    }
  );
}
function FactionRow({ personality, playerFactionId, dip, turn }) {
  const otherId = personality.factionId;
  const mineToThem = getSentiment({ diplomacy: dip }, playerFactionId, otherId);
  const theirsToMe = getSentiment({ diplomacy: dip }, otherId, playerFactionId);
  const relation = getRelation(
    { diplomacy: dip },
    playerFactionId,
    otherId
  );
  const accent = relationColor(relation);
  const bindings = collectBindings(dip, playerFactionId, otherId, turn);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        border: `1px solid ${accent}55`,
        borderRadius: 8,
        padding: 12,
        background: "linear-gradient(160deg, hsl(35,22%,13%), hsl(35,18%,9%))",
        marginBottom: 10
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8
            },
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      fontFamily: "'Cinzel',serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: accent
                    },
                    children: personality.leaderName
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      fontSize: 10,
                      letterSpacing: 1.5,
                      opacity: 0.55,
                      fontFamily: "'Cinzel',serif",
                      textTransform: "uppercase"
                    },
                    children: personality.title
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    fontSize: 9,
                    padding: "2px 8px",
                    border: `1px solid ${accent}55`,
                    borderRadius: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: accent
                  },
                  children: prettyRelation(relation)
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              gap: 12,
              marginBottom: bindings.length ? 10 : 0,
              fontFamily: "'Crimson Text', serif",
              fontSize: 12
            },
            children: [
              /* @__PURE__ */ jsx(Sentiment, { label: "Your view", value: mineToThem }),
              /* @__PURE__ */ jsx(Sentiment, { label: "Their view", value: theirsToMe })
            ]
          }
        ),
        bindings.length > 0 && /* @__PURE__ */ jsx(
          "ul",
          {
            style: {
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 4
            },
            children: bindings.map((b, i) => /* @__PURE__ */ jsxs(
              "li",
              {
                style: {
                  fontFamily: "'Crimson Text', serif",
                  fontSize: 12,
                  color: "#c8c0b0",
                  borderLeft: `2px solid ${b.color || accent}88`,
                  paddingLeft: 8
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: 1.5,
                        color: b.color || accent,
                        marginRight: 6
                      },
                      children: b.label
                    }
                  ),
                  b.text
                ]
              },
              i
            ))
          }
        )
      ]
    }
  );
}
function Sentiment({ label, value }) {
  const v = clamp3(value ?? 0, -100, 100);
  const pct = Math.abs(v);
  const positive = v >= 0;
  const color = positive ? "#9ec27a" : "#c95b5b";
  return /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          fontSize: 9,
          letterSpacing: 1.5,
          opacity: 0.6,
          fontFamily: "'Cinzel',serif",
          textTransform: "uppercase",
          marginBottom: 3
        },
        children: [
          label,
          " \xB7 ",
          v > 0 ? "+" : "",
          v
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          height: 5,
          background: "hsl(35,10%,18%)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative"
        },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                position: "absolute",
                top: 0,
                bottom: 0,
                left: positive ? "50%" : `${50 - pct / 2}%`,
                width: `${pct / 2}%`,
                background: color
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 1,
                background: "hsl(35,18%,28%)"
              }
            }
          )
        ]
      }
    )
  ] });
}
function collectBindings(dip, me, them, turn) {
  const out = [];
  const involves = (a, b) => a === me && b === them || a === them && b === me;
  const alive = (o) => !o?.expiresOnTurn || o.expiresOnTurn > turn;
  for (const w of dip.wars || []) {
    if (involves(w.attacker, w.defender)) {
      const aggressor = w.attacker === me ? "You" : personalityNameOr(w.attacker);
      const victim = w.defender === me ? "you" : personalityNameOr(w.defender);
      out.push({
        label: "WAR",
        color: "#c95b5b",
        text: `${aggressor} declared on ${victim} \u2014 "${w.casusBelli}" (turn ${w.declaredTurn}).`
      });
    }
  }
  for (const p of dip.pacts || []) {
    if (involves(p.a, p.b) && alive(p)) {
      out.push({
        label: (p.kind || "pact").toUpperCase().replace(/_/g, " "),
        color: "#9ec27a",
        text: `In force until turn ${p.expiresOnTurn ?? "\u2014"}.`
      });
    }
  }
  for (const o of dip.oaths || []) {
    if (involves(o.a, o.b) && !o.broken && alive(o)) {
      out.push({
        label: "OATH",
        color: "#b990d6",
        text: `"${o.clause}" \u2014 held until turn ${o.expiresOnTurn ?? "\u2014"}.`
      });
    }
  }
  for (const d of dip.disputes || []) {
    if (involves(d.claimant, d.holder)) {
      const who = d.claimant === me ? "You claim" : `${personalityNameOr(d.claimant)} claims`;
      out.push({
        label: "DISPUTE",
        color: "#d4a853",
        text: `${who} hex ${d.hexId}: ${d.grounds}.`
      });
    }
  }
  for (const w of dip.wards || []) {
    if (involves(w.host, w.origin) && alive(w)) {
      const direction = w.host === me ? `Your guest` : `Their guest`;
      out.push({
        label: "WARD",
        color: "#8fa8b5",
        text: `${direction}: ${w.name} (until turn ${w.expiresOnTurn ?? "\u2014"}).`
      });
    }
  }
  for (const z of dip.dmz || []) {
    if (involves(z.a, z.b)) {
      const n = Array.isArray(z.hexIds) ? z.hexIds.length : 0;
      out.push({
        label: "DMZ",
        color: "#8fa8b5",
        text: `${n} hex${n === 1 ? "" : "es"} demilitarized since turn ${z.sinceTurn}.`
      });
    }
  }
  for (const m of dip.marriages || []) {
    if (involves(m.a, m.b)) {
      out.push({
        label: "MARRIAGE",
        color: "#d6a8c7",
        text: `Houses joined on turn ${m.turn}${m.heirClaim ? ` \u2014 heir claim: ${m.heirClaim}` : ""}.`
      });
    }
  }
  for (const r of dip.tradeRoutes || []) {
    if (involves(r.a, r.b) && alive(r)) {
      const suspended = r.suspendedUntilTurn && r.suspendedUntilTurn > turn;
      out.push({
        label: "TRADE",
        color: suspended ? "#8a7a4a" : "#d4a853",
        text: suspended ? `Route blockaded until turn ${r.suspendedUntilTurn}.` : `Route yielding ${bagStr(r.yieldPerTurn)}/turn until ${r.expiresOnTurn ?? "\u2014"}.`
      });
    }
  }
  for (const e of dip.embargoes || []) {
    if (e.from === me && e.against === them || e.from === them && e.against === me) {
      const direction = e.from === me ? "You embargo them" : "They embargo you";
      out.push({
        label: "EMBARGO",
        color: "#c95b5b",
        text: `${direction} (since turn ${e.sinceTurn}).`
      });
    }
  }
  return out;
}
function personalityNameOr(id) {
  try {
    const match = listAuthoredPersonalities().find((p) => p.factionId === id);
    return match?.leaderName || id;
  } catch {
    return id;
  }
}
function prettyRelation(relation) {
  return String(relation || "neutral").replace(/_/g, " ");
}
function relationColor(relation) {
  switch (relation) {
    case "war":
      return "#c95b5b";
    case "vassal":
    case "overlord":
      return "#b48a4a";
    case "non_aggression":
    case "peace":
      return "#9ec27a";
    case "ally":
      return "#6fbf9a";
    default:
      return "#8fa8b5";
  }
}
function clamp3(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function bagStr(bag) {
  if (!bag) return "nothing";
  const parts = Object.entries(bag).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`);
  return parts.length ? parts.join(", ") : "nothing";
}
export {
  RelationsView as default
};
