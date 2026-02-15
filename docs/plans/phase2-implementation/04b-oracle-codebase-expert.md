# Oracle 2: Codebase Expert — Phase 2 Technical Feasibility Analysis

**Date**: 2026-02-13
**Role**: THE CODEBASE EXPERT — I have read every line of `js/game.js` (26,995 lines) and I know where every function lives, how every system connects, and what it will take to build Phase 2 on top of Phase 1.

---

## Part 1: Technical Feasibility — What Exists, What Adapts, What's New

### 1.1 Systems That Can Be Directly Reused

These systems are **self-contained** and need zero or minimal modification for Phase 2:

#### Audio System (`SFX` object, lines 622-1400+)
- **Architecture**: Global `SFX` object with methods that create Web Audio nodes on demand. Uses a single shared `audioCtx` (line 451).
- **Pattern**: Each sound is a function: `SFX.beamOn()`, `SFX.waveComplete()`, `SFX.timerWarning()`, etc. Oscillators with LFO modulation for alien voices (`startBeamLoop` at line 642 shows the sawtooth+LFO pattern).
- **Reuse**: Phase 2 can add new methods directly to `SFX`: `SFX.directorSpeech()`, `SFX.zoneAlert()`, `SFX.crisisAlarm()`, `SFX.promotionChord()`. The existing `startBeamLoop` pattern (sawtooth oscillator at 150Hz with 8Hz LFO, line 646-662) is exactly the template for the Director's voice — just pitch-shift to ~90Hz with 4Hz LFO as the design doc specifies.
- **Shared resource**: The `audioCtx` must remain single-instance. Phase 2 audio plays through the same context. No conflicts expected — Web Audio API handles concurrent sounds natively.

#### NGE Panel Rendering System (lines 13185-13750)
- `renderNGEPanel()` (line 13185): Takes `{color, alpha, cutCorners, label}`. Fully parameterized — Phase 2 panels just pass new colors (Director red `#a00`, command gold `#d4a017`) and new cut-corner patterns.
- `renderNGEBar()` (line 13372): Segmented progress bars with glow, pulse, threshold markers. Directly usable for zone health bars, crew morale bars, quota progress bars.
- `renderNGEStatusDot()` (line 13480): Color-coded status indicators. Maps perfectly to zone state dots.
- `renderNGEIndicator()` (line 13627): Multi-shape indicators with blink/cascade/radar modes. Zone alert indicators.
- `renderNGEScanlines()` (line 13535): CRT scanline overlays. Zone decay visualization.
- `renderNGEDataStream()` (line 13573): Scrolling hex/binary data. Command dashboard data stream.
- `renderNGEChevrons()` (line 13596): Animated directional chevrons. Zone selection indicators.
- `renderNGEBlinkLight()` (line 13612): Status LEDs. Zone status lights.
- `renderNGEKeyBadge()` (line 13734): Keyboard shortcut badges. Command hotkey indicators.
- `renderEnergyFlowLine()` (line 13718): Animated energy conduit connections. Resource flow visualization between zones.
- `hexToRgb()` (line 13361): Color conversion utility. Used everywhere.

#### Particle System (`Particle` class and `particles` array)
- Particles are stored in a global `particles` array, updated in `updateParticles(dt)` and rendered in `renderParticles()`.
- Each particle has `{x, y, vx, vy, life, maxLife, color, size}`.
- Phase 2 can use this directly for resource flow particles, crisis sparks, zone border effects.
- **Concern**: Global array. Phase 2 needs scoped particles per zone. Solution: each `ZoneState` holds its own particles array, or use a zone ID tag on particles.

#### Hex Decode Text (`renderHexDecodeText()`)
- Used for dramatic text reveals in wave summary and boot sequences.
- Directly usable for "COMMAND MODE ACTIVATED" flash, promotion text, zone unlock text.

#### CountUpAnimation (line 22100)
- Eased number animation with configurable start/end/duration. Used in wave summary.
- Reuse for quota counters, crew stats, Director approval animations.

#### Floating Text System
- `createFloatingText()` / `updateFloatingTexts()` / `renderFloatingTexts()` — global floating text overlay.
- Directly usable for command-phase notifications, crisis alerts, Director disapproval messages.

### 1.2 Systems That Need Adaptation

These work well but need structural changes to support Phase 2:

#### Game State Machine (line 3020, gameLoop at line 26591)
- **Current states**: `'TITLE' | 'PLAYING' | 'GAME_OVER' | 'WAVE_TRANSITION' | 'WAVE_SUMMARY' | 'SHOP' | 'NAME_ENTRY' | 'FEEDBACK'`
- **State switching**: `gameLoop()` (line 26591) uses a `switch(gameState)` that calls `update(dt)` + `render()` for `PLAYING`, other functions for other states.
- **What changes**: Add new states: `'PROMOTION_CINEMATIC' | 'COMMAND' | 'COMMAND_SUMMARY' | 'COMMAND_MANAGEMENT'`.
- **How**: Add cases to the `gameLoop` switch. The `COMMAND` state calls `updateCommand(dt)` + `renderCommand()` instead of `update(dt)` + `render()`. The transition from `PLAYING` to `COMMAND` passes through `PROMOTION_CINEMATIC`.
- **Trigger point**: At wave end (line 26836-26883), after quota check, check `techTree.researched.size === 15`. If true and `!commandPhaseActive`, set `gameState = 'PROMOTION_CINEMATIC'` instead of `'WAVE_SUMMARY'`.

```javascript
// line ~26836, after quota check
if (techTree.researched.size === 15 && !commandPhaseActive) {
    gameState = 'PROMOTION_CINEMATIC';
    initPromotionCinematic();
    return; // Don't proceed to normal wave summary
}
```

#### Wave System and Timer (lines 26755-26883)
- **Current**: Single `waveTimer` counting down 60 seconds. Single set of targets, tanks, projectiles.
- **Adaptation**: Phase 2 waves still have a shared timer, but each zone has independent targets/tanks/projectiles. The wave timer logic stays the same — it's the update loop that changes.
- **Key integration**: The wave end logic (line 26767-26883) handles cleanup, quota check, transition. Phase 2 needs an equivalent `endCommandWave()` that tallies all zones, runs Director report card, transitions to `COMMAND_SUMMARY`.

#### Tech Tree Logic (lines 11312-11485)
- `checkTechPrerequisites()`, `canResearchNode()`, `queueResearch()`, `completeResearch()`, `applyTechEffect()` — all operate on the global `techTree` object and `CONFIG.TECH_TREE`.
- **Adaptation**: Add a `CONFIG.COMMAND_TECH_TREE` with Engineering/People/Politics tracks. Create parallel functions: `canResearchCommandNode()`, `queueCommandResearch()`, `completeCommandResearch()`, `applyCommandTechEffect()`.
- The existing tech tree UI (`renderTechTree()` at line 16754) can be reused as a template for the triangular command tech tree renderer.

#### Commander Portrait (line 22595)
- `renderCommanderPortrait(x, y, size, emotion)` draws the procedural alien portrait.
- **Adaptation**: Create `renderDirectorPortrait(x, y, size, mood)` as a variant. Key differences: gray-blue skin `#2a3a4a` instead of green `#0a5`, larger eyes, cranial ridges, mouth line, military collar. Same canvas API patterns (ellipses, quadraticCurveTo, arcs).
- Create `renderCrewPortrait(x, y, size, crew)` as another variant with trait-driven geometry variations (angular for reckless, rounded for cautious, etc.).

