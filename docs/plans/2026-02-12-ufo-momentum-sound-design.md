# UFO Momentum & Movement Sound Design

## Overview

Add horizontal momentum physics and a low warbly movement sound to the UFO, creating a more satisfying feel when moving left/right.

## Movement Physics

Change UFO horizontal movement from instant position change to velocity-driven:

- **`vx`** becomes the real driver of `x` position (currently only calculated retroactively for bomb physics)
- **Acceleration**: When left/right key held, accelerate `vx` toward `±effectiveSpeed` at ~2000 px/s² (reaches full speed in ~0.2s)
- **Friction/Deceleration**: When no key held, apply friction that decays `vx` exponentially (~0.92/frame at 60fps, or time-based equivalent). Drift lasts ~0.2-0.3s
- **Boundary clamping**: Same as current — clamp `x` to screen edges, zero out `vx` if hitting edge
- **Bomb physics**: Still works — `vx` is now the real velocity so bombs inherit it naturally (cleaner than current retroactive calculation)
- **Warp juke**: Continues to work as-is (sets `x` directly, velocity overridden next frame)
- **Feel**: "Light slide" — quick to accelerate, short drift when released, keeps arcade feel snappy

## Movement Sound

A persistent sine oscillator + LFO warble, managed like the existing beam loop pattern:

- **Oscillator**: Sine wave, base frequency 80Hz, rising to 150Hz at full speed
- **LFO**: Second oscillator modulating the main frequency at ~5-8Hz (warble rate), depth increases slightly with speed
- **Gain ramp-up**: When `|vx|` goes from 0 to moving, ramp gain from 0 to ~0.15 over ~100ms
- **Gain ramp-down**: When keys released and `vx` decelerating, gain tracks `|vx| / maxSpeed` so it naturally feathers off with the momentum
- **Pitch tracking**: `frequency = 80 + (70 * |vx| / maxSpeed)` — 80Hz idle, 150Hz at full speed
- **Only horizontal**: Not triggered by vertical movement or beam activity

## Key Constraints

- Must not break existing warp juke double-tap detection
- Must not break bomb velocity inheritance
- Movement disabled during active abduction (existing check preserved)
- Sound only plays during PLAYING state
- Speed modifiers (inventory bonus, thruster boost) still apply to max speed
