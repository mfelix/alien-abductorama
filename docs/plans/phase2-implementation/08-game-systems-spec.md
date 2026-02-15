# Phase 2 Game Systems Specification
## Detailed Mechanics, Formulas, and Edge Cases

**Date**: 2026-02-13
**Status**: FINAL

---

## I. ZONE SIMULATION

### Overview

Each zone runs a simplified Phase 1 game loop. The zone simulation handles target spawning, tank behavior, UFO movement (driven by CrewAI), beam mechanics, collisions, and quota tracking. Zones are independent -- they share no entities, only resources via the pipeline.

### Target System

**Spawning**:
```
spawnInterval = 2.5 + random() * 1.5   // 2.5-4.0 seconds between spawns
maxTargets = 5                           // Per zone
spawnX = random() * (ZONE_WORLD_W - 40) + 20  // 20px margin from edges
spawnY = GROUND_Y - 3                    // Ground level
```

**Types and Weights**:

| Type | Quota Value | Spawn Weight | Bio-Matter | Color |
|------|------------|-------------|------------|-------|
| human | 1 | 40% | 3 | #0f0 |
| cow | 1 | 25% | 2 | #fa0 |
| sheep | 1 | 15% | 2 | #fff |
| cat | 1 | 10% | 1 | #f80 |
| dog | 1 | 10% | 1 | #a86 |

All target types contribute 1 to quota. Bio-matter varies (reuses Phase 1 values).

**Wandering**:
```
wanderSpeed = 10 + random() * 15   // 10-25 px/s
wanderTimer = 1 + random() * 3     // Change direction every 1-4s
// Reverse at zone edges (20px margin)
```

**Abduction**:
```
abductionRate = 1.0 / weight    // 1 second per unit weight (all targets weight 1.0 for first slice)
abductionProgress += dt * abductionRate
// When progress >= 1.0: target removed, quota.current++, bioMatter += targetBioValue
```

### Tank System

**Spawning**:
```
tankCount = 1 + Math.floor(zone.difficulty * 0.5)   // 1-2 tanks for first slice
// Spawn at left or right edge of zone, ground level
spawnX = random() < 0.5 ? 20 : ZONE_WORLD_W - 20
direction = spawnX < ZONE_WORLD_W / 2 ? 1 : -1
```

**Movement**:
```
speed = 15 + zone.difficulty * 5   // 15-20 px/s
// Move horizontally, reverse at zone edges
if (tank.x < 20 || tank.x > ZONE_WORLD_W - 20) {
    tank.direction *= -1;
}
tank.x += tank.direction * tank.speed * dt;
```

**Firing**:
```
fireInterval = 3.0 - zone.difficulty * 0.3   // 2.4-3.0s between shots
fireTimer -= dt
if (fireTimer <= 0) {
    fireTimer = fireInterval
    // Calculate angle to UFO
    turretAngle = atan2(ufo.y - tank.y, ufo.x - tank.x)
    // Spawn projectile
    projectile = {
        x: tank.x,
        y: tank.y - 6,
        vx: cos(turretAngle) * 120,    // 120 px/s projectile speed
        vy: sin(turretAngle) * 120,
        damage: 10,
        alive: true
    }
}
```

**No heavy tanks, no missiles in first slice.** Shells only.

### UFO System (AI-Driven)

**Properties**:
```
crewUfo = {
    x: ZONE_WORLD_W / 2,      // Start centered
    y: ZONE_WORLD_H * 0.3,    // Upper third
    vx: 0, vy: 0,
    energy: 100,
    maxEnergy: 100,
    health: 100,
    beamActive: false,
    beamTarget: null,
    hoverOffset: random() * Math.PI * 2,
    width: 30,
    height: 16
}
```

