# Phase 2 Visual Design System
## Command Phase: Territory Expansion

**Status**: Design Proposal
**Date**: 2026-02-13

---

## I. VISUAL MOOD — The Feeling of Phase 2

### THE DESIGNER SPEAKS:

Phase 1 is a cockpit. One screen. Your hands on the controls. Everything pulsing in your peripheral vision. The HUD is TIGHT — a pilot's instrument cluster strapped to your eyeballs.

Phase 2 is a war room. You step back. The single battlefield shrinks into a window — then two windows, then four, then sixteen. The density doesn't decrease — it MULTIPLIES. Where Phase 1 had one energy bar, Phase 2 has sixteen energy bars, eight crew portraits, three resource pipelines, a boss's face glaring at you, and a tech tree that branches three ways. The information density goes from "fighter jet" to "aircraft carrier CIC."

The feeling: **you are watching systems you built run without you.** The anxiety shifts from "will I dodge that missile?" to "will Zone B hold while I deal with Zone A's crisis?" It's the same adrenaline, refracted through a management lens.

### THE ILLUSTRATOR SPEAKS:

Phase 1's visual language is ALIEN PUNK. Cyan on black. Scanlines bleeding. Hexagonal honeycombs behind everything. The commander's portrait is a holographic ghost — green skin, void-black eyes, phosphor noise crawling over it. Every panel border traces itself into existence like the ship is drawing its own nervous system.

Phase 2 doesn't abandon this. It EVOLVES it. The alien punk aesthetic gets COLDER, more AUTHORITATIVE. The cyan stays but gets joined by deep indigo, amber warning tones, and a new color: DIRECTOR RED. A deep, dried-blood crimson that only appears when THE DIRECTOR is involved. Where Phase 1's commander had warm green skin, the Director's visual presence should feel like opening a freezer door — the color temperature drops, the scanlines slow down, everything gets still and heavy.

The crew members are the WARMTH in this cold system. Each one a tiny beacon of personality rendered in geometric shapes. When they succeed, their zone glows. When they burn out, their shapes dim and fragment. They are the human (alien) cost of your decisions, and you see it in every pixel.

---

## II. EXTRACTED VISUAL DNA — Phase 1's Identity

### Core Color Palette

```
PRIMARY SYSTEM COLORS
├── Cyan (#0ff)          — Primary HUD, data, status, the "blood" of the system
├── Green (#0f0)         — Positive state, nominal, commander speech
├── Yellow (#ff0, #fc0)  — Caution, points, mid-tier warnings
├── Orange (#f80, #fa0)  — Energy, ordnance, secondary warnings
├── Red (#f44, #f00)     — Critical, damage, danger
├── Magenta (#f0f)       — Energy surge, beam effects, exotic energy
├── White (#fff)         — Flash emphasis, text, structural highlights

BACKGROUND & STRUCTURE
├── Deep Black (#000)    — True black, CRT void
├── Panel Fill           — rgba(5, 8, 18, 0.65) — near-black with blue tint
├── Dim Gray (#333)      — Inactive elements, empty bars
├── Mid Gray (#888)      — Secondary text, labels
├── Light Gray (#aaa)    — Tertiary labels, descriptions

ALIEN BIOLOGY
├── Commander Skin       — #0a5 (dark alien green)
├── Cranium Highlight    — rgba(0, 220, 120, 0.15)
├── Eyes                 — #000 (absolute void)
├── Eye Reflection       — rgba(180, 255, 200, 0.35)
├── Nostrils             — #073

TRACK COLORS (Tech Tree)
├── Power Grid           — #f80 (orange)
├── Drone Command        — #48f (blue)
├── Defense Network      — #d60 (deep orange)
```

### Typography System

```
HIERARCHY
├── 48px bold monospace  — Boot countdown, wave number (BIOS)
├── 32px bold monospace  — Boot countdown number
├── 28px bold monospace  — Wave summary header (hex-decode)
├── 24px bold monospace  — Score display
├── 22px bold monospace  — Wave points total
├── 16px bold monospace  — NGE values, important numbers
├── 14px bold monospace  — Section headers, labels
├── 13px monospace       — Commander dialogue (speech bubbles)
├── 12px bold monospace  — BIOS boot text, swarm status
├── 11px bold monospace  — NGE labels, system text
├── 11px monospace       — BIOS diagnostic lines
├── 9px bold monospace   — Progress bar values
├── 8px monospace        — Data stream characters
├── 7px bold monospace   — Tech tree labels, research queue
├── 7px monospace        — Micro-text, secondary tech info

RULE: Everything is monospace. No exceptions. Ever.
```

### Panel Architecture (NGE System)

The `renderNGEPanel()` function is the foundation. Key properties:
- **45-degree corner cuts** — configurable per corner (`cutCorners: ['tl', 'br']`)
- **Hex-grid texture** — subtle hexagonal background at 4% opacity, 12px hex size
- **Double border** — outer stroke at 1.5px, inner glow line at 1px, 2px inset
- **Dark fill** — `rgba(5, 8, 18, alpha)` with configurable alpha (default 0.65)
- **Label in top-left** — bold 11px monospace in panel color

### Animation Rhythms

```
ALWAYS RUNNING (the "breathing")
├── Scanline scroll     — Variable speed (80+/-60px/s), burst 2x every 5s
├── Energy pulse sweep  — Every 3.5s, top-to-bottom at 220px/s
├── Hover oscillation   — sin(t * 2) * 3px — UFO floats gently
├── Blink lights        — 300-700ms cycles per indicator
├── Glitch bands        — Every ~300ms, 1-3 bright scan bars, occasional tears

REACTIVE (responds to game state)
├── Health shake        — Intensity scales with damage, 0-5px random
├── Red tint overlay    — Pulses at 300-800ms based on health tier
├── Spark particles     — Random emission from HUD edges at <10% health
├── Panel slide-in      — easeOutCubic over ~25 frames (0.04/frame)
├── Research glow       — sin(time/800) pulsing on active research nodes
├── Critical blink      — sin(time/120) rapid flash for critical status
├── Caution pulse       — sin(time/400) gentle throb for caution status
├── Charging shimmer    — Sweeping white highlight across energy bars

SCRIPTED (boot sequence, transitions)
├── Border trace        — Dot traces perimeter with afterimages
├── Panel boot overlay  — Dark-to-clear with diagnostic text scroll
├── CRT power-on        — Horizontal line expands to fill screen
├── Hex decode          — Random characters settle into final text
├── Typewriter          — 25 chars/second for commander dialogue
```

### Composite Operations Used

```
ctx.globalCompositeOperation = 'lighter'   — Chromatic aberration (warp ghosts)
ctx.globalCompositeOperation = 'source-over' — Everything else (default reset)
ctx.shadowBlur + ctx.shadowColor           — Neon glow on borders, dots, text
Linear gradients                           — Beam cones, bar highlights, energy
Radial gradients (implicit via arc + alpha) — Glow halos around entities
Clipping regions (ctx.clip())              — Panel content containment
```

---

## III. PHASE 2 NEW COLOR VOCABULARY

### Director's Palette — THE OPPRESSOR

```
DIRECTOR RED SYSTEM
├── Director Primary     — #a00 (dried blood, authority)
├── Director Glow        — rgba(170, 0, 0, 0.4) — HUD tint during transmissions
├── Director Border      — #c22 (panel borders when Director speaks)
├── Director Text        — #f33 (demands, quota warnings)
├── Director Satisfied   — #a80 (rare — grudging amber approval)
├── Director Background  — rgba(30, 0, 0, 0.85) — speech bubble fill

USAGE: Director red NEVER appears in regular gameplay. It's reserved.
When it shows up, the player's stomach should drop.
```

