var __defProp = Object.defineProperty;
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};

// src/components/game/diplomacy/ConversationView.jsx
import React, { useState, useRef, useEffect } from "react";

// src/api/base44Client.js
import { createClient } from "@base44/sdk";

// src/lib/app-params.js
var isNode = typeof window === "undefined";
var windowObj = isNode ? { localStorage: /* @__PURE__ */ new Map() } : window;
var storage = windowObj.localStorage;
var toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};
var getAppParamValue = (paramName, { defaultValue = void 0, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  return null;
};
var getAppParams = () => {
  if (getAppParamValue("clear_access_token") === "true") {
    storage.removeItem("base44_access_token");
    storage.removeItem("token");
  }
  return {
    appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
    functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
    appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL })
  };
};
var appParams = {
  ...getAppParams()
};

// src/api/base44Client.js
var { appId, token, functionsVersion, appBaseUrl } = appParams;
var base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: "",
  requiresAuth: false,
  appBaseUrl
});

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
function getActionDescriptor(type) {
  return ACTION_REGISTRY[type] || null;
}
var REGISTERED_ACTION_TYPES = Object.keys(ACTION_REGISTRY).sort();
function buildLlmToolSpec() {
  return REGISTERED_ACTION_TYPES.map((t) => {
    const d = ACTION_REGISTRY[t];
    return {
      type: t,
      category: d.category,
      hint: d.llmHint,
      payloadSchema: d.schema
    };
  });
}

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
function getPersonality(factionId) {
  return PERSONALITIES[factionId] || null;
}

