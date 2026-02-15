# Drone Coordinators & Tech Tree Redesign

## Overview

Complete redesign of the tech tree around the emergent gameplay identity: drone fleet management and resource automation. Replaces the previous Quantum Core / Bio-Computer / Spice Navigator tracks with three new tracks focused on energy sustainability, fleet scaling, and fleet defense.

The game's progression arc: **manual control -> semi-automated -> fully automated -> next tier of command.**

## Core Design Principles

- The beam is the player's universal tool — it abducts, recharges, and sustains
- The player can always manually do anything (abduct, deploy drones, fire weapons). Tech upgrades automate these actions, they never remove them
- The UFO is fragile. The fleet IS the defense
- Tank targeting priority: attack drones -> harvester drones -> coordinators -> UFO
- Full tech tree completion = fully automated gameplay, preparing for future multi-UFO platoon expansion

## Controls

| Primary | Alt | Action |
|---------|-----|--------|
| Arrow keys | — | Move UFO |
| Spacebar | — | Beam (abduct / recharge) |
| A | — | Deploy attack drone / attack coordinator |
| S | H | Deploy harvester drone / harvester coordinator |
| Z | B | Drop bomb |
| X | M | Fire missiles |

Laser turret (F key) is removed entirely. Offensive damage transfers to attack drones and attack coordinators.

## The Unified Beam

One spacebar beam throughout the game. It affects everything in its column simultaneously:

- **Ground targets (people, animals):** Abduction tractor beam — pulls them up, collects biomatter. Works identically to current behavior. Never goes away.
- **Coordinators in beam path:** Recharges their energy timer. Coordinator glows brighter as visual feedback.
- **Raw drones in beam path:** Recharges their energy timer (requires PG1 Beam Conduit for raw drones; built-in for coordinators).

Energy drain on the UFO works the same as current — beam costs energy to run, recharges when not active.

### Visual Evolution

- Early game: beam looks like current tractor beam (abduction-focused)
- After PG1: faint energy particles visible when beam passes through drones
- After coordinators unlocked: beam has a warmer glow as it passes through the coordinator layer

## Tech Tree

Three tracks of 5 tiers each. Research costs biomatter, ticks down during combat waves only, one node at a time with queue.

Cross-connections between tracks at tiers 2, 4, and 5 provide alternate unlock paths.

### Track 1: Power Grid — "Can I sustain this?"

Arc: Manual recharging -> self-sustaining energy

| Tier | Node | Cost | Research | Effect |
|------|------|------|----------|--------|
| PG1 | Beam Conduit | 10 BM | 30s | Beam recharges raw drones and coordinators it passes through. Gateway to the energy management game. |
| PG2 | Energy Efficiency | 20 BM | 45s | All drone/coordinator energy drain rates reduced by 30%. Fleet is cheaper to maintain. *Cross-connects to DC2.* |
| PG3 | Power Broadcast | 30 BM | 60s | Beam recharges drones and coordinators in a wider horizontal radius — less precise positioning needed. |
| PG4 | Reactor Amplifier | 45 BM | 90s | Beam recharge rate doubled. Coordinators charge up twice as fast when beamed. *Cross-connects to DC4.* |
| PG5 | Self-Sustaining Grid | 65 BM | 120s | Coordinators and drones passively regenerate energy over time. Fleet no longer dies if beam stops for a few seconds. *Cross-connects to DN5.* |

### Track 2: Drone Command — "Can I scale this?"

Arc: 2 manual drones -> automated fleet

