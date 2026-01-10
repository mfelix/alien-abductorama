---
date: 2025-12-29T18:07:22-05:00
researcher: mfelix
git_commit: N/A (not a git repository)
branch: N/A
repository: alien-abductorama
topic: "Powerup Mechanic Design for Alien Abductorama"
tags: [research, codebase, powerups, game-mechanics, feature-design]
status: complete
last_updated: 2025-12-29
last_updated_by: mfelix
last_updated_note: "Added follow-up research for collection types, stacking, and procedural rendering"
---

# Research: Powerup Mechanic Design for Alien Abductorama

**Date**: 2025-12-29 18:07:22 EST
**Researcher**: mfelix
**Git Commit**: N/A (not a git repository)
**Branch**: N/A
**Repository**: alien-abductorama

## Research Question

Design a powerup mechanic system for the game, identifying implementation patterns from the existing codebase and proposing specific powerup types that fit the game's mechanics.

## Summary

Alien Abductorama is an arcade-style UFO abduction game built with vanilla JavaScript and HTML5 Canvas. The player controls a UFO that abducts ground targets using a tractor beam while defending against enemy tanks. The game features wave-based progression, a combo scoring system, and resource management (health and energy).

After analyzing the codebase, six powerups were selected for implementation:
1. **Health Pack** - Restore health
2. **Rapid Abduct** - Faster abduction speed
3. **Shield** - Block incoming projectiles
4. **Energy Surge** - Unlimited beam energy temporarily
5. **Wide Beam** - Expanded beam width for easier targeting

The existing codebase provides strong patterns for entity management, spawning, timers, and visual feedback that can be leveraged for powerup implementation.

## Detailed Findings

### Game Architecture Overview

**Tech Stack**: Vanilla JavaScript, HTML5 Canvas API, Web Audio API
**Main Source File**: `/js/game.js` (single file containing all game logic)
**No external dependencies** - fully self-contained

**Core Game Loop** (`js/game.js:2226-2254`):
- Uses `requestAnimationFrame` with delta time calculation
- State machine: `TITLE`, `PLAYING`, `GAME_OVER`, `WAVE_TRANSITION`
- Separate `update(dt)` and `render()` calls during gameplay

### Existing Systems Relevant to Powerups

#### 1. Entity System Pattern

All game entities follow a consistent class-based pattern:

```javascript
class EntityName {
    constructor(x, ...) {
        this.x = x;
        this.y = ...;
        this.width = ...;
        this.height = ...;
        this.alive = true;
        // Entity-specific properties
    }

    update(dt) {
        if (!this.alive) return;
        // Update logic
    }

    render() {
        if (!this.alive) return;
        // Render logic
    }
}
```

**Existing entity classes**:
- `UFO` (`js/game.js:741-1072`) - Player
- `Target` (`js/game.js:459-648`) - Abductable targets
- `Tank` (`js/game.js:1078-1310`) - Enemy tanks
- `HeavyTank` (`js/game.js:1532-1786`) - Heavy enemy variant
- `Projectile` (`js/game.js:1316-1424`) - Tank bullets/missiles
- `Particle` (`js/game.js:1433-1483`) - Visual effects

#### 2. Spawning System

**Target spawning** (`js/game.js:693-735`):
- Timer-based: `targetSpawnTimer` counts down, spawns when <= 0
- Random interval: 2-4 seconds (`CONFIG.TARGET_SPAWN_INTERVAL`)
- Weighted random type selection via `getRandomTargetType()`
- Position validation to avoid clustering (80px minimum spacing)
- Max on-screen limit: 5 (`CONFIG.TARGET_MAX_ON_SCREEN`)

```javascript
function spawnTarget() {
    if (targets.length >= CONFIG.TARGET_MAX_ON_SCREEN) return;
    const type = getRandomTargetType();
    // Find valid spawn position...
    targets.push(new Target(type, x));
}
```

#### 3. Collection/Pickup Mechanic

The abduction system (`js/game.js:506-556`) demonstrates how pickups work:
- Player activates beam (spacebar)
- Beam detects targets in cone area
- Target rises toward UFO over time (based on weight)
- On completion: awards points, heals UFO, increments counter
- Can be interrupted (drops target back)

#### 4. Timer-Based Effects