#### Commander Dialogue System (lines 3269-3355)
- `COMMANDER_DIALOGUES` object with categorized text arrays. `commanderState` tracks current dialogue, emotion, typewriter progress.
- **Adaptation**: Create `DIRECTOR_DIALOGUES` object with same structure but different content. Create `directorState` parallel to `commanderState`.
- The typewriter rendering logic in `renderCommanderZone()` (line 16346) uses `commanderState.typewriterIndex` and increments per frame — same pattern for Director speech.

#### HUD Layout Engine (`getHUDLayout()`, line 14148)
- Returns an object with `{x, y, w, h}` rectangles for each panel based on `canvas.width` and `canvas.height`.
- **Adaptation**: Create `getCommandHUDLayout(zoneCount)` that returns zone positions and command panel positions. The existing function computes relative to canvas dimensions — same approach for command layout.

#### Boot Sequence System (lines 17473-17733, 13812-13906, 23414-23646)
- Three layers: `preBootState` (CRT turn-on, logo, border trace), `hudBootState` (panel boot overlays), `biosBootState` (BIOS POST terminal).
- **Adaptation**: The promotion cinematic reuses all three layers:
  - `preBootState` pattern for the initial crimson transmission effect
  - `hudBootState` pattern for command panel boots (gold variant)
  - `biosBootState` pattern for the command mode terminal sequence
- Create `initPromotionCinematic()` that sequences these in the new order.

### 1.3 Systems That Must Be Built From Scratch

These have no Phase 1 equivalent:

#### Zone Simulation Engine
- **What**: Each zone runs a simplified Phase 1 game. Targets spawn, tanks attack, an AI-controlled UFO operates.
- **Why new**: Phase 1's `update(dt)` (line 26646) operates on global state (`ufo`, `targets`, `tanks`, `projectiles`, `particles`). There is NO instance isolation. Every function reads/writes global variables.
- **Scope**: A `ZoneState` class encapsulating per-zone state (targets, tanks, AI UFO, energy, quota) and a `zoneUpdate(zone, dt)` function that operates only on that zone's state.
- **Complexity**: MEDIUM-HIGH. Most Phase 1 game logic can be simplified (fewer entity types, simpler collision), but the sheer number of things to port is significant.

#### Crew AI System
- **What**: AI controller that reads zone state and outputs virtual keypresses to drive the crew's UFO.
- **Why new**: Phase 1 uses `keys[]` (global keyboard state, line 3403). There is no AI input system.
- **Architecture**: `CrewAI` class with `getInputs(zoneState) -> virtualKeys{}`. Trait-driven decision functions: reckless AI moves toward targets aggressively, cautious AI stays safe.
- **Complexity**: MEDIUM. The decision logic is straightforward; the subtlety is making different traits feel visibly different.

#### Crew System
- **What**: Crew members with traits, morale, stamina, coaching progress.
- **Why new**: No personnel system exists in Phase 1.
- **Architecture**: `CrewMember` class with `{name, traits, morale, stamina, performance, coachingProgress}`. `CrewRoster` managing the full crew list, assignments, bench.
- **Complexity**: MEDIUM. Mostly data modeling and UI.

#### Director System
- **What**: THE DIRECTOR — mood tracking, report cards, quota demands, approval rating.
- **Why new**: The commander in Phase 1 (`commanderState`, line 3345) is purely cosmetic. The Director is a full game system with mechanical consequences.
- **Architecture**: `DirectorState` object with `{mood, approvalRating, quotaHistory, inspectionSchedule}`. `DirectorReportCard` class for between-wave interactions.
- **Complexity**: MEDIUM-HIGH. The dialogue trees, mood calculations, and mechanical consequences (quota modifiers, resource requisitions) require careful balancing.

#### Command HUD
- **What**: Zone panels, command bar, crew roster panel, resource flow panel, Director channel.
- **Why new**: Phase 1 HUD (`renderHUDFrame()` at line 14355) is hardcoded to a specific layout. Command HUD needs a completely different layout.
- **Architecture**: `renderCommandHUD(layout, commandState)` that draws all command panels. Each sub-panel is its own function.
- **Complexity**: HIGH (in total drawing code volume, not algorithmic complexity). Many panels, each with detailed rendering.

#### Resource Pipeline
- **What**: Shared resource pools, transfer mechanics between zones with pipeline delay and transit loss.
- **Why new**: Phase 1 resources are single-player (one UFO, one energy bar).
- **Architecture**: `ResourcePipeline` class with `{pools, transfers, transitLoss}`. `routeResources(from, to, type, amount)`, `update(dt)`.
- **Complexity**: LOW-MEDIUM. Straightforward resource management.

---

## Part 2: The Phase 2 Folder Architecture

### 2.1 The Critical Requirement

Phase 2 MUST live in its own folder so multiple agents can work on different files without git conflicts. The monolith `game.js` stays untouched except for minimal integration hooks.

### 2.2 How `index.html` Loads Phase 2

Current loading (line 103-104):
```html
<script src="js/changelog.js"></script>
<script src="js/game.js"></script>
```

Phase 2 adds script tags AFTER `game.js`. All Phase 2 scripts execute in the same global scope as `game.js`, so they can access `renderNGEPanel`, `SFX`, `ctx`, `canvas`, `CONFIG`, etc. directly. No module system needed — the game already uses global scope.

```html
<script src="js/changelog.js"></script>
<script src="js/game.js"></script>

<!-- Phase 2: Command Phase -->
<script src="js/phase2/command-state.js"></script>
<script src="js/phase2/zone-state.js"></script>
<script src="js/phase2/zone-simulation.js"></script>
<script src="js/phase2/crew-ai.js"></script>
<script src="js/phase2/crew-system.js"></script>
<script src="js/phase2/director-system.js"></script>
<script src="js/phase2/resource-pipeline.js"></script>
<script src="js/phase2/command-tech-tree.js"></script>
<script src="js/phase2/command-hud.js"></script>
<script src="js/phase2/zone-renderer.js"></script>
<script src="js/phase2/director-renderer.js"></script>
<script src="js/phase2/crew-renderer.js"></script>
<script src="js/phase2/promotion-cinematic.js"></script>
<script src="js/phase2/command-summary.js"></script>
<script src="js/phase2/command-management.js"></script>
<script src="js/phase2/emergency-override.js"></script>
<script src="js/phase2/command-boot.js"></script>
<script src="js/phase2/command-main.js"></script>
```

**Load order matters**: State/data files first, then simulation, then rendering, then orchestration (`command-main.js` last since it wires everything together).

### 2.3 File-by-File Breakdown

