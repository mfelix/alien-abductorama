// ============================================
// DIRECTOR RENDERER — The Director's Visual Presence
// Terrifying through stillness. Cold authority.
// Agent 3 (Rendering & HUD) owns this file.
// Uses global ctx/canvas from game.js (consistent with all renderers).
// ============================================

// ============================================
// DIRECTOR PORTRAIT
// ============================================

function renderDirectorPortrait(x, y, size, mood) {
    var s = size;
    var cx = x + s / 2;
    var cy = y + s / 2;
    var now = Date.now();

    ctx.save();

    // Clip to portrait bounds
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, s, s, 4); } else { ctx.rect(x, y, s, s); }
    ctx.clip();

    // Background: crimson void
    ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_BG;
    ctx.fillRect(x, y, s, s);

    // Slow scanlines (4px spacing, Director red)
    ctx.fillStyle = 'rgba(170, 0, 0, 0.04)';
    var scanOffset = (now * 0.01) % 4;
    for (var i = -4; i < s; i += 4) {
        ctx.fillRect(x, y + i + scanOffset, s, 1);
    }

    // Horizontal tear interference (8% chance per frame)
    if (Math.random() < 0.08) {
        var tearY = y + Math.random() * s;
        var tearH = 2 + Math.random() * 4;
        ctx.fillStyle = 'rgba(170, 0, 0, 0.3)';
        ctx.fillRect(x, tearY, s, tearH);
        ctx.fillStyle = 'rgba(0, 0, 170, 0.15)';
        ctx.fillRect(x + 3, tearY + 1, s, tearH - 1);
    }

    var headCY = cy - s * 0.02;

    // Cranium (angular ellipse, gray-blue)
    ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_SKIN;
    ctx.beginPath();
    ctx.ellipse(cx, headCY - s * 0.08, s * 0.30, s * 0.34, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Cranial ridges (3 arced lines across forehead)
    ctx.strokeStyle = 'rgba(60, 80, 100, 0.4)';
    ctx.lineWidth = 1;
    for (var r = 0; r < 3; r++) {
        var ridgeY = headCY - s * (0.25 - r * 0.06);
        ctx.beginPath();
        ctx.ellipse(cx, ridgeY, s * (0.25 - r * 0.03), s * 0.02, 0, 0, Math.PI);
        ctx.stroke();
    }

    // Lower face (sharp jaw, pointed chin)
    ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_SKIN;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.30, headCY - s * 0.08);
    ctx.lineTo(cx - s * 0.15, headCY + s * 0.20);
    ctx.lineTo(cx, headCY + s * 0.26);
    ctx.lineTo(cx + s * 0.15, headCY + s * 0.20);
    ctx.lineTo(cx + s * 0.30, headCY - s * 0.08);
    ctx.fill();

    // Eyes
    var eyeY = headCY + s * 0.01;
    var eyeSpacing = s * 0.13;
    var eyeW = s * 0.18;
    var eyeH = s * 0.06;
    var eyeSlant = 1.2;

    // Blink system: every BLINK_INTERVAL ms, eyes close to slits for BLINK_DURATION ms
    var blinkInterval = COMMAND_CONFIG.DIRECTOR.BLINK_INTERVAL;
    var blinkDuration = COMMAND_CONFIG.DIRECTOR.BLINK_DURATION;
    var blinkCycle = now % blinkInterval;
    var isBlinking = blinkCycle > blinkInterval - blinkDuration;
    if (isBlinking) {
        eyeH *= 0.2;
    }

    // Eye sockets (dark recesses)
    ctx.fillStyle = 'rgba(10, 15, 25, 0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.3, eyeH * 2, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.3, eyeH * 2, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Mood-based eye glow
    var eyeGlowColor;
    switch (mood) {
        case 'furious':    eyeGlowColor = 'rgba(255, 0, 0, 0.5)'; break;
        case 'displeased': eyeGlowColor = 'rgba(255, 80, 0, 0.3)'; break;
        case 'satisfied':  eyeGlowColor = 'rgba(170, 120, 0, 0.25)'; break;
        default:           eyeGlowColor = 'rgba(100, 120, 160, 0.2)'; break;
    }

    // Furious: pulsing eye glow
    if (mood === 'furious') {
        var furPulse = Math.sin(now / 300) * 0.15 + 0.5;
        eyeGlowColor = 'rgba(255, 0, 0, ' + furPulse + ')';
    }

    ctx.fillStyle = eyeGlowColor;
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.1, eyeH * 1.5, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.1, eyeH * 1.5, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Void-black eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Cold blue-white reflections (NOT green-white like crew)
    if (!isBlinking) {
        ctx.fillStyle = 'rgba(180, 200, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx - eyeSpacing - eyeW * 0.2, eyeY - eyeH * 0.2,
                    s * 0.025, s * 0.015, eyeSlant, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + eyeSpacing + eyeW * 0.2, eyeY - eyeH * 0.2,
                    s * 0.025, s * 0.015, -eyeSlant, 0, Math.PI * 2);
        ctx.fill();
    }

    // Nostril slits (angled lines, not dots)
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

    // Mouth line (visible only when displeased or furious)
    if (mood === 'furious' || mood === 'displeased') {
        ctx.strokeStyle = 'rgba(20, 30, 45, 0.6)';
        ctx.lineWidth = 1;
        var mouthY = headCY + s * 0.18;
        var mouthDroop = mood === 'furious' ? s * 0.02 : s * 0.01;
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.06, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + mouthDroop, cx + s * 0.06, mouthY);
        ctx.stroke();
    }

    // Military collar (two parallel lines + insignia dot)
    ctx.strokeStyle = '#3a4a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, headCY + s * 0.28);
    ctx.lineTo(cx + s * 0.12, headCY + s * 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.10, headCY + s * 0.32);
    ctx.lineTo(cx + s * 0.10, headCY + s * 0.32);
    ctx.stroke();

    // Insignia dot (Director red)
    ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_PRIMARY;
    ctx.beginPath();
    ctx.arc(cx, headCY + s * 0.30, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Border (mood-colored from Director red family)
    var borderColor;
    switch (mood) {
        case 'furious':    borderColor = '#f00'; break;
        case 'displeased': borderColor = COMMAND_CONFIG.COLORS.DIRECTOR_BORDER; break;
        case 'satisfied':  borderColor = COMMAND_CONFIG.COLORS.DIRECTOR_SATISFIED; break;
        default:           borderColor = COMMAND_CONFIG.COLORS.DIRECTOR_PRIMARY; break;
    }

    // Furious: border pulses
    if (mood === 'furious') {
        var borderAlpha = Math.sin(now / 200) * 0.3 + 0.7;
        ctx.globalAlpha = borderAlpha;
    }

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, s, s, 4); } else { ctx.rect(x, y, s, s); }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
}

