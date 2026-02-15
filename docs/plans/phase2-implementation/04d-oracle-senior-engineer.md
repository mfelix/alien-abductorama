# ORACLE-4: Senior Engineer Review
## Phase 2 Command Phase — Implementation Blueprint

**Date**: 2026-02-13
**Reviewer**: ORACLE-4 (25 years building game engines, shipping products, and preventing architectural disasters)
**Status**: Engineering Review Complete
**Sources**: Design doc, game design analysis, visual design system, fun engineering report, `js/game.js` (26,995 lines)

---

## I. Reality Check: What We're Actually Building

Let me cut through the four documents and state the first slice plainly:

**We're adding a second game mode to a 27k-line monolith.** The player completes all 15 techs, watches a cinematic, and enters a new mode where they watch 2 AI-controlled zones while managing crew, quotas, and a boss. The core question: "Is delegation fun?"

The existing codebase is ONE file (`js/game.js`) with global state, a switch-based game loop, and tightly coupled rendering. This is the #1 engineering constraint. Everything I recommend below accounts for this reality.

**Good news**: The monolith is well-organized. Clear section headers, consistent function naming, reusable NGE rendering utilities. We're not fighting spaghetti — we're extending a structured-but-large single file.

**Bad news**: Multiple agents editing `js/game.js` simultaneously WILL create merge conflicts. The module strategy must account for this.

---

## II. Implementation Strategy

### The Right Order

```
1. Game state transition (PLAYING -> PROMOTION_CINEMATIC -> COMMAND)
2. Single zone simulation (Phase 1 gameplay running in a box)
3. Two zones side by side (split screen rendering)
4. Crew AI (virtual key presses driving zone UFOs)
5. Command HUD shell (panels around zones)
6. Quota system (per-zone tracking, wave-end tallying)
7. Director system (portrait, dialogue, report cards)
8. Resource routing (between zones)
9. Emergency Override (zoom in/out, temporary Phase 1 control)
10. Between-wave management (report card + optional decision)
```

### Why This Order

Each step produces something TESTABLE:

- After step 1: You can trigger the cinematic. Visual verification.
- After step 2: A miniaturized Phase 1 runs autonomously. You can watch it.
- After step 3: Two boxes side by side, each running Phase 1. Visual verification.
- After step 4: The UFOs in those boxes move intelligently. Crew traits visible in behavior.
- After step 5: HUD frames the zones. Layout verified.
- After step 6: Numbers tick up. Quota bars fill. Wave end shows results.
- After step 7: The Director appears, reacts, speaks. Emotional beat verified.
- After step 8: You can move energy between zones. Consequences visible.
- After step 9: You can jump into a zone and play. Phase 1 controls work.
- After step 10: Full wave loop. Play the game.

### The MVP That Proves the Concept (Steps 1-7)

Steps 1 through 7 answer the core question. If watching crew members operate zones while the Director breathes down your neck feels compelling, the rest is iteration. If it doesn't, steps 8-10 won't save it. Build 1-7, playtest, then decide.

---

## III. Module Design for Agent Teams

### The Critical Constraint

`js/game.js` is 27k lines. Multiple agents editing it = merge hell. The solution: **new files for new systems, minimal touchpoints in game.js.**

### File Architecture

```
js/
├── game.js              (existing — 27k lines, MINIMAL changes)
├── command/
│   ├── zone-sim.js      (Agent 1: Zone simulation engine)
│   ├── crew.js          (Agent 2: Crew AI, traits, management)
│   ├── director.js      (Agent 2: Director system, dialogue, report cards)
│   ├── command-hud.js   (Agent 3: Command HUD rendering)
│   ├── command-state.js (Agent 4: Game state, transitions, glue)
│   └── command-config.js (Shared: CONFIG extensions, data structures)
```

Each file is loaded via `<script>` tags in `index.html` (after `game.js`). They access the global `ctx`, `canvas`, and existing render utilities from `game.js`.

### Agent 1: Zone Simulation Engine (`js/command/zone-sim.js`)

**Owns**: Zone gameplay simulation — running Phase 1 mechanics in miniature.

**Public Interface**:
```javascript
// === EXPORTED ===
class ZoneState {
    constructor(zoneId, config)
    update(dt)                    // Runs one frame of zone simulation
    render(x, y, w, h)           // Renders zone into a viewport rectangle
    getStatus()                   // Returns { quotaProgress, energy, health, threatLevel, driftTimer, crewUfo }
    setFleetOrder(order)          // 'defensive' | 'balanced' | 'harvest'
    transferEnergy(amount)        // Add/remove energy
    activateOverride()            // Switch to player-controlled mode
    deactivateOverride()          // Return to AI control
}

function createZone(zoneId, difficulty, crewMember)  // Factory
```

**Dependencies**:
- Reads from `game.js`: `CONFIG.TARGETS`, `CONFIG.TANK_*`, target/tank spawn logic patterns (reimplemented, not imported — these are value copies, not function references)
- Reads from `command-config.js`: `COMMAND_CONFIG.ZONE_*` constants
- Reads from `crew.js`: `CrewAI.getInputs(zoneState)` to drive the zone UFO

