# Command Phase: Territory Expansion & Crew Management

**Date**: 2026-02-13
**Status**: Approved
**First Slice**: Promotion trigger + 2-zone command phase

---

## Overview

After mastering Phase 1 (piloting the UFO, completing the tech tree), the game fundamentally transforms. The player is promoted from individual contributor to manager. They can never go back to ground-level piloting. The game shifts from action to strategy — watching crew members do the job you just mastered, while managing quotas, people, and a terrible boss.

## The Core Metaphor

Phase 1 is being an IC. Phase 2 is being promoted to management. You know the work intimately because you just did it. Now you have to hire, train, and manage people who do it for you — while your new boss (THE DIRECTOR) is 69x worse than your old one.

---

## 1. The Promotion Trigger

**Condition**: Player completes all 15 techs across the 3 original tracks (Power Grid, Drone Command, Defense Network) AND survives that wave.

**The Promotion Cinematic** (10-15 seconds):
1. Wave summary fades. New transmission crackles in — deeper, more menacing voice. This is THE DIRECTOR.
2. HUD text crawl: *"INCOMING TRANSMISSION — PRIORITY: SUPREME"*
3. Director's garbled alien voice (harsher sawtooth, deeper pitch): *"Impressive performance, Operator. Your sector results have been... adequate. You are hereby promoted to ZONE COMMANDER. You will now oversee multiple sectors. Do not disappoint me."*
4. Camera smoothly zooms out. The single battlefield shrinks. A second zone materializes beside it.
5. Action HUD fades, replaced by Command HUD (zone status panels, fleet roster, resource pipeline).
6. Flash: *"COMMAND MODE ACTIVATED"*

**Post-cinematic**: A training wave begins — 2 zones, reduced threat level, guided prompts teaching fleet orders, resource routing, and zone selection.

**Rule**: Once promoted, you never go back to piloting. Permanent command mode.

---

## 2. Screen Layout

The screen splits into two persistent areas:

### Zone Grid (main area) — live battlefields

```
1 zone:          2 zones:         4 zones:         16 zones:
┌──────────┐    ┌─────┬─────┐   ┌─────┬─────┐   ┌──┬──┬──┬──┐
│          │    │     │     │   │     │     │   ├──┼──┼──┼──┤
│    A     │    │  A  │  B  │   │  A  │  B  │   ├──┼──┼──┼──┤
│          │    │     │     │   ├─────┼─────┤   ├──┼──┼──┼──┤
└──────────┘    └─────┴─────┘   │  C  │  D  │   └──┴──┴──┴──┘
                                └─────┴─────┘
```

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

- **1 → 2 zones**: Complete Phase 1 tech tree + survive the wave
- **2 → 4 zones**: Fill Phase 2 command tech tree + meet Director quotas
- **4 → 16 zones**: Each of the 4 zones splits into 4. Managing managers at this point.

### Zone Panel Elements

Each miniaturized zone shows:
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
- As manager, you review report cards, coach, recruit, and handle THE DIRECTOR during what used to be your break.
- You never stop working.

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

### Path B — Don't Hire

- Director immediately hostile. Quotas spike. Report cards are brutal.
- Must be excellent to survive — hit every quota despite pressure.
- Crew respects your integrity. Morale bonus.
- Harder path, clean team.

### Path C — Hire Then Fire

- You tried. Kid was too much. Fire to save quotas.
- Director furious but conflicted — numbers back your decision.
- Political fallout: Director sabotages in small ways (worse resource allocations, no praise).
- Mixed crew morale — some respect it, whiners gossip.

**The point**: No clean win. Every path has costs and rewards. The kid's arc (if you train them) is the emotional heart of the command phase.

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
    (genuine)      (conniving)
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

**POLITICS** — the operator
- Not genuinely great at either engineering or people — knows enough of both to be dangerous.
- Uses technical knowledge to sound credible. Uses people skills to manipulate, not mentor.
- Conniving. Strategic. Always positioning.
- Manages Director through flattery, spin, knowing when to take credit vs deflect blame.
- Strong = Director eats out of your hand, favorable quotas. Weak = exposed when things go wrong.
- *The VP who survives every reorg.*

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

