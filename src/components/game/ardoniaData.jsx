// ============================================================
// RULERS OF ARDONIA - Core Game Data
// ============================================================

// Territory coordinates are pixel positions on the 720x510 Ardonia map image.
// Each coordinate is placed at the CENTER of the region's label/land mass visible on the map.
export const TERRITORIES = {
  // ── Gojeon Kingdom (far north-west, small mountainous region) ──
  gojeon:          { id: 'gojeon',          name: 'Gojeon',          x: 95,  y: 118, biome: 'forest',   coastal: false, faction: 'kadjimaran' },

  // ── Onishiman Empire (west, large bloc) ──
  onishiman_north: { id: 'onishiman_north', name: 'Onishiman N.',    x: 155, y: 200, biome: 'plains',   coastal: false, faction: 'onishiman' },
  onishiman_south: { id: 'onishiman_south', name: 'Onishiman S.',    x: 145, y: 318, biome: 'plains',   coastal: false, faction: 'onishiman' },
  onishiman_coast: { id: 'onishiman_coast', name: 'Oni. Coast',      x: 95,  y: 418, biome: 'ocean',    coastal: true,  faction: 'onishiman' },

  // ── Inuvak Confederacy (north-central) ──
  inuvak:          { id: 'inuvak',          name: 'Inuvak',          x: 272, y: 88,  biome: 'tundra',   coastal: false, faction: 'kadjimaran' },

  // ── Silver Union (central neutral zone) ──
  silver_union:    { id: 'silver_union',    name: 'Silver Union',    x: 330, y: 245, biome: 'plains',   coastal: false, faction: null },

  // ── Ruskel Federation (north-east) ──
  ruskel:          { id: 'ruskel',          name: 'Ruskel Fed.',     x: 445, y: 138, biome: 'tundra',   coastal: false, faction: 'kadjimaran' },

  // ── Icebound Horde (far north-east) ──
  icebound:        { id: 'icebound',        name: 'Icebound',        x: 590, y: 72,  biome: 'tundra',   coastal: false, faction: 'kadjimaran' },

  // ── Kadjimaran Kingdom (central) ──
  kadjimaran_n:    { id: 'kadjimaran_n',    name: 'Kadjimaran N.',   x: 475, y: 225, biome: 'desert',   coastal: false, faction: 'kadjimaran' },
  kadjimaran_s:    { id: 'kadjimaran_s',    name: 'Kadjimaran S.',   x: 460, y: 335, biome: 'desert',   coastal: false, faction: 'kadjimaran' },

  // ── Republic of Oakhaven (east, forest) ──
  oakhaven:        { id: 'oakhaven',        name: 'Oakhaven',        x: 618, y: 215, biome: 'forest',   coastal: false, faction: 'republic' },

  // ── Scorched Lands (far east, desolate) ──
  scorched:        { id: 'scorched',        name: 'Scorched Lands',  x: 686, y: 310, biome: 'desert',   coastal: false, faction: null },

  // ── Nimrudan Empire (south-east) ──
  nimrudan_n:      { id: 'nimrudan_n',      name: 'Nimrudan N.',     x: 588, y: 335, biome: 'mountain', coastal: false, faction: 'sultanate' },
  nimrudan_s:      { id: 'nimrudan_s',      name: 'Nimrudan S.',     x: 638, y: 422, biome: 'desert',   coastal: true,  faction: 'sultanate' },

  // ── Greater Kintei (centre-south) ──
  kintei:          { id: 'kintei',          name: 'Kintei',          x: 308, y: 385, biome: 'plains',   coastal: true,  faction: 'onishiman' },

  // ── Hestia (south-central, republic heartland) ──
  hestia:          { id: 'hestia',          name: 'Hestia',          x: 478, y: 438, biome: 'ocean',    coastal: true,  faction: 'republic' },

  // ── Moor Sultanate (far south-east) ──
  moor_sultanate:  { id: 'moor_sultanate',  name: 'Moor Sultanate',  x: 596, y: 476, biome: 'desert',   coastal: true,  faction: 'sultanate' },

  // ── Tlalocayotlan League (south-west, coastal) ──
  tlalocayotlan:   { id: 'tlalocayotlan',   name: 'Tlalocayotlan',   x: 180, y: 482, biome: 'forest',   coastal: true,  faction: 'republic' },
};

