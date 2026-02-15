// ============================================
// COMMAND BOOT SEQUENCE
// Gold-themed boot overlays for command panels.
// Fires after promotion cinematic and between waves.
// Agent 3 (Rendering & HUD) owns this file.
// Uses global ctx/canvas from game.js.
// ============================================

// Between-wave diagnostic text per panel
var WAVE_BOOT_LINES = {
    cmdStatus: [
        'COMMAND SYSTEMS... INITIALIZING',
        'WAVE {wave}... STANDING BY'
    ],
    crewRoster: [
        'PERSONNEL DATABASE... LOADED',
        'ROSTER INTEGRITY... VERIFIED'
    ],
    resources: [
        'RESOURCE PIPELINE... CONNECTED',
        'TRANSIT EFFICIENCY... 90%'
    ],
    orders: [
        'FLEET ORDER SYSTEM... LOADED',
        'INPUT CHANNELS... OPEN'
    ],
    dirChannel: [
        'DIRECTOR UPLINK... ESTABLISHED',
        'SECURE CHANNEL... ACTIVE'
    ]
};

// Zone boot line labels (A-P)
var ZONE_BOOT_LABELS = 'ABCDEFGHIJKLMNOP';

// Boot state -- mirrors Phase 1 hudBootState pattern
var commandBootState = {
    active: false,
    elapsed: 0,
    panels: {},
    _bootLines: {}
};

// ============================================
// PUBLIC API
// ============================================

function initCommandBoot(commandWave) {
    var waveNum = commandWave || 1;
    var zoneCount = (typeof commandState !== 'undefined' && commandState && commandState.zones)
        ? commandState.zones.length : 2;

    commandBootState.active = true;
    commandBootState.elapsed = 0;
    commandBootState._allSystemsPlayed = false;
    commandBootState.panels = {
        cmdStatus:  { startTime: 0.0, duration: 0.8, progress: 0, phase: 'waiting', label: 'CMD.STATUS' }
    };

    // Dynamically add zone boot panels
    for (var z = 0; z < zoneCount; z++) {
        var zoneKey = 'zone' + ZONE_BOOT_LABELS[z];
        var zoneLabel = 'ZONE.' + ZONE_BOOT_LABELS[z];
        commandBootState.panels[zoneKey] = {
            startTime: 0.1 + z * 0.08,
            duration: 1.0,
            progress: 0,
            phase: 'waiting',
            label: zoneLabel
        };
    }

    // Sidebar panels staggered after zones
    var sidebarStart = 0.1 + zoneCount * 0.08 + 0.1;
    commandBootState.panels.crewRoster = { startTime: sidebarStart,       duration: 0.8, progress: 0, phase: 'waiting', label: 'CREW.ROSTER' };
    commandBootState.panels.resources  = { startTime: sidebarStart + 0.1, duration: 0.8, progress: 0, phase: 'waiting', label: 'RES.FLOW' };
    commandBootState.panels.orders     = { startTime: sidebarStart + 0.2, duration: 0.8, progress: 0, phase: 'waiting', label: 'ORDERS' };
    commandBootState.panels.dirChannel = { startTime: sidebarStart + 0.3, duration: 0.8, progress: 0, phase: 'waiting', label: 'DIR.CHANNEL' };

    // Template in the wave number for static boot lines
    commandBootState._bootLines = {};
    var bootKeys = Object.keys(WAVE_BOOT_LINES);
    for (var i = 0; i < bootKeys.length; i++) {
        var key = bootKeys[i];
        var lines = WAVE_BOOT_LINES[key];
        commandBootState._bootLines[key] = [];
        for (var j = 0; j < lines.length; j++) {
            commandBootState._bootLines[key].push(
                lines[j].replace('{wave}', String(waveNum))
            );
        }
    }

    // Generate zone boot lines dynamically
    for (var z = 0; z < zoneCount; z++) {
        var zKey = 'zone' + ZONE_BOOT_LABELS[z];
        commandBootState._bootLines[zKey] = [
            'ZONE ARRAY [' + ZONE_BOOT_LABELS[z] + ']... ONLINE',
            'CREW ASSIGNMENT... CONFIRMED'
        ];
    }
}

