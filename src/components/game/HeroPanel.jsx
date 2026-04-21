import React, { useState } from 'react';
import { HEROES, BUILDING_DEFS } from './ardoniaData';

const ABILITY_COSTS = {
  onseiko_warhound:       { label: 'Siege Killer', cost: null },
  black_chrysanthemum:    { label: 'Web of Shadows', cost: { ip: 2 } },
  ube_tarawa:             { label: "Can't Refuse", cost: { ip: 0 } },
  itawan_shadow_death:    { label: 'Silent Kill', cost: { ip: 2 } },
  ayame_crimson_spark:    { label: 'Crimson Lightning', cost: { sp: 1 } },
  spy_mira:               { label: 'Reveal Objective', cost: { ip: 1 } },
  warrior_bran:           { label: '+3 Attack Roll', cost: null },
  diplomat_lyra:          { label: 'Force Treaty', cost: { ip: 2 } },
  mage_zel:               { label: '+2 SP Now', cost: null },
  strategist_oryn:        { label: 'Double Move', cost: null },
  healer_seri:            { label: 'Restore 2 Troops', cost: null },
  knight_aldric:          { label: 'Negate Attack Loss', cost: null },
  oracle_vex:             { label: 'Predict Attack', cost: { sp: 1 } },
  ranger_kael:            { label: 'Scout Adjacent', cost: null },
};

const HERO_TYPE_ICONS = {
  Warrior: '⚔️', Spy: '🕵️', Diplomat: '🤝', Mage: '🔮',
  Strategist: '🗺️', Healer: '💚',
};

/**
 * @param {{
 *   hero?: any,
 *   status?: any,
 *   owned?: boolean,
 *   onRecruit?: (...args: any[]) => void,
 *   territories?: any,
 *   currentPlayer?: any,
 *   onTriggerAbility?: (...args: any[]) => void
 * }} props
 */
