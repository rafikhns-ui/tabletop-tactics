import { TERRITORIES, ADJACENCY, FACTIONS, LEADERS, HEROES, OBJECTIVES, BUILDING_DEFS, TERRAIN_MOVEMENT_COSTS, UNIT_DEFS } from './ardoniaData';
import { generateWorldMap } from './hexWorldGenerator';

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
      mine:        { ...BUILDING_DEFS.mine,        level: 1, disabled: false },
      lumber_mill: { ...BUILDING_DEFS.lumber_mill, level: 1, disabled: false },
      farm:        { ...BUILDING_DEFS.farm,        level: 1, disabled: false },
      treasury:    { ...BUILDING_DEFS.treasury,    level: 1, disabled: false },
    },
    heroes: [],
    heroStatus: {},
    actionCards: [],
    activeTradeDeals: [],
    activeAvatar: null,
    leaderActive: true,
    troopsToDeploy: 5,
  };
};

// ---- Initial game state ----
export const createGameState = (mode, playersArr = null) => {  let players;

  if (playersArr) {
    // Build from FactionSelect output
    players = playersArr.map((p, i) => {
      const aiIndex = playersArr.slice(0, i).filter(x => x.isAI).length;
      const name = p.isAI ? (AI_NAMES[aiIndex] || `AI ${aiIndex + 1}`) : PLAYER_NAMES[i];
      return createPlayer(p.id, name, p.factionId, p.isAI, p.leaderIndex, p.objectives);
    });
  } else {
    // Legacy / fallback
    const p1f = 'onishiman';
    const p2f = mode === 'ai' ? 'sultanate' : 'kadjimaran';
    players = mode === 'ai'
      ? [createPlayer('p1', 'Player 1', p1f, false, 0), createPlayer('ai', 'Shadow Lord', p2f, true, 0)]
      : [createPlayer('p1', 'Player 1', p1f, false, 0), createPlayer('p2', 'Player 2', p2f, false, 0)];
  }

  // Initialize hexes from the JSON map, assigning ownership by sourceFaction
  const generatedHexWorld = generateWorldMap();

    // Build a map from factionId -> playerId
    const factionToPlayer = {};
    players.forEach(p => { if (p.factionId) factionToPlayer[p.factionId] = p.id; });

    // Find first non-water hex per faction (capital)
    const capitalsByFaction = {};
    Object.entries(generatedHexWorld).forEach(([id, hex]) => {
      const sf = hex.sourceFaction;
      if (sf && !capitalsByFaction[sf] && hex.type !== 'water') {
        capitalsByFaction[sf] = id;
      }
    });

    // Helper: get neighbors of a hex
    const getHexNeighbors = (hexId) => {
      const [col, row] = hexId.split(',').map(Number);
      const even = col % 2 === 0;
      return [
        [col+1, even ? row-1 : row], [col+1, even ? row : row+1],
        [col-1, even ? row-1 : row], [col-1, even ? row : row+1],
        [col, row-1], [col, row+1],
      ].map(([c, r]) => `${c},${r}`);
    };

    // Assign starting hexes: capital + immediate neighbors only
    const playerStartingHexes = {};
    Object.entries(capitalsByFaction).forEach(([faction, capitalId]) => {
      const owner = factionToPlayer[faction];
      if (!owner) return;
      playerStartingHexes[owner] = new Set([capitalId]);
      const neighbors = getHexNeighbors(capitalId);
      neighbors.forEach(nId => {
        if (generatedHexWorld[nId] && generatedHexWorld[nId].type !== 'water') {
          playerStartingHexes[owner].add(nId);
        }
      });
    });

    const hexes = {};
    Object.entries(generatedHexWorld).forEach(([id, hex]) => {
      let owner = null;
      let isCapital = false;
      // Only assign owner if hex is in the starting hexes for this player
      for (const [playerId, hexSet] of Object.entries(playerStartingHexes)) {
        if (hexSet.has(id)) {
          owner = playerId;
          isCapital = capitalsByFaction[hex.sourceFaction] === id;
          break;
        }
      }
      hexes[id] = {
        ...hex,
        owner,
        units: [],
        hasFortress: false,
        isCapital,
      };
    });

    // Deploy starting units: 1 elite on capital, 3 infantry spread across owned hexes
    const infantryDeployed = {}; // playerId -> count
    // First pass: deploy elite on capitals
    Object.entries(hexes).forEach(([id, hex]) => {
      if (hex.isCapital && hex.owner) {
        hexes[id] = { ...hex, units: [{ type: 'elite', count: 1 }] };
      }
    });
    // Second pass: deploy 3 infantry on first 3 non-capital owned hexes per player
    Object.entries(hexes).forEach(([id, hex]) => {
      if (!hex.owner || hex.isCapital || hex.type === 'water') return;
      const count = infantryDeployed[hex.owner] || 0;
      if (count < 3) {
        hexes[id] = { ...hex, units: [{ type: 'infantry', count: 1 }] };
        infantryDeployed[hex.owner] = count + 1;
      }
    });

  // Assign territories based on each territory's faction property
  const factionToPlayerId = {};
  players.forEach(p => { if (p.factionId) factionToPlayerId[p.factionId] = p.id; });

  const territories = {};
  const capitalAssignedTerr = new Set();
  Object.entries(TERRITORIES).forEach(([id, terr]) => {
    const owner = factionToPlayerId[terr.faction] || null;
    let isCapital = false;
    if (owner && !capitalAssignedTerr.has(owner)) {
      isCapital = true;
      capitalAssignedTerr.add(owner);
    }
    territories[id] = {
      ...terr,
      owner,
      troops: owner ? 3 : 1,
      units: [],
      hasFortress: false,
      isCapital,
    };
  });

  return {
    hexes,
    territories,
    adjacency: ADJACENCY,
    players,
    currentPlayerIndex: 0,
    turn: 1,
    mode,
    phase: 'collect',
    log: ['⚜️ Rulers of Ardonia begins! May your reign be glorious.'],
    eventCountdown: 3,
    activeEvent: null,
  };
};