#### `js/phase2/command-state.js` — Global Phase 2 State
```
Purpose: All Phase 2 global state variables
Contains:
  - commandPhaseActive (boolean)
  - commandWave (number — separate wave counter for command phase)
  - commandWaveTimer (number)
  - zones[] (array of ZoneState instances)
  - crewRoster (CrewRoster instance)
  - directorState (object)
  - commandTechTree (object — Engineering/People/Politics tracks)
  - commandPoints (number — CP currency)
  - resourcePipeline (ResourcePipeline instance)
  - overrideState (object — emergency override tracking)
  - commandHUDLayout (cached layout object)
  - commandSummaryState (object — between-wave report card)
  - promotionCinematicState (object — cinematic sequence)
Why separate: Clean state isolation. No risk of name collisions with Phase 1 globals.
```

#### `js/phase2/zone-state.js` — Zone Data Model
```
Purpose: ZoneState class — one per active zone
Contains:
  class ZoneState {
    constructor(zoneId, config)
    Properties: id, targets[], tanks[], heavyTanks[], projectiles[], particles[],
                crewUfo, crewMember, quotaProgress, quotaTarget, energy, maxEnergy,
                driftTimer, driftRate, healthScore, borderColor, alerts[],
                equipmentWear, starSeed (for consistent starfield per zone)
  }
Why separate: Core data model used by simulation, rendering, and AI.
Lines: ~100-150
```

#### `js/phase2/zone-simulation.js` — Zone Game Logic
```
Purpose: Simplified Phase 1 update loop running per zone
Contains:
  - zoneUpdate(zone, dt) — the per-zone update tick
  - zoneSpawnTargets(zone, dt) — target spawning (simplified from updateTargetSpawning)
  - zoneSpawnTanks(zone) — tank spawning (from spawnTanks pattern)
  - zoneUpdateProjectiles(zone, dt)
  - zoneUpdateAIUfo(zone, dt) — drives UFO based on CrewAI output
  - zoneCheckCollisions(zone) — simplified collision detection
  - zoneUpdateQuota(zone)
  - zoneUpdateDrift(zone, dt, playerFocused)
Why separate: Heaviest logic file. Multiple agents will iterate on simulation balance.
Lines: ~400-600
Dependencies: ZoneState, CrewAI, CONFIG (from game.js)
```

#### `js/phase2/crew-ai.js` — Crew UFO Controller
```
Purpose: AI decision system that generates virtual inputs for crew-operated UFOs
Contains:
  class CrewAI {
    constructor(crewMember)
    getInputs(zoneState) -> { left, right, beam, bomb }
    findNearestTarget(zone)
    assessThreat(zone)
    shouldBeam(zone)
    evaluateRisk(zone)  // Trait-modulated risk assessment
  }
Why separate: Iterative tuning. Different trait profiles need playtesting.
Lines: ~200-300
Dependencies: ZoneState
```

#### `js/phase2/crew-system.js` — Personnel Management
```
Purpose: Crew member data model and roster management
Contains:
  class CrewMember {
    constructor(name, traits)
    Properties: name, traits{}, morale, stamina, performance, coachingProgress,
                hireWave, assignedZone, sparkline[] (performance ring buffer)
  }
  class CrewRoster {
    constructor()
    hire(candidate)
    fire(crewId)
    assign(crewId, zoneId)
    unassign(crewId)
    getAvailable()
    getBenched()
    updateMorale(dt)
    updateStamina(dt)
  }
  - generateCandidate() — random crew member generation
  - CREW_NAMES[] — alien name pool
  - TRAIT_DEFINITIONS — trait stat modifiers
Why separate: Self-contained people system. Interview/coaching/firing logic.
Lines: ~300-400
```

#### `js/phase2/director-system.js` — THE DIRECTOR
```
Purpose: Director AI, mood tracking, report cards, quota management
Contains:
  - DIRECTOR_DIALOGUES (dialogue trees)
  - directorState object
  - updateDirector(dt) — mood decay, inspection scheduling
  - generateReportCard(zonePerformance[]) -> ReportCard
  - processReportCardResponse(choice) — Spin/Accountability/Deflect consequences
  - getDirectorQuota(waveNum, history) — target band system
  - checkInspection(dt) — scheduled and surprise inspections
  - directorRequisition() — resource requisition events
  - DIRECTORS_KID_ARC — narrative state machine for the Kid storyline
Why separate: Complex narrative + mechanical system. Heavy iteration expected.
Lines: ~400-500
```

#### `js/phase2/resource-pipeline.js` — Resource Management
```
Purpose: Cross-zone resource sharing, transfers, pools
Contains:
  class ResourcePipeline {
    constructor()
    Properties: pools{}, transfers[], transitLoss, engineeringBonus
    routeResources(from, to, type, amount)
    update(dt)
    getPool(zoneId)
  }
Why separate: Clean resource logic. Transfer delay, transit loss, engineering modifiers.
Lines: ~150-200
```

#### `js/phase2/command-tech-tree.js` — Phase 2 Tech Tree
```
Purpose: Engineering/People/Politics specialization tracks
Contains:
  - COMMAND_TECH_TREE config (3 tracks x 5 tiers)
  - commandTechState object
  - canResearchCommandNode(nodeId)
  - researchCommandNode(nodeId)
  - applyCommandTechEffect(nodeId)
  - getTrackInvestment(trackName) -> total CP invested
Why separate: Mirrors Phase 1 tech tree but different mechanics (CP instead of BM, can't complete all).
Lines: ~200-250
```

#### `js/phase2/command-hud.js` — Command HUD Layout & Rendering
```
Purpose: The war room HUD — zone panels, command bar, sidebar panels
Contains:
  - getCommandHUDLayout(zoneCount) -> layout object
  - renderCommandHUD(layout, state) — master HUD render
  - renderCommandBar(layout) — top status bar (wave, quota, score)
  - renderCrewRosterPanel(layout) — sidebar crew list
  - renderResourcePanel(layout) — sidebar resource flow
  - renderOrdersPanel(layout) — sidebar fleet orders
  - renderDirectorChannel(layout) — Director communication panel
  - renderAlertQueue(layout) — crisis alerts
Why separate: Largest rendering file. Multiple agents will work on different panels.
Lines: ~500-700
Dependencies: renderNGEPanel, renderNGEBar, etc. (from game.js)
```

#### `js/phase2/zone-renderer.js` — Zone Panel Rendering
```
Purpose: Drawing mini-battlefields inside zone panels
Contains:
  - renderZonePanel(zx, zy, zw, zh, zoneData) — full zone panel
  - renderMiniStarfield(zx, zy, zw, zh, seed) — per-zone starfield
  - renderMiniGround(x, y, w) — simplified ground plane
  - renderMiniUFO(zx, zy, zw, zh, ufoData) — crew's UFO (tiny)
  - renderMiniTanks(zx, zy, zw, zh, tanks) — simplified tank sprites
  - renderMiniTargets(zx, zy, zw, zh, targets)
  - renderMiniBeam(zx, zy, zw, zh, ufoData)
  - renderZoneStatusBar(x, y, w, zoneData)
  - renderZoneCrisisOverlay(zx, zy, zw, zh, zoneData)
  - renderZoneBorderPulse(zx, zy, zw, zh, state)
  - renderZoneDecayFilter(zone, decayLevel)
Why separate: Rendering-heavy. Mini versions of Phase 1 rendering functions.
Lines: ~400-500
Dependencies: ZoneState, renderNGEPanel, renderNGEBar (from game.js)
```