**Movement** (from AI inputs):
```
speed = 100 px/s (horizontal), 70 px/s (vertical)

if (inputs.ArrowLeft) ufo.vx = -speed
else if (inputs.ArrowRight) ufo.vx = speed
else ufo.vx *= 0.85  // Friction

// Vertical: hover in upper half
ufo.y = ZONE_WORLD_H * 0.3 + sin(time + hoverOffset) * 3  // Gentle float

// Clamp to zone bounds
ufo.x = clamp(ufo.x, 15, ZONE_WORLD_W - 15)
ufo.x += ufo.vx * dt
```

**Beam Mechanics**:
```
BEAM_ENERGY_DRAIN = 20    // Per second while beaming
BEAM_ENERGY_RECHARGE = 14 // Per second when not beaming
BEAM_RANGE = ZONE_WORLD_H * 0.7   // Vertical reach
BEAM_WIDTH_ANGLE = 0.3    // Radians (cone half-angle)

if (inputs.Space && ufo.energy > 5) {
    ufo.beamActive = true
    ufo.energy -= BEAM_ENERGY_DRAIN * dt

    // Find nearest target below UFO within cone
    bestTarget = null
    bestDist = Infinity
    for (target of zone.targets) {
        if (target.y > ufo.y && target.alive && !target.beingAbducted) {
            dist = distance(ufo, target)
            angle = abs(atan2(target.x - ufo.x, target.y - ufo.y))
            if (dist < BEAM_RANGE && angle < BEAM_WIDTH_ANGLE && dist < bestDist) {
                bestTarget = target
                bestDist = dist
            }
        }
    }

    if (bestTarget) {
        ufo.beamTarget = bestTarget
        bestTarget.beingAbducted = true
        bestTarget.abductionProgress += dt * (1.0 / bestTarget.weight)
    }
} else {
    ufo.beamActive = false
    ufo.beamTarget = null
    ufo.energy = min(ufo.maxEnergy, ufo.energy + BEAM_ENERGY_RECHARGE * dt)
}
```

### Collision System

**Projectile -> UFO**:
```
for (proj of zone.projectiles) {
    if (abs(proj.x - ufo.x) < ufo.width/2 && abs(proj.y - ufo.y) < ufo.height/2) {
        ufo.health -= proj.damage
        proj.alive = false
        // Spawn damage particles
        spawnZoneParticles(zone, proj.x, proj.y, '#f44', 5)
    }
}
```

**UFO health at 0**: UFO respawns after 3 seconds at zone center. No permanent death in first slice.

### Drift Timer System

```
DRIFT_BASE_TIME = 25      // Seconds before decay starts
DRIFT_PENALTY = 0.05      // 5% performance reduction per drift level
DRIFT_RECOVERY_RATE = 1   // Recover 1 drift level per 3 seconds of focus

function zoneUpdateDrift(zone, dt, focused) {
    if (focused) {
        // Reset drift timer
        zone.driftTimer = DRIFT_BASE_TIME;
        // Recover drift level
        if (zone.driftLevel > 0) {
            zone.driftRecoverTimer = (zone.driftRecoverTimer || 0) + dt;
            if (zone.driftRecoverTimer >= 3.0) {
                zone.driftLevel = max(0, zone.driftLevel - 1);
                zone.driftRecoverTimer = 0;
            }
        }
    } else {
        zone.driftTimer -= dt;
        if (zone.driftTimer <= 0) {
            zone.driftTimer = 0;
            zone.driftAccumulator = (zone.driftAccumulator || 0) + dt;
            if (zone.driftAccumulator >= 1.0) {
                zone.driftLevel = min(4, zone.driftLevel + 1);
                zone.driftAccumulator = 0;
            }
        }
    }
}
```

**Effect of drift on crew**: `effectiveReckless = crew.traits.reckless * (1 - driftLevel * DRIFT_PENALTY)`. Higher drift = crew performs worse (slower decisions, more mistakes).

### Zone Health Score

