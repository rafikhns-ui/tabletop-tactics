import React, { useState } from 'react';
import { FACTIONS } from './ardoniaData';

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
const PLAYER_LABELS = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
const PLAYABLE_FACTIONS = Object.values(FACTIONS).filter(f => f.playable);
const CONTINENT_ORDER = ['Mangian', 'Sharqian'];

function FactionCard({ faction, selected, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-left px-4 py-4 rounded-sm transition-all text-xs relative overflow-hidden group border-2"
      style={{
        background: selected 
          ? `linear-gradient(135deg, ${faction.color}40, ${faction.color}20)`
          : 'linear-gradient(135deg, hsl(0,0%,12%), hsl(35,15%,10%))',
        borderColor: selected ? faction.color : disabled ? 'hsl(0,0%,20%)' : 'hsl(0,0%,25%)',
        color: disabled ? 'hsl(0,0%,30%)' : selected ? faction.color : 'hsl(40,20%,70%)',
        opacity: disabled ? 0.3 : 1,
        boxShadow: selected 
          ? `0 0 30px ${faction.color}50, 0 0 60px ${faction.color}25, inset 0 0 20px ${faction.color}20`
          : `0 4px 12px rgba(0,0,0,0.7)`,
      }}>
      {/* Dramatic glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-300" style={{ background: faction.color, filter: 'blur(20px)' }} />
      
      {/* Crown accent line */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: faction.color,
          boxShadow: `0 0 10px ${faction.color}`
        }} />
      )}
      
      <div className="relative z-10">
        <div className="font-black text-sm mb-1" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {faction.emoji} {faction.name}
        </div>
        <div className="text-xs opacity-40 mb-2 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>
          {faction.continent}
        </div>
        <div className="text-xs leading-relaxed opacity-70 line-clamp-3">{faction.description}</div>
        {selected && (
          <div className="mt-3 text-xs px-2.5 py-2 rounded-sm border" style={{ 
            background: `${faction.color}15`, 
            borderColor: faction.color,
            borderLeft: `3px solid ${faction.color}`,
            color: 'hsl(43,85%,70%)',
            fontStyle: 'italic'
          }}>
            ⚔️ {faction.specialRule}
          </div>
        )}
      </div>
    </button>
  );
}