// src/lib/diplomacy/promptBuilder.js
function buildConversationPrompt({
  gameState,
  speakerFactionId,
  playerFactionId,
  history = [],
  userMessage
}) {
  const personality = getPersonality(speakerFactionId);
  const digest = buildStateDigest(gameState, speakerFactionId, playerFactionId);
  const tools = buildLlmToolSpec();
  const system = [
    roleHeader(personality, speakerFactionId),
    voiceBlock(personality),
    valuesBlock(personality),
    goalsBlock(personality),
    redLinesBlock(personality),
    toolSpecBlock(tools),
    outputContract()
  ].filter(Boolean).join("\n\n");
  const user = [
    "<world_state>",
    digest,
    "</world_state>",
    "",
    "<conversation>",
    ...history.slice(-8).map((m) => `${m.role === "user" ? "PLAYER" : "YOU"}: ${m.text}`),
    `PLAYER: ${userMessage}`,
    "</conversation>",
    "",
    "Respond now. Follow the output contract exactly."
  ].join("\n");
  return { system, user, tools };
}
function roleHeader(personality, speakerId) {
  if (!personality) {
    return `You are the faction leader of "${speakerId}". No authored personality available; be neutral and diplomatic.`;
  }
  return [
    `You are ${personality.leaderName}, ${personality.title}, leader of ${personality.factionId}.`,
    `You are speaking in-character. You are not an AI assistant; you are a ruler.`
  ].join(" ");
}
function voiceBlock(p) {
  if (!p) return null;
  const { voice } = p;
  return [
    "VOICE:",
    `- Register: ${voice.register}`,
    `- Addressing style: ${voice.addressingStyle}`,
    `- You often say things like: ${voice.cadence.map((c) => `"${c}"`).join(", ")}.`,
    `- You would never say: ${voice.forbiddenPhrases.map((c) => `"${c}"`).join(", ")}.`
  ].join("\n");
}
function valuesBlock(p) {
  if (!p) return null;
  const v = p.values;
  const format = (k) => `${k}: ${valueLabel(v[k])}`;
  return [
    "VALUES (each \u22121\u2026+1):",
    ...Object.keys(v).map(format)
  ].join("\n");
}
function valueLabel(n) {
  if (n >= 0.6) return `very high (${n})`;
  if (n >= 0.2) return `high (${n})`;
  if (n >= -0.2) return `moderate (${n})`;
  if (n >= -0.6) return `low (${n})`;
  return `very low (${n})`;
}
function goalsBlock(p) {
  if (!p) return null;
  return ["GOALS (in priority order):", ...p.goals.map((g, i) => `${i + 1}. ${g}`)].join("\n");
}
function redLinesBlock(p) {
  if (!p) return null;
  return [
    "RED LINES (if crossed, you must act as specified):",
    ...p.redLines.map(
      (r) => `- ${r.kind}: ${r.description} \u2192 ${r.onViolation}`
    )
  ].join("\n");
}
function toolSpecBlock(tools) {
  return [
    "AVAILABLE ACTIONS:",
    "When you want to formally propose something that changes the game, include one or more tool calls in your response.",
    'Each tool call MUST use the exact "type" below and fill in the payload shape. The game engine validates every call; malformed calls are ignored.',
    "",
    ...tools.map(
      (t) => `- ${t.type} (${t.category}): ${t.hint} Payload: ${JSON.stringify(t.payloadSchema)}`
    )
  ].join("\n");
}
function outputContract() {
  return [
    "OUTPUT CONTRACT \u2014 FOLLOW EXACTLY:",
    "1. Reply in character with 1\u20133 sentences of dialogue.",
    "2. If (and only if) you want to take formal diplomatic action, append a single JSON block enclosed in ```json ... ``` fences.",
    '3. That JSON must be: { "actions": [ { "type": "ACTION_TYPE", "target": "faction_id", "payload": { ... }, "reason": "short" }, ... ] }.',
    '4. Set "proposer" to your own faction id implicitly \u2014 the engine infers it from you.',
    "5. If you want to say nothing formal, omit the JSON block entirely. Never put empty braces.",
    "6. Never break character. Never mention being an AI, a model, or a language system."
  ].join("\n");
}
function buildStateDigest(state, speakerId, playerId) {
  const turn = state?.turn ?? 0;
  const me = findPlayer(state, speakerId);
  const them = findPlayer(state, playerId);
  const lines = [];
  lines.push(`Turn: ${turn}`);
  lines.push(`Relation with player: ${relationText(state, speakerId, playerId)}`);
  lines.push(`Sentiment toward player: ${sentimentText(state, speakerId, playerId)}`);
  if (me?.resources) {
    lines.push(
      `Your resources: ${summaryBag(me.resources)}`
    );
  }
  if (them?.resources) {
    lines.push(`Player resources: ${summaryBag(them.resources)}`);
  }
  const myHexes = countHexes(state, speakerId);
  const theirHexes = countHexes(state, playerId);
  lines.push(`Territory: you hold ${myHexes} hexes; player holds ${theirHexes}.`);
  const offers = (state.diplomacy?.openOffers || []).filter(
    (o) => o.proposer === speakerId && o.target === playerId || o.proposer === playerId && o.target === speakerId
  );
  if (offers.length) {
    lines.push(`Open offers between you and the player: ${offers.length}.`);
    offers.slice(0, 3).forEach(
      (o) => lines.push(`  \u2022 ${o.type} (from ${o.proposer}): ${JSON.stringify(o.payload).slice(0, 80)}`)
    );
  }
  const wars = (state.diplomacy?.wars || []).filter(
    (w) => w.attacker === speakerId && w.defender === playerId || w.attacker === playerId && w.defender === speakerId
  );
  if (wars.length) lines.push(`At war with the player since turn ${wars[0].declaredTurn}.`);
  const threats = (state.diplomacy?.standingThreats || []).filter(
    (t) => t.from === playerId && t.against === speakerId
  );
  if (threats.length)
    lines.push(`Player has a standing threat against you: "${threats[0].demand}".`);
  return lines.join("\n");
}
function findPlayer(state, factionId) {
  return (state?.players || []).find(
    (p) => p.faction?.id === factionId || p.id === factionId || p.factionId === factionId
  ) || null;
}
function countHexes(state, factionId) {
  const hexes = state?.hexes || {};
  let n = 0;
  for (const h of Object.values(hexes)) if (h?.owner === factionId) n++;
  return n;
}
function summaryBag(r) {
  const parts = [];
  for (const k of ["gold", "wood", "wheat", "iron", "ip", "sp"]) {
    if (r[k] !== void 0) parts.push(`${r[k]}${k[0]}`);
  }
  return parts.join(" ");
}
function relationText(state, a, b) {
  const rel = state?.diplomacy?.relations;
  if (!rel) return "neutral";
  const key = [a, b].sort().join("|");
  return rel[key] || "neutral";
}
function sentimentText(state, fromId, towardId) {
  const key = `${fromId}->${towardId}`;
  const s = state?.diplomacy?.sentiment?.[key] ?? 0;
  if (s > 60) return `warm (${s})`;
  if (s > 20) return `friendly (${s})`;
  if (s > -20) return `neutral (${s})`;
  if (s > -60) return `cool (${s})`;
  return `hostile (${s})`;
}

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
function makeActionId(type) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `act_${type.toLowerCase()}_${Date.now().toString(36)}_${rand}`;
}

