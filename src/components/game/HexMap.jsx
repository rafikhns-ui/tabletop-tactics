import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { HEXES, REGIONS, HexUtils, hexToPixel, TERRAIN_PROPS, buildHexAdjacency } from './hexGridSystem';

const TERRAIN_COLORS = {
  plains: '#7a9a3a',
  forest: '#3d6e3d',
  mountain: '#6a5e50',
  tundra: '#92aabb',
  desert: '#b8942e',
  ocean: '#2e5e8a',
  wasteland: '#664d4d',
};

const TERRAIN_ICONS = {
  plains: '🌾',
  forest: '🌲',
  mountain: '⛰️',
  tundra: '❄️',
  desert: '🏜️',
  ocean: '🌊',
  wasteland: '💀',
};

// Water and coastal tiles disabled for repositioning
const isWaterHex = () => false;
const isCoastalHex = () => false;

// Check if unit can enter a water tile
const canUnitEnterWater = (units) => {
  if (!units || units.length === 0) return false;
  return units.some(u => u.type === 'naval' || u.type === 'flying');
};

export default function HexMap({ gameState, selectedHex, phase, currentPlayer, onHexClick }) {
  const hexSize = 36;
  const canvasWidth = 1800;
  const canvasHeight = 1200;
  const offsetX = 900; // Center hex grid horizontally
  const offsetY = 600;  // Center hex grid vertically

  const [focusedHex, setFocusedHex] = useState(null);
  const defaultVB = { x: 0, y: 0, w: canvasWidth, h: canvasHeight };
  const [viewBox, setViewBox] = useState(defaultVB);
  const animRef = useRef(null);
  const currentVB = useRef(defaultVB);

  const animateTo = useCallback((target) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const ease = 0.1;
    const step = () => {
      const cur = currentVB.current;
      const nx = cur.x + (target.x - cur.x) * ease;
      const ny = cur.y + (target.y - cur.y) * ease;
      const nw = cur.w + (target.w - cur.w) * ease;
      const nh = cur.h + (target.h - cur.h) * ease;
      const done =
        Math.abs(nx - target.x) < 0.5 &&
        Math.abs(ny - target.y) < 0.5 &&
        Math.abs(nw - target.w) < 0.5 &&
        Math.abs(nh - target.h) < 0.5;
      const next = done ? target : { x: nx, y: ny, w: nw, h: nh };
      currentVB.current = next;
      setViewBox({ ...next });
      if (!done) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const zoomToHex = useCallback((px, py) => {
    const zoomW = canvasWidth * 0.35;
    const zoomH = canvasHeight * 0.35;
    animateTo({ x: px - zoomW / 2, y: py - zoomH / 2, w: zoomW, h: zoomH });
  }, [canvasWidth, canvasHeight, animateTo]);

  const resetZoom = () => {
    animateTo(defaultVB);
    setFocusedHex(null);
  };

  const getPlayerColor = (ownerId) => {
    if (!ownerId) return 'transparent';
    return gameState?.players.find(p => p.id === ownerId)?.color || '#666';
  };

  const rawHexes = gameState?.hexes || HEXES;

  // Assign stable sequential indices sorted left-to-right, top-to-bottom
  const hexes = useMemo(() => {
    const entries = Object.entries(rawHexes);
    entries.sort(([, a], [, b]) => {
      const pa = hexToPixel(a.q, a.r, 36);
      const pb = hexToPixel(b.q, b.r, 36);
      const rowDiff = Math.round((pa.y - pb.y) / 10);
      if (rowDiff !== 0) return rowDiff;
      return pa.x - pb.x;
    });
    const result = {};
    entries.forEach(([id, hex], i) => {
      result[id] = { ...hex, _stableIndex: i + 1 };
    });
    return result;
  }, [rawHexes]);

  const isAttackable = (hexId) => {
    if (phase !== 'attack' || !selectedHex) return false;
    const adj = hexes[selectedHex];
    if (!adj) return false;
    const hexNeighbors = HexUtils.getNeighbors(adj.q, adj.r).map(([q, r]) => 
      Object.entries(hexes).find(([, h]) => h.q === q && h.r === r)?.[0]
    ).filter(Boolean);
    
    const targetHex = hexes[hexId];
    const hex = hexes[selectedHex];
    return targetHex?.owner !== currentPlayer?.id && hexNeighbors.includes(hexId);
  };

  const isMovable = (hexId) => {
    if (phase !== 'move' || !selectedHex || hexId === selectedHex) return false;
    
    const selectedHexData = hexes[selectedHex];
    const targetHex = hexes[hexId];
    
    if (!selectedHexData || !targetHex) return false;
    
    // Check if target is owned by current player
    if (targetHex.owner !== currentPlayer?.id) return false;
    
    // Check adjacency
    const neighbors = HexUtils.getNeighbors(selectedHexData.q, selectedHexData.r);
    return neighbors.some(([q, r]) => 
      Object.entries(hexes).find(([id, h]) => h.q === q && h.r === r)?.[0] === hexId
    );
  };

  const isFortifiable = (hexId) => {
    if (phase !== 'fortify' || !selectedHex) return false;
    const hex = hexes[hexId];
    const selectedHexData = hexes[selectedHex];
    if (!hex || !selectedHexData) return false;
    
    const distance = HexUtils.distance(hex.q, hex.r, selectedHexData.q, selectedHexData.r);
    return hex.owner === currentPlayer?.id && distance === 1 && hexId !== selectedHex;
  };

  const isDeployable = (hexId) => {
    if (phase !== 'deploy') return false;
    const hex = hexes[hexId];
    return hex.owner === currentPlayer?.id && (currentPlayer?.pendingUnits?.length || 0) > 0;
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden border-2"
      style={{
        width: '100%',
        aspectRatio: '16/9',
        borderColor: 'hsl(43,70%,50%)',
        boxShadow: '0 0 60px rgba(180,140,40,0.15)',
        background: 'hsl(35,25%,12%)',
      }}
    >
      <svg width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
        {/* Background map image */}
        <image
          href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b732e420481df67e8a6804/62c454dca_NemRma69YXUdPY6orqTHe3.jpg"
          x="0"
          y="0"
          width={canvasWidth}
          height={canvasHeight}
          preserveAspectRatio="none"
        />
        
        {/* Background grid lines */}
        {Object.entries(hexes).map(([hexId, hex]) => {
          const neighbors = HexUtils.getNeighbors(hex.q, hex.r);
          return neighbors.map(([nq, nr], i) => {
            const neighbor = Object.entries(hexes).find(([, h]) => h.q === nq && h.r === nr);
            if (!neighbor || hexId > neighbor[0]) return null;
            
            const [x1, y1] = [hexToPixel(hex.q, hex.r, hexSize).x + offsetX, hexToPixel(hex.q, hex.r, hexSize).y + offsetY];
            const [x2, y2] = [hexToPixel(nq, nr, hexSize).x + offsetX, hexToPixel(nq, nr, hexSize).y + offsetY];
            
            return (
              <line
                key={`line-${hexId}-${neighbor[0]}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(100,80,40,0.2)" strokeWidth="1"
              />
            );
          });
        })}

        {/* Movement arrows */}
        {phase === 'move' && selectedHex && gameState?.hexes[selectedHex] && (
          (() => {
            const selectedHexData = gameState.hexes[selectedHex];
            const selectedPos = hexToPixel(selectedHexData.q, selectedHexData.r, hexSize);
            const selectedPx = selectedPos.x + offsetX;
            const selectedPy = selectedPos.y + offsetY;
            
            const neighbors = HexUtils.getNeighbors(selectedHexData.q, selectedHexData.r);
            return neighbors.map(([nq, nr], i) => {
              const neighbor = Object.values(hexes).find(h => h.q === nq && h.r === nr);
              if (!neighbor || neighbor.owner !== currentPlayer?.id) return null;
              
              const neighborPos = hexToPixel(nq, nr, hexSize);
              const neighborPx = neighborPos.x + offsetX;
              const neighborPy = neighborPos.y + offsetY;
              
              const dx = neighborPx - selectedPx;
              const dy = neighborPy - selectedPy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              
              const arrowLen = 12;
              const endX = selectedPx + (dist / 2) * Math.cos(angle);
              const endY = selectedPy + (dist / 2) * Math.sin(angle);
              
              return (
                <g key={`arrow-${neighbor.id}`}>
                  <line x1={selectedPx} y1={selectedPy} x2={endX} y2={endY} stroke="rgba(100,255,100,0.7)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                </g>
              );
            });
          })()
        )}

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="rgba(100,255,100,0.7)" />
          </marker>
        </defs>

        {/* Hex tiles */}
        {Object.entries(hexes).map(([hexId, hex]) => {
          const hexIndex = hex._stableIndex;
          const isWater = isWaterHex(hexIndex);
          const isCoastal = !isWater && isCoastalHex(hexIndex);
          const isSelected = selectedHex === hexId;
          const isOwned = hex.owner === currentPlayer?.id;
          const canAttack = isAttackable(hexId);
          // For water tiles, only allow move/deploy if player has naval/flying units
          const pendingUnits = currentPlayer?.pendingUnits || [];
          const hasNavalPending = pendingUnits.some(u => u === 'naval' || u === 'flying');
          const canMove = isMovable(hexId) && (!isWater || canUnitEnterWater(hex.units));
          const canFortify = isFortifiable(hexId) && (!isWater || canUnitEnterWater(hex.units));
          const canDeploy = isDeployable(hexId) && (!isWater || hasNavalPending);
          const playerColor = getPlayerColor(hex.owner);
          const tileColor = 'transparent';
          
          const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
          const px = x + offsetX;
          const py = y + offsetY;

          // Skip rendering if off-screen
          if (px + hexSize < 0 || px - hexSize > canvasWidth || py + hexSize < 0 || py - hexSize > canvasHeight) return null;

          let ringColor = 'transparent';
          let glow = '';
          let outlineWidth = '0';
          if (isSelected) { ringColor = 'rgba(255,200,50,0.9)'; glow = '0 0 20px rgba(255,200,50,0.5)'; outlineWidth = '3'; }
          else if (canAttack) { ringColor = 'rgba(255,60,60,0.8)'; glow = '0 0 15px rgba(255,60,60,0.4)'; }
          else if (canFortify) { ringColor = 'rgba(60,180,255,0.8)'; glow = '0 0 12px rgba(60,180,255,0.4)'; }
          else if (canMove) { ringColor = 'rgba(100,255,100,0.7)'; glow = '0 0 10px rgba(100,255,100,0.3)'; }
          else if (canDeploy) { ringColor = 'rgba(255,220,80,0.85)'; glow = '0 0 14px rgba(255,220,80,0.6)'; outlineWidth = '2'; }
          else if (isOwned) { ringColor = playerColor; glow = `0 0 8px ${playerColor}33`; }

          const hexPoints = [0, 1, 2, 3, 4, 5].map(i => {
            const angle = (Math.PI / 3) * i;
            return `${px + hexSize * Math.cos(angle)},${py + hexSize * Math.sin(angle)}`;
          }).join(' ');

          const handleClick = () => {
            onHexClick(hexId);
            if (focusedHex?.hexId === hexId) {
              resetZoom();
            } else {
              setFocusedHex({ hexId, hex, px, py });
              zoomToHex(px, py);
            }
          };

          return (
           <g key={`hex-${hexId}`} onClick={handleClick} style={{ cursor: 'pointer' }}>
             {/* Hex border outline — always visible */}
             <polygon
               points={hexPoints}
               fill="transparent"
               stroke={isWater ? "rgba(50,100,255,0.5)" : "rgba(120,90,40,0.45)"}
               strokeWidth="0.8"
             />
             {/* Hex state highlight */}
             {(isSelected || canAttack || canFortify || canMove || canDeploy || isOwned) && (
               <polygon
                 points={hexPoints}
                 fill={isSelected || canDeploy ? ringColor : 'transparent'}
                 stroke={ringColor}
                 strokeWidth={isSelected ? '2.5' : '1.5'}
                 opacity={isSelected ? '0.85' : canDeploy ? '0.25' : '0.7'}
                 style={{ filter: glow ? `drop-shadow(${glow})` : 'none' }}
               />
             )}



             {/* Hex number label */}
             <text x={px} y={py + 4} textAnchor="middle" fontSize="18" fill={isWater ? "rgba(255,255,255,0.9)" : "black"} fontFamily="'Cinzel',serif" fontWeight="bold">
               {hexIndex}
             </text>

             {/* Unit icons + count */}
             {hex.units && hex.units.length > 0 && (() => {
               const UNIT_EMOJIS = { infantry: '⚔️', cavalry: '🐴', ranged: '🏹', siege: '💣', naval: '⚓', elite: '🛡️' };
               const total = hex.units.reduce((sum, u) => sum + u.count, 0);
               // Show emoji of the dominant unit type
               const dominant = hex.units.reduce((a, b) => (b.count > a.count ? b : a));
               const emoji = UNIT_EMOJIS[dominant.type] || '⚔️';
               return (
                 <text x={px} y={py + 7} textAnchor="middle" fontSize="11" fill="#fff" fontFamily="'Cinzel',serif" fontWeight="bold"
                   style={{ textShadow: '1px 1px 3px rgba(0,0,0,1)' }}>
                   {emoji} {total}
                 </text>
               );
             })()}


           </g>
          );
        })}
      </svg>



      {/* Phase indicator */}
      <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'hsl(43,90%,75%)' }}>
        {phase.toUpperCase()}
      </div>

      {/* Zoom out button */}
      {focusedHex && (
        <button
          onClick={resetZoom}
          className="absolute top-2 right-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid hsl(43,70%,50%)', color: 'hsl(43,90%,75%)', fontFamily: "'Cinzel',serif" }}
        >
          ← Zoom Out
        </button>
      )}

      {/* Region info panel */}
      {focusedHex && (() => {
        const { hex, hexId } = focusedHex;
        const hexIndex = hex._stableIndex;
        const isWater = isWaterHex(hexIndex);
        const isCoastal = !isWater && isCoastalHex(hexIndex);
        const regionKey = hex.region;
        const regionData = REGIONS[regionKey];
        const owner = gameState?.players.find(p => p.id === hex.owner);
        const units = hex.units || [];
        const totalUnits = units.reduce((s, u) => s + u.count, 0);
        const TERRAIN_ICONS_MAP = { plains: '🌾', forest: '🌲', mountain: '⛰️', tundra: '❄️', desert: '🏜️', ocean: '🌊', wasteland: '💀' };

        return (
          <div
            className="absolute bottom-3 left-3 rounded-xl p-3 max-w-xs"
            style={{
              background: 'rgba(20,14,8,0.92)',
              border: '1px solid hsl(43,70%,45%)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
              fontFamily: "'Crimson Text', serif",
              color: 'hsl(40,25%,80%)',
              minWidth: '200px',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: '20px' }}>{TERRAIN_ICONS_MAP[hex.terrain] || '🗺️'}</span>
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,85%,65%)' }}>
                  {regionData?.name || regionKey || 'Unknown Region'}
                </div>
                <div className="text-xs opacity-60 capitalize">{isWater ? '🌊 Water' : isCoastal ? '⚓ Coastal' : `${hex.terrain}`} · Hex #{hexIndex}</div>
              </div>
            </div>
            {regionData?.bonus && (
              <div className="text-xs mt-1.5 italic opacity-75 leading-snug border-t pt-1.5" style={{ borderColor: 'hsl(43,40%,25%)' }}>
                {regionData.bonus}
              </div>
            )}
            {owner && (
              <div className="text-xs mt-1.5 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: owner.color }} />
                <span>Controlled by <strong>{owner.name}</strong></span>
              </div>
            )}
            {totalUnits > 0 && (
              <div className="text-xs mt-1 opacity-70">
                ⚔️ {totalUnits} unit{totalUnits !== 1 ? 's' : ''} stationed
              </div>
            )}
            {hex.resource && (
              <div className="text-xs mt-1 opacity-70">💎 Resource: {hex.resource}</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}