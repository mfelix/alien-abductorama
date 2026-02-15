# Phase 2 Data Structures
## Every Object, Class, and State Shape with Example JSON

**Date**: 2026-02-13
**Status**: FINAL

---

## I. COMMAND STATE (Master State Object)

This is the single source of truth for all Command Phase state. Created by `initPromotionCinematic()`. Only `command-main.js` reads/writes game.js globals; everything else reads from this.

```javascript
const commandState = {
    commandWave: 3,                  // Current command-phase wave number
    waveTimer: 42.5,                 // Seconds remaining in current wave
    zones: [ ZoneState, ZoneState ], // Array of zone states (2 for first slice)
    roster: CrewRoster,              // All crew members
    director: Director,              // THE DIRECTOR
    pipeline: ResourcePipeline,      // Resource transfer system
    commandPoints: 2,                // Accumulated CP (not spendable in first slice)
    totalAbductions: 157,            // Cumulative from Phase 1 + command phase
    overrideAvailable: true,         // Resets each wave
    selectedZone: 0,                 // Index of focused zone (for drift timer)
    subState: 'LIVE',               // 'BOOT' | 'LIVE' | 'OVERRIDE'
    hudLayout: {                     // Cached from getCommandHUDLayout(2)
        cmdStatus:  { x: 8, y: 8, w: 944, h: 32 },
        zones: [
            { x: 8, y: 48, w: 468, h: 314 },
            { x: 484, y: 48, w: 468, h: 314 }
        ],
        crewRoster: { x: 8, y: 370, w: 288, h: 120 },
        resources:  { x: 304, y: 370, w: 336, h: 120 },
        orders:     { x: 648, y: 370, w: 304, h: 120 },
        dirChannel: { x: 8, y: 498, w: 944, h: 64 }
    }
};
```

---

## II. ZONE STATE

### Class: ZoneState

```javascript
class ZoneState {
    constructor(zoneId, difficulty) {
        this.id = zoneId;                    // 'zone-a' | 'zone-b'
        this.name = 'SECTOR A-7';            // Display name
        this.difficulty = difficulty;         // 0.0-1.0, affects tank count/speed

        // Entity arrays
        this.targets = [];                   // ZoneTarget[]
        this.tanks = [];                     // ZoneTank[]
        this.projectiles = [];               // ZoneProjectile[]
        this.particles = [];                 // ZoneParticle[] (capped)

        // Crew UFO
        this.crewUfo = {
            x: 240,                          // Zone-local X position
            y: 90,                           // Zone-local Y position
            vx: 0,                           // Horizontal velocity
            vy: 0,                           // Vertical velocity
            energy: 100,                     // Current energy
            maxEnergy: 100,                  // Maximum energy
            health: 100,                     // Current health
            beamActive: false,               // Is beam firing?
            beamTarget: null,                // Reference to locked target
            hoverOffset: 1.23,               // Random phase for hover animation
            width: 30,                       // Collision width
            height: 16                       // Collision height
        };

        // Crew references
        this.crewMember = null;              // CrewMember instance or null
        this.crewAI = null;                  // CrewAI instance or null

        // Quota tracking
        this.quota = {
            target: 10,                      // Per-wave target
            current: 0                       // Abductions this wave
        };

        // Drift system
        this.driftTimer = 25;                // Seconds until degradation
        this.driftLevel = 0;                 // 0-4 decay level
        this.driftAccumulator = 0;           // Sub-second accumulator
        this.driftRecoverTimer = 0;          // Recovery accumulator

        // Computed state
        this.healthScore = 1.0;              // 0.0-1.0 composite
        this.state = 'stable';               // 'stable'|'stressed'|'crisis'|'emergency'
        this.fleetOrder = 'balanced';        // 'defensive'|'balanced'|'harvest'
        this.isOverrideActive = false;       // True during Emergency Override
        this.starSeed = Math.random() * 10000; // Deterministic star positions
        this.starPositions = [];             // Pre-generated from seed

        // Wave report (filled at wave end)
        this.waveReport = null;
    }
}
```