// src/lib/diplomacy/dispatcher.js
function dispatch(action, state) {
  if (!action || typeof action !== "object")
    return { ok: false, reason: "no_action" };
  const normalized = normalize(action, state);
  const descriptor = getActionDescriptor(normalized.type);
  if (!descriptor)
    return {
      ok: false,
      reason: `unknown_action_type:${normalized.type}`
    };
  const schemaCheck = checkSchema(normalized.payload, descriptor.schema);
  if (!schemaCheck.ok)
    return { ok: false, reason: `schema:${schemaCheck.reason}` };
  const semanticCheck = descriptor.validate(normalized, state);
  if (!semanticCheck.ok)
    return { ok: false, reason: semanticCheck.reason };
  const nextState = descriptor.apply(normalized, state);
  return { ok: true, action: normalized, nextState };
}
function normalize(raw, state) {
  return {
    id: raw.id || makeActionId(raw.type || "unknown"),
    type: raw.type,
    proposer: raw.proposer || raw.from,
    target: raw.target || raw.to,
    payload: raw.payload || {},
    reason: raw.reason || raw.justification || "",
    preconditions: raw.preconditions || {},
    turn: raw.turn ?? state?.turn ?? 0
  };
}
function checkSchema(payload, schema) {
  if (!schema) return { ok: true };
  for (const [key, spec] of Object.entries(schema)) {
    const optional = spec.endsWith("?");
    const baseSpec = optional ? spec.slice(0, -1) : spec;
    const value = payload?.[key];
    if (value === void 0 || value === null) {
      if (optional) continue;
      return { ok: false, reason: `missing:${key}` };
    }
    const ok = checkOne(value, baseSpec);
    if (!ok) return { ok: false, reason: `invalid:${key}:${baseSpec}` };
  }
  return { ok: true };
}
function checkOne(value, spec) {
  switch (spec) {
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "number>0":
      return typeof value === "number" && Number.isFinite(value) && value > 0;
    case "string":
      return typeof value === "string" && value.length > 0;
    case "string[]":
      return Array.isArray(value) && value.every((v) => typeof v === "string");
    case "ResourceBag":
      if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
      return Object.values(value).every(
        (v) => typeof v === "number" && Number.isFinite(v)
      );
    default:
      return true;
  }
}

// src/lib/diplomacy/api.js
async function sendDiplomacyMessage({
  gameState,
  speakerFactionId,
  playerFactionId,
  history,
  userMessage
}) {
  const prompt = buildConversationPrompt({
    gameState,
    speakerFactionId,
    playerFactionId,
    history,
    userMessage
  });
  const resp = await base44.functions.invoke("generateDiplomacyProposal", {
    system: prompt.system,
    user: prompt.user
  });
  const dialogue = resp?.data?.dialogue || "";
  const rawActions = Array.isArray(resp?.data?.actions) ? resp.data.actions : [];
  let cur = gameState;
  const applied = [];
  const rejected = [];
  for (const a of rawActions) {
    const shaped = { ...a, proposer: speakerFactionId };
    const result = dispatch(shaped, cur);
    if (result.ok) {
      cur = result.nextState;
      applied.push(result.action);
    } else {
      rejected.push({ action: shaped, reason: result.reason });
    }
  }
  return { dialogue, applied, rejected, nextState: cur };
}

