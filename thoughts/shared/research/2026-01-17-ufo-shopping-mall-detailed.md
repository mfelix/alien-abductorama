---
date: 2026-01-17T12:00:00Z
researcher: Claude
git_commit: 114d6adaa3a8f9365b91618e31b2e3ea8bea3a17
branch: main
repository: alien-abductorama
topic: "Between-Wave UFO Shopping Mall - Comprehensive Technical Research"
tags: [research, gameplay, shop, economy, ufo, items, abilities, implementation]
status: complete
last_updated: 2026-01-17
last_updated_by: Claude
last_updated_note: "Comprehensive technical research with codebase analysis, implementation patterns, and detailed specifications"
---

# Research: Between-Wave UFO Shopping Mall - Comprehensive Technical Analysis

**Date**: 2026-01-17
**Researcher**: Claude
**Git Commit**: 114d6adaa3a8f9365b91618e31b2e3ea8bea3a17
**Branch**: main
**Repository**: alien-abductorama

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Research Question](#research-question)
3. [Codebase Architecture Overview](#codebase-architecture-overview)
4. [Game State System Analysis](#game-state-system-analysis)
5. [Wave Transition Hook Points](#wave-transition-hook-points)
6. [Economy & Scoring Deep Dive](#economy--scoring-deep-dive)
7. [HUD/UI Architecture](#hudui-architecture)
8. [Entity System Patterns](#entity-system-patterns)
9. [Energy System Mechanics](#energy-system-mechanics)
10. [Input Handling Architecture](#input-handling-architecture)
11. [Shop Inventory Design](#shop-inventory-design)
12. [Shop-Only Item Specifications](#shop-only-item-specifications)
13. [Visual Effects & Sound Patterns](#visual-effects--sound-patterns)
14. [Implementation Roadmap](#implementation-roadmap)
15. [Open Questions & Decisions](#open-questions--decisions)

---

## Executive Summary

This document provides comprehensive technical research for implementing a **30-second between-wave Shopping Mall** in Alien Abductio-rama. The shop introduces four new **shop-only items**: energy cells, bombs, Warp Juke, and laser turret.

**Key Findings:**
- The codebase is a **monolithic 4,166-line vanilla JavaScript** file (`js/game.js`)
- Game state management is **extensible** via a simple string-based state machine
- Wave transition logic at **line 3884** is the primary integration point
- The existing powerup system provides **proven patterns** for item effects
- Economy uses **score as currency** (no separate currency needed)
- UI rendering follows **consistent panel styling patterns** that can be reused

**Estimated Implementation Scope:** 800-1200 lines of new code

---

## Research Question

How should the between-wave UFO Shopping Mall work, and how do the new shop-only items (energy cells, bombs, Warp Juke, laser turret) integrate into the existing economy and UI without adding vertical movement or special shop items?

---

## Codebase Architecture Overview

### File Structure

```
/Users/mfelix/code/alien-abductorama/
├── js/
│   └── game.js              # 4,166 lines - ALL game logic lives here
├── src/
│   └── worker.js            # Minimal worker thread (unused for gameplay)
├── css/
│   └── style.css            # 4,684 bytes - Canvas styling, mobile splash
├── assets/
│   ├── ufo.png             # UFO sprite
│   ├── human.png           # Target sprites
│   ├── cow.png
│   ├── sheep.png
│   ├── cat.png
│   ├── dog.png
│   ├── tank.png            # Tank sprite
│   └── title.png           # Title screen
├── index.html               # 75 lines - Simple canvas bootstrap
└── dist/
    └── js/
        └── game.js          # Compiled/bundled version
```

### Technical Stack

| Aspect | Implementation |
|--------|----------------|
| Rendering | HTML5 Canvas 2D (`ctx`) |
| Audio | Web Audio API (synthesized sounds) |
| Storage | localStorage (high scores, leaderboard) |
| Modules | None - single monolithic file |
| Build | Simple bundling (dist/js/) |
| Framework | Vanilla JavaScript |

### Code Organization Within `game.js`

| Section | Lines | Description |
|---------|-------|-------------|
| CONFIG | 6-127 | All game constants and settings |
| Audio System | 129-479 | Web Audio API, SFX functions |
| Game State | 534-600 | State variables, arrays |
| Input Handling | 639-694 | Keyboard event listeners |
| Target Class | 735-930 | Abductable entities |
| UFO Class | 1041-1407 | Player ship |
| Tank Class | 1431-1631 | Regular enemy |
| Projectile Class | 1674-1805 | Shells and missiles |
| Particle System | 1810-1900 | Visual effects |
| Powerup Class | 1908-2167 | Collectible items |
| UI Rendering | 2922-3176 | HUD, panels, bars |
| Wave Transition | 3870-3965 | Between-wave logic |
| Game Loop | 3966-4166 | Main update/render |

---

## Game State System Analysis

### Current State Machine

**Location:** `js/game.js:534`

```javascript
let gameState = 'TITLE'; // TITLE, PLAYING, GAME_OVER, WAVE_TRANSITION, NAME_ENTRY
```

### State Transitions

```
┌─────────┐
│  TITLE  │◄──────────────────────────────────────┐
└────┬────┘                                       │
     │ [Space]                                    │
     ▼                                            │
┌─────────┐    timer=0    ┌────────────────┐     │
│ PLAYING │──────────────►│ WAVE_TRANSITION │     │
└────┬────┘               └───────┬────────┘     │
     │                            │               │
     │ health=0                   │ timer=0       │
     ▼                            ▼               │
┌───────────┐             ┌─────────┐            │
│ GAME_OVER │◄────────────│ PLAYING │            │
└─────┬─────┘             └─────────┘            │
      │ [Enter]                                   │
      ▼                                           │
┌─────────────┐   submit                          │
│ NAME_ENTRY  │───────────────────────────────────┘
└─────────────┘
```

### State Handler Pattern (lines 3973-3997)

```javascript
switch (gameState) {
    case 'TITLE':
        renderTitleScreen();
        break;
    case 'PLAYING':
        update(dt);
        render();
        break;
    case 'GAME_OVER':
        renderGameOverScreen();
        break;
    case 'NAME_ENTRY':
        updateParticles(dt);
        renderNameEntryScreen();
        renderParticles();
        break;
    case 'WAVE_TRANSITION':
        updateWaveTransition(dt);
        renderWaveTransition();
        break;
}
```

### Proposed Shop State Integration

```javascript
case 'SHOP':
    updateShop(dt);
    renderShop();
    break;
```

**New State Flow:**
```
WAVE_TRANSITION ──► SHOP ──► PLAYING
                    │
                    └──► (immediate exit option)
```

---

## Wave Transition Hook Points

### Primary Integration Point

**Location:** `js/game.js:3873-3892`

```javascript
function updateWaveTransition(dt) {
    waveTransitionTimer -= dt;

    // Continue updating particles for visual effect
    updateParticles(dt);
    updateFloatingTexts(dt);

    if (waveTransitionTimer <= 0) {
        // Start the new wave
        waveTimer = CONFIG.WAVE_DURATION;
        lastTimerWarningSecond = -1; // Reset timer warning
        gameState = 'PLAYING';        // ◄── CHANGE TO 'SHOP'

        // Spawn tanks for new wave
        spawnTanks();

        // Clear any remaining projectiles
        projectiles = [];
    }
}
```

### Modification Strategy

**Line 3884 Change:**
```javascript
// BEFORE:
gameState = 'PLAYING';

// AFTER:
gameState = 'SHOP';
shopTimer = CONFIG.SHOP_DURATION; // 30 seconds
```

**Tank spawning and projectile clearing moves to shop exit:**
```javascript
function exitShop() {
    gameState = 'PLAYING';
    spawnTanks();
    projectiles = [];
}
```

### Wave Completion Trigger

**Location:** `js/game.js:4074-4090`

```javascript
// Wave timer countdown
if (gameState === 'PLAYING') {
    waveTimer -= dt;
    if (waveTimer <= 0) {
        // Deactivate beam
        if (ufo) ufo.beamActive = false;

        // Award wave completion bonus
        score += CONFIG.WAVE_COMPLETE_BONUS;  // 100 points
        if (score > highScore) {
            highScore = score;
        }

        // Transition to wave transition state
        wave++;
        gameState = 'WAVE_TRANSITION';
        waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;  // 3 seconds

        SFX.waveComplete();
    }
}
```

---

## Economy & Scoring Deep Dive

### Score as Currency

The game uses **score as the sole currency**. Players spend their points in the shop.

**Score Variable:** `js/game.js:552-553`
```javascript
let score = 0;
let highScore = parseInt(localStorage.getItem('alienAbductoramaHighScore')) || 0;
```

### Point Sources

| Source | Points | Code Location | Notes |
|--------|--------|---------------|-------|
| Human | 50 | CONFIG.TARGETS.human | Highest value, slowest to abduct |
| Cow | 40 | CONFIG.TARGETS.cow | High value |
| Sheep | 30 | CONFIG.TARGETS.sheep | Medium value |
| Cat | 20 | CONFIG.TARGETS.cat | Low value, aware (flees) |
| Dog | 20 | CONFIG.TARGETS.dog | Low value |
| Regular Tank | 25 | CONFIG.TANK_POINTS | Can be abducted |
| Heavy Tank | 75 | line 2329 | Difficult to abduct |
| Wave Complete | 100 | CONFIG.WAVE_COMPLETE_BONUS | Flat bonus |

### Combo System

**Location:** `js/game.js:52-53, 554`

```javascript
// CONFIG:
COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3],
COMBO_MAX: 3,

// State:
let combo = 0;
```

**Combo Application:** `js/game.js:820-826`
```javascript
const comboIndex = Math.min(combo, CONFIG.COMBO_MAX);
const multiplier = CONFIG.COMBO_MULTIPLIERS[comboIndex];
const finalPoints = Math.floor(this.points * multiplier);
score += finalPoints;
combo++;  // Increment for next abduction
```

**Note:** Combo persists across waves - does not reset!

### Wave Scoring Estimates

Based on configuration analysis:

| Wave | Duration | Targets (~1/3s) | Tanks | Est. Score Range |
|------|----------|-----------------|-------|------------------|
| 1 | 60s | ~20 | 1 | 600-1200 |
| 2 | 60s | ~20 | 2 | 800-1600 |
| 3 | 60s | ~20 | 3 | 1000-2000 |
| 4 | 60s | ~20 | 4 | 1200-2400 |
| 5+ | 60s | ~20 | 5+ | 1400-2800+ |

**Average target value:** ~32 points (weighted by spawn rate)
**Average per wave (no combo):** ~640 points from targets + 100 bonus = ~740

### Economy Balance Implications

For items to be **affordable before Wave 3**:
- Players need ~1500-2000 points by end of Wave 2
- First energy cell at 300 points: achievable mid-Wave 1
- First bomb at 400 points: achievable late-Wave 1
- Warp Juke at 800 points: achievable early-Wave 2
- Laser Turret at 1400 points: achievable mid-Wave 2

---

## HUD/UI Architecture

### Panel Styling Pattern

**Standard Panel Background:**
```javascript
ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
ctx.beginPath();
ctx.roundRect(x, y, width, height, 8);  // 8px corner radius
ctx.fill();
```

**Text Rendering with Shadow:**
```javascript
// Shadow layer
ctx.fillStyle = '#000';
ctx.fillText(text, x + 1, y + 1);

// Main text
ctx.fillStyle = color;  // #0ff (cyan), #0f0 (green), etc.
ctx.fillText(text, x, y);
```

### Shield Bar (Energy Cell UI Target)

**Location:** `js/game.js:2991-3035`

```javascript
// ========== TOP RIGHT: SHIELD BAR ==========
const shieldBarWidth = 180;
const shieldBarHeight = 24;
const shieldX = canvas.width - shieldBarWidth - panelMargin - panelPadding;
const shieldY = panelMargin + panelPadding;

// Shield panel background
ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
ctx.beginPath();
ctx.roundRect(canvas.width - shieldBarWidth - panelMargin - panelPadding * 2,
              panelMargin,
              shieldBarWidth + panelPadding * 2,
              shieldBarHeight + panelPadding * 2, 8);
ctx.fill();

// Shield bar background
ctx.fillStyle = '#222';
ctx.beginPath();
ctx.roundRect(shieldX, shieldY, shieldBarWidth, shieldBarHeight, 4);
ctx.fill();

// Shield bar fill with gradient
const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : 1;
const shieldGradient = ctx.createLinearGradient(shieldX, 0, shieldX + shieldBarWidth * healthPercent, 0);
if (healthPercent > 0.5) {
    shieldGradient.addColorStop(0, '#0a4');
    shieldGradient.addColorStop(1, '#0f6');
} else if (healthPercent > 0.25) {
    shieldGradient.addColorStop(0, '#a80');
    shieldGradient.addColorStop(1, '#fc0');
} else {
    shieldGradient.addColorStop(0, '#800');
    shieldGradient.addColorStop(1, '#f33');
}
ctx.fillStyle = shieldGradient;
ctx.beginPath();
ctx.roundRect(shieldX, shieldY, shieldBarWidth * healthPercent, shieldBarHeight, 4);
ctx.fill();
```

**Energy Cell UI Placement:**
- Render **above** the shield panel
- Green circles: filled (available) vs outlined (used)
- Only show if player owns ≥1 cell

### Score Panel Layout

**Location:** `js/game.js:2926-2990`

```javascript
const panelMargin = 12;
const panelPadding = 15;
const scorePanelWidth = 200;
const scorePanelHeight = 70;
```

Displays:
- Score (cyan `#0ff`)
- High Score (green `#0f0`)
- Wave Number + Tank Count
- Combo Multiplier (yellow `#ff0`)

### Active Powerups Display

**Location:** `js/game.js:3113-3176`

```javascript
function renderActivePowerups() {
    const barWidth = 175;
    const barHeight = 18;
    const barSpacing = 4;

    // Progress bars for timed powerups
    // Color-coded by type
}
```

**Pattern for Bomb/Turret Stock Display:** Follow this progress bar pattern

### Layout Constants

```javascript
const panelMargin = 12;   // Distance from screen edge
const panelPadding = 15;  // Internal padding
const cornerRadius = 8;   // Rounded corners
```

---

## Entity System Patterns

### Entity Array Management

**Location:** `js/game.js:535-542`

```javascript
let ufo = null;
let targets = [];
let tanks = [];
let projectiles = [];
let particles = [];
let powerups = [];
let heavyTanks = [];
let floatingTexts = [];
```

### Class Structure Pattern

All entity classes follow this structure:

```javascript
class EntityName {
    constructor(type, x, y, ...) {
        // Properties
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        // ... entity-specific props
    }

    update(dt) {
        // Per-frame logic
        // Return false if should be removed
    }

    render() {
        // Draw to canvas
    }

    // Entity-specific methods
}
```

### Target Class (Abductable Entity Pattern)

**Location:** `js/game.js:735-930`

Key properties for abduction:
```javascript
this.beingAbducted = false;
this.abductionProgress = 0;
this.abductionSpeed = 1 / (this.weight * CONFIG.TARGET_WEIGHT_MULTIPLIER);
```

Abduction completion triggers:
```javascript
if (this.abductionProgress >= 1) {
    // Award points with combo
    // Restore UFO health
    // Restore UFO energy
    // Create floating text
    // Create particle effect
    // Play sound
    // Return false (remove entity)
}
```

### Projectile Class Pattern

**Location:** `js/game.js:1674-1805`

```javascript
class Projectile {
    constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;  // 'shell' or 'missile'
        this.radius = type === 'missile' ? 6 : 4;
        this.damage = type === 'missile' ? CONFIG.MISSILE_DAMAGE : CONFIG.SHELL_DAMAGE;
        this.trail = [];  // Missiles only
    }

    update(dt) {
        // Movement
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Trail for missiles
        if (this.type === 'missile') {
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        }

        // Check collision with UFO
        if (this.checkCollisionWithUFO()) {
            // Apply damage
            // Create explosion
            // Return false
        }

        // Off-screen check
        if (this.y < 0 || this.y > canvas.height ||
            this.x < 0 || this.x > canvas.width) {
            return false;
        }

        return true;
    }

    checkCollisionWithUFO() {
        // Circle-based collision
    }

    render() {
        // Draw projectile and trail
    }
}
```

**Bomb Class** would follow this pattern with:
- Gravity physics (vy increases over time)
- Ground collision detection
- Explosion radius on impact
- Optional bounce mechanic

### Tank Class Pattern

**Location:** `js/game.js:1431-1631`

Key aspects for Laser Turret reference:
```javascript
// Firing logic
this.fireTimer -= dt;
if (this.fireTimer <= 0) {
    this.fire();
    this.fireTimer = random(CONFIG.TANK_FIRE_INTERVAL);
}

fire() {
    // Calculate angle to UFO
    const dx = ufo.x - this.x;
    const dy = ufo.y - this.y;
    const angle = Math.atan2(dy, dx);

    // Create projectile
    projectiles.push(new Projectile(
        this.x, this.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        type
    ));
}
```

---

## Energy System Mechanics

### Configuration

**Location:** `js/game.js:12-16`

```javascript
ENERGY_MAX: 100,
ENERGY_DRAIN_RATE: 20,      // Per second while beaming
ENERGY_RECHARGE_RATE: 10,   // Per second when idle
ENERGY_MIN_TO_FIRE: 10,     // Minimum to activate beam
ENERGY_RESTORE_RATIO: 0.3,  // Energy per point from abductions
```

### UFO Energy State

**Location:** `js/game.js:1048`

```javascript
this.energy = CONFIG.ENERGY_MAX;  // Starts at 100
```

### Energy Mechanics Flow

```
BEAMING:
  energy -= ENERGY_DRAIN_RATE * dt    (20/sec)

  if (energy <= 0) {
      beamActive = false;
      energy = 0;
  }

NOT BEAMING:
  energy += ENERGY_RECHARGE_RATE * dt  (10/sec)
  energy = min(energy, ENERGY_MAX)

ABDUCTION COMPLETE:
  energyRestored = points * ENERGY_RESTORE_RATIO
  energy += energyRestored

  Example: Human (50pts) → +15 energy
           Cow (40pts) → +12 energy
```

### Energy Cell Integration Points

**Trigger Options:**

1. **On Energy Depletion** (recommended):
   ```javascript
   if (this.energy <= 0) {
       if (energyCells > 0) {
           energyCells--;
           this.energy = CONFIG.ENERGY_MAX;
           // Play sound, create effect
       } else {
           this.beamActive = false;
       }
   }
   ```

2. **On Health Depletion** (alternative):
   ```javascript
   if (this.health <= 0) {
       if (energyCells > 0) {
           energyCells--;
           this.health = CONFIG.UFO_START_HEALTH;
           // Play sound, create effect
       } else {
           gameState = 'GAME_OVER';
       }
   }
   ```

### Warp Juke Energy Cost

**Proposed:** 25 energy per use

At 25 energy cost:
- Max 4 warps from full energy (but leaves no beam energy)
- Practical limit: 2-3 warps before needing recharge
- Cannot use below 25 energy

---

## Input Handling Architecture

### Current Keyboard State

**Location:** `js/game.js:639-694`

```javascript
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Prevent default for game keys
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }

    // State-specific handling
    if (gameState === 'TITLE' && e.code === 'Space') {
        startGame();
    }
    // ... etc
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});
```

### Movement Input

**Location:** `js/game.js:1053-1065`

```javascript
// In UFO.update():
if (keys['ArrowLeft'] || keys['KeyA']) {
    this.x -= CONFIG.UFO_SPEED * dt;
}
if (keys['ArrowRight'] || keys['KeyD']) {
    this.x += CONFIG.UFO_SPEED * dt;
}

// Clamp to screen bounds
this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
```

### Double-Tap Detection for Warp Juke

**Implementation Pattern:**

```javascript
// State tracking
let lastTapTime = { left: 0, right: 0 };
const DOUBLE_TAP_WINDOW = 300;  // ms

window.addEventListener('keydown', (e) => {
    const now = performance.now();

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (!keys['ArrowLeft'] && !keys['KeyA']) {  // Only on fresh press
            if (now - lastTapTime.left < DOUBLE_TAP_WINDOW) {
                triggerWarpJuke('left');
            }
            lastTapTime.left = now;
        }
    }

    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (!keys['ArrowRight'] && !keys['KeyD']) {  // Only on fresh press
            if (now - lastTapTime.right < DOUBLE_TAP_WINDOW) {
                triggerWarpJuke('right');
            }
            lastTapTime.right = now;
        }
    }

    keys[e.code] = true;
});

function triggerWarpJuke(direction) {
    if (!warpJukeUnlocked) return;
    if (ufo.energy < 25) return;
    if (ufo.isWarping) return;

    ufo.energy -= 25;
    ufo.startWarpJuke(direction);
}
```

### Shop Input Pattern

```javascript
// In SHOP state keydown handler:
if (gameState === 'SHOP') {
    if (e.code === 'ArrowUp') {
        shopSelectedIndex = Math.max(0, shopSelectedIndex - 1);
    }
    if (e.code === 'ArrowDown') {
        shopSelectedIndex = Math.min(shopItems.length - 1, shopSelectedIndex + 1);
    }
    if (e.code === 'Enter' || e.code === 'Space') {
        purchaseSelectedItem();
    }
    if (e.code === 'Escape') {
        exitShop();
    }
}
```

---

## Shop Inventory Design

### Data Structure

```javascript
const SHOP_CONFIG = {
    DURATION: 30,  // seconds

    items: {
        energy_cell: {
            type: 'consumable',
            name: 'ENERGY CELL',
            description: 'Auto-restores energy when depleted',
            maxStock: 4,
            priceCurve: [300, 500, 800, 1200],
            color: '#0f0'
        },
        bomb: {
            type: 'consumable',
            name: 'BOMB',
            description: 'Drop explosive ordnance',
            maxStock: 3,
            price: 400,
            color: '#f00'
        },
        warp_juke: {
            type: 'ability',
            name: 'WARP JUKE',
            description: 'Double-tap to phase shift',
            oneTime: true,
            price: 800,
            color: '#0ff'
        },
        laser_turret: {
            type: 'deployable',
            name: 'LASER TURRET',
            description: 'Deployable auto-turret',
            oneTime: true,
            price: 1400,
            color: '#fa0'
        }
    }
};
```

### Player Inventory State

```javascript
let playerInventory = {
    energyCells: {
        current: 0,      // Available cells
        purchased: 0     // Total purchased (for price curve)
    },
    bombs: {
        current: 0,      // Available bombs
        maxStock: 3
    },
    warpJukeUnlocked: false,
    laserTurretUnlocked: false,
    activeTurret: null   // Currently deployed turret
};
```

### Purchase Logic

```javascript
function purchaseItem(itemKey) {
    const item = SHOP_CONFIG.items[itemKey];
    const price = getItemPrice(itemKey);

    if (score < price) {
        SFX.purchaseFailed();
        return false;
    }

    if (!canPurchase(itemKey)) {
        SFX.purchaseFailed();
        return false;
    }

    score -= price;
    applyPurchase(itemKey);
    SFX.purchaseSuccess();

    return true;
}

function getItemPrice(itemKey) {
    const item = SHOP_CONFIG.items[itemKey];

    if (item.priceCurve) {
        const index = playerInventory[itemKey].purchased;
        return item.priceCurve[Math.min(index, item.priceCurve.length - 1)];
    }

    return item.price;
}

function canPurchase(itemKey) {
    const item = SHOP_CONFIG.items[itemKey];

    if (item.oneTime) {
        return !playerInventory[itemKey + 'Unlocked'];
    }

    if (item.maxStock) {
        return playerInventory[itemKey].current < item.maxStock;
    }

    return true;
}
```

---

## Shop-Only Item Specifications

### 1. Energy Cells

**Concept:** Metroid-style reserve tanks that auto-trigger on energy depletion.

**Configuration:**
```javascript
energy_cell: {
    maxCount: 4,
    priceCurve: [300, 500, 800, 1200],  // Increasing cost
    triggerCondition: 'energy_depleted', // or 'health_depleted'
    restoreAmount: 100  // Full energy
}
```

**Visual Design:**
- Green circles rendered above shield bar
- Filled circle = available
- Empty outline = used
- Only visible if purchased ≥1

**UI Rendering:**
```javascript
function renderEnergyCells() {
    const cellCount = playerInventory.energyCells.purchased;
    if (cellCount === 0) return;

    const available = playerInventory.energyCells.current;
    const cellSize = 12;
    const spacing = 4;
    const startX = canvas.width - shieldBarWidth - panelMargin - panelPadding;
    const startY = panelMargin - cellSize - 6;  // Above shield panel

    for (let i = 0; i < cellCount; i++) {
        const x = startX + i * (cellSize + spacing);

        ctx.beginPath();
        ctx.arc(x + cellSize/2, startY + cellSize/2, cellSize/2, 0, Math.PI * 2);

        if (i < available) {
            ctx.fillStyle = '#0f0';
            ctx.fill();
        } else {
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}
```

**Trigger Logic:**
```javascript
// In UFO.update() energy drain section:
if (this.energy <= 0) {
    if (playerInventory.energyCells.current > 0) {
        playerInventory.energyCells.current--;
        this.energy = CONFIG.ENERGY_MAX;
        createFloatingText(this.x, this.y, 'ENERGY CELL!', '#0f0');
        SFX.energyCellActivate();
        screenShake = 0.2;
    } else {
        this.beamActive = false;
        this.energy = 0;
    }
}
```

### 2. Bombs

**Concept:** Droppable explosives with satisfying physics.

**Configuration:**
```javascript
bomb: {
    maxStock: 3,
    price: 400,
    damage: 50,          // Kills regular targets instantly
    heavyTankDamage: 1,  // Takes 2 bombs to kill heavy tank
    explosionRadius: 100,
    gravity: 500,        // Pixels/sec²
    bounceCoefficient: 0.3,  // Optional soft bounce
    fuseTime: 3          // Max time before auto-detonate
}
```

**Bomb Class:**
```javascript
class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.vx = 0;
        this.rotation = 0;
        this.fuseTimer = CONFIG.BOMB.fuseTime;
        this.bounced = false;
    }

    update(dt) {
        // Apply gravity
        this.vy += CONFIG.BOMB.gravity * dt;
        this.y += this.vy * dt;
        this.x += this.vx * dt;

        // Rotation for visual flair
        this.rotation += 5 * dt;

        // Ground collision
        const groundY = canvas.height - 50;  // Above ground level
        if (this.y >= groundY) {
            if (!this.bounced && CONFIG.BOMB.bounceCoefficient > 0) {
                this.bounced = true;
                this.vy = -this.vy * CONFIG.BOMB.bounceCoefficient;
                this.y = groundY;
            } else {
                this.explode();
                return false;
            }
        }

        // Fuse timer
        this.fuseTimer -= dt;
        if (this.fuseTimer <= 0) {
            this.explode();
            return false;
        }

        return true;
    }

    explode() {
        // Visual explosion
        createExplosion(this.x, this.y, 'large');

        // Check targets in radius
        for (const target of targets) {
            const dist = distance(this.x, this.y, target.x, target.y);
            if (dist < CONFIG.BOMB.explosionRadius) {
                target.blastAway();  // Spin and disappear
            }
        }

        // Check tanks
        for (const tank of tanks) {
            const dist = distance(this.x, this.y, tank.x, tank.y);
            if (dist < CONFIG.BOMB.explosionRadius) {
                tank.takeBombDamage();
            }
        }

        // Heavy tanks need 2 bombs
        for (const heavyTank of heavyTanks) {
            const dist = distance(this.x, this.y, heavyTank.x, heavyTank.y);
            if (dist < CONFIG.BOMB.explosionRadius) {
                heavyTank.bombHits++;
                heavyTank.showDamage = true;
                if (heavyTank.bombHits >= 2) {
                    heavyTank.destroy();
                }
            }
        }

        SFX.explosion(true);
        screenShake = 0.4;
    }

    render() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw bomb shape
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fuse spark
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(0, -18, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
```

**Blast Away Effect:**
```javascript
// Target method:
blastAway() {
    this.blastVelocity = {
        x: (Math.random() - 0.5) * 400,
        y: -300 - Math.random() * 200
    };
    this.spinSpeed = (Math.random() - 0.5) * 20;
    this.blasting = true;
    this.blastTimer = 2;  // Disappear after 2 seconds
}
```

**Activation Input:**
```javascript
// On 'KeyX' or 'KeyB' press:
if (e.code === 'KeyX' || e.code === 'KeyB') {
    if (playerInventory.bombs.current > 0) {
        playerInventory.bombs.current--;
        bombs.push(new Bomb(ufo.x, ufo.y + ufo.height/2));
        SFX.bombDrop();
    }
}
```

### 3. Warp Juke

**Concept:** Roguelite-style dash with invincibility frames.

**Configuration:**
```javascript
warp_juke: {
    price: 800,
    energyCost: 25,
    distance: 150,       // Pixels
    duration: 0.2,       // Seconds for animation
    invincibleDuration: 0.3  // Slightly longer than move
}
```

**UFO Extension:**
```javascript
// Add to UFO class:
this.isWarping = false;
this.warpDirection = 0;
this.warpProgress = 0;
this.warpStartX = 0;
this.warpTargetX = 0;
this.invincibleTimer = 0;

startWarpJuke(direction) {
    if (this.isWarping) return;
    if (this.energy < CONFIG.WARP_JUKE.energyCost) return;

    this.energy -= CONFIG.WARP_JUKE.energyCost;
    this.isWarping = true;
    this.beamActive = false;  // Drops the beam
    this.beamTarget = null;
    this.warpProgress = 0;
    this.warpStartX = this.x;

    const dir = direction === 'left' ? -1 : 1;
    this.warpTargetX = this.x + (CONFIG.WARP_JUKE.distance * dir);
    this.warpTargetX = Math.max(this.width/2,
                                Math.min(canvas.width - this.width/2, this.warpTargetX));
    this.invincibleTimer = CONFIG.WARP_JUKE.invincibleDuration;

    SFX.warpJuke();
}

updateWarpJuke(dt) {
    if (!this.isWarping) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }
        return;
    }

    this.warpProgress += dt / CONFIG.WARP_JUKE.duration;

    if (this.warpProgress >= 1) {
        this.x = this.warpTargetX;
        this.isWarping = false;
    } else {
        // Eased interpolation
        const t = easeOutQuad(this.warpProgress);
        this.x = lerp(this.warpStartX, this.warpTargetX, t);
    }
}

isInvincible() {
    return this.invincibleTimer > 0 || this.isWarping;
}
```

**Visual Effect:**
```javascript
// In UFO render:
if (this.isWarping || this.invincibleTimer > 0) {
    // Phase shift / chromatic aberration effect
    ctx.save();

    // Ghostly trail
    ctx.globalAlpha = 0.3;
    for (let i = 1; i <= 3; i++) {
        const trailX = lerp(this.warpStartX, this.x, 1 - i * 0.2);
        ctx.drawImage(ufoImage, trailX - this.width/2, this.y - this.height/2,
                      this.width, this.height);
    }

    // Chromatic shift
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.5;

    // Red channel offset
    ctx.filter = 'hue-rotate(-60deg)';
    ctx.drawImage(ufoImage, this.x - this.width/2 - 4, this.y - this.height/2,
                  this.width, this.height);

    // Blue channel offset
    ctx.filter = 'hue-rotate(60deg)';
    ctx.drawImage(ufoImage, this.x - this.width/2 + 4, this.y - this.height/2,
                  this.width, this.height);

    ctx.restore();
}
```

### 4. Laser Turret

**Concept:** Expensive deployable ally that draws fire and deals damage.

**Configuration:**
```javascript
laser_turret: {
    price: 1400,
    health: 50,
    fireCooldown: 1.5,
    damage: 15,
    range: 400,
    lifetime: 45,  // Seconds before auto-destroy
    attractsEnemyFire: true
}
```

**Turret Class:**
```javascript
class LaserTurret {
    constructor(x) {
        this.x = x;
        this.y = canvas.height - 80;  // Ground level
        this.width = 40;
        this.height = 60;
        this.health = CONFIG.LASER_TURRET.health;
        this.maxHealth = CONFIG.LASER_TURRET.health;
        this.fireCooldown = 0;
        this.lifetime = CONFIG.LASER_TURRET.lifetime;
        this.targetAngle = -Math.PI / 2;  // Start pointing up
    }

    update(dt) {
        this.lifetime -= dt;
        if (this.lifetime <= 0 || this.health <= 0) {
            this.destroy();
            return false;
        }

        // Find target (nearest tank/heavy tank)
        const target = this.findTarget();

        if (target) {
            // Rotate toward target
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            this.targetAngle = Math.atan2(dy, dx);
        }

        // Firing logic
        this.fireCooldown -= dt;
        if (this.fireCooldown <= 0 && target) {
            this.fire(target);
            this.fireCooldown = CONFIG.LASER_TURRET.fireCooldown;
        }

        return true;
    }

    findTarget() {
        let nearest = null;
        let nearestDist = CONFIG.LASER_TURRET.range;

        // Check tanks
        for (const tank of tanks) {
            const dist = distance(this.x, this.y, tank.x, tank.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = tank;
            }
        }

        // Check heavy tanks
        for (const heavyTank of heavyTanks) {
            const dist = distance(this.x, this.y, heavyTank.x, heavyTank.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = heavyTank;
            }
        }

        return nearest;
    }

    fire(target) {
        // Create laser beam effect
        laserBeams.push({
            x1: this.x,
            y1: this.y - this.height/2,
            x2: target.x,
            y2: target.y,
            lifetime: 0.15
        });

        // Deal damage
        target.health -= CONFIG.LASER_TURRET.damage;
        if (target.health <= 0) {
            target.destroy();
        }

        SFX.laserFire();
    }

    takeDamage(amount) {
        this.health -= amount;
        createExplosion(this.x, this.y, 'small');

        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        createExplosion(this.x, this.y, 'medium');
        SFX.turretDestroyed();
        playerInventory.activeTurret = null;
    }

    render() {
        // Base
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x - 25, this.y - 15, 50, 30);

        // Rotating barrel
        ctx.save();
        ctx.translate(this.x, this.y - 25);
        ctx.rotate(this.targetAngle + Math.PI/2);

        ctx.fillStyle = '#888';
        ctx.fillRect(-5, -30, 10, 35);

        ctx.restore();

        // Health bar
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - 20, this.y + 20, 40, 6);
        ctx.fillStyle = healthPercent > 0.3 ? '#0f0' : '#f00';
        ctx.fillRect(this.x - 20, this.y + 20, 40 * healthPercent, 6);
    }
}
```

**Enemy Targeting Modification:**
```javascript
// In Tank.fire():
fire() {
    // 40% chance to target turret if it exists and is closer
    if (playerInventory.activeTurret && Math.random() < 0.4) {
        const turretDist = distance(this.x, this.y,
                                     playerInventory.activeTurret.x,
                                     playerInventory.activeTurret.y);
        const ufoDist = distance(this.x, this.y, ufo.x, ufo.y);

        if (turretDist < ufoDist * 1.5) {
            this.fireAt(playerInventory.activeTurret);
            return;
        }
    }

    this.fireAt(ufo);
}
```

**Deployment:**
```javascript
// On 'KeyT' press:
if (e.code === 'KeyT') {
    if (playerInventory.laserTurretUnlocked && !playerInventory.activeTurret) {
        playerInventory.activeTurret = new LaserTurret(ufo.x);
        SFX.turretDeploy();
    }
}
```

---

## Visual Effects & Sound Patterns

### Particle System

**Location:** `js/game.js:1810-1900`

```javascript
function createExplosion(x, y, size) {
    const particleCount = size === 'large' ? 30 : size === 'medium' ? 20 : 10;
    const colors = ['rgb(255,102,0)', 'rgb(255,255,0)', 'rgb(255,0,0)', 'rgb(255,255,255)'];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 150;

        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2 + Math.random() * 4
        });
    }

    screenShake = 0.3;
}
```

### Floating Text

**Location:** `js/game.js:938-967`

```javascript
function createFloatingText(x, y, text, color) {
    floatingTexts.push({
        x, y,
        text,
        color,
        lifetime: 2,
        velocity: { x: 0, y: -50 }
    });
}
```

### Screen Shake

**Location:** `js/game.js:1806, 4095-4101`

```javascript
let screenShake = 0;

// In render():
if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake * 20;
    const shakeY = (Math.random() - 0.5) * screenShake * 20;
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.9;  // Decay
}
```

### Sound Effect Patterns

**Location:** `js/game.js:169-479`

```javascript
const SFX = {
    // Synthesis helper
    playTone(freq, duration, type, volume, fadeOut) { ... },

    // Existing effects
    beamOn() { ... },
    abductionSuccess() { ... },
    ufoHit() { ... },
    shieldHit() { ... },
    powerupCollect() { ... },
    waveComplete() { ... },

    // New effects to add:
    energyCellActivate() {
        this.playTone(880, 0.1, 'sine', 0.4);
        this.playTone(1100, 0.15, 'sine', 0.3);
    },

    bombDrop() {
        this.playTone(200, 0.2, 'sine', 0.5);
    },

    warpJuke() {
        this.playTone(440, 0.05, 'square', 0.3);
        this.playTone(880, 0.1, 'sine', 0.2);
    },

    turretDeploy() {
        this.playTone(150, 0.3, 'square', 0.4);
    },

    turretFire() {
        this.playTone(1200, 0.05, 'sawtooth', 0.3);
    },

    purchaseSuccess() {
        this.playTone(523, 0.1, 'sine', 0.3);
        this.playTone(659, 0.1, 'sine', 0.3);
    },

    purchaseFailed() {
        this.playTone(200, 0.2, 'square', 0.3);
    }
};
```

---

## Implementation Roadmap

### Phase 1: Shop Foundation

1. **Add `SHOP` game state**
   - Update state variable options
   - Add case to game loop switch
   - Create `updateShop(dt)` and `renderShop()` functions

2. **Hook wave transition**
   - Modify line 3884 to transition to `SHOP` instead of `PLAYING`
   - Move tank spawning to shop exit

3. **Shop timer and exit**
   - 30-second countdown
   - "Press ESC to skip" / auto-exit when timer expires
   - Transition to `PLAYING` on exit

4. **Basic shop UI**
   - Semi-transparent overlay
   - Item list with names, descriptions, prices
   - Selection highlighting
   - Points display
   - Countdown timer

### Phase 2: Purchase System

5. **Shop inventory data structure**
6. **Player inventory state**
7. **Purchase validation and execution**
8. **Price display with affordability indication**
9. **Sound effects for purchase success/failure**

### Phase 3: Energy Cells

10. **Energy cell purchase logic with price curve**
11. **Energy cell UI (green circles above shield)**
12. **Auto-trigger on energy depletion**
13. **Visual and sound feedback on activation**

### Phase 4: Bombs

14. **Bomb class with physics**
15. **Bomb explosion and damage**
16. **Target blast-away effect**
17. **Heavy tank damage tracking**
18. **Bomb drop input handling**
19. **Bomb stock UI**

### Phase 5: Warp Juke

20. **Double-tap detection**
21. **Warp animation and movement**
22. **Invincibility frames**
23. **Beam interruption on warp**
24. **Visual phase-shift effect**

### Phase 6: Laser Turret

25. **Turret class with targeting**
26. **Turret firing and damage**
27. **Enemy retargeting logic**
28. **Turret health and destruction**
29. **Turret deployment input**
30. **Turret UI indicators**

### Phase 7: Polish

31. **Balance tuning (prices, effects, timings)**
32. **Shop visual polish**
33. **Sound effect refinement**
34. **Bug fixing and edge cases**

---

## Open Questions & Decisions

### High Priority

1. **Energy Cell Trigger Condition**
   - Option A: Restore energy when energy depletes (recommended)
   - Option B: Restore health when health depletes
   - Option C: Both (complex, may trivialize difficulty)

2. **Energy Cell Maximum Count**
   - 3 cells: High tension, meaningful scarcity
   - 4 cells: Moderate (recommended, matches price curve)
   - 5 cells: Low tension, more forgiving

3. **Bomb Bounce Behavior**
   - Option A: No bounce, direct ground explosion
   - Option B: Single soft bounce (recommended for "feel-good physics")
   - Option C: Multiple bounces (potentially chaotic)

### Medium Priority

4. **Laser Turret Targeting Priority**
   - Option A: Nearest target (simple)
   - Option B: Highest threat (complex AI)
   - Option C: Player-aimed (additional input complexity)

5. **Shop Navigation**
   - Arrow keys + Enter
   - Mouse click
   - Number keys (1-4 for quick purchase)

6. **Skip Shop Entirely**
   - Should first shop after Wave 1 be mandatory introduction?
   - Allow skipping all shops via settings?

### Low Priority

7. **Visual Theme for Shop**
   - UFO interior aesthetic
   - Retro vending machine
   - Floating alien marketplace

8. **Shop Music**
   - Distinct jingle
   - Ambient hum
   - Silent with SFX only

---

## Summary

This research document provides comprehensive technical analysis for implementing the Between-Wave UFO Shopping Mall. The codebase is well-structured for extension, with clear patterns for:

- Game state management (simple string-based switch)
- Entity classes (consistent constructor/update/render pattern)
- UI rendering (panel styling with shadows and gradients)
- Sound effects (Web Audio API synthesis)
- Input handling (keyboard state object)

The wave transition hook point at `js/game.js:3884` is the primary integration point. Shop items follow established patterns from the powerup system, with modifications for consumable vs one-time purchases.

**Estimated Lines of Code:** 800-1200 new lines
**Primary File:** `js/game.js` (monolithic, add to existing)
**No New Files Required:** All code can be added to existing structure

---

*Research conducted by Claude on 2026-01-17*
