# Quantum OS Logo Splash Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a brief (~1.4s) logo splash screen between the existing `dissolve` and `trace` boot phases — displays `assets/alien-quantum-os-logo.png` centered, plays a 3-note crystalline chime, dissolves with the Bayer dither shader, flashes white with noise burst, fades to black.

**Architecture:** Three new `preBootState` phases (`logo_splash`, `logo_shader`, `logo_flash`) inserted between `dissolve` and `trace` in the existing boot state machine. Image preloaded via `imageSources`. Two new SFX functions. All changes in `js/game.js`.

**Tech Stack:** Vanilla JS, Canvas 2D, Web Audio API

---

### Task 1: Add logo image to preload system

**Files:**
- Modify: `js/game.js:4168-4176` (imageSources dictionary)

**Step 1: Add the logo to imageSources**

At `js/game.js:4175`, add the quantumOsLogo entry to the `imageSources` object:

```javascript
const imageSources = {
    ufo: 'assets/ufo.png',
    human: 'assets/human.png',
    cow: 'assets/cow.png',
    sheep: 'assets/sheep.png',
    cat: 'assets/cat.png',
    dog: 'assets/dog.png',
    tank: 'assets/tanks.png',
    quantumOsLogo: 'assets/alien-quantum-os-logo.png'
};
```

**Step 2: Verify image loads**

Open the game in browser, check console for no load errors. `images.quantumOsLogo` should be a loaded Image element.

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: preload Alien Quantum OS logo image"
```

---

### Task 2: Add two new SFX functions

**Files:**
- Modify: `js/game.js` — SFX object, after `borderTraceCorner` (around line 2244)

**Step 1: Add `SFX.logoChime()` — ascending crystalline 3-note sound**

Insert after the `borderTraceCorner` method (after line 2244):

```javascript
    // Boot: Ascending crystalline 3-note chime for logo splash
    logoChime: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const notes = [523, 659, 784]; // C5, E5, G5
        for (let i = 0; i < 3; i++) {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = notes[i];
            const start = t + i * 0.12;
            g.gain.setValueAtTime(0.001, start);
            g.gain.linearRampToValueAtTime(0.08, start + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(g);
            g.connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + 0.4);
            // Soft harmonic overtone for shimmer
            const harm = audioCtx.createOscillator();
            const hg = audioCtx.createGain();
            harm.type = 'sine';
            harm.frequency.value = notes[i] * 2;
            hg.gain.setValueAtTime(0.001, start + 0.01);
            hg.gain.linearRampToValueAtTime(0.025, start + 0.03);
            hg.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
            harm.connect(hg);
            hg.connect(audioCtx.destination);
            harm.start(start + 0.01);
            harm.stop(start + 0.35);
        }
    },
```

**Step 2: Add `SFX.logoFlashNoise()` — punchy white noise snap**

Insert right after `logoChime`:

```javascript
    // Boot: Sharp white noise snap for logo flash
    logoFlashNoise: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const bufLen = Math.floor(audioCtx.sampleRate * 0.15);
        const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 2000;
        bp.Q.value = 1.0;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        src.connect(bp);
        bp.connect(g);
        g.connect(audioCtx.destination);
        src.start(t);
        src.stop(t + 0.15);
    },
```

**Step 3: Test in browser**

Call `SFX.logoChime()` and `SFX.logoFlashNoise()` from the console to verify they sound correct.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: add logoChime and logoFlashNoise SFX for logo splash"
```

---

### Task 3: Add new preBootState phases and init flags

**Files:**
- Modify: `js/game.js:13955` (preBootState phase comment)
- Modify: `js/game.js:17631-17642` (initHUDBoot sound flags)

**Step 1: Update the phase comment to document new phases**

At line 13955, update the comment:

```javascript
    phase: 'inactive',       // 'inactive'|'crt'|'logo'|'dissolve'|'logo_splash'|'logo_shader'|'logo_flash'|'trace'|'panel_boot'|'post'
```

