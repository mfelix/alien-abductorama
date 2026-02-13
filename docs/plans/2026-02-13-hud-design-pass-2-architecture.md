# HUD Design Pass 2 - Implementation Architecture

**Date**: 2026-02-13
**Role**: Architect
**Target**: `/Users/mfelix/code/alien-abductorama/js/game.js` (~21,373 lines)
**Input Docs**: Visual Design Spec, Sound Design Spec, Code Map

---

## PRINCIPLES

1. **Sequential Execution**: All changes to the monolithic game.js must be applied in order. Line numbers shift after each chunk.
2. **No Overlap**: HUD components must never visually overlap. Every pixel is accounted for.
3. **Existing Patterns**: Follow `renderNGE*`, `hudAnimState`, `hudBootState`, `panelReady()` conventions.
4. **Render Order**: Commander remains the last rendered panel. New components inserted at correct positions.
5. **Small Screens**: All features degrade gracefully below 900px canvas width.

---

## PHASE A: INFRASTRUCTURE & QUICK FIXES

### CHUNK A1: NRG.Flow Padding Fix (Dynamic SYS.INTG Panel Height)

**What**: Make the SYS.INTG panel height dynamic based on content, so NRG.FLOW always sits 8px below actual content instead of below a fixed 88px panel with empty space.

**Dependencies**: None

**Where**:
- `renderSystemsZone()` at line 13500 (panel height calculation)
- `renderEnergyGraph()` at line 13605 (graphY calculation)
- `getHUDLayout()` at line 12858 (fleetY calculation)

**Changes**:

In `renderSystemsZone()` (line 13500), change the fixed 88px panel height to dynamic:

```js
// REPLACE the fixed panel render at the top of renderSystemsZone:
// OLD: renderNGEPanel(x, y, w, 88, { color: '#f80', cutCorners: ['tr'], label: 'SYS.INTG' });
// NEW: Compute panelH dynamically, render later

function renderSystemsZone(zone) {
    const { x, y, w } = zone;
    const pad = 6;

    // Dynamic panel height
    const cells = ufo ? Math.max(0, ufo.reviveCells || 0) : 0;
    let panelH = 48; // minimum: header (22) + shield bar (22) + padding (4)
    if (cells > 0) panelH = 70; // add revive cell row
    if (playerInventory.speedBonus > 0) panelH += 16;
    if (playerInventory.maxEnergyBonus > 0) panelH += 14;
    panelH = Math.max(panelH, 52); // minimum aesthetic height

    renderNGEPanel(x, y, w, panelH, { color: '#f80', cutCorners: ['tr'], label: 'SYS.INTG' });
    // ... rest of zone rendering unchanged ...

    // IMPORTANT: return panelH so renderEnergyGraph and getHUDLayout can use it
    return panelH;
}
```

In `renderHUDFrame()` at line 12987-12992, capture the returned panelH:

```js
// Systems zone
let systemsPanelH = 88; // default
if (panelReady('systems')) {
    systemsPanelH = renderSystemsZone(layout.systemsZone) || 88;
}
```

In `renderEnergyGraph()` at line 13605, use the actual panelH. The simplest approach: recompute the same dynamic height inside renderEnergyGraph:

```js
function renderEnergyGraph(systemsZone) {
    if (!techFlags.beamConduit) return;
    const { x, y, w } = systemsZone;

    // Recompute dynamic panel height (same logic as renderSystemsZone)
    const cells = ufo ? Math.max(0, ufo.reviveCells || 0) : 0;
    let sysPanelH = 48;
    if (cells > 0) sysPanelH = 70;
    if (playerInventory.speedBonus > 0) sysPanelH += 16;
    if (playerInventory.maxEnergyBonus > 0) sysPanelH += 14;
    sysPanelH = Math.max(sysPanelH, 52);

    let graphY = y + sysPanelH + 8; // 8px gap below dynamic panel
    // ... rest unchanged ...
}
```

In `getHUDLayout()` at line 12866-12872, apply the same logic for fleetY:

```js
let fleetY = 108;
if (techFlags.beamConduit) {
    const cells_layout = 0; // conservative: use minimum since we don't have ufo ref here
    let sysPanelH_layout = 52; // minimum
    // Note: getHUDLayout may not have access to ufo. Use max possible height for safety.
    sysPanelH_layout = 88; // Use max to prevent fleet overlap
    let graphY = margin + sysPanelH_layout + 8;
    fleetY = graphY + 72 + 10;
}
```

**ARCHITECT'S NOTE**: The simplest safe approach is to keep `getHUDLayout()` using the maximum panel height (88px) for fleet positioning, while the visual rendering uses dynamic height. This prevents fleet overlap under any condition. The alternative is passing game state into getHUDLayout, which increases complexity.

**REVISED SIMPLER APPROACH**: Keep the 88px panel in `getHUDLayout()` for all calculations. Only change the visual `renderNGEPanel` call in `renderSystemsZone` to use dynamic height. The graph Y computation in `renderEnergyGraph` also uses dynamic height for visual placement. This way layout calculations remain stable while the visual appearance tightens up.

**Testing**:
- Start game with no powerups: SYS.INTG panel is ~52px, NRG.FLOW starts at y+60 (after pg1 research)
- Buy speed powerup: panel grows to 68px, NRG.FLOW moves down
- Buy energy bonus: panel grows to 82px
- Fleet zone never overlaps NRG.FLOW

---

### CHUNK A2: New State Variables

**What**: Declare all new state variables needed by subsequent chunks. Adding them upfront prevents "variable not defined" crashes if chunks are applied incrementally.

**Dependencies**: None

**Where**: After `energyTimeSeries` reset in `startGame()` (line 12034), and after `hudAnimState` declaration (line 12643).

**Changes**:

After `hudAnimState` declaration (line 12658), add:

```js
// Health freakout effects
let healthFreakoutState = {
    sparks: [],          // [{x, y, vx, vy, life, maxLife, color}]
    smokePuffs: [],      // [{x, y, vx, vy, life, maxLife, radius}]
    flickerTimers: {},   // {panelKey: nextFlickerTime}
    lastJoltTime: 0,
    distortionBands: [], // [{y, height, shiftX, life}]
    warningToneTimer: 0,
    warningToneInterval: 2.0,
};

// Bio-matter upload conduit
let bioUploadState = {
    streamOffset: 0,         // Horizontal offset for scrolling binary stream
    bitRate: 0,              // Smoothed collection rate
    bitRateSamples: [],      // Last 3s of collection timestamps
    flashAlpha: 0,           // Collection flash brightness
    uploadPhase: 'idle',     // 'idle'|'uploading'|'complete'
    uploadCounter: 0,        // Countdown during end-of-wave upload
    uploadTicks: 0,
};

// Tech tree horizontal visualization
let techTreeAnimState = {
    dashOffset: 0,           // Animated dash offset for connections
    researchGlowPhase: 0,   // Sine phase for researching node glow
    nodeAppearAnims: {},     // {nodeId: {startTime, progress}}
};

// Enhanced boot sequence
let preBootState = {
    phase: 'inactive',       // 'inactive'|'crt'|'logo'|'dissolve'|'trace'|'panel_boot'|'post'
    timer: 0,
    crtProgress: 0,
    logoAlpha: 0,
    traceProgress: 0,
    postTextIndex: 0,
    postTextAlpha: 1.0,
    borderPersist: 0,        // 0-1, how much of border is lit
};

// Enhanced DIAG.SYS sparkline data
let diagEnhancedState = {
    energyRateBuffer: new Float32Array(20),
    energyRateWriteIdx: 0,
    energyRateSampleTimer: 0,
};
```

Extend `hudAnimState` with scan line enhancement fields (add to existing declaration at line 12643):

```js
// Add these properties to hudAnimState:
    lastAmbientGlitch: 0,
    nextAmbientGlitch: 0,
    chromaticTimer: 0,
    staticBlocks: [],
    scanlineSpeedMod: 1.0,
```

Add resets in `startGame()` after the `energyTimeSeries` reset (after line 12034):

```js
healthFreakoutState = {
    sparks: [], smokePuffs: [], flickerTimers: {},
    lastJoltTime: 0, distortionBands: [],
    warningToneTimer: 0, warningToneInterval: 2.0,
};
bioUploadState = {
    streamOffset: 0, bitRate: 0, bitRateSamples: [],
    flashAlpha: 0, uploadPhase: 'idle', uploadCounter: 0, uploadTicks: 0,
};
techTreeAnimState = {
    dashOffset: 0, researchGlowPhase: 0, nodeAppearAnims: {},
};
preBootState = {
    phase: 'inactive', timer: 0, crtProgress: 0,
    logoAlpha: 0, traceProgress: 0,
    postTextIndex: 0, postTextAlpha: 1.0, borderPersist: 0,
};
diagEnhancedState = {
    energyRateBuffer: new Float32Array(20),
    energyRateWriteIdx: 0, energyRateSampleTimer: 0,
};
```

**Testing**: Game starts without errors. No visual changes yet.

