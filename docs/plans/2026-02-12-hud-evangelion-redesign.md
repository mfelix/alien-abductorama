# HUD Evangelion Redesign - Complete Overhaul

## Vision
Transform the HUD from scattered floating panels into a cohesive **Neon Genesis Evangelion-inspired** command interface. The HUD should feel like piloting a biomechanical alien craft - dense with information, alive with energy flows, punctuated by fast-blinking status lights and cryptic alien acronyms. Think NERV bridge displays meets Dead Space meets Metroid energy tanks.

## Core Design Principles

1. **Progressive Complexity**: HUD starts minimal (Wave 1) and grows as tech is researched. New panels slide/unfold into existence when their system is unlocked.
2. **Energy Flow Visualization**: Energy isn't just a bar - it flows visually between sections. The beam powers drones, coordinators feed biomatter back. These flows should be visible as animated connections.
3. **Spatial Clarity**: Each screen edge owns a domain. No overlap, no collision.
4. **NGE Aesthetic**: Scanlines, hex patterns, angular panels with cut corners, pulsing status indicators, dense acronym labels (SYS.PWR, B.MTR, COORD.LINK, etc.), warning chevrons, animated data streams.
5. **Small Multiples (Tufte)**: As systems come online, they appear as small, dense, self-contained readout modules that tile together.

## Screen Layout (5 Zones)

```
+--[ZONE A: STATUS]-------+--[ZONE B: MISSION]-------+--[ZONE C: SYSTEMS]--+
|  Score / Wave / Timer    |  Quota Bar (wider!)       |  Shield Bar          |
|  Bio-Matter              |  Harvest Counter          |  Energy Cubes        |
|  Combo Multiplier        |  Research Progress        |                      |
+                          +                           +                      |
|                          |                           |                      |
+--[ZONE D: WEAPONS]------+                           +--[ZONE E: FLEET]----+
|  Bombs [X]               |     PLAY AREA             |  Drone Status        |
|  Missiles [C]            |                           |  Coordinator Tree    |
|  (future weapons)        |     Energy Bar above UFO  |  Sub-drone Status    |
|                          |     + Energy Cubes        |                      |
+                          +                           +                      |
|                          |                           |                      |
+--[ZONE F: COMMANDER]----+---------------------------+----------------------+
|  Commander Portrait      |                           |                      |
|  Dialogue Bubble         |                           |                      |
+--------------------------+---------------------------+----------------------+
```

### Zone A: STATUS (Top-Left)
- **Score**: Large cyan monospace, same position but with NGE-style bracket borders
- **Wave / Timer**: Below score, with animated chevron separators
- **Combo**: Pulsing multiplier with energy ring effect
- **Bio-Matter**: Small dense readout with alien glyph prefix "B.MTR:"
- **Active Powerups**: Stacked progress bars below bio-matter

### Zone B: MISSION (Top-Center)
- **Quota Bar**: ENLARGED - 280px wide, 28px tall, with angular cut corners
  - Better contrast: dark charcoal background, bright fill colors
  - Hex-pattern texture on the bar
  - "QUOTA" label in top-left of bar, count in top-right
  - Animated chevron pattern on the fill
  - Warning state: red pulsing border with "ALERT" text
- **Harvest Counter**: Below quota, same width, target icons in a row
- **Research Progress**: Below harvest counter, slides in when active
  - NGE-style progress with scrolling data text underneath

### Zone C: SYSTEMS (Top-Right)
- **Shield Bar**: Angular panel with cut top-right corner
  - Segmented (not smooth fill) - each segment = 10 HP
  - Color shifts through segments (green -> yellow -> red)
- **Energy Cubes** (NEW - Metroid-style):
  - Row of cube icons below shield
  - Each cube = one revive charge
  - Cubes have inner energy swirl animation
  - When consumed, cube shatters with particle effect
  - "REVIVE CELLS" label with count

### Zone D: WEAPONS (Left Side, below status)
- **Unified Weapons Panel** with angular NGE border
- **Bombs Section**:
  - Label "ORD.B" (Ordnance: Bombs)
  - Key badge [X]
  - Bomb icons in a tight 2-column grid (not spreading vertically)
  - Recharge arc around empty slots
  - Max 6 bombs displayed in 3x2 grid
- **Missiles Section**:
  - Label "ORD.M" (Ordnance: Missiles/Swarm)
  - Key badge [C]
  - Missile icons as RECTANGLES WITH POINTED TIPS (not ellipses!)
  - Displayed in a compact grid (3 columns)
  - Recharge bar at bottom
  - "SWARM RDY" indicator when full
- **Speed/Energy Bonus**: Small inline indicators at bottom of weapons panel
- Visual: Connected by thin energy lines to the UFO energy bar

