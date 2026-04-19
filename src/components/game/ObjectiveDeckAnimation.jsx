import React, { useState, useEffect } from 'react';

export default function ObjectiveDeckAnimation({ players, onComplete }) {
  const [revealed, setRevealed] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < players.length) {
        setRevealed(prev => [...prev, index]);
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setTimeout(onComplete, 1200);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [players.length, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* Deck base */}
        <div className="absolute w-32 h-40 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, hsl(38,70%,28%), hsl(38,60%,20%))',
            border: '3px solid hsl(43,80%,55%)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.5)',
            transform: 'perspective(1000px) rotateX(5deg)',
          }}>
          <div className="w-full h-full flex items-center justify-center flex-col gap-1"
            style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,45%)', fontSize: '24px' }}>
            🎴
            <div style={{ fontSize: '11px', opacity: 0.5, letterSpacing: '2px' }}>DECK</div>
          </div>
        </div>

        {/* Animated cards coming out */}
        {revealed.map((i, idx) => {
          if (!players[i]) return null;
          const objective = players[i]?.objectives?.[0];
          const xOffset = Math.sin(idx * 0.7) * 60 - 80;
          const yOffset = idx * 45;
          const rotation = (idx - Math.floor(revealed.length / 2)) * 4;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                animation: `cardDraw 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                animationDelay: `${idx * 0.8}s`,
              }}>
              <div className="w-48 h-64 rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, hsl(40,48%,30%), hsl(35,38%,16%))',
                  border: '2.5px solid hsl(43,85%,62%)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.12)',
                  transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotateZ(${rotation}deg)`,
                }}>
                {objective?.image ? (
                  <>
                    <img src={objective.image} alt={objective.text} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-between"
                    style={{
                      fontFamily: "'Crimson Text', serif",
                      color: 'hsl(40,30%,88%)',
                      background: 'linear-gradient(135deg, rgba(139,100,50,0.2) 0%, rgba(100,80,40,0.08) 100%)',
                    }}>
                    <div className="text-center text-xs opacity-75 uppercase tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,85%,68%)', letterSpacing: '1.5px' }}>
                      📜 Secret Objective
                    </div>
                    <div className="flex items-center justify-center text-center text-base leading-relaxed flex-1"
                      style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                      <span>
                        {objective?.text || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-xs opacity-65 text-center" style={{ fontFamily: "'Cinzel',serif", letterSpacing: '1px', fontWeight: 600 }}>
                      ✦ {objective?.category} ✦
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Sparkle effect on completion */}
        {!isAnimating && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  background: ['hsl(43,95%,70%)', 'hsl(200,85%,65%)', 'hsl(120,75%,65%)'][i % 3],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `sparkle 1.4s ease-out forwards`,
                  animationDelay: `${i * 0.07}s`,
                  boxShadow: `0 0 ${Math.random() * 4 + 4}px currentColor`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardDraw {
          0% {
            transform: translateX(-300px) translateY(-120px) rotateZ(-30deg) rotateY(35deg) scale(0.5);
            opacity: 0;
            filter: blur(6px);
          }
          50% {
            filter: blur(2px);
          }
          75% {
            transform: translateX(15px) translateY(-5px) rotateZ(1deg) rotateY(2deg) scale(1.08);
            opacity: 1;
          }
          100% {
            transform: translateX(0) translateY(0) rotateZ(0deg) rotateY(0deg) scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }
        @keyframes sparkle {
          0% {
            transform: scale(1.2) translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: scale(0) translateY(-60px) translateX(${Math.random() * 60 - 30}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}