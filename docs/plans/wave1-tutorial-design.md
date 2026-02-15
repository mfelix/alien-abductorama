# Wave 1 Tutorial Design Document

## Overview

The Wave 1 tutorial replaces the current `scheduleTutorialHints()` system (5 timed floating texts that fade in 2.5 seconds) with a progressive, action-gated tutorial that teaches one mechanic at a time. The player feels powerful and guided, never lectured.

**Core philosophy:** Show, don't tell. Each hint exists only to bridge the gap between "what do I press?" and "I just did something awesome." The moment the player acts, the hint vanishes with fanfare and the next concept arrives naturally.

---

## Architecture

### Tutorial State Machine

```
tutorialState = {
    phase: 'MOVE_BEAM' | 'WARP_JUKE' | 'BOMB' | 'COMPLETE' | null,
    moveCompleted: false,      // Player moved left/right for 1+ seconds cumulative
    beamCompleted: false,      // Player successfully beamed (spacebar pressed, target caught)
    warpJukeCompleted: false,  // Player performed a warp juke
    bombCompleted: false,      // Player dropped a bomb
    phaseTimer: 0,             // Time elapsed in current phase
    completionTimer: 0,        // Timer for completion celebration
    hintAlpha: 1.0,            // For fade/pulse animation
    dismissAnimations: [],     // Active dismissal particle bursts
    tankWarningTimer: 0,       // Countdown for tank entrance drama
    tankWarningPhase: 'none'   // 'none' | 'warning' | 'spawning' | 'done'
};
```

Only active when `wave === 1`. The state is initialized when the wave starts (in the same place `scheduleTutorialHints()` is currently called, line 8691). Set to `null` for all other waves.

### Tank Delay for Wave 1

On wave 1 only, `spawnTanks()` (line 8689) should NOT spawn tanks immediately. Instead, tanks are held back until the tutorial triggers them at ~30 seconds (or when the player completes Phase 1, whichever comes first). This gives the player 30 seconds of pure beam practice in a safe environment.

---

## Phase 1: Movement + Beaming (0s - ~30s)

### Timing

- **Starts:** Immediately when wave 1 begins (after any wave transition animation).
- **Move hint appears:** 0.5s delay (let the player see the world first).
- **Beam hint appears:** After move hint is dismissed OR after 4 seconds, whichever comes first.
- **Phase ends:** When beam is completed (target successfully caught/abducted) OR at 28s (hard cutoff to make room for tank entrance).

### Move Hint

**What triggers dismissal:** Player presses ArrowLeft or ArrowRight and moves the UFO for a cumulative 1.0 seconds.

**Visual:**
```
Position: Center-screen, vertically at 45% from top (just below UFO flight level)
Layout:  [<] [>]  MOVE
```

- Two key icons side by side, styled like the existing bomb key badge (lines 9197-9217): `#444` background with `#666` raised top surface, `#fff` bold letter, `roundRect` with radius 4.
- Left key shows a left-arrow glyph; right key shows a right-arrow glyph.
- "MOVE" text to the right, in `bold 22px monospace`, color `#0ff` (cyan, the info/movement color).
- The entire hint group has a subtle pulsing glow: `ctx.shadowColor = '#0ff'; ctx.shadowBlur = 8 + Math.sin(t * 4) * 6;` where `t` is elapsed time in seconds. This creates a breathing 8-14px cyan glow.
- Background: semi-transparent dark panel `rgba(0, 0, 0, 0.5)`, `roundRect` with 10px radius, 16px padding around the content.
- **Entrance animation:** Slides down from 10px above final position over 0.3s with ease-out. Alpha fades from 0 to 1 over the same duration.

**Dismissal animation (on completion):**
1. The hint text flashes white for 2 frames (0.033s).
2. The hint scales up to 1.15x over 0.15s while alpha fades to 0.
3. 8 cyan particles burst outward from the hint center (reuse existing `Particle` class: `rgb(0, 255, 255)`, size 3-5, speed 80-150, lifetime 0.3-0.5).
4. A brief "click/ding" sound plays (`SFX.tutorialComplete` -- new, or reuse `SFX.powerupCollect` if adding new sounds is out of scope).
5. Total dismissal animation: 0.2s.