```
function computeZoneHealth(zone) {
    const quotaFactor = zone.quota.current / zone.quota.target;  // 0.0 - 1.0+
    const energyFactor = zone.crewUfo.energy / zone.crewUfo.maxEnergy;
    const healthFactor = zone.crewUfo.health / 100;
    const driftFactor = 1 - zone.driftLevel * 0.15;

    zone.healthScore = clamp(
        quotaFactor * 0.4 + energyFactor * 0.2 + healthFactor * 0.2 + driftFactor * 0.2,
        0, 1
    );

    // Determine state from health score
    if (zone.healthScore >= 0.7) zone.state = 'stable';
    else if (zone.healthScore >= 0.4) zone.state = 'stressed';
    else if (zone.healthScore >= 0.15) zone.state = 'crisis';
    else zone.state = 'emergency';
}
```

---

## II. CREW AI SYSTEM

### Decision Cycle

The AI does NOT make decisions every frame. It recalculates every `decisionDelay` seconds and holds the decision until the next cycle.

```
decisionDelay:
  Reckless (>0.6):   200ms  (fast reactions, impulsive)
  Balanced (0.4-0.6): 350ms  (moderate)
  Cautious (<0.4):   500ms  (slow, deliberate)
```

### Decision Algorithm

```
function getInputs(zone) {
    const r = this.effectiveReckless;  // Trait + fleet order modifier
    const inputs = { ArrowLeft: false, ArrowRight: false, Space: false };
    const ufo = zone.crewUfo;

    // 1. Find best target
    const target = findBestTarget(zone, r);

    // 2. Assess threat
    const threat = findNearestThreat(zone);
    const dangerLevel = threat ? 1 - (distTo(threat, ufo) / ZONE_WORLD_W) : 0;

    // 3. Movement decision
    if (target) {
        const targetDir = sign(target.x - ufo.x);
        if (dangerLevel > 0.6 && r < 0.5) {
            // Cautious: evade instead of pursue
            inputs.ArrowLeft = threat.x > ufo.x;
            inputs.ArrowRight = threat.x < ufo.x;
        } else {
            // Move toward target
            inputs.ArrowLeft = targetDir < 0;
            inputs.ArrowRight = targetDir > 0;
        }
    }

    // 4. Beam decision
    const energyThreshold = r > 0.6 ? 0.15 :
                            r < 0.4 ? 0.50 : 0.30;
    if (ufo.energy / ufo.maxEnergy > energyThreshold) {
        inputs.Space = hasTargetInBeamRange(zone, ufo);
    }

    // 5. Mistake check (10% chance per cycle)
    if (random() < this.mistakeChance) {
        applyMistake(inputs);
    }

    return inputs;
}
```

### Mistake Types

```
function applyMistake(inputs) {
    const type = random();
    if (type < 0.33) {
        // Wrong direction for 1 cycle
        inputs.ArrowLeft = !inputs.ArrowLeft;
        inputs.ArrowRight = !inputs.ArrowRight;
    } else if (type < 0.66) {
        // Miss a beam opportunity
        inputs.Space = false;
    } else {
        // Freeze (no movement for 1 cycle)
        inputs.ArrowLeft = false;
        inputs.ArrowRight = false;
    }
}
```

### Fleet Order Modifiers

| Order | Effect on `effectiveReckless` | Description |
|-------|-------------------------------|-------------|
| defensive | `reckless - 0.2` (clamped 0-1) | Prioritize survival, conservative beam usage |
| balanced | No change | Use base trait values |
| harvest | `reckless + 0.2` (clamped 0-1) | Prioritize abductions, aggressive targeting |

### Performance Modifier

Crew performance is a composite of morale, stamina, and trait effectiveness:

```
getPerformanceModifier() {
    const moraleFactor = 0.5 + this.morale * 0.5;      // 0.5 - 1.0
    const staminaFactor = 0.6 + this.stamina * 0.4;    // 0.6 - 1.0
    return moraleFactor * staminaFactor;
}
```

This modifier affects:
- `mistakeChance`: base 10% / performanceModifier (worse performance = more mistakes)
- `decisionDelay`: base delay / performanceModifier (worse = slower reactions)

---

## III. QUOTA SYSTEM

### Target Band System

The quota is not a fixed ratchet. It uses a rolling 3-wave average with temporary surges and recovery waves.

### Base Quota Calculation

