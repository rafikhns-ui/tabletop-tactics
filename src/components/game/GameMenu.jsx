import React from 'react';

export default function GameMenu({ onStart }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, hsl(35,25%,16%) 0%, hsl(35,20%,8%) 100%)',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-5 select-none">⚔️</div>
        <div className="absolute top-20 right-16 text-5xl opacity-5 select-none">🏰</div>
        <div className="absolute bottom-16 left-20 text-5xl opacity-5 select-none">🐉</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-5 select-none">🗡️</div>
        <div className="absolute top-1/2 left-4 text-4xl opacity-5 select-none">🛡️</div>
        <div className="absolute top-1/3 right-4 text-4xl opacity-5 select-none">🗺️</div>
      </div>

      {/* Main card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center relative fantasy-border scroll-in"
        style={{
          background: 'linear-gradient(160deg, hsl(35,25%,14%) 0%, hsl(35,20%,10%) 100%)',
        }}
      >
        {/* Crest */}
        <div className="text-6xl mb-3">⚜️</div>

        <h1
          className="text-4xl font-black mb-1 glow-gold"
          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(43,90%,58%)' }}
        >
          Realm of
        </h1>
        <h1
          className="text-4xl font-black mb-4 glow-gold"
          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(43,90%,58%)' }}
        >
          Conquest
        </h1>

        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: 'hsl(40,20%,62%)', fontFamily: "'Crimson Text', serif", fontSize: '16px' }}
        >
          Command armies, conquer territories, and forge your empire across a fantasy realm.
          Deploy troops, wage battle, and outlast your rivals to claim ultimate dominion.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px" style={{ background: 'hsl(38,50%,35%)' }} />
          <span style={{ color: 'hsl(43,90%,55%)', fontSize: '18px' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'hsl(38,50%,35%)' }} />
        </div>

        {/* Game mode buttons */}
        <div className="space-y-3">
          <button
            onClick={() => onStart('ai')}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 hover:shadow-lg active:scale-95"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(0,65%,35%) 0%, hsl(0,65%,25%) 100%)',
              border: '1px solid hsl(0,65%,50%)',
              color: 'hsl(40,30%,95%)',
              boxShadow: '0 4px 20px rgba(180,40,40,0.3)',
            }}
          >
            🐉 Solo Quest
            <div className="text-xs font-normal opacity-70 mt-0.5">vs The Shadow Lord (AI)</div>
          </button>

          <button
            onClick={() => onStart('2player')}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 hover:shadow-lg active:scale-95"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, hsl(220,55%,32%) 0%, hsl(220,55%,22%) 100%)',
              border: '1px solid hsl(220,55%,50%)',
              color: 'hsl(40,30%,95%)',
              boxShadow: '0 4px 20px rgba(40,80,180,0.3)',
            }}
          >
            ⚔️ Duel of Kings
            <div className="text-xs font-normal opacity-70 mt-0.5">2 Players, same screen</div>
          </button>
        </div>

        {/* Rules summary */}
        <div className="mt-6 p-4 rounded-xl text-left space-y-1.5"
          style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
          <div className="text-xs font-bold mb-2 opacity-60" style={{ fontFamily: "'Cinzel', serif" }}>
            HOW TO PLAY
          </div>
          {[
            ['🏰', 'Deploy', 'Place troops on your territories'],
            ['⚔️', 'Attack', 'Click your territory → click enemy'],
            ['🛡️', 'Fortify', 'Move troops to reinforce borders'],
          ].map(([icon, name, desc]) => (
            <div key={name} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(40,20%,65%)' }}>
              <span>{icon}</span>
              <span className="font-semibold" style={{ color: 'hsl(43,90%,58%)', minWidth: '52px' }}>{name}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}