### Zone Target

```javascript
// Example ZoneTarget
{
    x: 180,                  // Zone-local X position
    y: 267,                  // Zone-local Y position (ground level)
    type: 'human',           // 'human'|'cow'|'sheep'|'cat'|'dog'
    weight: 1.0,             // Abduction weight (all 1.0 for first slice)
    bioValue: 3,             // Bio-matter earned on abduction
    alive: true,
    beingAbducted: false,
    abductionProgress: 0.0,  // 0.0 - 1.0
    wanderVx: 12,            // Wander speed (px/s)
    wanderTimer: 2.3,        // Time until direction change
    falling: false,
    vy: 0
}
```

### Zone Tank

```javascript
// Example ZoneTank
{
    x: 50,                   // Zone-local X position
    y: 264,                  // Ground level
    direction: 1,            // 1 = right, -1 = left
    speed: 18,               // Movement speed (px/s)
    fireTimer: 1.7,          // Time until next shot
    fireInterval: 2.7,       // Base interval between shots
    alive: true,
    turretAngle: -1.2,       // Radians, aimed at UFO
    projectileType: 'shell'  // Only 'shell' in first slice
}
```

### Zone Projectile

```javascript
// Example ZoneProjectile
{
    x: 55,
    y: 250,
    vx: 85,                  // Velocity X (px/s)
    vy: -100,                // Velocity Y (px/s), negative = upward
    type: 'shell',
    alive: true,
    damage: 10
}
```

### Zone Particle (for visual effects)

```javascript
// Example ZoneParticle
{
    x: 200,
    y: 150,
    vx: 30,
    vy: -20,
    life: 0.8,               // Remaining life (seconds)
    maxLife: 1.0,
    color: '#f44',
    size: 2
}
```

### Wave Report (generated at wave end)

```javascript
// Example ZoneState.waveReport
{
    zoneId: 'zone-a',
    abductions: 12,
    quotaTarget: 10,
    quotaMet: true,
    quotaPercent: 120,
    damagesTaken: 3,          // Number of hits
    energyRemaining: 45,
    crewMember: 'KRIX',
    driftMaxLevel: 1,         // Highest drift level reached
    fleetOrder: 'balanced'
}
```

---

## III. CREW MEMBER

### Class: CrewMember

```javascript
class CrewMember {
    constructor(config) {
        this.id = 'crew_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.name = config.name;             // 'KRIX'
        this.traits = config.traits;         // { reckless: 0.72 }
        this.morale = 0.7;                   // 0.0-1.0
        this.stamina = 1.0;                  // 0.0-1.0
        this.skills = {
            piloting: 0.5,                   // 0.0-1.0 (not used in first slice)
            harvesting: 0.5                  // 0.0-1.0 (not used in first slice)
        };
        this.performance = new Float32Array(20);  // Ring buffer
        this.performanceIdx = 0;
        this.assignedZone = null;            // Zone ID or null
        this.hireWave = 0;                   // Command wave when hired
        this.consecutiveWavesAssigned = 0;   // For overwork morale penalty
        this.appearance = config.appearance || {
            skinColor: '#0a7040',
            eyeSize: 1.0,                   // Multiplier
            craniumWidth: 1.0               // Multiplier
        };
    }
}
```

### Example CrewMember (Reckless)

```json
{
    "id": "crew_1707840000_a3f2",
    "name": "KRIX",
    "traits": { "reckless": 0.72 },
    "morale": 0.75,
    "stamina": 0.9,
    "skills": { "piloting": 0.5, "harvesting": 0.5 },
    "performance": [0, 0, 0, 0.8, 0.85, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "performanceIdx": 6,
    "assignedZone": "zone-a",
    "hireWave": 0,
    "consecutiveWavesAssigned": 3,
    "appearance": {
        "skinColor": "#1a8040",
        "eyeSize": 0.95,
        "craniumWidth": 0.9
    }
}
```