// ---- Income calculation ----
export const calculateIncome = (player, territories) => {
  const mine = player.buildings.mine;
  const lumber_mill = player.buildings.lumber_mill;
  const farm = player.buildings.farm;
  const market = player.buildings.market;
  const temple = player.buildings.temple;

  const ownedTerritories = Object.values(territories).filter(t => t.owner === player.id);
  const territoryGold = ownedTerritories.length; // 1 Gold per territory

  const income = {
    gold: territoryGold + (mine && !mine.disabled ? mine.level : 0) + (market ? 1 : 0),
    wood: (lumber_mill && !lumber_mill.disabled ? lumber_mill.level : 0),
    wheat: (farm && !farm.disabled ? farm.level : 0),
    sp: (temple && !temple.disabled ? temple.level : 0) + (player.factionId === 'sultanate' ? 1 : 0),
    ip: (market ? 1 : 0) + (player.factionId === 'republic' ? 1 : 0),
  };

  // Leader bonuses
  if (player.leaderActive && player.leader) {
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
    // Apply active world event penalties to income
    const crisisPenalty = p.cardEffects?.economic_crisis?.active ? (p.cardEffects.economic_crisis.goldPenalty || 0) : 0;
    // Tick down card effects duration
    const newCardEffects = { ...(p.cardEffects || {}) };
    Object.keys(newCardEffects).forEach(k => {
      if (newCardEffects[k]?.duration > 0) {
        newCardEffects[k] = { ...newCardEffects[k], duration: newCardEffects[k].duration - 1 };
        if (newCardEffects[k].duration <= 0) newCardEffects[k] = { ...newCardEffects[k], active: false };
      }
    });
    return {
      ...p,
      resources: {
        gold: Math.min(maxStorage, Math.max(0, p.resources.gold + income.gold - crisisPenalty)),
        wood: Math.min(maxStorage, p.resources.wood + income.wood),
        wheat: Math.min(maxStorage, p.resources.wheat + income.wheat),
      },
      sp: Math.min(10, p.sp + income.sp),
      ip: Math.min(10, p.ip + income.ip),
      cardEffects: newCardEffects,
    };
  });
  return newState;
};

