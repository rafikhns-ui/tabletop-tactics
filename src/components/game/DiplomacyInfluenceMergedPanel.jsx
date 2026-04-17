import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function DiplomacyInfluenceMergedPanel({ gameState, currentPlayer, onDiplomacyAction, onInfluenceAction, tradeOffers, onAcceptTrade, onDeclineTrade, onClose }) {
  const [activeTab, setActiveTab] = useState('diplomacy');
  const [chatWithPlayer, setChatWithPlayer] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [aiResponding, setAiResponding] = useState(false);

  const handleSendMessage = async (message, selectedPlayer, convKey) => {
    setChatMessages(prev => ({
      ...prev,
      [convKey]: [...(prev[convKey] || []), { from: currentPlayer.id, text: message, isUser: true }]
    }));

    if (!selectedPlayer.isAI) return;

    setAiResponding(true);
    try {
      const sentiment = gameState.sentiment?.[currentPlayer.id]?.[selectedPlayer.id] ?? 50;
      const aiInfluence = selectedPlayer.influenceLevel ?? 0;

      const result = await base44.functions.invoke('generateDiplomacyResponse', {
        userMessage: message,
        aiName: selectedPlayer.name,
        aiPersonality: selectedPlayer.personality || {},
        sentiment: Math.round(sentiment),
        currentInfluence: aiInfluence,
        userFaction: currentPlayer.factionId,
        aiFaction: selectedPlayer.factionId,
      });

      const aiResponse = result.data?.response || `${selectedPlayer.name} nods thoughtfully...`;
      
      setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          [convKey]: [...(prev[convKey] || []), { from: selectedPlayer.id, text: aiResponse, isAI: true }]
        }));
        setAiResponding(false);
      }, 800);
    } catch (err) {
      setChatMessages(prev => ({
        ...prev,
        [convKey]: [...(prev[convKey] || []), { from: selectedPlayer.id, text: '...', isAI: true }]
      }));
      setAiResponding(false);
    }
  };

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
            { id: 'trade', icon: '💼', label: 'Trade' },
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
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatWithPlayer={chatWithPlayer}
              setChatWithPlayer={setChatWithPlayer}
              chatInput={chatInput}
              setChatInput={setChatInput}
              aiResponding={aiResponding}
              handleSendMessage={handleSendMessage}
            />
          )}
          {activeTab === 'trade' && (
            <TradeContent
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

function TradeContent({ gameState, currentPlayer, onDiplomacyAction, tradeOffers, onAcceptTrade, onDeclineTrade }) {
  const [tradeTarget, setTradeTarget] = React.useState(null);
  const [tradeOffer, setTradeOffer] = React.useState({});
  const [tradeRequest, setTradeRequest] = React.useState({});
  
  if (!gameState || !currentPlayer) return null;

  const humanPlayers = gameState.players.filter(p => p.id !== currentPlayer.id && !p.isAI);
  const incomingOffers = tradeOffers ? tradeOffers.filter(o => o.toId === currentPlayer.id) : [];
  const outgoingOffers = tradeOffers ? tradeOffers.filter(o => o.fromId === currentPlayer.id) : [];

  return (
    <div style={{ color: '#c8c0b0', fontSize: 13 }}>
      {/* Incoming Trade Offers */}
      {incomingOffers.length > 0 && (
        <div style={{ marginBottom: 16 }}>
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

      {/* Your Resources */}
      <div style={{ marginBottom: 24, padding: 12, background: 'rgba(212,168,83,0.08)', border: '1px solid #8a6a30', borderRadius: 6 }}>
        <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>YOUR RESOURCES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, fontSize: 12 }}>
          <div>💰 Gold: <span style={{ color: '#f0c040', fontWeight: 600 }}>{currentPlayer.resources?.gold ?? 0}</span></div>
          <div>🪵 Wood: <span style={{ color: '#c89050', fontWeight: 600 }}>{currentPlayer.resources?.wood ?? 0}</span></div>
          <div>🌾 Wheat: <span style={{ color: '#d4a050', fontWeight: 600 }}>{currentPlayer.resources?.wheat ?? 0}</span></div>
        </div>
      </div>

      {/* Create Trade Offer */}
      {humanPlayers.length > 0 && (
        <div style={{ marginBottom: 24, padding: 12, background: 'rgba(212,168,83,0.08)', border: '1px solid #2a2520', borderRadius: 6 }}>
          <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, marginBottom: 12 }}>
            💼 Create Trade Offer
          </h3>
          {!currentPlayer.buildings?.market ? (
            <div style={{ fontSize: 12, color: '#f0c040', padding: '12px', background: 'rgba(240,192,64,0.1)', border: '1px solid #d4a853', borderRadius: 4, marginBottom: 12 }}>
              🏪 You need to construct a Market to trade with other players.
            </div>
          ) : (
            <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Recipient:</label>
            <select value={tradeTarget || ''} onChange={(e) => setTradeTarget(e.target.value)}
              style={{
                width: '100%', padding: '8px', background: '#0d0f14', border: '1px solid #2a2520',
                color: '#c8c0b0', borderRadius: 4, fontSize: 12,
              }}>
              <option value="">Select player...</option>
              {humanPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>You Offer:</label>
              <input type="number" placeholder="Gold" value={tradeOffer.gold || 0}
                onChange={(e) => setTradeOffer({...tradeOffer, gold: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11, marginBottom: 6 }} />
              <input type="number" placeholder="Wood" value={tradeOffer.wood || 0}
                onChange={(e) => setTradeOffer({...tradeOffer, wood: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11, marginBottom: 6 }} />
              <input type="number" placeholder="Wheat" value={tradeOffer.wheat || 0}
                onChange={(e) => setTradeOffer({...tradeOffer, wheat: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11, marginBottom: 6 }} />
              <input type="number" placeholder="Stone" value={tradeOffer.stone || 0}
                onChange={(e) => setTradeOffer({...tradeOffer, stone: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>You Want:</label>
              <input type="number" placeholder="Gold" value={tradeRequest.gold || 0}
                onChange={(e) => setTradeRequest({...tradeRequest, gold: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11, marginBottom: 6 }} />
              <input type="number" placeholder="Wood" value={tradeRequest.wood || 0}
                onChange={(e) => setTradeRequest({...tradeRequest, wood: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11, marginBottom: 6 }} />
              <input type="number" placeholder="Wheat" value={tradeRequest.wheat || 0}
                onChange={(e) => setTradeRequest({...tradeRequest, wheat: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11, marginBottom: 6 }} />
              <input type="number" placeholder="Stone" value={tradeRequest.stone || 0}
                onChange={(e) => setTradeRequest({...tradeRequest, stone: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: '6px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, fontSize: 11 }} />
            </div>
          </div>
          {(() => {
            const hasEnoughResources = Object.entries(tradeOffer).every(([k, v]) => (currentPlayer.resources?.[k] ?? 0) >= v);
            const hasOffer = Object.values(tradeOffer).some(v => v > 0);
            const hasRequest = Object.values(tradeRequest).some(v => v > 0);
            const isValid = tradeTarget && (hasOffer || hasRequest) && hasEnoughResources;
            return (
              <button onClick={() => {
                if (!isValid) return;
                onDiplomacyAction({ type: 'trade_offer', fromId: currentPlayer.id, toId: tradeTarget, offer: tradeOffer, request: tradeRequest });
                setTradeTarget(null);
                setTradeOffer({});
                setTradeRequest({});
              }}
                style={{
                  width: '100%', padding: '8px', background: isValid ? '#2a5a2a' : '#3a3a3a', border: `1px solid ${isValid ? '#5a9a5a' : '#555'}`,
                  color: isValid ? '#9afa9a' : '#666', borderRadius: 4, cursor: isValid ? 'pointer' : 'not-allowed', fontSize: 11, fontWeight: 600,
                  opacity: isValid ? 1 : 0.6,
                }}>
                {!hasEnoughResources && hasOffer ? '⚠️ Insufficient Resources' : !hasOffer && !hasRequest ? '⚠️ Add items to trade' : '📤 Send Trade Offer'}
              </button>
            );
          })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DiplomacyContent({ gameState, currentPlayer, onDiplomacyAction, chatMessages, setChatMessages, chatWithPlayer, setChatWithPlayer, chatInput, setChatInput, aiResponding, handleSendMessage }) {

  if (!gameState || !currentPlayer) return null;

  const otherPlayers = gameState.players.filter(p => p.id !== currentPlayer.id);

  return (
    <div style={{ color: '#c8c0b0', fontSize: 13 }}>
      {/* Your Resources */}
      <div style={{ marginBottom: 24, padding: 12, background: 'rgba(212,168,83,0.08)', border: '1px solid #8a6a30', borderRadius: 6 }}>
        <div style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>YOUR RESOURCES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, fontSize: 12 }}>
          <div>💰 Gold: <span style={{ color: '#f0c040', fontWeight: 600 }}>{currentPlayer.resources?.gold ?? 0}</span></div>
          <div>🪵 Wood: <span style={{ color: '#c89050', fontWeight: 600 }}>{currentPlayer.resources?.wood ?? 0}</span></div>
          <div>🌾 Wheat: <span style={{ color: '#d4a050', fontWeight: 600 }}>{currentPlayer.resources?.wheat ?? 0}</span></div>
        </div>
      </div>

      {/* Diplomacy Actions */}
      <div style={{ marginBottom: 24 }}>
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

      {/* Chat with Players (including AI) */}
      {otherPlayers.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #2a2520' }}>
          <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, marginBottom: 12 }}>
            💬 Diplomacy Chat
          </h3>
          {!chatWithPlayer ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
              {otherPlayers.map(player => (
                <button key={player.id} onClick={() => setChatWithPlayer(player.id)}
                  style={{
                    padding: '12px', background: 'rgba(100,100,100,0.1)', border: '1px solid #2a2520',
                    color: '#c8c0b0', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                  <span><span style={{ color: player.color }}>●</span> {player.name}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>{player.isAI ? '🤖 AI Opponent' : '👤 Human Player'}</span>
                </button>
              ))}
            </div>
          ) : (() => {
            const selectedPlayer = gameState.players.find(p => p.id === chatWithPlayer);
            const convKey = [currentPlayer.id, chatWithPlayer].sort().join('-');
            const messages = chatMessages[convKey] || [];
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#d4a853', marginBottom: 8 }}>
                  <span style={{ color: selectedPlayer.color }}>●</span> Chat with {selectedPlayer.name}
                </div>
                <div style={{
                  background: '#0d0f14', border: '1px solid #2a2520', borderRadius: 4,
                  height: 200, overflowY: 'auto', padding: 8, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {messages.length === 0 ? (
                    <div style={{ color: '#555', fontStyle: 'italic', fontSize: 11, textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} style={{
                        padding: '6px 8px', background: msg.from === currentPlayer.id ? 'rgba(42,90,42,0.2)' : 'rgba(100,100,100,0.1)',
                        borderRadius: 4, fontSize: 11, color: '#c8c0b0',
                      }}>
                        <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>
                          {msg.from === currentPlayer.id ? 'You' : selectedPlayer.name}
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && chatInput.trim() && !aiResponding) {
                        handleSendMessage(chatInput, selectedPlayer, convKey);
                        setChatInput('');
                      }
                    }}
                    placeholder="Type message..." style={{
                      flex: 1, padding: '6px 8px', background: '#0d0f14', border: '1px solid #2a2520',
                      color: '#c8c0b0', borderRadius: 4, fontSize: 11,
                    }} />
                  <button onClick={() => {
                    if (chatInput.trim() && !aiResponding) {
                      handleSendMessage(chatInput, selectedPlayer, convKey);
                      setChatInput('');
                    }
                  }}
                    style={{
                       padding: '6px 12px', background: aiResponding ? '#3a3a3a' : '#2a5a2a', border: `1px solid ${aiResponding ? '#555' : '#5a9a5a'}`,
                       color: aiResponding ? '#666' : '#9afa9a', borderRadius: 4, cursor: aiResponding ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600,
                       opacity: aiResponding ? 0.6 : 1,
                     }}>
                     {aiResponding ? '⏳' : '✓'} Send
                  </button>
                  <button onClick={() => setChatWithPlayer(null)}
                    style={{
                      padding: '6px 12px', background: '#3a3a3a', border: '1px solid #555',
                      color: '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    }}>
                    Back
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function InfluenceContent({ gameState, currentPlayer, onInfluenceAction }) {
  const [actionCooldowns, setActionCooldowns] = React.useState({});
  
  if (!gameState || !currentPlayer) return null;

  const aiPlayers = gameState.players.filter(p => p.id !== currentPlayer.id && p.isAI);
  const actions = [
    { id: 'gift_gold', label: '💰 Gift Gold', cost: 'gold: 5', cooldown: 1, impact: '+20% sentiment' },
    { id: 'cultural_exchange', label: '🎭 Cultural Exchange', cost: 'gold: 3', cooldown: 1, impact: '+10% sentiment' },
    { id: 'military_aid', label: '⚔️ Military Aid', cost: 'gold: 8', cooldown: 2, impact: '+30% sentiment · boost army' },
    { id: 'trade_embargo', label: '📉 Trade Embargo', cost: 'ip: 2', cooldown: 2, impact: '-25% sentiment' },
    { id: 'propaganda', label: '📣 Propaganda', cost: 'ip: 3', cooldown: 1, impact: '-15% vs rival' },
    { id: 'spy_network', label: '🕵️ Spy Network', cost: 'ip: 5', cooldown: 3, impact: 'reveal secrets · intel +5' },
    { id: 'royal_marriage', label: '💍 Royal Marriage', cost: 'ip: 4, gold: 10', cooldown: 4, impact: '+40% sentiment · alliance boost' },
    { id: 'science_grant', label: '🔬 Science Grant', cost: 'gold: 6', cooldown: 2, impact: '+15% sentiment · tech boost' },
    { id: 'religious_influence', label: '⛪ Religious Influence', cost: 'ip: 3, gold: 4', cooldown: 2, impact: '+25% sentiment · zealotry +1' },
    { id: 'blackmail', label: '🔐 Blackmail', cost: 'ip: 4', cooldown: 3, impact: '-35% sentiment · forced deal' },
  ];

  return (
    <div style={{ color: '#c8c0b0', fontSize: 13 }}>
      <div style={{ marginBottom: 16, padding: '12px', background: 'rgba(212,168,83,0.1)', borderRadius: 6, border: '1px solid #8a6a30' }}>
        <h3 style={{ color: '#d4a853', fontFamily: "'Cinzel', serif", fontSize: 14, margin: 0 }}>
          💫 Your Influence Points: <span style={{ color: '#f0c040', fontSize: 18 }}>{currentPlayer.ip ?? 0}</span>
        </h3>
      </div>

      {aiPlayers.length === 0 ? (
        <div style={{ color: '#555', fontStyle: 'italic' }}>No AI opponents to influence</div>
      ) : (
        aiPlayers.map(aiPlayer => {
          const sentiment = gameState.sentiment?.[currentPlayer.id]?.[aiPlayer.id] ?? 50;
          const sentimentLabel = sentiment > 70 ? 'Friendly 😊' : sentiment > 40 ? 'Neutral 😐' : 'Hostile 😠';
          const sentimentColor = sentiment > 70 ? '#5a9a5a' : sentiment > 40 ? '#9a9a5a' : '#9a5a5a';
          const aiLevel = aiPlayer.influenceLevel ?? 0;
          
          return (
            <div key={aiPlayer.id} style={{
              background: 'rgba(100,100,100,0.1)', border: '1px solid #2a2520', borderRadius: 6,
              padding: 12, marginBottom: 12,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><span style={{ color: aiPlayer.color }}>●</span> {aiPlayer.name}</span>
                <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                  <span style={{ color: '#d4a853', background: 'rgba(212,168,83,0.2)', padding: '4px 8px', borderRadius: 3 }}>
                    Influence: {aiLevel}
                  </span>
                  <span style={{ color: sentimentColor, background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 3 }}>
                    {sentimentLabel}
                  </span>
                </div>
              </div>
              
              {/* Sentiment bar */}
              <div style={{ marginBottom: 12, background: '#0d0f14', borderRadius: 4, padding: 8 }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>Relationship: {Math.round(sentiment)}%</div>
                <div style={{ background: '#1a1a2a', borderRadius: 2, height: 12, overflow: 'hidden', border: '1px solid #2a2520' }}>
                  <div style={{
                    width: `${sentiment}%`, height: '100%', background: `linear-gradient(90deg, #9a5a5a, #9a9a5a, #5a9a5a)`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                {actions.map(action => {
                  const cooldownKey = `${aiPlayer.id}-${action.id}`;
                  const cooldownRemaining = actionCooldowns[cooldownKey] ?? 0;
                  const costParts = action.cost.split(',').map(s => s.trim());
                  let canAfford = true;
                  
                  costParts.forEach(costPart => {
                    const parts = costPart.split(':');
                    const costType = parts[0].trim();
                    const costAmount = parseInt(parts[1]) || 0;
                    const playerCost = currentPlayer[costType] ?? currentPlayer.resources?.[costType] ?? 0;
                    if (playerCost < costAmount) canAfford = false;
                  });
                  
                  const onCooldown = cooldownRemaining > 0;
                  
                  return (
                    <button key={action.id} onClick={() => {
                      if (canAfford && !onCooldown) {
                        onInfluenceAction(action.id, aiPlayer.id, null);
                        setActionCooldowns(prev => ({ ...prev, [cooldownKey]: action.cooldown }));
                        const interval = setInterval(() => {
                          setActionCooldowns(prev => {
                            const remaining = prev[cooldownKey] - 1;
                            if (remaining <= 0) {
                              clearInterval(interval);
                              const newState = { ...prev };
                              delete newState[cooldownKey];
                              return newState;
                            }
                            return { ...prev, [cooldownKey]: remaining };
                          });
                        }, 1000);
                      }
                    }}
                      style={{
                        padding: '10px 12px', background: onCooldown ? 'rgba(100,100,100,0.1)' : canAfford ? 'rgba(212,168,83,0.15)' : 'rgba(100,100,100,0.1)',
                        border: `1px solid ${onCooldown ? '#555' : canAfford ? '#8a6a30' : '#555'}`,
                        color: onCooldown ? '#666' : canAfford ? '#d4a853' : '#666', borderRadius: 4, cursor: onCooldown || !canAfford ? 'not-allowed' : 'pointer',
                        fontSize: 11, fontWeight: 600, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4,
                        opacity: onCooldown ? 0.5 : canAfford ? 1 : 0.5, position: 'relative',
                      }}>
                      <div>{action.label}</div>
                      <div style={{ fontSize: 10, color: onCooldown ? '#666' : canAfford ? '#7a6a50' : '#555' }}>
                        Cost: {action.cost}
                      </div>
                      <div style={{ fontSize: 9, color: onCooldown ? '#666' : canAfford ? '#a89a70' : '#555', fontStyle: 'italic' }}>
                        {action.impact}
                      </div>
                      {onCooldown && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0c040', fontWeight: 700, fontSize: 16,
                        }}>
                          {cooldownRemaining}s
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}