### Example CrewMember (Cautious)

```json
{
    "id": "crew_1707840001_b7e9",
    "name": "NURP",
    "traits": { "reckless": 0.28 },
    "morale": 0.65,
    "stamina": 1.0,
    "skills": { "piloting": 0.5, "harvesting": 0.5 },
    "performance": [0, 0, 0, 0.6, 0.65, 0.72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "performanceIdx": 6,
    "assignedZone": "zone-b",
    "hireWave": 0,
    "consecutiveWavesAssigned": 3,
    "appearance": {
        "skinColor": "#0a5060",
        "eyeSize": 1.1,
        "craniumWidth": 1.05
    }
}
```

---

## IV. CREW ROSTER

### Class: CrewRoster

```javascript
class CrewRoster {
    constructor() {
        this.members = [];     // CrewMember[]
    }
}
```

### Example Roster State

```json
{
    "members": [
        { "id": "crew_...a3f2", "name": "KRIX", "assignedZone": "zone-a" },
        { "id": "crew_...b7e9", "name": "NURP", "assignedZone": "zone-b" }
    ]
}
```

---

## V. CREW AI

### Class: CrewAI

```javascript
class CrewAI {
    constructor(crewMember) {
        this.traits = crewMember.traits;
        this.decisionDelay = this.computeDecisionDelay();  // 200-500ms
        this.decisionTimer = 0;
        this.lastDecision = { ArrowLeft: false, ArrowRight: false, Space: false };
        this.mistakeChance = 0.10;       // 10% base
        this.effectiveReckless = this.traits.reckless;  // Modified by fleet order
    }
}
```

### AI Virtual Input State

```javascript
// Returned by CrewAI.getInputs(zone)
{
    ArrowLeft: false,
    ArrowRight: true,
    Space: true
}
```

---

## VI. DIRECTOR

### Class: Director

```javascript
class Director {
    constructor() {
        this.approval = 50;              // 0-100
        this.mood = 'neutral';           // Computed from approval
        this.quotaHistory = [];          // Number[] (abductions per wave, aggregated)
        this.consecutiveMisses = 0;
        this.surgeWavesRemaining = 0;
        this.surgeAmount = 0;
        this.lastReportCard = null;      // ReportCard object
        this.isTransmitting = false;     // True when showing dialogue
        this.currentDialogue = '';       // Active typewriter text
        this.dialogueProgress = 0;       // Characters revealed
    }
}
```

### Report Card Object

```javascript
// Returned by Director.generateReportCard(zoneResults)
{
    commandWave: 3,
    zoneResults: [
        { zoneId: 'zone-a', abductions: 12, quotaTarget: 10, quotaMet: true, quotaPercent: 120 },
        { zoneId: 'zone-b', abductions: 6, quotaTarget: 10, quotaMet: false, quotaPercent: 60 }
    ],
    overallPerformance: 'met',     // 'exceeded'|'met'|'missed'
    overallPercent: 90,
    dialogue: "Your Zone A numbers are... acceptable. Zone B is a disaster.",
    options: [
        {
            label: "We had operational difficulties in Zone B. Trending up.",
            type: 'spin',
            approvalDelta: -2,
            directorReply: "Trending upward from WHAT? The floor?"
        },
        {
            label: "I take full responsibility. Adjusting assignments.",
            type: 'accountability',
            approvalDelta: 5,
            directorReply: "...hmph. Accountability. That's something."
        },
        {
            label: "Zone B had unprecedented tank activity this wave.",
            type: 'deflect',
            approvalDelta: -3,
            directorReply: "I can READ the reports, Commander."
        }
    ],
    mood: 'displeased'
}
```

---

## VII. RESOURCE PIPELINE

### Class: ResourcePipeline

```javascript
class ResourcePipeline {
    constructor() {
        this.transfers = [];    // ResourceTransfer[]
    }
}
```

### Resource Transfer Object

