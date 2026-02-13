# WAV.ANALYSIS — Wave Summary HUD Redesign

## Visual Design Specification

**System Label:** `WAV.ANALYSIS`
**Design Philosophy:** Post-mission diagnostic. The Quantum OS processes telemetry from the wave and presents a structured debrief. Every stat revelation is a subsystem coming online. Clear data first, wrapped in HUD aesthetic. Glitz is choreography, not decoration.

---

## 1. Screen Layout — The Debrief Frame

### Background Treatment
- Frozen game scene rendered beneath
- Full-screen overlay: `rgba(0, 0, 0, 0.7)` — slightly darker than current 0.6 for better contrast against the NGE panel's own semi-transparent fill
- CRT scanlines continue rendering over everything (every 3px, 6% opacity) — the OS never stops being a CRT

### Main Panel
- **Single NGE panel** via `renderNGEPanel()` — NOT a rounded rect
- Dimensions: `Math.min(680, canvas.width * 0.82)` wide, `Math.min(560, canvas.height * 0.85)` tall, centered
- Color: `#0ff` (cyan — system chrome, this is an OS diagnostic screen)
- Cut corners: `['tl', 'br']` — diagonal axis cut, matches the EVA aesthetic asymmetry
- Fill: `rgba(5, 8, 18, 0.88)` — slightly more opaque than standard panels (0.65) because this needs to be readable over a dimmed game scene
- Hex-grid texture at 4% opacity (built into `renderNGEPanel`)
- Inner glow line at 2px inset (built into `renderNGEPanel`)

### Corner L-Brackets
- Four corner brackets rendered OUTSIDE the main panel, offset by 8px
- 20px arm length, 1.5px stroke, `rgba(0, 255, 255, 0.5)`
- These frame the panel like a targeting reticle acquiring data
- Fade in at t=0.0s over 150ms (they appear first, framing empty space)

### System Label
- `WAV.ANALYSIS` — top-left corner of panel, 8px monospace bold, cyan
- Typewritten at 25 chars/sec during panel border trace
- Matches existing panel label convention (TECH.SYS, FLEET.CMD, etc.)

---

## 2. Section Organization

The panel interior is divided into **four horizontal sections**, separated by thin cyan divider lines (`rgba(0, 255, 255, 0.15)`, 1px). Each section is a sub-report within the diagnostic. Content is left-aligned with values right-aligned (consistent key:value readout pattern used throughout the HUD).

**Internal padding:** 20px horizontal, 16px top, 12px between sections.

### Section A: HEADER (wave identification)
### Section B: TGT.TELEMETRY (targets beamed)
### Section C: PTS.CALC (points, bonuses, UFO bucks)
### Section D: BIO.STATUS (bio matter — conditional)
### Footer: SYS.TOTAL + countdown

---

## 3. Title Treatment — Section A: HEADER

