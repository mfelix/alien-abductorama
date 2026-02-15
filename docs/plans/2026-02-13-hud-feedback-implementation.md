# HUD Feedback Implementation Plan
**Date:** 2026-02-13
**Scope:** Three surgical HUD changes to ORD.SYS, NRG.FLOW, and FLEET.CMD panels

---

## Overview

Three targeted changes to reduce wasted space, add micro-visualizations, and improve fleet status feedback:

1. **ORD.SYS Dynamic Height Collapse** - Calculate panel height from actual missile group count instead of static 230px. Chain OPS.LOG and DIAG.SYS positions from the dynamic bottom edge.
2. **NRG.FLOW Bottom Section Dazzle** - Replace overlapping text rows (SPD.BOOST, NRG.AUG, NRG readout) with a reactive micro-dashboard: sparkline, pixel energy grid, compact bar, movement/shooting reactivity.
3. **FLEET.CMD Panel Overhaul** - Wider energy bars, canvas-drawn tree lines, numbered coordinator/drone names, damage flash feedback, animated status micro-grids.

## Execution Order

Changes must be applied in this order to avoid line-number drift:

1. **FLEET.CMD** (lines 15521-15705) - Furthest down in the file, no downstream dependencies
2. **NRG.FLOW** (lines 15021-15271) - Middle of file, self-contained to renderEnergyGraph
3. **ORD.SYS** (lines 14052-14093 + 15273-15519) - Layout function + weapons renderer, affects OPS.LOG/DIAG.SYS positioning

---

## Change 1: ORD.SYS Dynamic Height Collapse

### Problem
`ordPanelH` is hardcoded to 230px at line 14068. When the player has few missile groups (e.g., 6 out of 18), there is massive dead space. OPS.LOG and DIAG.SYS float too far below.

### New State Variables
None required.

### Modification A: getHUDLayout (lines 14066-14074)

**File:** `js/game.js`
**Remove lines 14066-14074:**
```javascript
    // Ordnance panel: static height for max capacity (9 bombs + 18 missile groups)
    const ordWeaponsY = margin + topRowH + 10;
    const ordPanelH = 230; // header(28) + bombs(80) + missiles(114) + pad(8)

    // OPS.LOG + DIAG.SYS: left side, below ordnance panel
    // OPS.LOG always right below ordnance; DIAG.SYS tucks under log when unlocked
    const opsLogH = 100;
    const opsLogY = ordWeaponsY + ordPanelH + 10;
    const diagY = opsLogY + opsLogH + 10;
```

**Replace with:**
```javascript
    // Ordnance panel: dynamic height based on actual unlocked content
    const ordWeaponsY = margin + topRowH + 10;
    // Bomb section: header(28) + 3 rows of bombs (3x3 grid, 22px per row) + spacing(14)
    const bombSectionH = 28 + 3 * (16 + 6) + 14;
    // Missile section: rows needed based on actual group count (3-column layout, 6 rows max per col)
    const actualMissileGroups = typeof missileGroupCount !== 'undefined' ? missileGroupCount : 0;
    const maxMissileRowsPerCol = 6;
    const missileRowH = 12 + 5; // missileH + spacing
    const missileRowsNeeded = actualMissileGroups > 0 ? Math.min(maxMissileRowsPerCol, actualMissileGroups) : 0;
    const missileSectionH = missileRowsNeeded > 0 ? missileRowsNeeded * missileRowH + 20 : 0; // +20 for label + pad
    const ordPanelH = Math.max(110, bombSectionH + missileSectionH + 8); // min 110px for bombs-only

    // OPS.LOG + DIAG.SYS: left side, below ordnance panel
    // OPS.LOG always right below ordnance; DIAG.SYS tucks under log when unlocked
    const opsLogH = 100;
    const opsLogY = ordWeaponsY + ordPanelH + 10;
    const diagY = opsLogY + opsLogH + 10;
```

### Modification B: renderWeaponsZone - use dynamic height (line 15298)

**File:** `js/game.js`
**Remove line 15298:**
```javascript
    const panelH = h;
```

**Replace with:**
```javascript
    // Dynamic panel height: recalculate based on actual content
    const bombRows = Math.ceil(maxBombs / bombCols);
    const bombSectionHeight = 28 + bombRows * (bombSize + bombSpacing) + 14;
    const missileRowsNeeded = missileGroupCount > 0 ? Math.min(maxMissileRowsPerCol, missileGroupCount) : 0;
    const missileSectionHeight = missileRowsNeeded > 0 ? missileRowsNeeded * groupRowH + 20 : 0;
    const panelH = Math.max(110, bombSectionHeight + missileSectionHeight + 8);
```

