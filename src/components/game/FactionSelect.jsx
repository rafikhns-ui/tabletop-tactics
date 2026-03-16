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
  const [step, setStep] = useState(1); // 1 = P1 pick, 2 = P2 pick (or AI), 3 = confirm

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
    } else {
      onConfirm({
        p1: { factionId: p1Faction, leaderIndex: p1Leader },
        p2: { factionId: isAI ? p2Faction : p2Faction, leaderIndex: p2Leader },
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
            {[1, 2].map(s => (
              <div key={s} className="w-2 h-2 rounded-full" style={{ background: step >= s ? 'hsl(43,80%,55%)' : 'hsl(35,20%,30%)' }} />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Faction grid */}
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

          {/* Leader selection */}
          {leaders && (
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
            <button onClick={step === 1 ? onBack : () => setStep(1)}
              className="px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-80"
              style={{ fontFamily: "'Cinzel',serif", background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,32%)', color: 'hsl(40,20%,65%)' }}>
              ← Back
            </button>
            <button onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
              style={{ fontFamily: "'Cinzel',serif", background: `linear-gradient(135deg, ${faction.color}cc, ${faction.color}88)`, border: `1px solid ${faction.color}`, color: 'hsl(40,30%,95%)' }}>
              {step === 1 ? (isAI ? `⚔️ Start vs AI` : `→ Player 2's Turn`) : `⚔️ Begin!`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}