# HUD Feedback Sprint — Design Document
**Date:** 2026-02-13
**Architect:** Gaia
**Aesthetic:** NGE NERV Command Bridge × LCARS × Xenotech Bio-Systems

---

## Overview

Five surgical modifications to the HUD system addressing player feedback. All changes respect the existing visual language: green bio-organic glow, monospace typography, NGE panel borders, and the militaristic Xenotech command aesthetic.

---

## 1. Biomatter Upload Panel — Horizontal Row Layout

### Current State
- Upload rows stack vertically in an 80px stream area within the BIO-MATTER panel
- Panel height: 110px (matches missionZone)
- Compact mode shows max 2 rows

### Design
- **One row per upload, displayed horizontally** across the panel width
- Each upload row becomes a compact horizontal cell (~60-70px wide, 14px tall) showing:
  - Animated progress bar
  - Completion flash strobe
- Cells flow left-to-right in a single row
- **Overflow queue**: When cells exceed container width, excess cells collapse into a bottom queue indicator: `+3 QUEUED ▶` with subtle pulse
- **Panel height**: Already matches missionZone at 110px — keep this. The upload stream area stays within the existing 80px stream zone

### Implementation
- Modify `renderBioMatterPanel()` (line ~14750): Change row rendering from vertical stack to horizontal flow
- Calculate `maxVisibleCells = Math.floor(streamW / (cellWidth + cellGap))`
- Overflow cells render as a queue counter at the bottom of the stream area

---

## 2. Technology Research Panel — Unified Container

### Current State
- Tech tree renders as naked rows in the gap between statusZone and missionZone (line ~16157)
- Research progress bar floats below weapons panel when gap is too small (line ~14320)
- No proper container/border

### Design
- **Proper NGE panel** with `renderNGEPanel()` container
- Section title: `TECH.SYS`
- **Same height strip** as the quota/status/mission zones (top HUD row)
- **Layout: 1/3 + 2/3 split**
  - Left 1/3: **Research Queue** — Compact list showing:
    - Active research: node name + time remaining + progress bar
    - Queue items 1-3: node name + "QUEUED" status
    - Small but legible 7px monospace
  - Right 2/3: **Tech Tree** — existing 3-track node visualization
    - Centered with proper margins
    - Clean borders between tracks
- Move the research progress bar (currently floating below weapons) INTO this panel
- Remove standalone research rendering that was overlapping the UFO

### Implementation
- Modify `renderTechTree()` (line ~16157): Wrap in NGE panel, split into two zones
- Remove the floating research bar from `renderHUDFrame()` (line ~14320)
- Research queue list rendered in left 1/3 zone

---

## 3. Wave 1 BIOS Boot Sequence

### Current State
- `startGame()` (line 12929) sets `gameState = 'PLAYING'` directly — no WAVE_TRANSITION
- BIOS boot only triggers during `WAVE_TRANSITION` state (after shop, subsequent waves)
- Boot sequence renders XENOTECH SYSTEMS BIOS POST, countdown, system checks

### Design
- Wave 1 MUST get the full BIOS boot sequence before gameplay begins
- After `startGame()` initializes game state, transition to `WAVE_TRANSITION` instead of `PLAYING`
- The UFO phase-in effect should trigger AFTER boot sequence completes (when transitioning to PLAYING)

### Implementation
- In `startGame()` (line ~12932): Change `gameState = 'PLAYING'` to `gameState = 'WAVE_TRANSITION'`
- Set `waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION`
- Move `ufoPhaseInState` initialization to the WAVE_TRANSITION→PLAYING transition (line ~22168)
- Ensure tutorial `bootWaiting` logic still works with the boot sequence present

---

## 4. Bomb Purchase Limit Enforcement

### Current State
- `CONFIG.BOMB_MAX_COUNT = 9` (line 80)
- Shop checks `playerInventory.maxBombs >= CONFIG.BOMB_MAX_COUNT` but ignores cart contents
- Player can add multiple `bomb_single` items to cart, wasting money (checkout caps via `Math.min`)

### Design
- Count `bomb_single` items already in cart when checking if purchase is allowed
- `effectiveMaxBombs = playerInventory.maxBombs + cartBombCount`
- If `effectiveMaxBombs >= CONFIG.BOMB_MAX_COUNT`, show "MAXED OUT!" and block purchase
- Same check in `getShopItemStatus()` for visual graying

### Implementation
- Modify `addToCart()` (line ~23860): Add cart-aware bomb capacity check
- Modify `getShopItemStatus()` (line ~22283): Add cart-aware bomb capacity check
- Also apply same pattern to other stackable items (missile_capacity, bomb_blast, bomb_damage)

---

## 5. Shield/Health Awareness System

### 5a. Commander Shield Guidance
- Add new commander dialogue entries for when `ufo.health < CONFIG.UFO_START_HEALTH`
- Priority: After `noShields` check in `getContextualShopGuidance()`
- Dialogue examples:
  - "Your hull's taken HITS! Buy a REPAIR KIT before you fly into another wave!"
  - "SHIELD INTEGRITY LOW. I strongly suggest repairs, commander."

### 5b. Shop Item Pulse
- When `ufo.health < CONFIG.UFO_START_HEALTH`, the `repair` and `shield_single` items in the shop pulse with a glow effect
- Subtle amber/green pulse border animation on the item card
- Only when health is below max

### 5c. UFO Status in Wave Summary
- Add a UFO STATUS section to the wave summary panel
- Split the bottom area: existing content gets 2/3, new UFO status gets 1/3 (left column)
- UFO status shows:
  - **HULL**: Health bar with current/max values
  - **ENERGY**: Current energy capacity
  - **SHIELDS**: Active shield charges
- Visual style: compact bars with numeric readouts, matching existing monospace aesthetic
- Color coding: green (>75%), yellow (25-75%), red (<25%)

### Implementation
- Add commander dialogues to `COMMANDER_DIALOGUES.shopGuidance` (line ~3314)
- Add health check to `getContextualShopGuidance()` (line ~21159)
- Add pulse effect in shop item rendering (line ~22662)
- Add UFO status section in `renderWaveSummary()` (line ~21207)

---

## Surgical Operation Order

Given the 24,507-line monolith, changes are planned to minimize conflict:

1. **Bomb limit fix** — Small, isolated change (~22283, ~23860)
2. **Wave 1 boot sequence** — Isolated to startGame() and wave transition (~12929, ~22168)
3. **Commander shield dialogue** — Additive only (~3314, ~21159)
4. **Shop item pulse** — Isolated to shop rendering (~22662)
5. **Wave summary UFO status** — Additive to wave summary renderer (~21477)
6. **Biomatter horizontal layout** — Rewrite of bio-matter stream renderer (~14801)
7. **Tech tree panel** — Restructure of tech tree renderer + removal of floating research bar (~14320, ~16157)