#### `js/phase2/director-renderer.js` — Director Portrait & Transmissions
```
Purpose: Drawing THE DIRECTOR
Contains:
  - renderDirectorPortrait(x, y, size, mood)
  - renderDirectorTransmission(layout, dialogue, mood)
  - renderDirectorScreenEffect() — red overlay when Director speaks
  - renderReportCard(layout, reportCard, responseOptions)
Why separate: Distinct visual identity from Phase 1. Iterative portrait tuning.
Lines: ~300-400
Dependencies: renderNGEPanel, SFX (from game.js)
```

#### `js/phase2/crew-renderer.js` — Crew Member Visuals
```
Purpose: Drawing alien crew members at multiple scales
Contains:
  - renderCrewMember(x, y, size, crew) — full portrait
  - renderCrewEyes(cx, cy, s, crew) — expression system
  - renderCrewGlyph(x, y, size, crew) — 32px glyph mode
  - renderCrewPortrait(x, y, size, crew) — 48-64px sidebar mode
  - getTraitSkinColor(trait) — trait-to-color mapping
  - getMoraleColor(morale) — morale spectrum
  - TRAIT_HEAD_SHAPES — geometry definitions per trait
Why separate: Complex procedural character rendering. Needs iteration and tuning.
Lines: ~300-400
Dependencies: canvas ctx (from game.js)
```

#### `js/phase2/promotion-cinematic.js` — The Promotion Sequence
```
Purpose: 10-15 second cinematic when player completes all 15 techs
Contains:
  - initPromotionCinematic() — set up cinematic state
  - updatePromotionCinematic(dt) — advance through phases A/B/C/D
  - renderPromotionCinematic() — draw each phase
  - PROMOTION_PHASES — timing and content for each phase
Why separate: Scripted sequence with many visual effects. Self-contained.
Lines: ~300-400
Dependencies: renderDirectorPortrait, renderHexDecodeText, SFX, preBootState pattern
```

#### `js/phase2/command-summary.js` — Between-Wave Report Card
```
Purpose: Director report card + optional decision from queue
Contains:
  - startCommandSummary(waveData)
  - updateCommandSummary(dt)
  - renderCommandSummary()
  - renderZonePerformanceRows(zones)
  - renderDialogueOptions(options)
  - processDialogueChoice(choiceIndex)
  - renderDecisionQueue(queue)
  - processDecisionChoice(decisionIndex)
Why separate: Interactive between-wave screen. Complex UI with dialogue selection.
Lines: ~400-500
Dependencies: renderNGEPanel, renderDirectorPortrait, DIRECTOR_DIALOGUES
```

#### `js/phase2/command-management.js` — Between-Wave Decision System
```
Purpose: Coaching, recruiting, scheduling, policy management
Contains:
  - renderCoachingSession(crewMember)
  - renderRecruitingInterview(candidate)
  - renderSchedulingGrid(zones, roster)
  - renderResourceRebalancing(pipeline)
  - renderPolicyPresets(policies)
  - POLICY_DEFINITIONS — available policy configurations
Why separate: Multiple UI screens for different management actions.
Lines: ~300-400
```

#### `js/phase2/emergency-override.js` — Manual Takeover
```
Purpose: Zoom-in to zone, activate Phase 1 controls for 15 seconds
Contains:
  - initOverride(zoneId) — start zoom-in animation
  - updateOverride(dt) — countdown timer, Phase 1 input routing
  - renderOverrideTransition() — zoom animation
  - endOverride() — zoom back out, Director disapproval
  - OVERRIDE_COST, OVERRIDE_DURATION
Why separate: Bridges Phase 1 and Phase 2. Reuses Phase 1 input system.
Lines: ~200-250
Dependencies: UFO class update/render (from game.js), keys[] (from game.js)
```

#### `js/phase2/command-boot.js` — Command Mode Boot Sequence
```
Purpose: Gold-themed boot sequence for command panels
Contains:
  - initCommandBoot() — set up command panel boot states
  - updateCommandBoot(dt)
  - renderCommandBoot()
  - COMMAND_BOOT_LINES — diagnostic text for each command panel
Why separate: Adaptation of Phase 1 boot system with gold color scheme.
Lines: ~200-300
Dependencies: preBootState pattern, renderPanelBootOverlay pattern (from game.js)
```

#### `js/phase2/command-main.js` — Orchestration (LOAD LAST)
```
Purpose: Master update/render loop for command phase, game state integration
Contains:
  - updateCommand(dt) — master update: zones, drift, crises, Director, timer
  - renderCommand() — master render: background, zones, HUD, overlays
  - initCommandPhase() — called after promotion cinematic
  - endCommandWave() — wave completion logic
  - commandGameLoop integration — hooks into main gameLoop switch
Why separate: Top-level orchestration. Wires all Phase 2 systems together.
Lines: ~200-300
Dependencies: ALL other Phase 2 files, gameState (from game.js)
```

### 2.4 Integration Hooks in `game.js`

The monolith `game.js` needs exactly **three** small changes:

#### Hook 1: Game Loop Extension (line 26591)
Add cases to the `gameLoop` switch:

```javascript
// In gameLoop(), add after existing cases:
case 'PROMOTION_CINEMATIC':
    updatePromotionCinematic(dt);
    renderPromotionCinematic();
    break;

case 'COMMAND':
    updateCommand(dt);
    renderCommand();
    break;

case 'COMMAND_SUMMARY':
    updateCommandSummary(dt);
    renderCommandSummary();
    break;

case 'COMMAND_MANAGEMENT':
    updateCommandManagement(dt);
    renderCommandManagement();
    break;
```

#### Hook 2: Promotion Trigger (line ~26836)
After wave-end quota check, before `startWaveSummary`:

```javascript
// After quota check, before startWaveSummary(completedWave):
if (techTree.researched.size === 15 && !commandPhaseActive) {
    commandPhaseActive = true;
    gameState = 'PROMOTION_CINEMATIC';
    initPromotionCinematic();
    return;
}
```

#### Hook 3: Input Routing for Override (line 3403-3476)
During emergency override, Phase 1 input handling needs to route `keys[]` to the overridden zone instead of the normal UFO. This can be done by checking `overrideState.active` in the existing `keydown`/`keyup` handlers — minimal change.

### 2.5 State Coexistence

Phase 1 state (score, harvestCount, bioMatter, techTree) persists into Phase 2. Phase 2 adds new state but doesn't overwrite Phase 1 state.

- **Score**: Continues accumulating. Phase 2 adds points from zone performance.
- **Bio-matter**: Continues as currency. Phase 2 zones generate bio-matter that flows into the shared pool.
- **Tech tree**: Phase 1 techs remain researched (they affect zone simulation — crew UFOs benefit from Thruster Boost, Energy Efficiency, etc.).
- **Wave counter**: Phase 2 uses a separate `commandWave` counter. The global `wave` stays at whatever value triggered promotion.
- **Canvas/context**: Shared. Phase 2 renders on the same canvas.
- **Audio context**: Shared. Phase 2 adds SFX methods to the existing `SFX` object.

---

## Part 3: Integration Points

### 3.1 The Promotion Trigger

**Detection**: At wave end in `update()` (line 26767), after `waveTimer <= 0`:

