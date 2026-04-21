// Inbox helpers — thin facade over state.diplomacy.events so the UI
// doesn't need to know the storage shape.

// How far back in turns we keep terminal-state events and resolved
// offers before pruning them. Active-state ('unread', 'read') entries
// are always kept regardless of age.
export const INBOX_HISTORY_TURNS = 8;

export function getInbox(state) {
  return (state?.diplomacy?.events || []).slice();
}

export function getUnreadCount(state) {
  return getInbox(state).filter((e) => e.status === 'unread').length;
}

export function markRead(state, eventId) {
  const next = structuredClone(state);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.events = (next.diplomacy.events || []).map((e) =>
    e.id === eventId && e.status === 'unread' ? { ...e, status: 'read' } : e,
  );
  return next;
}

export function appendEvents(state, events) {
  if (!events?.length) return state;
  const next = structuredClone(state);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.events = [...(next.diplomacy.events || []), ...events];
  return next;
}

export function sortedForDisplay(events) {
  const order = { unread: 0, read: 1, resolved: 2, expired: 3 };
  return events
    .slice()
    .sort(
      (a, b) =>
        (order[a.status] ?? 9) - (order[b.status] ?? 9) || b.turn - a.turn,
    );
}

/**
 * Drop terminal-state events (resolved, expired) older than
 * INBOX_HISTORY_TURNS turns and offerLog entries older than the same
 * window. Preserves everything active (unread, read) and everything
 * recent regardless of status.
 *
 * Called from onTurnStart so the inbox can't grow unboundedly across a
 * long game. Separate from expireEventsAtTurn, which only *marks*
 * events — this function actually removes them.
 */
export function pruneInboxHistory(state, currentTurn) {
  const cutoff = currentTurn - INBOX_HISTORY_TURNS;
  const next = structuredClone(state);
  next.diplomacy = next.diplomacy || {};

  const events = next.diplomacy.events || [];
  next.diplomacy.events = events.filter((e) => {
    const terminal = e.status === 'resolved' || e.status === 'expired';
    if (!terminal) return true;
    // An event with no turn stamp is kept by default — without a turn
    // we can't decide its age. (Should never happen in practice.)
    if (e.turn == null) return true;
    return e.turn > cutoff;
  });

  const log = next.diplomacy.offerLog || [];
  next.diplomacy.offerLog = log.filter((o) => {
    const t = o.resolvedTurn ?? o.turn;
    if (t == null) return true;
    return t > cutoff;
  });

  return next;
}
