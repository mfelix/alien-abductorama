# Powerup System Implementation Plan

## Overview

Implement a powerup mechanic system for Alien Abductorama with 5 powerup types, dual collection modes (beam-based and collision-based), stacking support with caps, procedural Canvas rendering, and full audio integration using the existing Web Audio API system.

## Current State Analysis

The game is a single-file vanilla JavaScript game (`js/game.js`, ~2400 lines) using HTML5 Canvas. It features:
- Class-based entity system (UFO, Target, Tank, Projectile, Particle)
- Timer-based spawning for targets
- Global state arrays for entity management
- Web Audio API procedural sound effects (SFX object)
- CONFIG object for all tunable values

### Key Discoveries:
- Entity pattern: Classes with `constructor()`, `update(dt)`, `render()`, and `alive` boolean (`js/game.js:459-648` for Target)
- Spawning pattern: Timer countdown, spawn when zero, reset with random interval (`js/game.js:728-735`)
- Audio pattern: SFX object with methods using oscillators, gain nodes, and frequency ramps (`js/game.js:113-309`)
- Beam collision: Cone-based detection with interpolated width (`js/game.js:848-916`)
- Global arrays declared at module level (`js/game.js:364-369`)

## Desired End State

After implementation:
1. Powerups spawn every 15-25 seconds (scaling faster with waves)
2. Five powerup types with distinct visual icons rendered procedurally
3. Two collection modes: fly-into (collision) and beam-to-collect
4. Active powerups display as progress bars in the UI
5. Stacking extends duration/charges with caps (30s duration, 6 shield charges)
6. Full audio feedback for spawn, collect, shield hit/break, and expiration
7. All state resets properly on game restart

### Verification:
- Play through 3+ waves and observe powerup spawns
- Collect each powerup type and verify effect activates
- Stack same powerup and verify timer/charges extend (with cap)
- Take damage with shield and verify blocking
- Verify powerups despawn after 12 seconds if uncollected
- Verify all state clears on game over and restart

## What We're NOT Doing

- Sprite-based powerup graphics (using procedural Canvas rendering only)
- New powerup types beyond the 5 specified
- Powerup drop from destroyed enemies
- Persistent powerup upgrades between games
- Difficulty-based powerup modifications (beyond spawn rate scaling)

## Implementation Approach

Follow existing codebase patterns exactly:
1. Add configuration to CONFIG object
2. Create Powerup class matching Target/Tank patterns
3. Add global state arrays and timer variables
4. Implement spawning using same timer pattern as targets
5. Add effects by modifying existing methods with conditional checks
6. Integrate into game loop following existing update/render order

---

## Phase 1: Core Infrastructure

### Overview
Add powerup configuration constants, global state variables, and the base Powerup class structure.

### Changes Required:

#### 1.1 Add Powerup Configuration to CONFIG

**File**: `js/game.js`
**Location**: After line 71 (end of existing CONFIG), insert before closing brace

```javascript
    // Powerups (add after line 70, before CONFIG closing brace)
    POWERUP_SPAWN_INTERVAL: [15, 25],
    POWERUP_SPAWN_WAVE_SCALING: 0.1,  // 10% faster per wave
    POWERUP_MAX_ON_SCREEN: 2,
    POWERUP_LIFETIME: 12,
    POWERUP_FIRST_SPAWN_DELAY: 8,
    POWERUP_STACK_MAX_DURATION: 30,
    POWERUP_STACK_MAX_CHARGES: 6,

    POWERUPS: {
        health_pack: {
            name: 'HEALTH+',
            color: '#0f0',
            duration: 0,
            healAmount: 25,
            spawnWeight: 0.25,
            collectionType: 'beam',
            beamEnergyCost: 5,
            abductionTime: 0.5
        },
        rapid_abduct: {
            name: 'RAPID BEAM',
            color: '#ff0',
            duration: 15,
            speedMultiplier: 2,
            spawnWeight: 0.20,
            collectionType: 'collision'
        },
        shield: {
            name: 'SHIELD',
            color: '#0af',
            duration: 0,
            charges: 3,
            spawnWeight: 0.20,
            collectionType: 'collision'
        },
        energy_surge: {
            name: 'ENERGY SURGE',
            color: '#f0f',
            duration: 10,
            spawnWeight: 0.15,
            collectionType: 'beam',
            beamEnergyCost: 5,
            abductionTime: 0.5
        },
        wide_beam: {
            name: 'WIDE BEAM',
            color: '#fa0',
            duration: 12,
            widthMultiplier: 2,
            spawnWeight: 0.20,
            collectionType: 'collision'
        }
    }
```

