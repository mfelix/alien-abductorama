# HUD Evolution - Game Design Specification

**Date**: 2026-02-12
**Author**: Game Designer
**Companion Doc**: `2026-02-12-hud-evolution-visual-spec.md` (visual/pixel specs)

---

## 1. ENERGY TIME SERIES GRAPH - Data Architecture

### Purpose
Give the player an at-a-glance understanding of their energy economy over time. Is energy trending up or down? Did that drone deploy crater my reserves? Am I recovering fast enough to beam again? The graph answers these questions without requiring the player to mentally track numbers.

### Data Model

```
energyTimeSeries = {
    // Ring buffer of samples
    buffer: Float32Array(180),   // 180 samples
    writeIndex: 0,               // Current write position in ring buffer
    sampleTimer: 0,              // Accumulator for sampling interval
    sampleInterval: 1/6,         // ~166ms per sample = 30 seconds of history at 180 samples

    // Per-frame accumulators (reset each sample tick)
    frameIntake: 0,              // Energy gained this sampling window
    frameOutput: 0,              // Energy spent this sampling window

    // Intake/output overlay buffers (optional, for dual-line display)
    intakeBuffer: Float32Array(180),
    outputBuffer: Float32Array(180),

    // Auto-scale
    peakValue: 100,              // Current Y-axis max (starts at maxEnergy)
    smoothPeak: 100              // Smoothed peak for gentle rescaling
};
```

### Sampling Strategy

**Sample Rate**: 6 samples/second (every ~166ms). At 180 samples, this gives exactly **30 seconds** of history. This rate is fast enough to capture combat spikes (drone deploy, missile fire) without creating excessive data points.

**Per-Frame Accumulation**: Each game update frame, accumulate energy deltas into `frameIntake` and `frameOutput`. On each sample tick:
1. Record `ufo.energy` as the primary value into `buffer[writeIndex]`
2. Record accumulated `frameIntake` into `intakeBuffer[writeIndex]`
3. Record accumulated `frameOutput` into `outputBuffer[writeIndex]`
4. Reset accumulators to 0
5. Advance `writeIndex = (writeIndex + 1) % 180`

### Energy Event Classification

**INTAKE events** (add to `frameIntake`):
| Source | Code Location | Value |
|--------|--------------|-------|
| Passive recharge | `game.js:4899` - `ENERGY_RECHARGE_RATE * dt` | `14 * dt * (1 + energyRechargeBonus)` |
| Target beam-up | `game.js:3356-3357` | `floor(targetPoints * 0.3)` |
| Tank beam-up | `game.js:5738-5739` | `floor(TANK_POINTS * 0.3)` |
| Drone beam-up | `game.js:7809-7810` | `floor(dronePoints * 0.3)` |
| Powerup pickup | `game.js:7543-7544` | Fills to `maxEnergy` |
| Self-Sustaining Grid | `game.js:8281`, `8742`, `9121` | Passive regen for drones/coords |

**OUTPUT events** (add to `frameOutput`):
| Source | Code Location | Value |
|--------|--------------|-------|
| Beam drain (target) | `game.js:4771` | `ENERGY_DRAIN_RATE * dt` = `20 * dt` |
| Beam drain (charge coord) | `game.js:4736` | `ENERGY_DRAIN_RATE * dt` = `20 * dt` |
| Drone deploy | `game.js:10035, 10052, 10070, 10087` | `DRONE_ENERGY_COST` = `25` per drone |
| Coordinator auto-deploy | `game.js:10123, 10132` | `25` per coordinator |
| Warp juke | `game.js:10488` | `WARP_JUKE_ENERGY_COST` = `25` |
| Missile fire | `game.js:10599` | `MISSILE_GROUP_ENERGY_COST` = `5` |

### Auto-Scaling Logic

The Y-axis should adapt to the player's current energy capacity:
- `peakValue` = `max(ufo.maxEnergy, highest value in visible buffer)`
- `smoothPeak` lerps toward `peakValue` at rate `0.05` per sample tick (prevents jittery rescaling)
- Graph Y maps `[0, smoothPeak]` to `[graphBottom, graphTop]`
- Reference lines at 25%, 50%, 75% of `smoothPeak` (drawn as faint dashed lines)
- A "critical threshold" line at `ENERGY_MIN_TO_FIRE` (10) always visible as a red dashed line

### Integration Points