---

### CHUNK A3: New Sound Effects

**What**: Add all new SFX functions to the SFX object.

**Dependencies**: None

**Where**: Inside `const SFX = { ... }` object (starts at line 622). Add new methods at the end of the object, before the closing `};`.

**Sound spec reference**: Sound Design Spec Parts 3A-3E.

**Changes**: Add these methods to the SFX object:

```js
// Boot: CRT power-on thunk + rising hum
crtTurnOn: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    // Thunk: noise burst bandpass 60-200Hz
    const bufLen = audioCtx.sampleRate * 0.03;
    const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/bufLen);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 130; bp.Q.value = 1.5;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
    src.start(t); src.stop(t + 0.03);
    // Hum: sine 60->180Hz
    const hum = audioCtx.createOscillator();
    const humG = audioCtx.createGain();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(60, t);
    hum.frequency.exponentialRampToValueAtTime(180, t + 0.3);
    humG.gain.setValueAtTime(0.03, t);
    humG.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    hum.connect(humG); humG.connect(audioCtx.destination);
    hum.start(t); hum.stop(t + 0.3);
},

// Boot: Alien Quantum startup chord (3-layer)
alienStartupChime: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    // Layer 1: Sub-harmonic foundation (triangle 55Hz -> 82Hz)
    const sub = audioCtx.createOscillator();
    const subG = audioCtx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(55, t);
    sub.frequency.setValueAtTime(55, t + 0.5);
    sub.frequency.linearRampToValueAtTime(82.4, t + 2.0);
    subG.gain.setValueAtTime(0.001, t);
    subG.gain.linearRampToValueAtTime(0.15, t + 0.2);
    subG.gain.setValueAtTime(0.15, t + 1.4);
    subG.gain.exponentialRampToValueAtTime(0.01, t + 2.0);
    sub.connect(subG); subG.connect(audioCtx.destination);
    sub.start(t); sub.stop(t + 2.0);

    // Layer 2: Chord pad (3 detuned sawtooth through lowpass)
    const freqs = [220, 277, 370];
    const targets = [233, 294, 392];
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(200, t);
    lp.frequency.exponentialRampToValueAtTime(4000, t + 0.8);
    lp.frequency.setValueAtTime(4000, t + 0.8);
    lp.frequency.exponentialRampToValueAtTime(2000, t + 2.0);
    const padG = audioCtx.createGain();
    padG.gain.setValueAtTime(0.001, t);
    padG.gain.linearRampToValueAtTime(0.06, t + 0.4);
    padG.gain.setValueAtTime(0.06, t + 1.4);
    padG.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    lp.connect(padG); padG.connect(audioCtx.destination);
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freqs[i], t);
        osc.frequency.linearRampToValueAtTime(targets[i], t + 2.0);
        osc.detune.value = (i - 1) * 5; // -5, 0, +5 cents
        osc.connect(lp);
        osc.start(t); osc.stop(t + 2.0);
    }

    // Layer 3: Crystalline ring-out (delayed entry at 600ms)
    const ringFreqs = [1760, 2217];
    for (let i = 0; i < 2; i++) {
        const ring = audioCtx.createOscillator();
        const ringG = audioCtx.createGain();
        ring.type = 'sine';
        ring.frequency.value = ringFreqs[i];
        ringG.gain.setValueAtTime(0.001, t);
        ringG.gain.setValueAtTime(0.001, t + 0.6);
        ringG.gain.linearRampToValueAtTime(0.1, t + 0.8);
        ringG.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
        ring.connect(ringG); ringG.connect(audioCtx.destination);
        ring.start(t); ring.stop(t + 2.0);
    }
},

// Boot: Four-tone corner sequence (F#5 -> E5 -> C#5 -> A4)
borderTraceCorner: (cornerIndex) => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const freqs = [740, 659, 554, 440]; // F#5, E5, C#5, A4
    const freq = freqs[Math.min(cornerIndex, 3)];
    // Main sine
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = 3; // slight alien detune
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.005);
    g.gain.setValueAtTime(0.12, t + 0.045);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.165);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.165);
    // Harmonic sparkle (2 octaves up)
    const harm = audioCtx.createOscillator();
    const hg = audioCtx.createGain();
    harm.type = 'triangle';
    harm.frequency.value = freq * 4;
    hg.gain.setValueAtTime(0.001, t);
    hg.gain.linearRampToValueAtTime(0.04, t + 0.005);
    hg.gain.exponentialRampToValueAtTime(0.001, t + 0.165);
    harm.connect(hg); hg.connect(audioCtx.destination);
    harm.start(t); harm.stop(t + 0.165);
},

// Boot: Post-boot "online" confirmation
alienQuantumOnline: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [261.6, 329.6, 392.0, 523.3]; // C4, E4, G4, C5
    for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = notes[i];
        const start = t + i * 0.05;
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.05, start + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, start + (i === 3 ? 0.3 : 0.12));
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + (i === 3 ? 0.3 : 0.12));
    }
},

// Health: Warning beep system (3 stages)
healthWarning: (stage) => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    if (stage === 1) {
        // Single beep: 440Hz square, 82ms
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = 440;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.002);
        g.gain.setValueAtTime(0.08, t + 0.032);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.082);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.082);
    } else if (stage === 2) {
        // Double beep: 523Hz, 659Hz ascending pair
        const freqs = [523, 659];
        for (let i = 0; i < 2; i++) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'square'; osc.frequency.value = freqs[i];
            const start = t + i * 0.08;
            g.gain.setValueAtTime(0.001, start);
            g.gain.linearRampToValueAtTime(0.12, start + 0.002);
            g.gain.setValueAtTime(0.12, start + 0.027);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.067);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(start); osc.stop(start + 0.067);
        }
    } else if (stage === 3) {
        // Triple beep: 659, 784, 1047Hz ascending with crescendo
        const freqs = [659, 784, 1047];
        const gains = [0.12, 0.14, 0.18];
        for (let i = 0; i < 3; i++) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'square'; osc.frequency.value = freqs[i];
            const start = t + i * 0.06;
            g.gain.setValueAtTime(0.001, start);
            g.gain.linearRampToValueAtTime(gains[i], start + 0.001);
            g.gain.setValueAtTime(gains[i], start + 0.021);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.051);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(start); osc.stop(start + 0.051);
        }
    }
},

// Health: Structural stress creak
structuralStress: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const bufLen = audioCtx.sampleRate * 0.2;
    const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/bufLen, 1.5);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 2;
    bp.frequency.setValueAtTime(1500, t);
    bp.frequency.exponentialRampToValueAtTime(800, t + 0.2);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
    src.start(t); src.stop(t + 0.2);
},

// Health: Panel flicker electric pop
panelFlicker: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const bufLen = audioCtx.sampleRate * 0.03;
    const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/bufLen);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2000;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.02, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    src.connect(hp); hp.connect(g); g.connect(audioCtx.destination);
    src.start(t); src.stop(t + 0.03);
},

// Health: Glitch burst sound
glitchBurst: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const dur = 0.03 + Math.random() * 0.03; // 30-60ms
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const g2 = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.value = 100 + Math.random() * 700;
    osc2.type = 'sawtooth'; osc2.frequency.value = 50 + Math.random() * 150;
    g.gain.setValueAtTime(0.08, t); g.gain.setValueAtTime(0.001, t + dur);
    g2.gain.setValueAtTime(0.04, t); g2.gain.setValueAtTime(0.001, t + dur);
    // Step frequency every 15ms
    const steps = Math.floor(dur / 0.015);
    for (let i = 1; i <= steps; i++) {
        osc.frequency.setValueAtTime(100 + Math.random() * 700, t + i * 0.015);
    }
    osc.connect(g); g.connect(audioCtx.destination);
    osc2.connect(g2); g2.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + dur);
    osc2.start(t); osc2.stop(t + dur);
},

// Health: Spark/crackle sound
sparkCrackle: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const numBursts = 2 + Math.floor(Math.random() * 3); // 2-4 bursts
    let offset = 0;
    for (let i = 0; i < numBursts; i++) {
        const burstDur = 0.008 + Math.random() * 0.007; // 8-15ms
        const bufLen = Math.floor(audioCtx.sampleRate * burstDur);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < bufLen; j++) data[j] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const hp = audioCtx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 3000;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.04 + Math.random() * 0.04, t + offset);
        src.connect(hp); hp.connect(g); g.connect(audioCtx.destination);
        src.start(t + offset); src.stop(t + offset + burstDur);
        offset += burstDur + 0.005 + Math.random() * 0.015;
    }
},

// Bio-matter: Cache fill blip
bioMatterBlip: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.03);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.03);
},

// Bio-matter: Upload tick
uploadTick: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.value = 2000;
    g.gain.setValueAtTime(0.01, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.015);
},

// Bio-matter: Upload complete chime
uploadComplete: () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const freqs = [500, 550, 600, 650, 700, 750, 800, 1000];
    for (let i = 0; i < 8; i++) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = freqs[i];
        const start = t + i * 0.04;
        g.gain.setValueAtTime(0.001, start);
        g.gain.linearRampToValueAtTime(0.03 + i * 0.002, start + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.04);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + (i === 7 ? 0.2 : 0.04));
    }
    // Cache complete chime (2400Hz + 3600Hz shimmer)
    const main = audioCtx.createOscillator();
    const mg = audioCtx.createGain();
    main.type = 'sine'; main.frequency.value = 2400;
    const chimeStart = t + 0.32;
    mg.gain.setValueAtTime(0.001, chimeStart);
    mg.gain.linearRampToValueAtTime(0.1, chimeStart + 0.005);
    mg.gain.setValueAtTime(0.1, chimeStart + 0.105);
    mg.gain.exponentialRampToValueAtTime(0.001, chimeStart + 0.305);
    main.connect(mg); mg.connect(audioCtx.destination);
    main.start(chimeStart); main.stop(chimeStart + 0.305);
},
```

