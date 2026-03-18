import React, { useState, useEffect } from 'react';
import { OBJECTIVES, FACTIONS } from './ardoniaData';
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
    const PLAYABLE_FACTIONS = Object.values(FACTIONS).filter(f => f.playable);
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
    <div className="min-h-screen flex flex-col items-center justify-start overflow-auto relative"
      style={{ 
        background: 'linear-gradient(160deg, hsl(0,0%,5%), hsl(35,20%,8%), hsl(0,0%,3%))',
        backgroundAttachment: 'fixed'
      }}>
      {/* Dramatic background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ 
        background: `
          radial-gradient(ellipse 800px 600px at 20% 30%, hsl(43,90%,25%), transparent 60%),
          radial-gradient(ellipse 900px 700px at 80% 70%, hsl(270,80%,20%), transparent 60%),
          radial-gradient(ellipse 600px 800px at 50% 100%, hsl(43,70%,15%), transparent 70%)
        `,
        filter: 'blur(100px)'
      }} />
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)`
      }} />
      
      {showDeckAnimation && playersWithObjectives && (
        <ObjectiveDeckAnimation players={playersWithObjectives} onComplete={handleAnimationComplete} />
      )}

      {!showDeckAnimation && playersWithObjectives && (
        <div className="w-full max-w-6xl px-6 py-12 relative z-10">
          <div className="text-center mb-10">
            <div className="mb-6 text-7xl font-black" style={{ 
              textShadow: `0 0 40px rgba(255,200,50,0.6), 0 0 80px rgba(220,50,50,0.4), 0 8px 16px rgba(0,0,0,0.9)`,
              animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              🎯
            </div>
            <h1 className="text-6xl font-black mb-4" style={{ 
              fontFamily: "'Cinzel',serif",
              color: 'hsl(43,100%,70%)',
              textShadow: `
                0 0 40px rgba(255,200,50,0.8),
                0 0 80px rgba(255,150,0,0.4),
                0 8px 16px rgba(0,0,0,0.95),
                2px 2px 0 rgba(0,0,0,0.8)
              `,
              letterSpacing: '0.05em'
            }}>
              SECRET OBJECTIVES REVEALED
            </h1>
            <p className="text-sm opacity-70 tracking-[0.15em] mt-4" style={{ 
              color: 'hsl(43,80%,60%)', 
              fontFamily: "'Cinzel',serif",
              textTransform: 'uppercase',
              fontWeight: 600
            }}>
              ⚔️ PATH TO DOMINION
            </p>
          </div>

          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(playersWithObjectives.filter(p => !p.isAI).length, 3)}, 1fr)` }}>
            {playersWithObjectives.filter(p => !p.isAI).map((player, idx) => {
              const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
              const color = PLAYER_COLORS[idx];

              return (
                <div key={player.id} className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${color}44`, background: 'hsl(35,20%,13%)' }}>
                  <div className="px-4 py-3" style={{ background: `${color}18`, borderBottom: `1px solid ${color}33` }}>
                    <div className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: color }}>
                      {player.isAI ? `🤖 AI Player` : 'Player'}
                    </div>
                  </div>
                  <div className="p-4">
                    {!player.isAI ? (
                      <div className="space-y-3">
                        {player.objectives?.map(obj => (
                          <div key={obj.id} className="rounded-sm overflow-hidden border-2" style={{ 
                            borderColor: 'hsl(43,80%,50%)',
                            boxShadow: '0 0 15px rgba(255,200,50,0.2), inset 0 0 10px rgba(255,200,50,0.05)'
                          }}>
                            {obj.image && (
                              <img src={obj.image} alt={obj.text} className="w-full h-auto" style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' }} />
                            )}
                            <div className="p-3 bg-gradient-to-b from-black/60 to-black/80" style={{ color: 'hsl(40,20%,75%)' }}>
                              <div className="text-xs font-black tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,70%)', textTransform: 'uppercase' }}>
                                ⚔️ {obj.category}
                              </div>
                              <p className="text-xs leading-relaxed mt-2">{obj.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs opacity-50 italic" style={{ color: 'hsl(40,20%,60%)' }}>
                        🔒 Secret objectives (hidden)
                      </div>
                    )}
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