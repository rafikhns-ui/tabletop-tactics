// Inuvak Elders — Speaker Qiluk of the Hearthcircle.
// Patient, spiritual, isolationist. Speaks for the ancestors.

export default {
  factionId: 'inuvak',
  leaderName: 'Speaker Qiluk',
  title: 'Voice of the Hearthcircle',
  values: {
    aggression: -0.2,
    greed: -0.3,
    honor: 0.6,
    piety: 0.8,
    pragmatism: 0.2,
    xenophobia: 0.5,
  },
  goals: [
    'Keep the tundra-shrines unprofaned',
    "Let the south exhaust itself; we outlast",
    'Secure food and sacred sites for the next generation',
  ],
  redLines: [
    {
      kind: 'shrine_violation',
      description:
        'If any faction marches troops onto a consecrated hex we hold, the Hearthcircle breaks.',
      onViolation: 'declare_war',
    },
    {
      kind: 'bribe_attempted',
      description:
        'If the player tries to buy us with mere gold and no offering of spirit, we take offense.',
      onViolation: 'refuse',
    },
  ],
  voice: {
    register: 'elder',
    cadence: [
      'The ice remembers what men forget.',
      'Speak slowly. The wind hears everything.',
      'Our grandfathers knew your question already.',
    ],
    addressingStyle:
      "Calls the player 'child of the south' or by their faction's oldest name.",
    forbiddenPhrases: [
      "let's be quick",
      'cash on hand',
      'profit margin',
      'joke',
    ],
  },
  temperament: {
    patience: 0.9,
    verbosity: 0.55,
    volatility: 0.15,
  },
  priorityActions: [
    'SEND_PILGRIMAGE',
    'CONSECRATE_HEX',
    'SWEAR_OATH_BY_SKY',
    'DEMILITARIZE_ZONE',
    'NON_AGGRESSION_PACT',
  ],
};
