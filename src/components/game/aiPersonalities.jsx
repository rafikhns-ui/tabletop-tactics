// ══════════════════════════════════════════════════════
// RULERS OF ARDONIA — AI Personality & Influence System
// ══════════════════════════════════════════════════════

/**
 * Each nation has a full personality profile:
 *  - type: broad archetype
 *  - traits: specific behavioral flags
 *  - warLikelihood: base % chance to declare war per turn [0-1]
 *  - allianceLikelihood: base % to accept alliances [0-1]
 *  - tradeLikelihood: base % to engage in trade [0-1]
 *  - sentimentBase: starting sentiment toward other nations (-100 to 100)
 *  - sentimentDecayPerTurn: sentiment drifts toward 0 each turn
 *  - grievanceThreshold: sentiment below this triggers war declaration
 *  - allianceThreshold: sentiment above this enables alliances
 *  - flavor: unique lore description
 */
export const NATION_PERSONALITIES = {
  gojeon: {
    type: 'Mercantile',
    name: 'The Gojeon Court',
    emoji: '🌸',
    traits: ['cultured', 'diplomatic', 'honorable'],
    warLikelihood: 0.08,
    allianceLikelihood: 0.72,
    tradeLikelihood: 0.85,
    sentimentBase: 20,
    sentimentDecayPerTurn: 2,
    grievanceThreshold: -50,
    allianceThreshold: 40,
    flavor: 'The Jeon Court prizes art and commerce above conquest. They respond warmly to cultural gifts and treaties, but a broken promise earns lasting enmity.',
    influenceCosts: { goodwill: { gold: 3, ip: 1 }, alliance: { gold: 5, ip: 3 }, trade: { gold: 2 } },
  },
  inuvak: {
    type: 'Defensive',
    name: 'Inuvak Elders',
    emoji: '❄️',
    traits: ['isolationist', 'spiritual', 'patient'],
    warLikelihood: 0.1,
    allianceLikelihood: 0.55,
    tradeLikelihood: 0.6,
    sentimentBase: 5,
    sentimentDecayPerTurn: 3,
    grievanceThreshold: -40,
    allianceThreshold: 45,
    flavor: 'The Inuvak Elders are slow to anger but fierce in defense. Spiritual offerings raise their esteem. They distrust military powers near their tundra.',
    influenceCosts: { goodwill: { gold: 2, sp: 1 }, alliance: { gold: 4, sp: 2 }, trade: { wheat: 2 } },
  },
  ruskel: {
    type: 'Aggressive',
    name: 'Ruskel Iron Council',
    emoji: '⚙️',
    traits: ['expansionist', 'industrial', 'pragmatic'],
    warLikelihood: 0.38,
    allianceLikelihood: 0.3,
    tradeLikelihood: 0.55,
    sentimentBase: -10,
    sentimentDecayPerTurn: 1,
    grievanceThreshold: -30,
    allianceThreshold: 55,
    flavor: 'The Iron Council respects strength above all. Offering iron and gold buys their grudging respect, but weakness invites invasion.',
    influenceCosts: { goodwill: { gold: 4, wood: 2 }, alliance: { gold: 8, wood: 4 }, trade: { gold: 3 } },
  },
  icebound: {
    type: 'Aggressive',
    name: 'The Eternal Blizzard',
    emoji: '🌨️',
    traits: ['fanatical', 'warlike', 'unpredictable'],
    warLikelihood: 0.52,
    allianceLikelihood: 0.15,
    tradeLikelihood: 0.25,
    sentimentBase: -20,
    sentimentDecayPerTurn: 4,
    grievanceThreshold: -20,
    allianceThreshold: 70,
    flavor: 'The Icebound Horde fights as sacred duty. They barely recognize diplomacy — only displays of martial power or massive tribute can stay their hand.',
    influenceCosts: { goodwill: { gold: 6, wheat: 3 }, alliance: { gold: 12, wheat: 6 }, trade: { wheat: 4 } },
  },
  oakhaven: {
    type: 'Defensive',
    name: 'Oakhaven Republic',
    emoji: '🌳',
    traits: ['isolationist', 'naturalist', 'cautious'],
    warLikelihood: 0.12,
    allianceLikelihood: 0.6,
    tradeLikelihood: 0.65,
    sentimentBase: 10,
    sentimentDecayPerTurn: 2,
    grievanceThreshold: -45,
    allianceThreshold: 40,
    flavor: 'Oakhaven guards its ancient forests fiercely. Ecological respect and non-aggression treaties resonate deeply with the Oakmen.',
    influenceCosts: { goodwill: { wood: 3, ip: 1 }, alliance: { wood: 5, ip: 2 }, trade: { wood: 2 } },
  },
  onishiman: {
    type: 'Aggressive',
    name: 'Onishiman Shadow Court',
    emoji: '⛩️',
    traits: ['militaristic', 'secretive', 'ambitious'],
    warLikelihood: 0.42,
    allianceLikelihood: 0.25,
    tradeLikelihood: 0.4,
    sentimentBase: -5,
    sentimentDecayPerTurn: 2,
    grievanceThreshold: -35,
    allianceThreshold: 60,
    flavor: 'The Shadow Court speaks in whispers and acts through proxies. Clandestine gifts and intel sharing earn their trust; open defiance earns their wrath.',
    influenceCosts: { goodwill: { gold: 4, ip: 2 }, alliance: { gold: 7, ip: 4 }, trade: { gold: 3, ip: 1 } },
  },
  kadjimaran: {
    type: 'Mercantile',
    name: 'Kadjimaran Confederation',
    emoji: '☀️',
    traits: ['diplomatic', 'honorable', 'spiritual'],
    warLikelihood: 0.14,
    allianceLikelihood: 0.68,
    tradeLikelihood: 0.8,
    sentimentBase: 15,
    sentimentDecayPerTurn: 2,
    grievanceThreshold: -55,
    allianceThreshold: 35,
    flavor: 'The Kadjimaran value honor above profit. They eagerly trade but will end any relationship the moment an oath is broken.',
    influenceCosts: { goodwill: { gold: 2, wheat: 2 }, alliance: { gold: 4, wheat: 3 }, trade: { gold: 2 } },
  },
  nimrudan: {
    type: 'Aggressive',
    name: 'Nimrudan Obsidian Throne',
    emoji: '🔥',
    traits: ['domineering', 'cult-driven', 'proud'],
    warLikelihood: 0.4,
    allianceLikelihood: 0.2,
    tradeLikelihood: 0.35,
    sentimentBase: -15,
    sentimentDecayPerTurn: 3,
    grievanceThreshold: -30,
    allianceThreshold: 65,
    flavor: 'The Obsidian Throne views dominance as divine mandate. Offerings of SP-infused tribute and spiritual deference can appease their pride.',
    influenceCosts: { goodwill: { gold: 5, sp: 2 }, alliance: { gold: 9, sp: 4 }, trade: { gold: 4 } },
  },
  kintei: {
    type: 'Mercantile',
    name: 'Greater Kintei Alliance',
    emoji: '🐲',
    traits: ['engineering', 'pragmatic', 'trade-savvy'],
    warLikelihood: 0.18,
    allianceLikelihood: 0.6,
    tradeLikelihood: 0.82,
    sentimentBase: 10,
    sentimentDecayPerTurn: 2,
    grievanceThreshold: -50,
    allianceThreshold: 38,
    flavor: 'Kintei values efficiency and mutual benefit. Wood and gold speak their language. They make reliable partners when the price is right.',
    influenceCosts: { goodwill: { gold: 3, wood: 1 }, alliance: { gold: 5, wood: 3 }, trade: { wood: 2 } },
  },
  tlalocayotlan: {
    type: 'Aggressive',
    name: 'Tlalocayotlan League',
    emoji: '🦎',
    traits: ['ritualistic', 'fierce', 'unpredictable'],
    warLikelihood: 0.35,
    allianceLikelihood: 0.3,
    tradeLikelihood: 0.45,
    sentimentBase: -5,
    sentimentDecayPerTurn: 3,
    grievanceThreshold: -35,
    allianceThreshold: 55,
    flavor: 'The League respects power shown in ritual and battle. Spiritual offerings calm their aggression; insults trigger swift retribution.',
    influenceCosts: { goodwill: { gold: 3, sp: 2 }, alliance: { gold: 6, sp: 3 }, trade: { wheat: 3 } },
  },
  republic: {
    type: 'Defensive',
    name: 'Hestian Republic',
    emoji: '⚓',
    traits: ['democratic', 'naval', 'lawful'],
    warLikelihood: 0.15,
    allianceLikelihood: 0.65,
    tradeLikelihood: 0.78,
    sentimentBase: 15,
    sentimentDecayPerTurn: 2,
    grievanceThreshold: -50,
    allianceThreshold: 38,
    flavor: 'The Republic values law and trade routes. IP-rich diplomatic overtures and naval cooperation treaties resonate with their Senate.',
    influenceCosts: { goodwill: { gold: 3, ip: 2 }, alliance: { gold: 5, ip: 3 }, trade: { gold: 2 } },
  },
  sultanate: {
    type: 'Mercantile',
    name: 'Blue Moon Sultanate',
    emoji: '🌙',
    traits: ['religious', 'scholarly', 'peaceful'],
    warLikelihood: 0.06,
    allianceLikelihood: 0.75,
    tradeLikelihood: 0.88,
    sentimentBase: 25,
    sentimentDecayPerTurn: 1,
    grievanceThreshold: -60,
    allianceThreshold: 30,
    flavor: 'The Sultanate abhors violence and seeks enlightenment through commerce. Spiritual gifts and non-aggression pledges earn deep trust.',
    influenceCosts: { goodwill: { gold: 2, sp: 1 }, alliance: { gold: 4, sp: 2 }, trade: { gold: 2 } },
  },
  silver_union: {
    type: 'Mercantile',
    name: 'Silver Union',
    emoji: '🏦',
    traits: ['neutral', 'profit-driven', 'mercenary'],
    warLikelihood: 0.05,
    allianceLikelihood: 0.4,
    tradeLikelihood: 0.95,
    sentimentBase: 0,
    sentimentDecayPerTurn: 1,
    grievanceThreshold: -70,
    allianceThreshold: 50,
    flavor: 'The Silver Union has no ideology — only ledgers. Pay enough gold and they will support anyone. Fail to pay and they fund your enemies.',
    influenceCosts: { goodwill: { gold: 5 }, alliance: { gold: 10 }, trade: { gold: 3 } },
  },
};

