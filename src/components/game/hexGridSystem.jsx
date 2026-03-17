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

export const HEXES = {
  // Gojeon Kingdom (north-west)
  'gojeon_1': { id: 'gojeon_1', q: -8, r: -4, terrain: 'forest', region: 'gojeon', faction: 'gojeon', resource: null },
  'gojeon_2': { id: 'gojeon_2', q: -9, r: -3, terrain: 'forest', region: 'gojeon', faction: 'gojeon', resource: null },
  'gojeon_3': { id: 'gojeon_3', q: -7, r: -5, terrain: 'mountain', region: 'gojeon', faction: 'gojeon', resource: 'ore' },
  'gojeon_4': { id: 'gojeon_4', q: -8, r: -5, terrain: 'mountain', region: 'gojeon', faction: 'gojeon', resource: 'ore' },

  // Onishiman Empire (west)
  'onishiman_1': { id: 'onishiman_1', q: -6, r: -2, terrain: 'plains', region: 'onishiman', faction: 'onishiman', resource: 'wheat' },
  'onishiman_2': { id: 'onishiman_2', q: -5, r: -1, terrain: 'plains', region: 'onishiman', faction: 'onishiman', resource: 'wheat' },
  'onishiman_3': { id: 'onishiman_3', q: -6, r: 0, terrain: 'plains', region: 'onishiman', faction: 'onishiman', resource: 'wheat' },
  'onishiman_4': { id: 'onishiman_4', q: -7, r: 2, terrain: 'plains', region: 'onishiman', faction: 'onishiman', resource: null },
  'onishiman_5': { id: 'onishiman_5', q: -6, r: 3, terrain: 'ocean', region: 'onishiman', faction: 'onishiman', resource: 'fish' },

  // Inuvak Confederacy (north-central)
  'inuvak_1': { id: 'inuvak_1', q: -2, r: -6, terrain: 'tundra', region: 'inuvak', faction: 'kadjimaran', resource: null },
  'inuvak_2': { id: 'inuvak_2', q: 0, r: -7, terrain: 'tundra', region: 'inuvak', faction: 'kadjimaran', resource: null },
  'inuvak_3': { id: 'inuvak_3', q: 1, r: -6, terrain: 'tundra', region: 'inuvak', faction: 'kadjimaran', resource: null },
  'inuvak_4': { id: 'inuvak_4', q: 0, r: -8, terrain: 'tundra', region: 'inuvak', faction: 'kadjimaran', resource: null },

  // Silver Union (central neutral zone)
  'silver_1': { id: 'silver_1', q: -2, r: -2, terrain: 'plains', region: 'silver', faction: null, resource: 'gold' },
  'silver_2': { id: 'silver_2', q: -1, r: -3, terrain: 'mountain', region: 'silver', faction: null, resource: 'gold' },
  'silver_3': { id: 'silver_3', q: 0, r: -2, terrain: 'plains', region: 'silver', faction: null, resource: null },

  // Ruskel Federation (north-east)
  'ruskel_1': { id: 'ruskel_1', q: 4, r: -8, terrain: 'tundra', region: 'ruskel', faction: 'kadjimaran', resource: null },
  'ruskel_2': { id: 'ruskel_2', q: 5, r: -7, terrain: 'mountain', region: 'ruskel', faction: 'kadjimaran', resource: 'ore' },
  'ruskel_3': { id: 'ruskel_3', q: 6, r: -7, terrain: 'mountain', region: 'ruskel', faction: 'kadjimaran', resource: 'ore' },

  // Icebound Horde (far north-east)
  'icebound_1': { id: 'icebound_1', q: 7, r: -8, terrain: 'tundra', region: 'icebound', faction: 'kadjimaran', resource: null },
  'icebound_2': { id: 'icebound_2', q: 8, r: -7, terrain: 'tundra', region: 'icebound', faction: 'kadjimaran', resource: null },

  // Kadjimaran Kingdom (central)
  'kadjimaran_1': { id: 'kadjimaran_1', q: 2, r: -4, terrain: 'desert', region: 'kadjimaran', faction: 'kadjimaran', resource: 'gold' },
  'kadjimaran_2': { id: 'kadjimaran_2', q: 3, r: -3, terrain: 'desert', region: 'kadjimaran', faction: 'kadjimaran', resource: null },
  'kadjimaran_3': { id: 'kadjimaran_3', q: 2, r: -2, terrain: 'desert', region: 'kadjimaran', faction: 'kadjimaran', resource: null },
  'kadjimaran_4': { id: 'kadjimaran_4', q: 1, r: -3, terrain: 'desert', region: 'kadjimaran', faction: 'kadjimaran', resource: null },
  'kadjimaran_5': { id: 'kadjimaran_5', q: 2, r: 0, terrain: 'desert', region: 'kadjimaran', faction: 'kadjimaran', resource: null },

  // Oakhaven (east, forest)
  'oakhaven_1': { id: 'oakhaven_1', q: 6, r: -4, terrain: 'forest', region: 'oakhaven', faction: 'republic', resource: 'wood' },
  'oakhaven_2': { id: 'oakhaven_2', q: 7, r: -3, terrain: 'forest', region: 'oakhaven', faction: 'republic', resource: 'wood' },
  'oakhaven_3': { id: 'oakhaven_3', q: 7, r: -4, terrain: 'forest', region: 'oakhaven', faction: 'republic', resource: 'wood' },

  // Nimrudan Empire (south-east)
  'nimrudan_1': { id: 'nimrudan_1', q: 5, r: -1, terrain: 'mountain', region: 'nimrudan', faction: 'sultanate', resource: 'ore' },
  'nimrudan_2': { id: 'nimrudan_2', q: 6, r: 0, terrain: 'desert', region: 'nimrudan', faction: 'sultanate', resource: null },
  'nimrudan_3': { id: 'nimrudan_3', q: 6, r: 2, terrain: 'ocean', region: 'nimrudan', faction: 'sultanate', resource: 'fish' },
  'nimrudan_4': { id: 'nimrudan_4', q: 5, r: 3, terrain: 'ocean', region: 'nimrudan', faction: 'sultanate', resource: 'fish' },

  // Hestia (south-central)
  'hestia_1': { id: 'hestia_1', q: 1, r: 2, terrain: 'plains', region: 'hestia', faction: 'republic', resource: 'wheat' },
  'hestia_2': { id: 'hestia_2', q: 2, r: 2, terrain: 'plains', region: 'hestia', faction: 'republic', resource: 'wheat' },
  'hestia_3': { id: 'hestia_3', q: 1, r: 3, terrain: 'ocean', region: 'hestia', faction: 'republic', resource: 'fish' },

  // Moor Sultanate (far south-east)
  'moor_1': { id: 'moor_1', q: 5, r: 4, terrain: 'desert', region: 'moor', faction: 'sultanate', resource: null },
  'moor_2': { id: 'moor_2', q: 6, r: 4, terrain: 'ocean', region: 'moor', faction: 'sultanate', resource: 'fish' },

  // Tlalocayotlan (south-west)
  'tlaloc_1': { id: 'tlaloc_1', q: -7, r: 4, terrain: 'forest', region: 'tlalocayotlan', faction: 'republic', resource: 'wood' },
  'tlaloc_2': { id: 'tlaloc_2', q: -6, r: 5, terrain: 'forest', region: 'tlalocayotlan', faction: 'republic', resource: 'wood' },
  'tlaloc_3': { id: 'tlaloc_3', q: -7, r: 6, terrain: 'ocean', region: 'tlalocayotlan', faction: 'republic', resource: 'fish' },

  // Verdant Vale (south-centre, neutral)
  'verdant_1': { id: 'verdant_1', q: -3, r: 2, terrain: 'forest', region: 'verdant', faction: null, resource: 'wood' },
  'verdant_2': { id: 'verdant_2', q: -4, r: 3, terrain: 'forest', region: 'verdant', faction: null, resource: 'wood' },

  // Iron Wastes (far west coast, neutral)
  'iron_1': { id: 'iron_1', q: -10, r: 0, terrain: 'mountain', region: 'iron', faction: null, resource: 'ore' },
  'iron_2': { id: 'iron_2', q: -10, r: 2, terrain: 'ocean', region: 'iron', faction: null, resource: null },

  // Scorched Lands (far east, neutral)
  'scorched_1': { id: 'scorched_1', q: 8, r: 0, terrain: 'wasteland', region: 'scorched', faction: null, resource: null },
  'scorched_2': { id: 'scorched_2', q: 9, r: -2, terrain: 'wasteland', region: 'scorched', faction: null, resource: null },
};

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