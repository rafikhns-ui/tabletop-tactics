import { TERRITORIES, ADJACENCY, FACTIONS, LEADERS, HEROES, OBJECTIVES, BUILDING_DEFS, TERRAIN_MOVEMENT_COSTS, UNIT_DEFS, FACTION_TO_NATION_ID, FACTION_CAPITAL_HEX } from './ardoniaData';
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

    // Build a map from factionId -> playerId & expected nationId
    const factionToPlayer = {};
    const factionToNation = {};
    players.forEach(p => { 
      if (p.factionId) {
        factionToPlayer[p.factionId] = p.id;
        factionToNation[p.factionId] = FACTION_TO_NATION_ID[p.factionId] || p.factionId;
      }
    });

    // Find first non-water hex per faction (capital) — use nation_id -> faction mapping
    // Find capital: the center hex of each nation's LAND territory
    // Land hexes use h.type === 'land' (not terrain names) in generateWorldMap
    const PLAYABLE_LAND_TYPES = new Set(['plains', 'forest', 'mountain', 'hills', 'desert', 'swamp', 'tundra', 'scorched']);
    const isLandHex = (h) => h.type === 'land';
    const capitalsByFaction = {};
    players.forEach(p => {
      if (!p.factionId) return;
      const nationId = factionToNation[p.factionId];
      const landHexes = Object.entries(generatedHexWorld).filter(
        ([, h]) => h.nation_id === nationId && isLandHex(h)
      );
      console.log(`[DEBUG] Faction '${p.factionId}' (nation ${nationId}): found ${landHexes.length} playable land hexes`);
      if (landHexes.length === 0) return;
      
      // Find center: land hex closest to average position of all land hexes
      const avgCol = landHexes.reduce((sum, [, h]) => sum + h.col, 0) / landHexes.length;
      const avgRow = landHexes.reduce((sum, [, h]) => sum + h.row, 0) / landHexes.length;
      const center = landHexes.reduce((best, curr) => {
        const bestDist = Math.pow(best[1].col - avgCol, 2) + Math.pow(best[1].row - avgRow, 2);
        const currDist = Math.pow(curr[1].col - avgCol, 2) + Math.pow(curr[1].row - avgRow, 2);
        return currDist < bestDist ? curr : best;
      });
      
      const capitalHex = center[1];
      capitalsByFaction[p.factionId] = center[0];
      console.log(`[DEBUG] Faction '${p.factionId}' capital: ${center[0]} type=${capitalHex.type} nation=${nationId}`);
    });
    console.log('[DEBUG] Final capitalsByFaction:', capitalsByFaction);

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

    // Assign starting hexes: capital + immediate neighbors only (must be in same nation)
    const playerStartingHexes = {};
    Object.entries(capitalsByFaction).forEach(([faction, capitalId]) => {
      const owner = factionToPlayer[faction];
      const expectedNation = factionToNation[faction];
      if (!owner) return;
      playerStartingHexes[owner] = new Set([capitalId]);
      const neighbors = getHexNeighbors(capitalId);
      neighbors.forEach(nId => {
        const nHex = generatedHexWorld[nId];
        if (nHex && isLandHex(nHex) && nHex.nation_id === expectedNation) {
          playerStartingHexes[owner].add(nId);
        }
      });
    });

    // Build set of nation_ids that belong to active players/AI
    // In generatedHexWorld, nation_id = the remapped factionId (e.g. 'onishiman', 'sultanate')
    // factionToNation maps factionId -> nationId, but since FACTION_TO_NATION_ID is 1:1 they are the same
    const activeNationIds = new Set([
      ...players.map(p => factionToNation[p.factionId]).filter(Boolean),
      ...players.map(p => p.factionId).filter(Boolean),
    ]);

    const hexes = {};
    const capitalHexIds = Object.values(capitalsByFaction); // list of capital hex IDs
    Object.entries(generatedHexWorld).forEach(([id, hex]) => {
      let owner = null;
      let isCapital = false;
      // Only assign owner if hex is in the starting hexes for this player
      for (const [playerId, hexSet] of Object.entries(playerStartingHexes)) {
        if (hexSet.has(id)) {
          owner = playerId;
          isCapital = capitalHexIds.includes(id);
          break;
        }
      }
      // Neutral faction hex: belongs to a nation not controlled by any player/AI
      let isNeutralGarrison = false;
      if (!owner && hex.nation_id && !activeNationIds.has(hex.nation_id) && isLandHex(hex)) {
        owner = `neutral_${hex.nation_id}`;
        isNeutralGarrison = true;
      }
      hexes[id] = {
        ...hex,
        owner,
        units: [],
        hasFortress: false,
        isCapital,
        isNeutralGarrison,
      };
    });

    // Deploy starting units: 1 elite on capital, 3 infantry spread across owned hexes
    const infantryDeployed = {}; // playerId -> count
    // First pass: deploy elite + fortress on capitals
    Object.entries(hexes).forEach(([id, hex]) => {
      if (hex.isCapital && hex.owner) {
        hexes[id] = { ...hex, units: [{ type: 'elite', count: 1 }], buildings: { ...hex.buildings, fortress: true } };
        console.log(`[DEBUG] Deployed elite + fortress to capital ${id}, owner: ${hex.owner}`);
      }
    });
    // Second pass: deploy 3 infantry on first 3 non-capital owned hexes per player
    Object.entries(hexes).forEach(([id, hex]) => {
      if (!hex.owner || hex.isCapital || hex.type === 'water') return;
      const count = infantryDeployed[hex.owner] || 0;
      if (count < 3) {
        hexes[id] = { ...hex, units: [{ type: 'infantry', count: 1 }] };
        infantryDeployed[hex.owner] = count + 1;
        console.log(`[DEBUG] Deployed infantry to ${id}, owner: ${hex.owner}, count: ${infantryDeployed[hex.owner]}`);
      }
    });
    // Third pass: deploy 1 infantry garrison on every neutral faction hex (land only)
    Object.entries(hexes).forEach(([id, hex]) => {
      if (hex.isNeutralGarrison && hex.type !== 'water' && hex.units.length === 0) {
        hexes[id] = { ...hex, units: [{ type: 'infantry', count: 1 }] };
      }
    });

    console.log('[DEBUG] Final hexes with units:', Object.entries(hexes).filter(([,h]) => h.units?.length > 0).slice(0, 10));

  // Assign territories based on each territory's faction property
  // IMPORTANT: Every player (human + AI) must control at least one territory
  const factionToPlayerId = {};
  players.forEach(p => { if (p.factionId) factionToPlayerId[p.factionId] = p.id; });

  const territories = {};
  const playersWithTerritory = new Set();
  const capitalAssignedToPlayer = new Set();
  
  Object.entries(TERRITORIES).forEach(([id, terr]) => {
    const owner = factionToPlayerId[terr.faction] || null;
    let isCapital = false;
    if (owner && !capitalAssignedToPlayer.has(owner)) {
      isCapital = true;
      capitalAssignedToPlayer.add(owner);
    }
    territories[id] = {
      ...terr,
      owner,
      troops: owner ? 3 : 1,
      units: [],
      hasFortress: false,
      isCapital,
    };
    if (owner) playersWithTerritory.add(owner);
  });
  
  // Ensure every player has at least one territory
  const playersNeedingTerritory = players.filter(p => p.factionId && !playersWithTerritory.has(p.id));
  if (playersNeedingTerritory.length > 0) {
    const availableTerritories = Object.entries(territories).filter(([, t]) => !t.owner);
    playersNeedingTerritory.forEach(p => {
      if (availableTerritories.length > 0) {
        const [terrId, terr] = availableTerritories.shift();
        territories[terrId] = { ...terr, owner: p.id, troops: 3, isCapital: true };
        playersWithTerritory.add(p.id);
      }
    });
  }

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
    wars: {}, // { "playerId1|playerId2": true } for active wars
    influence: {}, // { playerId: { otherId: value (0-100) } } for influence with other players
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

  // Mine: L1=+2, L2=+3, L3=+6 gold/turn
  const mineGold = mine && !mine.disabled ? ({ 1: 2, 2: 3, 3: 6 }[mine.level] || mine.level) : 0;
  // Lumber Mill: L1=+1, L2=+1, L3=+2 wood/turn
  const lumberWood = lumber_mill && !lumber_mill.disabled ? ({ 1: 1, 2: 1, 3: 2 }[lumber_mill.level] || lumber_mill.level) : 0;
  // Farm: L1=+1, L2=+3, L3=+5 wheat/turn
  const farmWheat = farm && !farm.disabled ? ({ 1: 1, 2: 3, 3: 5 }[farm.level] || farm.level) : 0;
  // Crimson Vault: L1=+1, L2=+2, L3=+3 crystals/turn
  const treasury = player.buildings.treasury;
  const vaultCrystals = treasury && !treasury.disabled ? (treasury.level || 1) : 0;
  // Port bonus: +1 gold per crimson_port owned
  const portCount = Object.values(player.buildings || {}).filter(b => b.id === 'crimson_port').length
    + (Object.keys(player.buildings || {}).filter(k => k === 'crimson_port').length);

  const income = {
    gold: territoryGold + mineGold + (market ? 1 : 0) + portCount,
    wood: lumberWood,
    wheat: farmWheat,
    crystals: vaultCrystals,
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

  // Tick down the active world event
  let activeWorldEvent = gameState.activeWorldEvent;
  if (activeWorldEvent && activeWorldEvent.turnsRemaining > 0) {
    activeWorldEvent = { ...activeWorldEvent, turnsRemaining: activeWorldEvent.turnsRemaining - 1 };
    if (activeWorldEvent.turnsRemaining <= 0) activeWorldEvent = null;
  } else if (activeWorldEvent?.turnsRemaining === 0) {
    activeWorldEvent = null;
  }
  newState.activeWorldEvent = activeWorldEvent;
  // Clear peace treaty flag each new turn
  if (newState.peaceTreatyActive) newState.peaceTreatyActive = false;

  newState.players = gameState.players.map(p => {
    let income = calculateIncome(p, gameState.territories);
    const maxStorage = 10 + (p.buildings.treasury?.level || 1) * 5;
    const fx = p.cardEffects || {};

    // ── Card effect income bonuses / penalties ──
    if (fx.economic_boom?.active)  income.gold += fx.economic_boom.goldBonus || 2;
    if (fx.temple_blessing?.active && p.buildings?.temple) income.sp += p.buildings.temple.level || 1;
    if (fx.economic_crisis?.active) income.gold -= fx.economic_crisis.goldPenalty || 1;
    if (fx.war_profiteering?.active) {
      const anyWar = gameState.players.some(other =>
        other.id !== p.id && gameState.diplomacy?.[[p.id, other.id].sort().join('|')] === 'war'
      );
      if (anyWar) income.gold += 2;
    }
    if (fx.tariff_deal?.active) income.gold += fx.tariff_deal.tariffBonus || 1;
    // Famine event still active
    if (activeWorldEvent?.id === 'famine') income.wheat = Math.max(0, income.wheat - 1);
    // Economic crisis event
    if (activeWorldEvent?.id === 'economic_crisis') income.gold = Math.max(0, income.gold - 1);

    // ── Tick down card effects ──
    const newCardEffects = { ...fx };
    Object.keys(newCardEffects).forEach(k => {
      const eff = newCardEffects[k];
      if (!eff || eff.duration === Infinity) return;
      if (eff.duration > 0) {
        newCardEffects[k] = { ...eff, duration: eff.duration - 1 };
        if (newCardEffects[k].duration <= 0) newCardEffects[k] = { ...newCardEffects[k], active: false };
      }
    });

    // ── Avatar duration tick ──
    let activeAvatar = p.activeAvatar;
    if (activeAvatar) {
      activeAvatar = { ...activeAvatar, duration: activeAvatar.duration - 1 };
      if (activeAvatar.duration <= 0) activeAvatar = null;
    }

    return {
      ...p,
      resources: {
        gold: Math.min(maxStorage, Math.max(0, p.resources.gold + income.gold)),
        wood: Math.min(maxStorage, p.resources.wood + income.wood),
        wheat: Math.min(maxStorage, p.resources.wheat + income.wheat),
      },
      crystals: Math.min(50, (p.crystals || 0) + (income.crystals || 0)),
      sp: Math.min(50, p.sp + income.sp),
      ip: Math.min(50, p.ip + income.ip),
      cardEffects: newCardEffects,
      activeAvatar,
    };
  });

  // ── Luxury tax: players with >10 gold pay 2 to the caster ──
  newState.players = newState.players.map((p, _, arr) => {
    const caster = arr.find(x => x.cardEffects?.luxury_tax?.active && x.id !== p.id);
    if (caster && (p.resources?.gold || 0) > 10) {
      return { ...p, resources: { ...p.resources, gold: Math.max(0, p.resources.gold - 2) } };
    }
    return p;
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

// ---- Card effect combat bonuses ----
// Pass attacker/defenderPlayer to apply active card effects
export const getCardCombatBonuses = (player) => {
  const fx = player?.cardEffects || {};
  let attackBonus = 0, defenseBonus = 0;
  if (fx.rally?.active)        attackBonus  += 2;
  if (fx.holy_shield?.active)  defenseBonus += 3;
  if (fx.divine_shield?.active) defenseBonus += 3;
  if (fx.sanctified_ground?.active) defenseBonus += 1; // enemy rolls -1, defender gains +1
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

// ---- Ranged attack (Reapership from water to adjacent coastal) ----
export const resolveRangedAttack = (attackerUnits, defenderUnits, hasDefenderFortress = false) => {
  // Reapership ranged attack: defender takes losses, attacker takes NO losses (no retaliation)
  // Reapership uses d12, defender uses their unit dice (d6-d10 depending on type)
  const attackDice = 1;
  const aRolls = rollDice(attackDice, 12); // Reapership rolls d12
  
  // Defender rolls based on unit count (d6 per troop, max 2 dice)
  const defenderTroops = defenderUnits.reduce((s, u) => s + u.count, 0);
  const defendDice = Math.min(2, Math.max(1, defenderTroops));
  const dRolls = rollDice(defendDice, 6);

  // Attacker bonuses: Reapership +2
  const aBonus = 2;
  
  // Defender bonuses from units + fortress
  const unitDefenseBonus = calculateUnitBonuses(defenderUnits);
  const dBonus = unitDefenseBonus.defenseBonus + (hasDefenderFortress ? 3 : 0);

  let defenderLosses = 0;
  const pairs = Math.min(aRolls.length, dRolls.length);
  for (let i = 0; i < pairs; i++) {
    if ((aRolls[i] + aBonus) > (dRolls[i] + dBonus)) defenderLosses++;
  }

  // Fortress destruction logic: if there are defender losses and a fortress is present
  let fortressDestroyed = false;
  if (hasDefenderFortress && defenderLosses > 0) {
    if (defenderLosses >= 2 || Math.random() < 0.5) {
      fortressDestroyed = true;
    }
  }

  return { 
    aRolls, 
    dRolls, 
    attackerLosses: 0,  // NO retaliation damage
    defenderLosses, 
    attackDice, 
    aBonus, 
    dBonus, 
    terrainNotes: ['Naval bombardment — Defender takes no counter-damage'],
    isRangedAttack: true,
    terrain: 'water',
    fortressDestroyed
  };
};

export const executeAttack = (gameState, attackerId, defenderId, result, attackerPlayerId, defenderPlayerId) => {
  const newState = { ...gameState };
  newState.territories = { ...newState.territories };
  const attacker = { ...newState.territories[attackerId] };
  const defender = { ...newState.territories[defenderId] };

  attacker.troops = Math.max(1, attacker.troops - result.attackerLosses);
  defender.troops = Math.max(0, defender.troops - result.defenderLosses);

  // Declare war if not already at war
  if (attackerPlayerId && defenderPlayerId && attackerPlayerId !== defenderPlayerId) {
    const warKey = [attackerPlayerId, defenderPlayerId].sort().join('|');
    if (!newState.wars) newState.wars = {};
    if (!newState.wars[warKey]) {
      newState.wars[warKey] = true;
      newState.log = [...(newState.log || []), `⚔️ WAR DECLARED! ${gameState.players.find(p => p.id === attackerPlayerId)?.name} and ${gameState.players.find(p => p.id === defenderPlayerId)?.name} are now at war!`];
    }
    
    // Update influence: attacker's aggression reduces their influence with others
    if (!newState.influence) newState.influence = {};
    if (!newState.influence[attackerPlayerId]) newState.influence[attackerPlayerId] = {};
    
    gameState.players.forEach(p => {
      if (p.id !== attackerPlayerId && p.id !== defenderPlayerId) {
        // Other players view aggression negatively
        if (!newState.influence[attackerPlayerId][p.id]) newState.influence[attackerPlayerId][p.id] = 50;
        newState.influence[attackerPlayerId][p.id] = Math.max(0, newState.influence[attackerPlayerId][p.id] - 5);
      }
    });
    
    // Defender gets sympathy boost from other players
    if (!newState.influence[defenderPlayerId]) newState.influence[defenderPlayerId] = {};
    gameState.players.forEach(p => {
      if (p.id !== attackerPlayerId && p.id !== defenderPlayerId) {
        if (!newState.influence[defenderPlayerId][p.id]) newState.influence[defenderPlayerId][p.id] = 50;
        newState.influence[defenderPlayerId][p.id] = Math.min(100, newState.influence[defenderPlayerId][p.id] + 3);
      }
    });
  }

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
  state.players = state.players.map(p => ({ ...p }));
  const aiIndex = state.currentPlayerIndex;
  const ai = state.players[aiIndex];
  if (!ai || !ai.isAI) return state;

  const difficulty = ai.difficulty || 'normal';
  const logs = [];

  // Difficulty parameters
  const skipChance = difficulty === 'easy' ? 0.35 : 0;
  const minAdvantage = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 1.3 : 2;
  const attackBonus = difficulty === 'hard' ? 1 : 0;
  const maxAttacks = difficulty === 'hard' ? 3 : 1;
  const buildingChance = difficulty === 'hard' ? 0.7 : difficulty === 'normal' ? 0.4 : 0.1;
  const diplomacyChance = difficulty === 'hard' ? 0.6 : difficulty === 'normal' ? 0.35 : 0.1;

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

  // 2. Recruitment - build armies
  const gold = state.players[aiIndex].resources?.gold || 0;
  const wheat = state.players[aiIndex].resources?.wheat || 0;
  const hasBarracks = Object.values(state.players[aiIndex].buildings || {}).some(b => b.id === 'barracks');
  if (gold > 3 && wheat > 1 && hasBarracks && Math.random() < buildingChance) {
    state.players[aiIndex].resources = { ...state.players[aiIndex].resources, gold: gold - 2, wheat: wheat - 1 };
    logs.push(`🤖 ${ai.name} recruited infantry`);
  }

  // 3. Building upgrades
  const goldLeft = state.players[aiIndex].resources?.gold || 0;
  if (goldLeft >= 4 && Math.random() < buildingChance * 0.6) {
    const mine = state.players[aiIndex].buildings?.mine;
    if (mine && mine.level < 3) {
      state.players[aiIndex].buildings = { ...state.players[aiIndex].buildings, mine: { ...mine, level: mine.level + 1 } };
      state.players[aiIndex].resources.gold -= 4;
      logs.push(`🤖 ${ai.name} upgraded their mine`);
    }
  }

  // 4. Diplomacy - offer trades to human players
  if (difficulty !== 'easy' && Math.random() < diplomacyChance) {
    const otherPlayers = state.players.filter(p => p.id !== ai.id && !p.isAI);
    if (otherPlayers.length > 0 && (state.players[aiIndex].resources?.gold || 0) > 2) {
      const target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      state.players[aiIndex].activeTradeDeals = [...(state.players[aiIndex].activeTradeDeals || []), { partnerId: target.id, goldPerTurn: 1, duration: 3 }];
      logs.push(`🤖 ${ai.name} proposed trade with ${target.name}`);
    }
  }

  // 5. Attack (difficulty-gated)
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

  // 6. SP generation
  if (state.players[aiIndex].sp < 50) {
    const spGain = difficulty === 'hard' ? 2 : 1;
    state.players[aiIndex].sp = Math.min(50, state.players[aiIndex].sp + spGain);
    logs.push(`✨ ${ai.name} gained ${spGain} SP`);
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

// ---- Static hex terrain lookup (col,row -> type: 'water'|'land') ----
// Built once from the hex world generator so AI can validate moves without
// requiring a hex to already exist in state.hexes.
let _hexTerrainCache = null;
const getHexTerrainLookup = () => {
  if (_hexTerrainCache) return _hexTerrainCache;
  // Import lazily to avoid circular deps — we inline a minimal version here
  // using the same MAP_DATA logic: water faction = impassable.
  // We rely on state.hexes which IS pre-populated from generateWorldMap in createGameState.
  // So we return a sentinel that signals "use state.hexes for lookup".
  _hexTerrainCache = {};
  return _hexTerrainCache;
};

// Helper: is a hex passable (non-water) land? Uses state.hexes as source of truth.
const isPassableLand = (hexId, stateHexes) => {
  const h = stateHexes[hexId];
  if (!h) return false; // not in map = doesn't exist
  // 'type' field is 'water' | 'land' as set by generateWorldMap
  return h.type === 'land';
};

// ---- AI Turn as sequential steps (for real-time visualization) ----
export const getAiTurnSteps = (gameState) => {
  const steps = [];
  let state = {
    ...gameState,
    hexes: { ...gameState.hexes },
    players: gameState.players.map(p => ({ ...p, resources: { ...p.resources }, buildings: { ...p.buildings } })),
  };
  const aiIndex = state.currentPlayerIndex;
  const ai = state.players[aiIndex];
  if (!ai?.isAI) return [];

  const difficulty = ai.difficulty || 'normal';
  const skipChance = difficulty === 'easy' ? 0.4 : 0;
  const attackBonus = difficulty === 'hard' ? 1 : 0;
  const maxAttacks = difficulty === 'hard' ? 4 : difficulty === 'normal' ? 2 : 1;
  const minAdvantage = difficulty === 'easy' ? 2.0 : difficulty === 'hard' ? 1.2 : 1.5;
  const buildingChance = difficulty === 'hard' ? 0.85 : difficulty === 'normal' ? 0.6 : 0.25;
  const diplomacyChance = difficulty === 'hard' ? 0.75 : difficulty === 'normal' ? 0.5 : 0.15;
  const cardChance = difficulty === 'hard' ? 0.7 : difficulty === 'normal' ? 0.45 : 0.1;

  const getAI = () => state.players[aiIndex];
  const pushStep = (message, type = 'ai') => {
    // Shallow-clone only the parts that change (hexes + players), avoid expensive deep clone
    steps.push({ state: { ...state, hexes: { ...state.hexes }, players: state.players.map(p => ({ ...p })) }, message, type });
  };

  // ── STEP 1: Build a building if affordable ──
  if (Math.random() < buildingChance) {
    const currentAi = getAI();
    const gold = currentAi.resources?.gold || 0;
    const wood = currentAi.resources?.wood || 0;
    const existingBuildingIds = Object.keys(currentAi.buildings || {});

    const buildPriority = ['barracks', 'mine', 'farm', 'lumber_mill', 'temple', 'stables', 'market'];
    for (const bId of buildPriority) {
      if (existingBuildingIds.includes(bId)) continue;
      const def = BUILDING_DEFS[bId];
      if (!def || !def.cost) continue;
      const bgold = def.cost.gold || 0;
      const bwood = def.cost.wood || 0;
      if (gold >= bgold && wood >= bwood) {
        const newResources = { ...currentAi.resources, gold: gold - bgold, wood: wood - bwood };
        const newBuildings = { ...currentAi.buildings, [bId]: { ...def, level: 1, disabled: false } };
        state = { ...state, players: state.players.map((p, i) => i === aiIndex ? { ...p, resources: newResources, buildings: newBuildings } : p) };
        pushStep(`🏗️ ${ai.name} built a ${def.name || bId}`);
        break;
      }
    }
  }

  // ── STEP 2: Upgrade existing buildings if affordable ──
  if (Math.random() < buildingChance * 0.6) {
    const currentAi = getAI();
    const gold = currentAi.resources?.gold || 0;
    const wood = currentAi.resources?.wood || 0;
    const upgradeTargets = ['mine', 'farm', 'lumber_mill', 'barracks'];
    for (const bId of upgradeTargets) {
      const b = currentAi.buildings?.[bId];
      const def = BUILDING_DEFS[bId];
      if (!b || !def || b.level >= (def.maxLevel || 3)) continue;
      const ub = def.upgradeBase || {};
      // Flat upgrade cost (not multiplied by level) per the spreadsheet
      const upgCost = typeof ub === 'object' && !Array.isArray(ub) ? { ...ub } : {};
      const ugold = upgCost.gold || 4;
      const uwood = upgCost.wood || 2;
      if (gold >= ugold && wood >= uwood) {
        const newResources = { ...currentAi.resources, gold: gold - ugold, wood: wood - uwood };
        const newBuildings = { ...currentAi.buildings, [bId]: { ...b, level: b.level + 1 } };
        state = { ...state, players: state.players.map((p, i) => i === aiIndex ? { ...p, resources: newResources, buildings: newBuildings } : p) };
        pushStep(`⬆️ ${ai.name} upgraded their ${def.name || bId} to level ${b.level + 1}`);
        break;
      }
    }
  }

  // ── STEP 3: Recruit units (always recruit at least 1 infantry) ──
  {
    const currentAi = getAI();
    const hasBarracks = !!currentAi.buildings?.barracks;
    const hasStables = !!currentAi.buildings?.stables;

    // Always recruit at least 1 infantry regardless of cost (AI subsidy)
    const recruitCandidates = ['infantry'];
    if (hasBarracks) recruitCandidates.push('infantry');
    if (hasStables) recruitCandidates.push('cavalry');
    if (hasBarracks && currentAi.resources?.gold >= 5) recruitCandidates.push('elite');

    const recruits = [];
    for (const unitId of recruitCandidates) {
      const def = UNIT_DEFS[unitId];
      if (!def) continue;
      const cost = def.cost || {};
      const curAi = getAI();
      let canAfford = true;
      for (const [k, v] of Object.entries(cost)) {
        if ((curAi.resources?.[k] ?? 0) < v) { canAfford = false; break; }
      }
      if (!canAfford) {
        // For infantry only, give it free if AI has no units at all (bootstrap)
        const totalUnits = Object.values(state.hexes).filter(h => h.owner === ai.id).reduce((s, h) => s + (h.units || []).reduce((ss, u) => ss + u.count, 0), 0);
        if (unitId !== 'infantry' || totalUnits > 0) continue;
        // bootstrap: give free infantry
      } else {
        const newResources = { ...curAi.resources };
        for (const [k, v] of Object.entries(cost)) { newResources[k] = (newResources[k] || 0) - v; }
        state = { ...state, players: state.players.map((p, i) => i === aiIndex ? { ...p, resources: newResources } : p) };
      }
      const curAi2 = getAI();
      const newPending = [...(curAi2.pendingUnits || []), unitId];
      state = { ...state, players: state.players.map((p, i) => i === aiIndex ? { ...p, pendingUnits: newPending } : p) };
      recruits.push(unitId);
    }
    if (recruits.length > 0) {
      pushStep(`🎖️ ${ai.name} recruited ${recruits.length} unit(s): ${recruits.join(', ')}`);
    }
  }

  // ── STEP 4: Deploy all pending units to best frontline hex ──
  {
    const currentAiForDeploy = getAI();
    // Always give AI at least 1 free infantry to deploy each turn (guarantees activity)
    const pendingUnits = currentAiForDeploy.pendingUnits?.length > 0
      ? [...currentAiForDeploy.pendingUnits]
      : ['infantry'];

    // Find all hexes owned by this AI — check both 'land' type AND any hex with owner set
    const allOwnedHexIds = Object.entries(state.hexes)
      .filter(([, h]) => h.owner === currentAiForDeploy.id && h.type !== 'water')
      .map(([id]) => id);

    // Fallback: any capital hex, regardless of type field
    if (allOwnedHexIds.length === 0) {
      const capEntry = Object.entries(state.hexes).find(([, h]) => h.isCapital && h.owner === currentAiForDeploy.id);
      if (capEntry) allOwnedHexIds.push(capEntry[0]);
    }
    // Last resort: any hex owned by this AI
    if (allOwnedHexIds.length === 0) {
      const anyOwned = Object.entries(state.hexes).find(([, h]) => h.owner === currentAiForDeploy.id);
      if (anyOwned) allOwnedHexIds.push(anyOwned[0]);
    }

    // Score each owned hex: prefer frontier hexes adjacent to non-AI land
    let bestHex = null, bestScore = -Infinity;
    allOwnedHexIds.forEach(hexId => {
      const h = state.hexes[hexId] || {};
      const neighbors = getHexNeighborIds(hexId);
      const frontierScore = neighbors.filter(nid => {
        const nh = state.hexes[nid];
        return nh && nh.type !== 'water' && nh.owner !== currentAiForDeploy.id;
      }).length;
      const unitCount = (h.units || []).reduce((s, u) => s + u.count, 0);
      const score = frontierScore * 3 - unitCount;
      if (score > bestScore) { bestScore = score; bestHex = hexId; }
    });

    if (!bestHex && allOwnedHexIds.length > 0) bestHex = allOwnedHexIds[0];

    if (bestHex) {
      const newHexes = { ...state.hexes };
      pendingUnits.forEach(unitId => {
        const hex = newHexes[bestHex] ? { ...newHexes[bestHex] } : { owner: currentAiForDeploy.id, units: [], type: 'land' };
        const hexUnits = (hex.units || []).map(u => ({ ...u }));
        const existing = hexUnits.find(u => u.type === unitId);
        if (existing) existing.count += 1;
        else hexUnits.push({ type: unitId, count: 1 });
        newHexes[bestHex] = { ...hex, units: hexUnits, owner: currentAiForDeploy.id };
      });
      state = { ...state, hexes: newHexes, players: state.players.map((p, i) => i === aiIndex ? { ...p, pendingUnits: [] } : p) };
      pushStep(`🚩 ${ai.name} deployed ${pendingUnits.length} unit(s) to the frontline`);
    } else {
      state = { ...state, players: state.players.map((p, i) => i === aiIndex ? { ...p, pendingUnits: [] } : p) };
    }
  }

  // ── STEP 5: Move units toward enemy/neutral territory ──
  // Use BFS range=3 to find reachable targets in sparse map
  if (Math.random() > 0.2) {
    const aiHexes = Object.entries(state.hexes)
      .filter(([, h]) => h.owner === ai.id && h.type !== 'water' && (h.units || []).reduce((s, u) => s + u.count, 0) >= 2)
      .sort((a, b) => (b[1].units || []).reduce((s, u) => s + u.count, 0) - (a[1].units || []).reduce((s, u) => s + u.count, 0));

    let movesDone = 0;
    for (const [fromId, fromHex] of aiHexes) {
      if (movesDone >= 3) break;
      // BFS: find all non-water hexes within 3 steps
      const reachable = getHexesInRange(fromId, 3, state.hexes);

      // Find best step-1 neighbor toward an enemy or neutral target
      // First, find any enemy or neutral target in range
      let moveTarget = null;
      // Priority 1: adjacent enemy with no units (instant capture)
      for (const nid of getHexNeighborIds(fromId)) {
        const nh = state.hexes[nid];
        if (nh && nh.type !== 'water' && nh.owner && nh.owner !== ai.id && (nh.units || []).reduce((s, u) => s + u.count, 0) === 0) {
          moveTarget = nid; break;
        }
      }
      // Priority 2: adjacent neutral
      if (!moveTarget) {
        for (const nid of getHexNeighborIds(fromId)) {
          const nh = state.hexes[nid];
          if (nh && nh.type !== 'water' && !nh.owner) { moveTarget = nid; break; }
        }
      }
      // Priority 3: any reachable neutral within BFS range
      if (!moveTarget) {
        for (const [nid] of [...reachable].sort((a, b) => a[1] - b[1])) {
          const nh = state.hexes[nid];
          if (nh && !nh.owner) { 
            // Move toward it: pick the neighbor of fromId that's on the BFS path
            const step = getHexNeighborIds(fromId).find(mid => {
              const mh = state.hexes[mid];
              return mh && mh.type !== 'water' && reachable.has(mid);
            });
            if (step) { moveTarget = step; break; }
          }
        }
      }

      if (moveTarget) {
        const newHexes = { ...state.hexes };
        const srcUnits = (fromHex.units || []).map(u => ({ ...u }));
        const totalCount = srcUnits.reduce((s, u) => s + u.count, 0);
        const moveCount = Math.max(1, Math.floor(totalCount / 2));

        let moved = 0;
        const unitsToMove = [];
        const remainingUnits = srcUnits.map(u => ({ ...u }));
        for (const u of remainingUnits) {
          const canMove = Math.min(u.count, moveCount - moved);
          if (canMove <= 0) break;
          unitsToMove.push({ type: u.type, count: canMove });
          u.count -= canMove;
          moved += canMove;
          if (moved >= moveCount) break;
        }
        const fromRemaining = remainingUnits.filter(u => u.count > 0);
        const destHex = newHexes[moveTarget] ? { ...newHexes[moveTarget] } : { owner: null, units: [], type: 'land' };
        const targetIsEnemy = destHex.owner && destHex.owner !== ai.id;

        if (targetIsEnemy && (destHex.units || []).reduce((s, u) => s + u.count, 0) === 0) {
          newHexes[moveTarget] = { ...destHex, units: unitsToMove, owner: ai.id };
          newHexes[fromId] = { ...fromHex, units: fromRemaining };
          state = { ...state, hexes: newHexes };
          pushStep(`⚔️ ${ai.name} captured an undefended hex!`);
          movesDone++;
        } else if (!targetIsEnemy) {
          const destUnits = [...(destHex.units || [])];
          unitsToMove.forEach(mu => {
            const ex = destUnits.find(u => u.type === mu.type);
            if (ex) ex.count += mu.count; else destUnits.push({ ...mu });
          });
          newHexes[moveTarget] = { ...destHex, units: destUnits, owner: ai.id };
          newHexes[fromId] = { ...fromHex, units: fromRemaining };
          state = { ...state, hexes: newHexes };
          pushStep(`🚶 ${ai.name} advanced troops into new territory`);
          movesDone++;
        }
      }
    }
  }

  // ── STEP 6: Attack enemy hexes within range 2 (BFS) ──
  if (Math.random() >= skipChance) {
    const aiHexes = Object.entries(state.hexes)
      .filter(([, h]) => h.owner === ai.id && h.type !== 'water')
      .sort((a, b) => (b[1].units?.reduce((s, u) => s + u.count, 0) || 0) - (a[1].units?.reduce((s, u) => s + u.count, 0) || 0));

    let attacksDone = 0;
    for (const [fromId, fromHex] of aiHexes) {
      if (attacksDone >= maxAttacks) break;
      const fromCount = fromHex.units?.reduce((s, u) => s + u.count, 0) || 0;
      if (fromCount < 2) continue;

      // Use BFS range=2 to find attackable enemies (must be directly adjacent to attack)
      // But search adjacency in actual hexes
      const neighbors = getHexNeighborIds(fromId).filter(nid => state.hexes[nid]);
      const targets = neighbors
        .map(nid => [nid, state.hexes[nid]])
        .filter(([, nh]) => nh && nh.type !== 'water' && nh.owner && nh.owner !== ai.id)
        .filter(([, nh]) => {
          const defCount = nh.units?.reduce((s, u) => s + u.count, 0) || 0;
          return defCount === 0 || fromCount >= defCount * minAdvantage;
        })
        .sort((a, b) => (a[1].units?.reduce((s, u) => s + u.count, 0) || 0) - (b[1].units?.reduce((s, u) => s + u.count, 0) || 0));

      // If no immediate neighbor to attack, try moving closer first (skip to next hex)
      if (targets.length === 0) continue;

      const [targetId, targetHex] = targets[0];
      const defCount = targetHex.units?.reduce((s, u) => s + u.count, 0) || 0;
      const fromUnits = fromHex.units?.length > 0 ? fromHex.units : [{ type: 'infantry', count: fromCount }];
      const defUnits = defCount > 0
        ? (targetHex.units?.length > 0 ? targetHex.units : [{ type: 'infantry', count: defCount }])
        : [{ type: 'infantry', count: 1 }];
      const result = resolveBattle(fromUnits, defUnits, targetHex.buildings?.fortress, { attackBonus });
      const conquered = result.defenderLosses >= Math.max(defCount, 1) || defCount === 0;

      const newHexes = { ...state.hexes };
      const newFromUnits = fromUnits.map(u => ({ ...u, count: Math.max(0, u.count - result.attackerLosses) })).filter(u => u.count > 0);

      if (conquered) {
        const movedCount = Math.max(1, Math.floor(newFromUnits.reduce((s, u) => s + u.count, 0) / 2));
        const movedUnits = [{ type: (newFromUnits[0]?.type || 'infantry'), count: movedCount }];
        newHexes[targetId] = { ...targetHex, units: movedUnits, owner: ai.id };
        newHexes[fromId] = { ...fromHex, units: newFromUnits.map(u => ({ ...u, count: Math.max(1, u.count - movedCount) })).filter(u => u.count > 0) };
        state = { ...state, hexes: newHexes };
        pushStep(`⚔️ ${ai.name} conquered a hex! (A:-${result.attackerLosses} D:-${result.defenderLosses})`);
      } else {
        const newDefUnits = defUnits.map(u => ({ ...u, count: Math.max(0, u.count - result.defenderLosses) })).filter(u => u.count > 0);
        newHexes[targetId] = { ...targetHex, units: newDefUnits };
        newHexes[fromId] = { ...fromHex, units: newFromUnits };
        state = { ...state, hexes: newHexes };
        pushStep(`⚔️ ${ai.name} attacked (A:-${result.attackerLosses} D:-${result.defenderLosses})`);
      }
      attacksDone++;
    }
  }

  // ── STEP 7: Diplomacy — trade offer or alliance ──
  if (Math.random() < diplomacyChance) {
    const currentAi = getAI();
    const humanPlayers = state.players.filter(p => !p.isAI);
    if (humanPlayers.length > 0 && (currentAi.resources?.gold || 0) >= 2) {
      const target = humanPlayers[Math.floor(Math.random() * humanPlayers.length)];
      const offerResource = Math.random() > 0.5 ? 'wood' : 'wheat';
      const tradeOffer = {
        fromId: ai.id,
        toId: target.id,
        offer: { gold: 1 },
        request: { [offerResource]: 1 },
        id: Date.now() + Math.random(),
      };
      state = {
        ...state,
        pendingAiTradeOffers: [...(state.pendingAiTradeOffers || []), tradeOffer],
        diplomaticEvents: [...(state.diplomaticEvents || []), {
          type: 'trade_offer',
          text: `${ai.name} offered 1 Gold for 1 ${offerResource} to ${target.name}`,
          turn: state.turn,
        }],
      };
      pushStep(`📜 ${ai.name} offered trade to ${target.name}: 1 Gold ↔ 1 ${offerResource}`);
    }
  }

  // ── STEP 8: Buy / play an action card ──
  if (Math.random() < cardChance) {
    const currentAi = getAI();
    const gold = currentAi.resources?.gold || 0;
    if (gold >= 2) {
      const cardPool = ['diplomatic_favor', 'faith_surge', 'rally', 'war_profiteering', 'economic_boom'];
      const pickedCard = cardPool[Math.floor(Math.random() * cardPool.length)];
      const newResources = { ...currentAi.resources, gold: gold - 2 };
      const newCards = [...(currentAi.actionCards || []), pickedCard];
      let newIp = currentAi.ip ?? 0;
      let newSp = currentAi.sp ?? 0;
      if (pickedCard === 'diplomatic_favor') newIp = Math.min(50, newIp + 3);
      if (pickedCard === 'faith_surge') newSp = Math.min(50, newSp + 3);
      if (pickedCard === 'war_profiteering') newIp = Math.min(50, newIp + 1);
      state = { ...state, players: state.players.map((p, i) => i === aiIndex ? { ...p, resources: newResources, actionCards: newCards, ip: newIp, sp: newSp } : p) };
      pushStep(`🃏 ${ai.name} played action card: ${pickedCard.replace(/_/g, ' ')}`, 'card');
    }
  }

  return steps;
};

const getHexNeighborIds = (hexId) => {
  const [col, row] = hexId.split(',').map(Number);
  const even = col % 2 === 0;
  return [
    [col + 1, even ? row - 1 : row], [col + 1, even ? row : row + 1],
    [col - 1, even ? row - 1 : row], [col - 1, even ? row : row + 1],
    [col, row - 1], [col, row + 1],
  ].map(([c, r]) => `${c},${r}`);
};

// BFS to find all land hexes within `range` steps through state.hexes (handles sparse maps)
const getHexesInRange = (fromHexId, range, stateHexes) => {
  const visited = new Map([[fromHexId, 0]]);
  const queue = [{ id: fromHexId, cost: 0 }];
  while (queue.length > 0) {
    const { id, cost } = queue.shift();
    if (cost >= range) continue;
    for (const nid of getHexNeighborIds(id)) {
      if (visited.has(nid)) continue;
      const nh = stateHexes[nid];
      if (!nh || nh.type === 'water') continue;
      visited.set(nid, cost + 1);
      queue.push({ id: nid, cost: cost + 1 });
    }
  }
  visited.delete(fromHexId);
  return visited; // Map of hexId -> distance
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