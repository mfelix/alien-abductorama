# Alien Abductio-rama: Game Design Document

**Version**: 1.0
**Date**: 2025-12-29
**Status**: Requirements Definition

---

## 1. Game Overview

### 1.1 Concept
**Alien Abductio-rama** is a single-player, browser-based arcade game where players control a UFO attempting to abduct earthlings and animals while evading military defenses. The game combines classic arcade mechanics with strategic resource management and risk/reward decisions.

### 1.2 Core Fantasy
*You are an alien on a quota-driven abduction mission. Beam up as many specimens as possible before time runs out, but watch out for Earth's military!*

### 1.3 Target Platform
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Full viewport gameplay (responsive to window size)
- Keyboard controls (designed for desktop play)

### 1.4 Tech Stack
- HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- Web Audio API for synthesized sounds

---

## 2. Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────┐
│                     CORE LOOP                           │
│                                                         │
│   MOVE → AIM → ABDUCT → SCORE → SURVIVE → REPEAT       │
│    ↑                                              │     │
│    └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 2.1 Primary Actions
1. **Move**: Horizontal UFO movement (left/right arrow keys)
2. **Abduct**: Fire tractor beam (hold spacebar)
3. **Release**: Drop current target (release spacebar)
4. **Evade**: Avoid tank projectiles while moving

### 2.2 Core Tension
The key strategic tension: **The UFO cannot move while abducting**. This creates meaningful decisions:
- High-value targets take longer to abduct = more danger from tanks
- Do you grab the nearby dog (quick, low points) or risk the distant human (slow, high points)?
- Do you abort an abduction to dodge incoming fire, losing your progress?

---

## 3. Game Objects

### 3.1 The UFO (Player)

| Property | Value | Notes |
|----------|-------|-------|
| Movement | Horizontal only | Left/Right arrow keys |
| Speed | 400 pixels/sec | Feels responsive but controllable |
| Health | 100 HP | Displayed as health bar |
| Position | Upper portion of screen | ~15-20% from top |
| Collision Box | Circular/oval | Match sprite dimensions |

**Sprite**: `assets/ufo.png`

### 3.2 Abduction Targets

| Target | Points | Weight | Abduction Time | Spawn Rate |
|--------|--------|--------|----------------|------------|
| Human | 50 | 5 | 2.5 seconds | 15% |
| Cow | 40 | 4 | 2.0 seconds | 20% |
| Sheep | 30 | 3 | 1.5 seconds | 20% |
| Cat | 20 | 2 | 1.0 seconds | 22% |
| Dog | 20 | 2 | 1.0 seconds | 23% |

**Design Rationale**:
- Weight determines abduction time: `time = weight * 0.5 seconds`
- Points correlate with risk (higher points = longer exposure to tanks)
- Cats and dogs have equal value but both spawn frequently for easy pickups

**Sprites**: `assets/human.png`, `assets/cow.png`, `assets/sheep.png`, `assets/cat.png`, `assets/dog.png`

### 3.3 Tanks (Enemy)

| Property | Value | Notes |
|----------|-------|-------|
| Movement | Horizontal, ground level | Patrol behavior |
| Speed | 60-100 pixels/sec | Varies by wave |
| Turret | Always aims at UFO | Smooth tracking |
| Fire Rate | Shell every 2-3 sec | Randomized slightly |
| Missile Rate | Every 4th shot is missile | More dangerous |
| Abductable | Yes | Explodes near UFO |

**Sprite**: `assets/tank.png`

### 3.4 Projectiles

| Type | Damage | Speed | Visual |
|------|--------|-------|--------|
| Shell | 10 HP | 300 pixels/sec | Small yellow circle |
| Missile | 25 HP | 500 pixels/sec | Red elongated shape with trail |

---

## 4. Systems Design

### 4.1 Abduction Beam System

```
BEAM MECHANICS:
─────────────────
1. Player holds SPACE
2. Beam extends downward in cone shape
3. If target is within cone when beam reaches ground:
   - Target locks to beam
   - Target rises toward UFO
   - UFO becomes immobile
4. On reaching UFO:
   - Points awarded
   - Health restored (points/10, rounded up)
   - Target disappears
5. If SPACE released early:
   - Target drops from current height
   - Target disappears on ground contact
   - No points awarded
```

