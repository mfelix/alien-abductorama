# HUD Harmony — Architecture Analysis

**Date**: 2026-02-13
**Role**: The Architect
**Source**: `/Users/mfelix/code/alien-abductorama/js/game.js` (24,599 lines)

---

## 1. COMPONENT MAP — Every Relevant Component

### 1A. Layout Engine

| Component | Function | Lines | Notes |
|-----------|----------|-------|-------|
| HUD Layout Calculator | `getHUDLayout()` | 14044-14077 | Returns all zone rects. **THE MASTER LAYOUT.** |
| HUD Frame Renderer | `renderHUDFrame()` | 14239-14429 | Orchestrates all HUD panel rendering |
| Legacy UI Renderer | `renderUI()` | 17607-17804 | **LEGACY** top-bar with score, shield, quota, harvest counter. Still called! |

### 1B. Top-Row Panels (NGE HUD — during gameplay)

| Component | Function | Lines | Zone Key | Y | H |
|-----------|----------|-------|----------|---|---|
| SYS.STATUS (top-left) | `renderStatusZone()` | 14450-14525 | `statusZone` | `margin` = 10 | 120 |
| TECH.SYS (top-left gap) | `renderTechTree()` | 16072-16367 | Computed from gap | `statusZone.y` = 10 | `statusZone.h` = 120 |
| MISSION.CTL (top-center) | `renderMissionZone()` | 14563-14651 | `missionZone` | **4** | 110 |
| BIO-MATTER (top-right gap) | `renderBioMatterPanel()` | 14653-14857 | `bioMatterZone` | **4** | 110 |
| SYS.INTG (top-right) | `renderSystemsZone()` | 14921-15000+ | `systemsZone` | `margin` = 10 | 90 (dynamic, 48-90+) |

### 1C. Legacy Top-Bar (overlaid on top of NGE panels)

| Component | Function | Lines | Y Position |
|-----------|----------|-------|-----------|
| Score Panel | in `renderUI()` | 17611-17634 | `panelMargin` = 12 |
| Wave/Timer/Combo | in `renderUI()` | 17636-17674 | `panelMargin + scorePanelHeight + 10` = 92 |
| Shield Bar | in `renderUI()` | 17676-17766 | `panelMargin + panelPadding` = 27 |
| Quota Progress | `renderQuotaProgress()` | 17817-17882 | **panelY = 4** |
| Harvest Counter | `renderHarvestCounter()` | 18275-18348 | **panelY = 26** |
| Research Progress | `renderResearchProgress()` | 18007-18040 | **panelY = 100** |
| Bio-Matter Counter | `renderBioMatterCounter()` | 17806-17815 | `panelMargin + scorePanelHeight + 38` = 120 |

### 1D. Shop Panels (between-wave shop overlay)

| Component | Lines | Notes |
|-----------|-------|-------|
| Shop Layout Constants | 22310-22322 | W, H, pad, bottomBarH, leftW, rightW |
| Technology Research (right column) | 22885-23300 | Full tech tree with info cards |
| Tech Tree Node Sizing | 23024-23031 | tierSpacing, nodeH, nodeTopY calculations |

### 1E. Energy Bar (on UFO)

| Component | Function | Lines | Notes |
|-----------|----------|-------|-------|
| UFO Energy Bar | `UFO.renderEnergyBar()` | 6537-6599 | Called from `ufo.render()` at line 6255 |
| Energy bar call site | `this.renderEnergyBar(drawY - 20)` | 6255 | Positioned 20px above UFO drawY |

---

## 2. CURRENT MEASUREMENTS — All Margins, Paddings, Heights

### 2A. getHUDLayout() Constants (line 14044-14077)

```
margin = 10
leftW = Math.min(210, canvas.width * 0.18)
rightW = Math.min(195, canvas.width * 0.16)
centerW = 280
centerX = (canvas.width - centerW) / 2
```

### 2B. Zone Positions (returned by getHUDLayout)

| Zone | x | y | w | h |
|------|---|---|---|---|
| statusZone | 10 | **10** | leftW | **120** |
| missionZone | centerX | **4** | 280 | **110** |
| bioMatterZone | missionEnd+4 | **4** | gap width | **110** |
| systemsZone | canvas.width-rightW-10 | **10** | rightW | **90** |
| weaponsZone | 10 | 140 | leftW | 200 |
| fleetZone | canvas.width-rightW-10 | 108+ | rightW | 300 |
| commanderZone | 10 | canvas.height-110 | min(260,22%) | 100 |
| diagnosticsZone | canvas.width-rightW-10 | canvas.height-290 | rightW | 160 |
| opsLogZone | canvas.width-rightW-10 | canvas.height-120 | rightW | 100 |