```javascript
// Created by ResourcePipeline.routeResources()
{
    from: 'zone-a',
    to: 'zone-b',
    type: 'energy',
    amount: 27,              // Amount that will be delivered (after transit loss)
    originalAmount: 30,      // Amount deducted from source
    delay: 3.0,              // Seconds for transit
    elapsed: 1.2,            // Seconds elapsed so far
    particles: []            // Visual particles (managed by renderer)
}
```

---

## VIII. OVERRIDE STATE

```javascript
// Managed by emergency-override.js
const overrideState = {
    active: false,
    zoneIndex: -1,              // Which zone is being overridden
    timer: 0,                   // Seconds remaining (15 -> 0)
    zoomProgress: 0,            // 0-1 for transition animation
    phase: 'idle'               // 'idle'|'zoom_in'|'active'|'zoom_out'
};
```

---

## IX. COMMAND BOOT STATE

```javascript
// Managed by command-boot.js
const commandBootState = {
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

// Panel phases: 'waiting' -> 'booting' -> 'online'
```

---

## X. PROMOTION CINEMATIC STATE

```javascript
// Managed by promotion-cinematic.js
const cinematicState = {
    active: false,
    elapsed: 0,                 // Total elapsed time
    phase: 'A',                 // 'A'|'B'|'C'|'D'
    phaseElapsed: 0,            // Time within current phase

    // Phase A state
    commanderDissolveProgress: 0,   // 0-1 (portrait dissolving)
    directorMaterializeProgress: 0, // 0-1 (portrait appearing)
    dialogueText: '',
    dialogueProgress: 0,

    // Phase B state
    zoomLevel: 1.0,                 // 1.0 -> 0.5
    panelPowerDownProgress: [],     // Per-panel dissolution progress
    zone2MaterializeProgress: 0,    // Second zone appearing

    // Phase C state
    flashAlpha: 0,                  // White flash 0-1-0
    wireframeAlpha: 0,              // Gold wireframe appearing
    bootActive: false,

    // Phase D state
    contentPopulated: false,
    finalDialogue: '',
    finalDialogueProgress: 0
};
```

---

## XI. COMMAND CONFIG

### Complete Config Object Shape