The time series tracker should hook into the UFO update method. The simplest approach: instrument `ufo.energy` writes. Before each assignment of `ufo.energy`, compute the delta and classify as intake or output:

```
// Pseudocode for instrumentation
function trackEnergyDelta(oldEnergy, newEnergy) {
    const delta = newEnergy - oldEnergy;
    if (delta > 0) energyTimeSeries.frameIntake += delta;
    else energyTimeSeries.frameOutput += Math.abs(delta);
}
```

### Display Connection to Game State

- **When energy is critically low** (<15%): Graph area below the line tints red
- **When beam is active**: A small "BEAM" indicator flashes on the graph
- **When a spike event occurs** (drone deploy, warp juke): Show a brief marker dot on the graph at the moment of the spike
- **When energy is full**: Graph line turns bright cyan and holds steady at top

---

## 2. BOTTOM-LEFT PANEL - Game Design

### Evaluation Matrix

| Criterion | A: Threat Radar | B: Subsystem Diag | C: Harvest Tracker | D: Event Ticker | E: Tactical Overlay |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Gameplay utility | HIGH - anticipate threats | MED - info redundant with other panels | MED - quota already shown | LOW - retrospective | HIGH - spatial awareness |
| Visual interest | HIGH - sweep animation | HIGH - scrolling text, EVA vibe | MED - graphs | MED - scrolling text | HIGH - minimap |
| Connection to systems | MED - tank/projectile data | HIGH - all systems | MED - harvest only | LOW - passive logging | HIGH - all entities |
| Progressive complexity | HIGH - more threats = richer | MED - more systems = more lines | LOW - stays simple | LOW - linear growth | HIGH - more entities |
| NGE aesthetic fit | HIGH - radar sweep is pure NERV | **HIGHEST** - this IS the EVA bridge | MED - utilitarian | MED - generic | MED - tactical, not EVA |

### Recommendation: Option B (Subsystem Diagnostics) with Option A elements

**Subsystem Diagnostics** is the strongest choice for three reasons:
1. It IS the EVA/NERV aesthetic. Nothing says "piloting alien biotech" like a scrolling wall of diagnostic readouts
2. It scales perfectly with progression - early game shows 3-4 lines, late game shows 12+
3. It provides genuine value by surfacing buried state (coordinator energy, drone health, shield regen timers) that the player can't easily see otherwise

**Hybrid element from Option A**: Include a small threat proximity indicator at the bottom of the diagnostics panel - not a full radar, but a simple "THREATS IN RANGE: 3" counter with a danger color gradient. This gives the spatial awareness of a radar without the visual overhead of a minimap.

### Panel Name: DIAG.SYS (Diagnostics System)

### Tech Gate: Beam Conduit (pg1, Tier 1 Power Grid)

**Rationale**: Beam Conduit is the first tech research most players complete (cheapest at 10 bio-matter). Gating the diagnostics panel behind it:
- Gives it meaning as a reward for the first research
- Prevents Wave 1 from being too visually busy (Wave 1 is tutorial-focused)
- Ensures the player has at least one "system" worth diagnosing
- Creates a natural progression moment: "You researched something, here's your diagnostics view"

### Boot Sequence Integration

```
Panel Key: 'diagnostics'
Boot Label: 'DIAG.SYS'
Boot Color: '#0af' (bright blue)
Start Time: 0.45 (after status, before weapons)
Duration: 1.3
Boot Lines:
  "[DIAG] Initializing subsystem monitor..."
  "[DIAG] Scanning active modules..."
  "[DIAG] Linking telemetry feeds..."
  "[DIAG] DIAG.SYS ONLINE"
```

### Data Lines Specification

Each diagnostic line shows: `[LABEL] VALUE [STATUS_DOT]`

Lines appear/disappear based on what the player currently owns. The panel shows a scrolling view if lines exceed visible space.

**Always-visible lines (after pg1 unlock)**:
| Line | Label | Value | Update Rate | Alert Condition |
|------|-------|-------|-------------|-----------------|
| UFO Energy | `NRG.MAIN` | `{energy}/{maxEnergy}` | Every frame | < 25%: WARN, < 10%: CRIT |
| Beam Status | `BEAM.SYS` | `IDLE` / `ACTIVE` / `CHARGING` / `DEPLETED` | Every frame | DEPLETED: CRIT |
| Shield HP | `SHLD.INTG` | `{health}/{maxHealth}` | Every frame | < 25%: CRIT |

