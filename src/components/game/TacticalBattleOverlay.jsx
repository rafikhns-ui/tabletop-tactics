import React, { useState, useEffect } from 'react';
import { FACTIONS, UNIT_DEFS } from './ardoniaData';

const DIE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const UNIT_ICONS = { infantry: '🗡️', cavalry: '🐴', elite: '⚡', ranged: '🏹', siege: '🏗️', naval: '⛵' };
const UNIT_COLORS = {
  infantry: '#7a9a3a', cavalry: '#8b6a1a', elite: '#d4a853',
  ranged: '#5dade2', siege: '#7f8c8d', naval: '#1a5a8b',
};

const TERRAIN_INFO = {
  forest:   { icon: '🌲', color: '#3d6e3d', atkNote: 'Cavalry -1', defNote: 'Defender +1, Ranged +1' },
  mountain: { icon: '⛰️', color: '#4a4a5a', atkNote: 'Cavalry -1', defNote: 'Defender +2' },
  hills:    { icon: '🏔️', color: '#6a6030', atkNote: 'Cavalry -1, Siege +1', defNote: 'Defender +2' },
  plains:   { icon: '🌾', color: '#5a7a30', atkNote: 'Cavalry +1', defNote: '—' },
  desert:   { icon: '🏜️', color: '#9a7a30', atkNote: 'Attacker -1', defNote: '—' },
  swamp:    { icon: '🌿', color: '#3a4a2a', atkNote: 'Attacker -1, Cavalry -2', defNote: '—' },
  coastal:  { icon: '🌊', color: '#2a6080', atkNote: 'Naval +1, Ranged +1', defNote: '—' },
  water:    { icon: '🌊', color: '#183a5c', atkNote: 'Naval +1', defNote: '—' },
  tundra:   { icon: '❄️', color: '#7a8a9a', atkNote: 'Cavalry -1', defNote: '—' },
  scorched: { icon: '🔥', color: '#4a1a0a', atkNote: 'Attacker +1', defNote: '—' },
};

// Compute per-unit type bonus breakdown
function getUnitBonuses(units) {
  const items = [];
  let total = 0;
  (units || []).forEach(u => {
    const def = UNIT_DEFS[u.type];
    let bonus = 0;
    let note = '';
    if (u.type === 'cavalry')  { bonus = 2; note = 'Cavalry charge +2'; }
    if (u.type === 'elite')    { bonus = 3; note = 'Elite guard +3 ATK'; }
    if (u.type === 'ranged')   { bonus = 1; note = 'Ranged support +1'; }
    if (u.type === 'siege')    { bonus = 2; note = 'Siege power +2'; }
    if (bonus > 0) {
      items.push({ type: u.type, count: u.count, bonus, note, icon: UNIT_ICONS[u.type] || '⚔️', color: UNIT_COLORS[u.type] || '#888' });
      total += bonus;
    }
  });
  return { items, total };
}

// Animated dice component
function AnimatedDie({ value, delay = 0, rolling }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!rolling) { setDisplay(value); return; }
    let i = 0;
    const t = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 6) + 1);
      i++;
      if (i > 8) { clearInterval(t); setDisplay(value); }
    }, 80);
    return () => clearInterval(t);
  }, [rolling, value]);

  const face = DIE_FACES[display] || display;
  const isHigh = value >= 5;
  const isLow = value <= 2;
  return (
    <div
      className="flex items-center justify-center rounded-lg font-black text-2xl transition-all"
      style={{
        width: 44, height: 44, minWidth: 44,
        background: isHigh ? 'rgba(100,220,100,0.15)' : isLow ? 'rgba(220,60,60,0.15)' : 'rgba(212,168,83,0.1)',
        border: `2px solid ${isHigh ? '#4ade80' : isLow ? '#f87171' : '#d4a853'}`,
        boxShadow: isHigh ? '0 0 8px rgba(74,222,128,0.4)' : isLow ? '0 0 8px rgba(248,113,113,0.4)' : 'none',
        animationDelay: `${delay}ms`,
        color: isHigh ? '#4ade80' : isLow ? '#f87171' : '#d4a853',
      }}>
      {face}
    </div>
  );
}

// Section header
function SectionHeader({ icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: color || '#d4a853', fontFamily: "'Cinzel',serif" }}>{label}</span>
      <div className="flex-1 border-t" style={{ borderColor: color || '#3a2a10', opacity: 0.4 }} />
    </div>
  );
}

