// ============================================
// COMMAND HUD — Layout Engine + Panel Rendering
// Phase 2 Command Phase visual HUD system
// ============================================

// Layout constants
const CMD_MARGIN = 8;
const CMD_BAR_H = 32;

// ============================================
// LAYOUT ENGINE
// ============================================

function getCommandHUDLayout(zoneCount) {
    const cw = canvas.width;
    const ch = canvas.height;
    const M = CMD_MARGIN;

    // Grid configuration based on zone count
    let cols, rows;
    if (zoneCount <= 2)       { cols = 2; rows = 1; }
    else if (zoneCount <= 4)  { cols = 2; rows = 2; }
    else if (zoneCount <= 6)  { cols = 3; rows = 2; }
    else if (zoneCount <= 9)  { cols = 3; rows = 3; }
    else                      { cols = 4; rows = 4; }

    // Sidebar dimensions
    const SIDEBAR_RATIO = 0.28;
    const MIN_SIDEBAR_W = 240;
    let sidebarW = Math.max(MIN_SIDEBAR_W, Math.floor((cw - M * 3) * SIDEBAR_RATIO));

    // Grid area
    const gridX = M;
    const gridY = M + CMD_BAR_H + M;
    const gridW = cw - sidebarW - M * 3;
    const gridH = ch - CMD_BAR_H - M * 3;

    // Zone panel dimensions
    const zoneW = Math.floor((gridW - M * (cols - 1)) / cols);
    let zoneH = Math.floor((gridH - M * (rows - 1)) / rows);

    // For 2-zone: constrain aspect ratio to ~1.4:1
    let zoneOffsetY = 0;
    if (zoneCount <= 2 && rows === 1) {
        const maxH = Math.floor(zoneW / 1.4);
        if (zoneH > maxH) {
            zoneOffsetY = Math.floor((zoneH - maxH) / 2);
            zoneH = maxH;
        }
    }

    // Build zone rects
    const zones = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (idx >= zoneCount) break;
            zones.push({
                x: gridX + c * (zoneW + M),
                y: gridY + zoneOffsetY + r * (zoneH + M),
                w: zoneW,
                h: zoneH
            });
        }
    }

    // Sidebar positioning
    const sidebarX = gridX + gridW + M;
    const sidebarY = gridY;
    const sidebarH = gridH;

    // Sidebar panel heights (proportional)
    const crewH   = Math.floor(sidebarH * 0.35);
    const resH    = Math.floor(sidebarH * 0.20);
    const ordersH = Math.floor(sidebarH * 0.27);
    const dirH    = sidebarH - crewH - resH - ordersH - M * 3;

    return {
        cmdStatus: {
            x: M, y: M,
            w: cw - M * 2, h: CMD_BAR_H
        },
        zones: zones,
        crewRoster: {
            x: sidebarX,
            y: sidebarY,
            w: sidebarW,
            h: crewH
        },
        resources: {
            x: sidebarX,
            y: sidebarY + crewH + M,
            w: sidebarW,
            h: resH
        },
        orders: {
            x: sidebarX,
            y: sidebarY + crewH + resH + M * 2,
            w: sidebarW,
            h: ordersH
        },
        dirChannel: {
            x: sidebarX,
            y: sidebarY + crewH + resH + ordersH + M * 3,
            w: sidebarW,
            h: dirH
        }
    };
}

// ============================================
// MASTER HUD RENDER
// ============================================

function renderCommandHUD(commandState) {
    const layout = commandState.hudLayout;
    if (!layout) return;

    renderCommandStatusBar(layout.cmdStatus, commandState);
    renderCrewRosterPanel(layout.crewRoster, commandState.roster, commandState.zones);
    renderResourcePanel(layout.resources, commandState.pipeline, commandState.zones);
    renderOrdersPanel(layout.orders, commandState);
    renderDirectorChannelPanel(layout.dirChannel, commandState.director);

    // Director screen effect when transmitting
    if (commandState.director && commandState.director.isTransmitting) {
        renderDirectorScreenEffect(true);
    }
}

