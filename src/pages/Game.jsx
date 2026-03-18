import React, { useState, useEffect, useCallback } from 'react';
import GameMenu from '../components/game/GameMenu';
import Lobby from '../components/game/Lobby';
import OnlineGame from './OnlineGame';
import BattleLog from '../components/game/BattleLog';
import DiplomacyPanel from '../components/game/DiplomacyPanel';
import HeroPanel from '../components/game/HeroPanel';
import DeployableTroopsPanel from '../components/game/DeployableTroopsPanel';
import UnitBreakdown from '../components/game/UnitBreakdown';
import { HEROES } from '../components/game/ardoniaData';
import { getHeroCombatBonus } from '../components/game/ardoniaLogic';
import { HexUtils, canUnitEnter } from '../components/game/hexGridSystem';
import FactionSelect from '../components/game/FactionSelect';
import GameBoard from '../components/game/GameBoard';
import HexMap from '../components/game/HexMap';
import PlayerPanel from '../components/game/PlayerPanel';
import ActionBar from '../components/game/ActionBar';
import BattleModal from '../components/game/BattleModal';
import EventModal from '../components/game/EventModal';
import { createGameState, collectIncome, executeAttack, resolveBattle, doAiTurn, checkObjective, calculateUnitBonuses } from '../components/game/ardoniaLogic';
import BuildRecruitPanel from '../components/game/BuildRecruitPanel';
import { EVENT_CARDS, BUILDING_DEFS, UNIT_DEFS } from '../components/game/ardoniaData';

