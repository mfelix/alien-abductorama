# Phase 2 Sound Palette Specification

## Design Philosophy

Phase 2's sonic identity is **Star Trek TNG engineering room meets Evangelion NERV command center**. Where Phase 1 is bright, arcade, and immediate (the player IS the pilot), Phase 2 is deep, authoritative, and monitored (the player IS the commander watching screens). The audio landscape shifts from "in the cockpit" to "in the war room."

### Core Audio Identity

| Element | Phase 1 Character | Phase 2 Character |
|---------|-------------------|-------------------|
| Tone | Bright arcade, sine-dominant, 400-1200Hz | Deep command center, mixed-osc, 55-330Hz |
| Feel | Playful, immediate, direct | Authoritative, tense, monitored |
| Volume | 0.04-0.4, most at 0.08-0.25 | 0.02-0.15, most at 0.03-0.08 |
| Motif | C major chord (C5-E5-G5-C6) | Authority fifth (A2-E3, 110-165Hz) |
| Color | Cyan, bright greens | Command gold (warm), Director red (cold) |

### The Authority Fifth — Phase 2 Core Motif

Phase 1's victory motif is C major (523-659-784-1047 Hz). Phase 2 introduces the **Authority Fifth**: A2-E3 (110Hz-165Hz), a low perfect fifth using warm sawtooth oscillators through a lowpass filter. This chord says "command" the way Phase 1's C major says "victory." It appears in the promotion cinematic, wave start, override activation, and summary completion — always in gold-frequency territory.

### Three Color Palettes

