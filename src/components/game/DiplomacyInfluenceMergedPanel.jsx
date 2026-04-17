import React, { useState } from 'react';

export default function DiplomacyInfluenceMergedPanel({ gameState, currentPlayer, onDiplomacyAction, onInfluenceAction, tradeOffers, onAcceptTrade, onDeclineTrade, onClose }) {
  const [activeTab, setActiveTab] = useState('diplomacy');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1c22, #14161c)',
        border: '1px solid #d4a853', borderRadius: 8,
        maxWidth: '90vw', maxHeight: '90vh', width: '900px',
        display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #2a2520',
          fontFamily: "'Cinzel', serif",
        }}>
          <h2 style={{ color: '#d4a853', fontSize: 18, fontWeight: 700, margin: 0 }}>
            🕊️ Diplomacy & Influence
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#d4a853', fontSize: 24,
            cursor: 'pointer',
          }}>×</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2520', background: '#0d0f14' }}>
          {[
            { id: 'diplomacy', icon: '🕊️', label: 'Diplomacy' },
            { id: 'influence', icon: '🎭', label: 'Influence' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: '12px', fontSize: 12, fontFamily: "'Cinzel', serif", fontWeight: 600,
                background: activeTab === t.id ? '#1e1a12' : 'transparent',
                color: activeTab === t.id ? '#d4a853' : '#666',
                border: 'none', borderBottom: activeTab === t.id ? '2px solid #d4a853' : '2px solid transparent',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
              {t.icon} {t.label}

            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'diplomacy' && (
            <DiplomacyContent
              gameState={gameState}
              currentPlayer={currentPlayer}
              onDiplomacyAction={onDiplomacyAction}
              tradeOffers={tradeOffers}
              onAcceptTrade={onAcceptTrade}
              onDeclineTrade={onDeclineTrade}
            />
          )}
          {activeTab === 'influence' && (
            <InfluenceContent
              gameState={gameState}
              currentPlayer={currentPlayer}
              onInfluenceAction={onInfluenceAction}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DiplomacyContent({ gameState, currentPlayer, onDiplomacyAction, tradeOffers, onAcceptTrade, onDeclineTrade }) {
  if (!gameState || !currentPlayer) return null;

  const otherPlayers = gameState.players.filter(p => p.id !== currentPlayer.id);
  const incomingOffers = tradeOffers.filter(o => o.toId === currentPlayer.id);
  const outgoingOffers = tradeOffers.filter(o => o.fromId === currentPlayer.id);

  return (
    <div style={{ color: '#c8c0b0', fontSize: 13 }}>
      {/* Incoming Trade Offers */}
      {incomingOffers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, marginBottom: 12 }}>
            📥 Incoming Trade Offers
          </h3>
          {incomingOffers.map(offer => {
            const fromPlayer = gameState.players.find(p => p.id === offer.fromId);
            return (
              <div key={offer.id} style={{
                background: 'rgba(212,168,83,0.05)', border: '1px solid #2a2520', borderRadius: 6,
                padding: 12, marginBottom: 8,
              }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>From: {fromPlayer?.name}</span>
                </div>
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  <div>📤 They offer: {Object.entries(offer.offer || {}).map(([k, v]) => `${v} ${k}`).join(', ')}</div>
                  <div>📥 They want: {Object.entries(offer.request || {}).map(([k, v]) => `${v} ${k}`).join(', ')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onAcceptTrade(offer)}
                    style={{
                      flex: 1, padding: '6px 12px', background: '#2a5a2a', border: '1px solid #5a9a5a',
                      color: '#9afa9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    }}>
                    ✓ Accept
                  </button>
                  <button onClick={() => onDeclineTrade(offer)}
                    style={{
                      flex: 1, padding: '6px 12px', background: '#5a2a2a', border: '1px solid #9a5a5a',
                      color: '#fa9a9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    }}>
                    ✗ Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outgoing Trade Offers */}
      {outgoingOffers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, marginBottom: 12 }}>
            📤 Sent Trade Offers
          </h3>
          {outgoingOffers.map(offer => {
            const toPlayer = gameState.players.find(p => p.id === offer.toId);
            return (
              <div key={offer.id} style={{
                background: 'rgba(212,168,83,0.05)', border: '1px solid #2a2520', borderRadius: 6,
                padding: 12, marginBottom: 8,
              }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>To: {toPlayer?.name}</span>
                </div>
                <div style={{ fontSize: 12 }}>
                  <div>📤 You offer: {Object.entries(offer.offer || {}).map(([k, v]) => `${v} ${k}`).join(', ')}</div>
                  <div>📥 You want: {Object.entries(offer.request || {}).map(([k, v]) => `${v} ${k}`).join(', ')}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diplomacy Actions */}
      <div>
        <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, marginBottom: 12 }}>
          ⚔️ Diplomatic Relations
        </h3>
        {otherPlayers.length === 0 ? (
          <div style={{ color: '#555', fontStyle: 'italic' }}>No players to interact with</div>
        ) : (
          otherPlayers.map(player => (
            <div key={player.id} style={{
              background: 'rgba(100,100,100,0.1)', border: '1px solid #2a2520', borderRadius: 6,
              padding: 12, marginBottom: 8,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                <span style={{ color: player.color }}>●</span> {player.name} {player.isAI && <span style={{ color: '#888', fontSize: 10 }}>(AI)</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => onDiplomacyAction({ type: 'alliance', fromId: currentPlayer.id, toId: player.id })}
                  style={{
                    padding: '6px 12px', background: '#2a5a2a', border: '1px solid #5a9a5a',
                    color: '#9afa9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  }}>
                  🕊️ Alliance
                </button>
                <button onClick={() => onDiplomacyAction({ type: 'neutral', fromId: currentPlayer.id, toId: player.id })}
                  style={{
                    padding: '6px 12px', background: '#5a5a2a', border: '1px solid #9a9a5a',
                    color: '#fafa9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  }}>
                  🤝 Neutral
                </button>
                <button onClick={() => onDiplomacyAction({ type: 'war', fromId: currentPlayer.id, toId: player.id })}
                  style={{
                    padding: '6px 12px', background: '#5a2a2a', border: '1px solid #9a5a5a',
                    color: '#fa9a9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  }}>
                  ⚔️ War
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InfluenceContent({ gameState, currentPlayer, onInfluenceAction }) {
  if (!gameState || !currentPlayer) return null;

  const aiPlayers = gameState.players.filter(p => p.id !== currentPlayer.id && p.isAI);
  const actions = [
    { id: 'gift_gold', label: '💰 Gift Gold', cost: 'gold: 5', cooldown: 1 },
    { id: 'cultural_exchange', label: '🎭 Cultural Exchange', cost: 'gold: 3', cooldown: 1 },
    { id: 'military_aid', label: '⚔️ Military Aid', cost: 'gold: 8', cooldown: 2 },
    { id: 'trade_embargo', label: '📉 Trade Embargo', cost: 'ip: 2', cooldown: 2 },
    { id: 'propaganda', label: '📣 Propaganda', cost: 'ip: 3', cooldown: 1 },
    { id: 'spy_network', label: '🕵️ Spy Network', cost: 'ip: 5', cooldown: 3 },
  ];

  return (
    <div style={{ color: '#c8c0b0', fontSize: 13 }}>
      <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, marginBottom: 12 }}>
        Your Influence Points: <span style={{ color: '#f0c040' }}>{currentPlayer.ip ?? 0}</span>
      </h3>

      {aiPlayers.length === 0 ? (
        <div style={{ color: '#555', fontStyle: 'italic' }}>No AI opponents to influence</div>
      ) : (
        aiPlayers.map(aiPlayer => {
          const aiLevel = aiPlayer.influenceLevel ?? 0;
          return (
          <div key={aiPlayer.id} style={{
            background: 'rgba(100,100,100,0.1)', border: '1px solid #2a2520', borderRadius: 6,
            padding: 12, marginBottom: 12,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><span style={{ color: aiPlayer.color }}>●</span> {aiPlayer.name}</span>
              <span style={{ fontSize: 12, color: '#d4a853', background: 'rgba(212,168,83,0.2)', padding: '4px 8px', borderRadius: 3 }}>
                Influence: {aiLevel}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              {actions.map(action => (
                <button key={action.id} onClick={() => onInfluenceAction(action.id, aiPlayer.id, null)}
                  style={{
                    padding: '8px 12px', background: 'rgba(212,168,83,0.15)', border: '1px solid #8a6a30',
                    color: '#d4a853', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                  <div>{action.label}</div>
                  <div style={{ fontSize: 10, color: '#7a6a50' }}>Cost: {action.cost}</div>
                </button>
              ))}
            </div>
          </div>
        );
        })
      )}
    </div>
  );
}