import React, { useState } from 'react';
import { resolveBattle, getHeroCombatBonus } from './ardoniaLogic';
import { HEROES } from './ardoniaData';

const DIE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function BattleModal({ gameState, battle, onResult, onCancel }) {
  const { territories, players } = gameState;
  const attacker = territories[battle.attackerId];
  const defender = territories[battle.defenderId];
  const attackerPlayer = players.find(p => p.id === attacker.owner);
  const defenderPlayer = players.find(p => p.id === defender.owner);

  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);

  const attackerHeroBonus = getHeroCombatBonus(territories, battle.attackerId, attacker.owner);
  const defenderHeroBonus = getHeroCombatBonus(territories, battle.defenderId, defender.owner);
  const attackerHero = attacker.heroId ? HEROES[attacker.heroId] : null;
  const defenderHero = defender.heroId ? HEROES[defender.heroId] : null;

  const roll = () => {
    setRolling(true);
    setTimeout(() => {
      const attackerUnits = attacker.units && attacker.units.length > 0 ? attacker.units : [{ type: 'infantry', count: attacker.troops }];
      const defenderUnits = defender.units && defender.units.length > 0 ? defender.units : [{ type: 'infantry', count: defender.troops }];
      const r = resolveBattle(attackerUnits, defenderUnits, defender.hasFortress, {
        attackBonus: attackerHeroBonus.attackBonus,
        defenseBonus: defenderHeroBonus.defenseBonus,
      });
      setResult(r);
      setRolling(false);
    }, 600);
  };

  const defenderTroops = defender.units?.reduce((s, u) => s + u.count, 0) || defender.troops;
  const conquered = result && result.defenderLosses >= defenderTroops;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden scroll-in"
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,13%), hsl(35,20%,9%))', border: '2px solid hsl(43,70%,45%)' }}>
        <div className="text-center py-4 border-b border-border">
          <div className="text-4xl mb-1">⚔️</div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
            Battle!
          </h2>
          {defender.fortified && (
            <div className="text-xs mt-1" style={{ color: 'hsl(43,70%,65%)' }}>🏰 Fortified — Defender +1 die</div>
          )}
          {attackerHero && (
            <div className="text-xs mt-0.5" style={{ color: 'hsl(50,80%,65%)' }}>⭐ {attackerHero.name} (+{attackerHeroBonus.attackBonus} ATK)</div>
          )}
          {defenderHero && (
            <div className="text-xs mt-0.5" style={{ color: 'hsl(200,70%,65%)' }}>⭐ {defenderHero.name} (+{defenderHeroBonus.defenseBonus} DEF)</div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <CombatantCard player={attackerPlayer} territory={attacker} role="attacker" />
          <div className="text-2xl font-bold opacity-40" style={{ color: 'hsl(40,20%,70%)' }}>VS</div>
          <CombatantCard player={defenderPlayer} territory={defender} role="defender" />
        </div>

        {result && (
          <div className="px-6 pb-4">
            <div className="flex justify-between gap-4 mb-4">
              <DiceResults label="Attacker" rolls={result.aRolls} losses={result.attackerLosses} bonus={result.aBonus} />
              <DiceResults label="Defender" rolls={result.dRolls} losses={result.defenderLosses} bonus={result.dBonus} />
            </div>
            <div className="text-center p-3 rounded-lg"
              style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,30%)' }}>
              {conquered ? (
                <div className="font-bold text-base glow-gold" style={{ color: 'hsl(43,90%,65%)', fontFamily: "'Cinzel',serif" }}>
                  🏴 Territory Conquered!
                </div>
              ) : result.defenderLosses > result.attackerLosses ? (
                <div className="font-bold" style={{ color: 'hsl(120,60%,55%)' }}>⚔️ Attacker gains the upper hand!</div>
              ) : (
                <div className="font-bold" style={{ color: 'hsl(0,70%,60%)' }}>🛡️ Defender holds the line!</div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 p-4 border-t border-border">
          {!result ? (
            <>
              <button onClick={onCancel}
                className="flex-1 py-2 rounded-lg text-sm font-semibold hover:opacity-80"
                style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)' }}>
                Retreat
              </button>
              <button onClick={roll} disabled={rolling}
                className="flex-grow-[2] py-2 rounded-lg text-sm font-bold hover:opacity-90"
                style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(0,65%,38%), hsl(0,65%,28%))', border: '1px solid hsl(0,65%,55%)', color: 'hsl(40,30%,95%)' }}>
                {rolling ? '🎲 Rolling...' : '⚔️ Attack!'}
              </button>
            </>
          ) : (
            <button onClick={() => onResult(result)}
              className="w-full py-2.5 rounded-lg text-sm font-bold hover:opacity-90"
              style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,92%)' }}>
              ✦ Confirm Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CombatantCard({ player, territory, role }) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{role === 'attacker' ? '🗡️' : '🛡️'}</div>
      <div className="text-sm font-bold" style={{ color: player?.color, fontFamily: "'Cinzel',serif" }}>{player?.name}</div>
      <div className="text-xs opacity-60 mt-0.5">{territory.name}</div>
      <div className="text-2xl font-black mt-1" style={{ color: 'hsl(43,85%,65%)', fontFamily: "'Cinzel',serif" }}>{territory.troops}</div>
      <div className="text-xs opacity-50">troops</div>
    </div>
  );
}

function DiceResults({ label, rolls, losses, bonus }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-xs opacity-60 mb-2" style={{ fontFamily: "'Cinzel',serif" }}>{label.toUpperCase()}</div>
      <div className="flex justify-center gap-1 flex-wrap">
        {rolls.map((r, i) => (
          <div key={i} className="text-3xl dice-roll">{DIE_FACES[r] || r}</div>
        ))}
      </div>
      {bonus > 0 && <div className="text-xs mt-1" style={{ color: 'hsl(43,80%,65%)' }}>+{bonus} bonus</div>}
      {losses > 0 && <div className="text-xs mt-1" style={{ color: 'hsl(0,70%,60%)' }}>-{losses} troops</div>}
    </div>
  );
}