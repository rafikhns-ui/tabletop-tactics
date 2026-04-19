import React, { useState } from 'react';
import { BUILDING_DEFS, UNIT_DEFS, FACTION_BUILDINGS, FACTION_UNITS } from './ardoniaData';

// Fortress (Imperial Stronghold) and Port (Crimson Port) are the same placeable structure
// pulled from BUILDING_DEFS so costs stay in one place
const PLACEABLE_BUILDINGS = [
  {
    id: 'fortress',
    defId: 'imperial_stronghold',
    emoji: '🏯',
    name: 'Fortress',
    alias: 'Imperial Stronghold',
    terrain: null,
    dragType: 'fortress',
  },
  {
    id: 'port',
    defId: 'crimson_port',
    emoji: '⚓',
    name: 'Port',
    alias: 'Crimson Port',
    terrain: 'coastal',
    dragType: 'port',
  },
];

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

export default function BuildRecruitPanel({ currentPlayer, gameState, onBuild, onUpgrade, onSetBuildingPlacementMode, buildingPlacementMode, onDragPlaceStart, onDragPlaceEnd, phase }) {
  const [tab, setTab] = useState('build'); // 'build' | 'upgrade' | 'queue'
  const [previewImage, setPreviewImage] = useState(null);
  const { resources } = currentPlayer;
  const ownedBuildings = Object.keys(currentPlayer.buildings || {});
  const ownedTerritories = Object.values(gameState.territories).filter(t => t.owner === currentPlayer.id);
  const buildingQueue = currentPlayer.buildingQueue || [];
  const recruitmentQueue = currentPlayer.recruitmentQueue || [];

  // Faction-specific buildable list (exclude already-owned, starting, and placeable buildings)
  const PLACEABLE_IDS = new Set(['imperial_stronghold', 'crimson_port']);
  const factionBuildableIds = FACTION_BUILDINGS[currentPlayer.factionId] || Object.keys(BUILDING_DEFS).filter(id => !['mine','lumber_mill','farm','treasury'].includes(id));
  const buildable = factionBuildableIds.filter(id => !ownedBuildings.includes(id) && !PLACEABLE_IDS.has(id));

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
           {/* Placeable structures: Fortress (= Imperial Stronghold) & Port (= Crimson Port) */}
           <div className="grid grid-cols-2 gap-1.5 mb-2">
             {PLACEABLE_BUILDINGS.map(item => {
               const def = BUILDING_DEFS[item.defId];
               const cost = def?.cost || {};
               const affordable = canAfford(resources, cost);
               const inventory = currentPlayer[`${item.id}_inventory`] || 0;
               const isPlacing = buildingPlacementMode === item.id;
               return (
                 <div key={item.id} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: `1px solid ${isPlacing ? 'hsl(43,80%,50%)' : 'hsl(35,20%,30%)'}` }}
                   onMouseEnter={() => def?.image && setPreviewImage(def.image)}
                   onMouseLeave={() => setPreviewImage(null)}>
                   <div className="flex items-center justify-between mb-0.5">
                     <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                       {item.emoji} {item.name}
                     </span>
                     <span className="text-xs" style={{ color: 'hsl(43,80%,65%)' }}>×{inventory}</span>
                   </div>
                   <div className="text-xs mb-1" style={{ color: 'hsl(40,20%,50%)', fontStyle: 'italic' }}>
                     = {item.alias}
                   </div>
                   <div
                     onClick={() => affordable && onBuild(item.id)}
                     className="w-full text-center text-xs px-1.5 py-1 rounded font-bold transition-all hover:opacity-90 mb-1"
                     style={{ ...s, background: affordable ? 'hsl(38,70%,30%)' : 'hsl(35,20%,24%)', border: '1px solid hsl(38,80%,50%)', color: affordable ? 'hsl(43,90%,80%)' : 'hsl(40,20%,45%)', cursor: affordable ? 'pointer' : 'not-allowed', opacity: affordable ? 1 : 0.4 }}>
                     Buy {item.emoji}
                   </div>
                   <CostTag cost={cost} resources={resources} />
                   {inventory > 0 && (
                     <div className="mt-1.5 flex gap-1">
                       {/* Click to enter placement mode */}
                       <button
                         onClick={() => onSetBuildingPlacementMode(isPlacing ? null : item.id)}
                         className="flex-1 text-xs px-1.5 py-0.5 rounded font-bold transition-all hover:opacity-90"
                         style={{ ...s, background: isPlacing ? 'hsl(43,60%,24%)' : 'hsl(35,20%,26%)', border: `1px solid ${isPlacing ? 'hsl(43,80%,50%)' : 'hsl(35,20%,35%)'}`, color: isPlacing ? 'hsl(43,90%,75%)' : 'hsl(40,20%,65%)' }}>
                         {isPlacing ? '✓ Placing…' : '🖱️ Place'}
                       </button>
                       {/* Drag to place */}
                       <button
                         draggable
                         onDragStart={(e) => {
                           e.dataTransfer.setData('deployUnitType', item.id);
                           e.dataTransfer.effectAllowed = 'move';
                           const ghost = document.createElement('div');
                           ghost.textContent = item.emoji;
                           ghost.style.cssText = 'position:fixed;top:-100px;left:-100px;font-size:32px;background:rgba(30,20,10,0.9);border:2px solid #d4a853;border-radius:8px;padding:6px 10px;pointer-events:none;z-index:99999;';
                           document.body.appendChild(ghost);
                           e.dataTransfer.setDragImage(ghost, 24, 24);
                           setTimeout(() => document.body.removeChild(ghost), 0);
                           onDragPlaceStart && onDragPlaceStart(item.id);
                         }}
                         onDragEnd={() => onDragPlaceEnd && onDragPlaceEnd()}
                         className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:opacity-90"
                         style={{ ...s, background: 'hsl(35,20%,26%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)', cursor: 'grab' }}
                         title="Drag onto the map to place">
                         🗺️
                       </button>
                     </div>
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
                onClick={() => affordable && onBuild(id)}
                onMouseEnter={() => setPreviewImage(b.image)}
                onMouseLeave={() => setPreviewImage(null)}
                className="rounded p-2 transition-all"
                style={{
                  background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)',
                  cursor: affordable ? 'pointer' : 'not-allowed', opacity: affordable ? 1 : 0.45,
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                    {b.emoji} {b.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ ...s, background: 'hsl(38,70%,30%)', border: '1px solid hsl(38,80%,50%)', color: 'hsl(43,90%,80%)' }}>Build</span>
                </div>
                <div className="text-xs opacity-55 mt-0.5" style={{ color: 'hsl(40,20%,65%)' }}>{b.description}</div>
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
              <div key={id}
                onClick={() => affordable && onUpgrade(id)}
                onMouseEnter={() => setPreviewImage(def.image)}
                onMouseLeave={() => setPreviewImage(null)}
                className="rounded p-2 transition-all"
                style={{
                  background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)',
                  cursor: isMaxed ? 'default' : affordable ? 'pointer' : 'not-allowed',
                  opacity: !isMaxed && !affordable ? 0.45 : 1,
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                    {def.emoji} {def.name} <span style={{ color: 'hsl(43,80%,60%)' }}>Lvl {b.level}</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ ...s, background: isMaxed ? 'hsl(35,30%,20%)' : 'hsl(38,70%,30%)', border: '1px solid hsl(38,80%,50%)', color: isMaxed ? 'hsl(40,20%,50%)' : 'hsl(43,90%,80%)' }}>
                    {isMaxed ? 'MAX' : 'Upgrade'}
                  </span>
                </div>
                <div className="text-xs opacity-55 mt-0.5" style={{ color: 'hsl(40,20%,65%)' }}>
                  {def.description} {isMaxed && '(Max level)'}
                </div>
                {!isMaxed && <CostTag cost={upgradeCost} resources={resources} />}
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