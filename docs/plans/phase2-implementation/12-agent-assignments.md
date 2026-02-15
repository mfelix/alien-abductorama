# Phase 2 Agent Assignments
## File Ownership, Interfaces, and Coordination Rules

**Date**: 2026-02-13
**Status**: FINAL

---

## I. AGENT ROSTER

| Agent | Domain | Primary Skill |
|-------|--------|--------------|
| Agent 1 | Zone Simulation | Game state, physics, AI integration |
| Agent 2 | Crew & Director | Data modeling, AI behavior, dialogue systems |
| Agent 3 | Rendering & HUD | Canvas 2D, layout, animation, visual polish |
| Agent 4 | Integration | State machine, input handling, game.js glue, orchestration |

---

## II. FILE OWNERSHIP

### No file is touched by more than one agent.

| File | Owner | Size Est. | Phase |
|------|-------|-----------|-------|
| `command-config.js` | Agent 4 | ~120 lines | Phase 1 (Day 1) |
| `zone-state.js` | Agent 1 | ~130 lines | Phase 1 (Day 1) |
| `zone-simulation.js` | Agent 1 | ~500 lines | Phase 2-3 (Day 1-3) |
| `crew-system.js` | Agent 2 | ~200 lines | Phase 1 (Day 1) |
| `crew-ai.js` | Agent 2 | ~220 lines | Phase 3 (Day 2-3) |
| `crew-renderer.js` | Agent 3 | ~300 lines | Phase 5 (Day 4-5) |
| `director-system.js` | Agent 2 | ~350 lines | Phase 4 (Day 3-4) |
| `director-renderer.js` | Agent 3 | ~350 lines | Phase 4 (Day 3-4) |
| `resource-pipeline.js` | Agent 4 | ~100 lines | Phase 8 (Day 6-7) |
| `command-hud.js` | Agent 3 | ~500 lines | Phase 5 (Day 4-5) |
| `zone-renderer.js` | Agent 3 | ~400 lines | Phase 2 (Day 1-2) |
| `command-summary.js` | Agent 3 | ~300 lines | Phase 4 (Day 3-4) |
| `command-boot.js` | Agent 3 | ~200 lines | Phase 7 (Day 5-6) |
| `promotion-cinematic.js` | Agent 3 | ~350 lines | Phase 7 (Day 5-6) |
| `emergency-override.js` | Agent 4 | ~200 lines | Phase 6 (Day 5) |
| `command-main.js` | Agent 4 | ~300 lines | Phase 1+ (Day 1-7) |

**Total**: ~4,520 lines across 16 files.

### game.js Changes (Agent 4 ONLY)

Agent 4 is the ONLY agent that touches `game.js`. Changes are exactly 3 hooks:

1. **Game loop extension** (~10 lines): Add PROMOTION_CINEMATIC, COMMAND, COMMAND_SUMMARY cases to `gameLoop()` switch at ~line 26598.

2. **Promotion trigger** (~6 lines): Add `techTree.researched.size === 15` check after wave-end quota handling at ~line 26857.

3. **Script tags** (~16 lines): Add `<script>` tags to `index.html` after `game.js`, in dependency order.

### index.html Changes (Agent 4 ONLY)

Add 16 script tags after `<script src="js/game.js"></script>`:

```html
<!-- Phase 2: Command Phase -->
<script src="js/phase2/command-config.js"></script>
<script src="js/phase2/zone-state.js"></script>
<script src="js/phase2/crew-system.js"></script>
<script src="js/phase2/crew-ai.js"></script>
<script src="js/phase2/zone-simulation.js"></script>
<script src="js/phase2/crew-renderer.js"></script>
<script src="js/phase2/director-system.js"></script>
<script src="js/phase2/director-renderer.js"></script>
<script src="js/phase2/resource-pipeline.js"></script>
<script src="js/phase2/zone-renderer.js"></script>
<script src="js/phase2/command-hud.js"></script>
<script src="js/phase2/command-summary.js"></script>
<script src="js/phase2/command-boot.js"></script>
<script src="js/phase2/promotion-cinematic.js"></script>
<script src="js/phase2/emergency-override.js"></script>
<script src="js/phase2/command-main.js"></script>
```

---

## III. INTERFACES BETWEEN AGENTS

### Agent 1 -> Agent 2 Interface

Agent 1's `zone-simulation.js` calls Agent 2's `crew-ai.js`:

```javascript
// Agent 1 calls this every frame per zone:
const inputs = zone.crewAI.getInputs(zone);
// Returns: { ArrowLeft: bool, ArrowRight: bool, Space: bool }
```

**Contract**: `getInputs()` MUST return a plain object with those three boolean keys. It MUST be deterministic given the same zone state (modulo random mistakes). It MUST NOT modify zone state.

