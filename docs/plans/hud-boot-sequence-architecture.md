# HUD Boot Sequence - Architecture Plan

## Overview

Add an EVA/anime-inspired boot-up sequence to the HUD that plays each time a new wave begins. The HUD panels power on in staggered order with scrolling diagnostic text, progress bars, and system-check readouts. The boot sequence is technology-aware: panels only boot if their system is currently unlocked, and the boot text reflects the current loadout.

The player can still move and play during the boot sequence -- it is purely cosmetic overlay on the HUD panels.

## Codebase Reference Points

| What | Where (line) | Notes |
|------|-------------|-------|
| `hudAnimState` global init | 12235 | Current HUD animation state object |
| `hudAnimState` reset in `startGame()` | 11693 | Full reset on new game |
| `renderHUDFrame()` | 12415-12522 | Main HUD render dispatch |
| `getHUDLayout()` | 12327-12342 | Returns zone rects |
| Zone renderers | 12532, 12640, 12783, 12874, 13086, 13264 | Status, Mission, Systems, Weapons, Fleet, Commander |
| `updateHUDAnimations(dt)` | 13421-13438 | Called from `update()` at 19467 |
| `renderNGEPanel()` | 11782 | Angular panel primitive |
| `renderNGEDataStream()` | 12141 | Scrolling hex data effect |
| `renderNGEScanlines()` | 12103 | CRT scanline overlay |
| `renderNGEBar()` | 11969 | Segmented progress bar |
| `renderNGEBlinkLight()` | 12180 | Blinking status LED |
| `renderNGEChevrons()` | 12164 | Scrolling chevron animation |
| `easeOutCubic()` | 12524 | Existing easing function |
| `startGame()` | 11616-11775 | Game initialization (wave 1) |
| `updateWaveTransition()` | 17356-17380 | Sets `gameState = 'PLAYING'` at 17369 |
| `gameLoop()` switch | 19357-19400 | State machine dispatch |
| `update(dt)` | 19405 | Main update, calls `updateHUDAnimations` at 19467 |
| `render()` | 19620 | Main render, calls `renderHUDFrame()` at 19675 |
| `SFX` object | 621-1900 | All sound effect generators |
| Tech state variables | 11747-11763 | `missileUnlocked`, `harvesterUnlocked`, `battleDroneUnlocked`, `droneSlots`, etc. |
| Panel slide animations | 12424-12510 | Weapons/Fleet/Commander slide-in logic inside `renderHUDFrame()` |
| `CONFIG.WAVE_TRANSITION_DURATION` | 61 | Currently 3 seconds |

## Architecture

### 1. Boot State Data Structure

Add a new global `hudBootState` object (declare near `hudAnimState` at ~line 12246):

```js
let hudBootState = {
    phase: 'idle',       // 'idle' | 'booting' | 'complete'
    timer: 0,            // total elapsed time since boot started
    duration: 3.5,       // total boot duration in seconds

    // Per-panel boot state -- only panels that are relevant get booted
    panels: {
        status:    { active: false, startTime: 0.0,  duration: 1.2, progress: 0, phase: 'waiting' },
        mission:   { active: false, startTime: 0.15, duration: 1.0, progress: 0, phase: 'waiting' },
        systems:   { active: false, startTime: 0.3,  duration: 1.0, progress: 0, phase: 'waiting' },
        weapons:   { active: false, startTime: 0.6,  duration: 1.4, progress: 0, phase: 'waiting' },
        fleet:     { active: false, startTime: 0.9,  duration: 1.4, progress: 0, phase: 'waiting' },
        commander: { active: false, startTime: 1.2,  duration: 1.0, progress: 0, phase: 'waiting' }
    },
    // panel.phase: 'waiting' -> 'booting' -> 'online'

    // Snapshot of what tech is available at boot time
    // (so boot text generators know what to display)
    techSnapshot: {
        hasBombs: false,
        hasMissiles: false,
        missileGroupCount: 0,
        hasHarvesters: false,
        hasBattleDrones: false,
        droneSlots: 0,
        hasCoordinators: false,
        wave: 1,
        quotaTarget: 0,
        maxHealth: 0,
        hasEnergyCells: false,
        techResearched: []   // list of researched tech names
    },

    // Boot text lines per panel (generated at boot start)
    bootLines: {
        status: [],
        mission: [],
        systems: [],
        weapons: [],
        fleet: [],
        commander: []
    }
};
```

