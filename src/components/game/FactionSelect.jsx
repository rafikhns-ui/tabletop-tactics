import React, { useState } from 'react';
import { FACTIONS, LEADERS, OBJECTIVES } from './ardoniaData';

const FACTION_REGIONS = {
  onishiman:  'West — Onishiman Empire, Kintei & Coast',
  sultanate:  'South-East — Nimrudan Empire & Moor Sultanate',
  republic:   'South — Hestia, Tlalocayotlan & Oakhaven',
  kadjimaran: 'North & Central — Gojeon, Inuvak, Ruskel & Kadjimaran',
};

// Faction objective constraints
// format: { mustInclude: ['category'], mustExclude: ['category'] }
const FACTION_OBJ_RULES = {
  onishiman:  { mustInclude: ['Military'], mustExclude: [] },
  sultanate:  { mustInclude: [], mustExclude: ['Military'] },
  kadjimaran: { mustInclude: ['Spiritual'], mustExclude: [] }, // Inuvak is part of kadjimaran
  republic:   { mustInclude: [], mustExclude: [] },
};

function drawFactionObjectives(factionId, count = 2) {
  const rules = FACTION_OBJ_RULES[factionId] || { mustInclude: [], mustExclude: [] };
  const eligible = OBJECTIVES.filter(o => !rules.mustExclude.includes(o.category));
  const required = eligible.filter(o => rules.mustInclude.includes(o.category));
  const optional = eligible.filter(o => !rules.mustInclude.includes(o.category));

  // Shuffle helpers
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  let drawn = [];
  // If we need at least 1 required category, pick 1 mandatory first
  if (required.length > 0 && count >= 1) {
    drawn.push(shuffle(required)[0]);
  }
  // Fill the rest from optional pool (excluding already drawn)
  const remaining = shuffle(optional.filter(o => !drawn.find(d => d.id === o.id)));
  drawn = [...drawn, ...remaining].slice(0, count);
  return shuffle(drawn);
}

// Steps: 1 = P1 faction, 2 = P2 faction, 3 = P1 objectives, 4 = P2 objectives, 5 = P1 leader, 6 = P2 leader
const STEP_COUNT = 6;