```javascript
// Exact insertion point: after line 26856 (quota miss handling),
// before line 26858 (getWaveBonuses)
if (techTree.researched.size === 15 && !commandPhaseActive) {
    // Player has completed all 15 tech tree nodes
    // Promotion fires regardless of wave survival outcome
    commandPhaseActive = true;

    // Still award wave completion bonuses
    const completedWave = wave;
    score += CONFIG.WAVE_COMPLETE_BONUS;

    // Start promotion cinematic instead of normal wave summary
    gameState = 'PROMOTION_CINEMATIC';
    initPromotionCinematic();
    return;
}
```

**Progress tracker**: From tech 10 onward, show "COMMAND QUALIFICATION: X/15" in the HUD. This hooks into `renderHUDFrame()` (line 14355) — add a small overlay after the existing HUD panels.

```javascript
// In renderHUDFrame(), after all panels:
if (techTree.researched.size >= 10 && !commandPhaseActive) {
    const qualCount = techTree.researched.size;
    const pulsing = qualCount === 14 ? Math.sin(Date.now() / 200) * 0.3 + 0.7 : 1;
    ctx.globalAlpha = pulsing;
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#d4a017'; // command gold
    ctx.textAlign = 'center';
    ctx.fillText(`COMMAND QUALIFICATION: ${qualCount}/15`, canvas.width / 2, 20);
    ctx.globalAlpha = 1;
}
```

### 3.2 Emergency Override — Phase 2 to Phase 1 Bridge

Override temporarily activates Phase 1 controls within a single zone. Implementation:

1. **Zoom in**: Canvas transform scales the selected zone panel to full screen. Use `ctx.save/restore` with `ctx.translate` + `ctx.scale` — same pattern described in the design docs for the promotion zoom.

2. **Input routing**: During override, `keys[]` from the global keyboard handler drives the zone's UFO directly (bypassing CrewAI). The zone's `crewUfo` temporarily becomes player-controlled.

```javascript
function updateOverrideZone(zone, dt) {
    // Replace AI inputs with player inputs
    const ufoState = zone.crewUfo;

    // Use Phase 1 UFO movement logic but with zone-local state
    const effectiveSpeed = CONFIG.UFO_SPEED;
    if (keys['ArrowLeft']) ufoState.vx -= 2000 * dt;
    if (keys['ArrowRight']) ufoState.vx += 2000 * dt;
    ufoState.vx *= Math.exp(-8 * dt);
    ufoState.x += ufoState.vx * dt;

    // Clamp to zone bounds
    ufoState.x = Math.max(ufoState.width/2, Math.min(zone.width - ufoState.width/2, ufoState.x));

    // Beam activation
    if (keys['Space']) {
        ufoState.beamActive = true;
        // ... beam logic adapted from UFO.update()
    }
}
```

3. **Timer**: 15-second countdown displayed prominently. At 3 seconds, red flash warning. At 0, automatic zoom-out and Director disapproval.

4. **Re-entry**: When override ends, CrewAI resumes control. Zone state continues seamlessly — it never stopped simulating, just the input source changed.

### 3.3 Shared Resources

| Resource | Phase 1 Location | Phase 2 Access | Notes |
|----------|------------------|----------------|-------|
| Canvas/ctx | Global: `canvas`, `ctx` (line 3004-3005) | Direct access | Same canvas for everything |
| AudioContext | Global: `audioCtx` (line 451) | Direct access | Single Web Audio context |
| SFX object | Global: `SFX` (line 622) | Add new methods | `SFX.directorSpeech = () => {...}` |
| CONFIG | Global: `CONFIG` (line 6) | Read-only access | Phase 2 reads Phase 1 config for zone sim |
| renderNGE* | Global functions (line 13185+) | Direct call | All rendering utilities available |
| Particle system | Global: `particles[]` | Fork or tag | See performance section |
| Images | No image assets in current codebase | N/A | Everything is canvas-drawn |

### 3.4 Score/Progress Continuity

- **Score**: The `score` variable (line 3038) continues accumulating. Phase 2 adds zone-based scoring.
- **Bio-matter**: `bioMatter` (line 3206) carries over. Phase 2 zones generate bio-matter into the shared pool.
- **UFO Bucks**: `ufoBucks` (line 3041) can be spent on Phase 2 shop items or carried forward.
- **Tech tree**: All 15 researched techs (`techTree.researched`, line 3213) affect zone simulations — crew UFOs benefit from Thruster Boost, Energy Efficiency, etc.
- **Wave history**: `waveHistory` (line 3160) preserves Phase 1 analytics. Phase 2 appends command wave data.
- **Harvest count**: `harvestCount` (line 3132) keeps accumulating from zone abductions. This becomes the "total abductions" counter the Fun Engineer recommends.

---

## Part 4: Code Architecture Recommendations

### 4.1 Class Hierarchy

```
Phase 2 Class Hierarchy
├── ZoneState                    // Per-zone game state container
│   ├── targets[]                // Simplified Target instances
│   ├── tanks[]                  // Simplified Tank instances
│   ├── crewUfo                  // AI-driven UFO state object
│   └── particles[]              // Zone-local particles
├── CrewMember                   // Individual crew data
│   ├── traits{}                 // Personality trait values
│   └── sparkline[]              // Performance ring buffer
├── CrewRoster                   // Roster management
│   └── members[]                // Array of CrewMember
├── CrewAI                       // Decision engine per crew member
├── ResourcePipeline             // Cross-zone resource management
│   ├── pools{}                  // Per-zone resource pools
│   └── transfers[]              // Active transfers in flight
├── DirectorState                // THE DIRECTOR's mood/behavior
├── CommandTechTree              // Engineering/People/Politics tracks
└── OverrideState                // Emergency override tracking
```

Note: NOT extending existing Phase 1 classes. Phase 1's `UFO` class (line 5716) is tightly coupled to global state (`keys[]`, `targets`, `activeCoordinators`, etc.). Phase 2's zone UFO is a simpler state object driven by `CrewAI`, not a class instance.

### 4.2 Event System

Phase 2 needs cross-module communication without tight coupling. A simple event bus:

```javascript
// In command-state.js
const CommandEvents = {
    _listeners: {},

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    },

    emit(event, data) {
        if (this._listeners[event]) {
            for (const cb of this._listeners[event]) cb(data);
        }
    },

    off(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
        }
    }
};
```

Events:
- `'zone:crisis'` — zone enters crisis state. Listeners: alert queue, Director system, SFX
- `'zone:quotaMet'` — zone meets quota. Listeners: Director system, scoring
- `'crew:breakdown'` — crew member breaks down. Listeners: zone renderer, alert queue
- `'director:transmission'` — Director speaks. Listeners: HUD renderer, SFX
- `'director:inspection'` — inspection starts. Listeners: all zones, scoring
- `'override:start'` / `'override:end'` — emergency override. Listeners: input system, Director
- `'resource:transfer'` — resource routing initiated. Listeners: particle renderer
- `'wave:end'` — command wave ends. Listeners: summary system, Director

### 4.3 Rendering Pipeline for Multi-Zone Display

