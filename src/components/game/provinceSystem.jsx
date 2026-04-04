import mapData from './ardonia_game_map.json';

// ════ BUILDINGS ════
export const BUILDINGS = {
  fortified_city: {
    id: 'fortified_city',
    name: 'Fortified City',
    cost: { gold: 8 },
    maxLevel: 1,
    defenseBonus: 3,
    unitDice: 'd8',
    allowsRecruitment: true,
    description: 'Strengthens garrison defense and enables unit recruitment',
  },
  walls: {
    id: 'walls',
    name: 'City Walls',
    cost: { gold: 3 },
    maxLevel: 1,
    defenseBonus: 2,
    unitDice: 'd8',
    description: 'Reinforces defensive capabilities for basic units',
  },
  trading_port: {
    id: 'trading_port',
    name: 'Trading Port',
    cost: { gold: 5 },
    maxLevel: 3,
    requiresCoastal: true,
    levels: [
      { level: 1, name: 'Shipyard', incomeBonus: 0 },
      { level: 2, name: 'Overseas Trade', incomeBonus: 1 },
      { level: 3, name: 'Safe Harbor', incomeBonus: 1 },
    ],
    description: 'Coastal-only trade facility. Increases gold income per level',
  },
  temple: {
    id: 'temple',
    name: 'Temple',
    cost: { gold: 6 },
    maxLevel: 3,
    levels: [
      { level: 1, spBonus: 1 },
      { level: 2, spBonus: 1, avatarCostReduction: 1 },
      { level: 3, spBonus: 2 },
    ],
    description: 'Religious center. Generates SP and reduces avatar summoning cost',
  },
  mine: {
    id: 'mine',
    name: 'Mine',
    cost: { gold: 4 },
    maxLevel: 3,
    levels: [
      { level: 1, goldBonus: 1 },
      { level: 2, goldBonus: 2 },
      { level: 3, goldBonus: 3 },
    ],
    description: 'Extracts minerals. Each level increases gold income',
  },
  bazaar: {
    id: 'bazaar',
    name: 'Bazaar',
    cost: { gold: 3 },
    maxLevel: 2,
    levels: [
      { level: 1, name: 'Local Trade', incomeBonus: 0 },
      { level: 2, name: 'Global Trade', incomeBonus: 1 },
    ],
    description: 'Trade hub. Increases gold income per level',
  },
};

// ════ TERRAIN STATS ════
export const TERRAIN_STATS = {
  coastal: { income: 3, defense: 0, moveCost: 1 },
  plains: { income: 2, defense: 0, moveCost: 1 },
  forest: { income: 1, defense: 1, moveCost: 2 },
  hills: { income: 1, defense: 1, moveCost: 2 },
  mountain: { income: 0, defense: 2, moveCost: 3 },
  desert: { income: 1, defense: 0, moveCost: 2 },
  tundra: { income: 1, defense: 0, moveCost: 2 },
  water: { income: 0, defense: 0, moveCost: 0 },
  swamp: { income: 0, defense: 0, moveCost: 0 },
  scorched: { income: 0, defense: 0, moveCost: 0 },
};

// ════ PROVINCE STATE CREATION ════
export const createInitialProvinceState = (gameState) => {
  const provinces = {};
  const hexToProvince = buildHexToProvinceMap();
  const nationCapitals = new Set();

  mapData.nations.forEach(nation => {
    nation.provinces.forEach(prov => {
      const provId = `${nation.id}-${prov.id}`;
      const hexesInProv = mapData.hex_grid.filter(h => h.nation_id === nation.id && h.province === prov.id);
      
      // Calculate terrain distribution and base income
      const terrainDist = {};
      let totalIncome = 0;
      hexesInProv.forEach(h => {
        terrainDist[h.terrain] = (terrainDist[h.terrain] || 0) + 1;
        totalIncome += TERRAIN_STATS[h.terrain]?.income || 0;
      });

      // Find owner from gameState
      const owner = gameState?.players?.find(p => {
        const nationId = p.factionId; // Assume factionId matches nation_id
        return nationId === nation.id;
      })?.id || null;

      // National capital gets fortified_city
      const isNatCap = prov.is_national_capital;
      const startBuildings = {};
      if (isNatCap && owner) {
        startBuildings.fortified_city = { ...BUILDINGS.fortified_city, level: 1 };
        nationCapitals.add(provId);
      }

      provinces[provId] = {
        id: provId,
        name: prov.capital || 'Unknown',
        nation_id: nation.id,
        province_id: prov.id,
        owner,
        original_owner: owner,
        capital_name: prov.capital,
        is_national_capital: isNatCap,
        hex_count: hexesInProv.length,
        terrain_distribution: terrainDist,
        base_income: totalIncome,
        buildings: startBuildings,
        garrison: owner ? [{ type: 'infantry', count: 3 }] : [],
        is_contested: false,
        pillaged: false,
        flag_marker: owner ? 'owned' : 'neutral',
      };
    });
  });

  return { provinces, hexToProvince, nationCapitals };
};

// ════ HEX-TO-PROVINCE MAP ════
export const buildHexToProvinceMap = () => {
  const map = {};
  mapData.nations.forEach(nation => {
    nation.provinces.forEach(prov => {
      mapData.hex_grid.forEach(h => {
        if (h.nation_id === nation.id && h.province === prov.id) {
          const hexId = `${h.col},${h.row}`;
          map[hexId] = `${nation.id}-${prov.id}`;
        }
      });
    });
  });
  return map;
};

// ════ PROVINCE QUERIES ════
export const getProvincesOwnedBy = (playerId, provinces) =>
  Object.values(provinces).filter(p => p.owner === playerId);

export const getNationalCapital = (nationId, provinces) =>
  Object.values(provinces).find(p => p.nation_id === nationId && p.is_national_capital);

