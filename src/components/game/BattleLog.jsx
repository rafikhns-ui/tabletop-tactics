import React, { useState } from 'react';

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

function BattleEntry({ entry, index }) {
  const [open, setOpen] = useState(false);
  const conquered = entry.conquered;

  return (
    <div className="rounded-lg overflow-hidden"
      style={{ background: 'hsl(35,20%,16%)', border: `1px solid ${conquered ? 'hsl(43,60%,30%)' : 'hsl(35,20%,26%)'}` }}>
      {/* Collapsed header */}
      <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:opacity-80 transition-opacity"
        onClick={() => setOpen(o => !o)}>
        <span className="text-xs font-bold w-5 text-center opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
          #{entry.turn}
        </span>
        <span className="flex-1 text-xs truncate" style={{ color: 'hsl(40,25%,78%)' }}>
          <span style={{ color: entry.attackerColor }}>{entry.attackerName}</span>
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
            {/* Attacker */}
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
                {(!entry.attackerUnits || entry.attackerUnits.length === 0) && (
                  <UnitTag unitType="infantry" count={entry.attackerTroopsBefore} variant="attacker" />
                )}
              </div>
              {entry.attackerLosses > 0 && (
                <div className="text-xs font-bold" style={{ color: 'hsl(0,65%,60%)' }}>
                  💀 -{entry.attackerLosses} casualties
                </div>
              )}
            </div>

            {/* Defender */}
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
                {(!entry.defenderUnits || entry.defenderUnits.length === 0) && (
                  <UnitTag unitType="infantry" count={entry.defenderTroopsBefore} variant="defender" />
                )}
                {entry.fortified && <UnitTag unitType="siege" count={1} variant="defender" />}
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

          {/* Dice rolls summary */}
          {(entry.aRolls || entry.dRolls) && (
            <div className="mt-2 flex gap-4 text-xs" style={{ color: 'hsl(40,20%,55%)' }}>
              {entry.aRolls && <span>⚔️ Rolled: {entry.aRolls.join(', ')}{entry.aBonus > 0 ? ` (+${entry.aBonus})` : ''}</span>}
              {entry.dRolls && <span>🛡️ Rolled: {entry.dRolls.join(', ')}{entry.dBonus > 0 ? ` (+${entry.dBonus})` : ''}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BattleLog({ entries }) {
  const [collapsed, setCollapsed] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-xs font-bold px-3 py-2 flex items-center justify-between flex-shrink-0"
          style={{ background: 'hsl(35,22%,14%)', color: 'hsl(43,80%,55%)', fontFamily: "'Cinzel',serif", borderBottom: '1px solid hsl(35,20%,25%)' }}>
          ⚔️ Battle Log
        </div>
        <div className="flex-1 flex items-center justify-center text-xs opacity-30" style={{ color: 'hsl(40,20%,60%)' }}>
          No battles yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="text-xs font-bold px-3 py-2 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
        style={{ background: 'hsl(35,22%,14%)', color: 'hsl(43,80%,55%)', fontFamily: "'Cinzel',serif", borderBottom: '1px solid hsl(35,20%,25%)' }}>
        <span>⚔️ Battle Log <span className="opacity-50 font-normal">({entries.length})</span></span>
        <button onClick={() => setCollapsed(c => !c)} className="opacity-40 hover:opacity-80">
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {[...entries].reverse().map((entry, i) => (
            <BattleEntry key={entry.id || i} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}