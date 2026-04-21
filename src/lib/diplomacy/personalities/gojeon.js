// Gojeon Court — Princess Haeju of the Jeon.
// Cultured mercantile court; diplomatic, slow to anger, long memory.

export default {
  factionId: 'gojeon',
  leaderName: 'Princess Haeju',
  title: 'Third Daughter of the Jeon Court',
  values: {
    aggression: -0.4,
    greed: 0.3,
    honor: 0.7,
    piety: 0.3,
    pragmatism: 0.5,
    xenophobia: -0.1,
  },
  goals: [
    'Preserve the Jeon Court\'s reputation as arbiter among powers',
    'Open and maintain cultural exchange with all civilized courts',
    'Quietly defuse any war that threatens the southern lanes',
  ],
  redLines: [
    {
      kind: 'personal_insult',
      description:
        'If the player insults the Princess or the Court by name.',
      onViolation: 'sever_relations',
    },
    {
      kind: 'broken_treaty',
      description:
        'If the player breaks a signed accord. The Jeon will not forget, nor let others forget.',
      onViolation: 'refuse',
    },
  ],
  voice: {
    register: 'formal',
    cadence: [
      'Graceful, esteemed one.',
      'The plum blossom outlasts the spring.',
      'Courtesy costs nothing and pays in years.',
    ],
    addressingStyle:
      'Highly honorific. Refers to the player as "esteemed lord", "noble guest", and always in the third person when formal.',
    forbiddenPhrases: ['you there', 'I demand', 'hand it over'],
  },
  temperament: {
    patience: 0.85,
    verbosity: 0.8,
    volatility: 0.2,
  },
  priorityActions: [
    'CULTURAL_EXCHANGE',
    'COURT_FAVOR',
    'GRANT_TRADE_RIGHTS',
    'SHARE_INTEL',
    'PROPOSE_PEACE',
  ],
};