// ══════════════════════════════════════════════
// SENTIMENT SYSTEM
// ══════════════════════════════════════════════

/**
 * Initialize sentiment map for all players.
 * sentiment[fromPlayerId][toPlayerId] = number (-100 to 100)
 */
export function initializeSentiment(players) {
  const sentiment = {};
  players.forEach(p => {
    sentiment[p.id] = {};
    players.forEach(other => {
      if (other.id === p.id) return;
      const personality = NATION_PERSONALITIES[p.factionId] || {};
      sentiment[p.id][other.id] = personality.sentimentBase ?? 0;
    });
  });
  return sentiment;
}

/**
 * Decay all sentiments toward 0 by their per-turn rate.
 */
export function decaySentiment(sentiment, players) {
  const next = {};
  players.forEach(p => {
    next[p.id] = {};
    players.forEach(other => {
      if (other.id === p.id) return;
      const personality = NATION_PERSONALITIES[p.factionId] || {};
      const decay = personality.sentimentDecayPerTurn ?? 2;
      const current = sentiment?.[p.id]?.[other.id] ?? 0;
      const decayed = current > 0
        ? Math.max(0, current - decay)
        : Math.min(0, current + decay);
      next[p.id][other.id] = decayed;
    });
  });
  return next;
}

/**
 * Apply a sentiment delta from one player to another (e.g. after influence spend).
 */
