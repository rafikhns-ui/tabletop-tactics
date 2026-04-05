import React, { useMemo } from 'react';
import mapData from './ardonia_game_map.json';
import { FACTION_TO_NATION_ID } from './ardoniaData';

const W = 180;
const H = 130;

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
mapData.hex_grid.forEach(h => {
  if (h.x < minX) minX = h.x;
  if (h.x > maxX) maxX = h.x;
  if (h.y < minY) minY = h.y;
  if (h.y > maxY) maxY = h.y;
});

function toMini(px, py) {
  const pad = 4;
  return {
    cx: pad + ((px - minX) / (maxX - minX)) * (W - pad * 2),
    cy: pad + ((py - minY) / (maxY - minY)) * (H - pad * 2),
  };
}

const HEX_R = 2.8;

function miniHexPoints(cx, cy) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + HEX_R * Math.cos(a)},${cy + HEX_R * Math.sin(a)}`;
  }).join(' ');
}

const TERRAIN_COLORS = {
  water: '#0d2a44', coastal: '#1a4060', plains: '#3a5220',
  forest: '#1a3a1a', hills: '#4a4020', mountain: '#303040',
  desert: '#6a5020', swamp: '#2a3a1a', tundra: '#5a6a7a', scorched: '#2a1000',
};

export default function MiniMap({ gameState, onPanTo }) {
  const nationOwnerMap = useMemo(() => {
    const map = {};
    if (gameState?.players) {
      gameState.players.forEach(p => {
        if (!p.factionId) return;
        const nationId = FACTION_TO_NATION_ID[p.factionId] || p.factionId;
        map[nationId] = p.color;
      });
    }
    return map;
  }, [gameState?.players]);

  const getHexColor = (hex) => {
    const hexId = `${hex.col},${hex.row}`;
    const hexOwner = gameState?.hexes?.[hexId]?.owner;
    if (hexOwner) {
      const player = gameState?.players?.find(p => p.id === hexOwner);
      if (player) return player.color;
    }
    if (hex.nation_id && nationOwnerMap[hex.nation_id]) {
      return nationOwnerMap[hex.nation_id];
    }
    return TERRAIN_COLORS[hex.terrain] || '#222';
  };

  const handleClick = (e) => {
    if (!onPanTo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / W;
    const ry = (e.clientY - rect.top) / H;
    const mapX = minX + rx * (maxX - minX);
    const mapY = minY + ry * (maxY - minY);
    onPanTo(mapX, mapY);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        zIndex: 20,
        background: 'rgba(10,12,18,0.92)',
        border: '1px solid #d4a853',
        borderRadius: 4,
        boxShadow: '0 0 16px rgba(0,0,0,0.7)',
        cursor: 'crosshair',
        userSelect: 'none',
      }}
      title="Click to pan map"
    >
      <div style={{
        fontSize: 9, fontFamily: "'Cinzel',serif", color: '#d4a853',
        textAlign: 'center', padding: '2px 0 0', letterSpacing: 1,
        borderBottom: '1px solid #2a2520',
      }}>
        OVERVIEW
      </div>
      <svg width={W} height={H} onClick={handleClick} style={{ display: 'block' }}>
        {mapData.hex_grid.map(hex => {
          const { cx, cy } = toMini(hex.x, hex.y);
          const color = getHexColor(hex);
          const isWater = !hex.nation_id;
          return (
            <polygon
              key={`${hex.col},${hex.row}`}
              points={miniHexPoints(cx, cy)}
              fill={color}
              fillOpacity={isWater ? 0.5 : 0.85}
              stroke={isWater ? 'none' : 'rgba(0,0,0,0.3)'}
              strokeWidth={0.3}
            />
          );
        })}
        {gameState?.players?.map((p, i) => (
          <g key={p.id}>
            <circle cx={6 + i * 18} cy={H - 6} r={4} fill={p.color} stroke="#000" strokeWidth={0.5} />
          </g>
        ))}
      </svg>
    </div>
  );
}