import React from 'react';
import { getPersonality } from '@/lib/diplomacy';

/**
 * A single inbox event: headline, body, and up to N proposal buttons.
 * `onChoose(event, proposalId)` is called when the player picks one.
 * `onOpenConversation(event)` is called when the player clicks the ruler
 * name to open a freeform chat.
 * `errorReason` is set when the last resolveEventChoice call failed —
 * rendered inline so the player knows why their click did nothing.
 */
export default function EventCard({
  event,
  errorReason,
  onChoose,
  onOpenConversation,
  onDismiss,
}) {
  const personality = getPersonality(event.fromFactionId);
  const leaderName = personality?.leaderName || event.fromFactionId;
  const accent = colorFor(event.kind);

  return (
    <div
      style={{
        border: `1px solid ${accent}55`,
        borderRadius: 8,
        padding: 14,
        background: 'linear-gradient(160deg, hsl(35,22%,13%), hsl(35,18%,9%))',
        marginBottom: 10,
        opacity: event.status === 'expired' ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.5, fontFamily: "'Cinzel',serif" }}>
            {kindLabel(event.kind)} · TURN {event.turn}
          </div>
          <button
            onClick={() => onOpenConversation?.(event)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: accent,
              fontFamily: "'Cinzel',serif",
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
            }}
            title="Open conversation"
          >
            {leaderName}
          </button>
        </div>
        <span
          style={{
            fontSize: 9,
            padding: '2px 8px',
            border: `1px solid ${accent}55`,
            borderRadius: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: accent,
          }}
        >
          {event.status}
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 13,
          color: '#e2d8c0',
          marginBottom: 8,
        }}
      >
        {event.headline}
      </div>

      <div
        style={{
          fontFamily: "'Crimson Text', serif",
          fontSize: 13,
          lineHeight: 1.5,
          color: '#c8c0b0',
          marginBottom: 12,
        }}
      >
        {event.body}
      </div>

      {event.status === 'unread' || event.status === 'read' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {event.proposals.map((p) => (
            <button
              key={p.id}
              onClick={() => onChoose?.(event, p.id)}
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                background: 'hsl(35,22%,17%)',
                border: `1px solid ${accent}44`,
                borderRadius: 4,
                color: '#d8cfb8',
                fontFamily: "'Crimson Text', serif",
                fontSize: 12,
                cursor: 'pointer',
              }}
              title={p.reason}
            >
              <span style={{ color: accent, marginRight: 8, fontWeight: 700 }}>{p.type}</span>
              {summarizeProposal(p)}
            </button>
          ))}
          {errorReason && (
            <div
              style={{
                fontSize: 11,
                fontStyle: 'italic',
                color: 'hsl(10,55%,65%)',
                marginTop: 2,
              }}
            >
              {describeEventError(errorReason)}
            </div>
          )}
          <button
            onClick={() => onDismiss?.(event)}
            style={{
              alignSelf: 'flex-end',
              background: 'none',
              border: 'none',
              color: 'hsl(35,10%,55%)',
              fontSize: 11,
              cursor: 'pointer',
              marginTop: 2,
            }}
          >
            set aside
          </button>
        </div>
      ) : null}
    </div>
  );
}

// Translate a resolveEventChoice / dispatch rejection reason into a line
// the player can act on. Dispatcher reasons arrive as short tags
// ("unknown_target", "insufficient_to_give", "schema:missing:hexId",
// "unknown_action_type:FOO"); action-specific reasons vary but share
// themes ("not_at_war", "already_at_war", "not_enough_ip").
function describeEventError(reason) {
  if (!reason) return 'Your council cannot carry out that choice.';
  if (reason === 'proposal_not_found')
    return 'That proposal has already been withdrawn.';
  if (reason === 'insufficient_to_give' || reason === 'insufficient_funds')
    return "Your treasury can't cover that choice — try another.";
  if (reason === 'not_enough_ip') return 'Your court lacks the influence for that.';
  if (reason === 'not_enough_sp') return 'Your priesthood lacks the standing for that.';
  if (reason === 'unknown_proposer' || reason === 'unknown_target')
    return 'A faction in that proposal is no longer on the board.';
  if (reason === 'not_at_war') return 'That peace cannot be offered — no war stands between you.';
  if (reason === 'already_at_war') return 'You are already at war.';
  if (reason === 'nap_in_effect' || reason === 'nap_active')
    return 'A non-aggression pact bars that choice.';
  if (reason.startsWith('schema:missing:'))
    return `Your council asks for details the letter never specified (${reason.slice(15)}).`;
  if (reason.startsWith('schema:invalid:'))
    return `The proposal's terms are malformed (${reason.slice(15)}).`;
  if (reason.startsWith('schema:')) return `Malformed proposal (${reason.slice(7)}).`;
  if (reason.startsWith('unknown_action_type:'))
    return 'The scribe does not recognize that kind of decree.';
  return `Your council cannot carry out that choice (${reason}).`;
}

function kindLabel(kind) {
  return String(kind || '')
    .replace(/_/g, ' ')
    .toUpperCase();
}

function colorFor(kind) {
  switch (kind) {
    case 'patience_broken':
      return '#c95b5b';
    case 'omen_witnessed':
      return '#b990d6';
    case 'trade_disruption':
      return '#d4a853';
    case 'border_incident':
      return '#ca8755';
    case 'warmth_offered':
      return '#9ec27a';
    case 'war_fatigue':
      return '#8a8f99';
    case 'succession_rumor':
      return '#d6a8c7';
    default:
      return '#8fa8b5';
  }
}