### Wave Number Display
- Text: `WAVE XX` — bold 16px monospace
- **Hex-decode reveal**: Characters cycle through 0-9A-F for 300ms, then resolve left-to-right to real text
  - Unresolved chars: `rgba(0, 255, 255, 0.6)` (dim cyan, scrambled)
  - On resolve: brief white flash (#fff, shadowBlur 4) per character
  - Settled color: `#fff` with cyan glow (shadowColor #0ff, shadowBlur 8)
- Positioned: top-center of panel, 14px below top edge

### Subheader
- Text: `>> MISSION DEBRIEF INITIATED` — 8px monospace
- Typewritten at 25 chars/sec, cyan (`#0ff`) at 70% opacity
- Appears immediately after wave number resolves
- The `>>` prefix matches the diagnostic text convention from boot overlays

### Timing
- Hex-decode starts at t=0.0s, resolves over 0.4s
- Typewriter subheader: t=0.35s to t=0.5s (overlaps slightly with tail of hex-decode for smooth flow)

---

## 4. Data Display — Section B: TGT.TELEMETRY

### Section Label
- `TGT.TELEMETRY` — bold 9px monospace, `#0ff` at 60% opacity
- Left-aligned, immediately below divider line
- Appears with a subtle fade-in (150ms) at t=0.5s

### Target Grid
- Six target types in a horizontal row (same as current), evenly spaced across panel width
- Each target slot is a **mini-column**:

```
  [sprite icon]     ← 40px tall, centered in column
  [count/spawned]   ← bold 11px monospace, below icon
  [type label]      ← 7px monospace, dim, below count
```

- **Staggered reveal**: Each target appears at `t=0.5s + index * 0.25s`
- **Reveal animation per target**:
  1. Diamond indicator (5x5px, rotated 45deg) appears first at the column position, colored `#445` (grey/inactive)
  2. Scale-pop (easeOutCubic overshoot, 150ms): icon scales from 0 to 1.1 to 1.0
  3. Count text does a mini hex-decode (3 cycles then resolve, ~100ms)
  4. Diamond transitions from grey to status color:
     - All captured (count === spawned): diamond turns **green** `#0f0`, count text `#0f0`
     - Some captured: diamond turns **cyan** `#0ff`, count text `#0ff`
     - None captured (0/N where N > 0): diamond turns **red** `#f44`, count text `#f44`
     - None spawned (0/0): diamond stays **grey** `#445`, count text `#445`
  5. Brief white flash on the count text as it resolves

### Type Labels
- Below each count: abbreviated type name in 7px monospace, `#445`
- `HMN` `COW` `SHP` `CAT` `DOG` `TNK`
- These are static (no animation), appear with the target

---

## 5. Data Display — Section C: PTS.CALC

### Section Label
- `PTS.CALC` — bold 9px monospace, `#0ff` at 60% opacity
- Left-aligned, appears at t=targets_end

### Wave Points Row
- Label: `WAV.POINTS` — 9px monospace, `#aaa`, left-aligned
- Value: count-up animation from 0 to actual value — bold 14px monospace
  - During count: `#fc0` (yellow, currency color)
  - On complete: white flash, settle to `#fc0`, shadowColor `#fc0`, shadowBlur 6 for 200ms
  - Pop scale (1.0 -> 1.12 -> 1.0) on finish, same as current
- Segmented bar below the row: 10 segments, width = full section width, height = 3px
  - Color: `#fc0`, fills proportional to points relative to a reasonable max (e.g., 5000)
  - Animates in sync with count-up
  - This replaces a plain number with a visual "weight" indicator

### Bonus Points Row (conditional — only if > 0)
- Label: `BONUS.PTS` — 9px monospace, `#666`
- Value: `+XXX` — 11px monospace, `#0f0` (green, success)
- Appears with 150ms fade-in after wave points finish

### Bonus Checks — System Diagnostics
This is the signature visual beat. Each bonus is a **system check line** styled exactly like the boot overlay diagnostic text:

```
>> ABDUCTION.MASTER ........... [OK]     ← earned
>> TANK.HUNTER ................ [SKIP]   ← missed
>> QUOTA.STATUS ............... [OK]     ← earned
```

- Full line: 9px monospace
- `>>` prefix: `#0ff` at 50% opacity (matches boot diagnostic convention)
- Label: dots-naming convention (`ABDUCTION.MASTER` not `ABDUCTION MASTER`)
- Dot leader: `rgba(0, 255, 255, 0.15)` — faint cyan dots bridging label to status
- Status stamp:
  - **Earned**: `[OK]` in `#0f0` (green), with brief green glow (shadowBlur 4, 200ms)
  - **Missed**: `[SKIP]` in `#445` (dark grey), no glow
- Diamond indicator (5px) to the left of `>>`:
  - Earned: `#0f0` green, steady glow
  - Missed: `#445` grey, no animation
- Detail text: `(10 targets)` / `(3 tanks)` / `(5/5 beamed)` — 7px monospace, `#666`, right of the status stamp
- **Stagger**: Each line appears at `bonuses_start + index * 0.35s`
- **Reveal**: Line fades in from left (slide 12px over 200ms, easeOutCubic), then stamp resolves with a flash

### Bonus Multiplier Summary (if any earned)
- Only if at least one bonus earned
- Text: `BONUS MULT: +XX%` — bold 9px monospace, `#fc0`
- Appears 200ms after last bonus line, subtle fade-in

### UFO Bucks Sub-section
- Mini divider: thin dashed line, `rgba(0, 255, 255, 0.1)`, 8px top/bottom margin
- Section micro-label: `CRED.CALC` — 7px monospace, `#0ff` at 40% opacity

```
BASE.CRED         XXX     ← 9px monospace, #aaa / #fff
BONUS.CRED        +XX     ← 9px monospace, #aaa / #0f0
─────────────────────
TOTAL.CRED        XXX     ← bold 11px monospace, #fc0 / #fc0
```

- Total uses count-up animation (0 to final value)
- On count-up complete: yellow flash + pop scale (same treatment as points)
- Diamond indicator next to TOTAL: `#fc0` steady

---

## 6. Data Display — Section D: BIO.STATUS (Conditional)

**Only rendered if** `droneHarvests > 0 || bioMatterEarned > 0 || lostDeliveries > 0`

### Section Label
- `BIO.STATUS` — bold 9px monospace, `#0f0` at 60% opacity (green — bio-matter color)

### Data Rows
```
BM.DELIVERED      XX      ← 9px monospace, #aaa / #0f0
BM.LOST           XX      ← 9px monospace, #aaa / #f44 (red, damage color)
BM.EARNED        +XX      ← bold 9px monospace, #0f0 / #0f0 with glow
```

- Each row has a small diamond indicator left of label:
  - DELIVERED: green `#0f0`
  - LOST: red `#f44` (only if lostDeliveries > 0)
  - EARNED: green `#0f0` with brief glow on appear
- Entire section fades in over 250ms (single reveal, not staggered per-row)

---

## 7. Footer: SYS.TOTAL + Countdown

### Cumulative Score
- Thin cyan divider above
- Label: `CUMU.SCORE` — bold 9px monospace, `#aaa`
- Value: bold 14px monospace, `#fff`
- On appear: white flash (shadowColor #fff, shadowBlur 12, fades over 400ms)
- Diamond indicator: `#0ff` cyan, steady

### Countdown to Shop
- Text: `>> SHOP.INTERFACE IN X...` — bold 9px monospace
- Positioned: bottom-right of panel interior, 10px from bottom edge, right-aligned
- Color: `#0ff` at pulsing opacity (0.4 to 0.8, sine wave at 2Hz)
- Number changes each second with a brief white flash on transition
- Scale bounce on each second change: 1.0 -> 1.06 -> 1.0 (subtle, 100ms)
- The `>>` prefix and system naming (`SHOP.INTERFACE`) maintain the diagnostic voice

---

## 8. Animation Choreography — Full Timeline

All times in seconds from wave summary start:

```
t=0.00  Corner L-brackets fade in (150ms)
t=0.00  Panel border trace begins — glowing cyan dot traces the NGE panel perimeter
        (clockwise, 350ms, with gradient trail)
t=0.00  WAV.ANALYSIS label typewriter begins (during border trace)
t=0.10  Panel fill fades in behind trace (200ms, rgba(5,8,18) 0 -> 0.88)
t=0.35  Border trace complete. Panel fully visible.
t=0.00  Hex-decode: "WAVE XX" begins scrambling
t=0.40  Hex-decode resolves. White flash per character.
t=0.35  Typewriter: ">> MISSION DEBRIEF INITIATED" (overlaps hex-decode tail)
t=0.50  Section B label "TGT.TELEMETRY" fades in
t=0.50  First target reveals (diamond -> icon pop -> count hex-decode)
t=0.75  Second target reveals
t=1.00  Third target reveals
t=1.25  Fourth target reveals
t=1.50  Fifth target reveals
t=1.75  Sixth target reveals
t=2.00  Section C label "PTS.CALC" fades in
t=2.00  Wave points count-up begins (1.0s duration)
        Segmented bar fills in sync
t=3.00  Wave points count-up finishes. Pop + flash.
        Bonus points row appears (if applicable, 150ms fade)
t=3.10  First bonus system check line slides in
t=3.45  Second bonus system check line slides in
t=3.80  Third bonus system check line slides in
t=3.95  Bonus multiplier summary appears (if earned)
t=4.10  CRED.CALC sub-section appears
        Base/bonus credit rows fade in
t=4.15  Total credits count-up begins (0.7s duration)
t=4.85  Total credits count-up finishes. Pop + flash.
t=5.10  Section D: BIO.STATUS fades in (if applicable, 250ms)
t=5.50  Footer: CUMU.SCORE appears with white flash
t=5.80  All animation complete. Summary finalized.
t=5.80  ">> SHOP.INTERFACE IN 4..." countdown begins
t=9.80  Auto-transition to shop
```

**Total animation time: ~5.8s** (vs current ~6-7s — slightly tighter but same ballpark)
**Countdown: 4.0s** (unchanged)

### Sound Mapping (existing SFX, no new sounds needed)
- t=0.00: Border trace start — reuse `SFX.borderTraceCorner` concept (soft blip)
- Each target reveal: `SFX.targetReveal` / `SFX.targetMax` (unchanged)
- Points count-up ticks: `SFX.countTick` at rising pitch (unchanged)
- Points finish: `SFX.countFinish` (unchanged)
- Each bonus earned: `SFX.bonusEarned` (unchanged)
- Each bonus missed: `SFX.bonusMissed` (unchanged)
- Bucks count-up ticks: `SFX.countTick` at higher base pitch (unchanged)
- Bucks finish: `SFX.countFinish` (unchanged)
- Bio section reveal: `SFX.sectionReveal` (unchanged)
- Summary complete: `SFX.summaryComplete` (unchanged)
- Countdown ticks: `SFX.countdownTick` (unchanged)

---

## 9. Color Mapping — Complete Reference

| Element | Color | Rationale |
|---------|-------|-----------|
| Panel border, L-brackets, system labels | `#0ff` cyan | System chrome — this is an OS screen |
| Wave number text (resolved) | `#fff` white | Primary header |
| Hex-decode unresolved chars | `rgba(0,255,255,0.6)` | Scrambled = dim cyan |
| Flash-on-resolve | `#fff` white | Universal resolve flash |
| Section dividers | `rgba(0,255,255,0.15)` | Subtle structure |
| Section labels (TGT.TELEMETRY, etc.) | `#0ff` at 60% | Subsystem identifiers |
| Row labels (WAV.POINTS, BASE.CRED) | `#aaa` | Secondary text |
| Point values | `#fc0` yellow | Currency/scoring color |
| Target count — all captured | `#0f0` green | Success |
| Target count — partial | `#0ff` cyan | Nominal |
| Target count — none (where spawned > 0) | `#f44` red | Critical/missed |
| Target count — none spawned | `#445` grey | Inactive |
| Bonus [OK] stamps | `#0f0` green | System check passed |
| Bonus [SKIP] stamps | `#445` grey | Inactive/skipped |
| Bonus detail text | `#666` | Tertiary info |
| Bonus multiplier | `#fc0` yellow | Currency |
| Credit total | `#fc0` yellow | Currency |
| Bio matter earned | `#0f0` green | Bio/success |
| Bio matter lost | `#f44` red | Damage/critical |
| Cumulative score | `#fff` white | Emphasis |
| Countdown text | `#0ff` pulsing | System process |
| Dot leaders | `rgba(0,255,255,0.15)` | Structural decoration |
| Diamond indicators | Match row color | Status feedback |

---

## 10. CRT/Aesthetic Overlays

### Persistent (always on during summary)
- **CRT scanlines**: Every 3px horizontal, `rgba(0,255,255,0.06)` — same as gameplay HUD
- **Scanline scroll**: Continuous drift at current `hudAnimState.scanlineOffset` rate

### Ambient Decoration (within panel, non-distracting)
- **Hex-grid texture**: Built into `renderNGEPanel` at 4% opacity — no additional work
- **Border inner glow**: Built into `renderNGEPanel` — 2px inset line at 15% of border color

### Event-Driven
- **Section reveal flash**: When each major section appears, a brief 50ms screen-wide flash at `rgba(0,255,255,0.03)` — barely perceptible, subliminal punctuation
- **Count-up glow**: During active count-ups, the value text has a subtle animated shadowBlur (2-6px, sine wave at 4Hz) in the value's color

### What We Do NOT Add
- No vignette overlay (the NGE panel + scanlines is enough)
- No noise/static texture (that's for damage states, not diagnostics)
- No screen shake (this is calm telemetry processing)
- No extra particle effects (boot sequence owns that space)

---

## 11. Layout Proportions — Precise Measurements

All measurements assume the main panel is W wide and H tall, with 20px horizontal padding and 16px top padding. Left edge = `panelX + 20`, Right edge = `panelX + W - 20`. Content width = `W - 40`.

```
┌─────────────────────────────────────────────┐
│ WAV.ANALYSIS                        (label) │  ← 8px bold mono, top-left
│                                              │
│            W A V E  0 3                      │  ← 16px bold mono, centered, y=16
│      >> MISSION DEBRIEF INITIATED            │  ← 8px mono, centered, y=30
│ ──────────────────────────────────── (cyan)  │  ← divider y=42
│ TGT.TELEMETRY                                │  ← 9px bold mono, y=50
│                                              │
│  [HMN]  [COW]  [SHP]  [CAT]  [DOG]  [TNK]  │  ← icons at y=58, 40px tall
│  3/5    2/3    0/2    1/1    4/4    2/3     │  ← 11px bold mono, y=106
│  ◆      ◆      ◆      ◆      ◆      ◆      │  ← diamonds at y=100 (behind icons)
│ ──────────────────────────────────── (cyan)  │  ← divider
│ PTS.CALC                                     │  ← 9px bold mono
│                                              │
│  WAV.POINTS                       12,450    │  ← 9px / bold 14px mono, yellow
│  ████████████████████████░░░░░░░░           │  ← 3px segmented bar
│  BONUS.PTS                        +2,100    │  ← 9px / 11px mono, green
│                                              │
│  ◆ >> ABDUCTION.MASTER .......... [OK]  ()  │  ← 9px mono, green
│  ◆ >> TANK.HUNTER ............... [SKIP] () │  ← 9px mono, grey
│  ◆ >> QUOTA.STATUS .............. [OK]  ()  │  ← 9px mono, green
│  BONUS MULT: +50%                            │  ← bold 9px mono, yellow
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ (dashed) │
│  CRED.CALC                                   │  ← 7px mono
│  BASE.CRED                           124    │  ← 9px mono
│  BONUS.CRED                          +62    │  ← 9px mono, green
│  ────────────────────────                    │
│  ◆ TOTAL.CRED                        186    │  ← bold 11px mono, yellow
│ ──────────────────────────────────── (cyan)  │  ← divider
│ BIO.STATUS                                   │  ← 9px bold mono, green
│  ◆ BM.DELIVERED                        8    │  ← 9px mono, green
│  ◆ BM.LOST                             2    │  ← 9px mono, red
│  ◆ BM.EARNED                          +6    │  ← bold 9px mono, green glow
│ ──────────────────────────────────── (cyan)  │
│  ◆ CUMU.SCORE                     45,230    │  ← bold 14px mono, white
│                                              │
│                     >> SHOP.INTERFACE IN 3...│  ← bold 9px mono, pulsing cyan
└─────────────────────────────────────────────┘
```

### Font Size Summary
| Size | Weight | Usage |
|------|--------|-------|
| 16px | bold | Wave number (WAVE XX) |
| 14px | bold | Wave points value, cumulative score value |
| 11px | bold | Target counts, total credits value, bonus points value |
| 9px | bold | Section labels, bonus check lines, data row labels, row values, countdown |
| 8px | bold | WAV.ANALYSIS panel label, subheader typewriter |
| 7px | normal | CRED.CALC micro-label, type abbreviations (HMN, COW), bonus detail text |

---

## 12. Responsive Behavior

### Small screens (canvas.width < 500 or canvas.height < 400)
- Panel dimensions floor at 320x380
- Target icons shrink to 28px
- Font sizes reduce by 1px across the board
- Bio matter section collapses to single line: `BM: +6 EARNED (8 deliv / 2 lost)`
- Bonus check lines drop the dot leader (just label + stamp)

### Large screens (canvas.width > 1200)
- Panel caps at 680x560 (no larger — data should feel dense and focused)
- Additional horizontal breathing room in padding (24px instead of 20px)

---

## 13. What Changes vs. Current Implementation

### Removed
- `renderRainbowBouncyText` for the title — replaced with hex-decode (matching HUD vocabulary)
- `roundRect` panel — replaced with `renderNGEPanel` (cut corners, hex-grid texture)
- White divider lines — replaced with cyan at 15% opacity
- Plain "BONUSES" header and plain text bonus lines — replaced with system diagnostic format
- Generic "CONTINUING IN X..." text — replaced with `>> SHOP.INTERFACE IN X...`

### Added
- Corner L-brackets around the panel
- Panel border trace animation (350ms at start)
- WAV.ANALYSIS typewriter label
- Hex-decode for wave number
- `>> MISSION DEBRIEF INITIATED` subheader
- Section labels (TGT.TELEMETRY, PTS.CALC, etc.)
- Diamond status indicators on targets, bonuses, bio rows, totals
- System diagnostic format for bonuses (`>> LABEL ... [OK]`/`[SKIP]`)
- Dot leaders between bonus labels and stamps
- CRED.CALC sub-section with dashed divider
- Segmented bar under wave points
- Type abbreviation labels under target counts
- Boot-style `>>` prefix on countdown

### Preserved
- All data points and their meanings
- CountUpAnimation for points and bucks (with pop + flash on finish)
- Target sprite icons
- Per-target staggered reveal with pop-in
- Per-bonus staggered reveal with slide-in
- Bio matter conditional display
- 4-second auto-continue countdown
- All existing SFX hooks (no new sounds needed)
- Overall timing (~6s of animation + 4s countdown)

---

## 14. Implementation Notes

### Reusable Functions
These existing functions can be called directly:
- `renderNGEPanel(x, y, w, h, opts)` — main panel
- `renderNGEBar(x, y, w, h, percent, color, opts)` — segmented bar under points
- `renderNGEIndicator(x, y, 'diamond', color, 'steady', opts)` — diamond status dots

### New Rendering Logic Needed
- **Hex-decode text renderer**: Generalized version of the boot sequence hex-decode (lines 18752-18807). Takes (text, x, y, fontSize, progress, opts) and handles the scramble -> resolve -> flash cycle. Could be extracted as a helper since the boot already does this.
- **Dot leader renderer**: Simple loop drawing `.` characters between two x positions at a given y, in dim cyan. Trivial.
- **Border trace for panel**: Adapted from tech panel boot trace (lines 17967-18016). Traces the NGE panel perimeter path (accounting for 45-degree cut corners) instead of a simple rect.
- **System check line renderer**: Composes the `>> LABEL ... [STATUS] (detail)` format with proper spacing and colors.

### State Machine
The existing `waveSummaryState` object works well. Additions:
- `borderTraceProgress`: 0-1 float for panel border trace
- `hexDecodeProgress`: 0-1 float for wave number decode
- `typewriterProgress`: char index for subheader

The `WAVE_SUMMARY_TIMING` object needs updated values:
```js
const WAVE_SUMMARY_TIMING = {
    borderTrace: 0.35,    // new: panel border trace
    title: 0.50,          // was 0.5 (includes hex-decode + typewriter)
    targetPer: 0.25,      // was 0.3 (slightly tighter for 6 targets)
    points: 1.0,          // was 1.2 (slightly tighter)
    bonusPer: 0.35,       // was 0.4 (slightly tighter)
    bucks: 0.7,           // was 0.8 (slightly tighter)
    bioDelay: 0.25,       // was 0.3
    totals: 0.3,          // was 0.5 (tighter, just a fade-in)
    autoContinue: 4.0     // unchanged
};
```
