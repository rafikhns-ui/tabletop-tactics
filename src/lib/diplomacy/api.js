// Client-side wrappers around the new Base44 functions.
// Keeps SDK details out of components and lets us swap transport later.

import { base44 } from '@/api/base44Client';
import { buildConversationPrompt } from './promptBuilder';
import { dispatch } from './dispatcher';

/**
 * Send a player message to an AI faction. Returns
 *   { dialogue, applied, rejected, nextState, error? }.
 *
 * Any action the dispatcher rejects is returned in `rejected` so the UI
 * can show a soft note ("Boreslav's demand exceeded what the state allows")
 * without stopping the flow.
 *
 * Resilience: transport failures (network error, server 5xx, timeout)
 * return a sentinel result with `error: 'transport_failure'` and the
 * unchanged gameState. The caller can render an "our envoy couldn't
 * reach their court" message instead of crashing the React tree.
 * Malformed action entries (non-objects) are rejected up front so they
 * never reach dispatch.
 */
export async function sendDiplomacyMessage({
  gameState,
  speakerFactionId,
  playerFactionId,
  history,
  userMessage,
}) {
  const prompt = buildConversationPrompt({
    gameState,
    speakerFactionId,
    playerFactionId,
    history,
    userMessage,
  });

  let resp;
  try {
    resp = await base44.functions.invoke('generateDiplomacyProposal', {
      system: prompt.system,
      user: prompt.user,
    });
  } catch (err) {
    console.warn('generateDiplomacyProposal failed:', err);
    return {
      dialogue: '',
      applied: [],
      rejected: [],
      nextState: gameState,
      error: 'transport_failure',
    };
  }

  const dialogue = resp?.data?.dialogue || '';
  const rawActions = Array.isArray(resp?.data?.actions) ? resp.data.actions : [];

  // The LLM is told to omit "proposer" — fill it in from the speaker.
  let cur = gameState;
  const applied = [];
  const rejected = [];
  for (const a of rawActions) {
    // Reject garbage shapes before they reach dispatch — the spread on
    // e.g. a string would produce an indexed-char object, which dispatch
    // would politely call "unknown_action_type:undefined" but that's
    // misleading to the player.
    if (!a || typeof a !== 'object' || Array.isArray(a)) {
      rejected.push({ action: a, reason: 'malformed_action' });
      continue;
    }
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

/**
 * The LLM callback consumed by runTurnEventPass. Adapts the server
 * response back into a plain string for the lifecycle parser.
 *
 * Transport failures return an empty string rather than throwing, so a
 * flaky LLM doesn't break the turn pass. The lifecycle parser falls
 * back to the detector's default headline + body when the raw string
 * is empty — see events/lifecycle.js.
 */
export async function commissionEventLlm({ system, user }) {
  try {
    const resp = await base44.functions.invoke('commissionDiplomacyEvent', {
      system,
      user,
    });
    return resp?.data?.raw || '';
  } catch (err) {
    console.warn('commissionDiplomacyEvent failed:', err);
    return '';
  }
}