export default function FactionSelect({ mode, onConfirm, onBack }) {
  const factionList = Object.values(FACTIONS);
  const isAI = mode === 'ai';

  const [p1Faction, setP1Faction] = useState(factionList[0].id);
  const [p2Faction, setP2Faction] = useState(factionList[1].id);
  const [p1Leader, setP1Leader] = useState(0);
  const [p2Leader, setP2Leader] = useState(0);
  const [p1Objectives, setP1Objectives] = useState([]);
  const [p2Objectives, setP2Objectives] = useState([]);
  const [step, setStep] = useState(1);
  const [objRevealed, setObjRevealed] = useState(false);

  const isPickingP1Faction = step === 1;
  const isPickingP2Faction = step === 2;
  const isP1Objectives = step === 3;
  const isP2Objectives = step === 4;
  const isP1Leader = step === 5;
  const isP2Leader = step === 6;

  const activeFaction = (isPickingP1Faction || isP1Objectives || isP1Leader)
    ? p1Faction : p2Faction;
  const faction = FACTIONS[activeFaction];

  const playerLabel = (isPickingP1Faction || isP1Objectives || isP1Leader)
    ? 'Player 1'
    : (isAI ? 'Shadow Lord (AI)' : 'Player 2');

  const handleFactionPick = (factionId) => {
    if (isPickingP1Faction) { setP1Faction(factionId); setP1Leader(0); }
    else { setP2Faction(factionId); setP2Leader(0); }
  };

  const handleAdvance = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Draw P1 objectives then go to step 3
      setP1Objectives(drawFactionObjectives(p1Faction));
      setObjRevealed(false);
      setStep(3);
    } else if (step === 3) {
      // Draw P2 objectives then go to step 4
      if (isAI) {
        setP2Objectives(drawFactionObjectives(p2Faction));
        setObjRevealed(false);
        setStep(5); // skip P2 objective reveal for AI
      } else {
        setP2Objectives(drawFactionObjectives(p2Faction));
        setObjRevealed(false);
        setStep(4);
      }
    } else if (step === 4) {
      setObjRevealed(false);
      setStep(5);
    } else if (step === 5) {
      if (isAI) {
        // Finalize immediately
        onConfirm({
          p1: { factionId: p1Faction, leaderIndex: p1Leader, objectives: p1Objectives.map(o => o.id) },
          p2: { factionId: p2Faction, leaderIndex: p2Leader, objectives: p2Objectives.map(o => o.id) },
        });
      } else {
        setStep(6);
      }
    } else if (step === 6) {
      onConfirm({
        p1: { factionId: p1Faction, leaderIndex: p1Leader, objectives: p1Objectives.map(o => o.id) },
        p2: { factionId: p2Faction, leaderIndex: p2Leader, objectives: p2Objectives.map(o => o.id) },
      });
    }
  };

  const handleBack = () => {
    if (step === 1) onBack();
    else setStep(s => s - 1);
  };

  const stepTitle = () => {
    if (step === 1) return `Player 1: Choose Your Faction`;
    if (step === 2) return `${isAI ? 'Shadow Lord (AI)' : 'Player 2'}: Choose Your Faction`;
    if (step === 3) return `Player 1: Draw Secret Objectives`;
    if (step === 4) return `Player 2: Draw Secret Objectives`;
    if (step === 5) return `Player 1: Choose Your Leader`;
    if (step === 6) return `Player 2: Choose Your Leader`;
    return '';
  };

  const stepColor = [3, 4].includes(step) ? 'hsl(43,90%,65%)' : faction.color;

  const isFactionStep = step === 1 || step === 2;
  const isObjStep = step === 3 || step === 4;
  const isLeaderStep = step === 5 || step === 6;

  const currentObjectives = step === 3 ? p1Objectives : p2Objectives;
  const currentFactionForObj = step === 3 ? p1Faction : p2Faction;
  const rules = FACTION_OBJ_RULES[currentFactionForObj] || {};

  const advanceLabel = () => {
    if (step === 1) return isAI ? '→ Draw P1 Objectives' : "→ Player 2's Faction";
    if (step === 2) return '→ Draw Objectives';
    if (step === 3) return isAI ? '→ Choose Your Leader' : "→ Player 2's Objectives";
    if (step === 4) return '→ Choose Leaders';
    if (step === 5) return isAI ? '⚔️ Begin the Conquest!' : "→ Player 2's Leader";
    if (step === 6) return '⚔️ Begin the Conquest!';
    return '';
  };

  const canAdvanceObj = objRevealed;

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
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel',serif", color: stepColor }}>
            {stepTitle()}
          </h2>
          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {Array.from({ length: isAI ? 4 : STEP_COUNT }).map((_, i) => {
              const s = i + 1;
              return (
                <div key={s} className="w-2 h-2 rounded-full transition-all" style={{ background: step >= s ? 'hsl(43,80%,55%)' : 'hsl(35,20%,30%)' }} />
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* ── Faction Pick ── */}
          {isFactionStep && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {factionList.map(f => {
                  const isSelected = (step === 1 ? p1Faction : p2Faction) === f.id;
                  const takenByOther = step === 2 && p1Faction === f.id;
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
              {/* P1 summary on step 2 */}
              {step === 2 && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,30%)' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: FACTIONS[p1Faction].color }} />
                  <span className="text-xs" style={{ color: 'hsl(40,20%,65%)' }}>
                    Player 1 chose <span style={{ color: FACTIONS[p1Faction].color, fontWeight: 700 }}>{FACTIONS[p1Faction].name}</span>
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── Objectives ── */}
          {isObjStep && (
            <div className="space-y-3">
              {/* Faction rule note */}
              <div className="text-xs text-center px-3 py-2 rounded" style={{ background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)', color: 'hsl(40,20%,65%)' }}>
                {rules.mustExclude?.length > 0 && (
                  <span>⚠️ {FACTIONS[currentFactionForObj].name} <b>cannot</b> draw {rules.mustExclude.join(', ')} objectives. </span>
                )}
                {rules.mustInclude?.length > 0 && (
                  <span>✦ Must include at least one <b>{rules.mustInclude.join(' or ')}</b> objective.</span>
                )}
                {!rules.mustExclude?.length && !rules.mustInclude?.length && (
                  <span>No special constraints for this faction.</span>
                )}
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${FACTIONS[currentFactionForObj].color}66` }}>
                <div className="flex items-center justify-between px-4 py-2" style={{ background: `${FACTIONS[currentFactionForObj].color}22` }}>
                  <span className="text-sm font-bold" style={{ fontFamily: "'Cinzel',serif", color: FACTIONS[currentFactionForObj].color }}>
                    {FACTIONS[currentFactionForObj].emoji} {playerLabel} — {FACTIONS[currentFactionForObj].name}
                  </span>
                  {!objRevealed ? (
                    <button onClick={() => setObjRevealed(true)}
                      className="text-xs px-2 py-1 rounded font-bold"
                      style={{ background: FACTIONS[currentFactionForObj].color, color: '#000', fontFamily: "'Cinzel',serif" }}>
                      👁 Reveal
                    </button>
                  ) : (
                    <span className="text-xs opacity-50">👁 Revealed</span>
                  )}
                </div>

                {objRevealed ? (
                  <div className="px-4 py-3 space-y-2">
                    {currentObjectives.map(obj => (
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
                    🔒 Tap Reveal to view your objectives privately
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Leader Pick ── */}
          {isLeaderStep && (() => {
            const lFactionId = step === 5 ? p1Faction : p2Faction;
            const lFaction = FACTIONS[lFactionId];
            const leaders = LEADERS[lFactionId];
            const selectedLeader = step === 5 ? p1Leader : p2Leader;
            const setLeader = step === 5 ? setP1Leader : setP2Leader;
            return (
              <div className="space-y-3">
                {/* Faction reminder */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'hsl(35,20%,18%)', border: `1px solid ${lFaction.color}55` }}>
                  <span className="text-2xl">{lFaction.emoji}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: lFaction.color, fontFamily: "'Cinzel',serif" }}>{lFaction.name}</div>
                    <div className="text-xs opacity-60" style={{ color: 'hsl(40,20%,65%)' }}>{playerLabel}</div>
                  </div>
                </div>
                <div className="text-xs font-bold tracking-widest opacity-50" style={{ fontFamily: "'Cinzel',serif" }}>CHOOSE YOUR LEADER</div>
                <div className="grid grid-cols-1 gap-2">
                  {leaders.map((leader, idx) => {
                    const isChosen = selectedLeader === idx;
                    return (
                      <button key={leader.id}
                        onClick={() => setLeader(idx)}
                        className="rounded-lg p-3 text-left transition-all hover:scale-[1.01]"
                        style={{
                          background: isChosen ? `${lFaction.color}22` : 'hsl(35,20%,18%)',
                          border: `1px solid ${isChosen ? lFaction.color : 'hsl(35,20%,28%)'}`,
                        }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-bold" style={{ color: isChosen ? lFaction.color : 'hsl(40,25%,70%)', fontFamily: "'Cinzel',serif" }}>
                            👑 {leader.name}
                          </div>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'hsl(35,20%,22%)', color: 'hsl(40,20%,55%)' }}>{leader.type}</span>
                        </div>
                        <div className="text-xs" style={{ color: 'hsl(43,70%,55%)' }}>✦ {leader.passive}</div>
                        <div className="text-xs mt-0.5 opacity-60" style={{ color: 'hsl(0,50%,60%)' }}>✗ {leader.disadvantage}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Summary of other player's choice on step 6 */}
                {step === 6 && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,30%)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: FACTIONS[p1Faction].color }} />
                    <span className="text-xs" style={{ color: 'hsl(40,20%,65%)' }}>
                      Player 1: <span style={{ color: FACTIONS[p1Faction].color, fontWeight: 700 }}>{LEADERS[p1Faction][p1Leader].name}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

        </div>

        {/* Footer Buttons */}
        <div className="px-6 pb-6 pt-2 flex gap-3 border-t border-border">
          <button onClick={handleBack}
            className="px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-80"
            style={{ fontFamily: "'Cinzel',serif", background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,32%)', color: 'hsl(40,20%,65%)' }}>
            ← Back
          </button>
          <button onClick={handleAdvance}
            disabled={isObjStep && !canAdvanceObj}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Cinzel',serif",
              background: isLeaderStep && (step === 6 || isAI)
                ? 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))'
                : `linear-gradient(135deg, ${faction.color}cc, ${faction.color}88)`,
              border: `1px solid ${isLeaderStep && (step === 6 || isAI) ? 'hsl(38,80%,55%)' : faction.color}`,
              color: 'hsl(40,30%,95%)',
            }}>
            {advanceLabel()}
          </button>
        </div>
      </div>
    </div>
  );
}