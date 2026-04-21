// Per-turn maintenance tick.
//
// Runs once per end-of-turn, before victory checks. Handles three
// responsibilities that live below the LLM tool-call layer:
//
//   1) Apply recurring yields (trade routes, etc.) to faction purses.
//   2) Expire diplomatic objects whose expiresOnTurn has passed.
//   3) Lightly decay sentiment back toward 0, the baseline.
//
// This module is pure: returns a new state, never mutates the input.

import {
  addResources,
  deductResources,
  factionById,
  hasResources,
  clamp,
  pairKey,
} from './actions/_helpers';
import { INBOX_HISTORY_TURNS } from './inbox';

const SENTIMENT_DECAY_PER_TURN = 1; // moves sentiment toward 0 by 1 point / turn

/**
 * The headline export — run once per end-of-turn.
 *
 * Guarded against duplicate calls: if the tick has already been
 * applied for this turn, the non-idempotent operations (trade income
 * and sentiment decay) are skipped. Expiries and reconciliation are
 * naturally idempotent so they're safe to re-run.
 */
export function runTurnTick(gameState) {
  const next = structuredClone(gameState);
  const turn = next.turn || 0;
  next.diplomacy = next.diplomacy || {};

  const alreadyTicked = next.diplomacy.lastTickedTurn === turn;

  if (!alreadyTicked) {
    applyTradeRouteIncome(next, turn);
    collectVassalTribute(next, turn);
  }
  expireDiplomaticObjects(next, turn);
  reconcileRelations(next);
  reconcileDisputes(next);
  if (!alreadyTicked) {
    decaySentiment(next);
  }
  unsuspendTradeRoutes(next, turn);
  // Safe to run every call — idempotent on an already-pruned list.
  pruneMissedTribute(next, turn);
  pruneLogCollections(next, turn);

  next.diplomacy.lastTickedTurn = turn;
  return next;
}

// — income —————————————————————————————————————————

function applyTradeRouteIncome(state, turn) {
  const routes = state.diplomacy?.tradeRoutes || [];
  for (const r of routes) {
    if (r.expiresOnTurn != null && r.expiresOnTurn <= turn) continue;
    if (r.suspendedUntilTurn != null && r.suspendedUntilTurn > turn) continue;
    const yieldBag = r.yieldPerTurn;
    if (!yieldBag) continue;
    const a = factionById(state, r.a);
    const b = factionById(state, r.b);
    if (a) addResources(a, yieldBag);
    if (b) addResources(b, yieldBag);
  }
}

// — vassal tribute ————————————————————————————————
//
// Each live vassalage moves `tributePerTurn` from the vassal's purse to
// the overlord's. If the vassal cannot pay in full, the missed payment
// is recorded so downstream systems (events, AI policy) can react —
// missed tribute is the canonical trigger for rebellion plotlines.

function collectVassalTribute(state, turn) {
  const vassalages = state.diplomacy?.vassalages || [];
  if (vassalages.length === 0) return;
  state.diplomacy.missedTribute = state.diplomacy.missedTribute || [];
  for (const v of vassalages) {
    const tribute = v.tributePerTurn;
    if (!tribute || Object.values(tribute).every((n) => !n)) continue;
    const overlord = factionById(state, v.overlord);
    const vassal = factionById(state, v.vassal);
    if (!overlord || !vassal) continue;
    if (!hasResources(vassal, tribute)) {
      state.diplomacy.missedTribute.push({
        overlord: v.overlord,
        vassal: v.vassal,
        owed: { ...tribute },
        turn,
      });
      continue;
    }
    deductResources(vassal, tribute);
    addResources(overlord, tribute);
  }
}

/**
 * Drop missedTribute entries older than the inbox history window.
 * The list is append-only from collectVassalTribute and (today) has no
 * downstream consumer — once a real rebellion-trigger detector lands it
 * will read the recent tail. Without bounding, a vassal that can never
 * pay accumulates one entry per turn forever, bloating save state and
 * every structuredClone in the dispatcher.
 *
 * Idempotent: re-running on a pruned list yields the same identity-stable
 * result (filter only allocates a new array if at least one entry was
 * dropped).
 */