export const ADJACENCY = {
  gojeon:          ['inuvak', 'onishiman_north'],
  inuvak:          ['gojeon', 'ruskel', 'onishiman_north', 'silver_union'],
  ruskel:          ['inuvak', 'icebound', 'kadjimaran_n', 'oakhaven'],
  icebound:        ['ruskel', 'oakhaven'],
  onishiman_north: ['gojeon', 'inuvak', 'onishiman_south', 'silver_union'],
  onishiman_south: ['onishiman_north', 'onishiman_coast', 'kintei', 'silver_union'],
  onishiman_coast: ['onishiman_south', 'tlalocayotlan', 'kintei'],
  silver_union:    ['inuvak', 'onishiman_north', 'onishiman_south', 'kadjimaran_n', 'kintei'],
  kadjimaran_n:    ['ruskel', 'silver_union', 'kadjimaran_s', 'oakhaven'],
  kadjimaran_s:    ['kadjimaran_n', 'hestia', 'nimrudan_n', 'kintei'],
  oakhaven:        ['ruskel', 'icebound', 'kadjimaran_n', 'nimrudan_n', 'scorched'],
  nimrudan_n:      ['oakhaven', 'kadjimaran_s', 'nimrudan_s', 'scorched'],
  nimrudan_s:      ['nimrudan_n', 'moor_sultanate', 'hestia'],
  scorched:        ['oakhaven', 'nimrudan_n'],
  kintei:          ['onishiman_south', 'onishiman_coast', 'silver_union', 'kadjimaran_s', 'hestia', 'tlalocayotlan'],
  hestia:          ['kadjimaran_s', 'kintei', 'nimrudan_s', 'moor_sultanate'],
  moor_sultanate:  ['hestia', 'nimrudan_s'],
  tlalocayotlan:   ['onishiman_coast', 'kintei'],
};

export const BIOME_COLORS = {
  mountain: '#6a5e50',
  tundra:   '#92aabb',
  forest:   '#3d6e3d',
  desert:   '#b8942e',
  ocean:    '#2e5e8a',
  plains:   '#7a9a3a',
};

export const BIOME_ICONS = {
  mountain: '⛰️', tundra: '❄️', forest: '🌲',
  desert: '🏜️', ocean: '🌊', plains: '🌾',
};

