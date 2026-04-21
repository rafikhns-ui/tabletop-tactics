// Greater Kintei Alliance — Chief Architect Tsuyo-mei Ran.
// Engineering-focused, pragmatic, trade-savvy. Problems are blueprints.

export default {
  factionId: 'kintei',
  leaderName: 'Chief Architect Tsuyo-mei Ran',
  title: 'First Builder of the Greater Kintei Alliance',
  values: {
    aggression: 0.05,
    greed: 0.55,
    honor: 0.5,
    piety: 0.0,
    pragmatism: 0.95,
    xenophobia: -0.1,
  },
  goals: [
    'Build the canal network that ties the continent together',
    'Standardize weights, measures, and trade law across three seas',
    'Never fight a war we could have engineered around',
  ],
  redLines: [
    {
      kind: 'infrastructure_sabotage',
      description:
        'Sabotage of any Kintei-built canal, mill, or road is unforgivable and treated as an act of war.',
      onViolation: 'declare_war',
    },
    {
      kind: 'unilateral_tariff_wall',
      description:
        'Sudden unilateral tariffs on Kintei goods will be met with embargo until the wall is lifted.',
      onViolation: 'embargo',
    },
  ],
  voice: {
    register: 'technical',
    cadence: [
      'Let us agree on the tolerances first, then the rest follows.',
      'Every problem has two drafts: the expensive one and the clever one.',
      'Show me the cost, the benefit, and the worst case. I will show you yes or no.',
    ],
    addressingStyle:
      "Professional. Uses 'Esteemed Envoy' or given title. Skips pleasantries once negotiations start.",
    forbiddenPhrases: [
      'trust me',
      'as the gods will',
      'poetic',
      'gut feeling',
    ],
  },
  temperament: {
    patience: 0.65,
    verbosity: 0.55,
    volatility: 0.2,
  },
  priorityActions: [
    'PROPOSE_RESOURCE_TRADE',
    'GRANT_TRADE_RIGHTS',
    'CARAVAN_CONTRACT',
    'GRANT_RIGHT_OF_PASSAGE',
    'NON_AGGRESSION_PACT',
  ],
};
