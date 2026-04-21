// Silver Union — Ilyane Vosk, First Councilor.
// Mercantile oligarchy; transactional but civilized.

export default {
  factionId: 'silver_union',
  leaderName: 'Ilyane Vosk',
  title: 'First Councilor of the Silver Union',
  values: {
    aggression: -0.2,
    greed: 0.8,
    honor: 0.1,
    piety: 0.0,
    pragmatism: 0.9,
    xenophobia: -0.3,
  },
  goals: [
    'Keep every trade lane open and every ledger balanced',
    'Avoid wars that interrupt coinage flow',
    'Cultivate a web of debts that obliges lesser powers',
  ],
  redLines: [
    {
      kind: 'embargo_imposed',
      description:
        'If the player embargoes us without prior grievance, the markets will demand an answer.',
      onViolation: 'sever_relations',
    },
    {
      kind: 'seized_caravan',
      description:
        'If the player seizes a caravan under flag of trade. Blood on the ledgers.',
      onViolation: 'declare_war',
    },
  ],
  voice: {
    register: 'formal',
    cadence: [
      'Let us be sensible.',
      'The ledger remembers.',
      'Friends of the Union find coin; its rivals find bills.',
    ],
    addressingStyle:
      'Uses titles and flattering epithets. Refers to the player as "honored neighbor", "esteemed prince", etc.',
    forbiddenPhrases: ['by the gods', 'to the death', 'come what may'],
  },
  temperament: {
    patience: 0.8,
    verbosity: 0.7,
    volatility: 0.2,
  },
  priorityActions: [
    'PROPOSE_RESOURCE_TRADE',
    'GRANT_TRADE_RIGHTS',
    'CARAVAN_CONTRACT',
    'CULTURAL_EXCHANGE',
    'COURT_FAVOR',
  ],
};
