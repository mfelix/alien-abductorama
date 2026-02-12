# Coordinator Missile Launch — Implementation Plan

**Design doc:** `docs/plans/2026-02-11-coordinator-missile-launch-design.md`
**Target file:** `js/game.js` (~16,950 lines, monolithic)

---

## Overview

Five sequential units of work, each building on the previous. All edits are in `js/game.js`.

---

## Unit 1: Add CONFIG constants and new Missile constructor parameters

**Implements:** Design sections 2 (trajectory timing) and 3 (visual polish constants)

**What it does:** Adds new CONFIG constants for the four-phase trajectory timing and launch-up velocity. Modifies the Missile constructor to accept and store a `launchFromCoordinator` flag and direction, and initializes the four-phase state machine properties.

### Edits

#### 1A. Add new CONFIG constants

**Search pattern:** `MISSILE_SWARM_SPEED: 600,` (line ~295)

**Insert after** `MISSILE_RECHARGE_TIME: 5,` (line ~296):

```js
    MISSILE_LAUNCH_UP_SPEED: 350,        // Phase 1 upward velocity (px/s)
    MISSILE_LAUNCH_DURATION: 0.3,        // Phase 1 duration (seconds)
    MISSILE_DECEL_DURATION: 0.3,         // Phase 2 duration (seconds)
    MISSILE_APEX_DURATION: 0.2,          // Phase 3 duration (seconds)
    MISSILE_DIVE_RAMP_SPEED: 600,        // Phase 4 attack speed (matches MISSILE_SWARM_SPEED)
```

#### 1B. Rewrite Missile constructor

**Search pattern:** `constructor(x, y, targetTank, launchAngle)` inside `class Missile {`

**Replace** the entire constructor (from `constructor(x, y, targetTank, launchAngle) {` through the closing `}` of the constructor, ending just before `update(dt) {`).

New constructor signature: `constructor(x, y, targetTank, launchAngle, fromCoordinator = false)`

New constructor body:
```js
    constructor(x, y, targetTank, launchAngle, fromCoordinator = false) {
        this.x = x;
        this.y = y;
        this.targetTank = targetTank;
        this.damage = CONFIG.MISSILE_SWARM_DAMAGE + missileDamage;
        this.alive = true;
        this.age = 0;
        this.fromCoordinator = fromCoordinator;

        if (fromCoordinator) {
            // Four-phase trajectory: launch UP from coordinator
            this.phase = 'LAUNCH';  // LAUNCH -> DECEL -> APEX -> DIVE
            this.launchDuration = CONFIG.MISSILE_LAUNCH_DURATION;
            this.decelDuration = CONFIG.MISSILE_DECEL_DURATION;
            this.apexDuration = CONFIG.MISSILE_APEX_DURATION;
            // Launch velocity: upward + slight horizontal fan
            this.vx = Math.cos(launchAngle) * 120;
            this.vy = -CONFIG.MISSILE_LAUNCH_UP_SPEED; // negative = upward
            this.apexFlashed = false;
        } else {
            // Legacy two-phase trajectory: fan downward from UFO
            this.phase = 'LEGACY_LAUNCH';
            this.launchDuration = 0.5;
            this.vx = Math.cos(launchAngle) * 200;
            this.vy = 300;
        }

        // Spiral parameters (shared by all modes)
        this.spiralPhase = Math.random() * Math.PI * 2;
        this.spiralFreq = 3 + Math.random() * 2;
        this.spiralAmp = 30 + Math.random() * 20;
        this.trail = [];
        this.maxTrailLength = 30;
        this.smokePuffs = [];
        this.smokeTimer = 0;
    }
```

### Testable after this unit

Game should launch and missiles should still work from the UFO (legacy path) exactly as before, since `fromCoordinator` defaults to `false` and the legacy branch preserves the old `launchPhase` logic (now tracked as `phase === 'LEGACY_LAUNCH'`).

---

