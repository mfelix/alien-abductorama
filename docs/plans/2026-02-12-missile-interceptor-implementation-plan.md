# Missile Interceptor & Anime Kinematics — Unified Implementation Plan

## Overview

This plan synthesizes three research deliverables into a single implementation specification:
1. **Architecture Code Map** — exact line ranges and data structures in game.js
2. **Interceptor Mechanics Spec** — threat detection, prioritization, claiming, interception
3. **Anime Kinematics Spec** — PN guidance, thrust-steered model, Itano Circus feel

All changes target `/Users/mfelix/code/alien-abductorama/js/game.js` (19,115 lines).

---

## Implementation Phases

Because game.js is monolithic, all edits must be sequential. We break implementation into 7 non-overlapping edit blocks, ordered from top-of-file to bottom-of-file to prevent line-number drift from invalidating later references.

### Phase 1: CONFIG Constants (insert after line 301)

**What**: Add new config values for the interceptor system and kinematics.
**Why**: All subsequent code references these constants.

```js
// === EXPANSION: Missile Interceptor & Kinematics ===
MISSILE_INTERCEPT_RADIUS: 25,
MISSILE_INTERCEPT_NEAR_RANGE: 200,
MISSILE_INTERCEPT_PROXIMITY_MAX: 600,
MISSILE_INTERCEPT_URGENCY_MAX: 400,
MISSILE_PN_CONSTANT: 3.5,
MISSILE_MAX_TURN_RATE: 6.0,
MISSILE_TURN_RESPONSIVENESS: 12.0,
MISSILE_DIVE_THRUST: 1800,
MISSILE_DRAG_LAUNCH: 0.5,
MISSILE_DRAG_DECEL: 3.0,
MISSILE_DRAG_DIVE: 1.2,
MISSILE_DECEL_GRAVITY: 400,
MISSILE_MAX_SPEED: 1100,
MISSILE_LAUNCH_WOBBLE_FREQ_MIN: 8,
MISSILE_LAUNCH_WOBBLE_FREQ_MAX: 14,
MISSILE_LAUNCH_WOBBLE_AMP_MIN: 40,
MISSILE_LAUNCH_WOBBLE_AMP_MAX: 70,
MISSILE_DIVE_WOBBLE_AMP: 15,
MISSILE_TERMINAL_WOBBLE_AMP: 2,
MISSILE_WOBBLE_DECAY_DIST: 200,
MISSILE_SNAP_ANGLE: Math.PI / 6,
MISSILE_SNAP_THRESHOLD: Math.PI / 4,
MISSILE_RETARGET_BOOST: 1.8,
MISSILE_RETARGET_BOOST_TIME: 0.15,
MISSILE_FAN_SPREAD: Math.PI * 0.7,
MISSILE_FAN_JITTER: 0.075,
MISSILE_LAUNCH_STAGGER_BASE: 0.025,
MISSILE_LAUNCH_STAGGER_JITTER: 0.04,
MISSILE_TRAIL_LENGTH: 40,
MISSILE_SMOKE_INTERVAL: 0.025,
MISSILE_MAX_LIFETIME: 3.5,
```

Also update existing values:
- `MISSILE_DECEL_DURATION: 0.12` → `0.15` (slightly longer arc-over)
- `MISSILE_APEX_DURATION: 0.06` → `0.10` (longer dramatic pause)

---

### Phase 2: Global State (insert after line 2160)

**What**: Add the `claimedThreats` Set.

```js
let claimedThreats = new Set(); // Per-frame threat claiming for missile coordination
```

---

### Phase 3: Missile Constructor Rewrite (lines 6326-6363)

**What**: Replace the constructor to add heading-based physics state, interceptor state, and enhanced wobble params.

