# HUD Design Pass 3 - Implementation Architecture

**Date**: 2026-02-13
**Role**: Architect
**Target**: `/Users/mfelix/code/alien-abductorama/js/game.js` (~21,400+ lines)
**Input Docs**: HUD Pass 3 Visual Design Spec, HUD Pass 3 Game/Sound Design Spec, HUD Code Map

---

## PRINCIPLES

1. **Sequential Execution**: All changes to the monolithic game.js must be applied in order. Line numbers shift after each chunk.
2. **No Overlap**: HUD components must never visually overlap. Every pixel is accounted for.
3. **Existing Patterns**: Follow `renderNGE*`, `hudAnimState`, `hudBootState`, `panelReady()` conventions.
4. **Render Order**: New components inserted at correct positions in `renderHUDFrame()`.
5. **Small Screens**: All features degrade gracefully below 900px canvas width.

---

## VERIFIED LINE NUMBERS (Current game.js)

| Item | Line |
|------|------|
| `const SFX = {` | 622 |
| SFX object closing `};` | 2454 |
| `hudAnimState` declaration | 12992 |
| `bioUploadState` declaration | 13026 |
| `techTreeAnimState` declaration | 13037 |
| `preBootState` declaration | 13044 |
| `hudBootState` declaration | 13062 |
| `startGame()` | 12242 |
| `startGame()` state resets block | 12318-12383 |
| `getHUDLayout()` | 13260 |
| `renderHUDFrame()` | 13448 |
| `renderStatusZone()` | 13745 |
| `renderMissionZone()` | 13852 (approx) |
| B.MTR in renderMissionZone | 13947-14006 |
| `renderTechChips()` / `renderTechTree()` | 15184 / 15188 |
| `renderHUDBootGlobalEffects()` | 16225 |
| `initHUDBoot()` | 15725 |
| `updateHUDBoot()` | 15797 |
| `updateWaveTransition()` | 20339 |
| `renderWaveTransition()` | 20373 |
| Main game loop switch | 22345 |
| `renderHUDFrame()` call site | 22664 |
| `renderHUDBootGlobalEffects()` call site | 22668 |
| WAVE_TRANSITION case in loop | 22361 |

---

## PHASE A: INFRASTRUCTURE

### CHUNK A1: New State Variables

**What**: Add `biosBootState` and `bioUploadRows` state variables. Extend `techTreeAnimState` with visibility tracking fields.

**Dependencies**: None

**Where**: After `diagEnhancedState` declaration (line 13060), INSERT AFTER the closing `};`

**Changes**:

INSERT AFTER line 13060 (`};` closing diagEnhancedState):

```js
// BIOS boot sequence state (Pre-Boot sequence during WAVE_TRANSITION)
let biosBootState = {
    active: false,
    startTime: 0,           // Date.now() when sequence began
    elapsed: 0,             // seconds elapsed

    // Text buffer (all panes)
    lines: [],              // { text, color, bold, pane, time }
    lineIndex: 0,           // next line to reveal

    // Pane splits
    horizontalSplit: false,  // true after t=1.0s
    verticalSplit: false,    // true after t=2.0s
    splitHProgress: 0,       // 0..1, horizontal split line draw
    splitVProgress: 0,       // 0..1, vertical split line draw

    // Phase tracking
    phase: 'inactive',       // 'inactive'|'post'|'orchestrator'|'swarm'|'uplink'|'check'|'countdown'|'launch'

    // Download progress
    downloadProgress: 0,     // 0..1
    downloadSpeed: 0,        // displayed speed
    downloadReceived: 0,     // displayed received

    // System check
    checkLines: [],          // { name, dotsProgress, status, statusColor, startTime }
    checkIndex: 0,

    // Countdown
    countdownValue: 3,       // 3, 2, 1, "LAUNCH"

    // Swarm table
    swarmRows: [],           // { name, fillProgress, online, startTime, color }
    swarmIndex: 0,

    // Launch flash
    flashPhase: 0,           // 0..3 strobe cycle index
    flashActive: false,

    // Center panel
    centerPanelAlpha: 0,     // fade-in for countdown panel

    // Sound flags (prevent double-triggering)
    soundFlags: {},

    // Snapshot of game state at transition start
    waveInfo: {
        wave: 0,
        tankCount: 0,
        heavyTankCount: 0,
        hasBombs: false,
        hasMissiles: false,
        hasDrones: false,
        hasCoordinators: false,
        health: 0,
        maxHealth: 0,
        techCount: 0,
        bioMatter: 0,
        droneCount: 0,
        missileGroupCount: 0,
        threatLevel: 'MODERATE'
    }
};

// Bio-matter upload rows for the new BIO-MATTER panel
let bioUploadRows = [];  // { spawnTime, progress, phase, flashStartTime }
```

MODIFY `techTreeAnimState` at line 13037. REPLACE the existing declaration:

```js
// Tech tree horizontal visualization
let techTreeAnimState = {
    dashOffset: 0,           // Animated dash offset for connections
    researchGlowPhase: 0,   // Sine phase for researching node glow
    nodeAppearAnims: {},     // {nodeId: {startTime, progress}}
    visible: false,          // tracks current visibility
    appearProgress: 0,       // 0..1, drives appear animation
    appearStartTime: 0,      // Date.now() when appear began
};
```

**Testing**: Game starts without errors. No visual changes yet.

---

### CHUNK A2: State Resets in startGame()

**What**: Add resets for `biosBootState`, `bioUploadRows`, and the new `techTreeAnimState` fields in `startGame()`.

**Dependencies**: A1

**Where**: Inside `startGame()`, after the existing `techTreeAnimState` reset (line 12372-12374). Also add `bioUploadRows` reset.

**Changes**:

REPLACE the existing `techTreeAnimState` reset at lines 12372-12374:

```js
    techTreeAnimState = {
        dashOffset: 0, researchGlowPhase: 0, nodeAppearAnims: {},
        visible: false, appearProgress: 0, appearStartTime: 0,
    };
```

INSERT AFTER the `diagEnhancedState` reset (after line 12383):

```js
    biosBootState = {
        active: false, startTime: 0, elapsed: 0,
        lines: [], lineIndex: 0,
        horizontalSplit: false, verticalSplit: false,
        splitHProgress: 0, splitVProgress: 0,
        phase: 'inactive',
        downloadProgress: 0, downloadSpeed: 0, downloadReceived: 0,
        checkLines: [], checkIndex: 0,
        countdownValue: 3,
        swarmRows: [], swarmIndex: 0,
        flashPhase: 0, flashActive: false,
        centerPanelAlpha: 0,
        soundFlags: {},
        waveInfo: {
            wave: 0, tankCount: 0, heavyTankCount: 0,
            hasBombs: false, hasMissiles: false, hasDrones: false,
            hasCoordinators: false, health: 0, maxHealth: 0,
            techCount: 0, bioMatter: 0, droneCount: 0,
            missileGroupCount: 0, threatLevel: 'MODERATE'
        }
    };
    bioUploadRows = [];
```

**Testing**: Start a new game, no errors. All state properly initialized.

---

### CHUNK A3: New SFX Functions (BIOS Sounds)

**What**: Add all 17 BIOS Pre-Boot sound effects to the SFX object. These are: S1 POST Beep, S2 HDD Click, S3 Device Detection Chirp, S4 Floppy Seek, S5 System Root Hum, S6 Data Burst, S7 Orchestrator Confirmation, S8 Swarm Agent Two-Tone, S9 Tmux Split Crack, S10 Agent Counter Buzz, S11 Modem Handshake Sweep, S12 Data Transfer Click, S13 Download Complete Trio, S14 System Check Beep, S15 System Check Pass Chord, S16 Countdown Bass Throb, S17 Launch Burst. Also add bio-matter upload sounds (upload blip, completion burst, idle ping).

**Dependencies**: None

**Where**: Inside the SFX object, before the closing `};` at line 2454. Insert new methods.

**Changes**:

INSERT BEFORE line 2454 (the `};` closing the SFX object). Add a comma after the previous method's closing `}`, then:

```js
    // ===== BIOS PRE-BOOT SOUNDS =====

    // S1: POST Beep - single sharp square wave
    biosPostBeep: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1000 * (0.95 + Math.random() * 0.1);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.10, t + 0.002);
        g.gain.setValueAtTime(0.10, t + 0.042);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.062);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.062);
    },

    // S2: HDD Click - bandpass filtered noise burst
    biosHDDClick: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.012);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2500 + (Math.random() - 0.5) * 600;
        bp.Q.value = 8;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
        src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.012);
    },

    // S3: Device Detection Chirp - frequency sweep
    biosDetectionChirp: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        const startFreq = 700 + Math.random() * 200;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2, t + 0.03);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.03);
    },

    // S4: Floppy Seek - bandpass noise with frequency sweep
    biosFloppySeek: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.025);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(800, t);
        bp.frequency.exponentialRampToValueAtTime(1200, t + 0.025);
        bp.Q.value = 3;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.04, t);
        g.gain.setValueAtTime(0.04, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
        src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.025);
    },

    // S5: System Root Hum - rising sawtooth through lowpass
    biosSystemHum: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const lp = audioCtx.createBiquadFilter();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.linearRampToValueAtTime(120, t + 0.35);
        lp.type = 'lowpass';
        lp.frequency.value = 400;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.05);
        g.gain.setValueAtTime(0.06, t + 0.25);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.35);
    },

    // S6: Data Burst - bandpass noise at random center freq
    biosDataBurst: (freqHint) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.02);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freqHint || (400 + Math.random() * 800);
        bp.Q.value = 5;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
        src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.02);
    },

    // S7: Orchestrator Confirmation - 440Hz square blip
    biosOrchestratorConfirm: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 440;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.002);
        g.gain.setValueAtTime(0.08, t + 0.027);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.042);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.042);
    },

    // S8: Swarm Agent Two-Tone Blip
    biosSwarmBlip: (pitchOffset) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const baseFreq = 600 + (pitchOffset || 0) * 50;
        for (let i = 0; i < 2; i++) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = baseFreq + i * 300;
            const start = t + i * 0.04;
            g.gain.setValueAtTime(0.001, start);
            g.gain.linearRampToValueAtTime(0.06, start + 0.001);
            g.gain.setValueAtTime(0.06, start + 0.016);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.02);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(start); osc.stop(start + 0.02);
        }
    },

    // S9: Tmux Split Crack - sharp bandpass noise
    biosTmuxCrack: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.015);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 2;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.10, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
        src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.015);
    },

    // S10: Agent Counter Buzz - rapid high square ticks
    biosAgentTick: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1200;
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.008);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.008);
    },

    // S11: Modem Handshake Sweep - two crossing frequency sweeps
    biosModemHandshake: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // Sweep 1: sawtooth 300->2400Hz
        const osc1 = audioCtx.createOscillator();
        const g1 = audioCtx.createGain();
        const bp1 = audioCtx.createBiquadFilter();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(300, t);
        osc1.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
        bp1.type = 'bandpass'; bp1.frequency.value = 1000; bp1.Q.value = 1;
        g1.gain.setValueAtTime(0.05, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc1.connect(bp1); bp1.connect(g1); g1.connect(audioCtx.destination);
        osc1.start(t); osc1.stop(t + 0.2);
        // Sweep 2: square 1200->400->1800Hz (30ms delayed)
        const osc2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1200, t + 0.03);
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(1800, t + 0.28);
        g2.gain.setValueAtTime(0.001, t + 0.03);
        g2.gain.linearRampToValueAtTime(0.04, t + 0.035);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc2.connect(g2); g2.connect(audioCtx.destination);
        osc2.start(t + 0.03); osc2.stop(t + 0.28);
    },

    // S12: Data Transfer Click - highpass filtered noise
    biosDataClick: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.008);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const hp = audioCtx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 3000;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.006);
        src.connect(hp); hp.connect(g); g.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.008);
    },

    // S13: Download Complete Trio - three ascending square tones
    biosDownloadComplete: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const freqs = [400, 600, 800];
        for (let i = 0; i < 3; i++) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = freqs[i];
            const start = t + i * 0.02;
            g.gain.setValueAtTime(0.001, start);
            g.gain.linearRampToValueAtTime(0.06, start + 0.002);
            g.gain.setValueAtTime(0.06, start + 0.022);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.032);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(start); osc.stop(start + 0.032);
        }
    },

    // S14: System Check Beep - ascending pitch per line
    biosCheckBeep: (lineIndex) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 300 + (lineIndex || 0) * 100;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.07, t + 0.001);
        g.gain.setValueAtTime(0.07, t + 0.026);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.036);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.036);
    },

    // S14 variant: [SKIP] beep - lower, duller
    biosCheckSkip: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 200;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.001);
        g.gain.setValueAtTime(0.05, t + 0.035);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.05);
    },

    // S15: System Check Pass Chord - 1000Hz + 1500Hz
    biosPassChord: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        for (const freq of [1000, 1500]) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.08, t + 0.002);
            g.gain.setValueAtTime(0.08, t + 0.052);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.082);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(t); osc.stop(t + 0.082);
        }
    },

    // S16: Countdown Bass Throb - deep sawtooth through lowpass
    biosCountdownThrob: (number) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // number: 3, 2, or 1 - gets lower, louder, shorter
        const freq = number === 3 ? 50 : number === 2 ? 45 : 40;
        const gain = number === 3 ? 0.15 : number === 2 ? 0.18 : 0.22;
        const dur = number === 3 ? 0.12 : number === 2 ? 0.10 : 0.08;
        const osc = audioCtx.createOscillator();
        const lp = audioCtx.createBiquadFilter();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        lp.type = 'lowpass'; lp.frequency.value = 150;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(gain, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + dur);
    },

    // S17: Launch Burst - noise + sine sweep + sub-impact
    biosLaunchBurst: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // Layer 1: White noise burst
        const bufLen = Math.floor(audioCtx.sampleRate * 0.08);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const g1 = audioCtx.createGain();
        g1.gain.setValueAtTime(0.25, t);
        g1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        src.connect(g1); g1.connect(audioCtx.destination);
        src.start(t); src.stop(t + 0.08);
        // Layer 2: Rising sine sweep
        const sweep = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        sweep.type = 'sine';
        sweep.frequency.setValueAtTime(100, t);
        sweep.frequency.exponentialRampToValueAtTime(2000, t + 0.08);
        g2.gain.setValueAtTime(0.15, t);
        g2.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        sweep.connect(g2); g2.connect(audioCtx.destination);
        sweep.start(t); sweep.stop(t + 0.08);
        // Layer 3: Sub-impact
        const sub = audioCtx.createOscillator();
        const g3 = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.value = 40;
        g3.gain.setValueAtTime(0.20, t);
        g3.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        sub.connect(g3); g3.connect(audioCtx.destination);
        sub.start(t); sub.stop(t + 0.1);
    },

    // ===== BIO-MATTER UPLOAD SOUNDS =====

    // Bio upload row appearing - ascending blip
    bioUploadBlip: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(2200, t + 0.03);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.04, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.03);
    },

    // Bio upload completion burst
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
```

**Testing**: Call `SFX.biosPostBeep()` from console. Should hear a brief square wave beep. No crashes.

---

### CHUNK A4: getHUDLayout() - Add bioMatterZone

**What**: Add a `bioMatterZone` to the layout object in `getHUDLayout()`. This zone sits in the gap between missionZone (ends at centerX + 280) and systemsZone (starts at canvas.width - rightW - margin). Also remove some B.MTR space from missionZone.

**Dependencies**: None

**Where**: `getHUDLayout()` at line 13260

**Changes**:

REPLACE the return statement of `getHUDLayout()` (lines 13276-13286):

```js
    // Bio-matter zone: gap between mission and systems
    const missionEnd = centerX + centerW;
    const systemsStart = canvas.width - rightW - margin;
    const bioGapX = missionEnd + 4;
    const bioGapW = systemsStart - 4 - bioGapX;

    return {
        statusZone: { x: margin, y: margin, w: leftW, h: 120 },
        missionZone: { x: centerX, y: 4, w: centerW, h: 110 },
        bioMatterZone: { x: bioGapX, y: 4, w: bioGapW, h: 110 },
        systemsZone: { x: canvas.width - rightW - margin, y: margin, w: rightW, h: 90 },
        weaponsZone: { x: margin, y: 140, w: leftW, h: 200 },
        fleetZone: { x: canvas.width - rightW - margin, y: fleetY, w: rightW, h: 300 },
        commanderZone: { x: margin, y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22), h: 100 },
        diagnosticsZone: { x: margin, y: canvas.height - 390, w: leftW, h: 160 },
        opsLogZone: { x: margin, y: canvas.height - 220, w: Math.min(240, canvas.width * 0.20), h: 100 }
    };
```

**Testing**: No visual changes. The `bioMatterZone` coordinates are correct (at 1280: x=784, w=287).

---

## PHASE B: TECH TREE CHANGES (F1)

### CHUNK B1: Tech Tree Conditional Visibility

**What**: Add a visibility guard at the top of `renderTechTree()`. The tech tree is hidden when `wave === 1` or when no tech is researched/active/queued. When first becoming visible, trigger a 600ms appear animation.

**Dependencies**: A1 (needs techTreeAnimState.visible, .appearProgress, .appearStartTime)

**Where**: `renderTechTree()` at line 15188, immediately after the function signature.

**Changes**:

INSERT AFTER line 15188 (`function renderTechTree(layout) {`), BEFORE the existing `const statusEnd = ...` line:

```js
    // Conditional visibility: hide until first tech interaction AND wave >= 2
    const shouldShowTree = (techTree.researched.size > 0 || techTree.activeResearch || techTree.queue.length > 0) && wave >= 2;
    if (!shouldShowTree && !techTreeAnimState.visible) return;
    if (shouldShowTree && !techTreeAnimState.visible) {
        techTreeAnimState.visible = true;
        techTreeAnimState.appearStartTime = Date.now();
    }
    const appearProgress = techTreeAnimState.visible
        ? Math.min(1, (Date.now() - techTreeAnimState.appearStartTime) / 600)
        : 1;

    // During appear animation, modulate alpha
    if (appearProgress < 1) {
        ctx.save();
        ctx.globalAlpha = easeOutCubic(appearProgress);
    }
```

At the END of `renderTechTree()` (before the final `}`), add the closing restore:

Find the last `}` of `renderTechTree()`. This is at the end of the research display section. INSERT BEFORE it:

```js
    // Close appear animation alpha wrapper
    if (appearProgress < 1) {
        ctx.restore();
    }
```

Also reset `techTreeAnimState.visible` in `startGame()` (already handled in A2).

**Testing**: Start a new game. Tech tree is invisible in Wave 1. Research a tech, advance to Wave 2 - tech tree fades in over 600ms.

---

### CHUNK B2: Text Label Abbreviations

**What**: Shorten tech chip suffix names to max 4 characters to prevent text overflow in 40px-wide nodes.

**Dependencies**: None

**Where**: `TECH_CHIP_DEFS` definition. Search for `const TECH_CHIP_DEFS`. Currently around line 14770+ (shifted from code map due to Pass 2 changes). The actual location needs to be searched.

From the code map, TECH_CHIP_DEFS was at 14374 but the current code has it elsewhere. It is referenced in renderTechTree at line 15257. Let me provide exact text to search for.

