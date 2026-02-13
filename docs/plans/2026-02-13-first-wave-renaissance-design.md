# First Wave Renaissance - Unified Design Document

**Date**: 2026-02-13
**Authors**: The Architect + NEXUS Visual Designer
**Target File**: `/Users/mfelix/code/alien-abductorama/js/game.js` (24,131 lines)
**Reference Resolution**: 1280x720 canvas

---

## OVERVIEW

The First Wave Renaissance transforms the player's first 60 seconds from a functional tutorial into a cinematic command-bridge activation sequence. Four interconnected streams work together to create the feeling of powering up an alien spacecraft for the first time.

### The Four Transformation Streams

1. **STREAM A: Boot Sequence Polish** -- Enhance the existing Quantum OS boot to feel more cinematic on Wave 1
2. **STREAM B: Tutorial Flow Refinement** -- Tighten the tutorial timing and integrate it with the boot sequence
3. **STREAM C: HUD Progressive Reveal** -- Panels appear as the player needs them, not all at once
4. **STREAM D: First Wave Atmosphere** -- Sound, visual effects, and pacing that make Wave 1 feel special

---

## CURRENT STATE ANALYSIS

### What Already Works (Do Not Change)

The codebase already has a rich, well-implemented system. These elements are ALREADY IMPLEMENTED and should NOT be modified:

| System | Status | Key Lines |
|--------|--------|-----------|
| Tutorial state machine (4 phases) | Working | 4461-4900 |
| Boot sequence (CRT -> Logo -> Trace -> Panels) | Working | 16444-16944 |
| NGE panel rendering primitives | Working | 12892-13412 |
| renderNGEIndicator (5 shapes, 5 modes) | Working | 13305-13393 |
| Panel slide animations (weapons, fleet, diag, opslog, commander) | Working | 14031-14214 |
| Tutorial hints (move, beam, warp juke, bomb) | Working | 4983-5181 |
| Tank warning sequence | Working | 5183-5232 |
| "ALL SYSTEMS GO!" celebration | Working | 5309-5358 |
| Mission zone deferred on Wave 1 | Working | 14000 |
| Boot waits before tutorial starts | Working | 4597-4604 |
| Commander portrait + dialogue with typewriter | Working | 15482-15535 |
| BIOS pre-boot sequence for wave transitions | Working | 21797-21852 |
| OPS.LOG event ticker | Working | pushOpsLogEvent() |
| Diagnostics panel (DIAG.SYS) | Working | 15537-15660 |
| Energy graph (NRG.FLOW) | Working | renderEnergyGraph() |
| Bio-matter upload panel | Working | renderBioMatterPanel() |
| Tech tree visualization | Working | renderTechTree() |
| Full-column scanlines with health-based glitch | Working | 13880-13967 |
| Energy pulse sweep animation | Working | 13809-13878 |

### What Needs Enhancement

These are the specific areas where the first wave experience can be elevated:

1. **"ALL SYSTEMS GO!" moment lacks gravitas** -- Currently uses `SFX.powerupCollect()` and a simple white text panel with cycling border. Should be a proper NGE-style "ALL SYSTEMS NOMINAL" moment.
2. **Boot-to-tutorial transition feels abrupt** -- The boot sequence ends and tutorial hints just appear. Needs breathing room and a Commander welcome.
3. **No dedicated first-wave sound design** -- The boot uses generic panel sounds. Wave 1 deserves a distinct sonic identity.
4. **Tutorial completion doesn't connect to HUD** -- "ALL SYSTEMS GO!" is a floating overlay that doesn't acknowledge the HUD panels below it.

---

## STREAM A: BOOT SEQUENCE POLISH (Wave 1 Only)

### A1: Extended Quantum OS Logo on Wave 1

**Current**: Logo shows for 0.5s (logo phase 0.3-0.8s in preBootState)
**Proposed**: On Wave 1 ONLY, extend logo display to 1.0s for dramatic effect

```
Wave 1 boot timing:
  CRT phase:     0.0 - 0.3s  (unchanged)
  Logo phase:    0.3 - 1.3s  (extended from 0.5s to 1.0s on wave 1)
  Dissolve:      1.3 - 1.5s  (unchanged duration)
  Trace:         1.5 - 2.25s (unchanged duration)
  Panel boot:    2.25 - 5.5s (unchanged)

Non-wave-1 timing: unchanged (current behavior)
```

