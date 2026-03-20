// ============================================================
// HEX WORLD GENERATOR - JSON Map Data
// ============================================================
// Uses a fixed map definition from JSON (col/row grid)
// converted to axial (q, r) hex coordinates.

import { HexUtils } from './hexGridSystem';

// Offset hex: col/row -> axial q/r
// Using "odd-r" offset: q = col - (row - (row & 1)) / 2, r = row
const offsetToAxial = (col, row) => {
  const q = col - Math.floor((row - (row & 1)) / 2);
  const r = row;
  return { q, r };
};

const FACTION_TERRAIN_MAP = {
  ocean: 'ocean',
  water: 'ocean',
  '': 'plains',
  gejeon: 'forest',
  inuvak: 'tundra',
  ruskel: 'plains',
  shadefell: 'wasteland',
  onishiman: 'plains',
  kadjimaran: 'desert',
  silverunion: 'plains',
  greenheart: 'forest',
  shadowsfall: 'wasteland',
  nimrudan: 'mountain',
};

// Paste new map data here
const MAP_DATA = [];

// ---- CONVERT JSON MAP TO HEX OBJECTS ----
export const generateWorldMap = () => {
  const hexes = {};

  MAP_DATA.forEach((cell) => {
    const { col, row, faction, is_coastal, terrain } = cell;
    const { q, r } = offsetToAxial(col, row);
    const hexId = `hex_${q}_${r}`;
    const isWater = terrain === 'water' || faction === 'ocean';
    const resolvedTerrain = isWater
      ? 'ocean'
      : (FACTION_TERRAIN_MAP[faction] || 'plains');

    hexes[hexId] = {
      id: hexId,
      q,
      r,
      col,
      row,
      type: isWater ? 'water' : 'land',
      terrain: resolvedTerrain,
      is_coastal,
      sourceFaction: faction || null,
      region: faction || null,
      owner: null,
      units: [],
      hasFortress: false,
      isCapital: false,
    };
  });

  return hexes;
};

export const WORLD_MAP = generateWorldMap();