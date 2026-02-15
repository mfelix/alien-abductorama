// ============================================
// EMERGENCY OVERRIDE
// Manual zone takeover — player controls UFO
// for 15 seconds, then zooms back out.
// Once per wave. Director disapproval on use.
// ============================================

const overrideState = {
    active: false,
    zoneIndex: -1,
    zone: null,
    timer: 0,
    zoomProgress: 0,
    phase: 'idle', // 'idle' | 'zoom_in' | 'active' | 'zoom_out'
    directorRef: null,
    _savedCrewAI: null
};

// --------------------------------------------------
// INIT — Start override for a zone
// --------------------------------------------------

function initOverride(zone, director) {
    const CC = COMMAND_CONFIG;

    overrideState.active = true;
    overrideState.zone = zone;
    overrideState.zoneIndex = commandState.zones.indexOf(zone);
    overrideState.timer = CC.OVERRIDE.DURATION;
    overrideState.zoomProgress = 0;
    overrideState.phase = 'zoom_in';
    overrideState.directorRef = director;

    // Suspend crew AI — save reference so we can restore
    overrideState._savedCrewAI = zone.crewAI;
    zone.isOverrideActive = true;
}

// --------------------------------------------------
// UPDATE — Countdown timer, zoom transitions
// --------------------------------------------------

function updateOverride(dt) {
    if (!overrideState.active) return;

    const CC = COMMAND_CONFIG;
    const os = overrideState;
    const zone = os.zone;

    switch (os.phase) {
        case 'zoom_in':
            // Ease-in cubic: accelerating zoom
            os.zoomProgress += dt / CC.OVERRIDE.ZOOM_TRANSITION;
            if (os.zoomProgress >= 1.0) {
                os.zoomProgress = 1.0;
                os.phase = 'active';
            }
            break;

        case 'active':
            // Player controls UFO via global keys[] —
            // zone-simulation.js reads keys[] when zone.isOverrideActive is true,
            // so no direct UFO manipulation needed here.

            // Countdown
            os.timer -= dt;

            // End override on O key press or timer expiry
            if (os.timer <= 0 || _commandKeyPressed('KeyO')) {
                os.timer = Math.max(0, os.timer);
                os.phase = 'zoom_out';
                os.zoomProgress = 0;
            }
            break;

        case 'zoom_out':
            // Ease-out cubic: decelerating zoom
            os.zoomProgress += dt / CC.OVERRIDE.ZOOM_TRANSITION;
            if (os.zoomProgress >= 1.0) {
                os.zoomProgress = 1.0;
                endOverride();
            }
            break;
    }
}

// --------------------------------------------------
// RENDER — Zoom transition overlay
// --------------------------------------------------

function renderOverrideTransition() {
    if (!overrideState.active) return;

    const os = overrideState;
    const CC = COMMAND_CONFIG;

    if (os.phase === 'zoom_in' || os.phase === 'zoom_out') {
        // Dim non-target areas during zoom
        const progress = os.phase === 'zoom_in'
            ? easeInCubic(os.zoomProgress)
            : 1 - easeOutCubic(os.zoomProgress);

        ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.6})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (os.phase === 'zoom_in' && os.zoomProgress < 0.5) {
        // Flash "EMERGENCY OVERRIDE" text
        const alpha = 1 - os.zoomProgress * 2;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#f00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 20;
        ctx.fillText('EMERGENCY OVERRIDE', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }

    if (os.phase === 'active') {
        // Timer display at top center
        const timerText = Math.ceil(os.timer).toString();
        const isWarning = os.timer <= CC.OVERRIDE.WARNING_TIME;

        ctx.save();
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (isWarning) {
            // Pulsing red warning
            const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
            ctx.shadowColor = '#f00';
            ctx.shadowBlur = 15;

            // Warning text
            ctx.font = 'bold 14px monospace';
            ctx.fillText('RETURNING TO COMMAND', canvas.width / 2, 45);
        } else {
            ctx.fillStyle = CC.COLORS.ZONE_OVERRIDE;
            ctx.shadowColor = CC.COLORS.ZONE_OVERRIDE;
            ctx.shadowBlur = 10;
        }

        ctx.font = 'bold 28px monospace';
        ctx.fillText(timerText, canvas.width / 2, 12);
        ctx.restore();

        // Override zone border highlight
        if (os.zone && commandState) {
            const layout = commandState.hudLayout.zones[os.zoneIndex];
            if (layout) {
                ctx.save();
                ctx.strokeStyle = CC.COLORS.ZONE_OVERRIDE;
                ctx.lineWidth = 3;
                ctx.shadowColor = CC.COLORS.ZONE_OVERRIDE;
                ctx.shadowBlur = 12;
                ctx.strokeRect(layout.x - 1, layout.y - 1, layout.w + 2, layout.h + 2);
                ctx.restore();
            }
        }
    }
}

// --------------------------------------------------
// END — Cleanup and restore
// --------------------------------------------------

function endOverride() {
    const os = overrideState;

    if (os.zone) {
        os.zone.isOverrideActive = false;
        os.zone.crewUfo.beamActive = false;

        // Restore crew AI
        if (os._savedCrewAI) {
            os.zone.crewAI = os._savedCrewAI;
        }
    }

    os.active = false;
    os.phase = 'idle';
    os.zone = null;
    os.zoneIndex = -1;
    os._savedCrewAI = null;
    os.directorRef = null;
}

// --------------------------------------------------
// QUERY FUNCTIONS
// --------------------------------------------------

function isOverrideActive() {
    return overrideState.active && overrideState.phase !== 'idle';
}

function getOverrideTimer() {
    return overrideState.timer;
}

// --------------------------------------------------
// EASING FUNCTIONS
// --------------------------------------------------

function easeInCubic(t) {
    return t * t * t;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
