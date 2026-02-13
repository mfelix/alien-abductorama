# UFO Momentum & Movement Sound Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add horizontal momentum physics and a low warbly movement sound to the UFO for a more satisfying left/right movement feel.

**Architecture:** Replace instant position updates with velocity-driven movement using acceleration/friction. Add a persistent Web Audio oscillator with LFO warble whose gain and pitch track the UFO's horizontal velocity magnitude.

**Tech Stack:** Vanilla JS, Web Audio API (oscillators, gain nodes, LFO modulation)

---

### Task 1: Add momentum physics to UFO horizontal movement

**Files:**
- Modify: `js/game.js:4656-4979` (UFO class — constructor and update method)

**Step 1: Update UFO constructor to initialize momentum state**

In the UFO constructor (around line 4664-4665), replace the velocity tracking comment and add friction constant:

```javascript
// Replace these two lines:
this.vx = 0; // Track horizontal velocity for bomb physics
this.lastX = this.x; // For velocity calculation

// With:
this.vx = 0; // Horizontal velocity (drives position + bomb physics)
```

**Step 2: Replace the retroactive velocity calculation and movement block**

In `UFO.update(dt)` (lines 4669-4979), replace the retroactive velocity calculation at the top (lines 4670-4674) and the movement block (lines 4956-4979).

Remove the retroactive velocity calculation (lines 4670-4674):
```javascript
// DELETE these lines:
// Calculate velocity from position change (for bomb physics)
if (dt > 0) {
    this.vx = (this.x - this.lastX) / dt;
    this.lastX = this.x;
}
```

Replace the movement block (lines 4956-4979) with velocity-driven movement:

```javascript
// Movement (only if not actively abducting a target)
const isAbducting = this.beamActive && this.beamTarget;
if (!isAbducting) {
    const thrusterMult = techFlags.thrusterBoost ? 1.3 : 1.0;
    const effectiveSpeed = CONFIG.UFO_SPEED * (1 + playerInventory.speedBonus) * thrusterMult;
    const acceleration = 2000; // px/s² — reaches full speed in ~0.2s
    const friction = 8; // Exponential decay rate — drift ~0.25s

    // Accelerate toward target velocity when keys held
    if (keys['ArrowLeft']) {
        this.vx = Math.max(this.vx - acceleration * dt, -effectiveSpeed);
    }
    if (keys['ArrowRight']) {
        this.vx = Math.min(this.vx + acceleration * dt, effectiveSpeed);
    }

    // Apply friction when no keys held (or both held = cancel out)
    const leftHeld = keys['ArrowLeft'];
    const rightHeld = keys['ArrowRight'];
    if ((!leftHeld && !rightHeld) || (leftHeld && rightHeld)) {
        this.vx *= Math.exp(-friction * dt);
        // Snap to zero when very slow to avoid infinite drift
        if (Math.abs(this.vx) < 1) this.vx = 0;
    }

    // Apply velocity to position
    this.x += this.vx * dt;

    // Reset combo if moving (same as before, but based on velocity)
    if (Math.abs(this.vx) > 10 && combo > 0) {
        combo = 0;
    }

    // Clamp to screen edges and zero velocity at boundaries
    const halfWidth = this.width / 2;
    if (this.x < halfWidth) {
        this.x = halfWidth;
        this.vx = 0;
    } else if (this.x > canvas.width - halfWidth) {
        this.x = canvas.width - halfWidth;
        this.vx = 0;
    }
}
```

**Step 3: Playtest the momentum**

Run: Open the game in browser, move left/right. Verify:
- UFO accelerates smoothly when holding a direction key
- UFO drifts ~0.2-0.3s after releasing key
- UFO stops at screen edges
- Bombs still inherit UFO velocity (drop a bomb while moving)
- Warp juke (double-tap or shift+direction) still works
- Combo resets when moving (same as before)
- Movement is disabled during active abduction

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "Add momentum physics to UFO horizontal movement"
```

---

### Task 2: Add movement sound (low warbly drone)

**Files:**
- Modify: `js/game.js:622-672` (SFX object — add new sound methods near the beam loop)
- Modify: `js/game.js:4956+` (UFO.update — call sound update each frame)

**Step 1: Add movement sound state and methods to SFX object**

After the `stopBeamLoop` method (line 672), add the movement sound methods:

```javascript
// Movement thruster sound — low warbly drone tied to horizontal velocity
moveLoop: null,
moveLoopGain: null,
moveLoopOsc: null,
moveLoopLfo: null,

