import React from 'react';

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
                        [hexId]: { ...hex, units: disembarkedUnits, embarked: newEmbarked },
                      },
                    };
                  });
                  addMessage(`⚓ Disembarked 1 ${TYPE_NAMES[u.type]} from naval unit`);
                  addLog('disembark', `Disembarked 1 ${TYPE_NAMES[u.type]}`, null, 'Move');
                }}
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '3px 4px',
                  fontSize: 8,
                  background: '#2a4a4a',
                  border: '1px solid #4488ff',
                  color: '#88ccff',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 600,
                }}>
                Disembark
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}