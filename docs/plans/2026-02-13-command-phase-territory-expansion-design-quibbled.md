# Command Phase: Territory Expansion & Crew Management

**Date**: 2026-02-13
**Status**: Approved
**First Slice**: Promotion trigger + 2-zone command phase (narrowed scope)

---

## Overview

After mastering Phase 1 (piloting the UFO, completing the tech tree), the game fundamentally transforms. The player is promoted from individual contributor to manager. The game shifts from action to strategy — watching crew members do the job you just mastered, while managing quotas, people, and a terrible boss.

## The Core Metaphor

Phase 1 is being an IC. Phase 2 is being promoted to management. You know the work intimately because you just did it. Now you have to hire, train, and manage people who do it for you — while your new boss (THE DIRECTOR) is 69x worse than your old one.

## Design Pillars

Every mechanic in the command phase maps to one of three pillars:

| Pillar | Definition | Measurable By | Key Mechanics |
|--------|-----------|---------------|---------------|
| **Delegation Under Pressure** | You must trust others to do the work. You can guide, but not do. | Zone performance variance, crew autonomy vs micromanagement frequency | Zone monitoring, fleet orders, crew assignment, emergency override |
| **Political Tradeoffs** | Every relationship decision has mechanical consequences. No clean wins. | Director approval rating, crew morale spread, quota trajectory | Director's Kid, report cards, spin/accountability, specialization track choice |
| **Human Cost of Quotas** | Hitting numbers means spending people. The system demands output; people are the cost. | Crew burnout rate, turnover, morale-vs-quota correlation | Quota management, shift scheduling, coaching investment, firing |

---

## 1. The Promotion Trigger

**Condition**: Player completes all 15 techs across the 3 original tracks (Power Grid, Drone Command, Defense Network). Promotion triggers at wave end regardless of survival outcome — dying on the final tech wave still earns the promotion. You completed the work; the result is recognized.

**Progress Tracker**: From tech 10 onward, a subtle HUD element shows "COMMAND QUALIFICATION: X/15" so the player knows promotion is approaching. At 14/15, the tracker pulses.

**The Promotion Cinematic** (10-15 seconds):
1. Wave summary fades. New transmission crackles in — deeper, more menacing voice. This is THE DIRECTOR.
2. HUD text crawl: *"INCOMING TRANSMISSION — PRIORITY: SUPREME"*
3. Director's garbled alien voice (harsher sawtooth, deeper pitch): *"Impressive performance, Operator. Your sector results have been... adequate. You are hereby promoted to ZONE COMMANDER. You will now oversee multiple sectors. Do not disappoint me."*
4. Camera smoothly zooms out. The single battlefield shrinks. A second zone materializes beside it.
5. Action HUD fades, replaced by Command HUD (zone status panels, fleet roster, resource pipeline).
6. Flash: *"COMMAND MODE ACTIVATED"*

**Post-cinematic**: A training wave begins — see Section 8 for structured onboarding.

**Rule**: Once promoted, command mode is permanent. You don't go back to ground-level piloting as normal gameplay.

**Emergency Override**: Once per wave, the commander can burn 1 Command Point to manually pilot a single zone for 15 seconds. During override, the commander's view zooms into the zone and Phase 1 controls activate. When override ends, the view zooms back out. THE DIRECTOR disapproves: *"I didn't promote you to play pilot, Commander."* Director approval takes a small hit. This is a pressure valve, not a rotation — it should feel like breaking protocol.

---

## 2. Screen Layout

The screen splits into two persistent areas:

### Zone Grid (main area) — live battlefields

```
1 zone:          2 zones:         4 zones:
┌──────────┐    ┌─────┬─────┐   ┌─────┬─────┐
│          │    │     │     │   │     │     │
│    A     │    │  A  │  B  │   │  A  │  B  │
│          │    │     │     │   ├─────┼─────┤
└──────────┘    └─────┴─────┘   │  C  │  D  │
                                └─────┴─────┘
```

**16 zones — Abstraction Layer**:

At 16 zones, individual zone panels are too small for meaningful readability. The display shifts to an abstraction model:

```
┌─────────────────────────┬────────────────┐
│                         │  ALERT QUEUE   │
│   4x4 CLUSTER HEATMAP   │  ▸ Zone C-2 ⚠ │
│   ┌──┬──┬──┬──┐        │  ▸ Zone A-4 🔴 │
│   │🟢│🟢│🟡│🟢│        │  ▸ Zone D-1 ⚠ │
│   ├──┼──┼──┼──┤        │                │
│   │🟡│🔴│🟢│🟢│        │  FOCUS VIEW    │
│   ├──┼──┼──┼──┤        │  ┌──────────┐  │
│   │🟢│🟢│🟡│⚡│        │  │ Zone B-2 │  │
│   ├──┼──┼──┼──┤        │  │ [detail] │  │
│   │🟢│🟡│🟢│🟢│        │  └──────────┘  │
│   └──┴──┴──┴──┘        │                │
└─────────────────────────┴────────────────┘
```

- **Heatmap cells**: Color-coded by composite health (green/yellow/red/flashing). Each cell shows a single glyph: health + quota progress.
- **Alert queue**: Sorted by severity. Click/hotkey to focus.
- **Focus view**: One zone expanded to full detail. Clicking a heatmap cell or alert drills down.
- **Non-critical zones compressed**: Only health/quota glyphs visible. No portraits, no status text.

### Sidebar — management panel

- **2 zones**: Sidebar is above or below the grid (respects horizontal screen ratio)
- **4+ zones**: Sidebar moves to the side

Sidebar contains:
- Crew Roster (assignments, traits, performance)
- Recruiting (candidates, interviews)
- Coaching/Training (active development sessions)
- Boss Channel (Director communications, report cards, quota demands)
- Resources (energy, bio-matter, drone pools)

### Zone Progression

- **1 → 2 zones**: Complete Phase 1 tech tree (promotion trigger)
- **2 → 4 zones**: Fill Phase 2 command tech tree + meet Director quotas
- **4 → 16 zones**: Each of the 4 zones splits into 4. Managing managers at this point.

### Zone Panel Elements (2-zone and 4-zone scales)

Each zone panel shows:
- Zone label (e.g., "SECTOR A-7")
- Status bar: threat level, drone count, energy, quota progress
- Crew indicator: name + portrait thumbnail
- Border color: green (stable), yellow (stressed), red (crisis), flashing red (emergency)

---

## 3. Crew Management — The People Side

Crew members are UFO operators — they do the exact job you did in Phase 1. You know the work intimately because you were them.

### Crew Lifecycle