**Visual Effect: Spiral Dazzle Beam**
- Cone shape from UFO to ground
- Rotating spiral pattern inside cone
- Colors: Alternating bright cyan/magenta/white
- Pulsing/flickering effect
- Particle sparkles along edges

### 4.2 Energy System

```
ENERGY BAR
══════════════════════════════════════
[████████████████░░░░░░░░░░░░░░░░░░░░] 50%
══════════════════════════════════════
         Displayed above UFO
```

| Property | Value | Notes |
|----------|-------|-------|
| Max Energy | 100 units | Full bar |
| Drain Rate | 20 units/sec | While beam active |
| Recharge Rate | 10 units/sec | While beam inactive |
| Minimum to Fire | 10 units | Can't fire if below this |
| Visual | Horizontal bar | Green→Yellow→Red gradient |

**Design Rationale**:
- Full beam lasts 5 seconds (enough to abduct a human)
- Recharge takes 10 seconds from empty (prevents spam)
- Creates rhythm: abduct → recharge → abduct
- Strategic choice: quick grabs vs. waiting for full charge

### 4.3 Health System

| Event | Health Change | Points |
|-------|---------------|--------|
| Shell hit | -10 HP | - |
| Missile hit | -25 HP | - |
| Successful abduction | +5 HP (or points/10) | Base points × combo |
| Tank abduction | +5 HP | 25 points × combo |

**Visual**: Red health bar, always visible, top of screen or near UFO

**Game Over**: When health reaches 0, UFO explodes (anime-style), game ends

### 4.4 Wave System

```
WAVE STRUCTURE
───────────────────────────
Wave 1: 1 tank,  60 seconds
Wave 2: 2 tanks, 60 seconds
Wave 3: 3 tanks, 60 seconds
Wave 4: 4 tanks, 60 seconds
Wave 5+: +1 tank per wave
───────────────────────────
```

| Wave | Tanks | Tank Speed | Fire Rate Multiplier |
|------|-------|------------|---------------------|
| 1 | 1 | 60 px/s | 1.0x |
| 2 | 2 | 70 px/s | 1.1x |
| 3 | 3 | 80 px/s | 1.2x |
| 4 | 4 | 90 px/s | 1.3x |
| 5+ | +1/wave | 100 px/s (cap) | 1.5x (cap) |

**Wave Transition**:
- 3-second pause between waves
- "WAVE X" text appears dramatically
- All targets cleared
- Tanks spawn at edges of screen

### 4.5 Scoring System

```
SCORE CALCULATION
─────────────────
Base Points:  Target value (20-50)
Tank Points:  25 points (abducting tanks rewards you!)
Combo Bonus:  Consecutive abductions multiply score
              1st abduction: 1x (base)
              2nd abduction: 1.5x
              3rd abduction: 2x
              4th abduction: 2.5x
              5th+ abduction: 3x (max)
Combo Reset:  Moving the UFO resets combo to 1x
Wave Bonus:   Surviving a wave = 100 points

HIGH SCORE: Stored in localStorage
```

**Combo Strategy**:
- Stay still and abduct multiple targets in succession for big multipliers
- Risk: You're a sitting duck for tanks while maintaining combo
- Reward: A 5-combo human = 50 × 3 = 150 points!

---

## 5. Controls

| Key | Action | Notes |
|-----|--------|-------|
| ← (Left Arrow) | Move UFO left | Hold for continuous movement |
| → (Right Arrow) | Move UFO right | Hold for continuous movement |
| SPACE | Fire/hold abduction beam | Hold to maintain beam |
| ENTER | Start game / Restart | From title or game over screen |
| ESC | Pause game | Optional feature |

---

## 6. Game States

```
┌──────────────┐
│  TITLE       │ ──── ENTER ────→ ┌──────────────┐
│  SCREEN      │                   │  PLAYING     │
│              │ ←── ESC ───────── │              │
└──────────────┘                   └──────┬───────┘
                                          │
                              Health=0 OR Timer=0
                                          │
                                          ▼
                                   ┌──────────────┐
                   ←── ENTER ───── │  GAME OVER   │
                                   │              │
                                   └──────────────┘
```

### 6.1 Title Screen
- Display `assets/title.png` centered
- "Press ENTER to Start" flashing text
- High Score display (if exists)
- Optional: Instructions overlay

