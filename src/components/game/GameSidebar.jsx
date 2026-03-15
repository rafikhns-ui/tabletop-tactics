import React from 'react';

const PHASE_INFO = {
  deploy: { icon: '🏰', label: 'Deploy', desc: 'Place your reinforcements on your territories.' },
  attack: { icon: '⚔️', label: 'Attack', desc: 'Select your territory, then click an enemy to attack.' },
  fortify: { icon: '🛡️', label: 'Fortify', desc: 'Move troops between adjacent friendly territories.' },
};

const PHASE_ORDER = ['deploy', 'attack', 'fortify'];

export default function GameSidebar({ gameState, phase, deployTroops, onDeployChange, onEndPhase, selectedTerritory }) {
  const { players, territories, currentPlayerIndex, turn } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  const getPlayerTerritoryCount = (playerId) =>
    Object.values(territories).filter(t => t.owner === playerId).length;

  const getPlayerTroops = (playerId) =>
    Object.values(territories).filter(t => t.owner === playerId).reduce((sum, t) => sum + t.troops, 0);

  return (
    <div
      className="h-full flex flex-col border-l border-border overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, hsl(35,30%,10%) 0%, hsl(35,20%,14%) 100%)' }}
    >
      {/* Turn info */}
      <div className="p-4 border-b border-border">
        <div className="text-center">
          <div className="text-xs tracking-widest opacity-50 mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
            TURN {turn}
          </div>
          <div
            className="text-lg font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: currentPlayer.color }}
          >
            {currentPlayer.name}
          </div>
          <div className="text-xs opacity-60 mt-0.5">
            {currentPlayer.isAI ? '🤖 AI Thinking...' : '👑 Your Turn'}
          </div>
        </div>
      </div>

      {/* Phase tracker */}
      <div className="p-3 border-b border-border">
        <div className="flex justify-between items-center gap-1">
          {PHASE_ORDER.map((p) => (
            <div
              key={p}
              className="flex-1 text-center py-1.5 rounded text-xs font-semibold transition-all"
              style={{
                fontFamily: "'Cinzel', serif",
                background: phase === p ? 'hsl(38,85%,40%)' : 'hsl(35,20%,20%)',
                color: phase === p ? 'hsl(40,30%,95%)' : 'hsl(40,20%,55%)',
                border: phase === p ? '1px solid hsl(38,85%,60%)' : '1px solid hsl(35,20%,30%)',
                fontSize: '10px',
              }}
            >
              {PHASE_INFO[p].icon} {PHASE_INFO[p].label}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-center opacity-60" style={{ color: 'hsl(40,20%,70%)' }}>
          {PHASE_INFO[phase].desc}
        </div>
      </div>

      {/* Deploy controls */}
      {phase === 'deploy' && (
        <div className="p-3 border-b border-border">
          <div className="text-xs font-semibold mb-2" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(43,90%,58%)' }}>
            🏰 Troops to Deploy
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: 'hsl(43,90%,70%)', fontFamily: "'Cinzel', serif" }}>
              {currentPlayer.troopsToDeploy}
            </div>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => onDeployChange(Math.max(1, deployTroops - 1))}
                className="w-7 h-7 rounded font-bold text-sm hover:opacity-80 transition-opacity"
                style={{ background: 'hsl(35,20%,25%)', border: '1px solid hsl(35,20%,40%)', color: 'hsl(40,30%,80%)' }}
              >−</button>
              <div className="w-10 text-center font-bold" style={{ color: 'hsl(40,30%,90%)' }}>
                {deployTroops}
              </div>
              <button
                onClick={() => onDeployChange(Math.min(currentPlayer.troopsToDeploy, deployTroops + 1))}
                className="w-7 h-7 rounded font-bold text-sm hover:opacity-80 transition-opacity"
                style={{ background: 'hsl(35,20%,25%)', border: '1px solid hsl(35,20%,40%)', color: 'hsl(40,30%,80%)' }}
              >+</button>
            </div>
            <div className="text-xs opacity-50 mt-1">per click</div>
          </div>
        </div>
      )}

      {/* Selected territory info */}
      {selectedTerritory && gameState.territories[selectedTerritory] && (
        <div className="p-3 border-b border-border">
          <div className="text-xs font-semibold mb-1" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(43,90%,58%)' }}>
            ⚔ Selected
          </div>
          <div className="text-sm font-bold" style={{ color: 'hsl(40,30%,90%)' }}>
            {gameState.territories[selectedTerritory].name}
          </div>
          <div className="text-xs opacity-60">
            {gameState.territories[selectedTerritory].troops} troops
          </div>
        </div>
      )}

      {/* Players */}
      <div className="p-3 flex-1">
        <div className="text-xs font-semibold mb-2 opacity-60" style={{ fontFamily: "'Cinzel', serif" }}>
          COMMANDERS
        </div>
        <div className="space-y-3">
          {players.map((player) => {
            const tCount = getPlayerTerritoryCount(player.id);
            const tTotal = Object.keys(territories).length;
            const pct = Math.round((tCount / tTotal) * 100);
            return (
              <div key={player.id} className="rounded-lg p-2.5"
                style={{
                  background: player.id === currentPlayer.id ? 'hsl(35,20%,20%)' : 'hsl(35,20%,17%)',
                  border: `1px solid ${player.id === currentPlayer.id ? player.color : 'hsl(35,20%,28%)'}`,
                }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: player.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'hsl(40,30%,88%)' }}>
                      {player.name}
                    </span>
                    {player.isAI && <span className="text-xs opacity-50">🤖</span>}
                    {player.id === currentPlayer.id && <span className="text-xs">▶</span>}
                  </div>
                  <span className="text-xs opacity-60">{tCount}/{tTotal}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(35,20%,28%)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: player.color }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 opacity-50">
                  <span>{pct}% of realm</span>
                  <span>⚔ {getPlayerTroops(player.id)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* End phase button */}
      {!currentPlayer.isAI && (
        <div className="p-3 border-t border-border">
          <button
            onClick={onEndPhase}
            className="w-full py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(38,85%,40%) 0%, hsl(38,85%,30%) 100%)',
              border: '1px solid hsl(38,85%,55%)',
              color: 'hsl(40,30%,95%)',
            }}
          >
            {phase === 'deploy' ? '⚔ Begin Attack' : phase === 'attack' ? '🛡 Fortify' : '✦ End Turn'}
          </button>
        </div>
      )}
    </div>
  );
}