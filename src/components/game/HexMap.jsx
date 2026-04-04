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

const NATION_COLORS = {
  gojeon: '#7B3DBE', inuvak: '#2E9E9E', ruskel: '#C43030',
  icebound: '#D8CFC0', oakhaven: '#2E8D32', shadowsfall: '#3C3C3C',
  onishiman: '#8B1525', silver: '#B0B0B0', kadjimaran: '#C49A2A',
  nimrudan: '#B5451B', kinetic: '#E07020', ilalocatotlan: '#8B9B30',
  hestia: '#A08050', azure: '#7A6AED', scorched: '#8B3A0F',
};

// flat-top hex corners
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

  // Map viewport: x/y are 0-100 percent coords, we scale to SVG
  const SVG_W = 1100;
  const SVG_H = 700;
  const HEX_R = 10; // display radius in SVG units

  const toSVG = (px, py) => ({
    cx: (px / 100) * SVG_W,
    cy: (py / 100) * SVG_H,
  });

  const getOwner = (hexId) => gameState?.hexes?.[hexId]?.owner || null;
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hexId) => gameState?.hexes?.[hexId]?.units || [];

  const handleHexClick = (hex) => {
    const hexId = `${hex.col},${hex.row}`;
    if (hex.terrain === 'water') return;
    setSelected(hex);
    setPanelTab('selected');
    if (onHexClick) onHexClick(hexId);
  };

  const selectedNation = selected ? nations.find(n => n.id === selected.nationid) : null;

  return (
    <div style={{ display: 'flex', height: '58vh', background: '#0a0c12', overflow: 'hidden' }}>
      {/* SVG MAP */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          style={{ display: 'block', background: '#0a0c12' }}
        >
          <defs>
            <filter id="goldGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
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
            const isSelected = selectedHex === hexId || selected?.col === hex.col && selected?.row === hex.row;
            const units = getUnits(hexId);
            const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);

            // Color priority: player ownership > nation color > terrain color
            const fillColor = playerColor || nationColor || TERRAIN_COLORS[terrain] || '#444';

            return (
              <g key={hexId} onClick={() => handleHexClick(hex)} style={{ cursor: isWater ? 'default' : 'pointer' }}>
                {/* Main hex */}
                <polygon
                  points={flatHexCorners(cx, cy, HEX_R)}
                  fill={fillColor}
                  fillOpacity={isWater ? 0.55 : 0.85}
                  stroke={isSelected ? '#d4a853' : isWater ? '#0a0c12' : '#00000066'}
                  strokeWidth={isSelected ? 2 : 0.5}
                  filter={isSelected ? 'url(#goldGlow)' : undefined}
                />
                {/* Inner depth hex */}
                {!isWater && (
                  <polygon
                    points={flatHexCorners(cx, cy, HEX_R * 0.78)}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Unit badge */}
                {unitCount > 0 && (
                  <>
                    <circle cx={cx + 5} cy={cy - 5} r={4.5} fill={playerColor || '#d4a853'} stroke="#0a0c12" strokeWidth={1} />
                    <text x={cx + 5} y={cy - 2} textAnchor="middle" fontSize={5} fill="#0a0c12" fontWeight="bold" style={{ pointerEvents: 'none' }}>{unitCount}</text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nation labels at centroids */}
          {nations.map(nation => {
            const { cx, cy } = toSVG(nation.centroid[0], nation.centroid[1]);
            return (
              <g key={nation.id} style={{ pointerEvents: 'none' }}>
                <text x={cx} y={cy} textAnchor="middle" fontSize={7}
                  stroke="#0a0806" strokeWidth={3} paintOrder="stroke"
                  fill={NATION_COLORS[nation.id] || '#fff'}
                  fontFamily="serif" fontWeight="bold" letterSpacing={1}
                  style={{ textTransform: 'uppercase' }}
                >{nation.name.split(' ').slice(0,2).join(' ')}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* SIDE PANEL */}
      <div style={{
        width: 260, flexShrink: 0, background: 'linear-gradient(135deg,#1a1c22,#14161c)',
        borderLeft: '1px solid #2a2520', display: 'flex', flexDirection: 'column',
        fontFamily: "'Crimson Text', serif", color: '#c8c0b0', overflowY: 'auto'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2520' }}>
          {['selected','nation','actions'].map(tab => (
            <button key={tab} onClick={() => setPanelTab(tab)} style={{
              flex: 1, padding: '8px 0', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: 1, fontFamily: "'Cinzel', serif",
              background: panelTab === tab ? '#1e1a12' : 'transparent',
              color: panelTab === tab ? '#d4a853' : '#666',
              border: 'none', borderBottom: panelTab === tab ? '2px solid #d4a853' : '2px solid transparent',
              cursor: 'pointer'
            }}>{tab}</button>
          ))}
        </div>

        {panelTab === 'selected' && (
          <div style={{ padding: 12 }}>
            {selected ? (
              <>
                <div style={{ color: '#d4a853', fontFamily: "'Cinzel',serif", fontSize: 13, marginBottom: 6 }}>
                  {selected.provincename || 'Unknown Province'}
                </div>
                {selected.capitalname && (
                  <div style={{ fontSize: 11, color: '#f0a030', marginBottom: 4 }}>&#9733; {selected.capitalname}</div>
                )}
                {selectedNation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: NATION_COLORS[selectedNation.id] }} />
                    <span style={{ fontSize: 11 }}>{selectedNation.name}</span>
                  </div>
                )}
                <div style={{ fontSize: 11, textTransform: 'capitalize', color: '#888', marginBottom: 4 }}>
                  Terrain: {selected.terrain}
                </div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 8 }}>Col {selected.col}, Row {selected.row}</div>
              </>
            ) : (
              <div style={{ color: '#555', fontSize: 11, marginTop: 20, textAlign: 'center' }}>
                Click a hex to see details
              </div>
            )}
          </div>
        )}

        {panelTab === 'nation' && currentPlayer && (
          <div style={{ padding: 12 }}>
            <div style={{ color: '#d4a853', fontFamily: "'Cinzel',serif", fontSize: 13, marginBottom: 8 }}>
              {currentPlayer.name}
            </div>
            <div style={{ fontSize: 11, marginBottom: 4 }}>Gold: {currentPlayer.resources?.gold ?? 0}</div>
            <div style={{ fontSize: 11, marginBottom: 4 }}>IP: {currentPlayer.ip ?? 0}</div>
            <div style={{ fontSize: 11, marginBottom: 4 }}>SP: {currentPlayer.sp ?? 0}</div>
          </div>
        )}

        {panelTab === 'actions' && (
          <div style={{ padding: 12 }}>
            <div style={{ color: '#d4a853', fontFamily: "'Cinzel',serif", fontSize: 12, marginBottom: 8 }}>Phase: {phase}</div>
            <div style={{ fontSize: 10, color: '#666' }}>Use the action bar below to take actions.</div>
          </div>
        )}
      </div>
    </div>
  );
}