// ---- Terrain combat modifiers ----
// Returns attack/defense bonus based on terrain and unit composition
export const getTerrainCombatModifiers = (terrain, attackerUnits = [], defenderUnits = []) => {
  let attackBonus = 0;
  let defenseBonus = 0;
  const notes = [];

  const hasType = (units, type) => units.some(u => u.type === type);

  switch (terrain) {
    case 'forest':
      defenseBonus += 1; // forest provides natural cover
      if (hasType(attackerUnits, 'cavalry')) { attackBonus -= 1; notes.push('Cavalry -1 in forest'); }
      if (hasType(defenderUnits, 'ranged'))  { defenseBonus += 1; notes.push('Ranged +1 in forest'); }
      notes.push('Forest: Defender +1');
      break;
    case 'mountain':
    case 'hills':
      defenseBonus += 2; // high ground advantage
      if (hasType(attackerUnits, 'cavalry')) { attackBonus -= 1; notes.push('Cavalry -1 on mountains'); }
      if (hasType(attackerUnits, 'siege'))   { attackBonus += 1; notes.push('Siege +1 vs fortified hills'); }
      notes.push('High ground: Defender +2');
      break;
    case 'plains':
      if (hasType(attackerUnits, 'cavalry')) { attackBonus += 1; notes.push('Cavalry +1 on plains'); }
      break;
    case 'desert':
      attackBonus -= 1; // harsh climate impedes attackers
      notes.push('Desert: Attacker -1');
      break;
    case 'swamp':
      attackBonus -= 1;
      if (hasType(attackerUnits, 'cavalry')) { attackBonus -= 1; notes.push('Cavalry -2 in swamp'); }
      else notes.push('Swamp: Attacker -1');
      break;
    case 'coastal':
    case 'water':
      if (hasType(attackerUnits, 'naval'))   { attackBonus += 1; notes.push('Naval +1 on water'); }
      if (hasType(attackerUnits, 'ranged'))  { attackBonus += 1; notes.push('Ranged +1 at coast'); }
      break;
    case 'tundra':
      if (hasType(attackerUnits, 'cavalry')) { attackBonus -= 1; notes.push('Cavalry -1 in tundra'); }
      break;
    case 'scorched':
      attackBonus += 1; // open, easy terrain
      notes.push('Scorched: Attacker +1');
      break;
    default:
      break;
  }

  return { attackBonus, defenseBonus, notes };
};

// ---- Combat resolution ----
export const calculateUnitBonuses = (units) => {
  // Units boost attack/defense based on type
  let attackBonus = 0, defenseBonus = 0;
  (units || []).forEach(u => {
    if (u.type === 'cavalry') attackBonus += 2;
    if (u.type === 'elite') { attackBonus += 3; defenseBonus += 1; }
    if (u.type === 'ranged') attackBonus += 1;
    if (u.type === 'siege') attackBonus += 2;
  });
  return { attackBonus, defenseBonus };
};

