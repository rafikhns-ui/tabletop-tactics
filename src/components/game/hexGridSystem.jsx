// ============================================================
// RULERS OF ARDONIA - Hexagonal Grid System
// ============================================================
// Uses axial coordinates (q, r) for hex positioning
// All gameplay logic relies on hex adjacency and distance

// ---- HEX UTILITIES ----
export const HexUtils = {
  // Convert axial (q, r) to cube (x, y, z) coordinates
  axialToCube: (q, r) => ({ x: q, y: -q - r, z: r }),
  
  // Get all 6 neighbors of a hex (using axial coordinates)
  getNeighbors: (q, r) => [
    [q + 1, r], [q - 1, r],           // ±q
    [q, r + 1], [q, r - 1],           // ±r
    [q + 1, r - 1], [q - 1, r + 1],   // diagonals
  ],

  // Calculate hex distance (number of hexes between two points)
  distance: (q1, r1, q2, r2) => {
    const x1 = q1, y1 = -q1 - r1, z1 = r1;
    const x2 = q2, y2 = -q2 - r2, z2 = r2;
    return (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2)) / 2;
  },

  // Get all hexes within a given range
  getRange: (q, r, range) => {
    const hexes = [];
    for (let i = -range; i <= range; i++) {
      for (let j = Math.max(-range, -i - range); j <= Math.min(range, -i + range); j++) {
        hexes.push([q + i, r + j]);
      }
    }
    return hexes;
  },

  // Get all hexes in a ring at exact distance
  getRing: (q, r, radius) => {
    const hexes = [];
    let [x, y] = [q + radius, r - radius];
    const directions = [
      [1, -1], [-1, 0], [0, 1],
      [-1, 1], [1, 0], [0, -1],
    ];
    for (const [dq, dr] of directions) {
      for (let i = 0; i < radius; i++) {
        hexes.push([x, y]);
        x += dq;
        y += dr;
      }
    }
    return hexes;
  },

  // Check if hex exists in grid
  isValid: (q, r, gridSize = 12) => {
    const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
    return distance / 2 <= gridSize;
  },

  // Get hexes along a line (for ranged attacks/vision)
  getLine: (q1, r1, q2, r2) => {
    const distance = HexUtils.distance(q1, r1, q2, r2);
    const hexes = [];
    for (let i = 0; i <= distance; i++) {
      const t = distance === 0 ? 0 : i / distance;
      const q = Math.round(q1 + (q2 - q1) * t);
      const r = Math.round(r1 + (r2 - r1) * t);
      hexes.push([q, r]);
    }
    return hexes;
  },
};

// ---- HEX DEFINITIONS ----
// Grid is approximately 12-hex radius
// Using axial coordinates (q, r) where q increases right, r increases down-left

// Continent definitions with centers and radius
const CONTINENTS = [
  { name: 'Western Continent', centerQ: -15, centerR: 0, radius: 10 },
  { name: 'Eastern Continent', centerQ: 15, centerR: 0, radius: 10 },
  { name: 'Northern Continent', centerQ: 0, centerR: -14, radius: 9 },
  { name: 'Southern Continent', centerQ: 5, centerR: 12, radius: 8 },
];

const isLandTile = (q, r) => {
  // Check if hex is within any continent
  for (const continent of CONTINENTS) {
    const distance = Math.sqrt(Math.pow(q - continent.centerQ, 2) + Math.pow(r - continent.centerR, 2));
    if (distance <= continent.radius) return true;
  }
  return false;
};

const getTerrainForLand = (q, r) => {
  const landTerrains = ['plains', 'forest', 'mountain', 'tundra', 'desert', 'wasteland'];
  return landTerrains[Math.abs(q + r) % landTerrains.length];
};

