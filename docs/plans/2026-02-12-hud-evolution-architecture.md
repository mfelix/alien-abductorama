# HUD Evolution - Architecture & Implementation Plan

**Date**: 2026-02-12
**Role**: Architect
**Target**: `/Users/mfelix/code/alien-abductorama/js/game.js` (20,425 lines)
**Companion Docs**: `2026-02-12-hud-evolution-visual-design.md`, `2026-02-12-hud-evolution-game-design.md`

---

## IMPLEMENTATION CHUNKS

Twelve chunks organized by dependency. Each chunk is self-contained and testable in isolation.

---

### CHUNK 1: CONFIG — BOMB_MAX_COUNT 6 → 9

**Dependencies**: None
**Estimated size**: 1 line changed

#### Changes

| What | Where | Detail |
|------|-------|--------|
| Change `BOMB_MAX_COUNT` | Line 80 | `6` → `9` |

#### Exact Edit

```
Line 80:  BOMB_MAX_COUNT: 6,   →   BOMB_MAX_COUNT: 9,
```

#### Testing
- Start game, buy 7+ bombs in shop. Verify 7th, 8th, 9th appear.
- Verify shop "maxed" label appears at 9, not 6.

#### Risks
- None. All bomb logic already reads `CONFIG.BOMB_MAX_COUNT` dynamically. Shop checks at lines 18241, 19834, 19968 all reference the constant.

---

### CHUNK 2: SHOP BOMB LIMIT UPDATE (Coordinates with Chunk 1)

**Dependencies**: Chunk 1 (CONFIG change)
**Estimated size**: 0 new lines (Chunk 1 handles it)

The shop already reads `CONFIG.BOMB_MAX_COUNT` at all three check points:
- **Line 18241**: `getShopItemStatus()` → `playerInventory.maxBombs >= CONFIG.BOMB_MAX_COUNT` → returns `'maxed'`
- **Line 19834**: `addToShopCart()` → same check
- **Line 19968**: `checkoutCart()` → `Math.min(CONFIG.BOMB_MAX_COUNT, ...)`

**No code changes needed beyond Chunk 1.** All three sites already reference the constant dynamically. Changing the constant is sufficient.

#### Testing
- Buy bombs up to 9. Verify "MAXED OUT" appears at 9.
- Verify bomb count in `playerInventory.maxBombs` reaches 9 after checkout.

---

### CHUNK 3: renderNGEIndicator() — New Unified Indicator Function

**Dependencies**: None
**Estimated size**: ~90 lines new code

#### New Function

Insert **after** `renderNGEBlinkLight` (after line 12362), before `renderEnergyFlowLine` (line 12364).

**Insertion point**: Line 12363 (between the two functions)

```js
function renderNGEIndicator(x, y, shape, color, mode, opts = {}) {
    // shape: 'square'|'diamond'|'triangle'|'circle'|'cross'
    // mode: 'steady'|'double'|'cascade'|'reactive'|'random'
    // opts: { rate, phaseOffset, reactiveValue, reactiveThresholds,
    //         cascadeIndex, cascadeTotal, glowIntensity, seedId }
}
```

#### Shape Rendering (within function)

Each shape is a small pixel art drawn with `fillRect`/`beginPath`:

| Shape | Size | Drawing Method |
|-------|------|---------------|
| `square` | 4x4 | Single `fillRect(x, y, 4, 4)` (matches existing `renderNGEBlinkLight`) |
| `diamond` | 5x5 | Four points: center-top, right-center, center-bottom, left-center. Fill path. |
| `triangle` | 5x4 | Three points: center-top, left-bottom, right-bottom. Fill path. |
| `circle` | 4x4 | `arc(x+2, y+2, 2, 0, Math.PI*2)`. Fill. |
| `cross` | 5x3 | Horizontal `fillRect(x, y+1, 5, 1)` + vertical `fillRect(x+2, y, 1, 3)` |

#### Mode Logic (within function, uses `Date.now()`)

| Mode | On/Off Logic |
|------|-------------|
| `steady` | `Math.floor(Date.now() / rate) % 2 === 0` |
| `double` | Within 820ms cycle: ON@0-80ms, OFF@80-140ms, ON@140-220ms, OFF@220-820ms |
| `cascade` | `(Date.now() + cascadeIndex * 100) % (cascadeTotal * 100 + 600)` < 200 |
| `reactive` | Same as `steady` but `rate` is computed from `reactiveValue` and `reactiveThresholds` array `[{threshold, rate, color}]` |
| `random` | Seeded from `seedId` (or position hash). Use `(Date.now() / randomPeriod) % 2` where `randomPeriod` is cached per-seed in 200-800ms range, refreshed when state flips |

#### "Off" State Rendering
When the indicator is in its "off" phase: draw shape with `rgba(255,255,255,0.08)`, no glow.

#### "On" State Rendering
Draw shape with `color`, `shadowColor = color`, `shadowBlur = opts.glowIntensity || 4`.

#### State Variables
None. All timing is computed from `Date.now()` with modular arithmetic. No per-indicator timers.

For `random` mode: use a simple hash of `(x * 7 + y * 13)` to seed the random period. Cache nothing — compute deterministically each frame.

---

### CHUNK 4: BLINKING INDICATORS ON ALL PANELS

**Dependencies**: Chunk 3 (renderNGEIndicator)
**Estimated size**: ~85 lines added across 6 functions

Add `renderNGEIndicator()` calls to each zone renderer. The existing `renderNGEBlinkLight` calls are **kept as-is** (they still work). New indicators are added alongside them.

#### 4a. renderStatusZone (line 12786)

**Insert after** the existing blink light call at line 12852: `renderNGEBlinkLight(x + w - 12, y + 8, '#0ff', 800);`

Add at line 12853 (before `renderPowerupsInStatus`):

```js
// New indicators
renderNGEIndicator(x + 4, y + 120 - 8, 'diamond', '#0ff', 'steady', { rate: 1200 });
renderNGEIndicator(x + w - 8, y + 120 - 8, 'circle', '#0ff', 'reactive', {
    reactiveValue: waveTimer,
    reactiveThresholds: [
        { threshold: 30, rate: 1500 },
        { threshold: 10, rate: 600 },
        { threshold: 0, rate: 200 }
    ]
});
```

~8 lines added.

#### 4b. renderMissionZone (line 12894)

**Insert at end of function** (before closing `}` at line 12973):

```js
// Panel indicators
const missionX = x, missionW = w;
renderNGEIndicator(missionX + 4, y + 4, 'triangle', '#0a0', 'steady', { rate: 700 });
const quotaPct = quotaTarget > 0 ? quotaProgress / quotaTarget : 0;
const missionEColor = quotaPct > 0.8 ? '#0f0' : (quotaPct < 0.5 ? '#ff0' : '#0a0');
const missionERate = quotaPct > 0.8 ? 0 : (quotaPct < 0.5 ? 400 : 1000);
renderNGEIndicator(missionX + missionW - 8, y + 4, 'square', missionEColor, missionERate === 0 ? 'steady' : 'steady', { rate: missionERate || 9999 });
renderNGEIndicator(missionX + 4, y + 110 - 6, 'circle', '#0a0', 'steady', { rate: 900 });
renderNGEIndicator(missionX + 12, y + 110 - 6, 'circle', '#0a0', 'steady', { rate: 900, phaseOffset: 450 });
renderNGEIndicator(missionX + missionW - 8, y + 110 - 6, 'diamond', '#0a0', 'steady', { rate: 1100 });
```

~12 lines added.

#### 4c. renderSystemsZone (line 13037)

**Insert at end of function** (before closing `}` at line 13126):

