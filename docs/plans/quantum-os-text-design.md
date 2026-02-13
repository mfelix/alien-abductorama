# Quantum OS Online Text — Visual Dazzle Design Spec

**Date:** 2026-02-13
**Designer:** LCARS-VISUAL-LEAD
**Scope:** Replace plain "ALIEN QUANTUM OS IS NOW ONLINE", "ALL SYSTEMS NOMINAL", and "MOTHERSHIP UPLINK ESTABLISHED" text with a dramatic, HUD-native system activation moment.

---

## Problem Statement

The current post-boot text is the weakest visual moment in an otherwise stunning boot sequence. After watching panels boot with border traces, diagnostic scrolls, and cascading online flashes, the player is presented with:

- "ALIEN QUANTUM OS IS NOW ONLINE" — plain 14px cyan monospace with a 6px glow
- "ALL SYSTEMS NOMINAL" — 18px white monospace with a 12px glow
- "MOTHERSHIP UPLINK ESTABLISHED" — 14px cyan with an edge pulse

These feel like placeholder text. They do not match the visual density, the diagnostic aesthetic, or the dramatic weight of the boot sequence that precedes them. The moment that should feel like the cockpit coming alive — the NERV "ALL CLEAR", the Enterprise bridge powering on — instead feels like someone wrote `ctx.fillText()` and moved on.

---

## Design Philosophy

The system activation moment should feel like **convergence** — every panel that just finished booting is now feeding into a central confirmation. The text should not just appear; it should be **assembled**, as if the OS is compiling its own status report in real time.

Inspiration references:
- **Evangelion NERV:** The moment when "ALL SYSTEMS OPERATIONAL" flashes across multiple overlapping displays simultaneously, with hex overlays and scan lines
- **Star Trek TNG:** The bridge viewscreen powering on with cascading system readouts resolving into a clean status display
- **Alien (1979):** The Nostromo MFD with its green phosphor text rendering character by character in a framed terminal window

---

## Architecture: Three-Phase Activation Sequence

The existing timing slots are preserved:
- **Phase A: "ALL SYSTEMS NOMINAL"** — runs from `duration - 1.5s` to `duration - 0.5s` (1.0s window)
- **Phase B: "ALIEN QUANTUM OS IS NOW ONLINE"** — runs from `duration - 1.0s` to `duration` (1.0s window)
- **Phase C: "MOTHERSHIP UPLINK ESTABLISHED"** — runs in `complete` phase (0.0s to 0.8s after boot ends, wave 1 only)

Phase A and Phase B overlap for 0.5 seconds. This overlap is intentional — the subsystem confirmation (A) merges into the main system declaration (B).

---

## Phase A: Subsystem Convergence — "ALL SYSTEMS NOMINAL"

**Duration:** 1.0 seconds
**Concept:** A compact diagnostic frame assembles at screen center, populated by a rapid-fire subsystem checklist that ticks off, culminating in the nominal declaration.

### Layout: Diagnostic Frame

A bordered panel materializes at the center of the screen. This is NOT a full HUD panel — it is a smaller, centered "status confirmation" frame.

```
         ┌── SYSTEM STATUS ──────────────────────┐
         │                                        │
         │  SYS.STATUS .... OK    SYS.INTG .. OK  │
         │  MISSION.CTL ... OK    ORD.SYS ... OK  │
         │  TECH.SYS ..... OK    FLEET.CMD . OK   │
         │  BM.CONDUIT ... OK    DIAG.SYS .. OK   │
         │                                        │
         │  ████████████████████████████████  100% │
         │                                        │
         │    ■ ■ ■  ALL SYSTEMS NOMINAL  ■ ■ ■   │
         │                                        │
         └────────────────────────────────────────┘
```

### Timing Breakdown

| Time (within phase) | Event |
|---------------------|-------|
| 0.000s – 0.080s | Frame border traces in from top-left corner (fast trace, cyan glow dot) |
| 0.080s – 0.120s | "SYSTEM STATUS" label types out in frame header |
| 0.120s – 0.500s | Subsystem lines appear two at a time (left + right column simultaneously), each line types from left, dots fill, then "OK" stamps in green with a micro-flash. Only panels that are actually active in this boot appear. ~60ms per row pair. |
| 0.500s – 0.600s | Progress bar fills left-to-right (solid cyan, 3px tall). "100%" appears at right end. |
| 0.600s – 0.700s | Three status indicator squares (diamonds) on each side of "ALL SYSTEMS NOMINAL" flash on in sequence (left-to-right, 30ms each). Text types out character by character. |
| 0.700s – 0.850s | Full frame holds at peak brightness. Scan line sweeps vertically once through the frame. |
| 0.850s – 1.000s | Frame alpha fades. Border persists slightly longer than text (ghosting effect). |