### 2. Boot Sequence Flow

#### 2a. Trigger Points

The boot sequence triggers in TWO places:

1. **Wave 1 start**: In `startGame()` (line ~11774, just before `initTutorial()`):
   ```js
   initHUDBoot();
   initTutorial();
   ```

2. **Later wave starts**: In `updateWaveTransition()` (line ~17369, when `gameState` becomes `PLAYING`):
   ```js
   gameState = 'PLAYING';
   initHUDBoot();
   ```

#### 2b. Init Function

```js
function initHUDBoot() {
    hudBootState.phase = 'booting';
    hudBootState.timer = 0;

    // Snapshot current tech state
    hudBootState.techSnapshot = {
        hasBombs: playerInventory.maxBombs > 0,
        hasMissiles: missileUnlocked,
        missileGroupCount: missileGroupCount,
        hasHarvesters: harvesterUnlocked,
        hasBattleDrones: battleDroneUnlocked,
        droneSlots: droneSlots,
        hasCoordinators: activeCoordinators.length > 0,
        wave: wave,
        quotaTarget: quotaTarget,
        maxHealth: CONFIG.UFO_START_HEALTH,
        hasEnergyCells: playerInventory.energyCells > 0,
        techResearched: [...techTree.researched]
    };

    // Activate relevant panels
    const p = hudBootState.panels;
    p.status.active = true;     // always
    p.mission.active = true;    // always
    p.systems.active = true;    // always

    const hasWeapons = hudBootState.techSnapshot.hasBombs || hudBootState.techSnapshot.hasMissiles;
    p.weapons.active = hasWeapons;

    const hasFleet = hudBootState.techSnapshot.hasHarvesters || hudBootState.techSnapshot.hasBattleDrones || hudBootState.techSnapshot.hasCoordinators;
    p.fleet.active = hasFleet;

    p.commander.active = wave >= 2;  // commander only appears wave 2+

    // Reset all panel states
    for (const key of Object.keys(p)) {
        p[key].progress = 0;
        p[key].phase = 'waiting';
    }

    // Generate boot text lines for each active panel
    generateBootLines();

    // Reset panel slide animations to 0 so they re-slide during boot
    hudAnimState.weaponsPanelSlide = 0;
    hudAnimState.fleetPanelSlide = 0;
    hudAnimState.commanderPanelSlide = 0;
    // Keep visibility flags as they are -- renderHUDFrame checks them
}
```

#### 2c. Update Logic

Add to `updateHUDAnimations(dt)` (at line ~13437, before the closing brace):

```js
// Update boot sequence
if (hudBootState.phase === 'booting') {
    updateHUDBoot(dt);
}
```

The `updateHUDBoot(dt)` function:

```js
function updateHUDBoot(dt) {
    hudBootState.timer += dt;

    const p = hudBootState.panels;
    for (const [key, panel] of Object.entries(p)) {
        if (!panel.active) continue;

        const elapsed = hudBootState.timer - panel.startTime;
        if (elapsed < 0) continue;  // not started yet

        if (panel.phase === 'waiting') {
            panel.phase = 'booting';
            // Play boot blip sound for this panel
            SFX.bootPanelStart && SFX.bootPanelStart();
        }

        panel.progress = Math.min(1, elapsed / panel.duration);

        if (panel.progress >= 1 && panel.phase === 'booting') {
            panel.phase = 'online';
            SFX.bootPanelOnline && SFX.bootPanelOnline();
        }
    }

    if (hudBootState.timer >= hudBootState.duration) {
        hudBootState.phase = 'complete';
    }
}
```

### 3. Rendering Integration

**Key Design Decision: Overlay approach, not replacement.**

