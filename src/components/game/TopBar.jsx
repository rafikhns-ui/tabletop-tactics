import React from 'react';

export default function TopBar({ gameState, currentPlayer, phase, messages, onAdvancePhase, onToggleMusic, musicPlaying, onOpenEffects, onMenu }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border"
      style={{ background: 'linear-gradient(135deg, hsl(35,30%,10%), hsl(35,20%,14%))' }}>
      <div className="flex items-center gap-2">
        <img src="https://media.base44.com/images/public/69b732e420481df67e8a6804/18fc0b373_photo-output11.png" alt="Rulers of Ardonia" className="h-10" style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,50,0.3))' }} />
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'hsl(35,20%,22%)', color: 'hsl(40,20%,60%)', border: '1px solid hsl(35,20%,30%)' }}>
          Turn {gameState?.turn}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {messages.length > 0 && (
          <div className="text-xs px-3 py-1 rounded max-w-xs truncate"
            style={{ background: 'hsl(35,25%,18%)', border: '1px solid hsl(43,70%,40%)', color: 'hsl(43,80%,75%)' }}>
            {messages[messages.length - 1]}
          </div>
        )}
        {gameState && currentPlayer && !currentPlayer.isAI && (
          <button onClick={onAdvancePhase}
            className="text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,90%)' }}>
            {phase === 'deploy' ? '🚶 Begin Move' : phase === 'move' ? '⚔️ Begin Attack' : phase === 'attack' ? '🛡️ Fortify' : '✦ End Turn'}
          </button>
        )}
        <button onClick={onOpenEffects}
          className="text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
          style={{ fontFamily: "'Cinzel',serif", background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,32%)', color: 'hsl(40,20%,65%)' }}>
          📊 Effects
        </button>
        <button onClick={onToggleMusic}
          className="text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
          style={{ fontFamily: "'Cinzel',serif", background: musicPlaying ? 'hsl(130,50%,35%)' : 'hsl(35,20%,22%)', border: `1px solid ${musicPlaying ? 'hsl(130,60%,55%)' : 'hsl(35,20%,35%)'}`, color: 'hsl(40,20%,65%)' }}>
          {musicPlaying ? '🎵 Music ON' : '🔇 Music OFF'}
        </button>
        <button onClick={onMenu}
          className="text-xs px-3 py-1.5 rounded hover:opacity-80"
          style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)' }}>
          ⬅ Menu
        </button>
      </div>
    </div>
  );
}