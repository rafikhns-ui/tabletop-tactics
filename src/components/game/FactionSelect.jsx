import React, { useState } from 'react';
import { FACTIONS, LEADERS, OBJECTIVES } from './ardoniaData';

// Map image dimensions reference: 720 x 510
// Each faction's home region shown on the map
const FACTION_REGIONS = {
  onishiman:  'West — controls Onishiman Empire, Kintei & Coast',
  sultanate:  'South-East — controls Nimrudan Empire & Moor Sultanate',
  republic:   'South — controls Hestia, Tlalocayotlan & Oakhaven',
  kadjimaran: 'North & Central — controls Gojeon, Inuvak, Ruskel & Kadjimaran',
};

export default function FactionSelect({ mode, onConfirm, onBack }) {
  const factionList = Object.values(FACTIONS);
  const isAI = mode === 'ai';

  const [p1Faction, setP1Faction] = useState(factionList[0].id);
  const [p2Faction, setP2Faction] = useState(factionList[1].id);
  const [p1Leader, setP1Leader] = useState(0);
  const [p2Leader, setP2Leader] = useState(0);
  const [step, setStep] = useState(1); // 1 = P1 pick, 2 = P2 pick (or AI), 3 = objectives
  const [p1Objectives, setP1Objectives] = useState([]);
  const [p2Objectives, setP2Objectives] = useState([]);
  const [revealedFor, setRevealedFor] = useState(null); // null | 'p1' | 'p2' | 'done'

  const drawObjectives = () => {
    const shuffled = [...OBJECTIVES].sort(() => Math.random() - 0.5);
    setP1Objectives(shuffled.slice(0, 2));
    setP2Objectives(shuffled.slice(2, 4));
    setRevealedFor('p1');
  };

  const currentStep = step;
  const pickingP1 = currentStep === 1;

  const handleFactionPick = (factionId) => {
    if (pickingP1) {
      setP1Faction(factionId);
      setP1Leader(0);
    } else {
      setP2Faction(factionId);
      setP2Leader(0);
    }
  };

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      drawObjectives();
    } else {
      onConfirm({
        p1: { factionId: p1Faction, leaderIndex: p1Leader, objectives: p1Objectives.map(o => o.id) },
        p2: { factionId: p2Faction, leaderIndex: p2Leader, objectives: p2Objectives.map(o => o.id) },
      });
    }
  };

  const selectedFaction = pickingP1 ? p1Faction : p2Faction;
  const selectedLeader = pickingP1 ? p1Leader : p2Leader;
  const faction = FACTIONS[selectedFaction];
  const leaders = LEADERS[selectedFaction];

  const playerLabel = pickingP1 ? 'Player 1' : (isAI ? 'Shadow Lord (AI)' : 'Player 2');
  const playerColor = pickingP1 ? '#e8b84b' : '#6ab0e8';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, hsl(35,25%,15%) 0%, hsl(35,20%,7%) 100%)' }}>

      <div className="w-full max-w-2xl rounded-2xl overflow-hidden scroll-in"
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: '2px solid hsl(43,70%,45%)', boxShadow: '0 0 60px rgba(180,140,40,0.15)' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 text-center border-b border-border">
          <div className="text-xs tracking-widest opacity-50 mb-1" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>
            RULERS OF ARDONIA — SETUP
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Cinzel',serif", color: faction.color }}>
            {playerLabel}: Choose Your Faction
          </h2>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="w-2 h-2 rounded-full" style={{ background: step >= s ? 'hsl(43,80%,55%)' : 'hsl(35,20%,30%)' }} />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 3: Objectives draw */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-center opacity-60" style={{ color: 'hsl(40,20%,65%)' }}>
                Each player has drawn 2 secret objectives. Review them privately before the battle begins.
              </p>

              {/* P1 objectives */}
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${FACTIONS[p1Faction].color}66` }}>
                <div className="flex items-center justify-between px-4 py-2"
                  style={{ background: `${FACTIONS[p1Faction].color}22` }}>
                  <span className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: FACTIONS[p1Faction].color }}>
                    {FACTIONS[p1Faction].emoji} Player 1 — {FACTIONS[p1Faction].name}
                  </span>
                  {revealedFor !== 'p1' && revealedFor !== 'done' ? (
                    <button onClick={() => setRevealedFor('p1')}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: FACTIONS[p1Faction].color, color: '#000', fontFamily: "'Cinzel',serif" }}>
                      Reveal
                    </button>
                  ) : (
                    <span className="text-xs opacity-50">👁 Revealed</span>
                  )}
                </div>
                {(revealedFor === 'p1' || revealedFor === 'done') ? (
                  <div className="px-4 py-3 space-y-2">
                    {p1Objectives.map(obj => (
                      <div key={obj.id} className="flex items-start gap-2 text-xs">
                        <span className="mt-0.5 text-base">📜</span>
                        <div>
                          <div className="font-semibold" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>{obj.category}</div>
                          <div style={{ color: 'hsl(40,20%,72%)' }}>{obj.text}</div>
                        </div>
                      </div>
                    ))}
                    {revealedFor === 'p1' && !isAI && (
                      <button onClick={() => setRevealedFor('p2')}
                        className="w-full mt-2 py-1.5 rounded text-xs font-bold"
                        style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,32%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
                        ✓ Done — Pass to Player 2
                      </button>
                    )}
                    {revealedFor === 'p1' && isAI && (
                      <button onClick={() => setRevealedFor('done')}
                        className="w-full mt-2 py-1.5 rounded text-xs font-bold"
                        style={{ background: 'hsl(35,20%,22%)', border: '1px solid hsl(35,20%,32%)', color: 'hsl(40,20%,65%)', fontFamily: "'Cinzel',serif" }}>
                        ✓ Done
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center text-xs opacity-40 italic" style={{ color: 'hsl(40,20%,60%)' }}>
                    🔒 Hidden — tap Reveal to view
                  </div>
                )}
              </div>

              {/* P2 objectives (only show after P1 is done) */}
              {!isAI && (revealedFor === 'p2' || revealedFor === 'done') && (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${FACTIONS[p2Faction].color}66` }}>
                  <div className="flex items-center justify-between px-4 py-2"
                    style={{ background: `${FACTIONS[p2Faction].color}22` }}>
                    <span className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: FACTIONS[p2Faction].color }}>
                      {FACTIONS[p2Faction].emoji} Player 2 — {FACTIONS[p2Faction].name}
                    </span>
                    {revealedFor === 'p2' ? (
                      <button onClick={() => setRevealedFor('done')}
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: FACTIONS[p2Faction].color, color: '#000', fontFamily: "'Cinzel',serif" }}>
                        Reveal
                      </button>
                    ) : (
                      <span className="text-xs opacity-50">👁 Revealed</span>
                    )}
                  </div>
                  {revealedFor === 'done' ? (
                    <div className="px-4 py-3 space-y-2">
                      {p2Objectives.map(obj => (
                        <div key={obj.id} className="flex items-start gap-2 text-xs">
                          <span className="mt-0.5 text-base">📜</span>
                          <div>
                            <div className="font-semibold" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>{obj.category}</div>
                            <div style={{ color: 'hsl(40,20%,72%)' }}>{obj.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-center text-xs opacity-40 italic" style={{ color: 'hsl(40,20%,60%)' }}>
                      🔒 Hidden — tap Reveal to view
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Faction grid */}
          {step < 3 && (
            <div className="grid grid-cols-2 gap-3">
              {factionList.map(f => {
                const isSelected = selectedFaction === f.id;
                const takenByOther = !pickingP1 && p1Faction === f.id;
                return (
                  <button key={f.id}
                    onClick={() => !takenByOther && handleFactionPick(f.id)}
                    disabled={takenByOther}
                    className="text-left rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: isSelected ? `${f.color}22` : 'hsl(35,20%,18%)',
                      border: `2px solid ${isSelected ? f.color : 'hsl(35,20%,28%)'}`,
                      boxShadow: isSelected ? `0 0 20px ${f.color}44` : 'none',
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{f.emoji}</span>
                      <div>
                        <div className="font-bold text-sm" style={{ color: f.color, fontFamily: "'Cinzel',serif" }}>{f.name}</div>
                        <div className="text-xs" style={{ color: 'hsl(40,15%,55%)' }}>{FACTION_REGIONS[f.id]}</div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'hsl(40,20%,65%)' }}>{f.description}</p>
                    <div className="mt-2 text-xs px-2 py-1 rounded" style={{ background: 'hsl(35,20%,23%)', color: 'hsl(43,70%,55%)', fontStyle: 'italic' }}>
                      ✦ {f.specialRule}
                    </div>
                    {takenByOther && (
                      <div className="mt-1 text-xs text-center" style={{ color: 'hsl(0,50%,60%)' }}>Already chosen by P1</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Leader selection */}
          {step < 3 && leaders && (
            <div>
              <div className="text-xs font-bold tracking-widest mb-2 opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>
                CHOOSE YOUR LEADER
              </div>
              <div className="grid grid-cols-3 gap-2">
                {leaders.map((leader, idx) => {
                  const isChosen = selectedLeader === idx;
                  return (
                    <button key={leader.id}
                      onClick={() => pickingP1 ? setP1Leader(idx) : setP2Leader(idx)}
                      className="rounded-lg p-3 text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: isChosen ? `${faction.color}22` : 'hsl(35,20%,18%)',
                        border: `1px solid ${isChosen ? faction.color : 'hsl(35,20%,28%)'}`,
                      }}>
                      <div className="text-xs font-bold mb-1" style={{ color: isChosen ? faction.color : 'hsl(40,25%,70%)', fontFamily: "'Cinzel',serif" }}>
                        {leader.name}
                      </div>
                      <div className="text-xs" style={{ color: 'hsl(43,70%,55%)' }}>✦ {leader.passive}</div>
                      <div className="text-xs mt-1 opacity-60" style={{ color: 'hsl(0,50%,60%)' }}>✗ {leader.disadvantage}</div>
                      <div className="text-xs mt-1 px-1.5 py-0.5 rounded inline-block" style={{ background: 'hsl(35,20%,22%)', color: 'hsl(40,20%,55%)' }}>
                        {leader.type}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step summary */}
          {step === 2 && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,30%)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: FACTIONS[p1Faction].color }} />
              <span className="text-xs" style={{ color: 'hsl(40,20%,65%)' }}>
                Player 1 chose <span style={{ color: FACTIONS[p1Faction].color, fontWeight: 700 }}>{FACTIONS[p1Faction].name}</span> — {LEADERS[p1Faction][p1Leader].name}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {step < 3 && (
              <button onClick={step === 1 ? onBack : () => setStep(1)}
                className="px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-80"
                style={{ fontFamily: "'Cinzel',serif", background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,32%)', color: 'hsl(40,20%,65%)' }}>
                ← Back
              </button>
            )}
            {step < 3 && (
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                style={{ fontFamily: "'Cinzel',serif", background: `linear-gradient(135deg, ${faction.color}cc, ${faction.color}88)`, border: `1px solid ${faction.color}`, color: 'hsl(40,30%,95%)' }}>
                {step === 1 ? (isAI ? `→ Draw Objectives` : `→ Player 2's Turn`) : `→ Draw Objectives`}
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleConfirm}
                disabled={revealedFor !== 'done'}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,90%)' }}>
                ⚔️ Begin the Conquest!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}