### Command Authority Palette — THE PLAYER'S NEW IDENTITY

```
COMMAND GOLD
├── Command Primary      — #d4a017 (gold, leadership, authority)
├── Command Glow         — rgba(212, 160, 23, 0.3) — your decisions glow gold
├── Command Border       — #b8860b — panel frames in command mode
├── Command Label        — #daa520 — section headers

COMMAND INDIGO (information/intelligence)
├── Indigo Primary       — #4a3f8a (deep purple-blue, strategic depth)
├── Indigo Glow          — rgba(74, 63, 138, 0.3) — intelligence overlays
├── Indigo Border        — #5a4f9a
├── Indigo Data          — #8a7fd0 — data streams, analytics
```

### Crew State Colors — THE EMOTIONAL PALETTE

```
CREW MORALE SPECTRUM (warm = good, cold = bad)
├── Thriving             — #4cff4c (bright warm green, glow radius 8px)
├── Content              — #0c8 (standard green, glow radius 4px)
├── Neutral              — #0aa (teal, minimal glow)
├── Stressed             — #da0 (warm amber, pulsing at 500ms)
├── Strained             — #f60 (orange, pulsing at 300ms)
├── Breaking             — #f22 (red, rapid pulse at 150ms, particle emission)
├── Burned Out           — #555 (gray, no glow, static noise overlay)

TRAIT COLORS (personality visualization)
├── Reckless             — #f44 glow, jagged shape edges
├── Cautious             — #0af glow, smooth rounded shapes
├── Greedy               — #fc0 glow, angular/hoarding geometry
├── Loyal                — #0f0 glow, stable symmetric forms
├── Whiner               — #f0f accents, squiggly line details
├── Hotshot              — #ff0 core, #f44 edges (burns bright then red)
```

### Zone State Colors — THE BATTLEFIELD AT A GLANCE

```
ZONE BORDER SYSTEM (4px outer border on zone panels)
├── Stable               — #0f0 solid 1.5px
├── Stressed             — #fc0 solid 2px, pulse at 600ms
├── Crisis               — #f44 solid 3px, pulse at 200ms
├── Emergency            — #f00 3px FLASHING (100ms on/off), screen-edge bleed
├── Offline/Decaying     — #555 dashed 2px, drift timer visible

ZONE FILL TINT (subtle background overlay inside zone panel)
├── Nominal              — rgba(0, 255, 0, 0.03)
├── Under Pressure       — rgba(255, 200, 0, 0.05)
├── Critical             — rgba(255, 0, 0, 0.06), pulsing
├── Override Active      — rgba(0, 255, 255, 0.08), scan lines accelerate
```

---

## IV. ALIEN CREW MEMBERS — Canvas-Drawn Characters

### THE DESIGNER:
Every crew member is built from geometric primitives. No sprites. The same canvas API that draws drones, coordinators, and the commander portrait — ellipses, arcs, bezier curves, fillRect. This means they can TRANSFORM. Eyes can narrow. Bodies can slump. Auras can pulse. They're not static images — they're living geometry.

### THE ILLUSTRATOR:
I want every crew member to feel like a DIFFERENT SPECIES. Not just palette swaps. The Reckless one has sharp angular geometry — triangular head, spiky appendages. The Cautious one is all smooth circles and protective curves. Personality IS shape.

### Base Anatomy — The Alien Template

```
CREW MEMBER ANATOMY (scalable, works at 32px to 120px)
┌─────────────────────────────────────────────┐
│                                             │
│        ╭──────╮    ← CRANIUM: ellipse,      │
│       │  ◉  ◉ │      size varies by trait   │
│        ╰──┬──╯    ← FACE: quadratic curves  │
│           │          taper to chin point     │
│        ┌──┴──┐    ← BODY: rounded rect or   │
│        │     │       custom shape per trait  │
│        │ ▓▓▓ │    ← CORE: status indicator  │
│        └──┬──┘       (energy/morale glow)   │
│          ╱ ╲      ← LIMBS: line segments    │
│         ╱   ╲        with joint articulation│
│                                             │
└─────────────────────────────────────────────┘
```

### Drawing Function: `renderCrewMember(x, y, size, crew)`

