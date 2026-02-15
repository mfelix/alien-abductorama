# Phase 2 Module Specifications
## Detailed Spec for Every File in js/phase2/

**Date**: 2026-02-13
**Status**: FINAL

---

## File 1: `js/phase2/command-config.js`

**Purpose**: All shared constants, color palette, timing values, and configuration for the command phase.

**Dependencies**: None (loaded first).

**Public Interface**:
```javascript
const COMMAND_CONFIG = {
    ZONE: { ... },      // Zone simulation constants
    CREW: { ... },      // Crew trait definitions, morale thresholds
    QUOTA: { ... },     // Quota base, scaling, rolling window
    DIRECTOR: { ... },  // Approval start, penalty values
    OVERRIDE: { ... },  // Duration, CP cost
    RESOURCE: { ... },  // Transit loss, transit delay
    CINEMATIC: { ... }, // Phase durations
    COLORS: { ... },    // All Phase 2 colors (Director red, command gold, zone states, crew morale)
    NAMES: [ ... ]      // Alien crew name pool
};
```

**Internal Architecture**: A single frozen config object. No state, no logic. Pure data.

**Line Count Estimate**: ~120 lines.

**Agent**: Agent 4 (Integration) -- owns this because all agents depend on it.

**Key Decisions**:
- All numeric values go here, not hardcoded in individual modules.
- Colors use hex strings; conversion happens at render time via existing `hexToRgb()`.
- First slice trait system: single axis `{ reckless: 0-1 }` where cautious = `1 - reckless`.

---

## File 2: `js/phase2/zone-state.js`

**Purpose**: The `ZoneState` class -- a per-zone game state container holding all entities, scores, and status.

**Dependencies**: `command-config.js` for constants.

**Public Interface**:
```javascript
class ZoneState {
    constructor(zoneId, difficulty)

    // Properties (all public, read by renderer and HUD)
    id              // 'zone-a' | 'zone-b'
    name            // 'SECTOR A-7'
    targets[]       // Array of simplified target objects
    tanks[]         // Array of simplified tank objects
    projectiles[]   // Active projectiles
    particles[]     // Zone-local particles (capped at ZONE.PARTICLE_BUDGET)
    crewUfo         // { x, y, vx, vy, energy, maxEnergy, health, beamActive, beamTarget, hoverOffset, width, height }
    crewMember      // Reference to assigned CrewMember (null if unassigned)
    crewAI          // Reference to CrewAI instance
    quota           // { target: N, current: 0 }
    driftTimer      // Seconds until degradation starts
    driftLevel      // 0-4 integer, current decay level
    healthScore     // 0.0-1.0 composite health
    state           // 'stable' | 'stressed' | 'crisis' | 'emergency'
    fleetOrder      // 'defensive' | 'balanced' | 'harvest'
    isOverrideActive // Boolean
    starSeed        // Number for deterministic starfield
    waveReport      // { abductions, quotaMet, quotaPercent, damagesTaken, ... } set at wave end

    // Methods
    reset()         // Reset per-wave transient state (targets, tanks, projectiles, particles, quota.current)
    getStatus()     // Returns { quotaProgress, energy, health, threatLevel, driftTimer, state }
    setFleetOrder(order)
    assignCrew(crewMember)  // Set crewMember and create CrewAI
    unassignCrew()
    generateWaveReport()    // Produce waveReport object from current state
}
```

**Internal Architecture**: Pure data container. No update logic (that's in `zone-simulation.js`). No rendering (that's in `zone-renderer.js`). Simplified entity sub-structures:

```javascript
// Zone target (simplified from Phase 1 Target class)
{ x, y, type, weight, alive, beingAbducted, abductionProgress, wanderVx, wanderTimer, falling, vy }

// Zone tank (simplified from Phase 1 Tank class)
{ x, y, direction, speed, fireTimer, alive, turretAngle, projectileType }

// Zone projectile
{ x, y, vx, vy, type, alive, damage }
```

**Line Count Estimate**: ~130 lines.

**Agent**: Agent 1 (Zone Simulation).

---

## File 3: `js/phase2/zone-simulation.js`

**Purpose**: The simplified Phase 1 update loop that runs per zone each frame.

**Dependencies**: `zone-state.js`, `crew-ai.js`, `command-config.js`, `CONFIG` from game.js (read-only, for spawn rates and entity behavior values).

