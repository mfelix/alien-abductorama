# HUD Design Pass 2 - Sound Design Specification

**Date**: 2026-02-13
**Role**: Sound Designer
**Target**: `/Users/mfelix/code/alien-abductorama/js/game.js`

---

## PART 1: COMPLETE EXISTING SOUND AUDIT

### Audio Infrastructure

- **Audio Context**: Standard `window.AudioContext` / `webkitAudioContext`
- **Helper**: `playTone(frequency, duration, type, volume, fadeOut)` -- simple oscillator with optional exponential fade
- **Sample Playback**: `playTargetSound(type, volume)` loads WAV files via manifest with delay/feedback effect chain
- **Effects**: `createBitcrusherCurve(bits)`, `createDistortionCurve(amount)` -- WaveShaper curves available but not used in SFX object

---

### Sound-by-Sound Catalog

#### 1. `SFX.beamOn`
| Property | Value |
|----------|-------|
| **Trigger** | Player activates tractor beam |
| **Oscillator** | sine |
| **Frequency** | 200Hz -> 800Hz (exponential ramp over 200ms) |
| **Gain** | 0.08 -> 0.01 (exponential ramp) |
| **Duration** | 200ms |
| **Envelope** | Instant attack, exponential decay over full duration |
| **Modulation** | None (pure frequency sweep) |
| **Spectral Band** | Bass (200Hz) -> mid (800Hz) -- rising sweep |

#### 2. `SFX.startBeamLoop` / `SFX.stopBeamLoop`
| Property | Value |
|----------|-------|
| **Trigger** | Sustained tractor beam active |
| **Oscillator** | sawtooth (main), sine (LFO) |
| **Frequency** | 150Hz (main), 8Hz LFO |
| **Gain** | 0.04 (constant while looping), fade to 0.01 over 100ms on stop |
| **Duration** | Continuous loop |
| **Envelope** | Flat sustain, 100ms release |
| **Modulation** | FM vibrato: 8Hz LFO modulating frequency +/-50Hz |
| **Spectral Band** | Bass/low-mid (100-200Hz with harmonics from sawtooth) |

#### 3. `SFX.startMoveLoop` / `SFX.updateMoveLoop` / `SFX.stopMoveLoop`
| Property | Value |
|----------|-------|
| **Trigger** | UFO horizontal movement (velocity-driven) |
| **Oscillator** | sine (main), sine (LFO) |
| **Frequency** | 80Hz at rest -> 150Hz at full speed; LFO 5Hz -> 8Hz |
| **Gain** | 0.001 (silent) -> 0.15 at full speed, smooth ramp via setTargetAtTime (tau=50ms) |
| **Duration** | Continuous loop |
| **Envelope** | Dynamic sustain tracking velocity, 300ms release |
| **Modulation** | FM warble: LFO depth 10Hz, rate scales with speed |
| **Spectral Band** | **Sub-bass/bass (80-150Hz)** -- the "wonderful gap" the user mentioned |

#### 4. `SFX.startChargingHum` / `SFX.stopChargingHum` / `SFX.setChargingHumPitch`
| Property | Value |
|----------|-------|
| **Trigger** | Coordinator charging (energy accumulation) |
| **Oscillator** | triangle (main), sine (LFO) |
| **Frequency** | 120Hz -> 200Hz (scales with energy percentage); LFO 4Hz |
| **Gain** | 0.08 (constant while looping), fade to 0.01 over 150ms on stop |
| **Duration** | Continuous loop |
| **Envelope** | Flat sustain, 150ms release |
| **Modulation** | FM vibrato: 4Hz LFO modulating frequency +/-15Hz |
| **Spectral Band** | Bass/low-mid (120-200Hz, triangle has odd harmonics) |

#### 5. `SFX.chargeFull`
| Property | Value |
|----------|-------|
| **Trigger** | Coordinator reaches full charge |
| **Oscillator** | sine (x3 layered) |
| **Frequency** | 523Hz, 659Hz, 784Hz (C5, E5, G5 -- major triad) |
| **Gain** | 0.15 each |
| **Duration** | 200ms each, staggered 60ms apart |
| **Envelope** | Instant attack, exponential decay via playTone |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (523-784Hz) |

#### 6. `SFX.distressBeep`
| Property | Value |
|----------|-------|
| **Trigger** | Target in distress (being beamed) |
| **Oscillator** | square (x2) |
| **Frequency** | 600Hz then 400Hz |
| **Gain** | 0.1 each |
| **Duration** | 80ms each, 100ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (400-600Hz, rich square harmonics) |

#### 7. `SFX.abductionComplete`
| Property | Value |
|----------|-------|
| **Trigger** | Target fully abducted into UFO |
| **Oscillator** | sine (x4 layered) |
| **Frequency** | 400, 500, 600, 800Hz (ascending) |
| **Gain** | 0.2 each |
| **Duration** | 150ms each, staggered 80ms apart |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (400-800Hz) |

#### 8. `SFX.targetPickup`
| Property | Value |
|----------|-------|
| **Trigger** | Beam grabs a target (plays custom WAV) |
| **Oscillator** | Sample playback (WAV files) |
| **Frequency** | Varies by sample |
| **Gain** | 0.15 (dry), delay effect with 0.12s delay, 0.7 feedback, 3kHz lowpass |
| **Duration** | Varies by sample + delay tail |
| **Envelope** | Sample-native + delay feedback |
| **Modulation** | Delay with heavy feedback, lowpass filter on delay path |
| **Spectral Band** | Full spectrum (sample-dependent) |
| **Note** | 2-second cooldown per target to prevent spam |

#### 9. `SFX.countTick`
| Property | Value |
|----------|-------|
| **Trigger** | Score/counter incrementing |
| **Oscillator** | square |
| **Frequency** | 600Hz (default, parameterized) |
| **Gain** | 0.08 |
| **Duration** | 50ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (600Hz with square harmonics) |

#### 10. `SFX.bucksAward`
| Property | Value |
|----------|-------|
| **Trigger** | UFO Bucks awarded |
| **Oscillator** | triangle (x3) |
| **Frequency** | 500, 700, 900Hz (ascending) |
| **Gain** | 0.12 each |
| **Duration** | 120ms each, staggered 70ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (500-900Hz) |

#### 11. `SFX.targetDropped`
| Property | Value |
|----------|-------|
| **Trigger** | Target falls from beam |
| **Oscillator** | sine |
| **Frequency** | 400Hz -> 100Hz (exponential sweep) |
| **Gain** | 0.25 -> 0.01 |
| **Duration** | 400ms |
| **Envelope** | Instant attack, exponential decay over full duration |
| **Modulation** | None (frequency sweep only) |
| **Spectral Band** | Low-mid -> bass (400Hz -> 100Hz) |

#### 12. `SFX.shellFire`
| Property | Value |
|----------|-------|
| **Trigger** | Tank fires a shell |
| **Oscillator** | square |
| **Frequency** | 800Hz -> 200Hz (exponential sweep, 100ms) |
| **Gain** | 0.15 -> 0.01 |
| **Duration** | 100ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid -> bass (800Hz -> 200Hz, sharp "pew") |