### Impact
- `layout.weaponsZone.h` is passed into `renderWeaponsZone` as `zone.h`, but the function already recalculates `panelH` internally and returns it (line 15518: `return panelH`).
- `renderHUDFrame` at line 14346 captures `weaponsPanelH = renderWeaponsZone(layout.weaponsZone) || layout.weaponsZone.h` - this already chains correctly.
- Boot overlay at line 14349 uses `layout.weaponsZone.h` which will now be dynamic from `getHUDLayout`.
- `opsLogY` and `diagY` chain from `ordPanelH` automatically.

### Verification
- With 0 missile groups: panel should be ~110px (bombs only, minimum).
- With 6 groups (1 column of 6): panel should be ~110 + ~6*17 + 20 = ~232px (close to current).
- With 18 groups (full): panel should be ~110 + 6*17 + 20 = ~232px (same as before - 3 cols still fit in 6 rows).
- OPS.LOG and DIAG.SYS should slide up to hug the bottom of the weapons panel.

---

## Change 2: NRG.FLOW Bottom Section Dazzle

### Problem
Lines 15249-15271 render 0-3 text rows (SPD.BOOST, NRG.AUG, NRG readout) that overlap and feel flat. Replace with a micro-dashboard.

### New State Variables

**Insert at line 13782 (after `diagEnhancedState` closing brace):**
```javascript

// NRG.FLOW micro-dashboard reactive state
let nrgFlowDazzleState = {
    // Recharge rate sparkline (20 samples, updated every 500ms)
    rechargeRateBuffer: new Float32Array(20),
    rechargeRateWriteIdx: 0,
    rechargeRateSampleTimer: 0,
    // Pixel energy grid reactive flash
    gridFlashTimer: 0,      // countdown timer for grid flash (set on energy change)
    gridFlashType: 'none',   // 'gain' or 'drain' or 'none'
    // Movement reactivity
    lastUfoX: 0,
    moveDelta: 0,            // current frame's X movement (for shift effects)
    // Shooting reactivity
    shootFlashTimer: 0,      // countdown for weapon-fire flash
};
```

### Update loop: sample recharge rate sparkline

**Insert at line 16613 (after `diagEnhancedState` energy rate sampling block closing brace, before the blank line):**
```javascript

        // NRG.FLOW dazzle sparkline sampling (recharge rate, every 500ms)
        nrgFlowDazzleState.rechargeRateSampleTimer += dt;
        if (nrgFlowDazzleState.rechargeRateSampleTimer >= 0.5) {
            nrgFlowDazzleState.rechargeRateSampleTimer -= 0.5;
            const rechargeRate = ufo ? (ufo.energy / ufo.maxEnergy) : 0;
            nrgFlowDazzleState.rechargeRateBuffer[nrgFlowDazzleState.rechargeRateWriteIdx] = rechargeRate;
            nrgFlowDazzleState.rechargeRateWriteIdx = (nrgFlowDazzleState.rechargeRateWriteIdx + 1) % 20;
        }

        // NRG.FLOW movement tracking
        if (ufo) {
            nrgFlowDazzleState.moveDelta = ufo.x - nrgFlowDazzleState.lastUfoX;
            nrgFlowDazzleState.lastUfoX = ufo.x;
        }

        // NRG.FLOW flash decay
        nrgFlowDazzleState.gridFlashTimer = Math.max(0, nrgFlowDazzleState.gridFlashTimer - dt);
        nrgFlowDazzleState.shootFlashTimer = Math.max(0, nrgFlowDazzleState.shootFlashTimer - dt);
```

### Shooting flash trigger

**Find:** the bomb launch code where `trackEnergyDelta` is called for weapons. Search for lines near bomb/missile firing. Add after any `trackEnergyDelta` call for weapon output, or more reliably, add a trigger in `renderWeaponsZone`'s launch flash detection.

Better approach: Add to the existing `trackEnergyDelta` function at line 13959:

**Remove lines 13959-13962:**
```javascript
function trackEnergyDelta(amount, isIntake) {
    if (isIntake) energyTimeSeries.frameIntake += amount;
    else energyTimeSeries.frameOutput += amount;
}
```

**Replace with:**
```javascript
function trackEnergyDelta(amount, isIntake) {
    if (isIntake) {
        energyTimeSeries.frameIntake += amount;
        if (amount > 2) {
            nrgFlowDazzleState.gridFlashTimer = 0.3;
            nrgFlowDazzleState.gridFlashType = 'gain';
        }
    } else {
        energyTimeSeries.frameOutput += amount;
        if (amount > 1) {
            nrgFlowDazzleState.shootFlashTimer = 0.2;
        }
        if (amount > 3) {
            nrgFlowDazzleState.gridFlashTimer = 0.25;
            nrgFlowDazzleState.gridFlashType = 'drain';
        }
    }
}
```

### Modification: Replace bottom info section of renderEnergyGraph