```
BASE_QUOTA = 10   // Abductions per zone per wave (first slice)

function getQuotaTarget(commandWave) {
    // 1. Base scales slightly with wave
    const waveScaling = 1 + commandWave * 0.02;  // +2% per wave

    // 2. Rolling 3-wave average (if enough history)
    let rollingAvg = BASE_QUOTA;
    if (this.quotaHistory.length >= 3) {
        const last3 = this.quotaHistory.slice(-3);
        rollingAvg = last3.reduce((a, b) => a + b, 0) / 3;
    }

    // 3. Target band: midpoint between base and rolling avg
    let target = (BASE_QUOTA * waveScaling + rollingAvg) / 2;

    // 4. Surge check: if player exceeded quota last wave
    if (this.quotaHistory.length > 0) {
        const lastResult = this.quotaHistory[this.quotaHistory.length - 1];
        if (lastResult > target * 1.2) {
            // Temporary surge: +15% for 2 waves
            this.surgeWavesRemaining = (this.surgeWavesRemaining || 0);
            if (this.surgeWavesRemaining <= 0) {
                this.surgeWavesRemaining = 2;
                this.surgeAmount = 0.15;
            }
        }
    }

    if (this.surgeWavesRemaining > 0) {
        target *= (1 + this.surgeAmount);
        this.surgeWavesRemaining--;
    }

    // 5. Recovery wave: every 5 waves, quota drops 20%
    if (commandWave > 0 && commandWave % 5 === 0) {
        target *= 0.8;
    }

    // 6. Consecutive miss penalty: NOT a quota increase
    //    Instead: tank fire rate +20% per consecutive miss
    //    (Applied in zone simulation, not here)

    return Math.round(target);
}
```

### Quota Performance Evaluation

```
function evaluateQuotaPerformance(zoneResults) {
    let totalAbductions = 0;
    let totalTarget = 0;

    for (const result of zoneResults) {
        totalAbductions += result.abductions;
        totalTarget += result.quotaTarget;
    }

    const overall = totalAbductions / totalTarget;

    if (overall >= 1.2) return 'exceeded';    // 120%+
    if (overall >= 0.8) return 'met';          // 80-119%
    return 'missed';                           // Below 80%
}
```

### Consecutive Miss Tracking

```
if (performance === 'missed') {
    this.consecutiveMisses++;
} else {
    this.consecutiveMisses = 0;
}

// Effect: tank fire rate multiplier in all zones
tankFireRateMultiplier = 1 + this.consecutiveMisses * 0.2;
// 0 misses: 1.0x, 1 miss: 1.2x, 2 misses: 1.4x, etc.
```

---

## IV. DIRECTOR SYSTEM

### Approval Rating

```
Range: 0 - 100
Start: 50

Mood thresholds:
  0-25:   'furious'     (red eye glow, fast portrait shake)
  26-45:  'displeased'  (orange eye glow, occasional shake)
  46-70:  'neutral'     (gray eye glow, stable)
  71-100: 'satisfied'   (amber eye glow, rare -- earned through excellence)
```

### Approval Changes

| Event | Approval Change |
|-------|----------------|
| Quota exceeded (all zones) | +5 |
| Quota met | +2 |
| Quota missed | -5 |
| Quota catastrophically missed (<50%) | -10 |
| Emergency Override used | -5 |
| Report card: Spin response (good result) | +1 |
| Report card: Spin response (bad result) | -2 |
| Report card: Accountability (good result) | +3 |
| Report card: Accountability (bad result) | +5 (Director respects honesty) |
| Report card: Deflect (believed) | 0 |
| Report card: Deflect (not believed) | -3 |
| Recovery wave (automatic) | +3 (break from pressure) |

### Report Card Generation

