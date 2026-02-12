# Missile Interceptor Mechanics Specification

## Overview

Player missiles (the `Missile` class, fired via X key or auto-fired by attack coordinators) gain a new PRIMARY behavior: **defensive interception**. Before seeking enemy tanks, each missile scans for incoming enemy projectiles (`Projectile` instances from the global `projectiles` array) that threaten friendly entities, and intercepts them. The existing offensive homing behavior becomes SECONDARY, activated only when no interceptable threats exist.

---

## 1. Terminology

| Term | Definition |
|------|-----------|
| **Swarm missile** | A `Missile` instance in `playerMissiles[]`. Launched by the player (X key) or auto-fired by `AttackCoordinator`. |
| **Enemy projectile** | A `Projectile` instance in `projectiles[]`. Fired by `Tank.fire()` (shells every shot, missiles every 4th shot) or `HeavyTank.fire()` (always missiles). Type is `'shell'` or `'missile'`. |
| **Friendly entity** | The UFO (`ufo`), any alive drone in `activeDrones[]`, any alive coordinator in `activeCoordinators[]`, and any alive sub-drone under coordinators (`coord.subDrones[]`). |
| **Threat** | An enemy projectile that is predicted to pass within strike distance of a friendly entity. |
| **Intercept** | A swarm missile collides with an enemy projectile, destroying both. |

---

## 2. When Interception Applies

Interception logic ONLY runs during the missile's **terminal homing phases**: `DIVE` and `HOMING` (and `LEGACY_LAUNCH` after its launch duration expires, i.e., the homing tail of the legacy path). During `LAUNCH`, `DECEL`, and `APEX` phases, missiles are still in their dramatic launch trajectory and do not scan for threats.

This matches the existing pattern where collision checks in `updateMissiles()` already skip these phases.

---

## 3. Threat Detection System

### 3.1 What Qualifies as a Threat

An enemy projectile qualifies as a threat if **all** of these are true:

1. `projectile.alive === true`
2. The projectile is **moving toward the friendly zone** (i.e., `projectile.vy < 0` — moving upward toward UFO/coordinators, OR the projectile is within 200px vertically of any friendly entity). This filters out projectiles that are already past all friendlies and heading off-screen.
3. The projectile is **not already claimed** by another missile (see section 6).

Notably, we do NOT require the projectile to be on a precise collision course with a specific friendly. The philosophy is: "if something hostile is in the air and heading our way, blow it up." This is simpler to implement, more visually satisfying (missiles actively hunting projectiles), and avoids expensive per-frame trajectory prediction math.

### 3.2 Scan Method: Global Array Scan

Each missile in its homing phase iterates over the `projectiles[]` array. Given typical projectile counts (3-15 projectiles at most, even in heavy waves), this is O(missiles * projectiles), which with max ~6 missiles and ~15 projectiles is only ~90 checks per frame — negligible.

### 3.3 Scan Frequency

Every frame, as part of the existing `Missile.update(dt)` call. The scan replaces the current `retarget()` call at the top of the DIVE/HOMING phase logic. Instead of calling `retarget()` first, the missile calls a new `scanForThreats()` method, and only falls through to `retarget()` if no threats are found.

---

## 4. Threat Prioritization Algorithm

When a missile finds multiple valid threats, it picks one using this priority:

### 4.1 Priority Score Formula

```
score = proximityScore + urgencyScore + valueScore
```

**proximityScore** (0-50): How close the projectile is to this missile. Closer = higher priority. Ensures missiles intercept threats they can actually reach.
```
proximityScore = 50 * (1 - clamp(distToProjectile / 600, 0, 1))
```

**urgencyScore** (0-40): How close the projectile is to hitting ANY friendly. Closer to a friendly = more urgent. Prevents last-second misses.
```
minDistToFriendly = min distance from projectile to any alive friendly entity
urgencyScore = 40 * (1 - clamp(minDistToFriendly / 400, 0, 1))
```

**valueScore** (0-10): Enemy missiles are higher priority than shells because they deal 25 damage vs 10.
```
valueScore = projectile.type === 'missile' ? 10 : 0
```

The missile selects the threat with the **highest total score**.

### 4.2 Why This Formula

- **Proximity dominates** (50 points max) because a missile that's 600px away from a threat can't help anyway — it should pick the closest threat it can reach.
- **Urgency is secondary** (40 points max) so that between two equidistant threats, the one about to hit a friendly wins.
- **Value is a tiebreaker** (10 points max) so enemy missiles (25 damage) are slightly preferred over shells (10 damage) when other factors are similar.

