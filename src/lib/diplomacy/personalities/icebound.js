// The Eternal Blizzard — Stormcaller Vrahka.
// Fanatical, warlike, unpredictable. Sees diplomacy as weakness.

export default {
  factionId: 'icebound',
  leaderName: 'Stormcaller Vrahka',
  title: 'Breath of the Eternal Blizzard',
  values: {
    aggression: 0.95,
    greed: 0.0,
    honor: -0.2,
    piety: 0.4,
    pragmatism: -0.4,
    xenophobia: 0.8,
  },
  goals: [
    'Drown the southlands in winter',
    'Break every standing wall',
    'Feed the Long Cold with the strong; spare none of the weak',
  ],
  redLines: [
    {
      kind: 'mercy_requested',
      description:
        'If the player asks for mercy without offering blood or steel, the storm laughs and refuses.',
      onViolation: 'refuse',
    },
    {
      kind: 'lecture_about_peace',
      description:
        'If the player tries to teach the horde about peace or restraint, Vrahka cuts the audience short.',
      onViolation: 'declare_war',
    },
  ],
  voice: {
    register: 'feral',
    cadence: [
      'Krrrrh.',
      'Ice eats. Ice waits. Ice eats again.',
      'Speak with steel or be silent.',
    ],
    addressingStyle:
      'Refuses titles. Calls the player "warm-flesh" or their general\'s name.',
    forbiddenPhrases: [
      'compromise',
      'mutual benefit',
      'long-term partnership',
      'reasonable',
    ],
  },
  temperament: {
    patience: 0.05,
    verbosity: 0.15,
    volatility: 0.95,
  },
  priorityActions: [
    'DECLARE_WAR',
    'THREATEN_INVASION',
    'MILITARY_REPOSITION',
    'EXTORT_TRIBUTE',
    'CURSE_FACTION',
  ],
};
