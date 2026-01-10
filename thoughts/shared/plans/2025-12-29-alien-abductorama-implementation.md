# Alien Abductio-rama Implementation Plan

## Overview

Build a playable browser-based arcade game where players control a UFO abducting earthlings while evading tank fire. Focus on getting to a playable demo as fast as possible with a single `game.js` file.

## Current State Analysis

- **Greenfield project** - no code exists yet
- **Complete GDD** at `docs/GAME_DESIGN_DOCUMENT.md` with all mechanics specified
- **No assets** - will need PNG sprites for title, UFO, targets, and tank body
- **No HTML/CSS/JS** - starting from scratch

## Desired End State

A fully playable game with:
- UFO movement and tractor beam abduction
- 5 target types with flee behavior
- Tanks with aiming turrets that shoot shells/missiles
- Wave-based endless gameplay with scoring
- Title screen, gameplay, and game over states
- Sound effects via Web Audio API

**Verification**: Open `index.html` in browser, play through multiple waves, verify all mechanics work.

## What We're NOT Doing

- No ES6 modules - single `game.js` file
- No unit tests - playtesting only
- No mobile/touch controls
- No pause menu, achievements, or stretch goals
- No build tools or bundlers

## Asset Strategy

| Asset | Source |
|-------|--------|
| title.png | PNG file (needs to be created/provided) |
| ufo.png | PNG file |
| human.png, cow.png, sheep.png, cat.png, dog.png | PNG files |
| tank.png | PNG file (body only) |
| Tank turret | Drawn programmatically (canvas/SVG style) |
| Bullets, missiles | Drawn programmatically |
| Tractor beam | Drawn programmatically (spiral effect) |
| Explosions | Drawn programmatically (anime-style circles) |

---

## Phase 1: Core Engine & UFO

### Overview
Set up the HTML/Canvas structure, game loop, and get the UFO moving on screen.

### Changes Required:

#### 1.1 Create index.html

**File**: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alien Abductio-rama</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script src="js/game.js"></script>
</body>
</html>
```

#### 1.2 Create css/style.css

**File**: `css/style.css`

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    overflow: hidden;
    background: #000;
}

#gameCanvas {
    display: block;
    width: 100vw;
    height: 100vh;
}
```

#### 1.3 Create js/game.js with core engine

**File**: `js/game.js`

Initial structure:
- CONFIG object with all tuning variables
- Canvas setup and resize handling
- Game state management (TITLE, PLAYING, GAME_OVER)
- Main game loop with delta time
- Input handling (keyboard state tracking)
- UFO class with movement
- Basic rendering (background, UFO)

Key sections to implement:
```javascript
// Configuration constants (from GDD section 11)
const CONFIG = { /* all tuning variables */ };

// Game state
let gameState = 'TITLE';
let ufo, targets, tanks, projectiles, particles;

// Input tracking
const keys = {};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize handler for fullscreen
function resize() { /* ... */ }

// Game loop
function gameLoop(timestamp) { /* ... */ }

// UFO class
class UFO { /* movement, render */ }
```

### Success Criteria:

#### Automated Verification:
- [x] `index.html` opens in browser without console errors
- [x] Canvas fills viewport and resizes correctly

#### Manual Verification:
- [x] UFO sprite renders on screen (or placeholder rectangle)
- [x] UFO moves left/right with arrow keys
- [x] UFO stops at screen edges
- [x] Movement feels responsive (400 px/sec)

---

## Phase 2: Targets & Abduction Beam

### Overview
Add target spawning, the tractor beam visual, and basic abduction mechanics.

### Changes Required:

#### 2.1 Target class and spawning

**File**: `js/game.js`

Add:
- Target class with type, position, weight, points
- Spawn logic (max 5 on screen, random intervals)
- Wander behavior (slow left/right movement)
- Flee behavior (detect beam, run away)
- Target rendering (sprites or placeholder shapes)

#### 2.2 Tractor beam system

**File**: `js/game.js`

Add:
- Beam state (active, current target, progress)
- Beam rendering (cone shape with spiral effect)
- Beam-target collision (point-in-cone check)
- Target lock and rise animation
- UFO immobility while beaming
- Abduction completion (points, target removal)

#### 2.3 Energy system

**File**: `js/game.js`

Add:
- Energy bar (100 max, drain at 20/sec, recharge at 10/sec)
- Minimum energy check (10 to fire)
- Energy bar rendering above UFO

### Success Criteria:

#### Automated Verification:
- [x] No console errors during gameplay

#### Manual Verification:
- [x] Targets spawn on ground and wander
- [x] Holding SPACE activates beam (cone visual with spiral)
- [x] Beam locks onto targets within cone
- [x] Locked target rises toward UFO
- [x] UFO cannot move while beaming
- [x] Successful abduction awards points
- [x] Releasing SPACE early drops target (no points)
- [x] Energy drains while beaming, recharges when not
- [x] Cannot fire beam below 10 energy
- [x] Targets flee when beam is near them

---

## Phase 3: Combat (Tanks & Projectiles)

### Overview
Add tank enemies with aiming turrets, projectiles, health system, and explosions.

### Changes Required:

#### 3.1 Tank class

**File**: `js/game.js`

Add:
- Tank class with position, speed, patrol direction
- Tank body rendering (sprite)
- Turret rendering (drawn programmatically, aims at UFO)
- Patrol AI (move left/right, reverse at edges)
- Fire logic (shells every 2-3 sec, missile every 4th shot)

#### 3.2 Projectile system

**File**: `js/game.js`

Add:
- Projectile class (type: shell/missile, position, velocity, damage)
- Shell rendering (small yellow circle)
- Missile rendering (red elongated shape with trail)
- Projectile-UFO collision detection
- Projectile removal when off-screen or hit