function pruneMissedTribute(state, turn) {
  const list = state.diplomacy?.missedTribute;
  if (!Array.isArray(list) || list.length === 0) return;
  const cutoff = turn - INBOX_HISTORY_TURNS;
  let dropped = 0;
  const kept = [];
  for (const m of list) {
    // Entries without a turn stamp are paranoia-kept — should never
    // happen because collectVassalTribute always writes turn.
    if (m.turn == null || m.turn > cutoff) kept.push(m);
    else dropped++;
  }
  if (dropped > 0) state.diplomacy.missedTribute = kept;
}

// — log collections ———————————————————————————————————
//
// Six collections are pure write-only audit logs: each dispatched action
// pushes one entry, nothing reads them for decision-making or UI, and
// none carry an expiresOnTurn. Without pruning they grow one-entry-per-
// relevant-action for the life of the game, bloating save state and
// every structuredClone in the dispatcher.
//
// Pruning mirrors missedTribute: preserve entries younger than the
// history window, keep any entry lacking a timestamp (paranoia) to
// avoid silent data loss, and only reassign the array when at least one
// entry is dropped (identity-stable when no-op).

const LOG_COLLECTIONS = [
  { key: 'postures', turnField: 'turn' },
  { key: 'intelLog', turnField: 'turn' },
  { key: 'propaganda', turnField: 'turn' },
  { key: 'praise', turnField: 'turn' },
  { key: 'bribes', turnField: 'turn' },
  // JOINT_STRIKE acceptance stamps `agreedTurn`, not `turn`.
  { key: 'jointStrikes', turnField: 'agreedTurn' },
  // CURSE_FACTION, ACKNOWLEDGE_HEIR, SPONSOR_SUCCESSION — all push-only
  // records with no downstream consumer today. Same unbounded-growth
  // profile as the entries above; included in the same sweep.
  { key: 'curses', turnField: 'turn' },
  { key: 'heirRecognitions', turnField: 'turn' },
  { key: 'sponsorships', turnField: 'turn' },
  // CULTURAL_EXCHANGE stamps `sinceTurn`, so we override the field name.
  { key: 'culturalTies', turnField: 'sinceTurn' },
  // RECOGNIZE_CLAIM writes a {recognizer, holder, claim, turn} record
  // that no validator, UI, or prompt builder reads — same write-only
  // profile as the entries above. Without pruning, any faction that
  // serially recognizes claims (expected behavior for diplomacy-heavy
  // LLMs) accumulates entries for the life of the game.
  { key: 'recognizedClaims', turnField: 'turn' },
];

function pruneLogCollections(state, turn) {
  const cutoff = turn - INBOX_HISTORY_TURNS;
  for (const { key, turnField } of LOG_COLLECTIONS) {
    const list = state.diplomacy?.[key];
    if (!Array.isArray(list) || list.length === 0) continue;
    let dropped = 0;
    const kept = [];
    for (const e of list) {
      const t = e?.[turnField];
      if (t == null || t > cutoff) kept.push(e);
      else dropped++;
    }
    if (dropped > 0) state.diplomacy[key] = kept;
  }
}

// — expirations ———————————————————————————————————

// Collections with no resource escrow — expiry is a plain filter.
const EXPIRING_COLLECTIONS = [
  'oaths',
  'pacts',
  'wards',
  'dmz',
  'standingThreats',
  'ultimatums',
  'rightsOfPassage',
  'militaryAccess',
  'tradeRoutes',
  'blockades',
];

