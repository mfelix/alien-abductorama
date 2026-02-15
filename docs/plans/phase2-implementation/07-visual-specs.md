# Phase 2 Visual Specifications
## Exact Rendering Details for Every Visual Element

**Date**: 2026-02-13
**Status**: FINAL

---

## I. COMMAND HUD LAYOUT (2-Zone First Slice)

### Screen Partition

```
Canvas: 960x540 (or responsive to actual canvas dimensions)

+------------------------------------------------------------------+
|  CMD.STATUS BAR                                            [8,8] |  h=32
+------------------------------------------------------------------+
|                                                                    |
| +--ZONE A---------------------------+ +--ZONE B-----------------+ |
| |  SECTOR A-7          [glyph] KRIX | |  SECTOR B-3      [glyph]| |  h = canvasH - 32 - 120 - 64 - 40
| |                                    | |                         | |
| |  [mini battlefield]               | |  [mini battlefield]     | |
| |                                    | |                         | |
| | THR:███░░ DRN:3 NRG:████░ Q:7/10  | | THR:████░ DRN:1 NRG:██░| |
| +------------------------------------+ +-------------------------+ |
|                                                                    |
| +--CREW.ROSTER--+ +--RES.FLOW----+ +--ORDERS---------+           |  h=120
| | KRIX [●] A-7  | | ENERGY: ██░░ | | [1] SELECT A    |           |
| | NURP [●] B-3  | | BIO-M: 1240  | | [2] SELECT B    |           |
| |                | | DRONES: 4/6  | | [O] OVERRIDE    |           |
| +----------------+ +--------------+ | [D/H/B] ORDERS  |           |
|                                      +------------------+          |
| +--DIR.CHANNEL-----------------------------------------------+    |  h=64
| |  [portrait]  "Don't let Zone B slip, Commander."           |    |
| +------------------------------------------------------------+    |
+------------------------------------------------------------------+
```

### Layout Computation

```javascript
// Constants
const MARGIN = 8;
const CMD_BAR_H = 32;
const BOTTOM_PANELS_H = 120;
const DIR_CHANNEL_H = 64;

// Derived
const zoneAreaY = MARGIN + CMD_BAR_H + MARGIN;
const zoneAreaH = canvas.height - CMD_BAR_H - BOTTOM_PANELS_H - DIR_CHANNEL_H - MARGIN * 5;
const zoneW = Math.floor((canvas.width - MARGIN * 3) / 2);

// Layout object
layout = {
    cmdStatus: {
        x: MARGIN, y: MARGIN,
        w: canvas.width - MARGIN * 2, h: CMD_BAR_H
    },
    zones: [
        { x: MARGIN, y: zoneAreaY, w: zoneW, h: zoneAreaH },
        { x: MARGIN * 2 + zoneW, y: zoneAreaY, w: zoneW, h: zoneAreaH }
    ],
    crewRoster: {
        x: MARGIN,
        y: zoneAreaY + zoneAreaH + MARGIN,
        w: Math.floor(canvas.width * 0.3),
        h: BOTTOM_PANELS_H
    },
    resources: {
        x: Math.floor(canvas.width * 0.3) + MARGIN * 2,
        y: zoneAreaY + zoneAreaH + MARGIN,
        w: Math.floor(canvas.width * 0.35),
        h: BOTTOM_PANELS_H
    },
    orders: {
        x: Math.floor(canvas.width * 0.65) + MARGIN * 3,
        y: zoneAreaY + zoneAreaH + MARGIN,
        w: canvas.width - Math.floor(canvas.width * 0.65) - MARGIN * 4,
        h: BOTTOM_PANELS_H
    },
    dirChannel: {
        x: MARGIN,
        y: canvas.height - DIR_CHANNEL_H - MARGIN,
        w: canvas.width - MARGIN * 2,
        h: DIR_CHANNEL_H
    }
};
```

---

## II. COMMAND STATUS BAR

### Content and Positioning

```
+--CMD.STATUS-----------------------------------------------------------------+
| ▸ CMD.3  |  SCORE: 12,450  |  QUOTA: ████████░░ 78%  |  TIME: 0:42  | CP:2 |
+-----------------------------------------------------------------------------|
```

### Rendering Details

| Element | Font | Color | Position |
|---------|------|-------|----------|
| "CMD." label | bold 11px monospace | #d4a017 (command gold) | NGE panel label position |
| Wave number | bold 16px monospace | #d4a017 | 12px from left edge, vertically centered |
| "SCORE:" label | bold 11px monospace | #888 | After wave number + 16px gap |
| Score value | bold 16px monospace | #fff | Immediately after label |
| "QUOTA:" label | bold 11px monospace | #888 | After score + 16px gap |
| Quota bar | renderNGEBar, w=120, h=12 | Green #0f0 if >=80%, yellow #fc0 if >=50%, red #f44 below | After quota label |
| Quota percentage | bold 11px monospace | Same color as bar | After bar + 4px |
| "TIME:" label | bold 11px monospace | #888 if >10s, #f44 if <=10s | Right-aligned section |
| Timer value | bold 16px monospace | #fff if >10s, #f44 blink if <=10s | After TIME label |
| "CP:" label | bold 11px monospace | #888 | Far right |
| CP value | bold 14px monospace | #d4a017 | After CP label |

### Panel Style

```javascript
renderNGEPanel(x, y, w, h, {
    color: '#d4a017',    // Command gold
    cutCorners: ['tl'],
    alpha: 0.75,
    label: 'CMD.STATUS'
});
```

---

## III. ZONE PANELS

### Zone Panel Structure