startMoveLoop: () => {
    if (!audioCtx || SFX.moveLoop) return;

    const t = audioCtx.currentTime;

    // Main oscillator — sine wave, low frequency
    SFX.moveLoopOsc = audioCtx.createOscillator();
    SFX.moveLoopOsc.type = 'sine';
    SFX.moveLoopOsc.frequency.setValueAtTime(80, t);

    // LFO for warble
    SFX.moveLoopLfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    SFX.moveLoopLfo.frequency.setValueAtTime(5, t);
    lfoGain.gain.setValueAtTime(10, t); // Warble depth in Hz
    SFX.moveLoopLfo.connect(lfoGain);
    lfoGain.connect(SFX.moveLoopOsc.frequency);

    // Gain — start silent, ramp up when moving
    SFX.moveLoopGain = audioCtx.createGain();
    SFX.moveLoopGain.gain.setValueAtTime(0.001, t);

    SFX.moveLoopOsc.connect(SFX.moveLoopGain);
    SFX.moveLoopGain.connect(audioCtx.destination);

    SFX.moveLoopOsc.start(t);
    SFX.moveLoopLfo.start(t);
    SFX.moveLoop = true;
},

updateMoveLoop: (speedRatio) => {
    // speedRatio: 0 (stopped) to 1 (full speed)
    if (!audioCtx || !SFX.moveLoop) return;

    const t = audioCtx.currentTime;

    // Pitch: 80Hz at rest → 150Hz at full speed
    const freq = 80 + 70 * speedRatio;
    SFX.moveLoopOsc.frequency.setTargetAtTime(freq, t, 0.05);

    // LFO rate: 5Hz slow warble → 8Hz faster warble at speed
    SFX.moveLoopLfo.frequency.setTargetAtTime(5 + 3 * speedRatio, t, 0.05);

    // Gain: track speed, 0 when stopped → 0.15 at full speed
    // Use setTargetAtTime for smooth ramping (time constant 0.05s ≈ 50ms)
    const targetGain = Math.max(0.001, speedRatio * 0.15);
    SFX.moveLoopGain.gain.setTargetAtTime(targetGain, t, 0.05);
},

stopMoveLoop: () => {
    if (!SFX.moveLoop) return;
    try {
        const t = audioCtx.currentTime;
        SFX.moveLoopGain.gain.setTargetAtTime(0.001, t, 0.05);
        SFX.moveLoopOsc.stop(t + 0.3);
        SFX.moveLoopLfo.stop(t + 0.3);
    } catch (e) {}
    SFX.moveLoop = null;
    SFX.moveLoopOsc = null;
    SFX.moveLoopLfo = null;
    SFX.moveLoopGain = null;
},
```

**Step 2: Start/update the move loop from UFO.update**

In the UFO movement block (modified in Task 1), add sound calls. After the velocity/position logic but before the clamp:

```javascript
// Update movement sound
const maxSpeed = effectiveSpeed;
const speedRatio = Math.min(Math.abs(this.vx) / maxSpeed, 1);
if (speedRatio > 0.01 && audioCtx) {
    if (!SFX.moveLoop) SFX.startMoveLoop();
    SFX.updateMoveLoop(speedRatio);
} else if (SFX.moveLoop) {
    SFX.stopMoveLoop();
}
```

**Step 3: Stop the move loop on game state changes**

Find existing places where `SFX.stopBeamLoop()` is called for cleanup (game over, wave end, etc.) and add `SFX.stopMoveLoop()` alongside. Key locations:

- Game over cleanup (search for `SFX.stopBeamLoop` calls around lines 11240, 21063)
- Wave complete / state transitions

Add `SFX.stopMoveLoop();` right after each `SFX.stopBeamLoop();` call.

**Step 4: Playtest the sound**

Run: Open the game in browser, test:
- Hold left/right — hear low drone spin up, pitch rises with speed
- Release key — drone feathers off as UFO decelerates (pitch drops, volume fades)
- Quick taps — sound briefly pulses on/off
- No sound when stationary
- No sound during beam/abduction
- Sound stops on game over / wave transitions
- Sound doesn't interfere with beam loop or other SFX

**Step 5: Commit**

```bash
git add js/game.js
git commit -m "Add low warbly movement sound tied to UFO horizontal velocity"
```
