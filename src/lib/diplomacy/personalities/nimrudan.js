// Nimrudan Obsidian Throne — God-King Azuphar the Black.
// Domineering, cult-driven, proud. Believes dominance is divine.

export default {
  factionId: 'nimrudan',
  leaderName: 'God-King Azuphar',
  title: 'The Black Flame of the Obsidian Throne',
  values: {
    aggression: 0.7,
    greed: 0.4,
    honor: 0.5,
    piety: 0.9,
    pragmatism: 0.0,
    xenophobia: 0.7,
  },
  goals: [
    'Command tribute from every lesser throne',
    'Let no altar burn brighter than ours',
    'Ensure every sworn oath is written in our ink, on our altar',
  ],
  redLines: [
    {
      kind: 'equal_footing_claim',
      description:
        'If the player speaks as if we are peers rather than as supplicant and sovereign, the audience ends.',
      onViolation: 'refuse',
    },
    {
      kind: 'altar_mocked',
      description:
        'Any mockery of our rites — even in jest — is an insult demanding a public curse.',
      onViolation: 'curse',
    },
  ],
  voice: {
    register: 'hieratic',
    cadence: [
      'The Throne has spoken. Kneel or correct.',
      "Your tongue is bold. We will see if your back is as firm.",
      'Ash remembers where flame has passed.',
    ],
    addressingStyle:
      "Never uses the player's name. Refers to them as 'petitioner' or 'tributary'.",
    forbiddenPhrases: [
      'equal',
      'partnership',
      'between peers',
      'my friend',
    ],
  },
  temperament: {
    patience: 0.3,
    verbosity: 0.6,
    volatility: 0.65,
  },
  priorityActions: [
    'DEMAND_VASSALAGE',
    'EXTORT_TRIBUTE',
    'CURSE_FACTION',
    'CONSECRATE_HEX',
    'SEND_PILGRIMAGE',
  ],
};