**Conditional lines (appear when system is owned)**:
| Trigger | Label | Value | Alert Condition |
|---------|-------|-------|-----------------|
| `harvesterUnlocked` | `DRN.HARV` | `{alive}/{total} ACTIVE` | Any drone destroyed: flash |
| `battleDroneUnlocked` | `DRN.ATTK` | `{alive}/{total} ACTIVE` | Any drone destroyed: flash |
| Coordinator exists | `COORD.{type}` | `NRG {pct}%` | < 25% energy: CRIT |
| `missileUnlocked` | `ORD.MSL` | `{ready}/{total} RDY` | All recharging: WARN |
| `maxBombs > 0` | `ORD.BMB` | `{bombs}/{maxBombs}` | 0 available: WARN |
| `speedBonus > 0` | `THR.BOOST` | `+{pct}%` | Always nominal |
| `energyCells > 0` | `REV.CELL` | `x{count}` | Always nominal |
| `shieldTransfer` tech | `SHLD.XFER` | `ACTIVE` / `REGEN {timer}s` | Regen: WARN |
| `swarmShield` tech | `SWM.SHLD` | `DMG.ABS ACTIVE` | Always nominal |
| Active powerup | `PWR.{name}` | `{timer}s` / `x{charges}` | < 3s remaining: WARN |

**Threat counter (bottom of panel)**:
| Label | Value | Alert Condition |
|-------|-------|-----------------|
| `THR.PROX` | `{tankCount} HOSTILE` | > 3: WARN, > 5: CRIT |

### Status Dot Colors
- **Nominal**: Steady green dot, slow pulse (800ms)
- **Warning**: Amber dot, medium pulse (400ms)
- **Critical**: Red dot, rapid pulse (150ms), line text turns red

### Scroll Behavior
- Panel has space for ~8 visible lines at 12px line height
- If more than 8 lines: auto-scroll at 1 line/3 seconds, with a brief pause at top/bottom
- Player interaction: none (this is passive display)
- New line appearing: line slides in from right, green flash