### 2C. TOP MARGIN ASYMMETRY (THE CORE PROBLEM)

| Panel | Top Y | Top Margin from viewport |
|-------|-------|-------------------------|
| SYS.STATUS | 10 | **10px** |
| TECH.SYS | 10 (matches statusZone.y) | **10px** |
| MISSION.CTL | 4 | **4px** |
| BIO-MATTER | 4 | **4px** |
| SYS.INTG | 10 | **10px** |

**FINDING**: Left panels (STATUS, TECH) and right panel (SYSTEMS) use margin=10. Center panels (MISSION, BIO-MATTER) use y=4. This creates a **6px vertical misalignment** in the top row.

### 2D. Legacy Overlay Measurements

| Component | Y | Height | Bottom Edge |
|-----------|---|--------|-------------|
| Quota Progress bar | 4 | 20 | 24 |
| Harvest Counter panel | 26 | 50 | 76 |
| Research Progress bar | 100 | 18+4=22 | 122 |

### 2E. Bottom Edge Alignment

| Panel | Top Y | Height | Bottom Edge |
|-------|-------|--------|-------------|
| SYS.STATUS | 10 | 120 | **130** |
| TECH.SYS | 10 | 120 | **130** |
| MISSION.CTL | 4 | 110 | **114** |
| BIO-MATTER | 4 | 110 | **114** |
| SYS.INTG | 10 | 90 (dynamic) | **100** (min 62) |

**FINDING**: Bottom edges are wildly misaligned. STATUS/TECH end at 130, MISSION/BIO end at 114, SYSTEMS ends at 100-110. No horizontal harmony.

---

## 3. LAYOUT RELATIONSHIPS — Spatial Dependencies

### 3A. Render Order (Draw Stack)

```
1. Background
2. Game entities (targets, tanks, drones, coordinators)
3. UFO (includes energy bar) ← rendered BEFORE HUD
4. Particles, floating texts
5. ctx.restore() — end screen shake
6. renderHUDFrame() — all NGE panels  ← HUD ON TOP of UFO
7. renderHealthFreakout()
8. renderHUDBootGlobalEffects()
9. Tutorial hints, coord charge hint
10. Timer critical warning, damage flash
```

**CRITICAL**: The UFO (step 3) renders its energy bar at `drawY - 20`. Then the HUD (step 6) renders ON TOP. This means the HUD panels will always be above the UFO energy bar in the Z-order. The energy bar can ONLY clip behind legacy top-bar elements (quota, harvest counter) which are rendered in `renderUI()` — but wait...

### 3B. Where is renderUI() called?

Searching... `renderUI` is NOT called from `renderHUDFrame`. Let me verify:

The legacy `renderUI()` at line 17607 contains the quota progress, harvest counter, shield bar, etc. But the NGE HUD uses `renderMissionZone()` which has its own quota bar and harvest counter.

**KEY FINDING**: There appear to be TWO rendering paths:
- **NGE HUD path** (via `renderHUDFrame` → `renderMissionZone`): Quota bar at zone.y=4, harvest counter at y+30=34
- **Legacy path** (via `renderUI`): Quota at y=4, harvest counter at y=26

Let me check which is active...

The `renderMissionZone()` (line 14563) renders quota at `zone.y` (=4) with h=26, then harvest at `y + 30` (=34).

The legacy `renderQuotaProgress()` (line 17817) renders at hardcoded `panelY = 4`, h=20.
The legacy `renderHarvestCounter()` (line 18275) renders at hardcoded `panelY = 26`, h=50.

**ANSWER**: Both systems render overlapping content at similar positions. The legacy renderUI is called from `renderHUDFrame` is NOT the case — they're separate. Looking at the main render call...

At line 24553: `renderHUDFrame()` — this renders the NGE panels including missionZone with quota+harvest.

**Is renderUI() also called?** Searching shows `renderUI()` is defined but we need to verify if it's called during gameplay. The function at 17607 contains score panel, shield bar, etc. that are visible during gameplay.

The answer: `renderUI()` handles the score/shield/bomb/missile top-bar that exists OUTSIDE the NGE panel system. The NGE `missionZone` handles the center quota/harvest display. They coexist but cover different screen areas.

### 3C. Bio-Matter Zone Positioning