// ---- Factions ----
// playable: true = selectable by human/AI players; false = neutral territory holder only
export const FACTIONS = {
  // ── Western Continent (Mangian) ──
  gojeon: {
    id: 'gojeon', name: 'Gojeon Kingdom', color: '#7b5ea7', emoji: '🌸', playable: true,
    continent: 'Mangian',
    description: 'A jewel of cultural refinement ruled by the Jeon Dynasty, custodians of the Purple Lotus. Protected by the Hwrogan — elite mounted soldiers who are also guardians of art and intellect.',
    specialRule: 'Hwrogan cavalry cost 1 less Gold. +1 IP per turn from cultural prestige.',
    bonusResource: 'ip',
  },
  onishiman: {
    id: 'onishiman', name: 'Onishiman Empire', color: '#8b1a1a', emoji: '🐉', playable: true,
    continent: 'Mangian',
    description: 'A formidable southern domain ruled by the Dark Sun emperor. The secretive Order of Shadowfell guides its pursuit of a utopian society through territorial conquest and dark arts.',
    specialRule: 'Must complete at least 1 Military objective to win. Reality-bending grants +1 attack die.',
    bonusResource: 'gold',
  },
  tlalocayotlan: {
    id: 'tlalocayotlan', name: 'Tlalocayotlan League', color: '#c0392b', emoji: '🦎', playable: true,
    continent: 'Mangian',
    description: 'A confederation of city-states inspired by Mesoamerican civilizations, ruled by a divinely-chosen council. They revere the Great Lizard and use ritual reality-bending concoctions in battle.',
    specialRule: 'Ritual cards cost 1 less SP. +1 SP per turn from ceremonial rites.',
    bonusResource: 'sp',
  },
  kintei: {
    id: 'kintei', name: 'Greater Kintei', color: '#d35400', emoji: '🐲', playable: true,
    continent: 'Mangian',
    description: 'A coalition of tribes who fled Onishiman persecution and settled behind a Great Wall. Masters of engineering, black powder, and dragon-granted reality bending from their Eternal Dragon ancestors.',
    specialRule: 'Siege Engines cost 1 less Wood. Great Wall grants +2 defense in home territories.',
    bonusResource: 'wood',
  },
  inuvak: {
    id: 'inuvak', name: 'Inuvak Confederacy', color: '#5dade2', emoji: '❄️', playable: true,
    continent: 'Mangian',
    description: 'A peaceful northern alliance living in harmony with nature\'s rhythms, inspired by Sami and Inuit peoples. They use reality bending to survive the harsh cold and excel in combat on ice and water.',
    specialRule: 'Must hold at least 1 Spiritual objective. Tundra territories give +1 defense.',
    bonusResource: 'wheat',
  },
  // ── Eastern Continent (Sharqian) ──
  nimrudan: {
    id: 'nimrudan', name: 'Nimrudan Empire', color: '#e67e22', emoji: '🔥', playable: true,
    continent: 'Sharqian',
    description: 'A realm of light, fire, and shadow ruled by Archduke Nim-Ramash from the Obsidian Throne. Spiritually divided between the Cult of Ethiriel (light) and the Cult of the Obsidian Flame (fire supremacy).',
    specialRule: 'Choose a Cult at game start: Ethiriel grants +2 defense; Obsidian Flame grants +2 attack.',
    bonusResource: 'sp',
  },
  republic: {
    id: 'republic', name: 'Republic of Hestia', color: '#1a7a5a', emoji: '⚓', playable: true,
    continent: 'Sharqian',
    description: 'A powerful maritime thalassocracy governed by an elected Senate. Home to the Academy of the Enlightened — a center for global learning. Renowned for its legendary navy and democratic wealth.',
    specialRule: '+1 IP per turn. Naval units cost 1 less Gold.',
    bonusResource: 'wood',
  },
  kadjimaran: {
    id: 'kadjimaran', name: 'Kadjimaran Kingdom', color: '#8b6a1a', emoji: '☀️', playable: true,
    continent: 'Sharqian',
    description: 'An ancient realm of warriors founded by the legendary Koufou. A confederation of tribes renowned for precious metals, reality-bending powers, and fierce resistance against slavers and invaders.',
    specialRule: 'Cavalry units move 2 territories per turn. Must hold at least 1 Spiritual objective.',
    bonusResource: 'wheat',
  },
  oakhaven: {
    id: 'oakhaven', name: 'Republic of Oakhaven', color: '#27ae60', emoji: '🌳', playable: true,
    continent: 'Sharqian',
    description: 'A sanctuary of freedom forged in ancient forests after the Great Cataclysm. The Oakmen use Oakbinding to shape nature and protect their borders against Ruskel Federation industrial expansion.',
    specialRule: 'Forest territories give +2 defense. Oakbinding: forest units cost 1 less Wheat.',
    bonusResource: 'wood',
  },
  ruskel: {
    id: 'ruskel', name: 'Ruskel Federation', color: '#7f8c8d', emoji: '⚙️', playable: true,
    continent: 'Sharqian',
    description: 'A bastion of iron and industry born from unified northern duchies. Allied with the Dwarves of the Ironclad Holds for advanced weaponry and fortifications. Highly disciplined and industrious.',
    specialRule: 'Siege Engines get +2 attack. Buildings cost 1 less Gold due to Dwarven alliances.',
    bonusResource: 'gold',
  },
  sultanate: {
    id: 'sultanate', name: 'Blue Moon Sultanate', color: '#1a5a8b', emoji: '🌙', playable: true,
    continent: 'Sharqian',
    description: 'A holy theocratic state founded by the prophet-commander Ashur as a sanctuary for believers of the One God. A center for enlightenment, justice, and pre-cataclysmic knowledge.',
    specialRule: 'Cannot hold Military objectives. +1 SP per turn from divine devotion.',
    bonusResource: 'sp',
  },
  icebound: {
    id: 'icebound', name: 'Icebound Horde', color: '#aed6f1', emoji: '🌨️', playable: true,
    continent: 'Sharqian',
    description: 'A nomadic confederation that views struggle as sacred trial, driven by the Cult of the Eternal Blizzard. Recently fallen under dark influence of the Order of Shadowfell from the far east.',
    specialRule: 'Units never retreat — fight to the last. Tundra movement costs 0 extra.',
    bonusResource: 'wheat',
  },
  // ── Neutral / Special Entities ──
  silver_union: {
    id: 'silver_union', name: 'Silver Union', color: '#bdc3c7', emoji: '🏦', playable: false,
    continent: 'Neutral',
    description: 'A massive plutocratic conglomerate on the isle of Neutriland. Controls Ardonia\'s financial destiny through the Silver Chartered bank and maintains neutrality via formidable mercenary forces.',
    specialRule: 'Neutral faction — territories defended by mercenaries. Cannot be a player faction.',
    bonusResource: 'gold',
  },
  shadowfell: {
    id: 'shadowfell', name: 'Order of Shadowfell', color: '#2c2c54', emoji: '🕯️', playable: false,
    continent: 'Neutral',
    description: 'A secretive brotherhood pursuing absolute power through mastery of suffering. Founded by the immortal Man in the Black Hood, they manipulate empires from the shadows to fulfill dark prophecies.',
    specialRule: 'Neutral faction — controls hidden territories. Cannot be a player faction.',
    bonusResource: 'sp',
  },
};

