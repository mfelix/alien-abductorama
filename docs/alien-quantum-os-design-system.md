# Alien Quantum OS — Design System & Visual Reference

## What Is Alien Quantum OS?

Alien Quantum OS is the fictional operating system that runs aboard the UFO in *Alien Abductorama*. It is the player's interface to the ship — every HUD panel, diagnostic readout, and status indicator is rendered as part of this OS. When the game starts, the player watches Alien Quantum OS boot up, panel by panel, with scrolling diagnostic text, border traces, and system confirmations. It's the connective tissue that makes the HUD feel like a living, coherent system rather than just UI elements floating on screen.

Think of it as: **what if an alien civilization built a starship OS that was equal parts Neon Genesis Evangelion NERV HQ, Star Trek TNG LCARS, and 1980s CRT terminal?**

---

## Design Inspirations

| Source | What We Borrow |
|--------|----------------|
| **Neon Genesis Evangelion (NGE)** | Angular panel geometry with 45-degree cut corners, hex-grid textures, warning indicators, the feeling of a vast system barely under control |
| **Star Trek: TNG LCARS** | Clean ascending tones for panel activation, systematic boot-up sequences, the sense that every subsystem has its own dedicated display |
| **Retro CRT terminals** | Scanline overlays, phosphor glow, monospace typography, blinking cursors, the warmth of analog displays |
| **Military HUDs** | Status dots (nominal/caution/critical), abbreviated system labels, structured diagnostic output |

---

## The Boot Sequence

When a wave begins, the player witnesses the full Alien Quantum OS boot — a ~3.5 second choreographed sequence that unfolds in distinct phases:

### Phase 1: CRT Power-On (0–0.3s)

The screen is black. A thin white horizontal line appears at the center and rapidly expands outward (easeOutCubic). At 0.1s, the line begins expanding vertically, filling the screen with a bright white wash that fades as it grows. This mimics an old CRT monitor powering on — the electron gun spinning up, phosphors igniting.

**Sound:** A deep analog *thunk* followed by a rising electrical hum.

### Phase 2: Logo Display (0.3–1.3s)

The screen clears to pure black. The **ALIEN QUANTUM OS** logo appears:

- **Background:** A subtle hex-grid pattern pulses outward from center in concentric rings. Hexagons are tiny (6px radius), drawn in cyan at near-invisible opacity (3–8%), creating a faint honeycomb texture that breathes.
- **Title:** "ALIEN QUANTUM OS" in bold 32px monospace, centered. The color slowly shifts through cyan hues (HSL 165–195, 100% saturation, 50% lightness) on a 3-second sine cycle. Two glow passes create a neon effect — a wide soft halo (16px blur, 40% opacity) and a tight bright core (6px blur, full opacity).
- **Version:** Below the title, "v7.3.1 // QUANTUM ENTANGLEMENT CORE" in 10px monospace, cyan at 70% opacity. The version number blinks on a 1.2s cycle.
- **Loading bar:** A 200×4px bar with a sweeping cyan gradient pulse (800ms cycle), left to right. Label reads "QUANTUM CORE INITIALIZING" in 7px monospace, typed out character by character.
- **Orbital rings:** Two elliptical orbits of glowing cyan dots circle the logo — an inner ring (3 dots, clockwise, 3s period) and an outer ring (2 dots, counter-clockwise, 5s period). Each dot trails 3 afterimages with fading opacity.
- **Corner readouts:** Four corners display tiny blinking system text ("SYS.BOOT//INIT", "MEM.CHK OK", "CORE.FREQ 4.7THz", "UPLINK.STATUS: PENDING") at staggered blink rates, barely visible at 20% opacity.
- **Scan line:** A single horizontal line sweeps top-to-bottom continuously at 40px/s, cyan at 15% opacity with a soft glow.

The logo holds for 1.0s on the first wave (first impression) and 0.5s on subsequent waves.

**Sound:** A three-layer alien startup chord — harmonic, synthetic, otherworldly.

### Phase 3: Dissolve (0.2s)

The logo alpha fades to zero over 0.2 seconds. The screen goes black.

### Phase 4: Border Trace (0.75s)

A glowing dot traces the entire perimeter of the game canvas, drawing the HUD frame as it goes. The dot is white with a green glow (8px blur), trailing 8 afterimage squares that fade from 30% to 0% opacity. Behind the dot, a subtle green border (30% opacity) persists, outlining the full screen.

The trace uses a custom easing function that accelerates and decelerates around corners (4-segment easeOutQuint), giving it an organic, deliberate feeling.

As the trace passes certain positions along the perimeter, it triggers individual HUD panels to begin their boot sequences. Panels are triggered at these approximate positions:

| Trace % | Panel Triggered |
|---------|----------------|
| 1% | SYS.STATUS |
| 4% | TECH.SYS |
| 7% | MISSION.CTL |
| 10% | BM.CONDUIT |
| 14% | SYS.INTG |
| 20% | FLEET.CMD |
| 42% | COMMANDER |
| 55% | OPS.LOG |
| 60% | DIAG.SYS |
| 70% | ORD.SYS |

**Sound:** Four corner tones play as the trace reaches each screen corner — ascending pitched blips.

### Phase 5: Panel Boot (staggered, ~1–2s per panel)

Each panel independently boots with its own overlay animation (described below). Panels cascade in the order they were triggered, creating a left-to-right, top-to-bottom wave of activity across the HUD.

**Sound per panel:** A clean two-note ascending *boo-beep* when each panel starts booting. A soft sine *bloop* at random pitches for each diagnostic line. A three-note ascending *bwee-boo-beep* confirmation when each panel comes online.

### Phase 6: All Systems Online

When every active panel reaches "online" status, centered text appears: **"ALL SYSTEMS NOMINAL"** in bold 18px monospace, white with cyan glow (12px blur). Fades in over 0.3s, holds, fades out over 0.3s.

On wave 1, a final epilogue appears: **"MOTHERSHIP UPLINK ESTABLISHED"** — a flash of text that reinforces the narrative.

**Sound:** A positive two-tone confirmation chime — *bong-BING*.

---

## The Panel Boot Overlay

When an individual panel is "booting," it displays a self-contained overlay that communicates initialization progress:

### Visual Layers (bottom to top)

1. **Dark background:** Starts at 90% black opacity, fading to 10% as boot progresses. The panel contents beneath are completely obscured at first.

2. **Panel border:** Stroked rectangle in the panel's signature color. Alpha rises from 30% to 80% during boot.

