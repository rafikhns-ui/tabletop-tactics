import React, { useState, useRef } from 'react';
import { FACTIONS } from './ardoniaData';

const RESOURCE_DEFS = [
  { id: 'gold',    label: 'Gold',    icon: '🪙', color: '#d4a853' },
  { id: 'wood',    label: 'Wood',    icon: '🪵', color: '#7a5a2a' },
  { id: 'wheat',   label: 'Wheat',   icon: '🌾', color: '#8a9a3a' },
  { id: 'sp',      label: 'Spirit',  icon: '✨', color: '#8e44ad' },
  { id: 'ip',      label: 'Influence',icon: '💬', color: '#2980b9' },
];

const TREATY_TYPES = [
  { id: 'trade',         label: 'Trade Agreement',    icon: '📜', desc: 'Exchange resources. Both players receive agreed amounts each turn for the duration.', duration: 3 },
  { id: 'alliance',      label: 'Military Alliance',   icon: '⚔️', desc: 'Cannot attack each other. Share vision. +1 bonus die when fighting a common enemy.', duration: 5 },
  { id: 'non_aggression',label: 'Non-Aggression Pact', icon: '🕊️', desc: 'Cannot declare war for the treaty duration. Breaking it costs 3 IP.', duration: 4 },
  { id: 'vassalage',     label: 'Vassalage',           icon: '👑', desc: 'Target pays 2 Gold/turn as tribute. They receive military protection in return.', duration: 6 },
];

function ResourcePicker({ resources, onAdd, label, color }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {RESOURCE_DEFS.map(r => {
        const available = resources?.[r.id] ?? 0;
        if (available <= 0) return null;
        return (
          <button
            key={r.id}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('offerResource', JSON.stringify({ id: r.id, icon: r.icon, label: r.label }));
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => onAdd({ id: r.id, icon: r.icon, label: r.label, amount: 1 })}
            title={`Add ${r.label} (you have ${available})`}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 6, cursor: 'grab',
              background: `${r.color}22`, border: `1px solid ${r.color}66`,
              color: r.color, fontSize: 12, fontFamily: "'Cinzel',serif",
              transition: 'all 0.15s',
            }}>
            {r.icon} {r.label} <span style={{ opacity: 0.6, fontSize: 10 }}>({available})</span>
          </button>
        );
      })}
    </div>
  );
}

function OfferSlot({ items, onDrop, onRemove, onAmountChange, side, accentColor }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        try {
          const data = JSON.parse(e.dataTransfer.getData('offerResource') || e.dataTransfer.getData('territory'));
          onDrop(data);
        } catch {}
      }}
      style={{
        minHeight: 90, borderRadius: 8, border: `2px dashed ${dragOver ? accentColor : '#3a3020'}`,
        background: dragOver ? `${accentColor}10` : 'rgba(0,0,0,0.2)',
        padding: 10, transition: 'all 0.15s',
        display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
      }}>
      {items.length === 0 && (
        <div style={{ color: '#555', fontStyle: 'italic', fontSize: 11, width: '100%', textAlign: 'center', paddingTop: 20 }}>
          Drag resources or territories here
        </div>
      )}
      {items.map((item, idx) => (
        <div key={idx} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(30,20,10,0.8)', border: `1px solid ${accentColor}55`,
          borderRadius: 6, padding: '4px 8px', fontSize: 12,
        }}>
          <span>{item.icon || '🏰'}</span>
          <span style={{ color: '#c8c0b0' }}>{item.label || item.name}</span>
          {item.isResource && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button onClick={() => onAmountChange(idx, -1)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>−</button>
              <span style={{ color: accentColor, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.amount}</span>
              <button onClick={() => onAmountChange(idx, 1)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>+</button>
            </div>
          )}
          <button onClick={() => onRemove(idx)}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 10, padding: '0 2px' }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function TerritoryPicker({ gameState, ownerId, onAdd }) {
  const ownedHexes = [];
  const seen = new Set();
  if (gameState?.hexes) {
    Object.entries(gameState.hexes).forEach(([hexId, hex]) => {
      if (hex.owner === ownerId && !seen.has(hexId)) {
        seen.add(hexId);
        ownedHexes.push({ hexId, label: hexId, owner: ownerId });
      }
    });
  }
  if (ownedHexes.length === 0) return <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>No territories to offer</div>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 80, overflowY: 'auto' }}>
      {ownedHexes.slice(0, 12).map(t => (
        <button
          key={t.hexId}
          draggable
          onDragStart={e => {
            e.dataTransfer.setData('territory', JSON.stringify({ ...t, isTerritory: true, icon: '🏰', name: `Hex ${t.hexId}` }));
            e.dataTransfer.effectAllowed = 'copy';
          }}
          onClick={() => onAdd({ ...t, isTerritory: true, icon: '🏰', label: `Hex ${t.hexId}`, name: `Hex ${t.hexId}` })}
          style={{
            padding: '3px 8px', borderRadius: 4, cursor: 'grab', fontSize: 10,
            background: 'rgba(212,168,83,0.1)', border: '1px solid #d4a85344',
            color: '#a08040', fontFamily: "'Cinzel',serif",
          }}>
          🏰 {t.hexId}
        </button>
      ))}
    </div>
  );
}