function expireDiplomaticObjects(state, turn) {
  state.diplomacy = state.diplomacy || {};
  // Plain-filter collections.
  for (const key of EXPIRING_COLLECTIONS) {
    const list = state.diplomacy[key];
    if (!Array.isArray(list) || list.length === 0) continue;
    state.diplomacy[key] = list.filter(
      (o) => !(o.expiresOnTurn != null && o.expiresOnTurn <= turn),
    );
  }
  // openOffers needs special handling because some offer types escrow
  // the proposer's resources at propose time (PROPOSE_RESOURCE_TRADE
  // debits the 'give' bag in apply(); the bag sits inside the offer
  // entry until the target accepts, rejects, or it expires). A plain
  // filter would quietly delete those escrowed resources. We instead
  // run expired offers through the same refund path manual rejection
  // uses, and log them to offerLog so the UI's "recent decisions"
  // panel can show "your offer expired" rather than the offer just
  // vanishing without a trace.
  expireOpenOffers(state, turn);
}

function expireOpenOffers(state, turn) {
  const offers = state.diplomacy.openOffers;
  if (!Array.isArray(offers) || offers.length === 0) return;
  state.diplomacy.offerLog = state.diplomacy.offerLog || [];

  const kept = [];
  for (const o of offers) {
    const isExpired = o.expiresOnTurn != null && o.expiresOnTurn <= turn;
    if (!isExpired) {
      kept.push(o);
      continue;
    }
    refundEscrow(state, o);
    state.diplomacy.offerLog.push({
      ...o,
      status: 'expired',
      resolvedTurn: turn,
    });
  }
  state.diplomacy.openOffers = kept;
}

/**
 * Mirror of applyRejection's refund logic (offers.js): only
 * PROPOSE_RESOURCE_TRADE escrows goods at propose time today, so that's
 * the only type that needs a refund on expiry. Kept as a switch so new
 * escrowing types get a single place to slot in.
 */
function refundEscrow(state, offer) {
  switch (offer.type) {
    case 'PROPOSE_RESOURCE_TRADE': {
      const proposer = factionById(state, offer.proposer);
      if (proposer) addResources(proposer, offer.payload?.give || {});
      return;
    }
    case 'PROPOSE_PEACE': {
      // Peace reparations are escrowed at propose time. If the target never
      // accepts and the offer expires, return the escrow to the proposer —
      // the war is still on, so the goods shouldn't vanish.
      const reps = offer.payload?.reparations;
      if (!reps) return;
      const proposer = factionById(state, offer.proposer);
      if (proposer) addResources(proposer, reps);
      return;
    }
    default:
      return;
  }
}

// — sentiment decay ————————————————————————————————

function decaySentiment(state) {
  const map = state.diplomacy?.sentiment;
  if (!map) return;
  // getSentiment() returns 0 for missing keys, so a zero-valued entry is
  // semantically identical to no entry at all. Previously we skipped
  // zero-valued keys ("if (v === 0) continue") and wrote 0 back when a
  // non-zero decay landed on exactly 0 — both branches leaked the key
  // forever. In a long game that's O(N²) in the number of faction pairs
  // that ever interacted, bloating save state and every structuredClone
  // in the dispatcher. Delete on 0 instead, in both branches.
  for (const k of Object.keys(map)) {
    const v = map[k] || 0;
    if (v === 0) {
      delete map[k];
      continue;
    }
    const sign = v > 0 ? 1 : -1;
    const magnitude = Math.abs(v);
    const next = sign * Math.max(0, magnitude - SENTIMENT_DECAY_PER_TURN);
    if (next === 0) {
      delete map[k];
      continue;
    }
    map[k] = clamp(next, -100, 100);
  }
}

// — relation reconciliation ——————————————————————————
//
// After expirations run, a pair may still carry a 'non_aggression' or
// 'peace' relation even though the underlying pact is gone. Walk
// diplomacy.relations and fall back to the strongest remaining binding
// (war > vassal > ally > non_aggression > neutral).
//
// Respects 'war' and 'vassal' as always-explicit — we never downgrade
// those here; they're cleared by their own actions (PROPOSE_PEACE
// acceptance, rebellion, etc).

