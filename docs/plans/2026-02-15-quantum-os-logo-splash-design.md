# Alien Quantum OS Logo Splash Design

**Date:** 2026-02-15
**Status:** Approved

## Overview

Add a brief (~1.4s) logo splash screen to the HUD boot sequence, inserted between the existing `dissolve` and `trace` phases. Displays the `assets/alien-quantum-os-logo.png` centered on canvas, plays a 3-note ascending crystalline chime, then dissolves the image (and full screen) using the existing Bayer dither left-to-right pixelation shader, ending with a white noise burst + white flash before fading to black and resuming the boot sequence.

## Phase Flow

### Before
```
crt → logo → dissolve → trace → panel_boot → inactive
```

### After
```
crt → logo → dissolve → logo_splash → logo_shader → logo_flash → trace → panel_boot → inactive
```

## New Phases

### `logo_splash` (~0.6s)
- Draw `alien-quantum-os-logo.png` centered on canvas
- Scale to ~60% of canvas width or native resolution, whichever is smaller
- Image fades in over ~0.15s (alpha ramp 0→1)
- Hold for ~0.2s
- Play ascending crystalline 3-note chime: three rising sine tones (C5→E5→G5, ~120ms apart) with slight reverb tail
- Hold ~0.25s while chime resonates
- Transition to `logo_shader`

### `logo_shader` (~0.5s)
- Reuse existing Bayer 4x4 ordered dither + left-to-right sweep algorithm
- Direction: dissolving (pixelation increases ahead of sweep front)
- Cyan scan line front sweeps left to right
- Full canvas affected (logo + black background)
- Same block size (6px), warp distortion, and scan front glow as existing shader

### `logo_flash` (~0.3s)
- At sweep completion: punchy white noise burst (~150ms, bandpass-filtered, sharp attack/exponential decay)
- Simultaneous white flash: canvas fills white at alpha 0.9, decays to 0 over ~120ms
- Fade to black over ~150ms
- Transition to existing `trace` phase

## Sound Design

### Continuity
- All existing boot sounds continue playing uninterrupted
- New sounds are additive layers

### New: Crystalline 3-Note Chime
- Three sine wave oscillators: C5 (523Hz) → E5 (659Hz) → G5 (784Hz)
- Each note ~120ms apart, 300ms duration with exponential decay tail
- Slight gain swell (0.001 → 0.08) per note
- Character: pure, ascending, "system achieving readiness"

### New: White Noise Snap
- Noise buffer through bandpass filter (~2000Hz center, Q=1.0)
- Duration: ~150ms
- Sharp attack, exponential decay (0.15 → 0.001)
- Character: punchy power-surge snap

## Image Loading

- Add `quantumOsLogo: 'assets/alien-quantum-os-logo.png'` to `imageSources` dictionary
- Preloads with all other game assets
- Referenced as `images.quantumOsLogo` during rendering

## Timing Budget

| Phase | Duration |
|-------|----------|
| logo_splash | ~0.6s |
| logo_shader | ~0.5s |
| logo_flash | ~0.3s |
| **Total** | **~1.4s** |

## Implementation Notes

- All new phase logic lives in `updateHUDBoot()` and `renderHUDBootGlobalEffects()` in `js/game.js`
- Shader reuses existing `BAYER4x4` matrix and pixelation algorithm from lines 18463-18569
- New SFX functions: `SFX.logoChime()` and `SFX.logoFlashNoise()` added to SFX object
- Phase transitions driven by `preBootState.timer` as with existing phases
