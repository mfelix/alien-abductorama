# BIOS Evolution Design -- Tech Tree Visual Integration

## Philosophy

The BIOS boot sequence is the ship's soul made visible. Each technology researched adds a new subsystem to the boot -- a new panel, a new data stream, a new node in the growing network. Wave 1 boots clean: three panels, sparse diagnostics, silence. By wave 10, with a full tech tree, the boot is a cathedral of data: 18+ panels cascading across the screen, ASCII network topologies pulsing between them, three-computer voting displays resolving consensus, data conduits flowing between nodes. The player *earns* visual complexity. The BIOS tells the story of what they have built.

Every tech panel follows the existing `renderPanelBootOverlay()` contract: a zone rect, a height, a color, a label, a panel state, and boot lines. New tech panels are small -- typically 60-80px tall, 100-140px wide -- and slot into underused screen regions (top-right gap, bottom-right below fleet, mid-right corridor). They boot in the same staggered cascade, triggered by trace progress, with the same typewriter/cursor/scanline effects.

The key insight: tech panels are NOT new HUD panels during gameplay. They exist ONLY during the boot sequence, as additional diagnostic readouts that flash through during the 5.5-second boot window, then dissolve. They are ghosts -- beautiful, dense, ephemeral. The ship's memory of what it has become.

---

## Screen Layout -- Available Real Estate

```
+--------+-------+-----------+-------+----------+
| STATUS | TECH  |  MISSION  |  BM   | SYSTEMS  |  <- top row (72px tall)
| .SYS   | .SYS  |   .CTL    | .COND | .SHIELD  |
+--------+-------+-----------+-------+----------+
|        |       |                    |          |
| ORD    | [A]   |                    | NRG.FLOW |  <- mid row
| .SYS   |       |    GAME AREA      |          |
|        | [B]   |                    +----------+
+--------+       |                    |          |
| OPS    | [C]   |                    | FLEET    |  <- right column
| .LOG   |       |                    | .CMD     |
+--------+       |                    |          |
| DIAG   |       |                    |          |
| .SYS   |       |                    +----------+
+--------+-------+                    |   [D]    |
|                |                    |          |
| COMMS.SYS     |                    |   [E]    |
+----------------+--------------------+----------+

[A]-[E] = AVAILABLE ZONES FOR TECH EVOLUTION PANELS
```

### Available Zones for New Tech Panels

| Zone | Location | Dimensions | Notes |
|------|----------|------------|-------|
| **A** | Left column, between ORD.SYS and game area | ~100x80px | Narrow vertical strip |
| **B** | Left mid, between OPS.LOG and game area | ~100x80px | Below zone A |
| **C** | Left lower, between DIAG.SYS and game area | ~100x80px | Below zone B |
| **D** | Right column, below FLEET.CMD | ~195x80px | Wide, underused |
| **E** | Right column, below zone D | ~195x80px | Bottom-right, underused |

In practice, most tech panels will cluster into the **right column below fleet** and the **left column gaps**, creating a visual impression of subsystem density growing outward from the core panels.

---

## Master Panel Registry -- All 15 Techs

### Naming Convention

Panel labels follow existing pattern: `SUBSYSTEM.TYPE` in caps, max 10 chars.
Colors inherit from their track with slight per-tier variation.

### Power Grid Track (base color: #f80 orange)

| Tech | Panel Label | Color | Position | Boot Start | Duration |
|------|------------|-------|----------|------------|----------|
| pg1 | `BM.CNDUIT` | #f90 | right-D (below fleet) | 0.65 | 1.0 |
| pg2 | `NRG.EFF` | #fa0 | right-D (stacks below pg1) | 0.70 | 0.9 |
| pg3 | `PWR.BCAST` | #fb0 | right-E (below pg2) | 0.75 | 0.9 |
| pg4 | `RX.AMP` | #fc0 | right-E (stacks below pg3) | 0.80 | 1.0 |
| pg5 | `GRID.AUTO` | #fd0 | center-bottom overlay | 0.85 | 1.2 |

### Drone Command Track (base color: #48f blue)

| Tech | Panel Label | Color | Position | Boot Start | Duration |
|------|------------|-------|----------|------------|----------|
| dc1 | `DRN.UPLNK` | #58f | left-A (gap beside ORD) | 0.65 | 1.0 |
| dc2 | `HRV.COORD` | #68f | left-B (below dc1) | 0.70 | 1.0 |
| dc3 | `ATK.COORD` | #78f | left-B (stacks below dc2) | 0.75 | 1.0 |
| dc4 | `FLT.EXPND` | #88f | left-C (below dc3) | 0.80 | 1.1 |
| dc5 | `SWM.AUTO` | #99f | center-bottom overlay | 0.85 | 1.2 |

### Defense Network Track (base color: #d60 red-orange)

| Tech | Panel Label | Color | Position | Boot Start | Duration |
|------|------------|-------|----------|------------|----------|
| dn1 | `THR.BOOST` | #e50 | right-D (beside pg1) | 0.65 | 0.9 |
| dn2 | `DRN.ARMR` | #d40 | right-D (stacks below dn1) | 0.70 | 0.9 |
| dn3 | `SHD.XFER` | #c30 | right-E (below dn2) | 0.75 | 1.0 |
| dn4 | `FLT.RSLNC` | #b20 | right-E (stacks below dn3) | 0.80 | 1.0 |
| dn5 | `SWM.SHLD` | #a10 | center-bottom overlay | 0.85 | 1.2 |

---

## Per-Tech Panel Designs

### TIER 1 -- Simple Elements