export const HEXES = (() => {
  const hexes = {};
  const regions = ['gojeon', 'onishiman', 'inuvak', 'silver', 'ruskel', 'icebound', 'kadjimaran', 'oakhaven', 'nimrudan', 'hestia', 'moor', 'tlaloc', 'verdant', 'iron', 'scorched'];
  
  for (let q = -30; q <= 30; q++) {
    for (let r = -22; r <= 22; r++) {
      const hexId = `hex_${q}_${r}`;
      const terrain = isLandTile(q, r) ? getTerrainForLand(q, r) : 'ocean';
      const region = regions[Math.abs(q * r + q + r) % regions.length];
      
      hexes[hexId] = {
        id: hexId,
        q,
        r,
        terrain,
        region,
        faction: null,
        resource: terrain !== 'ocean' && Math.random() > 0.7 ? ['gold', 'ore', 'wood', 'fish'][Math.floor(Math.random() * 4)] : null,
      };
    }
  }
  return hexes;
})();

// ---- BUILD HEX ADJACENCY ----
export const buildHexAdjacency = () => {
  const adjacency = {};
  Object.entries(HEXES).forEach(([hexId, hex]) => {
    const neighbors = HexUtils.getNeighbors(hex.q, hex.r);
    adjacency[hexId] = neighbors
      .map(([q, r]) => {
        const neighbor = Object.values(HEXES).find(h => h.q === q && h.r === r);
        return neighbor?.id;
      })
      .filter(Boolean);
  });
  return adjacency;
};

// ---- REGION DEFINITIONS ----
// Regions are collections of hexes with shared bonuses
export const REGIONS = {
  gojeon: {
    name: 'Gojeon Kingdom',
    hexes: ['gojeon_1', 'gojeon_2', 'gojeon_3', 'gojeon_4'],
    faction: 'gojeon',
    bonus: 'Forest hexes give +1 defense. Control grants +2 IP/turn.',
  },
  onishiman: {
    name: 'Onishiman Empire',
    hexes: ['onishiman_1', 'onishiman_2', 'onishiman_3', 'onishiman_4', 'onishiman_5'],
    faction: 'onishiman',
    bonus: 'Plains hexes produce +1 Wheat. Control grants +1 Gold/turn.',
  },
  inuvak: {
    name: 'Inuvak Confederacy',
    hexes: ['inuvak_1', 'inuvak_2', 'inuvak_3', 'inuvak_4'],
    faction: 'kadjimaran',
    bonus: 'Tundra units gain +1 defense. Control grants +2 SP/turn.',
  },
  silver: {
    name: 'Silver Union',
    hexes: ['silver_1', 'silver_2', 'silver_3'],
    faction: null,
    bonus: 'Gold hexes produce +1 Gold. Control grants +3 Gold/turn.',
  },
  ruskel: {
    name: 'Ruskel Federation',
    hexes: ['ruskel_1', 'ruskel_2', 'ruskel_3'],
    faction: 'kadjimaran',
    bonus: 'Mountain hexes produce +1 Ore. Control grants +2 Gold/turn.',
  },
  icebound: {
    name: 'Icebound Horde',
    hexes: ['icebound_1', 'icebound_2'],
    faction: 'kadjimaran',
    bonus: 'Tundra units cost -1 Wheat. Control grants +1 Wheat/turn.',
  },
  kadjimaran: {
    name: 'Kadjimaran Kingdom',
    hexes: ['kadjimaran_1', 'kadjimaran_2', 'kadjimaran_3', 'kadjimaran_4', 'kadjimaran_5'],
    faction: 'kadjimaran',
    bonus: 'Desert hexes grant +1 troop mobility. Control grants +3 Wheat/turn.',
  },
  oakhaven: {
    name: 'Republic of Oakhaven',
    hexes: ['oakhaven_1', 'oakhaven_2', 'oakhaven_3'],
    faction: 'republic',
    bonus: 'Forest hexes produce +1 Wood. Control grants +2 IP/turn.',
  },
  nimrudan: {
    name: 'Nimrudan Empire',
    hexes: ['nimrudan_1', 'nimrudan_2', 'nimrudan_3', 'nimrudan_4'],
    faction: 'sultanate',
    bonus: 'Mountain hexes provide strongholds. Control grants +2 SP/turn.',
  },
  hestia: {
    name: 'Hestia',
    hexes: ['hestia_1', 'hestia_2', 'hestia_3'],
    faction: 'republic',
    bonus: 'Ocean hexes grant naval bonuses. Control grants +2 Gold/turn.',
  },
  moor: {
    name: 'Moor Sultanate',
    hexes: ['moor_1', 'moor_2'],
    faction: 'sultanate',
    bonus: 'Desert-ocean junction. Control grants +1 SP/turn.',
  },
  tlalocayotlan: {
    name: 'Tlalocayotlan League',
    hexes: ['tlaloc_1', 'tlaloc_2', 'tlaloc_3'],
    faction: 'republic',
    bonus: 'Forest hexes are ritual sites. Control grants +2 SP/turn.',
  },
  verdant: {
    name: 'Verdant Vale',
    hexes: ['verdant_1', 'verdant_2'],
    faction: null,
    bonus: 'Forest resources, neutral zone.',
  },
  iron: {
    name: 'Iron Wastes',
    hexes: ['iron_1', 'iron_2'],
    faction: null,
    bonus: 'Ore production, isolated coast.',
  },
  scorched: {
    name: 'Scorched Lands',
    hexes: ['scorched_1', 'scorched_2'],
    faction: null,
    bonus: 'Wasteland, hazardous terrain.',
  },
};

