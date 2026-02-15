# Weapons, Drones & Tech Tree Design

## Overview

A major expansion adding new weapon systems, deployable drones, a Factorio-style technology research web, a reorganized UFO Shopping Mall, an alien Commander character, and a full economy/difficulty rebalance. The goal is to transform the game from a fast-paced arcade into a full tactical management experience where the skill ceiling shifts from reflexes to strategic resource allocation over time.

## Core Design Philosophy

- **Full tactical management** -- the player actively manages drones, directs energy, chooses targets, and juggles multiple systems. The skill ceiling comes from multitasking.
- **Hybrid controls with contextual automation** -- core actions get dedicated keys, but systems are smart enough to figure out context. Tech tree upgrades progressively automate manual tasks (Universal Paperclips-style).
- **Abduction is the objective, combat is defense** -- pure bombing strategies ultimately fail because they don't generate Bio-Matter or meet abduction quotas. The winning strategy balances harvesting with defense.

---

## New Core Loop

```
ABDUCT TARGETS ──→ Earn Points + Bio-Matter
       │                    │
       │              ┌─────┴──────┐
       │              │            │
       │         UFO Bucks    Bio-Matter
       │         (currency)   (research fuel)
       │              │            │
       │              ▼            ▼
       │         SHOPPING      QUEUE
       │          MALL        RESEARCH
       │         (gear)     (tech tree)
       │              │            │
       │              └─────┬──────┘
       │                    ▼
       │              NEXT WAVE
       │           (research ticks
       │            down during combat)
       │                    │
       ▼                    ▼
  DEPLOY DRONES ◄── Tech Unlocks
  MANAGE ENERGY      New Capabilities
  MISSILE SWARMS     Automation
       │
       ▼
  MEET ABDUCTION QUOTA ──→ Keep difficulty manageable
  MISS QUOTA ──→ Next wave gets harder
```

### Two Currencies

- **UFO Bucks** -- buy immediate gear in the shopping mall. Earned from points at wave end (points / 10 + bonuses).
- **Bio-Matter** -- fuel technology research. ONLY earned from abductions -- bombing/destroying tanks gives zero Bio-Matter. This is the core tension.

### Bio-Matter Earn Rates

| Source | Bio-Matter |
|--------|-----------|
| Human abducted | 3 BM |
| Cow abducted | 2 BM |
| Sheep abducted | 2 BM |
| Cat/Dog abducted | 1 BM |
| Harvester drone batch delivered | 2 BM per batch |
| Tank destroyed | 0 BM |

### Abduction Quotas

Each wave has a target abduction count. Missing it triggers difficulty penalties.

| Waves | Quota |
|-------|-------|
| 1-3 | 5 targets |
| 4-6 | 8 targets |
| 7-9 | 12 targets |
| 10-14 | 15 targets |
| 15+ | 18 targets |

- **Miss quota:** Next wave tanks fire 20% faster. Stacks across consecutive misses.
- **Meet quota:** Normal difficulty curve.
- **Exceed quota by 50%+:** Bonus Bio-Matter reward + wave bonus multiplier.

---

## The Commander

An unhinged alien middle-manager who communicates between waves about quota performance. Appears in the wave summary screen and the shopping mall footer as a holographic/crackling communication screen.

### Reactions

- **Met quota:** "ACCEPTABLE. The Galactic Specimen Bureau demands MORE next cycle. Do not disappoint me again."
- **Exceeded quota:** Begrudging praise + bonus Bio-Matter. "Hmm. Perhaps you are not entirely worthless."
- **Missed quota:** Full meltdown. "YOU INCOMPETENT DISC-JOCKEY! The Board will hear of this! DO YOU KNOW HOW MUCH SPICE THIS OPERATION COSTS?!" -- difficulty penalty kicks in.
- **In the shop:** Pressures the player. "STOP BROWSING AND BUY SOMETHING! We're losing specimens by the SECOND!"

Animated character with expressive reactions. Specific name/visual design TBD.

---

## UFO Shopping Mall Redesign

Full-screen responsive two-column layout replacing the current centered grid.

### Layout