```
+--[SECTOR A-7]--------------------------------------[●] KRIX--+
| ──────────────────────────────────────────────────────────── |
|                                                                |
|  ★  ★     ★                  ★        ★    ★                 |  ← Starfield
|       ★          ★                         ★                  |     (dimmed to 30% alpha)
|                                                                |
|              ┌──────┐                                         |  ← Crew UFO
|              │ ◇◇◇◇ │   ╲                                    |     (16x10px ellipse + dome)
|              └──────┘     ╲  beam (2px cyan line)             |
|                            ╲                                  |
|  ▄▄  ▄▄▄      ▄▄    ☻ ☻    ╲  ☻  ☻        ▄▄▄  ▄▄         |  ← Ground plane
| ██████████████████████████████████████████████████████████████ |
| ──────────────────────────────────────────────────────────── |
| THR:████░░ DRN:3 NRG:██████░░ Q:7/10                        |  ← Status strip (14px)
+---------------------------------------------------------------+
```

### Zone Header (Inside Panel, Top 16px)

| Element | Font | Color | Position |
|---------|------|-------|----------|
| Zone name ("SECTOR A-7") | bold 11px monospace | Zone state color | 6px from left, 12px from top |
| Status indicator ("STABLE"/"STRESSED"/etc.) | bold 9px monospace | Zone state color | Right of name + 8px |
| Crew glyph | renderCrewGlyph, 24px | Morale color | Top-right corner, 6px inset |
| Crew name | bold 7px monospace | #aaa | Below glyph |

### Zone Border Colors

| State | Border Color | Border Width | Pulse |
|-------|-------------|-------------|-------|
| Stable | #0f0 | 1.5px | None |
| Stressed | #fc0 | 2px | sin(t/600) * 0.3 + 0.5 alpha, 600ms |
| Crisis | #f44 | 3px | sin(t/200) * 0.3 + 0.5 alpha, 200ms |
| Emergency | #f00 | 3px | Binary flash, 100ms on/off |
| Override active | #0ff | 2px | Steady 0.8 alpha |

### Zone Fill Tint (Background Overlay)

| State | Tint |
|-------|------|
| Stable | rgba(0, 255, 0, 0.03) |
| Stressed | rgba(255, 200, 0, 0.05) |
| Crisis | rgba(255, 0, 0, 0.06) + pulse |
| Override | rgba(0, 255, 255, 0.08) |

### Mini Starfield Rendering