The boot sequence renders ON TOP of the normal panel rendering, not instead of it. This means:
- Normal `renderHUDFrame()` runs as usual (panels render underneath)
- After `renderHUDFrame()` completes, `renderHUDBootOverlay()` draws on top
- During boot, the overlay obscures the panel content with dark fill + scrolling boot text
- As each panel completes, its overlay fades out revealing the real panel underneath

This approach was chosen because:
1. No modifications needed to any existing zone renderer functions
2. The existing panel slide animations naturally play during boot (weapons, fleet slide in)
3. Easy to remove -- just delete the overlay code
4. The "reveal" transition (overlay fading out) is visually satisfying

#### 3a. Integration in `render()` (line 19675)

```js
// Render UI (not affected by shake) - NGE Evangelion HUD
renderHUDFrame();

// Boot sequence overlay
if (hudBootState.phase === 'booting') {
    renderHUDBootOverlay();
}
```

#### 3b. Boot Overlay Renderer

```js
function renderHUDBootOverlay() {
    const layout = getHUDLayout();

    const panelZoneMap = {
        status:    { zone: layout.statusZone,    h: 120, color: '#0ff', label: 'SYS.STATUS' },
        mission:   { zone: layout.missionZone,   h: 110, color: '#0a0', label: 'MISSION.CTL' },
        systems:   { zone: layout.systemsZone,   h: 88,  color: '#f80', label: 'SYS.INTG' },
        weapons:   { zone: layout.weaponsZone,   h: 200, color: '#f44', label: 'ORD.SYS' },
        fleet:     { zone: layout.fleetZone,     h: 300, color: '#48f', label: 'FLEET.CMD' },
        commander: { zone: layout.commanderZone, h: 100, color: '#0f0', label: 'COMMS.SYS' }
    };

    for (const [key, panel] of Object.entries(hudBootState.panels)) {
        if (!panel.active) continue;
        if (panel.phase === 'waiting' || panel.phase === 'booting') {
            const mapping = panelZoneMap[key];
            if (!mapping) continue;
            renderPanelBootOverlay(mapping.zone, mapping.h, mapping.color, mapping.label, panel, hudBootState.bootLines[key]);
        }
        // When phase === 'online', don't render overlay (panel is revealed)
    }
}
```

#### 3c. Per-Panel Boot Overlay

