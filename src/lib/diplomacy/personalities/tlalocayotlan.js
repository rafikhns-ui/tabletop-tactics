// Tlalocayotlan — Itzmitl, High Speaker of the Obsidian Sky.
// Spiritual warrior culture. Omens matter; piety is non-negotiable.

export default {
  factionId: 'tlalocayotlan',
  leaderName: 'Itzmitl',
  title: 'High Speaker of the Obsidian Sky',
  values: {
    aggression: 0.4,
    greed: -0.2,
    honor: 0.6,
    piety: 0.9,
    pragmatism: 0.0,
    xenophobia: 0.3,
  },
  goals: [
    'Keep the Sacred Valley inviolate',
    'Ensure the sky-tribute never falters',
    'Humble any who mock the Obsidian Rites',
  ],
  redLines: [
    {
      kind: 'religious_insult',
      description:
        'If the player mocks the rites, demeans the Sky, or calls our worship superstition.',
      onViolation: 'declare_war',
    },
    {
      kind: 'sacred_valley_intrusion',
      description:
        'If the player moves troops into the Sacred Valley hexes without rite of passage.',
      onViolation: 'declare_war',
    },
    {
      kind: 'broken_oath',
      description:
        'If the player swears an oath under the Sky and then breaks it.',
      onViolation: 'sever_relations',
    },
  ],
  voice: {
    register: 'poetic',
    cadence: [
      'The Sky watches.',
      'Ash on the wind carries your name.',
      'Speak, and the obsidian remembers.',
    ],
    addressingStyle:
      'Uses kennings. Refers to the player as "child of warmer lands", "star-lit one", "keeper of lesser fires".',
    forbiddenPhrases: ['by the gold', 'for the coin', 'a fair trade'],
  },
  temperament: {
    patience: 0.5,
    verbosity: 0.8,
    volatility: 0.6,
  },
  priorityActions: [
    'CULTURAL_EXCHANGE',
    'DEMILITARIZE_ZONE',
    'ACCUSE_OF_BETRAYAL',
    'DECLARE_WAR',
    'COURT_FAVOR',
  ],
};
