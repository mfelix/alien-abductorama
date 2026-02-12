# Missile Group Salvo System - Mechanics Spec

## Problem Statement

Currently, missiles fire as a single monolithic swarm that requires ALL missiles to be charged before launching. This is wasteful: a full 12-missile swarm to kill one incoming projectile or one tank is overkill. Players need the ability to fire smaller, independently-recharged groups for tactical precision.

## Current System Summary

- **State:** `missileAmmo` (int), `missileMaxAmmo` (int), `missileRechargeTimer` (float), `missileCapacity` (int tracking upgrades)
- **Base capacity:** `CONFIG.MISSILE_SWARM_CAPACITY = 3` missiles
- **Recharge:** Single 5-second timer (`CONFIG.MISSILE_RECHARGE_TIME`). All missiles go to 0 on fire, all refill at once when timer expires.
- **Firing:** `fireMissileSwarm()` requires `missileAmmo >= missileMaxAmmo` (full swarm only). Distributes missiles across attack coordinators or fires from UFO as fallback.
- **Shop:** `missile_swarm` unlocks with 3 missiles. `missile_capacity` adds +1 missile per purchase (no max cap enforced in code).
- **Energy:** Missile fire currently costs NO energy. Drone deployment costs 25 energy. Warp juke costs 25 energy. UFO energy max is 100 (base).
- **Auto-fire:** Attack coordinators check `missileAmmo >= missileMaxAmmo` then call `fireMissileSwarm()` on a 5-second interval timer.

---

## A) Group Structure

### Missiles Per Group
**4 missiles per group** (fixed, constant `CONFIG.MISSILE_GROUP_SIZE = 4`).

Rationale: The user suggested 4-6. Four is the sweet spot -- enough to saturate a single target or intercept a couple of threats, but small enough that firing one group doesn't feel wasteful. It also divides evenly across many upgrade scenarios.

### Group Labeling
Groups are numbered **1, 2, 3...** internally. In the HUD, they are visually separated clusters rather than individually labeled (see HUD design). No letters -- simple numeric indexing.

### Capacity Upgrade Interaction

| Upgrade State | Total Missiles | Groups |
|---|---|---|
| Base (`missile_swarm` purchased) | 4 | 1 group |
| +1 `missile_capacity` | 8 | 2 groups |
| +2 `missile_capacity` | 12 | 3 groups |
| +3 `missile_capacity` | 16 | 4 groups |

Each `missile_capacity` purchase adds **one full group** (4 missiles). The shop item description changes from "+1 missile per swarm" to "+1 MISSILE GROUP" and the value changes from 1 to `CONFIG.MISSILE_GROUP_SIZE`.

### Maximum Groups
**`CONFIG.MISSILE_MAX_GROUPS = 4`** (16 missiles total). This prevents HUD overflow and keeps the system balanced. The shop item shows "maxed" after 3 capacity purchases (base + 3 = 4 groups).

---

## B) Recharge System

### Independent Timers
Each group recharges **independently** on its own timer. When a group is fired, only that group's timer starts. Other ready groups remain ready.

### Recharge Duration
**`CONFIG.MISSILE_GROUP_RECHARGE_TIME = 3.0`** seconds per group.

Rationale: The old full-swarm recharge was 5 seconds for everything. With groups, we want each group to recharge faster (encouraging tactical fire-and-forget), but not so fast that the player can spam endlessly. 3 seconds per group means if you dump all 4 groups at once, the first group comes back in 3s, the last in 3s as well (parallel recharge). This is a significant tactical improvement over the old 5-second all-or-nothing.

### Parallel Recharge
All groups recharge **in parallel**. If you fire 3 groups in rapid succession, all 3 start their independent 3-second timers simultaneously. This rewards aggressive play.

### Data Structure

```javascript
// Replaces: missileAmmo, missileMaxAmmo, missileRechargeTimer, missileCapacity
let missileGroups = [];  // Array of group objects
let missileGroupCount = 0;  // How many groups (driven by upgrades)
let missileUnlocked = false;  // Unchanged

// Each group object:
{
    ready: true,           // Can this group fire?
    rechargeTimer: 0,      // Countdown to ready (0 when ready)
    index: 0               // Group index (0-based)
}
```