```javascript
// PSEUDO-CODE — Key rendering approach

function renderCrewMember(x, y, size, crew) {
    const s = size;
    const cx = x + s/2;
    const cy = y + s/2;
    const trait = crew.primaryTrait; // 'reckless' | 'cautious' | etc.
    const morale = crew.morale;     // 0.0 - 1.0
    const stress = crew.stress;     // 0.0 - 1.0

    // === MORALE AURA (background glow) ===
    // A soft radial glow behind the character that reflects emotional state
    const moraleColor = getMoraleColor(morale); // from spectrum above
    const auraPulse = morale < 0.3
        ? Math.sin(Date.now() / 150) * 0.3 + 0.4  // rapid stress pulse
        : 0.3 + morale * 0.3;                       // gentle breathing

    ctx.save();
    ctx.globalAlpha = auraPulse;
    ctx.fillStyle = moraleColor;
    ctx.shadowColor = moraleColor;
    ctx.shadowBlur = s * 0.3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 0.4, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // === HEAD SHAPE (trait-driven geometry) ===
    const headShapes = {
        reckless: () => {
            // Triangular/angular cranium — diamond-like, sharp
            ctx.beginPath();
            ctx.moveTo(cx, cy - s * 0.35);           // top point
            ctx.lineTo(cx + s * 0.22, cy - s * 0.12); // right temple
            ctx.lineTo(cx + s * 0.15, cy + s * 0.05); // right jaw
            ctx.lineTo(cx, cy + s * 0.12);             // chin
            ctx.lineTo(cx - s * 0.15, cy + s * 0.05); // left jaw
            ctx.lineTo(cx - s * 0.22, cy - s * 0.12); // left temple
            ctx.closePath();
        },
        cautious: () => {
            // Wide, rounded cranium — protective, shell-like
            ctx.beginPath();
            ctx.ellipse(cx, cy - s * 0.1, s * 0.25, s * 0.28, 0, 0, Math.PI * 2);
        },
        greedy: () => {
            // Squat, wide head — toad-like, accumulating
            ctx.beginPath();
            ctx.ellipse(cx, cy - s * 0.06, s * 0.28, s * 0.2, 0, 0, Math.PI * 2);
        },
        loyal: () => {
            // Balanced oval — classic alien proportions (like the commander)
            ctx.beginPath();
            ctx.ellipse(cx, cy - s * 0.08, s * 0.2, s * 0.3, 0, Math.PI, Math.PI * 2);
            // Lower face taper
            ctx.moveTo(cx - s * 0.2, cy - s * 0.08);
            ctx.quadraticCurveTo(cx - s * 0.12, cy + s * 0.12, cx, cy + s * 0.18);
            ctx.quadraticCurveTo(cx + s * 0.12, cy + s * 0.12, cx + s * 0.2, cy - s * 0.08);
        },
        whiner: () => {
            // Elongated, droopy — pear-shaped, perpetually deflated
            ctx.beginPath();
            ctx.ellipse(cx, cy - s * 0.12, s * 0.16, s * 0.24, 0, Math.PI, Math.PI * 2);
            ctx.quadraticCurveTo(cx + s * 0.16, cy + s * 0.08, cx + s * 0.08, cy + s * 0.2);
            ctx.quadraticCurveTo(cx, cy + s * 0.22, cx - s * 0.08, cy + s * 0.2);
            ctx.quadraticCurveTo(cx - s * 0.16, cy + s * 0.08, cx - s * 0.16, cy - s * 0.12);
        },
        hotshot: () => {
            // Sleek, aerodynamic — swept-back cranium
            ctx.beginPath();
            ctx.moveTo(cx, cy - s * 0.32);
            ctx.bezierCurveTo(
                cx + s * 0.25, cy - s * 0.28,
                cx + s * 0.22, cy - s * 0.05,
                cx + s * 0.1, cy + s * 0.1
            );
            ctx.quadraticCurveTo(cx, cy + s * 0.15, cx - s * 0.1, cy + s * 0.1);
            ctx.bezierCurveTo(
                cx - s * 0.22, cy - s * 0.05,
                cx - s * 0.25, cy - s * 0.28,
                cx, cy - s * 0.32
            );
        }
    };

    // Draw the head
    ctx.fillStyle = getTraitSkinColor(trait); // variant of alien green
    (headShapes[trait] || headShapes.loyal)();
    ctx.fill();

    // === EYES (expression system) ===
    renderCrewEyes(cx, cy, s, crew);

    // === BODY CORE INDICATOR ===
    // Small glowing shape in the "chest" area that shows current performance
    const coreY = cy + s * 0.2;
    const performance = crew.currentPerformance; // 0-1
    const coreColor = performance > 0.7 ? '#0ff' :
                      performance > 0.4 ? '#fc0' : '#f44';
    ctx.fillStyle = coreColor;
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = s * 0.1;
    ctx.beginPath();
    ctx.arc(cx, coreY, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // === BURNOUT OVERLAY ===
    if (crew.burnedOut) {
        // Static noise crawls over the entire character
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 8; i++) {
            const nx = x + Math.random() * s;
            const ny = y + Math.random() * s;
            ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.5})`;
            ctx.fillRect(nx, ny, 2 + Math.random() * 3, 1);
        }
        ctx.globalAlpha = 1;
    }
}
```

### Eye Expression System

```javascript
function renderCrewEyes(cx, cy, s, crew) {
    const eyeY = cy - s * 0.06;
    const eyeSpacing = s * 0.1;
    const baseEyeW = s * 0.08;
    const baseEyeH = s * 0.04;

    // Expression modifiers (these transform the eye geometry)
    let eyeW = baseEyeW;
    let eyeH = baseEyeH;
    let eyeSlant = 0.8; // radians, inward tilt

    if (crew.morale > 0.8) {
        // Happy: eyes widen slightly, upward tilt
        eyeH *= 1.2;
        eyeSlant = 0.6;
    } else if (crew.morale < 0.2) {
        // Miserable: eyes narrow, droop downward
        eyeH *= 0.6;
        eyeSlant = 1.2;
    }

    if (crew.stress > 0.8) {
        // Stressed: eyes jitter, rapid micro-shake
        const jitter = Math.sin(Date.now() * 0.05) * s * 0.005;
        eyeW += jitter;
    }

    // Eye glow (emotional aura behind eyes)
    if (crew.morale < 0.3) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
    } else if (crew.isPerformingWell) {
        ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // no glow
    }
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.3, eyeH * 1.5, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.3, eyeH * 1.5, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Solid black alien eyes (the void)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Glassy reflection
    ctx.fillStyle = 'rgba(180, 255, 200, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing - eyeW * 0.3, eyeY - eyeH * 0.2,
                s * 0.012, s * 0.008, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing + eyeW * 0.3, eyeY - eyeH * 0.2,
                s * 0.012, s * 0.008, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();
}
```

### Crew at Different Scales

```
ZONE PANEL (32-40px) — GLYPH MODE
┌────────────────┐
│ Silhouette only. Head shape + morale color dot.
│ No eyes, no body detail. Pure recognition shape.
│ The trait IS the silhouette:
│   Reckless = diamond    Cautious = circle
│   Greedy = wide oval    Loyal = classic alien
│   Whiner = teardrop     Hotshot = swept wing
└────────────────┘

SIDEBAR ROSTER (48-64px) — PORTRAIT MODE
┌────────────────┐
│ Head + eyes + core indicator.
│ Morale aura visible. Expression readable.
│ Name label below in 7px monospace.
│ Trait icon badge (tiny shape in corner).
└────────────────┘

DETAIL VIEW / COACHING (80-120px) — FULL MODE
┌────────────────┐
│ Full anatomy: head, eyes, body, limbs, core.
│ Animated idle pose (gentle breathing oscillation).
│ Stress particles if applicable.
│ Performance history sparkline below.
│ Trait badges, skill bars, coaching indicators.
└────────────────┘
```

---

## V. ZONE PANELS — Mini Battlefields

### THE DESIGNER:
Each zone panel is a MINIATURE version of the Phase 1 game view. Same stars, same ground plane, same UFO and tanks. But compressed. The crew member's UFO is a tiny sprite. The tanks are simplified shapes. The tractor beam is a thin line. What matters isn't the ACTION — you can't play it. What matters is the HEALTH of the system: is this zone green, yellow, or red?

### Zone Panel Structure (2-zone layout)

```
┌─────────────────────────────────────────────────────────────┐
│  SECTOR A-7                          ▸ STABLE   [●] CREW-3 │  ← Zone header (12px)
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│  ★  ★     ★                  ★        ★    ★               │  ← Star field (dimmed)
│       ★          ★                         ★                │
│                                                             │
│              ┌──────┐                                       │  ← Mini UFO (crew)
│              │ ◇◇◇◇ │   ╲                                  │
│              └──────┘     ╲  beam                           │
│                            ╲                                │
│  ▄▄  ▄▄▄      ▄▄    ☻ ☻    ╲  ☻  ☻        ▄▄▄  ▄▄       │  ← Ground: tanks, targets
│ ████████████████████████████████████████████████████████████ │
│ ─────────────────────────────────────────────────────────── │
│  THREAT: ████████░░  DRONES: 3/5  ENERGY: ██████░░  Q: 7/10│  ← Status bar (10px)
└─────────────────────────────────────────────────────────────┘
     ↑
     4px border color = zone state
```

### Zone Panel Rendering Approach

```javascript
function renderZonePanel(zx, zy, zw, zh, zoneData) {
    // 1. NGE panel container with zone-state border color
    const borderColor = getZoneBorderColor(zoneData.state);
    renderNGEPanel(zx, zy, zw, zh, {
        color: borderColor,
        cutCorners: ['tl'],
        alpha: 0.75,
        label: zoneData.name
    });

    // 2. Mini starfield (reuse renderStars() with clipped region)
    ctx.save();
    ctx.beginPath();
    ctx.rect(zx + 2, zy + 16, zw - 4, zh - 32);
    ctx.clip();

    // Render simplified battlefield at zone scale
    renderMiniStarfield(zx, zy, zw, zh, zoneData.starSeed);
    renderMiniGround(zx, zy + zh - 30, zw);
    renderMiniUFO(zx, zy, zw, zh, zoneData.crewUFO);
    renderMiniTanks(zx, zy, zw, zh, zoneData.tanks);
    renderMiniTargets(zx, zy, zw, zh, zoneData.targets);

    // Beam effect (thin cyan line if active)
    if (zoneData.crewUFO.beamActive) {
        renderMiniBeam(zx, zy, zw, zh, zoneData.crewUFO);
    }

    ctx.restore();

    // 3. Status bar at bottom
    renderZoneStatusBar(zx, zy + zh - 14, zw, zoneData);

    // 4. Crew indicator (top-right corner)
    const crewSize = 24;
    renderCrewMember(zx + zw - crewSize - 6, zy + 2, crewSize, zoneData.crew);

    // 5. Crisis overlay (if zone is in crisis)
    if (zoneData.state === 'crisis' || zoneData.state === 'emergency') {
        renderZoneCrisisOverlay(zx, zy, zw, zh, zoneData);
    }

    // 6. Zone border pulse for stressed/crisis states
    if (zoneData.state !== 'stable') {
        const pulseRate = zoneData.state === 'emergency' ? 100 :
                         zoneData.state === 'crisis' ? 200 : 600;
        const pulseAlpha = Math.sin(Date.now() / pulseRate) * 0.3 + 0.5;
        ctx.strokeStyle = `rgba(${hexToRgb(borderColor)}, ${pulseAlpha})`;
        ctx.lineWidth = zoneData.state === 'emergency' ? 3 : 2;
        ctx.strokeRect(zx, zy, zw, zh);
    }
}
```

### Zone Panel Transitions

```
ZONE UNLOCK ANIMATION (new zone materializing):
  Frame 0-15:  Quantum noise cloud at zone position (same as UFO phase-in)
  Frame 15-30: Wireframe outline of zone panel, flickering
  Frame 30-45: Panel border traces itself (like boot sequence trace)
  Frame 45-60: Interior fades in — starfield first, then ground, then entities
  Frame 60+:   Status bar boots (mini panel boot overlay)
  Sound:       Deep bass drone → ascending tone → panel boot beeps