**Public Interface**:
```javascript
function zoneUpdate(zone, dt, playerFocused)  // Main per-zone update tick
function zoneSpawnTargets(zone, dt)           // Target spawning (simplified)
function zoneSpawnTanks(zone)                 // Tank spawning at wave start
function zoneUpdateProjectiles(zone, dt)      // Projectile movement + bounds check
function zoneUpdateAIUfo(zone, dt)            // Drive UFO from CrewAI inputs
function zoneCheckCollisions(zone)            // Beam-target, projectile-UFO, projectile-tank
function zoneUpdateQuota(zone)                // Track abduction count vs target
function zoneUpdateDrift(zone, dt, focused)   // Drift timer countdown + degradation
function zoneUpdateParticles(zone, dt)        // Zone-local particle update
```

**Internal Architecture**:

The core `zoneUpdate()` function calls the sub-functions in order each frame:
1. Spawn targets if under max count
2. Update target wandering/fleeing
3. Get AI inputs from `zone.crewAI.getInputs(zone)`
4. Apply inputs to `zone.crewUfo` (movement, beaming, dodge)
5. Update beam logic (target acquisition, abduction progress, energy drain)
6. Update tank movement and firing
7. Update projectiles
8. Check all collisions
9. Update quota tracking
10. Update drift timer
11. Update zone health score and state
12. Update particles

**Key Logic -- Beam System (simplified)**:
- UFO beams by pressing virtual 'Space'
- Beam searches for nearest target within cone below UFO
- Abduction progress increments based on target weight
- On completion: target removed, quota.current++, energy cost applied
- Energy drains at `CONFIG.ENERGY_DRAIN_RATE` while beaming, recharges at `CONFIG.ENERGY_RECHARGE_RATE` when not

**Key Logic -- Tank AI (simplified)**:
- Tanks spawn at ground level, move horizontally, reverse at zone edges
- Fire timer counts down, spawns projectile aimed at UFO
- No heavy tanks in first slice
- No missiles in first slice (shells only)

**Key Logic -- Drift**:
- `driftTimer` counts down when `playerFocused` is false
- At 0: `driftLevel` increments each second
- Each drift level reduces crew performance by `ZONE.DRIFT_PENALTY`
- When `playerFocused` becomes true: `driftTimer` resets, `driftLevel` starts recovering

**Line Count Estimate**: ~500 lines.

**Agent**: Agent 1 (Zone Simulation).

**Key Decisions**:
- DO NOT import or call Phase 1's `update()` or `render()`. Reimplement simplified versions.
- Zone UFO does NOT use global `keys[]`. Receives virtual inputs from CrewAI.
- No powerups, no warp juke, no coordinators within zones, no bombs, no tutorial hooks.
- Target types: human, cow, sheep, cat, dog (same as Phase 1). Spawn rates use Phase 1 CONFIG values.
- Tank count scales with `zone.difficulty` (for first slice: 1-2 tanks per zone).
- Fleet order modifies AI bias: 'defensive' = cautious+, 'harvest' = reckless+, 'balanced' = trait default.

---

## File 4: `js/phase2/crew-system.js`

**Purpose**: Crew member data model, roster management, trait definitions.

**Dependencies**: `command-config.js` for trait definitions and name pool.

**Public Interface**:
```javascript
class CrewMember {
    constructor(config)  // { name, traits, appearance }

    // Properties
    id                // Unique ID
    name              // Alien name string
    traits            // { reckless: 0-1 } (first slice: single axis)
    morale            // 0.0 - 1.0
    stamina           // 0.0 - 1.0 (depletes over consecutive waves)
    skills            // { piloting: 0-1, harvesting: 0-1 }
    performance       // Float32Array(20) ring buffer of wave performance scores
    performanceIdx    // Ring buffer write index
    assignedZone      // zone ID or null
    hireWave          // Command wave when hired
    appearance        // { skinColor, eyeSize, craniumWidth }

    // Methods
    getPerformanceModifier()      // Composite multiplier from morale/stamina/traits
    recordPerformance(score)      // Push to ring buffer
    getPerformanceTrend()         // Returns 'improving' | 'stable' | 'declining'
    getTraitLabel()               // Returns 'RECKLESS' | 'CAUTIOUS' | 'BALANCED'
}

class CrewRoster {
    constructor()

    // Properties
    members[]    // Array of all CrewMember instances

    // Methods
    addMember(crewMember)
    removeMember(id)
    getAssigned(zoneId)             // Returns CrewMember assigned to zone
    assignToZone(crewId, zoneId)
    unassignFromZone(crewId)
    getUnassigned()                 // Returns bench crew
    swapAssignments(crewId1, crewId2)
    getAll()
    generateCandidate()             // Creates a random recruit
}

// Module-level constants
const CREW_NAMES = [ ... ];         // Pool of alien names
const TRAIT_DEFINITIONS = { ... };  // Trait stat modifiers and descriptions
```

