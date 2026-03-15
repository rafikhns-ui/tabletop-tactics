import React, { useState } from 'react';
import { resolveBattle } from './gameLogic';

const DIE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function BattleModal({ gameState, battle, onResult, onCancel }) {
  const { territories, players } = gameState;
  const attacker = territories[battle.attackerId];
  const defender = territories[battle.defenderId];
  const attackerPlayer = players.find(p => p.id === attacker.owner);
  const defenderPlayer = players.find(p => p.id === defender.owner);

  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);

  const maxAttackDice = Math.min(3, attacker.troops - 1);
  const maxDefendDice = Math.min(2, defender.troops);
  const [attackDice, setAttackDice] = useState(maxAttackDice);

  const rollBattle = () => {
    setRolling(true);
    setTimeout(() => {
      const r = resolveBattle(attackDice, maxDefendDice);
      setResult(r);
      setRolling(false);
    }, 600);
  };

  const confirmResult = () => {
    onResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div
        className="w-full max-w-md rounded-2xl fantasy-border scroll-in overflow-hidden"
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%) 0%, hsl(35,20%,10%) 100%)' }}
      >
        {/* Header */}
        <div className="text-center py-4 px-6 border-b border-border">
          <div className="text-3xl mb-1">⚔️</div>
          <h2 className="text-xl font-bold glow-gold" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(43,90%,58%)' }}>
            Battle!
          </h2>
        </div>

        {/* Combatants */}
        <div className="flex items-center justify-between p-6">
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">🗡️</div>
            <div className="font-bold text-sm" style={{ color: attackerPlayer.color, fontFamily: "'Cinzel', serif" }}>
              {attackerPlayer.name}
            </div>
            <div className="text-xs opacity-60 mt-0.5">{attacker.name}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'hsl(43,90%,65%)' }}>
              {attacker.troops}
            </div>
            <div className="text-xs opacity-50">troops</div>
          </div>

          <div className="text-3xl opacity-60">VS</div>

          <div className="text-center flex-1">
            <div className="text-2xl mb-1">🛡️</div>
            <div className="font-bold text-sm" style={{ color: defenderPlayer.color, fontFamily: "'Cinzel', serif" }}>
              {defenderPlayer.name}
            </div>
            <div className="text-xs opacity-60 mt-0.5">{defender.name}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: 'hsl(43,90%,65%)' }}>
              {defender.troops}
            </div>
            <div className="text-xs opacity-50">troops</div>
          </div>
        </div>

        {/* Dice selection */}
        {!result && (
          <div className="px-6 pb-4">
            <div className="text-center mb-3">
              <div className="text-xs opacity-60 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                ATTACK DICE
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3].filter(n => n <= maxAttackDice).map(n => (
                  <button
                    key={n}
                    onClick={() => setAttackDice(n)}
                    className="text-2xl transition-all hover:scale-110"
                    style={{ opacity: attackDice === n ? 1 : 0.35 }}
                  >
                    🎲
                  </button>
                ))}
              </div>
              <div className="text-xs mt-1 opacity-50">{attackDice} {attackDice === 1 ? 'die' : 'dice'}</div>
            </div>
          </div>
        )}

        {/* Dice results */}
        {result && (
          <div className="px-6 pb-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="text-xs opacity-60 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>ATTACKER</div>
                <div className="flex justify-center gap-1">
                  {result.aRolls.map((r, i) => (
                    <div key={i} className="text-3xl dice-roll" style={{ animationDelay: `${i * 0.1}s` }}>
                      {DIE_FACES[r]}
                    </div>
                  ))}
                </div>
                {result.attackerLosses > 0 && (
                  <div className="text-xs mt-1" style={{ color: 'hsl(0,70%,60%)' }}>
                    -{result.attackerLosses} troops
                  </div>
                )}
              </div>
              <div className="flex-1 text-center">
                <div className="text-xs opacity-60 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>DEFENDER</div>
                <div className="flex justify-center gap-1">
                  {result.dRolls.map((r, i) => (
                    <div key={i} className="text-3xl dice-roll" style={{ animationDelay: `${i * 0.1 + 0.3}s` }}>
                      {DIE_FACES[r]}
                    </div>
                  ))}
                </div>
                {result.defenderLosses > 0 && (
                  <div className="text-xs mt-1" style={{ color: 'hsl(0,70%,60%)' }}>
                    -{result.defenderLosses} troops
                  </div>
                )}
              </div>
            </div>

            {/* Outcome */}
            <div className="text-center mt-4 p-3 rounded-lg"
              style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
              {result.defenderLosses > result.attackerLosses ? (
                <div style={{ color: 'hsl(120,60%,55%)' }} className="font-bold">⚔️ Attacker wins this round!</div>
              ) : result.attackerLosses > result.defenderLosses ? (
                <div style={{ color: 'hsl(0,70%,60%)' }} className="font-bold">🛡️ Defender holds!</div>
              ) : (
                <div style={{ color: 'hsl(43,90%,65%)' }} className="font-bold">💥 Both sides take losses!</div>
              )}
              {result.defenderLosses >= defender.troops && (
                <div className="mt-1 text-sm font-bold glow-gold" style={{ color: 'hsl(43,90%,65%)' }}>
                  🏆 Territory conquered!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border">
          {!result ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)' }}
              >
                Retreat
              </button>
              <button
                onClick={rollBattle}
                disabled={rolling}
                className="flex-2 flex-grow-[2] py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(0,70%,40%) 0%, hsl(0,70%,30%) 100%)',
                  border: '1px solid hsl(0,70%,55%)',
                  color: 'hsl(40,30%,95%)',
                }}
              >
                {rolling ? '🎲 Rolling...' : '⚔️ Attack!'}
              </button>
            </>
          ) : (
            <button
              onClick={confirmResult}
              className="w-full py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(38,85%,40%) 0%, hsl(38,85%,30%) 100%)',
                border: '1px solid hsl(38,85%,55%)',
                color: 'hsl(40,30%,95%)',
              }}
            >
              ✦ Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}