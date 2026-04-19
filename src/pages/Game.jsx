import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameMenu from '../components/game/GameMenu';
import Lobby from '../components/game/Lobby';
import OnlineGame from './OnlineGame';
import HeroPanel from '../components/game/HeroPanel';
import { createInitialProvinceState } from '../components/game/provinceSystem';
import { HEROES, LEADERS } from '../components/game/ardoniaData';
import { getHeroCombatBonus } from '../components/game/ardoniaLogic';
import { HexUtils, canUnitEnter, getReachableHexes, findMovementPath, UNIT_SPEED } from '../components/game/hexGridSystem';
import FactionSelectStep from '../components/game/FactionSelectStep';
import ObjectivesStep from '../components/game/ObjectivesStep';
import LeaderSelectStep from '../components/game/LeaderSelectStep';
import GameBoard from '../components/game/GameBoard';
import HexMap from '../components/game/HexMap';
import PlayerPanel from '../components/game/PlayerPanel';
import ActionBar from '../components/game/ActionBar';
import BattleModal from '../components/game/BattleModal';
import EventModal from '../components/game/EventModal';
import { createGameState, collectIncome, executeAttack, resolveBattle, doAiTurn, getAiTurnSteps, checkObjective, calculateUnitBonuses, applyEventEffect } from '../components/game/ardoniaLogic';
import mapData from '../components/game/ardonia_game_map.json';
import { FACTION_TO_NATION_ID } from '../components/game/ardoniaData';
import UnifiedLog from '../components/game/UnifiedLog';

// Build a lookup: hexId ("col,row") -> nation_id and terrain from map data
const HEX_NATION_LOOKUP = {};
const HEX_TERRAIN_LOOKUP = {};
mapData.hex_grid.forEach(h => {
  HEX_NATION_LOOKUP[`${h.col},${h.row}`] = h.nation_id;
  HEX_TERRAIN_LOOKUP[`${h.col},${h.row}`] = h.terrain;
});

function canDeployUnit(hexId, unitType) {
  const terrain = HEX_TERRAIN_LOOKUP[hexId];
  if (!terrain) return false;
  if (unitType === 'naval') return terrain === 'water' || terrain === 'coastal';
  return terrain !== 'water';
}

// BFS reachable hexes from a col,row hex given movement speed
// waterOnly=true: only traverse water hexes (for naval units like Reapership)
// waterOnly=false: only traverse non-water hexes (land units), but allow adjacent water for embarkation
function computeReachableHexes(fromHexId, speed, waterOnly = false) {
  const [col0, row0] = fromHexId.split(',').map(Number);
  const visited = new Map([[fromHexId, 0]]);
  const queue = [{ col: col0, row: row0, cost: 0 }];
  while (queue.length > 0) {
    const { col: gc, row: gr, cost } = queue.shift();
    const even = gc % 2 === 0;
    const neighbors = [
      [gc+1, even ? gr-1 : gr], [gc+1, even ? gr : gr+1],
      [gc-1, even ? gr-1 : gr], [gc-1, even ? gr : gr+1],
      [gc, gr-1], [gc, gr+1],
    ];
    for (const [nc, nr] of neighbors) {
      const nId = `${nc},${nr}`;
      const terrain = HEX_TERRAIN_LOOKUP[nId];
      if (!terrain) continue;
      if (waterOnly && terrain !== 'water') continue;
      // For land units: allow water hexes only if adjacent (cost 1) for embarkation
      if (!waterOnly && terrain === 'water' && cost >= 1) continue;
      const newCost = cost + 1;
      if (newCost <= speed && !visited.has(nId)) {
        visited.set(nId, newCost);
        queue.push({ col: nc, row: nr, cost: newCost });
      }
    }
  }
  visited.delete(fromHexId);
  return visited; // Map of hexId -> cost
}

// Determine if a unit is water-only
function isWaterOnlyUnit(unitType) {
  return unitType === 'naval' || unitType === 'infamous_reapership';
}
import BuildRecruitPanel from '../components/game/BuildRecruitPanel';
import RecruitPanel from '../components/game/RecruitPanel';
import { EVENT_CARDS, BUILDING_DEFS, UNIT_DEFS, AVATARS, ACTION_CARDS } from '../components/game/ardoniaData';
import AvatarPanel from '../components/game/AvatarPanel';
import AiSetupModal from '../components/game/AiSetupModal';
import AdvisorPanel from '../components/game/AdvisorPanel';
import EffectsPanel from '../components/game/EffectsPanel';
import MiniMap from '../components/game/MiniMap';
import { NATION_PERSONALITIES, scoreTradeOffer, shouldAcceptAlliance, shouldDeclareWar, initializeSentiment, decaySentiment, applyEventSentiment, executeInfluenceAction, tickInfluenceModifiers, getSentimentLabel } from '../components/game/aiPersonalities';
import DiplomacyInfluenceMergedPanel from '../components/game/DiplomacyInfluenceMergedPanel';
import CardPlayOverlay from '../components/game/CardPlayOverlay';
import { applyInstantCardEffects, getPlayerCombatCardBonus } from '../components/game/cardEffects';
import { buildPlayCardHandler } from '../lib/cardHandler';
import { isNavalUnit, isLandUnit, embarkUnits } from '../lib/embarkationLogic';
import { processEmbarkMovement } from '../lib/embarkMovementHandler';
import MarketPanel from '../components/game/MarketPanel';
import SilverUnionMenu from '../components/game/SilverUnionMenu';
import TopBar from '../components/game/TopBar';