Multiple systems use duration-based effects:
- Energy drain: `this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt` (`js/game.js:777`)
- Wave timer: `waveTimer -= dt` (`js/game.js:2296`)
- Particle lifetime: `this.lifetime -= dt` (`js/game.js:1456`)

#### 5. Visual Feedback Systems

**Floating text** (`js/game.js:654-687`):
```javascript
function createFloatingText(x, y, text, color) {
    floatingTexts.push({
        x, y, text, color,
        lifetime: 1.0,
        vy: -50
    });
}
```

**Screen effects** (`js/game.js:2329-2393`):
- Screen shake: `screenShake` variable with decay
- Damage flash: `damageFlash` variable with red overlay

**Particle explosions** (`js/game.js:1485-1513`):
- `createExplosion(x, y, size)` - Creates particle burst
- Sizes: 'small', 'medium', 'large'

#### 6. Configuration Pattern

All tunable values in `CONFIG` object (`js/game.js:6-71`):
```javascript
const CONFIG = {
    UFO_SPEED: 400,
    UFO_START_HEALTH: 100,
    ENERGY_MAX: 100,
    ENERGY_DRAIN_RATE: 20,
    // ...etc
};
```

#### 7. Global State Arrays

Entity collections (`js/game.js:365-369`):
```javascript
let ufo = null;
let targets = [];
let tanks = [];
let projectiles = [];
let particles = [];
```

Additional: `heavyTanks` (line 1792), `floatingTexts` (line 654)

### UFO Properties Available for Powerup Effects

From `UFO` class (`js/game.js:741-755`):

| Property | Default | Description |
|----------|---------|-------------|
| `health` | 100 | Current health points |
| `energy` | 100 | Beam energy (drains when active) |
| `beamActive` | false | Whether beam is currently on |
| `beamTarget` | null | Currently locked target |

From `CONFIG`:

| Config Key | Default | Description |
|------------|---------|-------------|
| `UFO_SPEED` | 400 | Movement speed (px/sec) |
| `ENERGY_DRAIN_RATE` | 20 | Energy drain per second |
| `ENERGY_RECHARGE_RATE` | 10 | Energy regen per second |
| `TARGET_WEIGHT_MULTIPLIER` | 0.5 | Seconds per weight unit for abduction |

### Beam Collision Detection

The beam uses cone/trapezoid collision (`js/game.js:848-916`):

```javascript
findTargetInBeam() {
    const beamTopWidth = 30;       // Width at UFO
    const beamBottomWidth = 225;   // Width at ground

    // Interpolate width at target's Y position
    const t = (targetCenterY - beamTop) / beamHeight;
    const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;

    // Check if target center is within beam edges
    if (targetCenterX >= beamLeftEdge && targetCenterX <= beamRightEdge) {
        return target;
    }
}
```

---

## Proposed Powerup System Design

### Powerup Entity Class

```javascript
class Powerup {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.alive = true;
        this.lifetime = 10; // Despawn after 10 seconds
        this.bobOffset = 0;
        this.bobTime = Math.random() * Math.PI * 2;
    }

    update(dt) {
        if (!this.alive) return;

        // Floating animation
        this.bobTime += dt * 3;
        this.bobOffset = Math.sin(this.bobTime) * 5;

        // Lifetime countdown
        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.alive = false;
        }

        // Collision with UFO
        if (this.checkCollisionWithUFO()) {
            this.collect();
        }
    }

    checkCollisionWithUFO() {
        // Circle-circle collision
        const dx = this.x - ufo.x;
        const dy = this.y - ufo.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ufo.width / 2 + this.width / 2);
    }

    collect() {
        this.alive = false;
        applyPowerup(this.type);
        SFX.powerupCollect();
        createFloatingText(this.x, this.y, POWERUP_CONFIG[this.type].name, '#0ff');
        createExplosion(this.x, this.y, 'small');
    }

    render() {
        if (!this.alive) return;
        const drawY = this.y + this.bobOffset;
        // Render powerup icon with glow effect
        // Blink when about to expire (lifetime < 3)
    }
}
```

### Powerup Configuration

