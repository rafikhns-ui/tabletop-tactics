import React, { useMemo, useState, useEffect } from 'react';
import mapData from './ardonia_game_map.json';

// ══════════════════════════════════════════════════════════════
//  RULERS OF ARDONIA — Premium Game Map
// ══════════════════════════════════════════════════════════════

const NC = {};
mapData.nations.forEach(n => { NC[n.id] = n.color; });

const T = {
  water:    { base: '#0e2d4a', light: '#164060', dark: '#081a2e', label: 'Ocean' },
  coastal:  { base: '#1a5070', light: '#2a7090', dark: '#103050', label: 'Coast' },
  plains:   { base: '#4a6a25', light: '#5a8030', dark: '#3a5418', label: 'Plains' },
  forest:   { base: '#1a3a12', light: '#2a5020', dark: '#0e2208', label: 'Forest' },
  hills:    { base: '#5a5028', light: '#706530', dark: '#443a18', label: 'Hills' },
  mountain: { base: '#404050', light: '#5a5a6a', dark: '#2a2a35', label: 'Mountain' },
  desert:   { base: '#8a6a28', light: '#a88030', dark: '#6a5018', label: 'Desert' },
  swamp:    { base: '#2a3a1a', light: '#3a4a28', dark: '#1a2810', label: 'Swamp' },
  tundra:   { base: '#6a7a8a', light: '#8a9aaa', dark: '#4a5a6a', label: 'Tundra' },
  scorched: { base: '#3a1508', light: '#5a2010', dark: '#200a04', label: 'Scorched' },
};

const SVG_W = 1200, SVG_H = 900, HEX_SZ = 2.5;
const HP = HEX_SZ * (SVG_W / 100);
const toSVG = (px, py) => ({ cx: (px / 100) * SVG_W, cy: (py / 100) * SVG_H });
function hexPts(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}
function nbs(gc, gr) {
  const e = gc % 2 === 0;
  return [[gc+1,e?gr-1:gr],[gc+1,e?gr:gr+1],[gc-1,e?gr-1:gr],[gc-1,e?gr:gr+1],[gc,gr-1],[gc,gr+1]];
}

const hexLk = {};
mapData.hex_grid.forEach(h => { hexLk[`${h.col},${h.row}`] = h; });

const provCtrds = (() => {
  const m = {};
  mapData.hex_grid.forEach(h => {
    if (!h.nation_id || !h.province) return;
    const k = `${h.nation_id}-${h.province}`;
    if (!m[k]) m[k] = { sx: 0, sy: 0, cnt: 0, nid: h.nation_id, prov: h.province };
    m[k].sx += h.x; m[k].sy += h.y; m[k].cnt++;
  });
  return Object.values(m).map(p => ({ x: p.sx / p.cnt, y: p.sy / p.cnt, nid: p.nid, prov: p.prov }));
})();

function terrainFill(ter) {
  const map = { water:'url(#gWater)', coastal:'url(#gCoastal)', forest:'url(#pForest)',
    mountain:'url(#pMountain)', hills:'url(#pHills)', desert:'url(#pDesert)',
    swamp:'url(#pSwamp)', tundra:'url(#pTundra)', scorched:'url(#pScorched)' };
  return map[ter] || T.plains.base;
}

