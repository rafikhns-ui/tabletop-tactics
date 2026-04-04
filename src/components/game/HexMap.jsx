import React, { useMemo, useState } from 'react';
import mapData from './ardonia_game_map.json';
import { FACTIONS } from './ardoniaData';

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

// ══════ FACTION NAME MAPPING (JSON nation_id → playable faction id) ══════
const remapFaction = (nationId) => {
  const map = {
    gojeon:        'gojeon',
    inuvak:        'inuvak',
    ruskel:        'ruskel',
    icebound:      'icebound',
    oakhaven:      'oakhaven',
    onishiman:     'onishiman',
    kadjimaran:    'kadjimaran',
    nimrudan:      'nimrudan',
    kinetic:       'kintei',        // "Greater Kinetic" → Greater Kintei
    ilalocatotlan: 'tlalocayotlan', // Ilalocatotlan → Tlalocayotlan League
    hestia:        'republic',      // Republic of Hestia
    azure:         'sultanate',     // Azure Moon Sultanate → Blue Moon Sultanate
    silver:        'silver_union',  // Silver Union
    shadowsfall:   'shadowsfall',   // Order of Shadowsfall
    scorched:      'scorched',      // The Scorched Lands
  };
  return map[nationId] ?? null;
};

// ══════ FACTION CENTROIDS (computed from hex_grid) ══════
const factionCentroidMap = {};
mapData.hex_grid.forEach(h => {
  if (!h.nation_id) return;
  const fid = remapFaction(h.nation_id);
  if (!fid || !FACTIONS[fid]) return;
  if (!factionCentroidMap[fid]) factionCentroidMap[fid] = { sx: 0, sy: 0, cnt: 0 };
  factionCentroidMap[fid].sx += h.x;
  factionCentroidMap[fid].sy += h.y;
  factionCentroidMap[fid].cnt++;
});
// Fallback names/colors for non-playable factions from the JSON
const EXTRA_FACTION_INFO = {
  shadowsfall: { name: 'Order of Shadowsfall', color: '#3C3C3C' },
  scorched:    { name: 'The Scorched Lands',    color: '#8B3A0F' },
  silver_union:{ name: 'Silver Union',          color: '#B0B0B0' },
};

