---
date: 2026-01-18T18:09:29Z
researcher: Claude
git_commit: f85da9882659bc43f79f36f8c765ec951a5ae2dd
branch: main
repository: alien-abductorama
topic: "Wave Summary Screen with Scoring Bonuses and UFO Bucks Currency System"
tags: [research, codebase, wave-system, scoring, shop, currency, animations, ui]
status: complete
last_updated: 2026-01-18
last_updated_by: Claude
last_updated_note: "Updated with design decisions for UFO Bucks, bonuses, and timing"
---

# Research: Wave Summary Screen with Scoring Bonuses and UFO Bucks Currency System

**Date**: 2026-01-18T18:09:29Z
**Researcher**: Claude
**Git Commit**: f85da9882659bc43f79f36f8c765ec951a5ae2dd
**Branch**: main
**Repository**: alien-abductorama

## Research Question

How to implement:
1. A wave summary screen after each wave showing stats, bonuses, and total points
2. Track and display cumulative targets beamed up (similar to in-game HUD)
3. Arcade-style animated count-up effects
4. UFO Bucks currency system that replaces points for shop purchases

## Summary

The codebase has all the foundational systems needed to implement these features:

1. **Wave completion detection** exists at `js/game.js:7027-7057` - currently transitions directly to SHOP state
2. **Statistics tracking** via `harvestCount` object already tracks all target types per session
3. **HUD component** at `js/game.js:5014-5088` displays target counts with icons and bounce animations
4. **Shop system** at `js/game.js:6196-6593` uses points (`score` variable) as currency
5. **No existing count-up animations** - all number updates are instant with visual feedback (bounce, floating text)
6. **Animation patterns** use delta-time, sine oscillations, and particle systems

## Detailed Findings

### 1. Wave Completion System

#### Current Flow (`js/game.js:7027-7057`)
When `waveTimer <= 0`:
1. Line 7041: Awards 100 bonus points (`CONFIG.WAVE_COMPLETE_BONUS`)
2. Line 7042: Creates floating text "WAVE X COMPLETE! +100"
3. Line 7043: Plays `SFX.waveComplete()` fanfare
4. Line 7052: Increments `wave++`
5. Line 7053: Sets `shopTimer = CONFIG.SHOP_DURATION` (30 seconds)
6. Line 7056: Transitions to `gameState = 'SHOP'`

**Implementation Note**: A new state `'WAVE_SUMMARY'` should be inserted between `'PLAYING'` and `'SHOP'` in the state machine.

#### State Machine Structure (`js/game.js:6923-6962`)
```javascript
switch (gameState) {
    case 'TITLE': ...
    case 'PLAYING': ...
    case 'GAME_OVER': ...
    case 'NAME_ENTRY': ...
    case 'WAVE_TRANSITION': ...
    case 'SHOP': ...
}
```

**New state needed**: `'WAVE_SUMMARY'` between PLAYING and SHOP.

### 2. Statistics Available for Wave Summary

#### Harvest Counter (`js/game.js:939-956`)
```javascript
let harvestCount = {
    human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0
};
```
- Incremented on abduction (line 1379)
- Incremented on tank destruction (lines 2455, 3696)
- **Limitation**: Tracks cumulative, not per-wave stats

**Implementation Note**: Need to add per-wave tracking:
```javascript
let waveStats = {
    targetsBeamed: { human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0 },
    hitsTaken: 0,
    tanksDestroyed: 0,
    basePoints: 0,
    comboBonus: 0
};
```

#### Score Tracking (`js/game.js:910-913`)
- `score` - Current total points
- `combo` - Current combo multiplier (0-3+)
- Combo multipliers at line 52: `[1, 1.5, 2, 2.5, 3]`

**Points Sources**:
| Source | Base Points | Location |
|--------|-------------|----------|
| Human abduction | 50 | line 1382 |
| Cow abduction | 40 | CONFIG.TARGETS |
| Sheep abduction | 30 | CONFIG.TARGETS |
| Cat/Dog abduction | 20 | CONFIG.TARGETS |
| Regular tank | 25 | line 2454 |
| Heavy tank | 75 | line 3695 |
| Wave complete | 100 | line 7041 |

#### Potential Bonus Metrics
- Hits taken: Track via `ufo.takeDamage()` calls (lines 2850, 4405)
- Tanks destroyed: From `harvestCount.tank` increments
- Perfect wave: No damage taken
- Speed bonus: Wave completed with time remaining
- Combo streak: Highest combo achieved

### 3. HUD Target Display Component

