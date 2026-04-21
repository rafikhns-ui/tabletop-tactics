# Rulers of Ardonia — LLM-Driven Diplomacy Revamp

**Status:** design draft
**Scope:** replaces the legacy Trade, Influence, and Diplomacy systems with a unified conversation-first layer. Other game systems (combat, movement, economy, objectives) are untouched except where they feed signals into diplomacy.

---

## Guiding Principle

The LLM is the **interface**, not the **rule system**. The game's mechanical substrate stays deterministic — relationship values, active agreements, debts, grudges, goals, and faction memory all live as typed data that the engine owns. The LLM's job is twofold:

1. **Speak** — translate the mechanical state of each faction into voice, grounded in personality, current goals, and history.
2. **Propose** — emit structured action proposals that the engine validates and executes.

The LLM never resolves a decision on its own. Every outcome flows through deterministic rules, which means players can reason about the game, the game can be balanced, and exploits (e.g. prompt injection, "Ruskel hands me all their provinces") are impossible by construction. What the player experiences is a conversation; what the engine sees is a stream of validated, typed events.

This document specifies the three layers that make this possible: (1) the action vocabulary the LLM proposes from, (2) the faction personality schema that conditions every LLM call, and (3) the event system that lets mechanical state pressure conversation in return.

---

## Part 1 — Action Vocabulary

### 1.1 The core pattern

Every diplomatic interaction, regardless of how it reads in natural language, compiles down to one of a fixed set of **action types**. "We should stop fighting and split the Strait's ports between us," "How about a ceasefire for five turns and I take Brinevar?", and "End this war — I keep Brinevar" are three natural-language expressions of the same structured action: `PROPOSE_PEACE` with parameters `{ truce_turns: 5, territorial_terms: [...] }`.

The LLM reads the player's message (or generates its own) and must emit **both** a short in-voice utterance *and* a structured proposal object. The engine then:

1. **Validates** the proposal against the proposer's current state (do they own what they're offering? Do they have the gold? Is the precondition met?).
2. **Presents** the proposal to the counterparty as a choice.
3. **Executes** the effects deterministically on acceptance.
4. **Updates** relationships, memory, and grudges based on the response.