// ---- Leaders ----
export const LEADERS = {
  gojeon: [
    { id: 'jeon_dynasty', name: 'Queen of the Purple Lotus', passive: '+2 IP per turn from cultural prestige', disadvantage: 'Cannot raze buildings', type: 'Diplomatic' },
    { id: 'hwrogan_general', name: 'Hwrogan General', passive: 'Cavalry gets +1 attack and +1 defense', disadvantage: 'Cannot sign trade agreements', type: 'Military' },
    { id: 'court_scholar', name: 'Grand Court Scholar', passive: 'All Spiritual cards cost 1 less SP', disadvantage: 'Cannot play Clandestine cards', type: 'Spiritual' },
  ],
  onishiman: [
    { id: 'warlord_kato', name: 'Warlord Kato', passive: '+1 to all attack rolls', disadvantage: 'Cannot sign alliances', type: 'Military' },
    { id: 'shadow_empress', name: 'Shadow Empress', passive: 'Clandestine cards cost 1 less IP', disadvantage: 'Cannot play Spiritual cards', type: 'Clandestine' },
    { id: 'iron_chancellor', name: 'Iron Chancellor', passive: '+2 Gold income per turn', disadvantage: 'Units cost +1 Gold each', type: 'Economic' },
  ],
  tlalocayotlan: [
    { id: 'divine_chosen', name: 'The Divine Chosen', passive: '+2 SP per turn from rituals', disadvantage: 'Must spend 1 SP each turn or lose 1 troop', type: 'Spiritual' },
    { id: 'serpent_king', name: 'Serpent King', passive: '+1 attack die in jungle/forest territories', disadvantage: 'Cannot recruit cavalry', type: 'Military' },
    { id: 'council_elder', name: 'High Council Elder', passive: '+1 IP per turn, alliances last 1 extra turn', disadvantage: 'Cannot declare war on allies', type: 'Diplomatic' },
  ],
  kintei: [
    { id: 'dragon_empress', name: 'Dragon Empress', passive: '+1 to all attack rolls, dragon bending active', disadvantage: 'Costs 1 extra SP each turn to maintain', type: 'Military' },
    { id: 'master_engineer', name: 'Master Engineer', passive: 'Siege Engines cost 2 less to build', disadvantage: 'Cannot recruit cavalry', type: 'Economic' },
    { id: 'wall_warden', name: 'Wall Warden', passive: '+3 defense in fortified home territories', disadvantage: 'Cannot attack first; must be attacked', type: 'Defense' },
  ],
  inuvak: [
    { id: 'spirit_walker', name: 'Spirit Walker', passive: '+3 SP per turn, commune with nature spirits', disadvantage: 'Cannot build Barracks or Siege Works', type: 'Spiritual' },
    { id: 'ice_chieftain', name: 'Ice Chieftain', passive: 'All units +1 defense in tundra territories', disadvantage: 'Units cost +1 Wheat in non-tundra', type: 'Military' },
    { id: 'shaman_elder', name: 'Shaman Elder', passive: 'Spiritual cards reveal enemy objectives', disadvantage: 'Cannot play Clandestine cards', type: 'Spiritual' },
  ],
  nimrudan: [
    { id: 'archduke_nim', name: 'Archduke Nim-Ramash', passive: '+1 to all rolls from dual-cult balance', disadvantage: 'Must maintain both temples or lose SP', type: 'Military' },
    { id: 'ethiriel_high_priest', name: 'High Priest of Ethiriel', passive: '+2 defense, divine light shields allies', disadvantage: 'Cannot play Clandestine cards', type: 'Spiritual' },
    { id: 'obsidian_flame_general', name: 'Obsidian Flame General', passive: '+2 attack, fire consumes enemy fortifications', disadvantage: 'Cannot form alliances', type: 'Military' },
  ],
  republic: [
    { id: 'admiral_thessa', name: 'Admiral Thessa', passive: 'Naval units get +2 combat', disadvantage: 'Cavalry costs +2 Gold', type: 'Naval' },
    { id: 'senator_clio', name: 'Senator Clio', passive: '+1 IP per alliance', disadvantage: 'Cannot attack without provocation', type: 'Diplomatic' },
    { id: 'merchant_prince', name: 'Merchant Prince', passive: 'Trade treaties generate +1 extra Gold', disadvantage: 'Cannot play Military cards', type: 'Economic' },
  ],
  kadjimaran: [
    { id: 'sun_king', name: 'Sun King Ardesh', passive: '+2 Wheat per turn', disadvantage: 'Cannot attack during night turns (even)', type: 'Spiritual' },
    { id: 'horse_khan', name: 'Horse Khan Miru', passive: 'Cavalry units cost 1 less Wheat', disadvantage: 'Mines produce -1 Gold', type: 'Military' },
    { id: 'shield_queen', name: 'Shield Queen Tara', passive: '+2 to all defense rolls', disadvantage: 'Cannot attack fortified cities', type: 'Defense' },
  ],
  oakhaven: [
    { id: 'oakbinder_elder', name: 'Oakbinder Elder', passive: 'Forest territories give +3 defense via Oakbinding', disadvantage: 'Cannot burn or raze forests', type: 'Defense' },
    { id: 'freedom_marshal', name: 'Freedom Marshal', passive: '+1 troop per turn in all owned forest territories', disadvantage: 'Cannot occupy non-forest territories without penalty', type: 'Military' },
    { id: 'academy_head', name: 'Head of the Academy', passive: '+2 IP per turn, research unlocks hero discounts', disadvantage: 'Cannot play Clandestine cards', type: 'Diplomatic' },
  ],
  ruskel: [
    { id: 'iron_chancellor_r', name: 'Iron Chancellor', passive: 'Buildings cost 2 less Gold via Dwarven contracts', disadvantage: 'Cavalry cost +2 Gold', type: 'Economic' },
    { id: 'dwarf_marshal', name: 'Dwarf-Marshal', passive: 'Siege Engines get +3 attack', disadvantage: 'Spiritual cards cost +1 SP', type: 'Military' },
    { id: 'industry_magnate', name: 'Industry Magnate', passive: '+2 Gold per turn from industrial output', disadvantage: 'Forest territories produce -1 Wood', type: 'Economic' },
  ],
  sultanate: [
    { id: 'grand_mufti', name: 'Grand Mufti', passive: '+2 SP per turn', disadvantage: 'Cannot recruit Elite units', type: 'Spiritual' },
    { id: 'merchant_sultan', name: 'Merchant Sultan', passive: 'Markets generate +2 Gold', disadvantage: 'Cannot declare war first', type: 'Economic' },
    { id: 'architect_vizier', name: 'Architect Vizier', passive: 'Buildings cost 1 less Wood', disadvantage: 'Cannot play Clandestine cards', type: 'Builder' },
  ],
  icebound: [
    { id: 'blizzard_khan', name: 'Blizzard Khan', passive: 'Units never retreat; +1 attack from fanaticism', disadvantage: 'Cannot sign any alliances or truces', type: 'Military' },
    { id: 'cult_prophet', name: 'Eternal Blizzard Prophet', passive: '+2 SP per turn, shadow rituals empower troops', disadvantage: 'Must attack every turn or lose 2 SP', type: 'Spiritual' },
    { id: 'shadowfell_champion', name: 'Shadowfell Champion', passive: 'Clandestine cards cost 0 IP', disadvantage: 'Loses 1 territory to Shadowfell influence each 3 turns', type: 'Clandestine' },
  ],
};

