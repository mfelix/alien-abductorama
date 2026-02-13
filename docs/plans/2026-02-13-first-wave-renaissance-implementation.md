# First Wave Renaissance — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the first wave experience across four streams: UFO phase-in materialization, tutorial popup NGE treatment with sound redesign, HUD panel relocation (diag/opslog to right side), and Commander HUD refinement.

**Architecture:** All changes are in the monolithic `js/game.js` file (~24,000 lines). Changes span 6 distinct code regions that don't overlap: SFX object (lines ~622-2857), tutorial rendering (lines ~4920-5358), UFO class (lines ~5448-6000), HUD layout (lines ~13774-13807), HUD panel rendering/animation (lines ~14167-15535), and boot sequence (lines ~16516-16944). Each task specifies exact find/replace strings for surgical editing.

**Tech Stack:** Vanilla JS, Canvas 2D API, Web Audio API (synthesized SFX via oscillators/gain nodes)

**Testing:** This is a canvas game with no automated test suite. Each task includes manual verification steps: open the game in a browser, trigger the relevant behavior, and confirm visually/aurally. Open the game with `open index.html` or a local server.

---

## Phase 1: Sound Design (Tasks 1-4)

These are additive changes to the SFX object and 1-line wiring. Zero visual change, zero risk.

---

### Task 1: Add SFX.allSystemsGo() — NERV-style ascending chord

**Files:**
- Modify: `js/game.js` — inside the SFX object, after the last method

**Step 1: Add the new SFX function**

Find this exact code (the end of the SFX object):

```js
    bioUploadComplete: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.04);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 3;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.04);
    },
};
```

Replace with:

```js
    bioUploadComplete: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.04);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 3;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.04);
    },

    // NERV-style ascending chord for "ALL SYSTEMS GO" tutorial completion
    allSystemsGo: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // Klaxon phase: low warning tone with wobble
        const klaxon = audioCtx.createOscillator();
        const klaxonGain = audioCtx.createGain();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        klaxon.type = 'square';
        klaxon.frequency.setValueAtTime(200, t);
        klaxon.frequency.linearRampToValueAtTime(600, t + 0.5);
        lfo.frequency.value = 4;
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(klaxon.frequency);
        klaxonGain.gain.setValueAtTime(0.001, t);
        klaxonGain.gain.linearRampToValueAtTime(0.12, t + 0.05);
        klaxonGain.gain.setValueAtTime(0.12, t + 0.3);
        klaxonGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        klaxon.connect(klaxonGain);
        klaxonGain.connect(audioCtx.destination);
        klaxon.start(t);
        klaxon.stop(t + 0.55);
        lfo.start(t);
        lfo.stop(t + 0.55);
        // Resolution phase: confident dual-tone chime
        const chime1 = audioCtx.createOscillator();
        const chime2 = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        chime1.type = 'sine';
        chime2.type = 'sine';
        chime1.frequency.value = 880;
        chime2.frequency.value = 1320;
        chimeGain.gain.setValueAtTime(0.001, t + 0.5);
        chimeGain.gain.linearRampToValueAtTime(0.15, t + 0.55);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        chime1.connect(chimeGain);
        chime2.connect(chimeGain);
        chimeGain.connect(audioCtx.destination);
        chime1.start(t + 0.5);
        chime1.stop(t + 1.2);
        chime2.start(t + 0.5);
        chime2.stop(t + 1.2);
    },

    // Soft rising tone when tutorial hints slide in
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

    // Quantum phase-in sounds for UFO materialization
    quantumHum: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.4);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.1, t + 0.1);
        g.gain.setValueAtTime(0.1, t + 0.3);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.4);
    },

    phaseLockTone: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.4);
    },

    quantumSnap: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.15);
    },
};
```

**Step 2: Verify**

Open the game in a browser. In the console, run:
- `SFX.allSystemsGo()` — should hear a low klaxon sweep resolving into a clean dual-tone chime
- `SFX.tutorialHintAppear()` — should hear a soft rising sine tone
- `SFX.quantumHum()` — should hear a low square wave sweep
- `SFX.phaseLockTone()` — should hear a rising sine sweep
- `SFX.quantumSnap()` — should hear a crisp triangle wave click

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: add NERV-style sounds for tutorial completion, hint appear, and UFO phase-in"
```

---

### Task 2: Wire SFX.allSystemsGo() into tutorial celebration

**Files:**
- Modify: `js/game.js` — inside `updateTutorial()`, the CELEBRATION branch

**Step 1: Replace the waveComplete sound with allSystemsGo**

Find this exact code:

```js
                SFX.waveComplete && SFX.waveComplete();
            }
        }
        return;
    }
```

Replace with:

```js
                SFX.allSystemsGo && SFX.allSystemsGo();
            }
        }
        return;
    }
```

**Step 2: Verify**

Start a new game, complete the full tutorial (move, beam, warp juke, bomb). When "ALL SYSTEMS GO!" appears, you should hear the NERV-style klaxon-to-chime sound instead of the old simple fanfare.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: replace tutorial celebration sound with NERV-style allSystemsGo"
```

---

### Task 3: Wire SFX.tutorialHintAppear() into hint transitions

