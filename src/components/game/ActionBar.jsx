import React from 'react';
import BuildRecruitPanel from './BuildRecruitPanel';
import ActionCardsPanel from './ActionCardsPanel';

const PHASES = [
  { id: 'deploy', icon: '🏰', label: 'Deploy', desc: 'Place reinforcements on your territories.' },
  { id: 'move', icon: '🚶', label: 'Move', desc: 'Move units across the map.' },
  { id: 'attack', icon: '⚔️', label: 'Attack', desc: 'Select your territory, then click enemy.' },
  { id: 'fortify', icon: '🛡️', label: 'Fortify', desc: 'Move troops to adjacent friendly territories.' },
];

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

export default function ActionBar({ gameState, currentPlayer, phase, onAdvancePhase, isAI, onBuild, onRecruit, onPlayCard, onDrawCard, onUpgrade, onBuildFortress }) {
  if (!currentPlayer) return null;
  const income = calcIncome(currentPlayer, gameState.territories);

  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <div className="text-xs font-semibold mb-2 opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>PHASE</div>
        <div className="flex flex-col gap-1">
          {PHASES.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
              style={{
                background: phase === p.id ? 'hsl(38,70%,28%)' : 'hsl(35,20%,18%)',
                border: phase === p.id ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,28%)',
                color: phase === p.id ? 'hsl(43,90%,80%)' : 'hsl(40,15%,55%)',
                fontFamily: "'Cinzel',serif",
              }}>
              <span>{p.icon}</span>
              <span className="font-semibold">{p.label}</span>
              {phase === p.id && <span className="ml-auto">▶</span>}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs opacity-55 leading-relaxed" style={{ color: 'hsl(40,20%,65%)' }}>
          {PHASES.find(p => p.id === phase)?.desc}
        </div>
      </div>

      {phase === 'deploy' && (
        <DeployQueue pendingUnits={currentPlayer.pendingUnits || []} />
      )}

      <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
        <div className="text-xs font-semibold mb-1.5 opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>INCOME / TURN</div>
        <div className="space-y-1">
          <IncomeRow icon="🪙" label="Gold" value={income.gold} />
          <IncomeRow icon="🪵" label="Wood" value={income.wood} />
          <IncomeRow icon="🌾" label="Wheat" value={income.wheat} />
          <IncomeRow icon="✨" label="SP" value={income.sp} />
          <IncomeRow icon="💬" label="IP" value={income.ip} />
        </div>
      </div>

      <div className="rounded p-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
        <div className="text-xs font-semibold mb-1.5 opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>TREASURY</div>
        <div className="space-y-1">
          <IncomeRow icon="🪙" label="Gold" value={currentPlayer.resources?.gold ?? 0} />
          <IncomeRow icon="🪵" label="Wood" value={currentPlayer.resources?.wood ?? 0} />
          <IncomeRow icon="🌾" label="Wheat" value={currentPlayer.resources?.wheat ?? 0} />
          <IncomeRow icon="💎" label="Crystals" value={currentPlayer.crystals ?? 0} />
        </div>
      </div>

      {!isAI && (
        <ActionCardsPanel
          currentPlayer={currentPlayer}
          onPlayCard={onPlayCard}
          onDrawCard={onDrawCard}
        />
      )}

      {!isAI && (
        <BuildRecruitPanel
          currentPlayer={currentPlayer}
          gameState={gameState}
          onBuild={onBuild}
          onRecruit={onRecruit}
          onUpgrade={onUpgrade}
          onBuildFortress={onBuildFortress}
        />
      )}

      {!isAI ? (
        <button onClick={onAdvancePhase}
          className="w-full py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,90%)' }}>
          {phase === 'deploy' ? '🚶 Begin Move' : phase === 'move' ? '⚔️ Begin Attack' : phase === 'attack' ? '🛡️ Fortify' : '✦ End Turn'}
        </button>
      ) : (
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