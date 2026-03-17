import React, { useMemo } from 'react';
import { HEXES, REGIONS, HexUtils, hexToPixel, TERRAIN_PROPS } from './hexGridSystem';

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
  const hexSize = 32;
  const viewPadding = 60;

  // Calculate canvas dimensions
  const canvasWidth = 1000;
  const canvasHeight = 700;

  const getPlayerColor = (ownerId) => {
    if (!ownerId) return 'transparent';
    return gameState?.players.find(p => p.id === ownerId)?.color || '#666';
  };

  const hexes = gameState?.hexes || {};

  const isAttackable = (hexId) => {
    if (phase !== 'attack' || !selectedHex) return false;
    const adj = Object.entries(HEXES).find(([id]) => id === selectedHex)?.[1];
    if (!adj) return false;
    const hexNeighbors = HexUtils.getNeighbors(adj.q, adj.r).map(([q, r]) => 
      Object.entries(HEXES).find(([, h]) => h.q === q && h.r === r)?.[0]
    ).filter(Boolean);
    
    const targetHex = HEXES[hexId];
    const hex = HEXES[selectedHex];
    return targetHex?.owner !== currentPlayer?.id && hexNeighbors.includes(hexId);
  };

  const isMovable = (hexId) => {
    if (phase !== 'move' || !selectedHex || hexId === selectedHex) return false;
    // Simple reachability - just check adjacency for now
    return true;
  };

  const isFortifiable = (hexId) => {
    if (phase !== 'fortify' || !selectedHex) return false;
    const hex = HEXES[hexId];
    const selectedHexData = HEXES[selectedHex];
    if (!hex || !selectedHexData) return false;
    
    const distance = HexUtils.distance(hex.q, hex.r, selectedHexData.q, selectedHexData.r);
    return hex.owner === currentPlayer?.id && distance === 1 && hexId !== selectedHex;
  };

  const isDeployable = (hexId) => {
    if (phase !== 'deploy') return false;
    const hex = HEXES[hexId];
    return hex.owner === currentPlayer?.id && currentPlayer?.troopsToDeploy > 0;
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden border-2"
      style={{
        width: '100%',
        aspectRatio: '1000/700',
        background: 'radial-gradient(ellipse at 50% 40%, hsl(35,25%,15%) 0%, hsl(35,20%,7%) 100%)',
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

        {/* Hex tiles */}
        {Object.entries(hexes).map(([hexId, hex]) => {
          const isSelected = selectedHex === hexId;
          const canAttack = isAttackable(hexId);
          const canMove = isMovable(hexId);
          const canFortify = isFortifiable(hexId);
          const canDeploy = isDeployable(hexId);
          const playerColor = getPlayerColor(hex.owner);
          
          const { x, y } = hexToPixel(hex.q, hex.r, hexSize);
          const px = x + canvasWidth / 2;
          const py = y + canvasHeight / 2;

          // Skip rendering if off-screen
          if (px < -100 || px > canvasWidth + 100 || py < -100 || py > canvasHeight + 100) return null;

          let ringColor = 'transparent';
          let glow = '';
          if (isSelected) { ringColor = 'rgba(255,200,50,0.9)'; glow = '0 0 20px rgba(255,200,50,0.5)'; }
          else if (canAttack) { ringColor = 'rgba(255,60,60,0.8)'; glow = '0 0 15px rgba(255,60,60,0.4)'; }
          else if (canFortify) { ringColor = 'rgba(60,180,255,0.8)'; glow = '0 0 12px rgba(60,180,255,0.4)'; }
          else if (canMove) { ringColor = 'rgba(100,255,100,0.7)'; glow = '0 0 10px rgba(100,255,100,0.3)'; }
          else if (canDeploy) { ringColor = playerColor; }

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
                fill={TERRAIN_COLORS[hex.terrain] || '#555'}
                stroke={playerColor}
                strokeWidth="2"
                opacity="0.85"
                style={{ filter: glow ? `drop-shadow(${glow})` : 'none' }}
              />
              
              {/* Selection ring */}
              {ringColor !== 'transparent' && (
                <circle cx={px} cy={py} r={hexSize + 3} fill="none" stroke={ringColor} strokeWidth="2" opacity="0.7" />
              )}

              {/* Hex label and icon */}
              <text x={px} y={py - 8} textAnchor="middle" fontSize="14" fill="white" fontFamily="'Cinzel',serif" fontWeight="bold">
                {TERRAIN_ICONS[hex.terrain]}
              </text>
              <text x={px} y={py + 8} textAnchor="middle" fontSize="10" fill="#eee" fontFamily="'Cinzel',serif">
                {hexId.split('_')[0].substring(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 text-xs space-y-1" style={{ background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '6px' }}>
        {[
          ['🌾', 'Plains'],
          ['🌲', 'Forest'],
          ['⛰️', 'Mountain'],
          ['❄️', 'Tundra'],
          ['🏜️', 'Desert'],
          ['🌊', 'Ocean'],
        ].map(([icon, label]) => (
          <div key={label} style={{ color: '#ccc' }}>
            {icon} {label}
          </div>
        ))}
      </div>

      {/* Phase indicator */}
      <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'hsl(43,90%,75%)' }}>
        {phase.toUpperCase()}
      </div>
    </div>
  );
}