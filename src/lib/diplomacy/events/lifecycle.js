// Event lifecycle — wraps triggers → candidate actions → LLM-authored
// narrative → inbox entry → player resolution.
//
// The LLM is called at the "commission" step to write the body paragraph
// and pick which candidate actions to endorse. The engine validates the
// endorsement list and drops anything the dispatcher would reject.

import { detectNextEventForFaction } from './triggers';
import { buildEventCommissionPrompt } from '../promptBuilder';
import { dispatch } from '../dispatcher';
import { makeEventId } from '../schema';

/** @typedef {import('../schema').DiplomaticEvent} DiplomaticEvent */
/** @typedef {import('../schema').ActionDef} ActionDef */
/** @typedef {import('../schema').EventKind} EventKind */

/**
 * One-shot per-turn pass. Runs detectors for every AI faction against
 * the human player; commissions at most `maxEvents` events per turn.
 *
 * Requires an async LLM callback: llmFn({ system, user }) → Promise<string>
 *
 * @returns {Promise<DiplomaticEvent[]>}
 */
export async function runTurnEventPass({
  gameState,
  playerFactionId,
  llmFn,
  maxEvents = 2,
}) {
  /** @type {DiplomaticEvent[]} */
  const out = [];
  const aiFactionIds = (gameState.players || [])
    .filter((p) => (p.faction?.id || p.id || p.factionId) !== playerFactionId)
    .map((p) => p.faction?.id || p.id || p.factionId);

  // Shuffle so we don't always process the same faction first.
  const order = shuffle(aiFactionIds);

  for (const speakerId of order) {
    if (out.length >= maxEvents) break;

    const trigger = detectNextEventForFaction(gameState, speakerId, playerFactionId);
    if (!trigger) continue;

    // Validate the candidate actions against current state; drop invalid.
    // Candidate actions come from deterministic triggers — they're already
    // ActionDef-shaped, but triggers.js isn't typed, so we assert here.
    const validProposals = trigger.candidateActions.filter((a) => {
      const check = dispatch(/** @type {ActionDef} */ (a), gameState);
      // We don't apply — dispatch returns a new state but we discard it.
      return check.ok;
    });
    if (validProposals.length === 0) continue;

    let headline = defaultHeadlineFor(trigger);
    let body = trigger.summary;
    let endorsedIds = validProposals.map((p) => p.id);

    try {
      const prompt = buildEventCommissionPrompt({
        gameState,
        speakerFactionId: speakerId,
        playerFactionId,
        triggerSummary: trigger.summary,
        proposals: validProposals,
      });
      const raw = await llmFn(prompt);
      const parsed = parseCommissionResponse(raw);
      if (parsed.headline) headline = parsed.headline;
      if (parsed.body) body = parsed.body;
      if (parsed.endorsedIds?.length) {
        endorsedIds = parsed.endorsedIds.filter((id) =>
          validProposals.some((p) => p.id === id),
        );
        if (endorsedIds.length === 0) endorsedIds = validProposals.map((p) => p.id);
      }
    } catch {
      // LLM failure is not fatal — event still fires with the fallback body.
    }

    const proposals = /** @type {ActionDef[]} */ (
      validProposals.filter((p) => endorsedIds.includes(p.id))
    );

    /** @type {DiplomaticEvent} */
    const event = {
      id: makeEventId(trigger.kind),
      kind: /** @type {EventKind} */ (trigger.kind),
      fromFactionId: trigger.fromFactionId,
      toFactionId: trigger.toFactionId,
      headline,
      body,
      proposals,
      turn: gameState.turn || 0,
      status: 'unread',
      expiresOnTurn: (gameState.turn || 0) + 4,
    };
    out.push(event);
  }

  return out;
}

/**
 * Resolve a player choice on an event: dispatch the chosen ActionDef,
 * mark the event resolved, return the new game state.
 *
 * On success:  { ok: true, nextState, resolvedEvent }
 * On failure:  { ok: false, reason }
 *
 * Expressed as a single shape with optional fields rather than a
 * discriminated union because TS's JSDoc narrowing is inconsistent on
 * unions — callers check `ok` and read the rest.
 *
 * @returns {{ ok: boolean, nextState?: Object, resolvedEvent?: DiplomaticEvent, reason?: string }}
 */
export function resolveEventChoice({ gameState, event, chosenActionId }) {
  // Defense in depth: if the UI hands us a stale snapshot (event status
  // 'resolved' / 'expired'), the engine must refuse to re-apply. The
  // UI already hides buttons for these statuses, but a race window
  // exists between expireEventsAtTurn flipping status at onTurnStart
  // and the React render that consumes the new state.
  if (event.status !== 'unread' && event.status !== 'read')
    return { ok: false, reason: 'event_not_actionable' };

  const proposal = event.proposals.find((p) => p.id === chosenActionId);
  if (!proposal) return { ok: false, reason: 'proposal_not_found' };

  const result = dispatch(proposal, gameState);
  if (!result.ok) return { ok: false, reason: result.reason };

  // Update event list in the state if present.
  const nextState = structuredClone(result.nextState);
  nextState.diplomacy = nextState.diplomacy || {};
  nextState.diplomacy.events = (nextState.diplomacy.events || []).map((e) =>
    e.id === event.id ? { ...e, status: 'resolved' } : e,
  );
  return {
    ok: true,
    nextState,
    resolvedEvent: { ...event, status: 'resolved' },
  };
}

/** Expire stale events at turn start.
 *
 * Both 'unread' and 'read' events expire once turn > expiresOnTurn —
 * opening an event (markRead) shouldn't grant the player an indefinite
 * window to act on it. EventCard.jsx shows action buttons for both
 * 'unread' and 'read' statuses, so without this both-status expiry a
 * stale event keeps its "still actionable" UI forever. 'resolved' and
 * 'expired' are terminal and skipped.
 */
export function expireEventsAtTurn(gameState, turn) {
  const next = structuredClone(gameState);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.events = (next.diplomacy.events || []).map((e) =>
    (e.status === 'unread' || e.status === 'read') &&
    e.expiresOnTurn != null &&
    turn > e.expiresOnTurn
      ? { ...e, status: 'expired' }
      : e,
  );
  return next;
}

// — helpers ——————————————————————————————————————————————

function defaultHeadlineFor(trigger) {
  switch (trigger.kind) {
    case 'patience_broken':
      return 'A leader\'s patience has run out';
    case 'omen_witnessed':
      return 'Smoke rises over the Sacred Valley';
    case 'trade_disruption':
      return 'A mercantile opening';
    case 'border_incident':
      return 'Trouble at the border';
    case 'succession_rumor':
      return 'Whispers of succession';
    case 'warmth_offered':
      return 'A hand extended across the courts';
    case 'war_fatigue':
      return 'A tired banner asks for a truce';
    default:
      return 'A message arrives';
  }
}

function parseCommissionResponse(raw) {
  if (typeof raw !== 'string') return {};
  const headline = matchAfter(raw, /HEADLINE:\s*(.+)/i);
  const body = matchAfter(raw, /BODY:\s*([\s\S]+?)(?:\nENDORSE:|$)/i);
  let endorsedIds = [];
  const endorseMatch = raw.match(/ENDORSE:\s*(\[[\s\S]*?\])/i);
  if (endorseMatch) {
    try {
      endorsedIds = JSON.parse(endorseMatch[1]);
    } catch {
      endorsedIds = [];
    }
  }
  return {
    headline: headline?.trim(),
    body: body?.trim(),
    endorsedIds,
  };
}

function matchAfter(s, re) {
  const m = s.match(re);
  return m ? m[1] : null;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
