# Phase 2 Build Order
## Exact Implementation Sequence with Parallel Work Streams

**Date**: 2026-02-13
**Status**: FINAL

---

## Guiding Principle

**Play it every day.** The build order prioritizes getting SOMETHING on screen as early as possible. Every phase ends with a playable state. Resist the urge to build Phase 3 before Phase 2 works.

---

## Phase 1: Foundation (Day 1)
### Goal: Config file + empty scaffolds + game.js hooks

**ALL agents work on this simultaneously.**

| Agent | Task | Output | Duration |
|-------|------|--------|----------|
| Agent 4 | Write `command-config.js` with ALL constants | Complete config object | 1 hour |
| Agent 4 | Add 3 hooks to `game.js` (game loop cases, promotion trigger, script tags in index.html) | Working state transitions | 1 hour |
| Agent 1 | Write `zone-state.js` (ZoneState class, all properties, reset/status methods) | Data container, no logic | 1 hour |
| Agent 2 | Write `crew-system.js` (CrewMember, CrewRoster, name pool, trait definitions) | Data classes, no rendering | 1 hour |
| Agent 3 | Write `command-hud.js` skeleton (layout engine only: `getCommandHUDLayout(2)`) | Returns layout rectangles | 1 hour |
| Agent 4 | Write `command-main.js` skeleton (commandState object, empty update/render) | Game enters COMMAND state but shows nothing | 1 hour |

**End of Phase 1**: Game can transition to COMMAND state. Screen is black. All data structures exist.

### Quality Gate

```
- [ ] game.js has 3 hooks (gameLoop cases, promotion trigger, script tags)
- [ ] gameState = 'COMMAND' after all 15 techs researched
- [ ] command-config.js loads without errors
- [ ] zone-state.js creates ZoneState instances
- [ ] crew-system.js creates CrewMember instances
- [ ] command-hud.js returns valid layout rectangles
- [ ] No console errors on state transition
```

---

## Phase 2: Zone Simulation Core (Day 1-2)
### Goal: One zone updating and rendering (no AI yet, keyboard-driven)

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 1 | Write `zone-simulation.js` core: target spawning, wandering, tank spawning, tank movement, tank firing, projectile update, collision detection | zone-state.js | 4 hours |
| Agent 1 | Write beam system in zone-simulation.js: target acquisition, abduction progress, energy drain/recharge | zone-state.js | 2 hours |
| Agent 3 | Write `zone-renderer.js`: mini starfield, mini ground, mini UFO, mini tanks, mini targets, mini beam, zone panel border, status strip | zone-state.js, command-hud.js | 4 hours |

**Temporary keyboard control**: During this phase, Agent 1 connects Zone A's UFO directly to `keys[]` for testing. This temporary code is removed when CrewAI is connected in Phase 3.

**End of Phase 2**: Player can transition to COMMAND state and see Zone A with entities moving, beam working, and quota counting. Zone B is empty/dark.

### Quality Gate

```
- [ ] Targets spawn and wander in Zone A
- [ ] Tanks spawn, move, and fire at UFO
- [ ] Beam system works (energy drain, target acquisition, abduction)
- [ ] Projectile-UFO collisions work
- [ ] Zone panel renders with correct border and status strip
- [ ] 60fps maintained with 1 active zone
```

---

## Phase 3: Crew AI + Dual Zones (Day 2-3)
### Goal: Two zones running simultaneously with AI-driven UFOs

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 2 | Write `crew-ai.js`: decision cycle, target selection, threat assessment, movement decisions, beam decisions, mistakes, fleet order modifiers | zone-state.js, crew-system.js | 3 hours |
| Agent 1 | Connect CrewAI to zone simulation: replace temp keyboard input with AI inputs | crew-ai.js, zone-simulation.js | 1 hour |
| Agent 1 | Zone B activation: duplicate zone sim for second zone | zone-state.js | 1 hour |
| Agent 3 | Dual-zone rendering: render both zone panels side by side | zone-renderer.js, command-hud.js | 2 hours |
| Agent 4 | Wire dual zones in `command-main.js`: updateCommand iterates both zones, waveTimer countdown, basic zone selection (Tab/1/2) | All above | 2 hours |

**End of Phase 3**: TWO zones running with AI-driven UFOs. Player can select zones. Reckless and cautious AI visibly different. Wave timer counts down. THIS IS THE CORE DELEGATION EXPERIENCE.

### Quality Gate

