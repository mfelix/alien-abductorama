# Quantum Boot Overhaul — Implementation Plan

## Overview

Two major enhancements to the Alien OS boot/loading sequence:

1. **Logo Screen Pixelated Shader** — An animated pixelation/dithering/warp effect that sweeps left-to-right across the Alien Quantum OS logo screen
2. **BIOS Loading Sequence Enhancement** — Larger fonts, more scrolling text, Windows 1.0 style tech modals with ASCII box-drawing art, player session data enrichment

## Architecture

All changes are in `/js/game.js` (the monolith). The two features target different line ranges and can be developed in parallel:

- **Logo Shader**: Modifies lines ~18148-18317 (logo rendering in `renderHUDBootGlobalEffects()`)
- **BIOS Enhancements**: Modifies lines ~22794-23631 (BIOS boot init, update, and rendering functions)

---

## Feature 1: Logo Screen Quantum Materialization Shader

### Concept
A vertical "scan front" sweeps left-to-right across the logo screen. Ahead of the front, the image is heavily pixelated with ordered dithering. The front itself is a bright glowing line. Behind the front, the image resolves to full resolution with a subtle warp/ripple wake.

### Technical Approach
After all logo elements are rendered (hex grid, title text, orbits, corners), apply a post-processing shader using `getImageData`/`putImageData`:

1. **Pixelation**: Ahead of sweep — divide into 8x8 blocks, sample center pixel, fill block
2. **Ordered Dithering**: Apply Bayer 4x4 matrix to pixelated region for retro CRT feel
3. **Scan Front**: Bright cyan vertical line with glow (shadowBlur) at the sweep position
4. **Screen Warp**: Horizontal strip displacement using sine wave, strongest near sweep front
5. **Chromatic Aberration**: Slight RGB channel offset near the sweep front

### Insertion Point
After line 18314 (corner data readouts), before line 18316 (`ctx.restore()`). The shader processes the entire logo region as a post-effect.

### Animation Timeline
- Sweep progresses based on `pb.timer` during logo phase
- Wave 1: sweep takes ~0.8s (logo lasts 1.0s, sweep starts at 0.1s)
- Other waves: sweep takes ~0.4s (logo lasts 0.5s, sweep starts at 0.05s)
- The sweep should feel fast and aggressive, not gentle

### Key Parameters
```
Logo region: centerX ± 220, centerY ± 130 (440 x 260 px)
Block size: 8px (heavy pixelation) → 4px (medium) → 2px (light)
Bayer matrix: 4x4 ordered dither
Warp amplitude: 3-6px horizontal displacement
Warp frequency: 0.05 per pixel vertically
Chromatic offset: 2-4px RGB shift near front
Scan line glow: 20px shadowBlur, rgba(0, 255, 255, 0.8)
```

---

## Feature 2: BIOS Loading Sequence Enhancements

### 2a: Larger Font Sizes

**Current → New sizes:**
- Main BIOS text: `9px monospace` → `11px monospace`
- Bold headers: `bold 9px monospace` → `bold 12px monospace`
- Data/hex text: `7px monospace` → `9px monospace`
- Swarm table text: `9px monospace` → `11px monospace`
- System check text: `9px monospace` → `11px monospace`

**Line height adjustments:**
- Main text `lineH`: 12 → 15
- Swarm rows: 14 → 17
- System check rows: 14 → 17
- Data stream: 11 → 13
- Hex dump: 11 → 13

**Functions to modify:**
- `renderBiosBootSequence()` (line 23119)
- `renderBIOSSwarmTable()` (line 23306)
- `renderBIOSDownload()` (line 23352)
- `renderBIOSSystemCheck()` (line 23415)
- `renderBIOSDataStream()` (line 23457)
- `renderBIOSTechNetwork()` (line 23493)
- `renderBIOSDataStreamEnhanced()` (line 23565)

### 2b: More Scrolling Text + Player Data Enrichment

Add substantially more text lines to `initBiosBootSequence()` (line 22794):

**New POST lines:**
- Memory bank diagnostics with scrolling addresses
- Energy subsystem initialization with current energy level
- Drone bay scan with count of active drones
- Bio-matter conduit status with current BM stored
- Hull integrity percentage
- Score telemetry checkpoint

**New Orchestrator lines:**
- Session data dump (wave, score, energy, drones)
- Priority matrix calculation
- Resource allocation table

**More device scan lines:**
- Each scanned device gets verbose output
- I/O port assignments
- IRQ and DMA channel allocation (retro PC vibes)

### 2c: Windows 1.0 Style Tech Modals

For each researched technology, display a cascading modal window during the BIOS boot. These overlay the tech network pane (top-right).

**Window structure:**
```
╔══════════════════════════════╗
║ ■ BEAM CONDUIT [pg1]     ─ □║
╠══════════════════════════════╣
║                              ║
║  ┌─────┐    ┌─────┐         ║
║  │ UFO │───→│ DRN │         ║
║  └──┬──┘    └──┬──┘         ║
║     │          │             ║
║  FLOW: 847 MW  EFF: 98.2%   ║
║  STATUS: ACTIVE              ║
║                              ║
╚══════════════════════════════╝
```

**Cascading layout:**
- Each window offset 16px down and 12px right from previous
- Windows partially overlap (anxiety-inducing stack)
- Maximum ~5 visible windows before they wrap
- Each window 160-200px wide, 80-120px tall

**Content per tech category:**
- **Power Grid (pg1-5)**: Energy flow diagrams, efficiency readouts
- **Drone Command (dc1-5)**: Command hierarchy, slot allocation, sync status
- **Defense Network (dn1-5)**: Shield topology, armor ratings, field strength

**ASCII art per tech:**
Each tech modal contains a small ASCII schematic relevant to its function using box-drawing characters (─│┌┐└┘├┤┬┴┼╔╗╚╝║═).

**Animation:**
- Modals appear sequentially, one every ~100ms
- Each modal "opens" with a brief typewriter title bar, then content fills in
- Windows have subtle CRT flicker (random alpha jitter)

### 2d: ASCII Box-Drawing Art in BIOS

Enhance existing BIOS panes with proper box-drawing:
- Replace `---` separators with `═══` or `───`
- Add proper bordered sections using `╔═╗║╚═╝`
- Tech network tree uses proper tree characters: `├──`, `└──`, `│`

---

## Implementation Order

These can run in parallel since they target different line ranges:

### Parallel Track A: Logo Shader (lines ~18148-18317)
1. Add Bayer dither matrix constant near preBootState
2. Add pixelation/dithering/warp shader function
3. Insert shader call after logo rendering, before ctx.restore()

### Parallel Track B: BIOS Enhancements (lines ~22794-23631)
1. Increase font sizes in all BIOS render functions
2. Add more text lines and player data to initBiosBootSequence
3. Add Windows 1.0 tech modal rendering function
4. Integrate tech modals into renderBIOSTechNetwork or as overlay
5. Upgrade ASCII separators to box-drawing characters

---

## Risk Mitigation

- Both tracks edit different parts of game.js (~4500 lines apart)
- Logo shader is self-contained — no dependencies on BIOS code
- BIOS changes are additive — new functions + modified existing ones
- All changes are canvas 2D rendering — no game state mutations
