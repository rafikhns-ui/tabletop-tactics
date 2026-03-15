// ---- Territory & Map Data ----
export const TERRITORIES = {
  ironkeep: { id: 'ironkeep', name: 'Ironkeep', x: 120, y: 100, continent: 'north', biome: 'mountain' },
  frostholm: { id: 'frostholm', name: 'Frostholm', x: 280, y: 60, continent: 'north', biome: 'tundra' },
  ashvale: { id: 'ashvale', name: 'Ashvale', x: 200, y: 180, continent: 'north', biome: 'forest' },
  stonepeak: { id: 'stonepeak', name: 'Stonepeak', x: 380, y: 140, continent: 'north', biome: 'mountain' },
  emberhall: { id: 'emberhall', name: 'Emberhall', x: 100, y: 280, continent: 'west', biome: 'desert' },
  duskwood: { id: 'duskwood', name: 'Duskwood', x: 220, y: 300, continent: 'west', biome: 'forest' },
  goldwater: { id: 'goldwater', name: 'Goldwater', x: 360, y: 240, continent: 'center', biome: 'ocean' },
  wraithfen: { id: 'wraithfen', name: 'Wraithfen', x: 480, y: 200, continent: 'east', biome: 'forest' },
  sunspire: { id: 'sunspire', name: 'Sunspire', x: 560, y: 120, continent: 'east', biome: 'desert' },
  crimsonpass: { id: 'crimsonpass', name: 'Crimson Pass', x: 500, y: 320, continent: 'east', biome: 'mountain' },
  tidehaven: { id: 'tidehaven', name: 'Tidehaven', x: 120, y: 400, continent: 'south', biome: 'ocean' },
  mirewood: { id: 'mirewood', name: 'Mirewood', x: 280, y: 420, continent: 'south', biome: 'forest' },
  sandreach: { id: 'sandreach', name: 'Sandreach', x: 420, y: 440, continent: 'south', biome: 'desert' },
  vaultstone: { id: 'vaultstone', name: 'Vaultstone', x: 580, y: 400, continent: 'south', biome: 'mountain' },
};

export const ADJACENCY = {
  ironkeep: ['frostholm', 'ashvale', 'emberhall'],
  frostholm: ['ironkeep', 'ashvale', 'stonepeak'],
  ashvale: ['ironkeep', 'frostholm', 'duskwood', 'goldwater'],
  stonepeak: ['frostholm', 'goldwater', 'wraithfen', 'sunspire'],
  emberhall: ['ironkeep', 'duskwood', 'tidehaven'],
  duskwood: ['emberhall', 'ashvale', 'goldwater', 'mirewood'],
  goldwater: ['ashvale', 'duskwood', 'stonepeak', 'wraithfen', 'mirewood'],
  wraithfen: ['stonepeak', 'goldwater', 'sunspire', 'crimsonpass'],
  sunspire: ['stonepeak', 'wraithfen', 'crimsonpass'],
  crimsonpass: ['wraithfen', 'sunspire', 'vaultstone', 'sandreach'],
  tidehaven: ['emberhall', 'mirewood'],
  mirewood: ['duskwood', 'goldwater', 'tidehaven', 'sandreach'],
  sandreach: ['mirewood', 'crimsonpass', 'vaultstone'],
  vaultstone: ['crimsonpass', 'sandreach'],
};

export const BIOME_COLORS = {
  mountain: '#7a6a55',
  tundra: '#a0b8c8',
  forest: '#4a7a4a',
  desert: '#c8a040',
  ocean: '#3a6a9a',
};

export const PLAYER_COLORS = {
  p1: '#c0392b',
  p2: '#2980b9',
  ai: '#8e44ad',
};

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const createInitialGameState = (mode) => {
  const players = mode === 'ai'
    ? [
        { id: 'p1', name: 'Player 1', color: PLAYER_COLORS.p1, isAI: false, troopsToDeploy: 5 },
        { id: 'ai', name: 'The Shadow Lord', color: PLAYER_COLORS.ai, isAI: true, troopsToDeploy: 5 },
      ]
    : [
        { id: 'p1', name: 'Player 1', color: PLAYER_COLORS.p1, isAI: false, troopsToDeploy: 5 },
        { id: 'p2', name: 'Player 2', color: PLAYER_COLORS.p2, isAI: false, troopsToDeploy: 5 },
      ];

  const territoryIds = shuffleArray(Object.keys(TERRITORIES));
  const territories = {};
  const half = Math.floor(territoryIds.length / 2);

  territoryIds.forEach((id, i) => {
    const owner = i < half ? players[0].id : players[1].id;
    territories[id] = { ...TERRITORIES[id], owner, troops: 2 };
  });

  return { territories, adjacency: ADJACENCY, players, currentPlayerIndex: 0, turn: 1, mode };
};

export const rollDice = (count) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);

export const resolveBattle = (attackDice, defendDice) => {
  const aRolls = rollDice(attackDice);
  const dRolls = rollDice(defendDice);
  let attackerLosses = 0;
  let defenderLosses = 0;
  const pairs = Math.min(aRolls.length, dRolls.length);
  for (let i = 0; i < pairs; i++) {
    if (aRolls[i] > dRolls[i]) defenderLosses++;
    else attackerLosses++;
  }
  return { aRolls, dRolls, attackerLosses, defenderLosses, attackDice };
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
  }

  newState.territories[attackerId] = attacker;
  newState.territories[defenderId] = defender;
  return newState;
};

export const aiTurn = (gameState) => {
  const newState = { ...gameState };
  newState.territories = { ...newState.territories };
  const aiPlayer = newState.players.find(p => p.isAI);
  if (!aiPlayer) return { newState, log: 'passed.' };

  // Deploy all troops to best territory
  let bestDeploy = null, bestScore = -1;
  Object.values(newState.territories).forEach(t => {
    if (t.owner !== aiPlayer.id) return;
    const enemyNeighbors = (newState.adjacency[t.id] || []).filter(
      n => newState.territories[n].owner !== aiPlayer.id
    ).length;
    if (enemyNeighbors > bestScore) { bestScore = enemyNeighbors; bestDeploy = t.id; }
  });

  if (bestDeploy && aiPlayer.troopsToDeploy > 0) {
    newState.territories[bestDeploy] = {
      ...newState.territories[bestDeploy],
      troops: newState.territories[bestDeploy].troops + aiPlayer.troopsToDeploy,
    };
    newState.players = newState.players.map(p =>
      p.id === aiPlayer.id ? { ...p, troopsToDeploy: 0 } : p
    );
  }

  // Attack best opportunity
  let log = 'deployed troops and held position.';
  const myTerritories = Object.values(newState.territories).filter(t => t.owner === aiPlayer.id);
  for (const from of myTerritories.sort((a, b) => b.troops - a.troops)) {
    if (from.troops < 3) continue;
    const targets = (newState.adjacency[from.id] || [])
      .map(id => newState.territories[id])
      .filter(t => t.owner !== aiPlayer.id && from.troops > t.troops + 1);
    if (targets.length > 0) {
      const target = targets.sort((a, b) => a.troops - b.troops)[0];
      const attackDice = Math.min(3, from.troops - 1);
      const defendDice = Math.min(2, target.troops);
      const result = resolveBattle(attackDice, defendDice);
      const updatedState = executeAttack(newState, from.id, target.id, result);
      Object.assign(newState.territories, updatedState.territories);
      log = `attacked ${target.name}!`;
      break;
    }
  }

  return { newState, log };
};