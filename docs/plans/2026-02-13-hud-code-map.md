# HUD Code Map - game.js

> Exhaustive code map for HUD Design Pass 2 implementation.
> All line numbers verified against `/Users/mfelix/code/alien-abductorama/js/game.js` (~21,373 lines).

---

## 1. HUD State Variables

### hudAnimState (Lines 12643-12658)
Initial declaration at line 12643, reset in `startGame()` at line 11991.

```js
let hudAnimState = {
    weaponsPanelVisible: false,   // true when bombs/missiles unlocked
    weaponsPanelSlide: 0,         // 0..1 slide-in progress
    fleetPanelVisible: false,     // true when drones/coordinators exist
    fleetPanelSlide: 0,           // 0..1 slide-in progress
    commanderPanelSlide: 0,       // 0..1 slide-in progress
    diagPanelVisible: false,      // true after beamConduit (pg1) research
    diagPanelSlide: 0,            // 0..1 slide-in progress
    opsLogPanelVisible: false,    // true after wave >= 2
    opsLogPanelSlide: 0,          // 0..1 slide-in progress
    energyFlowPhase: 0,           // continuous phase for flow animation
    scanlineOffset: 0,            // scrolling scanline Y offset
    energyPulseTimer: 0,          // timer before next pulse sweep
    energyPulseActive: false,     // true during active sweep
    energyPulseY: 0               // current Y position of sweep line
};
```

Slide speed: all panels use `+0.04` per frame except commander which uses `+0.05`.
Slide-out (commander only): `-0.05` per frame.
All slides use `easeOutCubic(t)` (line 13220: `1 - Math.pow(1 - t, 3)`).

### hudBootState (Lines 12660-12701)

```js
let hudBootState = {
    phase: 'idle',       // 'idle' | 'booting' | 'complete'
    timer: 0,
    duration: 3.5,

    panels: {
        status:      { active: false, startTime: 0.0,  duration: 1.2, progress: 0, phase: 'waiting' },
        mission:     { active: false, startTime: 0.15, duration: 1.0, progress: 0, phase: 'waiting' },
        systems:     { active: false, startTime: 0.3,  duration: 1.0, progress: 0, phase: 'waiting' },
        weapons:     { active: false, startTime: 0.6,  duration: 1.4, progress: 0, phase: 'waiting' },
        fleet:       { active: false, startTime: 0.9,  duration: 1.4, progress: 0, phase: 'waiting' },
        commander:   { active: false, startTime: 1.2,  duration: 1.0, progress: 0, phase: 'waiting' },
        diagnostics: { active: false, startTime: 0.45, duration: 1.3, progress: 0, phase: 'waiting' },
        opslog:      { active: false, startTime: 1.1,  duration: 1.0, progress: 0, phase: 'waiting' }
    },

    techSnapshot: {
        hasBombs, hasMissiles, missileGroupCount, hasHarvesters,
        hasBattleDrones, droneSlots, hasCoordinators, wave,
        quotaTarget, maxHealth, hasEnergyCells, techResearched
    },

    bootLines: {
        status: [], mission: [], systems: [], weapons: [],
        fleet: [], commander: [], diagnostics: [], opslog: []
    }
};
```

Panel phases: `'waiting'` -> `'booting'` -> `'online'`

### missionCommanderState (Lines 12703-12716)

```js
let missionCommanderState = {
    visible: false,
    dialogue: '',
    typewriterIndex: 0,
    typewriterTimer: 0,          // chars shown = floor(timer * 25)
    displayTimer: 0,
    displayDuration: 6,          // seconds before auto-dismiss
    slideProgress: 0,
    emotion: 'neutral',          // 'neutral' | 'angry' | 'pleased'
    cooldownTimer: 15,
    minCooldown: 20,
    maxCooldown: 40,
    triggeredThisWave: false
};
```

### energyTimeSeries (Lines 12718-12729)

```js
let energyTimeSeries = {
    buffer: new Float32Array(180),
    intakeBuffer: new Float32Array(180),
    outputBuffer: new Float32Array(180),
    writeIndex: 0,
    sampleTimer: 0,
    sampleInterval: 1/6,  // ~166ms = 6 samples/sec, 30s history
    frameIntake: 0,
    frameOutput: 0,
    peakValue: 100,
    smoothPeak: 100
};
```

### diagnosticsState (Lines 12731-12735)

```js
let diagnosticsState = {
    scrollOffset: 0,
    scrollDirection: 1,
    scrollPauseTimer: 0
};
```

### opsLogState (Lines 12737-12742)

```js
let opsLogState = {
    events: [],           // { text, color, age, bold, timestamp }
    maxEvents: 20,
    throttle: {},
    throttleWindow: 500   // ms between same-type events
};
```

### Supporting Functions
- `pushOpsLogEvent(text, color, opts)` - Lines 12744-12755
- `updateOpsLog(dt)` - Lines 12757-12764 (events expire after 15s)
- `trackEnergyDelta(amount, isIntake)` - Line 12766
- `updateEnergyTimeSeries(dt)` - Lines 12771-12792

### damageFlash (Line 7217)
```js
let damageFlash = 0; // Red flash on damage
```
Set to 0.15 on hit (line 6278), 0.3 on research complete (line 10410). Rendered at line 21355.