```
- [ ] Zone A has reckless-leaning AI, Zone B has cautious-leaning AI
- [ ] AI behaviors are visibly different (reckless = aggressive, cautious = conservative)
- [ ] Both zones simulate simultaneously at 60fps
- [ ] Zone selection (Tab/1/2) changes focused zone
- [ ] Focused zone has visual highlight
- [ ] Wave timer counts down from 60 seconds
- [ ] Quota tracks per zone
```

**CRITICAL PLAYTEST**: At this point, answer the question: **"Is watching AI-driven UFOs in two zones interesting?"** If no, stop and redesign. Everything else depends on this being fun.

---

## Phase 4: Wave Lifecycle + Director (Day 3-4)
### Goal: Complete wave loop with Director report cards

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 2 | Write `director-system.js`: Director class, approval tracking, mood computation, report card generation, dialogue option generation, quota target band system | command-config.js | 4 hours |
| Agent 3 | Write `director-renderer.js`: Director portrait, transmission panel, screen effect, report card overlay | director-system.js | 4 hours |
| Agent 3 | Write `command-summary.js`: report card reveal sequence, dialogue response selection, crew swap interface | director-system.js, director-renderer.js | 3 hours |
| Agent 4 | Wire wave lifecycle in `command-main.js`: endCommandWave(), startNextWave(), COMMAND_SUMMARY transitions | All above | 2 hours |

**End of Phase 4**: Complete wave loop. Wave runs -> timer expires -> Director report card appears -> player responds -> crew management -> next wave starts. The management loop is REAL.

### Quality Gate

```
- [ ] Wave ends when timer reaches 0
- [ ] Director report card shows zone-by-zone results
- [ ] Director dialogue typewriters at 15 chars/sec in #f44
- [ ] Three response options selectable with 1/2/3 keys
- [ ] Approval changes based on choice
- [ ] Director mood reflects approval (portrait changes)
- [ ] Crew swap works during management phase
- [ ] Enter/Space starts next wave
- [ ] Quota adjusts based on target band system
```

---

## Phase 5: Command HUD + Drift (Day 4-5)
### Goal: Full command HUD with all sidebar panels and drift system

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 3 | Complete `command-hud.js`: CMD.STATUS bar, CREW.ROSTER panel, RES.FLOW panel, ORDERS panel, DIR.CHANNEL panel | crew-renderer.js, director-renderer.js | 4 hours |
| Agent 3 | Write `crew-renderer.js`: glyph mode, portrait mode, eye expressions, morale colors, skin colors | crew-system.js | 3 hours |
| Agent 1 | Implement drift system in zone-simulation.js: driftTimer countdown, driftLevel escalation, performance degradation, visual decay levels | zone-state.js | 2 hours |
| Agent 3 | Implement decay visuals in zone-renderer.js: desaturation, static noise, horizontal tears | zone-renderer.js | 2 hours |
| Agent 4 | Wire fleet orders (D/H/B keys) and zone focus in command-main.js | command-hud.js, crew-ai.js | 1 hour |

**End of Phase 5**: Full command HUD visible. All sidebar panels rendering. Drift timer creates urgency. Fleet orders change AI behavior. Player feels like they're in a command center.

### Quality Gate

```
- [ ] CMD.STATUS shows wave, score, quota, timer, CP
- [ ] CREW.ROSTER shows both crew with portraits, names, assignments
- [ ] ORDERS panel shows zone selection and fleet order keys
- [ ] DIR.CHANNEL renders Director portrait when transmitting
- [ ] Drift timer counts down when zone is not focused
- [ ] Drift causes visible decay (desaturation at level 1+)
- [ ] Fleet orders D/H/B change AI behavior visibly
```

---

## Phase 6: Emergency Override (Day 5)
### Goal: Working override with zoom transitions

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 4 | Write `emergency-override.js`: initOverride, updateOverride, zoom transitions, Phase 1 input routing, timer, endOverride | zone-state.js, director-system.js | 3 hours |
| Agent 4 | Wire override in command-main.js: O key handler, subState transitions, Director disapproval trigger | emergency-override.js, director-system.js | 1 hour |
| Agent 3 | Override visual polish: EMERGENCY OVERRIDE flash text, timer display, 3-second warning, zoom transition overlay | emergency-override.js | 2 hours |

**End of Phase 6**: Player can press O, select a zone, zoom in, play for 15 seconds, zoom back out. Director scolds them. The pressure valve works.

### Quality Gate

