# Phase 2 Architecture Overview
## The Definitive Blueprint for Command Phase Implementation

**Date**: 2026-02-13
**Author**: THE ARCHITECT (synthesis of all teams and oracles)
**Status**: FINAL

---

## Thesis Statement

**This game is about the distance between having power and using it with care.**

Phase 1 is being the hands. Phase 2 is becoming the eyes. The player trades the ability to DO for the obligation to DIRECT. Every mechanic serves this transformation: watching crew members do the job you just mastered, managing quotas and a terrible boss, and confronting the grief of ascending past the point where you can grab the controls.

The first slice tests one question: **"Is delegation fun in two zones?"**

---

## Emotional / Thematic North Star

Synthesized from the Oracle Council:

- **The UFOologist**: The promotion is an abduction of the self. The player's consciousness is extracted from the operational layer and placed into the observation layer. Emergency Override is descension -- the higher being breaking protocol to inhabit the lower plane, and being punished for it.

- **The Anime/Games Oracle**: This is the NERV command center. The player is Misato watching children fight Angels. The Director is Gendo -- terrifying through stillness. The Director's Kid is Shinji -- broken, resistant, and potentially the most powerful force in the game if someone invests in them.

- **The Hippie**: The game is about grief. Not sadness-grief, but the grief of becoming something new and knowing you can never go back. The Emergency Override is a prayer: "I can still do this. I haven't lost it." And the 15 seconds tick by too fast.

- **The Senior Engineer**: Cut the philosophy. Build it in order, play it every day, resist the urge to build Phase 3 before Phase 2 works.

All four are correct simultaneously. The architecture must serve both the soul and the schedule.

---

## High-Level System Diagram

```
                     index.html
                         |
              +----------+----------+
              |                     |
          js/game.js          js/phase2/ (NEW)
          (27k lines)         (16 files, ~3500 lines total)
          UNTOUCHED           PHASE 2 CODE
          except 3 hooks
              |                     |
              +----------+----------+
                         |
                    Shared Globals
                 (canvas, ctx, SFX,
                  renderNGEPanel, etc.)


  === PHASE 2 MODULE DEPENDENCY GRAPH ===

  command-config.js -----> (no deps, loaded first)
         |
         v
  zone-state.js ---------> (depends on config)
         |
         v
  crew-system.js --------> (depends on config)
         |
         v
  crew-ai.js ------------> (depends on crew-system, zone-state)
         |
         v
  zone-simulation.js ----> (depends on zone-state, crew-ai, config)
         |
         v
  crew-renderer.js ------> (depends on crew-system, game.js globals)
         |
         v
  director-system.js ----> (depends on config)
         |
         v
  director-renderer.js --> (depends on director-system, game.js globals)
         |
         v
  resource-pipeline.js --> (depends on zone-state, config)
         |
         v
  zone-renderer.js ------> (depends on zone-state, crew-renderer, game.js globals)
         |
         v
  command-hud.js --------> (depends on zone-renderer, crew-renderer,
         |                   director-renderer, game.js globals)
         v
  command-summary.js ----> (depends on director-system, command-hud)
         |
         v
  command-boot.js -------> (depends on game.js boot patterns)
         |
         v
  promotion-cinematic.js > (depends on director-renderer, command-boot)
         |
         v
  emergency-override.js -> (depends on zone-state, game.js input)
         |
         v
  command-main.js -------> (depends on EVERYTHING, loaded LAST)
                            (this is the ONLY file that touches game.js globals)
```

---

## Folder Structure

```
js/
  game.js                           # Existing 27k-line monolith (3 hooks added)
  changelog.js                      # Existing
  phase2/                           # NEW - all Phase 2 code
    command-config.js               # Shared constants, color palette, timing values
    zone-state.js                   # ZoneState class - per-zone game state container
    zone-simulation.js              # Simplified Phase 1 update loop per zone
    crew-system.js                  # CrewMember, CrewRoster, trait definitions
    crew-ai.js                      # AI decision engine for crew-operated UFOs
    crew-renderer.js                # Canvas-drawn alien crew portraits at multiple scales
    director-system.js              # THE DIRECTOR - mood, approval, report cards, dialogue
    director-renderer.js            # Director portrait, transmission visuals
    resource-pipeline.js            # Cross-zone resource sharing and transfers
    command-hud.js                  # Command HUD layout engine + panel rendering
    zone-renderer.js                # Mini-battlefield rendering inside zone panels
    command-summary.js              # Between-wave report card + optional decision
    command-boot.js                 # Gold-themed boot sequence for command panels
    promotion-cinematic.js          # 10-second promotion cinematic sequence
    emergency-override.js           # Manual zone takeover - zoom in/out, Phase 1 controls
    command-main.js                 # Master orchestrator - update/render loops, state machine
```