```
┌──────────────────────────┬──────────────────────────────┐
│   UFO SHOPPING MALL      │   TECHNOLOGY RESEARCH        │
│                          │                              │
│ [MAINT] [WEAPONS] [SYS]  │  QUANTUM    BIO-      SPICE │
│                          │  CORE    COMPUTER  NAVIGATOR │
│ ┌──────────────────────┐ │    │         │         │     │
│ │ Item list based on   │ │   [■]──────[■]        [○]   │
│ │ active tab           │ │    │         │         │     │
│ │                      │ │   [○]       [○]───────[○]   │
│ │                      │ │    │         │         │     │
│ │                      │ │   [·]       [·]       [·]   │
│ │                      │ │    │         │         │     │
│ │                      │ │   [·]       [·]       [·]   │
│ └──────────────────────┘ │                              │
│                          │  ■ = Unlocked                │
│ ┌──────────────────────┐ │  ○ = Available (can research)│
│ │ CART         TOTAL   │ │  · = Locked                  │
│ │ Items...       $XX   │ │  ── = Shared node connector  │
│ │                      │ │                              │
│ │ CHECKOUT             │ │ ┌──────────────────────────┐ │
│ │ UFO Bucks: XXX       │ │ │ QUEUE + Bio-Matter count │ │
│ └──────────────────────┘ │ └──────────────────────────┘ │
├──────────────────────────┴──────────────────────────────┤
│ COMMANDER: "commentary"                        ⏱ 0:XX   │
│                                        [LAUNCH ▶]       │
└─────────────────────────────────────────────────────────┘
```

### Left Column: Shopping Mall

Three tabs for item categories. Items cost UFO Bucks. Cart and checkout at the bottom.

**MAINTENANCE tab:**
- Repair Kit ($25) -- heal 25 HP
- Shield Cell ($50) -- +1 shield charge
- Revive Cell ($300) -- auto-revive 1 charge

**WEAPONS tab:**
- Bomb Ammo ($100) -- +1 bomb capacity (max 6)
- Bomb Blast+ ($150) -- increase blast radius tier
- Bomb Damage+ ($150) -- increase bomb damage tier
- Missile Swarm unlock ($400) -- unlock missile system
- Missile Capacity+ ($200) -- +1 missile per swarm
- Missile Damage+ ($200) -- increase missile damage
- Laser Turret ($400) -- unlock turret
- Laser Damage+ ($220) -- +25% turret damage
- Multi-Turret ($600) -- +1 turret beam (max 3 beams via tech tree)
- Harvester Drone unlock ($400) -- unlock harvester deployment
- Battle Drone unlock ($500) -- unlock battle drone deployment

**SYSTEMS tab:**
- Speed Cell ($200) -- +20% speed
- Energy Cell ($200) -- +20% max energy
- Recharge Cell ($200) -- +20% recharge rate

### Right Column: Technology Research

Three vertical tracks (Quantum Core, Bio-Computer, Spice Navigator). Click a node to queue research. Costs Bio-Matter. Research completes during the next wave (ticks down in real time during combat).

Bio-Matter count and research queue shown at bottom of right column.

### Launch Button

Player can leave the shop early by pressing LAUNCH. No need to wait for timer to expire.

---

## Technology Research Web

Three vertical tracks with 5 nodes each. Horizontal connectors create shared prerequisites between tracks. Research costs Bio-Matter and takes time to complete during combat waves.

### Quantum Core (Energy Tree)

```
[1] Reactor Ignition ──── 10 BM, 30s
    "Unlock energy distribution system"
    Effect: Turret beam can recharge drones

[2] Power Routing ─────── 15 BM, 45s ──connects─→ Bio-Computer [2]
    "Energy flows where it's needed"
    Effect: Auto-balance energy between turret + drones

[3] Energy Broadcast Array ── 25 BM, 60s
    "One beam, all receivers"
    Effect: Turret recharge beam splits to ALL active drones
    simultaneously (reduced charge rate per drone)

[4] Fusion Amplifier ──── 40 BM, 90s
    "Raw power output doubled"
    Effect: +100% max energy AND broadcast recharge runs
    at full strength per drone (no split penalty)

[5] Quantum Fold Core ─── 60 BM, 120s ──connects─→ Spice Nav [5]
    "Reality bends to your will"
    Effect: Energy recharges while beam is active (slow)
```

### Bio-Computer (Intelligence/Automation Tree)