On purchase of `missile_swarm`:
```javascript
missileGroupCount = 1;
missileGroups = [{ ready: true, rechargeTimer: 0, index: 0 }];
```

On purchase of `missile_capacity`:
```javascript
missileGroupCount++;
missileGroups.push({ ready: true, rechargeTimer: 0, index: missileGroupCount - 1 });
```

### Backward-Compatible Helpers

For systems that still need a total count (rendering, etc.):
```javascript
// Total missile capacity
function getMissileMaxAmmo() {
    return missileGroupCount * CONFIG.MISSILE_GROUP_SIZE;
}

// Total missiles currently ready
function getMissileReadyCount() {
    return missileGroups.filter(g => g.ready).length * CONFIG.MISSILE_GROUP_SIZE;
}

// Number of ready groups
function getReadyGroupCount() {
    return missileGroups.filter(g => g.ready).length;
}
```

---

## C) Firing Mechanic

### Player Keypress (X/M)
Each press of X or M fires **one ready group** (the lowest-indexed ready group). If multiple groups are ready, it takes multiple keypresses to fire them all. This gives the player precise control.

```javascript
function fireMissileGroup() {
    if (!ufo || !missileUnlocked) return;

    // Find the first ready group
    const group = missileGroups.find(g => g.ready);
    if (!group) return;

    // Energy check
    if (ufo.energy < CONFIG.MISSILE_GROUP_ENERGY_COST) {
        createFloatingText(ufo.x, ufo.y + 60, 'LOW ENERGY!', '#f44');
        return;
    }

    // Deduct energy
    ufo.energy -= CONFIG.MISSILE_GROUP_ENERGY_COST;

    // Mark group as fired
    group.ready = false;
    group.rechargeTimer = CONFIG.MISSILE_GROUP_RECHARGE_TIME;

    // Launch CONFIG.MISSILE_GROUP_SIZE missiles with target assignment
    launchMissileGroup(CONFIG.MISSILE_GROUP_SIZE);
}
```

### Attack Coordinator Auto-Fire
Coordinators fire groups **as they become available**, one group at a time. The coordinator's `missileTimer` / `missileInterval` still applies as a minimum cooldown between group fires, but the key change is: **coordinators no longer wait for all groups to be ready.**

```javascript
// In AttackCoordinator.update():
if (this.missileTimer >= this.missileInterval && missileUnlocked) {
    const readyGroup = missileGroups.find(g => g.ready);
    if (readyGroup && hasTanks) {
        this.autoMissileGroup(readyGroup);
        this.missileTimer = 0;
    }
}
```

The coordinator interval (`missileInterval = 5.0`) acts as a pacing mechanism so coordinators don't instantly dump all groups the moment they recharge. With a 3-second group recharge and a 5-second coordinator interval, coordinators will fire roughly one group every 5 seconds, which is paced but doesn't waste ready groups.

**Note:** If multiple attack coordinators exist, they should share a single auto-fire queue to avoid two coordinators both consuming groups simultaneously. A simple approach: only the first alive attack coordinator handles auto-missile logic. Or better: use a global `lastAutoMissileTime` cooldown so coordinators collectively respect one shared interval.

### Missile Distribution Across Coordinators
When a group fires (4 missiles), the missiles are **split across all alive attack coordinators** using the existing fan-spread logic. With 2 coordinators and 4 missiles, each coordinator launches 2 missiles. The round-robin is **per-missile within the group** (same as current behavior within a swarm).

If no coordinators exist, missiles fire from the UFO (existing fallback).

### "Fire All" Option
No explicit "fire all" button. If the player wants to dump everything, they press X/M rapidly. This is intentional -- it prevents accidental full dumps.

---

## D) Energy Cost

### Cost Per Group Launch
**`CONFIG.MISSILE_GROUP_ENERGY_COST = 5`** energy per group launch.

