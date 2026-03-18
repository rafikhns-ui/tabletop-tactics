import React, { useState } from 'react';
import { FACTIONS } from './ardoniaData';

const FACTION_LIST = Object.entries(FACTIONS)
  .filter(([_, f]) => f.name !== 'Neutral')
  .map(([id, f]) => ({ id, name: f.name, color: f.color }));

export default function AiSetupModal({ onStart, onBack }) {
  const [aiCount, setAiCount] = useState(2);
  const [aiFactions, setAiFactions] = useState(['sultanate', 'kadjimaran']);
  const [randomMode, setRandomMode] = useState(false);

  const handleAiCountChange = (count) => {
    setAiCount(count);
    // Adjust factions array if needed
    if (count < aiFactions.length) {
      setAiFactions(aiFactions.slice(0, count));
    } else {
      // Add random factions to fill
      const toAdd = count - aiFactions.length;
      const newFactions = [...aiFactions];
      for (let i = 0; i < toAdd; i++) {
        const randomFaction = FACTION_LIST[Math.floor(Math.random() * FACTION_LIST.length)].id;
        newFactions.push(randomFaction);
      }
      setAiFactions(newFactions);
    }
  };

  const handleFactionChange = (index, factionId) => {
    const newFactions = [...aiFactions];
    newFactions[index] = factionId;
    setAiFactions(newFactions);
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

        {/* Faction selection (manual mode) */}
        {!randomMode && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold mb-3 block opacity-60" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
              AI FACTION CHOICES
            </label>
            {aiFactions.map((faction, i) => (
              <select
                key={i}
                value={faction}
                onChange={(e) => handleFactionChange(i, e.target.value)}
                className="w-full px-3 py-2 rounded text-xs"
                style={{
                  fontFamily: "'Cinzel',serif",
                  background: 'hsl(35,20%,22%)',
                  border: '1px solid hsl(35,20%,30%)',
                  color: 'hsl(40,20%,65%)',
                }}
              >
                {FACTION_LIST.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

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