// ---- Heroes ----
export const HEROES = {
  // Universal heroes (available to all)
  spy_mira: { id: 'spy_mira', name: 'Mira the Shadow', type: 'Spy', stealth: 4, charisma: 2, force: 1, arcana: 1, cost: { gold: 3 }, ability: 'Reveal one enemy objective type', faction: null },
  warrior_bran: { id: 'warrior_bran', name: 'Bran Ironhand', type: 'Warrior', stealth: 1, charisma: 1, force: 5, arcana: 0, cost: { gold: 4 }, ability: '+3 to one attack roll this turn', faction: null },
  diplomat_lyra: { id: 'diplomat_lyra', name: 'Lyra Silvertongue', type: 'Diplomat', stealth: 1, charisma: 5, force: 1, arcana: 1, cost: { gold: 3, ip: 1 }, ability: 'Force one trade treaty negotiation', faction: null },
  mage_zel: { id: 'mage_zel', name: 'Zel the Arcane', type: 'Mage', stealth: 2, charisma: 2, force: 1, arcana: 5, cost: { gold: 3, sp: 2 }, ability: '+2 SP immediately', faction: null },
  strategist_oryn: { id: 'strategist_oryn', name: 'Oryn Dawnblade', type: 'Strategist', stealth: 2, charisma: 3, force: 3, arcana: 2, cost: { gold: 5 }, ability: 'Move one friendly unit twice this turn', faction: null },
  healer_seri: { id: 'healer_seri', name: 'Seri the Healer', type: 'Healer', stealth: 1, charisma: 3, force: 1, arcana: 3, cost: { gold: 3 }, ability: 'Restore 2 troops to any friendly territory', faction: null },
};

