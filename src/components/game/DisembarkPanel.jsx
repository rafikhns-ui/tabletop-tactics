import React from 'react';
import mapData from './ardonia_game_map.json';
import { isNavalUnit } from '../../lib/embarkationLogic';
import { resolveRangedAttack } from './ardoniaLogic';

export default function DisembarkPanel({ selHexId, gameState, currentPlayer, setGameState, setSelected, addMessage, addLog, getNeighborHexIds }) {
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

  if (!canDisembark) return null;

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
    const dstHex = gameState.hexes?.[targetHexId] || {};
    const targetUnits = dstHex.units || [];
    
    if (targetUnits.length === 0) {
      addMessage(`⚔️ No units to attack on this coastal hex`);
      return;
    }

    const attackerUnits = [navalUnit];
    const result = resolveRangedAttack(attackerUnits, targetUnits, dstHex.buildings?.fortress);

    setGameState(prev => {
      const updatedDstHex = { ...prev.hexes[targetHexId] };
      const newUnits = targetUnits.map(u => ({
        ...u,
        count: Math.max(0, u.count - result.defenderLosses)
      })).filter(u => u.count > 0);
      
      return {
        ...prev,
        hexes: {
          ...prev.hexes,
          [targetHexId]: { ...updatedDstHex, units: newUnits }
        }
      };
    });

    addMessage(`⚔️ Reapership ranged attack on [{targetHexId}]! Enemy lost ${result.defenderLosses} unit${result.defenderLosses > 1 ? 's' : ''}`);
    addLog('attack', `Reapership ranged attack — No retaliation (siege-like)`, targetHexId, 'Ranged Attack');
  };

  // Check if this is a Reapership (ranged naval unit)
  const isReapership = navalUnit?.type === 'naval' && navalUnit?.name === 'Reapership' || navalUnit?.name === 'Infamous Reapership';
  const boatCanRangedAttack = boatOnWater && isReapership;

  return (
    <div style={{ marginTop: 12, padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #1a3a2a, #0e1a12)', border: '1px solid #4a8a6a' }}>
      <div style={{ color: '#7aaa8a', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⚓ DISEMBARK OPTIONS</div>
      <div style={{ fontSize: 10, color: '#8a9a8a', marginBottom: 8 }}>
        {embarked.length} unit{embarked.length > 1 ? 's' : ''} aboard · Available: {adjacentCoastal.length} adjacent coastal hex{adjacentCoastal.length !== 1 ? 'es' : ''}
      </div>
      {adjacentCoastal.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
          {adjacentCoastal.map(nId => {
            const nh = mapData.hex_grid.find(h => `${h.col},${h.row}` === nId);
            const dstHex = gameState.hexes?.[nId] || {};
            const targetOwner = dstHex.owner;
            const targetHasUnits = (dstHex.units || []).length > 0;
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
                  onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #2a6a5a, #1a3a2a)'; e.target.style.color = '#aacaaa'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #1a4a3a, #0a2a1a)'; e.target.style.color = '#8aaa9a'; }}
                >
                  Land [{nh.col},{nh.row}]
                </button>
                {boatCanRangedAttack && isEnemyTerritory && targetHasUnits && (
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
                    onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #6a4a3a, #4a2a1a)'; e.target.style.color = '#ffaa66'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #4a2a1a, #2a1a0a)'; e.target.style.color = '#ff8844'; }}
                  >
                    Attack [{nh.col},{nh.row}]
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 10, color: '#6a7a6a', fontStyle: 'italic' }}>No adjacent coastal hexes — move naval unit closer to coast</div>
      )}
    </div>
  );
}