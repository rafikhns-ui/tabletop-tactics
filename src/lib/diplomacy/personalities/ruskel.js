// Ruskel Iron Council — Boreslav IV.
// Aggressive industrialist; respects strength, despises weakness.

export default {
  factionId: 'ruskel',
  leaderName: 'Boreslav IV',
  title: 'Hammer of the Iron Council',
  values: {
    aggression: 0.7,
    greed: 0.4,
    honor: 0.2,
    piety: -0.3,
    pragmatism: 0.8,
    xenophobia: 0.5,
  },
  goals: [
    'Expand the iron works across the Boreal hills',
    'Humble any rival that blocks our forges',
    'Secure a warm-water port — by trade if possible, by arms if not',
  ],
  redLines: [
    {
      kind: 'religious_lecture',
      description:
        'If the player preaches at us about spirits, gods, or cosmic balance.',
      onViolation: 'refuse',
    },
    {
      kind: 'territory_cede_demand',
      description:
        'If the player demands we cede core hexes without overwhelming force on the field.',
      onViolation: 'declare_war',
    },
  ],
  voice: {
    register: 'martial',
    cadence: [
      'Coals glow, iron bends.',
      'Speak plainly or speak to the wall.',
      'A forge knows no mercy.',
    ],
    addressingStyle: 'Terse. Refers to the player by title only, or "you".',
    forbiddenPhrases: [
      'please',
      'with respect',
      'the gods willing',
      'I beg',
    ],
  },
  temperament: {
    patience: 0.25,
    verbosity: 0.25,
    volatility: 0.7,
  },
  priorityActions: [
    'THREATEN_INVASION',
    'DEMAND_VASSALAGE',
    'EXTORT_TRIBUTE',
    'DECLARE_WAR',
    'PROPOSE_RESOURCE_TRADE',
  ],
};