### Agent 1 -> Agent 3 Interface

Agent 3's `zone-renderer.js` reads Agent 1's `ZoneState`:

```javascript
// Agent 3 reads these ZoneState properties:
zone.targets[]       // Read for rendering
zone.tanks[]         // Read for rendering
zone.projectiles[]   // Read for rendering
zone.particles[]     // Read for rendering
zone.crewUfo         // Read for rendering (x, y, beamActive, beamTarget, energy, health)
zone.quota           // Read for status strip
zone.driftTimer      // Read for drift bar
zone.driftLevel      // Read for decay filter
zone.state           // Read for border color
zone.name            // Read for header text
zone.starPositions   // Read for starfield
```

**Contract**: Agent 3 MUST NOT write to any ZoneState property. Read only. Agent 1 MUST ensure all properties listed above are populated before the first render frame.

### Agent 2 -> Agent 3 Interface

Agent 3's `crew-renderer.js` reads Agent 2's `CrewMember`:

```javascript
// Agent 3 reads:
crew.name            // For name label
crew.traits          // For head shape and skin color
crew.morale          // For morale aura, eye expression
crew.stamina         // For burnout check
crew.performance     // For sparkline (future)
crew.appearance      // For skin color, eye size
```

Agent 3's `director-renderer.js` reads Agent 2's `Director`:

```javascript
// Agent 3 reads:
director.mood        // For portrait eye glow, mouth, border
director.approval    // For mood bar display
director.isTransmitting // For screen effect
director.currentDialogue // For typewriter text
director.dialogueProgress // For typewriter position
```

**Contract**: Agent 3 MUST NOT write to CrewMember or Director properties. Agent 2 MUST provide getter methods for any computed values (e.g., `getMood()`, `getTraitLabel()`).

### Agent 2 -> Agent 4 Interface

Agent 4's `command-main.js` calls Agent 2's `Director`:

```javascript
director.generateReportCard(zoneResults)   // Returns ReportCard object
director.applyDialogueChoice(index, card)  // Mutates approval
director.getQuotaTarget(commandWave)       // Returns number
director.updateApproval(delta)             // Mutates approval
director.getWaveStartDialogue()            // Returns string
director.getOverrideDialogue()             // Returns string
```

**Contract**: All Director methods MUST be synchronous. `generateReportCard()` MUST return a complete ReportCard object (see data-structures.md). `applyDialogueChoice()` MUST update approval and mood immediately.

### Agent 4 -> All Interface

Agent 4's `command-main.js` orchestrates everything:

```javascript
// Agent 4 calls per frame:
zoneUpdate(zone, dt, isFocused)          // Agent 1
pipeline.update(dt)                       // Agent 4 (own code)
renderCommand()                           // Agent 4 delegates to:
  renderZonePanel(...)                    // Agent 3
  renderCommandHUD(commandState)          // Agent 3
  renderDirectorChannelPanel(...)         // Agent 3
  renderDirectorScreenEffect(active)      // Agent 3
  renderCommandBoot()                     // Agent 3
  renderOverrideTransition()              // Agent 4

// Agent 4 calls at wave transitions:
startCommandSummary(waveData)             // Agent 3
director.generateReportCard(zoneResults)  // Agent 2
zone.reset()                              // Agent 1
zone.assignCrew(crewMember)              // Agent 1
initCommandBoot()                         // Agent 3
```

**Contract**: Agent 4 is the ONLY caller of update/render orchestration functions. Other agents MUST NOT call each other's top-level functions. All inter-agent communication flows through `commandState`.

---

## IV. AGENT TASK BREAKDOWN

### Agent 1: Zone Simulation

**Day 1**:
- [ ] Write `zone-state.js` (ZoneState class, all properties, reset(), getStatus(), assignCrew())
- [ ] Start `zone-simulation.js` (target spawning, target wandering, zone bounds)

**Day 1-2**:
- [ ] Tank spawning, movement, firing, turret aiming
- [ ] Projectile creation, movement, bounds checking
- [ ] UFO movement from AI inputs (or temp keyboard)
- [ ] Beam system (target acquisition, abduction progress, energy drain/recharge)
- [ ] Collision detection (projectile-UFO, projectile-tank-not-needed)
- [ ] Quota tracking

**Day 2-3**:
- [ ] Connect CrewAI inputs (replace temp keyboard)
- [ ] Activate Zone B (second zone with its own state)
- [ ] Drift timer system (countdown, drift level escalation, recovery)
- [ ] Performance degradation from drift (apply to AI decision quality)

**Day 4-7**:
- [ ] Tune entity spawning rates
- [ ] Tune tank difficulty scaling
- [ ] Balance drift timer (target: switch attention every ~15-20 seconds)
- [ ] Bug fixes from integration testing

