# HUD Boot-Up Sequence Design

## Visual Research & References

### Neon Genesis Evangelion (Primary Reference)
- **NERV Bridge Boot Sequences**: Status screens flicker on in sequence, not simultaneously. Green/orange/red terminal text on dark backgrounds. Warning overlays cascade. Percentage counters tick up. Hexagonal grid patterns underlay diagnostic text.
- **MAGI System**: Three-supercomputer system with distinct personality matrices. Display shows parallel diagnostic streams, voting indicators (MELCHIOR/BALTHASAR/CASPER), and system consensus readouts. Dense monochromatic data with occasional color-coded status.
- **Entry Plug Activation**: LCL fill visualization, synchronization rate counters climbing, nerve connection checks scrolling, A10 nerve clip status. Diagnostic text covers the entry plug walls during first activation. The sequence builds tension: each subsystem must reach threshold before the next begins.
- **Design Philosophy**: Interfaces are "designed for narrative friction" -- not meant to be read, meant to be *believed*. Unreadable symbols, rapid flickers, impossible data displays. Simple geometric shapes with fast-paced animation. The UI feels alive: pulsing in sync with operator voices.

### Ghost in the Shell
- Bright orange-on-black monochromatic HUD. Holographic overlays with scan line effects. Clean code-like text for clinical/scientific environments. Transparency layers creating depth.

### Terminator T-800 Vision
- Monochromatic red HUD (infrared mode). System readout text scrolling in corners. Target acquisition boxes tracking objects. Decision text appearing ("EVADE" / "TERMINATE"). Assembly code scrolling as background texture.

### Military/Aerospace HUD (F-16)
- Pitch ladder, airspeed tape, altitude readouts. Aiming reticle that changes modes. Lock-on displays critical data (heading, velocity, distance). Symbology overlaid on real-world view. Everything serves a function -- no decoration.

### CRT/BIOS Boot Aesthetic
- Green/amber phosphor text on pure black. Scanline artifacts. Character-by-character text reveal. RAM counting up. POST diagnostic checks with [OK] / [FAIL] status. Cursor blink. Brief pauses between diagnostic steps creating rhythm.

---

## Boot Sequence Overview

### Total Duration: ~3.5 seconds

The HUD boots in a staggered cascade from top-left to bottom-right, mimicking how a UFO command interface would power on subsystem by subsystem. The sequence feels like an Entry Plug activation crossed with a BIOS POST.

### Global Timeline

```
t=0.0s  ---- BLACKOUT. Screen dims to 15% brightness ----
t=0.0s  CRT power-on flash (white line expanding horizontally from center)
t=0.1s  Alien glyphs rain begins (Matrix-style but alien symbols, very faint)
t=0.2s  "UFO.CMD v7.3.1 // MOTHERSHIP UPLINK" header text types out
t=0.4s  Zone A (STATUS) begins boot
t=0.8s  Zone B (MISSION) begins boot
t=1.2s  Zone C (SYSTEMS) begins boot
t=1.6s  Zone D (WEAPONS) begins boot [if weapons owned]
t=2.0s  Zone E (FLEET) begins boot [if drones owned]
t=2.4s  Zone F (COMMANDER) begins boot [if wave >= 2]
t=3.0s  All panels report ONLINE, brightness returns to 100%
t=3.2s  "ALL SYSTEMS NOMINAL" text flashes center-screen
t=3.5s  Boot sequence complete, gameplay begins
```

### Per-Panel Boot Phases (~0.6s per panel)

Each HUD panel goes through 4 phases. The phases overlap slightly for fluidity.

#### Phase 1: TRACE (0.00 - 0.15s)
A bright colored line traces the panel border, starting from the top-left corner and racing clockwise. This establishes the panel's footprint.
- Line color matches the panel's zone color (cyan for Status, green for Mission, etc.)
- Trail glow effect (bloom) fading behind the trace point
- The line is 2px wide with a 6px bloom
- Corner cuts (NGE 45-degree angles) are traced faithfully