```
- [ ] O key triggers override (with zone selection prompt for 2 zones)
- [ ] Zoom-in transition takes 0.5s (easeInCubic)
- [ ] Player controls UFO directly during override
- [ ] 15-second countdown displayed prominently
- [ ] At 3s: red flash warning
- [ ] Zoom-out at timer expiry or second O press
- [ ] Director disapproval line appears
- [ ] Override available only once per wave
- [ ] Other zone's drift timer continues during override
```

---

## Phase 7: Promotion Cinematic (Day 5-6)
### Goal: 10-second cinematic sequence

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 3 | Write `promotion-cinematic.js`: Phase A (The Call), Phase B (The Zoom), Phase C (The Flash), Phase D (The Settling) | director-renderer.js, command-boot.js | 4 hours |
| Agent 3 | Write `command-boot.js`: gold-themed boot overlays, diagnostic text, staggered panel boot | game.js boot patterns | 2 hours |
| Agent 4 | Wire promotion trigger: detect tech tree completion, initPromotionCinematic, commandState creation | promotion-cinematic.js, command-main.js | 1 hour |

**End of Phase 7**: Playing through Phase 1 and completing all 15 techs triggers the full promotion cinematic. Commander dissolves, Director appears, camera zooms, flash, gold boot, gameplay begins.

### Quality Gate

```
- [ ] Promotion triggers at techTree.researched.size === 15
- [ ] Phase A: Commander glitches and dissolves, Director materializes
- [ ] Phase B: Camera zooms out, Phase 1 HUD powers down, second zone appears
- [ ] Phase C: White flash, gold wireframe, boot sequence
- [ ] Phase D: Content populates, Director speaks, gameplay begins
- [ ] Entire sequence takes ~10 seconds
- [ ] No input accepted during cinematic
- [ ] Transition to COMMAND state is clean
```

---

## Phase 8: Resource Pipeline + Polish (Day 6-7)
### Goal: Resource transfers + visual polish + edge cases

| Agent | Task | Dependencies | Duration |
|-------|------|-------------|----------|
| Agent 4 | Write `resource-pipeline.js`: transfers, transit loss, delay, UI for routing | zone-state.js | 2 hours |
| Agent 3 | Resource flow particle rendering between zone panels | resource-pipeline.js | 2 hours |
| Agent 4 | Wire resource routing input (R key or Shift+1/2) in command-main.js | resource-pipeline.js | 1 hour |
| ALL | Bug fixes, edge cases, timing adjustments, visual alignment | Everything | 4 hours |

**End of Phase 8**: Resource transfers work. Particles flow between zones. All edge cases handled.

### Quality Gate

```
- [ ] Energy transfers work between zones
- [ ] 10% transit loss applied
- [ ] 3-second delay before delivery
- [ ] Particle visualization visible during transfer
- [ ] Cannot transfer below safety floor (20 energy)
- [ ] Wave-end cleanup handles in-flight transfers
```

---

## Phase 9: Integration Testing (Day 7)
### Goal: Full playthrough from Phase 1 through multiple command waves

| Task | Owner |
|------|-------|
| Full playthrough: Phase 1 (waves 1-15) -> Promotion -> Command Phase (5+ waves) | Agent 4 |
| Performance profiling: confirm 60fps on target hardware | Agent 4 |
| Director approval tracking: verify mood shifts feel right | Agent 2 |
| AI behavior tuning: reckless vs cautious feels different enough | Agent 2 |
| Visual consistency check: all panels, borders, colors match spec | Agent 3 |
| Quota balance: target band system produces reasonable quotas | Agent 2 |
| Input handling: all keybinds work in all states | Agent 4 |

### Quality Gate (Final)

```
- [ ] Complete Phase 1 -> promotion -> command phase flow
- [ ] Director report cards are engaging, not tedious
- [ ] AI UFOs are visibly different based on traits
- [ ] Drift timer creates real urgency to switch zones
- [ ] Emergency override feels satisfying AND costly
- [ ] Quota system doesn't ratchet to impossibility
- [ ] Resource routing adds meaningful decisions
- [ ] 60fps sustained through all states
- [ ] No console errors in full playthrough
- [ ] Watching delegation is FUN (the core question)
```

---

## Parallel Work Streams Visualization

