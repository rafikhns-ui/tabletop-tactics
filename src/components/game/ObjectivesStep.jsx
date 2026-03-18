import React, { useState, useEffect } from 'react';
import { OBJECTIVES } from './ardoniaData';
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
  let pool = [...OBJECTIVES].filter(o => o.image);
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

export default function ObjectivesStep({ players, onNext, onBack }) {
  const [showDeckAnimation, setShowDeckAnimation] = useState(true);
  const [playersWithObjectives, setPlayersWithObjectives] = useState(null);

  useEffect(() => {
    // Draw objectives for all players
    const PLAYABLE_FACTIONS = Object.values(require('./ardoniaData').FACTIONS).filter(f => f.playable);
    const takenFactionIds = players.map(p => p.factionId).filter(Boolean);
    const available = PLAYABLE_FACTIONS.map(f => f.id).filter(id => !takenFactionIds.includes(id));

    const updated = players.map(p => {
      if (p.isAI) {
        const aiFactionId = available.splice(Math.floor(Math.random() * available.length), 1)[0] || 'icebound';
        return { ...p, objectives: drawObjectives(aiFactionId) };
      }
      return { ...p, objectives: drawObjectives(p.factionId) };
    });
    setPlayersWithObjectives(updated);
  }, []);

  const handleAnimationComplete = () => {
    setShowDeckAnimation(false);
  };

  const handleNext = () => {
    onNext(playersWithObjectives);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 overflow-auto"
      style={{ background: 'linear-gradient(160deg, hsl(35,25%,10%), hsl(35,20%,8%))' }}>
      {showDeckAnimation && playersWithObjectives && (
        <ObjectiveDeckAnimation players={playersWithObjectives} onComplete={handleAnimationComplete} />
      )}

      {!showDeckAnimation && playersWithObjectives && (
        <div className="w-full max-w-6xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
              🎯 Secret Objectives Drawn
            </h1>
            <p className="text-sm opacity-50" style={{ color: 'hsl(40,20%,65%)' }}>
              Review the objectives assigned to each player
            </p>
          </div>

          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(playersWithObjectives.length, 3)}, 1fr)` }}>
            {playersWithObjectives.map((player, idx) => {
              const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
              const color = PLAYER_COLORS[idx];

              return (
                <div key={player.id} className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${color}44`, background: 'hsl(35,20%,13%)' }}>
                  <div className="px-4 py-3" style={{ background: `${color}18`, borderBottom: `1px solid ${color}33` }}>
                    <div className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: color }}>
                      {player.isAI ? `🤖 AI Player` : 'Player'}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {player.objectives?.map(obj => (
                      <div key={obj.id} className="rounded-lg overflow-hidden border" style={{ borderColor: 'hsl(35,20%,30%)' }}>
                        {obj.image && (
                          <img src={obj.image} alt={obj.text} className="w-full h-auto" />
                        )}
                        <div className="p-2 bg-black/30" style={{ color: 'hsl(40,20%,70%)' }}>
                          <div className="text-xs font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,65%)' }}>
                            [{obj.category}]
                          </div>
                          <p className="text-xs leading-relaxed mt-1">{obj.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center pb-8">
            <button onClick={onBack}
              className="px-5 py-2.5 rounded-lg text-sm hover:opacity-80 transition-all"
              style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
              ← Back
            </button>
            <button onClick={handleNext}
              className="px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
              style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,90%)' }}>
              👑 Choose Leaders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}