#### Phase 2: FILL (0.10 - 0.30s)
The panel interior fills with scrolling alien diagnostic text on a dark background.
- Background alpha fades in from 0 to panel's normal alpha
- Scrolling hex/alien characters fill the panel area (reusing `renderNGEDataStream`)
- Characters are very dim (alpha ~0.08) and scroll upward rapidly
- A faint hex-grid pattern fades in behind the text
- Panel label appears with typewriter effect: "SYS.STATUS" character by character

#### Phase 3: CALIBRATE (0.20 - 0.45s)
Diagnostic text scrolls through, specific to each panel's subsystem. A small loading bar or percentage counter ticks up.
- 3-5 lines of diagnostic text scroll through the panel body
- Each line appears with a brief delay, typewriter-style
- A small progress bar (40px wide) in the panel corner fills from 0% to 100%
- Status text cycles: "INIT" -> "LOADING" -> "CALIBRATING"
- Faint static/noise overlay that gradually clears (alpha decreasing)
- Blinking cursor at the end of the last diagnostic line

#### Phase 4: ONLINE (0.40 - 0.60s)
The diagnostic text clears, real HUD content fades in, and the panel reports online.
- Diagnostic text fades out (alpha -> 0 over 100ms)
- Real panel content fades in simultaneously
- A brief green flash on the panel border (50ms)
- Status indicator dot appears: blinks 3 times rapidly, then settles to steady green
- Small "ONLINE" text flickers next to the panel label, then fades to the normal label
- Optional: tiny confirmation beep (different pitch per panel)

---

## Panel-Specific Boot Content

### Zone A: STATUS (t=0.4s, Color: #0ff Cyan)

**Trace**: Cyan line, starts top-left (cut corner), races clockwise.

**Diagnostic Text**:
```
SYS.STATUS INIT...............
SCORE MODULE        [########] OK
WAVE.COUNTER SYNC   [########] OK
COMBO.TRACK INIT    [########] OK
B.MTR SENSOR ONLINE [########] OK
```

**Calibration**: Score counter spins rapidly from 000000 to the actual score. Wave number ticks up from 00 to actual wave. Timer digits scramble then settle.

**Online**: All values snap to real data. Cyan border pulses once.

### Zone B: MISSION (t=0.8s, Color: #0a0 Green)

**Trace**: Green line, starts top-left, clockwise.

**Diagnostic Text**:
```
MISSION.PARAMS LOADING.........
QUOTA.DB SYNC       [########] OK
HARVEST.TARGETS     [########] OK
QUOTA: XX/XX LOADED
```

**Calibration**: Quota bar fills with a sweep animation (left to right) rather than instant. Harvest counter icons blink on one by one. If research is active, an additional line appears:
```
RSRCH.MODULE ACTIVE [########] OK
```

**Online**: Quota bar shows real progress. "MISSION PARAMETERS LOADED" flickers briefly.

### Zone C: SYSTEMS (t=1.2s, Color: #f80 Orange)

**Trace**: Orange line, starts top-right (cut corner), counter-clockwise (unique -- systems panel traces backwards to feel different).

**Diagnostic Text**:
```
SYS.INTG CHECK.....................
SHLD.ARRAY DIAG     [########] OK
SHLD INTEGRITY: XXX%
REVIVE.CELLS: CHARGING
```

**Calibration**: Shield bar fills segment by segment (each segment lights up with a small delay, left to right). Energy cubes power on one at a time with a small glow pulse. If speed/energy bonuses exist:
```
SPD.BOOST MODULE    [########] OK
NRG.BOOST MODULE    [########] OK
```

**Online**: Shield shows actual value. Each energy cube glows steadily. Orange border settles.

### Zone D: WEAPONS (t=1.6s, Color: #f44 Red)

**Trace**: Red line, starts bottom-left (cut corner), clockwise.

Only boots if player owns weapons. Number of diagnostic lines scales with owned weapons.