### Beam Hint

**What triggers dismissal:** Player presses Space AND the beam locks onto a target (i.e., `ufo.beamTarget !== null` while beam is active). We do NOT require full abduction -- just catching something in the beam.

**Appears:** 0.3s after move hint dismissal (or at 4.0s from wave start if the player hasn't moved yet, since we don't want to block progress).

**Visual:**
```
Position: Center-screen, vertically at 45% from top (same Y as move hint -- it replaces it)
Layout:  [SPACE]  BEAM UP TARGETS!
```

- `[SPACE]` key icon: wider than arrow keys (60px wide, 22px tall), same raised-key style. Text inside: "SPACE" in `bold 10px monospace`.
- "BEAM UP TARGETS!" in `bold 22px monospace`, color `#ff0` (yellow, the beam color).
- Pulsing glow: `ctx.shadowColor = '#ff0'; ctx.shadowBlur = 8 + Math.sin(t * 4) * 6;`
- Same dark panel background as move hint.
- **Entrance animation:** Same slide-down + fade as move hint.
- **Extra flair:** Below the hint text, a small animated arrow (chevron) points downward, pulsing in sync with the glow, suggesting "aim down at the targets below." This chevron is drawn with 2 lines forming a V shape, color `#ff0`, alpha oscillating 0.3-0.8.

**Dismissal animation:** Same pattern as move hint but with yellow particles instead of cyan.

### Target Spawning During Phase 1

Targets should spawn normally during this phase. The player has the full 30 seconds to practice beaming without tank pressure. This is the "playground" zone.

---

## Phase 2: Warp Juke (~30s, triggered by tank entrance)

### Tank Entrance Sequence (The "Oh no" moment)

**Trigger:** Phase 1 beam is completed, AND `waveTimer <= 30` (i.e., 30+ seconds have elapsed). If the player hasn't completed Phase 1 by the 28-second mark, force-transition anyway. The tutorial must not prevent the player from experiencing the full wave.

**Sequence (2.5 seconds total):**

1. **T+0.0s -- WARNING FLASH:**
   - Screen edges pulse red: `ctx.fillStyle = rgba(255, 0, 0, alpha)` drawn as 4 rectangles (top/bottom/left/right strips, 40px thick) with alpha pulsing from 0 to 0.4 over 0.5s.
   - Text appears center-screen: `"!! WARNING !!"` in `bold 36px monospace`, color `#f44`, with aggressive glow (`shadowBlur: 20`, `shadowColor: '#f00'`). Text pulses scale 1.0 to 1.05 at 8Hz.
   - A low rumble/alarm sound plays (`SFX.tankWarning` -- new, or reuse the timer warning sound pitched down).

2. **T+0.8s -- TANK CALLOUT:**
   - Warning text transitions to: `"INCOMING TANK!"` in `bold 30px monospace`, color `#f80` (orange).
   - Mild screen shake: `screenShake = 0.3` for drama.
   - The red edge vignette fades out over 0.5s.