## Unit 2: Rewrite Missile.update() with four-phase state machine

**Implements:** Design section 2 (four-phase arc) and section 3 (apex flash)

**What it does:** Replaces the two-phase `launchPhase`/homing movement in `update()` with a four-phase state machine for coordinator-launched missiles, while preserving the old logic for UFO-launched missiles.

### Edits

#### 2A. Replace movement logic in Missile.update()

**Search pattern:** The movement block in `update(dt)` starts with:
```
        if (this.launchPhase) {
```
(line ~6283) and ends just before:
```
        // Off screen check
```
(line ~6347)

**Replace** that entire movement block (from `if (this.launchPhase) {` through the closing `}` of the `} else {` homing block, ending right before `// Off screen check`).

New movement logic:

```js
        if (this.phase === 'LEGACY_LAUNCH') {
            // === Legacy UFO launch: fan down + spiral (unchanged behavior) ===
            let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0) {
                let perpX = -this.vy / speed;
                let perpY = this.vx / speed;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                this.x += (this.vx + perpX * spiralOffset * 3) * dt;
                this.y += (this.vy + perpY * spiralOffset * 3) * dt;
            } else {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
            }
            this.vy -= 100 * dt;
            if (this.age > this.launchDuration) {
                this.phase = 'HOMING';
            }

        } else if (this.phase === 'LAUNCH') {
            // === Phase 1: Launch burst upward (0 to ~0.3s) ===
            let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0) {
                let perpX = -this.vy / speed;
                let perpY = this.vx / speed;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp * 0.5;
                this.x += (this.vx + perpX * spiralOffset * 3) * dt;
                this.y += (this.vy + perpY * spiralOffset * 3) * dt;
            } else {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
            }
            if (this.age > this.launchDuration) {
                this.phase = 'DECEL';
            }

        } else if (this.phase === 'DECEL') {
            // === Phase 2: Rising deceleration (0.3s to ~0.6s) ===
            // Bleed off upward momentum with drag
            const decelFactor = 0.92; // per-frame drag
            this.vx *= decelFactor;
            this.vy *= decelFactor;
            // Gravity pulls down slightly
            this.vy += 200 * dt;

            let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0) {
                let perpX = -this.vy / speed;
                let perpY = this.vx / speed;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                this.x += (this.vx + perpX * spiralOffset * 3) * dt;
                this.y += (this.vy + perpY * spiralOffset * 3) * dt;
            } else {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
            }

            const phaseAge = this.age - this.launchDuration;
            if (phaseAge > this.decelDuration) {
                this.phase = 'APEX';
                this.apexStart = this.age;
            }

        } else if (this.phase === 'APEX') {
            // === Phase 3: Apex tension (~0.6s to ~0.8s) ===
            // Nearly weightless hang — tiny drift, subtle wobble
            this.vx *= 0.85;
            this.vy *= 0.85;
            let spiralOffset = Math.sin(this.age * this.spiralFreq * 2 + this.spiralPhase) * this.spiralAmp * 0.3;
            this.x += (this.vx + spiralOffset * 0.5) * dt;
            this.y += this.vy * dt;

            // Apex flash (brief bright pulse at lock-on moment)
            if (!this.apexFlashed) {
                this.apexFlashed = true;
                this.apexFlashTimer = 0.12;
            }
            if (this.apexFlashTimer > 0) {
                this.apexFlashTimer -= dt;
            }

            const apexAge = this.age - this.apexStart;
            if (apexAge > this.apexDuration) {
                this.phase = 'DIVE';
            }

        } else if (this.phase === 'DIVE') {
            // === Phase 4: Attack dive (0.8s+) — snap toward target ===
            if (this.targetTank && this.targetTank.alive !== false) {
                let tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
                let ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
                let dx = tx - this.x;
                let dy = ty - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1) dist = 1;

                const diveAge = this.age - this.apexStart - this.apexDuration;
                let speed = CONFIG.MISSILE_DIVE_RAMP_SPEED;
                let homingStrength = Math.min(1, diveAge * 3); // locks in fast

                let perpX = -dy / dist;
                let perpY = dx / dist;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                spiralOffset *= Math.max(0, 1 - homingStrength * 0.7); // spiral tightens

                this.vx = (dx / dist * speed * homingStrength) + perpX * spiralOffset * 3;
                this.vy = (dy / dist * speed * homingStrength) + perpY * spiralOffset * 3;

                this.x += this.vx * dt;
                this.y += this.vy * dt;

                if (dist < 30) {
                    this.hit();
                }
            } else {
                this.retarget();
                let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < 1) speed = 1;
                let dirX = this.vx / speed;
                let dirY = this.vy / speed;
                let perpX = -dirY;
                let perpY = dirX;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                this.x += (this.vx + perpX * spiralOffset * 3) * dt;
                this.y += (this.vy + perpY * spiralOffset * 3) * dt;
            }

        } else if (this.phase === 'HOMING') {
            // === Legacy homing phase (for UFO-launched missiles) ===
            if (this.targetTank && this.targetTank.alive !== false) {
                let tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
                let ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
                let dx = tx - this.x;
                let dy = ty - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1) dist = 1;

                let speed = CONFIG.MISSILE_SWARM_SPEED;
                let homingStrength = Math.min(1, (this.age - this.launchDuration) * 2);

                let perpX = -dy / dist;
                let perpY = dx / dist;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                spiralOffset *= Math.max(0, 1 - homingStrength * 0.5);

                this.vx = (dx / dist * speed * homingStrength) + perpX * spiralOffset * 3;
                this.vy = (dy / dist * speed * homingStrength) + perpY * spiralOffset * 3;

                this.x += this.vx * dt;
                this.y += this.vy * dt;

                if (dist < 30) {
                    this.hit();
                }
            } else {
                this.retarget();
                let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < 1) speed = 1;
                let dirX = this.vx / speed;
                let dirY = this.vy / speed;
                let perpX = -dirY;
                let perpY = dirX;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                this.x += (this.vx + perpX * spiralOffset * 3) * dt;
                this.y += (this.vy + perpY * spiralOffset * 3) * dt;
            }
        }
```