```
missionEnd = centerX + centerW
systemsStart = canvas.width - rightW - margin
bioGapX = missionEnd + 4
bioGapW = systemsStart - 4 - bioGapX
```

The bio-matter panel fills the gap between MISSION and SYSTEMS zones. Its width is dynamic based on screen width. Minimum 120px to render.

### 3D. Tech Tree Zone Positioning

```
statusEnd = layout.statusZone.x + layout.statusZone.w  (= 10 + leftW)
missionStart = layout.missionZone.x  (= centerX)
gapStartX = statusEnd + 6
gapEndX = missionStart - 6
gapW = gapEndX - gapStartX
```

The TECH.SYS panel fills the gap between STATUS and MISSION zones. Minimum 140px to render.

---

## 4. ENERGY BAR ISSUE — Root Cause Analysis

### 4A. UFO Energy Bar Position

```js
// Line 6254-6255 (inside UFO.render())
this.renderEnergyBar(drawY - 20);
```

The energy bar renders at `drawY - 20`, where `drawY` is the UFO's screen Y position minus half height (it's the top-left corner of the UFO sprite). The bar is:
- Width: 130px (line 6538)
- Height: 14px (line 6539)
- Centered on UFO X: `x = this.x - barWidth / 2` (line 6540)

### 4B. UFO Vertical Movement

The UFO has a floating/bouncing animation. When it bounces upward, `drawY` decreases, moving the energy bar closer to the top of the screen.

### 4C. The Clipping Explanation

The energy bar is rendered at step 3 (game entities), BEFORE the HUD at step 6. The HUD panels are drawn on top. So when the UFO bounces high enough:

1. Energy bar is drawn at `ufo.y - ufo.height/2 - 20` (roughly)
2. Harvest counter panel bottom edge is at Y=76 (legacy) or Y=82 (NGE: 4+30+48=82)
3. If UFO rises above roughly Y=96 (bar top = 96-20=76), the energy bar overlaps with the harvest counter area
4. The HUD panels paint OVER the energy bar, making it appear to "clip behind" the targets button

### 4D. Recommended Fix

