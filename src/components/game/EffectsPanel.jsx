import React from 'react';
import { FACTIONS, HEROES } from './ardoniaData';

const EFFECT_ICONS = {
  faction: '🏰',
  leader_bonus: '👑',
  leader_malus: '⚠️',
  hero: '⭐',
  card: '🃏',
  avatar: '👹',
};

function EffectRow({ icon, label, text, color, duration, isMalus }) {
  return (
    <div className="rounded-lg px-3 py-2 mb-1.5 flex gap-2.5"
      style={{
        background: isMalus ? 'hsl(0,25%,15%)' : 'hsl(35,20%,17%)',
        border: `1px solid ${isMalus ? 'hsl(0,40%,28%)' : color || 'hsl(35,20%,30%)'}`,
      }}>
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-bold truncate" style={{ fontFamily: "'Cinzel',serif", color: isMalus ? 'hsl(0,70%,65%)' : (color || 'hsl(43,80%,65%)') }}>
            {label}
          </span>
          {duration !== undefined && duration !== Infinity && (
            <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: 'hsl(35,20%,24%)', color: 'hsl(40,20%,60%)' }}>
              {duration}t
            </span>
          )}
          {duration === Infinity && (
            <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: 'hsl(35,20%,24%)', color: 'hsl(43,80%,55%)' }}>
              ∞
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'hsl(40,20%,62%)' }}>{text}</p>
      </div>
    </div>
  );
}