### Quota Dynamics

- **Underperform**: Coach crew, reassign, or absorb the hit on report card
- **Hit quota**: Director raises it next wave (of course)
- **Exceed quota**: Bonus resources, but Director recalibrates expectations upward permanently

### Director Report Cards

Between waves, Director reviews zone performance. Player chooses dialogue responses:
- Spin bad results ("Zone 3 had a rough wave but we're training new talent")
- Take accountability (sometimes earns respect)
- Deflect blame (Politics-heavy players have more options)

Director has moods and preferences — certain results matter more to him, certain crew types impress him. Learn what he values and optimize for that while keeping your team functional.

---

## 7. Anti-Autonomous Mechanics

Three systems ensure constant player attention:

### Zone Crises (random emergencies)

- **Boss tank assault** — Massive tank wave, crew can't handle alone. Pull resources from other zones or accept losses.
- **Equipment failure** — Drone fleet malfunctions. Engineering-heavy players fix fast. Others work around it.
- **Crew breakdown** — Low morale + high stress = crew member stops performing. People-heavy players handle instantly.
- **Director's surprise inspection** — Zooms in on a specific zone. Performance counts triple for 30 seconds. Politics-heavy players get advance warning.
- Crises overlap. Two at once. Then three. Triage is the game.

### Resource Scarcity (never enough)

- Bio-matter, energy, drone pools shared but limited. Always in deficit somewhere.
- Transfers have a cost — % lost in transit (reduced by Engineering investment).
- Every crew member in the mall = a zone not generating resources. Breaks are expensive.
- Director occasionally "requisitions" from your pool. Politics investment lets you push back.

### Fleet Decay (entropy)

- Zones without active monitoring degrade — drone coordination loosens, efficiency drops.
- Must rotate attention like a plate spinner.
- Engineering slows decay. People means crew self-corrects better. Politics doesn't help here — smooth talk doesn't fix drifting drones.
- At 16 zones, decay is the primary challenge. Team leads handle it, but only as well as you trained them.

---

## 8. The Command Phase Wave Loop

### During a Wave (zones are live)

- **Monitor zone health** — border colors shift. Yellow = struggling. Red = about to fail.
- **Route resources** — Drag/hotkey resources between zones. Pipeline delay (faster with Engineering investment).
- **Issue fleet orders** — "Zone C, defensive posture." "Zone A, prioritize harvesting." Set priorities, don't micromanage individual drones.
- **React to crises** — Zone flashes red. Seconds to respond. Send reinforcements? Burn reserves? Accept the loss?
- **Fleet decay ticks** — Zones without attention degrade. Rotate focus.

### Between Waves (crew clocks out, you don't)

- **Report card** — Director reviews performance. Dialogue choices to spin or own results.
- **Coaching sessions** — Pick crew member, run training dialogue. Traits determine response.
- **Recruiting** — New candidate? Interview. Or Director sends "someone special."
- **R&D** — Spend bio-matter on engineering research (if specialized).
- **Scheduling** — Who's on which zone? Someone's stamina is low — bench or push? Transfer requests.

**Key tension**: Crew gets breaks. You don't. Between-wave is YOUR busiest time. Wave timer doesn't care how much you have left. Ready or not, next wave starts.

---

## First Slice Scope

The design doc above describes the full vision. The first implementation slice focuses on:

1. **Promotion trigger** — detect full tech tree completion, fire cinematic
2. **Command view** — 2-zone layout with sidebar above/below
3. **Basic crew system** — 1-2 crew members, recruit → interview → hire → assign
4. **Quota management** — per-zone quotas, Director report cards
5. **Zone simulation** — simplified Phase 1 sim running in each zone panel
6. **THE DIRECTOR** — voice, transmissions, quota pressure, basic mood system
7. **Training wave** — guided introduction to command mechanics

Deferred to later slices:
- 4-zone and 16-zone expansions
- Full specialization tracks (Engineering/People/Politics)
- Director's Kid narrative arc
- Shift scheduling complexity
- Zone crises, resource scarcity, fleet decay (full versions)
- Cascading quotas and quota negotiation