// ============================================
// COMMAND STATUS BAR
// ============================================

function renderCommandStatusBar(rect, commandState) {
    const { x, y, w, h } = rect;

    renderNGEPanel(x, y, w, h, {
        color: COMMAND_CONFIG.COLORS.COMMAND_GOLD,
        cutCorners: ['tl'],
        alpha: 0.75,
        label: 'CMD.STATUS'
    });

    const textY = y + h / 2 + 5;
    let cx = x + 12;

    // Wave number
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
    const waveText = 'CMD.' + (commandState.commandWave || 1);
    ctx.fillText(waveText, cx, textY);
    cx += ctx.measureText(waveText).width + 16;

    // Score
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('SCORE:', cx, textY);
    cx += ctx.measureText('SCORE:').width + 4;

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    const scoreText = (typeof score !== 'undefined' ? score : 0).toLocaleString();
    ctx.fillText(scoreText, cx, textY);
    cx += ctx.measureText(scoreText).width + 16;

    // Quota progress
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('QUOTA:', cx, textY);
    cx += ctx.measureText('QUOTA:').width + 4;

    const quotaPercent = getOverallQuotaPercent(commandState.zones);
    const quotaColor = quotaPercent >= 0.8 ? '#0f0' : quotaPercent >= 0.5 ? '#fc0' : '#f44';
    renderNGEBar(cx, y + h / 2 - 6, 120, 12, quotaPercent, quotaColor);
    cx += 124;

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = quotaColor;
    const qPctText = Math.floor(quotaPercent * 100) + '%';
    ctx.fillText(qPctText, cx, textY);
    cx += ctx.measureText(qPctText).width + 16;

    // Timer (right-aligned section)
    const timerVal = Math.max(0, commandState.waveTimer || 0);
    const timerLow = timerVal <= 10;
    const timerMin = Math.floor(timerVal / 60);
    const timerSec = Math.floor(timerVal % 60);
    const timerText = timerMin + ':' + String(timerSec).padStart(2, '0');

    // CP value (far right)
    const cpText = String(commandState.commandPoints || 0);
    ctx.font = 'bold 14px monospace';
    const cpWidth = ctx.measureText(cpText).width;
    ctx.font = 'bold 11px monospace';
    const cpLabelWidth = ctx.measureText('CP:').width;
    const cpTotalW = cpLabelWidth + 4 + cpWidth;

    // Timer positioning
    ctx.font = 'bold 16px monospace';
    const timerWidth = ctx.measureText(timerText).width;
    ctx.font = 'bold 11px monospace';
    const timeLabelW = ctx.measureText('TIME:').width;
    const timerTotalW = timeLabelW + 4 + timerWidth;

    const rightEdge = x + w - 12;
    const cpX = rightEdge - cpTotalW;
    const timerX = cpX - timerTotalW - 16;

    // Render timer
    const timerBlink = timerLow && Math.floor(Date.now() / 300) % 2 === 0;
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = timerLow ? '#f44' : '#888';
    if (!timerBlink) ctx.fillText('TIME:', timerX, textY);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = timerLow ? '#f44' : '#fff';
    if (!timerBlink) ctx.fillText(timerText, timerX + timeLabelW + 4, textY);

    // Render CP
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('CP:', cpX, textY);
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
    ctx.fillText(cpText, cpX + cpLabelWidth + 4, textY);
}

// ============================================
// CREW ROSTER PANEL
// ============================================

