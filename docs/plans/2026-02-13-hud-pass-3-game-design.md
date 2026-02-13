# HUD Design Pass 3 - Game Design & Sound Design Specification

**Date**: 2026-02-13
**Role**: Game Designer / Sound Designer (ARIA)
**Target**: `/Users/mfelix/code/alien-abductorama/js/game.js`

---

## 1. PLAYER EXPERIENCE TIMELINE: THE FIRST MINUTE OF WAVE 2+

### 1.1 End-to-End Flow

The player has just finished Wave 1. They saw the wave summary, spent time in the shop (up to 60s, or clicked Launch Early), and now the wave transition begins. Here is the exact sequence from the moment the shop closes:

```
PHASE               DURATION   RUNNING TOTAL    EMOTIONAL STATE
----------------------------------------------------------------------
Wave Transition      3.0s      0.0 - 3.0s       TENSION / ANTICIPATION
  (Pre-Boot BIOS)
HUD Boot (Quantum    2.5s      3.0 - 5.5s       SATISFACTION / READINESS
  OS: CRT, Logo,
  Trace, Panels)
Wave 2 Gameplay      ...       5.5s+            ACTION
```

**Current state**: The wave transition is a plain "WAVE 2 / Starting in 3...2...1..." screen with pulsing cyan text. It works but is a missed opportunity. The HUD boot that follows it (CRT turn-on, Quantum OS logo, border trace, panel boots) is already rich and EVA-inspired.

**The redesign**: Replace the boring countdown with a **Pre-Boot BIOS Sequence** that looks and sounds like an alien military computer cold-starting. This flows seamlessly INTO the existing Quantum OS boot, creating one continuous 5.5-second sequence that transforms a loading pause into atmospheric worldbuilding.

### 1.2 Emotional Arc Diagram

```
INTENSITY
  5 |                                                    * LAUNCH
  4 |                                              * * *
  3 |                            * * * * * * * *
  2 |        * * * * * * * * *
  1 | * * *
  0 +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+------> TIME
    0.0  0.4  0.8  1.2  1.6  2.0  2.4  2.8  3.0
    |____|____|____|____|____|____|____|____|
     POST  SYS   SWARM  UPLINK CHECK  COUNT  |
     BEEP  ROOT  LOAD   DL     SYS    DOWN   |
                                              |
    <--------- PRE-BOOT BIOS (3.0s) -------->|
                                              |
                                     Quantum OS Boot begins
```

### 1.3 The Handoff: Pre-Boot to Quantum OS

The pre-boot BIOS uses SQUARE WAVES, NOISE, SAWTOOTH -- dirty, mechanical, industrial sounds.
The Quantum OS boot uses SINE WAVES, TRIADS, FILTERS -- smooth, crystalline, ethereal sounds.

This contrast is the design. The BIOS is the hardware waking up. The Quantum OS is the software taking control. The player subconsciously feels the transition from raw machine to intelligent system. The handoff moment: the LAUNCH burst at t=3.0s creates 100ms of silence, then the CRT turn-on effect and startup chime begin -- suddenly everything is smooth and alien instead of harsh and mechanical.

---

## 2. F4/F5: PRE-BOOT BIOS SEQUENCE - COMPLETE DESIGN

### 2.1 Overview

The pre-boot BIOS replaces `renderWaveTransition()` (currently at line 20373). Instead of "WAVE N / Starting in 3...", the player sees a rapid-fire alien computer POST sequence. Text flies by almost too fast to read. Progress bars snap through. System checks blaze past. It feels like watching a supercomputer cold-start in fast-forward.

**Total duration**: 3.0 seconds (matches `CONFIG.WAVE_TRANSITION_DURATION: 3`)

