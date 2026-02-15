# HUD Evolution - Visual Design Specification

## Document Purpose
Pixel-precise visual design specifications for six HUD enhancements. All measurements are in CSS pixels at the reference resolution of 1280x720. No implementation code -- design only.

---

## 1. BLINKING CORNER INDICATORS (All Panels)

### Design Philosophy
Evangelion NERV bridge displays use dense clusters of small blinking status lights at panel edges to convey "alive system" feeling. Each panel gets a unique indicator configuration expressing its personality -- Status is calm/steady, Weapons is aggressive/fast, Fleet is orderly/cascading.

### New Indicator Shapes

The existing `renderNGEBlinkLight` draws a 4x4 filled square. We extend the vocabulary with five additional shapes:

```
SQUARE (existing)    DIAMOND           TRIANGLE-UP        CIRCLE            CROSS
  ####               ##                 #                 ##                #
  ####              ####              ###               ####              ###
  ####               ##              #####               ####              #
  ####                                                   ##
  4x4px             5x5px            5x4px              4x4px             5x3px
```

Each shape renders at the specified pixel size. When "on," the shape draws with its assigned color + shadowBlur=4 glow. When "off," it draws as `rgba(255,255,255,0.08)` with no glow (ghost outline showing where the light lives).

### New Blink Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `steady` | On/off at fixed rate (existing) | Normal status |
| `double` | Two quick flashes (80ms on, 60ms off, 80ms on), then 600ms off | Active/processing |
| `cascade` | Sequential activation across a group, 100ms stagger per light | Data flow visualization |
| `reactive` | Rate scales with a game value (e.g., faster when energy low) | Warning feedback |
| `random` | On/off with random interval 200-800ms | Alien/organic feel |

### Per-Panel Indicator Specifications

#### STATUS ZONE (Cyan #0ff) -- 120x210px panel, cut corner: TL

```
+---[SYS.STATUS]----------[a]--+
|                               |
|  (score, wave, timer...)      |
|                               |
[b]                          [c]|
+-------------------------------+

Indicator [a]: existing blink light at (x+w-12, y+8) -- KEEP AS-IS
             Shape: square 4x4, Color: #0ff, Rate: 800ms steady

Indicator [b]: NEW -- bottom-left corner
             Position: (x+4, y+120-8)
             Shape: diamond 5x5, Color: #0ff, Rate: 1200ms steady

Indicator [c]: NEW -- bottom-right corner
             Position: (x+w-8, y+120-8)
             Shape: circle 4x4, Color: #0ff, Mode: reactive
             Reactive binding: waveTimer -- blinks faster as timer runs out
               waveTimer > 30s: rate=1500ms
               waveTimer 10-30s: rate=600ms
               waveTimer < 10s: rate=200ms (urgent pulse)
```

Total: 3 indicators (1 existing + 2 new)

#### MISSION ZONE (Green #0a0) -- 110x280px panel, centered

```
+--[d]--[MISSION.CTL]---------[e]--+
|                                   |
|  (quota bar, harvest counter...)  |
|                                   |
+--[f]--[g]-----------------------[h]+

Indicator [d]: top-left corner
             Position: (x+4, y+4)
             Shape: triangle-up 5x4, Color: #0a0, Rate: 700ms steady

Indicator [e]: top-right corner
             Position: (x+w-8, y+4)
             Shape: square 4x4, Color: #0a0, Mode: reactive
             Reactive binding: quotaProgress/quotaTarget
               > 80%: solid ON (no blink), color shifts to #0f0 (bright green)
               50-80%: rate=1000ms steady
               < 50%: rate=400ms, color shifts to #ff0 (yellow warning)

Indicator [f]: bottom-left corner
             Position: (x+4, y+110-6)
             Shape: circle 4x4, Color: #0a0, Rate: 900ms steady

Indicator [g]: bottom-left, offset right of [f]
             Position: (x+12, y+110-6)
             Shape: circle 4x4, Color: #0a0, Rate: 900ms steady, phase offset +450ms
             (Creates paired heartbeat effect with [f])

Indicator [h]: bottom-right corner
             Position: (x+w-8, y+110-6)
             Shape: diamond 5x5, Color: #0a0, Rate: 1100ms steady
```

Total: 5 indicators

#### SYSTEMS ZONE (Orange #f80) -- 88x195px panel, cut corner: TR