### 6.2 Playing State
- All game objects active
- Timer counting down
- Score display
- Wave indicator
- Health and energy bars

### 6.3 Game Over State
- Large anime-style UFO explosion
- Final score display
- "NEW HIGH SCORE!" if applicable
- "Press ENTER to Play Again"

### 6.4 Wave Transition (sub-state)
- Brief pause in action
- "WAVE X COMPLETE" / "WAVE X+1 INCOMING"
- Score bonus awarded

---

## 7. Visual Design

### 7.1 Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  SCORE: 1250    WAVE: 3    TIME: 0:45    [HEALTH BAR]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    [ENERGY BAR]                         │
│                       ╱╲                                │
│                    [  UFO  ]                            │
│                       ╲╱                                │
│                        ║                                │
│                       ╱║╲  ← Abduction beam            │
│                      ╱ ║ ╲                              │
│                     ╱  ║  ╲                             │
│                    ╱   ║   ╲                            │
│                        ☺    ← Target being abducted    │
│                                                         │
│  🐕    🐄         ☺                 🐑    🐈            │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│    [TANK]→                              ←[TANK]        │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Color Palette

| Element | Color(s) | Hex |
|---------|----------|-----|
| Background | Night sky gradient | #0a0a2e → #1a1a4e |
| Stars | Twinkling white dots | #ffffff |
| Ground | Dark green/brown | #2d4a2d |
| Beam | Cyan/Magenta/White spiral | #00ffff, #ff00ff, #ffffff |
| Energy Bar | Green→Yellow→Red | #00ff00 → #ffff00 → #ff0000 |
| Health Bar | Red with dark outline | #ff0000 |
| Explosions | Orange/Yellow/Red circles | #ff6600, #ffff00, #ff0000 |
| UI Text | White with black outline | #ffffff |

### 7.3 Explosion Effect (Anime-Style)

```
EXPLOSION ALGORITHM
───────────────────
1. Spawn 20-30 circles at explosion point
2. Each circle has:
   - Random size (5-20px radius)
   - Random velocity (outward from center)
   - Random color (orange/yellow/red/white)
   - Lifetime (0.5-1.0 seconds)
3. Circles expand slightly then shrink
4. Fade out over lifetime
5. Optional: screen shake for big explosions
```

---

## 8. Audio Design

All sounds synthesized using Web Audio API.

### 8.1 Sound Effects

| Sound | Trigger | Description |
|-------|---------|-------------|
| Beam On | Spacebar pressed | Rising "woooo" oscillator |
| Beam Sustained | Holding spacebar | Warbling hum |
| Abduction Success | Target reaches UFO | Happy "bwoop-bwoop" jingle |
| Target Dropped | Spacebar released early | Sad descending tone |
| Tank Shell Fire | Tank shoots | Sharp "pew" |
| Missile Fire | Tank fires missile | Lower, more ominous "fwoosh" |
| UFO Hit | Projectile hits UFO | Crunchy impact + alarm beep |
| Tank Explosion | Tank destroyed | Big boom with crackle |
| UFO Explosion | Game over | Massive explosion + sad jingle |
| Wave Complete | Wave ends | Triumphant fanfare |
| Energy Low | Energy below 20% | Warning beep |
| Timer Warning | Last 10 seconds | Ticking intensifies |

### 8.2 Synthesis Approach

```javascript
// Example: Abduction Beam Sound
const oscillator = audioCtx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3);

// Add warble with LFO
const lfo = audioCtx.createOscillator();
lfo.frequency.value = 5; // 5Hz warble
```

---

## 9. Spawning Logic

### 9.1 Target Spawning

```
TARGET SPAWN RULES
──────────────────
- Max 5 targets on screen at once
- Spawn every 2-4 seconds (randomized)
- Spawn at random X position on ground
- Minimum spacing: 80px between targets
- Targets wander slowly left/right on ground
- Targets despawn after 10 seconds if not abducted
```

### 9.2 Target Flee Behavior

