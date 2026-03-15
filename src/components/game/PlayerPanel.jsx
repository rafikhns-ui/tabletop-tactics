import React, { useState } from 'react';
import { HEROES } from './ardoniaData';

export default function PlayerPanel({ player, isActive, territories }) {
  const [expanded, setExpanded] = useState(false);
  const owned = Object.values(territories).filter(t => t.owner === player.id).length;
  const total = Object.keys(territories).length;
  const pct = Math.round((owned / total) * 100);
  const completedCount = player.completedObjectives?.length || 0;

  return (
    <div
      className="border-b border-border"
      style={{
        background: isActive ? 'hsl(35,20%,16%)' : 'hsl(35,20%,13%)',
        borderLeft: isActive ? `3px solid ${player.color}` : '3px solid transparent',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: player.color }} />
          <div className="min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'hsl(40,30%,88%)', fontFamily: "'Cinzel',serif" }}>
              {player.name}
              {player.isAI && <span className="ml-1 text-xs opacity-50">🤖</span>}
              {isActive && <span className="ml-1 text-xs" style={{ color: 'hsl(43,90%,65%)' }}>▶</span>}
            </div>
            <div className="text-xs truncate" style={{ color: player.color, opacity: 0.85 }}>
              {player.faction?.emoji} {player.faction?.name}
            </div>
          </div>
        </div>
        <span className="text-xs opacity-40">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Quick stats */}
      <div className="px-3 pb-2 grid grid-cols-3 gap-1">
        <StatBadge label="🪙" value={player.resources.gold} color="gold" />
        <StatBadge label="🪵" value={player.resources.wood} color="wood" />
        <StatBadge label="🌾" value={player.resources.wheat} color="wheat" />
      </div>

      {/* Territory bar */}
      <div className="px-3 pb-2">
        <div className="flex justify-between text-xs mb-0.5" style={{ color: 'hsl(40,20%,55%)' }}>
          <span>{owned}/{total} territories</span>
          <span>🎯 {completedCount}/2 objectives</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(35,20%,25%)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: player.color }} />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          {/* SP / IP */}
          <div className="grid grid-cols-2 gap-1">
            <StatRow icon="✨" label="SP" value={player.sp} max={10} />
            <StatRow icon="💬" label="IP" value={player.ip} max={10} />
          </div>

          {/* Leader */}
          {player.leader && (
            <div className="rounded p-2 text-xs" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
              <div className="font-semibold mb-0.5" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>
                👑 {player.leader.name}
              </div>
              <div className="opacity-70">{player.leader.passive}</div>
            </div>
          )}

          {/* Buildings */}
          <div>
            <div className="text-xs font-semibold mb-1 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>BUILDINGS</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.values(player.buildings).map(b => (
                <div key={b.id} className="flex items-center gap-1 text-xs px-1.5 py-1 rounded"
                  style={{ background: 'hsl(35,20%,20%)', border: `1px solid ${b.disabled ? 'hsl(0,50%,35%)' : 'hsl(35,20%,30%)'}`, color: b.disabled ? 'hsl(0,50%,60%)' : 'hsl(40,20%,70%)' }}>
                  <span>{b.emoji}</span>
                  <span>{b.name}</span>
                  {b.level && <span className="ml-auto font-bold" style={{ color: 'hsl(43,80%,60%)' }}>L{b.level}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Heroes */}
          {player.heroes?.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>HEROES</div>
              {player.heroes.map(hId => {
                const hero = HEROES[hId];
                if (!hero) return null;
                const status = player.heroStatus?.[hId];
                return (
                  <div key={hId} className="flex items-center justify-between text-xs px-1.5 py-1 rounded mb-1"
                    style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: status?.imprisoned ? 'hsl(0,50%,60%)' : 'hsl(40,20%,75%)' }}>
                    <span>{hero.type === 'Warrior' ? '⚔️' : hero.type === 'Spy' ? '🕵️' : hero.type === 'Mage' ? '🔮' : hero.type === 'Diplomat' ? '🤝' : '⭐'} {hero.name}</span>
                    {status?.imprisoned && <span className="text-xs">🔒</span>}
                    {status?.exhausted && <span className="text-xs opacity-50">💤</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Objectives */}
          <div>
            <div className="text-xs font-semibold mb-1 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>OBJECTIVES</div>
            {player.objectives.map(obj => {
              const done = player.completedObjectives?.includes(obj.id);
              return (
                <div key={obj.id} className="flex items-center gap-1.5 text-xs px-1.5 py-1 rounded mb-1"
                  style={{ background: done ? 'hsl(120,30%,18%)' : 'hsl(35,20%,20%)', border: `1px solid ${done ? 'hsl(120,40%,30%)' : 'hsl(35,20%,30%)'}`, color: done ? 'hsl(120,50%,65%)' : 'hsl(40,20%,65%)' }}>
                  <span>{done ? '✅' : '🎯'}</span>
                  <span>{done ? obj.text : `[${obj.category}] — Secret`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-1 rounded text-xs"
      style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: 'hsl(40,25%,75%)' }}>
      <span>{label}</span>
      <span className="font-bold ml-auto" style={{ color: 'hsl(43,80%,65%)' }}>{value}</span>
    </div>
  );
}

function StatRow({ icon, label, value, max }) {
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-0.5" style={{ color: 'hsl(40,20%,60%)' }}>
        <span>{icon} {label}</span>
        <span style={{ color: 'hsl(43,80%,65%)' }}>{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'hsl(35,20%,25%)' }}>
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: label === 'SP' ? '#8e44ad' : '#2980b9' }} />
      </div>
    </div>
  );
}