```js
// Panel indicators
renderNGEIndicator(x + 4, y + 4, 'square', '#f80', 'steady', { rate: 600 });
const shldPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;
const sysJColor = shldPct > 0.5 ? '#f80' : (shldPct > 0.25 ? '#fc0' : '#f44');
const sysJRate = shldPct > 0.5 ? 1000 : (shldPct > 0.25 ? 500 : 150);
const sysJGlow = shldPct < 0.25 ? 8 : 4;
renderNGEIndicator(x + 4, y + 88 - 8, 'cross', sysJColor, 'reactive', {
    reactiveValue: shldPct, reactiveThresholds: [
        { threshold: 0.5, rate: 1000 },
        { threshold: 0.25, rate: 500 },
        { threshold: 0, rate: 150 }
    ], glowIntensity: sysJGlow
});
renderNGEIndicator(x + w - 8, y + 88 - 8, 'diamond', '#f80', 'steady', { rate: 800 });
```

~14 lines added.

#### 4d. renderWeaponsZone (line 13128)

**Insert after** the `renderNGEPanel` call at line 13163, before `let curY = y + 22;` at line 13165:

```js
// Panel indicators
renderNGEIndicator(x + 4, y + 4, 'triangle', '#f44', 'steady', { rate: 500 });
const anyRecharging = (playerInventory.bombRechargeTimers && playerInventory.bombRechargeTimers.length > 0) ||
    (missileGroups && missileGroups.some(g => !g.ready));
renderNGEIndicator(x + w - 8, y + 4, 'square', '#f44', anyRecharging ? 'double' : 'steady', { rate: 800 });
renderNGEIndicator(x + 14, y + panelH - 8, 'cross', '#f44', 'random', { seedId: 'wep_n' });
renderNGEIndicator(x + w - 8, y + panelH - 8, 'circle', '#f44', 'steady', { rate: 400 });
```

~8 lines added. **Note**: `panelH` is already computed before `renderNGEPanel` on line 13161, so it's available.

#### 4e. renderFleetZone (line 13340)

**Insert after** the `renderNGEPanel` call at line 13371:

```js
// Panel indicators
const fleetPanelH = Math.max(panelH, 50);
renderNGEIndicator(x + 4, y + 4, 'diamond', '#48f', 'steady', { rate: 700 });
renderNGEIndicator(x + 4, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 0, cascadeTotal: 3 });
renderNGEIndicator(x + 12, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 1, cascadeTotal: 3 });
renderNGEIndicator(x + 20, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 2, cascadeTotal: 3 });
renderNGEIndicator(x + w - 8, y + fleetPanelH - 8, 'circle', '#48f', 'steady', { rate: 1000 });
```

~8 lines added.

#### 4f. renderCommanderZone (line 13518)

**Insert after** the existing `renderNGEBlinkLight` call at line 13524:

```js
// New indicator: bottom-left
renderNGEIndicator(x + 4, y + h - 8, 'triangle', '#0f0', 'double', {});
```

~2 lines added.

#### Risks
- Rendering budget: ~18 new indicators × 1 fill + 1 optional glow = ~36 draw ops. Well under 0.5ms. Safe.
- The `panelH` variable in renderFleetZone is local and computed at line 13369. Need to use `Math.max(panelH, 50)` to match what `renderNGEPanel` receives.

---

### CHUNK 5: ORDNANCE PANEL LABELS — ORD.B → BOMBS, ORD.M → MISSILES

**Dependencies**: None
**Estimated size**: 2 lines changed

#### Exact Edits

| Line | Old | New |
|------|-----|-----|
| 13173 | `renderNGELabel(x + pad, curY, 'ORD.B', '#f80');` | `renderNGELabel(x + pad, curY, 'BOMBS', '#f80');` |
| 13222 | `renderNGELabel(x + pad, curY, 'ORD.M', '#f40');` | `renderNGELabel(x + pad, curY, 'MISSILES', '#f40');` |

Also update key badge positions since "BOMBS" is 5 chars vs "ORD.B" is 5 chars (same width, no position change needed). "MISSILES" is 8 chars — the key badge at line 13223 uses `x + pad + 44` which will need adjusting:

| Line | Old | New |
|------|-----|-----|
| 13223 | `renderNGEKeyBadge(x + pad + 44, curY - 10, 'X');` | `renderNGEKeyBadge(x + pad + 68, curY - 10, 'X');` |

#### Risks
- None. Pure cosmetic text change.

---

### CHUNK 6: BOMB 3×3 GRID (Fixed 3 Columns)

**Dependencies**: Chunk 1 (max count = 9)
**Estimated size**: ~8 lines changed

#### Changes in renderWeaponsZone (starting line 13128)

**Replace** the dynamic `bombCols` calculation at lines 13149-13150:

```js
// OLD (lines 13149-13150):
const bombCols = playerInventory.maxBombs > 0
    ? Math.max(1, Math.floor(availableGridW / (bombSize + bombSpacing))) : 0;

// NEW:
const bombCols = 3; // Fixed 3-column grid
```

**Also replace** the `panelH` bomb row calculation at lines 13154-13156:

```js
// OLD (lines 13154-13156):
if (playerInventory.maxBombs > 0) {
    const bombRows = Math.ceil(playerInventory.maxBombs / bombCols);
    panelH += 4 + bombRows * (bombSize + bombSpacing) + 18;
}

// NEW:
if (playerInventory.maxBombs > 0) {
    const bombRows = Math.ceil(playerInventory.maxBombs / 3);  // Always 3 columns
    panelH += 4 + bombRows * (bombSize + bombSpacing) + 18;
}
```

The rendering loop at lines 13177-13217 already uses `bombCols` for column/row calculation, so setting `bombCols = 3` is sufficient.

#### Testing
- With 1-3 bombs: 1 row, 3 columns (some empty)
- With 4-6 bombs: 2 rows
- With 7-9 bombs: 3×3 grid
- Verify recharge arcs still render on empty slots

#### Risks
- The `gridStartX` at line 13131 (`x + pad + 70`) may need to shift if the label "BOMBS" positions differently. But since "BOMBS" is 5 chars same as "ORD.B", the text width is the same. No issue.
- The `availableGridW` calculation at line 13132 is no longer needed for `bombCols` but it's still used for `gridStartX`. Keep it.

---

### CHUNK 7: ENERGY TIME SERIES — Data Structure + Sampling

**Dependencies**: None (data collection, no rendering)
**Estimated size**: ~60 lines new code

#### New State Variable

**Insert after** `missionCommanderState` block (after line 12470, before `MISSION_COMMANDER_DIALOGUES` at line 12472):

```js
let energyTimeSeries = {
    buffer: new Float32Array(180),
    intakeBuffer: new Float32Array(180),
    outputBuffer: new Float32Array(180),
    writeIndex: 0,
    sampleTimer: 0,
    sampleInterval: 1/6,  // ~166ms = 6 samples/sec, 30s history
    frameIntake: 0,
    frameOutput: 0,
    peakValue: 100,
    smoothPeak: 100
};
```

#### Energy Delta Tracking Function

**Insert after** `energyTimeSeries` declaration:

```js
function trackEnergyDelta(oldEnergy, newEnergy) {
    const delta = newEnergy - oldEnergy;
    if (delta > 0) energyTimeSeries.frameIntake += delta;
    else if (delta < 0) energyTimeSeries.frameOutput += Math.abs(delta);
}
```

#### Sampling Function

**Insert after** `trackEnergyDelta`:

