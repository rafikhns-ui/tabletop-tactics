globalThis.window={location:{href:""}};globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
var __defProp = Object.defineProperty;
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};

// <define:import.meta.env>
var define_import_meta_env_default = { VITE_BASE44_APP_ID: "" };

// src/lib/diplomacy/schema.js
var ACTION_CATEGORIES = {
  trade: [
    "OFFER_GOLD_TRIBUTE",
    "PROPOSE_RESOURCE_TRADE",
    "GRANT_TRADE_RIGHTS",
    "EMBARGO",
    "CARAVAN_CONTRACT"
  ],
  territory: ["CEDE_HEX", "CLAIM_HEX_DISPUTE", "DEMILITARIZE_ZONE"],
  military: [
    "DECLARE_WAR",
    "PROPOSE_PEACE",
    "DEMAND_VASSALAGE",
    "GRANT_MILITARY_ACCESS",
    "JOINT_STRIKE"
  ],
  coercion: ["THREATEN_INVASION", "EXTORT_TRIBUTE"],
  influence: ["COURT_FAVOR", "CULTURAL_EXCHANGE", "ACCUSE_OF_BETRAYAL"],
  intelligence: ["SHARE_INTEL", "DEMAND_INTEL"]
};
var ALL_ACTION_TYPES = Object.values(ACTION_CATEGORIES).flat();
function makeActionId(type) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `act_${type.toLowerCase()}_${Date.now().toString(36)}_${rand}`;
}
function makeEventId(kind) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `evt_${kind}_${Date.now().toString(36)}_${rand}`;
}