**Diagnostic Text (Bombs only)**:
```
ORD.SYS POWERING UP............
BOMB.SYS INIT       [########] OK
ORD.B: X UNITS LOADED
DETONATOR CHECK     [########] OK
```

**Diagnostic Text (Bombs + Missiles)**:
```
ORD.SYS POWERING UP............
BOMB.SYS INIT       [########] OK
ORD.B: X UNITS LOADED
MISSILE.SYS INIT    [########] OK
ORD.M: X SALVOS READY
TARGETING LINK      [########] OK
SALVO.CTRL SYNC     [########] OK
```

**Calibration**: Bomb icons appear one at a time (small flash per bomb). Missile groups rack in sequentially. Key badges [Z] and [X] blink on with a bright flash.

**Online**: "ORD.SYS ARMED" flashes in red, then fades. Red border pulses aggressively once.

### Zone E: FLEET (t=2.0s, Color: #48f Blue)

**Trace**: Blue line, starts top-right (cut corner), clockwise.

Only boots if player owns drones/coordinators. Scales dynamically with fleet size.

**Diagnostic Text (Small fleet: 1-3 drones)**:
```
FLEET.CMD ESTABLISHING LINK...
DRONE.COMM CHECK    [########] OK
FLEET: X UNITS DETECTED
UPLINK STABLE
```

**Diagnostic Text (Large fleet: 4+ drones with coordinators)**:
```
FLEET.CMD ESTABLISHING LINK...
DRONE.COMM CHECK    [########] OK
COORD.H LINK        [########] OK
COORD.A LINK        [########] OK
SUB-DRONE UPLINK    [########] OK
FLEET: XX UNITS DETECTED
HIERARCHY VERIFIED
COMM.PROTOCOL: ACTIVE
```

**Calibration**: Tree view builds line by line. Each coordinator node appears, then its sub-drones cascade beneath it. Energy bars fill with a sweep. Connection lines (tree lines) animate in as energy conduits.

**Online**: All drone status bars show real values. "FLEET OPERATIONAL" flashes briefly. Fleet panel then collapses to compact view if no drones are actively deployed (existing behavior).

### Zone F: COMMANDER (t=2.4s, Color: #0f0 Green)

**Trace**: Green line (different shade than Mission), starts top-left (cut corner), clockwise.

Only boots if wave >= 2. This panel has the most dramatic boot because it represents an incoming transmission.

**Diagnostic Text**:
```
INCOMING.SIGNAL DETECTED.......
DECRYPTING TRANSMISSION........
AUTH: COMMANDER [########] OK
ESTABLISHING VISUAL LINK.......
```

**Calibration**: The portrait area shows heavy static/noise (random colored pixels) that gradually resolves. A ghostly outline of the commander face appears through the static. The transmission "locks on" with a brief screen shake of just the panel.

**Online**: Static clears completely to reveal commander portrait. "LINK ESTABLISHED" header. Speech bubble area ready. Green border settles with a steady blink light.

---

## Technology-Aware Boot Scaling

The boot sequence adapts to player progression, making later waves feel more impressive:

### Wave 1 (Minimal)
- Only Zones A, B, C boot (3 panels)
- Total boot time: ~2.0s
- Fewer diagnostic lines per panel
- Clean, fast, minimal

### Mid-Game (Weapons + Some Drones)
- Zones A, B, C, D, E boot (5 panels)
- Total boot time: ~3.0s
- Weapons panel has bomb + missile checks
- Fleet panel has a few drone entries

### Late-Game (Full Fleet + All Weapons)
- All 6 zones boot
- Total boot time: ~3.5s
- Weapons panel: full ordnance check with targeting sync
- Fleet panel: full hierarchy check, multiple coordinator links
- More diagnostic lines overall = more impressive boot
- Additional global boot line: "ADVANCED SUBSYSTEMS DETECTED... INITIALIZING"

