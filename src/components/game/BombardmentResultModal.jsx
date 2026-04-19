import React, { useEffect, useState } from 'react';

export default function BombardmentResultModal({ result, targetHexId, onClose }) {
  const [phase, setPhase] = useState('roll'); // roll, show result
  
  useEffect(() => {
    const timer = setTimeout(() => setPhase('result'), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!result) return null;

  const reaperRoll = result.aRolls[0] || 0;
  const defenderRoll = result.dRolls[0] || 0;
  const reaperTotal = reaperRoll + result.aBonus;
  const defenderTotal = defenderRoll + result.dBonus;
  const reaperWins = reaperTotal > defenderTotal;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5000,
      pointerEvents: 'all',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1c22, #0d0f14)',
        border: '3px solid #d4a853',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
        maxWidth: 500,
        boxShadow: '0 0 40px rgba(212,168,83,0.3)',
      }}>
        <div style={{
          color: '#f0c040',
          fontFamily: "'Cinzel', serif",
          fontSize: 24,
          fontWeight: 900,
          marginBottom: 24,
          textTransform: 'uppercase',
          letterSpacing: 2,
        }}>
          🔥 Naval Bombardment
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
          {/* Reapership */}
          <div>
            <div style={{ color: '#4488ff', fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              ⛵ INFAMOUS REAPERSHIP
            </div>
            {phase === 'roll' ? (
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                color: '#4488ff',
                animation: 'diceRoll 0.6s ease-out',
                textShadow: '0 0 20px rgba(68,136,255,0.6)',
              }}>
                {reaperRoll}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 48, color: '#4488ff', fontWeight: 900, marginBottom: 8 }}>
                  {reaperRoll}
                </div>
                <div style={{ fontSize: 12, color: '#7a9a7a' }}>
                  +{result.aBonus} bonus = <span style={{ color: '#88aaff', fontWeight: 700 }}>{reaperTotal}</span>
                </div>
              </div>
            )}
          </div>

          {/* Defender */}
          <div>
            <div style={{ color: '#ff8844', fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              ⚔️ DEFENDING UNITS
            </div>
            {phase === 'roll' ? (
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                color: '#ff8844',
                animation: 'diceRoll 0.6s ease-out 0.2s both',
                textShadow: '0 0 20px rgba(255,136,68,0.6)',
              }}>
                {defenderRoll}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 48, color: '#ff8844', fontWeight: 900, marginBottom: 8 }}>
                  {defenderRoll}
                </div>
                <div style={{ fontSize: 12, color: '#7a9a7a' }}>
                  +{result.dBonus} bonus = <span style={{ color: '#ffaa66', fontWeight: 700 }}>{defenderTotal}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {phase === 'result' && (
          <div style={{
            padding: 16,
            borderRadius: 8,
            background: reaperWins ? 'rgba(68,136,255,0.15)' : 'rgba(255,136,68,0.15)',
            border: `2px solid ${reaperWins ? '#4488ff' : '#ff8844'}`,
            marginBottom: 20,
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: reaperWins ? '#88aaff' : '#ffaa66',
              marginBottom: 8,
            }}>
              {reaperWins ? '💥 HIT!' : '🛡️ DEFENDED!'}
            </div>
            <div style={{
              fontSize: 13,
              color: reaperWins ? '#7a9aaa' : '#aa8a6a',
            }}>
              {reaperWins
                ? `Reapership overcomes defense: ${reaperTotal} vs ${defenderTotal}`
                : `Defending units hold the line: ${defenderTotal} vs ${reaperTotal}`}
            </div>
            {result.defenderLosses > 0 && (
              <div style={{
                fontSize: 12,
                color: '#ff6666',
                marginTop: 8,
                fontWeight: 600,
              }}>
                Losses: {result.defenderLosses} unit{result.defenderLosses > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {phase === 'result' && (
          <button onClick={onClose} style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #1a4a3a, #0a2a1a)',
            border: '1px solid #5aaa5a',
            borderRadius: 4,
            color: '#9afa9a',
            fontFamily: "'Cinzel', serif",
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Continue
          </button>
        )}
      </div>

      <style>{`
        @keyframes diceRoll {
          0% { transform: scale(0.5) rotateZ(0deg); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1) rotateZ(360deg); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}