3. **Border trace dot:** For the first 30% of progress, a glowing dot (the panel's color, 10px blur) traces the panel's own perimeter with a 60px gradient trail. This is a miniature version of the screen-wide border trace.

4. **Static/noise:** Random 2–4px gray squares scattered across the panel at low opacity (3–8%). Fades out by 40% progress. Simulates signal acquisition.

5. **Label typewriter:** The panel name (e.g., "SYS.STATUS") types out character by character in bold 10px monospace during the first 20% of progress.

6. **Diagnostic text:** Lines of system diagnostic text scroll in one by one, each typed out with a typewriter effect. Text is color-coded by prefix:
   - `>>` lines: Panel's signature color (status/prompt lines)
   - `[OK]` lines: Bright green (#00FF64) — system checks passed
   - `[SKIP]`/`[WARN]` lines: Yellow (#FFC800) — optional systems not found
   - Plain text: Light gray at 70% opacity — descriptive/loading text

7. **Blinking cursor:** A `_` character blinks at 400ms rate at the end of the current line being typed.

8. **Progress bar:** 3px tall bar at the bottom of the panel. Empty portion is the panel's color at 20% opacity, filled portion is solid.

9. **Scanline overlay:** Subtle horizontal lines every 3px at 8% black opacity, giving the panel a CRT texture.

### Online Flash

When a panel finishes booting, it flashes briefly (0.2s) — a full-panel wash of the panel's color at 15% opacity that rapidly fades. This "online" flash is the visual punctuation that the subsystem is live.

---

## HUD Panel System (NGE Panels)

Every panel in the HUD is rendered using the same base component: an **NGE Panel**. This creates visual consistency across the entire interface.

### Panel Anatomy

```
╔══════════════════════════════╗
║ ┌─────────────────────────┐  ║
║ │ LABEL            ■ ■   │  ║  ← Label + blink lights
║ │                         │  ║
║ │    [Panel Content]      │  ║  ← Zone-specific content
║ │                         │  ║
║ │                         │  ║
║ └─────────────────────────┘  ║
╚══════════════════════════════╝
     Outer border (1.5px)
       Inner glow (1px, 15% opacity, 2px inset)
```

### Visual Properties

- **Fill:** Very dark blue-black (`rgba(5, 8, 18, alpha)`) — nearly black but with a subtle cold blue tint. Default alpha: 0.65.
- **Outer border:** 1.5px stroke in the panel's signature color.
- **Inner glow border:** 1px stroke, 2px inset from outer, at 15% opacity of the panel color. Creates a subtle depth/glow effect.
- **Hex-grid texture:** Inside the filled area, a very faint (4% opacity) hexagonal grid pattern in the panel's color. Hexagons are 6px radius, offset in alternating rows (honeycomb layout). This is the signature Evangelion-inspired texture.
- **Cut corners:** Panels can have 45-degree diagonal cuts on any combination of corners (top-left, top-right, bottom-right, bottom-left). The cut removes a 10px triangle from the corner, creating the angular NGE look.
- **Label:** Bold 11px monospace in the panel's color, positioned at top-left (offset for cut corners).

### Panel Color & Identity Map

| Panel | Label | Color | Cut Corners | Role |
|-------|-------|-------|-------------|------|
| Status | SYS.STATUS | `#0ff` (cyan) | top-left | Score, wave, timer, combo |
| Mission | MISSION.CTL | `#0a0` (green) | none | Quota progress, harvest counter |
| Tech Tree | TECH.SYS | `#0a4` (green-teal) | none | Research nodes, tech progress |
| Bio-Matter | BM.CONDUIT | `#0f0` (lime) | none | Bio-matter upload stream |
| Systems | SYS.INTG | `#f80` (orange) | top-right | Hull, shields, energy cells |
| Weapons | ORD.SYS | `#f44` (red) | bottom-left | Bombs, missiles |
| Fleet | FLEET.CMD | `#48f` (blue) | top-right | Drones, coordinators |
| Commander | COMMS.SYS | `#0f0` (lime) | top-left, bottom-right | Commander portrait + dialogue |
| Diagnostics | DIAG.SYS | `#0af` (light cyan) | top-left | Real-time ship diagnostics |
| Ops Log | OPS.LOG | `#8af` (light blue) | bottom-left | Event history feed |

### Supplementary Visual Elements

**Blink Lights:** 4x4px squares that alternate between glowing (signature color with 4px blur) and dim (white at 10% opacity). Blink rates vary per panel (500–800ms).

**Status Dots:** Small circles with three states:
- Nominal: solid green `#0f0`
- Caution: yellow `#fc0`, pulsing at 400ms
- Critical: red `#f33`, pulsing rapidly at 120ms
Each has a white core at 40% opacity and a 6px glow.

**Indicators:** Small geometric shapes (square, diamond, triangle, circle, cross) with multiple animation modes:
- Steady: simple on/off blink
- Double: two short bursts per cycle (military radar feel)
- Cascade: sequential activation across a group
- Reactive: changes rate/color based on game values

**Scanlines:** Horizontal lines every 3px, scrolling slowly. Occasional glitch bands and horizontal tear effects at very low opacity (1.5%).

**Segmented Bars:** Progress bars divided into segments with 2px gaps. Top-edge highlight for 3D effect. Optional pulse animation on trailing segments.

---

## Color System

### Primary Palette

| Hex | Name | Usage |
|-----|------|-------|
| `#0ff` | **Cyan** | Primary UI color, status panel, logo, startup chord |
| `#0f0` | **Lime Green** | Bio-matter, commander, general "go" state |
| `#0a0` | **Green** | Mission control, quota systems |
| `#0a4` | **Teal Green** | Tech tree, research systems |
| `#0af` | **Light Cyan** | Diagnostics panel |
| `#8af` | **Light Blue** | Operations log |
| `#48f` | **Blue** | Fleet command |
| `#f80` | **Orange** | Systems integrity, shields |
| `#f44` | **Red** | Weapons/ordnance |
| `#ff0` | **Yellow** | Warnings, combo indicators |

### Status Colors

| Color | Meaning |
|-------|---------|
| `#0f0` | Nominal / healthy |
| `#fc0` | Caution / moderate |
| `#f33` | Critical / danger |
| `#333` | Offline / inactive |

### Background

- Screen background: pure black `#000`
- Panel fill: `rgba(5, 8, 18, 0.65)` — near-black with cold blue undertone
- The overall palette is neon-on-black, high contrast, with the cyan-green spectrum dominating

---

## HUD Layout

The HUD is organized into zones around the edges of the canvas, leaving the center clear for gameplay:

```
┌──────────┬───┬──────────┬───┬─────────┐
│SYS.STATUS│T.S│MISSION.CT│BM │ SYS.INTG│  ← Top row (10px margin)
│  (cyan)  │   │ (green)  │   │ (orange)│
├──────────┘   └──────────┘   └─────────┤
│ ORD.SYS                     FLEET.CMD │  ← Side columns
│  (red)                        (blue)  │
│                                       │
│            [GAME AREA]                │
│                                       │
│ COMMS.SYS                   DIAG.SYS │  ← Lower panels
│  (lime)                   (lt. cyan)  │
│                              OPS.LOG  │
│                            (lt. blue) │
└───────────────────────────────────────┘
```

- **Top row:** 10px margin from edges. Status (left, 120px tall), Mission (center, 72px), Systems (right, 90px). Tech and Bio-Matter fill the gaps between these panels.
- **Side columns:** Weapons on left, Fleet on right. Dynamic heights.
- **Bottom:** Commander bottom-left, Diagnostics and Ops Log bottom-right.

---

## Commander Panel

The Commander panel deserves special mention as it has unique interactive elements:

- **Speaking glow:** When the Commander is speaking (typewriter active), the panel's fill alpha pulses from 0.60 to 0.90 at 6Hz — a rapid, subtle breathing effect.
- **Accent line:** A 2px vertical line on the left edge of the panel pulses at 3Hz (0.1–0.5 alpha). Suggests an active transmission.
- **Status dots:** Three labeled dots below the panel header:
  - COMMS (green, always on)
  - SYNC (cyan, blinks at 500ms when speaking)
  - LOCK (yellow, blinks at 300ms until dialogue completes)
- **Corner accents:** Small triangular marks at the non-cut corners, green at 30% opacity.
- **Dialogue:** Lime green monospace text with typewriter effect at 25 characters/second. Word-wrapped, max 4 lines visible.
- **Speech sound:** Garbled alien vocalization every 2–3 characters — "Charlie Brown parent meets robotic glitch."

---

## Wave 1 Tutorial Behavior

On the very first wave, Alien Quantum OS reveals itself progressively to avoid overwhelming new players:

1. **Initial boot:** Only STATUS, SYSTEMS, and bottom panels boot. The top-center area (MISSION, TECH.SYS, BM.CONDUIT) remains empty.
2. **Commander speaks:** "Welcome aboard! We need BIOMATTER. Follow instructions. HIT YOUR QUOTA."
3. **Beam hint triggers:** Commander says "Those are biomatter. BEAM THEM UP!" — at this moment, MISSION.CTL and BM.CONDUIT boot in simultaneously with full diagnostic text animations.
4. **TECH.SYS:** Stays hidden until the player reaches the shop between waves. It naturally appears on wave 2+.

This creates a narrative-driven UI reveal where each panel appears when it becomes contextually relevant.

---

## Boot Diagnostic Text Examples

Each panel displays unique diagnostic text during its boot sequence. The text adapts to game state:

### Wave 1 (First Activation)
```
>> FIRST ACTIVATION DETECTED
SCORE MODULE        [########] OK
INITIALIZING HARVEST PROTOCOLS
[OK] SENSORS CALIBRATED
>> MOTHERSHIP UPLINK ESTABLISHED
```

### Subsequent Waves
```
>> INIT SYS.STATUS v3.0
WAVE 3 DEPLOYMENT
[OK] SCORE TELEMETRY ONLINE
[OK] COMBO TRACKER LINKED
[OK] BIO.MATTER MONITOR (4 TECH)
>> STATUS NOMINAL
```

### Weapons (with missiles)
```
>> INIT ORD.SYS
[OK] ORD.BOMB ARMED
SCANNING MISSILE.SYS...
[OK] MISSILE GROUPS: 2
LOADING SALVO PATTERNS...
[OK] ORDNANCE SYSTEMS HOT
>> WEAPONS FREE
```

### Bio-Matter Conduit
```
>> INIT BM.CONDUIT
LINKING UPLOAD STREAM...
[OK] BIO-MATTER BUFFER ALLOC
[OK] CONDUIT ESTABLISHED
>> UPLOAD CONDUIT READY
```

---

## Logo Design Brief

The current Alien Quantum OS logo is rendered procedurally in-game. For a redesigned version (SVG), the logo should capture:

### What It Is
- The boot screen of an alien spacecraft's operating system
- Seen by the player for 0.5–1.0 seconds every wave
- Sets the tone: advanced alien technology, slightly retro, deeply functional

### Visual Language
- **Typography:** Monospace, bold, clean. "ALIEN QUANTUM OS" as three words.
- **Color:** Cyan (`#0ff`) is the primary logo color. It shifts subtly through nearby hues (teal to sky blue). Neon glow effect — bright core with soft halo.
- **Background context:** Always displayed on pure black. The hex-grid honeycomb pattern is the signature background texture.
- **Supporting elements:** Orbital dots (inner/outer rings), scanning line, corner data readouts. These suggest a living system, not a static badge.
- **Mood:** Alien but functional. Not organic/biological — this is engineered technology. Clean geometry, precise typography, purposeful animation cues.

### Current Rendering Details
- Font: bold 32px monospace
- Color: `hsl(180 ± 15, 100%, 50%)` — cyan with gentle hue oscillation
- Two-layer glow: 16px soft outer + 6px bright inner
- Version text below: "v7.3.1 // QUANTUM ENTANGLEMENT CORE"
- Hex grid background: 6px radius hexagons, cyan at 3–8% opacity, with radiating pulse
- Loading bar: 200x4px with sweeping gradient
- Orbital rings of 2–3 dots each, opposing rotation directions