**Remove lines 15249-15271 (the augmentation indicators and energy readout at bottom of renderEnergyGraph):**
```javascript
    // Energy augmentation indicators (moved from shield panel)
    const indicatorBaseY = gy + gh + 14;
    ctx.textAlign = 'left';
    let augCount = 0;
    if (playerInventory.speedBonus > 0) {
        const bonusPercent = Math.round(playerInventory.speedBonus * 100);
        renderNGELabel(x + 6, indicatorBaseY + augCount * 12, `SPD.BOOST +${bonusPercent}%`, '#ff0');
        renderNGEStatusDot(x + graphW - 8, indicatorBaseY + augCount * 12 - 3, 'nominal');
        augCount++;
    }
    if (playerInventory.maxEnergyBonus > 0) {
        renderNGELabel(x + 6, indicatorBaseY + augCount * 12, `NRG.AUG +${playerInventory.maxEnergyBonus}`, '#7ff');
        renderNGEStatusDot(x + graphW - 8, indicatorBaseY + augCount * 12 - 3, 'nominal');
        augCount++;
    }
    // Current energy readout
    if (ufo) {
        const ePct = ufo.energy / ufo.maxEnergy;
        const eColor = ePct > 0.25 ? '#f80' : '#f44';
        renderNGELabel(x + 6, indicatorBaseY + augCount * 12, `NRG ${Math.ceil(ufo.energy)}/${ufo.maxEnergy}`, eColor);
        augCount++;
    }
}
```

