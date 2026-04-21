// Fresh Base44 cloud function for the LLM-driven diplomacy revamp.
//
// Contract (request body):
//   {
//     system: string,          // assembled by promptBuilder.buildConversationPrompt
//     user: string,            // assembled by promptBuilder.buildConversationPrompt
//     model?: string,          // optional override; default below
//   }
//
// Response:
//   {
//     dialogue: string,        // the in-character reply
//     actions: ActionDef[]     // structured proposals; empty if none
//   }
//
// The server is intentionally thin — it does not know about game state,
// does not know the action registry, and does not validate. Validation
// happens client-side via the dispatcher. This keeps the LLM contract
// simple and keeps game logic in one place.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { system, user: userMessage, model } = body || {};
    if (!system || !userMessage) {
      return Response.json(
        { error: 'Missing required fields: system, user' },
        { status: 400 },
      );
    }

    const prompt = `${system}\n\n${userMessage}`;
    const llmOut = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: model || 'gpt_5_mini',
    });

    const raw = typeof llmOut === 'string' ? llmOut : (llmOut?.response || '');
    const { dialogue, actions } = parseResponse(raw);

    return Response.json({ dialogue, actions, raw });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});

/**
 * Parses the LLM output per the output contract defined in promptBuilder.
 * Dialogue is everything before the JSON fence; actions come from the
 * fenced JSON block's `actions` array. Malformed JSON falls back to [].
 */
function parseResponse(raw: string): { dialogue: string; actions: unknown[] } {
  if (!raw) return { dialogue: '', actions: [] };
  const fenceMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  if (!fenceMatch) {
    return { dialogue: raw.trim(), actions: [] };
  }
  const dialogue = raw.slice(0, fenceMatch.index).trim();
  let actions: unknown[] = [];
  try {
    const parsed = JSON.parse(fenceMatch[1]);
    if (Array.isArray(parsed?.actions)) actions = parsed.actions;
  } catch {
    // ignored — dialogue still returns
  }
  return { dialogue, actions };
}