**Implementation**: In `updateHUDBoot()` at line 16536, change the logo duration check:
```js
const logoDuration = wave === 1 ? 1.0 : 0.5;
if (preBoot.timer >= logoDuration) { ... }
```

### A2: Wave 1 Boot Text Personalization

**Current**: `generateBootLines()` produces generic diagnostic text
**Proposed**: Wave 1 gets unique "first activation" boot lines

```
STATUS panel (Wave 1):
  >> FIRST ACTIVATION DETECTED
  SCORE MODULE        [########] OK
  INITIALIZING HARVEST PROTOCOLS
  [OK] SENSORS CALIBRATED
  >> MOTHERSHIP UPLINK ESTABLISHED

MISSION panel (Wave 1):
  >> LOADING MISSION PARAMETERS
  QUOTA.DB: FIRST DEPLOYMENT
  TARGET: {quotaTarget} SPECIMENS
  [OK] HARVEST ZONE MAPPED
  >> AWAITING COMMANDER ORDERS

SYSTEMS panel (Wave 1):
  >> POWER-ON SELF TEST
  HULL: {maxHealth} HP -- PRISTINE
  BEAM ARRAY: FULLY CHARGED
  ENERGY CORE: 100%
  [OK] ALL SYSTEMS GREEN
  >> SHIP READY FOR DEPLOYMENT
```

**Implementation**: Add a `wave === 1` branch in `generateBootLines()` (around line 16700+).

### A3: "ALL SYSTEMS NOMINAL" Enhancement

**Current**: After all panels boot, a text flash appears (handled in `renderHUDBootGlobalEffects()`)
**Proposed**: On Wave 1, replace with a more dramatic "MOTHERSHIP UPLINK ESTABLISHED" moment

```
Wave 1 completion:
  t=boot_end:     All panels online
  t+0.0s:         Screen edges pulse cyan briefly (100ms)
  t+0.1s:         "MOTHERSHIP UPLINK ESTABLISHED" in 14px monospace, #0ff, centered top
  t+0.5s:         Text fades over 0.3s
  t+0.8s:         Tutorial boot wait ends, Commander welcome triggers

Non-wave-1: unchanged "ALL SYSTEMS NOMINAL" behavior
```

---

## STREAM B: TUTORIAL FLOW REFINEMENT

### B1: Commander Welcome Integration

**Current**: `triggerTutorialCommander('welcome')` fires after `TUTORIAL_CONFIG.BOOT_WAIT` (line 4602)
**Proposed**: Tighten the timing so the Commander's welcome feels like part of the boot sequence completing

```
Current flow:
  Boot ends -> BOOT_WAIT delay -> Commander welcome -> 0.5s -> Move hint

Refined flow:
  Boot ends -> 0.3s breathing room -> Commander welcome slides in
  Commander says welcome line -> 0.8s -> Move hint slides in
  (Commander remains visible alongside move hint)
```

**Implementation**: Reduce `TUTORIAL_CONFIG.BOOT_WAIT` if it's currently too long, or verify it already provides the right pacing. The commander welcome at line 4602 already exists -- just tune the timing constant.

### B2: Tutorial Hint NGE Styling

**Current**: Tutorial hints use `rgba(0,0,0,0.5)` roundRect panels (line 5038-5043)
**Proposed**: Upgrade hint panels to use `renderNGEPanel()` styling to match the rest of the HUD

```
Current hint panel:
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.roundRect(cx - w/2, cy - h/2, w, h, 10);

Proposed hint panel:
  renderNGEPanel(cx - w/2, cy - h/2, w, h, {
    color: phaseColor,  // #0ff, #ff0, #0f0, #f80 per phase
    cutCorners: ['tr'],
    alpha: 0.6
  });
```

This makes the tutorial hints feel like they belong to the same alien command interface as the HUD panels, rather than floating HTML-like overlays.

**Colors per phase** (already defined in `TUTORIAL_CONFIG.COLORS`):
- Movement: `#0ff` (cyan)
- Beam: `#ff0` (yellow)
- Warp Juke: `#0f0` (green)
- Bomb: `#f80` (orange)

### B3: "ALL SYSTEMS GO!" NGE Transformation

**Current**: "ALL SYSTEMS GO!" renders as white text in a roundRect with cycling border (line 5309-5358)
**Proposed**: Transform into a proper NGE-style full-width notification bar

