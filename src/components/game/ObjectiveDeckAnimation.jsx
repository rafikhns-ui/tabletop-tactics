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
        setTimeout(onComplete, 800);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [players.length, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="relative w-96 h-80">
        {/* Deck base */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-40 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(38,70%,25%), hsl(38,60%,18%))',
            border: '2px solid hsl(43,80%,50%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            backfaceVisibility: 'hidden',
          }}>
          <div className="w-full h-full flex items-center justify-center"
            style={{ fontFamily: "'Cinzel',serif", fontSize: '12px', color: 'hsl(43,80%,40%)', opacity: 0.6 }}>
            🎴 Deck
          </div>
        </div>

        {/* Animated cards coming out */}
        {revealed.map((i, idx) => (
          <div
            key={i}
            className="absolute"
            style={{
              animation: `cardDraw 0.6s ease-out forwards`,
              animationDelay: `${idx * 0.6}s`,
            }}>
            <div className="w-32 h-40 rounded-lg p-3 text-xs"
              style={{
                background: 'linear-gradient(135deg, hsl(35,40%,22%), hsl(35,30%,15%))',
                border: '1.5px solid hsl(43,85%,55%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                fontFamily: "'Crimson Text', serif",
                color: 'hsl(40,25%,80%)',
              }}>
              <div className="text-center text-xs opacity-60 mb-1" style={{ fontFamily: "'Cinzel',serif" }}>
                Secret Objective
              </div>
              <div className="h-full flex items-center justify-center text-center leading-tight">
                <span style={{ fontSize: '11px' }}>
                  {players[i]?.objectives?.[0]?.text || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Confetti effect */}
        {!isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: ['hsl(43,90%,60%)', 'hsl(38,80%,50%)', 'hsl(355,70%,50%)'][i % 3],
                  left: `${20 + i * 10}%`,
                  top: `${30 + (i % 2) * 20}%`,
                  animation: `fall 1s ease-in forwards`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardDraw {
          0% {
            transform: translateX(-200px) translateY(-100px) rotateZ(-20deg) scale(0.8);
            opacity: 0;
          }
          50% {
            rotateZ(-10deg);
          }
          100% {
            transform: translateX(${revealed.length > 1 ? (revealed.length - 1) * 30 : 0}px) translateY(${revealed.length > 1 ? (revealed.length - 1) * 20 : 0}px) rotateZ(0deg) scale(1);
            opacity: 1;
          }
        }
        @keyframes fall {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}