**Data Structures**:
```javascript
// ZoneState internal state (mirrors Phase 1 but simplified)
{
    id: 'zone-a',
    targets: [],           // Simplified Target objects
    tanks: [],             // Simplified Tank objects
    projectiles: [],
    particles: [],         // Capped at 50 per zone
    crewUfo: {             // AI-driven UFO
        x, y, energy, health, beamActive, beamTarget, hoverOffset
    },
    quota: { target: 10, current: 0 },
    energy: 100,
    driftTimer: 30,        // Seconds until degradation
    driftLevel: 0,         // 0-4 decay level
    fleetOrder: 'balanced',
    isOverrideActive: false,
    waveTimer: 60,
    starSeed: Math.random() * 10000,  // Deterministic starfield per zone
    borderColor: '#0f0',
    state: 'stable'        // 'stable' | 'stressed' | 'crisis' | 'emergency'
}
```

**Test Strategy**:
- Create a ZoneState, call `update(1/60)` 3600 times (1 minute), verify quota progress > 0.
- Create two zones, verify they run independently (different RNG, different outcomes).
- Render a zone to a specific rectangle, verify it clips correctly.
- Set fleet order to 'defensive', verify crew UFO behavior changes.

**Key Implementation Notes**:
- DO NOT import or call `update()` or `render()` from `game.js`. Reimplement simplified versions. The Phase 1 `update()` function has 200 lines of global state manipulation — extracting it is harder than rewriting a simplified version.
- Zone targets, tanks, projectiles: create lightweight classes that mirror Phase 1's `Target`, `Tank`, `HeavyTank` but without the tutorial hooks, powerup interactions, coordinator charging, etc. Keep the spawn patterns, movement, and collision detection.
- Zone UFO: does NOT use the global `keys[]` array. Instead, receives virtual inputs from `CrewAI.getInputs()`.
- Zone rendering: use `ctx.save()`, `ctx.translate(x, y)`, `ctx.beginPath()`, `ctx.rect(x, y, w, h)`, `ctx.clip()`, render at 50% scale, `ctx.restore()`. Reuse `renderNGEPanel()` and `renderNGEBar()` from game.js (they're global functions).
- Starfield: generate once per zone (seeded), store positions, render via scaled `fillRect`. Don't call the global `renderStars()` which writes to full canvas.

### Agent 2: Crew and Director Systems (`js/command/crew.js`, `js/command/director.js`)

**Owns**: Crew member data, AI behavior, trait effects, Director portrait/dialogue/report cards.

**Public Interface — crew.js**:
```javascript
// === EXPORTED ===
class CrewMember {
    constructor(config)           // { name, traits, skinColor, eyeSize, ... }
    getPerformanceModifier()      // Returns multiplier based on morale/stamina/traits
    updateMorale(delta)
    updateStamina(delta)
    applyCoachingSession(skill)   // Improves a skill area
    getTraitBadges()              // Returns visual trait data for HUD
}

class CrewAI {
    constructor(crewMember)
    getInputs(zoneState)          // Returns virtual key state { ArrowLeft, ArrowRight, Space, ... }
    reset()                       // Reset per-wave state
}

class CrewRoster {
    constructor()
    addMember(crewMember)
    removeMember(id)
    getAssigned(zoneId)           // Returns crew member assigned to zone
    assignToZone(crewId, zoneId)
    getAll()                      // Returns all crew members
    generateCandidate()           // Creates a random recruit candidate
}

function renderCrewMember(x, y, size, crew)  // Canvas portrait rendering
function renderCrewEyes(cx, cy, s, crew)     // Eye expression system
```

**Public Interface — director.js**:
```javascript
// === EXPORTED ===
class Director {
    constructor()
    getMood()                     // 'furious' | 'displeased' | 'neutral' | 'satisfied'
    updateApproval(delta)
    generateReportCard(zoneResults)  // Returns report card data
    getDialogueOptions(reportCard)  // Returns 3 response options with consequences
    applyDialogueChoice(choiceIndex, reportCard)
    getDirective()                // Current quota/directive text
    update(dt)                    // Update mood, timers, etc.
}

const DIRECTOR_DIALOGUES = { ... }  // All Director dialogue strings

function renderDirectorPortrait(x, y, size, mood)  // Canvas portrait
function renderReportCard(reportCardData, selectedOption)  // Full report card UI
```

**Dependencies**:
- Reads from `command-config.js`: trait definitions, morale thresholds, dialogue templates
- `renderCrewMember` and `renderDirectorPortrait` use global `ctx`, `renderNGEPanel()`, `renderNGEBar()` from game.js

**Data Structures**:
```javascript
// CrewMember state
{
    id: 'crew-001',
    name: 'Krix',
    traits: {
        reckless: 0.7,     // 0-1 scale, primary personality axis
        cautious: 0.3,     // Inverse of reckless for first slice
    },
    morale: 0.8,           // 0-1
    stamina: 1.0,          // 0-1, depletes over consecutive waves
    skills: { piloting: 0.5, harvesting: 0.6, defense: 0.4 },
    performance: [],        // Ring buffer of last 20 wave performances
    assignedZone: null,
    appearance: {
        skinColor: '#0a5',
        eyeSize: 1.0,
        craniumWidth: 1.0
    }
}

// Report card
{
    waveNumber: 7,
    zoneResults: [
        { zoneId: 'zone-a', quotaMet: true, quotaPercent: 0.82, crewName: 'Krix' },
        { zoneId: 'zone-b', quotaMet: false, quotaPercent: 0.34, crewName: 'Nurp' }
    ],
    overallQuota: 0.68,
    directorMood: 'displeased',
    dialogueOptions: [
        { text: "We had equipment failures in Zone B.", type: 'spin', consequence: { approval: -2, crewMorale: 0 } },
        { text: "I take full responsibility.", type: 'accountability', consequence: { approval: +3, crewMorale: +5 } },
        { text: "Zone A exceeded targets.", type: 'deflect', consequence: { approval: 0, crewMorale: -3 } }
    ]
}
```

**Test Strategy**:
- Create a CrewAI with reckless=0.8, feed it a zone state with targets, verify it produces aggressive inputs (moves toward targets, beams even at low energy).
- Create a CrewAI with cautious=0.8, same zone state, verify defensive inputs.
- Create Director, set approval low, verify mood is 'furious'. Set high, verify 'satisfied'.
- Generate a report card with quota missed, verify Director produces harsh dialogue.
- Render crew portrait at 32px, 64px, 120px — verify all three scales look correct.

### Agent 3: Command HUD (`js/command/command-hud.js`)

**Owns**: All Command Phase rendering — layout, panels, zone frames, sidebar, status bar.

**Public Interface**:
```javascript
// === EXPORTED ===
function getCommandHUDLayout(zoneCount)     // Returns layout rectangles for all panels
function renderCommandHUD(commandState)      // Main render entry point
function renderCommandStatusBar(x, y, w, h, commandState)
function renderZonePanel(zx, zy, zw, zh, zoneData)
function renderCommandSidebar(x, y, w, h, commandState)
function renderDirectorChannel(x, y, w, h, directorState)
function renderCommandBootSequence(progress)  // Gold boot sequence
function renderPromotionCinematic(phase, progress)  // The Big Moment

// Between-wave screens
function renderCommandSummary(reportCard)
function renderManagementScreen(commandState)  // Decision budget UI
```

**Dependencies**:
- Reads from `game.js`: `renderNGEPanel()`, `renderNGEBar()`, `renderNGEStatusDot()`, `renderNGEIndicator()`, `renderNGEScanlines()`, `renderHexDecodeText()`, `renderPanelBootOverlay()`, `renderEnergyFlowLine()`, `canvas`, `ctx`
- Reads from `zone-sim.js`: `ZoneState.getStatus()`, `ZoneState.render()`
- Reads from `crew.js`: `renderCrewMember()`, `CrewMember.getTraitBadges()`
- Reads from `director.js`: `renderDirectorPortrait()`, `renderReportCard()`
- Reads from `command-state.js`: the full command state object for data binding

**Test Strategy**:
- Call `getCommandHUDLayout(2)`, verify rectangles don't overlap and fill the screen.
- Call `getCommandHUDLayout(4)`, verify 2x2 grid + sidebar layout.
- Render an empty Command HUD (no zone data) — verify panels appear, labels display.
- Render with mock zone data — verify status bars, border colors, crew indicators.
- Test at different canvas sizes (1920x1080, 1366x768, 1280x720) — verify responsive layout.

### Agent 4: Integration & Game State (`js/command/command-state.js`)

**Owns**: Game state transitions, command phase wave loop, promotion trigger, Emergency Override, glue between all modules.

**Public Interface**:
```javascript
// === EXPORTED ===
class CommandPhaseState {
    constructor()
    init(phaseOneState)           // Initialize from Phase 1 completion state
    update(dt)                    // Main command phase update loop
    render()                      // Main command phase render entry point
    handleInput(key, type)        // Process keyboard input for command mode
    isPromotionReady()            // Check if tech tree complete

    // State accessors
    getZones()
    getCrewRoster()
    getDirector()
    getQuotaStatus()
    getWaveTimer()
    getCommandPoints()
}

// Game state transition hooks (called from game.js)
function checkPromotionTrigger()   // Returns true if all 15 techs researched
function startPromotionCinematic() // Initiates the cinematic sequence
function enterCommandMode()        // Sets up command phase
```

**Dependencies**:
- Reads/writes from `game.js`: `gameState` variable, `techTree.researched`, `score`, `wave`, `bioMatter`
- Creates/manages: `ZoneState` instances, `CrewRoster`, `Director`
- Calls: `renderCommandHUD()`, zone updates, crew AI updates

**This is the ONLY file that touches game.js globals.** All other command modules are isolated.

**Touchpoints in game.js** (the minimal changes needed):

```javascript
// 1. Add new game states (line ~3020)
let gameState = 'TITLE'; // Add: 'PROMOTION_CINEMATIC', 'COMMAND', 'COMMAND_SUMMARY', 'COMMAND_MANAGEMENT'

// 2. Add command phase to game loop switch (line ~26598)
case 'PROMOTION_CINEMATIC':
    commandPhase.updateCinematic(dt);
    commandPhase.renderCinematic();
    break;
case 'COMMAND':
    commandPhase.update(dt);
    commandPhase.render();
    break;
case 'COMMAND_SUMMARY':
    commandPhase.updateSummary(dt);
    commandPhase.renderSummary();
    break;
case 'COMMAND_MANAGEMENT':
    commandPhase.updateManagement(dt);
    commandPhase.renderManagement();
    break;

// 3. Add promotion trigger check at wave end (line ~26767, after waveTimer <= 0)
if (techTree.researched.size === 15 && !commandPhaseActive) {
    commandPhaseActive = true;
    // Let wave summary play normally, then trigger cinematic
    commandPhaseTriggered = true;
}

// 4. After wave summary auto-continue (line ~22231 area)
if (commandPhaseTriggered) {
    gameState = 'PROMOTION_CINEMATIC';
    commandPhase = new CommandPhaseState();
    commandPhase.init(getPhaseOneState());
    startPromotionCinematic();
    commandPhaseTriggered = false;
    return;
}

// 5. Add script tags to index.html
<script src="js/command/command-config.js"></script>
<script src="js/command/zone-sim.js"></script>
<script src="js/command/crew.js"></script>
<script src="js/command/director.js"></script>
<script src="js/command/command-hud.js"></script>
<script src="js/command/command-state.js"></script>
```

**That's approximately 30 lines of changes to game.js.** Everything else lives in new files. This is how we avoid merge conflicts.

**Test Strategy**:
- Set `techTree.researched.size` to 15 in console, complete a wave, verify promotion triggers.
- Verify cinematic plays through all phases (call, zoom, flash, settling).
- Verify command mode starts with 2 zones running.
- Verify wave timer counts down, wave end triggers summary.
- Verify Emergency Override zoom in/out works.
- Full loop: play a command wave, see summary, make decision, start next wave.

### Shared Config (`js/command/command-config.js`)

```javascript
const COMMAND_CONFIG = {
    // Zone simulation
    ZONE_WAVE_DURATION: 60,
    ZONE_TARGET_SCALE: 0.5,         // Entities render at 50% size
    ZONE_MAX_TARGETS: 4,            // Fewer targets per zone
    ZONE_MAX_TANKS: 3,              // Fewer tanks per zone
    ZONE_PARTICLE_BUDGET: 50,       // Max particles per zone
    ZONE_DRIFT_TIME: 30,            // Seconds before degradation starts
    ZONE_DRIFT_PENALTY: 0.05,       // 5% performance loss per second of drift

    // Crew
    CREW_TRAIT_AXIS: { reckless: 1, cautious: -1 },  // First slice: single axis
    CREW_BASE_SKILL: 0.5,
    CREW_MORALE_MAX: 1.0,
    CREW_STAMINA_DRAIN: 0.1,        // Per wave

    // Quota
    QUOTA_BASE: 10,                  // Base abductions per zone per wave
    QUOTA_SCALING: 1.1,              // 10% increase per command wave
    QUOTA_ROLLING_WINDOW: 3,         // 3-wave rolling average
    QUOTA_EXCEED_SURGE_DURATION: 2,  // Waves of elevated quota after exceeding
    QUOTA_MISS_CONSECUTIVE_PENALTY: 2, // Consecutive misses before penalty
    QUOTA_RECOVERY_WAVE_INTERVAL: 5, // Recovery wave every 5 waves

    // Director
    DIRECTOR_APPROVAL_START: 50,     // 0-100 scale
    DIRECTOR_OVERRIDE_PENALTY: 5,    // Approval cost of Emergency Override

    // Emergency Override
    OVERRIDE_DURATION: 15,           // Seconds of manual control
    OVERRIDE_COOLDOWN: 0,            // Per wave (once per wave)
    OVERRIDE_CP_COST: 1,

    // Command Points
    CP_PER_QUOTA_MET: 1,
    CP_PER_QUOTA_EXCEEDED: 2,
    CP_PER_COACHING_WIN: 0.5,

    // Resource routing
    RESOURCE_TRANSIT_LOSS: 0.10,     // 10% lost in transit
    RESOURCE_TRANSIT_DELAY: 3,       // Seconds delay

    // Cinematic
    CINEMATIC_DURATION: 10,          // Total cinematic length in seconds
    CINEMATIC_PHASES: {
        call: { start: 0, end: 3 },
        zoom: { start: 3, end: 6 },
        flash: { start: 6, end: 8 },
        settling: { start: 8, end: 10 }
    },

    // Visual
    COLORS: {
        directorPrimary: '#a00',
        directorBorder: '#c22',
        directorText: '#f33',
        directorBg: 'rgba(30, 0, 0, 0.85)',
        commandGold: '#d4a017',
        commandGoldGlow: 'rgba(212, 160, 23, 0.3)',
        zoneStable: '#0f0',
        zoneStressed: '#fc0',
        zoneCrisis: '#f44',
        zoneEmergency: '#f00'
    }
};
```

---

## IV. Data Architecture

### Phase 2 Game State Object

```javascript
// The CommandPhaseState holds everything
{
    // Wave management
    commandWave: 1,              // Command-phase wave counter (independent of Phase 1 wave)
    waveTimer: 60,
    waveActive: true,

    // Zones
    zones: [ZoneState, ZoneState],  // 2 zones for first slice
    zoneCount: 2,

    // Crew
    roster: CrewRoster,          // All crew members
    benchedCrew: [],             // Crew not assigned to zones

    // Director
    director: Director,

    // Quota
    quotaHistory: [],            // Last N wave results for rolling average
    currentQuotaTarget: 10,      // Per-zone target this wave
    consecutiveMisses: 0,

    // Resources (shared pool)
    sharedEnergy: 200,           // Total energy pool
    bioMatter: bioMatter,        // Carried from Phase 1
    commandPoints: 0,
    dronePools: { harvester: 4, battle: 2 },

    // Resource transfers
    activeTransfers: [],         // In-flight transfers

    // Override
    overrideAvailable: true,     // Once per wave
    overrideActive: false,
    overrideZone: null,
    overrideTimer: 0,

    // Between-wave
    decisionQueue: [],           // Pending decisions
    activePolicies: [],          // Set-and-forget automation rules

    // Phase tracking
    phase: 'wave',               // 'wave' | 'summary' | 'management'
    cinematicProgress: 0,

    // Cumulative stats
    totalAbductions: 0,          // The "big number" — carried from Phase 1
    wavesAsCommander: 0
}
```

### How Crew State Persists Between Waves

Crew members live in the `CrewRoster`. Between waves:
1. `ZoneState` reports final performance to `CommandPhaseState`.
2. `CommandPhaseState` updates crew `performance[]` ring buffer, adjusts `morale` and `stamina`.
3. Crew objects persist — they're never recreated between waves.
4. Next wave, `ZoneState` gets a reference to the same `CrewMember`, creates a fresh zone simulation state.

### How Zone Simulations Report Up

```javascript
// At wave end, each zone produces a WaveReport
{
    zoneId: 'zone-a',
    abductions: 12,
    quotaTarget: 10,
    quotaMet: true,
    quotaPercent: 1.2,
    damagesTaken: 3,
    dronesLost: 1,
    crewPerformance: 0.85,       // 0-1 composite score
    tanksDestroyed: 4,
    crisisEvents: ['boss_assault']
}
```

`CommandPhaseState.endWave()` collects reports from all zones, feeds them to `Director.generateReportCard()`, updates quota history, and transitions to `COMMAND_SUMMARY`.

### Events Between Systems

Keep it simple. No event bus. Direct function calls through `CommandPhaseState`:

```
Zone fires crisis -> commandState.handleCrisis(zoneId, crisisType)
Director issues directive -> commandState.applyDirective(directive)
Player clicks zone -> commandState.selectZone(zoneId)
Player triggers override -> commandState.startOverride(zoneId)
Player routes resources -> commandState.routeResources(fromZone, toZone, type, amount)
```

**Why no event bus**: This is a first slice with 2 zones and 5 systems. An event bus adds complexity we don't need. If we scale to 16 zones and need decoupling, we add it then. YAGNI.

### Save/Load

**Not in first slice.** The command phase is a single session experience for now. If the player closes the tab, they restart from the last Phase 1 save and re-trigger promotion.

**When we do add it** (slice 2+): Serialize `CommandPhaseState` to `localStorage`. The state object above is already JSON-serializable — no circular references, no function pointers in data. Add `commandPhase.serialize()` and `CommandPhaseState.deserialize(data)`.

---

## V. Performance Engineering

### CPU/Frame Budget Analysis

**Current Phase 1 budget** (measured from code analysis, not profiling):
- 1 UFO update: ~0.1ms
- 5 targets update: ~0.2ms
- 3-5 tanks update: ~0.3ms
- 10-20 projectiles: ~0.1ms
- 50-100 particles: ~0.3ms
- HUD rendering: ~2-3ms
- Background/stars: ~0.5ms
- **Total Phase 1 frame**: ~4-5ms at 60fps (budget: 16.6ms)

**Phase 2 budget (2 zones)**:
- 2x zone update (simplified): ~1.5ms (reduced target/tank count, no powerups, no tutorials)
- 2x zone render (clipped): ~3ms (50% scale, fewer entities, no HUD within zones)
- Command HUD render: ~2ms (panels, status bars, Director portrait)
- Global effects (scanlines, boot overlays): ~0.5ms
- **Total Phase 2 frame**: ~7ms at 60fps

**Verdict**: 2 zones at 60fps is well within budget. No offscreen canvases needed for first slice.

### When to Use Offscreen Canvases

**Not yet.** Offscreen canvases add complexity (creation, sizing, compositing, cleanup on resize). The 2-zone first slice doesn't need them.

**When we will need them**: At 4 zones, if frame time exceeds 12ms. At 16 zones, definitely — render each zone to an offscreen canvas at 30fps, composite to main canvas at 60fps. But that's slices 3+.

### Animation Frame Rate Targets

- **Main canvas**: 60fps always.
- **Zone simulations (first slice)**: 60fps (they're lightweight enough).
- **Zone simulations (4 zones, future)**: 60fps for selected zone, 30fps for others (update every other frame).
- **Zone simulations (16 zones, future)**: 15fps for heatmap cells, 60fps for focus view.
- **Between-wave screens**: 60fps (they're mostly static panels with animations).
- **Cinematic**: 60fps (it's the most important visual moment).

### Memory Considerations

**2 zones**: Negligible. Each zone state is ~50 objects (targets, tanks, projectiles). Total: ~100 objects. The existing Phase 1 already manages this much.

**16 zones (future)**: 16 zones x 50 objects = 800 objects. Plus 16 crew members, performance histories, quota histories. Still under 1MB. The real concern at 16 zones is draw calls (1600+ per frame), not memory.

**Ring buffers**: Use fixed-size arrays for performance history (20 samples), energy history (180 samples, same as existing `NRG.FLOW`). Don't let arrays grow unbounded.

---

## VI. Risk Register

### Risk 1: Zone Simulation Fidelity (Severity: HIGH)

**What could go wrong**: The simplified Phase 1 sim doesn't feel like Phase 1. Players see zones that look wrong — targets behave differently, tanks fire at wrong rates, the overall "feel" is off.

**Mitigation**: Start by copying the exact Phase 1 spawn rates and movement logic. Simplify by REMOVING features (no powerups, no warp juke, no coordinator charging), not by CHANGING the base mechanics. The zone sim should be Phase 1 minus features, not a different game.

**How agents get stuck**: Trying to extract and reuse Phase 1 classes directly. The Phase 1 `Target` class references global state (`ufo`, `keys`, `activePowerups`). Don't extract — rewrite simplified versions.

### Risk 2: Crew AI Believability (Severity: HIGH)

**What could go wrong**: The crew UFO moves like a robot. It's obviously following a script. The "watching someone do your job" feeling doesn't land because the AI doesn't look human.

**Mitigation**: Add randomness to AI decisions. A reckless crew member doesn't ALWAYS charge — they charge 70% of the time, hesitate 20%, and make a random mistake 10%. Add a "decision delay" — the AI waits 200-500ms before reacting to new threats, simulating reaction time. Add occasional "bad decisions" — flying into a tank's path, missing an easy target, beaming when energy is low.

**Iteration needed**: This WILL require tuning. Budget 2-3 rounds of AI behavior adjustment. The AI doesn't need to be good — it needs to look HUMAN.

### Risk 3: game.js Merge Conflicts (Severity: MEDIUM)

**What could go wrong**: Despite the new-file strategy, agents still need to touch game.js for state transitions and input handling. Concurrent edits cause conflicts.

**Mitigation**: Agent 4 (Integration) is the ONLY agent that edits game.js. Agents 1-3 never touch it. Agent 4 writes the glue code that bridges game.js globals to the command modules. If Agent 4 blocks on a game.js edit, Agents 1-3 can still work on their isolated modules.

### Risk 4: The Promotion Cinematic Timing (Severity: MEDIUM)

**What could go wrong**: The 10-second cinematic feels too long or too short. Phase transitions don't sync with audio. The zoom-out looks janky.

**Mitigation**: Build the cinematic in phases (call -> zoom -> flash -> settling) with independent timing. Each phase can be tuned without affecting others. Use `performance.now()` for timing, not frame counting. Make phase durations configurable in `COMMAND_CONFIG`.

### Risk 5: Command HUD Layout on Different Screen Sizes (Severity: MEDIUM)

**What could go wrong**: The command HUD looks great at 1920x1080 and breaks at 1366x768. Zone panels are too small to read. Sidebar text overlaps.

**Mitigation**: Build the layout function (`getCommandHUDLayout`) FIRST, before any panel rendering. Test it at 3 common resolutions. Use percentage-based sizing for major areas, fixed sizes only for text and indicators. The existing `getHUDLayout()` at line 14148 is a good pattern — it calculates all positions from canvas dimensions.

### Risk 6: Quota Balance (Severity: MEDIUM)

**What could go wrong**: Quotas are too easy (boring) or too hard (frustrating). The rolling average system sounds good on paper but needs tuning.

**Mitigation**: Start with very easy quotas (50% of what an average AI crew can achieve). Increase slowly. The Fun Engineer is right — the 2-zone phase must feel achievable. Players just mastered Phase 1; don't punish them for entering Phase 2.

### Risk 7: Emergency Override Feel (Severity: LOW)

**What could go wrong**: The zoom-in transition is disorienting. Controls don't work after zooming in. 15 seconds isn't enough to do anything meaningful.

**Mitigation**: The zoom is just a canvas scale transition — it doesn't change the coordinate space for input handling. When override is active, map mouse/keyboard to the zoomed zone's coordinate space. If 15 seconds feels too short in testing, increase to 20. Make it configurable.

### Risk 8: Director Portrait Rendering (Severity: LOW)

**What could go wrong**: The Director looks like a reskinned Commander. No visual authority difference.

**Mitigation**: The visual design doc is extremely detailed on this. Follow it closely. Key differentiators: gray-blue skin (not green), cranial ridges, nostril slits (not dots), mouth line, larger eyes, crimson background. The portrait code is self-contained in `director.js` — iterate on it without affecting anything else.

### Risk 9: Between-Wave Pacing (Severity: MEDIUM)

**What could go wrong**: The report card + decision budget feels like a forced pause. Players want to get back to watching zones.

**Mitigation**: Keep it FAST. Report card: auto-reveal zone results (500ms each), Director speaks (2 seconds), player picks response (no timer — let them take their time, but make picking fast via keyboard 1/2/3). Optional decision: show cards, player picks one or skips. Total: 10-15 seconds if player is quick. Don't add delays.

### Risk 10: Scope Creep Into Slice 2 Features (Severity: HIGH)

**What could go wrong**: Agents start building the Director's Kid, coaching depth, policy presets, 4-zone layout, training wave — features explicitly deferred to slice 2.

**Mitigation**: The first slice scope is explicit in the design doc (Section "First Slice Scope"). Print it on every agent's wall:
- Promotion trigger + minimal cinematic
- 2-zone layout
- 1 crew member, 1 trait axis (Reckless <-> Cautious)
- Per-zone quotas with target band
- Director report cards with 2-3 scripted options
- Zone simulation (simplified Phase 1)
- Emergency Override

**Nothing else.** No interviews. No coaching. No policies. No Director mood system. No training wave. Get the core loop working first.

---

## VII. Anti-Patterns to Avoid

### 1. Don't Recreate the Monolith

`game.js` is 27k lines because everything lives in one file. Phase 2 modules are in separate files for a reason. Don't let `command-state.js` become a 5k-line god object. If a function doesn't belong to state management, put it in the appropriate module.

**Concrete rule**: No file in `js/command/` should exceed 1500 lines for the first slice. If it does, something is over-built.

### 2. Don't Abstract Too Early

The design docs describe 16 zones, team leads managing sub-teams, cascading quotas, policy dashboards. NONE of that is in the first slice. Don't build a `ZoneManager` class that "supports 1 to N zones with configurable grid layouts." Build something that renders exactly 2 zones side by side. When we need 4, we'll adjust.

### 3. Don't Build the Event System

I mentioned this above but it bears repeating. No `EventEmitter`, no `publish/subscribe`, no message queues. Direct function calls. The command phase has 5 systems talking to each other through 1 coordinator (`CommandPhaseState`). That's a hub, not a bus.

### 4. Don't Optimize Before Measuring

The visual design doc talks about offscreen canvases, shared starfield buffers, effect culling for small panels. All valid concerns at 16 zones. At 2 zones, they're premature optimization. Render everything to the main canvas. If the frame rate drops below 55fps on a test device, THEN optimize.

### 5. Don't Over-Engineer the Crew AI

First slice: one trait axis (Reckless <-> Cautious). The AI needs to do two things differently based on this axis: how aggressively it approaches targets, and how much energy it conserves. That's it. Don't build a behavior tree. Don't implement utility scoring. A few `if` statements with trait-weighted thresholds are sufficient.

```javascript
// This is enough for the first slice
getInputs(zoneState) {
    const keys = {};
    const target = this.findBestTarget(zoneState);
    if (target) {
        const shouldApproach = Math.random() < this.traits.reckless * 0.8 + 0.2;
        if (shouldApproach) {
            keys['ArrowLeft'] = target.x < zoneState.crewUfo.x;
            keys['ArrowRight'] = target.x > zoneState.crewUfo.x;
        }
    }
    const energyThreshold = 0.5 - this.traits.reckless * 0.3; // Reckless: beams at 20%, Cautious: at 50%
    keys['Space'] = zoneState.crewUfo.energy / 100 > energyThreshold && this.hasTargetInRange(zoneState);
    return keys;
}
```

### 6. Keep the Fun Feedback Loop Tight

Every day of development should end with someone PLAYING the game. Not running tests. Not checking renders. PLAYING. The build order is designed so each step produces a playable increment. If you can't play it at the end of the day, something went wrong.

---

## VIII. Build Order (Implementation Phases)

### Phase 0: Scaffold (Day 1)

**Output**: New file structure, script loading, basic state transition.

1. Create `js/command/` directory and all 6 files with empty module shells.
2. Add `<script>` tags to `index.html` in dependency order.
3. Add `commandPhaseActive` and `commandPhaseTriggered` globals to `game.js`.
4. Add `PROMOTION_CINEMATIC`, `COMMAND`, `COMMAND_SUMMARY`, `COMMAND_MANAGEMENT` cases to `gameLoop()` switch.
5. Add promotion trigger check at wave end: `if (techTree.researched.size === 15 && !commandPhaseActive)`.
6. Write `COMMAND_CONFIG` with all constants.
7. **Verify**: Set all 15 techs as researched via console, complete a wave, see "PROMOTION_CINEMATIC" state trigger (can be a simple text flash for now).

### Phase 1: Single Zone Rendering (Days 2-3)

**Output**: One Phase 1 zone running autonomously in a box on screen.

1. Implement `ZoneState` with simplified target spawning, tank spawning, projectile updates.
2. Implement zone UFO (AI placeholder: random movement, random beaming).
3. Implement zone `render()` — clipped canvas region with scaled entities.
4. Hook into command game loop: create one zone, update it, render it.
5. **Verify**: Watch a simplified Phase 1 game play itself in a 50%-sized box. Targets spawn, tanks fire, UFO moves, beam works.

### Phase 2: Two Zones + Basic Crew AI (Days 3-4)

**Output**: Split screen with two zones, each driven by a crew member with different traits.

1. Implement `CrewMember` with reckless/cautious trait.
2. Implement `CrewAI.getInputs()` — trait-driven virtual key presses.
3. Create two zones, assign crew members (one reckless, one cautious).
4. Implement 2-zone layout in `getCommandHUDLayout()`.
5. Render both zones side by side with `renderZonePanel()`.
6. **Verify**: Two zones on screen. Left zone has a reckless UFO (aggressive, takes damage). Right zone has a cautious UFO (conservative, misses targets). Visually distinct behavior.

### Phase 3: Command HUD Shell (Day 5)

**Output**: Panels framing the zones — status bar, crew roster, resources, Director channel.

1. Implement `renderCommandStatusBar()` — wave number, quota progress, timer.
2. Implement `renderCommandSidebar()` — crew roster entries, resource bars.
3. Implement `renderDirectorChannel()` — empty panel with label.
4. Add zone status strips — threat, drones, energy, quota per zone.
5. Implement zone border color system (stable/stressed/crisis/emergency).
6. **Verify**: Full command HUD layout visible. All panels render. Zone borders reflect status.

### Phase 4: Quota System (Day 6)

**Output**: Quotas track per zone, wave end tallies results.

1. Implement quota tracking in `ZoneState` — count abductions, compare to target.
2. Implement `CommandPhaseState.endWave()` — collect zone reports.
3. Implement quota target band system — rolling average, surge on exceed, recovery waves.
4. Display quota progress in status bar and zone panels (real-time updates during wave).
5. **Verify**: Play a command wave. See quota bars fill. Wave ends. Results calculated correctly.

### Phase 5: Director System (Days 7-8)

**Output**: The Director appears, speaks, judges. Report cards work.

1. Implement `renderDirectorPortrait()` — gray-blue alien with crimson background.
2. Implement Director dialogue — `DIRECTOR_DIALOGUES` for quota met/missed/exceeded.
3. Implement `renderReportCard()` — zone-by-zone breakdown, dialogue options.
4. Implement report card interaction — keyboard 1/2/3 to select response.
5. Implement Director approval tracking — mood shifts based on choices.
6. Hook Director into between-wave flow: wave ends -> summary -> report card -> next wave.
7. **Verify**: Complete a wave. Director appears. Report card shows. Pick a response. Director reacts. Next wave starts.

### Phase 6: Promotion Cinematic (Days 8-9)

**Output**: The Big Moment plays when all 15 techs are completed.

1. Implement Phase A (The Call): commander dissolves, Director materializes.
2. Implement Phase B (The Zoom): canvas scale transition, Phase 1 HUD dissolves, second zone materializes.
3. Implement Phase C (The Flash): white flash, command HUD skeleton in gold.
4. Implement Phase D (The Settling): boot sequence, content populates, Director speaks.
5. SFX: deep bass drone, sawtooth voice at lower pitch, authority chord, boot tones.
6. **Verify**: Complete all 15 techs (debug mode). Watch the full 10-second cinematic. Feel the transition.

### Phase 7: Resource Routing + Emergency Override (Days 9-10)

**Output**: Player can move resources between zones and take manual control.

1. Implement `ResourcePipeline` — transfer with delay and transit loss.
2. Implement resource routing UI — select zone, transfer energy/drones.
3. Implement `activateOverride()` — canvas zoom into zone, Phase 1 controls activate.
4. Implement `deactivateOverride()` — canvas zoom back out, Director disapproval.
5. Implement override timer (15 seconds) with countdown display.
6. **Verify**: Route energy from Zone A to Zone B. See Zone A's energy drop, Zone B's rise after delay. Trigger override. Fly the UFO. Timer counts down. Zoom back out. Director comments.

### Phase 8: Between-Wave Management (Day 10)

**Output**: Full wave loop with management decisions.

1. Implement wave summary screen — zone results, total quota, Director reaction.
2. Implement optional decision placeholder — simple menu with "Skip" option.
3. Implement crew assignment (swap crew between zones via hotkey/click).
4. Connect management screen to next wave start.
5. **Verify**: Play 3 consecutive command waves. See report cards, make decisions, watch crew persist between waves. The loop feels complete.

### Phase 9: Polish + Drift System (Days 11-12)

**Output**: The game feels good. Plate-spinning works.

1. Implement drift timers — zones decay without monitoring.
2. Implement zone scanning (click/hotkey to reset drift).
3. Add zone border pulse animations.
4. Add Director transmission visual treatment (red overlay, slow scanlines).
5. Add boot sequence for command panels (gold variant).
6. Tune quota difficulty, crew AI behavior, drift rates.
7. **Verify**: Play 5+ consecutive waves. The management tension is real. Drift forces attention cycling. Director creates emotional pressure. This is fun.

---

## IX. Dependency Graph

```
command-config.js  (no deps — loaded first)
       |
       v
zone-sim.js  <---- crew.js (CrewAI.getInputs feeds zone UFO)
       |              |
       v              v
command-hud.js  <-- director.js (renderDirectorPortrait used by HUD)
       |
       v
command-state.js  (imports everything, bridges to game.js)
```

**Load order in index.html**:
```html
<script src="js/command/command-config.js"></script>
<script src="js/command/crew.js"></script>
<script src="js/command/director.js"></script>
<script src="js/command/zone-sim.js"></script>
<script src="js/command/command-hud.js"></script>
<script src="js/command/command-state.js"></script>
```

**Agent parallelism**: Agents 1, 2, and 3 can work simultaneously from Day 2. They depend on `command-config.js` (shared constants) and the public interfaces above, but not on each other's implementations. Agent 4 integrates once the others have working modules.

---

## X. Quality Gates

Before merging any agent's work:

1. **No game.js regressions**: Phase 1 must still work perfectly. Run the game, play wave 1-3, verify nothing is broken.
2. **File size check**: No command module exceeds 1500 lines.
3. **Global namespace**: New globals are prefixed (`commandPhase*`, `COMMAND_CONFIG`) to avoid collisions.
4. **Performance**: Frame time under 12ms at 1920x1080 with 2 zones active.
5. **The "watch it" test**: Can you watch the 2-zone command phase for 60 seconds and see behavior that looks human? Does the reckless crew member do something dumb? Does the cautious one play too safe?

---

## XI. What I Would Cut If We Run Out of Time

In priority order (cut from bottom):

1. ~~Resource routing UI~~ (replace with auto-balanced shared pool)
2. ~~Emergency Override~~ (defer to slice 2)
3. ~~Command boot sequence~~ (simple fade-in instead of gold boot)
4. ~~Drift system~~ (zones don't decay in first slice)
5. ~~Director portrait rendering~~ (reuse Commander portrait with red tint)
6. ~~Promotion cinematic~~ (simple flash + text instead of 10-second sequence)

Items 5 and 6 would be painful cuts. Items 1-4 are nice-to-haves that can wait.

**What we absolutely CANNOT cut**:
- Zone simulation (that IS the feature)
- Crew AI (that IS the emotional hook)
- 2-zone rendering (that IS the visual proof)
- Quota tracking (that IS the mechanical tension)
- Director dialogue (that IS the narrative beat)

---

*Report filed by ORACLE-4. The bones are solid. The scope is controlled. The module boundaries are clean. Build it in order, play it every day, and resist the urge to build Phase 3 before Phase 2 works.*