REPLACE the entire `TECH_CHIP_DEFS` array (search for `const TECH_CHIP_DEFS = [`):

```js
const TECH_CHIP_DEFS = [
    { id: 'pg1', text: 'PG1 COND', width: 44, track: 'powerGrid' },
    { id: 'pg2', text: 'PG2 EFFC', width: 44, track: 'powerGrid' },
    { id: 'pg3', text: 'PG3 BCST', width: 44, track: 'powerGrid' },
    { id: 'pg4', text: 'PG4 REAC', width: 44, track: 'powerGrid' },
    { id: 'pg5', text: 'PG5 SGRD', width: 44, track: 'powerGrid' },
    { id: 'dc1', text: 'DC1 UPLK', width: 44, track: 'droneCommand' },
    { id: 'dc2', text: 'DC2 HCRD', width: 44, track: 'droneCommand' },
    { id: 'dc3', text: 'DC3 ACRD', width: 44, track: 'droneCommand' },
    { id: 'dc4', text: 'DC4 EXPD', width: 44, track: 'droneCommand' },
    { id: 'dc5', text: 'DC5 SWRM', width: 44, track: 'droneCommand' },
    { id: 'dn1', text: 'DN1 THRS', width: 44, track: 'defenseNetwork' },
    { id: 'dn2', text: 'DN2 ARMR', width: 44, track: 'defenseNetwork' },
    { id: 'dn3', text: 'DN3 SHLT', width: 44, track: 'defenseNetwork' },
    { id: 'dn4', text: 'DN4 RESI', width: 44, track: 'defenseNetwork' },
    { id: 'dn5', text: 'DN5 SSHD', width: 44, track: 'defenseNetwork' }
];
```

**Testing**: Tech tree nodes should show abbreviated names. No text overflow past node borders. Widths are all 44px now (uniform).

---

### CHUNK B3: Researched Node Blinking Indicator Lights

**What**: Add 2 tiny blinking indicator lights (2x2px each) to each RESEARCHED tech node, positioned vertically stacked on the right edge inside the node.

**Dependencies**: B2 (abbreviated names ensure space for lights)

**Where**: Inside `renderTechTree()`, within the per-node loop, after the node background rendering and before the text rendering. Specifically after the `} else {` block that renders unresearched nodes (currently around line 15333).

**Changes**:

FIND the text rendering section in renderTechTree (line 15337: `const textAlpha = isResearched ? 0.8 ...`). INSERT BEFORE this line:

```js
            // Blinking indicator lights for researched nodes
            if (isResearched) {
                const blinkRate = 600 + n * 200; // tier 1=600ms, tier 5=1400ms
                const trackColor = color;
                for (let li = 0; li < 2; li++) {
                    const ly = ny + 5 + li * 6;
                    const lx = nx + nodeW - 5;
                    const phaseOff = li * 300;
                    const isLightOn = Math.floor((Date.now() + phaseOff) / blinkRate) % 2 === 0;
                    if (isLightOn) {
                        ctx.fillStyle = trackColor;
                        ctx.shadowColor = trackColor;
                        ctx.shadowBlur = 2;
                        ctx.fillRect(lx, ly, 2, 2);
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
                        ctx.fillRect(lx, ly, 2, 2);
                    }
                }
            }
```

**Testing**: Research PG1. Node should show 2 tiny blinking lights on right edge. PG1 blinks at 600ms, PG2 at 800ms, etc. Staggered cascade across a fully researched track.

---

## PHASE C: BIO-MATTER UPLOAD REDESIGN (F2)

### CHUNK C1: Remove B.MTR from renderMissionZone

**What**: Remove the B.MTR display and its upload conduit visualization from `renderMissionZone()`. This block currently occupies lines 13947-14006.

**Dependencies**: None

**Where**: `renderMissionZone()`, the B.MTR block at line 13947-14006.

**Changes**:

DELETE lines 13947-14006 (the entire `// B.MTR display (moved from status zone)` block including the `if (bioMatter > 0 || ...)` block and everything through the `ctx.fillText('\u2191 ' + rateText, ...)` line.

**Testing**: B.MTR label and conduit no longer visible inside MISSION.CTL panel. The mission zone reclaims vertical space.

---

### CHUNK C2: New renderBioMatterPanel() Function

**What**: Create the new standalone `renderBioMatterPanel()` function that renders the bio-matter upload component in the right gap between MISSION.CTL and SYS.INTG.

**Dependencies**: A1, A4, C1

**Where**: INSERT AFTER `renderMissionZone()` function (after its closing `}`).

**Changes**:

INSERT new function after `renderMissionZone()`:

```js
function renderBioMatterPanel(zone) {
    const { x, y, w, h } = zone;

    // Hide if gap too small
    if (w < 120) return;

    // Compact mode flag
    const compact = w < 200;

    // Panel
    renderNGEPanel(x, y, w, h, {
        color: '#0f0',
        cutCorners: [],
        alpha: 0.55,
        label: compact ? 'BIO' : 'BIO-MATTER'
    });

    // Header area (top 22px)
    // Value display
    const labelW = compact ? 30 : 80;
    const valX = x + 6 + labelW;
    if (bioMatter > 0) {
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 4;
        ctx.fillText(bioMatter.toString(), valX, y + 12);
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('0', valX, y + 12);
    }

    // Blink lights in header
    renderNGEBlinkLight(x + w - 18, y + 6, '#0f0', 500);
    renderNGEBlinkLight(x + w - 10, y + 6, '#0f0', 500);

    // Stream area
    const streamX = x + 4;
    const streamY = y + 24;
    const streamW = w - 8;
    const streamH = 80;
    const hasActiveRows = bioUploadRows.some(r => r.phase !== 'done');

    // Stream border
    ctx.fillStyle = 'rgba(0, 20, 0, 0.25)';
    ctx.fillRect(streamX, streamY, streamW, streamH);
    ctx.strokeStyle = hasActiveRows ? 'rgba(0, 255, 0, 0.6)' : 'rgba(0, 170, 68, 0.4)';
    ctx.lineWidth = hasActiveRows ? 1 : 0.5;
    ctx.strokeRect(streamX, streamY, streamW, streamH);

    // Clip to stream area
    ctx.save();
    ctx.beginPath();
    ctx.rect(streamX, streamY, streamW, streamH);
    ctx.clip();

    // Render upload rows or idle state
    const activeRows = bioUploadRows.filter(r => r.phase !== 'done');
    if (activeRows.length === 0) {
        // IDLE STATE
        // Background binary noise
        const now = Date.now();
        ctx.font = '6px monospace';
        ctx.textAlign = 'left';
        for (let i = 0; i < 20; i++) {
            const seed = i * 37;
            const bx = streamX + ((seed * 13 + now * 0.015) % streamW);
            const by = streamY + 4 + (seed * 7) % (streamH - 8);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.06)';
            ctx.fillText(seed % 2 === 0 ? '0' : '1', bx, by);
        }

        // "AWAITING UPLOAD" text
        const blinkOn = Math.floor(now / 2000) % 2 === 0;
        if (blinkOn) {
            ctx.fillStyle = 'rgba(0, 170, 68, 0.3)';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('AWAITING UPLOAD', streamX + streamW / 2, streamY + streamH / 2 + 3);
        }
    } else {
        // ACTIVE STATE - render rows
        const rowH = 14;
        const rowGap = 2;
        const maxVisible = Math.floor(streamH / (rowH + rowGap));
        const visibleRows = activeRows.slice(0, compact ? 2 : maxVisible);

        for (let i = 0; i < visibleRows.length; i++) {
            const row = visibleRows[i];
            const rowY = streamY + i * (rowH + rowGap);
            const rowW = streamW;
            const rowX = streamX;
            const age = (Date.now() - row.spawnTime) / 1000;

            if (row.phase === 'flash') {
                // COMPLETION FLASH
                const flashAge = Date.now() - row.flashStartTime;
                if (flashAge > 300) {
                    // Collapse phase
                    const collapseProgress = Math.min(1, (flashAge - 200) / 100);
                    const currentH = rowH * (1 - collapseProgress * collapseProgress * collapseProgress);
                    if (currentH < 1) { row.phase = 'done'; continue; }
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                    ctx.fillRect(rowX, rowY, rowW, currentH);
                } else {
                    // Strobe
                    const flashPhase = Math.floor(flashAge / 25) % 4;
                    let bg, fg;
                    switch (flashPhase) {
                        case 0: bg = '#0f0'; fg = '#000'; break;
                        case 1: bg = '#000'; fg = '#0f0'; break;
                        case 2: bg = '#0ff'; fg = '#000'; break;
                        default: bg = '#000'; fg = '#fff'; break;
                    }
                    ctx.fillStyle = bg;
                    ctx.fillRect(rowX, rowY, rowW, rowH);
                    ctx.fillStyle = fg;
                    ctx.font = 'bold 7px monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText('UPLOAD COMPLETE', rowX + 4, rowY + 10);
                }
                continue;
            }

            // Calculate progress
            const uploadDuration = 1.5; // seconds
            const t = Math.min(1, age / uploadDuration);
            let progress;
            if (t < 0.3) progress = easeOutCubic(t / 0.3) * 0.3;
            else if (t < 0.9) progress = 0.3 + (t - 0.3) / 0.6 * 0.6;
            else progress = 0.9 + easeOutCubic((t - 0.9) / 0.1) * 0.1;
            row.progress = progress;

            // Check for completion
            if (progress >= 1 && row.phase === 'uploading') {
                row.phase = 'flash';
                row.flashStartTime = Date.now();
                SFX.bioUploadComplete();
                continue;
            }

            // Chevron
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'left';
            const chevOffset = (Date.now() / 200) % 14;
            ctx.fillText('>>', rowX + 2 - chevOffset % 7, rowY + 10);

            if (!compact) {
                // Binary stream
                ctx.font = '7px monospace';
                const binOffset = Math.floor(Date.now() / 80);
                for (let b = 0; b < 8; b++) {
                    const bit = ((binOffset + b + i * 7) * 13) % 2;
                    const alpha = 0.3 + 0.5 * (((binOffset + b) % 5) / 5);
                    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                    ctx.fillText(bit.toString(), rowX + 18 + b * 6, rowY + 10);
                }
            }

            // Progress bar
            const barX = compact ? rowX + 18 : rowX + 70;
            const barW = compact ? rowW - 52 : rowW - 104;
            const barColor = progress > 0.9 ? '#0ff' : '#0f0';
            renderNGEBar(barX, rowY + 3, barW, 8, progress, barColor, { segments: 8 });

            // Percentage
            const pctText = progress >= 1 ? 'XFER' : `${Math.floor(progress * 100)}%`;
            ctx.fillStyle = progress >= 1 ? '#0ff' : '#0f0';
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(pctText, rowX + rowW - 2, rowY + 10);
        }
    }

    ctx.restore(); // end stream clip

    // Footer
    const footerY = y + h - 6;
    ctx.font = '7px monospace';
    ctx.textAlign = 'left';
    if (hasActiveRows) {
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('ACTIVE', x + 6, footerY);
        ctx.font = '7px monospace';
        ctx.textAlign = 'right';
        const rate = bioUploadState.bitRate > 0 ? `${Math.round(bioUploadState.bitRate)} b/s` : '0 b/s';
        ctx.fillText('RATE: ' + rate, x + w - 6, footerY);
        // Fast blink indicator
        renderNGEBlinkLight(x + w - 6, footerY - 8, '#0f0', 200);
    } else {
        ctx.fillStyle = 'rgba(0, 170, 68, 0.4)';
        ctx.fillText('IDLE', x + 6, footerY);
        ctx.textAlign = 'right';
        ctx.fillText('0 b/s', x + w - 6, footerY);
    }
}
```

**Testing**: Not yet visible - needs wiring into renderHUDFrame.

---

### CHUNK C3: Wire renderBioMatterPanel into renderHUDFrame

**What**: Add call to `renderBioMatterPanel()` in `renderHUDFrame()`, positioned between the mission zone and systems zone rendering.

**Dependencies**: C2, A4

**Where**: Inside `renderHUDFrame()`, after the tech chips section (currently around line 13488-13490) and before the systems zone section.

**Changes**:

FIND the `// Tech readout chips in top-center gap` section in renderHUDFrame. INSERT AFTER the closing `}` of that section:

```js
    // Bio-matter upload panel (right gap between mission and systems)
    if (!booting && layout.bioMatterZone.w >= 120) {
        renderBioMatterPanel(layout.bioMatterZone);
    }
```

**Testing**: Bio-matter panel appears in the gap between MISSION.CTL and SYS.INTG. Shows "AWAITING UPLOAD" in idle state.

---

### CHUNK C4: Bio-Matter Row Spawning on Collection

**What**: Hook into the biomatter collection code to spawn upload rows when biomatter is collected.

**Dependencies**: C2, A1

**Where**: Find where `bioMatter` is incremented. Search for `bioMatter +=` or `bioMatter++`.

**Changes**:

FIND all places where bioMatter increases. For each, after the increment, add:

```js
// Spawn upload row
bioUploadRows.push({
    spawnTime: Date.now() + bioUploadRows.filter(r => r.phase === 'uploading').length * 50,
    progress: 0,
    phase: 'uploading',
    flashStartTime: 0
});
SFX.bioUploadBlip();
```

Also add cleanup in the update loop. FIND `updateBioUploadState` or the function that updates `bioUploadState.streamOffset`. Add cleanup logic:

```js
// Prune completed upload rows
bioUploadRows = bioUploadRows.filter(r => r.phase !== 'done');
if (bioUploadRows.length > 20) {
    bioUploadRows = bioUploadRows.slice(-20);
}
```

**ARCHITECT'S NOTE**: The exact location of bioMatter increments needs searching. Common locations: abduction complete callbacks, biomatter pickup handlers. Search for `bioMatter +=` and `bioMatter++` to find all increment sites.

**Testing**: Collect biomatter via abduction. Upload rows appear in the bio-matter panel, progress to 100%, flash, and collapse.

---

## PHASE D: QUANTUM OS LOGO ENHANCEMENT (F3)

### CHUNK D1: Logo Size and Visual Enhancements

**What**: Increase the logo title from 24px to 32px, add double-shadow glow technique, hue shift animation, enhanced hex grid with radiating pulse, 5-dot dual orbit rings, and a scanning line.

**Dependencies**: None

**Where**: `renderHUDBootGlobalEffects()` at line 16225, specifically the logo display section starting at line 16254.

**Changes**:

REPLACE the logo display block (lines 16255-16309, the `if (pb.phase === 'logo' || ...` block contents after the black fill):

```js
    // Logo display
    if (pb.phase === 'logo' || (pb.phase === 'dissolve' && pb.logoAlpha > 0)) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.globalAlpha = pb.logoAlpha;

        const now = Date.now();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Enhanced hex grid with radiating pulse (280x180)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        const pulseRadius = ((now % 1200) / 1200) * 160;
        for (let gx = centerX - 140; gx < centerX + 140; gx += 28) {
            for (let gy = centerY - 90; gy < centerY + 90; gy += 24) {
                const offsetX = (Math.floor((gy - centerY + 90) / 24) % 2) * 14;
                const hx = gx + offsetX;
                const hy = gy;
                const dist = Math.sqrt((hx - centerX) ** 2 + (hy - centerY) ** 2);
                let alpha = 0.03;
                if (Math.abs(dist - pulseRadius) < 15) {
                    alpha = 0.08 * (1 - Math.abs(dist - pulseRadius) / 15);
                }
                ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                renderHexagon(hx, hy, 12);
                ctx.stroke();
            }
        }

        // Scanning line
        const areaY = centerY - 130;
        const scanY = areaY + ((now / 1000 * 40) % 260);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.shadowColor = 'rgba(0, 255, 255, 0.3)';
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 220, scanY);
        ctx.lineTo(centerX + 220, scanY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Title: "ALIEN QUANTUM OS" - 32px with double glow
        const hueShift = Math.sin(now / 3000) * 15;
        const h = 180 + hueShift;
        const titleColor = `hsl(${h}, 100%, 50%)`;

        ctx.textAlign = 'center';
        // Wide soft glow pass
        ctx.fillStyle = titleColor;
        ctx.font = 'bold 32px monospace';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 16;
        ctx.globalAlpha = pb.logoAlpha * 0.4;
        ctx.fillText('ALIEN QUANTUM OS', centerX, centerY - 20);
        // Tight bright glow pass
        ctx.globalAlpha = pb.logoAlpha;
        ctx.shadowBlur = 6;
        ctx.fillText('ALIEN QUANTUM OS', centerX, centerY - 20);
        ctx.shadowBlur = 0;

        // Version text
        ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.font = '10px monospace';
        const vBlink = Math.floor(now / 1200) % 2 === 0;
        const vPrefix = vBlink ? 'v7.3.1' : '      ';
        ctx.fillText(vPrefix + ' // QUANTUM ENTANGLEMENT CORE', centerX, centerY + 16);

        // Loading bar (sweeping pulse)
        const barY = centerY + 38;
        const barW = 200;
        const barX = centerX - barW / 2;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.08)';
        ctx.fillRect(barX, barY, barW, 4);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(barX, barY, barW, 4);
        // Sweep pulse
        const sweepPos = ((now % 800) / 800) * (barW + 40) - 20;
        const grad = ctx.createLinearGradient(barX + sweepPos - 20, 0, barX + sweepPos + 20, 0);
        grad.addColorStop(0, 'rgba(0, 255, 255, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
        grad.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, barW, 4);

        // Loading label typewriter
        const loadText = 'QUANTUM CORE INITIALIZING';
        const charsPer = Math.floor(now / 20) % (loadText.length + 25);
        const visibleChars = Math.min(loadText.length, charsPer);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
        ctx.font = '7px monospace';
        ctx.fillText(loadText.substring(0, visibleChars), centerX, barY + 14);

        // Initializing text (cycling dots)
        const dots = '.'.repeat(1 + Math.floor(now / 200) % 3);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.font = '9px monospace';
        ctx.fillText('[ INITIALIZING' + dots + ' ]', centerX, centerY + 62);

        // Inner orbit ring: 3 dots, clockwise
        const orbitT = now / 3000 * Math.PI * 2;
        for (let i = 0; i < 3; i++) {
            const angle = orbitT + i * (Math.PI * 2 / 3);
            const dx = Math.cos(angle) * 80;
            const dy = Math.sin(angle) * 45;
            // Trail
            for (let tr = 1; tr <= 3; tr++) {
                const trAngle = angle - tr * 0.1;
                const trx = Math.cos(trAngle) * 80;
                const trY = Math.sin(trAngle) * 45;
                ctx.fillStyle = `rgba(0, 255, 255, ${0.4 / tr})`;
                ctx.beginPath();
                ctx.arc(centerX + trx, centerY + trY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            // Main dot
            ctx.fillStyle = '#0ff';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(centerX + dx, centerY + dy, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Outer orbit ring: 2 dots, counter-clockwise
        const outerT = -(now / 5000 * Math.PI * 2);
        for (let i = 0; i < 2; i++) {
            const angle = outerT + i * Math.PI;
            const dx = Math.cos(angle) * 140;
            const dy = Math.sin(angle) * 70;
            for (let tr = 1; tr <= 3; tr++) {
                const trAngle = angle + tr * 0.08;
                const trx = Math.cos(trAngle) * 140;
                const trY = Math.sin(trAngle) * 70;
                ctx.fillStyle = `rgba(0, 255, 255, ${0.3 / tr})`;
                ctx.beginPath();
                ctx.arc(centerX + trx, centerY + trY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(centerX + dx, centerY + dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Corner data readouts
        const corners = [
            { tx: centerX - 200, ty: centerY - 115, text: 'SYS.BOOT//INIT', rate: 1700 },
            { tx: centerX + 200, ty: centerY - 115, text: 'MEM.CHK OK', rate: 2100 },
            { tx: centerX - 200, ty: centerY + 120, text: 'CORE.FREQ 4.7THz', rate: 1900 },
            { tx: centerX + 200, ty: centerY + 120, text: 'UPLINK.STATUS: PENDING', rate: 2300 }
        ];
        ctx.font = '6px monospace';
        for (const c of corners) {
            const cBlink = Math.floor(now / c.rate) % 2 === 0;
            if (cBlink) {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                ctx.textAlign = c.tx < centerX ? 'left' : 'right';
                ctx.fillText(c.text, c.tx, c.ty);
            }
        }

        ctx.restore();
    }
```

**Testing**: During HUD boot, logo appears larger (32px), with radiating hex grid pulse, dual orbit rings with trails, loading bar sweep, scanning line, and corner readouts.

---

## PHASE E: PRE-BOOT BIOS SEQUENCE (F4/F5)

### CHUNK E1: initBiosBootSequence() Function

**What**: Create the initialization function that sets up the BIOS boot state with game-state-dependent text content.

**Dependencies**: A1, A2, A3

**Where**: INSERT BEFORE `renderWaveTransition()` at line 20373.

**Changes**:

INSERT BEFORE line 20373:

```js
function initBiosBootSequence() {
    const info = biosBootState.waveInfo;
    // Snapshot game state
    info.wave = wave;
    const tankCount = Math.floor(CONFIG.TANKS_BASE + (wave - 1) * CONFIG.TANKS_INCREMENT);
    let heavyCount = wave >= 5 ? (wave === 5 ? 1 : 2) : 0;
    if (wave > 15) heavyCount += Math.floor((wave - 15) / 3);
    info.tankCount = tankCount;
    info.heavyTankCount = heavyCount;
    info.hasBombs = playerInventory.maxBombs > 0;
    info.hasMissiles = missileUnlocked;
    info.hasDrones = harvesterUnlocked || battleDroneUnlocked;
    info.hasCoordinators = activeCoordinators.length > 0;
    info.health = ufo ? ufo.health : CONFIG.UFO_START_HEALTH;
    info.maxHealth = CONFIG.UFO_START_HEALTH;
    info.techCount = techTree.researched.size;
    info.bioMatter = bioMatter;
    info.droneCount = activeDrones.length;
    info.missileGroupCount = missileGroupCount;

    // Threat level
    if (wave >= 10) info.threatLevel = 'CRITICAL';
    else if (wave >= 7) info.threatLevel = 'HIGH';
    else if (wave >= 4) info.threatLevel = 'ELEVATED';
    else info.threatLevel = 'MODERATE';

    // Generate BIOS text lines
    const lines = [];
    const addLine = (text, color, bold, pane, time) => {
        lines.push({ text, color: color || '#aaa', bold: bold || false, pane: pane || 'top', time });
    };

    // Phase 1: POST (0.0-0.6s)
    let t = 0;
    addLine('XENOTECH SYSTEMS BIOS v4.2.0', '#fff', true, 'top', t); t += 0.04;
    addLine('Copyright (C) 2847 Xenotech Galactic Industries', '#888', false, 'top', t); t += 0.04;
    addLine('', '#aaa', false, 'top', t); t += 0.04;
    addLine('QUANTUM PROCESSOR: ZX-9000 @ 4.7 THz ..... DETECTED', '#aaa', false, 'top', t); t += 0.025;
    addLine('NEURAL CORE:      NC-MK7 x16 PARALLEL ... ONLINE', '#aaa', false, 'top', t); t += 0.025;
    addLine('ANTIMATTER CACHE:  ' + (2048 + info.techCount * 256) + ' PB ............... OK', '#aaa', false, 'top', t); t += 0.025;
    addLine('QUANTUM RAM TEST:  ' + (16384 + info.bioMatter * 16) + ' QB .............. PASS', '#aaa', false, 'top', t); t += 0.025;
    addLine('', '#aaa', false, 'top', t); t += 0.025;
    addLine('SCANNING DEVICES:', '#fff', true, 'top', t); t += 0.025;
    addLine('  /dev/beam0     TRACTOR BEAM ARRAY ..... READY', '#aaa', false, 'top', t); t += 0.025;
    addLine('  /dev/shield0   DEFLECTOR GRID ......... READY', '#aaa', false, 'top', t); t += 0.025;
    addLine('  /dev/nav0      NAVIGATION MATRIX ...... READY', '#aaa', false, 'top', t); t += 0.025;
    addLine('  /dev/warp0     SUBSPACE DRIVE ......... STANDBY', '#ff0', false, 'top', t); t += 0.025;
    addLine('  /dev/ord0      ORDNANCE SUBSYSTEM ..... ' + (info.hasBombs ? 'READY' : 'NOT FOUND'), info.hasBombs ? '#0f0' : '#fa0', false, 'top', t); t += 0.025;
    addLine('  /dev/fleet0    FLEET CONTROL BUS ...... ' + (info.hasDrones ? 'READY' : 'NOT FOUND'), info.hasDrones ? '#0f0' : '#fa0', false, 'top', t); t += 0.025;
    addLine('  /dev/bio0      BIOMATTER CONDUIT ...... READY', '#0f0', false, 'top', t); t += 0.015;
    addLine('', '#aaa', false, 'top', t); t += 0.015;
    addLine('BIOS POST COMPLETE - ALL DEVICES NOMINAL', '#0f0', true, 'top', t); t += 0.015;
    addLine('', '#aaa', false, 'top', t); t += 0.015;
    addLine('Searching for system root...', '#aaa', false, 'top', t); t += 0.015;
    addLine('FOUND: SYSTEM ROOT AI v4.2.0 at /sys/root', '#fff', false, 'top', t); t += 0.015;
    addLine('Loading SYSTEM ROOT AI...', '#aaa', false, 'top', t); t += 0.015;
    addLine('ROOT AI LOADED [################] 100%', '#0f0', false, 'top', t); t += 0.015;

    // Phase 2: Orchestrator (0.6-1.0s)
    t = 0.62;
    addLine('---------------------------------------------', '#444', false, 'top', t); t += 0.025;
    addLine('ORCHESTRATOR v2.1 ONLINE', '#0ff', true, 'top', t); t += 0.025;
    addLine('  Session: 0x4A7F2B // Wave ' + info.wave, '#888', false, 'top', t); t += 0.025;
    addLine('  Priority: HARVEST + DEFENSE', '#aaa', false, 'top', t); t += 0.025;
    addLine('  Fleet status: ' + info.droneCount + ' UNITS REGISTERED', '#0f0', false, 'top', t); t += 0.025;
    addLine('', '#aaa', false, 'top', t); t += 0.025;
    addLine('ORCHESTRATOR: Spawning agent swarms...', '#0ff', false, 'top', t);

    // Phase 3: Swarm spawn (1.0-1.6s) - rows in bottom pane
    biosBootState.swarmRows = [
        { name: 'SWARM.TACTICAL', fillProgress: 0, online: false, startTime: 1.10, color: '#0f0' },
        { name: 'SWARM.HARVEST', fillProgress: 0, online: false, startTime: 1.18, color: '#0f0' },
        { name: 'SWARM.DEFENSE', fillProgress: 0, online: false, startTime: 1.26, color: '#0f0' },
        { name: 'SWARM.RECON', fillProgress: 0, online: false, startTime: 1.34, color: '#0f0' },
        { name: 'SWARM.LOGISTICS', fillProgress: 0, online: false, startTime: 1.42, color: '#0f0' },
    ];
    if (info.hasCoordinators) {
        biosBootState.swarmRows.push({ name: 'SWARM.COORD', fillProgress: 0, online: false, startTime: 1.50, color: '#0ff' });
    }
    if (info.hasMissiles) {
        biosBootState.swarmRows.push({ name: 'SWARM.ORDNANCE', fillProgress: 0, online: false, startTime: 1.50, color: '#f80' });
    }

    // Phase 4-5 orchestrator lines
    t = 1.62;
    addLine('', '#aaa', false, 'top', t); t += 0.025;
    addLine('ORCHESTRATOR: Initiating mothership uplink...', '#0ff', false, 'top', t); t += 0.025;
    addLine('$ uplink --sync --priority=CRITICAL', '#fff', true, 'top', t); t += 0.025;

    t = 1.86;
    addLine('UPLINK ESTABLISHED // LATENCY: 0.3ns', '#0f0', false, 'top', t); t += 0.025;
    addLine('DOWNLOADING WAVE ' + info.wave + ' TACTICAL DATA...', '#aaa', false, 'top', t);

    t = 2.02;
    addLine('UPLINK COMPLETE - 47.3 TB SYNCED', '#0f0', true, 'top', t); t += 0.025;
    addLine('INTEL: ' + info.tankCount + ' HOSTILES INBOUND', '#f44', false, 'top', t); t += 0.025;
    if (info.heavyTankCount > 0) {
        addLine('WARNING: ' + info.heavyTankCount + ' HEAVY ARMOR UNITS DETECTED', '#f44', true, 'top', t); t += 0.025;
    }
    addLine('THREAT LEVEL: ' + info.threatLevel, info.threatLevel === 'CRITICAL' ? '#f44' : info.threatLevel === 'HIGH' ? '#f80' : '#ff0', true, 'top', t); t += 0.025;
    addLine('ORCHESTRATOR: Data integrated. Running checks...', '#0ff', false, 'top', t);

    // Phase 5: System check lines
    biosBootState.checkLines = [
        { name: 'ORD.SYS', status: info.hasBombs || info.hasMissiles ? 'OK' : 'PARTIAL', statusColor: info.hasBombs || info.hasMissiles ? '#0f0' : '#ff0', startTime: 2.05 },
        { name: 'NRG.FLOW', status: 'OK', statusColor: '#0f0', startTime: 2.10 },
        { name: 'FLEET.CMD', status: info.hasDrones ? 'OK' : 'SKIP', statusColor: info.hasDrones ? '#0f0' : '#ff0', startTime: 2.15 },
        { name: 'SHLD.INTG', status: info.health < info.maxHealth * 0.25 ? 'CRIT' : info.health < info.maxHealth * 0.5 ? 'WARN' : 'OK', statusColor: info.health < info.maxHealth * 0.25 ? '#f44' : info.health < info.maxHealth * 0.5 ? '#ff0' : '#0f0', startTime: 2.20 },
        { name: 'DIAG.SYS', status: 'OK', statusColor: '#0f0', startTime: 2.25 },
        { name: 'BEAM.ARRAY', status: 'OK', statusColor: '#0f0', startTime: 2.30 },
        { name: 'COMMS.SYS', status: 'OK', statusColor: '#0f0', startTime: 2.35 },
        { name: 'OPS.LOG', status: 'OK', statusColor: '#0f0', startTime: 2.40 },
        { name: 'TECH.TREE', status: info.techCount > 0 ? 'OK' : 'SKIP', statusColor: info.techCount > 0 ? '#0f0' : '#ff0', startTime: 2.45 },
        { name: 'BIO.CONDUIT', status: 'OK', statusColor: '#0f0', startTime: 2.50 },
    ];
    biosBootState.checkIndex = 0;

    biosBootState.lines = lines;
    biosBootState.lineIndex = 0;
    biosBootState.active = true;
    biosBootState.startTime = Date.now();
    biosBootState.elapsed = 0;
    biosBootState.phase = 'post';
    biosBootState.horizontalSplit = false;
    biosBootState.verticalSplit = false;
    biosBootState.splitHProgress = 0;
    biosBootState.splitVProgress = 0;
    biosBootState.downloadProgress = 0;
    biosBootState.downloadSpeed = 0;
    biosBootState.downloadReceived = 0;
    biosBootState.countdownValue = 3;
    biosBootState.flashPhase = 0;
    biosBootState.flashActive = false;
    biosBootState.centerPanelAlpha = 0;
    biosBootState.soundFlags = {};
}
```

**Testing**: Function exists. Not yet called.

---

### CHUNK E2: updateBiosBootSequence() Function

**What**: Create the update function that advances the BIOS state machine each frame.

**Dependencies**: E1

**Where**: INSERT AFTER `initBiosBootSequence()`.

**Changes**:

```js
function updateBiosBootSequence(dt) {
    if (!biosBootState.active) return;
    biosBootState.elapsed += dt;
    const e = biosBootState.elapsed;

    // Phase transitions
    if (e < 0.6) biosBootState.phase = 'post';
    else if (e < 1.0) biosBootState.phase = 'orchestrator';
    else if (e < 1.6) {
        biosBootState.phase = 'swarm';
        if (!biosBootState.horizontalSplit) {
            biosBootState.horizontalSplit = true;
            SFX.biosTmuxCrack();
        }
    } else if (e < 2.0) biosBootState.phase = 'uplink';
    else if (e < 2.6) {
        biosBootState.phase = 'check';
        if (!biosBootState.verticalSplit) {
            biosBootState.verticalSplit = true;
            SFX.biosTmuxCrack();
        }
    } else {
        biosBootState.phase = 'countdown';
    }

    // Advance line index based on elapsed time
    while (biosBootState.lineIndex < biosBootState.lines.length &&
           biosBootState.lines[biosBootState.lineIndex].time <= e) {
        const line = biosBootState.lines[biosBootState.lineIndex];
        // Trigger HDD click for POST lines
        if (e < 0.6 && biosBootState.lineIndex % 2 === 0) SFX.biosHDDClick();
        // Trigger detection chirps for device lines
        if (line.text.includes('READY') || line.text.includes('ONLINE') || line.text.includes('DETECTED')) {
            SFX.biosDetectionChirp();
        }
        biosBootState.lineIndex++;
    }

    // Sound triggers (one-shot per phase)
    if (e >= 0.0 && !biosBootState.soundFlags.postBeep) {
        biosBootState.soundFlags.postBeep = true;
        SFX.biosPostBeep();
    }
    if (e >= 0.6 && !biosBootState.soundFlags.systemHum) {
        biosBootState.soundFlags.systemHum = true;
        SFX.biosSystemHum();
    }
    if (e >= 0.95 && !biosBootState.soundFlags.orchConfirm) {
        biosBootState.soundFlags.orchConfirm = true;
        SFX.biosOrchestratorConfirm();
    }
    if (e >= 1.6 && !biosBootState.soundFlags.modem) {
        biosBootState.soundFlags.modem = true;
        SFX.biosModemHandshake();
    }
    if (e >= 1.9 && !biosBootState.soundFlags.downloadDone) {
        biosBootState.soundFlags.downloadDone = true;
        SFX.biosDownloadComplete();
    }
    if (e >= 2.55 && !biosBootState.soundFlags.passChord) {
        biosBootState.soundFlags.passChord = true;
        SFX.biosPassChord();
    }

    // Update swarm rows
    for (const row of biosBootState.swarmRows) {
        if (e >= row.startTime) {
            const rowAge = e - row.startTime;
            row.fillProgress = Math.min(1, rowAge / 0.06);
            if (row.fillProgress >= 1 && !row.online) {
                row.online = true;
                SFX.biosSwarmBlip(biosBootState.swarmRows.indexOf(row));
            }
        }
    }

    // Download progress (1.65-2.0s)
    if (e >= 1.65 && e < 2.0) {
        biosBootState.downloadProgress = Math.min(1, (e - 1.65) / 0.35);
        biosBootState.downloadSpeed = 18 + Math.random() * 10;
        biosBootState.downloadReceived = biosBootState.downloadProgress * 47.3;
        // Data click sounds
        if (Math.random() < 0.3) SFX.biosDataClick();
    } else if (e >= 2.0) {
        biosBootState.downloadProgress = 1;
    }

    // System check progress
    for (let i = 0; i < biosBootState.checkLines.length; i++) {
        const cl = biosBootState.checkLines[i];
        if (e >= cl.startTime && !cl.completed) {
            cl.dotsProgress = Math.min(1, (e - cl.startTime) / 0.035);
            if (cl.dotsProgress >= 1 && !cl.completed) {
                cl.completed = true;
                if (cl.status === 'OK') {
                    SFX.biosCheckBeep(i);
                } else {
                    SFX.biosCheckSkip();
                }
            }
        }
    }

    // Countdown (2.6-3.0s)
    if (e >= 2.65 && e < 2.77) {
        biosBootState.countdownValue = 3;
        biosBootState.centerPanelAlpha = Math.min(1, (e - 2.65) / 0.05);
        if (!biosBootState.soundFlags.count3) {
            biosBootState.soundFlags.count3 = true;
            SFX.biosCountdownThrob(3);
        }
    } else if (e >= 2.77 && e < 2.88) {
        biosBootState.countdownValue = 2;
        if (!biosBootState.soundFlags.count2) {
            biosBootState.soundFlags.count2 = true;
            SFX.biosCountdownThrob(2);
        }
    } else if (e >= 2.88 && e < 2.92) {
        biosBootState.countdownValue = 1;
        if (!biosBootState.soundFlags.count1) {
            biosBootState.soundFlags.count1 = true;
            SFX.biosCountdownThrob(1);
        }
    } else if (e >= 2.92) {
        biosBootState.countdownValue = 0; // "LAUNCH"
        biosBootState.flashActive = true;
        biosBootState.flashPhase = Math.floor((e - 2.92) / 0.02) % 4;
        if (!biosBootState.soundFlags.launch) {
            biosBootState.soundFlags.launch = true;
            SFX.biosLaunchBurst();
        }
    }
}
```

**Testing**: Function exists. Not yet wired in.

---

### CHUNK E3: renderBiosBootSequence() Function

**What**: Create the main render function for the BIOS sequence. Renders all panes, text, download bars, system checks, countdown panel, and launch flash.

**Dependencies**: E1, E2

**Where**: INSERT AFTER `updateBiosBootSequence()`.

**Changes**:

```js
function renderBiosBootSequence() {
    if (!biosBootState.active) return;
    const e = biosBootState.elapsed;

    // Full black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CRT phosphor tint
    ctx.fillStyle = 'rgba(0, 40, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const splitY = Math.floor(canvas.height * 0.55);
    const splitX = Math.floor(canvas.width * 0.55);

    // PANE 1 (TOP): POST + Orchestrator text
    ctx.save();
    const topPaneH = biosBootState.horizontalSplit ? splitY - 2 : canvas.height;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, topPaneH);
    ctx.clip();

    // Render visible text lines (top pane)
    ctx.font = '9px monospace';
    const lineH = 12;
    let lineY = 16;
    for (let i = 0; i < biosBootState.lineIndex; i++) {
        const line = biosBootState.lines[i];
        if (line.pane !== 'top') continue;
        ctx.fillStyle = line.color;
        ctx.font = line.bold ? 'bold 9px monospace' : '9px monospace';
        ctx.textAlign = 'left';

        // Color-code status words
        let text = line.text;
        ctx.fillText(text, 12, lineY);

        // Highlight OK/READY in green
        if (text.includes('READY') || text.includes('ONLINE') || text.includes('OK') || text.includes('PASS') || text.includes('DETECTED')) {
            const words = ['READY', 'ONLINE', 'OK', 'PASS', 'DETECTED'];
            for (const w of words) {
                const idx = text.indexOf(w);
                if (idx >= 0) {
                    const beforeW = text.substring(0, idx);
                    const wWidth = ctx.measureText(beforeW).width;
                    ctx.fillStyle = '#0f0';
                    ctx.fillText(w, 12 + wWidth, lineY);
                }
            }
        }

        lineY += lineH;
        if (lineY > topPaneH - 4) break;
    }

    // Blinking cursor
    if (Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillStyle = '#0f0';
        ctx.font = '9px monospace';
        ctx.fillText('\u2588', 12 + (biosBootState.lineIndex > 0 ? ctx.measureText(biosBootState.lines[Math.min(biosBootState.lineIndex - 1, biosBootState.lines.length - 1)].text).width + 6 : 0), lineY);
    }
    ctx.restore();

    // Horizontal split divider
    if (biosBootState.horizontalSplit) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
        ctx.fillRect(0, splitY - 1, canvas.width, 2);

        if (biosBootState.verticalSplit) {
            // BOTTOM-LEFT: System check
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, splitY + 1, splitX - 2, canvas.height - splitY - 1);
            ctx.clip();
            renderBIOSSystemCheck(0, splitY + 1, splitX - 2, canvas.height - splitY - 1);
            ctx.restore();

            // Vertical divider
            ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
            ctx.fillRect(splitX - 1, splitY, 2, canvas.height - splitY);

            // BOTTOM-RIGHT: Data stream
            ctx.save();
            ctx.beginPath();
            ctx.rect(splitX + 1, splitY + 1, canvas.width - splitX - 1, canvas.height - splitY - 1);
            ctx.clip();
            renderBIOSDataStream(splitX + 1, splitY + 1, canvas.width - splitX - 1, canvas.height - splitY - 1);
            ctx.restore();
        } else {
            // BOTTOM: Swarm table OR download
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, splitY + 1, canvas.width, canvas.height - splitY - 1);
            ctx.clip();
            if (e < 1.6) {
                renderBIOSSwarmTable(0, splitY + 1, canvas.width, canvas.height - splitY - 1);
            } else {
                renderBIOSDownload(0, splitY + 1, canvas.width, canvas.height - splitY - 1);
            }
            ctx.restore();
        }
    }

    // Center countdown panel
    if (biosBootState.centerPanelAlpha > 0) {
        const panelW = 320;
        const panelH = 140;
        const px = (canvas.width - panelW) / 2;
        const py = (canvas.height - panelH) / 2;

        ctx.save();
        ctx.globalAlpha = biosBootState.centerPanelAlpha;

        // Panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(px, py, panelW, panelH);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 8;
        ctx.strokeRect(px, py, panelW, panelH);
        ctx.shadowBlur = 0;

        // WAVE N
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WAVE ' + biosBootState.waveInfo.wave, canvas.width / 2, py + 55);

        // Countdown number or LAUNCH
        if (biosBootState.countdownValue > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px monospace';
            ctx.fillText('>> ' + biosBootState.countdownValue + ' <<', canvas.width / 2, py + 105);
        } else {
            ctx.fillStyle = '#0ff';
            ctx.font = 'bold 48px monospace';
            ctx.fillText('LAUNCH', canvas.width / 2, py + 110);
        }

        ctx.restore();
    }

    // Launch flash (final 80ms strobe)
    if (biosBootState.flashActive) {
        const colors = ['rgba(255, 255, 0, 0.25)', 'rgba(0, 255, 255, 0.30)', 'rgba(255, 0, 255, 0.20)', 'rgba(255, 255, 255, 0.40)'];
        ctx.fillStyle = colors[biosBootState.flashPhase];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // CRT scanlines over everything
    for (let sy = 0; sy < canvas.height; sy += 3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, sy, canvas.width, 1);
    }

    // Countdown screen edge flash
    if (biosBootState.centerPanelAlpha > 0 && biosBootState.countdownValue > 0) {
        const flashAlpha = 0.05 + (3 - biosBootState.countdownValue) * 0.03;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, 2);
        ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
        ctx.fillRect(0, 0, 2, canvas.height);
        ctx.fillRect(canvas.width - 2, 0, 2, canvas.height);
    }
}

function renderBIOSSwarmTable(px, py, pw, ph) {
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('AGENT SWARM STATUS', px + 12, py + 14);
    ctx.fillStyle = '#444';
    ctx.font = '9px monospace';
    ctx.fillText('----------------------------------------', px + 12, py + 26);

    for (let i = 0; i < biosBootState.swarmRows.length; i++) {
        const row = biosBootState.swarmRows[i];
        const rowY = py + 38 + i * 14;
        if (biosBootState.elapsed < row.startTime) continue;

        // Name
        ctx.fillStyle = '#aaa';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('  ' + row.name, px + 12, rowY);

        // Loading bar
        const barWidth = 12;
        const filled = Math.floor(row.fillProgress * barWidth);
        const empty = barWidth - filled;
        const barText = '[' + '='.repeat(filled) + ' '.repeat(empty) + ']';
        ctx.fillStyle = row.online ? '#0f0' : '#ff0';
        const nameW = ctx.measureText('  ' + row.name + '  ').width;
        ctx.fillText(barText, px + 12 + nameW, rowY);

        // Status
        const statusText = row.online ? 'ONLINE' : 'LOADING';
        ctx.fillStyle = row.online ? row.color : '#ff0';
        ctx.font = row.online ? 'bold 9px monospace' : '9px monospace';
        ctx.fillText(statusText, px + 12 + nameW + barWidth * 6 + 30, rowY);
    }

    // All swarms online
    const allOnline = biosBootState.swarmRows.every(r => r.online);
    if (allOnline) {
        const totalY = py + 38 + biosBootState.swarmRows.length * 14 + 14;
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('  ALL SWARMS: ONLINE (' + biosBootState.swarmRows.length + ' ACTIVE)', px + 12, totalY);
    }
}

function renderBIOSDownload(px, py, pw, ph) {
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('UPLINK DATA TRANSFER', px + 12, py + 14);
    ctx.fillStyle = '#444';
    ctx.font = '9px monospace';
    ctx.fillText('============================================', px + 12, py + 26);

    // Progress bar
    const barX = px + 20;
    const barY = py + 36;
    const barW = pw - 80;
    const barH = 12;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Segmented fill
    const segs = 30;
    const segW = (barW - (segs - 1) * 2) / segs;
    const filledSegs = Math.floor(biosBootState.downloadProgress * segs);
    for (let s = 0; s < filledSegs; s++) {
        const sx = barX + s * (segW + 2);
        ctx.fillStyle = '#0f0';
        if (s === filledSegs - 1) {
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 3;
        }
        ctx.fillRect(sx, barY + 1, segW, barH - 2);
        ctx.shadowBlur = 0;
    }

    // Percentage
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(Math.floor(biosBootState.downloadProgress * 100) + '%', barX + barW + 8, barY + 10);

    // Speed and received
    ctx.font = '9px monospace';
    ctx.fillStyle = '#0ff';
    ctx.fillText('SPEED: ' + biosBootState.downloadSpeed.toFixed(1) + ' TB/s', barX, barY + 24);
    ctx.fillStyle = '#aaa';
    ctx.fillText('RECV: ' + biosBootState.downloadReceived.toFixed(1) + ' / 47.3 TB', barX + 180, barY + 24);

    // Hex data stream (decorative)
    ctx.font = '7px monospace';
    const now = Date.now();
    for (let row = 0; row < 6; row++) {
        const hy = barY + 38 + row * 11;
        if (hy > py + ph - 4) break;
        let hexStr = '';
        for (let h = 0; h < 16; h++) {
            hexStr += ((now * 7 + row * 31 + h * 13) % 256).toString(16).padStart(2, '0').toUpperCase() + ' ';
        }
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.fillText('0x' + (row * 16).toString(16).padStart(4, '0') + '  ' + hexStr, px + 12, hy);
    }
}

function renderBIOSSystemCheck(px, py, pw, ph) {
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SYSTEM CHECK', px + 12, py + 14);

    for (let i = 0; i < biosBootState.checkLines.length; i++) {
        const cl = biosBootState.checkLines[i];
        const ly = py + 28 + i * 14;
        if (ly > py + ph - 4) break;
        if (biosBootState.elapsed < cl.startTime) continue;

        // Name
        ctx.fillStyle = '#aaa';
        ctx.font = '9px monospace';
        const name = '  ' + cl.name + ' ';

        // Dots filling
        const maxDots = 20 - cl.name.length;
        const dotsProgress = cl.dotsProgress || 0;
        const visibleDots = Math.floor(dotsProgress * maxDots);
        const dots = '.'.repeat(visibleDots);
        ctx.fillText(name + dots, px + 12, ly);

        // Status
        if (cl.completed) {
            ctx.fillStyle = cl.statusColor;
            ctx.font = 'bold 9px monospace';
            ctx.fillText(' [' + cl.status + ']', px + 12 + ctx.measureText(name + '.'.repeat(maxDots)).width, ly);
        }
    }

    // ALL SYSTEMS NOMINAL
    const allDone = biosBootState.checkLines.every(c => c.completed);
    if (allDone) {
        const totalY = py + 28 + biosBootState.checkLines.length * 14 + 14;
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('  ALL SYSTEMS NOMINAL', px + 12, totalY);
    }
}

function renderBIOSDataStream(px, py, pw, ph) {
    // Rapid scrolling hex dump (decorative)
    ctx.font = '7px monospace';
    const now = Date.now();
    const scrollOffset = Math.floor(now / 30) * 11;
    const visibleLines = Math.floor(ph / 11);

    for (let row = 0; row < visibleLines; row++) {
        const hy = py + 4 + row * 11;
        const lineIdx = Math.floor(scrollOffset / 11) + row;
        // Address column
        ctx.fillStyle = 'rgba(0, 170, 68, 0.3)';
        const addr = '0x' + ((lineIdx * 16) & 0xFFFF).toString(16).padStart(4, '0');
        ctx.textAlign = 'left';
        ctx.fillText(addr, px + 4, hy);

        // Hex values
        let hexStr = '';
        for (let h = 0; h < 8; h++) {
            hexStr += ((now * 3 + lineIdx * 17 + h * 31 + row * 7) % 256).toString(16).padStart(2, '0').toUpperCase() + ' ';
        }
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.fillText(hexStr, px + 48, hy);

        // ASCII representation
        let ascii = '|';
        for (let a = 0; a < 8; a++) {
            const code = (now * 3 + lineIdx * 17 + a * 31 + row * 7) % 94 + 33;
            ascii += String.fromCharCode(code);
        }
        ascii += '|';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.08)';
        ctx.fillText(ascii, px + 48 + 8 * 18, hy);
    }
}
```

**Testing**: Functions exist. Not yet wired in.

---

### CHUNK E4: Wire BIOS into Wave Transition

**What**: Replace `renderWaveTransition()` content with BIOS sequence. Modify `updateWaveTransition()` to initialize and update the BIOS sequence. The BIOS replaces the "WAVE N / Starting in 3..." display.

**Dependencies**: E1, E2, E3

**Where**:
1. `updateWaveTransition()` at line 20339
2. `renderWaveTransition()` at line 20373

**Changes**:

REPLACE `updateWaveTransition()` (lines 20339-20371):

```js
function updateWaveTransition(dt) {
    waveTransitionTimer -= dt;

    // Continue updating particles for visual effect
    updateParticles(dt);
    updateFloatingTexts(dt);

    // Initialize BIOS sequence on first frame
    if (!biosBootState.active) {
        initBiosBootSequence();
    }

    // Update BIOS sequence
    updateBiosBootSequence(dt);

    if (waveTransitionTimer <= 0) {
        // End BIOS sequence
        biosBootState.active = false;
        biosBootState.phase = 'inactive';

        // Start the new wave
        animationPausedAt = null;
        resetWaveStats();
        waveTimer = CONFIG.WAVE_DURATION;
        lastTimerWarningSecond = -1;
        gameState = 'PLAYING';
        // Reset commander state
        missionCommanderState.visible = false;
        missionCommanderState.dialogue = '';
        missionCommanderState.typewriterIndex = 0;
        missionCommanderState.typewriterTimer = 0;
        missionCommanderState.displayTimer = 0;
        missionCommanderState.cooldownTimer = 15;
        initHUDBoot();

        // Reset auto-deploy cooldown
        autoDeployCooldown = 0;

        // Spawn tanks for new wave
        spawnTanks();

        // Clear projectiles
        projectiles = [];
    }
}
```

REPLACE `renderWaveTransition()` (lines 20373-20437):

```js
function renderWaveTransition() {
    // Render BIOS boot sequence instead of old wave transition
    if (biosBootState.active) {
        renderBiosBootSequence();
    } else {
        // Fallback: simple black screen during last frames
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
```

**Testing**: Start a game. Complete Wave 1 -> shop -> start wave transition. Instead of "WAVE 2 / Starting in 3...", the BIOS sequence plays. After 3 seconds, transitions to Quantum OS boot.

---

## PHASE F: INTEGRATION

### CHUNK F1: Update bioUploadState in Game Loop

**What**: Add update logic for `bioUploadState.streamOffset` and `bioUploadState.bitRate` into the existing HUD update function. Also prune completed upload rows.

**Dependencies**: C2, C4

**Where**: Search for `updateHUDAnimations` or the function that updates `bioUploadState.streamOffset`. If it already exists, modify it. If not, add it.

**Changes**:

FIND the function that updates `bioUploadState.streamOffset` (search for `streamOffset`). It should be in `updateHUDAnimations()`. Modify the streamOffset update:

```js
    // Bio upload state updates
    const hasActiveUploads = bioUploadRows.some(r => r.phase !== 'done');
    bioUploadState.streamOffset += dt * (hasActiveUploads ? 120 : 15);

    // Bit rate calculation
    const now = Date.now();
    bioUploadState.bitRateSamples = bioUploadState.bitRateSamples.filter(t => now - t < 3000);
    bioUploadState.bitRate = bioUploadState.bitRateSamples.length / 3;

    // Prune completed upload rows
    bioUploadRows = bioUploadRows.filter(r => r.phase !== 'done');
    if (bioUploadRows.length > 20) bioUploadRows = bioUploadRows.slice(-20);

    // Flash alpha decay
    if (bioUploadState.flashAlpha > 0) {
        bioUploadState.flashAlpha = Math.max(0, bioUploadState.flashAlpha - dt * 3);
    }
```

**Testing**: Bio-matter conduit scrolls. Upload rows progress and get cleaned up.

---

### CHUNK F2: Spawn Bio Upload Rows on Collection

**What**: Find where bioMatter is incremented and spawn upload rows there.

**Dependencies**: A1, C2

**Where**: Search for `bioMatter +=` in game.js.

**Changes**:

For each location where `bioMatter += N`:

INSERT AFTER the increment:

```js
    // Spawn upload rows for bio-matter panel
    for (let _br = 0; _br < N; _br++) {
        bioUploadRows.push({
            spawnTime: Date.now() + _br * 50,
            progress: 0,
            phase: 'uploading',
            flashStartTime: 0
        });
        bioUploadState.bitRateSamples.push(Date.now() + _br * 50);
    }
    bioUploadState.flashAlpha = 0.5;
    SFX.bioUploadBlip();
```

Where `N` is the amount of biomatter collected (replace with the actual variable). Common patterns: `bioMatter += amount`, `bioMatter += 1`, etc.

**ARCHITECT'S NOTE**: The developer must search for all `bioMatter +=` sites and adapt the spawn code. The `N` variable will differ per site. For `bioMatter += 1` sites, just spawn 1 row. For `bioMatter += amount`, use the amount.

**Testing**: Collect biomatter. Upload rows appear in the bio-matter panel.

---

### CHUNK F3: Tech Tree Visibility Reset on Wave Start

**What**: Ensure `techTreeAnimState.visible` is NOT reset between waves (it persists). Only reset on new game (handled in A2).

**Dependencies**: B1

**Where**: Verify that `initHUDBoot()` does NOT reset `techTreeAnimState.visible`. Currently it doesn't touch techTreeAnimState, so no changes needed.

**Testing**: Research PG1 in Wave 2. Tech tree visible. Start Wave 3 - tech tree still visible (doesn't re-animate unless it was hidden).

---

## IMPLEMENTATION ORDER SUMMARY

Apply chunks in this order:

1. **A1** - State variables (biosBootState, bioUploadRows, techTreeAnimState extensions)
2. **A2** - startGame() resets
3. **A3** - SFX functions (all BIOS sounds + bio upload sounds)
4. **A4** - getHUDLayout() bioMatterZone
5. **B1** - Tech tree conditional visibility
6. **B2** - TECH_CHIP_DEFS abbreviations
7. **B3** - Researched node indicator lights
8. **C1** - Remove B.MTR from renderMissionZone
9. **C2** - New renderBioMatterPanel() function
10. **C3** - Wire renderBioMatterPanel into renderHUDFrame
11. **C4** / **F2** - Bio upload row spawning
12. **F1** - Update loop for bio upload state
13. **D1** - Logo enhancements
14. **E1** - initBiosBootSequence()
15. **E2** - updateBiosBootSequence()
16. **E3** - renderBiosBootSequence() + helper functions
17. **E4** - Wire BIOS into wave transition
18. **F3** - Tech tree visibility verification

---

## CRITICAL NOTES

1. **Line numbers shift**: After A1 adds ~60 lines of state variables, all subsequent line numbers shift down by ~60. The developer should use function/variable NAMES to find insertion points, not raw line numbers.

2. **The BIOS sequence is 3.0 seconds**: It runs during `gameState === 'WAVE_TRANSITION'` using `waveTransitionTimer` counting from 3.0 to 0. The Quantum OS boot runs AFTER the transition, during `gameState === 'PLAYING'` with `hudBootState`.

3. **Bio-matter relocation is a 3-step process**: Remove from renderMissionZone (C1), create new function (C2), wire into renderHUDFrame (C3). All three must be done together to avoid the bio-matter display disappearing entirely.

4. **Tech tree visibility** uses a persistent flag. Once set to `true`, it stays true for the rest of the game. Only `startGame()` resets it to `false`.

5. **Sound budget**: 17 new BIOS sounds + 2 bio upload sounds = 19 new SFX methods. All follow the existing pattern (check `audioCtx`, create oscillators/buffers, schedule envelopes).

6. **Small screen fallback for bio-matter**: If `bioMatterZone.w < 120`, the bio-matter panel is hidden. The developer should keep the old B.MTR counter in statusZone as a fallback (or add one) for small screens. This is noted in C1 -- the removal should be conditional on screen width.

---

*End of HUD Design Pass 3 Implementation Architecture*