```javascript
const COMMAND_CONFIG = Object.freeze({
    ZONE: {
        WORLD_W: 480,               // Zone simulation world width
        WORLD_H: 300,               // Zone simulation world height
        GROUND_Y: 270,              // Ground plane Y position
        WAVE_DURATION: 60,          // Seconds per wave
        MAX_TARGETS: 5,             // Per zone
        SPAWN_INTERVAL_MIN: 2.5,    // Seconds
        SPAWN_INTERVAL_MAX: 4.0,
        PARTICLE_BUDGET: 30,        // Max particles per zone
        DRIFT_BASE_TIME: 25,        // Seconds before decay starts
        DRIFT_PENALTY: 0.05,        // Performance reduction per drift level
        DRIFT_RECOVER_TIME: 3.0,    // Seconds of focus to recover 1 drift level
        UFO_SPEED: 100,             // Horizontal px/s
        UFO_RESPAWN_TIME: 3.0,      // Seconds to respawn after destruction
        BEAM_DRAIN: 20,             // Energy/s while beaming
        BEAM_RECHARGE: 14,          // Energy/s when not beaming
        BEAM_RANGE: 210,            // Vertical pixels
        BEAM_CONE_ANGLE: 0.3,       // Radians half-angle
        SHELL_SPEED: 120,           // px/s
        SHELL_DAMAGE: 10
    },

    CREW: {
        MORALE_START: 0.7,
        MORALE_MIN: 0.0,
        MORALE_MAX: 1.0,
        STAMINA_DRAIN: 0.1,         // Per wave of assignment
        STAMINA_BENCH_RECOVERY: 0.25,// Per wave on bench
        DECISION_DELAY_RECKLESS: 0.2,// Seconds
        DECISION_DELAY_CAUTIOUS: 0.5,
        DECISION_DELAY_BALANCED: 0.35,
        MISTAKE_CHANCE: 0.10,        // 10%
        FLEET_ORDER_MODIFIER: 0.2    // Added/subtracted from reckless
    },

    QUOTA: {
        BASE: 10,                    // Abductions per zone per wave
        WAVE_SCALING: 0.02,          // +2% per wave
        ROLLING_WINDOW: 3,           // Waves for rolling average
        SURGE_THRESHOLD: 1.2,        // 120% to trigger surge
        SURGE_AMOUNT: 0.15,          // +15% quota during surge
        SURGE_DURATION: 2,           // Waves
        RECOVERY_INTERVAL: 5,        // Every N waves
        RECOVERY_DISCOUNT: 0.2,      // 20% quota reduction
        MET_THRESHOLD: 0.8,          // 80% = "met"
        EXCEEDED_THRESHOLD: 1.2      // 120% = "exceeded"
    },

    DIRECTOR: {
        APPROVAL_START: 50,
        APPROVAL_MIN: 0,
        APPROVAL_MAX: 100,
        MOOD_FURIOUS: 25,            // approval <= this
        MOOD_DISPLEASED: 45,
        MOOD_NEUTRAL: 70,
        // approval > 70 = satisfied
        OVERRIDE_PENALTY: 5,         // Approval loss per override
        TYPEWRITER_SPEED: 15,        // Chars/sec
        BLINK_INTERVAL: 4000,        // ms
        BLINK_DURATION: 200          // ms
    },

    OVERRIDE: {
        DURATION: 15,                // Seconds
        ZOOM_TRANSITION: 0.5,       // Seconds for zoom in/out
        WARNING_TIME: 3              // Seconds before end to show warning
    },

    RESOURCE: {
        TRANSIT_LOSS: 0.1,           // 10%
        TRANSIT_DELAY: 3.0,          // Seconds
        MIN_TRANSFER: 10,
        MAX_TRANSFER: 50,
        SAFETY_FLOOR: 20            // Cannot transfer below this
    },

    CINEMATIC: {
        PHASE_A_DURATION: 3.0,
        PHASE_B_DURATION: 3.0,
        PHASE_C_DURATION: 2.0,
        PHASE_D_DURATION: 2.0,
        TOTAL_DURATION: 10.0
    },

    COLORS: {
        COMMAND_GOLD: '#d4a017',
        COMMAND_GOLD_GLOW: 'rgba(212, 160, 23, 0.3)',
        COMMAND_GOLD_BORDER: '#b8860b',
        COMMAND_GOLD_LABEL: '#daa520',
        DIRECTOR_PRIMARY: '#a00',
        DIRECTOR_GLOW: 'rgba(170, 0, 0, 0.4)',
        DIRECTOR_BORDER: '#c22',
        DIRECTOR_TEXT: '#f33',
        DIRECTOR_SPEECH: '#f44',
        DIRECTOR_SATISFIED: '#a80',
        DIRECTOR_BG: 'rgba(30, 0, 0, 0.85)',
        DIRECTOR_SKIN: '#2a3a4a',
        ZONE_STABLE: '#0f0',
        ZONE_STRESSED: '#fc0',
        ZONE_CRISIS: '#f44',
        ZONE_EMERGENCY: '#f00',
        ZONE_OVERRIDE: '#0ff',
        MORALE_THRIVING: '#4cff4c',
        MORALE_CONTENT: '#0c8',
        MORALE_NEUTRAL: '#0aa',
        MORALE_STRESSED: '#da0',
        MORALE_STRAINED: '#f60',
        MORALE_BREAKING: '#f22',
        MORALE_BURNOUT: '#555',
        TRAIT_RECKLESS: '#f44',
        TRAIT_CAUTIOUS: '#0af'
    },

    NAMES: [
        'KRIX', 'NURP', 'ZYLK', 'BLORT', 'VRENN', 'QUIX', 'DRAAL',
        'SLYTH', 'MORX', 'FENN', 'GLYX', 'THRAK', 'PRYNN', 'VASK',
        'DULK', 'RESH', 'ORNN', 'TRYX', 'KALM', 'ZURR', 'PLEX',
        'NEBB', 'WRIX', 'GORN', 'FLUX', 'SKAB', 'DREL', 'MUXX'
    ],

    SCORE: {
        PER_ABDUCTION_MULTIPLIER: 10,   // Points per abduction * bioValue
        QUOTA_MET_BONUS: 100,
        QUOTA_EXCEEDED_BONUS: 200,
        ALL_STABLE_BONUS: 50,
        OVERRIDE_PER_ABDUCTION: 5
    },

    CP: {
        QUOTA_EXCEEDED: 2,
        QUOTA_MET: 1,
        ALL_EXCEEDED_BONUS: 1,
        DIRECTOR_SATISFIED_BONUS: 1
    }
});
```