**Replace with:**
```javascript
    // === NRG.FLOW MICRO-DASHBOARD (below graph) ===
    const dashY = gy + gh + 12;
    const dashW = graphW;
    const now = Date.now();

    // --- Row 1: Sparkline + Pixel Energy Grid + Compact NRG readout ---

    // 1a. Recharge rate sparkline (30px wide x 8px tall)
    const sparkX = x + 6;
    const sparkY = dashY;
    const sparkW = 30;
    const sparkH = 8;
    // Sparkline background
    ctx.fillStyle = 'rgba(255, 136, 0, 0.08)';
    ctx.fillRect(sparkX, sparkY, sparkW, sparkH);
    // Draw sparkline from ring buffer
    const sparkBuf = nrgFlowDazzleState.rechargeRateBuffer;
    const sparkIdx = nrgFlowDazzleState.rechargeRateWriteIdx;
    ctx.strokeStyle = '#f80';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
        const bi = (sparkIdx + i) % 20;
        const sx = sparkX + (i / 19) * sparkW;
        const sy = sparkY + sparkH - sparkBuf[bi] * sparkH;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // Sparkline border
    ctx.strokeStyle = 'rgba(255, 136, 0, 0.25)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sparkX, sparkY, sparkW, sparkH);

    // 1b. Pixel energy grid (5x3 grid of 3px squares, reactive)
    const gridX = sparkX + sparkW + 6;
    const gridY = dashY;
    const gridCols = 5;
    const gridRows = 3;
    const gridCellSize = 3;
    const gridGap = 1;
    const ePctGrid = ufo ? ufo.energy / ufo.maxEnergy : 0;
    const filledCells = Math.round(ePctGrid * gridCols * gridRows);
    // Movement shift offset (subtle pixel shift based on UFO movement)
    const moveShift = Math.min(2, Math.max(-2, nrgFlowDazzleState.moveDelta * 0.02));

    for (let row = gridRows - 1; row >= 0; row--) {
        for (let col = 0; col < gridCols; col++) {
            const cellIdx = (gridRows - 1 - row) * gridCols + col;
            const cx = gridX + col * (gridCellSize + gridGap) + moveShift;
            const cy = gridY + row * (gridCellSize + gridGap);

            if (cellIdx < filledCells) {
                // Lit cell
                const cellPulse = Math.sin(now / 200 + cellIdx * 0.5) * 0.15 + 0.85;
                // Flash override on energy gain/drain
                let cellAlpha = cellPulse;
                if (nrgFlowDazzleState.gridFlashTimer > 0) {
                    const flashPhase = Math.floor((0.3 - nrgFlowDazzleState.gridFlashTimer) / 0.05) % 3;
                    if (nrgFlowDazzleState.gridFlashType === 'gain') {
                        cellAlpha = flashPhase === 0 ? 1.0 : (flashPhase === 1 ? 0.3 : 0.8);
                    } else {
                        cellAlpha = flashPhase === 0 ? 0.2 : (flashPhase === 1 ? 1.0 : 0.4);
                    }
                }
                const cellColor = ePctGrid > 0.25 ? `rgba(255, 136, 0, ${cellAlpha})` : `rgba(255, 68, 68, ${cellAlpha})`;
                ctx.fillStyle = cellColor;
                ctx.fillRect(cx, cy, gridCellSize, gridCellSize);
            } else {
                // Dim cell
                ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.fillRect(cx, cy, gridCellSize, gridCellSize);
            }
        }
    }
    // Shoot flash: overlay entire grid with brief white flash
    if (nrgFlowDazzleState.shootFlashTimer > 0) {
        const shootAlpha = nrgFlowDazzleState.shootFlashTimer / 0.2 * 0.4;
        ctx.fillStyle = `rgba(255, 200, 0, ${shootAlpha})`;
        ctx.fillRect(gridX - 1, gridY - 1, gridCols * (gridCellSize + gridGap) + 2, gridRows * (gridCellSize + gridGap) + 2);
    }

    // 1c. Compact NRG readout (right-aligned)
    if (ufo) {
        const ePct = ufo.energy / ufo.maxEnergy;
        const eColor = ePct > 0.25 ? '#f80' : '#f44';
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = eColor;
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.ceil(ufo.energy)}`, x + dashW - 4, dashY + 7);
        ctx.font = '6px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText(`/${ufo.maxEnergy}`, x + dashW - 4, dashY + 14);
        ctx.textAlign = 'left';
    }

    // --- Row 2: Speed bonus bar + NRG.AUG indicator (compact) ---
    const row2Y = dashY + gridRows * (gridCellSize + gridGap) + 4;
    let row2X = x + 6;

    if (playerInventory.speedBonus > 0) {
        const bonusPercent = Math.round(playerInventory.speedBonus * 100);
        ctx.font = '7px monospace';
        ctx.fillStyle = '#ff0';
        ctx.textAlign = 'left';
        ctx.fillText(`SPD+${bonusPercent}%`, row2X, row2Y + 6);
        // Tiny animated speed bar (20px wide)
        const spdBarX = row2X + 42;
        const spdBarW = 20;
        const spdBarH = 3;
        const spdFill = Math.min(1, playerInventory.speedBonus * 2);
        // Movement-reactive bar pulse
        const movePulse = Math.min(1, Math.abs(nrgFlowDazzleState.moveDelta) * 0.01);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        ctx.fillRect(spdBarX, row2Y + 2, spdBarW, spdBarH);
        ctx.fillStyle = `rgba(255, 255, 0, ${0.6 + movePulse * 0.4})`;
        ctx.fillRect(spdBarX, row2Y + 2, spdBarW * spdFill, spdBarH);
        row2X = spdBarX + spdBarW + 6;
    }

    if (playerInventory.maxEnergyBonus > 0) {
        ctx.font = '7px monospace';
        ctx.fillStyle = '#7ff';
        ctx.textAlign = 'left';
        ctx.fillText(`+${playerInventory.maxEnergyBonus}NRG`, row2X, row2Y + 6);
    }
}
```

### Panel Height Adjustment

The `graphH` at line 15028 is 100px. The micro-dashboard needs about 24px (sparkline row ~12px + compact row2 ~12px). The current text rows used about 36px (3 rows * 12px). The new layout actually uses **less** vertical space, so no height change is needed. The content fits within the existing 100px panel (graph ends at `gy + gh` = `graphY + 14 + 48` = 62px into the panel, leaving 38px for the dashboard area).

### Impact
- Only `renderEnergyGraph` is modified (self-contained).
- `trackEnergyDelta` gains side-effects for flash triggers but remains backward-compatible.
- New state `nrgFlowDazzleState` is sampled in `updateHUDAnimations`.
- Reset `nrgFlowDazzleState` in game reset. Search for where `energyTimeSeries` is reset (around line 13132) and add reset there too.

### Reset on game start

**Find the game reset section near line 13132 where `missileGroupCount = 0;` appears. After `energyTimeSeries` is reset, insert:**
```javascript
    nrgFlowDazzleState.rechargeRateBuffer.fill(0);
    nrgFlowDazzleState.rechargeRateWriteIdx = 0;
    nrgFlowDazzleState.rechargeRateSampleTimer = 0;
    nrgFlowDazzleState.gridFlashTimer = 0;
    nrgFlowDazzleState.gridFlashType = 'none';
    nrgFlowDazzleState.lastUfoX = 0;
    nrgFlowDazzleState.moveDelta = 0;
    nrgFlowDazzleState.shootFlashTimer = 0;
```

**Exact insertion point:** Search for `energyTimeSeries.writeIndex = 0;` near line 13140 and insert immediately after that line.

### Verification
- Sparkline should show a rolling 10-second mini-graph of energy level percentage.
- Pixel grid should have 15 cells lighting from bottom-left, dimming as energy decreases.
- Grid should flash orange on energy gain, red-pulse on energy drain.
- Grid should shift 1-2px left/right when UFO moves.
- Grid should flash yellow briefly when weapons fire.
- SPD and NRG.AUG indicators compact to a single row, only shown when active.

---

## Change 3: FLEET.CMD Panel Overhaul

### Problem
Fleet panel uses narrow 40px energy bars, ASCII tree characters (rendered via `fillText`), generic labels, no damage feedback, and no animated status indicators.

### New State Variables

**No new global state needed.** Damage flash times are added directly to existing drone/coordinator objects as `lastDamageFlashTime` properties (set to `Date.now()` in their `takeDamage` methods).

### Modification A: Add damage flash triggers to takeDamage methods

**HarvesterDrone.takeDamage (lines 9815-9819):**

Remove:
```javascript
    takeDamage(amount) {
        if (techFlags.droneArmor) amount *= 0.6;
        this.energyTimer -= amount;
        if (this.energyTimer <= 0) this.die();
    }