// src/components/game/diplomacy/ConversationView.jsx
import { jsx, jsxs } from "react/jsx-runtime";
function ConversationView({
  gameState,
  playerFactionId,
  targetFactionId,
  seedMessages = [],
  onStateChange,
  onClose
}) {
  const personality = getPersonality(targetFactionId);
  const leaderName = personality?.leaderName || targetFactionId;
  const accent = "#d4a853";
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const { dialogue, applied, rejected, nextState } = await sendDiplomacyMessage({
        gameState,
        speakerFactionId: targetFactionId,
        playerFactionId,
        history: messages,
        userMessage: userMsg
      });
      setMessages((m) => [
        ...m,
        { role: "ai", text: dialogue || "\u2026" },
        ...applied.length ? [
          {
            role: "system",
            text: `Actions applied: ${applied.map((a) => a.type).join(", ")}.`
          }
        ] : [],
        ...rejected.length ? [
          {
            role: "system",
            text: `Rejected: ${rejected.map((r) => `${r.action.type} (${r.reason})`).join("; ")}.`
          }
        ] : []
      ]);
      if (applied.length && onStateChange) onStateChange(nextState);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "system", text: "Messenger returned with empty hands." }
      ]);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { background: "rgba(0,0,0,0.75)" },
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            width: "100%",
            maxWidth: 640,
            height: 520,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))",
            border: `2px solid ${accent}88`,
            borderRadius: 14,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  padding: "14px 18px",
                  borderBottom: "1px solid hsl(35,20%,25%)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          fontSize: 10,
                          letterSpacing: 2,
                          opacity: 0.5,
                          fontFamily: "'Cinzel',serif"
                        },
                        children: "DIPLOMACY"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: {
                          fontFamily: "'Cinzel',serif",
                          fontSize: 16,
                          color: accent,
                          fontWeight: 700
                        },
                        children: leaderName
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 11, opacity: 0.5 }, children: personality?.title || "" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: onClose,
                      style: {
                        background: "none",
                        border: "none",
                        color: "#c8c0b0",
                        fontSize: 18,
                        cursor: "pointer",
                        opacity: 0.6
                      },
                      children: "\u2715"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                },
                children: [
                  messages.length === 0 && /* @__PURE__ */ jsx("div", { style: { textAlign: "center", color: "#888", marginTop: 40, fontStyle: "italic" }, children: "Send the first word." }),
                  messages.map((m, i) => /* @__PURE__ */ jsx(MessageBubble, { m, accent }, i)),
                  loading && /* @__PURE__ */ jsxs("div", { style: { fontStyle: "italic", color: "#888" }, children: [
                    leaderName,
                    " considers\u2026"
                  ] }),
                  /* @__PURE__ */ jsx("div", { ref: scrollRef })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "form",
              {
                onSubmit: onSend,
                style: {
                  borderTop: "1px solid hsl(35,20%,25%)",
                  padding: 12,
                  display: "flex",
                  gap: 8
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: input,
                      onChange: (e) => setInput(e.target.value),
                      placeholder: "Speak plainly\u2026",
                      disabled: loading,
                      style: {
                        flex: 1,
                        padding: "10px 12px",
                        background: "hsl(35,22%,18%)",
                        border: "1px solid hsl(35,20%,30%)",
                        borderRadius: 4,
                        color: "#d8cfb8",
                        fontFamily: "'Crimson Text', serif",
                        fontSize: 13
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: loading || !input.trim(),
                      style: {
                        padding: "8px 16px",
                        background: loading ? "hsl(35,20%,22%)" : "hsl(38,80%,38%)",
                        border: "1px solid hsl(38,80%,55%)",
                        borderRadius: 4,
                        color: "#fff3c0",
                        fontFamily: "'Cinzel',serif",
                        fontSize: 12,
                        cursor: loading ? "not-allowed" : "pointer"
                      },
                      children: "Send"
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    }
  );
}
function MessageBubble({ m, accent }) {
  if (m.role === "system") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          alignSelf: "center",
          fontSize: 11,
          color: "#8c8572",
          fontStyle: "italic"
        },
        children: m.text
      }
    );
  }
  const isUser = m.role === "user";
  return /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }, children: /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        maxWidth: "78%",
        padding: "10px 14px",
        borderRadius: 8,
        background: isUser ? "#1a1a2e" : "#0f2a1f",
        border: `1px solid ${isUser ? "#d4a853" : accent}66`,
        color: "#c8c0b0",
        fontFamily: "'Crimson Text', serif",
        fontSize: 13,
        lineHeight: 1.5
      },
      children: m.text
    }
  ) });
}
export {
  ConversationView as default
};