function renderCrewRosterPanel(rect, roster, zones) {
    const { x, y, w, h } = rect;

    renderNGEPanel(x, y, w, h, {
        color: '#0f0',
        cutCorners: ['tr'],
        alpha: 0.75,
        label: 'CREW.ROSTER'
    });

    if (!roster || !roster.members) return;

    const members = roster.members;
    const rowH = Math.floor((h - 20) / Math.max(members.length, 1));
    const startY = y + 18;
    const compact = rowH < 30;

    for (let i = 0; i < members.length; i++) {
        const crew = members[i];
        const ry = startY + i * rowH;

        if (compact) {
            // Compact mode: name + morale dot + zone tag, no portrait
            const textX = x + 6;
            const nameY = ry + 12;

            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0f0';
            ctx.fillText(crew.name || '???', textX, nameY);

            // Morale dot (colored circle)
            const moraleColor = getMoraleColor(crew.morale);
            const dotX = textX + ctx.measureText(crew.name || '???').width + 6;
            ctx.fillStyle = moraleColor;
            ctx.beginPath();
            ctx.arc(dotX + 3, nameY - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            // Zone tag (right-aligned)
            if (crew.assignedZone) {
                const zone = zones ? zones.find(z => z.id === crew.assignedZone) : null;
                const zoneName = zone ? zone.name.split(' ')[1] || zone.name : crew.assignedZone;
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#0ff';
                ctx.fillText('[' + zoneName + ']', x + w - 6, nameY);
                ctx.textAlign = 'left';
            }
        } else {
            // Full mode: portrait, name, stars, zone, trait, morale bar
            const portraitSize = Math.min(32, rowH - 4);

            // Portrait
            if (typeof renderCrewPortrait === 'function') {
                renderCrewPortrait(x + 6, ry, portraitSize, crew);
            }

            const textX = x + 6 + portraitSize + 6;
            const nameY = ry + 12;

            // Name
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0f0';
            ctx.fillText(crew.name || '???', textX, nameY);

            // Performance stars
            const perfMod = crew.getPerformanceModifier ? crew.getPerformanceModifier() : 0.5;
            const starCount = Math.min(5, Math.max(1, Math.round(perfMod * 5)));
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fc0';
            let starStr = '';
            for (let s = 0; s < starCount; s++) starStr += '\u2605';
            ctx.fillText(starStr, textX + ctx.measureText(crew.name || '???').width + 6, nameY);

            // Zone assignment (right-aligned to fit sidebar)
            if (crew.assignedZone) {
                const zone = zones ? zones.find(z => z.id === crew.assignedZone) : null;
                const zoneName = zone ? zone.name.split(' ')[1] || zone.name : crew.assignedZone;
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'right';
                ctx.fillStyle = '#0ff';
                ctx.fillText('[' + zoneName + ']', x + w - 6, nameY);
                ctx.textAlign = 'left';
            }

            // Trait label
            const traitLabel = crew.getTraitLabel ? crew.getTraitLabel() :
                (crew.traits.reckless > 0.6 ? 'RECKLESS' : crew.traits.reckless < 0.4 ? 'CAUTIOUS' : 'BALANCED');
            const traitColor = crew.traits.reckless > 0.6 ? COMMAND_CONFIG.COLORS.TRAIT_RECKLESS :
                              crew.traits.reckless < 0.4 ? COMMAND_CONFIG.COLORS.TRAIT_CAUTIOUS : '#0ff';
            ctx.font = 'bold 7px monospace';
            ctx.fillStyle = traitColor;
            ctx.fillText('\u25B8 ' + traitLabel, textX, nameY + 12);

            // Morale bar (width adapts to available space)
            const moraleColor = getMoraleColor(crew.morale);
            const barX = textX;
            const barY = nameY + 16;
            const moraleBarW = Math.min(60, w - portraitSize - 50);
            ctx.font = 'bold 7px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText('MRL:', barX, barY + 7);
            renderNGEBar(barX + 28, barY, moraleBarW, 8, crew.morale, moraleColor);
        }
    }
}

// ============================================
// RESOURCE PANEL
// ============================================

function renderResourcePanel(rect, pipeline, zones) {
    const { x, y, w, h } = rect;

    renderNGEPanel(x, y, w, h, {
        color: '#f80',
        cutCorners: ['bl'],
        alpha: 0.75,
        label: 'RES.FLOW'
    });

    const startY = y + 20;
    const lineH = Math.min(22, Math.floor((h - 24) / 4));
    const labelX = x + 10;
    const valX = x + 60;
    const nrgBarW = Math.min(80, w - 120);

    // Compute aggregate energy
    let totalEnergy = 0;
    let totalMaxEnergy = 0;
    if (zones) {
        for (const z of zones) {
            totalEnergy += z.crewUfo ? z.crewUfo.energy : 0;
            totalMaxEnergy += z.crewUfo ? z.crewUfo.maxEnergy : 100;
        }
    }
    const energyPct = totalMaxEnergy > 0 ? totalEnergy / totalMaxEnergy : 0;
    const energyColor = energyPct > 0.5 ? '#0f0' : energyPct > 0.25 ? '#fc0' : '#f44';

    // ENERGY
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    ctx.fillText('ENERGY:', labelX, startY + 9);
    renderNGEBar(valX, startY, nrgBarW, 10, energyPct, energyColor);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = energyColor;
    ctx.fillText(Math.floor(energyPct * 100) + '%', valX + nrgBarW + 4, startY + 9);

    // BIO-MATTER
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('BIO-M:', labelX, startY + lineH + 9);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#0f0';
    const bioVal = typeof bioMatter !== 'undefined' ? bioMatter : 0;
    ctx.fillText(bioVal.toLocaleString(), valX, startY + lineH + 9);

    // DRONES (placeholder for first slice)
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('DRONES:', labelX, startY + lineH * 2 + 9);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#48f';
    ctx.fillText('--/--', valX, startY + lineH * 2 + 9);

    // CMD POINTS
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('CMD.PT:', labelX, startY + lineH * 3 + 9);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
    ctx.fillText(String(typeof commandState !== 'undefined' ? (commandState.commandPoints || 0) : 0), valX, startY + lineH * 3 + 9);

    // Resource flow particles (if pipeline has active transfers)
    if (pipeline && pipeline.transfers && pipeline.transfers.length > 0) {
        renderResourceFlowParticles(pipeline.transfers, zones);
    }
}

// ============================================
// ORDERS PANEL
// ============================================

function renderOrdersPanel(rect, commandState) {
    const { x, y, w, h } = rect;

    renderNGEPanel(x, y, w, h, {
        color: '#0ff',
        cutCorners: ['tl'],
        alpha: 0.75,
        label: 'ORDERS'
    });

    const badgeX = x + 8;
    const labelX = x + 32;
    const lineH = 16;
    const zones = commandState.zones || [];

    // ---- SECTION 1: ZONE SELECT ----
    const selLabelY = y + 14;
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#555';
    ctx.fillText('ZONE SELECT', labelX, selLabelY);

    const selStartY = selLabelY + 6;
    for (let i = 0; i < zones.length; i++) {
        const ky = selStartY + i * lineH;
        renderNGEKeyBadge(badgeX, ky, String(i + 1));
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        const isSel = commandState.selectedZone === i;
        ctx.fillStyle = isSel ? '#fff' : '#aaa';
        const zName = zones[i].name || ('ZONE ' + String.fromCharCode(65 + i));
        const selText = 'SELECT ' + zName.split(' ').pop();
        ctx.fillText(selText, labelX, ky + 12);
        if (isSel) {
            // Gold underline for selected zone
            ctx.strokeStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(labelX, ky + 15);
            ctx.lineTo(labelX + ctx.measureText(selText).width, ky + 15);
            ctx.stroke();
        }
    }

    // Override key
    const overrideY = selStartY + zones.length * lineH;
    renderNGEKeyBadge(badgeX, overrideY, 'O');
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = commandState.overrideAvailable ? '#0ff' : '#555';
    ctx.fillText('OVERRIDE' + (commandState.overrideAvailable ? '' : ' (USED)'), labelX, overrideY + 12);

    // ---- SEPARATOR ----
    const sepY = overrideY + lineH + 4;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, sepY);
    ctx.lineTo(x + w - 6, sepY);
    ctx.stroke();

    // ---- SECTION 2: FLEET ORDERS (vertical, descriptive) ----
    const fleetLabelY = sepY + 10;
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#555';
    ctx.fillText('FLEET ORDERS', labelX, fleetLabelY);

    const fleetOrders = [
        { key: 'D', name: 'DEFENSIVE', desc: 'Evade threats, fewer captures', order: 'defensive' },
        { key: 'B', name: 'BALANCED',  desc: 'Standard operations', order: 'balanced' },
        { key: 'H', name: 'HARVEST',   desc: 'Aggressive capture, higher risk', order: 'harvest' }
    ];

    const selectedZone = zones[commandState.selectedZone];
    const currentOrder = selectedZone ? selectedZone.fleetOrder : 'balanced';
    const fleetStartY = fleetLabelY + 6;
    const fleetLineH = 16;

    for (let i = 0; i < fleetOrders.length; i++) {
        const fo = fleetOrders[i];
        const fy = fleetStartY + i * fleetLineH;
        const isActive = currentOrder === fo.order;

        // Active order highlight strip
        if (isActive) {
            ctx.fillStyle = 'rgba(212, 160, 23, 0.12)';
            ctx.fillRect(x + 4, fy - 1, w - 8, fleetLineH);
        }

        // Key badge
        renderNGEKeyBadge(badgeX, fy, fo.key);

        // Order name (bold)
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        if (isActive) {
            ctx.fillStyle = '#fff';
            // Gold arrow before name
            ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
            ctx.fillText('\u25B8', labelX, fy + 12);
            ctx.fillStyle = '#fff';
            ctx.fillText(fo.name, labelX + 10, fy + 12);
        } else {
            ctx.fillStyle = '#777';
            ctx.fillText(fo.name, labelX, fy + 12);
        }

        // Description (dimmer, smaller, after a dash)
        const nameWidth = ctx.measureText(isActive ? fo.name : fo.name).width;
        const descX = labelX + (isActive ? 10 : 0) + nameWidth + 6;
        // Only render description if it fits in the panel
        if (descX + 10 < x + w) {
            ctx.font = '9px monospace';
            ctx.fillStyle = isActive ? '#999' : '#555';
            // Truncate description if needed
            let desc = fo.desc;
            while (ctx.measureText(desc).width > (x + w - descX - 6) && desc.length > 3) {
                desc = desc.slice(0, -1);
            }
            ctx.fillText(desc, descX, fy + 12);
        }

        // Gold underline for active order
        if (isActive) {
            ctx.strokeStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(labelX + 10, fy + 14);
            ctx.lineTo(labelX + 10 + ctx.measureText(fo.name).width, fy + 14);
            ctx.stroke();
        }
    }
}

