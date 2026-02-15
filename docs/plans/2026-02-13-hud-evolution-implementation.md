# HUD Evolution Implementation Plan

## Overview
8 surgical modifications to game.js to harmonize the HUD system. All changes target the monolithic `js/game.js`. Changes are ordered to minimize conflicts and can be executed serially with precise line-range scoping.

## Reference Constants
- **Target first-row height**: 72px (established in commits 856bb9d, 3ec3710)
- **Margin**: 10px
- **Left panel width**: `Math.min(210, canvas.width * 0.18)`
- **Right panel width**: `Math.min(195, canvas.width * 0.16)`
- **Max bombs**: 9 (3 columns x 3 rows)
- **Max missile groups**: 18 (3 columns x 6 rows)
- **Missile group size**: 4 missiles per group

---

## TASK 1: Remove SALVO RDY from Ordnance Panel
**Complexity**: Trivial | **Lines**: 15393-15402

Remove the "SALVO RDY" text that pulses in the ordnance panel when all missile groups are ready.

**Delete** lines 15393-15402:
```js
// SALVO RDY indicator
const allGroupsReady = missileGroups.every(g => g.ready);
if (allGroupsReady) {
    const pulse = Math.sin(Date.now() / 200) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 68, 0, ${pulse})`;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SALVO RDY', x + w - 8, curY);
    ctx.textAlign = 'left';
}
```

Also remove "SALVO RDY" from the standalone missile count popup (lines 12216-12224):
```js
// SALVO RDY text
if (allReady) { ... }
```

---

## TASK 2: Missile Launch Flash Animation
**Complexity**: Medium | **Lines**: 11742-11763 (fire), 15409-15501 (render), 3240 (state)

Add a bio-upload-style flash when a missile group is fired. Inspired by the biomatter flash at lines 14769-14793 (25ms phase cycling: green/black/cyan/white).

### 2a: Add flash state to missile group objects
At line 3240, update the missile group structure:
```js
// Each group: { ready: bool, rechargeTimer: float, index: int, launchFlashTime: 0 }
```

At line 24192 and 24197 where groups are created, add `launchFlashTime: 0`:
```js
missileGroups = [{ ready: true, rechargeTimer: 0, index: 0, launchFlashTime: 0 }];
// and
missileGroups.push({ ready: true, rechargeTimer: 0, index: missileGroupCount - 1, launchFlashTime: 0 });
```

### 2b: Set flash time on launch
In `fireMissileGroup()` at line 11762, after `group.ready = false;`:
```js
group.launchFlashTime = Date.now();
```

### 2c: Render flash in ordnance panel missile rendering
In `renderWeaponsZone` at the missile group loop (line 15409), add flash overlay per group:
```js
// After rendering each group's missiles, check for launch flash
if (group.launchFlashTime > 0) {
    const flashAge = Date.now() - group.launchFlashTime;
    if (flashAge < 400) {
        // Phase cycling like bio-upload: 25ms per phase
        const flashPhase = Math.floor(flashAge / 30) % 4;
        let flashColor;
        switch (flashPhase) {
            case 0: flashColor = 'rgba(255, 68, 0, 0.8)'; break;
            case 1: flashColor = 'rgba(0, 0, 0, 0.6)'; break;
            case 2: flashColor = 'rgba(255, 200, 0, 0.7)'; break;
            default: flashColor = 'rgba(255, 68, 0, 0.5)'; break;
        }
        // Flash entire group row
        const flashW = CONFIG.MISSILE_GROUP_SIZE * (missileW + missileSpacing);
        ctx.fillStyle = flashColor;
        ctx.fillRect(missilesStartX - 2, rowY - 2, flashW + 4, missileH + 4);
    } else {
        group.launchFlashTime = 0; // Clear
    }
}
```

---

## TASK 3: Normalize SYS.STATUS Height to 72px
**Complexity**: Medium | **Lines**: 14060-14093 (layout), 14481-14556 (render), 14282 (boot)

### 3a: Update layout
In `getHUDLayout()` line 14083:
```js
statusZone: { x: margin, y: margin, w: leftW, h: 72 },
```

Also update `weaponsZone` y-position (line 14087):
```js
weaponsZone: { x: margin, y: margin + 72 + 10, w: leftW, h: 200 },
// was: y: 140
```

### 3b: Redesign renderStatusZone
The panel needs to fit score, high score, wave, and time into 72px height.

```js
function renderStatusZone(zone) {
    const { x, y, w, h } = zone;
    const pad = 8;

    renderNGEPanel(x, y, w, h, { color: '#0ff', cutCorners: ['tl'], label: 'SYS.STATUS' });
    renderNGEScanlines(x, y, w, h, 0.012);

    // Score (with breathing room - 8px below panel header ~14px)
    const scoreText = score.toLocaleString();
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(scoreText, x + pad + 4, y + 32);

    // High score
    ctx.fillStyle = '#445';
    ctx.font = '9px monospace';
    ctx.fillText(`HI ${highScore.toLocaleString()}`, x + pad + 4, y + 42);

    // Wave + Timer line
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`WAVE ${wave}`, x + pad + 4, y + 58);

    // Timer
    const displayTime = Math.max(0, waveTimer);
    const minutes = Math.floor(displayTime / 60);
    const seconds = Math.floor(displayTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (waveTimer <= 10 && gameState === 'PLAYING') {
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgb(255, ${Math.floor(pulse * 80)}, ${Math.floor(pulse * 80)})`;
        ctx.font = 'bold 14px monospace';
    } else {
        ctx.fillStyle = '#8899aa';
        ctx.font = '13px monospace';
    }
    ctx.fillText(timeStr, x + pad + 90, y + 58);

    // REMOVED: Combo display (was at y+88)
    // REMOVED: renderPowerupsInStatus call (blue squares)

    // Blinking status light
    renderNGEBlinkLight(x + w - 12, y + 8, '#0ff', 800);

    // Panel indicators (adjusted for new height)
    renderNGEIndicator(x + 4, y + h - 8, 'diamond', '#0ff', 'steady', { rate: 1200 });
    renderNGEIndicator(x + w - 8, y + h - 8, 'circle', '#0ff', 'reactive', {
        reactiveValue: waveTimer,
        reactiveThresholds: [
            { threshold: 30, rate: 1500 },
            { threshold: 10, rate: 600 },
            { threshold: 0, rate: 200 }
        ]
    });
}
```

### 3c: Remove renderPowerupsInStatus call and function
- Remove call at line 14555
- Optionally keep function for future use but don't render it

### 3d: Update boot overlay
Line 14282: Change hardcoded `120` to `layout.statusZone.h`:
```js
renderPanelBootOverlay(layout.statusZone, layout.statusZone.h, '#0ff', 'SYS.STATUS', ...);
```

---

## TASK 4: Normalize Shield Panel Height to 72px + Rename
**Complexity**: Medium | **Lines**: 14950-15061 (render), 14086 (layout), 14324 (boot)

### 4a: Update layout
Line 14086:
```js
systemsZone: { x: canvas.width - rightW - margin, y: margin, w: rightW, h: 72 },
// was: h: 90
```

### 4b: Redesign renderSystemsZone
Fixed 72px height. Remove speed/energy bonus indicators (moved to NRG.FLOW). Keep shield bar + revive cells. Rename to 'SYS.SHIELD'. Smaller revive cells.

```js
function renderSystemsZone(zone) {
    const { x, y, w, h } = zone;
    const pad = 6;

    // Fixed height panel - no longer dynamic
    renderNGEPanel(x, y, w, h, { color: '#f80', cutCorners: ['tr'], label: 'SYS.SHIELD' });

    // Shield bar
    const shieldY = y + 22;
    const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;
    let shieldColor;
    if (healthPercent > 0.5) shieldColor = '#0f6';
    else if (healthPercent > 0.25) shieldColor = '#fc0';
    else shieldColor = '#f33';

    renderNGELabel(x + pad, shieldY, 'SHLD', '#f80');
    const shieldVal = ufo ? Math.ceil(ufo.health) : Math.ceil(finalHealth);
    ctx.fillStyle = shieldColor;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${shieldVal}/${CONFIG.UFO_START_HEALTH}`, x + w - pad, shieldY);
    ctx.textAlign = 'left';

    renderNGEBar(x + pad, shieldY + 6, w - pad * 2, 14, healthPercent, shieldColor, {
        segments: 10, pulse: healthPercent < 0.25, glow: true
    });

    // Status dot
    const shieldStatus = healthPercent > 0.5 ? 'nominal' : healthPercent > 0.25 ? 'caution' : 'critical';
    renderNGEStatusDot(x + w - pad - 2, shieldY + 12, shieldStatus);

    // Revive cells (smaller, 10px)
    const cells = playerInventory.energyCells;
    if (cells > 0) {
        const cellY = shieldY + 24;
        renderNGELabel(x + pad, cellY + 2, 'REVIVE', '#f55');
        const cellSize = 10;
        const cellSpacing = 3;
        const cellStartX = x + pad + 48;

        for (let i = 0; i < cells; i++) {
            const cx = cellStartX + i * (cellSize + cellSpacing);
            const cy = cellY - 2;
            const pulse = Math.sin(Date.now() / 200 + i * 0.8) * 0.3 + 0.7;

            ctx.fillStyle = `rgba(255, 85, 85, ${pulse * 0.25})`;
            ctx.fillRect(cx - 1, cy - 1, cellSize + 2, cellSize + 2);
            ctx.fillStyle = `rgba(255, 85, 85, ${pulse})`;
            ctx.fillRect(cx, cy, cellSize, cellSize);

            ctx.save();
            ctx.beginPath();
            ctx.rect(cx, cy, cellSize, cellSize);
            ctx.clip();
            const angle = Date.now() / 300 + i;
            ctx.fillStyle = `rgba(255, 200, 200, ${pulse * 0.5})`;
            ctx.beginPath();
            ctx.arc(cx + cellSize/2 + Math.cos(angle) * 2, cy + cellSize/2 + Math.sin(angle) * 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.strokeStyle = `rgba(255, 120, 120, ${pulse * 0.8})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, cellSize, cellSize);
        }
    }

    // REMOVED: Speed indicator (moved to NRG.FLOW)
    // REMOVED: Energy bonus indicator (moved to NRG.FLOW)

    // Panel indicators
    renderNGEIndicator(x + 4, y + 4, 'square', '#f80', 'steady', { rate: 600 });
    const shldPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;
    const sysJColor = shldPct > 0.5 ? '#f80' : (shldPct > 0.25 ? '#fc0' : '#f44');
    renderNGEIndicator(x + 4, y + h - 8, 'cross', sysJColor, 'reactive', {
        reactiveValue: shldPct, reactiveThresholds: [
            { threshold: 0.5, rate: 1000 },
            { threshold: 0.25, rate: 500 },
            { threshold: 0, rate: 150 }
        ], glowIntensity: shldPct < 0.25 ? 8 : 4
    });
    renderNGEIndicator(x + w - 8, y + h - 8, 'diamond', '#f80', 'steady', { rate: 800 });
}
```

### 4c: Update boot overlay
Line 14324: Change hardcoded `88` to `layout.systemsZone.h`:
```js
renderPanelBootOverlay(layout.systemsZone, layout.systemsZone.h, '#f80', 'SYS.SHIELD', ...);
```

---

## TASK 5: NRG.FLOW Panel - Always Visible + Static Height + Enhanced
**Complexity**: High | **Lines**: 15063-15163+ (render), 14067-14073 (layout), 14328 (visibility), 14378 (diag gate)

### 5a: Make NRG.FLOW always visible
Remove tech gate in `renderEnergyGraph` (line 15064):
```js
// REMOVE: if (!techFlags.beamConduit) return;
```

Remove tech gate in visibility check in `renderHUDFrame` (line 14328):
```js
// Change from: if (panelReady('systems') && !booting)
// To: if (panelReady('systems'))
// And remove the booting check since NRG.FLOW should render post-boot
```

### 5b: Static positioning
Replace the dynamic height calculation in `renderEnergyGraph` (lines 15068-15076) with:
```js
const graphY = y + 72 + 8; // Fixed: shield panel (72) + 8px gap
```

Update `getHUDLayout` fleet zone calculation (lines 14067-14073):
```js
// NRG.FLOW is always visible now, static height
const nrgFlowH = 100; // Static height for NRG.FLOW
const nrgFlowY = margin + 72 + 8; // Below systems zone
let fleetY = nrgFlowY + nrgFlowH + 10; // Below NRG.FLOW
```

### 5c: Enhanced rendering with upgrade indicators
After the existing energy graph rendering, add upgrade indicator section:
```js
// Energy augmentation indicators (moved from shield panel)
let indicatorY = graphY + graphH + 2;
if (playerInventory.speedBonus > 0) {
    const bonusPercent = Math.round(playerInventory.speedBonus * 100);
    renderNGELabel(x + 6, indicatorY, `SPD.BOOST +${bonusPercent}%`, '#ff0');
    renderNGEStatusDot(x + w - 8, indicatorY - 3, 'nominal');
    indicatorY += 12;
}
if (playerInventory.maxEnergyBonus > 0) {
    renderNGELabel(x + 6, indicatorY, `NRG.AUG +${playerInventory.maxEnergyBonus}`, '#7ff');
    renderNGEStatusDot(x + w - 8, indicatorY - 3, 'nominal');
    indicatorY += 12;
}
```

### 5d: Increase NRG.FLOW height to accommodate upgrades
Change graph height from 72 to ~100px to fit the energy graph + upgrade indicators:
```js
const graphH = 100; // was 72
```

Adjust internal graph area proportions accordingly.

### 5e: Add beam-reactive energy visualization
Add a sinusoidal overlay to the graph that responds to beam state:
```js
// Beam-reactive sinusoidal overlay
if (ufo) {
    const beamIntensity = ufo.beamActive ? 1.0 : 0.3;
    ctx.strokeStyle = `rgba(0, 255, 255, ${beamIntensity * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const freq = ufo.beamActive ? 0.15 : 0.05;
    const amp = ufo.beamActive ? gh * 0.3 : gh * 0.1;
    const phase = Date.now() / (ufo.beamActive ? 200 : 1000);
    for (let px = 0; px <= gw; px++) {
        const sy = gy + gh / 2 + Math.sin(px * freq + phase) * amp;
        if (px === 0) ctx.moveTo(gx + px, sy);
        else ctx.lineTo(gx + px, sy);
    }
    ctx.stroke();
}
```

---

## TASK 6: Ordnance Panel Static Height with Empty Slots
**Complexity**: High | **Lines**: 15280-15505 (renderWeaponsZone)

### 6a: Calculate static height for max capacity
```js
// Static dimensions for max capacity
const maxBombs = CONFIG.BOMB_MAX_COUNT;        // 9
const maxMissileGroups = CONFIG.MISSILE_MAX_GROUPS; // 18
const bombRows = Math.ceil(maxBombs / bombCols);   // 3 rows
const maxMissileCols = 3;
const maxMissileRowsPerCol = Math.ceil(maxMissileGroups / maxMissileCols); // 6

let panelH = 28; // header
panelH += bombRows * (bombSize + bombSpacing) + 14; // bombs section always shown
panelH += maxMissileRowsPerCol * groupRowH + 12;    // missiles section always shown
panelH += 8; // bottom pad
```

### 6b: Show empty bomb/missile slots
For bombs, always render all 9 slots:
```js
for (let i = 0; i < maxBombs; i++) {
    const filled = i < bombCount;
    const owned = i < playerInventory.maxBombs;

    if (filled) {
        // existing filled bomb rendering
    } else if (owned) {
        // existing empty but owned rendering (recharge arc)
    } else {
        // EMPTY UNOWNED slot - military style
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(bx, by, bombSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('N/A', bx, by + 2);
    }
}
```

For missiles, always render all 18 group slots:
```js
// Always show all possible group slots
for (let gi = 0; gi < maxMissileGroups; gi++) {
    const group = gi < missileGroupCount ? missileGroups[gi] : null;
    // ... existing col/row calculations using maxMissileGroups

    if (group) {
        // existing group rendering (ready or recharging)
    } else {
        // EMPTY UNOWNED group - military N/A style
        const groupLabel = String.fromCharCode(65 + gi);
        ctx.fillStyle = '#222';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(groupLabel, colX, rowY + missileH / 2 + 3);

        for (let mi = 0; mi < CONFIG.MISSILE_GROUP_SIZE; mi++) {
            const mx = missilesStartX + mi * (missileW + missileSpacing);
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(mx, rowY + 2, missileW, missileH - 2);
        }
    }
}
```

### 6c: Always show both sections (bombs + missiles)
Remove conditional checks `if (playerInventory.maxBombs > 0)` and `if (missileUnlocked && missileGroupCount > 0)`.
Always render both sections with appropriate N/A styling for unowned slots.

---

## TASK 7: Move DIAG.SYS and OPS.LOG to Left Side
**Complexity**: Medium | **Lines**: 14060-14093 (layout), 14377-14415 (visibility/render)

### 7a: Update layout positions
In `getHUDLayout()`, change diagnosticsZone and opsLogZone:
```js
// Calculate ordnance panel bottom (static height)
const ordPanelH = /* static height from Task 6 */;
const ordBottom = margin + 72 + 10 + ordPanelH; // status(72) + gap(10) + ordnance

diagnosticsZone: { x: margin, y: ordBottom + 10, w: leftW, h: 160 },
opsLogZone: { x: margin, y: ordBottom + 180, w: leftW, h: 100 }
```

### 7b: Update slide direction
DIAG.SYS and OPS.LOG currently slide in from the right. Change to slide from left:
```js
// Was: translate(diagSlideOffset, 0) — positive offset (from right)
// Now: translate(-diagSlideOffset, 0) — negative offset (from left)
const diagSlideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * -leftW;
```

Same for OPS.LOG:
```js
const opsSlideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * -leftW;
```

---

## TASK 8: Fleet Zone Positioning Update
**Complexity**: Low | **Lines**: 14067-14073

Fleet zone positioning in `getHUDLayout` needs to account for the new static NRG.FLOW panel:
```js
const nrgFlowY = margin + 72 + 8;
const nrgFlowH = 100;
let fleetY = nrgFlowY + nrgFlowH + 10;
```

This was partially covered in Task 5 but called out separately for clarity.

---

## Implementation Order (Critical Path)

Because this is a monolith, execution order matters:

1. **TASK 1** (remove SALVO RDY) - Trivial deletion, no dependencies
2. **TASK 2** (missile flash) - Adds state + rendering, isolated
3. **TASK 3** (status panel 72px) - Layout change + render rewrite
4. **TASK 4** (shield panel 72px + rename) - Layout change + render rewrite
5. **TASK 5** (NRG.FLOW enhancement) - Depends on Task 4 for shield height
6. **TASK 6** (ordnance static height) - Depends on Task 3 for weaponsZone.y
7. **TASK 7** (move diag+ops to left) - Depends on Task 6 for ordnance height
8. **TASK 8** (fleet positioning) - Depends on Task 5

### Parallelization Opportunities
- Tasks 1+2 can run in parallel (different code sections)
- Tasks 3+4 can run in parallel (status vs systems zone - different functions)
- Tasks 5+8 run together (same layout area)
- Tasks 6+7 must be serial (7 depends on 6's height)

### Conflict Zones
- `getHUDLayout()` (lines 14060-14093): Touched by Tasks 3, 4, 5, 7, 8 — **must be edited in one pass**
- `renderHUDFrame()` (lines 14255-14430): Touched by Tasks 5, 7 — edit together
- `renderWeaponsZone()`: Only Task 6
- `renderStatusZone()`: Only Task 3
- `renderSystemsZone()`: Only Task 4
- `renderEnergyGraph()`: Only Task 5

## Recommended Surgical Agent Strategy

Given the conflict zones, the safest approach:

**Agent 1**: Edit `getHUDLayout()` — ALL layout changes in one pass (Tasks 3a, 4a, 5b, 7a, 8)
**Agent 2**: Rewrite `renderStatusZone()` (Task 3b, 3c, 3d)
**Agent 3**: Rewrite `renderSystemsZone()` + update boot overlay label (Task 4b, 4c)
**Agent 4**: Enhance `renderEnergyGraph()` + update visibility in `renderHUDFrame` (Task 5)
**Agent 5**: Rewrite `renderWeaponsZone()` for static sizing + empty slots + flash (Tasks 2c, 6)
**Agent 6**: Move DIAG.SYS/OPS.LOG slide directions in `renderHUDFrame` (Task 7b)
**Agent 7**: Add missile launch flash state (Tasks 1, 2a, 2b) — small scattered edits

### Serial Order for Agents
1. Agent 7 first (small state changes across file)
2. Agent 1 second (layout changes — foundation for everything)
3. Agents 2, 3, 4 in parallel (independent render functions)
4. Agent 5 (ordnance rewrite)
5. Agent 6 (diag/ops slide direction)
