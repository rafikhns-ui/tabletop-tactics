// Personality registry. Lazy-friendly: one file per faction,
// one import to aggregate. Keeps edits surgical.

import ruskel from './ruskel';
import silverUnion from './silver_union';
import tlalocayotlan from './tlalocayotlan';
import gojeon from './gojeon';
import oakhaven from './oakhaven';
import inuvak from './inuvak';
import icebound from './icebound';
import onishiman from './onishiman';
import kadjimaran from './kadjimaran';
import nimrudan from './nimrudan';
import kintei from './kintei';
import republic from './republic';
import sultanate from './sultanate';

const all = [
  ruskel,
  silverUnion,
  tlalocayotlan,
  gojeon,
  oakhaven,
  inuvak,
  icebound,
  onishiman,
  kadjimaran,
  nimrudan,
  kintei,
  republic,
  sultanate,
];

export const PERSONALITIES = Object.fromEntries(
  all.map((p) => [p.factionId, p]),
);

/**
 * Safe lookup. Returns null instead of throwing if a faction has no
 * authored personality yet (during vertical slice, some will).
 */
export function getPersonality(factionId) {
  return PERSONALITIES[factionId] || null;
}

/**
 * Flat summary — for the inbox UI, so the player can see at a glance
 * who they can have rich conversations with.
 */
export function listAuthoredPersonalities() {
  return all.map((p) => ({
    factionId: p.factionId,
    leaderName: p.leaderName,
    title: p.title,
  }));
}
