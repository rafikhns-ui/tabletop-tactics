import React, { useMemo } from 'react';
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

export default function HexMap({ gameState, selectedHex, phase, currentPlayer, onHexClick }) {
  const hexSize = 16;
  const viewPadding = 60;

  // Calculate canvas dimensions
  const canvasWidth = 1000;
  const canvasHeight = 700;

  const getPlayerColor = (ownerId) => {
    if (!ownerId) return 'transparent';
    return gameState?.players.find(p => p.id === ownerId)?.color || '#666';
  };

  const hexes = gameState?.hexes || HEXES;

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
        aspectRatio: '1000/700',
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b732e420481df67e8a6804/62c454dca_NemRma69YXUdPY6orqTHe3.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderColor: 'hsl(43,70%,50%)',
        boxShadow: '0 0 60px rgba(180,140,40,0.15)',
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} style={{ position: 'absolute', inset: 0 }}>
        {/* Background grid lines */}
        {Object.entries(hexes).map(([hexId, hex]) => {
          const neighbors = HexUtils.getNeighbors(hex.q, hex.r);
          return neighbors.map(([nq, nr], i) => {
            const neighbor = Object.entries(hexes).find(([, h]) => h.q === nq && h.r === nr);
            if (!neighbor || hexId > neighbor[0]) return null;
            
            const [x1, y1] = [hexToPixel(hex.q, hex.r, hexSize).x + canvasWidth / 2, hexToPixel(hex.q, hex.r, hexSize).y + canvasHeight / 2];
            const [x2, y2] = [hexToPixel(nq, nr, hexSize).x + canvasWidth / 2, hexToPixel(nq, nr, hexSize).y + canvasHeight / 2];
            
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
            const selectedPx = selectedPos.x + canvasWidth / 2;
            const selectedPy = selectedPos.y + canvasHeight / 2;
            
            const neighbors = HexUtils.getNeighbors(selectedHexData.q, selectedHexData.r);
            return neighbors.map(([nq, nr], i) => {
              const neighbor = Object.values(hexes).find(h => h.q === nq && h.r === nr);
              if (!neighbor || neighbor.owner !== currentPlayer?.id) return null;
              
              const neighborPos = hexToPixel(nq, nr, hexSize);
              const neighborPx = neighborPos.x + canvasWidth / 2;
              const neighborPy = neighborPos.y + canvasHeight / 2;
              
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
          const isSelected = selectedHex === hexId;
          const isOwned = hex.owner === currentPlayer?.id;
          const canAttack = isAttackable(hexId);
          const canMove = isMovable(hexId);
          const canFortify = isFortifiable(hexId);
          const canDeploy = isDeployable(hexId);
          const playerColor = getPlayerColor(hex.owner);
          const isOcean = hex.terrain === 'ocean';
          const tileColor = isOcean ? '#2e5e8a' : 'transparent';
          
          const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
          const px = x + canvasWidth / 2;
          const py = y + canvasHeight / 2;

          // Skip rendering if off-screen
          if (px < -100 || px > canvasWidth + 100 || py < -100 || py > canvasHeight + 100) return null;

          let ringColor = 'transparent';
          let glow = '';
          let outlineWidth = '0';
          if (isSelected) { ringColor = 'rgba(255,200,50,0.9)'; glow = '0 0 20px rgba(255,200,50,0.5)'; outlineWidth = '3'; }
          else if (canAttack) { ringColor = 'rgba(255,60,60,0.8)'; glow = '0 0 15px rgba(255,60,60,0.4)'; }
          else if (canFortify) { ringColor = 'rgba(60,180,255,0.8)'; glow = '0 0 12px rgba(60,180,255,0.4)'; }
          else if (canMove) { ringColor = 'rgba(100,255,100,0.7)'; glow = '0 0 10px rgba(100,255,100,0.3)'; }
          else if (canDeploy) { ringColor = 'rgba(255,220,80,0.85)'; glow = '0 0 14px rgba(255,220,80,0.6)'; outlineWidth = '2'; }
          else if (isOwned) { ringColor = playerColor; glow = `0 0 8px ${playerColor}33`; }

          return (
           <g key={`hex-${hexId}`} onClick={() => onHexClick(hexId)} style={{ cursor: 'pointer' }}>
             {/* Hex background */}
             <polygon
               points={[0, 1, 2, 3, 4, 5].map(i => {
                 const angle = (Math.PI / 3) * i;
                 return [
                   px + hexSize * Math.cos(angle),
                   py + hexSize * Math.sin(angle),
                 ];
               }).flat().join(',')}
               fill={isSelected ? ringColor : tileColor}
               stroke={isSelected ? ringColor : tileColor}
               strokeWidth={outlineWidth}
               opacity={isOcean ? "0.8" : "0.3"}
               style={{ filter: glow ? `drop-shadow(${glow})` : 'none' }}
             />

             {/* Selection highlight border */}
             {isSelected && (
               <polygon
                 points={[0, 1, 2, 3, 4, 5].map(i => {
                   const angle = (Math.PI / 3) * i;
                   return [
                     px + hexSize * Math.cos(angle),
                     py + hexSize * Math.sin(angle),
                   ];
                 }).flat().join(',')}
                 fill="none"
                 stroke="rgba(255,200,50,0.9)"
                 strokeWidth="2"
                 style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,50,0.6))' }}
               />
             )}

             {/* Unit count */}
             {hex.units && hex.units.length > 0 && (
               <text x={px} y={py + 8} textAnchor="middle" fontSize="12" fill="#fff" fontFamily="'Cinzel',serif" fontWeight="bold"
                 style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                 ⚔️ {hex.units.reduce((sum, u) => sum + u.count, 0)}
               </text>
             )}


           </g>
          );
        })}
      </svg>



      {/* Phase indicator */}
      <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'hsl(43,90%,75%)' }}>
        {phase.toUpperCase()}
      </div>
    </div>
  );
}