#### 13. `SFX.missileFire`
| Property | Value |
|----------|-------|
| **Trigger** | Tank fires a missile |
| **Oscillator** | sawtooth (main 100->50Hz), sawtooth (noise layer, 50Hz) |
| **Gain** | Main 0.2, noise 0.1 -> 0.01 |
| **Duration** | Main 300ms, noise 200ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None (dual-layer for thickness) |
| **Spectral Band** | Bass/sub-bass (50-100Hz, heavy sawtooth harmonics) |

#### 14. `SFX.ufoHit`
| Property | Value |
|----------|-------|
| **Trigger** | UFO takes damage |
| **Oscillator** | sawtooth |
| **Frequency** | 200Hz -> 100Hz (instant step at 50ms) -> 150Hz (step at 100ms) |
| **Gain** | 0.3 -> 0.01 |
| **Duration** | 200ms |
| **Envelope** | Hard attack at 0.3, exponential decay |
| **Modulation** | Stepped frequency (impact simulation) |
| **Spectral Band** | Bass/low-mid (100-200Hz with sawtooth harmonics) |

#### 15. `SFX.explosion`
| Property | Value |
|----------|-------|
| **Trigger** | Something explodes (big=false for small, big=true for large) |
| **Oscillator** | White noise buffer (generated) |
| **Frequency** | Lowpass filter: 400-600Hz -> 100Hz sweep |
| **Gain** | 0.25-0.4 -> 0.01 |
| **Duration** | 300ms (small) / 500ms (big) |
| **Envelope** | Shaped by noise buffer: amplitude = (1 - i/length)^2 (quadratic decay) |
| **Modulation** | Lowpass filter sweep (rumble roll-off) |
| **Spectral Band** | Full spectrum -> bass (noise filtered down) |

#### 16. `SFX.waveComplete`
| Property | Value |
|----------|-------|
| **Trigger** | Wave cleared |
| **Oscillator** | sine (x4) |
| **Frequency** | 523, 659, 784, 1047Hz (C5, E5, G5, C6 -- C major arpeggio) |
| **Gain** | 0.2 each |
| **Duration** | 300ms each, staggered 150ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (523-1047Hz) |

#### 17. `SFX.feedbackSuccess`
| Property | Value |
|----------|-------|
| **Trigger** | Player feedback submitted |
| **Oscillator** | sine (x5 main) + triangle (x3 sparkle harmony at 1.5x freq) |
| **Frequency** | 523, 659, 784, 880, 1047Hz + harmonics at 1176, 1320, 1571Hz |
| **Gain** | 0.18 main, 0.08 sparkle |
| **Duration** | 150ms main, 100ms sparkle, staggered 60ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid -> high (523-1571Hz) |

#### 18. `SFX.energyLow`
| Property | Value |
|----------|-------|
| **Trigger** | Energy below threshold |
| **Oscillator** | square |
| **Frequency** | 200Hz |
| **Gain** | 0.15 |
| **Duration** | 100ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Bass/low-mid (200Hz + square harmonics) |

#### 19. `SFX.timerWarning`
| Property | Value |
|----------|-------|
| **Trigger** | Wave timer running low |
| **Oscillator** | square |
| **Frequency** | 440Hz |
| **Gain** | 0.2 |
| **Duration** | 100ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (440Hz + harmonics) |

#### 20. `SFX.gameOver`
| Property | Value |
|----------|-------|
| **Trigger** | Game over |
| **Oscillator** | sine (x4) |
| **Frequency** | 400, 350, 300, 200Hz (descending) |
| **Gain** | 0.25 each |
| **Duration** | 400ms each, staggered 200ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Bass/low-mid (200-400Hz, somber) |

#### 21. `SFX.powerupSpawn`
| Property | Value |
|----------|-------|
| **Trigger** | Powerup appears on field |
| **Oscillator** | sine (x4) |
| **Frequency** | 600, 800, 1000, 1200Hz (ascending) |
| **Gain** | 0.15 each |
| **Duration** | 100ms each, staggered 50ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (600-1200Hz) |

#### 22. `SFX.powerupCollect`
| Property | Value |
|----------|-------|
| **Trigger** | Player collects powerup |
| **Oscillator** | sine (x2 sequential) |
| **Frequency** | Boink 1: 600->350Hz (80ms sweep); Boink 2: 800->480Hz (80ms sweep, 100ms delayed) |
| **Gain** | 0.3 each -> 0.01 |
| **Duration** | Total ~220ms |
| **Envelope** | Two punchy attacks with rapid decay |
| **Modulation** | None (frequency sweep gives bounce feel) |
| **Spectral Band** | Low-mid/mid (350-800Hz) |

#### 23. `SFX.shieldHit`
| Property | Value |
|----------|-------|
| **Trigger** | Projectile deflected by shield |
| **Oscillator** | square |
| **Frequency** | 1500Hz -> 800Hz (exponential ramp) |
| **Gain** | 0.3 -> 0.01 |
| **Duration** | 150ms |
| **Envelope** | Hard attack, exponential decay |
| **Modulation** | Bandpass filter at 2000Hz, Q=5 (metallic resonance) |
| **Spectral Band** | High-mid (800-2000Hz, bandpass filtered) |

#### 24. `SFX.shieldBreak`
| Property | Value |
|----------|-------|
| **Trigger** | Shield destroyed |
| **Oscillator** | White noise buffer |
| **Frequency** | Highpass filter: 2000Hz -> 200Hz sweep |
| **Gain** | 0.35 -> 0.01 |
| **Duration** | 400ms |
| **Envelope** | Noise * (1 - i/length)^1.5 |
| **Modulation** | Highpass filter sweep (shatter sound, bright -> dull) |
| **Spectral Band** | High -> bass (sweeping noise) |

#### 25. `SFX.warpJuke`
| Property | Value |
|----------|-------|
| **Trigger** | Player uses warp juke teleport |
| **Oscillator** | sine (main: 200->2000->800Hz), triangle (sub: 100->1000Hz) |
| **Gain** | 0.3 -> 0.01 |
| **Duration** | 250ms |
| **Envelope** | Hard attack, exponential decay |
| **Modulation** | Highpass filter at 300Hz (electric feel) |
| **Spectral Band** | Low-mid -> high -> mid (complex sweep) |

#### 26. `SFX.powerupExpire`
| Property | Value |
|----------|-------|
| **Trigger** | Powerup effect timer expires |
| **Oscillator** | sine |
| **Frequency** | 400Hz -> 100Hz (exponential ramp) |
| **Gain** | 0.15 -> 0.01 |
| **Duration** | 300ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid -> bass (descending whoosh) |

#### 27. `SFX.shopCheckout`
| Property | Value |
|----------|-------|
| **Trigger** | Player purchases items in shop |
| **Oscillator** | sine (x5 coin clinks + 2 bell tones) |
| **Frequency** | Clinks: 1800, 2200, 2000, 2400, 1600Hz (sweep to half); Bell: 1200Hz + 1500Hz |
| **Gain** | Clinks 0.15, bell 0.2/0.15 |
| **Duration** | Clinks 80ms each at 40ms intervals; bell 200ms at 220ms offset |
| **Envelope** | Each clink: attack -> half-freq sweep -> decay |
| **Modulation** | None |
| **Spectral Band** | High-mid/high (1200-2400Hz, cash register character) |

