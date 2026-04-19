import React, { useState } from 'react';
import DiplomacyDiscussion from './DiplomacyDiscussion';
import { NATION_EMBLEMS } from '../../lib/nationEmblems';

const RELATION_STYLES = {
  neutral:  { label: 'Neutral',  icon: '🤝', bg: 'hsl(35,20%,20%)',  border: 'hsl(35,20%,32%)',  text: 'hsl(40,20%,65%)' },
  alliance: { label: 'Alliance', icon: '🕊️', bg: 'hsl(120,25%,16%)', border: 'hsl(120,40%,30%)', text: 'hsl(120,50%,65%)' },
  war:      { label: 'At War',   icon: '⚔️', bg: 'hsl(0,30%,16%)',   border: 'hsl(0,55%,35%)',   text: 'hsl(0,60%,65%)' },
  trade:    { label: 'Trade',    icon: '📜', bg: 'hsl(43,30%,16%)',  border: 'hsl(43,60%,35%)',  text: 'hsl(43,80%,65%)' },
};

function getRelation(diplomacy, aId, bId) {
  const key = [aId, bId].sort().join('|');
  return diplomacy?.[key] || 'neutral';
}

function setRelation(diplomacy, aId, bId, rel) {
  const key = [aId, bId].sort().join('|');
  return { ...diplomacy, [key]: rel };
}

// Trade offer state is keyed: `${fromId}→${toId}`
function TradeOffer({ offer, currentPlayer, players, onAccept, onDecline }) {
  const from = players.find(p => p.id === offer.fromId);
  const to = players.find(p => p.id === offer.toId);
  const isRecipient = offer.toId === currentPlayer.id;
  const isSender = offer.fromId === currentPlayer.id;

  return (
    <div className="rounded-lg p-3 text-xs"
      style={{ background: 'hsl(43,30%,14%)', border: '1px solid hsl(43,50%,30%)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: from?.color }}>📦 {from?.name}</span>
        <span className="opacity-40">→</span>
        <span style={{ color: to?.color }}>{to?.name}</span>
      </div>
      <div className="flex gap-3 mb-2">
        <div>
          <div className="opacity-50 mb-1">Offering</div>
          <ResourceList resources={offer.offer} />
        </div>
        <div className="text-lg opacity-30 self-center">⇌</div>
        <div>
          <div className="opacity-50 mb-1">Requesting</div>
          <ResourceList resources={offer.request} />
        </div>
      </div>
      {isRecipient && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => onAccept(offer)}
            className="flex-1 py-1 rounded font-bold hover:opacity-90"
            style={{ background: 'hsl(120,40%,20%)', border: '1px solid hsl(120,50%,35%)', color: 'hsl(120,50%,65%)' }}>
            ✓ Accept
          </button>
          <button onClick={() => onDecline(offer)}
            className="flex-1 py-1 rounded hover:opacity-90"
            style={{ background: 'hsl(0,30%,20%)', border: '1px solid hsl(0,50%,35%)', color: 'hsl(0,60%,65%)' }}>
            ✗ Decline
          </button>
        </div>
      )}
      {isSender && (
        <div className="text-center opacity-50 mt-1">Awaiting response…</div>
      )}
    </div>
  );
}

function ResourceList({ resources }) {
  const entries = Object.entries(resources || {}).filter(([, v]) => v > 0);
  if (entries.length === 0) return <span className="opacity-40">Nothing</span>;
  const icons = { gold: '🪙', wood: '🪵', wheat: '🌾' };
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <span key={k} className="px-1.5 py-0.5 rounded text-xs"
          style={{ background: 'hsl(35,20%,24%)', border: '1px solid hsl(35,20%,35%)' }}>
          {icons[k] || k} {v}
        </span>
      ))}
    </div>
  );
}