### Visual Details

**Frame:**
- Width: 320px, Height: dynamic based on active panel count (~140-160px)
- Centered on screen (canvas.width/2, canvas.height/2 - 20)
- Border: 1px cyan (`#0ff`) at 60% opacity, with 4px corner brackets (L-shaped marks at each corner, like military targeting brackets)
- Corner brackets: 12px arms, 1.5px stroke, cyan at 80%
- Background: `rgba(5, 8, 18, 0.85)` — the standard HUD panel fill, but more opaque for readability
- Hex grid texture inside: 6px hexagons, cyan at 4% opacity (consistent with all HUD panels)
- Scan lines: 3px spacing, `rgba(0, 0, 0, 0.06)` (subtle CRT texture)

**Header:**
- "SYSTEM STATUS" in bold 9px monospace
- Positioned top-center, inset into the top border line (text sits on the border, background filled behind it to "cut" the border)
- Color: cyan at 90%

**Subsystem Lines:**
- Font: 8px monospace
- Panel name: white at 70% → left-aligned in column
- Dots: white at 30% → fill to fixed width (dot-leader)
- "OK" stamp: `#00FF64` (bright green), bold — flashes once with 3px green glow then settles
- Only active panels appear. Inactive panels are omitted (no "SKIP" state — the frame adjusts).
- Two columns: left column and right column, 140px each, 20px gap

**Progress Bar:**
- 3px tall, full frame width minus 40px margin
- Empty: cyan at 15%
- Fill: solid cyan with 2px glow
- "100%" label: 7px monospace, cyan at 80%, right-aligned

**"ALL SYSTEMS NOMINAL" Text:**
- Font: bold 11px monospace
- Color: white (`#fff`) with cyan shadow (8px blur)
- Three small diamonds (3x3px, rotated 45deg) on each side as decorative indicators
- Diamonds flash on in rapid sequence, each with a brief green glow pulse
- Letter spacing: 2px (spread for importance)

---

## Phase B: System Declaration — "ALIEN QUANTUM OS IS NOW ONLINE"

**Duration:** 1.0 seconds
**Concept:** The main event. The Phase A frame has faded or is fading. Now the full system name compiles from scrambled hex data into its final form, framed by converging bracket lines.

### Layout: Declaration Banner

```
     ══════════════════════════════════════════
               ┌─────────────────────┐
               │                     │
     ──── ◆    │  ALIEN QUANTUM OS   │    ◆ ────
               │     IS NOW ONLINE   │
               │                     │
               └─────────────────────┘
     ══════════════════════════════════════════

              v7.3.1 // CORE ACTIVE
```

### Timing Breakdown

| Time (within phase) | Event |
|---------------------|-------|
| 0.000s | SFX.alienQuantumOnline() fires (the ascending four-note chord) |
| 0.000s – 0.080s | Two horizontal accent lines extend outward from center (top and bottom), growing from 0 to 280px each. Double-line (══) style, cyan at 40%. |
| 0.080s – 0.150s | Inner bracket frame draws in — top-left and bottom-right corners trace simultaneously toward each other, meeting to complete the rectangle. 1.5px cyan stroke. |
| 0.150s – 0.450s | **Hex decode effect**: "ALIEN QUANTUM OS" text position fills with random hex characters (0-F, A-F, varying brightness) that cycle rapidly (every 30ms). Characters progressively "lock in" from left to right — once a character resolves to its final letter, it stops cycling and brightens to full white. The resolve wave takes 300ms to cross the full text. |
| 0.300s – 0.550s | "IS NOW ONLINE" appears below with the same hex-decode effect, but starting 150ms after the first line begins resolving (staggered reveal). |
| 0.450s – 0.550s | Both lines fully resolved. A brief horizontal scan line (2px, bright white) sweeps top-to-bottom across the declaration text (100ms). This is the "confirmation scan". |
| 0.500s – 0.600s | Diamond indicators (◆) on left and right of the frame pulse on — green, with 6px glow. They pulse once brightly then settle to steady dim. |
| 0.550s – 0.650s | Version text fades in below: "v7.3.1 // CORE ACTIVE" — 7px monospace, cyan at 50%. |
| 0.650s – 0.800s | Full declaration holds at peak. Text has a subtle 2px breathing glow (slow sine, 0.8s period). |
| 0.800s – 1.000s | Everything fades out. Text alpha: 1.0 → 0.0 (ease-out). Frame lines persist slightly longer (20ms delay before their fade begins), creating a ghosting effect. |

