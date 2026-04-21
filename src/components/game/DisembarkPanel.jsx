import React, { useState } from 'react';
import mapData from './ardonia_game_map.json';
import { isNavalUnit } from '../../lib/embarkationLogic';
import { resolveRangedAttack } from './ardoniaLogic';
import BombardmentResultModal from './BombardmentResultModal';

export default function DisembarkPanel({ selHexId, gameState, currentPlayer, setGameState, setSelected, addMessage, addLog, getNeighborHexIds }) {
  const [bombardmentResult, setBombardmentResult] = useState(null);
  const [bombardmentTargetHex, setBombardmentTargetHex] = useState(null);

  const hexOwner = gameState?.hexes?.[selHexId]?.owner;
  const units = gameState?.hexes?.[selHexId]?.units || [];
  const embarked = gameState?.hexes?.[selHexId]?.embarked || [];
  const navalUnit = units.find(u => isNavalUnit(u.type));
  
  // Boat must be on water or coastal tile
  const boatTerrain = mapData.hex_grid.find(h => `${h.col},${h.row}` === selHexId)?.terrain;
  const boatOnWater = boatTerrain === 'water';
  const boatOnCoastal = boatTerrain === 'coastal';
  
  // Only allow disembark to adjacent coastal tiles
  const adjacentCoastal = getNeighborHexIds(selHexId).filter(nId => {
    const terrain = mapData.hex_grid.find(h => `${h.col},${h.row}` === nId)?.terrain;
    return terrain === 'coastal';
  });
  
  // Block disembark if boat is on water with no adjacent coastal tiles
  const hasValidDisembarkTarget = adjacentCoastal.length > 0 || boatOnCoastal;
  const canDisembark = navalUnit && embarked.length > 0 && hexOwner === currentPlayer?.id && !currentPlayer?.isAI && hasValidDisembarkTarget;
  
  // Check if this is a Reapership (ranged naval unit)
  const isReapership = navalUnit?.type === 'infamous_reapership' || navalUnit?.type === 'naval';
  const boatCanRangedAttack = (boatOnWater || boatOnCoastal) && isReapership;
  
  // Find adjacent coastal hexes with enemy units or structures for bombardment
  const bombardmentTargets = adjacentCoastal.filter(nId => {
    const hex = gameState?.hexes?.[nId];
    if (!hex) return false;
    const hasUnits = (hex.units || []).length > 0;
    const hasFortress = hex.buildings?.fortress;
    const isEnemy = hex.owner && hex.owner !== currentPlayer?.id;
    return isEnemy && (hasUnits || hasFortress);
  });
  
  const canNavalBombardment = boatCanRangedAttack && bombardmentTargets.length > 0;
  
  if (!canDisembark && !canNavalBombardment) return null;

  const handleDisembark = (targetHexId) => {
    const dstHex = gameState.hexes?.[targetHexId] || {};
    const targetOwner = dstHex.owner;
    const targetHasUnits = (dstHex.units || []).length > 0;
    const isEnemyTerritory = targetOwner && targetOwner !== currentPlayer.id;
    const isAttack = isEnemyTerritory && targetHasUnits;

    if (isAttack) {
      // Trigger attack instead of normal disembark
      addMessage(`⚔️ Attack triggered! Enemy units present on coastal hex!`);
      addLog('attack', `Disembarked units into enemy territory — combat initiated`, targetHexId, 'Attack');
      // For now, set selected to target to allow player to complete the attack
      setSelected({ col: 0, row: 0 }); // This will need proper hex data if you want to show it
      return;
    }

    setGameState(prev => {
      const srcHex = prev.hexes[selHexId] || {};
      const updatedDstHex = prev.hexes[targetHexId] || {};
      const mergedUnits = [...(updatedDstHex.units || []), ...(srcHex.embarked || [])];
      return {
        ...prev,
        hexes: {
          ...prev.hexes,
          [selHexId]: { ...srcHex, embarked: [] },
          [targetHexId]: { ...updatedDstHex, units: mergedUnits, owner: currentPlayer.id },
        },
      };
    });
    addMessage(`⚓ Land units disembarked to coastal hex!`);
    addLog('move', `Disembarked units to coastal hex`, null, 'Move');
    setSelected(null);
  };

  const handleRangedAttack = (targetHexId) => {
    const srcHex = gameState.hexes?.[selHexId] || {};
    
    // Check if this ship has already bombarded this turn
    if (srcHex.bombardedThisTurn) {
      addMessage(`⚓ This ship has already bombarded this turn!`);
      return;
    }

    const dstHex = gameState.hexes?.[targetHexId] || {};
    const targetUnits = dstHex.units || [];
    const targetHasFortress = dstHex.buildings?.fortress;
    
    if (targetUnits.length === 0 && !targetHasFortress) {
      addMessage(`⚔️ No units or structures to attack on this coastal hex`);
      return;
    }

    const attackerUnits = [navalUnit];
    const result = resolveRangedAttack(attackerUnits, targetUnits, targetHasFortress);
    
    // Show dice roll modal
    setBombardmentResult(result);
    setBombardmentTargetHex(targetHexId);
  };

  const handleBombardmentClose = () => {
    if (!bombardmentResult) return;
    
    const targetHexId = bombardmentTargetHex;
    const dstHex = gameState.hexes?.[targetHexId] || {};
    const targetUnits = dstHex.units || [];
    const targetHasFortress = dstHex.buildings?.fortress;

    setGameState(prev => {
      const srcHex = prev.hexes[selHexId] || {};
      const updatedDstHex = { ...prev.hexes[targetHexId] };
      const newUnits = targetUnits.map(u => ({
        ...u,
        count: Math.max(0, u.count - bombardmentResult.defenderLosses)
      })).filter(u => u.count > 0);
      
      let newBuildings = updatedDstHex.buildings;
      if (bombardmentResult.fortressDestroyed) {
        newBuildings = { ...newBuildings };
        delete newBuildings.fortress;
        if (Object.keys(newBuildings).length === 0) {
          newBuildings = undefined;
        }
      }
      
      return {
        ...prev,
        hexes: {
          ...prev.hexes,
          [selHexId]: { ...srcHex, bombardedThisTurn: true },
          [targetHexId]: { ...updatedDstHex, units: newUnits, buildings: newBuildings }
        }
      };
    });

    let attackMessage = `⚔️ Naval bombardment on [${targetHexId}]!`;
    if (bombardmentResult.defenderLosses > 0) {
      attackMessage += ` Enemy lost ${bombardmentResult.defenderLosses} unit${bombardmentResult.defenderLosses > 1 ? 's' : ''}`;
    }
    if (bombardmentResult.fortressDestroyed) {
      attackMessage += ` and the Fortress was destroyed!`;
    } else if (targetHasFortress) {
      attackMessage += ` (Fortress held)`;
    }
    addMessage(attackMessage);
    addLog('attack', `Naval bombardment — No retaliation`, targetHexId, 'Naval Bombardment');
    
    setBombardmentResult(null);
    setBombardmentTargetHex(null);
  };

  return (
    <>
      {bombardmentResult && (
        <BombardmentResultModal result={bombardmentResult} targetHexId={bombardmentTargetHex} onClose={handleBombardmentClose} />
      )}
      <div style={{ marginTop: 12, padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #1a3a2a, #0e1a12)', border: '1px solid #4a8a6a' }}>
      {/* Disembark section */}
      {canDisembark && (
        <>
          <div style={{ color: '#7aaa8a', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚓ DISEMBARK OPTIONS</div>
          <div style={{ fontSize: 10, color: '#8a9a8a', marginBottom: 8 }}>
            {embarked.length} unit{embarked.length > 1 ? 's' : ''} aboard · Available: {adjacentCoastal.length} adjacent coastal hex{adjacentCoastal.length !== 1 ? 'es' : ''}
          </div>
          {adjacentCoastal.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 8 }}>
              {adjacentCoastal.map(nId => {
                const nh = mapData.hex_grid.find(h => `${h.col},${h.row}` === nId);
                const dstHex = gameState.hexes?.[nId] || {};
                const targetOwner = dstHex.owner;
                const targetHasUnits = (dstHex.units || []).length > 0;
                const targetHasFortress = dstHex.buildings?.fortress;
                const isEnemyTerritory = targetOwner && targetOwner !== currentPlayer.id;
                return (
                  <div key={nId} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <button
                      onClick={() => handleDisembark(nId)}
                      style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #1a4a3a, #0a2a1a)',
                        border: '1px solid #5aaa7a',
                        borderRadius: 4,
                        color: '#8aaa9a',
                        fontSize: 10,
                        fontFamily: "'Cinzel', serif",
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2a6a5a, #1a3a2a)'; e.currentTarget.style.color = '#aacaaa'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #1a4a3a, #0a2a1a)'; e.currentTarget.style.color = '#8aaa9a'; }}
                    >
                      Land [{nh.col},{nh.row}]
                    </button>
                    {boatCanRangedAttack && isEnemyTerritory && (targetHasUnits || targetHasFortress) && (
                      <button
                        onClick={() => handleRangedAttack(nId)}
                        style={{
                          padding: '8px 12px',
                          background: 'linear-gradient(135deg, #4a2a1a, #2a1a0a)',
                          border: '1px solid #8a5a4a',
                          borderRadius: 4,
                          color: '#ff8844',
                          fontSize: 10,
                          fontFamily: "'Cinzel', serif",
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontWeight: 700,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #6a4a3a, #4a2a1a)'; e.currentTarget.style.color = '#ffaa66'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #4a2a1a, #2a1a0a)'; e.currentTarget.style.color = '#ff8844'; }}
                      >
                        Attack [{nh.col},{nh.row}]
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 10, color: '#6a7a6a', fontStyle: 'italic', marginBottom: 8 }}>No adjacent coastal hexes — move naval unit closer to coast</div>
          )}
        </>
      )}
      
      {/* Naval bombardment (always available when on water with enemies) */}
      {canNavalBombardment && (
        <>
          <div style={{ color: '#ff8844', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🔥 NAVAL BOMBARDMENT</div>
          <div style={{ fontSize: 10, color: '#8a9a8a', marginBottom: 8 }}>
            Bombard enemy targets on {bombardmentTargets.length} adjacent coastal hex{bombardmentTargets.length !== 1 ? 'es' : ''}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
            {bombardmentTargets.map(nId => {
              const nh = mapData.hex_grid.find(h => `${h.col},${h.row}` === nId);
              return (
                <button
                  key={nId}
                  onClick={() => handleRangedAttack(nId)}
                  style={{
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #4a2a1a, #2a1a0a)',
                    border: '1px solid #8a5a4a',
                    borderRadius: 4,
                    color: '#ff8844',
                    fontSize: 10,
                    fontFamily: "'Cinzel', serif",
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #6a4a3a, #4a2a1a)'; e.currentTarget.style.color = '#ffaa66'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #4a2a1a, #2a1a0a)'; e.currentTarget.style.color = '#ff8844'; }}
                >
                  🔥 Bombard [{nh.col},{nh.row}]
                </button>
              );
            })}
          </div>
        </>
      )}
      </div>
    </>
  );
}