// Modifier row
// Note: `color` was originally in the signature but never read in the body —
// the +/0/- coloring is hard-coded from `value`. Dropped to match the actual
// runtime contract and match every caller's prop shape.
function ModifierRow({ icon, label, value, sublabel }) {
  const isPos = value > 0;
  const isNeg = value < 0;
  return (
    <div className="flex items-center justify-between gap-2 py-1 px-2 rounded mb-1"
      style={{ background: isPos ? 'rgba(74,222,128,0.07)' : isNeg ? 'rgba(248,113,113,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isPos ? 'rgba(74,222,128,0.2)' : isNeg ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: 13 }}>{icon}</span>
        <div>
          <div className="text-xs" style={{ color: '#c8c0b0' }}>{label}</div>
          {sublabel && <div className="text-xs opacity-50" style={{ color: '#888' }}>{sublabel}</div>}
        </div>
      </div>
      <div className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: isPos ? '#4ade80' : isNeg ? '#f87171' : '#888', minWidth: 32, textAlign: 'right' }}>
        {value === 0 ? '—' : (isPos ? `+${value}` : value)}
      </div>
    </div>
  );
}

// Combat round visualizer
function RoundLog({ round, aRoll, dRoll, aBonus, dBonus, attackerWins, rolling }) {
  const aTotal = aRoll + aBonus;
  const dTotal = dRoll + dBonus;
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded mb-1.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-xs font-bold w-12 shrink-0" style={{ color: '#888', fontFamily: "'Cinzel',serif" }}>Rnd {round}</div>
      <div className="flex items-center gap-1 flex-1">
        <AnimatedDie value={aRoll} rolling={rolling} delay={round * 80} />
        {aBonus !== 0 && <span className="text-xs" style={{ color: aBonus > 0 ? '#4ade80' : '#f87171' }}>{aBonus > 0 ? `+${aBonus}` : aBonus}</span>}
        <span className="text-xs opacity-40 mx-1">→</span>
        <span className="text-sm font-bold" style={{ color: '#d4a853', fontFamily: "'Cinzel',serif" }}>{aTotal}</span>
      </div>
      <div className="text-xs font-bold px-2" style={{ color: attackerWins ? '#4ade80' : '#f87171' }}>
        {attackerWins ? '⚔️ A wins' : '🛡️ D holds'}
      </div>
      <div className="flex items-center gap-1 flex-1 justify-end">
        <span className="text-sm font-bold" style={{ color: '#d4a853', fontFamily: "'Cinzel',serif" }}>{dTotal}</span>
        <span className="text-xs opacity-40 mx-1">←</span>
        {dBonus !== 0 && <span className="text-xs" style={{ color: dBonus > 0 ? '#4ade80' : '#f87171' }}>{dBonus > 0 ? `+${dBonus}` : dBonus}</span>}
        <AnimatedDie value={dRoll} rolling={rolling} delay={round * 80 + 40} />
      </div>
    </div>
  );
}

