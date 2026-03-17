// ============================================================
// HEX WORLD GENERATOR - Procedural Map Generation
// ============================================================
// Generates a hex-based world map with specified water bodies,
// coastlines, and land formations for strategy gameplay.

import { HexUtils } from './hexGridSystem';

// ---- GRID DIMENSIONS ----
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;

// ---- HEX COORDINATE CONVERSION ----
// Convert axial (q, r) to 2D array indices for easier access
const toIndex = (q, r) => {
  const col = q + GRID_WIDTH / 2;
  const row = r + GRID_HEIGHT / 2;
  if (col < 0 || col >= GRID_WIDTH || row < 0 || row >= GRID_HEIGHT) return -1;
  return row * GRID_WIDTH + col;
};

const toCoords = (index) => {
  const row = Math.floor(index / GRID_WIDTH);
  const col = index % GRID_WIDTH;
  return [col - GRID_WIDTH / 2, row - GRID_HEIGHT / 2]; // q, r
};

// ---- TERRAIN TYPES ----
const TERRAIN_TYPES = {
  LAND: 'land',
  WATER: 'water',
};

const LAND_TERRAINS = ['plains', 'forest', 'mountain', 'tundra', 'desert', 'wasteland'];

// ---- WORLD MAP GENERATOR ----
export const generateWorldMap = () => {
  // Initialize grid (all water by default)
  const grid = Array(GRID_WIDTH * GRID_HEIGHT).fill(TERRAIN_TYPES.WATER);

  // ---- PLACE CONTINENTS ----
  // Large mainland supercontinent
  placeMainland(grid);
  
  // ---- CREATE WATER BODIES ----
  // 1. Central Sea (lower-middle)
  placeCentralSea(grid);
  
  // 2. Northern Fractured Sea (top region)
  placeNorthernFragmentedSea(grid);
  
  // 3. Western Ocean (left edge)
  placeWesternOcean(grid);
  
  // 4. Southeast Coastal Waters (bottom-right)
  placeSeCoastalWaters(grid);
  
  // ---- CREATE CHOKEPOINTS (narrow land bridges) ----
  createChokepoints(grid);
  
  // ---- SMOOTH COASTLINES ----
  smoothCoastlines(grid);
  
  // ---- CONVERT TO HEX OBJECTS ----
  return gridToHexObjects(grid);
};

// ---- MAINLAND GENERATION ----
// Create a large, mostly continuous supercontinent
const placeMainland = (grid) => {
  // Use circular blob in center-to-upper area
  const centerQ = 0;
  const centerR = -5;
  const radius = 12;

  for (let q = -GRID_WIDTH / 2; q < GRID_WIDTH / 2; q++) {
    for (let r = -GRID_HEIGHT / 2; r < GRID_HEIGHT / 2; r++) {
      const distance = Math.sqrt(
        Math.pow(q - centerQ, 2) + Math.pow(r - centerR, 2)
      );
      if (distance <= radius) {
        const idx = toIndex(q, r);
        if (idx >= 0) grid[idx] = TERRAIN_TYPES.LAND;
      }
    }
  }

  // Add eastern and western extensions
  for (let r = -8; r <= 8; r++) {
    // Western extension
    const idx1 = toIndex(-15, r);
    if (idx1 >= 0) grid[idx1] = TERRAIN_TYPES.LAND;
    
    // Eastern extension
    const idx2 = toIndex(15, r);
    if (idx2 >= 0) grid[idx2] = TERRAIN_TYPES.LAND;
  }

  // Southern landmass
  const southCenterQ = 0;
  const southCenterR = 8;
  const southRadius = 8;
  
  for (let q = -GRID_WIDTH / 2; q < GRID_WIDTH / 2; q++) {
    for (let r = -GRID_HEIGHT / 2; r < GRID_HEIGHT / 2; r++) {
      const distance = Math.sqrt(
        Math.pow(q - southCenterQ, 2) + Math.pow(r - southCenterR, 2)
      );
      if (distance <= southRadius) {
        const idx = toIndex(q, r);
        if (idx >= 0) grid[idx] = TERRAIN_TYPES.LAND;
      }
    }
  }
};

// ---- CENTRAL SEA ----
// Lower-middle cluster of water, surrounded by land
const placeCentralSea = (grid) => {
  const centerQ = 0;
  const centerR = 6;
  const seaRadius = 5;

  // Create water cluster
  for (let q = -GRID_WIDTH / 2; q < GRID_WIDTH / 2; q++) {
    for (let r = -GRID_HEIGHT / 2; r < GRID_HEIGHT / 2; r++) {
      const distance = Math.sqrt(
        Math.pow(q - centerQ, 2) + Math.pow(r - centerR, 2)
      );
      if (distance <= seaRadius) {
        const idx = toIndex(q, r);
        if (idx >= 0) grid[idx] = TERRAIN_TYPES.WATER;
      }
    }
  }
};

// ---- NORTHERN FRACTURED SEA ----
// Mix of water and land, with narrow bridges
const placeNorthernFragmentedSea = (grid) => {
  const centerQ = 0;
  const centerR = -14;
  const fragmentRadius = 6;

  // Create fragmented water pattern
  for (let q = -GRID_WIDTH / 2; q < GRID_WIDTH / 2; q++) {
    for (let r = -GRID_HEIGHT / 2; r < GRID_HEIGHT / 2; r++) {
      const distance = Math.sqrt(
        Math.pow(q - centerQ, 2) + Math.pow(r - centerR, 2)
      );
      if (distance <= fragmentRadius) {
        // Checkerboard-like pattern for fragmentation
        if ((q + r) % 3 === 0) {
          const idx = toIndex(q, r);
          if (idx >= 0) grid[idx] = TERRAIN_TYPES.WATER;
        }
      }
    }
  }
};

