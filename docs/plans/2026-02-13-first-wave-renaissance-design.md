# First Wave Renaissance — Unified Design Document

**Date**: 2026-02-13
**Team**: Gaia (Lead) + The Architect + Visual Designer
**Target File**: `js/game.js` (monolithic, ~24,000 lines)

---

## VISION

Transform the first wave experience to match the Neon Genesis Evangelion / Star Trek TNG aesthetic that already defines the HUD system. Four streams of change, unified by one spirit: every element the player encounters from boot to gameplay should feel like part of a living alien command interface.

---

## STREAM 1: UFO PHASE-IN MATERIALIZATION

### Concept

After Quantum OS boot completes, the UFO doesn't descend from above — it **phase-shifts into reality** through quantum materialization. This aligns with the "Quantum OS" theme and feels alien rather than physical.

### Duration: ~1.5 seconds

The phase-in happens within the existing `TUTORIAL_CONFIG.BOOT_WAIT` window (5.0s after wave start), so there's plenty of time.

### Sequence

#### Phase 1: Quantum Noise (0.0s - 0.4s)
- At the UFO's target position (`canvas.height * CONFIG.UFO_Y_POSITION`, centered horizontally), a cloud of glitching pixel noise appears
- Random colored rectangles (2-6px) flicker rapidly within a region roughly matching the UFO's bounding box (180x90)
- Colors: mix of cyan (`#0ff`), magenta (`#f0f`), white (`#fff`), dark blue (`#006`) — digital noise palette
- A low digital hum sound builds (oscillator sweep from 60Hz to 200Hz, square wave, volume 0.15)
- The noise region pulses in opacity (0.3 - 0.7 alpha)

#### Phase 2: Silhouette Resolve (0.4s - 0.8s)
- The noise coalesces into the UFO's silhouette — rendered as a wireframe outline
- The outline flickers between visible (0.8 alpha) and invisible (0.1 alpha) at ~10Hz
- NGE-style horizontal scan lines sweep across the silhouette (top to bottom, 2px lines)
- The noise outside the silhouette fades away
- A phase-lock tone begins (rising sine wave 400Hz → 800Hz, volume 0.1)

#### Phase 3: Phase Lock (0.8s - 1.2s)
- The silhouette solidifies — opacity locks to 1.0
- A bright flash pulse radiates outward from the UFO's center (expanding ring, 2px white stroke, fading as it grows)
- The UFO's full render (`renderUFO()`) snaps into place, replacing the wireframe
- Engine glow intensifies for 0.2s (brighter than normal, then settles)
- "Quantum lock" sound: crystalline snap (high-frequency click + harmonic decay at 1200Hz, 0.15s)

#### Phase 4: Stabilization (1.2s - 1.5s)
- Brief exaggerated hover oscillation (hover offset amplitude 2x normal, decaying to 1x over 0.3s)
- The UFO settles into its normal hovering rhythm
- Faint residual particle traces (2-3 small cyan sparks) drift away from the UFO's edges

### Implementation

Add state object:
```js
let ufoPhaseInState = null; // { active: true, timer: 0, phase: 'noise'|'silhouette'|'phaseLock'|'stabilize'|'complete' }
```

- Initialize in `startGame()` after `ufo = new UFO()`: set `ufoPhaseInState = { active: true, timer: 0, phase: 'noise' }`
- Add `updateUFOPhaseIn(dt)` — advances timer, transitions phases
- In UFO render path (around `renderUFO()`), check phase-in state:
  - During `noise`: render quantum noise cloud, suppress normal UFO render
  - During `silhouette`: render wireframe outline, suppress normal UFO render
  - During `phaseLock`: flash + transition to full render
  - During `stabilize`: exaggerated hover, then set `phase = 'complete'`
  - During `complete` or `null`: normal UFO rendering
- UFO is non-interactive (no beam, no movement input) until phase-in completes
- Add `renderUFOPhaseIn()` function for the visual effects
- After phase-in completes, set `ufoPhaseInState = null` to clean up

### Sounds
- **Quantum hum**: Square wave sweep 60-200Hz, 0.4s, volume 0.15
- **Phase-lock tone**: Sine sweep 400-800Hz, 0.4s, volume 0.1
- **Crystalline snap**: Triangle wave at 1200Hz + click, 0.15s, volume 0.2

---

## STREAM 2: TUTORIAL POPUP NGE TREATMENT + SOUND REDESIGN

### 2A: Upgrade renderHintPanel() to NGE Style