#### 28. `SFX.shopEmpty`
| Property | Value |
|----------|-------|
| **Trigger** | Shop cart cleared |
| **Oscillator** | sawtooth |
| **Frequency** | 600Hz -> 100Hz |
| **Gain** | 0.12 -> 0.01 |
| **Duration** | 150ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid -> bass (descending whoosh) |

#### 29. `SFX.shopStartWave`
| Property | Value |
|----------|-------|
| **Trigger** | Player starts wave from shop |
| **Oscillator** | square (x4 main) + sine (x4 fifth harmony at 1.5x) |
| **Frequency** | 400, 500, 600, 800Hz + 600, 750, 900, 1200Hz |
| **Gain** | 0.18 main, 0.08 harmony |
| **Duration** | 120ms main, 100ms harmony, staggered 60ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (400-1200Hz) |

#### 30. `SFX.tankStunned`
| Property | Value |
|----------|-------|
| **Trigger** | Tank hit by bomb (stunned) |
| **Oscillator** | sine (thud: 80->40Hz) + square (clang: 300->150Hz) |
| **Gain** | Thud 0.4, clang 0.25 -> 0.01 |
| **Duration** | Thud 300ms, clang 150ms |
| **Envelope** | Hard attacks, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Sub-bass/bass (40-80Hz thud) + low-mid (150-300Hz clang) |

#### 31. `SFX.tankRecovered`
| Property | Value |
|----------|-------|
| **Trigger** | Tank recovers from stun |
| **Oscillator** | sawtooth (100->400Hz) + square (200->600Hz) |
| **Gain** | 0.15 + 0.1 -> 0.01 |
| **Duration** | 250ms + 200ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Bass -> low-mid (ascending) |

#### 32. `SFX.revive`
| Property | Value |
|----------|-------|
| **Trigger** | Player revives (paid extra life) |
| **Oscillator** | sine (200->1000Hz) + triangle (400->2000Hz) + sine sparkles (800, 1000, 1200, 1500Hz) |
| **Gain** | 0.3 main, 0.15 sparkles -> 0.01 |
| **Duration** | 500ms sweep + sparkles at 100ms+80ms*i |
| **Envelope** | Hard attack, exponential decay; sparkle notes layered after |
| **Modulation** | None |
| **Spectral Band** | Bass -> high (sweeping), sparkles mid/high-mid |

#### 33. `SFX.bombDrop`
| Property | Value |
|----------|-------|
| **Trigger** | Player drops a bomb |
| **Oscillator** | sine |
| **Frequency** | 300Hz -> 80Hz |
| **Gain** | 0.2 -> 0.01 |
| **Duration** | 200ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid -> sub-bass (descending) |

#### 34. `SFX.bombReady`
| Property | Value |
|----------|-------|
| **Trigger** | Bomb recharged/available |
| **Oscillator** | triangle (x2) |
| **Frequency** | 900Hz then 1200Hz |
| **Gain** | 0.12 then 0.1 |
| **Duration** | 80ms + 60ms, 60ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (900-1200Hz) |

#### 35. `SFX.targetReveal`
| Property | Value |
|----------|-------|
| **Trigger** | New target type revealed |
| **Oscillator** | square |
| **Frequency** | 600Hz |
| **Gain** | 0.12 |
| **Duration** | 70ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (600Hz + harmonics) |

#### 36. `SFX.targetMax`
| Property | Value |
|----------|-------|
| **Trigger** | Target count at maximum |
| **Oscillator** | square (x2) |
| **Frequency** | 900Hz then 1200Hz |
| **Gain** | 0.14 then 0.12 |
| **Duration** | 80ms each, 70ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (900-1200Hz) |

#### 37. `SFX.bonusEarned`
| Property | Value |
|----------|-------|
| **Trigger** | Wave bonus achieved |
| **Oscillator** | square (x2) |
| **Frequency** | 1000Hz then 1400Hz |
| **Gain** | 0.06 each |
| **Duration** | 40ms each, 40ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (1000-1400Hz) |

#### 38. `SFX.bonusMissed`
| Property | Value |
|----------|-------|
| **Trigger** | Wave bonus not achieved |
| **Oscillator** | square |
| **Frequency** | 300Hz |
| **Gain** | 0.06 |
| **Duration** | 40ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid (300Hz) |

#### 39. `SFX.countFinish`
| Property | Value |
|----------|-------|
| **Trigger** | Score count-up animation completes |
| **Oscillator** | sine (x2) |
| **Frequency** | 800Hz then 1200Hz |
| **Gain** | 0.15 then 0.12 |
| **Duration** | 80ms + 100ms, 50ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (800-1200Hz) |

#### 40. `SFX.sectionReveal`
| Property | Value |
|----------|-------|
| **Trigger** | Wave summary section appears |
| **Oscillator** | sine |
| **Frequency** | 300Hz -> 600Hz (80ms ramp) |
| **Gain** | 0.08 -> 0.01 |
| **Duration** | 100ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid -> mid (ascending whoosh) |

#### 41. `SFX.summaryComplete`
| Property | Value |
|----------|-------|
| **Trigger** | Full wave summary displayed |
| **Oscillator** | sine (x4) + triangle (x1 sparkle) |
| **Frequency** | 523, 659, 784, 1047Hz + 1319Hz sparkle |
| **Gain** | 0.12-0.18 + sparkle 0.06 |
| **Duration** | 150-300ms, staggered 80ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid -> high-mid (C major arpeggio) |

#### 42. `SFX.countdownTick`
| Property | Value |
|----------|-------|
| **Trigger** | Shop countdown timer ticking |
| **Oscillator** | triangle (+ sine on final tick) |
| **Frequency** | 400 + remaining*100 Hz (descending as countdown approaches 0); final: 400Hz + 200Hz |
| **Gain** | 0.1 (0.12 + 0.06 on final) |
| **Duration** | 80ms (150ms + 200ms on final) |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (400-900Hz, variable) |

#### 43. `SFX.bombBounce`
| Property | Value |
|----------|-------|
| **Trigger** | Bomb hits ground/bounces |
| **Oscillator** | sine |
| **Frequency** | 100Hz -> 60Hz |
| **Gain** | 0.15 -> 0.01 |
| **Duration** | 100ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Sub-bass/bass (60-100Hz, thud) |

#### 44. `SFX.startShopMusic` / `SFX.stopShopMusic`
| Property | Value |
|----------|-------|
| **Trigger** | Shop screen open/close |
| **Oscillator** | triangle (arpeggio notes) |
| **Frequency** | C4/E4/G4/C5 -> G4/E4/C4/G3 -> D4/F#4/A4/D5 -> A4/F#4/D4/A3 (16-note loop, ~196-587Hz) |
| **Gain** | Master 0.12 (fade in 500ms), note gain 0.2 per note |
| **Duration** | Continuous, 200ms per note (5 notes/second) |
| **Envelope** | Master gain fade-in 500ms, fade-out 300ms; per-note: attack -> exponential decay 180ms |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (196-587Hz, triangle waves) |

#### 45. `SFX.missileLockOn`
| Property | Value |
|----------|-------|
| **Trigger** | Player missile acquires target lock |
| **Oscillator** | triangle (x2) |
| **Frequency** | 520Hz then 780Hz |
| **Gain** | 0.08 each -> 0.01 |
| **Duration** | 50ms each, 70ms stagger |
| **Envelope** | Instant attack, rapid exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (520-780Hz) |

