import React, { useState } from 'react';
import { BUILDING_DEFS, UNIT_DEFS, FACTION_BUILDINGS, FACTION_UNITS } from './ardoniaData';

// BUILDABLE is now per-faction (resolved at render time)

const UNIT_UNLOCK = {
  barracks: ['infantry', 'elite'],
  stables: ['cavalry'],
  archery_range: ['ranged'],
  siege_workshop: ['siege'],
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

export default function BuildRecruitPanel({ currentPlayer, gameState, onBuild, onUpgrade, onBuildFortress, onSetBuildingPlacementMode, buildingPlacementMode, phase }) {
  const [tab, setTab] = useState('build'); // 'build' | 'upgrade' | 'queue'
  const [previewImage, setPreviewImage] = useState(null);
  const { resources } = currentPlayer;
  const ownedBuildings = Object.keys(currentPlayer.buildings || {});
  const ownedTerritories = Object.values(gameState.territories).filter(t => t.owner === currentPlayer.id);
  const buildingQueue = currentPlayer.buildingQueue || [];
  const recruitmentQueue = currentPlayer.recruitmentQueue || [];

  // Faction-specific buildable list (exclude already-owned and starting buildings)
  const factionBuildableIds = FACTION_BUILDINGS[currentPlayer.factionId] || Object.keys(BUILDING_DEFS).filter(id => !['mine','lumber_mill','farm','treasury'].includes(id));
  const buildable = factionBuildableIds.filter(id => !ownedBuildings.includes(id));

  // Faction-specific unit unlock — show all units a building CAN unlock (for build preview)
  const factionUnits = FACTION_UNITS[currentPlayer.factionId] || [];
  // For each building, show all units it can ever unlock (full tech tree preview)
  const UNIT_UNLOCK_LOCAL = Object.fromEntries(
    Object.keys(BUILDING_DEFS).map(bId => {
      const def = BUILDING_DEFS[bId];
      const allUnits = Object.values(def?.unlocks || {})
        .filter(uid => factionUnits.includes(uid) && UNIT_DEFS[uid]);
      return [bId, allUnits];
    })
  );

  // (buildable and units are already set above from faction-specific data)

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        {['build', 'upgrade', 'queue'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1 rounded text-xs font-bold transition-all"
            style={{
              ...s,
              background: tab === t ? 'hsl(38,70%,28%)' : 'hsl(35,20%,22%)',
              border: tab === t ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,32%)',
              color: tab === t ? 'hsl(43,90%,80%)' : 'hsl(40,20%,55%)',
            }}>
            {t === 'build' ? '🏗️ Build' : t === 'upgrade' ? '⬆️ Upgrade' : `📋 Queue (${buildingQueue.length + recruitmentQueue.length})`}
          </button>
        ))}
      </div>

      {tab === 'build' && (
        <div className="space-y-1.5">
           {/* Build Fortress & Port */}
           <div className="grid grid-cols-2 gap-1.5 mb-2">
             {[
               { id: 'fortress', emoji: '🏰', name: 'Fortress', cost: { gold: 5, wood: 3 } },
               { id: 'port', emoji: '🚢', name: 'Port', cost: { gold: 4, wood: 4 } }
             ].map(item => {
               const affordable = canAfford(resources, item.cost);
               const inventory = currentPlayer[`${item.id}_inventory`] || 0;
               return (
                 <div key={item.id} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                       {item.emoji} {item.name}
                     </span>
                     <span className="text-xs" style={{ color: 'hsl(43,80%,65%)' }}>×{inventory}</span>
                   </div>
                   <button
                     onClick={() => onBuild(item.id)}
                     disabled={!affordable}
                     className="w-full text-xs px-1.5 py-1 rounded font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                     style={{ ...s, background: 'hsl(38,70%,30%)', border: '1px solid hsl(38,80%,50%)', color: 'hsl(43,90%,80%)' }}>
                     Build
                   </button>
                   <div className="flex gap-1 mt-1 flex-wrap">
                     {Object.entries(item.cost).map(([k, v]) => {
                       const icons = { gold: '🪙', wood: '🪵', wheat: '🌾' };
                       const has = (resources[k] ?? 0) >= v;
                       return (
                         <span key={k} className="text-xs px-1 rounded" style={{ background: 'hsl(35,20%,25%)', color: has ? 'hsl(43,80%,65%)' : 'hsl(0,60%,60%)' }}>
                           {icons[k]} {v}
                         </span>
                       );
                     })}
                   </div>
                   {inventory > 0 && (
                     <button
                       onClick={() => onSetBuildingPlacementMode(buildingPlacementMode === item.id ? null : item.id)}
                       className="w-full text-xs px-1.5 py-0.5 rounded mt-1 font-bold transition-all hover:opacity-90"
                       style={{ ...s, background: buildingPlacementMode === item.id ? 'hsl(43,60%,24%)' : 'hsl(35,20%,26%)', border: `1px solid ${buildingPlacementMode === item.id ? 'hsl(43,80%,50%)' : 'hsl(35,20%,35%)'}`, color: buildingPlacementMode === item.id ? 'hsl(43,90%,75%)' : 'hsl(40,20%,65%)' }}>
                       {buildingPlacementMode === item.id ? '✓ Place' : 'Place'}
                     </button>
                   )}
                 </div>
               );
             })}
           </div>

           {buildable.length === 0 && (
            <div className="text-xs text-center opacity-40 py-2" style={{ color: 'hsl(40,20%,60%)' }}>
              All buildings constructed
            </div>
          )}
          {buildable.map(id => {
            const b = BUILDING_DEFS[id];
            const affordable = canAfford(resources, b.cost);
            return (
              <div
                key={id}
                onMouseEnter={() => setPreviewImage(b.image)}
                onMouseLeave={() => setPreviewImage(null)}
                className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                    {b.emoji} {b.name}
                  </span>
                  <button
                    onClick={() => onBuild(id)}
                    disabled={!affordable}
                    className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ ...s, background: 'hsl(38,70%,30%)', border: '1px solid hsl(38,80%,50%)', color: 'hsl(43,90%,80%)' }}>
                    Build
                  </button>
                </div>
                <div className="text-xs opacity-55 mt-0.5" style={{ color: 'hsl(40,20%,65%)' }}>{b.description}</div>
                {/* Show what units it unlocks */}
                {UNIT_UNLOCK_LOCAL[id]?.length > 0 && (
                  <div className="text-xs mt-0.5" style={{ color: 'hsl(200,60%,65%)' }}>
                    Unlocks: {UNIT_UNLOCK_LOCAL[id].map(u => `${UNIT_DEFS[u]?.emoji} ${UNIT_DEFS[u]?.name}`).join(', ')}
                  </div>
                )}
                <CostTag cost={b.cost} resources={resources} />
              </div>
            );
          })}
        </div>
      )}

      {tab === 'upgrade' && (
        <div className="space-y-1.5">
          {Object.entries(currentPlayer.buildings || {}).map(([id, b]) => {
            const def = BUILDING_DEFS[id];
            if (!def || !def.maxLevel) return null;
            const isMaxed = b.level >= def.maxLevel;
            const upgradeCost = def.upgradeBase ? Object.entries(def.upgradeBase).reduce((acc, [k, v]) => ({ ...acc, [k]: v * b.level }), {}) : {};
            const affordable = !isMaxed && canAfford(resources, upgradeCost);
            return (
              <div key={id}>
                <div
                  onMouseEnter={() => setPreviewImage(def.image)}
                  onMouseLeave={() => setPreviewImage(null)}
                  className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                      {def.emoji} {def.name} <span style={{ color: 'hsl(43,80%,60%)' }}>Lvl {b.level}</span>
                    </span>
                    <button
                      onClick={() => onUpgrade(id)}
                      disabled={!affordable}
                      className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ ...s, background: isMaxed ? 'hsl(35,30%,20%)' : 'hsl(38,70%,30%)', border: '1px solid hsl(38,80%,50%)', color: isMaxed ? 'hsl(40,20%,50%)' : 'hsl(43,90%,80%)' }}>
                      {isMaxed ? 'MAX' : 'Upgrade'}
                    </button>
                  </div>
                  <div className="text-xs opacity-55 mt-0.5" style={{ color: 'hsl(40,20%,65%)' }}>
                    {def.description} {isMaxed && '(Max level)'}
                  </div>
                  {!isMaxed && <CostTag cost={upgradeCost} resources={resources} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'queue' && (
        <div className="space-y-1.5">
          {buildingQueue.length === 0 && recruitmentQueue.length === 0 ? (
            <div className="text-xs text-center opacity-40 py-2" style={{ color: 'hsl(40,20%,60%)' }}>
              No items in queue
            </div>
          ) : (
            <>
              {buildingQueue.map((item, i) => {
                const def = BUILDING_DEFS[item.buildingId];
                return (
                  <div key={`build-${i}`} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                        🏗️ {def?.name || item.buildingId}
                      </span>
                      <span className="text-xs" style={{ color: 'hsl(43,80%,65%)' }}>
                        {item.turnsRemaining} turn{item.turnsRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                    <div style={{ background: 'hsl(35,20%,18%)', borderRadius: 3, height: 12, overflow: 'hidden', border: '1px solid hsl(35,20%,30%)' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        width: `${((1 - item.turnsRemaining / 1) * 100) || 10}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
              {recruitmentQueue.map((item, i) => {
                const def = UNIT_DEFS[item.unitId];
                return (
                  <div key={`unit-${i}`} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                        ⚔️ {def?.name || item.unitId}
                      </span>
                      <span className="text-xs" style={{ color: 'hsl(43,80%,65%)' }}>
                        {item.turnsRemaining} turn{item.turnsRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                    <div style={{ background: 'hsl(35,20%,18%)', borderRadius: 3, height: 12, overflow: 'hidden', border: '1px solid hsl(35,20%,30%)' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                        width: `${((1 - item.turnsRemaining / 1) * 100) || 10}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}



      {previewImage && (
        <div className="fixed pointer-events-none z-50" style={{ top: '50%', right: '2rem', transform: 'translateY(-50%)' }}>
          <img src={previewImage} alt="Building preview" className="w-96 h-auto rounded-sm shadow-2xl border-4" style={{ borderColor: 'hsl(43,90%,55%)', boxShadow: '0 0 40px hsl(43,90%,55%)50' }} />
        </div>
      )}
    </div>
  );
}