ZONE CRISIS OVERLAY:
  - Red vignette bleeding inward from zone panel edges
  - "CRISIS" text flashing at 200ms in center
  - Scanlines accelerate within zone (double speed)
  - Mini-particles (red sparks) along zone border
  Sound: Alarm klaxon, pitch increases with severity
```

---

## VI. THE DIRECTOR — Visual Terror

### THE ILLUSTRATOR:
The Director is NOT another green alien. The Director is something ELSE. Bigger. Older. Wrong-looking. Where the commander had warm green skin and smooth curves, the Director has COLD GRAY-BLUE skin and sharp angles. The eyes are larger — they take up more of the face. The skull is more elongated, more insectoid. There are subtle ridges along the cranium. The nostrils are slits. And the mouth — unlike the commander who has none — the Director has a thin, barely-visible line that can curve into disapproval.

### Director Portrait: `renderDirectorPortrait(x, y, size, mood)`

```javascript
function renderDirectorPortrait(x, y, size, mood) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;

    // BACKGROUND: Unlike commander's green holographic,
    // Director's bg is deep crimson void
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 4);
    ctx.fill();

    // Scanlines — SLOWER than commander (oppressive, heavy)
    ctx.fillStyle = 'rgba(170, 0, 0, 0.04)';
    for (let i = 0; i < s; i += 4) {  // 4px spacing (wider = more oppressive)
        ctx.fillRect(x, y + i, s, 1);
    }

    // Interference noise (different from commander's green static)
    // Director has HORIZONTAL TEAR LINES
    if (Math.random() < 0.08) {
        const tearY = y + Math.random() * s;
        const tearH = 2 + Math.random() * 4;
        ctx.fillStyle = 'rgba(170, 0, 0, 0.3)';
        ctx.fillRect(x, tearY, s, tearH);
        // Offset duplicate (chromatic aberration)
        ctx.fillStyle = 'rgba(0, 0, 170, 0.15)';
        ctx.fillRect(x + 3, tearY + 1, s, tearH - 1);
    }

    // HEAD: elongated, angular, GRAY-BLUE skin
    const headCenterY = cy - s * 0.02;

    // Cranium — more angular than commander, wider top
    ctx.fillStyle = '#2a3a4a'; // cold gray-blue
    ctx.beginPath();
    ctx.ellipse(cx, headCenterY - s * 0.08, s * 0.3, s * 0.34, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Cranial ridges (3 subtle raised lines)
    ctx.strokeStyle = 'rgba(60, 80, 100, 0.4)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 3; r++) {
        const ridgeY = headCenterY - s * (0.25 - r * 0.06);
        ctx.beginPath();
        ctx.ellipse(cx, ridgeY, s * (0.25 - r * 0.03), s * 0.02, 0, 0, Math.PI);
        ctx.stroke();
    }

    // Lower face — sharper jaw, more angular taper
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, headCenterY - s * 0.08);
    ctx.lineTo(cx - s * 0.15, headCenterY + s * 0.2);   // sharper jaw
    ctx.lineTo(cx, headCenterY + s * 0.26);              // pointed chin
    ctx.lineTo(cx + s * 0.15, headCenterY + s * 0.2);
    ctx.lineTo(cx + s * 0.3, headCenterY - s * 0.08);
    ctx.fill();

    // EYES — LARGER than commander, more menacing
    const eyeY = headCenterY + s * 0.01;
    const eyeSpacing = s * 0.13;
    const eyeW = s * 0.18;   // wider than commander
    const eyeH = s * 0.06;
    const eyeSlant = 1.2;    // steeper slant

    // Eye sockets (dark recesses — the Director's face has more depth)
    ctx.fillStyle = 'rgba(10, 15, 25, 0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.3, eyeH * 2, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.3, eyeH * 2, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Mood-based eye glow
    const eyeGlowColors = {
        furious: 'rgba(255, 0, 0, 0.5)',
        displeased: 'rgba(255, 80, 0, 0.3)',
        neutral: 'rgba(100, 120, 160, 0.2)',
        satisfied: 'rgba(170, 120, 0, 0.2)'  // even satisfaction looks threatening
    };
    ctx.fillStyle = eyeGlowColors[mood] || eyeGlowColors.neutral;
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.1, eyeH * 1.3, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.1, eyeH * 1.3, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Void eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Director's eyes have a COLD reflection (blue-white, not green-white)
    ctx.fillStyle = 'rgba(180, 200, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing - eyeW * 0.2, eyeY - eyeH * 0.2,
                s * 0.025, s * 0.015, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing + eyeW * 0.2, eyeY - eyeH * 0.2,
                s * 0.025, s * 0.015, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Nostril slits (not dots — SLITS)
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.03, headCenterY + s * 0.11);
    ctx.lineTo(cx - s * 0.015, headCenterY + s * 0.14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.03, headCenterY + s * 0.11);
    ctx.lineTo(cx + s * 0.015, headCenterY + s * 0.14);
    ctx.stroke();

    // MOUTH LINE (the Director's signature — thin, horizontal, barely there)
    if (mood === 'furious' || mood === 'displeased') {
        ctx.strokeStyle = 'rgba(20, 30, 45, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Slight downward curve for displeasure
        const mouthY = headCenterY + s * 0.18;
        ctx.moveTo(cx - s * 0.06, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + s * 0.015, cx + s * 0.06, mouthY);
        ctx.stroke();
    }

    // BORDER — Director Red, thicker than commander
    ctx.strokeStyle = mood === 'furious' ? '#f00' :
                     mood === 'displeased' ? '#c22' :
                     mood === 'satisfied' ? '#a80' : '#a00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 4);
    ctx.stroke();
}
```

### Director Transmission Visual Treatment

```
WHEN THE DIRECTOR SPEAKS:

1. SCREEN EFFECT: The entire game canvas gets a subtle red overlay
   - rgba(170, 0, 0, 0.04) fills the screen
   - Scanlines slow down globally (speed * 0.5)
   - A low-frequency "heartbeat" pulse in the red tint (800ms cycle)

2. HUD INVASION: Director panel appears bottom-left (where commander used to be)
   - Slides in with easeOutCubic from left edge
   - Panel border is #c22 instead of normal panel colors
   - Background fill: rgba(30, 0, 0, 0.85) — blood-dark instead of blue-dark
   - Label: "DIR.CHANNEL" in #f33

3. PORTRAIT RENDERING: Full Director portrait (see above)
   - Shake effect (like commander angry, but ALWAYS slightly present)
   - Occasional horizontal tear/glitch across the portrait
   - The portrait BLINKS — eyes close to slits every ~4 seconds