---

## XII. LAYOUT RECTANGLES

### Layout Object Shape (Returned by getCommandHUDLayout)

```javascript
// For 2-zone layout at 960x540 canvas
{
    cmdStatus: { x: 8, y: 8, w: 944, h: 32 },
    zones: [
        { x: 8, y: 48, w: 468, h: 314 },     // Zone A
        { x: 484, y: 48, w: 468, h: 314 }     // Zone B
    ],
    crewRoster: { x: 8, y: 370, w: 288, h: 120 },
    resources: { x: 304, y: 370, w: 336, h: 120 },
    orders: { x: 648, y: 370, w: 304, h: 120 },
    dirChannel: { x: 8, y: 498, w: 944, h: 64 }
}
```

All rectangles have `{ x, y, w, h }` where (x,y) is top-left corner.

---

## XIII. GAME.JS GLOBALS TOUCHED BY COMMAND-MAIN.JS

Only `command-main.js` reads/writes these. No other Phase 2 file touches them.

| Global | Type | Read/Write | Purpose |
|--------|------|-----------|---------|
| `gameState` | string | R/W | Set to 'PROMOTION_CINEMATIC', 'COMMAND', 'COMMAND_SUMMARY' |
| `score` | number | R/W | Add zone performance points |
| `bioMatter` | number | R/W | Add zone abduction bio-matter |
| `harvestCount` | number | R/W | Add zone abduction count |
| `wave` | number | R | Read Phase 1 wave count (frozen at promotion value) |
| `techTree` | object | R | Read researched techs (all 15 active) |
| `canvas` | HTMLCanvasElement | R | Rendering target |
| `ctx` | CanvasRenderingContext2D | R | Rendering context |
| `keys` | object | R | Keyboard state (for override) |
| `commandPhaseActive` | boolean | W | Set true on promotion |

### game.js Globals Read by Other Phase 2 Files (via shared scope)

| Global | Used By | Purpose |
|--------|---------|---------|
| `canvas` | All renderers | Canvas dimensions |
| `ctx` | All renderers | Drawing context |
| `renderNGEPanel()` | command-hud, zone-renderer, director-renderer | Panel rendering |
| `renderNGEBar()` | command-hud, zone-renderer, command-summary | Progress bars |
| `renderNGEStatusDot()` | command-hud | Status indicators |
| `renderNGEKeyBadge()` | command-hud | Keyboard shortcut display |
| `renderHexDecodeText()` | promotion-cinematic, command-summary | Dramatic text reveals |
| `renderPanelBootOverlay()` | command-boot | Boot overlays |
| `renderNGEScanlines()` | zone-renderer | Scanline effects |
| `renderEnergyFlowLine()` | command-hud | Energy conduit animations |
| `hexToRgb()` | All renderers | Color conversion |
| `SFX` | promotion-cinematic, override, command-main | Sound effects |
| `CONFIG` | zone-simulation | Phase 1 entity behavior values |

---

*This document specifies the exact shape of every data structure in the Command Phase. An agent implementing any module can reference this for constructor arguments, property names, default values, and the overall state hierarchy. Example JSON values provide concrete instances for testing.*