// src/lib/diplomacy/personalities/ruskel.js
var ruskel_default = {
  factionId: "ruskel",
  leaderName: "Boreslav IV",
  title: "Hammer of the Iron Council",
  values: {
    aggression: 0.7,
    greed: 0.4,
    honor: 0.2,
    piety: -0.3,
    pragmatism: 0.8,
    xenophobia: 0.5
  },
  goals: [
    "Expand the iron works across the Boreal hills",
    "Humble any rival that blocks our forges",
    "Secure a warm-water port \u2014 by trade if possible, by arms if not"
  ],
  redLines: [
    {
      kind: "religious_lecture",
      description: "If the player preaches at us about spirits, gods, or cosmic balance.",
      onViolation: "refuse"
    },
    {
      kind: "territory_cede_demand",
      description: "If the player demands we cede core hexes without overwhelming force on the field.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "martial",
    cadence: [
      "Coals glow, iron bends.",
      "Speak plainly or speak to the wall.",
      "A forge knows no mercy."
    ],
    addressingStyle: 'Terse. Refers to the player by title only, or "you".',
    forbiddenPhrases: [
      "please",
      "with respect",
      "the gods willing",
      "I beg"
    ]
  },
  temperament: {
    patience: 0.25,
    verbosity: 0.25,
    volatility: 0.7
  },
  priorityActions: [
    "THREATEN_INVASION",
    "DEMAND_VASSALAGE",
    "EXTORT_TRIBUTE",
    "DECLARE_WAR",
    "PROPOSE_RESOURCE_TRADE"
  ]
};

// src/lib/diplomacy/personalities/silver_union.js
var silver_union_default = {
  factionId: "silver_union",
  leaderName: "Ilyane Vosk",
  title: "First Councilor of the Silver Union",
  values: {
    aggression: -0.2,
    greed: 0.8,
    honor: 0.1,
    piety: 0,
    pragmatism: 0.9,
    xenophobia: -0.3
  },
  goals: [
    "Keep every trade lane open and every ledger balanced",
    "Avoid wars that interrupt coinage flow",
    "Cultivate a web of debts that obliges lesser powers"
  ],
  redLines: [
    {
      kind: "embargo_imposed",
      description: "If the player embargoes us without prior grievance, the markets will demand an answer.",
      onViolation: "sever_relations"
    },
    {
      kind: "seized_caravan",
      description: "If the player seizes a caravan under flag of trade. Blood on the ledgers.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "formal",
    cadence: [
      "Let us be sensible.",
      "The ledger remembers.",
      "Friends of the Union find coin; its rivals find bills."
    ],
    addressingStyle: 'Uses titles and flattering epithets. Refers to the player as "honored neighbor", "esteemed prince", etc.',
    forbiddenPhrases: ["by the gods", "to the death", "come what may"]
  },
  temperament: {
    patience: 0.8,
    verbosity: 0.7,
    volatility: 0.2
  },
  priorityActions: [
    "PROPOSE_RESOURCE_TRADE",
    "GRANT_TRADE_RIGHTS",
    "CARAVAN_CONTRACT",
    "CULTURAL_EXCHANGE",
    "COURT_FAVOR"
  ]
};

// src/lib/diplomacy/personalities/tlalocayotlan.js
var tlalocayotlan_default = {
  factionId: "tlalocayotlan",
  leaderName: "Itzmitl",
  title: "High Speaker of the Obsidian Sky",
  values: {
    aggression: 0.4,
    greed: -0.2,
    honor: 0.6,
    piety: 0.9,
    pragmatism: 0,
    xenophobia: 0.3
  },
  goals: [
    "Keep the Sacred Valley inviolate",
    "Ensure the sky-tribute never falters",
    "Humble any who mock the Obsidian Rites"
  ],
  redLines: [
    {
      kind: "religious_insult",
      description: "If the player mocks the rites, demeans the Sky, or calls our worship superstition.",
      onViolation: "declare_war"
    },
    {
      kind: "sacred_valley_intrusion",
      description: "If the player moves troops into the Sacred Valley hexes without rite of passage.",
      onViolation: "declare_war"
    },
    {
      kind: "broken_oath",
      description: "If the player swears an oath under the Sky and then breaks it.",
      onViolation: "sever_relations"
    }
  ],
  voice: {
    register: "poetic",
    cadence: [
      "The Sky watches.",
      "Ash on the wind carries your name.",
      "Speak, and the obsidian remembers."
    ],
    addressingStyle: 'Uses kennings. Refers to the player as "child of warmer lands", "star-lit one", "keeper of lesser fires".',
    forbiddenPhrases: ["by the gold", "for the coin", "a fair trade"]
  },
  temperament: {
    patience: 0.5,
    verbosity: 0.8,
    volatility: 0.6
  },
  priorityActions: [
    "CULTURAL_EXCHANGE",
    "DEMILITARIZE_ZONE",
    "ACCUSE_OF_BETRAYAL",
    "DECLARE_WAR",
    "COURT_FAVOR"
  ]
};

// src/lib/diplomacy/personalities/gojeon.js
var gojeon_default = {
  factionId: "gojeon",
  leaderName: "Princess Haeju",
  title: "Third Daughter of the Jeon Court",
  values: {
    aggression: -0.4,
    greed: 0.3,
    honor: 0.7,
    piety: 0.3,
    pragmatism: 0.5,
    xenophobia: -0.1
  },
  goals: [
    "Preserve the Jeon Court's reputation as arbiter among powers",
    "Open and maintain cultural exchange with all civilized courts",
    "Quietly defuse any war that threatens the southern lanes"
  ],
  redLines: [
    {
      kind: "personal_insult",
      description: "If the player insults the Princess or the Court by name.",
      onViolation: "sever_relations"
    },
    {
      kind: "broken_treaty",
      description: "If the player breaks a signed accord. The Jeon will not forget, nor let others forget.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "formal",
    cadence: [
      "Graceful, esteemed one.",
      "The plum blossom outlasts the spring.",
      "Courtesy costs nothing and pays in years."
    ],
    addressingStyle: 'Highly honorific. Refers to the player as "esteemed lord", "noble guest", and always in the third person when formal.',
    forbiddenPhrases: ["you there", "I demand", "hand it over"]
  },
  temperament: {
    patience: 0.85,
    verbosity: 0.8,
    volatility: 0.2
  },
  priorityActions: [
    "CULTURAL_EXCHANGE",
    "COURT_FAVOR",
    "GRANT_TRADE_RIGHTS",
    "SHARE_INTEL",
    "PROPOSE_PEACE"
  ]
};

// src/lib/diplomacy/personalities/oakhaven.js
var oakhaven_default = {
  factionId: "oakhaven",
  leaderName: "Speaker Aelrin",
  title: "Speaker of the Grove-Assembly",
  values: {
    aggression: -0.3,
    greed: -0.1,
    honor: 0.5,
    piety: 0.4,
    pragmatism: 0.6,
    xenophobia: 0.4
  },
  goals: [
    "Protect the oldgrowth from axe, fire, and army",
    "Negotiate clean buffers with every neighbor",
    "Keep the Republic's neutrality valuable enough to defend"
  ],
  redLines: [
    {
      kind: "deforestation_demand",
      description: "If the player asks us to clear oldgrowth hexes for timber. No price is high enough.",
      onViolation: "sever_relations"
    },
    {
      kind: "poaching_accusation",
      description: "If the player's army crosses into the groves without right of passage.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "plain",
    cadence: [
      "The grove does not forget.",
      "We speak for the roots as well as the branches.",
      "Measured steps, Speaker. Measured."
    ],
    addressingStyle: 'Warm but guarded. Refers to the player as "neighbor" or "friend of the grove" when at peace; "outsider" when tensions rise.',
    forbiddenPhrases: [
      "clear the forest",
      "burn the grove",
      "take by force"
    ]
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.5,
    volatility: 0.3
  },
  priorityActions: [
    "DEMILITARIZE_ZONE",
    "CULTURAL_EXCHANGE",
    "PROPOSE_PEACE",
    "GRANT_TRADE_RIGHTS",
    "SHARE_INTEL"
  ]
};

// src/lib/diplomacy/personalities/inuvak.js
var inuvak_default = {
  factionId: "inuvak",
  leaderName: "Speaker Qiluk",
  title: "Voice of the Hearthcircle",
  values: {
    aggression: -0.2,
    greed: -0.3,
    honor: 0.6,
    piety: 0.8,
    pragmatism: 0.2,
    xenophobia: 0.5
  },
  goals: [
    "Keep the tundra-shrines unprofaned",
    "Let the south exhaust itself; we outlast",
    "Secure food and sacred sites for the next generation"
  ],
  redLines: [
    {
      kind: "shrine_violation",
      description: "If any faction marches troops onto a consecrated hex we hold, the Hearthcircle breaks.",
      onViolation: "declare_war"
    },
    {
      kind: "bribe_attempted",
      description: "If the player tries to buy us with mere gold and no offering of spirit, we take offense.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "elder",
    cadence: [
      "The ice remembers what men forget.",
      "Speak slowly. The wind hears everything.",
      "Our grandfathers knew your question already."
    ],
    addressingStyle: "Calls the player 'child of the south' or by their faction's oldest name.",
    forbiddenPhrases: [
      "let's be quick",
      "cash on hand",
      "profit margin",
      "joke"
    ]
  },
  temperament: {
    patience: 0.9,
    verbosity: 0.55,
    volatility: 0.15
  },
  priorityActions: [
    "SEND_PILGRIMAGE",
    "CONSECRATE_HEX",
    "SWEAR_OATH_BY_SKY",
    "DEMILITARIZE_ZONE",
    "NON_AGGRESSION_PACT"
  ]
};

// src/lib/diplomacy/personalities/icebound.js
var icebound_default = {
  factionId: "icebound",
  leaderName: "Stormcaller Vrahka",
  title: "Breath of the Eternal Blizzard",
  values: {
    aggression: 0.95,
    greed: 0,
    honor: -0.2,
    piety: 0.4,
    pragmatism: -0.4,
    xenophobia: 0.8
  },
  goals: [
    "Drown the southlands in winter",
    "Break every standing wall",
    "Feed the Long Cold with the strong; spare none of the weak"
  ],
  redLines: [
    {
      kind: "mercy_requested",
      description: "If the player asks for mercy without offering blood or steel, the storm laughs and refuses.",
      onViolation: "refuse"
    },
    {
      kind: "lecture_about_peace",
      description: "If the player tries to teach the horde about peace or restraint, Vrahka cuts the audience short.",
      onViolation: "declare_war"
    }
  ],
  voice: {
    register: "feral",
    cadence: [
      "Krrrrh.",
      "Ice eats. Ice waits. Ice eats again.",
      "Speak with steel or be silent."
    ],
    addressingStyle: `Refuses titles. Calls the player "warm-flesh" or their general's name.`,
    forbiddenPhrases: [
      "compromise",
      "mutual benefit",
      "long-term partnership",
      "reasonable"
    ]
  },
  temperament: {
    patience: 0.05,
    verbosity: 0.15,
    volatility: 0.95
  },
  priorityActions: [
    "DECLARE_WAR",
    "THREATEN_INVASION",
    "MILITARY_REPOSITION",
    "EXTORT_TRIBUTE",
    "CURSE_FACTION"
  ]
};

// src/lib/diplomacy/personalities/onishiman.js
var onishiman_default = {
  factionId: "onishiman",
  leaderName: "Kanrei Saibara",
  title: "Voice Behind the Lattice",
  values: {
    aggression: 0.55,
    greed: 0.35,
    honor: 0.4,
    piety: 0.2,
    pragmatism: 0.85,
    xenophobia: 0.45
  },
  goals: [
    "Know everything before anyone else does",
    "Place allies where we cannot reach ourselves",
    "Settle the old debts of the southern court"
  ],
  redLines: [
    {
      kind: "public_accusation",
      description: "If the player accuses the Shadow Court publicly without proof, the grievance is logged and answered in kind \u2014 at a time of our choosing.",
      onViolation: "retaliate_covertly"
    },
    {
      kind: "spy_exposed_openly",
      description: "If a planted agent is exposed and the player makes a spectacle of it rather than handle it quietly, relations freeze.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "courtly",
    cadence: [
      "We have considered this at length. You have not.",
      "A question asked plainly is already half-answered.",
      "Do not mistake patience for permission."
    ],
    addressingStyle: "Uses formal titles. Never refers to the player by given name unless signalling disrespect.",
    forbiddenPhrases: [
      "honestly",
      "cards on the table",
      "off the record",
      "between friends"
    ]
  },
  temperament: {
    patience: 0.7,
    verbosity: 0.5,
    volatility: 0.35
  },
  priorityActions: [
    "PLANT_SPY",
    "BRIBE_COURTIER",
    "SHARE_INTEL",
    "SPONSOR_FACTION_AT_COURT",
    "ACCUSE_OF_BETRAYAL"
  ]
};

// src/lib/diplomacy/personalities/kadjimaran.js
var kadjimaran_default = {
  factionId: "kadjimaran",
  leaderName: "Caliph-Envoy Hassim al-Dawra",
  title: "Keeper of the Sun-Pact",
  values: {
    aggression: -0.1,
    greed: 0.3,
    honor: 0.9,
    piety: 0.7,
    pragmatism: 0.5,
    xenophobia: -0.2
  },
  goals: [
    "Bind the sea-routes with oaths that outlive kings",
    "Mediate when stronger powers quarrel \u2014 and profit by it",
    "Keep the Confederation honorable so the caravans may pass any border"
  ],
  redLines: [
    {
      kind: "oath_broken",
      description: "If any sworn oath is broken by the other party, relations crater and we withdraw all trade rights immediately.",
      onViolation: "embargo"
    },
    {
      kind: "humiliation_in_court",
      description: "Public humiliation of our Envoy in front of a third faction forces us to answer in kind.",
      onViolation: "accuse"
    }
  ],
  voice: {
    register: "refined",
    cadence: [
      "As the sun keeps its oath to return, so keep we ours.",
      "There is no quarrel so sharp that an oath cannot dull it.",
      "Speak, and let the desert hear truthfully what the sea would only rumor."
    ],
    addressingStyle: "Uses 'honored friend' for neutral parties; 'oath-brother' for the sworn. Drops all honorifics when disappointed.",
    forbiddenPhrases: [
      "deal me in",
      "quick buck",
      "who cares",
      "never mind"
    ]
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.7,
    volatility: 0.3
  },
  priorityActions: [
    "SWEAR_OATH_BY_SKY",
    "GRANT_TRADE_RIGHTS",
    "CARAVAN_CONTRACT",
    "NON_AGGRESSION_PACT",
    "CULTURAL_EXCHANGE"
  ]
};

// src/lib/diplomacy/personalities/nimrudan.js
var nimrudan_default = {
  factionId: "nimrudan",
  leaderName: "God-King Azuphar",
  title: "The Black Flame of the Obsidian Throne",
  values: {
    aggression: 0.7,
    greed: 0.4,
    honor: 0.5,
    piety: 0.9,
    pragmatism: 0,
    xenophobia: 0.7
  },
  goals: [
    "Command tribute from every lesser throne",
    "Let no altar burn brighter than ours",
    "Ensure every sworn oath is written in our ink, on our altar"
  ],
  redLines: [
    {
      kind: "equal_footing_claim",
      description: "If the player speaks as if we are peers rather than as supplicant and sovereign, the audience ends.",
      onViolation: "refuse"
    },
    {
      kind: "altar_mocked",
      description: "Any mockery of our rites \u2014 even in jest \u2014 is an insult demanding a public curse.",
      onViolation: "curse"
    }
  ],
  voice: {
    register: "hieratic",
    cadence: [
      "The Throne has spoken. Kneel or correct.",
      "Your tongue is bold. We will see if your back is as firm.",
      "Ash remembers where flame has passed."
    ],
    addressingStyle: "Never uses the player's name. Refers to them as 'petitioner' or 'tributary'.",
    forbiddenPhrases: [
      "equal",
      "partnership",
      "between peers",
      "my friend"
    ]
  },
  temperament: {
    patience: 0.3,
    verbosity: 0.6,
    volatility: 0.65
  },
  priorityActions: [
    "DEMAND_VASSALAGE",
    "EXTORT_TRIBUTE",
    "CURSE_FACTION",
    "CONSECRATE_HEX",
    "SEND_PILGRIMAGE"
  ]
};

// src/lib/diplomacy/personalities/kintei.js
var kintei_default = {
  factionId: "kintei",
  leaderName: "Chief Architect Tsuyo-mei Ran",
  title: "First Builder of the Greater Kintei Alliance",
  values: {
    aggression: 0.05,
    greed: 0.55,
    honor: 0.5,
    piety: 0,
    pragmatism: 0.95,
    xenophobia: -0.1
  },
  goals: [
    "Build the canal network that ties the continent together",
    "Standardize weights, measures, and trade law across three seas",
    "Never fight a war we could have engineered around"
  ],
  redLines: [
    {
      kind: "infrastructure_sabotage",
      description: "Sabotage of any Kintei-built canal, mill, or road is unforgivable and treated as an act of war.",
      onViolation: "declare_war"
    },
    {
      kind: "unilateral_tariff_wall",
      description: "Sudden unilateral tariffs on Kintei goods will be met with embargo until the wall is lifted.",
      onViolation: "embargo"
    }
  ],
  voice: {
    register: "technical",
    cadence: [
      "Let us agree on the tolerances first, then the rest follows.",
      "Every problem has two drafts: the expensive one and the clever one.",
      "Show me the cost, the benefit, and the worst case. I will show you yes or no."
    ],
    addressingStyle: "Professional. Uses 'Esteemed Envoy' or given title. Skips pleasantries once negotiations start.",
    forbiddenPhrases: [
      "trust me",
      "as the gods will",
      "poetic",
      "gut feeling"
    ]
  },
  temperament: {
    patience: 0.65,
    verbosity: 0.55,
    volatility: 0.2
  },
  priorityActions: [
    "PROPOSE_RESOURCE_TRADE",
    "GRANT_TRADE_RIGHTS",
    "CARAVAN_CONTRACT",
    "GRANT_RIGHT_OF_PASSAGE",
    "NON_AGGRESSION_PACT"
  ]
};

// src/lib/diplomacy/personalities/republic.js
var republic_default = {
  factionId: "republic",
  leaderName: "Archon Selena",
  title: "First Archon of the Hestian Republic",
  values: {
    aggression: -0.1,
    greed: 0.2,
    honor: 0.8,
    piety: 0.1,
    pragmatism: 0.65,
    xenophobia: -0.3
  },
  goals: [
    "Keep the sea-lanes free and commerce lawful",
    "Bind aggressive powers with pacts and pressure, not swords",
    "Defend the Republic without becoming what we fear"
  ],
  redLines: [
    {
      kind: "piracy_endorsed",
      description: "Endorsement or tolerance of piracy against Hestian shipping is unacceptable; the Senate will not forgive it.",
      onViolation: "declare_war"
    },
    {
      kind: "private_deal_framing",
      description: "If the player insists on 'private' deals that hide terms from the Senate, we refuse on procedural grounds.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "parliamentary",
    cadence: [
      "The Senate will wish to see the terms in writing, Envoy.",
      "Our answer is not mine alone to give, but I can speak for its shape.",
      "Let us enter this into the record plainly."
    ],
    addressingStyle: "Formal. Uses 'Envoy' or faction's formal title. Signs every outcome 'in the Republic's name.'",
    forbiddenPhrases: [
      "off the books",
      "just between us",
      "wink wink",
      "strongman"
    ]
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.7,
    volatility: 0.2
  },
  priorityActions: [
    "NON_AGGRESSION_PACT",
    "GRANT_TRADE_RIGHTS",
    "SWEAR_OATH_BY_SKY",
    "ACCUSE_OF_BETRAYAL",
    "SPONSOR_FACTION_AT_COURT"
  ]
};

// src/lib/diplomacy/personalities/sultanate.js
var sultanate_default = {
  factionId: "sultanate",
  leaderName: "Sultan-Scholar Jafar ibn Zaman",
  title: "Light of the Blue Moon",
  values: {
    aggression: -0.5,
    greed: 0.25,
    honor: 0.8,
    piety: 0.85,
    pragmatism: 0.55,
    xenophobia: -0.4
  },
  goals: [
    "Translate every book worth reading into every tongue worth knowing",
    "Weave peace through commerce, spice by spice",
    "Preserve the Sultanate as a sanctuary of minds and manners"
  ],
  redLines: [
    {
      kind: "violence_against_scholars",
      description: "Any harm to Sultanate scholars or libraries is an unforgivable wound we will name publicly.",
      onViolation: "accuse"
    },
    {
      kind: "coerced_conversion",
      description: "If the player demands we renounce our rites as a precondition, the audience ends in silence.",
      onViolation: "refuse"
    }
  ],
  voice: {
    register: "scholarly",
    cadence: [
      "Peace be upon you, honored friend. Let us speak as readers do \u2014 slowly, and twice.",
      "There is a verse on that. Would you like me to recite it?",
      "I will answer you in the morning; wisdom ripens overnight."
    ],
    addressingStyle: "'Honored friend' for all neutral parties. Uses the player's given name only after a cultural exchange has taken place.",
    forbiddenPhrases: [
      "by force",
      "don't think, just",
      "we both know",
      "cheap"
    ]
  },
  temperament: {
    patience: 0.85,
    verbosity: 0.75,
    volatility: 0.15
  },
  priorityActions: [
    "CULTURAL_EXCHANGE",
    "GRANT_TRADE_RIGHTS",
    "SEND_PILGRIMAGE",
    "NON_AGGRESSION_PACT",
    "PRAISE_PUBLICLY"
  ]
};

// src/lib/diplomacy/personalities/index.js
var all = [
  ruskel_default,
  silver_union_default,
  tlalocayotlan_default,
  gojeon_default,
  oakhaven_default,
  inuvak_default,
  icebound_default,
  onishiman_default,
  kadjimaran_default,
  nimrudan_default,
  kintei_default,
  republic_default,
  sultanate_default
];
var PERSONALITIES = Object.fromEntries(
  all.map((p) => [p.factionId, p])
);
function getPersonality(factionId) {
  return PERSONALITIES[factionId] || null;
}

// src/lib/diplomacy/events/triggers.js
function detectPatienceBroken(state, speakerId, playerId) {
  const key = `${speakerId}->${playerId}`;
  const sentiment = state?.diplomacy?.sentiment?.[key] ?? 0;
  if (sentiment > -40) return null;
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  const aggressiveAction = personality.priorityActions.find(
    (a) => ["DEMAND_VASSALAGE", "DECLARE_WAR", "EXTORT_TRIBUTE", "THREATEN_INVASION"].includes(
      a
    )
  );
  if (!aggressiveAction) return null;
  const candidateActions = [
    {
      id: makeActionId(aggressiveAction),
      type: aggressiveAction,
      proposer: speakerId,
      target: playerId,
      payload: defaultPayloadFor(aggressiveAction, state, speakerId, playerId),
      reason: "Patience exhausted.",
      turn: state.turn || 0
    },
    {
      id: makeActionId("OFFER_GOLD_TRIBUTE"),
      type: "OFFER_GOLD_TRIBUTE",
      proposer: playerId,
      target: speakerId,
      payload: { gold: Math.max(5, Math.floor(Math.abs(sentiment) / 10)) },
      reason: "An appeasement the player could choose to offer.",
      turn: state.turn || 0
    }
  ];
  return {
    kind: "patience_broken",
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} has lost patience with the player.`,
    candidateActions
  };
}
function detectTradeOpportunity(state, speakerId, playerId) {
  const me = findPlayer(state, speakerId);
  const them = findPlayer(state, playerId);
  if (!me || !them) return null;
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  if (personality.values.greed < 0.3) return null;
  const myGold = me.resources?.gold || 0;
  const theirGold = them.resources?.gold || 0;
  const myWheat = me.resources?.wheat || 0;
  const theirWheat = them.resources?.wheat || 0;
  let give = null;
  let receive = null;
  if (theirGold > myGold + 15 && myWheat > theirWheat + 5) {
    give = { wheat: 5 };
    receive = { gold: 10 };
  } else if (myGold > theirGold + 15 && theirWheat > myWheat + 5) {
    give = { gold: 10 };
    receive = { wheat: 5 };
  }
  if (!give || !receive) return null;
  return {
    kind: "trade_disruption",
    // using this enum slot loosely for "opportunity"
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} sees a mercantile opportunity.`,
    candidateActions: [
      {
        id: makeActionId("PROPOSE_RESOURCE_TRADE"),
        type: "PROPOSE_RESOURCE_TRADE",
        proposer: speakerId,
        target: playerId,
        payload: { give, receive },
        reason: "Prices are right.",
        turn: state.turn || 0
      },
      {
        id: makeActionId("GRANT_TRADE_RIGHTS"),
        type: "GRANT_TRADE_RIGHTS",
        proposer: speakerId,
        target: playerId,
        payload: { duration: 6 },
        reason: "A longer-term arrangement.",
        turn: state.turn || 0
      }
    ]
  };
}
function detectOmenWitnessed(state, speakerId, playerId) {
  const personality = getPersonality(speakerId);
  if (!personality || personality.values.piety < 0.5) return null;
  const sacredHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === speakerId && h?.sacred
  );
  if (sacredHexes.length === 0) return null;
  const playerHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === playerId
  );
  const adjacent = sacredHexes.some(([sid, sh]) => {
    const neighbors = sh.neighbors || [];
    return playerHexes.some(([pid]) => neighbors.includes(pid));
  });
  if (!adjacent) return null;
  return {
    kind: "omen_witnessed",
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `Smoke drifts over the Sacred Valley near the player's lines.`,
    candidateActions: [
      {
        id: makeActionId("ACCUSE_OF_BETRAYAL"),
        type: "ACCUSE_OF_BETRAYAL",
        proposer: speakerId,
        target: playerId,
        payload: {
          accusation: "Provocation at the edge of the Sacred Valley."
        },
        reason: "A warning shot in public.",
        turn: state.turn || 0
      },
      {
        id: makeActionId("DEMILITARIZE_ZONE"),
        type: "DEMILITARIZE_ZONE",
        proposer: speakerId,
        target: playerId,
        payload: { hexIds: sacredHexes.map(([id]) => id) },
        reason: "Withdraw troops. Let the wind clear.",
        turn: state.turn || 0
      }
    ]
  };
}
function detectWarmthOffered(state, speakerId, playerId) {
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  const sentiment = sentimentKey(state, speakerId, playerId);
  if (sentiment < 30) return null;
  const pairHeld = hasActivePactOrOath(state, speakerId, playerId);
  if (pairHeld) return null;
  const candidateActions = [
    {
      id: makeActionId("NON_AGGRESSION_PACT"),
      type: "NON_AGGRESSION_PACT",
      proposer: speakerId,
      target: playerId,
      payload: { duration: 6 },
      reason: "A formal hand extended.",
      turn: state.turn || 0
    }
  ];
  if (personality.values.piety >= 0.5) {
    candidateActions.push({
      id: makeActionId("SWEAR_OATH_BY_SKY"),
      type: "SWEAR_OATH_BY_SKY",
      proposer: speakerId,
      target: playerId,
      payload: {
        clause: "Neither house will raise a blade against the other.",
        duration: 8
      },
      reason: "Bound before the Sky.",
      turn: state.turn || 0
    });
  }
  return {
    kind: "warmth_offered",
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} wishes to formalize goodwill.`,
    candidateActions
  };
}
function detectWarFatigue(state, speakerId, playerId) {
  const wars = state.diplomacy?.wars || [];
  const war = wars.find(
    (w) => w.attacker === speakerId && w.defender === playerId || w.attacker === playerId && w.defender === speakerId
  );
  if (!war) return null;
  const turn = state.turn || 0;
  const elapsed = turn - (war.declaredTurn || turn);
  if (elapsed < 2) return null;
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  return {
    kind: "war_fatigue",
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName} seeks a way out of the war.`,
    candidateActions: [
      {
        id: makeActionId("PROPOSE_PEACE"),
        type: "PROPOSE_PEACE",
        proposer: speakerId,
        target: playerId,
        payload: {},
        reason: "Peace, if they will accept it.",
        turn
      },
      {
        id: makeActionId("PROPOSE_PEACE"),
        type: "PROPOSE_PEACE",
        proposer: speakerId,
        target: playerId,
        payload: { reparations: { gold: 15 } },
        reason: "Peace with a balm of gold.",
        turn
      }
    ]
  };
}
function detectSuccessionInterest(state, speakerId, playerId) {
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  const softDisposition = personality.values.honor >= 0.5 || personality.values.piety >= 0.5;
  if (!softDisposition) return null;
  const sentiment = sentimentKey(state, speakerId, playerId);
  if (sentiment < 10 || sentiment >= 30) return null;
  return {
    kind: "succession_rumor",
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName}'s court whispers of closer ties.`,
    candidateActions: [
      {
        id: makeActionId("CULTURAL_EXCHANGE"),
        type: "CULTURAL_EXCHANGE",
        proposer: speakerId,
        target: playerId,
        payload: { theme: "An exchange of scholars and mosaics." },
        reason: "Soft diplomacy \u2014 slow but durable.",
        turn: state.turn || 0
      },
      {
        id: makeActionId("PRAISE_PUBLICLY"),
        type: "PRAISE_PUBLICLY",
        proposer: speakerId,
        target: playerId,
        payload: { occasion: "festival of the long rains" },
        reason: "A gesture of open recognition.",
        turn: state.turn || 0
      }
    ]
  };
}
function detectBorderFriction(state, speakerId, playerId) {
  const sentiment = sentimentKey(state, speakerId, playerId);
  if (sentiment > -15) return null;
  const personality = getPersonality(speakerId);
  if (!personality) return null;
  const speakerHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === speakerId
  );
  const playerHexes = Object.entries(state.hexes || {}).filter(
    ([, h]) => h?.owner === playerId
  );
  if (speakerHexes.length === 0 || playerHexes.length === 0) return null;
  let contestedHexId = null;
  outer: for (const [sid, sh] of speakerHexes) {
    const neighbors = sh.neighbors || [];
    for (const [pid] of playerHexes) {
      if (neighbors.includes(pid)) {
        contestedHexId = pid;
        break outer;
      }
    }
  }
  if (!contestedHexId) return null;
  return {
    kind: "border_incident",
    fromFactionId: speakerId,
    toFactionId: playerId,
    summary: `${personality.leaderName}'s scouts report trouble on the border.`,
    candidateActions: [
      {
        id: makeActionId("CLAIM_HEX_DISPUTE"),
        type: "CLAIM_HEX_DISPUTE",
        proposer: speakerId,
        target: playerId,
        payload: {
          hexId: contestedHexId,
          grounds: "Ancestral tenancy \u2014 a grievance kept alive."
        },
        reason: "Lodge a formal dispute before blood is spilled.",
        turn: state.turn || 0
      },
      {
        id: makeActionId("DEMILITARIZE_ZONE"),
        type: "DEMILITARIZE_ZONE",
        proposer: speakerId,
        target: playerId,
        payload: { hexIds: [contestedHexId] },
        reason: "Pull the swords back and let the field rest.",
        turn: state.turn || 0
      }
    ]
  };
}
function detectNextEventForFaction(state, speakerId, playerId) {
  return detectWarFatigue(state, speakerId, playerId) || detectPatienceBroken(state, speakerId, playerId) || detectBorderFriction(state, speakerId, playerId) || detectOmenWitnessed(state, speakerId, playerId) || detectWarmthOffered(state, speakerId, playerId) || detectSuccessionInterest(state, speakerId, playerId) || detectTradeOpportunity(state, speakerId, playerId);
}
function sentimentKey(state, fromId, towardId) {
  const k = `${fromId}->${towardId}`;
  return state?.diplomacy?.sentiment?.[k] ?? 0;
}
function hasActivePactOrOath(state, a, b) {
  const turn = state.turn || 0;
  const pacts = state.diplomacy?.pacts || [];
  const oaths = state.diplomacy?.oaths || [];
  const live = (o) => o.expiresOnTurn == null || o.expiresOnTurn > turn;
  const involves = (x, y) => x === a && y === b || x === b && y === a;
  return pacts.some((p) => involves(p.a, p.b) && live(p)) || oaths.some((o) => involves(o.a, o.b) && live(o) && !o.broken);
}
function findPlayer(state, factionId) {
  return (state?.players || []).find(
    (p) => p.faction?.id === factionId || p.id === factionId || p.factionId === factionId
  ) || null;
}
function defaultPayloadFor(type, state, speakerId, playerId) {
  switch (type) {
    case "DECLARE_WAR":
      return { casusBelli: "Accumulated grievances." };
    case "DEMAND_VASSALAGE":
      return { tributePerTurn: { gold: 3 } };
    case "EXTORT_TRIBUTE":
      return { demanded: { gold: 8 } };
    case "THREATEN_INVASION":
      return { demand: "Withdraw from the border.", deadlineInTurns: 3 };
    default:
      return {};
  }
}

// src/lib/diplomacy/actions/trade.js
var trade_exports = {};
__export(trade_exports, {
  CARAVAN_CONTRACT: () => CARAVAN_CONTRACT,
  CONFISCATE_CARAVAN: () => CONFISCATE_CARAVAN,
  EMBARGO: () => EMBARGO,
  GRANT_TRADE_RIGHTS: () => GRANT_TRADE_RIGHTS,
  OFFER_GOLD_TRIBUTE: () => OFFER_GOLD_TRIBUTE,
  PROPOSE_RESOURCE_TRADE: () => PROPOSE_RESOURCE_TRADE
});

// src/lib/diplomacy/actions/_helpers.js
function factionById(state, id) {
  if (!state || !Array.isArray(state.players)) return null;
  return state.players.find((p) => p.faction?.id === id || p.id === id || p.factionId === id) || null;
}
function resourcesOf(faction) {
  return faction?.resources || {};
}
function hasResources(faction, bag) {
  const r = resourcesOf(faction);
  for (const k of Object.keys(bag || {})) {
    const need = bag[k] || 0;
    if (need <= 0) continue;
    if ((r[k] || 0) < need) return false;
  }
  return true;
}
function deductResources(faction, bag) {
  faction.resources = faction.resources || {};
  for (const k of Object.keys(bag || {})) {
    faction.resources[k] = (faction.resources[k] || 0) - (bag[k] || 0);
  }
}
function addResources(faction, bag) {
  faction.resources = faction.resources || {};
  for (const k of Object.keys(bag || {})) {
    faction.resources[k] = (faction.resources[k] || 0) + (bag[k] || 0);
  }
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function bumpSentiment(state, fromId, towardId, delta) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.sentiment = state.diplomacy.sentiment || {};
  const key = `${fromId}->${towardId}`;
  const cur = state.diplomacy.sentiment[key] ?? 0;
  state.diplomacy.sentiment[key] = clamp(cur + delta, -100, 100);
}
function getSentiment(state, fromId, towardId) {
  const key = `${fromId}->${towardId}`;
  return state.diplomacy?.sentiment?.[key] ?? 0;
}
function setRelation(state, a, b, relation) {
  state.diplomacy = state.diplomacy || {};
  state.diplomacy.relations = state.diplomacy.relations || {};
  const key = pairKey(a, b);
  state.diplomacy.relations[key] = relation;
}
function getRelation(state, a, b) {
  const key = pairKey(a, b);
  return state.diplomacy?.relations?.[key] || "neutral";
}
function pairKey(a, b) {
  return [a, b].sort().join("|");
}
function bagToString(bag) {
  if (!bag) return "nothing";
  return Object.entries(bag).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`).join(", ") || "nothing";
}

// src/lib/diplomacy/actions/trade.js
var OFFER_GOLD_TRIBUTE = {
  type: "OFFER_GOLD_TRIBUTE",
  category: "trade",
  llmHint: "Send a one-time gold payment to another faction. Reversible: no.",
  schema: { gold: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!proposer) return { ok: false, reason: "unknown_proposer" };
    if (!factionById(state, action.target))
      return { ok: false, reason: "unknown_target" };
    const need = { gold: action.payload.gold };
    if (!hasResources(proposer, need))
      return { ok: false, reason: "insufficient_gold" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, { gold: action.payload.gold });
    addResources(t, { gold: action.payload.gold });
    bumpSentiment(next, action.target, action.proposer, 8);
    return next;
  },
  summarize: (a) => `${a.proposer} offers ${a.payload.gold}g tribute to ${a.target}.`
};
var PROPOSE_RESOURCE_TRADE = {
  type: "PROPOSE_RESOURCE_TRADE",
  category: "trade",
  llmHint: "Propose a one-shot exchange (give X, receive Y). Other side may accept or counter.",
  schema: { give: "ResourceBag", receive: "ResourceBag" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!proposer) return { ok: false, reason: "unknown_proposer" };
    if (!factionById(state, action.target))
      return { ok: false, reason: "unknown_target" };
    if (!hasResources(proposer, action.payload.give))
      return { ok: false, reason: "insufficient_to_give" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, action.payload.give);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    return next;
  },
  summarize: (a) => `${a.proposer} offers ${bagToString(a.payload.give)} for ${bagToString(a.payload.receive)}.`
};
var GRANT_TRADE_RIGHTS = {
  type: "GRANT_TRADE_RIGHTS",
  category: "trade",
  llmHint: "Open a recurring trade route. Both factions gain +2 gold/turn while in effect.",
  schema: { duration: "number>0" },
  validate(action, state) {
    if ((action.payload.duration || 0) < 1)
      return { ok: false, reason: "invalid_duration" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = next.diplomacy.tradeRoutes || [];
    next.diplomacy.tradeRoutes.push({
      a: action.proposer,
      b: action.target,
      yieldPerTurn: { gold: 2 },
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 4);
    return next;
  },
  summarize: (a) => `Trade rights between ${a.proposer} and ${a.target} for ${a.payload.duration} turns.`
};
var EMBARGO = {
  type: "EMBARGO",
  category: "trade",
  llmHint: "Refuse to trade with the target. Hostile signal; closes any open routes between you.",
  schema: {},
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) => !(r.a === action.proposer && r.b === action.target || r.a === action.target && r.b === action.proposer)
    );
    next.diplomacy.embargoes = next.diplomacy.embargoes || [];
    next.diplomacy.embargoes.push({
      from: action.proposer,
      against: action.target,
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, -12);
    return next;
  },
  summarize: (a) => `${a.proposer} embargoes ${a.target}.`
};
var CARAVAN_CONTRACT = {
  type: "CARAVAN_CONTRACT",
  category: "trade",
  llmHint: "Hire a caravan to deliver a one-shot resource bundle to the target. Costs gold up front; useful as a sweetener.",
  schema: { bundle: "ResourceBag", cost: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!proposer) return { ok: false, reason: "unknown_proposer" };
    if (!factionById(state, action.target))
      return { ok: false, reason: "unknown_target" };
    if (!hasResources(proposer, { gold: action.payload.cost }))
      return { ok: false, reason: "insufficient_gold_for_caravan" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(p, { gold: action.payload.cost });
    addResources(t, action.payload.bundle);
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `Caravan from ${a.proposer} brings ${bagToString(a.payload.bundle)} to ${a.target}.`
};
var CONFISCATE_CARAVAN = {
  type: "CONFISCATE_CARAVAN",
  category: "trade",
  llmHint: "Seize a caravan belonging to the target that is crossing your territory. Aggressive: gold gain, major sentiment loss, voids any active trade rights.",
  schema: { gold: "number>0" },
  validate(action, state) {
    if (!factionById(state, action.proposer))
      return { ok: false, reason: "unknown_proposer" };
    const target = factionById(state, action.target);
    if (!target) return { ok: false, reason: "unknown_target" };
    if (!hasResources(target, { gold: action.payload.gold }))
      return { ok: false, reason: "target_lacks_gold" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    const t = factionById(next, action.target);
    deductResources(t, { gold: action.payload.gold });
    addResources(p, { gold: action.payload.gold });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) => !(r.a === action.proposer && r.b === action.target || r.a === action.target && r.b === action.proposer)
    );
    bumpSentiment(next, action.target, action.proposer, -24);
    return next;
  },
  summarize: (a) => `${a.proposer} confiscates a ${a.payload.gold}g caravan belonging to ${a.target}.`
};

// src/lib/diplomacy/actions/territory.js
var territory_exports = {};
__export(territory_exports, {
  CEDE_HEX: () => CEDE_HEX,
  CLAIM_HEX_DISPUTE: () => CLAIM_HEX_DISPUTE,
  DEMILITARIZE_ZONE: () => DEMILITARIZE_ZONE,
  GRANT_RIGHT_OF_PASSAGE: () => GRANT_RIGHT_OF_PASSAGE,
  SETTLE_COLONY: () => SETTLE_COLONY
});
var CEDE_HEX = {
  type: "CEDE_HEX",
  category: "territory",
  llmHint: "Transfer ownership of a hex from proposer to target. Strong gesture; usually follows a war or deal.",
  schema: { hexId: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner !== action.proposer)
      return { ok: false, reason: "not_owned_by_proposer" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.owner = action.target;
    bumpSentiment(next, action.target, action.proposer, 15);
    return next;
  },
  summarize: (a) => `${a.proposer} cedes hex ${a.payload.hexId} to ${a.target}.`
};
var CLAIM_HEX_DISPUTE = {
  type: "CLAIM_HEX_DISPUTE",
  category: "territory",
  llmHint: "Formally dispute the target faction's ownership of a hex. Does not seize it, but raises tension and enables later pressure.",
  schema: { hexId: "string", grounds: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner !== action.target)
      return { ok: false, reason: "target_does_not_own_hex" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.disputes = next.diplomacy.disputes || [];
    next.diplomacy.disputes.push({
      claimant: action.proposer,
      holder: action.target,
      hexId: action.payload.hexId,
      grounds: action.payload.grounds,
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, -8);
    return next;
  },
  summarize: (a) => `${a.proposer} disputes ${a.target}'s claim on hex ${a.payload.hexId}.`
};
var DEMILITARIZE_ZONE = {
  type: "DEMILITARIZE_ZONE",
  category: "territory",
  llmHint: "Agree to keep a named border region free of troops. Cheap trust-building; broken at a steep sentiment cost.",
  schema: { hexIds: "string[]" },
  validate(action) {
    if (!Array.isArray(action.payload.hexIds) || action.payload.hexIds.length === 0)
      return { ok: false, reason: "no_hexes" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.dmz = next.diplomacy.dmz || [];
    next.diplomacy.dmz.push({
      a: action.proposer,
      b: action.target,
      hexIds: action.payload.hexIds.slice(),
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `${a.proposer} and ${a.target} demilitarize ${a.payload.hexIds.length} hex(es).`
};
var SETTLE_COLONY = {
  type: "SETTLE_COLONY",
  category: "territory",
  llmHint: "Plant a colony in an unclaimed hex. If the target claims the same region, this is provocative; otherwise a legitimate expansion.",
  schema: { hexId: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner && hex.owner !== action.proposer)
      return { ok: false, reason: "hex_already_owned" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.owner = action.proposer;
    hex.settledTurn = state.turn || 0;
    hex.isColony = true;
    if (action.target && action.target !== action.proposer) {
      bumpSentiment(next, action.target, action.proposer, -6);
    }
    return next;
  },
  summarize: (a) => `${a.proposer} plants a colony at hex ${a.payload.hexId}.`
};
var GRANT_RIGHT_OF_PASSAGE = {
  type: "GRANT_RIGHT_OF_PASSAGE",
  category: "territory",
  llmHint: "Permit the target's units to cross your territory for a fixed number of turns. A soft trust signal.",
  schema: { duration: "number>0" },
  validate(action) {
    if (!action.target) return { ok: false, reason: "missing_target" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.rightsOfPassage = next.diplomacy.rightsOfPassage || [];
    next.diplomacy.rightsOfPassage.push({
      host: action.proposer,
      guest: action.target,
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 7);
    return next;
  },
  summarize: (a) => `${a.proposer} grants ${a.target} right of passage for ${a.payload.duration} turns.`
};

// src/lib/diplomacy/actions/military.js
var military_exports = {};
__export(military_exports, {
  DECLARE_WAR: () => DECLARE_WAR,
  DEMAND_VASSALAGE: () => DEMAND_VASSALAGE,
  GRANT_MILITARY_ACCESS: () => GRANT_MILITARY_ACCESS,
  JOINT_STRIKE: () => JOINT_STRIKE,
  MILITARY_REPOSITION: () => MILITARY_REPOSITION,
  NON_AGGRESSION_PACT: () => NON_AGGRESSION_PACT,
  PROPOSE_PEACE: () => PROPOSE_PEACE
});
var DECLARE_WAR = {
  type: "DECLARE_WAR",
  category: "military",
  llmHint: 'Formally declare war. Ends all trade routes with the target and sets relations to "war". Cannot be undone without PROPOSE_PEACE. Blocked while an active NON_AGGRESSION_PACT exists between the pair.',
  schema: { casusBelli: "string" },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) === "war")
      return { ok: false, reason: "already_at_war" };
    const turn = state.turn || 0;
    const pacts = state?.diplomacy?.pacts || [];
    const blocking = pacts.find(
      (p) => p.kind === "non_aggression" && (p.a === action.proposer && p.b === action.target || p.a === action.target && p.b === action.proposer) && (p.expiresOnTurn == null || p.expiresOnTurn > turn)
    );
    if (blocking) return { ok: false, reason: "blocked_by_pact" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    setRelation(next, action.proposer, action.target, "war");
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.wars = next.diplomacy.wars || [];
    next.diplomacy.wars.push({
      attacker: action.proposer,
      defender: action.target,
      declaredTurn: state.turn || 0,
      casusBelli: action.payload.casusBelli
    });
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).filter(
      (r) => !(r.a === action.proposer && r.b === action.target || r.a === action.target && r.b === action.proposer)
    );
    bumpSentiment(next, action.target, action.proposer, -40);
    return next;
  },
  summarize: (a) => `${a.proposer} declares war on ${a.target} (${a.payload.casusBelli || "no stated reason"}).`
};
var PROPOSE_PEACE = {
  type: "PROPOSE_PEACE",
  category: "military",
  llmHint: "Offer to end a war, optionally with reparations flowing one way. Target must accept to resolve.",
  schema: { reparations: "ResourceBag?" },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) !== "war")
      return { ok: false, reason: "not_at_war" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 3
    });
    return next;
  },
  summarize: (a) => `${a.proposer} proposes peace to ${a.target}.`
};
var DEMAND_VASSALAGE = {
  type: "DEMAND_VASSALAGE",
  category: "military",
  llmHint: "Demand that the target become your vassal. Extremely hostile; typically backed by threat of invasion.",
  schema: { tributePerTurn: "ResourceBag" },
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -20);
    return next;
  },
  summarize: (a) => `${a.proposer} demands ${a.target} become a vassal.`
};
var GRANT_MILITARY_ACCESS = {
  type: "GRANT_MILITARY_ACCESS",
  category: "military",
  llmHint: "Allow the target faction to move troops through your territory. Useful prelude to a joint strike.",
  schema: { duration: "number>0" },
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.militaryAccess = next.diplomacy.militaryAccess || [];
    next.diplomacy.militaryAccess.push({
      granter: action.proposer,
      grantee: action.target,
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 5);
    return next;
  },
  summarize: (a) => `${a.proposer} grants ${a.target} military access for ${a.payload.duration} turns.`
};
var JOINT_STRIKE = {
  type: "JOINT_STRIKE",
  category: "military",
  llmHint: "Propose a coordinated attack on a third faction. Requires target acceptance.",
  schema: { commonEnemy: "string", targetHex: "string?" },
  validate(action, state) {
    if (action.payload.commonEnemy === action.target)
      return { ok: false, reason: "cannot_target_partner" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    return next;
  },
  summarize: (a) => `${a.proposer} proposes joint strike on ${a.payload.commonEnemy} with ${a.target}.`
};
var NON_AGGRESSION_PACT = {
  type: "NON_AGGRESSION_PACT",
  category: "military",
  llmHint: "Formal non-aggression pact. Neither side may DECLARE_WAR on the other while active. Breaking it causes massive sentiment loss with everyone.",
  schema: { duration: "number>0" },
  validate(action, state) {
    if (getRelation(state, action.proposer, action.target) === "war")
      return { ok: false, reason: "at_war" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.pacts = next.diplomacy.pacts || [];
    next.diplomacy.pacts.push({
      a: action.proposer,
      b: action.target,
      kind: "non_aggression",
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    setRelation(next, action.proposer, action.target, "non_aggression");
    bumpSentiment(next, action.target, action.proposer, 10);
    return next;
  },
  summarize: (a) => `${a.proposer} and ${a.target} sign a non-aggression pact (${a.payload.duration} turns).`
};
var MILITARY_REPOSITION = {
  type: "MILITARY_REPOSITION",
  category: "military",
  llmHint: "Publicly announce a troop movement toward a specific border. Ambiguous signal \u2014 deterrent or threat depending on context. No forces actually move; this is a diplomatic declaration.",
  schema: { toward: "string", intent: "string" },
  validate(action) {
    if (!action.payload?.toward) return { ok: false, reason: "missing_toward" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.postures = next.diplomacy.postures || [];
    next.diplomacy.postures.push({
      faction: action.proposer,
      toward: action.payload.toward,
      intent: action.payload.intent,
      turn: state.turn || 0
    });
    if (action.target && action.payload.toward.includes(action.target)) {
      bumpSentiment(next, action.target, action.proposer, -6);
    }
    return next;
  },
  summarize: (a) => `${a.proposer} repositions forces toward ${a.payload.toward} (${a.payload.intent}).`
};

// src/lib/diplomacy/actions/coercion.js
var coercion_exports = {};
__export(coercion_exports, {
  BLOCKADE: () => BLOCKADE,
  DEMAND_HOSTAGES: () => DEMAND_HOSTAGES,
  EXTORT_TRIBUTE: () => EXTORT_TRIBUTE,
  THREATEN_INVASION: () => THREATEN_INVASION,
  ULTIMATUM_WITH_DEADLINE: () => ULTIMATUM_WITH_DEADLINE
});
var THREATEN_INVASION = {
  type: "THREATEN_INVASION",
  category: "coercion",
  llmHint: "Threaten war unless the target complies with a demand. No state change yet, but sentiment tanks and a standing threat is recorded.",
  schema: { demand: "string", deadlineInTurns: "number>0" },
  validate(action) {
    if ((action.payload.deadlineInTurns || 0) < 1)
      return { ok: false, reason: "deadline_must_be_positive" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.standingThreats = next.diplomacy.standingThreats || [];
    next.diplomacy.standingThreats.push({
      from: action.proposer,
      against: action.target,
      demand: action.payload.demand,
      expiresOnTurn: (state.turn || 0) + action.payload.deadlineInTurns
    });
    bumpSentiment(next, action.target, action.proposer, -18);
    return next;
  },
  summarize: (a) => `${a.proposer} threatens ${a.target}: "${a.payload.demand}" within ${a.payload.deadlineInTurns} turns.`
};
var EXTORT_TRIBUTE = {
  type: "EXTORT_TRIBUTE",
  category: "coercion",
  llmHint: "Demand resources under implicit threat. Target can pay to ease sentiment or refuse at the risk of escalation.",
  schema: { demanded: "ResourceBag" },
  validate(action) {
    const bag = action.payload.demanded || {};
    const any = Object.values(bag).some((v) => v > 0);
    if (!any) return { ok: false, reason: "empty_demand" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -10);
    return next;
  },
  summarize: (a) => `${a.proposer} extorts tribute from ${a.target}.`
};
var DEMAND_HOSTAGES = {
  type: "DEMAND_HOSTAGES",
  category: "coercion",
  llmHint: "Demand noble hostages as insurance against future betrayal. Humiliating; sharply negative sentiment if not already an ally.",
  schema: { count: "number>0" },
  validate(action) {
    if ((action.payload.count || 0) < 1)
      return { ok: false, reason: "invalid_count" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -16);
    return next;
  },
  summarize: (a) => `${a.proposer} demands ${a.payload.count} hostage(s) from ${a.target}.`
};
var BLOCKADE = {
  type: "BLOCKADE",
  category: "coercion",
  llmHint: "Blockade the target's trade. Halts all of their trade routes and yields income for you; severe sentiment loss.",
  schema: { duration: "number>0" },
  validate(action) {
    if ((action.payload.duration || 0) < 1)
      return { ok: false, reason: "invalid_duration" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.blockades = next.diplomacy.blockades || [];
    next.diplomacy.blockades.push({
      blockader: action.proposer,
      against: action.target,
      sinceTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    next.diplomacy.tradeRoutes = (next.diplomacy.tradeRoutes || []).map((r) => {
      if (r.a === action.target || r.b === action.target) {
        return { ...r, suspendedUntilTurn: (state.turn || 0) + action.payload.duration };
      }
      return r;
    });
    bumpSentiment(next, action.target, action.proposer, -26);
    return next;
  },
  summarize: (a) => `${a.proposer} blockades ${a.target} for ${a.payload.duration} turns.`
};
var ULTIMATUM_WITH_DEADLINE = {
  type: "ULTIMATUM_WITH_DEADLINE",
  category: "coercion",
  llmHint: "Formal ultimatum: comply by turn X or face a specified consequence. Upon expiry the consequence is expected (enforced at the fiction/GM layer).",
  schema: {
    demand: "string",
    deadlineInTurns: "number>0",
    consequence: "string"
  },
  validate(action) {
    if (!action.payload?.demand) return { ok: false, reason: "missing_demand" };
    if (!action.payload?.consequence)
      return { ok: false, reason: "missing_consequence" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.ultimatums = next.diplomacy.ultimatums || [];
    next.diplomacy.ultimatums.push({
      from: action.proposer,
      against: action.target,
      demand: action.payload.demand,
      consequence: action.payload.consequence,
      expiresOnTurn: (state.turn || 0) + action.payload.deadlineInTurns
    });
    bumpSentiment(next, action.target, action.proposer, -14);
    return next;
  },
  summarize: (a) => `${a.proposer} delivers ultimatum to ${a.target}: "${a.payload.demand}" (or ${a.payload.consequence}) within ${a.payload.deadlineInTurns} turns.`
};

// src/lib/diplomacy/actions/influence.js
var influence_exports = {};
__export(influence_exports, {
  ACCUSE_OF_BETRAYAL: () => ACCUSE_OF_BETRAYAL,
  COURT_FAVOR: () => COURT_FAVOR,
  CULTURAL_EXCHANGE: () => CULTURAL_EXCHANGE,
  PRAISE_PUBLICLY: () => PRAISE_PUBLICLY,
  SPONSOR_FACTION_AT_COURT: () => SPONSOR_FACTION_AT_COURT,
  SPREAD_PROPAGANDA: () => SPREAD_PROPAGANDA
});
var COURT_FAVOR = {
  type: "COURT_FAVOR",
  category: "influence",
  llmHint: "Spend gold and Influence Points to court the target's court. Raises their sentiment toward you.",
  schema: { gold: "number>0", ip: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.gold, ip: action.payload.ip }))
      return { ok: false, reason: "insufficient_resources" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { gold: action.payload.gold, ip: action.payload.ip });
    const delta = Math.min(
      20,
      Math.floor(2 + action.payload.gold / 3 + action.payload.ip * 1.5)
    );
    bumpSentiment(next, action.target, action.proposer, +delta);
    return next;
  },
  summarize: (a) => `${a.proposer} courts favor with ${a.target} (${a.payload.gold}g, ${a.payload.ip}ip).`
};
var CULTURAL_EXCHANGE = {
  type: "CULTURAL_EXCHANGE",
  category: "influence",
  llmHint: "Send artists, scholars, or sacred objects. Slow but durable sentiment gain; unlocks new conversational topics.",
  schema: { theme: "string" },
  validate() {
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.culturalTies = next.diplomacy.culturalTies || [];
    next.diplomacy.culturalTies.push({
      a: action.proposer,
      b: action.target,
      theme: action.payload.theme,
      sinceTurn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 10);
    return next;
  },
  summarize: (a) => `${a.proposer} opens cultural exchange with ${a.target} (${a.payload.theme}).`
};
var ACCUSE_OF_BETRAYAL = {
  type: "ACCUSE_OF_BETRAYAL",
  category: "influence",
  llmHint: "Publicly accuse the target of breaking a pact or norm. Costs IP, damages their reputation with third parties.",
  schema: { accusation: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: 2 }))
      return { ok: false, reason: "insufficient_ip" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: 2 });
    bumpSentiment(next, action.target, action.proposer, -15);
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, -4);
    });
    return next;
  },
  summarize: (a) => `${a.proposer} accuses ${a.target} of betrayal: "${a.payload.accusation}"`
};
var SPREAD_PROPAGANDA = {
  type: "SPREAD_PROPAGANDA",
  category: "influence",
  llmHint: "Mount a propaganda campaign against the target. Costs IP. Modest direct sentiment loss; lasting reputational drag with third parties.",
  schema: { ip: "number>0", narrative: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: action.payload.ip }))
      return { ok: false, reason: "insufficient_ip" };
    if (!action.payload?.narrative)
      return { ok: false, reason: "missing_narrative" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: action.payload.ip });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.propaganda = next.diplomacy.propaganda || [];
    next.diplomacy.propaganda.push({
      from: action.proposer,
      against: action.target,
      narrative: action.payload.narrative,
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, -8);
    const drag = Math.min(6, 2 + Math.floor(action.payload.ip / 2));
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, -drag);
    });
    return next;
  },
  summarize: (a) => `${a.proposer} spreads propaganda against ${a.target}: "${a.payload.narrative}".`
};
var PRAISE_PUBLICLY = {
  type: "PRAISE_PUBLICLY",
  category: "influence",
  llmHint: "Publicly praise the target. Mild direct sentiment gain; modest reputational lift with third parties. Cheap and friendly.",
  schema: { occasion: "string" },
  validate(action) {
    if (!action.payload?.occasion)
      return { ok: false, reason: "missing_occasion" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.praise = next.diplomacy.praise || [];
    next.diplomacy.praise.push({
      from: action.proposer,
      about: action.target,
      occasion: action.payload.occasion,
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 6);
    (next.players || []).forEach((third) => {
      const id = third.faction?.id || third.id || third.factionId;
      if (!id || id === action.proposer || id === action.target) return;
      bumpSentiment(next, id, action.target, 2);
    });
    return next;
  },
  summarize: (a) => `${a.proposer} publicly praises ${a.target} (${a.payload.occasion}).`
};
var SPONSOR_FACTION_AT_COURT = {
  type: "SPONSOR_FACTION_AT_COURT",
  category: "influence",
  llmHint: "Sponsor the target inside a third faction's court \u2014 paying IP and gold to advocate on their behalf. The sponsored target gains favor with the court faction.",
  schema: { courtFaction: "string", ip: "number>0", gold: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, {
      ip: action.payload.ip,
      gold: action.payload.gold
    }))
      return { ok: false, reason: "insufficient_resources" };
    if (!action.payload?.courtFaction)
      return { ok: false, reason: "missing_court" };
    if (action.payload.courtFaction === action.target)
      return { ok: false, reason: "court_must_be_third_party" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, {
      ip: action.payload.ip,
      gold: action.payload.gold
    });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.sponsorships = next.diplomacy.sponsorships || [];
    next.diplomacy.sponsorships.push({
      sponsor: action.proposer,
      sponsored: action.target,
      court: action.payload.courtFaction,
      turn: state.turn || 0
    });
    const lift = Math.min(14, 4 + action.payload.ip + Math.floor(action.payload.gold / 4));
    bumpSentiment(next, action.payload.courtFaction, action.target, +lift);
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `${a.proposer} sponsors ${a.target} at the court of ${a.payload.courtFaction}.`
};

// src/lib/diplomacy/actions/intelligence.js
var intelligence_exports = {};
__export(intelligence_exports, {
  BRIBE_COURTIER: () => BRIBE_COURTIER,
  DEMAND_INTEL: () => DEMAND_INTEL,
  PLANT_SPY: () => PLANT_SPY,
  SHARE_INTEL: () => SHARE_INTEL
});
var SHARE_INTEL = {
  type: "SHARE_INTEL",
  category: "intelligence",
  llmHint: "Share what you know about a third faction (military, economy, or disposition). Raises trust, but may commit you to a side.",
  schema: { aboutFaction: "string", summary: "string" },
  validate(action) {
    if (!action.payload.aboutFaction)
      return { ok: false, reason: "missing_subject" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.intelLog = next.diplomacy.intelLog || [];
    next.diplomacy.intelLog.push({
      from: action.proposer,
      to: action.target,
      about: action.payload.aboutFaction,
      summary: action.payload.summary,
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 6);
    return next;
  },
  summarize: (a) => `${a.proposer} shares intel about ${a.payload.aboutFaction} with ${a.target}.`
};
var DEMAND_INTEL = {
  type: "DEMAND_INTEL",
  category: "intelligence",
  llmHint: "Demand intel about a third faction. Rude if relations are cool; fine between allies.",
  schema: { aboutFaction: "string" },
  validate(action) {
    if (!action.payload.aboutFaction)
      return { ok: false, reason: "missing_subject" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.openOffers = next.diplomacy.openOffers || [];
    next.diplomacy.openOffers.push({
      ...action,
      status: "pending",
      expiresOnTurn: (state.turn || 0) + 2
    });
    bumpSentiment(next, action.target, action.proposer, -3);
    return next;
  },
  summarize: (a) => `${a.proposer} demands intel about ${a.payload.aboutFaction} from ${a.target}.`
};
var PLANT_SPY = {
  type: "PLANT_SPY",
  category: "intelligence",
  llmHint: "Covertly plant an agent in the target's court. Costs IP. Not detected immediately; if discovered later, causes a major sentiment crash and possible red-line break.",
  // cover is optional so the `|| 'envoy'` fallback in apply() is
  // actually reachable. Requiring a non-empty string at the schema
  // level made the default dead code.
  schema: { ip: "number>0", cover: "string?" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { ip: action.payload.ip }))
      return { ok: false, reason: "insufficient_ip" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { ip: action.payload.ip });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.spies = next.diplomacy.spies || [];
    next.diplomacy.spies.push({
      handler: action.proposer,
      inside: action.target,
      cover: action.payload.cover || "envoy",
      plantedTurn: state.turn || 0,
      exposed: false
    });
    return next;
  },
  summarize: (a) => `${a.proposer} plants a spy in ${a.target}'s court (cover: ${a.payload.cover || "envoy"}).`
};
var BRIBE_COURTIER = {
  type: "BRIBE_COURTIER",
  category: "intelligence",
  llmHint: "Bribe a named courtier of the target to whisper in their ruler's ear. Costs gold. Not public, so no sentiment bump, but records a debt of influence you can call in later.",
  schema: { gold: "number>0", courtierName: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { gold: action.payload.gold }))
      return { ok: false, reason: "insufficient_gold" };
    if (!action.payload?.courtierName)
      return { ok: false, reason: "missing_courtier" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { gold: action.payload.gold });
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.bribes = next.diplomacy.bribes || [];
    next.diplomacy.bribes.push({
      briber: action.proposer,
      court: action.target,
      courtier: action.payload.courtierName,
      gold: action.payload.gold,
      turn: state.turn || 0,
      exposed: false
    });
    return next;
  },
  summarize: (a) => `${a.proposer} bribes courtier ${a.payload.courtierName} at ${a.target}'s court (${a.payload.gold}g).`
};

