// Turn-boundary hooks for the host game to call.
//
// These are deliberately framework-free so they can be invoked from
// Game.jsx, OnlineGame.jsx, a reducer, or a worker — wherever the
// turn boundary actually lives.

import { runTurnEventPass, expireEventsAtTurn } from './events';
import { commissionEventLlm } from './api';
import { appendEvents, pruneInboxHistory } from './inbox';
import {
  checkHegemonVictory,
  checkMercantileVictory,
  evaluateMercantileStanding,
  formatVictoryAnnouncement,
  MERC_UNIQUE_PARTNERS,
  MERC_GOLD_THRESHOLD,
} from './victory';
import { getPersonality } from './personalities';
import { runTurnTick } from './turnTick';
import { resolveAIOffers } from './aiPolicy';

/**
 * Call at the start of the human player's turn.
 *
 *   nextState = await onTurnStart({ gameState, playerFactionId })
 *
 * Returns a new state with expired events marked and fresh events
 * commissioned. Safe to call repeatedly — detectors only fire when
 * their preconditions hold.
 */
export async function onTurnStart({ gameState, playerFactionId }) {
  const turn = gameState.turn || 0;
  const expired = expireEventsAtTurn(gameState, turn);
  // Prune terminal-state events and resolved offers older than the
  // history window — keeps the inbox bounded across long games.
  const pruned = pruneInboxHistory(expired, turn);

  let events = [];
  try {
    events = await runTurnEventPass({
      gameState: pruned,
      playerFactionId,
      llmFn: commissionEventLlm,
      maxEvents: 2,
    });
  } catch (err) {
    console.warn('Event pass failed; continuing without LLM events.', err);
  }

  return appendEvents(pruned, events);
}

/**
 * Call at the end of every turn. Returns either:
 *   { gameOver: true, announcement, result, nextState }
 *   { gameOver: false, nextState }
 *
 * `nextState` may differ from the input because the mercantile streak
 * counters are advanced here.
 *
 * @param {{ gameState?: Object, playerFactionId?: string }} [opts]
 */
export function onTurnEnd({ gameState, playerFactionId } = {}) {
  // 1) AI factions respond to any offers targeting them. Must run
  //    before the tick — a resolved offer may move resources that the
  //    tick and the mercantile check need to see.
  const { state: afterAI, decisions: aiDecisions } = resolveAIOffers(
    gameState,
    { playerFactionId },
  );

  // 2) Maintenance tick — pays out trade routes, expires oaths /
  //    pacts / offers / blockades, and nudges sentiment toward baseline.
  const ticked = runTurnTick(afterAI);

  // 3) Advance mercantile streaks against the post-tick snapshot.
  const advanced = advanceMercantileStreaks(ticked);

  // 4) Hegemon check first — broader, faster-triggering path.
  const hegemon = checkHegemonVictory(advanced);
  if (hegemon) {
    const announcement = formatVictoryAnnouncement(hegemon, getPersonality);
    return {
      gameOver: true, announcement, result: hegemon,
      nextState: advanced, aiDecisions,
    };
  }

  // 5) Mercantile check second.
  const standings = evaluateMercantileStanding(advanced);
  const merc = checkMercantileVictory(standings);
  if (merc) {
    const announcement = formatVictoryAnnouncement(merc, getPersonality);
    return {
      gameOver: true, announcement, result: merc,
      nextState: advanced, aiDecisions,
    };
  }

  return { gameOver: false, nextState: advanced, aiDecisions };
}

// — helpers ———————————————————————————————————————

/**
 * Walk every faction, compute current partners + gold, and increment or
 * reset their mercantile streak counter. Returns a new gameState.
 *
 * Idempotency: runTurnTick gates its non-idempotent work (trade income,
 * vassal tribute, sentiment decay) behind `lastTickedTurn`. The streak
 * increment below is equally non-idempotent — a second call on the same
 * turn double-bumps each qualifying faction, which shortens the
 * MERC_CONSECUTIVE_TURNS requirement by one for every spurious re-call
 * and can trigger Mercantile Dominance a turn early. #59 hardened the
 * Game.jsx onTurnEnd effect against per-render re-firing at the UI
 * layer; this guard adds defense-in-depth at the library layer so a
 * future caller (or OnlineGame.jsx, or a worker harness) can't
 * reintroduce the bug.
 */
function advanceMercantileStreaks(gameState) {
  const next = structuredClone(gameState);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.mercStreaks = next.diplomacy.mercStreaks || {};

  const turn = next.turn || 0;
  if (next.diplomacy.lastMercStreakedTurn === turn) return next;

  const standings = evaluateMercantileStanding(next);
  for (const s of standings) {
    const qualifies =
      s.partners >= MERC_UNIQUE_PARTNERS && s.gold >= MERC_GOLD_THRESHOLD;
    const prior = next.diplomacy.mercStreaks[s.factionId] || 0;
    next.diplomacy.mercStreaks[s.factionId] = qualifies ? prior + 1 : 0;
  }
  next.diplomacy.lastMercStreakedTurn = turn;
  return next;
}