---

## 2. Layout System

### getHUDLayout() (Lines 12858-12884)

```js
function getHUDLayout() {
    const margin = 10;
    const leftW = Math.min(210, canvas.width * 0.18);
    const rightW = Math.min(195, canvas.width * 0.16);
    const centerW = 280;
    const centerX = (canvas.width - centerW) / 2;

    // Fleet Y: pushes down when energy graph visible
    let fleetY = 108;
    if (techFlags.beamConduit) {
        let graphY = margin + 88 + 8;                     // base: 106
        if (playerInventory.speedBonus > 0) graphY += 22;
        if (playerInventory.maxEnergyBonus > 0) graphY += 14;
        fleetY = graphY + 72 + 10;                        // energy graph height + gap
    }

    return {
        statusZone:      { x: margin,                          y: margin,             w: leftW,                                  h: 120 },
        missionZone:     { x: centerX,                         y: 4,                  w: centerW,                                h: 110 },
        systemsZone:     { x: canvas.width - rightW - margin,  y: margin,             w: rightW,                                 h: 90  },
        weaponsZone:     { x: margin,                          y: 140,                w: leftW,                                  h: 200 },
        fleetZone:       { x: canvas.width - rightW - margin,  y: fleetY,             w: rightW,                                 h: 300 },
        commanderZone:   { x: margin,                          y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22),    h: 100 },
        diagnosticsZone: { x: margin,                          y: canvas.height - 330, w: leftW,                                 h: 100 },
        opsLogZone:      { x: margin,                          y: canvas.height - 220, w: Math.min(240, canvas.width * 0.20),    h: 100 }
    };
}
```

**Key layout constants:**
- `margin`: 10px
- `leftW`: min(210, 18% of canvas width)
- `rightW`: min(195, 16% of canvas width)
- `centerW`: 280px fixed
- `centerX`: centered horizontally

**Zone positions summary:**
| Zone | Position | Size |
|------|----------|------|
| statusZone | top-left (10, 10) | leftW x 120 |
| missionZone | top-center | 280 x 110 |
| systemsZone | top-right | rightW x 90 |
| weaponsZone | left below status (10, 140) | leftW x 200 |
| fleetZone | right below systems (dynamic Y) | rightW x 300 |
| commanderZone | bottom-left | min(260, 22%) x 100 |
| diagnosticsZone | left middle-low | leftW x 100 |
| opsLogZone | left lower | min(240, 20%) x 100 |

---

## 3. Render Functions

### renderHUDFrame() (Lines 12957-13218) - MASTER RENDER

Called at line 21328 from the main game draw function (after `ctx.restore()` for screen shake, so HUD is shake-immune).

**EXACT RENDER ORDER:**

1. **Status Zone** (line 12965-12970)
   - `renderStatusZone(layout.statusZone)` if `panelReady('status')`
   - Boot overlay: `renderPanelBootOverlay(zone, 120, '#0ff', 'SYS.STATUS', ...)`

2. **Mission Zone** (line 12972-12979)
   - Only visible: `wave !== 1 || !tutorialState || tutorialState.beamHintShown`
   - `renderMissionZone(layout.missionZone)` if `panelReady('mission')`
   - Boot overlay: `renderPanelBootOverlay(zone, 110, '#0a0', 'MISSION.CTL', ...)`

3. **Tech Chips** (line 12982-12984)
   - `renderTechChips(layout)` only when `!booting`

4. **Systems Zone** (line 12987-12992)
   - `renderSystemsZone(layout.systemsZone)` if `panelReady('systems')`
   - Boot overlay: `renderPanelBootOverlay(zone, 88, '#f80', 'SYS.INTG', ...)`

5. **Energy Graph** (line 12995-12997)
   - `renderEnergyGraph(layout.systemsZone)` if `panelReady('systems') && !booting`

6. **Weapons Zone** (line 12999-13019) - SLIDES LEFT
   - Condition: `playerInventory.maxBombs > 0 || missileUnlocked`
   - Slide direction: negative X (slides in from left)
   - `renderWeaponsZone(layout.weaponsZone)` returns dynamic panelH
   - Boot overlay: color `'#f44'`, label `'ORD.SYS'`

7. **Research Progress + Queue** (line 13021-13111) - BELOW WEAPONS
   - Positioned at `weaponsZone.y + weaponsPanelH + 6`
   - Active research bar: 28px height, `#0a4` color, 15 segments
   - Queue items: up to 2, each 16px height

8. **Fleet Zone** (line 13113-13132) - SLIDES RIGHT
   - Condition: `harvesterUnlocked || battleDroneUnlocked || activeCoordinators.length > 0`
   - Slide direction: positive X (slides in from right)
   - Boot overlay: color `'#48f'`, label `'FLEET.CMD'`

9. **Diagnostics Zone** (line 13134-13152) - SLIDES LEFT
   - Condition: `techFlags.beamConduit` AND `canvas.height >= 500`
   - Boot overlay: color `'#0af'`, label `'DIAG.SYS'`

10. **OPS.LOG Zone** (line 13154-13172) - SLIDES LEFT
    - Condition: `wave >= 2` AND `canvas.height >= 500`
    - Boot overlay: color `'#8af'`, label `'OPS.LOG'`