**Testing**: Call each new SFX method from the console. Verify they produce audio without errors.

---

## PHASE B: SCAN LINES & GLITCH SYSTEM

### CHUNK B1: Full-Column Scan Lines with Non-Linear Speed

**What**: Add full-height scan line columns over left and right HUD areas. Replace constant scan line speed with sinusoidal variation. Add health-linked glitching.

**Dependencies**: Chunk A2 (state variables)

**Where**:
- New function `renderFullColumnScanlines()` -- insert after `renderHUDEnergyPulse()` (after line 12955)
- Modify `updateHUDAnimations()` at line 14582 (scan line speed)
- Call from `renderHUDFrame()` at line 13217 (before `renderCoordDistressArrows`)

**Changes**:

**1. Modify scan line speed in `updateHUDAnimations()` (line 14584):**

```js
// REPLACE: hudAnimState.scanlineOffset = (hudAnimState.scanlineOffset + dt * 120) % 300;
// WITH:
const baseSpeed = 80;
const modSpeed = 60 * Math.sin(Date.now() / 3000);
const burstMod = (Date.now() % 5000 < 200) ? 2.0 : 1.0;
const scanSpeed = (baseSpeed + modSpeed) * burstMod;
hudAnimState.scanlineOffset = (hudAnimState.scanlineOffset + dt * scanSpeed) % 300;
```

**2. New function `renderFullColumnScanlines(layout)` -- insert before `renderHUDFrame()` (before line 12957):**

```js
function renderFullColumnScanlines(layout) {
    const healthPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH :
                      (typeof finalHealth !== 'undefined' ? finalHealth / CONFIG.UFO_START_HEALTH : 1.0);

    // Compute glitch intensity from health
    let glitchIntensity = 0;
    if (healthPct <= 0.05) glitchIntensity = 1.0;
    else if (healthPct <= 0.10) glitchIntensity = 0.8;
    else if (healthPct <= 0.25) glitchIntensity = 0.5;
    else if (healthPct <= 0.50) glitchIntensity = 0.2;

    // Left column: covers status + weapons + diag + opslog + commander
    const leftW = layout.statusZone.x + layout.statusZone.w + 10;
    renderColumnScanlines(0, 0, leftW, canvas.height, 0.008, glitchIntensity);

    // Right column: covers systems + NRG.FLOW + fleet
    const rightX = layout.systemsZone.x - 10;
    renderColumnScanlines(rightX, 0, canvas.width - rightX, canvas.height, 0.008, glitchIntensity);
}

function renderColumnScanlines(x, y, w, h, baseAlpha, glitchIntensity) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const offset = hudAnimState.scanlineOffset;

    // Base scanlines (every 3px)
    for (let ly = y - 3 + (offset % 3); ly < y + h; ly += 3) {
        let shiftX = 0;
        const shiftChance = 0.05 + glitchIntensity * 0.25;
        const maxShift = 1 + Math.floor(glitchIntensity * 3);
        if (glitchIntensity > 0 && Math.random() < shiftChance) {
            shiftX = (Math.random() - 0.5) * maxShift * 2;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha})`;
        ctx.fillRect(x + shiftX, ly, w, 1);
    }

    // Chromatic aberration (glitch intensity >= 0.3)
    if (glitchIntensity >= 0.3) {
        const chromaticRate = glitchIntensity * 2; // events per second
        if (Math.random() < chromaticRate / 60) { // per frame
            const bandY = y + Math.random() * h;
            const bandH = 2 + Math.random() * 4;
            const alpha = 0.04 * glitchIntensity;
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.fillRect(x - 1, bandY, w, bandH);
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            ctx.fillRect(x, bandY, w, bandH);
            ctx.fillStyle = `rgba(0, 0, 255, ${alpha})`;
            ctx.fillRect(x + 1, bandY, w, bandH);
        }
    }

    // Brief static blocks (glitch intensity >= 0.5)
    if (glitchIntensity >= 0.5 && Math.random() < glitchIntensity * 1.5 / 60) {
        const bw = 20 + Math.random() * 40;
        const bh = 4 + Math.random() * 8;
        const bx = x + Math.random() * (w - bw);
        const by = y + Math.random() * (h - bh);
        const alpha = 0.08 * glitchIntensity;
        for (let py = by; py < by + bh; py += 2) {
            for (let px = bx; px < bx + bw; px += 2) {
                const gray = Math.floor(Math.random() * 200);
                ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
                ctx.fillRect(px, py, 2, 2);
            }
        }
    }

    // Ambient periodic glitch (even at full health)
    const now = Date.now();
    if (now > hudAnimState.nextAmbientGlitch) {
        hudAnimState.nextAmbientGlitch = now + 8000 + Math.random() * 7000;
        hudAnimState.lastAmbientGlitch = now;
    }
    if (now - hudAnimState.lastAmbientGlitch < 50) {
        // Brief brightness flicker
        ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha * 2})`;
        for (let ly = y; ly < y + h; ly += 3) {
            ctx.fillRect(x, ly, w, 1);
        }
    }

    ctx.restore();
}
```

**3. Call from `renderHUDFrame()` -- insert at line 13215 (before coord distress arrows):**

```js
    // Full-column scan lines (with health-linked glitching)
    if (!booting) {
        renderFullColumnScanlines(layout);
    }
```

**Testing**:
- Scan lines visible over left and right HUD columns at full health (very subtle)
- Speed varies sinusoidally -- sometimes slow, sometimes fast
- Every 5s, brief speed burst visible
- At low health: horizontal shifts, chromatic aberration, static blocks appear
- Every 8-15s: brief ambient glitch flicker

---

## PHASE C: NRG.FLOW ENHANCEMENT

### CHUNK C1: Animated Grid and Enhanced Lines

**What**: Transform the NRG.FLOW graph from static to dynamic: animated grid with pulsing lines, enhanced line rendering with glow, intersection dots, peak markers, beam overlay, spike markers.

**Dependencies**: Chunk A2 (state variables)

**Where**: `renderEnergyGraph()` at line 13605-13723.

**Changes**: Replace the grid and line rendering sections of `renderEnergyGraph()` with enhanced versions.

**Grid section replacement** (inside renderEnergyGraph, after graph area calculation):

```js
    // Animated horizontal grid lines (5 lines at 0%, 25%, 50%, 75%, 100%)
    for (let i = 0; i <= 4; i++) {
        const ly = gy + gh - (i / 4) * gh;
        const pulseAlpha = 0.04 + 0.02 * Math.sin(Date.now() / 2000 + i * 0.5);
        ctx.strokeStyle = `rgba(255, 136, 0, ${pulseAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx + gw, ly); ctx.stroke();
    }

    // Animated vertical grid lines (6 lines, drift rightward)
    const vDrift = (Date.now() / 1000) % (gw / 6); // 1px/s drift
    for (let i = 0; i < 6; i++) {
        const lx = gx + ((i / 6) * gw + vDrift) % gw;
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx, gy + gh); ctx.stroke();

        // Intersection dots (every other intersection blinks)
        for (let j = 0; j <= 4; j++) {
            const iy = gy + gh - (j / 4) * gh;
            const dotOn = ((i + j) % 2 === 0) ? (Math.floor(Date.now() / 500) % 2 === 0) : true;
            if (dotOn) {
                ctx.fillStyle = 'rgba(255, 136, 0, 0.12)';
                ctx.fillRect(lx, iy, 1, 1);
            }
        }
    }
