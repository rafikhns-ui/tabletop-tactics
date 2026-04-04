# RULERS OF ARDONIA — Base44 Implementation Prompt

## How to use this document

1. Create a new app in Base44
2. Copy-paste the prompt below into the Base44 chat
3. Upload the file `ardonia_game_map.json` when prompted
4. Base44 will generate the game app around your map data

---

## PROMPT FOR BASE44

```
Build a strategy war game called "Rulers of Ardonia" — an asymmetric geopolitical strategy game set in a fantasy world with 15 nations across two continents.

## CORE CONCEPT

This is a turn-based strategy game where players control nations, manage provinces, deploy armies, build cities, and pursue one of four victory paths: Military, Economic, Political, or Spiritual. The game map is a hex grid with 739 hexes (381 land, 358 water) covering 15 nations, each divided into 2-6 provinces with named capitals.

## DATA MODEL

Create these entities from the uploaded JSON file (ardonia_game_map.json):

### Nation entity
- id (string, unique)
- name (string)
- color (hex color string)
- polygon (JSON array of [x,y] coordinate pairs)
- centroid_x, centroid_y (numbers)
- total_hexes (number)
- province_count (number)
- is_playable (boolean, default true)
- gold (number, default 10)
- spiritual_points (number, default 0)
- influence_points (number, default 0)

### Province entity
- id (string, composite: nation_id + "-" + province_number)
- nation_id (reference to Nation)
- name (string — epic lore names like "Kazagrad — The Iron Citadel")
- capital_name (string — city name like "Kazagrad")
- is_national_capital (boolean)
- hex_count (number)
- terrain_distribution (JSON object)
- owner_id (reference to Nation — can change during conquest)
- has_fortified_city (boolean, default false for provincial capitals, true for national capitals)
- has_port (boolean, default false)
- garrison_strength (number, default 0)

### HexTile entity
- col, row (numbers — grid coordinates)
- x, y (numbers — percent position 0-100)
- nation_id (reference to Nation, nullable for water)
- terrain (string: water/coastal/plains/forest/hills/mountain/desert/swamp/tundra/scorched)
- province_id (reference to Province)
- has_unit (boolean, default false)
- unit_type (string, nullable)
- unit_owner (reference to Nation, nullable)

### TerrainType entity (10 types, pre-populated)
- id (string)
- label (string)
- color (hex string)
- movement_cost (number, null for water)
- defense_bonus (number: 0 for plains/coastal/desert/swamp/tundra/scorched, 1 for forest/hills, 2 for mountain)
- can_build_port (boolean — true only for coastal)

### GameSession entity
- id (auto)
- current_turn (number, default 1)
- current_phase (string: "planning" | "action" | "combat" | "economy" | "end_turn")
- active_player_id (reference to Nation)
- player_order (JSON array of nation IDs)
- scenario_act (string: "The Calm Before" | "The Shadow Declared" | "The Hour Approaches")

## TWO MAIN VIEWS

### VIEW 1: THE MAP VIEW (main game screen)

Full-screen hex map rendered in SVG. This is the primary game interface.

**Visual style:** Dark fantasy cartography. Background: #0a0c12. Gold accents: #d4a853.
**Fonts:** Use Cinzel (serif, medieval) for nation names and titles, Cormorant Garamond for body text.

**Hex rendering:**
- Each hex is a flat-top hexagon positioned at its (x, y) percentage coordinates
- Color by terrain type using the colors from TerrainType entity
- Opacity ~55% to let background show through
- Subtle inner hex line at 88% size for 3D depth effect
- Province borders: golden (#d4a853) dashed lines between hexes of same nation but different province
- Nation borders: dark (#0a0806) solid thick lines between hexes of different nations
- Water hexes: deep blue (#183a5c)
- Selected hex: golden glow ring with drop-shadow filter

**Province labels:**
- At the centroid of each province's hex cluster
- Colored circle (province shade of nation color) with capital name in Cinzel font
- ★ gold star icon for national capitals, ◆ diamond for provincial capitals

**Nation labels:**
- At each nation's polygon centroid
- UPPERCASE Cinzel bold, white with black stroke
- Double-layer: colored halo behind + white text on top

**Interactions:**
- Click hex → side panel shows: terrain type with icon, nation name, province name, capital city, coordinates
- Click province label → highlight all hexes of that province, show province info panel
- Click nation label → show nation overview with all provinces listed
- Hover hex → subtle highlight

**Side panel (right, 260px, collapsible):**
- Tab 1: SELECTED — info about clicked hex/province/nation
- Tab 2: NATION — current player's nation overview (gold, SP, IP, armies, provinces)
- Tab 3: ACTIONS — available actions for current turn phase
- Tab 4: LOG — turn history and combat results

### VIEW 2: THE STRATEGIC VIEW (dashboard)

A dashboard showing the geopolitical state of the world.

**Components:**
- **Nation Cards** — one card per nation showing: name, color, province count, hex count, gold, SP, IP, army size, fortified cities. Cards for playable nations are larger.
- **Victory Track** — four progress bars (Military, Economic, Political, Spiritual) per player
- **Province Table** — sortable table of all provinces with: name, nation, capital, terrain breakdown, garrison, fortified city status, port status
- **Turn Timeline** — shows current turn, phase, and scenario act
- **Diplomacy Panel** — shows relationships between nations (allied, neutral, at war)
- **Resource Summary** — total gold, SP, IP for each player

## GAME MECHANICS (simplified for digital)

### Turn Structure
Each turn has 5 phases:
1. **Planning** — players select which provinces to reinforce, where to build
2. **Action** — move units between adjacent provinces (movement cost based on terrain)
3. **Combat** — resolve battles in provinces with units from multiple nations
4. **Economy** — collect gold from provinces (plains=2, forest=1, hills=1, coastal=3, mountain=0, desert=1, swamp=0, tundra=1, scorched=0), pay unit upkeep
5. **End Turn** — check victory conditions, advance turn counter

### Province Conquest
- To conquer a province, move units into it and win combat
- Combat: attacker rolls dice vs defender rolls dice + terrain defense bonus + garrison bonus
- Conquered provinces change owner_id
- National capitals give +3 defense bonus

### Building
- **Fortified City** (cost: 8 gold) — +1 defense for all units in province, allows unit recruitment
- **Port** (cost: 5 gold, coastal provinces only) — enables naval movement, +1 gold income

### Victory Conditions (first to achieve any one wins)
- **Military:** Control 3+ enemy national capitals
- **Economic:** Accumulate 50+ gold AND control 2+ ports
- **Political:** Control 10+ influence points through diplomacy
- **Spiritual:** Accumulate 20+ spiritual points through temples and rituals

## SCENARIO ACTS (3-act structure)
- **Turns 1-3: The Calm Before** — no nation can declare war, only build and position
- **Turns 4-7: The Shadow Declared** — all actions available, Shadowfell tokens begin appearing
- **Turns 8-10: The Hour Approaches** — victory conditions unlock, endgame escalation

## VISUAL DESIGN GUIDELINES

**Color palette:**
- Background: #0a0c12 (near-black blue)
- Panel backgrounds: linear-gradient(135deg, #1a1c22, #14161c)
- Gold accent: #d4a853
- Text primary: #c8c0b0
- Text secondary: #888070
- Borders: #2a2520
- Success: #7a9a3a
- Danger: #c43030
- Info: #4488bb

**Each nation has its own color identity:**
- Gojeon: #7B3DBE (purple)
- Inuvak: #2E9E9E (teal)
- Ruskel: #C43030 (red)
- Icebound: #D8CFC0 (bone white)
- Oakhaven: #2E8D32 (green)
- Shadowsfall: #3C3C3C (dark gray)
- Onishiman: #8B1525 (dark crimson)
- Silver Union: #B0B0B0 (silver)
- Kadjimaran: #C49A2A (sandy gold)
- Nimrudan: #B5451B (crimson obsidian)
- Greater Kinetic: #E07020 (orange)
- Ilalocatotlan: #8B9B30 (olive)
- Hestia: #A08050 (bronze)
- Azure Moon: #7A6AED (purple-blue)
- Scorched Lands: #8B3A0F (burnt brown)

**UI components should feel like:**
- Dark medieval manuscript
- Gold leaf accents
- Textured borders (not flat)
- Cards with subtle gradients, not solid colors
- Buttons with gold borders and dark backgrounds

## BASE GAME FACTIONS (4 playable in base game)
The 4 playable factions for the base game are:
1. Onishiman Dragon Empire (military focus)
2. Nimrudan Empire (balanced/political)
3. Inuvak Polar Confederacy (spiritual focus)
4. Ruskel Iron Federation (military/economic)

The other 11 nations function as neutral/AI-controlled territories via the "Le Canif" system — they have armies and react to player actions but don't pursue victory conditions.

## IMPORTANT NOTES
- Import all hex, nation, and province data from the uploaded JSON file
- The hex grid uses percentage coordinates (0-100 on both axes)
- Hex size is 2.5 in the coordinate system
- Flat-top hexagons
- Province assignment is pre-computed — each hex already has its province_id
- Neighbor adjacency is pre-computed in the hex data
- The map should render ALL hexes including water (ocean/sea between nations)
```

