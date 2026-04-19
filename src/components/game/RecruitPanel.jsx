import React, { useState } from 'react';
import { UNIT_DEFS, FACTION_UNITS, BUILDING_DEFS } from './ardoniaData';

// UNIT_UNLOCK is now resolved per-faction inside the component

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
  const [previewImage, setPreviewImage] = useState(null);
  const { resources } = currentPlayer;
  const ownedBuildings = Object.keys(currentPlayer.buildings || {});

  // Faction-specific units only
  const factionUnits = FACTION_UNITS[currentPlayer.factionId] || [];
  const buildings = currentPlayer.buildings || {};

  // For each owned building, collect units unlocked up to (and including) the current level
  const unlockedUnits = Object.entries(buildings).flatMap(([bId, bState]) => {
    const def = BUILDING_DEFS[bId];
    if (!def?.unlocks) return [];
    const level = bState?.level ?? 1;
    // Collect all unit IDs unlocked at or below current level
    return Object.entries(def.unlocks)
      .filter(([lvl]) => parseInt(lvl) <= level)
      .map(([, unitId]) => unitId)
      .filter(unitId => factionUnits.includes(unitId) && UNIT_DEFS[unitId]);
  });
  const uniqueUnits = [...new Set(unlockedUnits)];

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="p-2 space-y-1.5 relative">
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
          <div key={id}
            onClick={() => affordable && onRecruit(id)}
            onMouseEnter={() => u.image && setPreviewImage(u.image)}
            onMouseLeave={() => setPreviewImage(null)}
            className="rounded p-2 transition-all"
            style={{
              background: isNext ? 'hsl(43,50%,20%)' : 'hsl(35,20%,21%)',
              border: isNext ? '1px solid hsl(43,80%,55%)' : '1px solid hsl(35,20%,30%)',
              boxShadow: isNext ? '0 0 10px rgba(255,200,50,0.25)' : 'none',
              cursor: affordable ? 'pointer' : 'not-allowed',
              opacity: affordable ? 1 : 0.45,
            }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1" style={{ ...s, color: isNext ? 'hsl(43,90%,80%)' : 'hsl(40,30%,80%)' }}>
                {u.emoji} {u.name}
                {isNext && <span className="text-xs px-1 rounded" style={{ background: 'hsl(43,80%,30%)', color: 'hsl(43,90%,85%)', fontSize: '9px' }}>NEXT</span>}
                {queuedCount > 0 && <span className="text-xs px-1 rounded-full" style={{ background: 'hsl(43,70%,28%)', color: 'hsl(43,90%,75%)' }}>×{queuedCount}</span>}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ ...s, background: 'hsl(130,40%,22%)', border: '1px solid hsl(130,50%,35%)', color: 'hsl(130,50%,75%)' }}>+1</span>
            </div>
            <div className="text-xs mt-0.5 opacity-55" style={{ color: 'hsl(40,20%,65%)' }}>{u.description}</div>
            <div className="text-xs mt-0.5" style={{ color: 'hsl(43,70%,55%)' }}>
              🎲 d{u.dice} · 🚶 {u.movementRange} tile/turn {u.canCapture ? '· can capture' : ''}
            </div>
            <CostTag cost={u.cost} resources={resources} />
          </div>
        );
      })}
      
      {previewImage && (
        <div className="fixed pointer-events-none z-50" style={{ top: '50%', right: '2rem', transform: 'translateY(-50%)' }}>
          <img src={previewImage} alt="Unit preview" className="w-96 h-auto rounded-sm shadow-2xl border-4" style={{ borderColor: 'hsl(43,90%,55%)', boxShadow: '0 0 40px hsl(43,90%,55%)50' }} />
        </div>
      )}
    </div>
  );
}