```
FLEE MECHANICS
──────────────
When abduction beam is active:
- Targets within 150px of beam center detect danger
- Fleeing targets move at 2x normal wander speed
- Flee direction: away from beam center
- Flee stops when beam deactivates
- Different targets have different "awareness":
  - Human: High awareness (flees immediately)
  - Dog: High awareness (flees immediately)
  - Cat: Medium awareness (0.3s delay)
  - Cow: Low awareness (0.5s delay)
  - Sheep: Low awareness (0.5s delay, follows other sheep)
```

**Design Rationale**:
- Adds skill element: anticipate where targets will run
- Higher-value targets (humans) are harder to catch
- Creates funny moments of targets scattering
- Sheep "herd mentality" - if one flees, nearby sheep follow

### 9.3 Tank Spawning

```
TANK SPAWN RULES
────────────────
- Number determined by wave
- Spawn at screen edges (left or right)
- Enter screen and patrol
- Never overlap with each other
- Respawn at edge if abducted/destroyed
- Delay 3 seconds before respawn
```

---

## 10. Technical Specifications

### 10.1 Game Loop

```javascript
const TICK_RATE = 60; // 60 FPS target

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    update(deltaTime);  // Physics, logic
    render();           // Drawing

    requestAnimationFrame(gameLoop);
}
```

### 10.2 Collision Detection

| Collision | Method | Response |
|-----------|--------|----------|
| Beam ↔ Target | Point-in-cone | Begin abduction |
| Projectile ↔ UFO | Circle-circle | Damage UFO |
| Target ↔ UFO | Distance check | Award points, heal |
| Tank ↔ UFO | Distance check | Tank explodes |

### 10.3 File Structure

```
alien-abductorama/
├── index.html          # Single HTML file, entry point
├── css/
│   └── style.css       # Minimal styling (fullscreen canvas)
├── js/
│   ├── game.js         # Main game loop, state management
│   ├── entities.js     # UFO, Tank, Target classes
│   ├── beam.js         # Abduction beam rendering/logic
│   ├── audio.js        # Web Audio synthesizer
│   ├── particles.js    # Explosion effects
│   ├── ui.js           # Score, health, energy displays
│   └── utils.js        # Helper functions
├── assets/
│   ├── title.png       # Title screen image
│   ├── ufo.png         # UFO sprite
│   ├── human.png       # Human target
│   ├── cow.png         # Cow target
│   ├── sheep.png       # Sheep target
│   ├── cat.png         # Cat target
│   ├── dog.png         # Dog target
│   └── tank.png        # Tank sprite
└── docs/
    └── GAME_DESIGN_DOCUMENT.md  # This file
```

---

## 11. Balance Tuning Variables

These values should be easily adjustable for playtesting:

```javascript
const CONFIG = {
    // UFO
    UFO_SPEED: 400,
    UFO_START_HEALTH: 100,
    UFO_Y_POSITION: 0.15, // 15% from top

    // Energy
    ENERGY_MAX: 100,
    ENERGY_DRAIN_RATE: 20,
    ENERGY_RECHARGE_RATE: 10,
    ENERGY_MIN_TO_FIRE: 10,

    // Targets
    TARGET_WEIGHT_MULTIPLIER: 0.5, // seconds per weight unit
    TARGET_MAX_ON_SCREEN: 5,
    TARGET_SPAWN_INTERVAL: [2, 4], // min, max seconds
    TARGET_WANDER_SPEED: 30,
    TARGET_LIFETIME: 10,

    // Target Flee Behavior
    TARGET_FLEE_RADIUS: 150,        // pixels from beam center
    TARGET_FLEE_SPEED_MULTIPLIER: 2, // 2x normal speed when fleeing
    TARGET_AWARENESS: {              // delay before fleeing (seconds)
        human: 0,
        dog: 0,
        cat: 0.3,
        cow: 0.5,
        sheep: 0.5
    },

    // Tanks
    TANK_BASE_SPEED: 60,
    TANK_SPEED_INCREMENT: 10, // per wave
    TANK_FIRE_INTERVAL: [2, 3], // seconds
    TANK_MISSILE_FREQUENCY: 4, // every Nth shot
    TANK_POINTS: 25,
    SHELL_SPEED: 300,
    MISSILE_SPEED: 500,

    // Damage & Healing
    SHELL_DAMAGE: 10,
    MISSILE_DAMAGE: 25,
    HEAL_PER_ABDUCTION: 5,

    // Combo System
    COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3], // index = combo count - 1
    COMBO_MAX: 3, // max multiplier (5th+ abduction)

    // Waves
    WAVE_DURATION: 60,
    TANKS_BASE: 1,
    TANKS_INCREMENT: 1,
    WAVE_TRANSITION_DURATION: 3,

    // Scoring
    WAVE_COMPLETE_BONUS: 100
};
```

