import React, { useState, useEffect, useCallback } from 'react';
import GameMenu from '../components/game/GameMenu';
import BattleLog from '../components/game/BattleLog';
import DiplomacyPanel from '../components/game/DiplomacyPanel';
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
  const [battleLog, setBattleLog] = useState([]);
  const [tradeOffers, setTradeOffers] = useState([]);
  const [bottomTab, setBottomTab] = useState('action'); // 'action' | 'diplomacy' | 'log'

  const addMessage = (msg) => setMessages(prev => [...prev.slice(-4), msg]);

  // Called from GameMenu — go to faction select
  const handleMenuStart = (mode, count) => {
    setPendingMode({ mode, playerCount: count || 2 });
  };

  // Called from FactionSelect — actually start the game
  const startGame = (choices, playersArr) => {
    const mode = pendingMode.mode;
    const state = createGameState(mode, choices, playersArr);
    const collected = collectIncome(state);
    setGameState(collected);
    setGameMode(mode);
    setPendingMode(null);
    setPhase('deploy');
    setSelectedTerritory(null);
    setWinner(null);
    setMessages(['⚜️ Rulers of Ardonia begins! Deploy your first reinforcements.']);
    setTradeOffers([]);
    setBottomTab('action');
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
    const attackerTerr = gameState.territories[battle.attackerId];
    const defenderTerr = gameState.territories[battle.defenderId];
    const attackerPlayer = gameState.players.find(p => p.id === attackerTerr.owner);
    const defenderPlayer = gameState.players.find(p => p.id === defenderTerr.owner);
    const conquered = result.defenderLosses >= defenderTerr.troops;

    // Build unit composition from territory unit types (if tracked), else infer from troops
    const buildUnits = (territory, player) => {
      if (territory.units && territory.units.length > 0) {
        const counts = {};
        territory.units.forEach(u => { counts[u] = (counts[u] || 0) + 1; });
        return Object.entries(counts).map(([type, count]) => ({ type, count }));
      }
      // Infer from buildings: if stables → some cavalry, barracks → infantry, else generic
      const buildings = Object.keys(player?.buildings || {});
      const units = [];
      const t = territory.troops;
      if (buildings.includes('stables') && t > 2) {
        const cavCount = Math.min(Math.floor(t * 0.3), 3);
        units.push({ type: 'cavalry', count: cavCount });
        units.push({ type: 'infantry', count: t - cavCount });
      } else if (buildings.includes('barracks')) {
        units.push({ type: 'infantry', count: t });
      } else {
        units.push({ type: 'infantry', count: t });
      }
      return units;
    };

    const logEntry = {
      id: Date.now(),
      turn: gameState.turn,
      attackerName: attackerPlayer?.name || '?',
      attackerColor: attackerPlayer?.color || '#aaa',
      defenderName: defenderPlayer?.name || '?',
      defenderColor: defenderPlayer?.color || '#aaa',
      attackTerritory: attackerTerr.name,
      defendTerritory: defenderTerr.name,
      attackerTroopsBefore: attackerTerr.troops,
      defenderTroopsBefore: defenderTerr.troops,
      attackerLosses: result.attackerLosses,
      defenderLosses: result.defenderLosses,
      attackerUnits: buildUnits(attackerTerr, attackerPlayer),
      defenderUnits: buildUnits(defenderTerr, defenderPlayer),
      fortified: defenderTerr.fortified,
      conquered,
      aRolls: result.aRolls,
      dRolls: result.dRolls,
      aBonus: result.aBonus,
      dBonus: result.dBonus,
    };
    setBattleLog(prev => [...prev, logEntry]);

    const newState = checkObjectives(executeAttack(gameState, battle.attackerId, battle.defenderId, result));
    setGameState(newState);
    setBattle(null);
    if (conquered) {
      addMessage(`🏴 ${defenderTerr.name} has been conquered!`);
    } else {
      addMessage(`⚔️ Battle at ${defenderTerr.name}: A:${result.attackerLosses} lost, D:${result.defenderLosses} lost`);
    }
  };

  const handleDiplomacyAction = ({ type, fromId, toId, offer, request }) => {
    if (type === 'trade_offer') {
      setTradeOffers(prev => [...prev, { fromId, toId, offer, request, id: Date.now() }]);
      const target = gameState.players.find(p => p.id === toId);
      addMessage(`📜 Trade offer sent to ${target?.name}`);
      return;
    }
    // alliance, war, neutral — update diplomacy map on gameState
    const key = [fromId, toId].sort().join('|');
    setGameState(prev => ({ ...prev, diplomacy: { ...(prev.diplomacy || {}), [key]: type } }));
    const target = gameState.players.find(p => p.id === toId);
    const labels = { alliance: '🕊️ Alliance formed', war: '⚔️ War declared', neutral: '🤝 Peace proposed' };
    addMessage(`${labels[type] || type} with ${target?.name}!`);
  };

  const handleAcceptTrade = (offer) => {
    setGameState(prev => {
      const fromPlayer = prev.players.find(p => p.id === offer.fromId);
      const toPlayer = prev.players.find(p => p.id === offer.toId);
      if (!fromPlayer || !toPlayer) return prev;
      // Check fromPlayer can afford offer, toPlayer can afford request
      for (const [k, v] of Object.entries(offer.offer || {})) {
        if ((fromPlayer.resources?.[k] || 0) < v) return prev;
      }
      for (const [k, v] of Object.entries(offer.request || {})) {
        if ((toPlayer.resources?.[k] || 0) < v) return prev;
      }
      const newPlayers = prev.players.map(p => {
        if (p.id === offer.fromId) {
          const res = { ...p.resources };
          Object.entries(offer.offer || {}).forEach(([k, v]) => { res[k] = (res[k] || 0) - v; });
          Object.entries(offer.request || {}).forEach(([k, v]) => { res[k] = (res[k] || 0) + v; });
          return { ...p, resources: res };
        }
        if (p.id === offer.toId) {
          const res = { ...p.resources };
          Object.entries(offer.request || {}).forEach(([k, v]) => { res[k] = (res[k] || 0) - v; });
          Object.entries(offer.offer || {}).forEach(([k, v]) => { res[k] = (res[k] || 0) + v; });
          return { ...p, resources: res };
        }
        return p;
      });
      return { ...prev, players: newPlayers };
    });
    setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
    addMessage(`✅ Trade accepted!`);
  };

  const handleDeclineTrade = (offer) => {
    setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
    addMessage(`❌ Trade declined.`);
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
    if (!gameState || winner) return;
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
      mode={pendingMode.mode}
      playerCount={pendingMode.playerCount}
      onConfirm={(choices, playersArr) => startGame(choices, playersArr)}
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

      {/* Map — full width */}
      <div className="p-2" style={{ background: 'hsl(35,22%,12%)' }}>
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

      {/* Bottom panels — resizable via CSS resize */}
      <div className="flex border-t border-border overflow-hidden" style={{ minHeight: '140px', maxHeight: '45vh', resize: 'vertical', background: 'hsl(35,22%,12%)' }}>
        {/* Players panel */}
        <div className="overflow-y-auto border-r border-border flex-shrink-0" style={{ minWidth: '120px', maxWidth: '40%', resize: 'horizontal', overflow: 'auto', width: '220px' }}>
          <div className="text-xs font-bold px-2 py-1 sticky top-0 z-10" style={{ background: 'hsl(35,22%,14%)', color: 'hsl(43,80%,55%)', fontFamily: "'Cinzel',serif", borderBottom: '1px solid hsl(35,20%,25%)' }}>
            Players
          </div>
          <div className="flex flex-wrap gap-1 p-1">
            {gameState?.players.map((p, i) => (
              <div key={p.id} className="flex-1 min-w-[100px]">
                <PlayerPanel
                  player={p}
                  isActive={i === gameState.currentPlayerIndex}
                  territories={gameState.territories}
                  isSelf={!p.isAI}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex-1 overflow-y-auto border-r border-border">
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

        {/* Battle Log */}
        <div className="overflow-y-auto flex-shrink-0" style={{ width: '220px', minWidth: '180px' }}>
          <BattleLog entries={battleLog} />
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