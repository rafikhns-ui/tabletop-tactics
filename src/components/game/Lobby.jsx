import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Lobby({ onStartOnline, onBack }) {
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Subscribe to session updates
  useEffect(() => {
    if (!session?.id) return;
    const unsub = base44.entities.GameSession.subscribe((event) => {
      if (event.id === session.id) {
        setSession(event.data);
        // If game is starting (faction_select), bubble up
        if (event.data.status === 'faction_select' || event.data.status === 'playing') {
          onStartOnline(event.data);
        }
      }
    });
    return unsub;
  }, [session?.id]);

  const handleCreate = async (playerCount) => {
    if (!user) return;
    setLoading(true);
    setError('');
    const code = generateCode();
    const newSession = await base44.entities.GameSession.create({
      code,
      status: 'lobby',
      mode: 'multiplayer',
      player_count: playerCount,
      players_info: [{
        userId: user.id,
        userName: user.full_name || user.email,
        ready: false,
      }],
    });
    setSession(newSession);
    setMode('waiting');
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');
    const sessions = await base44.entities.GameSession.filter({ code: joinCode.trim().toUpperCase(), status: 'lobby' });
    if (!sessions || sessions.length === 0) {
      setError('Game not found. Check the code and try again.');
      setLoading(false);
      return;
    }
    const s = sessions[0];
    // Check if already in session
    const alreadyIn = s.players_info?.some(p => p.userId === user.id);
    if (!alreadyIn) {
      if (s.players_info?.length >= s.player_count) {
        setError('Game is full.');
        setLoading(false);
        return;
      }
      const updatedPlayers = [...(s.players_info || []), {
        userId: user.id,
        userName: user.full_name || user.email,
        ready: false,
      }];
      const updated = await base44.entities.GameSession.update(s.id, { players_info: updatedPlayers });
      setSession(updated);
    } else {
      setSession(s);
    }
    setMode('waiting');
    setLoading(false);
  };

  const handleStartGame = async () => {
    if (!session) return;
    await base44.entities.GameSession.update(session.id, { status: 'faction_select' });
  };

  const isHost = session?.players_info?.[0]?.userId === user?.id;
  const allJoined = session && session.players_info?.length >= session.player_count;

  if (mode === 'waiting' && session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(35,25%,10%)' }}>
        <div className="w-full max-w-md p-8 rounded-2xl text-center"
          style={{ background: 'hsl(35,20%,15%)', border: '2px solid hsl(43,70%,40%)' }}>
          <div className="text-4xl mb-3">⚜️</div>
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,60%)' }}>
            Game Lobby
          </h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(40,20%,55%)' }}>
            Share this code with your friends
          </p>

          <div className="text-5xl font-black tracking-widest mb-6 py-4 rounded-xl"
            style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,65%)', background: 'hsl(35,20%,20%)', border: '1px solid hsl(43,50%,30%)' }}>
            {session.code}
          </div>

          <div className="mb-6">
            <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: 'hsl(40,20%,50%)', fontFamily: "'Cinzel',serif" }}>
              PLAYERS ({session.players_info?.length}/{session.player_count})
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: session.player_count }).map((_, i) => {
                const p = session.players_info?.[i];
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg"
                    style={{ background: p ? 'hsl(35,25%,20%)' : 'hsl(35,15%,17%)', border: '1px solid hsl(35,20%,28%)' }}>
                    <span className="text-lg">{p ? '👤' : '⏳'}</span>
                    <span className="text-sm font-semibold" style={{ color: p ? 'hsl(43,80%,65%)' : 'hsl(40,15%,35%)' }}>
                      {p ? p.userName : 'Waiting...'}
                    </span>
                    {i === 0 && <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: 'hsl(43,60%,25%)', color: 'hsl(43,80%,60%)' }}>Host</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {isHost && allJoined && (
            <button onClick={handleStartGame}
              className="w-full py-3 rounded-xl font-bold text-lg mb-3 hover:opacity-90 transition-opacity"
              style={{ background: 'hsl(43,80%,40%)', color: 'hsl(35,25%,10%)', fontFamily: "'Cinzel',serif" }}>
              ⚔️ Start Game
            </button>
          )}
          {isHost && !allJoined && (
            <div className="text-sm py-2 mb-3" style={{ color: 'hsl(40,20%,50%)' }}>
              Waiting for all players to join...
            </div>
          )}
          {!isHost && (
            <div className="text-sm py-2 mb-3 animate-pulse" style={{ color: 'hsl(40,20%,50%)' }}>
              Waiting for host to start...
            </div>
          )}

          <button onClick={onBack} className="text-sm opacity-50 hover:opacity-80 transition-opacity" style={{ color: 'hsl(40,20%,60%)' }}>
            ← Leave Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(35,25%,10%)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: 'hsl(35,20%,15%)', border: '2px solid hsl(43,70%,40%)' }}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌐</div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,60%)' }}>
            Online Multiplayer
          </h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(40,20%,50%)' }}>Play with friends across the world</p>
        </div>

        {!mode && (
          <div className="flex flex-col gap-3">
            <button onClick={() => setMode('create')}
              className="py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'hsl(43,80%,40%)', color: 'hsl(35,25%,10%)', fontFamily: "'Cinzel',serif" }}>
              ⚜️ Create Game
            </button>
            <button onClick={() => setMode('join')}
              className="py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'hsl(35,20%,22%)', color: 'hsl(43,80%,65%)', border: '1px solid hsl(43,50%,35%)', fontFamily: "'Cinzel',serif" }}>
              🔗 Join Game
            </button>
            <button onClick={onBack} className="text-sm text-center mt-2 opacity-50 hover:opacity-80 transition-opacity" style={{ color: 'hsl(40,20%,60%)' }}>
              ← Back
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div>
            <p className="text-sm mb-4 text-center" style={{ color: 'hsl(40,20%,55%)' }}>How many players?</p>
            <div className="flex gap-2 justify-center mb-6">
              {[2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => handleCreate(n)} disabled={loading}
                  className="w-14 h-14 rounded-xl font-bold text-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: 'hsl(43,80%,40%)', color: 'hsl(35,25%,10%)', fontFamily: "'Cinzel',serif" }}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setMode(null)} className="w-full text-sm text-center opacity-50 hover:opacity-80" style={{ color: 'hsl(40,20%,60%)' }}>← Back</button>
          </div>
        )}

        {mode === 'join' && (
          <div>
            <input
              className="w-full px-4 py-3 rounded-xl text-center text-2xl font-black tracking-widest mb-4 uppercase"
              style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(43,50%,35%)', color: 'hsl(43,90%,65%)', fontFamily: "'Cinzel',serif", outline: 'none' }}
              placeholder="ENTER CODE"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            {error && <p className="text-xs text-center mb-3" style={{ color: 'hsl(0,65%,55%)' }}>{error}</p>}
            <button onClick={handleJoin} disabled={loading || joinCode.length < 6}
              className="w-full py-3 rounded-xl font-bold mb-3 hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: 'hsl(43,80%,40%)', color: 'hsl(35,25%,10%)', fontFamily: "'Cinzel',serif" }}>
              {loading ? 'Joining...' : '⚔️ Join Game'}
            </button>
            <button onClick={() => { setMode(null); setError(''); }} className="w-full text-sm text-center opacity-50 hover:opacity-80" style={{ color: 'hsl(40,20%,60%)' }}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}