4. SPEECH BUBBLE: Same typewriter mechanic as commander but
   - Text color: #f44 (red) instead of #0f0 (green)
   - Background: rgba(30, 0, 0, 0.85)
   - Typewriter speed: SLOWER (20 chars/sec vs 25)
   - Speech garble sound: deeper pitch, harsher sawtooth

5. EXIT: Panel slides out. Red overlay fades over 500ms. Scanlines resume.
```

### Director Report Card Visual

```
REPORT CARD PANEL LAYOUT
┌──────────────────────────────────────────────────┐
│  ◈ PERFORMANCE REVIEW — WAVE 7                   │  ← Director red header
│ ─────────────────────────────────────────────────│
│                                                  │
│  ┌────┐  "Your Zone A numbers are...            │  ← Director portrait + speech
│  │ ◉◉ │   acceptable. Zone B is a disaster.     │
│  │    │   I expected more from you, Commander."  │
│  └────┘                                          │
│                                                  │
│  ZONE A  ████████████░░  82%  [MET]             │  ← Zone performance bars
│  ZONE B  ████░░░░░░░░░░  34%  [MISSED]          │     Green/red per result
│                                                  │
│  OVERALL QUOTA:  ██████████░░  68%               │
│  DIRECTOR MOOD:  ▸ DISPLEASED                    │
│                                                  │
│  ─ RESPOND ──────────────────────────────────── │
│  [1] "We had equipment failures in Zone B."      │  ← Dialogue options
│  [2] "I take full responsibility."               │     (keyboard selectable)
│  [3] "Zone A exceeded targets — focus there."    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## VII. COMMAND HUD — The War Room

### THE DESIGNER:
The Phase 1 HUD is a RING around the battlefield — panels left, right, top. The center is clear for gameplay. Phase 2 inverts this: the ZONES are the center content, and the command panels surround them. The player's eyes should be drawn to the zones first (where the action is), then to the sidebar (where the decisions are).

### Full Command HUD Layout (2 zones)

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌────── CMD.STATUS ───────────────────────── WAVE 7 ──────────┐   │
│ │  SCORE: 12,450     QUOTA: ████████░░ 78%    TIME: 0:42      │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ ┌──────── ZONE A ──────────┐  ┌──────── ZONE B ──────────┐       │
│ │  SECTOR A-7    [●] KRIX  │  │  SECTOR B-3    [●] NURP  │       │
│ │  ─────────────────────── │  │  ─────────────────────── │       │
│ │       ★    ★   ★        │  │    ★       ★      ★      │       │
│ │    ★          ★    ★    │  │       ★        ★         │       │
│ │         ◇◇◇◇            │  │          ◇◇◇◇            │       │
│ │          ╲              │  │           ╲               │       │
│ │    ▄▄  ☻  ╲ ☻  ▄▄▄    │  │     ▄▄  ☻   ╲  ▄▄▄      │       │
│ │  ██████████████████████ │  │  ████████████████████████ │       │
│ │  THR:██░░ DRN:3 E:████ │  │  THR:████ DRN:1 E:██░░░ │       │
│ └─────────────────────────┘  └─────────────────────────┘        │
│                                                                    │
│ ┌──── CREW.ROSTER ────┐  ┌──── RESOURCES ─────┐  ┌── ORDERS ──┐ │
│ │ KRIX  [●] A-7  ★★★ │  │ ENERGY: ████░░ 64% │  │ [1] ZONE A │ │
│ │ NURP  [●] B-3  ★★  │  │ BIO-M:  1,240      │  │ [2] ZONE B │ │
│ │ (bench) ---     --- │  │ DRONES: 4/6        │  │ [O] OVERIDE│ │
│ └─────────────────────┘  │ CMD.PT: 2          │  │ [R] RESRC  │ │
│                          └────────────────────┘  └────────────┘  │
│ ┌── DIR.CHANNEL ──────────────────────────────────────────────┐  │
│ │  ┌──┐  "Don't let Zone B slip, Commander. I'm watching."    │  │
│ │  │◉◉│                                                       │  │
│ │  └──┘                                                       │  │
│ └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Command HUD Layout Function

```javascript
function getCommandHUDLayout(zoneCount) {
    const margin = 8;
    const topBarH = 32;
    const bottomBarH = 120; // Sidebar panels
    const dirChannelH = 64;

    if (zoneCount === 2) {
        // Zones side by side, management below
        const zoneAreaH = canvas.height - topBarH - bottomBarH - dirChannelH - margin * 5;
        const zoneW = (canvas.width - margin * 3) / 2;
        return {
            cmdStatus:  { x: margin, y: margin, w: canvas.width - margin * 2, h: topBarH },
            zones: [
                { x: margin, y: margin + topBarH + margin, w: zoneW, h: zoneAreaH },
                { x: margin * 2 + zoneW, y: margin + topBarH + margin, w: zoneW, h: zoneAreaH }
            ],
            crewRoster: { x: margin, y: canvas.height - bottomBarH - dirChannelH - margin * 2,
                         w: canvas.width * 0.3, h: bottomBarH },
            resources:  { x: canvas.width * 0.3 + margin * 2,
                         y: canvas.height - bottomBarH - dirChannelH - margin * 2,
                         w: canvas.width * 0.35, h: bottomBarH },
            orders:     { x: canvas.width * 0.65 + margin * 3,
                         y: canvas.height - bottomBarH - dirChannelH - margin * 2,
                         w: canvas.width * 0.35 - margin * 4, h: bottomBarH },
            dirChannel: { x: margin,
                         y: canvas.height - dirChannelH - margin,
                         w: canvas.width - margin * 2, h: dirChannelH }
        };
    }

    if (zoneCount === 4) {
        // 2x2 grid + sidebar
        const sidebarW = Math.min(220, canvas.width * 0.22);
        const zoneAreaW = canvas.width - sidebarW - margin * 3;
        const zoneAreaH = canvas.height - topBarH - margin * 3;
        const zoneW = (zoneAreaW - margin) / 2;
        const zoneH = (zoneAreaH - margin) / 2;
        return {
            cmdStatus: { x: margin, y: margin, w: canvas.width - margin * 2, h: topBarH },
            zones: [
                { x: margin, y: topBarH + margin * 2, w: zoneW, h: zoneH },
                { x: margin * 2 + zoneW, y: topBarH + margin * 2, w: zoneW, h: zoneH },
                { x: margin, y: topBarH + margin * 3 + zoneH, w: zoneW, h: zoneH },
                { x: margin * 2 + zoneW, y: topBarH + margin * 3 + zoneH, w: zoneW, h: zoneH }
            ],
            sidebar: { x: canvas.width - sidebarW - margin, y: topBarH + margin * 2,
                      w: sidebarW, h: canvas.height - topBarH - margin * 3 }
        };
    }
}
```

---

## VIII. THE PROMOTION CINEMATIC — The Flash Moment

### THE DESIGNER:
This is the most important visual moment in Phase 2. The player has spent potentially hours mastering Phase 1. This transition must feel EARNED, MASSIVE, and IRREVERSIBLE. It's the moment the game breaks its own rules.

### THE ILLUSTRATOR:
We're doing a CONTROLLED DESTRUCTION of the Phase 1 HUD. Every panel the player has grown to rely on — the energy bar, the tech tree, the fleet panel — they all DISSOLVE. And something new rises from the ashes.

### Cinematic Sequence (10-15 seconds)