#### 2B. Adjust off-screen bounds for upward flight

**Search pattern:** `if (this.y > canvas.height + 50 || this.x < -100 || this.x > canvas.width + 100 || this.y < -200) {`

**Replace with:**
```js
        if (this.y > canvas.height + 50 || this.x < -100 || this.x > canvas.width + 100 || this.y < -400) {
```

Change: `-200` to `-400` — coordinator-launched missiles fly higher before diving, so they need more headroom above the canvas before being culled.

### Testable after this unit

UFO-launched missiles should still work exactly as before (LEGACY_LAUNCH -> HOMING). The four-phase code paths (LAUNCH/DECEL/APEX/DIVE) exist but are not yet triggered because no code sets `fromCoordinator = true` yet.

---

## Unit 3: Rewrite fireMissileSwarm() to route through coordinators

**Implements:** Design section 1 (launch source switching, split across coordinators, UFO fallback)

**What it does:** Modifies `fireMissileSwarm()` to detect alive attack coordinators, split missiles across them, and spawn from coordinator positions with upward fan angles. Falls back to UFO launch when no coordinators are available.

### Edits

#### 3A. Replace the launch loop and floating text in fireMissileSwarm()

**Search pattern:** Starting from the comment:
```
    // Launch missiles in fan pattern from UFO position
```
(line ~9726) through the end of:
```
    createFloatingText(ufo.x, ufo.y + 50, 'MISSILE SWARM!', '#ff2200');
```
(line ~9750, just before the closing `}` of `fireMissileSwarm`).

**Replace** that block with:

```js
    // Check for alive, non-DYING attack coordinators
    const launchCoords = activeCoordinators.filter(c => c.type === 'attack' && c.alive && c.state !== 'DYING');

    if (launchCoords.length > 0) {
        // === COORDINATOR LAUNCH: split missiles across active attack coordinators ===
        const swarmCount = targetAssignments.length;
        const perCoord = Math.floor(swarmCount / launchCoords.length);
        let remainder = swarmCount % launchCoords.length;
        let assignmentIndex = 0;

        for (let c = 0; c < launchCoords.length; c++) {
            const coord = launchCoords[c];
            const count = perCoord + (c < remainder ? 1 : 0);
            // Fan spread upward (-PI/2 is straight up), fan across ~0.6 radians
            const fanSpread = Math.PI * 0.6;
            const centerAngle = -Math.PI / 2; // straight up
            const startAngle = centerAngle - fanSpread / 2;

            for (let i = 0; i < count; i++) {
                const launchAngle = count > 1
                    ? startAngle + (fanSpread * i / (count - 1))
                    : centerAngle;
                const missile = new Missile(
                    coord.x,
                    coord.y,
                    targetAssignments[assignmentIndex],
                    launchAngle,
                    true // fromCoordinator
                );
                playerMissiles.push(missile);
                assignmentIndex++;
            }

            // Trigger launch flash on coordinator
            coord.missileLaunchFlash = 0.2; // seconds remaining for flash effect
        }

        // Floating text at centroid of launching coordinators
        const centroidX = launchCoords.reduce((sum, c) => sum + c.x, 0) / launchCoords.length;
        const centroidY = launchCoords.reduce((sum, c) => sum + c.y, 0) / launchCoords.length;
        createFloatingText(centroidX, centroidY + 30, 'MISSILE SWARM!', '#ff2200');

    } else {
        // === UFO FALLBACK: original downward fan pattern ===
        const swarmCount = targetAssignments.length;
        const fanSpread = Math.PI * 0.6;
        const startAngle = Math.PI / 2 - fanSpread / 2;

        for (let i = 0; i < swarmCount; i++) {
            const launchAngle = startAngle + (fanSpread * i / Math.max(1, swarmCount - 1));
            const missile = new Missile(
                ufo.x,
                ufo.y + ufo.height / 2,
                targetAssignments[i],
                launchAngle,
                false
            );
            playerMissiles.push(missile);
        }

        createFloatingText(ufo.x, ufo.y + 50, 'MISSILE SWARM!', '#ff2200');
    }
```

### Testable after this unit

- With attack coordinators deployed: missiles should launch from coordinator positions, fan upward, go through 4-phase arc, and dive onto targets.
- Without attack coordinators: missiles should launch from UFO exactly as before.
- With 2 coordinators and 7 missiles: one gets 4, other gets 3.
- Manual fire (X key) and auto-fire both route through this same function.

---

## Unit 4: Add coordinator launch flash visual effect

**Implements:** Design section 3 (launch effect on coordinators, recoil glow pulse)

**What it does:** Adds the `missileLaunchFlash` property to the `AttackCoordinator` constructor, ticks it down in `update()`, and renders an orange/red muzzle flash in `render()`. Also initializes the property in the Coordinator base class to avoid undefined checks.

### Edits

#### 4A. Initialize missileLaunchFlash in AttackCoordinator constructor

**Search pattern:** Inside `class AttackCoordinator extends Coordinator {`, find:
```
        this.missileInterval = 5.0; // Fire missiles every 5 seconds
    }
```

**Replace** with:
```
        this.missileInterval = 5.0; // Fire missiles every 5 seconds
        this.missileLaunchFlash = 0; // Remaining flash duration on launch
    }
```

#### 4B. Tick down missileLaunchFlash in AttackCoordinator.update()

**Search pattern:** Inside `AttackCoordinator`'s `update(dt)`, find the line:
```
        if (this.state !== 'ACTIVE' && this.state !== 'LOW_ENERGY') return;
```

