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

export default function BuildRecruitPanel({ currentPlayer, gameState, onBuild, onUpgrade, onBuildFortress, phase }) {
  const [tab, setTab] = useState('build'); // 'build' | 'upgrade'
  const [previewImage, setPreviewImage] = useState(null);
  const { resources } = currentPlayer;
  const ownedBuildings = Object.keys(currentPlayer.buildings || {});
  const ownedTerritories = Object.values(gameState.territories).filter(t => t.owner === currentPlayer.id);

  // Faction-specific buildable list (exclude already-owned and starting buildings)
  const factionBuildableIds = FACTION_BUILDINGS[currentPlayer.factionId] || Object.keys(BUILDING_DEFS).filter(id => !['mine','lumber_mill','farm','treasury'].includes(id));
  const buildable = factionBuildableIds.filter(id => !ownedBuildings.includes(id));

  // Faction-specific unit unlock
  const factionUnits = FACTION_UNITS[currentPlayer.factionId] || [];
  const UNIT_UNLOCK_LOCAL = {
    barracks:     factionUnits.filter(u => ['infantry','elite','spearmen_infantry'].includes(u)),
    stables:      factionUnits.filter(u => ['cavalry','onishiman_cavalry'].includes(u)),
    archerytower: factionUnits.filter(u => ['ranged','imperial_crossbow'].includes(u)),
    siegeworks:   factionUnits.filter(u => ['siege','wildfire_thrower'].includes(u)),
    shipyard:     factionUnits.filter(u => ['naval','infamous_reapership'].includes(u)),
    omitoji_dojo: factionUnits.filter(u => ['onmmy_warlocks','night_blade_clan'].includes(u)),
    fighting_pit: factionUnits.filter(u => ['elite','night_blade_clan'].includes(u)),
  };

  // (buildable and units are already set above from faction-specific data)

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        {['build', 'upgrade'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1 rounded text-xs font-bold transition-all"
            style={{
              ...s,
              background: tab === t ? 'hsl(38,70%,28%)' : 'hsl(35,20%,22%)',
              border: tab === t ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,32%)',
              color: tab === t ? 'hsl(43,90%,80%)' : 'hsl(40,20%,55%)',
            }}>
            {t === 'build' ? '🏗️ Build' : '⬆️ Upgrade'}
          </button>
        ))}
      </div>

      {tab === 'build' && (
        <div className="space-y-1.5">
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



      {previewImage && (
        <div className="fixed pointer-events-none z-50" style={{ top: '50%', right: '2rem', transform: 'translateY(-50%)' }}>
          <img src={previewImage} alt="Building preview" className="w-96 h-auto rounded-sm shadow-2xl border-4" style={{ borderColor: 'hsl(43,90%,55%)', boxShadow: '0 0 40px hsl(43,90%,55%)50' }} />
        </div>
      )}
    </div>
  );
}