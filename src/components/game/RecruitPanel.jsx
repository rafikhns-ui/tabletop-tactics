import React from 'react';
import { UNIT_DEFS } from './ardoniaData';

const UNIT_UNLOCK = {
  barracks:     ['infantry', 'elite'],
  stables:      ['cavalry'],
  archerytower: ['ranged'],
  siegeworks:   ['siege'],
  shipyard:     ['naval'],
};

function canAfford(resources, cost) {
  return Object.entries(cost || {}).every(([k, v]) => (resources[k] ?? 0) >= v);
}

function CostTag({ cost, resources }) {
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {Object.entries(cost || {}).map(([k, v]) => {
        const icons = { gold: '🪙', wood: '🪵', wheat: '🌾', ip: '💬', sp: '✨' };
        const has = (resources[k] ?? 0) >= v;
        return (
          <span key={k} className="text-xs px-1 rounded" style={{ background: 'hsl(35,20%,22%)', color: has ? 'hsl(43,80%,65%)' : 'hsl(0,60%,60%)' }}>
            {icons[k] || k} {v}
          </span>
        );
      })}
    </div>
  );
}

export default function RecruitPanel({ currentPlayer, onRecruit }) {
  const { resources } = currentPlayer;
  const ownedBuildings = Object.keys(currentPlayer.buildings || {});

  const unlockedUnits = Object.entries(UNIT_UNLOCK)
    .filter(([bId]) => ownedBuildings.includes(bId))
    .flatMap(([, units]) => units);
  const uniqueUnits = [...new Set(unlockedUnits)];

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="p-2 space-y-1.5">
      {uniqueUnits.length === 0 && (
        <div className="text-xs text-center opacity-40 py-4" style={{ color: 'hsl(40,20%,60%)' }}>
          Build Barracks, Stables, etc. to unlock units
        </div>
      )}
      {uniqueUnits.map(id => {
        const u = UNIT_DEFS[id];
        const affordable = canAfford(resources, u.cost);
        const queuedCount = (currentPlayer.pendingUnits || []).filter(uid => uid === id).length;
        const isNext = (currentPlayer.pendingUnits || [])[0] === id;
        return (
          <div key={id} className="rounded p-2 transition-all"
            style={{
              background: isNext ? 'hsl(43,50%,20%)' : 'hsl(35,20%,21%)',
              border: isNext ? '1px solid hsl(43,80%,55%)' : '1px solid hsl(35,20%,30%)',
              boxShadow: isNext ? '0 0 10px rgba(255,200,50,0.25)' : 'none',
            }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1" style={{ ...s, color: isNext ? 'hsl(43,90%,80%)' : 'hsl(40,30%,80%)' }}>
                {u.emoji} {u.name}
                {isNext && <span className="text-xs px-1 rounded" style={{ background: 'hsl(43,80%,30%)', color: 'hsl(43,90%,85%)', fontSize: '9px' }}>NEXT</span>}
                {queuedCount > 0 && <span className="text-xs px-1 rounded-full" style={{ background: 'hsl(43,70%,28%)', color: 'hsl(43,90%,75%)' }}>×{queuedCount}</span>}
              </span>
              <button
                onClick={() => onRecruit(id)}
                disabled={!affordable}
                className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  ...s,
                  background: isNext ? 'hsl(43,70%,30%)' : 'hsl(130,40%,22%)',
                  border: isNext ? '1px solid hsl(43,80%,55%)' : '1px solid hsl(130,50%,35%)',
                  color: isNext ? 'hsl(43,90%,85%)' : 'hsl(130,50%,75%)',
                }}>
                +1
              </button>
            </div>
            <div className="text-xs mt-0.5 opacity-55" style={{ color: 'hsl(40,20%,65%)' }}>{u.description}</div>
            <div className="text-xs mt-0.5" style={{ color: 'hsl(43,70%,55%)' }}>
              🎲 d{u.dice} · 🚶 {u.movementRange} tile/turn {u.canCapture ? '· can capture' : ''}
            </div>
            <CostTag cost={u.cost} resources={resources} />
          </div>
        );
      })}
    </div>
  );
}