// Dispatcher — the only path through which LLM-proposed actions
// touch game state. Validates payloads against the schema, runs
// the action's own validate(), and finally applies it.
//
// The single most important invariant in the diplomacy system:
//   The LLM never writes to game state. It only proposes ActionDefs.
//   Everything goes through dispatch().

import { getActionDescriptor, REGISTERED_ACTION_TYPES } from './actions';
import { factionById } from './actions/_helpers';
import { makeActionId } from './schema';

/** @typedef {import('./schema').ActionDef} ActionDef */

/**
 * @param {ActionDef} action
 * @param {Object} state
 * @returns {{ ok: boolean, reason?: string, action?: ActionDef, nextState?: Object }}
 */
export function dispatch(action, state) {
  if (!action || typeof action !== 'object')
    return { ok: false, reason: 'no_action' };

  // Normalize basic shape.
  const normalized = normalize(action, state);

  // Every action in the 41-action registry is proposed by a real faction.
  // Without a proposer there's no agent whose resources or sentiment can
  // move, and `apply()` routines would dereference null (crash) or write a
  // phantom id into durable state (silent corruption).
  if (!normalized.proposer)
    return { ok: false, reason: 'no_proposer' };

  // Hallucinated faction ids are the LLM's most common corruption mode.
  // Roughly 20 of the 41 action `apply()` routines write `action.proposer`
  // or `action.target` into long-lived state (hex.owner, tradeRoutes,
  // pacts, wars, dmz, embargoes, marriages, heirRecognitions, wards,
  // recognizedClaims, disputes, militaryAccess, etc.). A phantom faction id
  // is never returned by any `factionById()` query, so no real faction's
  // turn logic ever touches the orphan record; it leaks permanently.
  //
  // Per-action guards in trade.js / territory.js (#50, #80) only covered a
  // subset. Lift the check here — same spirit as the self_target guard
  // below ("Catch all of them here so every action descriptor doesn't need
  // its own duplicated guard"). UI at EventCard.describeEventError already
  // has a user-facing string for unknown_proposer / unknown_target.
  if (!factionById(state, normalized.proposer))
    return { ok: false, reason: 'unknown_proposer' };

  // Target is action-optional: SETTLE_COLONY allows target-less settlement
  // and MILITARY_REPOSITION uses `payload.toward` instead of target for its
  // primary semantics. Only reject when a target is actually asserted.
  if (normalized.target && !factionById(state, normalized.target))
    return { ok: false, reason: 'unknown_target' };

  // Self-target guard: every action in the 41-action registry is between
  // two distinct parties. An LLM that confuses its own identity with the
  // target's can generate red→red proposals that don't crash but produce
  // nonsense state (wars with self, trades that move gold to and from the
  // same purse, NAPs with self, etc.). Catch all of them here so every
  // action descriptor doesn't need its own duplicated guard.
  if (
    normalized.proposer &&
    normalized.target &&
    normalized.proposer === normalized.target
  ) {
    return { ok: false, reason: 'self_target' };
  }

  const descriptor = getActionDescriptor(normalized.type);
  if (!descriptor)
    return {
      ok: false,
      reason: `unknown_action_type:${normalized.type}`,
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

/**
 * Dispatch many actions atomically. If any fails, returns the
 * error and does NOT mutate state. The dispatcher is conservative
 * by design — partial application would create hard-to-debug states.
 */
export function dispatchAll(actions, state) {
  let cur = state;
  const applied = [];
  for (const a of actions) {
    const result = dispatch(a, cur);
    if (!result.ok) {
      return { ok: false, reason: result.reason, failedOn: a, applied };
    }
    cur = result.nextState;
    applied.push(result.action);
  }
  return { ok: true, applied, nextState: cur };
}

/** Coerce LLM output into a well-formed ActionDef. */
function normalize(raw, state) {
  return {
    id: raw.id || makeActionId(raw.type || 'unknown'),
    type: raw.type,
    proposer: raw.proposer || raw.from,
    target: raw.target || raw.to,
    payload: raw.payload || {},
    reason: raw.reason || raw.justification || '',
    preconditions: raw.preconditions || {},
    turn: raw.turn ?? state?.turn ?? 0,
  };
}

/**
 * Lightweight schema checker. Each entry's value is a string spec:
 *   "number"        — any number
 *   "number>0"      — positive number
 *   "string"        — non-empty string
 *   "string?"       — optional string
 *   "string[]"      — array of strings
 *   "ResourceBag"   — object of resource → number
 *   "ResourceBag?"  — optional resource bag
 */
function checkSchema(payload, schema) {
  if (!schema) return { ok: true };
  for (const [key, spec] of Object.entries(schema)) {
    const optional = spec.endsWith('?');
    const baseSpec = optional ? spec.slice(0, -1) : spec;
    const value = payload?.[key];
    if (value === undefined || value === null) {
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
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'number>0':
      return typeof value === 'number' && Number.isFinite(value) && value > 0;
    case 'string':
      return typeof value === 'string' && value.length > 0;
    case 'string[]':
      return Array.isArray(value) && value.every((v) => typeof v === 'string');
    case 'ResourceBag':
      if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
      // Reject NaN and Infinity just like the plain 'number' spec does —
      // silently passing those through caused hasResources() to compute
      // nonsense comparisons downstream.
      //
      // Also reject negatives: hasResources() treats negative 'needs' as
      // vacuously satisfied (`if (need <= 0) continue`), so a negative
      // entry slips past validate; then deductResources(p, { gold: -5 })
      // is arithmetic and *adds* 5 gold. Combined with addResources on
      // the counterparty, any LLM that returns negative payload entries
      // can mint resources on a PROPOSE_RESOURCE_TRADE, EXTORT_TRIBUTE,
      // DEMAND_VASSALAGE, or PROPOSE_PEACE reparations. Zero is fine —
      // it's treated as no-op by every helper.
      return Object.values(value).every(
        (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
      );
    default:
      return true; // unknown specs pass — the action's validate() can re-check.
  }
}

/** Public introspection for the prompt builder. */
export function knownActionTypes() {
  return REGISTERED_ACTION_TYPES.slice();
}