```
PHASE A: THE CALL (0-3s)
─────────────────────
  0.0s: Wave summary finishes. Screen pauses. 500ms of silence.
  0.5s: A new transmission indicator appears — but WRONG.
        Instead of commander green, it's a color the player has NEVER SEEN.
        Deep crimson border. Label: "INCOMING — PRIORITY: SUPREME"
        The text FLICKERS — it's not clean like normal transmissions.
        Sound: A deep, resonant bass drone. Subsonic. Ominous.
  1.0s: Commander portrait (familiar green) GLITCHES.
        Horizontal tear lines streak across it.
        The portrait DISSOLVES into static.
        Sound: Distortion crackle, like a signal being overpowered.
  1.5s: Static clears. The Director's portrait materializes.
        COLD. GRAY-BLUE. Those enormous eyes.
        The portrait renders line by line, top-down, like a fax machine.
        Sound: Harsher sawtooth voice begins — deeper, slower.
  2.0s: Typewriter text: Director's promotion speech.
        "Impressive performance, Operator..."
        Text is #f44 (red), not #0f0 (green).
        Background: rgba(30, 0, 0, 0.85).

PHASE B: THE ZOOM (3-6s)
─────────────────────
  3.0s: Director finishes speaking. A COMMAND flashes:
        "YOU ARE HEREBY PROMOTED TO ZONE COMMANDER"
        Bold 24px, #d4a017 (command gold), centered.
        Glow: 16px blur gold, pulse at 400ms.
        Sound: Three ascending tones — authority chord.

  3.5s: The CAMERA begins pulling back.
        Implementation: the game viewport scales down.
        ctx.save();
        const zoom = 1 - (progress * 0.5); // 1.0 → 0.5 over 2.5s
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(zoom, zoom);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        // Render Phase 1 scene at reduced scale
        ctx.restore();

  4.0s: The Phase 1 HUD begins to DISSOLVE.
        Each panel gets a "power down" overlay:
        - Panel border color shifts to #555 (gray)
        - Content fades to static noise
        - A descending tone plays per panel (reverse of boot)
        - Panels dissolve LEFT to RIGHT, TOP to BOTTOM
        Sound: Descending cascade — panels shutting down.

  5.0s: The Phase 1 scene is now half-size, upper-left.
        A SECOND battlefield materializes to the right.
        Uses the same quantum noise → wireframe → solidify sequence
        as the UFO phase-in effect. But bigger. A whole zone.
        Sound: Deep dimensional bass hum, rising.

PHASE C: THE FLASH (6-8s)
─────────────────────
  6.0s: Both zones are visible at reduced scale.
        A BRIGHT WHITE FLASH fills the screen (200ms).
        Sound: Impact — thunderclap + capacitor discharge.

  6.2s: Flash fades. The screen is now the Command HUD.
        But it's NOT fully formed yet. It's a skeleton:
        - Zone borders traced in gold (#d4a017)
        - No content yet. Just structure.
        - Scanlines are GOLD instead of cyan.

  6.5s: COMMAND MODE BOOT SEQUENCE begins.
        Like the BIOS boot, but in GOLD.
        Each new command panel boots individually:
        - CMD.STATUS: "COMMAND SYSTEMS... INITIALIZING"
        - CREW.ROSTER: "PERSONNEL DATABASE... ONLINE"
        - RESOURCES: "RESOURCE PIPELINE... CONNECTED"
        - DIR.CHANNEL: "DIRECTOR UPLINK... ESTABLISHED"
        Sound: Boot tones in gold/amber frequency (warmer than Phase 1).

  8.0s: Final text: "COMMAND MODE ACTIVATED"
        Gold text, 32px bold, centered.
        Glow: 20px blur gold.
        Pulse twice, then fade.
        Sound: Authority confirmation — two deep BONG tones.

PHASE D: THE SETTLING (8-10s)
─────────────────────
  8.5s: Gold boot overlays fade. Real content appears.
        Zone panels show live (training wave) battlefields.
        Command panels populate with starter data.
        The familiar Phase 1 gameplay is visible INSIDE the zones.

  9.0s: Director's voice one more time:
        "Do not disappoint me."
        Text fades. Director panel slides out.

 10.0s: Training wave begins. Player has control.
```

---

## IX. 16-ZONE HEATMAP — The Abstraction Layer

### THE DESIGNER:
At 16 zones, we can't show individual battlefields. The display shifts from "watching gameplay" to "reading a dashboard." This is the Bloomberg Terminal moment. Pure data visualization. Glyphs, colors, numbers, and PATTERN RECOGNITION.

### Heatmap Cell Design

```
SINGLE HEATMAP CELL (approximately 60x60px in 4x4 grid)
┌──────────────┐
│  A-1    ●    │  ← Zone label (7px) + crew morale dot
│              │
│    ▓▓▓▓▓    │  ← Quota progress bar (tiny, 5 segments)
│     72%     │  ← Quota percentage (9px bold)
│              │
│  T:3  D:4   │  ← Threat count, drone count (7px)
│  ▸ STABLE   │  ← Status word (7px, color-coded)
└──────────────┘
     ↑
     Background fill = zone state color
     Border = zone state color at higher alpha
```

### Heatmap Glyph System

```
COMPRESSED STATUS GLYPHS (for ultra-dense view)

Zone Health:    ● = stable (green)   ◉ = stressed (yellow)
                ◎ = crisis (red)     ✦ = emergency (flashing red)
                ○ = offline (gray)

Crew State:     ▲ = thriving         △ = content
                ─ = neutral          ▽ = stressed
                ▼ = breaking         ✖ = burned out

Quota:          ↑ = exceeding        → = on track
                ↓ = behind           ⚡ = critical miss

Resource:       ■ = full             ▪ = adequate
                □ = low              ░ = empty

COMBINED GLYPH (single character per zone in ultra-compact view):
  🟢 = all green    🟡 = mixed/caution    🔴 = crisis
  ⚡ = emergency    ⬛ = offline
```

### Focus View Transition

```
HEATMAP CELL → FOCUS VIEW ANIMATION:

  Frame 0:    Player clicks/hotkeys cell A-3
  Frame 0-5:  Cell A-3 border brightens to white
  Frame 5-15: Cell EXPANDS — grows from 60x60 to fill right panel (300x400)
              Other cells slide/compress leftward
              Expanding cell content transitions:
                Glyph view → dissolves → mini starfield appears →
                entities materialize → full zone panel renders
  Frame 15-25: Zone panel fully rendered in focus view
               Alert queue updates to show A-3 at top
               Status detail panel appears below focus view

  REVERSE (click heatmap to return):
  Frame 0-10: Focus view SHRINKS back to cell size
              Content simplifies: entities → glyphs
              Other cells slide back to full grid
```

---

## X. TECH TREE VISUALIZATION — Command Tracks

### THE DESIGNER:
Phase 1's tech tree is a flat 3x5 grid. Linear progression. Phase 2's is a TRIANGLE — three tracks radiating from a center point, and you CAN'T complete them all. The visualization should make the TRADEOFF visible: investing in one track means the others dim and recede.

### Command Tech Tree Layout

```
TECH TREE VISUALIZATION (fits in sidebar or overlay panel)

                    ENGINEERING & OPS
                         ╱ ╲
                   E5   ╱   ╲
                  E4   ╱     ╲
                 E3   ╱       ╲
                E2   ╱    ★    ╲
               E1   ╱   START   ╲   P1
                   ╱             ╲   P2
                  ╱               ╲   P3
                 ╱                 ╲   P4
                ╱                   ╲   P5
               ╱                     ╲
        PEOPLE ─────────────────────── POLITICS
          P1  P2  P3  P4  P5    K1  K2  K3  K4  K5

Nodes radiate outward from center. Each tier is farther from center.
Researched nodes: BRIGHT, filled, glowing.
Available nodes: outlined, pulsing border.
Locked nodes: dim, dashed outline, barely visible.
Unaffordable: locked + red cost indicator.
```