---

## Integration with Phase 1: The 3 Hooks in game.js

Phase 2 lives entirely in its own folder. The monolith `game.js` requires exactly **3 small changes** totaling ~30 lines:

### Hook 1: Game Loop Extension (line ~26598)
Add cases to the `gameLoop()` switch statement:

```javascript
case 'PROMOTION_CINEMATIC':
    updatePromotionCinematic(dt);
    renderPromotionCinematic();
    break;
case 'COMMAND':
    updateCommand(dt);
    renderCommand();
    break;
case 'COMMAND_SUMMARY':
    updateCommandSummary(dt);
    renderCommandSummary();
    break;
```

### Hook 2: Promotion Trigger (line ~26857, after quota check)
After the wave-end quota handling, before `startWaveSummary()`:

```javascript
if (techTree.researched.size === 15 && !commandPhaseActive) {
    commandPhaseActive = true;
    gameState = 'PROMOTION_CINEMATIC';
    initPromotionCinematic();
    return;
}
```

### Hook 3: Script Tags in index.html
Add 16 `<script>` tags after `js/game.js`, loading Phase 2 files in dependency order.

**Rule**: `command-main.js` is the ONLY Phase 2 file that reads or writes game.js globals (`gameState`, `score`, `bioMatter`, `techTree`, `harvestCount`, `wave`). All other Phase 2 modules are isolated.

---

## Technology Decisions and Constraints

1. **Vanilla JavaScript only.** No frameworks, no bundlers, no module systems. All files loaded via `<script>` tags in the global scope, same as game.js.

2. **Canvas 2D API only.** No WebGL, no off-screen workers. All rendering through the shared `ctx` global from game.js.

3. **Reuse game.js rendering utilities directly.** `renderNGEPanel()`, `renderNGEBar()`, `renderNGEStatusDot()`, `renderNGEIndicator()`, `renderHexDecodeText()`, `renderNGEScanlines()`, `renderEnergyFlowLine()`, `hexToRgb()`, `CountUpAnimation`, `SFX` -- all accessible as globals.

4. **New zone simulation, not refactored Phase 1.** The Phase 1 `update()` function reads/writes 30+ global variables. Rather than refactoring it, we write new simplified zone simulation functions that operate on `ZoneState` objects. Zone sim is Phase 1 minus features (no powerups, no warp juke, no coordinators, no tutorial), not a different game.

5. **Performance budget: 60fps on 2020 laptop.** At 2 zones, estimated ~700 draw calls per frame (Phase 1 already does ~800). Well within budget. No off-screen canvas optimization needed for the first slice.

6. **No event bus for first slice.** Direct function calls through `CommandPhaseState`. Five systems talking through one coordinator. Add decoupling only if/when we scale to 16 zones.

7. **No save/load for first slice.** Command phase is a single-session experience. If the player closes the tab, they restart from Phase 1 and re-trigger promotion.

---

## First Slice vs Future Slices

### First Slice (THIS BUILD)
Tests: "Is delegation fun in two zones?"

| Feature | Scope |
|---------|-------|
| Promotion trigger | Detect `techTree.researched.size === 15`, fire cinematic |
| Promotion cinematic | Director voice + camera zoom + flash (10 seconds) |
| 2-zone layout | Split screen with command panels below |
| Zone simulation | Simplified Phase 1 per zone (targets, tanks, AI UFO) |
| 1 crew member per zone | Single trait axis: Reckless <-> Cautious |
| Quota management | Per-zone quotas, target band system (rolling 3-wave avg) |
| THE DIRECTOR | Portrait, scripted transmissions, report cards (2-3 options) |
| Emergency Override | 1 manual takeover per wave, 15 seconds, Director disapproval |
| Command status bar | Wave number, quota progress, score, timer |
| Between-wave summary | Report card + crew assignment (swap zones) |

### Deferred to Slice 2
- Training wave (3-task structured onboarding)
- Interview system and coaching depth
- Director mood system (dynamic, not scripted)
- Additional personality traits beyond Reckless/Cautious
- Policy presets and decision queue
- Director's Kid narrative arc

### Deferred to Later Slices
- 4-zone expansion (2x2 grid + sidebar)
- 16-zone expansion (heatmap + focus view)
- Full specialization tracks (Engineering/People/Politics)
- Shift scheduling and stamina system
- Crisis system (boss assault, equipment failure, crew breakdown, surprise inspection)
- Equipment wear and scheduled inspections
- Cascading quotas and quota negotiation
- Commander ghost easter egg

---

