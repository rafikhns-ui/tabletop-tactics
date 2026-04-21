// Pure reconciler used by Inbox's useEffect to keep its per-event
// error map in sync with the current inbox.
//
// Lives in its own module because Inbox.jsx pulls in React, the entire
// diplomacy barrel, and sibling UI components — none of which need to
// be in scope to reason about or unit-test this function.

/**
 * Drop any keys from `prev` whose event id is no longer present in
 * `liveIds`. Returns `prev` unchanged (same identity) when nothing is
 * stale — critical so React bails out of the effect-triggered
 * re-render loop that would otherwise fire on every `events` identity
 * change from getInbox().
 *
 * @param {Record<string, string>} prev   previous errors map
 * @param {Set<string>}            liveIds current live event ids
 * @returns {Record<string, string>}
 */
export function reconcileEventErrors(prev, liveIds) {
  const keys = Object.keys(prev);
  if (keys.length === 0) return prev;
  let changed = false;
  /** @type {Record<string, string>} */
  const next = {};
  for (const k of keys) {
    if (liveIds.has(k)) next[k] = prev[k];
    else changed = true;
  }
  return changed ? next : prev;
}