**Visual style**: Dark background (#000 or very dark blue), monospace text in green/amber/cyan, progress bars, ASCII art. Think: BIOS POST screen meets NERV MAGI system boot. Every line of text is meaningful -- it references actual game systems.

### 2.2 Second-by-Second Timeline

#### Phase 1: POST BEEP + BIOS HEADER (0.0s - 0.6s)

**Visual**:
```
t=0.00s: Black screen. Single cursor blink (top-left, green).

t=0.05s: POST beep sounds. Header text appears INSTANTLY (not typed):

  ╔══════════════════════════════════════════════╗
  ║  MAGI-7 TACTICAL BIOS v3.1.7               ║
  ║  (c) SEELE AEROSPACE // TOKYO-3 DIVISION    ║
  ╚══════════════════════════════════════════════╝

t=0.10s-0.35s: Memory test scrolls FAST (one line every 40ms):

  MEMORY TEST: 262144K ████████████████████ OK
  QUANTUM BUFFER: 1048576Q ████████████████ OK
  NEURAL CACHE: 524288N ███████████████████ OK
  ENTANGLEMENT ARRAY: 4096E ████████████████ SYNC

t=0.35s-0.55s: Device detection scrolls (one line every 50ms):

  DETECTING HARDWARE...
  > TRACTOR.BEAM.ARRAY .......... PRESENT
  > HULL.INTEGRITY.MON .......... PRESENT
  > QUANTUM.NAV.CORE ............ PRESENT
  > ORDNANCE.CTRL [conditional] . PRESENT/NOT FOUND

t=0.55s: Brief screen flash (white, alpha 0.15, 50ms) to punctuate
```

**Conditional lines**: The device detection adapts to the player's actual loadout:
- If player has bombs: `> ORDNANCE.CTRL .............. PRESENT`
- If no bombs: `> ORDNANCE.CTRL .............. NOT FOUND` (amber text)
- If player has drones: `> FLEET.TELEMETRY ............ PRESENT`
- If player has missiles: `> SALVO.TARGETING ............ PRESENT`

**Sound** (see Section 5 for full specs):
- t=0.00s: POST beep (square wave, 1000Hz, 60ms)
- t=0.05s-0.55s: Rapid HDD clicking (filtered noise bursts, 15ms each, every 40ms)
- t=0.35s: Brief modem chirp on each "PRESENT" detection (frequency sweep 800->1600Hz, 30ms)

#### Phase 2: SYSTEM ROOT / ORCHESTRATOR (0.6s - 1.0s)

**Visual**:
```
t=0.60s: Previous text clears (instant). New text block:

  ──────────────────────────────────────────────
  LOADING SYSTEM ROOT...

  [ORCH] Orchestrator v7.3.1 mounting...
  [ORCH] Quantum entanglement layer: ACTIVE
  [ORCH] Spawning process table...

  PID   PROCESS              STATUS
  001   kernel.quantum       [RUNNING]
  002   nav.controller       [RUNNING]
  003   beam.driver          [RUNNING]

t=0.80s-0.95s: A horizontal progress bar fills rapidly:

  SYSTEM ROOT ██████████████████████░░░░ 87%
  (fills to 100% by t=0.95s, then shows "MOUNTED")
```

**Sound**:
- t=0.60s: Low electronic hum begins (sawtooth, 60Hz, rising to 120Hz over 400ms, gain 0.06)
- t=0.65s-0.90s: Quick data burst sounds (bandpass noise, 200-800Hz, 20ms each, every 80ms)
- t=0.95s: Confirmation blip (square wave, 440Hz, 40ms, gain 0.08)

#### Phase 3: AGENT SWARM LOADING (1.0s - 1.6s)

**Visual**:
```
t=1.00s: Text block transitions (previous fades to 30% alpha, new block appears):

  ──────────────────────────────────────────────
  INITIALIZING AGENT SWARMS...

  ┌─ SWARM.ALPHA ──────────────────────────┐
  │ [BOOT] sensor.array     ... ONLINE     │
  │ [BOOT] pattern.matcher  ... ONLINE     │
  │ [BOOT] threat.assessor  ... ONLINE     │
  └────────────────────────────────────────┘

t=1.20s: Tmux-style split (vertical divider line appears):

  ┌─ SWARM.ALPHA ──────┬─ SWARM.BETA ─────┐
  │ sensor.array  [OK] │ nav.planner  [OK] │
  │ pattern.match [OK] │ route.optim  [OK] │
  │ threat.assess [OK] │ coord.sync   [OK] │
  └────────────────────┴───────────────────┘

t=1.40s: Agent count ticks up rapidly in bottom-right:

  AGENTS: 47/128 ... 89/128 ... 128/128 NOMINAL
```

**Conditional**: If the player has no drones, SWARM.BETA shows `[STANDBY]` instead of `[OK]` for coord.sync.

**Sound**:
- t=1.00s-1.40s: Each swarm coming online gets a two-tone ascending blip (square, 600->800Hz then 800->1000Hz, 25ms each, 40ms apart)
- t=1.20s: Tmux split "crack" sound (noise burst, bandpass 1000-3000Hz, 15ms, gain 0.10)
- t=1.30s-1.55s: Rapid-fire agent count ticks (square wave, 1200Hz, 10ms, every 20ms -- creates a buzzing "machine gun" effect as count climbs)

#### Phase 4: UPLINK / DATA DOWNLOAD (1.6s - 2.0s)

**Visual**:
```
t=1.60s:

  ──────────────────────────────────────────────
  ESTABLISHING ORBITAL UPLINK...

  CARRIER: ~~~~~/\/\/\~~~~~ LOCK

  DOWNLOADING WAVE ${wave} TACTICAL DATA...
  ├── target.manifest    [████████████████] 100%
  ├── terrain.topology   [██████████░░░░░░]  67%
  ├── threat.profiles    [████████████████] 100%
  └── mission.params     [████████████████] 100%

t=1.80s: All bars hit 100%. Text changes:

  DOWNLOAD COMPLETE. ${tankCount} HOSTILES DETECTED.
  THREAT LEVEL: ${threatLevel}
```

**The CARRIER line** is animated: the `~~/\/\/\~~` pattern scrolls rightward like a live waveform for 200ms, then snaps to `LOCK`. This is the visual modem handshake moment.

**Threat level** is dynamic based on wave number:
- Wave 2-3: `MODERATE` (amber)
- Wave 4-6: `ELEVATED` (orange)
- Wave 7-9: `HIGH` (red)
- Wave 10+: `CRITICAL` (flashing red)

**Sound**:
- t=1.60s: MODEM HANDSHAKE sounds begin. Two overlapping frequency sweeps:
  - Sweep 1: 300Hz -> 2400Hz over 200ms (sawtooth, gain 0.05)
  - Sweep 2: 1200Hz -> 400Hz -> 1800Hz over 250ms (square, gain 0.04)
- t=1.65s-1.85s: Rapid data clicking overlaid (filtered noise, 2000-4000Hz bandpass, 8ms bursts, every 15ms)
- t=1.90s: Download complete confirmation -- ascending three-tone (square: 400, 600, 800Hz, 30ms each, 20ms stagger)

#### Phase 5: SYSTEM CHECK (2.0s - 2.6s)

**Visual**:
```
t=2.00s:

  ──────────────────────────────────────────────
  RUNNING PRE-LAUNCH DIAGNOSTICS...

  [OK] HULL.INTEGRITY ............. ${health}/${maxHealth}
  [OK] QUANTUM.NAV ................ CALIBRATED
  [OK] BEAM.ARRAY ................. CHARGED
  [OK] HARVEST.PROTOCOL ........... ACTIVE
  [  ] ORD.SYS .................... CHECKING...
  [  ] FLEET.CMD .................. CHECKING...

t=2.20s: More [OK]s appear (one every 100ms):

  [OK] ORD.SYS .................... ARMED
  [OK] FLEET.CMD .................. STANDING BY
  [OK] COMMS.SYS .................. LINKED

t=2.40s: Final summary line:

  ────────────────────────────────────
  ALL SYSTEMS: ██████████████████ PASS
  CLEARANCE: GRANTED
```

**Conditional lines**:
- ORD.SYS shows `[SKIP] ORD.SYS ... NOT INSTALLED` (amber) if no weapons
- FLEET.CMD shows `[SKIP] FLEET.CMD ... NO FLEET` (amber) if no drones
- Systems that exist show [OK] in green, missing show [SKIP] in amber

**Sound**:
- t=2.00s-2.40s: Each [OK] gets a confirmation beep at ascending pitch:
  - Line 1: square 300Hz, 35ms
  - Line 2: square 400Hz, 35ms
  - Line 3: square 500Hz, 35ms
  - Line 4: square 600Hz, 35ms
  - Line 5: square 700Hz, 35ms
  - Line 6: square 800Hz, 35ms
  - [SKIP] lines get a lower buzz: square 200Hz, 50ms
- t=2.40s: "PASS" confirmation: square 1000Hz + 1500Hz chord, 80ms, gain 0.10

#### Phase 6: COUNTDOWN + LAUNCH (2.6s - 3.0s)

**Visual**:
```
t=2.60s: Screen clears. Large centered text:

           ╔══════════════╗
           ║  WAVE ${wave}   ║
           ╠══════════════╣
           ║              ║
           ║    >> 3 <<   ║
           ║              ║
           ╚══════════════╝

t=2.73s:  >> 2 <<    (text flashes brighter)
t=2.86s:  >> 1 <<    (text flashes, border starts pulsing)

t=2.95s:  ████ LAUNCH ████
          (Full-width bar, flashing rapidly between #0f0, #ff0, #f00
           for 50ms -- EVA berserker-style color cycling)
          Screen flash: white, alpha 0.6, rapid 30ms decay

t=3.00s:  100ms SILENCE (visual: black screen)
          Then: CRT turn-on effect begins (Quantum OS boot)
```

**The countdown numbers** (3, 2, 1) appear in large bold monospace (48px), centered, with a box-drawing border. Each number triggers a screen-edge flash -- a brief bright line along all four borders that fades in 80ms.

**LAUNCH** appears in a filled rectangle that rapidly cycles green->yellow->red->white over 50ms, creating the EVA-style "going berserk" flash. This is aggressive and brief.

**Sound**:
- t=2.60s: Deep bass throb (sawtooth 50Hz, gain 0.15, 120ms decay) -- "3"
- t=2.73s: Deeper bass throb (sawtooth 45Hz, gain 0.18, 100ms decay) -- "2"
- t=2.86s: Deepest bass throb (sawtooth 40Hz, gain 0.22, 80ms decay) -- "1"
- t=2.95s: 50ms silence, then LAUNCH BURST:
  - White noise, full spectrum, gain 0.25, 80ms with rapid exponential decay
  - Overlaid with a rising sine sweep 100Hz->2000Hz over 80ms, gain 0.15
  - Immediate cut to silence at t=3.05s (creates the "impact" feel)
- t=3.05s-3.15s: True silence (100ms gap before Quantum OS CRT sound at ~3.2s)

### 2.3 Visual Implementation Notes

**Text rendering approach**: All BIOS text is rendered to the canvas using monospace font. No HTML overlays. Each phase has a text buffer that gets drawn line by line.

**Text scroll speed**: Lines appear at 30-50ms intervals during fast phases. The player should NOT be able to read every line on first viewing. This is intentional -- it creates the feeling of a system that operates faster than human comprehension. On subsequent waves, the familiarity builds and the player catches more details.

**Screen real estate**: The BIOS sequence uses the full canvas. No game scene is visible. Background is `#000` or `rgba(0, 5, 15, 1.0)` (very dark blue-black).

**Text colors**:
- Headers and box-drawing: `#0f0` (green) -- classic terminal
- System messages: `#0a0` (dimmer green)
- [OK] tags: `#0f0` (bright green)
- [SKIP]/[WARN] tags: `#fa0` (amber)
- Progress bars: `#0f0` fill, `#333` background
- Data values: `#0ff` (cyan)
- Critical warnings: `#f44` (red)

**Scanline overlay**: A faint CRT scanline effect (2px spacing, rgba(0,0,0,0.06)) runs over the entire BIOS display. This is even subtler than the Quantum OS boot scanlines (which use 0.08 alpha) because the BIOS should feel like an OLDER display.

**Font sizes**:
- BIOS header: bold 14px monospace
- Body text: 11px monospace (matches boot overlay text)
- Countdown numbers: bold 48px monospace
- LAUNCH: bold 24px monospace

### 2.4 Adaptive Content

The BIOS sequence adapts to the player's current state. This makes it feel like a REAL system boot, not a canned animation:

| Game State | Adaptation |
|---|---|
| Wave number | Shown in BIOS header, affects threat level text |
| Has bombs | ORD.SYS shows ARMED vs NOT INSTALLED |
| Has missiles | SALVO.TARGETING shows PRESENT vs NOT FOUND |
| Has drones | FLEET.CMD shows STANDING BY vs NO FLEET |
| Has coordinators | COORDINATOR NET line appears in swarm phase |
| Health < max | HULL.INTEGRITY shows actual HP, amber if < 50% |
| Tech researched | Memory test shows larger values for more tech |
| Bio-matter count | QUANTUM BUFFER size scales with bio-matter |
| Tank count (next wave) | Shown in download phase: "N HOSTILES DETECTED" |
| Heavy tanks present | Threat level escalates, HEAVY.ARMOR line appears |

### 2.5 Repetition Across Waves

The BIOS sequence plays every wave. It must NOT become annoying. Strategies:

1. **Speed**: At 3 seconds, it is fast enough to be atmosphere rather than obstacle
2. **Variation**: Content adapts to game state -- no two boots are identical
3. **Information**: Each boot tells the player useful things (enemy count, their loadout status)
4. **Rhythm**: The consistent pacing creates ritual. Like the EVA launch sequence, repetition builds anticipation rather than tedium
5. **Audio variety**: Slight random variation in timing/pitch of sounds (see Section 5)
6. **Skippability**: Consider allowing the player to press SPACE to instantly complete the BIOS and jump to Quantum OS boot. Do NOT skip the entire boot -- the panel boots contain actual game state information

---

## 3. F1: TECH TREE REVEAL MOMENT

### 3.1 When It Appears

The tech tree visualization first appears when the player has researched at least one technology. Before any research, the tech tree area (left gap between SYS.STATUS and MISSION.CTL) is empty.

**Trigger**: First tech completes research (usually PG1 Beam Conduit, ~30s into Wave 2).

**First appearance**: During the NEXT wave's HUD boot sequence (Wave 3+), the tech tree boots with its own diagnostic text.

### 3.2 Boot Reveal Animation

When the tech tree appears for the first time, it gets a special boot overlay:

```
TECH TREE BOOT OVERLAY (during panel_boot phase):

t+0.0s: Dark overlay covers tech tree area
        Label types out: "TECH.TREE"
        First line: ">> INIT TECH.TREE v1.0"

t+0.3s: "[OK] LOADING RESEARCH DATA..."
        "[OK] PG1 CONDUIT: RESEARCHED"
        (one line per researched tech)

t+0.6s: Progress bar fills
        ">> TECH TREE ONLINE"

t+0.8s: Overlay fades. Track rows appear one at a time:
        - PG row fades in (200ms)
        - DC row fades in (200ms, 100ms delay)
        - DN row fades in (200ms, 200ms delay)

        Researched nodes appear at full brightness.
        Unresearched nodes appear dim.
        Connecting lines draw themselves left-to-right (100ms per connection).
```

### 3.3 New Tech Appearance (Subsequent Boots)

When the player researches a new tech between waves, on the next boot:
- The newly researched node has a brief "pop" animation: scale 0.8 -> 1.15 -> 1.0 over 300ms
- Its connecting line draws in with a bright flash
- A brief blip sound plays (distinct from the standard boot data chatter)
- The node's track color glows brighter for 500ms then settles

Previously researched nodes appear normally -- no special animation.

### 3.4 Emotional Goal

The tech tree reveal should feel like UNLOCKING A NEW INSTRUMENT PANEL in a spacecraft. The player invested bio-matter into research, and now they can SEE their investment represented on the HUD. Each new node should feel like adding a component to their ship.

---

## 4. F2: BIO-MATTER UPLOAD CONDUIT

### 4.1 Upload Rhythm

When bio-matter units arrive (from abductions), they queue into the upload conduit display. The upload visualization shows data being "ripped" from the physical world into digital storage.

**Stagger timing**: When multiple units arrive simultaneously (e.g., 4 from a batch abduction), each gets its own upload row that appears with a 60ms stagger. This creates a rapid-fire cascading effect rather than a simultaneous pop.

```
UPLOAD SEQUENCE (4 units arriving):

t+0ms:   Row 1 appears: [>>>>>>>>>>>>] UNIT.001 UPLOADING
t+60ms:  Row 2 appears: [>>>>>>>>>>>>] UNIT.002 UPLOADING
t+120ms: Row 3 appears: [>>>>>>>>>>>>] UNIT.003 UPLOADING
t+180ms: Row 4 appears: [>>>>>>>>>>>>] UNIT.004 UPLOADING

Each row: progress bar fills over 200ms
         Chevron overlay scrolls rapidly (>>>>>>)
         Row color: track-appropriate or generic #0f0

t+400ms: All rows complete. Brief FLASH.
```

### 4.2 Completion Flash

When an upload completes, the completion flash is AGGRESSIVE. This is the EVA berserker moment of the upload system:

```
COMPLETION FLASH (per-row, 250ms total):

t+0ms:    Row background cycles: #0f0 -> #ff0 -> #f00 -> #fff -> #0ff
          Each color holds for ~50ms
          Text inverts (black on bright background)

t+150ms:  Row contracts (height shrinks from 12px to 2px over 100ms)

t+250ms:  Row gone. Bio-matter count in SYS.STATUS increments.
          Status zone B.MTR value flashes bright for 200ms.
```

The rapid color cycling (green -> yellow -> red -> white -> cyan) takes 250ms. It should feel violent and digital -- like data being FORCED through a pipeline. Think: Evangelion's "PATTERN BLUE" alert flashing.

### 4.3 Idle State

When no uploads are active, the conduit area shows a quiet but alive state:

- Slow pulse: a faint glow that breathes (opacity 0.05 -> 0.12 over 2000ms cycle)
- Occasional data blip: every 3-5 seconds, a single pixel-width line of data scrolls across the conduit area (like a heartbeat monitor flatline with rare blips)
- The conduit "pipe" graphic (if visible) has a very faint animated dash pattern moving slowly rightward (10px/s)

### 4.4 Sound Design

See Section 5 for full sound specs. Summary:
- Each upload row appearing: quick ascending blip (sine 1800->2200Hz, 30ms)
- Progress filling: subtle rapid clicking (not audible individually, creates texture)
- Completion flash: aggressive noise burst (bandpass filtered, 40ms)
- Idle blip: barely audible sine ping (2400Hz, 15ms, gain 0.02)

---

## 5. SOUND DESIGN PALETTE: PRE-BOOT BIOS SEQUENCE

All sounds are procedural Web Audio API synthesis. No audio files. Every sound described below contrasts with the existing Quantum OS boot sounds (which use sine waves, crystalline tones, and ascending chords). The BIOS sounds are HARDWARE -- square waves, noise bursts, sawtooth grit.

### 5.1 Master Principles

1. **Oscillator palette**: Square, sawtooth, noise. Reserve sine for the Quantum OS boot.
2. **Character**: Dirty, mechanical, industrial. Think 1990s server room.
3. **Volume**: Moderate (gain 0.04-0.15). This is atmosphere, not assault.
4. **Variation**: Add +/-5% random variation to frequencies and +/-10ms to timing on each play. This prevents the sequence from sounding robotic on repeated hearings.
5. **Spectral zone**: Target 200-2000Hz primarily, using the crowded mid zone intentionally -- the BIOS should sound "busy" and "noisy" in contrast to the sparse, clean Quantum OS sounds.

### 5.2 Sound-by-Sound Specifications

#### S1: POST Beep

The very first sound. A single, sharp beep that says "hardware is alive."

```
Trigger:        BIOS sequence start (t=0.00s)
Oscillator:     square
Frequency:      1000Hz (steady)
Gain:           0.10
Gain envelope:  Attack 2ms, sustain 40ms, decay 20ms to 0.001
Duration:       62ms
Filter:         None
Modulation:     None
Spectral band:  Mid (1000Hz + odd harmonics at 3000, 5000Hz)
Implementation: Single oscillator, gain node, destination
```

#### S2: HDD Click (Rapid Data Access)

Rapid clicking during text scroll, like hard drive heads seeking.

```
Trigger:        Each text line appearing during Phases 1-3
Oscillator:     White noise buffer (10ms generated)
Frequency:      Bandpass filter at 2500Hz, Q=8
Gain:           0.06
Gain envelope:  Attack 0ms (instant), decay 12ms to 0.001
Duration:       12ms per click
Filter:         BiquadFilter type 'bandpass', freq 2500Hz, Q 8
Modulation:     None
Spectral band:  High-mid (narrow band around 2500Hz)
Implementation: Pre-generated noise buffer, bandpass filter, gain node
Notes:          Play one click per text line. For fast-scrolling text,
                clicks should be 30-50ms apart, creating a rapid
                "chtk-chtk-chtk" rhythm.
Variation:      Randomize bandpass freq +/-300Hz per click.
```

#### S3: Device Detection Chirp

Brief modem-like chirp when hardware is detected.

```
Trigger:        Each "PRESENT" line in Phase 1 device detection
Oscillator:     square
Frequency:      800Hz -> 1600Hz (exponential ramp over 30ms)
Gain:           0.05
Gain envelope:  Attack 2ms, decay 28ms to 0.001
Duration:       30ms
Filter:         None
Modulation:     None
Spectral band:  Mid -> high-mid (800-1600Hz sweep)
Implementation: Square oscillator, frequency ramp, gain envelope
Variation:      Start freq randomized 700-900Hz per detection.
```

#### S4: Floppy Seek (Memory Test)

Bandpass noise burst that sounds like a floppy drive head stepping.

```
Trigger:        Each memory test line (Phase 1, 0.10-0.35s)
Oscillator:     White noise buffer (25ms generated)
Frequency:      Bandpass filter at 800Hz, Q=3, sweeping to 1200Hz over 25ms
Gain:           0.04
Gain envelope:  Attack 0ms, sustain 15ms, decay 10ms to 0.001
Duration:       25ms
Filter:         BiquadFilter type 'bandpass', freq ramp 800->1200Hz, Q=3
Modulation:     None
Spectral band:  Mid (800-1200Hz, narrow band noise)
Implementation: Noise buffer -> bandpass filter (with freq automation) -> gain
Notes:          Sounds like "fwip-fwip-fwip" - mechanical, not electronic.
                Play one per memory test line at 40ms intervals.
```

#### S5: System Root Hum (Rising Electronic Hum)

Low hum that rises as the system root loads.

```
Trigger:        Phase 2 start (t=0.60s), sustained for 350ms
Oscillator:     sawtooth
Frequency:      60Hz -> 120Hz (linear ramp over 350ms)
Gain:           0.06 -> 0.02 (slow exponential decay)
Gain envelope:  Attack 50ms (ramp 0 -> 0.06), sustain 200ms, decay 100ms
Duration:       350ms
Filter:         Lowpass at 400Hz (removes harsh sawtooth harmonics,
                keeps the "hum" character warm)
Modulation:     None
Spectral band:  Sub-bass -> bass (60-120Hz fundamental, harmonics to 400Hz)
Implementation: Sawtooth osc -> lowpass filter -> gain node
Notes:          This fills the sub-bass during Phase 2. It should be felt
                more than heard. The lowpass filter is critical to prevent
                it from being harsh.
```

#### S6: Data Burst (Packet Transfer)

Quick burst that sounds like data packets being processed.

```
Trigger:        Process table entries appearing (Phase 2, every 80ms)
Oscillator:     White noise buffer (20ms)
Frequency:      Bandpass filter at random 400-1200Hz, Q=5
Gain:           0.04
Gain envelope:  Attack 0ms, decay 18ms to 0.001
Duration:       18ms
Filter:         BiquadFilter type 'bandpass', randomized center freq, Q=5
Modulation:     None
Spectral band:  Low-mid to mid (400-1200Hz, narrow band)
Implementation: Noise buffer -> bandpass -> gain
Variation:      Center frequency randomized per burst. Higher frequencies
                for higher-numbered PIDs (creating ascending texture).
```

#### S7: Orchestrator Confirmation

Blip when system root mounting completes.

```
Trigger:        Progress bar hits 100% (Phase 2, ~t=0.95s)
Oscillator:     square
Frequency:      440Hz (steady)
Gain:           0.08
Gain envelope:  Attack 2ms, sustain 25ms, decay 15ms to 0.001
Duration:       42ms
Filter:         None
Modulation:     None
Spectral band:  Mid (440Hz + harmonics)
```

#### S8: Swarm Agent Two-Tone Blip

Each swarm agent coming online gets a quick ascending pair.

```
Trigger:        Each [BOOT] or [OK] line in Phase 3
Oscillator:     square (x2 sequential)
Frequency:      Tone 1: 600Hz, 20ms; Tone 2: 900Hz, 20ms (40ms gap)
Gain:           0.06 per tone
Gain envelope:  Per-tone: attack 1ms, sustain 15ms, decay 4ms to 0.001
Duration:       60ms total (20ms tone, 20ms gap, 20ms tone)
Filter:         None
Modulation:     None
Spectral band:  Mid (600-900Hz)
Variation:      Base frequency shifts up by +50Hz per successive agent,
                creating an ascending series across the phase.
Implementation: Two square oscillators scheduled with offset start times.
```

#### S9: Tmux Split Crack

Sharp noise when the terminal splits into two panes.

```
Trigger:        Terminal split moment (Phase 3, t=1.20s)
Oscillator:     White noise buffer (15ms)
Frequency:      Bandpass 1500Hz, Q=2
Gain:           0.10
Gain envelope:  Attack 0ms (instant), decay 12ms to 0.001
Duration:       15ms
Filter:         BiquadFilter type 'bandpass', 1500Hz, Q=2
Modulation:     None
Spectral band:  High-mid (narrow band around 1500Hz)
Notes:          Should sound like a sharp "crack" or "snap". The high
                bandpass frequency and short duration create a percussive
                transient.
```

#### S10: Agent Counter Buzz

Rapid ticking as agent count climbs from 0 to 128.

```
Trigger:        Agent counter incrementing (Phase 3, t=1.40-1.55s)
Oscillator:     square
Frequency:      1200Hz (steady)
Gain:           0.03
Gain envelope:  Attack 0ms, decay 8ms to 0.001
Duration:       8ms per tick
Filter:         None
Modulation:     None
Interval:       One tick every 15-20ms (creates machine-gun buzz)
Spectral band:  High-mid (1200Hz)
Notes:          At 15ms intervals, individual ticks merge into a continuous
                buzzing tone. This is intentional -- it sounds like a
                Geiger counter or data counter spinning up.
                Gain is LOW (0.03) because the density makes it perceptually
                loud.
```

#### S11: Modem Handshake Sweep

The iconic modem sound -- frequency sweeps that say "establishing connection."

```
Trigger:        Phase 4 start (t=1.60s)
Layer 1:
  Oscillator:   sawtooth
  Frequency:    300Hz -> 2400Hz (exponential ramp over 200ms)
  Gain:         0.05 -> 0.01
  Duration:     200ms
  Filter:       Bandpass 1000Hz, Q=1 (mild shaping)

Layer 2 (overlapping, 30ms later):
  Oscillator:   square
  Frequency:    1200Hz -> 400Hz -> 1800Hz (two-segment ramp: down 120ms, up 130ms)
  Gain:         0.04 -> 0.01
  Duration:     250ms
  Filter:       None

Combined:
  Spectral band: Low-mid to high-mid (300-2400Hz sweep)
  Implementation: Two oscillators started 30ms apart, each with frequency
                  automation. No need for complex modulation -- the crossing
                  frequency sweeps create the characteristic modem warble.

Notes:          NOT a full modem handshake (which takes 10+ seconds).
                Just the iconic first 200ms of frequency negotiation.
                The two crossing sweeps create interference patterns that
                sound "digital" and "alien."
```

#### S12: Data Transfer Click Stream

Rapid clicking during data download.

```
Trigger:        Download progress bars filling (Phase 4, t=1.65-1.85s)
Oscillator:     White noise buffer (8ms)
Frequency:      Highpass filter at 3000Hz (crisp, bright clicks)
Gain:           0.03
Gain envelope:  Attack 0ms, decay 6ms to 0.001
Duration:       8ms per click
Interval:       Every 12-15ms (very rapid)
Filter:         BiquadFilter type 'highpass', 3000Hz
Spectral band:  High (3000Hz+ noise)
Notes:          These are quieter and higher-pitched than the HDD clicks (S2).
                They should sound like Ethernet activity LEDs made audible.
                The highpass filter keeps them crisp and non-fatiguing.
```

#### S13: Download Complete Trio

Three ascending tones when download finishes.

```
Trigger:        All download bars at 100% (Phase 4, ~t=1.90s)
Oscillator:     square (x3 staggered)
Frequency:      400Hz, 600Hz, 800Hz
Gain:           0.06 per tone
Gain envelope:  Per-tone: attack 2ms, sustain 20ms, decay 10ms to 0.001
Duration:       32ms per tone, 20ms stagger
Total:          ~92ms
Filter:         None
Spectral band:  Low-mid to mid (400-800Hz)
Notes:          Quick, punchy, military -- like a radar lock confirmation.
```

#### S14: System Check Beep (Ascending Series)

Each [OK] line gets a confirmation beep at ascending pitch.

```
Trigger:        Each [OK] line in Phase 5
Oscillator:     square
Frequency:      300Hz + (lineIndex * 100Hz)
                Line 0: 300Hz, Line 1: 400Hz, ... Line 6: 900Hz
Gain:           0.07
Gain envelope:  Attack 1ms, sustain 25ms, decay 10ms to 0.001
Duration:       36ms
Filter:         None
Spectral band:  Low-mid to mid (300-900Hz, ascending)
Notes:          The ascending pitch creates a sense of building momentum.
                Each beep is slightly higher than the last, culminating
                in the "PASS" confirmation.

[SKIP] variant:
  Oscillator:   square
  Frequency:    200Hz (steady, low)
  Gain:         0.05
  Duration:     50ms (slightly longer -- emphasizes the "failure")
  Character:    Lower, duller -- clearly "something is missing"
```

#### S15: System Check Pass Chord

Confirmation that all checks passed.

```
Trigger:        "ALL SYSTEMS: PASS" line (Phase 5, ~t=2.40s)
Oscillator:     square (x2)
Frequency:      1000Hz + 1500Hz (simultaneous)
Gain:           0.08 per tone
Gain envelope:  Attack 2ms, sustain 50ms, decay 30ms to 0.001
Duration:       82ms
Filter:         None
Spectral band:  Mid to high-mid (1000-1500Hz)
Notes:          The power chord (two notes simultaneously) is more
                aggressive than a single tone. It says "READY."
```

#### S16: Countdown Bass Throb

Deep, felt-not-heard throb on each countdown number.

```
Trigger:        Each countdown number (3, 2, 1) in Phase 6

Number 3 (t=2.60s):
  Oscillator:   sawtooth
  Frequency:    50Hz
  Gain:         0.15
  Gain envelope: Attack 5ms, decay 115ms to 0.001
  Duration:     120ms
  Filter:       Lowpass at 150Hz (removes harshness, keeps sub-bass)

Number 2 (t=2.73s):
  Oscillator:   sawtooth
  Frequency:    45Hz
  Gain:         0.18
  Duration:     100ms
  Filter:       Lowpass at 150Hz

Number 1 (t=2.86s):
  Oscillator:   sawtooth
  Frequency:    40Hz
  Gain:         0.22
  Duration:     80ms
  Filter:       Lowpass at 150Hz

Spectral band:  Sub-bass (40-50Hz, felt through speakers/headphones)
Notes:          Getting lower, louder, and shorter. The compression of
                duration creates urgency. The sawtooth through lowpass
                gives more body than a sine wave.
                These are FELT in headphones/decent speakers, not really
                "heard" on laptop speakers. That is fine -- laptop users
                still get the visual countdown.
```

#### S17: Launch Burst

The climactic sound. Brief silence then explosive burst.

```
Trigger:        "LAUNCH" text (Phase 6, t=2.95s)

50ms silence (no sound from t=2.94s to t=2.99s)

Layer 1 - Noise burst:
  Oscillator:   White noise buffer (80ms)
  Frequency:    Full spectrum (no filter)
  Gain:         0.25 -> 0.01 (sharp exponential decay)
  Duration:     80ms
  Gain envelope: Attack 0ms (instant full), decay 80ms exponential

Layer 2 - Rising sweep:
  Oscillator:   sine
  Frequency:    100Hz -> 2000Hz (exponential ramp over 80ms)
  Gain:         0.15 -> 0.01
  Duration:     80ms
  Gain envelope: Attack 0ms, decay 80ms exponential

Layer 3 - Sub-impact:
  Oscillator:   sine
  Frequency:    40Hz
  Gain:         0.20 -> 0.01
  Duration:     100ms
  Gain envelope: Attack 0ms, decay 100ms exponential

Combined spectral band: Full spectrum (sub-bass through high)
Total gain peak:        ~0.60 for 10ms (acceptable for a climactic moment)

Notes:          This is the LOUDEST sound in the BIOS sequence. It serves
                as the punctuation mark. The instant attack + rapid decay
                creates a "punch" that clears the air for the silence
                that follows, which then transitions to the Quantum OS
                CRT turn-on sound.

                The 100ms silence after the burst is CRITICAL. Silence is
                the most powerful sound design tool. It creates space for
                the transition.
```

### 5.3 Gain Budget for BIOS Sequence

Worst case simultaneous sounds (Phase 4: modem + click stream):

```
S11 Layer 1 (modem sweep):     0.05
S11 Layer 2 (modem sweep):     0.04
S12 (data clicks):             0.03
S5  (system hum tail):         0.02 (if still decaying)
────────────────────────────────────
TOTAL:                         0.14
```

This is well within safe limits. The loudest moment is S17 (Launch Burst) at peak ~0.60, which is brief and acceptable.

### 5.4 Spectral Map of BIOS Sounds

```
BAND              RANGE (Hz)    BIOS SOUNDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUB-BASS          20-80         S16 countdown throbs (40-50Hz)
                                S17 sub-impact (40Hz)

BASS              80-200        S5 system hum (60-120Hz)
                                S14 [SKIP] beep (200Hz)

LOW-MID           200-500       S6 data bursts (400-1200Hz)
                                S13 download trio (400Hz start)
                                S11 modem (300Hz start)
                                S14 check beeps (300-500Hz)

MID               500-2000      S1 POST beep (1000Hz)
                                S3 detection chirps (800-1600Hz)
                                S4 floppy seek (800-1200Hz)
                                S7 confirmation (440Hz)
                                S8 swarm blips (600-900Hz)
                                S10 agent buzz (1200Hz)
                                S11 modem sweep (to 2400Hz)
                                S13 download trio (to 800Hz)
                                S14 check beeps (500-900Hz)
                                S15 pass chord (1000-1500Hz)

HIGH-MID          2000-5000     S2 HDD clicks (2500Hz bandpass)
                                S9 tmux crack (1500Hz)
                                S12 data clicks (3000Hz+)

HIGH              5000+         S12 data clicks (highpass 3000Hz+)
```

**Contrast with Quantum OS**: The OS boot sounds live primarily at 330-1175Hz with pure sine waves. The BIOS sounds are spread across a wider band with square/noise/sawtooth. They share the mid range but have completely different TIMBRES, which is what creates the perceived contrast.

---

## 6. F3: QUANTUM OS LOGO FEEL

### 6.1 Current State

The Quantum OS logo already exists (implemented in Pass 2). It shows:
- "ALIEN QUANTUM OS" in bold 24px cyan with glow
- Version text below
- Orbiting dots
- Hexagonal grid background
- Dissolve transition

### 6.2 Enhancement: Loading Indicator

Below the version text, add a loading indicator that gives the logo screen a sense of progress:

```
Current (t=-0.8s to t=-0.2s of boot):

  ALIEN QUANTUM OS
  v7.3.1 // QUANTUM ENTANGLEMENT CORE
  [ INITIALIZING... ]

Enhanced:

  ALIEN QUANTUM OS
  v7.3.1 // QUANTUM ENTANGLEMENT CORE

  ████████████░░░░░░░░░░░░ 37%        <- progress bar
  [ INITIALIZING... ]
```

**Progress bar spec**:
- Width: 200px, height: 4px
- Background: `rgba(0, 255, 255, 0.1)`
- Fill: `#0ff` with shadowBlur=4
- Fill speed: 0% to 100% over 500ms (the logo display duration)
- Segments: 20 segments, 2px gap (matches NGE bar style)
- Position: centered, 20px below version text

The progress bar adds the feeling of "the computer is actually doing something" during the logo display. It fills completely right before the dissolve begins.

### 6.3 Dissolve Enhancement

The current dissolve is a simple alpha fade. Enhance it:

**Pixel dissolve**: Instead of uniform alpha fade, dissolve pixel-by-pixel:
- Divide the logo area into an 8x4 grid of blocks
- Each block dissolves at a random time within the 200ms window
- A block "dissolves" by: alpha drops to 0 over 40ms while the block briefly flashes bright (alpha spike to 1.5x then to 0)
- This creates a "data corruption" effect rather than a smooth fade

**Sound**: A quiet digital static burst (noise, highpass 4000Hz, gain 0.03, 150ms) accompanies the dissolve. Like data being deconstructed.

---

## 7. PACING DIAGRAM: VISUAL + AUDIO ALIGNMENT

```
TIME  VISUAL                          AUDIO                         EMOTION
═══════════════════════════════════════════════════════════════════════════════
      ┌─────────────────── PRE-BOOT BIOS (3.0s) ──────────────────┐
      │                                                            │
0.0   │ Black screen. Cursor.          S1: POST beep              │ SURPRISE
0.05  │ BIOS header appears            S2: HDD clicks begin       │ CURIOSITY
0.10  │ Memory test scrolls            S4: Floppy seeks           │
0.35  │ Device detection               S3: Detection chirps       │ RECOGNITION
0.55  │ Brief screen flash             (moment of silence)        │
      │                                                            │
0.60  │ System root loading            S5: Rising hum             │ BUILDING
0.65  │ Process table populating       S6: Data bursts            │
0.95  │ Progress bar: MOUNTED          S7: Confirmation blip      │
      │                                                            │
1.00  │ Swarm initialization           S8: Two-tone blips         │ COMPLEXITY
1.20  │ Terminal splits (tmux)         S9: Crack!                 │
1.40  │ Agent counter climbs           S10: Buzzing counter       │ ESCALATION
      │                                                            │
1.60  │ Orbital uplink text            S11: MODEM WARBLE          │ CONNECTION
1.65  │ Carrier waveform animation     S12: Data click stream     │
1.80  │ Download bars fill             S12: Clicks accelerate     │
1.90  │ Download complete              S13: Ascending trio         │ ARRIVAL
      │                                                            │
2.00  │ System check begins            S14: Ascending beeps       │ VERIFICATION
2.20  │ [OK]s cascade down             S14: Beeps climb pitch     │
2.40  │ ALL SYSTEMS PASS               S15: Power chord           │ CONFIDENCE
      │                                                            │
2.60  │ >> 3 << (centered)             S16: Deep throb (50Hz)     │ ANTICIPATION
2.73  │ >> 2 << (brighter)             S16: Deeper throb (45Hz)   │
2.86  │ >> 1 << (pulsing)              S16: Deepest throb (40Hz)  │ TENSION
2.95  │ LAUNCH (color cycling)         S17: BURST + sweep         │ CLIMAX
3.00  │ BLACK (100ms silence)          === SILENCE ===            │ RELEASE
      │                                                            │
      └────────────────────────────────────────────────────────────┘

      ┌────────────────── QUANTUM OS BOOT (2.5s) ─────────────────┐
      │                                                            │
3.10  │ CRT horizontal line            crtTurnOn (existing)       │ REBIRTH
3.20  │ CRT vertical expansion         alienStartupChime starts   │
3.30  │ Quantum OS logo appears        Chime bloom                │ WONDER
3.50  │ Logo loading bar fills         (chime sustain)            │
3.80  │ Logo dissolves                 (chime decay)              │ CALM
4.00  │ Green border trace begins      Corner tones               │ PRECISION
4.50  │ Panels boot (staggered)        Boot chatter + blips       │ SATISFACTION
5.00  │ All panels online              bootAllOnline doorbell     │
5.20  │ "ALL SYSTEMS NOMINAL"          (quiet)                    │
5.50  │ Boot complete. WAVE STARTS.    (gameplay sounds begin)    │ ACTION
      │                                                            │
      └────────────────────────────────────────────────────────────┘
```

### Key Pacing Insights

1. **Never more than 400ms of silence** during the BIOS (except the intentional 100ms before Quantum OS). Dead air kills momentum.

2. **Audio density increases** from Phase 1 to Phase 4, peaks at the modem + click stream overlay, then gets more sparse during system check (individual beeps), creating breathing room before the countdown.

3. **The countdown is the QUIETEST part before the burst**. Just three bass throbs with silence between them. This is the "inhale before the scream."

4. **The transition gap** (100ms silence at 3.0s) is the hinge between the two worlds. BIOS = past, hardware, mechanical. Quantum OS = future, software, ethereal. The silence is the airlock between them.

---

## 8. TRANSITION DESIGN: BIOS INTO QUANTUM OS

### 8.1 The Handoff

The Pre-Boot BIOS runs during the wave transition state (`gameState === 'WAVE_TRANSITION'`, `waveTransitionTimer` counting down from 3.0). When `waveTransitionTimer` hits 0, the game transitions to `PLAYING` and `initHUDBoot()` is called.

**Current flow** (game.js line 20346-20370):
```
waveTransitionTimer <= 0
  -> gameState = 'PLAYING'
  -> initHUDBoot()
  -> Boot sequence starts (CRT, logo, trace, panels)
```

The BIOS replaces `renderWaveTransition()`. The existing transition timer (`CONFIG.WAVE_TRANSITION_DURATION: 3`) drives the BIOS phases. When the timer expires, the standard `initHUDBoot()` kicks in exactly as before.

### 8.2 Visual Continuity

The last BIOS frame is a BLACK SCREEN (the 100ms silence). The FIRST boot frame is also a black screen (the CRT turn-on starts with `ctx.fillStyle = '#000'; ctx.fillRect(...)`). So the visual transition is:

```
BIOS LAUNCH flash (50ms) -> BLACK (100ms) -> CRT horizontal line -> expansion
```

There is no jarring cut. The black frame serves as a visual "reset" that prepares the eye for the CRT animation.

### 8.3 Audio Continuity

```
BIOS:     ...throb...throb...BURST → SILENCE (100ms)
OS Boot:  .................... CRT buzz (soft) → Startup chime (smooth sine bloom)
```

The frequency content shifts dramatically:
- Last BIOS sound (S17): full-spectrum noise + sub-bass = chaotic
- First OS sound (CRT turn-on): filtered noise, moderate = neutral palette cleanser
- Second OS sound (startup chime): pure sine + filtered sawtooth = crystalline

This is the audio equivalent of the camera pulling back from a close-up of machinery to a wide shot of a serene alien bridge.

### 8.4 State Handoff

No new state variables are needed for the BIOS sequence itself. The existing `waveTransitionTimer` drives the phases:

```
Phase mapping to waveTransitionTimer (counts DOWN from 3.0):
  Phase 1 (POST):       timer 3.0 - 2.4  (elapsed 0.0 - 0.6)
  Phase 2 (System):     timer 2.4 - 2.0  (elapsed 0.6 - 1.0)
  Phase 3 (Swarm):      timer 2.0 - 1.4  (elapsed 1.0 - 1.6)
  Phase 4 (Uplink):     timer 1.4 - 1.0  (elapsed 1.6 - 2.0)
  Phase 5 (Check):      timer 1.0 - 0.4  (elapsed 2.0 - 2.6)
  Phase 6 (Countdown):  timer 0.4 - 0.0  (elapsed 2.6 - 3.0)
```

A new `biosBootState` object tracks the BIOS display state:

```js
let biosBootState = {
    phase: 'inactive',      // 'post'|'system'|'swarm'|'uplink'|'check'|'countdown'|'inactive'
    phaseTimer: 0,           // Time within current phase
    textLines: [],           // Current visible text lines
    textCursor: 0,           // Current line being typed
    progressBars: {},        // Named progress bar states
    agentCount: 0,           // Swarm agent counter
    checksCompleted: 0,      // System check progress
    countdownNumber: 3,      // Current countdown
    soundFlags: {},          // Prevent double-triggering sounds
    waveInfo: {              // Snapshot at transition start
        wave: 0,
        tankCount: 0,
        heavyTankCount: 0,
        hasBombs: false,
        hasMissiles: false,
        hasDrones: false,
        hasCoordinators: false,
        health: 0,
        maxHealth: 0,
        techCount: 0,
        bioMatter: 0
    }
};
```

---

## 9. CUMULATIVE EFFECT ACROSS WAVES

### 9.1 Wave 1 (Tutorial)

Wave 1 has NO pre-boot BIOS. The player goes directly from the game start into the tutorial. The first time the player sees the BIOS is at the Wave 2 transition, which is perfect -- it is a reward for surviving Wave 1.

### 9.2 Wave 2 (First BIOS)

The player's first BIOS experience. They have minimal equipment (maybe 1 bomb, no drones, no missiles). The BIOS reflects this:
- Several [SKIP] lines (no ordnance, no fleet)
- Smaller memory values
- Only 2-3 hostiles detected
- Threat level: MODERATE

This is a SHORT, SIMPLE boot. Many systems show "NOT FOUND." The player notices: "Oh, this thing shows what I have."

### 9.3 Wave 5+ (Growing Complexity)

By Wave 5, the player likely has:
- Bombs and possibly missiles
- At least 1-2 tech researched
- Maybe harvester drones

The BIOS gets RICHER:
- Fewer [SKIP] lines, more [OK] lines
- Larger memory values
- More hostiles detected (including "HEAVY.ARMOR UNITS")
- Threat level: ELEVATED or HIGH
- FLEET.CMD section populates
- More swarm agents initialize

The player subconsciously absorbs: "My ship is more powerful now."

### 9.4 Wave 10+ (Full Complexity)

Late game BIOS is DENSE:
- All [OK] across the board
- Large memory values
- Many hostiles + heavy tanks
- Threat level: CRITICAL (flashing red)
- Full fleet, full ordnance
- Maximum agent count
- The download phase shows intimidating enemy counts

The BIOS becomes a pre-battle briefing. The player knows what they are about to face and what they have to face it with.

### 9.5 Preventing Fatigue

- Total duration never exceeds 3 seconds
- Text varies based on game state
- Sound has random variation (+/-5% freq, +/-10ms timing)
- The player learns to use the BIOS as information (checking loadout, enemy count)
- Consider: after Wave 5, slightly increase text scroll speed (lines appear every 30ms instead of 40ms) -- the "computer" has warmed up
- The SPACE-to-skip option (jump to Quantum OS boot) provides an escape valve for impatient players

---

## 10. IMPLEMENTATION PRIORITY

1. **BIOS Visual Rendering** (Phase 6 countdown first, then work backwards to Phase 1)
   - Start with countdown because it replaces the most visible current element
   - Each phase can be developed and tested independently

2. **BIOS Sound Effects** (S1 POST beep, S16 countdown throbs, S17 launch burst first)
   - These are the "bookend" sounds that define the sequence
   - Middle sounds can be added incrementally

3. **Adaptive Content** (waveInfo snapshot, conditional lines)
   - Makes the BIOS feel alive rather than canned

4. **Tech Tree Boot Overlay** (F1)
   - Separate from BIOS, runs during panel_boot phase

5. **Bio-Matter Upload Enhancements** (F2)
   - Independent of BIOS sequence

6. **Quantum OS Logo Enhancement** (F3, progress bar + pixel dissolve)
   - Polish pass on existing feature

---

## 11. APPENDIX: WAVE TRANSITION SOUND CONTRAST TABLE

| Property | Pre-Boot BIOS | Quantum OS Boot |
|---|---|---|
| Primary oscillators | Square, sawtooth, noise | Sine, triangle |
| Character | Dirty, mechanical, harsh | Clean, crystalline, ethereal |
| Frequency range | Full spectrum (40-5000Hz) | Focused mid (330-2200Hz) |
| Envelope style | Sharp attack, rapid decay | Slow bloom, long sustain |
| Filter usage | Bandpass, highpass (narrow) | Lowpass sweep (wide bloom) |
| Emotional register | Industrial, military, urgent | Cosmic, alien, serene |
| Volume approach | Many quiet sounds layered | Few moderate sounds, spaced |
| Rhythm | Rapid-fire, staccato | Flowing, legato |
| Musical content | Non-melodic (noise, clicks) | Melodic (chords, arpeggios) |
| Cultural reference | 1990s server room, BIOS POST | Mac startup chime, EVA bridge |

This contrast is the soul of the design. The player journeys from RAW HARDWARE to INTELLIGENT SOFTWARE in 5.5 seconds, and they feel the transformation through their ears as much as their eyes.