### Tech Tree Influence on Boot Lines
| Tech Researched | Additional Boot Line |
|----------------|---------------------|
| Beam Conduit (PG1) | `NRG.CONDUIT LINK [####] OK` in Systems |
| Drone Uplink (DC1) | `DRONE.SLOT ARRAY EXPANDED` in Fleet |
| Harvester Coord (DC2) | `COORD.H PROTOCOL LOADED` in Fleet |
| Attack Coord (DC3) | `COORD.A PROTOCOL LOADED` in Fleet |
| Energy Efficiency (PG2) | `NRG.EFF MODULE [####] OK` in Systems |
| Fleet Expansion (DC4) | `FLEET.CAPACITY UPGRADED` in Fleet |
| Any missile upgrade | `MISSILE.SYS vX.X LOADED` in Weapons |
| Any bomb upgrade | `BOMB.YIELD CALIBRATED` in Weapons |

---

## Visual Effects Specification

### CRT Power-On Flash (t=0.0s)
- A single horizontal white line appears at vertical center of screen
- Line expands from 1px to full screen height over 100ms
- Brightness peaks at 80% then fades to 15% ambient
- Accompanied by a CRT "thunk" sound

### Alien Glyph Rain (t=0.1s - t=3.0s)
- Columns of alien characters fall from top of screen (Matrix-rain style)
- Characters from a set: `\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588 \u25B2\u25BC\u25C6\u25CF\u2660\u2666` plus custom hex-like glyphs
- Very faint (alpha 0.03-0.06), green-tinted
- Speed varies per column (parallax effect)
- Gradually fades out as panels come online
- Clears completely by t=3.2s

### Border Trace Effect
- Implementation: Parametric path walker along the panel border polygon
- A bright dot (4px radius, full color glow) moves along the border path
- Behind it: a trail that fades over 60px (gradient from full alpha to 0)
- The border "stays lit" after the trace passes (normal panel border appears)
- Speed: completes full border in ~150ms

### Static/Noise Overlay
- Per-panel noise texture: random gray pixels (2x2 blocks for performance)
- Initial alpha: 0.15
- Decreases linearly to 0 over the CALIBRATE phase
- Flickering: alpha randomly spikes by +0.05 every ~80ms for glitch feel
- Can reuse a pre-generated noise pattern for performance

