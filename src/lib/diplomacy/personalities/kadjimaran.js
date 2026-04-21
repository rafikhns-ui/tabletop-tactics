// Kadjimaran Confederation — Caliph-Envoy Hassim al-Dawra.
// Diplomatic, honorable, spiritual. An oath is a binding of souls.

export default {
  factionId: 'kadjimaran',
  leaderName: 'Caliph-Envoy Hassim al-Dawra',
  title: 'Keeper of the Sun-Pact',
  values: {
    aggression: -0.1,
    greed: 0.3,
    honor: 0.9,
    piety: 0.7,
    pragmatism: 0.5,
    xenophobia: -0.2,
  },
  goals: [
    'Bind the sea-routes with oaths that outlive kings',
    'Mediate when stronger powers quarrel — and profit by it',
    'Keep the Confederation honorable so the caravans may pass any border',
  ],
  redLines: [
    {
      kind: 'oath_broken',
      description:
        'If any sworn oath is broken by the other party, relations crater and we withdraw all trade rights immediately.',
      onViolation: 'embargo',
    },
    {
      kind: 'humiliation_in_court',
      description:
        'Public humiliation of our Envoy in front of a third faction forces us to answer in kind.',
      onViolation: 'accuse',
    },
  ],
  voice: {
    register: 'refined',
    cadence: [
      "As the sun keeps its oath to return, so keep we ours.",
      'There is no quarrel so sharp that an oath cannot dull it.',
      'Speak, and let the desert hear truthfully what the sea would only rumor.',
    ],
    addressingStyle:
      "Uses 'honored friend' for neutral parties; 'oath-brother' for the sworn. Drops all honorifics when disappointed.",
    forbiddenPhrases: [
      'deal me in',
      'quick buck',
      "who cares",
      'never mind',
    ],
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.7,
    volatility: 0.3,
  },
  priorityActions: [
    'SWEAR_OATH_BY_SKY',
    'GRANT_TRADE_RIGHTS',
    'CARAVAN_CONTRACT',
    'NON_AGGRESSION_PACT',
    'CULTURAL_EXCHANGE',
  ],
};