11. **Commander Zone** (line 13174-13204)
    - Condition: `missionCommanderState.visible && (wave >= 2 || tutorialState)`
    - Slides in from left, slides out when not visible
    - Boot overlay: color `'#0f0'`, label `'COMMS.SYS'`

12. **Energy Flow Lines** (line 13207-13209)
    - `renderEnergyFlows(layout)` when `techFlags.beamConduit && ufo && !booting`

13. **Energy Pulse Sweep** (line 13212-13214)
    - `renderHUDEnergyPulse(layout)` when `!booting`

14. **Coordinator Distress Arrows** (line 13217)
    - `renderCoordDistressArrows()` - always rendered last

### Utility Render Functions

#### renderNGEPanel(x, y, w, h, opts) (Lines 12099-12258)
- Draws angular panel with optional cut corners (45-degree, cut=10px)
- Fill: `rgba(5, 8, 18, alpha)` (default alpha 0.65)
- Inner hex-grid texture at 0.04 alpha
- Border: 1.5px, inner glow line 1px at 2px inset
- Label: bold 11px monospace in top-left
- Options: `{ color, alpha, cutCorners[], label, labelColor, filled, borderOnly }`

#### renderNGEBar(x, y, w, h, percent, color, opts) (Lines 12286-12362)
- Segmented progress bar (default 10 segments, 2px gap)
- Options: `{ segments, glow, pulse, showValue, valueText, bgColor }`
- Pulse effect on last 2 segments when enabled

#### renderNGEStatusDot(x, y, status, size) (Lines 12365-12401)
- Status colors: nominal=#0f0, caution=#fc0, critical=#f33, offline=#333
- Caution blinks at 400ms, critical at 120ms

#### renderNGELabel(x, y, text, color) (Line 12404-12409)
- Bold 11px monospace, left-aligned

#### renderNGEValue(x, y, text, color, align) (Lines 12412-12417)
- Bold 16px monospace

#### renderNGEScanlines(x, y, w, h, alpha) (Lines 12420-12455)
- Scrolling scanlines: 3px spacing, uses `hudAnimState.scanlineOffset`
- Glitch bands: intermittent bright bars, ~1/5 frames
- Horizontal tear effect on some glitch bands

#### renderNGEDataStream(x, y, w, h, color) (Lines 12458-12478)
- Scrolling hex characters, 8px font, 0.08 alpha

#### renderNGEChevrons(x, y, w, color, speed) (Lines 12481-12494)
- Scrolling `>>` characters, bold 10px, 20px spacing

#### renderNGEBlinkLight(x, y, color, rate) (Lines 12497-12509)
- 4x4px square, blinks at `rate` ms

#### renderNGEIndicator(x, y, shape, color, mode, opts) (Lines 12512-12600)
- Shapes: square(4x4), diamond(5x5), triangle(5x4), circle(r=2), cross(5x3)
- Modes: steady, double, cascade, reactive, random
- Options: `{ rate, phaseOffset, cascadeIndex, cascadeTotal, reactiveValue, reactiveThresholds[], glowIntensity }`

#### renderEnergyFlowLine(fromX, fromY, toX, toY, color, active) (Lines 12603-12616)
- Dashed line [4, 6], animated dash offset
- Active: 0.35 alpha, 1.5px; Inactive: 0.12 alpha, 0.8px

#### renderHexagon(cx, cy, r) (Lines 12261-12272)
#### hexToRgb(hex) (Lines 12275-12283)
#### easeOutCubic(t) (Line 13220-13222)

### Zone Renderers

#### renderStatusZone(zone) (Lines 13228-13309)
- Panel: 120px height, color `#0ff`, cut corner `tl`
- Scanlines: 0.012 alpha
- **Score**: bold 30px at (x+12, y+36)
- **High score**: #445 11px at (x+12, y+50)
- **Wave + Timer**: bold 18px at (x+12, y+70); Timer at (x+108, y+70)
  - Timer pulses red when <= 10s
- **Combo**: bold 16px yellow at (x+12, y+88) with shadow glow
- **B.MTR**: at (x+12, y+104), label 'B.MTR:' in #0a0, value bold 14px #0f0 at (x+66, y+104)
  - Only shown when `bioMatter > 0` or tech tree has activity
- **Blink light**: (x+w-12, y+8), #0ff, 800ms
- **Indicators**: diamond at bottom-left, reactive circle at bottom-right
- **Powerups**: rendered below at y+124 via `renderPowerupsInStatus(x, y+124)`

#### renderPowerupsInStatus(startX, startY) (Lines 13311-13345)
- Bar: 170px wide, 14px height, 3px spacing
- Each active powerup: 8 segments, bold 9px label overlay

#### renderMissionZone(zone) (Lines 13347-13436)
- **Quota bar**: 26px height, panel color `#0a0`
  - Fill colors: met=#0f0, on-track=#0a0, caution=#ca0, behind=#f44
  - Animated chevron overlay on fill (16px spacing)
  - Text: bold 13px centered, black shadow + white
  - Warning pulsing border when behind (< 40% expected)
  - Celebration border when met
