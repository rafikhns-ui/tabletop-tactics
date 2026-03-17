import React, { useState } from 'react';
import { BUILDING_DEFS, UNIT_DEFS, HEROES } from './ardoniaData';

const BUILDABLE = ['barracks', 'stables', 'archerytower', 'temple', 'market', 'shipyard', 'siegeworks'];

// Units unlocked by building
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

export default function BuildRecruitPanel({ currentPlayer, gameState, onBuild, onRecruit, onUpgrade, onBuildFortress }) {
  const [tab, setTab] = useState('build'); // 'build' | 'recruit' | 'upgrade' | 'fortress'
  const { resources } = currentPlayer;
  const ownedBuildings = Object.keys(currentPlayer.buildings || {});
  const ownedTerritories = Object.values(gameState.territories).filter(t => t.owner === currentPlayer.id);

  // Which buildings can still be built
  const buildable = BUILDABLE.filter(id => !ownedBuildings.includes(id));

  // Which units are unlocked by owned buildings
  const unlockedUnits = Object.entries(UNIT_UNLOCK)
    .filter(([bId]) => ownedBuildings.includes(bId))
    .flatMap(([, units]) => units);
  const uniqueUnits = [...new Set(unlockedUnits)];

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        {['build', 'recruit', 'upgrade'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1 rounded text-xs font-bold transition-all"
            style={{
              ...s,
              background: tab === t ? 'hsl(38,70%,28%)' : 'hsl(35,20%,22%)',
              border: tab === t ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,32%)',
              color: tab === t ? 'hsl(43,90%,80%)' : 'hsl(40,20%,55%)',
            }}>
            {t === 'build' ? '🏗️ Build' : t === 'recruit' ? '⚔️ Recruit' : '⬆️ Upgrade'}
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
              <div key={id} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
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
                {UNIT_UNLOCK[id] && (
                  <div className="text-xs mt-0.5" style={{ color: 'hsl(200,60%,65%)' }}>
                    Unlocks: {UNIT_UNLOCK[id].map(u => `${UNIT_DEFS[u]?.emoji} ${UNIT_DEFS[u]?.name}`).join(', ')}
                  </div>
                )}
                <CostTag cost={b.cost} resources={resources} />
              </div>
            );
          })}
        </div>
      )}

      {tab === 'recruit' && (
        <div className="space-y-1.5">
          {uniqueUnits.length === 0 && (
            <div className="text-xs text-center opacity-40 py-2" style={{ color: 'hsl(40,20%,60%)' }}>
              Build Barracks, Stables, etc. to unlock units
            </div>
          )}
          {uniqueUnits.map(id => {
            const u = UNIT_DEFS[id];
            const affordable = canAfford(resources, u.cost);
            return (
              <div key={id} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                    {u.emoji} {u.name}
                  </span>
                  <button
                    onClick={() => onRecruit(id)}
                    disabled={!affordable}
                    className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ ...s, background: 'hsl(130,40%,22%)', border: '1px solid hsl(130,50%,35%)', color: 'hsl(130,50%,75%)' }}>
                    +1
                  </button>
                </div>
                <div className="text-xs mt-0.5 opacity-55" style={{ color: 'hsl(40,20%,65%)' }}>{u.description}</div>
                <div className="text-xs mt-0.5" style={{ color: 'hsl(43,70%,55%)' }}>
                  🎲 d{u.dice} {u.moves ? `· moves ${u.moves}` : ''} {u.canCapture ? '· can capture' : ''}
                </div>
                <CostTag cost={u.cost} resources={resources} />
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
              <div key={id} className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}