```
Current:
  380x70 roundRect panel, "ALL SYSTEMS GO!" in 32px white

Proposed:
  Full-width NGE notification bar (like an EVA "ALERT" banner):
    Width: min(600, canvas.width * 0.5)
    Height: 50px
    Position: centered, canvas.height * 0.40
    Panel: renderNGEPanel with color cycling through tutorial colors
    Cut corners: ['tl', 'br'] (diagonal slash feel)

  Text: "ALL SYSTEMS GO" in bold 28px monospace
    Color: #fff
    Glow: shadowBlur=12, shadowColor cycles through #0ff -> #ff0 -> #0f0 -> #f80

  Flanking indicators:
    Left side: 3 cascade squares in current cycle color
    Right side: 3 cascade squares in current cycle color
    Creates "data flowing outward from center" feel

  Sound: New SFX.allSystemsGo() -- ascending three-tone chord
    Tone 1: 400Hz square, 0.05s
    Tone 2: 600Hz square, 0.05s (30ms after tone 1)
    Tone 3: 800Hz square, 0.08s (30ms after tone 2)
    Total: ~0.14s, triumphant ascending feel
```

### B4: Beam-Up Instruction Enhancement

**Current**: Beam hint has animated chevrons pointing down (line 5096-5107)
**Proposed**: Add a pulsing beam-line visual connecting the hint to the ground

```
Below the chevrons, add a thin vertical dashed line:
  From: hint bottom (cy + 20)
  To: canvas.height * 0.85 (near ground level)
  Color: rgba(255, 255, 0, alpha) where alpha pulses 0.1-0.3
  Style: dashed (4px dash, 8px gap)
  Animation: dash offset scrolls downward (same as renderEnergyFlowLine)

This creates a visual "aim here" guide without being intrusive.
Only shows during beam hint phase.
```

---

## STREAM C: HUD PROGRESSIVE REVEAL

### C1: Wave 1 Panel Visibility (Already Implemented)

The current code already implements progressive reveal correctly:

```
Wave 1 visible:
  - Status zone: Always (line 13992)
  - Systems zone: Always (line 14019)
  - Mission zone: Deferred until beam hint shown (line 14000)

Wave 1 hidden:
  - Weapons zone: Hidden until bombs purchased (line 14032-14033)
  - Fleet zone: Hidden until drones unlocked (line 14147-14148)
  - Diagnostics: Hidden until PG1 researched (line 14168)
  - OPS.LOG: Hidden until wave >= 2 (line 14188)
  - Commander: Visible when tutorialState active (line 14209)
  - Tech chips: Hidden during boot (line 14009)
  - Bio-matter panel: Hidden during boot (line 14014)
```

**No changes needed.** The progressive reveal is already working as designed.

### C2: Mission Zone Reveal Animation

**Current**: Mission zone appears instantly when `tutorialState.beamHintShown` becomes true
**Proposed**: Add a mini-boot animation when the mission zone first appears during Wave 1

```
When beam hint triggers and mission zone becomes visible:
  1. Mission panel border traces (same as boot trace, 150ms)
  2. Boot overlay shows 2-3 diagnostic lines (200ms)
  3. Panel reveals with "MISSION.CTL ONLINE" flash
  4. Sound: SFX.bootPanelOnline()

This makes the mission zone feel like it "came online" in response to the player
learning the beam mechanic, reinforcing cause-and-effect.
```

**Implementation**: Set `hudBootState.panels.mission` to boot state when beam hint triggers, rather than having it simply appear. Add a check in `updateTutorial()` at the beam hint shown point.

---

## STREAM D: FIRST WAVE ATMOSPHERE

### D1: New Sound: SFX.allSystemsGo()

```js
allSystemsGo: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const freqs = [400, 600, 800];
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = freqs[i];
        const start = t + i * 0.03;
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.08, start + 0.005);
        g.gain.setValueAtTime(0.08, start + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + 0.08);
    }
},
```

### D2: New Sound: SFX.tutorialHintAppear()

```js
tutorialHintAppear: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.12);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.15);
},
```

### D3: Tutorial Hint Appear Sound Integration

When each tutorial hint slides in, play `SFX.tutorialHintAppear()`:
- At the point where `tutorialState.hintVisible = true` in `updateTutorial()`
- Approximately lines 4660, 4666, 4670, 4674 (where hints become visible)

### D4: "ALL SYSTEMS GO!" Sound Integration

