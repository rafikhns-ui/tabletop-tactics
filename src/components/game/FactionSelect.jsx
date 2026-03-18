import React, { useState } from 'react';
import { FACTIONS, LEADERS, OBJECTIVES } from './ardoniaData';
import ObjectiveDeckAnimation from './ObjectiveDeckAnimation';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const drawObjectives = (factionId) => {
  let pool = [...OBJECTIVES].filter(o => o.image); // Only objectives with uploaded images
  if (factionId === 'sultanate') pool = pool.filter(o => o.category !== 'Military');
  const shuffled = shuffle(pool);
  if (factionId === 'kadjimaran' || factionId === 'inuvak') {
    const spiritual = shuffled.find(o => o.category === 'Spiritual');
    const rest = shuffled.filter(o => o.id !== spiritual?.id);
    return spiritual ? [spiritual, rest[0]] : shuffled.slice(0, 2);
  }
  if (factionId === 'onishiman' || factionId === 'icebound') {
    const military = shuffled.find(o => o.category === 'Military');
    const rest = shuffled.filter(o => o.id !== military?.id);
    return military ? [military, rest[0]] : shuffled.slice(0, 2);
  }
  return shuffled.slice(0, 2);
};

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
const PLAYER_LABELS = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];

const PLAYABLE_FACTIONS = Object.values(FACTIONS).filter(f => f.playable);

const CONTINENT_ORDER = ['Mangian', 'Sharqian'];

function FactionCard({ faction, selected, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-left px-3 py-2.5 rounded-lg transition-all text-xs"
      style={{
        background: selected ? `${faction.color}28` : 'hsl(35,20%,18%)',
        border: `1.5px solid ${selected ? faction.color : disabled ? 'hsl(35,20%,22%)' : 'hsl(35,20%,28%)'}`,
        color: disabled ? 'hsl(35,20%,32%)' : selected ? faction.color : 'hsl(40,20%,65%)',
        opacity: disabled ? 0.4 : 1,
      }}>
      <div className="font-bold text-sm">{faction.emoji} {faction.name}</div>
      <div className="text-xs opacity-60 mt-0.5 italic" style={{ color: disabled ? undefined : 'hsl(40,15%,55%)' }}>
        {faction.continent}
      </div>
      <div className="text-xs mt-1 leading-snug opacity-80 line-clamp-2">{faction.description}</div>
      {selected && (
        <div className="mt-1.5 text-xs px-2 py-1 rounded" style={{ background: `${faction.color}18`, color: 'hsl(43,80%,65%)' }}>
          ✦ {faction.specialRule}
        </div>
      )}
    </button>
  );
}

function LeaderCard({ leader, selected, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg transition-all text-xs"
      style={{
        background: selected ? 'hsl(38,70%,22%)' : 'hsl(35,20%,18%)',
        border: `1px solid ${selected ? 'hsl(38,80%,50%)' : 'hsl(35,20%,28%)'}`,
        color: selected ? 'hsl(43,90%,80%)' : 'hsl(40,20%,65%)',
      }}>
      <div className="font-bold">{leader.name} <span className="opacity-40 font-normal text-xs">({leader.type})</span></div>
      <div className="opacity-70 mt-0.5">✦ {leader.passive}</div>
      <div className="opacity-45 mt-0.5">✗ {leader.disadvantage}</div>
    </button>
  );
}