function MapDefs() {
  return (
    <defs>
      <filter id="fGlow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#d4a853" floodOpacity="0.9" /></filter>
      <filter id="fGlowSoft"><feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#d4a853" floodOpacity="0.5" /></filter>
      <pattern id="pForest" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={T.forest.base} />
        <circle cx="4" cy="3" r="2" fill={T.forest.light} opacity="0.3" />
        <line x1="4" y1="5" x2="4" y2="8" stroke={T.forest.dark} strokeWidth="0.5" opacity="0.4" />
      </pattern>
      <pattern id="pMountain" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill={T.mountain.base} />
        <path d="M0,6 L3,0 L6,6" fill="none" stroke={T.mountain.light} strokeWidth="0.6" opacity="0.35" />
      </pattern>
      <pattern id="pHills" width="8" height="6" patternUnits="userSpaceOnUse">
        <rect width="8" height="6" fill={T.hills.base} />
        <ellipse cx="4" cy="4" rx="3" ry="1.5" fill={T.hills.light} opacity="0.2" />
      </pattern>
      <pattern id="pDesert" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill={T.desert.base} />
        <circle cx="1" cy="1" r="0.4" fill={T.desert.light} opacity="0.3" />
        <circle cx="3.5" cy="3" r="0.3" fill={T.desert.dark} opacity="0.2" />
      </pattern>
      <pattern id="pSwamp" width="8" height="4" patternUnits="userSpaceOnUse">
        <rect width="8" height="4" fill={T.swamp.base} />
        <path d="M0,2 Q2,0.5 4,2 Q6,3.5 8,2" fill="none" stroke={T.swamp.light} strokeWidth="0.5" opacity="0.3" />
      </pattern>
      <pattern id="pTundra" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill={T.tundra.base} />
        <circle cx="1" cy="1" r="0.6" fill="#fff" opacity="0.15" />
        <circle cx="4" cy="4" r="0.4" fill="#fff" opacity="0.1" />
      </pattern>
      <pattern id="pScorched" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={T.scorched.base} />
        <path d="M2,0 L3,4 L1,8 M5,0 L6,3 L8,6" fill="none" stroke={T.scorched.light} strokeWidth="0.4" opacity="0.3" />
        <circle cx="5" cy="5" r="0.5" fill="#ff4400" opacity="0.15" />
      </pattern>
      <linearGradient id="gWater" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={T.water.light}>
          <animate attributeName="stopColor" values={`${T.water.light};${T.water.dark};${T.water.light}`} dur="6s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor={T.water.dark}>
          <animate attributeName="stopColor" values={`${T.water.dark};${T.water.light};${T.water.dark}`} dur="6s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      <linearGradient id="gCoastal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={T.coastal.light}>
          <animate attributeName="stopColor" values={`${T.coastal.light};${T.coastal.base};${T.coastal.light}`} dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor={T.coastal.dark} />
      </linearGradient>
      <radialGradient id="gElev" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.15" />
      </radialGradient>
      <radialGradient id="gVignette" cx="50%" cy="50%" r="55%">
        <stop offset="60%" stopColor="#0a0c12" stopOpacity="0" />
        <stop offset="100%" stopColor="#0a0c12" stopOpacity="0.7" />
      </radialGradient>
    </defs>
  );
}