export default function Game() {
  const [gameState, setGameState] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);
  const [setupStep, setSetupStep] = useState(null); // 'faction' → 'objectives' → 'leader'
  const [setupPlayers, setSetupPlayers] = useState(null);
  const [gameStartMode, setGameStartMode] = useState(null); // preserve mode through setup
  const [showLobby, setShowLobby] = useState(false);
  const [showAiSetup, setShowAiSetup] = useState(false);
  const [onlineSession, setOnlineSession] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [phase, setPhase] = useState('deploy'); // deploy → move → attack → fortify
  const [battle, setBattle] = useState(null);
  const [hexBattle, setHexBattle] = useState(null); // { attackerHexId, defenderHexId, pendingMove: { fromHexId, unitsToMove, remainingFromUnits } }
  const [activeEvent, setActiveEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  // Movement state: { fromHexId, selectedUnit (type string), speed }
  const [movementState, setMovementState] = useState(null);
  const [movedHexes, setMovedHexes] = useState(new Set()); // hexIds that already moved this turn
  const [tradeOffers, setTradeOffers] = useState([]);

  const [highlightMyTerritories, setHighlightMyTerritories] = useState(false);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState(null);
  const [provinces, setProvinces] = useState(null);
  const [buildingPlacementMode, setBuildingPlacementMode] = useState(null); // 'fortress' | 'port' | null
  const [sentiment, setSentiment] = useState(null); // sentiment[fromId][toId] = number
  const [turnLog, setTurnLog] = useState([]);
  const hexMapRef = useRef(null);
  const [mapZoomTransform, setMapZoomTransform] = useState(null);
  const isAiRunningRef = useRef(false);
  const [cardPlayAnnouncement, setCardPlayAnnouncement] = useState(null); // { card, playerName, playerColor }
  const [marketOrders, setMarketOrders] = useState([]);
  const menuAudioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showDiplomacyInfluenceModal, setShowDiplomacyInfluenceModal] = useState(false);
  const [showInfluenceOverlay, setShowInfluenceOverlay] = useState(false);
  const [showSilverUnionMenu, setShowSilverUnionMenu] = useState(false);
  const [openModal, setOpenModal] = useState(null); // 'action' | 'build' | 'recruit' | 'heroes' | 'avatars' | 'effects' | 'unifiedlog' | 'advisor' | 'market' | null
  const [draggingDeployUnit, setDraggingDeployUnit] = useState(null); // unit type being dragged for deploy

  const toggleMusic = () => {
    const audio = menuAudioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.volume = 0.3;
      audio.play().catch(() => {});
      setMusicPlaying(true);
    }
  };

  // Initialize provinces on game start
  useEffect(() => {
    if (gameState && !provinces) {
      const { provinces: initProvinces } = createInitialProvinceState(gameState);
      setProvinces(initProvinces);
    }
  }, [gameState, provinces]);

  // Reorder pendingUnits so the selected type comes first
  const handleSelectDeployUnit = (unitType) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === prev.players[prev.currentPlayerIndex].id);
      const pending = [...(player.pendingUnits || [])];
      const idx = pending.indexOf(unitType);
      if (idx <= 0) return prev; // already first or not found
      pending.splice(idx, 1);
      pending.unshift(unitType);
      return { ...prev, players: prev.players.map(p => p.id === player.id ? { ...p, pendingUnits: pending } : p) };
    });
  };

  const addMessage = (msg) => setMessages(prev => [...prev.slice(-4), msg]);

  const addLog = (type, text, detail, phase, playerName) => {
    setTurnLog(prev => [...prev, { type, text, detail, phase, playerName: playerName || currentPlayer?.name, playerColor: currentPlayer?.color, turn: null }]);
  };

  // Market operations
  const handlePlaceMarketOrder = (order) => {
    const orderId = Date.now();
    setMarketOrders(prev => [...prev, { ...order, id: orderId, completed: false }]);
    
    if (order.type === 'buy') {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === currentPlayer.id 
          ? { ...p, resources: { ...p.resources, gold: (p.resources.gold || 0) - (order.quantity * order.price) } }
          : p
        ),
      }));
      addMessage(`📥 Buy order placed: ${order.quantity}x ${order.resource} @ ${order.price.toFixed(2)} each`);
    } else {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === currentPlayer.id 
          ? { ...p, resources: { ...p.resources, [order.resource]: (p.resources[order.resource] || 0) - order.quantity } }
          : p
        ),
      }));
      addMessage(`📤 Sell order placed: ${order.quantity}x ${order.resource} @ ${order.price.toFixed(2)} each`);
    }
  };

  const handleCancelMarketOrder = (orderId) => {
    const order = marketOrders.find(o => o.id === orderId);
    if (!order) return;
    
    setMarketOrders(prev => prev.filter(o => o.id !== orderId));
    
    if (order.type === 'buy') {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === order.playerId 
          ? { ...p, resources: { ...p.resources, gold: (p.resources.gold || 0) + (order.quantity * order.price) } }
          : p
        ),
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === order.playerId 
          ? { ...p, resources: { ...p.resources, [order.resource]: (p.resources[order.resource] || 0) + order.quantity } }
          : p
        ),
      }));
    }
    addMessage(`❌ Order cancelled`);
  };

  const handleExecuteMarketOrder = (orderId) => {
    const order = marketOrders.find(o => o.id === orderId);
    if (!order || order.type !== 'sell' || order.playerId === currentPlayer.id) return;
    
    const seller = gameState.players.find(p => p.id === order.playerId);
    const totalCost = order.quantity * order.price;
    
    if ((currentPlayer.resources?.gold || 0) < totalCost) {
      addMessage(`⛔ Insufficient gold to execute order`);
      return;
    }
    
    setMarketOrders(prev => prev.map(o => o.id === orderId ? { ...o, completed: true } : o));
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === currentPlayer.id) {
          return {
            ...p,
            resources: {
              ...p.resources,
              gold: (p.resources.gold || 0) - totalCost,
              [order.resource]: (p.resources[order.resource] || 0) + order.quantity,
            }
          };
        }
        if (p.id === order.playerId) {
          return {
            ...p,
            resources: {
              ...p.resources,
              gold: (p.resources.gold || 0) + totalCost,
              [order.resource]: (p.resources[order.resource] || 0) - order.quantity,
            }
          };
        }
        return p;
      }),
    }));
    
    addMessage(`✅ Purchased ${order.quantity}x ${order.resource} from ${seller?.name}!`);
  };

  // Called from GameMenu — go to AI setup or faction select
  const handleMenuStart = (mode, count) => {
    const modeConfig = { mode, playerCount: count || 2 };
    setPendingMode(modeConfig);
    setGameStartMode(modeConfig);
    
    // If mode is 'ai', show AI setup modal instead of faction select
    if (mode === 'ai') {
      setShowAiSetup(true);
    } else {
      setSetupStep('faction');
    }
  };

  const handleAiSetupComplete = (aiPlayers) => {
    // Create player for human (choose faction now)
    const humanPlayer = { id: 'player1', name: 'You', isAI: false, leaderIndex: 0 };
    setSetupPlayers([humanPlayer, ...aiPlayers]);
    setShowAiSetup(false);
    setSetupStep('faction');
  };

  const handleFactionSelectComplete = (players) => {
    setSetupPlayers(players);
    setSetupStep('objectives');
  };

  const handleObjectivesComplete = (playersWithObjectives) => {
    setSetupPlayers(playersWithObjectives);
    setSetupStep('leader');
  };

  const handleLeaderSelectComplete = (finalPlayers) => {
    startGame(gameStartMode, finalPlayers);
  };

  // Called from FactionSelect — actually start the game
  const startGame = (modeConfig, playersArr) => {
    if (!modeConfig || !playersArr) return;
    const mode = modeConfig.mode;
    // Assign leader objects to players based on leaderIndex
    const playersWithLeaders = playersArr.map(p => {
      if (p.factionId) {
        const factionLeaders = LEADERS[p.factionId] || [];
        const leaderIndex = p.leaderIndex ?? 0;
        const leader = factionLeaders[leaderIndex];
        return { ...p, leaderIndex, leader, leaderActive: !!leader };
      }
      return p;
    });
    
    const state = createGameState(mode, playersWithLeaders);
    const collected = collectIncome(state);
    // Zero out auto-assigned troopsToDeploy — troops come from recruiting only
    collected.players = collected.players.map(p => ({ ...p, troopsToDeploy: 0, pendingUnits: [] }));
    setGameState(collected);
    setGameMode(mode);
    setPendingMode(null);
    setGameStartMode(null);
    setSetupStep(null);
    setSetupPlayers(null);
    setPhase('deploy');
    setSelectedTerritory(null);
    setWinner(null);
    setMessages(['⚜️ Rulers of Ardonia begins! Recruit troops then deploy them.']);
    setTradeOffers([]);
    setTurnLog([]);
    setSentiment(initializeSentiment(playersWithLeaders));
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
setTimeout(() => addMessage(`🏆 ${player.name} completed objective: ${obj.category}`), 0);
        }
      });
      if (newCompleted.length >= 2 && !winner) {
        setTimeout(() => setWinner(player), 0);
      }
      return { ...player, completedObjectives: newCompleted };
    });
    return updated;
  }, [winner]);

  // Resolve owner of a hex: explicit game state owner OR faction-based via nation
  const resolveHexOwner = (hexId) => {
    const explicit = gameState?.hexes?.[hexId]?.owner;
    if (explicit) return explicit;
    const nationId = HEX_NATION_LOOKUP[hexId];
    if (!nationId) return null;
    const player = gameState?.players?.find(p => FACTION_TO_NATION_ID[p.factionId] === nationId || p.factionId === nationId);
    return player?.id || null;
  };

  // Helper: get neighbor hex IDs
  const getNeighborHexIds = (hexId) => {
    const [col, row] = hexId.split(',').map(Number);
    const even = col % 2 === 0;
    return [
      [col+1, even ? row-1 : row], [col+1, even ? row : row+1],
      [col-1, even ? row-1 : row], [col-1, even ? row : row+1],
      [col, row-1], [col, row+1],
    ].map(([c, r]) => `${c},${r}`);
  };

  const handleTerritoryClick = (hexId) => {
    if (!gameState || winner) return;
    
    // Handle building placement mode
    if (buildingPlacementMode) {
      // Check if hex is owned by current player
      const hexOwner = resolveHexOwner(hexId);
      if (hexOwner !== currentPlayer.id) {
        addMessage('⛔ You can only place buildings in territories you control');
        return;
      }
      
      // Check if port is placed on coastal tile
      if (buildingPlacementMode === 'port') {
        const terrain = HEX_TERRAIN_LOOKUP[hexId];
        if (terrain !== 'coastal') {
          addMessage('⛔ Ports can only be placed on coastal tiles');
          return;
        }
      }
      
      setGameState(prev => {
        const player = prev.players.find(p => p.id === currentPlayer.id);
        const inventory = (player[`${buildingPlacementMode}_inventory`] || 0);
        if (inventory <= 0) return prev;
        const hex = prev.hexes[hexId] || {};
        const buildings = buildingPlacementMode === 'fortress' 
          ? { ...hex.buildings, fortress: true }
          : { ...hex.buildings, port: true };
        return {
          ...prev,
          hexes: { ...prev.hexes, [hexId]: { ...hex, buildings } },
          players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, [`${buildingPlacementMode}_inventory`]: inventory - 1 } : p)
        };
      });
      setBuildingPlacementMode(null);
      addMessage(`🏰 ${buildingPlacementMode === 'fortress' ? 'Fortress' : 'Port'} placed on hex`);
      return;
    }
    
    const hex = gameState.hexes[hexId] || {}; // allow missing hex (no units yet)

    if (phase === 'deploy') {
      const pending = currentPlayer.pendingUnits || [];
      const hexOwner = resolveHexOwner(hexId);

      if (hexOwner === currentPlayer.id && pending.length > 0) {
        const unitType = pending[0]; // deploy the first queued unit
        if (!canDeployUnit(hexId, unitType)) {
          addMessage(`⛔ ${unitType} cannot enter that terrain`);
          return;
        }
        setGameState(prev => {
          const player = prev.players.find(p => p.id === currentPlayer.id);
          const newPending = [...(player.pendingUnits || [])];
          newPending.shift();
          const hexUnits = [...(prev.hexes[hexId]?.units || [])];
          const existing = hexUnits.find(u => u.type === unitType);
          if (existing) existing.count += 1;
          else hexUnits.push({ type: unitType, count: 1 });
          const next = {
            ...prev,
            hexes: {
              ...prev.hexes,
              // also set owner so move phase can find it
              [hexId]: { ...prev.hexes[hexId], units: hexUnits, owner: currentPlayer.id },
            },
            players: prev.players.map(p =>
              p.id === currentPlayer.id ? { ...p, pendingUnits: newPending } : p
            ),
          };
                      return next;
        });
        addMessage(`🏰 Deployed ${unitType} to hex`);
        addLog('deploy', `Deployed ${unitType} to the map`, null, 'Deploy');
      }
    } else if (phase === 'attack') {
      if (!selectedTerritory) {
        const units = hex.units?.reduce((s, u) => s + u.count, 0) || 0;
        if (hex.owner === currentPlayer.id && units > 0) {
          setSelectedTerritory(hexId);
          addMessage(`⚔️ Selected hex — click an enemy hex to attack`);
        }
      } else if (hexId === selectedTerritory) {
        setSelectedTerritory(null);
      } else {
        const selectedHex = gameState.hexes[selectedTerritory];
        if (selectedHex && hex.owner !== currentPlayer.id) {
          setBattle({ attackerId: selectedTerritory, defenderId: hexId });
          setSelectedTerritory(null);
        } else if (hex.owner === currentPlayer.id) {
          setSelectedTerritory(hexId);
          addMessage(`⚔️ Selected hex`);
        } else {
          addMessage('⛔ Not an adjacent enemy hex');
        }
      }
    } else if (phase === 'move') {
      if (!movementState) {
        // Step 1: select a hex with your units
        const units = hex.units?.reduce((s, u) => s + u.count, 0) || 0;
        const moveOwner = resolveHexOwner(hexId);
        if (moveOwner === currentPlayer.id && units > 0) {
          if (movedHexes.has(hexId)) {
            addMessage('⛔ This unit already moved this turn');
            return;
          }
          const unitType = hex.units[0]?.type || 'infantry';
          // Use movementRange from UNIT_DEFS if available, else fallback
          const def = UNIT_DEFS[unitType];
          const speed = def?.movementRange ?? UNIT_SPEED[unitType] ?? 2;
          setSelectedTerritory(hexId);
          setMovementState({ fromHexId: hexId, selectedUnit: unitType, speed });
          addMessage(`🚶 ${unitType} selected (speed ${speed}) — pick a destination`);
        }
      } else if (hexId === movementState.fromHexId) {
        // Deselect
        setSelectedTerritory(null);
        setMovementState(null);
      } else {
        // Step 2: move to target if reachable
        const fromHexId = movementState.fromHexId;
        const unitType = movementState.selectedUnit;
        const speed = movementState.speed;
        const reachable = computeReachableHexes(fromHexId, speed, isWaterOnlyUnit(unitType));

        if (!reachable.has(hexId)) {
          const isNavalUnit = isWaterOnlyUnit(unitType);
          addMessage(isNavalUnit ? '⛔ Reapership can only move on water hexes' : '⛔ Hex out of movement range');
          return;
        }

        const targetOwner = resolveHexOwner(hexId);
        const panelSelected = movementState.panelSelectedUnits; // may be undefined

        // Compute units to move first (needed to check for battle)
        const fromHexSnap = gameState.hexes[fromHexId] || {};
        const toHexSnap = gameState.hexes[hexId] || {};
        let remainingFromUnitsSnap = [...(fromHexSnap.units || [])];
        let unitsToMoveSnap;

        if (panelSelected && panelSelected.length > 0) {
          unitsToMoveSnap = [];
          const toRemove = [...panelSelected];
          remainingFromUnitsSnap = remainingFromUnitsSnap.map(u => ({ ...u }));
          for (const sel of toRemove) {
            const existing = remainingFromUnitsSnap.find(u => u.type === sel.type && u.count > 0);
            if (existing) {
              existing.count -= 1;
              unitsToMoveSnap.push({ type: sel.type, count: 1 });
            }
          }
          remainingFromUnitsSnap = remainingFromUnitsSnap.filter(u => u.count > 0);
        } else {
          unitsToMoveSnap = [...(fromHexSnap.units || [])];
          remainingFromUnitsSnap = [];
        }

        // Check if destination has enemy or neutral units — trigger battle
        const destUnits = toHexSnap.units || [];
        const destOwner = toHexSnap.owner;
        const hasHostileUnits = destUnits.length > 0 && destOwner && destOwner !== currentPlayer.id;

        // Check for embarkation (land units moving to naval unit on coastal or water hex)
        const terrain = HEX_TERRAIN_LOOKUP[hexId];
        const isCoastal = terrain === 'coastal';
        const isWater = terrain === 'water';
        const destNavalUnit = destUnits.find(u => isNavalUnit(u.type));
        const canEmbarkHere = isLandUnit(unitType) && destNavalUnit && (isCoastal || isWater) && destOwner === currentPlayer.id;

        if (canEmbarkHere) {
          const { embarked } = embarkUnits({ embarked: toHexSnap.embarked }, unitsToMoveSnap);
          setGameState(prev => {
            const fromHex = prev.hexes[fromHexId] || {};
            const toHex = prev.hexes[hexId] || {};
            return {
              ...prev,
              hexes: {
                ...prev.hexes,
                [fromHexId]: { ...fromHex, units: remainingFromUnitsSnap },
                [hexId]: { ...toHex, units: destUnits, embarked, owner: currentPlayer.id },
              },
            };
          });
          setMovedHexes(prev => new Set([...prev, fromHexId]));
          setSelectedTerritory(null);
          setMovementState(null);
          addMessage(`⚓ Land units embarked onto naval unit!`);
          addLog('move', 'Embarked on naval unit', null, 'Move');
          return;
        }

        if (hasHostileUnits) {
          // Stage the move and open battle modal
          setHexBattle({
            attackerHexId: fromHexId,
            defenderHexId: hexId,
            pendingMove: {
              fromHexId,
              unitsToMove: unitsToMoveSnap,
              remainingFromUnits: remainingFromUnitsSnap,
            },
          });
          setSelectedTerritory(null);
          setMovementState(null);
          addMessage(`⚔️ Enemy units blocking the way — battle triggered!`);
          return;
        }

        setGameState(prev => {
          const fromHex = prev.hexes[fromHexId] || {};
          const toHex = prev.hexes[hexId] || {};
          const mergedToUnits = [...(toHex.units || [])];
          for (const mu of unitsToMoveSnap) {
            const ex = mergedToUnits.find(u => u.type === mu.type);
            if (ex) ex.count += mu.count;
            else mergedToUnits.push({ ...mu });
          }
          
          // Naval units keep their embarked cargo when moving
          const embarkedUnits = isNavalUnit(unitType) ? (fromHex.embarked || []) : [];
          
          return {
            ...prev,
            hexes: {
              ...prev.hexes,
              [fromHexId]: { ...fromHex, units: remainingFromUnitsSnap, embarked: [] },
              [hexId]: { ...toHex, units: mergedToUnits, embarked: embarkedUnits, owner: currentPlayer.id },
            },
          };
        });

        setMovedHexes(prev => new Set([...prev, fromHexId, hexId]));
        setSelectedTerritory(null);
        setMovementState(null);
        addMessage(`🚶 Moved ${unitType} to hex`);
        addLog('move', `Moved ${unitType} to new hex`, null, 'Move');
      }
    } else if (phase === 'fortify') {
      if (!selectedTerritory) {
        const units = hex.units?.reduce((s, u) => s + u.count, 0) || 0;
        if (hex.owner === currentPlayer.id && units > 0) {
          setSelectedTerritory(hexId);
          addMessage(`🛡️ Fortify — pick a friendly hex to move troops into`);
        }
      } else if (hexId === selectedTerritory) {
        setSelectedTerritory(null);
      } else {
        const targetOwner = resolveHexOwner(hexId);
        if (targetOwner === currentPlayer.id) {
          setGameState(prev => {
            const srcHex = prev.hexes[selectedTerritory];
            const dstHex = prev.hexes[hexId];
            const movedUnits = srcHex?.units || [];
            return {
              ...prev,
              hexes: {
                ...prev.hexes,
                [selectedTerritory]: { ...srcHex, units: [] },
                [hexId]: { ...dstHex, units: [...(dstHex?.units || []), ...movedUnits] },
              },
            };
          });
          setSelectedTerritory(null);
          addMessage(`🛡️ Troops fortified`);
        } else {
          addMessage(`⛔ Fortify: can only move to your own territories`);
          setSelectedTerritory(null);
        }
      }
    }
  };

  const handleBuild = (buildingId) => {
    // Handle fortress/port building
    if (buildingId === 'fortress' || buildingId === 'port') {
      const costs = { fortress: { gold: 5, wood: 3 }, port: { gold: 4, wood: 4 } };
      const cost = costs[buildingId];
      setGameState(prev => {
        const player = prev.players.find(p => p.id === currentPlayer.id);
        for (const [k, v] of Object.entries(cost)) {
          if ((player.resources[k] ?? 0) < v) return prev;
        }
        const newResources = { ...player.resources };
        for (const [k, v] of Object.entries(cost)) {
          newResources[k] = (newResources[k] || 0) - v;
        }
        const inventory = (player[`${buildingId}_inventory`] || 0) + 1;
        return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, resources: newResources, [`${buildingId}_inventory`]: inventory } : p) };
      });
      addMessage(`✅ Built ${buildingId}! Ready to place on map.`);
      return;
    }
    
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
      // Add to building queue instead of instant completion
      newPlayer.buildingQueue = [...(player.buildingQueue || []), { buildingId, turnsRemaining: 1 }];
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
    });
    addMessage(`🏗️ Queued ${BUILDING_DEFS[buildingId]?.name}! Available next turn.`);
    addLog('build', `Queued ${BUILDING_DEFS[buildingId]?.name || buildingId}`, null, 'Action');
  };

  const handleUpgrade = (buildingId) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const building = player.buildings[buildingId];
      const def = BUILDING_DEFS[buildingId];
      const upgradeCost = Object.entries(def.upgradeBase).reduce((acc, [k, v]) => ({ ...acc, [k]: v * building.level }), {});
      for (const [k, v] of Object.entries(upgradeCost || {})) {
        if ((player.resources?.[k] || 0) < v) return prev;
      }
      const newResources = { ...player.resources };
      Object.entries(upgradeCost).forEach(([k, v]) => { newResources[k] = (newResources[k] || 0) - v; });
      const newBuilding = { ...building, level: building.level + 1 };
      const newBuildings = { ...player.buildings, [buildingId]: newBuilding };
      const newPlayer = { ...player, buildings: newBuildings, resources: newResources };
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
    });
    addMessage(`⬆️ Upgraded ${BUILDING_DEFS[buildingId]?.name}!`);
    addLog('upgrade', `Upgraded ${BUILDING_DEFS[buildingId]?.name}`, null, 'Action');
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
      // Add to recruitment queue with 1 turn delay
      const recruitmentQueue = [...(player.recruitmentQueue || []), { unitId, turnsRemaining: 1 }];
      return {
        ...prev,
        players: prev.players.map(p => p.id === player.id ? { ...p, resources: newResources, recruitmentQueue } : p),
      };
    });
    addMessage(`⚔️ Recruiting ${def.name}! Available next turn.`);
    addLog('recruit', `Recruited ${def.name}`, null, 'Deploy');
  };

  const handleBuildImperialStronghold = (territoryId) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const territory = prev.territories[territoryId];
      if (!territory || territory.owner !== player.id) return prev;
      if (territory.buildings?.imperial_stronghold) return prev;
      
      const cost = { gold: 8, wood: 5 };
      for (const [k, v] of Object.entries(cost)) {
        if ((player.resources?.[k] ?? 0) < v) return prev;
      }
      const newResources = { ...player.resources };
      for (const [k, v] of Object.entries(cost)) {
        newResources[k] = (newResources[k] || 0) - v;
      }
      const newTerritory = {
        ...territory,
        buildings: { ...territory.buildings, imperial_stronghold: { level: 1 } }
      };
      return {
        ...prev,
        players: prev.players.map(p => p.id === player.id ? { ...p, resources: newResources } : p),
        territories: { ...prev.territories, [territoryId]: newTerritory },
      };
    });
    addMessage(`🏯 Imperial Stronghold built in ${gameState.territories[territoryId].name}!`);
  };

  const handleBattleResult = (rawResult) => {
    let result = rawResult;
    const attackerTerr = gameState.territories[battle.attackerId];
    const defenderTerr = gameState.territories[battle.defenderId];
    const attackerPlayer = gameState.players.find(p => p.id === attackerTerr.owner);
    const defenderPlayer = gameState.players.find(p => p.id === defenderTerr.owner);
    const defenderTroops = defenderTerr.units?.reduce((s, u) => s + u.count, 0) || defenderTerr.troops;
    const conquered = result.defenderLosses >= defenderTroops;

    const buildUnits = (territory) => {
      if (territory.units?.length > 0) return territory.units;
      return [{ type: 'infantry', count: territory.troops || 1 }];
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
      attackerTroopsBefore: attackerTerr.units?.reduce((s, u) => s + u.count, 0) || attackerTerr.troops,
      defenderTroopsBefore: defenderTroops,
      attackerLosses: result.attackerLosses,
      defenderLosses: result.defenderLosses,
      attackerUnits: buildUnits(attackerTerr),
      defenderUnits: buildUnits(defenderTerr),
      hasFortress: defenderTerr.hasFortress,
      conquered,
      aRolls: result.aRolls,
      dRolls: result.dRolls,
      aBonus: result.aBonus,
      dBonus: result.dBonus,
    };
    setBattleLog(prev => [...prev, logEntry]);

    // Apply card combat bonuses to result before executing
    const atkPlayer = gameState.players.find(p => p.id === attackerTerr.owner);
    const defPlayer = gameState.players.find(p => p.id === defenderTerr.owner);
    const atkCardBonus = getPlayerCombatCardBonus(atkPlayer);
    const defCardBonus = getPlayerCombatCardBonus(defPlayer);
    result = {
      ...result,
      aBonus: (result.aBonus || 0) + atkCardBonus.attackBonus,
      dBonus: (result.dBonus || 0) + defCardBonus.defenseBonus,
    };
    const attackerPlayer = gameState.territories[battle.attackerId]?.owner;
    const defenderPlayer = gameState.territories[battle.defenderId]?.owner;
    const newState = checkObjectives(executeAttack(gameState, battle.attackerId, battle.defenderId, result, attackerPlayer, defenderPlayer));
    setGameState(newState);
    setBattle(null);
    if (conquered) {
      addMessage(`🏴 ${defenderTerr.name} has been conquered!`);
      addLog('conquest', `Conquered ${defenderTerr.name}!`, `Attacker lost ${result.attackerLosses}, defender lost ${result.defenderLosses}`, 'Attack');
    } else {
      addMessage(`⚔️ Battle at ${defenderTerr.name}: A:${result.attackerLosses} lost, D:${result.defenderLosses} lost`);
      addLog('attack', `Battle at ${defenderTerr.name}`, `Attacker lost ${result.attackerLosses} • Defender lost ${result.defenderLosses}`, 'Attack');
    }
  };

  const handleHexBattleResult = (rawResult) => {
    if (!hexBattle) return;
    const { attackerHexId, defenderHexId, pendingMove } = hexBattle;
    // Apply card combat bonuses
    const defHexOwner = gameState.hexes[defenderHexId]?.owner;
    const atkCardBonus = getPlayerCombatCardBonus(currentPlayer);
    const defCardBonus = getPlayerCombatCardBonus(gameState.players.find(p => p.id === defHexOwner));
    const result = { ...rawResult, aBonus: (rawResult.aBonus || 0) + atkCardBonus.attackBonus, dBonus: (rawResult.dBonus || 0) + defCardBonus.defenseBonus };
    const { unitsToMove, remainingFromUnits } = pendingMove;

    const defenderHex = gameState.hexes[defenderHexId] || {};
    const defenderUnits = defenderHex.units || [];
    const defenderTotalCount = defenderUnits.reduce((s, u) => s + u.count, 0);
    const conquered = result.defenderLosses >= defenderTotalCount;

    setGameState(prev => {
      const fromHex = prev.hexes[attackerHexId] || {};
      const toHex = prev.hexes[defenderHexId] || {};

      // Apply attacker losses to moving units
      let remainingAttackers = unitsToMove.map(u => ({ ...u }));
      let lossesToApply = result.attackerLosses;
      for (const u of remainingAttackers) {
        const take = Math.min(u.count, lossesToApply);
        u.count -= take;
        lossesToApply -= take;
        if (lossesToApply <= 0) break;
      }
      remainingAttackers = remainingAttackers.filter(u => u.count > 0);

      // Apply defender losses
      let remainingDefenders = (toHex.units || []).map(u => ({ ...u }));
      let defLossesToApply = result.defenderLosses;
      for (const u of remainingDefenders) {
        const take = Math.min(u.count, defLossesToApply);
        u.count -= take;
        defLossesToApply -= take;
        if (defLossesToApply <= 0) break;
      }
      remainingDefenders = remainingDefenders.filter(u => u.count > 0);

      let newHexes;
      if (conquered && remainingAttackers.length > 0) {
        // Attacker wins: move surviving attackers into the hex
        newHexes = {
          ...prev.hexes,
          [attackerHexId]: { ...fromHex, units: remainingFromUnits },
          [defenderHexId]: { ...toHex, units: remainingAttackers, owner: currentPlayer.id },
        };
      } else if (conquered && remainingAttackers.length === 0) {
        // Attacker wiped out too but defender was defeated — hex becomes unclaimed
        newHexes = {
          ...prev.hexes,
          [attackerHexId]: { ...fromHex, units: remainingFromUnits },
          [defenderHexId]: { ...toHex, units: [], owner: null },
        };
      } else {
        // Defender holds — both sides take losses, nobody moves
        newHexes = {
          ...prev.hexes,
          [attackerHexId]: { ...fromHex, units: [...remainingFromUnits, ...remainingAttackers] },
          [defenderHexId]: { ...toHex, units: remainingDefenders },
        };
      }

      return checkObjectives({ ...prev, hexes: newHexes });
    });

    setMovedHexes(prev => new Set([...prev, attackerHexId]));
    setHexBattle(null);

    if (conquered) {
      addMessage(`🏴 Hex conquered! (A:-${result.attackerLosses} D:-${result.defenderLosses})`);
      addLog('conquest', `Hex conquered in movement!`, `A:-${result.attackerLosses} D:-${result.defenderLosses}`, 'Move');
    } else {
      addMessage(`⚔️ Battle: A:-${result.attackerLosses} D:-${result.defenderLosses} — defender holds`);
      addLog('attack', `Movement battle`, `A:-${result.attackerLosses} • D:-${result.defenderLosses}`, 'Move');
    }
  };

  const handleSummonAvatar = (avatarId) => {
    const avatar = Object.values(AVATARS).flat().find(a => a.id === avatarId);
    if (!avatar) return;
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      // Check cost
      for (const [k, v] of Object.entries(avatar.cost || {})) {
        if (k === 'ip' && (player.ip ?? 0) < v) return prev;
        if (k === 'sp' && (player.sp ?? 0) < v) return prev;
        if (k !== 'ip' && k !== 'sp' && (player.resources?.[k] ?? 0) < v) return prev;
      }
      const newResources = { ...player.resources };
      let newIp = player.ip ?? 0;
      let newSp = player.sp ?? 0;
      for (const [k, v] of Object.entries(avatar.cost || {})) {
        if (k === 'ip') newIp -= v;
        else if (k === 'sp') newSp -= v;
        else newResources[k] = (newResources[k] || 0) - v;
      }
      const newPlayer = {
        ...player,
        resources: newResources,
        ip: newIp,
        sp: newSp,
        activeAvatar: { id: avatarId, duration: avatar.duration },
      };
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
    });
    addMessage(`👹 ${avatar.name} has been summoned!`);
    addLog('avatar', `Summoned ${avatar.name}`, `Tier: ${avatar.tier} · Duration: ${avatar.duration} turns`, 'Action');
  };

  const handleHeroAbility = (heroId, abilityInfo) => {
    // Deduct cost and mark hero as used (exhausted for this turn)
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      let newIp = player.ip ?? 0;
      let newSp = player.sp ?? 0;
      const newResources = { ...player.resources };
      for (const [k, v] of Object.entries(abilityInfo.cost || {})) {
        if (k === 'ip') newIp -= v;
        else if (k === 'sp') newSp -= v;
        else newResources[k] = (newResources[k] || 0) - v;
      }
      const heroStatus = { ...(player.heroStatus || {}), [heroId]: { ...(player.heroStatus?.[heroId] || {}), exhausted: true } };
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, ip: newIp, sp: newSp, resources: newResources, heroStatus } : p) };
    });
    const hero = HEROES[heroId];
    addMessage(`⚔️ ${hero?.name} used ability: ${abilityInfo.label}!`);
    addLog('ability', `${hero?.name} used: ${abilityInfo.label}`, null, 'Action');
  };

  const handleRecruitHero = (heroId) => {
    const hero = HEROES[heroId];
    if (!hero) return;
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      if (player.heroes?.includes(heroId)) return prev;
      // Check cost
      for (const [k, v] of Object.entries(hero.cost || {})) {
        if (k === 'ip' && (player.ip ?? 0) < v) return prev;
        if (k === 'sp' && (player.sp ?? 0) < v) return prev;
        if (k !== 'ip' && k !== 'sp' && (player.resources?.[k] ?? 0) < v) return prev;
      }
      const newResources = { ...player.resources };
      let newIp = player.ip ?? 0;
      let newSp = player.sp ?? 0;
      for (const [k, v] of Object.entries(hero.cost || {})) {
        if (k === 'ip') newIp -= v;
        else if (k === 'sp') newSp -= v;
        else newResources[k] = (newResources[k] || 0) - v;
      }
      const newPlayer = {
        ...player,
        resources: newResources,
        ip: newIp,
        sp: newSp,
        heroes: [...(player.heroes || []), heroId],
        heroStatus: { ...(player.heroStatus || {}), [heroId]: { exhausted: false, imprisoned: false } },
      };
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
    });
    addMessage(`⭐ ${hero.name} has joined your ranks!`);
    addLog('hero', `Recruited ${hero.name}`, `Type: ${hero.type}`, 'Deploy');
  };



  // Handle influence action spending
  const handleInfluenceAction = (actionId, targetPlayerId, rivalPlayerId) => {
    if (!gameState || !currentPlayer) return null;
    const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return null;

    const gsWithSentiment = { ...gameState, sentiment };
    const result = executeInfluenceAction(actionId, currentPlayer, targetPlayerId, rivalPlayerId, gsWithSentiment);

    if (!result.success) {
      addMessage(`⛔ ${result.message}`);
      return result;
    }

    // Apply resource deductions to player
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id !== currentPlayer.id) {
          // Apply influence modifier to target AI
          if (p.id === targetPlayerId && result.modifier) {
            return { ...p, influenceModifiers: [...(p.influenceModifiers || []), result.modifier] };
          }
          return p;
        }
        return { ...p, ...result.newPlayerState, resources: result.newPlayerState.resources };
      }),
    }));

    // Apply sentiment changes
    if (result.newSentiment) setSentiment(result.newSentiment);

    addMessage(result.message);
    addLog('diplomacy', result.message, null, 'Influence');
    return result;
  };

  // Called when user selects units from the side panel to move
  const handleRecruitReapership = (portHexId) => {
    const cost = { gold: 2, wood: 3 };
    const canAfford = Object.entries(cost).every(([k, v]) => (currentPlayer.resources?.[k] ?? 0) >= v);
    if (!canAfford) { addMessage(`⛔ Not enough resources (need 2 Gold, 3 Wood)`); return; }
    const waterHex = getNeighborHexIds(portHexId).find(nId => HEX_TERRAIN_LOOKUP[nId] === 'water');
    if (!waterHex) { addMessage(`⛔ No adjacent water hex to deploy the Reapership`); return; }
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const newResources = { ...player.resources };
      Object.entries(cost).forEach(([k, v]) => { newResources[k] = (newResources[k] || 0) - v; });
      const destHex = prev.hexes[waterHex] || {};
      const destUnits = [...(destHex.units || [])];
      const existing = destUnits.find(u => u.type === 'infamous_reapership');
      if (existing) existing.count += 1;
      else destUnits.push({ type: 'infamous_reapership', count: 1 });
      return {
        ...prev,
        hexes: { ...prev.hexes, [waterHex]: { ...destHex, units: destUnits, owner: currentPlayer.id } },
        players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, resources: newResources } : p),
      };
    });
    addMessage(`⛵ Infamous Reapership launched to adjacent water!`);
    addLog('recruit', `Recruited Infamous Reapership`, null, 'Deploy');
  };

  const handlePanelUnitSelect = (fromHexId, selectedUnits) => {
    if (!selectedUnits || selectedUnits.length === 0) return;
    // Switch to move phase if not already
    if (phase !== 'move') setPhase('move');
    // Use the first selected unit's type to determine speed
    const primaryUnit = selectedUnits[0];
    const def = UNIT_DEFS[primaryUnit.type];
    const speed = def?.movementRange ?? 2;
    setSelectedTerritory(fromHexId);
    setMovementState({ fromHexId, selectedUnit: primaryUnit.type, speed, panelSelectedUnits: selectedUnits });
    addMessage(`🚶 ${selectedUnits.length} unit(s) selected — click destination hex on the map`);
  };

  const handleDrawCard = (card) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      if ((player.resources?.gold ?? 0) < 2) return prev;
      const newResources = { ...player.resources, gold: (player.resources.gold ?? 0) - 2 };
      const newCards = [...(player.actionCards || []), card.id];
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, resources: newResources, actionCards: newCards } : p) };
    });
    addMessage(`🃏 Drew ${card.name}!`);
  };

  const handlePlayCard = buildPlayCardHandler({ setGameState, setCardPlayAnnouncement, addMessage, addLog, getCurrentPlayer: () => currentPlayer });

  // AI evaluates relationships and takes proactive diplomacy actions
  const generateAiDiplomacyActions = useCallback((aiPlayer, gameStateSnap) => {
    if (!gameStateSnap || !sentiment) return [];
    const actions = [];
    const aiPersonality = NATION_PERSONALITIES[aiPlayer.factionId];
    if (!aiPersonality) return actions;

    // Evaluate each other player
    gameStateSnap.players.forEach(targetPlayer => {
      if (targetPlayer.id === aiPlayer.id || !targetPlayer.isAI) return; // Skip self and human players

      const currentSentiment = sentiment[aiPlayer.id]?.[targetPlayer.id] ?? 50;
      const targetObjectives = targetPlayer.objectives || [];
      const hasConflictingObjective = targetObjectives.some(o => 
        o.category === 'Military' && (aiPlayer.objectives || []).some(ao => ao.category === 'Military')
      );

      // Declare war if very hostile AND personality is aggressive OR conflicting objectives
      if ((currentSentiment < 25 && aiPersonality.warTendency > 60) || (currentSentiment < 20 && hasConflictingObjective)) {
        actions.push({
          type: 'diplomacy',
          action: { type: 'war', fromId: aiPlayer.id, toId: targetPlayer.id },
          message: `⚔️ ${aiPlayer.name} declares war on ${targetPlayer.name}!`,
        });
      }
      // Propose alliance if very friendly AND personality is cooperative
      else if (currentSentiment > 75 && aiPersonality.allianceTendency > 60) {
        actions.push({
          type: 'diplomacy',
          action: { type: 'alliance', fromId: aiPlayer.id, toId: targetPlayer.id },
          message: `🕊️ ${aiPlayer.name} proposes alliance with ${targetPlayer.name}!`,
        });
      }
      // Propose peace if moderate hostility
      else if (currentSentiment >= 35 && currentSentiment <= 65 && !gameStateSnap.diplomacy?.[[aiPlayer.id, targetPlayer.id].sort().join('|')]) {
        actions.push({
          type: 'diplomacy',
          action: { type: 'neutral', fromId: aiPlayer.id, toId: targetPlayer.id },
          message: `🤝 ${aiPlayer.name} proposes peace with ${targetPlayer.name}.`,
        });
      }
      // Initiate trade if favorable AND both have resources
      else if (currentSentiment > 50 && aiPlayer.resources?.gold > 5 && targetPlayer.resources?.gold > 5) {
        const hasMarket = aiPlayer.buildings?.market;
        if (hasMarket) {
          actions.push({
            type: 'diplomacy',
            action: {
              type: 'trade_offer',
              fromId: aiPlayer.id,
              toId: targetPlayer.id,
              offer: { gold: 3, wood: 1 },
              request: { gold: 2, wheat: 2 },
            },
            message: `📜 ${aiPlayer.name} proposes trade with ${targetPlayer.name}.`,
          });
        }
      }
    });

    return actions;
  }, [sentiment]);

  const handleDiplomacyAction = ({ type, fromId, toId, offer, request }) => {
    const from = gameState.players.find(p => p.id === fromId);
    const to = gameState.players.find(p => p.id === toId);
    
    if (type === 'trade_offer') {
      setTradeOffers(prev => [...prev, { fromId, toId, offer, request, id: Date.now() }]);
      setGameState(prev => ({
        ...prev,
        diplomaticEvents: [...(prev.diplomaticEvents || []), {
          type: 'trade_offer',
          text: `${from?.name} offered trade to ${to?.name}`,
          turn: prev.turn,
        }],
      }));
      addMessage(`📜 Trade offer sent to ${to?.name}`);
      addLog('diplomacy', `Trade offer sent to ${to?.name}`, null, 'Diplomacy');
      return;
    }
    
    // For diplomacy actions (alliance/war/neutral), check AI sentiment
    if (to?.isAI) {
      const currentSentiment = sentiment?.[fromId]?.[toId] ?? 50;
      const personality = NATION_PERSONALITIES[to.factionId];
      
      // Alliance proposal: AI agrees if sentiment > 80%
      if (type === 'alliance' && currentSentiment > 80) {
        const key = [fromId, toId].sort().join('|');
        setGameState(prev => ({
          ...prev,
          diplomacy: { ...(prev.diplomacy || {}), [key]: 'alliance' },
          diplomaticEvents: [...(prev.diplomaticEvents || []), {
            type: 'alliance',
            text: `${from?.name} and ${to?.name} formed an Alliance`,
            turn: prev.turn,
          }],
        }));
        addMessage(`🕊️ ${to.name} accepts your alliance!`);
        addLog('diplomacy', `Alliance formed with ${to.name}`, null, 'Diplomacy');
        return;
      }
      
      // War declaration: AI accepts if sentiment < 30% or personality is aggressive
      if (type === 'war' && (currentSentiment < 30 || personality?.warTendency > 70)) {
        const key = [fromId, toId].sort().join('|');
        setGameState(prev => ({
          ...prev,
          diplomacy: { ...(prev.diplomacy || {}), [key]: 'war' },
          diplomaticEvents: [...(prev.diplomaticEvents || []), {
            type: 'war',
            text: `${from?.name} and ${to?.name} are at War`,
            turn: prev.turn,
          }],
        }));
        addMessage(`⚔️ ${to.name} accepts your declaration of war!`);
        addLog('diplomacy', `War declared with ${to.name}`, null, 'Diplomacy');
        return;
      }
      
      // Neutral/Peace: AI accepts if sentiment is moderate (35-75%)
      if (type === 'neutral' && currentSentiment >= 35 && currentSentiment <= 75) {
        const key = [fromId, toId].sort().join('|');
        setGameState(prev => ({
          ...prev,
          diplomacy: { ...(prev.diplomacy || {}), [key]: 'neutral' },
          diplomaticEvents: [...(prev.diplomaticEvents || []), {
            type: 'neutral',
            text: `${from?.name} and ${to?.name} agreed to a Peace Treaty`,
            turn: prev.turn,
          }],
        }));
        addMessage(`🤝 ${to.name} accepts peace!`);
        addLog('diplomacy', `Peace treaty with ${to.name}`, null, 'Diplomacy');
        return;
      }
      
      // If AI rejects, inform player
      addMessage(`❌ ${to.name} refuses your diplomatic proposal (sentiment: ${Math.round(currentSentiment)}%)`);
      return;
    }
    
    // Human players can always propose diplomacy
    const key = [fromId, toId].sort().join('|');
    setGameState(prev => {
      const typeLabels = { alliance: 'Alliance', war: 'War', neutral: 'Peace' };
      return {
        ...prev,
        diplomacy: { ...(prev.diplomacy || {}), [key]: type },
        diplomaticEvents: [...(prev.diplomaticEvents || []), {
          type,
          text: `${from?.name} declared ${typeLabels[type]} with ${to?.name}`,
          turn: prev.turn,
        }],
      };
    });
    const labels = { alliance: '🕊️ Alliance formed', war: '⚔️ War declared', neutral: '🤝 Peace proposed' };
    addMessage(`${labels[type] || type} with ${to?.name}!`);
    addLog('diplomacy', `${labels[type] || type} with ${to?.name}`, null, 'Diplomacy');
  };

  const handleAcceptTrade = (offer) => {
    const fromPlayer = gameState?.players?.find(p => p.id === offer.fromId);
    const toPlayer = gameState?.players?.find(p => p.id === offer.toId);
    
    // If accepting player is AI, use sentiment + personality to decide
    if (toPlayer?.isAI) {
      const currentSentiment = sentiment?.[offer.toId]?.[offer.fromId] ?? 50;
      const personality = NATION_PERSONALITIES[toPlayer.factionId];
      
      // Hostile: reject trade
      if (currentSentiment < 35) {
        handleDeclineTrade(offer);
        addMessage(`❌ ${toPlayer.name} refuses trade — relationship too hostile`);
        return;
      }
      
      // Use personality scoring for middle ground
      const score = scoreTradeOffer(offer, toPlayer, fromPlayer, personality);
      if (score < 50) {
        handleDeclineTrade(offer);
        return;
      }
    }
    
    setGameState(prev => {
      if (!fromPlayer || !toPlayer) return prev;
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
      return {
        ...prev,
        players: newPlayers,
        diplomaticEvents: [...(prev.diplomaticEvents || []), {
          type: 'trade_accepted',
          text: `Trade agreement between ${fromPlayer?.name} and ${toPlayer?.name} fulfilled`,
          turn: prev.turn,
        }],
      };
    });
    setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
    setSentiment(prev => prev ? applyEventSentiment(prev, 'trade_accepted', offer.fromId, offer.toId) : prev);
    addMessage(`✅ Trade accepted!`);
  };

  const handleDeclineTrade = (offer) => {
    const fromPlayer = gameState?.players?.find(p => p.id === offer.fromId);
    const toPlayer = gameState?.players?.find(p => p.id === offer.toId);
    setGameState(prev => ({
      ...prev,
      diplomaticEvents: [...(prev.diplomaticEvents || []), {
        type: 'trade_declined',
        text: `${toPlayer?.name} declined trade offer from ${fromPlayer?.name}`,
        turn: prev.turn,
      }],
    }));
    setTradeOffers(prev => prev.filter(o => o.id !== offer.id));
    setSentiment(prev => prev ? applyEventSentiment(prev, 'trade_declined', offer.fromId, offer.toId) : prev);
    addMessage(`❌ Trade declined.`);
  };

  const advancePhase = () => {
    setSelectedTerritory(null);
    setMovementState(null);
    setMovedHexes(new Set());
    if (phase === 'deploy') {
      setPhase('move');
      addMessage('🚶 Move phase — move units across the map');
    } else if (phase === 'move') {
      setPhase('attack');
      addMessage('⚔️ Attack phase — select your territory to attack from');
    } else if (phase === 'attack') {
      setPhase('fortify');
      addMessage('🛡️ Fortify — move troops between adjacent friendly territories');
    } else {
      endTurn();
    }
  };

  const endTurn = useCallback(() => {
    setSelectedTerritory(null);
    setMovedHexes(new Set());
    setGameState(prev => {
      if (!prev) return prev;
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      if (nextIndex === 0) setTurnLog([]);
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
        turn: prev.turn + (nextIndex === 0 ? 1 : 0),
        eventCountdown,
      };

      state = collectIncome(state);
      state = { ...state, players: tickInfluenceModifiers(state.players) };
      
      // Process building and recruitment queues
      state = {
        ...state,
        players: state.players.map(p => {
          let newPlayer = { ...p };
          // Process building queue
          if (newPlayer.buildingQueue?.length > 0) {
            const completedBuildings = [];
            const remainingQueue = [];
            newPlayer.buildingQueue.forEach(item => {
              item.turnsRemaining -= 1;
              if (item.turnsRemaining <= 0) {
                completedBuildings.push(item.buildingId);
              } else {
                remainingQueue.push(item);
              }
            });
            if (completedBuildings.length > 0) {
              const newBuildings = { ...newPlayer.buildings };
              completedBuildings.forEach(buildingId => {
                const def = BUILDING_DEFS[buildingId];
                newBuildings[buildingId] = { ...def, level: 1, disabled: false };
              });
              newPlayer.buildings = newBuildings;
            }
            newPlayer.buildingQueue = remainingQueue;
          }
          // Process recruitment queue
          if (newPlayer.recruitmentQueue?.length > 0) {
            const completedUnits = [];
            const remainingQueue = [];
            newPlayer.recruitmentQueue.forEach(item => {
              item.turnsRemaining -= 1;
              if (item.turnsRemaining <= 0) {
                completedUnits.push(item.unitId);
              } else {
                remainingQueue.push(item);
              }
            });
            if (completedUnits.length > 0) {
              const pendingUnits = [...(newPlayer.pendingUnits || []), ...completedUnits];
              newPlayer.pendingUnits = pendingUnits;
            }
            newPlayer.recruitmentQueue = remainingQueue;
          }
          return newPlayer;
        })
      };

      if (eventTrigger) {
        setTimeout(() => setActiveEvent(eventTrigger), 0);
      }

      // Decay sentiment toward neutral each turn
      setSentiment(prev => prev ? decaySentiment(prev, state.players) : prev);

      return checkObjectives(state);
    });
    setPhase('deploy');
    addMessage('🔄 New turn — deploy your reinforcements');
  }, [checkObjectives]);

  // AI turn logic — step by step so moves are visible on the map
  useEffect(() => {
    if (!gameState || winner) return;
    const cp = gameState.players[gameState.currentPlayerIndex];
    if (!cp?.isAI) return;
    if (isAiRunningRef.current) return;

    isAiRunningRef.current = true;
    const timeouts = [];
    const schedule = (fn, delay) => { const t = setTimeout(fn, delay); timeouts.push(t); return t; };

    schedule(() => {
      // Generate proactive diplomacy actions first
      const diplomacyActions = generateAiDiplomacyActions(cp, gameState);
      const steps = getAiTurnSteps(gameState);
      
      // Insert diplomacy steps at the beginning
      const allSteps = [
        ...diplomacyActions.map(action => ({
          type: 'diplomacy',
          state: gameState,
          message: action.message,
          action: action.action,
        })),
        ...steps
      ];

      if (allSteps.length === 0) {
        const nextIndex = (gameState.currentPlayerIndex + 1) % (gameState.players?.length || 1);
        const nextState = collectIncome({ ...gameState, currentPlayerIndex: nextIndex, turn: gameState.turn + (nextIndex === 0 ? 1 : 0) });
        setGameState(checkObjectives(nextState));
        setPhase('deploy');
        addMessage(`🌟 ${cp.name} ended their turn`);
        isAiRunningRef.current = false;
        return;
      }

      const endAiTurn = (finalState) => {
        try {
          // Flush any AI trade offers into the tradeOffers state
          const aiOffers = finalState.pendingAiTradeOffers || [];
          if (aiOffers.length > 0) {
            setTradeOffers(prev => [...prev, ...aiOffers]);
          }
          const cleanState = { ...finalState, pendingAiTradeOffers: [] };
          const nextIndex = (cleanState.currentPlayerIndex + 1) % (cleanState.players?.length || 1);
          const nextState = collectIncome({ ...cleanState, currentPlayerIndex: nextIndex, turn: cleanState.turn + (nextIndex === 0 ? 1 : 0) });
          setGameState(checkObjectives(nextState));
          setPhase('deploy');
          addMessage(`🌟 ${cp.name} ended their turn`);
          setTurnLog(prev => [...prev, { type: 'default', text: `${cp.name} ended their turn`, phase: 'AI Turn', playerName: cp.name, playerColor: cp.color }]);
        } catch (e) {
          console.error('AI endTurn error:', e);
        } finally {
          isAiRunningRef.current = false;
        }
      };

      if (steps.length === 0) {
        endAiTurn(gameState);
        return;
      }

      allSteps.forEach((step, i) => {
        schedule(() => {
          // Handle diplomacy action execution
          if (step.type === 'diplomacy' && step.action) {
            handleDiplomacyAction(step.action);
          }
          
          setGameState(checkObjectives(step.state));
          if (step.message) {
            addMessage(step.message);
            // Show card play overlay for AI card plays
            if (step.type === 'card' || step.message.startsWith('🃏')) {
              const aiCardMsg = step.message;
              const found = ACTION_CARDS.find(c =>
                aiCardMsg.toLowerCase().includes(c.name?.toLowerCase()) ||
                aiCardMsg.includes(c.id?.replace(/_/g, ' '))
              );
              setCardPlayAnnouncement({
                card: found || { name: 'Action Card', emoji: '🃏', effect: aiCardMsg, category: 'Military' },
                playerName: cp.name,
                playerColor: cp.color,
              });
            }
            // Map step type to log entry type
            const logType = step.message.startsWith('⚔️') ? 'attack'
              : step.message.startsWith('🏗️') || step.message.startsWith('⬆️') ? 'build'
              : step.message.startsWith('🎖️') ? 'recruit'
              : step.message.startsWith('🚩') || step.message.startsWith('🚶') ? 'move'
              : step.message.startsWith('📜') || step.message.startsWith('🕊️') || step.message.startsWith('🤝') ? 'diplomacy'
              : step.message.startsWith('🃏') ? 'card'
              : 'default';
            setTurnLog(prev => [...prev, { type: logType, text: step.message, detail: null, phase: 'AI Turn', playerName: cp.name, playerColor: cp.color }]);
          }
          if (i === allSteps.length - 1) {
            schedule(() => endAiTurn(step.state), 600);
          }
        }, i * 700);
      });
    }, 500);

    return () => {
      timeouts.forEach(clearTimeout);
      isAiRunningRef.current = false;
    };
  }, [gameState?.currentPlayerIndex, gameState?.turn, gameMode, winner]);

  const menuAudio = <audio ref={menuAudioRef} src="https://drive.google.com/uc?id=1DhnA4TinThSDIRFfqOKAuv5ZxHIJxgKQ&export=download" loop style={{ display: 'none' }} />;

  if (onlineSession) return <OnlineGame session={onlineSession} onLeave={() => { setOnlineSession(null); setShowLobby(false); }} />;
  if (showLobby) return <>{menuAudio}<Lobby onStartOnline={(s) => setOnlineSession(s)} onBack={() => setShowLobby(false)} /></>;
  if (showAiSetup) return <>{menuAudio}<AiSetupModal onStart={handleAiSetupComplete} onBack={() => { setShowAiSetup(false); setPendingMode(null); setGameStartMode(null); }} /></>;
  if (!gameMode && !pendingMode) return <>{menuAudio}<GameMenu onStart={handleMenuStart} onOnline={() => setShowLobby(true)} /></>;
  
  if (pendingMode && setupStep === 'faction') {
    return (
      <>{menuAudio}<FactionSelectStep
        mode={pendingMode.mode}
        playerCount={pendingMode.playerCount}
        setupPlayers={setupPlayers}
        onNext={handleFactionSelectComplete}
        onBack={() => { setPendingMode(null); setSetupStep(null); setShowAiSetup(false); setSetupPlayers(null); }}
      /></>
    );
  }

  if (setupStep === 'objectives' && setupPlayers) {
    return (
      <>{menuAudio}<ObjectivesStep
        players={setupPlayers}
        onNext={handleObjectivesComplete}
        onBack={() => setSetupStep('faction')}
      /></>
    );
  }

  if (setupStep === 'leader' && setupPlayers) {
    return (
      <>{menuAudio}<LeaderSelectStep
        players={setupPlayers}
        onConfirm={handleLeaderSelectComplete}
        onBack={() => setSetupStep('objectives')}
      /></>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: "'Crimson Text', serif" }}>
      {/* Top bar */}
      <TopBar
        gameState={gameState}
        currentPlayer={currentPlayer}
        phase={phase}
        messages={messages}
        onAdvancePhase={advancePhase}
        onToggleMusic={toggleMusic}
        musicPlaying={musicPlaying}
        onOpenEffects={() => setOpenModal('effects')}
        onMenu={() => { setGameState(null); setGameMode(null); setPendingMode(null); }}
      />

      {/* Winner banner */}
      {winner && (
        <div className="text-center py-3 text-lg font-bold animate-pulse"
          style={{ background: 'hsl(43,80%,30%)', color: 'hsl(43,90%,85%)', fontFamily: "'Cinzel',serif" }}>
          🏆 {winner.name} of the {winner.faction?.name} has conquered Ardonia! 🏆
        </div>
      )}

      {/* Map — full width */}
      {/* Top player panel */}
      <div className="border-b border-border flex-shrink-0 overflow-x-auto" style={{ background: 'hsl(35,22%,12%)' }}>
        <div className="text-xs font-bold px-2 py-1 sticky top-0 z-10" style={{ background: 'hsl(35,22%,14%)', color: 'hsl(43,80%,55%)', fontFamily: "'Cinzel',serif", borderBottom: '1px solid hsl(35,20%,25%)' }}>
          Players
        </div>
        <div className="flex gap-2 p-2">
          {gameState?.players.map((p, i) => (
            <div key={p.id} className="flex-shrink-0">
              <PlayerPanel
                player={p}
                isActive={i === gameState.currentPlayerIndex}
                territories={gameState.territories}
                isSelf={!p.isAI}
                provinces={provinces}
                gameState={gameState}
                onHighlight={setHighlightedPlayerId}
                isHighlighted={highlightedPlayerId === p.id}
              />
            </div>
          ))}
        </div>
      </div>



      {/* Map */}
      <div className="p-2" style={{ background: 'hsl(35,22%,12%)', position: 'relative' }}>
        {gameState && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setHighlightMyTerritories(h => !h)}
                className="text-xs px-3 py-1 rounded font-bold transition-all"
                style={{
                  fontFamily: "'Cinzel',serif",
                  background: highlightMyTerritories ? `${currentPlayer?.color}33` : 'hsl(35,20%,22%)',
                  border: `1px solid ${highlightMyTerritories ? currentPlayer?.color : 'hsl(35,20%,35%)'}`,
                  color: highlightMyTerritories ? currentPlayer?.color : 'hsl(40,20%,65%)',
                }}>
                {highlightMyTerritories ? '✦ My Territories (ON)' : '◇ My Territories'}
              </button>
              <button
                onClick={() => setShowInfluenceOverlay(h => !h)}
                className="text-xs px-3 py-1 rounded font-bold transition-all"
                style={{
                  fontFamily: "'Cinzel',serif",
                  background: showInfluenceOverlay ? 'rgba(212,168,83,0.2)' : 'hsl(35,20%,22%)',
                  border: `1px solid ${showInfluenceOverlay ? 'hsl(43,80%,50%)' : 'hsl(35,20%,35%)'}`,
                  color: showInfluenceOverlay ? 'hsl(43,90%,70%)' : 'hsl(40,20%,65%)',
                }}>
                {showInfluenceOverlay ? '📊 Influence Map (ON)' : '📊 Influence Map'}
              </button>
              <span className="text-xs" style={{ color: 'hsl(40,20%,50%)' }}>
                {gameState.territories && currentPlayer ? 
                  `${Object.values(gameState.territories).filter(t => t.owner === currentPlayer.id).length} territories owned` : ''}
              </span>
            </div>
            <HexMap
              ref={hexMapRef}
              gameState={gameState}
              setGameState={setGameState}
              selectedHex={selectedTerritory}
              selectedProvince={selectedProvince}
              phase={phase}
              currentPlayer={currentPlayer}
              onHexClick={handleTerritoryClick}
              onProvincClick={setSelectedProvince}
              movementState={movementState}
              movedHexes={movedHexes}
              highlightPlayerId={highlightedPlayerId || (highlightMyTerritories ? currentPlayer?.id : null)}
              draggingDeployUnit={draggingDeployUnit}
              onDragDeployDrop={(hexId, unitType) => {
                const type = unitType || draggingDeployUnit;
                if (!type) return;
                // Building placement drag (fortress / port)
                if (type === 'fortress' || type === 'port') {
                  setBuildingPlacementMode(type);
                  setTimeout(() => { handleTerritoryClick(hexId); setDraggingDeployUnit(null); setBuildingPlacementMode(null); }, 0);
                } else {
                  handleSelectDeployUnit(type);
                  setTimeout(() => { handleTerritoryClick(hexId); setDraggingDeployUnit(null); }, 0);
                }
              }}
              reachableHexes={movementState ? computeReachableHexes(movementState.fromHexId, movementState.speed, isWaterOnlyUnit(movementState.selectedUnit)) : null}
              attackableHexes={phase === 'attack' && selectedTerritory ? (() => {
                const attackerHex = gameState.hexes[selectedTerritory];
                if (!attackerHex) return null;
                const reachable = computeReachableHexes(selectedTerritory, 1);
                const attackable = new Set();
                reachable.forEach((_, nId) => {
                  const nh = gameState.hexes[nId];
                  const nhOwner = nh?.owner || null;
                  if (nhOwner && nhOwner !== currentPlayer.id) attackable.add(nId);
                });
                return attackable;
              })() : null}
              onZoomChange={setMapZoomTransform}
              onSelectPanelUnit={handlePanelUnitSelect}
              onRecruitReapership={handleRecruitReapership}
              showInfluenceOverlay={showInfluenceOverlay}
              sentiment={sentiment}
              addMessage={addMessage}
              addLog={addLog}
              getNeighborHexIds={getNeighborHexIds}
            />
            {mapZoomTransform && (
              <MiniMap
                gameState={gameState}
                zoomTransform={mapZoomTransform}
                onPanTo={(mapX, mapY) => hexMapRef.current?.panTo(mapX, mapY)}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom Menu Bar */}
      <div className="flex gap-1 border-t border-border flex-shrink-0 overflow-x-auto" style={{ background: 'hsl(35,22%,12%)', padding: '6px', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999, pointerEvents: 'auto' }}>
        {[
          { id: 'action', icon: '⚔️', label: 'Action' },
          { id: 'build', icon: '🏗️', label: 'Build' },
          { id: 'recruit', icon: '⚔️', label: 'Recruit' },
          { id: 'heroes', icon: '⭐', label: 'Heroes' },
          { id: 'avatars', icon: '👹', label: 'Avatars' },
          { id: 'effects', icon: '📊', label: 'Effects' },
          { id: 'market', icon: '💹', label: 'Market' },
          { id: 'silver-union', icon: '🏦', label: 'Silver Union' },
          { id: 'diplomacy-influence', icon: '🕊️', label: 'Diplomacy & Influence' },
          { id: 'unifiedlog', icon: '📋', label: 'Logs' },
        ].map(t => (
          <button key={t.id} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (t.id === 'diplomacy-influence') setShowDiplomacyInfluenceModal(true);
            else if (t.id === 'silver-union') setShowSilverUnionMenu(true);
            else setOpenModal(t.id);
          }}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all hover:opacity-90"
            style={{
              fontFamily: "'Cinzel',serif",
              background: 'hsl(35,20%,22%)',
              border: '1px solid hsl(35,20%,32%)',
              color: 'hsl(40,20%,65%)',
            }}>
            {t.icon} {t.label}
            {t.id === 'diplomacy-influence' && tradeOffers.filter(o => o.toId === currentPlayer?.id).length > 0 && (
              <span className="ml-1 px-1 rounded-full text-xs font-bold"
                style={{ background: 'hsl(0,65%,45%)', color: 'white', fontSize: '10px' }}>
                {tradeOffers.filter(o => o.toId === currentPlayer?.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {battle && gameState && (
        <BattleModal
          gameState={gameState}
          battle={battle}
          onResult={handleBattleResult}
          onCancel={() => setBattle(null)}
        />
      )}

      {hexBattle && gameState && (() => {
        // Build a synthetic gameState for BattleModal using hex data
        const atkHex = gameState.hexes[hexBattle.attackerHexId] || {};
        const defHex = gameState.hexes[hexBattle.defenderHexId] || {};
        const atkUnits = hexBattle.pendingMove.unitsToMove;
        const defOwner = defHex.owner || 'neutral';
        const defPlayerObj = gameState.players.find(p => p.id === defOwner);
        const neutralName = defOwner?.startsWith('neutral_') ? defOwner.replace('neutral_', '') : defOwner;

        const syntheticState = {
          ...gameState,
          territories: {
            ...gameState.territories,
            __hex_attacker__: {
              id: '__hex_attacker__',
              name: `Hex ${hexBattle.attackerHexId}`,
              owner: currentPlayer.id,
              troops: atkUnits.reduce((s, u) => s + u.count, 0),
              units: atkUnits,
              hasFortress: false,
            },
            __hex_defender__: {
              id: '__hex_defender__',
              name: `Hex ${hexBattle.defenderHexId}`,
              owner: defOwner,
              troops: defHex.units?.reduce((s, u) => s + u.count, 0) || 0,
              units: defHex.units || [],
              hasFortress: defHex.buildings?.fortress || false,
            },
          },
          players: defPlayerObj ? gameState.players : [
            ...gameState.players,
            { id: defOwner, name: neutralName, color: '#888', isAI: true, factionId: null },
          ],
        };
        return (
          <BattleModal
            gameState={syntheticState}
            battle={{ attackerId: '__hex_attacker__', defenderId: '__hex_defender__' }}
            onResult={handleHexBattleResult}
            onCancel={() => { setHexBattle(null); setMovementState(null); setSelectedTerritory(null); }}
          />
        );
      })()}

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={() => {
            setGameState(prev => applyEventEffect(prev, activeEvent));
            setActiveEvent(null);
          }}
        />
      )}

      {/* Generic Modal Wrapper */}
      {openModal && (
        <div onClick={() => setOpenModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, hsl(35,22%,14%), hsl(35,20%,10%))',
            border: '1px solid hsl(35,20%,28%)',
            borderRadius: 8,
            maxWidth: '80vw', maxHeight: '80vh',
            width: openModal === 'action' || openModal === 'advisor' ? '900px' : openModal === 'unifiedlog' ? '1000px' : '700px',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid hsl(35,20%,25%)',
              fontFamily: "'Cinzel', serif",
            }}>
              <h2 style={{ color: 'hsl(43,80%,60%)', fontSize: 18, fontWeight: 700, margin: 0 }}>
               {openModal === 'action' && '⚔️ Action'}
               {openModal === 'build' && '🏗️ Build'}
               {openModal === 'recruit' && '⚔️ Recruit'}
               {openModal === 'heroes' && '⭐ Heroes'}
               {openModal === 'avatars' && '👹 Avatars'}
               {openModal === 'effects' && '📊 Effects'}
               {openModal === 'market' && '💹 Market'}
               {openModal === 'unifiedlog' && '📋 Logs'}
              </h2>
              <button onClick={() => setOpenModal(null)} style={{
                background: 'none', border: 'none', color: 'hsl(43,80%,60%)', fontSize: 24,
                cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s',
              }} onMouseEnter={e => e.target.style.opacity = '1'} onMouseLeave={e => e.target.style.opacity = '0.7'}>
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {openModal === 'action' && gameState && currentPlayer && (
                <ActionBar
                 gameState={gameState}
                 currentPlayer={currentPlayer}
                 phase={phase}
                 onAdvancePhase={advancePhase}
                 isAI={currentPlayer.isAI}
                 onPlayCard={handlePlayCard}
                 onDrawCard={handleDrawCard}
                 onSelectDeployUnit={handleSelectDeployUnit}
                 onDragDeployStart={(unitType) => { setDraggingDeployUnit(unitType); setOpenModal(null); }}
                 onDragDeployEnd={() => setDraggingDeployUnit(null)}
                 isDraggingDeploy={!!draggingDeployUnit}
                />
              )}
              {openModal === 'build' && gameState && currentPlayer && !currentPlayer.isAI && (
                 <BuildRecruitPanel
                   currentPlayer={currentPlayer}
                   gameState={gameState}
                   onBuild={handleBuild}
                   onUpgrade={handleUpgrade}
                   onSetBuildingPlacementMode={(mode) => { setBuildingPlacementMode(mode); if (mode) setOpenModal(null); }}
                   buildingPlacementMode={buildingPlacementMode}
                   onDragPlaceStart={(type) => { setDraggingDeployUnit(type); setBuildingPlacementMode(type); setOpenModal(null); }}
                   onDragPlaceEnd={() => { setDraggingDeployUnit(null); }}
                 />
              )}
              {openModal === 'build' && currentPlayer?.isAI && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(40,20%,60%)' }}>
                  Build available during your turn
                </div>
              )}
              {openModal === 'recruit' && gameState && currentPlayer && !currentPlayer.isAI && (
                <RecruitPanel
                  currentPlayer={currentPlayer}
                  onRecruit={handleRecruit}
                />
              )}
              {openModal === 'recruit' && currentPlayer?.isAI && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(40,20%,60%)' }}>
                  Recruit available during your turn
                </div>
              )}
              {openModal === 'heroes' && gameState && currentPlayer && !currentPlayer.isAI && (
                <HeroPanel
                  gameState={gameState}
                  currentPlayer={currentPlayer}
                  onRecruit={handleRecruitHero}
                  onTriggerAbility={handleHeroAbility}
                />
              )}
              {openModal === 'heroes' && currentPlayer?.isAI && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(40,20%,60%)' }}>
                  Heroes available during your turn
                </div>
              )}
              {openModal === 'avatars' && gameState && currentPlayer && !currentPlayer.isAI && (
                <AvatarPanel
                  currentPlayer={currentPlayer}
                  onSummon={handleSummonAvatar}
                />
              )}
              {openModal === 'avatars' && currentPlayer?.isAI && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(40,20%,60%)' }}>
                  Avatars available during your turn
                </div>
              )}
              {openModal === 'effects' && gameState && currentPlayer && (
                <EffectsPanel currentPlayer={currentPlayer} gameState={gameState} />
              )}
              {openModal === 'unifiedlog' && gameState && (
                <UnifiedLog
                  entries={turnLog}
                  battleEntries={battleLog}
                  diplomaticEvents={gameState.diplomaticEvents || []}
                  currentTurn={gameState?.turn}
                />
              )}
              {openModal === 'market' && gameState && currentPlayer && (
                <MarketPanel
                  currentPlayer={currentPlayer}
                  gameState={{ ...gameState, marketOrders }}
                  onPlaceOrder={handlePlaceMarketOrder}
                  onCancelOrder={handleCancelMarketOrder}
                  onExecuteOrder={handleExecuteMarketOrder}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showSilverUnionMenu && gameState && currentPlayer && (
        <SilverUnionMenu gameState={gameState} currentPlayer={currentPlayer} setGameState={setGameState} addMessage={addMessage} onClose={() => setShowSilverUnionMenu(false)} />
      )}
      {/* Diplomacy & Influence Merged Modal */}
      {showDiplomacyInfluenceModal && gameState && currentPlayer && (
        <DiplomacyInfluenceMergedPanel
          gameState={gameState}
          currentPlayer={currentPlayer}
          onDiplomacyAction={handleDiplomacyAction}
          onInfluenceAction={handleInfluenceAction}
          tradeOffers={tradeOffers}
          onAcceptTrade={handleAcceptTrade}
          onDeclineTrade={handleDeclineTrade}
          onClose={() => setShowDiplomacyInfluenceModal(false)}
          onSentimentChange={(fromId, toId, shift) => {
            setSentiment(prev => {
              if (!prev) return prev;
              const newVal = Math.max(0, Math.min(100, (prev[fromId]?.[toId] ?? 50) + shift));
              return {
                ...prev,
                [fromId]: { ...prev[fromId], [toId]: newVal }
              };
            });
          }}
        />
      )}

      {/* Card play cinematic overlay */}
      <CardPlayOverlay
        playedCard={cardPlayAnnouncement?.card}
        playerName={cardPlayAnnouncement?.playerName}
        playerColor={cardPlayAnnouncement?.playerColor}
        onDone={() => setCardPlayAnnouncement(null)}
      />
    </div>
  );
}