**Current**: `renderHintPanel()` uses plain `rgba(0,0,0,0.5)` roundRect (line 5038-5043)
**Proposed**: Replace with `renderNGEPanel()` calls with phase-colored borders

```js
// Current:
function renderHintPanel(cx, cy, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(cx - width / 2, cy - height / 2, width, height, 10);
    ctx.fill();
}

// New:
function renderHintPanel(cx, cy, width, height, color) {
    color = color || '#0ff';
    renderNGEPanel(cx - width / 2, cy - height / 2, width, height, {
        color: color,
        cutCorners: ['tr'],
        alpha: 0.6
    });
}
```

Each hint renderer passes its phase color:
- `renderMoveHint`: `TUTORIAL_CONFIG.COLORS.movement` (cyan)
- `renderBeamHint`: `TUTORIAL_CONFIG.COLORS.beam` (yellow)
- `renderWarpJukeHint`: `TUTORIAL_CONFIG.COLORS.warp_juke` (green)
- `renderBombHint`: `TUTORIAL_CONFIG.COLORS.bomb` (orange)

### 2B: Beam Hint Arrow Redesign

**Current**: Text chevrons (`V V V`) at line 5095-5107 — simple stroke-drawn `<` shapes
**Proposed**: NGE targeting reticle arrows — angular mechanical brackets

Replace the chevron code with:
- 3 pairs of angular brackets positioned below the hint text, cascading downward
- Each pair: two angled lines forming targeting brackets `>  <` rotated 90° to point down
- Brackets are 12px wide, 8px tall, drawn with 2px strokes in yellow
- Spacing: 16px vertical gap between each pair
- Animation: brackets contract (close) and expand (open) rhythmically at 3Hz
- Topmost pair is brightest (alpha 0.9), bottom pair dimmest (alpha 0.4) — emphasizing downward flow

Plus add a pulsing dashed beam guide line below the brackets:
- From hint bottom to `canvas.height * 0.85` (near ground)
- Color: `rgba(255, 255, 0, alpha)` where alpha pulses 0.1-0.3
- Style: dashed (4px dash, 8px gap), dash offset scrolls downward

### 2C: "ALL SYSTEMS GO!" NGE Transformation

**Current**: 380x70 roundRect with cycling border, white 32px text, `SFX.waveComplete()` sound
**Proposed**: Full NGE notification bar with cascade indicators and NERV-style sound

Visual:
```
Width: min(600, canvas.width * 0.5)
Height: 50px
Panel: renderNGEPanel with cutCorners: ['tl', 'br']
Color: cycles through cyan → yellow → green → orange
Text: "ALL SYSTEMS GO" in bold 28px monospace, white, with color-cycling shadowBlur=12
Flanking: 3 cascade square indicators on each side (renderNGEIndicator)
```

### 2D: Sound Redesign

#### SFX.allSystemsGo() — NERV-Style Klaxon Resolve
Replaces `SFX.waveComplete()` at the tutorial celebration:

1. **Klaxon phase** (0.0 - 0.3s): Low warning oscillator — square wave 200Hz, volume 0.2, ±10Hz wobble at 4Hz LFO
2. **Sweep phase** (0.3 - 0.5s): Square→sine transition, pitch sweep 200Hz → 600Hz
3. **Resolution phase** (0.5 - 0.8s): Dual-tone chime — 880Hz (A5) + 1320Hz (E6) sines, volume 0.2, decay over 0.3s. Triangle wave at 440Hz (A4) for warmth, volume 0.08
4. **Harmonic tail** (0.8 - 1.2s): 880Hz lingers, exponential decay to silence

Alternatively (simpler implementation): Ascending three-tone chord — 400Hz, 600Hz, 800Hz square waves, 30ms apart, 80ms each. Quick and triumphant.

#### SFX.tutorialHintAppear() — System Chirp
Soft rising sine tone 600→900Hz, 0.15s, volume 0.05. Plays when each hint slides in.

### 2E: Boot Sequence Polish (Wave 1 Only)

#### Extended Quantum OS Logo
On Wave 1, extend logo display from 0.5s to 1.0s for dramatic effect.

#### Wave 1 Personalized Boot Text
`generateBootLines()` gets a `wave === 1` branch:
```
STATUS: ">> FIRST ACTIVATION DETECTED", "SCORE MODULE [########] OK", etc.
MISSION: ">> LOADING MISSION PARAMETERS", "QUOTA.DB: FIRST DEPLOYMENT", etc.
SYSTEMS: ">> POWER-ON SELF TEST", "HULL: {maxHealth} HP -- PRISTINE", etc.
```