#### 46. `SFX.missileLaunch`
| Property | Value |
|----------|-------|
| **Trigger** | Player fires missiles |
| **Oscillator** | sawtooth (120->400->80Hz) + sawtooth (40->200Hz) |
| **Gain** | 0.12 -> 0.01 |
| **Duration** | 180ms |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | Bandpass filter at 300Hz, Q=0.8 |
| **Spectral Band** | Bass/low-mid (40-400Hz, bandpass filtered) |

#### 47. `SFX.missileReady`
| Property | Value |
|----------|-------|
| **Trigger** | Single missile recharged |
| **Oscillator** | sine (x3) |
| **Frequency** | 440, 550, 660Hz |
| **Gain** | 0.06 each -> 0.01 |
| **Duration** | 70ms each, 45ms stagger |
| **Envelope** | Instant attack, rapid exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (440-660Hz) |

#### 48. `SFX.missileGroupReady`
| Property | Value |
|----------|-------|
| **Trigger** | Full missile group recharged |
| **Oscillator** | sine |
| **Frequency** | 880Hz |
| **Gain** | 0.05 -> 0.001 |
| **Duration** | 40ms |
| **Envelope** | Instant attack, very rapid decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (880Hz) |

#### 49. `SFX.researchComplete`
| Property | Value |
|----------|-------|
| **Trigger** | Tech tree research finishes |
| **Oscillator** | sine (x4) |
| **Frequency** | 523, 659, 784, 1047Hz (C5, E5, G5, C6) |
| **Gain** | 0.2 each -> 0.01 |
| **Duration** | 400ms each, staggered 120ms |
| **Envelope** | Scheduled start, exponential decay over 400ms |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (523-1047Hz) |

#### 50. `SFX.droneDeploy`
| Property | Value |
|----------|-------|
| **Trigger** | Drone pod drops from UFO |
| **Oscillator** | sawtooth (whoosh: 200-300 -> 60-80Hz) + square (clunk: 140-180 -> 60Hz) |
| **Gain** | Whoosh 0.15, clunk 0.12 -> 0.01 |
| **Duration** | Whoosh 250ms, clunk 70ms at 50ms offset |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid -> sub-bass (type-dependent pitch) |

#### 51. `SFX.droneUnfold`
| Property | Value |
|----------|-------|
| **Trigger** | Drone pod unfolds into active drone |
| **Oscillator** | sawtooth (servo: 80-100 -> 300-400 -> 150-200Hz) + square (clicks: 900-1200Hz x3) |
| **Gain** | Servo 0.08->0.12->0.01, clicks 0.1->0.01 |
| **Duration** | Servo 600ms, clicks 30ms each at 100ms/250ms/400ms |
| **Envelope** | Servo: ramp up then decay; clicks: instant attack, rapid decay |
| **Modulation** | None |
| **Spectral Band** | Bass -> low-mid (servo) + mid/high-mid (clicks) |

#### 52. `SFX.droneBeam`
| Property | Value |
|----------|-------|
| **Trigger** | Drone activates its beam |
| **Oscillator** | Random wave type (sine/triangle/square) + sine (detuned harmonic) |
| **Frequency** | 250-400Hz base, random slide up or down by 30%, LFO 8-18Hz, depth 20-60Hz |
| **Gain** | 0.1 main, 0.05 harmonic -> 0.01 |
| **Duration** | 200-350ms (randomized) |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | FM vibrato via LFO (R2D2 warble character) |
| **Spectral Band** | Low-mid/mid (175-520Hz, variable) |

#### 53. `SFX.droneShoot`
| Property | Value |
|----------|-------|
| **Trigger** | Combat drone fires |
| **Oscillator** | Random sawtooth/square (400-900 -> 100-300Hz) + square (detuned) + optional sine chirp |
| **Gain** | 0.12 main, 0.06 detuned -> 0.01; chirp 0.06 |
| **Duration** | 60-120ms (randomized), chirp 30ms |
| **Envelope** | Instant attack, rapid exponential decay |
| **Modulation** | Detune +/-60 cents, random chirp follow-up |
| **Spectral Band** | Mid -> bass (descending zap) |

#### 54. `SFX.droneDeliver`
| Property | Value |
|----------|-------|
| **Trigger** | Drone delivers biomatter orb |
| **Oscillator** | square (x2) |
| **Frequency** | 600-700Hz then 900-1000Hz (ascending blips with random offset) |
| **Gain** | 0.1 each -> 0.01 |
| **Duration** | 50ms each, 60ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (600-1300Hz) |

#### 55. `SFX.droneOrbReceive`
| Property | Value |
|----------|-------|
| **Trigger** | UFO receives biomatter orb from drone |
| **Oscillator** | square (x2) + sine (x1) |
| **Frequency** | 700, 1100, 1500Hz (ascending triplet) |
| **Gain** | 0.12 each -> 0.01 |
| **Duration** | 60ms each, 35ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (700-1500Hz) |

#### 56. `SFX.dronePickup`
| Property | Value |
|----------|-------|
| **Trigger** | Drone successfully harvests target |
| **Oscillator** | sine (x4) |
| **Frequency** | 400, 500, 600, 800Hz (same as abductionComplete) |
| **Gain** | 0.15 each -> 0.01 |
| **Duration** | 100ms each, 60ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (400-800Hz) |

#### 57. `SFX.droneDestroy`
| Property | Value |
|----------|-------|
| **Trigger** | Drone destroyed |
| **Oscillator** | sawtooth + square (detuned warble) + LFO (20-40Hz) + random blips + noise burst |
| **Frequency** | 500-1000Hz -> 30-70Hz (descending scream), blips 200-1000Hz random |
| **Gain** | 0.15 main, 0.08 detuned, 0.08 blips, 0.14 noise -> 0.01 |
| **Duration** | 200-300ms scream + 250ms noise |
| **Envelope** | Complex: warble decay + random blip overlay + filtered noise |
| **Modulation** | FM (20-40Hz LFO, 40-100Hz depth), lowpass noise (400-600Hz -> 80Hz) |
| **Spectral Band** | Full spectrum descending (R2D2 death scream) |

#### 58. `SFX.dronePreExplode`
| Property | Value |
|----------|-------|
| **Trigger** | Drone about to self-destruct (countdown) |
| **Oscillator** | square (x5 accelerating beeps) |
| **Frequency** | 800Hz -> 1600Hz (ascending across 5 beeps) |
| **Gain** | 0.15 -> 0.25 (increasing urgency) |
| **Duration** | 80ms -> 30ms (decreasing length), total 600ms |
| **Envelope** | Per-beep: instant attack, exponential decay; gaps accelerate |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (800-1600Hz) |

#### 59. `SFX.commanderSpeechGarble`
| Property | Value |
|----------|-------|
| **Trigger** | Commander text display (alien speech) |
| **Oscillator** | sawtooth/square (random) + optional square chirp overtone |
| **Frequency** | 120-200Hz base, slides +/-20-60%; chirp at 3x base freq |
| **Gain** | 0.06 main, 0.02 chirp -> 0.01 |
| **Duration** | 40-70ms per syllable |
| **Envelope** | Instant attack, rapid exponential decay |
| **Modulation** | Bandpass filter 400-1000Hz, Q=2-6 (muffled voice character) |
| **Spectral Band** | Bass/low-mid (120-200Hz base, filtered) |