```javascript
const POWERUP_CONFIG = {
    health_pack: {
        name: 'HEALTH+',
        color: '#0f0',
        duration: 0,        // Instant effect
        spawnWeight: 0.25
    },
    rapid_abduct: {
        name: 'RAPID BEAM',
        color: '#ff0',
        duration: 15,
        spawnWeight: 0.20
    },
    shield: {
        name: 'SHIELD',
        color: '#0af',
        duration: 0,        // Charge-based (3 hits)
        charges: 3,
        spawnWeight: 0.20
    },
    energy_surge: {
        name: 'ENERGY SURGE',
        color: '#f0f',
        duration: 10,
        spawnWeight: 0.15
    },
    wide_beam: {
        name: 'WIDE BEAM',
        color: '#fa0',
        duration: 12,
        spawnWeight: 0.20
    }
};
```

### Powerup State Management

```javascript
// Add to global state (near line 365)
let powerups = [];
let powerupSpawnTimer = 0;
let activePowerups = {
    rapid_abduct: { active: false, timer: 0 },
    shield: { active: false, charges: 0 },
    energy_surge: { active: false, timer: 0 },
    wide_beam: { active: false, timer: 0 }
};
```

### Powerup Effect Implementations

#### 1. Health Pack (Instant)

**Effect**: Restore 25 health points
**Implementation location**: `applyPowerup()` function

```javascript
case 'health_pack':
    ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + 25);
    createFloatingText(ufo.x, ufo.y - 50, '+25 HP', '#0f0');
    break;
```

#### 2. Rapid Abduct (Duration: 15s)

**Effect**: 2x faster abduction speed (halve weight multiplier)
**Implementation location**: `Target.update()` at line 518

```javascript
// Current code:
const riseSpeed = (this.groundY - targetY) / this.abductionTime;

// Modified:
const speedMultiplier = activePowerups.rapid_abduct.active ? 2 : 1;
const riseSpeed = (this.groundY - targetY) / this.abductionTime * speedMultiplier;
```

Also modify abduction progress (`js/game.js:528`):
```javascript
// Current:
this.abductionProgress += dt;

// Modified:
const progressMultiplier = activePowerups.rapid_abduct.active ? 2 : 1;
this.abductionProgress += dt * progressMultiplier;
```

#### 3. Shield (Charge-based: 3 hits)

**Effect**: Block next 3 projectile hits
**Implementation location**: `Projectile.update()` collision check at line 1351

```javascript
// Current code:
if (ufo && this.checkCollisionWithUFO()) {
    this.alive = false;
    ufo.health -= this.damage;
    // ... effects
}

// Modified:
if (ufo && this.checkCollisionWithUFO()) {
    this.alive = false;

    if (activePowerups.shield.active && activePowerups.shield.charges > 0) {
        // Shield absorbs hit
        activePowerups.shield.charges--;
        SFX.shieldHit();
        createFloatingText(ufo.x, ufo.y, 'BLOCKED!', '#0af');

        if (activePowerups.shield.charges <= 0) {
            activePowerups.shield.active = false;
            SFX.shieldBreak();
        }
    } else {
        // Normal damage
        ufo.health -= this.damage;
        // ... existing damage effects
    }
}
```

