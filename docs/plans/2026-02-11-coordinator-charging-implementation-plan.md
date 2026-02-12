# Coordinator Charging UX — Implementation Plan

**Design doc:** `docs/plans/2026-02-11-coordinator-charging-ux-design.md`
**Target file:** `js/game.js` (16,381 lines)

---

## Code Map (key locations)

| Section | Lines | Notes |
|---|---|---|
| `CONFIG` constants | 6–357 | All game tuning parameters |
| `TUTORIAL_CONFIG` | 362–387 | Tutorial timing/color constants |
| `SFX` object | 564–1793 | All synthesized sound effects |
| `tutorialState` global | 3377 | Tutorial state variable |
| `initTutorial()` | 3423–3449 | Tutorial init (Wave 1 only) |
| `notifyTutorialBeamLock()` | 3455–3459 | Tutorial completion callback |
| `updateTutorial()` | 3505–3610 | Tutorial state machine update |
| `renderTutorialHints()` | 3766–3819 | Tutorial hint rendering dispatcher |
| `renderHintPanel()` | 3821–3826 | Shared hint panel background |
| `renderBeamHint()` | 3862–3905 | Beam hint rendering (pattern to follow) |
| `UFO` class | 4265–4849 | UFO entity |
| `UFO.update()` | 4287–4523 | Beam activation, energy drain, coordinator recharge (4352-4398) |
| `UFO.findTargetInBeam()` | 4525–4609 | Target detection in beam cone |
| `UFO.render()` | 4611–4698 | UFO rendering, calls `renderBeam()` |
| `UFO.renderBeam()` | 4701–4791 | Beam cone + spiral + recharge glow |
| `UFO.renderBeamSpiral()` | 4793–4849 | Spiral effect inside beam |
| `Coordinator` class | 7800–8420 | Base coordinator |
| `Coordinator.constructor()` | 7801–7857 | State, energy, visual properties |
| `Coordinator.update()` | 7890–8029 | State machine, energy drain |
| `Coordinator.rechargeEnergy()` | 8031–8039 | Recharge method |
| `Coordinator.render()` | 8183–8419 | Body, glow, energy bar, tethers |
| Energy bar render | 8257–8267 | Current: 40px wide, 4px tall bar |
| `HarvesterCoordinator` | 8422–8505 | Subclass |
| `AttackCoordinator` | 8507–8630 | Subclass |
| `deployHarvesterDrone()` | 8634–8662 | Coordinator deploy entry point |
| `deployBattleDrone()` | 8664–8692 | Coordinator deploy entry point |
| `updateCoordinators()` | 8708–8740 | Coordinator update loop |
| `renderCoordinators()` | 8742–8744 | Coordinator render loop |
| `renderUI()` | 10196–10389 | HUD rendering |
| `renderDroneStatus()` | 10469–10518+ | Drone status panel in HUD |
| `update()` (main) | 16088–16282 | Main game update loop |
| `render()` (main) | 16284–16374 | Main game render loop |

---

## Implementation Units (execute sequentially)

### Unit 1: CONFIG Constants & New State Properties

**Design sections:** Foundation for all sections (1–5)
**Dependencies:** None

**What it does:** Adds all new CONFIG constants for the charging system and adds new properties to the Coordinator constructor. No behavioral changes yet — just data.

#### 1A. Add CONFIG constants (after line 307, inside CONFIG object, after `HARVESTER_BATCH_SIZE: 3,`)

Insert a new block of constants:

```js
    // === EXPANSION: Coordinator Charging UX ===
    COORD_CHARGE_SNAP_RANGE: 140,       // Horizontal px range for beam snap
    COORD_CHARGE_BEAM_WIDTH: 10,        // Width of charging beam rod (px)
    COORD_CHARGE_SINE_AMP: 12,          // Sine wave amplitude on charging beam
    COORD_CHARGE_SINE_FREQ: 4,          // Sine wave frequency (cycles along beam)
    COORD_CHARGE_PARTICLE_RATE: 0.08,   // Seconds between energy particles
    COORD_ENERGY_BAR_WIDTH: 60,         // Upgraded energy bar width
    COORD_ENERGY_BAR_HEIGHT: 7,         // Upgraded energy bar height
    COORD_SOS_INTERVAL: 2.0,           // Seconds between SOS beacon pulses
    COORD_SOS_DYING_INTERVAL: 1.0,     // SOS interval when below 10%
    COORD_SOS_RING_MAX_RADIUS: 90,     // Max expansion radius of SOS ring
    COORD_SOS_RING_DURATION: 1.0,      // How long each ring lasts
    COORD_HUD_ARROW_SIZE: 12,          // Size of directional arrow indicator
```

#### 1B. Add new properties to `Coordinator.constructor()` (after line 7856, before the closing `}`)

Insert:

