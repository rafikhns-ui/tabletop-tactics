import React from 'react';

const PHASES = [
  { id: 'deploy', icon: '🏰', label: 'Deploy', desc: 'Place reinforcement troops on your territories.' },
  { id: 'attack', icon: '⚔️', label: 'Attack', desc: 'Select your territory, then click enemy to attack.' },
  { id: 'fortify', icon: '🛡️', label: 'Fortify', desc: 'Move troops between adjacent friendly territories.' },
];

export default function ActionBar({ gameState, currentPlayer, phase, onAdvancePhase, isAI }) {
  if (!currentPlayer) return null;
  const income = calcIncome(currentPlayer, gameState.territories);

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Phase tracker */}
      <div>
        <div className="text-xs font-semibold mb-2 opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>
          PHASE
        </div>
        <div className="flex flex-col gap-1">
          {PHASES.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
              style={{
                background: phase === p.id ? 'hsl(38,70%,30%)' : 'hsl(35,20%,18%)',
                border: phase === p.id ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,28%)',
                color: phase === p.id ? 'hsl(43,90%,80%)' : 'hsl(40,15%,55%)',
                fontFamily: "'Cinzel',serif",
              }}>
              <span>{p.icon}</span>
              <span className="font-semibold">{p.label}</span>
              {phase === p.id && <span className="ml-auto text-xs">▶</span>}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs opacity-55 leading-relaxed" style={{ color: 'hsl(40,20%,65%)' }}>
          {PHASES.find(p => p.id === phase)?.desc}
        </div>
      </div>

      {/* Deploy counter */}
      {phase === 'deploy' && (
        <div className="p-2 rounded text-center" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(43,70%,40%)' }}>
          <div className="text-xs opacity-60" style={{ fontFamily: "'Cinzel',serif" }}>TROOPS TO DEPLOY</div>
          <div className="text-3xl font-bold" style={{ color: 'hsl(43,90%,65%)', fontFamily: "'Cinzel',serif" }}>
            {currentPlayer.troopsToDeploy}
          </div>
          <div className="text-xs opacity-50">click your territories</div>
        </div>
      )}

      {/* Income preview */}
      <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
        <div className="text-xs font-semibold mb-1.5 opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>
          INCOME / TURN
        </div>
        <div className="space-y-1">
          <IncomeRow icon="🪙" label="Gold" value={income.gold} />
          <IncomeRow icon="🪵" label="Wood" value={income.wood} />
          <IncomeRow icon="🌾" label="Wheat" value={income.wheat} />
          <IncomeRow icon="✨" label="SP" value={income.sp} />
          <IncomeRow icon="💬" label="IP" value={income.ip} />
        </div>
      </div>

      {/* Resources */}
      <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
        <div className="text-xs font-semibold mb-1.5 opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>
          TREASURY
        </div>
        <div className="space-y-1">
          <IncomeRow icon="🪙" label="Gold" value={currentPlayer.resources.gold} />
          <IncomeRow icon="🪵" label="Wood" value={currentPlayer.resources.wood} />
          <IncomeRow icon="🌾" label="Wheat" value={currentPlayer.resources.wheat} />
          <IncomeRow icon="💎" label="Crystals" value={currentPlayer.crystals} />
        </div>
      </div>

      {/* Advance phase */}
      {!isAI && (
        <button
          onClick={onAdvancePhase}
          className="w-full py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          style={{
            fontFamily: "'Cinzel',serif",
            background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))',
            border: '1px solid hsl(38,80%,55%)',
            color: 'hsl(43,90%,90%)',
          }}
        >
          {phase === 'deploy' ? '⚔️ Begin Attack' : phase === 'attack' ? '🛡️ Fortify' : '✦ End Turn'}
        </button>
      )}
      {isAI && (
        <div className="text-center text-xs opacity-50 italic" style={{ color: 'hsl(40,20%,60%)' }}>
          🤖 AI is thinking...
        </div>
      )}
    </div>
  );
}

function IncomeRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-xs" style={{ color: 'hsl(40,20%,65%)' }}>
      <span>{icon} {label}</span>
      <span className="font-bold" style={{ color: 'hsl(43,80%,65%)' }}>+{value}</span>
    </div>
  );
}

function calcIncome(player, territories) {
  const mine = player.buildings?.mine;
  const sawmill = player.buildings?.sawmill;
  const field = player.buildings?.field;
  const market = player.buildings?.market;
  const temple = player.buildings?.temple;
  const owned = Object.values(territories).filter(t => t.owner === player.id).length;
  return {
    gold: owned + (mine?.level || 0) + (market ? 1 : 0),
    wood: (sawmill?.level || 0),
    wheat: (field?.level || 0),
    sp: (temple?.level || 0) + (player.factionId === 'sultanate' ? 1 : 0),
    ip: (market ? 1 : 0) + (player.factionId === 'republic' ? 1 : 0),
  };
}