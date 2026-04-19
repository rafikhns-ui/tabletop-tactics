// ============================================================
// RULERS OF ARDONIA - Core Game Data
// ============================================================

// Territory coordinates are pixel positions on the 720x510 Ardonia map image.
// Each coordinate is placed at the CENTER of the region's label/land mass visible on the map.
export const TERRITORIES = {
  // ── Gojeon Kingdom (far north-west) ──
  gojeon:          { id: 'gojeon',          name: 'Gojeon',          x: 95,  y: 118, biome: 'forest',   coastal: false, faction: 'gojeon' },
  gojeon_highlands:{ id: 'gojeon_highlands',name: 'Gojeon Highlands',x: 60,  y: 200, biome: 'mountain', coastal: false, faction: 'gojeon' },

  // ── Onishiman Empire (west) ──
  onishiman_north: { id: 'onishiman_north', name: 'Onishiman N.',    x: 155, y: 200, biome: 'plains',   coastal: false, faction: 'onishiman' },
  onishiman_south: { id: 'onishiman_south', name: 'Onishiman S.',    x: 145, y: 318, biome: 'plains',   coastal: false, faction: 'onishiman' },
  onishiman_coast: { id: 'onishiman_coast', name: 'Oni. Coast',      x: 95,  y: 418, biome: 'ocean',    coastal: true,  faction: 'onishiman' },
  onishiman_east:  { id: 'onishiman_east',  name: 'Onishiman E.',    x: 220, y: 265, biome: 'plains',   coastal: false, faction: 'onishiman' },

  // ── Inuvak Confederacy (north-central) ──
  inuvak:          { id: 'inuvak',          name: 'Inuvak',          x: 272, y: 88,  biome: 'tundra',   coastal: false, faction: 'inuvak' },
  inuvak_east:     { id: 'inuvak_east',     name: 'Inuvak E.',       x: 360, y: 68,  biome: 'tundra',   coastal: false, faction: 'inuvak' },

  // ── Silver Union (central neutral zone) ──
  silver_union:    { id: 'silver_union',    name: 'Silver Union',    x: 330, y: 245, biome: 'plains',   coastal: false, faction: null },
  silver_pass:     { id: 'silver_pass',     name: 'Silver Pass',     x: 390, y: 185, biome: 'mountain', coastal: false, faction: null },

  // ── Ruskel Federation (north-east) ──
  ruskel:          { id: 'ruskel',          name: 'Ruskel Fed.',     x: 445, y: 138, biome: 'tundra',   coastal: false, faction: 'ruskel' },
  ruskel_mines:    { id: 'ruskel_mines',    name: 'Ruskel Mines',    x: 510, y: 185, biome: 'mountain', coastal: false, faction: 'ruskel' },

  // ── Icebound Horde (far north-east) ──
  icebound:        { id: 'icebound',        name: 'Icebound',        x: 590, y: 72,  biome: 'tundra',   coastal: false, faction: 'icebound' },
  icebound_wastes: { id: 'icebound_wastes', name: 'Icebound Wastes', x: 660, y: 135, biome: 'tundra',   coastal: false, faction: 'icebound' },

  // ── Kadjimaran Kingdom (central) ──
  kadjimaran_n:    { id: 'kadjimaran_n',    name: 'Kadjimaran N.',   x: 475, y: 225, biome: 'desert',   coastal: false, faction: 'kadjimaran' },
  kadjimaran_s:    { id: 'kadjimaran_s',    name: 'Kadjimaran S.',   x: 460, y: 335, biome: 'desert',   coastal: false, faction: 'kadjimaran' },
  kadjimaran_west: { id: 'kadjimaran_west', name: 'Kadjimaran W.',   x: 400, y: 295, biome: 'desert',   coastal: false, faction: 'kadjimaran' },

  // ── Republic of Oakhaven (east, forest) ──
  oakhaven:        { id: 'oakhaven',        name: 'Oakhaven',        x: 618, y: 215, biome: 'forest',   coastal: false, faction: 'oakhaven' },
  oakhaven_deep:   { id: 'oakhaven_deep',   name: 'Deep Oakhaven',   x: 670, y: 255, biome: 'forest',   coastal: false, faction: 'oakhaven' },

  // ── Scorched Lands (far east, desolate) ──
  scorched:        { id: 'scorched',        name: 'Scorched Lands',  x: 700, y: 340, biome: 'desert',   coastal: false, faction: null },
  scorched_north:  { id: 'scorched_north',  name: 'Scorched North',  x: 700, y: 195, biome: 'desert',   coastal: false, faction: null },

  // ── Nimrudan Empire (south-east) ──
  nimrudan_n:      { id: 'nimrudan_n',      name: 'Nimrudan N.',     x: 588, y: 335, biome: 'mountain', coastal: false, faction: 'nimrudan' },
  nimrudan_s:      { id: 'nimrudan_s',      name: 'Nimrudan S.',     x: 638, y: 422, biome: 'desert',   coastal: true,  faction: 'nimrudan' },
  nimrudan_coast:  { id: 'nimrudan_coast',  name: 'Nimrudan Coast',  x: 700, y: 455, biome: 'ocean',    coastal: true,  faction: 'nimrudan' },

  // ── Greater Kintei (centre-south) ──
  kintei:          { id: 'kintei',          name: 'Kintei',          x: 308, y: 385, biome: 'plains',   coastal: true,  faction: 'kintei' },
  kintei_north:    { id: 'kintei_north',    name: 'Kintei N.',       x: 355, y: 330, biome: 'plains',   coastal: false, faction: 'kintei' },

  // ── Hestia / Republic of Hestia (south-central) ──
  hestia:          { id: 'hestia',          name: 'Hestia',          x: 478, y: 438, biome: 'ocean',    coastal: true,  faction: 'republic' },
  hestia_inner:    { id: 'hestia_inner',    name: 'Hestia Heartland',x: 530, y: 390, biome: 'plains',   coastal: false, faction: 'republic' },

  // ── Blue Moon Sultanate (far south-east) ──
  moor_sultanate:  { id: 'moor_sultanate',  name: 'Moor Sultanate',  x: 596, y: 476, biome: 'desert',   coastal: true,  faction: 'sultanate' },

  // ── Tlalocayotlan League (south-west) ──
  tlalocayotlan:   { id: 'tlalocayotlan',   name: 'Tlalocayotlan',   x: 180, y: 482, biome: 'forest',   coastal: true,  faction: 'tlalocayotlan' },
  tlaloc_north:    { id: 'tlaloc_north',    name: 'Tlaloc N.',       x: 230, y: 430, biome: 'forest',   coastal: false, faction: 'tlalocayotlan' },

  // ── New: Iron Wastes (far west coast) ──
  iron_wastes:     { id: 'iron_wastes',     name: 'Iron Wastes',     x: 48,  y: 320, biome: 'mountain', coastal: true,  faction: null },

  // ── New: Verdant Vale (south-centre) ──
  verdant_vale:    { id: 'verdant_vale',    name: 'Verdant Vale',    x: 260, y: 480, biome: 'forest',   coastal: false, faction: null },
};