#### 3.3 Health system

**File**: `js/game.js`

Add:
- UFO health (100 HP)
- Damage on projectile hit (shell: 10, missile: 25)
- Healing on successful abduction (+5 HP or points/10)
- Health bar rendering
- Game over when health reaches 0

#### 3.4 Tank abduction

**File**: `js/game.js`

Add:
- Tanks can be abducted (25 points)
- Abducted tank explodes near UFO (no damage to player)
- Tank respawns at edge after 3 seconds

#### 3.5 Explosion effects

**File**: `js/game.js`

Add:
- Particle class for explosion circles
- Anime-style explosion (20-30 circles, random sizes/colors)
- Particles expand then shrink, fade out
- Screen shake on big explosions (optional)

### Success Criteria:

#### Automated Verification:
- [x] No console errors during combat

#### Manual Verification:
- [x] Tank renders with body sprite and drawn turret
- [x] Turret smoothly tracks UFO position
- [x] Tank patrols left/right
- [x] Tank fires shells (yellow circles)
- [x] Every 4th shot is a missile (red with trail)
- [x] Projectiles damage UFO on hit
- [x] Health bar decreases on hit
- [x] Abducting targets heals UFO
- [x] Tanks can be abducted (explode, award 25 points)
- [x] Anime-style explosions look good
- [x] Game over triggers when health reaches 0

---

## Phase 4: Game Flow & Scoring

### Overview
Add wave system, timer, combo scoring, and game state screens.

### Changes Required:

#### 4.1 Wave system

**File**: `js/game.js`

Add:
- Wave number tracking
- Wave configuration (tanks per wave, speed scaling)
- Wave transition (3-second pause, "WAVE X" text)
- 60-second timer per wave
- Wave completion bonus (100 points)

#### 4.2 Combo system

**File**: `js/game.js`

Add:
- Combo counter (resets on UFO movement)
- Combo multipliers (1x, 1.5x, 2x, 2.5x, 3x max)
- Apply multiplier to abduction points
- Visual feedback for combo (display multiplier)

#### 4.3 UI rendering

**File**: `js/game.js`

Add:
- Score display (top left)
- Wave indicator
- Timer display
- High score tracking (localStorage)
- Floating score numbers on abduction

#### 4.4 Title screen

**File**: `js/game.js`

Add:
- TITLE state rendering
- Title image display (or placeholder)
- "Press ENTER to Start" flashing text
- High score display

#### 4.5 Game over screen

**File**: `js/game.js`

Add:
- GAME_OVER state rendering
- UFO explosion animation
- Final score display
- "NEW HIGH SCORE!" if applicable
- "Press ENTER to Play Again"

### Success Criteria:

#### Automated Verification:
- [x] No console errors
- [x] localStorage high score persists across refreshes

#### Manual Verification:
- [ ] Title screen shows on load
- [ ] ENTER starts game
- [ ] Wave number displays and increments
- [ ] Timer counts down from 60
- [ ] Surviving wave awards 100 points + transition
- [ ] Combo multiplier increases with successive abductions
- [ ] Moving UFO resets combo
- [ ] Score updates correctly with multipliers
- [ ] Game over shows when health = 0
- [ ] High score saves and displays
- [ ] Can restart with ENTER from game over

---

## Phase 5: Audio & Polish

### Overview
Add synthesized sound effects and final polish.

### Changes Required:

#### 5.1 Web Audio setup

**File**: `js/game.js`

Add:
- AudioContext initialization (on first user interaction)
- Sound synthesis helper functions

#### 5.2 Sound effects

**File**: `js/game.js`

Implement synthesized sounds for:
- Beam on (rising oscillator)
- Beam sustained (warbling hum)
- Abduction success (happy jingle)
- Target dropped (sad descending tone)
- Tank shell fire (sharp "pew")
- Missile fire (ominous "fwoosh")
- UFO hit (impact + alarm)
- Explosions (big boom)
- Wave complete (fanfare)
- Energy low warning
- Timer warning (last 10 seconds)

#### 5.3 Visual polish

**File**: `js/game.js`

Add:
- Star field background (twinkling)
- UFO hover bob animation
- Screen shake effect
- Red flash on damage
- Energy bar pulse when low

### Success Criteria:

#### Automated Verification:
- [x] No console errors
- [x] Audio plays without browser warnings

#### Manual Verification:
- [ ] All sound effects trigger at appropriate times
- [ ] Sounds are not annoying/too loud
- [ ] Background looks like night sky with stars
- [ ] UFO has subtle hover animation
- [ ] Screen shakes on hits/explosions
- [ ] Game feels polished and "juicy"

---

## Testing Strategy

### Manual Testing Steps:
1. Open `index.html` in Chrome/Firefox/Safari
2. Verify title screen appears
3. Press ENTER, verify game starts
4. Test UFO movement (responsive, stops at edges)
5. Test beam (hold SPACE, visual cone with spiral)
6. Abduct each target type, verify points
7. Test flee behavior (targets run from beam)
8. Let tank shoot, verify damage and health bar
9. Abduct a tank, verify explosion and points
10. Survive to wave 2, verify transition
11. Test combo system (stay still, abduct multiple)
12. Die, verify game over screen and high score
13. Restart, verify high score persists

---

## Performance Considerations

- Use `requestAnimationFrame` for smooth 60fps
- Object pooling for particles/projectiles if performance issues
- Limit particle count if explosions cause lag
- Minimize canvas state changes (batch similar draws)

---

## References

- Original GDD: `docs/GAME_DESIGN_DOCUMENT.md`
- Implementation order: `docs/GAME_DESIGN_DOCUMENT.md:616-653`
- Config constants: `docs/GAME_DESIGN_DOCUMENT.md:494-551`
