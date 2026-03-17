import { TERRITORIES, ADJACENCY, FACTIONS, LEADERS, HEROES, OBJECTIVES, BUILDING_DEFS } from './ardoniaData';

// ---- Hero passive bonus helpers ----
export const getHeroPassivesForPlayer = (player, territories) => {
  // Collect all passive effects from all owned heroes (not imprisoned/exhausted)
  const bonuses = { attackBonus: 0, defenseBonus: 0, ipPerTurn: 0, spPerTurn: 0, goldPerTurn: 0, woodPerTurn: 0 };
  (player.heroes || []).forEach(heroId => {
    const hero = HEROES[heroId];
    if (!hero || !hero.passiveEffect) return;
    const status = player.heroStatus?.[heroId];
    if (status?.imprisoned || status?.exhausted) return;
    Object.entries(hero.passiveEffect).forEach(([k, v]) => {
      if (bonuses[k] !== undefined) bonuses[k] += v;
    });
  });
  return bonuses;
};

export const getHeroCombatBonus = (territories, territoryId, playerId) => {
  // Returns attack/defense bonus from a hero assigned to that specific territory
  const territory = territories[territoryId];
  if (!territory || !territory.heroId) return { attackBonus: 0, defenseBonus: 0 };
  const heroId = territory.heroId;
  const hero = HEROES[heroId];
  if (!hero?.passiveEffect) return { attackBonus: 0, defenseBonus: 0 };
  return {
    attackBonus: hero.passiveEffect.attackBonus || 0,
    defenseBonus: hero.passiveEffect.defenseBonus || 0,
  };
};

// ---- Dice rolling ----
export const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;
export const rollDice = (count, sides = 6) =>
  Array.from({ length: count }, () => rollDie(sides)).sort((a, b) => b - a);

// ---- Shuffle ----
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const PLAYER_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
const AI_NAMES = ['Shadow Lord', 'Dark Warlord', 'Iron Khan', 'Void Emperor'];

// ---- Create initial player ----
const createPlayer = (id, name, factionId, isAI = false, leaderIndex = 0, presetObjectives = null) => {
  const faction = FACTIONS[factionId];
  const leaderOptions = LEADERS[factionId] || [];
  const leader = leaderOptions[leaderIndex] || leaderOptions[0];
  const objectives = presetObjectives || shuffle(OBJECTIVES).slice(0, 2);

  return {
    id,
    name,
    factionId,
    faction,
    color: faction?.color || '#888',
    isAI,
    leader,
    objectives,
    completedObjectives: [],
    resources: { gold: 5, wood: 3, wheat: 3 },
    ip: 2,
    sp: 0,
    crystals: 0,
    buildings: {
      mine:     { ...BUILDING_DEFS.mine,     level: 1, disabled: false },
      sawmill:  { ...BUILDING_DEFS.sawmill,  level: 1, disabled: false },
      field:    { ...BUILDING_DEFS.field,    level: 1, disabled: false },
      treasury: { ...BUILDING_DEFS.treasury, level: 1, disabled: false },
    },
    heroes: ['warrior_bran'],
    heroStatus: { warrior_bran: { exhausted: false, imprisoned: false } },
    actionCards: [],
    activeTradeDeals: [],
    activeAvatar: null,
    leaderActive: true,
    troopsToDeploy: 5,
  };
};

// ---- Initial game state ----
export const createGameState = (mode, choices = {}, playersArr = null) => {
  let players;

  if (playersArr) {
    // Build from FactionSelect output
    players = playersArr.map((p, i) => {
      const aiIndex = playersArr.slice(0, i).filter(x => x.isAI).length;
      const name = p.isAI ? (AI_NAMES[aiIndex] || `AI ${aiIndex + 1}`) : PLAYER_NAMES[i];
      return createPlayer(p.id, name, p.factionId, p.isAI, p.leaderIndex, p.objectives);
    });
  } else {
    // Legacy / fallback
    const p1f = choices.p1?.factionId || 'onishiman';
    const p2f = choices.p2?.factionId || (mode === 'ai' ? 'sultanate' : 'kadjimaran');
    players = mode === 'ai'
      ? [createPlayer('p1', 'Player 1', p1f, false, 0), createPlayer('ai', 'Shadow Lord', p2f, true, 0)]
      : [createPlayer('p1', 'Player 1', p1f, false, 0), createPlayer('p2', 'Player 2', p2f, false, 0)];
  }

  // Distribute territories evenly among all players
  const ids = shuffle(Object.keys(TERRITORIES));
  const territories = {};
  ids.forEach((id, i) => {
    const owner = players[i % players.length].id;
    territories[id] = {
      ...TERRITORIES[id],
      owner,
      troops: 2,
      fortified: false,
      isCapital: false,
    };
  });
  // Mark first territory of each player as capital
  players.forEach((p, pi) => {
    const firstId = ids[pi];
    if (firstId) territories[firstId].isCapital = true;
  });

  return {
    territories,
    adjacency: ADJACENCY,
    players,
    currentPlayerIndex: 0,
    turn: 1,
    mode,
    phase: 'collect', // collect → build → move → action → end
    log: ['⚜️ Rulers of Ardonia begins! May your reign be glorious.'],
    eventCountdown: 3,
    activeEvent: null,
  };
};