### Tech Track Rendering

```javascript
function renderCommandTechTree(cx, cy, radius, tracks) {
    // Three tracks at 120-degree angles from center
    const trackAngles = {
        engineering: -Math.PI / 2,           // top (12 o'clock)
        people: -Math.PI / 2 + (2 * Math.PI / 3),    // bottom-left
        politics: -Math.PI / 2 + (4 * Math.PI / 3)    // bottom-right
    };

    const trackColors = {
        engineering: '#f80',  // orange (matches Phase 1 power grid)
        people: '#4c8',       // warm green (growth, nurturing)
        politics: '#c4f'      // purple (intelligence, manipulation)
    };

    // Center node (START)
    ctx.fillStyle = '#d4a017'; // command gold
    ctx.shadowColor = '#d4a017';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Track labels
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';

    for (const [trackName, angle] of Object.entries(trackAngles)) {
        const color = trackColors[trackName];
        const tiers = tracks[trackName]; // array of 5 nodes

        // Track line (backbone)
        ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.stroke();

        // Label at end of track line
        const labelX = cx + Math.cos(angle) * (radius + 20);
        const labelY = cy + Math.sin(angle) * (radius + 20);
        ctx.fillStyle = color;
        ctx.fillText(trackName.toUpperCase(), labelX, labelY);

        // 5 nodes along the track line
        for (let i = 0; i < 5; i++) {
            const node = tiers[i];
            const dist = (radius / 5) * (i + 1);
            const nx = cx + Math.cos(angle) * dist;
            const ny = cy + Math.sin(angle) * dist;
            const nodeR = 6;

            if (node.researched) {
                // BRIGHT: filled circle with glow
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Connection line to previous (solid, bright)
                if (i > 0) {
                    const px = cx + Math.cos(angle) * (radius / 5) * i;
                    const py = cy + Math.sin(angle) * (radius / 5) * i;
                    ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.7)`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(nx, ny);
                    ctx.stroke();
                }
            } else if (node.available) {
                // OUTLINE: pulsing border
                const pulse = 0.4 + Math.sin(Date.now() / 500) * 0.2;
                ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${pulse})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
                ctx.stroke();

                // CP cost indicator
                ctx.font = '7px monospace';
                ctx.fillStyle = '#aaa';
                ctx.fillText(node.cpCost + 'CP', nx, ny + nodeR + 10);
            } else {
                // LOCKED: dim dashed circle
                ctx.save();
                ctx.setLineDash([2, 3]);
                ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.12)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        }
    }
}
```

---

## XI. WILD IDEAS — Pushing Boundaries

### 1. RESOURCE FLOW PARTICLE SYSTEM

```
Visible energy/bio-matter/drone flows between zones as PARTICLE STREAMS.

When resources transfer Zone A → Zone B:
  - Tiny glowing dots (3px) stream along a curved path
  - Color matches resource type (cyan=energy, green=bio, blue=drones)
  - Speed scales with transfer rate
  - Particles follow bezier curves (not straight lines)
  - Small % of particles scatter off the path (transfer loss visualization)
  - Sound: soft whooshing, pitch scales with flow rate

Implementation: Reuse the existing Particle class. Spawn particles at source,
give them velocity toward target, add slight perpendicular oscillation.
Exactly like the existing bio-matter delivery orbs but system-wide.
```

### 2. GENERATIVE INTERFERENCE PATTERNS

```
Background pattern that responds to AGGREGATE SYSTEM STRESS.

When all zones are green:
  - Background shows slow, regular hex-grid pulse (like Phase 1 logo)
  - Color: deep cyan at 2% opacity
  - Pattern: clean hexagons, 20px size

As stress increases:
  - Hexagon size shrinks (12px → 8px → 4px), density increases
  - Color shifts cyan → amber → red
  - Pattern becomes irregular — hexagons DEFORM
  - At max stress: hexagons break into triangles and random polygons
  - Noise injection increases (random vertex displacement)

Implementation:
  function renderStressField(stress) {
      const hexSize = 20 - stress * 14;
      const irregularity = stress * 4; // vertex displacement
      const color = lerpColor('#0ff', '#f44', stress);
      // Render modified hex grid with displaced vertices
  }
```

### 3. HOLOGRAPHIC PROJECTION EFFECT — Command Overlay

```
When the player opens an overlay (tech tree, crew detail, report card),
instead of a flat panel, it renders as a HOLOGRAPHIC PROJECTION:

  - Base: standard NGE panel (the "projector surface")
  - Content: rendered with slight perspective skew
    ctx.setTransform(1, 0.02, -0.02, 1, 0, 0); // subtle parallax
  - Edge treatment: content fades to transparent at panel edges
  - Scan line: a bright horizontal line sweeps up/down continuously
  - Color shift: content has subtle chromatic aberration
    - Render content 3 times:
      - Red channel offset -1px
      - Normal position (full color)
      - Blue channel offset +1px
  - Flicker: Every ~2 seconds, entire hologram "glitches"
    - 2-frame horizontal offset (3px left, then 3px right)
    - Brief alpha drop to 0.6
    - Scanline acceleration during glitch

  Sound: Soft electrical hum while hologram is open
```

### 4. DATA VISUALIZATION AS ART — Bloomberg Meets Alien Tech

```
COMMAND STATUS BAR — A dense information strip across the top of the screen.
Think Bloomberg terminal ticker, but alien.

┌────────────────────────────────────────────────────────────────────┐
│ ▸CMD.7 ● Q:78% ↑ │ A:STABLE B:CRISIS │ BM:1240 E:64% D:4/6 │ CP:2 │
│ ▓▓▓▓▓▓▓▓░░ └QUOTA.PROJ: +3.2/s │ DIR.MOOD: ◎ WATCHFUL        │
└────────────────────────────────────────────────────────────────────┘

Every data point updates in REAL TIME. Numbers that change get a brief
gold flash. Negative changes flash red. The bar scrolls slowly left
when there's overflow information.

MICRO-SPARKLINES: Tiny 30px-wide sparkline graphs inline with numbers.
- Quota progress: ascending line = good, descending = bad
- Energy: oscillating sine = stable, declining = draining
- Morale: flat = neutral, peaks = events, drops = crises

Implementation: Store last 20 samples per metric. Render as polyline
at 1px resolution. Exactly like the existing NRG.FLOW sparkline in
diagEnhancedState, but proliferated across all metrics.
```

### 5. THE COMMANDER GHOST — Phase 1 Echo

```
YOUR OLD COMMANDER (from Phase 1) still appears occasionally.
But now BEHIND the Director panel, as a faint green ghost.
An afterimage. Your old boss, now irrelevant.

  - Renders at 8% opacity behind Director transmissions
  - Same green holographic treatment as Phase 1
  - Occasionally "breaks through" the Director's channel:
    A flash of green static across the red transmission.
    1-2 words appear in green: "...careful..." "...trust no one..."
  - The player realizes their old commander is still watching.
  - This is purely atmospheric. No gameplay effect.
  - But it sets up potential narrative for Phase 3.
```

### 6. ZONE DECAY VISUALIZATION — Entropy Made Beautiful

```
When a zone decays from inattention, it doesn't just turn yellow.
THE VISUAL QUALITY OF THE ZONE DEGRADES.

Decay Level 0 (fresh attention): Crisp rendering, full detail
Decay Level 1: Slight desaturation, occasional scanline glitch
Decay Level 2: More desaturation, frequent glitches, entities jitter
Decay Level 3: Near-grayscale, heavy static overlay, entities flicker
Decay Level 4: SIGNAL LOSS aesthetic — the zone becomes a snow channel