Two options:
1. **Reduce top component stack height** so the overlap zone is smaller (Task #4)
2. **Clamp the energy bar Y** so it never goes above a certain threshold
3. **Both** — shrink the top stack AND add a minimum Y clamp

The most elegant fix is reducing the top stack height, which solves the overlap naturally.

---

## 5. BIOMATTER UPLOAD STRUCTURE

### 5A. State Management

```js
// Line 13739-13747 — bioUploadState
bioUploadState = {
    flashAlpha: 0,
    uploadPhase: 'idle',      // 'idle'|'uploading'|'complete'
    uploadCounter: 0,
    uploadTicks: 0,
}

// Line 13843 — bioUploadRows array
bioUploadRows = [];  // Array of { spawnTime, progress, phase, flashStartTime }
```

Upload rows are spawned when targets are beamed (lines 4281-4283, 9565-9567, 10884-10886, 24450-24452):
```js
bioUploadRows.push({ spawnTime: Date.now() + _br * 50, progress: 0, phase: 'uploading', flashStartTime: 0 });
```

### 5B. Current Visual Design (renderBioMatterPanel, lines 14653-14857)

**Panel structure**:
- Full panel: `x, y, w, h` from `bioMatterZone` (y=4, h=110)
- Header area: top 22px (BM value display, blink lights)
- Stream area: `streamX=x+4, streamY=y+24, streamW=w-8, streamH=80`
- Footer: last 6px (ACTIVE/IDLE status, bit rate)

**Upload cells** (lines 14735-14832):
- Layout: horizontal flow grid (multiple columns x multiple rows)
- `cellW = compact ? 50 : 65` (compact when panel w < 200)
- `cellH = 14`
- `cellGap = 3`
- `maxCols = Math.floor((streamW + cellGap) / (cellW + cellGap))`
- `maxRows = Math.floor(streamH / rowH)` where `rowH = cellH + 2 = 16`
- Each cell: background + progress bar fill + border + chevron animation + percentage text
- Completion: flash phase (300ms rapid color cycling) then collapse animation

**PROBLEM**: The cells are narrow (50-65px) in a grid layout. They don't span the full width. For a panel that might be 150-300px wide, you get 2-4 columns of tiny progress bars. This feels cramped and doesn't provide satisfying visual feedback.

### 5C. Where to Modify for Full-Width Bars

The entire upload rendering is in `renderBioMatterPanel()` lines 14653-14857. The key section to replace is lines 14735-14832 (ACTIVE STATE rendering). The idle state (14716-14733) can stay. The completion flash logic needs to be adapted for full-width bars.

---

## 6. TECH TREE LAYOUT — In-Game Panel (TECH.SYS)

### 6A. Container Calculation (lines 16089-16101)

```js
const statusEnd = layout.statusZone.x + layout.statusZone.w;
const missionStart = layout.missionZone.x;
const gapStartX = statusEnd + 6;
const gapEndX = missionStart - 6;
const gapW = gapEndX - gapStartX;

const panelX = gapStartX;
const panelY = layout.statusZone.y;       // = 10
const panelW = gapW;
const panelH = layout.statusZone.h;       // = 120
```

### 6B. Interior Split (lines 16124-16128)

```js
const researchW = Math.floor(innerW * 0.33);      // Left 1/3
const treeW = innerW - researchW - 3;              // Right 2/3 (3px divider)
const researchX = innerX;                           // = panelX + 3
const treeX = innerX + researchW + 3;
```

Interior starts at `innerY = panelY + 18` (below header), height `innerH = panelH - 22`.

### 6C. Node Sizing (lines 16243-16256)

```js
const isMicro = treeW < 160;
const nodeW = isMicro ? 26 : Math.min(40, Math.floor((treeW - 30) / 5));
const nodeH = isMicro ? 12 : Math.min(18, Math.floor((innerH - 20) / 3.6));
const nodeGap = isMicro ? 3 : Math.min(6, Math.floor((treeW - 5 * nodeW) / 4));
const nodesPerTrack = 5;
const trackNodeWidth = nodesPerTrack * nodeW + (nodesPerTrack - 1) * nodeGap;

// Centering — THIS IS THE FLOATING BEHAVIOR
const startX = treeX + Math.max(2, (treeW - trackNodeWidth) / 2);

// Vertical centering
const rowH = nodeH + 4;
const totalTreeH = 3 * rowH + 2 * 2;      // 3 rows with 2px gaps
const baseY = innerY + Math.max(2, (innerH - totalTreeH) / 2);
```

**PROBLEM**: The nodes are centered both horizontally and vertically within the 2/3 area, but with capped maximum sizes (`nodeW` max 40, `nodeH` max 18). This means on wider screens, there's excessive whitespace around the nodes. They float in the center instead of filling the container.

### 6D. How to Fix (Task #8)

The key formulas to change are on lines 16243-16256. Instead of capping sizes and centering the remainder, the nodes should:
1. Calculate available width: `treeW - (some padding)`
2. Divide evenly: `nodeW = (availableW - gaps) / 5`
3. Calculate available height: `innerH - (some padding)`
4. Divide evenly: `nodeH = (availableH - gaps) / 3`
5. No centering — start from edge with consistent padding

---

## 7. SURGICAL EDIT PLAN

### Task #3: Uniform Top Margins Across All Panels

**Goal**: All top-row panels at the same Y position.

**Current State**:
- STATUS, TECH, SYSTEMS: Y=10
- MISSION, BIO-MATTER: Y=4

**Fix**: Change missionZone and bioMatterZone Y from 4 to 10.

| Edit | Line | Current | New |
|------|------|---------|-----|
| missionZone Y | 14068 | `missionZone: { x: centerX, y: 4, w: centerW, h: 110 }` | `missionZone: { x: centerX, y: 10, w: centerW, h: 110 }` |
| bioMatterZone Y | 14069 | `bioMatterZone: { x: bioGapX, y: 4, w: bioGapW, h: 110 }` | `bioMatterZone: { x: bioGapX, y: 10, w: bioGapW, h: 110 }` |

**Also update legacy overlay positions**:

| Edit | Line | Current | New |
|------|------|---------|-----|
| Quota panelY | 17823 | `const panelY = 4;` | `const panelY = 10;` |
| Harvest panelY | 18282 | `const panelY = 26;` | `const panelY = 32;` |
| Research panelY | 18016 | `const panelY = 100;` | `const panelY = 106;` |

**Impact**: All panels now start at Y=10. Clean horizontal alignment.

---

### Task #4: Reduce Quota/Targets Stack Height by ~10px

**Goal**: Shorter center column stack to prevent energy bar clipping.

**Current Stack Height**:
- MISSION zone: y=4 (will become 10), h=110 → bottom at 114 (will become 120)
- Inside: quota bar h=26 (line 14568), harvest counter at y+30 h=48 (line 14862)
- Total used: 26 + 4 (gap) + 48 = 78px of 110

**Fix**: Reduce mission zone height from 110 to 100, reduce quota bar height from 26 to 20, reduce harvest counter height from 48 to 42.

| Edit | Line | Current | New |
|------|------|---------|-----|
| missionZone h | 14068 | `h: 110` | `h: 100` |
| bioMatterZone h | 14069 | `h: 110` | `h: 100` |
| Quota bar height | 14568 | `const barH = 26;` | `const barH = 20;` |
| Harvest counter offset | 14639 | `const harvestY = y + 30;` | `const harvestY = y + 24;` |
| Harvest panel height | 14862 | `const panelH = 48;` | `const panelH = 42;` |
| Legacy harvest panelH | 18280 | `const panelHeight = 50;` | `const panelHeight = 44;` |
| Legacy harvest panelY | 18282 | `const panelY = 26;` | `const panelY = 32;` (already from Task #3) |
| Legacy quota panelH | 17821 | `const panelHeight = 20;` | `const panelHeight = 16;` |
| Mission indicator positions | 14648-14650 | `y + 110 - 6` | `y + 100 - 6` (adjust to new height) |

**Result**: Center stack shortens by ~10px. Bottom edge moves from 114→110 (with Y=10, from 120→110).

---

### Task #5: Squish Biomatter Panel Height to Match

**Goal**: BIO-MATTER panel bottom edge aligns with other panels.

**Current**: bioMatterZone y=4, h=110 → bottom=114
**After Tasks 3+4**: y=10, h should match → bottom should be ~110

| Edit | Line | Current | New |
|------|------|---------|-----|
| bioMatterZone h | 14069 | `h: 110` | `h: 100` |
| Stream area height | 14697 | `const streamH = 80;` | `const streamH = 70;` |

Already done in Task #4 (bioMatterZone h change). The stream area inside needs adjustment too.

---

### Task #6: Squish Technology Research Panel Height to Match

**Goal**: TECH.SYS panel bottom edge aligns with other panels.

**Current**: panelH = layout.statusZone.h = 120, at Y=10 → bottom=130
**Target**: bottom=110 → need height 100

The TECH.SYS panel currently matches statusZone height (120). We need it to match the new target.

**Option A**: Change statusZone height from 120 to 100. This also changes SYS.STATUS.
**Option B**: Decouple TECH.SYS height from statusZone.

Since STATUS and TECH.SYS are adjacent, they should match. And if we want bottom=110, STATUS should also be h=100 at y=10.

| Edit | Line | Current | New |
|------|------|---------|-----|
| statusZone h | 14067 | `statusZone: { x: margin, y: margin, w: leftW, h: 120 }` | `statusZone: { x: margin, y: margin, w: leftW, h: 100 }` |
| systemsZone h | 14070 | `systemsZone: { x: ..., y: margin, w: rightW, h: 90 }` | `systemsZone: { x: ..., y: margin, w: rightW, h: 100 }` |
| Status panel render height | 14455 | `renderNGEPanel(x, y, w, 120, ...)` | `renderNGEPanel(x, y, w, 100, ...)` |
| Status scanlines height | 14458 | `renderNGEScanlines(x, y, w, 120, ...)` | `renderNGEScanlines(x, y, w, 100, ...)` |
| Status indicator Y | 14513 | `renderNGEIndicator(x + 4, y + 120 - 8, ...)` | `renderNGEIndicator(x + 4, y + 100 - 8, ...)` |
| Status indicator Y | 14514 | `renderNGEIndicator(x + w - 8, y + 120 - 8, ...)` | `renderNGEIndicator(x + w - 8, y + 100 - 8, ...)` |
| Status indicator Y | 14519-14520 | threshold positions at 120-8 | adjust to 100-8 |
| Powerups start Y | 14524 | `renderPowerupsInStatus(x, y + 120 + 4)` | `renderPowerupsInStatus(x, y + 100 + 4)` |
| Weapons zone Y | 14071 | `weaponsZone: { x: margin, y: 140, w: leftW, h: 200 }` | `weaponsZone: { x: margin, y: 120, w: leftW, h: 200 }` |
| Boot overlay height (status) | 14266 | `renderPanelBootOverlay(layout.statusZone, 120, ...)` | `renderPanelBootOverlay(layout.statusZone, 100, ...)` |
| Mission indicator Y refs | 14648 | `y + 110 - 6` | `y + 100 - 6` |
| Mission indicator Y refs | 14649 | same | same |
| Mission indicator Y refs | 14650 | same | same |

**RESULT**: All panels bottom edge = Y 110:
- STATUS: 10 + 100 = 110
- TECH.SYS: 10 + 100 = 110
- MISSION: 10 + 100 = 110
- BIO-MATTER: 10 + 100 = 110
- SYSTEMS: 10 + 100 = 110 (was 90, now 100)

**PERFECT HORIZONTAL HARMONY.**

---

### Task #7: Biomatter Upload Full-Width Progress Bars

**Goal**: Replace grid-of-cells layout with full-width row layout.

**Target file section**: Lines 14735-14832 (ACTIVE STATE in renderBioMatterPanel)

**Current design**: Grid of 50-65px cells in multiple columns
**New design**: Full-width rows, max 3 visible, "+N queued" overflow

**Replace lines 14735-14832** with:

```
- cellW = streamW - 4 (full width minus 2px padding each side)
- cellH = 18 (taller for readability)
- maxVisible = 3
- rowGap = 4
- Layout: stacked vertically, one per row
- Each row: full-width progress bar with chevron animation
- Queue overflow: "+N QUEUED" at bottom if more than 3
```

Key constants to change:
```
Line 14736: cellW = compact ? 50 : 65  →  cellW = streamW - 4
Line 14737: cellH = 14                 →  cellH = Math.floor((streamH - 16) / 3)
Line 14738: cellGap = 3               →  cellGap = 3
Lines 14740-14742: maxCols/maxRows/maxVisible calculation → maxVisible = 3
Line 14748-14751: col/row positioning → simple vertical stack
```

---

### Task #8: Technology Tree Positions to Fill Container

**Goal**: Nodes fill the 2/3 rectangle instead of floating centered.

**Target file section**: Lines 16243-16256 (node dimensions and positioning in renderTechTree)

**Current**: Nodes capped at 40x18 with centered remainder
**New**: Nodes sized to fill available space with consistent edge padding

**Replace lines 16243-16256** with:

```
const edgePad = 4;
const availableW = treeW - edgePad * 2;
const availableH = innerH - 4; // 2px top/bottom padding
const nodeGap = Math.max(2, Math.floor(availableW * 0.02));
const nodesPerTrack = 5;
const nodeW = Math.floor((availableW - (nodesPerTrack - 1) * nodeGap) / nodesPerTrack);
const rowGap = 2;
const nodeH = Math.floor((availableH - 2 * rowGap) / 3);
const trackNodeWidth = nodesPerTrack * nodeW + (nodesPerTrack - 1) * nodeGap;
const startX = treeX + edgePad;
const baseY = innerY + 2;
const rowH = nodeH + rowGap;
```

This removes the `isMicro` path (no longer needed since nodes scale dynamically), removes the min/max caps, and uses the full available space.

---

## 8. DEPENDENCY GRAPH

```
Task #3 (uniform margins)
    ↓
Task #4 (reduce stack height) + Task #5 (bio height) + Task #6 (tech/status height)
    ↓
Task #7 (bio upload redesign) + Task #8 (tech tree fill)
    ↓
Task #9 (QA verification)
```

Tasks #3-6 should be done together as they all modify `getHUDLayout()` at lines 14067-14070. A single coordinated edit to the layout function is cleaner than multiple passes.

---

## 9. UNIFIED LAYOUT CHANGE (Recommended Single Edit)

Rather than doing Tasks #3, #4, #5, #6 separately, apply one coordinated change to `getHUDLayout()`:

**Line 14067-14070 — BEFORE**:
```js
statusZone: { x: margin, y: margin, w: leftW, h: 120 },
missionZone: { x: centerX, y: 4, w: centerW, h: 110 },
bioMatterZone: { x: bioGapX, y: 4, w: bioGapW, h: 110 },
systemsZone: { x: canvas.width - rightW - margin, y: margin, w: rightW, h: 90 },
```

**Line 14067-14070 — AFTER**:
```js
statusZone: { x: margin, y: margin, w: leftW, h: 100 },
missionZone: { x: centerX, y: margin, w: centerW, h: 100 },
bioMatterZone: { x: bioGapX, y: margin, w: bioGapW, h: 100 },
systemsZone: { x: canvas.width - rightW - margin, y: margin, w: rightW, h: 100 },
```

All zones: Y=10 (margin), H=100. Bottom edge = 110 everywhere. **Perfect harmony.**

Then propagate internal adjustments to each panel's render function.
