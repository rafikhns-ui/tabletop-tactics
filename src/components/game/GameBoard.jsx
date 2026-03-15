import React from 'react';
import { ADJACENCY, BIOME_COLORS, PLAYER_COLORS } from './gameLogic';

const BIOME_ICONS = {
  mountain: '⛰️',
  tundra: '❄️',
  forest: '🌲',
  desert: '🏜️',
  ocean: '🌊',
};

export default function GameBoard({ gameState, selectedTerritory, phase, onTerritoryClick }) {
  const { territories, adjacency, players } = gameState;
  const currentPlayer = players[gameState.currentPlayerIndex];

  const getPlayerColor = (ownerId) => {
    const player = players.find(p => p.id === ownerId);
    return player?.color || '#888';
  };

  const isAttackable = (id) => {
    if (phase !== 'attack' || !selectedTerritory) return false;
    const t = territories[id];
    return t.owner !== currentPlayer.id && adjacency[selectedTerritory]?.includes(id);
  };

  const isFortifiable = (id) => {
    if (phase !== 'fortify' || !selectedTerritory) return false;
    const t = territories[id];
    return t.owner === currentPlayer.id && adjacency[selectedTerritory]?.includes(id) && id !== selectedTerritory;
  };

  return (
    <div className="relative w-full" style={{ minHeight: '520px' }}>
      {/* Parchment map background */}
      <div
        className="relative rounded-xl overflow-hidden fantasy-border"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, #d4b896 0%, #c4a070 40%, #b08050 100%)',
          minHeight: '520px',
          backgroundImage: `
            radial-gradient(ellipse at 30% 40%, rgba(255,240,200,0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(180,140,80,0.3) 0%, transparent 60%)
          `,
        }}
      >
        {/* Decorative map title */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
          <div className="text-xs font-bold tracking-widest opacity-40"
            style={{ fontFamily: "'Cinzel', serif", color: '#5a3a10' }}>
            ✦ THE REALM ✦
          </div>
        </div>

        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {Object.entries(adjacency).flatMap(([fromId, neighbors]) =>
            neighbors
              .filter(toId => fromId < toId)
              .map(toId => {
                const from = territories[fromId];
                const to = territories[toId];
                return (
                  <line
                    key={`${fromId}-${toId}`}
                    x1={`${(from.x / 700) * 100}%`}
                    y1={`${(from.y / 520) * 100}%`}
                    x2={`${(to.x / 700) * 100}%`}
                    y2={`${(to.y / 520) * 100}%`}
                    stroke="rgba(100,70,30,0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                );
              })
          )}
        </svg>

        {/* Territory nodes */}
        {Object.values(territories).map((territory) => {
          const playerColor = getPlayerColor(territory.owner);
          const isSelected = selectedTerritory === territory.id;
          const canAttack = isAttackable(territory.id);
          const canFortify = isFortifiable(territory.id);
          const isOwned = territory.owner === currentPlayer.id;
          const biomeColor = BIOME_COLORS[territory.biome] || '#888';

          return (
            <div
              key={territory.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 territory ${isSelected ? 'selected' : ''} ${canAttack ? 'attackable' : ''}`}
              style={{
                left: `${(territory.x / 700) * 100}%`,
                top: `${(territory.y / 520) * 100}%`,
                zIndex: 2,
              }}
              onClick={() => onTerritoryClick(territory.id)}
            >
              {/* Territory hex */}
              <div
                className="relative flex flex-col items-center justify-center rounded-full"
                style={{
                  width: '64px',
                  height: '64px',
                  background: `radial-gradient(circle at 35% 35%, ${lightenColor(biomeColor, 30)}, ${biomeColor})`,
                  border: `3px solid ${playerColor}`,
                  boxShadow: isSelected
                    ? `0 0 0 3px ${playerColor}, 0 0 16px rgba(255,200,50,0.8)`
                    : canAttack
                    ? `0 0 0 2px ${playerColor}, 0 0 10px rgba(255,80,50,0.6)`
                    : `0 2px 8px rgba(0,0,0,0.4)`,
                }}
              >
                <div className="text-lg leading-none">{BIOME_ICONS[territory.biome]}</div>
                <div
                  className="army-badge text-white text-sm leading-none mt-0.5"
                  style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {territory.troops}
                </div>

                {/* Owner dot */}
                <div
                  className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border border-white"
                  style={{ background: playerColor }}
                />
              </div>

              {/* Territory name */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap text-xs font-semibold"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#3a2000',
                  textShadow: '0 1px 2px rgba(255,220,160,0.9)',
                  fontSize: '9px',
                  letterSpacing: '0.03em',
                }}
              >
                {territory.name}
              </div>
            </div>
          );
        })}

        {/* Map compass */}
        <div className="absolute bottom-4 right-6 text-3xl opacity-30 pointer-events-none select-none">
          🧭
        </div>

        {/* Decorative corners */}
        <div className="absolute top-2 left-2 text-xl opacity-20 pointer-events-none select-none">⚜️</div>
        <div className="absolute top-2 right-2 text-xl opacity-20 pointer-events-none select-none">⚜️</div>
        <div className="absolute bottom-2 left-2 text-xl opacity-20 pointer-events-none select-none">⚜️</div>
      </div>
    </div>
  );
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}