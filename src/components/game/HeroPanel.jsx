import React, { useState } from 'react';
import { HEROES, BUILDING_DEFS } from './ardoniaData';

const HERO_TYPE_ICONS = {
  Warrior: '⚔️', Spy: '🕵️', Diplomat: '🤝', Mage: '🔮',
  Strategist: '🗺️', Healer: '💚',
};

function HeroCard({ hero, status, owned, onRecruit, onAssign, territories, currentPlayer, assigned }) {
  const [showAssign, setShowAssign] = useState(false);
  const myTerritories = Object.values(territories).filter(t => t.owner === currentPlayer.id);
  const canAfford = Object.entries(hero.cost || {}).every(([k, v]) => {
    if (k === 'ip') return (currentPlayer.ip ?? 0) >= v;
    if (k === 'sp') return (currentPlayer.sp ?? 0) >= v;
    return (currentPlayer.resources?.[k] ?? 0) >= v;
  });
  const hasRequiredBuilding = !hero.requiredBuilding || currentPlayer.buildings?.[hero.requiredBuilding];

  if (!owned) {
    return (
      <div className="rounded-lg p-2.5" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,30%)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base">{HERO_TYPE_ICONS[hero.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: 'hsl(43,80%,70%)', fontFamily: "'Cinzel',serif" }}>{hero.name}</div>
            <div className="text-xs opacity-50">{hero.type}</div>
          </div>
        </div>
        <div className="text-xs mb-2 leading-relaxed" style={{ color: 'hsl(40,20%,60%)' }}>
          <span className="font-semibold" style={{ color: 'hsl(43,70%,60%)' }}>Passive: </span>
          {hero.passive}
        </div>
        <div className="text-xs mb-2 opacity-60">{hero.ability}</div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Object.entries(hero.cost || {}).map(([k, v]) => (
              <span key={k} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'hsl(35,20%,24%)', color: 'hsl(43,80%,65%)' }}>
                {k === 'gold' ? '🪙' : k === 'ip' ? '💬' : k === 'sp' ? '✨' : '?'}{v}
              </span>
            ))}
          </div>
          <button onClick={() => onRecruit(hero.id)} disabled={!canAfford || !hasRequiredBuilding}
            className="text-xs px-2 py-1 rounded font-bold transition-all"
            style={{
              background: (canAfford && hasRequiredBuilding) ? 'hsl(38,70%,30%)' : 'hsl(35,15%,22%)',
              border: `1px solid ${(canAfford && hasRequiredBuilding) ? 'hsl(38,70%,50%)' : 'hsl(35,15%,30%)'}`,
              color: (canAfford && hasRequiredBuilding) ? 'hsl(43,90%,75%)' : 'hsl(40,15%,40%)',
              cursor: (canAfford && hasRequiredBuilding) ? 'pointer' : 'not-allowed',
              fontFamily: "'Cinzel',serif",
            }}>
            Recruit
          </button>
        </div>
        {!hasRequiredBuilding && (
          <div className="text-xs mt-1.5 px-1.5 py-1 rounded" style={{ background: 'hsl(0,40%,18%)', color: 'hsl(0,60%,70%)' }}>
            Requires {BUILDING_DEFS[hero.requiredBuilding]?.emoji} {BUILDING_DEFS[hero.requiredBuilding]?.name}
          </div>
        )}
      </div>
    );
  }

  const isExhausted = status?.exhausted;
  const isImprisoned = status?.imprisoned;
  const assignedTerritory = assigned ? territories[assigned] : null;

  return (
    <div className="rounded-lg p-2.5" style={{
      background: 'hsl(35,22%,20%)',
      border: `1px solid ${isImprisoned ? 'hsl(0,50%,35%)' : isExhausted ? 'hsl(35,20%,30%)' : 'hsl(43,60%,35%)'}`,
    }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{HERO_TYPE_ICONS[hero.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: isImprisoned ? 'hsl(0,50%,55%)' : 'hsl(43,80%,70%)', fontFamily: "'Cinzel',serif" }}>
            {hero.name}
            {isImprisoned && ' 🔒'}
            {isExhausted && ' 💤'}
          </div>
          <div className="text-xs opacity-50">{hero.type}</div>
        </div>
      </div>
      <div className="text-xs mb-1 leading-relaxed" style={{ color: 'hsl(40,20%,60%)' }}>
        <span className="font-semibold" style={{ color: 'hsl(43,70%,60%)' }}>Passive: </span>
        {hero.passive}
      </div>

      {/* Stats row */}
      <div className="flex gap-1 mb-2">
        {[['⚔️', hero.force], ['🕵️', hero.stealth], ['💬', hero.charisma], ['🔮', hero.arcana]].map(([icon, val], i) => (
          <div key={i} className="flex items-center gap-0.5 text-xs px-1 py-0.5 rounded"
            style={{ background: 'hsl(35,20%,24%)', color: 'hsl(40,20%,60%)' }}>
            {icon}<span style={{ color: 'hsl(43,80%,65%)' }}>{val}</span>
          </div>
        ))}
      </div>


    </div>
  );
}

export default function HeroPanel({ gameState, currentPlayer, onRecruit }) {
  const [tab, setTab] = useState('owned'); // 'owned' | 'available'
  const ownedHeroIds = currentPlayer.heroes || [];
  const availableHeroes = Object.values(HEROES).filter(h => !ownedHeroIds.includes(h.id));

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>HEROES</div>
        <div className="flex rounded overflow-hidden" style={{ border: '1px solid hsl(35,20%,30%)' }}>
          {[['owned', `My Heroes (${ownedHeroIds.length})`], ['available', 'Recruit']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="text-xs px-2 py-0.5 transition-all"
              style={{
                background: tab === id ? 'hsl(38,60%,22%)' : 'hsl(35,20%,16%)',
                color: tab === id ? 'hsl(43,90%,70%)' : 'hsl(40,20%,50%)',
                fontFamily: "'Cinzel',serif",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'owned' && ownedHeroIds.length === 0 && (
        <div className="text-center text-xs opacity-30 py-4" style={{ color: 'hsl(40,20%,60%)' }}>
          No heroes recruited yet. Switch to Recruit tab.
        </div>
      )}

      {tab === 'owned' && ownedHeroIds.map(heroId => {
        const hero = HEROES[heroId];
        if (!hero) return null;
        return (
          <HeroCard
            key={heroId}
            hero={hero}
            owned={true}
            status={currentPlayer.heroStatus?.[heroId]}
            territories={gameState.territories}
            currentPlayer={currentPlayer}
          />
        );
      })}

      {tab === 'available' && availableHeroes.map(hero => (
        <HeroCard
          key={hero.id}
          hero={hero}
          owned={false}
          status={null}
          onRecruit={onRecruit}
          territories={gameState.territories}
          currentPlayer={currentPlayer}
        />
      ))}
    </div>
  );
}