**Spec documents to reference**:
- `08-game-systems-spec.md` Section I (Zone Simulation)
- `11-data-structures.md` Sections II (ZoneState), III (targets/tanks/projectiles)
- `06-module-specs.md` Files 2, 3

### Agent 2: Crew & Director

**Day 1**:
- [ ] Write `crew-system.js` (CrewMember class, CrewRoster class, name pool, trait definitions)
- [ ] Write `generateStartingCrew()` (2 crew: 1 reckless, 1 cautious)

**Day 2-3**:
- [ ] Write `crew-ai.js` (CrewAI class, decision cycle, target selection, threat assessment)
- [ ] Implement movement decisions (reckless vs cautious behavior)
- [ ] Implement beam decisions (energy threshold based on trait)
- [ ] Implement mistake system (10% chance, 3 mistake types)
- [ ] Implement fleet order modifiers (defensive/balanced/harvest)

**Day 3-4**:
- [ ] Write `director-system.js` (Director class, approval tracking, mood computation)
- [ ] Implement report card generation (dialogue selection, option generation)
- [ ] Implement dialogue choice consequences (approval changes)
- [ ] Implement quota target band system (rolling avg, surge, recovery)
- [ ] Write all Director dialogue (reference `09-narrative-spec.md`)

**Day 5-7**:
- [ ] Morale system tuning (per-wave changes feel balanced)
- [ ] Stamina system (drain + bench recovery)
- [ ] AI behavior tuning (reckless and cautious must look DIFFERENT)
- [ ] Director approval balance (too easy to satisfy? too harsh?)
- [ ] Quota balance (achievable but pressured)

**Spec documents to reference**:
- `08-game-systems-spec.md` Sections II (Crew AI), III (Quota), IV (Director), V (Crew)
- `09-narrative-spec.md` All Director dialogue
- `11-data-structures.md` Sections III-VI (Crew, AI, Director)
- `06-module-specs.md` Files 4, 5, 7

### Agent 3: Rendering & HUD

**Day 1**:
- [ ] Write `command-hud.js` layout engine: `getCommandHUDLayout(2)` returning all rectangles
- [ ] Start `zone-renderer.js`: mini starfield, mini ground plane

**Day 1-2**:
- [ ] Complete `zone-renderer.js`: mini UFO, mini tanks, mini targets, mini beam
- [ ] Zone status strip rendering
- [ ] Zone border rendering with state colors
- [ ] Dual-zone layout (both zones side by side)

**Day 3-4**:
- [ ] Write `director-renderer.js`: Director portrait (gray-blue skin, large eyes, ridges)
- [ ] Director transmission panel (crimson background, typewriter)
- [ ] Director screen effect (red overlay + heartbeat pulse)
- [ ] Write `command-summary.js`: report card reveal sequence, dialogue options, crew swap UI
- [ ] Report card panel layout and rendering

**Day 4-5**:
- [ ] Complete `command-hud.js`: CMD.STATUS bar, CREW.ROSTER, RES.FLOW, ORDERS, DIR.CHANNEL
- [ ] Write `crew-renderer.js`: glyph mode, portrait mode, eye expressions
- [ ] Zone decay visual effects (desaturation, static, tears)

**Day 5-6**:
- [ ] Write `promotion-cinematic.js`: Phase A (call), Phase B (zoom), Phase C (flash), Phase D (settling)
- [ ] Write `command-boot.js`: gold-themed boot overlays, diagnostic text
- [ ] Override visual polish: flash text, timer, warning, zoom overlay

**Day 6-7**:
- [ ] Resource flow particle rendering
- [ ] Visual polish pass (alignment, timing, glow effects)
- [ ] Performance profiling (draw call budget)

**Spec documents to reference**:
- `07-visual-specs.md` ALL sections (this is the primary spec for Agent 3)
- `11-data-structures.md` Sections IX (boot state), X (cinematic state)
- `06-module-specs.md` Files 6, 8, 10, 11, 12, 13, 14

### Agent 4: Integration

**Day 1**:
- [ ] Write `command-config.js` (ALL constants from `11-data-structures.md` Section XI)
- [ ] Add 3 hooks to `game.js`:
  - Game loop cases for PROMOTION_CINEMATIC, COMMAND, COMMAND_SUMMARY
  - Promotion trigger after wave-end quota check
  - Declare `commandPhaseActive` global
- [ ] Add 16 script tags to `index.html`
- [ ] Write `command-main.js` scaffold (commandState creation, empty update/render)

**Day 2-3**:
- [ ] Wire dual zones in `command-main.js`: iterate zones in updateCommand
- [ ] Wire wave timer countdown
- [ ] Wire zone selection input (Tab/1/2)
- [ ] Wire fleet order input (D/H/B)
- [ ] Wire `selectedZone` focus for drift timer