```

**Enhanced line rendering** (replace output and intake line drawing):

```js
    // OUTPUT line (red) with glow
    ctx.save();
    ctx.shadowColor = '#f44';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.9)';
    ctx.lineWidth = 1.5;
    let prevOutY = null;
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.outputBuffer[bufIdx]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        // Peak detection (local maximum)
        if (prevOutY !== null && i > 1) {
            const prevPrevIdx = (idx + i - 2) % 180;
            const prevPrevY = mapY(energyTimeSeries.outputBuffer[prevPrevIdx]);
            if (prevOutY < py && prevOutY < prevPrevY && energyTimeSeries.outputBuffer[(idx + i - 1) % 180] > 0.5) {
                // Peak marker
                ctx.save();
                ctx.fillStyle = '#f44';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(gx + ((i - 1) / 179) * gw, prevOutY, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        prevOutY = py;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Fill gradient for output
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.outputBuffer[bufIdx]);
        ctx.lineTo(px, py);
    }
    ctx.lineTo(gx + gw, gy + gh);
    ctx.closePath();
    const outGrad = ctx.createLinearGradient(0, gy, 0, gy + gh);
    outGrad.addColorStop(0, 'rgba(255, 68, 68, 0.20)');
    outGrad.addColorStop(1, 'rgba(255, 68, 68, 0)');
    ctx.fillStyle = outGrad;
    ctx.fill();

    // INTAKE line (green) with glow - same pattern
    ctx.save();
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.intakeBuffer[bufIdx]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Fill gradient for intake
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.intakeBuffer[bufIdx]);
        ctx.lineTo(px, py);
    }
    ctx.lineTo(gx + gw, gy + gh);
    ctx.closePath();
    const inGrad = ctx.createLinearGradient(0, gy, 0, gy + gh);
    inGrad.addColorStop(0, 'rgba(0, 255, 0, 0.15)');
    inGrad.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = inGrad;
    ctx.fill();

    // "NOW" indicator (right edge)
    const nowBlink = Math.floor(Date.now() / 600) % 2 === 0;
    if (nowBlink) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(gx + gw - 3, gy, 3, gh);
    }

    // Beam activity overlay
    if (ufo && ufo.beamActive) {
        const beamPulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 0, ${0.06 + beamPulse * 0.06})`;
        ctx.fillRect(gx + gw - 4, gy, 4, gh);
        if (Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = '#f44';
            ctx.font = '7px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('BEAM', gx + gw - 2, gy - 2);
        }
    }

    // Low energy state (< 15%)
    if (ufo && ufo.energy / ufo.maxEnergy < 0.15) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.04)';
        ctx.fillRect(gx, gy, gw, gh);
        // MIN threshold line
        const minY = mapY(10); // ENERGY_MIN_TO_FIRE
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#f44';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, minY); ctx.lineTo(gx + gw, minY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f44';
        ctx.font = '6px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('MIN', gx + 1, minY - 2);
    }
```

**Testing**:
- Grid lines pulse gently (breathing effect)
- Vertical grid lines drift rightward
- Output and intake lines have visible glow halos
- Peak dots appear at local maxima
- "NOW" indicator blinks at right edge
- When beam active: red band + "BEAM" text at right edge
- When energy < 15%: red tint + dashed MIN threshold line

---

## PHASE D: LOW HEALTH FREAKOUT

### CHUNK D1: Health Warning System

**What**: Implement the 3-tier progressive health warning: red pulse on SYS.INTG, HUD panel shake, spark particles, UFO smoke, panel flickering, distortion bands, red vignette.

**Dependencies**: Chunks A2 (state), A3 (sounds)

**Where**:
- New function `updateHealthFreakout(dt)` -- insert in `updateHUDAnimations()` at line 14604
- New function `renderHealthFreakout(layout)` -- insert after `renderFullColumnScanlines`
- Modify `renderHUDFrame()` to apply panel shake (ctx.translate) when health < 10%
- Call from draw function at line 21328

**Changes**:

**1. `updateHealthFreakout(dt)` -- add call in `updateHUDAnimations()` after line 14603:**

```js
    // Health freakout updates
    if (gameState === 'PLAYING') {
        updateHealthFreakout(dt);
    }
```

**2. New function `updateHealthFreakout(dt)` -- insert after `updateHUDAnimations()`:**

```js
function updateHealthFreakout(dt) {
    const healthPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : 1.0;
    if (healthPct >= 0.25) {
        // Clear particles when healthy
        healthFreakoutState.sparks = [];
        healthFreakoutState.smokePuffs = [];
        healthFreakoutState.warningToneTimer = 0;
        return;
    }

    // Warning tone system
    healthFreakoutState.warningToneTimer += dt;
    let stage = 0, interval = 2.0;
    if (healthPct < 0.05) { stage = 3; interval = 0.8; }
    else if (healthPct < 0.15) { stage = 2; interval = 1.2; }
    else if (healthPct < 0.25) { stage = 1; interval = 2.0; }

    if (stage > 0 && healthFreakoutState.warningToneTimer >= interval) {
        healthFreakoutState.warningToneTimer = 0;
        SFX.healthWarning(stage);
    }

    // Spark particles (health < 10%)
    if (healthPct < 0.10) {
        // Spawn 2-4 sparks per second from HUD panel edges
        if (Math.random() < dt * 3) {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const baseX = side === 'left' ? 10 + Math.random() * 210 : canvas.width - 205 + Math.random() * 195;
            const baseY = Math.random() * canvas.height;
            healthFreakoutState.sparks.push({
                x: baseX, y: baseY,
                vx: (Math.random() - 0.5) * 80,
                vy: -20 - Math.random() * 40,
                life: 0, maxLife: 0.2 + Math.random() * 0.3,
                color: Math.random() < 0.33 ? '#ff0' : (Math.random() < 0.5 ? '#f80' : '#f44')
            });
        }
        // Cap at 30 particles
        if (healthFreakoutState.sparks.length > 30) {
            healthFreakoutState.sparks.splice(0, healthFreakoutState.sparks.length - 30);
        }
    }

    // Update spark positions
    for (let i = healthFreakoutState.sparks.length - 1; i >= 0; i--) {
        const s = healthFreakoutState.sparks[i];
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 40 * dt; // gravity
        if (s.life >= s.maxLife) {
            healthFreakoutState.sparks.splice(i, 1);
        }
    }

    // Smoke puffs from UFO (health < 10%)
    if (healthPct < 0.10 && ufo) {
        if (Math.random() < dt * 2) {
            healthFreakoutState.smokePuffs.push({
                x: ufo.x + (Math.random() - 0.5) * 40,
                y: ufo.y - 10,
                vx: (Math.random() - 0.5) * 5,
                vy: -10 - Math.random() * 10,
                life: 0, maxLife: 0.8 + Math.random() * 0.7,
                radius: 4 + Math.random() * 4
            });
        }
        if (healthFreakoutState.smokePuffs.length > 10) {
            healthFreakoutState.smokePuffs.splice(0, healthFreakoutState.smokePuffs.length - 10);
        }
    }

    // Update smoke puffs
    for (let i = healthFreakoutState.smokePuffs.length - 1; i >= 0; i--) {
        const p = healthFreakoutState.smokePuffs[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx += (Math.random() - 0.5) * dt * 5; // horizontal waver
        p.radius *= 1 + dt * 0.5; // grow over time
        if (p.life >= p.maxLife) {
            healthFreakoutState.smokePuffs.splice(i, 1);
        }
    }

    // Structural stress sound (health < 5%)
    if (healthPct < 0.05) {
        const now = Date.now();
        if (now - healthFreakoutState.lastJoltTime > 500 + Math.random() * 500) {
            healthFreakoutState.lastJoltTime = now;
            SFX.structuralStress();
        }
    }
}
```

**3. New function `renderHealthFreakout(layout)` -- insert after `renderFullColumnScanlines`:**

```js
function renderHealthFreakout(layout) {
    const healthPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : 1.0;
    if (healthPct >= 0.25) return;

    // Tier 1: Red tint overlay (health < 25%)
    const tintAlpha = (0.25 - healthPct) * 0.08;
    const pulse = Math.sin(Date.now() / (healthPct < 0.10 ? 300 : 800)) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 0, 0, ${tintAlpha * pulse})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tier 2: Render spark particles (health < 10%)
    for (const s of healthFreakoutState.sparks) {
        const alpha = 1 - s.life / s.maxLife;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        const size = 1 + (s.life < s.maxLife * 0.3 ? 1 : 0);
        ctx.fillRect(s.x, s.y, size, size);
    }
    ctx.globalAlpha = 1;

    // Render smoke puffs from UFO
    for (const p of healthFreakoutState.smokePuffs) {
        const alpha = 0.3 * (1 - p.life / p.maxLife);
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Tier 3: Red vignette (health < 5%)
    if (healthPct < 0.05) {
        const vigAlpha = 0.1 + 0.1 * Math.sin(Date.now() / 150);
        // Draw a border vignette (20px inward gradient)
        const grad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.35,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
        );
        grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
        grad.addColorStop(1, `rgba(255, 0, 0, ${vigAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Panel flicker (10% chance per 100ms per panel)
        if (Math.random() < 0.1) {
            SFX.panelFlicker();
        }
    }
}
```

**4. Add HUD panel shake in `renderHUDFrame()` (wrap all panel rendering):**

At the START of `renderHUDFrame()`, after `const booting = ...` (line 12959):

```js
    // Health-based HUD shake
    const healthPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : 1.0;
    let shakeX = 0, shakeY = 0;
    if (healthPct < 0.10 && !booting) {
        const shakeIntensity = Math.min(5, ((0.10 - healthPct) / 0.05) * 3);
        shakeX = (Math.random() - 0.5) * shakeIntensity;
        shakeY = (Math.random() - 0.5) * shakeIntensity;
        // Occasional big jolt at < 5%
        if (healthPct < 0.05 && Date.now() - healthFreakoutState.lastJoltTime < 50) {
            shakeX *= 2.5;
            shakeY *= 2.5;
        }
        ctx.save();
        ctx.translate(shakeX, shakeY);
    }