### Commander Coexistence
- Commander panel (`commanderZone`) is positioned at bottom-left, `y: canvas.height - 110`
- Diagnostics panel should be positioned ABOVE the commander zone
- Layout: `diagnosticsZone: { x: margin, y: canvas.height - 220, w: leftW, h: 100 }`
- When commander slides in, diagnostics panel stays in place (they don't overlap vertically)
- If canvas is too short (< 600px): diagnostics panel hides while commander is visible

---

## 3. TOP-CENTER WIDGETS - Tech Tree Progression Design

### Widget System Overview

Widgets appear in a horizontal strip along the top-center of the screen, below the mission zone. Each widget is a small, self-contained readout module (approximately 60-80px wide, 18px tall) that activates when its corresponding tech is researched.

### Layout Position
```
widgetStrip: {
    x: centerX,
    y: missionZone.y + missionZone.h + 4,   // directly below mission zone
    w: centerW,                                // same width as mission zone (280px)
    h: 20                                      // single row height
}
```

### Widget Specifications

#### Power Grid Track

| Tech | ID | Widget Label | Display | Update Rate | Animation | Priority |
|------|----|-------------|---------|-------------|-----------|----------|
| Beam Conduit | pg1 | `B.COND` | `LINK` when beam is charging a coordinator, `IDLE` otherwise | Every frame | Pulsing cyan dot when LINK active | 1 |
| Energy Efficiency | pg2 | `E.EFF` | `-30%` (static indicator that efficiency is active) | Static | None (steady green dot) | 8 |
| Power Broadcast | pg3 | `P.BCST` | `R:{radius}` showing current broadcast radius | Every frame | Expanding ring animation when beam active | 5 |
| Reactor Amplifier | pg4 | `R.AMP` | `x2 RCH` (static indicator) | Static | Bright pulse when charging coordinator | 10 |
| Self-Sustaining Grid | pg5 | `S.GRID` | `AUTO` with small energy flow animation | 500ms | Gentle pulse animation (energy flowing) | 12 |

#### Drone Command Track

| Tech | ID | Widget Label | Display | Update Rate | Animation | Priority |
|------|----|-------------|---------|-------------|-----------|----------|
| Drone Uplink | dc1 | `D.UPLK` | `+1 SLOT` / shows current drone count | On drone deploy/destroy | Brief flash on drone event | 2 |
| Harvester Coordinator | dc2 | `H.CORD` | `{count} H` (active harvester coordinators) | 1s | Amber blink when coord low energy | 3 |
| Attack Coordinator | dc3 | `A.CORD` | `{count} A` (active attack coordinators) | 1s | Red blink when coord low energy | 4 |
| Fleet Expansion | dc4 | `FLEET+` | `{total}/{max}` sub-drone count across all coords | 1s | None (steady) | 9 |
| Autonomous Swarm | dc5 | `A.SWM` | `AUTO` when auto-deploying, `STBY` otherwise | Every frame | Green pulse during auto-deploy | 13 |

#### Defense Network Track

| Tech | ID | Widget Label | Display | Update Rate | Animation | Priority |
|------|----|-------------|---------|-------------|-----------|----------|
| Thruster Boost | dn1 | `THR+` | `+30%` (static speed indicator) | Static | None (steady green dot) | 6 |
| Drone Armor | dn2 | `D.ARM` | `-40%` (static damage reduction indicator) | Static | Brief flash when drone takes reduced damage | 7 |
| Shield Transfer | dn3 | `SH.XFR` | `RDY` / `{timer}s` showing shield regen timer | 1s | Blue pulse when shield regenerates | 11 |
| Fleet Resilience | dn4 | `F.RSL` | `FAST` (static redeploy speed indicator) | Static | None (steady) | 14 |
| Swarm Shield | dn5 | `SW.SH` | `ABS:{amount}` showing active damage absorption | Every frame | Cyan ripple when absorbing damage | 15 |

### Priority System

Widgets are ordered by priority number (lower = shown first). With 280px of space and ~65px per widget (including 5px gaps), approximately **4 widgets** fit simultaneously.

**When more widgets than space**:
1. Show the top 4 by priority in the main strip
2. Remaining widgets cycle in a 5-second rotation in the 4th slot (rightmost position shows a rotating display of overflow widgets)
3. The cycling slot has a subtle "..." indicator and shows each overflow widget for 3 seconds with a 0.3s crossfade
4. Critical-state widgets override rotation priority: if a coordinator is low energy, its widget jumps to the visible strip regardless of normal priority

### Appearance Timing
- Widget appears immediately when research completes (during gameplay)
- Entry animation: widget fades in over 0.5s with a brief scale-up bounce (1.0 -> 1.15 -> 1.0)
- If research completes between waves, widget appears during the next wave's boot sequence
- Boot line generated: `"[TECH] {techName} module linked to HUD"`

---

## 4. BOMB CAPACITY INCREASE - Game Balance Analysis

### Current Balance State

| Parameter | Current Value | Source |
|-----------|--------------|--------|
| Max bombs | 6 | `CONFIG.BOMB_MAX_COUNT` (line 80) |
| Starting bombs | 1 | `CONFIG.BOMB_START_COUNT` (line 79) |
| Recharge time | 12s | `CONFIG.BOMB_RECHARGE_TIME` (line 81) |
| Base blast radius | 120px | `BOMB_BLAST_TIERS[0]` (line 340) |
| Max blast radius | 200px | `BOMB_BLAST_TIERS[2]` (line 340) |
| Base damage | 50 | `BOMB_DAMAGE_TIERS[0]` (line 341) |
| Max damage | 100 | `BOMB_DAMAGE_TIERS[2]` (line 341) |
| Cost per bomb | 100 UFO Bucks | `bomb_single` shop item (line 220) |
| Regular tank HP | 50 | `CONFIG.TANK_HEALTH` (line 90) |
| Heavy tank HP | 100 | `CONFIG.HEAVY_TANK_HEALTH` (line 91) |

### DPS Analysis

**Current (6 bombs, fully upgraded)**:
- 6 bombs at 100 damage each = 600 total burst damage
- One-shots regular tanks (100 > 50 HP)
- One-shots heavy tanks (100 >= 100 HP)
- At 200px blast radius, likely hits 2-3 tanks per bomb
- Theoretical max tank kills per full volley: 6-18 tanks
- Full reload time: 12s * 6 = 72s for complete refill (but bombs recharge individually)

**Proposed (9 bombs, fully upgraded)**:
- 9 bombs at 100 damage each = 900 total burst damage
- Same per-bomb kill potential
- Theoretical max kills per full volley: 9-27 tanks
- Full reload time: 12s * 9 = 108s for complete refill
- Average bombs available over time: `maxBombs / rechargeTime` = 9/12 = 0.75 bombs/sec vs 6/12 = 0.50 bombs/sec -- a **50% increase** in sustained bomb rate

### Balance Assessment

**Is 9 balanced?** Yes, with caveats:

1. **Economy check**: 9 bombs costs 800 UFO Bucks total (8 purchases at 100 each, since you start with 1). At current earn rates, this requires significant investment across multiple waves. The player is choosing bombs over other upgrades (missiles, drones, energy). The opportunity cost is real.

2. **Recharge gate**: 12s per bomb means even at 9 max, the player rarely has a full loadout. In practice, players use 2-3 bombs, wait, use 2-3 more. Having 9 capacity mostly helps in "oh no" moments where you need a barrage, and those moments are rare.

3. **Wave scaling**: Later waves have 6+ tanks plus heavy tanks. At wave 5+, 9 bombs may feel necessary rather than overpowered. The current 6-bomb cap can feel constraining against late-wave tank swarms.

4. **Compared to missiles**: A single missile group (4 missiles at 35 damage each = 140 burst) recharges in 3 seconds. Multiple groups provide far higher sustained DPS than bombs. Bombs are already the inferior damage option; increasing capacity makes them more competitive rather than dominant.

**Verdict**: 9 bombs is balanced. The recharge time (12s) is the true limiter, not capacity. Increasing capacity from 6 to 9 gives the player a larger "burst budget" but the same sustained rate. This particularly helps in late-wave scenarios where tank density justifies the investment.

### Shop Flow Impact

- Total cost: 8 x 100 = 800 UFO Bucks for max capacity (up from 5 x 100 = 500)
- This is comparable to missile system investment (400 for unlock + 200 per group + 200 per damage upgrade)
- Fair pricing: no adjustment needed

### 3x3 Grid Display Implications

The visual redesign from 3x2 to 3x3 grid:
- Each bomb slot is 16x16px with 6px spacing
- 3x3 grid = 3 * (16+6) - 6 = 60px wide, same for height
- Fits comfortably in the existing weapons zone width
- The grid naturally fills more symmetrically at 9 than the 3x2 grid at 6
- Partially-full states (e.g., 5/9 bombs) still read clearly since empty slots show recharge arcs

---

## 5. BLINKING INDICATORS - State Connection Mapping

### Design Philosophy

Blink indicators are the heartbeat of the HUD. They communicate system health through rhythm and color without requiring the player to read text. The player should develop an intuitive sense: "fast blinking = something needs attention."

### Global State Machine

```
INDICATOR_STATES = {
    nominal:  { color: baseColor,  rate: 800,  pattern: 'steady' },
    caution:  { color: '#fc0',     rate: 400,  pattern: 'steady' },
    warning:  { color: '#f80',     rate: 250,  pattern: 'steady' },
    critical: { color: '#f22',     rate: 120,  pattern: 'double' },  // double-blink pattern
    offline:  { color: '#333',     rate: 0,    pattern: 'off' }
};
```

**"Double-blink" pattern**: Two rapid blinks followed by a pause. Cycle: ON(60ms) OFF(60ms) ON(60ms) OFF(300ms). This is immediately distinguishable from steady blinking and signals "pay attention NOW."

### Per-Zone Indicator Mappings

#### Status Zone (top-left, base color: `#0ff`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| All nominal | -- | -- | `nominal` |
| Score multiplier active | `combo > 3` | -- | Color shifts to `#ff0`, rate 600 |
| Timer warning | `waveTimer <= 30` | -- | `caution` |
| Timer critical | `waveTimer <= 10` | -- | `critical` |

#### Mission Zone (top-center, base color: `#0a0`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| Quota on track | `quotaProgress / quotaTarget >= expectedProgress` | -- | `nominal` |
| Quota behind | `quotaProgress / quotaTarget < expectedProgress * 0.7` | 70% of expected | `caution`, color `#fc0` |
| Quota far behind | `quotaProgress / quotaTarget < expectedProgress * 0.4` | 40% of expected | `critical` |
| Quota met | `quotaProgress >= quotaTarget` | -- | `nominal`, color `#0f0`, rate 1200 (slow calm pulse) |
| Research active | `techTree.activeResearch !== null` | -- | Add second indicator, color `#0af`, rate 300 |

#### Systems Zone (top-right, base color: `#f80`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| Shield full | `healthPercent > 0.75` | -- | `nominal` |
| Shield damaged | `healthPercent <= 0.5` | 50% | `caution` |
| Shield critical | `healthPercent <= 0.25` | 25% | `critical` |
| Taking damage | `ufo.invincibleTimer > 0` | Just got hit | Flash white for 200ms, then return to current state |
| Energy low | `energyPercent < 0.15` | 15% | Add second indicator, `warning` |
| Energy depleted | `ufo.energy <= 0` | 0 | Second indicator goes `critical` |

#### Weapons Zone (left side, base color: `#f44`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| Weapons ready | All bombs loaded, missiles ready | -- | `nominal` |
| Bomb recharging | Any `bombRechargeTimers.length > 0` | -- | `caution`, rate 500 |
| All bombs depleted | `playerInventory.bombs === 0` | 0 | `warning` |
| All weapons depleted | Bombs 0 AND all missile groups recharging | -- | `critical` |
| Weapon fired | On bomb drop or missile launch | -- | Flash bright white for 150ms |

#### Fleet Zone (right side, base color: `#48f`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| Fleet nominal | All drones/coords healthy | -- | `nominal` |
| Drone destroyed | `drones.some(d => !d.alive)` | -- | `warning`, flash for 3s |
| Coordinator low energy | Any `coord.energyTimer < coord.maxEnergy * 0.25` | 25% | `critical` |
| Coordinator dying | Any `coord.state === 'DYING'` | -- | `critical`, double-blink |
| Fleet at capacity | `activeDrones.length >= droneSlots` | -- | Color shifts to `#0f0` briefly |
| No fleet | No drones/coords deployed | -- | `offline` |

#### Commander Zone (bottom-left, base color: `#0f0`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| Commander speaking | `missionCommanderState.visible` | -- | `nominal`, rate 250 (fast, like data transmission) |
| Commander idle | `!missionCommanderState.visible` | -- | `nominal`, rate 1200 (slow standby pulse) |
| Commander angry | `missionCommanderState.emotion === 'angry'` | -- | Color `#f80`, rate 200 |

#### Diagnostics Zone (bottom-left upper, base color: `#0af`)

| Game State | Variable | Threshold | Indicator State |
|------------|----------|-----------|-----------------|
| All systems nominal | No alerts in diagnostic lines | -- | `nominal` |
| Any system warning | 1+ diagnostic lines in WARN state | -- | `caution` |
| Any system critical | 1+ diagnostic lines in CRIT state | -- | `critical` |

### Global Override: ALL CRITICAL

When the player is in extreme danger (shield < 10% AND energy < 10%), ALL zone indicators synchronize to `critical` state with the double-blink pattern. This creates an unmistakable "red alert" feeling across the entire HUD.

---

## 6. COMMANDER HUD BUG ANALYSIS

### Bug Description
The commander panel shows before the game starts past wave 1. Specifically, when transitioning from wave 1 (or any wave) to wave 2+, the commander panel appears visible during the wave transition or boot sequence before it should.

### Code Flow Analysis

**missionCommanderState reset** occurs in the full game reset at `game.js:11874`:
```js
missionCommanderState = {
    visible: false,
    ...
    cooldownTimer: 15,
    ...
};
```
This reset only happens in `startGame()` (full game reset). It does NOT reset between waves.

**Wave transition flow** (line 18060-18084):
1. `updateWaveTransition(dt)` counts down `waveTransitionTimer`
2. When timer hits 0: `gameState = 'PLAYING'`, calls `initHUDBoot()`
3. `initHUDBoot()` sets `p.commander.active = wave >= 2` (line 13733)

**The bug**: Between waves, `missionCommanderState` is NOT reset. Here's the problematic sequence:

1. During wave N (N >= 2), `updateMissionCommander()` runs and eventually sets `missionCommanderState.visible = true` (line 13649)
2. Commander's `displayTimer` counts up. When it hits `displayDuration`, `visible` is set to `false` (line 13615)
3. BUT: if the wave ends (timer runs out, triggers wave summary/shop) WHILE the commander is still visible (`displayTimer < displayDuration`), the commander remains `visible = true`
4. During WAVE_SUMMARY and SHOP states, `updateMissionCommander()` returns early because `gameState !== 'PLAYING'` (line 13596)
5. So `missionCommanderState.visible` is stuck at `true`
6. When the next wave starts and `renderHUDFrame()` runs, the check at line 12734:
   ```js
   if (missionCommanderState.visible && (wave >= 2 || tutorialState))
   ```
   ...evaluates to TRUE because `visible` was never cleared
7. The commander panel renders immediately, even during the boot sequence

### Root Cause
`missionCommanderState.visible` is not reset during wave transitions. The `updateMissionCommander()` function only runs during `PLAYING` state, so it can't clean up a visible commander when the game transitions to `WAVE_SUMMARY` or `SHOP`.

### Fix Specification

Add a `missionCommanderState` reset in the wave transition logic. At `game.js:18067` (inside the `if (waveTransitionTimer <= 0)` block), before `initHUDBoot()`:

```
missionCommanderState.visible = false;
missionCommanderState.dialogue = '';
missionCommanderState.typewriterIndex = 0;
missionCommanderState.typewriterTimer = 0;
missionCommanderState.displayTimer = 0;
missionCommanderState.cooldownTimer = 15;  // Reset cooldown so commander doesn't trigger immediately
```

This ensures:
- Commander visibility is cleared before the boot sequence starts
- The 15-second cooldown gives the boot sequence time to complete before the commander triggers
- The boot sequence's `p.commander.active = wave >= 2` correctly controls whether the boot overlay shows

**Alternative consideration**: The boot sequence itself could suppress commander rendering. But the cleaner fix is to reset state at wave boundary, which is where all other state resets happen.

### Additional Observation

The `triggeredThisWave` field in `missionCommanderState` (line 12469) is defined but never read in the current code. It's set in the initial state and the game reset, but no logic checks it. This appears to be vestigial or intended for future use (e.g., preventing certain commander triggers from firing more than once per wave). It should either be implemented or removed to avoid confusion.

---

## Appendix A: State Variable Summary

New state objects needed for implementation:

```
// Energy time series (Section 1)
let energyTimeSeries = { ... };  // See Section 1 data model

// Diagnostics panel (Section 2)
let diagnosticsState = {
    visible: false,
    slideProgress: 0,
    lines: [],           // Current diagnostic lines to display
    scrollOffset: 0,     // Current scroll position
    scrollDirection: 1,  // 1 = down, -1 = up
    scrollPauseTimer: 0  // Pause at top/bottom
};

// Tech widgets (Section 3)
let techWidgets = {
    active: [],          // Array of { techId, label, value, state, fadeIn, priority }
    overflowIndex: 0,    // Current overflow display index
    overflowTimer: 0     // Timer for overflow cycling
};

// Indicator states (Section 5)
let indicatorStates = {
    status: 'nominal',
    mission: 'nominal',
    systems: 'nominal',
    weapons: 'nominal',
    fleet: 'nominal',
    commander: 'nominal',
    diagnostics: 'nominal'
};
```

## Appendix B: Progression Timeline

| Wave | Events | HUD State |
|------|--------|-----------|
| 1 | Tutorial, first abductions | Status + Systems zones only. Mission deferred until beam tutorial. No commander, no weapons/fleet panels |
| 1 (shop) | Player buys first bomb/drone | -- |
| 2 | First tech research possible | Weapons/Fleet panels slide in if purchased. Commander activates. If Beam Conduit researched: Diagnostics panel boots |
| 2+ | Tech widgets begin appearing | Widgets populate as tech completes. Diagnostics grows richer |
| 3+ | Multiple coordinators possible | Fleet zone fills out. Diagnostics shows coordinator detail lines |
| 5+ | Late game, many systems | Full HUD: all zones active, 4+ widgets visible with overflow, diagnostics scrolling 10+ lines, energy graph showing complex patterns |

## Appendix C: Integration with Existing Boot System

New panels register in `hudBootState.panels`:

```
diagnostics: { active: false, startTime: 0.45, duration: 1.3, progress: 0, phase: 'waiting' }
```

And in `hudBootState.bootLines`:
```
diagnostics: []
```

The `initHUDBoot()` function needs to add:
```
p.diagnostics.active = techFlags.beamConduit;  // Only boots if Beam Conduit researched
```

Tech widgets do not have individual boot sequences. They appear via fade-in animation during normal gameplay when research completes.