export function applySentimentDelta(sentiment, fromId, toId, delta) {
  const next = { ...sentiment };
  next[toId] = { ...(next[toId] || {}) };
  const current = next[toId][fromId] ?? 0;
  next[toId][fromId] = Math.max(-100, Math.min(100, current + delta));
  return next;
}

/**
 * Modify sentiment based on game events (war, trade accepted, broken alliance, etc.)
 */
export function applyEventSentiment(sentiment, type, fromId, toId) {
  const deltas = {
    war_declared: -40,
    alliance_formed: 25,
    alliance_broken: -35,
    trade_accepted: 12,
    trade_declined: -8,
    territory_captured: -20,
    gift_sent: 15,
    insult: -25,
    tribute_paid: 20,
  };
  const delta = deltas[type] ?? 0;
  return applySentimentDelta(sentiment, fromId, toId, delta);
}

// ══════════════════════════════════════════════
// INFLUENCE ACTIONS (spending resources to shift AI)
// ══════════════════════════════════════════════

/**
 * Returns all influence actions a player can take targeting an AI nation.
 * Each action has: id, label, description, cost, sentimentDelta, effect
 */
export function getInfluenceActions(targetFactionId) {
  const personality = NATION_PERSONALITIES[targetFactionId] || {};
  const costs = personality.influenceCosts || {};

  return [
    {
      id: 'send_gift',
      label: '🎁 Send Gift',
      description: `Raise ${personality.name || 'their'} sentiment by +20. Works on anyone.`,
      cost: costs.goodwill || { gold: 4, ip: 1 },
      sentimentDelta: 20,
      warLikelihoodMod: -0.03,
      tradeLikelihoodMod: 0.05,
    },
    {
      id: 'propose_alliance',
      label: '🤝 Diplomatic Mission',
      description: `Strong sentiment boost (+35) and greatly raises alliance likelihood for 2 turns.`,
      cost: costs.alliance || { gold: 7, ip: 3 },
      sentimentDelta: 35,
      warLikelihoodMod: -0.08,
      allianceLikelihoodMod: 0.3,
    },
    {
      id: 'trade_incentive',
      label: '💰 Trade Incentive',
      description: `Offer favorable terms — raises sentiment by +15 and boosts trade likelihood.`,
      cost: costs.trade || { gold: 3 },
      sentimentDelta: 15,
      tradeLikelihoodMod: 0.2,
      warLikelihoodMod: -0.02,
    },
    {
      id: 'spread_propaganda',
      label: '📢 Incite Against Rival',
      description: `Spend IP to shift AI sentiment -30 toward a rival player. Risky — backfires 20% of the time.`,
      cost: { ip: 3, gold: 2 },
      sentimentDelta: 0, // applied to a 3rd party
      targetRivalSentimentDelta: -30,
      backfireChance: 0.2,
      backfireSentimentDelta: -20, // applied against the influencer
    },
    {
      id: 'pay_tribute',
      label: '💎 Pay Tribute',
      description: `Massive sentiment boost (+50) toward you. Costs significant gold. Best for hostile nations.`,
      cost: { gold: 10, wheat: 3 },
      sentimentDelta: 50,
      warLikelihoodMod: -0.15,
    },
    {
      id: 'sabotage_reputation',
      label: '🕵️ Sabotage Reputation',
      description: `Spend IP to permanently damage AI's sentiment toward a rival (-25). Undetected 70% of the time.`,
      cost: { ip: 4 },
      sentimentDelta: 0,
      targetRivalSentimentDelta: -25,
      backfireChance: 0.3,
      backfireSentimentDelta: -15,
    },
  ];
}

