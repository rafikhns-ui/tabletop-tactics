// Victory conditions.
//
// Two paths to victory are currently supported:
//
//   1) Hegemon (territorial):
//      - Dominant share of all owned hexes, OR
//      - Every rival reduced to ≤ HEGEMON_REMNANT_HEXES hexes while the
//        winner holds at least HEGEMON_MINIMUM_HEXES.
//
//   2) Mercantile Dominance (economic):
//      - The faction has active trade routes reaching at least
//        MERC_UNIQUE_PARTNERS distinct other factions, AND
//      - Holds at least MERC_GOLD_THRESHOLD gold, AND
//      - Has sustained both conditions for MERC_CONSECUTIVE_TURNS
//        consecutive end-of-turn checks.
//
// Both checks are pure and stateless aside from the merc-streak counter
// we stash under gameState.diplomacy.mercStreaks. The turn hook owns
// mutating that counter so victory.js itself stays read-only friendly.

export const HEGEMON_HEX_FRACTION = 0.6;
export const HEGEMON_REMNANT_HEXES = 3;
export const HEGEMON_MINIMUM_HEXES = 18;

export const MERC_UNIQUE_PARTNERS = 6;
export const MERC_GOLD_THRESHOLD = 300;
export const MERC_CONSECUTIVE_TURNS = 3;

/**
 * Returns the winning faction id, or null if no one has won this turn.
 * Hegemon check only — for the mercantile path, see
 * {@link checkMercantileVictory}.
 */
export function checkHegemonVictory(gameState) {
  const hexes = gameState?.hexes || {};
  const ownedCounts = new Map();
  let totalOwned = 0;

  for (const h of Object.values(hexes)) {
    if (!h?.owner) continue;
    ownedCounts.set(h.owner, (ownedCounts.get(h.owner) || 0) + 1);
    totalOwned++;
  }
  if (totalOwned === 0) return null;

  // Path 1: dominant share.
  for (const [factionId, n] of ownedCounts) {
    if (n / totalOwned >= HEGEMON_HEX_FRACTION) {
      return { winner: factionId, path: 'dominant_share', n, totalOwned };
    }
  }

  // Path 2: rivals reduced to remnants.
  const strong = [];
  for (const [factionId, n] of ownedCounts) {
    if (n > HEGEMON_REMNANT_HEXES) strong.push({ factionId, n });
  }
  if (strong.length === 1 && strong[0].n >= HEGEMON_MINIMUM_HEXES) {
    return {
      winner: strong[0].factionId,
      path: 'rivals_reduced',
      n: strong[0].n,
      totalOwned,
    };
  }

  return null;
}

/**
 * Returns `{ factionId, partners, gold, streak }` for each faction that
 * currently satisfies the mercantile preconditions, along with their
 * current streak length. Consumers advance the streak before reading.
 */
export function evaluateMercantileStanding(gameState) {
  const routes = gameState?.diplomacy?.tradeRoutes || [];
  const players = gameState?.players || [];
  const streaks = gameState?.diplomacy?.mercStreaks || {};
  const turnNow = gameState?.turn || 0;

  const partnersByFaction = new Map();
  for (const r of routes) {
    // A route is 'live' if it has not expired and is not currently suspended
    // by a blockade.
    const expired = r.expiresOnTurn != null && r.expiresOnTurn <= turnNow;
    const suspended =
      r.suspendedUntilTurn != null && r.suspendedUntilTurn > turnNow;
    if (expired || suspended) continue;
    push(partnersByFaction, r.a, r.b);
    push(partnersByFaction, r.b, r.a);
  }

  const out = [];
  for (const player of players) {
    const fid = player.faction?.id || player.factionId || player.id;
    if (!fid) continue;
    const gold = resolveGold(player);
    const partners = partnersByFaction.get(fid)?.size || 0;
    const streak = streaks[fid] || 0;
    out.push({ factionId: fid, partners, gold, streak });
  }
  return out;
}

/**
 * Pure check against the current standing snapshot. Returns null or a
 * { winner, path:'mercantile_dominance', partners, gold, streak } result.
 * Expects streaks to already reflect the current turn.
 */
export function checkMercantileVictory(standings) {
  for (const s of standings || []) {
    if (
      s.partners >= MERC_UNIQUE_PARTNERS &&
      s.gold >= MERC_GOLD_THRESHOLD &&
      s.streak >= MERC_CONSECUTIVE_TURNS
    ) {
      return {
        winner: s.factionId,
        path: 'mercantile_dominance',
        partners: s.partners,
        gold: s.gold,
        streak: s.streak,
      };
    }
  }
  return null;
}

/**
 * Human-readable announcement for the UI.
 *
 * @param {{ winner: string, path: string, n?: number, totalOwned?: number, partners?: number, gold?: number, streak?: number } | null} result
 * @param {(factionId: string) => ({ leaderName?: string } | null)} [personalityResolver]
 */
export function formatVictoryAnnouncement(result, personalityResolver = () => null) {
  if (!result) return null;
  const p = personalityResolver(result.winner);
  const who = p ? `${p.leaderName} of ${result.winner}` : result.winner;
  if (result.path === 'dominant_share') {
    return `${who} stands hegemon — commanding ${result.n} of ${result.totalOwned} hexes.`;
  }
  if (result.path === 'rivals_reduced') {
    return `${who} stands hegemon — every rival humbled to ashes.`;
  }
  if (result.path === 'mercantile_dominance') {
    return `${who} wins through Mercantile Dominance — ${result.partners} live trade routes, ${result.gold}g in the coffers, ${result.streak} turns unchallenged.`;
  }
  return `${who} is victorious.`;
}

// — helpers ———————————————————————————————————————

function push(map, key, value) {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(value);
}

function resolveGold(player) {
  // Multiple shapes have appeared in the codebase during the port.
  if (player?.resources?.gold != null) return player.resources.gold;
  if (player?.faction?.resources?.gold != null)
    return player.faction.resources.gold;
  if (player?.gold != null) return player.gold;
  return 0;
}