function PlayerSlot({ index, choices, onChange, takenFactionIds, isAI }) {
  const faction = choices.factionId ? FACTIONS[choices.factionId] : null;
  const leaders = faction ? (LEADERS[choices.factionId] || []) : [];
  const playerColor = PLAYER_COLORS[index];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${playerColor}44`, background: 'hsl(35,20%,13%)' }}>
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: `${playerColor}18`, borderBottom: `1px solid ${playerColor}33` }}>
        <div className="w-3 h-3 rounded-full" style={{ background: playerColor }} />
        <span className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: playerColor }}>
          {isAI ? `🤖 AI Player ${index + 1}` : PLAYER_LABELS[index]}
        </span>
      </div>

      {isAI ? (
        <div className="px-4 py-3 text-xs opacity-40 italic" style={{ color: 'hsl(40,20%,60%)' }}>
          The AI will be assigned a faction automatically.
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {/* Faction grid by continent */}
          {CONTINENT_ORDER.map(continent => (
            <div key={continent}>
              <div className="text-xs mb-1.5 opacity-40 tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,70%,55%)' }}>
                {continent === 'Mangian' ? '🌍 WESTERN — MANGIAN' : '🌏 EASTERN — SHARQIAN'}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {PLAYABLE_FACTIONS.filter(f => f.continent === continent).map(f => (
                  <FactionCard
                    key={f.id}
                    faction={f}
                    selected={choices.factionId === f.id}
                    disabled={takenFactionIds.includes(f.id)}
                    onClick={() => onChange({ factionId: f.id, leaderIndex: 0, objectives: null })}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Leader select — only after objectives drawn */}
          {faction && leaders.length > 0 && choices.objectives && (
            <div>
              <div className="text-xs mb-1.5 opacity-40 tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,70%,55%)' }}>
                CHOOSE LEADER
              </div>
              <div className="space-y-1">
                {leaders.map((l, i) => (
                  <LeaderCard key={l.id} leader={l} selected={choices.leaderIndex === i} onClick={() => onChange({ ...choices, leaderIndex: i })} />
                ))}
              </div>
            </div>
          )}

          {/* Objectives reveal */}
          {choices.objectives && (
            <div>
              <div className="text-xs mb-1.5 opacity-40 tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,70%,55%)' }}>
                SECRET OBJECTIVES
              </div>
              <div className="space-y-1">
                {choices.objectives.map(obj => (
                  <div key={obj.id} className="px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: 'hsl(40,20%,70%)' }}>
                    <span className="font-bold" style={{ color: 'hsl(43,80%,65%)' }}>[{obj.category}]</span> {obj.text}
                  </div>
                ))}
              </div>
              {choices.factionId === 'sultanate' && <div className="text-xs mt-1 opacity-50 italic">★ No Military objectives (Sultanate rule)</div>}
              {(choices.factionId === 'kadjimaran' || choices.factionId === 'inuvak') && <div className="text-xs mt-1 opacity-50 italic">★ Guaranteed Spiritual objective</div>}
              {(choices.factionId === 'onishiman' || choices.factionId === 'icebound') && <div className="text-xs mt-1 opacity-50 italic">★ Guaranteed Military objective</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FactionSelect({ mode, playerCount = 2, onConfirm, onBack }) {
  // For 'ai' mode: 1 human + 1 AI. For 'multiplayer': configurable humans + configurable AIs
  const [aiCount, setAiCount] = useState(mode === 'ai' ? 3 : 0);
  const humanCount = mode === 'ai' ? 1 : playerCount;
  const totalPlayers = humanCount + aiCount;
  const maxAI = mode === 'ai' ? 3 : Math.max(0, 5 - humanCount);

  const buildPlayers = (aiC) => Array.from({ length: humanCount + aiC }, (_, i) => ({
    id: i >= humanCount ? `ai${i - humanCount + 1}` : `p${i + 1}`,
    isAI: i >= humanCount,
    factionId: null,
    leaderIndex: 0,
    objectives: null,
  }));

  const [players, setPlayers] = useState(() => buildPlayers(mode === 'ai' ? 1 : 0));
  const [step, setStep] = useState('pick');
  const [showDeckAnimation, setShowDeckAnimation] = useState(false);

  const handleAiCountChange = (n) => {
    setAiCount(n);
    setPlayers(buildPlayers(n));
    setStep('pick');
  };

  const takenFactionIds = players.map(p => p.factionId).filter(Boolean);

  const updatePlayer = (index, val) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, ...val } : p));
  };

  const allChosen = players.filter(p => !p.isAI).every(p => p.factionId);

  const handleDrawObjectives = () => {
    setShowDeckAnimation(true);
    // Pick a random faction for AI
    const available = PLAYABLE_FACTIONS.map(f => f.id).filter(id => !takenFactionIds.includes(id));
    setPlayers(prev => prev.map(p => {
      if (p.isAI) {
        const aiFactionId = available.splice(Math.floor(Math.random() * available.length), 1)[0] || 'icebound';
        return { ...p, factionId: aiFactionId, objectives: drawObjectives(aiFactionId) };
      }
      return { ...p, objectives: drawObjectives(p.factionId) };
    }));
  };

  const handleAnimationComplete = () => {
    setShowDeckAnimation(false);
    setStep('objectives');
  };

  const handleConfirm = () => {
    // Build choices object keyed by player id
    const choices = {};
    players.forEach(p => { choices[p.id] = p; });
    onConfirm(choices, players);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 overflow-auto"
      style={{ background: 'linear-gradient(160deg, hsl(35,25%,10%), hsl(35,20%,8%))' }}>
      {showDeckAnimation && <ObjectiveDeckAnimation players={players} onComplete={handleAnimationComplete} />}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
            ⚜️ Choose Your Factions
          </h1>
          <p className="text-sm opacity-50" style={{ color: 'hsl(40,20%,65%)' }}>
            {mode === 'ai' ? `You vs ${aiCount} AI opponents` : `${humanCount} Human${humanCount > 1 ? 's' : ''} + ${aiCount} AI — same screen`}
          </p>
        </div>

        {(mode === 'multiplayer' || mode === 'ai') && (
          <div className="flex items-center justify-center gap-3 mb-4 p-3 rounded-xl"
            style={{ background: 'hsl(35,20%,15%)', border: '1px solid hsl(35,20%,25%)' }}>
            <span className="text-xs opacity-60" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,70%,55%)' }}>🤖 AI OPPONENTS:</span>
            {Array.from({ length: maxAI }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => handleAiCountChange(n)}
                className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: aiCount === n ? 'hsl(355,60%,35%)' : 'hsl(35,20%,22%)',
                  border: `1px solid ${aiCount === n ? 'hsl(355,60%,55%)' : 'hsl(35,20%,32%)'}`,
                  color: aiCount === n ? 'hsl(40,30%,95%)' : 'hsl(40,20%,50%)',
                  fontFamily: "'Cinzel',serif",
                }}>
                {n}
              </button>
            ))}
          </div>
        )}

        <div className={`grid gap-4 mb-6`}
          style={{ gridTemplateColumns: `repeat(${Math.min(humanCount + aiCount, 3)}, 1fr)` }}>
          {players.map((p, i) => (
            <PlayerSlot
              key={p.id}
              index={i}
              choices={p}
              onChange={(val) => updatePlayer(i, val)}
              takenFactionIds={takenFactionIds.filter(id => id !== p.factionId)}
              isAI={p.isAI}
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center pb-8">
          <button onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm hover:opacity-80 transition-all"
            style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
            ← Back
          </button>
          {step === 'pick' ? (
            <button onClick={handleDrawObjectives} disabled={!allChosen}
              className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                fontFamily: "'Cinzel',serif",
                background: allChosen ? 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))' : 'hsl(35,20%,22%)',
                border: `1px solid ${allChosen ? 'hsl(38,80%,55%)' : 'hsl(35,20%,35%)'}`,
                color: allChosen ? 'hsl(43,90%,90%)' : 'hsl(35,20%,40%)',
                opacity: allChosen ? 1 : 0.6,
              }}>
              🎯 Draw Secret Objectives
            </button>
          ) : (
            <button onClick={handleConfirm}
              className="px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
              style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(120,50%,25%), hsl(120,50%,18%))', border: '1px solid hsl(120,50%,40%)', color: 'hsl(120,60%,85%)' }}>
              ⚜️ Begin the Conquest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}