```

At the END of `renderHUDFrame()`, before the closing `}` (before line 13218):

```js
    // End shake transform
    if (healthPct < 0.10 && !booting) {
        ctx.restore();
    }
```

**5. Call `renderHealthFreakout` from the main draw function at line 21329 (after renderHUDFrame):**

```js
    renderHUDFrame();
    renderHealthFreakout(getHUDLayout()); // After HUD, before boot effects
```

**Testing**:
- At 100% health: no effects
- At 20% health: subtle red tint pulsing, periodic warning beeps (every 2s)
- At 8% health: HUD panels shake, sparks fly from panel edges, smoke from UFO, double-beep warnings
- At 3% health: severe shake, red vignette, structural stress sounds, triple-beep alarms

---

## PHASE E: DIAG.SYS ENHANCEMENT

### CHUNK E1: Taller Panel with Bar Graphs and Sparklines

**What**: Increase DIAG.SYS panel from 100px to 160px. Add bar graph and sparkline line types. Add new data points (NRG.RATE sparkline, COMBO, WAVE.T). Improve scroll behavior.

**Dependencies**: Chunk A2 (diagEnhancedState)

**Where**:
- `getHUDLayout()` line 12881: change diagnosticsZone height and Y
- `renderDiagnosticsZone()` at line 14193: major rewrite
- `updateHUDAnimations()`: add sparkline data sampling

**Changes**:

**1. Update `getHUDLayout()` (line 12881):**

```js
// REPLACE:
diagnosticsZone: { x: margin, y: canvas.height - 330, w: leftW, h: 100 },
// WITH:
diagnosticsZone: { x: margin, y: canvas.height - 390, w: leftW, h: 160 },
```

**2. Add sparkline sampling to `updateHUDAnimations()` (after line 14603):**

```js
    // DIAG.SYS sparkline data (sample every 500ms)
    if (gameState === 'PLAYING') {
        diagEnhancedState.energyRateSampleTimer += dt;
        if (diagEnhancedState.energyRateSampleTimer >= 0.5) {
            diagEnhancedState.energyRateSampleTimer -= 0.5;
            const netRate = energyTimeSeries.frameIntake - energyTimeSeries.frameOutput;
            diagEnhancedState.energyRateBuffer[diagEnhancedState.energyRateWriteIdx] = netRate;
            diagEnhancedState.energyRateWriteIdx = (diagEnhancedState.energyRateWriteIdx + 1) % 20;
        }
    }
```

**3. Rewrite `renderDiagnosticsZone()` at line 14193:**

The function body is replaced to support 160px height, 14px line height, bar graph lines, and sparkline lines. The core structure is the same (build lines array, auto-scroll, render with clip rect) but with richer line rendering. See the existing architecture doc's Chunk 10 for the full function body -- the key additions are:

- **Bar graph rendering**: After the label text, draw a 60x8px bar with status-colored fill
- **Sparkline rendering**: After the label text, draw a 50x10px mini line graph from the ring buffer
- **14px line height** instead of 12px
- **Section dividers**: thin rgba(0, 170, 255, 0.1) lines between logical groups
- **Scroll improvements**: 0.3px/frame speed, 3s pause at ends, arrow indicators

**Testing**:
- Panel is visibly taller (160px vs 100px)
- More data lines visible simultaneously
- NRG.MAIN and SHLD.INTG show bar graphs
- NRG.RATE shows a sparkline that updates over time
- Scroll arrows appear when content overflows
- All data updates in real-time

---

## PHASE F: BIO-MATTER UPLOAD CONDUIT

### CHUNK F1: Move B.MTR to Mission Zone + Upload Conduit

**What**: Remove B.MTR from STATUS zone. Add it to MISSION zone below harvest counter. Add upload conduit visualization (scrolling binary stream). Add collection animation. Add end-of-wave upload sequence.

**Dependencies**: Chunks A2 (bioUploadState), A3 (sounds)

**Where**:
- `renderStatusZone()` line 13286-13291: remove B.MTR display
- `renderMissionZone()` line 13347: add B.MTR + conduit at bottom
- `updateHUDAnimations()`: add bio upload state updates
- Wave-end handling: trigger upload sequence

**Changes**:

**1. Remove B.MTR from `renderStatusZone()` (lines 13286-13291):**

Delete or comment out the B.MTR rendering block:
```js
// REMOVE these lines:
// if (bioMatter > 0 || (techTree.activeResearch || techTree.researched.size > 0)) {
//     renderNGELabel(x + pad + 4, y + 104, 'B.MTR:', '#0a0');
//     ctx.fillStyle = '#0f0';
//     ctx.font = 'bold 14px monospace';
//     ctx.fillText(bioMatter.toString(), x + pad + 58, y + 104);
// }
```

**2. Add B.MTR + conduit to `renderMissionZone()` bottom:**

At the end of `renderMissionZone()`, before the closing brace, add:

```js
    // B.MTR display (moved from status zone)
    if (bioMatter > 0 || (techTree.activeResearch || techTree.researched.size > 0)) {
        const bmtrY = y + 82;

        // Label and value
        ctx.fillStyle = '#0a0';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('B.MTR:', x + 6, bmtrY + 10);

        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(bioMatter.toString(), x + 50, bmtrY + 10);

        // Upload conduit visualization
        const conduitX = x + 80;
        const conduitW = w - 86;
        const conduitH = 12;
        const conduitY = bmtrY + 1;

        // Conduit background
        ctx.fillStyle = 'rgba(0, 40, 0, 0.3)';
        ctx.fillRect(conduitX, conduitY, conduitW, conduitH);
        ctx.strokeStyle = 'rgba(0, 170, 68, 0.5)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(conduitX, conduitY, conduitW, conduitH);

        // Collection flash
        if (bioUploadState.flashAlpha > 0) {
            ctx.fillStyle = `rgba(0, 255, 0, ${bioUploadState.flashAlpha * 0.15})`;
            ctx.fillRect(conduitX, conduitY, conduitW, conduitH);
        }

        // Scrolling binary data stream
        ctx.save();
        ctx.beginPath();
        ctx.rect(conduitX + 1, conduitY + 1, conduitW - 2, conduitH - 2);
        ctx.clip();
        ctx.font = '7px monospace';
        ctx.textAlign = 'left';
        const charW = 8;
        const offset = bioUploadState.streamOffset % charW;
        const numChars = Math.ceil(conduitW / charW) + 2;
        for (let i = 0; i < numChars; i++) {
            const cx = conduitX + 1 + i * charW - offset;
            // Deterministic binary based on position
            const charIdx = Math.floor((cx + bioUploadState.streamOffset) / charW);
            const bit = ((charIdx * 7 + 13) % 3 === 0) ? '1' : '0';
            const alpha = 0.2 + 0.4 * ((charIdx % 5) / 5);
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            ctx.fillText(bit, cx, conduitY + 10);
        }
        ctx.restore();

        // Bit rate display
        ctx.fillStyle = '#0a0';
        ctx.font = '6px monospace';
        ctx.textAlign = 'left';
        const rateText = bioUploadState.bitRate > 0 ? `${Math.round(bioUploadState.bitRate)} b/s` : 'IDLE';
        ctx.fillText('\u2191 ' + rateText, conduitX, bmtrY + 22);
    }
```

**3. Update `updateHUDAnimations()` to advance bio upload state:**

```js
    // Bio upload conduit animation
    if (gameState === 'PLAYING') {
        const speed = bioUploadState.flashAlpha > 0 ? 90 : 30; // 3x during flash
        bioUploadState.streamOffset += dt * speed;
        bioUploadState.flashAlpha = Math.max(0, bioUploadState.flashAlpha - dt * 10); // fade over 100ms

        // Bit rate smoothing (decay over 3s)
        bioUploadState.bitRate *= Math.pow(0.5, dt / 1.5);
        if (bioUploadState.bitRate < 0.1) bioUploadState.bitRate = 0;
    }
```

**4. Trigger flash on bio-matter collection:**

Find the location where `bioMatter` is incremented (when a target is abducted). Add:

```js
    bioUploadState.flashAlpha = 1.0;
    bioUploadState.bitRate += 10; // bump rate
    SFX.bioMatterBlip();