// ============================================
// DIRECTOR CHANNEL PANEL
// ============================================

function renderDirectorChannelPanel(rect, director) {
    const { x, y, w, h } = rect;

    const isTransmitting = director && director.isTransmitting;
    const borderColor = isTransmitting ? COMMAND_CONFIG.COLORS.DIRECTOR_BORDER : '#555';

    renderNGEPanel(x, y, w, h, {
        color: borderColor,
        cutCorners: ['br'],
        alpha: isTransmitting ? 0.85 : 0.65,
        label: 'DIR.CHANNEL'
    });

    if (!director) return;

    if (isTransmitting && director.currentDialogue) {
        // Director portrait (left side, capped to fit sidebar width)
        const portraitSize = Math.min(h - 12, Math.floor(w * 0.3));
        if (typeof renderDirectorPortrait === 'function') {
            renderDirectorPortrait(x + 6, y + 6, portraitSize, director.mood || 'neutral');
        }

        // Typewriter text (right side)
        const textX = x + portraitSize + 16;
        const textW = w - portraitSize - 26;
        const dialogue = director.currentDialogue;
        const charsVisible = Math.floor(director.dialogueProgress || 0);
        const visibleText = dialogue.substring(0, charsVisible);

        const fontSize = w < 280 ? 11 : 13;
        ctx.font = fontSize + 'px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_SPEECH;

        // Word wrap
        wrapText(ctx, visibleText, textX, y + 20, textW, fontSize + 3);
    } else {
        // Idle state
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#444';
        ctx.fillText('CHANNEL STANDBY', x + w / 2, y + h / 2 + 4);
    }
}

