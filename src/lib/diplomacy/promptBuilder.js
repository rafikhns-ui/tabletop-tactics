// Prompt builder — assembles the system + user message pair
// the Base44 cloud function sends to the LLM.
//
// Two modes:
//   buildConversationPrompt(): freeform dialogue (player talks, LLM replies + may propose actions)
//   buildEventCommissionPrompt(): used by the event system to author headlines/bodies
//
// Both modes share a compact "world state" digest so the LLM isn't flooded.

import { buildLlmToolSpec } from './actions';
import { getPersonality } from './personalities';

/**
 * Build the conversation prompt. Output shape:
 *   { system, user, tools }
 * The Base44 function relays these to InvokeLLM.
 *
 * @param {Object} opts
 * @param {Object} opts.gameState
 * @param {string} opts.speakerFactionId   The AI faction speaking
 * @param {string} opts.playerFactionId    The human player's faction
 * @param {Array<{role:"user"|"ai",text:string}>} opts.history
 * @param {string} opts.userMessage
 */
export function buildConversationPrompt({
  gameState,
  speakerFactionId,
  playerFactionId,
  history = [],
  userMessage,
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
    outputContract(),
  ]
    .filter(Boolean)
    .join('\n\n');

  const user = [
    '<world_state>',
    digest,
    '</world_state>',
    '',
    '<conversation>',
    ...history.slice(-8).map((m) => `${m.role === 'user' ? 'PLAYER' : 'YOU'}: ${m.text}`),
    `PLAYER: ${userMessage}`,
    '</conversation>',
    '',
    'Respond now. Follow the output contract exactly.',
  ].join('\n');

  return { system, user, tools };
}

/**
 * Build a prompt for commissioning an event's narrative body.
 * The trigger is deterministic; the LLM only authors flavor text.
 */
export function buildEventCommissionPrompt({
  gameState,
  speakerFactionId,
  playerFactionId,
  triggerSummary,
  proposals,
}) {
  const personality = getPersonality(speakerFactionId);
  const digest = buildStateDigest(gameState, speakerFactionId, playerFactionId);

  const system = [
    roleHeader(personality, speakerFactionId),
    voiceBlock(personality),
    [
      'You are writing an in-world event message to the player.',
      'Write ONE short paragraph (2–4 sentences), in character.',
      'Then a JSON block listing which of the pre-commissioned proposals you endorse.',
      'Do NOT invent new proposals. Do NOT modify their payloads.',
    ].join(' '),
  ]
    .filter(Boolean)
    .join('\n\n');

  const user = [
    '<trigger>',
    triggerSummary,
    '</trigger>',
    '',
    '<world_state>',
    digest,
    '</world_state>',
    '',
    '<available_proposals>',
    JSON.stringify(proposals, null, 2),
    '</available_proposals>',
    '',
    'Write the message now.',
    'OUTPUT FORMAT:',
    'HEADLINE: <one short line>',
    'BODY: <the paragraph>',
    'ENDORSE: [<array of proposal ids you endorse, drawn from the ids above>]',
  ].join('\n');

  return { system, user };
}

// — helpers ——————————————————————————————————————————————

function roleHeader(personality, speakerId) {
  if (!personality) {
    return `You are the faction leader of "${speakerId}". No authored personality available; be neutral and diplomatic.`;
  }
  return [
    `You are ${personality.leaderName}, ${personality.title}, leader of ${personality.factionId}.`,
    `You are speaking in-character. You are not an AI assistant; you are a ruler.`,
  ].join(' ');
}

function voiceBlock(p) {
  if (!p) return null;
  const { voice } = p;
  return [
    'VOICE:',
    `- Register: ${voice.register}`,
    `- Addressing style: ${voice.addressingStyle}`,
    `- You often say things like: ${voice.cadence.map((c) => `"${c}"`).join(', ')}.`,
    `- You would never say: ${voice.forbiddenPhrases.map((c) => `"${c}"`).join(', ')}.`,
  ].join('\n');
}

function valuesBlock(p) {
  if (!p) return null;
  const v = p.values;
  const format = (k) => `${k}: ${valueLabel(v[k])}`;
  return [
    'VALUES (each −1…+1):',
    ...Object.keys(v).map(format),
  ].join('\n');
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
  return ['GOALS (in priority order):', ...p.goals.map((g, i) => `${i + 1}. ${g}`)].join('\n');
}

function redLinesBlock(p) {
  if (!p) return null;
  return [
    'RED LINES (if crossed, you must act as specified):',
    ...p.redLines.map(
      (r) => `- ${r.kind}: ${r.description} → ${r.onViolation}`,
    ),
  ].join('\n');
}

