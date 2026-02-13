# First Wave Renaissance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the first wave experience from a functional tutorial into a cinematic command-bridge activation sequence through boot polish, tutorial refinement, NGE-styled hints, and dedicated sound design.

**Architecture:** All changes are in the monolithic `js/game.js` file. We add two new SFX functions, upgrade existing render functions to use `renderNGEPanel()` instead of plain `roundRect`, extend boot timing for wave 1, add wave-1-specific boot text, and enhance the "ALL SYSTEMS GO!" completion moment into an NGE-style notification bar.

**Tech Stack:** Vanilla JS, Canvas 2D API, Web Audio API (synthesized SFX via oscillators/gain nodes)

---

### Task 1: Add SFX.allSystemsGo() sound effect

**Files:**
- Modify: `js/game.js:2856` (just before the closing `};` of the SFX object)

**Step 1: Add the new SFX function**

Insert the following just before line 2857 (`};` that closes the SFX object). The preceding line is `2856:    },` (end of `bioUploadComplete`).

Find this exact code:

```js
    bioUploadComplete: () => {
        // ... (existing code)
    },
};
```

Replace the closing `},\n};` with:

```js
    },

    // Ascending three-tone chord for tutorial completion
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
};
```

**Step 2: Verify no syntax errors**

Run: Open the game in a browser, open the console, and confirm no errors on page load. Type `SFX.allSystemsGo()` in the console to hear the ascending three-tone chord.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: add SFX.allSystemsGo() ascending three-tone chord for tutorial completion"
```

---

### Task 2: Add SFX.tutorialHintAppear() sound effect

**Files:**
- Modify: `js/game.js` (inside SFX object, right after the `allSystemsGo` function added in Task 1)

**Step 1: Add the new SFX function**

Insert right after `allSystemsGo`'s closing `},` and before the final `};`:

```js
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
```

**Step 2: Verify**

Run: Open the game in a browser console. Type `SFX.tutorialHintAppear()` to hear a soft rising sine tone.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: add SFX.tutorialHintAppear() rising tone for hint entrance"
```

---

### Task 3: Wire SFX.allSystemsGo() into tutorial celebration

**Files:**
- Modify: `js/game.js:4683-4686` (inside `updateTutorial()`, the CELEBRATION branch)

**Context:** When the CELEBRATION phase begins (line 4683), `tutorialState.completionActive` is set to `true` and `triggerTutorialCommander('complete')` is called. Currently there is no dedicated sound here -- the only sound was `SFX.powerupCollect()` on hint dismiss (line 4590). We add the new triumphant sound at celebration start.

**Step 1: Add the sound trigger**

Find this code at line 4683:

```js
            } else if (tutorialState.phase === 'CELEBRATION') {
                tutorialState.completionActive = true;
                tutorialState.completionTimer = 0;
                triggerTutorialCommander('complete');
```

Replace with:

```js
            } else if (tutorialState.phase === 'CELEBRATION') {
                tutorialState.completionActive = true;
                tutorialState.completionTimer = 0;
                triggerTutorialCommander('complete');
                SFX.allSystemsGo && SFX.allSystemsGo();
```

**Step 2: Verify**

Run: Start a new game, complete the tutorial (move, beam, warp juke, bomb). When "ALL SYSTEMS GO!" appears, you should hear the ascending three-tone chord instead of (or in addition to) the old powerup collect sound.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: play allSystemsGo sound at tutorial celebration start"
```

---

### Task 4: Wire SFX.tutorialHintAppear() into hint transitions

**Files:**
- Modify: `js/game.js` at four locations where `hintVisible` is set to `true`

**Context:** Tutorial hints become visible at these points in `updateTutorial()`:
1. Line 4660 -- beam hint shown (`tutorialState.hintVisible = true` after move phase transitions to beam)
2. Line 4677 -- warp juke hint shown
3. Line 4680 -- bomb hint shown
4. Line 4731-4733 area -- initial move hint shown

**Step 1: Add sound at beam hint appearance (line 4660)**

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

**Step 2: Add sound at warp juke hint appearance (line 4677)**

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

**Step 3: Add sound at bomb hint appearance (line 4680)**

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

**Step 4: Add sound at initial move hint appearance**

Read the area around line 4731-4735 to find where the initial move hint becomes visible. Find:

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

**Step 5: Verify**

Run: Start new game, wait for boot to complete. Each time a tutorial hint slides in (move, beam, warp juke, bomb), you should hear a soft rising tone.

**Step 6: Commit**

```bash
git add js/game.js
git commit -m "feat: play tutorialHintAppear sound when each tutorial hint slides in"
```

---

### Task 5: Upgrade renderHintPanel() to NGE style

**Files:**
- Modify: `js/game.js:5038-5043` (`renderHintPanel()` function)

**Context:** The current `renderHintPanel()` uses a plain `roundRect` with black semi-transparent fill. We replace it with `renderNGEPanel()` which gives it angular cut corners and the hex-grid texture that matches the rest of the HUD.

The function takes `(cx, cy, width, height)` where `(cx, cy)` is the CENTER of the panel. `renderNGEPanel()` takes top-left `(x, y)`, so we need to convert.

**Step 1: Add a color parameter and replace with NGE panel**

Find this function at line 5038:

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

**Step 2: Pass the correct color from each hint renderer**

Each hint renderer calls `renderHintPanel(cx, cy, panelW, panelH)`. We need to pass the phase color.

Find in `renderMoveHint` (around line 5048):

```js
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.movement);
```

Find in `renderBeamHint` (around line 5075):

```js
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.beam);
```

Find in `renderWarpJukeHint` (around line 5113):

```js
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.warp_juke);
```

Find in `renderBombHint` (around line 5142):

```js
    renderHintPanel(cx, cy, panelW, panelH);
