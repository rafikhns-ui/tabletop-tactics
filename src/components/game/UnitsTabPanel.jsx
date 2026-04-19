import React from 'react';
import TransportedUnitsPanel from './TransportedUnitsPanel';

const ICONS = { infantry: '🏃', cavalry: '🐴', elite: '⭐', ranged: '🏹', siege: '🏰', naval: '⚓', infamous_reapership: '⚓' };
const TYPE_NAMES = { infantry: 'Infantry', cavalry: 'Cavalry', elite: 'Elite Guard', ranged: 'Ranged', siege: 'Siege Engine', naval: 'Warship', infamous_reapership: 'Infamous Reapership' };

export default function UnitsTabPanel({
  selected,
  gameState,
  currentPlayer,
  movedHexes,
  phase,
  onSelectPanelUnit,
  getUnits,
  getOwner,
  setGameState,
  addMessage,
  addLog,
  selectedPanelUnits,
  setSelectedPanelUnits,
}) {
  if (!selected) return null;

  const hexId = `${selected.col},${selected.row}`;
  const panelUnits = getUnits(hexId);
  const hexOwner = getOwner(hexId, selected?.nation_id);
  const isMyHex = hexOwner === currentPlayer?.id;
  const alreadyMoved = movedHexes?.has(hexId);
  const canMove = (phase === 'move' || phase === 'deploy' || phase === 'attack' || phase === 'fortify') && isMyHex && !currentPlayer?.isAI && !alreadyMoved;
  const hasNavalUnits = panelUnits.some(u => u.type === 'naval' || u.type === 'infamous_reapership');
  const hasLandUnits = panelUnits.some(u => u.type !== 'naval' && u.type !== 'infamous_reapership');

  const toggleUnit = (idx) => {
    if (alreadyMoved) return;
    setSelectedPanelUnits(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleMoveSelected = () => {
    if (selectedPanelUnits.size === 0 || !onSelectPanelUnit) return;
    const selectedUnitTypes = [...selectedPanelUnits].map(idx => panelUnits[idx]);
    onSelectPanelUnit(hexId, selectedUnitTypes);
    setSelectedPanelUnits(new Set());
  };

  return (
    <div>
      <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        UNITS ON HEX
      </div>
      {hasNavalUnits && hasLandUnits && (
        <div style={{ fontSize: 11, color: '#ff9900', marginBottom: 8, padding: '6px 8px', background: 'rgba(255,153,0,0.1)', border: '1px solid #ff9900', borderRadius: 4 }}>
          ⚓ Naval units can only move to water tiles
        </div>
      )}
      {hasNavalUnits && !hasLandUnits && (
        <div style={{ fontSize: 11, color: '#4488ff', marginBottom: 8, padding: '6px 8px', background: 'rgba(68,136,255,0.1)', border: '1px solid #4488ff', borderRadius: 4 }}>
          ⚓ Naval unit — restricted to water tiles only
        </div>
      )}
      {alreadyMoved && (
        <div style={{ fontSize: 11, color: '#c08030', marginBottom: 8, padding: '6px 8px', background: 'rgba(192,128,48,0.1)', border: '1px solid #8a6a30', borderRadius: 4 }}>
          This unit already moved this turn
        </div>
      )}
      {isMyHex && !currentPlayer?.isAI && (
        <div style={{ fontSize: 11, color: '#7a9a7a', marginBottom: 8, padding: '6px 8px', background: 'rgba(100,160,100,0.1)', border: '1px solid #3a5a3a', borderRadius: 4 }}>
          Click units to select · then click destination on map
        </div>
      )}
      {panelUnits.length > 0 ? (
        <div>
          {panelUnits.map((u, i) => {
            const isSelected = selectedPanelUnits.has(i);
            return (
              <div key={i}
                onClick={() => toggleUnit(i)}
                style={{
                  fontSize: 13,
                  color: alreadyMoved ? '#555' : isSelected ? '#d4a853' : '#c8c0b0',
                  marginBottom: 6,
                  paddingBottom: 6,
                  padding: '8px',
                  borderRadius: 4,
                  cursor: alreadyMoved ? 'not-allowed' : (isMyHex && !currentPlayer?.isAI ? 'pointer' : 'default'),
                  background: isSelected ? 'rgba(212,168,83,0.15)' : 'transparent',
                  border: isSelected ? '1px solid #d4a853' : '1px solid transparent',
                  opacity: alreadyMoved ? 0.5 : 1,
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                {isMyHex && !currentPlayer?.isAI && (
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, border: '1.5px solid',
                    borderColor: isSelected ? '#d4a853' : '#555',
                    background: isSelected ? '#d4a853' : 'transparent',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#1a1a1a',
                  }}>
                    {isSelected ? '✓' : ''}
                  </div>
                )}
                <span style={{ fontSize: 18 }}>{ICONS[u.type] || '⚔️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 12 }}>{TYPE_NAMES[u.type] || u.type}</div>
                  {u.count > 1 && <div style={{ fontSize: 11, color: '#7a6a50' }}>×{u.count} units</div>}
                  {(u.type === 'naval' || u.type === 'infamous_reapership') && <div style={{ fontSize: 10, color: '#4488ff', marginTop: 2, fontWeight: 600 }}>⚓ Naval · Water-only · Transport 3</div>}
                  {(u.type === 'naval' || u.type === 'infamous_reapership') && (() => {
                    const embarked = gameState?.hexes?.[hexId]?.embarked || [];
                    const count = embarked.reduce((s, e) => s + e.count, 0);
                    return count > 0 ? <div style={{ fontSize: 10, color: '#ffcc44', marginTop: 2 }}>👥 Carrying {count}/3 unit{count > 1 ? 's' : ''} embarked</div> : null;
                  })()}
                  {u.type === 'siege' && <div style={{ fontSize: 10, color: '#ff8844', marginTop: 2 }}>🏰 +1 attack vs fortified · d8</div>}
                  {u.type === 'elite' && <div style={{ fontSize: 10, color: '#f0c040', marginTop: 2 }}>⭐ +1 die · Can capture · d10</div>}
                  {u.type === 'cavalry' && <div style={{ fontSize: 10, color: '#d4a853', marginTop: 2 }}>🐴 +1 movement · Cannot defend · d8</div>}
                  {u.type === 'ranged' && <div style={{ fontSize: 10, color: '#88ff88', marginTop: 2 }}>🏹 Ranged attack · d8</div>}
                </div>
              </div>
            );
          })}
          {isMyHex && !currentPlayer?.isAI && selectedPanelUnits.size > 0 && (
            <button
              onClick={handleMoveSelected}
              style={{
                width: '100%', marginTop: 8, padding: '8px',
                background: 'linear-gradient(135deg, #3a6a3a, #2a4a2a)',
                border: '1px solid #5a9a5a', borderRadius: 4,
                color: '#9afa9a', fontFamily: "'Cinzel', serif",
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                letterSpacing: 0.5,
              }}>
              🚶 Move {selectedPanelUnits.size} unit{selectedPanelUnits.size > 1 ? 's' : ''} — click destination
            </button>
          )}
          <TransportedUnitsPanel
            hexId={hexId}
            embarked={gameState?.hexes?.[hexId]?.embarked || []}
            panelUnits={panelUnits}
            isMyHex={isMyHex}
            currentPlayer={currentPlayer}
            gameState={gameState}
            setGameState={setGameState}
            addMessage={addMessage}
            addLog={addLog}
          />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>No units on this hex</div>
      )}
    </div>
  );
}