**Command Gold (#d4a017)** — Warm, resonant, brass-like:
- Frequencies: 110-330Hz fundamental range
- Oscillators: Sawtooth (primary), triangle (soft variant)
- Character: Rich, authoritative, like a brass section at low volume
- Lowpass filtered at 800-2000Hz to keep warmth

**Director Red (#a00/#f44)** — Cold, ominous, inhuman:
- Frequencies: 40-80Hz sub-bass + 800-1200Hz harsh overtones (gap in middle = emptiness)
- Oscillators: Square (harsh), sawtooth (menacing) through bandpass
- Character: Sub-bass pressure + high-frequency ice. Never warm. Never green.
- Occasional ring modulation for inhuman quality

**CCTV Cyan/Green** — Phase 1 tones degraded through distance:
- Phase 1 sounds but: bandpass filtered (300-1500Hz), reduced gain (50-70% of original)
- Added noise floor (very subtle white noise underneath)
- Character: Familiar but far away, like hearing battle through a monitor speaker

---

## CATEGORY 1: PROMOTION CINEMATIC (16 sounds)

The promotion is the single most important audio sequence in the game. It is the player's one-time irreversible transition from arcade pilot to zone commander. Every sound must be perfect.

### promo-incomingTransmission
- Trigger: Phase A — "INCOMING -- PRIORITY: SUPREME" text appears (0.5s)
- Priority: HIGH
- Type: Square wave through bandpass
- Frequency: 800Hz initial, drops to 600Hz over 0.2s; then 600-800Hz alternating at 4Hz for 1.0s
- Duration: 1.2s total
- Gain: 0.12 peak, sustain at 0.06
- Envelope: Sharp attack (5ms), sustain for duration, 200ms decay
- LFO: 4Hz square LFO on gain (0.03-0.06) during sustain — creates "incoming signal" pulse
- Character: Cold, clinical alert klaxon. Not an alarm — a priority interrupt. Like a submarine's incoming message ping but colder.
- Relation to Phase 1: Phase 1 has no equivalent — this is the first sound the player hears that doesn't belong to their arcade world.

### promo-commanderGlitch
- Trigger: Phase A — Commander portrait starts glitching (1.0s)
- Priority: HIGH
- Type: Noise buffer (white noise) + square wave
- Frequency: Square at 200Hz with random jumps (100-400Hz every 50ms), noise through bandpass at 2000Hz
- Duration: 0.5s
- Gain: Noise at 0.04, square at 0.06, both ramping up with glitch intensity
- Envelope: Linear ramp 0 to max over 0.5s (follows commanderGlitchIntensity)
- LFO: None — randomized frequency jumps give chaotic feel
- Character: Digital signal degradation. The Commander's audio feed breaking up. Stuttering, crackling, digital artifacts.
- Relation to Phase 1: Inverts commanderSpeechGarble — instead of generating speech, it's destroying it.

### promo-commanderDissolve
- Trigger: Phase A — Commander dissolves to static (1.2s)
- Priority: HIGH
- Type: Filtered noise burst + descending sine
- Frequency: Noise through highpass starting at 4000Hz sweeping down to 200Hz; sine from 300Hz to 40Hz
- Duration: 0.8s (1.2s to 2.0s in Phase A)
- Gain: 0.15 peak on noise, 0.08 on sine, both fading out
- Envelope: Sharp attack (10ms), exponential decay over 0.8s
- LFO: None
- Character: Like a CRT being unplugged and the picture collapsing into a line then a dot. The sine sweeping down is the "power drain" feel. The noise is the static filling the void.
- Relation to Phase 1: Echoes Phase 1's explosion() but reversed — instead of an outward blast, it's an inward collapse.

### promo-directorMaterialize
- Trigger: Phase A — Director portrait materializes line by line (1.5s)
- Priority: HIGH
- Type: Sub-bass sine + detuned sawtooth pair through lowpass + high sine harmonics
- Frequency: Sub-bass at 55Hz steady; sawtooth pair at 110Hz and 113Hz (3Hz detuning = slow beat); harmonics at 880Hz and 1108Hz (cold, not warm)
- Duration: 1.5s (1.5s to 3.0s in Phase A)
- Gain: Sub-bass 0.08, sawtooth pair 0.04 each, harmonics 0.02 each; all fade in from 0 following directorAlpha
- Envelope: Slow linear fade-in matching the visual materialization, hold at peak for last 0.3s
- LFO: 0.5Hz tremolo on the sawtooth pair gain (depth 0.02) — slow breathing quality
- Character: Something ancient and cold waking up. Sub-bass pressure like a door opening to vacuum. The detuned sawtooths create an uneasy phasing. The high harmonics are icy glass. This is NOT a warm welcome — it's a cold arrival.
- Relation to Phase 1: Counter to alienStartupChime — that was warm/crystalline/ascending; this is cold/pressure/descending harmonics. Both are 3-layer but inverted in intent.

### promo-directorTypewriter
- Trigger: Phase A — Each character of Director's promotion text (2.0s+)
- Priority: LOW
- Type: Square wave through bandpass
- Frequency: 100-160Hz randomized per character (base 120Hz + random * 40Hz)
- Duration: 0.03s per character
- Gain: 0.04
- Envelope: Instant attack, instant release (hard on/off for typewriter click feel)
- LFO: None
- Character: Exactly like commanderSpeechGarble but lower, slower, more deliberate. The Director speaks with authority, not the Commander's nervous chatter. Each character is a distinct "tick" — like a teletype machine in a cold room.
- Relation to Phase 1: Lower, colder version of commanderSpeechGarble (which is sawtooth 120-200Hz through bandpass). Same concept, different weight class.

### promo-titleReveal
- Trigger: Phase B — "YOU ARE HEREBY PROMOTED TO ZONE COMMANDER" text appears (0.0s)
- Priority: HIGH
- Type: Sawtooth pair (A2 + E3) through lowpass + triangle sub-harmonic + noise impact
- Frequency: Sawtooth at 110Hz and 165Hz (the Authority Fifth); triangle at 55Hz (sub-octave); noise burst through lowpass at 400Hz
- Duration: 1.5s
- Gain: Sawtooths 0.06 each, triangle 0.10, noise 0.12 for 100ms then rapid decay
- Envelope: Noise burst 10ms attack / 100ms decay; oscillators 50ms attack, 0.8s sustain, 0.5s decay
- LFO: 1Hz gain tremolo on sawtooths (depth 0.01) — gives breathing "brass" quality
- Character: The Authority Fifth hits like a brass section announcing a general. The noise burst is the "impact" of the title card. Sub-bass triangle provides physical weight. This is THE moment — the player's role changes forever.
- Relation to Phase 1: Phase 1's waveComplete uses C major ascending (victory). This uses the Authority Fifth — not celebration, but APPOINTMENT. Deeper, more solemn, utterly authoritative.

### promo-cameraZoomOut
- Trigger: Phase B — Camera pulls back revealing the bigger picture (0.5s)
- Priority: MEDIUM
- Type: Sine wave descending + triangle sub-drone
- Frequency: Sine from 400Hz to 110Hz over 2.5s (following zoom); triangle steady at 55Hz
- Duration: 2.5s
- Gain: Sine at 0.04, triangle at 0.05; both hold steady
- Envelope: 200ms fade-in, sustain, no decay (transitions to command ambient)
- LFO: 0.3Hz vibrato on sine (depth 5Hz) — adds organic "pulling back" feel
- Character: The world getting bigger. Like the feeling when an elevator descends — that low-frequency pressure. The sine descending mirrors the visual zoom. Ends near the Authority Fifth territory, seeding the command center frequency range.
- Relation to Phase 1: Phase 1 has nothing like this — it's always first-person. This sound literally says "you're leaving that perspective."

### promo-hudDeath
- Trigger: Phase B — Phase 1 HUD panels fade to static (1.0s)
- Priority: MEDIUM
- Type: Noise buffer (filtered) + descending square pulses
- Frequency: Noise through lowpass 1000Hz sweeping to 200Hz; square pulses at 400Hz, 300Hz, 200Hz, 100Hz at 250ms intervals
- Duration: 1.0s
- Gain: Noise at 0.06, square pulses at 0.04 each, all fading
- Envelope: Quick attack (20ms), exponential decay for each pulse; noise sustains then drops
- LFO: None
- Character: The Phase 1 HUD dying — like old CRT monitors clicking off one by one. Each descending pulse is a system shutting down. The noise is the static that replaces the display.
- Relation to Phase 1: Direct destruction of Phase 1's audio identity. Uses the same square-wave blip character as bootPanelOnline but reversed — descending, fading, dying.

### promo-zone2Materialize
- Trigger: Phase B — Second zone wireframe appears on right side (2.0s)
- Priority: MEDIUM
- Type: Triangle wave ascending + filtered sawtooth shimmer
- Frequency: Triangle from 82Hz to 165Hz over 1.0s; sawtooth at 330Hz through bandpass (800Hz, Q=3)
- Duration: 1.0s
- Gain: Triangle at 0.05, sawtooth shimmer at 0.03
- Envelope: Linear fade-in over 1.0s (matching zone2Alpha)
- LFO: 2Hz tremolo on sawtooth gain (depth 0.01) — gives it a "materializing" shimmer
- Character: Something new assembling itself from data. Gold-frequency territory. Like a holographic projector powering up. Warm but electronic.
- Relation to Phase 1: Uses similar technique to bootPanelStart (ascending tone) but lower, warmer, longer — fitting Phase 2's deeper register.

### promo-whiteFlash
- Trigger: Phase C — White flash explosion (0.0s)
- Priority: HIGH
- Type: Noise burst (all frequencies) + sine sub-impact + reverse reverb tail
- Frequency: Full-spectrum noise (no filter initially); sine at 40Hz; "reverb" is a 110Hz triangle fading in during flash-out
- Duration: 0.5s (flash) + 0.8s (reverb tail)
- Gain: Noise 0.20 peak (big moment), sine 0.15, reverb triangle 0.06
- Envelope: Noise: instant attack, 200ms to peak, then rapid decay matching flashAlpha; sine: 10ms attack, 500ms decay; triangle: 200ms delayed attack, 600ms sustain
- LFO: None — raw impact
- Character: The biggest sound in the entire game. A thunderclap-meets-warp-flash. The noise is the white light hitting; the sub-sine is the physical impact you feel in your chest; the triangle tail is the ring-out as reality reassembles. Phase 1 is gone. Phase 2 has arrived.
- Relation to Phase 1: Phase 1's explosion(big=true) uses lowpass noise at 0.4 gain for 0.5s. This is bigger — unfiltered noise at higher gain plus sub-bass for physical weight. The most impactful sound in either phase.

### promo-wireframeReveal
- Trigger: Phase C — Gold wireframe skeleton of command HUD appears (0.2s)
- Priority: MEDIUM
- Type: Sawtooth through lowpass sweep + metallic ping
- Frequency: Sawtooth at 110Hz, lowpass sweeping from 200Hz to 1200Hz over 0.6s (filter opening = wireframe drawing); ping at 1320Hz (high E)
- Duration: 0.8s
- Gain: Sawtooth at 0.04 through filter, ping at 0.05
- Envelope: Sawtooth: 100ms attack, sustain during filter sweep, 200ms decay; ping: instant attack, 0.3s decay
- LFO: None
- Character: The command HUD skeleton being drawn in gold light. The lowpass sweep opening mirrors the wireframe lines extending. The ping at the end is the "blueprint complete" confirmation. Architectural, precise, gold-toned.
- Relation to Phase 1: Phase 1's boot sequence uses sine pings (bootPanelOnline). This uses sawtooth through a filter — rawer, more mechanical, less polished. The command center is still under construction.

### promo-commandActivated
- Trigger: Phase C — "COMMAND MODE ACTIVATED" text with double pulse (1.5s)
- Priority: HIGH
- Type: Authority Fifth sawtooth pair + square pulse at pulse rate
- Frequency: Sawtooths at 110Hz and 165Hz; square pulse at 220Hz, pulsing on/off at 4Hz matching the text alpha pulses
- Duration: 1.5s (4 pulses then fade)
- Gain: Sawtooths at 0.05 each, square pulse at 0.08 during on-beats
- Envelope: Each pulse: 10ms attack, 60ms sustain, 60ms release; overall gain follows activatedTextAlpha
- LFO: Gain gated at text pulse rate (0.25s period) for first 4 pulses, then steady decay
- Character: The Authority Fifth pulsing like a heartbeat. Each pulse matches the text flashing. This is a declaration, not a celebration — steady, powerful, rhythmic. Like NERV's klaxon but gold instead of red.
- Relation to Phase 1: Phase 1 has no equivalent. The closest is waveComplete's fanfare, but that's celebratory. This is military — it announces, it doesn't celebrate.

### promo-bootPanelStart
- Trigger: Phase C — Command boot sequence panels begin loading (0.5s, reuses Phase 2 boot sound)
- Priority: LOW
- Type: (See boot-panelStart below — this is the same sound)
- Character: The command center's systems beginning to come online during the cinematic.
- Relation to Phase 1: Deeper version of Phase 1's bootPanelStart.

### promo-bootPanelOnline
- Trigger: Phase C/D — Command boot panels completing (reuses Phase 2 boot sound)
- Priority: LOW
- Type: (See boot-panelOnline below — this is the same sound)
- Character: Individual systems confirming online status.

### promo-directorFinalLine
- Trigger: Phase D — Director says "Do not disappoint me." (1.0s)
- Priority: HIGH
- Type: Sub-bass sine + typewriter ticks (same as promo-directorTypewriter) + ambient sub-pressure
- Frequency: Sub-bass at 45Hz steady (ominous underpinning); typewriter at 100-160Hz per char; ambient drone at 55Hz
- Duration: ~1.5s (text duration + lingering sub-bass)
- Gain: Sub-bass 0.06, typewriter 0.04 per tick, ambient 0.04
- Envelope: Sub-bass: 200ms fade-in before text starts, holds, 500ms fade-out after last character; typewriter follows text; ambient sustains
- LFO: 0.2Hz sine on sub-bass gain (depth 0.02) — slow, threatening pulse
- Character: The Director's parting shot. The sub-bass creates physical unease — you can almost feel it in your stomach. The typewriter is deliberate, each character carrying weight. "Do not disappoint me" should feel like a cold hand on your shoulder.
- Relation to Phase 1: Phase 1's Commander is warm and garbled. The Director is precise and threatening. Same typewriter concept, completely opposite emotional register.

### promo-directorPanelSlide
- Trigger: Phase D — Director channel panel slides in/out from bottom (0.8s and 1.5s)
- Priority: MEDIUM
- Type: Sawtooth through lowpass + servo-motor whine
- Frequency: Sawtooth at 80Hz, lowpass at 600Hz; servo: sine from 200Hz to 400Hz (slide in) or 400Hz to 200Hz (slide out) over 0.2s
- Duration: 0.2s each (slide in and slide out)
- Gain: Sawtooth at 0.03, servo at 0.05
- Envelope: Linear ramp matching slide progress
- LFO: None
- Character: Mechanical panel movement. Like a display sliding out of a console on hydraulics. The sawtooth provides the "mechanism" bass; the sine sweep is the "servo motor." Purposeful, mechanical, precise.
- Relation to Phase 1: No Phase 1 equivalent — HUD panels in Phase 1 boot/appear, they don't physically slide.

---

## CATEGORY 2: BOOT SEQUENCE (3 sounds)

Phase 2's boot sequence runs between waves and during the initial promotion cinematic. It should feel like a deeper, more authoritative version of Phase 1's BIOS boot — same concept, command-center scale.

### boot-panelStart
- Trigger: Each command panel begins its boot animation
- Priority: LOW
- Type: Triangle wave two-note ascending
- Frequency: First note at 165Hz (E3), second note at 220Hz (A3) — Phase 2's warm register, below Phase 1's 440/554Hz
- Duration: 0.15s total (two notes at 0.06s + 0.06s + tail)
- Gain: First note 0.04, second note 0.035
- Envelope: Each note: instant attack, 80ms exponential decay
- LFO: None
- Character: Phase 1's bootPanelStart but an octave lower and using triangle instead of sine. Warmer, deeper, more authoritative. The "boo-beep" becomes a "doom-deep."
- Relation to Phase 1: Direct descendant of bootPanelStart (sine 440/554Hz). Same two-note ascending pattern shifted down one octave with warmer oscillator.

### boot-panelOnline
- Trigger: Each command panel completes its boot and goes online
- Priority: LOW
- Type: Triangle wave three-note ascending major triad
- Frequency: A3-C#4-E4 (220Hz, 277Hz, 330Hz) — Authority Fifth + major third
- Duration: 0.25s total
- Gain: 0.035 per note, increasing slightly (0.035, 0.04, 0.045)
- Envelope: Each note: instant attack, 0.07s sustain, 0.04s decay
- LFO: None
- Character: Phase 1's bootPanelOnline (C5-E5-G5, sine) brought down to command register. Uses triangle for warmth. Three ascending tones = "system confirmed." Gold-frequency territory.
- Relation to Phase 1: Phase 1's bootPanelOnline is C5-E5-G5 (523-659-784Hz, sine). This is A3-C#4-E4 (220-277-330Hz, triangle) — same ascending triad concept, dramatically lower.

### boot-allSystemsGo
- Trigger: All panels online, boot complete, transitioning to live command
- Priority: HIGH
- Type: Authority Fifth chord (sawtooth pair) + ascending confirmation + sub-bass impact
- Frequency: Sawtooths at 110Hz and 165Hz (Authority Fifth); ascending sine notes A3-C#4-E4-A4 (220-277-330-440Hz); sub triangle at 55Hz
- Duration: 1.2s
- Gain: Sawtooths 0.05 each, ascending notes 0.04 each, sub 0.06
- Envelope: Sub: 10ms attack, 0.3s sustain, 0.6s decay; sawtooths: 50ms attack, 0.5s sustain, 0.4s decay; ascending notes: 0.08s each at 0.1s intervals
- LFO: 1Hz tremolo on sawtooths (depth 0.01) — authoritative "brass" quality
- Character: The command center is fully operational. The Authority Fifth announces it, the ascending notes confirm each subsystem, the sub-bass provides gravitas. This is Phase 2's equivalent of Phase 1's alienQuantumOnline — the "we're ready" moment.
- Relation to Phase 1: Phase 1's alienQuantumOnline/bootAllOnline uses ascending C major sine notes. This uses the Authority Fifth chord with ascending A major confirmation. Same emotional beat (readiness), completely different register and character.

---

## CATEGORY 3: COMMAND STATE (6 sounds)

These sounds mark the major state transitions during command gameplay. They are the "structural" sounds that frame each wave.

### cmd-waveStart
- Trigger: Boot sequence completes, command wave begins (BOOT -> LIVE transition)
- Priority: HIGH
- Type: Authority Fifth sawtooth pair through lowpass sweep + tension sine ramp
- Frequency: Sawtooths at 110Hz and 165Hz, lowpass sweeping from 400Hz to 1600Hz over 0.6s; sine ramp from 220Hz to 440Hz over 0.4s
- Duration: 0.8s
- Gain: Sawtooths 0.05 each, sine ramp 0.03
- Envelope: Sawtooths: 30ms attack, filter sweep creates perceived volume increase; sine: 100ms attack, 0.3s sustain at target
- LFO: None — clean, authoritative
- Character: "Battle stations." The lowpass opening on the Authority Fifth is like curtains drawing back to reveal the command center. The ascending sine adds urgency. Not a fanfare — a deployment order.
- Relation to Phase 1: Phase 1's shopStartWave (ascending square notes 400-800Hz) is an energetic "ready go." This is a solemn "you are now responsible for these people."

### cmd-directorTransmit
- Trigger: Director begins a transmission (mood change, approval/disapproval message)
- Priority: HIGH
- Type: Sub-bass sine pulse + cold square harmonic + ring-modulated ping
- Frequency: Sub-bass at 50Hz; square at 800Hz through bandpass (1000Hz, Q=5); ring-mod: 50Hz x 800Hz sideband artifacts
- Duration: 0.4s
- Gain: Sub-bass 0.08, square 0.04, ring-mod artifacts 0.02
- Envelope: Sub-bass: 10ms attack, 200ms sustain, 200ms decay; square: 10ms attack, 100ms decay; ring: follows square
- LFO: None
- Character: "The Director has something to say." Physical sub-bass pressure (you feel it) + cold high-frequency alertness. The ring modulation creates inhuman overtones. This triggers the master gain ducking (CommandSFX.duck(0.4, 0.3)) so other sounds quiet down.
- Relation to Phase 1: No equivalent. Phase 1 has no authority figure transmitting. This is pure Director red — cold, demanding attention.

### cmd-waveTimerWarning
- Trigger: Wave timer enters final 30 seconds
- Priority: MEDIUM
- Type: Square wave pulse at escalating rate
- Frequency: 220Hz, pulsing on/off. Rate starts at 1Hz and accelerates to 4Hz over the 30 seconds
- Duration: Each pulse is 0.05s; repeats at timer rate
- Gain: 0.04, increasing to 0.06 in final 10 seconds
- Envelope: Each pulse: instant attack, 50ms, instant release
- LFO: The escalating pulse rate IS the urgency — controlled by timer logic, not LFO
- Character: A ticking urgency. Like a sonar ping getting faster. Not alarming enough to panic but persistent enough to create tension. Gold-frequency territory — this is YOUR timer, not the Director's.
- Relation to Phase 1: Phase 1's timerWarning is a single 440Hz square blip. This is lower (220Hz) and repeating, creating sustained tension rather than a one-time alert.

### cmd-waveEnd
- Trigger: Wave timer expires or all quotas met, transitioning to summary
- Priority: HIGH
- Type: Descending Authority Fifth (E3 to A2) + resolution sine chord
- Frequency: Sawtooths descending from 165Hz to 110Hz over 0.4s; then sine chord A3+C#4+E4 (220-277-330Hz)
- Duration: 1.0s
- Gain: Sawtooths 0.05 each, chord 0.04 per note
- Envelope: Sawtooths: 20ms attack, 0.4s sustain with descending pitch, 200ms decay; chord: 50ms attack at 0.4s mark, 0.5s sustain, 200ms decay
- LFO: None
- Character: "Stand down." The descending fifth says "it's over." The resolution chord (same as boot-panelOnline) provides closure. Not triumphant like Phase 1's waveComplete — more like "the watch is over, now comes the reckoning."
- Relation to Phase 1: Phase 1's waveComplete is an ascending C major fanfare (celebration). Phase 2's wave end is a descending fifth then resolution — duty completed, not victory achieved.

### cmd-quotaMet
- Trigger: A zone meets its abduction quota
- Priority: MEDIUM
- Type: Ascending triangle two-note confirmation
- Frequency: A3 (220Hz) to E4 (330Hz) — ascending fifth
- Duration: 0.2s
- Gain: 0.04 per note
- Envelope: Each note: 5ms attack, 0.08s sustain, 0.02s decay
- LFO: None
- Character: Clean, positive confirmation. The ascending fifth mirrors the Authority motif. Brief and professional — there are potentially 16 of these in a wave, so it must not be attention-demanding.
- Relation to Phase 1: Simpler, quieter version of abductionComplete's four-note ascending jingle. One interval instead of four notes.

### cmd-quotaExceeded
- Trigger: Zone exceeds quota (bonus territory)
- Priority: MEDIUM
- Type: Ascending triangle two-note + sparkle sine harmonic
- Frequency: A3 to E4 (same as quotaMet) + sine at 660Hz (E5, one octave above top note)
- Duration: 0.3s
- Gain: Triangle notes 0.04, sparkle 0.03
- Envelope: Triangle notes same as quotaMet; sparkle: 50ms delayed, 10ms attack, 0.15s decay
- LFO: None
- Character: QuotaMet plus a little extra sparkle — "they went above and beyond." The high harmonic adds brightness without breaking the command register. Still restrained.
- Relation to Phase 1: Slightly enhanced version of quotaMet, paralleling Phase 1's pattern of having base + enhanced versions of success sounds.

---

## CATEGORY 4: INPUT / UI (7 sounds)

These are the sounds of the player interacting with the command interface. They should feel like pressing buttons on a TNG engineering console — tactile, precise, responsive.

### ui-zoneSelect
- Trigger: Player selects a zone with number keys (Digit1-Digit4+)
- Priority: MEDIUM
- Type: Sine ping + very subtle triangle undertone
- Frequency: Sine at 330Hz (E4); triangle at 165Hz (E3, one octave below) for body
- Duration: 0.08s
- Gain: Sine 0.05, triangle 0.02
- Envelope: Sine: 3ms attack, 80ms exponential decay; triangle: instant, 60ms decay
- LFO: None
- Character: Clean, precise, almost tactile. Like pressing an illuminated button on a console. The sine is the "click," the triangle adds just enough body to feel authoritative. Must be fast — player may rapidly switch between zones.
- Relation to Phase 1: Similar to Phase 1's countTick (square 600Hz, 0.05s) but lower, warmer, and using sine instead of square. Less "arcade blip," more "console button."

### ui-fleetOrder
- Trigger: Player issues a fleet order (Aggressive/Defensive/Balanced)
- Priority: MEDIUM
- Type: Two-note sawtooth through lowpass + confirmation click
- Frequency: Sawtooth notes at 165Hz then 220Hz (ascending fifth in gold range); lowpass at 800Hz; click is square 600Hz for 10ms
- Duration: 0.18s
- Gain: Sawtooth 0.04 each note, click 0.05
- Envelope: First note: 5ms attack, 0.06s, 10ms decay; gap; second note: 5ms, 0.06s, 10ms decay; click at end
- LFO: None
- Character: "Order acknowledged." The ascending two-note is a compressed Authority motif — a tiny brass confirmation. The click at the end is the "seal" on the order. Professional, swift.
- Relation to Phase 1: No direct equivalent. Phase 1 doesn't have "orders" — the closest is shopCheckout (purchase confirmation), but that's playful. This is military.

### ui-overrideActivate
- Trigger: Player activates Direct Override mode (O key)
- Priority: HIGH
- Type: Dramatic ascending sweep (sawtooth) + sub-bass impact + high harmonic ring
- Frequency: Sawtooth sweep from 55Hz to 440Hz over 0.3s; sub-bass sine at 40Hz for 0.2s; harmonic ring at 880Hz
- Duration: 0.5s
- Gain: Sweep 0.08, sub-bass 0.10, harmonic 0.04
- Envelope: Sweep: 10ms attack, continuous ascent, 100ms decay at top; sub: 10ms attack, 200ms decay; harmonic: delayed 100ms, 10ms attack, 0.3s decay
- LFO: None — raw power
- Character: THE OVERRIDE. The most dramatic UI sound. The ascending sweep is the player TAKING CONTROL from the AI crews. The sub-bass is the physical weight of authority. The high harmonic is the "systems responding." This is the audio equivalent of slamming your hand on the Big Red Button.
- Relation to Phase 1: Phase 1's beamOn (sine 200-800Hz ascending, 0.08 gain, 0.2s) is the closest parallel — both are "taking action" ascending sweeps. Override is bigger, lower, more layered because the stakes are higher.

### ui-overrideEnd
- Trigger: Override timer expires or player cancels override
- Priority: HIGH
- Type: Descending sawtooth sweep + wind-down filtered noise
- Frequency: Sawtooth from 440Hz to 110Hz over 0.4s; noise through lowpass from 2000Hz to 200Hz
- Duration: 0.5s
- Gain: Sweep 0.06, noise 0.03
- Envelope: Sweep: 20ms attack at current level, descending, 100ms decay; noise: sustains, fades with filter closing
- LFO: None
- Character: Releasing control. The inverse of overrideActivate — everything descends and settles. Like letting go of a steering wheel and letting autopilot resume. The noise is the "systems returning to automatic" whisper.
- Relation to Phase 1: Inverse of overrideActivate, mirroring Phase 1's beamOn/beamOff pattern (stopBeamLoop has a quick fadeout).

### ui-resourceRoute
- Trigger: Player routes resources between zones
- Priority: MEDIUM
- Type: Sine sweep with slight vibrato + "whoosh" filtered noise
- Frequency: Sine from 220Hz to 330Hz over 0.15s; noise through bandpass at 600Hz, Q=2
- Duration: 0.2s
- Gain: Sine 0.04, noise 0.02
- Envelope: Both: 10ms attack, 0.12s sustain, 0.06s decay
- LFO: 8Hz vibrato on sine frequency (depth 5Hz) — gives "transmission" quality
- Character: Data in transit. Like sending a data packet — the sine moves from one frequency to another (origin to destination), the noise adds the "transmission medium" feel. Quick, functional, satisfying.
- Relation to Phase 1: Similar feel to Phase 1's droneDeliver (ascending blips) but smoother and more "data transfer" than "physical delivery."

### ui-menuNav
- Trigger: Navigation between UI elements, menu items
- Priority: LOW
- Type: Sine blip
- Frequency: 277Hz (C#4) — in the gold range
- Duration: 0.03s
- Gain: 0.025
- Envelope: Instant attack, 30ms exponential decay
- LFO: None
- Character: The smallest, subtlest UI sound. A tiny blip confirming cursor movement. Must never distract. Like the soft "tick" of a selection highlight moving.
- Relation to Phase 1: Much quieter, lower version of Phase 1's countTick (square 600Hz). Uses sine instead of square for softness.

### ui-errorReject
- Trigger: Player attempts an invalid action (can't select zone, insufficient resources, etc.)
- Priority: MEDIUM
- Type: Square wave two-note descending
- Frequency: 220Hz then 165Hz (descending fifth — inverse of Authority motif)
- Duration: 0.12s
- Gain: 0.05
- Envelope: Each note: 5ms attack, 0.04s sustain, 10ms decay
- LFO: None
- Character: "Negative." The Authority Fifth inverted — descending instead of ascending. Using square wave adds a harsh "buzz" quality that says "no" without being annoying. Brief, clear.
- Relation to Phase 1: Phase 1 doesn't have a clear "error" sound. Uses the Authority Fifth interval inverted, creating a consistent "language" — ascending = yes, descending = no.

---

## CATEGORY 5: ZONE SIMULATION — CCTV SOUNDS (13 sounds)

These are battlefield sounds heard through the command center's monitoring feeds. They should sound like Phase 1 sounds filtered through a CCTV speaker — recognizable but distant, degraded, and monitored rather than experienced directly.

**CCTV Filter Chain (applied to all zone sounds):**
- Bandpass filter: center 700Hz, Q=1.5 (removes sub-bass and highs = "small speaker" feel)
- Gain reduction: 50-70% of original Phase 1 equivalent
- Very subtle noise floor: white noise at 0.005 gain mixed in (barely audible, adds "feed" quality)

### zone-targetSpawn
- Trigger: New abduction target appears in a zone
- Priority: LOW
- Type: Sine blip (Phase 1 targetReveal through CCTV filter)
- Frequency: 600Hz (same as Phase 1) through bandpass at 700Hz
- Duration: 0.05s
- Gain: 0.03 (Phase 1 is 0.12 — this is 25%)
- Envelope: Instant attack, 50ms decay
- LFO: None
- Character: A distant blip on a monitor. You know a target appeared but it's happening "over there."
- Relation to Phase 1: Phase 1's targetReveal (square 600Hz at 0.12) filtered and reduced. Same pitch, different presence.

### zone-beamActive
- Trigger: A crew UFO is actively beaming a target in a zone
- Priority: LOW
- Type: Sawtooth warble through CCTV filter (Phase 1 beamLoop reference)
- Frequency: 150Hz base with 8Hz LFO at 30Hz depth (same as Phase 1 beamLoop but through bandpass)
- Duration: Loop — plays while beam is active in selected zone only
- Gain: 0.02 (Phase 1 beamLoop is 0.04 — half volume through filter)
- Envelope: 200ms fade-in/out
- LFO: 8Hz on frequency (depth 30Hz) — same warble as Phase 1 but sounds "transmitted"
- Character: The familiar beam sound but heard through a speaker. Players who spent hours in Phase 1 will recognize it subconsciously. Creates continuity while establishing distance.
- Relation to Phase 1: Directly based on startBeamLoop (sawtooth 150Hz, 8Hz LFO). Same sound, CCTV-degraded.

### zone-abductionComplete
- Trigger: Crew successfully abducts a target in a zone
- Priority: LOW
- Type: Four ascending sine notes through CCTV filter
- Frequency: 400, 500, 600, 800Hz (identical to Phase 1) through bandpass
- Duration: 0.25s (faster than Phase 1's 0.32s — sped up, abbreviated)
- Gain: 0.03 per note (Phase 1 is 0.2 — dramatically reduced)
- Envelope: Each note: instant attack, 0.05s decay (shorter than Phase 1's 0.15s)
- LFO: None
- Character: The familiar Phase 1 jingle but tiny, distant, rapid. Like hearing a pinball machine from the next room. Satisfying but not attention-grabbing — you're watching this happen on a screen.
- Relation to Phase 1: Direct CCTV version of abductionComplete. Same notes, 15% volume, faster tempo.

### zone-tankFire
- Trigger: Enemy tank fires at a crew UFO in a zone
- Priority: LOW
- Type: Square wave descending through CCTV filter
- Frequency: 500Hz to 150Hz over 0.06s (Phase 1 shellFire is 800-200, shifted down through filter)
- Duration: 0.06s
- Gain: 0.03
- Envelope: Instant attack, 60ms exponential decay
- LFO: None
- Character: Muffled "pew" through a monitor speaker. Recognizable as hostile fire but not startling.
- Relation to Phase 1: CCTV-filtered shellFire. Lower frequency range (bandpass effect), much quieter.

### zone-ufoHit
- Trigger: Crew UFO takes damage in a zone
- Priority: MEDIUM
- Type: Sawtooth impact through CCTV filter
- Frequency: 150Hz with pitch jump to 100Hz (Phase 1 ufoHit simplified)
- Duration: 0.1s
- Gain: 0.04
- Envelope: Instant attack, 100ms decay
- LFO: None
- Character: A concerning blip. Louder than other zone sounds because your crew is being hurt — the commander should notice.
- Relation to Phase 1: Simplified CCTV version of ufoHit (sawtooth 200-100-150Hz). Reduced to single pitch drop.

### zone-ufoDestroyed
- Trigger: Crew UFO is destroyed in a zone
- Priority: MEDIUM
- Type: Noise burst through CCTV filter + descending sine
- Frequency: Noise through bandpass at 500Hz; sine from 200Hz to 60Hz over 0.2s
- Duration: 0.3s
- Gain: Noise 0.05, sine 0.04
- Envelope: Noise: instant, 200ms decay; sine: 50ms attack, 200ms decay
- LFO: None
- Character: A crew member went down. More impactful than other zone sounds — the commander should feel this. The descending sine is a "falling" sensation.
- Relation to Phase 1: Simplified version of explosion() + a personal touch (the descending sine = "someone fell"). Phase 1's explosion is impersonal noise; this adds a melancholy pitch drop.

### zone-ufoRespawn
- Trigger: Replacement UFO spawns after crew loss
- Priority: LOW
- Type: Ascending triangle + tiny sine ping
- Frequency: Triangle from 110Hz to 220Hz over 0.15s; ping at 330Hz
- Duration: 0.2s
- Gain: Triangle 0.03, ping 0.02
- Envelope: Triangle: 20ms attack, 0.1s ascent, 50ms decay; ping: delayed 0.1s, instant, 50ms decay
- LFO: None
- Character: A relief blip. Reinforcement arrived. Small, positive, distant.
- Relation to Phase 1: Tiny version of Phase 1's revive (ascending sine sweep). Same intent, 10% of the drama.

### zone-driftWarning
- Trigger: Zone begins drifting (targets moving outside beam range)
- Priority: MEDIUM
- Type: Triangle oscillating + subtle noise undertone
- Frequency: Triangle alternating between 165Hz and 200Hz at 2Hz rate
- Duration: Loops while drift is active in selected zone
- Gain: 0.035
- Envelope: 300ms fade-in, sustain, 300ms fade-out
- LFO: 2Hz on frequency (alternating between two pitches)
- Character: An uneasy wobble. Something is wrong but not critical. Like a compass needle swinging — direction is uncertain. The alternating pitch creates mild anxiety without urgency.
- Relation to Phase 1: No Phase 1 equivalent (drift is a Phase 2 concept). The wobbling quality echoes Phase 1's moveLoop (pitch tied to velocity) but here it signals instability rather than movement.

### zone-stateStable
- Trigger: Zone transitions to STABLE state
- Priority: MEDIUM
- Type: Ascending triangle fifth
- Frequency: 165Hz to 220Hz (E3 to A3) — ascending gold-range interval
- Duration: 0.15s
- Gain: 0.04
- Envelope: 5ms attack, 0.1s sustain, 0.05s decay
- LFO: None
- Character: "Sector stable." Clean, brief, positive. A command-center confirmation tone.
- Relation to Phase 1: No equivalent — zone states are Phase 2 concept.

### zone-stateStressed
- Trigger: Zone transitions to STRESSED state
- Priority: MEDIUM
- Type: Square wave two-note (flat/ambiguous interval)
- Frequency: 200Hz then 210Hz (a very close, dissonant interval — nearly a semitone)
- Duration: 0.15s
- Gain: 0.05
- Envelope: Each note: 5ms attack, 0.06s, quick decay
- LFO: None
- Character: "Attention needed." The near-semitone interval creates mild unease — not alarm, but "this isn't right." Square wave adds an edge that triangle lacks.
- Relation to Phase 1: Similar to Phase 1's distressBeep (two-tone square 600/400Hz) but lower, subtler, and with a more dissonant interval.

### zone-stateCrisis
- Trigger: Zone transitions to CRISIS state
- Priority: HIGH
- Type: Square wave three-pulse alarm + sub-bass undertone
- Frequency: Three square pulses at 300Hz at 6Hz rate; sub-bass sine at 60Hz
- Duration: 0.5s
- Gain: Square pulses 0.07, sub-bass 0.05
- Envelope: Each pulse: instant attack, 0.04s, 0.04s gap; sub-bass: 50ms attack, 0.5s decay
- LFO: None (manual pulse pattern)
- Character: "Crisis in sector." Three rapid pulses = universal urgency signal. The sub-bass adds physical weight — you feel this in your chest. Demands attention but not panic.
- Relation to Phase 1: Phase 1 has no graduated urgency. This escalation system (stable -> stressed -> crisis -> emergency) is unique to the command perspective.

### zone-stateEmergency
- Trigger: Zone transitions to EMERGENCY state (about to lose zone)
- Priority: HIGH
- Type: Square alarm oscillating + noise static + sub-bass pressure
- Frequency: Square alternating 250Hz/400Hz at 8Hz; noise through lowpass at 600Hz; sub-bass at 45Hz
- Duration: Loops while zone is in EMERGENCY
- Gain: Square 0.08, noise 0.03, sub-bass 0.06
- Envelope: Continuous with 100ms fade-in; square amplitude modulated at 8Hz
- LFO: 8Hz on square gain (0.04-0.08 range) — pulsing alarm quality
- Character: "WE ARE LOSING THIS ZONE." The most alarming sound in standard command gameplay (override sounds are louder but different). The alternating pitch alarm is attention-demanding. The noise static suggests the zone's monitoring feed is degrading. Sub-bass creates visceral tension.
- Relation to Phase 1: Phase 1's energyLow (single 200Hz square blip) is the closest but nowhere near this intense. Emergency sound layers multiple signals to convey "everything is going wrong."

---

## CATEGORY 6: OVERRIDE MODE (5 sounds)

Override is the dramatic shift from commander to pilot. The entire audio landscape changes — ambient sounds duck, new tension layers emerge, and the player is suddenly "in the cockpit" again.

### override-zoomIn
- Trigger: Camera zooms into the overridden zone
- Priority: HIGH
- Type: Ascending sine sweep + filtered noise whoosh
- Frequency: Sine from 110Hz to 440Hz over 0.3s; noise through highpass rising from 200Hz to 2000Hz
- Duration: 0.3s
- Gain: Sine 0.06, noise 0.04
- Envelope: Both: 10ms attack, continuous, 50ms tail
- LFO: None
- Character: "Diving in." You're going from the command center overview INTO a specific zone. The ascending sweep mirrors the visual zoom. The highpass noise opening creates a "narrowing focus" sensation.
- Relation to Phase 1: Similar to Phase 1's warpJuke (sine 200-2000Hz ascending) but more controlled, less "teleport" and more "focused engagement."

### override-zoomOut
- Trigger: Camera returns to command overview after override ends
- Priority: HIGH
- Type: Descending sine sweep + filtered noise settling
- Frequency: Sine from 440Hz to 110Hz over 0.3s; noise through lowpass from 2000Hz to 400Hz
- Duration: 0.4s
- Gain: Sine 0.05, noise 0.03
- Envelope: Both: instant from override level, descending, 100ms decay at bottom
- LFO: None
- Character: "Pulling back to command." Inverse of zoomIn. The descending sweep and closing filter = "widening perspective." You're back in the chair.
- Relation to Phase 1: Inverse of override-zoomIn. Follows Phase 1's ascending=positive, descending=returning convention.

### override-activeHum
- Trigger: Override mode is active (sustained loop)
- Priority: HIGH (loop)
- Type: Sawtooth drone through lowpass + subtle sub-bass pulse
- Frequency: Sawtooth at 82Hz (low E) through lowpass at 400Hz; sub-bass sine at 41Hz
- Duration: Loop — entire override duration
- Gain: Sawtooth 0.04, sub-bass 0.03
- Envelope: 500ms fade-in, sustain, 500ms fade-out on override end
- LFO: 0.5Hz pulse on sub-bass gain (depth 0.015) — slow heartbeat quality; 3Hz on sawtooth through lowpass (creates slow filter sweep)
- Character: "You have direct control." A low, insistent drone that says "you are personally responsible right now." The slow sub-bass pulse is like a heartbeat — you're IN this. The filter sweep on the sawtooth creates a slowly breathing quality.
- Relation to Phase 1: Echoes Phase 1's beamLoop (sawtooth 150Hz warble) but lower, slower, more pressured. Phase 1's beam loop is "doing a thing." Override hum is "being responsible."

### override-timerWarning
- Trigger: Override timer enters final 5 seconds
- Priority: HIGH
- Type: Escalating square pulses layered over override-activeHum
- Frequency: 220Hz square, pulsing at escalating rate (2Hz at 5s, 4Hz at 3s, 8Hz at 1s)
- Duration: 5s (escalating throughout)
- Gain: Starting at 0.04, increasing to 0.08 at 1 second remaining
- Envelope: Each pulse: instant, 0.03s, instant off; gain envelope increases linearly
- LFO: Rate controlled by remaining time, not LFO
- Character: "Time is running out." Builds tension relentlessly. The escalating rate mirrors Phase 1's dronePreExplode (accelerating beeps) — the player knows this pattern from Phase 1 and will feel the urgency instinctively.
- Relation to Phase 1: Direct callback to dronePreExplode (square wave 800-1600Hz, 5 accelerating beeps). Lower frequency (220Hz vs 800Hz+) but same escalation pattern. Players will unconsciously recognize "time is running out."

### override-forceEnd
- Trigger: Override ends because timer expired (involuntary)
- Priority: HIGH
- Type: Descending sawtooth sweep + harsh square buzz + noise burst
- Frequency: Sawtooth from 330Hz to 55Hz over 0.3s; square buzz at 100Hz for 0.1s; noise burst
- Duration: 0.4s
- Gain: Sawtooth 0.08, square 0.06, noise 0.04
- Envelope: All: sharp attack, rapid decay
- LFO: None
- Character: "Control ripped away." Harsher than normal overrideEnd. The sawtooth dropping sharply, the buzz, and the noise burst all say "you ran out of time." Not punishing but unmistakable — different from voluntary end (ui-overrideEnd is gentler).
- Relation to Phase 1: Similar to targetDropped (sine 400-100Hz, 0.25s) in emotional content — "you lost something." But more aggressive and complex.

---

## CATEGORY 7: DIRECTOR SYSTEM (6 sounds)

The Director is Phase 2's antagonist/overseer. Every Director sound must be COLD — sub-bass pressure, harsh high harmonics, no warmth. Director sounds use the red (#a00) palette exclusively.

### dir-moodChange
- Trigger: Director's mood shifts (recalculated based on player performance)
- Priority: MEDIUM
- Type: Sub-bass sine glide + cold high harmonic
- Frequency: Sub-bass glides from 55Hz to 45Hz (mood worsening) or 45Hz to 55Hz (mood improving) over 0.5s; harmonic at 1000Hz, brief
- Duration: 0.6s
- Gain: Sub-bass 0.05, harmonic 0.02
- Envelope: Sub-bass: 100ms attack, 0.3s sustain, 200ms decay; harmonic: 50ms flash at 0.2s mark
- LFO: None
- Character: Subtle but felt. The sub-bass shift is almost subliminal — you don't consciously hear it but your body responds. The brief harmonic flash is a "the Director noticed something" ping. Ascending = relaxing threat, descending = increasing threat.
- Relation to Phase 1: No equivalent. Phase 1 has no persistent threat assessment. Maintains ascending=positive, descending=negative convention.

### dir-approvalUp
- Trigger: Director approval increases (player doing well)
- Priority: MEDIUM
- Type: Sub-bass resolve upward + brief filtered sawtooth swell
- Frequency: Sub-bass sine from 50Hz to 60Hz; sawtooth at 110Hz through lowpass at 600Hz, brief
- Duration: 0.3s
- Gain: Sub-bass 0.04, sawtooth 0.03
- Envelope: Both: 50ms attack, 0.15s sustain, 100ms decay
- LFO: None
- Character: Subtle relief. The sub-bass ascending relieves a tiny bit of pressure. The sawtooth swell is the faintest hint of the Authority Fifth (110Hz = A2). "The Director is less displeased." Note: never WARM. Even approval from the Director feels cold.
- Relation to Phase 1: No equivalent. The closest emotional parallel is Phase 1's bonusEarned (two quick pips), but Director approval is deeper and less cheerful.

### dir-approvalDown
- Trigger: Director approval decreases (player doing poorly)
- Priority: MEDIUM
- Type: Sub-bass drop + dissonant square flash
- Frequency: Sub-bass sine from 55Hz to 40Hz; square at 800Hz through bandpass (900Hz, Q=6) — harsh, narrow
- Duration: 0.3s
- Gain: Sub-bass 0.05, square 0.04
- Envelope: Sub-bass: 20ms attack, 0.2s glide, 100ms at bottom; square: 10ms flash at 0.1s mark (20ms total)
- LFO: None
- Character: A cold warning. The sub-bass dropping is physical pressure increasing. The harsh square flash is a stab of disapproval — brief but cutting. "The Director is watching, and you're failing."
- Relation to Phase 1: No equivalent. The emotional content is unique to Phase 2's authority dynamic.

### dir-disapproval
- Trigger: Director explicitly expresses disapproval (during transmission)
- Priority: HIGH
- Type: Sub-bass pressure + dissonant chord (minor second) + noise static
- Frequency: Sub-bass at 40Hz; dissonant chord: square at 800Hz + square at 850Hz (beating at 50Hz = ugly); noise through bandpass at 1000Hz
- Duration: 0.6s
- Gain: Sub-bass 0.07, squares 0.03 each, noise 0.02
- Envelope: Sub-bass: 50ms attack, 0.4s sustain, 200ms decay; squares: 100ms delayed, 0.2s; noise: 50ms, 0.3s sustain, 200ms decay
- LFO: 2Hz tremolo on sub-bass (depth 0.02) — threatening pulse
- Character: "You have displeased the Director." The minor second beating (50Hz amplitude modulation) is inherently unpleasant — that's the point. The sub-bass pulsing creates a "something bad is coming" feeling. The noise is the Director's cold presence. This should make the player uncomfortable.
- Relation to Phase 1: Phase 1 has no equivalent — no authority figure, no disapproval. This is unique to the power dynamic of Phase 2.

### dir-vulnerability
- Trigger: Director enters vulnerable state (rare gameplay event)
- Priority: HIGH
- Type: Sub-bass wobble + unstable high harmonics + breaking noise
- Frequency: Sub-bass at 50Hz with 1Hz wobble (depth 10Hz); harmonics at 900Hz and 1100Hz with random frequency jitter (+-30Hz per frame); noise through highpass at 1500Hz
- Duration: Loops while Director is vulnerable
- Gain: Sub-bass 0.06, harmonics 0.02 each, noise 0.015
- Envelope: 500ms fade-in, sustain with instability, fade-out on recovery
- LFO: 1Hz on sub-bass frequency (depth 10Hz) — the Director's steady pressure is destabilized
- Character: Something is wrong with the Director. The usually rock-steady sub-bass is WOBBLING — the foundation of authority is shaking. The jittery harmonics are the Director's "signal" breaking up. The noise is static in their feed. This should feel deeply unsettling — the scary thing isn't that the Director is angry, it's that the Director is WEAK.
- Relation to Phase 1: Inverts Phase 1's commanderGlitch idea — instead of the Commander's feed breaking up (Phase A cinematic), it's the Director's authority destabilizing.

### dir-recovery
- Trigger: Director recovers from vulnerable state
- Priority: HIGH
- Type: Sub-bass re-stabilizing + cold chord restoration
- Frequency: Sub-bass settles from wobbling 50Hz(+-10Hz) to steady 55Hz; chord: square 800Hz + 1000Hz (cold fourth, not warm fifth)
- Duration: 0.8s
- Gain: Sub-bass 0.07, chord 0.03 each
- Envelope: Sub-bass: LFO depth decreases from 10Hz to 0 over 0.5s (stabilizing); chord: 200ms delayed, 100ms attack, 0.3s sustain, 200ms decay
- LFO: Decreasing from 1Hz/10Hz depth to 0Hz/0Hz — the wobble stops, authority returns
- Character: "The Director is back." The sub-bass snapping back to steady is the power stabilizing. The cold chord is NOT a resolution in the comforting sense — it's the Director's cold authority reasserting itself. "You're still being watched."
- Relation to Phase 1: No equivalent. The concept of "authority restored" is purely Phase 2.

---

## CATEGORY 8: RESOURCES (3 sounds)

Resource management sounds should feel like data transfers — clean, digital, functional. Gold-frequency palette.

### res-transferStart
- Trigger: Player initiates resource transfer between zones
- Priority: MEDIUM
- Type: Sine ping + ascending digital blip sequence
- Frequency: Ping at 330Hz; blips ascending 220Hz, 277Hz, 330Hz at 0.05s intervals
- Duration: 0.2s
- Gain: Ping 0.04, blips 0.03 each
- Envelope: Ping: instant, 0.08s decay; blips: 10ms each with 5ms gap
- LFO: None
- Character: "Transfer initiated." The ping confirms the action, the ascending blips are "data packets leaving." Quick, functional, satisfying.
- Relation to Phase 1: Similar to Phase 1's droneDeliver (two ascending blips) but with a three-note ascending pattern.

### res-inFlight
- Trigger: Resources are in transit between zones (sustained)
- Priority: LOW
- Type: Very soft sine oscillation
- Frequency: 277Hz oscillating +-10Hz at 2Hz rate
- Duration: Loops while resource is in transit (typically 2-3 seconds)
- Gain: 0.015
- Envelope: 200ms fade-in, sustain, 200ms fade-out
- LFO: 2Hz on frequency (depth 10Hz) — gentle wobble = "something moving"
- Character: Barely audible. A subtle hum that tells you "resources are moving" without demanding any attention. Like hearing a pneumatic tube system in the background.
- Relation to Phase 1: Loosely echoes Phase 1's moveLoop (sine 80-150Hz with LFO) but much higher, quieter, and representing data movement rather than physical flight.

### res-delivered
- Trigger: Resources arrive at destination zone
- Priority: MEDIUM
- Type: Descending sine + confirmation triangle ping
- Frequency: Sine from 330Hz to 220Hz (landing); triangle ping at 440Hz
- Duration: 0.15s
- Gain: Sine 0.03, ping 0.04
- Envelope: Sine: instant, 0.1s descending, 0.05s decay; ping: delayed 0.08s, instant, 0.07s decay
- LFO: None
- Character: "Delivered." The descending sine is "arrival" (something landing), the ping is "confirmation." The descending motion might seem negative (descending=bad) but in this context it's "coming down to destination" — like a delivery landing.
- Relation to Phase 1: Similar to Phase 1's droneOrbReceive (ascending glitch triplet) in purpose but opposite in direction — resources "arrive" rather than "are grabbed."

---

## CATEGORY 9: WAVE SUMMARY (12 sounds)

Summary sounds run during the post-wave report card screen. They should create a "debrief" atmosphere — professional, measured, with dramatic reveals.

### summary-screenOpen
- Trigger: Summary/debrief screen appears
- Priority: HIGH
- Type: Sawtooth chord (Authority Fifth) through lowpass + panel slide servo
- Frequency: Sawtooths at 110Hz and 165Hz, lowpass at 800Hz; servo sine from 200Hz to 300Hz over 0.2s
- Duration: 0.4s
- Gain: Sawtooths 0.04 each, servo 0.03
- Envelope: Sawtooths: 50ms attack, 0.2s sustain, 150ms decay; servo: follows panel animation
- LFO: None
- Character: "Debrief beginning." The Authority Fifth establishes context — this is official business. The servo is the summary panel physically appearing. Professional, weighty.
- Relation to Phase 1: Phase 1's summary screens use sectionReveal (soft sine whoosh). This is heavier, more official.

### summary-reportCard
- Trigger: Overall grade/report card reveals
- Priority: HIGH
- Type: Depends on grade — authority chord for good, muted chord for mediocre, dissonant chord for poor
- Frequency: Good: A2-E3-A3 (110-165-220Hz Authority chord full); Mediocre: A2-D3 (110-147Hz, fourth — neutral); Poor: A2-Bb2 (110-117Hz, minor second — tense)
- Duration: 0.8s
- Gain: 0.05 per note (good), 0.04 (mediocre), 0.06 (poor — tension is louder)
- Envelope: 30ms attack, 0.5s sustain, 0.3s decay
- LFO: 1Hz tremolo on poor variant (depth 0.02) — unsteady quality for bad grades
- Character: The verdict. The chord quality tells you your grade before you read it. Authority Fifth = "well done, commander." Fourth = "adequate." Minor second = "the Director is not pleased." Each uses the 110Hz A2 root for continuity.
- Relation to Phase 1: Phase 1's summaryComplete is always positive (ascending C major). Phase 2's verdict chord VARIES based on performance — a new concept.

### summary-barReveal
- Trigger: Each metric bar animates/reveals in the summary
- Priority: LOW
- Type: Sine sweep matching bar fill
- Frequency: Sine from 165Hz to final frequency proportional to bar fill (0% = stays at 165Hz, 100% = reaches 440Hz)
- Duration: Matches bar animation duration (typically 0.5-1.0s)
- Gain: 0.025
- Envelope: Linear ramp matching bar animation, then 100ms decay
- LFO: None
- Character: Each bar "sings" its result. Higher fill = higher final pitch. The player can hear their results — a full bar rises to a satisfying pitch, an empty bar barely moves. Subtle but creates a data sonification effect.
- Relation to Phase 1: Phase 1's countTick (square 600Hz blip) sounds during count-ups. This is more musical and continuous — a sweep instead of ticks.

### summary-zoneResult
- Trigger: Individual zone result appears
- Priority: LOW
- Type: Triangle blip
- Frequency: 220Hz for stable zones, 277Hz for exceeded zones, 165Hz for failed zones
- Duration: 0.06s
- Gain: 0.03
- Envelope: Instant attack, 60ms decay
- LFO: None
- Character: Quick status blip per zone. Pitch indicates quality — higher = better. Keeps the debrief moving without being attention-demanding.
- Relation to Phase 1: Similar to Phase 1's countTick but at Phase 2 register and using pitch to encode quality.

### summary-bonusReveal
- Trigger: Bonus achievements or special commendations appear
- Priority: MEDIUM
- Type: Ascending Authority Fifth + high sine sparkle
- Frequency: Sawtooths 110Hz to 165Hz, sine sparkle at 660Hz
- Duration: 0.3s
- Gain: Sawtooths 0.04, sparkle 0.03
- Envelope: Sawtooths: 20ms attack, 0.15s sustain, 0.1s decay; sparkle: delayed 0.1s, instant, 0.15s decay
- LFO: None
- Character: "Commendation." The Authority Fifth says "officially recognized." The sparkle adds a rare moment of brightness in Phase 2's dark palette. Earned, not given.
- Relation to Phase 1: Echoes Phase 1's bonusEarned (two quick square pips) but deeper and more ceremonial.

### summary-penaltyReveal
- Trigger: Penalties or Director deductions appear
- Priority: MEDIUM
- Type: Descending square fifth + sub-bass pulse
- Frequency: Square at 220Hz to 165Hz (descending); sub-bass 55Hz flash
- Duration: 0.2s
- Gain: Square 0.05, sub-bass 0.06
- Envelope: Square: instant, 0.15s descending, 0.05s decay; sub-bass: 10ms, 0.1s, 0.1s
- LFO: None
- Character: "Penalty." The inverted Authority Fifth (descending = negative). The sub-bass pulse is a gut-punch. Brief and pointed — the Director takes, quickly and without mercy.
- Relation to Phase 1: Phase 1's bonusMissed (single soft square blip) is passive. This is active punishment — sounds imposed ON the player.

### summary-directorComment
- Trigger: Director's summary commentary appears
- Priority: HIGH
- Type: Sub-bass presence + typewriter ticks (reuse promo-directorTypewriter)
- Frequency: Sub-bass at 50Hz; typewriter 100-160Hz per character
- Duration: Follows text length
- Gain: Sub-bass 0.04, typewriter 0.03 per tick
- Envelope: Sub-bass: 200ms fade-in, sustain, 200ms fade-out; typewriter: per-character instant
- LFO: 0.3Hz on sub-bass gain (depth 0.01) — Director's breathing presence
- Character: The Director passes judgment. Same typewriter as the promotion but the context is different — this time, you KNOW this entity's opinion matters. The sub-bass presence says "I'm watching, I'm evaluating."
- Relation to Phase 1: Phase 1's Commander commentary uses commanderSpeechGarble. Director typewriter is lower, deliberate, each character weighted.

### summary-optionHighlight
- Trigger: Player navigates between summary options (Continue, Retry, etc.)
- Priority: LOW
- Type: Sine blip (reuse ui-menuNav)
- Frequency: 277Hz
- Duration: 0.03s
- Gain: 0.025
- Envelope: Instant, 30ms decay
- LFO: None
- Character: Same as ui-menuNav. Consistent navigation sound.
- Relation to Phase 1: Consistent with Phase 2 UI palette.

### summary-optionSelect
- Trigger: Player selects a summary option (presses Enter/Space on an option)
- Priority: MEDIUM
- Type: Two-note ascending confirmation (reuse ui-fleetOrder style)
- Frequency: 165Hz then 220Hz
- Duration: 0.15s
- Gain: 0.04
- Envelope: Each note: 5ms attack, 0.06s, 10ms decay
- LFO: None
- Character: "Confirmed." Same language as fleet orders — a decision has been made. Consistent with Phase 2 UI palette.
- Relation to Phase 1: Deeper version of the "selection confirmed" pattern.

### summary-gradeS
- Trigger: S-rank or perfect score achieved on summary
- Priority: HIGH
- Type: Full Authority chord ascending (A2-E3-A3-E4) + crystalline harmonics + sub-bass swell
- Frequency: Sawtooths ascending through 110-165-220-330Hz in sequence; crystalline sines at 880Hz and 1320Hz; sub triangle at 55Hz
- Duration: 1.5s
- Gain: Sawtooths 0.05 each, crystalline 0.03 each, sub 0.07
- Envelope: Sequential attack on sawtooths (0.15s intervals), crystalline delayed 0.4s, sub: 50ms attack, 1.0s sustain, 0.4s decay
- LFO: 1Hz tremolo on sawtooths (depth 0.01)
- Character: The ONLY moment in Phase 2 that approaches Phase 1's joyful energy. The full Authority chord ascending is the "brass fanfare" of Phase 2. The crystalline harmonics add rare brightness. Sub-bass gives physical weight. This is the game saying "The Director is genuinely impressed." Rare and earned.
- Relation to Phase 1: Phase 2's answer to waveComplete/researchComplete. Uses Authority chord instead of C major, sawtooth instead of sine, but the ascending-chord-to-sparkle structure is the same emotional template.

### summary-directorResponse
- Trigger: Director reacts to player's summary choices
- Priority: MEDIUM
- Type: Sub-bass shift (positive or negative) matching dir-approvalUp/Down
- Frequency: Same as dir-approvalUp (ascending) or dir-approvalDown (descending)
- Duration: 0.3s
- Gain: Same as respective Director sounds
- Envelope: Same as respective Director sounds
- LFO: None
- Character: "The Director has noted your choice." Reuses the existing approval sounds — consistent language.
- Relation to Phase 1: No equivalent.

### summary-complete
- Trigger: Summary screen closes, returning to boot/next wave
- Priority: MEDIUM
- Type: Descending Authority Fifth resolution + soft noise whoosh
- Frequency: Sawtooths from 165Hz to 110Hz; noise through lowpass from 800Hz to 200Hz
- Duration: 0.5s
- Gain: Sawtooths 0.04, noise 0.02
- Envelope: Sawtooths: instant, 0.3s descend, 0.2s decay; noise: 50ms attack, 0.3s sustain, 0.2s decay
- LFO: None
- Character: "Debrief complete." The descending fifth closes the chapter. The noise whoosh is the summary display folding away. Not climactic — transitional. Moving on to the next wave.
- Relation to Phase 1: Phase 1's summaryComplete is a bright ascending C major fanfare. Phase 2's is a settling descent — the debrief is over, back to work.

---

## CATEGORY 10: CREW (2 sounds)

Crew sounds are subtle but emotionally meaningful — these represent your people.

### crew-moraleTierChange
- Trigger: A crew member's morale changes tiers (e.g., from Normal to Low, or from Low to High)
- Priority: MEDIUM
- Type: Triangle two-note interval (direction indicates improvement or decline)
- Frequency: Improvement: 220Hz to 277Hz (ascending major third); decline: 277Hz to 220Hz (descending)
- Duration: 0.15s
- Gain: 0.035
- Envelope: Each note: 5ms attack, 0.06s, 10ms decay
- LFO: None
- Character: Subtle crew status ping. Ascending = someone's feeling better. Descending = someone's struggling. Uses triangle (warm oscillator) because crew are PEOPLE, not systems. The warmth distinguishes crew sounds from the cold system/Director sounds.
- Relation to Phase 1: No Phase 1 equivalent (no crew system). Triangle warmth echoes Phase 1's overall friendly character — crew members carry a little of Phase 1's humanity.

### crew-burnout
- Trigger: A crew member reaches burnout state
- Priority: HIGH
- Type: Descending triangle wail + noise crackle
- Frequency: Triangle from 330Hz to 165Hz over 0.4s; noise through bandpass at 400Hz, Q=2
- Duration: 0.5s
- Gain: Triangle 0.05, noise 0.02
- Envelope: Triangle: 20ms attack, continuous descent, 100ms decay; noise: follows triangle, fades
- LFO: 3Hz vibrato on triangle (depth 8Hz) — wobbling, unstable quality
- Character: Someone broke. The descending, wobbling triangle is a "person falling" — not a system failing. The vibrato adds emotional instability. Warmer than system sounds (triangle not square) because this is about a person, not a machine.
- Relation to Phase 1: Echoes Phase 1's targetDropped (sine 400-100Hz descending) but with vibrato adding emotional weight. Both say "something was lost," but burnout is about a PERSON.

---

## CATEGORY 11: AMBIENT LAYERS (5 sounds)

These create the sonic landscape of the command center. They run continuously, layered, at very low volumes. Together they establish "you are in a command center watching operations."

### ambient-commandHum
- Trigger: Always active during command phase
- Priority: LOW (loop)
- Type: Triangle drone + very subtle detuned sawtooth undertone
- Frequency: Triangle at 55Hz (sub-bass A1); sawtooth at 57Hz (2Hz detuning = slow 2Hz beat)
- Duration: Continuous loop
- Gain: Triangle 0.025, sawtooth 0.012
- Envelope: 2.0s fade-in on phase start, sustained, 2.0s fade-out on phase end
- LFO: 0.1Hz on triangle gain (depth 0.005) — very slow "room breathing"
- Character: The command center's heartbeat. You shouldn't consciously hear this — but you'd notice if it stopped. The 2Hz beating from the detuned pair creates a slow "pulse" that subliminally sets the Phase 2 mood. Like the hum of a submarine or the background of the Enterprise bridge.
- Relation to Phase 1: Phase 1 has no ambient drone — it's pure silence between action sounds. This persistent hum immediately tells you "you're not in the cockpit anymore."

### ambient-zoneActivity
- Trigger: Active during LIVE command state, volume scales with total zone activity
- Priority: LOW (loop)
- Type: Filtered noise (band-limited)
- Frequency: Noise through bandpass at 500Hz, Q=0.5 (wide, soft)
- Duration: Continuous loop
- Gain: 0.005 base, scaling up to 0.015 with combined zone activity level
- Envelope: Gain smoothly tracks aggregate zone activity (200ms smoothing)
- LFO: None — activity-driven gain changes provide organic variation
- Character: The "life" of the monitored zones. When zones are busy (lots of abductions, combat), this noise floor rises slightly. When things are quiet, it's nearly silent. Creates a subliminal awareness of "stuff is happening out there." Like the background chatter of multiple radio feeds mixed to noise.
- Relation to Phase 1: No equivalent. Phase 1's sounds are all direct and event-driven. This ambient data layer is unique to the monitoring perspective.

### ambient-driftStatic
- Trigger: Any zone has active drift (targets moving unpredictably)
- Priority: LOW (loop)
- Type: Filtered noise with slow modulation
- Frequency: Noise through bandpass at 800Hz, Q=1; filter center slowly wobbles 600-1000Hz
- Duration: Loops while drift is active in any zone
- Gain: 0.008 per drifting zone (stacks), max 0.025
- Envelope: 500ms fade per zone entering/leaving drift
- LFO: 0.3Hz on bandpass center frequency (depth 200Hz) — wandering quality
- Character: Instability in the system. Like cosmic background radiation increasing — something is making the signals drift. The wandering filter creates an unsettled quality. Additive per zone — more drift = more noise.
- Relation to Phase 1: No Phase 1 equivalent. Drift is a Phase 2 concept. The wandering filter echoes Phase 1's LFO patterns but applied to ambient noise instead of oscillator pitch.

### ambient-overrideTension
- Trigger: Override mode is available but not activated, AND at least one zone is in crisis/emergency
- Priority: LOW (loop)
- Type: Sub-bass sine pulse (very slow)
- Frequency: 35Hz
- Duration: Loops while conditions met
- Gain: 0.02
- Envelope: 1.0s fade-in, sustained, 1.0s fade-out
- LFO: 0.25Hz on gain (0.005-0.02 range) — very slow pulse, like a distant alarm
- Character: "You could do something." A subliminal pressure that exists when override is available and things are going wrong. The player may not consciously process it, but they'll feel the urge to take action. It's the command center's way of saying "direct intervention is an option."
- Relation to Phase 1: No equivalent. This is purely about Phase 2's unique tension between watching and acting.

### ambient-directorPresence
- Trigger: Director's attention level is elevated (watching closely)
- Priority: LOW (loop)
- Type: Sub-bass sine + very faint high square harmonic
- Frequency: Sub-bass at 40Hz; square harmonic at 1000Hz through bandpass (1000Hz, Q=8, very narrow)
- Duration: Loops while Director attention is elevated
- Gain: Sub-bass 0.015, harmonic 0.005
- Envelope: 1.5s fade-in, sustained, 1.5s fade-out
- LFO: 0.15Hz on sub-bass gain (depth 0.005) — almost imperceptible breathing
- Character: "The Director is watching." You can't quite explain why you feel uneasy, but something has shifted. The sub-bass is below conscious hearing for most people but creates physical tension. The barely-audible high harmonic is like someone standing behind you — you sense it more than hear it. Cold, red-palette.
- Relation to Phase 1: No Phase 1 equivalent. Phase 1 has no persistent authority presence. This is the audio version of "someone is looking over your shoulder."

---

## IMPLEMENTATION PRIORITY

### MUST-HAVE (42 sounds — implement first)

**Promotion Cinematic (10):**
promo-incomingTransmission, promo-commanderGlitch, promo-commanderDissolve, promo-directorMaterialize, promo-titleReveal, promo-whiteFlash, promo-wireframeReveal, promo-commandActivated, promo-directorFinalLine, promo-directorPanelSlide

**Boot (3):**
boot-panelStart, boot-panelOnline, boot-allSystemsGo

**Command State (4):**
cmd-waveStart, cmd-directorTransmit, cmd-waveEnd, cmd-quotaMet

**Input/UI (5):**
ui-zoneSelect, ui-fleetOrder, ui-overrideActivate, ui-overrideEnd, ui-errorReject

**Zone State Changes (4):**
zone-stateStable, zone-stateStressed, zone-stateCrisis, zone-stateEmergency

**Override (5):**
override-zoomIn, override-zoomOut, override-activeHum, override-timerWarning, override-forceEnd

**Director (4):**
dir-moodChange, dir-approvalDown, dir-disapproval, dir-vulnerability

**Summary (4):**
summary-screenOpen, summary-reportCard, summary-complete, summary-gradeS

**Ambient (3):**
ambient-commandHum, ambient-zoneActivity, ambient-directorPresence

### SHOULD-HAVE (27 sounds — implement second)

**Promotion Cinematic (4):**
promo-directorTypewriter, promo-cameraZoomOut, promo-hudDeath, promo-zone2Materialize

**Command State (2):**
cmd-waveTimerWarning, cmd-quotaExceeded

**Input/UI (2):**
ui-resourceRoute, ui-menuNav

**Zone Simulation (8):**
zone-targetSpawn, zone-beamActive, zone-abductionComplete, zone-tankFire, zone-ufoHit, zone-ufoDestroyed, zone-ufoRespawn, zone-driftWarning

**Director (2):**
dir-approvalUp, dir-recovery

**Resources (3):**
res-transferStart, res-inFlight, res-delivered

**Summary (4):**
summary-barReveal, summary-zoneResult, summary-bonusReveal, summary-penaltyReveal

**Crew (2):**
crew-moraleTierChange, crew-burnout

### NICE-TO-HAVE (remaining)

summary-directorComment, summary-directorResponse, summary-optionHighlight, summary-optionSelect, ambient-driftStatic, ambient-overrideTension, promo-bootPanelStart (reuses boot-panelStart), promo-bootPanelOnline (reuses boot-panelOnline)

---

## MIXING GUIDELINES

### Volume Hierarchy (loudest to quietest)
1. **Promotion cinematic sounds**: 0.08-0.20 (one-time event, maximum impact)
2. **Override activation/deactivation**: 0.06-0.10 (dramatic state change)
3. **Director transmissions**: 0.05-0.08 (authority demands attention)
4. **Zone state emergencies**: 0.06-0.08 (urgent alerts)
5. **Command state transitions**: 0.04-0.06 (structural beats)
6. **UI interactions**: 0.03-0.05 (responsive feedback)
7. **Zone CCTV sounds**: 0.02-0.05 (monitored, not direct)
8. **Summary reveals**: 0.025-0.05 (debrief atmosphere)
9. **Resource transfers**: 0.015-0.04 (background logistics)
10. **Ambient layers**: 0.005-0.025 (subliminal foundation)

### Ducking Rules
- Director transmission: master gain ducks to 40% over 300ms, restores over 500ms
- Override activation: ambient bus ducks to 50% for 200ms (dramatic moment)
- Emergency state: no ducking (should be heard over everything except Director)
- Summary screen: ambient bus fades to 30% during summary (debrief is quiet)

### Polyphony Budget
Given max 8 SFX + 4 UI + ~6 ambient simultaneous:
- Normal command: 1-2 ambient + 0-2 zone CCTV + 0-1 UI = 3-5 voices
- Crisis moment: 2-3 ambient + 2-3 zone alerts + 1 UI = 5-7 voices
- Override active: 1 override hum + 1-2 CCTV + 0-1 UI = 2-4 voices
- Promotion cinematic: 2-4 layered cinematic sounds = 2-4 voices (ambient off)
- Peak scenario: emergency alarm + Director transmission + override = 6-8 voices

The polyphony pool system (evict LOW, then oldest) ensures graceful degradation. With these gain levels, even 8 simultaneous sounds won't clip.