#### 1.2 Add Global State Variables

**File**: `js/game.js`
**Location**: After line 369 (after `let particles = [];`)

```javascript
// Powerup state
let powerups = [];
let powerupSpawnTimer = 0;
let activePowerups = {
    rapid_abduct: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
    shield: { active: false, charges: 0, maxCharges: 0, stacks: 0 },
    energy_surge: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
    wide_beam: { active: false, timer: 0, maxTimer: 0, stacks: 0 }
};
```

#### 1.3 Create Powerup Class

**File**: `js/game.js`
**Location**: After Particle class (after line 1531, before HeavyTank class)

```javascript
// ============================================
// POWERUP CLASS
// ============================================

class Powerup {
    constructor(type, x) {
        this.type = type;
        const cfg = CONFIG.POWERUPS[type];

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
        this.lifetime = CONFIG.POWERUP_LIFETIME;
        this.bobOffset = 0;
        this.bobTime = Math.random() * Math.PI * 2;

        // Beamable powerup state
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.abductionTime = cfg.abductionTime || 0.5;
    }

    update(dt) {
        if (!this.alive) return;

        const cfg = CONFIG.POWERUPS[this.type];

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
            if (ufo && this.checkCollisionWithUFO()) {
                this.collect();
            }
        } else if (cfg.collectionType === 'beam') {
            if (this.beingAbducted) {
                this.updateAbduction(dt);
            }
        }
    }

    updateAbduction(dt) {
        if (!ufo || !ufo.beamActive) {
            // Beam released - drop back
            this.beingAbducted = false;
            this.abductionProgress = 0;
            if (this.groundY !== null) {
                this.y = this.groundY;
            }
            return;
        }

        // Rise toward UFO
        const targetY = ufo.y + ufo.height / 2;
        const riseSpeed = (this.groundY - targetY) / this.abductionTime;
        this.y -= riseSpeed * dt;

        // Move horizontally toward beam center
        const dx = ufo.x - this.x;
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
        const dy = (this.y + this.bobOffset) - ufo.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ufo.width / 2.5 + this.width / 2);
    }

    startAbduction() {
        if (this.beingAbducted) return;
        this.beingAbducted = true;
        this.abductionProgress = 0;
    }

    collect() {
        this.alive = false;
        applyPowerup(this.type);
        const cfg = CONFIG.POWERUPS[this.type];
        createFloatingText(this.x, this.y, cfg.name, cfg.color);
        createExplosion(this.x, this.y, 'small');
        SFX.powerupCollect();
    }

    isInBeam(beamX, beamTop, beamBottom, beamTopWidth, beamBottomWidth) {
        const cfg = CONFIG.POWERUPS[this.type];
        if (cfg.collectionType !== 'beam') return false;

        const y = this.y + this.bobOffset;
        const t = (y - beamTop) / (beamBottom - beamTop);
        if (t < 0 || t > 1) return false;

        const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
        const beamLeftEdge = beamX - beamWidthAtY / 2;
        const beamRightEdge = beamX + beamWidthAtY / 2;

        return this.x >= beamLeftEdge && this.x <= beamRightEdge;
    }

    render() {
        if (!this.alive) return;

        const cfg = CONFIG.POWERUPS[this.type];
        const drawX = this.x;
        const drawY = this.y + this.bobOffset;

        // Outer glow
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, 30);
        gradient.addColorStop(0, cfg.color + '80');
        gradient.addColorStop(1, cfg.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 30, 0, Math.PI * 2);
        ctx.fill();

        // Blink when expiring
        if (this.lifetime < 3 && Math.floor(this.lifetime * 4) % 2 === 0) {
            return;
        }

        // Draw shape based on type
        this.renderShape(drawX, drawY, cfg.color);

        // Inner shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(drawX - 5, drawY - 5, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    renderShape(x, y, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'health_pack':
                // Green cross/plus shape
                ctx.fillStyle = '#0f0';
                ctx.fillRect(x - 5, y - 15, 10, 30);
                ctx.fillRect(x - 15, y - 5, 30, 10);
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
                // Orange expanding arrows
                ctx.fillStyle = '#fa0';
                // Left arrow
                ctx.beginPath();
                ctx.moveTo(x - 4, y - 12);
                ctx.lineTo(x - 18, y);
                ctx.lineTo(x - 4, y + 12);
                ctx.lineTo(x - 4, y + 6);
                ctx.lineTo(x - 10, y);
                ctx.lineTo(x - 4, y - 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Right arrow
                ctx.beginPath();
                ctx.moveTo(x + 4, y - 12);
                ctx.lineTo(x + 18, y);
                ctx.lineTo(x + 4, y + 12);
                ctx.lineTo(x + 4, y + 6);
                ctx.lineTo(x + 10, y);
                ctx.lineTo(x + 4, y - 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
        }
    }
}
```