**Visual**: Render shield bubble around UFO when active (`UFO.render()`):
```javascript
if (activePowerups.shield.active) {
    ctx.strokeStyle = `rgba(0, 170, 255, ${0.5 + Math.sin(Date.now() / 200) * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // Show remaining charges
    ctx.fillStyle = '#0af';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${activePowerups.shield.charges}`, this.x, this.y - this.height / 2 - 20);
}
```

#### 4. Energy Surge (Duration: 10s)

**Effect**: Infinite beam energy (no drain)
**Implementation location**: `UFO.update()` energy drain at line 777

```javascript
// Current code:
this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;

// Modified:
if (!activePowerups.energy_surge.active) {
    this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;
}
```

Also bypass minimum energy check (`js/game.js:767`):
```javascript
// Current:
const canFireBeam = this.energy >= CONFIG.ENERGY_MIN_TO_FIRE;

// Modified:
const canFireBeam = activePowerups.energy_surge.active ||
                    this.energy >= CONFIG.ENERGY_MIN_TO_FIRE;
```

**Visual**: Energy bar glows/pulses magenta when active.

#### 5. Wide Beam (Duration: 12s)

**Effect**: Double beam width (easier targeting)
**Implementation location**: `UFO.findTargetInBeam()` at line 850

```javascript
// Current code:
const beamTopWidth = 30;
const beamBottomWidth = 225;

// Modified:
const widthMultiplier = activePowerups.wide_beam.active ? 2 : 1;
const beamTopWidth = 30 * widthMultiplier;
const beamBottomWidth = 225 * widthMultiplier;
```

Also update beam rendering (`UFO.renderBeam()` around line 943):
```javascript
const widthMultiplier = activePowerups.wide_beam.active ? 2 : 1;
const topWidth = 30 * widthMultiplier;
const bottomWidth = 225 * widthMultiplier;
```

**Visual**: Beam appears wider with orange tint when active.

### Spawning System

```javascript
// Configuration
const POWERUP_SPAWN_INTERVAL = [15, 25]; // seconds between spawns
const POWERUP_MAX_ON_SCREEN = 2;

function spawnPowerup() {
    if (powerups.length >= POWERUP_MAX_ON_SCREEN) return;

    const type = getRandomPowerupType();
    const margin = 100;
    const x = margin + Math.random() * (canvas.width - margin * 2);
    const y = canvas.height * 0.4 + Math.random() * (canvas.height * 0.3);
    // Spawn in middle area of screen (40%-70% height)

    powerups.push(new Powerup(type, x, y));
    SFX.powerupSpawn();
}

function getRandomPowerupType() {
    const types = Object.entries(POWERUP_CONFIG);
    const totalWeight = types.reduce((sum, [_, cfg]) => sum + cfg.spawnWeight, 0);
    let rand = Math.random() * totalWeight;

    for (const [type, cfg] of types) {
        rand -= cfg.spawnWeight;
        if (rand <= 0) return type;
    }
    return 'health_pack'; // fallback
}

function updatePowerupSpawning(dt) {
    if (gameState !== 'PLAYING') return;

    powerupSpawnTimer -= dt;
    if (powerupSpawnTimer <= 0) {
        spawnPowerup();
        const [min, max] = POWERUP_SPAWN_INTERVAL;
        powerupSpawnTimer = min + Math.random() * (max - min);
    }
}
```

### Duration Timer Updates

Add to `update(dt)` function (`js/game.js:2256`):

```javascript
// Update powerup timers
for (const [key, state] of Object.entries(activePowerups)) {
    if (state.active && state.timer > 0) {
        state.timer -= dt;
        if (state.timer <= 0) {
            state.active = false;
            state.timer = 0;
            createFloatingText(ufo.x, ufo.y - 60,
                `${POWERUP_CONFIG[key].name} ENDED`, '#888');
        }
    }
}

// Update powerup entities
updatePowerupSpawning(dt);
for (const powerup of powerups) {
    powerup.update(dt);
}
powerups = powerups.filter(p => p.alive);
```

### UI Indicator

Display active powerup timers below the UFO or in corner:

```javascript
function renderActivePowerups() {
    let y = 120; // Below health/score UI
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';

    for (const [key, state] of Object.entries(activePowerups)) {
        if (state.active) {
            const cfg = POWERUP_CONFIG[key];
            ctx.fillStyle = cfg.color;

            if (state.timer > 0) {
                ctx.fillText(`${cfg.name}: ${state.timer.toFixed(1)}s`, 10, y);
            } else if (state.charges > 0) {
                ctx.fillText(`${cfg.name}: ${state.charges} hits`, 10, y);
            }
            y += 20;
        }
    }
}
```

### Reset on Game Start

Add to `startGame()` function (`js/game.js:1929`):

```javascript
// Reset powerup state
powerups = [];
powerupSpawnTimer = 10; // First powerup after 10 seconds
activePowerups = {
    rapid_abduct: { active: false, timer: 0 },
    shield: { active: false, charges: 0 },
    energy_surge: { active: false, timer: 0 },
    wide_beam: { active: false, timer: 0 }
};
```

---

## Code References

| Component | Location | Description |
|-----------|----------|-------------|
| CONFIG object | `js/game.js:6-71` | All tunable game constants |
| UFO class | `js/game.js:741-1072` | Player entity with health, energy, beam |
| UFO.update() | `js/game.js:757-845` | Movement, beam control, energy management |
| UFO.findTargetInBeam() | `js/game.js:848-916` | Cone collision detection |
| UFO.renderBeam() | `js/game.js:943-1038` | Beam visual rendering |
| Target class | `js/game.js:459-648` | Abductable entity |
| Target abduction logic | `js/game.js:506-556` | Rising animation, completion rewards |
| Projectile collision | `js/game.js:1351-1368` | Damage application to UFO |
| Entity arrays | `js/game.js:365-369` | Global state for entities |
| Target spawning | `js/game.js:693-735` | Timer-based spawn system |
| Floating text | `js/game.js:654-687` | Visual feedback system |
| Particle explosions | `js/game.js:1485-1513` | createExplosion() function |
| startGame() | `js/game.js:1929-1951` | Game initialization/reset |
| update() | `js/game.js:2256-2325` | Main update loop |
| render() | `js/game.js:2327-2394` | Main render loop |

## Architecture Documentation

### Entity Management Pattern
- Classes with `constructor()`, `update(dt)`, `render()` methods
- `alive` boolean flag for lifecycle management
- Arrays filtered each frame to remove dead entities

### State Machine
- String-based states: `'TITLE'`, `'PLAYING'`, `'GAME_OVER'`, `'WAVE_TRANSITION'`
- Switch statement in game loop for state-specific logic

### Timer Pattern
- Countdown timers: `timer -= dt; if (timer <= 0) { action(); reset(); }`
- Used for spawning, wave progression, particle lifetime

### Configuration Pattern
- All magic numbers in `CONFIG` object
- Easy to tune without searching code

## Implementation Checklist

- [ ] Add `POWERUP_CONFIG` to CONFIG section
- [ ] Create `Powerup` class
- [ ] Add `powerups` array and `activePowerups` state object
- [ ] Implement `spawnPowerup()` and `getRandomPowerupType()`
- [ ] Implement `applyPowerup()` function
- [ ] Modify `Target.update()` for rapid abduct effect
- [ ] Modify `Projectile.update()` for shield effect
- [ ] Modify `UFO.update()` for energy surge effect
- [ ] Modify `UFO.findTargetInBeam()` for wide beam effect
- [ ] Modify `UFO.renderBeam()` for wide beam visual
- [ ] Add shield visual to `UFO.render()`
- [ ] Add `renderActivePowerups()` UI function
- [ ] Add powerup updates to main `update()` function
- [ ] Add powerup renders to main `render()` function
- [ ] Reset powerup state in `startGame()`
- [ ] Add sound effects for powerup events
- [ ] (Optional) Add powerup sprites to assets

## Open Questions

1. ~~**Spawn location**: Should powerups spawn in the air (requiring UFO to fly to them) or on the ground (collectible via beam)?~~
   - **RESOLVED**: Both! Two collection types (see Follow-up Research below)

2. ~~**Stacking**: Can the same powerup be collected while already active?~~
   - **RESOLVED**: Yes, stacking with progress meter/timer for each

3. **Wave scaling**: Should powerup spawn rate increase in later waves?
   - *Suggestion*: Slightly faster spawns in later waves to offset difficulty

4. ~~**Visual assets**: Create sprites or use procedural rendering?~~
   - **RESOLVED**: Procedural rendering only (Canvas shapes with glow effects)

5. **Audio**: What sound effects are needed?
   - Powerup spawn (sparkle/chime)
   - Powerup collect (satisfying pickup sound)
   - Shield hit (deflection sound)
   - Shield break (shatter sound)
   - Powerup expire (subtle whoosh)

---

## Follow-up Research: 2025-12-29

### Design Decisions Finalized

#### 1. Two Powerup Collection Types

Powerups are divided into two categories based on how they're collected:

**Beamable Powerups** (spawn on ground, require beam to collect):
- Spawn at ground level like targets
- Require beam energy to collect (small amount, ~5 energy)
- Quick abduction time (0.5 seconds)
- Creates strategic choice: spend energy on powerup vs. targets

**Collidable Powerups** (spawn in air, UFO flies into them):
- Spawn in upper play area near UFO's flight zone
- Collected instantly on contact
- No energy cost
- Rewards positioning and awareness

| Powerup | Collection Type | Rationale |
|---------|-----------------|-----------|
| Health Pack | Beamable | Risk/reward - spend energy to heal |
| Rapid Abduct | Collidable | Instant activation feels good |
| Shield | Collidable | Defensive, should be quick to grab |
| Energy Surge | Beamable | Ironic - use energy to get unlimited energy |
| Wide Beam | Collidable | Beam enhancement should be instant |

#### 2. Stacking System with Progress Meters

When collecting a powerup that's already active:
- **Duration-based powerups**: Add time to existing timer (stackable duration)
- **Charge-based powerups (Shield)**: Add charges to existing count
- **Instant powerups (Health Pack)**: Always apply immediately

**UI: Active Powerup Stack Display**

Each active powerup shows a progress bar that:
- Displays remaining time/charges
- Grows when stacked (timer extends, charges add)
- Pulses/flashes when about to expire (< 3 seconds)
- Shows stack count if collected multiple times

```javascript
// Updated state structure for stacking
let activePowerups = {
    rapid_abduct: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
    shield: { active: false, charges: 0, maxCharges: 0, stacks: 0 },
    energy_surge: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
    wide_beam: { active: false, timer: 0, maxTimer: 0, stacks: 0 }
};
```

**Stacking Logic**:
```javascript
function applyPowerup(type) {
    const cfg = POWERUP_CONFIG[type];
    const state = activePowerups[type];

    switch (type) {
        case 'health_pack':
            // Instant, always applies
            ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + 25);
            createFloatingText(ufo.x, ufo.y - 50, '+25 HP', '#0f0');
            break;

        case 'shield':
            // Add charges
            if (state.active) {
                state.charges += cfg.charges;
                state.maxCharges = state.charges;
                state.stacks++;
                createFloatingText(ufo.x, ufo.y - 50, `+${cfg.charges} SHIELDS`, '#0af');
            } else {
                state.active = true;
                state.charges = cfg.charges;
                state.maxCharges = cfg.charges;
                state.stacks = 1;
            }
            break;

        case 'rapid_abduct':
        case 'energy_surge':
        case 'wide_beam':
            // Add duration
            if (state.active) {
                state.timer += cfg.duration;
                state.maxTimer = state.timer;
                state.stacks++;
                createFloatingText(ufo.x, ufo.y - 50, `+${cfg.duration}s`, cfg.color);
            } else {
                state.active = true;
                state.timer = cfg.duration;
                state.maxTimer = cfg.duration;
                state.stacks = 1;
            }
            break;
    }

    SFX.powerupCollect();
}
```

#### 3. Procedural Rendering (No Sprites)

All powerups rendered with Canvas primitives and glow effects.

**Base Powerup Rendering**:
```javascript
render() {
    if (!this.alive) return;

    const cfg = POWERUP_CONFIG[this.type];
    const drawX = this.x;
    const drawY = this.y + this.bobOffset;

    // Outer glow
    const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, 30);
    gradient.addColorStop(0, cfg.color + '80'); // 50% alpha
    gradient.addColorStop(1, cfg.color + '00'); // 0% alpha
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(drawX, drawY, 30, 0, Math.PI * 2);
    ctx.fill();

    // Blink when expiring
    if (this.lifetime < 3 && Math.floor(this.lifetime * 4) % 2 === 0) {
        return; // Skip rendering every other frame
    }

    // Draw shape based on type
    this.renderShape(drawX, drawY, cfg.color);

    // Inner shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(drawX - 5, drawY - 5, 6, 0, Math.PI * 2);
    ctx.fill();
}
```

**Individual Powerup Shapes**:

```javascript
renderShape(x, y, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    switch (this.type) {
        case 'health_pack':
            // Green cross/plus shape
            ctx.fillStyle = '#0f0';
            ctx.fillRect(x - 5, y - 15, 10, 30);  // Vertical bar
            ctx.fillRect(x - 15, y - 5, 30, 10);  // Horizontal bar
            ctx.strokeRect(x - 5, y - 15, 10, 30);
            ctx.strokeRect(x - 15, y - 5, 30, 10);
            break;

        case 'rapid_abduct':
            // Yellow lightning bolt
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(x + 5, y - 18);
            ctx.lineTo(x - 8, y + 2);
            ctx.lineTo(x - 2, y + 2);
            ctx.lineTo(x - 5, y + 18);
            ctx.lineTo(x + 8, y - 2);
            ctx.lineTo(x + 2, y - 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case 'shield':
            // Cyan shield/hexagon
            ctx.fillStyle = '#0af';
            ctx.beginPath();
            ctx.moveTo(x, y - 18);
            ctx.lineTo(x + 15, y - 9);
            ctx.lineTo(x + 15, y + 9);
            ctx.lineTo(x, y + 18);
            ctx.lineTo(x - 15, y + 9);
            ctx.lineTo(x - 15, y - 9);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Inner chevron
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 4);
            ctx.lineTo(x, y + 6);
            ctx.lineTo(x + 6, y - 4);
            ctx.stroke();
            break;

        case 'energy_surge':
            // Magenta star/burst
            ctx.fillStyle = '#f0f';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                const radius = i % 2 === 0 ? 18 : 8;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case 'wide_beam':
            // Orange expanding arrows/cone
            ctx.fillStyle = '#fa0';
            // Left arrow
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 10);
            ctx.lineTo(x - 18, y);
            ctx.lineTo(x - 6, y + 10);
            ctx.lineTo(x - 6, y + 5);
            ctx.lineTo(x - 12, y);
            ctx.lineTo(x - 6, y - 5);
            ctx.closePath();
            ctx.fill();
            // Right arrow
            ctx.beginPath();
            ctx.moveTo(x + 6, y - 10);
            ctx.lineTo(x + 18, y);
            ctx.lineTo(x + 6, y + 10);
            ctx.lineTo(x + 6, y + 5);
            ctx.lineTo(x + 12, y);
            ctx.lineTo(x + 6, y - 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
}
```

### Updated Powerup Configuration

```javascript
const POWERUP_CONFIG = {
    health_pack: {
        name: 'HEALTH+',
        color: '#0f0',
        duration: 0,
        spawnWeight: 0.25,
        collectionType: 'beam',      // NEW
        beamEnergyCost: 5,           // NEW
        abductionTime: 0.5           // NEW
    },
    rapid_abduct: {
        name: 'RAPID BEAM',
        color: '#ff0',
        duration: 15,
        spawnWeight: 0.20,
        collectionType: 'collision'  // NEW
    },
    shield: {
        name: 'SHIELD',
        color: '#0af',
        duration: 0,
        charges: 3,
        spawnWeight: 0.20,
        collectionType: 'collision'  // NEW
    },
    energy_surge: {
        name: 'ENERGY SURGE',
        color: '#f0f',
        duration: 10,
        spawnWeight: 0.15,
        collectionType: 'beam',      // NEW
        beamEnergyCost: 5,           // NEW
        abductionTime: 0.5           // NEW
    },
    wide_beam: {
        name: 'WIDE BEAM',
        color: '#fa0',
        duration: 12,
        spawnWeight: 0.20,
        collectionType: 'collision'  // NEW
    }
};
```

### Updated Powerup Class

```javascript
class Powerup {
    constructor(type, x) {
        this.type = type;
        const cfg = POWERUP_CONFIG[type];

        this.width = 40;
        this.height = 40;
        this.x = x;

        // Position based on collection type
        if (cfg.collectionType === 'beam') {
            // Spawn on ground like targets
            this.y = canvas.height - 60 - this.height / 2;
            this.groundY = this.y;
        } else {
            // Spawn in upper area for UFO collision
            this.y = canvas.height * 0.2 + Math.random() * (canvas.height * 0.25);
            this.groundY = null;
        }

        this.alive = true;
        this.lifetime = 12;
        this.bobOffset = 0;
        this.bobTime = Math.random() * Math.PI * 2;

        // Beamable powerup state
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.abductionTime = cfg.abductionTime || 0.5;
    }

    update(dt, beamActive, beamX) {
        if (!this.alive) return;

        const cfg = POWERUP_CONFIG[this.type];

        // Floating animation
        this.bobTime += dt * 3;
        this.bobOffset = Math.sin(this.bobTime) * 5;

        // Lifetime countdown (only if not being abducted)
        if (!this.beingAbducted) {
            this.lifetime -= dt;
            if (this.lifetime <= 0) {
                this.alive = false;
                return;
            }
        }

        // Collection logic based on type
        if (cfg.collectionType === 'collision') {
            // UFO collision check
            if (ufo && this.checkCollisionWithUFO()) {
                this.collect();
            }
        } else if (cfg.collectionType === 'beam') {
            // Beam abduction (similar to Target)
            if (this.beingAbducted) {
                this.updateAbduction(dt);
            }
        }
    }

    updateAbduction(dt) {
        if (!ufo) {
            this.beingAbducted = false;
            this.abductionProgress = 0;
            this.y = this.groundY;
            return;
        }

        // Rise toward UFO
        const targetY = ufo.y + ufo.height / 2;
        const riseSpeed = (this.groundY - targetY) / this.abductionTime;
        this.y -= riseSpeed * dt;

        // Move horizontally toward beam center
        const targetX = ufo.x;
        const dx = targetX - this.x;
        if (Math.abs(dx) > 1) {
            this.x += Math.sign(dx) * Math.min(200 * dt, Math.abs(dx));
        }

        this.abductionProgress += dt;

        if (this.abductionProgress >= this.abductionTime) {
            this.collect();
        }
    }

    checkCollisionWithUFO() {
        if (!ufo) return false;
        const dx = this.x - ufo.x;
        const dy = this.y - ufo.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ufo.width / 2.5 + this.width / 2);
    }

    collect() {
        this.alive = false;
        applyPowerup(this.type);
        createFloatingText(this.x, this.y, POWERUP_CONFIG[this.type].name, POWERUP_CONFIG[this.type].color);
        createExplosion(this.x, this.y, 'small');
    }

    // Check if this powerup is in the beam (for beamable types)
    isInBeam(beamX, beamTop, beamBottom, beamTopWidth, beamBottomWidth) {
        const cfg = POWERUP_CONFIG[this.type];
        if (cfg.collectionType !== 'beam') return false;
        if (this.beingAbducted) return false;

        const t = (this.y - beamTop) / (beamBottom - beamTop);
        if (t < 0 || t > 1) return false;

        const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
        const beamLeftEdge = beamX - beamWidthAtY / 2;
        const beamRightEdge = beamX + beamWidthAtY / 2;

        return this.x >= beamLeftEdge && this.x <= beamRightEdge;
    }

    render() {
        // ... (procedural rendering code above)
    }
}
```

### Active Powerup UI with Progress Bars

```javascript
function renderActivePowerups() {
    const barWidth = 120;
    const barHeight = 16;
    const padding = 4;
    let y = 100;

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';

    for (const [key, state] of Object.entries(activePowerups)) {
        if (!state.active) continue;

        const cfg = POWERUP_CONFIG[key];
        let progress = 0;
        let label = '';

        if (state.timer > 0) {
            progress = state.timer / state.maxTimer;
            label = `${cfg.name} ${state.timer.toFixed(1)}s`;
            if (state.stacks > 1) label += ` x${state.stacks}`;
        } else if (state.charges > 0) {
            progress = state.charges / state.maxCharges;
            label = `${cfg.name} ${state.charges}`;
            if (state.stacks > 1) label += ` x${state.stacks}`;
        }

        // Background bar
        ctx.fillStyle = '#333';
        ctx.fillRect(10, y, barWidth, barHeight);

        // Progress fill
        ctx.fillStyle = cfg.color;
        ctx.fillRect(10, y, barWidth * progress, barHeight);

        // Pulsing effect when low
        if (progress < 0.25) {
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
            ctx.fillRect(10, y, barWidth * progress, barHeight);
        }

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, y, barWidth, barHeight);

        // Label
        ctx.fillStyle = '#fff';
        ctx.fillText(label, 14, y + barHeight - padding);

        y += barHeight + 6;
    }
}
```

### Updated Implementation Checklist

- [ ] Add `POWERUP_CONFIG` with `collectionType` to CONFIG section
- [ ] Create `Powerup` class with dual collection modes
- [ ] Add `powerups` array and updated `activePowerups` state object
- [ ] Implement `spawnPowerup()` with position based on collection type
- [ ] Implement `applyPowerup()` with stacking logic
- [ ] Add beam detection for beamable powerups in `UFO.findTargetInBeam()`
- [ ] Modify `Target.update()` for rapid abduct effect
- [ ] Modify `Projectile.update()` for shield effect
- [ ] Modify `UFO.update()` for energy surge effect
- [ ] Modify `UFO.findTargetInBeam()` for wide beam effect
- [ ] Modify `UFO.renderBeam()` for wide beam visual
- [ ] Add shield visual to `UFO.render()`
- [ ] Implement procedural `Powerup.renderShape()` for all 5 types
- [ ] Implement `renderActivePowerups()` with progress bars
- [ ] Add powerup updates to main `update()` function
- [ ] Add powerup renders to main `render()` function
- [ ] Reset powerup state in `startGame()`
- [ ] Add sound effects for powerup events