**Step 2: Add new init flags in `initHUDBoot()`**

At line 17642, after `preBootState._cornerSoundsPlayed = [false, false, false, false];`, add:

```javascript
    preBootState._logoChimePlayed = false;
    preBootState._logoFlashNoisePlayed = false;
    preBootState._logoSplashAlpha = 0;
    preBootState._logoShaderProgress = 0;
    preBootState._logoFlashAlpha = 0;
```

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: add logo splash phase flags to preBootState init"
```

---

### Task 4: Wire up phase transitions in `updateHUDBoot()`

**Files:**
- Modify: `js/game.js:17751-17757` (dissolve→trace transition)

**Step 1: Change dissolve to transition to `logo_splash` instead of `trace`**

Replace the `dissolve` phase block (lines 17751-17757):

```javascript
    } else if (preBoot.phase === 'dissolve') {
        preBoot.timer += dt;
        preBoot.logoAlpha = Math.max(0, 1 - preBoot.timer / 0.2);
        if (preBoot.timer >= 0.2) {
            preBoot.phase = 'dissolve';
            preBoot.timer = 0;
        }
```

With:

```javascript
    } else if (preBoot.phase === 'dissolve') {
        preBoot.timer += dt;
        preBoot.logoAlpha = Math.max(0, 1 - preBoot.timer / 0.2);
        if (preBoot.timer >= 0.2) {
            preBoot.phase = 'logo_splash';
            preBoot.timer = 0;
        }
```

**Step 2: Add `logo_splash` phase handler**

Insert after the dissolve block, before the `trace` block:

```javascript
    } else if (preBoot.phase === 'logo_splash') {
        preBoot.timer += dt;
        // Fade in over 0.15s
        preBoot._logoSplashAlpha = Math.min(1, preBoot.timer / 0.15);
        // Play chime at 0.15s (after fade-in)
        if (preBoot.timer >= 0.15 && !preBoot._logoChimePlayed) {
            preBoot._logoChimePlayed = true;
            SFX.logoChime();
        }
        // Hold for chime resonance, then transition at 0.6s
        if (preBoot.timer >= 0.6) {
            preBoot.phase = 'logo_shader';
            preBoot.timer = 0;
            preBoot._logoShaderProgress = 0;
        }
    } else if (preBoot.phase === 'logo_shader') {
        preBoot.timer += dt;
        preBoot._logoShaderProgress = Math.min(1, preBoot.timer / 0.5);
        if (preBoot.timer >= 0.5) {
            preBoot.phase = 'logo_flash';
            preBoot.timer = 0;
            preBoot._logoFlashAlpha = 1;
            // Play flash noise at transition
            if (!preBoot._logoFlashNoisePlayed) {
                preBoot._logoFlashNoisePlayed = true;
                SFX.logoFlashNoise();
            }
        }
    } else if (preBoot.phase === 'logo_flash') {
        preBoot.timer += dt;
        if (preBoot.timer < 0.12) {
            // White flash decays: 0.9 → 0 over 120ms
            preBoot._logoFlashAlpha = 0.9 * (1 - preBoot.timer / 0.12);
        } else {
            preBoot._logoFlashAlpha = 0;
        }
        // Fade to black over 150ms, then transition to trace at 0.3s
        if (preBoot.timer >= 0.3) {
            preBoot.phase = 'trace';
            preBoot.timer = 0;
        }
```

**Step 3: Test the full boot sequence**

Start a wave and verify the flow: CRT → Quantum OS logo → dissolve → logo PNG appears centered → chime plays → shader sweeps → white flash + noise → fades to black → border trace → panels boot.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: wire logo splash phase transitions in updateHUDBoot"
```

---

### Task 5: Add rendering for the three new phases

**Files:**
- Modify: `js/game.js:18572` (after the logo/dissolve render block's `ctx.restore()`, before the border trace block)

**Step 1: Add rendering for `logo_splash`, `logo_shader`, and `logo_flash`**

Insert after line 18572 (`ctx.restore();` closing the logo render block) and before line 18574 (`// Border trace`):

```javascript
    // Logo splash: PNG image centered on screen
    if (pb.phase === 'logo_splash' || pb.phase === 'logo_shader') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = images.quantumOsLogo;
        if (img && img.complete && img.naturalWidth > 0) {
            const maxW = canvas.width * 0.6;
            const scale = Math.min(1, maxW / img.naturalWidth);
            const drawW = img.naturalWidth * scale;
            const drawH = img.naturalHeight * scale;
            const drawX = (canvas.width - drawW) / 2;
            const drawY = (canvas.height - drawH) / 2;

            ctx.save();
            if (pb.phase === 'logo_splash') {
                ctx.globalAlpha = pb._logoSplashAlpha;
            }
            ctx.drawImage(img, drawX, drawY, drawW, drawH);

            // Apply Bayer dither shader during logo_shader phase
            if (pb.phase === 'logo_shader') {
                const shaderT = pb._logoShaderProgress;
                if (shaderT > 0 && shaderT < 1) {
                    const regionX = 0;
                    const regionY = 0;
                    const regionW = canvas.width;
                    const regionH = canvas.height;
                    const sweepLocalX = Math.floor(shaderT * regionW);
                    const imgData = ctx.getImageData(regionX, regionY, regionW, regionH);
                    const data = imgData.data;
                    const blockSize = 6;

                    // Pixelate area BEHIND sweep (left of sweep front = already dissolved)
                    for (let by = 0; by < regionH; by += blockSize) {
                        for (let bx = 0; bx < sweepLocalX; bx += blockSize) {
                            const dist = (sweepLocalX - bx) / (sweepLocalX + 1);
                            const effectiveBlock = Math.max(2, Math.floor(blockSize + dist * 6));
                            const sx = Math.min(bx + (effectiveBlock >> 1), regionW - 1);
                            const sy = Math.min(by + (effectiveBlock >> 1), regionH - 1);
                            const si = (sy * regionW + sx) * 4;
                            const sr = data[si], sg = data[si + 1], sb = data[si + 2];

                            const endBx = Math.min(bx + effectiveBlock, regionW);
                            const endBy = Math.min(by + effectiveBlock, regionH);
                            for (let py = by; py < endBy; py++) {
                                for (let px = bx; px < endBx; px++) {
                                    const di = (py * regionW + px) * 4;
                                    const bayerVal = BAYER4x4[py & 3][px & 3] / 16;
                                    const quantize = 32;
                                    const dr = Math.floor(sr / quantize) * quantize;
                                    const dg = Math.floor(sg / quantize) * quantize;
                                    const db = Math.floor(sb / quantize) * quantize;
                                    data[di]     = Math.min(255, dr + ((sr % quantize) / quantize > bayerVal ? quantize : 0));
                                    data[di + 1] = Math.min(255, dg + ((sg % quantize) / quantize > bayerVal ? quantize : 0));
                                    data[di + 2] = Math.min(255, db + ((sb % quantize) / quantize > bayerVal ? quantize : 0));
                                }
                            }
                        }
                    }

                    // Pixelate area AHEAD of sweep (right of front = being reached)
                    const aheadRange = Math.min(Math.floor(regionW * 0.15), regionW - sweepLocalX);
                    for (let by = 0; by < regionH; by += blockSize) {
                        for (let bx = sweepLocalX; bx < sweepLocalX + aheadRange; bx += blockSize) {
                            const dist = (bx - sweepLocalX) / (aheadRange + 1);
                            const effectiveBlock = Math.max(2, Math.floor(2 + dist * 4));
                            const sx = Math.min(bx + (effectiveBlock >> 1), regionW - 1);
                            const sy = Math.min(by + (effectiveBlock >> 1), regionH - 1);
                            const si = (sy * regionW + sx) * 4;
                            const sr = data[si], sg = data[si + 1], sb = data[si + 2];

                            const endBx = Math.min(bx + effectiveBlock, regionW);
                            const endBy = Math.min(by + effectiveBlock, regionH);
                            for (let py = by; py < endBy; py++) {
                                for (let px = bx; px < endBx; px++) {
                                    const di = (py * regionW + px) * 4;
                                    const bayerVal = BAYER4x4[py & 3][px & 3] / 16;
                                    const quantize = 32;
                                    const dr = Math.floor(sr / quantize) * quantize;
                                    const dg = Math.floor(sg / quantize) * quantize;
                                    const db = Math.floor(sb / quantize) * quantize;
                                    data[di]     = Math.min(255, dr + ((sr % quantize) / quantize > bayerVal ? quantize : 0));
                                    data[di + 1] = Math.min(255, dg + ((sg % quantize) / quantize > bayerVal ? quantize : 0));
                                    data[di + 2] = Math.min(255, db + ((sb % quantize) / quantize > bayerVal ? quantize : 0));
                                }
                            }
                        }
                    }

                    ctx.putImageData(imgData, regionX, regionY);

                    // Screen warp near sweep front
                    const warpAmplitude = 5;
                    const stripH = 2;
                    const frontX = sweepLocalX;
                    const now = Date.now();
                    for (let wy = 0; wy < regionH; wy += stripH) {
                        const verticalFalloff = Math.max(0, 1 - Math.abs(wy - regionH * 0.5) / (regionH * 0.5));
                        const warpShift = Math.sin(wy * 0.08 + now * 0.003) * warpAmplitude * verticalFalloff * (1 - shaderT);
                        const shift = Math.round(warpShift);
                        if (shift !== 0) {
                            const srcX = Math.max(0, frontX - 80);
                            const srcW = Math.min(160, canvas.width - srcX);
                            const clampedH = Math.min(stripH, canvas.height - wy);
                            ctx.drawImage(canvas, srcX, wy, srcW, clampedH, srcX + shift, wy, srcW, clampedH);
                        }
                    }

                    // Cyan scan front line
                    ctx.save();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
                    ctx.shadowColor = '#0ff';
                    ctx.shadowBlur = 20;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(frontX, 0);
                    ctx.lineTo(frontX, canvas.height);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                    ctx.shadowBlur = 40;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(frontX - 4, 0);
                    ctx.lineTo(frontX - 4, canvas.height);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.restore();
                }
            }
            ctx.restore();
        }
    }

    // Logo flash: white burst then fade to black
    if (pb.phase === 'logo_flash') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (pb._logoFlashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pb._logoFlashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
```

**Step 2: Test the full boot sequence visually**

Start a wave and verify:
1. After the Quantum OS text dissolves, the PNG logo appears centered with a quick fade-in
2. The 3-note crystalline chime plays
3. The Bayer dither shader sweeps left-to-right across the full screen, dissolving the logo
4. A white flash + noise snap fires at the end
5. Screen fades to black
6. Border trace begins normally

**Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: render logo splash, shader dissolution, and white flash"
```

---

### Task 6: Fine-tune and verify end-to-end

**Files:**
- Modify: `js/game.js` (timing adjustments if needed)

**Step 1: Play through the full boot sequence on wave 1 and wave 2+**

Check:
- Wave 1: existing alienStartupChime still plays and overlaps naturally with the new logo splash
- Wave 2+: shorter timings still feel right
- No visual glitches at phase boundaries (no frame of wrong background color, no flicker)
- Sound layering feels natural — existing chime tail + new chime don't clash

**Step 2: Adjust timings if needed**

Key timing knobs:
- `logo_splash` duration: 0.6s (line in updateHUDBoot `logo_splash` block, `>= 0.6`)
- `logo_shader` duration: 0.5s (line in updateHUDBoot `logo_shader` block, `/ 0.5`)
- `logo_flash` total: 0.3s; white decay: 0.12s
- Chime trigger: 0.15s into `logo_splash`

**Step 3: Commit final adjustments**

```bash
git add js/game.js
git commit -m "fix: fine-tune logo splash timing and visual polish"
```