New constructor properties:
```js
// Core physics (thrust-steered model)
this.heading = launchAngle;          // facing angle (radians)
this.speed = 0;                      // scalar speed along heading
this.turnRate = 0;                   // current angular velocity
this.prevLosAngle = 0;               // for PN guidance LOS rate calc

// Interceptor state
this.mode = 'offensive';             // 'interceptor' | 'offensive' | 'wander'
this.interceptTarget = null;         // reference to Projectile, or null

// Retarget boost
this.turnBoostTimer = 0;

// Launch stagger
this.launchDelay = 0;                // set by fireMissileSwarm()

// Enhanced wobble
this.wobblePhase = Math.random() * Math.PI * 2;
this.launchWobbleFreq = CONFIG.MISSILE_LAUNCH_WOBBLE_FREQ_MIN + Math.random() * (CONFIG.MISSILE_LAUNCH_WOBBLE_FREQ_MAX - CONFIG.MISSILE_LAUNCH_WOBBLE_FREQ_MIN);
this.launchWobbleAmp = CONFIG.MISSILE_LAUNCH_WOBBLE_AMP_MIN + Math.random() * (CONFIG.MISSILE_LAUNCH_WOBBLE_AMP_MAX - CONFIG.MISSILE_LAUNCH_WOBBLE_AMP_MIN);
this.diveWobbleFreq = 6 + Math.random() * 4;
this.diveWobbleAmp = CONFIG.MISSILE_DIVE_WOBBLE_AMP + Math.random() * 5;
this.currentWobbleAmp = this.launchWobbleAmp; // smoothly transitions between phases

// Enhanced trail
this.maxTrailLength = CONFIG.MISSILE_TRAIL_LENGTH; // 40 (up from 30)
```

Coordinator launch initialization:
```js
this.heading = launchAngle;
this.speed = CONFIG.MISSILE_LAUNCH_UP_SPEED + 50; // 550 px/s
this.vx = Math.cos(this.heading) * this.speed;
this.vy = Math.sin(this.heading) * this.speed;
```

UFO launch initialization:
```js
this.heading = launchAngle;
this.speed = Math.sqrt(200*200 + 300*300); // ~360 px/s
this.vx = Math.cos(launchAngle) * 200;
this.vy = 300;
```

---

### Phase 4: Missile.update() Rewrite (lines 6365-6556)

**What**: The core physics rewrite. Replace velocity-blending with thrust-steered PN guidance. Add interceptor scanning.

This is the largest single edit. The structure becomes:

```
update(dt):
    // Launch delay check (new)
    if (age < launchDelay) { age += dt; return; }

    age += dt

    // Trail + smoke (enhanced intervals/params)
    // ... (same structure, tuned values)

    if (phase === 'LEGACY_LAUNCH'):
        // Heading-based movement with spiral
        // After launchDuration → phase = 'HOMING', init PN state

    else if (phase === 'LAUNCH'):
        // Thrust-steered upward burst with dramatic spiral
        // heading locked, thrust + drag applied
        // After LAUNCH_DURATION → phase = 'DECEL'

    else if (phase === 'DECEL'):
        // Zero thrust, heavy drag, gravity arc-over
        // Wobble amplitude grows (widening spiral)
        // After DECEL_DURATION → phase = 'APEX'

    else if (phase === 'APEX'):
        // Near-zero movement, subtle trembling
        // Lock-on flash, PN state initialization
        // Heading snap toward target (30-degree kick)
        // After APEX_DURATION → phase = 'DIVE'

    else if (phase === 'DIVE' || phase === 'HOMING'):
        // === THE NEW CORE LOOP ===
        fuel = max(0, 1 - age / MAX_LIFETIME)

        // PRIMARY: Scan for interceptable threats
        interceptTarget = scanForThreats()

        if (interceptTarget):
            mode = 'interceptor'
            targetTank = null
            // Lead targeting: predict intercept point
            timeToIntercept = dist / speed
            tx = intercept.x + intercept.vx * timeToIntercept
            ty = intercept.y + intercept.vy * timeToIntercept
        else:
            interceptTarget = null
            retarget()  // SECONDARY: find nearest tank
            if (targetTank alive):
                mode = 'offensive'
                tx = tank center
                ty = tank center
            else:
                mode = 'wander'

        if (mode !== 'wander'):
            // === PROPORTIONAL NAVIGATION ===
            losAngle = atan2(ty - y, tx - x)
            losRate = angleDiff(losAngle, prevLosAngle) / dt
            prevLosAngle = losAngle

            commandedAccel = PN_CONSTANT * speed * losRate
            desiredTurnRate = clamp(commandedAccel / speed, -maxTurn, maxTurn)

            // Speed-dependent turn rate (wider arcs at high speed)
            effectiveMaxTurn = MAX_TURN_RATE * (800 / max(speed, 800))
            effectiveMaxTurn *= (0.3 + 0.7 * fuel)  // degrades with fuel

            // Retarget boost
            if (turnBoostTimer > 0):
                effectiveMaxTurn *= RETARGET_BOOST
                turnBoostTimer -= dt

            // Terminal boost (close to target)
            if (dist < 150):
                effectiveMaxTurn *= 1.5
                wobbleAmp → near zero

            desiredTurnRate = clamp(desiredTurnRate, -effectiveMaxTurn, effectiveMaxTurn)
            turnRate = lerp(turnRate, desiredTurnRate, TURN_RESPONSIVENESS * dt)
            heading += turnRate * dt

            // Thrust + drag
            thrust = DIVE_THRUST * (0.4 + 0.6 * fuel)
            speed += (thrust - DRAG_DIVE * speed) * dt
            speed = clamp(speed, 0, MAX_SPEED)

            // Terminal speed boost
            if (dist < 150): speed *= 1 + 0.3 * dt
        else:
            // Wander behavior (enhanced version of current)
            // Escalating chaos, random heading perturbation, gravity

        // Velocity from heading
        vx = cos(heading) * speed
        vy = sin(heading) * speed

        // Perpendicular wobble
        wobblePhase += activeWobbleFreq * dt
        wobbleOffset = sin(wobblePhase) * currentWobbleAmp
        perpX = -sin(heading)
        perpY = cos(heading)

        // Integrate position
        x += vx * dt + perpX * wobbleOffset * dt
        y += vy * dt + perpY * wobbleOffset * dt

    // Ground collision (unchanged, update lifetime to MAX_LIFETIME)
    // Off-screen check (unchanged)
    // Max lifetime → CONFIG.MISSILE_MAX_LIFETIME (3.5s, up from 3s)
```

