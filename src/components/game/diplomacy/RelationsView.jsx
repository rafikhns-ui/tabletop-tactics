import React from 'react';
import {
  listAuthoredPersonalities,
  getSentiment,
  getRelation,
} from '@/lib/diplomacy';

/**
 * Per-faction ledger: where you stand with everyone, and every active
 * diplomatic binding between you and them (war, pact, oath, dispute,
 * ward, demilitarized zone, marriage, trade route, embargo).
 *
 * Read-only for now. All the data is already in gameState.diplomacy.*.
 */
export default function RelationsView({ gameState, playerFactionId }) {
  if (!playerFactionId) return null;

  const turn = gameState?.turn || 0;
  const dip = gameState?.diplomacy || {};
  const others = listAuthoredPersonalities().filter(
    (p) => p.factionId !== playerFactionId,
  );

  return (
    <div
      style={{
        padding: 14,
        background: 'linear-gradient(180deg, hsl(35,22%,12%), hsl(35,18%,9%))',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontFamily: "'Cinzel',serif",
          letterSpacing: 3,
          fontSize: 11,
          color: '#d4a853',
          marginBottom: 6,
        }}
      >
        RELATIONS LEDGER
      </div>
      <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 14 }}>
        Where your house stands with every rival court.
      </div>

      {others.length === 0 ? (
        <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: 12 }}>
          There are no other named houses yet.
        </div>
      ) : (
        others.map((p) => (
          <FactionRow
            key={p.factionId}
            personality={p}
            playerFactionId={playerFactionId}
            dip={dip}
            turn={turn}
          />
        ))
      )}

      <RecentDecisions
        offerLog={dip.offerLog || []}
        playerFactionId={playerFactionId}
      />
    </div>
  );
}

function RecentDecisions({ offerLog, playerFactionId }) {
  const relevant = offerLog
    .filter(
      (o) => o.proposer === playerFactionId || o.target === playerFactionId,
    )
    .slice(-6)
    .reverse();
  if (relevant.length === 0) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 10,
          letterSpacing: 2,
          opacity: 0.5,
          marginBottom: 6,
        }}
      >
        RECENT DECISIONS
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {relevant.map((o) => (
          <DecisionLine key={o.id} offer={o} playerFactionId={playerFactionId} />
        ))}
      </ul>
    </div>
  );
}

function DecisionLine({ offer, playerFactionId }) {
  const asProposer = offer.proposer === playerFactionId;
  const other = asProposer ? offer.target : offer.proposer;
  const otherName =
    listAuthoredPersonalities().find((p) => p.factionId === other)?.leaderName ||
    other;
  const label = String(offer.type || '').replace(/_/g, ' ').toLowerCase();
  const accepted = offer.status === 'accepted';
  const color = accepted ? '#9ec27a' : '#c95b5b';
  const verb = accepted ? 'accepted' : 'refused';
  const phrase = asProposer
    ? `${otherName} ${verb} your ${label}`
    : `You ${verb} ${otherName}'s ${label}`;
  return (
    <li
      style={{
        fontFamily: "'Crimson Text', serif",
        fontSize: 12,
        color: '#c8c0b0',
        borderLeft: `2px solid ${color}88`,
        paddingLeft: 8,
      }}
    >
      <span
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 9,
          letterSpacing: 1.5,
          color,
          marginRight: 6,
        }}
      >
        TURN {offer.resolvedTurn ?? '?'}
      </span>
      {phrase}.
    </li>
  );
}