1. **Recruit** — Between waves, candidate profiles appear in sidebar. Name, personality blurb, a couple of visible traits. Not everything revealed upfront.
2. **Interview** — Dialogue exchange reveals more traits, strengths, red flags. Multiple choice responses hint at hidden traits. Your Phase 1 experience informs what to look for.
3. **Hire** — They join as rookies. Low skill but trainable.
4. **Assign** — Place in a zone. Watch their performance in the miniaturized panel.
5. **Coach/Train** — Between waves (during their break, while you're still working). Pick a skill area. Traits influence learning speed and resistance.
6. **Manage** — Monitor performance, reassign between zones, adjust priorities (aggressive harvesting vs defensive play).
7. **Fire** — Remove underperformers. Consequences: remaining crew morale dips, need replacement.

### Personality Traits (examples)

- **Reckless**: High abduction rate, burns through drones fast
- **Cautious**: Low losses, misses quotas
- **Greedy**: Hoards bio-matter, doesn't share across zones
- **Loyal**: Morale stays high under pressure, steadying influence
- **Whiner**: Complains constantly but secretly competent
- **Hotshot**: Great early performance, burns out without coaching

Traits are discovered over time — some in interview, others after waves of observation.

### Shifts & Breaks

- Each crew member works a wave (their shift), then hits the shopping mall (their break).
- As manager, you handle the decision queue during what used to be your break.
- The theme: you never truly stop. But the pacing respects your bandwidth (see Section 8, Between Waves).

### Shift Scheduling Complexity

- **2 zones**: 2-3 crew. Simple — one per zone, maybe a bench player. Tension: best person on the harder zone, or spread evenly?
- **4 zones**: 4+ crew. Stamina matters — can't run infinite consecutive waves. Rotation decisions: who covers the hard shift? Pair rookie with veteran zone? Someone calls in sick?
- **16 zones**: Managing team leads who schedule their own sub-teams. Inter-team politics, resource competition.

---

## 4. THE DIRECTOR'S KID

A signature narrative mechanic. Between waves early in the 2-zone phase:

> *INCOMING TRANSMISSION — THE DIRECTOR*
> "I'm sending you someone. My kid. Treat them well."

The kid bombs the interview — wrong answers, bad attitude, clearly unqualified. The choice:

### Path A — Hire the Kid

- Terrible at first. Low stats, bad traits (lazy, entitled, distracted).
- Drags down whichever zone they're assigned to. Quotas suffer.
- Other crew resents the nepotism. Morale dips.
- **If you invest in coaching over multiple waves**:
  - Early: kid resists, complains, "my dad will hear about this"
  - Mid: cracks show, moment of genuine effort
  - Late: breakthrough. Becomes legitimately competent. Maybe good.
  - **Director's reaction**: Gets WORSE first ("why is my kid complaining about you?"). More unreasonable quotas, harsher report cards.
  - **Then the turn**: Director sees the kid's numbers. Softens. Eventually: *"...you did something I couldn't do."* Opens path to next promotion.
- **Long-tail modifier**: Crew retention +20% (they see you develop people). Director volatility -30% (he trusts you now). Lasts until 4-zone transition.

### Path B — Don't Hire

- Director immediately hostile. Quotas spike. Report cards are brutal.
- Must be excellent to survive — hit every quota despite pressure.
- Crew respects your integrity. Morale bonus.
- Harder path, clean team.
- **Long-tail modifier**: Quota elasticity -15% (Director gives you no slack on misses). Crew morale coefficient +25% (they respect the stand). Lasts until 4-zone transition.

### Path C — Hire Then Fire

- You tried. Kid was too much. Fire to save quotas.
- Director furious but conflicted — numbers back your decision.
- Political fallout: Director sabotages in small ways (worse resource allocations, no praise).
- Mixed crew morale — some respect it, whiners gossip.
- **Long-tail modifier**: Resource allocation -10% per wave from Director (petty sabotage). Crew morale mixed — +10% from pragmatists, -10% from loyalists. Lasts 5 waves.

**The point**: No clean win. Every path has costs and rewards. The kid's arc (if you train them) is the emotional heart of the command phase. Each path's modifiers reshape strategy for multiple waves, making the narrative choice mechanically meaningful.

---

## 5. Command Tech Tree — Specialization, Not Completion

### The Fundamental Shift

Phase 1: master everything (all 15 techs). Phase 2: you CAN'T max everything. Limited Command Points (CP) earned from quota performance, coaching wins, Director approval. Every point in one track is a point missing from another.

### The Three Tracks

```
        ENGINEERING & OPS
            (systems)
               /\
              /  \
             /    \
            /      \
     PEOPLE -------- POLITICS
    (genuine)       (strategic)
```

**ENGINEERING & OPS** — the technical mind
- Pure systems thinking. Optimize machines, pipelines, infrastructure.
- R&D new tech, design better equipment, automate processes.
- Zones are systems to be tuned, not teams to be led.
- Crew gets best tools but minimal emotional support. They're "headcount."
- Strong = technically superior zones. Weak = outdated tech, falling behind.
- *The brilliant CTO who sees people as interchangeable parts.*
- Sub-tension within track: spend on R&D (new tech) vs ops (efficiency). Can't fully fund both.

**PEOPLE** — the team builder
- Pure human investment. Mentorship, coaching, morale, trust.
- Crew are individuals with potential. You develop them.
- Tech might be standard-issue, but people perform above their stats.
- Strong = loyal crew, low turnover, Director's Kid arc is your superpower. Weak = best people leave.
- *The manager everyone wants to work for.*

**POLITICS** — the strategic operator
- Information advantage and political capital. Knows how to work the system.
- Manages Director through strategic communication — not just flattery, but knowing when to push back, when to concede, and when to reframe.
- **Explicit mechanical benefits**:
  - **Quota negotiation**: Reduce quota targets by up to 15% through pre-wave negotiation dialogue. Director accepts lower targets if politically managed.
  - **Inspection early warning**: 10-second advance warning before Director's surprise inspections. Time to reposition resources.
  - **Requisition mitigation**: When Director "requisitions" from your pool, Politics investment blocks up to 50% of the take.
  - **Report card spin**: Can turn 1 negative result neutral per report card. Higher investment = turn 2.
  - **Intelligence network**: See crew hidden traits 1 wave earlier. Know incoming crisis type before it fires.
- Strong = favorable operating conditions, information superiority. Weak = exposed when systems actually break — spin doesn't fix drifting drones.
- *The VP who always has the right information at the right time.*

### Specialization Unlocks Gradually

- **2 zones (early)**: No tracks yet. Learn to watch zones, manage quota, hire crew, deal with Director. Raw survival.
- **2 zones (mid)**: First track points available. Subtle lean toward a style.
- **4 zones**: Tracks fully open. Specialization matters — can't brute-force 4 zones without strategy.
- **16 zones**: Deep specialization mandatory. Tracks define management identity.

---

## 6. Quota Management — The Spine

Quotas drive everything. Quotas are what THE DIRECTOR cares about. Quotas are what crew is measured on.

### Quota Scaling

- **2 zones**: Simple per-zone abduction quota per wave. Hit the number.
- **4 zones**: Aggregate quota across all zones. Player decides distribution — pressure the best zone? Spread evenly? Sacrifice one to protect three?
- **16 zones**: Cascading quotas. Team leads set sub-quotas for clusters. Player sets zone-level targets. Director sets overall target. Quota negotiation becomes a skill.

### Quota Dynamics — Target Band System

Quotas operate on a rolling 3-wave average, not a permanent ratchet. This prevents sandbagging while keeping strong play rewarding.

- **Miss quota**: Director notes it. Two consecutive misses trigger a "performance review" — temporary resource penalty for 1 wave. Three consecutive misses = crew morale hit.
- **Hit quota (within band)**: Director sets next quota based on rolling 3-wave average. Steady performance = steady expectations.
- **Exceed quota**: Triggers a **temporary surge** — Director raises expectations for 2-3 waves, then they decay back to the rolling average. Bonus resources during the surge to offset. The surge is annoying but survivable, and it ends.
- **Recovery waves**: Every 4-5 waves, the Director is distracted ("Board meeting. Don't bother me."). Quota drops 20%. Use this to coach, recruit, or catch up. Politics investment increases recovery wave frequency.

This means: strong play earns temporary pressure + bonus resources, not permanent punishment. Moderate play is sustainable. Poor play has consequences that escalate but can be recovered from.

### Director Report Cards

Between waves, Director reviews zone performance. Player chooses dialogue responses:
- Spin bad results ("Zone 3 had a rough wave but we're training new talent")
- Take accountability (sometimes earns respect)
- Deflect blame (Politics-heavy players have more options and better thresholds)

Director has moods and preferences — certain results matter more to him, certain crew types impress him. Learn what he values and optimize for that while keeping your team functional.

---

## 7. Anti-Autonomous Mechanics — Predictable Pressure + Crisis Spikes

Two layers ensure constant engagement without frantic micromanagement:

### Layer 1: Predictable Pressure (plan around these)

**Fleet Decay (entropy)**
- Zones without active monitoring degrade — drone coordination loosens, efficiency drops.
- Decay rate is visible and predictable: each zone shows a "drift timer" that counts down.
- Must rotate attention like a plate spinner.
- Engineering slows decay. People means crew self-corrects better. Politics doesn't help here.
- At 16 zones, decay is the primary challenge. Team leads handle it, but only as well as you trained them.

**Scheduled Inspections**
- Director inspections happen on a visible schedule (every 3-4 waves). Player knows they're coming.
- Performance during inspection counts triple for the report card.
- Politics-heavy players get exact timing; others get a 1-wave warning window.

**Equipment Wear Forecasts**
- Zone equipment shows wear indicators. Player can see which zones will need maintenance in 1-2 waves.
- Engineering investment extends equipment life and reduces maintenance cost.
- Ignoring wear = eventual equipment failure (transitions from predictable to crisis).

**Resource Scarcity (never enough)**
- Bio-matter, energy, drone pools shared but limited. Always in deficit somewhere.
- Transfers have a cost — % lost in transit (reduced by Engineering investment).
- Director occasionally "requisitions" from your pool. Politics investment lets you push back.

### Layer 2: Crisis Spikes (react to these)

- **Boss tank assault** — Massive tank wave, crew can't handle alone. Pull resources from other zones or accept losses.
- **Equipment failure** — Predicted wear ignored too long. Engineering-heavy players fix fast. Others work around it.
- **Crew breakdown** — Low morale + high stress = crew member stops performing. People-heavy players handle instantly.
- **Director's surprise inspection** — Unscheduled snap inspection (rarer than scheduled ones). Politics-heavy players get advance warning.

**Crisis overlap**: At most two crises simultaneously in 2-zone phase. Up to three at 4+ zones. Triage is the game.

**Recovery windows**: After any major crisis, a 1-wave cooldown prevents another crisis in the same zone. This gives the player breathing room to stabilize.

**Crisis forecast**: Some crises (equipment failure, crew breakdown) show warning indicators 10-20 seconds before triggering. Players who monitor proactively can prevent escalation.

---

## 8. The Command Phase Wave Loop

### During a Wave (zones are live)

- **Monitor zone health** — border colors shift. Yellow = struggling. Red = about to fail.
- **Route resources** — Drag/hotkey resources between zones. Pipeline delay (faster with Engineering investment).
- **Issue fleet orders** — "Zone C, defensive posture." "Zone A, prioritize harvesting." Set priorities, don't micromanage individual drones.
- **React to crises** — Zone flashes red. Seconds to respond. Send reinforcements? Burn reserves? Accept the loss?
- **Fleet decay ticks** — Zones without attention degrade. Rotate focus.
- **Emergency Override** — Once per wave, burn 1 CP to pilot a zone directly for 15 seconds. Director disapproves.

### Between Waves — Decision Budget

Crew clocks out. You don't — but pacing respects your bandwidth.

**Decision budget per break: 1 mandatory + 1 optional**

- **Mandatory (always)**: Director report card. Review performance, choose dialogue response. This is the heartbeat of the management relationship.
- **Optional (pick one from queue)**: Coaching session, recruiting interview, R&D allocation, scheduling change, or resource rebalancing. Remaining items stay in queue for future breaks.
- **Policy presets handle the rest**: Set policies that auto-resolve routine decisions. Examples:
  - Recruiting policy: "Auto-reject candidates below X trait threshold"
  - Scheduling policy: "Rotate crew by stamina, strongest on hardest zone"
  - Resource policy: "Split evenly" or "Prioritize Zone A"
  - Coaching policy: "Coach lowest-performing crew member in their weakest area"
- Policies can be updated at any break as your optional decision.

**Key tension**: The queue grows faster than you can process it. Policies handle volume, but personal attention (coaching, hand-picked recruits) produces better outcomes. The tradeoff: breadth via automation or depth via attention.

---

## 9. Training Wave — Structured Onboarding

After the promotion cinematic, a guided training wave teaches command mechanics through three escalating tasks:

### Task 1: Assign (low pressure)
- Two zones appear, one crew member available.
- Prompt: "Assign your crew member to a zone."
- Zone A has easy targets, Zone B has moderate threats.
- **Success telemetry**: Did the player assign within 10 seconds? Did they read the zone descriptions?
- Failure state: Gentle reminder prompt after 15 seconds.

### Task 2: Reroute (medium pressure)
- Both zones are active. Zone B starts losing resources.
- Prompt: "Zone B is running low. Route resources from Zone A."
- Resource transfer UI highlighted.
- **Success telemetry**: Transfer completed within 20 seconds? Amount transferred sufficient?
- Failure state: Auto-transfer kicks in with explanation text.

### Task 3: Crisis Response (high pressure)
- Zone A triggers a scripted boss tank assault.
- Prompt: "CRISIS — Zone A needs reinforcements. React!"
- Player must pull reserves or accept the loss.
- **Success telemetry**: Response time under 10 seconds? Zone A survival?
- Failure state: Zone A takes damage but survives (scripted to not fail completely).

After all three tasks, brief summary: "Command training complete. You're on your own, Commander." Then normal waves begin.

---

## First Slice Scope

The design doc above describes the full vision. The first slice tests one question: **"Is delegation fun in two zones?"**

1. **Promotion trigger** — detect full tech tree completion, fire minimal cinematic (Director voice + camera zoom + flash)
2. **Command view** — 2-zone layout with sidebar above/below
3. **Basic crew system** — 1 crew member with 1 trait axis (Reckless ↔ Cautious). Recruit → assign. No interviews, no coaching depth.
4. **Quota management** — per-zone quotas with the target band system. Director report cards with 2-3 scripted dialogue options.
5. **Zone simulation** — simplified Phase 1 sim running in each zone panel
6. **THE DIRECTOR** — voice + scripted transmissions. No mood system yet — preset reactions based on quota hit/miss.
7. **Emergency Override** — 1 manual takeover per wave

Deferred to slice 2 (after core delegation loop validated):
- Training wave (structured 3-task onboarding)
- Interview system and coaching depth
- Director mood system and dynamic reactions
- Additional personality traits beyond Reckless ↔ Cautious
- Policy presets and decision queue

Deferred to later slices:
- 4-zone and 16-zone expansions
- Full specialization tracks (Engineering/People/Politics)
- Director's Kid narrative arc
- Shift scheduling complexity
- Full crisis system, equipment wear, scheduled inspections
- Cascading quotas and quota negotiation