```
Day 1:
  Agent 1: [zone-state.js]────────────────[zone-simulation.js]──────────────
  Agent 2: [crew-system.js]────────────────[crew-ai.js]─────────────────────
  Agent 3: [command-hud layout]────────────[zone-renderer.js]───────────────
  Agent 4: [command-config.js][game.js hooks][command-main scaffold]─────────

Day 2:
  Agent 1: ──[zone-sim: beam]──[connect AI]──[Zone B]──────────────────────
  Agent 2: ──────────────────[crew-ai.js]──────────────────────────────────
  Agent 3: ──[zone-renderer.js]──────────[dual-zone rendering]─────────────
  Agent 4: ──[command-main wiring]──────────────────────────────────────────

Day 3: ** CRITICAL PLAYTEST: Is delegation fun in two zones? **
  Agent 1: ──[drift system]────────────────────────────────────────────────
  Agent 2: ──[director-system.js]──────────────────────────────────────────
  Agent 3: ──[director-renderer.js]────────[command-summary.js]────────────
  Agent 4: ──[wave lifecycle wiring]───────────────────────────────────────

Day 4:
  Agent 1: ──[drift tuning]────────────────────────────────────────────────
  Agent 2: ──[director: report cards + dialogue]───────────────────────────
  Agent 3: ──[full command HUD]──────────[crew-renderer.js]────────────────
  Agent 4: ──[fleet orders wiring]──────────────────────────────────────────

Day 5:
  Agent 1: ──[Available for support]───────────────────────────────────────
  Agent 2: ──[Director tuning + balance]───────────────────────────────────
  Agent 3: ──[promotion-cinematic.js]──────[command-boot.js]───────────────
  Agent 4: ──[emergency-override.js]───────────────────────────────────────

Day 6:
  Agent 1: ──[resource-pipeline support]───────────────────────────────────
  Agent 2: ──[AI behavior tuning]──────────────────────────────────────────
  Agent 3: ──[promotion cinematic polish]──[resource particles]────────────
  Agent 4: ──[resource-pipeline.js]────────[integration wiring]────────────

Day 7:
  ALL:     ──[Integration testing]──[Bug fixes]──[Playtest]──[Polish]──────
```

---

## Risk Mitigation

### Risk 1: AI Doesn't Look Different Enough

**Symptom**: Reckless and cautious UFOs behave too similarly.
**Fix**: Increase reckless movement speed modifier. Add visible "personality tells" -- reckless UFO bobs more aggressively, cautious UFO drifts higher.
**Owner**: Agent 2 (tune in Phase 9).

### Risk 2: Drift Timer Too Punishing or Too Lenient

**Symptom**: Player never switches zones (too lenient) or can't keep both zones alive (too punishing).
**Fix**: Adjust DRIFT_BASE_TIME (currently 25s). Target: player needs to switch attention every ~15-20 seconds for optimal play.
**Owner**: Agent 1 (tune in Phase 9).

### Risk 3: Director Report Cards Are Tedious

**Symptom**: Player mashes through report cards without reading.
**Fix**: Make report cards faster. Reduce typewriter speed. Add skip-on-keypress for dialogue. Make consequences more dramatic so player WANTS to pay attention.
**Owner**: Agent 3 (visual timing), Agent 2 (dialogue pacing).

### Risk 4: Promotion Cinematic Is Too Long

**Symptom**: Player wants to skip.
**Fix**: Add skip capability (hold Space for 2 seconds). But first playtest -- the cinematic should feel earned, not endured. If it feels long, trim Phase B (The Zoom) from 3s to 2s.
**Owner**: Agent 3.

### Risk 5: Performance Drops Below 60fps

**Symptom**: Rendering two zones + HUD exceeds budget.
**Fix**: Reduce star count per zone, simplify particle system, reduce zone rendering when not focused (30fps for background zone).
**Owner**: Agent 3 (rendering), Agent 4 (profiling).

---

## Cut List (If Behind Schedule)

If time runs out, cut these in order (last item is cut first):

1. **Resource flow particles** -- transfers still work, just no visual particles
2. **Drift decay visual effects** -- drift still works mechanically, just no desaturation
3. **Director screen effect** (red overlay) -- Director still talks, just no screen tint
4. **Crew portraits** -- use simple colored circles instead of full portraits
5. **Command boot sequence** -- skip boot, panels appear instantly
6. **Promotion Phase B** (zoom) -- jump straight from Director speech to command mode

**NEVER CUT**: Zone simulation, AI, Director report cards, override, wave lifecycle. These ARE the game.

---

*This build order ensures that the core question -- "Is delegation fun in two zones?" -- is answerable by Day 3. Everything after Day 3 is polish, systems depth, and the cinematic wrapper. The game lives or dies on whether watching AI-driven UFOs creates the right tension. Get that answer first. Build everything else on top of it.*