```js
        // Charging UX state
        this.isBeingCharged = false;      // Currently receiving charge beam
        this.chargeShimmerPhase = 0;      // Shimmer animation on energy bar
        this.sosTimer = 0;                // Timer for SOS beacon pulses
        this.sosRings = [];               // Active expanding SOS rings [{radius, alpha, maxRadius}]
        this.inSnapRange = false;         // UFO is within snap range
        this.snapHighlightPulse = 0;      // Pulse animation for proximity highlight
```

#### 1C. Add TUTORIAL_CONFIG entries for coordinator charging hint

In `TUTORIAL_CONFIG` (after line 376, before `PHASE1_HARD_CUTOFF`):

```js
    COORD_CHARGE_HINT_DELAY: 1.0,       // Delay after coordinator enters ACTIVE before hint shows
```

And in `TUTORIAL_CONFIG.COLORS` (after line 385, before closing `}`):

```js
        coordinator_charge: '#ffa000'
```

**Testable after:** Game loads without errors. No behavioral changes.

---

### Unit 2: SFX — New Sound Effects

**Design sections:** Section 2 (charging beam sound), Section 4 (distress beep, full-charge chime)
**Dependencies:** Unit 1

**What it does:** Adds three new sound effect functions to the SFX object. No integration with game logic yet.

#### 2A. Add `chargingHumLoop` / `stopChargingHumLoop` (insert after `stopBeamLoop` at line 614, before `abductionComplete`)

These follow the same pattern as `startBeamLoop`/`stopBeamLoop`: a looping oscillator that stays active while charging is happening.

```js
    // Charging beam hum - warm electrical hum, distinct from beam loop
    chargingHumLoop: null,
    chargingHumGain: null,

    startChargingHum: () => {
        if (!audioCtx || SFX.chargingHumLoop) return;
        SFX.chargingHumLoop = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        SFX.chargingHumGain = audioCtx.createGain();
        const lfoGain = audioCtx.createGain();

        lfo.frequency.setValueAtTime(4, audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(15, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(SFX.chargingHumLoop.frequency);

        SFX.chargingHumLoop.type = 'triangle';
        SFX.chargingHumLoop.frequency.setValueAtTime(120, audioCtx.currentTime);
        SFX.chargingHumLoop.connect(SFX.chargingHumGain);
        SFX.chargingHumGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        SFX.chargingHumGain.connect(audioCtx.destination);

        SFX.chargingHumLoop.start();
        lfo.start();
    },

    stopChargingHum: () => {
        if (SFX.chargingHumLoop) {
            SFX.chargingHumGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            SFX.chargingHumLoop.stop(audioCtx.currentTime + 0.15);
            SFX.chargingHumLoop = null;
            SFX.chargingHumGain = null;
        }
    },

    // Rising pitch on charging hum as coordinator approaches full
    setChargingHumPitch: (energyPct) => {
        if (SFX.chargingHumLoop) {
            const freq = 120 + energyPct * 80; // 120Hz at empty -> 200Hz at full
            SFX.chargingHumLoop.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
        }
    },
```

#### 2B. Add `chargeFull` chime (insert after `stopChargingHum`)

```js
    chargeFull: () => {
        if (!audioCtx) return;
        // Satisfying "full charge" chime — ascending major chord
        [523, 659, 784].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.2, 'sine', 0.15), i * 60);
        });
    },
```

#### 2C. Add `distressBeep` (insert after `chargeFull`)

```js
    distressBeep: () => {
        if (!audioCtx) return;
        // Two-tone warning beep (short, not annoying)
        const t = audioCtx.currentTime;
        playTone(600, 0.08, 'square', 0.1);
        setTimeout(() => playTone(400, 0.08, 'square', 0.1), 100);
    },
```

**Testable after:** Game loads without errors. Can manually test `SFX.startChargingHum()` / `SFX.stopChargingHum()` / `SFX.chargeFull()` / `SFX.distressBeep()` from console.

---

### Unit 3: Proximity Snap Detection & Beam Redirect Logic

**Design sections:** Section 1 (Beam Behavior & Interaction Model)
**Dependencies:** Units 1, 2

**What it does:** Modifies `UFO.update()` to detect coordinators in snap range, redirect the beam into the nearest low-energy coordinator instead of firing the normal abduction cone, and apply the energy transfer. This is the core behavioral change.

#### 3A. Add `findSnapCoordinator()` method to `UFO` class (insert after `findTargetInBeam()` method, after line 4609)

```js
    // Find the coordinator in snap range with the lowest energy
    findSnapCoordinator() {
        if (activeCoordinators.length === 0) return null;
        let best = null;
        let bestEnergy = Infinity;
        for (const coord of activeCoordinators) {
            if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
            const dx = Math.abs(coord.x - this.x);
            if (dx <= CONFIG.COORD_CHARGE_SNAP_RANGE) {
                if (coord.energyTimer < coord.maxEnergy && coord.energyTimer < bestEnergy) {
                    bestEnergy = coord.energyTimer;
                    best = coord;
                }
            }
        }
        return best;
    }
```