**Insert BEFORE** that line:
```
        // Tick launch flash timer (runs in all states so flash fades even during transitions)
        if (this.missileLaunchFlash > 0) this.missileLaunchFlash -= dt;
```

#### 4C. Render launch flash in AttackCoordinator.render()

**Search pattern:** In `AttackCoordinator.render()`, find the line:
```
        super.render();
```

**Insert AFTER** that line (before the `// Visual: weapon ready indicators` comment):
```
        // Missile launch flash effect
        if (this.missileLaunchFlash > 0) {
            const flashAlpha = (this.missileLaunchFlash / 0.2) * 0.7;
            const flashRadius = 20 + (1 - this.missileLaunchFlash / 0.2) * 15;
            ctx.save();
            ctx.globalAlpha = flashAlpha;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, flashRadius);
            gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
            gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, flashRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
```

### Testable after this unit

When missiles launch from coordinators, you should see a brief orange/red flash at each coordinator's position that fades over 0.2 seconds.

---

## Unit 5: Add apex lock-on flash in Missile.render()

**Implements:** Design section 3 (apex moment visual)

**What it does:** Adds a bright white/yellow point-flash on coordinator-launched missiles during the apex phase when `apexFlashTimer > 0`.

### Edits

#### 5A. Add apex flash rendering in Missile.render()

**Search pattern:** In `Missile.render(ctx)`, find the block:
```
        // Nose glow
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(4, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
```

**Replace** with:
```
        // Nose glow
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(4, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Apex lock-on flash (coordinator missiles only)
        if (this.apexFlashTimer > 0) {
            const flashAlpha = (this.apexFlashTimer / 0.12) * 0.9;
            const flashRadius = 8 + (1 - this.apexFlashTimer / 0.12) * 6;
            ctx.save();
            ctx.globalAlpha = flashAlpha;
            ctx.shadowColor = '#ffffaa';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ffffffcc';
            ctx.beginPath();
            ctx.arc(this.x, this.y, flashRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
```

Note: The apex flash renders in world coordinates (after the `ctx.restore()` for the rotated missile body), since the flash is a screen-space glow effect centered on the missile's world position.

### Testable after this unit

When coordinator-launched missiles reach the apex phase, each one should display a brief white/yellow flash as it "locks on" before diving.

---

## Execution Order Summary

| Unit | Description | Search anchor | Dependencies |
|------|-------------|---------------|-------------|
| 1 | CONFIG constants + Missile constructor | `MISSILE_RECHARGE_TIME: 5,` and `constructor(x, y, targetTank, launchAngle)` | None |
| 2 | Missile.update() four-phase state machine | `if (this.launchPhase) {` through `// Off screen check` | Unit 1 |
| 3 | fireMissileSwarm() coordinator routing | `// Launch missiles in fan pattern from UFO position` through `'MISSILE SWARM!'` floating text | Units 1, 2 |
| 4 | AttackCoordinator launch flash | `this.missileInterval = 5.0;` and `super.render();` in AttackCoordinator | Unit 3 (uses `missileLaunchFlash` set in Unit 3) |
| 5 | Apex lock-on flash in Missile.render() | `// Nose glow` block through closing `}` of render | Unit 2 (uses `apexFlashTimer` set in Unit 2) |

## Key invariants to preserve

- `fireMissileSwarm()` is called from exactly two places: manual key press (line ~2497) and `AttackCoordinator.autoMissile()` (line ~9068). Both callers should work unchanged.
- Ammo consumption (`missileAmmo = 0; missileRechargeTimer = ...`) happens AFTER the launch loop and must not be moved or duplicated.
- `playerMissiles` array is the single collection for all active missiles regardless of launch source.
- Target assignment logic (heavy tanks priority, distribute evenly) is NOT modified — only the spawning/trajectory changes.
- The `retarget()` and `hit()` methods are NOT modified.
- `missileTargetReticles` and lock-on sound logic before the launch loop are NOT modified.
