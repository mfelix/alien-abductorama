# HUD Design Pass 2 - Comprehensive Visual Design Specification

**Date**: 2026-02-13
**Role**: Visual Designer & Game Designer
**Target File**: `/Users/mfelix/code/alien-abductorama/js/game.js` (~21,373 lines)
**Reference Resolution**: 1280x720 canvas

---

## TABLE OF CONTENTS

1. [AREA 1: Tech Tree Horizontal Visualization](#area-1)
2. [AREA 2: Enhanced Boot Sequence](#area-2)
3. [AREA 3: NRG.Flow Padding Fix](#area-3)
4. [AREA 4: NRG.Flow Dynamic Enhancement](#area-4)
5. [AREA 5: Low Health HUD Freakout](#area-5)
6. [AREA 6: Bio-Matter Upload Conduit](#area-6)
7. [AREA 7: DIAG.SYS Enhancement](#area-7)
8. [AREA 8: Scan Lines Enhancement](#area-8)
9. [AREA 9: More Cool Sounds](#area-9)

---

<a name="area-1"></a>
## AREA 1: TECH TREE HORIZONTAL VISUALIZATION (BIGGEST REDESIGN)

### 1.1 Current State Analysis

**Current code**: `renderTechChips()` at line 14398, `TECH_CHIP_DEFS` at line 14374, `TRACK_COLORS` at line 14392.

**Current behavior**: Tech chips are small labeled rectangles (44-58px wide, 18px tall) placed in the gap between SYS.STATUS (top-left, ends at x=220) and MISSION.CTL (top-center, starts at x=500 at 1280px). They render left-to-right, wrapping to second row, with 2px vertical separators between tracks. Each chip shows `PG1 CONDUIT` style text with a 2x2 blink light.

**Current layout math** (from `getHUDLayout()` at line 12858):
- `statusZone`: `{ x: 10, y: 10, w: leftW(210), h: 120 }`
- `missionZone`: `{ x: (1280-280)/2=500, y: 4, w: 280, h: 110 }`
- Gap: x=224 to x=496 = 272px usable at 1280px

**Research display**: Currently rendered below weaponsZone (line 13021-13111). Shows active research with progress bar, priority number, countdown timer. Research queue shows items #2 and #3 with dimmer styling.

**Problems with current approach**:
1. Tech chips are scattered/flat -- no visual hierarchy or track grouping
2. No connection lines showing tech tree progression
3. No bio-organic aesthetic
4. Research display is far from the tech chips (weapons zone vs top gap)
5. No indication of unresearched/locked techs
6. At small screens, gap vanishes and chips disappear entirely

### 1.2 New Design: Horizontal Tech Tree

The entire gap between SYS.STATUS and MISSION.CTL (and extending to the right of MISSION.CTL toward SYS.INTG) becomes a **horizontal tech tree visualization** with three track rows, connecting lines, and bio-organic animated backgrounds.

#### 1.2.1 Layout Zones

```
At 1280px canvas:
  STATUS ends at:   x = 10 + 210 = 220
  MISSION starts:   x = 500, ends at x = 780
  SYSTEMS starts:   x = 1280 - 195 - 10 = 1075

  LEFT GAP:  x = 224 to x = 496  (272px)
  RIGHT GAP: x = 784 to x = 1071 (287px)
  TOTAL AVAILABLE: 272 + 280(mission) + 287 = 839px

  But the tech tree only uses LEFT GAP + RIGHT GAP = 559px
  The mission zone sits in the middle, tech tree rows run BEHIND/BELOW it.
```

**Actual tech tree layout**: The tree occupies a horizontal strip at y=0 to y=76 (3 rows x 22px + padding), spanning the full width between STATUS and SYSTEMS zones. The MISSION.CTL zone renders ON TOP of the tech tree (higher z-order).

```
+---[SYS.STATUS]---+                                            +---[SYS.INTG]---+
|                   |     TECH TREE VISUALIZATION AREA           |                |
| Score, wave, etc  | PG: [==]--[==]--[  ]--[  ]--[  ]          | SHLD bar       |
|                   | DC: [==]--[  ]--[  ]--[  ]--[  ]          | Revive cells   |
|                   | DN: [==]--[==]--[  ]--[  ]--[  ]          |                |
+-------------------+     ^^^                                    +----------------+
                          ||| MISSION.CTL renders ON TOP
                    +-----[MISSION.CTL]------+
                    | Quota bar              |
                    | Harvest counter        |
                    +------------------------+
```

#### 1.2.2 Tech Tree Row Design

Each track is one horizontal row. Three rows total:

| Row | Track | Y Position | Color | Background Tint |
|-----|-------|-----------|-------|-----------------|
| 0 | Power Grid (PG) | y=4 | #ff8800 (warm orange) | rgba(255, 136, 0, 0.04) |
| 1 | Drone Command (DC) | y=28 | #4488ff (blue) | rgba(68, 136, 255, 0.04) |
| 2 | Defense Network (DN) | y=52 | #dd6600 (deep orange) | rgba(221, 102, 0, 0.04) |

**Row height**: 22px (including 2px top/bottom padding)
**Row total height**: 3 rows x 22px + 2px gaps = 70px

#### 1.2.3 Tech Node Design

Each tech node is a small rectangle:

```
RESEARCHED NODE:
+--------+
| PG1    |   40px wide x 18px tall
| CONDUIT|   Background: track color at 25% alpha
+--------+   Border: track color, 1px solid
             Text: 7px monospace, white at 80% alpha
             ID prefix (PG1): bold 7px, track color

UNRESEARCHED NODE:
+--------+
| PG3    |   40px wide x 18px tall
| BCAST  |   Background: rgba(20, 20, 30, 0.3)
+--------+   Border: track color at 15% alpha, 0.5px dashed
             Text: 7px monospace, white at 20% alpha
             ID prefix: track color at 20% alpha

CURRENTLY RESEARCHING:
+========+
| PG2    |   40px wide x 18px tall
| EFFIC  |   Background: track color at 12% alpha, pulsing
+========+   Border: track color, 1.5px solid, pulsing glow (shadowBlur=4)
             Text: 7px monospace, white at 60% alpha
             Progress bar: 2px tall at bottom, track color fill
             Glow pulse: shadowBlur oscillates 2-6 at 800ms rate
```

**Node dimensions**: 40px wide x 18px tall
**Inter-node gap**: 6px (filled by connecting line)
**Total per 5-node row**: 5 x 40 + 4 x 6 = 224px

#### 1.2.4 Connecting Lines

Between consecutive nodes in each track, a horizontal line connects them:

```
[NODE1]----[NODE2]----[NODE3]----[NODE4]----[NODE5]
        6px      6px      6px      6px
```

- **Researched connection**: Solid line, track color, 1.5px, with subtle glow (shadowBlur=2)
- **Next available**: Dashed line, track color at 40%, 1px, animated dash offset (moving left-to-right at 30px/s)
- **Locked connection**: Dotted line, rgba(255,255,255,0.06), 0.5px

**Cross-connect lines** (between tracks, for techs with `crossConnect` property):
- Diagonal line from one track to another (e.g., pg2<->dc2)
- Color: white at 8% alpha
- Only drawn when both connected techs are researched
- 0.5px dashed line

#### 1.2.5 Bio-Organic Animated Background

Each track row has a subtle animated background that conveys a living, alien system:

**Particle field**: Small dots (1x1px and 2x2px) that move and flash within each row's background area.

```
Per track row background (runs full width of track):
  - 12-18 particles per row
  - Each particle:
    Position: random within row bounds, drifts slowly (0.2-0.8 px/frame horizontal)
    Size: alternating 1x1 and 2x2 pixels
    Color: track color at 15-40% alpha (randomized per particle)
    Blink: each particle independently blinks on/off
      ON duration: 100-400ms (random)
      OFF duration: 200-800ms (random)
    Drift: particles drift rightward, wrapping at row end

  - Pixel noise layer:
    Every 120ms, 3-5 random pixels within the row flash briefly (1 frame)
    Color: track color at 8% alpha
    Creates "digital data flowing" effect
```

**Implementation**: Use deterministic pseudo-random based on `Date.now()` and particle index. No per-particle state needed -- compute position from `(baseX + Date.now() * speed) % rowWidth`.

**Background gradient** (behind particles):
```
For each row:
  ctx.fillStyle = track background tint (see table above)
  ctx.fillRect(rowX, rowY, rowWidth, 22)
```

#### 1.2.6 Research Display Integration

Move the research display FROM below the weapons zone INTO the tech tree section. Each research priority slot gets its own row below the tech tree.

```
TECH TREE AREA (y=4 to y=70):
  Row 0 (y=4):  PG track with 5 nodes
  Row 1 (y=28): DC track with 5 nodes
  Row 2 (y=52): DN track with 5 nodes

RESEARCH DISPLAY (y=74 to y=108, below tech tree):
  Slot 1 (y=74):  [1] PG2 EFFIC ████████░░░░ 23s  [*]
  Slot 2 (y=92):  [2] DC1 UPLINK              45s
  Slot 3 (y=106): [3] DN2 ARMOR               45s
```

**Research slot design**:
- Height: 16px per slot
- Width: matches tech tree area width
- Background: rgba(0, 20, 0, 0.4) with 0.5px green (#0a4) border
- Priority number: bold 10px monospace, #0f0, left-aligned at x+4
- Tech name (from TECH_CHIP_DEFS): bold 9px monospace, white, at x+18
- Progress bar: renderNGEBar, 15 segments, color #0a4
- Timer: bold 9px monospace, white, right-aligned
- Blink light: renderNGEBlinkLight at right edge, #0f0, 300ms (active research only)
- Queued items: dimmer (alpha 0.45), no progress bar, just name and time

#### 1.2.7 Tech Tree Positioning

```
At 1280px canvas:
  treeStartX = statusZone.x + statusZone.w + 6 = 226
  treeEndX = systemsZone.x - 6 = 1069
  treeWidth = 843px

  nodeWidth = 40
  nodeGap = 6
  nodesPerTrack = 5
  trackNodeWidth = 5 * 40 + 4 * 6 = 224px

  Track rendering:
    trackStartX = treeStartX + (treeWidth - 224) / 2 = 226 + 309.5 = 535.5

    But MISSION.CTL zone (x=500, w=280) sits on top.
    Solution: Center the 5-node track at the midpoint of the available space,
    allowing MISSION.CTL to render over the middle nodes.
    The leftmost and rightmost nodes will be visible.
    Nodes behind MISSION.CTL still exist, just visually occluded.

  BETTER APPROACH: Split the track into visible segments:
    Left segment: nodes that fit in left gap (x=226 to x=496)
    Right segment: nodes that fit in right gap (x=784 to x=1069)

    Left gap = 270px -> can fit 5 nodes (224px) easily
    Right gap = 285px -> can also fit 5 nodes

    Place ALL 5 nodes in the LEFT gap (centered):
    trackStartX = 226 + (270 - 224) / 2 = 226 + 23 = 249

    OR, spread nodes across the full width behind mission zone:
    This keeps the tree visually centered. Nodes behind mission zone are hidden
    but the connecting lines still run through.
```

**Final decision**: Place all 5 nodes in the LEFT gap for each track. This keeps them visible and avoids overlap with MISSION.CTL.

```
At 1280px:
  LEFT GAP: x=226 to x=496 (270px usable)
  5 nodes x 40px + 4 gaps x 6px = 224px
  Centered: startX = 226 + (270 - 224) / 2 = 249

  Node positions:
    Node 1: x=249
    Node 2: x=295 (249+40+6)
    Node 3: x=341
    Node 4: x=387
    Node 5: x=433

At 1920px:
  LEFT GAP: x=226 to x=816 (590px usable)
  Even more room. Same centering logic, or spread wider.
  startX = 226 + (590 - 224) / 2 = 409
```

#### 1.2.8 Research Display Position (Moved)

The research display moves to below the tech tree:

```
researchY = 76 (below the 3 track rows)
researchX = treeStartX (aligns with first node)
researchW = 224 (matches track width)
```

If no active research, this area is empty (just the bio-organic background runs through).

**Remove from weapons zone**: Delete lines 13021-13111 in renderHUDFrame that currently render research below weapons.

#### 1.2.9 Small Screen Considerations

**Canvas width < 900px**:
- Tech tree nodes shrink to 32px wide (5 x 32 + 4 x 4 = 176px)
- Text uses 6px font
- Connecting lines shorten to 4px
- If gap < 180px: switch to MICRO VIEW (just colored dots per node, no text)

**Canvas width < 700px**:
- Hide tech tree entirely (same as current behavior where `gapW < 44` guard triggers)
- Research display moves back to below weapons zone

**MICRO VIEW** (for very tight gaps):
```
PG: * * * - -     * = researched (filled dot, 4px, track color)
DC: * - - - -     - = unresearched (dim dot, 4px, rgba(255,255,255,0.1))
DN: * * - - -
Each dot: 4px wide, 4px gap between dots
Total per row: 5 x 4 + 4 x 4 = 36px
Rows stacked at 8px interval
Total height: 3 x 4 + 2 x 8 = 28px
```

#### 1.2.10 ASCII Art: Full Tech Tree Layout at 1280px

```
x=10                x=220  x=226                                    x=496  x=500              x=780
+---[SYS.STATUS]---+      +--[TECH TREE]-------------------------------+   +--[MISSION.CTL]--+
| Score  HI:       |      | bg:rgba(255,136,0,0.04)  .  *  .  *      |   | Quota ██████░░░ |
| WAVE 3  1:45     |      | PG: [PG1]--[PG2]==[ PG3 ]--[PG4]--[PG5] |   | Harvest icons   |
| 3x (1.5x)       |      | bg:rgba(68,136,255,0.04)    . * .   *    |   |                 |
| B.MTR: 42        |      | DC: [DC1]--[DC2]--[DC3]--[DC4]--[DC5]   |   |                 |
+------------------+      | bg:rgba(221,102,0,0.04) *  .    *  .    |   +-----------------+
                           | DN: [DN1]--[DN2]--[DN3]--[DN4]--[DN5]   |
                           +--------------------------------------------+
                           | RSRCH:                                     |
                           | [1] PG2 EFFIC ████░░░░ 23s [*]            |
                           | [2] DC1 UPLINK           45s              |
                           +--------------------------------------------+

KEY:
  [PG1]  = Researched node (filled bg, bright border)
  [PG3]  = Unresearched (dim bg, dashed border)
  [PG2]  = Currently researching (pulsing border, progress bar at bottom)
  --     = Researched connection (solid line)
  ==     = Next-available connection (animated dashes)
  .  *   = Bio-organic particles (blinking dots in background)
```

#### 1.2.11 Color Reference for Tech Tree

| Element | Color | Alpha | Notes |
|---------|-------|-------|-------|
| PG track color | #f80 | 1.0 | Warm orange |
| DC track color | #48f | 1.0 | Blue |
| DN track color | #d60 | 1.0 | Deep/different orange |
| PG row background | #f80 | 0.04 | Very subtle tint |
| DC row background | #48f | 0.04 | Very subtle tint |
| DN row background | #d60 | 0.04 | Very subtle tint |
| Researched node bg | track color | 0.25 | Visible fill |
| Researched node border | track color | 1.0 | Solid 1px |
| Researched node text | #fff | 0.8 | White text |
| Unresearched node bg | #141420 | 0.3 | Dark fill |
| Unresearched node border | track color | 0.15 | Faint dashed |
| Unresearched node text | #fff | 0.2 | Very dim |
| Researching node border | track color | 1.0 | 1.5px, pulsing glow |
| Researching progress bar | track color | 0.8 | 2px tall at node bottom |
| Particle dots | track color | 0.15-0.40 | Random per particle |
| Pixel noise | track color | 0.08 | Brief flashes |
| Researched connection | track color | 0.7 | 1.5px solid |
| Next-available connection | track color | 0.4 | 1px animated dash |
| Locked connection | #fff | 0.06 | 0.5px dotted |

#### 1.2.12 Animation Timing

| Animation | Duration | Rate | Notes |
|-----------|----------|------|-------|
| Particle drift | Continuous | 0.2-0.8 px/frame | Rightward drift, wraps |
| Particle blink ON | 100-400ms | Per-particle random | |
| Particle blink OFF | 200-800ms | Per-particle random | |
| Pixel noise flash | 1 frame (16ms) | Every 120ms, 3-5 pixels | |
| Researching node glow | 800ms cycle | shadowBlur 2-6 | Sine wave oscillation |
| Researching progress bar | Continuous | Driven by research timer | |
| Next-available dash offset | 30px/s | Continuous | Moving left-to-right |
| Node appear (on research complete) | 400ms | One-shot | Fade in + brief scale 1.0->1.1->1.0 |

---

<a name="area-2"></a>
## AREA 2: ENHANCED BOOT SEQUENCE

### 2.1 Current State Analysis

**Current code**: `initHUDBoot()` at line 14612, `updateHUDBoot()` at line 14670, `renderPanelBootOverlay()` at line 14838, `generateBootLines()` at line 14728.

**Current behavior**: Per-panel overlays with dark backgrounds, scrolling diagnostic text lines, progress bars. Panels boot in staggered order (status->mission->systems->diagnostics->weapons->fleet->opslog->commander). Each panel has `waiting->booting->online` phases. Boot text lines show tech-aware diagnostics with `[OK]`, `[SKIP]`, `>>` prefixes. Total duration: 3.5s. Sound effects: `bootPanelStart`, `bootPanelOnline`, `bootDataChatter`, `bootMissileSkip`, `bootAllOnline`.

**Current hudBootState** (line 12660):
```
phase: 'idle'|'booting'|'complete'
timer, duration: 3.5
panels: { status, mission, systems, weapons, fleet, commander, diagnostics, opslog }
techSnapshot, bootLines
```

**What exists already works well**. The new design WRAPS the existing boot sequence with additional global effects that happen before and after the per-panel boots.

### 2.2 New Enhanced Boot Sequence Design

The new boot sequence adds a **pre-boot wrapper** and a **post-boot wrapper** around the existing panel boot sequence. The panel boot system remains unchanged.

#### 2.2.1 Complete Timeline

```
t=-1.5s to t=0.0s: PRE-BOOT WRAPPER (new)
  t=-1.500s: Black screen (fade from gameplay to pure black over 200ms)
  t=-1.300s: TV TURN-ON EFFECT
    - Single horizontal white line at vertical center, 1px tall
    - Line expands vertically: 1px -> canvas.height over 300ms
    - Horizontal expansion simultaneous: center-out
    - Spherical CRT warp distortion on the expanding rectangle
    - Peak brightness at t=-1.100s (white flash, alpha=0.8)
  t=-1.000s: STARTUP SOUND plays (Mac-like alien chime, see Area 9)
  t=-0.800s: "ALIEN QUANTUM OS" LOGO APPEARS
    - Center screen, 320x180px area
    - Logo style: early 90s Unix workstation, pixelated
    - Text: "ALIEN QUANTUM OS" in blocky 24px pixel font
    - Below: "v7.3.1 // QUANTUM ENTANGLEMENT CORE" in 9px monospace, #0ff
    - Moving parts: small orbiting dots around logo text (2-3 dots, circular path)
    - EVA/Macross reference: hexagonal grid pattern behind text, very faint
    - Color: Primary text in #0ff (cyan), grid in rgba(0,255,255,0.06)
  t=-0.200s: Logo DISSOLVES
    - Pixel-by-pixel dissolution (random pixels disappear over 200ms)
    - Brief afterimage glow (shadowBlur=8 fading to 0)
  t=0.000s: Logo fully gone. GREEN BORDER LINE begins.

t=0.000s to t=0.750s: GREEN BORDER TRACE (new)
  A bright green (#0f0) line traces the screen border clockwise:
    - Start: top-left corner (0, 0)
    - Segment 1 (L->R): Top edge, left to right    (~150ms)
    - Segment 2 (T->B): Right edge, top to bottom  (~200ms)
    - Segment 3 (R->L): Bottom edge, right to left (~200ms)
    - Segment 4 (B->T): Left edge, bottom to top   (~200ms)

  Non-linear acceleration (burst-pause-burst-pause):
    Each segment: fast start (80% of distance in 40% of time),
    brief decel at corner (20ms pause), fast start of next segment.
    Easing: custom cubic with corner pauses.

  Visual:
    - Line: 2px wide, #0f0, with 8px glow trail (shadowBlur=8)
    - Trail: gradient from full alpha to 0 over 40px behind trace point
    - Trace point: 4px bright dot, white center (#fff) with green glow
    - Border stays lit after trace passes (persists as 1px #0f0 at 30% alpha)

  HUD SECTION SPIN-UP:
    As the trace line passes each HUD panel's position, that panel
    begins its boot sequence (replaces the existing stagger timing):

    Top edge (L->R): Passes STATUS zone -> STATUS boot starts
    Top edge (cont):  Passes MISSION zone -> MISSION boot starts
    Top edge (cont):  Passes SYSTEMS zone -> SYSTEMS boot starts
    Right edge (T->B): Passes FLEET zone -> FLEET boot starts
    Bottom edge (R->L): Passes COMMANDER zone -> COMMANDER boot starts
    Left edge (B->T): Passes OPS.LOG -> OPS.LOG boot starts
    Left edge (cont):  Passes DIAG.SYS -> DIAGNOSTICS boot starts
    Left edge (cont):  Passes WEAPONS -> WEAPONS boot starts

t=0.000s to t=0.750s: FOUR-TONE SEQUENCE (simultaneous with border trace)
  One tone per corner:
    Corner 1 (top-left, t=0.00s):    C4 (261.6 Hz), sine, 120ms
    Corner 2 (top-right, t=0.15s):   E4 (329.6 Hz), sine, 120ms
    Corner 3 (bottom-right, t=0.40s): G4 (392.0 Hz), sine, 120ms
    Corner 4 (bottom-left, t=0.60s):  C5 (523.3 Hz), sine, 120ms
  Each tone: 0.06 gain, 120ms duration, gentle exponential decay
  Creates ascending C major chord feel = satisfying power-up sound

t=0.750s to t=4.250s: EXISTING PANEL BOOT SEQUENCE
  (Uses current panel boot system, but with adjusted start times
   driven by the border trace rather than fixed offsets)
  All panels boot to 'online' as before.

t=4.250s to t=4.750s: POST-BOOT FEEDBACK (new)
  t=4.250s: "ALIEN QUANTUM OS IS NOW ONLINE" text
    - Center screen, bold 14px monospace, #0ff
    - Types out character-by-character (15ms per char)
    - Subtle glow: shadowBlur=6, shadowColor=#0ff
    - Total type time: ~500ms for the text
  t=4.600s: Text flashes bright (alpha pulse 1.0->0.5->1.0, 100ms)
  t=4.750s: Text fades out (alpha 1.0->0 over 200ms)

t=4.950s: Boot sequence complete. hudBootState.phase = 'complete'.
```

#### 2.2.2 TV Turn-On CRT Effect

```
Phase 1: Horizontal line (t=-1.300 to t=-1.200, 100ms)
  - ctx.fillStyle = '#fff'
  - Line: centered vertically, 1px tall, expands from center:
    width = canvas.width * easeOutQuad(progress)
    x = (canvas.width - width) / 2
    y = canvas.height / 2
    ctx.fillRect(x, y, width, 1)

Phase 2: Vertical expansion (t=-1.200 to t=-1.000, 200ms)
  - Rectangle expands from the horizontal line:
    height = canvas.height * easeOutCubic(progress)
    y = (canvas.height - height) / 2
    ctx.fillRect(0, y, canvas.width, height)

Phase 3: Spherical warp (during expansion)
  - Apply barrel distortion effect to the expanding rectangle
  - Implementation: render to offscreen canvas, then draw with
    slight scaling at edges (1.02x at center, 0.98x at edges)
  - Creates CRT curvature illusion
  - Alpha: starts at 0.8, fades to 0.15 as boot begins

Phase 4: Flash and settle (t=-1.000)
  - Brief white flash: full-screen rect at alpha=0.3 for 50ms
  - Then dims to ambient boot brightness (0.15 alpha overlay)
```

#### 2.2.3 Alien Quantum OS Logo

```
Logo area: centered, 320x180px

Text layout:
  Line 1: "ALIEN QUANTUM OS"
    Font: bold 24px monospace (or custom pixel font if available)
    Color: #0ff (cyan)
    Position: centered horizontally, y = center - 30
    Letter spacing: 2px extra

  Line 2: "v7.3.1 // QUANTUM ENTANGLEMENT CORE"
    Font: 9px monospace
    Color: rgba(0, 255, 255, 0.6)
    Position: centered horizontally, y = center + 10

  Line 3: "[ INITIALIZING... ]"
    Font: 9px monospace
    Color: rgba(0, 255, 255, 0.4)
    Position: centered horizontally, y = center + 30
    Animated: dots cycle "." ".." "..." at 200ms interval

Decorative elements:
  - Hexagonal grid:
    Behind text, 200x120px area
    Hex size: 12px
    Color: rgba(0, 255, 255, 0.04)
    Slowly rotating: 0.5 degrees/second

  - Orbiting dots:
    3 dots orbiting the text at radius=90px
    Speed: 120 degrees/second (3 second full orbit)
    Dot size: 3px
    Color: #0ff with shadowBlur=4
    120-degree spacing between dots

  - Scan lines over logo:
    Same as renderNGEScanlines but confined to logo area
    Alpha: 0.02

Logo dissolution:
  - 200ms duration
  - Divide logo area into 4x4px blocks
  - Each block disappears at a random time within the 200ms window
  - Disappearing: block alpha goes 1.0->0 over 40ms
  - After all blocks gone: brief afterglow (full area, alpha 0.1->0 over 100ms)
```

#### 2.2.4 Green Border Trace

```
Border path (clockwise from top-left):
  Point 0: (0, 0)           -- top-left
  Point 1: (canvas.width, 0)  -- top-right
  Point 2: (canvas.width, canvas.height) -- bottom-right
  Point 3: (0, canvas.height)  -- bottom-left
  Point 4: (0, 0)           -- back to top-left (close)

Total perimeter: 2 * (canvas.width + canvas.height) = 2 * (1280 + 720) = 4000px
Duration: 750ms
Speed: 4000 / 0.75 = 5333 px/s (with non-linear modulation)

Non-linear acceleration:
  Use a custom easing function with corner pauses:

  function borderTraceEase(t) {
    // t is 0-1 normalized time
    // Returns 0-1 normalized distance along perimeter
    // Burst at start of each edge, brief pause at corners

    // Four segments, each ~25% of time
    const seg = Math.floor(t * 4);
    const segT = (t * 4) - seg;

    // Within each segment: ease-out cubic for burst, then slow
    const easedSegT = 1 - Math.pow(1 - segT, 2.5);

    return (seg + easedSegT) / 4;
  }

Trace rendering per frame:
  const perimeterTotal = 2 * (canvas.width + canvas.height);
  const distance = borderTraceEase(progress) * perimeterTotal;
  const {x, y} = getPerimeterPoint(distance);

  // Bright trace dot
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#0f0';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  // Trail behind trace
  for (let i = 1; i <= 8; i++) {
    const trailDist = distance - i * 5;
    if (trailDist < 0) continue;
    const {x: tx, y: ty} = getPerimeterPoint(trailDist);
    const alpha = 0.3 * (1 - i / 8);
    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    ctx.fillRect(tx - 1, ty - 1, 2, 2);
  }

  // Persistent border line (already traced portion)
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.lineWidth = 1;
  // Draw border from (0,0) to current trace point
  drawPartialBorder(0, distance);
```

#### 2.2.5 Panel Boot Trigger Mapping

As the border trace passes each panel's screen position, that panel begins booting:

| Panel | Trigger Edge | Trigger Position | Approximate Time |
|-------|-------------|-----------------|------------------|
| STATUS | Top edge | x=10 (left edge of status zone) | t=0.010s |
| MISSION | Top edge | x=500 (left edge of mission zone) | t=0.070s |
| SYSTEMS | Top edge | x=1075 (left edge of systems zone) | t=0.140s |
| FLEET | Right edge | y=108 (top of fleet zone) | t=0.200s |
| COMMANDER | Bottom edge | x=260 (right edge of commander zone) | t=0.420s |
| OPS.LOG | Left edge | y=500 (top of ops.log zone) | t=0.550s |
| DIAGNOSTICS | Left edge | y=390 (top of diag zone) | t=0.600s |
| WEAPONS | Left edge | y=140 (top of weapons zone) | t=0.700s |

These replace the fixed `defaultStartTimes` in `initHUDBoot()`.

#### 2.2.6 Interaction with Existing System

- The CRT turn-on and logo are new global effects rendered by a new `renderPreBoot()` function
- The green border trace is a new global effect rendered by `renderBorderTrace()`
- Both are called from `renderHUDBootGlobalEffects()` (line 21331)
- The existing per-panel boot overlays (`renderPanelBootOverlay`) continue unchanged
- The total boot duration extends from 3.5s to ~5.0s (1.5s pre-boot + 3.5s panel boot)
- Skip behavior (press any key) skips to the end of the panel boot phase, also skipping pre-boot if still playing

---

<a name="area-3"></a>
## AREA 3: NRG.FLOW PADDING FIX

### 3.1 Current State Analysis

**Current code**: `renderEnergyGraph()` at line 13605, `graphY` calculation at lines 13611-13613.

**Current behavior**:
```javascript
// Line 13611-13613:
let graphY = y + 88 + 8;  // y is systemsZone.y (10), so graphY = 106
if (playerInventory.speedBonus > 0) graphY += 22;
if (playerInventory.maxEnergyBonus > 0) graphY += 14;
```

When no speed or energy powerups are active, `graphY = 10 + 88 + 8 = 106`. The systems zone panel ends at `y + 88 = 98`. Gap between systems panel bottom and NRG.FLOW top: `106 - 98 = 8px`.

**The problem**: When speed/energy indicators are NOT present, the 8px gap between SYS.INTG bottom and NRG.FLOW is correct. BUT there's also a `getHUDLayout()` calculation at line 12866-12872 that mirrors this:

```javascript
// Line 12866-12872:
let fleetY = 108;
if (techFlags.beamConduit) {
    let graphY = margin + 88 + 8;  // 10 + 88 + 8 = 106
    if (playerInventory.speedBonus > 0) graphY += 22;
    if (playerInventory.maxEnergyBonus > 0) graphY += 14;
    fleetY = graphY + 72 + 10; // energy graph height + gap
}
```

**Actual issue**: The system zone panel is 88px tall (`renderNGEPanel(x, y, w, 88, ...)`). The revive cells render at `cellY = shieldY + 28 = y + 22 + 28 = y + 50`. With no cells, `speedY = cellY + 22 = y + 72`, `enY = cellY + 36 = y + 86`. These are all INSIDE the 88px panel.

The speed and energy indicators (`SPD +20%`, `NRG +50`) render inside the 88px panel when cells exist, or just below it otherwise. The speed indicator at `cellY + 22 = y + 72` is inside the panel. But when no cells exist, the indicators still render at the same Y but with nothing above them, creating visual gap.

**Wait -- re-reading the code more carefully**:

The `renderSystemsZone` renders:
- Panel: 88px tall (y to y+88)
- SHLD bar: y+22
- Revive cells: y+50
- Speed indicator: y+72 (if speedBonus > 0) -- inside the 88px panel
- Energy indicator: y+86 (if both bonuses) -- at very bottom of panel

The indicators are INSIDE the panel. The issue is that when no powerups (speed/energy/revive) exist, the bottom portion of the 88px panel is empty. This creates non-standard visual spacing between SYS.INTG content and NRG.FLOW because the NRG.FLOW panel starts at a fixed offset below the 88px panel regardless of content.

### 3.2 Fix Specification

**Goal**: Ensure consistent 8px padding between the last visible content in the systems zone and the NRG.FLOW panel.

**Current state**: The 8px gap is always between the PANEL bottom (y+88) and NRG.FLOW (y+96 when no bonuses, y+106/120 with bonuses). The padding calculation already accounts for bonuses via the `+22` and `+14` adjustments.

**Actually, looking again**: The padding IS standard. `graphY = y + 88 + 8` always puts the graph 8px below the 88px systems panel. The speed/energy bonus adjustments push it down further when those indicators extend below the panel.

**The REAL issue** may be that when there are NO revive cells AND NO speed/energy bonuses, the lower portion of the 88px systems panel is empty (SHLD bar ends around y+44, leaving ~44px of empty space before the panel edge at y+88), making the gap between actual content and NRG.FLOW seem overly large.

### 3.3 Proposed Fix

Reduce the systems zone panel height dynamically based on content:

```javascript
// In renderSystemsZone:
let panelH = 48; // minimum: header + shield bar + status dot
if (cells > 0) panelH = 70; // add space for revive cells
if (playerInventory.speedBonus > 0) panelH += 16;
if (playerInventory.maxEnergyBonus > 0) panelH += 14;
panelH = Math.max(panelH, 52); // minimum height for aesthetics

renderNGEPanel(x, y, w, panelH, { color: '#f80', cutCorners: ['tr'], label: 'SYS.INTG' });
```

And update `renderEnergyGraph` to use the actual content bottom:

```javascript
let graphY = y + panelH + 8; // 8px below actual panel bottom
```

**This requires** passing `panelH` from `renderSystemsZone` to `renderEnergyGraph`, or computing it identically in both places.

**Simpler approach**: Keep the 88px panel height but adjust `graphY` computation to always be `systemsZone.y + 88 + 8` (which it already is). The visual gap is intentional -- the systems panel has reserved space for indicators that appear when purchased. The "empty" space is not a bug, it's reservation.

### 3.4 Final Recommendation

**No code change needed for padding.** The 8px gap between panel bottom and NRG.FLOW is consistent and correct. The apparent "non-standard margin" is actually the empty reserved space within the 88px panel for optional indicators (revive cells, speed, energy). This is standard HUD behavior -- panels have fixed heights regardless of content count.

If the user specifically wants the panel to shrink when indicators are absent, the fix above (dynamic `panelH`) can be applied, but it may cause visual jumping when the player buys speed/energy powerups mid-wave.

---

<a name="area-4"></a>
## AREA 4: NRG.FLOW DYNAMIC ENHANCEMENT

### 4.1 Current State Analysis

**Current code**: `renderEnergyGraph()` at line 13605, 120 lines.

**Current behavior**: A 72px tall panel below SYS.INTG showing:
- Header "NRG.FLOW" with OUT/IN legend
- Grid lines (3 horizontal, 5 vertical)
- Y-axis labels (0, mid, peak)
- X-axis labels (-30s, now)
- Two line graphs from ring buffer (output=red, intake=green)
- Fill-under-curve gradients for both lines

**Current visual**: Functional but flat. Red and green lines with subtle gradient fills. Grid lines very faint. No animation beyond data updates. Feels static and "spreadsheet-like."

### 4.2 Enhanced NRG.FLOW Design

Transform the energy graph from a flat data display into a living, dynamic visualization that pulses with the UFO's energy state.

#### 4.2.1 Animated Grid

Replace static grid lines with an animated grid:

```
Horizontal grid lines:
  - 5 lines at 0%, 25%, 50%, 75%, 100% of Y range (increased from 3)
  - Color: rgba(255, 136, 0, 0.06) (orange-tinted, matching systems zone)
  - Width: 0.5px
  - ANIMATION: Each line has a subtle pulse:
    alpha = 0.04 + 0.02 * sin(Date.now() / 2000 + lineIndex * 0.5)
    Creates a gentle breathing effect across the grid

Vertical grid lines:
  - 6 lines (every 5s in the 30s window)
  - Color: rgba(255, 136, 0, 0.04)
  - Width: 0.5px
  - ANIMATION: Lines slowly drift rightward (1px per second) and reset
    This creates the illusion of time flowing left

Grid intersection dots:
  - At each intersection of H and V lines: 1x1px dot
  - Color: rgba(255, 136, 0, 0.12)
  - Every other intersection blinks (500ms rate, staggered)
```

#### 4.2.2 Enhanced Line Rendering

```
OUTPUT line (red):
  - Stroke: 1.5px (up from 1px)
  - Color: rgba(255, 68, 68, 0.9)
  - GLOW: shadowColor = '#f44', shadowBlur = 3
  - At data peaks (local maxima): draw a 2px bright dot (#f44, shadowBlur=6)
  - Fill gradient: top rgba(255,68,68,0.20), bottom rgba(255,68,68,0)

INTAKE line (green):
  - Stroke: 1.5px
  - Color: rgba(0, 255, 0, 0.9)
  - GLOW: shadowColor = '#0f0', shadowBlur = 3
  - At data peaks: draw a 2px bright dot (#0f0, shadowBlur=6)
  - Fill gradient: top rgba(0,255,0,0.15), bottom rgba(0,255,0,0)

"NOW" indicator:
  - Rightmost column (last 3px) has a brighter vertical line
  - Color: rgba(255,255,255,0.15)
  - A small triangular marker at the current data point position
  - Blinks at 600ms rate
```

#### 4.2.3 Beam Activity Visualization

When the beam is active (draining energy), add visual effects to the graph:

```
Beam drain indicator:
  - A vertical RED band at the current time position (rightmost)
  - Width: 4px
  - Color: rgba(255, 0, 0, 0.12), pulsing at 200ms
  - Small text "BEAM" above the graph area, 7px, #f44, blinks at 300ms

Beam recovery indicator:
  - When beam stops and energy recovers, brief GREEN flash on graph area
  - Flash: full graph area, rgba(0, 255, 0, 0.08), fades over 500ms
```

#### 4.2.4 Critical Energy State

When energy is below 15%:

```
Low energy effects:
  - Graph background tints red: rgba(255, 0, 0, 0.04)
  - Red dashed horizontal line at ENERGY_MIN_TO_FIRE (10) threshold
    Color: #f44, 1px dashed (4px dash, 4px gap)
    Label: "MIN" in 6px monospace, #f44, at left edge
  - Graph border pulses red:
    strokeStyle oscillates between '#f80' and '#f44' at 300ms rate
  - Output line glow intensifies: shadowBlur = 6
```

#### 4.2.5 Energy-Full State

When energy is at max capacity:

```
Full energy effects:
  - Intake line turns cyan: #0ff (instead of green)
  - Brief sparkle at the top of the graph area
  - "MAX" indicator: 7px, #0ff, top-right of graph area
  - Graph border briefly flashes cyan (100ms)
```

#### 4.2.6 Spike Markers

When a large energy event occurs (drone deploy, warp juke, bomb), show a marker:

```
Spike marker:
  - Small triangle (4px) pointing down at the time of the event
  - Color: #ff0 for output spikes, #0ff for intake spikes
  - Appears instantly, fades over 3 seconds (alpha 1.0 -> 0)
  - Position: at the x-coordinate corresponding to the event time in the buffer
  - Max 5 markers visible at once (oldest removed)
```

#### 4.2.7 Dithering Aesthetic

Add a subtle dithering pattern over the graph area:

```
Dither overlay:
  - 2x2 pixel checkerboard pattern
  - Alpha: 0.015 (barely visible)
  - Creates a retro screen-door effect
  - Implementation: pre-rendered 2x2 ImageData pattern, tiled
```

#### 4.2.8 Animation Timing Summary

| Effect | Rate | Trigger |
|--------|------|---------|
| Grid pulse | 2000ms sine cycle | Continuous |
| Grid drift | 1px/s rightward | Continuous |
| Intersection blinks | 500ms staggered | Continuous |
| Peak dots | Data-driven | When local max detected |
| NOW indicator blink | 600ms | Continuous |
| Beam BEAM text | 300ms blink | When beam active |
| Low energy pulse | 300ms | Energy < 15% |
| Spike marker fade | 3000ms | On energy spike event |

---

<a name="area-5"></a>
## AREA 5: LOW HEALTH HUD FREAKOUT

### 5.1 Current State Analysis

**Current code**: Health rendering in `renderSystemsZone()` at line 13500. Shield bar at line 13506-13531. Health-reactive indicator at line 13592-13601.

**Current behavior**:
- Shield bar changes color: green (>50%), yellow (25-50%), red (<25%)
- Bar pulses when < 25% health (`pulse: healthPercent < 0.25`)
- Cross indicator in systems zone blinks faster at low health (reactive mode)
- Timer critical warning (last 5s of wave): full-screen red flash (line 21342-21345)
- No panel shake, sparks, smoke, or other distress effects

### 5.2 Progressive Low Health Effects

Three tiers of increasing visual distress, scaled by exact health percentage:

#### 5.2.1 Tier 1: Below 25% Health -- "Warning"

```
SYS.INTG RED PULSE:
  - Systems zone panel border pulses red
  - Pulse rate: lerp(800ms, 300ms, (0.25 - healthPct) / 0.15)
    At 25%: 800ms (slow pulse), at 10%: 300ms (fast pulse)
  - Border color oscillates:
    normal color (#f80) <-> warning color (#f44)
    alpha oscillates: 0.5 to 1.0
  - Implementation:
    const warningPulse = Math.sin(Date.now() / pulseRate) * 0.5 + 0.5;
    ctx.strokeStyle = lerpColor('#f80', '#f44', warningPulse);
    ctx.lineWidth = 1 + warningPulse;
    ctx.strokeRect(x, y, w, panelH);

DANGER SOUND:
  - Continuous low-frequency warning tone
  - Frequency: 80 Hz square wave, volume 0.03
  - Plays every 2 seconds for 300ms
  - Gets more frequent as health drops:
    interval = lerp(2000ms, 500ms, (0.25 - healthPct) / 0.15)
  - Sound tag: SFX.healthWarning()

HUD TINT:
  - Very subtle red tint over all HUD panels
  - Full-screen overlay: rgba(255, 0, 0, alpha)
  - alpha = (0.25 - healthPct) * 0.08 (max 0.02 at 0%)
  - Pulses in sync with SYS.INTG border
```

#### 5.2.2 Tier 2: Below 10% Health -- "Critical"

All Tier 1 effects continue, PLUS:

```
PANEL SHAKE:
  - All HUD panels shake/jitter randomly
  - Shake intensity: lerp(0, 3, (0.10 - healthPct) / 0.05)
    At 10%: 0px shake, at 5%: 3px shake
  - Implementation in renderHUDFrame():
    if (healthPct < 0.10) {
      const shakeIntensity = (0.10 - healthPct) / 0.05 * 3;
      const shakeX = (Math.random() - 0.5) * shakeIntensity;
      const shakeY = (Math.random() - 0.5) * shakeIntensity;
      ctx.save();
      ctx.translate(shakeX, shakeY);
      // ... render all panels ...
      ctx.restore();
    }
  - Shake is per-frame random (creates jitter, not smooth oscillation)
  - Only affects HUD panels, NOT gameplay elements

SPARKS FROM HUD COMPONENTS:
  - Particle system: sparks shoot from HUD panel edges
  - Spawn rate: 2-4 sparks per second per panel
  - Spawn positions: random points along panel borders
  - Spark properties:
    Size: 1-2px
    Color: #ff0 -> #f80 -> #f44 (yellow to orange to red)
    Velocity: 20-60px/s in random direction (biased outward from panel)
    Lifetime: 200-500ms
    Trail: 2-3 previous positions rendered at decreasing alpha
    Gravity: 40px/s^2 downward
  - Implementation: small particle array, updated in updateHUDAnimations
    Max particles: 30 (across all panels)

SMOKE/SPARKS FROM UFO:
  - Small dark smoke puffs emit from UFO sprite
  - Spawn rate: 1-3 per second
  - Puff properties:
    Size: 4-8px radius
    Color: rgba(60, 60, 60, 0.3) fading to rgba(40, 40, 40, 0)
    Drift: upward at 10-20px/s with slight horizontal waver
    Lifetime: 800-1500ms
    Growth: radius increases 50% over lifetime
  - Bright orange sparks also emit from UFO:
    Size: 1-2px
    Color: #f80 with shadowBlur=3
    Velocity: 30-80px/s, random direction
    Lifetime: 100-300ms
```

#### 5.2.3 Tier 3: Below 5% Health -- "Maximum Distress"

All Tier 1 + Tier 2 effects at maximum intensity, PLUS:

```
ENHANCED SHAKE:
  - Shake intensity: 3-5px
  - Occasional big jolts: every 500-1000ms, one frame with 8px shake
  - Big jolt accompanied by a "structural stress" sound (brief metallic creak)

FLICKERING PANELS:
  - Individual panels randomly flicker off and on
  - Flicker: panel alpha drops to 0.1 for 30-80ms, then returns
  - Rate: each panel has 10% chance per 100ms of flickering
  - Creates "systems failing" impression

DISTORTION BANDS:
  - Horizontal bands of distortion across HUD panels
  - 2-4 bands visible at any time
  - Each band:
    Height: 2-6px
    Position: random Y within canvas
    Effect: content within the band shifts 2-4px horizontally
    Color shift: brief green/magenta chromatic aberration
    Duration: 50-150ms per band
  - Implementation: render HUD to offscreen canvas, then draw
    with horizontal offsets per band (simpler: just render select
    thin rects with slight translate before and after)

RED ALERT FLASH:
  - Full-screen red border vignette
  - Inner rect clear, outer 20px border tinted red
  - Vignette alpha: 0.1 + 0.1 * sin(Date.now() / 150)
  - Creates "bridge under fire" atmosphere

ALL INDICATORS SYNCHRONIZED:
  - All panel blink indicators switch to critical mode
  - Color: #f44 (red)
  - Rate: 150ms
  - Pattern: double-blink (as defined in renderNGEIndicator)
  - This is the "red alert" visual state
```

#### 5.2.4 Implementation Notes

```
New state needed:
let healthFreakoutState = {
    sparks: [],      // [{x, y, vx, vy, life, maxLife, color}]
    smokePuffs: [],  // [{x, y, vx, vy, life, maxLife, radius}]
    flickerTimers: {}, // {panelKey: nextFlickerTime}
    lastJoltTime: 0,
    distortionBands: [] // [{y, height, shiftX, life}]
};

Update function: updateHealthFreakout(dt)
  - Called from updateHUDAnimations
  - Updates particle positions, spawns new particles
  - Manages flicker timers and distortion bands

Render function: renderHealthFreakout()
  - Called after renderHUDFrame()
  - Renders sparks, smoke, distortion overlays
  - The panel shake is applied INSIDE renderHUDFrame() via ctx.translate
```

#### 5.2.5 Color Reference

| Effect | Color | Alpha | Rate |
|--------|-------|-------|------|
| Warning border pulse | #f44 | 0.5-1.0 | 300-800ms |
| Screen tint | #f00 | 0.00-0.02 | Synced with border |
| Spark yellow | #ff0 | 1.0 | - |
| Spark orange | #f80 | 1.0 | - |
| Spark red | #f44 | 0.8 | - |
| Smoke puff | #3c3c3c | 0.3->0 | Fade over lifetime |
| UFO spark | #f80 | 1.0 | glow shadowBlur=3 |
| Distortion band | chromatic shift | 0.3 | 50-150ms |
| Red vignette | #f00 | 0.1-0.2 | 150ms pulse |

---

<a name="area-6"></a>
## AREA 6: BIO-MATTER UPLOAD CONDUIT

### 6.1 Current State Analysis

**Current code**: B.MTR display in `renderStatusZone()` at line 13286-13291.

**Current behavior**:
```javascript
// Lines 13286-13291:
if (bioMatter > 0 || (techTree.activeResearch || techTree.researched.size > 0)) {
    renderNGELabel(x + pad + 4, y + 104, 'B.MTR:', '#0a0');
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(bioMatter.toString(), x + pad + 58, y + 104);
}
```

B.MTR is rendered inside the STATUS zone (top-left), near the bottom. It shows as green text on a dark background. The text is small and positioned at y+104 within the 120px panel.

**Problems**:
1. B.MTR is in STATUS zone but conceptually belongs with MISSION/quota
2. Green-on-dark readability is fine, but "white-on-green" readability issue may occur if the label color changes
3. No "upload" visualization -- just a static number
4. No connection between bio-matter collection and research/quota spending

### 6.2 New Design: Bio-Matter Upload Conduit

#### 6.2.1 Move B.MTR to Quota Section

Remove B.MTR from STATUS zone. Add it to the MISSION zone, below the harvest counter.

**New position in MISSION zone**:
```
MISSION zone layout (y=4, h=110):
  Quota bar:      y=4,  h=26   (y+0 to y+26)
  Harvest counter: y=34, h=48  (y+30 to y+78)
  B.MTR display:  y=82, h=24   (y+78 to y+102)  <-- NEW POSITION
  Indicators:     y=104         (y+104)
```

**B.MTR in mission zone**:
```
+--[MISSION.CTL]---------------------------+
| [Quota bar ████████░░░ 12/15]            |
| [icon][icon][icon][icon][icon][icon]      |
|  3     0     1     2     0     0         |
|                                           |
| B.MTR: 42    [upload conduit visual]      |
+--[indicators]----------------------------+
```

#### 6.2.2 Bio-Matter Upload Conduit Component

A new HUD component between the quota/mission area and SYS.INTG (or within the mission zone's lower area). This component visualizes bio-matter as a digital upload stream.

```
Component: "BIO-MATTER UPLOAD CONDUIT"
Position: within mission zone, y=82, spanning width
Height: 24px
Visual: network-style data flow showing biomatter as digital 1s and 0s

Layout:
+--[ B.MTR: 42 ]--[ |||||||||||0101|||||||| ]--+
   ^                ^
   Counter          Upload conduit visualization
```

#### 6.2.3 Upload Conduit Visual Design

The conduit shows a horizontal data stream of binary digits (1s and 0s) flowing from left to right, representing bio-matter being "uploaded" from the UFO to an invisible cache/bank.

```
Conduit design:
  Width: 160px (within mission zone)
  Height: 12px
  Position: centered in mission zone, y=84

  Background: rgba(0, 40, 0, 0.3) with 0.5px #0a0 border

  Data stream:
  - Characters: '1' and '0' in 7px monospace
  - Color: #0f0 (green) at varying alpha (0.2-0.6)
  - Scrolling rightward at 30px/s
  - Character spacing: 8px
  - Total visible characters: ~20

  Bit rate display:
  - Below conduit: "↑ {rate} b/s" in 6px monospace, #0a0
  - Rate = biomatter collected per second (smoothed over 3s window)
  - When collecting: rate shows actual collection speed
  - When idle: "0 b/s" or "IDLE"

  Dithering aesthetic:
  - Alternate pixels in the conduit background form a checkerboard
  - Color: rgba(0, 255, 0, 0.02)
  - Creates retro digital look
```

#### 6.2.4 Collection Animation

When bio-matter is collected (target abducted):

```
Collection burst:
  - Flash: conduit background briefly flashes rgba(0, 255, 0, 0.15) for 100ms
  - Speed up: data stream scrolls 3x faster for 300ms
  - Counter increment: B.MTR number pulses bright (bold, scale 1.0->1.15->1.0 over 200ms)
  - New 1s/0s appear brighter (alpha 0.8) and fade to normal (0.3) over 500ms

  Sound: brief digital chirp (ascending 3-note, 60ms total)
```

#### 6.2.5 End-of-Wave Upload Rush

When the wave ends and remaining bio-matter is "banked":

```
End-of-wave sequence (during WAVE_SUMMARY state):
  Duration: 2 seconds

  Phase 1 (0-500ms): "UPLOADING..."
    - Conduit text changes to "UPLOADING..." in pulsing #0f0
    - Data stream speeds up to 5x normal
    - All characters change to bright green (alpha 0.8)

  Phase 2 (500-1500ms): Fast flashing green + rapid beeps
    - Conduit background flashes: green on/off at 100ms rate
    - Rapid beeps: 8 beeps, ascending pitch, 100ms interval
    - B.MTR counter rapidly counts down to 0 (ticks down at ~30/second)
    - Each tick: tiny spark particle from counter toward conduit

  Phase 3 (1500-2000ms): Cache empties
    - "UPLOAD COMPLETE" text in bright #0f0
    - Counter shows "0"
    - Conduit briefly shows all '1's then fades
    - Brief glow flash (shadowBlur=8, #0f0, fades over 300ms)
```

#### 6.2.6 Pixel-Level Dithering

```
Dithering pattern in conduit area:
  - 2x2 ordered dither matrix applied to conduit background
  - Pattern:
    [1 3]
    [4 2]  (threshold values, normalized 0-1)
  - For each 2x2 pixel block, compare background green intensity
    to threshold. Draw or skip the pixel.
  - Creates retro print/screen effect
  - Very subtle: only affects the background tint, not the text

  Implementation: Pre-compute a 64x12 ImageData with the dither pattern,
  draw it once per frame at conduit position.
```

#### 6.2.7 Readability Fix (White-on-Green)

The original complaint about "white-on-green readability" is addressed by:
1. B.MTR label: now `#0f0` on dark background (rgba(5,8,18,0.5)) -- high contrast
2. B.MTR number: bold 14px in `#fff` (white) on same dark background
3. Avoid placing white text on green-filled areas
4. Label uses `renderNGELabel` which renders with appropriate background

```
Color scheme for B.MTR:
  Label "B.MTR:": #0a0 (dark green), 9px bold monospace
  Value "42": #0f0 (bright green), 14px bold monospace
  Background: inherits mission zone panel bg (dark, 0.5 alpha)
  Border: none (integrated into mission zone)
```

---

<a name="area-7"></a>
## AREA 7: DIAG.SYS ENHANCEMENT

### 7.1 Current State Analysis

**Current code**: `renderDiagnosticsZone()` at line 14193, `diagnosticsState` declaration, `diagnosticsZone` in `getHUDLayout()` at line 12881.

**Current behavior**:
- Position: `{ x: 10, y: canvas.height - 330, w: leftW(210), h: 100 }`
- Panel: 100px tall, color #0af, cut corner TL
- Header: "DIAG.SYS" in bold 9px
- Two alternating blink lights (square, #0af)
- Lines: dynamic list based on game state (NRG.MAIN, BEAM.SYS, SHLD.INTG, drones, coords, ordnance, threats)
- Scroll: auto-scroll at 0.4px/frame when lines exceed viewable area
- Line height: 12px, max visible: ~6 lines
- Each line: label (left), value (right), status dot (far right)

**Problems**:
1. Panel is too short (100px) for the amount of data
2. Only text-based -- no bar graphs or sparklines
3. Limited to ~6 visible lines, scrolling is slow
4. No visual variety in data presentation
5. Status dots are small and hard to read

### 7.2 Enhanced DIAG.SYS Design

#### 7.2.1 Taller Panel

Increase panel height from 100px to 160px:

```
New layout:
  diagnosticsZone: { x: margin, y: canvas.height - 390, w: leftW, h: 160 }

  This pushes the panel up by 60px:
  - DIAG.SYS: y = 720 - 390 = 330 (was 390)
  - OPS.LOG:  y = 720 - 220 = 500 (unchanged)
  - Commander: y = 720 - 110 = 610 (unchanged)

  Gap between DIAG.SYS bottom (330+160=490) and OPS.LOG top (500) = 10px. Good.

  With 160px height:
    Header: 20px
    Viewable area: 136px (160 - 24)
    Lines at 12px: 11 visible lines (up from 6)
    Lines at 14px (more readable): 9 visible lines
```

**Use 14px line height** for better readability and more room for inline graphics.

#### 7.2.2 New Line Types

In addition to text lines, add bar graph and sparkline line types:

```
LINE TYPE 1: Standard text (existing)
  [LABEL]          [VALUE]  [dot]
  NRG.MAIN         87/100   (*)

LINE TYPE 2: Bar graph
  [LABEL]  [████████░░░░]  [pct]
  NRG.MAIN [████████░░░░]  87%

  Bar: 60px wide, 8px tall
  Fill: status-colored (green/amber/red)
  Background: rgba(255,255,255,0.06)
  Percentage: 7px monospace, right of bar

LINE TYPE 3: Sparkline
  [LABEL]  [_/\_/\__/\]  [val]
  NRG.RATE [_/\_/\__/\]  +14/s

  Sparkline: 50px wide, 10px tall
  Draws last 20 data points as a tiny line graph
  Color: matches status (green/amber/red)
  No axes, no labels -- just the line shape
```

#### 7.2.3 Enhanced Data Points

Add more diagnostic lines for gameplay-relevant information:

```
ALWAYS VISIBLE (after pg1 unlock):
  1. NRG.MAIN   [████████░░]  87%    (bar graph type)
  2. BEAM.SYS   ACTIVE / IDLE / DEPLETED  (text type)
  3. SHLD.INTG  [██████░░░░]  54%    (bar graph type)
  4. NRG.RATE   [sparkline]  +14/s   (sparkline type) -- NEW
  5. THR.PROX   3 HOSTILE             (text type)

CONDITIONAL:
  6. DRN.HARV   3/3 ACTIVE            (text type, if harvesters owned)
  7. DRN.ATTK   2/2 ACTIVE            (text type, if battle drones owned)
  8. COORD.H    NRG [████░░]  67%     (bar graph, per coordinator)
  9. COORD.A    NRG [██░░░░]  34%     (bar graph, per coordinator)
  10. ORD.MSL   2/3 RDY               (text type, if missiles owned)
  11. ORD.BMB   7/9                    (text type, if bombs owned)
  12. SPD.MOD   +30%                   (text type, if speed bonus)
  13. REV.CELL  x2                     (text type, if energy cells)
  14. SH.XFER   RDY / 12s             (text type, if shield transfer tech)
  15. SWM.SHLD  ABS: 45               (text type, if swarm shield tech)
  16. COMBO     x5 (1.5x)             (text type, if combo active) -- NEW
  17. WAVE.T    1:23                   (text type) -- NEW: wave timer
```

#### 7.2.4 NRG.RATE Sparkline Data

New data collection for energy rate sparkline:

```
Data: last 20 net energy deltas (sampled every 500ms)
  netDelta = frameIntake - frameOutput (from energyTimeSeries)
  Store in a small ring buffer: Float32Array(20)

Sparkline rendering:
  Width: 50px
  Height: 10px
  Points: 20, evenly spaced (2.5px apart)
  Y-axis: auto-scaled to [-peak, +peak]
  Zero line: middle of sparkline, rgba(255,255,255,0.06), 0.5px
  Line above zero: #0f0 (intake exceeds output)
  Line below zero: #f44 (output exceeds intake)
  Line width: 1px

Value display: "+14/s" or "-8/s" (net energy per second)
  Color: #0f0 if positive, #f44 if negative
```

#### 7.2.5 Scroll Enhancement

With the taller panel, scrolling behavior improves:

```
Scroll speed: 0.3px/frame (slightly slower for readability)
Pause at top/bottom: 3 seconds (up from 2)
Scroll indicator: tiny arrow (3px) at top/bottom of viewable area
  when content extends beyond view
  Arrow blinks at 800ms rate
  Color: #0af at 40% alpha
```

#### 7.2.6 Visual Polish

```
Section dividers:
  Between logical groups of data, add thin horizontal lines:
  Color: rgba(0, 170, 255, 0.1)
  Width: full panel width - 8px margins
  Height: 0.5px

  Groups:
  - Core systems (NRG, BEAM, SHLD, NRG.RATE)
  - Fleet (drones, coordinators)
  - Ordnance (missiles, bombs)
  - Misc (speed, cells, techs)
  - Situational (threats, combo, timer)

Data stream background:
  Very faint scrolling hex data behind the text
  Reuse renderNGEDataStream(x, y, w, h, '#0af') at alpha 0.03
  Adds the "data is alive" feel
```

#### 7.2.7 Layout Dimensions

```
Panel: 210px wide x 160px tall
Header area: 20px (includes panel label and blink lights)
Content area: 136px (160 - 24px for header and bottom padding)
Line height: 14px
Visible lines: 9 (without scrolling)
Max data lines: 17 (with scrolling)
Bar graph: 60px wide x 8px tall, positioned after label (label takes ~60px)
Sparkline: 50px wide x 10px tall, positioned after label
Status dot: 3px radius, positioned at x+w-pad-4
```

---

<a name="area-8"></a>
## AREA 8: SCAN LINES ENHANCEMENT

### 8.1 Current State Analysis

**Current code**: `renderNGEScanlines()` at line 12420.

**Current behavior**:
- Renders within clipped rectangles passed as parameters
- Scrolling scanlines at 3px intervals, scrolling at 120px/s
- Glitch bands: intermittent bright bars that appear based on deterministic pseudo-random timing
- Horizontal tears: occasional 2px shifted duplicate lines
- Called from: `renderStatusZone` (line 13236, alpha 0.012) and `renderCommanderZone` (line 14153, alpha 0.025)
- Only covers individual panels, not full columns

**Scan line offset**: Updated in `updateHUDAnimations()` (line 14584): `scanlineOffset = (scanlineOffset + dt * 120) % 300`

**Problems**:
1. Scan lines only cover individual panels, not full-height columns
2. Linear movement speed (constant 120px/s)
3. Glitching is deterministic and subtle -- not responsive to game state
4. No full-column coverage (left and right HUD columns)

### 8.2 Enhanced Scan Lines Design

#### 8.2.1 Full-Column Scan Lines

Add two new full-column scan line columns that run from top to bottom of the canvas:

```
LEFT COLUMN:
  x: 0
  y: 0
  w: statusZone.x + statusZone.w + 10 (covers status + weapons + diag + opslog + commander)
  h: canvas.height

RIGHT COLUMN:
  x: systemsZone.x - 10
  y: 0
  w: canvas.width - systemsZone.x + 10 (covers systems + NRG.FLOW + fleet)
  h: canvas.height
```

These render AFTER all panel content but BEFORE the boot overlay, ensuring scan lines appear over the completed panels.

#### 8.2.2 Non-Linear Movement Speed

Replace constant speed with variable speed:

```
Scan line movement model:
  Base speed: 80px/s
  Speed modulation: sinusoidal variation
    speed = 80 + 60 * sin(Date.now() / 3000)
    Range: 20px/s to 140px/s
    Period: ~19 seconds for full speed cycle

  This creates a "breathing" feel where scan lines sometimes
  crawl slowly and sometimes sweep quickly.

  Additional: occasional speed bursts
    Every ~5 seconds (randomized), speed doubles for 200ms
    Creates brief "data refresh" visual

  Implementation:
    const baseSpeed = 80;
    const modSpeed = 60 * Math.sin(Date.now() / 3000);
    const burstMod = (Date.now() % 5000 < 200) ? 2.0 : 1.0;
    const speed = (baseSpeed + modSpeed) * burstMod;
    hudAnimState.scanlineOffset = (hudAnimState.scanlineOffset + dt * speed) % 300;
```

#### 8.2.3 Health-Linked Glitching

Glitch effects increase with lower health:

```
Glitch intensity levels:
  Health > 50%:  glitchIntensity = 0.0 (no extra glitching)
  Health 25-50%: glitchIntensity = 0.2 (subtle)
  Health 10-25%: glitchIntensity = 0.5 (noticeable)
  Health 5-10%:  glitchIntensity = 0.8 (heavy)
  Health < 5%:   glitchIntensity = 1.0 (maximum)

Glitch types:

1. HORIZONTAL SHIFT (all intensities)
  - Random horizontal displacement of scan line segments
  - At intensity 0.2: occasional 1px shifts, 5% of lines
  - At intensity 1.0: frequent 2-4px shifts, 30% of lines
  - Implementation:
    const shiftChance = 0.05 + glitchIntensity * 0.25;
    const maxShift = 1 + Math.floor(glitchIntensity * 3);
    for each scanline:
      if (Math.random() < shiftChance):
        shift = (Math.random() - 0.5) * maxShift * 2;
        render line at x + shift

2. COLOR SHIFT / CHROMATIC ABERRATION (intensity >= 0.3)
  - Brief moments where RGB channels separate
  - Duration: 30-80ms per occurrence
  - Frequency: glitchIntensity * 2 per second
  - Effect: render the same line 3 times at +1px, 0, -1px offset
    with red, green, blue tints respectively
  - Alpha: 0.04 * glitchIntensity
  - Implementation:
    if (chromaticActive) {
      ctx.fillStyle = `rgba(255, 0, 0, ${0.04 * glitchIntensity})`;
      ctx.fillRect(x - 1, lineY, w, 1);
      ctx.fillStyle = `rgba(0, 255, 0, ${0.04 * glitchIntensity})`;
      ctx.fillRect(x, lineY, w, 1);
      ctx.fillStyle = `rgba(0, 0, 255, ${0.04 * glitchIntensity})`;
      ctx.fillRect(x + 1, lineY, w, 1);
    }

3. BRIEF STATIC (intensity >= 0.5)
  - Rectangular blocks of noise/static overlay
  - Size: 20-60px wide, 4-12px tall
  - Duration: 50-120ms
  - Frequency: glitchIntensity * 1.5 per second
  - Content: random gray pixels (2x2 blocks)
  - Alpha: 0.08 * glitchIntensity
  - Position: random within the scan line column

4. SCAN LINE DROPOUT (intensity >= 0.7)
  - Brief sections where scan lines disappear entirely
  - Height: 10-30px band
  - Duration: 80-200ms
  - Within the dropout band: slightly brighter background (alpha +0.02)
  - Edge of dropout: single bright line (alpha 0.1)
```

#### 8.2.4 Periodic HUD Glitching (Non-Health-Related)

Even at full health, subtle periodic glitching occurs:

```
Ambient glitch schedule:
  Every 8-15 seconds (randomized): one subtle glitch event

  Event types (randomly selected):
  a) Single-frame horizontal tear:
     One scan line duplicated 2px below at 50% alpha (1 frame = 16ms)

  b) Brief brightness flicker:
     All scan lines in one column flash 2x normal alpha for 30ms

  c) Micro-static:
     5x5px block of static noise appears for 50ms
     Position: random within HUD column
     Alpha: 0.04

These ambient glitches are NOT gameplay-affecting. They exist purely for
atmosphere -- the HUD is alien tech, slightly imperfect.
```

#### 8.2.5 Implementation Notes

```
New function: renderFullColumnScanlines()
  Called from renderHUDFrame() after all panels, before boot overlay

  Renders two full-height columns with:
  - Scrolling scan lines (non-linear speed)
  - Health-reactive glitch effects
  - Ambient periodic glitches

  Parameters computed from game state:
  - healthPct from ufo or finalHealth
  - glitchIntensity from healthPct
  - scanlineOffset from hudAnimState

New state:
  hudAnimState.lastAmbientGlitch = 0;  // timestamp
  hudAnimState.nextAmbientGlitch = 0;  // scheduled time
  hudAnimState.chromaticTimer = 0;     // chromatic aberration timer
  hudAnimState.staticBlocks = [];      // [{x,y,w,h,life}]
```

---

<a name="area-9"></a>
## AREA 9: MORE COOL SOUNDS

### 9.1 Current Sound Analysis

**Current SFX** (from SFX object starting around line 621):
- `bootPanelStart`: CRT click (square wave 800->200Hz, 50ms)
- `bootPanelOnline`: Rising chirp (sine 400->1200Hz, 150ms)
- `bootDataChatter`: Data transmission chattering
- `bootMissileSkip`: Skip sound for missing systems
- `bootAllOnline`: All-systems confirmation chord
- Various gameplay sounds: beam, explosions, pickups, etc.

### 9.2 New Sound Specifications

#### 9.2.1 Boot Sequence Sounds (Area 2 Related)

```
SFX.alienStartupChime:
  // Mac-like but alien startup sound
  // A warm, resonant chord that feels technological and organic
  Duration: 800ms
  Structure:
    - Base: C3 (130.8 Hz) sine wave, 0.04 gain
    - Harmony: E4 (329.6 Hz) triangle wave, 0.03 gain
    - Shimmer: G5 (784.0 Hz) sine wave, 0.015 gain
    - All frequencies slide UP by 10% over the duration (alien pitch bend)
    - Envelope: attack 10ms, sustain 500ms, release 290ms
    - Reverb: convolution or delay feedback, 200ms delay, 0.3 feedback
  Trigger: t=-1.000s in boot sequence (after CRT turn-on)

SFX.crtTurnOn:
  // CRT power-on thunk + rising hum
  Duration: 300ms
  Structure:
    - Thunk: noise burst, bandpass 60-200Hz, 0.06 gain, 30ms
    - Hum: sine 60Hz -> 180Hz ramp over 300ms, 0.03 gain
    - Crackle: noise * envelope (sparse clicks), 0.02 gain
  Trigger: t=-1.300s (TV turn-on effect start)

SFX.borderTraceCorner:
  // Quick tone for each corner during border trace
  // Ascending: C4, E4, G4, C5
  Duration: 120ms each
  Structure:
    - Sine wave at the specified frequency
    - Gain: 0.04
    - Envelope: attack 5ms, decay 115ms exponential
    - Slight detune: +3 cents (alien imperfection)
  Trigger: One per corner (4 tones total during trace)

SFX.alienQuantumOnline:
  // "All systems online" confirmation sound
  Duration: 400ms
  Structure:
    - Quick ascending arpeggio: C4->E4->G4->C5, 50ms per note
    - Final note sustains with shimmer (slight vibrato at 6Hz)
    - Gain: 0.05
    - Reverb tail: 200ms
  Trigger: t=4.250s (post-boot feedback)
```

#### 9.2.2 Health Warning Sounds (Area 5 Related)

```
SFX.healthWarning:
  // Low-frequency warning pulse
  Duration: 300ms
  Structure:
    - Square wave at 80Hz, gain 0.025
    - Amplitude modulation: 4Hz tremolo
    - Envelope: attack 20ms, sustain 200ms, release 80ms
    - Filter: lowpass 200Hz to keep it rumbly
  Trigger: Periodic during low health (interval based on health %)

SFX.structuralStress:
  // Metallic creak for big jolt events
  Duration: 200ms
  Structure:
    - Filtered noise: bandpass 800-2000Hz
    - Gain: 0.03
    - Pitch slide: 1500Hz -> 800Hz over duration (creaking metal)
    - Brief reverb: 100ms
  Trigger: Health < 5%, every 500-1000ms with big jolt

SFX.panelFlicker:
  // Quick electric pop for panel flicker
  Duration: 30ms
  Structure:
    - Noise burst, gain 0.02
    - Highpass 2000Hz (tinny electric sound)
    - Very brief
  Trigger: When a panel flickers off (health < 5%)
```

#### 9.2.3 Bio-Matter Upload Sounds (Area 6 Related)

```
SFX.bioMatterCollect:
  // Digital chirp for biomatter collection
  Duration: 80ms
  Structure:
    - Sine sweep: 400Hz -> 800Hz, 40ms
    - Then: 800Hz -> 1200Hz, 40ms
    - Gain: 0.03
    - Creates quick ascending double-beep
  Trigger: When bio-matter is collected

SFX.uploadComplete:
  // Satisfying upload-complete sound
  Duration: 500ms
  Structure:
    - Rapid 8-beep sequence: each 40ms
    - Frequencies: 500, 550, 600, 650, 700, 750, 800, 1000Hz
    - Gain: 0.03 each, increasing slightly
    - Final beep has 200ms reverb tail
  Trigger: End-of-wave upload completion

SFX.uploadTick:
  // Tiny tick for each bio-matter unit uploading
  Duration: 15ms
  Structure:
    - Square wave at 2000Hz, gain 0.01
    - 15ms pulse
  Trigger: Each tick during end-of-wave countdown
```

#### 9.2.4 Tech Research Sounds (Area 1 Related)

```
SFX.techNodeComplete:
  // Node completion celebration
  Duration: 400ms
  Structure:
    - Ascending triad: root, major third, fifth (based on track)
    - PG track: warm tones (sine, 200-400Hz range)
    - DC track: bright tones (triangle, 400-800Hz range)
    - DN track: punchy tones (square, 150-300Hz range)
    - Gain: 0.04
    - Brief shimmer (white noise at 0.01 gain, 100ms)
  Trigger: When a tech research completes

SFX.techNodeResearchTick:
  // Subtle tick while research progresses
  Duration: 20ms
  Structure:
    - Sine at 600Hz, gain 0.008
    - Very subtle, almost subliminal
    - Plays every 5 seconds during active research
  Trigger: Periodic during research
```

#### 9.2.5 General HUD Sounds

```
SFX.panelSlideIn:
  // Whoosh for panel slide-in animation
  Duration: 200ms
  Structure:
    - Filtered noise sweep: highpass 200Hz -> 4000Hz
    - Gain: 0.02
    - Creates "whoosh" feel
  Trigger: When weapons/fleet/diag/opslog panels slide in

SFX.glitchBurst:
  // Brief digital glitch for scan line glitching
  Duration: 40ms
  Structure:
    - Bitcrushed noise (8-bit sample rate reduction)
    - Gain: 0.015
    - Creates digital artifact sound
  Trigger: When health-linked glitch event occurs (rate varies)

SFX.indicatorCritical:
  // Urgent beep for indicator entering critical state
  Duration: 100ms
  Structure:
    - Square wave at 1200Hz, gain 0.03
    - Two beeps: 30ms on, 10ms off, 30ms on, 30ms fade
    - Matches double-blink indicator pattern
  Trigger: When any indicator transitions to critical state
```

#### 9.2.6 Volume Mixing Reference

All new sounds should follow the existing volume conventions:

| Category | Volume Range | Priority |
|----------|-------------|----------|
| Boot sequence | 0.03-0.06 | Medium |
| Gameplay feedback | 0.02-0.05 | High |
| Ambient/atmosphere | 0.008-0.02 | Low |
| Warning/alert | 0.025-0.04 | High |
| UI state changes | 0.015-0.03 | Medium |

---

## APPENDIX A: Complete Layout Map at 1280x720 (Updated)

```
y=0 ====================================================================
                    TECH TREE AREA (y=4 to y=70)
x=10            x=220 x=226                    x=496  x=500       x=780
+--[STATUS]----+      +--[TECH TREE]----------+      +--[MISSION]+
| Score HI:    |      | PG: [==]--[==]--[]--[]-[]    | Quota bar  |
| WAVE 3 1:45  |      | DC: [==]--[]--[]--[]--[]     | Harvest    |
| 3x (1.5x)   |      | DN: [==]--[==]--[]--[]--[]   | B.MTR: 42  |
|              |      | RSRCH: [1] PG2 45s     |     | [conduit]  |
+-------y=130--+      +------------------------+     +-----y=114-+

y=140                                                x=1075      x=1270
+--[ORD.SYS]--+                                      +--[SYS.INTG]---+
| BOMBS [Z/B] |                                      | SHLD bar      |
|  [O][O][O]  |                                      | REVIVE [*][*] |
|  [O][O][O]  |              PLAY AREA               | SPD +20%      |
|  [O][o][o]  |                                      +----y=98--------+
| MISSILES    |           (UFO, targets,             +--[NRG.FLOW]----+
|  A[>>>>]    |            tanks, beam)              | Graph area     |
|  B[>>>>]    |                                      | .....__/\_     |
+---------y~340+                                      +----y=178------+
                                                     +--[FLEET.CMD]--+
y=330                                                 | COORD.H 12s   |
+--[DIAG.SYS]-+                                      |  H-01 8s      |
| NRG.MAIN 87%|                                      |  H-02 11s     |
| BEAM.SYS ACT|                                      | COORD.A 7s    |
| SHLD.INTG 54|                                      |  A-01 10s     |
| NRG.RATE +14|                                      +----y~480------+
| DRN.HARV 3/3|
| COORD.H 67% |
| THR.PROX 3  |
| COMBO x5    |
| WAVE.T 1:23 |
+------y=490--+

y=500
+--[OPS.LOG]--+
| > +3 BIO    |
| > TANK DESTR|
| > SHIELD -15|
| > COORD LOW |
+------y=600--+

y=610
+--[COMMANDER]+
| [*] INCOMING|
| [face] text.|
+------y=710--+
y=720 ====================================================================
```

## APPENDIX B: Complete Color Reference (Updated)

| Zone | Primary | Secondary | Warning | Critical | Background Tint |
|------|---------|-----------|---------|----------|-----------------|
| Status | #0ff | #445 | #ff0 | #f44 | - |
| Mission | #0a0 | #0f0 | #ff0 | #f00 | - |
| Systems | #f80 | #fc0 | #fc0 | #f33 | - |
| Weapons | #f44 | #f80 | #f40 | #f00 | - |
| Fleet | #48f | #8af | #fc0 | #f44 | - |
| Commander | #0f0 | #0a0 | -- | -- | - |
| OPS.LOG | #8af | #aaf | #fc0 | #f44 | - |
| DIAG.SYS | #0af | #0df | #fc0 | #f44 | - |
| Tech Tree PG | #f80 | #ffa040 | - | - | rgba(255,136,0,0.04) |
| Tech Tree DC | #48f | #6af | - | - | rgba(68,136,255,0.04) |
| Tech Tree DN | #d60 | #e80 | - | - | rgba(221,102,0,0.04) |
| NRG.FLOW OUT | #f44 | - | - | - | gradient fill |
| NRG.FLOW IN | #0f0 | - | - | - | gradient fill |
| Bio Upload | #0f0 | #0a0 | - | - | rgba(0,40,0,0.3) |
| Boot border | #0f0 | #fff | - | - | - |
| Boot logo | #0ff | - | - | - | rgba(0,255,255,0.06) |

## APPENDIX C: Animation Timing Master Reference

| System | Animation | Duration/Rate | Trigger |
|--------|-----------|---------------|---------|
| Tech Tree | Particle drift | 0.2-0.8 px/frame | Continuous |
| Tech Tree | Particle blink | 100-400ms on, 200-800ms off | Continuous |
| Tech Tree | Pixel noise | 1 frame per 120ms | Continuous |
| Tech Tree | Research glow | 800ms sine cycle | During research |
| Tech Tree | Connection dash | 30px/s offset | Continuous |
| Tech Tree | Node appear | 400ms fade+scale | On research complete |
| Boot | CRT turn-on | 300ms | Boot start |
| Boot | Logo display | 600ms | After CRT |
| Boot | Logo dissolve | 200ms | Before border trace |
| Boot | Border trace | 750ms total | After logo |
| Boot | Corner pause | 20ms per corner | During trace |
| Boot | Post-boot text | 500ms type + 200ms fade | After all panels online |
| NRG.FLOW | Grid pulse | 2000ms sine | Continuous |
| NRG.FLOW | Grid drift | 1px/s | Continuous |
| NRG.FLOW | NOW blink | 600ms | Continuous |
| NRG.FLOW | Beam indicator | 300ms blink | When beam active |
| NRG.FLOW | Spike marker | 3000ms fade | On energy spike |
| Health FX | Warning pulse | 300-800ms | Health < 25% |
| Health FX | Panel shake | Per-frame random | Health < 10% |
| Health FX | Spark lifetime | 200-500ms | Health < 10% |
| Health FX | Smoke lifetime | 800-1500ms | Health < 10% |
| Health FX | Panel flicker | 30-80ms | Health < 5% |
| Health FX | Distortion band | 50-150ms | Health < 5% |
| Health FX | Red vignette | 150ms pulse | Health < 5% |
| Bio Upload | Collection flash | 100ms | On collect |
| Bio Upload | Speed burst | 300ms at 3x | On collect |
| Bio Upload | Counter pulse | 200ms scale | On collect |
| Bio Upload | End-wave upload | 2000ms total | Wave end |
| Scan Lines | Base speed | 80px/s +/- 60 | Continuous |
| Scan Lines | Speed modulation | 19s period | Continuous |
| Scan Lines | Speed burst | 200ms at 2x | Every ~5s |
| Scan Lines | Ambient glitch | Every 8-15s | Continuous |
| Scan Lines | Health glitch | Scales with health | Health < 50% |

## APPENDIX D: New State Variables Summary

```javascript
// Tech tree horizontal visualization
let techTreeAnimState = {
    particles: [],           // Generated deterministically, no storage needed
    dashOffset: 0,           // Animated dash offset for connections
    researchGlowPhase: 0,   // Sine phase for researching node glow
    nodeAppearAnims: {},     // {nodeId: {startTime, progress}}
};

// Enhanced boot sequence
let preBootState = {
    phase: 'inactive',       // 'inactive'|'crt'|'logo'|'dissolve'|'trace'|'panel_boot'|'post'
    timer: 0,
    crtProgress: 0,          // 0-1 for CRT turn-on effect
    logoAlpha: 0,            // Logo visibility
    logoDissolveBlocks: [],  // Pre-computed dissolution order
    traceProgress: 0,        // 0-1 for border trace
    postTextIndex: 0,        // Character index for post-boot text
    postTextAlpha: 1.0,      // Fade-out alpha
};

// Health freakout effects
let healthFreakoutState = {
    sparks: [],              // [{x, y, vx, vy, life, maxLife, color}]
    smokePuffs: [],          // [{x, y, vx, vy, life, maxLife, radius}]
    flickerTimers: {},       // {panelKey: nextFlickerTime}
    lastJoltTime: 0,
    distortionBands: [],     // [{y, height, shiftX, life}]
    warningToneTimer: 0,
};

// Bio-matter upload conduit
let bioUploadState = {
    streamOffset: 0,         // Horizontal offset for scrolling binary stream
    bitRate: 0,              // Smoothed collection rate
    bitRateSamples: [],      // Last 3s of collection timestamps
    flashAlpha: 0,           // Collection flash brightness
    uploadPhase: 'idle',     // 'idle'|'uploading'|'complete'
    uploadCounter: 0,        // Countdown during end-of-wave upload
    uploadTicks: 0,          // Tick counter for sound
};

// Enhanced DIAG.SYS
let diagEnhancedState = {
    energyRateBuffer: new Float32Array(20), // Sparkline data
    energyRateWriteIdx: 0,
    energyRateSampleTimer: 0,
};

// Enhanced scan lines
// (Added to hudAnimState):
hudAnimState.lastAmbientGlitch = 0;
hudAnimState.nextAmbientGlitch = 0;
hudAnimState.chromaticTimer = 0;
hudAnimState.staticBlocks = [];       // [{x,y,w,h,life}]
hudAnimState.scanlineSpeedMod = 1.0;  // Non-linear speed multiplier
```

## APPENDIX E: Performance Budget

| Feature | Estimated Cost/Frame | Notes |
|---------|---------------------|-------|
| Tech tree nodes (15) | 0.3ms | 15 fillRect + 15 text + connections |
| Tech tree particles | 0.2ms | ~50 particles, simple fill ops |
| Tech tree backgrounds | 0.1ms | 3 fillRect + particle noise |
| Pre-boot CRT/logo | 0.5ms | Only during 1.5s pre-boot phase |
| Border trace | 0.2ms | Only during 0.75s trace phase |
| NRG.FLOW enhanced | 0.4ms | Was 0.3ms, +grid animation +glow |
| Health sparks (30 max) | 0.2ms | Only when health < 10% |
| Health smoke (10 max) | 0.1ms | Only when health < 10% |
| Health distortion | 0.1ms | Only when health < 5% |
| Bio upload conduit | 0.15ms | Scrolling text + dither |
| DIAG.SYS (taller) | 0.25ms | Was 0.2ms, +bar graphs +sparklines |
| Full-column scan lines | 0.3ms | Two columns, full height |
| Health-linked glitch | 0.1ms | Variable, scales with health |

**Total new rendering budget**: ~2.9ms worst case (all systems active, low health)
**Current HUD budget**: ~3-4ms
**Combined**: ~6-7ms (well within 16.7ms at 60fps)
**Typical case** (healthy, mid-game): ~1.5ms additional

---

*End of HUD Design Pass 2 Visual Specification*