---

## STEP-BY-STEP INTEGRATION

### Step 1: Create the Base44 app
- Go to app.base44.com
- Paste the prompt above
- Let Base44 generate the initial structure

### Step 2: Upload the game data
- Upload `ardonia_game_map.json` 
- Tell Base44: "Import this JSON file. Create Nation entities from the `nations` array, Province entities from each nation's `provinces` array, and HexTile entities from the `hex_grid` array. Pre-populate the TerrainType entity with the `terrains` object."

### Step 3: Iterate on the map view
- The first pass won't be perfect — iterate with prompts like:
  - "Make the hex grid render as SVG polygons, not as a simple grid"
  - "Add golden dashed province borders between hexes"
  - "Show ★ for national capitals and ◆ for provincial capitals"
  - "When I click a hex, show its info in the side panel"

### Step 4: Add game mechanics
- Start with just province selection and basic info display
- Then add turn structure
- Then add unit placement and movement
- Then add combat
- Then add victory conditions

### Step 5: Connect to GitHub
- Once the app works, connect it to your GitHub repo
- This lets you edit the code locally for fine-tuning
- All changes sync both ways

---

## FILE MANIFEST

| File | Description | Size |
|------|-------------|------|
| ardonia_game_map.json | Complete hex grid + nations + provinces + terrains + capitals | ~288 KB |
| polygon_editor.jsx | React map editor (keep for future map editing) | ~445 lines |
| base44_prompt.md | This document | — |
