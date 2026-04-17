import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userMessage, aiName, aiPersonality, sentiment, currentInfluence, userFaction, aiFactio, gameContext } = await req.json();

    if (!userMessage || !aiName || !aiPersonality) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build context prompt based on sentiment and influence
    const sentimentLabel = sentiment > 70 ? 'very friendly' : sentiment > 50 ? 'friendly' : sentiment > 30 ? 'neutral' : 'hostile';
    const influenceLabel = currentInfluence > 3 ? 'high influence' : currentInfluence > 1 ? 'moderate influence' : 'low influence';

    const prompt = `You are ${aiName}, a faction leader in the fantasy strategy game Ardonia. 

**Your Personality:** ${aiPersonality.behavior || 'Strategic and pragmatic'}
**Your Nature:** ${aiPersonality.nature || 'Ambitious ruler'}
**Trade Tendency:** ${aiPersonality.willTrade ? 'Open to trade' : 'Reluctant to trade'}
**War Tendency:** ${aiPersonality.willDeclareWar ? 'Aggressive' : 'Peaceful'}

**Current Relationship with the player:** ${sentimentLabel} (Sentiment: ${Math.round(sentiment)}%)
**Your influence over them:** ${influenceLabel} (Level: ${currentInfluence})

The player just said: "${userMessage}"

Respond in-character as ${aiName}. Your response should:
1. Reflect your personality and lore
2. React to their current sentiment level (friendly/neutral/hostile)
3. Be brief (1-2 sentences max)
4. Consider their message in context of the game

Respond ONLY with the dialogue—no asterisks, no actions, just what ${aiName} would say.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
    });

    return Response.json({ 
      response: typeof response === 'string' ? response : response.response || 'An error occurred',
      sentiment,
      influence: currentInfluence
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});