### Diagnostic Text Scroll
- Font: bold 9px monospace, panel color at 60% alpha
- Lines appear from bottom, scroll up
- Each new line has a 60ms delay after the previous
- Text uses typewriter reveal (character by character, 15ms per char)
- "[########]" progress blocks fill left-to-right (each # appears over 20ms)
- "OK" appears in bright green after progress completes
- If a line says "FAIL" (only for dramatic effect, never actually fails): red flash, then retries and shows OK

### Loading Bar
- Small bar (40px wide, 4px tall) in the panel's top-right area
- Fills with panel color from left to right
- Non-linear fill: fast start, pause at ~60%, quick finish
- Percentage text next to bar: "0%" -> "100%"

### Screen Brightness Curve
```
t=0.0: 100% -> 15% (instant dim, CRT off feel)
t=0.0-0.1: CRT flash (100% spike, back to 15%)
t=0.1-3.0: 15% gradually rising to 60% as panels boot
t=3.0-3.2: 60% -> 100% (all systems nominal)
t=3.2-3.5: 100% steady (boot complete)
```

---

## Sound Design

### Global Sounds
| Time | Sound | Description |
|------|-------|-------------|
| t=0.0 | CRT thunk | Deep low "thunk" of CRT powering on, 80ms |
| t=0.0-0.1 | Power hum | Rising frequency hum (60Hz -> 200Hz), 200ms |
| t=0.1 | Data chirp | Quick ascending 3-note chirp |
| t=3.0 | System ready | Satisfying two-tone "bwee-boop" confirmation |
| t=3.2 | All nominal | Quick chord (C-E-G in sine wave, 150ms) |

### Per-Panel Sounds
| Event | Sound |
|-------|-------|
| Border trace start | Quick electronic "zip" (ascending pitch, 100ms) |
| Diagnostic line appear | Soft "tick" (like typewriter carriage) |
| Progress bar filling | Rapid chattering clicks (like data transmission) |
| "[OK]" confirmation | Tiny beep (different pitch per panel: A4, B4, C5, D5, E5, F5) |
| Panel ONLINE | Subtle "whoosh" + status beep |
| Commander static | White noise (decreasing volume as static clears) |

### Mixing
- All boot sounds at 30-40% volume (subtle, not overwhelming)
- Layer the CRT hum underneath everything as ambient
- Quick fade-out of all boot sounds at t=3.5s
- No sounds should overlap with the wave-start fanfare that follows

---

## Implementation State Model

```javascript
// Boot sequence state (added to hudAnimState or separate)
let hudBootState = {
    active: false,
    startTime: 0,
    phase: 'idle',         // 'idle' | 'powerOn' | 'booting' | 'complete'
    brightness: 1.0,
    glyphRainAlpha: 0,
    headerTyped: 0,        // characters typed of header text

    // Per-zone boot state
    zones: {
        status:    { phase: 'waiting', traceProgress: 0, fillAlpha: 0, diagLines: [], diagIndex: 0, loadPercent: 0, onlineFlash: 0 },
        mission:   { phase: 'waiting', traceProgress: 0, fillAlpha: 0, diagLines: [], diagIndex: 0, loadPercent: 0, onlineFlash: 0 },
        systems:   { phase: 'waiting', traceProgress: 0, fillAlpha: 0, diagLines: [], diagIndex: 0, loadPercent: 0, onlineFlash: 0 },
        weapons:   { phase: 'waiting', traceProgress: 0, fillAlpha: 0, diagLines: [], diagIndex: 0, loadPercent: 0, onlineFlash: 0 },
        fleet:     { phase: 'waiting', traceProgress: 0, fillAlpha: 0, diagLines: [], diagIndex: 0, loadPercent: 0, onlineFlash: 0 },
        commander: { phase: 'waiting', traceProgress: 0, fillAlpha: 0, diagLines: [], diagIndex: 0, loadPercent: 0, onlineFlash: 0, staticAlpha: 1.0 }
    }
};
// zone.phase: 'waiting' | 'trace' | 'fill' | 'calibrate' | 'online' | 'complete'
```

### Boot Trigger Points
- **Wave start**: After wave transition screen fades, before gameplay begins
- **Game start**: Before Wave 1 begins (shorter boot, fewer panels)
- **Not on**: Shop screen, game over, menu, mid-wave

### Integration with Existing Code
- `renderHUDFrame()` checks `hudBootState.active` at the top
- If active, delegates to `renderHUDBoot()` instead of normal HUD rendering
- During the boot's ONLINE phase for each zone, the zone transitions to normal rendering
- After boot completes, `hudBootState.active = false` and normal `renderHUDFrame()` takes over
- The boot brightness overlay is rendered as a full-screen semi-transparent black rect

### Functions to Add
```javascript
function initHUDBoot()          // Sets up boot state, generates diagnostic lines based on tech tree
function updateHUDBoot(dt)      // Advances boot timers and phase transitions
function renderHUDBoot()        // Master boot renderer (called instead of renderHUDFrame during boot)
function renderBootGlyphRain()  // Alien character rain effect
function renderBootTrace(zone, layout)    // Animated border trace for a panel
function renderBootDiagnostics(zone, layout) // Scrolling diagnostic text
function renderBootStatic(zone, layout)   // Noise/static overlay
function generateDiagLines(zoneName)      // Generates diagnostic text based on player tech
function renderBootBrightness()  // Full-screen brightness overlay
```

---

## Performance Considerations

- **Glyph rain**: Pre-generate column positions and speeds once, update positions each frame. Cap at 30 columns.
- **Static/noise**: Use a single pre-rendered noise ImageData (64x64), tile it. Do not generate per-pixel noise every frame.
- **Diagnostic text**: Pre-generate all text strings in `initHUDBoot()`. Rendering is just measuring typed characters.
- **Border trace**: Parameterize the panel border as a polyline path, walk a single float along it. No complex path math per frame.
- **Brightness overlay**: Single `fillRect` with computed alpha. Minimal cost.
- **Total overhead**: Boot sequence adds ~2-3ms per frame at most. It runs for only 3.5 seconds.

---

## Skip / Interrupt Behavior

- Player can press any key or click to skip the boot sequence
- Skip triggers a fast-forward: all panels instantly go to ONLINE, brightness snaps to 100%
- A quick "ALL SYS ONLINE" flash still appears (200ms) so the skip feels intentional, not broken
- Boot does not skip automatically -- the full 3.5s always plays unless interrupted
- On subsequent waves (after Wave 1), the boot is shorter: 2.0s with faster traces and no glyph rain

---

## Wave-Repeat Boot (Abbreviated)

After the first full boot (Wave 1), subsequent wave starts use an abbreviated sequence:

- **Duration**: ~1.5s
- **No CRT flash**, no glyph rain, no screen dim
- **Panels trace borders** but skip the diagnostic text phase
- **Quick calibration**: bars sweep, values update, panels flash ONLINE
- **New tech since last wave** gets a highlighted boot line: "NEW SUBSYSTEM: [tech name]" in bright yellow
- **Purpose**: Refreshes the HUD feel each wave without being tedious

---

## Example: Full Boot Visual Storyboard

```
[0.0s] Screen dims. Black.
[0.1s] CRACK -- white horizontal line expands. CRT hum rises.
[0.2s] Faint green alien glyphs begin raining down the screen.
[0.3s] Top of screen: "UFO.CMD v7.3.1 // MOTHERSHIP UPLINK" types out in cyan.
[0.4s] Top-left: cyan dot begins tracing Zone A border. Zip sound.
[0.5s] Zone A border complete. Dark interior fills with faint scrolling hex.
       "SYS.STATUS INIT..." types out. Tick tick tick.
[0.6s] "SCORE MODULE [########] OK" -- chattering clicks, then beep.
[0.7s] Score counter spins: 000000 -> actual score. Wave number ticks up.
[0.8s] Zone A: green flash, "ONLINE". Status dot blinks 3x, settles.
       Simultaneously: Zone B green trace begins at top-center.
[0.9s] Zone B filling. "MISSION.PARAMS LOADING..." Quota bar sweeps.
[1.0s] "QUOTA.DB SYNC [########] OK". Harvest icons blink on.
[1.1s] Zone B ONLINE. Mission panel shows real quota.
[1.2s] Zone C: orange trace starts from top-right, goes COUNTER-CLOCKWISE.
[1.3s] "SHLD.ARRAY DIAG [########] OK". Shield segments light up L-to-R.
[1.4s] Energy cubes glow on one at a time. Pop. Pop. Pop.
[1.5s] Zone C ONLINE. Orange border settles.
[1.6s] Zone D: red trace from bottom-left. "ORD.SYS POWERING UP..."
[1.7s] "BOMB.SYS INIT [########] OK". Bomb icons flash in one by one.
       "MISSILE.SYS INIT [########] OK". Missile racks slide in.
[1.8s] Key badges [Z] [X] flash bright. "ORD.SYS ARMED" in red.
[2.0s] Zone D ONLINE. Zone E: blue trace begins right side.
[2.1s] "FLEET.CMD ESTABLISHING LINK..." Tree nodes appear top-down.
[2.2s] Coordinator links checked. Sub-drones cascade. Energy bars sweep.
[2.4s] Zone E ONLINE. Zone F: green trace bottom-left.
[2.5s] "INCOMING.SIGNAL DETECTED..." Heavy static in portrait area.
[2.7s] Static gradually clears. Commander outline emerges.
[2.9s] Portrait resolved. "LINK ESTABLISHED."
[3.0s] All zones ONLINE. Screen brightness rises to 100%.
[3.2s] Center screen: "ALL SYSTEMS NOMINAL" flashes in white, fades.
       Satisfying confirmation chord.
[3.5s] Boot complete. Glyph rain gone. Gameplay begins.
```
