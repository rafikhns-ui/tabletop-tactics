import React from 'react';
import { FACTIONS } from './ardoniaData';

export default function GameMenu({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, hsl(35,25%,15%) 0%, hsl(35,20%,7%) 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {['⚔️','🏰','🐉','🗡️','⚜️','🛡️','🌙','☀️'].map((e, i) => (
          <div key={i} className="absolute text-4xl opacity-[0.04]"
            style={{ top: `${10 + i * 12}%`, left: i % 2 === 0 ? `${5 + i * 3}%` : `${80 - i * 3}%` }}>
            {e}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg rounded-2xl p-8 text-center relative scroll-in"
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: '2px solid hsl(43,70%,45%)', boxShadow: '0 0 60px rgba(180,140,40,0.15)' }}>
        <div className="text-5xl mb-2">⚜️</div>
        <h1 className="text-4xl font-black mb-1 glow-gold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
          Rulers of
        </h1>
        <h1 className="text-4xl font-black mb-4 glow-gold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
          Ardonia
        </h1>

        <p className="text-base leading-relaxed mb-6" style={{ color: 'hsl(40,20%,62%)', fontFamily: "'Crimson Text',serif" }}>
          Command armies, gather resources from your Mine, Sawmill & Field, pursue secret objectives across Military,
          Economic, Political and Spiritual domains — and forge your empire across the realm of Ardonia.
        </p>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'hsl(38,50%,30%)' }} />
          <span style={{ color: 'hsl(43,80%,50%)' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'hsl(38,50%,30%)' }} />
        </div>

        {/* Faction previews */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {Object.values(FACTIONS).map(f => (
            <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-left"
              style={{ background: 'hsl(35,20%,18%)', border: `1px solid ${f.color}44` }}>
              <span className="text-xl">{f.emoji}</span>
              <div>
                <div className="text-xs font-bold" style={{ color: f.color, fontFamily: "'Cinzel',serif" }}>{f.name}</div>
                <div className="text-xs opacity-50" style={{ color: 'hsl(40,15%,65%)' }}>{f.description.split(',')[0]}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button onClick={() => onStart('ai')}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(355,65%,32%), hsl(355,65%,22%))', border: '1px solid hsl(355,65%,48%)', color: 'hsl(40,30%,95%)', boxShadow: '0 4px 20px rgba(160,30,30,0.3)' }}>
            🐉 Solo Campaign
            <div className="text-xs font-normal opacity-70 mt-0.5">vs The Shadow Lord (AI)</div>
          </button>
          <button onClick={() => onStart('2player')}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(220,55%,28%), hsl(220,55%,18%))', border: '1px solid hsl(220,55%,45%)', color: 'hsl(40,30%,95%)', boxShadow: '0 4px 20px rgba(30,80,160,0.3)' }}>
            ⚔️ Duel of Kings
            <div className="text-xs font-normal opacity-70 mt-0.5">2 Players, same screen</div>
          </button>
        </div>

        {/* Rules summary */}
        <div className="mt-5 p-4 rounded-xl text-left space-y-2" style={{ background: 'hsl(35,20%,17%)', border: '1px solid hsl(35,20%,27%)' }}>
          <div className="text-xs font-bold opacity-50 mb-1" style={{ fontFamily: "'Cinzel',serif" }}>HOW TO PLAY</div>
          {[
            ['🏰', 'Deploy', 'Place troop reinforcements on your territories'],
            ['⚔️', 'Attack', 'Select your territory → click enemy territory'],
            ['🛡️', 'Fortify', 'Move troops between adjacent friendly territories'],
            ['🪙', 'Resources', 'Each territory = 1 Gold/turn. Mine/Sawmill/Field produce more'],
            ['🎯', 'Win', 'Complete 2 secret objectives (Military/Economic/Political/Spiritual)'],
          ].map(([icon, name, desc]) => (
            <div key={name} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(40,15%,65%)' }}>
              <span className="mt-0.5">{icon}</span>
              <span className="font-semibold flex-shrink-0" style={{ color: 'hsl(43,80%,55%)', width: '56px' }}>{name}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}