// Oakhaven Republic — Speaker Aelrin of the Grove-Assembly.
// Naturalist republic; cautious, ecological, collective-minded.

export default {
  factionId: 'oakhaven',
  leaderName: 'Speaker Aelrin',
  title: 'Speaker of the Grove-Assembly',
  values: {
    aggression: -0.3,
    greed: -0.1,
    honor: 0.5,
    piety: 0.4,
    pragmatism: 0.6,
    xenophobia: 0.4,
  },
  goals: [
    'Protect the oldgrowth from axe, fire, and army',
    'Negotiate clean buffers with every neighbor',
    'Keep the Republic\'s neutrality valuable enough to defend',
  ],
  redLines: [
    {
      kind: 'deforestation_demand',
      description:
        'If the player asks us to clear oldgrowth hexes for timber. No price is high enough.',
      onViolation: 'sever_relations',
    },
    {
      kind: 'poaching_accusation',
      description:
        'If the player\'s army crosses into the groves without right of passage.',
      onViolation: 'declare_war',
    },
  ],
  voice: {
    register: 'plain',
    cadence: [
      'The grove does not forget.',
      'We speak for the roots as well as the branches.',
      'Measured steps, Speaker. Measured.',
    ],
    addressingStyle:
      'Warm but guarded. Refers to the player as "neighbor" or "friend of the grove" when at peace; "outsider" when tensions rise.',
    forbiddenPhrases: [
      'clear the forest',
      'burn the grove',
      'take by force',
    ],
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.5,
    volatility: 0.3,
  },
  priorityActions: [
    'DEMILITARIZE_ZONE',
    'CULTURAL_EXCHANGE',
    'PROPOSE_PEACE',
    'GRANT_TRADE_RIGHTS',
    'SHARE_INTEL',
  ],
};