export default function TradeTreatyScreen({ gameState, currentPlayer, targetPlayer, onFinalize, onClose }) {
  const [treatyType, setTreatyType] = useState('trade');
  const [duration, setDuration] = useState(TREATY_TYPES[0].duration);
  const [myOffer, setMyOffer] = useState([]);
  const [theirAsk, setTheirAsk] = useState([]);
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const selectedTreaty = TREATY_TYPES.find(t => t.id === treatyType);

  const addToSlot = (setter, item) => {
    setter(prev => {
      // Merge resource amounts
      if (item.isResource || item.id) {
        const existing = prev.findIndex(i => i.id === item.id && i.isResource);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = { ...next[existing], amount: (next[existing].amount || 1) + (item.amount || 1) };
          return next;
        }
        return [...prev, { ...item, isResource: true, amount: item.amount || 1 }];
      }
      return [...prev, item];
    });
  };

  const removeFromSlot = (setter, idx) => setter(prev => prev.filter((_, i) => i !== idx));

  const changeAmount = (setter, idx, delta) => setter(prev => {
    const next = [...prev];
    const newAmt = Math.max(1, (next[idx].amount || 1) + delta);
    // Check against player resources
    const r = RESOURCE_DEFS.find(r => r.id === next[idx].id);
    if (r && setter === setMyOffer) {
      const avail = currentPlayer?.resources?.[next[idx].id] ?? 0;
      if (newAmt > avail) return prev;
    }
    next[idx] = { ...next[idx], amount: newAmt };
    return next;
  });

  const handleFinalize = () => {
    if (!currentPlayer || !targetPlayer) return;
    setConfirmed(true);
    onFinalize?.({
      treatyType,
      duration,
      myOffer,
      theirAsk,
      note,
      fromId: currentPlayer.id,
      toId: targetPlayer.id,
      fromName: currentPlayer.name,
      toName: targetPlayer.name,
    });
    setTimeout(onClose, 800);
  };

  const myColor = currentPlayer?.color || '#d4a853';
  const theirColor = targetPlayer?.color || '#5dade2';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860, maxHeight: '90vh',
          background: 'linear-gradient(160deg, #1a1c22, #100e0a)',
          border: '1px solid #3a3020',
          borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 60px rgba(212,168,83,0.18)',
        }}>

        {/* Header */}
        <div style={{
          padding: '14px 20px', background: 'linear-gradient(90deg,#1e1810,#14100a)',
          borderBottom: '1px solid #3a3020',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#d4a853', letterSpacing: 2, fontFamily: "'Cinzel',serif", opacity: 0.7 }}>TREATY NEGOTIATION CHAMBER</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#f0d080', fontFamily: "'Cinzel',serif", marginTop: 2 }}>
              <span style={{ color: myColor }}>{currentPlayer?.name}</span>
              <span style={{ color: '#555', margin: '0 10px' }}>⇄</span>
              <span style={{ color: theirColor }}>{targetPlayer?.name}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Treaty Type Selector */}
          <div>
            <div style={{ fontSize: 10, color: '#d4a853', letterSpacing: 2, fontFamily: "'Cinzel',serif", marginBottom: 8 }}>SELECT TREATY TYPE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {TREATY_TYPES.map(t => (
                <button key={t.id} onClick={() => { setTreatyType(t.id); setDuration(t.duration); }}
                  style={{
                    padding: '8px 6px', borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                    background: treatyType === t.id ? 'linear-gradient(135deg,#2a1e08,#1a1208)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${treatyType === t.id ? '#d4a853' : '#2a2520'}`,
                    color: treatyType === t.id ? '#f0d080' : '#666',
                    fontFamily: "'Cinzel',serif", transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{t.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{t.label}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(212,168,83,0.07)', border: '1px solid #3a3020', fontSize: 11, color: '#a08040', lineHeight: 1.5 }}>
              {selectedTreaty?.desc}
            </div>
          </div>

          {/* Duration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#888', fontFamily: "'Cinzel',serif" }}>DURATION:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5,6,8,10].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{
                    padding: '3px 9px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                    background: duration === d ? '#d4a853' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${duration === d ? '#d4a853' : '#2a2520'}`,
                    color: duration === d ? '#1a0a00' : '#666',
                    fontWeight: duration === d ? 700 : 400,
                    fontFamily: "'Cinzel',serif",
                  }}>{d}</button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: '#555' }}>turns</span>
          </div>

          {/* Negotiation Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 12, alignItems: 'start' }}>

            {/* My Offer */}
            <div style={{ border: `1px solid ${myColor}44`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', background: `${myColor}18`, borderBottom: `1px solid ${myColor}33` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: myColor, fontFamily: "'Cinzel',serif" }}>
                  {currentPlayer?.faction?.emoji} {currentPlayer?.name} OFFERS
                </div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>What you give / surrender</div>
              </div>
              <div style={{ padding: 10 }}>
                <OfferSlot
                  items={myOffer}
                  onDrop={item => addToSlot(setMyOffer, item)}
                  onRemove={idx => removeFromSlot(setMyOffer, idx)}
                  onAmountChange={(idx, delta) => changeAmount(setMyOffer, idx, delta)}
                  side="my"
                  accentColor={myColor}
                />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 4, letterSpacing: 1 }}>RESOURCES</div>
                  <ResourcePicker
                    resources={currentPlayer?.resources}
                    onAdd={item => addToSlot(setMyOffer, item)}
                    color={myColor}
                  />
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 4, marginTop: 8, letterSpacing: 1 }}>TERRITORIES</div>
                  <TerritoryPicker
                    gameState={gameState}
                    ownerId={currentPlayer?.id}
                    onAdd={item => addToSlot(setMyOffer, item)}
                  />
                </div>
              </div>
            </div>

            {/* Center Arrows */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, gap: 12 }}>
              <span style={{ fontSize: 22, color: '#d4a853', opacity: 0.6 }}>⇄</span>
              <div style={{ width: 1, flex: 1, background: '#2a2520' }} />
            </div>

            {/* Their Ask */}
            <div style={{ border: `1px solid ${theirColor}44`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', background: `${theirColor}18`, borderBottom: `1px solid ${theirColor}33` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: theirColor, fontFamily: "'Cinzel',serif" }}>
                  {targetPlayer?.faction?.emoji} {targetPlayer?.name} GIVES
                </div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>What you receive / demand</div>
              </div>
              <div style={{ padding: 10 }}>
                <OfferSlot
                  items={theirAsk}
                  onDrop={item => addToSlot(setTheirAsk, item)}
                  onRemove={idx => removeFromSlot(setTheirAsk, idx)}
                  onAmountChange={(idx, delta) => changeAmount(setTheirAsk, idx, delta)}
                  side="their"
                  accentColor={theirColor}
                />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 4, letterSpacing: 1 }}>RESOURCES</div>
                  <ResourcePicker
                    resources={targetPlayer?.resources}
                    onAdd={item => addToSlot(setTheirAsk, item)}
                    color={theirColor}
                  />
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 4, marginTop: 8, letterSpacing: 1 }}>TERRITORIES</div>
                  <TerritoryPicker
                    gameState={gameState}
                    ownerId={targetPlayer?.id}
                    onAdd={item => addToSlot(setTheirAsk, item)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional note */}
          <div>
            <div style={{ fontSize: 9, color: '#888', letterSpacing: 1, marginBottom: 4 }}>DIPLOMATIC NOTE (OPTIONAL)</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Write a message to accompany this proposal..."
              rows={2}
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2a2520',
                borderRadius: 6, padding: '8px 10px', color: '#c8c0b0', resize: 'none',
                fontFamily: "'Crimson Text',serif", fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Summary */}
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(212,168,83,0.06)', border: '1px solid #3a3020' }}>
            <div style={{ fontSize: 10, color: '#d4a853', letterSpacing: 1, fontFamily: "'Cinzel',serif", marginBottom: 6 }}>DEAL SUMMARY</div>
            <div style={{ fontSize: 12, color: '#a08040', lineHeight: 1.8 }}>
              <span style={{ color: myColor }}>{currentPlayer?.name}</span> proposes a{' '}
              <strong style={{ color: '#f0d080' }}>{selectedTreaty?.label}</strong> for{' '}
              <strong style={{ color: '#f0d080' }}>{duration} turns</strong> with{' '}
              <span style={{ color: theirColor }}>{targetPlayer?.name}</span>.
              {myOffer.length > 0 && <span> Offering: {myOffer.map(i => `${i.amount ? `${i.amount}× ` : ''}${i.label || i.name}`).join(', ')}.</span>}
              {theirAsk.length > 0 && <span> Requesting: {theirAsk.map(i => `${i.amount ? `${i.amount}× ` : ''}${i.label || i.name}`).join(', ')}.</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px', borderTop: '1px solid #2a2520',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          background: 'linear-gradient(90deg,#0e0c08,#14100a)',
        }}>
          <button onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', border: '1px solid #3a3020',
              color: '#666', fontFamily: "'Cinzel',serif", fontSize: 12,
            }}>
            Cancel
          </button>
          <button
            onClick={handleFinalize}
            disabled={confirmed}
            style={{
              padding: '9px 24px', borderRadius: 6, cursor: confirmed ? 'default' : 'pointer',
              background: confirmed ? '#2a6a2a' : 'linear-gradient(135deg,#8a6a10,#5a4008)',
              border: `1px solid ${confirmed ? '#4aaa4a' : '#d4a853'}`,
              color: confirmed ? '#9afa9a' : '#f0d080',
              fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700,
              letterSpacing: 0.5, transition: 'all 0.2s',
              boxShadow: confirmed ? 'none' : '0 0 16px rgba(212,168,83,0.25)',
            }}>
            {confirmed ? '✓ Proposal Sent' : `📜 Send ${selectedTreaty?.icon} Proposal`}
          </button>
        </div>
      </div>
    </div>
  );
}