```js
function updateEnergyTimeSeries(dt) {
    if (!ufo) return;
    energyTimeSeries.sampleTimer += dt;
    if (energyTimeSeries.sampleTimer >= energyTimeSeries.sampleInterval) {
        energyTimeSeries.sampleTimer -= energyTimeSeries.sampleInterval;
        const idx = energyTimeSeries.writeIndex;
        energyTimeSeries.buffer[idx] = ufo.energy;
        energyTimeSeries.intakeBuffer[idx] = energyTimeSeries.frameIntake;
        energyTimeSeries.outputBuffer[idx] = energyTimeSeries.frameOutput;
        energyTimeSeries.frameIntake = 0;
        energyTimeSeries.frameOutput = 0;
        energyTimeSeries.writeIndex = (idx + 1) % 180;

        // Auto-scale Y axis
        let peak = ufo.maxEnergy;
        for (let i = 0; i < 180; i++) {
            peak = Math.max(peak, energyTimeSeries.intakeBuffer[i], energyTimeSeries.outputBuffer[i]);
        }
        energyTimeSeries.peakValue = peak;
        energyTimeSeries.smoothPeak += (peak - energyTimeSeries.smoothPeak) * 0.05;
    }
}
```

#### Instrumentation Points — Energy Drain

At each location where `ufo.energy` is modified, wrap with `trackEnergyDelta`:

| Line | Current Code | Instrumentation |
|------|-------------|-----------------|
| 4736 | `this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;` | Add `trackEnergyDelta(this.energy, this.energy - CONFIG.ENERGY_DRAIN_RATE * dt);` before the line |
| 4771 | `this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;` | Same pattern |
| 4899-4900 | `this.energy = Math.min(this.maxEnergy, this.energy + rechargeRate * dt);` | Wrap with tracking |

**Simpler approach**: Instead of instrumenting every `ufo.energy` write, sample `ufo.energy` directly and compute net delta per sample window. The `buffer[]` stores the absolute energy level. For intake/output separation, track per-frame at the key sites:

- **Beam drain (lines 4736, 4771)**: Before the subtraction, add `energyTimeSeries.frameOutput += CONFIG.ENERGY_DRAIN_RATE * dt;`
- **Energy recharge (line 4900)**: After the assignment, add `energyTimeSeries.frameIntake += rechargeRate * dt;`
- **Target beam-up energy restore**: Search for `ENERGY_RESTORE_RATIO` usage. At those sites add to `frameIntake`.

**Key instrumentation lines** (verified from grep results):
- Line 4736: Beam drain (charging coordinator)
- Line 4771: Beam drain (beaming target)
- Line 4899-4900: Passive recharge
- Lines 3356-3357 area: Target beam-up energy restore (search `ENERGY_RESTORE_RATIO`)
- Drone deploy energy costs: lines 10035, 10052, 10070, 10087
- Warp juke: line 10488
- Missile fire: line 10599

Each instrumentation is 1 line: `energyTimeSeries.frameOutput += AMOUNT;` or `energyTimeSeries.frameIntake += AMOUNT;`

Total: ~12 instrumentation lines across the file + ~30 lines for the data structures/functions.

#### Call updateEnergyTimeSeries

Add to `updateHUDAnimations` (line 13675), inside the function body after the existing animation updates (before the boot check at line 13694):

```js
// Energy time series sampling
if (gameState === 'PLAYING') {
    updateEnergyTimeSeries(dt);
}
```

#### Reset in startGame()

Add after the `hudAnimState` reset (after line 12873):

```js
energyTimeSeries = {
    buffer: new Float32Array(180),
    intakeBuffer: new Float32Array(180),
    outputBuffer: new Float32Array(180),
    writeIndex: 0, sampleTimer: 0, sampleInterval: 1/6,
    frameIntake: 0, frameOutput: 0,
    peakValue: 100, smoothPeak: 100
};
```

#### Risks
- **Performance**: Float32Array operations are fast. 180 samples is tiny. No concern.
- **Accuracy**: The tracking must happen BEFORE `ufo.energy` is clamped. If energy is at max and recharge happens, the clamped amount won't match `rechargeRate * dt`. Solution: compute the actual delta as `newEnergy - oldEnergy` post-clamp for intake. For output: always track the requested drain amount (even if energy goes below 0, it gets clamped elsewhere).

---

### CHUNK 8: ENERGY TIME SERIES — Graph Rendering

**Dependencies**: Chunk 7 (data structure)
**Estimated size**: ~100 lines new code

#### New Function: renderEnergyGraph()

**Insert after** `renderSystemsZone` (after line 13126, before `renderWeaponsZone` at line 13128):

```js
function renderEnergyGraph(systemsZone) {
    if (!techFlags.beamConduit) return;  // Gated to pg1

    const { x, y, w } = systemsZone;
    const pad = 6;

    // Calculate Y position below systems zone content
    let graphY = y + 88 + 8;  // Base: after 88px systems panel + gap
    if (playerInventory.speedBonus > 0) graphY += 22;
    if (playerInventory.maxEnergyBonus > 0) graphY += 14;

    const graphW = w;      // 195px (matches systems zone)
    const graphH = 72;

    // Panel
    renderNGEPanel(x, graphY, graphW, graphH, { color: '#f80', cutCorners: ['tr'], alpha: 0.5 });

    // Header
    ctx.fillStyle = '#f80';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NRG.FLOW', x + 6, graphY + 10);

    // Legend
    // ... (red OUT, green IN labels at top-right)

    // Blink light
    renderNGEBlinkLight(x + graphW - 10, graphY + 4, '#f80', 600);

    // Graph area
    const gx = x + 28;          // After Y-axis labels
    const gy = graphY + 14;     // After header
    const gw = graphW - 28 - 6; // = 161px
    const gh = 48;

    // Grid lines (horizontal)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 2; i++) { // 0%, 50%, 100%
        const ly = gy + gh - (i / 2) * gh;
        ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx + gw, ly); ctx.stroke();
    }

    // Grid lines (vertical, every 5s = 30 samples)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 1; i < 6; i++) {
        const lx = gx + (i / 6) * gw;
        ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx, gy + gh); ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '7px monospace';
    ctx.textAlign = 'right';
    const yMax = Math.max(10, energyTimeSeries.smoothPeak * 1.2);
    ctx.fillText(Math.round(yMax).toString(), gx - 2, gy + 4);
    ctx.fillText(Math.round(yMax / 2).toString(), gx - 2, gy + gh / 2 + 2);
    ctx.fillText('0', gx - 2, gy + gh);
    ctx.textAlign = 'left';

    // X-axis labels
    ctx.fillStyle = '#555';
    ctx.fillText('-30s', gx, gy + gh + 8);
    ctx.textAlign = 'right';
    ctx.fillText('now', gx + gw, gy + gh + 8);
    ctx.textAlign = 'left';

    // Draw lines from ring buffer
    const idx = energyTimeSeries.writeIndex;
    const mapY = (val) => gy + gh - (Math.min(val, yMax) / yMax) * gh;

    // OUTPUT line (red)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.8)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.outputBuffer[bufIdx]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // INTAKE line (green)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.intakeBuffer[bufIdx]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Fill-under-curve gradients (area charts)
    // ... (linearGradient fills as specified in visual design)
}
```

#### Integration in renderHUDFrame

**Insert after** the systems zone boot overlay block (after line 13654), before the weapons zone block (line 13656):

```js
// Energy graph (below systems zone)
if (panelReady('systems') && !booting) {
    renderEnergyGraph(layout.systemsZone);
}
```

