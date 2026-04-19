import React from 'react';
import mapData from './ardonia_game_map.json';

const ICONS = { infantry: '🏃', cavalry: '🐴', elite: '⭐', ranged: '🏹', siege: '🏰', naval: '⚓' };
const TYPE_NAMES = { infantry: 'Infantry', cavalry: 'Cavalry', elite: 'Elite Guard', ranged: 'Ranged', siege: 'Siege Engine', naval: 'Warship' };

export default function TransportedUnitsPanel({ 
  hexId, 
  embarked, 
  panelUnits, 
  isMyHex, 
  currentPlayer, 
  gameState, 
  setGameState, 
  addMessage, 
  addLog 
}) {
  if (embarked.length === 0) return null;

  // Check if boat can disembark (must be on water or coastal)
  const boatTerrain = mapData.hex_grid.find(h => `${h.col},${h.row}` === hexId)?.terrain;
  const boatOnWater = boatTerrain === 'water';
  const boatOnCoastal = boatTerrain === 'coastal';
  
  // Get adjacent coastal tiles (only if on water)
  const [col, row] = hexId.split(',').map(Number);
  const even = col % 2 === 0;
  const neighbors = [
    [col+1, even ? row-1 : row], [col+1, even ? row : row+1],
    [col-1, even ? row-1 : row], [col-1, even ? row : row+1],
    [col, row-1], [col, row+1],
  ];
  const adjacentCoastal = neighbors.filter(([c, r]) => {
    const terrain = mapData.hex_grid.find(h => h.col === c && h.row === r)?.terrain;
    return terrain === 'coastal';
  }).length > 0;
  
  // Can only disembark if on coastal directly, or on water with adjacent coastal
  const canDisembark = boatOnCoastal || (boatOnWater && adjacentCoastal);

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2520' }}>
      <div style={{ color: '#4488ff', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
        👥 TRANSPORTED UNITS ({embarked.reduce((s, u) => s + u.count, 0)}/3)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {embarked.map((u, i) => (
          <div key={i} style={{
            padding: '8px',
            background: 'rgba(68,136,255,0.1)',
            border: '1px solid #4488ff',
            borderRadius: 4,
            fontSize: 10,
            color: '#aaa',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: '#4488ff', fontWeight: 600 }}>{ICONS[u.type] || '⚔️'}</div>
            <div style={{ fontSize: 9, marginTop: 2 }}>{TYPE_NAMES[u.type] || u.type}</div>
            <div style={{ fontSize: 9, color: '#88ccff', fontWeight: 600, marginTop: 2 }}>×{u.count}</div>
            {isMyHex && !currentPlayer?.isAI && (
              <button
                onClick={() => {
                  if (!canDisembark) {
                    addMessage(`⛔ Must be on or adjacent to coastal tile to disembark`);
                    return;
                  }
                  const targetHex = gameState.hexes?.[hexId] || {};
                  const targetOwner = targetHex.owner;
                  const targetHasUnits = (targetHex.units || []).length > 0;
                  const isEnemyTerritory = targetOwner && targetOwner !== currentPlayer.id;
                  
                  if (isEnemyTerritory && targetHasUnits) {
                    addMessage(`⚔️ Attack triggered! Enemy units on this hex!`);
                    addLog('attack', `Disembarked units into enemy territory — combat initiated`, hexId, 'Attack');
                    return;
                  }
                  
                  setGameState(prev => {
                    const hex = prev.hexes[hexId] || {};
                    const newEmbarked = embarked.map((e, idx) => idx === i ? { ...e, count: e.count - 1 } : e).filter(e => e.count > 0);
                    const disembarkedUnits = [...(hex.units || [])];
                    const existing = disembarkedUnits.find(ud => ud.type === u.type);
                    if (existing) existing.count += 1;
                    else disembarkedUnits.push({ type: u.type, count: 1 });
                    return {
                      ...prev,
                      hexes: {
                        ...prev.hexes,
                        [hexId]: { ...hex, units: disembarkedUnits, embarked: newEmbarked, owner: currentPlayer.id },
                      },
                    };
                  });
                  addMessage(`⚓ Disembarked 1 ${TYPE_NAMES[u.type]} from naval unit`);
                  addLog('disembark', `Disembarked 1 ${TYPE_NAMES[u.type]}`, null, 'Move');
                }}
                disabled={!canDisembark}
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '3px 4px',
                  fontSize: 8,
                  background: canDisembark ? '#2a4a4a' : '#1a2a2a',
                  border: `1px solid ${canDisembark ? '#4488ff' : '#2a5a5a'}`,
                  color: canDisembark ? '#88ccff' : '#4a6a6a',
                  borderRadius: 2,
                  cursor: canDisembark ? 'pointer' : 'not-allowed',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 600,
                  opacity: canDisembark ? 1 : 0.5,
                }}>
                {canDisembark ? 'Disembark' : 'No Coast'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}