### Visual Details

**Accent Lines (top and bottom):**
- Double parallel lines (1px gap between), creating ══ effect
- Length: 280px total (140px each side of center)
- Color: cyan at 40% → 60% as declaration resolves
- 1px stroke each line, 2px total gap between the pair

**Inner Bracket Frame:**
- Width: 240px, Height: 50px (two lines of text + padding)
- Centered on screen
- Border: 1.5px, cyan at 70%
- Corner brackets only (not full border): 16px L-shaped marks at each corner
- Background: `rgba(5, 8, 18, 0.7)` — standard HUD fill

**"ALIEN QUANTUM OS" Text:**
- Font: bold 18px monospace
- Final color: white (`#fff`)
- Shadow: `#0ff`, 10px blur
- Centered horizontally, vertically offset -8px from frame center
- During hex decode: characters cycle through `0123456789ABCDEF` in cyan at 60% opacity
- Lock-in effect: when a character resolves, it flashes bright white (100% opacity + 4px white glow) for one frame, then settles to steady white with cyan glow

**"IS NOW ONLINE" Text:**
- Font: bold 14px monospace
- Final color: cyan (`#0ff`)
- Shadow: `#0ff`, 6px blur
- Centered horizontally, +10px below "ALIEN QUANTUM OS"
- Same hex decode effect, staggered start

**Diamond Indicators:**
- 5px diamonds (rotated squares), one on each side of the frame
- Position: vertically centered with frame, horizontally 20px outside the bracket frame
- Color: green (`#0f0`) with 6px glow on pulse, settling to cyan at 40%

**Version Text:**
- "v7.3.1 // CORE ACTIVE"
- 7px monospace, cyan at 50%
- Centered, 20px below the bottom accent line
- Fades in with simple alpha ramp

---

## Phase C: Mothership Uplink — "MOTHERSHIP UPLINK ESTABLISHED" (Wave 1 Only)

**Duration:** 0.8 seconds (in `complete` phase)
**Concept:** A final narrative beat. A narrow banner slides down from the top of the screen — a transmission confirmation from the mothership.

### Layout: Transmission Banner

```
  ┌── UPLINK ────────────────────────────────────┐
  │  ◆ MOTHERSHIP UPLINK ESTABLISHED  [SECURED]  │
  └──────────────────────────────────────────────-┘
```

### Timing Breakdown

| Time (within phase) | Event |
|---------------------|-------|
| 0.000s – 0.100s | Edge pulse: full screen border flashes cyan at 30% → 0% (preserved from current implementation) |
| 0.100s – 0.200s | Transmission banner slides down from y=-20 to y=20 (ease-out-cubic). Banner is a narrow horizontal strip. |
| 0.200s – 0.250s | "UPLINK" label types into the header notch. Diamond indicator pulses green. |
| 0.250s – 0.400s | "MOTHERSHIP UPLINK ESTABLISHED" types out left-to-right (typewriter, ~20 chars/100ms). |
| 0.400s – 0.450s | "[SECURED]" stamps on at the right end — green, bold, with a brief 3px glow flash. |
| 0.450s – 0.550s | Full banner holds. Subtle scan line sweeps across. |
| 0.550s – 0.800s | Banner slides up and fades (y=20 → y=-10, alpha 1→0, ease-in-cubic). |

### Visual Details