**Internal Architecture**:
- `CrewMember` is a pure data class with utility methods. No rendering.
- `CrewRoster.generateCandidate()` creates a `CrewMember` with random name, random reckless value (0.2-0.8 for first slice), random appearance values, starting morale 0.7, starting stamina 1.0.
- First slice: exactly 2 crew members (one reckless-leaning, one cautious-leaning) generated at command phase init.

**Line Count Estimate**: ~200 lines.

**Agent**: Agent 2 (Crew & Director).

---

## File 5: `js/phase2/crew-ai.js`

**Purpose**: AI decision engine that generates virtual key inputs for crew-operated UFOs based on traits and zone state.

**Dependencies**: `zone-state.js` for ZoneState type, `crew-system.js` for CrewMember.

**Public Interface**:
```javascript
class CrewAI {
    constructor(crewMember)

    // Properties
    traits              // Reference to crew member traits
    decisionDelay       // Reaction time in seconds (trait-dependent)
    decisionTimer       // Countdown to next decision recalculation
    lastDecision        // Cached key state from last decision
    mistakeChance       // Probability of making a bad decision per cycle

    // Methods
    getInputs(zone)     // Returns { ArrowLeft, ArrowRight, Space } virtual key state
    reset()             // Reset per-wave state
}
```

**Internal Architecture**:

The AI recalculates decisions every `decisionDelay` seconds (200-500ms), not every frame. Between recalculations, it holds the previous key state. This simulates reaction time and makes the AI look human rather than robotic.

```
Decision cycle:
1. Find best target (nearest, weighted by type value)
2. Assess threat (nearest tank, incoming projectiles)
3. Decide movement:
   - Reckless (reckless > 0.6): Move toward target even through danger zones
   - Cautious (reckless < 0.4): Avoid tank fire arcs, approach targets only when safe
   - Balanced: Approach targets, retreat from imminent fire
4. Decide beam:
   - Reckless: Beam if energy > 15% (risky, burns energy)
   - Cautious: Beam only if energy > 50% (conservative)
   - Balanced: Beam if energy > 30%
5. Apply mistake chance (10% per decision cycle):
   - Move wrong direction for 1 cycle
   - Fail to beam a reachable target
   - Hold position when should dodge
```

Fleet order modifiers:
- `'defensive'`: Shift reckless down by 0.2 (more cautious behavior)
- `'harvest'`: Shift reckless up by 0.2 (more aggressive targeting)
- `'balanced'`: Use base trait values

**Line Count Estimate**: ~220 lines.

**Agent**: Agent 2 (Crew & Director).

**Key Decisions**:
- AI must be visibly different between reckless and cautious. The player needs to SEE the trait in action.
- AI must be imperfect. Perfect AI undermines the "watching someone do your job badly" emotional hook.
- AI must be consistent enough for quota outcomes to be somewhat predictable.
- Mistake rate is fixed at 10% for first slice. Can be tuned per trait later.

---

## File 6: `js/phase2/crew-renderer.js`

**Purpose**: Canvas-drawn alien crew member portraits at multiple scales (glyph, portrait, full).

**Dependencies**: `crew-system.js` for CrewMember type, `ctx` and `canvas` from game.js.

**Public Interface**:
```javascript
function renderCrewGlyph(x, y, size, crew)       // 24-32px, silhouette + morale dot
function renderCrewPortrait(x, y, size, crew)     // 48-64px, head + eyes + core indicator
function renderCrewFull(x, y, size, crew)         // 80-120px, full anatomy with animations
function renderCrewEyes(cx, cy, s, crew)          // Eye expression sub-system
function getTraitSkinColor(recklessValue)         // Maps trait to skin color variant
function getMoraleColor(morale)                   // Maps morale 0-1 to color spectrum
```

**Internal Architecture**:

Three rendering modes based on size parameter:

1. **Glyph mode** (size < 40px): Trait-based silhouette shape + colored morale dot. Reckless = diamond, Cautious = circle. No eyes, no detail.

2. **Portrait mode** (40-70px): Alien head with trait-driven geometry, void-black almond eyes with expression modifiers (morale affects eye height, stress affects jitter), morale aura glow, core indicator dot.

3. **Full mode** (70px+): Complete anatomy with idle breathing animation, stress particles, burnout noise overlay.