// ============================================
// RESOURCE FLOW PARTICLES
// ============================================

function renderResourceFlowParticles(transfers, zones) {
    if (!transfers || !zones || zones.length < 2) return;

    const layout = typeof commandState !== 'undefined' ? commandState.hudLayout : null;
    if (!layout || !layout.zones) return;

    for (const transfer of transfers) {
        if (!transfer.from || !transfer.to) continue;

        const fromSuffix = transfer.from.replace('zone-', '');
        const fromIdx = fromSuffix === 'a' ? 0 : fromSuffix === 'b' ? 1 : (parseInt(fromSuffix, 10) || 0);
        const toSuffix = transfer.to.replace('zone-', '');
        const toIdx = toSuffix === 'a' ? 0 : toSuffix === 'b' ? 1 : (parseInt(toSuffix, 10) || 0);
        const fromRect = layout.zones[fromIdx];
        const toRect = layout.zones[toIdx];
        if (!fromRect || !toRect) continue;

        const progress = transfer.elapsed / transfer.delay;
        const particleCount = 5;

        for (let p = 0; p < particleCount; p++) {
            const t = (progress + p / particleCount) % 1;
            // Use center-to-nearest-edge for grid-aware particle flow
            const fromCx = fromRect.x + fromRect.w / 2;
            const fromCy = fromRect.y + fromRect.h / 2;
            const toCx = toRect.x + toRect.w / 2;
            const toCy = toRect.y + toRect.h / 2;
            const dx = toCx - fromCx;
            const dy = toCy - fromCy;
            // Start/end at panel edges facing the other panel
            const sx = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? fromRect.x + fromRect.w : fromRect.x)
                : fromCx;
            const sy = Math.abs(dy) >= Math.abs(dx)
                ? (dy > 0 ? fromRect.y + fromRect.h : fromRect.y)
                : fromCy;
            const ex = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? toRect.x : toRect.x + toRect.w)
                : toCx;
            const ey = Math.abs(dy) >= Math.abs(dx)
                ? (dy > 0 ? toRect.y : toRect.y + toRect.h)
                : toCy;
            const midX = (sx + ex) / 2;
            const midY = (sy + ey) / 2 - 30 + (Math.sin(p * 2.7) * 15);

            // Quadratic bezier
            const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * midX + t * t * ex;
            const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * midY + t * t * ey;

            const pColor = transfer.type === 'energy' ? '#0ff' : '#0f0';
            ctx.fillStyle = pColor;
            ctx.shadowColor = pColor;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getOverallQuotaPercent(zones) {
    if (!zones || zones.length === 0) return 0;
    let totalCurrent = 0;
    let totalTarget = 0;
    for (const z of zones) {
        totalCurrent += z.quota ? z.quota.current : 0;
        totalTarget += z.quota ? z.quota.target : 10;
    }
    return totalTarget > 0 ? totalCurrent / totalTarget : 0;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let ly = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
            ctx.fillText(line.trim(), x, ly);
            line = words[i] + ' ';
            ly += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line.trim().length > 0) {
        ctx.fillText(line.trim(), x, ly);
    }
}