```javascript
function generateReportCard(zoneResults) {
    const overall = evaluateQuotaPerformance(zoneResults);
    const overallPct = totalAbductions / totalTarget * 100;

    // Select dialogue
    const dialoguePool = DIRECTOR_DIALOGUES.reportCard[
        overall === 'exceeded' ? 'quotaExceeded' :
        overall === 'met' ? 'quotaMet' : 'quotaMissed'
    ];
    const dialogue = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];

    // Generate 3 response options
    const options = [
        {
            label: this.getSpinOption(zoneResults, overall),
            type: 'spin',
            approvalDelta: overall === 'missed' ? -2 : 1
        },
        {
            label: this.getAccountabilityOption(overall),
            type: 'accountability',
            approvalDelta: overall === 'missed' ? 5 : 3  // Honesty on bad results = respect
        },
        {
            label: this.getDeflectOption(zoneResults),
            type: 'deflect',
            approvalDelta: Math.random() < 0.4 ? 0 : -3  // 40% chance Director buys it
        }
    ];

    return {
        commandWave: this.currentWave,
        zoneResults: zoneResults,
        overallPerformance: overall,
        overallPercent: overallPct,
        dialogue: dialogue,
        options: options,
        mood: this.getMood()
    };
}
```

### Dialogue Response Options (First Slice)

**When quota MET**:
```
Spin:           "The team executed flawlessly. Just as I planned."
Accountability: "We hit targets. Room for improvement in efficiency."
Deflect:        "Environmental conditions were favorable this cycle."
```

**When quota MISSED**:
```
Spin:           "We had equipment difficulties but we're trending up."
Accountability: "I take full responsibility. I'm adjusting assignments."
Deflect:        "Zone B had unprecedented tank activity this wave."
```

**When quota EXCEEDED**:
```
Spin:           "This is what happens when you invest in your people."
Accountability: "Strong performance. I'll push for more next wave."
Deflect:        "Favorable target density. We capitalized effectively."
```

### Director Transmissions

**Wave-start transmissions** (random, 1 per wave):
```javascript
const WAVE_START_LINES = [
    "Another wave, Commander. Don't waste my time.",
    "The Board is watching. Produce results.",
    "Your quota this wave: {quota}. Meet it.",
    "I expect improvement from Zone {weakestZone}.",
    "Do not disappoint me."
];
```

**Override disapproval lines**:
```javascript
const OVERRIDE_LINES = [
    "I didn't promote you to play pilot, Commander.",
    "Manual intervention is a sign of poor delegation.",
    "Your crew should handle this. That's why they're there.",
    "Every override costs us both. Remember that."
];
```

---

## V. CREW SYSTEM

### Crew Generation (First Slice)

At command phase init, generate exactly 2 crew members:

```javascript
function generateStartingCrew() {
    return [
        new CrewMember({
            name: randomName(),
            traits: { reckless: 0.65 + random() * 0.15 },   // 0.65-0.80 (reckless-leaning)
            appearance: randomAppearance()
        }),
        new CrewMember({
            name: randomName(),
            traits: { reckless: 0.20 + random() * 0.15 },   // 0.20-0.35 (cautious-leaning)
            appearance: randomAppearance()
        })
    ];
}
```

### Crew Names Pool

```javascript
const CREW_NAMES = [
    'KRIX', 'NURP', 'ZYLK', 'BLORT', 'VRENN', 'QUIX', 'DRAAL',
    'SLYTH', 'MORX', 'FENN', 'GLYX', 'THRAK', 'PRYNN', 'VASK',
    'DULK', 'RESH', 'ORNN', 'TRYX', 'KALM', 'ZURR', 'PLEX',
    'NEBB', 'WRIX', 'GORN', 'FLUX', 'SKAB', 'DREL', 'MUXX'
];
```

### Morale System

```
MORALE_START = 0.7
MORALE_MIN = 0.0
MORALE_MAX = 1.0

// Per-wave morale changes (applied during startNextWave)
moraleChange = 0

// Positive influences
if (zone.quotaMet) moraleChange += 0.05        // Hit quota
if (zone.quotaExceeded) moraleChange += 0.1    // Exceeded quota
if (crewOnBench) moraleChange += 0.08          // Rest on bench

// Negative influences
if (zone.quotaMissed) moraleChange -= 0.08     // Missed quota
if (consecutiveWavesAssigned > 3) moraleChange -= 0.05  // Overworked
if (zone.state === 'crisis') moraleChange -= 0.05       // Stressful zone

crew.morale = clamp(crew.morale + moraleChange, MORALE_MIN, MORALE_MAX)
```