```

Replace with:
```javascript
    takeDamage(amount) {
        if (techFlags.droneArmor) amount *= 0.6;
        this.energyTimer -= amount;
        this.lastDamageFlashTime = Date.now();
        if (this.energyTimer <= 0) this.die();
    }
```

**BattleDrone.takeDamage (lines 10102-10106):**

Remove:
```javascript
    takeDamage(amount) {
        if (techFlags.droneArmor) amount *= 0.6;
        this.energyTimer -= amount;
        if (this.energyTimer <= 0) this.die();
    }
```

Replace with:
```javascript
    takeDamage(amount) {
        if (techFlags.droneArmor) amount *= 0.6;
        this.energyTimer -= amount;
        this.lastDamageFlashTime = Date.now();
        if (this.energyTimer <= 0) this.die();
    }
```

**Coordinator.takeDamage (lines 10393-10402):**

Remove:
```javascript
        // Drone armor reduces damage
        if (techFlags.droneArmor) amount *= 0.6;

        this.energyTimer -= amount;
        if (this.energyTimer <= 0) {
            this.state = 'DYING';
            this.energyTimer = 0;
        }
```

Replace with:
```javascript
        // Drone armor reduces damage
        if (techFlags.droneArmor) amount *= 0.6;

        this.energyTimer -= amount;
        this.lastDamageFlashTime = Date.now();
        if (this.energyTimer <= 0) {
            this.state = 'DYING';
            this.energyTimer = 0;
        }