```js
function renderPanelBootOverlay(zone, h, color, label, panelState, bootLines) {
    const { x, y, w } = zone;
    const progress = panelState.progress;

    ctx.save();

    // Handle slide offset for weapons/fleet panels
    // (weapons slides from left, fleet from right)
    // NOTE: The overlay should match the panel's current slide position.
    // Since we render after renderHUDFrame, we need to compute the same offset.
    // This is handled by the caller applying the same transform.

    // Dark background (obscures the real panel content)
    const bgAlpha = panelState.phase === 'booting' ?
        Math.max(0, 0.85 - progress * 0.3) : 0.85;
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.fillRect(x, y, w, h);

    // Panel border (same as the real panel, but dimmer during early boot)
    const borderAlpha = 0.3 + progress * 0.4;
    ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${borderAlpha})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Boot text: scrolling diagnostic lines
    ctx.beginPath();
    ctx.rect(x + 2, y + 2, w - 4, h - 4);
    ctx.clip();

    const lineH = 11;
    const visibleLines = Math.floor(progress * bootLines.length);
    const textStartY = y + 14;

    ctx.font = '9px monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= visibleLines && i < bootLines.length; i++) {
        const lineAlpha = i === visibleLines ?
            (progress * bootLines.length - i) : // partial fade-in for current line
            Math.min(1, 0.4 + (i / bootLines.length) * 0.3);

        const line = bootLines[i];
        const ly = textStartY + i * lineH;

        if (ly > y + h - 4) break; // clip

        // Determine line color based on content
        if (line.startsWith('[OK]') || line.startsWith('[ONLINE]')) {
            ctx.fillStyle = `rgba(0, 255, 100, ${lineAlpha})`;
        } else if (line.startsWith('[WARN]') || line.startsWith('[SKIP]')) {
            ctx.fillStyle = `rgba(255, 200, 0, ${lineAlpha})`;
        } else if (line.startsWith('[FAIL]')) {
            ctx.fillStyle = `rgba(255, 50, 50, ${lineAlpha})`;
        } else if (line.startsWith('>>')) {
            ctx.fillStyle = `rgba(${hexToRgb(color)}, ${lineAlpha})`;
        } else {
            ctx.fillStyle = `rgba(180, 200, 220, ${lineAlpha * 0.7})`;
        }

        ctx.fillText(line, x + 4, ly);
    }

    // Progress bar at bottom of panel
    const barY = y + h - 6;
    const barW = w - 8;
    const barH = 3;
    ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.3)`;
    ctx.fillRect(x + 4, barY, barW, barH);
    ctx.fillStyle = color;
    ctx.fillRect(x + 4, barY, barW * progress, barH);

    // Scanline effect over the boot overlay
    for (let sy = y; sy < y + h; sy += 3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(x, sy, w, 1);
    }

    ctx.restore();
}
```

#### 3d. Handling Panel Slide Offsets During Boot

The weapons and fleet panels slide in with transforms applied in `renderHUDFrame()`. The boot overlay needs to match these slide positions. There are two approaches:

**Approach chosen: Render boot overlay INSIDE `renderHUDFrame()`, right after each panel renders, while the ctx.translate is still active.**

This means instead of a separate `renderHUDBootOverlay()` called after `renderHUDFrame()`, we inject overlay calls within `renderHUDFrame()` itself. This is cleaner because the slide transforms are already applied.

Modifications to `renderHUDFrame()` (line 12415):

```js
function renderHUDFrame() {
    const layout = getHUDLayout();
    const booting = hudBootState.phase === 'booting';

    // Always render these zones
    renderStatusZone(layout.statusZone);
    if (booting) renderPanelBootOverlay(layout.statusZone, 120, '#0ff', 'SYS.STATUS', hudBootState.panels.status, hudBootState.bootLines.status);

    renderMissionZone(layout.missionZone);
    if (booting) renderPanelBootOverlay(layout.missionZone, 110, '#0a0', 'MISSION.CTL', hudBootState.panels.mission, hudBootState.bootLines.mission);

    renderSystemsZone(layout.systemsZone);
    if (booting) renderPanelBootOverlay(layout.systemsZone, 88, '#f80', 'SYS.INTG', hudBootState.panels.systems, hudBootState.bootLines.systems);

    // Weapons zone: slide in when weapons are unlocked
    // ... existing slide code ...
    // INSIDE the ctx.save/restore block, after renderWeaponsZone:
    if (booting && hudBootState.panels.weapons.active) {
        renderPanelBootOverlay(layout.weaponsZone, layout.weaponsZone.h, '#f44', 'ORD.SYS', hudBootState.panels.weapons, hudBootState.bootLines.weapons);
    }

    // Fleet zone: similar injection inside the slide transform
    // Commander zone: similar injection inside the slide transform

    // ... rest unchanged ...
}
```

### 4. Boot Text Generation

The `generateBootLines()` function creates contextual diagnostic text for each panel based on the tech snapshot. This is the most creative/fun part.

```js
function generateBootLines() {
    const snap = hudBootState.techSnapshot;
    const lines = hudBootState.bootLines;

    // STATUS panel
    lines.status = [
        `>> INIT SYS.STATUS v${snap.wave}.0`,
        `WAVE ${snap.wave} DEPLOYMENT`,
        `[OK] SCORE TELEMETRY ONLINE`,
        `[OK] COMBO TRACKER LINKED`,
        snap.techResearched.length > 0 ?
            `[OK] BIO.MATTER MONITOR (${snap.techResearched.length} TECH)` :
            `[OK] BIO.MATTER MONITOR`,
        `>> STATUS NOMINAL`
    ];

    // MISSION panel
    lines.mission = [
        `>> INIT MISSION.CTL`,
        `TARGET QUOTA: ${snap.quotaTarget}`,
        `[OK] HARVEST SENSORS CALIBRATED`,
        `[OK] QUOTA TRACKING ACTIVE`,
        `>> MISSION PARAMETERS SET`
    ];

    // SYSTEMS panel
    lines.systems = [
        `>> INIT SYS.INTEGRITY`,
        `HULL: ${snap.maxHealth} HP`,
        snap.hasEnergyCells ? `[OK] REVIVE CELLS: CHARGED` : `[SKIP] NO REVIVE CELLS`,
        `[OK] SHIELD MONITOR ONLINE`,
        `>> INTEGRITY CHECK PASS`
    ];

    // WEAPONS panel (if active)
    if (hudBootState.panels.weapons.active) {
        lines.weapons = [`>> INIT ORD.SYS`];
        if (snap.hasBombs) {
            lines.weapons.push(`[OK] ORD.BOMB ARMED`);
        }
        if (snap.hasMissiles) {
            lines.weapons.push(`[OK] MISSILE GROUPS: ${snap.missileGroupCount}`);
            lines.weapons.push(`LOADING SALVO PATTERNS...`);
        }
        lines.weapons.push(`[OK] ORDNANCE SYSTEMS HOT`);
        lines.weapons.push(`>> WEAPONS FREE`);
    }

    // FLEET panel (if active)
    if (hudBootState.panels.fleet.active) {
        lines.fleet = [`>> INIT FLEET.CMD`];
        lines.fleet.push(`DRONE SLOTS: ${snap.droneSlots}`);
        if (snap.hasHarvesters) lines.fleet.push(`[OK] HARVESTER UPLINK`);
        if (snap.hasBattleDrones) lines.fleet.push(`[OK] BATTLE DRONE UPLINK`);
        if (snap.hasCoordinators) lines.fleet.push(`[OK] COORDINATOR NET`);
        lines.fleet.push(`[OK] FLEET TELEMETRY`);
        lines.fleet.push(`>> FLEET STANDING BY`);
    }

    // COMMANDER panel (if active)
    if (hudBootState.panels.commander.active) {
        lines.commander = [
            `>> INIT COMMS.SYS`,
            `FREQ: 147.30 MHz`,
            `[OK] ENCRYPTION HANDSHAKE`,
            `[OK] COMMANDER LINK`,
            `>> AWAITING TRANSMISSION`
        ];
    }
}
```

### 5. Sound Effects

Add two new SFX to the `SFX` object:

```js
bootPanelStart: () => {
    // Short blip when a panel starts booting -- like a CRT power-on click
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
},