function HeroCard({ hero, status, owned, onRecruit, territories, currentPlayer, onTriggerAbility }) {
  const [showPreview, setShowPreview] = React.useState(false);
  const canAfford = Object.entries(hero.cost || {}).every(([k, v]) => {
    if (k === 'ip') return (currentPlayer.ip ?? 0) >= v;
    if (k === 'sp') return (currentPlayer.sp ?? 0) >= v;
    return (currentPlayer.resources?.[k] ?? 0) >= v;
  });
  const hasRequiredBuilding = !hero.requiredBuilding || currentPlayer.buildings?.[hero.requiredBuilding];

  if (!owned) {
    return (
      <>
        <div
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
          className="rounded-lg p-2.5 relative"
          style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,30%)' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{HERO_TYPE_ICONS[hero.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: 'hsl(43,80%,70%)', fontFamily: "'Cinzel',serif" }}>{hero.name}</div>
              <div className="text-xs opacity-50">{hero.type}</div>
            </div>
          </div>
          {hero.ability && (
            <div className="text-xs mb-2 leading-relaxed px-2 py-1.5 rounded" style={{ background: 'hsl(35,20%,14%)', border: '1px solid hsl(35,20%,26%)', color: 'hsl(40,20%,60%)' }}>
              <span className="font-semibold" style={{ color: 'hsl(43,70%,60%)' }}>⚔️ Active: </span>
              {hero.ability}
            </div>
          )}
          {hero.passive && (
            <div className="text-xs mb-2 leading-relaxed px-2 py-1.5 rounded" style={{ background: 'hsl(35,20%,14%)', border: '1px solid hsl(35,20%,26%)', color: 'hsl(40,20%,60%)' }}>
              <span className="font-semibold" style={{ color: 'hsl(200,60%,60%)' }}>✨ Special: </span>
              {hero.passive}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {Object.entries(hero.cost || {}).map(([k, v]) => (
                <span key={k} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'hsl(35,20%,24%)', color: 'hsl(43,80%,65%)' }}>
                  {k === 'gold' ? '🪙' : k === 'ip' ? '💬' : k === 'sp' ? '✨' : k === 'crystals' ? '💎' : '?'}{v}
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
              {hero.requiredBuildingLevel ? ` Lvl ${hero.requiredBuildingLevel}` : ''}
            </div>
          )}
        </div>
        {showPreview && hero.image && (
          <div className="fixed pointer-events-none z-50" style={{ top: '50%', right: '2rem', transform: 'translateY(-50%)' }}>
            <img src={hero.image} alt={hero.name} className="w-96 h-auto rounded-sm shadow-2xl border-4" style={{ borderColor: 'hsl(43,90%,55%)', boxShadow: '0 0 40px hsl(43,90%,55%)50' }} />
          </div>
        )}
      </>
    );
  }

  const isExhausted = status?.exhausted;
  const isImprisoned = status?.imprisoned;
  const abilityInfo = ABILITY_COSTS[hero.id];

  const canAffordAbility = abilityInfo?.cost ? Object.entries(abilityInfo.cost).every(([k, v]) => {
    if (k === 'ip') return (currentPlayer?.ip ?? 0) >= v;
    if (k === 'sp') return (currentPlayer?.sp ?? 0) >= v;
    return (currentPlayer?.resources?.[k] ?? 0) >= v;
  }) : true;

  return (
    <div className="rounded-lg p-2.5" style={{
      background: 'hsl(35,22%,20%)',
      border: `1px solid ${isImprisoned ? 'hsl(0,50%,35%)' : isExhausted ? 'hsl(35,20%,30%)' : 'hsl(43,60%,35%)'}`,
    }}>
      <div className="flex items-center gap-2 mb-1.5">
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

      {/* Stats row */}
      <div className="flex gap-1 mb-2">
        {[['⚔️', hero.force], ['🕵️', hero.stealth], ['💬', hero.charisma], ['🔮', hero.arcana]].map(([icon, val], i) => (
          <div key={i} className="flex items-center gap-0.5 text-xs px-1 py-0.5 rounded"
            style={{ background: 'hsl(35,20%,24%)', color: 'hsl(40,20%,60%)' }}>
            {icon}<span style={{ color: 'hsl(43,80%,65%)' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Active ability with trigger button */}
      {hero.ability && (
        <div className="rounded px-2 py-1.5 mb-1.5" style={{ background: 'hsl(35,20%,15%)', border: '1px solid hsl(38,60%,28%)' }}>
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs font-bold" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>⚔️ Active Ability</span>
            {abilityInfo && (
              <div className="flex items-center gap-1">
                {abilityInfo.cost && Object.entries(abilityInfo.cost).map(([k, v]) => (
                  <span key={k} className="text-xs" style={{ color: 'hsl(43,70%,60%)' }}>
                    {k === 'ip' ? '💬' : k === 'sp' ? '✨' : k === 'gold' ? '🪙' : '?'}{v}
                  </span>
                ))}
                <button
                  disabled={isExhausted || isImprisoned || !canAffordAbility}
                  onClick={() => onTriggerAbility && onTriggerAbility(hero.id, abilityInfo)}
                  className="text-xs px-2 py-0.5 rounded font-bold transition-all"
                  style={{
                    fontFamily: "'Cinzel',serif",
                    background: (isExhausted || isImprisoned || !canAffordAbility) ? 'hsl(35,15%,22%)' : 'hsl(355,55%,28%)',
                    border: `1px solid ${(isExhausted || isImprisoned || !canAffordAbility) ? 'hsl(35,15%,30%)' : 'hsl(355,70%,50%)'}`,
                    color: (isExhausted || isImprisoned || !canAffordAbility) ? 'hsl(40,15%,40%)' : 'hsl(0,0%,95%)',
                    cursor: (isExhausted || isImprisoned || !canAffordAbility) ? 'not-allowed' : 'pointer',
                  }}>
                  {abilityInfo.label || 'Use'}
                </button>
              </div>
            )}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'hsl(40,20%,60%)' }}>{hero.ability}</p>
        </div>
      )}

      {/* Special / passive */}
      {hero.passive && (
        <div className="rounded px-2 py-1.5" style={{ background: 'hsl(35,20%,15%)', border: '1px solid hsl(200,40%,28%)' }}>
          <span className="text-xs font-bold" style={{ color: 'hsl(200,60%,60%)', fontFamily: "'Cinzel',serif" }}>✨ Special</span>
          <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'hsl(40,20%,60%)' }}>{hero.passive}</p>
        </div>
      )}
    </div>
  );
}

export default function HeroPanel({ gameState, currentPlayer, onRecruit, onTriggerAbility }) {
  const [tab, setTab] = useState('owned'); // 'owned' | 'available'
  const ownedHeroIds = currentPlayer.heroes || [];
  const availableHeroes = Object.values(HEROES).filter(h =>
    !ownedHeroIds.includes(h.id) &&
    (h.faction === null || h.faction === currentPlayer.factionId)
  );

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
            currentPlayer={currentPlayer}
            onTriggerAbility={onTriggerAbility}
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
          currentPlayer={currentPlayer}
        />
      ))}
    </div>
  );
}