export const resolveBattle = (attackerUnits, defenderUnits, hasDefenderFortress, bonuses = {}, defenderTerrain = null) => {
  const terrainMods = defenderTerrain
    ? getTerrainCombatModifiers(defenderTerrain, attackerUnits, defenderUnits)
    : { attackBonus: 0, defenseBonus: 0, notes: [] };

  // Count total troops
  const attackerTroops = attackerUnits.reduce((s, u) => s + u.count, 0);
  const defenderTroops = defenderUnits.reduce((s, u) => s + u.count, 0);
  
  const attackDice = Math.min(3, Math.max(1, attackerTroops - 1));
  const defendDice = Math.min(2, defenderTroops);
  const aRolls = rollDice(attackDice);
  const dRolls = rollDice(defendDice);

  const unitAttackBonus = calculateUnitBonuses(attackerUnits);
  const unitDefenseBonus = calculateUnitBonuses(defenderUnits);

  const aBonus = (bonuses.attackBonus || 0) + unitAttackBonus.attackBonus + terrainMods.attackBonus;
  const dBonus = (bonuses.defenseBonus || 0) + unitDefenseBonus.defenseBonus + (hasDefenderFortress ? 3 : 0) + terrainMods.defenseBonus;

  let attackerLosses = 0;
  let defenderLosses = 0;
  const pairs = Math.min(aRolls.length, dRolls.length);
  for (let i = 0; i < pairs; i++) {
    if ((aRolls[i] + aBonus) > (dRolls[i] + dBonus)) defenderLosses++;
    else attackerLosses++;
  }

  return { aRolls, dRolls, attackerLosses, defenderLosses, attackDice, aBonus, dBonus, terrainNotes: terrainMods.notes, terrain: defenderTerrain };
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
  const ai = state.players[state.currentPlayerIndex];
  if (!ai || !ai.isAI) return state;

  const difficulty = ai.difficulty || 'normal';
  const logs = [];

  // Difficulty parameters
  // easy:   won't attack unless very safe, skips sometimes, no bonus
  // normal: standard aggression
  // hard:   attacks more, gets attack/defense bonus, smarter targeting
  const skipChance = difficulty === 'easy' ? 0.35 : 0;
  const minAdvantage = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 1.3 : 2;
  const attackBonus = difficulty === 'hard' ? 1 : 0;
  const maxAttacks = difficulty === 'hard' ? 3 : 1;

  // 1. Deploy troops
  let bestDeploy = null, bestScore = -1;
  Object.values(state.territories).forEach(t => {
    if (t.owner !== ai.id) return;
    const enemies = (ADJACENCY[t.id] || []).filter(n => state.territories[n]?.owner !== ai.id).length;
    // Hard: also value territories near enemy capitals
    let score = enemies;
    if (difficulty === 'hard') {
      const nearCapital = (ADJACENCY[t.id] || []).some(n => state.territories[n]?.isCapital && state.territories[n]?.owner !== ai.id);
      if (nearCapital) score += 3;
    }
    if (score > bestScore) { bestScore = score; bestDeploy = t.id; }
  });
  if (bestDeploy && ai.troopsToDeploy > 0) {
    state.territories[bestDeploy] = { ...state.territories[bestDeploy], troops: state.territories[bestDeploy].troops + ai.troopsToDeploy };
    state.players = state.players.map(p => p.id === ai.id ? { ...p, troopsToDeploy: 0 } : p);
    logs.push(`🤖 AI deployed ${ai.troopsToDeploy} troops`);
  }

  // 2. Attack (difficulty-gated)
  if (Math.random() >= skipChance) {
    const myTerrs = Object.values(state.territories)
      .filter(t => t.owner === ai.id)
      .sort((a, b) => b.troops - a.troops);

    let attacksDone = 0;
    for (const from of myTerrs) {
      if (attacksDone >= maxAttacks) break;
      const fromTroops = from.units?.reduce((s, u) => s + u.count, 0) || from.troops || 0;
      if (fromTroops < 2) continue;

      let targets = (ADJACENCY[from.id] || [])
        .map(id => state.territories[id])
        .filter(t => {
          if (!t || t.owner === ai.id) return false;
          const targetTroops = t.units?.reduce((s, u) => s + u.count, 0) || t.troops || 0;
          return fromTroops >= targetTroops * minAdvantage;
        });

      if (difficulty === 'hard') {
        // Prioritize capitals and weakest enemies
        targets.sort((a, b) => {
          const aScore = (a.isCapital ? -100 : 0) + (a.units?.reduce((s, u) => s + u.count, 0) || a.troops || 0);
          const bScore = (b.isCapital ? -100 : 0) + (b.units?.reduce((s, u) => s + u.count, 0) || b.troops || 0);
          return aScore - bScore;
        });
      } else {
        targets.sort((a, b) => (a.units?.reduce((s, u) => s + u.count, 0) || 0) - (b.units?.reduce((s, u) => s + u.count, 0) || 0));
      }

      if (targets.length > 0) {
        const target = targets[0];
        const defenderTroops = target.units?.reduce((s, u) => s + u.count, 0) || target.troops || 0;
        const result = resolveBattle(
          from.units?.length > 0 ? from.units : [{ type: 'infantry', count: fromTroops }],
          target.units?.length > 0 ? target.units : [{ type: 'infantry', count: defenderTroops }],
          target.hasFortress,
          { attackBonus }
        );
        const conquered = result.defenderLosses >= defenderTroops;
        state = executeAttack(state, from.id, target.id, result);
        if (conquered) {
          logs.push(`conquest:${ai.id}:${ai.name} conquered ${target.name || target.id}! (lost ${result.attackerLosses}, enemy lost ${result.defenderLosses})`);
        } else {
          logs.push(`attack:${ai.id}:${ai.name} attacked ${target.name || target.id} (lost ${result.attackerLosses}, enemy lost ${result.defenderLosses})`);
        }
        attacksDone++;
      }
    }
  }

  // 3. Hard AI: spend resources on buildings
  if (difficulty === 'hard') {
    state.players = state.players.map(p => {
      if (p.id !== ai.id) return p;
      const resources = { ...p.resources };
      const buildings = { ...p.buildings };
      // Upgrade mine if affordable
      if ((resources.gold || 0) >= 4 && buildings.mine && buildings.mine.level < 3) {
        resources.gold -= 4;
        buildings.mine = { ...buildings.mine, level: buildings.mine.level + 1 };
      }
      return { ...p, resources, buildings };
    });
  }

  // 4. SP gain
  if (ai.sp < 10) {
    const spGain = difficulty === 'hard' ? 2 : 1;
    state.players = state.players.map(p => p.id === ai.id ? { ...p, sp: Math.min(10, p.sp + spGain) } : p);
  }

  state.log = [...(state.log || []).slice(-10), ...logs];
  return state;
};