### Stamina System

```
STAMINA_DRAIN = 0.1   // Per wave of active assignment
STAMINA_BENCH_RECOVERY = 0.25  // Per wave on bench

// Applied during startNextWave
if (crew.assignedZone) {
    crew.stamina = max(0, crew.stamina - STAMINA_DRAIN);
} else {
    crew.stamina = min(1, crew.stamina + STAMINA_BENCH_RECOVERY);
}
```

Stamina affects performance modifier (see Crew AI section). At stamina 0: crew is "burned out" -- morale drops to 0, visual static overlay, severe performance penalty.

### Crew Assignment Rules

```
- A crew member can be assigned to at most 1 zone.
- A zone can have at most 1 crew member.
- Unassigned crew members are "on bench" (roster visible, recovering stamina).
- Swapping: during between-wave management, player can swap crew between zones.
- First slice: no hiring, no firing. Just 2 crew members, can swap zones.
```

### Performance Ring Buffer

```javascript
// 20-sample ring buffer for performance sparkline
performance = new Float32Array(20);  // Filled with 0
performanceIdx = 0;

function recordPerformance(score) {
    this.performance[this.performanceIdx] = score;
    this.performanceIdx = (this.performanceIdx + 1) % 20;
}

function getPerformanceTrend() {
    const recent5 = getLastN(5);
    const previous5 = getLastN(10).slice(0, 5);
    const recentAvg = avg(recent5);
    const previousAvg = avg(previous5);

    if (recentAvg > previousAvg + 0.1) return 'improving';
    if (recentAvg < previousAvg - 0.1) return 'declining';
    return 'stable';
}
```

---

## VI. RESOURCE PIPELINE

### Energy Pool (First Slice)

Each zone has its own energy pool. The shared resource pipeline allows transferring energy between zones.

```
Zone energy:    100 max per zone (same as Phase 1)
Transfer loss:  10% (configurable)
Transfer delay: 3 seconds (configurable)
Min transfer:   10 units
Max transfer:   50 units per transaction
```

### Transfer Flow

```
1. Player presses 'R' to open resource routing menu
   (or hotkey: Shift+1 = route TO zone A, Shift+2 = route TO zone B)
2. Select source zone and amount
3. Immediate deduction from source zone energy
4. Transfer object created with delay timer
5. After delay: credited to destination zone (minus transit loss)
6. Transfer particles visible between zone panels during transit
```

### Edge Cases

```
- Cannot transfer if source zone energy < 20 (safety floor)
- Cannot transfer more than source zone energy - 20
- Transfers in progress are NOT cancelable in first slice
- If destination zone is at max energy when transfer arrives, excess is lost
- Multiple simultaneous transfers are allowed
```

---

## VII. EMERGENCY OVERRIDE

### Activation Requirements

```
- overrideAvailable === true (resets each wave)
- Not already in override
- At least 1 zone exists
- Player presses 'O' key
```

### Override Flow

```
1. Player presses 'O'
2. If 2 zones: prompt zone selection (1/2). If 1 zone: auto-select.
3. Flash "EMERGENCY OVERRIDE" text
4. Zoom transition: 0.5s ease-in
5. Zone fills screen. Phase 1 controls activate.
   - Arrow keys move UFO directly
   - Space activates beam directly
   - Zone simulation continues (targets, tanks, projectiles)
6. 15-second countdown timer displayed prominently
7. At 3s remaining: red flash warning "RETURNING TO COMMAND"
8. At 0s: force end override
9. Player can also press 'O' again to end early
10. Zoom transition out: 0.5s ease-out
11. Director disapproval transmission triggers
12. director.updateApproval(-OVERRIDE_PENALTY)
13. overrideAvailable = false for rest of wave
```

