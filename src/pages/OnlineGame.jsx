import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import FactionSelect from '../components/game/FactionSelect';
import GameBoard from '../components/game/GameBoard';
import PlayerPanel from '../components/game/PlayerPanel';
import ActionBar from '../components/game/ActionBar';
import BattleModal from '../components/game/BattleModal';
import EventModal from '../components/game/EventModal';
import BattleLog from '../components/game/BattleLog';
import DiplomacyPanel from '../components/game/DiplomacyPanel';
import HeroPanel from '../components/game/HeroPanel';
import { createGameState, collectIncome, executeAttack, resolveBattle, checkObjective } from '../components/game/ardoniaLogic';
import { EVENT_CARDS, BUILDING_DEFS, UNIT_DEFS, HEROES } from '../components/game/ardoniaData';

export default function OnlineGame({ session: initialSession, onLeave }) {
  const [session, setSession] = useState(initialSession);
  const [user, setUser] = useState(null);
  const [gameState, setGameStateLocal] = useState(null);
  const [phase, setPhase] = useState('deploy');
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [battle, setBattle] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [tradeOffers, setTradeOffers] = useState([]);
  const [bottomTab, setBottomTab] = useState('action');
  const savingRef = useRef(false);

  const addMessage = (msg) => setMessages(prev => [...prev.slice(-4), msg]);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Subscribe to session changes (other players' moves)
  useEffect(() => {
    if (!session?.id) return;
    const unsub = base44.entities.GameSession.subscribe((event) => {
      if (event.id !== session.id) return;
      const updated = event.data;
      setSession(updated);
      if (updated.game_state && !savingRef.current) {
        setGameStateLocal(updated.game_state);
        setPhase(updated.game_state._phase || 'deploy');
      }
      if (updated.winner_user_id) {
        const wp = updated.game_state?.players?.find(p => p.userId === updated.winner_user_id);
        setWinner(wp || { name: 'Someone' });
      }
    });
    return unsub;
  }, [session?.id]);

  // Persist game state to DB
  const saveGameState = useCallback(async (gs, extraFields = {}) => {
    if (!session?.id) return;
    savingRef.current = true;
    const cp = gs.players[gs.currentPlayerIndex];
    await base44.entities.GameSession.update(session.id, {
      game_state: { ...gs, _phase: phase },
      current_player_user_id: cp?.userId || '',
      turn: gs.turn,
      ...extraFields,
    });
    savingRef.current = false;
  }, [session?.id, phase]);

  // Initialize game from session (host triggers this)
  const handleFactionConfirm = async (choices, playersArr) => {
    const state = createGameState('multiplayer', choices, playersArr);
    const collected = collectIncome(state);
    // Attach userIds to players from session
    const enriched = {
      ...collected,
      players: collected.players.map((p, i) => ({
        ...p,
        userId: session.players_info?.[i]?.userId || p.id,
      })),
      _phase: 'deploy',
    };
    setGameStateLocal(enriched);
    setPhase('deploy');
    setMessages(['⚜️ Rulers of Ardonia begins!']);
    await base44.entities.GameSession.update(session.id, {
      status: 'playing',
      game_state: enriched,
      current_player_user_id: enriched.players[0]?.userId || '',
      turn: 1,
    });
  };

  const myPlayer = gameState && user
    ? gameState.players.find(p => p.userId === user.id)
    : null;
  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
  const isMyTurn = currentPlayer?.userId === user?.id;

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
        base44.entities.GameSession.update(session.id, { status: 'finished', winner_user_id: player.userId });
      }
      return { ...player, completedObjectives: newCompleted };
    });
    return updated;
  }, [winner, session?.id]);

  const updateAndSave = useCallback(async (newState, extraFields = {}) => {
    const checked = checkObjectives(newState);
    setGameStateLocal(checked);
    await saveGameState({ ...checked, _phase: phase }, extraFields);
  }, [checkObjectives, saveGameState, phase]);

  const handleTerritoryClick = async (territoryId) => {
    if (!gameState || winner || !isMyTurn) return;
    const territory = gameState.territories[territoryId];

    if (phase === 'deploy') {
      if (territory.owner === currentPlayer.id && currentPlayer.troopsToDeploy > 0) {
        const newState = {
          ...gameState,
          territories: { ...gameState.territories, [territoryId]: { ...territory, troops: territory.troops + 1 } },
          players: gameState.players.map(p =>
            p.id === currentPlayer.id ? { ...p, troopsToDeploy: p.troopsToDeploy - 1 } : p
          ),
        };
        await updateAndSave(newState);
      }
    } else if (phase === 'attack') {
      if (!selectedTerritory) {
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          addMessage(`⚔️ Selected ${territory.name}`);
        }
      } else if (territoryId === selectedTerritory) {
        setSelectedTerritory(null);
      } else {
        const adj = gameState.adjacency[selectedTerritory] || [];
        if (territory.owner !== currentPlayer.id && adj.includes(territoryId)) {
          setBattle({ attackerId: selectedTerritory, defenderId: territoryId });
          setSelectedTerritory(null);
        } else if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
        }
      }
    } else if (phase === 'fortify') {
      if (!selectedTerritory) {
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          setSelectedTerritory(territoryId);
          addMessage(`🛡️ Moving from ${territory.name}`);
        }
      } else if (territoryId !== selectedTerritory) {
        const adj = gameState.adjacency[selectedTerritory] || [];
        if (territory.owner === currentPlayer.id && adj.includes(territoryId)) {
          const from = gameState.territories[selectedTerritory];
          const toMove = from.troops - 1;
          const newState = {
            ...gameState,
            territories: {
              ...gameState.territories,
              [selectedTerritory]: { ...from, troops: 1 },
              [territoryId]: { ...territory, troops: territory.troops + toMove },
            },
          };
          setSelectedTerritory(null);
          addMessage(`🛡️ Moved ${toMove} troops`);
          await updateAndSave(newState);
        }
      }
    }
  };

  const handleBattleResult = async (result) => {
    const newState = checkObjectives(executeAttack(gameState, battle.attackerId, battle.defenderId, result));
    const conquered = result.defenderLosses >= gameState.territories[battle.defenderId].troops;
    setBattleLog(prev => [...prev, {
      id: Date.now(), turn: gameState.turn,
      attackTerritory: gameState.territories[battle.attackerId].name,
      defendTerritory: gameState.territories[battle.defenderId].name,
      attackerLosses: result.attackerLosses, defenderLosses: result.defenderLosses,
      conquered, aRolls: result.aRolls, dRolls: result.dRolls,
    }]);
    setBattle(null);
    if (conquered) addMessage(`🏴 Territory conquered!`);
    else addMessage(`⚔️ Battle: A:${result.attackerLosses} D:${result.defenderLosses} lost`);
    await updateAndSave(newState);
  };

  const advancePhase = async () => {
    if (phase === 'deploy') {
      if (currentPlayer.troopsToDeploy > 0) { addMessage('⚠️ Deploy all troops first!'); return; }
      setPhase('attack');
      await saveGameState({ ...gameState, _phase: 'attack' });
      addMessage('⚔️ Attack phase');
    } else if (phase === 'attack') {
      setSelectedTerritory(null);
      setPhase('fortify');
      await saveGameState({ ...gameState, _phase: 'fortify' });
      addMessage('🛡️ Fortify phase');
    } else {
      await endTurn();
    }
  };

  const endTurn = async () => {
    setSelectedTerritory(null);
    const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextIndex];
    const ownedCount = Object.values(gameState.territories).filter(t => t.owner === nextPlayer.id).length;
    const newTroops = Math.max(3, Math.floor(ownedCount / 3));

    let eventCountdown = (gameState.eventCountdown || 3) - 1;
    let eventTrigger = null;
    if (eventCountdown <= 0) {
      eventTrigger = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
      eventCountdown = 3;
      setActiveEvent(eventTrigger);
    }

    let state = {
      ...gameState,
      currentPlayerIndex: nextIndex,
      players: gameState.players.map(p =>
        p.id === nextPlayer.id ? { ...p, troopsToDeploy: (p.troopsToDeploy || 0) + newTroops } : p
      ),
      turn: gameState.turn + (nextIndex === 0 ? 1 : 0),
      eventCountdown,
      _phase: 'deploy',
    };
    state = collectIncome(state);
    const checked = checkObjectives(state);
    setGameStateLocal(checked);
    setPhase('deploy');
    addMessage('🔄 New turn');
    await saveGameState(checked, { current_player_user_id: nextPlayer.userId || '' });
  };

  const handleBuild = async (buildingId) => {
    const def = BUILDING_DEFS[buildingId];
    if (!def) return;
    const player = gameState.players.find(p => p.id === currentPlayer.id);
    const cost = def.cost || {};
    for (const [k, v] of Object.entries(cost)) {
      if ((player.resources[k] ?? player[k] ?? 0) < v) return;
    }
    const newResources = { ...player.resources };
    let newIp = player.ip ?? 0, newSp = player.sp ?? 0;
    for (const [k, v] of Object.entries(cost)) {
      if (k === 'ip') newIp -= v;
      else if (k === 'sp') newSp -= v;
      else newResources[k] = (newResources[k] || 0) - v;
    }
    const newPlayer = { ...player, resources: newResources, ip: newIp, sp: newSp, buildings: { ...player.buildings, [buildingId]: { ...def, level: 1, disabled: false } } };
    await updateAndSave({ ...gameState, players: gameState.players.map(p => p.id === currentPlayer.id ? newPlayer : p) });
    addMessage(`🏗️ Built ${buildingId}!`);
  };

  const handleRecruit = async (unitId) => {
    const def = UNIT_DEFS[unitId];
    if (!def) return;
    const player = gameState.players.find(p => p.id === currentPlayer.id);
    const newResources = { ...player.resources };
    for (const [k, v] of Object.entries(def.cost || {})) {
      if ((newResources[k] ?? 0) < v) return;
      newResources[k] -= v;
    }
    const capital = Object.values(gameState.territories).find(t => t.owner === player.id && t.isCapital)
      || Object.values(gameState.territories).find(t => t.owner === player.id);
    if (!capital) return;
    await updateAndSave({
      ...gameState,
      players: gameState.players.map(p => p.id === player.id ? { ...p, resources: newResources } : p),
      territories: { ...gameState.territories, [capital.id]: { ...capital, troops: capital.troops + 1 } },
    });
    addMessage(`⚔️ Recruited ${unitId}!`);
  };

  const handlePlayCard = async (card) => {
    const player = gameState.players.find(p => p.id === currentPlayer.id);
    const newResources = { ...player.resources };
    let newIp = player.ip ?? 0, newSp = player.sp ?? 0;
    for (const [k, v] of Object.entries(card.cost || {})) {
      if (k === 'ip') newIp -= v;
      else if (k === 'sp') newSp -= v;
      else newResources[k] = (newResources[k] || 0) - v;
    }
    if (card.id === 'faith_surge') newSp = Math.min(10, newSp + 3);
    await updateAndSave({ ...gameState, players: gameState.players.map(p => p.id === currentPlayer.id ? { ...p, resources: newResources, ip: newIp, sp: newSp } : p) });
    addMessage(`🃏 Played ${card.name}`);
  };

  const handleRecruitHero = async (heroId) => {
    const hero = HEROES[heroId];
    if (!hero) return;
    const player = gameState.players.find(p => p.id === currentPlayer.id);
    if (player.heroes?.includes(heroId)) return;
    const newResources = { ...player.resources };
    let newIp = player.ip ?? 0, newSp = player.sp ?? 0;
    for (const [k, v] of Object.entries(hero.cost || {})) {
      if (k === 'ip') { if (newIp < v) return; newIp -= v; }
      else if (k === 'sp') { if (newSp < v) return; newSp -= v; }
      else { if ((newResources[k] || 0) < v) return; newResources[k] -= v; }
    }
    const newPlayer = { ...player, resources: newResources, ip: newIp, sp: newSp, heroes: [...(player.heroes || []), heroId], heroStatus: { ...(player.heroStatus || {}), [heroId]: { exhausted: false, imprisoned: false } } };
    await updateAndSave({ ...gameState, players: gameState.players.map(p => p.id === currentPlayer.id ? newPlayer : p) });
    addMessage(`⭐ ${hero.name} recruited!`);
  };

  const handleAssignHero = async (heroId, territoryId) => {
    const newTerritories = {};
    Object.entries(gameState.territories).forEach(([id, t]) => {
      newTerritories[id] = t.heroId === heroId ? { ...t, heroId: null } : { ...t };
    });
    newTerritories[territoryId] = { ...newTerritories[territoryId], heroId };
    await updateAndSave({ ...gameState, territories: newTerritories });
  };

  const handleDiplomacyAction = async ({ type, fromId, toId, offer, request }) => {
    if (type === 'trade_offer') {
      setTradeOffers(prev => [...prev, { fromId, toId, offer, request, id: Date.now() }]);
      return;
    }
    const key = [fromId, toId].sort().join('|');
    await updateAndSave({ ...gameState, diplomacy: { ...(gameState.diplomacy || {}), [key]: type } });
  };

  const handleAcceptTrade = (offer) => {
    setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
    addMessage('✅ Trade accepted!');
  };

  const handleDeclineTrade = (offer) => {
    setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
  };

  // Show faction select for host before game starts
  if (session.status === 'faction_select' && !gameState) {
    const isHost = session.players_info?.[0]?.userId === user?.id;
    if (isHost) {
      return (
        <FactionSelect
          mode="multiplayer"
          playerCount={session.player_count}
          onConfirm={handleFactionConfirm}
          onBack={onLeave}
        />
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(35,25%,10%)' }}>
          <div className="text-center">
            <div className="text-5xl mb-4 animate-pulse">⚜️</div>
            <div className="text-xl font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
              Host is setting up the game...
            </div>
          </div>
        </div>
      );
    }
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(35,25%,10%)' }}>
        <div className="text-5xl animate-spin">⚙️</div>
      </div>
    );
  }

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
          <span className="text-xs px-2 py-0.5 rounded ml-1" style={{ background: 'hsl(200,40%,20%)', color: 'hsl(200,60%,70%)', border: '1px solid hsl(200,40%,30%)' }}>
            🌐 Online
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isMyTurn ? (
            <span className="text-xs px-2 py-1 rounded font-bold animate-pulse" style={{ background: 'hsl(43,60%,25%)', color: 'hsl(43,90%,65%)' }}>
              Your Turn
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded" style={{ background: 'hsl(35,20%,20%)', color: 'hsl(40,20%,50%)' }}>
              {currentPlayer?.name}'s Turn
            </span>
          )}
          {messages.length > 0 && (
            <div className="text-xs px-3 py-1 rounded max-w-xs truncate"
              style={{ background: 'hsl(35,25%,18%)', border: '1px solid hsl(43,70%,40%)', color: 'hsl(43,80%,75%)' }}>
              {messages[messages.length - 1]}
            </div>
          )}
          <button onClick={onLeave}
            className="text-xs px-3 py-1.5 rounded hover:opacity-80"
            style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)' }}>
            ⬅ Menu
          </button>
        </div>
      </div>

      {winner && (
        <div className="text-center py-3 text-lg font-bold animate-pulse"
          style={{ background: 'hsl(43,80%,30%)', color: 'hsl(43,90%,85%)', fontFamily: "'Cinzel',serif" }}>
          🏆 {winner.name} has conquered Ardonia! 🏆
        </div>
      )}

      <div className="p-2" style={{ background: 'hsl(35,22%,12%)' }}>
        <GameBoard
          gameState={gameState}
          selectedTerritory={selectedTerritory}
          phase={isMyTurn ? phase : 'view'}
          currentPlayer={currentPlayer}
          onTerritoryClick={handleTerritoryClick}
        />
      </div>

      <div className="flex border-t border-border overflow-hidden" style={{ minHeight: '140px', maxHeight: '45vh', background: 'hsl(35,22%,12%)' }}>
        <div className="overflow-y-auto border-r border-border flex-shrink-0" style={{ width: '200px' }}>
          <div className="text-xs font-bold px-2 py-1 sticky top-0 z-10" style={{ background: 'hsl(35,22%,14%)', color: 'hsl(43,80%,55%)', fontFamily: "'Cinzel',serif", borderBottom: '1px solid hsl(35,20%,25%)' }}>Players</div>
          <div className="flex flex-wrap gap-1 p-1">
            {gameState.players.map((p, i) => (
              <div key={p.id} className="flex-1 min-w-[100px]">
                <PlayerPanel player={p} isActive={i === gameState.currentPlayerIndex} territories={gameState.territories} isSelf={p.userId === user?.id} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-border flex-shrink-0" style={{ background: 'hsl(35,22%,13%)' }}>
            {[
              { id: 'action', icon: '⚔️', label: 'Action' },
              { id: 'heroes', icon: '⭐', label: 'Heroes' },
              { id: 'diplomacy', icon: '🕊️', label: 'Diplomacy' },
              { id: 'log', icon: '📜', label: 'Battle Log' },
            ].map(t => (
              <button key={t.id} onClick={() => setBottomTab(t.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all"
                style={{
                  fontFamily: "'Cinzel',serif",
                  background: bottomTab === t.id ? 'hsl(38,60%,22%)' : 'transparent',
                  color: bottomTab === t.id ? 'hsl(43,90%,65%)' : 'hsl(40,20%,48%)',
                  borderBottom: bottomTab === t.id ? '2px solid hsl(43,80%,55%)' : '2px solid transparent',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {bottomTab === 'action' && isMyTurn && (
              <ActionBar
                gameState={gameState}
                currentPlayer={currentPlayer}
                phase={phase}
                onAdvancePhase={advancePhase}
                isAI={false}
                onBuild={handleBuild}
                onRecruit={handleRecruit}
                onPlayCard={handlePlayCard}
              />
            )}
            {bottomTab === 'action' && !isMyTurn && (
              <div className="flex items-center justify-center h-full text-sm opacity-40" style={{ color: 'hsl(40,20%,60%)' }}>
                Waiting for {currentPlayer?.name} to play...
              </div>
            )}
            {bottomTab === 'heroes' && isMyTurn && myPlayer && (
              <HeroPanel gameState={gameState} currentPlayer={currentPlayer} onRecruit={handleRecruitHero} onAssign={handleAssignHero} />
            )}
            {bottomTab === 'diplomacy' && isMyTurn && (
              <DiplomacyPanel gameState={gameState} currentPlayer={currentPlayer} onDiplomacyAction={handleDiplomacyAction} tradeOffers={tradeOffers} onAcceptTrade={handleAcceptTrade} onDeclineTrade={handleDeclineTrade} />
            )}
            {bottomTab === 'log' && <BattleLog entries={battleLog} />}
          </div>
        </div>
      </div>

      {battle && isMyTurn && (
        <BattleModal gameState={gameState} battle={battle} onResult={handleBattleResult} onCancel={() => setBattle(null)} />
      )}
      {activeEvent && (
        <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}
    </div>
  );
}