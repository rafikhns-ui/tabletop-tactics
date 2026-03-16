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
export const FACTIONS = {
  onishiman: {
    id: 'onishiman', name: 'Onishiman Empire', color: '#8b1a1a', emoji: '🐉',
    description: 'Ruthless dark-feudalists, masters of siege and shadow.',
    specialRule: 'Must complete at least 1 Military objective to win.',
    bonusResource: 'gold',
  },
  sultanate: {
    id: 'sultanate', name: 'Blue Moon Sultanate', color: '#1a5a8b', emoji: '🌙',
    description: 'Peaceful theologians and engineers, strong in spiritual and defensive play.',
    specialRule: 'Cannot attack neutral territories. +1 SP per turn.',
    bonusResource: 'wheat',
  },
  republic: {
    id: 'republic', name: 'Hestian Republic', color: '#1a7a5a', emoji: '⚓',
    description: 'Naval power with powerful trade options and diplomatic reach.',
    specialRule: '+1 IP per turn. Naval units cost 1 less gold.',
    bonusResource: 'wood',
  },
  kadjimaran: {
    id: 'kadjimaran', name: 'Kadjimaran Kingdom', color: '#8b6a1a', emoji: '☀️',
    description: 'Mounted warriors, sun-worshippers, proud defenders of tradition.',
    specialRule: 'Cavalry units move 2 territories per turn.',
    bonusResource: 'wheat',
  },
};

// ---- Leaders ----
export const LEADERS = {
  onishiman: [
    { id: 'warlord_kato', name: 'Warlord Kato', passive: '+1 to all attack rolls', disadvantage: 'Cannot sign alliances', type: 'Military' },
    { id: 'shadow_empress', name: 'Shadow Empress', passive: 'Clandestine cards cost 1 less IP', disadvantage: 'Cannot play Spiritual cards', type: 'Clandestine' },
    { id: 'iron_chancellor', name: 'Iron Chancellor', passive: '+2 Gold income per turn', disadvantage: 'Units cost +1 Gold each', type: 'Economic' },
  ],
  sultanate: [
    { id: 'grand_mufti', name: 'Grand Mufti', passive: '+2 SP per turn', disadvantage: 'Cannot recruit Elite units', type: 'Spiritual' },
    { id: 'merchant_sultan', name: 'Merchant Sultan', passive: 'Markets generate +2 Gold', disadvantage: 'Cannot declare war first', type: 'Economic' },
    { id: 'architect_vizier', name: 'Architect Vizier', passive: 'Buildings cost 1 less Wood', disadvantage: 'Cannot play Clandestine cards', type: 'Builder' },
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