Tier 1 panels are small (100x60px), minimal, with 3-4 diagnostic lines. They introduce the concept of tech-specific boot readouts without overwhelming the screen.

---

#### pg1: Beam Conduit -- `BM.CNDUIT`

**Position**: Right column, directly below FLEET.CMD (or below NRG.FLOW if no fleet)
**Size**: 140x65px
**Color**: #f90

**ASCII Content**:
```
BM.CNDUIT
>> INIT CONDUIT.SYS
BEAM -> [=====>] -> DRN
[OK] CONDUIT LINK
>> BM.CNDUIT ACTIVE
```

**Animation**: The `[=====>]` arrow animates during boot -- the `=` characters shift right like flowing energy. Each `=` appears with a 30ms delay creating a flowing pipe effect.

**Diagnostic Lines**:
```javascript
[
    '>> INIT CONDUIT.SYS',
    'BEAM -> [=====>] -> DRN',
    '[OK] CONDUIT LINK ESTAB',
    '>> BM.CNDUIT ACTIVE'
]
```

**Connection**: During boot, a faint dashed line (animated) draws from the NRG.FLOW panel to this panel, suggesting the beam conduit linking power to drones.

---

#### dc1: Drone Uplink -- `DRN.UPLNK`

**Position**: Left column, in gap between ORD.SYS right edge and game area
**Size**: 105x60px
**Color**: #58f

**ASCII Content**:
```
DRN.UPLNK
>> INIT DRN.UPLINK
SLOT ALLOC: [+1] -> 3
[OK] PATHFIND v2.1
>> UPLINK READY
```

**Animation**: The `[+1]` blinks twice in bright white before settling. Slot count types out digit by digit.

**Diagnostic Lines**:
```javascript
[
    '>> INIT DRN.UPLINK',
    `SLOT ALLOC: [+1] -> ${snap.droneSlots}`,
    '[OK] PATHFIND v2.1',
    '>> UPLINK READY'
]
```

---

#### dn1: Thruster Boost -- `THR.BOOST`

**Position**: Right column, below FLEET.CMD, beside pg1 if both exist (otherwise same slot)
**Size**: 140x60px
**Color**: #e50

**ASCII Content**:
```
THR.BOOST
>> INIT THRUSTER.MOD
SPD.MULT: 1.0 -> 1.3
[OK] THRUST CALIBRATED
>> THR.BOOST ONLINE
```

**Animation**: `1.0 -> 1.3` animates as a counter incrementing from 1.0 in 0.05 steps to 1.3, like a speedometer dial-up. Numbers scroll rapidly.

**Diagnostic Lines**:
```javascript
[
    '>> INIT THRUSTER.MOD',
    'SPD.MULT: 1.0x -> 1.3x',
    '[OK] THRUST CALIBRATED',
    '>> THR.BOOST ONLINE'
]
```

---

### TIER 2 -- Growing Complexity

Tier 2 panels are slightly larger (140x70px), with 5-6 lines and one ASCII micro-visualization.

---

#### pg2: Energy Efficiency -- `NRG.EFF`

**Position**: Right column, stacks below pg1
**Size**: 140x70px
**Color**: #fa0

**ASCII Content**:
```
NRG.EFF
>> INIT NRG.EFF MODULE
DRAIN.RATE: [||||||   ] 70%
OPTIMIZING POWER PATHS...
[OK] EFF.MOD INSTALLED
SAVE: -30% DRAIN
>> NRG.EFF ACTIVE
```

**Animation**: The progress bar `[||||||   ]` animates backwards from 100% to 70%, visually showing the drain reduction. Each bar segment blinks off with a tiny spark effect.

**Diagnostic Lines**:
```javascript
[
    '>> INIT NRG.EFF MODULE',
    'DRAIN.RATE: [||||||   ] 70%',
    'OPTIMIZING POWER PATHS...',
    '[OK] EFF.MOD INSTALLED',
    'SAVE: -30% DRAIN',
    '>> NRG.EFF ACTIVE'
]
```

---

#### dc2: Harvester Coordinator -- `HRV.COORD`

**Position**: Left column, gap area below dc1
**Size**: 105x75px
**Color**: #68f

**ASCII Content**:
```
HRV.COORD
>> INIT HRV.PROTOCOL
LOADING COORD MATRIX:
  [M]--+--[H]
       |
      [H]
[OK] HRV.NET LINKED
>> COORD STANDING BY
```

**Animation**: The ASCII tree diagram builds node by node. `[M]` (mothership) appears first, then `--+--` connectors trace outward, then `[H]` (harvester) nodes appear with a small glow. Each node addition triggers a soft click.

**Diagnostic Lines**:
```javascript
[
    '>> INIT HRV.PROTOCOL',
    'LOADING COORD MATRIX:',
    '  [M]--+--[H]',
    '       |',
    '      [H]',
    '[OK] HRV.NET LINKED',
    '>> COORD STANDING BY'
]
```

---

#### dn2: Drone Armor -- `DRN.ARMR`

**Position**: Right column, stacks below dn1
**Size**: 140x70px
**Color**: #d40

**ASCII Content**:
```
DRN.ARMR
>> INIT ARMOR.SYS
PLATING: [########--] 80%
DMG.REDUCTION: -40%
[OK] ARMOR APPLIED
>> FLEET HARDENED
```

**Animation**: The plating bar fills segment by segment with a metallic orange glow. Each segment makes a dull "clunk" sound.

**Diagnostic Lines**:
```javascript
[
    '>> INIT ARMOR.SYS',
    'PLATING: [########--] 80%',
    'DMG.REDUCTION: -40%',
    '[OK] ARMOR APPLIED',
    '>> FLEET HARDENED'
]
```

