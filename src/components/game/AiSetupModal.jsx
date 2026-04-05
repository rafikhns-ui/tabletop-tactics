import React, { useState } from 'react';
import { FACTIONS } from './ardoniaData';

const FACTION_LIST = Object.entries(FACTIONS)
  .filter(([_, f]) => f.name !== 'Neutral')
  .map(([id, f]) => ({ id, name: f.name, color: f.color }));

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', icon: '🌿', color: 'hsl(130,50%,40%)', desc: 'Passive & cautious' },
  { id: 'normal', label: 'Normal', icon: '⚔️', color: 'hsl(43,80%,50%)', desc: 'Balanced strategy' },
  { id: 'hard', label: 'Hard', icon: '💀', color: 'hsl(0,70%,45%)', desc: 'Aggressive & smart' },
];

export default function AiSetupModal({ onStart, onBack }) {
  const [aiCount, setAiCount] = useState(2);
  const [aiFactions, setAiFactions] = useState(['sultanate', 'kadjimaran']);
  const [aiDifficulties, setAiDifficulties] = useState(['normal', 'normal']);
  const [randomMode, setRandomMode] = useState(false);

  const handleAiCountChange = (count) => {
    setAiCount(count);
    if (count < aiFactions.length) {
      setAiFactions(aiFactions.slice(0, count));
      setAiDifficulties(aiDifficulties.slice(0, count));
    } else {
      const toAdd = count - aiFactions.length;
      const newFactions = [...aiFactions];
      const newDiffs = [...aiDifficulties];
      for (let i = 0; i < toAdd; i++) {
        newFactions.push(FACTION_LIST[Math.floor(Math.random() * FACTION_LIST.length)].id);
        newDiffs.push('normal');
      }
      setAiFactions(newFactions);
      setAiDifficulties(newDiffs);
    }
  };

  const handleFactionChange = (index, factionId) => {
   const newFactions = [...aiFactions];
   newFactions[index] = factionId;
   setAiFactions(newFactions);
  };

  // Get list of available factions (not already chosen by other AIs)
  const getAvailableFactions = (currentIndex) => {
   const takenFactions = aiFactions.filter((_, i) => i !== currentIndex);
   return FACTION_LIST.filter(f => !takenFactions.includes(f.id));
  };

  const handleDifficultyChange = (index, difficulty) => {
    const newDiffs = [...aiDifficulties];
    newDiffs[index] = difficulty;
    setAiDifficulties(newDiffs);
  };

  const handleStart = () => {
    const finalFactions = randomMode
      ? Array.from({ length: aiCount }, () => FACTION_LIST[Math.floor(Math.random() * FACTION_LIST.length)].id)
      : aiFactions;
    
    const players = finalFactions.map((factionId, i) => ({
      id: `ai_${i}`,
      name: `AI ${i + 1}`,
      factionId,
      isAI: true,
      leaderIndex: 0,
      objectives: null,
      difficulty: aiDifficulties[i] || 'normal',
    }));

    onStart(players);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'hsl(35,25%,12%)' }}>
      <div className="max-w-md w-full rounded-xl p-6 border-2" style={{ background: 'hsl(35,20%,16%)', borderColor: 'hsl(43,70%,50%)' }}>
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,75%)' }}>
          ⚙️ Setup AI Opponents
        </h1>

        {/* AI Count */}
        <div className="mb-6">
          <label className="text-xs font-bold mb-3 block opacity-60" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            NUMBER OF AI OPPONENTS
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handleAiCountChange(count)}
                className="flex-1 py-2 rounded font-bold transition-all"
                style={{
                  fontFamily: "'Cinzel',serif",
                  background: aiCount === count ? 'hsl(38,70%,30%)' : 'hsl(35,20%,22%)',
                  border: aiCount === count ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,30%)',
                  color: aiCount === count ? 'hsl(43,90%,80%)' : 'hsl(40,20%,60%)',
                }}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Random / Manual toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={randomMode}
              onChange={(e) => setRandomMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,70%)' }}>
              Random Factions
            </span>
          </label>
        </div>

        {/* Per-AI configuration */}
        <div className="mb-6 space-y-4">
          <label className="text-xs font-bold mb-1 block opacity-60" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            AI CONFIGURATION
          </label>
          {Array.from({ length: aiCount }).map((_, i) => {
            const diff = DIFFICULTIES.find(d => d.id === (aiDifficulties[i] || 'normal'));
            return (
              <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: 'hsl(35,20%,19%)', border: '1px solid hsl(35,20%,28%)' }}>
                <div className="text-xs font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,65%)' }}>
                  🤖 AI Opponent {i + 1}
                </div>

                {/* Difficulty */}
                <div className="flex gap-1.5">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleDifficultyChange(i, d.id)}
                      className="flex-1 py-1.5 rounded text-xs font-bold transition-all"
                      style={{
                        fontFamily: "'Cinzel',serif",
                        background: aiDifficulties[i] === d.id ? `${d.color}33` : 'hsl(35,20%,22%)',
                        border: aiDifficulties[i] === d.id ? `1px solid ${d.color}` : '1px solid hsl(35,20%,30%)',
                        color: aiDifficulties[i] === d.id ? d.color : 'hsl(40,20%,55%)',
                      }}
                    >
                      {d.icon} {d.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs opacity-50" style={{ color: diff?.color }}>{diff?.desc}</div>

                {/* Faction */}
                {!randomMode && (
                  <select
                    value={aiFactions[i] || ''}
                    onChange={(e) => handleFactionChange(i, e.target.value)}
                    className="w-full px-3 py-1.5 rounded text-xs"
                    style={{
                      fontFamily: "'Cinzel',serif",
                      background: 'hsl(35,20%,22%)',
                      border: '1px solid hsl(35,20%,30%)',
                      color: 'hsl(40,20%,65%)',
                    }}
                  >
                    <option value="">-- Select Faction --</option>
                    {getAvailableFactions(i).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mb-6 p-3 rounded text-xs" style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,30%)', color: 'hsl(40,20%,70%)' }}>
          <strong>You vs {aiCount} AI opponent{aiCount > 1 ? 's' : ''}</strong>
          <div className="mt-2 text-xs opacity-70">
            {randomMode ? '🎲 Factions will be chosen randomly' : '📋 Factions configured manually'}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-2.5 rounded font-bold transition-all"
            style={{
              fontFamily: "'Cinzel',serif",
              background: 'hsl(35,20%,22%)',
              border: '1px solid hsl(35,20%,30%)',
              color: 'hsl(40,20%,65%)',
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-2.5 rounded font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              fontFamily: "'Cinzel',serif",
              background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))',
              border: '1px solid hsl(38,80%,55%)',
              color: 'hsl(43,90%,90%)',
            }}
          >
            ⚔️ Start Game
          </button>
        </div>
      </div>
    </div>
  );
}