```

**Testing**:
- B.MTR no longer appears in STATUS zone
- B.MTR appears in MISSION zone below harvest counter
- Upload conduit shows scrolling binary stream
- On bio-matter collection: flash, speed burst, blip sound
- Bit rate display shows collection speed, decays to IDLE

---

## PHASE G: TECH TREE HORIZONTAL VISUALIZATION

### CHUNK G1: Replace Tech Chips with Horizontal Tech Tree

**What**: Replace the current `renderTechChips()` with a horizontal tech tree showing 3 track rows (PG, DC, DN) with 5 nodes each, connecting lines, bio-organic particle backgrounds, and the research display below.

**Dependencies**: Chunks A2 (techTreeAnimState)

**Where**:
- Replace `renderTechChips()` at line 14398
- Update `TRACK_COLORS` at line 14392 (add DN track color fix)
- Move research display from below weapons zone (lines 13021-13111) into the tech tree section
- Modify `renderHUDFrame()` at line 12982 to call new function

**Changes**:

**1. Update `TRACK_COLORS` (line 14392):**

```js
const TRACK_COLORS = {
    powerGrid: '#f80',      // Warm orange (was #ff0)
    droneCommand: '#48f',   // Blue
    defenseNetwork: '#d60'  // Deep orange
};
```

**2. Replace `renderTechChips(layout)` (line 14398) with `renderTechTree(layout)`:**

The new function:

```js
function renderTechTree(layout) {
    const statusEnd = layout.statusZone.x + layout.statusZone.w;
    const missionStart = layout.missionZone.x;
    const gapStartX = statusEnd + 6;
    const gapEndX = missionStart - 6;
    const gapW = gapEndX - gapStartX;

    // Small screen: hide entirely if gap < 180px
    if (gapW < 180) return;

    const tracks = ['powerGrid', 'droneCommand', 'defenseNetwork'];
    const trackPrefixes = ['pg', 'dc', 'dn'];
    const trackBgColors = [
        'rgba(255, 136, 0, 0.04)',
        'rgba(68, 136, 255, 0.04)',
        'rgba(221, 102, 0, 0.04)'
    ];

    // Node dimensions
    const isMicro = gapW < 220;
    const nodeW = isMicro ? 32 : 40;
    const nodeH = isMicro ? 14 : 18;
    const nodeGap = isMicro ? 4 : 6;
    const nodesPerTrack = 5;
    const trackNodeWidth = nodesPerTrack * nodeW + (nodesPerTrack - 1) * nodeGap;

    // Center nodes in gap
    const startX = gapStartX + Math.max(0, (gapW - trackNodeWidth) / 2);

    // Row positions
    const rowH = nodeH + 4; // 2px padding top/bottom
    const baseY = 4;

    // Update animation state
    techTreeAnimState.dashOffset += 0.5; // ~30px/s at 60fps
    techTreeAnimState.researchGlowPhase = (Date.now() / 800) * Math.PI * 2;

    for (let t = 0; t < 3; t++) {
        const track = tracks[t];
        const prefix = trackPrefixes[t];
        const color = TRACK_COLORS[track];
        const rowY = baseY + t * (rowH + 2);

        // Row background tint
        ctx.fillStyle = trackBgColors[t];
        ctx.fillRect(gapStartX, rowY, gapW, rowH);

        // Bio-organic particle background
        const now = Date.now();
        for (let p = 0; p < 15; p++) {
            const seed = t * 100 + p;
            const speed = 0.2 + (seed % 7) * 0.1;
            const px = gapStartX + ((seed * 37 + now * speed * 0.001) % gapW);
            const py = rowY + 2 + (seed * 13) % (rowH - 4);
            const onDur = 100 + (seed * 17) % 300;
            const offDur = 200 + (seed * 23) % 600;
            const cycle = onDur + offDur;
            const isOn = (now % cycle) < onDur;
            if (isOn) {
                const alpha = 0.15 + ((seed * 11) % 25) * 0.01;
                const size = (p % 2 === 0) ? 1 : 2;
                ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
                ctx.fillRect(px, py, size, size);
            }
        }

        // Render 5 nodes for this track
        for (let n = 0; n < nodesPerTrack; n++) {
            const nodeId = `${prefix}${n + 1}`;
            const chipDef = TECH_CHIP_DEFS.find(c => c.id === nodeId);
            if (!chipDef) continue;

            const nx = startX + n * (nodeW + nodeGap);
            const ny = rowY + 2;

            // Determine node state
            const techNodeId = Object.keys(TECH_TO_CHIP || {}).find(k => TECH_TO_CHIP[k] === nodeId);
            const isResearched = techNodeId && techTree.researched.has(techNodeId);
            const isResearching = techTree.activeResearch && techTree.activeResearch.nodeId === nodeId;

            // Connecting line to next node
            if (n < nodesPerTrack - 1) {
                const lineStartX = nx + nodeW;
                const lineEndX = nx + nodeW + nodeGap;
                const lineY = ny + nodeH / 2;
                const nextNodeId = `${prefix}${n + 2}`;
                const nextTechId = Object.keys(TECH_TO_CHIP || {}).find(k => TECH_TO_CHIP[k] === nextNodeId);
                const nextResearched = nextTechId && techTree.researched.has(nextTechId);

                if (isResearched && nextResearched) {
                    // Both researched: solid line
                    ctx.save();
                    ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.7)`;
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 2;
                    ctx.beginPath(); ctx.moveTo(lineStartX, lineY); ctx.lineTo(lineEndX, lineY); ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.restore();
                } else if (isResearched) {
                    // Next available: animated dashes
                    ctx.save();
                    ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.4)`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.lineDashOffset = -techTreeAnimState.dashOffset;
                    ctx.beginPath(); ctx.moveTo(lineStartX, lineY); ctx.lineTo(lineEndX, lineY); ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                } else {
                    // Locked: very faint
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(lineStartX, lineY); ctx.lineTo(lineEndX, lineY); ctx.stroke();
                }
            }

            // Node background
            if (isResearching) {
                const glowPhase = Math.sin(techTreeAnimState.researchGlowPhase);
                const glowBlur = 3 + glowPhase * 2;
                ctx.save();
                ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.12)`;
                ctx.shadowColor = color;
                ctx.shadowBlur = glowBlur;
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.fillRect(nx, ny, nodeW, nodeH);
                ctx.strokeRect(nx, ny, nodeW, nodeH);
                ctx.shadowBlur = 0;
                // Progress bar at bottom
                const progress = 1 - (techTree.activeResearch.timeRemaining / techTree.activeResearch.totalTime);
                ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.8)`;
                ctx.fillRect(nx, ny + nodeH - 2, nodeW * progress, 2);
                ctx.restore();
            } else if (isResearched) {
                ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.25)`;
                ctx.fillRect(nx, ny, nodeW, nodeH);
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.strokeRect(nx, ny, nodeW, nodeH);
            } else {
                ctx.fillStyle = 'rgba(20, 20, 30, 0.3)';
                ctx.fillRect(nx, ny, nodeW, nodeH);
                ctx.save();
                ctx.setLineDash([2, 2]);
                ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.15)`;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(nx, ny, nodeW, nodeH);
                ctx.setLineDash([]);
                ctx.restore();
            }

            // Node text
            const textAlpha = isResearched ? 0.8 : (isResearching ? 0.6 : 0.2);
            const fontSize = isMicro ? 6 : 7;
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.textAlign = 'left';
            // ID prefix in track color
            ctx.fillStyle = `rgba(${hexToRgb(color)}, ${isResearched ? 0.9 : textAlpha})`;
            ctx.fillText(chipDef.text.substring(0, 3), nx + 2, ny + (isMicro ? 9 : 11));
            // Suffix in white
            if (!isMicro) {
                ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(chipDef.text.substring(4), nx + 20, ny + 11);
            }
        }
    }

    // Research display below tech tree
    const researchY = baseY + 3 * (rowH + 2) + 2;
    if (techTree.activeResearch) {
        const node = getTechNode(techTree.activeResearch.nodeId);
        if (node) {
            const chipDef = TECH_CHIP_DEFS.find(c => c.id === techTree.activeResearch.nodeId);
            const shortName = chipDef ? chipDef.text : node.name;
            const progress = 1 - (techTree.activeResearch.timeRemaining / techTree.activeResearch.totalTime);
            const timeLeft = Math.ceil(techTree.activeResearch.timeRemaining);

            // Background
            ctx.fillStyle = 'rgba(0, 20, 0, 0.4)';
            ctx.fillRect(gapStartX, researchY, gapW, 16);
            ctx.strokeStyle = 'rgba(0, 170, 68, 0.5)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(gapStartX, researchY, gapW, 16);

            // Priority number
            ctx.fillStyle = '#0f0';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('1', gapStartX + 4, researchY + 12);

            // Name
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(shortName, gapStartX + 18, researchY + 12);

            // Progress bar
            const barX = gapStartX + 18 + shortName.length * 6 + 4;
            const barW = Math.max(30, gapW - barX + gapStartX - 40);
            renderNGEBar(barX, researchY + 4, barW, 8, progress, '#0a4', { segments: 15 });

            // Timer
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${timeLeft}s`, gapStartX + gapW - 4, researchY + 12);

            // Blink light
            renderNGEBlinkLight(gapStartX + gapW - 14, researchY + 2, '#0f0', 300);
        }
    }

    // Queue items
    const queueItems = techTree.queue ? techTree.queue.slice(0, 2) : [];
    for (let i = 0; i < queueItems.length; i++) {
        const qNode = getTechNode(queueItems[i]);
        const qChip = TECH_CHIP_DEFS.find(c => c.id === queueItems[i]);
        const qName = qChip ? qChip.text : (qNode ? qNode.name : '???');
        const qY = researchY + 18 + i * 14;

        ctx.fillStyle = 'rgba(0, 15, 0, 0.3)';
        ctx.fillRect(gapStartX, qY, gapW, 14);

        ctx.fillStyle = 'rgba(0, 200, 80, 0.5)';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 2}`, gapStartX + 4, qY + 11);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '8px monospace';
        ctx.fillText(qName, gapStartX + 18, qY + 11);

        if (qNode) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.textAlign = 'right';
            ctx.fillText(`${qNode.researchTime}s`, gapStartX + gapW - 4, qY + 11);
        }
    }
}
```

**3. Update `renderHUDFrame()` to call new function and remove old research display:**

At line 12982-12984, replace:
```js
// REPLACE:
if (!booting) {
    renderTechChips(layout);
}
// WITH:
if (!booting) {
    renderTechTree(layout);
}
```

At lines 13021-13111 (research progress bar below weapons zone), wrap with a condition to only render when tech tree is NOT visible (small screen fallback):

```js
// Research progress: only render below weapons when tech tree gap is too small
const techTreeGapW = layout.missionZone.x - 6 - (layout.statusZone.x + layout.statusZone.w + 6);
if (techTree.activeResearch && !booting && techTreeGapW < 180) {
    // ... existing research rendering code ...
}
```

**Testing**:
- Three track rows visible in the gap between STATUS and MISSION zones
- Researched nodes have filled backgrounds, bright borders
- Unresearched nodes are dim with dashed borders
- Currently researching node pulses with glow and has a progress bar
- Connecting lines show correct states (solid, animated dash, faint)
- Bio-organic particles drift through track backgrounds
- Research display appears below the tech tree rows
- At small screens (< 180px gap): falls back to old behavior
- Research queue shows below active research

---

## PHASE H: ENHANCED BOOT SEQUENCE

### CHUNK H1: Pre-Boot CRT Turn-On, Logo, Border Trace, Post-Boot

**What**: Wrap the existing boot sequence with pre-boot effects (CRT turn-on, Alien Quantum OS logo, border trace) and post-boot text. The existing per-panel boot system remains unchanged -- this adds global wrapper effects.

**Dependencies**: Chunks A2 (preBootState), A3 (sounds)

**Where**:
- `initHUDBoot()` at line 14612: modify to initialize pre-boot state
- `updateHUDBoot()` at line 14670: modify to handle pre-boot/post-boot phases
- `renderHUDBootGlobalEffects()` at line 15029: major expansion
- New helper functions: `renderPreBoot()`, `renderBorderTrace()`, `renderPostBoot()`

**Changes**:

**1. Modify `initHUDBoot()` to start pre-boot phase:**

Add to the top of `initHUDBoot()` (after line 14615):

```js
    // Initialize pre-boot wrapper
    preBootState.phase = 'crt';
    preBootState.timer = 0;
    preBootState.crtProgress = 0;
    preBootState.logoAlpha = 0;
    preBootState.traceProgress = 0;
    preBootState.postTextIndex = 0;
    preBootState.postTextAlpha = 1.0;
    preBootState.borderPersist = 0;

    // Extend total boot duration: 1.5s pre-boot + 3.5s panels + 0.5s post
    hudBootState.duration = 5.5;