function summarizeProposal(p) {
  // Small, schema-aware summaries; enough for the button label.
  const pl = p.payload || {};
  switch (p.type) {
    case 'OFFER_GOLD_TRIBUTE':
      return `Send ${pl.gold}g.`;
    case 'PROPOSE_RESOURCE_TRADE':
      return `Trade ${bag(pl.give)} for ${bag(pl.receive)}.`;
    case 'GRANT_TRADE_RIGHTS':
      return `Open a trade route for ${pl.duration} turns.`;
    case 'EMBARGO':
      return `Cut off trade.`;
    case 'CARAVAN_CONTRACT':
      return `Deliver ${bag(pl.bundle)} for ${pl.cost}g.`;
    case 'CEDE_HEX':
      return `Cede hex ${pl.hexId}.`;
    case 'CLAIM_HEX_DISPUTE':
      return `Dispute hex ${pl.hexId}: ${pl.grounds}.`;
    case 'DEMILITARIZE_ZONE':
      return `Demilitarize ${pl.hexIds?.length || 0} hex(es).`;
    case 'DECLARE_WAR':
      return `Declare war — "${pl.casusBelli}".`;
    case 'PROPOSE_PEACE':
      return `Offer peace${pl.reparations ? ' with ' + bag(pl.reparations) : ''}.`;
    case 'DEMAND_VASSALAGE':
      return `Demand vassalage (${bag(pl.tributePerTurn)}/turn).`;
    case 'GRANT_MILITARY_ACCESS':
      return `Grant access for ${pl.duration} turns.`;
    case 'JOINT_STRIKE':
      return `Joint strike on ${pl.commonEnemy}.`;
    case 'THREATEN_INVASION':
      return `"${pl.demand}" within ${pl.deadlineInTurns} turns.`;
    case 'EXTORT_TRIBUTE':
      return `Demand ${bag(pl.demanded)}.`;
    case 'COURT_FAVOR':
      return `Spend ${pl.gold}g + ${pl.ip}ip to court favor.`;
    case 'CULTURAL_EXCHANGE':
      return `Open exchange: ${pl.theme}.`;
    case 'ACCUSE_OF_BETRAYAL':
      return `Accuse: "${pl.accusation}".`;
    case 'SHARE_INTEL':
      return `Share intel about ${pl.aboutFaction}.`;
    case 'DEMAND_INTEL':
      return `Demand intel about ${pl.aboutFaction}.`;

    // --- Spiritual ---
    case 'SWEAR_OATH_BY_SKY':
      return `Swear oath: "${pl.clause}" (${pl.duration} turns).`;
    case 'SEND_PILGRIMAGE':
      return `Send pilgrimage (${pl.sp}sp).`;
    case 'CONSECRATE_HEX':
      return `Consecrate hex ${pl.hexId}.`;
    case 'CURSE_FACTION':
      return `Curse them: "${pl.reason}".`;

    // --- Dynastic ---
    case 'ARRANGE_MARRIAGE':
      return `Arrange marriage${pl.dowry ? ' (dowry ' + bag(pl.dowry) + ')' : ''}.`;
    case 'ACKNOWLEDGE_HEIR':
      return `Acknowledge ${pl.heirName} as heir.`;
    case 'ADOPT_HOSTAGE':
      return `Take ${pl.wardName} as ward for ${pl.duration} turns.`;
    case 'RECOGNIZE_CLAIM':
      return `Recognize claim: "${pl.claim}".`;

    // --- Trade / Territory additions ---
    case 'CONFISCATE_CARAVAN':
      return `Seize ${pl.gold}g caravan.`;
    case 'SETTLE_COLONY':
      return `Settle a colony at ${pl.hexId}.`;
    case 'GRANT_RIGHT_OF_PASSAGE':
      return `Grant passage for ${pl.duration} turns.`;

    // --- Military additions ---
    case 'NON_AGGRESSION_PACT':
      return `Sign non-aggression pact (${pl.duration} turns).`;
    case 'MILITARY_REPOSITION':
      return `Reposition forces toward ${pl.toward} (${pl.intent}).`;

    // --- Coercion additions ---
    case 'DEMAND_HOSTAGES':
      return `Demand ${pl.count || 1} hostage(s).`;
    case 'BLOCKADE':
      return `Blockade for ${pl.duration} turns.`;
    case 'ULTIMATUM_WITH_DEADLINE':
      return `Ultimatum: "${pl.demand}" in ${pl.deadlineInTurns} turns (else ${pl.consequence}).`;

    // --- Influence additions ---
    case 'SPREAD_PROPAGANDA':
      return `Propaganda (${pl.ip}ip): "${pl.narrative}".`;
    case 'PRAISE_PUBLICLY':
      return `Praise publicly (${pl.occasion}).`;
    case 'SPONSOR_FACTION_AT_COURT':
      return `Sponsor at ${pl.courtFaction}'s court (${pl.gold}g, ${pl.ip}ip).`;

    // --- Intelligence additions ---
    case 'PLANT_SPY':
      return `Plant a spy (cover: ${pl.cover || 'envoy'}).`;
    case 'BRIBE_COURTIER':
      return `Bribe ${pl.courtierName} (${pl.gold}g).`;

    default:
      return p.reason || '';
  }
}

function bag(b) {
  if (!b) return 'nothing';
  return (
    Object.entries(b)
      .filter(([, v]) => v)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ') || 'nothing'
  );
}
