import React, { useState, useMemo } from 'react';
import { HEROES, FACTION_TO_NATION_ID, BUILDING_DEFS } from './ardoniaData';
import { NATION_PERSONALITIES } from './aiPersonalities';
import { buildHexToProvinceMap } from './provinceSystem';
import PlayerDetailModal from './PlayerDetailModal';
import mapData from './ardonia_game_map.json';

// Pre-build the static hex→province lookup once
const HEX_TO_PROVINCE = buildHexToProvinceMap();

// Raw map nation_ids → canonical factionId (same as provinceSystem aliases)
const NATION_ID_ALIASES = {
  kinetic:       'kintei',
  ilalocatotlan: 'tlalocayotlan',
  hestia:        'republic',
  azure:         'sultanate',
  shadowsfall:   'shadowfell',
  silver:        'silverunion',
};
const normNationId = (id) => NATION_ID_ALIASES[id] || id;

// Reverse: factionId → raw map nation_id (for factions that differ)
const FACTION_TO_RAW_NATION_ID = Object.fromEntries(
  Object.entries(NATION_ID_ALIASES).map(([raw, faction]) => [faction, raw])
);

function ObjectivesModal({ player, onClose }) {
  const [hoveredObjId, setHoveredObjId] = React.useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden scroll-in"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: `2px solid ${player.color}88`, boxShadow: `0 0 40px ${player.color}33` }}>
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest opacity-50 mb-0.5" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>SECRET OBJECTIVES</div>
            <div className="text-base font-bold" style={{ fontFamily: "'Cinzel',serif", color: player.color }}>
              {player.faction?.emoji} {player.name}
            </div>
          </div>
          <button onClick={onClose} className="text-lg opacity-50 hover:opacity-100 px-2">✕</button>
        </div>
        <div className="p-5 space-y-3 relative">
          {player.objectives?.map(obj => {
            const done = player.completedObjectives?.includes(obj.id);
            return (
              <div
                key={obj.id}
                onMouseEnter={() => setHoveredObjId(obj.id)}
                onMouseLeave={() => setHoveredObjId(null)}
                className="rounded-lg p-3 cursor-pointer transition-all hover:opacity-80"
                style={{ background: done ? 'hsl(120,30%,15%)' : 'hsl(35,20%,20%)', border: `1px solid ${done ? 'hsl(120,40%,30%)' : 'hsl(35,20%,30%)'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{done ? '✅' : '🎯'}</span>
                  <span className="text-xs font-bold" style={{ fontFamily: "'Cinzel',serif", color: done ? 'hsl(120,50%,65%)' : 'hsl(43,80%,65%)' }}>
                    {obj.category}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: done ? 'hsl(120,40%,70%)' : 'hsl(40,20%,72%)' }}>{obj.text}</p>
              </div>
            );
          })}
          {(!player.objectives || player.objectives.length === 0) && (
            <p className="text-xs text-center opacity-40" style={{ color: 'hsl(40,20%,60%)' }}>No objectives drawn yet.</p>
          )}

          {/* Hover card preview */}
          {hoveredObjId && (() => {
            const hoveredObj = player.objectives?.find(o => o.id === hoveredObjId);
            return hoveredObj?.image ? (
              <div className="absolute top-0 right-0 transform translate-x-full ml-3 pointer-events-none z-50">
                <img src={hoveredObj.image} alt={hoveredObj.text} className="w-56 rounded-lg shadow-2xl border border-yellow-600" />
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}

export default function PlayerPanel({ player, isActive, territories, isSelf, provinces, gameState, onHighlight, isHighlighted }) {
  const [expanded, setExpanded] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [hoveredObjId, setHoveredObjId] = useState(null);
  const [hoveredBuildingId, setHoveredBuildingId] = useState(null);
  const completedCount = player.completedObjectives?.length || 0;
  
  // Count provinces controlled by this player.
  // A hex is "owned" by this player if:
  //   - hex.owner === player.id (explicit conquest), OR
  //   - hex.nation_id matches the player's faction's nation AND is not explicitly owned by another player
  const { ownedProvinceCount, totalProvinces } = useMemo(() => {
    if (!gameState) return { ownedProvinceCount: 0, totalProvinces: 0 };

    // Total provinces across ALL nations
    const total = mapData.nations.reduce((sum, n) => sum + n.province_count, 0);

    // Use the raw map nation_id for this faction (e.g. 'azure' for sultanate)
    const canonicalNationId = FACTION_TO_NATION_ID[player.factionId]; // e.g. 'sultanate'
    const playerNationId = FACTION_TO_RAW_NATION_ID[canonicalNationId] || canonicalNationId; // e.g. 'azure'

    const hexes = gameState.hexes || {};
    const otherPlayerIds = new Set(
      (gameState.players || []).filter(p => p.id !== player.id).map(p => p.id)
    );

    const controlled = new Set();

    mapData.hex_grid.forEach(h => {
      if (!h.province || h.province === 0) return; // skip water/unowned hexes
      const hexId = `${h.col},${h.row}`;
      const hexState = hexes[hexId];
      const explicitOwner = hexState?.owner;

      let isControlled = false;
      if (explicitOwner === player.id) {
        // Explicitly conquered by this player
        isControlled = true;
      } else if (explicitOwner == null && h.nation_id === playerNationId) {
        // Home territory, never conquered by anyone
        isControlled = true;
      } else if (explicitOwner != null && !otherPlayerIds.has(explicitOwner) && h.nation_id === playerNationId) {
        // Home territory where owner field exists but matches no other player
        isControlled = true;
      }

      if (isControlled) {
        // Province key format in HEX_TO_PROVINCE is "nationId-provinceId"
        const provId = HEX_TO_PROVINCE[hexId];
        if (provId) controlled.add(provId);
      }
    });

    return { ownedProvinceCount: controlled.size, totalProvinces: total };
  }, [gameState, player.id, player.factionId]);

  return (
    <div className="border-b border-border"
      style={{
        background: isHighlighted ? `${player.color}18` : isActive ? 'hsl(35,20%,16%)' : 'hsl(35,20%,13%)',
        borderLeft: isHighlighted ? `3px solid ${player.color}` : isActive ? `3px solid ${player.color}` : '3px solid transparent',
        outline: isHighlighted ? `1px solid ${player.color}55` : 'none',
      }}>
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: player.color }} />
          <div className="min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'hsl(40,30%,88%)', fontFamily: "'Cinzel',serif" }}>
              {player.name}
              {player.isAI && <span className="ml-1 text-xs opacity-50">🤖</span>}
              {isActive && <span className="ml-1 text-xs" style={{ color: 'hsl(43,90%,65%)' }}>▶</span>}
            </div>
            <div className="flex items-center gap-1 text-xs truncate" style={{ color: player.color, opacity: 0.85 }}>
              {player.factionId === 'onishiman' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/8a875b40d_photo-output.png" alt="Onishiman" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'ruskel' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/0ef66cce6_photo-output4.png" alt="Ruskel" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'oakhaven' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/449a73901_oakhaven.png" alt="Oakhaven" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'tlalocayotlan' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/75e3d6016_photo-output3.png" alt="Tlalocayotlan" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'nimrudan' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/c8851f071_empireassyrian.png" alt="Nimrudan" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'gojeon' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/d68a471ae_photo-output672.png" alt="Gojeon" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'sultanate' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/08a33f4a8_bluemoo.png" alt="Blue Moon Sultanate" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'icebound' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/011bfc403_thehorde.png" alt="Icebound Horde" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.factionId === 'kadjimaran' && (
                <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/5e6882e48_photo-output2.png" alt="Kadjimaran" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              )}
              {player.faction?.emoji} {player.faction?.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); onHighlight && onHighlight(isHighlighted ? null : player.id); }}
            title={isHighlighted ? 'Clear highlight' : 'Highlight territories'}
            className="text-xs px-1.5 py-0.5 rounded hover:opacity-90 transition-all"
            style={{ background: isHighlighted ? `${player.color}44` : 'hsl(35,20%,24%)', border: `1px solid ${isHighlighted ? player.color : 'hsl(35,20%,34%)'}`, color: isHighlighted ? player.color : 'hsl(40,20%,60%)' }}>
            🗺️
          </button>
          {isSelf && (
            <button onClick={e => { e.stopPropagation(); setShowObjectives(true); }}
              className="text-xs px-1.5 py-0.5 rounded hover:opacity-90 transition-all"
              title="View your secret objectives"
              style={{ background: 'hsl(35,20%,24%)', border: '1px solid hsl(35,20%,34%)', color: 'hsl(43,80%,60%)' }}>
              📜
            </button>
          )}
          <span className="text-xs opacity-40">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {showObjectives && <ObjectivesModal player={player} onClose={() => setShowObjectives(false)} />}
      {showDetail && <PlayerDetailModal player={player} territories={territories} onClose={() => setShowDetail(false)} />}

      <div className="px-3 pb-2 grid grid-cols-5 gap-1">
        <StatBadge label="🪙" value={player.resources?.gold ?? 0} />
        <StatBadge label="🪵" value={player.resources?.wood ?? 0} />
        <StatBadge label="🌾" value={player.resources?.wheat ?? 0} />
        <StatBadge label="✨" value={player.sp ?? 0} max={50} color="#8e44ad" />
        <StatBadge label="💬" value={player.ip ?? 0} max={50} color="#2980b9" />
      </div>

      <div className="px-3 pb-2">
        <div className="flex justify-between text-xs mb-0.5" style={{ color: 'hsl(40,20%,55%)' }}>
          <span>{ownedProvinceCount}/{totalProvinces} provinces</span>
          <span>🎯 {completedCount}/2</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(35,20%,25%)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${totalProvinces > 0 ? (ownedProvinceCount / totalProvinces) * 100 : 0}%`, background: player.color }} />
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
          <div className="grid grid-cols-2 gap-1">
            <StatRow icon="✨" label="SP" value={player.sp ?? 0} max={50} color="#8e44ad" />
            <StatRow icon="💬" label="IP" value={player.ip ?? 0} max={50} color="#2980b9" />
          </div>

          {player.leader && (
            <div className="rounded p-2 text-xs" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)' }}>
              <div className="font-semibold mb-0.5" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>
                👑 {player.leader.name}
              </div>
              <div className="opacity-70">{player.leader.passive}</div>
            </div>
          )}

          {player.isAI && (() => {
            const personality = NATION_PERSONALITIES[player.factionId];
            return personality ? (
              <div className="rounded p-2 text-xs" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(200,40%,35%)' }}>
                <div className="font-semibold mb-0.5" style={{ color: 'hsl(200,60%,65%)', fontFamily: "'Cinzel',serif" }}>
                  {personality.emoji} {personality.name}
                </div>
                <div className="opacity-70">AI Personality: {personality.type}</div>
              </div>
            ) : null;
          })()}

          <div className="relative">
            <div className="text-xs font-semibold mb-1 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>BUILDINGS</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.values(player.buildings || {}).map(b => (
                <div key={b.id}
                  className="flex items-center gap-1 text-xs px-1.5 py-1 rounded cursor-default"
                  onMouseEnter={() => setHoveredBuildingId(b.id)}
                  onMouseLeave={() => setHoveredBuildingId(null)}
                  style={{ background: 'hsl(35,20%,20%)', border: `1px solid ${b.disabled ? 'hsl(0,50%,35%)' : hoveredBuildingId === b.id ? 'hsl(43,80%,45%)' : 'hsl(35,20%,30%)'}`, color: b.disabled ? 'hsl(0,50%,60%)' : 'hsl(40,20%,70%)', transition: 'border-color 0.15s' }}>
                  <span>{b.emoji}</span>
                  <span className="truncate">{b.name}</span>
                  {b.level && <span className="ml-auto font-bold flex-shrink-0" style={{ color: 'hsl(43,80%,60%)' }}>L{b.level}</span>}
                </div>
              ))}
            </div>

            {/* Building hover card */}
            {hoveredBuildingId && (() => {
              const b = player.buildings?.[hoveredBuildingId];
              const def = BUILDING_DEFS[hoveredBuildingId];
              if (!b && !def) return null;
              const info = { ...def, ...b };
              return (
                <div className="fixed pointer-events-none z-50 w-52 rounded-xl overflow-hidden shadow-2xl"
                  style={{ top: '50%', right: '1rem', transform: 'translateY(-50%)', background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: '1px solid hsl(43,80%,40%)', boxShadow: '0 0 24px rgba(200,150,50,0.25)' }}>
                  {info.image && (
                    <img src={info.image} alt={info.name} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{info.emoji}</span>
                      <span className="font-bold text-sm" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,65%)' }}>{info.name}</span>
                      {b?.level && <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(43,80%,20%)', color: 'hsl(43,80%,65%)' }}>L{b.level}</span>}
                    </div>
                    {info.description && (
                      <p className="text-xs leading-relaxed" style={{ color: 'hsl(40,20%,65%)' }}>{info.description}</p>
                    )}
                    {b?.disabled && (
                      <div className="mt-1.5 text-xs font-semibold" style={{ color: 'hsl(0,60%,60%)' }}>⛔ Disabled</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {player.heroes?.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>HEROES</div>
              {player.heroes.map(hId => {
                const hero = HEROES[hId];
                if (!hero) return null;
                const status = player.heroStatus?.[hId];
                return (
                  <div key={hId} className="flex items-center justify-between text-xs px-1.5 py-1 rounded mb-1"
                    style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: status?.imprisoned ? 'hsl(0,50%,60%)' : 'hsl(40,20%,75%)' }}>
                    <span>{hero.type === 'Warrior' ? '⚔️' : hero.type === 'Spy' ? '🕵️' : hero.type === 'Mage' ? '🔮' : hero.type === 'Diplomat' ? '🤝' : '⭐'} {hero.name}</span>
                    {status?.imprisoned && <span>🔒</span>}
                    {status?.exhausted && <span className="opacity-50">💤</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>OBJECTIVES</div>
              {isSelf && <button onClick={() => setShowObjectives(true)} className="text-xs opacity-60 hover:opacity-100" style={{ color: 'hsl(43,80%,60%)' }}>📜 View</button>}
            </div>
            {player.objectives?.map(obj => {
              const done = player.completedObjectives?.includes(obj.id);
              return (
                <div
                  key={obj.id}
                  onMouseEnter={() => setHoveredObjId(obj.id)}
                  onMouseLeave={() => setHoveredObjId(null)}
                  className="flex items-center gap-1.5 text-xs px-1.5 py-1 rounded mb-1 cursor-pointer transition-all hover:opacity-80"
                  style={{ background: done ? 'hsl(120,30%,18%)' : 'hsl(35,20%,20%)', border: `1px solid ${done ? 'hsl(120,40%,30%)' : 'hsl(35,20%,30%)'}`, color: done ? 'hsl(120,50%,65%)' : 'hsl(40,20%,65%)' }}>
                  <span>{done ? '✅' : '🎯'}</span>
                  <span className="truncate">{isSelf || done ? (done ? obj.text : `[${obj.category}] — Secret`) : '[???] — Hidden'}</span>
                </div>
              );
            })}

            {/* Hover card preview */}
            {hoveredObjId && (() => {
              const hoveredObj = player.objectives?.find(o => o.id === hoveredObjId);
              return hoveredObj?.image ? (
                <div className="fixed pointer-events-none z-50" style={{ top: '50%', right: '1rem', transform: 'translateY(-50%)' }}>
                  <img src={hoveredObj.image} alt={hoveredObj.text} className="w-48 h-auto rounded-lg shadow-2xl border-2" style={{ borderColor: player.color }} />
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, max, color }) {
  return (
    <div className="flex flex-col px-1.5 py-1 rounded text-xs"
      style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: 'hsl(40,25%,75%)' }}>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-bold" style={{ color: max ? color : 'hsl(43,80%,65%)' }}>{value}{max ? `/${max}` : ''}</span>
      </div>
      {max && (
        <div className="h-0.5 rounded-full mt-0.5" style={{ background: 'hsl(35,20%,30%)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

function StatRow({ icon, label, value, max, color }) {
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-0.5" style={{ color: 'hsl(40,20%,60%)' }}>
        <span>{icon} {label}</span>
        <span style={{ color: 'hsl(43,80%,65%)' }}>{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'hsl(35,20%,25%)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}