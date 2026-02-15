// ============================================
// ZONE RENDERER — Mini-Battlefield Rendering
// Renders zone panels as CCTV-style monitor views
// ============================================

const ZONE_WORLD_W = COMMAND_CONFIG.ZONE.WORLD_W;
const ZONE_WORLD_H = COMMAND_CONFIG.ZONE.WORLD_H;
const ZONE_GROUND_Y = COMMAND_CONFIG.ZONE.GROUND_Y; // 270 in world coords
const ZONE_STATUS_STRIP_H = 14;
const ZONE_HEADER_H = 16;

// Scale factor: dynamically computed per renderZonePanel call.
// 1.0 = 16-up reference size (everything looks right).
// Larger views (4-up, 2-up) get sf > 1 so entities and HUD
// maintain the same visual proportion as the 16-up view.
let _zoneSF = 1;

// Target colors for mini rendering
const TARGET_MINI_COLORS = {
    human: '#0f0',
    cow: '#fa0',
    sheep: '#fff',
    cat: '#f80',
    dog: '#a86'
};

// Zone state border config
const ZONE_BORDER_CONFIG = {
    stable:    { color: '#0f0', width: 1.5, pulse: false },
    stressed:  { color: '#fc0', width: 2,   pulse: true, rate: 600 },
    crisis:    { color: '#f44', width: 3,   pulse: true, rate: 200 },
    emergency: { color: '#f00', width: 3,   pulse: true, rate: 100, binary: true },
    override:  { color: '#0ff', width: 2,   pulse: false, alpha: 0.8 }
};

// Zone fill tints
const ZONE_FILL_TINTS = {
    stable:   'rgba(0, 255, 0, 0.03)',
    stressed: 'rgba(255, 200, 0, 0.05)',
    crisis:   'rgba(255, 0, 0, 0.06)',
    override: 'rgba(0, 255, 255, 0.08)'
};

// ============================================
// STARFIELD GENERATION
// ============================================

function generateZoneStarPositions(seed, count) {
    // Simple seeded RNG (mulberry32)
    let s = seed | 0;
    function rng() {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: rng(),
            y: rng() * 0.7,
            brightness: 0.2 + rng() * 0.5,
            size: 1 + Math.floor(rng() * 2)
        });
    }
    return stars;
}

// ============================================
// HELPER: Map world coords to panel pixel coords
// ============================================

function _zoneWorldToPixelX(worldX, zx, zw) {
    return zx + (worldX / ZONE_WORLD_W) * zw;
}

function _zoneWorldToPixelY(worldY, zy, zh) {
    return zy + (worldY / ZONE_WORLD_H) * zh;
}

// ============================================
// COMPLETE ZONE PANEL RENDER
// (Cockpit-frame variant: entities render in
//  reduced battlefield viewport, cockpit panels
//  overlay edges of full interior)
// ============================================

function renderZonePanel(zx, zy, zw, zh, zone, isFocused, isOverride) {
    const state = isOverride ? 'override' : (zone.state || 'stable');
    const borderCfg = ZONE_BORDER_CONFIG[state] || ZONE_BORDER_CONFIG.stable;

    // Compute scale factor: what would a 16-up panel width be?
    const cw = canvas.width;
    const _M = 8; // CMD_MARGIN
    const _sidebarW = Math.max(240, Math.floor((cw - _M * 3) * 0.28));
    const _gridW = cw - _sidebarW - _M * 3;
    const _refZoneW = Math.floor((_gridW - _M * 3) / 4); // 4 cols for 16-up
    _zoneSF = Math.max(1, Math.min(3, zw / _refZoneW));

    // Scaled structural dimensions
    const headerH = Math.round(ZONE_HEADER_H * _zoneSF);
    const statusH = Math.round(ZONE_STATUS_STRIP_H * _zoneSF);

    // 1. Panel container (unchanged)
    renderNGEPanel(zx, zy, zw, zh, {
        color: borderCfg.color,
        cutCorners: [],
        alpha: isFocused ? 0.75 : 0.55,
        label: '',
        noTexture: true
    });

    // 2. Interior rendering area (inside panel border)
    const ix = zx + 2;
    const iy = zy + headerH;
    const iw = zw - 4;
    const ih = zh - headerH - statusH - 4;

    // 3. Cockpit layout
    const cockpit = getZoneCockpitLayout(iw, ih);

    // 4. Battlefield viewport (reduced by cockpit strips)
    const bx = ix + cockpit.leftW;
    const by = iy + cockpit.topH;
    const bw = iw - cockpit.leftW - cockpit.rightW;
    const bh = ih - cockpit.topH;

    // 5. Clip to full interior
    ctx.save();
    ctx.beginPath();
    ctx.rect(ix, iy, iw, ih);
    ctx.clip();

    // 6. Background tint (full interior)
    const tint = ZONE_FILL_TINTS[state] || ZONE_FILL_TINTS.stable;
    ctx.fillStyle = tint;
    ctx.fillRect(ix, iy, iw, ih);

    // 7. Brightness adjustment for unfocused zones
    if (!isFocused && !isOverride) {
        ctx.globalAlpha = 0.7;
    }

    // 8. Starfield across FULL interior (visible through cockpit panels)
    renderMiniStarfield(ix, iy, iw, ih, zone);

    // 8.5 Ground plane across FULL interior (extends behind cockpit strips)
    _renderFullWidthGround(ix, iy, iw, ih, by, bh);

    // 9. Clip to battlefield viewport for entity rendering
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();

    // 10. Render ALL entities within battlefield viewport (ground already drawn)
    renderMiniTargets(bx, by, bw, bh, zone.targets);
    renderMiniTanks(bx, by, bw, bh, zone.tanks);
    if (!zone.ufoRespawnTimer || zone.ufoRespawnTimer <= 0) {
        renderMiniBeam(bx, by, bw, bh, zone.crewUfo);
        renderMiniUFO(bx, by, bw, bh, zone.crewUfo);
    } else {
        // UFO respawning — blinking cross indicator
        const ux = _zoneWorldToPixelX(zone.crewUfo.x, bx, bw);
        const uy = _zoneWorldToPixelY(zone.crewUfo.y, by, bh);
        if (Math.sin(Date.now() / 150) > 0) {
            const crossLen = 10 * _zoneSF;
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.lineWidth = 1.5 * _zoneSF;
            ctx.beginPath();
            ctx.moveTo(ux - crossLen, uy); ctx.lineTo(ux + crossLen, uy);
            ctx.moveTo(ux, uy - crossLen); ctx.lineTo(ux, uy + crossLen);
            ctx.stroke();
        }
    }
    renderMiniProjectiles(bx, by, bw, bh, zone.projectiles);
    renderMiniDrones(bx, by, bw, bh, zone.drones);
    renderMiniBombs(bx, by, bw, bh, zone.bombs);
    renderMiniMissiles(bx, by, bw, bh, zone.missiles);
    renderMiniCoordinators(bx, by, bw, bh, zone.coordinators, zone.crewUfo, zone.drones);
    renderMiniExplosions(bx, by, bw, bh, zone.explosions);
    renderZoneParticles(bx, by, bw, bh, zone.particles);

    // 11. Restore to full interior clip
    ctx.restore();

    // 12. Cockpit frame panels ON TOP of entities
    renderZoneCockpitFrame(ix, iy, iw, ih, cockpit, zone);

    // 13. Decay overlay (full interior)
    if (zone.driftLevel > 0) {
        applyZoneDecayFilter(ix, iy, iw, ih, zone.driftLevel);
    }

    // 14. Restore from full interior clip
    ctx.globalAlpha = 1;
    ctx.restore();

    // 15. Header, status strip, border pulse, crew glyph — scaled
    renderZoneHeader(zx, zy, zw, zone, isFocused, headerH);
    renderZoneStatusBar(zx, zy + zh - statusH - 2, zw, zone, statusH);
    renderZoneBorderPulse(zx, zy, zw, zh, state, isFocused);

    if (zone.crewMember && typeof renderCrewGlyph === 'function') {
        const glyphSize = Math.round(24 * _zoneSF);
        renderCrewGlyph(zx + zw - glyphSize - Math.round(8 * _zoneSF), zy + 2, glyphSize, zone.crewMember);
        ctx.font = 'bold ' + Math.round(7 * _zoneSF) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa';
        ctx.fillText(zone.crewMember.name || '', zx + zw - glyphSize / 2 - Math.round(8 * _zoneSF), zy + Math.round(14 * _zoneSF));
    }
}

// ============================================
// ZONE HEADER
// ============================================

function renderZoneHeader(zx, zy, zw, zone, isFocused) {
    const stateColor = ZONE_BORDER_CONFIG[zone.state || 'stable'].color;

    // Zone name (top-left)
    ctx.font = 'bold ' + Math.round(11 * _zoneSF) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = stateColor;
    ctx.fillText(zone.name || 'SECTOR ?', zx + 6 * _zoneSF, zy + 12 * _zoneSF);

    // Focus indicator (right-aligned before crew glyph area)
    if (isFocused) {
        ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
        ctx.font = 'bold ' + Math.round(9 * _zoneSF) + 'px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('\u25B8 FOCUS', zx + zw - 34 * _zoneSF, zy + 12 * _zoneSF);
        ctx.textAlign = 'left';
    }

    // State label on second line, centered with separator dashes
    const stateLabel = (zone.state || 'stable').toUpperCase();
    ctx.font = 'bold ' + Math.round(7 * _zoneSF) + 'px monospace';
    const labelW = ctx.measureText(stateLabel).width;
    const centerX = zx + zw / 2;
    const labelY = zy + ZONE_HEADER_H * _zoneSF - 3 * _zoneSF;

    ctx.fillStyle = stateColor;
    ctx.globalAlpha = 0.6;
    ctx.textAlign = 'right';
    ctx.fillText('\u2014\u2014', centerX - labelW / 2 - 3 * _zoneSF, labelY);
    ctx.textAlign = 'left';
    ctx.fillText('\u2014\u2014', centerX + labelW / 2 + 3 * _zoneSF, labelY);
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1;
    ctx.fillText(stateLabel, centerX, labelY);
    ctx.textAlign = 'left';
}

// ============================================
// MINI STARFIELD
// ============================================

