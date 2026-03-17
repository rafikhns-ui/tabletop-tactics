import React, { useState } from 'react';
import { HEROES } from './ardoniaData';

export default function PlayerDetailModal({ player, territories, onClose }) {
  const [showObjectives, setShowObjectives] = useState(false);
  const owned = Object.values(territories).filter(t => t.owner === player.id).length;
  const total = Object.keys(territories).length;
  const pct = Math.round((owned / total) * 100);
  const completedCount = player.completedObjectives?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-y-auto max-h-[90vh] scroll-in"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: `2px solid ${player.color}88`, boxShadow: `0 0 40px ${player.color}33` }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between sticky top-0 z-10"
          style={{ background: 'hsl(35,25%,13%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: player.color }} />
            <div>
              <div className="text-base font-bold" style={{ fontFamily: "'Cinzel',serif", color: player.color }}>
                {player.name} {player.isAI && <span className="text-xs opacity-50">🤖</span>}
              </div>
              <div className="text-xs" style={{ color: 'hsl(40,20%,60%)' }}>
                {player.faction?.emoji} {player.faction?.name}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-lg opacity-50 hover:opacity-100 px-2">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Resources */}
          <div>
            <div className="text-xs font-bold mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>RESOURCES</div>
            <div className="grid grid-cols-3 gap-2">
              {[['🪙', 'Gold', player.resources?.gold ?? 0], ['🪵', 'Wood', player.resources?.wood ?? 0], ['🌾', 'Wheat', player.resources?.wheat ?? 0]].map(([icon, label, val]) => (
                <div key={label} className="flex flex-col items-center py-2 px-1 rounded-lg text-xs"
                  style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
                  <span className="text-xl">{icon}</span>
                  <span className="font-bold text-sm mt-0.5" style={{ color: 'hsl(43,80%,65%)' }}>{val}</span>
                  <span style={{ color: 'hsl(40,20%,55%)' }}>{label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[['✨', 'SP', player.sp ?? 0, 10, '#8e44ad'], ['💬', 'IP', player.ip ?? 0, 10, '#2980b9']].map(([icon, label, val, max, color]) => (
                <div key={label} className="px-3 py-2 rounded-lg text-xs" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
                  <div className="flex justify-between mb-1" style={{ color: 'hsl(40,20%,60%)' }}>
                    <span>{icon} {label}</span>
                    <span style={{ color: 'hsl(43,80%,65%)' }}>{val}/{max}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'hsl(35,20%,30%)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (val / max) * 100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Territory */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'hsl(40,20%,55%)' }}>
              <span>🗺️ {owned}/{total} territories</span>
              <span>🎯 {completedCount}/2 objectives</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(35,20%,25%)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: player.color }} />
            </div>
          </div>

          {/* Leader */}
          {player.leader && (
            <div>
              <div className="text-xs font-bold mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>LEADER</div>
              <div className="rounded-lg p-3 text-xs" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
                <div className="font-semibold mb-1" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>
                  👑 {player.leader.name}
                </div>
                <div style={{ color: 'hsl(40,20%,70%)' }}>{player.leader.passive}</div>
                {player.leader.disadvantage && (
                  <div className="mt-1" style={{ color: 'hsl(0,50%,60%)' }}>⚠️ {player.leader.disadvantage}</div>
                )}
              </div>
            </div>
          )}

          {/* Buildings */}
          <div>
            <div className="text-xs font-bold mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>BUILDINGS</div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(player.buildings || {}).map(b => (
                <div key={b.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg"
                  style={{ background: 'hsl(35,20%,20%)', border: `1px solid ${b.disabled ? 'hsl(0,50%,35%)' : 'hsl(35,20%,30%)'}`, color: b.disabled ? 'hsl(0,50%,60%)' : 'hsl(40,20%,75%)' }}>
                  <span className="text-base">{b.emoji}</span>
                  <span className="truncate flex-1">{b.name}</span>
                  {b.level && <span className="font-bold" style={{ color: 'hsl(43,80%,60%)' }}>L{b.level}</span>}
                  {b.disabled && <span title="Disabled">🔒</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Heroes */}
          {player.heroes?.length > 0 && (
            <div>
              <div className="text-xs font-bold mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>HEROES</div>
              <div className="space-y-1.5">
                {player.heroes.map(hId => {
                  const hero = HEROES[hId];
                  if (!hero) return null;
                  const status = player.heroStatus?.[hId];
                  return (
                    <div key={hId} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg"
                      style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: status?.imprisoned ? 'hsl(0,50%,60%)' : 'hsl(40,20%,75%)' }}>
                      <span>
                        {hero.type === 'Warrior' ? '⚔️' : hero.type === 'Spy' ? '🕵️' : hero.type === 'Mage' ? '🔮' : hero.type === 'Diplomat' ? '🤝' : '⭐'} {hero.name}
                      </span>
                      <div className="flex gap-1">
                        {status?.imprisoned && <span title="Imprisoned">🔒</span>}
                        {status?.exhausted && <span className="opacity-50" title="Exhausted">💤</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objectives */}
          <div>
            <div className="text-xs font-bold mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>OBJECTIVES</div>
            <div className="space-y-1.5">
              {player.objectives?.map(obj => {
                const done = player.completedObjectives?.includes(obj.id);
                const isSelf = !player.isAI;
                return (
                  <div key={obj.id} className="rounded-lg p-2.5 text-xs"
                    style={{ background: done ? 'hsl(120,30%,15%)' : 'hsl(35,20%,20%)', border: `1px solid ${done ? 'hsl(120,40%,30%)' : 'hsl(35,20%,30%)'}` }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span>{done ? '✅' : '🎯'}</span>
                      <span className="font-bold" style={{ fontFamily: "'Cinzel',serif", color: done ? 'hsl(120,50%,65%)' : 'hsl(43,80%,65%)' }}>
                        {obj.category}
                      </span>
                    </div>
                    <p style={{ color: done ? 'hsl(120,40%,70%)' : 'hsl(40,20%,70%)' }}>
                      {isSelf || done ? obj.text : '[Secret — Hidden from view]'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}