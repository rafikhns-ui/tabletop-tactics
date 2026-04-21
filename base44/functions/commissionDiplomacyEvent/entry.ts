// Fresh Base44 cloud function — event commissioning.
//
// Called from lifecycle.runTurnEventPass. Takes a system + user prompt
// built by promptBuilder.buildEventCommissionPrompt and returns the raw
// LLM output; lifecycle.js parses HEADLINE/BODY/ENDORSE.

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
    return Response.json({ raw });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});
