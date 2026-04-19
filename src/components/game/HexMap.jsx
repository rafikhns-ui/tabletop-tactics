import React, { useMemo, useState, useRef, useEffect } from 'react';
import mapData from './ardonia_game_map.json';
import { FACTIONS, FACTION_TO_NATION_ID } from './ardoniaData';

// Special event locations pinned to specific nation centroids
const SPECIAL_EVENTS = [
  { id: 'ancient_ruin', label: 'Ancient Ruin', icon: '🏛️', color: '#9b59b6', desc: 'Mysterious power lingers here' },
  { id: 'sacred_spring', label: 'Sacred Spring', icon: '💧', color: '#3498db', desc: 'SP regeneration aura' },
  { id: 'battlefield', label: 'Cursed Battlefield', icon: '💀', color: '#e74c3c', desc: 'Combat power +1 for attackers' },
  { id: 'trade_nexus', label: 'Trade Nexus', icon: '💰', color: '#f39c12', desc: 'Gold income bonus nearby' },
  { id: 'dark_portal', label: 'Dark Portal', icon: '🌀', color: '#8e44ad', desc: 'Avatar summoning discounted' },
];

// Legacy nation_id aliases from the map JSON
const NATION_ID_ALIASES = {
  kinetic:        'kintei',
  ilalocatotlan:  'tlalocayotlan',
  hestia:         'republic',
  azure:          'sultanate',
  shadowsfall:    'shadowfell',
  silver:         'silver_union',
};
const normNationId = (id) => NATION_ID_ALIASES[id] || id;

// ══════ TERRAIN COLORS (dark fantasy palette) ══════
const TERRAIN_COLORS = {
  water:    '#183a5c',
  coastal:  '#2a6080',
  plains:   '#5a7a30',
  forest:   '#1e4a1e',
  hills:    '#6a6030',
  mountain: '#4a4a5a',
  desert:   '#9a7a30',
  swamp:    '#3a4a2a',
  tundra:   '#7a8a9a',
  scorched: '#4a1a0a',
};

// ══════ NATION COLORS (from game data) ══════
const NATION_COLORS = {};
mapData.nations.forEach(n => { NATION_COLORS[n.id] = n.color; });



// ══════ FACTION LABEL DATA (from JSON nations centroids) ══════
const NATION_LABEL_MAP = {
  gojeon:        { name: 'Gojeon Kingdom',        color: '#7b5ea7' },
  inuvak:        { name: 'Inuvak Confederacy',     color: '#5dade2' },
  ruskel:        { name: 'Ruskel Federation',      color: '#7f8c8d' },
  icebound:      { name: 'Icebound Horde',         color: '#aed6f1' },
  oakhaven:      { name: 'Republic of Oakhaven',   color: '#27ae60' },
  onishiman:     { name: 'Onishiman Empire',       color: '#8b1a1a' },
  kadjimaran:    { name: 'Kadjimaran Kingdom',     color: '#8b6a1a' },
  nimrudan:      { name: 'Nimrudan Empire',        color: '#e67e22' },
  kinetic:       { name: 'Greater Kintei',         color: '#d35400' },
  ilalocatotlan: { name: 'Tlalocayotlan League',   color: '#c0392b' },
  hestia:        { name: 'Republic of Hestia',     color: '#1a7a5a' },
  azure:         { name: 'Blue Moon Sultanate',    color: '#1a5a8b' },
  silver:        { name: 'Silver Union',           color: '#bdc3c7' },
  shadowsfall:   { name: 'Order of Shadowsfall',   color: '#3C3C3C' },
  scorched:      { name: 'The Scorched Lands',     color: '#8B3A0F' },
};

const FACTION_CENTROIDS = mapData.nations
  .filter(n => NATION_LABEL_MAP[n.id])
  .map(n => ({
    fid: n.id,
    x: n.centroid[0],
    y: n.centroid[1],
    name: NATION_LABEL_MAP[n.id].name,
    color: NATION_LABEL_MAP[n.id].color,
  }));

// ══════ CAPITAL HEX LOOKUP ══════
// For each province, find its "capital hex" = hex closest to its province centroid
// national_capital = true means it's the nation's throne city
// Maps hexId -> { isNatCap, isProvCap, nationId, provinceId, capitalName }
const CAPITAL_HEX_INFO = {};
const NATIONAL_CAPITAL_HEX_IDS = new Set();
const PROVINCE_CAPITAL_HEX_IDS = new Set();

mapData.nations.forEach(nation => {
  (nation.provinces || []).forEach(prov => {
    const hexesInProv = mapData.hex_grid.filter(h => h.nation_id === nation.id && h.province === prov.id);
    if (!hexesInProv.length) return;
    // Use the hex closest to the nation centroid for nat caps, else province centroid
    const [cx, cy] = nation.centroid || [0, 0];
    const provCx = hexesInProv.reduce((s, h) => s + h.x, 0) / hexesInProv.length;
    const provCy = hexesInProv.reduce((s, h) => s + h.y, 0) / hexesInProv.length;
    const refX = prov.is_national_capital ? cx : provCx;
    const refY = prov.is_national_capital ? cy : provCy;
    let best = hexesInProv[0], bestDist = Infinity;
    hexesInProv.forEach(h => {
      const d = Math.hypot(h.x - refX, h.y - refY);
      if (d < bestDist) { bestDist = d; best = h; }
    });
    const hexId = `${best.col},${best.row}`;
    CAPITAL_HEX_INFO[hexId] = {
      isNatCap: !!prov.is_national_capital,
      isProvCap: true,
      nationId: nation.id,
      provinceId: prov.id,
      capitalName: prov.capital || '',
    };
    if (prov.is_national_capital) NATIONAL_CAPITAL_HEX_IDS.add(hexId);
    PROVINCE_CAPITAL_HEX_IDS.add(hexId);
  });
});

// Province ownership: a province is owned by whoever owns its capital hex
// hexId -> province key (nationId-provinceId)
const PROVINCE_CAPITAL_HEX_TO_PROVINCE = {};
Object.entries(CAPITAL_HEX_INFO).forEach(([hexId, info]) => {
  PROVINCE_CAPITAL_HEX_TO_PROVINCE[hexId] = `${info.nationId}-${info.provinceId}`;
});
// province key -> capital hexId
const PROVINCE_TO_CAPITAL_HEX = {};
Object.entries(PROVINCE_CAPITAL_HEX_TO_PROVINCE).forEach(([hexId, provKey]) => {
  PROVINCE_TO_CAPITAL_HEX[provKey] = hexId;
});
// hex -> province key (all hexes)
const HEX_TO_PROVINCE_KEY = {};
mapData.hex_grid.forEach(h => {
  if (h.nation_id && h.province) HEX_TO_PROVINCE_KEY[`${h.col},${h.row}`] = `${h.nation_id}-${h.province}`;
});

// ══════ HEX GEOMETRY ══════
function flatHexCorners(cx, cy, size) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(' ');
}

// ══════ PRE-COMPUTE province centroids + neighbor lookup ══════
const hexLookup = {};
mapData.hex_grid.forEach(h => { hexLookup[`${h.col},${h.row}`] = h; });

const provinceCentroids = {};
mapData.hex_grid.forEach(h => {
  if (!h.nation_id || !h.province) return;
  const normNid = normNationId(h.nation_id);
  const key = `${normNid}-${h.province}`;
  if (!provinceCentroids[key]) provinceCentroids[key] = { sx: 0, sy: 0, cnt: 0, nid: normNid, prov: h.province };
  provinceCentroids[key].sx += h.x;
  provinceCentroids[key].sy += h.y;
  provinceCentroids[key].cnt++;
});
const provCentroidList = Object.values(provinceCentroids).map(p => ({
  x: p.sx / p.cnt,
  y: p.sy / p.cnt,
  nid: p.nid,
  prov: p.prov,
}));

// Hex neighbor offsets (flat-top)
function hexNeighborKeys(gc, gr) {
  const even = gc % 2 === 0;
  return [
    [gc + 1, even ? gr - 1 : gr], [gc + 1, even ? gr : gr + 1],
    [gc - 1, even ? gr - 1 : gr], [gc - 1, even ? gr : gr + 1],
    [gc, gr - 1], [gc, gr + 1],
  ];
}

// ══════ COMPONENT ══════
// Quick combat estimate: returns { winChance, attackerLosses, defenderLosses }
function estimateCombat(attackerUnits, defenderUnits, hasFortress) {
  if (!attackerUnits?.length || !defenderUnits?.length) return null;
  const atkCount = attackerUnits.reduce((s, u) => s + u.count, 0);
  const defCount = defenderUnits.reduce((s, u) => s + u.count, 0);
  const atkDice = Math.min(3, Math.max(1, atkCount - 1));
  const defDice = Math.min(2, defCount);
  // Monte Carlo — 200 simulations
  let wins = 0, totalAtkLoss = 0, totalDefLoss = 0;
  const SIMS = 200;
  for (let s = 0; s < SIMS; s++) {
    let a = atkCount, d = defCount;
    let aLoss = 0, dLoss = 0;
    for (let r = 0; r < 3 && a > 1 && d > 0; r++) {
      const aRolls = Array.from({length: Math.min(3, a-1)}, () => Math.floor(Math.random()*6)+1).sort((x,y)=>y-x);
      const dRolls = Array.from({length: Math.min(2, d)}, () => Math.floor(Math.random()*6)+(hasFortress?4:1)).sort((x,y)=>y-x);
      const pairs = Math.min(aRolls.length, dRolls.length);
      for (let p = 0; p < pairs; p++) {
        if (aRolls[p] > dRolls[p]) { d--; dLoss++; } else { a--; aLoss++; }
      }
    }
    if (d <= 0) wins++;
    totalAtkLoss += aLoss;
    totalDefLoss += dLoss;
  }
  return {
    winChance: Math.round((wins / SIMS) * 100),
    attackerLosses: (totalAtkLoss / SIMS).toFixed(1),
    defenderLosses: (totalDefLoss / SIMS).toFixed(1),
    atkCount, defCount,
  };
}