const FACTION_CENTROIDS = Object.entries(factionCentroidMap).map(([fid, v]) => ({
  fid,
  x: v.sx / v.cnt,
  y: v.sy / v.cnt,
  name: FACTIONS[fid]?.name || EXTRA_FACTION_INFO[fid]?.name || fid,
  color: FACTIONS[fid]?.color || EXTRA_FACTION_INFO[fid]?.color || '#fff',
}));

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
  const key = `${h.nation_id}-${h.province}`;
  if (!provinceCentroids[key]) provinceCentroids[key] = { sx: 0, sy: 0, cnt: 0, nid: h.nation_id, prov: h.province };
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
export default function HexMap({ gameState, selectedHex, phase, currentPlayer, onHexClick, movementState }) {
  const hexGrid = mapData.hex_grid;
  const nations = mapData.nations;
  const [selected, setSelected] = useState(null);
  const [panelTab, setPanelTab] = useState('selected');

  const SVG_W = 1200;
  const SVG_H = 900;
  const HEX_SIZE = 2.5;
  const HEX_PX = HEX_SIZE * (SVG_W / 100);

  const toSVG = (px, py) => ({ cx: (px / 100) * SVG_W, cy: (py / 100) * SVG_H });

  // ── Game state helpers ──
  const getOwner = (hexId) => gameState?.hexes?.[hexId]?.owner || null;
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hexId) => gameState?.hexes?.[hexId]?.units || [];

  const handleHexClick = (hex) => {
    const hexId = `${hex.col},${hex.row}`;
    setSelected(hex);
    setPanelTab('selected');
    if (onHexClick) onHexClick(hexId);
  };

  // ── Pre-compute border edges (province + nation) ──
  const { provBorderEdges, natBorderEdges } = useMemo(() => {
    const pEdges = [];
    const nEdges = [];
    hexGrid.forEach(h => {
      if (!h.nation_id) return;
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

        if (!nb || nb.nation_id !== h.nation_id) {
          nEdges.push({ x1, y1, x2, y2, color: NATION_COLORS[h.nation_id] || '#333' });
        } else if (nb.nation_id === h.nation_id && nb.province !== h.province) {
          pEdges.push({ x1, y1, x2, y2 });
        }
      }
    });
    return { provBorderEdges: pEdges, natBorderEdges: nEdges };
  }, [hexGrid]);

  const selectedNation = selected?.nation_id ? nations.find(n => n.id === selected.nation_id) : null;
  const selectedProvince = selectedNation ? selectedNation.provinces.find(p => p.id === selected.province) : null;

  return (
    <div style={{ display: 'flex', height: '62vh', background: '#0a0c12', overflow: 'hidden', border: '1px solid #2a2520' }}>
      {/* ══════ SVG MAP ══════ */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ background: '#0a0c12', display: 'block' }}
        >
          <defs>
            <filter id="goldGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#d4a853" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* ── Hex fills ── */}
          {hexGrid.map(hex => {
            const hexId = `${hex.col},${hex.row}`;
            const { cx, cy } = toSVG(hex.x, hex.y);
            const terrain = hex.terrain || 'water';
            const isWater = !hex.nation_id;
            const isSelected = selectedHex === hexId || (selected?.col === hex.col && selected?.row === hex.row);
            const owner = getOwner(hexId);
            const playerColor = getPlayerColor(owner);
            const units = getUnits(hexId);
            const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);
            const fillColor = TERRAIN_COLORS[terrain] || '#444';
            const nationColor = hex.nation_id ? (NATION_COLORS[hex.nation_id] || '#666') : null;

            return (
              <g key={hexId} onClick={() => !isWater && handleHexClick(hex)} style={{ cursor: isWater ? 'default' : 'pointer' }}>
                {/* Base terrain hex */}
                <polygon
                  points={flatHexCorners(cx, cy, HEX_PX)}
                  fill={isSelected ? '#d4a853' : fillColor}
                  fillOpacity={isSelected ? 0.85 : isWater ? 0.5 : 0.8}
                  stroke={isWater ? '#0a0c12' : '#00000020'}
                  strokeWidth={0.5}
                />
                {/* Inner bevel line for 3D effect */}
                {!isWater && (
                  <polygon
                    points={flatHexCorners(cx, cy, HEX_PX * 0.88)}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={0.5}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Player ownership overlay */}
                {owner && playerColor && (
                  <polygon
                    points={flatHexCorners(cx, cy, HEX_PX * 0.92)}
                    fill={playerColor}
                    fillOpacity={0.45}
                    stroke={playerColor}
                    strokeWidth={1.5}
                    strokeOpacity={0.8}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Nation color tint overlay (only when no player owns it) */}
                {!owner && nationColor && (
                  <polygon
                    points={flatHexCorners(cx, cy, HEX_PX * 0.92)}
                    fill={nationColor}
                    fillOpacity={0.3}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Unit badge */}
                {unitCount > 0 && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={cx + 8} cy={cy - 8} r={6} fill={playerColor || '#d4a853'} stroke="#0a0c12" strokeWidth={1} />
                    <text x={cx + 8} y={cy - 4} textAnchor="middle" fontSize={7} fill="#0a0c12" fontWeight="bold">{unitCount}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ── Province borders (golden dashed) ── */}
          {provBorderEdges.map((e, i) => (
            <line key={`pb${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#d4a853" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4,2"
              style={{ pointerEvents: 'none' }} />
          ))}

          {/* ── Nation borders (dark embossed) ── */}
          {natBorderEdges.map((e, i) => (
            <line key={`nb${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#0a0806" strokeWidth={2.5} strokeOpacity={0.9}
              style={{ pointerEvents: 'none' }} />
          ))}

          {/* ── Selected hex glow ── */}
          {selected && (
            <g style={{ pointerEvents: 'none' }}>
              <polygon
                points={flatHexCorners(toSVG(selected.x, selected.y).cx, toSVG(selected.x, selected.y).cy, HEX_PX * 1.05)}
                fill="none" stroke="#d4a853" strokeWidth={1.5} strokeOpacity={0.4}
                filter="url(#goldGlow)"
              />
              <polygon
                points={flatHexCorners(toSVG(selected.x, selected.y).cx, toSVG(selected.x, selected.y).cy, HEX_PX)}
                fill="none" stroke="#d4a853" strokeWidth={2.5}
              />
            </g>
          )}

          {/* ── Province labels with capital icons ── */}
          {provCentroidList.map((pc, i) => {
            const { cx, cy } = toSVG(pc.x, pc.y);
            const nation = nations.find(n => n.id === pc.nid);
            if (!nation) return null;
            const prov = nation.provinces.find(p => p.id === pc.prov);
            if (!prov) return null;
            const isNatCap = prov.is_national_capital;
            const label = prov.capital.split(' ')[0];

            return (
              <g key={`pl${i}`} style={{ pointerEvents: 'none' }}>
                <text x={cx} y={cy - 3} textAnchor="middle" fontSize={isNatCap ? 10 : 7}
                  fill={isNatCap ? '#d4a853' : '#c8c0b0'}
                  style={{ filter: isNatCap ? 'drop-shadow(0 0 2px #d4a853)' : 'none' }}>
                  {isNatCap ? '★' : '◆'}
                </text>
                <text x={cx} y={cy + 6} textAnchor="middle" fontSize={6}
                  fill="#fff" fontFamily="'Cinzel', serif" fontWeight="bold"
                  stroke="#0a0806" strokeWidth={2} paintOrder="stroke" letterSpacing={0.5}>
                  {label}
                </text>
              </g>
            );
          })}

          {/* ── Faction labels ── */}
          {FACTION_CENTROIDS.map(fc => {
            const { cx, cy } = toSVG(fc.x, fc.y);
            // Split long names onto two lines
            const words = fc.name.split(' ');
            const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
            const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
            return (
              <g key={`fl${fc.fid}`} style={{ pointerEvents: 'none' }}>
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
        </svg>
      </div>

      {/* ══════ SIDE PANEL ══════ */}
      <div style={{
        width: 260,
        background: 'linear-gradient(135deg, #1a1c22, #14161c)',
        borderLeft: '1px solid #2a2520',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#c8c0b0',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2520' }}>
          {['selected', 'nation', 'actions'].map(t => (
            <button key={t} onClick={() => setPanelTab(t)} style={{
              flex: 1, padding: '10px 0', fontSize: 11,
              fontFamily: "'Cinzel', serif",
              background: panelTab === t ? '#1e1a12' : 'transparent',
              color: panelTab === t ? '#d4a853' : '#666',
              border: 'none',
              borderBottom: panelTab === t ? '2px solid #d4a853' : '2px solid transparent',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
            }}>{t}</button>
          ))}
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

                {/* Capital city */}
                {selected.capital_name && (
                  <div style={{ color: '#f0a030', fontSize: 13, marginBottom: 10, fontStyle: 'italic' }}>
                    {selected.capital_name === selectedProvince?.capital && selectedProvince?.is_national_capital ? '★' : '◆'} {selected.capital_name}
                  </div>
                )}

                {/* Nation info */}
                {selectedNation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 0', borderTop: '1px solid #2a2520', borderBottom: '1px solid #2a2520' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: NATION_COLORS[selectedNation.id], border: '1px solid #ffffff20' }} />
                    <span style={{ fontSize: 14, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>{selectedNation.name}</span>
                  </div>
                )}

                {/* Terrain */}
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: '#888' }}>Terrain: </span>
                  <span style={{ textTransform: 'capitalize', color: '#c8c0b0' }}>{selected.terrain}</span>
                  <span style={{ marginLeft: 6, display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: TERRAIN_COLORS[selected.terrain] || '#444', verticalAlign: 'middle' }} />
                </div>

                {/* Province stats */}
                {selectedProvince && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                    <div>Province hexes: <span style={{ color: '#c8c0b0' }}>{selectedProvince.hex_count}</span></div>
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

          {panelTab === 'nation' && currentPlayer && (
            <div>
              <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                {currentPlayer.name}
              </div>
              <div style={{ fontSize: 14, marginBottom: 6, color: '#c8c0b0' }}>
                <span style={{ color: '#d4a853' }}>Gold:</span> {currentPlayer.resources?.gold ?? 0}
              </div>
              <div style={{ fontSize: 14, marginBottom: 6, color: '#c8c0b0' }}>
                <span style={{ color: '#7a6aed' }}>Influence:</span> {currentPlayer.ip ?? 0}
              </div>
              <div style={{ fontSize: 14, marginBottom: 6, color: '#c8c0b0' }}>
                <span style={{ color: '#2e9e9e' }}>Faith:</span> {currentPlayer.sp ?? 0}
              </div>
            </div>
          )}

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
    </div>
  );
}