**Files:**
- Modify: `js/game.js` — 4 locations where tutorial hints become visible

**Step 1: Add sound at initial move hint appearance**

Find:

```js
    if (!ts.moveCompleted && !ts.hintVisible && !ts.beamHintShown && ts.phaseTimer >= TUTORIAL_CONFIG.MOVE_HINT_DELAY) {
        ts.hintVisible = true;
        ts.hintTimer = 0;
```

Replace with:

```js
    if (!ts.moveCompleted && !ts.hintVisible && !ts.beamHintShown && ts.phaseTimer >= TUTORIAL_CONFIG.MOVE_HINT_DELAY) {
        ts.hintVisible = true;
        ts.hintTimer = 0;
        SFX.tutorialHintAppear && SFX.tutorialHintAppear();
```

**Step 2: Add sound at beam hint appearance**

Find:

```js
                tutorialState.beamHintShown = true;
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                triggerTutorialCommander('beamTargets');
```

Replace with:

```js
                tutorialState.beamHintShown = true;
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                triggerTutorialCommander('beamTargets');
                SFX.tutorialHintAppear && SFX.tutorialHintAppear();
```

**Step 3: Add sound at warp juke hint appearance**

Find:

```js
            } else if (tutorialState.phase === 'WARP_JUKE') {
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
```

Replace with:

```js
            } else if (tutorialState.phase === 'WARP_JUKE') {
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                SFX.tutorialHintAppear && SFX.tutorialHintAppear();
```

**Step 4: Add sound at bomb hint appearance**

Find:

```js
            } else if (tutorialState.phase === 'BOMB') {
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                triggerTutorialCommander('useBombs');
```

Replace with:

```js
            } else if (tutorialState.phase === 'BOMB') {
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                SFX.tutorialHintAppear && SFX.tutorialHintAppear();
                triggerTutorialCommander('useBombs');
```

**Step 5: Verify**

Start a new game. Each time a tutorial hint slides in, you should hear a soft rising tone.

**Step 6: Commit**

```bash
git add js/game.js
git commit -m "feat: play tutorialHintAppear sound when each tutorial hint slides in"
```

---

## Phase 2: Tutorial Visual Upgrades (Tasks 4-6)

---

### Task 4: Upgrade renderHintPanel() to NGE style

**Files:**
- Modify: `js/game.js` — `renderHintPanel()` function and all callers

**Step 1: Replace renderHintPanel with NGE panel version**

Find:

```js
function renderHintPanel(cx, cy, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(cx - width / 2, cy - height / 2, width, height, 10);
    ctx.fill();
}
```

Replace with:

```js
function renderHintPanel(cx, cy, width, height, color) {
    color = color || '#0ff';
    renderNGEPanel(cx - width / 2, cy - height / 2, width, height, {
        color: color,
        cutCorners: ['tr'],
        alpha: 0.6
    });
}
```

**Step 2: Pass phase color from renderMoveHint**

Find:

```js
function renderMoveHint(cx, cy, t) {
    const panelW = 220;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
function renderMoveHint(cx, cy, t) {
    const panelW = 220;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.movement);
```

**Step 3: Pass phase color from renderBeamHint**

Find:

```js
function renderBeamHint(cx, cy, t) {
    const panelW = 320;
    const panelH = 60;
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
function renderBeamHint(cx, cy, t) {
    const panelW = 320;
    const panelH = 60;
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.beam);
```

**Step 4: Pass phase color from renderWarpJukeHint**

Find:

```js
function renderWarpJukeHint(cx, cy, t) {
    const panelW = 340;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
function renderWarpJukeHint(cx, cy, t) {
    const panelW = 340;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.warp_juke);
```

**Step 5: Pass phase color from renderBombHint**

Find the renderBombHint function and its `renderHintPanel` call. Read around line 5139 to find the exact call:

```js
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.bomb);
```

**Step 6: Pass color from renderCoordChargeHint**

Find:

```js
    renderHintPanel(panelX, panelY, panelW, panelH);

    // [SPACE] key badge + text
    const keyW = 60;
    const textLabel = 'RECHARGE COORDINATOR';
```

Replace with:

```js
    renderHintPanel(panelX, panelY, panelW, panelH, TUTORIAL_CONFIG.COLORS.coordinator_charge);

    // [SPACE] key badge + text
    const keyW = 60;
    const textLabel = 'RECHARGE COORDINATOR';
```

**Step 7: Verify**

Start a new game. Each tutorial hint should now appear with:
- Dark angular panel with hex-grid texture (matching HUD panels)
- One cut corner (top-right, 10px 45-degree cut)
- Colored border matching the phase color (cyan=move, yellow=beam, green=warp, orange=bomb)

**Step 8: Commit**

```bash
git add js/game.js
git commit -m "feat: upgrade tutorial hint panels to NGE style with phase-colored borders"
```

---

### Task 5: Redesign beam hint arrows + add guide line

**Files:**
- Modify: `js/game.js` — inside `renderBeamHint()`, replace chevron code

**Step 1: Replace chevron arrows with NGE targeting reticle brackets + guide line**

Find the entire chevron section at the end of `renderBeamHint`:

```js
    // Animated chevron arrows pointing down
    const chevronAlpha = 0.3 + Math.sin(t * 4) * 0.25 + 0.25;
    ctx.strokeStyle = `rgba(255, 255, 0, ${chevronAlpha})`;
    ctx.lineWidth = 2;
    const chevronY = cy + 12;
    for (let i = -1; i <= 1; i++) {
        const chevX = cx + i * 20;
        ctx.beginPath();
        ctx.moveTo(chevX - 6, chevronY);
        ctx.lineTo(chevX, chevronY + 7);
        ctx.lineTo(chevX + 6, chevronY);
        ctx.stroke();
    }
}
```

Replace with:

```js
    // NGE targeting reticle arrows - angular brackets cascading downward
    const bracketW = 12;
    const bracketH = 8;
    const bracketSpacing = 16;
    const bracketStartY = cy + 14;
    const contractAmt = Math.sin(t * 3 * Math.PI * 2) * 3; // Contract/expand at 3Hz

    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const bracketAlpha = 0.9 - i * 0.25; // Top brightest, bottom dimmest
        ctx.strokeStyle = `rgba(255, 255, 0, ${bracketAlpha})`;
        const by = bracketStartY + i * bracketSpacing;
        const halfW = bracketW / 2 + contractAmt;

        // Left bracket >
        ctx.beginPath();
        ctx.moveTo(cx - halfW - 4, by);
        ctx.lineTo(cx - 4, by + bracketH / 2);
        ctx.lineTo(cx - halfW - 4, by + bracketH);
        ctx.stroke();

        // Right bracket <
        ctx.beginPath();
        ctx.moveTo(cx + halfW + 4, by);
        ctx.lineTo(cx + 4, by + bracketH / 2);
        ctx.lineTo(cx + halfW + 4, by + bracketH);
        ctx.stroke();
    }

    // Pulsing dashed beam guide line to ground
    const guideAlpha = 0.1 + Math.sin(t * 3) * 0.1 + 0.1;
    ctx.strokeStyle = `rgba(255, 255, 0, ${guideAlpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = -t * 40; // Scrolls downward
    ctx.beginPath();
    ctx.moveTo(cx, bracketStartY + 3 * bracketSpacing);
    ctx.lineTo(cx, canvas.height * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);
}
```

**Step 2: Verify**

Start a new game, progress to the beam hint. Below the "BEAM UP TARGETS!" text, you should see:
- 3 pairs of angular targeting brackets cascading downward
- Brackets contract and expand rhythmically (3Hz)
- Top pair is brightest, bottom pair dimmest
- A thin pulsing dashed yellow line extends from below the brackets toward the ground
- Dashes scroll downward

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: replace beam hint chevrons with NGE targeting reticle arrows and guide line"
```

---

### Task 6: Transform "ALL SYSTEMS GO!" into NGE notification bar

**Files:**
- Modify: `js/game.js` — `renderTutorialCompletion()` function

**Step 1: Replace the entire renderTutorialCompletion function**

Find:

```js
function renderTutorialCompletion() {
    const ts = tutorialState;
    const t = ts.completionTimer;
    const cy = canvas.height * 0.40;

    // Fade out after COMPLETION_FADE_START
    let alpha = 1;
    if (t >= TUTORIAL_CONFIG.COMPLETION_FADE_START) {
        alpha = 1 - (t - TUTORIAL_CONFIG.COMPLETION_FADE_START) / (TUTORIAL_CONFIG.COMPLETION_DURATION - TUTORIAL_CONFIG.COMPLETION_FADE_START);
        alpha = Math.max(0, alpha);
    }

    // Scale bounce entrance
    let scale = 1;
    if (t < 0.3) {
        const bounceT = t / 0.3;
        scale = bounceT * 1.1 - (bounceT > 0.7 ? (bounceT - 0.7) / 0.3 * 0.1 : 0);
        scale = Math.max(0, Math.min(1.1, scale));
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(canvas.width / 2, cy);
    ctx.scale(scale, scale);

    // Background panel with cycling border
    const panelW = 380;
    const panelH = 70;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 10);
    ctx.fill();

    // Cycling border
    const borderColors = [TUTORIAL_CONFIG.COLORS.movement, TUTORIAL_CONFIG.COLORS.beam, TUTORIAL_CONFIG.COLORS.bomb];
    const borderIdx = Math.floor((t * 4) % borderColors.length);
    ctx.strokeStyle = borderColors[borderIdx];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 10);
    ctx.stroke();

    // "ALL SYSTEMS GO!" text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALL SYSTEMS GO!', 0, 12);

    ctx.restore();
}
```

Replace with:

```js
function renderTutorialCompletion() {
    const ts = tutorialState;
    const t = ts.completionTimer;
    const cy = canvas.height * 0.40;

    // Fade out after COMPLETION_FADE_START
    let alpha = 1;
    if (t >= TUTORIAL_CONFIG.COMPLETION_FADE_START) {
        alpha = 1 - (t - TUTORIAL_CONFIG.COMPLETION_FADE_START) / (TUTORIAL_CONFIG.COMPLETION_DURATION - TUTORIAL_CONFIG.COMPLETION_FADE_START);
        alpha = Math.max(0, alpha);
    }

    // Scale bounce entrance
    let scale = 1;
    if (t < 0.3) {
        const bounceT = t / 0.3;
        scale = bounceT * 1.1 - (bounceT > 0.7 ? (bounceT - 0.7) / 0.3 * 0.1 : 0);
        scale = Math.max(0, Math.min(1.1, scale));
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(canvas.width / 2, cy);
    ctx.scale(scale, scale);

    // NGE notification bar with cycling color
    const panelW = Math.min(600, canvas.width * 0.5);
    const panelH = 50;
    const cycleColors = [
        TUTORIAL_CONFIG.COLORS.movement,
        TUTORIAL_CONFIG.COLORS.beam,
        TUTORIAL_CONFIG.COLORS.warp_juke,
        TUTORIAL_CONFIG.COLORS.bomb
    ];
    const colorIdx = Math.floor((t * 4) % cycleColors.length);
    const currentColor = cycleColors[colorIdx];

    // NGE panel with diagonal slash cut corners
    renderNGEPanel(-panelW / 2, -panelH / 2, panelW, panelH, {
        color: currentColor,
        cutCorners: ['tl', 'br'],
        alpha: 0.7
    });

    // "ALL SYSTEMS GO" text with color-cycling glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = currentColor;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ALL SYSTEMS GO', 0, 0);
    ctx.shadowBlur = 0;

    // Flanking cascade indicators (3 on each side)
    const indicatorStartX = panelW / 2 - 50;
    for (let i = 0; i < 3; i++) {
        renderNGEIndicator(indicatorStartX + i * 14, 0, 'square', currentColor, 'cascade', { cascadeIndex: i, cascadeTotal: 3 });
        renderNGEIndicator(-indicatorStartX - i * 14, 0, 'square', currentColor, 'cascade', { cascadeIndex: i, cascadeTotal: 3 });
    }

    ctx.textBaseline = 'alphabetic';
    ctx.restore();
}
```

**Step 2: Verify**

Complete the full tutorial. "ALL SYSTEMS GO" should now appear as:
- Wider NGE-styled panel (~600px or 50% of canvas width)
- Cut corners on top-left and bottom-right
- Hex-grid texture background
- White text with color-cycling glow
- 3 cascade square indicators pulsing on each side
- Color cycles through cyan → yellow → green → orange

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: transform ALL SYSTEMS GO into NGE notification bar with cascade indicators"
```

---

## Phase 3: UFO Phase-In Materialization (Tasks 7-8)

---

### Task 7: Add UFO phase-in state and update logic

**Files:**
- Modify: `js/game.js` — add state variable, init in `startGame()`, add update function, add render function

**Step 1: Add the ufoPhaseInState variable**

Find this code (near other game state variables, around the UFO class area):

```js
class UFO {
    constructor() {
```

Insert BEFORE it:

```js
// UFO phase-in materialization state
let ufoPhaseInState = null;

class UFO {
    constructor() {
```

**Step 2: Initialize phase-in in startGame()**

Find this code in `startGame()`:

```js
    gameState = 'PLAYING';
    gameStartTime = Date.now();
    activityPingSent = false;
    ufo = new UFO();
```

Replace with:

```js
    gameState = 'PLAYING';
    gameStartTime = Date.now();
    activityPingSent = false;
    ufo = new UFO();
    ufoPhaseInState = wave === 1 ? { active: true, timer: 0, phase: 'noise' } : null;
```

**Step 3: Add the update function**

Find this code in the main update section:

```js
    if (ufo) {
        ufo.update(dt);
    }
```

Replace with:

```js
    if (ufo) {
        // Update UFO phase-in (wave 1 only)
        if (ufoPhaseInState && ufoPhaseInState.active) {
            ufoPhaseInState.timer += dt;
            const t = ufoPhaseInState.timer;
            if (ufoPhaseInState.phase === 'noise' && t >= 0.4) {
                ufoPhaseInState.phase = 'silhouette';
                SFX.quantumHum && SFX.quantumHum();
            } else if (ufoPhaseInState.phase === 'silhouette' && t >= 0.8) {
                ufoPhaseInState.phase = 'phaseLock';
                SFX.phaseLockTone && SFX.phaseLockTone();
            } else if (ufoPhaseInState.phase === 'phaseLock' && t >= 1.2) {
                ufoPhaseInState.phase = 'stabilize';
                SFX.quantumSnap && SFX.quantumSnap();
            } else if (ufoPhaseInState.phase === 'stabilize' && t >= 1.5) {
                ufoPhaseInState.active = false;
                ufoPhaseInState = null;
            }
        }
        ufo.update(dt);
    }
```

**Step 4: Block UFO input during phase-in**

In the UFO `update()` method, find the movement section:

```js
            // Accelerate toward target velocity when keys held
            if (keys['ArrowLeft']) {
                this.vx = Math.max(this.vx - acceleration * dt, -effectiveSpeed);
            }
            if (keys['ArrowRight']) {
                this.vx = Math.min(this.vx + acceleration * dt, effectiveSpeed);
            }
```

Replace with:

```js
            // Accelerate toward target velocity when keys held (blocked during phase-in)
            const phaseInBlocking = ufoPhaseInState && ufoPhaseInState.active;
            if (keys['ArrowLeft'] && !phaseInBlocking) {
                this.vx = Math.max(this.vx - acceleration * dt, -effectiveSpeed);
            }
            if (keys['ArrowRight'] && !phaseInBlocking) {
                this.vx = Math.min(this.vx + acceleration * dt, effectiveSpeed);
            }
```

**Step 5: Block beam during phase-in**

Find:

```js
        // Handle beam activation
        const wantsBeam = keys['Space'];
```

Replace with:

```js
        // Handle beam activation (blocked during phase-in)
        const phaseInActive = ufoPhaseInState && ufoPhaseInState.active;
        const wantsBeam = keys['Space'] && !phaseInActive;
```

**Step 6: Verify**

At this point, the phase-in state transitions work but there's no visual rendering yet. Start a new game on wave 1 — the UFO should appear normally but be unresponsive for 1.5 seconds. Confirm no console errors.

**Step 7: Commit**

```bash
git add js/game.js
git commit -m "feat: add UFO phase-in state machine with input blocking during materialization"
```

---

### Task 8: Add UFO phase-in rendering

**Files:**
- Modify: `js/game.js` — wrap `ufo.render()` call and add render function

**Step 1: Add the phase-in render function**

Find this code just above the `class UFO` line (where we added the state variable in Task 7):

```js
// UFO phase-in materialization state
let ufoPhaseInState = null;
```

Replace with:

```js
// UFO phase-in materialization state
let ufoPhaseInState = null;

function renderUFOPhaseIn() {
    if (!ufoPhaseInState || !ufoPhaseInState.active || !ufo) return;
    const t = ufoPhaseInState.timer;
    const phase = ufoPhaseInState.phase;
    const cx = ufo.x;
    const cy = ufo.y + ufo.hoverOffset;
    const w = ufo.width;
    const h = ufo.height;

    ctx.save();

    if (phase === 'noise') {
        // Quantum noise cloud — random colored rectangles
        const noiseColors = ['#0ff', '#f0f', '#fff', '#006', '#0af', '#f0a'];
        const pulseAlpha = 0.3 + Math.sin(t * 8) * 0.2;
        ctx.globalAlpha = pulseAlpha;
        for (let i = 0; i < 40; i++) {
            const rx = cx - w / 2 + Math.random() * w;
            const ry = cy - h / 2 + Math.random() * h;
            const rw = 2 + Math.random() * 6;
            const rh = 2 + Math.random() * 4;
            ctx.fillStyle = noiseColors[Math.floor(Math.random() * noiseColors.length)];
            ctx.fillRect(rx, ry, rw, rh);
        }
    } else if (phase === 'silhouette') {
        // Wireframe outline that flickers
        const flickerOn = Math.sin(t * 10 * Math.PI * 2) > -0.3;
        if (flickerOn) {
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 8;
            // Draw UFO silhouette as an ellipse
            ctx.beginPath();
            ctx.ellipse(cx, cy, w / 2, h / 3, 0, 0, Math.PI * 2);
            ctx.stroke();
            // Dome
            ctx.beginPath();
            ctx.ellipse(cx, cy - h / 4, w / 5, h / 4, 0, Math.PI, 0);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Horizontal scan lines sweeping down
        const scanY = cy - h / 2 + ((t * 200) % h);
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, scanY);
        ctx.lineTo(cx + w / 2, scanY);
        ctx.stroke();
        // Residual noise (fading)
        const noiseFade = Math.max(0, 1 - (t - 0.4) / 0.4);
        if (noiseFade > 0) {
            ctx.globalAlpha = noiseFade * 0.2;
            const noiseColors = ['#0ff', '#f0f', '#fff'];
            for (let i = 0; i < Math.floor(15 * noiseFade); i++) {
                const rx = cx - w / 2 + Math.random() * w;
                const ry = cy - h / 2 + Math.random() * h;
                ctx.fillStyle = noiseColors[Math.floor(Math.random() * noiseColors.length)];
                ctx.fillRect(rx, ry, 2 + Math.random() * 3, 2);
            }
        }
    } else if (phase === 'phaseLock') {
        // Expanding shockwave ring
        const lockT = t - 0.8;
        const ringRadius = lockT * 200;
        const ringAlpha = Math.max(0, 1 - lockT * 2.5);
        if (ringAlpha > 0) {
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // Engine glow intensification
        const glowIntensity = Math.max(0, 1 - lockT * 3);
        if (glowIntensity > 0) {
            ctx.globalAlpha = glowIntensity * 0.4;
            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.ellipse(cx, cy + h / 4, w / 3, h / 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (phase === 'stabilize') {
        // Residual cyan sparks
        const sparkT = t - 1.2;
        if (sparkT < 0.3) {
            ctx.globalAlpha = 0.5 * (1 - sparkT / 0.3);
            ctx.fillStyle = '#0ff';
            for (let i = 0; i < 3; i++) {
                const sx = cx + (Math.random() - 0.5) * w * 0.8;
                const sy = cy + (Math.random() - 0.5) * h * 0.6;
                ctx.fillRect(sx, sy, 2, 2);
            }
        }
    }

    ctx.restore();
}
```

**Step 2: Modify the UFO render call in the main render loop**

Find:

```js
    // Render UFO (and beam)
    if (ufo) {
        ufo.render();
    }
```

Replace with:

```js
    // Render UFO (and beam)
    if (ufo) {
        if (ufoPhaseInState && ufoPhaseInState.active) {
            // During phase-in, render effects; only show real UFO after phaseLock
            if (ufoPhaseInState.phase === 'phaseLock' || ufoPhaseInState.phase === 'stabilize') {
                ufo.render();
            }
            renderUFOPhaseIn();
        } else {
            ufo.render();
        }
    }
```

**Step 3: Verify**

Start a new game. After Quantum OS boot:
1. A cloud of glitching colored pixels appears where the UFO should be (~0.4s)
2. The noise coalesces into a flickering wireframe UFO outline with scan lines (~0.4s)
3. A white shockwave ring expands as the real UFO snaps into place (~0.4s)
4. Brief residual cyan sparks, then normal gameplay (~0.3s)

Total: ~1.5 seconds of phase-in animation.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: add UFO quantum phase-in materialization with visual effects and sounds"
```

---

## Phase 4: HUD Panel Relocation (Task 9)

---

### Task 9: Move Diagnostics and OPS.LOG to the right side

**Files:**
- Modify: `js/game.js` — `getHUDLayout()` and slide animation code

**Step 1: Update getHUDLayout() positions**

Find:

```js
        commanderZone: { x: margin, y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22), h: 100 },
        diagnosticsZone: { x: margin, y: canvas.height - 390, w: leftW, h: 160 },
        opsLogZone: { x: margin, y: canvas.height - 220, w: Math.min(240, canvas.width * 0.20), h: 100 }
```

Replace with:

```js
        commanderZone: { x: margin, y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22), h: 100 },
        diagnosticsZone: { x: canvas.width - rightW - margin, y: canvas.height - 290, w: rightW, h: 160 },
        opsLogZone: { x: canvas.width - rightW - margin, y: canvas.height - 120, w: rightW, h: 100 }
```

**Step 2: Fix Diagnostics slide direction (slide from right instead of left)**

Find:

```js
        const diagSlideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * -layout.diagnosticsZone.w;
        ctx.translate(diagSlideOffset, 0);
        if (panelReady('diagnostics')) {
            renderDiagnosticsZone(layout.diagnosticsZone);
        }
```

Replace with:

```js
        const diagSlideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * layout.diagnosticsZone.w;
        ctx.translate(diagSlideOffset, 0);
        if (panelReady('diagnostics')) {
            renderDiagnosticsZone(layout.diagnosticsZone);
        }
```

**Step 3: Fix OPS.LOG slide direction (slide from right instead of left)**

Find:

```js
        const opsSlideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * -layout.opsLogZone.w;
        ctx.translate(opsSlideOffset, 0);
        if (panelReady('opslog')) {
            renderOpsLogZone(layout.opsLogZone);
        }
```

Replace with:

```js
        const opsSlideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * layout.opsLogZone.w;
        ctx.translate(opsSlideOffset, 0);
        if (panelReady('opslog')) {
            renderOpsLogZone(layout.opsLogZone);
        }
```

**Step 4: Verify**

Play through to wave 2+ (when diagnostics and OPS.LOG panels appear):
- Both panels should slide in from the right side of the screen
- They should be positioned in the bottom-right area
- Commander panel should remain in the bottom-left
- No overlap with fleet zone panels above
- Enemies in the bottom-left should now be visible and unobstructed

**Step 5: Commit**

```bash
git add js/game.js
git commit -m "feat: relocate diagnostics and OPS.LOG panels to bottom-right to reduce left-side crowding"
```

---

## Phase 5: Commander HUD Refinement (Task 10)

---

### Task 10: Enhance Commander panel with speaking glow, accent line, and status dots

**Files:**
- Modify: `js/game.js` — `renderCommanderZone()` function

**Step 1: Enhance renderCommanderZone()**

Find the beginning of the function:

```js
function renderCommanderZone(zone) {
    const { x, y, w, h } = zone;

    renderNGEPanel(x, y, w, h, { color: '#0f0', cutCorners: ['tl', 'br'], alpha: 0.75 });

    // "INCOMING TRANSMISSION" header with blinking light
    renderNGEBlinkLight(x + 8, y + 6, '#0f0', 250);
    // Bottom-left indicator
    renderNGEIndicator(x + 4, y + h - 8, 'triangle', '#0f0', 'double', {});
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INCOMING TRANSMISSION', x + 16, y + 12);

    // Scanline effect over entire panel
    renderNGEScanlines(x, y, w, h, 0.025);
```

Replace with:

```js
function renderCommanderZone(zone) {
    const { x, y, w, h } = zone;

    // Speaking glow: pulse panel alpha when typewriter is advancing
    const isSpeaking = missionCommanderState.dialogue &&
        missionCommanderState.typewriterIndex < missionCommanderState.dialogue.length;
    const panelAlpha = isSpeaking ? 0.75 + Math.sin(Date.now() / 1000 * 6) * 0.15 : 0.75;

    renderNGEPanel(x, y, w, h, { color: '#0f0', cutCorners: ['tl', 'br'], alpha: panelAlpha });

    // Transmission accent line (left edge, pulses at 3Hz)
    const accentAlpha = 0.3 + Math.sin(Date.now() / 1000 * 3) * 0.2;
    ctx.fillStyle = `rgba(0, 255, 0, ${accentAlpha})`;
    ctx.fillRect(x - 4, y + 2, 2, h - 4);

    // "INCOMING TRANSMISSION" header with blinking light
    renderNGEBlinkLight(x + 8, y + 6, '#0f0', 250);
    // Bottom-left indicator
    renderNGEIndicator(x + 4, y + h - 8, 'triangle', '#0f0', 'double', {});
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INCOMING TRANSMISSION', x + 16, y + 12);

    // Status indicator dots below header
    renderNGEIndicator(x + 8, y + 18, 'circle', '#0f0', 'steady', { rate: 99999 }); // COMMS: always on
    renderNGEIndicator(x + 18, y + 18, 'circle', '#0ff', isSpeaking ? 'blink' : 'steady', { rate: 500 }); // SYNC
    const dialogueComplete = missionCommanderState.dialogue &&
        missionCommanderState.typewriterIndex >= missionCommanderState.dialogue.length;
    renderNGEIndicator(x + 28, y + 18, 'circle', '#ff0', dialogueComplete ? 'steady' : 'blink', { rate: 300 }); // LOCK

    // Corner accent marks at non-cut corners (top-right, bottom-left)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    // Top-right triangle
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w - 4, y);
    ctx.lineTo(x + w, y + 4);
    ctx.closePath();
    ctx.fill();
    // Bottom-left triangle
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + 4, y + h);
    ctx.lineTo(x, y + h - 4);
    ctx.closePath();
    ctx.fill();

    // Scanline effect over entire panel
    renderNGEScanlines(x, y, w, h, 0.025);
```

**Step 2: Verify**

Play to wave 2 (or any wave where the Commander speaks):
- The commander panel border should pulse brighter when text is typing
- A thin green accent line should appear on the left edge, pulsing at a different rate
- Three small colored dots should appear below the "INCOMING TRANSMISSION" header
- Small triangular accent marks should appear at the top-right and bottom-left corners
- When the commander finishes speaking, the glow should settle to normal

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: enhance Commander HUD with speaking glow, accent line, status dots, and corner marks"
```

---

## Phase 6: Boot Sequence Polish (Tasks 11-13)

---

### Task 11: Extend Quantum OS logo duration on Wave 1

**Files:**
- Modify: `js/game.js` — `updateHUDBoot()`, logo phase handler

**Step 1: Make logo duration wave-dependent**

Find:

```js
    } else if (preBoot.phase === 'logo') {
        preBoot.timer += dt;
        preBoot.logoAlpha = Math.min(1, preBoot.timer / 0.2);
        if (preBoot.timer >= 0.5) {
            preBoot.phase = 'dissolve';
            preBoot.timer = 0;
        }
```

Replace with:

```js
    } else if (preBoot.phase === 'logo') {
        preBoot.timer += dt;
        preBoot.logoAlpha = Math.min(1, preBoot.timer / 0.2);
        const logoDuration = wave === 1 ? 1.0 : 0.5;
        if (preBoot.timer >= logoDuration) {
            preBoot.phase = 'dissolve';
            preBoot.timer = 0;
        }
```

**Step 2: Verify**

Start a new game — the Quantum OS logo should hold for ~1 second on wave 1. On wave 2+, it should be the normal ~0.5 seconds.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: extend Quantum OS logo to 1s on wave 1 for dramatic first activation"
```

---

### Task 12: Add Wave 1 personalized boot text

**Files:**
- Modify: `js/game.js` — `generateBootLines()` function

**Step 1: Read the current generateBootLines function**

Read the function starting at the line where `generateBootLines` is defined. Find the opening:

```js
function generateBootLines() {
    const snap = hudBootState.techSnapshot;
    const lines = hudBootState.bootLines;

    // STATUS panel
    lines.status = [
```

**Step 2: Add a wave 1 branch**

Replace the beginning of the function (from `function generateBootLines()` through just before the first `lines.status = [`) with a conditional. The exact replacement depends on what you read. The pattern is:

```js
function generateBootLines() {
    const snap = hudBootState.techSnapshot;
    const lines = hudBootState.bootLines;

    if (snap.wave === 1) {
        // Wave 1: first activation themed text
        lines.status = [
            '>> FIRST ACTIVATION DETECTED',
            'SCORE MODULE        [########] OK',
            'INITIALIZING HARVEST PROTOCOLS',
            '[OK] SENSORS CALIBRATED',
            '>> MOTHERSHIP UPLINK ESTABLISHED'
        ];
        lines.mission = [
            '>> LOADING MISSION PARAMETERS',
            'QUOTA.DB: FIRST DEPLOYMENT',
            `TARGET: ${snap.quotaTarget} SPECIMENS`,
            '[OK] HARVEST ZONE MAPPED',
            '>> AWAITING COMMANDER ORDERS'
        ];
        lines.systems = [
            '>> POWER-ON SELF TEST',
            `HULL: ${snap.maxHealth} HP -- PRISTINE`,
            'BEAM ARRAY: FULLY CHARGED',
            'ENERGY CORE: 100%',
            '[OK] ALL SYSTEMS GREEN',
            '>> SHIP READY FOR DEPLOYMENT'
        ];
    } else {
        // Non-wave-1: existing generic text (keep everything that was here before)
        lines.status = [
```

Close the `else` block after the existing SYSTEMS panel lines, before the WEAPONS panel conditional.

**Step 3: Verify**

Start a new game. During boot, the STATUS panel overlay should show ">> FIRST ACTIVATION DETECTED". On wave 2+, the generic text should appear.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: add personalized first-activation boot text for wave 1"
```

---

### Task 13: Add "MOTHERSHIP UPLINK ESTABLISHED" flash after Wave 1 boot

**Files:**
- Modify: `js/game.js` — `renderHUDBootGlobalEffects()` function

**Step 1: Modify the early return to allow wave 1 post-boot rendering**

Find the beginning of the function:

```js
function renderHUDBootGlobalEffects() {
    if (hudBootState.phase !== 'booting') return;
```

Replace with:

```js
function renderHUDBootGlobalEffects() {
    if (hudBootState.phase !== 'booting' && !(wave === 1 && hudBootState.phase === 'complete')) return;
```

**Step 2: Add the mothership uplink flash at the end of the function**

Find the closing `}` of `renderHUDBootGlobalEffects()`. You'll need to read the function to find its end. Insert this code just before the final `}`:

```js
    // Wave 1: "MOTHERSHIP UPLINK ESTABLISHED" flash after boot completes
    if (wave === 1 && hudBootState.phase === 'complete') {
        const bootElapsed = hudBootState.timer;
        if (bootElapsed < 0.8) {
            ctx.save();
            // Edge pulse (first 100ms)
            if (bootElapsed < 0.1) {
                const pulseAlpha = 0.3 * (1 - bootElapsed / 0.1);
                ctx.strokeStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
                ctx.lineWidth = 3;
                ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            }
            // Text display (100ms to 800ms, fade 500ms to 800ms)
            if (bootElapsed >= 0.1) {
                let textAlpha = 1;
                if (bootElapsed >= 0.5) textAlpha = Math.max(0, 1 - (bootElapsed - 0.5) / 0.3);
                ctx.globalAlpha = textAlpha;
                ctx.fillStyle = '#0ff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('MOTHERSHIP UPLINK ESTABLISHED', canvas.width / 2, 30);
            }
            ctx.restore();
        }
    }
```

**Step 3: Verify**

Start a new game. After all boot panels come online:
- Brief cyan flash along screen edges (~100ms)
- "MOTHERSHIP UPLINK ESTABLISHED" text appears centered at top in cyan
- Text fades out over ~300ms
- On wave 2+, this should NOT appear

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: add MOTHERSHIP UPLINK ESTABLISHED flash after wave 1 boot completion"
```

---

## Summary

| Task | Feature | Code Region | Risk |
|------|---------|-------------|------|
| 1 | All new SFX functions | ~2856 (SFX object end) | Low (additive) |
| 2 | Wire allSystemsGo sound | ~4704 | Low (1 line) |
| 3 | Wire tutorialHintAppear sound | ~4660,4677,4680,4733 | Low (1 line each) |
| 4 | NGE-style hint panels | 5038-5142 | Low (cosmetic) |
| 5 | Beam hint reticle arrows | 5095-5107 | Low (cosmetic) |
| 6 | ALL SYSTEMS GO NGE bar | 5309-5358 | Low (cosmetic) |
| 7 | UFO phase-in state + update | 5448 + 23831 | Medium (new system) |
| 8 | UFO phase-in rendering | 5448 + 24073 | Medium (render path) |
| 9 | HUD panel relocation | 13774 + 14176 + 14196 | Medium (layout) |
| 10 | Commander HUD refinement | 15482-15497 | Low (cosmetic) |
| 11 | Extended wave 1 logo | ~16536 | Low (1 line) |
| 12 | Wave 1 boot text | ~16643 | Low (isolated branch) |
| 13 | Mothership uplink flash | ~16944 | Medium (early return) |

### Parallelization Guide

Since this is a monolithic file, tasks should be done **sequentially** within each phase, but phases that touch different code regions can potentially overlap:

- **Phases 1+2** (Tasks 1-6): Tutorial/sound area (~2856, ~4600-5358)
- **Phase 3** (Tasks 7-8): UFO area (~5448, ~23831, ~24073)
- **Phase 4** (Task 9): HUD layout area (~13774, ~14176, ~14196)
- **Phase 5** (Task 10): Commander render area (~15482)
- **Phase 6** (Tasks 11-13): Boot sequence area (~16536, ~16643, ~16944)

Phases 3, 4, 5, and 6 touch completely different line ranges and can safely be parallelized. Phases 1+2 should be done first since they're the foundation.