**Banner:**
- Width: 380px (or 70% of canvas width, whichever is smaller)
- Height: 22px
- Centered horizontally, positioned at y=20 from top
- Border: 1px cyan at 50%
- Background: `rgba(5, 8, 18, 0.9)`
- Header notch: "UPLINK" text embedded in top border (same technique as Phase A's "SYSTEM STATUS")

**Text:**
- "MOTHERSHIP UPLINK ESTABLISHED" — 9px monospace, white at 90%
- "[SECURED]" — 8px bold monospace, green (`#0f0`)
- Diamond indicator: 4px, green, 4px glow

---

## Color Palette Summary

| Element | Color | Opacity | Notes |
|---------|-------|---------|-------|
| Frame borders | `#0ff` (cyan) | 50-70% | Standard HUD cyan |
| Accent lines | `#0ff` | 40-60% | Thinner, secondary |
| Corner brackets | `#0ff` | 80% | Emphasized structural element |
| Main title text | `#fff` (white) | 100% | Brightest element — this is the message |
| "IS NOW ONLINE" | `#0ff` | 100% | Secondary to title |
| Subsystem "OK" | `#00FF64` | 100% | Bright green — affirmative |
| Diamond indicators | `#0f0` / `#0ff` | varies | Green on activation, cyan at rest |
| Hex decode chars | `#0ff` | 60% | Transient, lower prominence |
| Panel fill | `rgba(5,8,18,x)` | 70-85% | Standard HUD dark fill |
| Scan lines | `rgba(0,0,0,0.06)` | 6% | CRT texture |
| Version text | `#0ff` | 50% | Subtle, ambient |

---

## Typography Specs

| Element | Font | Size | Weight | Spacing |
|---------|------|------|--------|---------|
| "ALIEN QUANTUM OS" | monospace | 18px | bold | normal |
| "IS NOW ONLINE" | monospace | 14px | bold | normal |
| "ALL SYSTEMS NOMINAL" | monospace | 11px | bold | 2px letter-spacing |
| Frame header ("SYSTEM STATUS") | monospace | 9px | bold | normal |
| Subsystem names | monospace | 8px | normal | normal |
| "OK" / "[SECURED]" | monospace | 8px | bold | normal |
| Version text | monospace | 7px | normal | normal |
| Hex decode characters | monospace | 18px / 14px | bold | normal (matches target) |

---

## Effects Catalog

### Hex Decode Effect (Phase B)
Characters cycle through `0-9, A-F` at ~33Hz (every 30ms). Each character position resolves independently, with a wave front moving left-to-right at a rate that covers the full string in 300ms. When a character locks in:
1. It snaps to its final glyph
2. Flashes bright white (opacity 1.0 + 4px white glow) for 1 frame (~16ms)
3. Settles to its resting color/glow

Implementation: For each character position, calculate `resolveTime = phaseStart + (charIndex / totalChars) * 300ms`. If `now < resolveTime`, display a random hex char. If `now >= resolveTime`, display the real character with a flash if `now - resolveTime < 16ms`.

### Border Trace (Phase A frame)
Same technique as the existing `renderPanelBootOverlay` trace, but scaled to the small confirmation frame. A 3px glowing dot (cyan, 8px shadow blur) traces the frame perimeter in 80ms. Trail: 4 afterimage dots with fading opacity.

### Confirmation Scan (Phase B)
A single horizontal line (2px, white at 80%) sweeps top-to-bottom through the declaration frame over 100ms. As it passes each text line, the text briefly brightens (glow increases from 10px to 16px for ~30ms). This creates a "validation sweep" feeling.

### Corner Brackets
L-shaped marks drawn with `ctx.moveTo / lineTo` — two perpendicular lines meeting at the corner point. Each arm is 12-16px. They add structural framing without the visual weight of a full border.

### Micro-Flash (Phase A "OK" stamps)
When an "OK" appears: the text renders at 200% brightness for 1 frame, with a 3px glow in the text color. A small rectangular highlight (the width of "OK" + 4px padding, 1px tall) briefly flashes below the text. Settles to normal brightness after 30ms.

---

## State Management

Add to `preBootState`:
```javascript
// Phase A state
_systemCheckIndex: 0,        // which subsystem line we're on
_systemCheckTimer: 0,        // timer within Phase A
_nominalTyped: 0,            // characters typed of "ALL SYSTEMS NOMINAL"
_phaseAFrameTrace: 0,        // 0-1 frame trace progress

// Phase B state
_declarationTimer: 0,        // timer within Phase B
_hexDecodeSeeds: [],         // random seeds per character for hex cycling
_scanLineY: -1,              // confirmation scan line position (-1 = inactive)
```

No new global state objects needed. Everything lives within the existing `preBootState` and resets in `initHUDBoot()`.

---

## Transition Choreography

### From Panel Boot → Phase A
The last panel reaches "online" status. There is a brief moment (100-200ms) of all panels glowing in their online flash. Then the Phase A frame begins assembling at center — the subsystem checklist reads as a "summary" of what just happened. The player just watched each panel boot individually; now they see the aggregate confirmation.

### Phase A → Phase B (overlap)
Phase A's frame fades starting at 0.85s. Phase B's accent lines begin extending at 0.0s (which is Phase A's 0.5s mark, since they overlap by 0.5s). This creates a smooth handoff: the diagnostic detail dissolves while the bold declaration assembles.

### Phase B → Gameplay (or Phase C on wave 1)
Phase B fades completely by 1.0s. On wave 1, Phase C's transmission banner slides in 0.1s into the `complete` phase — there is no gap, the narrative momentum carries forward. On later waves, the fade-out of Phase B is the last visual beat before normal gameplay rendering takes over.

---

## Implementation Notes

1. **All rendering stays inside `renderHUDBootGlobalEffects()`** — the existing function at line 17698. The three timing windows (Phase A, B, C) already exist in the code; we are replacing what renders inside them.

2. **Canvas 2D only.** All effects use `ctx.fillText`, `ctx.strokeRect`, `ctx.beginPath/lineTo`, gradients, and shadow blur. No WebGL, no images, no DOM elements.

3. **Performance budget:** Phase A and B render over HUD panels that are already fully online. Keep total draw calls per frame under 50 for the dazzle effects. The hex decode cycling should cache character choices per-frame rather than generating random values per character.

4. **The hex decode effect** should use a deterministic approach: `preBootState._hexDecodeSeeds` is populated with random values on init, and the cycling character at time T for position I is `HEX_CHARS[(seeds[i] + Math.floor(T / 30)) % 16]`. This prevents visual noise/flicker between frames.

5. **Dynamic subsystem list:** Phase A's checklist should only show panels where `hudBootState.panels[key].active === true`. Build the list dynamically from the panels object. This ensures wave 1 (fewer panels) looks correct.

6. **Sound integration:** `SFX.alienQuantumOnline()` remains the Phase B trigger. Consider adding micro-sounds for the Phase A "OK" stamps (reuse `SFX.bootDataChatter()`) and the Phase B hex-decode resolution (reuse `SFX.bootPanelOnline()` at lower volume, or create a new subtle "lock" sound).

---

## ASCII Art: Full Sequence Storyboard

### Frame 1: Phase A begins (t=0.0s within A)
```
                    ·─────────
                    |
                    |



```
*(Border trace dot racing around frame)*

### Frame 2: Phase A checklist populating (t=0.3s within A)
```
         ┌── SYSTEM STATUS ──────────────────────┐
         │                                        │
         │  SYS.STATUS .... OK    SYS.INTG .. OK  │
         │  MISSION.CTL ... OK    ORD.SYS ... ──  │
         │                                        │
         │  ░░░░░░░░░░░░░░░░                      │
         │                                        │
         └────────────────────────────────────────┘
```

### Frame 3: Phase A complete (t=0.7s within A)
```
         ┌── SYSTEM STATUS ──────────────────────┐
         │                                        │
         │  SYS.STATUS .... OK    SYS.INTG .. OK  │
         │  MISSION.CTL ... OK    ORD.SYS ... OK  │
         │  TECH.SYS ..... OK    FLEET.CMD . OK   │
         │  BM.CONDUIT ... OK    DIAG.SYS .. OK   │
         │                                        │
         │  ████████████████████████████████  100% │
         │                                        │
         │    ◆ ◆ ◆  ALL SYSTEMS NOMINAL  ◆ ◆ ◆   │
         │                                        │
         └────────────────────────────────────────┘
```

### Frame 4: Phase B hex decode in progress (t=0.25s within B)
```
     ══════════════════════════════════════════
               ┌─────────────────────┐
               │                     │
     ──── ◆    │  ALIEN QU4N7 F2 0S  │    ◆ ────
               │     A3 N0W 8NL1NE   │
               │                     │
               └─────────────────────┘
     ══════════════════════════════════════════
```
*(Characters left of the resolve wavefront are locked; right side still cycling hex)*

### Frame 5: Phase B fully resolved (t=0.6s within B)
```
     ══════════════════════════════════════════
               ┌─────────────────────┐
               │                     │
     ──── ◆    │  ALIEN QUANTUM OS   │    ◆ ────
               │     IS NOW ONLINE   │
               │                     │
               └─────────────────────┘
     ══════════════════════════════════════════

              v7.3.1 // CORE ACTIVE
```

### Frame 6: Phase C banner (wave 1 only, t=0.35s within C)
```
  ┌── UPLINK ────────────────────────────────────┐
  │  ◆ MOTHERSHIP UPLINK ESTABLISHED  [SECURED]  │
  └──────────────────────────────────────────────-┘
```

---

## Comparison: Before and After

### BEFORE
```
[14px cyan text, centered, simple glow]

    ALIEN QUANTUM OS IS NOW ONLINE

[18px white text, centered, simple glow]

    ALL SYSTEMS NOMINAL
```

Three separate plain `fillText` calls with basic shadows. No framing, no build-up, no visual density. Looks like debug text compared to the HUD panels surrounding it.

### AFTER

A choreographed three-phase activation sequence:
1. **Diagnostic confirmation frame** assembles with subsystem checklist
2. **Hex-decode declaration** compiles the system name from data noise
3. **Transmission banner** slides in as narrative punctuation (wave 1)

Every element uses the established visual language: bordered panels, hex textures, scan lines, corner brackets, monospace typography, cyan/green/white palette, trace animations, typewriter reveals, and status indicators.