```
Command Phase Render Order (back to front):
─────────────────────────────────────────
1. ctx.clearRect(0, 0, canvas.width, canvas.height)
2. Optional: Background data stream (ASCII overlay, 3% opacity)
3. FOR each zone:
   a. ctx.save()
   b. ctx.beginPath(); ctx.rect(zoneRect); ctx.clip()
   c. Render mini-starfield (reuse renderBackground pattern, scaled)
   d. Render mini-ground
   e. Render zone targets (scaled)
   f. Render zone tanks (scaled)
   g. Render zone UFO (crew) + beam
   h. Render zone particles
   i. ctx.restore()
   j. Render zone status bar (below zone, outside clip)
   k. Render zone border + pulse
   l. Render crew glyph (corner)
   m. Render zone decay overlay (if applicable)
   n. Render crisis overlay (if applicable)
4. Render resource flow particles (between zones — OUTSIDE zone clips)
5. Render command bar (top)
6. Render sidebar panels (crew roster, resources, orders)
7. Render Director channel (when active — includes screen tint)
8. Render overlay panels (tech tree, crew detail, report card)
9. Render alert notifications (top layer)
10. Render global effects (override flash, etc.)
11. Render global scanlines
```

**Key technique**: Each zone is rendered in its own clipped region using `ctx.save()` + `ctx.clip()` + `ctx.restore()`. This prevents zone content from bleeding into adjacent zones.

### 4.4 State Machine for Command Phase

```
STATE DIAGRAM — Command Phase
──────────────────────────────

PLAYING (Phase 1)
    │
    └─── [techTree.researched.size === 15] ──→ PROMOTION_CINEMATIC
                                                    │
                                                    └─→ COMMAND (live wave)
                                                          │
                                                          ├─ [waveTimer <= 0] ──→ COMMAND_SUMMARY
                                                          │                         │
                                                          │                         └─→ COMMAND_MANAGEMENT
                                                          │                               │
                                                          │                               └─→ COMMAND (next wave)
                                                          │
                                                          └─ [override triggered] ──→ COMMAND_OVERRIDE
                                                                                          │
                                                                                          └─ [15s elapsed] ──→ COMMAND
```

States in detail:
- **PROMOTION_CINEMATIC**: Scripted 10-15 second sequence. No player input (except skip). Transitions to COMMAND.
- **COMMAND**: Live wave. All zones simulate. Player monitors, routes resources, issues orders. Wave timer counts down.
- **COMMAND_OVERRIDE**: Camera zoomed into one zone. Phase 1 controls active. 15-second timer. Returns to COMMAND.
- **COMMAND_SUMMARY**: Director report card. Mandatory dialogue choice. Transitions to COMMAND_MANAGEMENT.
- **COMMAND_MANAGEMENT**: Optional decision from queue (coaching, recruiting, etc.). Transitions to COMMAND (next wave, via boot sequence).

### 4.5 Handling 16-Zone Scaling

**The performance challenge**: 16 zones, each with targets, tanks, UFO, projectiles, particles. Naive implementation = 16x the computational and rendering cost.

**Strategy: Tiered Simulation Fidelity**

```
FOCUSED ZONE (player is looking at it):
  - Full simulation: every target, tank, projectile tracked
  - Full rendering: mini-starfield, all entities, beam, particles
  - 60fps update rate

VISIBLE ZONE (on screen but not focused):
  - Simplified simulation: aggregate performance score updated per second
  - Simplified rendering: zone border, status bar, crew glyph, health color
  - 10fps visual update (render every 6 frames), interpolated border color

OFFSCREEN ZONE (compressed in heatmap at 16 zones):
  - Statistical simulation: performance roll per wave based on crew stats + zone difficulty
  - Glyph rendering only: single colored dot + quota percentage
  - 1fps logical update
```

This is the same approach RTS games use: full simulation for visible area, statistical model for fog of war.

**Performance budget** (targeting 60fps on 2020 laptop):

At 2 zones (first slice):
- 2 full zone renders: ~200 draw calls per zone = 400 total
- Command HUD: ~200 draw calls
- Effects/overlays: ~100 draw calls
- Total: ~700 draw calls — **well within budget** (Phase 1 already does ~800+)

At 4 zones:
- 1 focused + 3 simplified: ~200 + 3*50 = 350 zone draw calls
- Command HUD: ~250 draw calls
- Total: ~700 — still fine

At 16 zones:
- 1 focused + 3 visible (in quadrant view) + 12 glyph: ~200 + 150 + 120 = 470 zone draws
- Command HUD + heatmap: ~300 draw calls
- Total: ~800 — manageable

**Offscreen canvas optimization** (if needed):
- Render each zone to an offscreen canvas at the zone's actual pixel size
- Composite offscreen canvases onto the main canvas
- Only re-render a zone's offscreen canvas when its state changes
- At 16 zones with simplified rendering, most zones change state infrequently

---

## Part 5: Risk Assessment

### 5.1 What's Technically Hard

#### Hard: Zone Simulation Isolation
Phase 1's `update(dt)` function (line 26646) reads and writes 30+ global variables: `ufo`, `targets`, `tanks`, `heavyTanks`, `projectiles`, `particles`, `activeDrones`, `activeCoordinators`, `waveTimer`, `combo`, `score`, `bioMatter`, etc. Every subsystem assumes a single shared game world.

**The risk**: Extracting a "simplified Phase 1 simulation" means either:
- (A) Refactoring Phase 1 functions to accept a state object instead of reading globals — massive change to the monolith
- (B) Writing new zone simulation functions from scratch inspired by Phase 1 but operating on ZoneState — significant new code

**Recommendation**: Option (B). Writing new zone simulation functions is safer than refactoring the monolith. The zone sim is intentionally simpler (no powerups, no warp juke, no coordinators within zones, no tutorial). The new code can be ~30% the size of the Phase 1 equivalent.

#### Hard: The Promotion Cinematic
This sequence requires:
1. Fading the Phase 1 HUD (reverse of the boot sequence — 10+ panels need coordinated "power down" animations)
2. Canvas zoom transform (scaling the Phase 1 battlefield from 1.0x to 0.5x)
3. Zone materialization (Bayer dither effect at zone-panel scale)
4. Director portrait rendering (new character, first impression must be perfect)
5. Gold-themed boot sequence for command panels
6. Seamless handoff from `render()` to `renderCommand()`

Each step is achievable, but the SEQUENCE — getting the timing, sound, and visual transitions right so it feels cinematic — requires precise choreography. Expect iteration.

#### Hard: Crew AI That Feels Right
The AI needs to be:
- Visibly different between reckless and cautious (player must be able to SEE the trait in action)
- Competent enough that zones don't immediately fail
- Imperfect enough that the player feels needed
- Consistent enough that performance is predictable over multiple waves

Getting this balance right is more game design than engineering, but the engineering matters: the AI decision-making must be tuned per-frame (not per-second) to look smooth in the mini-battlefields.

### 5.2 What Might Not Work

#### Risk: Zone Mini-Battlefields May Be Too Small to Read
At 2 zones, each zone gets ~half the screen. Mini-targets and tanks at 50% scale should be readable. But at 4 zones (quarter-screen each), entities at 25% original scale might be indistinguishable blobs.

**Mitigation**: Use color-coding and silhouettes rather than detailed sprites at small scales. A green dot moving toward a red dot is enough to convey "UFO approaching target." The zone status bar provides the data; the battlefield provides the feeling.