#### "MOTHERSHIP UPLINK ESTABLISHED" Flash
After all panels finish booting on Wave 1:
- Brief cyan edge pulse (100ms)
- "MOTHERSHIP UPLINK ESTABLISHED" in 14px monospace, cyan, centered at top
- Text fades over 300ms
- Bridges boot completion to tutorial start

---

## STREAM 3: HUD PANEL RELOCATION

### Problem
Three panels stack in the bottom-left: Diagnostics (y: canvas.height-390), OPS.LOG (y: canvas.height-220), Commander (y: canvas.height-110). This crowds the bottom-left corner and enemies get hidden behind the panels.

### Solution
Move Diagnostics and OPS.LOG to the bottom-right. Commander stays bottom-left.

### Layout Changes in `getHUDLayout()` (line 13774)

**Before:**
```js
diagnosticsZone: { x: margin, y: canvas.height - 390, w: leftW, h: 160 }
opsLogZone:      { x: margin, y: canvas.height - 220, w: Math.min(240, canvas.width * 0.20), h: 100 }
commanderZone:   { x: margin, y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22), h: 100 }
```

**After:**
```js
diagnosticsZone: { x: canvas.width - rightW - margin, y: canvas.height - 290, w: rightW, h: 160 }
opsLogZone:      { x: canvas.width - rightW - margin, y: canvas.height - 120, w: rightW, h: 100 }
commanderZone:   { x: margin, y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22), h: 100 }  // UNCHANGED
```

### Animation Direction Changes

Diagnostics and OPS.LOG currently slide from the left (negative offset). They need to slide from the right:

**Diagnostics slide** (line 14176):
```js
// Before: slides from left
const diagSlideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * -layout.diagnosticsZone.w;
// After: slides from right
const diagSlideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * layout.diagnosticsZone.w;
```

**OPS.LOG slide** (line 14196):
```js
// Before: slides from left
const opsSlideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * -layout.opsLogZone.w;
// After: slides from right
const opsSlideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * layout.opsLogZone.w;
```

### Right Column Stack (Top to Bottom)
1. Systems Zone (top-right, y: margin) — existing position
2. Fleet Zone (right side, y: ~108+) — existing position
3. Diagnostics Zone (right side, y: canvas.height-290) — NEW position
4. OPS.LOG Zone (right side, y: canvas.height-120) — NEW position

### Overlap Prevention
- Fleet zone: `y: fleetY` (~108) with `h: 300` → ends at ~408px from top
- Diagnostics: `y: canvas.height - 290` → starts at ~430px from top (720p screen)
- Gap of ~22px between fleet bottom and diagnostics top — sufficient
- On smaller screens, the `canvas.height >= 500` guards already hide these panels

### Energy Flow / Pulse Updates
- `renderEnergyFlows()` references diagnostics zone position — endpoints will automatically update since they read from `layout.diagnosticsZone`
- `renderHUDEnergyPulse()` references diagnostics zone — same auto-update
- The energy flow lines from diagnostics will now connect to the right side instead of left — this actually looks better as it creates cross-screen data flow

---

## STREAM 4: COMMANDER HUD REFINEMENT

### Concept
Subtle visual refinements to the Commander panel to harmonize with the evolved HUD. Not a redesign — an enhancement of `renderCommanderZone()` (line 15482).

### 4A: Speaking Glow Effect
When the commander is speaking (typewriter text advancing), add a breathing glow to the panel border:
- Pulse the `renderNGEPanel` alpha: `alpha = 0.75 + Math.sin(t * 6) * 0.15` when speaking
- When not speaking, use normal alpha (0.75)
- Creates a "transmission active" feel

Implementation: In `renderCommanderZone()`, detect if typewriter is advancing:
```js
const isSpeaking = missionCommanderState.dialogue &&
    missionCommanderState.typewriterIndex < missionCommanderState.dialogue.length;
const panelAlpha = isSpeaking ? 0.75 + Math.sin(Date.now() / 1000 * 6) * 0.15 : 0.75;
renderNGEPanel(x, y, w, h, { color: '#0f0', cutCorners: ['tl', 'br'], alpha: panelAlpha });
```

### 4B: Transmission Accent Line
Add a thin vertical accent line on the left edge of the commander panel:
- 2px wide, green (`#0f0`), positioned at `x - 4`
- Height matches panel height
- Pulses alpha at 3Hz: `0.3 + Math.sin(t * 3) * 0.2`
- Creates visual depth and "signal strength" feel

