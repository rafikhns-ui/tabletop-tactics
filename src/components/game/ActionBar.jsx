import React from 'react';
import ActionCardsPanel from './ActionCardsPanel';
import { UNIT_DEFS } from './ardoniaData';

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

export default function ActionBar({ gameState, currentPlayer, phase, onAdvancePhase, isAI, onPlayCard, onDrawCard, onSelectDeployUnit, onDragDeployStart, onDragDeployEnd, isDraggingDeploy }) {
  if (!currentPlayer) return null;
  const income = calcIncome(currentPlayer, gameState.territories);

  return (
    <div className="p-3 flex flex-col gap-3" style={{ opacity: isDraggingDeploy ? 0.15 : 1, transition: 'opacity 0.2s', pointerEvents: isDraggingDeploy ? 'none' : 'auto' }}>
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
        <DeployQueue pendingUnits={currentPlayer.pendingUnits || []} onSelectUnit={onSelectDeployUnit} onDragStart={onDragDeployStart} onDragEnd={onDragDeployEnd} />
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

function DeployQueue({ pendingUnits, onSelectUnit, onDragStart, onDragEnd }) {
  const counts = {};
  pendingUnits.forEach(u => { counts[u] = (counts[u] || 0) + 1; });
  const entries = Object.entries(counts);
  const nextType = pendingUnits[0];

  return (
    <div className="p-2 rounded" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(43,70%,40%)' }}>
      <div className="text-xs opacity-60 mb-2" style={{ fontFamily: "'Cinzel',serif" }}>TROOPS TO DEPLOY</div>
      {pendingUnits.length === 0 ? (
        <div className="text-xs text-center opacity-40 py-1" style={{ color: 'hsl(40,20%,60%)' }}>
          Recruit troops to deploy
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {entries.map(([type, count]) => {
              const def = UNIT_DEFS[type];
              const isNext = type === nextType;
              return (
                <button
                  key={type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('deployUnitType', type);
                    e.dataTransfer.effectAllowed = 'move';
                    // Custom drag image
                    const ghost = document.createElement('div');
                    ghost.textContent = def?.emoji || '⚔️';
                    ghost.style.cssText = 'position:fixed;top:-100px;left:-100px;font-size:32px;background:rgba(30,20,10,0.9);border:2px solid #d4a853;border-radius:8px;padding:6px 10px;pointer-events:none;z-index:99999;';
                    document.body.appendChild(ghost);
                    e.dataTransfer.setDragImage(ghost, 24, 24);
                    setTimeout(() => document.body.removeChild(ghost), 0);
                    onDragStart && onDragStart(type);
                  }}
                  onDragEnd={() => onDragEnd && onDragEnd()}
                  onClick={() => onSelectUnit && onSelectUnit(type)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: isNext ? 'hsl(43,70%,28%)' : 'hsl(38,40%,18%)',
                    border: isNext ? '2px solid hsl(43,90%,60%)' : '1px solid hsl(35,20%,35%)',
                    color: isNext ? 'hsl(43,95%,85%)' : 'hsl(40,25%,65%)',
                    fontFamily: "'Cinzel',serif",
                    boxShadow: isNext ? '0 0 12px rgba(255,200,50,0.4)' : 'none',
                    cursor: 'grab',
                  }}>
                  <span className="text-base">{def?.emoji || '⚔️'}</span>
                  <span>{def?.name || type}</span>
                  <span className="ml-1 px-1 rounded-full text-xs" style={{ background: isNext ? 'hsl(43,80%,38%)' : 'hsl(35,20%,28%)', color: isNext ? 'hsl(43,95%,90%)' : 'hsl(40,20%,60%)' }}>×{count}</span>
                  {isNext && <span className="text-xs ml-0.5" style={{ color: 'hsl(43,90%,75%)', fontSize: '9px' }}>▶ NEXT</span>}
                </button>
              );
            })}
          </div>
          <div className="text-xs opacity-50 text-center">drag unit onto your territory · or click to select then click hex</div>
        </>
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