// ============================================
// DIRECTOR TRANSMISSION PANEL
// ============================================

function renderDirectorTransmission(layout, director) {
    if (!director) return;

    var x = layout.x, y = layout.y, w = layout.w, h = layout.h;
    var now = Date.now();
    var mood = director.mood || (director.getMood ? director.getMood() : 'neutral');
    var colors = COMMAND_CONFIG.COLORS;

    // Panel frame
    renderNGEPanel(x, y, w, h, {
        color: colors.DIRECTOR_BORDER,
        cutCorners: ['br'],
        alpha: 0.85,
        label: 'DIR.CHANNEL'
    });

    // Inner padding
    var pad = 6;
    var innerX = x + pad;
    var innerY = y + pad;
    var innerW = w - pad * 2;
    var innerH = h - pad * 2;

    // Portrait area (left)
    var portraitSize = Math.min(innerH, Math.floor(innerW * 0.25));
    var portraitX = innerX;
    var portraitY = innerY + (innerH - portraitSize) / 2;

    renderDirectorPortrait(portraitX, portraitY, portraitSize, mood);

    // Text area (right)
    var textX = portraitX + portraitSize + pad * 2;
    var textY = innerY;
    var textW = innerW - portraitSize - pad * 2;

    if (director.isTransmitting && director.currentDialogue) {
        // Transmission indicator: pulsing signal bars
        var signalAlpha = Math.sin(now / 400) * 0.3 + 0.7;
        ctx.fillStyle = 'rgba(255, 68, 68, ' + signalAlpha + ')';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('RECEIVING', textX + textW - 58, textY + 8);

        // Signal bars
        for (var i = 0; i < 3; i++) {
            var barH = 3 + i * 2;
            var barAlpha = (i < Math.floor((now / 300) % 4)) ? signalAlpha : 0.2;
            ctx.fillStyle = 'rgba(255, 68, 68, ' + barAlpha + ')';
            ctx.fillRect(textX + textW - 14 + i * 4, textY + 8 - barH, 2, barH);
        }

        // Typewriter text
        var visibleText;
        if (director.getVisibleDialogue) {
            visibleText = director.getVisibleDialogue();
        } else {
            var charsVisible = Math.floor(director.dialogueProgress || 0);
            visibleText = director.currentDialogue.substring(0, charsVisible);
        }

        ctx.fillStyle = colors.DIRECTOR_SPEECH;
        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        _drawDirectorWrappedText(visibleText, textX, textY + 18, textW, 15);

    } else {
        // Idle state
        ctx.fillStyle = 'rgba(170, 0, 0, 0.3)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CHANNEL IDLE', textX + textW / 2, innerY + innerH / 2);
        ctx.textAlign = 'left';
    }

    // Static/noise at panel edges
    _renderDirectorTransmissionNoise(x, y, w, h, director.isTransmitting);
}