#### 3B. Add `chargingTarget` property to `UFO.constructor()` (after `beamOutOfEnergy` at line 4277)

Insert:
```js
        this.chargingTarget = null;       // Coordinator being charged via snap beam
        this.chargingParticleTimer = 0;   // Timer for spawning energy particles along charge beam
```

#### 3C. Modify beam activation logic in `UFO.update()` (lines 4324–4398)

The current code at line 4324 starts `if (wantsBeam && canFireBeam) {`. Inside that block, we need to add snap coordinator detection BEFORE the normal beam target search.

**Replace lines 4324–4398** (from `if (wantsBeam && canFireBeam) {` through the closing `}` of the coordinator/drone recharge block) with logic that:

1. First checks `this.findSnapCoordinator()` when `wantsBeam && canFireBeam`
2. If a snap coordinator is found:
   - Set `this.chargingTarget = coord`
   - Set `coord.isBeingCharged = true`
   - Mark `this.beamActive = true` (needed for energy drain)
   - Drain UFO energy same as normal beam
   - Apply recharge rate to the coordinator (using existing rechargeRate logic)
   - Start charging hum sound instead of normal beam loop
   - Set charging hum pitch based on coordinator energy level
   - If coordinator reaches full energy, play `SFX.chargeFull()` and stop charging
   - Do NOT call `findTargetInBeam()` — no abduction while charging
   - Do NOT render the normal beam cone (handled in Unit 5)
3. If no snap coordinator, proceed with existing beam logic unchanged (normal cone, target search, coordinator recharge via cone)
4. When beam deactivates (wantsBeam becomes false or energy runs out), clear `this.chargingTarget` and stop charging hum

The existing recharge-in-cone logic (lines 4352-4398) should be preserved for when the beam is active but NOT snapped to a coordinator. This handles the case where coordinators/drones happen to be inside the normal cone beam.

**Critical detail:** The `chargingTarget` coordinator must have its `isBeingCharged` flag cleared when:
- Player releases spacebar
- UFO energy runs out
- Coordinator moves out of snap range (unlikely since it follows UFO, but defensive)
- Coordinator dies or reaches full energy

Also: when `this.chargingTarget` is set, the UFO should NOT move (same behavior as `isAbducting` — lines 4499-4522). The player commits to charging in place. (Or we could allow movement — this is a design choice. The design doc doesn't say either way. Keep movement allowed since the coordinator follows the UFO.)

**Actually — re-reading the design doc:** "the beam redirects into the coordinator" — no mention of locking movement. Allow movement while charging.

#### 3D. Update beam deactivation paths

There are three places beams get deactivated:
1. **Line 4407** (`this.beamActive` was true but wantsBeam is now false) — add `this.chargingTarget` cleanup
2. **Line 4462** (energy depleted auto-deactivation) — add `this.chargingTarget` cleanup
3. **Lines 16184-16199** (wave end cleanup) — add `this.chargingTarget` cleanup

Each needs:
```js
if (this.chargingTarget) {
    this.chargingTarget.isBeingCharged = false;
    this.chargingTarget = null;
    SFX.stopChargingHum();
}
```

**Testable after:** When pressing spacebar near a coordinator, UFO energy drains and coordinator energy refills. Normal beam fires when not near a coordinator. No visual changes to the beam yet (still renders as cone).

---

### Unit 4: Coordinator Energy Display Upgrade

**Design sections:** Section 3 (Coordinator Energy Display), Section 4 (SOS Beacon partial — SOS ring state update)
**Dependencies:** Unit 1

**What it does:** Upgrades the coordinator's energy bar visual, body glow scaling, proximity highlight, and SOS ring system. All changes are within `Coordinator.render()` and `Coordinator.update()`.

#### 4A. Update energy bar rendering in `Coordinator.render()` (replace lines 8257–8267)

The current energy bar is:
```js
        // Energy bar above coordinator
        if (this.state !== 'DEPLOYING') {
            const bw = 40, bh = 4;
            const bx = cx - bw / 2, by = cy - this.height / 2 - 10;
            ctx.fillStyle = '#333';
            ctx.fillRect(bx, by, bw, bh);
            const barColor = energyPct > 0.5 ? (isHarvester ? '#0f8' : '#f80') :
                             energyPct > 0.25 ? '#ff0' : '#f00';
            ctx.fillStyle = barColor;
            ctx.fillRect(bx, by, bw * energyPct, bh);
        }
```

Replace with the upgraded bar: 60px wide, 7px tall, dark border, color progression green/yellow/red, inner glow, and shimmer when being charged.

```js
        // Energy bar above coordinator
        if (this.state !== 'DEPLOYING') {
            const bw = CONFIG.COORD_ENERGY_BAR_WIDTH;
            const bh = CONFIG.COORD_ENERGY_BAR_HEIGHT;
            const bx = cx - bw / 2;
            const by = cy - this.height / 2 - 12;

            // Dark border/background
            ctx.fillStyle = '#111';
            ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
            ctx.fillStyle = '#222';
            ctx.fillRect(bx, by, bw, bh);

            // Color progression: green > yellow > red
            let barR, barG, barB;
            if (energyPct > 0.5) {
                barR = 0; barG = 220; barB = 80;
            } else if (energyPct > 0.25) {
                barR = 255; barG = 220; barB = 0;
            } else {
                barR = 255; barG = 50; barB = 50;
            }

            // Fill bar
            ctx.fillStyle = `rgb(${barR}, ${barG}, ${barB})`;
            ctx.fillRect(bx, by, bw * energyPct, bh);

            // Inner glow (subtle lighter overlay on filled portion)
            const glowGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, 0.25)`);
            glowGrad.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
            glowGrad.addColorStop(1, `rgba(0, 0, 0, 0.15)`);
            ctx.fillStyle = glowGrad;
            ctx.fillRect(bx, by, bw * energyPct, bh);

            // Charging shimmer (bright white highlight sweeping across bar)
            if (this.isBeingCharged) {
                this.chargeShimmerPhase += 0.03;
                const shimmerX = bx + ((this.chargeShimmerPhase % 1) * bw * energyPct);
                const shimmerW = 12;
                const shimmerGrad = ctx.createLinearGradient(shimmerX - shimmerW, by, shimmerX + shimmerW, by);
                shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
                shimmerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = shimmerGrad;
                ctx.fillRect(bx, by, bw * energyPct, bh);
            }
        }