// ---- World Event Effects ----
export const applyEventEffect = (gameState, event) => {
  let state = { ...gameState, players: gameState.players.map(p => ({ ...p })) };

  switch (event.id) {
    case 'famine': {
      // All players lose 2 Wheat; units in hexes with no owner lose 1 troop
      state.players = state.players.map(p => ({
        ...p,
        resources: { ...p.resources, wheat: Math.max(0, (p.resources.wheat || 0) - 2) },
      }));
      // Units in unclaimed hexes lose 1 troop (simulate supply cut)
      const newHexes = { ...state.hexes };
      Object.entries(newHexes).forEach(([id, h]) => {
        if (h.units?.length > 0) {
          const newUnits = h.units
            .map(u => ({ ...u, count: Math.max(0, u.count - 1) }))
            .filter(u => u.count > 0);
          newHexes[id] = { ...h, units: newUnits };
        }
      });
      state.hexes = newHexes;
      break;
    }
    case 'gold_rush': {
      state.players = state.players.map(p => ({
        ...p,
        resources: { ...p.resources, gold: (p.resources.gold || 0) + 3 },
      }));
      break;
    }
    case 'spiritual_surge': {
      state.players = state.players.map(p => ({
        ...p,
        sp: Math.min(15, (p.sp || 0) + 2),
        activeAvatar: p.activeAvatar ? { ...p.activeAvatar, duration: p.activeAvatar.duration + 1 } : null,
      }));
      break;
    }
    case 'economic_crisis': {
      state.players = state.players.map(p => ({
        ...p,
        resources: { ...p.resources, gold: Math.max(0, (p.resources.gold || 0) - 3) },
        cardEffects: { ...(p.cardEffects || {}), economic_crisis: { duration: 2, active: true, goldPenalty: 1 } },
      }));
      break;
    }
    case 'revolution': {
      // Each player pays 3 Gold or loses control of one owned hex
      const hexKeys = Object.keys(state.hexes);
      state.players = state.players.map(p => {
        const gold = p.resources.gold || 0;
        if (gold >= 3) {
          return { ...p, resources: { ...p.resources, gold: gold - 3 } };
        } else {
          // Lose control of a random owned hex
          const ownedHex = hexKeys.find(id => state.hexes[id]?.owner === p.id);
          if (ownedHex) {
            state.hexes = { ...state.hexes, [ownedHex]: { ...state.hexes[ownedHex], owner: null } };
          }
          return p;
        }
      });
      break;
    }
    case 'mercenary_wave': {
      // Each player gets 1 free infantry added to pending
      state.players = state.players.map(p => ({
        ...p,
        pendingUnits: [...(p.pendingUnits || []), 'infantry'],
      }));
      break;
    }
    case 'plague': {
      // Mark all heroes as exhausted for this turn
      state.players = state.players.map(p => {
        const heroStatus = { ...(p.heroStatus || {}) };
        (p.heroes || []).forEach(hId => {
          heroStatus[hId] = { ...(heroStatus[hId] || {}), exhausted: true };
        });
        return { ...p, heroStatus };
      });
      break;
    }
    case 'peace_treaty': {
      // Flag: no attacks allowed this turn (checked in handleTerritoryClick)
      state.peaceTreatyActive = true;
      break;
    }
    default:
      break;
  }

  // Store active event for UI/income effects
  state.activeWorldEvent = { ...event, turnsRemaining: event.duration || 0 };
  return state;
};

// ---- Hex neighbor helper ----
const getHexNeighborIds = (hexId) => {
  const [gc, gr] = hexId.split(',').map(Number);
  const even = gc % 2 === 0;
  return [
    [gc+1, even ? gr-1 : gr], [gc+1, even ? gr : gr+1],
    [gc-1, even ? gr-1 : gr], [gc-1, even ? gr : gr+1],
    [gc, gr-1], [gc, gr+1],
  ].map(([c, r]) => `${c},${r}`);
};

