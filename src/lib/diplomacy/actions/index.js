// Action registry — single source of truth.
//
// Every ActionDef the LLM is allowed to propose must be registered here.
// The dispatcher looks actions up by `type`, validates, then applies.

import * as trade from './trade';
import * as territory from './territory';
import * as military from './military';
import * as coercion from './coercion';
import * as influence from './influence';
import * as intelligence from './intelligence';
import * as spiritual from './spiritual';
import * as dynastic from './dynastic';

const all = [
  ...Object.values(trade),
  ...Object.values(territory),
  ...Object.values(military),
  ...Object.values(coercion),
  ...Object.values(influence),
  ...Object.values(intelligence),
  ...Object.values(spiritual),
  ...Object.values(dynastic),
].filter((a) => a && typeof a === 'object' && a.type);

/** type → action descriptor */
export const ACTION_REGISTRY = Object.fromEntries(
  all.map((a) => [a.type, a]),
);

/** Returns the descriptor for a given action type, or null. */
export function getActionDescriptor(type) {
  return ACTION_REGISTRY[type] || null;
}

/** All registered action types, alphabetized for stable prompts. */
export const REGISTERED_ACTION_TYPES = Object.keys(ACTION_REGISTRY).sort();

/**
 * Category → sorted action types, derived from ACTION_REGISTRY so it
 * stays in sync automatically. Previously hand-maintained in schema.js
 * where it drifted by 21 types; this derivation replaces it.
 *
 * @type {Record<string, string[]>}
 */
export const ACTION_CATEGORIES = (() => {
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const a of all) {
    if (!a.category) continue;
    (out[a.category] ||= []).push(a.type);
  }
  for (const cat of Object.keys(out)) out[cat].sort();
  return Object.freeze(out);
})();

/**
 * Returns the action vocabulary in the shape the LLM tool spec expects.
 * Keeps prompt construction declarative and centralized.
 */
export function buildLlmToolSpec() {
  return REGISTERED_ACTION_TYPES.map((t) => {
    const d = ACTION_REGISTRY[t];
    return {
      type: t,
      category: d.category,
      hint: d.llmHint,
      payloadSchema: d.schema,
    };
  });
}
