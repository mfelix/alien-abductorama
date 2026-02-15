# Wave Summary Overhaul — Surgical Edit Spec

## Context

User feedback demands a major readability and visual hierarchy overhaul of the wave summary screen. This spec supersedes the prior `wave-summary-hud-redesign.md` and `wave-summary-implementation-plan.md` design docs. The existing code is at `js/game.js` lines 22869-23320 (`renderWaveSummary()`), with supporting functions `renderTargetRow()` (22497), `updateWaveSummary()` (22362), `startWaveSummary()` (22235), and timing constants (22090).

---

## Part 1: New renderWaveSummary() Design

### 1.1 Core Architecture — Dynamic Height with Two-Pass Layout

The current panel uses a fixed `panelH = Math.min(620, canvas.height * 0.88)`. This wastes space when bio-matter is absent and clips when content is dense.

**New approach — content-driven height:**

```
Pass 1: Calculate layout height
  - Walk through all sections in order
  - Track cursorY as each section is measured
  - Final cursorY + bottomPadding = required panelH

Pass 2: Render
  - panelH is now known
  - panelY = (canvas.height - panelH) / 2 (vertically centered)
  - Render panel background, then all sections using same cursorY walk
```

The two passes share a single layout function that takes a `measureOnly` boolean. When `measureOnly === true`, all `ctx` draw calls are skipped but cursorY advances identically. This avoids code duplication.

### 1.2 Panel Dimensions

```js
const panelW = Math.min(720, canvas.width * 0.85);
const padH = 24;   // horizontal content padding (both sides)
const padV = 20;    // top padding before first content
const sectionGap = 16;  // vertical gap between section bands
const rowGap = 8;        // vertical gap between rows within a section
const bottomPad = 20;    // padding below last section
```

Content area: `contentLeft = panelX + padH`, `contentRight = panelX + panelW - padH`, `contentWidth = panelW - 2 * padH`.

### 1.3 Font Size Table

Every text element mapped to an exact font spec. These are significantly larger than the prior design.

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Panel label ("WAVE ANALYSIS") | monospace | 14px | bold | `#0ff` |
| Wave title ("WAVE 3") | monospace | 28px | bold | `#fff` with cyan glow |
| Section headers (TARGETS, POINTS, etc.) | monospace | 14px | bold | section accent color at 80% |
| Data labels (WAVE POINTS, BASE CREDITS) | monospace | 14px | normal | `#aaa` |
| Data values (point counts, credit counts) | monospace | 22px | bold | section value color |
| Target counts (3/5) | monospace | 16px | bold | status color |
| Target type labels (HMN, COW...) | monospace | 10px | normal | `#556` |
| Bonus check labels | monospace | 12px | normal | per-check color |
| Bonus check status ([OK]/[SKIP]) | monospace | 12px | bold | green/grey |
| Bonus multiplier | monospace | 13px | bold | `#fc0` |
| Bonus detail text | monospace | 10px | normal | `#666` |
| Bio-matter data labels | monospace | 14px | normal | `#aaa` |
| Bio-matter values | monospace | 18px | bold | green/red |
| Total score label | monospace | 14px | bold | `#aaa` |
| Total score value | monospace | 24px | bold | `#fff` with cyan glow |
| Countdown text | monospace | 16px | bold | pulsing (see Part 2) |

### 1.4 Horizontal Section Bands

Each major section occupies a full-width horizontal band spanning `contentLeft` to `contentRight`. Sections are separated by thin cyan dividers (`rgba(0, 255, 255, 0.15)`, 1px) with `sectionGap` vertical spacing around them.

Sections that have a tinted background render a filled rect from `panelX + 2` to `panelX + panelW - 2` (inside the panel border, full width) covering the section's vertical extent with `sectionGap/2` top/bottom bleed.

**Section order (top to bottom):**