### 4C: Status Indicator Dots
Below the "INCOMING TRANSMISSION" header, add 3 small colored dots:
- **COMMS** (green): always on when panel visible — `renderNGEIndicator(x+8, y+18, 'circle', '#0f0', 'steady', {})`
- **SYNC** (cyan): blinks at 500ms when typewriter is active — `renderNGEIndicator(x+18, y+18, 'circle', '#0ff', 'blink', { rate: 500 })`
- **LOCK** (yellow): solid when dialogue fully displayed — `renderNGEIndicator(x+28, y+18, 'circle', '#ff0', isSpeaking ? 'blink' : 'steady', { rate: 300 })`

Each dot: 3px radius, uses existing `renderNGEIndicator` function.

### 4D: Corner Accent Marks
At the two non-cut corners (top-right and bottom-left), add small triangular accent marks:
- 4px right-angle triangle, green, alpha 0.3
- These create visual anchoring without changing the panel silhouette
- Drawn after the main panel render

---

## CROSS-STREAM DEPENDENCIES

1. **Stream 1 (Phase-In)**: Independent. Can be implemented first or in parallel.
2. **Stream 2 (Tutorial/Sound)**: Independent of Streams 1, 3, 4. Touches tutorial render functions (5038-5358) and SFX object (622-2454).
3. **Stream 3 (Panel Relocation)**: Independent. Touches `getHUDLayout()` (13774-13807) and slide animation code (14167-14205).
4. **Stream 4 (Commander Refinement)**: Independent. Touches `renderCommanderZone()` (15482-15535) only.

All streams modify `game.js` but touch **different line ranges** — they can be implemented in parallel by careful surgical agents, or sequentially without conflict.

---

## IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (Tasks 1-4) — Sound + Wiring
- Add `SFX.allSystemsGo()` and `SFX.tutorialHintAppear()`
- Wire sounds into tutorial flow
- Zero visual change, purely additive

### Phase 2: Visual Upgrades (Tasks 5-7) — Tutorial Panel Styling
- Upgrade `renderHintPanel()` to NGE style
- Transform "ALL SYSTEMS GO!" into NGE notification bar
- Redesign beam hint arrows + add guide line

### Phase 3: UFO Phase-In (Task 8) — Stream 1
- Add `ufoPhaseInState` object and rendering
- Add phase-in sounds
- New visual effect, self-contained

### Phase 4: HUD Relocation (Task 9) — Stream 3
- Move diagnostics and OPS.LOG to right side
- Update slide animation directions
- Layout change, well-isolated

### Phase 5: Commander Refinement (Task 10) — Stream 4
- Speaking glow, accent line, status dots, corner marks
- Purely additive visual enhancements

### Phase 6: Boot Sequence Polish (Tasks 11-13) — Stream 2E
- Extended Wave 1 logo
- Personalized boot text
- "MOTHERSHIP UPLINK ESTABLISHED" flash

---

## KEY CODE LOCATIONS

| Item | Line | Area |
|------|------|------|
| SFX object | 622-2454 | Sound effects |
| TUTORIAL_CONFIG | 415-445 | Tutorial constants |
| initTutorial() | 4509 | Tutorial init |
| updateTutorial() | 4593 | Tutorial state machine |
| renderHintPanel() | 5038 | Tutorial hint panel |
| renderMoveHint() | 5045 | Move hint |
| renderBeamHint() | 5072 | Beam hint + chevrons |
| renderWarpJukeHint() | 5110 | Warp juke hint |
| renderBombHint() | 5139 | Bomb hint |
| renderTutorialCompletion() | 5309 | "ALL SYSTEMS GO!" |
| class UFO | 5448 | UFO constructor |
| renderUFO() | ~5600+ | UFO rendering |
| startGame() | 12663 | Game initialization |
| renderNGEPanel() | 12892 | NGE panel primitive |
| renderNGEIndicator() | 13305 | NGE indicator primitive |
| getHUDLayout() | 13774 | HUD positioning |
| renderHUDFrame() | 13969 | Main HUD render |
| Diagnostics slide | 14167-14185 | Diag panel animation |
| OPS.LOG slide | 14187-14205 | OpsLog panel animation |
| Commander zone render | 14207-14237 | Commander panel animation |
| renderCommanderZone() | 15482 | Commander panel content |
| renderDiagnosticsZone() | 15537 | Diagnostics panel content |
| updateHUDBoot() | 16516 | Boot sequence logic |
| generateBootLines() | ~16643 | Boot diagnostic text |
| renderHUDBootGlobalEffects() | 16944 | Boot visual effects |