/**
 * Execute an influence action. Returns { newSentiment, success, message, newPlayerState }
 */
export function executeInfluenceAction(actionId, sourcePlayer, targetAiPlayerId, rivalPlayerId, gameState) {
  const targetPlayer = gameState.players.find(p => p.id === targetAiPlayerId);
  if (!targetPlayer) return { success: false, message: 'Target not found' };

  const actions = getInfluenceActions(targetPlayer.factionId);
  const action = actions.find(a => a.id === actionId);
  if (!action) return { success: false, message: 'Unknown action' };

  // Check resources
  const cost = action.cost || {};
  for (const [k, v] of Object.entries(cost)) {
    const has = k === 'ip' ? (sourcePlayer.ip ?? 0)
      : k === 'sp' ? (sourcePlayer.sp ?? 0)
      : (sourcePlayer.resources?.[k] ?? 0);
    if (has < v) return { success: false, message: `Not enough ${k}` };
  }

  // Deduct resources
  let newPlayer = { ...sourcePlayer, resources: { ...sourcePlayer.resources } };
  for (const [k, v] of Object.entries(cost)) {
    if (k === 'ip') newPlayer.ip = (newPlayer.ip ?? 0) - v;
    else if (k === 'sp') newPlayer.sp = (newPlayer.sp ?? 0) - v;
    else newPlayer.resources[k] = (newPlayer.resources[k] ?? 0) - v;
  }

  let newSentiment = { ...(gameState.sentiment || {}) };

  // Apply direct sentiment
  if (action.sentimentDelta) {
    newSentiment = applySentimentDelta(newSentiment, sourcePlayer.id, targetAiPlayerId, action.sentimentDelta);
  }

  // Apply rival sentiment manipulation
  if (action.targetRivalSentimentDelta && rivalPlayerId) {
    const backfires = Math.random() < (action.backfireChance || 0);
    if (backfires) {
      newSentiment = applySentimentDelta(newSentiment, sourcePlayer.id, targetAiPlayerId, action.backfireSentimentDelta || -15);
      return {
        success: true,
        backfired: true,
        newSentiment,
        newPlayerState: newPlayer,
        message: `⚠️ The operation backfired! ${targetPlayer.name} now distrusts you more.`,
      };
    } else {
      newSentiment = applySentimentDelta(newSentiment, rivalPlayerId, targetAiPlayerId, action.targetRivalSentimentDelta);
    }
  }

  // Build modifier entry
  const modifier = {
    sourceId: sourcePlayer.id,
    warLikelihoodMod: action.warLikelihoodMod || 0,
    allianceLikelihoodMod: action.allianceLikelihoodMod || 0,
    tradeLikelihoodMod: action.tradeLikelihoodMod || 0,
    turnsRemaining: 3,
  };

  return {
    success: true,
    backfired: false,
    newSentiment,
    newPlayerState: newPlayer,
    modifier,
    message: `✅ ${action.label} toward ${targetPlayer.name} succeeded! Sentiment improved.`,
  };
}