1. **HEADER** — Wave title
2. **TARGETS** — Target telemetry grid
3. **POINTS** — Wave points, bonuses, bonus multiplier
4. **CREDITS** — Base/bonus/total credits (UFO Bucks)
5. **BIO-MATTER** — Conditional: delivered/lost/earned
6. **TOTAL SCORE** — Cumulative score
7. **COUNTDOWN** — Shop transition countdown

### 1.5 Color Assignments Per Section

#### HEADER
- Background: none (panel default dark)
- Title text: `#fff` white, `shadowColor: '#0ff'`, `shadowBlur: 10`
- Panel label: `#0ff` cyan

#### TARGETS
- Background band: `rgba(0, 255, 255, 0.04)` — subtle cyan tint
- Section header "TARGETS": `rgba(0, 255, 255, 0.8)` (14px bold)
- Status colors on counts/diamonds: unchanged (green `#0f0`, cyan `#0ff`, red `#f44`, grey `#445`)

#### POINTS
- Background band: none (default dark)
- Section header "POINTS": `rgba(255, 204, 0, 0.8)` — yellow tint (14px bold)
- Label "WAVE POINTS": `#aaa`
- Value: `#fc0` yellow (22px bold)
- Bonus rows: `#0f0` green values, `#666` labels
- Bonus multiplier: `#fc0` yellow (13px bold)
- Segmented bar: `#fc0` yellow

#### CREDITS
- Background band: none (default dark)
- Section header "CREDITS": `rgba(255, 153, 0, 0.8)` — amber/orange (14px bold)
- Label "BASE CREDITS" / "BONUS CREDITS": `#aaa`
- Values: `#f90` amber for base, `#0f0` green for bonus
- "TOTAL CREDITS" label: `#f90` amber bold
- Total value: `#f90` amber (22px bold) with orange glow on count-up finish

#### BIO-MATTER (conditional section)
- Background band: `rgba(0, 255, 0, 0.03)` — subtle green tint
- Section header "BIO-MATTER": `rgba(0, 255, 0, 0.8)` — green (14px bold)
- "BIOMTR DELIVERED" label: `#aaa`, value: `#0f0` green
- "BIOMTR LOST" label: `#aaa`, value: `#f44` red
- "BIOMTR EARNED" label: `#0f0` green bold, value: `#0f0` green bold with glow

#### TOTAL SCORE
- Background band: none
- Label "TOTAL SCORE": `#aaa` (14px bold)
- Value: `#fff` white (24px bold), `shadowColor: '#0ff'`, `shadowBlur: 12` on appear, fading to `shadowBlur: 0` over 400ms

#### COUNTDOWN
- Background band: pulsing (see Part 2)
- Text: pulsing color-cycling (see Part 2)

### 1.6 Padding and Spacing Rules

All measurements are from baseline to baseline for text, from edge to edge for rects.

- **Panel horizontal padding**: 24px each side (content does not touch panel border)
- **Section gap (divider zone)**: 16px total (8px above divider line, 8px below)
- **Rows within a section**: 8px gap between rows
- **Section header to first data row**: 12px
- **Target icons**: 44px tall, with 20px gap below icons to counts, 14px below counts to type labels
- **Bio-matter rows**: 14px between each row
- **Bonus check lines**: 20px between each line (they need breathing room)

### 1.7 Section Layout Details

#### HEADER Section

```
cursorY = panelY + padV
  Panel label "WAVE ANALYSIS" at (contentLeft, panelY + 16), 14px bold cyan
  cursorY += 10
  Wave title "WAVE N" centered at (centerX, cursorY), 28px bold white with hex-decode
  cursorY += 20
  --- divider ---
  cursorY += sectionGap/2
```

The ">> MISSION DEBRIEF INITIATED" subheader is **removed** per user feedback.

#### TARGETS Section