3. **T+1.5s -- TANK SPAWNS:**
   - A single tank spawns from the edge of the screen (the normal `Tank` constructor, but only 1 tank).
   - The tank drives in from the left or right edge (whichever is further from the player's UFO). Use existing tank movement.
   - A brief dust particle burst at the tank's entry point (5 brown/tan particles: `rgb(180, 150, 100)`, small, short lifetime).

4. **T+2.5s -- WARP JUKE HINT APPEARS:**
   - The tank begins firing normally (existing behavior).
   - The warp juke hint fades in.

### Warp Juke Hint

**What triggers dismissal:** Player performs a warp juke (the `triggerWarpJuke()` function at line 7858 executes successfully).

**Visual:**
```
Position: Center-screen, vertically at 45% from top
Layout:  [< <]  WARP JUKE!  [> >]
         DOUBLE-TAP or SHIFT+ARROW
```

- Two-line layout.
- Line 1: Key icons showing double-tap arrows on each side of "WARP JUKE!" text. Left side: two left-arrow key icons slightly overlapping (offset 4px, suggesting rapid taps). Right side: same with right arrows. "WARP JUKE!" in `bold 24px monospace`, color `#0f0` (green, the warp color).
- Line 2: Smaller instruction `"DOUBLE-TAP or SHIFT+ARROW"` in `16px monospace`, color `rgba(0, 255, 0, 0.7)`.
- Pulsing glow: `ctx.shadowColor = '#0f0'; ctx.shadowBlur = 8 + Math.sin(t * 5) * 8;` (slightly faster pulse than Phase 1 -- urgency!).
- Same dark panel background.
- **Extra flair:** The key icons jitter/shake slightly (1-2px random offset each frame) to convey urgency and the physical metaphor of "double-tap."
- **Entrance animation:** Pops in with a scale bounce: starts at scale 1.3, snaps to 1.0 over 0.2s with overshoot (ease-out-back).

**Dismissal animation:**
1. Flash green.
2. The text splits apart horizontally (left half slides left 50px, right half slides right 50px) while fading out over 0.25s -- mimicking the warp juke visual itself.
3. Green particles burst from center (reuse Particle class, green tint).
4. Satisfying sound cue.

### Projectile Awareness

During this phase, the tank is actively shooting. The first shell should feel like a real threat. The existing projectile rendering (yellow/orange shells with trail) is dramatic enough. No additional visual needed for the projectiles themselves.

---

## Phase 3: Bomb (~after warp juke completion)

### Trigger

Immediately after the warp juke dismissal animation finishes (0.3s delay).

### Bomb Hint

**What triggers dismissal:** Player presses B or X and a bomb is dropped (the `dropBomb()` function at line 7535 executes successfully).

**Visual:**
```
Position: Center-screen, vertically at 45% from top
Layout:  [B]  DROP A BOMB!
```

- `[B]` key icon in the existing raised-key style.
- "DROP A BOMB!" in `bold 22px monospace`, color `#f80` (orange, the bomb color).
- Pulsing glow: `ctx.shadowColor = '#f80'; ctx.shadowBlur = 8 + Math.sin(t * 4) * 6;`
- Same dark panel background.
- **Extra flair:** A small animated bomb icon to the right of the text -- a filled circle (`#333`) with a spark on top that flickers. This matches the bomb icons in the existing `renderBombCount()` UI (lines 9236-9253). Copy that visual style directly: 10px radius circle, `#555` highlight at (-2, -2), fuse spark with `rgba(255, ${150 + sparkIntensity * 100}, 0, ...)`.
- **Entrance animation:** Same slide-down + fade as Phase 1 hints.

**Dismissal animation:**
1. Flash orange.
2. The hint "explodes" outward: scale rapidly from 1.0 to 2.0 while alpha drops to 0 over 0.2s.
3. Orange and yellow particles burst (like the existing `createExplosion` at line 5570 but smaller, 10 particles, mixed orange/yellow).
4. Mild screen shake: `screenShake = 0.15`.
5. Explosion sound (reuse `SFX.explosion(false)` -- small explosion).

---

## Phase 4: Completion Celebration

### Trigger

0.3s after bomb hint dismissal animation finishes.

### Sequence (2.0 seconds total)

1. **T+0.0s -- "ALL SYSTEMS GO!" text:**
   - Center-screen, 40% from top.
   - `"ALL SYSTEMS GO!"` in `bold 32px monospace`, color `#fff` with rainbow cycling glow.
   - Rainbow glow implementation: `ctx.shadowColor = hsl(hue, 100%, 50%)` where `hue = (Date.now() / 5) % 360`. Shadow blur: 15.
   - Background panel: slightly larger, same dark style but with a 2px glowing border that cycles through the tutorial colors (cyan -> yellow -> green -> orange) over 1 second.
   - The text scales in with a bounce: 0 -> 1.1 -> 1.0 over 0.3s.

2. **T+0.0s -- Particle celebration:**
   - 30 particles burst from screen center in all directions.
   - Colors: mix of `#0ff`, `#ff0`, `#0f0`, `#f80` (all four tutorial colors).
   - Larger than normal particles (size 4-8), longer lifetime (0.5-0.8s).
   - This reuses the existing `Particle` class with the same color format.

3. **T+0.3s -- Sound:**
   - Play `SFX.powerup()` or a celebratory sound.

4. **T+2.0s -- Fade out:**
   - Text fades out over 0.5s.
   - `tutorialState.phase = 'COMPLETE'` -- tutorial system stops rendering.

---

## Rendering Integration

### Where to Render

Tutorial hints are **UI-layer elements** (not affected by screen shake). They should be rendered in the `render()` function AFTER `ctx.restore()` (line 15117) and AFTER `renderUI()` (line 15120), but BEFORE the timer critical warning overlay (line 15127). This puts them above all game elements and UI, but below full-screen overlays.

```javascript
// In render(), after line 15124:
if (tutorialState && tutorialState.phase !== 'COMPLETE') {
    renderTutorialHints();
}
```

### The `renderTutorialHints()` Function

This function checks `tutorialState.phase` and renders the appropriate hint. It handles:

1. **Entrance animations** (slide, fade, scale bounce) based on `tutorialState.phaseTimer`.
2. **Persistent hint rendering** (key icons, text, glow pulse, animated elements).
3. **Dismissal animations** (flash, particles, split, scale-out) tracked in `tutorialState.dismissAnimations[]`.
4. **Completion celebration** rendering.

### Key Icon Rendering Helper

Create a reusable `renderKeyBadge(x, y, text, width)` function that draws the raised-key style used throughout the HUD (matching lines 9197-9217 in `renderBombCount`):

```
- Outer: roundRect, fill #444, radius 4
- Inner (top surface): roundRect inset 1px top/left, 2px bottom, fill #666, radius 3
- Text: bold 11px monospace, #fff, centered
```

This keeps the tutorial keys visually consistent with the existing bomb/missile key badges in the HUD.

---

## Update Logic Integration

### Where to Update

In the main `update(dt)` function (around line 14900), add tutorial state updates:

```javascript
if (tutorialState && tutorialState.phase !== 'COMPLETE') {
    updateTutorial(dt);
}
```

### The `updateTutorial(dt)` Function

Handles:

1. **Phase timer progression:** `tutorialState.phaseTimer += dt`.
2. **Completion detection:**
   - Move: check if `keys['ArrowLeft'] || keys['ArrowRight']` and accumulate time. Once cumulative movement time >= 1.0s, set `moveCompleted = true`.
   - Beam: hook into the beam-lock logic. When `ufo.beamTarget` becomes non-null while `tutorialState.phase === 'MOVE_BEAM'` and beam is not yet completed, set `beamCompleted = true`.
   - Warp Juke: hook at the top of `triggerWarpJuke()` (line 7858). If `tutorialState.phase === 'WARP_JUKE'`, set `warpJukeCompleted = true`.
   - Bomb: hook at the top of `dropBomb()` (line 7535). If `tutorialState.phase === 'BOMB'`, set `bombCompleted = true`.
3. **Phase transitions:** When a phase's conditions are met, start dismissal animation, then after animation completes, advance to next phase.
4. **Tank entrance sequence:** When transitioning to Phase 2, run the tank warning sequence with its own sub-timer (`tankWarningTimer`).
5. **Dismissal animation updates:** Advance timers, remove finished animations.
6. **Hard cutoff at 28s elapsed:** If Phase 1 is not complete by `waveTimer <= 32`, force-dismiss any active Phase 1 hints and jump to Phase 2.

---

## Positioning Details

### Screen Coordinates

- Canvas is fullscreen: `canvas.width = window.innerWidth`, `canvas.height = window.innerHeight`.
- UFO flies at `canvas.height * 0.15` (15% from top).
- Ground is at `canvas.height - 60`.
- Top-left HUD (score, wave, timer): occupies ~200px wide, ~100px tall from (12, 12).
- Top-right HUD (shield, bombs, etc.): occupies ~210px wide from right edge.
- Top-center: quota progress bar at y=4, harvest counter below it.

### Tutorial Hint Placement

**Primary hint zone:** Horizontally centered, vertically at `canvas.height * 0.45`.

This is:
- Well below the UFO (at 15%) so it doesn't obscure the ship.
- Above the ground targets (at ~85-90%) so it doesn't cover them.
- Below the top HUD elements.
- Roughly in the "dead zone" between the UFO and the ground action, where the beam travels -- making it visible but not obscuring critical gameplay.

For the tank warning text ("!! WARNING !!", "INCOMING TANK!"), use `canvas.height * 0.38` -- slightly higher, for maximum drama.

For the completion celebration, use `canvas.height * 0.40` -- slightly higher than normal hints.

---

## Color Palette Reference

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Movement/Info | Cyan | `#0ff` | Move hint text, move particles |
| Beam | Yellow | `#ff0` | Beam hint text, beam particles |
| Warp Juke | Green | `#0f0` | Warp hint text, warp particles |
| Bomb | Orange | `#f80` | Bomb hint text, bomb particles |
| Danger/Warning | Red | `#f44` / `#f00` | Tank warning text, edge vignette |
| Panel Background | Dark | `rgba(0,0,0,0.5)` | All hint backgrounds |
| Key Badge BG | Dark gray | `#444` outer, `#666` surface | Key icons |
| Key Badge Text | White | `#fff` | Key icon labels |
| Completion | White + rainbow | `#fff` + cycling `hsl()` | "ALL SYSTEMS GO!" |

---

## Timing Summary

| Time (elapsed) | Event |
|----------------|-------|
| 0.0s | Wave 1 starts. No tanks spawn. |
| 0.5s | Move hint slides in. |
| 1.5s+ | Player moves -> move hint dismissed. |
| ~1.8s | Beam hint slides in (0.3s after move dismissal). |
| ~2.0s-28s | Player practices beaming on targets. |
| 28s (hard cutoff) | If Phase 1 not done, force-dismiss and start Phase 2. |
| 28-30s | Tank warning sequence plays (2.5s). |
| 30.5s | Warp juke hint appears. Tank starts shooting. |
| ~31-45s | Player performs warp juke -> hint dismissed. |
| ~31.5-45.3s | Bomb hint appears (0.3s after warp dismissal). |
| ~32-50s | Player drops bomb -> hint dismissed. |
| ~32.3-50.3s | "ALL SYSTEMS GO!" celebration (2.0s). |
| 55s | Timer warning kicks in (existing behavior at <=5s). |
| 60s | Wave ends normally. |

### Fast Player Path

A skilled player who already knows the controls could complete the entire tutorial in ~5 seconds:
- 0.5s: Move hint appears
- 1.5s: Moves immediately (1 second), dismissed
- 1.8s: Beam hint appears
- 3.0s: Catches a target in beam, dismissed

At this point, the tank entrance sequence fires at the next valid moment. Since Phase 1 completed before the 28s mark, the tank entrance can fire immediately, taking 2.5s. Then warp + bomb follow. Total tutorial time for a fast player: ~8-10 seconds, and they still get the full 60-second wave afterward.

### Slow Player Path

A player who takes the full 28 seconds to figure out beaming will still get:
- 28s: Force transition to Phase 2
- 30.5s: Warp juke hint with tank shooting at them
- They have 29.5 seconds left (until wave end at 60s) to complete warp + bomb
- Even if they never complete those, the hints auto-dismiss at wave end with no penalty

---

## Edge Cases

### Player already knows controls (repeat players)

The tutorial only runs on wave 1. If the game is restarted, the tutorial runs again. This is acceptable since wave 1 is the starting wave and the tutorial is brief for experienced players.

### Wave timer vs. tutorial progression

- Tutorial NEVER extends the wave timer. The wave is always 60 seconds.
- If the wave ends mid-tutorial, all tutorial UI cleanly fades out. `tutorialState` is reset to `null`.
- The tank spawned during the tutorial counts as the wave's normal tank(s). After the tutorial tank spawns, if additional tanks would normally exist for wave 1 (per `spawnTanks()` logic: `CONFIG.TANKS_BASE = 1`), no extras are needed since wave 1 only has 1 tank anyway.

### Player dies during tutorial

If the UFO health reaches 0 during the tutorial (unlikely since the tank only appears at 30s), the game over sequence takes priority. Tutorial state is cleaned up along with all other wave state.

### Window resize during tutorial

Since all positions are calculated as percentages of canvas dimensions (`canvas.height * 0.45`, etc.), the tutorial hints reposition correctly on resize.

### Energy management

The beam costs energy. During Phase 1, the player might drain their energy and be confused. No special tutorial hint is needed -- the energy bar above the UFO is visible, and they'll naturally see it recharge when they release the beam. The existing UX of "beam drains energy, releasing recharges" teaches itself through the energy bar visual.

---

## Sound Design Notes

**Ideal new sounds (if budget allows):**
- `SFX.tutorialHintAppear`: Soft, ascending chime. Short (0.2s). Plays when each hint slides in.
- `SFX.tutorialHintDismiss`: Satisfying "ding" or "click-pop." Short (0.15s). Plays when each hint is completed.
- `SFX.tankWarning`: Low rumble or klaxon alarm. 0.8s duration. Plays during tank entrance.
- `SFX.tutorialComplete`: Triumphant ascending arpeggio. 0.5s. Plays for "ALL SYSTEMS GO!"

**Fallback to existing sounds (zero new sound budget):**
- Hint appear: no sound (silent slide-in is fine).
- Hint dismiss: `SFX.powerupCollect()` (existing, line 2882).
- Tank warning: Reuse the timer warning beep at a lower pitch, or `SFX.explosion(false)`.
- Tutorial complete: `SFX.powerup()` (existing, line 2612).

---

## Implementation Notes for Developer

### Files to Modify

Only `/Users/mfelix/code/alien-abductorama/js/game.js` needs changes.

### Key Integration Points

1. **Replace `scheduleTutorialHints()` call at line 8691** with `initTutorial()`.
2. **Modify `spawnTanks()` (line 7455):** On wave 1, skip initial tank spawn. Store the tank count for later spawning during Phase 2.
3. **Hook `triggerWarpJuke()` (line 7858):** Add 1 line at top to notify tutorial.
4. **Hook `dropBomb()` (line 7535):** Add 1 line at top to notify tutorial.
5. **Add `updateTutorial(dt)` call** in the main update loop.
6. **Add `renderTutorialHints()` call** in the main render function after `renderUI()`.
7. **Clean up tutorial on wave end:** In the wave-end logic (around line 14980), set `tutorialState = null`.

### New Code Scope

- ~1 new state object (`tutorialState`)
- ~1 helper function (`renderKeyBadge()`)
- ~1 update function (`updateTutorial(dt)`, ~80-100 lines)
- ~1 render function (`renderTutorialHints()`, ~120-150 lines)
- ~1 init function (`initTutorial()`, ~10 lines)
- Small hooks in 3 existing functions (1-2 lines each)
- Total estimated additions: ~300-350 lines

### What to Remove

- The entire `scheduleTutorialHints()` function (lines 3510-3535).
- The `clearTutorialTimeouts()` function (lines 3503-3508).
- The `tutorialTimeouts` array and all references to it.

---

## Visual Mockups (ASCII)

### Phase 1 - Move Hint
```
    +------------------------------------+
    |   [<] [>]   MOVE                   |
    +------------------------------------+
              (cyan glow pulses)
```

### Phase 1 - Beam Hint
```
    +------------------------------------+
    |   [SPACE]   BEAM UP TARGETS!       |
    |               V V V                |
    +------------------------------------+
             (yellow glow pulses)
```

### Phase 2 - Tank Warning
```


          !! WARNING !!
            (red, pulsing, large)

     -- red vignette around screen edges --
```

### Phase 2 - Warp Juke Hint
```
    +-------------------------------------------+
    |   [<<]   WARP JUKE!   [>>]                |
    |      DOUBLE-TAP or SHIFT+ARROW            |
    +-------------------------------------------+
              (green glow, keys jitter)
```

### Phase 3 - Bomb Hint
```
    +------------------------------------+
    |   [B]   DROP A BOMB!   (o)~*       |
    +------------------------------------+
             (orange glow pulses)
```

### Phase 4 - Completion
```

         ALL SYSTEMS GO!
    (rainbow glow, particles everywhere)

```