// ══════════════════════════════════════════════
// PERSONALITY-BASED DECISION MAKING
// ══════════════════════════════════════════════

/**
 * Get effective war/alliance/trade likelihoods accounting for sentiment and active modifiers.
 */
export function getEffectiveLikelihoods(aiPlayer, targetPlayerId, gameState) {
  const personality = NATION_PERSONALITIES[aiPlayer.factionId] || {};
  const sentiment = gameState.sentiment?.[aiPlayer.id]?.[targetPlayerId] ?? (personality.sentimentBase ?? 0);

  // Sentiment modifier: ranges from -30% to +30%
  const sentimentMod = sentiment / 100 * 0.3;

  // Active influence modifiers
  const mods = (aiPlayer.influenceModifiers || []).filter(m => m.sourceId === targetPlayerId && m.turnsRemaining > 0);
  const warMod = mods.reduce((s, m) => s + (m.warLikelihoodMod || 0), 0);
  const allianceMod = mods.reduce((s, m) => s + (m.allianceLikelihoodMod || 0), 0);
  const tradeMod = mods.reduce((s, m) => s + (m.tradeLikelihoodMod || 0), 0);

  return {
    warLikelihood: Math.max(0, Math.min(1, (personality.warLikelihood ?? 0.25) - sentimentMod + warMod)),
    allianceLikelihood: Math.max(0, Math.min(1, (personality.allianceLikelihood ?? 0.4) + sentimentMod + allianceMod)),
    tradeLikelihood: Math.max(0, Math.min(1, (personality.tradeLikelihood ?? 0.5) + sentimentMod + tradeMod)),
    sentiment,
    grievanceThreshold: personality.grievanceThreshold ?? -40,
    allianceThreshold: personality.allianceThreshold ?? 40,
  };
}

