# Phase 2 Game Design Analysis: Command Phase
## From Individual Contributor to Manager

**Date**: 2026-02-13
**Authors**: Game Design Team (three designers who have played this game a million times)
**Status**: Analysis Complete
**Source**: Deep analysis of `js/game.js` (26,995 lines) + Phase 2 design doc

---

## Part 1: What Makes Phase 1 Feel Like Phase 1

Before we can design Phase 2, we need to articulate exactly *why* Phase 1 works. We've spent hundreds of hours in this game. Here's what we know in our bones.

### 1.1 The Information Density Contract

Phase 1's HUD is the densest real-time dashboard we've seen in a browser game. The player manages:

- **SYS.STATUS** panel (top-left): Shield health bar, active powerup slots, harvest counter icons with bounce animations
- **MISSION.CTL** panel (top-center): Wave number, quota progress bar, timer with 10-second warning countdown
- **BM.CONDUIT** panel (gap between mission and systems): Bio-matter upload conduit with scrolling binary stream, upload rows with flash effects, bit-rate counter
- **SYS.SHIELD** panel (top-right): Shield integrity with segmented NGE-style bars
- **NRG.FLOW** panel (below shield): Real-time dual-line energy graph (intake vs. output) with 180-sample ring buffer, peak detection, gradient fills, beam activity overlay
- **TECH.SYS** panel (gap between status and mission): Research queue (1/3) + tech tree nodes (2/3) with animated dashed connections, research glow phase, bio-organic particle backgrounds
- **ORD.SYS** (weapons zone, left): Bomb count with recharge timers, missile group status with ready/recharging indicators
- **FLEET.CMD** panel (right): Coordinator sections with sub-drone hierarchies, energy bars, status text, micro-grid readouts, damage flash overlays
- **INCOMING TRANSMISSION** (commander zone, bottom-left): Commander portrait with emotion states, typewriter dialogue, blinking status indicators (COMMS/SYNC/LOCK)
- **DIAG.SYS** (left, below weapons): Scrolling diagnostic lines with NRG.MAIN, BEAM.SYS, SHLD.INTG, drone status, threat count, combo counter, wave timer, sparkline
- **OPS.LOG** (left, below ordnance): Event log with color-coded entries

**The key insight**: This isn't information overload — it's information *density managed through visual hierarchy*. The `renderHUDFrame()` function at line 14355 orchestrates all of this with panel-ready checks, slide animations, and conditional visibility. Panels slide in when relevant systems unlock (weapons panel appears when first bomb/missile is purchased, fleet panel when first drone is deployed). The HUD *grows with the player*.

**What this means for Phase 2**: The Command HUD must feel like the natural *next evolution* of this density. Players who've mastered reading 10+ concurrent information streams are ready for zone-level monitoring. The density doesn't decrease — it *reorganizes* from "my ship's systems" to "my fleet's operations."

### 1.2 The Visual Language: NGE Panel System

Every HUD element uses the `renderNGEPanel()` function (line 13185) — an Evangelion-inspired angular panel system with:

- **Cut corners** (45-degree chamfers) — panels define identity through which corners are cut: status `['tl']`, weapons `['br']`, fleet `['tr']`, commander `['tl', 'br']`
- **Hex-grid texture** — subtle honeycomb pattern fills every panel at 0.04 alpha
- **Inner glow line** — 1px inset border at 0.15 alpha
- **Panel-specific accent colors**: `#0ff` (cyan) for systems, `#0f0` (green) for commander/mission, `#f80` (orange) for energy, `#f44` (red) for weapons, `#48f` (blue) for fleet, `#0af` (light blue) for diagnostics, `#0a4` (dark green) for tech tree

Supporting utilities that define the visual vocabulary:
- `renderNGEBar()` (line 13372): Segmented progress bars with glow, pulse, threshold markers
- `renderNGEStatusDot()` (line 13480): Color-coded status indicators (nominal/caution/critical)
- `renderNGEIndicator()` (line 13627): Multi-shape indicators (circle, square, diamond, triangle) with modes (steady, blink, cascade, double, radar, breathe)
- `renderNGEScanlines()` (line 13535): CRT-style scanline overlays with variable alpha
- `renderNGEDataStream()` (line 13573): Scrolling hex/binary data visualizations
- `renderNGEChevrons()` (line 13596): Animated directional chevron indicators
- `renderNGEBlinkLight()` (line 13612): Status LEDs with configurable blink rate
- `renderNGEKeyBadge()` (line 13734): Keyboard shortcut badges
- `renderEnergyFlowLine()` (line 13718): Animated energy conduit connections between panels

**What this means for Phase 2**: Every Command Phase panel MUST use `renderNGEPanel` with the same visual language. Zone panels should use a new cut-corner pattern to distinguish them from Phase 1 panels. The sidebar management panels should use the established accent color system extended with new colors for command-specific functions.

### 1.3 The Boot Sequence: Ritual as Game Feel

The game has TWO layered boot sequences that run at every wave start:

**Pre-Boot (CRT Turn-On)** — `preBootState` (line 13812):
1. CRT phosphor expansion (0.3s) with `SFX.crtTurnOn()`
2. Quantum OS logo fade-in with `SFX.alienStartupChime()`
3. Logo dissolve (0.2s)
4. Border trace animation (0.75s) — a light traces the full screen perimeter, triggering panel boots at specific trace positions. Corner tone SFX play at each corner.
5. Each panel boots independently as the trace reaches its trigger position

**Panel Boot** — `initHUDBoot()` (line 17473):
- Each panel has an `active`, `startTime`, `duration`, and `phase` ('waiting' -> 'booting' -> 'online')
- Boot overlays show scrolling diagnostic text (generated by `generateBootLines()`)
- Panel slide animations reset to 0 and re-slide during boot
- Tech-specific boot panels appear for each researched tech