| Tier | Node | Cost | Research | Effect |
|------|------|------|----------|--------|
| DC1 | Drone Uplink | 10 BM | 30s | +1 drone slot (2 -> 3). Drones get smarter pathfinding and faster movement. |
| DC2 | Harvester Coordinator | 20 BM | 45s | Unlocks harvester coordinator deployment. Coordinator manages up to 3 harvester drones. Drones collect 1 target, beam biomatter to coordinator, coordinator streams to UFO. *Cross-connects to PG2.* |
| DC3 | Attack Coordinator | 30 BM | 60s | Unlocks attack coordinator deployment. Coordinator manages up to 3 attack drones and takes over bomb/missile deployment automatically. |
| DC4 | Fleet Expansion | 45 BM | 90s | Each coordinator manages up to 5 sub-drones. Player can deploy multiple coordinators of the same type. *Cross-connects to PG4, DN4.* |
| DC5 | Autonomous Swarm | 65 BM | 120s | Coordinators auto-deploy when player has energy. Full fleet automation — drones redeploy instantly on destruction, weapons fire optimally, harvesting runs continuously. |

### Track 3: Defense Network — "Can I survive this?"

Arc: Fragile UFO -> fleet-as-shield

| Tier | Node | Cost | Research | Effect |
|------|------|------|----------|--------|
| DN1 | Thruster Boost | 10 BM | 30s | +30% UFO speed. Dodge what gets through the fleet. |
| DN2 | Drone Armor | 20 BM | 45s | Drones and coordinators take 40% less damage from tank fire. Front line lasts longer. |
| DN3 | Shield Transfer | 30 BM | 60s | Coordinators gain 1 shield charge (absorbs one hit completely). Regenerates every 30 seconds. |
| DN4 | Fleet Resilience | 45 BM | 90s | Coordinators redeploy destroyed drones 50% faster. Coordinator shields regenerate twice as fast. *Cross-connects to DC4.* |
| DN5 | Swarm Shield | 65 BM | 120s | Active drones and coordinators generate a passive damage absorption field around the UFO. More fleet alive = stronger shield. Fleet gone = UFO exposed. *Cross-connects to PG5.* |

### Cross-Connection Map

```
Power Grid  <--PG2/DC2-->  Drone Command  <--DC4/DN4-->  Defense Network
                PG4/DC4
Power Grid  <-----------PG5/DN5----------->  Defense Network
```

## Drone Coordinators

### Deployment

- Once DC2 (or DC3) is researched, pressing the deploy key (S/H for harvester, A for attack) spawns a coordinator instead of a raw drone
- Costs 25 energy to deploy (same as current drone cost)
- Coordinator drops from UFO, descends to hover altitude (~60% of the way between UFO and ground, slightly above midpoint), then activates
- Activation: unfolds, starts spinning, begins glowing, emits chattery startup sound

### Hover Behavior

- Floats at ~60% altitude (closer to UFO than to ground)
- Drifts slowly to stay loosely beneath the UFO — not locked to UFO position, lazily follows with lag
- Beam naturally passes through it most of the time without player having to think about positioning

### Energy & Death

- Starts with 15-second energy timer
- Drains steadily. Visual glow dims as energy drops
- Below 25% energy: starts visibly sinking, warning beeping sound
- At 0%: falls to ground, explodes on impact — damages everything in blast radius (drones, people, tanks, targets)
- Can also be destroyed by tank fire

### Recharging

- Beam passes through coordinator = recharges its energy timer
- No PG1 required for coordinator recharging — built into the coordinator unlock
- PG1 (Beam Conduit) is specifically for recharging raw drones

### Harvester Coordinator Behavior

- On activation, auto-deploys up to 3 harvester drones (no separate energy cost for sub-drones)
- Sub-drones drop from coordinator to ground level
- Changed harvesting loop: each drone grabs 1 target, beams biomatter up to coordinator (visible mini-beam from drone to coordinator), then immediately seeks next target
- Coordinator accumulates biomatter and streams it continuously to UFO (visible beam from coordinator to UFO)
- If sub-drone destroyed, coordinator auto-redeploys replacement after ~3 second delay
- Key advantage over raw drones: no batch system, no risk of losing 3 biomatter when a drone dies. Faster, safer harvesting at cost of managing coordinator energy

### Attack Coordinator Behavior

- On activation, auto-deploys up to 3 attack drones
- Sub-drones drop from coordinator to ground, engage tanks as normal
- Coordinator takes over bomb and missile deployment — fires automatically at optimal targets when available
- If sub-drone destroyed, auto-redeploys replacement after ~3 second delay
- Key advantage: fully automated offense. Player no longer needs to manually fire weapons.

