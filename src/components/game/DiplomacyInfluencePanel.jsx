import React, { useState } from 'react';
import {
  NATION_PERSONALITIES,
  getInfluenceActions,
  getEffectiveLikelihoods,
  getSentimentLabel,
} from './aiPersonalities';

function CostTag({ cost, player }) {
  const has = (k) => k === 'ip' ? (player.ip ?? 0) : k === 'sp' ? (player.sp ?? 0) : (player.resources?.[k] ?? 0);
  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
      {Object.entries(cost).map(([k, v]) => {
        const canAfford = has(k) >= v;
        return (
          <span key={k} style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 10,
            background: canAfford ? 'rgba(212,168,83,0.15)' : 'rgba(220,38,38,0.15)',
            border: `1px solid ${canAfford ? '#d4a853' : '#dc2626'}`,
            color: canAfford ? '#d4a853' : '#f87171',
            fontFamily: "'Cinzel',serif",
          }}>
            {v} {k.toUpperCase()}
          </span>
        );
      })}
    </span>
  );
}

function canAffordAction(action, player) {
  const cost = action.cost || {};
  for (const [k, v] of Object.entries(cost)) {
    const has = k === 'ip' ? (player.ip ?? 0) : k === 'sp' ? (player.sp ?? 0) : (player.resources?.[k] ?? 0);
    if (has < v) return false;
  }
  return true;
}

