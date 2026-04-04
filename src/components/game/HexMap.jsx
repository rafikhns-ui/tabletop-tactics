import React, { useMemo, useState } from 'react';
import mapData from './ardonia_game_map.json';

const TERRAIN_COLORS = {
  water: '#183a5c',
  coastal: '#2a6080',
  plains: '#5a7a30',
  forest: '#1e4a1e',
  hills: '#6a6030',
  mountain: '#4a4a5a',
  desert: '#9a7a30',
  swamp: '#3a4a2a',
  tundra: '#7a8a9a',
  scorched: '#4a1a0a',
};

const TERRAIN_ICONS = {
  forest: '\u25B2',
  mountain: '\u25B2',
  desert: '~',
  swamp: '~',
  scorched: '\u2605',
};

const HEX_SIZE = 12;

function hexCorners(cx, cy, size) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(' ');
}

export default function HexMap({ gameState, selectedHex, phase, currentPlayer, onHexClick, movementState }) {
  const hexGrid = mapData.hex_grid;
  const nations = mapData.nations;
  const [tooltip, setTooltip] = useState(null);

  const nationColorMap = useMemo(() => {
    const map = {};
    if (nations) nations.forEach(n => { map[n.id] = n.color; });
    return map;
  }, [nations]);

  const SCALE = 5;

  const allHexes = useMemo(() => hexGrid.flat(), [hexGrid]);

  const { minX, minY } = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    allHexes.forEach(h => {
      if (h.x < minX) minX = h.x;
      if (h.y < minY) minY = h.y;
    });
    return { minX, minY };
  }, [allHexes]);

  const PAD = HEX_SIZE * 2;

  const { svgWidth, svgHeight } = useMemo(() => {
    let maxX = -Infinity, maxY = -Infinity;
    allHexes.forEach(h => {
      const cx = (h.x - minX) * SCALE + PAD;
      const cy = (h.y - minY) * SCALE + PAD;
      if (cx > maxX) maxX = cx;
      if (cy > maxY) maxY = cy;
    });
    return { svgWidth: maxX + PAD, svgHeight: maxY + PAD };
  }, [allHexes, minX, minY]);

  const getOwner = (hexId) => gameState?.hexes?.[hexId]?.owner || null;
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hexId) => gameState?.hexes?.[hexId]?.units || [];

  const getReachable = () => {
    if (!movementState || !gameState) return new Set();
    const { getReachableHexes } = require('./hexGridSystem');
    return getReachableHexes(movementState.fromHexId, movementState.selectedUnit, movementState.speed, gameState.hexes) || new Set();
  };

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '58vh', background: '#0d1a2a', position: 'relative' }}>
      {tooltip && (
        <div style={{
          position: 'fixed', top: tooltip.y + 10, left: tooltip.x + 10,
          background: 'rgba(10,8,5,0.95)', border: '1px solid #8a7a40',
          color: '#d4c080', padding: '6px 10px', borderRadius: 6,
          fontSize: 11, pointerEvents: 'none', zIndex: 100,
          fontFamily: "'Crimson Text', serif", maxWidth: 180
        }}>
          <div style={{ fontWeight: 'bold', color: '#f0d070' }}>{tooltip.province || 'Water'}</div>
          {tooltip.nation && <div style={{ color: '#aaa' }}>{tooltip.nation}</div>}
          <div style={{ color: '#888', textTransform: 'capitalize' }}>{tooltip.terrain}</div>
          {tooltip.capital && <div style={{ color: '#f0a030' }}>\u2605 {tooltip.capital}</div>}
        </div>
      )}
      <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
        {allHexes.map(hex => {
          const hexId = `${hex.col},${hex.row}`;
          const cx = (hex.x - minX) * SCALE + PAD;
          const cy = (hex.y - minY) * SCALE + PAD;
          const terrain = hex.terrain || 'water';
          const owner = getOwner(hexId);
          const playerColor = getPlayerColor(owner);
          const nationColor = hex.nationid ? nationColorMap[hex.nationid] : null;
          const isWater = terrain === 'water';
          const isSelected = selectedHex === hexId;
          const units = getUnits(hexId);
          const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);
          const baseColor = playerColor || nationColor || TERRAIN_COLORS[terrain] || '#444';
          const strokeColor = isSelected ? '#FFD700' : isWater ? '#0d1a2a' : '#00000055';
          const strokeWidth = isSelected ? 2.5 : 0.6;
          const icon = TERRAIN_ICONS[terrain];

          return (
            <g
              key={hexId}
              onClick={() => !isWater && onHexClick && onHexClick(hexId)}
              onMouseEnter={(e) => !isWater && setTooltip({
                x: e.clientX, y: e.clientY,
                province: hex.provincename,
                nation: hex.nationid ? nations.find(n => n.id === hex.nationid)?.name : null,
                terrain,
                capital: hex.capitalname || null
              })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: isWater ? 'default' : 'pointer' }}
            >
              <polygon
                points={hexCorners(cx, cy, HEX_SIZE - 0.8)}
                fill={baseColor}
                fillOpacity={isWater ? 0.6 : 0.88}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              {isSelected && (
                <polygon
                  points={hexCorners(cx, cy, HEX_SIZE - 0.8)}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth={2.5}
                  strokeOpacity={0.9}
                />
              )}
              {icon && !isWater && (
                <text x={cx} y={cy + 3} textAnchor="middle" fontSize={6} fill="rgba(255,255,255,0.35)" style={{ pointerEvents: 'none' }}>
                  {icon}
                </text>
              )}
              {unitCount > 0 && (
                <>
                  <circle cx={cx + 5} cy={cy - 5} r={4} fill={playerColor || '#fff'} stroke="#111" strokeWidth={0.8} />
                  <text x={cx + 5} y={cy - 2} textAnchor="middle" fontSize={5} fill="#111" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                    {unitCount}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