**BIOS Boot (Wave Transition)** — `initBiosBootSequence()` (line 23414):
- Full-screen BIOS POST sequence with terminal-style output
- Phase 1 (0-0.6s): Hardware detection, device scanning, memory diagnostics
- Phase 2 (0.6-1.0s): ORCHESTRATOR online, resource allocation
- Phase 3 (1.0-1.6s): Swarm table — progress bars for SWARM.TACTICAL, SWARM.HARVEST, etc.
- Phase 4 (1.6-2.0s): Mothership uplink, tactical data download
- Phase 5 (2.0-2.6s): System checks for all active subsystems
- Phase 6: Countdown (3, 2, 1, LAUNCH) with flash strobe
- Tech-specific device entries appear for researched techs
- The sequence adapts dynamically — more tech = more boot lines = richer ritual

**What this means for Phase 2**: The promotion trigger needs its own cinematic boot sequence that is THE most dramatic boot in the game. It should feel like the BIOS POST sequence but deeper — the system is reconfiguring from single-operator mode to command mode. New subsystems come online: ZONE.ARRAY, CREW.ROSTER, DIRECTOR.COMM, FLEET.ORDERS. Each zone should have its own mini-boot when it materializes.

### 1.4 The Commander Figure

The commander (your boss in Phase 1) is drawn procedurally at `renderCommanderPortrait()` (line 22595):