Replace `SFX.powerupCollect()` in tutorial completion with `SFX.allSystemsGo()`:
- In `renderTutorialCompletion()` or `updateTutorial()` at the CELEBRATION phase start
- Approximately line 4900 area where completion activates

---

## IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (Independent, can be done in parallel)
1. **B3**: "ALL SYSTEMS GO!" NGE transformation (renderTutorialCompletion changes)
2. **D1+D2**: New SFX functions (add to SFX object)
3. **D3+D4**: Sound integration (1-2 lines each)

### Phase 2: Styling Upgrades
4. **B2**: Tutorial hint NGE panel styling (renderHintPanel changes)
5. **B4**: Beam-up instruction beam-line visual

### Phase 3: Boot Sequence Tuning
6. **A1**: Extended Wave 1 logo timing
7. **A2**: Wave 1 boot text personalization
8. **A3**: "MOTHERSHIP UPLINK ESTABLISHED" moment

### Phase 4: Flow Refinement
9. **B1**: Commander welcome timing adjustment
10. **C2**: Mission zone reveal animation

---

## RISKS AND CONSIDERATIONS

### Low Risk
- **SFX additions (D1, D2)**: Adding new methods to the SFX object is zero-risk. All SFX functions follow the same pattern and are called defensively with `&&` guards.
- **Styling changes (B2, B3)**: Replacing `roundRect` with `renderNGEPanel` is cosmetic. The render functions are well-tested.
- **Boot text changes (A2)**: Adding a `wave === 1` branch to `generateBootLines()` is isolated.

### Medium Risk
- **Logo timing (A1)**: Changing `updateHUDBoot()` timing could affect the boot sequence's interaction with the tutorial `bootWaiting` timer. Need to verify that `TUTORIAL_CONFIG.BOOT_WAIT` accounts for the extended logo.
- **Mission zone reveal (C2)**: Triggering a mini-boot for the mission zone mid-game requires careful state management. The `hudBootState.panels.mission` object must be properly reset and the boot overlay must render correctly inside the already-running `renderHUDFrame()` pipeline.

### Already Working (No Risk)
- Progressive panel reveal (C1) -- already implemented correctly
- Tutorial state machine -- battle-tested across all 4 phases
- Commander welcome -- already triggers at the right time
- Tank entrance sequence -- already dramatic and well-timed

---

## VERIFICATION CHECKLIST

After implementation, verify:

- [ ] Wave 1 starts with extended Quantum OS logo (1.0s vs 0.5s)
- [ ] Wave 1 boot text shows "FIRST ACTIVATION DETECTED" instead of generic text
- [ ] Tutorial hints use NGE panel styling (angular corners, hex texture)
- [ ] Beam hint has pulsing dashed guide line to ground
- [ ] "ALL SYSTEMS GO!" renders as NGE notification bar with cascade indicators
- [ ] `SFX.allSystemsGo()` plays during completion celebration
- [ ] `SFX.tutorialHintAppear()` plays when each hint slides in
- [ ] Mission zone reveals with mini-boot animation when beam hint triggers
- [ ] Commander welcome timing feels natural after boot completion
- [ ] Non-wave-1 behavior is completely unchanged
- [ ] No performance regression (maintain 60fps)
- [ ] All existing tutorial functionality still works (move, beam, warp juke, bomb)

---

## APPENDIX: KEY CODE LOCATIONS

| Item | Line | File |
|------|------|------|
| `startGame()` | 12663 | game.js |
| `initHUDBoot()` | 16444 | game.js |
| `initTutorial()` | 4509 | game.js |
| `updateTutorial()` | 4593 | game.js |
| `renderTutorialHints()` | 4983 | game.js |
| `renderTutorialCompletion()` | 5309 | game.js |
| `renderHintPanel()` | 5038 | game.js |
| `renderHUDFrame()` | 13969 | game.js |
| `renderHUDBootGlobalEffects()` | 16944 | game.js |
| `updateHUDBoot()` | 16516 | game.js |
| `generateBootLines()` | ~16700 | game.js |
| `getHUDLayout()` | 13774 | game.js |
| `renderNGEPanel()` | 12892 | game.js |
| `renderNGEIndicator()` | 13305 | game.js |
| `renderCommanderZone()` | 15482 | game.js |
| `TUTORIAL_CONFIG` | ~4440 | game.js |
| SFX object | 622-2454 | game.js |
| render() pipeline | 24070-24124 | game.js |
| Main game loop | 23761-23806 | game.js |
