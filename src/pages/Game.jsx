import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from '../components/game/GameBoard';
import GameSidebar from '../components/game/GameSidebar';
import GameMenu from '../components/game/GameMenu';
import BattleModal from '../components/game/BattleModal';
import { createInitialGameState, executeAttack, aiTurn } from '../components/game/gameLogic';

export default function Game() {
  const [gameState, setGameState] = useState(null);
  const [gameMode, setGameMode] = useState(null); // 'ai' | '2player'
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [phase, setPhase] = useState('deploy'); // 'deploy' | 'attack' | 'fortify'
  const [battle, setBattle] = useState(null);
  const [message, setMessage] = useState('');
  const [deployTroops, setDeployTroops] = useState(1);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const startGame = (mode) => {
    setGameMode(mode);
    const state = createInitialGameState(mode);
    setGameState(state);
    setPhase('deploy');
    setSelectedTerritory(null);
  };

  const handleTerritoryClick = (territoryId) => {
    if (!gameState) return;
    const territory = gameState.territories[territoryId];
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (phase === 'deploy') {
      if (territory.owner === currentPlayer.id && currentPlayer.troopsToDeploy > 0) {
        const newState = { ...gameState };
        newState.territories = { ...newState.territories };
        newState.territories[territoryId] = { ...territory, troops: territory.troops + deployTroops };
        const actualDeploy = Math.min(deployTroops, currentPlayer.troopsToDeploy);
        newState.players = newState.players.map(p =>
          p.id === currentPlayer.id
            ? { ...p, troopsToDeploy: p.troopsToDeploy - actualDeploy }
            : p
        );
        newState.territories[territoryId].troops = territory.troops + actualDeploy;
        setGameState(newState);
        if (newState.players[newState.currentPlayerIndex].troopsToDeploy <= 0) {
          setPhase('attack');
          showMessage('All troops deployed! Choose a territory to attack from.');
        }
      }
    } else if (phase === 'attack') {
      if (!selectedTerritory) {
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          showMessage(`Selected ${territory.name}. Now click an enemy territory to attack!`);
        }
      } else {
        if (territoryId === selectedTerritory) {
          setSelectedTerritory(null);
          return;
        }
        const attacker = gameState.territories[selectedTerritory];
        if (territory.owner !== currentPlayer.id &&
          gameState.adjacency[selectedTerritory]?.includes(territoryId)) {
          setBattle({ attackerId: selectedTerritory, defenderId: territoryId });
          setSelectedTerritory(null);
        } else if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          showMessage(`Selected ${territory.name}. Now click an enemy territory to attack!`);
        } else {
          showMessage('Not adjacent or invalid target!');
        }
      }
    } else if (phase === 'fortify') {
      if (!selectedTerritory) {
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          showMessage(`Moving troops from ${territory.name}. Click a friendly adjacent territory.`);
        }
      } else {
        if (territoryId !== selectedTerritory &&
          territory.owner === currentPlayer.id &&
          gameState.adjacency[selectedTerritory]?.includes(territoryId)) {
          const from = gameState.territories[selectedTerritory];
          const toMove = from.troops - 1;
          const newState = { ...gameState };
          newState.territories = { ...newState.territories };
          newState.territories[selectedTerritory] = { ...from, troops: 1 };
          newState.territories[territoryId] = { ...territory, troops: territory.troops + toMove };
          setGameState(newState);
          setSelectedTerritory(null);
          showMessage(`Moved ${toMove} troops to ${territory.name}!`);
        } else if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
        }
      }
    }
  };

  const handleBattleResult = (result) => {
    const newState = executeAttack(gameState, battle.attackerId, battle.defenderId, result);
    setGameState(newState);
    setBattle(null);
    const winner = checkWinner(newState);
    if (winner) {
      showMessage(`🏆 ${winner.name} has conquered the realm!`);
    }
  };

  const checkWinner = (state) => {
    const territoryCounts = {};
    Object.values(state.territories).forEach(t => {
      territoryCounts[t.owner] = (territoryCounts[t.owner] || 0) + 1;
    });
    const totalTerritories = Object.keys(state.territories).length;
    for (const player of state.players) {
      if ((territoryCounts[player.id] || 0) === totalTerritories) return player;
    }
    return null;
  };

  const endPhase = () => {
    if (phase === 'deploy' && gameState.players[gameState.currentPlayerIndex].troopsToDeploy > 0) {
      showMessage('Deploy all your troops first!');
      return;
    }
    if (phase === 'deploy') { setPhase('attack'); showMessage('Attack phase! Select your territory to attack from.'); }
    else if (phase === 'attack') { setPhase('fortify'); setSelectedTerritory(null); showMessage('Fortify phase! Move troops between adjacent territories.'); }
    else if (phase === 'fortify') {
      endTurn();
    }
  };

  const endTurn = useCallback(() => {
    setSelectedTerritory(null);
    setGameState(prev => {
      if (!prev) return prev;
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const nextPlayer = prev.players[nextIndex];
      // Calculate new troops for next player
      const ownedCount = Object.values(prev.territories).filter(t => t.owner === nextPlayer.id).length;
      const newTroops = Math.max(3, Math.floor(ownedCount / 3));
      const updated = {
        ...prev,
        currentPlayerIndex: nextIndex,
        players: prev.players.map(p =>
          p.id === nextPlayer.id ? { ...p, troopsToDeploy: p.troopsToDeploy + newTroops } : p
        ),
        turn: prev.turn + 1,
      };
      return updated;
    });
    setPhase('deploy');
    showMessage('New turn! Deploy your reinforcements.');
  }, []);

  // AI turn logic
  useEffect(() => {
    if (!gameState || gameMode !== 'ai') return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) {
      const timeout = setTimeout(() => {
        const { newState, log } = aiTurn(gameState);
        setGameState(newState);
        showMessage(`AI: ${log}`);
        const nextIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
        const nextPlayer = newState.players[nextIndex];
        const ownedCount = Object.values(newState.territories).filter(t => t.owner === nextPlayer.id).length;
        const newTroops = Math.max(3, Math.floor(ownedCount / 3));
        setGameState(s => ({
          ...s,
          ...newState,
          currentPlayerIndex: nextIndex,
          players: newState.players.map(p =>
            p.id === nextPlayer.id ? { ...p, troopsToDeploy: p.troopsToDeploy + newTroops } : p
          ),
          turn: newState.turn + 1,
        }));
        setPhase('deploy');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [gameState?.currentPlayerIndex, gameState?.turn, gameMode]);

  if (!gameMode) {
    return <GameMenu onStart={startGame} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Crimson Text', serif" }}>
      {/* Header */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, hsl(35,30%,10%) 0%, hsl(35,20%,14%) 100%)' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <h1 className="text-xl font-bold glow-gold" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(43,90%,58%)' }}>
            Realm of Conquest
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <div className="scroll-in px-4 py-1 rounded text-sm font-semibold"
              style={{ background: 'hsl(35,30%,20%)', border: '1px solid hsl(43,90%,58%)', color: 'hsl(40,30%,90%)' }}>
              {message}
            </div>
          )}
          <button onClick={() => { setGameState(null); setGameMode(null); }}
            className="text-sm px-3 py-1 rounded hover:opacity-80 transition-opacity"
            style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)' }}>
            ⬅ Menu
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-2">
          {gameState && (
            <GameBoard
              gameState={gameState}
              selectedTerritory={selectedTerritory}
              phase={phase}
              onTerritoryClick={handleTerritoryClick}
            />
          )}
        </div>
        <div className="w-72 flex-shrink-0">
          {gameState && (
            <GameSidebar
              gameState={gameState}
              phase={phase}
              deployTroops={deployTroops}
              onDeployChange={setDeployTroops}
              onEndPhase={endPhase}
              selectedTerritory={selectedTerritory}
            />
          )}
        </div>
      </div>

      {battle && (
        <BattleModal
          gameState={gameState}
          battle={battle}
          onResult={handleBattleResult}
          onCancel={() => setBattle(null)}
        />
      )}
    </div>
  );
}