```

### Modification B: Replace renderFleetZone (lines 15521-15705)

**Remove the entire function body from line 15521 to 15705.**

**Replace with:**
```javascript
function renderFleetZone(zone) {
    const { x, y, w } = zone;
    const pad = 6;

    if (!harvesterUnlocked && !battleDroneUnlocked && activeCoordinators.length === 0) return;
    if (droneSlots <= 0 && activeCoordinators.length === 0) return;

    // Calculate dynamic height
    let totalRows = 0;
    const rowH = 18;
    const headerH = 22;

    // Count coordinator entries + their sub-drones
    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        totalRows++; // coordinator itself
        if (coord.subDrones) {
            totalRows += coord.subDrones.filter(d => d.alive).length;
        }
    }

    // Count raw drones (not attached to coordinators)
    const rawDrones = activeDrones.length;
    if (rawDrones > 0) {
        totalRows++; // "RAW DRONES" header
        totalRows += rawDrones;
    }

    const panelH = headerH + totalRows * rowH + pad * 2 + 4;

    renderNGEPanel(x, y, w, Math.max(panelH, 50), { color: '#48f', cutCorners: ['tr'], label: 'FLEET.CMD' });

    // Panel indicators
    const fleetPanelH = Math.max(panelH, 50);
    renderNGEIndicator(x + 4, y + 4, 'diamond', '#48f', 'steady', { rate: 700 });
    renderNGEIndicator(x + 4, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 0, cascadeTotal: 3 });
    renderNGEIndicator(x + 12, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 1, cascadeTotal: 3 });
    renderNGEIndicator(x + 20, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 2, cascadeTotal: 3 });
    renderNGEIndicator(x + w - 8, y + fleetPanelH - 8, 'circle', '#48f', 'steady', { rate: 1000 });

    // Slot counter
    const subDroneCount = activeCoordinators.reduce((sum, c) => sum + (c.subDrones ? c.subDrones.filter(d => d.alive).length : 0), 0);
    const totalDrones = activeDrones.length + subDroneCount;
    ctx.fillStyle = '#8af';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${totalDrones}/${droneSlots}`, x + w - pad, y + 18);
    ctx.textAlign = 'left';

    let curY = y + headerH + pad + 4;
    const fullBarW = w - pad * 2 - 80; // Full-width bar (panel width minus label space and padding)
    const barH = 5;
    const barX = x + pad + 72; // After label area
    const now = Date.now();

    // Helper: render fleet status micro-grid (4x4 animated pixel grid)
    function renderFleetStatusMicro(sx, sy, status, color) {
        const cellSize = 2;
        const cells = 3; // 3x3 grid
        for (let row = 0; row < cells; row++) {
            for (let col = 0; col < cells; col++) {
                let lit = false;
                let cellColor = color;
                let cellAlpha = 0.8;
                switch (status) {
                    case 'ONLINE':
                        // Steady diamond pattern (center + corners alternate)
                        lit = (row === 1 && col === 1) || ((row + col) % 2 === 0);
                        cellAlpha = 0.7 + Math.sin(now / 700) * 0.15;
                        cellColor = '#0f0';
                        break;
                    case 'BOOTING':
                        // Cascading dots
                        const cascadePhase = Math.floor(now / 150) % (cells * cells);
                        lit = (row * cells + col) <= cascadePhase;
                        cellColor = '#ff0';
                        cellAlpha = lit ? 0.8 : 0.1;
                        break;
                    case 'DAMAGED':
                        // Rapid red blink
                        lit = Math.floor(now / 80) % 2 === 0;
                        cellColor = '#f33';
                        cellAlpha = lit ? 1.0 : 0.15;
                        break;
                    case 'OFFLINE':
                        // Dim gray
                        lit = true;
                        cellColor = '#444';
                        cellAlpha = 0.3;
                        break;
                    default:
                        lit = true;
                        cellAlpha = 0.5;
                }
                ctx.fillStyle = lit ? cellColor : 'rgba(255,255,255,0.04)';
                ctx.globalAlpha = cellAlpha;
                ctx.fillRect(sx + col * (cellSize + 1), sy + row * (cellSize + 1), cellSize, cellSize);
            }
        }
        ctx.globalAlpha = 1;
    }

    // Helper: biomatter-inspired damage flash overlay
    function renderDamageFlash(fx, fy, fw, fh, flashTime) {
        if (!flashTime) return;
        const flashAge = now - flashTime;
        if (flashAge > 300) return;
        const flashPhase = Math.floor(flashAge / 25) % 4;
        let flashColor;
        switch (flashPhase) {
            case 0: flashColor = 'rgba(255, 68, 68, 0.8)'; break;
            case 1: flashColor = 'rgba(0, 0, 0, 0.6)'; break;
            case 2: flashColor = 'rgba(0, 255, 255, 0.7)'; break;
            default: flashColor = 'rgba(0, 0, 0, 0.4)'; break;
        }
        ctx.fillStyle = flashColor;
        ctx.fillRect(fx, fy, fw, fh);
    }

    // Track coordinator numbering per type
    const coordCounters = { harvester: 0, attack: 0 };
    const aliveCoords = activeCoordinators.filter(c => c.alive && c.state !== 'DYING');

    // Render coordinator trees
    for (let ci = 0; ci < aliveCoords.length; ci++) {
        const coord = aliveCoords[ci];
        const isLast = ci === aliveCoords.length - 1 && rawDrones === 0;

        const isHarvester = coord.type === 'harvester';
        coordCounters[isHarvester ? 'harvester' : 'attack']++;
        const coordNum = coordCounters[isHarvester ? 'harvester' : 'attack'];
        const coordLabel = isHarvester ? `COORD.H.${coordNum}` : `COORD.A.${coordNum}`;
        const coordColor = isHarvester ? '#0dc' : '#fa0';
        const energyPercent = coord.energyTimer / coord.maxEnergy;
        const timeLeft = Math.ceil(coord.energyTimer);

        // Canvas-drawn tree connector (replaces Unicode ├─ / └─)
        ctx.strokeStyle = '#445';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Vertical line from above
        if (ci > 0 || curY > y + headerH + pad + 4) {
            ctx.moveTo(x + pad + 4, curY - rowH + 6);
            ctx.lineTo(x + pad + 4, curY + 2);
        }
        // Horizontal branch
        ctx.moveTo(x + pad + 4, curY + 2);
        ctx.lineTo(x + pad + 16, curY + 2);
        if (!isLast) {
            // Continue vertical line downward
            ctx.moveTo(x + pad + 4, curY + 2);
            ctx.lineTo(x + pad + 4, curY + rowH);
        }
        ctx.stroke();

        // Coordinator label
        ctx.fillStyle = coordColor;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(coordLabel, x + pad + 18, curY + 4);

        // Full-width energy bar
        renderNGEBar(barX, curY - 2, fullBarW, barH, energyPercent, coordColor, {
            segments: 8,
            pulse: energyPercent < 0.25
        });

        // Time readout (right of bar)
        ctx.fillStyle = energyPercent < 0.25 ? '#f44' : '#889';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${timeLeft}s`, x + w - pad - 14, curY + 4);
        ctx.textAlign = 'left';

        // Status micro-grid (far right)
        const coordStatus = coord.state === 'DEPLOYING' ? 'BOOTING' :
                           (coord.lastDamageFlashTime && now - coord.lastDamageFlashTime < 500) ? 'DAMAGED' :
                           energyPercent > 0.1 ? 'ONLINE' : 'OFFLINE';
        renderFleetStatusMicro(x + w - pad - 10, curY - 3, coordStatus, coordColor);

        // Damage flash overlay on coordinator row
        renderDamageFlash(barX, curY - 3, fullBarW, barH + 2, coord.lastDamageFlashTime);

        curY += rowH;

        // Horizontal separator line between coordinator sections
        if (!isLast) {
            ctx.strokeStyle = 'rgba(68, 136, 255, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x + pad, curY - 4);
            ctx.lineTo(x + w - pad, curY - 4);
            ctx.stroke();
        }

        // Sub-drones
        const aliveSubDrones = coord.subDrones ? coord.subDrones.filter(d => d.alive) : [];
        for (let si = 0; si < aliveSubDrones.length; si++) {
            const sub = aliveSubDrones[si];
            const isLastSub = si === aliveSubDrones.length - 1;

            // Canvas-drawn sub-tree connector
            ctx.strokeStyle = '#334';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Vertical line (parent branch)
            if (!isLast) {
                ctx.moveTo(x + pad + 4, curY - rowH + 6);
                ctx.lineTo(x + pad + 4, curY + rowH);
            }
            // Sub-branch vertical
            ctx.moveTo(x + pad + 12, curY - rowH + 6);
            ctx.lineTo(x + pad + 12, curY + 2);
            // Sub-branch horizontal
            ctx.moveTo(x + pad + 12, curY + 2);
            ctx.lineTo(x + pad + 22, curY + 2);
            if (!isLastSub) {
                ctx.moveTo(x + pad + 12, curY + 2);
                ctx.lineTo(x + pad + 12, curY + rowH);
            }
            ctx.stroke();

            // Drone label: d.01, d.02 (no type prefix)
            const subLabel = `d.${String(si + 1).padStart(2, '0')}`;
            const subColor = sub.type === 'harvester' ? '#0a0' : '#a44';
            ctx.fillStyle = subColor;
            ctx.font = '9px monospace';
            ctx.fillText(subLabel, x + pad + 24, curY + 3);

            // Full-width sub energy bar
            const subEnergyPercent = sub.energyTimer / sub.maxEnergy;
            const subBarW = fullBarW * 0.85;
            renderNGEBar(barX, curY - 3, subBarW, 4, subEnergyPercent, subColor, {
                segments: 6
            });

            // Sub time
            ctx.fillStyle = '#667';
            ctx.font = '9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.ceil(sub.energyTimer)}s`, x + w - pad - 14, curY + 3);
            ctx.textAlign = 'left';

            // Damage flash on sub-drone energy bar area
            renderDamageFlash(barX, curY - 4, subBarW, 6, sub.lastDamageFlashTime);

            // Status micro-grid for sub-drone
            const subStatus = (sub.lastDamageFlashTime && now - sub.lastDamageFlashTime < 500) ? 'DAMAGED' :
                             subEnergyPercent > 0.1 ? 'ONLINE' : 'OFFLINE';
            renderFleetStatusMicro(x + w - pad - 10, curY - 4, subStatus, subColor);

            curY += rowH;
        }

        // Separator after coordinator section (including its sub-drones)
        if (!isLast && aliveSubDrones.length > 0) {
            ctx.strokeStyle = 'rgba(68, 136, 255, 0.12)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x + pad, curY - 4);
            ctx.lineTo(x + w - pad, curY - 4);
            ctx.stroke();
        }
    }

    // Raw drones (not attached to coordinators)
    if (rawDrones > 0) {
        // Canvas-drawn tree connector for raw drones header
        ctx.strokeStyle = '#445';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + pad + 4, curY - rowH + 6);
        ctx.lineTo(x + pad + 4, curY + 2);
        ctx.moveTo(x + pad + 4, curY + 2);
        ctx.lineTo(x + pad + 16, curY + 2);
        ctx.stroke();

        ctx.fillStyle = '#889';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`DRONES: ${rawDrones}`, x + pad + 18, curY + 4);

        curY += rowH;

        for (let i = 0; i < activeDrones.length; i++) {
            const drone = activeDrones[i];
            const isLastDrone = i === activeDrones.length - 1;

            // Canvas-drawn sub-tree connector
            ctx.strokeStyle = '#334';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + pad + 12, curY - rowH + 6);
            ctx.lineTo(x + pad + 12, curY + 2);
            ctx.moveTo(x + pad + 12, curY + 2);
            ctx.lineTo(x + pad + 22, curY + 2);
            if (!isLastDrone) {
                ctx.moveTo(x + pad + 12, curY + 2);
                ctx.lineTo(x + pad + 12, curY + rowH);
            }
            ctx.stroke();

            // Drone label: d.01, d.02
            const droneLabel = `d.${String(i + 1).padStart(2, '0')}`;
            const isHarvester = drone.type === 'harvester';
            const droneColor = isHarvester ? '#0a0' : '#a44';
            ctx.fillStyle = droneColor;
            ctx.font = '9px monospace';
            ctx.fillText(droneLabel, x + pad + 24, curY + 3);

            // Full-width energy bar
            const droneEnergyPercent = drone.energyTimer / drone.maxEnergy;
            const droneBarW = fullBarW * 0.85;
            renderNGEBar(barX, curY - 3, droneBarW, 4, droneEnergyPercent, droneColor, {
                segments: 6
            });

            // Time readout
            ctx.fillStyle = '#667';
            ctx.font = '9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.ceil(drone.energyTimer)}s`, x + w - pad - 14, curY + 3);
            ctx.textAlign = 'left';

            // Damage flash
            renderDamageFlash(barX, curY - 4, droneBarW, 6, drone.lastDamageFlashTime);

            // Status micro-grid
            const droneStatus = (drone.lastDamageFlashTime && now - drone.lastDamageFlashTime < 500) ? 'DAMAGED' :
                               drone.energyTimer < 5 ? (Math.floor(now / 300) % 2 === 0 ? 'DAMAGED' : 'ONLINE') :
                               droneEnergyPercent > 0.1 ? 'ONLINE' : 'OFFLINE';
            renderFleetStatusMicro(x + w - pad - 10, curY - 4, droneStatus, droneColor);

            curY += rowH;
        }
    }
}
```

### Impact
- `renderFleetZone` is a self-contained function; replacing it entirely is safe.
- The three `takeDamage` methods each gain one line (`this.lastDamageFlashTime = Date.now()`). Since `lastDamageFlashTime` is accessed with a truthiness check in the renderer, no initialization is needed in constructors.
- No other functions reference the internal tree-drawing or bar layout of the fleet panel.
- The `renderDamageFlash` and `renderFleetStatusMicro` helpers are defined as local functions inside `renderFleetZone` to avoid polluting global scope.

### Verification
- Coordinators should show as `COORD.H.1`, `COORD.H.2`, `COORD.A.1` etc.
- Sub-drones should show as `d.01`, `d.02` within each coordinator.
- Tree lines should be canvas-drawn (no Unicode box chars).
- Energy bars should stretch from the label area to near the right edge (~100px+ wide vs old 40px).
- Horizontal separator lines between coordinator sections at 0.15 alpha.
- When a drone takes damage, its energy bar area should strobe: red -> black -> cyan -> black over 300ms.
- Status micro-grids: 3x3 pixel grids with animated patterns per state.
- Time readouts right-aligned before the status micro-grid.

---

## Risk Assessment

### ORD.SYS Dynamic Height
- **Risk:** `missileGroupCount` might not be defined when `getHUDLayout` runs before game init. Mitigated by the `typeof` guard in the replacement code.
- **Risk:** Boot overlay uses `layout.weaponsZone.h` which is now dynamic. If it becomes too small during boot (before weapons unlock), the boot panel could look cramped. The 110px minimum prevents this.
- **Verify:** Play from wave 1 with no missiles -> unlock first missile group -> check panel resizes smoothly.

### NRG.FLOW Dazzle
- **Risk:** `nrgFlowDazzleState` is referenced before definition if code ordering is wrong. Place the state declaration at line 13782 (after `diagEnhancedState`) to ensure it's defined before any render call.
- **Risk:** `moveShift` could cause sub-pixel rendering artifacts. The `Math.min/max` clamp to +/-2px prevents excessive shift.
- **Verify:** Move UFO left/right rapidly -> grid should shift subtly. Fire weapons -> brief yellow flash. Watch sparkline update over time.

### FLEET.CMD Overhaul
- **Risk:** `lastDamageFlashTime` is accessed on objects that may not have the property. The `if (!flashTime) return;` guard handles `undefined` gracefully.
- **Risk:** Canvas `globalAlpha` is modified in `renderFleetStatusMicro`. The function resets it to 1 after the loop, but a crash inside could leave it set. Wrapping in `ctx.save()/ctx.restore()` would be safer but adds overhead for a hot path. The current approach matches existing patterns in the codebase.
- **Verify:** Deploy coordinators and drones -> check labels show correct numbering. Let enemies hit drones -> confirm flash strobe. Check status micro-grids animate per state.

---

## Summary of All Edits

| # | File | Line Range | Action | Description |
|---|------|-----------|--------|-------------|
| 1 | game.js | 13782 | INSERT | `nrgFlowDazzleState` declaration |
| 2 | game.js | 13959-13962 | REPLACE | `trackEnergyDelta` with flash triggers |
| 3 | game.js | ~13140 | INSERT | `nrgFlowDazzleState` reset in game init |
| 4 | game.js | 14066-14074 | REPLACE | Dynamic `ordPanelH` calculation |
| 5 | game.js | 15249-15271 | REPLACE | NRG.FLOW micro-dashboard |
| 6 | game.js | 15298 | REPLACE | Dynamic `panelH` in renderWeaponsZone |
| 7 | game.js | 15521-15705 | REPLACE | Full renderFleetZone overhaul |
| 8 | game.js | 9815-9819 | REPLACE | HarvesterDrone.takeDamage + flash |
| 9 | game.js | 10102-10106 | REPLACE | BattleDrone.takeDamage + flash |
| 10 | game.js | 10393-10401 | REPLACE | Coordinator.takeDamage + flash |
| 11 | game.js | 16613 | INSERT | NRG dazzle update loop sampling |