```

**2. Modify `updateHUDBoot()` to handle pre-boot and post-boot timing:**

The key change: panel boot start times are now offset by 1.5s (the pre-boot duration). The border trace triggers each panel as it passes.

Add at the top of `updateHUDBoot()`:

```js
    // Pre-boot phase management
    const preBoot = preBootState;
    if (preBoot.phase === 'crt') {
        preBoot.timer += dt;
        preBoot.crtProgress = Math.min(1, preBoot.timer / 0.3);
        if (preBoot.timer >= 0.2) SFX.crtTurnOn();  // trigger once
        if (preBoot.timer >= 0.3) {
            preBoot.phase = 'logo';
            preBoot.timer = 0;
            SFX.alienStartupChime();
        }
    } else if (preBoot.phase === 'logo') {
        preBoot.timer += dt;
        preBoot.logoAlpha = Math.min(1, preBoot.timer / 0.2);
        if (preBoot.timer >= 0.5) {
            preBoot.phase = 'dissolve';
            preBoot.timer = 0;
        }
    } else if (preBoot.phase === 'dissolve') {
        preBoot.timer += dt;
        preBoot.logoAlpha = Math.max(0, 1 - preBoot.timer / 0.2);
        if (preBoot.timer >= 0.2) {
            preBoot.phase = 'trace';
            preBoot.timer = 0;
        }
    } else if (preBoot.phase === 'trace') {
        preBoot.timer += dt;
        preBoot.traceProgress = Math.min(1, preBoot.timer / 0.75);

        // Corner tone triggers
        const corners = [0, 0.165, 0.33, 0.495];
        for (let i = 0; i < 4; i++) {
            if (preBoot.timer >= corners[i] && preBoot.timer - dt < corners[i]) {
                SFX.borderTraceCorner(i);
            }
        }

        // Panel boot triggers based on trace position
        // (Panels start booting as trace passes their position)
        const panelTriggers = {
            status: 0.01, mission: 0.07, systems: 0.14,
            fleet: 0.20, commander: 0.42, opslog: 0.55,
            diagnostics: 0.60, weapons: 0.70
        };
        for (const [key, triggerProgress] of Object.entries(panelTriggers)) {
            const panel = hudBootState.panels[key];
            if (panel.active && panel.phase === 'waiting' && preBoot.traceProgress >= triggerProgress) {
                panel.phase = 'booting';
                panel.progress = 0;
                SFX.bootPanelStart();
            }
        }

        if (preBoot.timer >= 0.75) {
            preBoot.phase = 'panel_boot';
            preBoot.timer = 0;
        }
    } else if (preBoot.phase === 'panel_boot') {
        // Normal panel boot proceeds (handled by existing code below)
        preBoot.timer += dt;
    }

    // Modify the existing panel update code:
    // Only advance panel progress when pre-boot trace is complete
    if (preBoot.phase === 'panel_boot' || preBoot.phase === 'post' || preBoot.phase === 'inactive') {
        // ... existing panel progress update code ...
    }