```javascript
// Pre-generate star positions from zone seed (deterministic)
function generateStarPositions(seed, count) {
    const rng = seedRNG(seed);  // Simple seeded RNG
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: rng() * 1.0,  // Normalized 0-1
            y: rng() * 0.7,  // Upper 70% of zone
            brightness: 0.2 + rng() * 0.5,
            size: 1 + Math.floor(rng() * 2)  // 1-2px
        });
    }
    return stars;
}

// Render: ~30-50 stars per zone
ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.3})`; // Dimmed
ctx.fillRect(zx + star.x * zw, zy + star.y * zh, star.size, star.size);
```

### Mini UFO Rendering

```javascript
// Size: ~16px wide, ~10px tall
function renderMiniUFO(zx, zy, zw, zh, ufo) {
    const x = zx + (ufo.x / ZONE_WORLD_W) * zw;
    const y = zy + (ufo.y / ZONE_WORLD_H) * zh;
    const w = 16, h = 6;

    // Hover oscillation
    const hover = Math.sin(Date.now() / 500) * 1.5;

    // Body (ellipse)
    ctx.fillStyle = '#8cc';
    ctx.beginPath();
    ctx.ellipse(x, y + hover, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dome (arc)
    ctx.fillStyle = '#aee';
    ctx.beginPath();
    ctx.arc(x, y + hover - 3, 5, Math.PI, 0);
    ctx.fill();

    // Glow
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(x, y + hover, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}
```

### Mini Tank Rendering

```javascript
// Size: ~12px wide, ~6px tall
function renderMiniTank(zx, zy, zw, zh, tank) {
    const x = zx + (tank.x / ZONE_WORLD_W) * zw;
    const groundY = zy + zh - 28; // Above status strip

    // Body (rectangle)
    ctx.fillStyle = '#464';
    ctx.fillRect(x - 6, groundY - 6, 12, 6);

    // Turret (line pointing at UFO)
    ctx.strokeStyle = '#686';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, groundY - 6);
    ctx.lineTo(x + Math.cos(tank.turretAngle) * 8, groundY - 6 + Math.sin(tank.turretAngle) * 8);
    ctx.stroke();
}
```

### Mini Target Rendering

```javascript
// Targets rendered as colored circles, 4-6px diameter
const TARGET_MINI_COLORS = {
    human: '#0f0',
    cow: '#fa0',
    sheep: '#fff',
    cat: '#f80',
    dog: '#a86'
};

function renderMiniTarget(zx, zy, zw, zh, target) {
    const x = zx + (target.x / ZONE_WORLD_W) * zw;
    const groundY = zy + zh - 28;
    const y = target.beingAbducted ? groundY - target.abductionProgress * 40 : groundY - 3;

    ctx.fillStyle = TARGET_MINI_COLORS[target.type];
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
}
```

### Mini Beam Rendering

```javascript
// Thin cyan line from UFO to target
function renderMiniBeam(zx, zy, zw, zh, ufo) {
    if (!ufo.beamActive || !ufo.beamTarget) return;

    const ux = zx + (ufo.x / ZONE_WORLD_W) * zw;
    const uy = zy + (ufo.y / ZONE_WORLD_H) * zh;
    const tx = zx + (ufo.beamTarget.x / ZONE_WORLD_W) * zw;
    const ty = zy + zh - 28 - ufo.beamTarget.abductionProgress * 40;

    // Beam cone (thin trapezoid)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ux, uy + 4);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Glow
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(ux, uy + 4);
    ctx.lineTo(tx, ty);
    ctx.stroke();
}
```

### Zone Status Strip (Bottom 14px of Zone Panel)

```
| THR:████░░  DRN:3  NRG:██████░░  Q:7/10 |
```

| Element | Width | Color Logic |
|---------|-------|------------|
| THR (threat) bar | 40px | Green if 0-1 tanks, yellow if 2-3, red if 4+ |
| DRN (drones) text | 30px | #0af |
| NRG (energy) bar | 50px | Green >50%, yellow 25-50%, red <25% |
| Q (quota) text | 40px | Green if on pace, yellow if behind, red if far behind |

All rendered in 9px bold monospace. Bars use `renderNGEBar()` at 10px height.

---

## IV. CREW PORTRAITS

### Rendering Modes

#### Glyph Mode (24-32px) -- Used in Zone Panel Corners

Pure silhouette. No internal detail.

```javascript
function renderCrewGlyph(x, y, size, crew) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;
    const reckless = crew.traits.reckless;

    // Morale dot (below silhouette)
    const moraleColor = getMoraleColor(crew.morale);
    ctx.fillStyle = moraleColor;
    ctx.beginPath();
    ctx.arc(cx, y + s - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Silhouette shape based on trait
    ctx.fillStyle = getTraitSkinColor(reckless);
    if (reckless > 0.6) {
        // Diamond (reckless)
        ctx.beginPath();
        ctx.moveTo(cx, cy - s * 0.3);
        ctx.lineTo(cx + s * 0.2, cy);
        ctx.lineTo(cx, cy + s * 0.2);
        ctx.lineTo(cx - s * 0.2, cy);
        ctx.closePath();
        ctx.fill();
    } else if (reckless < 0.4) {
        // Circle (cautious)
        ctx.beginPath();
        ctx.arc(cx, cy - s * 0.05, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Oval (balanced)
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 0.05, s * 0.18, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

#### Portrait Mode (48-64px) -- Used in Crew Roster Panel

Head + eyes + morale aura + core indicator.

```javascript
function renderCrewPortrait(x, y, size, crew) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s * 0.4; // Head centered upper portion
    const reckless = crew.traits.reckless;

    // Morale aura (soft radial glow behind head)
    const moraleColor = getMoraleColor(crew.morale);
    const auraPulse = crew.morale < 0.3
        ? Math.sin(Date.now() / 150) * 0.3 + 0.4
        : 0.3 + crew.morale * 0.3;
    ctx.save();
    ctx.globalAlpha = auraPulse;
    ctx.fillStyle = moraleColor;
    ctx.shadowColor = moraleColor;
    ctx.shadowBlur = s * 0.25;
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 0.35, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Head shape (trait-driven)
    ctx.fillStyle = getTraitSkinColor(reckless);
    if (reckless > 0.6) {
        // Angular cranium
        ctx.beginPath();
        ctx.moveTo(cx, cy - s * 0.3);
        ctx.lineTo(cx + s * 0.2, cy - s * 0.08);
        ctx.lineTo(cx + s * 0.13, cy + s * 0.08);
        ctx.lineTo(cx, cy + s * 0.14);
        ctx.lineTo(cx - s * 0.13, cy + s * 0.08);
        ctx.lineTo(cx - s * 0.2, cy - s * 0.08);
        ctx.closePath();
    } else if (reckless < 0.4) {
        // Rounded cranium
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 0.05, s * 0.22, s * 0.26, 0, 0, Math.PI * 2);
    } else {
        // Classic oval
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 0.04, s * 0.18, s * 0.28, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Eyes
    renderCrewEyes(cx, cy + s * 0.02, s, crew);

    // Core indicator (chest dot)
    const coreY = cy + s * 0.3;
    const perf = crew.getPerformanceModifier ? crew.getPerformanceModifier() : 0.5;
    const coreColor = perf > 0.7 ? '#0ff' : perf > 0.4 ? '#fc0' : '#f44';
    ctx.fillStyle = coreColor;
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = s * 0.08;
    ctx.beginPath();
    ctx.arc(cx, coreY, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}
```

#### Eye Expression System

```javascript
function renderCrewEyes(cx, cy, s, crew) {
    const eyeY = cy;
    const eyeSpacing = s * 0.09;
    let eyeW = s * 0.07;
    let eyeH = s * 0.035;
    let eyeSlant = 0.8;

    // Expression modifiers
    if (crew.morale > 0.8) { eyeH *= 1.2; eyeSlant = 0.6; }
    else if (crew.morale < 0.2) { eyeH *= 0.6; eyeSlant = 1.2; }

    // Stress jitter
    if (crew.stress > 0.8) {
        eyeW += Math.sin(Date.now() * 0.05) * s * 0.005;
    }

    // Void-black almond eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Glassy reflection
    ctx.fillStyle = 'rgba(180, 255, 200, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing - eyeW * 0.3, eyeY - eyeH * 0.2,
                s * 0.01, s * 0.007, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing + eyeW * 0.3, eyeY - eyeH * 0.2,
                s * 0.01, s * 0.007, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();
}
```

### Skin Color Mapping

```javascript
function getTraitSkinColor(reckless) {
    // Reckless = warmer green, Cautious = cooler teal
    if (reckless > 0.7) return '#1a8040';  // warm green
    if (reckless > 0.5) return '#0a7040';  // standard alien green
    if (reckless > 0.3) return '#0a6050';  // blue-green
    return '#0a5060';                       // cool teal
}
```

### Morale Color Spectrum

```javascript
function getMoraleColor(morale) {
    if (morale > 0.8) return '#4cff4c';  // Thriving
    if (morale > 0.6) return '#0c8';     // Content
    if (morale > 0.4) return '#0aa';     // Neutral
    if (morale > 0.2) return '#da0';     // Stressed
    return '#f22';                        // Breaking
}
```

---

## V. THE DIRECTOR PORTRAIT

### Anatomy Comparison: Director vs Commander

| Feature | Commander (Phase 1) | Director (Phase 2) |
|---------|--------------------|--------------------|
| Skin color | #0a5 (warm green) | #2a3a4a (cold gray-blue) |
| Eye size | 0.12 * size width | 0.18 * size width (50% larger) |
| Eye slant | 0.8 rad | 1.2 rad (steeper) |
| Eye reflection | rgba(180, 255, 200, 0.35) (green-white) | rgba(180, 200, 255, 0.4) (blue-white) |
| Head shape | Smooth ellipse + gentle taper | Angular ellipse + sharp jaw |
| Mouth | None | Thin line (displeasure only) |
| Nostrils | Two dots (#073) | Two slits (angled lines, #1a2a3a) |
| Background | Green holographic (#0a0 scan) | Crimson void (#1a0000) |
| Scanlines | 3px spacing, green | 4px spacing, red (slower = heavier) |
| Static noise | Green pixels, 5% chance | Horizontal tear lines, 8% chance |
| Border | Emotion-colored | Always Director red family |
| Extra features | None | Cranial ridges (3 arced lines), military collar |

### Director Portrait Rendering (Detailed)

```javascript
function renderDirectorPortrait(x, y, size, mood) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;

    // Background: crimson void
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 4);
    ctx.fill();

    // Scanlines (slow, 4px spacing, Director red)
    ctx.fillStyle = 'rgba(170, 0, 0, 0.04)';
    for (let i = 0; i < s; i += 4) {
        ctx.fillRect(x, y + i, s, 1);
    }

    // Horizontal tear interference (8% chance)
    if (Math.random() < 0.08) {
        const tearY = y + Math.random() * s;
        const tearH = 2 + Math.random() * 4;
        ctx.fillStyle = 'rgba(170, 0, 0, 0.3)';
        ctx.fillRect(x, tearY, s, tearH);
        ctx.fillStyle = 'rgba(0, 0, 170, 0.15)';
        ctx.fillRect(x + 3, tearY + 1, s, tearH - 1);
    }

    const headCY = cy - s * 0.02;

    // Cranium (angular ellipse, gray-blue)
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.ellipse(cx, headCY - s * 0.08, s * 0.3, s * 0.34, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Cranial ridges (3 arced lines)
    ctx.strokeStyle = 'rgba(60, 80, 100, 0.4)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 3; r++) {
        const ridgeY = headCY - s * (0.25 - r * 0.06);
        ctx.beginPath();
        ctx.ellipse(cx, ridgeY, s * (0.25 - r * 0.03), s * 0.02, 0, 0, Math.PI);
        ctx.stroke();
    }

    // Lower face (sharp jaw, pointed chin)
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, headCY - s * 0.08);
    ctx.lineTo(cx - s * 0.15, headCY + s * 0.2);
    ctx.lineTo(cx, headCY + s * 0.26);
    ctx.lineTo(cx + s * 0.15, headCY + s * 0.2);
    ctx.lineTo(cx + s * 0.3, headCY - s * 0.08);
    ctx.fill();

    // Eyes: large, menacing
    const eyeY = headCY + s * 0.01;
    const eyeSpacing = s * 0.13;
    const eyeW = s * 0.18;
    const eyeH = s * 0.06;
    const eyeSlant = 1.2;

    // Eye sockets (dark recesses)
    ctx.fillStyle = 'rgba(10, 15, 25, 0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.3, eyeH * 2, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.3, eyeH * 2, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Mood eye glow
    const eyeGlowColors = {
        furious:    'rgba(255, 0, 0, 0.5)',
        displeased: 'rgba(255, 80, 0, 0.3)',
        neutral:    'rgba(100, 120, 160, 0.2)',
        satisfied:  'rgba(170, 120, 0, 0.2)'
    };
    ctx.fillStyle = eyeGlowColors[mood] || eyeGlowColors.neutral;
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.1, eyeH * 1.3, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.1, eyeH * 1.3, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Void eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Cold reflections (blue-white, not green-white)
    ctx.fillStyle = 'rgba(180, 200, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing - eyeW * 0.2, eyeY - eyeH * 0.2,
                s * 0.025, s * 0.015, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing + eyeW * 0.2, eyeY - eyeH * 0.2,
                s * 0.025, s * 0.015, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Nostril slits
    ctx.strokeStyle = '#1a2a3a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.03, headCY + s * 0.11);
    ctx.lineTo(cx - s * 0.015, headCY + s * 0.14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.03, headCY + s * 0.11);
    ctx.lineTo(cx + s * 0.015, headCY + s * 0.14);
    ctx.stroke();

    // Mouth line (only when displeased/furious)
    if (mood === 'furious' || mood === 'displeased') {
        ctx.strokeStyle = 'rgba(20, 30, 45, 0.6)';
        ctx.lineWidth = 1;
        const mouthY = headCY + s * 0.18;
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.06, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + s * 0.015, cx + s * 0.06, mouthY);
        ctx.stroke();
    }

    // Military collar
    ctx.strokeStyle = '#3a4a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, headCY + s * 0.28);
    ctx.lineTo(cx + s * 0.12, headCY + s * 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.1, headCY + s * 0.32);
    ctx.lineTo(cx + s * 0.1, headCY + s * 0.32);
    ctx.stroke();
    // Insignia dot
    ctx.fillStyle = '#a00';
    ctx.beginPath();
    ctx.arc(cx, headCY + s * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Border (mood-colored from Director red family)
    ctx.strokeStyle = mood === 'furious' ? '#f00' :
                     mood === 'displeased' ? '#c22' :
                     mood === 'satisfied' ? '#a80' : '#a00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 4);
    ctx.stroke();
}
```

### Director Blink System

```javascript
// The Director blinks every ~4 seconds
// Eyes close to slits for 200ms
const BLINK_INTERVAL = 4000;  // ms
const BLINK_DURATION = 200;   // ms

function getDirectorBlinkState(time) {
    const cycle = time % BLINK_INTERVAL;
    if (cycle > BLINK_INTERVAL - BLINK_DURATION) {
        return true;  // Eyes closing
    }
    return false;
}

// During blink: eyeH *= 0.2 (slits instead of full eyes)
```

---

## VI. DIRECTOR TRANSMISSION VISUAL TREATMENT

### Screen Effect (Active During Transmission)

```javascript
function renderDirectorScreenEffect(active) {
    if (!active) return;

    // Red overlay: rgba(170, 0, 0, 0.04)
    // With heartbeat pulse: 800ms cycle
    const pulse = Math.sin(Date.now() / 800 * Math.PI) * 0.02 + 0.04;
    ctx.fillStyle = `rgba(170, 0, 0, ${pulse})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

### Transmission Panel

```javascript
renderNGEPanel(layout.dirChannel.x, layout.dirChannel.y,
               layout.dirChannel.w, layout.dirChannel.h, {
    color: '#c22',                    // Director border
    cutCorners: ['br'],
    alpha: 0.85,                      // Darker than normal panels
    label: 'DIR.CHANNEL'
});

// Label color override: #f33 instead of standard
// Background fill override: rgba(30, 0, 0, 0.85) instead of standard
```

### Director Typewriter Text

```
Speed:        15 chars/sec (vs commander's 25 -- slower, heavier)
Text color:   #f44
Background:   rgba(30, 0, 0, 0.85)
Font:         13px monospace
Voice SFX:    Sawtooth at 90Hz, 4Hz LFO modulation
              (deeper and slower than commander's 150Hz/8Hz)
```

---

## VII. PROMOTION CINEMATIC VISUAL TIMELINE

### Phase A: The Call (0.0s - 3.0s)

| Time | Visual | Canvas Operations |
|------|--------|-------------------|
| 0.0s | Wave summary holds. 500ms silence. | Freeze frame |
| 0.5s | Crimson panel appears: "INCOMING -- PRIORITY: SUPREME" | `renderNGEPanel` with `#a00`, `renderHexDecodeText` |
| 0.5s | Text FLICKERS (alternating alpha 0.3/1.0 at 100ms) | `globalAlpha` toggle |
| 1.0s | Commander portrait GLITCHES (horizontal tear lines) | `drawImage(canvas, ...)` with horizontal offset slices |
| 1.2s | Commander dissolves to static | Green noise pixels replace portrait, spreading |
| 1.5s | Director materializes (line-by-line, top to bottom, 1.5s) | Render portrait rows using clip rect advancing down |
| 2.0s | Typewriter begins: "Impressive performance, Operator..." | #f44 text, 15 chars/sec, garbled voice SFX |
| 3.0s | Text complete. Director portrait fully rendered. | Hold 200ms |

### Phase B: The Zoom (3.0s - 6.0s)

| Time | Visual | Canvas Operations |
|------|--------|-------------------|
| 3.0s | "YOU ARE HEREBY PROMOTED TO ZONE COMMANDER" | 24px bold #d4a017, ctx.shadowBlur=16, gold glow, pulse 400ms |
| 3.5s | Camera begins pulling back | `ctx.translate(cw/2, ch/2); ctx.scale(zoom, zoom); ctx.translate(-cw/2, -ch/2)` where zoom = 1.0 -> 0.5 over 2.5s, eased |
| 4.0s | Phase 1 HUD panels power down, LEFT to RIGHT | Per-panel: border -> #555, content -> static noise, 300ms per panel staggered |
| 5.0s | Second zone materializes to the right | Bayer dither noise cloud -> wireframe -> solidify. Reuse `BAYER4x4` pattern from `ufoPhaseInState` |
| 5.5s | Both zones visible at half size | Phase 1 scene still animating (targets, tanks, beam) at reduced scale |

### Phase C: The Flash (6.0s - 8.0s)

| Time | Visual | Canvas Operations |
|------|--------|-------------------|
| 6.0s | BRIGHT WHITE FLASH | `ctx.fillStyle='#fff'; ctx.fillRect(0,0,cw,ch)` for 200ms |
| 6.2s | Flash fades. Command HUD skeleton in gold wireframe. | Gold borders only, no content. `strokeStyle='#d4a017'` |
| 6.5s | COMMAND BOOT SEQUENCE begins | `initCommandBoot()` -- gold variant of `renderPanelBootOverlay()` |
| 7.0s | Panels boot individually with diagnostic text | CMD.STATUS -> CREW.ROSTER -> RESOURCES -> DIR.CHANNEL |
| 8.0s | "COMMAND MODE ACTIVATED" | 32px bold #d4a017, shadowBlur=20, pulse twice, fade |

### Phase D: The Settling (8.0s - 10.0s)

| Time | Visual | Canvas Operations |
|------|--------|-------------------|
| 8.5s | Boot overlays fade. Real content populates panels. | Zone battlefields begin rendering. Status bars populate. |
| 9.0s | Director voice: "Do not disappoint me." | Typewriter, Director panel slides in, #f44 text |
| 9.5s | Director panel slides out. | easeInCubic, 300ms |
| 10.0s | First command wave begins. Player has control. | Transition to `COMMAND` state, subState = `BOOT` for wave-level boot |

---

## VIII. COMMAND BOOT SEQUENCE (Between Waves)

### Gold Variant of Phase 1 Boot

The command boot reuses the Phase 1 `renderPanelBootOverlay()` function but with gold theming:

| Property | Phase 1 Boot | Command Boot |
|----------|-------------|-------------|
| Border trace color | #0ff (cyan) | #d4a017 (gold) |
| Diagnostic text color | #0ff | #d4a017 |
| Panel overlay bg | rgba(5, 8, 18, 0.9) | rgba(18, 14, 5, 0.9) (warm dark) |
| Boot sound frequency | Higher (cyan feel) | Warmer (amber feel) |
| Panel boot stagger | 100ms apart | 100ms apart (same timing) |

### Diagnostic Text per Panel

```
CMD.STATUS:   "COMMAND SYSTEMS... INITIALIZING"
              "WAVE 3... STANDING BY"
ZONE A:       "ZONE ARRAY [A]... ONLINE"
              "CREW ASSIGNMENT... CONFIRMED"
ZONE B:       "ZONE ARRAY [B]... ONLINE"
              "CREW ASSIGNMENT... CONFIRMED"
CREW.ROSTER:  "PERSONNEL DATABASE... LOADED"
              "ROSTER INTEGRITY... VERIFIED"
RESOURCES:    "RESOURCE PIPELINE... CONNECTED"
              "TRANSIT EFFICIENCY... 90%"
DIR.CHANNEL:  "DIRECTOR UPLINK... ESTABLISHED"
              "SECURE CHANNEL... ACTIVE"
```

---

## IX. EMERGENCY OVERRIDE VISUAL EFFECTS

### Zoom-In Transition (0.5s)

```javascript
// Ease-in zoom from command view to zone fills screen
const progress = easeInCubic(elapsed / 0.5);
const zoneRect = layout.zones[overrideZoneIdx];

// Interpolate viewport from command view to zone
const viewX = lerp(0, zoneRect.x, progress);
const viewY = lerp(0, zoneRect.y, progress);
const viewW = lerp(canvas.width, zoneRect.w, progress);
const viewH = lerp(canvas.height, zoneRect.h, progress);

ctx.save();
ctx.translate(-viewX * (canvas.width / viewW - 1), -viewY * (canvas.height / viewH - 1));
ctx.scale(canvas.width / viewW, canvas.height / viewH);
// Render zoomed zone
ctx.restore();
```

### During Override (15 seconds)

```
+--EMERGENCY OVERRIDE [SECTOR A-7]--15s--+
|                                          |
|  Full-screen zone rendering              |
|  (same as Phase 1 battlefield scale)     |
|  Player controls UFO directly            |
|                                          |
|  [Large countdown timer at top center]   |
|                                          |
| NRG:████████░░   QUOTA:8/10   BEAM:ON   |
+------------------------------------------+
```

| Element | Spec |
|---------|------|
| Override flash text | "EMERGENCY OVERRIDE" in #f44, renderHexDecodeText, 24px bold |
| Timer | Bold 28px monospace, #fff, center top. Turns #f44 at 3s remaining. |
| Zone border | Override cyan (#0ff), 3px, steady |
| Mini HUD | Simplified energy bar + quota counter at bottom |
| At 3s remaining | Screen edge red pulse, "RETURNING TO COMMAND" text flash |
| Gold ghost afterimage | When zoom-out completes, 3-second fading gold outline at override zone |

### Zoom-Out Transition (0.5s)

Reverse of zoom-in. Zone shrinks back to its panel position. Command HUD panels fade back in. Director disapproval transmission triggers immediately.

---

## X. REPORT CARD VISUAL LAYOUT

### Full Screen Overlay

```
+--◈ PERFORMANCE REVIEW — WAVE 3------------------------------------------+
| ──────────────────────────────────────────────────────────────────────── |
|                                                                          |
|  +--------+  "Your Zone A numbers are... acceptable.                    |
|  |  ◉  ◉  |   Zone B is a disaster.                                    |
|  |        |   I expected more from you, Commander."                     |
|  +--------+                                                              |
|                                                                          |
|  ZONE A  ████████████░░░  82%  [MET]        ← Green bar, green text    |
|  ZONE B  ████░░░░░░░░░░░  34%  [MISSED]     ← Red bar, red text       |
|                                                                          |
|  ──────────────────────────────────────────────────────────────────      |
|  OVERALL QUOTA:  ██████████░░  58%                                       |
|  DIRECTOR MOOD:  ▸ DISPLEASED                                            |
|                                                                          |
|  ── RESPOND ─────────────────────────────────────────────────────       |
|  [1] "We had equipment failures in Zone B."       ← Spin (Politics)    |
|  [2] "I take full responsibility."                 ← Accountability     |
|  [3] "Zone A exceeded targets — focus there."      ← Deflect (Eng)     |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Panel Style

```javascript
renderNGEPanel(panelX, panelY, panelW, panelH, {
    color: '#a00',       // Director red
    cutCorners: ['tl', 'br'],
    alpha: 0.9,
    label: 'PERFORMANCE REVIEW'
});
```

### Element Details

| Element | Font | Color |
|---------|------|-------|
| Header | bold 14px monospace | #a00 |
| Director dialogue | 13px monospace | #f44 |
| Zone label | bold 11px monospace | #888 |
| Zone bar | renderNGEBar, h=14 | Green if met, red if missed |
| Zone percentage | bold 11px monospace | Matches bar color |
| [MET]/[MISSED] tag | bold 9px monospace | #0f0 / #f44 |
| Overall quota bar | renderNGEBar, h=16 | Weighted color |
| Director mood text | bold 11px monospace | Mood color (see Director border color table) |
| Response options | 12px monospace | #aaa, selected = #fff with gold underline |
| Response key badge | renderNGEKeyBadge | Gold border |

### Reveal Animation

1. Border traces at 0.0s (reuse `renderPanelBorderTrace` pattern)
2. Header hex-decodes at 0.3s
3. Director portrait fades in at 0.5s (line-by-line)
4. Dialogue typewriters at 0.8s (15 chars/sec)
5. Zone bars animate from 0% to actual at 2.0s (500ms per zone, staggered)
6. Overall bar animates at 3.0s
7. Response options fade in at 3.5s

---

## XI. SIDEBAR PANELS

### CREW.ROSTER Panel

```javascript
renderNGEPanel(rect.x, rect.y, rect.w, rect.h, {
    color: '#0f0',
    cutCorners: ['tr'],
    alpha: 0.75,
    label: 'CREW.ROSTER'
});
```

Content per crew member row (2 rows for first slice):

```
| [portrait 32px] KRIX  ★★★  [A-7]  ▸ RECKLESS |
|                 MORALE: ██████░░               |
```

| Element | Font | Color |
|---------|------|-------|
| Portrait | renderCrewPortrait, 32px | -- |
| Name | bold 11px monospace | #0f0 |
| Performance stars | bold 9px monospace | #fc0 (gold) |
| Zone assignment | bold 9px monospace | #0ff |
| Trait label | bold 7px monospace | Trait color (reckless=#f44, cautious=#0af) |
| Morale bar | renderNGEBar, w=60, h=8 | Morale spectrum color |

### RESOURCES Panel

```javascript
renderNGEPanel(rect.x, rect.y, rect.w, rect.h, {
    color: '#f80',
    cutCorners: ['bl'],
    alpha: 0.75,
    label: 'RES.FLOW'
});
```

Content:

```
| ENERGY:  ██████░░  64%    |
| BIO-M:   1,240            |
| DRONES:  4/6              |
| CMD.PT:  2                |
```

| Element | Font | Color |
|---------|------|-------|
| Labels | bold 9px monospace | #888 |
| Energy bar | renderNGEBar, w=80, h=10 | Green/yellow/red by threshold |
| Energy % | bold 11px monospace | Matches bar |
| Bio-matter value | bold 11px monospace | #0f0 |
| Drones | bold 11px monospace | #48f |
| Command points | bold 11px monospace | #d4a017 |

### ORDERS Panel

```javascript
renderNGEPanel(rect.x, rect.y, rect.w, rect.h, {
    color: '#0ff',
    cutCorners: ['tl'],
    alpha: 0.75,
    label: 'ORDERS'
});
```

Content:

```
| [1] SELECT ZONE A     |
| [2] SELECT ZONE B     |
| [O] OVERRIDE (1 LEFT) |
| ───────────────────── |
| [D]EF  [B]AL  [H]ARV  |  ← Fleet orders for selected zone
```

Key badges rendered via `renderNGEKeyBadge()`.

---

## XII. RESOURCE FLOW PARTICLES (Between Zones)

### Particle Specification

```javascript
// When a resource transfer is active
const particle = {
    x: sourceZone.x + sourceZone.w,       // Start at source edge
    y: sourceZone.y + sourceZone.h / 2,
    targetX: destZone.x,                    // End at dest edge
    targetY: destZone.y + destZone.h / 2,
    progress: 0,                            // 0 to 1
    speed: 0.3,                             // Progress per second
    color: type === 'energy' ? '#0ff' : '#0f0',
    size: 3,
    scatter: Math.random() * 0.1 - 0.05    // Perpendicular offset
};
```

### Rendering

```javascript
function renderResourceFlowParticles(transfers) {
    for (const transfer of transfers) {
        const progress = transfer.elapsed / transfer.delay;
        // Spawn 1 particle per 100ms while transfer active
        for (const p of transfer.particles) {
            const t = p.progress;
            // Bezier curve path (slight arc)
            const midX = (p.x + p.targetX) / 2;
            const midY = (p.y + p.targetY) / 2 - 30 + p.scatter * 200;
            const px = bezierPoint(p.x, midX, p.targetX, t);
            const py = bezierPoint(p.y, midY, p.targetY, t);

            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}
```

---

## XIII. ZONE DECAY VISUAL EFFECTS

### Decay Levels

| Level | Visual Treatment |
|-------|-----------------|
| 0 (fresh) | Crisp rendering, full color, standard scanlines |
| 1 | Slight desaturation (ctx.filter = 'saturate(0.8)'), occasional 1-2px glitch lines |
| 2 | More desaturation (saturate(0.6)), frequent glitch lines, entity jitter (1px random offset) |
| 3 | Heavy desaturation (saturate(0.3)), horizontal tear effect, entities flicker (random alpha 0.5-1.0) |
| 4 | Near-grayscale (saturate(0.1)), heavy static overlay, drift timer deconstructing |

### Static Noise Overlay (Level 2+)

```javascript
function renderDecayNoise(zx, zy, zw, zh, decayLevel) {
    const count = decayLevel * 5;
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08 * decayLevel})`;
        ctx.fillRect(
            zx + Math.random() * zw,
            zy + Math.random() * zh,
            1 + Math.random() * 3,
            1
        );
    }
}
```

### Horizontal Tear Effect (Level 3+)

```javascript
function renderDecayTear(zx, zy, zw, zh) {
    const tearY = zy + Math.random() * zh;
    ctx.drawImage(canvas,
        zx, tearY, zw, 3,
        zx + (Math.random() - 0.5) * 6, tearY, zw, 3
    );
}
```

---

## XIV. COMPLETE COLOR REFERENCE

### Phase 2 Color Palette (All Hex Values)

```
COMMAND AUTHORITY
  Command Gold Primary:     #d4a017
  Command Gold Glow:        rgba(212, 160, 23, 0.3)
  Command Gold Border:      #b8860b
  Command Gold Label:       #daa520
  Command Boot Overlay BG:  rgba(18, 14, 5, 0.9)

DIRECTOR RED SYSTEM
  Director Primary:         #a00
  Director Glow:            rgba(170, 0, 0, 0.4)
  Director Border:          #c22
  Director Text:            #f33
  Director Speech Text:     #f44
  Director Satisfied:       #a80
  Director Background:      rgba(30, 0, 0, 0.85)
  Director Skin:            #2a3a4a
  Director Collar:          #3a4a5a

CREW MORALE SPECTRUM
  Thriving:     #4cff4c    (glow radius 8px)
  Content:      #0c8       (glow radius 4px)
  Neutral:      #0aa       (minimal glow)
  Stressed:     #da0       (pulse 500ms)
  Strained:     #f60       (pulse 300ms)
  Breaking:     #f22       (pulse 150ms, particles)
  Burned Out:   #555       (no glow, static overlay)

TRAIT COLORS
  Reckless:     #f44 glow, skin #1a8040
  Cautious:     #0af glow, skin #0a5060
  Balanced:     #0ff glow, skin #0a7040

ZONE STATE BORDERS
  Stable:       #0f0       (1.5px, no pulse)
  Stressed:     #fc0       (2px, 600ms pulse)
  Crisis:       #f44       (3px, 200ms pulse)
  Emergency:    #f00       (3px, 100ms flash)
  Override:     #0ff       (2px, steady)

ZONE FILL TINTS
  Stable:       rgba(0, 255, 0, 0.03)
  Stressed:     rgba(255, 200, 0, 0.05)
  Crisis:       rgba(255, 0, 0, 0.06)
  Override:     rgba(0, 255, 255, 0.08)

EXISTING PHASE 1 (REUSED)
  Cyan:         #0ff
  Green:        #0f0
  Yellow:       #ff0
  Orange:       #f80
  Red:          #f44
  Magenta:      #f0f
  White:        #fff
  Panel Fill:   rgba(5, 8, 18, 0.65)
  Dim Gray:     #333
  Mid Gray:     #888
  Light Gray:   #aaa
```

---

## XV. ANIMATION TIMING REFERENCE

### Always Running (Command Phase)

| Animation | Rate | Implementation |
|-----------|------|---------------|
| Scanline scroll | 80 +/- 60 px/s, burst 2x every 5s | Reuse Phase 1 `renderColumnScanlines` |
| Zone border pulse (stressed+) | 600ms / 200ms / 100ms | `sin(Date.now() / rate)` |
| Crew morale aura | Continuous breathing | `sin(Date.now() / 150-1000)` based on morale |
| Director blink | Every 4s, 200ms | `Date.now() % 4000 > 3800` |
| Crew UFO hover | 2px oscillation | `sin(Date.now() / 500) * 1.5` |
| Command gold glow | Gentle pulse | `sin(Date.now() / 1200) * 0.15 + 0.85` alpha |
| Director heartbeat (during transmission) | 800ms cycle | `sin(Date.now() / 800 * PI)` |

### Scripted (One-Shot)

| Animation | Duration | Easing |
|-----------|----------|--------|
| Panel slide-in | ~25 frames | easeOutCubic (0.04/frame) |
| Panel boot overlay | 0.8-1.0s per panel | Linear progress |
| Border trace | 0.75s full perimeter | Linear with SFX at corners |
| Hex decode text | ~1s for full decode | Per-character random settle |
| Typewriter (Director) | 15 chars/sec | Linear, garble SFX per char |
| Typewriter (Commander) | 25 chars/sec | Linear, garble SFX per char |
| Override zoom-in | 0.5s | easeInCubic |
| Override zoom-out | 0.5s | easeOutCubic |
| Report card bar fill | 500ms per bar | easeOutQuad |
| Promotion camera zoom | 2.5s (1.0 -> 0.5 scale) | easeInOutCubic |
| Promotion white flash | 200ms | Linear fade |

---

## XVI. RENDERING ORDER (Back to Front)

```
1.  ctx.clearRect(0, 0, canvas.width, canvas.height)    // Black void
2.  FOR EACH zone:
      a. ctx.save()
      b. ctx.clip() to zone rectangle
      c. Zone fill tint (state-dependent background color)
      d. Mini starfield (30-50 fillRect calls)
      e. Mini ground plane (gradient rectangle)
      f. Mini targets (colored circles)
      g. Mini tanks (rectangles + turret lines)
      h. Mini crew UFO (ellipse + dome + glow)
      i. Mini beam (if active)
      j. Zone particles
      k. Decay filter (if driftLevel > 0)
      l. ctx.restore()
      m. Zone status bar (below zone, outside clip)
      n. Zone border + pulse effect
      o. Crew glyph (top-right corner)
      p. Zone header text
3.  Resource flow particles (between zones)
4.  Command status bar (top)
5.  Sidebar panels (crew roster, resources, orders)
6.  Director channel panel (bottom)
7.  Director screen effect (red overlay, if transmitting)
8.  Boot overlays (if subState === 'BOOT')
9.  Override transition overlay (if subState === 'OVERRIDE')
10. Alert notifications (future)
11. Global scanlines (reuse Phase 1 renderColumnScanlines)
```

---

## XVII. PERFORMANCE BUDGET (2-Zone First Slice)

### Estimated Draw Calls Per Frame

| System | Calls |
|--------|-------|
| Zone A starfield | ~40 |
| Zone A ground | 5 |
| Zone A UFO | 5 |
| Zone A tanks (2) | 6 |
| Zone A targets (5) | 5 |
| Zone A beam | 4 |
| Zone A status bar | 12 |
| Zone A border/header | 6 |
| Zone B (same) | ~83 |
| Command status bar | ~15 |
| Crew roster panel | ~20 |
| Resources panel | ~12 |
| Orders panel | ~10 |
| Director channel | ~15 |
| Resource particles | ~10 |
| Scanlines | ~20 |
| **TOTAL** | **~346** |

Phase 1 already does ~800 draw calls. 346 is well within 60fps budget on 2020 hardware.

No off-screen canvas optimization needed for the first slice.

---

*This document provides exact pixel-level specifications for every visual element in the Command Phase first slice. An agent implementing any visual component should find the exact colors, fonts, sizes, positions, and animation timings here without needing to read game.js or any other input document.*
