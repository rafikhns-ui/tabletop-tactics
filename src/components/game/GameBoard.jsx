import React from 'react';
import { ADJACENCY, BIOME_COLORS, BIOME_ICONS } from './ardoniaData';


export default function GameBoard({ gameState, selectedTerritory, phase, currentPlayer, onTerritoryClick }) {
  const { territories, players } = gameState;

  const getPlayerColor = (ownerId) => players.find(p => p.id === ownerId)?.color || '#666';

  const isAttackable = (id) => {
    if (phase !== 'attack' || !selectedTerritory) return false;
    const t = territories[id];
    return t.owner !== currentPlayer.id && (ADJACENCY[selectedTerritory] || []).includes(id);
  };

  const isFortifiable = (id) => {
    if (phase !== 'fortify' || !selectedTerritory) return false;
    const t = territories[id];
    return t.owner === currentPlayer.id && (ADJACENCY[selectedTerritory] || []).includes(id) && id !== selectedTerritory;
  };

  const isDeployable = (id) => {
    if (phase !== 'deploy') return false;
    return territories[id].owner === currentPlayer.id && currentPlayer.troopsToDeploy > 0;
  };

  return (
    <div style={{ width: '100%', aspectRatio: '900/560', position: 'relative' }}>
    <div
      className="absolute inset-0 rounded-xl"
      style={{
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b732e420481df67e8a6804/62c454dca_NemRma69YXUdPY6orqTHe3.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '2px solid hsl(43,70%,50%)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
      }}
    >

      {/* Adjacency lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
        {Object.entries(ADJACENCY).flatMap(([fromId, neighbors]) =>
          neighbors.filter(toId => fromId < toId).map(toId => {
            const from = territories[fromId];
            const to = territories[toId];
            return (
              <line key={`${fromId}-${toId}`}
                x1={`${(from.x / 720) * 100}%`} y1={`${(from.y / 510) * 100}%`}
                x2={`${(to.x / 720) * 100}%`}   y2={`${(to.y / 510) * 100}%`}
                stroke="rgba(80,40,10,0.35)" strokeWidth="2" strokeDasharray="5,4"
              />
            );
          })
        )}
      </svg>

      {/* Territories */}
      {Object.values(territories).map((territory) => {
        const pColor = getPlayerColor(territory.owner);
        const isSelected = selectedTerritory === territory.id;
        const canAttack = isAttackable(territory.id);
        const canFortify = isFortifiable(territory.id);
        const canDeploy = isDeployable(territory.id);
        const biomeColor = BIOME_COLORS[territory.biome] || '#888';

        let ringColor = 'transparent';
        let glow = '';
        if (isSelected) { ringColor = 'rgba(255,200,50,0.9)'; glow = '0 0 15px rgba(255,200,50,0.7)'; }
        else if (canAttack) { ringColor = 'rgba(255,60,60,0.8)'; glow = '0 0 10px rgba(255,60,60,0.5)'; }
        else if (canFortify) { ringColor = 'rgba(60,180,255,0.8)'; glow = '0 0 10px rgba(60,180,255,0.5)'; }
        else if (canDeploy) { ringColor = pColor; }

        return (
          <div
            key={territory.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${(territory.x / 720) * 100}%`,
              top: `${(territory.y / 510) * 100}%`,
              zIndex: 2,
            }}
            onClick={() => onTerritoryClick(territory.id)}
          >
            <div
              className="relative flex flex-col items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
              style={{
                width: '52px',
                height: '52px',
                background: `rgba(0,0,0,0.55)`,
                border: `3px solid ${pColor}`,
                outline: `2px solid ${ringColor}`,
                outlineOffset: '2px',
                boxShadow: glow || `0 2px 8px rgba(0,0,0,0.6)`,
                backdropFilter: 'blur(2px)',
              }}
            >
              <div className="text-xl leading-none">{BIOME_ICONS[territory.biome]}</div>
              <div className="text-sm font-black leading-none mt-0.5 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)', fontFamily: "'Cinzel',serif" }}>
                {territory.troops}
              </div>
              {territory.isCapital && (
                <div className="absolute -top-1.5 -right-1.5 text-sm">👑</div>
              )}
              {territory.fortified && (
                <div className="absolute -top-1.5 -left-1.5 text-sm">🏰</div>
              )}
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border border-white"
                style={{ background: pColor }} />
            </div>
            <div className="text-center mt-1 whitespace-nowrap"
              style={{
                fontSize: '9px', fontFamily: "'Cinzel',serif",
                color: '#2a1000', textShadow: '0 1px 2px rgba(255,220,150,0.8)',
                fontWeight: 700, letterSpacing: '0.02em',
              }}>
              {territory.name}
            </div>
          </div>
        );
      })}

      {/* Decorative corners */}
      <div className="absolute bottom-3 right-4 text-2xl opacity-20 pointer-events-none select-none">🧭</div>
      <div className="absolute top-2 left-2 text-lg opacity-15 pointer-events-none select-none">⚜️</div>
      <div className="absolute top-2 right-2 text-lg opacity-15 pointer-events-none select-none">⚜️</div>
      <div className="absolute bottom-2 left-2 text-lg opacity-15 pointer-events-none select-none">⚜️</div>
    </div>
    </div>
  );
}

function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}