```
[1] Neural Bootstrap ──── 10 BM, 30s
    "Basic targeting AI comes online"
    Effect: Drones get smarter pathfinding

[2] Threat Matrix ─────── 15 BM, 45s ──connects─→ Quantum Core [2]
    "See the battlefield clearly"
    Effect: Auto-prioritize targets (turret picks optimal target)

[3] Auto-Shield Matrix ── 25 BM, 60s
    "Shield regeneration protocol"
    Effect: Regenerate 1 shield charge every 45s

[4] Harvest Protocol ──── 40 BM, 90s ──connects─→ Spice Nav [4]
    "Optimized specimen collection"
    Effect: Harvester drones work 50% faster, +2 batch size

[5] Hive Mind ─────────── 60 BM, 120s
    "All systems unified"
    Effect: All drones share targeting data, coordinate attacks
```

### Spice Navigator (Speed/Time Tree)

```
[1] Spice Inhalation ──── 10 BM, 30s
    "Time begins to dilate"
    Effect: +30% UFO speed

[2] Dimensional Compression ── 15 BM, 45s
    "Your craft phases between dimensions"
    Effect: UFO hitbox shrinks 30%, flickering/phasing visual

[3] Prescient Jump ────── 25 BM, 60s
    "The spice reveals safe passage"
    Effect: Dash auto-targets nearest safe zone (no projectiles)

[4] Time Dilation ─────── 40 BM, 90s ──connects─→ Bio-Computer [4]
    "The universe slows around you"
    Effect: Brief slow-mo when health drops below 25%

[5] Guild Navigator ───── 60 BM, 120s ──connects─→ Quantum Core [5]
    "You fold space itself"
    Effect: Bombs and drones deploy instantly, no drop time
```

### Shared Connectors

Horizontal connections between tracks mean a node can be unlocked from either path:
- **QC[2] ↔ BC[2]**: Power Routing and Threat Matrix share a connection. Unlocking either one satisfies the prerequisite for the other.
- **BC[4] ↔ SN[4]**: Harvest Protocol and Time Dilation are linked.
- **QC[5] ↔ SN[5]**: Quantum Fold Core and Guild Navigator are linked.

### Research Timing

- Total time for one full tree: ~345 seconds (~6 waves)
- Completing ALL three trees: ~18 waves
- Full build-out is an endgame aspiration, not achievable by Wave 8
- Research ticks down during combat waves only
- Research progress bar visible in HUD during gameplay

---

## Weapon Systems

### Bombs (Enhanced)

Existing bomb system with new upgrade tiers available in the shop:

- **Activation:** Z key (primary), X key (alt)
- **Physics:** Unchanged -- inherits 80% UFO horizontal velocity, gravity, bounce damping 0.6x, max 3 bounces
- **Blast Radius tiers:** 120px → 160px → 200px (shop upgrades)
- **Damage tiers:** 50 → 75 → 100 (shop upgrades)
- **Capacity:** 1-6 bombs (shop upgrades, unchanged)
- **Recharge:** 12 seconds per bomb (unchanged)
- **Friendly fire:** YES -- bombs damage/destroy your own drones. This is the core tension between bombing and harvesting strategies.

### Missile Swarm (New)

Anime-style homing missiles that auto-target tanks with spiraling, looping trajectories.

- **Activation:** C key (primary), M key (alt)
- **Unlock cost:** ~$400 in shop
- **Starting capacity:** 3 missiles per swarm
- **Targeting:** Each missile picks a unique tank. Digital targeting reticle appears on tank with "boop-boop" lock-on sound. Excess missiles double up on heavy tanks.
- **Flight path:** Missiles launch upward/outward from UFO in a fan pattern, then each does spiraling anime trajectories before homing in on target. Random curves but always converging.
- **Damage:** 30-40 per missile. A 3-missile salvo won't solo a heavy tank but softens everything.
- **Ammo:** Separate from bombs. Full swarm recharges over 15-20 seconds. UI shows missile count + reload indicator.
- **Friendly fire:** NO -- missiles only target enemies. Drone-safe precision weapon.
- **Upgradeable:** Swarm size (3→4→5→6), missile damage, reload speed. Bio-Computer tree enhances targeting intelligence.

### Laser Turret (Enhanced with Multi-Turret)

- **Activation:** Z key...

Wait -- Z is bombs. Let me correct:
- **Turret activation:** W key (primary), T key (alt)
- **Base turret:** Unchanged -- 1 beam, 32 DPS, 25 energy/sec, 800px range
- **Multi-Turret unlock:** $600 in shop. Adds beam slot. Each beam targets a different enemy.
- **Multi-Turret Lv2:** Via tech tree research. 3 beams total.
- **Energy scaling:** Each beam costs full energy drain. 2 beams = 50 energy/sec. 3 beams = 75 energy/sec. Quantum Core tree essential for sustaining multi-turret.