- **Harvest counter**: at (x, y+30) via `renderHarvestCounterNGE(x, y+30, w)`
- **Indicators**: triangle top-left, square top-right (color/rate based on quota %), circle+circle+diamond at bottom

#### renderHarvestCounterNGE(x, y, w) (Lines 13438-13498)
- Panel: 48px height, color `#0aa`
- Icon size: 22px base, with bounce scaling
- Icons: evenly spaced across panel width
- Count text: bold 13px (15px on bounce), #0f0 or #334

#### renderSystemsZone(zone) (Lines 13500-13603)
- Panel: 88px height, color `#f80`, cut corner `tr`
- **Shield bar**: at y+22, label 'SHLD' #f80, value right-aligned
  - NGE bar: 16px height, 10 segments, pulse < 25%, glow enabled
  - Colors: >50% = #0f6, >25% = #fc0, else #f33
  - Status dot right of bar
- **Revive cells**: at y+50, label 'REVIVE' #f55
  - Cell size: 14px, 4px spacing, pulsing with energy swirl
- **Speed indicator**: shown if speedBonus > 0, at cellY+22
- **Energy bonus**: shown if maxEnergyBonus > 0, 14px below speed (or 22px if no speed)
- **Indicators**: square top-left, reactive cross bottom-left, diamond bottom-right

#### renderEnergyGraph(systemsZone) (Lines 13605-13723)
- Only renders when `techFlags.beamConduit` is true
- Position: below systems zone content, dynamically offset
  - Base: systemsZone.y + 88 + 8 = y+96
  - +22 if speedBonus > 0
  - +14 if maxEnergyBonus > 0