export default function HexMap({ gameState, selectedHex, selectedProvince, phase, currentPlayer, onHexClick, onProvincClick, movementState, movedHexes, highlightPlayerId, reachableHexes, attackableHexes, onZoomChange, onSelectPanelUnit, showInfluenceOverlay, sentiment, draggingDeployUnit, onDragDeployDrop }) {
  const hexGrid = mapData.hex_grid;
  const nations = mapData.nations;
  const [selected, setSelected] = useState(null);
  const [panelTab, setPanelTab] = useState('selected');
  const [hoveredBorder, setHoveredBorder] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [selectedPanelUnits, setSelectedPanelUnits] = useState(new Set());
  const [combatTooltip, setCombatTooltip] = useState(null);
  const [combatFlashes, setCombatFlashes] = useState([]); // [{hexId, key}]
  const [hoveredSpecialEvent, setHoveredSpecialEvent] = useState(null);
  const [hoveredFactionLabel, setHoveredFactionLabel] = useState(null);

  const SVG_W = 1200;
  const SVG_H = 900;
  const HEX_SIZE = 2.5;
  const HEX_PX = HEX_SIZE * (SVG_W / 100);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(4);
  const [movingUnits, setMovingUnits] = useState([]);
  const prevHexesRef = useRef(null);

  // Assign special event locations to stable map positions (seeded by turn cycle)
  const turn = gameState?.turn || 1;
  const specialEventLocations = useMemo(() => {
    const slots = mapData.nations.filter(n => n.centroid).slice(0, SPECIAL_EVENTS.length);
    return SPECIAL_EVENTS.map((ev, i) => {
      const nation = slots[(i + Math.floor(turn / 5)) % slots.length];
      if (!nation) return null;
      return { ...ev, x: nation.centroid[0], y: nation.centroid[1] };
    }).filter(Boolean);
  }, [turn]);

  const toSVG = (px, py) => ({ cx: (px / 100) * SVG_W, cy: (py / 100) * SVG_H });

  // Build a hex position lookup: hexId -> {cx, cy}
  const hexPosByIdRef = useRef({});
  useEffect(() => {
    const map = {};
    mapData.hex_grid.forEach(h => {
      const { cx, cy } = { cx: (h.x / 100) * SVG_W, cy: (h.y / 100) * SVG_H };
      map[`${h.col},${h.row}`] = { cx, cy };
    });
    hexPosByIdRef.current = map;
  }, []);

  // Detect unit movements by comparing previous and current hexes
  useEffect(() => {
    if (!gameState?.hexes) { prevHexesRef.current = gameState?.hexes; return; }
    const prev = prevHexesRef.current;
    if (!prev) { prevHexesRef.current = gameState.hexes; return; }

    const animations = [];
    const hexPos = hexPosByIdRef.current;

    // Build map: unitSignature -> hexId for previous state
    const prevUnitMap = {}; // "playerId:unitType" -> [{hexId, count}]
    Object.entries(prev).forEach(([hexId, hex]) => {
      if (!hex.units?.length || !hex.owner) return;
      (hex.units || []).forEach(u => {
        const key = `${hex.owner}:${u.type}`;
        if (!prevUnitMap[key]) prevUnitMap[key] = [];
        prevUnitMap[key].push({ hexId, count: u.count });
      });
    });

    // Check current hexes for units that appeared or grew
    Object.entries(gameState.hexes).forEach(([hexId, hex]) => {
      if (!hex.units?.length || !hex.owner) return;
      (hex.units || []).forEach(u => {
        const key = `${hex.owner}:${u.type}`;
        const prevEntries = prevUnitMap[key] || [];
        // If this hexId wasn't in prev for this key, units moved here
        const wasHere = prevEntries.find(e => e.hexId === hexId);
        if (!wasHere) {
          // Find where they came from: any prev hex with same key that no longer has them (or has fewer)
          const source = prevEntries[0]; // best guess: moved from first source
          if (source && hexPos[source.hexId] && hexPos[hexId]) {
            const from = hexPos[source.hexId];
            const to = hexPos[hexId];
            const player = gameState.players?.find(p => p.id === hex.owner);
            animations.push({
              key: `${Date.now()}-${hexId}-${u.type}`,
              fromX: from.cx, fromY: from.cy,
              toX: to.cx, toY: to.cy,
              type: u.type,
              color: player?.color || '#d4a853',
            });
          }
        }
      });
    });

    prevHexesRef.current = gameState.hexes;

    if (animations.length > 0) {
      setMovingUnits(animations);
      // Add combat flash for destinations that are enemy-contested
      const flashes = animations.map(a => ({ hexId: a.toHexId || '', key: a.key + '-flash', color: a.color }));
      setCombatFlashes(flashes);
      const timer = setTimeout(() => { setMovingUnits([]); setCombatFlashes([]); }, 1100);
      return () => clearTimeout(timer);
    }
  }, [gameState?.hexes]);

  // ── Game state helpers ──
  // Build a map from nation_id -> owner player id using territories
  // Maps nation_id -> owner player id (a player owns all hexes of their faction's nation)
  const nationOwnerMap = useMemo(() => {
    const map = {};
    if (gameState?.players) {
      gameState.players.forEach(p => {
        if (!p.factionId) return;
        const nationId = FACTION_TO_NATION_ID[p.factionId] || p.factionId;
        map[nationId] = p.id;
      });
    }
    return map;
  }, [gameState?.players]);

  // Get province capital owner — determines who owns ALL hexes in that province
  const getProvinceOwner = (provKey) => {
    const capHexId = PROVINCE_TO_CAPITAL_HEX[provKey];
    if (!capHexId) return null;
    // Explicit owner on capital hex takes priority
    const capHexOwner = gameState?.hexes?.[capHexId]?.owner;
    if (capHexOwner) return capHexOwner;
    // Fall back to nation-based ownership for home territory
    const info = CAPITAL_HEX_INFO[capHexId];
    if (info) {
      const normId = normNationId(info.nationId);
      if (nationOwnerMap[normId]) return nationOwnerMap[normId];
    }
    return null;
  };

  const getOwner = (hexId, hexNationId) => {
    // Explicit hex owner (unit placement, conquest) always wins
    const hexOwner = gameState?.hexes?.[hexId]?.owner;
    if (hexOwner) return hexOwner;
    // Province-capital-based ownership: all hexes in a province belong to whoever holds the capital
    const provKey = HEX_TO_PROVINCE_KEY[hexId];
    if (provKey) {
      const provOwner = getProvinceOwner(provKey);
      if (provOwner) return provOwner;
    }
    // Final fallback: nation map
    if (hexNationId) {
      const normId = normNationId(hexNationId);
      if (nationOwnerMap[normId]) return nationOwnerMap[normId];
    }
    return null;
  };
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hexId) => gameState?.hexes?.[hexId]?.units || [];

  const handleHexClick = (hex) => {
    const hexId = `${hex.col},${hex.row}`;
    const hexWithBuildings = { ...hex, buildings: gameState?.hexes?.[hexId]?.buildings };
    setSelected(hexWithBuildings);
    setSelectedPanelUnits(new Set());
    // Auto-select the most relevant tab
    const units = gameState?.hexes?.[hexId]?.units || [];
    const hasUnits = units.length > 0;
    const hasBuildings = Object.keys(gameState?.hexes?.[hexId]?.buildings || {}).length > 0 || !!CAPITAL_HEX_INFO[hexId];
    if (hasUnits) setPanelTab('units');
    else if (hasBuildings) setPanelTab('buildings');
    else setPanelTab('selected');
    if (onHexClick) onHexClick(hexId);
    // Zoom into clicked hex
    const { cx, cy } = toSVG(hex.x, hex.y);
    setZoomLevel(4);
    const zt = {
      tx: SVG_W / 2 - cx * 4,
      ty: SVG_H / 2 - cy * 4,
      scale: 4,
    };
    setZoomTransform(zt);
    if (onZoomChange) onZoomChange(zt);
  };

  const handleZoomOut = () => {
    setZoomTransform(null);
    setZoomLevel(4);
    if (onZoomChange) onZoomChange(null);
  };

  const handleZoomIn = () => {
    if (!zoomTransform || !selected) return;
    const newLevel = Math.min(zoomLevel + 1, 8);
    setZoomLevel(newLevel);
    const { cx, cy } = toSVG(selected.x, selected.y);
    const zt = {
      tx: SVG_W / 2 - cx * newLevel,
      ty: SVG_H / 2 - cy * newLevel,
      scale: newLevel,
    };
    setZoomTransform(zt);
  };

  const handleZoomDecrement = () => {
    if (!zoomTransform || !selected) return;
    const newLevel = Math.max(zoomLevel - 1, 4);
    if (newLevel === 4) {
      handleZoomOut();
      return;
    }
    setZoomLevel(newLevel);
    const { cx, cy } = toSVG(selected.x, selected.y);
    const zt = {
      tx: SVG_W / 2 - cx * newLevel,
      ty: SVG_H / 2 - cy * newLevel,
      scale: newLevel,
    };
    setZoomTransform(zt);
  };



  // Helper: get diplomatic status between two players
  const getDiplomaticStatus = (player1Id, player2Id) => {
    if (!player1Id || !player2Id || player1Id === player2Id) return null;
    // Simple logic: if trade offers exist between them, they're allied
    // Otherwise neutral (can add more complex logic later)
    const hasTradeOffer = gameState?.tradeOffers?.some(
      t => (t.fromId === player1Id && t.toId === player2Id) || (t.fromId === player2Id && t.toId === player1Id)
    );
    return hasTradeOffer ? 'alliance' : 'neutral';
  };

  // ── Pre-compute diplomatic borders ──
  const diplomacyBorders = useMemo(() => {
    const borders = [];
    const processed = new Set();
    
    hexGrid.forEach(h => {
      if (!h.nation_id) return;
      const normNid = normNationId(h.nation_id);
      const { cx, cy } = toSVG(h.x, h.y);
      const nbs = hexNeighborKeys(h.col, h.row);
      
      for (let k = 0; k < 6; k++) {
        const nb = hexLookup[`${nbs[k][0]},${nbs[k][1]}`];
        if (!nb || !nb.nation_id) continue;
        
        const h1Owner = getOwner(`${h.col},${h.row}`, normNationId(h.nation_id));
        const h2Owner = getOwner(`${nbs[k][0]},${nbs[k][1]}`, normNationId(nb.nation_id));
        
        // Border between different players
        if (h1Owner && h2Owner && h1Owner !== h2Owner) {
          const borderKey = [h1Owner, h2Owner].sort().join('-');
          if (processed.has(borderKey)) continue;
          
          const a1 = (Math.PI / 3) * k;
          const a2 = (Math.PI / 3) * ((k + 1) % 6);
          const x1 = cx + HEX_PX * Math.cos(a1);
          const y1 = cy + HEX_PX * Math.sin(a1);
          const x2 = cx + HEX_PX * Math.cos(a2);
          const y2 = cy + HEX_PX * Math.sin(a2);
          
          const status = getDiplomaticStatus(h1Owner, h2Owner);
          const color = status === 'alliance' ? '#27ae60' : '#e74c3c';
          
          borders.push({
            x1, y1, x2, y2,
            player1Id: h1Owner,
            player2Id: h2Owner,
            status,
            color,
          });
        }
      }
    });
    
    return borders;
  }, [hexGrid, gameState?.tradeOffers]);

  // ── Pre-compute border edges (province + nation) ──
  const { provBorderEdges, natBorderEdges } = useMemo(() => {
    const pEdges = [];
    const nEdges = [];
    hexGrid.forEach(h => {
      if (!h.nation_id) return;
      const normNid = normNationId(h.nation_id);
      const { cx, cy } = toSVG(h.x, h.y);
      const nbs = hexNeighborKeys(h.col, h.row);
      for (let k = 0; k < 6; k++) {
        const nb = hexLookup[`${nbs[k][0]},${nbs[k][1]}`];
        const a1 = (Math.PI / 3) * k;
        const a2 = (Math.PI / 3) * ((k + 1) % 6);
        const x1 = cx + HEX_PX * Math.cos(a1);
        const y1 = cy + HEX_PX * Math.sin(a1);
        const x2 = cx + HEX_PX * Math.cos(a2);
        const y2 = cy + HEX_PX * Math.sin(a2);

        if (!nb || normNationId(nb.nation_id) !== normNid) {
          nEdges.push({ x1, y1, x2, y2, color: NATION_COLORS[h.nation_id] || '#333' });
        } else if (normNationId(nb.nation_id) === normNid && nb.province !== h.province) {
          pEdges.push({ x1, y1, x2, y2 });
        }
      }
    });
    return { provBorderEdges: pEdges, natBorderEdges: nEdges };
  }, [hexGrid]);

  const selectedNation = selected?.nation_id ? nations.find(n => n.id === selected.nation_id) : null;
  const selectedProvinceInfo = selectedNation ? selectedNation.provinces.find(p => p.id === selected.province) : null;

  return (
    <div style={{ display: 'flex', height: '62vh', background: '#0a0c12', overflow: 'hidden', border: '1px solid #2a2520' }}>
      {/* ══════ SVG MAP ══════ */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {zoomTransform && (
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={handleZoomDecrement}
              disabled={zoomLevel === 4}
              style={{
                background: zoomLevel === 4 ? '#2a2520' : '#1a1c22', border: '1px solid #d4a853',
                color: zoomLevel === 4 ? '#666' : '#d4a853', fontFamily: "'Cinzel',serif",
                fontSize: 11, padding: '4px 8px', borderRadius: 4,
                cursor: zoomLevel === 4 ? 'not-allowed' : 'pointer', opacity: zoomLevel === 4 ? 0.5 : 1,
              }}>
              −
            </button>
            <span style={{ fontSize: 11, color: '#d4a853', fontFamily: "'Cinzel',serif", minWidth: '32px', textAlign: 'center' }}>
              {zoomLevel}x
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel === 8}
              style={{
                background: zoomLevel === 8 ? '#2a2520' : '#1a1c22', border: '1px solid #d4a853',
                color: zoomLevel === 8 ? '#666' : '#d4a853', fontFamily: "'Cinzel',serif",
                fontSize: 11, padding: '4px 8px', borderRadius: 4,
                cursor: zoomLevel === 8 ? 'not-allowed' : 'pointer', opacity: zoomLevel === 8 ? 0.5 : 1,
              }}>
              +
            </button>
            <button
              onClick={handleZoomOut}
              style={{
                background: '#1a1c22', border: '1px solid #d4a853',
                color: '#d4a853', fontFamily: "'Cinzel',serif",
                fontSize: 11, padding: '4px 12px', borderRadius: 4,
                cursor: 'pointer', marginLeft: 4,
              }}>
              ← Out
            </button>
          </div>
        )}
        <svg
          viewBox={`-120 -80 ${SVG_W + 240} ${SVG_H + 160}`}
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ background: 'radial-gradient(ellipse at 40% 35%, #0d1528 0%, #04080f 100%)', display: 'block' }}
        >
          <defs>
            {/* ── Filters ── */}
            <filter id="goldGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#d4a853" floodOpacity="0.8" />
            </filter>
            <filter id="capitalGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#d4a853" floodOpacity="1" />
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f0c040" floodOpacity="0.5" />
            </filter>


            {/* ── Deep starfield background ── */}
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#0d1020" />
              <stop offset="100%" stopColor="#020306" />
            </radialGradient>

            {/* ── Animated water gradients — deep fantasy ocean ── */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d2a4a">
                <animate attributeName="stopColor" values="#0d2a4a;#163858;#0d2a4a" dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#1a3d60">
                <animate attributeName="stopColor" values="#1a3d60;#0d2240;#1a3d60" dur="7s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#061420">
                <animate attributeName="stopColor" values="#061420;#0d2030;#061420" dur="5s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <radialGradient id="waterShimmer" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#4a9abf" stopOpacity="0.25">
                <animate attributeName="cx" values="35%;55%;35%" dur="4s" repeatCount="indefinite" />
                <animate attributeName="stopOpacity" values="0.25;0.05;0.25" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#0d2a4a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="coastalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a5070">
                <animate attributeName="stopColor" values="#1a5070;#2a6888;#1a5070" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#0a2838">
                <animate attributeName="stopColor" values="#0a2838;#163050;#0a2838" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* ── 3D elevated terrain gradients — top-lit with directional sun ── */}
            <linearGradient id="gradMountain" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#c0c4d0" />
              <stop offset="30%" stopColor="#8a8ca0" />
              <stop offset="70%" stopColor="#4a4a5a" />
              <stop offset="100%" stopColor="#1e1e2a" />
            </linearGradient>
            <linearGradient id="gradMountainSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5a5a6a" />
              <stop offset="100%" stopColor="#1a1a22" />
            </linearGradient>

            <linearGradient id="gradHills" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#b8a858" />
              <stop offset="40%" stopColor="#8a7a38" />
              <stop offset="100%" stopColor="#3a3018" />
            </linearGradient>

            <linearGradient id="gradForest" x1="15%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#4aaa4a" />
              <stop offset="35%" stopColor="#287828" />
              <stop offset="70%" stopColor="#164816" />
              <stop offset="100%" stopColor="#082208" />
            </linearGradient>

            <linearGradient id="gradPlains" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#aac858" />
              <stop offset="40%" stopColor="#7a9a38" />
              <stop offset="100%" stopColor="#3a5018" />
            </linearGradient>

            <linearGradient id="gradDesert" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#e8c060" />
              <stop offset="35%" stopColor="#c09038" />
              <stop offset="70%" stopColor="#7a5820" />
              <stop offset="100%" stopColor="#3a2808" />
            </linearGradient>

            <linearGradient id="gradSwamp" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#6a8a4a" />
              <stop offset="40%" stopColor="#3a5a28" />
              <stop offset="100%" stopColor="#0e2208" />
            </linearGradient>

            <linearGradient id="gradTundra" x1="15%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#ddeeff" />
              <stop offset="35%" stopColor="#9aaabb" />
              <stop offset="70%" stopColor="#5a7090" />
              <stop offset="100%" stopColor="#2a3a4a" />
            </linearGradient>

            <linearGradient id="gradScorched" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#a04820" />
              <stop offset="35%" stopColor="#6a2808" />
              <stop offset="70%" stopColor="#380e02" />
              <stop offset="100%" stopColor="#140400" />
            </linearGradient>

            {/* ── Top-light specular overlay for all non-water hexes ── */}
            <radialGradient id="hexTopLight" cx="30%" cy="22%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
            </radialGradient>

            {/* ── Edge shadow for 3D depth (bottom-right darkening) ── */}
            <radialGradient id="hexEdgeShadow" cx="70%" cy="75%" r="65%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* ── Terrain texture patterns — enriched ── */}
            <pattern id="patForest" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="transparent" />
              <circle cx="2" cy="3" r="1.8" fill="#0e4a0e" fillOpacity="0.7" />
              <circle cx="7" cy="2" r="1.4" fill="#1a6a1a" fillOpacity="0.6" />
              <circle cx="5" cy="7" r="1.6" fill="#124a12" fillOpacity="0.65" />
              <line x1="2" y1="5" x2="2" y2="8" stroke="#2a1208" strokeWidth="0.7" strokeOpacity="0.6" />
              <line x1="7" y1="4" x2="7" y2="7" stroke="#2a1208" strokeWidth="0.6" strokeOpacity="0.5" />
            </pattern>
            <pattern id="patMountain" x="0" y="0" width="12" height="10" patternUnits="userSpaceOnUse">
              <rect width="12" height="10" fill="transparent" />
              <polyline points="0,8 3,2 6,8" fill="#5a5a6a" fillOpacity="0.3" stroke="#9a9aaa" strokeWidth="0.7" strokeOpacity="0.5" />
              <polyline points="5,8 8.5,3 12,8" fill="#4a4a5a" fillOpacity="0.25" stroke="#7a7a8a" strokeWidth="0.7" strokeOpacity="0.4" />
              <line x1="3" y1="2" x2="3" y2="2.5" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="8.5" y1="3" x2="8.5" y2="3.5" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.4" />
            </pattern>
            <pattern id="patHills" x="0" y="0" width="10" height="8" patternUnits="userSpaceOnUse">
              <rect width="10" height="8" fill="transparent" />
              <ellipse cx="5" cy="5.5" rx="4.5" ry="2.2" fill="#8a7a38" fillOpacity="0.25" stroke="#b0a050" strokeWidth="0.5" strokeOpacity="0.45" />
              <ellipse cx="1" cy="6" rx="2" ry="1" fill="#6a5a28" fillOpacity="0.2" />
            </pattern>
            <pattern id="patDesert" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="transparent" />
              <circle cx="2" cy="2" r="0.7" fill="#e8c060" fillOpacity="0.4" />
              <circle cx="6" cy="5" r="0.5" fill="#d4a840" fillOpacity="0.35" />
              <path d="M0,4 Q2,3.2 4,4 Q6,4.8 8,4" fill="none" stroke="#d4a840" strokeWidth="0.4" strokeOpacity="0.3" />
            </pattern>
            <pattern id="patSwamp" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
              <rect width="12" height="8" fill="transparent" />
              <path d="M0,4 Q3,2 6,4 Q9,6 12,4" fill="none" stroke="#5a8a3a" strokeWidth="0.7" strokeOpacity="0.45" />
              <circle cx="2" cy="5" r="0.8" fill="#3a7a3a" fillOpacity="0.3" />
              <circle cx="9" cy="3" r="0.6" fill="#4a8a4a" fillOpacity="0.25" />
            </pattern>
            <pattern id="patTundra" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="transparent" />
              <line x1="5" y1="1" x2="5" y2="9" stroke="#ddeeff" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="1" y1="5" x2="9" y2="5" stroke="#ddeeff" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="2" y1="2" x2="8" y2="8" stroke="#ddeeff" strokeWidth="0.35" strokeOpacity="0.28" />
              <line x1="8" y1="2" x2="2" y2="8" stroke="#ddeeff" strokeWidth="0.35" strokeOpacity="0.28" />
              <circle cx="5" cy="5" r="0.6" fill="#ffffff" fillOpacity="0.35" />
            </pattern>
            <pattern id="patScorched" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="transparent" />
              <path d="M1,2 L4,5 M6,1 L9,5 M2,7 L5,9 M7,6 L10,9" stroke="#3a1808" strokeWidth="0.6" strokeOpacity="0.55" />
              <circle cx="7" cy="3" r="0.8" fill="#ff5500" fillOpacity="0.3">
                <animate attributeName="fillOpacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="2" cy="7" r="0.5" fill="#ff3300" fillOpacity="0.25">
                <animate attributeName="fillOpacity" values="0.15;0.4;0.15" dur="2.5s" repeatCount="indefinite" />
              </circle>
            </pattern>


            <filter id="eventGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#9b59b6" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#8e44ad" floodOpacity="0.4" />
            </filter>
            <filter id="combatFlash">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff4444" floodOpacity="1" />
            </filter>
            <filter id="moveGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#d4a853" floodOpacity="0.9" />
            </filter>
            <filter id="unitShadow">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.7" />
            </filter>
            <filter id="unitGlowRed">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff4444" floodOpacity="0.8" />
            </filter>
            <filter id="unitGlowGold">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f0c040" floodOpacity="0.9" />
            </filter>
            <filter id="unitGlowBlue">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4488ff" floodOpacity="0.8" />
            </filter>
            <filter id="unitGlowGreen">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#44ff88" floodOpacity="0.8" />
            </filter>
            <filter id="fortressGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#8a8a9a" floodOpacity="0.5" />
            </filter>
            <filter id="portGlow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#2266cc" floodOpacity="0.6" />
            </filter>

          </defs>

          {/* Click on empty SVG background to deselect */}
          <rect x={-120} y={-80} width={SVG_W + 240} height={SVG_H + 160} fill="transparent"
            onClick={() => setSelected(null)} style={{ cursor: 'default' }} />

          {zoomTransform && (
            <g>
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="transparent"
                onClick={handleZoomOut} style={{ cursor: 'zoom-out', pointerEvents: 'none' }} />
            </g>
          )}

          {/* ── Hex fills ── */}
          <g
            transform={zoomTransform
              ? `translate(${zoomTransform.tx},${zoomTransform.ty}) scale(${zoomTransform.scale})`
              : undefined}
            style={{ transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }}
          >
          {hexGrid.map(hex => {
            const hexId = `${hex.col},${hex.row}`;
            const { cx, cy } = toSVG(hex.x, hex.y);
            const terrain = hex.terrain || 'water';
            const isWater = !hex.nation_id;
            const isSelected = selectedHex === hexId || (selected?.col === hex.col && selected?.row === hex.row);
            const owner = getOwner(hexId, normNationId(hex.nation_id));
            const playerColor = getPlayerColor(owner);
            const units = getUnits(hexId);
            const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);
            const fillColor = TERRAIN_COLORS[terrain] || '#444';
            const nationColor = hex.nation_id ? (NATION_COLORS[hex.nation_id] || '#666') : null;
            const isMyHighlighted = highlightPlayerId && owner === highlightPlayerId;
            const isReachable = reachableHexes && reachableHexes.has(hexId);
            const isAttackable = attackableHexes && attackableHexes.has(hexId);
            const isInSelectedProvince = selectedProvince && hex.nation_id === selectedProvince.nation_id && hex.province === selectedProvince.province_id;
            const highlightMode = !!highlightPlayerId;
            const dimmed = highlightMode && !isMyHighlighted;

            // Terrain gradient id for elevation
            const gradMap = { mountain: 'gradMountain', hills: 'gradHills', forest: 'gradForest', plains: 'gradPlains', desert: 'gradDesert', swamp: 'gradSwamp', tundra: 'gradTundra', scorched: 'gradScorched' };
            const patMap = { forest: 'patForest', mountain: 'patMountain', hills: 'patHills', desert: 'patDesert', swamp: 'patSwamp', tundra: 'patTundra', scorched: 'patScorched' };
            const elevGradId = gradMap[terrain];
            const patId = patMap[terrain];
            const waterFill = terrain === 'coastal' ? 'url(#coastalGrad)' : 'url(#waterGrad)';

            const pts = flatHexCorners(cx, cy, HEX_PX);
            const ptsInner = flatHexCorners(cx, cy, HEX_PX * 0.92);

            // Calculate influence overlay color if enabled
            let influenceColor = null;
            let influenceOpacity = 0;
            if (showInfluenceOverlay && sentiment && owner && owner !== currentPlayer?.id) {
              // Color hexes based on current player's sentiment with that hex's owner
              const hexOwnerSentiment = sentiment[currentPlayer.id]?.[owner] ?? 50;
              if (hexOwnerSentiment > 65) {
                influenceColor = '#4ade80'; // Green for friendly
                influenceOpacity = 0.25;
              } else if (hexOwnerSentiment < 35) {
                influenceColor = '#ff6b6b'; // Red for hostile
                influenceOpacity = 0.25;
              } else {
                influenceColor = '#fbbf24'; // Amber for neutral
                influenceOpacity = 0.15;
              }
            }

            const handleHexMouseEnter = () => {
              if (isAttackable && selectedHex) {
                const attackerHex = gameState?.hexes?.[selectedHex];
                const defenderHexData = gameState?.hexes?.[hexId];
                const attackerUnits = attackerHex?.units?.length ? attackerHex.units : [{ type: 'infantry', count: attackerHex?.units?.reduce((s,u)=>s+u.count,0) || 1 }];
                const defenderUnits = defenderHexData?.units?.length ? defenderHexData.units : [{ type: 'infantry', count: defenderHexData?.units?.reduce((s,u)=>s+u.count,0) || 1 }];
                const estimate = estimateCombat(attackerUnits, defenderUnits, defenderHexData?.buildings?.fortress);
                setCombatTooltip({ hexId, svgX: cx, svgY: cy - HEX_PX * 1.4, estimate });
              }
            };
            const handleHexMouseLeave = () => {
              if (combatTooltip?.hexId === hexId) setCombatTooltip(null);
            };

            return (
              <g key={hexId}
                onClick={() => {
                  if (!isWater) {
                    handleHexClick(hex);
                    if (hex.nation_id && hex.province && onProvincClick) {
                      onProvincClick({ nation_id: hex.nation_id, province_id: hex.province });
                    }
                  } else {
                    setSelected(null);
                  }
                }}
                onDragOver={(e) => {
                  if (draggingDeployUnit && !isWater) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
                }}
                onDrop={(e) => {
                  if (!isWater && onDragDeployDrop) {
                    e.preventDefault();
                    const unitType = e.dataTransfer.getData('deployUnitType') || draggingDeployUnit;
                    if (unitType) onDragDeployDrop(hexId, unitType);
                  }
                }}
                onMouseEnter={handleHexMouseEnter}
                onMouseLeave={handleHexMouseLeave}
                style={{ cursor: draggingDeployUnit && !isWater ? 'copy' : isWater ? 'default' : 'pointer' }}>

                {/* ── 3D HEX RENDERING ── */}
                {isWater ? (
                  <g style={{ pointerEvents: 'none' }}>
                    {/* Deep water base */}
                    <polygon points={pts} fill="url(#waterGrad)" fillOpacity={dimmed ? 0.12 : 0.88} stroke="#0a0c18" strokeWidth={0.8} />
                    {/* Shimmer overlay */}
                    {!dimmed && <polygon points={pts} fill="url(#waterShimmer)" fillOpacity={0.9} />}
                    {/* Thin bright edge on top-left faces */}
                    {!dimmed && <polygon points={pts} fill="none" stroke="#4a8aaa" strokeWidth={0.6} strokeOpacity={0.3} />}
                  </g>
                ) : (
                  <g>
                    {/* ── 3D side face (drop shadow below hex = depth illusion) ── */}
                    {!dimmed && (
                      <polygon
                        points={flatHexCorners(cx, cy + 3, HEX_PX * 0.97)}
                        fill={fillColor}
                        fillOpacity={0.55}
                        stroke="none"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                    {/* ── Main terrain face ── */}
                    <polygon points={pts}
                      fill={
                        isSelected ? '#c8900a' :
                        isAttackable ? '#8b1a1a' :
                        isInSelectedProvince ? '#5a3090' :
                        isReachable ? '#1a6a3a' :
                        isMyHighlighted ? playerColor :
                        (elevGradId ? `url(#${elevGradId})` : fillColor)
                      }
                      fillOpacity={isSelected ? 0.95 : isAttackable ? 0.75 : isInSelectedProvince ? 0.75 : isReachable ? 0.75 : dimmed ? 0.12 : 1}
                      stroke={
                        isAttackable ? '#ff6666' :
                        isReachable ? '#88ffcc' :
                        isInSelectedProvince ? '#bb88ff' :
                        isMyHighlighted ? playerColor :
                        '#00000040'
                      }
                      strokeWidth={isAttackable ? 2.5 : isReachable ? 2 : isInSelectedProvince ? 2.5 : isMyHighlighted ? 2.5 : 0.6}
                    />
                    {/* ── Texture pattern overlay ── */}
                    {patId && !isSelected && !isInSelectedProvince && !isReachable && !dimmed && (
                      <polygon points={pts} fill={`url(#${patId})`} fillOpacity={0.65} style={{ pointerEvents: 'none' }} />
                    )}
                    {/* ── Top-light specular (3D dome effect) ── */}
                    {!isSelected && !dimmed && (
                      <polygon points={pts} fill="url(#hexTopLight)" fillOpacity={0.9} style={{ pointerEvents: 'none' }} />
                    )}
                    {/* ── Edge shadow (depth on bottom-right) ── */}
                    {!isSelected && !dimmed && (
                      <polygon points={pts} fill="url(#hexEdgeShadow)" fillOpacity={0.7} style={{ pointerEvents: 'none' }} />
                    )}
                    {/* ── Selected golden shimmer ── */}
                    {isSelected && (
                      <polygon points={pts} fill="#f0c040" fillOpacity={0.18} style={{ pointerEvents: 'none' }}>
                        <animate attributeName="fillOpacity" values="0.1;0.28;0.1" dur="1.2s" repeatCount="indefinite" />
                      </polygon>
                    )}
                    {/* ── Attackable red pulse ── */}
                    {isAttackable && (
                      <polygon points={pts} fill="#ff2200" fillOpacity={0.12} style={{ pointerEvents: 'none' }}>
                        <animate attributeName="fillOpacity" values="0.05;0.22;0.05" dur="0.9s" repeatCount="indefinite" />
                      </polygon>
                    )}
                    {/* ── Reachable green shimmer ── */}
                    {isReachable && !isAttackable && (
                      <polygon points={pts} fill="#00ff88" fillOpacity={0.1} style={{ pointerEvents: 'none' }}>
                        <animate attributeName="fillOpacity" values="0.04;0.18;0.04" dur="1.4s" repeatCount="indefinite" />
                      </polygon>
                    )}
                  </g>
                )}

                {/* ── Influence overlay ── */}
                {showInfluenceOverlay && influenceColor && (
                  <polygon points={pts} fill={influenceColor} fillOpacity={influenceOpacity} style={{ pointerEvents: 'none' }} />
                )}

                {/* ── Nation color tint — always visible on land hexes to differentiate nations ── */}
                {nationColor && !isWater && !highlightMode && !isSelected && !isReachable && !isAttackable && !isInSelectedProvince && (
                  <polygon points={pts} fill={nationColor} fillOpacity={0.28} style={{ pointerEvents: 'none' }} />
                )}

                {/* ── Player ownership — inner glowing tint + border ring ── */}
                {owner && playerColor && !highlightMode && (
                  <>
                    <polygon points={ptsInner} fill={playerColor} fillOpacity={0.22} style={{ pointerEvents: 'none' }} />
                    <polygon points={ptsInner} fill="none" stroke={playerColor} strokeWidth={2.5} strokeOpacity={0.85} style={{ pointerEvents: 'none' }} />
                  </>
                )}
                {/* Neutral garrison tint */}
                {owner && !playerColor && owner.startsWith('neutral_') && !highlightMode && (
                  <polygon points={ptsInner} fill="#888" fillOpacity={0.18} stroke="#aaa" strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3,2" style={{ pointerEvents: 'none' }} />
                )}

                {/* Unit tokens — 3D animated fantasy tokens */}
                {units.length > 0 && (
                  <g style={{ pointerEvents: 'none' }}>
                    {units.map((u, i) => {
                       const tokenColor = playerColor || '#d4a853';
                       const isElite = u.type === 'elite';
                       const isCavalry = u.type === 'cavalry';
                       const isSiege = u.type === 'siege';
                       const isNaval = u.type === 'naval';
                       const isRanged = u.type === 'ranged';

                       // Layout: stack tokens slightly offset
                       const cols = Math.min(units.length, 2);
                       const col = i % cols;
                       const row = Math.floor(i / cols);
                       const spread = units.length === 1 ? 0 : 9;
                       const xPos = cx + (col - (cols - 1) / 2) * spread;
                       const yPos = cy - 4 + row * 9;

                       // Unique animation offset per unit
                       const animDelay = `${(i * 0.4).toFixed(1)}s`;
                       const bobDur = isElite ? '1.2s' : isCavalry ? '0.9s' : '1.6s';

                       // Pick icon & color accent
                       const icons = {
                         infantry: '⚔️', cavalry: '🐴', elite: '⭐',
                         ranged: '🏹', siege: '💣', naval: '⛵',
                       };
                       const glowFilter = isElite ? 'url(#unitGlowGold)' : isSiege ? 'url(#unitGlowRed)' : isNaval ? 'url(#unitGlowBlue)' : 'url(#unitShadow)';
                       const R = isElite ? 11 : isSiege ? 10 : 9;
                       const darkened = tokenColor + 'aa';

                       // Gradient id — unique per unit type per token color (just use inline)
                       const topLight = '#ffffff';

                       return (
                         <g key={i} transform={`translate(${xPos},${yPos})`} filter={glowFilter}>
                             {/* 3D ground shadow */}
                             <ellipse cx={0} cy={R + 2} rx={R * 0.85} ry={R * 0.25}
                               fill="#000000" fillOpacity={0.4} />

                             {/* Token outer ring — faction color */}
                             <circle cx={0} cy={0} r={R + 1.5}
                               fill={tokenColor} fillOpacity={0.85}
                               stroke="#000000" strokeWidth={0.8}>
                               <animate attributeName="cy"
                                 values={`-1;1;-1`}
                                 dur={bobDur} begin={animDelay}
                                 repeatCount="indefinite" additive="sum" />
                             </circle>

                             {/* Main token body */}
                             <circle cx={0} cy={0} r={R} fill="#0f1218" stroke={tokenColor} strokeWidth={1.5}>
                               <animate attributeName="cy"
                                 values={`-1;1;-1`}
                                 dur={bobDur} begin={animDelay}
                                 repeatCount="indefinite" additive="sum" />
                             </circle>

                             {/* Specular highlight — top-left dome glint */}
                             <ellipse cx={-R * 0.28} cy={-R * 0.38} rx={R * 0.32} ry={R * 0.18}
                               fill={topLight} fillOpacity={0.28} transform="rotate(-25)">
                               <animate attributeName="cy"
                                 values={`${-R*0.38 - 1};${-R*0.38 + 1};${-R*0.38 - 1}`}
                                 dur={bobDur} begin={animDelay}
                                 repeatCount="indefinite" additive="sum" />
                             </ellipse>

                             {/* Unit icon */}
                             <text x={0} y={4} textAnchor="middle" fontSize={isElite ? 12 : 10}
                               style={{ userSelect: 'none' }}>
                               {icons[u.type] || '⚔️'}
                               <animate attributeName="y"
                                 values={`3;5;3`}
                                 dur={bobDur} begin={animDelay}
                                 repeatCount="indefinite" additive="sum" />
                             </text>

                             {/* Elite pulsing halo ring */}
                             {isElite && (
                               <circle cx={0} cy={0} r={R + 4} fill="none" stroke="#f0c040" strokeWidth={1.5}>
                                 <animate attributeName="strokeOpacity" values="0.15;0.85;0.15" dur="1.2s" repeatCount="indefinite" begin={animDelay} />
                                 <animate attributeName="r" values={`${R+3};${R+7};${R+3}`} dur="1.2s" repeatCount="indefinite" begin={animDelay} />
                               </circle>
                             )}

                             {/* Cavalry dashed speed streak */}
                             {isCavalry && (
                               <path d={`M${-R-2},1 A${R+2},${R+2} 0 0,1 ${R+2},1`} fill="none"
                                 stroke={tokenColor} strokeWidth={1.2} strokeOpacity={0.55} strokeDasharray="3,2">
                                 <animate attributeName="strokeDashoffset" from="0" to="-10" dur="0.9s" repeatCount="indefinite" />
                               </path>
                             )}

                             {/* Siege spinning gear ring */}
                             {isSiege && (
                               <circle cx={0} cy={0} r={R + 2.5} fill="none" stroke="#cc4400" strokeWidth={0.8}
                                 strokeDasharray="4,2" strokeOpacity={0.75}>
                                 <animateTransform attributeName="transform" type="rotate"
                                   from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite" />
                               </circle>
                             )}

                             {/* Naval wave ring */}
                             {isNaval && (
                               <circle cx={0} cy={0} r={R + 3} fill="none" stroke="#4488ff" strokeWidth={0.8}
                                 strokeDasharray="5,3" strokeOpacity={0.6}>
                                 <animate attributeName="strokeDashoffset" from="0" to="16" dur="1.5s" repeatCount="indefinite" />
                               </circle>
                             )}

                             {/* Count badge */}
                             {u.count > 1 && (
                               <g>
                                 <circle cx={R} cy={-R} r={5.5}
                                   fill="#1a0a0a" stroke={tokenColor} strokeWidth={1} />
                                 <text x={R} y={-R + 3.5}
                                   textAnchor="middle" fontSize={u.count > 9 ? 5.5 : 6.5}
                                   fill={tokenColor} fontWeight="bold" fontFamily="'Cinzel',serif"
                                   style={{ userSelect: 'none' }}>
                                   {u.count > 99 ? '99+' : u.count}
                                 </text>
                               </g>
                             )}
                         </g>
                       );
                     })}
                  </g>
                )}
                {/* ── Capital hex marker (crown/star badge under fortress) ── */}
                {CAPITAL_HEX_INFO[hexId] && !NATIONAL_CAPITAL_HEX_IDS.has(hexId) && (
                  // Province capital: silver diamond badge
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={cx + HEX_PX * 0.55} cy={cy - HEX_PX * 0.55} r={5.5}
                      fill="#1a1c24" stroke="#c8b880" strokeWidth={1} />
                    <text x={cx + HEX_PX * 0.55} y={cy - HEX_PX * 0.55 + 3.5}
                      textAnchor="middle" fontSize={7} fill="#d4c870"
                      fontFamily="'Cinzel',serif" fontWeight="bold"
                      style={{ userSelect: 'none' }}>◆</text>
                  </g>
                )}

                {/* ══ EPIC FORTRESS SVG STRUCTURE ══ */}
                 {(gameState?.hexes?.[hexId]?.buildings?.fortress || NATIONAL_CAPITAL_HEX_IDS.has(hexId)) && (
                   <g transform={`translate(${cx},${cy - 6})`} style={{ pointerEvents: 'none' }} filter="url(#fortressGlow)">
                     {/* Drop shadow platform */}
                     <ellipse cx={0} cy={14} rx={16} ry={4} fill="#000" fillOpacity={0.5} />
                     {/* Animated slow hover */}
                     <g>
                       <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="4s" repeatCount="indefinite" />
                       {/* Stone base / wall */}
                       <rect x={-12} y={2} width={24} height={10} rx={1}
                         fill="#4a4a5a" stroke="#2a2a38" strokeWidth={0.8} />
                       {/* Wall highlight (top edge) */}
                       <rect x={-12} y={2} width={24} height={2} rx={1}
                         fill="#7a7a8a" />
                       {/* Gate arch */}
                       <rect x={-3} y={6} width={6} height={6} rx={1} fill="#0d0f16" />
                       <ellipse cx={0} cy={6} rx={3} ry={2} fill="#0d0f16" />
                       {/* Left tower */}
                       <rect x={-14} y={-6} width={8} height={10} rx={1}
                         fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.8} />
                       {/* Left tower top-light */}
                       <rect x={-14} y={-6} width={8} height={2} fill="#8a8a9a" rx={1} />
                       {/* Left merlon teeth */}
                       <rect x={-14} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={-11} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={-8} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.5} />
                       {/* Right tower */}
                       <rect x={6} y={-6} width={8} height={10} rx={1}
                         fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.8} />
                       {/* Right tower top-light */}
                       <rect x={6} y={-6} width={8} height={2} fill="#8a8a9a" rx={1} />
                       {/* Right merlon teeth */}
                       <rect x={6} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={9} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={12} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.5} />
                       {/* Center keep */}
                       <rect x={-5} y={-12} width={10} height={14} rx={1}
                         fill="#6a6a7a" stroke="#2a2a38" strokeWidth={0.8} />
                       {/* Keep top-light */}
                       <rect x={-5} y={-12} width={10} height={2} fill="#9a9aaa" rx={1} />
                       {/* Keep window */}
                       <rect x={-1.5} y={-8} width={3} height={4} rx={0.5} fill="#ffe080" fillOpacity={0.8}>
                         <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
                       </rect>
                       {/* Keep battlements */}
                       <rect x={-5} y={-16} width={2} height={4} rx={0.5} fill="#6a6a7a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={-2} y={-16} width={2} height={4} rx={0.5} fill="#6a6a7a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={1} y={-16} width={2} height={4} rx={0.5} fill="#6a6a7a" stroke="#2a2a38" strokeWidth={0.5} />
                       <rect x={4} y={-16} width={2} height={4} rx={0.5} fill="#6a6a7a" stroke="#2a2a38" strokeWidth={0.5} />
                       {/* Top specular glint */}
                       <ellipse cx={-2} cy={-13} rx={3} ry={1} fill="#ffffff" fillOpacity={0.18} />
                       {/* Flag */}
                       <line x1={0} y1={-17} x2={0} y2={-23} stroke="#aaa" strokeWidth={0.8} />
                       <polygon points="0,-23 6,-20 0,-18" fill="#c0392b">
                         <animate attributeName="points"
                           values="0,-23 6,-20 0,-18; 0,-23 7,-21 0,-19; 0,-23 6,-20 0,-18"
                           dur="1.5s" repeatCount="indefinite" />
                       </polygon>
                     </g>
                     {/* Pulsing stone-aura ring */}
                     <circle cx={0} cy={4} r={19} fill="none" stroke="#8a8a9a" strokeWidth={1.2}>
                       <animate attributeName="r" values="17;22;17" dur="3s" repeatCount="indefinite" />
                       <animate attributeName="strokeOpacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite" />
                     </circle>
                   </g>
                 )}
                 {/* ══ EPIC PORT SVG STRUCTURE ══ */}
                 {gameState?.hexes?.[hexId]?.buildings?.port && (
                   <g transform={`translate(${cx},${cy - 4})`} style={{ pointerEvents: 'none' }} filter="url(#portGlow)">
                     {/* Water shadow */}
                     <ellipse cx={0} cy={14} rx={14} ry={3.5} fill="#0a1a3a" fillOpacity={0.7} />
                     {/* Animated gentle sway */}
                     <g>
                       <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.5;0,0" dur="3s" repeatCount="indefinite" />
                       {/* Dock planks */}
                       <rect x={-13} y={8} width={26} height={4} rx={1} fill="#5a3a18" stroke="#3a2008" strokeWidth={0.6} />
                       <line x1={-8} y1={8} x2={-8} y2={12} stroke="#3a2008" strokeWidth={0.5} />
                       <line x1={-3} y1={8} x2={-3} y2={12} stroke="#3a2008" strokeWidth={0.5} />
                       <line x1={3} y1={8} x2={3} y2={12} stroke="#3a2008" strokeWidth={0.5} />
                       <line x1={8} y1={8} x2={8} y2={12} stroke="#3a2008" strokeWidth={0.5} />
                       {/* Dock pillars */}
                       <rect x={-12} y={10} width={2} height={6} fill="#4a2808" />
                       <rect x={-2} y={10} width={2} height={6} fill="#4a2808" />
                       <rect x={10} y={10} width={2} height={6} fill="#4a2808" />
                       {/* Lighthouse tower */}
                       <rect x={-4} y={-14} width={8} height={22} rx={1}
                         fill="#c8c4b8" stroke="#8a8070" strokeWidth={0.8} />
                       {/* Lighthouse stripes */}
                       <rect x={-4} y={-14} width={8} height={4} rx={0.5} fill="#e8e0d0" />
                       <rect x={-4} y={-6} width={8} height={4} fill="#2255aa" />
                       <rect x={-4} y={2} width={8} height={4} fill="#2255aa" />
                       {/* Balcony rail */}
                       <rect x={-6} y={-16} width={12} height={2} rx={1}
                         fill="#9a9080" stroke="#6a6050" strokeWidth={0.5} />
                       <line x1={-5} y1={-16} x2={-5} y2={-14} stroke="#6a6050" strokeWidth={0.6} />
                       <line x1={0} y1={-16} x2={0} y2={-14} stroke="#6a6050" strokeWidth={0.6} />
                       <line x1={5} y1={-16} x2={5} y2={-14} stroke="#6a6050" strokeWidth={0.6} />
                       {/* Light dome */}
                       <ellipse cx={0} cy={-18} rx={5} ry={3.5}
                         fill="#ffee80" stroke="#d4a820" strokeWidth={0.8}>
                         <animate attributeName="fill" values="#ffee80;#fff8a0;#ffee80" dur="1.5s" repeatCount="indefinite" />
                       </ellipse>
                       {/* Light beam sweep */}
                       <path d="M0,-18 L18,4 L12,8 Z" fill="#ffee80" fillOpacity={0.08}>
                         <animate attributeName="fillOpacity" values="0.04;0.15;0.04" dur="2s" repeatCount="indefinite" />
                         <animateTransform attributeName="transform" type="rotate" from="0 0 -18" to="360 0 -18" dur="6s" repeatCount="indefinite" />
                       </path>
                       {/* Light rays */}
                       {[0,60,120,180,240,300].map((deg,ri) => (
                         <line key={ri}
                           x1={0} y1={-18}
                           x2={Math.cos(deg*Math.PI/180)*10}
                           y2={-18+Math.sin(deg*Math.PI/180)*10}
                           stroke="#ffe040" strokeWidth={0.8} strokeOpacity={0.4}>
                           <animate attributeName="strokeOpacity" values="0.2;0.7;0.2" dur={`${1.5+ri*0.2}s`} repeatCount="indefinite" />
                         </line>
                       ))}
                       {/* Ship mast */}
                       <line x1={8} y1={8} x2={8} y2={-8} stroke="#6a4a20" strokeWidth={1.2} />
                       <polygon points="8,-8 16,-4 8,0" fill="#eee0c0" fillOpacity={0.85}>
                         <animate attributeName="points" values="8,-8 16,-4 8,0; 8,-8 15,-5 8,1; 8,-8 16,-4 8,0" dur="2s" repeatCount="indefinite" />
                       </polygon>
                       {/* Specular glint */}
                       <ellipse cx={-1.5} cy={-19.5} rx={2} ry={1} fill="#ffffff" fillOpacity={0.5} />
                     </g>
                     {/* Ocean pulse rings */}
                     <circle cx={0} cy={10} r={17} fill="none" stroke="#2266cc" strokeWidth={1} strokeDasharray="6,4">
                       <animate attributeName="strokeDashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
                       <animate attributeName="strokeOpacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite" />
                     </circle>
                   </g>
                 )}
              </g>
            );
          })}

          {/* ── Diplomacy borders (thick, colored) ── */}
          {diplomacyBorders.map((b, i) => (
            <line
              key={`db${i}`}
              x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
              stroke={b.color}
              strokeWidth={3}
              strokeOpacity={hoveredBorder === i ? 0.9 : 0.6}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                setHoveredBorder(i);
                setTooltipPos({ x: (b.x1 + b.x2) / 2, y: (b.y1 + b.y2) / 2, status: b.status });
              }}
              onMouseLeave={() => {
                setHoveredBorder(null);
                setTooltipPos(null);
              }}
            />
          ))}

          {/* ── Province borders — glowing golden dashes ── */}
          {provBorderEdges.map((e, i) => (
            <g key={`pb${i}`} style={{ pointerEvents: 'none' }}>
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#000000" strokeWidth={2} strokeOpacity={0.6} />
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#d4a853" strokeWidth={1} strokeOpacity={0.65} strokeDasharray="5,3" />
            </g>
          ))}

          {/* ── Nation borders — thick colored outline to clearly separate nations ── */}
           {natBorderEdges.map((e, i) => (
             <g key={`nb${i}`} style={{ pointerEvents: 'none' }}>
               {/* Outer dark stroke */}
               <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                 stroke="#000000" strokeWidth={6} strokeOpacity={1} />
               {/* Nation-color highlight — bright and clearly visible */}
               <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                 stroke={e.color} strokeWidth={2.5} strokeOpacity={0.9} />
             </g>
           ))}

          {/* ── Current player territory borders (bright highlight) ── */}
          {currentPlayer && hexGrid.map(hex => {
            const hexId = `${hex.col},${hex.row}`;
            const owner = getOwner(hexId, normNationId(hex.nation_id));
            if (owner !== currentPlayer.id) return null;

            const { cx, cy } = toSVG(hex.x, hex.y);
            const nbs = hexNeighborKeys(hex.col, hex.row);
            const edges = [];

            for (let k = 0; k < 6; k++) {
              const nb = hexLookup[`${nbs[k][0]},${nbs[k][1]}`];
              const nbOwner = nb ? getOwner(`${nbs[k][0]},${nbs[k][1]}`, normNationId(nb.nation_id)) : null;
              // Draw border if neighbor is not owned by current player
              if (!nb || nbOwner !== currentPlayer.id) {
                const a1 = (Math.PI / 3) * k;
                const a2 = (Math.PI / 3) * ((k + 1) % 6);
                const x1 = cx + HEX_PX * Math.cos(a1);
                const y1 = cy + HEX_PX * Math.sin(a1);
                const x2 = cx + HEX_PX * Math.cos(a2);
                const y2 = cy + HEX_PX * Math.sin(a2);
                edges.push({ x1, y1, x2, y2 });
              }
            }

            return edges.map((e, i) => (
              <line key={`tb-${hexId}-${i}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke={currentPlayer.color} strokeWidth={3} strokeOpacity={0.8}
                style={{ pointerEvents: 'none' }}>
                <animate attributeName="strokeOpacity" values="0.8;0.5;0.8" dur="2s" repeatCount="indefinite" />
              </line>
            ));
          }).flat()}

          {/* ── Selected hex — epic gold glow ── */}
          {selected && (() => {
            const { cx: scx, cy: scy } = toSVG(selected.x, selected.y);
            return (
              <g style={{ pointerEvents: 'none' }} filter="url(#goldGlow)">
                {/* Outermost diffuse ring */}
                <polygon points={flatHexCorners(scx, scy, HEX_PX * 1.18)}
                  fill="none" stroke="#f0c040" strokeWidth={1} strokeOpacity={0.25}>
                  <animate attributeName="strokeOpacity" values="0.15;0.4;0.15" dur="1.5s" repeatCount="indefinite" />
                </polygon>
                {/* Mid ring */}
                <polygon points={flatHexCorners(scx, scy, HEX_PX * 1.09)}
                  fill="none" stroke="#d4a853" strokeWidth={2} strokeOpacity={0.6}>
                  <animate attributeName="strokeOpacity" values="0.4;0.85;0.4" dur="1.2s" repeatCount="indefinite" />
                </polygon>
                {/* Inner bright ring */}
                <polygon points={flatHexCorners(scx, scy, HEX_PX * 1.01)}
                  fill="none" stroke="#ffe080" strokeWidth={3} strokeOpacity={0.9} />
                {/* Corner accent dots */}
                {Array.from({length:6},(_,k)=>{
                  const a = (Math.PI/3)*k;
                  const dx = scx + HEX_PX*1.04*Math.cos(a);
                  const dy = scy + HEX_PX*1.04*Math.sin(a);
                  return <circle key={k} cx={dx} cy={dy} r={2.5} fill="#ffe080" fillOpacity={0.9} />;
                })}
              </g>
            );
          })()}

          {/* ── Capital labels — pinned directly on capital hexes ── */}
          {Object.entries(CAPITAL_HEX_INFO).map(([hexId, info]) => {
            const hd = hexLookup[hexId];
            if (!hd) return null;
            const { cx, cy } = toSVG(hd.x, hd.y);
            const isNatCap = info.isNatCap;
            // Show full capital name, clipped to first two words for space
            const label = (info.capitalName || '').split(' ').slice(0, 2).join(' ');
            if (!label) return null;
            const yOffset = isNatCap ? HEX_PX * 0.72 : HEX_PX * 0.6;
            return (
              <g key={`cap-${hexId}`} style={{ pointerEvents: 'none' }}>
                {/* Capital name label below hex center */}
                <text x={cx} y={cy + yOffset}
                  textAnchor="middle"
                  fontSize={isNatCap ? 7.5 : 6}
                  fill={isNatCap ? '#f0c040' : '#d4c870'}
                  fontFamily="'Cinzel', serif" fontWeight="bold"
                  stroke="#030508" strokeWidth={2.5} paintOrder="stroke"
                  letterSpacing={0.4}
                  filter={isNatCap ? 'url(#capitalGlow)' : undefined}>
                  {label}
                </text>
                {/* Tiny type badge */}
                <text x={cx} y={cy + yOffset + 8}
                  textAnchor="middle" fontSize={5}
                  fill={isNatCap ? '#f0c040' : '#a09060'}
                  fontFamily="'Cinzel', serif"
                  stroke="#030508" strokeWidth={1.5} paintOrder="stroke"
                  style={{ opacity: 0.85 }}>
                  {isNatCap ? '✦ CAPITAL ✦' : '◆ PROVINCE'}
                </text>
              </g>
            );
          })}

          {/* ── Diplomacy border tooltip ── */}
          {tooltipPos && (
            <g style={{ pointerEvents: 'none' }}>
              <circle cx={tooltipPos.x} cy={tooltipPos.y} r={8} fill="#1a1c22" stroke={tooltipPos.status === 'alliance' ? '#27ae60' : '#e74c3c'} strokeWidth={2} />
              <text x={tooltipPos.x} y={tooltipPos.y + 14} textAnchor="middle" fontSize={11} fill="#fff" fontFamily="'Cinzel',serif" fontWeight="bold">
                {tooltipPos.status === 'alliance' ? '⚔️ Alliance' : '⚠️ Tension'}
              </text>
            </g>
          )}

          {/* ── Attackable hex pulse rings ── */}
          {attackableHexes && [...attackableHexes].map(hexId => {
            const hd = hexLookup[hexId];
            if (!hd) return null;
            const { cx, cy } = toSVG(hd.x, hd.y);
            return (
              <polygon key={`ap-${hexId}`}
                points={flatHexCorners(cx, cy, HEX_PX * 1.08)}
                fill="none" stroke="#ff4444" strokeWidth={2} strokeOpacity={0.7}
                strokeDasharray="5,3"
                style={{ pointerEvents: 'none' }}>
                <animate attributeName="stroke-dashoffset" from="0" to="16" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="strokeOpacity" values="0.4;0.9;0.4" dur="1s" repeatCount="indefinite" />
              </polygon>
            );
          })}

          {/* ── Combat preview tooltip ── */}
          {combatTooltip?.estimate && (() => {
            const { svgX, svgY, estimate } = combatTooltip;
            const w = 140, h = 80, pad = 8;
            const x = svgX - w / 2;
            const y = svgY - h;
            const winColor = estimate.winChance >= 60 ? '#4ade80' : estimate.winChance >= 40 ? '#facc15' : '#f87171';
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={x} y={y} width={w} height={h} rx={4} fill="#0d1117" fillOpacity={0.95} stroke="#d4a853" strokeWidth={1.5} />
                <text x={svgX} y={y + pad + 10} textAnchor="middle" fontSize={9} fill="#d4a853" fontFamily="'Cinzel',serif" fontWeight="700">COMBAT ESTIMATE</text>
                <text x={svgX} y={y + pad + 26} textAnchor="middle" fontSize={14} fill={winColor} fontFamily="'Cinzel',serif" fontWeight="900">{estimate.winChance}% WIN</text>
                <text x={svgX} y={y + pad + 42} textAnchor="middle" fontSize={8} fill="#aaa">
                  {`Atk: ${estimate.atkCount} units  vs  Def: ${estimate.defCount} units`}
                </text>
                <text x={svgX} y={y + pad + 56} textAnchor="middle" fontSize={8} fill="#f87171">
                  {`Est. losses: A -${estimate.attackerLosses}  /  D -${estimate.defenderLosses}`}
                </text>
                <polygon points={`${svgX - 6},${y + h} ${svgX + 6},${y + h} ${svgX},${y + h + 8}`} fill="#d4a853" />
              </g>
            );
          })()}

          {/* ── Unit movement animations (enhanced) ── */}
          {movingUnits.map(anim => {
            const icons = { infantry: '🏃', cavalry: '🐴', elite: '⭐', ranged: '🏹', siege: '⚙️', naval: '⚓' };
            // Arc control point — lift midpoint upward for curved path
            const mx = (anim.fromX + anim.toX) / 2;
            const my = (anim.fromY + anim.toY) / 2 - 40;
            const arcPath = `M${anim.fromX},${anim.fromY} Q${mx},${my} ${anim.toX},${anim.toY}`;
            const isElite = anim.type === 'elite';
            const isCavalry = anim.type === 'cavalry';
            const dur = isCavalry ? '0.5s' : isElite ? '0.6s' : '0.75s';
            // Spark positions around destination
            const sparks = [0, 60, 120, 180, 240, 300].map(deg => ({
              dx: Math.cos(deg * Math.PI / 180) * 14,
              dy: Math.sin(deg * Math.PI / 180) * 14,
            }));
            return (
              <g key={anim.key} style={{ pointerEvents: 'none' }}>
                {/* Curved trail path */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke={anim.color}
                  strokeWidth={2.5}
                  strokeDasharray="8,4"
                  filter="url(#moveGlow)"
                >
                  <animate attributeName="strokeOpacity" values="0.8;0.6;0" dur={dur} fill="freeze" />
                  <animate attributeName="strokeDashoffset" from="0" to="-40" dur={dur} fill="freeze" />
                </path>
                {/* Moving unit — outer glow circle */}
                <circle r={isElite ? 13 : 10} fill={anim.color} fillOpacity={0.25} stroke={anim.color} strokeWidth={1.5}>
                  <animateMotion dur={dur} fill="freeze" path={arcPath} />
                </circle>
                {/* Moving unit — inner dark circle */}
                <circle r={8} fill="#0d1117" stroke={anim.color} strokeWidth={2}>
                  <animateMotion dur={dur} fill="freeze" path={arcPath} />
                </circle>
                {/* Unit icon */}
                <text textAnchor="middle" fontSize={13} dy="4" style={{ pointerEvents: 'none' }}>
                  {icons[anim.type] || '⚔️'}
                  <animateMotion dur={dur} fill="freeze" path={arcPath} />
                </text>
                {/* Arrival burst ring 1 */}
                <circle cx={anim.toX} cy={anim.toY} r={6} fill="none" stroke={anim.color} strokeWidth={3}>
                  <animate attributeName="r" values="6;22;28" dur="0.7s" begin={dur} fill="freeze" />
                  <animate attributeName="strokeOpacity" values="1;0.5;0" dur="0.7s" begin={dur} fill="freeze" />
                  <animate attributeName="strokeWidth" values="3;1.5;0.5" dur="0.7s" begin={dur} fill="freeze" />
                </circle>
                {/* Arrival burst ring 2 (delayed) */}
                <circle cx={anim.toX} cy={anim.toY} r={4} fill="none" stroke="#ffffff" strokeWidth={2} strokeOpacity={0}>
                  <animate attributeName="r" values="4;16" dur="0.5s" begin={dur} fill="freeze" />
                  <animate attributeName="strokeOpacity" values="0.8;0" dur="0.5s" begin={dur} fill="freeze" />
                </circle>
                {/* Spark particles at destination */}
                {sparks.map((s, si) => (
                  <circle key={si}
                    cx={anim.toX} cy={anim.toY} r={2}
                    fill={isElite ? '#f0c040' : anim.color}
                    fillOpacity={0}>
                    <animate attributeName="cx" values={`${anim.toX};${anim.toX + s.dx}`} dur="0.6s" begin={dur} fill="freeze" />
                    <animate attributeName="cy" values={`${anim.toY};${anim.toY + s.dy}`} dur="0.6s" begin={dur} fill="freeze" />
                    <animate attributeName="fillOpacity" values="0;1;0" dur="0.6s" begin={dur} fill="freeze" />
                    <animate attributeName="r" values="1;3;1" dur="0.6s" begin={dur} fill="freeze" />
                  </circle>
                ))}
              </g>
            );
          })}

          {/* ── Special event location markers ── */}
          {specialEventLocations.map((ev, i) => {
            const { cx, cy } = toSVG(ev.x, ev.y);
            const isHovered = hoveredSpecialEvent === ev.id;
            return (
              <g key={`ev-${ev.id}`}
                style={{ pointerEvents: 'all', cursor: 'help' }}
                onMouseEnter={() => setHoveredSpecialEvent(ev.id)}
                onMouseLeave={() => setHoveredSpecialEvent(null)}>
                {/* Outer pulsing ring */}
                <circle cx={cx} cy={cy} r={18} fill="none" stroke={ev.color} strokeWidth={1.5} strokeOpacity={0.6}>
                  <animate attributeName="r" values="16;22;16" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="strokeOpacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Inner glow background */}
                <circle cx={cx} cy={cy} r={13} fill={ev.color} fillOpacity={0.18} filter="url(#eventGlow)" />
                <circle cx={cx} cy={cy} r={13} fill="#0d1117" fillOpacity={0.8} stroke={ev.color} strokeWidth={1.5} />
                {/* Event icon */}
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} style={{ pointerEvents: 'none' }}>
                  {ev.icon}
                </text>
                {/* Tooltip on hover */}
                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={cx - 60} y={cy - 52} width={120} height={44} rx={4}
                      fill="#0d1117" fillOpacity={0.97} stroke={ev.color} strokeWidth={1.5} />
                    <text x={cx} y={cy - 36} textAnchor="middle" fontSize={8}
                      fill={ev.color} fontFamily="'Cinzel',serif" fontWeight="700">
                      {ev.label.toUpperCase()}
                    </text>
                    <text x={cx} y={cy - 22} textAnchor="middle" fontSize={7} fill="#aaa">
                      {ev.desc}
                    </text>
                    <polygon points={`${cx - 5},${cy - 8} ${cx + 5},${cy - 8} ${cx},${cy - 2}`} fill={ev.color} />
                  </g>
                )}
              </g>
            );
          })}

          {/* ── Faction labels ── */}
          {FACTION_CENTROIDS.map(fc => {

            const { cx, cy } = toSVG(fc.x, fc.y);
            const words = fc.name.split(' ');
            const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
            const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
            const isHovered = hoveredFactionLabel === fc.fid;
            return (
              <g key={`fl${fc.fid}`}
                style={{ pointerEvents: isHovered ? 'none' : 'all', cursor: 'default', opacity: isHovered ? 0 : 1, transition: 'opacity 0.15s' }}
                onMouseEnter={() => setHoveredFactionLabel(fc.fid)}
                onMouseLeave={() => setHoveredFactionLabel(null)}>
                {/* Transparent hit area so hover works reliably */}
                <rect x={cx - 65} y={cy - 20} width={130} height={line2 ? 38 : 20} fill="transparent" />
                <text x={cx} y={cy - (line2 ? 6 : 0)} textAnchor="middle" fontSize={13}
                  fill="none" stroke={fc.color} strokeWidth={4} strokeOpacity={0.4}
                  fontFamily="'Cinzel', serif" fontWeight="900" letterSpacing={1}>
                  {line1.toUpperCase()}
                </text>
                <text x={cx} y={cy - (line2 ? 6 : 0)} textAnchor="middle" fontSize={13}
                  fill="#fff" stroke="#0a0806" strokeWidth={3} paintOrder="stroke"
                  fontFamily="'Cinzel', serif" fontWeight="900" letterSpacing={1}
                  style={{ opacity: 0.95 }}>
                  {line1.toUpperCase()}
                </text>
                {line2 && (
                  <>
                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize={13}
                      fill="none" stroke={fc.color} strokeWidth={4} strokeOpacity={0.4}
                      fontFamily="'Cinzel', serif" fontWeight="900" letterSpacing={1}>
                      {line2.toUpperCase()}
                    </text>
                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize={13}
                      fill="#fff" stroke="#0a0806" strokeWidth={3} paintOrder="stroke"
                      fontFamily="'Cinzel', serif" fontWeight="900" letterSpacing={1}
                      style={{ opacity: 0.95 }}>
                      {line2.toUpperCase()}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          </g>


        </svg>
      </div>

      {/* ══════ SIDE PANEL ══════ */}
      {selected && (
      <div style={{
        width: 260,
        background: 'linear-gradient(135deg, #1a1c22, #14161c)',
        borderLeft: '1px solid #2a2520',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#c8c0b0',
      }}>
        {/* Tabs + close button */}
         <div style={{ display: 'flex', borderBottom: '1px solid #2a2520', alignItems: 'stretch' }}>
            {[
             { id: 'selected', icon: '🗺️', label: 'Territory' },
             { id: 'units', icon: '⚔️', label: 'Units' },
             { id: 'buildings', icon: '🏛️', label: 'Structures' },
           ].map(t => (
            <button key={t.id} onClick={() => setPanelTab(t.id)} style={{
              flex: 1, padding: '10px 0', fontSize: 11,
              fontFamily: "'Cinzel', serif",
              background: panelTab === t.id ? '#1e1a12' : 'transparent',
              color: panelTab === t.id ? '#d4a853' : '#666',
              border: 'none',
              borderBottom: panelTab === t.id ? '2px solid #d4a853' : '2px solid transparent',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
            }}>{t.icon} {t.label}</button>
          ))}
          <button onClick={() => setSelected(null)} style={{
            padding: '0 12px', background: 'transparent', border: 'none',
            color: '#555', fontSize: 16, cursor: 'pointer', lineHeight: 1,
            borderBottom: '2px solid transparent',
            transition: 'color 0.15s',
          }} onMouseEnter={e => e.target.style.color='#d4a853'} onMouseLeave={e => e.target.style.color='#555'}>✕</button>
        </div>

        {/* Panel content */}
        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
          {panelTab === 'selected' && (
            selected ? (
              <div>
                {/* Province name */}
                <div style={{
                  color: '#d4a853', fontFamily: "'Cinzel', serif",
                  fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5,
                }}>
                  {selected.province_name || 'Uncharted Waters'}
                </div>

                {/* Capital / province info */}
                {(() => {
                  const hexId = `${selected.col},${selected.row}`;
                  const capInfo = CAPITAL_HEX_INFO[hexId];
                  const isNatCap = capInfo?.isNatCap;
                  const isProvCap = capInfo?.isProvCap;
                  if (isNatCap) return (
                    <div style={{ marginBottom: 10, borderRadius: 6, overflow: 'hidden', border: '1px solid #d4a85388' }}>
                      <div style={{ padding: '6px 10px', background: 'linear-gradient(90deg,#2a1e08,#1a1208)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>★</span>
                        <span style={{ color: '#f0c040', fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12 }}>{capInfo.capitalName}</span>
                        <span style={{ fontSize: 9, color: '#c08030', fontFamily: "'Cinzel',serif", letterSpacing: 1, marginLeft: 'auto' }}>NATIONAL CAPITAL</span>
                      </div>
                      <div style={{ padding: '6px 10px', fontSize: 10, color: '#a08040', lineHeight: 1.5, background: 'rgba(0,0,0,0.25)' }}>
                        🏰 Fortress city — controls the entire nation. Capture to cripple the realm.
                      </div>
                    </div>
                  );
                  if (isProvCap) return (
                    <div style={{ marginBottom: 10, borderRadius: 6, overflow: 'hidden', border: '1px solid #8a785044' }}>
                      <div style={{ padding: '6px 10px', background: 'linear-gradient(90deg,#1a1810,#141008)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12 }}>◆</span>
                        <span style={{ color: '#d4c870', fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 11 }}>{capInfo.capitalName}</span>
                        <span style={{ fontSize: 9, color: '#8a7840', fontFamily: "'Cinzel',serif", letterSpacing: 1, marginLeft: 'auto' }}>PROVINCIAL CAPITAL</span>
                      </div>
                      <div style={{ padding: '6px 10px', fontSize: 10, color: '#7a6840', lineHeight: 1.5, background: 'rgba(0,0,0,0.25)' }}>
                        ⚔️ Control this hex to own the entire province — all its hexes follow its owner.
                      </div>
                    </div>
                  );
                  // Non-capital hex: show which capital controls this province
                  if (selected.nation_id && selectedProvinceInfo) {
                    const provCapHexId = PROVINCE_TO_CAPITAL_HEX[`${selected.nation_id}-${selectedProvinceInfo.id}`];
                    return (
                      <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginBottom: 8, padding: '4px 8px', borderLeft: '2px solid #3a3020', background: 'rgba(0,0,0,0.15)', borderRadius: 2 }}>
                        ◆ Province capital: <span style={{ color: '#a09050' }}>{selectedProvinceInfo.capital}</span>
                        <br/><span style={{ color: '#444' }}>Capture the provincial capital hex to control this entire province</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Controller info */}
                {(() => {
                  const hexId = selected ? `${selected.col},${selected.row}` : null;
                  const owner = hexId ? getOwner(hexId, selected?.nation_id) : null;
                  const ownerPlayer = owner ? gameState?.players?.find(p => p.id === owner) : null;
                  if (!ownerPlayer) {
                    const isNeutralGarrison = owner && owner.startsWith('neutral_');
                    const neutralNation = isNeutralGarrison ? owner.replace('neutral_', '') : null;
                    const neutralLabel = neutralNation ? (NATION_LABEL_MAP[neutralNation]?.name || neutralNation) : null;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 0', borderTop: '1px solid #2a2520', borderBottom: '1px solid #2a2520' }}>
                        {isNeutralGarrison ? (
                          <>
                            <span style={{ fontSize: 14 }}>⚔️</span>
                            <span style={{ fontSize: 12, color: '#9a9a7a', fontStyle: 'italic' }}>
                              Neutral Garrison — {neutralLabel || neutralNation}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>Uncontrolled territory</span>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 0', borderTop: '1px solid #2a2520', borderBottom: '1px solid #2a2520' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: ownerPlayer.color, border: '1px solid #ffffff30', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 600, color: ownerPlayer.color }}>Controlled by {ownerPlayer.name}</span>
                    </div>
                  );
                })()}

                {/* Nation info */}
                {selectedNation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: NATION_COLORS[selectedNation.id], border: '1px solid #ffffff20', flexShrink: 0 }} />
                    {selectedNation.id === 'onishiman' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/8a875b40d_photo-output.png" alt="Onishiman" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'ruskel' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/0ef66cce6_photo-output4.png" alt="Ruskel" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'oakhaven' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/449a73901_oakhaven.png" alt="Oakhaven" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'ilalocatotlan' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/75e3d6016_photo-output3.png" alt="Tlalocayotlan" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'nimrudan' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/c8851f071_empireassyrian.png" alt="Nimrudan" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'gojeon' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/d68a471ae_photo-output672.png" alt="Gojeon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'azure' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/08a33f4a8_bluemoo.png" alt="Blue Moon Sultanate" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'icebound' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/011bfc403_thehorde.png" alt="Icebound Horde" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {selectedNation.id === 'kadjimaran' && (
                      <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/5e6882e48_photo-output2.png" alt="Kadjimaran" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontSize: 14, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>{NATION_LABEL_MAP[selectedNation.id]?.name || selectedNation.name}</span>
                  </div>
                )}

                {/* Terrain */}
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: '#888' }}>Terrain: </span>
                  <span style={{ textTransform: 'capitalize', color: '#c8c0b0' }}>{selected.terrain}</span>
                  <span style={{ marginLeft: 6, display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: TERRAIN_COLORS[selected.terrain] || '#444', verticalAlign: 'middle' }} />
                </div>

                {/* Terrain Effects */}
                {(() => {
                  const terrainEffects = {
                    water: 'Naval units only',
                    coastal: 'Ports allowed · Naval units passable',
                    plains: 'No terrain penalty',
                    forest: 'Defense +20% · Movement -1',
                    hills: 'Defense +15% · Movement -1',
                    mountain: 'Defense +30% · Movement -2 · Impassable to cavalry',
                    desert: 'Movement -1 · Low resources',
                    swamp: 'Defense +10% · Movement -2',
                    tundra: 'Movement -1 · Resource penalty',
                    scorched: 'Impassable territory',
                  };
                  return (
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 8, padding: '6px 0', borderTop: '1px solid #2a2520', borderBottom: '1px solid #2a2520' }}>
                      {terrainEffects[selected.terrain] || 'No special effects'}
                    </div>
                  );
                })()}

                {/* Buildings on hex */}
                {selected && (() => {
                  const buildings = [];
                  if (selected.buildings?.fortress) buildings.push({ icon: '🏰', name: 'Fortress', effect: 'Defense +2' });
                  if (selected.buildings?.port) buildings.push({ icon: '🚢', name: 'Port', effect: 'Naval trade +1' });
                  return buildings.length > 0 ? (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>STRUCTURES</div>
                      {buildings.map(b => (
                        <div key={b.name} style={{ fontSize: 11, color: '#c8c0b0', padding: '4px 0' }}>
                          {b.icon} {b.name} <span style={{ color: '#7a6a50', marginLeft: 4 }}>• {b.effect}</span>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}

                {/* Province stats */}
                {selectedProvinceInfo && (
                 <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                   <div>Province hexes: <span style={{ color: '#c8c0b0' }}>{selectedProvinceInfo.hex_count}</span></div>
                 </div>
                )}

                {/* Grid coords */}
                <div style={{ fontSize: 11, color: '#444', marginTop: 16 }}>
                  Grid: [{selected.col}, {selected.row}] · Pos: {Math.round(selected.x)}%, {Math.round(selected.y)}%
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#444', marginTop: 40, fontStyle: 'italic' }}>
                Select a territory on the map
              </div>
            )
          )}

          {panelTab === 'units' && selected && (() => {
            const hexId = `${selected.col},${selected.row}`;
            const panelUnits = getUnits(hexId);
            const hexOwner = getOwner(hexId, selected?.nation_id);
            const isMyHex = hexOwner === currentPlayer?.id;
            const alreadyMoved = movedHexes?.has(hexId);
            const canMove = (phase === 'move' || phase === 'deploy' || phase === 'attack' || phase === 'fortify') && isMyHex && !currentPlayer?.isAI && !alreadyMoved;
            const icons = { infantry: '🏃', cavalry: '🐴', elite: '⭐', ranged: '🏹', siege: '🏰', naval: '⚓' };
            const typeNames = { infantry: 'Infantry', cavalry: 'Cavalry', elite: 'Elite Guard', ranged: 'Ranged', siege: 'Siege Engine', naval: 'Warship' };

            const toggleUnit = (idx) => {
              if (!canMove) return;
              setSelectedPanelUnits(prev => {
                const next = new Set(prev);
                if (next.has(idx)) next.delete(idx);
                else next.add(idx);
                return next;
              });
            };

            const handleMoveSelected = () => {
              if (selectedPanelUnits.size === 0 || !onSelectPanelUnit) return;
              const selectedUnitTypes = [...selectedPanelUnits].map(idx => panelUnits[idx]);
              onSelectPanelUnit(hexId, selectedUnitTypes);
              setSelectedPanelUnits(new Set());
            };

            return (
              <div>
                <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                  UNITS ON HEX
                </div>
                {!canMove && alreadyMoved && (
                   <div style={{ fontSize: 11, color: '#c08030', marginBottom: 8, padding: '6px 8px', background: 'rgba(192,128,48,0.1)', border: '1px solid #8a6a30', borderRadius: 4 }}>
                     This unit already moved this turn
                   </div>
                 )}
                {canMove && (
                   <div style={{ fontSize: 11, color: '#7a9a7a', marginBottom: 8, padding: '6px 8px', background: 'rgba(100,160,100,0.1)', border: '1px solid #3a5a3a', borderRadius: 4 }}>
                     Click units to select · then click destination on map
                   </div>
                 )}
                {panelUnits.length > 0 ? (
                  <div>
                    {panelUnits.map((u, i) => {
                      const isSelected = selectedPanelUnits.has(i);
                      return (
                        <div key={i}
                          onClick={() => toggleUnit(i)}
                          style={{
                            fontSize: 13,
                            color: isSelected ? '#d4a853' : '#c8c0b0',
                            marginBottom: 6,
                            paddingBottom: 6,
                            borderBottom: '1px solid #2a2520',
                            padding: '8px',
                            borderRadius: 4,
                            cursor: canMove ? 'pointer' : 'default',
                            background: isSelected ? 'rgba(212,168,83,0.15)' : 'transparent',
                            border: isSelected ? '1px solid #d4a853' : '1px solid transparent',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}>
                          {canMove && (
                            <div style={{
                              width: 14, height: 14, borderRadius: 3, border: '1.5px solid',
                              borderColor: isSelected ? '#d4a853' : '#555',
                              background: isSelected ? '#d4a853' : 'transparent',
                              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, color: '#1a1a1a',
                            }}>
                              {isSelected ? '✓' : ''}
                            </div>
                          )}
                          <span style={{ fontSize: 18 }}>{icons[u.type] || '⚔️'}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 12 }}>{typeNames[u.type] || u.type}</div>
                            {u.count > 1 && <div style={{ fontSize: 11, color: '#7a6a50' }}>×{u.count} units</div>}
                          </div>
                        </div>
                      );
                    })}
                    {canMove && selectedPanelUnits.size > 0 && (
                      <button
                        onClick={handleMoveSelected}
                        style={{
                          width: '100%', marginTop: 8, padding: '8px',
                          background: 'linear-gradient(135deg, #3a6a3a, #2a4a2a)',
                          border: '1px solid #5a9a5a', borderRadius: 4,
                          color: '#9afa9a', fontFamily: "'Cinzel', serif",
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          letterSpacing: 0.5,
                        }}>
                        🚶 Move {selectedPanelUnits.size} unit{selectedPanelUnits.size > 1 ? 's' : ''} — click destination
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>No units on this hex</div>
                )}
              </div>
            );
          })()}

          {panelTab === 'buildings' && selected && (() => {
            const selHexId = `${selected.col},${selected.row}`;
            const hexBuildings = gameState?.hexes?.[selHexId]?.buildings || {};
            const capInfo = CAPITAL_HEX_INFO[selHexId];
            const BDEF = {
              fortress: { icon: '🏰', name: 'Fortress', effect: 'Defense +2 dice', color: '#8a8a9a', desc: 'Stone fortification. Defenders roll d8 instead of d6.' },
              port: { icon: '⚓', name: 'Harbour Port', effect: 'Naval access · Gold +1', color: '#4488ff', desc: 'Enables naval deployment and boosts coastal income.' },
              _nat_capital: { icon: '★', name: 'National Capital', effect: 'Controls entire nation · Fortress', color: '#d4a853', desc: 'The throne city of the nation. Controlling this hex grants dominance over the entire realm.' },
              _prov_capital: { icon: '◆', name: 'Provincial Capital', effect: 'Controls province', color: '#c8b860', desc: 'The capital of this province. Whoever holds this hex owns all hexes of the province.' },
            };
            // Add capital pseudo-entries
            const capitalEntries = capInfo?.isNatCap ? [['_nat_capital', true]] : capInfo?.isProvCap ? [['_prov_capital', true]] : [];
            const entries = [...capitalEntries, ...Object.entries(hexBuildings)];
            return (
              <div>
                <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
                  STRUCTURES ON HEX
                </div>
                {entries.length > 0 ? entries.map(([key]) => {
                   const def = BDEF[key] || { icon: '🏛️', name: key, effect: '', color: '#888', desc: '' };
                   if (!def) return null;
                  return (
                    <div key={key} style={{
                      marginBottom: 10, borderRadius: 8, overflow: 'hidden',
                      border: `1px solid ${def.color}55`,
                      background: `linear-gradient(135deg, ${def.color}18, #0a0c12)`,
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: `1px solid ${def.color}33` }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: `radial-gradient(circle at 35% 30%, ${def.color}88, #0a0c12)`,
                          border: `2px solid ${def.color}88`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, boxShadow: `0 0 10px ${def.color}44`,
                        }}>
                          {def.icon}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: def.color }}>{def.name}</div>
                          <div style={{ fontSize: 10, color: '#7a9a7a', marginTop: 1 }}>✦ {def.effect}</div>
                        </div>
                      </div>
                      {/* Description */}
                      {def.desc && (
                        <div style={{ padding: '8px 12px', fontSize: 11, color: '#8a8070', fontStyle: 'italic', lineHeight: 1.5 }}>
                          {def.desc}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{ textAlign: 'center', color: '#444', marginTop: 32, fontStyle: 'italic', fontSize: 12 }}>
                    No structures on this hex
                  </div>
                )}
              </div>
            );
          })()}





          {panelTab === 'actions' && (
            <div style={{ textAlign: 'center', color: '#555', marginTop: 40, fontStyle: 'italic', fontSize: 12 }}>
              {phase === 'planning' ? 'Select provinces to reinforce' :
               phase === 'action' ? 'Move units between provinces' :
               phase === 'combat' ? 'Resolve battles' :
               'Waiting for next phase...'}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}