```
+--[i]--[SYS.INTG]-------/  +
|                        /   |
|  (shield, cubes...)   /    |
|                            |
+--[j]-------------------[k]-+

Indicator [i]: top-left corner
             Position: (x+4, y+4)
             Shape: square 4x4, Color: #f80, Rate: 600ms steady

Indicator [j]: bottom-left corner
             Position: (x+4, y+88-8)
             Shape: cross 5x3, Color: #f80, Mode: reactive
             Reactive binding: shield health percentage
               > 50%: rate=1000ms, color=#f80
               25-50%: rate=500ms, color=#fc0 (yellow-orange)
               < 25%: rate=150ms, color=#f44 (red), with shadowBlur=8 (enhanced glow)

Indicator [k]: bottom-right corner
             Position: (x+w-8, y+88-8)
             Shape: diamond 5x5, Color: #f80, Rate: 800ms steady
```

Total: 3 indicators

#### WEAPONS ZONE (Red #f44) -- dynamic height, 210px wide, cut corner: BL

```
+--[l]--[ORD.SYS]----------[m]-+
|                               |
|  (bombs, missiles...)        |
|                               |
/  [n]                      [o] |
+-------------------------------+

Indicator [l]: top-left corner
             Position: (x+4, y+4)
             Shape: triangle-up 5x4, Color: #f44, Rate: 500ms steady

Indicator [m]: top-right corner
             Position: (x+w-8, y+4)
             Shape: square 4x4, Color: #f44, Mode: double
             Double-flash pattern when any weapon is recharging;
             solid steady ON when all weapons ready

Indicator [n]: bottom-left (above cut corner)
             Position: (x+14, y+panelH-8)
             Shape: cross 5x3, Color: #f44, Mode: random (200-800ms intervals)
             Conveys "unstable ordnance" personality

Indicator [o]: bottom-right corner
             Position: (x+w-8, y+panelH-8)
             Shape: circle 4x4, Color: #f44, Rate: 400ms steady
```

Total: 4 indicators

#### FLEET ZONE (Blue #48f) -- dynamic height, 195px wide, cut corner: TR

```
+--[p]--[FLEET.CMD]------/  +
|                        /   |
|  (drone tree...)      /    |
|                            |
+--[q][r][s]----------[t]---+

Indicator [p]: top-left corner
             Position: (x+4, y+4)
             Shape: diamond 5x5, Color: #48f, Rate: 700ms steady

Indicators [q][r][s]: bottom-left -- CASCADE GROUP
             Positions: (x+4, y+panelH-8), (x+12, y+panelH-8), (x+20, y+panelH-8)
             Shape: all square 4x4, Color: #48f
             Mode: cascade -- [q] blinks, 100ms later [r] blinks, 100ms later [s] blinks
             Each on-period: 200ms. Full cycle: 900ms.
             Visual effect: data streaming left-to-right, representing fleet comm chatter

Indicator [t]: bottom-right corner
             Position: (x+w-8, y+panelH-8)
             Shape: circle 4x4, Color: #48f, Rate: 1000ms steady
```

Total: 5 indicators

#### COMMANDER ZONE (Green #0f0) -- 100x260px panel, cut corners: TL, BR

```
/--[INCOMING TRANSMISSION]--[u]+
|                               |
|  (portrait + dialogue)        |
|                               |
+--[v]---------------------/   +

Indicator [u]: existing blink light at (x+8, y+6) -- KEEP AS-IS
             Shape: square 4x4, Color: #0f0, Rate: 250ms steady (fast urgent blink)

Indicator [v]: bottom-left corner
             Position: (x+4, y+h-8)
             Shape: triangle-up 5x4, Color: #0f0, Mode: double
             Creates "incoming signal" feel
```

Total: 2 indicators (1 existing + 1 new)

### Performance Note
Total new indicators across all panels: ~18 new blink lights. Each is a single fillRect or tiny path draw with optional shadowBlur. Cost: <0.5ms/frame total. All timing uses `Date.now()` modular arithmetic (no per-indicator timers needed).

### Implementation Function Signature
```
renderNGEIndicator(x, y, shape, color, mode, opts)
  shape: 'square'|'diamond'|'triangle'|'circle'|'cross'
  mode: 'steady'|'double'|'cascade'|'reactive'|'random'
  opts: { rate, phaseOffset, reactiveValue, cascadeIndex, cascadeTotal, glowIntensity }
```