function FactionRow({ personality, playerFactionId, dip, turn }) {
  const otherId = personality.factionId;
  const mineToThem = getSentiment({ diplomacy: dip }, playerFactionId, otherId);
  const theirsToMe = getSentiment({ diplomacy: dip }, otherId, playerFactionId);
  const relation = getRelation(
    { diplomacy: dip },
    playerFactionId,
    otherId,
  );
  const accent = relationColor(relation);

  const bindings = collectBindings(dip, playerFactionId, otherId, turn);

  return (
    <div
      style={{
        border: `1px solid ${accent}55`,
        borderRadius: 8,
        padding: 12,
        background: 'linear-gradient(160deg, hsl(35,22%,13%), hsl(35,18%,9%))',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 15,
              fontWeight: 700,
              color: accent,
            }}
          >
            {personality.leaderName}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              opacity: 0.55,
              fontFamily: "'Cinzel',serif",
              textTransform: 'uppercase',
            }}
          >
            {personality.title}
          </div>
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
          {prettyRelation(relation)}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: bindings.length ? 10 : 0,
          fontFamily: "'Crimson Text', serif",
          fontSize: 12,
        }}
      >
        <Sentiment label="Your view" value={mineToThem} />
        <Sentiment label="Their view" value={theirsToMe} />
      </div>

      {bindings.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {bindings.map((b, i) => (
            <li
              key={i}
              style={{
                fontFamily: "'Crimson Text', serif",
                fontSize: 12,
                color: '#c8c0b0',
                borderLeft: `2px solid ${b.color || accent}88`,
                paddingLeft: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: b.color || accent,
                  marginRight: 6,
                }}
              >
                {b.label}
              </span>
              {b.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sentiment({ label, value }) {
  const v = clamp(value ?? 0, -100, 100);
  const pct = Math.abs(v);
  const positive = v >= 0;
  const color = positive ? '#9ec27a' : '#c95b5b';
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.5,
          opacity: 0.6,
          fontFamily: "'Cinzel',serif",
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        {label} · {v > 0 ? '+' : ''}{v}
      </div>
      <div
        style={{
          height: 5,
          background: 'hsl(35,10%,18%)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: positive ? '50%' : `${50 - pct / 2}%`,
            width: `${pct / 2}%`,
            background: color,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1,
            background: 'hsl(35,18%,28%)',
          }}
        />
      </div>
    </div>
  );
}

function collectBindings(dip, me, them, turn) {
  const out = [];
  const involves = (a, b) =>
    (a === me && b === them) || (a === them && b === me);
  const alive = (o) =>
    !o?.expiresOnTurn || o.expiresOnTurn > turn;

  for (const w of dip.wars || []) {
    if (involves(w.attacker, w.defender)) {
      const aggressor = w.attacker === me ? 'You' : personalityNameOr(w.attacker);
      const victim = w.defender === me ? 'you' : personalityNameOr(w.defender);
      out.push({
        label: 'WAR',
        color: '#c95b5b',
        text: `${aggressor} declared on ${victim} — "${w.casusBelli}" (turn ${w.declaredTurn}).`,
      });
    }
  }

  for (const p of dip.pacts || []) {
    if (involves(p.a, p.b) && alive(p)) {
      out.push({
        label: (p.kind || 'pact').toUpperCase().replace(/_/g, ' '),
        color: '#9ec27a',
        text: `In force until turn ${p.expiresOnTurn ?? '—'}.`,
      });
    }
  }

  for (const o of dip.oaths || []) {
    if (involves(o.a, o.b) && !o.broken && alive(o)) {
      out.push({
        label: 'OATH',
        color: '#b990d6',
        text: `"${o.clause}" — held until turn ${o.expiresOnTurn ?? '—'}.`,
      });
    }
  }

  for (const d of dip.disputes || []) {
    if (involves(d.claimant, d.holder)) {
      const who = d.claimant === me ? 'You claim' : `${personalityNameOr(d.claimant)} claims`;
      out.push({
        label: 'DISPUTE',
        color: '#d4a853',
        text: `${who} hex ${d.hexId}: ${d.grounds}.`,
      });
    }
  }

  for (const w of dip.wards || []) {
    if (involves(w.host, w.origin) && alive(w)) {
      const direction = w.host === me ? `Your guest` : `Their guest`;
      out.push({
        label: 'WARD',
        color: '#8fa8b5',
        text: `${direction}: ${w.name} (until turn ${w.expiresOnTurn ?? '—'}).`,
      });
    }
  }

  for (const z of dip.dmz || []) {
    if (involves(z.a, z.b)) {
      const n = Array.isArray(z.hexIds) ? z.hexIds.length : 0;
      out.push({
        label: 'DMZ',
        color: '#8fa8b5',
        text: `${n} hex${n === 1 ? '' : 'es'} demilitarized since turn ${z.sinceTurn}.`,
      });
    }
  }

  for (const m of dip.marriages || []) {
    if (involves(m.a, m.b)) {
      out.push({
        label: 'MARRIAGE',
        color: '#d6a8c7',
        text: `Houses joined on turn ${m.turn}${m.heirClaim ? ` — heir claim: ${m.heirClaim}` : ''}.`,
      });
    }
  }

  for (const r of dip.tradeRoutes || []) {
    if (involves(r.a, r.b) && alive(r)) {
      const suspended = r.suspendedUntilTurn && r.suspendedUntilTurn > turn;
      out.push({
        label: 'TRADE',
        color: suspended ? '#8a7a4a' : '#d4a853',
        text: suspended
          ? `Route blockaded until turn ${r.suspendedUntilTurn}.`
          : `Route yielding ${bagStr(r.yieldPerTurn)}/turn until ${r.expiresOnTurn ?? '—'}.`,
      });
    }
  }

  for (const e of dip.embargoes || []) {
    if ((e.from === me && e.against === them) || (e.from === them && e.against === me)) {
      const direction = e.from === me ? 'You embargo them' : 'They embargo you';
      out.push({
        label: 'EMBARGO',
        color: '#c95b5b',
        text: `${direction} (since turn ${e.sinceTurn}).`,
      });
    }
  }

  return out;
}

function personalityNameOr(id) {
  try {
    // Avoid circular by reading the registry lazily — but we already
    // imported listAuthoredPersonalities; cheap enough.
    const match = listAuthoredPersonalities().find((p) => p.factionId === id);
    return match?.leaderName || id;
  } catch {
    return id;
  }
}

function prettyRelation(relation) {
  return String(relation || 'neutral').replace(/_/g, ' ');
}

function relationColor(relation) {
  switch (relation) {
    case 'war':
      return '#c95b5b';
    case 'vassal':
    case 'overlord':
    case 'overlord_of':
      return '#b48a4a';
    case 'non_aggression':
    case 'peace':
      return '#9ec27a';
    case 'ally':
      return '#6fbf9a';
    default:
      return '#8fa8b5';
  }
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function bagStr(bag) {
  if (!bag) return 'nothing';
  const parts = Object.entries(bag)
    .filter(([, v]) => v)
    .map(([k, v]) => `${v} ${k}`);
  return parts.length ? parts.join(', ') : 'nothing';
}