// ---- Objectives ----
export const OBJECTIVES = [
  { id: 'conquer_3', category: 'Military', text: 'Control 3 more territories than your starting count', secret: true },
  { id: 'destroy_capital', category: 'Military', text: 'Capture an enemy capital territory', secret: true },
  { id: 'fortified_city', category: 'Military', text: 'Control 2 mountain territories', secret: true },
  { id: 'amass_gold', category: 'Economic', text: 'Accumulate 20 Gold in your treasury', secret: true },
  { id: 'trade_agreements', category: 'Economic', text: 'Hold 2 active trade agreements', secret: true },
  { id: 'upgrade_3_buildings', category: 'Economic', text: 'Upgrade 3 of your starting buildings to level 2', secret: true },
  { id: 'form_alliance', category: 'Political', text: 'Form 1 alliance with another player', secret: true },
  { id: 'ip_dominance', category: 'Political', text: 'Accumulate 8 Influence Points', secret: true },
  { id: 'summon_avatar', category: 'Spiritual', text: 'Summon an Avatar once', secret: true },
  { id: 'sp_accumulate', category: 'Spiritual', text: 'Accumulate 10 Spiritual Points', secret: true },
];

// ---- Building Definitions ----
export const BUILDING_DEFS = {
  // Starting buildings (every player has these)
  mine:     { id: 'mine',     name: 'Mine',      emoji: '⛏️',  starting: true, maxLevel: 3, upgradeBase: { gold: 3, wood: 2 }, effect: 'gold', effectPerLevel: 1, description: '+1 Gold/turn per level' },
  sawmill:  { id: 'sawmill',  name: 'Sawmill',   emoji: '🪵',  starting: true, maxLevel: 3, upgradeBase: { gold: 2, wood: 2 }, effect: 'wood', effectPerLevel: 1, description: '+1 Wood/turn per level' },
  field:    { id: 'field',    name: 'Field',     emoji: '🌾',  starting: true, maxLevel: 3, upgradeBase: { gold: 2, wheat: 1 }, effect: 'wheat', effectPerLevel: 1, description: '+1 Wheat/turn per level' },
  treasury: { id: 'treasury', name: 'Treasury',  emoji: '🏦',  starting: true, maxLevel: 3, upgradeBase: { gold: 4, wood: 3 }, effect: 'storage', effectPerLevel: 5, description: '+5 max resource storage per level' },
  // Constructible
  barracks:  { id: 'barracks',  name: 'Barracks',       emoji: '⚔️',  starting: false, cost: { gold: 5, wood: 3 }, description: 'Recruit Infantry & Elite units' },
  stables:   { id: 'stables',   name: 'Stables',         emoji: '🐴',  starting: false, cost: { gold: 4, wood: 3, wheat: 2 }, description: 'Recruit Cavalry units' },
  archerytower: { id: 'archerytower', name: 'Archery Tower', emoji: '🏹', starting: false, cost: { gold: 4, wood: 4 }, description: 'Recruit Ranged units' },
  temple:    { id: 'temple',    name: 'Temple',          emoji: '⛩️',  starting: false, cost: { gold: 6, wood: 3, wheat: 2 }, maxLevel: 3, effect: 'sp', effectPerLevel: 1, description: '+1 SP/turn, Avatar summoning' },
  market:    { id: 'market',    name: 'Market',          emoji: '🏪',  starting: false, cost: { gold: 5, wood: 4 }, effect: 'gold', description: '+1 Gold/turn, enables Trade' },
  shipyard:  { id: 'shipyard',  name: 'Naval Shipyard',  emoji: '⚓',  starting: false, cost: { gold: 6, wood: 6 }, description: 'Recruit Naval units (coastal only)' },
  siegeworks:{ id: 'siegeworks',name: 'Siege Works',     emoji: '🏗️',  starting: false, cost: { gold: 5, wood: 5 }, description: 'Recruit Siege Engines' },
};