---

## 5. Interception Mechanics

### 5.1 Homing Toward Threats

When a missile has an active intercept target, it uses the **same homing math** as the existing DIVE/HOMING phase targeting, but with the enemy projectile's current position as the target instead of a tank's center. The existing `homingStrength`, fuel decay, spiral wobble, and speed values all apply identically.

Implementation: in the DIVE/HOMING code block, instead of:
```js
let tx = this.targetTank.x + ...
let ty = this.targetTank.y + ...
```
it becomes:
```js
let tx, ty;
if (this.interceptTarget) {
    tx = this.interceptTarget.x;
    ty = this.interceptTarget.y;
} else if (this.targetTank && this.targetTank.alive !== false) {
    tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
    ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
}
```

The rest of the homing, spiral, and fuel-decay logic stays exactly the same.

### 5.2 Lead Targeting (Predicted Intercept Point)

Because enemy projectiles move fast (shells at 300 px/s, enemy missiles at 500 px/s), a naive "home toward current position" will often miss. The missile should aim at a **predicted intercept point** — where the projectile will be when the missile arrives.

```
timeToIntercept = distToProjectile / missileSpeed
predictedX = projectile.x + projectile.vx * timeToIntercept
predictedY = projectile.y + projectile.vy * timeToIntercept
```

This is a first-order approximation (ignores the missile's own turning), but it's good enough for satisfying gameplay. The missile's homing correction each frame self-corrects any residual error.

Use `predictedX, predictedY` as the target position instead of raw `projectile.x, projectile.y`.

### 5.3 Intercept Collision Radius

Intercepts use a **generous collision radius of 25px** (missile center to projectile center). This is deliberately larger than the existing enemy-missile hit radius (~30px for tanks, which are big) because:
- Projectiles are small (radius 4 for shells, 6 for missiles)
- The missile is also small
- Missing an intercept by 5px feels terrible — it should be forgiving
- 25px is still visually plausible (the explosion "catches" the projectile)

### 5.4 On Intercept: Mutual Destruction

When a swarm missile intercepts an enemy projectile:

1. `missile.alive = false`
2. `projectile.alive = false`
3. `createExplosion(missile.x, missile.y, 'small')` — same small explosion as current missile-on-drone collision
4. `screenShake = Math.max(screenShake, 0.1)` — light screen shake, less than a tank hit
5. `createFloatingText(missile.x, missile.y, 'INTERCEPTED!', '#00ccff')` — cyan text to distinguish from offensive hits

The missile does NOT survive the intercept. This is critical for balance: missiles are a limited resource (3-6 per salvo, 5s recharge). Making them single-use interceptors creates meaningful cost. The player is "spending" offensive missiles on defense.

### 5.5 Intercept Collision Check Location

The intercept collision check happens in `updateMissiles()`, as a new block inserted **before** the existing enemy collision block. Order of collision checks in `updateMissiles()`:

1. **NEW: Intercept check** — missile vs projectiles (if missile has `interceptTarget`)
2. Existing: missile vs enemies (tanks)
3. Existing: missile vs friendlies (drones, coordinators)

This ensures intercepts are processed before offensive hits.

---

## 6. Missile Coordination: Threat Claiming

### 6.1 The Problem

With 3-6 missiles in a salvo, without coordination all missiles might chase the same enemy projectile, wasting 5 missiles on one shell when 5 other shells are incoming.

### 6.2 Solution: Claimed Threats Set

A global `Set` called `claimedThreats` is maintained per frame. It stores references to projectiles that already have a missile assigned to intercept them.

**Lifecycle:**
1. At the start of each `updateMissiles()` call, clear the set: `claimedThreats.clear()`
2. Missiles are processed in array order. When missile N selects threat T via `scanForThreats()`, add T to `claimedThreats`.
3. When missile N+1 scans, it skips any projectile in `claimedThreats`.
4. If missile N's intercept target dies (already destroyed by something else), the claim is released next frame when the set is rebuilt.

**Processing order matters:** Missiles earlier in the array get first pick. This is fine — there's no meaningful unfairness, and it ensures O(1) claim checks.

### 6.3 Overclaiming Edge Case

If there are more threats than missiles, some threats go unclaimed and will hit friendlies. This is intentional — missiles are a limited defense. The player must also dodge, use shields, and position the fleet wisely.

If there are more missiles than threats, excess missiles fall through to offensive targeting (section 7).

---

## 7. Mode Switching Logic

### 7.1 State Machine Per Missile

Each missile tracks its current mode via a new property `this.mode`:

- `'interceptor'` — actively homing toward an enemy projectile
- `'offensive'` — homing toward a tank (existing behavior)
- `'wander'` — no targets at all (existing wander behavior)

### 7.2 Decision Flow (Every Frame in DIVE/HOMING Phase)

```
1. Call scanForThreats()
2. If threat found:
     mode = 'interceptor'
     interceptTarget = bestThreat
     (clear targetTank)
3. Else:
     interceptTarget = null
     Call retarget() (existing logic — finds nearest tank)
     If tank found:
         mode = 'offensive'
     Else:
         mode = 'wander'
```

### 7.3 Free Switching — No Hysteresis

Missiles can switch between interceptor and offensive mode **freely every frame**. There is no hysteresis or cooldown. Rationale:

- Missile lifetime is only 3 seconds. Any delay in switching wastes precious time.
- The threat claiming system already prevents rapid oscillation (once claimed, a threat stays claimed for that frame).
- Visually, the missile's spiral motion makes mode switches feel smooth — it curves toward the new target naturally.
- If a new enemy projectile appears mid-flight, the missile SHOULD immediately respond. That's the entire point of the interceptor system.

### 7.4 Switching Back to Offensive

If a missile is in interceptor mode and its target projectile is destroyed (by another missile, by going off-screen, etc.), the missile immediately falls through to step 3 on the next frame: it either finds another threat or switches to offensive mode. No special handling needed — the `projectile.alive === false` check in `scanForThreats()` naturally excludes dead projectiles.

---

## 8. Missile Class Changes Summary

### 8.1 New Properties on `Missile`

```js
this.mode = 'offensive';           // 'interceptor' | 'offensive' | 'wander'
this.interceptTarget = null;       // Reference to a Projectile instance, or null
```

### 8.2 New Method: `scanForThreats()`

```js
scanForThreats() {
    let bestTarget = null;
    let bestScore = -1;

    for (const p of projectiles) {
        if (!p.alive) continue;
        if (claimedThreats.has(p)) continue;

        // Filter: projectile must be heading toward friendly zone
        // (vy < 0 means heading upward, or within 200px of any friendly)
        if (p.vy >= 0 && !this.isNearFriendly(p, 200)) continue;

        // Score this threat
        const distToMe = Math.hypot(p.x - this.x, p.y - this.y);
        const minDistToFriendly = this.minDistanceToAnyFriendly(p);

        const proximityScore = 50 * (1 - Math.min(distToMe / 600, 1));
        const urgencyScore = 40 * (1 - Math.min(minDistToFriendly / 400, 1));
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
```

### 8.3 New Helper: `minDistanceToAnyFriendly(projectile)`

Returns the minimum distance from the given projectile to any alive friendly entity (UFO, drones, coordinators, sub-drones).

```js
minDistanceToAnyFriendly(p) {
    let minDist = Infinity;

    // UFO
    if (ufo) {
        minDist = Math.min(minDist, Math.hypot(p.x - ufo.x, p.y - ufo.y));
    }

    // Active drones
    for (const drone of activeDrones) {
        if (!drone.alive) continue;
        minDist = Math.min(minDist, Math.hypot(p.x - drone.x, p.y - drone.y));
    }

    // Coordinators and sub-drones
    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        minDist = Math.min(minDist, Math.hypot(p.x - coord.x, p.y - coord.y));
        for (const drone of coord.subDrones) {
            if (!drone.alive) continue;
            minDist = Math.min(minDist, Math.hypot(p.x - drone.x, p.y - drone.y));
        }
    }

    return minDist;
}
```

### 8.4 New Helper: `isNearFriendly(projectile, range)`

Returns true if the projectile is within `range` px of any friendly entity. Used to catch projectiles moving horizontally or downward that are still near friendlies.

```js
isNearFriendly(p, range) {
    return this.minDistanceToAnyFriendly(p) < range;
}
```

### 8.5 Modified `update(dt)` — DIVE/HOMING Phase

Replace the current retarget + homing block with:

```js
} else if (this.phase === 'DIVE' || this.phase === 'HOMING') {
    const fuel = Math.max(0, 1 - this.age / 3);
    const chaos = (1 - fuel);
    const baseSpeed = this.phase === 'DIVE'
        ? CONFIG.MISSILE_DIVE_RAMP_SPEED
        : CONFIG.MISSILE_SWARM_SPEED;

    // PRIMARY: scan for interceptable threats
    this.interceptTarget = this.scanForThreats();

    if (this.interceptTarget) {
        this.mode = 'interceptor';
        this.targetTank = null;

        // Lead targeting: predict intercept point
        const dist = Math.hypot(
            this.interceptTarget.x - this.x,
            this.interceptTarget.y - this.y
        );
        const timeToIntercept = dist / baseSpeed;
        let tx = this.interceptTarget.x + this.interceptTarget.vx * timeToIntercept;
        let ty = this.interceptTarget.y + this.interceptTarget.vy * timeToIntercept;

        // ... existing homing math using tx, ty ...
    } else {
        this.interceptTarget = null;
        this.retarget(); // SECONDARY: find nearest tank

        if (this.targetTank && this.targetTank.alive !== false) {
            this.mode = 'offensive';
            let tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
            let ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
            // ... existing homing math using tx, ty ...
        } else {
            this.mode = 'wander';
            // ... existing wander behavior ...
        }
    }
}
```

The homing math (homingStrength, desiredVx/Vy, spiral wobble) is identical for both interceptor and offensive modes — only the target coordinates differ.

---

## 9. `updateMissiles()` Changes

### 9.1 New Block: Intercept Collision Check

Insert before the existing "Collision with ANY enemy" block:

```js
// Intercept collision: missile vs enemy projectiles
for (const missile of playerMissiles) {
    if (!missile.alive) continue;
    if (missile.phase === 'LAUNCH' || missile.phase === 'DECEL' || missile.phase === 'APEX') continue;
    if (!missile.interceptTarget || !missile.interceptTarget.alive) continue;

    const dist = Math.hypot(
        missile.x - missile.interceptTarget.x,
        missile.y - missile.interceptTarget.y
    );
    if (dist < 25) { // Generous intercept radius
        missile.alive = false;
        missile.interceptTarget.alive = false;
        createExplosion(missile.x, missile.y, 'small');
        screenShake = Math.max(screenShake, 0.1);
        createFloatingText(missile.x, missile.y, 'INTERCEPTED!', '#00ccff');
    }
}
```

### 9.2 Claimed Threats Lifecycle

At the top of `updateMissiles()`:
```js
claimedThreats.clear();
```

Declare `claimedThreats` as a module-level `Set`:
```js
let claimedThreats = new Set();
```

---

## 10. Edge Cases

### 10.1 Missile Can't Reach Threat In Time

No special handling. The missile homes toward the threat using existing homing math with fuel decay. If it runs out of fuel (age > 3s) before reaching the threat, it explodes as normal. If the projectile hits a friendly before the missile arrives, the projectile dies, the claim is released, and the missile scans for a new target next frame.

This naturally happens and is fine — the player sees the missile TRYING to help, which feels good even when it fails.

### 10.2 More Threats Than Missiles

Excess threats are unclaimed. They hit friendlies normally. The game is designed so missiles are one layer of defense among many (dodging, shields, fleet positioning). Not every shot should be interceptable.

### 10.3 More Missiles Than Threats

Excess missiles with no intercept targets fall through to offensive mode and attack tanks. This is the natural flow: a 6-missile salvo might use 2 for interception and 4 for offense.

### 10.4 Protected Entity Destroyed While Missile Intercepting

No change in behavior. The missile is targeting a PROJECTILE, not defending a specific friendly. If the drone dies, the missile still intercepts the projectile (which might also threaten other friendlies). The urgency score calculation uses live data each frame, so dead entities are naturally excluded from future scoring.

### 10.5 Intercepting a Projectile That Was About to Miss

This can happen. A missile might intercept a projectile that would have sailed past all friendlies. The `isNearFriendly` and `vy < 0` filters mitigate this, but it's not a problem if it occasionally happens — the player sees their missile doing SOMETHING defensive, which feels correct.

### 10.6 Missile in Legacy Launch Path

Missiles launched from the UFO (LEGACY_LAUNCH phase) enter HOMING phase after 0.5s. They then gain interceptor behavior. Missiles launched from coordinators enter DIVE phase after LAUNCH+DECEL+APEX (~0.43s). Both paths eventually reach the interceptor-capable phase.

### 10.7 Intercept During Wander

If a missile is wandering (no targets) and a new projectile appears, the next frame's `scanForThreats()` will find it, and the missile will switch to interceptor mode. The wander behavior provides a natural "scanning" visual — the missile spirals around aimlessly, then suddenly snaps toward a threat. This looks great.

---

## 11. Visual Differentiation (Optional Polish)

To help the player understand what's happening:

### 11.1 Nose Glow Color Change

When `this.mode === 'interceptor'`, change the missile nose glow from `#ffaa00` (yellow-orange) to `#00ccff` (cyan). This is a 1-line change in `render()` and immediately communicates "this missile is on defense."

### 11.2 Floating Text

"INTERCEPTED!" in cyan (`#00ccff`) vs offensive "HIT!" in orange. Already specified in section 5.4.

### 11.3 Trail Color Shift (Optional)

Could shift the exhaust trail from orange to blue-white when intercepting. Low priority — the nose glow is sufficient.

---

## 12. CONFIG Values

New CONFIG entries:

```js
// Interceptor system
MISSILE_INTERCEPT_RADIUS: 25,        // Collision radius for missile-vs-projectile intercept
MISSILE_INTERCEPT_NEAR_RANGE: 200,   // Range for "near friendly" projectile filter
MISSILE_INTERCEPT_PROXIMITY_MAX: 600, // Max distance for proximity scoring (further = 0 score)
MISSILE_INTERCEPT_URGENCY_MAX: 400,  // Max distance for urgency scoring (further = 0 score)
```

---

## 13. Performance Budget

**Per frame during DIVE/HOMING phase, per missile:**
- `scanForThreats()`: iterate `projectiles[]` (typically 0-15 items), compute distances to missile + min distance to friendlies (UFO + up to ~10 drones/coordinators). Worst case: 15 * 15 = 225 distance calcs per missile.
- With 6 missiles: 6 * 225 = 1,350 `Math.hypot` calls per frame.
- At 60 FPS on modern hardware, this is completely negligible (< 0.1ms).

No spatial partitioning, quadtrees, or optimization needed. The entity counts in this game are tiny.

---

## 14. Balance Considerations

### 14.1 Missile Economy

Current: 3-6 missiles per salvo, 5s recharge. Each missile is worth ~35 damage against a tank.

With interceptors: some missiles are "spent" on defense instead of offense. A salvo of 4 missiles might use 2 for interception and 2 for tank damage. This creates a natural tension:

- **Lots of incoming fire** = most missiles spent on defense, less offensive pressure, wave takes longer
- **Few incoming threats** = most missiles hit tanks, wave ends faster
- **Player choice**: positioning the UFO to avoid fire means more missiles go offensive

This is GOOD. It makes the missile system more tactically interesting without changing any numbers.

### 14.2 No New Upgrades Needed

The interceptor behavior doesn't need its own upgrade path. Missile Capacity+ and Missile Damage+ still help — more missiles = more intercepts AND more offense. The system benefits from existing upgrades naturally.

### 14.3 Interaction with Attack Coordinator Auto-Fire

Attack coordinators auto-fire missile salvos every 5 seconds. With interceptors, these auto-fired missiles will also intercept. This is a significant defensive buff for coordinator builds — the attack coordinator becomes a point-defense system. This aligns with the design doc's vision of "the fleet IS the defense."

---

## 15. Implementation Checklist

1. Add `claimedThreats` Set (module-level global)
2. Add `mode` and `interceptTarget` properties to `Missile` constructor
3. Add `scanForThreats()` method to `Missile`
4. Add `minDistanceToAnyFriendly()` helper to `Missile`
5. Add `isNearFriendly()` helper to `Missile`
6. Modify `Missile.update()` DIVE/HOMING block to call `scanForThreats()` before `retarget()`
7. Add lead targeting math when intercepting
8. Add intercept collision block in `updateMissiles()` (before enemy collision block)
9. Add `claimedThreats.clear()` at top of `updateMissiles()`
10. Add nose glow color change in `Missile.render()` for interceptor mode
11. Add CONFIG values for intercept tuning
12. Test: fire missiles while tanks are shooting, verify intercepts happen
13. Test: verify excess missiles still attack tanks
14. Test: verify no performance regression with max entities