```
  Section header "TARGETS" at (contentLeft, cursorY), 14px bold
  cursorY += 12
  Background band: full width, rgba(0,255,255,0.04)
    Band extends from current cursorY - 4 to cursorY + iconSize + 56
  Target row: 6 icons evenly spaced, each column:
    Diamond indicator above icon
    Icon (44px)
    Count below (16px bold)
    Type label below count (10px)
  cursorY += iconSize + 56
  --- divider ---
  cursorY += sectionGap/2
```

#### POINTS Section

```
  Section header "POINTS" at (contentLeft, cursorY), 14px bold yellow
  cursorY += 16
  "WAVE POINTS" label left, value right (22px bold yellow)
  cursorY += 8
  Segmented bar (3px tall, full width)
  cursorY += 12
  [If bonusPoints > 0 and pointsFinished:]
    "BONUS POINTS" label left, "+XXX" value right (14px, green)
    cursorY += 14
  [Bonus check lines, staggered:]
    Each line: 20px tall
    cursorY += 20 per line
  [If bonuses earned:]
    "BONUS MULT: +XX%" (13px bold yellow)
    cursorY += 14
  --- divider ---
  cursorY += sectionGap/2
```

#### CREDITS Section

```
  Section header "CREDITS" at (contentLeft, cursorY), 14px bold amber
  cursorY += 16
  "BASE CREDITS" label left, value right (14px / 16px)
  cursorY += 14
  "BONUS CREDITS" label left, "+XX" value right (14px / 16px green)
  cursorY += 10
  Thin half-width divider
  cursorY += 12
  Diamond + "TOTAL CREDITS" label left (14px bold), value right (22px bold amber)
  cursorY += 8
  --- divider ---
  cursorY += sectionGap/2
```

#### BIO-MATTER Section (conditional)

Only rendered if `droneHarvests > 0 || bioMatterEarned > 0 || lostDeliveries > 0`.

```
  Background band: full width, rgba(0,255,0,0.03)
  Section header "BIO-MATTER" at (contentLeft, cursorY), 14px bold green
  cursorY += 16
  [If droneHarvests > 0:]
    Diamond + "BIOMTR DELIVERED" label, value right (14px / 18px green)
    cursorY += 14
  [If lostDeliveries > 0:]
    Diamond + "BIOMTR LOST" label, value right (14px / 18px red)
    cursorY += 14
  [If bioMatterEarned > 0:]
    Diamond + "BIOMTR EARNED" label (bold), "+XX" value right (14px / 18px green glow)
    cursorY += 14
  --- divider ---
  cursorY += sectionGap/2
```

#### TOTAL SCORE Section

```
  Diamond + "TOTAL SCORE" label left (14px bold), value right (24px bold white with cyan glow)
  cursorY += 12
  --- divider ---
  cursorY += sectionGap/2
```

#### COUNTDOWN Section

```
  Full-width background band (pulsing)
  Centered text: ">>> ENTERING SHOP IN X <<<" (16px bold)
  cursorY += 28
```

Final: `panelH = cursorY - panelY + bottomPad`

---

## Part 2: Countdown Pulse Design

The countdown occupies the bottom full-width band of the panel as its own horizontal section with a background fill.

### 2.1 Layout

- Full width from `panelX + 2` to `panelX + panelW - 2` (inside panel border)
- Height: 36px (including padding)
- Text centered: `>>> ENTERING SHOP IN X <<<`
- Font: bold 16px monospace

### 2.2 Pulse Frequency Escalation

The pulse is driven by `Math.sin(postCompleteTimer * Math.PI * 2 * freq)` where `freq` varies by remaining seconds:

| Remaining | Frequency | Behavior |
|-----------|-----------|----------|
| 4s | 1 Hz | Gentle slow pulse. Text alpha oscillates 0.5 to 1.0. BG alpha oscillates 0.02 to 0.06 |
| 3s | 2 Hz | Medium pulse. Text alpha 0.5 to 1.0. BG alpha 0.03 to 0.08 |
| 2s | 4 Hz | Fast pulse. Text alpha 0.4 to 1.0. BG alpha 0.04 to 0.10 |
| 1s | 8 Hz | Rapid flash with color cycling. Text cycles white -> cyan -> white per cycle. BG alpha 0.06 to 0.15 |
| 0s | - | Bright flash: full white text, BG alpha 0.25, shadowBlur 20 for 100ms |

### 2.3 Color Cycling (1s remaining)

When `remaining === 1`:
- Compute `cyclePhase = (postCompleteTimer % 0.125) / 0.125` (8Hz = 0.125s per cycle)
- Text color interpolates: white (#fff) at phase 0 -> cyan (#0ff) at phase 0.5 -> white (#fff) at phase 1.0
- Background cycles: `rgba(0, 255, 255, alpha)` to `rgba(255, 255, 255, alpha)` in sync
- Add `shadowBlur: 4 + cyclePhase * 8` for a glow effect that intensifies with each cycle

### 2.4 Flash at 0s

When `remaining === 0` (the instant before shop transition):
- Background: `rgba(255, 255, 255, 0.25)` flash across the full countdown band
- Text: `#fff` at full alpha with `shadowBlur: 20`, `shadowColor: '#fff'`
- This matches the bio-matter upload completion flash aesthetic — a bright whiteout pulse

### 2.5 Background Band

The countdown band background is a filled rect from `panelX + 2` to `panelX + panelW - 2`, covering the countdown section height. Its fill is:

```js
// Base: dark with cyan tint, pulsing
const pulseAlpha = basePulseAlpha + pulseRange * Math.sin(postCompleteTimer * Math.PI * 2 * freq);
ctx.fillStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
```

The exact `basePulseAlpha` and `pulseRange` vary by remaining seconds (see table above).

---

## Part 3: Specific String Replacements

Every string literal that changes, with exact old -> new:

| Old String | New String | Location |
|------------|------------|----------|
| `'WAV.ANALYSIS'` | `'WAVE ANALYSIS'` | Panel label, line 22925 |
| `'>> MISSION DEBRIEF INITIATED'` | (REMOVED entirely) | Line 22946, remove typewriter block |
| `'TGT.TELEMETRY'` | `'TARGETS'` | Line 22969 |
| `'PTS.CALC'` | `'POINTS'` | Line 22999 |
| `'WAV.POINTS'` | `'WAVE POINTS'` | Line 23010 |
| `'BONUS.PTS'` | `'BONUS POINTS'` | Line 23057 |
| `'CRED.CALC'` | (REMOVED — credits becomes its own section with header) | Line 23115 |
| `'BASE.CRED'` | `'BASE CREDITS'` | Line 23122 |
| `'BONUS.CRED'` | `'BONUS CREDITS'` | Line 23131 |
| `'TOTAL.CRED'` | `'TOTAL CREDITS'` | Line 23152 |
| `'BIO.STATUS'` | `'BIO-MATTER'` | Line 23203 |
| `'BM.DELIVERED'` | `'BIOMTR DELIVERED'` | Line 23212 |
| `'BM.LOST'` | `'BIOMTR LOST'` | Line 23224 |
| `'BM.EARNED'` | `'BIOMTR EARNED'` | Line 23241 |
| `'CUMU.SCORE'` | `'TOTAL SCORE'` | Line 23272 |
| `'>> SHOP.INTERFACE IN ' + remaining + '...'` | `'>>> ENTERING SHOP IN ' + remaining + ' <<<'` | Line 23307 |
| `'BONUS MULT: +'` | `'BONUS MULT: +'` | (unchanged, line 23089) |

Also in `renderSystemCheckLine` or bonus label processing:
| Old Pattern | New Pattern |
|-------------|-------------|
| `bonus.label.replace(/\s+/g, '.')` | `bonus.label` (remove the dot-replacement, keep original label with spaces) |

Also update the `labelTypewriterChars` limit from 12 to 13 (length of "WAVE ANALYSIS") in `updateWaveSummary()` line 22378.

---

## Part 4: Layout Calculation Pseudocode

### 4.1 Dynamic Panel Height (Content-Driven)

```pseudocode
function layoutWaveSummary(measureOnly):
    cursorY = 0  // relative to panelY

    // HEADER
    cursorY += padV     // 20px top padding
    cursorY += 10       // space before title
    cursorY += 28       // wave title height (28px font)
    cursorY += 20       // space after title
    cursorY += 1        // divider
    cursorY += sectionGap/2  // 8px below divider

    // TARGETS
    cursorY += 14       // section header "TARGETS" (14px)
    cursorY += 12       // gap header -> content
    targetBandTop = cursorY - 4
    cursorY += 44       // icon height
    cursorY += 20       // gap to counts
    cursorY += 16       // count text
    cursorY += 14       // type label
    cursorY += 6        // bottom pad
    targetBandBottom = cursorY + 4
    if NOT measureOnly:
        render target background band from targetBandTop to targetBandBottom
    cursorY += 1        // divider
    cursorY += sectionGap/2

    // POINTS (only if elapsed >= timings.targetsEnd)
    if pointsVisible:
        cursorY += 14   // section header
        cursorY += 16   // gap
        cursorY += 22   // wave points value (22px font baseline)
        cursorY += 8    // gap to bar
        cursorY += 3    // bar height
        cursorY += 12   // gap after bar

        if bonusPoints > 0 AND pointsFinished:
            cursorY += 14  // bonus points row

        for each bonus in bonuses (up to bonusesRevealed):
            cursorY += 20  // each bonus check line

        if earnedCount > 0 AND all bonuses revealed:
            cursorY += 14  // bonus multiplier line

        cursorY += 1    // divider
        cursorY += sectionGap/2

    // CREDITS (only if bucksStarted)
    if creditsVisible:
        cursorY += 14   // section header "CREDITS"
        cursorY += 16   // gap
        cursorY += 14   // BASE CREDITS row
        cursorY += 14   // BONUS CREDITS row
        cursorY += 10   // gap to mini-divider
        cursorY += 1    // mini-divider
        cursorY += 12   // gap
        cursorY += 22   // TOTAL CREDITS row (22px value)
        cursorY += 8    // bottom pad
        cursorY += 1    // divider
        cursorY += sectionGap/2

    // BIO-MATTER (conditional)
    if bioVisible AND hasBioData:
        bioBandTop = cursorY - 4
        cursorY += 14   // section header
        cursorY += 16   // gap
        if droneHarvests > 0:
            cursorY += 14  // BIOMTR DELIVERED row (14px gap)
        if lostDeliveries > 0:
            cursorY += 14  // BIOMTR LOST row
        if bioMatterEarned > 0:
            cursorY += 14  // BIOMTR EARNED row
        bioBandBottom = cursorY + 4
        if NOT measureOnly:
            render bio background band from bioBandTop to bioBandBottom
        cursorY += 1    // divider
        cursorY += sectionGap/2

    // TOTAL SCORE
    if totalScoreVisible:
        cursorY += 24   // TOTAL SCORE row (24px value)
        cursorY += 12   // bottom pad
        cursorY += 1    // divider
        cursorY += sectionGap/2

    // COUNTDOWN
    if complete:
        cursorY += 36   // countdown band height

    cursorY += bottomPad  // 20px

    return cursorY  // this is panelH
```

### 4.2 Rendering Section Backgrounds

Section backgrounds are drawn AFTER the panel but BEFORE the section content. They are full-width rects clipped to the panel interior.

```pseudocode
function renderSectionBackground(panelX, panelW, bandTop, bandBottom, color):
    ctx.save()
    // Clip to panel interior (reuse panel path)
    clipToPanelInterior(panelX, panelY, panelW, panelH)
    ctx.fillStyle = color
    ctx.fillRect(panelX + 2, bandTop, panelW - 4, bandBottom - bandTop)
    ctx.restore()
```

For the TARGETS section: `rgba(0, 255, 255, 0.04)`
For the BIO-MATTER section: `rgba(0, 255, 0, 0.03)`

### 4.3 CursorY Progression — Full Render Pass

```pseudocode
function renderWaveSummary():
    // Guard
    if !waveSummary or !waveSummaryState: return

    ctx.save()
    ctx.setTransform(1,0,0,1,0,0)

    // Render frozen game scene + dark overlay (unchanged)
    renderBackground()
    renderTargets(), renderTanks(), renderUFO(), renderParticles(), renderFloatingTexts()
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0,0,canvas.width,canvas.height)

    // Panel width
    panelW = Math.min(720, canvas.width * 0.85)

    // PASS 1: measure height
    panelH_measured = layoutAllSections(true)  // measureOnly=true
    panelH = Math.min(panelH_measured, canvas.height * 0.92)

    // Center panel
    panelX = (canvas.width - panelW) / 2
    panelY = (canvas.height - panelH) / 2
    centerX = panelX + panelW / 2
    contentLeft = panelX + 24
    contentRight = panelX + panelW - 24
    contentWidth = panelW - 48

    // Render panel background (border trace or filled)
    if borderTraceProgress < 1:
        renderNGEPanel(...) with panelFillAlpha
        renderPanelBorderTrace(...)
    else:
        renderNGEPanel(...) with alpha=0.88

    // Panel label "WAVE ANALYSIS"
    if labelTypewriterChars > 0:
        ctx.font = 'bold 14px monospace'
        ctx.fillStyle = '#0ff'
        ctx.fillText('WAVE ANALYSIS'.substring(0, labelTypewriterChars), panelX+14, panelY+16)

    // PASS 2: render all sections
    cursorY = panelY + padV

    // --- HEADER ---
    cursorY += 10
    renderHexDecodeText('WAVE ' + waveSummary.wave, centerX, cursorY, 28, hexDecodeProgress)
    cursorY += 20
    renderDivider(contentLeft, contentRight, cursorY)
    cursorY += sectionGap/2

    // --- TARGETS ---
    if elapsed >= 0.50:
        renderSectionHeader('TARGETS', contentLeft, cursorY, 'rgba(0,255,255,0.8)')
    cursorY += 12
    // Draw target background band
    targetBandTop = cursorY - 4
    targetBandH = 44 + 20 + 16 + 14 + 10
    renderSectionBg(panelX, panelW, targetBandTop, targetBandTop + targetBandH, 'rgba(0,255,255,0.04)')
    // Render target row
    renderTargetRow(...)
    cursorY += targetBandH
    renderDivider(contentLeft, contentRight, cursorY)
    cursorY += sectionGap/2

    // --- POINTS ---
    if elapsed >= timings.targetsEnd:
        renderSectionHeader('POINTS', contentLeft, cursorY, 'rgba(255,204,0,0.8)')
        cursorY += 16
        // WAVE POINTS label + value
        ctx.font = '14px monospace'; fillText('WAVE POINTS', contentLeft, cursorY)
        ctx.font = 'bold 22px monospace'; fillText(pointsValue, contentRight, cursorY)
        cursorY += 8
        renderNGEBar(contentLeft, cursorY, contentWidth, 3, barPercent, '#fc0', {segments:10})
        cursorY += 12
        // BONUS POINTS (if applicable)
        // Bonus check lines
        // Bonus multiplier
        renderDivider(...)
        cursorY += sectionGap/2

    // --- CREDITS ---
    if bucksStarted:
        renderSectionHeader('CREDITS', contentLeft, cursorY, 'rgba(255,153,0,0.8)')
        cursorY += 16
        // BASE CREDITS, BONUS CREDITS rows
        // Mini divider
        // TOTAL CREDITS with count-up
        renderDivider(...)
        cursorY += sectionGap/2

    // --- BIO-MATTER ---
    if bioVisible AND hasBioData:
        bioBandTop = cursorY - 4
        renderSectionHeader('BIO-MATTER', contentLeft, cursorY, 'rgba(0,255,0,0.8)')
        cursorY += 16
        // BIOMTR DELIVERED/LOST/EARNED rows
        bioBandBottom = cursorY + 4
        renderSectionBg(panelX, panelW, bioBandTop, bioBandBottom, 'rgba(0,255,0,0.03)')
        renderDivider(...)
        cursorY += sectionGap/2

    // --- TOTAL SCORE ---
    if elapsed >= timings.totalsEnd:
        // Diamond + TOTAL SCORE label + value (24px bold white with cyan glow)
        cursorY += 12
        renderDivider(...)
        cursorY += sectionGap/2

    // --- COUNTDOWN ---
    if complete:
        renderCountdownBand(panelX, panelW, cursorY, cursorY + 36, st)

    // CRT scanlines (unchanged)
    renderScanlines()

    ctx.restore()
```

### 4.4 Implementation Notes on Two-Pass Approach

Rather than literally running two passes, a cleaner approach for the actual implementation:

1. Compute `panelH` by running the cursorY math WITHOUT any draw calls (just arithmetic)
2. Then render everything in a single pass

This is simpler than a `measureOnly` flag because the height calculation is pure math — no canvas calls needed. The section visibility depends only on `elapsed` and data presence, which are known upfront.

```js
// Height pre-calculation (no draw calls)
let measuredH = 20; // padV
measuredH += 10 + 28 + 20; // header
measuredH += 1 + 8; // divider
measuredH += 14 + 12 + 44 + 20 + 16 + 14 + 6; // targets
measuredH += 1 + 8; // divider
if (elapsed >= st.timings.targetsEnd) {
    measuredH += 14 + 16 + 22 + 8 + 3 + 12; // points header + wave points + bar
    if (waveSummary.bonusPoints > 0 && st.pointsFinished) measuredH += 14;
    measuredH += Math.min(waveSummary.bonuses.length, st.bonusesRevealed) * 20;
    const earnedCount = waveSummary.bonuses.filter(b => b.earned).length;
    if (earnedCount > 0 && st.bonusesRevealed >= waveSummary.bonuses.length) measuredH += 14;
    measuredH += 1 + 8; // divider
}
if (st.bucksStarted) {
    measuredH += 14 + 16 + 14 + 14 + 10 + 1 + 12 + 22 + 8; // credits section
    measuredH += 1 + 8; // divider
}
const hasBio = waveSummary.droneHarvests > 0 || waveSummary.bioMatterEarned > 0 || waveSummary.lostDeliveries > 0;
if (elapsed >= st.timings.bioEnd && hasBio) {
    measuredH += 14 + 16; // bio header
    if (waveSummary.droneHarvests > 0) measuredH += 14;
    if (waveSummary.lostDeliveries > 0) measuredH += 14;
    if (waveSummary.bioMatterEarned > 0) measuredH += 14;
    measuredH += 8 + 1 + 8; // padding + divider
}
if (elapsed >= st.timings.totalsEnd) {
    measuredH += 24 + 12 + 1 + 8; // total score
}
if (st.complete) {
    measuredH += 36; // countdown
}
measuredH += 20; // bottomPad

const panelH = Math.min(measuredH, canvas.height * 0.92);
```

---

## Part 5: Surgical Edit Plan

### Edit 1: renderWaveSummary() — Complete Rewrite (lines 22869-23320)

Replace the entire function body. Key changes:
- Dynamic panelH via pre-calculation block (see 4.4)
- Remove the "MISSION DEBRIEF INITIATED" typewriter block entirely
- All font sizes bumped per the table in 1.3
- Section headers rendered at 14px bold in section accent color
- All string literals replaced per Part 3
- Target section and bio-matter section get tinted background bands
- Credits section separated from points section with its own header
- Countdown becomes a full-width bottom band with accelerating pulse (Part 2)
- Panel label changed to "WAVE ANALYSIS" at 14px bold

### Edit 2: renderTargetRow() — Font Size Bump (lines 22497-22598)

- Count font: `'bold 14px monospace'` -> `'bold 16px monospace'` (line 22568)
- Type label font: `'9px monospace'` -> `'10px monospace'` (line 22593)
- Icon size parameter bumped to 44 from 40 (passed from caller)
- Count Y offset adjusted for larger font

### Edit 3: updateWaveSummary() — Label Length Fix (line 22378)

- `labelTypewriterChars` max: `12` -> `13` (length of "WAVE ANALYSIS")
- `typewriterChars` max: `28` -> remove this limit (or set to 0, since subheader is removed)
- Remove the typewriter chars update block for the subheader entirely (lines 22380-22382)

### Edit 4: startWaveSummary() — State Init (lines 22265-22297)

- No new state fields needed; existing fields cover all animations
- The `typewriterChars` field can remain but will be unused (or remove for cleanliness)

### Edit 5: WAVE_SUMMARY_TIMING — No Changes Needed (line 22090)

The timing constants work as-is. The visual changes don't affect animation timing.

### Edit 6: Bonus Label Processing (line 23072)

- Remove `.replace(/\s+/g, '.')` from the bonus label — use the label directly with spaces
- Change: `const dotLabel = bonus.label.replace(/\s+/g, '.');` -> `const dotLabel = bonus.label;`

---

## Part 6: What This Spec Does NOT Change

- **Animation timing**: All reveal timings, count-up durations, stagger delays stay the same
- **Sound effects**: All SFX hooks remain unchanged
- **State machine**: `updateWaveSummary()` logic flow is unchanged beyond the label length fix
- **Data model**: `buildWaveSummary()` and `waveSummary` object untouched
- **Skip behavior**: `finishWaveSummaryAnimations()` works as-is
- **Panel rendering**: `renderNGEPanel()`, `renderPanelBorderTrace()`, `renderCornerBrackets()` unchanged
- **Helper functions**: `renderHexDecodeText()`, `renderSystemCheckLine()`, `renderNGEBar()`, `renderNGEIndicator()` unchanged
- **CRT scanlines**: Same as current
- **Click-to-skip and auto-continue**: Same flow

---

## Part 7: Visual Comparison Summary

| Aspect | Before | After |
|--------|--------|-------|
| Panel height | Fixed 620px max | Dynamic, content-driven |
| Wave title | 22px | 28px bold with cyan glow |
| Section headers | 11px bold cyan | 14px bold, colored per section |
| Data labels | 12px | 14px |
| Data values | 18px | 22px bold |
| Target counts | 14px | 16px bold |
| Total score value | 18px | 24px bold |
| Countdown | 12px, bottom-right corner | 16px bold, full-width band with pulse |
| "BM." abbreviations | BM.DELIVERED, BM.LOST, BM.EARNED | BIOMTR DELIVERED, BIOMTR LOST, BIOMTR EARNED |
| Subheader | ">> MISSION DEBRIEF INITIATED" | Removed |
| Credits section | Sub-section of Points | Own section with amber/orange identity |
| Panel label | "WAV.ANALYSIS" 11px | "WAVE ANALYSIS" 14px |
| Horizontal padding | 20px | 24px |
| Target section background | None | Subtle cyan tint |
| Bio section background | None | Subtle green tint |
| Countdown pulse | Fixed 2Hz sine | Escalating 1Hz -> 2Hz -> 4Hz -> 8Hz with color cycling |
| Clever acronyms | Everywhere | Replaced with readable text |