bootPanelOnline: () => {
    // Rising chirp when a panel finishes booting
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
},
```

## Implementation Chunks

### Chunk A: Boot State Machine + Initialization + Update Loop

**Scope**: New code only, minimal conflict risk.

**Functions to ADD** (insert between `updateHUDAnimations` at line 13438 and `renderBackground` at line 13444):
- `initHUDBoot()` -- initializes boot state, takes tech snapshot, generates boot text
- `updateHUDBoot(dt)` -- advances timers, transitions panel phases
- `generateBootLines()` -- creates per-panel diagnostic text arrays

**Variables to ADD** (insert after `hudAnimState` declaration at line 12246):
- `hudBootState` -- the boot state object

**Existing functions to MODIFY**:
- `startGame()` at line 11774: Add `initHUDBoot();` call before `initTutorial();`
- `updateWaveTransition()` at line 17369: Add `initHUDBoot();` call after `gameState = 'PLAYING';`
- `updateHUDAnimations(dt)` at line 13437: Add `if (hudBootState.phase === 'booting') updateHUDBoot(dt);`

**Dependencies**: None. This chunk can be built first.

**What NOT to touch**: Do not modify any render functions. Do not modify `renderHUDFrame`. Do not touch zone renderers.

### Chunk B: Boot Rendering (Panel Overlays)

**Scope**: New rendering functions + modifications to `renderHUDFrame`.

**Functions to ADD** (insert near the boot state machine code, after Chunk A's functions):
- `renderPanelBootOverlay(zone, h, color, label, panelState, bootLines)` -- renders the dark overlay with scrolling text and progress bar for one panel

**Existing functions to MODIFY**:
- `renderHUDFrame()` at lines 12415-12522: Add overlay calls after each zone render, inside the existing slide transform blocks where applicable

Specific insertion points in `renderHUDFrame()`:
1. After `renderStatusZone(layout.statusZone)` (line 12419): add boot overlay for status
2. After `renderMissionZone(layout.missionZone)` (line 12420): add boot overlay for mission
3. After `renderSystemsZone(layout.systemsZone)` (line 12421): add boot overlay for systems
4. Inside weapons slide block (line 12436, after `renderWeaponsZone`): add boot overlay for weapons
5. Inside fleet slide block (line 12485, after `renderFleetZone`): add boot overlay for fleet
6. Inside commander slide block (line 12497, after `renderCommanderZone`): add boot overlay for commander

**Dependencies**: Requires Chunk A's `hudBootState` variable to exist. Can be built in parallel if `hudBootState` is defined first.

**What NOT to touch**: Do not modify zone renderer functions (renderStatusZone, etc.). Do not modify update logic. Do not touch the game state machine.

### Chunk C: Sound Design + Boot Text Polish

**Scope**: New SFX entries + enriched boot text generation.

**SFX to ADD** (inside the `SFX` object, after `dronePreExplode` at ~line 1857):
- `bootPanelStart` -- CRT click/blip
- `bootPanelOnline` -- rising chirp

**Functions to MODIFY**:
- `generateBootLines()` (from Chunk A) -- can be enriched with more creative text, randomized lines, technology-specific messages

**Dependencies**: Requires Chunk A's `generateBootLines` and `updateHUDBoot` (which calls the SFX). Can be done in parallel if the SFX function names are agreed upon.

**What NOT to touch**: Do not modify any render functions. Do not touch game state machine.

## Key Design Decisions

### 1. Overlay, not replacement
Boot rendering is an overlay on top of normal panel rendering. Normal panels render underneath (including their slide animations). The overlay draws a dark background + boot text. When a panel goes 'online', its overlay stops rendering and the real panel is revealed.

**Rationale**: Zero modifications to zone renderer functions. Existing slide animations play naturally. Easy to remove.

### 2. Wave 1 vs. Later Waves
- Wave 1: Only status, mission, and systems panels boot (no weapons/fleet/commander yet)
- Later waves: All unlocked panels boot, showing the player's current loadout
- The boot sequence is identical in structure for all waves; only the text content differs

### 3. Gameplay During Boot
The player can move and play immediately. The boot is purely visual -- it does not block input or freeze the game. The `update(dt)` function runs normally throughout. The boot overlay is cosmetic only.

### 4. Boot Duration
Total: ~3.5 seconds. Panels stagger from 0.0s to 1.2s start times, each taking 1.0-1.4 seconds to complete. The last panel finishes around 2.6s. A brief "all systems online" moment at ~3.0s, then `phase` goes to `'complete'` at 3.5s and overlays are gone.

### 5. Panel Slide + Boot Interaction
Weapons and fleet panels slide in via existing `weaponsPanelSlide` / `fleetPanelSlide` animations. The boot overlay is rendered INSIDE the same `ctx.save/translate/restore` block, so it slides with the panel. The `initHUDBoot()` function resets slide values to 0 so the panels re-slide during boot (giving a "powering on and sliding in" effect).

## File Summary

All changes are in a single file: **`/Users/mfelix/code/alien-abductorama/js/game.js`**

| Line Range | Change Type | Chunk |
|-----------|-------------|-------|
| ~1857 | Add 2 SFX entries | C |
| ~11774 | Add `initHUDBoot()` call in `startGame()` | A |
| ~12246 | Add `hudBootState` variable | A |
| ~12419-12510 | Inject boot overlay calls in `renderHUDFrame()` | B |
| ~13438 | Add boot update call in `updateHUDAnimations()` | A |
| ~13439+ | Add new functions: `initHUDBoot`, `updateHUDBoot`, `generateBootLines`, `renderPanelBootOverlay` | A, B |
| ~17369 | Add `initHUDBoot()` call in `updateWaveTransition()` | A |