### Success Criteria:

#### Automated Verification:
- [x] Game loads without JavaScript errors: Open browser console, verify no errors
- [x] CONFIG.POWERUPS object exists: `console.log(CONFIG.POWERUPS)` shows 5 powerup types
- [x] Powerup class is defined: `console.log(typeof Powerup)` returns 'function'

#### Manual Verification:
- [ ] Game still plays normally (no regressions from adding code)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 2.

---

## Phase 2: Spawning System

### Overview
Implement timer-based powerup spawning with weighted random selection and wave-based scaling.

### Changes Required:

#### 2.1 Add Spawning Functions

**File**: `js/game.js`
**Location**: After the Powerup class (after renderShape closing brace)

```javascript
// Powerup spawning functions
function getRandomPowerupType() {
    const types = Object.entries(CONFIG.POWERUPS);
    const totalWeight = types.reduce((sum, [_, cfg]) => sum + cfg.spawnWeight, 0);
    let rand = Math.random() * totalWeight;

    for (const [type, cfg] of types) {
        rand -= cfg.spawnWeight;
        if (rand <= 0) return type;
    }
    return 'health_pack'; // fallback
}

function spawnPowerup() {
    if (powerups.length >= CONFIG.POWERUP_MAX_ON_SCREEN) return;

    const type = getRandomPowerupType();
    const margin = 100;

    // Find valid spawn position (avoid clustering)
    let x;
    let attempts = 0;
    const minSpacing = 100;

    do {
        x = margin + Math.random() * (canvas.width - margin * 2);
        attempts++;
    } while (attempts < 10 && powerups.some(p => Math.abs(p.x - x) < minSpacing));

    powerups.push(new Powerup(type, x));
    SFX.powerupSpawn();
}

function updatePowerupSpawning(dt) {
    if (gameState !== 'PLAYING') return;

    powerupSpawnTimer -= dt;
    if (powerupSpawnTimer <= 0) {
        spawnPowerup();
        // Reset timer with wave scaling (faster spawns in later waves)
        const [min, max] = CONFIG.POWERUP_SPAWN_INTERVAL;
        const waveMultiplier = 1 / (1 + (wave - 1) * CONFIG.POWERUP_SPAWN_WAVE_SCALING);
        const baseInterval = min + Math.random() * (max - min);
        powerupSpawnTimer = baseInterval * waveMultiplier;
    }
}
```

#### 2.2 Add applyPowerup Function

**File**: `js/game.js`
**Location**: After spawning functions

```javascript
function applyPowerup(type) {
    const cfg = CONFIG.POWERUPS[type];
    const state = activePowerups[type];

    switch (type) {
        case 'health_pack':
            // Instant heal
            const oldHealth = ufo.health;
            ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + cfg.healAmount);
            const healed = ufo.health - oldHealth;
            if (healed > 0) {
                createFloatingText(ufo.x, ufo.y - 50, `+${healed} HP`, '#0f0');
            }
            break;

        case 'shield':
            // Add charges (with cap)
            if (state.active) {
                const newCharges = Math.min(
                    state.charges + cfg.charges,
                    CONFIG.POWERUP_STACK_MAX_CHARGES
                );
                const added = newCharges - state.charges;
                state.charges = newCharges;
                state.maxCharges = newCharges;
                state.stacks++;
                if (added > 0) {
                    createFloatingText(ufo.x, ufo.y - 50, `+${added} SHIELD`, '#0af');
                }
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
            // Add duration (with cap)
            if (state.active) {
                const newTimer = Math.min(
                    state.timer + cfg.duration,
                    CONFIG.POWERUP_STACK_MAX_DURATION
                );
                const added = newTimer - state.timer;
                state.timer = newTimer;
                state.maxTimer = newTimer;
                state.stacks++;
                if (added > 0) {
                    createFloatingText(ufo.x, ufo.y - 50, `+${added.toFixed(0)}s`, cfg.color);
                }
            } else {
                state.active = true;
                state.timer = cfg.duration;
                state.maxTimer = cfg.duration;
                state.stacks = 1;
            }
            break;
    }
}
```