// ---- WESTERN OCEAN ----
// Continuous water boundary along left edge
const placeWesternOcean = (grid) => {
  const oceanLeftBound = -18;
  
  for (let q = -GRID_WIDTH / 2; q <= oceanLeftBound; q++) {
    for (let r = -GRID_HEIGHT / 2; r < GRID_HEIGHT / 2; r++) {
      const idx = toIndex(q, r);
      if (idx >= 0) grid[idx] = TERRAIN_TYPES.WATER;
    }
  }
};

// ---- SOUTHEAST COASTAL WATERS ----
// Mix of land and water in bottom-right area
const placeSeCoastalWaters = (grid) => {
  const centerQ = 12;
  const centerR = 10;
  const radius = 6;

  for (let q = -GRID_WIDTH / 2; q < GRID_WIDTH / 2; q++) {
    for (let r = -GRID_HEIGHT / 2; r < GRID_HEIGHT / 2; r++) {
      const distance = Math.sqrt(
        Math.pow(q - centerQ, 2) + Math.pow(r - centerR, 2)
      );
      if (distance <= radius) {
        // Create islands and water mix
        if ((Math.floor(q / 2) + Math.floor(r / 2)) % 2 === 0) {
          const idx = toIndex(q, r);
          if (idx >= 0) grid[idx] = TERRAIN_TYPES.WATER;
        }
      }
    }
  }
};

// ---- CREATE CHOKEPOINTS ----
// Add narrow 1-2 hex wide land bridges for strategic gameplay
const createChokepoints = (grid) => {
  // Bridge between northern and central areas
  for (let q = -2; q <= 2; q++) {
    const idx = toIndex(q, -2);
    if (idx >= 0) grid[idx] = TERRAIN_TYPES.LAND;
  }

  // Bridge between western and central areas
  for (let r = -1; r <= 1; r++) {
    const idx = toIndex(-8, r);
    if (idx >= 0) grid[idx] = TERRAIN_TYPES.LAND;
  }

  // Bridge between central and southeast
  for (let q = 8; q <= 10; q++) {
    const idx = toIndex(q, 3);
    if (idx >= 0) grid[idx] = TERRAIN_TYPES.LAND;
  }
};

// ---- SMOOTH COASTLINES ----
// Create irregular coastlines by adjusting water/land borders
const smoothCoastlines = (grid) => {
  const smoothed = [...grid];
  const iterations = 2;

  for (let iter = 0; iter < iterations; iter++) {
    for (let idx = 0; idx < grid.length; idx++) {
      const [q, r] = toCoords(idx);
      const neighbors = HexUtils.getNeighbors(q, r);
      
      let waterNeighbors = 0;
      let landNeighbors = 0;

      for (const [nq, nr] of neighbors) {
        const nIdx = toIndex(nq, nr);
        if (nIdx >= 0) {
          if (grid[nIdx] === TERRAIN_TYPES.WATER) waterNeighbors++;
          else landNeighbors++;
        }
      }

      // Smooth edges: if surrounded mostly by one type, become that type
      if (waterNeighbors >= 4 && grid[idx] === TERRAIN_TYPES.LAND) {
        smoothed[idx] = TERRAIN_TYPES.WATER;
      }
      if (landNeighbors >= 4 && grid[idx] === TERRAIN_TYPES.WATER) {
        smoothed[idx] = TERRAIN_TYPES.LAND;
      }
    }
  }

  return smoothed;
};

// ---- ASSIGN TERRAIN TYPES TO LAND ----
const getTerrainForLand = (q, r) => {
  // Assign terrain based on position
  const noise = Math.abs(q * 17 + r * 23) % LAND_TERRAINS.length;
  
  // Cold terrain in north
  if (r < -8) return ['tundra', 'mountain'][Math.abs(q + r) % 2];
  
  // Mountains in center-east
  if (q > 8 && Math.abs(r) < 5) return ['mountain', 'plains'][Math.abs(q) % 2];
  
  // Forests in west
  if (q < -5) return ['forest', 'plains'][Math.abs(r) % 2];
  
  // Desert in southeast
  if (q > 5 && r > 5) return ['desert', 'wasteland'][Math.abs(q - r) % 2];
  
  // Default: varied
  return LAND_TERRAINS[noise];
};

// ---- CONVERT GRID TO HEX OBJECTS ----
const gridToHexObjects = (grid) => {
  const hexes = {};

  for (let idx = 0; idx < grid.length; idx++) {
    const [q, r] = toCoords(idx);
    const type = grid[idx];
    const hexId = `hex_${q}_${r}`;

    // Get neighbor IDs
    const neighbors = HexUtils.getNeighbors(q, r)
      .map(([nq, nr]) => {
        const nIdx = toIndex(nq, nr);
        return nIdx >= 0 ? `hex_${nq}_${nr}` : null;
      })
      .filter(Boolean);

    hexes[hexId] = {
      id: hexId,
      q,
      r,
      type: type,
      terrain: type === TERRAIN_TYPES.LAND ? getTerrainForLand(q, r) : 'ocean',
      region: null, // Can be assigned later
      faction: null,
      owner: null,
      units: [],
      hasFortress: false,
      isCapital: false,
      neighbors: neighbors,
    };
  }

  return hexes;
};

export const WORLD_MAP = generateWorldMap();