# HUD Design Pass 3 - Comprehensive Visual Design Specification

**Date**: 2026-02-13
**Role**: NEXUS -- UI Visual Design Specialist
**Target File**: `/Users/mfelix/code/alien-abductorama/js/game.js` (~21,400+ lines)
**Reference Resolution**: 1280x720 canvas

---

## TABLE OF CONTENTS

1. [F1: Tech Tree Conditional Visibility + Polish](#f1)
2. [F2: Bio-Matter Upload Component Redesign](#f2)
3. [F3: Quantum OS Logo Enhancement](#f3)
4. [F4/F5: Pre-Boot BIOS Sequence](#f4f5)

---

<a name="f1"></a>
## F1: TECH TREE CONDITIONAL VISIBILITY + POLISH

### 1.1 Current State Analysis

**Current code**: `renderTechTree(layout)` at line 15188, `techTreeAnimState` at line 13037, `TRACK_COLORS` at line 14392.

**Current behavior**: Tech tree renders in the gap between SYS.STATUS (ends x=220) and MISSION.CTL (starts x=500). Three rows of 5 nodes each (powerGrid, droneCommand, defenseNetwork). Nodes are 40x18px (standard) or 32x14px (micro mode). Text uses 7px monospace. The tree is always visible as long as `gapW >= 180`.

**Problems identified**:
1. Tech tree is visible in Wave 1 before the player has any tech -- confusing for new players
2. Text labels on 40x18px nodes can overflow. `chipDef.text.substring(4)` placed at `nx + 20` in a 40px node leaves only 20px for text. At 7px monospace, character width is approximately 4.2px, so max ~4.7 characters fit. Names like "CONDUIT" (7 chars) overflow by ~9px
3. Researched nodes look static -- no indicator that the tech is "alive and online"

### 1.2 Conditional Visibility

#### 1.2.1 Gating Rule

The tech tree component is **HIDDEN** when:
- `techTree.researched.size === 0` AND `techTree.activeResearch === null` AND `techTree.queue.length === 0`
- OR `wave === 1` (always hidden in wave 1 regardless of tech state)

The tech tree component **APPEARS** when:
- The player has researched at least one tech (`techTree.researched.size >= 1`)
- OR has tech actively researching (`techTree.activeResearch !== null`)
- AND `wave >= 2`

#### 1.2.2 Appear Animation

When the tech tree first becomes visible (transition from hidden to shown):

```
Duration: 600ms
Easing: easeOutCubic

Phase 1 (0-200ms): Row backgrounds fade in
  - Three track background tints fade from 0 alpha to their target (0.04)
  - Bio-organic particles begin spawning (start with 0 alpha, ramp to normal)

Phase 2 (100-400ms): Nodes materialize left-to-right
  - Each node fades in with 80ms stagger per node
  - Nodes that are researched: border traces clockwise (80ms), then fills
  - Nodes that are unresearched: fade in at dim alpha
  - Node 1 starts at t=100ms, Node 2 at t=180ms, etc.

Phase 3 (200-500ms): Connecting lines draw
  - Lines animate from left-to-right, matching the node appear stagger
  - Each line takes 60ms to draw from left node to right node

Phase 4 (400-600ms): Research display slides in from top
  - If active research exists, the research slot fades in and slides down 8px
  - Easing: easeOutCubic
```

**State variable addition**:
```javascript
techTreeAnimState.visible = false;        // tracks current visibility
techTreeAnimState.appearProgress = 0;     // 0..1, drives appear animation
techTreeAnimState.appearStartTime = 0;    // Date.now() when appear began
```

#### 1.2.3 Implementation Guard

At the top of `renderTechTree(layout)`, add before the existing `gapW < 180` check:

```
Guard logic:
  const shouldShow = (techTree.researched.size > 0 || techTree.activeResearch) && wave >= 2;
  if (!shouldShow && !techTreeAnimState.visible) return;
  if (shouldShow && !techTreeAnimState.visible) {
    techTreeAnimState.visible = true;
    techTreeAnimState.appearStartTime = Date.now();
  }
  const appearProgress = Math.min(1, (Date.now() - techTreeAnimState.appearStartTime) / 600);
```

### 1.3 Text Label Overflow Fix

#### 1.3.1 Current Text Layout Problem

```
Node: 40px wide x 18px tall

Current text rendering (line 15342-15347):
  ID prefix (e.g., "PG1"): bold 7px at (nx + 2, ny + 11), 3 chars
  Name suffix (e.g., "CONDUIT"): 7px at (nx + 20, ny + 11)

Character width at 7px monospace: ~4.2px
  ID "PG1" at nx+2: occupies nx+2 to nx+14.6 (12.6px)
  Suffix at nx+20: starts 20px in, leaving 20px until node edge (nx+40)
  Max suffix chars: 20 / 4.2 = ~4.7 chars

OVERFLOW cases:
  "CONDUIT" (7 chars): 7 * 4.2 = 29.4px -> overflows by 9.4px
  "UPLINK"  (6 chars): 6 * 4.2 = 25.2px -> overflows by 5.2px
  "H.CORD"  (6 chars): 6 * 4.2 = 25.2px -> overflows by 5.2px
  "A.CORD"  (6 chars): same
  "S.GRID"  (6 chars): same
  "S.SHLD"  (6 chars): same
  "SHLD.T"  (6 chars): same
```

#### 1.3.2 Fix: Abbreviated Short Names + Tighter Layout

New abbreviated names for all 15 techs (max 4 chars for suffix):

| Tech ID | Old Suffix | New Suffix | Full Chip Text |
|---------|-----------|------------|----------------|
| pg1 | CONDUIT | COND | PG1 COND |
| pg2 | EFFIC | EFFC | PG2 EFFC |
| pg3 | BCAST | BCST | PG3 BCST |
| pg4 | REACT | REAC | PG4 REAC |
| pg5 | S.GRID | SGRD | PG5 SGRD |
| dc1 | UPLINK | UPLK | DC1 UPLK |
| dc2 | H.CORD | HCRD | DC2 HCRD |
| dc3 | A.CORD | ACRD | DC3 ACRD |
| dc4 | EXPND | EXPD | DC4 EXPD |
| dc5 | SWARM | SWRM | DC5 SWRM |
| dn1 | THRST | THRS | DN1 THRS |
| dn2 | ARMOR | ARMR | DN2 ARMR |
| dn3 | SHLD.T | SHLT | DN3 SHLT |
| dn4 | RESIL | RESI | DN4 RESI |
| dn5 | S.SHLD | SSHD | DN5 SSHD |

With max 4 chars suffix: 4 * 4.2 = 16.8px. Starting at nx+20, ends at nx+36.8. Fits within 40px node with 3.2px right margin.

#### 1.3.3 Alternate Fix: Two-Line Layout

If abbreviating hurts readability, use a two-line layout within the 18px node height:

```
+--------+
|PG1     |  Line 1: ID prefix at (nx+2, ny+7), bold 6px, track color
|CONDUIT |  Line 2: Full name at (nx+2, ny+14), 5px monospace, white
+--------+

Line 1: bold 6px monospace at ny + 7 (6px descent + 1px gap)
Line 2: 5px monospace at ny + 14 (5px descent + 2px gap from line 1)

At 6px monospace: char width ~3.6px
  "PG1": 3 * 3.6 = 10.8px -> fits easily
At 5px monospace: char width ~3.0px
  "CONDUIT": 7 * 3.0 = 21px -> fits within 40px
  "S.GRID": 6 * 3.0 = 18px -> fits
  All names fit at 5px size in 40px width
```

**Recommended approach**: Use abbreviated 4-char suffixes (1.3.2) for the standard 40px nodes. At micro mode (32px), use the two-line layout.

### 1.4 Researched Node Blinking Indicator Lights

#### 1.4.1 Design Concept

Each RESEARCHED tech node gets 2-3 tiny indicator lights clustered near its right edge. These convey that the tech is actively running, "alive and online." The lights use existing `renderNGEBlinkLight` and `renderNGEIndicator` vocabulary at very small scale.

```
RESEARCHED NODE with indicators:
+--------+
| PG1    |  [*][*]    <- 2-3 tiny lights right of node
| COND   |
+--------+

Unresearched node: NO lights
Currently researching: NO lights (pulsing glow serves as indicator)
```

#### 1.4.2 Light Placement

Lights are positioned at the RIGHT EDGE of the node, vertically stacked or horizontally clustered:

```
OPTION A: Vertical stack (right side, inside node border)
+--------+
| PG1  * |   Light 1: (nx + nodeW - 5, ny + 4),  2x2px
| COND * |   Light 2: (nx + nodeW - 5, ny + 10), 2x2px
+-----*--+   Light 3: (nx + nodeW - 5, ny + 16), 2x2px (if 3 lights)

OPTION B: Horizontal cluster (below node, right-aligned)
+--------+
| PG1    |
| COND   |
+--[*][*]+   Lights at (nx + nodeW - 8, ny + nodeH + 1) and (nx + nodeW - 4, ny + nodeH + 1)
```

**Chosen: Option A** -- vertical stack inside the node's right margin. This keeps the lights contained within the node's bounding box and doesn't require extra vertical space.

#### 1.4.3 Light Specifications

Each researched node gets exactly **2 lights** (3 would be too crowded in the 18px height):

```
Light 1:
  Position: (nx + nodeW - 5, ny + 5)
  Size: 2x2px
  Color: track color (TRACK_COLORS[track])
  Shape: square (via fillRect)
  Blink rate: 600 + (nodeIndex * 200)ms
    PG1: 600ms, PG2: 800ms, PG3: 1000ms, PG4: 1200ms, PG5: 1400ms
    (Creates staggered blinking across the track)
  Glow: shadowBlur = 2, shadowColor = track color
  Off state: rgba(255, 255, 255, 0.06)

Light 2:
  Position: (nx + nodeW - 5, ny + 11)
  Size: 2x2px
  Color: track color
  Shape: square
  Blink rate: same as Light 1, but phase offset +300ms
    (Creates alternating double-blink pattern)
  Glow: shadowBlur = 2
  Off state: rgba(255, 255, 255, 0.06)
```

#### 1.4.4 Light Animation Detail

```
Blink cycle for Light 1 at rate R:
  const isOn = Math.floor((Date.now()) / R) % 2 === 0;

Blink cycle for Light 2 at rate R, offset 300ms:
  const isOn = Math.floor((Date.now() + 300) / R) % 2 === 0;

When ON:
  ctx.fillStyle = trackColor;
  ctx.shadowColor = trackColor;
  ctx.shadowBlur = 2;
  ctx.fillRect(lx, ly, 2, 2);
  ctx.shadowBlur = 0;

When OFF:
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(lx, ly, 2, 2);
```

#### 1.4.5 Per-Track Blink Rates

| Node | Light 1 Rate | Light 2 Rate | Phase Offset |
|------|-------------|-------------|-------------|
| pg1  | 600ms | 600ms | +300ms |
| pg2  | 800ms | 800ms | +300ms |
| pg3  | 1000ms | 1000ms | +300ms |
| pg4  | 1200ms | 1200ms | +300ms |
| pg5  | 1400ms | 1400ms | +300ms |
| dc1  | 600ms | 600ms | +300ms |
| dc2  | 800ms | 800ms | +300ms |
| dc3  | 1000ms | 1000ms | +300ms |
| dc4  | 1200ms | 1200ms | +300ms |
| dc5  | 1400ms | 1400ms | +300ms |
| dn1  | 600ms | 600ms | +300ms |
| dn2  | 800ms | 800ms | +300ms |
| dn3  | 1000ms | 1000ms | +300ms |
| dn4  | 1200ms | 1200ms | +300ms |
| dn5  | 1400ms | 1400ms | +300ms |

The stagger across tiers creates a "cascade" visual effect where tier 1 nodes blink fastest and tier 5 nodes blink slowest. Across a fully researched track, this reads as a wave of activity propagating through the tech chain.

#### 1.4.6 ASCII Art: Researched Track with Lights

```
PG track, 3 techs researched:

[PG1 *]--[PG2 *]--[PG3  ]--[PG4  ]--[PG5  ]
[COND*]  [EFFC*]  [BCST ]  [REAC ]  [SGRD ]

*  = blinking indicator (2x2px, track color)
-- = solid connection line (researched)
   The [PG3] node has pulsing glow (currently researching)
   [PG4] and [PG5] are dim (unresearched)
```

#### 1.4.7 Color Reference

| Element | Color | Alpha | Notes |
|---------|-------|-------|-------|
| Light ON (PG) | #ff0 | 1.0 | With shadowBlur=2 glow |
| Light ON (DC) | #48f | 1.0 | With shadowBlur=2 glow |
| Light ON (DN) | #f80 | 1.0 | With shadowBlur=2 glow |
| Light OFF | #fff | 0.06 | Ghost outline, no glow |

#### 1.4.8 Performance Impact

- Max 15 nodes * 2 lights = 30 fillRect calls (2x2px each)
- 15 shadowBlur toggles per frame (only on visible lights)
- Total cost: < 0.1ms/frame. Negligible.

---

<a name="f2"></a>
## F2: BIO-MATTER UPLOAD COMPONENT REDESIGN

### 2.1 Current State Analysis

**Current code**: Bio-matter rendering in `renderMissionZone()` at line 13947-14006, `bioUploadState` at line 13026.

**Current behavior**:
- Position: Inside mission zone at `y + 82`, below harvest counter
- Shows "B.MTR:" label (bold 9px #0a0) + value (bold 14px #0f0)
- Small upload conduit: scrolling binary stream in a 12px tall box
- Bit rate display below conduit ("X b/s" or "IDLE")
- Collection flash: green pulse on biomatter pickup
- Total vertical space used: ~28px within the mission zone

**Problems**:
1. Component is cramped (only 12px conduit height)
2. No individual upload visualization per biomatter unit
3. Flash effect is subtle -- not "violent alien upload conduit" feeling
4. Buried inside the mission zone with limited room to grow

### 2.2 New Position: Right Gap Between MISSION.CTL and SYS.INTG

#### 2.2.1 Layout Geometry

```
At 1280px canvas:
  MISSION.CTL ends at: x = 500 + 280 = 780
  SYS.INTG starts at:  x = 1280 - 195 - 10 = 1075

  RIGHT GAP: x = 784 to x = 1071 (287px available)

  Bio-Matter component position:
    x = 784
    y = 4 (aligned with top of MISSION.CTL)
    w = 287
    h = 110 (full height matching MISSION.CTL and SYS.INTG top zones)
```

The component occupies the entire gap between MISSION.CTL and SYS.INTG at the top of the screen. This gives it 287x110px -- substantially more room than the previous 160x28px.

```
+--[MISSION.CTL]--+--[BIO-MATTER UPLOAD]--+--[SYS.INTG]--+
| Quota ████░░░░  |  BIO-MATTER    042    | SHLD ███  OK  |
| [icons][icons]  | +-UPLOAD STREAM-----+ | REVIVE [*][*] |
|                 | | >> 01101 XFER 100%| |               |
|                 | | >> 10110 XFER  87%| |               |
|                 | | >> 11001 XFER  43%| |               |
|                 | | >> 00111 XFER  12%| |               |
|                 | +-------------------+ |               |
+-----------------| [rate] [indicators]   +---------------+
                  +------------------------+
x=500             x=784                    x=1075
```

#### 2.2.2 Remove From Mission Zone

Delete the B.MTR rendering from `renderMissionZone()` (current lines 13947-14006). The mission zone reclaims this vertical space for better indicator spacing.

### 2.3 Component Panel Design

#### 2.3.1 Panel Frame

```
Position: (rightGapX, 4)
  rightGapX = layout.missionZone.x + layout.missionZone.w + 4
  rightGapEndX = layout.systemsZone.x - 4
  panelW = rightGapEndX - rightGapX
  panelH = 110

Panel rendering:
  renderNGEPanel(rightGapX, 4, panelW, panelH, {
    color: '#0f0',
    cutCorners: [],
    alpha: 0.55,
    label: 'BIO-MATTER'
  });

Label: 'BIO-MATTER' in bold 11px monospace, #0f0
  Position: (x + 6, y + 12)
```

#### 2.3.2 Header Area (Top 22px)

```
+--[BIO-MATTER]--[042]--[*][*]--+
|                                |
y=4 to y=26

Header layout:
  Label: "BIO-MATTER" at (x+6, y+12), bold 11px, #0f0
  Value: bioMatter count at (x+6+110, y+12), bold 14px, #0ff (cyan)
    Glow: shadowBlur=4, shadowColor=#0ff when count > 0
    When zero: #0f0 at 40% alpha, no glow
  Blink light 1: (x+panelW-18, y+6), square 4x4, #0f0, 500ms
  Blink light 2: (x+panelW-10, y+6), square 4x4, #0f0, 500ms, +250ms offset
```

#### 2.3.3 Upload Stream Area (y+24 to y+104)

The main body of the component. 80px tall, full panel width minus 8px padding each side.

```
Stream area:
  x: panelX + 4
  y: panelY + 24
  w: panelW - 8
  h: 80
  Background: rgba(0, 20, 0, 0.25)
  Border: 0.5px rgba(0, 170, 68, 0.4)
```

### 2.4 Individual Upload Row Design

When biomatter units arrive, each unit gets its own upload row. Rows stack from the TOP and push older rows down. Each row represents one biomatter unit being "uploaded."

#### 2.4.1 Row Dimensions

```
Row height: 14px
Row width: stream area width (panelW - 8)
Vertical spacing: 2px between rows
Maximum visible rows: floor(80 / 16) = 5 rows

Overflow: if more than 5 rows exist, only the top 5 are visible.
Rows below the visible area are still tracked but not rendered.
```

#### 2.4.2 Row Content Layout

Each upload row shows:

```
+--[>>]--[BINARY]--[PROGRESS BAR]--[PCT]--+
| >> 01101001  [████████░░░░░░]    87%     |
+------------------------------------------+

Layout within row (left to right):
  Chevron: ">>" at (rowX + 2, rowY + 10), bold 7px, #0f0
    Animated: scrolling left via renderNGEChevrons style
    Width: 14px

  Binary stream: at (rowX + 18, rowY + 10), 7px monospace
    8 binary digits, scrolling rapidly rightward
    Scroll speed: 120px/s (4x faster than the old conduit)
    Color: #0f0 at varying alpha (0.3-0.8, cycling)
    Width: 48px (8 chars * 6px)

  Progress bar: at (rowX + 70, rowY + 3), width = rowW - 104, height = 8px
    Segmented bar using renderNGEBar style (8 segments)
    Color: #0f0 (green) -> #0ff (cyan) at >90% progress
    Glow: shadowBlur = 2 when progress > 80%
    Width: ~170px at 1280

  Percentage: at (rowX + rowW - 32, rowY + 10), bold 7px, #0f0
    Shows "100%", "87%", "43%", etc.
    Width: 30px right-aligned

  Completion marker: when at 100%, the "%" text changes to "XFER" in #0ff
```

#### 2.4.3 Upload Progress Timing

```
Each upload row takes 1.5 seconds to complete (progress 0% to 100%):
  progress = min(1.0, rowAge / 1.5)

Progress phases:
  0-30%: Fast start (easeOutCubic for the first 30%)
  30-90%: Linear fill
  90-100%: Brief acceleration (simulating final data burst)

Implementation:
  function uploadProgress(t) {
    // t is 0..1 normalized time (rowAge / 1.5)
    if (t < 0.3) return easeOutCubic(t / 0.3) * 0.3;
    if (t < 0.9) return 0.3 + (t - 0.3) / 0.6 * 0.6;
    return 0.9 + easeOutCubic((t - 0.9) / 0.1) * 0.1;
  }
```

#### 2.4.4 Row Spawn Behavior

When biomatter is collected:
- If 1 unit: 1 row spawns at the top (y offset = 0)
- If 4 units arrive simultaneously: 4 rows spawn with 50ms stagger
  - Row 1 appears at t=0
  - Row 2 appears at t=50ms
  - Row 3 appears at t=100ms
  - Row 4 appears at t=150ms
- New rows push existing rows down by (14 + 2) = 16px each

```
State tracking:
bioUploadRows: [
  { spawnTime: timestamp, progress: 0..1, phase: 'uploading'|'flash'|'done' },
  ...
]
Max tracked rows: 20 (prune oldest completed rows)
```

#### 2.4.5 Completion Flash Effect

When a row reaches 100% progress, it enters the **FLASH** phase:

```
Flash duration: 200ms
Flash behavior: EXTREMELY rapid foreground/background contrast cycling

Cycle rate: 25ms per toggle (40Hz) -- super fast strobe
Toggle pattern:
  Frame A: Row background = #0f0 (bright green), text = #000 (black)
  Frame B: Row background = #000 (black), text = #0f0 (bright green)
  Frame C: Row background = #0ff (cyan), text = #000 (black)
  Frame D: Row background = #000 (black), text = #fff (white)

  Repeats A-B-C-D pattern for 200ms = 8 full cycles

After flash:
  Row shrinks vertically: height goes 14px -> 0px over 100ms (easeInCubic)
  Rows below slide up to fill the gap
  Row is removed from the render list
```

```
Flash implementation:
  const flashAge = Date.now() - row.flashStartTime;
  const flashPhase = Math.floor(flashAge / 25) % 4;
  switch (flashPhase) {
    case 0: bg = '#0f0'; fg = '#000'; break;
    case 1: bg = '#000'; fg = '#0f0'; break;
    case 2: bg = '#0ff'; fg = '#000'; break;
    case 3: bg = '#000'; fg = '#fff'; break;
  }
  ctx.fillStyle = bg;
  ctx.fillRect(rowX, rowY, rowW, 14);
  ctx.fillStyle = fg;
  ctx.font = 'bold 7px monospace';
  ctx.fillText('UPLOAD COMPLETE', rowX + 4, rowY + 10);
```

### 2.5 Idle State Design

When no uploads are active (no rows in the stream area):

```
IDLE STATE:
+--[BIO-MATTER]--[042]--[*][*]--+
|                                |
| +-STREAM AREA-----------------+|
| |                              ||
| |    [faint binary noise]      ||
| |    drifting 0s and 1s        ||
| |    very dim, slow scroll     ||
| |                              ||
| |     AWAITING UPLOAD          ||
| |     (7px, #0a0, 0.3 alpha)  ||
| +------------------------------+|
| IDLE           0 b/s            |
+---------------------------------+

Idle elements:
  1. Background binary noise: random 0s and 1s at 6px monospace
     Color: rgba(0, 255, 0, 0.06)
     Scrolling slowly rightward at 15px/s
     Character density: one char per 12px horizontal spacing
     Vertical: random positions within stream area

  2. "AWAITING UPLOAD" text: centered in stream area
     Font: 7px monospace
     Color: rgba(0, 170, 68, 0.3)
     Blinks at 2000ms rate (very slow)

  3. Footer: "IDLE" at (x+6, y+panelH-6), 7px monospace, #0a0 at 40% alpha
     "0 b/s" right-aligned at same Y
```

### 2.6 Active State Design

When at least one upload row is active:

```
ACTIVE STATE:
+--[BIO-MATTER]--[042]--[*][*]--+
|                                |
| +-STREAM AREA-----------------+|
| | >> 01101  [█████████░]  92% ||
| | >> 10110  [███████░░░]  71% ||
| | >> 00111  [████░░░░░░]  43% ||
| | >> 11010  [██░░░░░░░░]  18% ||
| |                              ||
| +------------------------------+|
| ACTIVE  RATE: 47.2 b/s  [*]    |
+---------------------------------+

Active elements:
  1. Upload rows as described in 2.4

  2. Stream area border intensifies:
     Normal: 0.5px rgba(0, 170, 68, 0.4)
     Active: 1px rgba(0, 255, 0, 0.6)

  3. Footer updates:
     "ACTIVE" in #0f0 bold 7px at (x+6, y+panelH-6)
     "RATE: {rate} b/s" right-aligned, #0f0 7px
     Blink light at footer right edge: #0f0, 200ms (fast blink during upload)

  4. Panel border glow intensifies:
     shadowBlur: 0 (idle) -> 3 (active)
     shadowColor: #0f0

  5. Bio-organic particles in stream area background:
     Same particle system as tech tree rows but green-tinted
     8-12 particles, #0f0 at 0.08-0.15 alpha
     Drift rightward at 0.3-0.6 px/frame
```

### 2.7 Full Active Component Mockup (ASCII Art)

```
x=784                              x=1071
+--[BIO-MATTER]------[042]---[*][*]-+
|                                    |
| +--UPLOAD STREAM------------------+|
| | >> 01101001  [████████░░]  87%  ||
| | >> 10110011  [██████░░░░]  62%  ||
| | >> 11001010  [███░░░░░░░]  31%  ||
| | >> 00111100  [█░░░░░░░░░]  08%  ||
| |        .  *   .   *             ||
| +----------------------------------+
| ACTIVE    RATE: 34.8 b/s     [*]  |
+------------------------------------+

Legend:
  [*] = blinking indicator light
  >> = animated chevrons (scrolling right)
  01101001 = scrolling binary data
  [████░░] = segmented progress bar
  .  * = bio-organic background particles
```

### 2.8 Color Reference

| Element | Color | Alpha | Notes |
|---------|-------|-------|-------|
| Panel border | #0f0 | 0.7 | renderNGEPanel color |
| Panel background | #050812 | 0.55 | Standard NGE panel bg |
| Header label | #0f0 | 1.0 | Bold 11px "BIO-MATTER" |
| Counter value (>0) | #0ff | 1.0 | Bright cyan with glow |
| Counter value (0) | #0f0 | 0.4 | Dim green, no glow |
| Row chevrons | #0f0 | 0.7 | Bold 7px ">>" |
| Row binary digits | #0f0 | 0.3-0.8 | Cycling alpha |
| Row progress bar | #0f0 | 0.8 | renderNGEBar style |
| Row progress bar >90% | #0ff | 0.9 | Cyan shift near completion |
| Row percentage text | #0f0 | 0.9 | Bold 7px |
| Flash bg A | #0f0 | 1.0 | Bright green flash |
| Flash bg B | #000 | 1.0 | Black flash |
| Flash bg C | #0ff | 1.0 | Cyan flash |
| Flash fg | varies | 1.0 | Contrasts with bg |
| Idle text | #0a0 | 0.3 | "AWAITING UPLOAD" |
| Idle noise | #0f0 | 0.06 | Background binary drift |
| Active footer | #0f0 | 1.0 | "ACTIVE" + rate |
| Particles | #0f0 | 0.08-0.15 | Bio-organic dots |
| Stream border idle | #0a4 | 0.4 | 0.5px |
| Stream border active | #0f0 | 0.6 | 1px |

### 2.9 Animation Timing

| Animation | Duration | Rate | Notes |
|-----------|----------|------|-------|
| Upload row progress | 1500ms | Continuous | Per-row timer |
| Row spawn stagger | 50ms | Per unit in batch | Sequential spawn |
| Completion flash | 200ms | 25ms/toggle (40Hz) | 4-state cycle |
| Row collapse | 100ms | One-shot | easeInCubic height shrink |
| Binary scroll (active) | Continuous | 120px/s | Fast rightward |
| Binary scroll (idle) | Continuous | 15px/s | Slow rightward |
| Chevron animation | Continuous | Matches renderNGEChevrons | Rightward scroll |
| Idle text blink | 2000ms | Slow pulse | On/off |
| Particle drift | Continuous | 0.3-0.6 px/frame | Rightward |

### 2.10 Small Screen Considerations

```
At canvas widths < 1000px:
  RIGHT GAP shrinks significantly.
  rightGapX = missionEnd + 4 = ~534 (at 960px)
  systemsStart - 4 = ~790
  Available: ~256px

  If gap < 120px: hide bio-matter panel, show inline counter in status zone
  If gap 120-200px: shrink to compact mode:
    - No binary stream in rows, just progress bar + percentage
    - 2 visible rows max
    - Header shortened to "BIO" + count

At canvas widths < 800px:
  Bio-matter panel hidden entirely
  Fall back to simple "B.MTR: 42" text in status zone (original position)
```

---

<a name="f3"></a>
## F3: QUANTUM OS LOGO ENHANCEMENT

### 3.1 Current State Analysis

**Current code**: Logo rendering in `renderHUDBootGlobalEffects()` at line 16254-16310.

**Current behavior**:
- Black screen with `pb.logoAlpha` global alpha
- Hex grid background: 200x120px, 24px hex spacing, `rgba(0,255,255,0.04)`
- Main title: "ALIEN QUANTUM OS", bold 24px, #0ff, centered, shadowBlur=8
- Version: "v7.3.1 // QUANTUM ENTANGLEMENT CORE", 9px, `rgba(0,255,255,0.6)`
- Initializing text: "[ INITIALIZING... ]" with cycling dots, 9px, `rgba(0,255,255,0.4)`
- 3 orbiting dots: radius 90px horizontal / 50px vertical, 3s orbit period, 1.5px radius, #0ff with shadowBlur=4

**Current size**: Roughly 320x180px effective area (text + orbiting dots + hex grid)

### 3.2 Enhanced Logo Design

#### 3.2.1 Expanded Size

```
Old effective area: 320x180px
New effective area: 440x260px

Centered on canvas:
  areaX = (canvas.width - 440) / 2 = 420  (at 1280)
  areaY = (canvas.height - 260) / 2 = 230 (at 720)
```

#### 3.2.2 Larger Title Text

```
Old: bold 24px monospace, #0ff
New: bold 32px monospace, #0ff

  "ALIEN QUANTUM OS" at 32px:
    Width: ~17 chars * 19.2px = ~326px (fits in 440px area)
    Position: centered, y = canvas.height/2 - 30

  Glow enhancement:
    shadowColor = '#0ff'
    shadowBlur = 12 (up from 8)

    DOUBLE SHADOW technique:
      First pass: shadowBlur = 16, alpha 0.4 (wide soft glow)
      Second pass: shadowBlur = 6, alpha 1.0 (tight bright glow)
      This creates a bloom effect around the text

  Color modulation:
    Base color: #0ff (cyan)
    Every 3 seconds, hue shifts slightly:
      hueShift = Math.sin(Date.now() / 3000) * 15
      color = hsl(180 + hueShift, 100%, 50%)
      Range: hsl(165) to hsl(195) -- teal to blue-cyan
    Creates subtle "quantum uncertainty" color drift
```

#### 3.2.3 Enhanced Subtitle

```
Line 2 (version): Move down slightly
  Old: 9px at centerY + 10
  New: 10px at centerY + 16
  Color: rgba(0, 255, 255, 0.7) (brighter)

  Add version number pulse:
    "v7.3.1" portion blinks at 1200ms rate
    Rest of text static
```

#### 3.2.4 New Loading Indicator

Below the initializing text, add a horizontal loading bar:

```
Position: centered, y = canvas.height/2 + 48
Width: 200px
Height: 4px (thin, sleek)

Loading bar design:
  Background: rgba(0, 255, 255, 0.08), 200x4px
  Border: 0.5px rgba(0, 255, 255, 0.2)

  Fill: animated sweep from left to right
    Not a progress bar (no real progress to track)
    Instead: a bright "pulse" that sweeps left to right repeatedly

  Sweep animation:
    A bright segment (40px wide) moves from x=0 to x=200 over 800ms
    Color: linear gradient:
      left edge: rgba(0,255,255,0)
      center: rgba(0,255,255,0.8)
      right edge: rgba(0,255,255,0)

    The sweep has a bright leading edge and a fading trail (20px)

    Repeats continuously during logo display

  Below the bar: "QUANTUM CORE INITIALIZING" in 7px, rgba(0,255,255,0.35)
    Characters appear one at a time (typewriter), 20ms per character
    After all characters shown, holds for 500ms, then clears and retypes
```

#### 3.2.5 Enhanced Hex Grid

```
Old: 200x120px area, hex size 10, one stroke color
New: 280x180px area, hex size 12, with animation

  Grid center: canvas center
  Extent: -140 to +140 horizontal, -90 to +90 vertical
  Hex spacing: 28px horizontal, 24px vertical (for size 12 hexagons)

  Base color: rgba(0, 255, 255, 0.03) (slightly dimmer)

  Animation: "data pulse" radiating outward from center
    Every 1200ms, a ring of hexagons brightens:
    - Ring expands from center at 80px/s
    - Hexagons within the ring flash to 0.08 alpha, then fade to 0.03 over 400ms
    - Ring width: 30px
    - Creates a radar-pulse feel

  Implementation:
    const pulseRadius = ((Date.now() % 1200) / 1200) * 160;
    for each hex at distance d from center:
      if (abs(d - pulseRadius) < 15):
        alpha = 0.08 * (1 - abs(d - pulseRadius) / 15)
      else:
        alpha = 0.03
```

#### 3.2.6 Enhanced Orbiting Dots

```
Old: 3 dots, radius 90x50, 3s orbit, 1.5px
New: 5 dots, dual orbit rings, varied sizes

Ring 1 (inner): 3 dots
  Radius: 80px horizontal, 45px vertical
  Speed: 3 second orbit (same as current)
  Dot size: 2px
  Color: #0ff, shadowBlur = 5
  120-degree spacing

Ring 2 (outer): 2 dots, opposite rotation
  Radius: 140px horizontal, 70px vertical
  Speed: 5 second orbit (slower)
  Direction: counter-clockwise (opposite to Ring 1)
  Dot size: 1.5px
  Color: rgba(0, 255, 255, 0.6), shadowBlur = 3
  180-degree spacing

  Trail effect for all dots:
    Each dot leaves a 3-frame trail (3 previous positions)
    Trail dot alpha: 0.4, 0.2, 0.1 (fading)
    Trail dot size: same as main dot
    Creates comet-tail effect
```

#### 3.2.7 New Element: Scanning Line

```
A horizontal scanning line sweeps slowly across the logo area:
  Width: 440px (full logo area width)
  Height: 1px
  Color: rgba(0, 255, 255, 0.15)
  Speed: 40px/s downward
  Repeats: wraps from bottom to top of logo area (260px / 40 = 6.5s cycle)
  Glow: shadowBlur = 3, rgba(0, 255, 255, 0.3)

  Implementation:
    const scanY = areaY + ((Date.now() / 1000 * 40) % 260);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.shadowColor = 'rgba(0, 255, 255, 0.3)';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.moveTo(areaX, scanY);
    ctx.lineTo(areaX + 440, scanY);
    ctx.stroke();
```

#### 3.2.8 New Element: Corner Data Readouts

Small text readouts in each corner of the logo area:

```
Top-left:     "SYS.BOOT//INIT" in 6px, rgba(0,255,255,0.2)
Top-right:    "MEM.CHK OK" in 6px, rgba(0,255,255,0.2)
Bottom-left:  "CORE.FREQ 4.7THz" in 6px, rgba(0,255,255,0.2)
Bottom-right: "UPLINK.STATUS: PENDING" in 6px, rgba(0,255,255,0.2)

Each readout blinks independently at 1500-2500ms rate (randomized per corner)
Creates ambient "alien computer system" atmosphere
```

### 3.3 Complete Logo Layout (ASCII Art)

```
                     SYS.BOOT//INIT                MEM.CHK OK
                         .                           .
                    .        .                  .
                 +--hex--hex--hex--hex--hex--+
                 |hex  hex  hex  hex  hex hex|
                 |  hex  hex  hex  hex  hex  |
            o    |    ALIEN  QUANTUM  OS     |    O
                 |  v7.3.1 // QUANTUM CORE   |
              O  |   [ INITIALIZING... ]     |  o
                 |  [====pulse=========----] |
                 |  QUANTUM CORE INITIALIZING|
                 |hex  hex  hex  hex  hex hex|
                 +--hex--hex--hex--hex--hex--+
                         .                .
                    .       .                   .
                 CORE.FREQ 4.7THz    UPLINK.STATUS: PENDING

    o/O = orbiting dots (two rings, opposite rotation)
    hex = faint hexagonal grid with radiating pulse
    [====pulse====] = sweeping loading bar
    ---- = scanning line position
```

### 3.4 Animation Timing Summary

| Animation | Duration/Rate | Notes |
|-----------|--------------|-------|
| Title hue shift | 3000ms sine cycle | Subtle teal-to-blue drift |
| Double glow render | Per-frame | Two-pass shadow technique |
| Version blink | 1200ms | "v7.3.1" portion only |
| Loading bar sweep | 800ms per sweep | Continuous left-to-right |
| Loading label typewriter | 20ms/char | Repeats after 500ms hold |
| Hex grid pulse | 1200ms cycle | Radiating ring from center |
| Inner orbit (3 dots) | 3000ms | Clockwise, 120-degree spacing |
| Outer orbit (2 dots) | 5000ms | Counter-clockwise, 180-degree spacing |
| Dot trails | 3 frames | Fading alpha tail |
| Scanning line | 6500ms cycle | 40px/s downward |
| Corner readout blinks | 1500-2500ms | Independent random per corner |

### 3.5 Dissolution Enhancement

The existing dissolution effect (pixel-by-pixel block removal) is enhanced:

```
Old: 4x4px blocks, random removal over 200ms
New: 2x2px blocks, radial dissolution from center outward

Dissolution pattern:
  Blocks closer to center dissolve first
  Ring-based: blocks at distance 0-40px dissolve at t=0-60ms
  Blocks at distance 40-80px dissolve at t=40-100ms
  Blocks at distance 80-120px dissolve at t=80-150ms
  Blocks at edge dissolve at t=120-200ms

  Each dissolving block:
    Alpha: 1.0 -> 0 over 30ms (fast individual fade)
    Brief white flash: 10ms white overlay before fade
    Creates "pixelating outward" effect like a CRT turning off

Post-dissolution afterglow:
  Full logo area, rgba(0, 255, 255, 0.08), fades over 150ms
  Orbiting dots fade last (100ms after text is gone)
```

---

<a name="f4f5"></a>
## F4/F5: PRE-BOOT BIOS SEQUENCE (THE BIG ONE)

### 4.1 Overview

This feature **REPLACES** the current wave transition screen (`renderWaveTransition()` at line 20373-20437). The current implementation renders a frozen game scene with "WAVE N" in 72px centered text, "Starting in N..." countdown, and tank count info.

The new Pre-Boot BIOS Sequence plays during the `WAVE_TRANSITION` game state, fitting within the existing `CONFIG.WAVE_TRANSITION_DURATION = 3` seconds. After the BIOS sequence completes, it transitions to the existing Quantum OS boot sequence.

### 4.2 Important Constraints

```
Total duration: 3.0 seconds (CONFIG.WAVE_TRANSITION_DURATION)
Must fit EXACTLY in this window. No extension.

The BIOS sequence REPLACES renderWaveTransition().
After the 3s BIOS completes, the game transitions to PLAYING state
and initHUDBoot() fires the existing Quantum OS boot sequence.

So the flow is:
  WAVE_TRANSITION state (3s) -> BIOS sequence plays
  Transition to PLAYING -> initHUDBoot() fires -> Quantum OS boot (existing)
```

### 4.3 Screen Layout Architecture

The BIOS sequence uses a full-screen black background with terminal-style text. The screen progressively splits into "tmux-like panes" as the sequence advances.

```
PHASE 1-2 (0-1.0s): Full screen, single pane
+--------------------------------------------------+
| BIOS POST text scrolling rapidly...              |
|                                                  |
|                                                  |
|                                                  |
+--------------------------------------------------+

PHASE 3 (1.0-1.6s): Horizontal split
+--------------------------------------------------+
| ORCHESTRATOR output (top pane)                   |
|                                                  |
+==================================================+
| SWARM SPAWN (bottom pane)                        |
|                                                  |
+--------------------------------------------------+

PHASE 4-5 (1.6-2.6s): Triple split
+--------------------------------------------------+
| ORCHESTRATOR + UPLINK (top pane)                 |
+========================+========================+
| SYSTEM CHECK           | DATA STREAM            |
| (bottom-left)          | (bottom-right)         |
+========================+========================+

PHASE 6 (2.6-3.0s): Center takeover
+--------------------------------------------------+
|                                                  |
|            COUNTDOWN + LAUNCH                    |
|                                                  |
+--------------------------------------------------+
```

### 4.4 Phase 1: BIOS POST (0.0s - 0.6s)

#### 4.4.1 Visual Design

Full black screen. Text appears in the top-left corner, flying by at extreme speed. Monochrome white/green on black, exactly like a 1990s PC BIOS POST screen.

```
Font: 9px monospace (small, dense text)
Color: #aaa (slightly off-white, like an old CRT)
Highlight color: #fff (full white for important lines)
System color: #0f0 (green for status OK messages)
Error color: #f44 (red, never actually used -- everything passes)
Position: starts at (12, 16), advances downward 12px per line
```

#### 4.4.2 BIOS POST Text Content

Lines appear at ~25ms intervals (24 lines in 600ms). The first few lines are slower (40ms) for dramatic effect, then speed increases.

```
Line timing:
  Lines 1-4: 40ms each (160ms) -- slow dramatic start
  Lines 5-16: 25ms each (300ms) -- rapid scroll
  Lines 17-24: 15ms each (120ms) -- blinding fast finish
  Total: ~580ms

Text content:
  [40ms] "XENOTECH SYSTEMS BIOS v4.2.0"                          #fff bold
  [40ms] "Copyright (C) 2847 Xenotech Galactic Industries"        #888
  [40ms] ""                                                        (blank line)
  [40ms] "QUANTUM PROCESSOR: ZX-9000 @ 4.7 THz ..... DETECTED"   #aaa ... #0f0 "DETECTED"
  [25ms] "NEURAL CORE:      NC-MK7 x16 PARALLEL ... ONLINE"      #aaa ... #0f0 "ONLINE"
  [25ms] "ANTIMATTER CACHE:  2048 PB ............... OK"          #aaa ... #0f0 "OK"
  [25ms] "QUANTUM RAM TEST:  16384 QB .............. PASS"        #aaa ... #0f0 "PASS"
  [25ms] ""
  [25ms] "SCANNING DEVICES:"                                       #fff bold
  [25ms] "  /dev/beam0     TRACTOR BEAM ARRAY ..... READY"        #aaa ... #0f0
  [25ms] "  /dev/shield0   DEFLECTOR GRID ......... READY"        #aaa ... #0f0
  [25ms] "  /dev/nav0      NAVIGATION MATRIX ...... READY"        #aaa ... #0f0
  [25ms] "  /dev/warp0     SUBSPACE DRIVE ......... STANDBY"      #aaa ... #ff0 "STANDBY"
  [25ms] "  /dev/ord0      ORDNANCE SUBSYSTEM ..... READY"        #aaa ... #0f0
  [25ms] "  /dev/fleet0    FLEET CONTROL BUS ...... READY"        #aaa ... #0f0
  [25ms] "  /dev/bio0      BIOMATTER CONDUIT ...... READY"        #aaa ... #0f0
  [15ms] ""
  [15ms] "BIOS POST COMPLETE - ALL DEVICES NOMINAL"               #0f0 bold
  [15ms] ""
  [15ms] "Searching for system root..."                            #aaa
  [15ms] "FOUND: SYSTEM ROOT AI v4.2.0 at /sys/root"              #fff
  [15ms] "Loading SYSTEM ROOT AI..."                               #aaa
  [15ms] "ROOT AI LOADED [################] 100%"                  #0f0
  [15ms] ""
```

#### 4.4.3 ASCII Art Element (Inline with POST)

At the very top of the BIOS screen, before the text begins, briefly flash an ASCII art logo (visible for ~200ms, then scrolls up off-screen as text pushes it):

```
Position: (12, 16) to (12, 88), appears at t=0.0s, scrolls up by t=0.3s

ASCII art (9px monospace, #0f0 at 0.6 alpha):

    ___   __    ____  ____  _  _
   / __) / _\  (  _ \(_  _)/ )( \
  ( (__ /    \  ) __/  )(  ) __ (
   \___)\_/\_/ (__)   (__) \_)(_/
   X E N O T E C H   B I O S

Width: ~42 chars * 5.4px = ~227px (fits easily)
Height: 5 lines * 12px = 60px

This art is rendered first, then as BIOS text lines append below,
the viewport scrolls so the art exits the top. The art is part of
the line buffer, not a fixed overlay.
```

#### 4.4.4 Visual Details

```
Blinking cursor:
  After the last visible line, a block cursor blinks at 400ms
  Character: "█" (U+2588)
  Color: #0f0
  Position: at the end of the most recently typed line

CRT effects during BIOS:
  Scanline overlay: every 3px, rgba(0, 0, 0, 0.15) -- creates CRT line effect
  Subtle green phosphor tint: full screen rgba(0, 40, 0, 0.03)
  Screen curvature: NOT simulated (too expensive for 3s sequence)

Text scrolling:
  As lines exceed the screen height (~50 visible lines at 720px),
  viewport scrolls up. For the 24-line POST, this won't happen at 720px
  (24 * 12px = 288px, fits without scrolling).
  But keep the scroll system for Phase 3-5 which will use smaller panes.
```

### 4.5 Phase 2: System Root AI -> Orchestrator (0.6s - 1.0s)

#### 4.5.1 Transition from POST

At t=0.6s, the BIOS POST text is complete. A brief pause (100ms), then:

```
[blank line]
"=== SYSTEM ROOT AI v4.2.0 ==="                   #0ff bold, centered
"Initializing core subsystems..."                   #aaa
"Spawning AI ORCHESTRATOR v2.1..."                  #aaa
```

Text continues appearing in the same top-left terminal pane, appending below the POST output.

#### 4.5.2 Orchestrator Boot

```
[25ms] "---------------------------------------------"  #444 (dim separator)
[25ms] "ORCHESTRATOR v2.1 ONLINE"                        #0ff bold
[25ms] "  Session: 0x4A7F2B // Wave {waveNumber}"        #888
[25ms] "  Priority: HARVEST + DEFENSE"                    #aaa
[25ms] "  Fleet status: CHECKING..."                      #ff0
[25ms] "  Fleet status: {droneCount} UNITS REGISTERED"    #0f0
[25ms] ""
[25ms] "ORCHESTRATOR: Spawning agent swarms..."           #0ff
```

Where `{waveNumber}` is the actual current wave number and `{droneCount}` is the actual drone count (from game state).

#### 4.5.3 Dynamic Content

The BIOS sequence is NOT static text. It adapts to the current game state:

```
Wave-dependent content:
  - Wave number shown in orchestrator session ID
  - Drone count reflects actual fleet size
  - If player has missiles: "/dev/ord0 MISSILE TUBES .... ARMED" appears in POST
  - If player has coordinators: "COORD.H ONLINE" or "COORD.A ONLINE" appear in fleet check
  - If player has tech researched: "TECH.TREE: {count} NODES ACTIVE" in system check

Health-dependent content:
  - If health < 50%: "SHLD.INTG: WARNING - HULL DAMAGE DETECTED" appears in yellow
  - If health < 25%: same line in red with "[CRITICAL]" suffix
```

### 4.6 Phase 3: Agent Swarm Spawn (1.0s - 1.6s)

#### 4.6.1 Screen Split

At t=1.0s, a horizontal divider line appears:

```
Divider animation (50ms):
  - A bright green line (#0f0, 1px) draws from left to right across the screen
  - Speed: canvas.width / 0.05 = 25600 px/s (instantaneous feel)
  - Position: y = canvas.height * 0.55 (about 396px at 720)
  - Glow: shadowBlur = 4, #0f0

After divider:
  TOP PANE: y=0 to y=396 (orchestrator output continues here)
  BOTTOM PANE: y=398 to y=720 (new swarm spawn area)
  Divider: y=396, 2px tall, #0f0 at 0.4 alpha (persists)
```

#### 4.6.2 Top Pane (Orchestrator continues)

```
Orchestrator output in top pane:
  [25ms] "ORCHESTRATOR: Swarm initialization started"     #0ff
  [25ms] "  Loading tactical profiles..."                   #aaa
  [25ms] "  Syncing fleet neural mesh..."                   #aaa
  [500ms pause] (while swarm loads in bottom pane)
  [25ms] "ORCHESTRATOR: ALL SWARMS ONLINE"                 #0f0 bold
  [25ms] "ORCHESTRATOR: Proceeding to uplink phase"        #0ff
```

#### 4.6.3 Bottom Pane: Swarm Spawn Table

The bottom pane shows a table of AI agent swarms coming online. Each row appears rapidly with a tiny loading bar that fills instantly.

```
Bottom pane layout:
  Header (appears at t=1.05s):
    "AGENT SWARM STATUS" at (12, paneY + 14), bold 9px, #0ff

  Divider line:
    "----------------------------------------" at paneY + 18, #444

  Swarm rows (appear sequentially, 80ms per row):

  Row format:
    SWARM.{NAME}  [{loading bar}]  {STATUS}

  Loading bar: 12 chars wide, fills from [            ] to [============]
    Fill animation: 60ms to fill completely (within the 80ms row window)
    Fill character: "=" (equal sign)
    Empty character: " " (space)
    Color: #0f0 for bar, #0ff for status text

  Rows (appear in this order):
    t=1.10s: "  SWARM.TACTICAL  [============]  ONLINE"    #0f0
    t=1.18s: "  SWARM.HARVEST   [============]  ONLINE"    #0f0
    t=1.26s: "  SWARM.DEFENSE   [============]  ONLINE"    #0f0
    t=1.34s: "  SWARM.RECON     [============]  ONLINE"    #0f0
    t=1.42s: "  SWARM.LOGISTICS [============]  ONLINE"    #0f0
```

**Conditional swarm rows** (based on game state):
```
  If player has coordinators:
    t=1.50s: "  SWARM.COORD     [============]  ONLINE"    #0ff (cyan instead of green)

  If player has missiles:
    t=1.50s: "  SWARM.ORDNANCE  [============]  ONLINE"    #f80 (orange)

  If player has tech tier >= 3:
    t=1.58s: "  SWARM.ADVANCED  [============]  ONLINE"    #ff0 (yellow)
```

After all swarms:
```
    t=1.58s: ""
    t=1.60s: "  ALL SWARMS: ONLINE ({count} ACTIVE)"       #0f0 bold
```

#### 4.6.4 Loading Bar Animation Detail

Each row's loading bar fills over 60ms:

```
const ROW_FILL_DURATION = 60; // ms
const BAR_WIDTH = 12; // characters

At any time t within the row's fill window:
  const fillProgress = Math.min(1, (t - rowStartTime) / ROW_FILL_DURATION);
  const filledChars = Math.floor(fillProgress * BAR_WIDTH);
  const emptyChars = BAR_WIDTH - filledChars;
  const barText = '[' + '='.repeat(filledChars) + ' '.repeat(emptyChars) + ']';

Row text transitions:
  During fill: "SWARM.TACTICAL  [=====       ]  LOADING"  #ff0
  After fill:  "SWARM.TACTICAL  [============]  ONLINE"   #0f0
  The "LOADING" -> "ONLINE" transition happens on the same frame as bar completion
```

### 4.7 Phase 4: Uplink + Data Download (1.6s - 2.0s)

#### 4.7.1 Top Pane Activity

The orchestrator initiates an uplink command:

```
Top pane text (continuing):
  [25ms] ""
  [25ms] "ORCHESTRATOR: Initiating mothership uplink..."   #0ff
  [25ms] "$ uplink --sync --priority=CRITICAL"              #fff bold (command prompt style)
  [25ms] "CONNECTING TO MOTHERSHIP .... "                   #ff0 (with animated dots)
```

The dots animate: "." -> ".." -> "..." -> "...." cycling at 100ms during the connection phase.

```
After 200ms of "connecting":
  [25ms] "UPLINK ESTABLISHED // LATENCY: 0.3ns"           #0f0
  [25ms] "DOWNLOADING WAVE {n} TACTICAL DATA..."           #aaa
```

#### 4.7.2 Data Download Visualization

The bottom pane switches to a data download display:

```
Bottom pane clears (brief black flash, 50ms)
Then shows download progress:

+--[BOTTOM PANE]---------------------------------------+
|                                                       |
|  UPLINK DATA TRANSFER                       #0ff     |
|  ============================================        |
|                                                       |
|  [████████████████████████████████░░░░░░] 78%        |
|                                                       |
|  SPEED: 23.7 TB/s    RECV: 37.1 / 47.3 TB           |
|                                                       |
|  4A7F 2B3C 891D E4F0 AA12 BC34 DE56 F789 ... (hex)  |
|  3301 7B2A 44C8 9F12 0D3E 5A67 8B4C 2E10 ...        |
|                                                       |
+------------------------------------------------------+
```

#### 4.7.3 Download Bar Design

```
Progress bar:
  Position: centered in bottom pane, y = paneY + 52
  Width: panelW - 40
  Height: 12px
  Background: rgba(0, 255, 0, 0.1)
  Border: 1px rgba(0, 255, 0, 0.4)

  Fill: left-to-right, color #0f0
  Fill animation: 0% to 100% over 400ms (1.6s to 2.0s)
  Fill style: segmented (30 segments, 2px gap between)
    Each segment lights up sequentially
    Active segment has glow: shadowBlur = 3
    Creates "loading bar with individual cells" look

Percentage text:
  Right of bar, bold 11px monospace, #0f0
  Updates rapidly: "0%" to "100%" synced with fill

Speed counter:
  Below bar, left-aligned
  "SPEED: XX.X TB/s" in 9px monospace, #0ff
  Number fluctuates randomly: 18.0-28.0 TB/s range, updates every 50ms
  Creates "insanely fast transfer" impression

Received counter:
  Below bar, right of speed
  "RECV: XX.X / 47.3 TB" in 9px monospace, #aaa
  XX.X counts up from 0 to 47.3 over the 400ms window

Hex data stream:
  Below counters, 2 rows of scrolling hex values
  Font: 7px monospace
  Color: rgba(0, 255, 0, 0.3)
  Characters: random hex digits, scrolling rightward at 200px/s
  Updates every 30ms (new random characters generated)
  Creates "raw data flying by" effect
```

#### 4.7.4 Completion

At t=2.0s:

```
Bar reaches 100%
Brief flash: entire bottom pane background flashes rgba(0, 255, 0, 0.1) for 80ms

Top pane:
  [immediate] "UPLINK COMPLETE - 47.3 TB SYNCED"           #0f0 bold
  [25ms]      "ORCHESTRATOR: Data integrated. Running checks..."  #0ff
```

### 4.8 Phase 5: System Check + Launch Prep (2.0s - 2.6s)

#### 4.8.1 Vertical Split of Bottom Pane

At t=2.0s, the bottom pane splits vertically:

```
Vertical divider animation (40ms):
  A bright green line draws from top to bottom of the bottom pane
  Position: x = canvas.width * 0.55 (about 704px at 1280)
  Color: #0f0, 1px, shadowBlur = 3

After split:
  BOTTOM-LEFT: x=0 to x=702, y=398 to y=720 (system check)
  BOTTOM-RIGHT: x=706 to x=1280, y=398 to y=720 (data stream)
```

#### 4.8.2 System Check (Bottom-Left Pane)

A rapid system check runs through all HUD subsystems:

```
Header: "SYSTEM CHECK" at (12, paneY + 14), bold 9px, #0ff

Check lines appear sequentially, 50ms per line:
  Each line has dots that fill rightward before the [OK] appears

  Line format:
    {SYSTEM_NAME} {dots filling} [{STATUS}]

  Dot fill animation:
    Dots appear from left to right, 3 dots per 10ms
    Total dots per line: varies (fills to column 36)
    After dots complete: [OK] appears in green

  Lines:
    t=2.05s: "  ORD.SYS ............ [OK]"       #aaa ... #0f0
    t=2.10s: "  NRG.FLOW ........... [OK]"       #aaa ... #0f0
    t=2.15s: "  FLEET.CMD .......... [OK]"       #aaa ... #0f0
    t=2.20s: "  SHLD.INTG .......... [OK]"       #aaa ... #0f0
    t=2.25s: "  DIAG.SYS ........... [OK]"       #aaa ... #0f0
    t=2.30s: "  BEAM.ARRAY ......... [OK]"       #aaa ... #0f0
    t=2.35s: "  COMMS.SYS .......... [OK]"       #aaa ... #0f0
    t=2.40s: "  OPS.LOG ............ [OK]"       #aaa ... #0f0
    t=2.45s: "  TECH.TREE .......... [OK]"       #aaa ... #0f0
    t=2.50s: "  BIO.CONDUIT ........ [OK]"       #aaa ... #0f0

  After all checks:
    t=2.55s: ""
    t=2.57s: "  ALL SYSTEMS NOMINAL"              #0f0 bold

Conditional variations:
  If health < 50%:
    "  SHLD.INTG .......... [WARN]"   #ff0 instead of [OK]
  If health < 25%:
    "  SHLD.INTG .......... [CRIT]"   #f44 instead of [OK]
  If no missiles:
    "  ORD.SYS ............ [PARTIAL]" #ff0
```

#### 4.8.3 Dot Fill Animation Detail

```
Each check line's dots fill from left to right over 35ms:
  const lineText = "  ORD.SYS ";
  const maxDots = 36 - lineText.length; // fills to column 36
  const dotsProgress = Math.min(1, (t - lineStartTime) / 35);
  const visibleDots = Math.floor(dotsProgress * maxDots);
  const dots = '.'.repeat(visibleDots);

  // Render partial line: name + dots (growing) + status (appears at end)
  At dotsProgress = 1.0:
    Append " [OK]" in green
    Brief flash on the [OK] text: alpha 1.0 for 20ms, then settles to 0.8

This creates a rapid-fire "testing..." visual where dots race across
the line before the status appears. Feels like a real system diagnostic.
```

#### 4.8.4 Data Stream (Bottom-Right Pane)

The right pane shows a continuous stream of raw data -- pure visual flair:

```
Content: Scrolling hex dump, similar to `hexdump` or `xxd` output

Format (9px monospace, #0f0 at 0.2 alpha):
  0x0000  4A 7F 2B 3C 89 1D E4 F0  |J.+<....|
  0x0010  AA 12 BC 34 DE 56 F7 89  |...4.V..|
  0x0020  33 01 7B 2A 44 C8 9F 12  |3.{*D...|
  ...

Scrolling: upward at 300px/s (very fast, data racing by)
Characters: randomly generated each frame
Line height: 11px
Visible lines: ~28 (322px / 11px)

Color: rgba(0, 255, 0, 0.15) for hex values
       rgba(0, 255, 0, 0.08) for ASCII representation
       rgba(0, 170, 68, 0.3) for address column

This pane is purely decorative. It creates the impression of
massive amounts of alien data being processed.
```

### 4.9 Phase 6: Countdown + Launch (2.6s - 3.0s)

#### 4.9.1 Orchestrator Countdown Command

Top pane:

```
  t=2.60s: ""
  t=2.62s: "ORCHESTRATOR: All checks passed."               #0ff
  t=2.64s: "$ countdown.sys --mode=LAUNCH"                   #fff bold
  t=2.66s: "INITIATING LAUNCH SEQUENCE..."                   #ff0
```

#### 4.9.2 Center Panel Reveal

At t=2.65s, a new panel fades in at the center of the screen, overlaying the pane splits:

```
Center panel:
  Position: centered
  Width: 320px
  Height: 140px
  Background: rgba(0, 0, 0, 0.9) with 2px #0ff border
  Glow: shadowBlur = 8, #0ff

  Content:
    "WAVE {n}" in bold 48px monospace, #0ff, centered, y = centerY - 20
    Countdown below in bold 32px monospace, #fff, centered, y = centerY + 30
```

#### 4.9.3 Countdown Sequence

```
Countdown: 3 numbers in 0.35s (not actual seconds, just dramatic beats)

  t=2.65s: "3" appears, bold 32px, #fff
    Brief screen flash: full canvas rgba(255, 255, 255, 0.03) for 30ms
    Sound: low tone (220 Hz, 60ms, gain 0.03)

  t=2.77s: "2" replaces "3"
    Brief screen flash: rgba(255, 255, 255, 0.05) for 30ms
    Sound: mid tone (330 Hz, 60ms, gain 0.04)

  t=2.88s: "1" replaces "2"
    Brief screen flash: rgba(255, 255, 255, 0.08) for 30ms
    Sound: high tone (440 Hz, 60ms, gain 0.05)

  t=2.92s: "LAUNCH" replaces countdown, bold 48px, #0ff
    INTENSE FLASH SEQUENCE BEGINS
```

#### 4.9.4 Launch Flash Sequence (2.92s - 3.0s)

The final 80ms is an EXTREMELY rapid strobe sequence, Evangelion activation style:

```
Duration: 80ms (4 cycles at 20ms each)
Purpose: Create an intense, visceral "system power-on" moment

Strobe cycle (20ms per frame):
  Frame 1 (0ms):   Full screen #ff0 (yellow) at alpha 0.25
  Frame 2 (20ms):  Full screen #0ff (cyan) at alpha 0.30
  Frame 3 (40ms):  Full screen #f0f (magenta) at alpha 0.20
  Frame 4 (60ms):  Full screen #fff (white) at alpha 0.40

  Each frame:
    ctx.fillStyle = color at specified alpha
    ctx.fillRect(0, 0, canvas.width, canvas.height)

After strobe (t=3.0s):
  Brief white flash: alpha 0.6, fades over 100ms
  This white flash bridges into the Quantum OS boot sequence
  (which starts with its own CRT turn-on effect)

  The BIOS sequence state is cleared
  waveTransitionTimer reaches 0
  Game state transitions to PLAYING
  initHUDBoot() fires -> existing boot sequence takes over
```

### 4.10 Complete Timeline Summary

```
t=0.000s  Black screen. BIOS ASCII art appears.
t=0.000s  BIOS POST text begins scrolling (fast).
          "XENOTECH SYSTEMS BIOS v4.2.0"
          Device scanning, memory test...
t=0.580s  "ROOT AI LOADED [####] 100%"
t=0.600s  Root AI spawns Orchestrator.
          "ORCHESTRATOR v2.1 ONLINE"
t=0.800s  Orchestrator reports fleet status (dynamic).
t=1.000s  HORIZONTAL SPLIT -- bottom pane appears.
          "Spawning agent swarms..."
t=1.100s  Swarm rows appear rapidly (80ms each):
          TACTICAL, HARVEST, DEFENSE, RECON, LOGISTICS...
t=1.580s  "ALL SWARMS ONLINE"
t=1.600s  Uplink command fired.
          "$ uplink --sync --priority=CRITICAL"
t=1.650s  Download bar begins filling.
          Speed: 23.7 TB/s, hex data streaming.
t=2.000s  "UPLINK COMPLETE - 47.3 TB SYNCED"
          VERTICAL SPLIT of bottom pane.
t=2.050s  System check begins (left pane):
          ORD.SYS ...... [OK]
          NRG.FLOW ..... [OK]
          (50ms per line, dots fill rapidly)
t=2.050s  Hex dump streams in right pane (decorative).
t=2.550s  "ALL SYSTEMS NOMINAL"
t=2.620s  "$ countdown.sys --mode=LAUNCH"
t=2.650s  Center panel with "WAVE {n}" and countdown.
          3... 2... 1...
t=2.920s  "LAUNCH" -- INTENSE STROBE FLASH
t=3.000s  White flash. Sequence ends.
          -> Game transitions to PLAYING + Quantum OS boot
```

### 4.11 State Management

```javascript
// New state for BIOS sequence
let biosBootState = {
    active: false,
    startTime: 0,           // Date.now() when sequence began
    elapsed: 0,             // seconds elapsed

    // Text buffer (all panes)
    lines: [],              // { text, color, bold, pane, time }
    lineIndex: 0,           // next line to reveal

    // Pane splits
    horizontalSplit: false,  // true after t=1.0s
    verticalSplit: false,    // true after t=2.0s
    splitHProgress: 0,       // 0..1, horizontal split line animation
    splitVProgress: 0,       // 0..1, vertical split line animation

    // Phase tracking
    phase: 'post',           // 'post'|'orchestrator'|'swarm'|'uplink'|'check'|'countdown'|'launch'

    // Download progress
    downloadProgress: 0,     // 0..1
    downloadSpeed: 0,        // displayed speed value
    downloadReceived: 0,     // displayed received value

    // System check
    checkLines: [],          // { name, dotsProgress, status, color }
    checkIndex: 0,

    // Countdown
    countdownValue: 3,       // 3, 2, 1, "LAUNCH"

    // Swarm table
    swarmRows: [],           // { name, fillProgress, online }
    swarmIndex: 0,

    // Launch flash
    flashPhase: 0,           // 0..3 strobe cycle index
    flashActive: false,

    // Center panel
    centerPanelAlpha: 0      // fade-in for countdown panel
};
```

### 4.12 Pane Rendering Architecture

```
function renderBIOSBootSequence() {
    if (!biosBootState.active) return;

    const elapsed = biosBootState.elapsed;

    // Full black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CRT phosphor tint
    ctx.fillStyle = 'rgba(0, 40, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Determine pane boundaries
    const splitY = Math.floor(canvas.height * 0.55);
    const splitX = Math.floor(canvas.width * 0.55);

    // PANE 1 (TOP / FULL before split):
    // POST text, Root AI, Orchestrator output
    renderBIOSPane('top', 0, 0, canvas.width,
        biosBootState.horizontalSplit ? splitY - 2 : canvas.height);

    // PANE 2 (BOTTOM, after horizontal split):
    if (biosBootState.horizontalSplit) {
        // Divider line
        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
        ctx.fillRect(0, splitY - 1, canvas.width, 2);

        if (biosBootState.verticalSplit) {
            // BOTTOM-LEFT: System check
            renderBIOSPane('check', 0, splitY + 1, splitX - 2, canvas.height - splitY - 1);

            // Vertical divider
            ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
            ctx.fillRect(splitX - 1, splitY, 2, canvas.height - splitY);

            // BOTTOM-RIGHT: Data stream
            renderBIOSPane('datastream', splitX + 1, splitY + 1,
                canvas.width - splitX - 1, canvas.height - splitY - 1);
        } else {
            // BOTTOM: Swarm table or download
            renderBIOSPane('bottom', 0, splitY + 1, canvas.width, canvas.height - splitY - 1);
        }
    }

    // CENTER PANEL (countdown overlay, Phase 6)
    if (biosBootState.centerPanelAlpha > 0) {
        renderBIOSCountdownPanel();
    }

    // LAUNCH FLASH (final 80ms)
    if (biosBootState.flashActive) {
        renderBIOSLaunchFlash();
    }

    // CRT scanlines over everything
    renderBIOSScanlines();
}
```

### 4.13 Font and Color Reference

| Element | Font | Color | Alpha | Notes |
|---------|------|-------|-------|-------|
| BIOS header | bold 9px mono | #fff | 1.0 | "XENOTECH SYSTEMS BIOS" |
| BIOS body text | 9px mono | #aaa | 1.0 | Standard POST text |
| Status [OK] | bold 9px mono | #0f0 | 1.0 | Green success |
| Status [WARN] | bold 9px mono | #ff0 | 1.0 | Yellow warning |
| Status [CRIT] | bold 9px mono | #f44 | 1.0 | Red critical |
| ASCII art | 9px mono | #0f0 | 0.6 | XENOTECH logo |
| Orchestrator text | 9px mono | #0ff | 1.0 | Cyan for orchestrator |
| Command prompt | bold 9px mono | #fff | 1.0 | "$ command" style |
| Dim text | 9px mono | #888 | 1.0 | Copyright, session IDs |
| Separator lines | 9px mono | #444 | 1.0 | "----" dividers |
| Swarm name | 9px mono | #aaa | 1.0 | "SWARM.TACTICAL" |
| Swarm bar filling | 9px mono | #ff0 | 1.0 | "=====" during load |
| Swarm bar complete | 9px mono | #0f0 | 1.0 | "[============]" |
| Swarm ONLINE | bold 9px mono | #0f0 | 1.0 | Status text |
| Download bar fill | N/A | #0f0 | 0.8 | Segmented fill |
| Download speed | 9px mono | #0ff | 1.0 | "23.7 TB/s" |
| Download received | 9px mono | #aaa | 1.0 | "37.1 / 47.3 TB" |
| Hex dump | 7px mono | #0f0 | 0.15 | Decorative data stream |
| System check dots | 9px mono | #aaa | 0.7 | "......." filling |
| Countdown "3 2 1" | bold 32px mono | #fff | 1.0 | Large centered |
| "WAVE N" | bold 48px mono | #0ff | 1.0 | Center panel |
| "LAUNCH" | bold 48px mono | #0ff | 1.0 | Final text |
| Strobe yellow | N/A | #ff0 | 0.25 | Flash frame 1 |
| Strobe cyan | N/A | #0ff | 0.30 | Flash frame 2 |
| Strobe magenta | N/A | #f0f | 0.20 | Flash frame 3 |
| Strobe white | N/A | #fff | 0.40 | Flash frame 4 |
| Pane divider | N/A | #0f0 | 0.4 | 2px line |
| CRT scanlines | N/A | #000 | 0.15 | Every 3px |
| Phosphor tint | N/A | #002800 | 0.03 | Green background |
| Blinking cursor | 9px mono | #0f0 | 1.0 | "█" at 400ms |

### 4.14 Sound Design for BIOS Sequence

```
BIOS POST sounds:
  - Every 4th line: brief click (1000Hz square, 10ms, gain 0.02)
  - "DETECTED"/"ONLINE" lines: ascending blip (800->1200Hz, 20ms, gain 0.02)
  - ASCII art appear: low hum (100Hz sine, 200ms, gain 0.02)

Orchestrator sounds:
  - "ORCHESTRATOR ONLINE": two-tone chime (440->660Hz, 80ms, gain 0.03)
  - Each orchestrator line: faint data chirp (random 600-1200Hz, 15ms, gain 0.01)

Swarm spawn sounds:
  - Horizontal split: sharp click (2000Hz, 5ms, gain 0.03)
  - Each swarm ONLINE: ascending note (start 400Hz + 50Hz per swarm, 40ms, gain 0.02)
  - "ALL SWARMS ONLINE": chord (400+500+600Hz, 150ms, gain 0.03)

Uplink sounds:
  - "$ uplink" command: keyboard click (3000Hz, 5ms, gain 0.02)
  - Download progress: continuous low hum (80Hz sawtooth, gain 0.01)
    that pitch-shifts upward as progress increases (80->200Hz)
  - "UPLINK COMPLETE": success chime (523+659+784Hz, 100ms, gain 0.03)

System check sounds:
  - Each [OK]: brief blip (1200Hz, 15ms, gain 0.02)
  - [WARN]: lower blip (400Hz, 30ms, gain 0.02)
  - [CRIT]: two descending tones (600->300Hz, 50ms, gain 0.03)
  - "ALL NOMINAL": warm chord (same as boot all online)

Countdown sounds:
  - "3": 220Hz sine, 60ms
  - "2": 330Hz sine, 60ms
  - "1": 440Hz sine, 60ms
  - "LAUNCH": ascending sweep 200->2000Hz over 80ms
  - Strobe: rapid pulsing noise (white noise gated at 50Hz, gain 0.05)
```

### 4.15 Dynamic Content Integration

The BIOS sequence reads actual game state to populate its text:

```
From game state:
  wave                     -> "Session: 0x{hex} // Wave {n}"
  ufo.health               -> Shield integrity check status
  playerInventory.maxBombs  -> Ordnance system check
  missileUnlocked           -> Missile tube detection in POST
  harvesterUnlocked         -> Fleet drone count
  battleDroneUnlocked       -> Fleet drone count
  activeCoordinators.length -> Coordinator swarm row
  techTree.researched.size  -> Tech tree check and node count
  bioMatter                 -> Bio conduit status

Tank preview:
  The "$ uplink" download implicitly loads the wave's tactical data.
  After download complete, top pane can show:
  "INTEL: {tankCount} HOSTILES INBOUND"
  "THREAT LEVEL: {heavyTankCount > 0 ? 'ELEVATED' : 'STANDARD'}"
  This replaces the old "X tanks incoming!" text from renderWaveTransition.
```

### 4.16 Wave 1 Special Case

For the very first wave (Wave 1), the BIOS sequence should be slightly different:

```
Wave 1 modifications:
  - ASCII art still appears
  - POST is the same (introduces the BIOS aesthetic)
  - Orchestrator text adds: "FIRST DEPLOYMENT - TUTORIAL MODE ENGAGED"
  - Swarm spawn may have fewer rows (only TACTICAL, HARVEST, DEFENSE)
  - System check skips optional systems (no missiles, no fleet, etc.)
  - Download data is smaller: "12.1 TB" instead of "47.3 TB"
  - Countdown still happens (dramatic first launch)
```

### 4.17 Performance Considerations

```
Text rendering:
  - Pre-generate all BIOS lines at sequence start (store in lines array)
  - Each frame only renders visible lines (clipped to pane bounds)
  - Max ~40 visible lines at any time across all panes
  - Cost: ~40 fillText calls = ~0.5ms

Hex data stream:
  - Generate random hex strings using Math.random() -- no crypto needed
  - Render ~28 lines of hex per frame in the data stream pane
  - Reuse strings across frames (regenerate every 30ms, not every frame)
  - Cost: ~28 fillText calls = ~0.3ms

Strobe flash:
  - Single fillRect per frame during strobe
  - Cost: negligible

Total estimated cost: < 1.5ms/frame during BIOS sequence.
Acceptable -- this runs instead of gameplay rendering, not alongside it.
```

### 4.18 Transition Bridge

The BIOS sequence must smoothly bridge into the existing Quantum OS boot:

```
End of BIOS (t=3.0s):
  1. biosBootState.active = false
  2. White flash alpha = 0.6 (fading)
  3. Game state changes to PLAYING
  4. initHUDBoot() is called
  5. preBootState.phase = 'crt' (existing CRT turn-on effect)

The white flash from BIOS fading out overlaps with the CRT turn-on
white line expanding. This creates a seamless visual bridge:
  BIOS white -> brief black -> CRT horizontal line -> CRT expand -> logo -> border trace -> panel boots

The total "boot experience" becomes:
  3.0s (BIOS) + 5.0s (Quantum OS boot) = 8.0s
  But BIOS is during WAVE_TRANSITION, and Quantum OS boot
  happens during early PLAYING state with gameplay already starting.
  So the player is already playing while panels boot.
```

---

## APPENDIX A: Complete Layout Map at 1280x720 (Post-Pass 3)

```
+--[SYS.STATUS]--+  [TECH TREE - HIDDEN WAVE 1]  +--[MISSION.CTL]--+--[BIO-MATTER]--+--[SYS.INTG]--+
| Score  HI:     |  PG: [*][*]--[ ]--[ ]--[ ]    | Quota ████░░░░  | BIO-MATTER 042 | SHLD ███  OK |
| WAVE 3  1:45   |  DC: [*]--[ ]--[ ]--[ ]--[ ]  | [icons][icons]  | >> 0110 [██] 87%| REVIVE [*][*]|
| 3x (1.5x)     |  DN: [*]--[ ]--[ ]--[ ]--[ ]  |                 | >> 1011 [██] 62%|              |
|                |  RSRCH: PG2 ██░░ 23s           |                 | >> 0011 [█░] 31%| SPD +20%     |
+----------------+                                +-----------------| >> 1101 [░░] 08%+--------------+
|                |                                                  |  .  * .  *      |[NRG.FLOW]    |
+--[ORD.SYS]----+                                                  | ACTIVE 34 b/s   | OUT/IN graph |
| BOMBS [Z]     |                                                  +-----------------+--------------+
|   [O][O][O]   |                                                                    |              |
|   [O][O][O]   |                    PLAY AREA                                       +--[FLEET.CMD]-+
|   [O][o][o]   |                                                                    | COORD.H ██   |
| MISSILES [X]  |                  (UFO + targets                                    |  H-01 ██     |
|   A [>>>>]    |                   + tanks + beam)                                  |  H-02 ██     |
|   B [>>>>]    |                                                                    | COORD.A ██   |
+---------------+                                                                    |  A-01 ██     |
| RSRCH: 45s    |                                                                    +---------------+
+---------------+
+--[DIAG.SYS]---+
| NRG.MAIN 87%  |
| BEAM ACTIVE   |
| SHLD.INTG 54% |
+---------------+
+--[OPS.LOG]----+
| > +3 BIOMATTER|
| > TANK DESTR  |
+---------------+
+--[COMMANDER]--+
| [*] INCOMING  |
| [face] text.. |
+------y=720----+
```

## APPENDIX B: New State Additions Summary

```javascript
// Tech tree visibility
techTreeAnimState.visible = false;
techTreeAnimState.appearProgress = 0;
techTreeAnimState.appearStartTime = 0;

// Bio-matter upload rows
let bioUploadRows = [];  // { spawnTime, progress, phase, flashStartTime }

// BIOS boot sequence
let biosBootState = {
    active: false,
    startTime: 0,
    elapsed: 0,
    lines: [],
    lineIndex: 0,
    horizontalSplit: false,
    verticalSplit: false,
    splitHProgress: 0,
    splitVProgress: 0,
    phase: 'post',
    downloadProgress: 0,
    downloadSpeed: 0,
    downloadReceived: 0,
    checkLines: [],
    checkIndex: 0,
    countdownValue: 3,
    swarmRows: [],
    swarmIndex: 0,
    flashPhase: 0,
    flashActive: false,
    centerPanelAlpha: 0
};
```

## APPENDIX C: Animation Timing Master Table

| Feature | Animation | Duration | Rate | Notes |
|---------|-----------|----------|------|-------|
| F1 | Tech tree appear | 600ms | One-shot | On first tech research |
| F1 | Node materialize | 80ms stagger | Per-node | Left-to-right |
| F1 | Indicator blink (tier 1) | 600ms | Continuous | Per-node |
| F1 | Indicator blink (tier 5) | 1400ms | Continuous | Slower for higher tiers |
| F1 | Indicator phase offset | +300ms | Per-light | Alternating pattern |
| F2 | Upload row progress | 1500ms | Per-row | 0% to 100% |
| F2 | Row spawn stagger | 50ms | Per-unit | Sequential within batch |
| F2 | Completion flash | 200ms | 25ms/toggle | 40Hz strobe |
| F2 | Row collapse | 100ms | One-shot | easeInCubic |
| F2 | Active binary scroll | Continuous | 120px/s | Fast rightward |
| F2 | Idle binary scroll | Continuous | 15px/s | Slow rightward |
| F3 | Title hue shift | 3000ms cycle | Continuous | Sine wave color drift |
| F3 | Loading bar sweep | 800ms cycle | Continuous | Left-to-right pulse |
| F3 | Hex grid pulse | 1200ms cycle | Continuous | Radiating ring |
| F3 | Inner orbit | 3000ms orbit | Continuous | 3 dots clockwise |
| F3 | Outer orbit | 5000ms orbit | Continuous | 2 dots counter-clockwise |
| F3 | Scanning line | 6500ms cycle | 40px/s | Downward sweep |
| F3 | Dissolution | 200ms | One-shot | Radial outward |
| F4 | BIOS POST scroll | 580ms | 15-40ms/line | Accelerating |
| F4 | Orchestrator lines | 400ms | 25ms/line | Standard speed |
| F4 | Pane split animation | 50ms | One-shot | Green line draw |
| F4 | Swarm row appear | 600ms total | 80ms/row | Sequential |
| F4 | Swarm bar fill | 60ms | Per-row | Rapid fill |
| F4 | Download bar | 400ms | 0->100% | Segmented fill |
| F4 | System check lines | 500ms total | 50ms/line | With dot fill |
| F4 | Dot fill animation | 35ms | Per-line | Left-to-right dots |
| F4 | Countdown beats | 350ms total | ~120ms/beat | 3-2-1-LAUNCH |
| F4 | Launch strobe | 80ms | 20ms/frame | 4-color cycle |
| F4 | Hex data stream | Continuous | 300px/s upward | Decorative scroll |

---

*End of HUD Design Pass 3 Visual Design Specification*