/**
 * Evaluate a trade offer using personality + sentiment.
 */
export function scoreTradeOffer(offer, aiPlayer, otherPlayer, personality) {
  let score = 50;
  const aiResources = aiPlayer.resources || {};
  const otherResources = otherPlayer.resources || {};

  let gainValue = 0, lossValue = 0;
  for (const [k, v] of Object.entries(offer.offer || {})) {
    gainValue += v;
    lossValue += (aiResources[k] || 0) * 0.08;
  }
  for (const [k, v] of Object.entries(offer.request || {})) {
    lossValue += v;
    gainValue += (otherResources[k] || 0) * 0.08;
  }

  if (personality?.type === 'Mercantile') score += Math.max(0, gainValue - lossValue) * 2.5 + (gainValue > 0 ? 22 : -18);
  else if (personality?.type === 'Aggressive') score += gainValue > 0 ? 8 : -28;
  else if (personality?.type === 'Defensive') score += gainValue > lossValue ? 18 : -22;

  // Sentiment bonus/malus
  const sent = 0; // will be applied by caller
  return Math.max(0, Math.min(100, score));
}

export function shouldAcceptAlliance(aiPlayer, otherPlayer, personality, gameState) {
  const { allianceLikelihood, sentiment, allianceThreshold } = getEffectiveLikelihoods(aiPlayer, otherPlayer.id, gameState || {});
  if (sentiment < (personality?.grievanceThreshold ?? -40)) return false; // hates them
  return Math.random() < allianceLikelihood;
}

export function shouldDeclareWar(aiPlayer, targetPlayer, personality, gameState) {
  const { warLikelihood, sentiment, grievanceThreshold } = getEffectiveLikelihoods(aiPlayer, targetPlayer?.id, gameState || {});
  if (sentiment < grievanceThreshold) return Math.random() < Math.min(0.9, warLikelihood * 1.5); // extra aggressive when hated
  return Math.random() < warLikelihood;
}

/**
 * Tick influence modifiers down by 1 turn for all AI players.
 */
export function tickInfluenceModifiers(players) {
  return players.map(p => {
    if (!p.influenceModifiers) return p;
    return {
      ...p,
      influenceModifiers: p.influenceModifiers
        .map(m => ({ ...m, turnsRemaining: m.turnsRemaining - 1 }))
        .filter(m => m.turnsRemaining > 0),
    };
  });
}

/**
 * Get sentiment label and color for display.
 */
export function getSentimentLabel(sentiment) {
  if (sentiment >= 60) return { label: 'Devoted Ally', color: '#4ade80', icon: '💚' };
  if (sentiment >= 35) return { label: 'Friendly', color: '#86efac', icon: '🤝' };
  if (sentiment >= 10) return { label: 'Cordial', color: '#bef264', icon: '😊' };
  if (sentiment >= -10) return { label: 'Neutral', color: '#fbbf24', icon: '😐' };
  if (sentiment >= -35) return { label: 'Wary', color: '#fb923c', icon: '😠' };
  if (sentiment >= -60) return { label: 'Hostile', color: '#f87171', icon: '😡' };
  return { label: 'At War', color: '#dc2626', icon: '⚔️' };
}