#### 2.3 Add Powerup Timer Update Function

**File**: `js/game.js`
**Location**: After applyPowerup function

```javascript
function updateActivePowerups(dt) {
    for (const [key, state] of Object.entries(activePowerups)) {
        if (state.active && state.timer > 0) {
            state.timer -= dt;
            if (state.timer <= 0) {
                state.active = false;
                state.timer = 0;
                state.stacks = 0;
                SFX.powerupExpire();
                createFloatingText(ufo.x, ufo.y - 60, `${CONFIG.POWERUPS[key].name} ENDED`, '#888');
            }
        }
    }
}
```

### Success Criteria:

#### Automated Verification:
- [x] Functions exist: `console.log(typeof spawnPowerup, typeof applyPowerup)` returns 'function function'
- [x] No JavaScript errors on load

#### Manual Verification:
- [ ] (Cannot test yet - not integrated into game loop)

**Implementation Note**: After completing this phase, proceed directly to Phase 3 to enable testing.

---

## Phase 3: Collection Mechanics

### Overview
Integrate powerup detection into UFO beam logic and enable collision-based collection.

### Changes Required:

#### 3.1 Modify UFO.findTargetInBeam() to Also Check Powerups

**File**: `js/game.js`
**Location**: In `UFO.findTargetInBeam()` method (around line 848-916)

Find this section that checks for targets in beam, and add powerup detection. The beam parameters are already calculated in this method.

After the existing target/tank detection loops, add:

```javascript
    // Check beamable powerups (add before the return statement at end of method)
    const widthMultiplier = activePowerups.wide_beam.active ? CONFIG.POWERUPS.wide_beam.widthMultiplier : 1;
    const actualBeamTopWidth = 30 * widthMultiplier;
    const actualBeamBottomWidth = 225 * widthMultiplier;

    for (const powerup of powerups) {
        if (!powerup.alive || powerup.beingAbducted) continue;
        const cfg = CONFIG.POWERUPS[powerup.type];
        if (cfg.collectionType !== 'beam') continue;

        if (powerup.isInBeam(this.x, beamTop, beamBottom, actualBeamTopWidth, actualBeamBottomWidth)) {
            powerup.startAbduction();
            // Drain energy for beamable powerups
            if (cfg.beamEnergyCost) {
                this.energy -= cfg.beamEnergyCost;
            }
        }
    }
```

**Note**: The exact insertion point depends on the current structure. Insert after all target/tank loops but before the final return statement.

#### 3.2 Modify Beam Width in findTargetInBeam for Wide Beam Effect

**File**: `js/game.js`
**Location**: In `UFO.findTargetInBeam()`, at the beam width definitions (around line 850-851)

Change:
```javascript
const beamTopWidth = 30;
const beamBottomWidth = 225;
```

To:
```javascript
const widthMultiplier = activePowerups.wide_beam.active ? CONFIG.POWERUPS.wide_beam.widthMultiplier : 1;
const beamTopWidth = 30 * widthMultiplier;
const beamBottomWidth = 225 * widthMultiplier;
```

### Success Criteria:

#### Automated Verification:
- [x] No JavaScript errors on load
- [x] Wide beam multiplier check exists in findTargetInBeam

#### Manual Verification:
- [ ] (Cannot fully test yet - not integrated into game loop)

**Implementation Note**: After completing this phase, proceed to Phase 4.

---

## Phase 4: Powerup Effects

### Overview
Implement the gameplay effects for each powerup type by modifying existing game logic.

### Changes Required:

#### 4.1 Rapid Abduct Effect - Modify Target.update()

**File**: `js/game.js`
**Location**: In `Target.update()` method, abduction progress section (around line 528)

Find where abduction progress is incremented:
```javascript
this.abductionProgress += dt;
```

Change to:
```javascript
const rapidMultiplier = activePowerups.rapid_abduct.active ? CONFIG.POWERUPS.rapid_abduct.speedMultiplier : 1;
this.abductionProgress += dt * rapidMultiplier;
```

