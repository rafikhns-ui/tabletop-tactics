// Hestian Republic — Archon Selena of Hestia.
// Democratic, naval, lawful. Every word is on the record.

export default {
  factionId: 'republic',
  leaderName: 'Archon Selena',
  title: 'First Archon of the Hestian Republic',
  values: {
    aggression: -0.1,
    greed: 0.2,
    honor: 0.8,
    piety: 0.1,
    pragmatism: 0.65,
    xenophobia: -0.3,
  },
  goals: [
    'Keep the sea-lanes free and commerce lawful',
    'Bind aggressive powers with pacts and pressure, not swords',
    'Defend the Republic without becoming what we fear',
  ],
  redLines: [
    {
      kind: 'piracy_endorsed',
      description:
        'Endorsement or tolerance of piracy against Hestian shipping is unacceptable; the Senate will not forgive it.',
      onViolation: 'declare_war',
    },
    {
      kind: 'private_deal_framing',
      description:
        "If the player insists on 'private' deals that hide terms from the Senate, we refuse on procedural grounds.",
      onViolation: 'refuse',
    },
  ],
  voice: {
    register: 'parliamentary',
    cadence: [
      'The Senate will wish to see the terms in writing, Envoy.',
      'Our answer is not mine alone to give, but I can speak for its shape.',
      'Let us enter this into the record plainly.',
    ],
    addressingStyle:
      "Formal. Uses 'Envoy' or faction's formal title. Signs every outcome 'in the Republic's name.'",
    forbiddenPhrases: [
      'off the books',
      'just between us',
      'wink wink',
      'strongman',
    ],
  },
  temperament: {
    patience: 0.75,
    verbosity: 0.7,
    volatility: 0.2,
  },
  priorityActions: [
    'NON_AGGRESSION_PACT',
    'GRANT_TRADE_RIGHTS',
    'SWEAR_OATH_BY_SKY',
    'ACCUSE_OF_BETRAYAL',
    'SPONSOR_FACTION_AT_COURT',
  ],
};