```

**ARCHITECT'S NOTE**: The existing `updateHUDBoot` advances panel progress based on `hudBootState.timer - panel.startTime`. Since we're triggering panels via the trace instead of fixed start times, we need to change the progress calculation. When a panel transitions to 'booting', set a reference start time. Then progress is computed from that.

**The simplest integration**: Override each panel's `startTime` as the trace triggers it. Set `panel.startTime = hudBootState.timer`. The existing progress calculation `(elapsed - startTime) / duration` then works naturally.

**3. Expand `renderHUDBootGlobalEffects()`:**

Replace the body of `renderHUDBootGlobalEffects()` (lines 15029-15085) with:

```js
function renderHUDBootGlobalEffects() {
    if (hudBootState.phase !== 'booting') return;
    const pb = preBootState;

    // CRT turn-on effect
    if (pb.phase === 'crt') {
        // Black screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (pb.timer < 0.1) {
            // Horizontal expanding line
            const progress = pb.timer / 0.1;
            const lineW = canvas.width * easeOutCubic(progress);
            const lineX = (canvas.width - lineW) / 2;
            ctx.fillStyle = '#fff';
            ctx.fillRect(lineX, canvas.height / 2, lineW, 1);
        } else if (pb.timer < 0.3) {
            // Vertical expansion
            const progress = (pb.timer - 0.1) / 0.2;
            const rectH = canvas.height * easeOutCubic(progress);
            const rectY = (canvas.height - rectH) / 2;
            const alpha = 0.8 * (1 - progress * 0.6);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, rectY, canvas.width, rectH);
        }
    }

    // Logo display
    if (pb.phase === 'logo' || (pb.phase === 'dissolve' && pb.logoAlpha > 0)) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.globalAlpha = pb.logoAlpha;

        // Hexagonal grid behind text (very faint)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        const gridCX = canvas.width / 2;
        const gridCY = canvas.height / 2;
        for (let gx = gridCX - 100; gx < gridCX + 100; gx += 24) {
            for (let gy = gridCY - 60; gy < gridCY + 60; gy += 21) {
                const offsetX = (Math.floor(gy / 21) % 2) * 12;
                renderHexagon(gx + offsetX, gy, 10);
                ctx.stroke();
            }
        }

        // Main title
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 8;
        ctx.fillText('ALIEN QUANTUM OS', canvas.width / 2, canvas.height / 2 - 20);
        ctx.shadowBlur = 0;

        // Version
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.font = '9px monospace';
        ctx.fillText('v7.3.1 // QUANTUM ENTANGLEMENT CORE', canvas.width / 2, canvas.height / 2 + 10);

        // Initializing text
        const dots = '.'.repeat(1 + Math.floor(Date.now() / 200) % 3);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.fillText('[ INITIALIZING' + dots + ' ]', canvas.width / 2, canvas.height / 2 + 30);

        // Orbiting dots
        const orbitT = Date.now() / 3000 * Math.PI * 2;
        for (let i = 0; i < 3; i++) {
            const angle = orbitT + i * (Math.PI * 2 / 3);
            const dx = Math.cos(angle) * 90;
            const dy = Math.sin(angle) * 50;
            ctx.fillStyle = '#0ff';
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(canvas.width / 2 + dx, canvas.height / 2 + dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    // Border trace
    if (pb.phase === 'trace' || (pb.phase === 'panel_boot' && pb.timer < 0.5)) {
        const progress = Math.min(1, pb.traceProgress);
        const perimeterTotal = 2 * (canvas.width + canvas.height);

        // Easing function with corner pauses
        function borderTraceEase(t) {
            const seg = Math.floor(t * 4);
            const segT = (t * 4) - seg;
            const easedSegT = 1 - Math.pow(1 - segT, 2.5);
            return Math.min(1, (seg + easedSegT) / 4);
        }

        function getPerimeterPoint(dist) {
            dist = ((dist % perimeterTotal) + perimeterTotal) % perimeterTotal;
            if (dist < canvas.width) return { x: dist, y: 0 };
            dist -= canvas.width;
            if (dist < canvas.height) return { x: canvas.width, y: dist };
            dist -= canvas.height;
            if (dist < canvas.width) return { x: canvas.width - dist, y: canvas.height };
            dist -= canvas.width;
            return { x: 0, y: canvas.height - dist };
        }

        const distance = borderTraceEase(progress) * perimeterTotal;

        // Persistent border (already traced)
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const d = (i / steps) * distance;
            const pt = getPerimeterPoint(d);
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Trace dot
        if (progress < 1) {
            const pt = getPerimeterPoint(distance);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Trail
            for (let i = 1; i <= 8; i++) {
                const trailDist = distance - i * 5;
                if (trailDist < 0) continue;
                const tpt = getPerimeterPoint(trailDist);
                const alpha = 0.3 * (1 - i / 8);
                ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                ctx.fillRect(tpt.x - 1, tpt.y - 1, 2, 2);
            }
        }
    }

    // Post-boot text: "ALIEN QUANTUM OS IS NOW ONLINE"
    const totalBootTime = hudBootState.timer;
    if (totalBootTime >= hudBootState.duration - 1.0 && totalBootTime <= hudBootState.duration) {
        const postProgress = (totalBootTime - (hudBootState.duration - 1.0)) / 1.0;
        const text = 'ALIEN QUANTUM OS IS NOW ONLINE';
        const charsShown = Math.floor(postProgress * text.length * 2); // fast typewriter
        const visibleText = text.substring(0, Math.min(text.length, charsShown));

        // Trigger sound once
        if (postProgress < 0.05) {
            SFX.alienQuantumOnline();
        }

        const alpha = postProgress > 0.8 ? Math.max(0, 1 - (postProgress - 0.8) / 0.2) : 1.0;
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 6;
        ctx.fillText(visibleText, canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
    }

    // Original CRT flash (now only if no pre-boot)
    // REMOVED - replaced by the CRT turn-on above

    // Original "ALL SYSTEMS NOMINAL" - KEEP but adjust timing
    if (totalBootTime >= hudBootState.duration - 1.5 && totalBootTime <= hudBootState.duration - 0.5) {
        let allOnline = true;
        for (const [key, panel] of Object.entries(hudBootState.panels)) {
            if (panel.active && panel.phase !== 'online') {
                allOnline = false;
                break;
            }
        }
        if (allOnline) {
            const nomProgress = (totalBootTime - (hudBootState.duration - 1.5)) / 1.0;
            const alpha = nomProgress < 0.3 ? nomProgress / 0.3 :
                         nomProgress < 0.7 ? 1.0 :
                         1.0 - (nomProgress - 0.7) / 0.3;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 12;
            ctx.fillText('ALL SYSTEMS NOMINAL', 0, 0);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
}
```

**4. Modify `updateHUDBoot()` panel progression:**

When `preBootState.phase` is 'crt', 'logo', 'dissolve', or 'trace', panels do NOT progress (they wait for the trace to trigger them). Only when a panel's phase becomes 'booting' (triggered by the trace) does it start progressing. The existing progress calculation `progress = (elapsed - startTime) / duration` works if we set `startTime` relative to `hudBootState.timer` at trigger time.

Replace the panel start time logic to use the trace-triggered times:

```js
// In updateHUDBoot, when iterating panels:
// The trace already sets panel.phase = 'booting' and we should track when that happened.
// Add a _bootStartTimer to each panel when triggered:
if (panel.phase === 'booting') {
    if (!panel._bootStartTimer) panel._bootStartTimer = hudBootState.timer;
    const elapsed = hudBootState.timer - panel._bootStartTimer;
    panel.progress = Math.min(1, elapsed / panel.duration);
    // ... rest of existing progress handling ...
}
```

**Testing**:
- Wave start shows: black screen -> white line expanding -> logo with orbiting dots -> logo dissolves -> green border traces clockwise -> panels boot as trace passes -> "ALL SYSTEMS NOMINAL" -> "ALIEN QUANTUM OS IS NOW ONLINE" -> boot complete
- Four corner tones play (F#5 -> E5 -> C#5 -> A4) as trace rounds corners
- CRT turn-on sound plays at start
- Alien startup chime plays during logo
- Total boot time ~5.5s
- Pressing any key skips to boot complete

---

## SUMMARY: EXECUTION ORDER

| # | Chunk | Phase | Dependencies | Est. Lines Changed |
|---|-------|-------|-------------|-------------------|
| 1 | A1 | Infrastructure | None | ~40 |
| 2 | A2 | Infrastructure | None | ~80 |
| 3 | A3 | Infrastructure | None | ~250 |
| 4 | B1 | Scan Lines | A2 | ~100 |
| 5 | C1 | NRG.FLOW | A2 | ~150 |
| 6 | D1 | Health Freakout | A2, A3 | ~200 |
| 7 | E1 | DIAG.SYS | A2 | ~120 |
| 8 | F1 | Bio Upload | A2, A3 | ~120 |
| 9 | G1 | Tech Tree | A2 | ~250 |
| 10 | H1 | Boot Sequence | A2, A3 | ~250 |

**Total estimated new/changed lines: ~1,560**

---

## RISK REGISTER

| Risk | Mitigation |
|------|-----------|
| Line numbers shift after each chunk | Apply chunks sequentially. Each chunk references the function name, not just line numbers. |
| Panel overlap at small screens | Tech tree has gap-width guard (< 180px = hidden). DIAG.SYS has canvas.height guard (< 500px). |
| Performance budget exceeded | Worst-case new render cost ~2.9ms (well within 16.7ms budget). Health effects only active at low health. |
| Boot sequence too long | Skip-on-keypress preserved. Total time 5.5s (reasonable for wave transitions). |
| Sound clipping at maximum simultaneous gain | Danger warning Stage 3 capped at 0.15 (reduced from spec's 0.18). Boot chord layers are staggered. |
| renderSystemsZone() dynamic height breaks layout | getHUDLayout() still uses max 88px for fleet positioning. Only the visual panel shrinks. |
| TECH_TO_CHIP mapping mismatch | The existing TECH_TO_CHIP mapping at line ~14374 area is already verified in the code map. |

---

## CROSS-REFERENCE: SOUND-TO-VISUAL MAPPING

| Visual Feature | Sound Trigger | SFX Method |
|---------------|--------------|------------|
| CRT turn-on white flash | On flash start | `SFX.crtTurnOn()` |
| Logo appearance | On logo visible | `SFX.alienStartupChime()` |
| Border trace corners | As trace reaches corner | `SFX.borderTraceCorner(i)` |
| Post-boot text | On text start | `SFX.alienQuantumOnline()` |
| Health < 25% | Periodic | `SFX.healthWarning(1)` |
| Health < 15% | Periodic (faster) | `SFX.healthWarning(2)` |
| Health < 5% | Periodic (fastest) | `SFX.healthWarning(3)` |
| Health < 5% big jolt | On jolt frame | `SFX.structuralStress()` |
| Panel flicker | On flicker | `SFX.panelFlicker()` |
| Scan line glitch | On heavy glitch | `SFX.glitchBurst()` |
| Bio-matter collection | On biomatter++ | `SFX.bioMatterBlip()` |
| Upload tick | Per unit in upload | `SFX.uploadTick()` |
| Upload complete | On upload done | `SFX.uploadComplete()` |
| HUD spark | On spark spawn | `SFX.sparkCrackle()` |

---

*End of HUD Design Pass 2 Architecture*