Head shapes vary by trait:
- Reckless: Angular, diamond-like cranium (sharp geometry = aggressive personality)
- Cautious: Wide, rounded cranium (shell-like = protective personality)
- Balanced: Classic alien oval (commander-like proportions)

Skin colors: Range from pale green (#0a5) to teal (#085), selected by `getTraitSkinColor()`.

Eye expressions driven by `crew.morale`:
- High morale (>0.8): Eyes widen slightly, upward tilt
- Low morale (<0.3): Eyes narrow, droop downward
- High stress (>0.8): Micro-jitter on eye width

**Line Count Estimate**: ~300 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 7: `js/phase2/director-system.js`

**Purpose**: THE DIRECTOR -- mood tracking, approval rating, quota demands, report cards, dialogue trees.

**Dependencies**: `command-config.js` for thresholds and dialogue templates.

**Public Interface**:
```javascript
class Director {
    constructor()

    // Properties
    approval        // 0-100 scale, starts at DIRECTOR.APPROVAL_START (50)
    mood            // Computed: 'furious' | 'displeased' | 'neutral' | 'satisfied'
    quotaHistory[]  // Array of last N wave quota results
    lastReportCard  // Most recent report card object

    // Methods
    getMood()                           // Compute mood from approval
    updateApproval(delta)               // Change approval, clamp 0-100
    generateReportCard(zoneResults[])   // Returns ReportCard object
    getDialogueOptions(reportCard)      // Returns 3 response options
    applyDialogueChoice(index, card)    // Apply consequences of player's choice
    getQuotaTarget(commandWave)         // Target band system: rolling avg + surge/decay
    getDirective()                      // Current directive text string
    getWaveStartDialogue()              // Opening transmission text
    getOverrideDialogue()               // Disapproval text after override
}

const DIRECTOR_DIALOGUES = {
    reportCard: {
        quotaMet: [ ... ],       // 3+ lines per tier
        quotaMissed: [ ... ],
        quotaExceeded: [ ... ]
    },
    waveStart: [ ... ],          // Random wave-start transmissions
    override: [ ... ],           // Disapproval lines
    generic: { ... }             // Idle chatter, warnings
};
```

**Internal Architecture**:

**Mood computation** (first slice -- scripted, not dynamic):
```
approval 0-25:   'furious'
approval 26-45:  'displeased'
approval 46-70:  'neutral'
approval 71-100: 'satisfied'
```

**Report card generation**:
1. Receive `zoneResults[]` from `CommandPhaseState.endWave()`
2. Compute overall quota percentage (average across zones)
3. Select dialogue tier (met/missed/exceeded) based on overall result
4. Generate 3 response options:
   - Option 1 (Spin): Reframe failure. Approval change: -2 to +1 depending on how bad the result was.
   - Option 2 (Accountability): Own the result. Approval change: -1 to +5 (higher reward for honesty on bad results).
   - Option 3 (Deflect): Redirect attention. Approval change: 0 to -3 (risky, Director may not buy it).

**Quota target band system**:
- Base quota: `QUOTA.BASE` (10 abductions per zone)
- Rolling average: mean of last 3 wave performances
- If exceeded last wave: temporary surge (+15%) for 2 waves, with bonus resources
- If missed: no ratchet, but consecutive misses (2+) trigger performance penalty
- Recovery wave: every 5 waves, quota drops 20% ("Board meeting")

**Line Count Estimate**: ~350 lines.

**Agent**: Agent 2 (Crew & Director).

---

## File 8: `js/phase2/director-renderer.js`

**Purpose**: Canvas-drawn Director portrait and transmission visual effects.

**Dependencies**: `director-system.js` for Director state, `renderNGEPanel()` and `ctx` from game.js.

**Public Interface**:
```javascript
function renderDirectorPortrait(x, y, size, mood)    // The Director's face
function renderDirectorTransmission(layout, text, mood)  // Full transmission panel
function renderDirectorScreenEffect(active)          // Red overlay when Director speaks
function renderReportCardPanel(layout, reportCard, selectedOption)  // Full report card UI
```

**Internal Architecture**:

**Director portrait** -- procedural alien, distinct from commander:
- Gray-blue skin (#2a3a4a) instead of green (#0a5)
- Larger eyes with steeper slant (1.2 rad vs commander's 0.8)
- Cranial ridges (3 subtle arced lines across forehead)
- Nostril slits (not dots)
- Thin mouth line (visible only when displeased/furious)
- Military collar below chin (two parallel lines + insignia dot)
- Crimson background (#1a0000) with slow 4px-spaced scanlines
- Horizontal tear interference (8% chance per frame)
- Cold blue-white eye reflections (not green-white)
- Mood-based eye glow: furious=red, displeased=orange, neutral=gray, satisfied=amber

**Screen effect**: When Director transmits, the entire canvas gets `rgba(170, 0, 0, 0.04)` overlay. Scanlines slow. An 800ms heartbeat pulse in the red tint.

**Report card panel**: Full-screen overlay using `renderNGEPanel` with `#a00` accent. Zone-by-zone performance bars. Director portrait + typewriter dialogue. Three keyboard-selectable response options.

**Line Count Estimate**: ~350 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 9: `js/phase2/resource-pipeline.js`

**Purpose**: Cross-zone resource sharing, transfers with pipeline delay and transit loss.

**Dependencies**: `zone-state.js`, `command-config.js`.

**Public Interface**:
```javascript
class ResourcePipeline {
    constructor()

    // Properties
    transfers[]     // Active in-flight transfers

    // Methods
    routeResources(fromZone, toZone, type, amount)  // Initiate transfer
    update(dt)                                       // Advance all transfers
    getActiveTransfers()                             // For rendering flow particles
    cancelTransfer(index)                            // Cancel in-flight transfer
}
```

**Internal Architecture**:

Transfer flow:
1. Player initiates: `routeResources('zone-a', 'zone-b', 'energy', 30)`
2. Immediately deduct `amount` from source zone's energy
3. Create transfer record: `{ from, to, type, amount: amount * (1 - transitLoss), delay, elapsed: 0 }`
4. Each frame: `elapsed += dt`. When `elapsed >= delay`: add `amount` to destination zone.
5. Remove completed transfers.

First slice: only energy transfers. Bio-matter and drones deferred.

`transitLoss` defaults to 10% (configurable via `RESOURCE.TRANSIT_LOSS`).
`delay` defaults to 3 seconds (configurable via `RESOURCE.TRANSIT_DELAY`).

**Line Count Estimate**: ~100 lines.

**Agent**: Agent 4 (Integration).

---

## File 10: `js/phase2/command-hud.js`

**Purpose**: Command HUD layout engine and all command panel rendering.

**Dependencies**: `renderNGEPanel()`, `renderNGEBar()`, `renderNGEStatusDot()`, `renderNGEKeyBadge()`, `renderEnergyFlowLine()`, `canvas`, `ctx` from game.js. `zone-renderer.js`, `crew-renderer.js`, `director-renderer.js`.

**Public Interface**:
```javascript
function getCommandHUDLayout(zoneCount)              // Returns layout rectangles object
function renderCommandHUD(commandState)               // Master HUD render
function renderCommandStatusBar(rect, commandState)   // Top bar: wave, quota, score, timer
function renderCrewRosterPanel(rect, roster)           // Sidebar crew list
function renderResourcePanel(rect, pipeline, zones)    // Sidebar resource bars
function renderOrdersPanel(rect, commandState)         // Fleet order buttons + override
function renderDirectorChannelPanel(rect, dirState)    // Director communication panel
function renderAlertQueue(rect, alerts)                // Crisis alert list (future)
```

**Internal Architecture**:

**Layout engine** -- `getCommandHUDLayout(2)` returns:
```javascript
{
    cmdStatus:  { x, y, w, h },          // Top bar (full width, 32px tall)
    zones: [
        { x, y, w, h },                  // Zone A (left half)
        { x, y, w, h }                   // Zone B (right half)
    ],
    crewRoster: { x, y, w, h },          // Below zones, left third
    resources:  { x, y, w, h },          // Below zones, middle third
    orders:     { x, y, w, h },          // Below zones, right third
    dirChannel: { x, y, w, h }           // Bottom bar (full width, 64px tall)
}
```

All positions computed from `canvas.width` and `canvas.height` with 8px margins. Layout is responsive.

**Panel rendering** -- each panel uses `renderNGEPanel()` with:
- CMD.STATUS: color `#d4a017` (command gold), cutCorners `['tl']`
- CREW.ROSTER: color `#0f0`, cutCorners `['tr']`
- RES.FLOW: color `#f80`, cutCorners `['bl']`
- ORDERS: color `#0ff`, cutCorners `['tl']`
- DIR.CHANNEL: color `#a00`, cutCorners `['br']`

**Command status bar** content:
- Wave number (command wave counter)
- Overall quota progress bar (aggregate across zones)
- Total abductions counter (cumulative from Phase 1)
- Score display
- Wave timer countdown
- Command points display

**Line Count Estimate**: ~500 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 11: `js/phase2/zone-renderer.js`

**Purpose**: Rendering mini-battlefields inside zone panels.

**Dependencies**: `zone-state.js`, `crew-renderer.js`, `renderNGEPanel()`, `renderNGEBar()`, `ctx` from game.js.

**Public Interface**:
```javascript
function renderZonePanel(zx, zy, zw, zh, zone)       // Complete zone panel
function renderMiniStarfield(zx, zy, zw, zh, seed)    // Per-zone starfield
function renderMiniGround(x, y, w)                     // Simplified ground plane
function renderMiniUFO(zx, zy, zw, zh, ufoData)       // Crew's UFO (tiny)
function renderMiniTanks(zx, zy, zw, zh, tanks)        // Simplified tank sprites
function renderMiniTargets(zx, zy, zw, zh, targets)    // Simplified target sprites
function renderMiniBeam(zx, zy, zw, zh, ufoData)       // Tractor beam (thin cyan line)
function renderZoneStatusBar(x, y, w, zone)            // Status strip below zone
function renderZoneBorderPulse(zx, zy, zw, zh, state)  // Animated border for stressed+ states
function applyZoneDecayFilter(zone, decayLevel)         // Desaturation + static for decayed zones
```

**Internal Architecture**:

`renderZonePanel()` orchestrates:
1. Draw NGE panel container with zone-state border color
2. `ctx.save()` + clip to zone interior
3. Render starfield (pre-generated positions from seed, simple `fillRect` stars at dimmed alpha)
4. Render ground (gradient rectangle at bottom)
5. Render targets (colored circles/shapes at 50% Phase 1 scale)
6. Render tanks (simplified rectangles + turret lines)
7. Render crew UFO (oval body + dome, smaller than Phase 1 UFO)
8. Render beam (if active: thin cyan line from UFO to target)
9. Render zone particles
10. `ctx.restore()` (exits clip)
11. Render status bar below zone panel
12. Render crew glyph in top-right corner (via `renderCrewGlyph()`)
13. Render border pulse for non-stable states

**Zone status bar** contents (using `renderNGEBar`):
- THREAT level (bar, color-coded)
- DRONES: count (text)
- ENERGY: bar (percentage)
- QUOTA: progress fraction (e.g., "7/10")

**Mini-entity rendering**: Use simple geometric shapes, NOT the full Phase 1 render functions. Targets = colored circles (human=#0f0, cow=#fa0, etc.). Tanks = dark green rectangles with line turrets. UFO = elongated ellipse with dome arc.

**Line Count Estimate**: ~400 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 12: `js/phase2/command-summary.js`

**Purpose**: Between-wave report card screen and optional decision interface.

**Dependencies**: `director-system.js`, `director-renderer.js`, `command-hud.js`, `crew-renderer.js`, game.js globals for keyboard input.

**Public Interface**:
```javascript
function startCommandSummary(waveData)      // Initialize summary state
function updateCommandSummary(dt)           // Advance animations, handle input
function renderCommandSummary()             // Draw the summary screen
```

**Internal Architecture**:

The command summary has two phases:

**Phase 1: Report Card (mandatory)**
1. Staggered reveal of zone results (500ms per zone, using `renderNGEBar` for quota bars)
2. Director portrait appears with typewriter dialogue (at 15 chars/sec)
3. Three dialogue response options appear (keyboard 1/2/3 to select)
4. Player selects response -> consequences applied via `Director.applyDialogueChoice()`
5. Director reacts (portrait emotion shifts, brief follow-up line)

**Phase 2: Crew Management (optional, first slice)**
1. Show crew roster with current assignments
2. Allow swap: press 'S' to swap crew between zones
3. Press Enter or Space to start next wave

Transition to next wave triggers `command-boot.js` sequence, then `COMMAND` state resumes.

**Line Count Estimate**: ~300 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 13: `js/phase2/command-boot.js`

**Purpose**: Gold-themed boot sequence for command panels between waves.

**Dependencies**: `preBootState` and `hudBootState` patterns from game.js, `renderPanelBootOverlay()` from game.js.

**Public Interface**:
```javascript
function initCommandBoot()       // Set up command panel boot states
function updateCommandBoot(dt)   // Advance boot sequence
function renderCommandBoot()     // Draw boot overlays on command panels
function isCommandBootComplete() // Returns true when all panels are online
```

**Internal Architecture**:

Follows the same pattern as Phase 1's `hudBootState.panels`:
```javascript
commandBootState = {
    active: false,
    elapsed: 0,
    panels: {
        cmdStatus:  { startTime: 0.0, duration: 0.8, progress: 0, phase: 'waiting' },
        zoneA:      { startTime: 0.1, duration: 1.0, progress: 0, phase: 'waiting' },
        zoneB:      { startTime: 0.2, duration: 1.0, progress: 0, phase: 'waiting' },
        crewRoster: { startTime: 0.4, duration: 0.8, progress: 0, phase: 'waiting' },
        resources:  { startTime: 0.5, duration: 0.8, progress: 0, phase: 'waiting' },
        dirChannel: { startTime: 0.7, duration: 0.8, progress: 0, phase: 'waiting' }
    }
};
```

Boot overlay uses command gold (#d4a017) instead of Phase 1 cyan. Diagnostic text includes:
- "COMMAND SYSTEMS... INITIALIZING"
- "ZONE ARRAY... ONLINE"
- "PERSONNEL DATABASE... LOADED"
- "RESOURCE PIPELINE... CONNECTED"
- "DIRECTOR UPLINK... ESTABLISHED"

**Line Count Estimate**: ~200 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 14: `js/phase2/promotion-cinematic.js`

**Purpose**: The 10-second promotion cinematic that plays when all 15 techs are completed.

**Dependencies**: `director-renderer.js`, `command-boot.js`, `SFX` from game.js, `renderHexDecodeText()` from game.js, `canvas`/`ctx` from game.js.

**Public Interface**:
```javascript
function initPromotionCinematic()       // Set up cinematic state
function updatePromotionCinematic(dt)   // Advance through phases
function renderPromotionCinematic()     // Draw current phase
```

**Internal Architecture**:

Four phases with configurable timing from `COMMAND_CONFIG.CINEMATIC.PHASES`:

**Phase A: The Call (0-3s)**
- Commander portrait glitches + dissolves into static
- Director portrait materializes line-by-line
- Deep crimson border. Label: "INCOMING -- PRIORITY: SUPREME"
- Typewriter text in #f44: "Impressive performance, Operator..."
- SFX: deep bass drone, Director sawtooth voice

**Phase B: The Zoom (3-6s)**
- "YOU ARE HEREBY PROMOTED TO ZONE COMMANDER" in command gold
- Canvas viewport scales from 1.0 to 0.5 using `ctx.scale()`
- Phase 1 battlefield shrinks
- Second zone materializes (Bayer dither noise -> wireframe -> solidify)
- Phase 1 HUD panels "power down" (borders gray, content fades)
- SFX: ascending authority chord

**Phase C: The Flash (6-8s)**
- Bright white flash (200ms)
- Command HUD skeleton appears in gold wireframe
- Gold boot sequence begins (command panels boot individually)
- SFX: impact thunderclap + boot tones in warm amber

**Phase D: The Settling (8-10s)**
- Boot overlays fade. Live content appears in zones.
- Director voice: "Do not disappoint me."
- Flash: "COMMAND MODE ACTIVATED" (command gold, 32px bold, glow)
- SFX: two deep authority BONGs

After Phase D completes: transition to `COMMAND` state, first command wave begins.

**Line Count Estimate**: ~350 lines.

**Agent**: Agent 3 (Rendering & HUD).

---

## File 15: `js/phase2/emergency-override.js`

**Purpose**: Manual zone takeover -- zoom in, activate Phase 1 controls for 15 seconds, zoom out.

**Dependencies**: `zone-state.js`, `keys[]` from game.js, `SFX` from game.js, `director-system.js`.

**Public Interface**:
```javascript
function initOverride(zone, director)   // Start zoom-in, set up state
function updateOverride(dt)             // Countdown timer, Phase 1 input routing
function renderOverrideTransition()     // Zoom animation overlay
function endOverride()                  // Zoom out, Director disapproval, cleanup
function isOverrideActive()             // Boolean
function getOverrideTimer()             // Remaining seconds
```

**Internal Architecture**:

1. **Initiation**: Player presses 'O' key during wave. If `overrideAvailable` is true:
   - Set `overrideActive = true`, `overrideAvailable = false`
   - Store `overrideZone` reference
   - Start zoom transition (0.5s ease-in: command view -> zone fills screen)
   - Flash "EMERGENCY OVERRIDE" in red via `renderHexDecodeText()`
   - Zone's `isOverrideActive = true`

2. **During override**: 15-second countdown
   - Zone's UFO receives inputs from global `keys[]` instead of CrewAI
   - Apply Phase 1 UFO movement logic (simplified: arrows for movement, space for beam)
   - Zone continues simulating normally (targets, tanks, projectiles)
   - Timer displayed prominently at top center
   - At 3 seconds remaining: red flash warning "RETURNING TO COMMAND"

3. **Ending**: Timer hits 0 or player presses 'O' again
   - Zoom transition out (0.5s ease-out: zone -> command view)
   - Zone's `isOverrideActive = false`
   - CrewAI resumes control
   - Director disapproval: `director.updateApproval(-DIRECTOR.OVERRIDE_PENALTY)`
   - Director transmission: override disapproval dialogue line

**Line Count Estimate**: ~200 lines.

**Agent**: Agent 4 (Integration).

---

## File 16: `js/phase2/command-main.js`

**Purpose**: Master orchestrator -- main update/render loops, game state integration, wire all modules.

**Dependencies**: ALL other Phase 2 files. `gameState`, `score`, `bioMatter`, `harvestCount`, `wave`, `techTree`, `keys[]` from game.js.

**Public Interface**:
```javascript
// Called from game.js gameLoop switch
function updateCommand(dt)           // Master update for COMMAND state
function renderCommand()             // Master render for COMMAND state
function updateCommandSummary(dt)    // Delegate to command-summary.js
function renderCommandSummary()      // Delegate to command-summary.js

// Called from game.js promotion trigger
function initPromotionCinematic()    // Set up cinematic + command phase state
function updatePromotionCinematic(dt) // Delegate to promotion-cinematic.js
function renderPromotionCinematic()   // Delegate to promotion-cinematic.js

// State accessors
let commandPhaseActive               // Boolean flag (also declared in game.js scope)
```

**Internal Architecture**:

**Master command state object** (created by `initPromotionCinematic()`):
```javascript
const commandState = {
    commandWave: 0,
    waveTimer: COMMAND_CONFIG.ZONE.WAVE_DURATION,
    zones: [],                    // Array of ZoneState
    roster: new CrewRoster(),
    director: new Director(),
    pipeline: new ResourcePipeline(),
    commandPoints: 0,
    totalAbductions: harvestCount, // Carried from Phase 1
    overrideAvailable: true,
    selectedZone: 0,              // Index of currently focused zone
    subState: 'BOOT',             // 'BOOT' | 'LIVE' | 'OVERRIDE'
    hudLayout: null               // Cached layout from getCommandHUDLayout()
};
```

**updateCommand(dt)** flow:
```
1. If subState === 'BOOT': updateCommandBoot(dt). If complete, subState = 'LIVE'.
2. If subState === 'OVERRIDE': updateOverride(dt). If complete, subState = 'LIVE'.
3. If subState === 'LIVE':
   a. For each zone: zoneUpdate(zone, dt, zone === selectedZone)
   b. pipeline.update(dt)
   c. waveTimer -= dt
   d. Handle input: zone selection (Tab/1/2), fleet orders (D/H/B), override (O), resource routing (R)
   e. Update Director wave-start transmission (if active)
   f. If waveTimer <= 0: endCommandWave()
```

**endCommandWave()**:
```
1. For each zone: zone.generateWaveReport()
2. Update harvestCount (game.js global) with new abductions
3. Update score (game.js global) with zone performance points
4. Update totalAbductions
5. director.generateReportCard(zoneReports)
6. commandWave++
7. overrideAvailable = true
8. gameState = 'COMMAND_SUMMARY'  (game.js global)
9. startCommandSummary(waveData)
```

**startNextWave()** (called from command-summary when player is done):
```
1. For each zone: zone.reset()
2. Update quota targets via director.getQuotaTarget()
3. roster: update morale, stamina for all crew
4. initCommandBoot()
5. subState = 'BOOT'
6. gameState = 'COMMAND'  (game.js global)
```

**renderCommand()** flow:
```
1. Clear canvas
2. Render zones (via zone-renderer)
3. Render resource flow particles
4. Render command HUD (via command-hud)
5. Render Director channel if active
6. Render boot overlays if subState === 'BOOT'
7. Render override transition if subState === 'OVERRIDE'
```

**Line Count Estimate**: ~300 lines.

**Agent**: Agent 4 (Integration).

**Key Decisions**:
- This is the ONLY file that reads/writes game.js globals.
- Internal sub-state machine keeps the game.js `gameLoop` switch clean.
- `commandState` is a plain object, not a class, for simplicity.
- Zone selection (which zone is "focused" for drift timer purposes) done via keyboard (Tab cycles, 1/2 selects directly).
