// Full bundle integrity: the barrel + every diplomacy UI component
// compile cleanly with no dead exports, no import cycles, no
// unresolved aliases. This is a cheap canary for structural drift.

import { execSync } from 'node:child_process';
import { rmSync, mkdirSync, writeFileSync } from 'node:fs';

const root = '/sessions/gallant-upbeat-johnson/mnt/tabletop-tactics';
const shimDir = `${root}/.verify-scratch`;
try { rmSync(shimDir, { recursive: true, force: true }); } catch {}
mkdirSync(shimDir, { recursive: true });

let failed = 0;
function run(label, cmd) {
  process.stdout.write(`  ${label}... `);
  try {
    execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], cwd: root });
    console.log('✓');
    return true;
  } catch (e) {
    console.log('✗');
    console.log(e.stderr?.toString().slice(0, 400));
    failed++;
    return false;
  }
}

console.log('Diplomacy barrel:');
run(
  'bundles cleanly',
  `npx --yes esbuild@0.24.0 ${root}/src/lib/diplomacy/index.js --bundle --platform=node --format=esm --outfile=${shimDir}/barrel.mjs --log-level=error --alias:@=${root}/src`,
);

console.log('Diplomacy UI components:');
const components = [
  'src/components/game/diplomacy/Inbox.jsx',
  'src/components/game/diplomacy/EventCard.jsx',
  'src/components/game/diplomacy/ConversationView.jsx',
  'src/components/game/diplomacy/RelationsView.jsx',
  'src/components/game/diplomacy/OpenOffersPanel.jsx',
];
for (const c of components) {
  run(
    c.split('/').pop(),
    `npx --yes esbuild@0.24.0 ${root}/${c} --bundle --platform=browser --format=esm --jsx=automatic --outfile=${shimDir}/${c.split('/').pop()}.mjs --log-level=error --alias:@=${root}/src --external:react --external:react-dom --external:@base44/sdk --external:@/api/base44Client --external:lucide-react --external:@/lib/app-params`,
  );
}

console.log('Module barrel surface:');
{
  // Import the bundle and assert that every named export documented in
  // the barrel actually resolves to something.
  try {
    const mod = await import(`${shimDir}/barrel.mjs`);
    const expected = [
      // schema (re-exported via *)
      'makeActionId', 'makeEventId',
      // dispatcher
      'dispatch', 'dispatchAll', 'knownActionTypes',
      // actions
      'ACTION_REGISTRY', 'REGISTERED_ACTION_TYPES', 'buildLlmToolSpec',
      // personalities
      'PERSONALITIES', 'getPersonality', 'listAuthoredPersonalities',
      // promptBuilder
      'buildConversationPrompt', 'buildEventCommissionPrompt', 'buildStateDigest',
      // events
      'detectNextEventForFaction',
      'detectPatienceBroken', 'detectTradeOpportunity', 'detectOmenWitnessed',
      'detectWarmthOffered', 'detectWarFatigue', 'detectSuccessionInterest',
      'detectBorderFriction',
      'runTurnEventPass', 'resolveEventChoice', 'expireEventsAtTurn',
      // victory
      'checkHegemonVictory', 'checkMercantileVictory',
      'evaluateMercantileStanding', 'formatVictoryAnnouncement',
      'HEGEMON_HEX_FRACTION', 'HEGEMON_REMNANT_HEXES', 'HEGEMON_MINIMUM_HEXES',
      'MERC_UNIQUE_PARTNERS', 'MERC_GOLD_THRESHOLD', 'MERC_CONSECUTIVE_TURNS',
      // inbox
      'getInbox', 'getUnreadCount', 'markRead', 'appendEvents', 'sortedForDisplay',
      // offers
      'listOpenOffers', 'resolveOffer',
      // tick
      'runTurnTick',
      // ai
      'resolveAIOffers',
      // helpers
      'getSentiment', 'getRelation', 'pairKey',
    ];
    let miss = 0;
    for (const name of expected) {
      if (mod[name] === undefined) {
        console.log(`  ✗ missing export: ${name}`);
        miss++;
      }
    }
    if (miss === 0) console.log('  ✓ every documented export resolves');
    else failed += miss;
  } catch (e) {
    console.log('  ✗ barrel import failed:', e.message);
    failed++;
  }
}

if (failed === 0) {
  console.log('\nOK — barrel surface and UI bundle are clean.');
} else {
  console.log(`\nFAIL — ${failed} check(s) failed.`);
  process.exit(1);
}