function PlayerSlot({ index, factionId, onChange, takenFactionIds, isAI }) {
  const playerColor = PLAYER_COLORS[index];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${playerColor}44`, background: 'hsl(35,20%,13%)' }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: `${playerColor}18`, borderBottom: `1px solid ${playerColor}33` }}>
        <div className="w-3 h-3 rounded-full" style={{ background: playerColor }} />
        <span className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: playerColor }}>
          {isAI ? `🤖 AI Player ${index + 1}` : PLAYER_LABELS[index]}
        </span>
      </div>

      {isAI ? (
        <div className="px-4 py-3 text-xs opacity-40 italic" style={{ color: 'hsl(40,20%,60%)' }}>
          The AI will be assigned a faction automatically.
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {CONTINENT_ORDER.map(continent => (
            <div key={continent}>
              <div className="text-sm mb-3 opacity-80 tracking-[0.1em] font-black flex items-center gap-3" style={{ 
                fontFamily: "'Cinzel',serif", 
                color: continent === 'Mangian' ? 'hsl(200,75%,60%)' : 'hsl(40,85%,60%)',
                textTransform: 'uppercase'
              }}>
                <div style={{
                  height: '1px',
                  flex: 1,
                  background: `linear-gradient(90deg, transparent, ${continent === 'Mangian' ? 'hsl(200,75%,60%)' : 'hsl(40,85%,60%)'})`
                }} />
                {continent === 'Mangian' ? '🌍 WESTERN REALM' : '🌏 EASTERN REALM'}
                <div style={{
                  height: '1px',
                  flex: 1,
                  background: `linear-gradient(90deg, ${continent === 'Mangian' ? 'hsl(200,75%,60%)' : 'hsl(40,85%,60%)'}, transparent)`
                }} />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {PLAYABLE_FACTIONS.filter(f => f.continent === continent).map(f => (
                  <FactionCard
                    key={f.id}
                    faction={f}
                    selected={factionId === f.id}
                    disabled={takenFactionIds.includes(f.id)}
                    onClick={() => onChange(f.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FactionSelectStep({ mode, playerCount = 2, onNext, onBack }) {
  const [aiCount, setAiCount] = useState(mode === 'ai' ? 3 : 0);
  const humanCount = mode === 'ai' ? 1 : playerCount;
  const maxAI = mode === 'ai' ? 3 : Math.max(0, 5 - humanCount);

  const buildPlayers = (aiC) => Array.from({ length: humanCount + aiC }, (_, i) => ({
    id: i >= humanCount ? `ai${i - humanCount + 1}` : `p${i + 1}`,
    isAI: i >= humanCount,
    factionId: null,
  }));

  const [players, setPlayers] = useState(() => buildPlayers(mode === 'ai' ? 1 : 0));
  const takenFactionIds = players.map(p => p.factionId).filter(Boolean);
  const allChosen = players.filter(p => !p.isAI).every(p => p.factionId);

  const handleAiCountChange = (n) => {
    setAiCount(n);
    setPlayers(buildPlayers(n));
  };

  const updatePlayer = (index, factionId) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, factionId } : p));
  };

  const handleNext = () => {
    onNext(players);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start overflow-auto relative"
      style={{ 
        background: 'linear-gradient(160deg, hsl(0,0%,5%), hsl(35,20%,8%), hsl(0,0%,3%))',
        backgroundAttachment: 'fixed'
      }}>
      {/* Dramatic background with atmospheric layers */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ 
        background: `
          radial-gradient(ellipse 800px 600px at 20% 30%, hsl(355,80%,25%), transparent 60%),
          radial-gradient(ellipse 900px 700px at 80% 70%, hsl(43,90%,20%), transparent 60%),
          radial-gradient(ellipse 600px 800px at 50% 100%, hsl(355,60%,15%), transparent 70%)
        `,
        filter: 'blur(100px)'
      }} />
      
      {/* Dramatic overlay with vignette */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)`
      }} />
      
      <div className="w-full max-w-6xl px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="mb-6 text-7xl font-black" style={{ 
            textShadow: `0 0 40px rgba(255,200,50,0.6), 0 0 80px rgba(220,50,50,0.4), 0 8px 16px rgba(0,0,0,0.9)`,
            animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}>
            ⚜️
          </div>
          <h1 className="text-6xl font-black mb-4 leading-tight" style={{ 
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
            CLAIM YOUR THRONE
          </h1>
          <p className="text-sm opacity-70 tracking-[0.2em] mt-4" style={{ 
            color: 'hsl(355,80%,60%)', 
            fontFamily: "'Cinzel',serif",
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            {mode === 'ai' ? `⚔️ CONQUER ARDONIA — FACE ${aiCount} RIVALS` : `⚔️ ${humanCount} RULER${humanCount > 1 ? 'S' : ''} + ${aiCount} MIGHTY AI`}
          </p>
          <div className="mt-6 flex gap-2 justify-center opacity-60">
            <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, transparent, hsl(355,80%,60%))', marginTop: '6px' }} />
            <div style={{ fontSize: '12px', color: 'hsl(355,80%,60%)', fontFamily: "'Cinzel',serif" }}>❖</div>
            <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, hsl(355,80%,60%), transparent)', marginTop: '6px' }} />
          </div>
        </div>

        {(mode === 'multiplayer' || mode === 'ai') && (
          <div className="flex items-center justify-center gap-4 mb-10 p-5 rounded-sm backdrop-blur-md border"
            style={{ 
              background: 'linear-gradient(135deg, hsl(355,70%,10%), hsl(0,0%,8%))',
              borderColor: 'hsl(355,80%,35%)',
              boxShadow: '0 0 40px rgba(220,60,60,0.25), inset 0 0 20px rgba(220,60,60,0.05)'
            }}>
            <span className="text-xs opacity-80 font-black tracking-[0.15em]" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(355,90%,65%)', textTransform: 'uppercase' }}>⚔️ Opposing Forces</span>
            <div style={{ width: '1px', height: '24px', background: 'hsl(355,80%,35%)' }} />
            {Array.from({ length: maxAI }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => handleAiCountChange(n)}
                className="w-11 h-11 text-sm font-black transition-all hover:scale-125 active:scale-95 border-2 rounded-sm"
                style={{
                  background: aiCount === n 
                    ? `linear-gradient(135deg, hsl(355,80%,40%), hsl(355,80%,25%))` 
                    : 'linear-gradient(135deg, hsl(0,0%,15%), hsl(35,15%,10%))',
                  borderColor: aiCount === n ? 'hsl(355,90%,55%)' : 'hsl(0,0%,25%)',
                  color: aiCount === n ? 'hsl(0,0%,98%)' : 'hsl(40,20%,50%)',
                  fontFamily: "'Cinzel',serif",
                  boxShadow: aiCount === n 
                    ? '0 0 25px rgba(220,60,60,0.6), 0 0 50px rgba(220,60,60,0.3), inset 0 0 10px rgba(220,60,60,0.2)' 
                    : '0 4px 8px rgba(0,0,0,0.6)',
                  letterSpacing: '0.05em'
                }}>
                {n}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(humanCount, 3)}, 1fr)` }}>
          {players.filter(p => !p.isAI).map((p, i) => (
            <PlayerSlot
              key={p.id}
              index={i}
              factionId={p.factionId}
              onChange={(factionId) => updatePlayer(i, factionId)}
              takenFactionIds={takenFactionIds.filter(id => id !== p.factionId)}
              isAI={p.isAI}
            />
          ))}
        </div>

        <div className="flex gap-4 justify-center pb-12">
          <button onClick={onBack}
            className="px-6 py-3 text-sm font-bold transition-all border-2 rounded-sm hover:opacity-90 active:scale-95"
            style={{ 
              background: 'linear-gradient(135deg, hsl(0,0%,15%), hsl(35,15%,12%))', 
              borderColor: 'hsl(0,0%,30%)', 
              color: 'hsl(40,20%,70%)', 
              fontFamily: "'Cinzel',serif",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(0,0,0,0.7)'
            }}>
            ← Return
          </button>
          <button onClick={handleNext} disabled={!allChosen}
            className="px-8 py-3 text-sm font-black transition-all border-2 rounded-sm hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Cinzel',serif",
              background: allChosen 
                ? 'linear-gradient(135deg, hsl(355,80%,35%), hsl(355,80%,20%))' 
                : 'hsl(0,0%,15%)',
              borderColor: allChosen ? 'hsl(355,90%,60%)' : 'hsl(0,0%,25%)',
              color: allChosen ? 'hsl(0,0%,98%)' : 'hsl(0,0%,40%)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              boxShadow: allChosen 
                ? '0 0 30px rgba(220,60,60,0.5), 0 0 60px rgba(220,60,60,0.25), 0 4px 12px rgba(0,0,0,0.8)'
                : '0 4px 12px rgba(0,0,0,0.7)',
              opacity: allChosen ? 1 : 0.5,
            }}>
            ⚔️ Claim Thy Throne
          </button>
        </div>
      </div>
    </div>
  );
}