```

Replace with:

```js
    renderHintPanel(cx, cy, panelW, panelH, TUTORIAL_CONFIG.COLORS.bomb);
```

Also check `renderCoordChargeHint()` (around line 4928) for another call:

```js
    renderHintPanel(panelX, panelY, panelW, panelH);
```

Replace with:

```js
    renderHintPanel(panelX, panelY, panelW, panelH, TUTORIAL_CONFIG.COLORS.coordinator_charge);
```

**Step 3: Verify**

Run: Start a new game, wait for tutorial hints. Each hint should now appear with:
- Dark angular panel with hex-grid texture (matching HUD panels)
- One cut corner (top-right)
- Colored border matching the phase color (cyan for move, yellow for beam, green for warp juke, orange for bomb)

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: upgrade tutorial hint panels to NGE style with phase-colored borders"
```

---

### Task 6: Transform "ALL SYSTEMS GO!" into NGE notification bar

**Files:**
- Modify: `js/game.js:5309-5358` (`renderTutorialCompletion()` function)

**Context:** The current function renders a 380x70 `roundRect` panel with white "ALL SYSTEMS GO!" text and a cycling border. We transform it into a wider NGE-style notification bar with cascade indicators on the sides.

**Step 1: Replace the renderTutorialCompletion function**

Find the entire function at line 5309:

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

    // NGE notification bar
    const panelW = Math.min(600, canvas.width * 0.5);
    const panelH = 50;

    // Cycling color through tutorial phase colors
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
    const indicatorSpacing = 14;
    const indicatorStartX = panelW / 2 - 50;
    for (let i = 0; i < 3; i++) {
        // Right side
        renderNGEIndicator(
            indicatorStartX + i * indicatorSpacing, 0,
            'square', currentColor, 'cascade',
            { cascadeIndex: i, cascadeTotal: 3 }
        );
        // Left side (mirrored)
        renderNGEIndicator(
            -indicatorStartX - i * indicatorSpacing, 0,
            'square', currentColor, 'cascade',
            { cascadeIndex: i, cascadeTotal: 3 }
        );
    }

    ctx.textBaseline = 'alphabetic';
    ctx.restore();
}
```

**Step 2: Verify**

Run: Start a new game, complete the full tutorial. The "ALL SYSTEMS GO" moment should now appear as:
- Wider NGE-styled panel (~600px or 50% of canvas width)
- Cut corners on top-left and bottom-right (diagonal slash feel)
- Hex-grid texture in background
- White text with color-cycling glow
- 3 cascade square indicators on each side, pulsing in sequence
- Color cycles through cyan -> yellow -> green -> orange

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: transform ALL SYSTEMS GO into NGE notification bar with cascade indicators"
```

---

### Task 7: Add beam-up pulsing guide line

**Files:**
- Modify: `js/game.js:5095-5107` (inside `renderBeamHint()`, after the chevron drawing code)

**Context:** The beam hint already has animated chevrons pointing down. We add a thin pulsing dashed line below the chevrons that extends toward the ground, creating a visual "aim here" guide.

**Step 1: Add the beam guide line after the existing chevrons**

Find the end of the chevron drawing code in `renderBeamHint()`:

```js
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

    // Pulsing dashed beam guide line to ground
    const guideAlpha = 0.1 + Math.sin(t * 3) * 0.1 + 0.1;
    ctx.strokeStyle = `rgba(255, 255, 0, ${guideAlpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = -t * 40; // Scrolls downward
    ctx.beginPath();
    ctx.moveTo(cx, chevronY + 10);
    ctx.lineTo(cx, canvas.height * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);
}
```

**Step 2: Verify**

Run: Start a new game, progress to the beam hint (after completing the move hint). Below the animated chevrons, you should see a thin pulsing dashed yellow line extending down toward the ground. The dashes should scroll downward.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: add pulsing dashed beam guide line below beam hint chevrons"
```

---

### Task 8: Extend Quantum OS logo duration on Wave 1

**Files:**
- Modify: `js/game.js:16536-16542` (inside `updateHUDBoot()`, the `'logo'` phase handler)

**Context:** The logo phase currently lasts 0.5 seconds for all waves. On wave 1, we extend it to 1.0 seconds for a more dramatic first activation.

**Step 1: Make the logo duration wave-dependent**

Find this code at line 16536:

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

Run: Start a new game. The Quantum OS logo (with hex grid and orbiting dots) should display for ~1 second on wave 1. Then start a second wave and confirm the logo shows for the normal ~0.5 seconds.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: extend Quantum OS logo display to 1s on wave 1"
```

---

### Task 9: Add Wave 1 personalized boot text

**Files:**
- Modify: `js/game.js:16643-16721` (`generateBootLines()` function)

**Context:** The current `generateBootLines()` produces generic diagnostic text for all waves. On wave 1, we want "first activation" themed text to reinforce the feeling of powering up the spacecraft for the first time.

**Step 1: Add a wave 1 branch at the start of generateBootLines**

Find the beginning of the function:

```js
function generateBootLines() {
    const snap = hudBootState.techSnapshot;
    const lines = hudBootState.bootLines;

    // STATUS panel
    lines.status = [
        `>> INIT SYS.STATUS v${snap.wave}.0`,
```

Replace the function body up through the SYSTEMS panel (but NOT the WEAPONS/FLEET/COMMANDER panels which are conditional) with:

```js
function generateBootLines() {
    const snap = hudBootState.techSnapshot;
    const lines = hudBootState.bootLines;

    if (snap.wave === 1) {
        // Wave 1: first activation themed text
        lines.status = [
            `>> FIRST ACTIVATION DETECTED`,
            `SCORE MODULE        [########] OK`,
            `INITIALIZING HARVEST PROTOCOLS`,
            `[OK] SENSORS CALIBRATED`,
            `>> MOTHERSHIP UPLINK ESTABLISHED`
        ];

        lines.mission = [
            `>> LOADING MISSION PARAMETERS`,
            `QUOTA.DB: FIRST DEPLOYMENT`,
            `TARGET: ${snap.quotaTarget} SPECIMENS`,
            `[OK] HARVEST ZONE MAPPED`,
            `>> AWAITING COMMANDER ORDERS`
        ];

        lines.systems = [
            `>> POWER-ON SELF TEST`,
            `HULL: ${snap.maxHealth} HP -- PRISTINE`,
            `BEAM ARRAY: FULLY CHARGED`,
            `ENERGY CORE: 100%`,
            `[OK] ALL SYSTEMS GREEN`,
            `>> SHIP READY FOR DEPLOYMENT`
        ];
    } else {
        // Non-wave-1: existing generic text
        lines.status = [
            `>> INIT SYS.STATUS v${snap.wave}.0`,
```

Then close the else block after the existing SYSTEMS panel lines. You need to find the line:

```js
        `>> INTEGRITY CHECK PASS`
    ];
```

And add `}` right after it to close the else block. The resulting structure is:

```
function generateBootLines() {
    ...
    if (snap.wave === 1) {
        lines.status = [...];
        lines.mission = [...];
        lines.systems = [...];
    } else {
        lines.status = [...];   // existing
        lines.mission = [...];  // existing
        lines.systems = [...];  // existing
    }

    // WEAPONS panel (if active) -- unchanged, stays outside the if/else
    if (hudBootState.panels.weapons.active) {
        ...
```

**Step 2: Verify**

Run: Start a new game. During the boot sequence, look at the STATUS boot text overlay. It should say ">> FIRST ACTIVATION DETECTED" and other wave-1-specific lines. Then play to wave 2 and confirm the generic boot text returns.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: add personalized first-activation boot text for wave 1"
```

---

### Task 10: Add "MOTHERSHIP UPLINK ESTABLISHED" moment on Wave 1

**Files:**
- Modify: `js/game.js:16944+` (inside `renderHUDBootGlobalEffects()`)

**Context:** After all panels finish booting, the boot sequence ends. On wave 1, we add a brief "MOTHERSHIP UPLINK ESTABLISHED" text flash with a cyan edge pulse before the tutorial begins. This bridges the boot completion to the tutorial start.

We need to find where `hudBootState.phase` transitions to `'complete'` and add a visual flourish.

**Step 1: Find the boot completion transition**

Look for where `hudBootState.phase = 'complete'` is set in `updateHUDBoot()`. Read the area around line 16600+ to find the exact transition point.

**Step 2: Add a brief mothership uplink state**

This is best implemented as a new visual in `renderHUDBootGlobalEffects()`. At the end of the function, after the trace rendering, add a "boot complete flash" section that only fires on wave 1:

Add this code at the end of `renderHUDBootGlobalEffects()`, just before its closing `}`:

```js
    // Wave 1: "MOTHERSHIP UPLINK ESTABLISHED" flash after boot completes
    if (wave === 1 && hudBootState.phase === 'complete') {
        const flashTimer = hudBootState.timer - hudBootState.duration;
        if (flashTimer >= 0 && flashTimer < 0.8) {
            ctx.save();
            // Edge pulse (first 100ms)
            if (flashTimer < 0.1) {
                const pulseAlpha = 0.3 * (1 - flashTimer / 0.1);
                ctx.strokeStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
                ctx.lineWidth = 3;
                ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            }
            // Text display (100ms to 500ms, fade 500ms to 800ms)
            if (flashTimer >= 0.1 && flashTimer < 0.8) {
                let textAlpha = 1;
                if (flashTimer >= 0.5) {
                    textAlpha = 1 - (flashTimer - 0.5) / 0.3;
                }
                ctx.globalAlpha = Math.max(0, textAlpha);
                ctx.fillStyle = '#0ff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('MOTHERSHIP UPLINK ESTABLISHED', canvas.width / 2, 30);
            }
            ctx.restore();
        }
    }
```

**Important:** The `renderHUDBootGlobalEffects()` function currently returns early if `hudBootState.phase !== 'booting'` (line 16945). You need to remove or modify that early return so this wave-1 flash can render after boot completes. Change:

```js
function renderHUDBootGlobalEffects() {
    if (hudBootState.phase !== 'booting') return;
```

To:

```js
function renderHUDBootGlobalEffects() {
    if (hudBootState.phase !== 'booting' && !(wave === 1 && hudBootState.phase === 'complete')) return;
```

**Step 3: Verify**

Run: Start a new game. After the boot sequence completes and all panels come online, you should see:
- A brief cyan flash along the screen edges (~100ms)
- "MOTHERSHIP UPLINK ESTABLISHED" in cyan 14px monospace, centered at the top
- Text fades out over ~300ms
- Then the Commander welcome triggers and the tutorial begins

On wave 2+, this should not appear.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: add MOTHERSHIP UPLINK ESTABLISHED flash after wave 1 boot completion"
```

---

### Summary of Changes

| Task | Feature | Lines Modified | Risk |
|------|---------|----------------|------|
| 1 | SFX.allSystemsGo() | ~2856 | Low (additive) |
| 2 | SFX.tutorialHintAppear() | ~2870 | Low (additive) |
| 3 | Wire allSystemsGo into celebration | ~4686 | Low (1 line) |
| 4 | Wire tutorialHintAppear into hints | ~4660,4677,4680,4733 | Low (1 line each) |
| 5 | NGE-style hint panels | 5038-5043, 5048, 5075, 5113, 5142, 4928 | Low (cosmetic) |
| 6 | ALL SYSTEMS GO NGE bar | 5309-5358 | Low (cosmetic) |
| 7 | Beam guide line | 5095-5107 | Low (additive) |
| 8 | Extended wave 1 logo | 16539 | Medium (timing) |
| 9 | Wave 1 boot text | 16643-16675 | Low (isolated branch) |
| 10 | Mothership uplink flash | 16944 | Medium (early return change) |

**Testing order:** Tasks 1-4 are independent quick wins. Task 5 depends on `renderNGEPanel()` being available (it is). Task 6 depends on `renderNGEIndicator()` being available (it is). Tasks 7-10 are independent of each other.