function toolSpecBlock(tools) {
  return [
    'AVAILABLE ACTIONS:',
    'When you want to formally propose something that changes the game, include one or more tool calls in your response.',
    'Each tool call MUST use the exact "type" below and fill in the payload shape. The game engine validates every call; malformed calls are ignored.',
    '',
    ...tools.map(
      (t) =>
        `- ${t.type} (${t.category}): ${t.hint} Payload: ${JSON.stringify(t.payloadSchema)}`,
    ),
  ].join('\n');
}

function outputContract() {
  return [
    'OUTPUT CONTRACT — FOLLOW EXACTLY:',
    '1. Reply in character with 1–3 sentences of dialogue.',
    '2. If (and only if) you want to take formal diplomatic action, append a single JSON block enclosed in ```json ... ``` fences.',
    '3. That JSON must be: { "actions": [ { "type": "ACTION_TYPE", "target": "faction_id", "payload": { ... }, "reason": "short" }, ... ] }.',
    '4. Set "proposer" to your own faction id implicitly — the engine infers it from you.',
    '5. If you want to say nothing formal, omit the JSON block entirely. Never put empty braces.',
    '6. Never break character. Never mention being an AI, a model, or a language system.',
  ].join('\n');
}

/**
 * Compact state digest — kept small so prompts fit in context.
 * Returns a multi-line string summary from the speaker's POV.
 */
export function buildStateDigest(state, speakerId, playerId) {
  const turn = state?.turn ?? 0;
  const me = findPlayer(state, speakerId);
  const them = findPlayer(state, playerId);

  const lines = [];
  lines.push(`Turn: ${turn}`);
  lines.push(`Relation with player: ${relationText(state, speakerId, playerId)}`);
  lines.push(`Sentiment toward player: ${sentimentText(state, speakerId, playerId)}`);

  if (me?.resources) {
    lines.push(
      `Your resources: ${summaryBag(me.resources)}`,
    );
  }
  if (them?.resources) {
    lines.push(`Player resources: ${summaryBag(them.resources)}`);
  }

  const myHexes = countHexes(state, speakerId);
  const theirHexes = countHexes(state, playerId);
  lines.push(`Territory: you hold ${myHexes} hexes; player holds ${theirHexes}.`);

  // Open offers that concern this pair
  const offers = (state.diplomacy?.openOffers || []).filter(
    (o) =>
      (o.proposer === speakerId && o.target === playerId) ||
      (o.proposer === playerId && o.target === speakerId),
  );
  if (offers.length) {
    lines.push(`Open offers between you and the player: ${offers.length}.`);
    offers.slice(0, 3).forEach((o) =>
      lines.push(`  • ${o.type} (from ${o.proposer}): ${JSON.stringify(o.payload).slice(0, 80)}`),
    );
  }

  // Wars, threats, embargoes
  // Skip entries marked with endedTurn — acceptPeace leaves the record
  // in state for historical context but the pair is no longer at war.
  // Without this filter the LLM is told "At war since turn 3" for a
  // long-ago settled conflict.
  const wars = (state.diplomacy?.wars || []).filter(
    (w) =>
      !w.endedTurn &&
      ((w.attacker === speakerId && w.defender === playerId) ||
        (w.attacker === playerId && w.defender === speakerId)),
  );
  if (wars.length) lines.push(`At war with the player since turn ${wars[0].declaredTurn}.`);

  const threats = (state.diplomacy?.standingThreats || []).filter(
    (t) => t.from === playerId && t.against === speakerId,
  );
  if (threats.length)
    lines.push(`Player has a standing threat against you: "${threats[0].demand}".`);

  return lines.join('\n');
}

function findPlayer(state, factionId) {
  return (
    (state?.players || []).find(
      (p) =>
        p.faction?.id === factionId ||
        p.id === factionId ||
        p.factionId === factionId,
    ) || null
  );
}

function countHexes(state, factionId) {
  const hexes = state?.hexes || {};
  let n = 0;
  for (const h of Object.values(hexes)) if (h?.owner === factionId) n++;
  return n;
}

function summaryBag(r) {
  const parts = [];
  for (const k of ['gold', 'wood', 'wheat', 'iron', 'ip', 'sp']) {
    if (r[k] !== undefined) parts.push(`${r[k]}${k[0]}`);
  }
  return parts.join(' ');
}

function relationText(state, a, b) {
  const rel = state?.diplomacy?.relations;
  if (!rel) return 'neutral';
  const key = [a, b].sort().join('|');
  return rel[key] || 'neutral';
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