function reconcileRelations(state) {
  const relations = state.diplomacy?.relations;
  if (!relations) return;

  // `wars` retains peace-treated entries (marked with endedTurn) for
  // historical context — filter them out here so a stale 'war'
  // relation can self-heal to 'neutral' on the next reconcile pass.
  const liveWars = new Set(
    (state.diplomacy.wars || [])
      .filter((w) => !w.endedTurn)
      .map((w) => pairKey(w.attacker, w.defender)),
  );
  const livePacts = new Set(
    (state.diplomacy.pacts || []).map((p) => pairKey(p.a, p.b)),
  );
  const liveVassalages = new Set(
    (state.diplomacy.vassalages || []).map((v) => pairKey(v.overlord, v.vassal)),
  );

  // Mirrors decaySentiment's pruning model: 'neutral' is semantically
  // identical to a missing key (getRelation returns 'neutral' for both),
  // so the fallback path deletes the entry rather than writing 'neutral'
  // back. Without this, every pair that ever exited a war/pact/
  // vassalage leaves a ghost 'neutral' entry that's copied by every
  // structuredClone — the same unbounded-growth shape #83 fixed for
  // sentiment. See setRelation in actions/_helpers for the twin guard.
  for (const key of Object.keys(relations)) {
    const cur = relations[key];
    if (cur === 'war' && !liveWars.has(key)) {
      delete relations[key];
      continue;
    }
    if (cur === 'vassal' || cur === 'overlord' || cur === 'overlord_of') {
      // 'overlord_of' is what DEMAND_VASSALAGE acceptance stores today;
      // the older strings are accepted for backwards compatibility with
      // any persisted state.
      if (!liveVassalages.has(key)) delete relations[key];
      continue;
    }
    if (cur === 'non_aggression' && !livePacts.has(key)) {
      delete relations[key];
    }
  }
}

// — dispute reconciliation ——————————————————————————
//
// CLAIM_HEX_DISPUTE pushes a {claimant, holder, hexId, ...} record into
// diplomacy.disputes. The validator confirms `hex.owner === target` at
// propose time, but the entry is never re-checked against subsequent
// ownership changes. If the hex is ceded to the claimant via CEDE_HEX,
// to a third party, deleted, or otherwise changes hands, the dispute
// stays in the ledger with a stale holder and surfaces in RelationsView
// (src/components/game/diplomacy/RelationsView.jsx:366) as a claim that
// no longer maps to reality. There is no LIFT_DISPUTE action and
// disputes is not in EXPIRING_COLLECTIONS, so these stale entries
// persist for the life of the game.
//
// Drop any entry whose hex is missing or whose current owner has
// diverged from d.holder. Entries where hex.owner still === holder are
// kept as-is. Identity-stable when nothing is dropped (filter only
// reassigns if we actually shrunk the list), mirroring the pruner
// pattern elsewhere in this module.

function reconcileDisputes(state) {
  const list = state.diplomacy?.disputes;
  if (!Array.isArray(list) || list.length === 0) return;
  const hexes = state.hexes || {};
  let dropped = 0;
  const kept = [];
  for (const d of list) {
    const hex = hexes[d.hexId];
    // Hex deleted, or ownership moved off the holder (including to the
    // claimant via CEDE_HEX) — the dispute no longer describes reality.
    if (!hex || hex.owner !== d.holder) {
      dropped++;
      continue;
    }
    kept.push(d);
  }
  if (dropped > 0) state.diplomacy.disputes = kept;
}

// — blockade lift ———————————————————————————————————

function unsuspendTradeRoutes(state, turn) {
  const routes = state.diplomacy?.tradeRoutes;
  if (!Array.isArray(routes)) return;
  for (const r of routes) {
    if (r.suspendedUntilTurn != null && r.suspendedUntilTurn <= turn) {
      delete r.suspendedUntilTurn;
    }
  }
}