#### Risk: The `gameState` Switch Gets Unwieldy
Adding 4+ new states to the single `switch` statement in `gameLoop` (line 26591) works but gets messy if Phase 2 states need sub-states (override within command, coaching screen within management, etc.).

**Mitigation**: Use a state stack or sub-state pattern within Phase 2. The top-level `gameState` has one value (`'COMMAND'`), and Phase 2's `command-main.js` manages its own internal state machine.

```javascript
// In command-main.js
let commandSubState = 'LIVE'; // 'LIVE' | 'OVERRIDE' | 'SUMMARY' | 'MANAGEMENT'

function updateCommand(dt) {
    switch (commandSubState) {
        case 'LIVE': updateCommandLive(dt); break;
        case 'OVERRIDE': updateOverride(dt); break;
        // ...
    }
}
```

This keeps the main `gameLoop` clean while giving Phase 2 full control of its internal flow.

#### Risk: Audio System Saturation
Phase 2 adds many concurrent sounds: zone ambience x2-16, Director voice, crisis alarms, resource flow whooshes, crew reactions. Web Audio API handles concurrent nodes well, but too many simultaneous oscillators can cause crackling on lower-end hardware.

**Mitigation**: Sound priority system. Only the focused zone plays full audio. Background zones play only critical sounds (crisis alarm). Director transmissions mute all zone audio. Cap concurrent oscillators at ~15.

### 5.3 Performance Cliffs

#### Cliff: 16 Simultaneous Zone Simulations
Even simplified, 16 zones each with targets, tanks, collision detection, and AI decision-making could exceed the 16ms frame budget.

**Cliff point**: Approximately 8-10 zones with full simulation. Beyond that, use statistical simulation for non-focused zones.

**Mitigation**: Tiered fidelity (section 4.5). Only 1-4 zones run full simulation at any time. Rest use statistical models.

#### Cliff: Canvas Draw Calls at 16 Zones
16 full-detail zone panels would require ~3200 draw calls per frame (200 per zone). Current Phase 1 uses ~800.

**Cliff point**: ~1500 draw calls on integrated GPU. Beyond that, frame drops.

**Mitigation**: Offscreen canvases for zones. Simplified rendering for non-focused zones. Glyph-only rendering for heatmap cells.

#### Cliff: Garbage Collection from Zone State Updates
Creating new particle objects, target objects, and array allocations 16x per zone per frame could trigger GC pauses.

**Mitigation**: Object pooling for frequently created/destroyed entities (particles, projectiles). Pre-allocate zone state arrays.

### 5.4 Implementation Sequencing

The correct build order for the first slice:

```
PHASE 0: Foundation (can be done in parallel)
├── command-state.js      — State variables, event bus
├── zone-state.js         — ZoneState class
└── Hooks in game.js      — 3 small changes to gameLoop + promotion trigger

PHASE 1: Core Loop (sequential, each depends on previous)
├── zone-simulation.js    — Simplified Phase 1 sim per zone
├── crew-ai.js            — Basic reckless/cautious AI
├── zone-renderer.js      — Mini-battlefield rendering
└── command-main.js       — Master update/render, verify zones run

PHASE 2: HUD + Director (parallelizable)
├── command-hud.js        — Command bar, layout engine
├── director-renderer.js  — Director portrait
├── director-system.js    — Basic quota + report cards (scripted, not dynamic)
├── crew-renderer.js      — Crew glyph + sidebar portrait
└── crew-system.js        — 1 crew member, hire/assign

PHASE 3: Interactions (parallelizable)
├── resource-pipeline.js  — Energy/bio-matter transfers
├── emergency-override.js — Manual zone takeover
├── command-summary.js    — Report card screen
└── command-boot.js       — Gold boot sequence

PHASE 4: The Cinematic (depends on PHASE 2)
└── promotion-cinematic.js — Full 10-15 second sequence

PHASE 5: Polish (depends on all above)
├── command-tech-tree.js   — DEFERRED to slice 2
└── command-management.js  — DEFERRED to slice 2
```

**Critical path**: Foundation → Zone Simulation → Zone Renderer → Command Main. This gets a playable command phase running (zones simulating, visible on screen) before any HUD, Director, or cinematic work begins.

**Parallel tracks once core loop works**:
- Track A: HUD panels + layout
- Track B: Director system + portrait
- Track C: Emergency override
- Track D: Promotion cinematic

---

## Part 6: First Slice Scope — What Exactly To Build

Per the approved design doc's "First Slice Scope" section, the first slice tests: **"Is delegation fun in two zones?"**

### Minimal Implementation for First Slice

1. **Promotion trigger** — `techTree.researched.size === 15` check at wave end. Minimal cinematic: Director voice (deep sawtooth) + camera zoom + "COMMAND MODE ACTIVATED" flash. Skip the full 10-15 second sequence — that's polish.

2. **2-zone layout** — `getCommandHUDLayout(2)` returns split-screen positions. Each zone panel rendered with `renderZonePanel()`.

3. **Zone simulation** — Simplified Phase 1: target spawning, tank spawning, collision, quota tracking. NO powerups, NO coordinators, NO heavy tanks, NO warp juke, NO bombs within zones.

4. **1 crew member** — Single Reckless↔Cautious trait axis. `CrewAI` with just two behavior profiles. Recruit → assign flow (no interview depth).

5. **Quota management** — Per-zone quotas using Phase 1's `getQuotaTarget()` logic. Target band system (rolling 3-wave average). Director report cards with 2-3 scripted dialogue options per performance tier.

6. **Director** — Portrait (new render function, gray-blue skin, red border). Scripted transmissions at wave start/end. No mood system — preset reactions based on quota hit/miss.

7. **Emergency override** — 1 manual takeover per wave. Camera zoom into zone. Phase 1 controls active for 15 seconds. Director disapproval message.

8. **Command status bar** — Wave number, quota progress, score, timer. Using `renderNGEPanel` + `renderNGEBar`.

### What's NOT in First Slice
- Training wave (structured 3-task onboarding)
- Interview system and coaching depth
- Director mood system and dynamic reactions
- Additional personality traits beyond Reckless ↔ Cautious
- Policy presets and decision queue
- 4-zone and 16-zone expansions
- Full specialization tracks (Engineering/People/Politics)
- Director's Kid narrative arc
- Shift scheduling complexity
- Full crisis system, equipment wear, scheduled inspections
- Cascading quotas and quota negotiation

### Estimated File Count and Lines

| File | Estimated Lines | Complexity |
|------|-----------------|------------|
| command-state.js | 80 | Low |
| zone-state.js | 120 | Low |
| zone-simulation.js | 450 | High |
| crew-ai.js | 200 | Medium |
| crew-system.js | 150 | Low |
| director-system.js | 200 | Medium |
| resource-pipeline.js | 100 | Low |
| command-hud.js | 400 | Medium |
| zone-renderer.js | 350 | Medium |
| director-renderer.js | 200 | Medium |
| crew-renderer.js | 150 | Medium |
| promotion-cinematic.js | 200 | Medium |
| command-summary.js | 250 | Medium |
| emergency-override.js | 150 | Medium |
| command-boot.js | 150 | Low |
| command-main.js | 200 | Medium |
| **TOTAL** | **~3,350** | |

