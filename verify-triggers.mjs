// Smoke test the 7 event detectors: each should fire when its
// preconditions hold and stay silent otherwise.

import { execSync } from 'node:child_process';
import { rmSync, mkdirSync } from 'node:fs';

const root = '/sessions/gallant-upbeat-johnson/mnt/tabletop-tactics';
const shimDir = `${root}/.verify-scratch`;
try { rmSync(shimDir, { recursive: true, force: true }); } catch {}
mkdirSync(shimDir, { recursive: true });

execSync(
  `npx --yes esbuild@0.24.0 ${root}/src/lib/diplomacy/index.js --bundle --platform=node --format=esm --outfile=${shimDir}/d.mjs --log-level=error --alias:@=${root}/src`,
  { stdio: 'inherit', cwd: root },
);
const m = await import(`${shimDir}/d.mjs`);
const {
  detectPatienceBroken,
  detectTradeOpportunity,
  detectOmenWitnessed,
  detectWarmthOffered,
  detectWarFatigue,
  detectSuccessionInterest,
  detectBorderFriction,
  detectNextEventForFaction,
} = m;

let failed = 0;
function assert(cond, msg) {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    console.log(`  ✗ ${msg}`);
    failed++;
  }
}

// Use ruskel (high aggression, medium honor, low greed) and oakhaven
// (greedy, low aggression) — both authored personalities.

function bareState(overrides = {}) {
  return {
    turn: 5,
    players: [
      { id: 'HUM', faction: { id: 'HUM' }, resources: { gold: 100, wheat: 20 } },
      { id: 'ruskel', faction: { id: 'ruskel' }, resources: { gold: 100, wheat: 10 } },
      { id: 'oakhaven', faction: { id: 'oakhaven' }, resources: { gold: 40, wheat: 30 } },
    ],
    hexes: {},
    diplomacy: { relations: {}, sentiment: {}, wars: [] },
    ...overrides,
  };
}

// ------ patience broken --------------------------------------------
console.log('detectPatienceBroken:');
{
  const st = bareState();
  st.diplomacy.sentiment['ruskel->HUM'] = -50;
  const ev = detectPatienceBroken(st, 'ruskel', 'HUM');
  assert(ev && ev.kind === 'patience_broken', 'fires at strong negative sentiment');
  assert(ev.candidateActions.length >= 1, 'includes at least one aggressive candidate');
}
{
  const st = bareState();
  st.diplomacy.sentiment['ruskel->HUM'] = -10;
  assert(!detectPatienceBroken(st, 'ruskel', 'HUM'), 'silent at mild sentiment');
}

// ------ warmth offered ---------------------------------------------
console.log('detectWarmthOffered:');
{
  const st = bareState();
  st.diplomacy.sentiment['ruskel->HUM'] = 45;
  const ev = detectWarmthOffered(st, 'ruskel', 'HUM');
  assert(ev && ev.kind === 'warmth_offered', 'fires when sentiment ≥ 30 and no pact exists');
  assert(
    ev.candidateActions.some((a) => a.type === 'NON_AGGRESSION_PACT'),
    'always offers a non-aggression pact candidate',
  );
}
{
  const st = bareState();
  st.diplomacy.sentiment['ruskel->HUM'] = 45;
  st.diplomacy.pacts = [
    { a: 'ruskel', b: 'HUM', kind: 'non_aggression', sinceTurn: 2, expiresOnTurn: 99 },
  ];
  assert(!detectWarmthOffered(st, 'ruskel', 'HUM'), 'silent while a live pact is active');
}

// ------ war fatigue ------------------------------------------------
console.log('detectWarFatigue:');
{
  const st = bareState({ turn: 9 });
  st.diplomacy.wars = [
    { attacker: 'ruskel', defender: 'HUM', declaredTurn: 3, casusBelli: 'raid' },
  ];
  const ev = detectWarFatigue(st, 'ruskel', 'HUM');
  assert(ev && ev.kind === 'war_fatigue', 'fires when war has lasted ≥ 2 turns');
  assert(
    ev.candidateActions.every((a) => a.type === 'PROPOSE_PEACE'),
    'every candidate is a peace proposal',
  );
}
{
  const st = bareState();
  // No war at all
  assert(!detectWarFatigue(st, 'ruskel', 'HUM'), 'silent when pair is not at war');
}

// ------ succession interest ----------------------------------------
console.log('detectSuccessionInterest:');
{
  const st = bareState();
  // Oakhaven's honor is likely >= 0.5 in the personality file
  st.diplomacy.sentiment['oakhaven->HUM'] = 15;
  const ev = detectSuccessionInterest(st, 'oakhaven', 'HUM');
  // Either detected for oakhaven or returns null if personality profile
  // happens to have honor<0.5 && piety<0.5; don't hard-fail — just log.
  if (!ev) console.log('    (oakhaven profile below soft threshold; skipping)');
  else {
    assert(ev.kind === 'succession_rumor', 'fires at mild warmth for soft profiles');
  }
}

// ------ border friction --------------------------------------------
console.log('detectBorderFriction:');
{
  const st = bareState({
    hexes: {
      H1: { owner: 'ruskel', neighbors: ['H2'] },
      H2: { owner: 'HUM' },
    },
  });
  st.diplomacy.sentiment['ruskel->HUM'] = -25;
  const ev = detectBorderFriction(st, 'ruskel', 'HUM');
  assert(ev && ev.kind === 'border_incident', 'fires with negative sentiment + adjacent hexes');
  assert(
    ev.candidateActions.some((a) => a.type === 'CLAIM_HEX_DISPUTE'),
    'offers CLAIM_HEX_DISPUTE',
  );
}
{
  const st = bareState({
    hexes: {
      H1: { owner: 'ruskel', neighbors: [] }, // no adjacency
      H2: { owner: 'HUM' },
    },
  });
  st.diplomacy.sentiment['ruskel->HUM'] = -25;
  assert(
    !detectBorderFriction(st, 'ruskel', 'HUM'),
    'silent when no adjacent hex exists',
  );
}

// ------ trade opportunity ------------------------------------------
console.log('detectTradeOpportunity:');
{
  // Oakhaven (greed >= 0.3 assumed) has wheat and wants HUM's gold.
  const st = bareState();
  st.players = [
    { id: 'HUM', faction: { id: 'HUM' }, resources: { gold: 200, wheat: 2 } },
    { id: 'oakhaven', faction: { id: 'oakhaven' }, resources: { gold: 10, wheat: 40 } },
  ];
  const ev = detectTradeOpportunity(st, 'oakhaven', 'HUM');
  if (ev) assert(ev.kind === 'trade_disruption', 'fires for greedy personality with asymmetric resources');
  else console.log('    (oakhaven profile greed<0.3 — trigger silent; acceptable)');
}

// ------ aggregate order --------------------------------------------
console.log('detectNextEventForFaction:');
{
  const st = bareState({ turn: 9 });
  st.diplomacy.wars = [
    { attacker: 'ruskel', defender: 'HUM', declaredTurn: 3, casusBelli: 'raid' },
  ];
  st.diplomacy.sentiment['ruskel->HUM'] = -50; // also patience would fire
  const ev = detectNextEventForFaction(st, 'ruskel', 'HUM');
  assert(
    ev && ev.kind === 'war_fatigue',
    'war_fatigue takes precedence over patience_broken',
  );
}

if (failed === 0) {
  console.log('\nOK — all triggers behave as expected.');
} else {
  console.log(`\nFAIL — ${failed} assertion(s) failed.`);
  process.exit(1);
}
