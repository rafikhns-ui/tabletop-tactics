import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { gameState, currentPlayer, targetPlayer, userMessage, conversationHistory } = body;

    // Build context for the LLM about the diplomatic situation
    const context = `
You are roleplaying as ${targetPlayer.name}, the ruler of the ${targetPlayer.faction?.name || 'unknown nation'}.
Your personality is: ${targetPlayer.isAI ? 'Strategic AI leader' : 'Human player'}.

Current game state:
- Your resources: Gold ${targetPlayer.resources?.gold || 0}, Wood ${targetPlayer.resources?.wood || 0}, Wheat ${targetPlayer.resources?.wheat || 0}
- Their resources: Gold ${currentPlayer.resources?.gold || 0}, Wood ${currentPlayer.resources?.wood || 0}, Wheat ${currentPlayer.resources?.wheat || 0}
- Your territory control: ${gameState?.players?.reduce((sum, p) => p.id === targetPlayer.id ? sum + (Object.values(gameState.hexes || {}).filter(h => h.owner === p.id).length || 0) : sum, 0) || 0} hexes
- Their territory: ${gameState?.players?.reduce((sum, p) => p.id === currentPlayer.id ? sum + (Object.values(gameState.hexes || {}).filter(h => h.owner === p.id).length || 0) : sum, 0) || 0} hexes

Guidelines:
- Respond in character as ${targetPlayer.name}
- Consider the power balance, resources, and current relationships
- If they propose trade, evaluate if it benefits you
- If they propose alliance or war, respond based on strategic interest
- Keep responses under 100 words, diplomatic and lore-accurate
- Use subtle hints about your strategic intentions

${conversationHistory && conversationHistory.length > 0 ? `
Previous messages:
${conversationHistory.map(m => `${m.role === 'user' ? `${currentPlayer.name}` : targetPlayer.name}: ${m.text}`).join('\n')}
` : ''}

${currentPlayer.name} just said: "${userMessage}"

Respond as ${targetPlayer.name}. Also include a JSON action at the end if you want to suggest a trade/alliance, like:
ACTION: {"type": "trade_offer", "offer": {"gold": 5}, "request": {"wood": 3}}
or ACTION: {"type": "none"} if no action.
`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: context,
      model: 'gpt_5_mini',
    });

    // Parse response to extract action if present
    let aiText = response;
    let suggestedAction = null;

    const actionMatch = aiText.match(/ACTION:\s*({.*?})/s);
    if (actionMatch) {
      try {
        suggestedAction = JSON.parse(actionMatch[1]);
        aiText = aiText.replace(/ACTION:.*?}/s, '').trim();
      } catch (e) {
        // Ignore parse errors
      }
    }

    return Response.json({
      response: aiText,
      suggestedAction: suggestedAction && suggestedAction.type !== 'none' ? suggestedAction : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});