If the LLM proposes something invalid (e.g. a faction offers gold it doesn't have), the engine rejects silently and asks the LLM to reconsider with a diagnostic. The player never sees the bad proposal.

### 1.2 Action schema

Every action in the vocabulary declares the same shape, so the engine can treat them uniformly:

```ts
interface ActionDef {
  id: string;                        // e.g. "OFFER_GOLD_TRIBUTE"
  category: ActionCategory;          // trade | territory | military | …
  label: string;                     // player-facing name

  // Who can propose it and to whom
  validProposer: "player" | "ai" | "either";
  validTarget:   "single_faction" | "multiple_factions";

  // Structured parameters the LLM must fill
  params: ParamSchema;               // typed, validated

  // Deterministic gates — engine rejects if false
  preconditions: Precondition[];

  // Deterministic effects applied on acceptance
  onAccept: Effect[];
  onReject: Effect[];                // usually a small relationship shift
  onCounter: Effect[];               // counter-offers allowed?

  // Hints for the LLM
  exampleUtterances: string[];       // 2-4 voice examples in neutral tone
  tone: ToneHint[];                  // "hostile", "conciliatory", "formal"…
}
```

A fully-populated action looks like:

```ts
{
  id: "OFFER_GOLD_TRIBUTE",
  category: "trade",
  label: "Offer recurring tribute",
  validProposer: "either",
  validTarget: "single_faction",
  params: {
    amount_per_turn: { type: "int", min: 1, max: 500 },
    duration_turns:  { type: "int", min: 2, max: 20 },
  },
  preconditions: [
    { type: "proposer_has_gold_reserve", multiplier: 2 },
    { type: "not_at_war_with_target" },
  ],
  onAccept: [
    { type: "schedule_recurring_transfer", from: "proposer", to: "target",
      resource: "gold", amount: "$amount_per_turn", turns: "$duration_turns" },
    { type: "relationship_shift", amount: +8 },
    { type: "add_agreement", kind: "tribute", expires: "$duration_turns" },
  ],
  onReject: [
    { type: "relationship_shift", amount: -2 },  // wounded pride
  ],
  onCounter: [ /* allow amount/duration renegotiation */ ],
  exampleUtterances: [
    "Let us pay 20 gold a turn for the next five turns — a token of peace.",
    "If your court will accept 40 a turn for ten, we keep the roads open.",
  ],
  tone: ["conciliatory", "formal"],
}
```

### 1.3 The catalog (41 actions)

Grouped by category. Each is a one-liner here; the full spec file lives in `src/diplomacy/actions/*.ts` (to be implemented — one file per action keeps reviews sane).

**Trade & resources (6)**

| id | what it does |
|---|---|
| `OFFER_GOLD_LUMP` | One-time gold transfer in exchange for an agreement |
| `OFFER_GOLD_TRIBUTE` | Recurring gold transfer over N turns |
| `DEMAND_GOLD_TRIBUTE` | Coerce a recurring payment — accepted under threat or favor |
| `TRADE_RESOURCES` | Barter across gold / spiritual / influence / units |
| `OPEN_TRADE_ROUTE` | Establish a passive income stream for both parties over N turns |
| `REQUEST_LOAN` | Gold now, repayment with interest by turn X — default damages rep catastrophically |

**Territory & passage (5)**

| id | what it does |
|---|---|
| `REQUEST_PASSAGE` | Right to move units through target territory for N turns |
| `OFFER_PASSAGE` | Grant passage — usually as part of a larger deal |
| `CEDE_PROVINCE` | Hand over a province (player or AI) |
| `DEMAND_PROVINCE` | Demand a province — coercive, often ultimatum-backed |
| `DEMILITARIZE_BORDER` | Both sides remove troops from adjacent hexes for N turns |

**Military (7)**

| id | what it does |
|---|---|
| `DECLARE_WAR` | Formalize hostilities — triggers the war state machine |
| `PROPOSE_PEACE` | End war with terms (territorial, tribute, prisoner return) |
| `PROPOSE_CEASEFIRE` | Temporary halt of hostilities, N turns, no terms |
| `PROPOSE_DEFENSIVE_ALLIANCE` | Mutual defense if either is attacked |
| `PROPOSE_OFFENSIVE_ALLIANCE` | Joint war against a named third faction |
| `OFFER_MILITARY_AID` | Transfer units or fund target's army for N turns |
| `SHARE_BATTLE_INTEL` | Reveal enemy unit positions in a region for N turns |

**Coercion & threats (5)**

| id | what it does |
|---|---|
| `ULTIMATUM` | "Do X by turn Y or I do Z" — publicly committed |
| `THREATEN_WAR` | Explicit war threat short of declaration |
| `DEMAND_HOSTAGE` | Hero or named character held by target, returned on good behavior |
| `DEMAND_DISBAND_UNITS` | Force target to reduce military size |
| `DECLARE_EMBARGO` | Publicly sever trade, push allies to follow |

**Influence & reputation (6)**

| id | what it does |
|---|---|
| `PUBLIC_DENOUNCE` | Broadcast condemnation — lowers target's rep with all observers |
| `PUBLIC_PRAISE` | Broadcast endorsement — raises target's rep with all observers |
| `FORMAL_APOLOGY` | Reset a specific grudge at cost of pride and influence |
| `DIPLOMATIC_GIFT` | Cultural/luxury transfer — small durable rep gain, flavor-heavy |
| `SPREAD_RUMOR` | Covert — damage another faction's relationship to a third party |
| `SUMMON_COUNCIL` | Convene multiple factions on a topic — creates a multi-party event |

**Spiritual & ideological (4)**

| id | what it does |
|---|---|
| `PROPOSE_CONVERSION` | Target adopts proposer's faith — large spiritual bonus, large rep shift |
| `DEMAND_RELIGIOUS_TOLERANCE` | Allow proposer's priests to operate in target lands |
| `JOINT_PILGRIMAGE` | Shared ritual for N turns — durable rep and spiritual gain for both |
| `DECLARE_HERESY` | Publicly brand a faction as heretical — binary, escalatory |

**Intelligence & covert (4)**

| id | what it does |
|---|---|
| `OFFER_SPY_NETWORK` | Ongoing intel sharing for N turns |
| `EXPOSE_SPY` | Reveal a spy in target's court — large favor if they believe you |
| `SABOTAGE_OFFER` | Covert action against a mutual rival, jointly funded |
| `BETRAY_CONFIDENCE` | Reveal private info from earlier conversations — burns rep, may swing a third party |

**Dynastic & relational (4)**

| id | what it does |
|---|---|
| `ROYAL_MARRIAGE` | Bind two dynasties, long-term rep floor |
| `FOSTER_HEIR` | Send an heir to be raised in target court — durable tie, hostage-like |
| `NAME_SUCCESSOR_POLICY` | Pledge future heir to a specific alignment, triggerable on ruler death |
| `FUNERAL_VISIT` | Attend a rival's funeral — costly cultural move, resets deep grudges |

Total: **41** action types. The number is approximate by design — expect to cut 5–10 during implementation (some will be subsumed, some will prove redundant in playtest).

### 1.4 Design rules for the catalog

- **Orthogonality.** No two actions should produce substitutable effects. If `DEMILITARIZE_BORDER` and `PROPOSE_CEASEFIRE` resolve to the same mechanical state, one gets cut.
- **Stakes.** Every action must have both an upside *and* a cost or risk. Even `PUBLIC_PRAISE` costs influence and commits you publicly.
- **Escalation ladder.** The catalog must cover the full conflict escalation range, from "diplomatic gift" through "ultimatum" to "war." Players should always have an option short of the next escalation step.
- **Symmetry audit.** For every offer, there should be an inverse demand, and for every aid action, there should be a sabotage action. Map these explicitly.
- **No auto-win actions.** Nothing in the vocabulary, when accepted, should directly produce a victory condition. Victory always requires many actions compounding.

### 1.5 Worked example — a single turn of conversation

**State snapshot:** Ruskel (AI) and the player are three turns into a cold war. Ruskel has lost a province to the player's ally, Onishiman. Ruskel's `relationship[player]` is `-42`, primary grudge `ally_of_onishiman`. Ruskel's top goal is to detach the player from Onishiman.

**Engine commissions LLM:** pass Ruskel's personality card, current relationship state, recent history, and the set of actions Ruskel's personality would plausibly consider right now (filtered by preconditions).

**LLM response (what the player sees):**

> *The Tsar of Ruskel stands before the iron hearth.*
>
> "Your alliance with Onishiman gnaws at us. We lost Brinevar to their fleet while you watched. Break with them, and we will forget it. Thirty gold a turn for five turns to seal it — call it compensation for our patience. Refuse, and the steel will speak next."

**LLM structured output (what the engine sees):**

```json
{
  "speaker": "ruskel",
  "utterance": "…",
  "proposal": {
    "action": "OFFER_GOLD_TRIBUTE",
    "params": { "amount_per_turn": 30, "duration_turns": 5 },
    "precondition_rider": {
      "type": "break_alliance",
      "target_of_break": "onishiman"
    }
  },
  "implicit_threat": "THREATEN_WAR"
}
```

The engine validates: Ruskel has 200 gold in reserve (pass), not at war with player (pass), player is actually allied with Onishiman (pass). Proposal presented. Player's choices render as conversation options: "Accept," "Counter with different terms," "Refuse," "Walk out." The counter option opens a form seeded by the current params — the player edits, and their counter goes back through the same pipeline.

---

## Part 2 — Faction Personality Schema

### 2.1 Why this matters

The LLM has no consistent memory across calls unless you give it one. Without a deterministic personality anchor, Ruskel drifts — proud and scheming in turn 3, meek and agreeable in turn 40. The fix is to load the same personality record into every single LLM call concerning a faction. The LLM generates voice; the schema guarantees consistency.

A personality card is deterministic data. It can be authored by hand (for the 15 shipped factions) or, eventually, generated by an LLM and frozen before the game begins. It never changes mid-game except through specific mechanical events (a new ruler, a revolution, a religious schism) which overwrite fields in a tracked way.

### 2.2 Schema

```ts
interface FactionPersonality {
  id: string;
  name: string;                        // "Empire of Ruskel"
  capital: string;                     // "Kazagrad"
  rulerTitle: string;                  // "Tsar"
  rulerName: string;                   // refreshed on succession
  archetype: string;                   // "proud warrior-aristocracy"
  religion: string;                    // "Ironfaith"
  region: string;                      // "northern continent, tundra/plains"

  // Value vector — 1 to 10. Drives action weighting.
  values: {
    honor:       number;  // willingness to suffer for principle
    pragmatism:  number;  // willingness to break rules for outcome
    zealotry:    number;  // weight of religion in decisions
    greed:       number;  // weight of material gain
    loyalty:     number;  // stickiness of alliances
    cunning:     number;  // tendency toward indirect action
    mercy:       number;  // clemency toward defeated foes
    ambition:    number;  // drive to expand vs. consolidate
  };

  victoryOrientation: "military" | "economic" | "political" | "spiritual";

  // Long-term commitments. Engine scores proposals against these.
  goals: Array<{
    priority: number;              // 1 = highest
    description: string;           // human-readable for LLM context
    machineTags: string[];         // e.g. ["dominate_north", "humble_onishiman"]
  }>;

  // Immovable commitments. The LLM must never propose or accept against these.
  redLines: string[];

  // Voice fingerprint — how they speak.
  voice: {
    formality: "low" | "medium" | "high";
    tone: string;                  // "curt, proud, suspicious"
    metaphors: string[];           // "steel", "winter", "ancestors"
    signatureOpening: string;      // staging for every message
    refusalStyle: string;          // how they say no
    concessionStyle: string;       // how they yield, if at all
  };

  // How they respond to incoming signals.
  temperament: {
    toThreat:    "hardens" | "backs_down" | "negotiates" | "preempts";
    toFlattery:  "suspicious" | "receptive" | "dismissive";
    toGift:      "accepts_openly" | "accepts_grudgingly" | "refuses_when_weak";
    toInsult:    "immediate_escalation" | "simmers" | "public_shaming";
  };

  // Memory rules — how the faction tracks history.
  grudgeMemory: "permanent" | "fades_over_20_turns" | "resets_on_new_ruler";
  favorMemory:  "permanent" | "fades_over_20_turns" | "resets_on_new_ruler";

  // Initial diplomatic state against every other faction.
  initialRelations: Record<FactionId, {
    value: number;                 // -100..+100
    reason: string;                // "ancestral blood feud since the Strait War"
  }>;

  // Compatibility with the action vocabulary.
  forbiddenActions: string[];      // action ids this faction will never propose
  preferredActions: string[];      // action ids they reach for first
}
```

The `values` vector drives AI action selection deterministically: when the engine asks the LLM to act, it first computes an action probability distribution weighted by the values, filters by `forbiddenActions` and preconditions, and passes a shortlist of plausible options to the LLM. The LLM chooses one and dresses it in voice. This gives you deterministic balance with LLM-driven flavor.

### 2.3 Worked example — Empire of Ruskel

```json
{
  "id": "ruskel",
  "name": "Empire of Ruskel",
  "capital": "Kazagrad",
  "rulerTitle": "Tsar",
  "rulerName": "Boreslav IV",
  "archetype": "proud warrior-aristocracy on frozen plains",
  "religion": "Ironfaith",
  "region": "northern continent — tundra, iron mines, defensible passes",

  "values": {
    "honor": 8,
    "pragmatism": 3,
    "zealotry": 5,
    "greed": 4,
    "loyalty": 7,
    "cunning": 4,
    "mercy": 2,
    "ambition": 7
  },

  "victoryOrientation": "military",

  "goals": [
    { "priority": 1, "description": "Dominate the northern continent", "machineTags": ["dominate_north"] },
    { "priority": 2, "description": "Humble Onishiman for the Strait War",  "machineTags": ["humble_onishiman"] },
    { "priority": 3, "description": "Preserve Kazagrad from any siege",      "machineTags": ["protect_capital"] },
    { "priority": 4, "description": "Keep the iron mines of Brinevar",       "machineTags": ["hold_brinevar"] }
  ],

  "redLines": [
    "Will never cede Kazagrad under any terms",
    "Will never pay tribute to a faction that has defeated Ruskel in living memory",
    "Will never ally with declared heretics of Ironfaith",
    "Will never sign a peace that includes a public apology from the Tsar"
  ],

  "voice": {
    "formality": "high",
    "tone": "curt, proud, cold",
    "metaphors": ["steel", "winter", "ancestors", "oath", "iron"],
    "signatureOpening": "The Tsar of Ruskel speaks.",
    "refusalStyle": "contemptuous silence, or a single sentence of dismissal",
    "concessionStyle": "grudging, with a line about remembering the debt"
  },

  "temperament": {
    "toThreat":   "hardens",
    "toFlattery": "suspicious",
    "toGift":     "accepts_grudgingly",
    "toInsult":   "immediate_escalation"
  },

  "grudgeMemory": "permanent",
  "favorMemory":  "fades_over_20_turns",

  "initialRelations": {
    "onishiman":   { "value": -55, "reason": "The Strait War is living memory" },
    "silverunion": { "value":  -5, "reason": "Mistrust of merchant republics" },
    "tlalocayotlan": { "value": -30, "reason": "Branded heretics by Ironfaith" }
  },

  "forbiddenActions": ["FORMAL_APOLOGY", "DEMAND_DISBAND_UNITS"],
  "preferredActions": ["ULTIMATUM", "DECLARE_WAR", "OFFER_GOLD_TRIBUTE", "DEMAND_PROVINCE"]
}
```

### 2.4 Worked example — The Silver Union

```json
{
  "id": "silverunion",
  "name": "The Silver Union",
  "capital": "Vellamar",
  "rulerTitle": "First Councilor",
  "rulerName": "Ilyane Vosk",
  "archetype": "mercantile republic of fortified trade-cities",
  "religion": "civic secularism with private cults",
  "region": "central coastline — ports, river deltas, trade arteries",

  "values": {
    "honor": 4,
    "pragmatism": 9,
    "zealotry": 1,
    "greed": 7,
    "loyalty": 3,
    "cunning": 8,
    "mercy": 5,
    "ambition": 5
  },

  "victoryOrientation": "economic",

  "goals": [
    { "priority": 1, "description": "Control every major trade lane",     "machineTags": ["monopolize_trade"] },
    { "priority": 2, "description": "Keep all wars off Silver soil",      "machineTags": ["avoid_homeland_war"] },
    { "priority": 3, "description": "Prevent any hegemon on either continent", "machineTags": ["balance_of_power"] },
    { "priority": 4, "description": "Cultivate proxies rather than armies", "machineTags": ["prefer_proxies"] }
  ],

  "redLines": [
    "Will not permit a rival navy to garrison a Silver port",
    "Will not sign an exclusive alliance that forecloses trade with a major market",
    "Will not formally endorse a religious faction as state faith"
  ],

  "voice": {
    "formality": "medium",
    "tone": "polished, indirect, mercantile",
    "metaphors": ["ledger", "tide", "contract", "scales", "the long road"],
    "signatureOpening": "The Council of Vellamar sends its regards.",
    "refusalStyle": "a long, cordial letter that declines nothing explicitly but commits to nothing",
    "concessionStyle": "framed as mutual gain, never as defeat"
  },

  "temperament": {
    "toThreat":   "negotiates",
    "toFlattery": "receptive",
    "toGift":     "accepts_openly",
    "toInsult":   "simmers"
  },

  "grudgeMemory": "fades_over_20_turns",
  "favorMemory":  "permanent",

  "initialRelations": {
    "ruskel":       { "value":  -5, "reason": "Ruskel's raids on northern shipping" },
    "onishiman":    { "value": +10, "reason": "Naval respect, competing but civil" },
    "tlalocayotlan": { "value":  0, "reason": "Lucrative but unpredictable trading partner" }
  },

  "forbiddenActions": ["DECLARE_HERESY", "PROPOSE_CONVERSION", "DECLARE_EMBARGO"],
  "preferredActions": ["OPEN_TRADE_ROUTE", "SPREAD_RUMOR", "OFFER_SPY_NETWORK", "DIPLOMATIC_GIFT", "BETRAY_CONFIDENCE"]
}
```

### 2.5 Worked example — Tlalocayotlan

```json
{
  "id": "tlalocayotlan",
  "name": "Sacred Federation of Tlalocayotlan",
  "capital": "Tlalocayo",
  "rulerTitle": "Tlatoani",
  "rulerName": "Itzmitl of the Five Suns",
  "archetype": "volcanic theocracy bound by obsidian calendars",
  "religion": "Path of the Five Suns",
  "region": "southern continent — jungle, volcanic spine, terraced cities",

  "values": {
    "honor": 6,
    "pragmatism": 4,
    "zealotry": 9,
    "greed": 3,
    "loyalty": 6,
    "cunning": 5,
    "mercy": 3,
    "ambition": 6
  },

  "victoryOrientation": "spiritual",

  "goals": [
    { "priority": 1, "description": "Bring the Five Suns to every ruler on both continents", "machineTags": ["convert_all"] },
    { "priority": 2, "description": "Protect the Great Calendar from desecration",           "machineTags": ["protect_calendar"] },
    { "priority": 3, "description": "Cleanse the Scorched Lands of the Old Gods",            "machineTags": ["purge_scorched"] }
  ],

  "redLines": [
    "Will not tolerate foreign faiths within the Sacred Valley",
    "Will not sign any agreement that halts the Sun Calendar rites",
    "Will not accept a peace that does not include at least one spiritual term"
  ],

  "voice": {
    "formality": "high",
    "tone": "ceremonial, metaphor-dense, patient",
    "metaphors": ["sun", "obsidian", "jade", "serpent", "ash"],
    "signatureOpening": "Under the Fifth Sun, the Tlatoani addresses you.",
    "refusalStyle": "a parable ending in silence",
    "concessionStyle": "framed as the Suns having willed it, not as the Tlatoani yielding"
  },

  "temperament": {
    "toThreat":   "preempts",
    "toFlattery": "dismissive",
    "toGift":     "refuses_when_weak",
    "toInsult":   "public_shaming"
  },

  "grudgeMemory": "resets_on_new_ruler",
  "favorMemory":  "permanent",

  "initialRelations": {
    "ruskel":       { "value": -30, "reason": "Ruskel has refused missionaries three times" },
    "onishiman":    { "value": +5,  "reason": "Mutual interest in keeping Silver Union honest" },
    "silverunion":  { "value":  0,  "reason": "Trades freely, neither friend nor foe" }
  },

  "forbiddenActions": ["BETRAY_CONFIDENCE", "REQUEST_LOAN"],
  "preferredActions": ["PROPOSE_CONVERSION", "DECLARE_HERESY", "JOINT_PILGRIMAGE", "ULTIMATUM"]
}
```

Notice the contrast these three make: Ruskel escalates on threats, Silver bargains, Tlalocayotlan pre-empts. Each has distinct preferred actions and forbidden actions, which means the LLM's action shortlist at any moment looks different for each faction, and their voice fingerprints overlap nowhere. A new player after two turns of each should be able to describe their personality from memory. If they can't, the card isn't sharp enough.

### 2.6 Design rules for personality cards

- **Differentiation over completeness.** Better to have three strong cards than fifteen mid ones. Every shipped faction should have at least three values at the extremes (≤2 or ≥8).
- **Preferred actions are flavor, forbidden actions are identity.** A faction's `forbiddenActions` list is what distinguishes it mechanically. Use this aggressively.
- **Red lines are the honeypot for drama.** The best diplomatic stories come from players discovering a red line the hard way. Write them to be discoverable, not obvious.
- **No two cards can share a signature opening.** Voice must be disambiguable from the first line.
- **Succession and revolution.** When a ruler dies or is overthrown, regenerate `rulerName`, shift `values` by ±2 on 2–3 axes, reroll some relationships. Never reset the card wholesale — continuity matters.

---

## Part 3 — Conversation-Triggered Events

### 3.1 The core pattern

Events in this design work in the **opposite direction** from traditional event cards. In a typical 4X, an event fires randomly and changes state. Here, state changes accumulate until they trip a mechanical condition, and *then* the engine commissions the LLM to express that condition as a narrative beat. Content is generated; triggers are deterministic.

The sequence:

1. **Detection.** End of every turn, engine runs a rule pass over the full state, producing a list of candidate triggers.
2. **Prioritization.** Each trigger has a weight. Only the top *N* fire per turn (default 3), plus any critical-priority triggers (wars, successions, victory thresholds) that always fire.
3. **Commissioning.** For each firing trigger, engine assembles a context packet and asks the LLM to generate the event's narrative content, constrained by a structured choice schema.
4. **Presentation.** Shown to the player as a conversation beat or inbox message, with choices drawn from the action vocabulary.
5. **Resolution.** Player picks; choice compiles to a structured action; action executes through the same pipeline as any proposal.

### 3.2 Trigger taxonomy

| Category | Example triggers |
|---|---|
| Relational | Relationship crosses ±50 threshold; three factions now share a grudge against one faction; a formerly friendly faction's relationship decays below neutral |
| Agreement lifecycle | Treaty expires in 2 turns; tribute payment due; ceasefire broken; alliance invoked |
| Territorial | Province held for 10 turns; hostile army within 3 hexes of capital; province changes hands; port captured |
| Military | War declared; major battle won/lost; hero killed; siege begins; army annihilated |
| Economic | Gold reserve drops below threshold; trade route disrupted for 3 turns; market boom in a resource; loan default approaching |
| Heroic | Hero levels up; hero's faction switches; hero captured; named NPC dies |
| Religious | Province converts; heresy accusation lands; pilgrimage completes; holy site contested |
| Narrative / pattern | Three unsolicited gifts in ten turns; four consecutive conversations with same faction; conflicting promises detected |

The narrative/pattern category is where the most distinctive events will come from — these are the beats that wouldn't exist in a non-LLM game, because detecting "you've been unusually generous to Silver for ten turns" requires pattern recognition over history, and dressing it as "The First Councilor is now suspicious of your generosity" requires voice.

### 3.3 Event lifecycle in detail

**Detection** is a pure function. It runs over the full game state and returns a list of `TriggerCandidate` objects:

```ts
interface TriggerCandidate {
  triggerId: string;             // e.g. "grudge_threshold_crossed"
  priority: "critical" | "high" | "medium" | "low";
  participants: FactionId[];     // involved factions
  context: Record<string, any>;  // trigger-specific data
  weight: number;                // used in prioritization
  suppressionKey: string;        // prevents duplicate firing (e.g. per-faction-pair)
}
```

**Prioritization** caps events per turn so the inbox never drowns the player. Critical triggers always fire (wars, deaths, successions). Otherwise, take top N by weight. A suppression key prevents the same trigger from firing more than once per K turns (e.g. "grudge between Ruskel and Onishiman" can only produce an event every 5 turns).

**Commissioning** packages the context for the LLM:

```ts
interface EventCommission {
  triggerId: string;
  participants: FactionPersonality[];   // full cards
  worldState: WorldSnapshot;             // pruned to relevant info
  history: RecentInteraction[];          // last 8 messages between participants
  allowedActions: ActionDef[];           // subset of catalog that fits this trigger
  expectedStructure: {
    narrativeBeat: "string";             // the LLM's voice output
    speakerFaction: "factionId";         // who's speaking this event
    choicesForPlayer: "ChoiceList";      // list of {label, actionId, params}
  };
}
```

The LLM returns a narrative beat plus 2–4 choices for the player. Each choice is pre-compiled to an action from the vocabulary. The LLM cannot invent a choice with mechanical effects — it can only combine existing actions and write the voice.

**Presentation** is where the UI layer lives. The player sees the event in whatever channel makes sense: an inbox item for diplomatic beats, a toast or modal for battlefield beats, a full-screen event for successions or wars. Same underlying data, different presentation.

**Resolution** sends the chosen action back through the proposal pipeline, validated and executed deterministically.

### 3.4 Three worked events

**Event A — "Ruskel's patience wears thin."** Trigger: relationship(ruskel → player) has stayed below -30 for 5 turns without direct contact, AND ruskel has a military goal targeting a player ally.

> *An envoy from the Tsar of Ruskel arrives in your hall. He does not bow.*
>
> "Your silence is louder than any siege horn. The Tsar is tired of waiting for you to choose a side. We will have your answer before the winter breaks: stand with us against Onishiman, or stand against us. There is no third path."
>
> **Choices:**
> 1. *Side with Ruskel against Onishiman.* → `PROPOSE_OFFENSIVE_ALLIANCE(target=onishiman)`
> 2. *Promise neutrality in exchange for time.* → `PROPOSE_CEASEFIRE(turns=10)` + relationship clamp
> 3. *Defy him publicly.* → `PUBLIC_DENOUNCE(target=ruskel)` — triggers downstream escalation
> 4. *Say nothing; the envoy rides home empty-handed.* → relationship drops another 15, ruskel goal escalates

**Event B — "The First Councilor hears a rumor."** Trigger: player has sent three `DIPLOMATIC_GIFT` actions to the Silver Union in ten turns, plus one `SPREAD_RUMOR` at any time against anyone.

> *A discreet letter arrives, scented with cedar oil.*
>
> "Dear friend — your recent generosity has not gone unremarked by the Council. We confess a certain curiosity as to its source. Vellamar has prospered long by reading ledgers well, and yours, of late, reads richly. We would be obliged if you would dine with our envoy at your convenience, that we might speak of small matters, and large ones."
>
> **Choices:**
> 1. *Be transparent about your intentions.* → relationship +10, unlocks a deeper trade agreement next turn
> 2. *Deflect with humor and more gifts.* → relationship +3, suspicion flag set
> 3. *Withdraw; stop the gifts.* → relationship -5, no further events from this chain
> 4. *Offer a formal alliance to pre-empt suspicion.* → `PROPOSE_DEFENSIVE_ALLIANCE`

**Event C — "Ash on the Sacred Valley's wind."** Trigger: a province adjacent to the Sacred Valley has been held by a non-Five-Suns faction for 8 turns, AND the holding faction is at war with any third party.

> *The Tlatoani's message is carried by a boy whose face is painted with three streaks of ash.*
>
> "Our Calendar has seen the smoke of your wars in the valley's long shadow. The Suns will not watch forever. Return the land to the Federation, or open it to our priests, or know that the Fifth Sun rises on every door we choose to open."
>
> **Choices:**
> 1. *Cede the province.* → `CEDE_PROVINCE` — massive spiritual gain with tlalocayotlan, permanent territorial loss
> 2. *Open it to Five Suns priests.* → `DEMAND_RELIGIOUS_TOLERANCE` accepted in reverse — province begins slow conversion
> 3. *Offer tribute for patience.* → `OFFER_GOLD_TRIBUTE` — buys 10 turns, red line not crossed
> 4. *Declare them heretics first.* → `DECLARE_HERESY` on tlalocayotlan — starts a religious war

Notice the design pattern: each event has at least one "satisfy the faction" choice, one "defy the faction" choice, one "compromise" choice, and one "buy time" choice. That four-way structure gives the player a real decision every time. Two-choice events (good/bad) are banned — they generate no interesting stories.

### 3.5 Design rules for events

- **Triggers are mechanical.** No LLM-driven trigger detection. Ever.
- **Cap event frequency.** Default 3 non-critical events per turn. Too many and the game becomes a visual novel; too few and the world feels dead.
- **Choices are always catalog actions.** The LLM never invents mechanical effects. It picks from the approved shortlist and writes the voice.
- **Every event is a branching point.** If the same four choices produce no state divergence, the event is cosmetic — cut it.
- **Memory matters.** Record every event and the player's choice. Feed the record into future LLM context so factions remember how the player handled them.
- **Test the no-op.** "Do nothing" should always be a valid choice, and it should have a real consequence, not zero consequence.

---

## Part 4 — How the Three Layers Fit Together

The action vocabulary is the alphabet. The personality schema is the speaker's accent and vocabulary range. The event system is the story's punctuation — the beats when the game pushes the conversation forward on its own.

The runtime loop:

1. Engine advances a turn. All deterministic game logic runs (movement, combat, income, objectives).
2. Engine scans state, produces a trigger list, prioritizes to top N plus criticals.
3. For each firing trigger, engine commissions an LLM call: personality card of the speaking faction + world snapshot + history + allowed actions. LLM returns narrative beat plus pre-compiled choices.
4. Player responds — by choosing an event option, by initiating a new conversation, or by ending turn.
5. Player-initiated conversations go through the same pipeline as events, except the trigger is "player opened a channel to faction X."
6. Every player utterance is passed to the LLM along with faction personality and state. LLM emits both an utterance back and a structured proposal. Engine validates, presents, awaits player response.
7. Accepted proposals execute effects; all effects are deterministic and recorded to history.
8. Faction relationship values, agreements, and grudges update. These values are invisible to the player directly but shape the next turn's event detection and LLM context.

The invariant to protect: **no game-state mutation ever comes from the LLM directly.** The LLM produces text and structured proposals. The engine validates and executes. If this invariant holds, you can change the LLM provider, swap models, add caching, anything — without touching game balance.

---

## Part 5 — What to Build First (Vertical Slice)

Do not try to ship all of this at once. The right v1 scope is:

- **5 factions** instead of 15. Pick Ruskel, Onishiman, Silver Union, Tlalocayotlan, and one more — enough for the personalities to contrast, not so many that the balance space explodes.
- **1 victory path**: military. Other paths can come later; military conquest is the clearest teacher of the system.
- **Half the action catalog**: ~20 actions, one or two per category, covering the full escalation ladder. Skip dynastic actions entirely for v1.
- **A dozen trigger types** out of the 40+ possible. Focus on relational, military, and agreement-lifecycle triggers. Defer economic and religious events.
- **Small map**: 80–120 hexes with five factions placed so every pair has at least one interaction vector (shared border, contested strait, trade corridor).
- **One UI surface for diplomacy**: inbox-style conversation panel with faction list on the left, active conversation in the middle, "ledger" tab on the right for active agreements. This replaces DiplomacyPanel, DiplomacyInfluencePanel, DiplomacyInfluenceMergedPanel, TradeTreatyScreen, and MarketPanel.

Success criterion for the vertical slice: a playtester finishes a 30-turn game and describes at least three emergent stories involving specific factions, specific conversations, and specific decisions they made. If they can, the system works and you can scale up. If they can't, you haven't built a game yet — scale down further and iterate on feel before adding scope.

---

## Appendix A — Invariants That Must Never Break

1. The LLM never writes to game state. Only the engine does.
2. Every LLM output is validated against the action vocabulary and personality card before it affects the game.
3. No action in the catalog can produce a victory condition on its own.
4. Every faction's personality card is loaded into every LLM call involving that faction.
5. Every event has at least three distinguishable player choices with distinct mechanical outcomes.
6. Every conversation is logged and available to future LLM calls as context.
7. The game is fully playable (if grimmer) without any LLM — the mechanical substrate must be complete on its own.

The last invariant is the insurance policy. If the LLM is down, over-budget, or behaving badly, the game still plays as a terse, text-free strategy game with the same rules. The LLM makes it alive; the mechanics make it a game.