export default function DiplomacyPanel({
  gameState, currentPlayer, onDiplomacyAction, tradeOffers, onAcceptTrade, onDeclineTrade
}) {
  const [tab, setTab] = useState('relations'); // 'relations' | 'propose' | 'trade'
  const [discussionTarget, setDiscussionTarget] = useState(null);
  const [proposeTo, setProposeTo] = useState(null);
  const [tradeTarget, setTradeTarget] = useState(null);
  const [offerRes, setOfferRes] = useState({ gold: 0, wood: 0, wheat: 0 });
  const [requestRes, setRequestRes] = useState({ gold: 0, wood: 0, wheat: 0 });

  const otherPlayers = gameState.players.filter(p => p.id !== currentPlayer.id);
  const diplomacy = gameState.diplomacy || {};

  const incomingOffers = (tradeOffers || []).filter(o => o.toId === currentPlayer.id);
  const outgoingOffers = (tradeOffers || []).filter(o => o.fromId === currentPlayer.id);

  const handlePropose = (type) => {
    if (!proposeTo) return;
    onDiplomacyAction({ type, fromId: currentPlayer.id, toId: proposeTo });
    setProposeTo(null);
  };

  const handleSendTrade = () => {
    if (!tradeTarget) return;
    const hasOffer = Object.values(offerRes).some(v => v > 0);
    const hasRequest = Object.values(requestRes).some(v => v > 0);
    if (!hasOffer && !hasRequest) return;
    onDiplomacyAction({ type: 'trade_offer', fromId: currentPlayer.id, toId: tradeTarget, offer: offerRes, request: requestRes });
    setOfferRes({ gold: 0, wood: 0, wheat: 0 });
    setRequestRes({ gold: 0, wood: 0, wheat: 0 });
    setTradeTarget(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        {[['relations', '🌍'], ['propose', '📋'], ['trade', '📦']].map(([t, icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1.5 text-xs font-bold capitalize transition-all"
            style={{
              fontFamily: "'Cinzel',serif",
              background: tab === t ? 'hsl(38,60%,22%)' : 'transparent',
              color: tab === t ? 'hsl(43,90%,65%)' : 'hsl(40,20%,50%)',
              borderBottom: tab === t ? '2px solid hsl(43,80%,55%)' : '2px solid transparent',
            }}>
            {icon} {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* RELATIONS TAB */}
        {tab === 'relations' && (
          <>
            {otherPlayers.length === 0 && (
              <div className="text-xs text-center opacity-30 mt-4" style={{ color: 'hsl(40,20%,60%)' }}>No other players</div>
            )}
            {otherPlayers.map(p => {
              const rel = getRelation(diplomacy, currentPlayer.id, p.id);
              const style = RELATION_STYLES[rel] || RELATION_STYLES.neutral;
              return (
                <div key={p.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  {NATION_EMBLEMS[p.factionId] && (
                    <img src={NATION_EMBLEMS[p.factionId]} alt="" style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0 }} />
                  )}
                  <span className="flex-1 font-semibold truncate" style={{ color: 'hsl(40,25%,80%)' }}>
                    {p.name} {p.isAI && <span className="opacity-40">🤖</span>}
                  </span>
                  <button onClick={() => setDiscussionTarget(p)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'hsl(200,40%,30%)', border: '1px solid hsl(200,50%,45%)', color: 'hsl(200,70%,75%)' }}>
                    💬
                  </button>
                  <span style={{ color: style.text }}>{style.icon} {style.label}</span>
                </div>
              );
            })}
          </>
        )}

        {/* PROPOSE TAB */}
        {tab === 'propose' && (
          <>
            <div className="text-xs opacity-50 mb-1" style={{ fontFamily: "'Cinzel',serif" }}>SELECT PLAYER</div>
            <div className="space-y-1 mb-3">
              {otherPlayers.map(p => {
                const rel = getRelation(diplomacy, currentPlayer.id, p.id);
                const style = RELATION_STYLES[rel] || RELATION_STYLES.neutral;
                return (
                  <button key={p.id} onClick={() => setProposeTo(p.id === proposeTo ? null : p.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:opacity-90 transition-all"
                    style={{
                      background: proposeTo === p.id ? 'hsl(38,50%,22%)' : style.bg,
                      border: `1px solid ${proposeTo === p.id ? 'hsl(43,80%,50%)' : style.border}`,
                    }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    {NATION_EMBLEMS[p.factionId] && (
                      <img src={NATION_EMBLEMS[p.factionId]} alt="" style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0 }} />
                    )}
                    <span className="flex-1 text-left" style={{ color: 'hsl(40,25%,78%)' }}>{p.name}</span>
                    <span className="opacity-50" style={{ color: style.text }}>{style.icon} {style.label}</span>
                  </button>
                );
              })}
            </div>

            {proposeTo && (
              <>
                <div className="text-xs opacity-50 mb-1" style={{ fontFamily: "'Cinzel',serif" }}>PROPOSE ACTION</div>
                <div className="space-y-1.5">
                  {[
                    { type: 'alliance', icon: '🕊️', label: 'Form Alliance', desc: 'Mutual non-aggression pact', color: 'hsl(120,40%,22%)', bcolor: 'hsl(120,50%,35%)' },
                    { type: 'war', icon: '⚔️', label: 'Declare War', desc: 'Open hostilities', color: 'hsl(0,40%,20%)', bcolor: 'hsl(0,60%,38%)' },
                    { type: 'neutral', icon: '🤝', label: 'Propose Peace', desc: 'Return to neutral status', color: 'hsl(35,20%,20%)', bcolor: 'hsl(35,20%,38%)' },
                  ].map(({ type, icon, label, desc, color, bcolor }) => (
                    <button key={type} onClick={() => handlePropose(type)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:opacity-90 transition-all"
                      style={{ background: color, border: `1px solid ${bcolor}` }}>
                      <div className="text-xs font-bold mb-0.5" style={{ color: 'hsl(40,25%,85%)', fontFamily: "'Cinzel',serif" }}>
                        {icon} {label}
                      </div>
                      <div className="text-xs opacity-50">{desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* TRADE TAB */}
        {tab === 'trade' && (
          <>
            {incomingOffers.length > 0 && (
              <div className="mb-3">
                <div className="text-xs opacity-50 mb-1.5" style={{ fontFamily: "'Cinzel',serif" }}>INCOMING OFFERS</div>
                <div className="space-y-2">
                  {incomingOffers.map((o, i) => (
                    <TradeOffer key={i} offer={o} currentPlayer={currentPlayer} players={gameState.players}
                      onAccept={onAcceptTrade} onDecline={onDeclineTrade} />
                  ))}
                </div>
              </div>
            )}

            {outgoingOffers.length > 0 && (
              <div className="mb-3">
                <div className="text-xs opacity-50 mb-1.5" style={{ fontFamily: "'Cinzel',serif" }}>SENT OFFERS</div>
                <div className="space-y-2">
                  {outgoingOffers.map((o, i) => (
                    <TradeOffer key={i} offer={o} currentPlayer={currentPlayer} players={gameState.players}
                      onAccept={onAcceptTrade} onDecline={onDeclineTrade} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs opacity-50 mb-1.5" style={{ fontFamily: "'Cinzel',serif" }}>NEW TRADE OFFER</div>
              <div className="space-y-1 mb-2">
                <div className="text-xs opacity-40 mb-1">Send to:</div>
                {otherPlayers.map(p => (
                  <button key={p.id} onClick={() => setTradeTarget(p.id === tradeTarget ? null : p.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:opacity-80"
                    style={{
                      background: tradeTarget === p.id ? 'hsl(43,40%,20%)' : 'hsl(35,20%,18%)',
                      border: `1px solid ${tradeTarget === p.id ? 'hsl(43,70%,40%)' : 'hsl(35,20%,28%)'}`,
                      color: 'hsl(40,20%,70%)',
                    }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {NATION_EMBLEMS[p.factionId] && (
                      <img src={NATION_EMBLEMS[p.factionId]} alt="" style={{ width: 12, height: 12, objectFit: 'contain', flexShrink: 0 }} />
                    )}
                    {p.name}
                  </button>
                ))}
              </div>

              {tradeTarget && (
                <>
                  <ResourceInput label="📦 You Offer" resources={offerRes} onChange={setOfferRes} playerRes={currentPlayer.resources} />
                  <ResourceInput label="🎯 You Request" resources={requestRes} onChange={setRequestRes} playerRes={null} />
                  <button onClick={handleSendTrade}
                    className="w-full py-2 rounded-lg text-xs font-bold mt-2 hover:opacity-90"
                    style={{ fontFamily: "'Cinzel',serif", background: 'hsl(43,60%,26%)', border: '1px solid hsl(43,70%,42%)', color: 'hsl(43,90%,75%)' }}>
                    📜 Send Trade Offer
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {discussionTarget && <DiplomacyDiscussion gameState={gameState} currentPlayer={currentPlayer} targetPlayer={discussionTarget} onClose={() => setDiscussionTarget(null)} />}
    </div>
  );
}

function ResourceInput({ label, resources, onChange, playerRes }) {
  const res = ['gold', 'wood', 'wheat'];
  const icons = { gold: '🪙', wood: '🪵', wheat: '🌾' };
  return (
    <div className="rounded-lg p-2 mb-2" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
      <div className="text-xs opacity-50 mb-1.5" style={{ fontFamily: "'Cinzel',serif" }}>{label}</div>
      {res.map(k => (
        <div key={k} className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'hsl(40,20%,65%)' }}>{icons[k]} {k}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => onChange(r => ({ ...r, [k]: Math.max(0, r[k] - 1) }))}
              className="w-5 h-5 rounded text-xs font-bold hover:opacity-80"
              style={{ background: 'hsl(35,20%,25%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,70%)' }}>−</button>
            <span className="text-xs font-bold w-5 text-center" style={{ color: 'hsl(43,80%,65%)' }}>{resources[k]}</span>
            <button onClick={() => onChange(r => ({
              ...r,
              [k]: playerRes ? Math.min(playerRes[k] || 0, r[k] + 1) : r[k] + 1
            }))}
              className="w-5 h-5 rounded text-xs font-bold hover:opacity-80"
              style={{ background: 'hsl(35,20%,25%)', border: '1px solid hsl(35,20%,35%)', color: 'hsl(40,20%,70%)' }}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}