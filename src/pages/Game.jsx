import React, { useState, useEffect, useCallback } from 'react';
import GameMenu from '../components/game/GameMenu';
import FactionSelect from '../components/game/FactionSelect';
import GameBoard from '../components/game/GameBoard';
import PlayerPanel from '../components/game/PlayerPanel';
import ActionBar from '../components/game/ActionBar';
import BattleModal from '../components/game/BattleModal';
import EventModal from '../components/game/EventModal';
import { createGameState, collectIncome, executeAttack, resolveBattle, doAiTurn, checkObjective } from '../components/game/ardoniaLogic';
import { EVENT_CARDS, BUILDING_DEFS, UNIT_DEFS } from '../components/game/ardoniaData';

export default function Game() {
  const [gameState, setGameState] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [pendingMode, setPendingMode] = useState(null); // mode chosen in menu, waiting for faction select
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [phase, setPhase] = useState('deploy'); // deploy → attack → fortify
  const [battle, setBattle] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [winner, setWinner] = useState(null);

  const addMessage = (msg) => setMessages(prev => [...prev.slice(-4), msg]);

  // Called from GameMenu — go to faction select
  const handleMenuStart = (mode) => {
    setPendingMode(mode);
  };

  // Called from FactionSelect — actually start the game
  const startGame = (mode, choices) => {
    const state = createGameState(mode, choices);
    const collected = collectIncome(state);
    setGameState(collected);
    setGameMode(mode);
    setPendingMode(null);
    setPhase('deploy');
    setSelectedTerritory(null);
    setWinner(null);
    setMessages(['⚜️ Rulers of Ardonia begins! Deploy your first reinforcements.']);
  };

  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];

  // Check for objectives being completed
  const checkObjectives = useCallback((state) => {
    const updated = { ...state };
    updated.players = state.players.map(player => {
      const newCompleted = [...(player.completedObjectives || [])];
      player.objectives.forEach(obj => {
        if (!newCompleted.includes(obj.id) && checkObjective(obj, player, state)) {
          newCompleted.push(obj.id);
          addMessage(`🏆 ${player.name} completed objective: ${obj.category}!`);
        }
      });
      if (newCompleted.length >= 2 && !winner) {
        setWinner(player);
      }
      return { ...player, completedObjectives: newCompleted };
    });
    return updated;
  }, [winner]);

  const handleTerritoryClick = (territoryId) => {
    if (!gameState || winner) return;
    const territory = gameState.territories[territoryId];

    if (phase === 'deploy') {
      if (territory.owner === currentPlayer.id && currentPlayer.troopsToDeploy > 0) {
        setGameState(prev => {
          const next = {
            ...prev,
            territories: {
              ...prev.territories,
              [territoryId]: { ...territory, troops: territory.troops + 1 },
            },
            players: prev.players.map(p =>
              p.id === currentPlayer.id ? { ...p, troopsToDeploy: p.troopsToDeploy - 1 } : p
            ),
          };
          return checkObjectives(next);
        });
      }
    } else if (phase === 'attack') {
      if (!selectedTerritory) {
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          addMessage(`⚔️ Selected ${territory.name} — click an enemy territory to attack`);
        }
      } else if (territoryId === selectedTerritory) {
        setSelectedTerritory(null);
      } else {
        const attacker = gameState.territories[selectedTerritory];
        const adj = gameState.adjacency[selectedTerritory] || [];
        if (territory.owner !== currentPlayer.id && adj.includes(territoryId)) {
          setBattle({ attackerId: selectedTerritory, defenderId: territoryId });
          setSelectedTerritory(null);
        } else if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          addMessage(`⚔️ Selected ${territory.name}`);
        } else {
          addMessage('⛔ Not an adjacent enemy territory');
        }
      }
    } else if (phase === 'fortify') {
      if (!selectedTerritory) {
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          addMessage(`🛡️ Moving from ${territory.name} — pick adjacent friendly territory`);
        }
      } else if (territoryId !== selectedTerritory) {
        const adj = gameState.adjacency[selectedTerritory] || [];
        if (territory.owner === currentPlayer.id && adj.includes(territoryId)) {
          const from = gameState.territories[selectedTerritory];
          const toMove = from.troops - 1;
          setGameState(prev => checkObjectives({
            ...prev,
            territories: {
              ...prev.territories,
              [selectedTerritory]: { ...from, troops: 1 },
              [territoryId]: { ...territory, troops: territory.troops + toMove },
            },
          }));
          setSelectedTerritory(null);
          addMessage(`🛡️ Moved ${toMove} troops to ${territory.name}`);
        } else if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
        }
      }
    }
  };

  const handleBuild = (buildingId) => {
    const def = BUILDING_DEFS[buildingId];
    if (!def) return;
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const cost = def.cost || {};
      // Check afford
      for (const [k, v] of Object.entries(cost)) {
        if ((player.resources[k] ?? player[k] ?? 0) < v) return prev;
      }
      const newResources = { ...player.resources };
      const newPlayer = { ...player };
      for (const [k, v] of Object.entries(cost)) {
        if (k === 'ip') newPlayer.ip = (newPlayer.ip || 0) - v;
        else if (k === 'sp') newPlayer.sp = (newPlayer.sp || 0) - v;
        else newResources[k] = (newResources[k] || 0) - v;
      }
      newPlayer.resources = newResources;
      newPlayer.buildings = { ...player.buildings, [buildingId]: { ...def, level: 1, disabled: false } };
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
    });
    addMessage(`🏗️ Built ${buildingId}!`);
  };

  const handleRecruit = (unitId) => {
    const def = UNIT_DEFS[unitId];
    if (!def) return;
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const cost = def.cost || {};
      const newResources = { ...player.resources };
      for (const [k, v] of Object.entries(cost)) {
        if ((newResources[k] ?? 0) < v) return prev;
        newResources[k] -= v;
      }
      // Add troop to capital or first owned territory
      const capital = Object.values(prev.territories).find(t => t.owner === player.id && t.isCapital)
        || Object.values(prev.territories).find(t => t.owner === player.id);
      if (!capital) return prev;
      return {
        ...prev,
        players: prev.players.map(p => p.id === player.id ? { ...p, resources: newResources } : p),
        territories: { ...prev.territories, [capital.id]: { ...capital, troops: capital.troops + 1 } },
      };
    });
    addMessage(`⚔️ Recruited ${unitId} to your capital!`);
  };

  const handleBattleResult = (result) => {
    const newState = checkObjectives(executeAttack(gameState, battle.attackerId, battle.defenderId, result));
    setGameState(newState);
    setBattle(null);
    const defender = gameState.territories[battle.defenderId];
    if (result.defenderLosses >= defender.troops) {
      addMessage(`🏴 ${defender.name} has been conquered!`);
    } else {
      addMessage(`⚔️ Battle at ${defender.name}: A:${result.attackerLosses} lost, D:${result.defenderLosses} lost`);
    }
  };

  const advancePhase = () => {
    if (phase === 'deploy') {
      if (currentPlayer.troopsToDeploy > 0) {
        addMessage('⚠️ Deploy all troops first!');
        return;
      }
      setPhase('attack');
      addMessage('⚔️ Attack phase — select your territory to attack from');
    } else if (phase === 'attack') {
      setSelectedTerritory(null);
      setPhase('fortify');
      addMessage('🛡️ Fortify — move troops between adjacent friendly territories');
    } else {
      endTurn();
    }
  };

  const endTurn = useCallback(() => {
    setSelectedTerritory(null);
    setGameState(prev => {
      if (!prev) return prev;
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const nextPlayer = prev.players[nextIndex];
      const ownedCount = Object.values(prev.territories).filter(t => t.owner === nextPlayer.id).length;
      const newTroops = Math.max(3, Math.floor(ownedCount / 3));
      // Decrement event countdown
      let eventCountdown = (prev.eventCountdown || 3) - 1;
      let eventTrigger = null;
      if (eventCountdown <= 0) {
        const shuffled = [...EVENT_CARDS].sort(() => Math.random() - 0.5);
        eventTrigger = shuffled[0];
        eventCountdown = 3;
      }

      let state = {
        ...prev,
        currentPlayerIndex: nextIndex,
        players: prev.players.map(p =>
          p.id === nextPlayer.id ? { ...p, troopsToDeploy: p.troopsToDeploy + newTroops } : p
        ),
        turn: prev.turn + (nextIndex === 0 ? 1 : 0),
        eventCountdown,
      };

      state = collectIncome(state);

      if (eventTrigger) {
        setActiveEvent(eventTrigger);
      }

      return checkObjectives(state);
    });
    setPhase('deploy');
    addMessage('🔄 New turn — deploy your reinforcements');
  }, [checkObjectives]);

  // AI turn logic
  useEffect(() => {
    if (!gameState || gameMode !== 'ai' || winner) return;
    const cp = gameState.players[gameState.currentPlayerIndex];
    if (!cp.isAI) return;
    const timeout = setTimeout(() => {
      const newState = doAiTurn(gameState);
      setGameState(checkObjectives(newState));
      (newState.log || []).slice(-3).forEach(l => addMessage(l));
      // End AI turn
      const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      const nextP = gameState.players[nextIndex];
      const ownedCount = Object.values(newState.territories).filter(t => t.owner === nextP.id).length;
      const newTroops = Math.max(3, Math.floor(ownedCount / 3));
      setGameState(s => collectIncome({
        ...s,
        currentPlayerIndex: nextIndex,
        players: s.players.map(p => p.id === nextP.id ? { ...p, troopsToDeploy: p.troopsToDeploy + newTroops } : p),
        turn: s.turn + (nextIndex === 0 ? 1 : 0),
      }));
      setPhase('deploy');
    }, 1800);
    return () => clearTimeout(timeout);
  }, [gameState?.currentPlayerIndex, gameState?.turn, gameMode, winner]);

  if (!gameMode && !pendingMode) return <GameMenu onStart={handleMenuStart} />;
  if (pendingMode && !gameMode) return (
    <FactionSelect
      mode={pendingMode}
      onConfirm={(choices) => startGame(pendingMode, choices)}
      onBack={() => setPendingMode(null)}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: "'Crimson Text', serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border"
        style={{ background: 'linear-gradient(135deg, hsl(35,30%,10%), hsl(35,20%,14%))' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚜️</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
            Rulers of Ardonia
          </h1>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'hsl(35,20%,22%)', color: 'hsl(40,20%,60%)', border: '1px solid hsl(35,20%,30%)' }}>
            Turn {gameState?.turn}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <div className="text-xs px-3 py-1 rounded max-w-xs truncate"
              style={{ background: 'hsl(35,25%,18%)', border: '1px solid hsl(43,70%,40%)', color: 'hsl(43,80%,75%)' }}>
              {messages[messages.length - 1]}
            </div>
          )}
          <button onClick={() => { setGameState(null); setGameMode(null); setPendingMode(null); }}
            className="text-xs px-3 py-1.5 rounded hover:opacity-80"
            style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)' }}>
            ⬅ Menu
          </button>
        </div>
      </div>

      {/* Winner banner */}
      {winner && (
        <div className="text-center py-3 text-lg font-bold animate-pulse"
          style={{ background: 'hsl(43,80%,30%)', color: 'hsl(43,90%,85%)', fontFamily: "'Cinzel',serif" }}>
          🏆 {winner.name} of the {winner.faction?.name} has conquered Ardonia! 🏆
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Player panels */}
        <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-border"
          style={{ background: 'hsl(35,22%,12%)' }}>
          {gameState?.players.map((p, i) => (
            <PlayerPanel
              key={p.id}
              player={p}
              isActive={i === gameState.currentPlayerIndex}
              territories={gameState.territories}
              isSelf={!p.isAI}
            />
          ))}
        </div>

        {/* Center: Map */}
        <div className="flex-1 overflow-auto p-3 flex flex-col gap-3">
          {gameState && (
            <GameBoard
              gameState={gameState}
              selectedTerritory={selectedTerritory}
              phase={phase}
              currentPlayer={currentPlayer}
              onTerritoryClick={handleTerritoryClick}
            />
          )}
        </div>

        {/* Right: Action bar */}
        <div className="w-56 flex-shrink-0 border-l border-border overflow-y-auto"
          style={{ background: 'hsl(35,22%,12%)' }}>
          {gameState && currentPlayer && (
            <ActionBar
              gameState={gameState}
              currentPlayer={currentPlayer}
              phase={phase}
              onAdvancePhase={advancePhase}
              isAI={currentPlayer.isAI}
              onBuild={handleBuild}
              onRecruit={handleRecruit}
            />
          )}
        </div>
      </div>

      {battle && gameState && (
        <BattleModal
          gameState={gameState}
          battle={battle}
          onResult={handleBattleResult}
          onCancel={() => setBattle(null)}
        />
      )}

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </div>
  );
}