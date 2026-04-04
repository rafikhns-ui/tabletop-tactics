import React, { useMemo, useState } from 'react';
import mapData from './ardonia_game_map.json';

const TERRAIN_COLORS = {
  water: '#0a4d68',
  plains: '#8b7355',
  forest: '#2d5016',
  mountain: '#5a5a5a',
  desert: '#d4a574',
  swamp: '#3d4a2c',
  tundra: '#c4d4db'
};

function flatHexCorners(cx, cy, size) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i);
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(' ');
}

export default function HexMap({ gameState, selectedHex, phase, currentPlayer, onHexClick, movementState }) {
  const hexGrid = mapData.hex_grid;
  const nations = mapData.nations;
  const [selected, setSelected] = useState(null);
  const [panelTab, setPanelTab] = useState('selected');

  const allHexes = useMemo(() => hexGrid.flat(), [hexGrid]);

  // Viewport setup: use 0-100 coordinates directly but scaled for SVG
  const SVG_W = 1200;
  const SVG_H = 900;
  const HEX_R = 2.5; // Matching Claude's 2.5 hex_size (radius is half)

  const toSVG = (px, py) => ({
    cx: (px / 100) * SVG_W,
    cy: (py / 100) * SVG_H,
  });

  const getOwner = (hexId) => gameState?.hexes?.[hexId]?.owner || null;
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hexId) => gameState?.hexes?.[hexId]?.units || [];

  const handleHexClick = (hex) => {
    const hexId = `${hex.col},${hex.row}`;
    setSelected(hex);
    setPanelTab('selected');
    if (onHexClick) onHexClick(hexId);
  };

  const selectedNation = selected?.nationid ? nations.find(n => n.id === selected.nationid) : null;

  return (
    <div style={{ display: 'flex', height: '62vh', background: '#0a0c12', overflow: 'hidden', border: '1px solid #2a2520' }}>
      {/* SVG MAP */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ background: '#0a0c12', display: 'block' }}
        >
          <defs>
            <filter id="goldGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#d4a853" />
            </filter>
          </defs>

          {allHexes.map(hex => {
            const hexId = `${hex.col},${hex.row}`;
            const { cx, cy } = toSVG(hex.x, hex.y);
            const terrain = hex.terrain || 'water';
            const isWater = terrain === 'water';
            const owner = getOwner(hexId);
            const playerColor = getPlayerColor(owner);
            const nationColor = hex.nationid ? (NATION_COLORS[hex.nationid] || '#666') : null;
            const isSelected = selectedHex === hexId || (selected?.col === hex.col && selected?.row === hex.row);
            const units = getUnits(hexId);
            const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);

            const fillColor = TERRAIN_COLORS[terrain] || '#444';

            return (
              <g key={hexId} onClick={() => handleHexClick(hex)} style={{ cursor: isWater ? 'default' : 'pointer' }}>
                <polygon
                  points={flatHexCorners(cx, cy, HEX_R * (SVG_W/100))}
                  fill={fillColor}
                  fillOpacity={isWater ? 0.55 : 0.85}
                  stroke={isSelected ? '#d4a853' : isWater ? '#0a0c12' : '#00000066'}
                  strokeWidth={isSelected ? 3 : 0.5}
                  filter={isSelected ? 'url(#goldGlow)' : undefined}
                />
                {!isWater && (
                  <polygon
                    points={flatHexCorners(cx, cy, (HEX_R * 0.88) * (SVG_W/100))}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                          )}
        {/* Nation color overlay */}
        {hex.nationid && (
          <polygon
            points={flatHexCorners(cx, cy, (HEX_R * 0.92) * (SVG_W/100))}
            fill={nationColor}
            fillOpacity={0.4}
            style={{ pointerEvents: 'none' }}
          />
        )}
                )}
                {hex.capitalname && (
                  <text x={cx} y={cy - 2} textAnchor="middle" fontSize={8} style={{ pointerEvents: 'none' }}>★</text>
                )}
                {unitCount > 0 && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={cx + 8} cy={cy - 8} r={6} fill={playerColor || '#d4a853'} stroke="#0a0c12" strokeWidth={1} />
                    <text x={cx + 8} y={cy - 4} textAnchor="middle" fontSize={7} fill="#0a0c12" fontWeight="bold">{unitCount}</text>
                  </g>
                )}
              </g>
            );
          })}

          {nations.map(nation => {
            const { cx, cy } = toSVG(nation.centroid[0], nation.centroid[1]);
            return (
              <g key={nation.id} style={{ pointerEvents: 'none' }}>
                <text x={cx} y={cy} textAnchor="middle" fontSize={12}
                  stroke="#0a0806" strokeWidth={4} paintOrder="stroke"
                  fill="#fff" fontFamily="'Cinzel', serif" fontWeight="bold" letterSpacing={2}
                  style={{ textTransform: 'uppercase', opacity: 0.9 }}
                >{nation.name}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* SIDE PANEL */}
      <div style={{
        width: 260, background: 'linear-gradient(135deg, #1a1c22, #14161c)',
        borderLeft: '1px solid #2a2520', display: 'flex', flexDirection: 'column',
        fontFamily: "'Cormorant Garamond', serif", color: '#c8c0b0'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2520' }}>
          {['selected','nation','actions'].map(t => (
            <button key={t} onClick={() => setPanelTab(t)} style={{
              flex: 1, padding: '10px 0', fontSize: 11, fontFamily: "'Cinzel', serif",
              background: panelTab === t ? '#1e1a12' : 'transparent',
              color: panelTab === t ? '#d4a853' : '#666',
              border: 'none', borderBottom: panelTab === t ? '2px solid #d4a853' : '2px solid transparent',
              cursor: 'pointer', textTransform: 'uppercase'
            }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
          {panelTab === 'selected' && (
            selected ? (
              <>
                <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 16, marginBottom: 8 }}>
                  {selected.provincename || 'Wilderness'}
                </div>
                {selected.capitalname && <div style={{ color: '#f0a030', fontSize: 13, marginBottom: 12 }}>★ {selected.capitalname}</div>}
                {selectedNation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: NATION_COLORS[selectedNation.id] }} />
                    <span style={{ fontSize: 14 }}>{selectedNation.name}</span>
                  </div>
                )}
                <div style={{ fontSize: 13, textTransform: 'capitalize', color: '#888' }}>Terrain: {selected.terrain}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 20 }}>Grid: {selected.col}, {selected.row}</div>
              </>
            ) : <div style={{ textAlign: 'center', color: '#444', marginTop: 40 }}>Select a territory</div>
          )}
          {panelTab === 'nation' && currentPlayer && (
            <div>
              <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 16, marginBottom: 12 }}>{currentPlayer.name}</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Gold: {currentPlayer.resources?.gold ?? 0}</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Influence: {currentPlayer.ip ?? 0}</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Faith: {currentPlayer.sp ?? 0}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