// ---- AI Turn as sequential steps (for real-time visualization) ----
export const getAiTurnSteps = (gameState) => {
  const steps = [];
  let state = { ...gameState, hexes: { ...gameState.hexes } };
  const ai = state.players[state.currentPlayerIndex];
  if (!ai?.isAI) return [];

  const difficulty = ai.difficulty || 'normal';
  const attackBonusVal = difficulty === 'hard' ? 1 : 0;
  const minAdvantage = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 1.3 : 2;
  const skipChance = difficulty === 'easy' ? 0.35 : 0;
  const maxAttacks = difficulty === 'hard' ? 3 : 1;

  // Step 1: Deploy pending units to the best hex
  const pendingUnits = ai.pendingUnits || [];
  if (pendingUnits.length > 0) {
    let bestHex = null, bestScore = -1;
    Object.entries(state.hexes).forEach(([id, h]) => {
      if (h.owner !== ai.id) return;
      const enemyNeighbors = getHexNeighborIds(id).filter(nid => {
        const nh = state.hexes[nid];
        return nh && nh.owner && nh.owner !== ai.id;
      }).length;
      if (enemyNeighbors > bestScore) { bestScore = enemyNeighbors; bestHex = id; }
    });
    if (!bestHex) bestHex = Object.keys(state.hexes).find(id => state.hexes[id].owner === ai.id);
    if (bestHex) {
      const hex = state.hexes[bestHex];
      const hexUnits = [...(hex.units || [])];
      pendingUnits.forEach(unitType => {
        const existing = hexUnits.find(u => u.type === unitType);
        if (existing) existing.count += 1;
        else hexUnits.push({ type: unitType, count: 1 });
      });
      state = {
        ...state,
        hexes: { ...state.hexes, [bestHex]: { ...hex, units: hexUnits } },
        players: state.players.map(p => p.id === ai.id ? { ...p, pendingUnits: [] } : p),
      };
      steps.push({ state: { ...state, hexes: { ...state.hexes } }, message: `🤖 ${ai.name} deploys troops` });
    }
  }

  // Step 2: Attack adjacent enemy hexes
  if (Math.random() >= skipChance) {
    const aiHexes = Object.entries(state.hexes)
      .filter(([, h]) => h.owner === ai.id)
      .sort((a, b) => {
        const au = b[1].units?.reduce((s, u) => s + u.count, 0) || 0;
        const bu = a[1].units?.reduce((s, u) => s + u.count, 0) || 0;
        return au - bu;
      });

    let attacksDone = 0;
    for (const [fromId, fromHex] of aiHexes) {
      if (attacksDone >= maxAttacks) break;
      const fromCount = fromHex.units?.reduce((s, u) => s + u.count, 0) || 0;
      if (fromCount < 2) continue;

      const targets = getHexNeighborIds(fromId)
        .map(nid => [nid, state.hexes[nid]])
        .filter(([, nh]) => nh && nh.owner && nh.owner !== ai.id)
        .filter(([, nh]) => {
          const defCount = nh.units?.reduce((s, u) => s + u.count, 0) || 0;
          return defCount === 0 || fromCount >= defCount * minAdvantage;
        });

      if (targets.length > 0) {
        const [targetId, targetHex] = targets[0];
        const defCount = targetHex.units?.reduce((s, u) => s + u.count, 0) || 0;
        const fromUnits = fromHex.units?.length > 0 ? fromHex.units : [{ type: 'infantry', count: fromCount }];
        const defUnits = targetHex.units?.length > 0 ? targetHex.units : [{ type: 'infantry', count: Math.max(1, defCount) }];
        const result = resolveBattle(fromUnits, defUnits, targetHex.buildings?.fortress, { attackBonus: attackBonusVal });
        const conquered = result.defenderLosses >= defCount || defCount === 0;

        let newHexes = { ...state.hexes };
        const newFromUnits = fromUnits
          .map(u => ({ ...u, count: Math.max(0, u.count - result.attackerLosses) }))
          .filter(u => u.count > 0);

        if (conquered) {
          const movedCount = Math.max(1, Math.floor((newFromUnits.reduce((s, u) => s + u.count, 0)) / 2));
          const movedUnits = [{ type: (newFromUnits[0]?.type || 'infantry'), count: movedCount }];
          const remainUnits = newFromUnits.map(u => ({ ...u, count: Math.max(1, u.count - movedCount) }));
          newHexes[targetId] = { ...targetHex, units: movedUnits, owner: ai.id };
          newHexes[fromId] = { ...fromHex, units: remainUnits };
        } else {
          const newDefUnits = defUnits
            .map(u => ({ ...u, count: Math.max(0, u.count - result.defenderLosses) }))
            .filter(u => u.count > 0);
          newHexes[targetId] = { ...targetHex, units: newDefUnits };
          newHexes[fromId] = { ...fromHex, units: newFromUnits };
        }

        state = { ...state, hexes: newHexes };
        steps.push({
          state: { ...state },
          message: conquered
            ? `⚔️ ${ai.name} conquered a territory!`
            : `⚔️ ${ai.name} attacked (A:-${result.attackerLosses} D:-${result.defenderLosses})`,
        });
        attacksDone++;
      }
    }
  }

  return steps;
};

