import React, { useMemo, useState } from 'react';
import mapData from './ardonia_game_map.json';
import { FACTIONS, FACTION_TO_NATION_ID } from './ardoniaData';

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
export default function HexMap({ gameState, selectedHex, selectedProvince, phase, currentPlayer, onHexClick, onProvincClick, movementState, highlightPlayerId, reachableHexes }) {
  const hexGrid = mapData.hex_grid;
  const nations = mapData.nations;
  const [selected, setSelected] = useState(null);
  const [panelTab, setPanelTab] = useState('selected');
  const [hoveredBorder, setHoveredBorder] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  const SVG_W = 1200;
  const SVG_H = 900;
  const HEX_SIZE = 2.5;
  const HEX_PX = HEX_SIZE * (SVG_W / 100);
  const [zoomTransform, setZoomTransform] = useState(null); // { tx, ty, scale }

  const toSVG = (px, py) => ({ cx: (px / 100) * SVG_W, cy: (py / 100) * SVG_H });

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

  const getOwner = (hexId, hexNationId) => {
    const hexOwner = gameState?.hexes?.[hexId]?.owner;
    if (hexOwner) return hexOwner;
    if (hexNationId && nationOwnerMap[hexNationId]) return nationOwnerMap[hexNationId];
    return null;
  };
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hexId) => gameState?.hexes?.[hexId]?.units || [];

  const handleHexClick = (hex) => {
    const hexId = `${hex.col},${hex.row}`;
    const hexWithBuildings = { ...hex, buildings: gameState?.hexes?.[hexId]?.buildings };
    setSelected(hexWithBuildings);
    setPanelTab('selected');
    if (onHexClick) onHexClick(hexId);
    // Zoom into clicked hex
    const { cx, cy } = toSVG(hex.x, hex.y);
    const scale = 4;
    setZoomTransform({
      tx: SVG_W / 2 - cx * scale,
      ty: SVG_H / 2 - cy * scale,
      scale,
    });
  };

  const handleZoomOut = () => setZoomTransform(null);

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
      const { cx, cy } = toSVG(h.x, h.y);
      const nbs = hexNeighborKeys(h.col, h.row);
      
      for (let k = 0; k < 6; k++) {
        const nb = hexLookup[`${nbs[k][0]},${nbs[k][1]}`];
        if (!nb || !nb.nation_id) continue;
        
        const h1Owner = getOwner(`${h.col},${h.row}`, h.nation_id);
        const h2Owner = getOwner(`${nbs[k][0]},${nbs[k][1]}`, nb.nation_id);
        
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
  const selectedProvinceInfo = selectedNation ? selectedNation.provinces.find(p => p.id === selected.province) : null;

  return (
    <div style={{ display: 'flex', height: '62vh', background: '#0a0c12', overflow: 'hidden', border: '1px solid #2a2520' }}>
      {/* ══════ SVG MAP ══════ */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {zoomTransform && (
          <button
            onClick={handleZoomOut}
            style={{
              position: 'absolute', top: 10, left: 10, zIndex: 10,
              background: '#1a1c22', border: '1px solid #d4a853',
              color: '#d4a853', fontFamily: "'Cinzel',serif",
              fontSize: 11, padding: '4px 12px', borderRadius: 4,
              cursor: 'pointer',
            }}>
            ← Zoom Out
          </button>
        )}
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
          {zoomTransform && (
            <g>
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="transparent"
                onClick={handleZoomOut} style={{ cursor: 'zoom-out' }} />
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
            const owner = getOwner(hexId, hex.nation_id);
            const playerColor = getPlayerColor(owner);
            const units = getUnits(hexId);
            const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);
            const fillColor = TERRAIN_COLORS[terrain] || '#444';
            const nationColor = hex.nation_id ? (NATION_COLORS[hex.nation_id] || '#666') : null;
            const isMyHighlighted = highlightPlayerId && owner === highlightPlayerId;
            const isReachable = reachableHexes && reachableHexes.has(hexId);
            const isInSelectedProvince = selectedProvince && hex.nation_id === selectedProvince.nation_id && hex.province === selectedProvince.province_id;

            const highlightMode = !!highlightPlayerId;
            const dimmed = highlightMode && !isMyHighlighted;

            return (
              <g key={hexId} onClick={() => {
                if (!isWater) {
                  handleHexClick(hex);
                  if (hex.nation_id && hex.province && onProvincClick) {
                    onProvincClick({ nation_id: hex.nation_id, province_id: hex.province });
                  }
                }
              }} style={{ cursor: isWater ? 'default' : 'pointer' }}>
                {/* Base terrain hex */}
                <polygon
                  points={flatHexCorners(cx, cy, HEX_PX)}
                  fill={isSelected ? '#d4a853' : isInSelectedProvince ? '#9370db' : isReachable ? '#4a9e6a' : isMyHighlighted ? playerColor : fillColor}
                  fillOpacity={isSelected ? 0.85 : isInSelectedProvince ? 0.6 : isReachable ? 0.55 : dimmed ? 0.15 : isWater ? 0.5 : 0.8}
                  stroke={isReachable ? '#6dffaa' : isInSelectedProvince ? '#9370db' : isMyHighlighted ? playerColor : (isWater ? '#0a0c12' : '#00000020')}
                  strokeWidth={isReachable ? 2 : isInSelectedProvince ? 2.5 : isMyHighlighted ? 3 : 0.5}
                />

                {/* Player ownership overlay — skip in highlight mode, already shown via base fill */}
                {owner && playerColor && !highlightMode && (
                  <polygon
                    points={flatHexCorners(cx, cy, HEX_PX * 0.92)}
                    fill={playerColor}
                    fillOpacity={0.45}
                    stroke={playerColor}
                    strokeWidth={1.5}
                    strokeOpacity={0.9}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Nation color tint overlay (only when no player owns it, and not in highlight mode) */}
                {!owner && nationColor && !highlightMode && (
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
                {/* Fortress icon */}
                {gameState?.hexes?.[hexId]?.buildings?.fortress && (
                  <text x={cx - 8} y={cy + 2} textAnchor="middle" fontSize={11} style={{ pointerEvents: 'none', textShadow: '0 0 2px #000' }}>
                    🏰
                  </text>
                )}
                {/* Port icon */}
                {gameState?.hexes?.[hexId]?.buildings?.port && (
                  <text x={cx + 8} y={cy + 10} textAnchor="middle" fontSize={11} style={{ pointerEvents: 'none', textShadow: '0 0 2px #000' }}>
                    ⚓
                  </text>
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

          {/* ── Diplomacy border tooltip ── */}
          {tooltipPos && (
            <g style={{ pointerEvents: 'none' }}>
              <circle cx={tooltipPos.x} cy={tooltipPos.y} r={8} fill="#1a1c22" stroke={tooltipPos.status === 'alliance' ? '#27ae60' : '#e74c3c'} strokeWidth={2} />
              <text x={tooltipPos.x} y={tooltipPos.y + 14} textAnchor="middle" fontSize={11} fill="#fff" fontFamily="'Cinzel',serif" fontWeight="bold">
                {tooltipPos.status === 'alliance' ? '⚔️ Alliance' : '⚠️ Tension'}
              </text>
            </g>
          )}

          {/* ── Faction labels ── */}
          {FACTION_CENTROIDS.map(fc => {
            const { cx, cy } = toSVG(fc.x, fc.y);
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
          </g>
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
                {selected.capital_name && (() => {
                 const isNatCap = selectedProvinceInfo?.is_national_capital;
                  return (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ color: isNatCap ? '#d4a853' : '#c8a060', fontSize: 13, fontStyle: 'italic', marginBottom: 4 }}>
                        {isNatCap ? '★' : '◆'} {selected.capital_name}
                        <span style={{ marginLeft: 6, fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: 0.5,
                          color: isNatCap ? '#d4a853' : '#a08050', opacity: 0.85 }}>
                          {isNatCap ? 'NATIONAL CAPITAL' : 'PROVINCIAL CAPITAL'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#7a6a50', fontStyle: 'italic', padding: '4px 8px', borderLeft: `2px solid ${isNatCap ? '#d4a853' : '#7a6030'}`, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                        ⚔️ Capture this city to control the province
                        {isNatCap && <span style={{ color: '#c08030' }}> — and cripple the nation</span>}
                      </div>
                    </div>
                  );
                })()}
                {/* Non-capital hex hint */}
                {!selected.capital_name && selected.nation_id && selectedProvinceInfo && (
                  <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginBottom: 8 }}>
                    ◆ Provincial capital: <span style={{ color: '#7a6a50' }}>{selectedProvinceInfo.capital}</span><br/>
                    <span style={{ color: '#444' }}>Capture the capital hex to control this province</span>
                  </div>
                )}

                {/* Controller info */}
                {(() => {
                  const hexId = selected ? `${selected.col},${selected.row}` : null;
                  const owner = hexId ? getOwner(hexId, selected?.nation_id) : null;
                  const ownerPlayer = owner ? gameState?.players?.find(p => p.id === owner) : null;
                  if (!ownerPlayer) return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 0', borderTop: '1px solid #2a2520', borderBottom: '1px solid #2a2520' }}>
                      <span style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>Uncontrolled territory</span>
                    </div>
                  );
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
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: NATION_COLORS[selectedNation.id], border: '1px solid #ffffff20' }} />
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

          {panelTab === 'nation' && currentPlayer && (
            <div>
              <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                {currentPlayer.name}
              </div>
              {currentPlayer.faction && (
                <div style={{ fontSize: 13, color: currentPlayer.color, marginBottom: 12, fontFamily: "'Cinzel', serif" }}>
                  {currentPlayer.faction.emoji} {currentPlayer.faction.name}
                </div>
              )}
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