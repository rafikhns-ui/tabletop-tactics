import React, { useState } from 'react';

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

const UNIT_ICONS = {
  infantry: '🗡️',
  cavalry: '🐴',
  elite: '⚡',
  ranged: '🏹',
  siege: '🏗️',
  naval: '⛵',
  default: '⚔️',
};

function UnitTag({ unitType, count, variant = 'neutral' }) {
  const icon = UNIT_ICONS[unitType] || UNIT_ICONS.default;
  const colors = {
    attacker: { bg: 'hsl(0,50%,20%)', border: 'hsl(0,60%,35%)', text: 'hsl(0,60%,70%)' },
    defender: { bg: 'hsl(220,40%,20%)', border: 'hsl(220,50%,35%)', text: 'hsl(220,60%,70%)' },
    neutral:  { bg: 'hsl(35,20%,20%)', border: 'hsl(35,20%,32%)', text: 'hsl(40,20%,65%)' },
  }[variant];

  return (
    <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
      {icon} {count > 1 && <span className="font-bold">{count}</span>}
    </span>
  );
}

function BattleEntry({ entry }) {
  const [open, setOpen] = useState(false);
  const conquered = entry.conquered;

  return (
    <div className="rounded-lg overflow-hidden"
      style={{ background: 'hsl(35,20%,16%)', border: `1px solid ${conquered ? 'hsl(43,60%,30%)' : 'hsl(35,20%,26%)'}` }}>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:opacity-80 transition-opacity"
        onClick={() => setOpen(o => !o)}>
        <span className="text-xs font-bold w-5 text-center opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
          #{entry.turn}
        </span>
        <span className="flex-1 text-xs truncate" style={{ color: 'hsl(40,25%,78%)' }}>
          <span style={{ color: entry.attackerColor }}>⚔️ {entry.attackerName}</span>
          <span className="opacity-40 mx-1">→</span>
          <span style={{ color: entry.defenderColor }}>{entry.defenderName}</span>
          <span className="opacity-50 mx-1">·</span>
          <span className="opacity-60">{entry.attackTerritory}</span>
        </span>
        <span className="text-xs flex-shrink-0">
          {conquered ? <span style={{ color: 'hsl(43,90%,65%)' }}>🏴 Conquered</span>
            : entry.attackerLosses > entry.defenderLosses
              ? <span style={{ color: 'hsl(0,60%,60%)' }}>🛡️ Held</span>
              : <span style={{ color: 'hsl(120,50%,55%)' }}>⚔️ Gained</span>}
        </span>
        <span className="text-xs opacity-30 ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: 'hsl(35,20%,24%)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded p-2" style={{ background: 'hsl(0,30%,14%)', border: '1px solid hsl(0,40%,25%)' }}>
              <div className="text-xs font-bold mb-1" style={{ fontFamily: "'Cinzel',serif", color: entry.attackerColor }}>
                🗡️ {entry.attackerName}
              </div>
              <div className="text-xs mb-1 opacity-60">{entry.attackTerritory}</div>
              <div className="text-xs mb-1.5" style={{ color: 'hsl(40,20%,60%)' }}>
                {entry.attackerTroopsBefore} → {entry.attackerTroopsBefore - entry.attackerLosses} troops
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {entry.attackerUnits?.map((u, i) => (
                  <UnitTag key={i} unitType={u.type} count={u.count} variant="attacker" />
                ))}
              </div>
              {entry.attackerLosses > 0 && (
                <div className="text-xs font-bold" style={{ color: 'hsl(0,65%,60%)' }}>
                  💀 -{entry.attackerLosses} casualties
                </div>
              )}
            </div>

            <div className="rounded p-2" style={{ background: 'hsl(220,30%,14%)', border: '1px solid hsl(220,40%,25%)' }}>
              <div className="text-xs font-bold mb-1" style={{ fontFamily: "'Cinzel',serif", color: entry.defenderColor }}>
                🛡️ {entry.defenderName}
              </div>
              <div className="text-xs mb-1 opacity-60">{entry.defendTerritory}</div>
              <div className="text-xs mb-1.5" style={{ color: 'hsl(40,20%,60%)' }}>
                {entry.defenderTroopsBefore} → {conquered ? 0 : entry.defenderTroopsBefore - entry.defenderLosses} troops
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {entry.defenderUnits?.map((u, i) => (
                  <UnitTag key={i} unitType={u.type} count={u.count} variant="defender" />
                ))}
              </div>
              {entry.defenderLosses > 0 && (
                <div className="text-xs font-bold" style={{ color: 'hsl(0,65%,60%)' }}>
                  💀 -{entry.defenderLosses} casualties
                </div>
              )}
              {entry.fortified && (
                <div className="text-xs mt-1" style={{ color: 'hsl(43,70%,55%)' }}>🏰 Fortified (+1 def)</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedLog({ entries, battleEntries, diplomaticEvents, currentTurn }) {
  const [activeTab, setActiveTab] = useState('turns');

  const hasContent = (entries?.length > 0) || (battleEntries?.length > 0) || (diplomaticEvents?.length > 0);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b" style={{ background: 'linear-gradient(135deg, hsl(35,22%,14%), hsl(35,20%,10%))' }}>
      {/* Tabs */}
      <div className="flex gap-0.5 flex-shrink-0 px-2 pt-2 border-b" style={{ borderColor: 'hsl(35,20%,25%)' }}>
        {[
          { id: 'turns', label: '📜 Turns', count: entries?.length || 0 },
          { id: 'battles', label: '⚔️ Battles', count: battleEntries?.length || 0 },
          { id: 'diplomacy', label: '🕊️ Diplomacy', count: diplomaticEvents?.length || 0 },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 text-xs font-bold transition-all rounded-t"
            style={{
              fontFamily: "'Cinzel',serif",
              background: activeTab === tab.id ? 'hsl(35,20%,18%)' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid hsl(43,80%,55%)' : '2px solid hsl(35,20%,25%)',
              color: activeTab === tab.id ? 'hsl(43,80%,60%)' : 'hsl(40,20%,55%)',
            }}>
            {tab.label} <span className="opacity-50 ml-1">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {!hasContent ? (
        <div className="flex-1 flex items-center justify-center text-xs opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
          No events yet
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'turns' && entries && entries.length > 0 ? (
            <div className="space-y-4">
              {(() => {
                const byTurn = {};
                entries.forEach(e => {
                  const t = e.turn ?? currentTurn;
                  if (!byTurn[t]) byTurn[t] = [];
                  byTurn[t].push(e);
                });
                const turns = Object.keys(byTurn).map(Number).sort((a, b) => b - a);
                return turns.map(turn => (
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
                ));
              })()}
            </div>
          ) : activeTab === 'turns' ? (
            <div className="text-xs text-center py-6 opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>No turn events yet</div>
          ) : null}

          {activeTab === 'battles' && battleEntries && battleEntries.length > 0 ? (
            <div className="space-y-1.5">
              {[...battleEntries].reverse().map((entry, i) => (
                <BattleEntry key={entry.id || i} entry={entry} />
              ))}
            </div>
          ) : activeTab === 'battles' ? (
            <div className="text-xs text-center py-6 opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>No battles yet</div>
          ) : null}

          {activeTab === 'diplomacy' && diplomaticEvents && diplomaticEvents.length > 0 ? (
            <div className="space-y-2">
              {[...diplomaticEvents].reverse().map((event, i) => {
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
                  <div key={i} className="p-2 rounded" style={{
                    background: 'hsl(35,20%,16%)',
                    border: `1px solid ${colors[event.type] || '#444'}33`,
                    borderLeft: `3px solid ${colors[event.type] || '#444'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{icons[event.type] || '📌'}</span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, color: colors[event.type] || '#888', fontSize: '12px' }}>
                        {event.text}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'hsl(40,20%,55%)', fontStyle: 'italic' }}>
                      Turn {event.turn}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'diplomacy' ? (
            <div className="text-xs text-center py-6 opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>No diplomatic events yet</div>
          ) : null}
        </div>
      )}
    </div>
  );
}