Rationale:
- UFO base energy: 100
- Drone deploy: 25 energy
- Warp juke: 25 energy
- Missile group: 5 energy (cheap, tactical)

At 5 energy per group, you can fire all 4 groups (20 energy) and still have 80 energy for beams, drones, and juking. The cost is meant to be a light tax that prevents completely mindless spam, not a gate.

### Scaling
The cost is flat per group regardless of upgrades. More groups = more total energy if you fire them all, but each individual launch is always 5 energy.

### Insufficient Energy
If the player doesn't have enough energy, show "LOW ENERGY!" floating text (same pattern as drone deployment) and don't fire. The group remains ready.

### Auto-Fire Energy
Attack coordinators **also pay the energy cost** when auto-firing. If the UFO doesn't have enough energy, the coordinator skips that fire cycle and tries again next interval. This creates interesting resource tension between beam usage and missile availability.

---

## E) Target Assignment

### Smaller Groups
With only 4 missiles per group, assignment is simpler:

1. Find all alive enemies (tanks + heavy tanks)
2. Assign one missile per unique enemy (up to 4)
3. If fewer than 4 enemies, extras double up on heavy tanks first, then cycle
4. Each group does **its own independent target assignment at fire time**

This means successive group fires can target different enemies if the battlefield changes between fires.

### Interceptor Behavior
Each missile still independently scans for threats via `scanForThreats()` during flight. The `claimedThreats` set prevents multiple missiles from chasing the same projectile. This is unchanged -- it works per-missile, not per-group.

With 4-missile groups, the interceptor system is actually **more efficient**: a small group can deal with 1-2 incoming threats without wasting 12 missiles.

---

## F) Data Structure Design

### Variables Replaced

| Old Variable | New Replacement |
|---|---|
| `missileAmmo` | `missileGroups[].ready` (derived count) |
| `missileMaxAmmo` | `missileGroupCount * CONFIG.MISSILE_GROUP_SIZE` (derived) |
| `missileRechargeTimer` | `missileGroups[].rechargeTimer` (per-group) |
| `missileCapacity` | `missileGroupCount` |

### New CONFIG Constants

```javascript
MISSILE_GROUP_SIZE: 4,              // Missiles per group
MISSILE_MAX_GROUPS: 4,              // Max groups (after all upgrades)
MISSILE_GROUP_RECHARGE_TIME: 3.0,   // Seconds to recharge one group
MISSILE_GROUP_ENERGY_COST: 5,       // Energy cost per group launch
```

### Removed/Changed CONFIG Constants

```javascript
// REMOVED:
MISSILE_SWARM_CAPACITY: 3,      // Replaced by MISSILE_GROUP_SIZE
MISSILE_RECHARGE_TIME: 5,       // Replaced by MISSILE_GROUP_RECHARGE_TIME

// KEPT (unchanged):
// All MISSILE_FAN_*, MISSILE_LAUNCH_*, MISSILE_INTERCEPT_*, etc.
```

### Integration with Interceptor System
`claimedThreats` and `scanForThreats()` are unchanged. They operate per-missile during flight, not at launch time. The group system only affects **when and how many** missiles are launched, not how they behave in flight.

### Game Reset

```javascript
// In resetGame():
missileGroups = [];
missileGroupCount = 0;
missileUnlocked = false;
// claimedThreats, playerMissiles, missileTargetReticles unchanged
```

---

## G) Sound Design

### Group Ready Click
When a group finishes recharging, play a **single short click/ping** -- much subtler than the current `missileReady` three-note chime.

```javascript
SFX.missileGroupReady: () => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
}
```

This is a short, quiet 1200Hz sine ping lasting 60ms. Compare to existing:
- `missileReady`: 3-note rising chime (600, 800, 1000 Hz) -- used when ALL groups are ready? Or removed.
- `missileLockOn`: 2-note boop (800, 1200 Hz square)
- `missileLaunch`: whooshing sawtooth sweep