// ---- Income calculation ----
export const calculateIncome = (player, territories) => {
  const mine = player.buildings.mine;
  const sawmill = player.buildings.sawmill;
  const field = player.buildings.field;
  const market = player.buildings.market;
  const temple = player.buildings.temple;

  const ownedTerritories = Object.values(territories).filter(t => t.owner === player.id);
  const territoryGold = ownedTerritories.length; // 1 Gold per territory

  const income = {
    gold: territoryGold + (mine && !mine.disabled ? mine.level : 0) + (market ? 1 : 0),
    wood: (sawmill && !sawmill.disabled ? sawmill.level : 0),
    wheat: (field && !field.disabled ? field.level : 0),
    sp: (temple && !temple.disabled ? temple.level : 0) + (player.factionId === 'sultanate' ? 1 : 0),
    ip: (market ? 1 : 0) + (player.factionId === 'republic' ? 1 : 0),
  };

  // Leader bonuses
  if (player.leaderActive) {
    if (player.leader.id === 'iron_chancellor') income.gold += 2;
    if (player.leader.id === 'merchant_sultan' && market) income.gold += 1;
    if (player.leader.id === 'sun_king') income.wheat += 2;
    if (player.leader.id === 'grand_mufti') income.sp += 2;
    if (player.leader.id === 'senator_clio') income.ip += player.activeTradeDeals?.length || 0;
  }

  // Active trade deals
  (player.activeTradeDeals || []).forEach(deal => {
    income.gold += deal.goldPerTurn || 0;
  });

  // Hero passive bonuses
  const heroBonuses = getHeroPassivesForPlayer(player, territories);
  income.gold += heroBonuses.goldPerTurn;
  income.wood += heroBonuses.woodPerTurn;
  income.ip += heroBonuses.ipPerTurn;
  income.sp += heroBonuses.spPerTurn;

  return income;
};

// ---- Collect income ----
export const collectIncome = (gameState) => {
  const newState = { ...gameState };
  newState.players = gameState.players.map(p => {
    const income = calculateIncome(p, gameState.territories);
    const maxStorage = 10 + (p.buildings.treasury?.level || 1) * 5;
    return {
      ...p,
      resources: {
        gold: Math.min(maxStorage, p.resources.gold + income.gold),
        wood: Math.min(maxStorage, p.resources.wood + income.wood),
        wheat: Math.min(maxStorage, p.resources.wheat + income.wheat),
      },
      sp: Math.min(10, p.sp + income.sp),
      ip: Math.min(10, p.ip + income.ip),
    };
  });
  return newState;
};

// ---- Combat resolution ----
export const resolveBattle = (attackerTroops, defenderTroops, isDefenderFortified, bonuses = {}) => {
  const attackDice = Math.min(3, attackerTroops - 1);
  const defendDice = Math.min(2, defenderTroops);
  const aRolls = rollDice(attackDice);
  const dRolls = rollDice(defendDice);

  // Apply bonuses
  const aBonus = bonuses.attackBonus || 0;
  const dBonus = (bonuses.defenseBonus || 0) + (isDefenderFortified ? 1 : 0);

  const aBest = (aRolls[0] || 0) + aBonus;
  const dBest = (dRolls[0] || 0) + dBonus;

  let attackerLosses = 0;
  let defenderLosses = 0;
  const pairs = Math.min(aRolls.length, dRolls.length);
  for (let i = 0; i < pairs; i++) {
    if ((aRolls[i] + aBonus) > (dRolls[i] + dBonus)) defenderLosses++;
    else attackerLosses++;
  }

  return { aRolls, dRolls, attackerLosses, defenderLosses, attackDice, aBonus, dBonus };
};