### Visual Design

- Shape: spherical/ellipsoid, slightly elongated vertically
- Constant slow spin on vertical axis
- Glow color: green pulse for harvester, red/orange pulse for attack
- Glow intensity tied to energy level — bright when full, dims as energy drains
- Below 25% energy: glow flickers, starts sinking, warning pulse
- Faint energy tether lines down to each sub-drone
- Biomatter stream beam (harvester type): visible upward beam from coordinator to UFO
- Roughly 1.5x the visual size of a drone

### Audio Design

- Activation: mechanical unfold/startup chirp
- Idle: low ambient chattery hum, subtly different per type
- Recharging: rising tone when beam passes through
- Low energy warning: distressed beeping
- Death: explosion sound + mechanical failure crunch

## Shop Changes

### Removed

- Laser Turret ($400)
- Laser Damage+ ($220)
- Multi-Turret ($600)

### Changed

- **Harvester Drone ($100):** One-time purchase. Unlocks harvester type and gives access to shared 2-slot drone pool.
- **Battle Drone ($100):** One-time purchase. Unlocks attack type. Either purchase unlocks the shared pool if it's the first drone buy.

Drone slots are no longer sold in the shop. Slot expansion (2 -> 3) comes from DC1 in the tech tree. Beyond that, coordinators manage their own sub-drones.

### Unchanged

| Tab | Items |
|-----|-------|
| Maintenance | Repair Kit ($25), Shield Cell ($50), Revive Cell ($300) |
| Weapons | Bomb Ammo ($100), Bomb Blast+ ($150), Bomb Damage+ ($150) |
| Weapons | Missile Swarm ($400), Swarm Size+ ($200), Warhead+ ($200) |
| Systems | Speed Cell ($200), Energy Cell ($200), Recharge Cell ($200) |

Speed Cell and DN1 Thruster Boost coexist and stack — shop gives small incremental boost, tech gives bigger one.

## Progressive Tank Intelligence

Tank behavior evolves across waves, creating an arms race against the player's automation:

### Waves 1-3: Basic

- Simple patrol movement, predictable paths
- Shoot at nearest priority target (drones -> coordinators -> UFO)
- No evasion, cluster together naturally

### Waves 4-7: Tactical

- Spread out to avoid bomb blast clusters
- Reposition away from attack drone zones
- Begin leading their shots (predict target movement)

### Waves 8-11: Strategic

- Actively seek positions with distance from attack drones
- Some tanks break targeting priority and shoot coordinators directly, recognizing them as high-value targets
- Flank from screen edges rather than clustering center

### Wave 12+: Veteran

- Coordinated behavior — tanks spread to force the player to split fleet across the map
- Prioritize coordinators aggressively — killing the coordinator collapses the drone network
- Evasive movement when bombs or missiles incoming

### Key Tension

By wave 12+ the player might have full automation running, but tanks are actively trying to dismantle it by targeting coordinators. The player must keep repositioning to beam-recharge coordinators under heavy fire.

## What Gets Removed

- Entire Bio-Computer track (BC1-BC5)
- Entire Quantum Core track (QC1-QC5) — replaced by Power Grid
- Entire Spice Navigator track (SN1-SN5) — replaced by Defense Network
- Laser turret system and all turret-related shop items
- Phase shift mechanic (SN2)
- Prescient jump / warp juke mechanic (SN3)
- Drone slot shop purchases (replaced by one-time type unlocks)
- F key binding (turret)
- C key binding (unused after remap)

## What Carries Forward

- Beam sound and base visual feel
- Drone deployment animation (falling, landing, unfolding)
- Drone combat and harvesting core loop (enhanced by coordinators)
- Bio-matter economy
- Research queue system
- Shop structure (tabs, purchase flow)
- Bomb and missile systems (manual keys still work, automated by attack coordinator)
- Wave-based progression
- Abduction quota system