// ---- Unit Definitions ----
export const UNIT_DEFS = {
  infantry:   { id: 'infantry',   name: 'Infantry',     emoji: '🗡️',  dice: 6,  cost: { gold: 2, wheat: 1 }, canCapture: true,  requires: 'barracks',  description: 'Basic melee unit' },
  ranged:     { id: 'ranged',     name: 'Ranged',       emoji: '🏹',  dice: 6,  cost: { gold: 2, wood: 1 },  canCapture: false, requires: 'archerytower', description: 'Attacks from adjacent tile' },
  cavalry:    { id: 'cavalry',    name: 'Cavalry',      emoji: '🐴',  dice: 12, cost: { gold: 3, wheat: 2 }, canCapture: true,  requires: 'stables',   moves: 2, description: 'Moves 2 spaces, fast attack' },
  elite:      { id: 'elite',      name: 'Elite Guard',  emoji: '⚡',  dice: 20, cost: { gold: 5, wheat: 2 }, canCapture: true,  requires: 'barracks',  description: 'Powerful frontline troops' },
  siege:      { id: 'siege',      name: 'Siege Engine', emoji: '🏗️',  dice: 12, cost: { gold: 4, wood: 4 },  canCapture: false, requires: 'siegeworks', description: 'Required to attack fortified cities' },
  naval:      { id: 'naval',      name: 'Warship',      emoji: '⛵',  dice: 12, cost: { gold: 5, wood: 5 },  canCapture: false, requires: 'shipyard',  description: 'Sea movement and blockades' },
};