#### 60. `SFX.bootPanelStart`
| Property | Value |
|----------|-------|
| **Trigger** | HUD panel begins boot |
| **Oscillator** | sine (x2: ascending major third) |
| **Frequency** | 440Hz then 554Hz (A4 -> C#5) |
| **Gain** | 0.07 then 0.06 -> 0.001 |
| **Duration** | 80ms + 90ms, 60ms overlap |
| **Envelope** | Instant attack, fast exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid (440-554Hz, TNG-style) |

#### 61. `SFX.bootPanelOnline`
| Property | Value |
|----------|-------|
| **Trigger** | HUD panel completes boot |
| **Oscillator** | sine (x3) |
| **Frequency** | 523, 659, 784Hz (C5, E5, G5 -- ascending major triad) |
| **Gain** | 0.06 each -> 0.001 |
| **Duration** | 70ms each (+40ms decay tail), 60ms stagger |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (523-784Hz) |

#### 62. `SFX.bootDataChatter`
| Property | Value |
|----------|-------|
| **Trigger** | Boot sequence data scrolling animation |
| **Oscillator** | sine |
| **Frequency** | Random from [660, 784, 880, 988, 1047, 1175] Hz |
| **Gain** | 0.035 -> 0.001 |
| **Duration** | 60ms |
| **Envelope** | Instant attack, very rapid exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (660-1175Hz) |

#### 63. `SFX.bootMissileSkip`
| Property | Value |
|----------|-------|
| **Trigger** | Boot skips unavailable subsystem |
| **Oscillator** | sine (x2: descending) |
| **Frequency** | 600Hz then 400Hz |
| **Gain** | 0.04 each -> 0.001 |
| **Duration** | 50ms each, 40ms stagger |
| **Envelope** | Instant attack, rapid exponential decay |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (400-600Hz) |

#### 64. `SFX.bootAllOnline`
| Property | Value |
|----------|-------|
| **Trigger** | All HUD panels booted, system ready |
| **Oscillator** | sine (x2: doorbell) |
| **Frequency** | 330Hz (E4) then 660Hz (E5 -- octave up) |
| **Gain** | 0.07 then 0.08 -> 0.001 |
| **Duration** | 120ms + 500ms, 180ms stagger |
| **Envelope** | First: quick decay; second: longer sustained decay (doorbell ring) |
| **Modulation** | None |
| **Spectral Band** | Low-mid/mid (330-660Hz) |

#### 65. `SFX.researchCountdownBlip`
| Property | Value |
|----------|-------|
| **Trigger** | Research timer countdown (per second) |
| **Oscillator** | sine (+ second sine on last 2 seconds) |
| **Frequency** | 600-1350Hz base (rises as time decreases), sweeps to 1.5x over 80ms |
| **Gain** | 0.08 (+ 0.06 for double blip) -> 0.01 |
| **Duration** | 120ms (+ 100ms double on last 2s) |
| **Envelope** | Instant attack, exponential decay |
| **Modulation** | None |
| **Spectral Band** | Mid/high-mid (600-2025Hz, escalating) |

---

## PART 2: SPECTRAL MAP & FREQUENCY COVERAGE

### Frequency Band Occupation Map

```
BAND              RANGE (Hz)    SOUNDS PRESENT                                           DENSITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUB-BASS          20-80         moveLoop(80Hz), bombBounce(60-100), tankStunned(40-80),   ███░░ MODERATE
                                bombDrop(80), droneDeploy(60-80)

BASS              80-200        beamLoop(150), moveLoop(80-150), chargingHum(120-200),    ████░ WELL-COVERED
                                missileFire(50-100), ufoHit(100-200), shellFire(200),
                                energyLow(200), gameOver(200), targetDropped(100),
                                commanderSpeech(120-200), explosion(filter target)

LOW-MID           200-500       beamOn(200-800), abductionComplete(400-500),              █████ CROWDED
                                distressBeep(400-600), targetDropped(400),
                                shellFire(800->200), powerupCollect(350-600),
                                shopEmpty(100-600), tankRecovered(100-600),
                                bootAllOnline(330-660), bootMissileSkip(400-600),
                                sectionReveal(300-600), bonusMissed(300),
                                countdownTick(400-900), shopMusic(196-587),
                                droneBeam(175-520), missileLaunch(40-400)

MID               500-2000      chargeFull(523-784), waveComplete(523-1047),              █████ CROWDED
                                bucksAward(500-900), countTick(600),
                                powerupSpawn(600-1200), feedbackSuccess(523-1047),
                                abductionComplete(600-800), summaryComplete(523-1047),
                                bootPanelStart(440-554), bootPanelOnline(523-784),
                                bootDataChatter(660-1175), timerWarning(440),
                                missileLockOn(520-780), missileReady(440-660),
                                missileGroupReady(880), researchComplete(523-1047),
                                droneShoot(100-900), droneDeliver(600-1300),
                                droneOrbReceive(700-1500), dronePickup(400-800),
                                shieldHit(800-2000), bonusEarned(1000-1400),
                                countFinish(800-1200), targetReveal(600),
                                targetMax(900-1200), bombReady(900-1200),
                                warpJuke(200-2000), dronePreExplode(800-1600),
                                researchCountdownBlip(600-2025), shopStartWave(400-1200)

HIGH-MID          2000-5000     shopCheckout(1200-2400), warpJuke(peak 2000),             ██░░░ SPARSE
                                shieldBreak(start 2000), feedbackSuccess(1176-1571),
                                droneUnfold(clicks 900-1200)

HIGH              5000+         (none)                                                     ░░░░░ EMPTY
```

### Key Observations

1. **Sub-bass (20-80Hz)**: Good coverage from moveLoop -- this was the intentional "wonderful gap" fill. Thud sounds from bombs and tank stun provide punctuation but are transient.

2. **Bass (80-200Hz)**: Well-covered by continuous loops (beamLoop at 150Hz, chargingHum at 120Hz, moveLoop at 80-150Hz). Transient impacts also live here.

3. **Low-mid (200-500Hz)**: Crowded. Many game events produce sounds in this range. This is where spectral masking is most likely to occur during busy gameplay.

4. **Mid (500-2000Hz)**: Very crowded. Almost every UI jingle, confirmation, and game event arpeggio lives here. The heavy use of C-major based arpeggios (C5=523, E5=659, G5=784, C6=1047) across multiple sounds means they will blur together during rapid gameplay.

5. **High-mid (2000-5000Hz)**: Notably sparse. Only the shopCheckout coin clinks and shield hit reach here consistently. This is a prime opportunity for new HUD sounds.

6. **High (5000Hz+)**: Completely empty. Could be used sparingly for sparkle/glint effects but should be used with caution to avoid harshness.

### Sonic Identity Concerns

- **Over-reliance on C-major**: waveComplete, chargeFull, summaryComplete, bootPanelOnline, researchComplete, and feedbackSuccess all use the same C5-E5-G5 triad. These need differentiation.
- **Sine wave dominance**: Most UI sounds use pure sine. Adding triangle/sawtooth/square selectively would create more character variety.
- **Lack of filters**: Only a handful of sounds use BiquadFilter. Filtered sounds have more organic character.
- **No reverb/delay on synth sounds**: Only the target pickup samples have delay. Small amounts could add space.

---

## PART 3: NEW SOUND SPECIFICATIONS

### A. Boot Sequence Startup Sound (Quantum Alien Chord)

**Concept**: A cosmic, slightly unsettling "awakening" sound -- like a Mac startup chime but filtered through an alien quantum computer booting up. Should feel powerful and iconic. Three-layer chord with frequency modulation and filter sweep.

**Total Duration**: 2000ms

#### Layer 1: Sub-Harmonic Foundation
```
Oscillator type: triangle
Base frequency: 55Hz (A1 -- very low)
Frequency sweep: 55Hz steady for 500ms, then slow rise to 82.4Hz (E2) over 1500ms
Gain: 0.15
Gain envelope: attack 200ms (ramp from 0 to 0.15), sustain 1200ms, release 600ms (exponential to 0.01)
Duration: 2000ms
Modulation: LFO 2Hz sine modulating gain +/-0.03 (gentle throb)
Notes: Provides the "cosmic weight" foundation. Uses triangle for warm harmonics without sawtooth harshness.
Spectral band: Sub-bass (55-82Hz)
```

#### Layer 2: Chord Pad (Alien Intervals)
```
Oscillator type: sawtooth (x3 detuned voices)
Base frequencies: 220Hz (A3), 277Hz (C#4), 370Hz (F#4) -- A major with raised 6th, slightly alien interval
Frequency sweep: Each voice sweeps up a minor 2nd over 2000ms (220->233, 277->294, 370->392)
Gain: 0.06 per voice (0.18 total)
Gain envelope: attack 400ms (slow bloom), sustain 1000ms, release 600ms
Duration: 2000ms
Modulation: Each voice detuned +5, 0, -5 cents for chorus width. 0.5Hz LFO on detune for subtle drift.
Filter: Lowpass BiquadFilter starting at 200Hz, sweep to 4000Hz over first 800ms (filter opens = bloom effect), then settle to 2000Hz
Notes: The three-voice detuned sawtooth through a sweeping lowpass creates the rich "quantum bloom" character. The A-C#-F# voicing is major but with a raised 6th that gives it an otherworldly quality (not standard pop/game major).
Spectral band: Low-mid -> mid (220-4000Hz during sweep)
```

#### Layer 3: Crystalline Ring-Out
```
Oscillator type: sine (x2)
Base frequencies: 1760Hz (A6) + 2217Hz (C#7)
Frequency sweep: None (steady pitch)
Gain: 0.0 for first 600ms, then attack to 0.1 over 200ms, decay 0.08 over 1200ms
Gain envelope: Delayed entry at 600ms, 200ms attack, long 1200ms exponential decay (ring-out)
Duration: 2000ms (last 1400ms audible)
Modulation: 6Hz tremolo (sine LFO on gain, depth 0.02) for shimmer
Notes: The high crystalline tones enter after the chord pad has established itself, creating a "system fully powered" sparkle. Delayed entry prevents the sound from being front-loaded. The A6+C#7 reinforces the root chord.
Spectral band: High-mid (1760-2217Hz) -- fills the identified sparse zone
```

#### Implementation Notes
- All three layers trigger simultaneously at t=0
- Layer 1 provides the felt-not-heard foundation
- Layer 2 opens up with the filter sweep ("the bloom")
- Layer 3 adds clarity after the bloom peaks
- Total gain headroom: peaks around 0.38 -- safe from clipping
- The A-C#-F# chord is the "alien signature" -- reuse these intervals as a motif throughout HUD sounds

---

### B. Four-Tone Corner Sequence (Boot Border Trace)

**Concept**: Four tones that play one per corner as the border traces around the HUD. They form a memorable alien motif using the same harmonic language as the startup sound. The sequence should feel like a system "pinging" each quadrant of the command interface.

**Musical Motif**: Based on the A-C#-F# alien chord from the startup sound, we use a descending pattern that resolves on the fourth note:

| Corner | Note | Frequency | Interval | Character |
|--------|------|-----------|----------|-----------|
| Top-Left | F#5 | 740Hz | Starting note | Bright, expectant |
| Top-Right | E5 | 659Hz | Down a major 2nd | Stepping down |
| Bottom-Right | C#5 | 554Hz | Down a minor 3rd | Deeper, building tension |
| Bottom-Left | A4 | 440Hz | Down a major 3rd (resolves to root) | Resolution, "home" |

**This creates the interval pattern: root-down-down-home.** The F#->E->C#->A sequence descends through an A major scale and resolves to the root. It is immediately recognizable after a few hearings.

#### Per-Tone Specification
```
Oscillator type: sine (main) + triangle (harmonic, 2 octaves up)
Base frequency: [as per table above]
Harmonic frequency: Main freq * 4 (two octaves up, faint sparkle)
Gain (main): 0.12
Gain (harmonic): 0.04
Gain envelope: Attack 5ms (near-instant), hold 40ms at peak, exponential decay to 0.001 over 120ms
Duration: 165ms total per tone
Modulation: None (clean, precise -- military/digital character)
Filter: None (pure tones for maximum clarity)
Notes: The ~165ms duration per corner matches a border trace of ~660ms for the full rectangle (4 corners at ~165ms each). Each tone should trigger exactly when the trace line reaches the corner.
```

#### Timing Within Boot Sequence
```
t+0ms:    Top-Left corner reached     -> F#5 (740Hz)
t+165ms:  Top-Right corner reached    -> E5 (659Hz)
t+330ms:  Bottom-Right corner reached -> C#5 (554Hz)
t+495ms:  Bottom-Left corner reached  -> A4 (440Hz)
t+660ms:  Border trace complete
```

#### Variation for Subsequent Boots
After wave 1, the corner sequence could play at 80% speed with a subtle detune (+8 cents) and a lowpass at 3000Hz to feel slightly "worn in" -- the system has been running, it boots a little lazily. This is optional but adds life.

---

### C. Danger/Warning Sounds (Low Health System)

**Concept**: A multi-stage warning system that increases in urgency as health drops. Uses sharp, attention-getting square waves with increasing rate and pitch. Should feel like cockpit alarms in an aircraft -- impossible to ignore but not so annoying that players mute the game.

#### Stage 1: Caution (Health 15-25%)
```
Pattern: Single beep every 2000ms
Oscillator type: square
Base frequency: 440Hz (A4)
Gain: 0.08
Gain envelope: Attack 2ms, sustain 30ms, decay 50ms to 0.01
Duration: 82ms per beep
Modulation: None
Notes: Subtle, non-intrusive. The player should notice it subconsciously. The 2-second interval is slow enough to not be annoying. Square wave gives it an "alarm" character distinct from the sine-based UI sounds.
Spectral band: Mid (440Hz + odd harmonics at 1320, 2200, 3080Hz)
```

#### Stage 2: Warning (Health 5-15%)
```
Pattern: Double beep (beep-beep) every 1200ms
Oscillator type: square
Base frequency: Beep 1: 523Hz (C5), Beep 2: 659Hz (E5) -- ascending pair
Gap between pair: 80ms
Gain: 0.12
Gain envelope: Attack 2ms, sustain 25ms, decay 40ms to 0.01
Duration: 67ms per beep, pair takes 147ms
Modulation: None
Notes: The ascending pair creates urgency. The 1200ms interval is noticeably faster than Stage 1. Volume increase from 0.08 to 0.12 adds perceived danger.
Spectral band: Mid (523-659Hz + harmonics)
```

#### Stage 3: Critical (Health < 5%)
```
Pattern: Rapid triple beep (beep-beep-BEEP) every 800ms
Oscillator type: square
Base frequency: Beep 1: 659Hz (E5), Beep 2: 784Hz (G5), Beep 3: 1047Hz (C6) -- ascending triad
Gap between each: 60ms
Gain: Beep 1: 0.12, Beep 2: 0.14, Beep 3: 0.18 (crescendo)
Gain envelope: Attack 1ms (snappy), sustain 20ms, decay 30ms to 0.01
Duration: 51ms per beep, triple takes 171ms
Modulation: Beep 3 has 30Hz square LFO on gain (depth 0.04) for "alarm buzz" character
Notes: The triple beep with crescendo and buzzy final note creates genuine urgency. The 800ms interval means the player hears it constantly. The final beep's amplitude modulation adds a "rattling" quality like a warning siren.
Spectral band: Mid/high-mid (659-1047Hz + harmonics up to ~4000Hz)
```

#### Transition Behavior
- When health crosses a threshold, the current beep pattern should complete before switching to the new pattern
- When health recovers above 25%, silence the warning immediately (no fade-out -- relief should be instant)
- All warning sounds should be suppressed during wave summary / shop screens

---

### D. Bio-Matter Upload Sounds

**Concept**: Three distinct sounds for the bio-matter economy: cache filling blips, fast wave-end upload sequence, and cache emptying visualization sound.

#### D1. Cache Fill Blip (Single Unit Added)
```
Oscillator type: sine
Base frequency: 1800Hz (exploiting the sparse high-mid zone)
Frequency sweep: 1800Hz -> 2200Hz over 30ms (quick ascending blip)
Gain: 0.05
Gain envelope: Attack 2ms, decay 28ms exponential to 0.001
Duration: 30ms
Modulation: None
Notes: Very short, very quiet. These blips happen frequently during harvesting so they must be subtle enough to be background texture. The high frequency distinguishes them from all gameplay sounds (which are concentrated in 200-1200Hz). Should feel like a Geiger counter or data transfer indicator.
Spectral band: High-mid (1800-2200Hz)
```

#### D2. Fast Upload Sequence (End-of-Wave Cache Dump)
```
Pattern: Rapid blips accelerating from 50ms apart to 15ms apart over the duration of the upload
Oscillator type: sine
Base frequency: Starting at 1800Hz, each successive blip rises by ~20Hz (frequency climbs with progress)
Final frequency: ~2400Hz at completion
Gain: 0.06 (slightly louder than individual cache blips to be audible as a sequence)
Gain envelope: Per-blip: attack 1ms, decay to 0.001 over blip length
Duration: Each blip 15-25ms; total sequence matches the upload animation duration
Modulation: None
Notes: The acceleration creates excitement. The pitch climb creates a sense of progress/building energy. At peak speed, the blips nearly merge into a continuous rising tone -- this is intentional and satisfying. Use requestAnimationFrame timing to sync blips with the visual cache bar emptying.
Spectral band: High-mid (1800-2400Hz)
```

#### D3. Cache Complete Chime (Upload Finished)
```
Oscillator type: sine (main) + triangle (shimmer)
Base frequency: Main: 2400Hz -> hold; Shimmer: 3600Hz (octave + fifth above, subtle)
Gain: Main 0.1, shimmer 0.04
Gain envelope: Attack 5ms, sustain 100ms, decay 200ms to 0.001
Duration: 305ms
Modulation: Shimmer has 8Hz tremolo (depth 0.02) for sparkle
Notes: Completion sound that bookends the upload sequence. The 2400Hz frequency is a natural extension of the D2 sequence's final pitch. The sustained shimmer at 3600Hz is the highest pitched sound in the game -- it should feel like a data transfer "receipt confirmed" chirp.
Spectral band: High-mid (2400-3600Hz) -- NEW territory for the game
```

---

### E. HUD Interaction Sounds

#### E1. Generic HUD Feedback Beep (Panel Touch/Hover)
```
Oscillator type: sine
Base frequency: 1200Hz
Gain: 0.04
Gain envelope: Attack 2ms, decay 35ms to 0.001
Duration: 37ms
Modulation: None
Notes: The quietest, shortest sound in the palette. Used for any HUD element that responds to input. Must be completely non-fatiguing even after hundreds of triggers. The 1200Hz frequency sits between the crowded mid zone and the sparse high-mid zone.
Spectral band: High-mid (1200Hz)
```

#### E2. Panel Glitch Sound (Low Health HUD Corruption)
```
Oscillator type: square (main) + sawtooth (noise layer)
Base frequency: Main: random 100-800Hz; Noise: random 50-200Hz
Frequency sweep: Both jump to random new frequency after 15ms (step-wise, not smooth -- digital glitch character)
Gain: 0.08 (main), 0.04 (noise)
Gain envelope: Attack 0ms (instant), hold 30ms, cut to 0 (instant -- no decay tail, glitches end abruptly)
Duration: 30-60ms (randomized per occurrence)
Modulation: Frequency steps every 15ms to random values (creates the "broken data" character)
Notes: These trigger randomly during low-health visual glitching. The instant on/off with random frequency steps sounds like corrupt data being displayed. The square wave provides digital character, the sawtooth adds grit. Volume must be low enough to blend with the visual glitch rather than startle.
Spectral band: Variable (100-800Hz, changes per instance)
```

#### E3. Spark/Crackle Sound (Low Health Electrical Arcing)
```
Pattern: 2-4 rapid micro-bursts in quick succession
Oscillator type: White noise buffer (generated, 20ms)
Frequency: Highpass filter at 3000Hz (only the bright, crisp part of the noise)
Gain: 0.06 per burst, varying +/-0.02 randomly
Gain envelope: Attack 0ms, instant cut-off (sharp transients = electrical character)
Duration: 8-15ms per burst, 5-20ms random gap between bursts
Modulation: Random gain variation between bursts for organic feel
Notes: These accompany the visual spark particles on the HUD at low health. The highpass-filtered noise at 3000Hz+ sounds like electrical arcing. The random burst pattern prevents it from sounding mechanical. Pairs with E2 glitch sounds during heavy damage.
Spectral band: High (3000Hz+ noise) -- fills the empty high zone with appropriate content
```

---

### F. Envelope and Modulation Improvements to Existing Sounds

#### F1. `SFX.beamOn` -- Add Attack Shaping
**Current**: Instant full volume at 0.08, then exponential decay.
**Proposed**: Add 10ms attack ramp (0 -> 0.08) to eliminate the click artifact from the instant onset. The current implementation creates a DC offset pop on some systems.
```js
// Change:
gain.gain.setValueAtTime(0.08, t);
// To:
gain.gain.setValueAtTime(0.001, t);
gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
```

#### F2. `SFX.abductionComplete` -- Add Gentle High Shimmer
**Current**: Four sine tones at 400/500/600/800Hz.
**Proposed**: Add a quiet sine at 2x the frequency of the last note (1600Hz) with 0.04 gain and 200ms decay. This adds "sparkle" to the completion moment without changing the core character.
```
Additional oscillator: sine, 1600Hz, gain 0.04, attack at same time as 800Hz note, 200ms exponential decay
```

#### F3. `SFX.ufoHit` -- Add Sub-Bass Impact Layer
**Current**: Single sawtooth with stepped frequencies.
**Proposed**: Add a sub-bass sine "thump" at 50Hz, gain 0.2, 80ms duration with 30ms exponential decay. This adds physical weight to the impact that you feel more than hear, making damage feel more impactful.
```
Additional oscillator: sine, 50Hz, gain 0.2, attack 0ms, decay 80ms exponential
```

#### F4. `SFX.energyLow` -- Replace with Filtered Warning
**Current**: Simple 200Hz square at 0.15 for 100ms. Sounds generic.
**Proposed**: Use the danger warning system from Section C instead. The current sound is a single flat beep with no urgency scaling. The graduated system in Section C replaces this entirely with much better game feel.

#### F5. `SFX.gameOver` -- Add Filter Sweep and Sub-Bass
**Current**: Four descending sine tones (400, 350, 300, 200Hz).
**Proposed**: Route through a lowpass filter starting at 2000Hz, sweeping down to 300Hz over the 800ms duration. This creates a "world closing in" effect. Also add a sub-bass sine at 40Hz (gain 0.15, 1000ms slow decay) that fades in over 400ms for physical dread weight.
```
Lowpass filter: 2000Hz -> 300Hz over 800ms
Sub-bass: sine 40Hz, gain 0.15, attack 400ms ramp, decay 600ms
```

#### F6. `SFX.explosion` -- Add Filtered Sub-Rumble for Big Explosions
**Current**: Noise buffer with lowpass sweep. Good but could use more chest-thump.
**Proposed**: For `big=true` only, add a 30Hz sine oscillator at gain 0.25 with 200ms attack ramp and 500ms decay. This provides the sub-bass "felt" rumble that the noise buffer alone cannot achieve (the noise filter already removes these frequencies).
```
Additional oscillator (big only): sine 30Hz, gain 0.25, attack 200ms linear ramp, decay 500ms exponential
```

#### F7. Differentiate Repeated C-Major Arpeggios
Multiple sounds use C5-E5-G5-C6 (523-659-784-1047Hz). To distinguish them:
- **`waveComplete`**: Keep as-is (the "canonical" C-major arpeggio -- players will associate this with wave completion)
- **`researchComplete`**: Change to D5-F#5-A5-D6 (587-740-880-1175Hz) -- related but distinct, and uses the alien F# from the boot sound motif
- **`summaryComplete`**: Add triangle wave harmony at the 5th above each note (784-988-1175-1571Hz) at 0.04 gain -- same notes but richer texture
- **`chargeFull`**: Change to A4-C#5-E5 (440-554-659Hz) -- uses the alien A-C# interval from the boot sound, lower register to match the charging context

---

### G. Reverb and Delay Recommendations

#### Approach: Subtle, Not Wet
The user requested "not too intense" reverb/delay. We use very short reverb tails and conservative wet/dry mixes. The goal is to add a sense of "space" to sounds so they don't feel like they're coming from a calculator speaker, while keeping the retro game character intact.

#### G1. Convolution-Free Algorithmic Reverb (Recommended Approach)
Instead of ConvolverNode (which requires an impulse response buffer), use a simple feedback delay network:

```
Implementation: Two parallel delay lines
Delay 1: 23ms delay, feedback 0.3, lowpass at 4000Hz
Delay 2: 37ms delay, feedback 0.25, lowpass at 3000Hz
Wet/Dry mix: 0.15 wet (very subtle)
```

This creates a small-room ambience without the CPU cost or buffer management of convolution. The prime-number delay times prevent metallic resonance.

#### G2. Where to Apply Reverb

| Sound | Reverb? | Rationale |
|-------|---------|-----------|
| Boot startup chord | Yes (0.2 wet) | The "iconic" sound benefits from space, like the Mac chime resonating |
| Corner tone sequence | Yes (0.15 wet) | Slight room feel makes the tones more musical |
| Wave complete fanfare | Yes (0.15 wet) | Celebration moment benefits from spaciousness |
| Game over | Yes (0.25 wet) | The somber descending tones gain emotional weight with reverb |
| Revive | Yes (0.2 wet) | Dramatic moment -- the reverb adds epicness |
| All other gameplay SFX | No | Gameplay sounds must be crisp and immediate |
| Warning beeps | No | Alarms must be dry and sharp -- reverb would soften urgency |
| Upload blips | No | Data sounds should be clinical/precise |

#### G3. Slapback Delay for Commander Speech
The commanderSpeechGarble already has character, but adding a single slapback echo would enhance the "alien transmission" feel:
```
Delay: 45ms (single repeat, no feedback)
Wet gain: 0.3 of dry signal
Filter on delay: Bandpass 500Hz, Q=2
```
This sounds like radio transmission echo. The bandpass on the delay path makes the echo muddier than the dry signal, suggesting the sound is bouncing off spaceship walls.

#### G4. Master Bus Considerations
Do NOT apply any master bus processing. Each sound that gets reverb should have it applied to its own signal chain. This prevents the reverb from accumulating when multiple sounds trigger simultaneously.

---

## PART 4: IMPLEMENTATION PRIORITY ORDER

For the implementation architect, these should be implemented in this order:

1. **Danger/Warning System (C)** -- Highest gameplay impact, replaces the inadequate `energyLow` sound
2. **Corner Tone Sequence (B)** -- Required for boot border trace animation
3. **Boot Startup Sound (A)** -- Required for boot sequence
4. **Bio-Matter Upload Sounds (D)** -- Required for upload conduit visual
5. **HUD Interaction Sounds (E)** -- Required for panel glitch and spark effects
6. **Envelope Improvements (F)** -- Polish pass on existing sounds
7. **Reverb System (G)** -- Final polish layer

---

## PART 5: GAIN BUDGET AND MIXING NOTES

### Maximum Simultaneous Gain Estimation

Worst case scenario (combat with low health):
- `beamLoop`: 0.04
- `moveLoop`: up to 0.15
- `chargingHum`: 0.08
- Danger warning beep: 0.18 (peak of critical stage)
- Drone sounds: 0.12
- Explosion: 0.4
- Total peak: ~0.97

This is dangerously close to clipping. Recommendations:
- Reduce `explosion(big)` gain from 0.4 to 0.3
- Reduce danger warning Stage 3 peak beep from 0.18 to 0.15
- Consider implementing a soft limiter on the master output (DynamicsCompressorNode with threshold -3dB, ratio 4:1, knee 6dB)

### Volume Hierarchy (Loudest to Quietest)
```
TIER 1 - FEEL IT (0.2-0.3):   explosion, ufoHit, tankStunned, powerupCollect
TIER 2 - HEAR IT (0.1-0.2):   beam sounds, warning beeps, jingles, weapons
TIER 3 - NOTICE IT (0.05-0.1): boot sounds, drone sounds, commander speech
TIER 4 - TEXTURE (0.02-0.05): data chatter, cache blips, HUD feedback, sparkle
```

New sounds should respect this hierarchy. The danger warning sounds intentionally cross from Tier 3 to Tier 2 as health decreases -- this is the whole point.