### During Override

```
- CrewAI is suspended for the overridden zone
- Player's keyboard inputs drive the UFO directly
- Other zones continue on AI (and drift timers are NOT paused)
- Zone border changes to #0ff (override cyan)
- All command panels are hidden except a mini timer + energy bar
```

### Edge Cases

```
- If wave timer expires during override: override ends, wave ends
- If UFO is destroyed during override: respawn normally, override continues
- Cannot route resources during override (controls are locked to zone)
- Director disapproval is applied ONCE per override, not per second
```

---

## VIII. COMMAND PHASE STATE MACHINE

### Top-Level States (game.js `gameState`)

```
'PROMOTION_CINEMATIC' -> 'COMMAND' -> 'COMMAND_SUMMARY' -> 'COMMAND' -> ...
```

### Internal Sub-States (commandState.subState)

```
'BOOT'     -- Panel boot sequence playing. No player input except Skip.
'LIVE'     -- Normal wave gameplay. All inputs active.
'OVERRIDE' -- Emergency override active. Only zone controls + O to exit.
```

### State Transitions

```
PROMOTION_CINEMATIC:
  - On phase D completion: -> COMMAND (subState: BOOT)

COMMAND (subState: BOOT):
  - On boot completion: -> COMMAND (subState: LIVE)

COMMAND (subState: LIVE):
  - On 'O' key: -> COMMAND (subState: OVERRIDE)
  - On waveTimer <= 0: -> COMMAND_SUMMARY

COMMAND (subState: OVERRIDE):
  - On timer <= 0 or 'O' key: -> COMMAND (subState: LIVE)
  - On waveTimer <= 0: -> COMMAND (subState: LIVE) then -> COMMAND_SUMMARY

COMMAND_SUMMARY:
  - On report card phase complete + crew management confirmed:
    -> COMMAND (subState: BOOT) for next wave
```

---

## IX. WAVE LIFECYCLE

### Wave Start

```
1. Reset all zone transient state (targets, tanks, projectiles, particles, quota)
2. Update quota targets via director.getQuotaTarget(commandWave)
3. Spawn initial tanks per zone
4. Update crew morale and stamina
5. Set overrideAvailable = true
6. Reset waveTimer = WAVE_DURATION (60 seconds)
7. Start command boot sequence
8. Director wave-start transmission (random line)
```

### During Wave

```
Per frame (dt = ~16ms at 60fps):
1. Update boot (if subState === BOOT)
2. Update override (if subState === OVERRIDE)
3. For each zone: zoneUpdate(zone, dt, zone === selectedZone)
4. Update resource pipeline
5. Countdown waveTimer
6. Handle player input (zone selection, fleet orders, override, resource routing)
7. Update Director transmission display (if active)
```

### Wave End

```
1. For each zone: generateWaveReport()
   - Report includes: abductions, quotaMet (bool), quotaPercent, damagesTaken, energyRemaining
2. Aggregate results
3. Update global score (from zone performance)
4. Update global bioMatter (from zone abductions)
5. Update global harvestCount (cumulative abductions)
6. director.generateReportCard(zoneReports)
7. Record quota history
8. commandWave++
9. Transition to COMMAND_SUMMARY
```

### Between Waves (COMMAND_SUMMARY)

```
Phase 1 - Report Card (mandatory):
  1. Show zone-by-zone results (staggered reveal)
  2. Director dialogue (typewriter)
  3. Player selects response (1/2/3)
  4. Apply approval change
  5. Director follow-up line

Phase 2 - Crew Management (optional, first slice):
  1. Show roster with assignments
  2. Player can swap crew between zones (press 'S')
  3. Player presses Enter/Space to start next wave
```

---

## X. COMMAND POINTS (CP)

### Earning CP (First Slice)

```
CP earned per wave:
  Quota exceeded:     2 CP
  Quota met:          1 CP
  Quota missed:       0 CP

  Bonus: All zones exceeded: +1 CP
  Bonus: Director satisfied: +1 CP per wave (rare)
```

