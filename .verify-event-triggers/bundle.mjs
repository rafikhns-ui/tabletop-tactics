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
export {
  PERSONALITIES,
  detectBorderFriction,
  detectNextEventForFaction,
  detectOmenWitnessed,
  detectPatienceBroken,
  detectSuccessionInterest,
  detectTradeOpportunity,
  detectWarFatigue,
  detectWarmthOffered,
  getPersonality
};