Key differences from current code:
- **Heading is tracked explicitly** — not derived from velocity
- **PN guidance** replaces velocity blending — produces sweeping curves
- **Turn rate is rate-limited** — can't instantly change direction
- **Thrust/drag model** — missile accelerates/decelerates physically
- **Speed-dependent turn radius** — faster = wider arcs
- **Fuel affects both thrust AND turn rate** — degrading over time
- **Interceptor scan runs BEFORE offensive retarget** — threats take priority
- **Lead targeting** for intercepts — aims at predicted position
- **Terminal approach** — wobble decays, thrust boosts, turn rate boosts within 150px

---

### Phase 5: New Methods on Missile (insert after retarget(), ~line 6574)

**What**: Add `scanForThreats()`, `minDistanceToAnyFriendly()`, `isNearFriendly()`.

```js
scanForThreats() {
    let bestTarget = null;
    let bestScore = -1;

    for (const p of projectiles) {
        if (!p.alive) continue;
        if (claimedThreats.has(p)) continue;
        if (p.vy >= 0 && !this.isNearFriendly(p, CONFIG.MISSILE_INTERCEPT_NEAR_RANGE)) continue;

        const distToMe = Math.hypot(p.x - this.x, p.y - this.y);
        const minDistToFriendly = this.minDistanceToAnyFriendly(p);

        const proximityScore = 50 * (1 - Math.min(distToMe / CONFIG.MISSILE_INTERCEPT_PROXIMITY_MAX, 1));
        const urgencyScore = 40 * (1 - Math.min(minDistToFriendly / CONFIG.MISSILE_INTERCEPT_URGENCY_MAX, 1));
        const valueScore = p.type === 'missile' ? 10 : 0;
        const score = proximityScore + urgencyScore + valueScore;

        if (score > bestScore) {
            bestScore = score;
            bestTarget = p;
        }
    }

    if (bestTarget) {
        claimedThreats.add(bestTarget);
    }
    return bestTarget;
}

minDistanceToAnyFriendly(p) {
    let minDist = Infinity;
    if (ufo) {
        minDist = Math.min(minDist, Math.hypot(p.x - ufo.x, p.y - ufo.y));
    }
    for (const drone of activeDrones) {
        if (!drone.alive) continue;
        const dx = drone.x + (drone.width || 0) / 2;
        const dy = drone.y + (drone.height || 0) / 2;
        minDist = Math.min(minDist, Math.hypot(p.x - dx, p.y - dy));
    }
    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        minDist = Math.min(minDist, Math.hypot(p.x - coord.x, p.y - coord.y));
        for (const drone of (coord.subDrones || [])) {
            if (!drone.alive) continue;
            minDist = Math.min(minDist, Math.hypot(p.x - drone.x, p.y - drone.y));
        }
    }
    return minDist;
}

isNearFriendly(p, range) {
    return this.minDistanceToAnyFriendly(p) < range;
}
```

---

### Phase 6: Missile.render() Updates (lines 6604-6674)

**What**: Mode-dependent nose glow color, enhanced trail rendering, exhaust flicker.