---

## 12. Polish & Juice

### 12.1 Screen Effects

| Effect | Trigger | Description |
|--------|---------|-------------|
| Screen shake | UFO hit, explosions | Brief camera shake |
| Flash | Damage taken | Red screen flash |
| Slow motion | Final abduction of wave | Brief 0.5x speed |
| Particle burst | Points awarded | Numbers fly up |

### 12.2 Animation Details

- UFO: Subtle hover bob (sine wave)
- Targets: Idle animations (optional)
- Tanks: Treads animate when moving
- Beam: Continuous spiral rotation
- Energy bar: Pulses when low

### 12.3 Quality of Life

- Responsive canvas resizing
- Pause on window blur (optional)
- Keyboard state tracking (prevents key repeat issues)
- LocalStorage for high score persistence

---

## 13. MVP vs. Nice-to-Have

### 13.1 MVP (Must Have)

- [x] UFO movement (left/right)
- [x] Abduction beam (hold space)
- [x] 5 target types with different weights
- [x] Target flee behavior (scatter when beam is near)
- [x] Basic tank enemy with aiming turret
- [x] Tank abduction (25 points, explodes near UFO)
- [x] Health and energy systems
- [x] Combo system (1x → 1.5x → 2x → 2.5x → 3x)
- [x] Wave-based difficulty (endless)
- [x] 60-second timer per wave
- [x] Score system with combo multipliers
- [x] Title and game over screens
- [x] Basic sound effects
- [x] Anime-style explosions

### 13.2 Nice-to-Have (Stretch Goals)

- [ ] Pause menu
- [ ] Achievements/badges
- [ ] Background parallax scrolling
- [ ] Day/night cycle visual variety
- [ ] Power-ups (shield, speed boost, rapid fire)
- [ ] Boss tank (every 5 waves)
- [ ] Mobile touch controls
- [ ] Online leaderboard

---

## 14. Implementation Order

Recommended development sequence:

### Phase 1: Core Engine
1. HTML/Canvas setup, fullscreen
2. Game loop with delta time
3. Input handling (keyboard)
4. Basic UFO rendering and movement

### Phase 2: Abduction Mechanics
5. Target spawning and rendering
6. Abduction beam visual
7. Beam-target collision
8. Target rising animation
9. Energy system

### Phase 3: Combat
10. Tank spawning and AI
11. Turret aiming
12. Projectile system
13. Collision detection
14. Health system
15. Explosion effects

### Phase 4: Game Flow
16. Wave system
17. Timer
18. Scoring
19. Title screen
20. Game over screen

### Phase 5: Polish
21. Sound effects
22. Screen shake
23. Particle effects
24. UI polish
25. Balance tuning

---

## 15. Design Decisions (Resolved)

| Question | Decision |
|----------|----------|
| Combo System | **YES** - 1x → 1.5x → 2x → 2.5x → 3x (max), resets on movement |
| Target Flee Behavior | **YES** - Targets flee from beam with varying awareness levels |
| Tank Points | **YES** - 25 points per tank, affected by combo multiplier |
| Difficulty Modes | **NO** - Single difficulty, balanced for fun |
| Endless Mode | **YES** - Waves continue indefinitely past wave 5 |

---

## Appendix A: Asset Specifications

| Asset | Recommended Size | Notes |
|-------|-----------------|-------|
| title.png | 800x400px | Will be centered and scaled |
| ufo.png | 120x60px | Transparent background |
| human.png | 40x60px | Facing forward, transparent |
| cow.png | 60x40px | Side view, transparent |
| sheep.png | 50x35px | Side view, transparent |
| cat.png | 30x25px | Side view, transparent |
| dog.png | 40x30px | Side view, transparent |
| tank.png | 80x50px | Side view, turret separate layer ideal |

**Note**: All sprites should have transparent backgrounds (PNG-24).

---

*Document created for Alien Abductio-rama development. May the abductions be plentiful!*