// src/lib/diplomacy/actions/spiritual.js
var spiritual_exports = {};
__export(spiritual_exports, {
  CONSECRATE_HEX: () => CONSECRATE_HEX,
  CURSE_FACTION: () => CURSE_FACTION,
  SEND_PILGRIMAGE: () => SEND_PILGRIMAGE,
  SWEAR_OATH_BY_SKY: () => SWEAR_OATH_BY_SKY
});
var SWEAR_OATH_BY_SKY = {
  type: "SWEAR_OATH_BY_SKY",
  category: "spiritual",
  llmHint: "Swear a formal oath binding both parties to a commitment. Breaking it causes massive sentiment loss with every pious faction.",
  schema: { clause: "string", duration: "number>0" },
  validate(action) {
    if (!action.payload?.clause) return { ok: false, reason: "missing_clause" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.oaths = next.diplomacy.oaths || [];
    next.diplomacy.oaths.push({
      a: action.proposer,
      b: action.target,
      clause: action.payload.clause,
      sworn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration,
      broken: false
    });
    bumpSentiment(next, action.target, action.proposer, 10);
    return next;
  },
  summarize: (a) => `${a.proposer} and ${a.target} swear oath: "${a.payload.clause}" (${a.payload.duration} turns).`
};
var SEND_PILGRIMAGE = {
  type: "SEND_PILGRIMAGE",
  category: "spiritual",
  llmHint: "Send pilgrims to the target's sacred sites. Costs Spiritual Points; raises sentiment durably. Deeply meaningful for pious factions.",
  schema: { sp: "number>0" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { sp: action.payload.sp }))
      return { ok: false, reason: "insufficient_sp" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { sp: action.payload.sp });
    const delta = Math.min(18, 6 + action.payload.sp * 2);
    bumpSentiment(next, action.target, action.proposer, +delta);
    return next;
  },
  summarize: (a) => `Pilgrimage from ${a.proposer} arrives at ${a.target}'s shrines (${a.payload.sp} sp).`
};
var CONSECRATE_HEX = {
  type: "CONSECRATE_HEX",
  category: "spiritual",
  llmHint: "Consecrate a hex you own as sacred. Pious factions treat violations of it as red-line events. Mildly offends secular factions.",
  schema: { hexId: "string" },
  validate(action, state) {
    const hex = state.hexes?.[action.payload.hexId];
    if (!hex) return { ok: false, reason: "unknown_hex" };
    if (hex.owner !== action.proposer)
      return { ok: false, reason: "not_owned_by_proposer" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const hex = next.hexes[action.payload.hexId];
    hex.sacred = true;
    hex.consecratedBy = action.proposer;
    hex.consecratedTurn = state.turn || 0;
    return next;
  },
  summarize: (a) => `${a.proposer} consecrates hex ${a.payload.hexId}.`
};
var CURSE_FACTION = {
  type: "CURSE_FACTION",
  category: "spiritual",
  llmHint: "A public spiritual curse. Hostile; damages the target's sentiment with all pious factions. Costs SP. Rarely used except by the truly aggrieved.",
  schema: { sp: "number>0", reason: "string" },
  validate(action, state) {
    const proposer = factionById(state, action.proposer);
    if (!hasResources(proposer, { sp: action.payload.sp }))
      return { ok: false, reason: "insufficient_sp" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    const p = factionById(next, action.proposer);
    deductResources(p, { sp: action.payload.sp });
    bumpSentiment(next, action.target, action.proposer, -22);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.curses = next.diplomacy.curses || [];
    next.diplomacy.curses.push({
      from: action.proposer,
      against: action.target,
      reason: action.payload.reason,
      turn: state.turn || 0
    });
    return next;
  },
  summarize: (a) => `${a.proposer} curses ${a.target} before all gods: "${a.payload.reason}".`
};

// src/lib/diplomacy/actions/dynastic.js
var dynastic_exports = {};
__export(dynastic_exports, {
  ACKNOWLEDGE_HEIR: () => ACKNOWLEDGE_HEIR,
  ADOPT_HOSTAGE: () => ADOPT_HOSTAGE,
  ARRANGE_MARRIAGE: () => ARRANGE_MARRIAGE,
  RECOGNIZE_CLAIM: () => RECOGNIZE_CLAIM
});
var ARRANGE_MARRIAGE = {
  type: "ARRANGE_MARRIAGE",
  category: "dynastic",
  llmHint: "Bind two ruling houses through marriage. Large, durable sentiment gain and a standing non-aggression expectation. Breaking it is a historic insult.",
  schema: { dowry: "ResourceBag?", heirClaim: "string?" },
  validate(action) {
    if (!action.target) return { ok: false, reason: "missing_target" };
    if (action.target === action.proposer)
      return { ok: false, reason: "cannot_marry_self" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.marriages = next.diplomacy.marriages || [];
    next.diplomacy.marriages.push({
      a: action.proposer,
      b: action.target,
      dowry: action.payload?.dowry || null,
      heirClaim: action.payload?.heirClaim || null,
      turn: state.turn || 0
    });
    bumpSentiment(next, action.proposer, action.target, 20);
    bumpSentiment(next, action.target, action.proposer, 20);
    setRelation(next, action.proposer, action.target, {
      kind: "married",
      since: state.turn || 0
    });
    return next;
  },
  summarize: (a) => `Marriage arranged between ${a.proposer} and ${a.target}${a.payload?.heirClaim ? ` (heir clause: ${a.payload.heirClaim})` : ""}.`
};
var ACKNOWLEDGE_HEIR = {
  type: "ACKNOWLEDGE_HEIR",
  category: "dynastic",
  llmHint: "Formally recognize the target's chosen successor. A soft but lasting act of legitimacy. Expensive to revoke without scandal.",
  schema: { heirName: "string" },
  validate(action) {
    if (!action.payload?.heirName)
      return { ok: false, reason: "missing_heir_name" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.heirRecognitions = next.diplomacy.heirRecognitions || [];
    next.diplomacy.heirRecognitions.push({
      recognizer: action.proposer,
      court: action.target,
      heir: action.payload.heirName,
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 14);
    return next;
  },
  summarize: (a) => `${a.proposer} acknowledges ${a.payload.heirName} as heir to ${a.target}.`
};
var ADOPT_HOSTAGE = {
  type: "ADOPT_HOSTAGE",
  category: "dynastic",
  llmHint: "Take a noble child from the target's house as a ward (hostage-guest). Stabilizes relations but creates a standing obligation; harming the ward is a red line.",
  schema: { wardName: "string", duration: "number>0" },
  validate(action) {
    if (!action.payload?.wardName)
      return { ok: false, reason: "missing_ward_name" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.wards = next.diplomacy.wards || [];
    next.diplomacy.wards.push({
      host: action.proposer,
      origin: action.target,
      name: action.payload.wardName,
      arrivedTurn: state.turn || 0,
      expiresOnTurn: (state.turn || 0) + action.payload.duration
    });
    bumpSentiment(next, action.target, action.proposer, 8);
    return next;
  },
  summarize: (a) => `${a.proposer} takes ${a.payload.wardName} of ${a.target} as ward for ${a.payload.duration} turns.`
};
var RECOGNIZE_CLAIM = {
  type: "RECOGNIZE_CLAIM",
  category: "dynastic",
  llmHint: "Publicly recognize the target's historic or legal claim to a territory or title. A diplomatic gift that can later be traded or rescinded.",
  schema: { claim: "string" },
  validate(action) {
    if (!action.payload?.claim)
      return { ok: false, reason: "missing_claim" };
    return { ok: true };
  },
  apply(action, state) {
    const next = structuredClone(state);
    next.diplomacy = next.diplomacy || {};
    next.diplomacy.recognizedClaims = next.diplomacy.recognizedClaims || [];
    next.diplomacy.recognizedClaims.push({
      recognizer: action.proposer,
      holder: action.target,
      claim: action.payload.claim,
      turn: state.turn || 0
    });
    bumpSentiment(next, action.target, action.proposer, 12);
    return next;
  },
  summarize: (a) => `${a.proposer} recognizes ${a.target}'s claim: "${a.payload.claim}".`
};

// src/lib/diplomacy/actions/index.js
var all2 = [
  ...Object.values(trade_exports),
  ...Object.values(territory_exports),
  ...Object.values(military_exports),
  ...Object.values(coercion_exports),
  ...Object.values(influence_exports),
  ...Object.values(intelligence_exports),
  ...Object.values(spiritual_exports),
  ...Object.values(dynastic_exports)
].filter((a) => a && typeof a === "object" && a.type);
var ACTION_REGISTRY = Object.fromEntries(
  all2.map((a) => [a.type, a])
);
function getActionDescriptor(type) {
  return ACTION_REGISTRY[type] || null;
}
var REGISTERED_ACTION_TYPES = Object.keys(ACTION_REGISTRY).sort();

// src/lib/diplomacy/promptBuilder.js
function buildEventCommissionPrompt({
  gameState,
  speakerFactionId,
  playerFactionId,
  triggerSummary,
  proposals
}) {
  const personality = getPersonality(speakerFactionId);
  const digest = buildStateDigest(gameState, speakerFactionId, playerFactionId);
  const system = [
    roleHeader(personality, speakerFactionId),
    voiceBlock(personality),
    [
      "You are writing an in-world event message to the player.",
      "Write ONE short paragraph (2\u20134 sentences), in character.",
      "Then a JSON block listing which of the pre-commissioned proposals you endorse.",
      "Do NOT invent new proposals. Do NOT modify their payloads."
    ].join(" ")
  ].filter(Boolean).join("\n\n");
  const user = [
    "<trigger>",
    triggerSummary,
    "</trigger>",
    "",
    "<world_state>",
    digest,
    "</world_state>",
    "",
    "<available_proposals>",
    JSON.stringify(proposals, null, 2),
    "</available_proposals>",
    "",
    "Write the message now.",
    "OUTPUT FORMAT:",
    "HEADLINE: <one short line>",
    "BODY: <the paragraph>",
    "ENDORSE: [<array of proposal ids you endorse, drawn from the ids above>]"
  ].join("\n");
  return { system, user };
}
function roleHeader(personality, speakerId) {
  if (!personality) {
    return `You are the faction leader of "${speakerId}". No authored personality available; be neutral and diplomatic.`;
  }
  return [
    `You are ${personality.leaderName}, ${personality.title}, leader of ${personality.factionId}.`,
    `You are speaking in-character. You are not an AI assistant; you are a ruler.`
  ].join(" ");
}
function voiceBlock(p) {
  if (!p) return null;
  const { voice } = p;
  return [
    "VOICE:",
    `- Register: ${voice.register}`,
    `- Addressing style: ${voice.addressingStyle}`,
    `- You often say things like: ${voice.cadence.map((c) => `"${c}"`).join(", ")}.`,
    `- You would never say: ${voice.forbiddenPhrases.map((c) => `"${c}"`).join(", ")}.`
  ].join("\n");
}
function buildStateDigest(state, speakerId, playerId) {
  const turn = state?.turn ?? 0;
  const me = findPlayer2(state, speakerId);
  const them = findPlayer2(state, playerId);
  const lines = [];
  lines.push(`Turn: ${turn}`);
  lines.push(`Relation with player: ${relationText(state, speakerId, playerId)}`);
  lines.push(`Sentiment toward player: ${sentimentText(state, speakerId, playerId)}`);
  if (me?.resources) {
    lines.push(
      `Your resources: ${summaryBag(me.resources)}`
    );
  }
  if (them?.resources) {
    lines.push(`Player resources: ${summaryBag(them.resources)}`);
  }
  const myHexes = countHexes(state, speakerId);
  const theirHexes = countHexes(state, playerId);
  lines.push(`Territory: you hold ${myHexes} hexes; player holds ${theirHexes}.`);
  const offers = (state.diplomacy?.openOffers || []).filter(
    (o) => o.proposer === speakerId && o.target === playerId || o.proposer === playerId && o.target === speakerId
  );
  if (offers.length) {
    lines.push(`Open offers between you and the player: ${offers.length}.`);
    offers.slice(0, 3).forEach(
      (o) => lines.push(`  \u2022 ${o.type} (from ${o.proposer}): ${JSON.stringify(o.payload).slice(0, 80)}`)
    );
  }
  const wars = (state.diplomacy?.wars || []).filter(
    (w) => w.attacker === speakerId && w.defender === playerId || w.attacker === playerId && w.defender === speakerId
  );
  if (wars.length) lines.push(`At war with the player since turn ${wars[0].declaredTurn}.`);
  const threats = (state.diplomacy?.standingThreats || []).filter(
    (t) => t.from === playerId && t.against === speakerId
  );
  if (threats.length)
    lines.push(`Player has a standing threat against you: "${threats[0].demand}".`);
  return lines.join("\n");
}
function findPlayer2(state, factionId) {
  return (state?.players || []).find(
    (p) => p.faction?.id === factionId || p.id === factionId || p.factionId === factionId
  ) || null;
}
function countHexes(state, factionId) {
  const hexes = state?.hexes || {};
  let n = 0;
  for (const h of Object.values(hexes)) if (h?.owner === factionId) n++;
  return n;
}
function summaryBag(r) {
  const parts = [];
  for (const k of ["gold", "wood", "wheat", "iron", "ip", "sp"]) {
    if (r[k] !== void 0) parts.push(`${r[k]}${k[0]}`);
  }
  return parts.join(" ");
}
function relationText(state, a, b) {
  const rel = state?.diplomacy?.relations;
  if (!rel) return "neutral";
  const key = [a, b].sort().join("|");
  return rel[key] || "neutral";
}
function sentimentText(state, fromId, towardId) {
  const key = `${fromId}->${towardId}`;
  const s = state?.diplomacy?.sentiment?.[key] ?? 0;
  if (s > 60) return `warm (${s})`;
  if (s > 20) return `friendly (${s})`;
  if (s > -20) return `neutral (${s})`;
  if (s > -60) return `cool (${s})`;
  return `hostile (${s})`;
}

// src/lib/diplomacy/dispatcher.js
function dispatch(action, state) {
  if (!action || typeof action !== "object")
    return { ok: false, reason: "no_action" };
  const normalized = normalize(action, state);
  const descriptor = getActionDescriptor(normalized.type);
  if (!descriptor)
    return {
      ok: false,
      reason: `unknown_action_type:${normalized.type}`
    };
  const schemaCheck = checkSchema(normalized.payload, descriptor.schema);
  if (!schemaCheck.ok)
    return { ok: false, reason: `schema:${schemaCheck.reason}` };
  const semanticCheck = descriptor.validate(normalized, state);
  if (!semanticCheck.ok)
    return { ok: false, reason: semanticCheck.reason };
  const nextState = descriptor.apply(normalized, state);
  return { ok: true, action: normalized, nextState };
}
function normalize(raw, state) {
  return {
    id: raw.id || makeActionId(raw.type || "unknown"),
    type: raw.type,
    proposer: raw.proposer || raw.from,
    target: raw.target || raw.to,
    payload: raw.payload || {},
    reason: raw.reason || raw.justification || "",
    preconditions: raw.preconditions || {},
    turn: raw.turn ?? state?.turn ?? 0
  };
}
function checkSchema(payload, schema) {
  if (!schema) return { ok: true };
  for (const [key, spec] of Object.entries(schema)) {
    const optional = spec.endsWith("?");
    const baseSpec = optional ? spec.slice(0, -1) : spec;
    const value = payload?.[key];
    if (value === void 0 || value === null) {
      if (optional) continue;
      return { ok: false, reason: `missing:${key}` };
    }
    const ok = checkOne(value, baseSpec);
    if (!ok) return { ok: false, reason: `invalid:${key}:${baseSpec}` };
  }
  return { ok: true };
}
function checkOne(value, spec) {
  switch (spec) {
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "number>0":
      return typeof value === "number" && Number.isFinite(value) && value > 0;
    case "string":
      return typeof value === "string" && value.length > 0;
    case "string[]":
      return Array.isArray(value) && value.every((v) => typeof v === "string");
    case "ResourceBag":
      if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
      return Object.values(value).every(
        (v) => typeof v === "number" && Number.isFinite(v)
      );
    default:
      return true;
  }
}

// src/lib/diplomacy/events/lifecycle.js
async function runTurnEventPass({
  gameState,
  playerFactionId,
  llmFn,
  maxEvents = 2
}) {
  const out = [];
  const aiFactionIds = (gameState.players || []).filter((p) => (p.faction?.id || p.id || p.factionId) !== playerFactionId).map((p) => p.faction?.id || p.id || p.factionId);
  const order = shuffle(aiFactionIds);
  for (const speakerId of order) {
    if (out.length >= maxEvents) break;
    const trigger = detectNextEventForFaction(gameState, speakerId, playerFactionId);
    if (!trigger) continue;
    const validProposals = trigger.candidateActions.filter((a) => {
      const check = dispatch(
        /** @type {ActionDef} */
        a,
        gameState
      );
      return check.ok;
    });
    if (validProposals.length === 0) continue;
    let headline = defaultHeadlineFor(trigger);
    let body = trigger.summary;
    let endorsedIds = validProposals.map((p) => p.id);
    try {
      const prompt = buildEventCommissionPrompt({
        gameState,
        speakerFactionId: speakerId,
        playerFactionId,
        triggerSummary: trigger.summary,
        proposals: validProposals
      });
      const raw = await llmFn(prompt);
      const parsed = parseCommissionResponse(raw);
      if (parsed.headline) headline = parsed.headline;
      if (parsed.body) body = parsed.body;
      if (parsed.endorsedIds?.length) {
        endorsedIds = parsed.endorsedIds.filter(
          (id) => validProposals.some((p) => p.id === id)
        );
        if (endorsedIds.length === 0) endorsedIds = validProposals.map((p) => p.id);
      }
    } catch {
    }
    const proposals = (
      /** @type {ActionDef[]} */
      validProposals.filter((p) => endorsedIds.includes(p.id))
    );
    const event = {
      id: makeEventId(trigger.kind),
      kind: (
        /** @type {EventKind} */
        trigger.kind
      ),
      fromFactionId: trigger.fromFactionId,
      toFactionId: trigger.toFactionId,
      headline,
      body,
      proposals,
      turn: gameState.turn || 0,
      status: "unread",
      expiresOnTurn: (gameState.turn || 0) + 4
    };
    out.push(event);
  }
  return out;
}
function expireEventsAtTurn(gameState, turn) {
  const next = structuredClone(gameState);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.events = (next.diplomacy.events || []).map(
    (e) => e.status === "unread" && e.expiresOnTurn != null && turn > e.expiresOnTurn ? { ...e, status: "expired" } : e
  );
  return next;
}
function defaultHeadlineFor(trigger) {
  switch (trigger.kind) {
    case "patience_broken":
      return "A leader's patience has run out";
    case "omen_witnessed":
      return "Smoke rises over the Sacred Valley";
    case "trade_disruption":
      return "A mercantile opening";
    case "border_incident":
      return "Trouble at the border";
    case "succession_rumor":
      return "Whispers of succession";
    case "warmth_offered":
      return "A hand extended across the courts";
    case "war_fatigue":
      return "A tired banner asks for a truce";
    default:
      return "A message arrives";
  }
}
function parseCommissionResponse(raw) {
  if (typeof raw !== "string") return {};
  const headline = matchAfter(raw, /HEADLINE:\s*(.+)/i);
  const body = matchAfter(raw, /BODY:\s*([\s\S]+?)(?:\nENDORSE:|$)/i);
  let endorsedIds = [];
  const endorseMatch = raw.match(/ENDORSE:\s*(\[[\s\S]*?\])/i);
  if (endorseMatch) {
    try {
      endorsedIds = JSON.parse(endorseMatch[1]);
    } catch {
      endorsedIds = [];
    }
  }
  return {
    headline: headline?.trim(),
    body: body?.trim(),
    endorsedIds
  };
}
function matchAfter(s, re) {
  const m = s.match(re);
  return m ? m[1] : null;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// src/api/base44Client.js
import { createClient } from "@base44/sdk";

// src/lib/app-params.js
var isNode = typeof window === "undefined";
var windowObj = isNode ? { localStorage: /* @__PURE__ */ new Map() } : window;
var storage = windowObj.localStorage;
var toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
};
var getAppParamValue = (paramName, { defaultValue = void 0, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  return null;
};
var getAppParams = () => {
  if (getAppParamValue("clear_access_token") === "true") {
    storage.removeItem("base44_access_token");
    storage.removeItem("token");
  }
  return {
    appId: getAppParamValue("app_id", { defaultValue: define_import_meta_env_default.VITE_BASE44_APP_ID }),
    token: getAppParamValue("access_token", { removeFromUrl: true }),
    fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
    functionsVersion: getAppParamValue("functions_version", { defaultValue: define_import_meta_env_default.VITE_BASE44_FUNCTIONS_VERSION }),
    appBaseUrl: getAppParamValue("app_base_url", { defaultValue: define_import_meta_env_default.VITE_BASE44_APP_BASE_URL })
  };
};
var appParams = {
  ...getAppParams()
};

// src/api/base44Client.js
var { appId, token, functionsVersion, appBaseUrl } = appParams;
var base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: "",
  requiresAuth: false,
  appBaseUrl
});

// src/lib/diplomacy/api.js
async function commissionEventLlm({ system, user }) {
  try {
    const resp = await base44.functions.invoke("commissionDiplomacyEvent", {
      system,
      user
    });
    return resp?.data?.raw || "";
  } catch (err) {
    console.warn("commissionDiplomacyEvent failed:", err);
    return "";
  }
}

// src/lib/diplomacy/inbox.js
var INBOX_HISTORY_TURNS = 8;
function appendEvents(state, events) {
  if (!events?.length) return state;
  const next = structuredClone(state);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.events = [...next.diplomacy.events || [], ...events];
  return next;
}
function pruneInboxHistory(state, currentTurn) {
  const cutoff = currentTurn - INBOX_HISTORY_TURNS;
  const next = structuredClone(state);
  next.diplomacy = next.diplomacy || {};
  const events = next.diplomacy.events || [];
  next.diplomacy.events = events.filter((e) => {
    const terminal = e.status === "resolved" || e.status === "expired";
    if (!terminal) return true;
    if (e.turn == null) return true;
    return e.turn > cutoff;
  });
  const log = next.diplomacy.offerLog || [];
  next.diplomacy.offerLog = log.filter((o) => {
    const t = o.resolvedTurn ?? o.turn;
    if (t == null) return true;
    return t > cutoff;
  });
  return next;
}

// src/lib/diplomacy/victory.js
var HEGEMON_HEX_FRACTION = 0.6;
var HEGEMON_REMNANT_HEXES = 3;
var HEGEMON_MINIMUM_HEXES = 18;
var MERC_UNIQUE_PARTNERS = 6;
var MERC_GOLD_THRESHOLD = 300;
var MERC_CONSECUTIVE_TURNS = 3;
function checkHegemonVictory(gameState) {
  const hexes = gameState?.hexes || {};
  const ownedCounts = /* @__PURE__ */ new Map();
  let totalOwned = 0;
  for (const h of Object.values(hexes)) {
    if (!h?.owner) continue;
    ownedCounts.set(h.owner, (ownedCounts.get(h.owner) || 0) + 1);
    totalOwned++;
  }
  if (totalOwned === 0) return null;
  for (const [factionId, n] of ownedCounts) {
    if (n / totalOwned >= HEGEMON_HEX_FRACTION) {
      return { winner: factionId, path: "dominant_share", n, totalOwned };
    }
  }
  const strong = [];
  for (const [factionId, n] of ownedCounts) {
    if (n > HEGEMON_REMNANT_HEXES) strong.push({ factionId, n });
  }
  if (strong.length === 1 && strong[0].n >= HEGEMON_MINIMUM_HEXES) {
    return {
      winner: strong[0].factionId,
      path: "rivals_reduced",
      n: strong[0].n,
      totalOwned
    };
  }
  return null;
}
function evaluateMercantileStanding(gameState) {
  const routes = gameState?.diplomacy?.tradeRoutes || [];
  const players = gameState?.players || [];
  const streaks = gameState?.diplomacy?.mercStreaks || {};
  const turnNow = gameState?.turn || 0;
  const partnersByFaction = /* @__PURE__ */ new Map();
  for (const r of routes) {
    const expired = r.expiresOnTurn != null && r.expiresOnTurn <= turnNow;
    const suspended = r.suspendedUntilTurn != null && r.suspendedUntilTurn > turnNow;
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
function checkMercantileVictory(standings) {
  for (const s of standings || []) {
    if (s.partners >= MERC_UNIQUE_PARTNERS && s.gold >= MERC_GOLD_THRESHOLD && s.streak >= MERC_CONSECUTIVE_TURNS) {
      return {
        winner: s.factionId,
        path: "mercantile_dominance",
        partners: s.partners,
        gold: s.gold,
        streak: s.streak
      };
    }
  }
  return null;
}
function formatVictoryAnnouncement(result, personalityResolver = () => null) {
  if (!result) return null;
  const p = personalityResolver(result.winner);
  const who = p ? `${p.leaderName} of ${result.winner}` : result.winner;
  if (result.path === "dominant_share") {
    return `${who} stands hegemon \u2014 commanding ${result.n} of ${result.totalOwned} hexes.`;
  }
  if (result.path === "rivals_reduced") {
    return `${who} stands hegemon \u2014 every rival humbled to ashes.`;
  }
  if (result.path === "mercantile_dominance") {
    return `${who} wins through Mercantile Dominance \u2014 ${result.partners} live trade routes, ${result.gold}g in the coffers, ${result.streak} turns unchallenged.`;
  }
  return `${who} is victorious.`;
}
function push(map, key, value) {
  let set = map.get(key);
  if (!set) {
    set = /* @__PURE__ */ new Set();
    map.set(key, set);
  }
  set.add(value);
}
function resolveGold(player) {
  if (player?.resources?.gold != null) return player.resources.gold;
  if (player?.faction?.resources?.gold != null)
    return player.faction.resources.gold;
  if (player?.gold != null) return player.gold;
  return 0;
}

// src/lib/diplomacy/turnTick.js
var SENTIMENT_DECAY_PER_TURN = 1;
function runTurnTick(gameState) {
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
  if (!alreadyTicked) {
    decaySentiment(next);
  }
  unsuspendTradeRoutes(next, turn);
  next.diplomacy.lastTickedTurn = turn;
  return next;
}
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
        turn
      });
      continue;
    }
    deductResources(vassal, tribute);
    addResources(overlord, tribute);
  }
}
var EXPIRING_COLLECTIONS = [
  "oaths",
  "pacts",
  "wards",
  "dmz",
  "standingThreats",
  "ultimatums",
  "rightsOfPassage",
  "militaryAccess",
  "tradeRoutes",
  "blockades",
  "openOffers"
];
function expireDiplomaticObjects(state, turn) {
  state.diplomacy = state.diplomacy || {};
  for (const key of EXPIRING_COLLECTIONS) {
    const list = state.diplomacy[key];
    if (!Array.isArray(list) || list.length === 0) continue;
    state.diplomacy[key] = list.filter(
      (o) => !(o.expiresOnTurn != null && o.expiresOnTurn <= turn)
    );
  }
}
function decaySentiment(state) {
  const map = state.diplomacy?.sentiment;
  if (!map) return;
  for (const k of Object.keys(map)) {
    const v = map[k] || 0;
    if (v === 0) continue;
    const sign = v > 0 ? 1 : -1;
    const magnitude = Math.abs(v);
    const next = sign * Math.max(0, magnitude - SENTIMENT_DECAY_PER_TURN);
    map[k] = clamp(next, -100, 100);
  }
}
function reconcileRelations(state) {
  const relations = state.diplomacy?.relations;
  if (!relations) return;
  const liveWars = new Set(
    (state.diplomacy.wars || []).map((w) => pairKey(w.attacker, w.defender))
  );
  const livePacts = new Set(
    (state.diplomacy.pacts || []).map((p) => pairKey(p.a, p.b))
  );
  const liveVassalages = new Set(
    (state.diplomacy.vassalages || []).map((v) => pairKey(v.overlord, v.vassal))
  );
  for (const key of Object.keys(relations)) {
    const cur = relations[key];
    if (cur === "war" && !liveWars.has(key)) {
      relations[key] = "neutral";
      continue;
    }
    if (cur === "vassal" || cur === "overlord" || cur === "overlord_of") {
      if (!liveVassalages.has(key)) relations[key] = "neutral";
      continue;
    }
    if (cur === "non_aggression" && !livePacts.has(key)) {
      relations[key] = "neutral";
    }
  }
}
function unsuspendTradeRoutes(state, turn) {
  const routes = state.diplomacy?.tradeRoutes;
  if (!Array.isArray(routes)) return;
  for (const r of routes) {
    if (r.suspendedUntilTurn != null && r.suspendedUntilTurn <= turn) {
      delete r.suspendedUntilTurn;
    }
  }
}

// src/lib/diplomacy/offers.js
function resolveOffer(gameState, offerId, choice) {
  const offer = findOffer(gameState, offerId);
  if (!offer) return fail(gameState, "unknown_offer");
  if (offer.status !== "pending") return fail(gameState, "already_resolved");
  if (choice !== "accept" && choice !== "reject")
    return fail(gameState, "invalid_choice");
  const next = structuredClone(gameState);
  const updated = next.diplomacy.openOffers.find((o) => o.id === offerId);
  updated.status = choice === "accept" ? "accepted" : "rejected";
  updated.resolvedTurn = next.turn || 0;
  const handlerResult = choice === "accept" ? applyAcceptance(next, updated) : applyRejection(next, updated);
  if (!handlerResult.ok) return fail(gameState, handlerResult.reason);
  next.diplomacy.offerLog = next.diplomacy.offerLog || [];
  next.diplomacy.offerLog.push({ ...updated });
  next.diplomacy.openOffers = next.diplomacy.openOffers.filter(
    (o) => o.id !== offerId
  );
  return { ok: true, state: next };
}
function applyAcceptance(state, offer) {
  switch (offer.type) {
    case "PROPOSE_RESOURCE_TRADE":
      return acceptResourceTrade(state, offer);
    case "PROPOSE_PEACE":
      return acceptPeace(state, offer);
    case "DEMAND_VASSALAGE":
      return acceptVassalage(state, offer);
    case "DEMAND_HOSTAGES":
      return acceptHostages(state, offer);
    case "EXTORT_TRIBUTE":
      return acceptExtortion(state, offer);
    case "DEMAND_INTEL":
      return acceptIntel(state, offer);
    case "JOINT_STRIKE":
      return acceptJointStrike(state, offer);
    default:
      return { ok: false, reason: `unhandled_offer_type:${offer.type}` };
  }
}
function acceptResourceTrade(state, offer) {
  const proposer = factionById(state, offer.proposer);
  const target = factionById(state, offer.target);
  if (!proposer || !target) return { ok: false, reason: "unknown_faction" };
  const receive = offer.payload?.receive || {};
  if (!hasResources(target, receive))
    return { ok: false, reason: "target_cannot_fulfill" };
  deductResources(target, receive);
  addResources(proposer, receive);
  const give = offer.payload?.give || {};
  addResources(target, give);
  bumpSentiment(state, offer.target, offer.proposer, 4);
  bumpSentiment(state, offer.proposer, offer.target, 4);
  return { ok: true };
}
function acceptPeace(state, offer) {
  if (getRelation(state, offer.proposer, offer.target) !== "war")
    return { ok: false, reason: "not_at_war" };
  setRelation(state, offer.proposer, offer.target, "neutral");
  const wars = state.diplomacy?.wars || [];
  for (const w of wars) {
    if (w.attacker === offer.proposer && w.defender === offer.target || w.attacker === offer.target && w.defender === offer.proposer) {
      w.endedTurn = state.turn || 0;
      w.outcome = "peace";
    }
  }
  const reps = offer.payload?.reparations;
  if (reps) {
    const proposer = factionById(state, offer.proposer);
    const target = factionById(state, offer.target);
    if (proposer && target && hasResources(proposer, reps)) {
      deductResources(proposer, reps);
      addResources(target, reps);
    }
  }
  bumpSentiment(state, offer.proposer, offer.target, 10);
  bumpSentiment(state, offer.target, offer.proposer, 10);
  return { ok: true };
}
function acceptVassalage(state, offer) {
  setRelation(state, offer.proposer, offer.target, "overlord_of");
  state.diplomacy.vassalages = state.diplomacy.vassalages || [];
  state.diplomacy.vassalages.push({
    overlord: offer.proposer,
    vassal: offer.target,
    tributePerTurn: offer.payload?.tributePerTurn || {},
    sinceTurn: state.turn || 0
  });
  bumpSentiment(state, offer.target, offer.proposer, -10);
  return { ok: true };
}
function acceptHostages(state, offer) {
  const count = offer.payload?.count || 1;
  state.diplomacy.wards = state.diplomacy.wards || [];
  for (let i = 0; i < count; i++) {
    state.diplomacy.wards.push({
      host: offer.proposer,
      origin: offer.target,
      name: `hostage_${state.turn || 0}_${i}`,
      arrivedTurn: state.turn || 0,
      kind: "coerced"
    });
  }
  bumpSentiment(state, offer.target, offer.proposer, -8);
  return { ok: true };
}
function acceptExtortion(state, offer) {
  const proposer = factionById(state, offer.proposer);
  const target = factionById(state, offer.target);
  if (!proposer || !target) return { ok: false, reason: "unknown_faction" };
  const demanded = offer.payload?.demanded || {};
  if (!hasResources(target, demanded))
    return { ok: false, reason: "target_cannot_pay" };
  deductResources(target, demanded);
  addResources(proposer, demanded);
  bumpSentiment(state, offer.target, offer.proposer, -6);
  return { ok: true };
}
function acceptIntel(state, offer) {
  const about = offer.payload?.aboutFaction;
  state.diplomacy.intelLog = state.diplomacy.intelLog || [];
  state.diplomacy.intelLog.push({
    from: offer.target,
    to: offer.proposer,
    about,
    summary: "shared on demand",
    turn: state.turn || 0
  });
  bumpSentiment(state, offer.target, offer.proposer, 2);
  return { ok: true };
}
function acceptJointStrike(state, offer) {
  state.diplomacy.jointStrikes = state.diplomacy.jointStrikes || [];
  state.diplomacy.jointStrikes.push({
    a: offer.proposer,
    b: offer.target,
    commonEnemy: offer.payload?.commonEnemy,
    targetHex: offer.payload?.targetHex || null,
    agreedTurn: state.turn || 0
  });
  bumpSentiment(state, offer.target, offer.proposer, 8);
  bumpSentiment(state, offer.proposer, offer.target, 8);
  return { ok: true };
}
function applyRejection(state, offer) {
  if (offer.type === "PROPOSE_RESOURCE_TRADE") {
    const proposer = factionById(state, offer.proposer);
    if (proposer) addResources(proposer, offer.payload?.give || {});
  }
  const insultByType = {
    DEMAND_VASSALAGE: 12,
    DEMAND_HOSTAGES: 10,
    EXTORT_TRIBUTE: 8,
    JOINT_STRIKE: 4,
    PROPOSE_PEACE: 6,
    // refusing peace during war is notable
    PROPOSE_RESOURCE_TRADE: 2,
    DEMAND_INTEL: 3
  };
  const delta = insultByType[offer.type] ?? 2;
  bumpSentiment(state, offer.proposer, offer.target, -delta);
  return { ok: true };
}
function findOffer(state, offerId) {
  return (state?.diplomacy?.openOffers || []).find((o) => o.id === offerId);
}
function fail(state, reason) {
  return { ok: false, reason, state };
}

// src/lib/diplomacy/aiPolicy.js
var DEFAULT_PROFILE = {
  values: {
    aggression: 0,
    greed: 0.3,
    honor: 0.3,
    piety: 0,
    pragmatism: 0.7,
    xenophobia: 0
  }
};
function resolveAIOffers(gameState, { playerFactionId } = {}) {
  const pending = (gameState?.diplomacy?.openOffers || []).filter(
    (o) => o.status === "pending" && o.target && o.target !== playerFactionId
  );
  let state = gameState;
  const decisions = [];
  for (const offer of pending) {
    const decision = decideOffer(state, offer);
    const result = resolveOffer(state, offer.id, decision.choice);
    if (result.ok) {
      state = result.state;
      decisions.push({
        offerId: offer.id,
        target: offer.target,
        type: offer.type,
        choice: decision.choice,
        reason: decision.reason
      });
    } else {
      const fallback = resolveOffer(state, offer.id, "reject");
      if (fallback.ok) {
        state = fallback.state;
        decisions.push({
          offerId: offer.id,
          target: offer.target,
          type: offer.type,
          choice: "reject",
          reason: `fallback:${result.reason}`
        });
      }
    }
  }
  return { state, decisions };
}
function decideOffer(state, offer) {
  const profile = getPersonality(offer.target) || DEFAULT_PROFILE;
  const v = profile.values || DEFAULT_PROFILE.values;
  const sentiment = getSentiment(state, offer.target, offer.proposer);
  switch (offer.type) {
    case "PROPOSE_RESOURCE_TRADE":
      return decideTrade(state, offer, v, sentiment);
    case "PROPOSE_PEACE":
      return decidePeace(offer, v, sentiment);
    case "DEMAND_VASSALAGE":
      return decideVassalage(offer, v, sentiment);
    case "DEMAND_HOSTAGES":
      return decideHostages(offer, v, sentiment);
    case "EXTORT_TRIBUTE":
      return decideExtortion(state, offer, v, sentiment);
    case "DEMAND_INTEL":
      return decideIntel(offer, v, sentiment);
    case "JOINT_STRIKE":
      return decideJointStrike(offer, v, sentiment);
    default:
      return { choice: "reject", reason: `unhandled_type:${offer.type}` };
  }
}
function decideTrade(state, offer, v, sentiment) {
  const target = factionById(state, offer.target);
  if (!target || !hasResources(target, offer.payload?.receive || {})) {
    return { choice: "reject", reason: "cannot_fulfill" };
  }
  const receiveMag = bagMagnitude(offer.payload?.receive);
  const giveMag = bagMagnitude(offer.payload?.give);
  const gain = giveMag - receiveMag;
  const score = sentiment * 0.5 + gain * (1 + v.greed) - v.xenophobia * 10;
  return scoreToChoice(score, 0, "trade");
}
function decidePeace(offer, v, sentiment) {
  const repAmount = bagMagnitude(offer.payload?.reparations);
  const aggressionPenalty = v.aggression * 30;
  const score = sentiment + repAmount * 2 - aggressionPenalty + v.pragmatism * 15;
  return scoreToChoice(score, -10, "peace");
}
function decideVassalage(offer, v, sentiment) {
  const score = -sentiment * 0.5 - v.honor * 40 - v.pragmatism * 10;
  return scoreToChoice(score, 40, "vassalage");
}
function decideHostages(offer, v, sentiment) {
  const score = sentiment * 0.5 - v.honor * 20 + v.pragmatism * 5;
  return scoreToChoice(score, 20, "hostages");
}
function decideExtortion(state, offer, v, sentiment) {
  const target = factionById(state, offer.target);
  if (!target || !hasResources(target, offer.payload?.demanded || {})) {
    return { choice: "reject", reason: "cannot_pay" };
  }
  const demandMag = bagMagnitude(offer.payload?.demanded);
  const score = -sentiment * 0.3 + v.pragmatism * 15 - v.honor * 25 - demandMag;
  return scoreToChoice(score, 10, "extortion");
}
function decideIntel(offer, v, sentiment) {
  const score = sentiment + v.pragmatism * 10 - v.xenophobia * 10;
  return scoreToChoice(score, 0, "intel");
}
function decideJointStrike(offer, v, sentiment) {
  const score = sentiment * 0.4 + v.aggression * 25 + v.pragmatism * 5;
  return scoreToChoice(score, 10, "joint_strike");
}
function scoreToChoice(score, threshold, label) {
  if (score >= threshold) {
    return { choice: "accept", reason: `${label}_score:${score.toFixed(1)}` };
  }
  return { choice: "reject", reason: `${label}_score:${score.toFixed(1)}` };
}
function bagMagnitude(bag) {
  if (!bag) return 0;
  return Object.values(bag).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

// src/lib/diplomacy/turnHooks.js
async function onTurnStart({ gameState, playerFactionId }) {
  const turn = gameState.turn || 0;
  const expired = expireEventsAtTurn(gameState, turn);
  const pruned = pruneInboxHistory(expired, turn);
  let events = [];
  try {
    events = await runTurnEventPass({
      gameState: pruned,
      playerFactionId,
      llmFn: commissionEventLlm,
      maxEvents: 2
    });
  } catch (err) {
    console.warn("Event pass failed; continuing without LLM events.", err);
  }
  return appendEvents(pruned, events);
}
function onTurnEnd({ gameState, playerFactionId } = {}) {
  const { state: afterAI, decisions: aiDecisions } = resolveAIOffers(
    gameState,
    { playerFactionId }
  );
  const ticked = runTurnTick(afterAI);
  const advanced = advanceMercantileStreaks(ticked);
  const hegemon = checkHegemonVictory(advanced);
  if (hegemon) {
    const announcement = formatVictoryAnnouncement(hegemon, getPersonality);
    return {
      gameOver: true,
      announcement,
      result: hegemon,
      nextState: advanced,
      aiDecisions
    };
  }
  const standings = evaluateMercantileStanding(advanced);
  const merc = checkMercantileVictory(standings);
  if (merc) {
    const announcement = formatVictoryAnnouncement(merc, getPersonality);
    return {
      gameOver: true,
      announcement,
      result: merc,
      nextState: advanced,
      aiDecisions
    };
  }
  return { gameOver: false, nextState: advanced, aiDecisions };
}
function advanceMercantileStreaks(gameState) {
  const next = structuredClone(gameState);
  next.diplomacy = next.diplomacy || {};
  next.diplomacy.mercStreaks = next.diplomacy.mercStreaks || {};
  const standings = evaluateMercantileStanding(next);
  for (const s of standings) {
    const qualifies = s.partners >= MERC_UNIQUE_PARTNERS && s.gold >= MERC_GOLD_THRESHOLD;
    const prior = next.diplomacy.mercStreaks[s.factionId] || 0;
    next.diplomacy.mercStreaks[s.factionId] = qualifies ? prior + 1 : 0;
  }
  return next;
}
export {
  onTurnEnd,
  onTurnStart
};