Changes:
1. **Nose glow**: `this.mode === 'interceptor' ? '#00ccff' : '#ffaa00'` (line ~6651)
2. **Nose shadow**: `this.mode === 'interceptor' ? '#0088ff' : '#ff4400'` (line ~6649)
3. **Exhaust flicker**: Add alpha oscillation to trail: `flickerAlpha = 0.7 + 0.3 * Math.sin(this.age * 40)`
4. **Trail alpha**: Slow fade slightly: `t.age * 1.8` instead of `t.age * 2` (line ~6624)
5. **Smoke density during turns**: When `Math.abs(this.turnRate) > 3`, increase puff spawn rate + size
6. **Heading-based body rotation**: Use `this.heading` instead of `Math.atan2(this.vy, this.vx)` (line ~6638) — ensures body points along thrust, not along velocity (visible during turns)

---

### Phase 7: updateMissiles() Changes (lines 10228-10310)

**What**: Add intercept collision check, claimedThreats lifecycle.

Insert at the top of `updateMissiles()`:
```js
claimedThreats.clear();
```

Insert BEFORE the "Collision with ANY enemy" block (before line 10233):
```js
// Intercept collision: player missiles vs enemy projectiles
for (const missile of playerMissiles) {
    if (!missile.alive) continue;
    if (missile.phase === 'LAUNCH' || missile.phase === 'DECEL' || missile.phase === 'APEX') continue;
    if (!missile.interceptTarget || !missile.interceptTarget.alive) continue;

    const dist = Math.hypot(missile.x - missile.interceptTarget.x, missile.y - missile.interceptTarget.y);
    if (dist < CONFIG.MISSILE_INTERCEPT_RADIUS) {
        missile.alive = false;
        missile.interceptTarget.alive = false;
        createExplosion(missile.x, missile.y, 'small');
        screenShake = Math.max(screenShake, 0.1);
        createFloatingText(missile.x, missile.y, 'INTERCEPTED!', '#00ccff');
    }
}
```

---

### Phase 8: fireMissileSwarm() Tuning (lines 10116-10226)

**What**: Wider fan spread, per-missile angle jitter, launch stagger.

Changes:
1. Fan spread: `Math.PI * 0.6` → `CONFIG.MISSILE_FAN_SPREAD` (0.7 * PI = 126 degrees)
2. Per-missile jitter: `launchAngle += (Math.random() - 0.5) * CONFIG.MISSILE_FAN_JITTER * 2`
3. Launch stagger: `missile.launchDelay = i * CONFIG.MISSILE_LAUNCH_STAGGER_BASE + Math.random() * CONFIG.MISSILE_LAUNCH_STAGGER_JITTER`

These apply to both coordinator launch and UFO fallback paths.

---

### Phase 9: Game Reset (line ~11226)

**What**: Clear new state on game reset.

After `playerMissiles = [];` add:
```js
claimedThreats.clear();
```

---

## Implementation Strategy

Given the monolithic file, implementation MUST be done by a single agent working sequentially through Phases 1-9 in order. Each phase is a self-contained edit block at a specific line range, applied top-to-bottom so line numbers remain valid.

**The big edit is Phase 4** (Missile.update rewrite). This is ~190 lines being replaced with ~250 lines. It must be done as a single coherent edit — no partial updates. The new code must integrate:
- Thrust-steered physics from the kinematic spec
- Interceptor scanning from the mechanics spec
- Proportional navigation guidance
- All phase transitions (LAUNCH, DECEL, APEX, DIVE/HOMING, LEGACY_LAUNCH)
- Wobble system
- Terminal approach behavior

**Testing checkpoints** after implementation:
1. Missiles still launch and fly (basic sanity)
2. Missiles curve toward targets with visible arcs (PN working)
3. Missiles intercept enemy projectiles (interceptor working)
4. "INTERCEPTED!" text appears in cyan
5. Excess missiles attack tanks (fallback to offensive)
6. Missiles show squirrely wobble during cruise
7. Wobble decays on terminal approach
8. Launch stagger creates ripple effect
9. Nose glow changes to cyan when intercepting
10. Coordinator launch still works with four-phase arc
11. UFO fallback launch still works
12. No performance issues with max entities

## Files Modified

- `js/game.js` — ALL changes in this single file
- `docs/plans/2026-02-12-missile-interceptor-mechanics-spec.md` — already created (reference)
- `docs/plans/2026-02-12-missile-interceptor-implementation-plan.md` — this file

## Risk Assessment

- **Highest risk**: Phase 4 (update rewrite) — any bug here breaks all missiles
- **Mitigation**: Preserve exact phase transition logic, only change movement physics within phases
- **Rollback**: `git stash` or `git checkout js/game.js` restores everything