```

#### 4B. Upgrade body glow rendering (modify lines 8196–8221)

The current glow is:
```js
        // Glow intensity tied to energy
        const glowIntensity = energyPct * (0.5 + Math.sin(this.glowPulse) * 0.2);
```

Replace the glow section (lines 8196–8221) with energy-scaled glow that:
- Full charge: vibrant, rich saturation, visible pulsing
- Depleting: dims and desaturates proportionally
- Below 25%: washed out, feeble, flickering

```js
        // Glow intensity scales with energy level
        let glowIntensity;
        if (energyPct > 0.5) {
            // Full/healthy: vibrant pulsing
            glowIntensity = (0.5 + energyPct * 0.5) * (0.7 + Math.sin(this.glowPulse) * 0.3);
        } else if (energyPct > 0.25) {
            // Depleting: dimming
            glowIntensity = energyPct * (0.4 + Math.sin(this.glowPulse) * 0.15);
        } else {
            // Critical: washed out, intermittent flicker
            glowIntensity = 0.1 + energyPct * 0.4;
        }

        // Intensify glow while being charged
        if (this.isBeingCharged) {
            glowIntensity = Math.min(1.0, glowIntensity + 0.3 + Math.sin(this.glowPulse * 2) * 0.15);
        }
```

Keep the existing flicker code at lines 8200-8201 as-is (it already handles LOW_ENERGY flickering).

#### 4C. Add proximity snap highlight rendering (after the shield indicator, after line 8253, before `ctx.restore()` at line 8255)

```js
        // Proximity snap highlight (UFO in charge range)
        if (this.inSnapRange && this.state !== 'DYING') {
            this.snapHighlightPulse += 0.04;
            const highlightAlpha = 0.3 + Math.sin(this.snapHighlightPulse * 3) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width * 0.6 + 3, this.height * 0.6 + 3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
```

#### 4D. Add SOS beacon ring update in `Coordinator.update()` — in the `ACTIVE` / `LOW_ENERGY` case (after line 7947, before line 7950)

```js
                // SOS beacon
                if (this.state === 'LOW_ENERGY') {
                    const sosInterval = this.energyTimer <= this.maxEnergy * 0.10 ?
                        CONFIG.COORD_SOS_DYING_INTERVAL : CONFIG.COORD_SOS_INTERVAL;
                    this.sosTimer += dt;
                    if (this.sosTimer >= sosInterval) {
                        this.sosTimer = 0;
                        this.sosRings.push({ radius: this.width * 0.5, alpha: 0.8 });
                        SFX.distressBeep && SFX.distressBeep();
                    }
                }
                // Update SOS rings
                for (let i = this.sosRings.length - 1; i >= 0; i--) {
                    const ring = this.sosRings[i];
                    ring.radius += 60 * dt;
                    ring.alpha -= dt / CONFIG.COORD_SOS_RING_DURATION;
                    if (ring.alpha <= 0 || ring.radius >= CONFIG.COORD_SOS_RING_MAX_RADIUS) {
                        this.sosRings.splice(i, 1);
                    }
                }
```

#### 4E. Render SOS beacon rings in `Coordinator.render()` (after `ctx.restore()` at line 8255, before the energy bar section)

```js
        // SOS beacon rings
        for (const ring of this.sosRings) {
            ctx.strokeStyle = `rgba(255, 50, 50, ${ring.alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
```

#### 4F. Update `inSnapRange` flag each frame in `Coordinator.update()` (in ACTIVE/LOW_ENERGY case, ~line 7908 area)

```js
                // Update snap range flag
                if (ufo) {
                    this.inSnapRange = Math.abs(this.x - ufo.x) <= CONFIG.COORD_CHARGE_SNAP_RANGE &&
                        (this.state === 'ACTIVE' || this.state === 'LOW_ENERGY');
                } else {
                    this.inSnapRange = false;
                }
```

**Testable after:** Coordinator energy bar is larger (60x7px), has color progression, flickers at low energy. SOS red rings pulse outward when low energy. Body glow scales with energy. Proximity highlight appears when UFO is close. Shimmer appears on bar when `isBeingCharged` is true (requires Unit 3).

---

### Unit 5: Charging Beam Visual

**Design sections:** Section 2 (Charging Beam Visual)
**Dependencies:** Units 1, 2, 3

**What it does:** Adds the `renderChargingBeam()` method to the UFO class and integrates it into `UFO.render()` so that when `this.chargingTarget` is set, it renders the sinusoidal energy conduit instead of the normal cone beam.

#### 5A. Add `renderChargingBeam()` method to UFO class (insert after `renderBeamSpiral()`, after line 4849)

```js
    renderChargingBeam() {
        if (!this.chargingTarget) return;
        const coord = this.chargingTarget;
        const startX = this.x;
        const startY = this.y + this.height / 2 + this.hoverOffset;
        const endX = coord.x;
        const endY = coord.y;

        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;

        const segments = 30;
        const now = Date.now() / 1000;
        const sineAmp = CONFIG.COORD_CHARGE_SINE_AMP;
        const sineFreq = CONFIG.COORD_CHARGE_SINE_FREQ;
        const beamWidth = CONFIG.COORD_CHARGE_BEAM_WIDTH;

        // Perpendicular direction for sine oscillation
        const perpX = -dy / dist;
        const perpY = dx / dist;

        ctx.save();

        // Soft outer glow
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = 'rgba(255, 180, 50, 0.3)';
        ctx.lineWidth = beamWidth * 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Main beam rod
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = 'rgba(255, 200, 80, 0.8)';
        ctx.lineWidth = beamWidth;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Bright center line
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = 'rgba(255, 240, 180, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Energy particles traveling along the sine path toward coordinator
        this.chargingParticleTimer += 0.016; // approximate dt
        if (this.chargingParticleTimer >= CONFIG.COORD_CHARGE_PARTICLE_RATE) {
            this.chargingParticleTimer = 0;
            // Spawn a particle at a random position along the beam, moving toward coord
            const t = Math.random() * 0.7; // spawn in first 70% of beam
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            const speed = 150 + Math.random() * 100;
            const dirX = (dx / dist) * speed;
            const dirY = (dy / dist) * speed;
            particles.push(new Particle(
                px, py, dirX, dirY,
                `rgb(255, ${200 + Math.floor(Math.random() * 55)}, ${80 + Math.floor(Math.random() * 80)})`,
                2 + Math.random() * 2, 0.3 + Math.random() * 0.2
            ));
        }

        ctx.restore();
    }
```

#### 5B. Modify `UFO.render()` to switch between normal beam and charging beam (modify lines 4640-4643)

Current:
```js
        // Render beam first (behind UFO)
        if (this.beamActive) {
            this.renderBeam();
        }
```

Replace with:
```js
        // Render beam first (behind UFO)
        if (this.beamActive) {
            if (this.chargingTarget) {
                this.renderChargingBeam();
            } else {
                this.renderBeam();
            }
        }
```

**Testable after:** When charging a coordinator, a gold sinusoidal energy beam renders from UFO to coordinator with flowing particles. Normal cyan/magenta cone beam renders otherwise.

---

### Unit 6: HUD Directional Arrows for Low-Energy Coordinators

**Design sections:** Section 4 (HUD directional indicator)
**Dependencies:** Unit 1

**What it does:** Adds HUD arrows near the UFO pointing toward coordinators in LOW_ENERGY state. Rendered in `renderUI()`.

#### 6A. Add `renderCoordDistressArrows()` function (insert after `renderDroneStatus()` function, after its closing `}`)

This function iterates over `activeCoordinators`, finds those in LOW_ENERGY state, calculates angle from UFO to coordinator, and renders small arrows near the UFO (or at screen edge if off-screen).

```js
function renderCoordDistressArrows() {
    if (!ufo || activeCoordinators.length === 0) return;

    for (const coord of activeCoordinators) {
        if (!coord.alive || (coord.state !== 'LOW_ENERGY' && coord.energyTimer > coord.maxEnergy * 0.25)) continue;

        const dx = coord.x - ufo.x;
        const dy = coord.y - ufo.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) continue;

        const angle = Math.atan2(dy, dx);
        const arrowDist = 70; // Distance from UFO center
        const isHarvester = coord.type === 'harvester';
        const typeColor = isHarvester ? '0, 220, 255' : '255, 160, 50';

        // Arrow position (clamped to screen edges if coord is off-screen)
        let ax = ufo.x + Math.cos(angle) * arrowDist;
        let ay = ufo.y + Math.sin(angle) * arrowDist;
        ax = Math.max(20, Math.min(canvas.width - 20, ax));
        ay = Math.max(20, Math.min(canvas.height - 20, ay));

        const size = CONFIG.COORD_HUD_ARROW_SIZE;
        const dying = coord.energyTimer <= coord.maxEnergy * 0.10;
        const pulse = dying ? (Math.sin(Date.now() / 100) * 0.5 + 0.5) : (Math.sin(Date.now() / 300) * 0.3 + 0.7);

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);

        // Red pulsing outline
        ctx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.6, -size * 0.6);
        ctx.lineTo(-size * 0.3, 0);
        ctx.lineTo(-size * 0.6, size * 0.6);
        ctx.closePath();
        ctx.stroke();

        // Type-colored fill
        ctx.fillStyle = `rgba(${typeColor}, ${pulse * 0.8})`;
        ctx.fill();

        ctx.restore();
    }
}
```

#### 6B. Call `renderCoordDistressArrows()` from `renderUI()` (insert at line 10388, before the closing `}`)

```js
    // ========== COORDINATOR DISTRESS ARROWS ==========
    renderCoordDistressArrows();
```

**Testable after:** When a coordinator is at low energy, small colored arrows appear near the UFO pointing toward it. Arrows flash more urgently below 10%.

---

### Unit 7: Tutorial — First Coordinator Deploy Hint

**Design sections:** Section 5 (Teaching the Mechanic)
**Dependencies:** Units 1, 3

**What it does:** Adds a one-time tutorial hint when the player deploys their very first coordinator, teaching them to charge it with spacebar.

#### 7A. Add coordinator charge tutorial state (add a global near `tutorialState` at line 3377)

```js
let coordChargeTutorialShown = false; // One-time: has the player seen the coordinator charge hint?
let coordChargeTutorialState = null;  // { phase: 'WAITING'|'SHOWING'|'DISMISSED', timer, targetCoord }
```

#### 7B. Add coordinator charge tutorial trigger in `deployHarvesterDrone()` and `deployBattleDrone()`

In `deployHarvesterDrone()` (after line 8649, after `createFloatingText`):
```js
        // Trigger coordinator charge tutorial on first deploy
        if (!coordChargeTutorialShown) {
            coordChargeTutorialShown = true;
            coordChargeTutorialState = { phase: 'WAITING', timer: 0, targetCoord: coord };
        }
```

Same in `deployBattleDrone()` (after line 8679, after `createFloatingText`).

#### 7C. Add coordinator charge tutorial update logic

Insert a new function after `updateTutorialCelebration()` (after line 3741):

```js
function updateCoordChargeTutorial(dt) {
    if (!coordChargeTutorialState || coordChargeTutorialState.phase === 'DISMISSED') return;

    const cs = coordChargeTutorialState;
    cs.timer += dt;

    if (cs.phase === 'WAITING') {
        // Wait for coordinator to enter ACTIVE state
        if (cs.targetCoord && cs.targetCoord.state === 'ACTIVE' && cs.timer >= TUTORIAL_CONFIG.COORD_CHARGE_HINT_DELAY) {
            cs.phase = 'SHOWING';
            cs.timer = 0;
        }
    } else if (cs.phase === 'SHOWING') {
        // Dismiss when player charges the coordinator for the first time
        if (cs.targetCoord && cs.targetCoord.isBeingCharged) {
            cs.phase = 'DISMISSED';
            // Particle burst on dismissal
            const cx = cs.targetCoord.x;
            const cy = cs.targetCoord.y;
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                const speed = 80 + Math.random() * 50;
                particles.push(new Particle(
                    cx + (Math.random() - 0.5) * 20, cy,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    'rgb(255, 180, 50)', 3, 0.3
                ));
            }
            SFX.powerupCollect && SFX.powerupCollect();
            coordChargeTutorialState = null;
        }
    }
}
```

#### 7D. Add coordinator charge tutorial rendering

Insert a new function after the previous one:

```js
function renderCoordChargeHint() {
    if (!coordChargeTutorialState || coordChargeTutorialState.phase !== 'SHOWING') return;

    const cs = coordChargeTutorialState;
    const coord = cs.targetCoord;
    if (!coord || !coord.alive) {
        coordChargeTutorialState = null;
        return;
    }

    const t = cs.timer;
    const alpha = Math.min(1, t / 0.3); // Fade in

    ctx.save();
    ctx.globalAlpha = alpha;

    // Panel near the coordinator
    const panelW = 340;
    const panelH = 55;
    const panelX = coord.x;
    const panelY = coord.y - coord.height / 2 - 50;

    renderHintPanel(panelX, panelY, panelW, panelH);

    // Pulsing glow
    const glowBlur = 8 + Math.sin(t * 4) * 6;
    ctx.shadowColor = TUTORIAL_CONFIG.COLORS.coordinator_charge;
    ctx.shadowBlur = glowBlur;

    // [SPACE] key badge + text
    const keyW = 60;
    const textLabel = 'RECHARGE COORDINATOR';
    ctx.font = 'bold 18px monospace';
    const textW = ctx.measureText(textLabel).width;
    const totalW = keyW + 12 + textW;
    const startX = panelX - totalW / 2;
    const keyY = panelY - 14;

    renderKeyBadge(startX, keyY, 'SPACE', keyW, 22);

    ctx.fillStyle = TUTORIAL_CONFIG.COLORS.coordinator_charge;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textLabel, startX + keyW + 12, panelY + 2);

    // Arrow pointing at coordinator
    const arrowY = panelY + panelH / 2 + 5;
    const arrowAlpha = 0.5 + Math.sin(t * 5) * 0.3;
    ctx.strokeStyle = `rgba(255, 160, 0, ${arrowAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panelX - 5, arrowY);
    ctx.lineTo(panelX, arrowY + 10);
    ctx.lineTo(panelX + 5, arrowY);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
}
```

#### 7E. Call the tutorial update and render from the main loops

In `update()` at line ~16155 (near where `updateTutorial(dt)` is called), add:
```js
    // Update coordinator charge tutorial
    updateCoordChargeTutorial(dt);
```

In `render()` at line ~16346 (near where `renderTutorialHints()` is called), add:
```js
    // Render coordinator charge hint (above tutorial hints)
    renderCoordChargeHint();
```

#### 7F. Reset tutorial state on game reset

Find the game reset function (look for where `tutorialState` is set to null on new game / reset). In the game reset area (around line 10094 based on `playerInventory` reset), add:
```js
    coordChargeTutorialShown = false;
    coordChargeTutorialState = null;
```

**Testable after:** Deploying first coordinator shows a "[SPACE] RECHARGE COORDINATOR" hint near it. Hint dismisses with particles when the player first charges the coordinator.

---

### Unit 8: Integration Polish & Edge Cases

**Design sections:** All — cleanup and edge cases
**Dependencies:** All previous units

**What it does:** Fixes edge cases, ensures state consistency, and polishes integration.

#### 8A. Remove the old orange elliptical glow for coordinator charging in `UFO.renderBeam()`

Lines 4759-4768 render an orange elliptical glow when a coordinator is in the normal beam cone:
```js
            // Coordinator recharge glow
            for (const coord of activeCoordinators) {
                if (!coord.alive || coord.state === 'DEPLOYING') continue;
                if (isInBeamVisual(coord.x, coord.y)) {
                    const pulse = 0.3 + Math.sin(Date.now() / 100) * 0.1;
                    ctx.fillStyle = `rgba(255, 200, 100, ${pulse})`;
                    ctx.beginPath();
                    ctx.ellipse(coord.x, coord.y, 30, 20, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
```

This should still be present for when coordinators are in the normal beam cone (not using snap charging). However, the `isBeingCharged` glow from Unit 4B makes this redundant when snap-charging. Keep it as-is for cone-recharging — it's a weaker visual which is fine for the passive/incidental cone recharge.

#### 8B. Clear `isBeingCharged` on coordinator each frame before UFO update

In `updateCoordinators()` (line 8708), at the start, clear the flag so it's freshly set each frame by the UFO:
```js
function updateCoordinators(dt) {
    // Clear charging state - will be re-set by UFO.update() if still charging
    for (const coord of activeCoordinators) {
        if (!coord.isBeingCharged) continue; // optimization: only clear if set
        coord.isBeingCharged = false;
    }
    for (const coord of activeCoordinators) coord.update(dt);
    activeCoordinators = activeCoordinators.filter(c => c.alive);
    ...
```

**Wait — this is tricky.** The `updateCoordinators()` runs at line 16134, AFTER `ufo.update()` at line 16105. So the UFO sets `isBeingCharged` on the coord during its update, then coordinators update. The flag persists correctly within a single frame. But we need to clear it at the START of each frame cycle, before the UFO update.

Better approach: clear `isBeingCharged` at the beginning of the main `update()` function (before `ufo.update()` at line 16104):

```js
    // Clear coordinator charging flags (re-set each frame by UFO.update)
    for (const coord of activeCoordinators) coord.isBeingCharged = false;
```

#### 8C. Clear `inSnapRange` flag on coordinator each frame

Same as 8B — clear at beginning of `update()`:
```js
    for (const coord of activeCoordinators) {
        coord.isBeingCharged = false;
        coord.inSnapRange = false;
    }
```

Then the `inSnapRange` computation from Unit 4F will set it true for coordinators in range.

Actually, Unit 4F added the `inSnapRange` update inside `Coordinator.update()`, which runs after UFO.update(). This is fine — the coordinator sets its own flag based on UFO position. No need to clear/re-set from outside. Remove the 4F logic and instead compute it in `UFO.update()` alongside the snap detection (Unit 3). That way both `inSnapRange` and `isBeingCharged` are set from the same place.

**Revised approach:** In Unit 3, when the UFO checks for snap coordinators, also mark `inSnapRange` on all coordinators within range:

```js
// Inside UFO.update(), when beam logic runs:
// Mark all in-range coordinators
for (const coord of activeCoordinators) {
    if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
    coord.inSnapRange = Math.abs(coord.x - this.x) <= CONFIG.COORD_CHARGE_SNAP_RANGE;
}
```

This replaces Unit 4F entirely.

#### 8D. Game reset cleanup

In the game reset / new game code (around line 10094), ensure all new globals are reset:
```js
coordChargeTutorialShown = false;
coordChargeTutorialState = null;
```

And ensure `activeCoordinators` clearing (line 16238) handles the new properties (it does — since coordinators are just removed from the array).

**Testable after:** Full end-to-end flow works. Beam snaps to coordinators, renders charging beam, SOS rings appear, tutorial fires, all state clears properly between games.

---

## Summary of Edit Locations (ordered)

| Unit | Lines Modified | New Code Location |
|---|---|---|
| 1A | Insert after line 307 | CONFIG block |
| 1B | Insert after line 7856 | Coordinator constructor |
| 1C | Insert in TUTORIAL_CONFIG (after 376, after 385) | TUTORIAL_CONFIG |
| 2A-C | Insert after line 614 | SFX object |
| 3A | Insert after line 4609 | UFO class (new method) |
| 3B | Insert after line 4277 | UFO constructor |
| 3C | Modify lines 4324–4398 | UFO.update() beam logic |
| 3D | Modify lines 4407, 4462, 16184-16199 | Beam deactivation paths |
| 4A | Replace lines 8257–8267 | Coordinator energy bar render |
| 4B | Modify lines 8196-8221 | Coordinator glow render |
| 4C | Insert after line 8253 | Coordinator proximity highlight |
| 4D | Insert after line 7947 | Coordinator SOS update |
| 4E | Insert after line 8255 | Coordinator SOS render |
| 5A | Insert after line 4849 | UFO renderChargingBeam() |
| 5B | Modify lines 4640-4643 | UFO render() beam switch |
| 6A | Insert after renderDroneStatus() | New function |
| 6B | Insert at line 10388 | renderUI() call |
| 7A | Insert at line 3377 | New globals |
| 7B | Insert at lines 8649 and 8679 | Deploy functions |
| 7C-D | Insert after line 3741 | Tutorial update/render functions |
| 7E | Insert at lines ~16155 and ~16346 | Main loop calls |
| 7F | Insert at line ~10094 | Game reset |
| 8B | Insert before line 16104 | Main update() start |

## Conflict-Free Ordering Verification

- **Unit 1** only adds constants and properties — no logic changes, nothing to conflict with
- **Unit 2** only adds SFX functions to the SFX object — isolated section
- **Unit 3** modifies UFO.update() beam logic (4324-4398) and UFO constructor — no other unit touches these lines
- **Unit 4** modifies Coordinator.render() (8196-8267) and Coordinator.update() (7947 area) — no other unit touches these
- **Unit 5** adds renderChargingBeam() method and modifies UFO.render() (4640-4643) — no other unit touches these
- **Unit 6** adds a new standalone function and one call in renderUI() — no conflicts
- **Unit 7** adds tutorial globals, functions, and calls — isolated from all other units
- **Unit 8** adds cleanup code at the top of update() and removes Unit 4F's inSnapRange from Coordinator.update() in favor of UFO.update() — depends on Units 3 and 4

Each unit leaves game.js in a functional, playable state.
