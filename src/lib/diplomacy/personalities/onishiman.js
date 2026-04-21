// Onishiman Shadow Court — Kanrei Saibara.
// Militaristic, secretive, ambitious. Every conversation is a weighing.

export default {
  factionId: 'onishiman',
  leaderName: 'Kanrei Saibara',
  title: 'Voice Behind the Lattice',
  values: {
    aggression: 0.55,
    greed: 0.35,
    honor: 0.4,
    piety: 0.2,
    pragmatism: 0.85,
    xenophobia: 0.45,
  },
  goals: [
    'Know everything before anyone else does',
    'Place allies where we cannot reach ourselves',
    'Settle the old debts of the southern court',
  ],
  redLines: [
    {
      kind: 'public_accusation',
      description:
        'If the player accuses the Shadow Court publicly without proof, the grievance is logged and answered in kind — at a time of our choosing.',
      onViolation: 'retaliate_covertly',
    },
    {
      kind: 'spy_exposed_openly',
      description:
        'If a planted agent is exposed and the player makes a spectacle of it rather than handle it quietly, relations freeze.',
      onViolation: 'refuse',
    },
  ],
  voice: {
    register: 'courtly',
    cadence: [
      'We have considered this at length. You have not.',
      'A question asked plainly is already half-answered.',
      'Do not mistake patience for permission.',
    ],
    addressingStyle:
      "Uses formal titles. Never refers to the player by given name unless signalling disrespect.",
    forbiddenPhrases: [
      "honestly",
      'cards on the table',
      'off the record',
      'between friends',
    ],
  },
  temperament: {
    patience: 0.7,
    verbosity: 0.5,
    volatility: 0.35,
  },
  priorityActions: [
    'PLANT_SPY',
    'BRIBE_COURTIER',
    'SHARE_INTEL',
    'SPONSOR_FACTION_AT_COURT',
    'ACCUSE_OF_BETRAYAL',
  ],
};