function updateCommandBoot(dt) {
    if (!commandBootState.active) return;

    commandBootState.elapsed += dt;
    var t = commandBootState.elapsed;

    var allOnline = true;
    var panelKeys = Object.keys(commandBootState.panels);

    for (var i = 0; i < panelKeys.length; i++) {
        var key = panelKeys[i];
        var panel = commandBootState.panels[key];

        if (t < panel.startTime) {
            panel.phase = 'waiting';
            panel.progress = 0;
            allOnline = false;
        } else if (t < panel.startTime + panel.duration) {
            if (panel.phase === 'waiting') {
                // Panel just started booting
                CommandSFX.play('bootPanelStart');
            }
            panel.phase = 'booting';
            panel.progress = (t - panel.startTime) / panel.duration;
            allOnline = false;
        } else {
            if (panel.phase !== 'online') {
                panel.phase = 'online';
                panel.progress = 1;
                // Play boot panel online sound
                CommandSFX.play('bootPanelOnline');
            }
        }
    }

    if (allOnline) {
        // Brief settling period after last panel
        var lastEnd = 0;
        for (var k = 0; k < panelKeys.length; k++) {
            var p = commandBootState.panels[panelKeys[k]];
            var end = p.startTime + p.duration;
            if (end > lastEnd) lastEnd = end;
        }
        // Play all-systems sound once when settling begins
        if (!commandBootState._allSystemsPlayed) {
            commandBootState._allSystemsPlayed = true;
            CommandSFX.play('bootAllSystems');
        }
        if (t > lastEnd + 0.3) {
            commandBootState.active = false;
        }
    }
}

function renderCommandBoot() {
    if (!commandBootState.active) return;

    var layout = (typeof commandState !== 'undefined' && commandState.hudLayout)
        ? commandState.hudLayout : null;
    if (!layout) return;

    var gold = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
    var panels = commandBootState.panels;
    var bootLines = commandBootState._bootLines;

    // Map panel keys to layout rects
    var panelMap = _getCommandBootPanelMap(layout);

    var panelKeys = Object.keys(panels);
    for (var i = 0; i < panelKeys.length; i++) {
        var key = panelKeys[i];
        var panelState = panels[key];
        var rect = panelMap[key];
        if (!rect) continue;

        _renderCommandPanelBootOverlay(
            rect, gold, panelState.label, panelState, bootLines[key]
        );
    }
}

function isCommandBootComplete() {
    return !commandBootState.active;
}

// ============================================
// INTERNAL HELPERS
// ============================================

function _getCommandBootPanelMap(layout) {
    var map = {};
    if (!layout) return map;

    if (layout.cmdStatus)  map.cmdStatus  = layout.cmdStatus;
    // Map zone panels dynamically
    if (layout.zones) {
        for (var i = 0; i < layout.zones.length; i++) {
            map['zone' + ZONE_BOOT_LABELS[i]] = layout.zones[i];
        }
    }
    if (layout.crewRoster) map.crewRoster = layout.crewRoster;
    if (layout.resources)  map.resources  = layout.resources;
    if (layout.orders)     map.orders     = layout.orders;
    if (layout.dirChannel) map.dirChannel = layout.dirChannel;
    return map;
}