### Zone E: FLEET (Right Side, below systems)
- **Drone Control Panel** - the crown jewel
  - Angular NGE frame with "FLEET.CMD" header
  - **Hierarchical tree view**:
    ```
    FLEET.CMD ─────────────
    ├─ COORD.H [████░░] 12s
    │  ├─ H-01 [███░] 8s
    │  ├─ H-02 [████] 11s
    │  └─ H-03 [██░░] 5s ⚠
    ├─ COORD.A [███░░░] 7s
    │  ├─ A-01 [████] 10s
    │  └─ A-02 [███░] 9s
    └─ RAW DRONES: 2/4
       ├─ H-04 [████] 12s
       └─ B-01 [██░░] 6s
    ```
  - Each entry: type icon + energy bar + time remaining
  - Low energy entries flash with NGE-style warning
  - Coordinator entries show sub-drone count
  - Tree lines are animated energy conduits (when beam conduit researched)
  - Panel grows as more drones/coordinators are deployed
  - SOS indicators inline (pulsing red dot)

### Zone F: COMMANDER (Bottom-Left)
- **In-Mission Commander Comms** (NEW!)
  - Commander portrait (existing alien portrait renderer)
  - Speech bubble with typewriter text
  - Appears periodically during gameplay (not just shop/wave summary)
  - NOT dismissible - just appears and fades after message completes
  - Holographic green CRT aesthetic
  - "INCOMING TRANSMISSION" header with blinking indicator
  - Static/interference effect on appearance
  - Comments on: quota progress, drone losses, energy warnings, kill streaks
  - Slides in from left edge, stays for ~5-8 seconds, slides out

## Energy Bar Redesign (Above UFO)

The energy bar above the UFO gets a major upgrade:

1. **Base Bar**: Segmented into cells (like Metroid), not smooth fill
   - Each segment has individual fill animation
   - Segments deplete right-to-left
   - Low segments pulse red

2. **Energy Cubes** (above the bar):
   - Visual "tanks" that feed into the main bar
   - When main energy depletes, cubes start draining (revive mechanic visual)
   - Cubes shown as small glowing squares with inner energy animation

3. **Energy Flow Lines**:
   - Thin animated lines connect the energy bar to:
     - Drone/Coordinator tethers (showing power going out)
     - Weapons panel (showing ordnance energy cost)
   - Lines pulse when energy is being consumed
   - Only visible after relevant tech is researched

## Progressive Unlock Sequence

| Wave/Tech | New HUD Elements |
|-----------|-----------------|
| Wave 1 Start | Score, Timer, Quota, Harvest Counter, Shield, Energy Bar |
| First Bomb Purchase | Weapons panel (Zone D) appears with bomb section |
| First Missile Purchase | Missile section slides into weapons panel |
| First Drone Purchase | Fleet panel (Zone E) appears with single drone entry |
| Beam Conduit (PG1) | Energy flow lines appear connecting bar to drones |
| Drone Uplink (DC1) | Fleet panel shows slot count |
| Harvester Coordinator (DC2) | Hierarchical tree view in fleet panel |
| Attack Coordinator (DC3) | Attack coordinator entries added to tree |
| Energy Efficiency (PG2) | "EFF" indicator on energy bar |
| Fleet Expansion (DC4) | Tree view expands, more sub-drone slots |
| Commander comms | Commander panel (Zone F) starts appearing Wave 2+ |

## NGE Visual Language

### Panel Borders
- Angular corners (not rounded) - cut at 45 degrees on one or two corners
- Thin bright border (cyan/green/orange depending on zone)
- Inner shadow creating depth
- Subtle hex-grid texture on backgrounds

### Typography
- Headers: Bold 11px monospace, ALL CAPS, with dots as separators (FLEET.CMD, ORD.B)
- Values: Bold 14-16px monospace, bright color matching zone
- Labels: 9px monospace, muted gray

### Status Indicators
- Green dot = nominal
- Yellow dot = caution (slow pulse)
- Red dot = critical (fast pulse)
- Blinking chevrons (>>>) for active processes
- Scrolling binary/hex data streams as background texture

### Animations
- Panel appearance: Slide in + unfold effect (200ms)
- Value changes: Brief flash + scale pop
- Warning states: Alternating border color with scan line sweep
- Energy flow: Animated dashes along connection lines
- Commander entrance: Static burst + slide in

## Implementation Architecture

### New Functions to Create
- `renderHUDFrame()` - Master layout calculator, determines zone positions based on canvas size
- `renderStatusZone(x, y, w, h)` - Zone A
- `renderMissionZone(x, y, w, h)` - Zone B
- `renderSystemsZone(x, y, w, h)` - Zone C
- `renderWeaponsZone(x, y, w, h)` - Zone D
- `renderFleetZone(x, y, w, h)` - Zone E
- `renderCommanderZone(x, y, w, h)` - Zone F
- `renderNGEPanel(x, y, w, h, opts)` - Reusable angular panel with NGE styling
- `renderNGEBar(x, y, w, h, percent, color, opts)` - Reusable progress bar with segments
- `renderNGEStatusDot(x, y, status)` - Status indicator dot
- `renderEnergyFlow(fromX, fromY, toX, toY, active)` - Animated energy connection line
- `renderFleetTree(x, y, w)` - Hierarchical coordinator/drone tree
- `renderCommanderComms()` - In-mission commander communications
- `updateCommanderComms(dt)` - Commander comms timing/state