export default function Game() {
  const [gameState, setGameState] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);
  const [showLobby, setShowLobby] = useState(false);
  const [onlineSession, setOnlineSession] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [phase, setPhase] = useState('deploy'); // deploy → move → attack → fortify
  const [battle, setBattle] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [tradeOffers, setTradeOffers] = useState([]);
  const [bottomTab, setBottomTab] = useState('action'); // 'action' | 'diplomacy' | 'log'

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

  // Called from GameMenu — go to faction select
  const handleMenuStart = (mode, count) => {
    setPendingMode({ mode, playerCount: count || 2 });
  };

  // Called from FactionSelect — actually start the game
  const startGame = (choices, playersArr) => {
    const mode = pendingMode.mode;
    const state = createGameState(mode, choices, playersArr);
    const collected = collectIncome(state);
    // Zero out auto-assigned troopsToDeploy — troops come from recruiting only
    collected.players = collected.players.map(p => ({ ...p, troopsToDeploy: 0, pendingUnits: [] }));
    setGameState(collected);
    setGameMode(mode);
    setPendingMode(null);
    setPhase('deploy');
    setSelectedTerritory(null);
    setWinner(null);
    setMessages(['⚜️ Rulers of Ardonia begins! Recruit troops then deploy them.']);
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

  const handleTerritoryClick = (hexId) => {
    if (!gameState || winner) return;
    const hex = gameState.hexes[hexId];
    if (!hex) return;

    if (phase === 'deploy') {
      const pending = currentPlayer.pendingUnits || [];
      if (hex.owner === currentPlayer.id && pending.length > 0) {
        const unitType = pending[0]; // deploy the first queued unit
        if (!canUnitEnter(hexId, unitType)) {
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
              [hexId]: { ...prev.hexes[hexId], units: hexUnits },
            },
            players: prev.players.map(p =>
              p.id === currentPlayer.id ? { ...p, pendingUnits: newPending } : p
            ),
          };
          return checkObjectives(next);
        });
        addMessage(`🏰 Deployed ${unitType} to hex`);
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
      if (!selectedTerritory) {
        const units = hex.units?.reduce((s, u) => s + u.count, 0) || 0;
        if (hex.owner === currentPlayer.id && units > 0) {
          setSelectedTerritory(hexId);
          addMessage(`🚶 Moving from hex — pick destination`);
        }
      } else if (hexId === selectedTerritory) {
        setSelectedTerritory(null);
      } else {
        const fromHex = gameState.hexes[selectedTerritory];
        const toHex = gameState.hexes[hexId];
        if (toHex.owner === currentPlayer.id) {
          // Move all units from source to destination
          setGameState(prev => {
            const neighbors = HexUtils.getNeighbors(fromHex.q, fromHex.r);
            const isAdjacent = neighbors.some(([q, r]) => 
              toHex.q === q && toHex.r === r
            );
            
            if (!isAdjacent) {
              addMessage('⛔ Target not adjacent');
              return prev;
            }
            
            // Check if units can enter destination terrain
            const unitType = fromHex.units?.[0]?.type || 'infantry';
            if (!canUnitEnter(hexId, unitType)) {
              addMessage(`⛔ Unit type cannot enter that terrain`);
              return prev;
            }
            
            return {
              ...prev,
              hexes: {
                ...prev.hexes,
                [selectedTerritory]: { ...fromHex, units: [] },
                [hexId]: { ...toHex, units: [...(toHex.units || []), ...(fromHex.units || [])] },
              },
            };
          });
          setSelectedTerritory(null);
          addMessage(`🚶 Moved units to hex`);
        } else {
          addMessage('⛔ Target must be owned by you');
        }
      }
    } else if (phase === 'fortify') {
      if (!selectedTerritory) {
        const units = hex.units?.reduce((s, u) => s + u.count, 0) || 0;
        if (hex.owner === currentPlayer.id && units > 0) {
          setSelectedTerritory(hexId);
          addMessage(`🛡️ Moving from hex — pick adjacent friendly hex`);
        }
      } else if (hexId !== selectedTerritory) {
        if (hex.owner === currentPlayer.id) {
          setGameState(prev => checkObjectives({
            ...prev,
            hexes: {
              ...prev.hexes,
              [selectedTerritory]: { ...prev.hexes[selectedTerritory], units: [] },
              [hexId]: { ...hex, units: [...(hex.units || []), { type: 'infantry', count: 1 }] },
            },
          }));
          setSelectedTerritory(null);
          addMessage(`🛡️ Moved troops to hex`);
        } else if (hex.owner === currentPlayer.id) {
          setSelectedTerritory(hexId);
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
      // Add to pendingUnits queue for deployment
      const pendingUnits = [...(player.pendingUnits || []), unitId];
      return {
        ...prev,
        players: prev.players.map(p => p.id === player.id ? { ...p, resources: newResources, pendingUnits } : p),
      };
    });
    addMessage(`⚔️ Recruited ${def.name} — deploy it on the map!`);
  };

  const handleBuildFortress = (territoryId) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const territory = prev.territories[territoryId];
      if (!territory || territory.owner !== player.id) return prev;
      const cost = BUILDING_DEFS.fortress?.cost || {};
      // Check resources
      for (const [k, v] of Object.entries(cost)) {
        if ((player.resources?.[k] ?? 0) < v) return prev;
      }
      const newResources = { ...player.resources };
      for (const [k, v] of Object.entries(cost)) {
        newResources[k] = (newResources[k] || 0) - v;
      }
      return {
        ...prev,
        players: prev.players.map(p => p.id === player.id ? { ...p, resources: newResources } : p),
        territories: { ...prev.territories, [territoryId]: { ...territory, hasFortress: true } },
      };
    });
    addMessage(`🏰 Fortress built in ${gameState.territories[territoryId].name}!`);
  };

  const handleBattleResult = (result) => {
    const attackerTerr = gameState.territories[battle.attackerId];
    const defenderTerr = gameState.territories[battle.defenderId];
    const attackerPlayer = gameState.players.find(p => p.id === attackerTerr.owner);
    const defenderPlayer = gameState.players.find(p => p.id === defenderTerr.owner);
    const defenderTroops = defenderTerr.units?.reduce((s, u) => s + u.count, 0) || defenderTerr.troops;
    const conquered = result.defenderLosses >= defenderTroops;

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
      attackerTroopsBefore: attackerTerr.units?.reduce((s, u) => s + u.count, 0) || attackerTerr.troops,
      defenderTroopsBefore: defenderTroops,
      attackerLosses: result.attackerLosses,
      defenderLosses: result.defenderLosses,
      attackerUnits: attackerTerr.units?.length > 0 ? attackerTerr.units : buildUnits(attackerTerr, attackerPlayer),
      defenderUnits: defenderTerr.units?.length > 0 ? defenderTerr.units : buildUnits(defenderTerr, defenderPlayer),
      hasFortress: defenderTerr.hasFortress,
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

  const handlePlayCard = (card) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const newResources = { ...player.resources };
      let newIp = player.ip ?? 0;
      let newSp = player.sp ?? 0;
      for (const [k, v] of Object.entries(card.cost || {})) {
        if (k === 'ip') newIp -= v;
        else if (k === 'sp') newSp -= v;
        else newResources[k] = (newResources[k] || 0) - v;
      }
      
      // Apply immediate effects based on card ID
      let cardEffects = { ...player.cardEffects || {} };
      if (card.id === 'faith_surge') {
        newSp = Math.min(10, newSp + 3);
      } else if (card.id === 'peace_treaty') {
        newIp += 1;
        cardEffects.peace_treaty = { duration: 3, active: true };
      } else if (card.id === 'embargo') {
        cardEffects.embargo = { duration: 2, active: true };
      } else if (card.id === 'trade_diplomacy') {
        newIp += 1;
        cardEffects.trade_diplomacy = { duration: 3, active: true };
      } else if (card.id === 'merchant_fleet') {
        cardEffects.merchant_fleet = { duration: 2, active: true };
      } else if (card.id === 'exclusive_contract') {
        cardEffects.exclusive_contract = { duration: 3, active: true };
      } else if (card.id === 'tariff_deal') {
        cardEffects.tariff_deal = { duration: 3, active: true, tariffBonus: 1 };
      } else if (card.id === 'wood_monopoly') {
        cardEffects.wood_monopoly = { duration: 3, active: true, resource: 'wood' };
      } else if (card.id === 'wheat_monopoly') {
        cardEffects.wheat_monopoly = { duration: 3, active: true, resource: 'wheat' };
      } else if (card.id === 'trade_corridor') {
        cardEffects.trade_corridor = { duration: 2, active: true };
      } else if (card.id === 'merchant_guild') {
        cardEffects.merchant_guild = { duration: Infinity, active: true };
      } else if (card.id === 'economic_boom') {
        cardEffects.economic_boom = { duration: 3, active: true, goldBonus: 2 };
      } else if (card.id === 'war_profiteering') {
        cardEffects.war_profiteering = { duration: Infinity, active: true };
      } else if (card.id === 'economic_manipulation') {
        cardEffects.economic_manipulation = { duration: 1, active: true };
      } else if (card.id === 'tariff_war') {
        cardEffects.tariff_war = { duration: 1, active: true };
      } else if (card.id === 'slave_trade') {
        cardEffects.slave_trade = { duration: 3, active: true };
      } else if (card.id === 'debt_forgiveness') {
        cardEffects.debt_forgiveness = { duration: 1, active: true };
      } else if (card.id === 'luxury_tax') {
        cardEffects.luxury_tax = { duration: 1, active: true };
      } else if (card.id === 'forced_tribute') {
        cardEffects.forced_tribute = { duration: 1, active: true };
      } else if (card.id === 'royal_marriage') {
        newIp += 0; // IP effect handled in diplomacy
        cardEffects.royal_marriage = { duration: 3, active: true };
      } else if (card.id === 'allied_barracks') {
        newIp += 1;
        cardEffects.allied_barracks = { duration: 1, active: true };
      } else if (card.id === 'diplomatic_favor') {
        newIp += 3;
      } else if (card.id === 'non_aggression_pact') {
        newIp += 1;
        cardEffects.non_aggression_pact = { duration: 2, active: true };
      } else if (card.id === 'spiritual_pilgrimage') {
        newSp += 3;
      } else if (card.id === 'holy_shield') {
        newSp += 1;
        cardEffects.holy_shield = { duration: 1, active: true };
      } else if (card.id === 'ritual_of_summoning') {
        newSp += 1;
        cardEffects.ritual_of_summoning = { duration: 1, active: true };
      } else if (card.id === 'temple_blessing') {
        cardEffects.temple_blessing = { duration: 1, active: true };
      } else if (card.id === 'mystic_barrier') {
        newSp += 1;
        cardEffects.mystic_barrier = { duration: 1, active: true };
      } else if (card.id === 'prophets_vision') {
        newSp += 1;
        cardEffects.prophets_vision = { duration: 1, active: true };
      } else if (card.id === 'wrath_of_divine') {
        newSp += 2;
        cardEffects.wrath_of_divine = { duration: 1, active: true };
      } else if (card.id === 'avatars_echo') {
        newSp -= 1;
        cardEffects.avatars_echo = { duration: 1, active: true };
      } else if (card.id === 'sanctified_ground') {
        cardEffects.sanctified_ground = { duration: 1, active: true };
      } else if (card.id === 'echoes_of_prophecy') {
        cardEffects.echoes_of_prophecy = { duration: 1, active: true };
      }
      
      const newCards = (player.actionCards || []).filter(id => id !== card.id);
      const newPlayer = { ...player, resources: newResources, ip: newIp, sp: newSp, actionCards: newCards, cardEffects };
      return { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
    });
    addMessage(`🃏 Played ${card.name}: ${card.effect}`);
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
    setSelectedTerritory(null);
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
    setGameState(prev => {
      if (!prev) return prev;
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
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
      setGameState(s => collectIncome({
        ...s,
        currentPlayerIndex: nextIndex,
        turn: s.turn + (nextIndex === 0 ? 1 : 0),
      }));
      setPhase('deploy');
    }, 1800);
    return () => clearTimeout(timeout);
  }, [gameState?.currentPlayerIndex, gameState?.turn, gameMode, winner]);

  if (onlineSession) return <OnlineGame session={onlineSession} onLeave={() => { setOnlineSession(null); setShowLobby(false); }} />;
  if (showLobby) return <Lobby onStartOnline={(s) => setOnlineSession(s)} onBack={() => setShowLobby(false)} />;
  if (!gameMode && !pendingMode) return <GameMenu onStart={handleMenuStart} onOnline={() => setShowLobby(true)} />;
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
          <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/18fc0b373_photo-output11.png" alt="Rulers of Ardonia" className="h-10" style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,50,0.3))' }} />
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
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-2" style={{ background: 'hsl(35,22%,12%)' }}>
        {gameState && (
          <HexMap
            gameState={gameState}
            selectedHex={selectedTerritory}
            phase={phase}
            currentPlayer={currentPlayer}
            onHexClick={handleTerritoryClick}
          />
        )}
      </div>

      {/* Bottom panels */}
      <div className="flex border-t border-border overflow-hidden" style={{ minHeight: '140px', maxHeight: '50vh', resize: 'vertical', background: 'hsl(35,22%,12%)' }}>
        {/* Center tabbed panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border flex-shrink-0" style={{ background: 'hsl(35,22%,13%)' }}>
            {[
              { id: 'action', icon: '⚔️', label: 'Action' },
              { id: 'heroes', icon: '⭐', label: 'Heroes' },
              { id: 'build', icon: '🏗️', label: 'Build' },
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
                {t.id === 'diplomacy' && tradeOffers.filter(o => o.toId === currentPlayer?.id).length > 0 && (
                  <span className="ml-1 px-1 rounded-full text-xs font-bold"
                    style={{ background: 'hsl(0,65%,45%)', color: 'white', fontSize: '10px' }}>
                    {tradeOffers.filter(o => o.toId === currentPlayer?.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {bottomTab === 'action' && gameState && currentPlayer && (
              <>
                <ActionBar
                gameState={gameState}
                currentPlayer={currentPlayer}
                phase={phase}
                onAdvancePhase={advancePhase}
                isAI={currentPlayer.isAI}
                onPlayCard={handlePlayCard}
                onDrawCard={handleDrawCard}
                onSelectDeployUnit={handleSelectDeployUnit}
              />
                <UnitBreakdown currentPlayer={currentPlayer} gameState={gameState} />
              </>
            )}
            {bottomTab === 'heroes' && gameState && currentPlayer && !currentPlayer.isAI && (
              <HeroPanel
                gameState={gameState}
                currentPlayer={currentPlayer}
                onRecruit={handleRecruitHero}
              />
            )}
            {bottomTab === 'heroes' && currentPlayer?.isAI && (
              <div className="flex items-center justify-center h-full text-xs opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
                Heroes available during your turn
              </div>
            )}
            {bottomTab === 'build' && gameState && currentPlayer && !currentPlayer.isAI && (
              <BuildRecruitPanel
                currentPlayer={currentPlayer}
                gameState={gameState}
                onBuild={handleBuild}
                onRecruit={handleRecruit}
                onUpgrade={handleUpgrade}
                onBuildFortress={handleBuildFortress}
              />
            )}
            {bottomTab === 'build' && currentPlayer?.isAI && (
              <div className="flex items-center justify-center h-full text-xs opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
                Build available during your turn
              </div>
            )}
            {bottomTab === 'diplomacy' && gameState && currentPlayer && !currentPlayer.isAI && (
              <DiplomacyPanel
                gameState={gameState}
                currentPlayer={currentPlayer}
                onDiplomacyAction={handleDiplomacyAction}
                tradeOffers={tradeOffers}
                onAcceptTrade={handleAcceptTrade}
                onDeclineTrade={handleDeclineTrade}
              />
            )}
            {bottomTab === 'diplomacy' && currentPlayer?.isAI && (
              <div className="flex items-center justify-center h-full text-xs opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
                Diplomacy available during your turn
              </div>
            )}
            {bottomTab === 'log' && (
              <BattleLog entries={battleLog} />
            )}
          </div>
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