### Turret Priority Logic

1. If battle drone nearby AND enemies exist → beam attacks enemies
2. If any drone is dying (low energy timer) → beam recharges it
3. If no enemies in range → beam recharges nearest drone
4. If no drones and no enemies → scanning animation

With **Energy Broadcast Array** (QC[3]): recharge beam splits to ALL drones simultaneously.
With **Fusion Amplifier** (QC[4]): broadcast runs at full strength per drone.
With **Threat Matrix** (BC[2]): auto-prioritization gets smarter, splits beams optimally.

---

## Drone System

Two drone types deployed from UFO. Land on the ground, operate autonomously. Max 3-5 active simultaneously (starting at 1 slot, additional slots unlocked via tech tree).

Each drone costs energy to deploy and has a countdown timer. When timer hits zero, the drone sparks and explodes.

### Harvester Drone

- **Deploy:** A key. Heavy metallic pod drops from UFO with gravity.
- **Landing:** Small impact dust cloud + small screen shake.
- **Unfold:** Pod cracks open, spider legs extend, beam emitter rises (~1 second animation).
- **Behavior:**
  - Walks toward nearest abductable target
  - Fires short-range beam, begins collecting
  - Counter appears above drone: 0/3
  - At 3/3, packages targets and beams batch to UFO
  - Three dots shoot up with elastic motion to UFO underside
  - Player receives points + Bio-Matter
  - Drone seeks next target
- **Energy timer:** Starts at ~30 seconds. Ticks down visually above drone. At zero, drone explodes (small blast, no damage).
- **Recharge:** Turret beam refills timer. Energy Broadcast Array keeps all harvesters topped off passively.
- **Upgradeable:** Batch size (3→4→5 via Harvest Protocol), collection speed, walk speed, starting timer duration.

### Battle Drone

- **Deploy:** S key. Same heavy drop but louder impact -- creates small explosion on landing that damages nearby enemies.
- **Landing:** Medium screen shake + impact explosion.
- **Unfold:** Spider legs + visible turret on top. Meaner appearance.
- **Behavior:**
  - Walks toward nearest enemy tank
  - Fires mini laser turret (~15 DPS)
  - Engages until target destroyed, seeks next
  - If no enemies, patrols back and forth
- **Aggro magnet:** Tanks target battle drones FIRST, then harvesters, then UFO. Key tactical value -- decoys that draw fire.
- **Energy timer:** ~25 seconds (shorter than harvester, combat is costly).
- **Recharge:** Same turret beam / broadcast system.
- **Upgradeable:** Turret damage, armor (can absorb hits), walk speed.

### Enemy Targeting Priority

1. Battle Drone (highest threat)
2. Harvester Drone
3. UFO (only when no drones exist)

### Drone Slot Progression

- Start: 1 drone slot (after purchasing first drone unlock)
- Tech tree nodes unlock additional slots up to max 5
- Mix and match harvester/battle in any combination

---

## Controls

### Primary Mapping (Left Hand)

```
A = Deploy harvester drone
S = Deploy battle drone
Z = Toggle turret
X = Drop bomb
C = Fire missile swarm
```

### Right Hand

```
← → ↑ ↓  = Movement
SPACE     = Tractor beam (hold)
↑↑ / ↓↓  = Dash (double-tap)
```

### Alternative Mapping

```
T = Toggle turret
B = Drop bomb
M = Fire missile swarm
```

### Automation Progression

Early game: player frantically presses A, S, Z, X, C, SPACE.
Late game with full tech tree: player mostly positions UFO and manages SPACE for abductions while automation handles defense. Skill shifts from button mashing to strategic resource allocation.

---

## Difficulty Rebalance

### Tank Spawn Curve (Stretched)

| Wave | Regular Tanks | Heavy Tanks |
|------|--------------|-------------|
| 1 | 1 | 0 |
| 2 | 2 | 0 |
| 3 | 3 | 0 |
| 4 | 3 | 0 |
| 5 | 4 | 1 |
| 6 | 4 | 1 |
| 7 | 5 | 1 |
| 8 | 5 | 2 |
| 10 | 6 | 2 |
| 12+ | +1 tank every 2 waves | |
| 15+ | | +1 heavy every 3 waves |

### Key Changes