// ---- Action Cards ----
export const ACTION_CARDS = [
  { id: 'sabotage',    name: 'Sabotage',        category: 'Clandestine', cost: { gold: 2, ip: 2 }, heroStat: 'stealth', effect: 'Disable one enemy building for 2 turns', emoji: '💣' },
  { id: 'assassinate', name: 'Assassination',   category: 'Clandestine', cost: { gold: 3, ip: 3 }, heroStat: 'stealth', effect: 'Imprison enemy hero for 2 turns', emoji: '🗡️' },
  { id: 'negotiate',   name: 'Negotiation',     category: 'Diplomacy',   cost: { gold: 1, ip: 2 }, heroStat: 'charisma', effect: 'Force a trade treaty or truce', emoji: '🤝' },
  { id: 'spy',         name: 'Espionage',       category: 'Clandestine', cost: { gold: 2, ip: 1 }, heroStat: 'stealth', effect: 'Reveal one enemy objective type', emoji: '🕵️' },
  { id: 'divine_shield', name: 'Divine Shield', category: 'Spiritual',   cost: { gold: 1, sp: 2 }, heroStat: 'arcana', effect: '+3 defense rolls until next turn', emoji: '🛡️' },
  { id: 'faith_surge', name: 'Faith Surge',     category: 'Spiritual',   cost: { gold: 2, sp: 1 }, heroStat: 'arcana', effect: 'Gain +3 SP immediately', emoji: '✨' },
  { id: 'trade_deal',  name: 'Trade Agreement', category: 'Diplomacy',   cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Sign a trade agreement: +2 Gold/turn for 3 turns', emoji: '📜' },
  { id: 'rally',       name: 'War Rally',       category: 'Military',    cost: { gold: 3, wheat: 2 }, heroStat: 'force', effect: '+2 to all attack rolls this turn', emoji: '⚔️' },
];

// ---- Event Cards ----
export const EVENT_CARDS = [
  { id: 'famine', name: 'Great Famine', effect: 'All players lose 2 Wheat. Units without supply lose 1 troop.', emoji: '🌵', duration: 1 },
  { id: 'plague', name: 'Plague of Ashvale', effect: 'All players lose 1 hero use this turn.', emoji: '☠️', duration: 1 },
  { id: 'gold_rush', name: 'Gold Rush', effect: 'All players gain +3 Gold immediately.', emoji: '💰', duration: 0 },
  { id: 'peace_treaty', name: 'Divine Peace', effect: 'No attacks may be declared this turn by anyone.', emoji: '🕊️', duration: 1 },
  { id: 'revolution', name: 'Revolution!', effect: 'Each player must pay 3 Gold or lose control of one territory.', emoji: '🔥', duration: 0 },
  { id: 'spiritual_surge', name: 'Celestial Surge', effect: 'All players gain +2 SP. Avatars +1 duration.', emoji: '🌠', duration: 0 },
  { id: 'economic_crisis', name: 'Economic Crisis', effect: 'All players lose 3 Gold. Markets produce -1 Gold for 2 turns.', emoji: '📉', duration: 2 },
  { id: 'mercenary_wave', name: 'Mercenary Wave', effect: 'Any player may recruit 1 free Infantry unit this turn.', emoji: '⚔️', duration: 0 },
];

// ---- Avatar Definitions ----
export const AVATARS = {
  onishiman: [
    { id: 'shadow_dragon', name: 'Shadow Dragon', tier: 'Lesser', cost: { sp: 6, crystals: 2 }, templeLevel: 1, duration: 2, passive: 'All friendly units +1 attack', active: 'Destroy 1 enemy unit in adjacent territory', emoji: '🐲' },
    { id: 'death_incarnate', name: 'Death Incarnate', tier: 'Greater', cost: { sp: 12, crystals: 4 }, templeLevel: 3, duration: 3, passive: 'Enemy units in range roll -2', active: 'Capture 1 territory without combat', emoji: '💀' },
  ],
  sultanate: [
    { id: 'moon_guardian', name: 'Moon Guardian', tier: 'Lesser', cost: { sp: 6, crystals: 2 }, templeLevel: 1, duration: 2, passive: '+2 SP per turn', active: 'Negate one enemy attack this turn', emoji: '🌙' },
    { id: 'celestial_architect', name: 'Celestial Architect', tier: 'Greater', cost: { sp: 12, crystals: 4 }, templeLevel: 3, duration: 3, passive: 'All buildings produce +1 extra', active: 'Instantly build one free building', emoji: '⭐' },
  ],
  republic: [
    { id: 'sea_titan', name: 'Sea Titan', tier: 'Lesser', cost: { sp: 6, crystals: 2 }, templeLevel: 1, duration: 2, passive: 'Naval units +3 combat', active: 'Blockade one coastal territory', emoji: '🌊' },
  ],
  kadjimaran: [
    { id: 'sun_avatar', name: 'Solaris', tier: 'Lesser', cost: { sp: 6, crystals: 2 }, templeLevel: 1, duration: 2, passive: '+2 Wheat production per turn', active: '+4 to one cavalry attack this turn', emoji: '☀️' },
  ],
};