#### Harvest Counter Render (`js/game.js:5014-5088`)

**Layout**:
- Panel width: ~320px (6 types × 50px spacing + padding)
- Panel height: 50px
- Position: Top center, `y = 12`
- Background: `rgba(0, 0, 0, 0.4)` with 8px border radius

**Target Types**: `['human', 'cow', 'sheep', 'cat', 'dog', 'tank']`

**Icon Rendering** (lines 5052-5076):
- Base size: 24px
- Uses loaded images from `images[type]` object
- Fallback to colored shapes if image not loaded

**Bounce Animation** (lines 5040-5050):
- Scale: `1 + bounce * 0.5` (up to 1.5x)
- Vertical offset: `-bounce * 8` pixels
- Decay rate: 0.05 per frame
- Glow effect when bouncing (shadowBlur 10, shadowColor #0f0)

**Count Display** (lines 5078-5086):
- Font: `bold 12px monospace` (14px when bouncing)
- Color: `#0f0` if count > 0, else `#555`

**Reuse Pattern**: This component can be adapted for wave summary with:
- Larger icons and numbers
- Per-wave counts vs cumulative
- Animated count-up instead of instant update

### 4. Shop/Currency System

#### Current Implementation (`js/game.js:6196-6593`)

**Currency**: Uses `score` variable directly
- Deducted at line 6834: `score -= item.cost`
- Displayed in cart total (lines 6503-6520)
- Affordability check at line 6776: `score < currentCartTotal + item.cost`

**Shop Items** (`js/game.js:164-228`):
| Item | Cost | Effect |
|------|------|--------|
| Repair Kit | 100 | +25 health |
| Shield Charge | 150 | +3 charges |
| Energy Cell | 200 | +20 max energy |
| Thruster | 250 | +15% speed |
| Revive Cell | 300 | Auto-revive |
| Bomb Pack | 150 | +2 bombs |
| Laser Turret | 400 | Unlock turret |

#### UFO Bucks Implementation

**New State Variable Needed**:
```javascript
let ufoBucks = 0;
```

**Conversion Rate Options**:
1. Fixed rate: e.g., 1 UFO Buck per 100 points earned
2. Performance-based: Bonus multiplier based on wave metrics
3. Tiered: Different rates for different point sources

**Shop Modifications**:
1. Replace all `score` references with `ufoBucks` in shop functions
2. Update display text from "POINTS" to "UFO BUCKS" or "₿"
3. Keep `score` for display/leaderboard, use `ufoBucks` for purchases
4. Award UFO Bucks at end of wave summary screen

### 5. Animation Patterns

#### Existing Animation Techniques

**1. Delta-Time Updates** (primary method)
```javascript
const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
value -= dt * decayRate;
```

**2. Sine Oscillations** (smooth motion)
```javascript
const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
const waveOffset = Math.sin(titleAnimPhase * 2 + i * 0.4) * 12;
```

**3. Bounce Animation** (harvest counter)
```javascript
harvestBounce[type] = 1.0;  // Trigger
const scale = 1 + bounce * 0.5;
harvestBounce[type] = Math.max(0, harvestBounce[type] - 0.05);  // Decay
```

**4. Floating Text System** (`js/game.js:1548-1581`)
```javascript
function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, lifetime: 1.0, vy: -50 });
}
// Updates: y += vy * dt; lifetime -= dt; alpha = lifetime;
```

**5. Particle System** (explosions, confetti)
- Velocity, lifetime, size animation
- Used for celebration effects in name entry screen

#### Count-Up Animation Pattern (To Implement)

**No existing count-up** - need to implement:

```javascript
// Proposed count-up animation system
class CountUpAnimation {
    constructor(startValue, endValue, duration) {
        this.current = startValue;
        this.target = endValue;
        this.duration = duration;
        this.elapsed = 0;
    }

    update(dt) {
        this.elapsed += dt;
        const progress = Math.min(1, this.elapsed / this.duration);
        // Ease-out curve for arcade feel
        const eased = 1 - Math.pow(1 - progress, 3);
        this.current = Math.floor(this.startValue + (this.target - this.startValue) * eased);
        return progress >= 1;  // Returns true when complete
    }
}
```

**Sound Pattern**: Play tick sound at increasing frequency as count progresses (similar to `SFX.timerWarning` pattern at lines 7018-7023).

### 6. Wave Summary Screen Design

#### Proposed Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     WAVE 3 COMPLETE!                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TARGETS BEAMED:                                            │
│  [👤 x12] [🐄 x3] [🐑 x2] [🐱 x1] [🐕 x1] [🔫 x4]          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  WAVE POINTS:           1,850  ←──── (count up animation)   │
│                                                             │
│  BONUSES:                                                   │
│  👽 ABDUCTION MASTER    +25%   ←──── (19 targets beamed)    │
│  💥 TANK HUNTER         +25%   ←──── (4 tanks destroyed)    │
│  🔥 COMBO KING          +25%   ←──── (achieved 3x combo)    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  BASE UFO BUCKS:        ₿18    ←──── (1,850 ÷ 100)          │
│  BONUS UFO BUCKS:       ₿13    ←──── (18 × 75% = 13.5)      │
│                         ─────                               │
│  UFO BUCKS EARNED:      ₿31    ←──── (dramatic reveal)      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  TOTAL UFO BUCKS:       ₿45                                 │
│  CUMULATIVE SCORE:      4,750                               │
│                                                             │
│         [PRESS ENTER TO CONTINUE] (or auto in 2s)           │
└─────────────────────────────────────────────────────────────┘
```

#### Animation Sequence
1. Title "WAVE X COMPLETE!" appears with pulse effect (0.5s)
2. Target icons appear one by one with bounce (0.3s each = 1.8s total)
3. Wave points count up with tick sound (1.0s)
4. Bonus lines reveal one by one with fanfare if achieved (0.4s each = 1.2s max)
5. UFO Bucks calculation animates (0.8s)
6. Cumulative totals appear (instant)
7. Auto-continue countdown (2.0s)

**Total Animation Time**: ~6 seconds + 2s auto-continue = 8 seconds max

#### Skip Functionality
- First SPACE/ENTER: Instantly complete all animations, show final values
- Second SPACE/ENTER: Transition to shop immediately

### 7. Implementation Roadmap

#### Phase 1: Wave Statistics Tracking
1. Add `waveStats` object to track per-wave metrics
2. Hook into scoring events to update wave stats
3. Add hit tracking to `ufo.takeDamage()`
4. Reset wave stats at wave start

#### Phase 2: Wave Summary State
1. Add `'WAVE_SUMMARY'` to game state machine
2. Create `updateWaveSummary(dt)` function
3. Create `renderWaveSummary()` function
4. Modify wave completion to transition to WAVE_SUMMARY instead of SHOP

#### Phase 3: Count-Up Animation System
1. Implement `CountUpAnimation` class
2. Create tick/counting sound effect
3. Build animation sequencer for staggered reveals

#### Phase 4: UFO Bucks Currency
1. Add `ufoBucks` state variable
2. Calculate and award UFO Bucks at wave summary end
3. Modify shop to use `ufoBucks` instead of `score`
4. Update all shop UI text and displays

#### Phase 5: Cumulative Target Display
1. Keep existing `harvestCount` for cumulative totals
2. Display cumulative counts in wave summary
3. Optionally show in shop or HUD as well

## Code References

### Wave Completion
- `js/game.js:7027-7057` - Wave completion trigger and state transition
- `js/game.js:97` - `CONFIG.WAVE_COMPLETE_BONUS = 100`
- `js/game.js:56-62` - Wave duration and transition constants

### Statistics
- `js/game.js:939-956` - `harvestCount` and `harvestBounce` objects
- `js/game.js:910-913` - `score`, `highScore`, `combo` variables
- `js/game.js:1375-1401` - Target abduction scoring
- `js/game.js:2446-2463` - Tank destruction scoring

### HUD Components
- `js/game.js:5014-5088` - `renderHarvestCounter()` function
- `js/game.js:4627-4736` - Main HUD rendering (score, wave, timer, shield)
- `js/game.js:5090-5153` - Active powerups display

### Shop System
- `js/game.js:6196-6593` - Main shop rendering and logic
- `js/game.js:164-228` - `CONFIG.SHOP_ITEMS` array
- `js/game.js:6813-6846` - `checkoutCart()` function
- `js/game.js:6848-6885` - `applyShopItemEffect()` function

### Animation Patterns
- `js/game.js:1548-1581` - Floating text system
- `js/game.js:3139-3231` - Particle system
- `js/game.js:5040-5050` - Bounce animation example
- `js/game.js:6148-6153` - Pulsing text example
- `js/game.js:5912-5917` - Sine wave animation example

### State Machine
- `js/game.js:893` - `gameState` variable
- `js/game.js:6923-6962` - Main game loop state dispatcher
- `js/game.js:6091-6110` - Wave transition update example

## Architecture Documentation

### State Machine Pattern
The game uses a simple string-based state machine. Adding a new state requires:
1. Declare state name in switch statement (`js/game.js:6923-6962`)
2. Create `update[StateName](dt)` function
3. Create `render[StateName]()` function
4. Define transitions in/out of the state

### Currency Pattern
Currently, `score` serves dual purpose:
- Display metric (leaderboard)
- Currency (shop purchases)

Separating to UFO Bucks:
- `score` - Display/leaderboard only
- `ufoBucks` - Shop currency only
- Both persist across waves, reset on game start

### Animation Pattern
Consistent pattern across codebase:
1. Trigger: Set state variable to initial value
2. Update: Modify value based on delta time
3. Render: Use value for visual properties
4. Complete: Check threshold and handle completion

## Design Decisions

The following decisions have been made for the implementation:

### 1. UFO Bucks Conversion System

**Base Rate**: 1 UFO Buck per 100 wave points (rounded down)

**Bonus Multipliers** (applied to base UFO Bucks earned):
| Bonus | Condition | Multiplier |
|-------|-----------|------------|
| Abduction Master | 10+ targets beamed in wave | +25% |
| Tank Hunter | 3+ tanks destroyed in wave | +25% |
| Combo King | Achieved 3x combo (max) at least once | +25% |

**Example Calculation**:
- Wave points earned: 1,850
- Base UFO Bucks: 18 (1850 ÷ 100)
- Bonuses achieved: Abduction Master (+25%), Combo King (+25%)
- Bonus UFO Bucks: 18 × 0.50 = 9
- **Total UFO Bucks**: 27

**Rationale**: This system rewards skilled play while keeping the base rate simple. The three bonuses encourage diverse gameplay - abducting many targets, destroying tanks, and maintaining combos.

### 2. Wave Summary Timing

**Fixed Duration**: ~5-6 seconds for full animation sequence
- Title appears: 0.5s
- Target icons reveal: 1.8s (6 types × 0.3s each)
- Stats count up: 2.0s (base + bonuses)
- UFO Bucks award: 0.8s
- Cumulative totals: instant
- Brief pause before continue prompt: 0.5s

**Auto-Continue**: After animations complete + 2 second pause, automatically transition to shop
- Total screen time: ~8 seconds if player doesn't interact

### 3. Skip Functionality

**Skip Behavior**: Press SPACE or ENTER at any time to:
1. Instantly complete all pending animations (show final values)
2. Display "PRESS ENTER TO CONTINUE" prompt
3. Second press transitions to shop

**Rationale**: Respects player time while still showing the satisfying animations by default. Two-press skip prevents accidental skipping.

### 4. Three Bonus Categories (Final Selection)

| Bonus | Icon | Threshold | Description |
|-------|------|-----------|-------------|
| **Abduction Master** | 👽 | 10+ targets | Rewards efficient beaming |
| **Tank Hunter** | 💥 | 3+ tanks | Rewards combat engagement |
| **Combo King** | 🔥 | Hit 3x combo | Rewards precision timing |

**Why These Three**:
- **Abduction Master**: Core gameplay loop - encourages the main objective
- **Tank Hunter**: Rewards risk-taking and offensive play
- **Combo King**: Rewards skill and patience (holding position during beam)

**Rejected Alternatives**:
- "No Damage" - Too punishing for new players, discourages experimentation
- "Speed Bonus" - Timer already creates urgency, don't need more
- "All Targets" - Too dependent on spawn RNG

## Open Questions (Resolved)

~~1. **UFO Bucks Conversion Rate**: Should it be linear (1:100) or performance-based with bonuses?~~
**Decision**: Linear base (1:100) with three +25% bonus multipliers

~~2. **Wave Summary Duration**: Fixed time or wait for user input?~~
**Decision**: Fixed animation time (~6s) + 2s pause, then auto-continue to shop

~~3. **Skip Option**: Allow skipping animations with button press?~~
**Decision**: Yes - SPACE/ENTER skips to end, second press continues

~~4. **Bonus Categories**: Which performance metrics should grant bonuses?~~
**Decision**: Abduction Master (10+ targets), Tank Hunter (3+ tanks), Combo King (3x combo)

## Remaining Open Questions

1. **Sound Design**: Need new SFX for count-up ticks and UFO Bucks award?
2. **Persistent Stats**: Should cumulative targets display in shop/HUD?
3. **Shop Item Rebalancing**: Do shop prices need adjustment for UFO Bucks economy?