**Day 3-4**:
- [ ] Wire wave lifecycle: endCommandWave(), startNextWave()
- [ ] Wire COMMAND_SUMMARY state transitions
- [ ] Wire Director report card into wave-end flow
- [ ] Wire score/bioMatter/harvestCount updates to game.js globals

**Day 5**:
- [ ] Write `emergency-override.js`: zoom in/out transitions, input routing, timer
- [ ] Wire override in `command-main.js`: O key, subState transitions
- [ ] Wire Director disapproval after override

**Day 5-6**:
- [ ] Wire promotion cinematic trigger in command-main.js
- [ ] Wire commandState creation during cinematic

**Day 6-7**:
- [ ] Write `resource-pipeline.js`: transfers, transit loss, delay
- [ ] Wire resource routing input (R key)
- [ ] Full integration testing
- [ ] Performance profiling
- [ ] Edge case handling (wave end during override, zero energy, etc.)

**Spec documents to reference**:
- `05-architecture-overview.md` (integration hooks, state machine)
- `08-game-systems-spec.md` Sections VII-IX (override, state machine, wave lifecycle)
- `11-data-structures.md` Sections I (commandState), VII-VIII (pipeline, override)
- `06-module-specs.md` Files 1, 9, 15, 16

---

## V. COORDINATION RULES

### Rule 1: Code to Interfaces, Not Implementations

Each agent implements their module to match the public interface defined in `06-module-specs.md`. Do NOT assume internal implementation details of another agent's code. If you need data from another module, use only the documented public API.

### Rule 2: No Cross-Agent File Edits

If you need a change in another agent's file, coordinate through Agent 4 (Integration). Agent 4 can add adapter code in `command-main.js` if interfaces don't align.

### Rule 3: Test in Isolation First

Each module should be testable in isolation:
- Agent 1: Zone simulation can run with a mock keyboard input (hardcoded AI decisions)
- Agent 2: Director can generate report cards from hardcoded zone results
- Agent 3: Zone renderer can draw from a hardcoded ZoneState with dummy data
- Agent 4: command-main.js can call stubs for all module functions initially

### Rule 4: Agent 4 Is The Integrator

Agent 4 resolves all integration issues. If two modules don't connect cleanly, Agent 4 writes adapter code in `command-main.js`. Other agents do NOT add compatibility shims to their own code.

### Rule 5: Constants Live in command-config.js

No hardcoded numbers in individual modules. All tunable values go through `COMMAND_CONFIG`. If you need a new constant, tell Agent 4 to add it to the config.

### Rule 6: State Flows Through commandState

All inter-module state passes through the `commandState` object. No module-to-module globals. No hidden shared state. `commandState` is the single source of truth.

---

## VI. COMMUNICATION PROTOCOL

### Daily Sync Points

1. **After Phase 2 (Day 2)**: Agent 1 + Agent 3 verify zone rendering works with zone simulation data
2. **After Phase 3 (Day 3)**: ALL agents verify dual-zone + AI is playable. CRITICAL PLAYTEST.
3. **After Phase 5 (Day 5)**: ALL agents verify full HUD + drift + fleet orders work together
4. **After Phase 7 (Day 6)**: Full flow from Phase 1 -> promotion -> command phase verified
5. **Phase 9 (Day 7)**: All agents available for integration testing and bug fixes

### Conflict Resolution

If Agent A's output doesn't match what Agent B expects:
1. Check the interface spec in `06-module-specs.md`
2. If spec is ambiguous, Agent 4 decides
3. Agent 4 writes adapter code if needed
4. Update the spec for clarity

---

## VII. DONE CRITERIA

### Per-Module Done

A module is "done" when:
- [ ] All public interface functions exist and work
- [ ] All properties match `11-data-structures.md` shapes
- [ ] No console errors when called with valid inputs
- [ ] Handles edge cases (null inputs, empty arrays, out-of-bounds values)
- [ ] Uses `COMMAND_CONFIG` for all tunable values
- [ ] Does NOT read/write game.js globals (except command-main.js)

### System Done

The system is "done" when:
- [ ] Complete Phase 1 -> promotion -> command phase flow works
- [ ] 5+ command waves play without errors
- [ ] Director report cards display and respond correctly
- [ ] AI UFOs are visibly different based on traits
- [ ] Emergency override works end-to-end
- [ ] Drift timer creates real urgency
- [ ] 60fps on target hardware
- [ ] The core question has a positive answer: **"Is delegation fun in two zones?"**

---

*This document defines who builds what, how modules communicate, and what "done" means. Agents should start with their Phase 1 tasks immediately and reference the spec documents listed for each task. All work flows through interfaces. No file is shared. Agent 4 integrates.*