- **Heavy tanks pushed to Wave 5** (from Wave 3). Players have time to buy turret and start tech tree.
- **Heavy tanks visually smaller** -- 180px wide instead of 240px (75% current size). Still imposing but not screen-dominating.
- **Tank scaling slows** -- +1 every 2 waves instead of every wave past Wave 10.
- **Tank speed caps later** -- reaches max at Wave 10 instead of Wave 5.
- **Target: skilled players reaching Wave 20+** with the new systems providing tools to handle it.

### Anti-Cheating

Lock game viewport to a max aspect ratio. If window is made super tall, playfield stays the same height with black bars. Prevents the suspected height exploit.

---

## Scoring Rebalance

### Points

| Action | Points |
|--------|--------|
| Human abducted | 50 |
| Cow abducted | 40 |
| Sheep abducted | 30 |
| Cat/Dog abducted | 20 |
| Tank abducted (beam) | 25 |
| Heavy tank abducted | 75 |
| Tank destroyed (bomb/missile) | 10 (reduced from 25) |
| Tank destroyed (drone) | 15 |
| Harvester batch bonus | +20 per batch |

### Wave Bonuses

- **Abduction Master** (10+ targets abducted): +25%
- **Tank Hunter** (3+ tanks destroyed): +25%
- **Quota Exceeded** (beat quota by 50%+): +25% (replaces Combo King)

### Wave Summary Screen

Shows targets beamed, quota status, tanks destroyed, drone harvests, earnings breakdown (points, UFO Bucks, Bio-Matter), and Commander reaction.

---

## Power-Up System Changes

Random power-up drops are mostly removed. Capabilities that were temporary random buffs become permanent tech tree unlocks:

| Old Random Drop | Replacement |
|----------------|-------------|
| Shield (3 charges) | Auto-Shield Matrix (BC[3]) -- regenerates 1 charge/45s |
| Energy Surge | Surge Capacitors (QC[3]) or Quantum Fold Core (QC[5]) |
| Wide Beam | Could become a tech tree node or shop upgrade |
| Rapid Abduct | Could tie into Harvest Protocol (BC[4]) |
| Health Pack | Rare ground spawn remains (only random drop that stays) |

Health packs remain as rare ground spawns. Everything else is earned through deliberate tech tree investment.

---

## Emergent Player Strategies

### "The Rancher" (Harvester-focused)
- Bio-Computer tree early for smarter, faster drones
- 3-4 harvester drones, 1 battle drone as decoy
- Turret + Energy Broadcast to keep harvesters alive
- Avoids bombs (would kill own drones), uses missile swarm for precise tank removal
- High Bio-Matter income, fast tech tree progression
- Weakness: vulnerable if battle drone dies and tanks retarget harvesters

### "The Warlord" (Combat-focused)
- Quantum Core tree + bomb/missile upgrades
- Heavy bomb drops + missile swarms to clear the field
- Few or no drones (bombs would destroy them)
- Turret running constantly for DPS
- Relies on manual beam abductions between combat
- Struggles with quotas long-term -- strong early but hits a wall when Bio-Matter starves tech tree

### "The Navigator" (Evasion + efficiency)
- Spice Navigator tree for speed, shrink, prescient jump
- Small fast UFO nearly impossible to hit
- Moderate drone use, moderate bombing
- Wins by surviving forever and steadily abducting
- Slow but consistent Bio-Matter, never misses quota
- Weakness: lower peak score per wave, long games

### "The Ascended" (Late-game full automation)
- Balanced early investment across all three trees
- By Wave 15+ has Energy Broadcast, Hive Mind, and Guild Navigator
- 5 drones on field, turret auto-managing everything
- Player mostly positions UFO and beams high-value targets
- Universal Paperclips endgame -- automated out of the hard work

---

## HUD Additions

During gameplay, the following new UI elements are needed:

- Missile count + reload indicator (near existing bomb UI)
- Active drone count + individual energy timers
- Research progress bar (for queued research completing during wave)
- Bio-Matter counter
- Abduction quota progress for current wave (e.g., "7/12")
- Commander mini-portrait for quota warnings mid-wave (optional)

---

## Implementation Notes

- Main game code is in `js/game.js` (currently ~10,500 lines)
- All CONFIG values are at the top of game.js
- Key classes: UFO, Target, Tank, HeavyTank, Projectile, Bomb, Powerup, Particle
- Shop system is in `renderShop()` / `updateShop()` functions
- This expansion will require new classes: MissileSwarm, Missile, HarvesterDrone, BattleDrone, Commander
- Tech tree state management will need a new data structure for tracking research progress
- Shop UI will need a full rewrite for the two-column responsive layout