export const ADJACENCY = {
  // Gojeon
  gojeon:           ['inuvak', 'onishiman_north', 'gojeon_highlands'],
  gojeon_highlands: ['gojeon', 'onishiman_north', 'iron_wastes'],

  // Onishiman
  onishiman_north:  ['gojeon', 'gojeon_highlands', 'inuvak', 'onishiman_south', 'onishiman_east', 'silver_union'],
  onishiman_south:  ['onishiman_north', 'onishiman_east', 'onishiman_coast', 'kintei', 'silver_union'],
  onishiman_coast:  ['onishiman_south', 'tlalocayotlan', 'kintei', 'iron_wastes'],
  onishiman_east:   ['onishiman_north', 'onishiman_south', 'silver_union', 'kadjimaran_west'],

  // Iron Wastes
  iron_wastes:      ['gojeon_highlands', 'onishiman_coast'],

  // Inuvak
  inuvak:           ['gojeon', 'onishiman_north', 'inuvak_east', 'silver_union'],
  inuvak_east:      ['inuvak', 'ruskel', 'silver_pass'],

  // Silver Union
  silver_union:     ['inuvak', 'onishiman_north', 'onishiman_south', 'onishiman_east', 'silver_pass', 'kadjimaran_west', 'kintei_north'],
  silver_pass:      ['inuvak_east', 'silver_union', 'ruskel_mines', 'kadjimaran_n'],

  // Ruskel
  ruskel:           ['inuvak_east', 'icebound', 'ruskel_mines', 'kadjimaran_n'],
  ruskel_mines:     ['ruskel', 'silver_pass', 'kadjimaran_n', 'oakhaven'],

  // Icebound
  icebound:         ['ruskel', 'icebound_wastes', 'oakhaven'],
  icebound_wastes:  ['icebound', 'oakhaven', 'scorched_north'],

  // Kadjimaran
  kadjimaran_n:     ['ruskel', 'ruskel_mines', 'silver_pass', 'kadjimaran_west', 'kadjimaran_s', 'oakhaven'],
  kadjimaran_s:     ['kadjimaran_n', 'kadjimaran_west', 'hestia_inner', 'nimrudan_n', 'kintei_north'],
  kadjimaran_west:  ['onishiman_east', 'silver_union', 'kadjimaran_n', 'kadjimaran_s', 'kintei_north'],

  // Oakhaven
  oakhaven:         ['ruskel_mines', 'icebound', 'kadjimaran_n', 'oakhaven_deep', 'nimrudan_n'],
  oakhaven_deep:    ['oakhaven', 'scorched_north', 'scorched', 'nimrudan_n'],

  // Scorched Lands
  scorched:         ['oakhaven_deep', 'scorched_north', 'nimrudan_n'],
  scorched_north:   ['icebound_wastes', 'oakhaven_deep', 'scorched'],

  // Nimrudan
  nimrudan_n:       ['oakhaven', 'oakhaven_deep', 'scorched', 'kadjimaran_s', 'hestia_inner', 'nimrudan_s'],
  nimrudan_s:       ['nimrudan_n', 'nimrudan_coast', 'moor_sultanate', 'hestia'],
  nimrudan_coast:   ['nimrudan_s', 'moor_sultanate'],

  // Kintei
  kintei:           ['onishiman_south', 'onishiman_coast', 'kintei_north', 'hestia', 'tlalocayotlan', 'verdant_vale'],
  kintei_north:     ['silver_union', 'kadjimaran_west', 'kadjimaran_s', 'kintei', 'hestia_inner'],

  // Hestia
  hestia:           ['kintei', 'kintei_north', 'hestia_inner', 'nimrudan_s', 'moor_sultanate'],
  hestia_inner:     ['kadjimaran_s', 'kintei_north', 'nimrudan_n', 'nimrudan_s', 'hestia'],

  // Moor Sultanate
  moor_sultanate:   ['hestia', 'nimrudan_s', 'nimrudan_coast'],

  // Tlalocayotlan
  tlalocayotlan:    ['onishiman_coast', 'kintei', 'tlaloc_north', 'verdant_vale'],
  tlaloc_north:     ['tlalocayotlan', 'onishiman_south', 'verdant_vale'],

  // Verdant Vale
  verdant_vale:     ['tlaloc_north', 'tlalocayotlan', 'kintei'],
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

// ---- Terrain Movement Costs ----
// Base cost is 1 movement point per tile
// Additional cost for terrain types (0 = normal, 1+ = extra cost)
export const TERRAIN_MOVEMENT_COSTS = {
  mountain: 1, // +1 cost (mountainous)
  tundra: 0,
  forest: 1, // +1 cost (dense)
  desert: 1, // +1 cost (harsh)
  ocean: 0,
  plains: 0,
};

// ---- Factions ----
// playable: true = selectable by human/AI players; false = neutral territory holder only
// Maps faction IDs (game logic) → nation_id values as stored in gameState.hexes
// (after NATION_TO_FACTION remapping in hexWorldGenerator)
export const FACTION_TO_NATION_ID = {
  gojeon:        'gojeon',
  onishiman:     'onishiman',
  inuvak:        'inuvak',
  ruskel:        'ruskel',
  icebound:      'icebound',
  kadjimaran:    'kadjimaran',
  oakhaven:      'oakhaven',
  nimrudan:      'nimrudan',
  kintei:        'kintei',        // JSON 'kinetic' → remapped to 'kintei'
  republic:      'republic',       // JSON 'hestia'  → remapped to 'republic'
  sultanate:     'sultanate',      // JSON 'azure'   → remapped to 'sultanate'
  tlalocayotlan: 'tlalocayotlan',  // JSON 'ilalocatotlan' → remapped
  silverunion:   'silverunion',    // JSON 'silver'  → remapped to 'silverunion'
  silver_union:  'silverunion',
  shadowfell:    'shadowfell',     // JSON 'shadowsfall' → remapped to 'shadowfell'
};

// Hardcoded capital hex IDs (col,row) per faction, derived from MAP_DATA geography
export const FACTION_CAPITAL_HEX = {
  gojeon:        '10,5',   // center of gejeon territory
  inuvak:        '23,4',   // center of inuvak territory
  ruskel:        '35,7',   // center of ruskel territory
  icebound:      '53,13',  // shadowsfall lower = icebound capital
  oakhaven:      '44,13',  // greenheart territory
  onishiman:     '11,15',  // onishiman territory
  kadjimaran:    '47,7',   // kadjimaran territory
  nimrudan:      '56,11',  // nimrudan territory
  kintei:        '53,11',  // shadowsfall upper = kintei capital
  republic:      '22,12',  // silverunion = republic
  sultanate:     '40,5',   // shadefell lower = sultanate
  tlalocayotlan: '39,4',   // shadefell upper = tlalocayotlan
};

export const FACTIONS = {
  // ── Western Continent (Mangian) ──
  gojeon: {
    id: 'gojeon', name: 'Gojeon Kingdom', color: '#7b5ea7', emoji: '🌸', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d68a471ae_photo-output672.png',
    continent: 'Mangian',
    description: 'A jewel of cultural refinement ruled by the Jeon Dynasty, custodians of the Purple Lotus. Protected by the Hwrogan — elite mounted soldiers who are also guardians of art and intellect.',
    specialRule: 'Hwrogan cavalry cost 1 less Gold. +1 IP per turn from cultural prestige.',
    bonusResource: 'ip',
  },
  onishiman: {
    id: 'onishiman', name: 'Onishiman Empire', color: '#8b1a1a', emoji: '🐉', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/8a875b40d_photo-output.png',
    continent: 'Mangian',
    description: 'A formidable southern domain ruled by the Dark Sun emperor. The secretive Order of Shadowfell guides its pursuit of a utopian society through territorial conquest and dark arts.',
    specialRule: 'Must complete at least 1 Military objective to win. Reality-bending grants +1 attack die.',
    bonusResource: 'gold',
  },
  tlalocayotlan: {
    id: 'tlalocayotlan', name: 'Tlalocayotlan League', color: '#c0392b', emoji: '🦎', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/75e3d6016_photo-output3.png',
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
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/c8851f071_empireassyrian.png',
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
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/5e6882e48_photo-output2.png',
    continent: 'Sharqian',
    description: 'An ancient realm of warriors founded by the legendary Koufou. A confederation of tribes renowned for precious metals, reality-bending powers, and fierce resistance against slavers and invaders.',
    specialRule: 'Cavalry units move 2 territories per turn. Must hold at least 1 Spiritual objective.',
    bonusResource: 'wheat',
  },
  oakhaven: {
    id: 'oakhaven', name: 'Republic of Oakhaven', color: '#27ae60', emoji: '🌳', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/449a73901_oakhaven.png',
    continent: 'Sharqian',
    description: 'A sanctuary of freedom forged in ancient forests after the Great Cataclysm. The Oakmen use Oakbinding to shape nature and protect their borders against Ruskel Federation industrial expansion.',
    specialRule: 'Forest territories give +2 defense. Oakbinding: forest units cost 1 less Wheat.',
    bonusResource: 'wood',
  },
  ruskel: {
    id: 'ruskel', name: 'Ruskel Federation', color: '#7f8c8d', emoji: '⚙️', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/0ef66cce6_photo-output4.png',
    continent: 'Sharqian',
    description: 'A bastion of iron and industry born from unified northern duchies. Allied with the Dwarves of the Ironclad Holds for advanced weaponry and fortifications. Highly disciplined and industrious.',
    specialRule: 'Siege Engines get +2 attack. Buildings cost 1 less Gold due to Dwarven alliances.',
    bonusResource: 'gold',
  },
  sultanate: {
    id: 'sultanate', name: 'Blue Moon Sultanate', color: '#1a5a8b', emoji: '🌙', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/08a33f4a8_bluemoo.png',
    continent: 'Sharqian',
    description: 'A holy theocratic state founded by the prophet-commander Ashur as a sanctuary for believers of the One God. A center for enlightenment, justice, and pre-cataclysmic knowledge.',
    specialRule: 'Cannot hold Military objectives. +1 SP per turn from divine devotion.',
    bonusResource: 'sp',
  },
  icebound: {
    id: 'icebound', name: 'Icebound Horde', color: '#aed6f1', emoji: '🌨️', playable: true,
    logo: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/011bfc403_thehorde.png',
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
    {
      id: 'tenujin_usurper', name: 'Tenujin, The Usurper', type: 'Spiritual',
      passive: 'Dark Mandate of Heaven: Each Avatar summon grants +1 IP and +1 Gold. Spirit Gate (Temple) upgrades cost -1 Crystal. Once per game, summon an Avatar for 2 fewer Crystals (−1 turn duration).',
      disadvantage: 'Fractured Faith: Other players gain +1 IP when resisting your diplomacy/trade offers. If your Spirit Gate is targeted by a Clandestine card, you must immediately discard 1 Spiritual or Arcane card.',
      image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d291ef182_1.png'
    },
    {
      id: 'itako_viper', name: 'Itako, The Crimson Viper', type: 'Political',
      passive: "Serpent's Tongue: Once per round in diplomatic negotiations, spend 2 IP to reroll any diplomacy check or force your opponent to roll with disadvantage. Draw 1 extra Trade or Diplomacy card at the start of each turn (max hand 7).",
      disadvantage: 'Conscription Delays: All non-hero military unit recruitment costs +1 Gold.',
      image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/36f9e2b01_2.png'
    },
    {
      id: 'onaka_master', name: 'Onaka, Master of Coin', type: 'Wealth',
      passive: 'Infernal Tribute: At the start of your turn, gain +1 Gold per territory containing a Crimson Port. Once per round, pay 3 Gold to draw 2 Trade or Clandestine cards (keep 1, discard the other).',
      disadvantage: 'Pactbound Treasury: At the end of every round, pay 1 Gold. If unable, discard 1 Trade or Economic card at random.',
      image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b36ed92a6_3.png'
    },
    {
      id: 'nutsune_wrath', name: 'Nutsune, The Blazing Wrath', type: 'War',
      passive: 'Relentless Assault: Once per round, declare Relentless Assault on one of your armies. All melee units in that army roll +1 die this turn. If you conquer a territory this way, gain +1 IP. Fighting Pit (Barracks) costs -1 Gold to build.',
      disadvantage: 'Bloodlust: After conquering any territory, you must discard 1 Trade or Diplomacy card from your hand (if you have any).',
      image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ac355a6d2_4.png'
    },
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
  spy_mira: {
    id: 'spy_mira', name: 'Mira the Shadow', type: 'Spy',
    stealth: 4, charisma: 2, force: 1, arcana: 1,
    cost: { gold: 3 }, faction: null, requiredBuilding: 'barracks',
    ability: 'Reveal one enemy objective type',
    passive: '+1 defense in assigned territory (spy network)',
    passiveEffect: { defenseBonus: 1 },
  },
  warrior_bran: {
    id: 'warrior_bran', name: 'Bran Ironhand', type: 'Warrior',
    stealth: 1, charisma: 1, force: 5, arcana: 0,
    cost: { gold: 4 }, faction: null, requiredBuilding: 'barracks',
    ability: '+3 to one attack roll this turn',
    passive: '+2 attack bonus when fighting from assigned territory',
    passiveEffect: { attackBonus: 2 },
  },
  diplomat_lyra: {
    id: 'diplomat_lyra', name: 'Lyra Silvertongue', type: 'Diplomat',
    stealth: 1, charisma: 5, force: 1, arcana: 1,
    cost: { gold: 3, ip: 1 }, faction: null, requiredBuilding: 'market',
    ability: 'Force one trade treaty negotiation',
    passive: '+1 IP per turn while assigned to any territory',
    passiveEffect: { ipPerTurn: 1 },
  },
  mage_zel: {
    id: 'mage_zel', name: 'Zel the Arcane', type: 'Mage',
    stealth: 2, charisma: 2, force: 1, arcana: 5,
    cost: { gold: 3, sp: 2 }, faction: null, requiredBuilding: 'temple',
    ability: '+2 SP immediately',
    passive: '+1 SP per turn while assigned anywhere',
    passiveEffect: { spPerTurn: 1 },
  },
  strategist_oryn: {
    id: 'strategist_oryn', name: 'Oryn Dawnblade', type: 'Strategist',
    stealth: 2, charisma: 3, force: 3, arcana: 2,
    cost: { gold: 5 }, faction: null, requiredBuilding: 'barracks',
    ability: 'Move one friendly unit twice this turn',
    passive: '+1 attack and +1 defense in assigned territory',
    passiveEffect: { attackBonus: 1, defenseBonus: 1 },
  },
  healer_seri: {
    id: 'healer_seri', name: 'Seri the Healer', type: 'Healer',
    stealth: 1, charisma: 3, force: 1, arcana: 3,
    cost: { gold: 3 }, faction: null, requiredBuilding: 'temple',
    ability: 'Restore 2 troops to any friendly territory',
    passive: '+1 Gold income per turn (field support)',
    passiveEffect: { goldPerTurn: 1 },
  },
  knight_aldric: {
    id: 'knight_aldric', name: 'Sir Aldric the Unyielding', type: 'Warrior',
    stealth: 1, charisma: 2, force: 4, arcana: 0,
    cost: { gold: 5, wheat: 2 }, faction: null, requiredBuilding: 'stables',
    ability: 'Negate one attack loss this turn',
    passive: 'Assigned territory troops never drop below 2 from battle',
    passiveEffect: { minTroops: 2 },
  },
  oracle_vex: {
    id: 'oracle_vex', name: 'Oracle Vex', type: 'Mage',
    stealth: 3, charisma: 1, force: 0, arcana: 6,
    cost: { gold: 4, sp: 3 }, faction: null, requiredBuilding: 'temple',
    ability: 'Predict enemy attack direction this turn',
    passive: '+2 defense bonus in assigned territory (arcane wards)',
    passiveEffect: { defenseBonus: 2 },
  },
  ranger_kael: {
    id: 'ranger_kael', name: 'Kael Swiftarrow', type: 'Spy',
    stealth: 5, charisma: 2, force: 2, arcana: 1,
    cost: { gold: 4 }, faction: null, requiredBuilding: 'archerytower',
    ability: 'Scout all adjacent enemy troop counts',
    passive: '+1 Wood income per turn (forest expertise)',
    passiveEffect: { woodPerTurn: 1 },
  },
  // ── Onishiman Heroes ──
  onseiko_warhound: {
    id: 'onseiko_warhound', name: 'Onseiko, The Warhound', type: 'Warlord',
    stealth: 1, charisma: 2, force: 5, arcana: 0,
    cost: { gold: 2, wheat: 2 }, faction: 'onishiman', requiredBuilding: 'fighting_pit', requiredBuildingLevel: 2,
    ability: 'Siege Killer (Pay 2 Gold): Once per turn, targeted unit may ignore enemy Fort or Tower bonuses during a siege. Elevation-based defender bonuses are nullified this round.',
    passive: 'Warhound Unleashed (Pay 4 Gold, once per game): Onseiko becomes a Hero Unit rolling a D10 in combat. He may move and occupy hexes like a normal unit. Adjacent friendly armies gain +1 on their top combat die while he is active. All other abilities are disabled in this form.',
    passiveEffect: { attackBonus: 1, forceBonus: 2 },
    image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/f49c1c3ec_5.png',
  },
  black_chrysanthemum: {
    id: 'black_chrysanthemum', name: 'Black Chrysanthemum, Cunning Advisor', type: 'Strategist',
    stealth: 4, charisma: 4, force: 1, arcana: 2,
    cost: { gold: 2, wheat: 2 }, faction: 'onishiman', requiredBuilding: 'tower_of_intrigues', requiredBuildingLevel: 1,
    ability: 'Web of Shadows (Pay 2 Gold): Once per round, reduce the additional IP cost of one Clandestine card by 2 IP.',
    passive: 'False Alliances (Pay 2 Gold): Once per game round, choose a player — until your next turn, they cannot play Trade or Diplomacy cards unless they pay 2 extra IP per card.',
    passiveEffect: { ipPerTurn: 1, charismaBonus: 1 },
    image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/f712307e2_6.png',
  },
  ube_tarawa: {
    id: 'ube_tarawa', name: 'Ube Tarawa, Underworld Master', type: 'Diplomat',
    stealth: 2, charisma: 5, force: 2, arcana: 1,
    cost: { gold: 2, wheat: 2 }, faction: 'onishiman', requiredBuilding: 'tower_of_intrigues', requiredBuildingLevel: 2,
    ability: "An Offer They Can't Refuse (Pay 3 Gold): Once per round, when initiating a diplomatic deal or trade, force the other player to choose: Accept the deal as proposed, or pay 3 IP to resist. If they accept, gain 1 IP and give that player resources of your choice.",
    passive: 'Shadow Patronage (Pay 1 Gold): Once per round, if you play a Clandestine card, also gain 1 IP. If that card successfully targets a player you\'re in diplomatic/trade contact with, gain +1 Gold as well.',
    passiveEffect: { ipPerTurn: 2, goldPerTurn: 1 },
    image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/64120de3b_7.png',
  },
  itawan_shadow_death: {
    id: 'itawan_shadow_death', name: 'Itawan, The Shadow Death', type: 'Shadow Master',
    stealth: 6, charisma: 1, force: 2, arcana: 3,
    cost: { gold: 3, wheat: 3 }, faction: 'onishiman', requiredBuilding: 'tower_of_intrigues', requiredBuildingLevel: 3,
    ability: 'Silent Kill (Pay 2 Gold): Once per round, spend 2 IP to eliminate one enemy non-hero unit from any hex adjacent to one you control. If the target is an elite unit, roll a D6 — on 5+, it is eliminated.',
    passive: 'Smokescreen (Pay 2 Gold): Once per game round, spend 1 IP to cancel any single combat roll made by another player. The affected die must be re-rolled immediately.',
    passiveEffect: { stealthBonus: 2, ipPerTurn: 1 },
    image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/6d20b07ec_8.png',
  },
  ayame_crimson_spark: {
    id: 'ayame_crimson_spark', name: 'Ayame, The Crimson Spark', type: 'Mage',
    stealth: 2, charisma: 2, force: 1, arcana: 6,
    cost: { gold: 2, wheat: 2, crystals: 1 }, faction: 'onishiman', requiredBuilding: 'omitoji_dojo', requiredBuildingLevel: 2,
    ability: 'Crimson Lightning (Pay 2 Crystals): Once per turn, target a hex within 2 hexes of one you control. Roll 1 D12 — on 7+, destroy up to 3 enemy units there. Gain +1 SP per unit destroyed. If 3 units are destroyed, draw 1 Spiritual/Arcane card immediately.',
    passive: 'Flashblind (Pay 2 Crystals): Roll 1D6 — on 3+, prevent an enemy army from moving into a chosen hex for one turn. You gain 1 IP.',
    passiveEffect: { spPerTurn: 1, arcanaBonus: 2 },
    image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e2ae4b1db_9.png',
  },
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
  { id: 'political_dominance', category: 'Political', text: 'Reach 25 Influence Points', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e23dae1f0_1.png' },
  { id: 'puppet_master', category: 'Political', text: 'Force a player to sign a treaty with another player & sign a treaty with a nation involved in a conflict', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/c0ca90b96_2.png' },
  { id: 'trusted_ally', category: 'Political', text: 'Cumulate 10 turns of alliance (with one or different players)', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/180d4dd12_3.png' },
  { id: 'cunning_deceiver', category: 'Political', text: 'Convince another player to betray their ally through diplomacy or trade', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/8e877b144_4.png' },
  { id: 'mystical_dominance', category: 'Spiritual', text: 'Reach 25 Spiritual Points', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ac4fac07b_5.png' },
  { id: 'avatars_call', category: 'Spiritual', text: 'Summon two avatars', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d44212424_6.png' },
  { id: 'age_of_avatars', category: 'Spiritual', text: 'Summon a legendary Avatar', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/39b9d0449_7.png' },
  { id: 'keeper_of_faith', category: 'Spiritual', text: 'Upgrade your Temple to its maximum level. The temple cannot be damaged for 3 turns. You should be in control of your capital', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/66b5a23b5_8.png' },
  { id: 'mystic_enlightenment', category: 'Spiritual', text: 'Spend at least 10 SP in a single turn', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/a504bd2c3_9.png' },
  { id: 'merchant_king', category: 'Economic', text: 'Accumulate 30 gold in your treasury', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ab346314f_10.png' },
  { id: 'economic_alliance', category: 'Economic', text: 'Maintain 3 active Trade Agreements for 5 turns', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/a04fc9c7d_11.png' },
  { id: 'industrial_expansion', category: 'Economic', text: 'Upgrade your resource production buildings to their maximum level', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/91bb28006_12.png' },
  { id: 'port_authority', category: 'Economic', text: 'Upgrade your Port to its maximum level', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/4af107aa5_13.png' },
  { id: 'taxation_mastery', category: 'Economic', text: 'Earn at least 15 Gold in a single turn', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/33a031462_14.png' },
  { id: 'warlords_path', category: 'Military', text: 'Conquer and hold for 3 turns, 5 enemy-controlled territories', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/56a487aaf_15.png' },
  { id: 'supreme_commander', category: 'Military', text: 'Control an army of at least 12 units at one time', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/0eec3c3ca_16.png' },
  { id: 'city_crusher', category: 'Military', text: 'Successfully besiege and conquer two Fortified City', secret: true, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/cf12aeb9c_17.png' },
];

// ---- Building Definitions ----
export const BUILDING_DEFS = {
  // Starting buildings (every player has these)
  mine:     { id: 'mine',     name: 'Mine',      emoji: '⛏️',  starting: true, maxLevel: 3, upgradeBase: { gold: 4, wood: 2 }, effect: 'gold', effectPerLevel: { 1: 2, 2: 3, 3: 6 }, description: 'Gold production', unlocks: {}, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/a7b81fc3e_26.png' },

  farm:     { id: 'farm',    name: 'Farm',     emoji: '🌾',  starting: true, maxLevel: 3, upgradeBase: { gold: 3, wheat: 2 }, effect: 'wheat', effectPerLevel: { 1: 1, 2: 2, 3: 3 }, description: 'Wheat production', unlocks: {}, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/cbbd104fa_25.png' },
  treasury: { id: 'treasury', name: 'Crimson Vault',  emoji: '🏦',  starting: true, maxLevel: 3, upgradeBase: { gold: 4, wood: 3 }, effect: 'storage', effectPerLevel: 5, description: '+5 max resource storage per level', unlocks: {}, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d38213280_17.png' },
  // Constructible - Onishiman buildings (costs from Onishiman spreadsheet)
  imperial_stronghold: { id: 'imperial_stronghold', name: 'Imperial Stronghold', emoji: '🏯', starting: false, cost: { gold: 8, wood: 5 }, maxLevel: 1, upgradeBase: {}, description: '+2 defending roll; basic units inside use d8 for defense', unlocks: {}, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/75b79fd83_23.png' },
  // Fighting Pit (Barracks): 2 wood + 4 gold to build; 3 gold per level to upgrade (L1-L3)
  fighting_pit: { id: 'fighting_pit', name: 'Fighting Pit', emoji: '⚔️', starting: false, cost: { gold: 4, wood: 2 }, maxLevel: 3, upgradeBase: { gold: 3 }, description: 'L1: Spearmen Infantry · L2: Warlord Hero (Onseiko) · L3: Night Blade Clan (Elite)', unlocks: { 1: 'spearmen_infantry', 2: 'onseiko_warhound', 3: 'night_blade_clan' }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ac98f2aed_29.png' },
  // Omitōji Dojo: 2 wood + 2 gold + 1 crystal to build; 3 gold per level to upgrade (L1-L3)
  omitoji_dojo: { id: 'omitoji_dojo', name: 'Omitōji Dojo', emoji: '⛩️', starting: false, cost: { gold: 2, wood: 2, crystals: 1 }, maxLevel: 3, upgradeBase: { gold: 3 }, description: 'L1: Onmy-tōji Warlocks · L2: Ayame, The Crimson Spark (Mage Hero) · L3: +1 SP/turn', unlocks: { 1: 'onmmy_warlocks', 2: 'ayame_crimson_spark', 3: 'sp_per_turn' }, effect: 'sp', effectPerLevel: { 3: 1 }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/2a42bcd8d_24.png' },
  // Tower of Intrigues: 4 wood + 4 gold to build; 4 gold per level to upgrade (L1-L3)
  tower_of_intrigues: { id: 'tower_of_intrigues', name: 'Tower of Intrigues', emoji: '🏛️', starting: false, cost: { gold: 4, wood: 4 }, maxLevel: 3, upgradeBase: { gold: 4 }, description: 'L1: Black Chrysanthemum (Strategist) · L2: Ube Tarawa (Diplomat) · L3: Itawan, The Shadow Death (Spy)', unlocks: { 1: 'black_chrysanthemum', 2: 'ube_tarawa', 3: 'itawan_shadow_death' }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/cc0a336d2_27.png' },
  // Siege Workshop: 4 wood + 4 gold to build; 4 gold per level to upgrade (L2 max)
  siege_engine_workshop: { id: 'siege_engine_workshop', name: 'Siege Workshop', emoji: '🏗️', starting: false, cost: { gold: 4, wood: 4 }, maxLevel: 2, upgradeBase: { gold: 4 }, description: 'L1: Imperial Crossbow Men (Ranged) · L2: Wildfire Throwers', unlocks: { 1: 'imperial_crossbow', 2: 'wildfire_thrower' }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e1de025b8_28.png' },
  // Spirit Gate (Temple): 2 wood + 4 gold to build; 4 gold per level to upgrade (L1-L3)
  spirit_gate: { id: 'spirit_gate', name: 'Spirit Gate', emoji: '🌙', starting: false, cost: { gold: 4, wood: 2 }, maxLevel: 3, upgradeBase: { gold: 4 }, effect: 'sp', effectPerLevel: { 1: 1, 2: 1, 3: 1 }, description: 'L1: Summon Lesser Avatars · L2: Summon Intermediate Avatars · L3: Summon Legendary Avatars', unlocks: { 1: 'elder_protectors', 2: 'guardian_eternal', 3: 'eternal_emperor' }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/9c136164e_31.png' },
  grand_market: { id: 'grand_market', name: 'Grand Market', emoji: '🏪', starting: false, cost: { gold: 8, wood: 5 }, maxLevel: 3, upgradeBase: { gold: 4, wood: 3 }, description: 'Unlock global trade and trading with neighbours', unlocks: { 1: 'trade_unlock', 2: 'global_trade', 3: 'silver_union_trade' }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d1ae5b9da_21.png' },
  crimson_port: { id: 'crimson_port', name: 'Crimson Port', emoji: '⚓', starting: false, cost: { gold: 8, wood: 6 }, maxLevel: 3, upgradeBase: { gold: 4, wood: 3 }, description: 'Unlock shipyard and overseas trade', unlocks: { 1: 'shipyard_unlock', 2: 'safe_harbor', 3: 'overseas_trade' }, image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/36da616cb_22.png' },
  temple: { id: 'temple', name: 'Temple', emoji: '⛩️', starting: false, cost: { gold: 6, wood: 4 }, maxLevel: 3, upgradeBase: { gold: 3, wood: 3 }, effect: 'sp', effectPerLevel: { 1: 1, 2: 1, 3: 1 }, description: 'Spiritual power generation', unlocks: { 1: 'basic_ritual', 2: 'advanced_ritual', 3: 'legendary_ritual' } },
  barracks: { id: 'barracks', name: 'Barracks', emoji: '🎖️', starting: false, cost: { gold: 6, wood: 4 }, maxLevel: 3, upgradeBase: { gold: 3, wood: 2 }, description: 'Unit recruitment and training', unlocks: { 1: 'infantry_recruit', 2: 'elite_recruit', 3: 'hero_recruit' } },
  market: { id: 'market', name: 'Market', emoji: '🏪', starting: false, cost: { gold: 6, wood: 4 }, maxLevel: 3, upgradeBase: { gold: 3, wood: 2 }, effect: 'gold', effectPerLevel: { 1: 1, 2: 1, 3: 2 }, description: 'Trade and commerce hub', unlocks: { 1: 'local_trade', 2: 'regional_trade', 3: 'global_trade' } },
  stables: { id: 'stables', name: 'Stables', emoji: '🐴', starting: false, cost: { gold: 5, wood: 4 }, maxLevel: 2, upgradeBase: { gold: 3, wood: 3 }, description: 'Cavalry unit production', unlocks: { 1: 'cavalry_recruit', 2: 'elite_cavalry' } },
  archerytower: { id: 'archerytower', name: 'Archery Tower', emoji: '🏹', starting: false, cost: { gold: 5, wood: 4 }, maxLevel: 2, upgradeBase: { gold: 3, wood: 3 }, description: 'Ranged unit production', unlocks: { 1: 'archer_recruit', 2: 'elite_archer' } },
  siegeworks: { id: 'siegeworks', name: 'Siege Works', emoji: '🏗️', starting: false, cost: { gold: 7, wood: 5 }, maxLevel: 2, upgradeBase: { gold: 4, wood: 3 }, description: 'Siege engine construction', unlocks: { 1: 'siege_recruit', 2: 'advanced_siege' } },
  shipyard: { id: 'shipyard', name: 'Shipyard', emoji: '⛵', starting: false, cost: { gold: 8, wood: 6 }, maxLevel: 2, upgradeBase: { gold: 4, word: 4 }, description: 'Naval unit construction', unlocks: { 1: 'naval_recruit', 2: 'elite_naval' } },
};
// ═══════════════════════════════════════════════
// FACTION-UNIQUE DATA: Buildings, Heroes, Units
// ═══════════════════════════════════════════════

export const FACTION_DATA = {

  gejeon: {
    color: "#7B3DBE",
    displayName: "Celestial Gojeon Kingdom",
    lore: "An ancient empire of mystic philosophers and warrior-monks.",
    buildings: [
      { id: "lotus_shrine",    name: "Lotus Shrine",       cost: 50,  effect: "+2 Faith/turn, unlocks monks",       icon: "🏯" },
      { id: "jade_barracks",   name: "Jade Barracks",      cost: 80,  effect: "+1 unit slot, trains elite infantry", icon: "⚔️" },
      { id: "silk_market",     name: "Silk Market",        cost: 60,  effect: "+3 Gold/turn, trade route bonus",     icon: "🏮" },
      { id: "dragon_tower",    name: "Dragon Tower",       cost: 120, effect: "+5 defense, reveals fog of war",      icon: "🐉" },
      { id: "celestial_forge", name: "Celestial Forge",    cost: 100, effect: "Upgrades units to celestial tier",    icon: "🔱" },
    ],
    heroes: [
      { id: "empress_yue",   name: "Empress Yue Xialan",  attack: 7, defense: 5, ability: "Lotus Veil — immune to first strike each battle", icon: "👸" },
      { id: "general_zhao",  name: "General Zhao Kenmei", attack: 9, defense: 4, ability: "Dragon Charge — +3 attack when outnumbered",       icon: "🗡️" },
      { id: "monk_shiori",   name: "Monk Shiori",         attack: 4, defense: 8, ability: "Iron Bell — heals adjacent allies each turn",       icon: "🧘" },
    ],
    units: [
      { id: "jade_spearman",   name: "Jade Spearman",   attack: 4, defense: 3, cost: 30, icon: "🪖" },
      { id: "silk_archer",     name: "Silk Road Archer", attack: 5, defense: 2, cost: 35, icon: "🏹" },
      { id: "celestial_monk",  name: "Celestial Monk",   attack: 3, defense: 6, cost: 50, icon: "☯️" },
      { id: "dragon_cavalry",  name: "Dragon Cavalry",   attack: 7, defense: 4, cost: 70, icon: "🐉" },
    ],
  },

  inuvak: {
    color: "#2E9E9E",
    displayName: "Inuvak Polar Confederacy",
    lore: "Hardy northern tribes bound by ice-oaths and ancestral spirits.",
    buildings: [
      { id: "spirit_totem",    name: "Spirit Totem",       cost: 50,  effect: "+2 Morale/turn, fear aura on enemies",   icon: "🪆" },
      { id: "ice_lodge",       name: "Ice War Lodge",      cost: 80,  effect: "Trains frost warriors, cold resistance",  icon: "🧊" },
      { id: "whale_market",    name: "Whale Market",       cost: 60,  effect: "+3 Food/turn, naval trade bonus",         icon: "🐋" },
      { id: "frost_watchtower",name: "Frost Watchtower",   cost: 90,  effect: "+4 defense, +2 hex vision",              icon: "🗼" },
      { id: "shaman_circle",   name: "Shaman Circle",      cost: 110, effect: "Summons Ice Elementals once per battle",  icon: "❄️" },
    ],
    heroes: [
      { id: "chieftain_noli",  name: "Chieftain Nolitres", attack: 8, defense: 6, ability: "Blizzard Roar — reduces all enemies -2 attack this turn", icon: "🧊" },
      { id: "huntress_tuva",   name: "Huntress Tuvakke",   attack: 7, defense: 4, ability: "Arctic Strike — ignores 2 points of defense",              icon: "🏹" },
      { id: "shaman_kalvik",   name: "Shaman Kalvik",      attack: 3, defense: 7, ability: "Ice Barrier — grants +4 defense to adjacent unit",          icon: "🔮" },
    ],
    units: [
      { id: "frost_warrior",   name: "Frost Warrior",    attack: 5, defense: 4, cost: 35, icon: "🪓" },
      { id: "tundra_archer",   name: "Tundra Archer",    attack: 5, defense: 2, cost: 30, icon: "🏹" },
      { id: "mammoth_rider",   name: "Mammoth Rider",    attack: 7, defense: 5, cost: 75, icon: "🦣" },
      { id: "ice_shaman",      name: "Ice Shaman",       attack: 3, defense: 5, cost: 55, icon: "❄️" },
    ],
  },

  ruskel: {
    color: "#C43030",
    displayName: "Ruskel Iron Federation",
    lore: "An iron-fisted federation of forge-lords and bear-warriors.",
    buildings: [
      { id: "iron_citadel",    name: "Iron Citadel",       cost: 90,  effect: "+6 defense, siege resistance",           icon: "🏰" },
      { id: "bear_barracks",   name: "Bear Barracks",      cost: 80,  effect: "Trains bear cavalry and heavy infantry",  icon: "🐻" },
      { id: "forge_district",  name: "Forge District",     cost: 70,  effect: "+4 Production/turn, weapon upgrades",    icon: "⚒️" },
      { id: "boyar_hall",      name: "Boyar Hall",         cost: 60,  effect: "+3 Gold/turn, recruit mercenaries",      icon: "🏛️" },
      { id: "siege_workshop",  name: "Siege Workshop",     cost: 100, effect: "Builds catapults and battering rams",    icon: "💣" },
    ],
    heroes: [
      { id: "warlord_kazagrad",name: "Warlord Kazagrad",   attack: 10, defense: 5, ability: "Iron Charge — deals double damage to buildings", icon: "🗡️" },
      { id: "boyar_escennor",  name: "Boyar Escennor",     attack: 6,  defense: 8, ability: "Shield Wall — +3 defense to all adjacent units",   icon: "🛡️" },
      { id: "huntsman_volkov", name: "Huntsman Volkov",    attack: 8,  defense: 3, ability: "Bear Ambush — attacks first, ignores terrain",      icon: "🐻" },
    ],
    units: [
      { id: "iron_soldier",    name: "Iron Soldier",     attack: 5, defense: 5, cost: 40, icon: "⚔️" },
      { id: "bear_cavalry",    name: "Bear Cavalry",     attack: 8, defense: 4, cost: 80, icon: "🐻" },
      { id: "siege_engine",    name: "Siege Engine",     attack: 10, defense: 2, cost: 100, icon: "💣" },
      { id: "iron_archer",     name: "Iron Crossbow",    attack: 6, defense: 3, cost: 45, icon: "🏹" },
    ],
  },

  shadefell: {
    color: "#3C3C3C",
    displayName: "Order of Shadowsfall",
    lore: "A sinister theocracy of shadow-priests and undying warriors.",
    buildings: [
      { id: "black_sanctum",   name: "Black Sanctum",      cost: 80,  effect: "+3 Shadow Power/turn, unlocks undead",   icon: "🕍" },
      { id: "blight_forge",    name: "Blight Forge",       cost: 90,  effect: "Poisons enemy units in adjacent hexes",  icon: "☠️" },
      { id: "dark_vault",      name: "Dark Vault",         cost: 60,  effect: "+4 Gold/turn via dark tribute",          icon: "💀" },
      { id: "veil_gate",       name: "Veil Gate",          cost: 100, effect: "Teleports units between Veil Gates",     icon: "🌑" },
      { id: "death_tower",     name: "Death Tower",        cost: 110, effect: "+5 defense, raises slain as undead",     icon: "🗼" },
    ],
    heroes: [
      { id: "lycus_the_eternal",name: "Lycus the Eternal", attack: 8, defense: 7, ability: "Soul Drain — heals self equal to damage dealt",      icon: "💀" },
      { id: "lady_ashveil",    name: "Lady Ashveil",       attack: 6, defense: 6, ability: "Shadow Step — teleports to any friendly Veil Gate",   icon: "🌑" },
      { id: "darkspire_priest",name: "Darkspire Priest",   attack: 4, defense: 5, ability: "Raise Dead — revives 1 defeated unit per battle",     icon: "☠️" },
    ],
    units: [
      { id: "shadow_blade",    name: "Shadow Blade",     attack: 6, defense: 3, cost: 40, icon: "🗡️" },
      { id: "undead_warrior",  name: "Undead Warrior",   attack: 4, defense: 6, cost: 35, icon: "💀" },
      { id: "blight_archer",   name: "Blight Archer",    attack: 5, defense: 2, cost: 35, icon: "🏹" },
      { id: "wraith_rider",    name: "Wraith Rider",     attack: 7, defense: 4, cost: 70, icon: "👻" },
    ],
  },

  greenheart: {
    color: "#2E8D32",
    displayName: "Greenheart Republic",
    lore: "A druidic republic governed by elder councils and forest spirits.",
    buildings: [
      { id: "elder_tree",      name: "Elder Tree Shrine",  cost: 60,  effect: "+3 Nature/turn, regenerates 1HP to units", icon: "🌳" },
      { id: "ranger_post",     name: "Ranger Post",        cost: 80,  effect: "Trains rangers, +1 hex vision in forest",  icon: "🌲" },
      { id: "grove_market",    name: "Grove Market",       cost: 50,  effect: "+2 Food, +2 Gold/turn",                    icon: "🌿" },
      { id: "vine_wall",       name: "Vine Wall",          cost: 90,  effect: "+5 defense, slows attackers",              icon: "🪴" },
      { id: "druid_circle",    name: "Druid Circle",       cost: 110, effect: "Entangles enemies in adjacent hexes",      icon: "🍃" },
    ],
    heroes: [
      { id: "elderroot",       name: "Elderroot",          attack: 6, defense: 8, ability: "Forest Meld — invisible in forest hexes",            icon: "🌳" },
      { id: "ranger_nendon",   name: "Ranger Nendon",      attack: 8, defense: 4, ability: "Pin Shot — target loses next attack action",          icon: "🏹" },
      { id: "druidess_misth",  name: "Druidess Misthaven", attack: 4, defense: 6, ability: "Grove Heal — restores 3HP to all allies each turn",   icon: "🍃" },
    ],
    units: [
      { id: "forest_ranger",   name: "Forest Ranger",    attack: 5, defense: 4, cost: 35, icon: "🌲" },
      { id: "vine_warrior",    name: "Vine Warrior",     attack: 4, defense: 6, cost: 35, icon: "🪴" },
      { id: "giant_bear",      name: "Giant Bear",       attack: 8, defense: 5, cost: 75, icon: "🐻" },
      { id: "grove_archer",    name: "Grove Archer",     attack: 6, defense: 3, cost: 40, icon: "🏹" },
    ],
  },

  silverunion: {
    color: "#B0B0B0",
    displayName: "Silver Union",
    lore: "A mercantile republic that buys allies and sells armies.",
    buildings: [
      { id: "grand_exchange",  name: "Grand Exchange",     cost: 70,  effect: "+5 Gold/turn, buy any unit for gold",    icon: "🏦" },
      { id: "vault_of_nations",name: "Vault of Nations",   cost: 100, effect: "Stores 200 bonus Gold, anti-theft",     icon: "💰" },
      { id: "mercenary_guild", name: "Mercenary Guild",    cost: 80,  effect: "Hire any faction's unit for 1.5x cost",  icon: "⚔️" },
      { id: "coinspire_tower", name: "Coinspire Tower",    cost: 90,  effect: "+3 Gold, diplomacy bonus vs neighbors",  icon: "🗼" },
      { id: "trade_embassy",   name: "Trade Embassy",      cost: 60,  effect: "Prevents war with one faction per turn", icon: "🤝" },
    ],
    heroes: [
      { id: "guildmaster_aurion", name: "Guildmaster Aurion", attack: 5, defense: 5, ability: "Golden Bribe — convert 1 enemy unit to your side", icon: "💰" },
      { id: "sellsword_vance",    name: "Sellsword Vance",    attack: 9, defense: 3, ability: "Mercenary Rush — attacks twice if paid double",     icon: "⚔️" },
      { id: "spymistress_lyra",   name: "Spymistress Lyra",   attack: 4, defense: 6, ability: "Sabotage — disables 1 enemy building for 2 turns",  icon: "🕵️" },
    ],
    units: [
      { id: "silver_guard",    name: "Silver Guard",     attack: 5, defense: 5, cost: 45, icon: "🛡️" },
      { id: "mercenary",       name: "Hired Mercenary",  attack: 7, defense: 3, cost: 55, icon: "⚔️" },
      { id: "trade_galley",    name: "Trade Galley",     attack: 4, defense: 4, cost: 60, icon: "⛵" },
      { id: "coin_archer",     name: "Crossbow Guard",   attack: 6, defense: 3, cost: 40, icon: "🏹" },
    ],
  },

  shadowsfall: {
    color: "#3C3C3C",
    displayName: "Order of Shadowsfall (Eastern)",
    lore: "The eastern branch of the Order, corrupted beyond redemption.",
    buildings: [
      { id: "forsaken_citadel",name: "Forsaken Citadel",   cost: 90,  effect: "+5 defense, fear aura prevents routing", icon: "🏚️" },
      { id: "withered_grove",  name: "Withered Grove",     cost: 70,  effect: "Poisons adjacent land tiles permanently", icon: "☠️" },
      { id: "ash_market",      name: "Ash Market",         cost: 60,  effect: "+3 Gold via death tribute",               icon: "💀" },
      { id: "veil_rift",       name: "Veil Rift",          cost: 110, effect: "Spawns 1 wraith per turn automatically",  icon: "🌀" },
      { id: "bone_tower",      name: "Bone Tower",         cost: 100, effect: "+4 defense, raises 1 skeleton on death",  icon: "🦴" },
    ],
    heroes: [
      { id: "lycus_shadow",    name: "Lycus' Shadow",      attack: 9, defense: 6, ability: "Eternal Blight — reduces max HP of target by 2",    icon: "👁️" },
      { id: "ashveil_wraith",  name: "Ashveil Wraith",     attack: 7, defense: 5, ability: "Phase Walk — cannot be targeted for 1 round",       icon: "👻" },
      { id: "bone_prophet",    name: "Bone Prophet",       attack: 3, defense: 7, ability: "Death Mark — next unit killed becomes your undead",  icon: "🦴" },
    ],
    units: [
      { id: "wraith_soldier",  name: "Wraith Soldier",   attack: 6, defense: 4, cost: 45, icon: "👻" },
      { id: "skeleton",        name: "Skeleton",          attack: 3, defense: 3, cost: 20, icon: "🦴" },
      { id: "dark_rider",      name: "Dark Rider",        attack: 7, defense: 4, cost: 65, icon: "🐴" },
      { id: "plague_archer",   name: "Plague Archer",     attack: 5, defense: 2, cost: 35, icon: "🏹" },
    ],
  },
};

// ── Faction-specific BUILDING_DEFS ids available to each faction ──
export const FACTION_BUILDINGS = {
  onishiman:     ['imperial_stronghold', 'omitoji_dojo', 'spirit_gate', 'tower_of_intrigues', 'siege_engine_workshop', 'fighting_pit', 'grand_market', 'crimson_port'],
  gojeon:        ['temple', 'barracks', 'market', 'stables', 'archerytower'],
  sultanate:     ['temple', 'market', 'barracks', 'grand_market'],
  republic:      ['barracks', 'market', 'shipyard', 'stables', 'archerytower', 'crimson_port'],
  kadjimaran:    ['stables', 'barracks', 'temple', 'archerytower'],
  oakhaven:      ['barracks', 'archerytower', 'temple', 'market'],
  ruskel:        ['barracks', 'siegeworks', 'stables', 'market', 'fighting_pit'],
  icebound:      ['barracks', 'stables', 'siegeworks', 'fighting_pit'],
  inuvak:        ['temple', 'barracks', 'archerytower'],
  kintei:        ['barracks', 'siegeworks', 'stables', 'market', 'grand_market'],
  nimrudan:      ['barracks', 'temple', 'stables', 'archerytower', 'fighting_pit'],
  tlalocayotlan: ['temple', 'barracks', 'archerytower', 'market'],
};

// ── Faction-specific UNIT_DEFS ids available to each faction ──
export const FACTION_UNITS = {
  onishiman:     ['spearmen_infantry', 'onishiman_cavalry', 'imperial_crossbow', 'onmmy_warlocks', 'night_blade_clan', 'wildfire_thrower', 'infamous_reapership'],
  gojeon:        ['infantry', 'cavalry', 'ranged', 'elite'],
  sultanate:     ['infantry', 'cavalry', 'ranged', 'elite'],
  republic:      ['infantry', 'naval', 'ranged', 'cavalry', 'elite'],
  kadjimaran:    ['cavalry', 'infantry', 'ranged'],
  oakhaven:      ['infantry', 'ranged', 'elite'],
  ruskel:        ['infantry', 'siege', 'cavalry', 'elite'],
  icebound:      ['infantry', 'cavalry', 'elite', 'siege'],
  inuvak:        ['infantry', 'ranged', 'elite'],
  kintei:        ['infantry', 'siege', 'cavalry', 'ranged'],
  nimrudan:      ['infantry', 'cavalry', 'ranged', 'elite', 'siege'],
  tlalocayotlan: ['infantry', 'ranged', 'elite'],
};

// Helper: get faction buildings (FACTION_DATA display info)
export const getFactionBuildings = (factionId) =>
  FACTION_DATA[factionId]?.buildings ?? [];

// ---- Unit Definitions ----
export const UNIT_DEFS = {
  infantry:   { id: 'infantry',   name: 'Infantry',     emoji: '🗡️',  dice: 6,  cost: { gold: 2, wheat: 1 }, canCapture: true,  requires: 'barracks',  movementRange: 1, description: 'Basic melee unit, moves 1 tile/turn' },
  ranged:     { id: 'ranged',     name: 'Ranged',       emoji: '🏹',  dice: 6,  cost: { gold: 2, wood: 1 },  canCapture: false, requires: 'archerytower', movementRange: 1, description: 'Attacks from adjacent tile, moves 1 tile/turn' },
  cavalry:    { id: 'cavalry',    name: 'Cavalry',      emoji: '🐴',  dice: 12, cost: { gold: 3, wheat: 2 }, canCapture: true,  requires: 'stables',   movementRange: 3, description: 'Fast cavalry, moves 3 tiles/turn' },
  elite:      { id: 'elite',      name: 'Elite Guard',  emoji: '⚡',  dice: 20, cost: { gold: 5, wheat: 2 }, canCapture: true,  requires: 'barracks',  movementRange: 2, description: 'Powerful troops, moves 2 tiles/turn' },
  siege:      { id: 'siege',      name: 'Siege Engine', emoji: '🏗️',  dice: 12, cost: { gold: 4, wood: 4 },  canCapture: false, requires: 'siegeworks', movementRange: 1, description: 'Required to attack fortified cities, moves 1 tile/turn' },
  naval:      { id: 'naval',      name: 'Warship',      emoji: '⛵',  dice: 12, cost: { gold: 5, wood: 5 },  canCapture: false, requires: 'shipyard',  movementRange: 3, description: 'Sea movement and blockades, moves 3 tiles/turn' },
  // ── Onishiman Units (costs & stats from Onishiman spreadsheet) ──
  // Spearmen Infantry: 1 wheat + 1 gold; d6; +1 defense in Fortified City; 1 hex/turn
  spearmen_infantry: { id: 'spearmen_infantry', name: 'Spearmen Infantry', emoji: '🗡️', dice: 6, cost: { gold: 1, wheat: 1 }, canCapture: true, requires: 'fighting_pit', movementRange: 1, description: 'Melee infantry with +1 defense bonus in Fortified Cities. 1 hex/turn.', ability: 'Fortified Defense: +1 defense die when inside a fortified hex.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ff1db780e_12.png' },
  // Onishiman Cavalry: 1 wheat + 1 gold + 1 wood; d6; high movement 2 hexes/turn
  onishiman_cavalry: { id: 'onishiman_cavalry', name: 'Onishiman Cavalry', emoji: '🐴', dice: 6, cost: { gold: 1, wheat: 1, wood: 1 }, canCapture: true, requires: 'fighting_pit', movementRange: 2, description: 'Swift light cavalry. 2 hexes/turn.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b825e7812_11.png' },
  // Imperial Crossbowmen: 1 gold + 1 wood; d6+1 attack, -1 when defending; ranged; 1 hex/turn
  imperial_crossbow: { id: 'imperial_crossbow', name: 'Imperial Crossbow Men', emoji: '🏹', dice: 6, diceBonus: 1, defensePenalty: -1, cost: { gold: 1, wood: 1 }, canCapture: false, requires: 'siege_engine_workshop', movementRange: 1, description: 'Ranged unit. Attacks without entering. d6+1 attack, -1 when defending. Gains +1 from Fortified City elevation.', ability: 'Ranged Attack: Attack adjacent hexes without entering. No Retaliation unless defender is ranged. Elevation Bonus: +1 attack from Fortified hex.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b32653e23_13.png' },
  // Onmy-tōji Warlocks: 1 wheat + 2 gold + 1 crystal; d12; 1 hex/turn; Soul Burn +1 SP per kill
  onmmy_warlocks: { id: 'onmmy_warlocks', name: 'Onmy-tōji Warlocks', emoji: '✨', dice: 12, cost: { gold: 2, wheat: 1, crystals: 1 }, canCapture: true, requires: 'omitoji_dojo', movementRange: 1, description: 'Magic unit. d12 dice. Soul Burn: gain +1 SP per unit killed. 1 hex/turn.', ability: 'Soul Burn: Gain +1 SP each time this unit kills an enemy unit in combat.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/55849ec19_10.png' },
  // Night Blade Clan (Elite): 2 wheat + 2 gold + 2 crystals; d8+4; enemy -1 on first two checks; 1 hex/turn
  night_blade_clan: { id: 'night_blade_clan', name: 'Night Blade Clan', emoji: '⚡', dice: 8, diceBonus: 4, cost: { gold: 2, wheat: 2, crystals: 2 }, canCapture: true, requires: 'fighting_pit', requiredBuildingLevel: 3, movementRange: 1, description: 'Elite shadow warriors. d8+4. Enemy rolls -1 on their first two combat checks. 1 hex/turn.', ability: 'Dread Presence: Enemy units roll -1 on their first two attack or defense checks when fighting this unit.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/84b71bfb1_14.png' },
  // Wildfire Thrower (Siege): unlocked at Siege Workshop L2; kept at gold 2 + wood 2
  wildfire_thrower: { id: 'wildfire_thrower', name: 'Wildfire Thrower', emoji: '🔥', dice: 10, cost: { gold: 2, wood: 2 }, canCapture: false, requires: 'siege_engine_workshop', requiredBuildingLevel: 2, movementRange: 1, description: 'Siege-class ranged unit with wildfire attack. 1 hex/turn.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/89286a7f8_15.png' },
  // Infamous Reapership (Naval): gold 3 + wood 3
  infamous_reapership: { id: 'infamous_reapership', name: 'Infamous Reapership', emoji: '⛵', dice: 12, cost: { gold: 3, wood: 3 }, canCapture: false, requires: 'crimson_port', movementRange: 3, description: 'Naval flagship with bombardment ability. 3 hexes/turn.', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/4c3f57a91_16.png' },
};

// ---- Action Cards ----
export const ACTION_CARDS = [
  { id: 'sabotage',    name: 'Sabotage',        category: 'Clandestine', cost: { gold: 2, ip: 2 }, heroStat: 'stealth', effect: 'Disable one enemy building for 2 turns', emoji: '💣' },
  { id: 'assassinate', name: 'Assassination',   category: 'Clandestine', cost: { gold: 3, ip: 3 }, heroStat: 'stealth', effect: 'Imprison enemy hero for 2 turns', emoji: '🗡️' },
  { id: 'spy',         name: 'Espionage',       category: 'Clandestine', cost: { gold: 2, ip: 1 }, heroStat: 'stealth', effect: 'Reveal one enemy objective type', emoji: '🕵️' },
  { id: 'blackmail',   name: 'Blackmail',       category: 'Clandestine', cost: { gold: 2, ip: 2 }, heroStat: 'stealth', effect: 'Force enemy to pay 3 Gold or lose 1 territory control', emoji: '📋' },
  { id: 'poison',      name: 'Poison Supplies', category: 'Clandestine', cost: { gold: 3, ip: 2 }, heroStat: 'stealth', effect: 'Target loses 2 troops from one territory', emoji: '☠️' },
  { id: 'divine_shield', name: 'Divine Shield', category: 'Spiritual',   cost: { gold: 1, sp: 2 }, heroStat: 'arcana', effect: '+3 defense rolls until next turn', emoji: '🛡️' },
  { id: 'faith_surge', name: 'Faith Surge',     category: 'Spiritual',   cost: { gold: 2, sp: 1 }, heroStat: 'arcana', effect: 'Gain +3 SP immediately', emoji: '✨' },
  { id: 'rally',       name: 'War Rally',       category: 'Military',    cost: { gold: 3, wheat: 2 }, heroStat: 'force', effect: '+2 to all attack rolls this turn', emoji: '⚔️' },
  { id: 'negotiate',   name: 'Negotiation',     category: 'Diplomacy',   cost: { gold: 1, ip: 2 }, heroStat: 'charisma', effect: 'Force a trade treaty or truce', emoji: '🤝' },
  { id: 'embark',      name: 'Embark Mission',  category: 'Diplomacy',   cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Send diplomat: +1 IP per turn for 3 turns', emoji: '✉️' },
  { id: 'declare_war', name: 'Declare War',     category: 'Diplomacy',   cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'All players must pick a side; gain +1 attack vs declared enemy', emoji: '⚔️' },
  { id: 'trade_deal',  name: 'Trade Agreement', category: 'Trade',       cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Sign a trade agreement: +2 Gold/turn for 3 turns', emoji: '📜' },
  { id: 'luxury_goods', name: 'Luxury Goods',   category: 'Trade',       cost: { gold: 3 }, heroStat: 'charisma', effect: 'Gain +2 IP, sell goods for +3 Gold', emoji: '💎' },
  { id: 'spice_routes', name: 'Spice Trade',    category: 'Trade',       cost: { gold: 2, wood: 1 }, heroStat: 'charisma', effect: 'Open route: gain +1 Gold/turn + +1 Wood/turn for 2 turns', emoji: '🌶️' },
  { id: 'gem_monopoly', name: 'Gem Monopoly',   category: 'Trade',       cost: { gold: 3, ip: 2 }, heroStat: 'charisma', effect: 'Gain 2 Crystals; prevent others from trading gems', emoji: '💠' },
  // New Trade & Diplomacy cards with artwork
  { id: 'peace_treaty', name: 'Peace Treaty', category: 'Diplomacy', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Two players cannot attack each other for 3 turns. Both gain +1 Gold per turn while the treaty lasts. You gain 1 IP', emoji: '🕊️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e0bea1895_1.png' },
  { id: 'embargo', name: 'Embargo', category: 'Trade', cost: { gold: 1, ip: 1 }, heroStat: 'charisma', effect: 'Pay 1 IP. Prevent a player from trading for 2 turns', emoji: '⛵', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/93eb1fe12_2.png' },
  { id: 'trade_diplomacy', name: 'Trade Diplomacy', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Allows two players to exchange resources freely for 3 turns. Each trade generates +1 extra resource. You gain 1 IP', emoji: '🤝', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/60c5cb09a_3.png' },
  { id: 'merchant_fleet', name: 'Merchant Fleet', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Trade with any player, even without a Market or port for 2 turns', emoji: '🚢', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/caf5c9815_4.png' },
  { id: 'exclusive_contract', name: 'Exclusive Contract', category: 'Diplomacy', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Your trade partner cannot trade with other players for 3 turns', emoji: '📜', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/4bbd25f55_5.png' },
  { id: 'tariff_deal', name: 'Tariff Deal', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Every time you trade, you gain +1 extra Gold as a tariff bonus for the next 3 turns', emoji: '⚓', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/8f4f35690_6.png' },

  { id: 'wheat_monopoly', name: 'Wheat Monopoly', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Gain control of one resource type (wheat) for 3 turns; other players must pay +1 Gold to you to trade it', emoji: '🌾', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/7fc6c94f3_8.png' },
  { id: 'trade_corridor', name: 'Trade Corridor', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'All trades generate +1 extra resource for both players for 2 turns', emoji: '🏛️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/8ee3ee6dd_9.png' },
  { id: 'merchant_guild', name: 'Merchant Guild', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Once per turn, you may trade directly with the Bank at a 1-for-1 rate', emoji: '🏪', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d24c16455_10.png' },
  { id: 'economic_boom', name: 'Economic Boom', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Your Market produces +2 Gold for 3 turns', emoji: '💰', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/30a7e537d_11.png' },
  { id: 'war_profiteering', name: 'War Profiteering', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Gain +2 Gold per turn if any player is at war', emoji: '⚔️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/cbcdfea0b_12.png' },
  { id: 'economic_manipulation', name: 'Economic Manipulation', category: 'Trade', cost: { gold: 2, ip: 2 }, heroStat: 'charisma', effect: 'Select one opponent; they must trade a resource at a 2-for-1 disadvantage', emoji: '💰', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/dfbb4bd95_13.png' },
  { id: 'tariff_war', name: 'Tariff War', category: 'Trade', cost: { gold: 2, gold: 2 }, heroStat: 'charisma', effect: 'Force all players to pay 2 extra Gold when buying resources next turn', emoji: '⚓', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/8ddbfccb0_14.png' },
  { id: 'slave_trade', name: 'Slave Trade', category: 'Trade', cost: { gold: 3, ip: 1 }, heroStat: 'charisma', effect: 'For the next 3 turns, once a unit is defeated, it can be sold to the bank for its recruitment cost (you lose 1 IP and 1 SP per unit)', emoji: '⛓️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/2d0f8a48e_15.png' },
  { id: 'debt_forgiveness', name: 'Debt Forgiveness', category: 'Diplomacy', cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Cancel all debts and owed payments between two players', emoji: '📜', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/21c2edc90_16.png' },
  { id: 'luxury_tax', name: 'Luxury Tax', category: 'Trade', cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Every other player with more than 10 Gold must pay you 2 Gold', emoji: '👑', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/7e5a66b97_17.png' },
  { id: 'forced_tribute', name: 'Forced Tribute', category: 'Diplomacy', cost: { gold: 2, ip: 2 }, heroStat: 'charisma', effect: 'Demand 3 Gold from another player; they must pay or lose 1 IP', emoji: '⚔️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/1d7c1de99_18.png' },
  { id: 'royal_marriage', name: 'Royal Marriage', category: 'Diplomacy', cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Sign an alliance with a player for 3 turns. You share the same enemies. Both players gain +1 Gold from Markets', emoji: '💍', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e65e8bf70_19.png' },
  { id: 'allied_barracks', name: 'Allied Barracks', category: 'Diplomacy', cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Share recruitment costs with an ally for 1 turn. You gain 1 IP', emoji: '⚔️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/94e66640d_20.png' },
  { id: 'diplomatic_favor', name: 'Diplomatic Favor', category: 'Diplomacy', cost: { gold: 2 }, heroStat: 'charisma', effect: 'Gain +3 IP this turn', emoji: '🕊️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/637e8fc1d_21.png' },
  { id: 'non_aggression_pact', name: 'Non-Aggression Pact', category: 'Diplomacy', cost: { gold: 2, ip: 1 }, heroStat: 'charisma', effect: 'Prevent mutual attacks for 2 turns. Breaking it costs 2 IP. You gain 1 IP', emoji: '🕊️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/3792f726b_22.png' },
  { id: 'spiritual_pilgrimage', name: 'Spiritual Pilgrimage', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Gain +3 SP instantly', emoji: '🙏', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/07a04af61_1.png' },
  { id: 'holy_shield', name: 'Holy Shield', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Negate all damage to one unit this turn. +1 SP', emoji: '🛡️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/d5633620a_2.png' },
  { id: 'ritual_of_summoning', name: 'Ritual of Summoning', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Gain +1 SP instantly. Reduce the SP cost of your next Avatar by 2', emoji: '✨', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/a026f4a70_3.png' },
  { id: 'temple_blessing', name: 'Temple Blessing', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Your Temple generates +2 SP this turn', emoji: '⛩️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/59c018a71_4.png' },
  { id: 'mystic_barrier', name: 'Mystic Barrier', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Cancel one Clandestine card targeting you. +1 SP', emoji: '✨', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e33cfe253_5.png' },
  { id: 'prophets_vision', name: "Prophet's Vision", category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Draw 2 action cards. +1 SP', emoji: '🔮', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/cbe6a2700_6.png' },
  { id: 'wrath_of_divine', name: 'Wrath of the Divine', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Deal 1d6 damage to enemy units in one territory. +2SP', emoji: '⚡', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/2b18a36a3_7.png' },
  { id: 'avatars_echo', name: "Avatar's Echo", category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Your Avatar may use its active ability an additional time this turn. -1SP', emoji: '👻', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/85e40c984_8.png' },
  { id: 'sanctified_ground', name: 'Sanctified Ground', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Enemy units entering a designated territory roll -1 in battle this turn', emoji: '⛩️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e0dbdd5ca_9.png' },
  { id: 'echoes_of_prophecy', name: 'Echoes of Prophecy', category: 'Spiritual', cost: { gold: 2 }, heroStat: 'wisdom', effect: 'Choose a player. You may predict one of their next actions. If correct, gain +2 SP', emoji: '🔯', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/87fcd905d_10.png' },
  // Clandestine cards
  { id: 'spys_network', name: "Spy's Network", category: 'Clandestine', cost: { gold: 2, ip: 2 }, heroStat: 'stealth', effect: 'Look at the Trade and Diplomacy cards in another player\'s hand.', emoji: '🕵️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b99ca1035_1.png' },
  { id: 'smugglers_network', name: "Smuggler's Network", category: 'Clandestine', cost: { gold: 2, ip: 2 }, heroStat: 'stealth', effect: 'Allows trade even during an Embargo. You lose 1 IP.', emoji: '🚢', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/976f2b6ad_2.png' },
  { id: 'black_market_deal', name: 'Black Market Deal', category: 'Clandestine', cost: { gold: 2, ip: 2 }, heroStat: 'stealth', effect: 'Double the resources you gain for trade. Lose 1 IP.', emoji: '💰', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/1c353a27f_3.png' },
  { id: 'theft_ring', name: 'Theft Ring', category: 'Clandestine', cost: { ip: 2, gold: 2 }, heroStat: 'stealth', effect: 'Steal 3 Resources of your choice from another player. Roll d6 (2+ succeeds). Cost: 2 IP.', emoji: '💎', image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b732e420481df67e8a6804/26e6fdc0d_5.png' },
  { id: 'spy_infiltration', name: 'Spy Infiltration', category: 'Clandestine', cost: { ip: 2, gold: 2 }, heroStat: 'stealth', effect: 'Force a player to reveal their hand. Cost: 2 IP.', emoji: '❄️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b51e084ed_6.png' },
  { id: 'shadow_network', name: 'Shadow Network', category: 'Clandestine', cost: { ip: 2, gold: 2 }, heroStat: 'stealth', effect: 'Look at a player\'s objectives. Cost: 2 IP.', emoji: '👻', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b51e084ed_6.png' },
  { id: 'assassination_attempt', name: 'Assassination Attempt', category: 'Clandestine', cost: { sp: 3, ip: 2 }, heroStat: 'stealth', effect: 'Remove a Hero for 4 turns. Roll d6 (4+ succeeds).', emoji: '⚔️', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/1c0a9a922_7.png' },
  { id: 'kingslayer', name: 'Kingslayer', category: 'Clandestine', cost: { sp: 3, ip: 3 }, heroStat: 'stealth', effect: 'Remove a Leader from the game. Roll d6 (4+ succeeds).', emoji: '👑', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/5183c5ac5_8.png' },
  { id: 'blackmail_card', name: 'Blackmail', category: 'Clandestine', cost: { ip: 3 }, heroStat: 'stealth', effect: 'Force a player to give you a card of your choice.', emoji: '📋', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/27d3b8efa_9.png' },
  { id: 'sabotage_card', name: 'Sabotage', category: 'Clandestine', cost: { sp: 1, ip: 1 }, heroStat: 'stealth', effect: 'Disable an enemy building for 2 turns. Roll d6 (2+ succeeds).', emoji: '💣', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/5f2afa0da_10.png' },
  { id: 'orchestrated_fire', name: 'Orchestrated Fire', category: 'Clandestine', cost: { sp: 2, ip: 1 }, heroStat: 'stealth', effect: 'Downgrade an enemy building. Roll d6 (3+ succeeds).', emoji: '🔥', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/4124a5a6f_11.png' },
  { id: 'surgical_strike', name: 'Surgical Strike', category: 'Clandestine', cost: { sp: 3, ip: 2 }, heroStat: 'stealth', effect: 'Destroy enemy building. Roll d6 (4+ succeeds).', emoji: '💥', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/b06534e71_12.png' },
  { id: 'surgical_strike_v2', name: 'Surgical Strike', category: 'Clandestine', cost: { sp: 3, ip: 2 }, heroStat: 'stealth', effect: 'Destroy enemy building. Roll d6 (4+ succeeds).', emoji: '💥', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/e2ed3f1d9_13.png' },
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
    {
      id: 'guardian_eternal', name: 'Guardian of the Eternal Emperor', tier: 'Lesser',
      cost: { sacrificeUnit: 1, crystals: 2 }, gateLevel: 1, duration: 3,
      passive: 'Eternal Vigil: All friendly units in the same province roll +1 when defending.',
      active: 'Soul Surge: Spend 2 SP to grant all units in the same battle +2 to their rolls for one round. Use once per summon.',
      emoji: '🔱', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ac7245089_19.png'
    },
    {
      id: 'elder_protectors', name: 'Elder Protectors', tier: 'Intermediate',
      cost: { sp: 2, crystals: 3 }, gateLevel: 2, duration: 3,
      passive: 'Waters of Silence: Enemy units entering your province roll -1 on their first attack roll, as if the spirit drowns their will to fight.',
      active: 'Tidal Awakening: Spend 3 SP — force your enemy to reroll any one dice action and take the lowest result. Once per round.',
      emoji: '🌊', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/6ec299a80_20.png'
    },
    {
      id: 'eternal_emperor', name: 'The Eternal Emperor', tier: 'Legendary',
      cost: { sp: 4, crystals: 5 }, gateLevel: 3, duration: 3,
      passive: 'Throne of Shadows: At the start of your turn, gain +2 IP.',
      active: 'Kneel Before Me (once per game): Spend 5 IP to seize full control of an entire province. Enemy units in that region must immediately retreat to the nearest adjacent region or be destroyed.',
      emoji: '👹', image: 'https://media.base44.com/images/public/69b732e420481df67e8a6804/ca56fd4c2_18.png'
    },
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