Implementation:
  function applyDecayFilter(zone, decayLevel) {
      if (decayLevel >= 1) {
          ctx.filter = `saturate(${1 - decayLevel * 0.2})`;
      }
      if (decayLevel >= 2) {
          // Add static noise overlay
          for (let i = 0; i < decayLevel * 5; i++) {
              ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
              ctx.fillRect(
                  zone.x + Math.random() * zone.w,
                  zone.y + Math.random() * zone.h,
                  1 + Math.random() * 3, 1
              );
          }
      }
      if (decayLevel >= 3) {
          // Horizontal tear effect
          const tearY = zone.y + Math.random() * zone.h;
          ctx.drawImage(canvas,
              zone.x, tearY, zone.w, 3,
              zone.x + (Math.random() - 0.5) * 6, tearY, zone.w, 3
          );
      }
  }

  The DRIFT TIMER appears as a countdown clock that literally
  DECONSTRUCTS — digits fragment and scatter as time runs out.
```

### 7. CREW EMOTIONAL WEATHER SYSTEM

```
Each zone has an "emotional weather" overlay — a subtle atmospheric
effect driven by crew morale that tints the entire zone view.

High Morale:    Warm undertone. Faint golden particles drifting up.
                Like sunlight through the viewport. Soft. Alive.
                ctx.fillStyle = 'rgba(255, 200, 100, 0.03)';

Neutral:        Clean. Standard Phase 1 palette. No tint. Business.

Low Morale:     Cold undertone. Blue-gray desaturation creeping in.
                Slower scanlines. The zone feels SLUGGISH.
                ctx.fillStyle = 'rgba(0, 20, 40, 0.04)';

Breaking Point: Red mist. Actual particle emission from zone edges.
                The zone is BLEEDING. Scanlines stutter and tear.
                Emergency klaxon undertone in audio.
                ctx.fillStyle = 'rgba(255, 0, 0, 0.04)';
                // Plus red spark particles along zone border
```

### 8. ASCII OVERLAY SYSTEM — Data as Texture

```
Behind the zones, behind the HUD, there's a MATRIX-STYLE falling
character stream — but it's not random. It's ACTUAL GAME DATA.

Characters include:
  - Hex addresses (zone coordinates in hex)
  - Crew stat values (morale, skill, stress as hex digits)
  - Resource flow rates (energy/s, bio-matter/s)
  - Director mood as encoded value
  - Quota targets and actual values

The stream falls at different speeds per column. Brighter characters
are more "recent" data. As characters age, they dim from green to dark.

Implementation:
  const dataColumns = 80;
  const charH = 14;
  // Each column: array of { char, age, speed }
  // Update: age += dt * speed; if aged out, replace with new data char
  // Render: ctx.font = '10px monospace'; fillStyle = rgba(0,255,0, 1-age);

This creates a living data texture underneath everything. Purely
atmospheric, but it makes the game feel like it's running on a
REAL alien computer system processing actual data.

Opacity: 3-5% maximum. Felt, not read. A whisper of information.
```

---

## XII. SUMMARY: Canvas API Technique Reference

### Techniques Carried Forward from Phase 1

| Technique | Phase 1 Usage | Phase 2 Evolution |
|-----------|--------------|-------------------|
| `renderNGEPanel()` | All HUD panels | Zone panels, command panels, Director panels |
| `renderNGEBar()` | Health, energy, progress | Zone status bars, quota bars, morale bars |
| `renderNGEStatusDot()` | Nominal/caution/critical | Zone state, crew state, system state |
| `renderNGEScanlines()` | Panel overlays | Zone overlays, Director transmission effect |
| `renderCommanderPortrait()` | Commander face | Crew portraits, Director portrait (new function) |
| `renderHexDecodeText()` | Wave summary header | Promotion text, command mode flash text |
| `renderPanelBorderTrace()` | Boot sequence | Zone unlock animation, command HUD boot |
| `renderPanelBootOverlay()` | HUD panel boot | Command panel boot (gold variant) |
| Particle class | Explosions, sparks | Resource flows, stress particles, decay effects |
| `globalCompositeOperation: 'lighter'` | Warp ghosts | Holographic projections, energy effects |
| `ctx.clip()` | Panel content bounds | Zone mini-battlefield containment |
| Linear gradients | Beam, bars | Zone border glow, resource flow paths |
| `ctx.shadowBlur` + `shadowColor` | Neon glow borders | Command gold glow, Director red glow |
| Hex-grid texture | NGE panel background | Stress-responsive hex field |
| Typewriter text | Commander speech | Director speech (slower, redder) |

### New Techniques for Phase 2

| Technique | Purpose | Canvas API |
|-----------|---------|-----------|
| Multi-zone viewport | Rendering 2-16 simultaneous scenes | `ctx.save/restore` + `ctx.clip` per zone |
| Zoom transition | Promotion camera pull-back | `ctx.scale()` with animated factor |
| Desaturation filter | Zone decay visualization | `ctx.filter = 'saturate(N)'` |
| Canvas self-sampling | Horizontal tear glitch effect | `ctx.drawImage(canvas, ...)` with offset |
| Perspective skew | Holographic projection | `ctx.setTransform(1, skewY, skewX, 1, 0, 0)` |
| Chromatic aberration | Hologram edges, Director glitch | Render 3x with color channel offsets |
| Radial gradient fills | Morale aura, glow effects | `ctx.createRadialGradient()` |
| Bezier particle paths | Resource flow curves | `ctx.bezierCurveTo()` for path, particles follow |
| Dynamic hex grid | Stress-responsive background | Variable vertex positions in hex render loop |

---

## XIII. RENDERING PERFORMANCE NOTES

### Phase 2 draws SIGNIFICANTLY more per frame. Budget constraints:

```
TARGET: 60fps on mid-range hardware (2020 laptop, integrated GPU)

ZONE RENDERING (per zone per frame):
  - Mini starfield:     ~50 fillRect calls
  - Ground plane:       ~5 calls
  - Mini UFO:           ~3 calls (simplified sprite)
  - Mini tanks:         ~2-4 calls each
  - Mini targets:       ~1-2 calls each
  - Mini beam:          ~5 calls
  - Status bar:         ~10 calls
  - Zone border:        ~4 calls
  Total per zone:       ~100 draw calls

AT 16 ZONES: ~1600 draw calls JUST for zones.
Plus command panels, Director, tech tree, effects.

MITIGATIONS:
  1. Off-screen canvas per zone — render zone to buffer, composite main
  2. Reduce update frequency for non-focused zones (30fps for background zones)
  3. Simplified rendering for compressed heatmap cells (no starfield, just glyphs)
  4. Particle budget: max 50 particles per zone, 200 global
  5. Effect culling: no scanlines/glitch effects on zones < 100px
  6. Share starfield buffers — same star positions, just clip differently
```

### Rendering Order (back to front)

```
1. Clear canvas (black)
2. Background data stream (ASCII overlay, 3% opacity)
3. Stress-responsive hex field (if enabled)
4. Zone panels (each clipped, back to front within)
5. Resource flow particles (between zones)
6. Command HUD panels (sidebar, status bar)
7. Director channel overlay (when active, includes screen tint)
8. Overlay panels (tech tree, crew detail, report card)
9. Alert notifications (top-layer)
10. Screen-wide effects (health freakout, emergency flash)
11. Global scanlines
```

---

*This visual system takes the hyper-dense, CRT-punk, obsessively-detailed aesthetic of Phase 1 and EVOLVES it into a command center. The player should feel like they graduated from a cockpit to a war room — the same alien technology, the same attention to every blinking light and scrolling hex stream, but now in service of WATCHING OTHERS DO THE WORK while a terrifying boss breathes down their neck in deep crimson.*

*Every pixel earns its place. Every color means something. Every animation tells a story.*