export const hasLostCapital = (playerId, provinces) => {
  const owned = getProvincesOwnedBy(playerId, provinces);
  const nations = [...new Set(owned.map(p => p.nation_id))];
  return nations.some(nid => {
    const cap = getNationalCapital(nid, provinces);
    return cap && cap.owner !== playerId;
  });
};

export const getAdjacentProvinces = (provinceId, provinces) => {
  const province = provinces[provinceId];
  if (!province) return [];
  
  const hexesInProv = mapData.hex_grid.filter(h => h.nation_id === province.nation_id && h.province === province.province_id);
  const adjSet = new Set();
  
  hexesInProv.forEach(h => {
    const neighbors = getHexNeighbors(h.col, h.row);
    neighbors.forEach(n => {
      const nhex = mapData.hex_grid.find(x => x.col === n[0] && x.row === n[1]);
      if (nhex && (nhex.nation_id !== province.nation_id || nhex.province !== province.province_id)) {
        const adjId = `${nhex.nation_id}-${nhex.province}`;
        if (adjId !== provinceId) adjSet.add(adjId);
      }
    });
  });
  
  return Array.from(adjSet).map(id => provinces[id]).filter(Boolean);
};

export const getHexNeighbors = (col, row) => {
  const even = col % 2 === 0;
  return [
    [col + 1, even ? row - 1 : row], [col + 1, even ? row : row + 1],
    [col - 1, even ? row - 1 : row], [col - 1, even ? row : row + 1],
    [col, row - 1], [col, row + 1],
  ];
};

// ════ PROVINCE INCOME ════
export const getProvinceIncome = (province) => {
  let gold = province.base_income;
  Object.values(province.buildings).forEach(b => {
    if (b.level === 1 && BUILDINGS[b.id]?.maxLevel === 1) {
      gold += BUILDINGS[b.id].defenseBonus || 0; // For now, simplify
    } else {
      const levels = BUILDINGS[b.id]?.levels;
      if (levels && levels[b.level - 1]) {
        gold += levels[b.level - 1].incomeBonus || 0;
        gold += levels[b.level - 1].goldBonus || 0;
      }
    }
  });
  return { gold, sp: getProvinceSP(province) };
};

export const getNationIncome = (nationId, provinces) => {
  const nationProvinces = Object.values(provinces).filter(p => p.nation_id === nationId && p.owner);
  let totalGold = 0, totalSp = 0;
  nationProvinces.forEach(p => {
    const inc = getProvinceIncome(p);
    totalGold += inc.gold;
    totalSp += inc.sp;
  });
  return { gold: totalGold, sp: totalSp };
};

// ════ PROVINCE DEFENSE ════
export const getProvinceDefense = (province) => {
  let defense = 0;
  
  // Terrain defense
  Object.entries(province.terrain_distribution).forEach(([terrain, count]) => {
    defense += (TERRAIN_STATS[terrain]?.defense || 0) * count;
  });
  
  // Capital bonus
  if (province.is_national_capital) defense += 3;
  
  // Building bonuses
  Object.values(province.buildings).forEach(b => {
    defense += b.defenseBonus || 0;
  });
  
  return defense;
};

export const getProvinceSP = (province) => {
  let sp = 0;
  const templeBuilding = province.buildings.temple;
  if (templeBuilding) {
    const levels = BUILDINGS.temple.levels;
    if (levels && levels[templeBuilding.level - 1]) {
      sp += levels[templeBuilding.level - 1].spBonus || 0;
    }
  }
  return sp;
};

// ════ BUILDING LOGIC ════
export const canBuild = (provinceId, buildingId, provinces, player) => {
  const province = provinces[provinceId];
  const building = BUILDINGS[buildingId];
  
  if (!province || !building) return false;
  if (province.owner !== player.id) return false;
  if (province.buildings[buildingId]?.level >= building.maxLevel) return false;
  if (building.requiresCoastal && !isProvinceCoastal(province)) return false;
  
  // Check cost
  const cost = building.cost || {};
  for (const [k, v] of Object.entries(cost)) {
    if ((player.resources?.[k] ?? 0) < v) return false;
  }
  
  return true;
};

export const buildInProvince = (provinceId, buildingId, provinces, player) => {
  if (!canBuild(provinceId, buildingId, provinces, player)) return null;
  
  const newProvinces = { ...provinces };
  const province = { ...newProvinces[provinceId] };
  const building = { ...BUILDINGS[buildingId] };
  
  if (!province.buildings[buildingId]) {
    province.buildings[buildingId] = { ...building, level: 1 };
  } else {
    province.buildings[buildingId].level += 1;
  }
  
  newProvinces[provinceId] = province;
  return newProvinces;
};

export const isProvinceCoastal = (province) => {
  return province.terrain_distribution.coastal > 0;
};

// ════ CONQUEST ════
export const conquestResult = (attackerUnits, defenderUnits, hasAttackerWon) => {
  return hasAttackerWon && attackerUnits.some(u => u.type !== 'naval');
};

// ════ PILLAGE ════
export const pillageProvince = (province) => {
  const looted = {};
  Object.entries(province.buildings).forEach(([id, b]) => {
    looted[id] = b.level;
  });
  const pillaged = { ...province, buildings: {}, pillaged: true, garrison: [] };
  return { pillaged, looted };
};

// ════ DISPLAY ════
export const getProvinceSummary = (province) => ({
  name: province.name,
  owner: province.owner,
  capital: province.capital_name,
  is_national_capital: province.is_national_capital,
  defense: getProvinceDefense(province),
  income: getProvinceIncome(province).gold,
  sp: getProvinceSP(province),
  garrison: province.garrison,
  buildings: Object.keys(province.buildings),
});