export default function DiplomacyLog({ gameState }) {
  const events = gameState?.diplomaticEvents || [];
  const sortedEvents = [...events].reverse();

  return (
    <div style={{ padding: 16, overflowY: 'auto', fontSize: 12 }}>
      <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
        Diplomatic Timeline
      </div>
      {sortedEvents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#555', marginTop: 40, fontStyle: 'italic' }}>
          No diplomatic events yet
        </div>
      ) : (
        <div style={{ space: 'y-3' }}>
          {sortedEvents.map((event, i) => {
            const icons = {
              alliance: '⚔️',
              war: '⚠️',
              neutral: '🤝',
              trade_offer: '📜',
              trade_accepted: '✅',
              trade_declined: '❌',
            };
            const colors = {
              alliance: '#27ae60',
              war: '#e74c3c',
              neutral: '#888',
              trade_offer: '#d4a853',
              trade_accepted: '#27ae60',
              trade_declined: '#e74c3c',
            };
            return (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  padding: 8,
                  background: '#0a0c12',
                  border: `1px solid ${colors[event.type] || '#444'}33`,
                  borderRadius: 3,
                  borderLeft: `3px solid ${colors[event.type] || '#444'}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{icons[event.type] || '📌'}</span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: colors[event.type] || '#888' }}>
                    {event.text}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>
                  Turn {event.turn}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}