### Sound Escalation
- Single group ready: `SFX.missileGroupReady()` -- quiet click
- ALL groups ready: `SFX.missileReady()` -- keep the existing 3-note chime (only triggers when the last group finishes recharging and all groups are now ready)
- Group launch: `SFX.missileLaunch()` -- existing whoosh (unchanged)
- Lock-on: `SFX.missileLockOn()` -- existing boop (unchanged)

---

## H) Backward Compatibility

### Shop Items

**`missile_swarm` (unlock):**
- Now sets `missileGroupCount = 1` and creates one group
- `missileGroups = [{ ready: true, rechargeTimer: 0, index: 0 }]`
- Description stays: "Homing missiles (X key)"

**`missile_capacity` (upgrade):**
- Description changes: "+1 missile per swarm" -> "+1 MISSILE GROUP (+4 missiles)"
- Effect: `missileGroupCount++`, push new ready group
- `value` changes from 1 to `CONFIG.MISSILE_GROUP_SIZE` (for display purposes)
- Max check: `missileGroupCount >= CONFIG.MISSILE_MAX_GROUPS` -> status "maxed"
- On purchase, new group starts ready (filled on buy, same as current behavior)

**`missile_damage` (upgrade):**
- Unchanged. `missileDamage` still adds to per-missile damage.

### Floating Text
- Single group fire: "MISSILES!" (not "MISSILE SWARM!" -- a group is smaller)
- Coordinator auto-fire: "AUTO MISSILES!" (unchanged)
- All groups fired in quick succession (within 0.5s): could show "MISSILE BARRAGE!" but this is optional polish

### HUD Key Badge
The NGE HUD currently shows key badge "C" for missiles. The keydown handler uses X/M. The key badge should show **"X"** to match the actual keybinding. (This appears to be an existing bug -- the classic HUD shows "C" but the input handler checks for X/M.)

---

## Update Loop Changes

### updateMissiles(dt) Recharge Section

Replace the single-timer recharge block (lines 10565-10577) with:

```javascript
// Recharge missile groups independently
if (missileUnlocked) {
    for (const group of missileGroups) {
        if (!group.ready && group.rechargeTimer > 0) {
            group.rechargeTimer -= dt;
            if (group.rechargeTimer <= 0) {
                group.ready = true;
                group.rechargeTimer = 0;

                // Sound: click for individual group
                SFX.missileGroupReady && SFX.missileGroupReady();

                // Check if ALL groups are now ready
                if (missileGroups.every(g => g.ready)) {
                    SFX.missileReady && SFX.missileReady();
                    createFloatingText(
                        ufo ? ufo.x : canvas.width / 2,
                        ufo ? ufo.y + 30 : 100,
                        'ALL GROUPS READY', '#ff4400'
                    );
                }
            }
        }
    }
}
```

---

## Summary of Constants

```javascript
// New
CONFIG.MISSILE_GROUP_SIZE = 4;
CONFIG.MISSILE_MAX_GROUPS = 4;
CONFIG.MISSILE_GROUP_RECHARGE_TIME = 3.0;
CONFIG.MISSILE_GROUP_ENERGY_COST = 5;

// Removed
CONFIG.MISSILE_SWARM_CAPACITY = 3;   // -> MISSILE_GROUP_SIZE
CONFIG.MISSILE_RECHARGE_TIME = 5;    // -> MISSILE_GROUP_RECHARGE_TIME

// Unchanged
// All other MISSILE_* constants (fan spread, kinematics, interceptor, etc.)
```

## Implementation Priority

1. **Data structure migration** -- Replace scalar ammo with group array
2. **fireMissileGroup()** -- New function (refactored from fireMissileSwarm)
3. **Recharge loop** -- Per-group independent timers in updateMissiles()
4. **Shop effects** -- Update purchase handlers
5. **Attack coordinator** -- Update auto-fire to use groups
6. **SFX** -- Add missileGroupReady sound
7. **HUD** -- Update both classic and NGE missile displays (see UI designer's spec)
8. **Reset** -- Update resetGame()