---

### TIER 3 -- Network Topologies Emerge

Tier 3 introduces multi-line ASCII art showing network connections. Panels grow to 140x85px with 6-7 lines. This is where the BIOS starts feeling like a real command center.

---

#### pg3: Power Broadcast -- `PWR.BCAST`

**Position**: Right column, below pg2 (entering zone E)
**Size**: 140x85px
**Color**: #fb0

**ASCII Content**:
```
PWR.BCAST
>> INIT PWR.BROADCAST
RADIUS: =====[UFO]=====
            /   \
        [D1]     [D2]
     [D3]   [D4]   [D5]
[OK] BROADCAST NET UP
>> PWR.BCAST ONLINE
```

**Animation**: The broadcast radius lines `=====` pulse outward from `[UFO]` center like a radar ping. Each `[Dn]` node lights up as the pulse reaches it, creating a cascade of activations from center outward. The `/` and `\` connector lines draw downward progressively.

**Diagnostic Lines**:
```javascript
[
    '>> INIT PWR.BROADCAST',
    'RADIUS: =====[UFO]=====',
    '            /   \\',
    '        [D1]     [D2]',
    '     [D3]   [D4]   [D5]',
    '[OK] BROADCAST NET UP',
    '>> PWR.BCAST ONLINE'
]
```

---

#### dc3: Attack Coordinator -- `ATK.COORD`

**Position**: Left column, below dc2
**Size**: 105x85px
**Color**: #78f

**ASCII Content**:
```
ATK.COORD
>> INIT ATK.PROTOCOL
COORD NET:
  [M]--+--[A]
  |    |
 [H]  [A]--[a][a]
[OK] ATK.NET LINKED
>> COORDS ARMED
```

**Animation**: Same tree-building as dc2 but now with both `[H]` (harvester) and `[A]` (attack) nodes. Attack nodes pulse red briefly when they appear, then settle to blue. Sub-drones `[a]` cascade from their parent coordinator.

**Diagnostic Lines**:
```javascript
[
    '>> INIT ATK.PROTOCOL',
    'COORD NET:',
    '  [M]--+--[A]',
    '  |    |',
    ' [H]  [A]--[a][a]',
    '[OK] ATK.NET LINKED',
    '>> COORDS ARMED'
]
```

---

#### dn3: Shield Transfer -- `SHD.XFER`

**Position**: Right column, zone E, below dn2
**Size**: 140x85px
**Color**: #c30

**ASCII Content**:
```
SHD.XFER
>> INIT SHD.TRANSFER
UFO.SHLD ->> COORD:
  (( UFO )) ===> [C1]
             ===> [C2]