This replaces the need for multiple `renderNGEBlinkLight` calls. Existing calls can remain unchanged (they're just `shape='square', mode='steady'`).

---

## 2. TOP-CENTER GAP WIDGETS (Tech Readout Chips)

### Gap Geometry

```
At 1280px canvas:
  statusZone ends at:   x = 10 + 210 = 220
  missionZone starts at: x = (1280 - 280) / 2 = 500
  Gap width: 500 - 220 = 280px
  Gap starts: x = 224 (4px margin from status edge)
  Gap ends:   x = 496 (4px margin from mission edge)
  Usable width: 272px

At 1920px canvas:
  statusZone ends at:   x = 10 + 210 = 220  (leftW caps at 210)
  missionZone starts at: x = (1920 - 280) / 2 = 820
  Gap width: 820 - 220 = 600px
  Usable width: 592px
```

### Widget Design

Each researched technology adds a small "tech chip" widget to the gap. Chips are tiny self-contained status readouts.

#### Chip Dimensions
- Width: 44px (compact) or 58px (wide, for longer labels)
- Height: 18px
- Margin between chips: 3px horizontal, 3px vertical
- Border: 0.5px solid, color matched to track
- Background: `rgba(5, 8, 18, 0.5)`
- Corner cut: single 4px cut on top-right corner (miniature NGE panel style)

#### Track Color Coding
| Track | Color | Abbreviation |
|-------|-------|-------------|
| powerGrid | #ff0 (yellow) | PG |
| droneCommand | #48f (blue) | DC |
| defenseNetwork | #f80 (orange) | DN |

#### Chip Content Layout

```
+--[CHIP]----------/+
| PG1 CONDUIT  [=] |
+-------------------+
  ^   ^          ^
  |   |          |
  ID  Abbrev.   Status indicator (2x2 blink light)
```

- **ID**: Track abbreviation + tier number. Font: bold 7px monospace, track color at 70% alpha.
- **Name abbreviation**: Shortened tech name. Font: 7px monospace, white at 60% alpha.
- **Status indicator**: 2x2px blink light, track color, rate=1200ms steady. Located at (chipX+chipW-5, chipY+8).

#### All 15 Chip Definitions

| Tech ID | Chip Text | Width |
|---------|-----------|-------|
| pg1 | `PG1 CONDUIT` | 58px |
| pg2 | `PG2 EFFIC` | 44px |
| pg3 | `PG3 BCAST` | 44px |
| pg4 | `PG4 REACT` | 44px |
| pg5 | `PG5 S.GRID` | 52px |
| dc1 | `DC1 UPLINK` | 52px |
| dc2 | `DC2 H.CORD` | 52px |
| dc3 | `DC3 A.CORD` | 52px |
| dc4 | `DC4 EXPND` | 44px |
| dc5 | `DC5 SWARM` | 44px |
| dn1 | `DN1 THRST` | 44px |
| dn2 | `DN2 ARMOR` | 44px |
| dn3 | `DN3 SHLD.T` | 52px |
| dn4 | `DN4 RESIL` | 44px |
| dn5 | `DN5 S.SHLD` | 52px |

#### Layout Algorithm

Chips are placed left-to-right within the gap, wrapping to a second row when the row fills:

```
Row start Y: y = 6 (top margin)
Row 1: y = 6
Row 2: y = 6 + 18 + 3 = 27

Layout math:
  gapStartX = statusZone.x + statusZone.w + 4
  gapEndX = missionZone.x - 4
  gapW = gapEndX - gapStartX

  curX = gapStartX
  curY = 6
  for each researched tech (in order: pg1,pg2,...,dc1,dc2,...,dn1,dn2,...):
    chipW = chip's defined width
    if (curX + chipW > gapEndX):
      curX = gapStartX
      curY += 18 + 3  // wrap to next row
    render chip at (curX, curY)
    curX += chipW + 3
```

#### Grouping Visual

Chips from the same track render adjacent. Between track groups, insert a 2px vertical separator line:
- Position: at the boundary x, from y=curY+2 to y=curY+16
- Color: `rgba(255,255,255,0.08)`
- Only renders if both tracks have researched techs

#### Capacity Check

At 1280px (272px usable gap):
- Max chips in row 1 before wrap: ~5-6 chips (depending on widths)
- Row 2 provides overflow. Two rows can hold all 15 chips.
- At typical mid-game (4-6 techs): single row, clean layout.

At 1920px (592px usable gap): all 15 chips fit in a single row with room to spare.

#### Boot Animation for New Chips

When a tech completes research mid-wave or between waves, its chip gets a micro boot sequence:

1. **Frame 0-10 (0-166ms)**: Chip border traces clockwise from top-left, bright flash on the trace point (2px dot, track color, shadowBlur=6)
2. **Frame 10-20 (166-333ms)**: Background fills in. Text scrambles (random characters cycling), then settles to real text character-by-character (10ms/char)
3. **Frame 20-25 (333-416ms)**: Status indicator blinks 3x rapidly, then settles to steady blink
4. **After 416ms**: Chip is in normal render mode

If the chip appears during the HUD boot sequence (wave start), it boots with the Status panel (same timing).

#### ASCII Art: Gap at 1280px, Mid-Game (6 techs researched)

```
[SYS.STATUS panel]  [PG1 CONDUIT][PG2 EFFIC]|[DC1 UPLINK][DC2 H.CORD]|[DN1 THRST]  [MISSION.CTL panel]
x=10..220           x=224..282   x=285..329  x=334..386  x=389..441   x=445..489   x=500..780
                                 ^ 2px sep                             ^ 2px sep
```

---

## 3. ORDNANCE PANEL REDESIGN

### Label Changes
- Section header "ORD.B" changes to "BOMBS"
- Section header "ORD.M" changes to "MISSILES"
- Panel label remains "ORD.SYS"

### Bomb Grid: 3x3

```
CONFIG change: BOMB_MAX_COUNT = 6 -> 9

Grid Layout:
  bombSize = 16px (unchanged)
  bombSpacing = 6px (unchanged)
  Grid: 3 columns x 3 rows

  Total grid width:  3 * 16 + 2 * 6 = 60px
  Total grid height: 3 * 16 + 2 * 6 = 60px

  Grid positioned at: gridStartX = x + pad + 70 (unchanged)
  Vertical start: curY (after "BOMBS" label + key badge)
```

#### Bomb Grid Visual

```
BOMBS [Z]
         [O] [O] [O]     O = filled bomb (circle with fuse spark)
         [O] [O] [O]     o = empty slot (dark outline)
         [O] [o] [o]     Recharge arcs on empty slots
```

Each bomb cell occupies 22x22px (16px bomb + 6px spacing). Bombs fill left-to-right, top-to-bottom. Recharge arcs animate clockwise around empty slots.

### Missile Section (unchanged layout, label only)

```
MISSILES [X]
         A [>>>>] [>>>>]     Groups displayed as before
         B [>>>>]            (up to 3-column grid)
```

### Revised Panel Height Calculation

```
panelH = 22                                  // header ("ORD.SYS")
if bombs:
  panelH += 4                                // spacing after "BOMBS" label
  bombRows = ceil(maxBombs / 3)              // always 3 columns now
  panelH += bombRows * (16 + 6) + 18        // grid + post-grid spacing
if missiles:
  panelH += 4                                // spacing after "MISSILES" label
  panelH += missileRowsPerCol * groupRowH + 8 // missile grid + bottom pad
panelH += 8                                  // bottom padding

Example with 9 bombs + 4 missile groups (2 cols):
  panelH = 22 + 4 + 3*22 + 18 + 4 + 2*17 + 8 + 8
         = 22 + 4 + 66 + 18 + 4 + 34 + 8 + 8
         = 164px

Current max (6 bombs + missiles): ~140-160px
New max (9 bombs + missiles): ~164px -- fits within the 200px weaponsZone.h allocation
```

### Vertical Fit Verification

```
Canvas height: 720px
weaponsZone.y = 140
weaponsZone available to bottom of status: 720 - 140 = 580px
Required: 164px max
Result: FITS with 416px of clearance below
```

The 3x3 bomb grid + missile groups fit comfortably. Even with research progress bar below (28px), total is only ~196px.

---

## 4. ENERGY TIME SERIES GRAPH (Systems Zone Extension)

### Placement: New Sub-Panel Below Systems Zone

The systems zone currently renders at 88px height. Below it, speed/energy bonus indicators extend to ~y+130. The energy graph renders as a separate sub-panel below all systems content.

```
Systems Zone Layout:
  systemsZone.y = 10
  Panel: 88px (shield bar + energy cubes)
  Speed indicator: +14px (if active, at y+88+22 relative)
  Energy indicator: +14px (if active, below speed)

  Graph sub-panel starts at:
    graphY = systemsZone.y + 88 + speedIndicatorH + energyIndicatorH + 8

    Where speedIndicatorH = playerInventory.speedBonus > 0 ? 22 : 0
    Where energyIndicatorH = playerInventory.maxEnergyBonus > 0 ? 14 : 0

    Minimum graphY (no bonuses): 10 + 88 + 8 = 106
    Maximum graphY (both bonuses): 10 + 88 + 22 + 14 + 8 = 142
```

### Graph Dimensions

```
+--[NRG.FLOW]----------------/+     Cut corner: TR (matches systems zone)
|  100 |-+--+--+--+--+--+--+ |
|      | .  .  .  ....  .  . |     Graph area:
|   50 |-.. ......  ... . .. |       x: graphX + 28 (after Y-axis labels)
|      |  .......  ..........|       y: graphY + 14 (after header)
|    0 +-+--+--+--+--+--+--+ |       w: 195 - 28 - 6 = 161px
|       -30s         -0s     |       h: 48px
+-----------------------------+

  Panel width: 195px (matches systemsZone.w)
  Panel height: 72px
  Panel position: (systemsZone.x, graphY)
  Border color: #f80 (orange, matching systems zone)
  Background alpha: 0.5
```

### Data Specification

| Line | Color | Description | Data Source |
|------|-------|-------------|-------------|
| Energy OUTPUT | #f44 (red) | Energy consumed per sample interval | beam drain + drone costs + bomb costs per 100ms |
| Energy INTAKE | #0f0 (green) | Energy gained per sample interval | beaming up targets + passive regen per 100ms |

#### Sampling
- Sample rate: 10 samples/second (every 100ms)
- Buffer size: 300 samples (30 seconds of history)
- Ring buffer: oldest sample drops off the left edge, newest appended at right

#### Rendering

```
Grid lines:
  Horizontal: 3 lines at 0%, 50%, 100% of Y range
  Color: rgba(255, 255, 255, 0.06)
  Line width: 0.5px

  Vertical: every 5 seconds (5 lines across 30s window)
  Color: rgba(255, 255, 255, 0.04)

Y-Axis:
  Auto-scaling: Y range = max(peakValue * 1.2, 10)
  Recalculate Y range every 60 frames (smooth, no jitter)
  Labels: "0", midpoint, peak -- font: 7px monospace, #666

X-Axis:
  Labels at left "-30s" and right "now" -- font: 7px monospace, #555

Line rendering:
  OUTPUT line: 1px stroke, #f44, globalAlpha=0.8
  INTAKE line: 1px stroke, #0f0, globalAlpha=0.8
  Both lines use lineTo() point-to-point (no bezier smoothing -- Factorio-sharp)

  Fill-under-curve (area chart):
    OUTPUT: linearGradient top=#f44 alpha=0.12, bottom=#f44 alpha=0.0
    INTAKE: linearGradient top=#0f0 alpha=0.08, bottom=#0f0 alpha=0.0
```

#### Scroll Animation
Data shifts left by 1 pixel per sample (161px / 300 samples = 0.537px/sample). Each frame, the graph redraws from the ring buffer. No actual pixel-shifting needed -- just iterate the buffer and plot.

### Header

```
"NRG.FLOW" label: bold 9px monospace, #f80
Position: (graphX + 6, graphY + 10)
Blink light: renderNGEBlinkLight(graphX + panelW - 10, graphY + 4, '#f80', 600)
```

### Legend (inline, right-aligned in header area)

```
At (graphX + panelW - 60, graphY + 10):
  Tiny 6x2 red line + "OUT" text (7px monospace, #f44)
At (graphX + panelW - 28, graphY + 10):
  Tiny 6x2 green line + "IN" text (7px monospace, #0f0)
```

### Boot Sequence Integration

- Graph panel boots as part of Systems zone (same start time: t=0.3s)
- Boot diagnostic line: `NRG.FLOW BUFFER [########] OK`
- During calibrate phase: graph area shows static noise that clears to reveal an empty graph grid
- During online phase: graph begins sampling immediately

### Unlock Condition

The energy graph appears after the player has **any tech researched** (bio-matter investment implies interest in efficiency). Alternatively, it could be gated to Beam Conduit (pg1) to tie it to the power grid track. Recommended: **pg1 (Beam Conduit)** unlock gate.

### Performance

- Ring buffer: 300 floats x 2 channels = 2.4KB
- Render: 300 lineTo calls per line x 2 lines = 600 draw calls per frame
- Cost: ~0.3ms/frame. Acceptable.

---

## 5. BOTTOM-LEFT CORNER PANEL (Mission Log)

### Decision: MISSION LOG (Scrolling Event Ticker)

After evaluating all options, the **Mission Log** best serves the game because:
- It provides moment-to-moment feedback without requiring interpretation (unlike a radar)
- It fills dead space with constantly changing content (unlike static diagnostics)
- It reinforces the NGE "bridge operator readout" feel -- scrolling status updates like MAGI system logs
- It complements the Commander dialogue (commander gives personality, log gives data)
- It is the cheapest to render (text only, no complex geometry)

### Panel Design

```
Panel name: "OPS.LOG" (Operations Log)
Position: (x=10, y=canvas.height-220)
Width: 240px (slightly narrower than commander zone's 260px)
Height: 100px
Border color: #8af (light blue-purple -- distinct from Fleet's #48f)
Cut corners: ['bl'] (bottom-left, matching weapons zone's angular language)
Background alpha: 0.45 (more transparent than other panels -- this is ambient info)
```

### Layout Within Panel

```
+--[OPS.LOG]---[blink]---[blink]--+
|  > TANK DESTROYED +150          |
|  > HARVESTER DEPLOYED           |
|  > COORD.H ENERGY LOW          |  <- yellow text for warnings
|  > +3 BIOMATTER                 |
|  > SHIELD HIT -15 HP           |  <- red text for damage
/  ________________________________|
+----------------------------------+

Header: "OPS.LOG" at (x+6, y+11), bold 9px monospace, #8af
Blink lights:
  (x+w-18, y+4) square 4x4, #8af, 500ms steady
  (x+w-10, y+4) square 4x4, #8af, 500ms steady, phase offset +250ms (alternating pair)

Log area:
  Start: (x+6, y+20)
  Available height: 74px
  Line height: 12px
  Max visible lines: 6
  Font: 9px monospace
  Prefix: "> " (2 chars, dimmed #555)
```

### Event Categories and Colors

| Event | Log Text | Text Color |
|-------|----------|------------|
| Target abducted | `+{n} BIOMATTER` | #0f0 (green) |
| Tank destroyed (bomb) | `TANK DESTROYED +{score}` | #ff0 (yellow) |
| Tank destroyed (missile) | `TANK.ELIM +{score}` | #f80 (orange) |
| Heavy tank destroyed | `H.TANK DESTROYED +{score}` | #fa0 |
| Shield hit | `SHIELD HIT -{dmg} HP` | #f44 (red) |
| Drone deployed | `{type} DEPLOYED` | #48f (blue) |
| Drone destroyed | `DRONE LOST` | #f44 (red) |
| Coordinator deployed | `COORD.{H/A} ONLINE` | #0dc/#fa0 |
| Coordinator low energy | `COORD.{H/A} ENERGY LOW` | #fc0 (yellow) |
| Coordinator destroyed | `COORD.{H/A} OFFLINE` | #f44 (red) |
| Bomb used | `ORD.B DEPLOYED` | #f80 |
| Missile salvo fired | `MISSILE SALVO AWAY` | #f40 |
| Tech researched | `RSRCH COMPLETE: {name}` | #0ff (cyan) |
| Quota met | `QUOTA TARGET MET` | #0f0 (bright green, bold) |
| Quota failed | `QUOTA MISSED` | #f00 (red, bold) |
| Wave start | `-- WAVE {n} --` | #fff (white) |
| Energy cell used | `REVIVE CELL CONSUMED` | #f55 |
| Combo milestone | `COMBO x{n}` | #ff0 |
| Powerup collected | `PWRUP: {name}` | powerup color |

### Scroll Behavior

- New events push from the bottom, old events scroll up and fade out
- Each event has an age timer. Alpha = max(0, 1 - (age / 15)). Events older than 15s are fully transparent and removed from the render list
- New events flash briefly: first 300ms at full brightness with shadowBlur=4, then settle to normal
- Maximum buffer: 20 events (oldest pruned on insertion)
- Events are throttled: same event type cannot appear more than once per 500ms (prevents spam during multi-kill scenarios). Exception: BIOMATTER events aggregate: "+5 BIOMATTER" instead of five "+1 BIOMATTER" entries within the throttle window

### Coexistence with Commander Zone

```
Commander zone: y = canvas.height - 110, h = 100
OPS.LOG zone:   y = canvas.height - 220, h = 100

Vertical layout:
  OPS.LOG:    y = 500 to 600    (at 720px canvas)
  Commander:  y = 610 to 710    (at 720px canvas)
  Gap: 10px between them

When commander slides in:
  Commander panel renders OVER ops.log if they overlap
  OPS.LOG does NOT move or hide -- it's simply occluded by commander's panel
  Commander has higher z-order (renders after OPS.LOG in renderHUDFrame)
  Commander background alpha is 0.75 (opaque enough to cover)
```

At 720px canvas height:
- OPS.LOG at y=500, h=100
- Commander at y=610, h=100
- No overlap. Both visible simultaneously.

At smaller canvas heights (e.g., 600px):
- OPS.LOG at y=380
- Commander at y=490
- Still no overlap.

### Unlock Condition and Boot

- **Appears after Wave 1 completes** (same gate as commander dialogue system)
- Has its own boot sequence entry in `hudBootState.panels`
- Boot diagnostic text:
  ```
  OPS.LOG INIT.....................
  EVENT.BUFFER ALLOC  [########] OK
  LOG.STREAM ACTIVE
  ```
- Boot timing: t=2.0s (same as Fleet panel, or staggered +0.2s after fleet)
- Slides in from left edge (same as weapons panel animation)

### Slide Animation

```
hudAnimState.opsLogPanelVisible = false  // set true when wave >= 2
hudAnimState.opsLogPanelSlide = 0        // 0..1

Slide: same easeOutCubic as weapons panel
  slideOffset = (1 - easeOutCubic(slide)) * -panelWidth
  ctx.translate(slideOffset, 0)
```

### Performance

- Max 20 text entries, each a single `fillText` call
- Total: ~20 fillText + 1 panel + 2 blink lights
- Cost: <0.2ms/frame. Negligible.

---

## 6. COMMANDER HUD VISIBILITY FIX

### Bug Description

The commander HUD panel (`renderCommanderZone`) should not be visible before wave 1 gameplay begins. Currently, the visibility check at line 12734 is:

```js
if (missionCommanderState.visible && (wave >= 2 || tutorialState))
```

This means during wave 1, if `tutorialState` is truthy and `missionCommanderState.visible` is set during the tutorial sequence, the commander panel appears. However, the panel should be **hidden during the boot sequence** and should not render until the boot sequence is complete and the tutorial/game has started playing.

### Required Fix

The commander panel visibility logic in `renderHUDFrame` needs an additional guard:

```
Commander panel should NOT render when:
  1. hudBootState.phase === 'booting' AND the commander boot panel hasn't reached 'online'
  2. gameState !== 'PLAYING' (pre-game states)

Commander panel SHOULD render when:
  1. missionCommanderState.visible === true
  2. AND (wave >= 2 OR tutorialState is active with dialogue queued)
  3. AND the boot sequence for commander is complete (or not active)
  4. AND gameState === 'PLAYING'
```

### Additional Consideration

The `missionCommanderState.visible` flag should be explicitly set to `false` during `initHUDBoot()` to ensure the commander doesn't carry over visibility from a previous game session or wave transition. Currently `startGame()` resets `missionCommanderState.visible = false` (line 12875), which is correct, but the boot sequence should also enforce this.

---

## APPENDIX A: Complete Panel Map at 1280x720

```
+--[SYS.STATUS]--+--[tech chips gap]--+--[MISSION.CTL]--+-----------+--[SYS.INTG]--+
| Score  HI:     | [PG1][PG2][DC1]    | Quota Bar       |           | SHLD ███  OK |
| WAVE 3  1:45   | [DC2][DN1]         | Harvest 12/15   |           | REVIVE [*][*]|
| 3x (1.5x)     |                    | RSRCH: 45s      |           | SPD +20%     |
| B.MTR: 42      |                    |                 |           | NRG +50      |
+----------------+                    +-----------------+           +--------------+
|                |                                                  |[NRG.FLOW]    |
+--[ORD.SYS]----+                                                  | OUT/IN graph |
| BOMBS [Z]     |                                                  |  .....__     |
|   [O][O][O]   |                                                  |  .../  \..  |
|   [O][O][O]   |                 PLAY AREA                        +--------------+
|   [O][o][o]   |                                                  |              |
| MISSILES [X]  |               (UFO + targets                     +--[FLEET.CMD]-+
|   A [>>>>]    |                + tanks + beam)                   | COORD.H ██ 12s|
|   B [>>>>]    |                                                  |  H-01 ██ 8s  |
+---------------+                                                  |  H-02 ██ 11s |
| RSRCH: 45s    |                                                  | COORD.A ██ 7s|
+---------------+                                                  |  A-01 ██ 10s |
                                                                   +---------------+
+--[OPS.LOG]----+
| > +3 BIOMATTER|
| > TANK DESTR  |
| > SHIELD -15  |
| > COORD.H LOW |
+---------------+
+--[COMMANDER]--+
| [*] INCOMING  |
| [face] text.. |
+---------------+
y=720 ----------------------------------------------------------
```

---

## APPENDIX B: Color Reference

| Zone | Primary | Secondary | Warning | Critical |
|------|---------|-----------|---------|----------|
| Status | #0ff (cyan) | #445 | #ff0 | #f44 |
| Mission | #0a0 (green) | #0f0 | #ff0 | #f00 |
| Systems | #f80 (orange) | #fc0 | #fc0 | #f33 |
| Weapons | #f44 (red) | #f80 | #f40 | #f00 |
| Fleet | #48f (blue) | #8af | #fc0 | #f44 |
| Commander | #0f0 (green) | #0a0 | -- | -- |
| OPS.LOG | #8af (lavender blue) | #aaf | #fc0 | #f44 |
| Tech Chips | Per-track (see section 2) | -- | -- | -- |

---

## APPENDIX C: Boot Sequence Integration Summary

| New Element | Boot Panel Key | Boot Start Time | Duration | Diagnostic Lines |
|-------------|---------------|-----------------|----------|-----------------|
| Corner indicators | (per parent panel) | With parent | With parent | None (appear during ONLINE phase) |
| Tech chips | `status` (grouped) | t=0.4s | 1.2s | None (individual micro-boot on unlock) |
| Bomb 3x3 grid | `weapons` | t=1.6s | 1.4s | `BOMB.SYS v2.0 [####] OK` `ORD.B: 9 SLOTS LOADED` |
| Energy graph | `systems` | t=1.2s | 1.0s | `NRG.FLOW BUFFER [####] OK` |
| OPS.LOG | `opslog` (NEW) | t=2.2s | 1.0s | `OPS.LOG INIT [####] OK` `EVENT.BUFFER ALLOC [####] OK` |
| Commander fix | `commander` | t=2.4s | 1.0s | (unchanged) |

New boot panel entry needed in `hudBootState.panels`:
```
opslog: { active: false, startTime: 1.1, duration: 1.0, progress: 0, phase: 'waiting' }
```

---

## APPENDIX D: New State Additions

```javascript
// Energy time series data
let energyTimeSeries = {
    output: new Float32Array(300),  // ring buffer, 30s at 10Hz
    intake: new Float32Array(300),
    writeIndex: 0,
    sampleTimer: 0,           // accumulator, samples every 100ms
    currentOutputAccum: 0,    // accumulate output energy this sample
    currentIntakeAccum: 0,    // accumulate intake energy this sample
    yScale: 10,               // current Y-axis max
    yScaleTarget: 10          // smoothed target for Y-axis
};

// OPS.LOG event buffer
let opsLogState = {
    events: [],               // { text, color, age, bold }
    maxEvents: 20,
    throttle: {},             // { eventType: lastTimestamp }
    throttleWindow: 500       // ms
};

// HUD anim additions
hudAnimState.opsLogPanelVisible = false;
hudAnimState.opsLogPanelSlide = 0;

// Tech chip boot animations
let techChipBootAnims = {};   // { techId: { progress: 0..1, startTime } }
```