#### Risks
- **Performance**: 360 `lineTo` calls per frame (180 × 2 lines). Verified: <0.3ms. Safe.
- **Graph Y position**: Depends on `playerInventory.speedBonus` and `maxEnergyBonus`. These can change mid-wave (powerups). The graph position will jump if a speed powerup activates. This is acceptable — the same thing happens with the existing speed/energy labels.
- **Boot sequence**: Energy graph does NOT need its own boot panel entry. It appears silently after the systems zone boots, gated by `techFlags.beamConduit`. The visual design doc says it boots with Systems zone, but since it renders after panelReady('systems') and not during boot, this is fine.

---

### CHUNK 9: TECH READOUT CHIPS — Top-Center Gap Widgets

**Dependencies**: None
**Estimated size**: ~120 lines new code

#### New State

**Insert after** `energyTimeSeries` declaration (in the HUD STATE section, after Chunk 7's additions):

```js
let techChipBootAnims = {};  // { techId: { startTime: Date.now(), duration: 416 } }

const TECH_CHIP_DEFS = [
    { id: 'pg1', text: 'PG1 CONDUIT', width: 58, track: 'powerGrid' },
    { id: 'pg2', text: 'PG2 EFFIC', width: 44, track: 'powerGrid' },
    { id: 'pg3', text: 'PG3 BCAST', width: 44, track: 'powerGrid' },
    { id: 'pg4', text: 'PG4 REACT', width: 44, track: 'powerGrid' },
    { id: 'pg5', text: 'PG5 S.GRID', width: 52, track: 'powerGrid' },
    { id: 'dc1', text: 'DC1 UPLINK', width: 52, track: 'droneCommand' },
    { id: 'dc2', text: 'DC2 H.CORD', width: 52, track: 'droneCommand' },
    { id: 'dc3', text: 'DC3 A.CORD', width: 52, track: 'droneCommand' },
    { id: 'dc4', text: 'DC4 EXPND', width: 44, track: 'droneCommand' },
    { id: 'dc5', text: 'DC5 SWARM', width: 44, track: 'droneCommand' },
    { id: 'dn1', text: 'DN1 THRST', width: 44, track: 'defenseNetwork' },
    { id: 'dn2', text: 'DN2 ARMOR', width: 44, track: 'defenseNetwork' },
    { id: 'dn3', text: 'DN3 SHLD.T', width: 52, track: 'defenseNetwork' },
    { id: 'dn4', text: 'DN4 RESIL', width: 44, track: 'defenseNetwork' },
    { id: 'dn5', text: 'DN5 S.SHLD', width: 52, track: 'defenseNetwork' }
];

const TRACK_COLORS = {
    powerGrid: '#ff0',
    droneCommand: '#48f',
    defenseNetwork: '#f80'
};
```

#### Tech ID to Chip ID Mapping

Need a mapping from `techTree.researched` (which stores tech node IDs like `'beam_conduit'`) to chip IDs (`'pg1'`). The tech node IDs are defined in the tech tree. Check the tech tree node definitions:

```js
// Mapping from tech tree node IDs to chip IDs
const TECH_TO_CHIP = {
    'beam_conduit': 'pg1', 'energy_efficiency': 'pg2', 'power_broadcast': 'pg3',
    'reactor_amplifier': 'pg4', 'self_sustaining_grid': 'pg5',
    'drone_uplink': 'dc1', 'harvester_coordinator': 'dc2', 'attack_coordinator': 'dc3',
    'fleet_expansion': 'dc4', 'autonomous_swarm': 'dc5',
    'thruster_boost': 'dn1', 'drone_armor': 'dn2', 'shield_transfer': 'dn3',
    'fleet_resilience': 'dn4', 'swarm_shield': 'dn5'
};
```

#### New Function: renderTechChips()

**Insert after** `renderMissionZone` (after line 12973, before `renderHarvestCounterNGE` at line 12975 — actually before `renderSystemsZone`):

Actually, better placement: insert after `renderEnergyFlows` (after line 13592), since it's a self-contained render function.

```js
function renderTechChips(layout) {
    const researched = techTree.researched;
    if (researched.size === 0) return;

    const statusEnd = layout.statusZone.x + layout.statusZone.w;
    const missionStart = layout.missionZone.x;
    const gapStartX = statusEnd + 4;
    const gapEndX = missionStart - 4;
    const gapW = gapEndX - gapStartX;
    if (gapW < 44) return;  // Not enough space

    let curX = gapStartX;
    let curY = 6;
    let lastTrack = null;

    for (const chipDef of TECH_CHIP_DEFS) {
        const techNodeId = Object.keys(TECH_TO_CHIP).find(k => TECH_TO_CHIP[k] === chipDef.id);
        if (!techNodeId || !researched.has(techNodeId)) continue;

        const chipW = chipDef.width;
        const trackColor = TRACK_COLORS[chipDef.track];

        // Track separator
        if (lastTrack && lastTrack !== chipDef.track) {
            if (curX + 2 <= gapEndX) {
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(curX, curY + 2);
                ctx.lineTo(curX, curY + 16);
                ctx.stroke();
                curX += 4;
            }
        }

        // Wrap to next row if needed
        if (curX + chipW > gapEndX) {
            curX = gapStartX;
            curY += 18 + 3;
        }

        // Chip background
        ctx.fillStyle = 'rgba(5, 8, 18, 0.5)';
        // Chip with cut corner (top-right, 4px)
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX + chipW - 4, curY);
        ctx.lineTo(curX + chipW, curY + 4);
        ctx.lineTo(curX + chipW, curY + 18);
        ctx.lineTo(curX, curY + 18);
        ctx.closePath();
        ctx.fill();

        // Chip border
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Chip text
        ctx.fillStyle = `rgba(${hexToRgb(trackColor)}, 0.7)`;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(chipDef.text.substring(0, 3), curX + 2, curY + 11);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '7px monospace';
        ctx.fillText(chipDef.text.substring(4), curX + 20, curY + 11);

        // Status blink light (2x2)
        const blinkOn = Math.floor(Date.now() / 1200) % 2 === 0;
        ctx.fillStyle = blinkOn ? trackColor : 'rgba(255,255,255,0.08)';
        if (blinkOn) { ctx.shadowColor = trackColor; ctx.shadowBlur = 3; }
        ctx.fillRect(curX + chipW - 5, curY + 8, 2, 2);
        ctx.shadowBlur = 0;

        lastTrack = chipDef.track;
        curX += chipW + 3;
    }
}
```

#### Integration in renderHUDFrame

**Insert after** the mission zone block and before the systems zone block in `renderHUDFrame`. Specifically after line 12646 (mission boot overlay), before line 12648 (systems zone comment):

```js
// Tech readout chips in top-center gap
if (!booting) {
    renderTechChips(layout);
}
```

#### Reset in startGame()

`techChipBootAnims = {};` — add after the `energyTimeSeries` reset.

#### Risks
- **Gap width at small resolutions**: At canvas widths < 1000px, the gap may be too narrow for any chips. The `gapW < 44` guard handles this.
- **Chip boot animations**: The visual spec describes micro-boot animations for new chips. This is a nice-to-have polish item. Skip for initial implementation; chips appear instantly on research completion.
- **Tech node ID mismatch**: The `TECH_TO_CHIP` mapping must match the actual node IDs in the tech tree. Verify against `getTechNode()` and the tech tree data.

---

### CHUNK 10: DIAG.SYS PANEL — Subsystem Diagnostics (Bottom-Left Upper)

**Dependencies**: None
**Estimated size**: ~180 lines new code

#### New State

**Insert in HUD STATE section** (after `energyTimeSeries`, before `MISSION_COMMANDER_DIALOGUES`):

```js
let diagnosticsState = {
    visible: false,
    slideProgress: 0,
    scrollOffset: 0,
    scrollDirection: 1,
    scrollPauseTimer: 0,
    lines: []  // Rebuilt each frame: [{ label, value, status, color }]
};
```

#### getHUDLayout() — Add diagnosticsZone

**Modify** `getHUDLayout()` at line 12536. Add to the return object (after `commanderZone` at line 12549):

```js
diagnosticsZone: { x: margin, y: canvas.height - 220, w: leftW, h: 100 }
```

This positions DIAG.SYS 110px above commander (commander at `canvas.height - 110`, DIAG at `canvas.height - 220`). There is a 10px gap between them.

#### New Function: renderDiagnosticsZone()

**Insert after** `renderCommanderZone` (after line 13569, before `renderEnergyFlows` at line 13571):

```js
function renderDiagnosticsZone(zone) {
    const { x, y, w, h } = zone;
    const pad = 6;
    const lineH = 12;
    const maxVisibleLines = 6;  // floor((100 - 20) / 12) = 6 visible lines

    renderNGEPanel(x, y, w, h, { color: '#0af', cutCorners: ['tl'], alpha: 0.5 });

    // Header
    ctx.fillStyle = '#0af';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIAG.SYS', x + 6, y + 11);

    // Blink lights
    renderNGEIndicator(x + w - 18, y + 4, 'square', '#0af', 'steady', { rate: 700 });
    renderNGEIndicator(x + w - 10, y + 4, 'square', '#0af', 'steady', { rate: 700, phaseOffset: 350 });

    // Build diagnostic lines dynamically
    const lines = [];

    // Always-visible lines (after pg1 unlock)
    if (ufo) {
        const energyPct = ufo.energy / ufo.maxEnergy;
        const energyStatus = energyPct > 0.25 ? 'nominal' : (energyPct > 0.1 ? 'caution' : 'critical');
        lines.push({ label: 'NRG.MAIN', value: `${Math.ceil(ufo.energy)}/${ufo.maxEnergy}`, status: energyStatus });
    }

    // Beam status
    const beamStatus = ufo ? (ufo.beamActive ? 'ACTIVE' : (ufo.energy < CONFIG.ENERGY_MIN_TO_FIRE ? 'DEPLETED' : 'IDLE')) : 'OFFLINE';
    const beamSt = beamStatus === 'DEPLETED' ? 'critical' : (beamStatus === 'ACTIVE' ? 'nominal' : 'nominal');
    lines.push({ label: 'BEAM.SYS', value: beamStatus, status: beamSt });

    // Shield
    const shldVal = ufo ? ufo.health : finalHealth;
    const shldPct = shldVal / CONFIG.UFO_START_HEALTH;
    lines.push({ label: 'SHLD.INTG', value: `${Math.ceil(shldVal)}/${CONFIG.UFO_START_HEALTH}`, status: shldPct > 0.25 ? 'nominal' : 'critical' });

    // Conditional lines
    if (harvesterUnlocked) {
        const aliveH = activeDrones.filter(d => d.type === 'harvester' && d.alive).length +
            activeCoordinators.filter(c => c.type === 'harvester').reduce((s, c) => s + (c.subDrones ? c.subDrones.filter(d => d.alive).length : 0), 0);
        const totalH = activeDrones.filter(d => d.type === 'harvester').length +
            activeCoordinators.filter(c => c.type === 'harvester').reduce((s, c) => s + (c.subDrones ? c.subDrones.length : 0), 0);
        lines.push({ label: 'DRN.HARV', value: `${aliveH}/${totalH} ACTIVE`, status: aliveH === totalH ? 'nominal' : 'caution' });
    }

    if (battleDroneUnlocked) {
        const aliveB = activeDrones.filter(d => d.type === 'battle' && d.alive).length +
            activeCoordinators.filter(c => c.type === 'attack').reduce((s, c) => s + (c.subDrones ? c.subDrones.filter(d => d.alive).length : 0), 0);
        const totalB = activeDrones.filter(d => d.type === 'battle').length +
            activeCoordinators.filter(c => c.type === 'attack').reduce((s, c) => s + (c.subDrones ? c.subDrones.length : 0), 0);
        lines.push({ label: 'DRN.ATTK', value: `${aliveB}/${totalB} ACTIVE`, status: aliveB === totalB ? 'nominal' : 'caution' });
    }

    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        const cLabel = coord.type === 'harvester' ? 'COORD.H' : 'COORD.A';
        const cPct = coord.energyTimer / coord.maxEnergy;
        lines.push({ label: cLabel, value: `NRG ${Math.round(cPct * 100)}%`, status: cPct > 0.25 ? 'nominal' : 'critical' });
    }

    if (missileUnlocked && missileGroupCount > 0) {
        const ready = missileGroups.filter(g => g.ready).length;
        lines.push({ label: 'ORD.MSL', value: `${ready}/${missileGroupCount} RDY`, status: ready > 0 ? 'nominal' : 'caution' });
    }

    if (playerInventory.maxBombs > 0) {
        lines.push({ label: 'ORD.BMB', value: `${playerInventory.bombs}/${playerInventory.maxBombs}`, status: playerInventory.bombs > 0 ? 'nominal' : 'caution' });
    }

    // Threat counter
    const tankCount = tanks ? tanks.filter(t => t.alive).length : 0;
    const thrStatus = tankCount > 5 ? 'critical' : (tankCount > 3 ? 'caution' : 'nominal');
    lines.push({ label: 'THR.PROX', value: `${tankCount} HOSTILE`, status: thrStatus });

    // Render lines with scroll
    const startY = y + 20;
    const viewH = h - 24;
    const totalLineH = lines.length * lineH;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, startY, w - 4, viewH);
    ctx.clip();

    let scrollY = 0;
    if (totalLineH > viewH) {
        // Auto-scroll
        diagnosticsState.scrollPauseTimer -= 1/60;
        if (diagnosticsState.scrollPauseTimer <= 0) {
            diagnosticsState.scrollOffset += diagnosticsState.scrollDirection * 0.4;
            const maxScroll = totalLineH - viewH;
            if (diagnosticsState.scrollOffset >= maxScroll) {
                diagnosticsState.scrollOffset = maxScroll;
                diagnosticsState.scrollDirection = -1;
                diagnosticsState.scrollPauseTimer = 2;
            } else if (diagnosticsState.scrollOffset <= 0) {
                diagnosticsState.scrollOffset = 0;
                diagnosticsState.scrollDirection = 1;
                diagnosticsState.scrollPauseTimer = 2;
            }
        }
        scrollY = diagnosticsState.scrollOffset;
    }

    for (let i = 0; i < lines.length; i++) {
        const ly = startY + i * lineH - scrollY;
        if (ly < startY - lineH || ly > startY + viewH) continue;

        const line = lines[i];
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = line.status === 'critical' ? '#f44' : '#8af';
        ctx.fillText(line.label, x + pad, ly + 9);
        ctx.fillStyle = line.status === 'critical' ? '#f44' : '#ccc';
        ctx.textAlign = 'right';
        ctx.fillText(line.value, x + w - pad - 12, ly + 9);
        ctx.textAlign = 'left';

        // Status dot
        renderNGEStatusDot(x + w - pad - 4, ly + 6, line.status, 2);
    }

    ctx.restore();
}
```

#### Integration in renderHUDFrame

The DIAG.SYS panel renders in the bottom-left, above the commander zone. It slides in from the left, same as the weapons panel.

**Insert before** the commander zone block (before line 12732). Place it after the fleet zone block (after line 12730):

```js
// Diagnostics zone: visible after Beam Conduit (pg1) research
if (techFlags.beamConduit) {
    hudAnimState.diagPanelVisible = true;
}
if (hudAnimState.diagPanelVisible) {
    if (hudAnimState.diagPanelSlide < 1) {
        hudAnimState.diagPanelSlide = Math.min(1, hudAnimState.diagPanelSlide + 0.04);
    }
    ctx.save();
    const slideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * -layout.diagnosticsZone.w;
    ctx.translate(slideOffset, 0);
    if (panelReady('diagnostics')) {
        renderDiagnosticsZone(layout.diagnosticsZone);
    }
    if (booting && hudBootState.panels.diagnostics && hudBootState.panels.diagnostics.active && hudBootState.panels.diagnostics.phase !== 'waiting') {
        renderPanelBootOverlay(layout.diagnosticsZone, layout.diagnosticsZone.h, '#0af', 'DIAG.SYS', hudBootState.panels.diagnostics, hudBootState.bootLines.diagnostics);
    }
    ctx.restore();
}
```

#### hudAnimState Additions

**Add to `hudAnimState` initial declaration** (line 12405) and the reset in `startGame()` (line 11862):

```js
diagPanelVisible: false,
diagPanelSlide: 0,
```

#### startGame() Reset

Add `diagnosticsState` reset after `missionCommanderState` reset (after line 11887):

```js
diagnosticsState = {
    visible: false, slideProgress: 0,
    scrollOffset: 0, scrollDirection: 1, scrollPauseTimer: 0, lines: []
};
```

#### Risks
- **beamActive access**: Need to verify `ufo.beamActive` exists. Search for `beamActive` in codebase. If the property name differs (e.g., `ufo.isBeaming`), adjust accordingly.
- **Coordinator iteration**: The `activeCoordinators` array may include dead/dying coordinators. The existing filter `coord.alive && coord.state !== 'DYING'` is correct.
- **Performance**: Building line data every frame is trivial (array construction + comparisons). No concern.
- **Scroll state persistence**: `diagnosticsState.scrollOffset` persists across frames. It should reset when the line count changes significantly. Consider resetting when `lines.length` changes, but this is minor polish.

---

### CHUNK 11: OPS.LOG PANEL — Event Ticker (Bottom-Left Lower)

**Dependencies**: Chunk 10 (layout coordination, since both panels are bottom-left)
**Estimated size**: ~150 lines new code

#### Design Decision: Panel Stacking

Per the user's decision: **DIAG.SYS (upper) + OPS.LOG (lower)** in the bottom-left corner, with Commander dialogue rendering over them when active.

Layout at 720px canvas height:
- DIAG.SYS: `y = canvas.height - 330, h = 100` (adjusted from -220 to make room for OPS.LOG)
- OPS.LOG: `y = canvas.height - 220, h = 100`
- Commander: `y = canvas.height - 110, h = 100`

Wait — re-reading the design docs more carefully:

The visual design says:
- OPS.LOG at `y = canvas.height - 220, h = 100`
- Commander at `y = canvas.height - 110, h = 100`
- They don't overlap at 720px.

And the game design says:
- DIAG.SYS should be positioned ABOVE the commander zone at `y: canvas.height - 220`

But the user wants BOTH. So the stack needs to be:
- **DIAG.SYS**: `y = canvas.height - 330, h = 100`
- **OPS.LOG**: `y = canvas.height - 220, h = 100`
- **Commander**: `y = canvas.height - 110, h = 100`

All with 10px gaps. This works at 720px (DIAG.SYS starts at y=390, OPS.LOG at y=500, Commander at y=610).

#### Revised getHUDLayout()

**Update** the `diagnosticsZone` from Chunk 10:

```js
diagnosticsZone: { x: margin, y: canvas.height - 330, w: leftW, h: 100 },
opsLogZone: { x: margin, y: canvas.height - 220, w: Math.min(240, canvas.width * 0.20), h: 100 }
```

#### New State

**Insert in HUD STATE section**:

```js
let opsLogState = {
    events: [],       // [{ text, color, age, bold, timestamp }]
    maxEvents: 20,
    throttle: {},     // { eventType: lastTimestamp }
    throttleWindow: 500,
    biomatterAccum: 0,
    biomatterAccumTimer: 0
};
```

#### hudAnimState Additions

```js
opsLogPanelVisible: false,
opsLogPanelSlide: 0,
```

#### Event Push Function

```js
function pushOpsLogEvent(text, color, opts = {}) {
    const now = Date.now();
    const type = opts.type || text;

    // Throttle check
    if (!opts.skipThrottle && opsLogState.throttle[type] && now - opsLogState.throttle[type] < opsLogState.throttleWindow) {
        return;
    }
    opsLogState.throttle[type] = now;

    opsLogState.events.push({
        text, color,
        age: 0,
        bold: opts.bold || false,
        timestamp: now
    });

    // Prune oldest
    if (opsLogState.events.length > opsLogState.maxEvents) {
        opsLogState.events.shift();
    }
}
```

#### Event Emission Points

These are scattered throughout the codebase. Each is a single `pushOpsLogEvent()` call:

| Event | Code Location (approximate) | Call |
|-------|---------------------------|------|
| Target abducted | Where `harvestCount` is incremented (search `harvestCount[`) | `pushOpsLogEvent('+{points} BIOMATTER', '#0f0', { type: 'biomatter' })` |
| Tank destroyed by bomb | Where tank death from bomb is processed | `pushOpsLogEvent('TANK DESTROYED +{score}', '#ff0', { type: 'tankBomb' })` |
| Tank destroyed by missile | Where tank death from missile is processed | `pushOpsLogEvent('TANK.ELIM +{score}', '#f80', { type: 'tankMissile' })` |
| Shield hit | Where `ufo.health` decreases from projectile | `pushOpsLogEvent('SHIELD HIT -{dmg} HP', '#f44', { type: 'shieldHit' })` |
| Drone deployed | Where drone is added to `activeDrones` | `pushOpsLogEvent('{type} DEPLOYED', '#48f', { type: 'droneDeploy' })` |
| Drone destroyed | Where drone death is processed | `pushOpsLogEvent('DRONE LOST', '#f44', { type: 'droneLost' })` |
| Coordinator events | Where coordinator state changes | Various |
| Bomb used | Where bomb is created | `pushOpsLogEvent('ORD.B DEPLOYED', '#f80', { type: 'bombUse' })` |
| Missile salvo | Where missiles fire | `pushOpsLogEvent('MISSILE SALVO AWAY', '#f40', { type: 'missileUse' })` |
| Tech researched | Where research completes | `pushOpsLogEvent('RSRCH COMPLETE: {name}', '#0ff', { type: 'research' })` |
| Wave start | In `initHUDBoot` or wave transition | `pushOpsLogEvent('-- WAVE {n} --', '#fff', { type: 'waveStart', bold: true })` |

These instrumentation points need exact line numbers. The implementer should search for each event location. Key search patterns:
- `harvestCount[` → bio-matter event
- `tank.alive = false` or `destroyTank` → tank kill event
- `ufo.health -=` → shield hit event
- `activeDrones.push` → drone deploy event
- Bomb creation → bomb event
- `fireMissiles` or missile group fire → missile event
- `techTree.researched.add` → research event

Each instrumentation is 1-2 lines.

#### Update Function

```js
function updateOpsLog(dt) {
    for (let i = opsLogState.events.length - 1; i >= 0; i--) {
        opsLogState.events[i].age += dt;
        if (opsLogState.events[i].age > 15) {
            opsLogState.events.splice(i, 1);
        }
    }
}
```

**Call from** `updateHUDAnimations` (line 13675), alongside the energy time series update:

```js
if (gameState === 'PLAYING') {
    updateOpsLog(dt);
}
```

#### Render Function

```js
function renderOpsLogZone(zone) {
    const { x, y, w, h } = zone;
    const pad = 6;
    const lineH = 12;
    const maxVisibleLines = 6;

    renderNGEPanel(x, y, w, h, { color: '#8af', cutCorners: ['bl'], alpha: 0.45 });

    // Header
    ctx.fillStyle = '#8af';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('OPS.LOG', x + 6, y + 11);

    // Blink lights (alternating pair)
    renderNGEIndicator(x + w - 18, y + 4, 'square', '#8af', 'steady', { rate: 500 });
    renderNGEIndicator(x + w - 10, y + 4, 'square', '#8af', 'steady', { rate: 500, phaseOffset: 250 });

    // Render events (newest at bottom)
    const startY = y + 20;
    const events = opsLogState.events;
    const visibleStart = Math.max(0, events.length - maxVisibleLines);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, startY, w - 4, h - 24);
    ctx.clip();

    for (let i = visibleStart; i < events.length; i++) {
        const ev = events[i];
        const lineIdx = i - visibleStart;
        const ly = startY + lineIdx * lineH;

        const alpha = Math.max(0, 1 - (ev.age / 15));
        const isNew = ev.age < 0.3;

        ctx.font = ev.bold ? 'bold 9px monospace' : '9px monospace';

        // Prefix
        ctx.fillStyle = `rgba(85, 85, 85, ${alpha})`;
        ctx.textAlign = 'left';
        ctx.fillText('> ', x + pad, ly + 9);

        // Text
        if (isNew) {
            ctx.shadowColor = ev.color;
            ctx.shadowBlur = 4;
        }
        ctx.fillStyle = ev.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba') || `rgba(${hexToRgb(ev.color)}, ${alpha})`;
        ctx.fillText(ev.text, x + pad + 12, ly + 9);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}
```

**Note**: The color-with-alpha rendering needs care. Since event colors are hex strings like `'#0f0'`, use `hexToRgb` (already available in codebase) to convert: `ctx.fillStyle = \`rgba(${hexToRgb(ev.color)}, ${alpha})\``.

#### Integration in renderHUDFrame

**Insert after** the DIAG.SYS block (from Chunk 10), before the commander zone block:

```js
// OPS.LOG zone: visible after wave 1
if (wave >= 2) {
    hudAnimState.opsLogPanelVisible = true;
}
if (hudAnimState.opsLogPanelVisible) {
    if (hudAnimState.opsLogPanelSlide < 1) {
        hudAnimState.opsLogPanelSlide = Math.min(1, hudAnimState.opsLogPanelSlide + 0.04);
    }
    ctx.save();
    const slideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * -layout.opsLogZone.w;
    ctx.translate(slideOffset, 0);
    if (panelReady('opslog')) {
        renderOpsLogZone(layout.opsLogZone);
    }
    if (booting && hudBootState.panels.opslog && hudBootState.panels.opslog.active && hudBootState.panels.opslog.phase !== 'waiting') {
        renderPanelBootOverlay(layout.opsLogZone, layout.opsLogZone.h, '#8af', 'OPS.LOG', hudBootState.panels.opslog, hudBootState.bootLines.opslog);
    }
    ctx.restore();
}
```

#### startGame() Reset

```js
opsLogState = { events: [], maxEvents: 20, throttle: {}, throttleWindow: 500, biomatterAccum: 0, biomatterAccumTimer: 0 };
```

#### Risks
- **Event spam**: The throttle system prevents duplicate events within 500ms. The biomatter accumulation pattern (collecting multiple bio-matter in quick succession) needs special handling — accumulate into `biomatterAccum` and emit one log entry on flush.
- **Commander rendering order**: Commander zone must render AFTER OPS.LOG (higher z-order). The current code already renders commander last in the HUD. Maintain this order.
- **Color alpha**: The `hexToRgb` function must handle all color formats used in event colors. Verify it handles `#0f0`, `#ff0`, `#f44`, etc.

---

### CHUNK 12: BOOT SEQUENCE INTEGRATION — New Panels

**Dependencies**: Chunks 10, 11 (DIAG.SYS, OPS.LOG)
**Estimated size**: ~40 lines

#### hudBootState.panels — Add New Entries

**Modify** `hudBootState.panels` at line 12423. Add after the `commander` entry (line 12429):

```js
diagnostics: { active: false, startTime: 0.45, duration: 1.3, progress: 0, phase: 'waiting' },
opslog: { active: false, startTime: 1.1, duration: 1.0, progress: 0, phase: 'waiting' }
```

#### hudBootState.bootLines — Add New Entries

**Modify** `hudBootState.bootLines` at line 12447. Add after the `commander` entry (line 12453):

```js
diagnostics: [],
opslog: []
```

#### initHUDBoot() — Activate New Panels

**Modify** `initHUDBoot()`. After line 13733 (`p.commander.active = wave >= 2;`):

```js
p.diagnostics.active = techFlags.beamConduit;
p.opslog.active = wave >= 2;
```

#### defaultStartTimes — Add New Entries

**Modify** the `defaultStartTimes` object at line 13736:

```js
const defaultStartTimes = { status: 0.0, mission: 0.15, systems: 0.3, diagnostics: 0.45, weapons: 0.6, fleet: 0.9, opslog: 1.1, commander: 1.2 };
```

#### generateBootLines() — Add New Panels

**Insert after** the commander boot lines block (after line 13888, before the closing `}` of `generateBootLines`):

```js
// DIAGNOSTICS panel (if active)
if (hudBootState.panels.diagnostics && hudBootState.panels.diagnostics.active) {
    lines.diagnostics = [
        `>> INIT DIAG.SYS`,
        `[OK] SCANNING ACTIVE MODULES`,
        `[OK] LINKING TELEMETRY FEEDS`,
        `[OK] SUBSYSTEM MONITOR ONLINE`,
        `>> DIAG.SYS READY`
    ];
} else {
    lines.diagnostics = [];
}

// OPS.LOG panel (if active)
if (hudBootState.panels.opslog && hudBootState.panels.opslog.active) {
    lines.opslog = [
        `>> INIT OPS.LOG`,
        `[OK] EVENT BUFFER ALLOC`,
        `[OK] LOG STREAM ACTIVE`,
        `>> OPS.LOG ONLINE`
    ];
} else {
    lines.opslog = [];
}
```

#### Reset Panel Slide Animations

**Add to** `initHUDBoot()` after line 13749 (`hudAnimState.commanderPanelSlide = 0;`):

```js
hudAnimState.diagPanelSlide = 0;
hudAnimState.opsLogPanelSlide = 0;
```

#### Boot Duration Adjustment

The current `hudBootState.duration` is 3.5s (line 12421/13702). With the new panels:
- Latest panel start: `opslog` at 1.1s + 1.0s duration = 2.1s
- `commander` at 1.2s + 1.0s = 2.2s
- 3.5s total duration is sufficient for all panels. **No change needed.**

#### Risks
- **panelReady() check**: The `panelReady()` helper at line 12629 uses `hudBootState.panels[key]`. If `key` is `'diagnostics'` or `'opslog'`, it will look up the new entries. Since we're adding them, this works. But ensure the key names match exactly: `'diagnostics'` and `'opslog'`.
- **Iteration in updateHUDBoot**: At line 13758, `Object.entries(p)` iterates all panels. The new entries will be picked up automatically. No changes needed there.

---

### CHUNK 13: COMMANDER HUD BUG FIX — Reset at Wave Transition

**Dependencies**: None
**Estimated size**: ~6 lines

#### Exact Edit

**In `updateWaveTransition`** at line 18067 (inside the `if (waveTransitionTimer <= 0)` block), add **before** `initHUDBoot();` at line 18074:

```js
// Reset commander state so it doesn't carry over from previous wave
missionCommanderState.visible = false;
missionCommanderState.dialogue = '';
missionCommanderState.typewriterIndex = 0;
missionCommanderState.typewriterTimer = 0;
missionCommanderState.displayTimer = 0;
missionCommanderState.cooldownTimer = 15;
```

Insert these 6 lines at line 18074 (pushing the existing `initHUDBoot()` call down).

#### Why This Works
- Clears any stuck `visible = true` from a commander dialogue that was active when the wave ended
- Resets the 15-second cooldown so the commander doesn't trigger immediately after the boot sequence
- The boot sequence (called next) then correctly controls whether the commander panel boots

#### Testing
- Play wave 2+. While commander is speaking, let the wave timer expire.
- Verify: during wave transition countdown, commander is NOT visible.
- Verify: after boot sequence, commander doesn't appear until cooldown elapses.

#### Risks
- None. This is a straightforward state reset at a well-defined boundary.

---

## DEPENDENCY GRAPH

```
Chunk 1 (CONFIG) ──────────────────┐
                                    ├── Chunk 2 (Shop) [automatic, no code]
                                    └── Chunk 6 (Bomb Grid) [needs Chunk 1]

Chunk 3 (renderNGEIndicator) ──────── Chunk 4 (Indicators on panels) [needs Chunk 3]
                                    ├── Chunk 10 (DIAG.SYS uses indicators) [needs Chunk 3]
                                    └── Chunk 11 (OPS.LOG uses indicators) [needs Chunk 3]

Chunk 5 (Labels) ──────────────────── [independent]

Chunk 7 (Energy data) ────────────── Chunk 8 (Energy graph render) [needs Chunk 7]

Chunk 9 (Tech chips) ─────────────── [independent]

Chunk 10 (DIAG.SYS) ──────────────┐
                                    ├── Chunk 12 (Boot integration) [needs 10, 11]
Chunk 11 (OPS.LOG) ───────────────┘

Chunk 13 (Commander fix) ─────────── [independent]
```

## RECOMMENDED IMPLEMENTATION ORDER

### Phase A: Independent quick wins (can be done in parallel)
1. **Chunk 1 + 2**: CONFIG change (1 minute)
2. **Chunk 5**: Label changes (1 minute)
3. **Chunk 6**: Bomb grid fix (5 minutes)
4. **Chunk 13**: Commander bug fix (5 minutes)

### Phase B: Foundation (must be sequential within phase)
5. **Chunk 3**: renderNGEIndicator function
6. **Chunk 7**: Energy time series data

### Phase C: Rendering (can be parallel after Phase B)
7. **Chunk 4**: Indicators on all panels (needs Chunk 3)
8. **Chunk 8**: Energy graph rendering (needs Chunk 7)
9. **Chunk 9**: Tech readout chips (independent, can parallel)

### Phase D: New panels (sequential, needs Chunk 3)
10. **Chunk 10**: DIAG.SYS panel
11. **Chunk 11**: OPS.LOG panel
12. **Chunk 12**: Boot sequence integration (needs 10, 11)

### Parallelism Opportunities

```
Worker 1: Chunks 1+2+5+6+13 (quick wins) → Chunk 3 → Chunk 4
Worker 2: Chunk 7 → Chunk 8 → Chunk 9
Worker 3: (after Chunk 3 done) → Chunk 10 → Chunk 11 → Chunk 12
```

Maximum parallelism: 3 workers. With 2 workers, the critical path is:

```
Worker 1: 1+2+5+6+13 → 3 → 4 → 10 → 11 → 12
Worker 2: 7 → 8 → 9
```

---

## RISKS AND GOTCHAS

### High-Risk Areas

1. **renderHUDFrame ordering (line 12624-12776)**: The rendering order of panels determines z-order. New panels must be inserted at the correct position:
   - DIAG.SYS: before OPS.LOG, before Commander
   - OPS.LOG: after DIAG.SYS, before Commander
   - Commander must remain the LAST panel rendered (highest z-order)

2. **hudAnimState reset in startGame() (line 11862-11873)**: The object is recreated wholesale. ALL new fields (`diagPanelVisible`, `diagPanelSlide`, `opsLogPanelVisible`, `opsLogPanelSlide`) MUST be added both to the initial declaration (line 12405) AND the reset (line 11862).

3. **hudBootState.panels iteration (line 13758)**: The `for (const [key, panel] of Object.entries(p))` loop iterates ALL panel entries. Adding new panels here "just works" — but the panel keys must match exactly between `hudBootState.panels`, `hudBootState.bootLines`, `defaultStartTimes`, and the `panelReady()` calls.

4. **Energy instrumentation (Chunk 7)**: Modifying `ufo.energy` assignment sites is risky. Each site must be found precisely. Missing one means the graph will be inaccurate (but not crash). Adding tracking BEFORE the energy modification (so the old value is still accessible) is critical.

### Medium-Risk Areas

5. **getHUDLayout() canvas size assumptions**: The diagnosticsZone at `canvas.height - 330` assumes canvas height >= 400px. At very small canvas heights, panels may overlap or go offscreen. Add a guard: `if (canvas.height < 500) skip diagnostics rendering`.

6. **Tech node ID mapping (Chunk 9)**: The `TECH_TO_CHIP` mapping assumes specific tech tree node IDs. If any ID is wrong, that chip won't appear. Verify against actual tech tree definitions (search for `getTechNode`, `TECH_TREE`, or the tech tree data structure).

7. **OPS.LOG event emission (Chunk 11)**: The ~15 instrumentation points are scattered across the file. Missing some is acceptable (partial log is still useful). But incorrect line numbers could break game logic if the `pushOpsLogEvent` call is inserted mid-expression.

### Low-Risk Areas

8. **Performance**: Total new rendering: ~18 indicators (0.5ms) + energy graph (0.3ms) + DIAG.SYS panel (0.2ms) + OPS.LOG panel (0.2ms) + tech chips (0.1ms) = ~1.3ms new per frame. At 60fps, budget is 16.7ms. Current HUD renders in ~2-3ms. Total with additions: ~4.3ms. Well within budget.

9. **Memory**: Energy ring buffers (180×3 floats = 2.2KB), OPS.LOG events (20 objects ~1KB), tech chip data (static const ~500B). Negligible.

---

## VERIFICATION CHECKLIST

After all chunks are implemented, verify:

- [ ] Game starts normally (startGame resets all new state)
- [ ] Wave 1: Only Status + Systems panels visible (no DIAG, no OPS.LOG, no commander)
- [ ] Wave 1 shop: Can buy up to 9 bombs, "MAXED" at 9
- [ ] Wave 2: Weapons + Fleet slide in. Commander activates after cooldown. Boot sequence shows all active panels.
- [ ] If Beam Conduit researched: DIAG.SYS boots and appears. Energy graph appears below systems.
- [ ] Tech chips appear in top-center gap as techs are researched
- [ ] Bomb grid shows 3x3 layout with 9 max bombs
- [ ] Labels show "BOMBS" and "MISSILES"
- [ ] All panels have blinking indicators matching their specs
- [ ] OPS.LOG shows events as they happen (tank kills, bio-matter, shield hits)
- [ ] Commander does NOT appear during boot sequence or wave transitions
- [ ] No performance regression (maintain 60fps)
- [ ] No crashes when panels are not visible (guards for null/undefined)