### Spending CP (First Slice)

```
First slice: CP is tracked but NOT spendable.
The command tech tree is deferred to Slice 2.
CP accumulates and is displayed in CMD.STATUS bar.
Purpose: establish the "almost there" hook -- player sees CP growing toward future tech costs.
```

---

## XI. SCORE SYSTEM

### Phase 2 Scoring

Score continues from Phase 1. New score sources:

```
Per abduction (any zone): +10 points * target.bioValue
Per wave quota met:        +100 * (quotaPercent / 100)
Per wave quota exceeded:   +200 bonus
Per wave all zones stable: +50 bonus
Emergency override bonus:  +5 per abduction during override
```

Score is displayed in CMD.STATUS bar and carries into the persistent `score` global.

---

## XII. INPUT HANDLING

### Keyboard Controls (Command Phase)

| Key | Action | State Requirement |
|-----|--------|-------------------|
| Tab | Cycle selected zone | LIVE |
| 1 | Select Zone A | LIVE |
| 2 | Select Zone B | LIVE |
| D | Set fleet order: DEFENSIVE (selected zone) | LIVE |
| H | Set fleet order: HARVEST (selected zone) | LIVE |
| B | Set fleet order: BALANCED (selected zone) | LIVE |
| O | Toggle Emergency Override | LIVE or OVERRIDE |
| R | Open resource routing (TODO: simplified for first slice) | LIVE |
| Arrows | Move UFO (during override only) | OVERRIDE |
| Space | Activate beam (during override only) | OVERRIDE |
| 1/2/3 | Select report card response | COMMAND_SUMMARY (report card phase) |
| S | Swap crew assignments | COMMAND_SUMMARY (management phase) |
| Enter/Space | Confirm / Start next wave | COMMAND_SUMMARY |

### Selected Zone Visual Indicator

The currently selected zone has:
- Brighter border (1.2x alpha)
- Gold highlight line at bottom of zone panel (2px, #d4a017)
- Drift timer is paused for this zone (player is "focusing attention")

---

## XIII. FIRST SLICE SCOPE BOUNDARY

### Included in First Slice

| System | Scope |
|--------|-------|
| Zone count | Exactly 2 |
| Crew members | Exactly 2 (1 reckless-leaning, 1 cautious-leaning) |
| Trait axis | Single: reckless (0-1), cautious = 1-reckless |
| Zone simulation | Targets (5 types), tanks (1-2 per zone), shells, no missiles |
| Beam system | Full (energy drain/recharge, cone targeting, abduction progress) |
| Quota system | Target band with rolling 3-wave avg, surge, recovery |
| Director | Scripted mood (approval-based), report cards, 3 dialogue options |
| Emergency Override | 1 per wave, 15 seconds, Director disapproval |
| Resource routing | Energy transfers only, fixed transit loss and delay |
| Between-wave | Report card + crew swap |
| Boot sequence | Gold-themed command boot between waves |
| Promotion cinematic | 10-second 4-phase sequence |
| CP tracking | Displayed, not spendable |
| Score | Continues from Phase 1 |

### Excluded from First Slice

| System | Reason |
|--------|--------|
| Training wave | Deferred to Slice 2 |
| Interview/recruitment | Deferred to Slice 2 |
| Director's Kid | Deferred to Slice 2 |
| Dynamic Director mood | Scripted is sufficient for testing |
| Command tech tree | CP tracked but not spendable |
| Policy presets | Deferred to Slice 2 |
| Additional traits | One axis is enough to prove AI differentiation |
| 4-zone layout | Deferred |
| 16-zone heatmap | Deferred |
| Crisis system | No special crisis events (just natural quota pressure) |
| Coaching | Deferred |
| Stamina-driven rotation | Stamina tracked but no forced bench in first slice |
| Active Scan | Drift uses focus-based reset for simplicity |

---

*This document contains every formula, threshold, and edge case needed to implement the Command Phase game systems. An agent building any system module should find complete specifications here without needing to consult game.js or other input documents.*
