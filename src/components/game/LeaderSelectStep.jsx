import React, { useState } from 'react';
import { FACTIONS, LEADERS } from './ardoniaData';

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

function LeaderCard({ leader, selected, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg transition-all text-xs"
      style={{
        background: selected ? 'hsl(38,70%,22%)' : 'hsl(35,20%,18%)',
        border: `1px solid ${selected ? 'hsl(38,80%,50%)' : 'hsl(35,20%,28%)'}`,
        color: selected ? 'hsl(43,90%,80%)' : 'hsl(40,20%,65%)',
      }}>
      <div className="font-bold">{leader.name} <span className="opacity-40 font-normal text-xs">({leader.type})</span></div>
      <div className="opacity-70 mt-0.5">✦ {leader.passive}</div>
      <div className="opacity-45 mt-0.5">✗ {leader.disadvantage}</div>
    </button>
  );
}

function PlayerSlot({ index, player, leaderIndex, onChange }) {
  const faction = FACTIONS[player.factionId];
  const leaders = faction ? (LEADERS[player.factionId] || []) : [];
  const playerColor = PLAYER_COLORS[index];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${playerColor}44`, background: 'hsl(35,20%,13%)' }}>
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: `${playerColor}18`, borderBottom: `1px solid ${playerColor}33` }}>
        <div className="w-3 h-3 rounded-full" style={{ background: playerColor }} />
        <div>
          <span className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: playerColor }}>
            {player.isAI ? `🤖 AI Player` : 'Player'}
          </span>
          <div className="text-xs opacity-60 mt-0.5">
            {faction?.emoji} {faction?.name}
          </div>
        </div>
      </div>

      {player.isAI ? (
        <div className="px-4 py-3 text-xs opacity-40 italic" style={{ color: 'hsl(40,20%,60%)' }}>
          AI will be assigned a leader automatically.
        </div>
      ) : (
        <div className="p-3 space-y-2">
          <div className="text-xs mb-2 opacity-40 tracking-widest" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,70%,55%)' }}>
            CHOOSE YOUR LEADER
          </div>
          {leaders.length > 0 ? (
            <div className="space-y-1">
              {leaders.map((l, i) => (
                <LeaderCard key={l.id} leader={l} selected={leaderIndex === i} onClick={() => onChange(i)} />
              ))}
            </div>
          ) : (
            <div className="text-xs opacity-50">No leaders available</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LeaderSelectStep({ players, onConfirm, onBack }) {
  const [selectedLeaders, setSelectedLeaders] = useState(() => {
    const leaders = {};
    players.forEach(p => {
      leaders[p.id] = 0;
    });
    return leaders;
  });

  const handleLeaderChange = (playerId, leaderIndex) => {
    setSelectedLeaders(prev => ({
      ...prev,
      [playerId]: leaderIndex,
    }));
  };

  const handleConfirm = () => {
    const finalPlayers = players.map(p => ({
      ...p,
      leaderIndex: selectedLeaders[p.id],
    }));
    onConfirm(finalPlayers);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 overflow-auto"
      style={{ background: 'linear-gradient(160deg, hsl(35,25%,10%), hsl(35,20%,8%))' }}>
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
            👑 Select Your Leaders
          </h1>
          <p className="text-sm opacity-50" style={{ color: 'hsl(40,20%,65%)' }}>
            Each faction has unique leaders with special abilities
          </p>
        </div>

        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 3)}, 1fr)` }}>
          {players.map((player, idx) => (
            <PlayerSlot
              key={player.id}
              index={idx}
              player={player}
              leaderIndex={selectedLeaders[player.id]}
              onChange={(leaderIndex) => handleLeaderChange(player.id, leaderIndex)}
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center pb-8">
          <button onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm hover:opacity-80 transition-all"
            style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
            ← Back
          </button>
          <button onClick={handleConfirm}
            className="px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(120,50%,25%), hsl(120,50%,18%))', border: '1px solid hsl(120,50%,40%)', color: 'hsl(120,60%,85%)' }}>
            ⚜️ Begin the Conquest
          </button>
        </div>
      </div>
    </div>
  );
}