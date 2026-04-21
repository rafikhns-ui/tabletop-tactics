import React, { useState } from 'react';
import { listOpenOffers, resolveOffer, getPersonality } from '@/lib/diplomacy';

/**
 * Lists standing offers that target the human player, with accept /
 * reject buttons. Offers are queued by action types like
 * PROPOSE_RESOURCE_TRADE, PROPOSE_PEACE, DEMAND_VASSALAGE, etc., and
 * expire on their own turn if the player doesn't answer.
 *
 * resolveOffer can legitimately fail in player-visible ways — e.g.
 * target_cannot_fulfill when accepting a trade you can't pay for. We
 * keep a per-offer error note so failures don't look like an
 * unresponsive button.
 */
export default function OpenOffersPanel({ gameState, playerFactionId, onStateChange }) {
  const offers = listOpenOffers(gameState, playerFactionId);
  const [errors, setErrors] = useState({});
  if (!offers || offers.length === 0) return null;

  const onChoice = (offerId, choice) => {
    const result = resolveOffer(gameState, offerId, choice);
    if (!result.ok) {
      console.warn('Offer resolution failed:', result.reason);
      setErrors((prev) => ({ ...prev, [offerId]: result.reason }));
      return;
    }
    setErrors((prev) => {
      if (!(offerId in prev)) return prev;
      const next = { ...prev };
      delete next[offerId];
      return next;
    });
    onStateChange?.(result.state);
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 10,
          letterSpacing: 2,
          opacity: 0.5,
          marginBottom: 6,
        }}
      >
        OFFERS AWAITING YOUR ANSWER
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {offers.map((o) => (
          <OfferRow
            key={o.id}
            offer={o}
            gameState={gameState}
            errorReason={errors[o.id]}
            onAccept={() => onChoice(o.id, 'accept')}
            onReject={() => onChoice(o.id, 'reject')}
          />
        ))}
      </div>
    </div>
  );
}

function OfferRow({ offer, gameState, errorReason, onAccept, onReject }) {
  const fromPersonality = getPersonality(offer.proposer);
  const fromLabel = fromPersonality
    ? fromPersonality.leaderName
    : offer.proposer;
  const turnsLeft = Math.max(
    0,
    (offer.expiresOnTurn || 0) - (gameState.turn || 0),
  );

  return (
    <div
      style={{
        padding: 8,
        border: '1px solid hsl(38,35%,30%)',
        background: 'hsl(35,20%,15%)',
        borderRadius: 4,
        fontFamily: "'Crimson Text', serif",
        fontSize: 12,
        color: '#d8cfb8',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.6 }}>
        {offer.type.replace(/_/g, ' ')} · from {fromLabel}
        {turnsLeft > 0 ? ` · ${turnsLeft} turn(s) left` : ' · expires this turn'}
      </div>
      <div style={{ marginTop: 4 }}>{describeOffer(offer)}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button onClick={onAccept} style={buttonStyle('accept')}>
          Accept
        </button>
        <button onClick={onReject} style={buttonStyle('reject')}>
          Refuse
        </button>
      </div>
      {errorReason && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            fontStyle: 'italic',
            color: 'hsl(10,55%,65%)',
          }}
        >
          {describeOfferError(errorReason)}
        </div>
      )}
    </div>
  );
}

function describeOfferError(reason) {
  switch (reason) {
    case 'target_cannot_fulfill':
      return "You don't have the goods this trade asks for.";
    case 'target_cannot_pay':
      return "You don't have the tribute they demand.";
    case 'not_at_war':
      return 'There is no war left to end.';
    case 'already_resolved':
      return 'This offer has already been answered.';
    case 'unknown_offer':
      return 'The offer has moved on.';
    case 'invalid_choice':
      return 'That response is not available.';
    default:
      return reason?.startsWith('unhandled_offer_type')
        ? 'This offer type cannot be resolved from the council chamber.'
        : `Could not resolve offer (${reason || 'unknown reason'}).`;
  }
}

function buttonStyle(kind) {
  const accent =
    kind === 'accept' ? 'hsl(95,40%,30%)' : 'hsl(0,40%,30%)';
  return {
    padding: '4px 10px',
    fontSize: 11,
    background: accent,
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#e8e2cf',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "'Cinzel', serif",
    letterSpacing: 1,
  };
}

function describeOffer(offer) {
  const p = offer.payload || {};
  switch (offer.type) {
    case 'PROPOSE_RESOURCE_TRADE':
      return `They offer ${bagStr(p.give)} for ${bagStr(p.receive)}.`;
    case 'PROPOSE_PEACE':
      return p.reparations
        ? `Peace, with reparations of ${bagStr(p.reparations)}.`
        : 'Peace, unconditionally.';
    case 'DEMAND_VASSALAGE':
      return `Submit as vassal; tribute ${bagStr(p.tributePerTurn)} per turn.`;
    case 'DEMAND_HOSTAGES':
      return `Deliver ${p.count || 1} hostage(s) to their court.`;
    case 'EXTORT_TRIBUTE':
      return `Pay ${bagStr(p.demanded)} or face the consequences.`;
    case 'DEMAND_INTEL':
      return `Share what you know of ${p.aboutFaction || 'a third party'}.`;
    case 'JOINT_STRIKE':
      return `Strike together against ${p.commonEnemy || 'a common foe'}${
        p.targetHex ? ` at hex ${p.targetHex}` : ''
      }.`;
    default:
      return `(${offer.type})`;
  }
}

function bagStr(bag) {
  if (!bag) return 'nothing';
  const parts = Object.entries(bag)
    .filter(([, v]) => v)
    .map(([k, v]) => `${v} ${k}`);
  return parts.length ? parts.join(', ') : 'nothing';
}