function _renderCommandPanelBootOverlay(rect, color, label, panelState, bootLines) {
    if (panelState.phase === 'waiting') return;

    var x = rect.x, y = rect.y, w = rect.w, h = rect.h;
    var progress = panelState.progress;

    // Online phase: brief gold flash then nothing
    if (panelState.phase === 'online') {
        var flashElapsed = commandBootState.elapsed -
            (panelState.startTime + panelState.duration);
        if (flashElapsed < 0.2) {
            var flashAlpha = 0.15 * (1 - flashElapsed / 0.2);
            if (flashAlpha > 0) {
                ctx.fillStyle = 'rgba(' + hexToRgb(color) + ', ' + flashAlpha + ')';
                ctx.fillRect(x, y, w, h);
            }
        }
        return;
    }

    // Booting phase: full overlay
    ctx.save();

    // Warm dark background (command gold tinted)
    var bgAlpha = 0.9 * (1 - progress * 0.8);
    ctx.fillStyle = 'rgba(18, 14, 5, ' + bgAlpha + ')';
    ctx.fillRect(x, y, w, h);

    // Panel border with gold alpha based on progress
    var borderAlpha = 0.3 + progress * 0.5;
    ctx.strokeStyle = 'rgba(' + hexToRgb(color) + ', ' + borderAlpha + ')';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Border trace effect (progress 0 - 0.3)
    if (progress < 0.3) {
        var traceT = progress / 0.3;
        var perimeter = 2 * (w + h);
        var tracePos = traceT * perimeter;

        // Position along perimeter (clockwise from top-left)
        var tx, ty;
        if (tracePos < w) {
            tx = x + tracePos; ty = y;
        } else if (tracePos < w + h) {
            tx = x + w; ty = y + (tracePos - w);
        } else if (tracePos < 2 * w + h) {
            tx = x + w - (tracePos - w - h); ty = y + h;
        } else {
            tx = x; ty = y + h - (tracePos - 2 * w - h);
        }

        // Glowing gold dot
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Short gradient trail
        var trailLen = Math.min(50, tracePos);
        if (trailLen > 2) {
            var trailStartPos = Math.max(0, tracePos - trailLen);
            var tsx, tsy;
            if (trailStartPos < w) {
                tsx = x + trailStartPos; tsy = y;
            } else if (trailStartPos < w + h) {
                tsx = x + w; tsy = y + (trailStartPos - w);
            } else if (trailStartPos < 2 * w + h) {
                tsx = x + w - (trailStartPos - w - h); tsy = y + h;
            } else {
                tsx = x; tsy = y + h - (trailStartPos - 2 * w - h);
            }
            ctx.beginPath();
            ctx.moveTo(tsx, tsy);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = 'rgba(' + hexToRgb(color) + ', 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Clip for text rendering
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, y + 2, w - 4, h - 4);
    ctx.clip();

    // Label typewriter effect (first 20% of boot)
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    if (progress < 0.2) {
        var charCount = Math.floor((progress / 0.2) * label.length);
        ctx.fillText(label.substring(0, charCount), x + 4, y + 12);
    } else {
        ctx.fillText(label, x + 4, y + 12);
    }

    // Diagnostic text lines
    if (bootLines && bootLines.length > 0) {
        var lineH = 11;
        var textStartY = y + 24;
        var visibleLines = Math.floor(progress * bootLines.length);

        ctx.font = '9px monospace';
        ctx.textAlign = 'left';

        for (var li = 0; li <= visibleLines && li < bootLines.length; li++) {
            var isCurrent = (li === visibleLines);
            var lineAlpha = isCurrent ?
                (progress * bootLines.length - li) :
                Math.min(1, 0.5 + (li / bootLines.length) * 0.4);

            var line = bootLines[li];
            var ly = textStartY + li * lineH;
            if (ly > y + h - 10) break;

            // Gold-tinted diagnostic text, green for completion keywords
            if (line === '') continue;
            if (line.indexOf('ONLINE') !== -1 || line.indexOf('CONFIRMED') !== -1 ||
                line.indexOf('VERIFIED') !== -1 || line.indexOf('ACTIVE') !== -1 ||
                line.indexOf('LOADED') !== -1 || line.indexOf('READY') !== -1) {
                ctx.fillStyle = 'rgba(0, 255, 100, ' + lineAlpha + ')';
            } else {
                ctx.fillStyle = 'rgba(' + hexToRgb(color) + ', ' + lineAlpha + ')';
            }

            if (isCurrent) {
                var partialProgress = progress * bootLines.length - li;
                var charsToShow = Math.floor(partialProgress * line.length);
                ctx.fillText(line.substring(0, charsToShow), x + 4, ly);
            } else {
                ctx.fillText(line, x + 4, ly);
            }
        }

        // Blinking cursor
        var cursorLineIdx = Math.min(visibleLines, bootLines.length - 1);
        var cursorY = textStartY + cursorLineIdx * lineH;
        if (cursorY < y + h - 10) {
            var blink = Math.floor(Date.now() / 400) % 2 === 0;
            if (blink) {
                ctx.fillStyle = 'rgba(' + hexToRgb(color) + ', 0.8)';
                var cursorLine = bootLines[cursorLineIdx] || '';
                var cursorX = x + 4 + ctx.measureText(cursorLine).width + 2;
                ctx.fillText('_', Math.min(cursorX, x + w - 10), cursorY);
            }
        }
    }

    ctx.restore(); // end text clip

    // Progress bar at bottom (3px tall)
    var barPad = 4;
    var barY = y + h - barPad - 3;
    var barW = w - barPad * 2;
    ctx.fillStyle = 'rgba(' + hexToRgb(color) + ', 0.2)';
    ctx.fillRect(x + barPad, barY, barW, 3);
    ctx.fillStyle = color;
    ctx.fillRect(x + barPad, barY, barW * progress, 3);

    // Scanline overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (var sy = y; sy < y + h; sy += 3) {
        ctx.fillRect(x, sy, w, 1);
    }

    // Static noise during early boot (progress < 0.4)
    if (progress < 0.4) {
        var noiseCount = Math.floor(20 * (1 - progress / 0.4));
        for (var n = 0; n < noiseCount; n++) {
            var nx = x + Math.random() * w;
            var ny = y + Math.random() * h;
            var gray = Math.floor(Math.random() * 200);
            var noiseAlpha = 0.03 + Math.random() * 0.05;
            ctx.fillStyle = 'rgba(' + gray + ', ' + gray + ', ' + gray + ', ' + noiseAlpha + ')';
            ctx.fillRect(nx, ny, 2 + Math.random() * 2, 2 + Math.random() * 2);
        }
    }

    ctx.restore(); // end main save
}