- Size: rightW wide, 72px height
- Panel: color `#f80`, cut corner `tr`, alpha 0.5
- Header: 'NRG.FLOW' bold 9px #f80
- Legend: 'OUT' #f44, 'IN' #0f0, 7px right-aligned
- Graph area: x+28, graphY+14, w-34 wide, 48px height
- Grid: 3 horizontal lines, 6 vertical columns
- Y-axis: 7px labels at left
- X-axis: '-30s' left, 'now' right
- Output line: red (#f44), 1px, with red gradient fill
- Intake line: green (#0f0), 1px, with green gradient fill
- Ring buffer: 180 samples, read from writeIndex

#### renderWeaponsZone(zone) (Lines 13725-13950)
- Returns dynamic `panelH`
- Panel color: `#f44`, cut corner `bl`, label 'ORD.SYS'
- Layout: `labelX = x + 6`, `gridStartX = labelX + 62`
- **Bombs section**: (starts at y+28)
  - Icon: 16px, 6px spacing, 3 columns fixed
  - Label: 'BOMBS' at labelX, shortcut 'Z / B' below
  - Bomb circle: filled=#444, empty=#1a1a1a, fuse spark, recharge arc
- **Missiles section**: (starts below bombs)
  - Grouped layout: up to 3 columns
  - Missile: 5px wide, 12px height, 2px spacing
  - Group label width: 9px
  - Label: 'MISSILES' at labelX, shortcut 'X / M'
  - SALVO RDY indicator when all groups ready
  - Fill-from-bottom recharge animation
- **Indicators**: triangle top-left, square top-right, cross+circle bottom

#### renderFleetZone(zone) (Lines 13952-14136)
- Dynamic height based on drone count
- Panel color: `#48f`, cut corner `tr`, label 'FLEET.CMD'
- Row height: 18px, header: 22px
- Slot counter: `totalDrones/droneSlots` right-aligned bold 10px
- Tree layout using Unicode connectors (├, └, │, ─)
- **Coordinators**: label COORD.H/#0dc or COORD.A/#fa0
  - Energy bar: 40px wide, 5px height, 6 segments
  - Sub-drones: indented, 9px font, 70% width bars
- **Raw drones**: same tree layout, 'DRONES: N' header
- **Indicators**: diamond top-left, 3 cascade squares bottom-left, circle bottom-right

#### renderCommanderZone(zone) (Lines 14138-14191)
- Panel: color `#0f0`, cut corners `tl, br`, alpha 0.75
- Blink light: (x+8, y+6), #0f0, 250ms
- Header: 'INCOMING TRANSMISSION' bold 10px #0f0
- Scanlines: 0.025 alpha over entire panel
- Portrait: (h-24) size, at (x+6, y+18)
  - Rendered by `renderCommanderPortrait(x, y, size, emotion)` at line 18423
- Dialogue: right of portrait, 11px #0f0, word-wrapped, max 4 lines, 13px line height

#### renderDiagnosticsZone(zone) (Lines 14193-14315)
- Panel: color `#0af`, cut corner `tl`, alpha 0.5
- Header: 'DIAG.SYS' bold 9px #0af
- Line height: 12px
- Dynamic diagnostic lines built from game state:
  - NRG.MAIN, BEAM.SYS, SHLD.INTG, DRN.HARV, DRN.ATTK, COORD.H/A, ORD.MSL, ORD.BMB, THR.PROX
- Auto-scroll: 0.4 px/frame, 2s pause at ends
- Status dots for each line
- View area: y+20 to y+h-4 (clipped)

#### renderOpsLogZone(zone) (Lines 14317-14371)
- Panel: color `#8af`, cut corner `bl`, alpha 0.45
- Header: 'OPS.LOG' bold 9px #8af
- Line height: 12px, max 6 visible
- Events: newest at bottom, prefix '> ', 9px font
- New events (age < 0.3s): shadow glow effect
- Alpha fades from 1.0 to 0.15 over 15s lifetime

### Tech & Energy Functions

#### renderTechChips(layout) (Lines 14398-14476)
- Position: gap between statusZone end and missionZone start, +4px padding each side
- Starting Y: 6px from top
- Chip height: 18px, row spacing: 21px (wrap on overflow)
- Track separator: 4px gap with 0.08 alpha line
- Chip: cut corner top-right (4px), bg rgba(5,8,18,0.5)
  - Prefix: bold 7px in track color at 0.7 alpha
  - Suffix: 7px white at 0.6 alpha
  - Status blink: 2x2px, 1200ms

#### renderEnergyFlows(layout) (Lines 14478-14499)
- Flow to fleet zone: from (ufoX+60, ufoY) to fleet zone center, #48f, always inactive
- Flow to weapons zone: from (ufoX-60, ufoY) to weapons zone center, #f44, always inactive

#### renderHUDEnergyPulse(layout) (Lines 12887-12955)
- Sweep line: 3px height, rgba(180,255,255,0.7), shadowBlur 12
- Inner line: 1px rgba(255,255,255,0.5), shadowBlur 6
- Panel border brightness boost when pulse passes center
- Applies to: statusZone (120px), systemsZone (88px), weaponsZone (if visible), fleetZone (if visible)

---

## 4. Boot System

### initHUDBoot() (Lines 14612-14668)
Called at wave start. Sets `phase = 'booting'`, `timer = 0`, `duration = 3.5`.
- Takes tech snapshot of current game state
- Activates relevant panels based on tech/wave:
  - `status`: always
  - `mission`: wave !== 1
  - `systems`: always
  - `weapons`: if hasBombs or hasMissiles
  - `fleet`: if hasHarvesters, hasBattleDrones, or hasCoordinators
  - `commander`: wave >= 2
  - `diagnostics`: if techFlags.beamConduit
  - `opslog`: wave >= 2
- Default stagger times: `{ status:0.0, mission:0.15, systems:0.3, diagnostics:0.45, weapons:0.6, fleet:0.9, opslog:1.1, commander:1.2 }`
- Resets all panel slide animations to 0
- Calls `generateBootLines()`

### updateHUDBoot(dt) (Lines 14670-14726)
Called every frame when `hudBootState.phase === 'booting'` (from `updateHUDAnimations` at line 14607).
- Iterates all active panels
- Transitions: `waiting` -> `booting` (when elapsed >= 0) -> `online` (when progress >= 1)
- Sound triggers:
  - `SFX.bootPanelStart()` on waiting->booting transition
  - `SFX.bootDataChatter()` for each new visible boot text line
  - `SFX.bootMissileSkip()` for lines starting with `[SKIP]`
  - `SFX.bootPanelOnline()` on booting->online transition
  - `SFX.bootAllOnline()` once when all active panels are online
- Sets `phase = 'complete'` when timer >= 3.5s

### generateBootLines() (Lines 14728-14832)
Generates diagnostic text lines for each panel boot overlay based on tech snapshot.
- Status: 6 lines (INIT, wave deployment, score, combo, bio matter, nominal)
- Mission: 5 lines (INIT, quota target, harvest sensors, quota tracking, parameters set)
- Systems: 5 lines (INIT, hull HP, revive cells, shield monitor, integrity pass)
- Weapons: 5-8 lines (dynamic based on bombs/missiles)
- Fleet: 4-7 lines (dynamic based on drones/coordinators)
- Commander: 5 lines (INIT, frequency, encryption, commander link, awaiting)
- Diagnostics: 5 lines (INIT, scanning, linking, monitor, ready)
- OpsLog: 4 lines (INIT, event buffer, log stream, online)

### renderPanelBootOverlay(zone, h, color, label, panelState, bootLines) (Lines 14838-15027)
- **Waiting phase**: returns immediately
- **Online phase**: brief flash (0.2s) then nothing
- **Booting phase**:
  - Dark background: alpha = 0.9 * (1 - progress*0.8), fading out
  - Panel border: alpha = 0.3 + progress*0.5
  - **Border trace** (progress < 0.3): glowing dot traces clockwise around perimeter, 60px trail
  - **Label typewriter** (progress < 0.2): chars revealed proportionally
  - **Boot text lines**: 11px line height, starting at y+24
    - Color-coded: `>>` in panel color, `[OK]` in green, `[SKIP]/[WARN]` in yellow, default in blue-gray
    - Current line has typewriter effect
    - Blinking cursor after last visible line (400ms)
  - **Progress bar**: 3px at bottom of panel
  - **CRT scanlines**: 3px spacing, 0.08 alpha
  - **Static noise** (progress < 0.4): random pixels

### renderHUDBootGlobalEffects() (Lines 15029-15085)
- **CRT power-on flash** (timer < 0.2s):
  - First 100ms: expanding white line from center
  - Next 100ms: fading full-screen white
- **"ALL SYSTEMS NOMINAL"** (timer 3.0-3.5s):
  - Bold 18px centered, white with cyan shadow
  - Scale: 1.1 -> 1.0 over duration
  - Alpha: fade in, hold, fade out

---

## 5. B.MTR / Biomatter Display

### Location
Rendered in `renderStatusZone()` at lines 13286-13291.

### Positioning
```js
// Only shown when biomatter > 0 or tech tree has activity
if (bioMatter > 0 || (techTree.activeResearch || techTree.researched.size > 0)) {
    renderNGELabel(x + pad + 4, y + 104, 'B.MTR:', '#0a0');
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(bioMatter.toString(), x + pad + 58, y + 104);
}
```
- Label: 'B.MTR:' in #0a0 at (x+12, y+104) using `renderNGELabel` (bold 11px)
- Value: bioMatter count in bold 14px #0f0 at (x+66, y+104)
- Position: bottom of status panel, 104px from top

### Current Visual Style
- Simple text label + number
- No dedicated panel or background
- No animation or visual feedback on collection

---

## 6. Sound System

### SFX Object Location
Defined starting at line 622 as `const SFX = { ... }`.

### Boot-Related Sounds (Lines 1969-2097)

| Sound | Line | Description | Frequencies |
|-------|------|-------------|-------------|
| `bootPanelStart` | 1969 | Two-note warm sine (major third) | 440Hz -> 554Hz |
| `bootPanelOnline` | 1998 | Three-note ascending major triad | 523, 659, 784 (C5-E5-G5) |
| `bootDataChatter` | 2019 | Random pentatonic sine blip | 660-1175Hz random |
| `bootMissileSkip` | 2038 | Descending two-note boop | 600Hz -> 400Hz |
| `bootAllOnline` | 2068 | Two-tone doorbell chime | 330Hz (E4) -> 660Hz (E5) |

### Other HUD-Related Sounds
| Sound | Line | Description |
|-------|------|-------------|
| `beamOn` | 623 | Rising sine 200->800Hz |
| `startBeamLoop` | 642 | Sawtooth 150Hz + LFO warble |
| `stopBeamLoop` | 665 | Fade out beam loop |
| `startMoveLoop` | 680 | Sine 80Hz + LFO warble, tracks horizontal velocity |
| `updateMoveLoop` | 710 | Pitch 80-150Hz, gain 0-0.15, LFO 5-8Hz |
| `startChargingHum` | 747 | Triangle 120Hz + LFO, for coordinator charging |
| `chargeFull` | 786 | Ascending major chord 523-659-784Hz |
| `distressBeep` | 794 | Two-tone warning 600-400Hz square |
| `abductionComplete` | 802 | Success jingle 400-800Hz ascending |
| `commanderSpeechGarble` | (ref at 14517) | Garbled speech on typewriter advance |
| `researchCountdownBlip` | (ref at 10382) | Countdown blip in final 5s |
| `researchComplete` | (ref at 10407) | Ascending chime |

---

## 7. Scan Lines

### renderNGEScanlines (Lines 12420-12455)
- Used by: `renderStatusZone` (line 13236, alpha 0.012), `renderCommanderZone` (line 14153, alpha 0.025)
- **Behavior**: Clips to provided rect, draws horizontal lines every 3px
- **Scrolling**: Uses `hudAnimState.scanlineOffset`, updated at line 14584: `(offset + dt * 120) % 300`
- **Glitch bands**: Intermittent (~1 in 5 frames), 1-3 bright bars
- **Horizontal tear**: On some glitch bands, shifted 2px sideways

### Boot overlay scanlines (Lines 15007-15011)
- Static CRT scanlines in `renderPanelBootOverlay`: every 3px, 0.08 alpha (no scroll)

### Coverage
Currently only applied to:
1. Status zone (0.012 alpha)
2. Commander zone (0.025 alpha)
3. Boot overlays (static, 0.08 alpha)

**NOT applied to**: Mission zone, Systems zone, Weapons zone, Fleet zone, Diagnostics zone, OPS.LOG zone, Energy graph

---

## 8. Health/Shield System

### UFO Health
- `ufo.health`: defined in UFO constructor (line ~4700 area)
- `CONFIG.UFO_START_HEALTH`: base health value
- `ufo.invincibleTimer`: line 4732, decremented in `update()` at lines 4754-4756

### Health Checks in HUD

**renderSystemsZone** (lines 13508-13531):
```js
const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;
// Colors: >0.5 = #0f6, >0.25 = #fc0, else #f33
// Bar pulses when < 0.25
```

**renderDiagnosticsZone** (line 14226-14227):
```js
const shldPct = shldVal / CONFIG.UFO_START_HEALTH;
// Shows SHLD.INTG line with nominal/critical status
```

### Invincibility Visual
- Line 5225-5246: UFO flickers during invincibility (alpha 0.3 on alternate frames)
- `CONFIG.INVINCIBILITY_FLICKER_RATE` controls flicker speed
- Triggered after revive at line 11307: `ufo.invincibleTimer = CONFIG.INVINCIBILITY_DURATION`

### Health-Related Visual Effects
- **Damage flash**: `damageFlash` variable at line 7217, rendered at line 21355 as red screen overlay
- **Shield bar pulse**: when health < 25%, bar segments pulse via `renderNGEBar` pulse option
- **Shield status dot**: nominal/caution/critical based on health percent
- **Reactive indicators**: bottom-left of systems zone changes color/rate based on shield %

### Current Gaps
- No HUD-wide visual distortion on low health
- No panel shake/glitch effects linked to health
- No screen vignette or border warning

---

## 9. Research Display

### Active Research (Lines 13021-13111, inside renderHUDFrame)
Positioned below weapons zone:
- `rX = layout.weaponsZone.x`
- `rY = layout.weaponsZone.y + weaponsPanelH + 6`
- Width: `layout.weaponsZone.w`
- Height: 28px for active bar

**Active research bar**:
- NGE Panel: color #0a4, alpha 0.6
- NGE Bar: 15 segments
- Priority number: bold 12px #0f0 at rX+6
- Short name: bold 10px white at rX+20 (from TECH_CHIP_DEFS)
- Countdown: bold 10px right-aligned
- Blink light: #0f0 300ms at top-right

**Queue items** (up to 2):
- Background: rgba(0,15,0,0.45) with 0.25 alpha border
- Line height: 16px
- Priority numbers: bold 10px rgba(0,200,80,0.5)
- Names: 9px rgba(255,255,255,0.45)
- Research time: 9px right-aligned

### Completion Notification (Lines 10400-10410)
- Floating text: 'RESEARCH COMPLETE' at canvas center, 28px #0f0
- Tech name below in 22px #4f4
- Green screen flash via `damageFlash = 0.3`
- Sound: `SFX.researchComplete()`

---

## 10. Tech Tree Data

### CONFIG.TECH_TREE (Lines 374-411)
Three tracks, 5 tiers each:

**powerGrid** (color: #ff0):
| ID | Name | Cost | Time | Tier | Cross-Connect |
|----|------|------|------|------|---------------|
| pg1 | Beam Conduit | 10 | 30s | 1 | - |
| pg2 | Energy Efficiency | 20 | 45s | 2 | dc2 |
| pg3 | Power Broadcast | 30 | 60s | 3 | - |
| pg4 | Reactor Amplifier | 45 | 90s | 4 | dc4 |
| pg5 | Self-Sustaining Grid | 65 | 120s | 5 | dn5 |

**droneCommand** (color: #48f):
| ID | Name | Cost | Time | Tier | Cross-Connect |
|----|------|------|------|------|---------------|
| dc1 | Drone Uplink | 10 | 30s | 1 | - |
| dc2 | Harvester Coordinator | 20 | 45s | 2 | pg2 |
| dc3 | Attack Coordinator | 30 | 60s | 3 | - |
| dc4 | Fleet Expansion | 45 | 90s | 4 | pg4 |
| dc5 | Autonomous Swarm | 65 | 120s | 5 | - |

**defenseNetwork** (color: #f80):
| ID | Name | Cost | Time | Tier | Cross-Connect |
|----|------|------|------|------|---------------|
| dn1 | Thruster Boost | 10 | 30s | 1 | - |
| dn2 | Drone Armor | 20 | 45s | 2 | - |
| dn3 | Shield Transfer | 30 | 60s | 3 | - |
| dn4 | Fleet Resilience | 45 | 90s | 4 | dc4 |
| dn5 | Swarm Shield | 65 | 120s | 5 | pg5 |

### TECH_CHIP_DEFS (Lines 14374-14390)
Chip display definitions for HUD readout:
```js
const TECH_CHIP_DEFS = [
    { id: 'pg1', text: 'PG1 CONDUIT', width: 58, track: 'powerGrid' },
    { id: 'pg2', text: 'PG2 EFFIC',   width: 44, track: 'powerGrid' },
    { id: 'pg3', text: 'PG3 BCAST',   width: 44, track: 'powerGrid' },
    { id: 'pg4', text: 'PG4 REACT',   width: 44, track: 'powerGrid' },
    { id: 'pg5', text: 'PG5 S.GRID',  width: 52, track: 'powerGrid' },
    { id: 'dc1', text: 'DC1 UPLINK',  width: 52, track: 'droneCommand' },
    { id: 'dc2', text: 'DC2 H.CORD',  width: 52, track: 'droneCommand' },
    { id: 'dc3', text: 'DC3 A.CORD',  width: 52, track: 'droneCommand' },
    { id: 'dc4', text: 'DC4 EXPND',   width: 44, track: 'droneCommand' },
    { id: 'dc5', text: 'DC5 SWARM',   width: 44, track: 'droneCommand' },
    { id: 'dn1', text: 'DN1 THRST',   width: 44, track: 'defenseNetwork' },
    { id: 'dn2', text: 'DN2 ARMOR',   width: 44, track: 'defenseNetwork' },
    { id: 'dn3', text: 'DN3 SHLD.T',  width: 52, track: 'defenseNetwork' },
    { id: 'dn4', text: 'DN4 RESIL',   width: 44, track: 'defenseNetwork' },
    { id: 'dn5', text: 'DN5 S.SHLD',  width: 52, track: 'defenseNetwork' }
];
```

### TRACK_COLORS (Lines 14392-14396)
```js
const TRACK_COLORS = {
    powerGrid: '#ff0',
    droneCommand: '#48f',
    defenseNetwork: '#f80'
};
```

### techFlags (Reset in startGame at lines 12043-12059)
```js
techFlags = {
    beamConduit: false,           // pg1 - enables energy graph, diagnostics, energy flows
    energyEfficiency: false,      // pg2
    powerBroadcast: false,        // pg3
    reactorAmplifier: false,      // pg4
    selfSustainingGrid: false,    // pg5
    droneUplink: false,           // dc1
    harvesterCoordinator: false,  // dc2
    attackCoordinator: false,     // dc3
    fleetExpansion: false,        // dc4
    autonomousSwarm: false,       // dc5
    thrusterBoost: false,         // dn1
    droneArmor: false,            // dn2
    shieldTransfer: false,        // dn3
    fleetResilience: false,       // dn4
    swarmShield: false            // dn5
};
```

### Tech Gating
- `getTechNode(nodeId)` - Line 10271: searches CONFIG.TECH_TREE
- `checkTechPrerequisites(nodeId)` - Line 10292: tier 1 = no prereqs, higher tiers need previous tier in same track
- `canResearchNode(nodeId)` - Line 10308: checks not researched, not queued, has cost, prereqs met
- `queueResearch(nodeId)` - Line 10323: deducts bioMatter, adds to queue
- `completeResearch(nodeId)` - Line 10394: adds to researched set, applies effect

---

## Appendix: Key Line Number Reference

| Function/Variable | Line |
|---|---|
| `const SFX = {` | 622 |
| `SFX.bootPanelStart` | 1969 |
| `SFX.bootPanelOnline` | 1998 |
| `SFX.bootDataChatter` | 2019 |
| `SFX.bootMissileSkip` | 2038 |
| `SFX.bootAllOnline` | 2068 |
| `CONFIG.TECH_TREE` | 374 |
| `UFO.invincibleTimer` | 4732 |
| `UFO invincible flicker render` | 5225 |
| `let damageFlash` | 7217 |
| `getTechNode()` | 10271 |
| `checkTechPrerequisites()` | 10292 |
| `canResearchNode()` | 10308 |
| `queueResearch()` | 10323 |
| `completeResearch()` | 10394 |
| `function startGame()` | 11914 |
| `hudAnimState reset in startGame` | 11991 |
| `diagnosticsState reset` | 12007 |
| `opsLogState reset` | 12010 |
| `missionCommanderState reset` | 12013 |
| `energyTimeSeries reset` | 12027 |
| `techFlags reset` | 12043 |
| `renderNGEPanel()` | 12099 |
| `renderHexagon()` | 12261 |
| `hexToRgb()` | 12275 |
| `renderNGEBar()` | 12286 |
| `renderNGEStatusDot()` | 12365 |
| `renderNGELabel()` | 12404 |
| `renderNGEValue()` | 12412 |
| `renderNGEScanlines()` | 12420 |
| `renderNGEDataStream()` | 12458 |
| `renderNGEChevrons()` | 12481 |
| `renderNGEBlinkLight()` | 12497 |
| `renderNGEIndicator()` | 12512 |
| `renderEnergyFlowLine()` | 12603 |
| `hudAnimState declaration` | 12643 |
| `hudBootState declaration` | 12660 |
| `missionCommanderState declaration` | 12703 |
| `energyTimeSeries declaration` | 12718 |
| `diagnosticsState declaration` | 12731 |
| `opsLogState declaration` | 12737 |
| `pushOpsLogEvent()` | 12744 |
| `updateOpsLog()` | 12757 |
| `trackEnergyDelta()` | 12766 |
| `updateEnergyTimeSeries()` | 12771 |
| `MISSION_COMMANDER_DIALOGUES` | 12794 |
| `TUTORIAL_COMMANDER_DIALOGUES` | 12846 |
| `getHUDLayout()` | 12858 |
| `renderHUDEnergyPulse()` | 12887 |
| `renderHUDFrame()` | 12957 |
| `easeOutCubic()` | 13220 |
| `renderStatusZone()` | 13228 |
| `renderPowerupsInStatus()` | 13311 |
| `renderMissionZone()` | 13347 |
| `renderHarvestCounterNGE()` | 13438 |
| `renderSystemsZone()` | 13500 |
| `renderEnergyGraph()` | 13605 |
| `renderWeaponsZone()` | 13725 |
| `renderFleetZone()` | 13952 |
| `renderCommanderZone()` | 14138 |
| `renderDiagnosticsZone()` | 14193 |
| `renderOpsLogZone()` | 14317 |
| `TECH_CHIP_DEFS` | 14374 |
| `TRACK_COLORS` | 14392 |
| `renderTechChips()` | 14398 |
| `renderEnergyFlows()` | 14478 |
| `updateMissionCommander()` | 14502 |
| `updateHUDAnimations()` | 14582 |
| `initHUDBoot()` | 14612 |
| `updateHUDBoot()` | 14670 |
| `generateBootLines()` | 14728 |
| `renderPanelBootOverlay()` | 14838 |
| `renderHUDBootGlobalEffects()` | 15029 |
| `renderCoordDistressArrows()` | 15459 |
| `renderCommanderPortrait()` | 18423 |
| `renderHUDFrame() called in draw` | 21328 |
| `renderHUDBootGlobalEffects() called` | 21331 |
| `damageFlash render` | 21355 |