Plus ~30 lines of changes to `game.js` (3 hooks) and ~5 lines to `index.html` (script tags).

This is approximately 12% the size of the existing `game.js` monolith, split across 16 files for parallel development.

---

## Part 7: Key Code Patterns to Follow

### Pattern 1: NGE Panel Consistency
Every Phase 2 panel MUST use `renderNGEPanel()`. New color/corner combinations for Phase 2:

```javascript
// Zone panels
renderNGEPanel(zx, zy, zw, zh, { color: zoneBorderColor, cutCorners: ['tl', 'br'], label: zoneName });

// Command panels
renderNGEPanel(x, y, w, h, { color: '#d4a017', cutCorners: ['tl'], label: 'CMD.STATUS' });

// Director panels
renderNGEPanel(x, y, w, h, { color: '#a00', cutCorners: ['br'], label: 'DIR.CHANNEL' });

// Crew panels
renderNGEPanel(x, y, w, h, { color: '#0f0', cutCorners: ['tr'], label: 'CREW.ROSTER' });

// Resource panels
renderNGEPanel(x, y, w, h, { color: '#f80', cutCorners: ['bl'], label: 'RES.FLOW' });
```

### Pattern 2: Boot Sequence Replication
Follow the `hudBootState.panels` pattern (line 13930) for command panel boots:

```javascript
commandBootState.panels = {
    cmdStatus:   { active: true, startTime: 0.0,  duration: 1.0, progress: 0, phase: 'waiting' },
    crewRoster:  { active: true, startTime: 0.2,  duration: 1.2, progress: 0, phase: 'waiting' },
    resources:   { active: true, startTime: 0.4,  duration: 1.0, progress: 0, phase: 'waiting' },
    dirChannel:  { active: true, startTime: 0.6,  duration: 1.0, progress: 0, phase: 'waiting' },
    orders:      { active: true, startTime: 0.8,  duration: 0.8, progress: 0, phase: 'waiting' },
};
```

### Pattern 3: Director Voice Synthesis
Base on `SFX.startBeamLoop()` (line 642) but with Director parameters:

```javascript
SFX.directorSpeech = () => {
    if (!audioCtx || SFX.directorLoop) return;
    SFX.directorLoop = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    SFX.directorGain = audioCtx.createGain();
    const lfoGain = audioCtx.createGain();

    lfo.frequency.setValueAtTime(4, audioCtx.currentTime);   // 4Hz LFO (slower = more menacing)
    lfoGain.gain.setValueAtTime(30, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(SFX.directorLoop.frequency);

    SFX.directorLoop.type = 'sawtooth';
    SFX.directorLoop.frequency.setValueAtTime(90, audioCtx.currentTime); // 90Hz (deeper)
    SFX.directorLoop.connect(SFX.directorGain);
    SFX.directorGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    SFX.directorGain.connect(audioCtx.destination);

    SFX.directorLoop.start();
    lfo.start();
};
```

### Pattern 4: Typewriter Dialogue
The commander typewriter (in `renderCommanderZone`, line 16346) uses:
```javascript
commanderState.typewriterTimer += dt;
if (commanderState.typewriterTimer >= 1/25) { // 25 chars/sec
    commanderState.typewriterTimer = 0;
    commanderState.typewriterIndex++;
}
const visibleText = dialogue.substring(0, commanderState.typewriterIndex);
```

Director typewriter is the same but at 15 chars/sec (slower, more deliberate).

### Pattern 5: Ring Buffer for Sparklines
The `diagEnhancedState` (line 13837) uses a ring buffer for energy rate history:
```javascript
energyRateBuffer: new Float32Array(20),
energyRateWriteIdx: 0,
```
Same pattern for crew performance sparklines:
```javascript
crewMember.sparkline = new Float32Array(20);
crewMember.sparklineIdx = 0;
// Each wave end: record performance score
crewMember.sparkline[crewMember.sparklineIdx] = performanceScore;
crewMember.sparklineIdx = (crewMember.sparklineIdx + 1) % 20;
```

---

## Appendix: Critical Line Number Reference

| System | Location | Notes |
|--------|----------|-------|
| CONFIG | lines 6-412 | All game constants. Phase 2 reads but doesn't modify. |
| SFX object | lines 622-1400+ | Add new methods for Phase 2 sounds. |
| Canvas + ctx | lines 3004-3005 | Shared rendering context. |
| Game state declaration | line 3020 | `gameState = 'TITLE'` — add new states here conceptually. |
| keys[] input | lines 3403+ | Global keyboard state. Phase 2 reads during override. |
| Tech tree state | lines 3213-3236 | `techTree.researched` — check `.size === 15` for promotion. |
| UFO class | lines 5716-6188 | Reference for zone UFO AI behavior. Do NOT extend. |
| Tank class | lines 6680-7187 | Reference for zone tank spawning/behavior. |
| HeavyTank class | lines 8756-9348 | Excluded from first slice zones. |
| Tech tree management | lines 11312-11485 | Template for command tech tree. |
| renderNGEPanel | line 13185 | Foundation of all HUD rendering. |
| renderNGEBar | line 13372 | Progress bars. |
| HUD state objects | lines 13754-13980 | Templates for command HUD state. |
| preBootState | line 13812 | Boot sequence state machine. |
| BAYER4x4 | line 13829 | Dither matrix for materialization effects. |
| hudBootState | line 13930 | Panel boot overlay system. Template for command boots. |
| getHUDLayout | line 14148 | Layout engine. Template for command layout. |
| renderHUDFrame | line 14355 | Master HUD render. Phase 2 has equivalent `renderCommandHUD`. |
| renderTechTree | line 16754 | Template for command tech tree renderer. |
| initHUDBoot | line 17473 | Boot initialization. Template for command boot. |
| renderBackground | line 18965 | Starfield. Reuse for zone backgrounds (scaled). |
| CountUpAnimation | line 22100 | Number animation class. Reuse everywhere. |
| getQuotaTarget | line 22148 | Quota calculation. Used directly by zone simulation. |
| renderCommanderPortrait | line 22595 | Template for Director and crew portraits. |
| renderWaveSummary | line 22862 | Template for command summary screen. |
| initBiosBootSequence | line 23414 | BIOS POST. Template for command boot terminal. |
| startGame | line 12947 | Game reset. Phase 2 needs equivalent `initCommandPhase`. |
| gameLoop | line 26591 | Main loop. ADD cases for Phase 2 states. |
| update | line 26646 | Phase 1 update. Template for zone simulation. |
| render | line 26886 | Phase 1 render. Template for zone rendering. |
| Wave end logic | lines 26767-26883 | HOOK: promotion trigger insertion point. |

---

*This analysis was produced by reading every line of the 26,995-line monolith. The codebase is well-structured despite being a single file — clear section headers, consistent patterns, and predictable conventions. Phase 2 can be built on top of it with minimal surgery to the original code. The key insight: Phase 1's global-state architecture is a constraint, not a blocker. By building Phase 2 in its own folder with its own state, we avoid the refactoring trap while reusing all the rendering infrastructure that makes this game visually distinctive.*