export const getTerritoryCount = (territories, playerId) =>
  Object.values(territories).filter(t => t.owner === playerId).length;

// ---- Movement System ----
// Calculate movement cost for a unit to enter a tile
export const getMovementCost = (fromTerr, toTerr, unitType, playerFactionId) => {
  let cost = 1;
  const terrainCost = TERRAIN_MOVEMENT_COSTS?.[toTerr.biome] || 0;
  cost += terrainCost;
  if ((toTerr.biome === 'forest' && playerFactionId === 'oakhaven') ||
      (toTerr.biome === 'desert' && playerFactionId === 'kadjimaran')) {
    cost -= 1;
  }
  return Math.max(1, cost);
};

// Get all reachable territories from a starting point given movement range
export const getReachableTerritories = (startTerritoryId, movementRange, gameState, playerId, unitType) => {
  const reachable = new Set();
  const toExplore = [{ id: startTerritoryId, costRemaining: movementRange }];
  const visited = new Set();

  while (toExplore.length > 0) {
    const { id, costRemaining } = toExplore.shift();
    
    if (visited.has(id)) continue;
    visited.add(id);

    if (costRemaining >= 0) {
      reachable.add(id);
      
      // Explore adjacent tiles
      const adjacent = ADJACENCY[id] || [];
      adjacent.forEach(adjId => {
        if (!visited.has(adjId)) {
          const adjTerritory = gameState.territories[adjId];
          const fromTerritory = gameState.territories[id];
          const moveCost = getMovementCost(fromTerritory, adjTerritory, unitType, gameState.players.find(p => p.id === playerId)?.factionId);
          
          if (costRemaining - moveCost >= 0) {
            toExplore.push({ id: adjId, costRemaining: costRemaining - moveCost });
          }
        }
      });
    }
  }

  return reachable;
};

// Move unit and resolve conquest if applicable
export const moveUnit = (gameState, fromTerritoryId, toTerritoryId, unitId) => {
  const newState = { ...gameState };
  newState.territories = { ...newState.territories };
  
  const fromTerritory = { ...newState.territories[fromTerritoryId] };
  const toTerritory = { ...newState.territories[toTerritoryId] };
  
  // Remove unit from source
  fromTerritory.units = (fromTerritory.units || []).filter(u => u.id !== unitId);
  fromTerritory.troops = fromTerritory.units.reduce((s, u) => s + u.count, 0);
  
  // Add unit to destination
  toTerritory.units = [...(toTerritory.units || []), { id: unitId, count: 1 }];
  toTerritory.troops = toTerritory.units.reduce((s, u) => s + u.count, 0);
  
  // If destination is neutral or enemy, unit attempts conquest
  const currentPlayerId = gameState.players[gameState.currentPlayerIndex].id;
  if (toTerritory.owner !== currentPlayerId && toTerritory.owner !== null) {
    // Enemy territory - battle required (set battle flag)
    newState.pendingBattle = { attacker: unitId, defender: toTerritoryId };
  } else if (toTerritory.owner === null) {
    // Neutral territory - conquered
    toTerritory.owner = currentPlayerId;
  }
  
  newState.territories[fromTerritoryId] = fromTerritory;
  newState.territories[toTerritoryId] = toTerritory;
  
  return newState;
};