Also find the rise speed calculation and apply multiplier:
```javascript
// Find the line calculating rise toward UFO and apply multiplier
const riseSpeed = /* existing calculation */ * rapidMultiplier;
```

#### 4.2 Shield Effect - Modify Projectile.update()

**File**: `js/game.js`
**Location**: In `Projectile.update()` collision check (around line 1351-1368)

Find the UFO collision handling:
```javascript
if (ufo && this.checkCollisionWithUFO()) {
    this.alive = false;
    ufo.health -= this.damage;
    // ... damage effects
}
```

Replace with:
```javascript
if (ufo && this.checkCollisionWithUFO()) {
    this.alive = false;

    if (activePowerups.shield.active && activePowerups.shield.charges > 0) {
        // Shield absorbs hit
        activePowerups.shield.charges--;
        SFX.shieldHit();
        createFloatingText(ufo.x, ufo.y - 30, 'BLOCKED!', '#0af');
        createExplosion(this.x, this.y, 'small');

        if (activePowerups.shield.charges <= 0) {
            activePowerups.shield.active = false;
            activePowerups.shield.stacks = 0;
            SFX.shieldBreak();
            createFloatingText(ufo.x, ufo.y - 50, 'SHIELD DOWN!', '#f00');
        }
    } else {
        // Normal damage
        ufo.health -= this.damage;
        SFX.ufoHit();
        screenShake = 0.3;
        damageFlash = 0.2;
        createFloatingText(ufo.x, ufo.y - 30, `-${this.damage}`, '#f00');
    }
}
```

#### 4.3 Energy Surge Effect - Modify UFO.update()

**File**: `js/game.js`
**Location**: In `UFO.update()` energy drain section (around line 777)

Find energy drain:
```javascript
this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;
```

Change to:
```javascript
if (!activePowerups.energy_surge.active) {
    this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;
}
```

Also find the minimum energy check (around line 767):
```javascript
const canFireBeam = this.energy >= CONFIG.ENERGY_MIN_TO_FIRE;
```

Change to:
```javascript
const canFireBeam = activePowerups.energy_surge.active || this.energy >= CONFIG.ENERGY_MIN_TO_FIRE;
```

#### 4.4 Wide Beam Effect - Already handled in Phase 3

The beam width multiplier was added to `findTargetInBeam()` in Phase 3.

#### 4.5 Wide Beam Visual - Modify UFO.renderBeam()

**File**: `js/game.js`
**Location**: In `UFO.renderBeam()` method (around line 943)

Find beam width constants:
```javascript
const topWidth = 30;
const bottomWidth = 225;
```

Change to:
```javascript
const widthMultiplier = activePowerups.wide_beam.active ? CONFIG.POWERUPS.wide_beam.widthMultiplier : 1;
const topWidth = 30 * widthMultiplier;
const bottomWidth = 225 * widthMultiplier;
```

Also add orange tint when wide beam is active. Find the beam color/gradient section and modify:
```javascript
// Add orange tint to beam when wide_beam active
if (activePowerups.wide_beam.active) {
    // Modify gradient colors to include orange
    gradient.addColorStop(0, 'rgba(255, 170, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 170, 0, 0.1)');
}
```

### Success Criteria:

#### Automated Verification:
- [x] No JavaScript errors on load
- [x] All effect conditionals reference activePowerups correctly

#### Manual Verification:
- [ ] (Will test after Phase 6 integration)

**Implementation Note**: After completing this phase, proceed to Phase 5.

---

## Phase 5: Visual Feedback

### Overview
Add shield visual around UFO and active powerup UI indicators.

### Changes Required:

#### 5.1 Add Shield Visual to UFO.render()

**File**: `js/game.js`
**Location**: At end of `UFO.render()` method (around line 939, before closing brace)

