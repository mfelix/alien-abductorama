# Attack Coordinator Missile Launch Redesign

## Problem

When attack coordinators are active, missiles still fire from the UFO. This feels disconnected — the coordinator should own the weapon delivery. Additionally, missiles currently fan downward, but launching from coordinators (which hover at ~40% screen height) creates an opportunity for a dramatic upward-then-diving trajectory.

## Design

### 1. Missile Launch Source & Ammo

**Launch source switching:** When one or more alive, non-DYING attack coordinators exist, ALL missile salvos (auto-fire and manual X key) launch from the coordinators instead of the UFO. Missiles are split evenly across active attack coordinators. Remainder distributed (7 missiles, 2 coordinators = one gets 4, other gets 3).

**UFO fallback:** If no attack coordinators are alive (or none exist), missiles fire from the UFO exactly as they do today — downward fan. Player is never locked out.

**Ammo pool stays shared:** No changes to ammo/recharge system. Single missileAmmo/missileMaxAmmo pool, same 5-second recharge, same all-or-nothing firing. Only the physical spawn location changes.

**Auto-fire:** AttackCoordinator auto-fire logic stays the same (5-second interval, checks full ammo), but fireMissileSwarm() internally routes to coordinators.

### 2. Missile Trajectory — Four-Phase Arc

**Phase 1 — Launch burst (0-0.3s):** Missiles explode upward from the coordinator with high initial velocity (~350 px/s up). Each missile fans out slightly horizontally for spread. Light spiral wobble begins.

**Phase 2 — Rising deceleration (0.3-0.6s):** Gravity and drag bleed off upward momentum. Missiles visibly slow, spiral becomes more pronounced as speed drops. Smoke trail thickens. Missiles drift apart.

**Phase 3 — Apex tension (0.6-0.8s):** Missiles hang near their peak, almost weightless. Subtle bright flash/glow pulse on each missile as they "acquire" target. Dramatic beat — calm before the storm. Speed drops to near zero vertically.

**Phase 4 — Attack dive (0.8s+):** Missiles snap hard toward assigned targets. Speed ramps aggressively (600+ px/s, matching MISSILE_SWARM_SPEED). Spiral tightens as homing locks in. Smoke trails intensify. Same hit detection and retargeting logic as current.

### 3. Visual Polish

**Launch effect:** Brief orange/red muzzle flash at coordinator position. Coordinator glow pulses momentarily from recoil.

**Apex moment:** Each missile gets a brief bright point-flash (white/yellow, ~0.1s) at top of arc as it locks on. Signals transition from "rising" to "attacking."

**Smoke trails:** During rise — lighter, driftier (slower speed). During attack dive — denser, streaky (higher speed). Existing smoke puff system handles this naturally.

**Floating text:** "MISSILE SWARM!" appears at centroid of launching coordinators rather than at UFO.

### 4. What Changes vs. What Stays

**Changes:**
- `fireMissileSwarm()` — checks for alive attack coordinators, splits missiles across them, spawns from coordinator positions
- `Missile` class — new four-phase trajectory (launch up, decelerate, apex, dive) replacing current two-phase (fan-out down, home)
- Launch angle math flips — fan upward instead of downward
- Floating text position — centroid of launching coordinators
- Launch flash effect on coordinators

**Stays the same:**
- Ammo pool, recharge timer, all-or-nothing firing
- Target assignment logic (prioritize heavy tanks, distribute evenly)
- Hit detection, damage, retargeting on kill
- Manual fire key (X), auto-fire timer (5s)
- Missile rendering (red body, yellow nose, smoke puffs, exhaust trail)
- Shop upgrades (Swarm Size+, Warhead+)
- UFO fallback when no attack coordinators alive

## Implementation Notes

### Files affected
- `js/game.js` — Missile class (trajectory phases), fireMissileSwarm() (launch source routing), AttackCoordinator (launch flash)

### Key changes
- Missile constructor: accept launch direction (up vs down), add phase tracking
- Missile.update(): four-phase state machine replacing current two-phase
- fireMissileSwarm(): detect attack coordinators, split missiles, spawn from coordinator positions
- AttackCoordinator: visual recoil/flash on missile launch