// ============================================
// DIRECTOR SCREEN EFFECT
// Red overlay on entire canvas when Director transmits.
// Heartbeat pulse creates subliminal dread.
// ============================================

function renderDirectorScreenEffect(active, intensity) {
    if (!active) return;

    var now = Date.now();
    intensity = intensity || 1.0;

    // Heartbeat pulse: 800ms cycle
    var pulse = Math.sin(now / 800 * Math.PI) * 0.025 + 0.045;
    pulse *= intensity;
    pulse = Math.max(0.03, Math.min(0.08, pulse));

    ctx.fillStyle = 'rgba(170, 0, 0, ' + pulse + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ============================================
// REPORT CARD PANEL
// ============================================

var reportCardState = {
    active: false,
    elapsed: 0,
    reportCard: null,
    selectedOption: -1,
    phase: 'reveal',
    responseShown: false,
    directorReply: '',
    directorReplyProgress: 0
};

function renderReportCardPanel(reportCard, selectedOption) {
    if (!reportCard) return;

    var cw = canvas.width;
    var ch = canvas.height;
    var elapsed = reportCardState.elapsed;

    // Full screen dim
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, cw, ch);

    // Panel dimensions
    var pw = Math.min(cw - 40, 700);
    var ph = Math.min(ch - 40, 440);
    var px = (cw - pw) / 2;
    var py = (ch - ph) / 2;

    // Panel frame
    renderNGEPanel(px, py, pw, ph, {
        color: COMMAND_CONFIG.COLORS.DIRECTOR_PRIMARY,
        cutCorners: ['tl', 'br'],
        alpha: 0.9,
        label: 'PERFORMANCE REVIEW'
    });

    // Header (hex decode at 0.3s)
    if (elapsed >= 0.3) {
        var headerProgress = Math.min(1, (elapsed - 0.3) / 1.0);
        var headerText = '\u25C8 PERFORMANCE REVIEW \u2014 WAVE ' + (reportCard.commandWave || '?');
        renderHexDecodeText(headerText, px + pw / 2, py + 22, 14, headerProgress, {
            resolvedColor: COMMAND_CONFIG.COLORS.DIRECTOR_PRIMARY,
            unresolvedColor: 'rgba(170, 0, 0, 0.4)',
            glowColor: '#f44',
            glowBlur: 6
        });
    }

    // Separator
    ctx.strokeStyle = 'rgba(170, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 34);
    ctx.lineTo(px + pw - 10, py + 34);
    ctx.stroke();

    // Director portrait + dialogue (fade in at 0.5s)
    if (elapsed >= 0.5) {
        var portraitAlpha = Math.min(1, (elapsed - 0.5) / 0.5);
        ctx.save();
        ctx.globalAlpha = portraitAlpha;
        var portraitSize = 56;
        var mood = reportCard.mood || 'neutral';
        renderDirectorPortrait(px + 12, py + 42, portraitSize, mood);
        ctx.restore();

        // Dialogue typewriter (starts at 0.8s, 15 chars/sec)
        if (elapsed >= 0.8 && reportCard.dialogue) {
            var dialogueElapsed = elapsed - 0.8;
            var charsVisible = Math.min(
                reportCard.dialogue.length,
                Math.floor(dialogueElapsed * COMMAND_CONFIG.DIRECTOR.TYPEWRITER_SPEED)
            );
            var visibleDialogue = reportCard.dialogue.substring(0, charsVisible);

            ctx.font = '13px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_SPEECH;
            _drawDirectorWrappedText(visibleDialogue, px + 78, py + 58, pw - 98, 16);
        }
    }

    // Zone results (start at 2.0s, 500ms stagger per zone)
    var zoneResults = reportCard.zoneResults || [];
    var zoneStartTime = 2.0;
    var zoneBarY = py + 120;

    for (var zi = 0; zi < zoneResults.length; zi++) {
        var zr = zoneResults[zi];
        var zoneElapsed = elapsed - (zoneStartTime + zi * 0.5);
        if (zoneElapsed < 0) continue;

        var zy = zoneBarY + zi * 30;
        var barProgress = Math.min(1, zoneElapsed / 0.5);
        var fillPct = (zr.quotaPercent / 100) * barProgress;
        var met = zr.quotaMet;
        var barColor = met ? '#0f0' : '#f44';

        // Zone label
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#888';
        var zoneSuffix = zr.zoneId.replace('zone-', '').toUpperCase();
        var zoneLabel = 'ZONE ' + (zoneSuffix === 'A' || zoneSuffix === 'B' ? zoneSuffix : String.fromCharCode(65 + (parseInt(zoneSuffix, 10) || 0)));
        ctx.fillText(zoneLabel, px + 16, zy + 12);

        // Quota bar
        renderNGEBar(px + 80, zy + 2, Math.min(pw - 220, 300), 14, Math.min(1, fillPct), barColor, { solid: true });

        // Percentage
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = barColor;
        ctx.fillText(Math.floor(zr.quotaPercent * barProgress) + '%', px + pw - 130, zy + 12);

        // Met/Missed tag
        if (barProgress >= 1) {
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = met ? '#0f0' : '#f44';
            ctx.fillText(met ? '[MET]' : '[MISSED]', px + pw - 80, zy + 12);
        }
    }

    // Overall bar (at 3.0s)
    if (elapsed >= 3.0) {
        var overallY = zoneBarY + zoneResults.length * 30 + 10;

        ctx.strokeStyle = 'rgba(170, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(px + 10, overallY - 4);
        ctx.lineTo(px + pw - 10, overallY - 4);
        ctx.stroke();

        var overallProgress = Math.min(1, (elapsed - 3.0) / 0.5);
        var overallPct = (reportCard.overallPercent || 0) / 100;

        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#888';
        ctx.fillText('OVERALL QUOTA:', px + 16, overallY + 14);

        var overallColor = overallPct >= 0.8 ? '#0f0' : overallPct >= 0.5 ? '#fc0' : '#f44';
        renderNGEBar(px + 140, overallY + 4, Math.min(pw - 260, 250), 16, overallPct * overallProgress, overallColor, { solid: true });

        ctx.fillStyle = overallColor;
        ctx.fillText(Math.floor((reportCard.overallPercent || 0) * overallProgress) + '%', px + pw - 110, overallY + 14);

        // Director mood display
        var moodY = overallY + 26;
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('DIRECTOR MOOD:', px + 16, moodY);

        var moodLabel = (reportCard.mood || 'neutral').toUpperCase();
        var moodColor = reportCard.mood === 'furious' ? '#f00' :
                       reportCard.mood === 'displeased' ? '#c22' :
                       reportCard.mood === 'satisfied' ? '#a80' : '#a00';
        ctx.fillStyle = moodColor;
        ctx.fillText('\u25B8 ' + moodLabel, px + 140, moodY);
    }

    // Response options (at 3.5s)
    if (elapsed >= 3.5 && reportCard.options) {
        var optionsY = zoneBarY + zoneResults.length * 30 + 70;

        ctx.strokeStyle = 'rgba(170, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(px + 10, optionsY - 8);
        ctx.lineTo(px + pw - 10, optionsY - 8);
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'left';
        ctx.fillText('\u2500\u2500 RESPOND \u2500\u2500', px + 16, optionsY);

        var optAlpha = Math.min(1, (elapsed - 3.5) / 0.5);
        ctx.save();
        ctx.globalAlpha = optAlpha;

        for (var oi = 0; oi < reportCard.options.length; oi++) {
            var opt = reportCard.options[oi];
            var oy = optionsY + 14 + oi * 20;
            var isSelected = selectedOption === oi;

            renderNGEKeyBadge(px + 16, oy - 6, String(oi + 1));

            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            var optText = (opt.label || '').substring(0, 50);
            ctx.fillText(optText, px + 42, oy + 6);

            if (isSelected) {
                ctx.strokeStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(px + 42, oy + 9);
                ctx.lineTo(px + 42 + ctx.measureText(optText).width, oy + 9);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Director reply after selection
    if (reportCardState.phase === 'response' && reportCardState.directorReply) {
        var replyY = zoneBarY + zoneResults.length * 30 + 140;
        var replyChars = Math.floor(reportCardState.directorReplyProgress);
        var replyText = reportCardState.directorReply.substring(0, replyChars);

        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = COMMAND_CONFIG.COLORS.DIRECTOR_SPEECH;
        ctx.fillText('"' + replyText + '"', px + 16, replyY);
    }

    // Continue prompt
    if (reportCardState.phase === 'done' || reportCardState.phase === 'response') {
        var promptAlpha = Math.sin(Date.now() / 500) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = promptAlpha;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
        ctx.fillText('PRESS ENTER TO CONTINUE', px + pw / 2, py + ph - 16);
        ctx.restore();
    }
}

// ============================================
// HELPER: Word-wrapped text drawing
// ============================================

function _drawDirectorWrappedText(text, x, y, maxWidth, lineHeight) {
    if (!text) return;

    var words = text.split(' ');
    var line = '';
    var lineY = y;

    for (var i = 0; i < words.length; i++) {
        var testLine = line + (line ? ' ' : '') + words[i];
        var metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line) {
            ctx.fillText(line, x, lineY);
            line = words[i];
            lineY += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) {
        ctx.fillText(line, x, lineY);
    }
}

// ============================================
// HELPER: Transmission static/noise at panel edges
// ============================================

function _renderDirectorTransmissionNoise(x, y, w, h, active) {
    var count = active ? 12 : 4;
    var alpha = active ? 0.08 : 0.03;

    for (var i = 0; i < count; i++) {
        var noiseX, noiseY;
        if (Math.random() < 0.5) {
            noiseX = x + Math.random() * w;
            noiseY = Math.random() < 0.5 ? y + Math.random() * 4 : y + h - Math.random() * 4;
        } else {
            noiseX = Math.random() < 0.5 ? x + Math.random() * 4 : x + w - Math.random() * 4;
            noiseY = y + Math.random() * h;
        }

        ctx.fillStyle = 'rgba(255, 68, 68, ' + (Math.random() * alpha) + ')';
        ctx.fillRect(noiseX, noiseY, 1 + Math.random() * 3, 1);
    }
}
