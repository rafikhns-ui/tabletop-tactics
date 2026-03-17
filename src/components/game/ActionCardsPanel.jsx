import React, { useState } from 'react';
import { ACTION_CARDS } from './ardoniaData';

function canAffordCard(card, player) {
  const cost = card.cost || {};
  for (const [k, v] of Object.entries(cost)) {
    if (k === 'ip' && (player.ip ?? 0) < v) return false;
    if (k === 'sp' && (player.sp ?? 0) < v) return false;
    if (k !== 'ip' && k !== 'sp' && (player.resources?.[k] ?? 0) < v) return false;
  }
  return true;
}

function CostTag({ k, v, player }) {
  const have = k === 'ip' ? (player.ip ?? 0) : k === 'sp' ? (player.sp ?? 0) : (player.resources?.[k] ?? 0);
  const ok = have >= v;
  const icons = { gold: '🪙', wood: '🪵', wheat: '🌾', ip: '💬', sp: '✨' };
  return (
    <span className="text-xs px-1.5 py-0.5 rounded" style={{
      background: 'hsl(35,20%,22%)',
      color: ok ? 'hsl(43,80%,65%)' : 'hsl(0,65%,55%)',
    }}>
      {icons[k] || k}{v}
    </span>
  );
}

export default function ActionCardsPanel({ currentPlayer, onPlayCard }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Players start with no action cards; show all available to "draw/play"
  // In a real flow cards would be in hand; here we show the full deck to pick from
  const hand = currentPlayer.actionCards?.length > 0
    ? ACTION_CARDS.filter(c => currentPlayer.actionCards.includes(c.id))
    : ACTION_CARDS; // show all as available

  return (
    <div className="p-3">
      <div className="text-xs font-bold opacity-50 tracking-widest mb-2" style={{ fontFamily: "'Cinzel',serif" }}>
        ACTION CARDS
      </div>
      <div className="flex flex-wrap gap-2">
        {hand.map(card => {
          const affordable = canAffordCard(card, currentPlayer);
          const isHovered = hoveredId === card.id;
          return (
            <div
              key={card.id}
              className="relative cursor-pointer transition-all duration-150 select-none"
              style={{ width: '70px' }}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => affordable && onPlayCard(card)}
            >
              {/* Card face */}
              <div className="rounded-lg p-1.5 flex flex-col items-center gap-0.5 text-center"
                style={{
                  background: isHovered && affordable ? 'hsl(38,60%,22%)' : 'hsl(35,20%,18%)',
                  border: `1px solid ${affordable ? (isHovered ? 'hsl(43,80%,55%)' : 'hsl(43,50%,35%)') : 'hsl(35,15%,28%)'}`,
                  opacity: affordable ? 1 : 0.5,
                  transform: isHovered && affordable ? 'translateY(-4px)' : 'none',
                  boxShadow: isHovered && affordable ? '0 6px 16px rgba(0,0,0,0.5)' : 'none',
                }}>
                <div className="text-2xl leading-none">{card.emoji}</div>
                <div className="text-xs leading-tight font-semibold mt-0.5" style={{ color: 'hsl(43,75%,65%)', fontFamily: "'Cinzel',serif", fontSize: '9px' }}>
                  {card.name}
                </div>
                <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                  {Object.entries(card.cost || {}).map(([k, v]) => (
                    <CostTag key={k} k={k} v={v} player={currentPlayer} />
                  ))}
                </div>
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 mb-2 z-50 w-44 rounded-lg p-2 text-xs pointer-events-none"
                  style={{
                    transform: 'translateX(-50%)',
                    background: 'hsl(35,25%,12%)',
                    border: '1px solid hsl(43,60%,40%)',
                    color: 'hsl(40,20%,75%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
                  }}>
                  <div className="font-bold mb-1" style={{ color: 'hsl(43,85%,65%)', fontFamily: "'Cinzel',serif" }}>
                    {card.emoji} {card.name}
                  </div>
                  <div className="mb-1 opacity-70 italic">{card.category}</div>
                  <div>{card.effect}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}