## State Coexistence: Phase 1 and Phase 2

Phase 1 state persists into Phase 2. Phase 2 adds new state but never overwrites Phase 1 state:

| Resource | Phase 1 Variable | Phase 2 Behavior |
|----------|-----------------|-------------------|
| Score | `score` (line 3038) | Continues accumulating from zone performance |
| Bio-matter | `bioMatter` (line 3206) | Shared pool, zones generate into it |
| Tech tree | `techTree.researched` (line 3213) | All 15 techs remain active, affect zone sims |
| Harvest count | `harvestCount` (line 3132) | Keeps accumulating = "total abductions" counter |
| Wave counter | `wave` (line 3110) | Frozen at promotion value; Phase 2 uses `commandWave` |
| Canvas/ctx | `canvas`, `ctx` (lines 3004-3005) | Shared rendering context |
| Audio | `audioCtx` (line 451) | Shared; new SFX methods added to global `SFX` |

---

## Command Phase State Machine

```
PLAYING (Phase 1)
    |
    +--- [techTree.researched.size === 15] ---> PROMOTION_CINEMATIC
                                                      |
                                                      +---> COMMAND (live wave)
                                                              |
                                                              +-- [waveTimer <= 0] --> COMMAND_SUMMARY
                                                              |                           |
                                                              |                           +---> COMMAND (next wave)
                                                              |
                                                              +-- [override] --> COMMAND (sub-state: override)
                                                                                   |
                                                                                   +-- [15s elapsed] --> COMMAND (normal)
```

The top-level `gameState` variable handles the major transitions. Within `COMMAND`, the `command-main.js` manages its own internal sub-state (`commandSubState: 'LIVE' | 'OVERRIDE' | 'BOOT'`) to keep the main game loop switch clean.

---

## Rendering Pipeline (Command Phase)

```
1.  ctx.clearRect(0, 0, canvas.width, canvas.height)
2.  FOR each zone:
      a. ctx.save()
      b. ctx.clip() to zone rectangle
      c. Render mini-starfield, ground, targets, tanks, crew UFO, beam, particles
      d. ctx.restore()
      e. Render zone status bar (below zone, outside clip)
      f. Render zone border + pulse effect
      g. Render crew glyph (corner)
3.  Render resource flow particles (between zones)
4.  Render command status bar (top)
5.  Render sidebar panels (crew roster, resources, orders)
6.  Render Director channel (when active, includes screen tint)
7.  Render overlay panels (report card, tech tree when opened)
8.  Render alert notifications (top layer)
9.  Render global effects (override flash, boot overlays)
10. Render global scanlines
```

Each zone is rendered in its own clipped region to prevent content bleed between adjacent zones.

---

## Agent Parallelization Strategy

The entire point of the folder structure is that 3-4 agents work simultaneously:

| Agent | Files Owned | Can Start |
|-------|------------|-----------|
| Agent 1: Zone Simulation | `zone-state.js`, `zone-simulation.js` | Day 1 |
| Agent 2: Crew & Director | `crew-system.js`, `crew-ai.js`, `director-system.js` | Day 1 |
| Agent 3: Rendering & HUD | `crew-renderer.js`, `director-renderer.js`, `zone-renderer.js`, `command-hud.js`, `command-boot.js`, `promotion-cinematic.js`, `command-summary.js` | Day 1 (layout), Day 3 (content) |
| Agent 4: Integration | `command-config.js`, `resource-pipeline.js`, `emergency-override.js`, `command-main.js`, game.js hooks | Day 1 (scaffold), Day 5 (integration) |

**No file is touched by more than one agent.** Interfaces are defined in `06-module-specs.md`. Agents code to interfaces, not implementations. Integration happens when Agent 4 wires the modules together.

---

## Key Decisions Log

| Decision | Rationale |
|----------|-----------|
| New folder `js/phase2/` not `js/command/` | "phase2" is clearer for future phases (phase3, etc.) |
| Rewrite zone sim, don't extract Phase 1 | Phase 1 functions are globally coupled; extraction is riskier than rewrite |
| Single trait axis for first slice | Reckless/Cautious is enough to prove AI feels different |
| Scripted Director, not dynamic mood | Dynamic mood requires balancing; scripted reactions prove the emotional beat |
| No event bus | 5 systems, 1 coordinator. Direct calls. Add bus only at 16-zone scale |
| Sub-state in command-main.js | Keeps game.js's gameLoop switch clean; Phase 2 manages its own flow |
| Command gold (#d4a017) as Phase 2 identity color | Distinct from Phase 1 cyan; represents player authority |
| Director red (#a00) reserved exclusively | Only appears when Director is involved; Pavlovian dread response |