export const executeAttack = (gameState, attackerId, defenderId, result) => {
  const newState = { ...gameState };
  newState.territories = { ...newState.territories };
  const attacker = { ...newState.territories[attackerId] };
  const defender = { ...newState.territories[defenderId] };

  attacker.troops = Math.max(1, attacker.troops - result.attackerLosses);
  defender.troops = Math.max(0, defender.troops - result.defenderLosses);

  if (defender.troops <= 0) {
    const movedTroops = Math.max(1, Math.min(attacker.troops - 1, result.attackDice));
    defender.owner = attacker.owner;
    defender.troops = movedTroops;
    attacker.troops -= movedTroops;
    // Check if capital captured
    if (defender.isCapital) {
      newState.log = [...(newState.log || []), `🏰 Capital ${defender.name} has been captured!`];
    }
  }

  newState.territories[attackerId] = attacker;
  newState.territories[defenderId] = defender;
  return newState;
};

// ---- Objective checking ----
export const checkObjective = (obj, player, gameState) => {
  const owned = Object.values(gameState.territories).filter(t => t.owner === player.id);
  switch (obj.id) {
    case 'conquer_3': return owned.length >= 12;
    case 'destroy_capital': return Object.values(gameState.territories).some(t => t.isCapital && t.owner === player.id && !gameState.players.find(p => p.id !== player.id && Object.values(gameState.territories).some(t2 => t2.isCapital && t2.owner === p.id && t2.id === t.id)));
    case 'fortified_city': return owned.filter(t => t.biome === 'mountain').length >= 2;
    case 'amass_gold': return player.resources.gold >= 20;
    case 'trade_agreements': return (player.activeTradeDeals || []).length >= 2;
    case 'upgrade_3_buildings': return Object.values(player.buildings).filter(b => b.level >= 2).length >= 3;
    case 'form_alliance': return false; // diplomacy system
    case 'ip_dominance': return player.ip >= 8;
    case 'summon_avatar': return player.completedObjectives?.includes('summon_avatar');
    case 'sp_accumulate': return player.sp >= 10;
    default: return false;
  }
};

// ---- AI Turn ----
export const doAiTurn = (gameState) => {
  let state = { ...gameState };
  state.territories = { ...state.territories };
  // Use the CURRENT player (who must be AI)
  const ai = state.players[state.currentPlayerIndex];
  if (!ai || !ai.isAI) return state;

  const logs = [];

  // 1. Collect income (already done in main flow)
  // 2. Deploy troops to best border territory
  let bestDeploy = null, bestScore = -1;
  Object.values(state.territories).forEach(t => {
    if (t.owner !== ai.id) return;
    const enemies = (ADJACENCY[t.id] || []).filter(n => state.territories[n].owner !== ai.id).length;
    if (enemies > bestScore) { bestScore = enemies; bestDeploy = t.id; }
  });
  if (bestDeploy && ai.troopsToDeploy > 0) {
    state.territories[bestDeploy] = { ...state.territories[bestDeploy], troops: state.territories[bestDeploy].troops + ai.troopsToDeploy };
    state.players = state.players.map(p => p.id === ai.id ? { ...p, troopsToDeploy: 0 } : p);
    logs.push(`🤖 AI deployed ${ai.troopsToDeploy} troops to ${state.territories[bestDeploy].name}`);
  }

  // 3. Attack best target
  const myTerrs = Object.values(state.territories).filter(t => t.owner === ai.id).sort((a, b) => b.troops - a.troops);
  for (const from of myTerrs) {
    if (from.troops < 3) continue;
    const targets = (ADJACENCY[from.id] || []).map(id => state.territories[id]).filter(t => t.owner !== ai.id && from.troops > t.troops + 1);
    if (targets.length > 0) {
      const target = targets.sort((a, b) => a.troops - b.troops)[0];
      const result = resolveBattle(from.troops, target.troops, target.fortified);
      state = executeAttack(state, from.id, target.id, result);
      logs.push(`🤖 AI attacked ${target.name} from ${from.name}!`);
      break;
    }
  }

  // 4. Gather SP passively
  if (ai.sp < 10) {
    state.players = state.players.map(p => p.id === ai.id ? { ...p, sp: Math.min(10, p.sp + 1) } : p);
  }

  state.log = [...(state.log || []).slice(-10), ...logs];
  return state;
};

export const getTerritoryCount = (territories, playerId) =>
  Object.values(territories).filter(t => t.owner === playerId).length;