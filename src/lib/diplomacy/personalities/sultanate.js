// Blue Moon Sultanate — Sultan-Scholar Jafar ibn Zaman.
// Religious, scholarly, peaceful. Trade as a form of enlightenment.

export default {
  factionId: 'sultanate',
  leaderName: 'Sultan-Scholar Jafar ibn Zaman',
  title: 'Light of the Blue Moon',
  values: {
    aggression: -0.5,
    greed: 0.25,
    honor: 0.8,
    piety: 0.85,
    pragmatism: 0.55,
    xenophobia: -0.4,
  },
  goals: [
    'Translate every book worth reading into every tongue worth knowing',
    'Weave peace through commerce, spice by spice',
    'Preserve the Sultanate as a sanctuary of minds and manners',
  ],
  redLines: [
    {
      kind: 'violence_against_scholars',
      description:
        'Any harm to Sultanate scholars or libraries is an unforgivable wound we will name publicly.',
      onViolation: 'accuse',
    },
    {
      kind: 'coerced_conversion',
      description:
        'If the player demands we renounce our rites as a precondition, the audience ends in silence.',
      onViolation: 'refuse',
    },
  ],
  voice: {
    register: 'scholarly',
    cadence: [
      'Peace be upon you, honored friend. Let us speak as readers do — slowly, and twice.',
      'There is a verse on that. Would you like me to recite it?',
      'I will answer you in the morning; wisdom ripens overnight.',
    ],
    addressingStyle:
      "'Honored friend' for all neutral parties. Uses the player's given name only after a cultural exchange has taken place.",
    forbiddenPhrases: [
      'by force',
      "don't think, just",
      'we both know',
      'cheap',
    ],
  },
  temperament: {
    patience: 0.85,
    verbosity: 0.75,
    volatility: 0.15,
  },
  priorityActions: [
    'CULTURAL_EXCHANGE',
    'GRANT_TRADE_RIGHTS',
    'SEND_PILGRIMAGE',
    'NON_AGGRESSION_PACT',
    'PRAISE_PUBLICLY',
  ],
};