### Functions to Replace
- `renderUI()` -> calls `renderHUDFrame()` which orchestrates zones
- `renderMissileCount()` -> absorbed into `renderWeaponsZone()`
- `renderBombCount()` -> absorbed into `renderWeaponsZone()`
- `renderDroneStatus()` -> absorbed into `renderFleetZone()`
- `renderQuotaProgress()` -> absorbed into `renderMissionZone()`
- `renderHarvestCounter()` -> absorbed into `renderMissionZone()`
- `renderResearchProgress()` -> absorbed into `renderMissionZone()`
- `renderEnergyCells()` -> absorbed into `renderSystemsZone()`
- `renderSpeedIndicator()` -> absorbed into `renderWeaponsZone()`
- `renderEnergyBonusIndicator()` -> absorbed into `renderWeaponsZone()`
- `renderBioMatterCounter()` -> absorbed into `renderStatusZone()`
- `renderActivePowerups()` -> absorbed into `renderStatusZone()`
- `UFO.renderEnergyBar()` -> redesigned with segments + energy cubes

### State Additions
```javascript
// Commander in-mission comms
let missionCommanderState = {
    visible: false,
    dialogue: '',
    typewriterIndex: 0,
    typewriterTimer: 0,
    displayTimer: 0,
    slideProgress: 0,
    emotion: 'neutral',
    cooldownTimer: 0,
    minCooldown: 15,  // Minimum seconds between comms
    maxCooldown: 30   // Maximum seconds between comms
};

// HUD animation state
let hudAnimState = {
    weaponsPanelVisible: false,
    weaponsPanelSlide: 0,
    fleetPanelVisible: false,
    fleetPanelSlide: 0,
    commanderPanelSlide: 0,
    energyFlowPhase: 0,
    scanlineOffset: 0
};
```

### Commander In-Mission Dialogue Triggers
```javascript
const MISSION_COMMANDER_DIALOGUES = {
    quotaBehind: [
        "You're falling behind on quota. The mothership is watching.",
        "At this rate, we'll be reassigned to asteroid mining.",
        "QUOTA DEFICIT DETECTED. Increase harvest rate.",
    ],
    quotaOnTrack: [
        "Adequate progress. Don't get complacent.",
        "Bio-matter collection within parameters.",
    ],
    droneDestroyed: [
        "We lost a drone! Those aren't free, you know.",
        "Drone down. Redeploy when able.",
    ],
    coordinatorLowEnergy: [
        "Coordinator energy critical! Get over there!",
        "Your coordinator is dying. CHARGE IT.",
    ],
    killStreak: [
        "Impressive tank elimination rate.",
        "The humans' defenses crumble before us.",
    ],
    lowShield: [
        "Shield integrity critical! Avoid incoming fire!",
        "WARNING: Hull breach imminent!",
    ],
    waveStart: [
        "New wave incoming. Stay sharp.",
        "Sensors detecting increased surface activity.",
    ],
    energyLow: [
        "Energy reserves depleted. Conserve beam usage.",
        "Power levels critical. Disengage beam.",
    ]
};
```

## Responsive Scaling

All zone positions calculated relative to canvas dimensions:
- Zones A, D, F: Left edge, max width 220px or 18% of canvas (whichever is smaller)
- Zone B: Center, 280px wide, centered horizontally
- Zones C, E: Right edge, max width 200px or 16% of canvas
- Minimum canvas width: 800px (below this, reduce font sizes and panel widths proportionally)
- On very wide screens (>1400px), panels stay fixed size, more play area in center

## Implementation Order

1. **Phase 1: NGE Panel System** - Create `renderNGEPanel`, `renderNGEBar`, `renderNGEStatusDot` utility functions
2. **Phase 2: Layout Engine** - Create `renderHUDFrame` with zone calculations
3. **Phase 3: Status Zone** (A) - Score, wave, timer, bio-matter, powerups
4. **Phase 4: Mission Zone** (B) - Redesigned quota, harvest counter, research
5. **Phase 5: Systems Zone** (C) - Shield, energy cubes
6. **Phase 6: Weapons Zone** (D) - Redesigned bombs + missiles
7. **Phase 7: Fleet Zone** (E) - Hierarchical drone/coordinator tree
8. **Phase 8: Commander Zone** (F) - In-mission commander comms
9. **Phase 9: Energy Bar Redesign** - Segmented bar + energy cubes above UFO
10. **Phase 10: Energy Flow Lines** - Animated connections between zones
11. **Phase 11: Progressive Unlock Animations** - Slide/unfold effects
12. **Phase 12: Polish** - Scanlines, hex patterns, data streams, final tweaks