Add before the method's closing brace:
```javascript
    // Render shield bubble if active
    if (activePowerups.shield.active) {
        const pulseAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
        ctx.strokeStyle = `rgba(0, 170, 255, ${pulseAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // Shield charge indicators
        const charges = activePowerups.shield.charges;
        ctx.fillStyle = '#0af';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${charges}`, this.x, this.y - this.height / 2 - 25);
    }

    // Energy surge glow effect
    if (activePowerups.energy_surge.active) {
        const pulseAlpha = 0.3 + Math.sin(Date.now() / 150) * 0.2;
        ctx.strokeStyle = `rgba(255, 0, 255, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
```

#### 5.2 Add Active Powerup UI Function

**File**: `js/game.js`
**Location**: After `renderUI()` function (find it around line 2115-2200)

```javascript
function renderActivePowerups() {
    const barWidth = 140;
    const barHeight = 18;
    const padding = 4;
    const startX = 10;
    let y = 100;

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';

    for (const [key, state] of Object.entries(activePowerups)) {
        if (!state.active) continue;

        const cfg = CONFIG.POWERUPS[key];
        let progress = 0;
        let label = '';

        if (state.timer > 0) {
            progress = state.timer / state.maxTimer;
            label = `${cfg.name} ${state.timer.toFixed(1)}s`;
        } else if (state.charges > 0) {
            progress = state.charges / state.maxCharges;
            label = `${cfg.name} x${state.charges}`;
        }

        // Background bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(startX, y, barWidth, barHeight);

        // Progress fill
        ctx.fillStyle = cfg.color;
        ctx.fillRect(startX + 2, y + 2, (barWidth - 4) * progress, barHeight - 4);

        // Pulsing effect when low
        if (progress < 0.25 && progress > 0) {
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.4})`;
            ctx.fillRect(startX + 2, y + 2, (barWidth - 4) * progress, barHeight - 4);
        }

        // Border
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, y, barWidth, barHeight);

        // Label (with shadow for readability)
        ctx.fillStyle = '#000';
        ctx.fillText(label, startX + padding + 1, y + barHeight - padding + 1);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, startX + padding, y + barHeight - padding);

        y += barHeight + 4;
    }
}
```

### Success Criteria:

#### Automated Verification:
- [x] No JavaScript errors on load
- [x] `renderActivePowerups` function exists

#### Manual Verification:
- [ ] (Will test after Phase 6 integration)

**Implementation Note**: After completing this phase, proceed to Phase 6.

---

## Phase 6: Audio Integration

### Overview
Add 5 new sound effects to the SFX object for powerup events.

### Changes Required:

#### 6.1 Add Powerup Sound Effects to SFX Object

**File**: `js/game.js`
**Location**: In SFX object (around line 113-309), add before the closing brace

```javascript
    powerupSpawn: () => {
        if (!audioCtx) return;
        // Sparkle/chime - ascending arpeggio
        const notes = [600, 800, 1000, 1200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                playTone(freq, 0.1, 'sine', 0.15);
            }, i * 50);
        });
    },

    powerupCollect: () => {
        if (!audioCtx) return;
        // Satisfying pickup - quick ascending sweep with harmonics
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        osc2.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.2);
        osc2.stop(audioCtx.currentTime + 0.2);
    },

    shieldHit: () => {
        if (!audioCtx) return;
        // Deflection - metallic ping with quick decay
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
        filter.Q.setValueAtTime(5, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    },

    shieldBreak: () => {
        if (!audioCtx) return;
        // Shatter - descending noise burst
        const bufferSize = audioCtx.sampleRate * 0.4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }

        const noise = audioCtx.createBufferSource();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        noise.start();
    },

    powerupExpire: () => {
        if (!audioCtx) return;
        // Subtle whoosh - descending filtered noise
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
```

### Success Criteria:

#### Automated Verification:
- [x] No JavaScript errors on load
- [x] All SFX methods exist: `console.log(typeof SFX.powerupSpawn, typeof SFX.powerupCollect, typeof SFX.shieldHit, typeof SFX.shieldBreak, typeof SFX.powerupExpire)`

#### Manual Verification:
- [ ] (Will test after Phase 7 integration)

**Implementation Note**: After completing this phase, proceed to Phase 7.

---

## Phase 7: Game Integration

### Overview
Wire powerups into the main game loop and reset state on game start.

### Changes Required:

#### 7.1 Add Powerup Updates to update() Function

**File**: `js/game.js`
**Location**: In `update(dt)` function (around line 2256-2325)

After the line `updateFloatingTexts(dt);` (around line 2294), add:

```javascript
    // Update powerups
    updatePowerupSpawning(dt);
    updateActivePowerups(dt);
    for (const powerup of powerups) {
        powerup.update(dt);
    }
    powerups = powerups.filter(p => p.alive);
```

#### 7.2 Add Powerup Rendering to render() Function

**File**: `js/game.js`
**Location**: In `render()` function (around line 2327-2394)

After rendering targets (around line 2343 `for (const target of targets) target.render();`), add:

```javascript
    // Render powerups
    for (const powerup of powerups) {
        powerup.render();
    }
```

After `renderUI();` (around line 2365), add:

```javascript
    // Render active powerup indicators
    renderActivePowerups();
```

#### 7.3 Reset Powerups in startGame()

**File**: `js/game.js`
**Location**: In `startGame()` function (around line 1929-1951)

After the line `floatingTexts = [];` add:

```javascript
    // Reset powerups
    powerups = [];
    powerupSpawnTimer = CONFIG.POWERUP_FIRST_SPAWN_DELAY;
    activePowerups = {
        rapid_abduct: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
        shield: { active: false, charges: 0, maxCharges: 0, stacks: 0 },
        energy_surge: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
        wide_beam: { active: false, timer: 0, maxTimer: 0, stacks: 0 }
    };
```

#### 7.4 Clear Powerups on Wave Transition (Optional Enhancement)

**File**: `js/game.js`
**Location**: In wave transition logic (around line 2147 where `spawnTanks()` is called)

Powerups should persist across waves (don't clear them), but active powerup timers continue counting down during transitions. This is the intended behavior - no changes needed.

### Success Criteria:

#### Automated Verification:
- [x] Game loads without errors
- [x] Open console and verify no errors during gameplay
- [x] After 8 seconds of gameplay, powerups should start spawning

#### Manual Verification:
- [ ] Powerups spawn in the play area after ~8 seconds
- [ ] Collision-based powerups (Rapid, Shield, Wide Beam) can be collected by flying into them
- [ ] Beam-based powerups (Health, Energy Surge) can be collected with the tractor beam
- [ ] Active powerup UI shows progress bars for active effects
- [ ] Shield blocks projectile damage and shows charge count
- [ ] Energy Surge allows unlimited beam usage
- [ ] Rapid Abduct speeds up abduction
- [ ] Wide Beam makes the beam visually wider and easier to catch targets
- [ ] Health Pack heals the UFO
- [ ] Powerups blink when about to expire (last 3 seconds)
- [ ] Stacking powerups extends duration/charges (verify caps work)
- [ ] All sound effects play correctly
- [ ] Game restart clears all powerups and active effects

**Implementation Note**: After completing this phase and all verification passes, the powerup system is complete.

---

## Testing Strategy

### Unit Tests:
Not applicable (no test framework in this project)

### Integration Tests:
Not applicable (no test framework)

### Manual Testing Steps:

1. **Basic Spawn Test**:
   - Start game, wait 8 seconds
   - Verify powerups appear (check both ground-level and air-level spawns)

2. **Collection Test** (for each powerup type):
   - Health Pack: Beam to collect, verify HP increases
   - Rapid Abduct: Fly into it, beam a target, verify faster abduction
   - Shield: Fly into it, get hit by tank, verify "BLOCKED!" appears
   - Energy Surge: Beam to collect, use beam continuously, verify no energy drain
   - Wide Beam: Fly into it, verify beam appears wider

3. **Stacking Test**:
   - Collect Rapid Abduct, then collect another
   - Verify timer extends (up to 30s cap)
   - Collect Shield multiple times, verify charges add (up to 6 cap)

4. **Expiration Test**:
   - Collect a duration powerup
   - Wait for expiration
   - Verify "ENDED" message and sound plays

5. **Shield Break Test**:
   - Collect shield
   - Take 3 hits
   - Verify "SHIELD DOWN!" and break sound

6. **Wave Transition Test**:
   - Collect powerup
   - Complete wave
   - Verify powerup persists through transition

7. **Game Restart Test**:
   - Collect powerups, have active effects
   - Die and restart
   - Verify all state is cleared

## Performance Considerations

- Powerup count capped at 2 to limit entity overhead
- Procedural rendering uses simple Canvas primitives (no image loading)
- Glow effects use radial gradients (GPU accelerated)
- Entity filtering happens once per frame (existing pattern)

## Migration Notes

N/A - New feature, no data migration required.

## References

- Research document: `thoughts/shared/research/2025-12-29-powerup-mechanic-design.md`
- Main game file: `js/game.js`
- Existing entity patterns: Target class (`js/game.js:459-648`), Tank class (`js/game.js:1078-1310`)
- Spawning pattern: `spawnTarget()` (`js/game.js:707-726`), `updateTargetSpawning()` (`js/game.js:728-735`)
- Audio pattern: SFX object (`js/game.js:113-309`)