// ---- TERRAIN PROPERTIES ----
export const TERRAIN_PROPS = {
  plains: { movementCost: 1, defense: 0, vision: 3 },
  forest: { movementCost: 2, defense: 1, vision: 2 },
  mountain: { movementCost: 3, defense: 2, vision: 1, blocking: true },
  tundra: { movementCost: 1, defense: 1, vision: 2 },
  desert: { movementCost: 2, defense: 0, vision: 3 },
  ocean: { movementCost: 1, defense: 0, vision: 3, naval: true },
  wasteland: { movementCost: 3, defense: 0, vision: 2, hazardous: true },
};

// ---- HEX VISUALIZATION (for rendering) ----
// Convert hex coordinates to pixel positions for a hex map display
export const hexToPixel = (q, r, size = 30) => {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
};

// ---- MOVEMENT HELPERS ----
export const getMovementPath = (fromId, toId, adjacency) => {
  // Simple pathfinding using BFS
  const queue = [[fromId, [fromId]]];
  const visited = new Set([fromId]);
  
  while (queue.length > 0) {
    const [current, path] = queue.shift();
    if (current === toId) return path;
    
    const neighbors = adjacency[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  return null; // No path found
};

// ---- RANGE HELPERS ----
export const getHexesInRange = (centerId, range, allHexes) => {
  const centerHex = HEXES[centerId];
  if (!centerHex) return [];
  
  return Object.values(HEXES).filter(hex => 
    HexUtils.distance(centerHex.q, centerHex.r, hex.q, hex.r) <= range
  ).map(h => h.id);
};

// Get all hexes affected by an area effect (1-ring radius)
export const getAreaEffectHexes = (targetId, radius = 1) => {
  const target = HEXES[targetId];
  if (!target) return [];
  
  const hexes = [];
  const allInRange = HexUtils.getRange(target.q, target.r, radius);
  
  for (const [q, r] of allInRange) {
    const hex = Object.values(HEXES).find(h => h.q === q && h.r === r);
    if (hex) hexes.push(hex.id);
  }
  
  return hexes;
};

// ---- TERRAIN-BASED MOVEMENT ----
export const isOceanTerrain = (terrain) => terrain === 'ocean';
export const isLandTerrain = (terrain) => !isOceanTerrain(terrain);

export const isCoastalHex = (hexId) => {
  const hex = HEXES[hexId];
  if (!hex) return false;
  
  const neighbors = HexUtils.getNeighbors(hex.q, hex.r);
  const terrains = neighbors
    .map(([q, r]) => Object.values(HEXES).find(h => h.q === q && h.r === r)?.terrain)
    .filter(Boolean);
  
  const hasOcean = terrains.some(t => isOceanTerrain(t));
  const hasLand = terrains.some(t => isLandTerrain(t));
  
  return hasOcean && hasLand;
};

export const canUnitEnter = (hexId, unitType) => {
  const hex = HEXES[hexId];
  if (!hex) return false;
  
  const isOcean = isOceanTerrain(hex.terrain);
  
  if (unitType === 'naval' || unitType === 'ship') {
    return isOcean;
  } else if (unitType === 'coastal' || unitType === 'scout') {
    return isCoastalHex(hexId);
  } else {
    // Regular land units
    return !isOcean;
  }
};