export default function EffectsPanel({ currentPlayer, gameState }) {
  if (!currentPlayer) return null;

  const faction = FACTIONS[currentPlayer.factionId];
  const leader = currentPlayer.leader;
  const cardEffects = currentPlayer.cardEffects || {};
  const heroIds = currentPlayer.heroes || [];
  const activeAvatar = currentPlayer.activeAvatar;

  const activeCardEntries = Object.entries(cardEffects).filter(([, v]) => v?.active);

  const cardEffectLabels = {
    peace_treaty: 'Peace Treaty — No mutual attacks for 3 turns; +1 Gold/turn each',
    embargo: 'Embargo — Opponent cannot trade for 2 turns',
    trade_diplomacy: 'Trade Diplomacy — Both players exchange freely; each trade +1 resource',
    merchant_fleet: 'Merchant Fleet — Trade without Market or Port for 2 turns',
    exclusive_contract: 'Exclusive Contract — Trade partner cannot trade with others for 3 turns',
    tariff_deal: 'Tariff Deal — Each trade earns +1 extra Gold for 3 turns',
    wood_monopoly: 'Wood Monopoly — Others pay +1 Gold to trade Wood for 3 turns',
    wheat_monopoly: 'Wheat Monopoly — Others pay +1 Gold to trade Wheat for 3 turns',
    trade_corridor: 'Trade Corridor — All trades generate +1 resource each for 2 turns',
    merchant_guild: 'Merchant Guild — Trade with Bank at 1-for-1 rate once/turn',
    economic_boom: 'Economic Boom — Market produces +2 Gold for 3 turns',
    war_profiteering: 'War Profiteering — +2 Gold/turn while any player is at war',
    economic_manipulation: 'Economic Manipulation — Target must trade at 2-for-1 disadvantage',
    tariff_war: 'Tariff War — All players pay +2 Gold when buying resources next turn',
    slave_trade: 'Slave Trade — Defeated units can be sold to bank for 3 turns',
    debt_forgiveness: 'Debt Forgiveness — All owed payments between two players cancelled',
    luxury_tax: 'Luxury Tax — Players with >10 Gold pay you 2 Gold',
    forced_tribute: 'Forced Tribute — Demanded 3 Gold from opponent',
    royal_marriage: 'Royal Marriage — Alliance for 3 turns; both gain +1 Gold from Markets',
    allied_barracks: 'Allied Barracks — Share recruitment costs with ally for 1 turn',
    non_aggression_pact: 'Non-Aggression Pact — No mutual attacks for 2 turns',
    holy_shield: 'Holy Shield — One unit negates all damage this turn',
    ritual_of_summoning: 'Ritual of Summoning — Next Avatar costs 2 fewer SP',
    temple_blessing: 'Temple Blessing — Temple generates +2 SP this turn',
    mystic_barrier: 'Mystic Barrier — Cancel one Clandestine card targeting you',
    prophets_vision: "Prophet's Vision — Drew 2 action cards",
    wrath_of_divine: 'Wrath of the Divine — 1d6 damage dealt to enemy territory',
    avatars_echo: "Avatar's Echo — Avatar may use active ability again this turn",
    sanctified_ground: 'Sanctified Ground — Enemy units entering designated territory roll -1 this turn',
    echoes_of_prophecy: 'Echoes of Prophecy — Predicting enemy action: +2 SP on success',
  };

  const totalEffects = (faction ? 1 : 0) + (leader ? 2 : 0) + heroIds.length + activeCardEntries.length + (activeAvatar ? 1 : 0);

  if (totalEffects === 0) {
    return (
      <div className="p-4 text-center text-xs opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
        No active effects yet. Play cards, recruit heroes, or summon avatars.
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 overflow-y-auto">

      {/* Faction */}
      {faction && (
        <section>
          <div className="text-xs font-bold tracking-widest opacity-50 mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            FACTION RULE
          </div>
          <EffectRow
            icon={faction.emoji}
            label={faction.name}
            text={faction.specialRule}
            color={faction.color}
          />
        </section>
      )}

      {/* Leader */}
      {leader && (
        <section>
          <div className="text-xs font-bold tracking-widest opacity-50 mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            LEADER EFFECTS
          </div>
          <EffectRow
            icon="👑"
            label={`${leader.name} — Bonus`}
            text={leader.passive}
            color="hsl(43,80%,55%)"
          />
          <EffectRow
            icon="⚠️"
            label={`${leader.name} — Drawback`}
            text={leader.disadvantage}
            isMalus
          />
        </section>
      )}

      {/* Heroes */}
      {heroIds.length > 0 && (
        <section>
          <div className="text-xs font-bold tracking-widest opacity-50 mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            HERO ABILITIES
          </div>
          {heroIds.map(hId => {
            const hero = HEROES[hId];
            if (!hero) return null;
            const status = currentPlayer.heroStatus?.[hId];
            const isExhausted = status?.exhausted;
            const isImprisoned = status?.imprisoned;
            return (
              <div key={hId}>
                {hero.ability && (
                  <EffectRow
                    icon="⚔️"
                    label={`${hero.name} — Ability`}
                    text={hero.ability}
                    color={isExhausted || isImprisoned ? 'hsl(40,15%,40%)' : 'hsl(43,80%,55%)'}
                    isMalus={isImprisoned}
                  />
                )}
                {hero.passive && (
                  <EffectRow
                    icon="✨"
                    label={`${hero.name} — Special`}
                    text={hero.passive}
                    color={isExhausted || isImprisoned ? 'hsl(40,15%,40%)' : 'hsl(200,60%,55%)'}
                    isMalus={isImprisoned}
                  />
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Active Card Effects */}
      {activeCardEntries.length > 0 && (
        <section>
          <div className="text-xs font-bold tracking-widest opacity-50 mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            ACTIVE CARD EFFECTS
          </div>
          {activeCardEntries.map(([id, effect]) => (
            <EffectRow
              key={id}
              icon="🃏"
              label={id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              text={cardEffectLabels[id] || 'Active effect'}
              duration={effect.duration}
              color="hsl(200,60%,55%)"
            />
          ))}
        </section>
      )}

      {/* Active Avatar */}
      {activeAvatar && (
        <section>
          <div className="text-xs font-bold tracking-widest opacity-50 mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            SUMMONED AVATAR
          </div>
          <EffectRow
            icon="👹"
            label={activeAvatar.id?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Avatar'}
            text={`Active for ${activeAvatar.duration} more turn(s)`}
            duration={activeAvatar.duration}
            color="hsl(280,60%,60%)"
          />
        </section>
      )}
    </div>
  );
}