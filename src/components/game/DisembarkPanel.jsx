import React from 'react';
import mapData from './ardonia_game_map.json';
import { isNavalUnit } from '../../lib/embarkationLogic';

export default function DisembarkPanel({ selHexId, gameState, currentPlayer, setGameState, setSelected, addMessage, addLog, getNeighborHexIds }) {
  const hexOwner = gameState?.hexes?.[selHexId]?.owner;
  const units = gameState?.hexes?.[selHexId]?.units || [];
  const embarked = gameState?.hexes?.[selHexId]?.embarked || [];
  const navalUnit = units.find(u => isNavalUnit(u.type));
  
  // Boat must be on water or coastal tile
  const boatTerrain = mapData.hex_grid.find(h => `${h.col},${h.row}` === selHexId)?.terrain;
  const boatOnWaterOrCoastal = boatTerrain === 'water' || boatTerrain === 'coastal';
  const canDisembark = navalUnit && embarked.length > 0 && hexOwner === currentPlayer?.id && !currentPlayer?.isAI && boatOnWaterOrCoastal;

  if (!canDisembark) return null;

  // Only allow disembark to adjacent coastal tiles
  const adjacentCoastal = getNeighborHexIds(selHexId).filter(nId => {
    const terrain = mapData.hex_grid.find(h => `${h.col},${h.row}` === nId)?.terrain;
    return terrain === 'coastal';
  });

  const handleDisembark = (targetHexId) => {
    setGameState(prev => {
      const srcHex = prev.hexes[selHexId] || {};
      const dstHex = prev.hexes[targetHexId] || {};
      const mergedUnits = [...(dstHex.units || []), ...(srcHex.embarked || [])];
      return {
        ...prev,
        hexes: {
          ...prev.hexes,
          [selHexId]: { ...srcHex, embarked: [] },
          [targetHexId]: { ...dstHex, units: mergedUnits, owner: currentPlayer.id },
        },
      };
    });
    addMessage(`⚓ Land units disembarked to coastal hex!`);
    addLog('move', `Disembarked units to coastal hex`, null, 'Move');
    setSelected(null);
  };

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
            return (
              <button
                key={nId}
                onClick={() => handleDisembark(nId)}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #1a4a3a, #0a2a1a)',
                  border: '1px solid #5aaa7a',
                  borderRadius: 4,
                  color: '#8aaa9a',
                  fontSize: 11,
                  fontFamily: "'Cinzel', serif",
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #2a6a5a, #1a3a2a)'; e.target.style.color = '#aacaaa'; }}
                onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #1a4a3a, #0a2a1a)'; e.target.style.color = '#8aaa9a'; }}
              >
                Land at [{nh.col},{nh.row}]
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 10, color: '#6a7a6a', fontStyle: 'italic' }}>No adjacent coastal hexes — move naval unit closer to coast</div>
      )}
    </div>
  );
}