REGEN: 30s CYCLE
[OK] SHIELD LINK
>> SHD.XFER READY
```

**Animation**: The `===>` arrows animate as flowing particles (characters shifting right, like `...===>`  then `..===>` then `.====>`) showing shield energy flowing from UFO to coordinators. The `(( ))` around UFO pulse in and out.

**Diagnostic Lines**:
```javascript
[
    '>> INIT SHD.TRANSFER',
    'UFO.SHLD ->> COORD:',
    '  (( UFO )) ===> [C1]',
    '             ===> [C2]',
    'REGEN: 30s CYCLE',
    '[OK] SHIELD LINK',
    '>> SHD.XFER READY'
]
```

---

### TIER 4 -- Dense Data Flows

Tier 4 panels are the first to use "data stream" backgrounds -- faint scrolling hex characters behind the diagnostic text. They are 140x95px with 7-8 lines and feature animated data flow connections between related panels.

---

#### pg4: Reactor Amplifier -- `RX.AMP`

**Position**: Right column, zone E (deep right, near bottom)
**Size**: 140x95px
**Color**: #fc0

**ASCII Content**:
```
RX.AMP
>> INIT RX.AMPLIFIER
REACTOR OUTPUT:
  [##########] 100%
  [##########] 100% x2
  ^^^^^^^^^^^^^^^^
  DOUBLED OUTPUT
BEAM.RATE: 2.0x
[OK] AMPLIFIER ENGAGED
>> RX.AMP HOT
```

**Animation**: The first bar fills to 100%, then a second bar materializes beneath it and fills rapidly -- visually doubling. The `^^^^^^^^` characters cascade upward like heat shimmer. `x2` blinks emphatically.

**Special**: During boot, a faint data conduit line draws from this panel to the NRG.FLOW panel showing reactor output feeding into the energy system.

**Diagnostic Lines**:
```javascript
[
    '>> INIT RX.AMPLIFIER',
    'REACTOR OUTPUT:',
    '  [##########] 100%',
    '  [##########] 100% x2',
    '  ^^^^^^^^^^^^^^^^',
    'BEAM.RATE: 2.0x',
    '[OK] AMPLIFIER ENGAGED',
    '>> RX.AMP HOT'
]
```

---

#### dc4: Fleet Expansion -- `FLT.EXPND`

**Position**: Left column, zone C (below dc3)
**Size**: 105x95px
**Color**: #88f

**ASCII Content**:
```
FLT.EXPND
>> INIT FLT.EXPAND
FLEET TOPOLOGY:
  [M]---+---+
   |    |   |
  [C1] [C2] [C3]
  /|\  /|\  /|\
 ddddd ddddd ddddd
[OK] 5 SUB-DRN/COORD
>> FLEET MAX CAPACITY
```

**Animation**: This is the showpiece tree diagram. The mothership `[M]` appears first, then connectors draw outward. Each coordinator `[C]` appears with a blue flash, then sub-drone `d` characters cascade beneath each coordinator in a waterfall pattern. The tree builds top-down over the full boot duration, creating a satisfying progressive reveal.

**Diagnostic Lines**:
```javascript
[
    '>> INIT FLT.EXPAND',
    'FLEET TOPOLOGY:',
    '  [M]---+---+',
    '   |    |   |',
    '  [C1] [C2] [C3]',
    '  /|\\  /|\\  /|\\',
    ' ddddd ddddd ddddd',
    '[OK] 5 SUB-DRN/COORD',
    '>> FLEET MAX CAPACITY'
]
```

---

#### dn4: Fleet Resilience -- `FLT.RSLNC`

**Position**: Right column, zone E, deep bottom
**Size**: 140x95px
**Color**: #b20

**ASCII Content**:
```
FLT.RSLNC
>> INIT FLT.RESILIENCE
REDEPLOY TIMER:
  STD: [====10s====]
  NEW: [==5s==]     -50%
SHIELD REGEN:
  STD: [====30s====]
  NEW: [==15s=]     x2
[OK] RESILIENCE PKG
>> FLT.RSLNC ACTIVE
```

**Animation**: The STD (standard) bars appear first, then the NEW bars materialize below them -- visibly shorter, showing the improvement. The `-50%` and `x2` blink in bright red-orange. The old bars dim and cross out with a strikethrough animation.

**Diagnostic Lines**:
```javascript
[
    '>> INIT FLT.RESILIENCE',
    'REDEPLOY TIMER:',
    '  STD: [====10s====]',
    '  NEW: [==5s==]     -50%',
    'SHIELD REGEN:',
    '  STD: [====30s====]',
    '  NEW: [==15s=]     x2',
    '[OK] RESILIENCE PKG',
    '>> FLT.RSLNC ACTIVE'
]
```

---

### TIER 5 -- Mind-Blowing Density (The MAGI Panels)

Tier 5 techs are the crown jewels. Each one gets a LARGE panel (200x120px) that overlays the center-bottom of the screen during boot. They feature the MAGI-inspired triple-computer voting display, rapid data cascades, and the densest ASCII art in the game. Only one tier-5 tech panel displays at a time (they share the overlay slot), with priority: pg5 > dc5 > dn5, but if multiple are researched they cycle during the boot window.

When ALL THREE tier-5 techs are researched, they combine into a single enormous **MAGI.CONSENSUS** panel.

---

#### pg5: Self-Sustaining Grid -- `GRID.AUTO`

**Position**: Center-bottom overlay (covers game area briefly during boot)
**Size**: 240x120px
**Color**: #fd0

**ASCII Content**:
```
GRID.AUTO -- SELF-SUSTAINING POWER GRID
+============================================+
| REACTOR.CORE          | DISTRIBUTION.NET   |
| [##########] 100%     | UFO -> C1 -> d1-d5 |
| REGEN: +2.1/s         |      -> C2 -> d1-d5 |
| STATUS: PERPETUAL     |      -> C3 -> d1-d5 |
|                       |                     |
| POWER FLOW:           | NET.CAPACITY:       |
| >>>=====>>>=====>>>   | [##########] MAX    |
| AUTO.CYCLE: ENGAGED   | NODES: 18           |
+============================================+
  MAGI.VOTE: MELCHIOR [APPROVE] BALTHASAR [APPROVE] CASPER [APPROVE]
  >> GRID.AUTO CONSENSUS: APPROVED -- PERPETUAL POWER AUTHORIZED
```

**Animation**: This is the spectacle. The power flow arrows `>>>=====>>>` animate continuously like flowing energy. The distribution tree builds right-to-left. The MAGI voting line appears last -- each computer name types out, then its vote `[APPROVE]` slams in with a bright flash and a deep confirmation tone. Three flashes, three tones, consensus reached. The entire panel pulses gold once when complete.

**Special Effect**: When `GRID.AUTO` boots, faint gold connection lines radiate from this panel to EVERY other power-related panel on screen (NRG.FLOW, BM.CNDUIT, NRG.EFF, PWR.BCAST, RX.AMP) -- showing the self-sustaining grid connecting everything.

**Diagnostic Lines**:
```javascript
[
    '>> INIT GRID.AUTO',
    'REACTOR.CORE: [##########] 100%',
    'REGEN: +2.1 NRG/s PERPETUAL',
    'POWER FLOW: >>>=====>>>=====>>>',
    'DISTRIBUTION NET: 18 NODES',
    'MAGI.VOTE: MELCHIOR [APPROVE]',
    'MAGI.VOTE: BALTHASAR [APPROVE]',
    'MAGI.VOTE: CASPER [APPROVE]',
    '[OK] CONSENSUS: APPROVED',
    '>> PERPETUAL POWER AUTHORIZED'
]
```

---

#### dc5: Autonomous Swarm -- `SWM.AUTO`

**Position**: Center-bottom overlay (same slot as pg5)
**Size**: 240x120px
**Color**: #99f

**ASCII Content**:
```
SWM.AUTO -- AUTONOMOUS SWARM INTELLIGENCE
+============================================+
| SWARM.BRAIN           | FLEET.TOPOLOGY     |
| NEURONS: 2048         |      [M]           |
| SYNC.RATE: 99.7%      |    / | | \         |
| AUTONOMY: FULL        |  [C][C][C][C]      |
|                       |  ||| ||| ||| |||   |
| DECISION CYCLE:       |  ddd ddd ddd ddd   |
| SENSE->DECIDE->ACT    |                     |
| LATENCY: 0.3ms        | UNITS: 20          |
+============================================+
  MAGI.VOTE: MELCHIOR [APPROVE] BALTHASAR [APPROVE] CASPER [APPROVE]
  >> SWM.AUTO CONSENSUS: APPROVED -- FULL AUTONOMY AUTHORIZED
```

**Animation**: The swarm brain section shows neuron count rapidly incrementing from 0 to 2048. The fleet topology tree builds from top (mothership) cascading down through coordinators to sub-drones in a waterfall. `SENSE->DECIDE->ACT` cycles repeatedly with arrows animating. The MAGI vote resolves the same way as pg5.

**Special Effect**: When `SWM.AUTO` boots, blue connection lines radiate to FLEET.CMD and all drone command panels (DRN.UPLNK, HRV.COORD, ATK.COORD, FLT.EXPND).

**Diagnostic Lines**:
```javascript
[
    '>> INIT SWM.AUTO',
    'SWARM.BRAIN: 2048 NEURONS',
    'SYNC.RATE: 99.7%',
    'AUTONOMY: FULL',
    'DECISION: SENSE->DECIDE->ACT',
    'LATENCY: 0.3ms',
    'MAGI.VOTE: MELCHIOR [APPROVE]',
    'MAGI.VOTE: BALTHASAR [APPROVE]',
    'MAGI.VOTE: CASPER [APPROVE]',
    '[OK] CONSENSUS: APPROVED',
    '>> FULL AUTONOMY AUTHORIZED'
]
```

---

#### dn5: Swarm Shield -- `SWM.SHLD`

**Position**: Center-bottom overlay (same slot as pg5/dc5)
**Size**: 240x120px
**Color**: #a10

**ASCII Content**:
```
SWM.SHLD -- COLLECTIVE DEFENSE MATRIX
+============================================+
| SHIELD.MATRIX         | ABSORPTION.NET     |
| FIELD: [##########]   |    .  . (UFO) .  . |
| INTEGRITY: 100%       |   . [d] . [d] .    |
| TYPE: PASSIVE         |  .   [d].[d]   .   |
|                       |   .  . [d] .  .    |
| DMG.ABSORB/TICK:      |    `. . . . .`     |
| ======= 15 HP =====  |    FIELD: ACTIVE    |
| REGEN: CONTINUOUS     |                     |
+============================================+
  MAGI.VOTE: MELCHIOR [APPROVE] BALTHASAR [APPROVE] CASPER [APPROVE]
  >> SWM.SHLD CONSENSUS: APPROVED -- COLLECTIVE DEFENSE ONLINE
```

**Animation**: The absorption net diagram animates: dots `(.)` pulse outward from `(UFO)` center in concentric rings, like a shield expanding. Drone nodes `[d]` glow when the pulse passes them. The damage absorption bar animates as a flowing wave pattern `=======` that undulates.

**Special Effect**: Red-orange connection lines radiate to all defense panels (THR.BOOST, DRN.ARMR, SHD.XFER, FLT.RSLNC) and the SYS.SHIELD panel.

**Diagnostic Lines**:
```javascript
[
    '>> INIT SWM.SHLD',
    'SHIELD MATRIX: [##########] 100%',
    'FIELD TYPE: PASSIVE ABSORB',
    'DMG.ABSORB: 15 HP/TICK',
    'REGEN: CONTINUOUS',
    'FIELD NODES: 8 DRONES',
    'MAGI.VOTE: MELCHIOR [APPROVE]',
    'MAGI.VOTE: BALTHASAR [APPROVE]',
    'MAGI.VOTE: CASPER [APPROVE]',
    '[OK] CONSENSUS: APPROVED',
    '>> COLLECTIVE DEFENSE ONLINE'
]
```

---

## The MAGI Consensus Panel (All Three Tier-5s Researched)

When ALL THREE tier-5 techs are researched, the three individual tier-5 panels are REPLACED by a single combined `MAGI.SYS` panel -- the ultimate BIOS evolution.

**Position**: Center-bottom overlay, larger than individual tier-5s
**Size**: 300x140px
**Color**: cycles through #fd0, #99f, #a10

```
MAGI.SYS -- TRIPLE CONSENSUS ARRAY
+=======+===================+=======+
|MELCHR | SYSTEM.STATUS     |CSPRSN |
|[GRID] | GRID.AUTO: ONLINE | [SHLD]|
|ONLINE | SWM.AUTO:  ONLINE | ONLINE|
+-------+                   +-------+
|BALTSR | FLEET  PWR  DEF   |VOTING |
|[SWRM] | [OK]  [OK]  [OK]  | 3/3   |
|ONLINE | CONSENSUS: UNAN.  | PASS  |
+=======+===================+=======+
  ALL MAGI SYSTEMS: UNANIMOUS CONSENSUS
  >> AUTONOMOUS OPERATION AUTHORIZED
  >> ALL SUBSYSTEMS AT MAXIMUM CAPABILITY
```

**Animation**: This is the climax of the entire boot evolution system. The three MAGI computer sections (MELCHIOR/BALTHASAR/CASPER) boot simultaneously with their own mini-progress bars. The center section shows a real-time voting display where each system casts its vote with a dramatic flash. When all three vote `[OK]`, the word `UNANIMOUS` types out and the entire panel border flashes white, then settles to a cycling rainbow glow.

**Timing**: This panel boots LAST, appearing at t=4.0s and completing at t=5.2s, giving it maximum dramatic weight.

---

## Inter-Panel Connection Lines (Data Conduits)

During boot, faint animated lines connect related panels, showing the ship's data network growing:

### Connection Map

```
NRG.FLOW -------- BM.CNDUIT (pg1)
    |                 |
    +---- NRG.EFF (pg2)
    |                 |
    +---- PWR.BCAST (pg3) ---- [fleet drones]
    |
    +---- RX.AMP (pg4)
    |
    +---- GRID.AUTO (pg5) ---- [ALL panels]

FLEET.CMD ------- DRN.UPLNK (dc1)
    |                 |
    +---- HRV.COORD (dc2)
    |         |
    +---- ATK.COORD (dc3)
    |         |
    +---- FLT.EXPND (dc4) ---- [coordinators]
    |
    +---- SWM.AUTO (dc5) ---- [ALL fleet panels]

SYS.SHIELD ------ THR.BOOST (dn1)
    |                 |
    +---- DRN.ARMR (dn2)
    |         |
    +---- SHD.XFER (dn3) ---- [coordinators]
    |         |
    +---- FLT.RSLNC (dn4)
    |
    +---- SWM.SHLD (dn5) ---- [ALL defense panels]
```

### Visual Style

- Lines are 1px, panel color at 20% alpha
- Animated dashes flow along the line direction (like data packets)
- Lines appear only when BOTH connected panels have started booting
- Lines fade out with the boot sequence
- Maximum 6-8 connection lines visible at once (performance budget)

---

## Boot Timing Integration

### Existing Panel Boot Schedule (unchanged)

```
Trace Progress -> Panel Trigger:
  0.01  status
  0.04  techsys
  0.07  mission
  0.10  biomatter
  0.14  systems
  0.20  fleet
  0.42  commander
  0.55  opslog
  0.60  diagnostics
  0.70  weapons
```

### New Tech Panel Boot Schedule (additive)

Tech panels boot AFTER the trace reaches ~75% (the existing panels are already well into their boot phase), creating a second wave of panel activations that makes the boot feel like it's accelerating.

```
Trace Progress -> Tech Panel Trigger:
  0.75  all tier-1 techs (pg1, dc1, dn1) -- if researched
  0.80  all tier-2 techs (pg2, dc2, dn2) -- if researched
  0.85  all tier-3 techs (pg3, dc3, dn3) -- if researched
  0.90  all tier-4 techs (pg4, dc4, dn4) -- if researched
  0.95  all tier-5 techs (pg5, dc5, dn5 or MAGI.SYS) -- if researched
```

This creates a clear visual hierarchy: core systems boot first, tech augmentations cascade in afterward by tier.

### Boot Duration Scaling

| Researched Techs | Boot Duration |
|-----------------|---------------|
| 0 (wave 1) | 5.5s (standard) |
| 1-3 (early game) | 5.5s (same -- panels fill in late) |
| 4-6 (mid game) | 5.5s (same -- panels use existing time budget more densely) |
| 7-9 (late mid) | 5.5s (same) |
| 10-12 (late game) | 5.8s (slight extension for tier-4 drama) |
| 13-15 (endgame) | 6.2s (extension for MAGI consensus) |

The boot does NOT get significantly longer. Instead, it gets DENSER within the same window. More panels boot simultaneously in the late phase, creating an overwhelming cascade of data.

---

## Existing Panel Boot Text Modifications

When techs are researched, EXISTING panels also get enriched boot text:

### SYS.STATUS (status panel)

Adds per-track summary line:
```
[OK] PWR.GRID: 3/5 MODULES       (if any powerGrid tech)
[OK] DRN.CMD: 2/5 MODULES        (if any droneCommand tech)
[OK] DEF.NET: 4/5 MODULES        (if any defenseNetwork tech)
```

### FLEET.CMD (fleet panel)

With dc2+: `[OK] HRV.COORDINATOR NET`
With dc3+: `[OK] ATK.COORDINATOR NET`
With dc4+: `FLEET.CAPACITY: EXPANDED`
With dc5:  `[OK] AUTONOMOUS MODE`

### NRG.FLOW (energy graph -- doesn't have boot text currently)

With pg1+: `CONDUIT: ACTIVE`
With pg2+: `EFFICIENCY: +30%`
With pg4+: `AMPLIFIER: x2`
With pg5:  `GRID: SELF-SUSTAINING`

### SYS.SHIELD (systems panel)

With dn1+: `[OK] THR.BOOST: +30% SPD`
With dn2+: `[OK] DRN.ARMOR: -40% DMG`
With dn3+: `[OK] SHD.XFER: ACTIVE`
With dn5:  `[OK] SWM.SHLD: PASSIVE DEF`

---

## Progressive Visual Density Chart

This shows what the boot screen looks like at different progression stages:

### Early Game (1-2 techs, waves 2-4)

```
+--------+------+-----------+------+----------+
| STATUS | TECH |  MISSION  |  BM  | SYSTEMS  |
+--------+------+-----------+------+----------+
|        |      |                   |          |
| ORD    |[pg1] |                   | NRG.FLOW |
| .SYS   |      |    GAME AREA     |          |
|        |      |                   +----------+
+--------+      |                   |          |
| OPS    |      |                   | FLEET    |
| .LOG   |      |                   | .CMD     |
+--------+      |                   |          |
                |                   +----------+
                |                   |[dn1]     |
                |                   +----------+
```

3 core panels + 2 tech panels. Clean. Promising.

### Mid Game (5-7 techs, waves 5-7)

```
+--------+------+-----------+------+----------+
| STATUS | TECH |  MISSION  |  BM  | SYSTEMS  |
+--------+------+-----------+------+----------+
|        |      |                   |          |
| ORD    |[dc1] |                   | NRG.FLOW |
| .SYS   |      |    GAME AREA     |          |
|        |[dc2] |                   +----------+
+--------+      |                   |          |
| OPS    |[dc3] |                   | FLEET    |
| .LOG   |      |                   | .CMD     |
+--------+      |                   |          |
| DIAG   |      |                   +----------+
| .SYS   |      |                   |[pg1][dn1]|
+--------+------+                   +----------+
|                |                  |[pg2][dn2]|
| COMMS.SYS     |                  +----------+
+----------------+------------------+----------+
```

8 core panels + 5 tech panels. The right column fills. Connection lines visible.

### Late Game (10-12 techs, waves 8-10)

```
+--------+------+-----------+------+----------+
| STATUS | TECH |  MISSION  |  BM  | SYSTEMS  |
+--------+------+-----------+------+----------+
|        |      |                   |          |
| ORD    |[dc1] |                   | NRG.FLOW |
| .SYS   |      |    GAME AREA     |          |
|        |[dc2] |                   +----------+
+--------+      |                   |          |
| OPS    |[dc3] |                   | FLEET    |
| .LOG   |      |                   | .CMD     |
+--------+      |                   |          |
| DIAG   |[dc4] |                   +----------+
| .SYS   |      |                   |[pg1][dn1]|
+--------+------+                   +----------+
|                |                  |[pg2][dn2]|
| COMMS.SYS     |                  +----------+
+----------------+                  |[pg3][dn3]|
                 |                  +----------+
                 |                  |[pg4][dn4]|
                 +------------------+----------+
```

10 core panels + 8 tech panels. Dense. Connection lines form a visible network.

### Endgame -- Full Tree (15 techs, wave 12+)

```
+--------+------+-----------+------+----------+
| STATUS | TECH |  MISSION  |  BM  | SYSTEMS  |
+--------+------+-----------+------+----------+
|        |      |                   |          |
| ORD    |[dc1] |                   | NRG.FLOW |
| .SYS   |      |    GAME AREA     |          |
|        |[dc2] |                   +----------+
+--------+      |                   |          |
| OPS    |[dc3] |                   | FLEET    |
| .LOG   |      |                   | .CMD     |
+--------+      |                   |          |
| DIAG   |[dc4] |                   +----------+
| .SYS   |      |                   |[pg1][dn1]|
+--------+------+                   +----------+
|                |                  |[pg2][dn2]|
| COMMS.SYS     |                  +----------+
+----------------+                  |[pg3][dn3]|
                 |                  +----------+
                 |                  |[pg4][dn4]|
                 +--+----------+---+----------+
                    |          |
                    | MAGI.SYS |
                    | [MELCHIOR|BALTHASAR|CASPER] |
                    | UNANIMOUS CONSENSUS          |
                    +------------------------------+
```

10 core panels + 12 tech panels + MAGI overlay. Connection lines everywhere. The boot is a symphony of data. The ship has become the MAGI.

---

## Implementation Data Structure

### New State: `hudBootState.techPanels`

```javascript
// Added to hudBootState alongside existing panels
techPanels: {
    // Each tech panel mirrors the existing panel contract
    pg1: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    pg2: { active: false, startTime: 0, duration: 0.9, progress: 0, phase: 'waiting' },
    pg3: { active: false, startTime: 0, duration: 0.9, progress: 0, phase: 'waiting' },
    pg4: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    pg5: { active: false, startTime: 0, duration: 1.2, progress: 0, phase: 'waiting' },
    dc1: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    dc2: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    dc3: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    dc4: { active: false, startTime: 0, duration: 1.1, progress: 0, phase: 'waiting' },
    dc5: { active: false, startTime: 0, duration: 1.2, progress: 0, phase: 'waiting' },
    dn1: { active: false, startTime: 0, duration: 0.9, progress: 0, phase: 'waiting' },
    dn2: { active: false, startTime: 0, duration: 0.9, progress: 0, phase: 'waiting' },
    dn3: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    dn4: { active: false, startTime: 0, duration: 1.0, progress: 0, phase: 'waiting' },
    dn5: { active: false, startTime: 0, duration: 1.2, progress: 0, phase: 'waiting' },
    magi: { active: false, startTime: 0, duration: 1.4, progress: 0, phase: 'waiting' }
},

techBootLines: {
    pg1: [], pg2: [], pg3: [], pg4: [], pg5: [],
    dc1: [], dc2: [], dc3: [], dc4: [], dc5: [],
    dn1: [], dn2: [], dn3: [], dn4: [], dn5: [],
    magi: []
}
```

### Tech Panel Zone Calculator

```javascript
function getTechPanelZones(layout, researchedTechs) {
    // Right column zones: stack below fleet panel
    const rightX = layout.fleetZone.x;
    const rightW = layout.fleetZone.w;
    const rightStartY = layout.fleetZone.y + 300 + 8; // below fleet
    const panelH = 65;  // tier 1-2
    const panelHLarge = 85;  // tier 3-4
    const panelHMassive = 120; // tier 5
    const gap = 4;

    // Left column zones: stack in gap beside ORD/OPS/DIAG
    const leftX = layout.weaponsZone.x + layout.weaponsZone.w + 4;
    const leftW = Math.min(110, layout.missionZone.x - leftX - 4);
    const leftStartY = layout.weaponsZone.y;

    // Allocate zones dynamically based on what's researched
    const zones = {};
    let rightY = rightStartY;
    let leftY = leftStartY;

    // Power Grid + Defense Network -> right column (split into two sub-columns or stacked)
    const pgTechs = ['pg1','pg2','pg3','pg4','pg5'].filter(t => researchedTechs.includes(t));
    const dnTechs = ['dn1','dn2','dn3','dn4','dn5'].filter(t => researchedTechs.includes(t));
    const dcTechs = ['dc1','dc2','dc3','dc4','dc5'].filter(t => researchedTechs.includes(t));

    // Right column: interleave pg and dn panels
    for (let i = 0; i < Math.max(pgTechs.length, dnTechs.length); i++) {
        const h = i < 2 ? panelH : (i < 4 ? panelHLarge : panelHMassive);
        if (pgTechs[i]) {
            zones[pgTechs[i]] = { x: rightX, y: rightY, w: rightW, h };
            rightY += h + gap;
        }
        if (dnTechs[i]) {
            zones[dnTechs[i]] = { x: rightX, y: rightY, w: rightW, h };
            rightY += h + gap;
        }
    }

    // Left column: dc panels
    for (let i = 0; i < dcTechs.length; i++) {
        const h = i < 2 ? panelH : (i < 4 ? panelHLarge : panelHMassive);
        if (leftW >= 80) { // only render if there's enough space
            zones[dcTechs[i]] = { x: leftX, y: leftY, w: leftW, h };
            leftY += h + gap;
        }
    }

    // Tier 5 overlay (center bottom) -- overrides position for t5 techs
    const hasPg5 = researchedTechs.includes('pg5');
    const hasDc5 = researchedTechs.includes('dc5');
    const hasDn5 = researchedTechs.includes('dn5');
    const allT5 = hasPg5 && hasDc5 && hasDn5;

    if (allT5) {
        // MAGI.SYS combined panel
        const magiW = 300;
        const magiH = 140;
        zones.magi = {
            x: (canvas.width - magiW) / 2,
            y: canvas.height - magiH - 20,
            w: magiW,
            h: magiH
        };
        // Remove individual t5 zones
        delete zones.pg5;
        delete zones.dc5;
        delete zones.dn5;
    } else {
        // Individual t5 panels as center-bottom overlay
        const overlayW = 240;
        const overlayH = 120;
        const overlayX = (canvas.width - overlayW) / 2;
        const overlayY = canvas.height - overlayH - 20;
        if (hasPg5) zones.pg5 = { x: overlayX, y: overlayY, w: overlayW, h: overlayH };
        else if (hasDc5) zones.dc5 = { x: overlayX, y: overlayY, w: overlayW, h: overlayH };
        else if (hasDn5) zones.dn5 = { x: overlayX, y: overlayY, w: overlayW, h: overlayH };
    }

    return zones;
}
```

### Panel Metadata Config

```javascript
const TECH_BOOT_PANELS = {
    pg1: { label: 'BM.CNDUIT', color: '#f90', tier: 1 },
    pg2: { label: 'NRG.EFF',   color: '#fa0', tier: 2 },
    pg3: { label: 'PWR.BCAST', color: '#fb0', tier: 3 },
    pg4: { label: 'RX.AMP',    color: '#fc0', tier: 4 },
    pg5: { label: 'GRID.AUTO', color: '#fd0', tier: 5 },
    dc1: { label: 'DRN.UPLNK', color: '#58f', tier: 1 },
    dc2: { label: 'HRV.COORD', color: '#68f', tier: 2 },
    dc3: { label: 'ATK.COORD', color: '#78f', tier: 3 },
    dc4: { label: 'FLT.EXPND', color: '#88f', tier: 4 },
    dc5: { label: 'SWM.AUTO',  color: '#99f', tier: 5 },
    dn1: { label: 'THR.BOOST', color: '#e50', tier: 1 },
    dn2: { label: 'DRN.ARMR',  color: '#d40', tier: 2 },
    dn3: { label: 'SHD.XFER',  color: '#c30', tier: 3 },
    dn4: { label: 'FLT.RSLNC', color: '#b20', tier: 4 },
    dn5: { label: 'SWM.SHLD',  color: '#a10', tier: 5 },
    magi: { label: 'MAGI.SYS', color: '#fff', tier: 6 }
};
```

---

## Performance Budget

- Tech panels reuse `renderPanelBootOverlay()` -- no new rendering code
- Connection lines: max 8 lines, each a simple `moveTo`/`lineTo` with dashed stroke
- MAGI panel: single `renderPanelBootOverlay()` call with longer boot lines
- Zone calculation: runs once at boot start in `initHUDBoot()`
- Total additional cost per frame: ~1-2ms during boot (negligible)
- No additional cost outside of boot sequence

---

## Summary: What the Player Experiences

**Wave 2, no tech**: Standard boot. 8 panels cascade on. Clean, fast.

**Wave 3, first tech researched (pg1)**: Boot plays as before, but near the end a NEW tiny panel flickers to life in the right column. "BM.CNDUIT" -- a conduit linking beam to drones. A faint dashed line appears connecting it to NRG.FLOW. The player notices: *my tech made the boot change.*

**Wave 5, three techs**: Three new panels now. The boot feels noticeably denser. Data connection lines form a small network visible during boot. The ship is growing.

**Wave 8, eight techs**: The boot screen is alive with panels. Left column has drone command readouts cascading, right column has power and defense panels stacking. Connection lines form a visible network topology. ASCII tree diagrams build during boot. The ship feels complex and powerful.

**Wave 12, all 15 techs**: The boot is a spectacle. Every inch of screen margin has a panel. Network topology lines criss-cross. And then, at t=4.0s, the MAGI.SYS panel materializes center-bottom. Three supercomputers boot in parallel. They vote. UNANIMOUS CONSENSUS. The panel flashes white. The ship is complete. The player has earned this moment.
