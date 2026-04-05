import React from 'react';

const ENTRY_STYLES = {
  deploy:    { icon: '🏰', color: 'hsl(43,80%,60%)' },
  move:      { icon: '🚶', color: 'hsl(200,60%,60%)' },
  attack:    { icon: '⚔️', color: 'hsl(0,65%,60%)' },
  conquest:  { icon: '🏴', color: 'hsl(355,70%,55%)' },
  recruit:   { icon: '🗡️', color: 'hsl(120,45%,50%)' },
  build:     { icon: '🏗️', color: 'hsl(30,70%,55%)' },
  upgrade:   { icon: '⬆️', color: 'hsl(30,70%,55%)' },
  card:      { icon: '🃏', color: 'hsl(280,55%,60%)' },
  hero:      { icon: '⭐', color: 'hsl(43,90%,60%)' },
  ability:   { icon: '✨', color: 'hsl(43,80%,55%)' },
  avatar:    { icon: '👹', color: 'hsl(280,60%,65%)' },
  diplomacy: { icon: '🕊️', color: 'hsl(160,50%,50%)' },
  income:    { icon: '🪙', color: 'hsl(43,80%,55%)' },
  event:     { icon: '⚡', color: 'hsl(55,80%,55%)' },
  objective: { icon: '🏆', color: 'hsl(43,90%,65%)' },
  default:   { icon: '📌', color: 'hsl(40,20%,60%)' },
};

export default function TurnLog({ entries, currentTurn }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-30"
        style={{ color: 'hsl(40,20%,60%)' }}>
        <div className="text-3xl mb-2">📜</div>
        <div className="text-xs" style={{ fontFamily: "'Cinzel',serif" }}>No events yet this turn</div>
      </div>
    );
  }

  // Group by turn
  const byTurn = {};
  entries.forEach(e => {
    const t = e.turn ?? currentTurn;
    if (!byTurn[t]) byTurn[t] = [];
    byTurn[t].push(e);
  });
  const turns = Object.keys(byTurn).map(Number).sort((a, b) => b - a);

  return (
    <div className="p-3 space-y-4 overflow-y-auto">
      {turns.map(turn => (
        <div key={turn}>
          <div className="text-xs font-bold tracking-widest mb-2 pb-1"
            style={{
              fontFamily: "'Cinzel',serif",
              color: turn === currentTurn ? 'hsl(43,90%,65%)' : 'hsl(40,20%,48%)',
              borderBottom: `1px solid ${turn === currentTurn ? 'hsl(43,60%,30%)' : 'hsl(35,20%,25%)'}`,
            }}>
            {turn === currentTurn ? '▶ TURN ' + turn + ' (Current)' : 'TURN ' + turn}
          </div>
          <div className="space-y-1">
            {byTurn[turn].map((entry, i) => {
              const style = ENTRY_STYLES[entry.type] || ENTRY_STYLES.default;
              return (
                <div key={i} className="flex items-start gap-2.5 px-2 py-1.5 rounded"
                  style={{ background: 'hsl(35,20%,16%)', border: '1px solid hsl(35,20%,24%)' }}>
                  <span className="flex-shrink-0 text-sm mt-0.5">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {entry.playerName && (
                        <span className="text-xs font-bold" style={{ color: entry.playerColor || 'hsl(43,80%,60%)', fontFamily: "'Cinzel',serif", fontSize: '10px' }}>
                          {entry.playerName}
                        </span>
                      )}
                      {entry.phase && (
                        <span className="text-xs opacity-40" style={{ color: 'hsl(40,20%,55%)', fontSize: '9px' }}>[{entry.phase}]</span>
                      )}
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: style.color }}>{entry.text}</span>
                    {entry.detail && (
                      <div className="text-xs mt-0.5 opacity-60" style={{ color: 'hsl(40,20%,55%)' }}>{entry.detail}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}