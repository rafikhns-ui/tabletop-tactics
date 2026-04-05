import React, { useState } from 'react';

export default function GameMenu({ onStart, onOnline }) {
  const [playerCount, setPlayerCount] = useState(2);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, hsl(35,25%,15%) 0%, hsl(35,20%,7%) 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {['⚔️','🏰','🐉','🗡️','⚜️','🛡️','🌙','☀️','🌸','🦎','❄️','🔥'].map((e, i) => (
          <div key={i} className="absolute text-4xl opacity-[0.04]"
            style={{ top: `${5 + i * 8}%`, left: i % 2 === 0 ? `${3 + i * 2}%` : `${82 - i * 2}%` }}>
            {e}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg rounded-2xl p-8 text-center relative scroll-in"
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: '2px solid hsl(43,70%,45%)', boxShadow: '0 0 60px rgba(180,140,40,0.15)' }}>
        <div className="relative w-full max-w-sm mx-auto mb-4">
          {/* Sun glow behind the logo */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%', height: '120%',
            background: 'radial-gradient(ellipse at center, rgba(255,210,60,0.65) 0%, rgba(255,160,20,0.35) 35%, rgba(255,100,0,0.12) 65%, transparent 80%)',
            filter: 'blur(18px)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'sunPulse 3s ease-in-out infinite',
          }} />
          <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/18fc0b373_photo-output11.png" alt="Rulers of Ardonia" className="w-full relative" style={{ animation: 'logoGlow 3s ease-in-out infinite' }} />
        </div>

        <style>{`
          @keyframes sunPulse {
            0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          }
          @keyframes logoGlow {
            0%, 100% { filter: drop-shadow(0 0 12px rgba(255,200,50,0.6)) drop-shadow(0 0 30px rgba(255,150,20,0.3)); }
            50% { filter: drop-shadow(0 0 24px rgba(255,220,80,0.9)) drop-shadow(0 0 60px rgba(255,160,30,0.6)); }
          }
        `}</style>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'hsl(40,20%,62%)', fontFamily: "'Crimson Text',serif" }}>
          The factions of Ardonia are diverse nations shaped by an eternal struggle between magic and technology.
          Command armies, pursue secret objectives, and forge your empire across two continents.
        </p>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'hsl(38,50%,30%)' }} />
          <span style={{ color: 'hsl(43,80%,50%)' }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'hsl(38,50%,30%)' }} />
        </div>

        <div className="space-y-3 mb-5">
          <button onClick={() => onStart('ai', 4)}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(355,65%,32%), hsl(355,65%,22%))', border: '1px solid hsl(355,65%,48%)', color: 'hsl(40,30%,95%)', boxShadow: '0 4px 20px rgba(160,30,30,0.3)' }}>
            🐉 Solo Campaign
            <div className="text-xs font-normal opacity-70 mt-0.5">vs The Shadow Lord (AI)</div>
          </button>

          <button onClick={onOnline}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(130,40%,22%), hsl(130,40%,14%))', border: '1px solid hsl(130,45%,38%)', color: 'hsl(40,30%,95%)', boxShadow: '0 4px 20px rgba(30,160,60,0.2)' }}>
            🌐 Online Multiplayer
            <div className="text-xs font-normal opacity-70 mt-0.5">Play with friends on different computers</div>
          </button>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(220,55%,45%)' }}>
            <button onClick={() => onStart('multiplayer', playerCount)}
              className="w-full py-4 font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(220,55%,28%), hsl(220,55%,18%))', color: 'hsl(40,30%,95%)', boxShadow: '0 4px 20px rgba(30,80,160,0.3)', display: 'block' }}>
              ⚔️ Multiplayer
              <div className="text-xs font-normal opacity-70 mt-0.5">{playerCount} Players — same screen</div>
            </button>
            <div className="flex items-center justify-center gap-2 py-2 px-4"
              style={{ background: 'hsl(220,40%,14%)', borderTop: '1px solid hsl(220,30%,25%)' }}>
              <span className="text-xs opacity-50" style={{ color: 'hsl(40,20%,65%)' }}>Players:</span>
              {[2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setPlayerCount(n)}
                  className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: playerCount === n ? 'hsl(220,60%,40%)' : 'hsl(220,30%,22%)',
                    border: `1px solid ${playerCount === n ? 'hsl(220,60%,60%)' : 'hsl(220,30%,30%)'}`,
                    color: playerCount === n ? 'white' : 'hsl(220,20%,55%)',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl text-left space-y-2" style={{ background: 'hsl(35,20%,17%)', border: '1px solid hsl(35,20%,27%)' }}>
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