export default function TacticalBattleOverlay({
  gameState, battle, result, rolling,
  attackerHeroBonus, defenderHeroBonus,
  attackerHero, defenderHero,
  defenderTerrain,
}) {
  const { territories, players } = gameState;
  const attacker = territories[battle.attackerId];
  const defender = territories[battle.defenderId];
  const attackerPlayer = players.find(p => p.id === attacker?.owner);
  const defenderPlayer = players.find(p => p.id === defender?.owner);

  const attackerFaction = FACTIONS[attackerPlayer?.factionId];
  const defenderFaction = FACTIONS[defenderPlayer?.factionId];
  const attackerLeader = attackerPlayer?.leader;
  const defenderLeader = defenderPlayer?.leader;

  const attackerUnits = attacker?.units?.length > 0 ? attacker.units : [{ type: 'infantry', count: attacker?.troops || 0 }];
  const defenderUnits = defender?.units?.length > 0 ? defender.units : [{ type: 'infantry', count: defender?.troops || 0 }];

  const atkUnitBonuses = getUnitBonuses(attackerUnits);
  const defUnitBonuses = getUnitBonuses(defenderUnits);

  const terrainInfo = TERRAIN_INFO[defenderTerrain] || null;

  // Build round-by-round log from result
  const roundLog = result ? result.aRolls.map((ar, i) => {
    const dr = result.dRolls[i] ?? 0;
    const aT = ar + result.aBonus;
    const dT = dr + result.dBonus;
    return { round: i + 1, aRoll: ar, dRoll: dr, aBonus: result.aBonus, dBonus: result.dBonus, attackerWins: aT > dT };
  }) : [];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(160deg, #0d1017, #12151e)',
      border: '1px solid rgba(212,168,83,0.2)',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: "'Crimson Text', serif",
    }}>
      {/* Header */}
      <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(212,168,83,0.15)', background: 'rgba(212,168,83,0.04)' }}>
        <span style={{ fontSize: 14 }}>📋</span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4a853', fontFamily: "'Cinzel',serif" }}>Tactical Analysis</span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3">
        {/* ── ATTACKER COLUMN ── */}
        <div>
          {/* Faction + Nation */}
          <div className="mb-2 p-2 rounded" style={{ background: `${attackerPlayer?.color}18`, border: `1px solid ${attackerPlayer?.color}44` }}>
            <div className="text-xs font-bold" style={{ color: attackerPlayer?.color, fontFamily: "'Cinzel',serif" }}>
              {attackerFaction?.emoji} {attackerPlayer?.name}
            </div>
            {attackerFaction && <div className="text-xs opacity-60" style={{ color: '#c8c0b0' }}>{attackerFaction.name}</div>}
          </div>

          {/* Units */}
          <SectionHeader icon="⚔️" label="Army" color="#e74c3c" />
          {attackerUnits.map(u => (
            <div key={u.type} className="flex items-center gap-2 mb-1 text-xs" style={{ color: '#c8c0b0' }}>
              <span style={{ fontSize: 14 }}>{UNIT_ICONS[u.type] || '⚔️'}</span>
              <span className="flex-1">{UNIT_DEFS[u.type]?.name || u.type}</span>
              <span className="font-bold" style={{ color: UNIT_COLORS[u.type] || '#d4a853', fontFamily: "'Cinzel',serif" }}>×{u.count}</span>
            </div>
          ))}

          {/* Unit bonuses */}
          {atkUnitBonuses.items.length > 0 && (
            <div className="mt-2">
              <SectionHeader icon="💥" label="Unit Bonuses" color="#e67e22" />
              {atkUnitBonuses.items.map((b, i) => (
                <ModifierRow key={i} icon={b.icon} label={b.note} value={b.bonus} sublabel={`×${b.count} ${b.type}`} />
              ))}
            </div>
          )}

          {/* Leader bonus */}
          {attackerLeader && (
            <div className="mt-2">
              <SectionHeader icon="👑" label="Leader" color="#d4a853" />
              <ModifierRow icon="⭐" label={attackerLeader.name} value={0} sublabel={attackerLeader.passive?.slice(0, 40) + '…'} />
            </div>
          )}

          {/* Hero bonus */}
          {attackerHero && attackerHeroBonus.attackBonus > 0 && (
            <div className="mt-2">
              <SectionHeader icon="🦸" label="Hero" color="#9b59b6" />
              <ModifierRow icon="⚡" label={attackerHero.name} value={attackerHeroBonus.attackBonus} sublabel="Attack bonus" />
            </div>
          )}

          {/* Faction special rule */}
          {attackerFaction?.specialRule && (
            <div className="mt-2">
              <SectionHeader icon="⚜️" label="Faction Rule" color="#5dade2" />
              <div className="text-xs px-2 py-1 rounded" style={{ color: '#7a9aaa', background: 'rgba(93,173,226,0.06)', border: '1px solid rgba(93,173,226,0.15)' }}>
                {attackerFaction.specialRule}
              </div>
            </div>
          )}

          {/* Final attack bonus */}
          {result && (
            <div className="mt-3 p-2 rounded text-center" style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)' }}>
              <div className="text-xs opacity-60" style={{ fontFamily: "'Cinzel',serif" }}>TOTAL ATK BONUS</div>
              <div className="text-xl font-black" style={{ color: '#e74c3c', fontFamily: "'Cinzel',serif" }}>
                +{result.aBonus}
              </div>
            </div>
          )}
        </div>

        {/* ── DEFENDER COLUMN ── */}
        <div>
          {/* Faction + Nation */}
          <div className="mb-2 p-2 rounded" style={{ background: `${defenderPlayer?.color}18`, border: `1px solid ${defenderPlayer?.color}44` }}>
            <div className="text-xs font-bold" style={{ color: defenderPlayer?.color, fontFamily: "'Cinzel',serif" }}>
              {defenderFaction?.emoji} {defenderPlayer?.name}
            </div>
            {defenderFaction && <div className="text-xs opacity-60" style={{ color: '#c8c0b0' }}>{defenderFaction.name}</div>}
          </div>

          {/* Units */}
          <SectionHeader icon="🛡️" label="Garrison" color="#3498db" />
          {defenderUnits.map(u => (
            <div key={u.type} className="flex items-center gap-2 mb-1 text-xs" style={{ color: '#c8c0b0' }}>
              <span style={{ fontSize: 14 }}>{UNIT_ICONS[u.type] || '🛡️'}</span>
              <span className="flex-1">{UNIT_DEFS[u.type]?.name || u.type}</span>
              <span className="font-bold" style={{ color: UNIT_COLORS[u.type] || '#5dade2', fontFamily: "'Cinzel',serif" }}>×{u.count}</span>
            </div>
          ))}

          {/* Unit bonuses */}
          {defUnitBonuses.items.length > 0 && (
            <div className="mt-2">
              <SectionHeader icon="🏹" label="Unit Bonuses" color="#2980b9" />
              {defUnitBonuses.items.map((b, i) => (
                <ModifierRow key={i} icon={b.icon} label={b.note} value={b.bonus} sublabel={`×${b.count} ${b.type}`} />
              ))}
            </div>
          )}

          {/* Terrain */}
          {terrainInfo && (
            <div className="mt-2">
              <SectionHeader icon="🗺️" label="Terrain" color="#27ae60" />
              <div className="p-2 rounded mb-1" style={{ background: `${terrainInfo.color}22`, border: `1px solid ${terrainInfo.color}44` }}>
                <div className="text-xs font-bold mb-1" style={{ color: '#c8c0b0' }}>
                  {terrainInfo.icon} <span className="capitalize">{defenderTerrain}</span>
                </div>
                <div className="text-xs" style={{ color: '#888' }}>⚔️ Atk: {terrainInfo.atkNote}</div>
                <div className="text-xs" style={{ color: '#888' }}>🛡️ Def: {terrainInfo.defNote}</div>
              </div>
            </div>
          )}

          {/* Fortress */}
          {defender?.hasFortress && (
            <div className="mt-2">
              <SectionHeader icon="🏰" label="Fortress" color="#d4a853" />
              <ModifierRow icon="🏰" label="Fortress walls" value={3} sublabel="Defense fortification" />
            </div>
          )}

          {/* Leader bonus */}
          {defenderLeader && (
            <div className="mt-2">
              <SectionHeader icon="👑" label="Leader" color="#d4a853" />
              <ModifierRow icon="⭐" label={defenderLeader.name} value={0} sublabel={defenderLeader.passive?.slice(0, 40) + '…'} />
            </div>
          )}

          {/* Hero bonus */}
          {defenderHero && defenderHeroBonus.defenseBonus > 0 && (
            <div className="mt-2">
              <SectionHeader icon="🦸" label="Hero" color="#9b59b6" />
              <ModifierRow icon="🛡️" label={defenderHero.name} value={defenderHeroBonus.defenseBonus} sublabel="Defense bonus" />
            </div>
          )}

          {/* Faction special rule */}
          {defenderFaction?.specialRule && (
            <div className="mt-2">
              <SectionHeader icon="⚜️" label="Faction Rule" color="#5dade2" />
              <div className="text-xs px-2 py-1 rounded" style={{ color: '#7a9aaa', background: 'rgba(93,173,226,0.06)', border: '1px solid rgba(93,173,226,0.15)' }}>
                {defenderFaction.specialRule}
              </div>
            </div>
          )}

          {/* Final defense bonus */}
          {result && (
            <div className="mt-3 p-2 rounded text-center" style={{ background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.3)' }}>
              <div className="text-xs opacity-60" style={{ fontFamily: "'Cinzel',serif" }}>TOTAL DEF BONUS</div>
              <div className="text-xl font-black" style={{ color: '#3498db', fontFamily: "'Cinzel',serif" }}>
                +{result.dBonus}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DICE LOG ── */}
      {(result || rolling) && (
        <div className="px-3 pb-3">
          <div className="border-t mb-3" style={{ borderColor: 'rgba(212,168,83,0.15)' }} />
          <SectionHeader icon="🎲" label="Combat Rounds" color="#d4a853" />

          <div className="flex text-xs px-2 mb-1.5" style={{ color: '#555' }}>
            <span className="flex-1">ATTACKER (die + bonus → total)</span>
            <span className="flex-1 text-right">(total ← bonus + die) DEFENDER</span>
          </div>

          {rolling ? (
            <div className="flex gap-2 justify-center py-3">
              {[0, 1, 2].map(i => <AnimatedDie key={i} value={Math.ceil(Math.random() * 6)} rolling={true} delay={i * 100} />)}
            </div>
          ) : (
            roundLog.map((r, i) => (
              <RoundLog key={i} {...r} rolling={false} />
            ))
          )}

          {/* Summary banner */}
          {result && !rolling && (
            <div className="mt-3 p-3 rounded-lg text-center"
              style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.25)' }}>
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <div className="text-xs opacity-50 mb-0.5">Attacker lost</div>
                  <div className="font-black text-lg" style={{ color: '#f87171', fontFamily: "'Cinzel',serif" }}>
                    -{result.attackerLosses}
                  </div>
                </div>
                <div className="text-2xl self-center">⚔️</div>
                <div>
                  <div className="text-xs opacity-50 mb-0.5">Defender lost</div>
                  <div className="font-black text-lg" style={{ color: '#4ade80', fontFamily: "'Cinzel',serif" }}>
                    -{result.defenderLosses}
                  </div>
                </div>
              </div>
              {result.terrainNotes?.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {result.terrainNotes.map((note, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.25)', color: '#27ae60' }}>
                      🗺️ {note}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}