export default function DiplomacyInfluencePanel({ gameState, currentPlayer, onInfluenceAction }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedRival, setSelectedRival] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const aiPlayers = gameState?.players?.filter(p => p.isAI) || [];
  const otherHumans = gameState?.players?.filter(p => !p.isAI && p.id !== currentPlayer?.id) || [];
  const allOthers = [...aiPlayers, ...otherHumans].filter(p => p.id !== currentPlayer?.id);

  const targetPlayer = allOthers.find(p => p.id === selectedTarget);
  const personality = targetPlayer ? NATION_PERSONALITIES[targetPlayer.factionId] : null;
  const effectiveLikelihoods = targetPlayer
    ? getEffectiveLikelihoods(targetPlayer, currentPlayer?.id, gameState)
    : null;
  const sentiment = effectiveLikelihoods?.sentiment ?? null;
  const sentimentInfo = sentiment !== null ? getSentimentLabel(sentiment) : null;

  const rivalActions = ['spread_propaganda', 'sabotage_reputation'];
  const actions = targetPlayer ? getInfluenceActions(targetPlayer.factionId) : [];

  const handleAction = (action) => {
    if (!canAffordAction(action, currentPlayer)) return;
    const needsRival = rivalActions.includes(action.id);
    if (needsRival && !selectedRival) {
      setLastResult({ message: '⚠️ Select a rival target first before using this action.' });
      return;
    }
    const result = onInfluenceAction?.(action.id, selectedTarget, needsRival ? selectedRival : null);
    if (result) setLastResult(result);
  };

  const Likelihood = ({ label, value, icon }) => {
    const pct = Math.round(value * 100);
    const color = label === 'War' ? '#f87171' : label === 'Alliance' ? '#4ade80' : '#fbbf24';
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
          <span style={{ color: '#aaa' }}>{icon} {label}</span>
          <span style={{ color, fontWeight: 700, fontFamily: "'Cinzel',serif" }}>{pct}%</span>
        </div>
        <div style={{ height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Cormorant Garamond', serif", color: '#c8c0b0' }}>

      {/* Left: nation list */}
      <div style={{ width: 170, borderRight: '1px solid #2a2520', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '8px 10px', fontSize: 10, color: '#7a6a50', fontFamily: "'Cinzel',serif", letterSpacing: 1, borderBottom: '1px solid #2a2520' }}>
          SELECT NATION
        </div>
        {allOthers.map(p => {
          const pers = NATION_PERSONALITIES[p.factionId];
          const lh = getEffectiveLikelihoods(p, currentPlayer?.id, gameState);
          const si = getSentimentLabel(lh.sentiment);
          const isSelected = selectedTarget === p.id;
          return (
            <div key={p.id}
              onClick={() => { setSelectedTarget(p.id); setSelectedRival(null); setLastResult(null); }}
              style={{
                padding: '8px 10px', cursor: 'pointer',
                background: isSelected ? 'rgba(212,168,83,0.1)' : 'transparent',
                borderLeft: isSelected ? `3px solid ${p.color}` : '3px solid transparent',
                borderBottom: '1px solid #1a1810',
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, color: isSelected ? '#d4a853' : '#c8c0b0' }}>
                  {p.name}
                </span>
                {p.isAI && <span style={{ fontSize: 9, color: '#666' }}>AI</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                <span>{si.icon}</span>
                <span style={{ color: si.color }}>{si.label}</span>
              </div>
              {pers && (
                <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>
                  {pers.emoji} {pers.type}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: detail + actions */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {!targetPlayer ? (
          <div style={{ textAlign: 'center', color: '#444', marginTop: 50, fontStyle: 'italic' }}>
            Select a nation to view their diplomatic profile and influence options
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #2a2520' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: targetPlayer.color, border: '2px solid rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: '#d4a853' }}>
                  {personality?.emoji} {personality?.name || targetPlayer.name}
                </div>
                <div style={{ fontSize: 11, color: '#7a6a50', fontStyle: 'italic' }}>{personality?.type} · {targetPlayer.factionId}</div>
              </div>
            </div>

            {/* Flavor text */}
            {personality?.flavor && (
              <div style={{ fontSize: 11, color: '#8a7a60', fontStyle: 'italic', marginBottom: 12, padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderLeft: '2px solid #4a3a20', borderRadius: 2 }}>
                "{personality.flavor}"
              </div>
            )}

            {/* Sentiment meter */}
            {sentimentInfo && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#7a6a50', fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 4 }}>
                  THEIR SENTIMENT TOWARD YOU
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: '50%', width: 2, height: '100%', background: '#333', zIndex: 1,
                    }} />
                    {sentiment >= 0 ? (
                      <div style={{
                        position: 'absolute', left: '50%', width: `${sentiment / 2}%`,
                        height: '100%', background: sentimentInfo.color, borderRadius: '0 4px 4px 0',
                        transition: 'width 0.4s',
                      }} />
                    ) : (
                      <div style={{
                        position: 'absolute', right: `${50 + sentiment / 2}%`, width: `${-sentiment / 2}%`,
                        height: '100%', background: sentimentInfo.color, borderRadius: '4px 0 0 4px',
                        transition: 'all 0.4s',
                      }} />
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: sentimentInfo.color, fontWeight: 700, minWidth: 80, fontFamily: "'Cinzel',serif" }}>
                    {sentimentInfo.icon} {sentimentInfo.label}
                  </span>
                  <span style={{ fontSize: 11, color: '#555', minWidth: 32 }}>{sentiment > 0 ? '+' : ''}{sentiment}</span>
                </div>
              </div>
            )}

            {/* Likelihood bars */}
            {effectiveLikelihoods && (
              <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: 4, border: '1px solid #2a2520' }}>
                <div style={{ fontSize: 10, color: '#7a6a50', fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 8 }}>
                  BEHAVIORAL TENDENCIES (vs you)
                </div>
                <Likelihood label="War" value={effectiveLikelihoods.warLikelihood} icon="⚔️" />
                <Likelihood label="Alliance" value={effectiveLikelihoods.allianceLikelihood} icon="🤝" />
                <Likelihood label="Trade" value={effectiveLikelihoods.tradeLikelihood} icon="💰" />
              </div>
            )}

            {/* Rival picker for propaganda actions */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#7a6a50', fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 6 }}>
                RIVAL TARGET (for subversion actions)
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {gameState?.players?.filter(p => p.id !== currentPlayer?.id && p.id !== selectedTarget).map(p => (
                  <div key={p.id}
                    onClick={() => setSelectedRival(prev => prev === p.id ? null : p.id)}
                    style={{
                      padding: '3px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 10,
                      background: selectedRival === p.id ? `${p.color}33` : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${selectedRival === p.id ? p.color : '#3a3520'}`,
                      color: selectedRival === p.id ? p.color : '#7a6a50',
                      transition: 'all 0.15s',
                    }}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Last result message */}
            {lastResult?.message && (
              <div style={{
                marginBottom: 10, padding: '7px 10px', borderRadius: 4,
                background: lastResult.backfired ? 'rgba(220,38,38,0.12)' : 'rgba(74,222,128,0.1)',
                border: `1px solid ${lastResult.backfired ? '#dc2626' : '#4ade80'}`,
                fontSize: 11, color: lastResult.backfired ? '#f87171' : '#86efac',
              }}>
                {lastResult.message}
              </div>
            )}

            {/* Influence actions */}
            <div style={{ fontSize: 10, color: '#7a6a50', fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 8 }}>
              INFLUENCE ACTIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {actions.map(action => {
                const affordable = canAffordAction(action, currentPlayer);
                const needsRival = rivalActions.includes(action.id);
                const isHovered = hoveredAction === action.id;
                return (
                  <div key={action.id}
                    onMouseEnter={() => setHoveredAction(action.id)}
                    onMouseLeave={() => setHoveredAction(null)}
                    onClick={() => affordable && handleAction(action)}
                    style={{
                      padding: '9px 12px', borderRadius: 5, cursor: affordable ? 'pointer' : 'not-allowed',
                      background: isHovered && affordable ? 'rgba(212,168,83,0.1)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${affordable ? (isHovered ? '#d4a853' : '#3a3520') : '#2a2010'}`,
                      opacity: affordable ? 1 : 0.5,
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700, color: affordable ? '#d4a853' : '#6a5a40', marginBottom: 2 }}>
                          {action.label}
                          {needsRival && <span style={{ fontSize: 9, marginLeft: 6, color: '#8a7a50' }}>[requires rival]</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#8a7a60' }}>{action.description}</div>
                        <CostTag cost={action.cost} player={currentPlayer} />
                      </div>
                      {action.sentimentDelta > 0 && (
                        <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>
                          +{action.sentimentDelta} 💚
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}