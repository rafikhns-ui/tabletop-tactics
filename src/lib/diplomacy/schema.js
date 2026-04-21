// ══════════════════════════════════════════════════════
// Rulers of Ardonia — Diplomacy Schema
// ══════════════════════════════════════════════════════
//
// Core type definitions for the LLM-driven diplomacy system.
// The LLM never writes to game state — it only proposes ActionDef
// instances, which the dispatcher validates and applies.
//
// All types are documented via JSDoc so editors give intellisense
// without requiring TypeScript.

/**
 * @typedef {Object} ResourceBag
 * @property {number} [gold]
 * @property {number} [wood]
 * @property {number} [wheat]
 * @property {number} [iron]
 * @property {number} [ip]   Influence Points
 * @property {number} [sp]   Spiritual Points
 */

/**
 * An ActionDef is the structured output the LLM produces. It is
 * never applied directly — the dispatcher validates it against
 * the current game state before mutating anything.
 *
 * @typedef {Object} ActionDef
 * @property {string} id                  Unique action id (uuid-ish)
 * @property {ActionType} type            A type registered in ACTION_REGISTRY
 * @property {string} proposer            Faction id proposing the action
 * @property {string} target              Faction id the action is directed at
 * @property {Object} payload             Action-specific data
 * @property {string} [reason]            Short LLM-authored rationale (shown to user)
 * @property {Object} [preconditions]     Optional runtime guard (e.g. "peace_required")
 * @property {number} [turn]              Turn the action was proposed on
 */

/**
 * The full set of action types the dispatcher can apply. Keep this
 * alphabetized — the authoritative list is `REGISTERED_ACTION_TYPES`
 * in `./actions`, which derives from ACTION_REGISTRY; this union must
 * be kept in sync with it by hand because JSDoc can't pull literal
 * unions from runtime values.
 *
 * @typedef {"ACCUSE_OF_BETRAYAL" | "ACKNOWLEDGE_HEIR" | "ADOPT_HOSTAGE"
 *   | "ARRANGE_MARRIAGE" | "BLOCKADE" | "BRIBE_COURTIER"
 *   | "CARAVAN_CONTRACT" | "CEDE_HEX" | "CLAIM_HEX_DISPUTE"
 *   | "CONFISCATE_CARAVAN" | "CONSECRATE_HEX" | "COURT_FAVOR"
 *   | "CULTURAL_EXCHANGE" | "CURSE_FACTION" | "DECLARE_WAR"
 *   | "DEMAND_HOSTAGES" | "DEMAND_INTEL" | "DEMAND_VASSALAGE"
 *   | "DEMILITARIZE_ZONE" | "EMBARGO" | "EXTORT_TRIBUTE"
 *   | "GRANT_MILITARY_ACCESS" | "GRANT_RIGHT_OF_PASSAGE"
 *   | "GRANT_TRADE_RIGHTS" | "JOINT_STRIKE" | "MILITARY_REPOSITION"
 *   | "NON_AGGRESSION_PACT" | "OFFER_GOLD_TRIBUTE" | "PLANT_SPY"
 *   | "PRAISE_PUBLICLY" | "PROPOSE_PEACE" | "PROPOSE_RESOURCE_TRADE"
 *   | "RECOGNIZE_CLAIM" | "SEND_PILGRIMAGE" | "SETTLE_COLONY"
 *   | "SHARE_INTEL" | "SPONSOR_FACTION_AT_COURT" | "SPREAD_PROPAGANDA"
 *   | "SWEAR_OATH_BY_SKY" | "THREATEN_INVASION"
 *   | "ULTIMATUM_WITH_DEADLINE"} ActionType
 */

/**
 * @typedef {"trade" | "territory" | "military" | "coercion"
 *   | "influence" | "intelligence" | "spiritual" | "dynastic"} ActionCategory
 */

/**
 * @typedef {Object} PersonalitySpec
 * @property {string} factionId
 * @property {string} leaderName
 * @property {string} title
 * @property {{aggression:number, greed:number, honor:number, piety:number, pragmatism:number, xenophobia:number}} values  Each -1 to 1
 * @property {string[]} goals                   Ordered by priority
 * @property {RedLine[]} redLines               Violations end diplomacy
 * @property {VoiceSpec} voice
 * @property {TemperamentSpec} temperament
 */

/**
 * @typedef {Object} RedLine
 * @property {string} kind                  e.g. "territory_demand", "religious_insult"
 * @property {string} description
 * @property {"refuse" | "declare_war" | "sever_relations"} onViolation
 */

/**
 * @typedef {Object} VoiceSpec
 * @property {string} register              "formal" | "plain" | "martial" | "poetic"
 * @property {string[]} cadence             Short phrases / verbal tics
 * @property {string} addressingStyle       How they refer to the player
 * @property {string[]} forbiddenPhrases    Phrases the character would never say
 */

/**
 * @typedef {Object} TemperamentSpec
 * @property {number} patience              0–1, how quickly they lose interest
 * @property {number} verbosity             0–1, long-winded vs terse
 * @property {number} volatility            0–1, how sharply tone shifts with sentiment
 */

/**
 * @typedef {Object} DiplomaticEvent
 * @property {string} id
 * @property {EventKind} kind
 * @property {string} fromFactionId
 * @property {string} toFactionId            Usually the human player
 * @property {string} headline               One-line summary shown in inbox
 * @property {string} body                   Flavor paragraph, LLM-authored
 * @property {ActionDef[]} proposals         Options attached to the event
 * @property {number} turn
 * @property {"unread" | "read" | "resolved" | "expired"} status
 * @property {number} [expiresOnTurn]
 */

/**
 * The set of event kinds that triggers can emit. Must stay in sync with
 * the detectors in `./events/triggers.js` and the headline mapping in
 * `./events/lifecycle.js`. "rumor_overheard" was in an earlier draft but
 * no detector ever produced it; removed to avoid dead-switch-case drift.
 *
 * @typedef {"patience_broken" | "omen_witnessed" | "border_incident"
 *   | "succession_rumor" | "trade_disruption" | "warmth_offered"
 *   | "war_fatigue"} EventKind
 */

// Note: the category-to-type reverse map and the flat type list used
// to live here, but they drifted from the action registry by 21 types.
// The authoritative lists now live in `./actions`:
//   - REGISTERED_ACTION_TYPES (flat, sorted)
//   - ACTION_CATEGORIES       (category → sorted types, derived)
// Both are derived from ACTION_REGISTRY so they can't drift again.

/**
 * Stable action id generator. We don't import uuid here because
 * we want the lib to be dependency-free; a collision-resistant-enough
 * scheme for turn-scoped actions is sufficient.
 */
export function makeActionId(type) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `act_${type.toLowerCase()}_${Date.now().toString(36)}_${rand}`;
}

export function makeEventId(kind) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `evt_${kind}_${Date.now().toString(36)}_${rand}`;
}
