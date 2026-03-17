import React, { useState } from 'react';
import { FACTIONS, LEADERS, OBJECTIVES } from './ardoniaData';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const drawObjectives = (factionId) => {
  let pool = [...OBJECTIVES];
  // Faction constraints
  if (factionId === 'sultanate') {
    pool = pool.filter(o => o.category !== 'Military');
  }
  const shuffled = shuffle(pool);
  if (factionId === 'kadjimaran') {
    const spiritual = shuffled.find(o => o.category === 'Spiritual');
    const rest = shuffled.filter(o => o.id !== spiritual?.id);
    return spiritual ? [spiritual, rest[0]] : shuffled.slice(0, 2);
  }
  if (factionId === 'onishiman') {
    const military = shuffled.find(o => o.category === 'Military');
    const rest = shuffled.filter(o => o.id !== military?.id);
    return military ? [military, rest[0]] : shuffled.slice(0, 2);
  }
  return shuffled.slice(0, 2);
};

function PlayerSetup({ playerId, label, choices, onChange, takenFactionId }) {
  const faction = FACTIONS[choices.factionId];
  const leaders = faction ? LEADERS[choices.factionId] : [];

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ background: 'hsl(35,20%,16%)', border: '1px solid hsl(35,20%,28%)' }}>
      <div className="text-sm font-bold tracking-widest opacity-60" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>{label}</div>

      {/* Faction Select */}
      <div>
        <div className="text-xs mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>CHOOSE FACTION</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(FACTIONS).map(f => {
            const disabled = f.id === takenFactionId;
            const selected = choices.factionId === f.id;
            return (
              <button key={f.id} disabled={disabled}
                onClick={() => onChange({ factionId: f.id, leaderIndex: 0 })}
                className="text-left px-3 py-2 rounded-lg transition-all text-xs"
                style={{
                  background: selected ? `${f.color}22` : 'hsl(35,20%,20%)',
                  border: `1px solid ${selected ? f.color : 'hsl(35,20%,30%)'}`,
                  color: disabled ? 'hsl(35,20%,35%)' : selected ? f.color : 'hsl(40,20%,65%)',
                  opacity: disabled ? 0.4 : 1,
                }}>
                <div className="font-bold">{f.emoji} {f.name}</div>
                <div className="opacity-60 text-xs mt-0.5 leading-tight">{f.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leader Select */}
      {faction && (
        <div>
          <div className="text-xs mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>CHOOSE LEADER</div>
          <div className="space-y-1.5">
            {leaders.map((l, i) => {
              const selected = choices.leaderIndex === i;
              return (
                <button key={l.id} onClick={() => onChange({ ...choices, leaderIndex: i })}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all text-xs"
                  style={{
                    background: selected ? 'hsl(38,70%,22%)' : 'hsl(35,20%,20%)',
                    border: `1px solid ${selected ? 'hsl(38,80%,50%)' : 'hsl(35,20%,30%)'}`,
                    color: selected ? 'hsl(43,90%,80%)' : 'hsl(40,20%,65%)',
                  }}>
                  <div className="font-bold">{l.name} <span className="opacity-50 font-normal">({l.type})</span></div>
                  <div className="opacity-70 mt-0.5">✦ {l.passive}</div>
                  <div className="opacity-50 mt-0.5">✗ {l.disadvantage}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Objectives preview */}
      {faction && choices.objectives && (
        <div>
          <div className="text-xs mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>YOUR SECRET OBJECTIVES</div>
          <div className="space-y-1.5">
            {choices.objectives.map(obj => (
              <div key={obj.id} className="px-3 py-2 rounded-lg text-xs"
                style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: 'hsl(40,20%,70%)' }}>
                <span className="font-bold" style={{ color: 'hsl(43,80%,65%)' }}>[{obj.category}]</span> {obj.text}
              </div>
            ))}
          </div>
          {choices.factionId === 'sultanate' && <div className="text-xs mt-1 opacity-50 italic">★ No Military objectives (Sultanate rule)</div>}
          {choices.factionId === 'kadjimaran' && <div className="text-xs mt-1 opacity-50 italic">★ Guaranteed Spiritual objective (Kadjimaran rule)</div>}
          {choices.factionId === 'onishiman' && <div className="text-xs mt-1 opacity-50 italic">★ Guaranteed Military objective (Onishiman rule)</div>}
        </div>
      )}
    </div>
  );
}

export default function FactionSelect({ mode, onConfirm, onBack }) {
  const [p1, setP1] = useState({ factionId: 'onishiman', leaderIndex: 0, objectives: null });
  const [p2, setP2] = useState({ factionId: 'sultanate', leaderIndex: 0, objectives: null });
  const [step, setStep] = useState('pick'); // pick → objectives → confirm

  const handleP1Change = (val) => setP1({ ...val, objectives: null });
  const handleP2Change = (val) => setP2({ ...val, objectives: null });

  const handleDrawObjectives = () => {
    setP1(prev => ({ ...prev, objectives: drawObjectives(prev.factionId) }));
    setP2(prev => ({ ...prev, objectives: drawObjectives(prev.factionId) }));
    setStep('objectives');
  };

  const handleConfirm = () => {
    onConfirm({ p1, p2 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, hsl(35,25%,10%), hsl(35,20%,8%))' }}>
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
            ⚜️ Choose Your Factions
          </h1>
          <p className="text-sm opacity-50" style={{ color: 'hsl(40,20%,65%)' }}>
            {mode === 'ai' ? 'You vs the AI Shadow Lord' : '2 Players — take turns at the same screen'}
          </p>
        </div>

        <div className={`grid gap-6 mb-6 ${mode === 'ai' ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-2'}`}>
          <PlayerSetup
            playerId="p1"
            label={mode === 'ai' ? 'YOUR FACTION' : 'PLAYER 1'}
            choices={p1}
            onChange={handleP1Change}
            takenFactionId={mode !== 'ai' ? p2.factionId : null}
          />
          {mode !== 'ai' && (
            <PlayerSetup
              playerId="p2"
              label="PLAYER 2"
              choices={p2}
              onChange={handleP2Change}
              takenFactionId={p1.factionId}
            />
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm hover:opacity-80 transition-all"
            style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
            ← Back
          </button>
          {step === 'pick' ? (
            <button onClick={handleDrawObjectives}
              className="px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
              style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,90%)' }}>
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