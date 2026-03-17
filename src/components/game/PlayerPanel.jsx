import React, { useState } from 'react';
import { HEROES } from './ardoniaData';
import PlayerDetailModal from './PlayerDetailModal';

function ObjectivesModal({ player, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden scroll-in"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: `2px solid ${player.color}88`, boxShadow: `0 0 40px ${player.color}33` }}>
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest opacity-50 mb-0.5" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>SECRET OBJECTIVES</div>
            <div className="text-base font-bold" style={{ fontFamily: "'Cinzel',serif", color: player.color }}>
              {player.faction?.emoji} {player.name}
            </div>
          </div>
          <button onClick={onClose} className="text-lg opacity-50 hover:opacity-100 px-2">✕</button>
        </div>
        <div className="p-5 space-y-3">
          {player.objectives?.map(obj => {
            const done = player.completedObjectives?.includes(obj.id);
            return (
              <div key={obj.id} className="rounded-lg p-3"
                style={{ background: done ? 'hsl(120,30%,15%)' : 'hsl(35,20%,20%)', border: `1px solid ${done ? 'hsl(120,40%,30%)' : 'hsl(35,20%,30%)'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{done ? '✅' : '🎯'}</span>
                  <span className="text-xs font-bold" style={{ fontFamily: "'Cinzel',serif", color: done ? 'hsl(120,50%,65%)' : 'hsl(43,80%,65%)' }}>
                    {obj.category}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: done ? 'hsl(120,40%,70%)' : 'hsl(40,20%,72%)' }}>{obj.text}</p>
              </div>
            );
          })}
          {(!player.objectives || player.objectives.length === 0) && (
            <p className="text-xs text-center opacity-40" style={{ color: 'hsl(40,20%,60%)' }}>No objectives drawn yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlayerPanel({ player, isActive, territories, isSelf }) {
  const [expanded, setExpanded] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const owned = Object.values(territories).filter(t => t.owner === player.id).length;
  const total = Object.keys(territories).length;
  const pct = Math.round((owned / total) * 100);
  const completedCount = player.completedObjectives?.length || 0;

  return (
    <div className="border-b border-border"
      style={{
        background: isActive ? 'hsl(35,20%,16%)' : 'hsl(35,20%,13%)',
        borderLeft: isActive ? `3px solid ${player.color}` : '3px solid transparent',
      }}>
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setExpanded(e => !e)}>
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
        <div className="flex items-center gap-1.5">
          {isSelf && (
            <button onClick={e => { e.stopPropagation(); setShowObjectives(true); }}
              className="text-xs px-1.5 py-0.5 rounded hover:opacity-90 transition-all"
              title="View your secret objectives"
              style={{ background: 'hsl(35,20%,24%)', border: '1px solid hsl(35,20%,34%)', color: 'hsl(43,80%,60%)' }}>
              📜
            </button>
          )}
          <span className="text-xs opacity-40">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {showObjectives && <ObjectivesModal player={player} onClose={() => setShowObjectives(false)} />}

      <div className="px-3 pb-2 grid grid-cols-3 gap-1">
        <StatBadge label="🪙" value={player.resources?.gold ?? 0} />
        <StatBadge label="🪵" value={player.resources?.wood ?? 0} />
        <StatBadge label="🌾" value={player.resources?.wheat ?? 0} />
      </div>

      <div className="px-3 pb-2">
        <div className="flex justify-between text-xs mb-0.5" style={{ color: 'hsl(40,20%,55%)' }}>
          <span>{owned}/{total} territories</span>
          <span>🎯 {completedCount}/2</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(35,20%,25%)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: player.color }} />
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          <div className="grid grid-cols-2 gap-1">
            <StatRow icon="✨" label="SP" value={player.sp ?? 0} max={10} color="#8e44ad" />
            <StatRow icon="💬" label="IP" value={player.ip ?? 0} max={10} color="#2980b9" />
          </div>

          {player.leader && (
            <div className="rounded p-2 text-xs" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
              <div className="font-semibold mb-0.5" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>
                👑 {player.leader.name}
              </div>
              <div className="opacity-70">{player.leader.passive}</div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold mb-1 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>BUILDINGS</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.values(player.buildings || {}).map(b => (
                <div key={b.id} className="flex items-center gap-1 text-xs px-1.5 py-1 rounded"
                  style={{ background: 'hsl(35,20%,20%)', border: `1px solid ${b.disabled ? 'hsl(0,50%,35%)' : 'hsl(35,20%,30%)'}`, color: b.disabled ? 'hsl(0,50%,60%)' : 'hsl(40,20%,70%)' }}>
                  <span>{b.emoji}</span>
                  <span className="truncate">{b.name}</span>
                  {b.level && <span className="ml-auto font-bold flex-shrink-0" style={{ color: 'hsl(43,80%,60%)' }}>L{b.level}</span>}
                </div>
              ))}
            </div>
          </div>

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
                    {status?.imprisoned && <span>🔒</span>}
                    {status?.exhausted && <span className="opacity-50">💤</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>OBJECTIVES</div>
              {isSelf && <button onClick={() => setShowObjectives(true)} className="text-xs opacity-60 hover:opacity-100" style={{ color: 'hsl(43,80%,60%)' }}>📜 View</button>}
            </div>
            {player.objectives?.map(obj => {
              const done = player.completedObjectives?.includes(obj.id);
              return (
                <div key={obj.id} className="flex items-center gap-1.5 text-xs px-1.5 py-1 rounded mb-1"
                  style={{ background: done ? 'hsl(120,30%,18%)' : 'hsl(35,20%,20%)', border: `1px solid ${done ? 'hsl(120,40%,30%)' : 'hsl(35,20%,30%)'}`, color: done ? 'hsl(120,50%,65%)' : 'hsl(40,20%,65%)' }}>
                  <span>{done ? '✅' : '🎯'}</span>
                  <span className="truncate">{isSelf || done ? (done ? obj.text : `[${obj.category}] — Secret`) : '[???] — Hidden'}</span>
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

function StatRow({ icon, label, value, max, color }) {
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-0.5" style={{ color: 'hsl(40,20%,60%)' }}>
        <span>{icon} {label}</span>
        <span style={{ color: 'hsl(43,80%,65%)' }}>{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'hsl(35,20%,25%)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}