- **Holographic screen background** with CRT scanlines (every 3px green lines)
- **5% chance of holographic flicker** per frame — entire portrait replaced with green flash
- **Shake effect**: `furious` = high-frequency shake (sin at 0.04 rate, 3% amplitude), `angry` = moderate shake
- **Classic gray alien head**: Elongated cranium (ellipse for top, quadraticCurveTo for tapered chin), green skin (#0a5)
- **Iconic wrap-around black almond eyes**: 60-degree inward slant, glassy reflection highlights
- **Emotion-tinted eye glow**: Red for furious, orange for angry, green for pleased
- **Static/noise overlay**: 8 random green pixels scattered per frame
- **Border color changes with emotion**: Green (neutral), orange (angry), red (furious)

The commander appears in two contexts:
1. **During waves** (`renderCommanderZone`, line 16346): "INCOMING TRANSMISSION" panel with typewriter dialogue, status indicator dots (COMMS/SYNC/LOCK), pulsing accent line
2. **Wave summary / shop** (`renderCommanderDialogue`, line 22736): Speech bubble with word-wrapped text

Dialogue system (`COMMANDER_DIALOGUES`, line 3269):
- `quotaMet`: Backhanded compliments ("Barely adequate")
- `quotaExceeded`: Grudging praise ("Perhaps you are not entirely worthless")
- `quotaMissed`: Full rage ("MY TENTACLES ARE LITERALLY SHAKING")
- `shopIdle`: Impatient nagging ("This isn't a MUSEUM!")
- `shopGuidance`: Context-aware hints keyed to game state (no harvesters, no bombs, no research, etc.)

**What this means for Phase 2**: THE DIRECTOR must be a more intimidating version of this same visual language. Deeper green skin, larger portrait, harsher sawtooth voice synthesis. The Director's portrait should use the same procedural rendering approach but with key differences: sharper features, more prominent brow ridge, military insignia, maybe glowing red accents. The Director's dialogue system needs the same typewriter + garbled speech pattern but with a deeper voice frequency. The emotion states map directly: the Director has `furious`, `angry`, `neutral`, `pleased` — but `pleased` is rarer and more mechanically significant (indicates you're earning trust).

### 1.5 The Wave System and Progression Feel

Wave loop (`update()`, line 26646):
1. 60-second wave timer counting down
2. Targets spawn on timer intervals (2-4 seconds), up to 5 on screen
3. Tanks spawn at wave start — count scales with wave number (base 1 + 0.5 per wave)
4. Heavy tanks appear at wave 5+ (1 initially, scaling)
5. Timer warning sound plays every second in last 10 seconds
6. Wave end triggers: cleanup tutorial, stop beam/charging, tally lost deliveries from active drones/coordinators
7. Quota check: consecutive misses tracked, penalty applied (20% faster tank fire per miss)
8. Transition to WAVE_SUMMARY state

Wave summary (`startWaveSummary`, line 22231):
- Staggered reveal animation: border trace -> title hex-decode -> targets one by one -> points count-up -> bonuses (system check lines) -> UFO Bucks -> bio-matter -> totals
- `CountUpAnimation` class (line 22100) with eased interpolation
- Sound ticks during count-up at variable intervals
- Commander reaction set based on quota performance
- Auto-continues after 4 seconds or on keypress

Then: Shop phase (30 seconds) with 3 tabs (maintenance, weapons, systems), tech tree, cart system, commander guidance.

**What this means for Phase 2**: The wave loop must support multiple simultaneous zone simulations. Each zone runs a simplified version of the Phase 1 update loop. The wave summary evolves into a report card — per-zone performance breakdown, aggregate quota, Director reaction. The shop evolves into the between-wave management screen with the decision budget system (1 mandatory + 1 optional). The tech tree transforms from 3x5 action tracks to 3 command specialization tracks.

### 1.6 The Energy/Resource Economy

Energy is THE central tension mechanic:
- UFO has `maxEnergy` (base 100, scales with upgrades)
- Beam drains at 20/sec, recharges at 14/sec (net -6/sec while beaming)
- Beam is needed for: abducting targets (scoring), recharging coordinators, powering drones via beam conduit
- Energy Surge powerup removes drain cost temporarily
- `NRG.FLOW` graph visualizes the in/out balance in real-time with 180-sample ring buffer

Bio-matter is the tech tree currency:
- Earned per abduction: human 3, cow 2, sheep 2, cat 1, dog 1, harvester batch 2
- Spent on tech tree research (costs 10-65 per node)
- Tracked with upload conduit animation, scrolling binary stream

UFO Bucks are the shop currency:
- Earned from wave points (points / 10) plus bonus multipliers
- Spent on equipment upgrades, drones, missiles, repairs

**What this means for Phase 2**: The resource economy must scale from personal to organizational. Energy becomes a zone-shared resource with transfer mechanics (the design doc's "pipeline delay"). Bio-matter becomes the primary currency across all zones. Command Points (CP) are the new tech currency — scarce, earned from quota performance and coaching wins. The tension shifts from "do I beam or conserve energy?" to "which zone gets these resources?"

### 1.7 The Drone/Coordinator System

Drones (`HarvesterDrone` line 9352, `BattleDrone` line 9830):
- Deployed at energy cost (25 per drone)
- Time-limited (harvester 45s, battle 40s)
- Harvesters auto-collect targets in batches of 3
- Battle drones seek and attack tanks
- Drones have energy timers that tick down — can be recharged via beam

Coordinators (`Coordinator` line 10120, `HarvesterCoordinator` line 10877, `AttackCoordinator` line 10978):
- Higher-tier autonomous units that manage sub-drones
- Sub-drone count scales with tech (base 3, up to 5 with Fleet Expansion)
- Coordinators have energy bars, SOS beacons when low, distress arrows on HUD
- `inSnapRange` mechanic — beam automatically snaps to recharge nearby coordinators
- States: DEPLOYING -> ACTIVE -> POWER_OFF -> DYING

The FLEET.CMD panel visualizes all of this with:
- Coordinator sections with separator lines
- Sub-drone entries (D.01, D.02) with canvas-drawn connector lines
- Micro energy grids and status text
- Critical/dying row flash strobes

**What this means for Phase 2**: Crew members in the Command Phase ARE the drones/coordinators at a higher abstraction level. The crew member operates an entire zone (like how a coordinator manages sub-drones). The visual language of the FLEET.CMD panel — hierarchical entries, energy bars, status indicators, damage flashes — maps directly to crew status in zone panels. The coordinator's SOS beacon system evolves into the zone alert system. The beam-snap-to-recharge mechanic evolves into the resource routing mechanic.

---

## Part 2: How Phase 1 Mechanics Evolve Into Phase 2

### 2.1 The Promotion Cinematic

**Trigger**: All 15 techs researched (`techTree.researched.size === 15`). This can be detected by checking `checkTechPrerequisites` results for all nodes.

**Implementation approach**: Reuse the BIOS boot sequence infrastructure but dramatically escalated.

**Sequence** (10-15 seconds):

1. **Wave summary fades** (2s): Normal wave summary plays, but at the end instead of transitioning to shop, the screen holds on a black overlay.

2. **Priority transmission** (2s): Using the existing `renderCommanderZone` pattern but full-screen:
   - `renderNGEPanel` with `#f00` accent (new color — supreme priority)
   - Text crawl: "INCOMING TRANSMISSION -- PRIORITY: SUPREME" using `renderHexDecodeText()`
   - Blinking indicators at maximum rate

3. **THE DIRECTOR appears** (3s):
   - New portrait function `renderDirectorPortrait()` — 3x the size of commander portrait
   - Deeper green skin, more angular features, military collar/insignia
   - Sawtooth voice synthesis at 60% lower pitch than commander
   - Typewriter dialogue with slower character rate (15 chars/sec vs commander's 25)
   - Dialogue: "Impressive performance, Operator. Your sector results have been... adequate. You are hereby promoted to ZONE COMMANDER. You will now oversee multiple sectors. Do not disappoint me."

4. **Camera zoom-out** (3s): Using canvas transform:
   ```javascript
   ctx.save();
   ctx.translate(canvas.width/2, canvas.height/2);
   ctx.scale(zoomLevel, zoomLevel); // 1.0 -> 0.5
   ctx.translate(-canvas.width/2, -canvas.height/2);
   ```
   The single battlefield shrinks to half-screen. A second zone materializes beside it using the Bayer dither materialization pattern from `ufoPhaseInState`.

5. **HUD reconfiguration** (2s): The Phase 1 HUD panels slide off-screen using existing slide animations. New Command HUD panels slide in from edges. Use the `hudBootState.panels` pattern — each command panel gets its own boot sequence triggered by trace position.

6. **Flash**: "COMMAND MODE ACTIVATED" using `renderHexDecodeText()` at 48px font, white with cyan glow.

**Code patterns to reuse**:
- `initBiosBootSequence()` structure for the full-screen terminal sequence
- `preBootState` phases for CRT turn-on/border trace
- `renderHexDecodeText()` for dramatic text reveals
- `renderNGEPanel()` with new accent colors for command panels
- `hudBootState.panels` pattern for staggered panel boots
- Canvas zoom transforms for the camera pull-back
- Bayer dither (`BAYER4x4`) for zone materialization effect

### 2.2 Zone Panel Design

Each zone panel is a miniaturized Phase 1 battlefield. At 2-zone scale, each panel takes half the screen width.

**What goes in each zone panel**:

```
┌─────────────────────────────────────────────┐
│ SECTOR A-7                    ⚠ THREAT: MED │  <- Zone header (renderNGEPanel, #0ff)
│ ┌───────────────────────────────────────┐   │
│ │                                       │   │  <- Mini-battlefield (simplified Phase 1 render)
│ │    [targets moving, tanks firing,     │   │     - Targets rendered at 50% scale
│ │     crew UFO operating, drones        │   │     - Tanks at 50% scale
│ │     collecting, explosions]           │   │     - Crew UFO is new: alien portrait + ship
│ │                                       │   │
│ └───────────────────────────────────────┘   │
│ ┌─CREW──┐ ┌─QUOTA─┐ ┌─NRG──┐ ┌─DRONES─┐  │  <- Status strip (renderNGEBar for each)
│ │ Zyx-7 │ │ 12/15 │ │ 67%  │ │ 3/5    │  │
│ └───────┘ └───────┘ └──────┘ └────────┘  │
│ [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░]  STABLE          │  <- Zone health bar + border color
└─────────────────────────────────────────────┘
```

**Border color system** (maps to existing `renderNGEPanel` border colors):
- Green border + `#0f0` accent: Stable (performance > 80% of quota pace)
- Yellow border + `#ff0` accent: Stressed (performance 50-80% of quota pace, or equipment wear > 60%)
- Red border + `#f44` accent: Crisis (performance < 50%, or active crisis event)
- Flashing red + screen shake: Emergency (about to fail, crew breakdown, boss assault)

**Zone status strip elements** (each uses `renderNGEBar`):
- **CREW**: Assigned crew member name + thumbnail portrait. Uses `renderCommanderPortrait` adapted for smaller size and different skin tones/expressions
- **QUOTA**: Progress bar (x/target) with color shift as wave progresses
- **NRG**: Zone energy level (mirrors `NRG.FLOW` but simplified — single bar, no graph)
- **DRONES**: Active drone count in zone (mirrors `FLEET.CMD` slot counter)

**The mini-battlefield render**: A simplified version of the `render()` function that draws:
- Background (scaled `renderBackground()`)
- Targets (scaled `Target.render()`)
- Tanks (scaled `Tank.render()` / `HeavyTank.render()`)
- A crew-operated UFO (new sprite: alien figure visible in cockpit, behavior driven by AI based on crew traits)
- Projectiles and particles (scaled)
- NO HUD elements within the zone — all status information is in the status strip below

**Crew-operated UFO behavior (AI patterns based on traits)**:
- **Reckless**: UFO moves aggressively, stays low, beams at maximum opportunity but takes hits. High abduction rate, high damage taken.
- **Cautious**: UFO stays high, avoids fire, beams conservatively. Low damage, might miss quota.
- **Pattern**: Use the existing `UFO.update()` input system but replace `keys[]` checks with AI decision functions. The AI reads the same game state (target positions, tank positions, energy level) and outputs virtual key presses.

### 2.3 The Command HUD Layout

At 2-zone scale:

```
┌─────────────────────────────────────────────────────────────┐
│ [ZONE A]                            [ZONE B]                │  <- Zone panels (top 60%)
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─COMMAND.CTL─┐ ┌─CREW.ROSTER─┐ ┌─RES.FLOW─┐ ┌─COMMS──┐  │  <- Command HUD (bottom 40%)
│ │ Fleet orders│ │ Assignment  │ │ Pipeline │ │Director│  │
│ │ Priorities  │ │ Traits      │ │ Transfer │ │Report  │  │
│ │ Emergency   │ │ Performance │ │ Reserves │ │Cards   │  │
│ └─────────────┘ └─────────────┘ └──────────┘ └────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Command HUD panels** (each uses `renderNGEPanel` with new accent colors):

1. **COMMAND.CTL** (`#0ff`, cut corners `['tl']`):
   - Fleet order buttons: "DEFENSIVE" / "BALANCED" / "HARVEST" per zone
   - Emergency Override button (1 per wave, burns 1 CP)
   - Active crisis indicators with alert queue
   - Drift timer per zone (countdown to performance degradation)

2. **CREW.ROSTER** (`#0f0`, cut corners `['tr']`):
   - Crew member entries (name, portrait thumbnail, trait badges)
   - Assignment indicators (which zone)
   - Performance sparkline (using `diagEnhancedState` ring buffer pattern)
   - Morale bar (uses `renderNGEBar` with threshold markers)

3. **RES.FLOW** (`#f80`, cut corners `['bl']`):
   - Energy pool visualization (shared across zones)
   - Bio-matter accumulator (aggregate from all zones)
   - Transfer controls (drag-style or hotkey — route resources between zones)
   - Pipeline delay indicator (faster with Engineering investment)

4. **COMMS** (`#f44`, cut corners `['br']`):
   - Director portrait (larger version of commander portrait, more menacing)
   - Current directive/quota display
   - Report card preview (next scheduled review)
   - Approval rating bar (hidden mechanic that surfaces through Director behavior)

### 2.4 Crew Representation

Crew members are aliens. They're drawn with the same procedural alien portrait system as the commander but with individual variation.

**Visual differentiation axes** (all within `renderCommanderPortrait`-style rendering):
- **Skin color**: Range from pale green (#0a5) to deep teal (#085) to blue-green (#058)
- **Eye size**: Proportional to nervousness/experience. Rookies = huge eyes. Veterans = narrower, more focused
- **Eye color glow**: Trait-linked. Reckless = red tint. Cautious = blue tint. Loyal = gold tint.
- **Cranium shape**: Wider for experienced, more angular for aggressive traits
- **Expression**: Eyes narrow (focused/angry), eyes wide (surprised/scared), eyes half-closed (tired/burned out)

**Crew status indicators** (using existing NGE indicator vocabulary):
- **Morale**: `renderNGEBar` in green (high) -> yellow (moderate) -> red (low)
- **Stamina**: `renderNGEBar` that depletes over consecutive waves without rest
- **Trait badges**: Small colored indicators next to name (like tech chip indicators)
- **Performance trend**: Sparkline using ring buffer (same pattern as `diagEnhancedState`)

**Emote system** (lightweight visual feedback during live waves):
- Crew portrait in zone panel shows real-time emotion
- Successful abduction: Eyes brighten momentarily
- Taking damage: Portrait shakes (same shake system as commander `furious`)
- Nearing quota: Eyes narrow (determination)
- Failing quota: Eyes widen (panic)
- Burned out: Eyes half-closed, slower portrait updates

### 2.5 Director Interactions

THE DIRECTOR is the Phase 2 commander, but 69x worse.

**Visual presence**: Same procedural rendering as commander portrait but:
- 2x portrait size in COMMS panel
- Deeper green skin with subtle red undertones when angry
- More angular cranium (authority/intimidation)
- Military collar rendered below chin (two parallel lines with insignia dot)
- Eye glow is always slightly red (perpetual dissatisfaction)
- Holographic flicker rate increases when angry (from 5% to 15%)
- Static noise doubles when furious

**Voice synthesis** (extend SFX system):
- Commander voice: Sawtooth wave at ~150Hz with 8Hz LFO modulation (existing `SFX.startBeamLoop` pattern)
- Director voice: Sawtooth wave at ~90Hz with 4Hz LFO modulation (deeper, slower, more menacing)
- Director garble: `SFX.commanderSpeechGarble` at 60% lower frequency
- Typewriter speed: 15 chars/sec (vs commander's 25) — the Director speaks slowly and deliberately

**Report card system** (between-wave mandatory decision):
- Full-screen overlay using `renderNGEPanel` with `#f00` accent
- Zone-by-zone performance breakdown (using `renderSystemCheckLine` pattern from wave summary)
- Director commentary with typewriter dialogue
- Player response selection (3 options, each with mechanical consequences):
  1. **Spin** (Politics-aligned): Reframe failures positively. "Zone B had a rough wave but we're training new talent." Reduces Director anger but doesn't fix the problem.
  2. **Accountability** (People-aligned): Own the failure. "Zone B underperformed. I'm adjusting assignments." Sometimes earns respect. Risk: Director piles on.
  3. **Deflect** (Engineering-aligned): Blame systems. "Equipment degradation impacted Zone B output." Director might buy it if equipment wear is visible.

### 2.6 The Emergency Override

The pressure valve: once per wave, burn 1 CP to manually pilot a zone for 15 seconds.

**Implementation**: Camera zoom from command view into a single zone panel. The zone panel expands to full screen using canvas transform (same technique as promotion cinematic but reversed). Phase 1 controls activate — the player IS the UFO again. After 15 seconds, automatic zoom back out.

**Visual sequence**:
1. Flash "EMERGENCY OVERRIDE" in red using `renderHexDecodeText()`
2. Canvas zoom into selected zone (0.5s transition)
3. Phase 1 HUD partially re-activates (energy bar, beam, bombs — but zone-specific)
4. 15-second countdown timer (large, top-center, using timer warning SFX pattern)
5. At 3 seconds: Red flash warning "RETURNING TO COMMAND"
6. Canvas zoom back to command view
7. Director transmission: "I didn't promote you to play pilot, Commander." (typewriter, `angry` emotion)
8. Director approval -5%

**Code reuse**: The `render()` function (line 26886) and `update()` function (line 26646) can be called directly for the overridden zone, with a `isOverride` flag that routes inputs to that specific zone's game state.

### 2.7 Fleet Decay (Entropy)

The plate-spinner mechanic. Zones without active monitoring degrade.

**Implementation**: Each zone has a `driftTimer` (visible countdown). When the player is looking at a zone (it's selected/focused), the drift timer resets. When attention moves elsewhere, the timer starts counting down.

**Visual feedback** (using existing systems):
- Drift timer displayed as `renderNGEBar` under zone panel — starts green, shifts to yellow at 50%, red at 25%
- At red threshold: Zone border starts pulsing (same pattern as low-energy coordinator SOS beacon)
- At zero: Zone performance degrades by 5% per second until monitored
- `renderNGEIndicator` diamond pulses at zone corner when drift is critical

**Engineering track mitigation**: Slows drift rate by 30-50%. Mathematically: `driftRate = baseDriftRate * (1 - engineeringBonus)`.
**People track mitigation**: Crew self-corrects better — drift effect is halved because crew compensates autonomously.

### 2.8 Between-Wave Management: The Decision Budget

The wave summary screen evolves from passive observation to active decision-making.

**Mandatory decision: Director Report Card**

Uses the same `renderWaveSummary()` infrastructure but with additional interactive elements:
- Zone-by-zone breakdown (each zone gets a `renderSystemCheckLine` row)
- Director dialogue with three response buttons (Spin/Accountability/Deflect)
- Each response has visible tooltip showing mechanical consequences
- `setCommanderReaction()` equivalent for Director: `setDirectorReaction()`

**Optional decision: Pick one from queue**

Queue items appear as `renderNGEPanel` cards in a horizontal scrollable strip:
- **Coaching session**: Crew portrait + trait being developed + progress bar
- **Recruiting interview**: Candidate portrait + revealed traits + hidden trait indicators (???)
- **R&D allocation**: Tech tree branch + CP cost + benefit preview
- **Scheduling change**: Zone assignment grid (drag crew between zones)
- **Resource rebalancing**: Pipeline diagram with adjustable flow weights

Only ONE can be selected per break. The rest stay in queue (counter badge shows queue depth).

**Policy presets** (automation layer):
- Displayed as toggle switches below the decision queue
- Each policy has a name and current setting displayed in `renderNGELabel` style
- Changing a policy counts as the optional decision
- Examples: "AUTO-RECRUIT: Reject below [threshold]", "ROTATION: By stamina", "RESOURCES: Even split"

### 2.9 The Director's Kid Arc

The emotional heart of the command phase. Implementation details:

**Introduction**: Between waves in early 2-zone phase, COMMS panel shows incoming transmission. Director's portrait appears at maximum size. Dialogue: "I'm sending you someone. My kid. Treat them well."

**The Interview**: A special recruiting event (forced into the decision queue as mandatory). The kid's portrait: younger alien with oversized eyes (nervousness), slightly different skin tone (family resemblance to Director — use Director's exact `#0a5` base but lighter). Bad attitude dialogue options reveal poor traits.

**Path A — Hire and Coach**:
- Kid appears in crew roster with visible bad traits: `lazy` (red badge), `entitled` (orange badge), `distracted` (yellow badge)
- Stat bars are low — 30% across the board
- Each coaching session (optional decision) improves one stat by 10-15%
- Early coaching: Kid resists. Dialogue bubbles in zone panel: "My dad will hear about this" (using typewriter system)
- Mid coaching: Cracks show. Dialogue: "...maybe I could try harder"
- Late coaching: Breakthrough. Stats jump. Trait badges change color: `lazy` -> `recovering`, `entitled` -> `humble`
- Director reaction arc: Gets WORSE first (quota spikes, report cards get harsher), then softens
- Final Director dialogue: "...you did something I couldn't do." Using `pleased` emotion for the first time. Portrait shake stops. Eye glow turns gold.

**Visual storytelling through existing systems**:
- Kid's performance sparkline in crew roster shows gradual improvement
- Zone performance bars show the drag and eventual recovery
- Other crew morale bars dip (nepotism resentment) then recover (respect for development)
- Director approval rating bar shifts dramatically across the arc

### 2.10 Command Tech Tree Visualization

Three new tracks replacing the Phase 1 tracks:

```
        ENGINEERING & OPS (#f80)
               /\
              /  \
             /    \
            /      \
     PEOPLE -------- POLITICS
    (#0f0)           (#a0f)
```

**Implementation**: Reuse `renderTechTree()` structure (line 16754) but with new content:

- Same 3-row layout with 5 nodes per track
- Same visual patterns: researched (filled background + solid border), researching (glow + progress bar), locked (dashed border, dim)
- Same animated connections (dashed lines, glow when researched)
- NEW: Cross-track tension visualization. When you invest heavily in one track, the other two tracks show a subtle red tint on their remaining nodes (visual representation of opportunity cost)
- NEW: Track identity icons. Engineering = gear symbol, People = heart symbol, Politics = handshake symbol. Rendered at track header using simple canvas paths.

**CP cost display**: Each node shows CP cost (uses `renderNGELabel` pattern). Total CP invested per track shown in track header.

### 2.11 Crisis Systems and Visual Feedback

Crises must feel dramatic but manageable. Use existing visual vocabulary scaled up.

**Boss tank assault**:
- Zone border flashes red (same pattern as `healthFreakoutState` when health < 10%)
- Alarm SFX using `SFX.missileFire` pattern at lower frequency
- Alert queue entry with countdown timer
- Mini-battlefield shows heavy tank sprites entering from both sides

**Equipment failure**:
- Zone panel shows static noise overlay (same as commander portrait holographic flicker at 100% rate)
- `renderNGEBar` for equipment health drops to zero with red flash
- OPS.LOG equivalent shows "EQUIP.FAILURE — SECTOR A-7"
- Engineering-heavy players: auto-repair kicks in (bar starts refilling)

**Crew breakdown**:
- Crew portrait in zone panel shifts to `furious` emotion with maximum shake
- Performance sparkline flatlines
- Morale bar drops to red
- Zone status changes to "CREW.CRITICAL"
- People-heavy players: morale recovery kicks in immediately

**Director's surprise inspection**:
- COMMS panel emergency flash (red border pulse)
- Director portrait appears with `angry` emotion
- 10-second countdown: "INSPECTION IN PROGRESS"
- All zone performance counts 3x during inspection
- Politics-heavy players get 10-second advance warning

**Visual feedback priority**: At most 2 simultaneous crises at 2-zone scale. Crisis indicators stack in the alert queue (right side of command HUD) sorted by severity. Each uses `renderNGEIndicator` with `'blink'` mode at different rates to visually distinguish severity.

### 2.12 The 16-Zone Abstraction Layer

At 16 zones, individual panels are too small. The display shifts to:

**Heatmap** (4x4 grid):
- Each cell is a `renderNGEPanel` at minimal size (50x50px)
- Color-coded by composite health score: `#0f0` (green) -> `#ff0` (yellow) -> `#f44` (red) -> flashing
- Single glyph per cell showing combined status (quota progress + health)
- Uses the existing `renderNGEStatusDot` system scaled up

**Alert queue** (right side):
- Scrolling list of zone alerts sorted by severity
- Each entry: zone name + severity icon + timestamp
- Click/hotkey to focus

**Focus view** (expandable):
- Click a heatmap cell -> it expands to show full zone detail
- Same zone panel format as 2-zone/4-zone scale
- Other cells compress around it
- Uses canvas transform for smooth zoom transition

**This represents the Universal Paperclips scaling moment**: You've gone from piloting one UFO to managing 16 zones through abstractions. You can't see the individual abductions anymore. You're reading numbers, colors, alerts. The emotional distance between you and the ground-level work IS the design.

---

## Part 3: The Emotional Arc

### 3.1 The Promotion Rush

The player has just completed all 15 techs. They've mastered every system. The promotion cinematic should feel like a REWARD — the culmination of everything they've learned. The camera zoom-out is the key moment: you see your battlefield shrinking, and you realize you're bigger than one zone now.

**Audio**: Ascending synth chord (extend `SFX.waveComplete` pattern) followed by the Director's deep voice. The contrast between the celebratory music and the menacing new boss creates the emotional tension.

### 3.2 The Weight of Delegation

The first time a zone panel shows your crew member struggling — taking damage, missing targets — and you CAN'T directly help (you're watching, not playing), that's the emotional core. You KNOW how to do it. You've done it for 15+ waves. But you can't do it for them.

**Game feel**: The crew-operated UFO in the zone panel should occasionally do things that make you wince. A reckless crew member chasing a target into tank fire. A cautious crew member passing up a perfect abduction opportunity. You know better, but you're the manager now.

### 3.3 The Director's Kid Resolution

Whichever path the player takes, it should feel EARNED:
- Path A (hire + coach): The slow transformation from drag-on-performance to valuable team member. The Director's grudging respect. The mechanical reward (+20% crew retention, -30% Director volatility).
- Path B (don't hire): The immediate political pain. The harder quotas. But the crew's respect. The clean team feeling.
- Path C (hire then fire): The messy middle. The political fallout. The mixed crew reaction.

None of these paths is "correct." That's the point.

### 3.4 The Clicker Game Scaling

Universal Paperclips teaches: the magic is in watching numbers grow through increasingly abstract mechanisms. Phase 2's scaling should feel the same:

- **2 zones**: You can see everything. You know your crew. You manually route every resource.
- **4 zones**: You're setting policies. You can't watch everything. Trust your best crew members.
- **16 zones**: You're reading a heatmap. Your team leads manage sub-teams. You set global strategy. The numbers are enormous. The individual abductions are invisible. But you built this.

The emotional journey: from "I did it myself" to "I built the team that does it" to "I built the system that builds the teams."

---

## Part 4: Specific Code Patterns for Implementation

### 4.1 Zone Simulation (Simplified Phase 1)

Each zone needs a lightweight game state:

```javascript
class ZoneState {
    constructor(zoneId) {
        this.id = zoneId;
        this.targets = [];
        this.tanks = [];
        this.projectiles = [];
        this.particles = [];
        this.crewUfo = null;       // AI-controlled UFO
        this.crewMember = null;    // Assigned crew
        this.quotaProgress = 0;
        this.energy = 100;
        this.driftTimer = 30;      // Seconds until degradation
        this.healthScore = 1.0;    // 0-1 composite health
        this.borderColor = '#0f0';
        this.alerts = [];
    }
}
```

The zone's `update(dt)` function runs a simplified version of the main `update(dt)`:
- Target spawning (reuse `spawnTarget` logic)
- Tank spawning (reuse `spawnTanks` logic, scaled to zone difficulty)
- AI-controlled UFO movement (trait-driven input simulation)
- Collision detection (simplified — fewer checks per frame)
- Score/quota tracking

The zone's `render()` function draws a scaled-down version of the main `render()`:
- `ctx.save(); ctx.translate(zoneX, zoneY); ctx.scale(zoneScale, zoneScale);`
- Render background, targets, tanks, UFO, particles
- `ctx.restore();`
- Draw status strip below using standard `renderNGEBar` / `renderNGELabel`

### 4.2 Crew AI System

```javascript
class CrewAI {
    constructor(crewMember) {
        this.traits = crewMember.traits;
        this.decisionTimer = 0;
        this.currentAction = 'idle';
    }

    getInputs(zoneState) {
        // Returns virtual key state based on traits and zone state
        const keys = {};
        const recklessness = this.traits.reckless || 0; // 0-1

        // Movement: reckless crew moves toward targets aggressively
        // Cautious crew stays in safe zones
        if (zoneState.targets.length > 0) {
            const nearest = this.findNearestTarget(zoneState);
            if (recklessness > 0.5 || this.isSafeApproach(nearest, zoneState)) {
                keys['ArrowLeft'] = nearest.x < zoneState.crewUfo.x;
                keys['ArrowRight'] = nearest.x > zoneState.crewUfo.x;
            }
        }

        // Beam: always try to beam targets in range
        // Reckless crew beams even when energy is low
        const shouldBeam = zoneState.crewUfo.energy > 20 || recklessness > 0.7;
        keys['Space'] = shouldBeam && this.hasTargetInBeam(zoneState);

        return keys;
    }
}
```

### 4.3 Director System

```javascript
const DIRECTOR_DIALOGUES = {
    // Report card responses
    reportCard: {
        quotaMet: [
            "Adequate. The Board expects 15% improvement next cycle.",
            "Your zones performed... within parameters. Barely.",
        ],
        quotaMissed: [
            "UNACCEPTABLE! Do you know how much this operation costs the GALACTIC COUNCIL?!",
            "I've seen INTERNS produce better numbers! What exactly are you DOING up there?!",
        ],
        quotaExceeded: [
            "...hm. The Board has noticed. Don't let it go to your head.",
            "Impressive numbers. I'll mention it in my report. Perhaps.",
        ]
    },
    // The Kid
    kidIntro: "I'm sending you someone. My kid. Treat them well.",
    kidComplaining: "Why is my kid COMPLAINING about you?! I didn't send them there to be LECTURED!",
    kidImproving: "The kid's numbers are... interesting. What did you do?",
    kidBreakthrough: "...you did something I couldn't do.",
    // Inspections
    inspectionStart: "SURPRISE INSPECTION. Let's see what you've really been doing.",
    inspectionEnd: {
        good: "Acceptable. For now.",
        bad: "This is going in my REPORT.",
    },
    // Emergency Override disapproval
    overrideDisapproval: "I didn't promote you to play pilot, Commander.",
};
```

### 4.4 Game State Transition

```javascript
// New game states for Phase 2
// gameState: 'TITLE' | 'PLAYING' | 'COMMAND' | 'PROMOTION_CINEMATIC' |
//            'COMMAND_SUMMARY' | 'COMMAND_MANAGEMENT' | ...

// Promotion trigger check (in wave end logic)
if (techTree.researched.size === 15 && !commandPhaseActive) {
    gameState = 'PROMOTION_CINEMATIC';
    initPromotionCinematic();
}

// Command phase wave loop
function updateCommand(dt) {
    // Update all zones simultaneously
    for (const zone of zones) {
        zone.update(dt);
    }

    // Update drift timers
    updateDriftTimers(dt);

    // Check for crises
    updateCrisisSystem(dt);

    // Update Director system
    updateDirector(dt);

    // Wave timer (shared across all zones)
    commandWaveTimer -= dt;
    if (commandWaveTimer <= 0) {
        gameState = 'COMMAND_SUMMARY';
        startCommandSummary();
    }
}
```

### 4.5 Resource Routing

```javascript
class ResourcePipeline {
    constructor() {
        this.pools = {};        // zoneId -> { energy, bioMatter, drones }
        this.transfers = [];    // Active transfers: { from, to, type, amount, delay, elapsed }
        this.transitLoss = 0.1; // 10% lost in transit (reduced by Engineering)
    }

    routeResources(fromZone, toZone, type, amount) {
        const delay = this.getTransferDelay(fromZone, toZone);
        const actualAmount = amount * (1 - this.transitLoss);
        this.pools[fromZone][type] -= amount;
        this.transfers.push({
            from: fromZone, to: toZone, type, amount: actualAmount,
            delay, elapsed: 0
        });
    }

    update(dt) {
        for (const transfer of this.transfers) {
            transfer.elapsed += dt;
            if (transfer.elapsed >= transfer.delay) {
                this.pools[transfer.to][transfer.type] += transfer.amount;
            }
        }
        this.transfers = this.transfers.filter(t => t.elapsed < t.delay);
    }
}
```

Transfer visualization: Animated `renderEnergyFlowLine()` between zone panels showing resources in transit. Uses existing energy flow animation pattern (line 17106) with new routing paths.

---

## Part 5: First Slice Validation Checklist

The design doc specifies the first slice tests: "Is delegation fun in two zones?"

For the first slice, implement:

1. **Promotion trigger detection**: Check `techTree.researched.size === 15` at wave end
2. **Minimal cinematic**: Director voice (new deeper sawtooth) + camera zoom + flash text
3. **2-zone layout**: Split screen with simplified Phase 1 sim per zone
4. **1 crew member**: Single personality axis (Reckless <-> Cautious). Portrait with trait-based variation.
5. **Quota management**: Per-zone quotas using existing `getQuotaTarget()` logic. Target band system.
6. **Director report cards**: 2-3 scripted dialogue options per performance tier.
7. **Zone simulation**: Simplified Phase 1 running per zone (targets, tanks, AI UFO).
8. **Emergency Override**: 1 manual takeover per wave with zoom transition.

Everything else (training wave, interview system, Director's Kid, mood system, policy presets, 4/16-zone expansion, full specialization tracks) is deferred.

The key question the first slice answers: When you watch a crew member operate a zone and you can't directly help, does that create the right tension? Does the combination of monitoring + resource routing + crisis response feel like a compelling management game? Does THE DIRECTOR make you want to perform?

If the answer is yes, everything else in this document becomes a roadmap for expansion.

---

## Appendix: Key Code References

| System | File Location | Function/Class | Lines |
|--------|--------------|----------------|-------|
| Game config | `js/game.js` | `CONFIG` | 6-412 |
| Tech tree config | `js/game.js` | `CONFIG.TECH_TREE` | 374-411 |
| Audio/SFX | `js/game.js` | `SFX` object | 622-1400+ |
| Game state | `js/game.js` | Global variables | 3020-3400 |
| Commander dialogues | `js/game.js` | `COMMANDER_DIALOGUES` | 3269-3343 |
| UFO class | `js/game.js` | `class UFO` | 5716-6654 |
| Tank class | `js/game.js` | `class Tank` | 6680-7187 |
| Heavy tank | `js/game.js` | `class HeavyTank` | 8756-9348 |
| Harvester drone | `js/game.js` | `class HarvesterDrone` | 9352-9830 |
| Battle drone | `js/game.js` | `class BattleDrone` | 9830-10120 |
| Coordinator base | `js/game.js` | `class Coordinator` | 10120-10877 |
| Tech tree logic | `js/game.js` | `checkTechPrerequisites()` etc. | 11313-11487 |
| NGE panel system | `js/game.js` | `renderNGEPanel()` | 13185-13344 |
| NGE bar system | `js/game.js` | `renderNGEBar()` | 13372-13480 |
| NGE indicators | `js/game.js` | `renderNGEIndicator()` | 13627-13718 |
| HUD state | `js/game.js` | `hudAnimState`, `preBootState`, etc. | 13754-13950 |
| Boot panels | `js/game.js` | `TECH_BOOT_PANELS` | 13909-13925 |
| HUD layout | `js/game.js` | `getHUDLayout()` | 14148-14193 |
| Energy pulse | `js/game.js` | `renderHUDEnergyPulse()` | 14196-14264 |
| Scanlines/glitch | `js/game.js` | `renderColumnScanlines()` | 14286-14353 |
| HUD frame render | `js/game.js` | `renderHUDFrame()` | 14355-14585 |
| Status zone | `js/game.js` | `renderStatusZone()` | 14593-14649 |
| Mission zone | `js/game.js` | `renderMissionZone()` | 14685-14775 |
| Bio-matter panel | `js/game.js` | `renderBioMatterPanel()` | 14775-14979 |
| Systems zone | `js/game.js` | `renderSystemsZone()` | 15041-15133 |
| Energy graph | `js/game.js` | `renderEnergyGraph()` | 15133-15567 |
| Weapons zone | `js/game.js` | `renderWeaponsZone()` | 15567-15812 |
| Fleet zone | `js/game.js` | `renderFleetZone()` | 15993-16346 |
| Commander zone | `js/game.js` | `renderCommanderZone()` | 16346-16433 |
| Diagnostics | `js/game.js` | `renderDiagnosticsZone()` | 16435-16669 |
| Tech tree render | `js/game.js` | `renderTechTree()` | 16754-17106 |
| Mission commander | `js/game.js` | `updateMissionCommander()` | 17130-17207 |
| HUD boot init | `js/game.js` | `initHUDBoot()` | 17473-17571 |
| HUD boot update | `js/game.js` | `updateHUDBoot()` | 17573-17733 |
| Boot overlays | `js/game.js` | `renderPanelBootOverlay()` | 17924-18115 |
| Wave summary | `js/game.js` | `renderWaveSummary()` | 22862-23410 |
| Commander portrait | `js/game.js` | `renderCommanderPortrait()` | 22595-22734 |
| BIOS boot | `js/game.js` | `initBiosBootSequence()` | 23414-23646 |
| Wave transition | `js/game.js` | `updateWaveTransition()` | 24528-24581 |
| Shop system | `js/game.js` | `renderShop()` | 24687-26010 |
| Game loop | `js/game.js` | `gameLoop()` | 26591-26644 |
| Update loop | `js/game.js` | `update()` | 26646-26886 |
| Render loop | `js/game.js` | `render()` | 26886-26995 |