export default function HexMap({ gameState, selectedHex, phase, currentPlayer, onHexClick, movementState }) {
  const hexGrid = mapData.hex_grid;
  const nations = mapData.nations;
  const [selected, setSelected] = useState(null);
  const [hovProv, setHovProv] = useState(null);
  const [panelTab, setPanelTab] = useState('territory');

  useEffect(() => {
    const id = 'ardonia-fonts';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');";
      document.head.appendChild(s);
    }
  }, []);

  const getOwner = (hid) => gameState?.hexes?.[hid]?.owner || null;
  const getPlayerColor = (id) => gameState?.players?.find(p => p.id === id)?.color || null;
  const getUnits = (hid) => gameState?.hexes?.[hid]?.units || [];

  const handleHexClick = (hex) => {
    setSelected(hex);
    setPanelTab('territory');
    if (onHexClick) onHexClick(`${hex.col},${hex.row}`);
  };

  const { provEdges, natEdges } = useMemo(() => {
    const pE = [], nE = [];
    hexGrid.forEach(h => {
      if (!h.nation_id) return;
      const { cx, cy } = toSVG(h.x, h.y);
      const neighbors = nbs(h.col, h.row);
      for (let k = 0; k < 6; k++) {
        const nb = hexLk[`${neighbors[k][0]},${neighbors[k][1]}`];
        const a1 = (Math.PI / 3) * k, a2 = (Math.PI / 3) * ((k + 1) % 6);
        const edge = { x1: cx + HP * Math.cos(a1), y1: cy + HP * Math.sin(a1), x2: cx + HP * Math.cos(a2), y2: cy + HP * Math.sin(a2) };
        if (!nb || nb.nation_id !== h.nation_id) nE.push(edge);
        else if (nb.province !== h.province) pE.push(edge);
      }
    });
    return { provEdges: pE, natEdges: nE };
  }, [hexGrid]);

  const selProvKey = selected?.nation_id ? `${selected.nation_id}-${selected.province}` : null;
  const selProvHexSet = useMemo(() => {
    if (!selProvKey) return new Set();
    const s = new Set();
    hexGrid.forEach(h => { if (h.nation_id === selected.nation_id && h.province === selected.province) s.add(`${h.col},${h.row}`); });
    return s;
  }, [selProvKey, hexGrid, selected]);

  const hovProvHexSet = useMemo(() => {
    if (!hovProv) return new Set();
    const s = new Set();
    hexGrid.forEach(h => { if (`${h.nation_id}-${h.province}` === hovProv) s.add(`${h.col},${h.row}`); });
    return s;
  }, [hovProv, hexGrid]);

  const selNation = selected?.nation_id ? nations.find(n => n.id === selected.nation_id) : null;
  const selProvData = selNation?.provinces?.find(p => p.id === selected?.province) || null;

  return (
    <div style={{ display: 'flex', height: '65vh', background: '#0a0c12', overflow: 'hidden', border: '1px solid #2a2520', borderRadius: 4 }}>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ background: '#060810', display: 'block' }}>
          <MapDefs />
          {hexGrid.map(hex => {
            const hexId = `${hex.col},${hex.row}`;
            const { cx, cy } = toSVG(hex.x, hex.y);
            const ter = hex.terrain || 'water';
            const isW = !hex.nation_id;
            const isSel = selProvHexSet.has(hexId);
            const isHov = hovProvHexSet.has(hexId);
            const units = getUnits(hexId);
            const unitCount = units.reduce((s, u) => s + (u.count || 0), 0);
            const fill = isW && ter === 'water' ? 'url(#gWater)' : terrainFill(ter);
            const natColor = hex.nation_id ? NC[hex.nation_id] : null;
            const provKey = hex.nation_id ? `${hex.nation_id}-${hex.province}` : null;
            return (
              <g key={hexId} onClick={() => !isW && handleHexClick(hex)} onMouseEnter={() => provKey && setHovProv(provKey)} onMouseLeave={() => setHovProv(null)} style={{ cursor: isW ? 'default' : 'pointer' }}>
                <polygon points={hexPts(cx, cy, HP)} fill={fill} fillOpacity={isW ? 0.7 : 0.9} stroke={isW ? '#0a1020' : '#00000030'} strokeWidth={0.5} />
                {!isW && <polygon points={hexPts(cx, cy, HP)} fill="url(#gElev)" style={{ pointerEvents: 'none' }} />}
                {natColor && <polygon points={hexPts(cx, cy, HP * 0.94)} fill={natColor} fillOpacity={isHov ? 0.4 : isSel ? 0.35 : 0.2} style={{ pointerEvents: 'none' }} />}
                {!isW && <polygon points={hexPts(cx, cy, HP * 0.85)} fill="none" stroke="#ffffff" strokeWidth={0.3} strokeOpacity={0.05} style={{ pointerEvents: 'none' }} />}
                {(isSel || isHov) && <polygon points={hexPts(cx, cy, HP)} fill="#d4a853" fillOpacity={isSel ? 0.15 : 0.08} style={{ pointerEvents: 'none' }} />}
                {unitCount > 0 && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={cx + HP * 0.5} cy={cy - HP * 0.5} r={5} fill={getPlayerColor(getOwner(hexId)) || '#d4a853'} stroke="#0a0c12" strokeWidth={1} />
                    <text x={cx + HP * 0.5} y={cy - HP * 0.5 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={6} fill="#0a0c12" fontWeight="bold">{unitCount}</text>
                  </g>
                )}
              </g>
            );
          })}
          {provEdges.map((e, i) => <line key={`pb${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#d4a853" strokeWidth={1.2} strokeOpacity={0.45} strokeDasharray="3,1.5" style={{ pointerEvents: 'none' }} />)}
          {natEdges.map((e, i) => <line key={`nb${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#0a0806" strokeWidth={2.8} strokeOpacity={0.95} style={{ pointerEvents: 'none' }} />)}
          {selected && (() => { const { cx, cy } = toSVG(selected.x, selected.y); return <polygon points={hexPts(cx, cy, HP * 1.06)} fill="none" stroke="#d4a853" strokeWidth={2} strokeOpacity={0.6} filter="url(#fGlow)" style={{ pointerEvents: 'none' }} />; })()}
          {provCtrds.map((pc, i) => {
            const { cx, cy } = toSVG(pc.x, pc.y);
            const nation = nations.find(n => n.id === pc.nid);
            if (!nation) return null;
            const prov = nation.provinces.find(p => p.id === pc.prov);
            if (!prov) return null;
            const isNC = prov.is_national_capital;
            const cap = prov.capital.split(' ')[0];
            const isTS = selProvKey === `${pc.nid}-${pc.prov}`;
            return (
              <g key={`cap${i}`} style={{ pointerEvents: 'none' }}>
                {isNC && <circle cx={cx} cy={cy - 5} r={4} fill="#d4a853" fillOpacity={0.2} filter="url(#fGlowSoft)" />}
                <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle" fontSize={isNC ? 10 : 6} fill={isNC ? '#d4a853' : '#b8a888'} style={{ filter: isNC ? 'drop-shadow(0 0 2px #d4a853)' : 'none' }}>{isNC ? '★' : '◆'}</text>
                <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontSize={isTS ? 7 : 5.5} fill={isTS ? '#d4a853' : '#c8c0b0'} fontFamily="'Cinzel', serif" fontWeight={isTS ? '900' : '600'} stroke="#0a0806" strokeWidth={isTS ? 2.5 : 1.5} paintOrder="stroke" letterSpacing={0.3}>{cap}</text>
              </g>
            );
          })}
          {nations.map(n => {
            const { cx, cy } = toSVG(n.centroid[0], n.centroid[1]);
            const w = n.name.toUpperCase().split(' '), l1 = w.slice(0, 2).join(' '), l2 = w.length > 2 ? w.slice(2).join(' ') : null;
            return (
              <g key={`nn${n.id}`} style={{ pointerEvents: 'none' }}>
                <text x={cx} y={cy - (l2 ? 4 : 0)} textAnchor="middle" dominantBaseline="middle" fontSize={15} fill="none" stroke={n.color} strokeWidth={6} strokeOpacity={0.2} fontFamily="'Cinzel', serif" fontWeight="900" letterSpacing={3}>{l1}</text>
                <text x={cx} y={cy - (l2 ? 4 : 0)} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#fff" stroke="#0a0806" strokeWidth={3.5} paintOrder="stroke" fontFamily="'Cinzel', serif" fontWeight="900" letterSpacing={2.5} opacity={0.95}>{l1}</text>
                {l2 && <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#c8c0b0" stroke="#0a0806" strokeWidth={2} paintOrder="stroke" fontFamily="'Cinzel', serif" fontWeight="700" letterSpacing={2} opacity={0.75}>{l2}</text>}
              </g>
            );
          })}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#gVignette)" style={{ pointerEvents: 'none' }} />
        </svg>
      </div>
      <div style={{ width: 270, background: 'linear-gradient(180deg, #12141a 0%, #0a0c12 100%)', borderLeft: '1px solid #2a2520', display: 'flex', flexDirection: 'column', fontFamily: "'Cormorant Garamond', serif", color: '#c8c0b0' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2520' }}>
          {['territory', 'nation', 'actions'].map(t => (
            <button key={t} onClick={() => setPanelTab(t)} style={{ flex: 1, padding: '10px 0', fontSize: 10, fontFamily: "'Cinzel', serif", fontWeight: panelTab === t ? 700 : 400, background: panelTab === t ? '#1a1810' : 'transparent', color: panelTab === t ? '#d4a853' : '#555', border: 'none', cursor: 'pointer', borderBottom: panelTab === t ? '2px solid #d4a853' : '2px solid transparent', textTransform: 'uppercase', letterSpacing: 1 }}>{t}</button>
          ))}
        </div>
        <div style={{ padding: 14, overflowY: 'auto', flex: 1 }}>
          {panelTab === 'territory' && (selected ? (
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", color: '#d4a853', fontSize: 16, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.3, marginBottom: 4 }}>{selected.province_name || 'Uncharted Waters'}</div>
              {selected.capital_name && <div style={{ fontSize: 13, color: '#b8a070', fontStyle: 'italic', marginBottom: 10 }}>{selProvData?.is_national_capital ? '★' : '◆'} {selected.capital_name}</div>}
              {selNation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', marginBottom: 8, borderTop: '1px solid #1a1810', borderBottom: '1px solid #1a1810' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, background: NC[selNation.id], border: '1px solid #ffffff15', boxShadow: `0 0 8px ${NC[selNation.id]}40` }} />
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700 }}>{selNation.name}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: T[selected.terrain]?.base || '#444', border: '1px solid #ffffff15' }} />
                <span style={{ color: '#888' }}>Terrain:</span>
                <span style={{ color: '#c8c0b0', textTransform: 'capitalize' }}>{T[selected.terrain]?.label || selected.terrain}</span>
              </div>
              {selProvData && (
                <div style={{ fontSize: 12, color: '#777', marginTop: 10, lineHeight: 1.8 }}>
                  <div>Province hexes: <span style={{ color: '#c8c0b0' }}>{selProvData.hex_count}</span></div>
                  {selProvData.terrain_distribution && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {Object.entries(selProvData.terrain_distribution).map(([t, cnt]) => (
                        <span key={t} style={{ fontSize: 10, background: '#1a1810', borderRadius: 3, padding: '2px 6px', color: '#b8a888', border: '1px solid #2a2520' }}>{T[t]?.label || t}: {cnt}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div style={{ fontSize: 10, color: '#333', marginTop: 14, fontStyle: 'italic' }}>Grid [{selected.col}, {selected.row}]</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>⬡</div>
              <div style={{ color: '#444', fontStyle: 'italic', fontSize: 12 }}>Select a territory</div>
            </div>
          ))}
          {panelTab === 'nation' && currentPlayer && (
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", color: '#d4a853', fontSize: 16, fontWeight: 900, marginBottom: 14, letterSpacing: 1 }}>{currentPlayer.name}</div>
              {[{ label: 'Gold', value: currentPlayer.resources?.gold ?? 0, color: '#d4a853', icon: '💰' }, { label: 'Influence', value: currentPlayer.ip ?? 0, color: '#7a6aed', icon: '👑' }, { label: 'Faith', value: currentPlayer.sp ?? 0, color: '#2e9e9e', icon: '⛪' }].map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginBottom: 4, background: '#1a1810', borderRadius: 4, border: '1px solid #2a2520' }}>
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <span style={{ color: '#888', fontSize: 12, flex: 1 }}>{r.label}</span>
                  <span style={{ color: r.color, fontSize: 16, fontFamily: "'Cinzel', serif", fontWeight: 900 }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
          {panelTab === 'actions' && (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>⚔️</div>
              <div style={{ color: '#555', fontStyle: 'italic', fontSize: 12 }}>{phase === 'planning' ? 'Select provinces to reinforce' : phase === 'action' ? 'Move units between provinces' : phase === 'combat' ? 'Resolve battles' : 'Waiting for next phase...'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