function renderMiniStarfield(zx, zy, zw, zh, zone) {
    // Lazy-init star positions
    if (!zone.starPositions || zone.starPositions.length === 0) {
        zone.starPositions = generateZoneStarPositions(zone.starSeed || 42, 40);
    }

    for (const star of zone.starPositions) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.3})`;
        // Star positions may be normalized (0-1) or in zone-world coords
        // If x > 1, assume zone-world coords and map via ZONE_WORLD_W/H
        const sx = star.x > 1 ? (star.x / ZONE_WORLD_W) * zw : star.x * zw;
        const sy = star.y > 1 ? (star.y / ZONE_WORLD_H) * zh : star.y * zh;
        ctx.fillRect(
            zx + sx,
            zy + sy,
            star.size,
            star.size
        );
    }
}

// ============================================
// MINI GROUND PLANE (uses world coordinate mapping)
// ============================================

function renderMiniGround(zx, zy, zw, zh) {
    // Map GROUND_Y from world coords to panel pixel coords
    const groundPixelY = _zoneWorldToPixelY(ZONE_GROUND_Y, zy, zh);
    const groundH = zy + zh - groundPixelY;

    // Gradient ground
    const grad = ctx.createLinearGradient(zx, groundPixelY, zx, groundPixelY + groundH);
    grad.addColorStop(0, '#1a2a0a');
    grad.addColorStop(0.3, '#0c1a06');
    grad.addColorStop(1, '#060d03');
    ctx.fillStyle = grad;
    ctx.fillRect(zx, groundPixelY, zw, groundH);

    // Ground line
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(zx, groundPixelY);
    ctx.lineTo(zx + zw, groundPixelY);
    ctx.stroke();

    // Subtle ground texture marks
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.06)';
    ctx.lineWidth = 1;
    for (let gx = zx + 20; gx < zx + zw; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, groundPixelY + 2);
        ctx.lineTo(gx + 15, groundPixelY + 2);
        ctx.stroke();
    }
}

// ============================================
// FULL-WIDTH GROUND — Renders ground across entire
// interior (behind cockpit strips), using battlefield
// Y mapping for correct vertical position.
// ============================================

function _renderFullWidthGround(ix, iy, iw, ih, by, bh) {
    // Map ground Y from battlefield viewport coords
    const groundPixelY = _zoneWorldToPixelY(ZONE_GROUND_Y, by, bh);
    const groundBottom = iy + ih;

    if (groundPixelY >= groundBottom) return;

    const groundH = groundBottom - groundPixelY;

    // Gradient ground (full interior width)
    const grad = ctx.createLinearGradient(ix, groundPixelY, ix, groundBottom);
    grad.addColorStop(0, '#1a2a0a');
    grad.addColorStop(0.3, '#0c1a06');
    grad.addColorStop(1, '#060d03');
    ctx.fillStyle = grad;
    ctx.fillRect(ix, groundPixelY, iw, groundH);

    // Horizon line (full width)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ix, groundPixelY);
    ctx.lineTo(ix + iw, groundPixelY);
    ctx.stroke();

    // Subtle ground texture marks (full width, scaled spacing)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.06)';
    ctx.lineWidth = 1;
    const gTexGap = 40 * _zoneSF;
    const gTexLen = 15 * _zoneSF;
    for (let gx = ix + 20 * _zoneSF; gx < ix + iw; gx += gTexGap) {
        ctx.beginPath();
        ctx.moveTo(gx, groundPixelY + 2);
        ctx.lineTo(gx + gTexLen, groundPixelY + 2);
        ctx.stroke();
    }
}

// ============================================
// MINI TARGETS (larger, distinct shapes)
// ============================================

function renderMiniTargets(zx, zy, zw, zh, targets) {
    if (!targets) return;

    const groundPixelY = _zoneWorldToPixelY(ZONE_GROUND_Y, zy, zh);

    // Per-type bottom extent: how far below anchor (0,0) each shape's lowest point reaches
    const BOTTOM_EXTENT = { human: 5, cow: 6, sheep: 5, cat: 3, dog: 6 };

    for (const target of targets) {
        if (!target.alive) continue;

        const tx = _zoneWorldToPixelX(target.x, zx, zw);
        const rawTy = _zoneWorldToPixelY(target.y, zy, zh);

        // Offset so each shape's feet/bottom aligns exactly with the ground line
        const bottomExt = BOTTOM_EXTENT[target.type] || 5;
        const ty = groundPixelY - bottomExt;

        const color = TARGET_MINI_COLORS[target.type] || '#0f0';

        // Shrink target as it rises during abduction
        let scale = 1.0;
        if (target.beingAbducted && target.abductionProgress > 0) {
            scale = Math.max(0.4, 1.0 - target.abductionProgress * 0.4);
            // When being abducted, use the simulation Y (rising upward)
        }

        ctx.save();
        ctx.translate(tx, target.beingAbducted ? rawTy : ty);
        ctx.scale(scale * _zoneSF, scale * _zoneSF);

        // Render distinct shapes per target type (bigger and recognizable)
        _renderTargetShape(target.type, color);

        ctx.restore();

        // Abduction beam-up glow trail
        if (target.beingAbducted) {
            // Cyan glow around target (follows rising target, not ground)
            const glowY = target.beingAbducted ? rawTy : ty;
            ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(tx, glowY, 10 * scale * _zoneSF, 0, Math.PI * 2);
            ctx.fill();

            // Rising trail particles below target
            const trailAlpha = 0.15 + Math.sin(Date.now() / 200) * 0.1;
            ctx.fillStyle = `rgba(0, 255, 255, ${trailAlpha})`;
            for (let t = 0; t < 3; t++) {
                const trailY = glowY + 6 * _zoneSF + t * 5 * _zoneSF;
                const trailR = (3 - t) * 1.5 * scale * _zoneSF;
                ctx.beginPath();
                ctx.arc(tx + (Math.sin(Date.now() / 300 + t) * 2 * _zoneSF), trailY, trailR, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Render distinct recognizable shapes for each target type
function _renderTargetShape(type, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    switch (type) {
        case 'human':
            // Stick figure silhouette (~14px tall)
            // Head
            ctx.beginPath();
            ctx.arc(0, -9, 3, 0, Math.PI * 2);
            ctx.fill();
            // Body
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(0, 0);
            ctx.stroke();
            // Legs
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-3, 5);
            ctx.moveTo(0, 0);
            ctx.lineTo(3, 5);
            ctx.stroke();
            // Arms
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(-4, -1);
            ctx.moveTo(0, -4);
            ctx.lineTo(4, -1);
            ctx.stroke();
            break;

        case 'cow':
            // Quadruped body (~16px wide, ~10px tall)
            // Body oval
            ctx.beginPath();
            ctx.ellipse(0, -2, 7, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.ellipse(8, -4, 3, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Legs (4 lines)
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-4, 2); ctx.lineTo(-4, 6);
            ctx.moveTo(-1, 2); ctx.lineTo(-1, 6);
            ctx.moveTo(2, 2); ctx.lineTo(2, 6);
            ctx.moveTo(5, 2); ctx.lineTo(5, 6);
            ctx.stroke();
            break;

        case 'sheep':
            // Fluffy cloud body (~12px wide)
            ctx.beginPath();
            ctx.ellipse(0, -2, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Fluffy bumps
            ctx.beginPath();
            ctx.arc(-3, -5, 2.5, 0, Math.PI * 2);
            ctx.arc(1, -5.5, 2.5, 0, Math.PI * 2);
            ctx.arc(4, -4, 2, 0, Math.PI * 2);
            ctx.fill();
            // Head (dark)
            ctx.fillStyle = '#aaa';
            ctx.beginPath();
            ctx.ellipse(6, -2, 2, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Legs
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-3, 2); ctx.lineTo(-3, 5);
            ctx.moveTo(0, 2); ctx.lineTo(0, 5);
            ctx.moveTo(3, 2); ctx.lineTo(3, 5);
            ctx.stroke();
            break;

        case 'cat':
            // Small body with ears (~10px)
            ctx.beginPath();
            ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.arc(5, -2, 3, 0, Math.PI * 2);
            ctx.fill();
            // Ears (triangles)
            ctx.beginPath();
            ctx.moveTo(3.5, -5); ctx.lineTo(3, -8); ctx.lineTo(5, -5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -5); ctx.lineTo(7, -8); ctx.lineTo(7.5, -5);
            ctx.fill();
            // Tail (curved line)
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-4, 0);
            ctx.quadraticCurveTo(-7, -4, -5, -6);
            ctx.stroke();
            break;

        case 'dog':
            // Medium body with floppy ears (~12px)
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.arc(6, -1, 3, 0, Math.PI * 2);
            ctx.fill();
            // Snout
            ctx.beginPath();
            ctx.ellipse(9, 0, 2, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Floppy ears
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(4.5, -3);
            ctx.quadraticCurveTo(3, -1, 3.5, 1);
            ctx.stroke();
            // Legs
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-3, 3); ctx.lineTo(-3, 6);
            ctx.moveTo(0, 3); ctx.lineTo(0, 6);
            ctx.moveTo(3, 3); ctx.lineTo(3, 6);
            ctx.stroke();
            // Tail
            ctx.beginPath();
            ctx.moveTo(-5, -1);
            ctx.quadraticCurveTo(-7, -5, -5, -6);
            ctx.stroke();
            break;

        default:
            // Fallback circle (larger)
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

// ============================================
// MINI TANKS (larger, on world-coord ground plane)
// ============================================

function renderMiniTanks(zx, zy, zw, zh, tanks) {
    if (!tanks) return;

    const groundPixelY = _zoneWorldToPixelY(ZONE_GROUND_Y, zy, zh);

    for (const tank of tanks) {
        if (!tank.alive) continue;

        const tx = _zoneWorldToPixelX(tank.x, zx, zw);

        // Tank dimensions (scaled)
        const bw = 22 * _zoneSF;
        const bh = 10 * _zoneSF;
        const treadH = 4 * _zoneSF;

        // Position so bottom of treads sits exactly on ground
        const treadBottom = groundPixelY;
        const treadTop = treadBottom - treadH;
        const bodyTop = treadTop - bh;

        // Body (dark military green with outline)
        ctx.fillStyle = '#3a4a2a';
        ctx.fillRect(tx - bw / 2, bodyTop, bw, bh);
        ctx.strokeStyle = '#556644';
        ctx.lineWidth = _zoneSF;
        ctx.strokeRect(tx - bw / 2, bodyTop, bw, bh);

        // Turret base (darker rectangle on top)
        ctx.fillStyle = '#2a3a1a';
        ctx.fillRect(Math.round(tx - 5 * _zoneSF), Math.round(bodyTop - 4 * _zoneSF), Math.round(10 * _zoneSF), Math.round(5 * _zoneSF));

        // Turret barrel
        ctx.strokeStyle = '#667755';
        ctx.lineWidth = 2 * _zoneSF;
        ctx.beginPath();
        ctx.moveTo(tx, Math.round(bodyTop - 2 * _zoneSF));
        const angle = tank.turretAngle || -Math.PI / 4;
        ctx.lineTo(tx + Math.cos(angle) * 14 * _zoneSF, Math.round(bodyTop - 2 * _zoneSF) + Math.sin(angle) * 14 * _zoneSF);
        ctx.stroke();

        // Treads — darker, wider track section
        ctx.fillStyle = '#1a2010';
        ctx.fillRect(Math.round(tx - bw / 2 - 2 * _zoneSF), treadTop, bw + 4 * _zoneSF, treadH);
        ctx.strokeStyle = '#3a4030';
        ctx.lineWidth = _zoneSF;
        ctx.strokeRect(Math.round(tx - bw / 2 - 2 * _zoneSF), treadTop, bw + 4 * _zoneSF, treadH);

        // Tread pattern marks (vertical lines on the track)
        ctx.strokeStyle = '#2a3020';
        ctx.lineWidth = _zoneSF;
        for (let i = 0; i < 6; i++) {
            const mx = tx - bw / 2 + i * 5 * _zoneSF;
            ctx.beginPath();
            ctx.moveTo(mx, treadTop);
            ctx.lineTo(mx, treadBottom);
            ctx.stroke();
        }

        // Wheels inside tread area (3 evenly spaced)
        const wheelY = treadTop + treadH / 2;
        ctx.fillStyle = '#2a3a1a';
        ctx.strokeStyle = '#556644';
        ctx.lineWidth = _zoneSF;
        for (let i = 0; i < 3; i++) {
            const wheelX = tx - bw / 2 + 3 + i * (bw / 2 - 1.5);
            ctx.beginPath();
            ctx.arc(wheelX, wheelY, 2.5 * _zoneSF, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
}

// ============================================
// MINI UFO (larger — ~34px wide)
// ============================================

function renderMiniUFO(zx, zy, zw, zh, ufo) {
    if (!ufo) return;

    const ux = _zoneWorldToPixelX(ufo.x, zx, zw);
    const uy = _zoneWorldToPixelY(ufo.y, zy, zh);
    const hover = Math.sin((Date.now() + (ufo.hoverOffset || 0) * 1000) / 500) * 2 * _zoneSF;
    const w = 34 * _zoneSF;
    const h = 12 * _zoneSF;

    // Damage flash when health is low
    const isHit = ufo.health < 100 && Math.sin(Date.now() / 80) > 0.7;

    // Body (ellipse)
    ctx.fillStyle = isHit ? '#f44' : '#8cc';
    ctx.beginPath();
    ctx.ellipse(ux, uy + hover, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body rim highlight
    ctx.strokeStyle = isHit ? '#f88' : '#aee';
    ctx.lineWidth = _zoneSF;
    ctx.beginPath();
    ctx.ellipse(ux, uy + hover, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dome (arc — proportionally bigger)
    ctx.fillStyle = isHit ? '#f88' : '#aee';
    ctx.beginPath();
    ctx.arc(ux, uy + hover - h / 2 + 1, 8 * _zoneSF, Math.PI, 0);
    ctx.fill();

    // Dome highlight
    ctx.fillStyle = isHit ? '#faa' : '#cff';
    ctx.beginPath();
    ctx.arc(ux - 2 * _zoneSF, uy + hover - h / 2 - 2 * _zoneSF, 3 * _zoneSF, 0, Math.PI * 2);
    ctx.fill();

    // Running lights along rim
    const lightCount = 5;
    for (let i = 0; i < lightCount; i++) {
        const lightAngle = (i / lightCount) * Math.PI + Math.PI;
        const lx = ux + Math.cos(lightAngle) * (w / 2 - 2);
        const ly = uy + hover + Math.sin(lightAngle) * (h / 2 - 1);
        const blink = Math.sin(Date.now() / 200 + i * 1.3) > 0;
        if (blink) {
            ctx.fillStyle = isHit ? '#f66' : '#0ff';
            ctx.beginPath();
            ctx.arc(lx, ly, 1.5 * _zoneSF, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Center glow
    ctx.shadowColor = isHit ? '#f44' : '#0ff';
    ctx.shadowBlur = 6 * _zoneSF;
    ctx.fillStyle = isHit ? '#f44' : '#0ff';
    ctx.beginPath();
    ctx.arc(ux, uy + hover, 3 * _zoneSF, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Segmented energy bar ABOVE the UFO dome
    if (ufo.maxEnergy > 0) {
        const barW = 28 * _zoneSF;
        const barH = 3 * _zoneSF;
        const barX = ux - barW / 2;
        const domeTop = uy + hover - h / 2 - 8 * _zoneSF; // above dome
        const barY = domeTop - barH - 2 * _zoneSF;
        const pct = ufo.energy / ufo.maxEnergy;
        const segments = 8;
        const gap = 1.5 * _zoneSF;
        const segWidth = (barW - gap * (segments - 1)) / segments;
        const filledSegments = Math.ceil(pct * segments);
        const lowEnergy = pct < 0.25;
        const pulseAlpha = lowEnergy ? 0.5 + Math.sin(Date.now() / 150) * 0.5 : 1;

        // NRG micro-label
        ctx.font = 'bold ' + Math.round(5 * _zoneSF) + 'px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillText('NRG', barX - 3 * _zoneSF, barY + barH);

        // Background
        ctx.fillStyle = '#0a0c14';
        ctx.fillRect(barX - 1 * _zoneSF, barY - 1 * _zoneSF, barW + 2 * _zoneSF, barH + 2 * _zoneSF);

        for (let i = 0; i < segments; i++) {
            const sx = barX + i * (segWidth + gap);
            if (i < filledSegments) {
                // Segment color by position
                const segPct = (i + 1) / segments;
                let segColor;
                if (segPct > 0.5) segColor = '#0f0';
                else if (segPct > 0.25) segColor = '#9f0';
                else segColor = '#f80';

                // Low energy: last segments pulse red
                if (lowEnergy && i >= filledSegments - 2) {
                    segColor = '#f44';
                    ctx.globalAlpha = pulseAlpha;
                }

                ctx.fillStyle = segColor;
                ctx.fillRect(sx, barY, segWidth, barH);

                // Top highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(sx, barY, segWidth, 1);

                ctx.globalAlpha = 1;
            } else {
                // Empty segment
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fillRect(sx, barY, segWidth, barH);
            }
        }

        // Border
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.lineWidth = 0.5 * _zoneSF;
        ctx.strokeRect(barX - 1 * _zoneSF, barY - 1 * _zoneSF, barW + 2 * _zoneSF, barH + 2 * _zoneSF);
    }
}

// ============================================
// MINI BEAM — Always straight down to ground
// Matches Phase 1 visual style: cone, spirals,
// edge glow, shimmer particles
// ============================================

function renderMiniBeam(zx, zy, zw, zh, ufo) {
    if (!ufo || !ufo.beamActive) return;

    const ux = _zoneWorldToPixelX(ufo.x, zx, zw);
    const uy = _zoneWorldToPixelY(ufo.y, zy, zh);
    const hover = Math.sin((Date.now() + (ufo.hoverOffset || 0) * 1000) / 500) * 2;

    const beamStartY = uy + hover + 8 * _zoneSF;
    const rotation = Date.now() / 600;

    // Ground plane — beam stops at actual ground, not viewport edge
    const groundPixelY = _zoneWorldToPixelY(ZONE_GROUND_Y, zy, zh);

    // Beam always points straight down from UFO center
    // Locked-on beam is brighter and wider; searching beam is dimmer
    const hasTarget = !!ufo.beamTarget;
    const topW = (hasTarget ? 6 : 4) * _zoneSF;
    const bottomW = (hasTarget ? 24 : 20) * _zoneSF;

    ctx.save();

    // Main cone gradient: cyan -> magenta -> cyan (Phase 1 style)
    const grad = ctx.createLinearGradient(ux, beamStartY, ux, groundPixelY);
    if (hasTarget) {
        grad.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
        grad.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 255, 255, 0.2)');
    } else {
        grad.addColorStop(0, 'rgba(0, 255, 255, 0.25)');
        grad.addColorStop(0.5, 'rgba(255, 0, 255, 0.12)');
        grad.addColorStop(1, 'rgba(0, 255, 255, 0.06)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ux - topW / 2, beamStartY);
    ctx.lineTo(ux - bottomW / 2, groundPixelY);
    ctx.lineTo(ux + bottomW / 2, groundPixelY);
    ctx.lineTo(ux + topW / 2, beamStartY);
    ctx.closePath();
    ctx.fill();

    // Edge glow lines (both sides of the cone)
    ctx.strokeStyle = hasTarget ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = _zoneSF;
    ctx.beginPath();
    ctx.moveTo(ux - topW / 2, beamStartY);
    ctx.lineTo(ux - bottomW / 2, groundPixelY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ux + topW / 2, beamStartY);
    ctx.lineTo(ux + bottomW / 2, groundPixelY);
    ctx.stroke();

    // Spiral 1 (white, primary) — always straight down (startX === endX)
    _renderBeamSpiral(ux, ux, beamStartY, groundPixelY, topW, bottomW, rotation,
        hasTarget ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)', 1.5 * _zoneSF);
    // Spiral 2 (magenta, offset)
    _renderBeamSpiral(ux, ux, beamStartY, groundPixelY, topW, bottomW, rotation + Math.PI,
        hasTarget ? 'rgba(255, 0, 255, 0.4)' : 'rgba(255, 0, 255, 0.2)', _zoneSF);

    // Shimmer particles moving down the beam
    const particleCount = hasTarget ? 6 : 3;
    for (let i = 0; i < particleCount; i++) {
        const t = ((Date.now() / 400 + i / particleCount) % 1);
        const sy = beamStartY + (groundPixelY - beamStartY) * t;
        const widthAtT = topW + (bottomW - topW) * t;
        const side = Math.sin(rotation * 3 + i) > 0 ? 1 : -1;
        const sx = ux + side * (widthAtT / 2);
        const shimAlpha = 0.3 + Math.sin(t * Math.PI) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${shimAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * _zoneSF, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ground impact glow when beam has a target
    if (hasTarget) {
        const glowPulse = 0.15 + Math.sin(Date.now() / 200) * 0.08;
        ctx.fillStyle = `rgba(0, 255, 255, ${glowPulse})`;
        ctx.beginPath();
        ctx.ellipse(ux, groundPixelY, bottomW / 2 + 4 * _zoneSF, 3 * _zoneSF, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Helper: render a sine-wave spiral inside a beam cone
function _renderBeamSpiral(startX, endX, startY, endY, topW, bottomW, rotation, color, lineW) {
    const spiralSegments = 10;
    const spiralTurns = 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.beginPath();
    for (let i = 0; i <= spiralSegments; i++) {
        const t = i / spiralSegments;
        const y = startY + (endY - startY) * t;
        const x = startX + (endX - startX) * t;
        const widthAtT = topW + (bottomW - topW) * t;
        const angle = t * spiralTurns * Math.PI * 2 + rotation;
        const sx = x + Math.sin(angle) * (widthAtT / 2 - 2);
        if (i === 0) ctx.moveTo(sx, y);
        else ctx.lineTo(sx, y);
    }
    ctx.stroke();
}

// ============================================
// MINI PROJECTILES (slightly larger)
// ============================================

function renderMiniProjectiles(zx, zy, zw, zh, projectiles) {
    if (!projectiles) return;

    for (const proj of projectiles) {
        if (!proj.alive) continue;

        const px = _zoneWorldToPixelX(proj.x, zx, zw);
        const py = _zoneWorldToPixelY(proj.y, zy, zh);

        ctx.fillStyle = '#ff4';
        ctx.shadowColor = '#ff4';
        ctx.shadowBlur = 4 * _zoneSF;
        ctx.beginPath();
        ctx.arc(px, py, 3 * _zoneSF, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

// ============================================
// ZONE PARTICLES
// ============================================

function renderZoneParticles(zx, zy, zw, zh, particles) {
    if (!particles) return;

    for (const p of particles) {
        if (p.life <= 0) continue;

        const alpha = Math.min(1, p.life / (p.maxLife || 1));
        const px = _zoneWorldToPixelX(p.x, zx, zw);
        const py = _zoneWorldToPixelY(p.y, zy, zh);

        ctx.fillStyle = p.color || '#fff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, (p.size || 2) * 0.8 * _zoneSF, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ============================================
// COCKPIT FRAME LAYOUT CALCULATOR
// Adaptive layout based on zone interior width
// ============================================

function getZoneCockpitLayout(iw, ih) {
    // topH = height of the center bar (TECH|QTA|BIO)
    // Side strips start at iy (same top as center bar), first panels are taller
    if (iw >= 350) return { leftW: Math.round(38 * _zoneSF), rightW: Math.round(38 * _zoneSF), topH: Math.round(18 * _zoneSF), mode: 'full' };
    if (iw >= 250) return { leftW: Math.round(30 * _zoneSF), rightW: Math.round(30 * _zoneSF), topH: Math.round(16 * _zoneSF), mode: 'narrow' };
    return { leftW: 0, rightW: 0, topH: 0, mode: 'minimal' };
}

// ============================================
// COCKPIT FRAME ORCHESTRATOR
// Side strips start at iy (sharing top margin with center bar)
// Center bar spans between strips at top
// ============================================

function renderZoneCockpitFrame(ix, iy, iw, ih, cockpit, zone) {
    ctx.save();
    ctx.globalAlpha = 0.35;

    if (cockpit.mode !== 'minimal') {
        // Side strips (full height, starting at iy — panels share top margin)
        _renderCockpitLeftStrip(ix, iy, cockpit.leftW, ih, cockpit.mode, zone);
        _renderCockpitRightStrip(ix + iw - cockpit.rightW, iy, cockpit.rightW, ih, cockpit.mode, zone);

        // Center bar: TECH | QTA | BIO (between strips, at iy)
        _renderCockpitCenterBar(ix, iy, iw, cockpit, zone);
    }

    ctx.restore();
}

// ============================================
// COCKPIT CENTER BAR
// Three sections: TECH (left) | QTA (center) | BIO (right)
// Spans between left and right strips
// ============================================

function _renderCockpitCenterBar(ix, iy, iw, cockpit, zone) {
    const isFull = cockpit.mode === 'full';
    const topH = cockpit.topH;
    const lw = cockpit.leftW;
    const rw = cockpit.rightW;
    const thinBorder = 0.75 * _zoneSF;

    const stateColor = ZONE_BORDER_CONFIG[zone.state || 'stable'].color;

    // Center bar position (between strips)
    const barX = ix + lw + 1;
    const barW = iw - lw - rw - 2;

    if (barW < 40 * _zoneSF) return;

    // Background panel
    renderNGEPanel(barX, iy, barW, topH, {
        color: stateColor,
        alpha: 0.45,
        cutCorners: [],
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    // Section widths: TECH ~30%, QTA ~35%, BIO ~35%
    const techW = Math.floor(barW * 0.30);
    const qtaW = Math.floor(barW * 0.35);
    const bioW = barW - techW - qtaW;

    const techX = barX;
    const qtaX = barX + techW;
    const bioX = barX + techW + qtaW;

    // === LEFT SECTION: TECH indicator (red-tinted) ===
    _renderCenterBarTech(techX, iy, techW, topH, isFull, zone);

    // === CENTER SECTION: Quota progress ===
    _renderCenterBarQuota(qtaX, iy, qtaW, topH, isFull, zone, stateColor);

    // === RIGHT SECTION: BIO conduit ===
    if (bioW > 14) {
        _renderMiniBioConduit(bioX, iy, bioW, topH, isFull, zone);
    }
}

// ============================================
// CENTER BAR — TECH section (left, red-tinted)
// Shows tech level x/15 with blink lights
// ============================================

function _renderCenterBarTech(tx, ty, tw, th, isFull, zone) {
    const techLevel = zone.techLevel || 0;
    const maxTech = 15;
    const techPct = techLevel / maxTech;

    // Divider line (right edge)
    ctx.strokeStyle = 'rgba(180, 60, 60, 0.35)';
    ctx.lineWidth = 0.5 * _zoneSF;
    ctx.beginPath();
    ctx.moveTo(tx + tw, ty + 2 * _zoneSF);
    ctx.lineTo(tx + tw, ty + th - 2 * _zoneSF);
    ctx.stroke();

    // TECH label
    ctx.font = 'bold ' + Math.round(5 * _zoneSF) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f44';
    ctx.fillText('TECH', tx + 3 * _zoneSF, ty + 6 * _zoneSF);

    // Blink light after label
    const blinkColor = techPct >= 0.8 ? '#0f0' : techPct >= 0.4 ? '#fc0' : '#f44';
    renderNGEBlinkLight(tx + tw - 7 * _zoneSF, ty + 2 * _zoneSF, blinkColor, 700 + techLevel * 50, Math.round(4 * _zoneSF));

    // Level count: x/15
    ctx.font = 'bold ' + Math.round(6 * _zoneSF) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = techPct >= 0.8 ? '#0f0' : techPct >= 0.4 ? '#fa0' : '#f66';
    ctx.fillText(techLevel + '/' + maxTech, tx + 3 * _zoneSF, ty + 13 * _zoneSF);

    // Status dots row (up to 3 dots showing tech tier progress)
    if (isFull && tw > 30) {
        const dotCount = Math.min(3, Math.ceil(techLevel / 5));
        const dotStatus = techPct >= 0.8 ? 'nominal' : techPct >= 0.4 ? 'caution' : 'critical';
        for (let d = 0; d < dotCount; d++) {
            renderNGEStatusDot(tx + 24 * _zoneSF + d * 6 * _zoneSF, ty + 10 * _zoneSF, dotStatus, 1.5 * _zoneSF);
        }
    }

    // Tiny blink lights row at bottom (shows tech tiers filled)
    if (th >= 16) {
        const tiersComplete = Math.floor(techLevel / 5); // 0-3 tiers
        for (let t = 0; t < 3; t++) {
            const litColor = t < tiersComplete ? '#f44' : 'rgba(80,30,30,0.3)';
            const bx = tx + 3 * _zoneSF + t * 6 * _zoneSF;
            const by = ty + th - 4 * _zoneSF;
            if (t < tiersComplete) {
                renderNGEBlinkLight(bx, by, litColor, 1200 + t * 300, Math.round(3 * _zoneSF));
            } else {
                // Dim unlit square
                ctx.fillStyle = litColor;
                ctx.fillRect(bx, by, 3 * _zoneSF, 3 * _zoneSF);
            }
        }
    }
}

// ============================================
// CENTER BAR — QUOTA section (center, green)
// Shows quota progress bar with N/M text
// ============================================

function _renderCenterBarQuota(qx, qy, qw, qh, isFull, zone, stateColor) {
    const qCurrent = zone.quota ? zone.quota.current : 0;
    const qTarget = zone.quota ? zone.quota.target : 10;
    const qPct = Math.min(1, qCurrent / Math.max(1, qTarget));
    const qColor = qPct >= 0.8 ? '#0f0' : qPct >= 0.5 ? '#fc0' : '#f44';

    // Divider line (right edge)
    ctx.strokeStyle = 'rgba(0, 170, 0, 0.3)';
    ctx.lineWidth = 0.5 * _zoneSF;
    ctx.beginPath();
    ctx.moveTo(qx + qw, qy + 2 * _zoneSF);
    ctx.lineTo(qx + qw, qy + qh - 2 * _zoneSF);
    ctx.stroke();

    // QTA label
    ctx.font = 'bold ' + Math.round(5 * _zoneSF) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f0';
    ctx.fillText('QTA', qx + 3 * _zoneSF, qy + 6 * _zoneSF);

    // N/M text after label
    ctx.font = 'bold ' + Math.round(6 * _zoneSF) + 'px monospace';
    ctx.fillStyle = qColor;
    ctx.fillText(qCurrent + '/' + qTarget, qx + 20 * _zoneSF, qy + 6 * _zoneSF);

    // Quota progress bar
    const qBarX = qx + 3 * _zoneSF;
    const qBarY = qy + 9 * _zoneSF;
    const qBarW = qw - 6 * _zoneSF;
    const qBarH = 4 * _zoneSF;
    renderNGEBar(qBarX, qBarY, qBarW, qBarH, qPct, qColor, {
        segments: isFull ? 8 : 6
    });

    // Status dot at right
    renderNGEStatusDot(qx + qw - 5 * _zoneSF, qy + qh / 2, qPct >= 0.8 ? 'nominal' : qPct >= 0.5 ? 'caution' : 'critical', 2 * _zoneSF);

    // Bottom: blink light
    if (qh >= 16) {
        renderNGEBlinkLight(qx + 3 * _zoneSF, qy + qh - 5 * _zoneSF, stateColor, 800, Math.round(4 * _zoneSF));
    }
}

// ============================================
// MINI BIO CONDUIT — Upload bars in center bar
// Phase 1-inspired compact upload visualization
// ============================================

function _renderMiniBioConduit(bx, by, bw, bh, isFull, zone) {
    // BIO label
    ctx.font = 'bold ' + Math.round(5 * _zoneSF) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#06a';
    ctx.fillText('BIO', bx + 3 * _zoneSF, by + 6 * _zoneSF);

    // Blink light after label
    renderNGEBlinkLight(bx + bw - 7 * _zoneSF, by + 2 * _zoneSF, '#0af', 900, Math.round(4 * _zoneSF));

    // Upload area
    const uploadX = bx + 3 * _zoneSF;
    const uploadY = by + 8 * _zoneSF;
    const uploadW = bw - 6 * _zoneSF;
    const uploadH = bh - 10 * _zoneSF;

    if (uploadH < 3) return;

    // Check beam activity
    const ufo = zone.crewUfo;
    const isBeaming = ufo && (ufo.beamTarget || ufo.beaming || ufo.tractorBeamOn);

    // Quota data for bar display
    const qCurrent = zone.quota ? zone.quota.current : 0;
    const qTarget = zone.quota ? zone.quota.target : 10;
    const qPct = Math.min(1, qCurrent / Math.max(1, qTarget));

    if (isBeaming || qPct > 0) {
        const now = Date.now();
        const maxBars = isFull ? 2 : 1;
        const barGap = 1 * _zoneSF;
        const barH = Math.max(2, Math.floor((uploadH - (maxBars - 1) * barGap) / maxBars));

        for (let i = 0; i < maxBars; i++) {
            const rowY = uploadY + i * (barH + barGap);
            const phaseOffset = i * 0.4;
            const cycleTime = 2.5;
            const t = ((now / 1000 + phaseOffset) % cycleTime) / cycleTime;
            const progress = isBeaming ? t : (i === 0 ? qPct : 0);

            if (progress <= 0 && !isBeaming) continue;

            // Bar background
            ctx.fillStyle = 'rgba(0, 20, 60, 0.4)';
            ctx.fillRect(uploadX, rowY, uploadW, barH);

            // Progress fill (blue-tinted)
            const barColor = progress > 0.9 ? '#0ff' : '#0af';
            ctx.fillStyle = barColor;
            ctx.globalAlpha = 0.35;
            ctx.fillRect(uploadX, rowY, uploadW * progress, barH);
            ctx.globalAlpha = 1;

            // Animated chevrons
            if (barH >= 3) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(uploadX, rowY, uploadW * progress, barH);
                ctx.clip();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#fff';
                const chevOffset = (now / 60) % (8 * _zoneSF);
                ctx.font = '' + Math.round(4 * _zoneSF) + 'px monospace';
                for (let cx = uploadX - 8 * _zoneSF + chevOffset; cx < uploadX + uploadW * progress + 8 * _zoneSF; cx += 8 * _zoneSF) {
                    ctx.fillText('\u00BB', cx, rowY + barH);
                }
                ctx.restore();
            }

            // Thin border
            ctx.strokeStyle = 'rgba(0, 170, 255, 0.25)';
            ctx.lineWidth = 0.5 * _zoneSF;
            ctx.strokeRect(uploadX, rowY, uploadW, barH);
        }
    } else {
        // Idle state
        const blinkOn = Math.floor(Date.now() / 2000) % 2 === 0;
        if (blinkOn) {
            ctx.font = '' + Math.round(4 * _zoneSF) + 'px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0, 120, 200, 0.3)';
            ctx.fillText('IDLE', bx + bw / 2, uploadY + uploadH / 2 + 2 * _zoneSF);
            ctx.textAlign = 'left';
        }
    }
}

// ============================================
// COCKPIT LEFT STRIP
// Panels: SYS, THR, LOG (new), DIAG — all fixed height
// Starts at iy (shares top margin with center bar)
// ============================================

function _renderCockpitLeftStrip(sx, sy, sw, sh, mode, zone) {
    const sf = _zoneSF;
    const isFull = mode === 'full';
    const pw = sw - 2;
    const px = sx + 1;
    const gap = 2 * sf;
    const thinBorder = 0.75 * sf;

    // Health data
    const healthScore = zone.healthScore || 0;
    const healthPct = Math.floor(healthScore * 100);
    const healthStatus = healthScore >= 0.7 ? 'nominal' : healthScore >= 0.4 ? 'caution' : 'critical';
    const healthColor = healthPct >= 70 ? '#0f0' : healthPct >= 40 ? '#fc0' : '#f44';

    // Tank/threat data
    const tankCount = zone.tanks ? zone.tanks.filter(t => t.alive).length : 0;
    const thrPct = Math.min(1, tankCount / 5);
    const thrColor = tankCount <= 1 ? '#0f0' : tankCount <= 3 ? '#fc0' : '#f44';

    // --- Panel 1: SYS (System Health) — 28px (full) / 24px (narrow) ---
    const sysH = Math.round((isFull ? 28 : 24) * sf);
    const sysY = sy;

    renderNGEPanel(px, sysY, pw, sysH, {
        color: '#0ff',
        alpha: 0.5,
        cutCorners: isFull ? ['tl'] : [],
        cutSize: Math.round(7 * sf),
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ff';
    ctx.fillText('SYS', px + 3 * sf, sysY + 7 * sf);

    renderNGEStatusDot(px + pw - 6 * sf, sysY + 5 * sf, healthStatus, Math.round(2 * sf));

    renderNGEBar(px + 3 * sf, sysY + 11 * sf, pw - 6 * sf, 4 * sf, healthScore, healthColor, {
        segments: 6,
        glow: healthStatus === 'critical'
    });

    ctx.font = 'bold ' + Math.round(7 * sf) + 'px monospace';
    ctx.fillStyle = healthColor;
    ctx.fillText(healthPct + '%', px + 3 * sf, sysY + sysH - 3 * sf);

    // Micro sparkline for health history (positioned left of blink light)
    _renderMicroSparkline(px + pw - 20 * sf, sysY + sysH - 8 * sf, 10 * sf, 4 * sf, '#0ff', 'sys');

    renderNGEBlinkLight(px + pw - 7 * sf, sysY + sysH - 7 * sf, '#0ff', 1200, Math.round(4 * sf));

    // --- Panel 2: THR (Threat) — 28px (full) / 24px (narrow) ---
    const thrH = Math.round((isFull ? 28 : 24) * sf);
    const thrY = sysY + sysH + gap;

    renderNGEPanel(px, thrY, pw, thrH, {
        color: '#f44',
        alpha: 0.5,
        cutCorners: [],
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f44';
    ctx.fillText('THR', px + 3 * sf, thrY + 7 * sf);

    renderNGEBlinkLight(px + pw - 7 * sf, thrY + 2 * sf, '#f44', 500, Math.round(4 * sf));

    renderNGEBar(px + 3 * sf, thrY + 11 * sf, pw - 6 * sf, 4 * sf, thrPct, thrColor, {
        segments: 6,
        glow: true,
        pulse: thrPct > 0.6
    });

    ctx.font = 'bold ' + Math.round(7 * sf) + 'px monospace';
    ctx.fillStyle = thrColor;
    ctx.fillText(tankCount + '/5', px + 3 * sf, thrY + thrH - 3 * sf);

    const thrStatus = tankCount >= 4 ? 'critical' : tankCount >= 2 ? 'caution' : 'nominal';
    renderNGEStatusDot(px + pw - 6 * sf, thrY + thrH - 5 * sf, thrStatus, Math.round(2 * sf));

    // --- Panel 3: LOG (Scrolling Status) — 26px (full) / 22px (narrow) ---
    const logH = Math.round((isFull ? 26 : 22) * sf);
    const logY = thrY + thrH + gap;

    if (logY + logH > sy + sh) return;

    renderNGEPanel(px, logY, pw, logH, {
        color: '#6af',
        alpha: 0.45,
        cutCorners: [],
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6af';
    ctx.fillText('LOG', px + 3 * sf, logY + 7 * sf);

    renderNGEBlinkLight(px + pw - 7 * sf, logY + 2 * sf, '#6af', 1600, Math.round(4 * sf));

    // Scrolling log messages with flicker
    const logMessages = ['SECTOR SCAN', 'LINK UP', 'CAL OK', 'CMD RCV', 'PING OK', 'SYNC', 'LOCKED', 'BUF CLR'];
    const now = Date.now();
    const logFontSize = Math.round((isFull ? 5 : 4) * sf);
    ctx.font = logFontSize + 'px monospace';

    const maxLogLines = Math.min(3, Math.floor((logH - 10 * sf) / (logFontSize + 2 * sf)));
    const logCycle = Math.floor(now / 1500);
    for (let i = 0; i < maxLogLines; i++) {
        const msgIdx = (logCycle + i) % logMessages.length;
        const flickerAlpha = 0.4 + 0.3 * Math.sin(now / 400 + i * 1.7);
        ctx.fillStyle = `rgba(102, 170, 255, ${flickerAlpha.toFixed(2)})`;
        ctx.fillText(logMessages[msgIdx], px + 3 * sf, logY + 10 * sf + i * (logFontSize + 2 * sf));
    }

    // Status dot cycling
    const logDotStatus = Math.floor(now / 3000) % 3 === 0 ? 'caution' : 'nominal';
    renderNGEStatusDot(px + pw - 6 * sf, logY + logH - 5 * sf, logDotStatus, Math.round(2 * sf));

    // --- Panel 4: DIAG (Diagnostics) — 26px (full) / 22px (narrow) — fixed, NOT remaining ---
    const diagH = Math.round((isFull ? 26 : 22) * sf);
    const diagY = logY + logH + gap;

    if (diagY + diagH > sy + sh) return;

    renderNGEPanel(px, diagY, pw, diagH, {
        color: '#0af',
        alpha: 0.45,
        cutCorners: isFull ? ['bl'] : [],
        cutSize: Math.round(7 * sf),
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0af';
    ctx.fillText('DIAG', px + 3 * sf, diagY + 7 * sf);

    renderNGEBlinkLight(px + pw - 7 * sf, diagY + 2 * sf, '#0af', 1800, Math.round(4 * sf));

    // Fast-cycling hex values (800ms vs old 2000ms)
    const hexFontSize = Math.round((isFull ? 5 : 4) * sf);
    ctx.font = hexFontSize + 'px monospace';
    ctx.fillStyle = 'rgba(0, 170, 255, 0.55)';

    const hexSeed = Math.floor(now / 800);
    const maxHexLines = Math.min(3, Math.floor((diagH - 10 * sf) / (hexFontSize + 2 * sf)));
    for (let i = 0; i < maxHexLines; i++) {
        const hexVal = ((hexSeed + i) * 2654435761 >>> 0 & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        ctx.fillText(hexVal, px + 3 * sf, diagY + 10 * sf + i * (hexFontSize + 2 * sf));
    }

    // Scanlines
    if (diagH > 20 * sf) {
        if (typeof renderNGEScanlines === 'function' && typeof hudAnimState !== 'undefined') {
            renderNGEScanlines(sx, diagY, sw, diagH, 0.006);
        }
    }

    // Micro sparkline at bottom
    _renderMicroSparkline(px + 3 * sf, diagY + diagH - 6 * sf, pw - 6 * sf, 3 * sf, '#0af', 'diag');
}

// ============================================
// COCKPIT RIGHT STRIP
// Panels: INTG (new, shield), NRG, OPS — all fixed height
// Starts at iy (shares top margin with center bar)
// ============================================

function _renderCockpitRightStrip(sx, sy, sw, sh, mode, zone) {
    const sf = _zoneSF;
    const isFull = mode === 'full';
    const pw = sw - 2;
    const px = sx + 1;
    const gap = 2 * sf;
    const thinBorder = 0.75 * sf;

    // UFO data
    const ufo = zone.crewUfo;
    const energy = ufo ? ufo.energy : 0;
    const maxEnergy = ufo ? ufo.maxEnergy : 100;
    const nrgPct = maxEnergy > 0 ? energy / maxEnergy : 0;
    const nrgColor = nrgPct > 0.5 ? '#0f0' : nrgPct > 0.25 ? '#fc0' : '#f44';

    // Shield/integrity data
    const health = ufo ? (ufo.health || 0) : 0;
    const maxHealth = ufo ? (ufo.maxHealth || 100) : 100;
    const shieldPct = maxHealth > 0 ? health / maxHealth : 0;
    const shieldColor = shieldPct > 0.5 ? '#0f6' : shieldPct > 0.25 ? '#fc0' : '#f33';
    const shieldStatus = shieldPct > 0.5 ? 'nominal' : shieldPct > 0.25 ? 'caution' : 'critical';

    // --- Panel 1: INTG (Shield Integrity) — 28px (full) / 24px (narrow) ---
    const intgH = Math.round((isFull ? 28 : 24) * sf);
    const intgY = sy;

    renderNGEPanel(px, intgY, pw, intgH, {
        color: '#f80',
        alpha: 0.5,
        cutCorners: isFull ? ['tr'] : [],
        cutSize: Math.round(7 * sf),
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f80';
    ctx.fillText('INTG', px + 3 * sf, intgY + 7 * sf);

    renderNGEBlinkLight(px + pw - 7 * sf, intgY + 2 * sf, '#f80', 700, Math.round(4 * sf));

    // Shield segmented bar
    renderNGEBar(px + 3 * sf, intgY + 11 * sf, pw - 6 * sf, 4 * sf, shieldPct, shieldColor, {
        segments: 6,
        glow: shieldPct < 0.25,
        pulse: shieldPct < 0.25
    });

    // Shield value
    const shieldPctVal = Math.floor(shieldPct * 100);
    ctx.font = 'bold ' + Math.round(7 * sf) + 'px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = shieldColor;
    ctx.fillText(shieldPctVal + '%', px + pw - 3 * sf, intgY + intgH - 3 * sf);
    ctx.textAlign = 'left';

    renderNGEStatusDot(px + 3 * sf, intgY + intgH - 5 * sf, shieldStatus, Math.round(2 * sf));

    // --- Panel 2: NRG (Energy) — 28px (full) / 24px (narrow) ---
    const nrgH = Math.round((isFull ? 28 : 24) * sf);
    const nrgY = intgY + intgH + gap;

    renderNGEPanel(px, nrgY, pw, nrgH, {
        color: '#f80',
        alpha: 0.5,
        cutCorners: [],
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f80';
    ctx.fillText('NRG', px + 3 * sf, nrgY + 7 * sf);

    renderNGEBlinkLight(px + pw - 7 * sf, nrgY + 2 * sf, '#f80', 600, Math.round(4 * sf));

    renderNGEBar(px + 3 * sf, nrgY + 11 * sf, pw - 6 * sf, 4 * sf, nrgPct, nrgColor, {
        segments: 8,
        glow: true,
        pulse: nrgPct < 0.25
    });

    const nrgPctVal = Math.floor(nrgPct * 100);
    ctx.font = 'bold ' + Math.round(7 * sf) + 'px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = nrgColor;
    ctx.fillText(nrgPctVal + '%', px + pw - 3 * sf, nrgY + nrgH - 3 * sf);
    ctx.textAlign = 'left';

    // NRG sparkline
    _renderMicroSparkline(px + 3 * sf, nrgY + nrgH - 8 * sf, 12 * sf, 4 * sf, '#f80', 'nrg');

    // --- Panel 3: OPS (Operations) — 28px (full) / 24px (narrow) — fixed, NOT remaining ---
    const opsH = Math.round((isFull ? 28 : 24) * sf);
    const opsY = nrgY + nrgH + gap;

    if (opsY + opsH > sy + sh) return;

    renderNGEPanel(px, opsY, pw, opsH, {
        color: '#8af',
        alpha: 0.45,
        cutCorners: isFull ? ['br'] : [],
        cutSize: Math.round(7 * sf),
        lineWidth: thinBorder,
        label: '',
        noTexture: true
    });

    ctx.font = 'bold ' + Math.round(6 * sf) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8af';
    ctx.fillText('OPS', px + 3 * sf, opsY + 7 * sf);

    renderNGEBlinkLight(px + pw - 7 * sf, opsY + 2 * sf, '#8af', 1400, Math.round(4 * sf));

    // Rotating status messages
    const now = Date.now();
    const opsMessages = ['SCANNING', 'NOMINAL', 'SYNC OK', 'ACTIVE', 'MONITOR', 'STANDBY', 'RDY'];
    const opsIdx = Math.floor(now / 3000) % opsMessages.length;

    const opsFontSize = Math.round((isFull ? 5 : 4) * sf);
    ctx.font = opsFontSize + 'px monospace';
    ctx.fillStyle = '#8af';
    ctx.fillText(opsMessages[opsIdx], px + 3 * sf, opsY + 14 * sf);

    // Drift indicator
    if (zone.driftLevel > 0) {
        const dftColor = zone.driftLevel >= 3 ? '#f44' : zone.driftLevel >= 2 ? '#fc0' : '#0af';
        ctx.font = 'bold ' + opsFontSize + 'px monospace';
        ctx.fillStyle = dftColor;
        ctx.fillText('DFT:' + zone.driftLevel, px + 3 * sf, opsY + 14 * sf + opsFontSize + 3 * sf);
    }

    // Numeric readout
    if (opsH > 22 * sf) {
        const readoutSeed = Math.floor(now / 1500);
        ctx.font = Math.round(4 * sf) + 'px monospace';
        ctx.fillStyle = 'rgba(136, 170, 255, 0.35)';
        const val = ((readoutSeed) * 2654435761 >>> 0 & 0xFFF).toString(10).padStart(3, '0');
        ctx.fillText(val + ':OK', px + 3 * sf, opsY + opsH - 3 * sf);
    }

    // Status dot
    renderNGEStatusDot(px + pw - 6 * sf, opsY + opsH - 5 * sf, zone.driftLevel > 0 ? 'caution' : 'nominal', Math.round(2 * sf));
}

// ============================================
// MICRO SPARKLINE — Tiny data history waveform
// Procedural animation simulating real-time data
// ============================================

function _renderMicroSparkline(x, y, w, h, color, seed) {
    const now = Date.now();
    const points = 8;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 * _zoneSF;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
        const px = x + (i / (points - 1)) * w;
        const hashInput = (Math.floor(now / 600) + i) * 2654435761 >>> 0;
        const seedOffset = (typeof seed === 'string' ? seed.charCodeAt(0) * 137 : 0);
        const val = ((hashInput + seedOffset) & 0xFF) / 255;
        const py = y + h - val * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
}

// ============================================
// ZONE STATUS STRIP
// ============================================

function renderZoneStatusBar(x, y, w, zone) {
    // Background
    ctx.fillStyle = 'rgba(5, 8, 18, 0.7)';
    ctx.fillRect(x + 2, y, w - 4, ZONE_STATUS_STRIP_H * _zoneSF);

    const textY = y + 10 * _zoneSF;
    let cx = x + 6 * _zoneSF;
    const isNarrow = w < 200;
    const statusFont = isNarrow ? 'bold ' + Math.round(7 * _zoneSF) + 'px monospace' : 'bold ' + Math.round(9 * _zoneSF) + 'px monospace';
    const barW = isNarrow ? 24 * _zoneSF : 40 * _zoneSF;
    const nrgBarW = isNarrow ? 30 * _zoneSF : 50 * _zoneSF;

    // THR (threat level based on tank count)
    const tankCount = zone.tanks ? zone.tanks.filter(t => t.alive).length : 0;
    const thrColor = tankCount <= 1 ? '#0f0' : tankCount <= 3 ? '#fc0' : '#f44';
    const thrPct = Math.min(1, tankCount / 5);

    ctx.font = statusFont;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    ctx.fillText('THR:', cx, textY);
    cx += isNarrow ? 22 * _zoneSF : 28 * _zoneSF;
    renderNGEBar(cx, y + 2 * _zoneSF, barW, 10 * _zoneSF, thrPct, thrColor);
    cx += barW + 6 * _zoneSF;

    // DFT (drift level -- shows level if drifting, otherwise timer)
    if (zone.driftLevel > 0) {
        const dftColor = zone.driftLevel >= 3 ? '#f44' : zone.driftLevel >= 2 ? '#fc0' : '#0af';
        ctx.fillStyle = dftColor;
        ctx.fillText('DFT:' + zone.driftLevel, cx, textY);
    } else {
        ctx.fillStyle = '#0af';
        const timerSec = Math.ceil(zone.driftTimer || 0);
        ctx.fillText('DFT:' + timerSec + 's', cx, textY);
    }
    cx += isNarrow ? 34 * _zoneSF : 44 * _zoneSF;

    // NRG (energy)
    const energy = zone.crewUfo ? zone.crewUfo.energy : 0;
    const maxEnergy = zone.crewUfo ? zone.crewUfo.maxEnergy : 100;
    const nrgPct = maxEnergy > 0 ? energy / maxEnergy : 0;
    const nrgColor = nrgPct > 0.5 ? '#0f0' : nrgPct > 0.25 ? '#fc0' : '#f44';

    ctx.fillStyle = '#888';
    ctx.fillText('NRG:', cx, textY);
    cx += isNarrow ? 22 * _zoneSF : 28 * _zoneSF;
    renderNGEBar(cx, y + 2 * _zoneSF, nrgBarW, 10 * _zoneSF, nrgPct, nrgColor);
    cx += nrgBarW + 6 * _zoneSF;

    // Q (quota)
    const qCurrent = zone.quota ? zone.quota.current : 0;
    const qTarget = zone.quota ? zone.quota.target : 10;
    const qOnPace = (qCurrent / Math.max(1, qTarget)) >= 0.5;
    ctx.fillStyle = qOnPace ? '#0f0' : '#f44';
    ctx.fillText('Q:' + qCurrent + '/' + qTarget, cx, textY);
}

// ============================================
// ZONE BORDER PULSE
// ============================================

function renderZoneBorderPulse(zx, zy, zw, zh, state, isFocused) {
    const cfg = ZONE_BORDER_CONFIG[state] || ZONE_BORDER_CONFIG.stable;

    let alpha = 1;
    if (cfg.pulse) {
        if (cfg.binary) {
            alpha = Math.floor(Date.now() / cfg.rate) % 2 === 0 ? 1 : 0.2;
        } else {
            alpha = Math.sin(Date.now() / cfg.rate * Math.PI) * 0.3 + 0.5;
        }
    }
    if (cfg.alpha !== undefined) alpha = cfg.alpha;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = cfg.width;
    ctx.strokeRect(zx, zy, zw, zh);
    ctx.restore();

    // Focus glow (gold edge pulse for selected zone)
    if (isFocused && state !== 'override') {
        const goldAlpha = Math.sin(Date.now() / 1200) * 0.15 + 0.85;
        ctx.save();
        ctx.globalAlpha = goldAlpha * 0.3;
        ctx.strokeStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
        ctx.lineWidth = 1;
        ctx.strokeRect(zx - 1, zy - 1, zw + 2, zh + 2);
        ctx.restore();
    }
}

// ============================================
// ZONE DECAY VISUAL EFFECTS
// ============================================

function applyZoneDecayFilter(zx, zy, zw, zh, decayLevel) {
    if (decayLevel <= 0) return;

    // Desaturation overlay (simulated since ctx.filter not universally performant)
    const desatAlpha = decayLevel * 0.08;
    ctx.fillStyle = `rgba(128, 128, 128, ${desatAlpha})`;
    ctx.fillRect(zx, zy, zw, zh);

    // Static noise (level 2+)
    if (decayLevel >= 2) {
        renderDecayNoise(zx, zy, zw, zh, decayLevel);
    }

    // Horizontal tear (level 3+)
    if (decayLevel >= 3 && Math.random() < 0.15) {
        renderDecayTear(zx, zy, zw, zh);
    }

    // Entity flicker overlay (level 3+)
    if (decayLevel >= 3) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
        ctx.fillRect(zx, zy, zw, zh);
    }

    // Heavy static (level 4)
    if (decayLevel >= 4) {
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
            ctx.fillRect(
                zx + Math.random() * zw,
                zy + Math.random() * zh,
                1 + Math.random() * 4,
                1
            );
        }
    }
}

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

function renderDecayTear(zx, zy, zw, zh) {
    const tearY = zy + Math.random() * zh;
    const tearH = 2 + Math.random() * 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(zx + (Math.random() - 0.5) * 6, tearY, zw, tearH);
}

// ============================================
// MINI DRONES — Spider-like harvesters/battle drones
// States: FALLING, UNFOLDING, SEEKING, COLLECTING,
//         ATTACKING, RETURNING, DYING
// ============================================

function renderMiniDrones(zx, zy, zw, zh, drones) {
    if (!drones) return;

    const now = Date.now();
    const groundPixelY = _zoneWorldToPixelY(ZONE_GROUND_Y, zy, zh);

    for (const drone of drones) {
        if (!drone.alive) continue;

        const dx = _zoneWorldToPixelX(drone.x, zx, zw);
        const dy = _zoneWorldToPixelY(drone.y, zy, zh);
        const isBattle = drone.type === 'battle';
        const typeColor = isBattle ? '#f80' : '#0ff';

        ctx.save();

        if (drone.state === 'FALLING') {
            // Small rounded rect falling from sky
            ctx.strokeStyle = typeColor;
            ctx.lineWidth = _zoneSF;
            ctx.beginPath();
            ctx.roundRect(dx - 4 * _zoneSF, dy - 3 * _zoneSF, 8 * _zoneSF, 6 * _zoneSF, 2 * _zoneSF);
            ctx.stroke();

            // Pulsing center dot
            const pulse = 0.5 + Math.sin(now / 150) * 0.5;
            ctx.fillStyle = typeColor;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(dx, dy, 1.5 * _zoneSF, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

        } else if (drone.state === 'UNFOLDING') {
            // Legs extending outward (unfoldProgress 0->1)
            const prog = drone.unfoldProgress || 0;
            _renderDroneBody(dx, dy, typeColor);
            _renderDroneLegs(dx, dy, groundPixelY, prog, 0);

        } else {
            // Active states: SEEKING, COLLECTING, ATTACKING, RETURNING
            const legPhase = drone.legPhase || 0;
            _renderDroneBody(dx, dy, typeColor);
            _renderDroneLegs(dx, dy, groundPixelY, 1, legPhase);

            // Dome glow dot (pulsing)
            const glowPulse = 0.6 + Math.sin(now / 200 + (drone.id || 0)) * 0.4;
            ctx.fillStyle = typeColor;
            ctx.globalAlpha = glowPulse;
            ctx.shadowColor = typeColor;
            ctx.shadowBlur = 4 * _zoneSF;
            ctx.beginPath();
            ctx.arc(dx, dy - 4 * _zoneSF, 1.5 * _zoneSF, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // COLLECTING: mini tractor beam cone
            if (drone.state === 'COLLECTING' && drone.target) {
                const tx = _zoneWorldToPixelX(drone.target.x, zx, zw);
                const ty = _zoneWorldToPixelY(drone.target.y, zy, zh);
                const beamGrad = ctx.createLinearGradient(dx, dy + 2 * _zoneSF, dx, ty);
                beamGrad.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
                beamGrad.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(dx - 2 * _zoneSF, dy + 2 * _zoneSF);
                ctx.lineTo(tx - 6 * _zoneSF, ty);
                ctx.lineTo(tx + 6 * _zoneSF, ty);
                ctx.lineTo(dx + 2 * _zoneSF, dy + 2 * _zoneSF);
                ctx.closePath();
                ctx.fill();
            }

            // ATTACKING: thin beam to target tank
            if (drone.state === 'ATTACKING' && drone.target) {
                const tx = _zoneWorldToPixelX(drone.target.x, zx, zw);
                const ty = _zoneWorldToPixelY(drone.target.y, zy, zh);
                ctx.strokeStyle = 'rgba(255, 100, 50, 0.7)';
                ctx.lineWidth = _zoneSF;
                ctx.beginPath();
                ctx.moveTo(dx, dy);
                ctx.lineTo(tx, ty);
                ctx.stroke();

                // Impact flash at target
                if (Math.sin(now / 100) > 0) {
                    ctx.fillStyle = 'rgba(255, 150, 50, 0.5)';
                    ctx.beginPath();
                    ctx.arc(tx, ty, 3 * _zoneSF, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Energy bar below drone (all active states)
        if (drone.energy !== undefined && drone.maxEnergy > 0) {
            const barW = 10 * _zoneSF;
            const barH = 2 * _zoneSF;
            const barX = dx - barW / 2;
            const barY = dy + 5 * _zoneSF;
            const pct = drone.energy / drone.maxEnergy;
            const barColor = pct > 0.5 ? '#0f0' : pct > 0.25 ? '#fc0' : '#f44';

            ctx.fillStyle = '#0a0c14';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, barW * pct, barH);
        }

        ctx.restore();
    }
}

// Helper: render drone body (grey ellipse + dome arc)
function _renderDroneBody(dx, dy, typeColor) {
    // Body: 6x4 grey ellipse
    ctx.fillStyle = '#667';
    ctx.beginPath();
    ctx.ellipse(dx, dy, 3 * _zoneSF, 2 * _zoneSF, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dome: 3px arc on top
    ctx.strokeStyle = typeColor;
    ctx.lineWidth = 1 * _zoneSF;
    ctx.beginPath();
    ctx.arc(dx, dy - 1 * _zoneSF, 3 * _zoneSF, Math.PI, 0);
    ctx.stroke();
}

// Helper: render drone legs (4 per side, animated)
function _renderDroneLegs(dx, dy, groundY, unfold, legPhase) {
    ctx.strokeStyle = '#889';
    ctx.lineWidth = 1 * _zoneSF;

    const legCount = 4;
    const bodyHalfW = 3 * _zoneSF;
    const legReach = 5 * _zoneSF * unfold;
    const legDrop = Math.min(6 * _zoneSF * unfold, groundY - dy - 2);

    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < legCount; i++) {
            const baseX = dx + side * bodyHalfW;
            const spread = (i - 1.5) * 1.8 * _zoneSF;
            const sinPhase = Math.sin(legPhase + i * 0.8 + (side > 0 ? Math.PI : 0));
            const kneeX = baseX + side * (legReach * 0.5 + spread);
            const kneeY = dy + legDrop * 0.4 + sinPhase * _zoneSF;
            const footX = baseX + side * (legReach + spread);
            const footY = dy + legDrop;

            ctx.beginPath();
            ctx.moveTo(baseX, dy);
            ctx.lineTo(kneeX, kneeY);
            ctx.lineTo(footX, footY);
            ctx.stroke();
        }
    }
}

// ============================================
// MINI BOMBS — Dark orbs with purple glow
// ============================================

function renderMiniBombs(zx, zy, zw, zh, bombs) {
    if (!bombs) return;

    for (const bomb of bombs) {
        if (!bomb.alive) continue;

        const bx = _zoneWorldToPixelX(bomb.x, zx, zw);
        const by = _zoneWorldToPixelY(bomb.y, zy, zh);
        const radius = 4 * _zoneSF;

        ctx.save();

        // Rotation
        ctx.translate(bx, by);
        ctx.rotate(bomb.rotation || 0);

        // Shadow/glow
        ctx.shadowColor = '#606';
        ctx.shadowBlur = 3 * _zoneSF;

        // Dark radial gradient fill
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        grad.addColorStop(0, '#302');
        grad.addColorStop(0.6, '#201');
        grad.addColorStop(1, '#100');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Purple outline ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#808';
        ctx.lineWidth = _zoneSF;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Dither specs (seeded by bomb position for stability)
        ctx.fillStyle = '#a0a';
        const seed = Math.floor((bomb.x || 0) * 7 + (bomb.y || 0) * 13);
        for (let i = 0; i < 3; i++) {
            const hash = ((seed + i) * 2654435761 >>> 0);
            const sx = ((hash & 0xFF) / 255 - 0.5) * radius * 1.4;
            const sy = (((hash >> 8) & 0xFF) / 255 - 0.5) * radius * 1.4;
            ctx.fillRect(sx, sy, _zoneSF, _zoneSF);
        }

        ctx.restore();
    }
}

// ============================================
// MINI MISSILES — Red ellipse body with exhaust trail
// Phases: LAUNCH, DECEL, APEX, DIVE, TERMINAL
// ============================================

function renderMiniMissiles(zx, zy, zw, zh, missiles) {
    if (!missiles) return;

    const now = Date.now();

    for (const missile of missiles) {
        if (!missile.alive) continue;

        const mx = _zoneWorldToPixelX(missile.x, zx, zw);
        const my = _zoneWorldToPixelY(missile.y, zy, zh);
        const heading = missile.heading || 0;

        ctx.save();

        // Exhaust trail (draw behind body)
        if (missile.trail && missile.trail.length > 1) {
            ctx.beginPath();
            for (let i = 0; i < missile.trail.length; i++) {
                const tp = missile.trail[i];
                const tx = _zoneWorldToPixelX(tp.x, zx, zw);
                const ty = _zoneWorldToPixelY(tp.y, zy, zh);
                if (i === 0) ctx.moveTo(tx, ty);
                else ctx.lineTo(tx, ty);
            }
            // Color fades from orange to grey
            const trailAge = missile.trail.length;
            const trailAlpha = Math.max(0.15, 0.6 - trailAge * 0.03);
            ctx.strokeStyle = `rgba(200, 120, 50, ${trailAlpha})`;
            ctx.lineWidth = _zoneSF;
            ctx.stroke();

            // Smoke puffs on older trail points
            for (let i = 0; i < missile.trail.length; i++) {
                if (i < 3) continue; // Skip recent points
                const tp = missile.trail[i];
                const tx = _zoneWorldToPixelX(tp.x, zx, zw);
                const ty = _zoneWorldToPixelY(tp.y, zy, zh);
                ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
                ctx.beginPath();
                ctx.arc(tx, ty, 2 * _zoneSF, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // APEX flash
        if (missile.phase === 'APEX') {
            const apexPulse = 0.5 + Math.sin(now / 60) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${apexPulse * 0.8})`;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 6 * _zoneSF;
            ctx.beginPath();
            ctx.arc(mx, my, 4 * _zoneSF, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Body: 5x2 red ellipse rotated to heading
        ctx.translate(mx, my);
        ctx.rotate(heading);
        ctx.fillStyle = '#e22';
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.5 * _zoneSF, 1 * _zoneSF, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose glow: orange dot at front
        ctx.fillStyle = '#f80';
        ctx.beginPath();
        ctx.arc(2.5 * _zoneSF, 0, _zoneSF, 0, Math.PI * 2);
        ctx.fill();

        // LAUNCH exhaust line behind
        if (missile.phase === 'LAUNCH') {
            ctx.strokeStyle = 'rgba(255, 150, 50, 0.7)';
            ctx.lineWidth = _zoneSF;
            ctx.beginPath();
            ctx.moveTo(-2.5 * _zoneSF, 0);
            ctx.lineTo(-8 * _zoneSF, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ============================================
// MINI COORDINATORS — Hovering command units
// with spinning ring, tether lines, radio link
// ============================================

function renderMiniCoordinators(zx, zy, zw, zh, coordinators, crewUfo, drones) {
    if (!coordinators) return;

    const now = Date.now();

    for (const coord of coordinators) {
        if (!coord.alive) continue;

        const cx = _zoneWorldToPixelX(coord.x, zx, zw);
        const cy = _zoneWorldToPixelY(coord.y, zy, zh);
        const isAttack = coord.type === 'attack';
        const typeColor = isAttack ? '#f80' : '#0ff';

        ctx.save();

        // DEPLOYING: reduced alpha, descending
        if (coord.state === 'DEPLOYING') {
            ctx.globalAlpha = 0.6;
        }

        // DYING: tilt and fade
        if (coord.state === 'DYING') {
            const fadeProgress = coord.fadeProgress || 0;
            ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
            ctx.translate(cx, cy);
            ctx.rotate(fadeProgress * 0.5);
            ctx.translate(-cx, -cy);
        }

        // Radio control line from UFO (wavy FM-modulated)
        if (crewUfo) {
            const ux = _zoneWorldToPixelX(crewUfo.x, zx, zw);
            const uy = _zoneWorldToPixelY(crewUfo.y, zy, zh);

            ctx.strokeStyle = isAttack ? 'rgba(255, 136, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)';
            ctx.lineWidth = _zoneSF;
            ctx.beginPath();
            const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const py = uy + (cy - uy) * t;
                const px = ux + (cx - ux) * t + Math.sin(py * 0.3 + now / 200) * 3 * _zoneSF;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Body: 8x10 dark grey ellipse
        ctx.fillStyle = '#445';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 4 * _zoneSF, 5 * _zoneSF, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spinning ring: thin 1px ellipse outline
        const spinAngle = coord.spinAngle || (now / 1000 * (COMMAND_CONFIG.WEAPONS.COORDINATOR.SPIN_SPEED || 1.2));
        const ringScaleX = Math.abs(Math.cos(spinAngle));
        ctx.strokeStyle = typeColor;
        ctx.lineWidth = _zoneSF;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5 * _zoneSF * Math.max(0.3, ringScaleX), 6 * _zoneSF, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Center glow dot (pulsing)
        const glowPulse = 0.5 + Math.sin(now / 200 + (coord.id || 0)) * 0.5;
        ctx.fillStyle = typeColor;
        ctx.globalAlpha = (coord.state === 'DYING') ? ctx.globalAlpha : glowPulse;
        ctx.shadowColor = typeColor;
        ctx.shadowBlur = 4 * _zoneSF;
        ctx.beginPath();
        ctx.arc(cx, cy, 2 * _zoneSF, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = (coord.state === 'DEPLOYING') ? 0.6 : (coord.state === 'DYING') ? Math.max(0, 1 - (coord.fadeProgress || 0)) : 1;

        // Tether lines to sub-drones (found via coordinatorId back-reference)
        if (drones && coord.id) {
            ctx.setLineDash([2 * _zoneSF, 2 * _zoneSF]);
            ctx.strokeStyle = isAttack ? 'rgba(255, 136, 0, 0.4)' : 'rgba(0, 255, 255, 0.4)';
            ctx.lineWidth = _zoneSF;
            for (var di = 0; di < drones.length; di++) {
                var d = drones[di];
                if (d.alive && d.coordinatorId === coord.id) {
                    var sdx = _zoneWorldToPixelX(d.x, zx, zw);
                    var sdy = _zoneWorldToPixelY(d.y, zy, zh);
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(sdx, sdy);
                    ctx.stroke();
                }
            }
            ctx.setLineDash([]);
        }

        // Energy bar below coordinator
        if (coord.energy !== undefined && coord.maxEnergy > 0) {
            const barW = 14 * _zoneSF;
            const barH = 3 * _zoneSF;
            const barX = cx - barW / 2;
            const barY = cy + 8 * _zoneSF;
            const pct = coord.energy / coord.maxEnergy;
            const barColor = pct > 0.5 ? '#0f0' : pct > 0.25 ? '#fc0' : '#f44';

            ctx.fillStyle = '#0a0c14';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, barW * pct, barH);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 0.5 * _zoneSF;
            ctx.strokeRect(barX, barY, barW, barH);
        }

        // SOS rings when energy < 25%
        if (coord.energy !== undefined && coord.maxEnergy > 0 && coord.energy / coord.maxEnergy < 0.25) {
            for (let r = 0; r < 2; r++) {
                const ringPhase = ((now / 800 + r * 0.5) % 1);
                const ringRadius = 6 * _zoneSF + ringPhase * 12 * _zoneSF;
                const ringAlpha = Math.max(0, 0.4 * (1 - ringPhase));
                ctx.strokeStyle = `rgba(255, 68, 68, ${ringAlpha})`;
                ctx.lineWidth = _zoneSF;
                ctx.beginPath();
                ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}

// ============================================
// MINI EXPLOSIONS — Expanding radial burst
// with shockwave ring and age-based fade
// ============================================

function renderMiniExplosions(zx, zy, zw, zh, explosions) {
    if (!explosions) return;

    for (const exp of explosions) {
        if (!exp.alive) continue;

        const ex = _zoneWorldToPixelX(exp.x, zx, zw);
        const ey = _zoneWorldToPixelY(exp.y, zy, zh);
        const maxRadius = exp.maxRadius || COMMAND_CONFIG.WEAPONS.EXPLOSION.BOMB_RADIUS * 0.5;
        const duration = exp.duration || COMMAND_CONFIG.WEAPONS.EXPLOSION.DURATION;
        const age = exp.age || 0;
        const progress = Math.min(1, age / duration);

        if (progress >= 1) continue;

        const currentRadius = maxRadius * progress;
        const alpha = 0.8 * (1 - progress);

        ctx.save();

        // Flash: first 50ms — localized radial burst at explosion point
        // (Avoids filling entire viewport with white rectangle in small-multiples view)
        if (age < 0.05) {
            const flashAlpha = 0.6 * (1 - age / 0.05);
            const flashRadius = maxRadius * 1.5 * _zoneSF;
            const flashGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, flashRadius);
            flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
            flashGrad.addColorStop(0.5, `rgba(255, 255, 200, ${flashAlpha * 0.5})`);
            flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = flashGrad;
            ctx.beginPath();
            ctx.arc(ex, ey, flashRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Expanding radial gradient (white -> yellow -> orange -> transparent)
        const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, currentRadius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(255, 255, 100, ${alpha * 0.8})`);
        grad.addColorStop(0.6, `rgba(255, 160, 50, ${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ex, ey, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Shockwave ring at outer edge
        const ringAlpha = Math.max(0, 0.6 * (1 - progress));
        ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
        ctx.lineWidth = _zoneSF;
        ctx.beginPath();
        ctx.arc(ex, ey, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}
