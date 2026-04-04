// AI Personality traits for each nation
export const NATION_PERSONALITIES = {
  gojeon: { type: 'Mercantile', name: 'Trade-focused', emoji: '💰' },
  inuvak: { type: 'Defensive', name: 'Protective', emoji: '🛡️' },
  ruskel: { type: 'Aggressive', name: 'Expansionist', emoji: '⚔️' },
  icebound: { type: 'Aggressive', name: 'Warlike', emoji: '❄️' },
  oakhaven: { type: 'Defensive', name: 'Isolationist', emoji: '🌲' },
  onishiman: { type: 'Aggressive', name: 'Militaristic', emoji: '⛩️' },
  kadjimaran: { type: 'Mercantile', name: 'Diplomatic', emoji: '👑' },
  nimrudan: { type: 'Aggressive', name: 'Domineering', emoji: '🔥' },
  kinetic: { type: 'Mercantile', name: 'Pragmatic', emoji: '⚙️' },
  ilalocatotlan: { type: 'Aggressive', name: 'Fierce', emoji: '🗡️' },
  hestia: { type: 'Defensive', name: 'Cautious', emoji: '🏛️' },
  azure: { type: 'Mercantile', name: 'Seafaring', emoji: '🌊' },
  silver: { type: 'Defensive', name: 'Neutral', emoji: '⚖️' },
  shadowsfall: { type: 'Aggressive', name: 'Mysterious', emoji: '🌑' },
  scorched: { type: 'Aggressive', name: 'Hostile', emoji: '💥' },
};

// Scoring logic: evaluate how much AI likes an offer based on personality
export function scoreTradeOffer(offer, aiPlayer, otherPlayer, personality) {
  let score = 50; // baseline neutrality

  const aiResources = aiPlayer.resources || {};
  const otherResources = otherPlayer.resources || {};

  // Calculate resource value gained vs lost
  let gainValue = 0;
  let lossValue = 0;
  for (const [k, v] of Object.entries(offer.offer || {})) {
    gainValue += v * 1; // simple weight
    lossValue += (aiResources[k] || 0) * 0.1; // impact on AI's reserves
  }
  for (const [k, v] of Object.entries(offer.request || {})) {
    lossValue += v * 1;
    gainValue += (otherResources[k] || 0) * 0.1;
  }

  // Personality modifiers
  if (personality.type === 'Mercantile') {
    score += Math.max(0, gainValue - lossValue) * 2; // loves profitable trades
    score += (gainValue > 0 ? 20 : -20); // extra bonus for any gain
  } else if (personality.type === 'Aggressive') {
    score += (gainValue > 0 ? 10 : -30); // wants resources for war, dislikes giving
  } else if (personality.type === 'Defensive') {
    score += (gainValue > lossValue ? 15 : -25); // wants security
  }

  return Math.max(0, Math.min(100, score));
}

export function shouldAcceptAlliance(aiPlayer, otherPlayer, personality) {
  // Mercantile nations love allies for trade access
  if (personality.type === 'Mercantile') return Math.random() < 0.7;
  // Aggressive nations are picky — only ally if weak or mutual benefit
  if (personality.type === 'Aggressive') return Math.random() < 0.3;
  // Defensive nations seek protection through alliances
  if (personality.type === 'Defensive') return Math.random() < 0.6;
  return Math.random() < 0.5;
}

export function shouldDeclareWar(aiPlayer, targetPlayer, personality, gameState) {
  // Mercantile: avoid war unless profitable
  if (personality.type === 'Mercantile') return Math.random() < 0.2;
  // Aggressive: declare war often
  if (personality.type === 'Aggressive') return Math.random() < 0.5;
  // Defensive: only attack if threatened or much stronger
  if (personality.type === 'Defensive') return Math.random() < 0.15;
  return Math.random() < 0.3;
}