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
      className="text-left px-3 py-3 rounded-lg transition-all text-xs relative overflow-hidden group"
      style={{
        background: selected ? `${faction.color}35` : 'hsl(35,20%,16%)',
        border: `2px solid ${selected ? faction.color : disabled ? 'hsl(35,20%,20%)' : 'hsl(35,20%,26%)'}`,
        color: disabled ? 'hsl(35,20%,30%)' : selected ? faction.color : 'hsl(40,20%,70%)',
        opacity: disabled ? 0.35 : 1,
        boxShadow: selected ? `0 0 20px ${faction.color}40, inset 0 0 10px ${faction.color}15` : 'none',
      }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity" style={{ background: faction.color }} />
      <div className="relative z-10">
        <div className="font-bold text-sm mb-0.5">{faction.emoji} {faction.name}</div>
        <div className="text-xs opacity-50 mb-1" style={{ color: disabled ? undefined : 'hsl(40,15%,55%)' }}>
          {faction.continent}
        </div>
        <div className="text-xs mt-1 leading-snug opacity-75 line-clamp-2">{faction.description}</div>
        {selected && (
          <div className="mt-2 text-xs px-2 py-1.5 rounded border" style={{ 
            background: `${faction.color}20`, 
            borderColor: faction.color,
            color: 'hsl(43,85%,70%)'
          }}>
            ✦ {faction.specialRule}
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
              <div className="text-sm mb-2.5 opacity-70 tracking-widest font-bold" style={{ fontFamily: "'Cinzel',serif", color: continent === 'Mangian' ? 'hsl(200,70%,55%)' : 'hsl(40,80%,55%)' }}>
                {continent === 'Mangian' ? '🌍 WESTERN REALM — MANGIAN' : '🌏 EASTERN REALM — SHARQIAN'}
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
        background: 'linear-gradient(160deg, hsl(35,25%,8%), hsl(35,20%,5%))',
        backgroundAttachment: 'fixed'
      }}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ 
        background: `radial-gradient(circle at 20% 50%, hsl(43,90%,50%), transparent 50%),
                     radial-gradient(circle at 80% 80%, hsl(38,70%,40%), transparent 50%)`
      }} />
      
      <div className="w-full max-w-6xl px-6 py-8 relative z-10">
        <div className="text-center mb-10">
          <div className="mb-4 text-6xl animate-pulse" style={{ textShadow: '0 0 20px rgba(255,200,50,0.4)' }}>
            ⚜️
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ 
            fontFamily: "'Cinzel',serif", 
            color: 'hsl(43,95%,65%)',
            textShadow: '0 0 30px rgba(255,200,50,0.3), 0 4px 8px rgba(0,0,0,0.8)'
          }}>
            Choose Your Faction
          </h1>
          <p className="text-sm opacity-60 tracking-widest" style={{ color: 'hsl(40,20%,70%)', fontFamily: "'Cinzel',serif" }}>
            {mode === 'ai' ? `CONQUER ARDONIA VS ${aiCount} RIVALS` : `${humanCount} RULER${humanCount > 1 ? 'S' : ''} + ${aiCount} AI`}
          </p>
          <div className="h-1 w-24 mx-auto mt-3 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(43,90%,55%), transparent)' }} />
        </div>

        {(mode === 'multiplayer' || mode === 'ai') && (
          <div className="flex items-center justify-center gap-3 mb-8 p-4 rounded-xl backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(135deg, hsl(355,60%,15%), hsl(35,20%,12%))',
              border: '1.5px solid hsl(355,60%,35%)',
              boxShadow: '0 0 20px rgba(220,60,60,0.2)'
            }}>
            <span className="text-xs opacity-70 font-bold tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(355,70%,65%)' }}>⚔️ OPPOSING FORCES:</span>
            {Array.from({ length: maxAI }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => handleAiCountChange(n)}
                className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: aiCount === n ? 'hsl(355,60%,35%)' : 'hsl(35,20%,22%)',
                  border: `1px solid ${aiCount === n ? 'hsl(355,60%,55%)' : 'hsl(35,20%,32%)'}`,
                  color: aiCount === n ? 'hsl(40,30%,95%)' : 'hsl(40,20%,50%)',
                  fontFamily: "'Cinzel',serif",
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

        <div className="flex gap-3 justify-center pb-8">
          <button onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm hover:opacity-80 transition-all"
            style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
            ← Back
          </button>
          <button onClick={handleNext} disabled={!allChosen}
            className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              fontFamily: "'Cinzel',serif",
              background: allChosen ? 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))' : 'hsl(35,20%,22%)',
              border: `1px solid ${allChosen ? 'hsl(38,80%,55%)' : 'hsl(35,20%,35%)'}`,
              color: allChosen ? 'hsl(43,90%,90%)' : 'hsl(35,20%,40%)',
              opacity: allChosen ? 1 : 0.6,
            }}>
            🎯 Draw Secret Objectives
          </button>
        </div>
      </div>
    </div>
  );
}