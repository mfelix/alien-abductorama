// ============================================
// PROMOTION CINEMATIC — Phase 1 to Phase 2 Transition
// ============================================
// 10-second cinematic that plays when all 15 techs are completed.
// Four phases: The Call, The Zoom, The Flash, The Settling.
// Renders on top of frozen Phase 1 state.
// No player input accepted during cinematic.

let cinematicState = null;

// Phase durations (from COMMAND_CONFIG.CINEMATIC or defaults)
const CINE_PHASE_A = 3.0;
const CINE_PHASE_B = 3.0;
const CINE_PHASE_C = 2.0;
const CINE_PHASE_D = 2.0;
const CINE_TOTAL = CINE_PHASE_A + CINE_PHASE_B + CINE_PHASE_C + CINE_PHASE_D;

// Promotion text
const CINE_PROMOTION_TEXT = 'Impressive performance, Operator. Your efficiency has not gone unnoticed.';
const CINE_PROMOTED_TITLE = 'YOU ARE HEREBY PROMOTED TO ZONE COMMANDER';
const CINE_COMMAND_ACTIVATED = 'COMMAND MODE ACTIVATED';
const CINE_DIRECTOR_FINAL = 'Do not disappoint me.';

// Easing functions
function _easeInCubic(t) { return t * t * t; }
function _easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function _easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// ============================================
// INITIALIZATION
// ============================================

function initPromotionCinematic() {
    cinematicState = {
        phase: 'A',
        timer: 0,
        phaseTimer: 0,

        // Phase A state
        typewriterProgress: 0,
        directorAlpha: 0,
        commanderGlitchIntensity: 0,
        commanderDissolve: 0,
        incomingTextProgress: 0,

        // Phase B state
        zoomScale: 1.0,
        promotionTextAlpha: 0,
        hudFadeAlpha: 1.0,
        zone2Alpha: 0,

        // Phase C state
        flashAlpha: 0,
        wireframeAlpha: 0,
        bootStarted: false,
        activatedTextAlpha: 0,
        activatedPulseCount: 0,

        // Phase D state
        directorFinalProgress: 0,
        directorPanelSlide: 0,
        settlingComplete: false,

        // Sound trigger flags (prevent re-triggering every frame)
        _snd_incoming: false,
        _snd_glitch: false,
        _snd_dissolve: false,
        _snd_materialize: false,
        _snd_typewriter: false,
        _snd_titleReveal: false,
        _snd_cameraZoom: false,
        _snd_hudDeath: false,
        _snd_zone2: false,
        _snd_whiteFlash: false,
        _snd_wireframe: false,
        _snd_activated: false,
        _snd_finalLine: false,
        _snd_panelSlideIn: false,
        _snd_panelSlideOut: false,
        _snd_commandActivated: false
    };

    // Initialize command phase state (creates commandState)
    if (typeof initCommandPhase === 'function') {
        initCommandPhase();
    }

    // Play deep authority sound
    if (typeof SFX !== 'undefined' && SFX.panelReveal) {
        SFX.panelReveal();
    }
}

// ============================================
// UPDATE
// ============================================

function updatePromotionCinematic(dt) {
    if (!cinematicState) return;
    const cs = cinematicState;

    cs.timer += dt;
    cs.phaseTimer += dt;

    switch (cs.phase) {
        case 'A': _updatePhaseA(cs, dt); break;
        case 'B': _updatePhaseB(cs, dt); break;
        case 'C': _updatePhaseC(cs, dt); break;
        case 'D': _updatePhaseD(cs, dt); break;
    }
}

function _updatePhaseA(cs, dt) {
    const t = cs.phaseTimer;

    // Incoming text decodes at 0.5s
    if (t >= 0.5) {
        cs.incomingTextProgress = Math.min(1, (t - 0.5) / 1.0);
        if (!cs._snd_incoming) {
            cs._snd_incoming = true;
            CommandSFX.play('promoIncoming');
        }
    }

    // Commander glitch starts at 1.0s
    if (t >= 1.0 && t < 1.5) {
        cs.commanderGlitchIntensity = (t - 1.0) / 0.5;
        if (!cs._snd_glitch) {
            cs._snd_glitch = true;
            CommandSFX.play('promoCommanderGlitch');
        }
    }
    // Commander dissolves 1.2-1.5s
    if (t >= 1.2) {
        cs.commanderDissolve = Math.min(1, (t - 1.2) / 0.3);
        if (!cs._snd_dissolve) {
            cs._snd_dissolve = true;
            CommandSFX.play('promoCommanderDissolve');
        }
    }

    // Director materializes 1.5-3.0s
    if (t >= 1.5) {
        cs.directorAlpha = Math.min(1, (t - 1.5) / 1.5);
        if (!cs._snd_materialize) {
            cs._snd_materialize = true;
            CommandSFX.play('promoDirectorMaterialize');
        }
    }

    // Typewriter begins at 2.0s (15 chars/sec)
    if (t >= 2.0) {
        cs.typewriterProgress = Math.min(CINE_PROMOTION_TEXT.length, (t - 2.0) * 15);
        if (!cs._snd_typewriter) {
            cs._snd_typewriter = true;
            CommandSFX.play('promoDirectorTypewriter');
        }
    }

    // Transition to Phase B
    if (cs.phaseTimer >= CINE_PHASE_A) {
        cs.phase = 'B';
        cs.phaseTimer = 0;
    }
}

function _updatePhaseB(cs, dt) {
    const t = cs.phaseTimer;

    // Promotion title text appears at 0s, fades by 1s
    if (t < 1.5) {
        cs.promotionTextAlpha = t < 0.2 ? t / 0.2 : (t < 1.0 ? 1 : Math.max(0, 1 - (t - 1.0) / 0.5));
        if (!cs._snd_titleReveal) {
            cs._snd_titleReveal = true;
            CommandSFX.play('promoTitleReveal');
        }
    } else {
        cs.promotionTextAlpha = 0;
    }

    // Camera pulls back starting at 0.5s (zoom 1.0 -> 0.5 over 2.5s)
    if (t >= 0.5) {
        const zoomProgress = Math.min(1, (t - 0.5) / 2.5);
        cs.zoomScale = 1.0 - _easeInOutCubic(zoomProgress) * 0.5;
        if (!cs._snd_cameraZoom) {
            cs._snd_cameraZoom = true;
            CommandSFX.play('promoCameraZoom');
        }
    }

    // HUD panels fade out 1.0-2.0s
    if (t >= 1.0) {
        cs.hudFadeAlpha = Math.max(0, 1 - (t - 1.0) / 1.0);
        if (!cs._snd_hudDeath) {
            cs._snd_hudDeath = true;
            CommandSFX.play('promoHudDeath');
        }
    }

    // Second zone materializes 2.0-3.0s
    if (t >= 2.0) {
        cs.zone2Alpha = Math.min(1, (t - 2.0) / 1.0);
        if (!cs._snd_zone2) {
            cs._snd_zone2 = true;
            CommandSFX.play('promoZone2Materialize');
        }
    }

    // Transition to Phase C
    if (cs.phaseTimer >= CINE_PHASE_B) {
        cs.phase = 'C';
        cs.phaseTimer = 0;
    }
}

function _updatePhaseC(cs, dt) {
    const t = cs.phaseTimer;

    // White flash 0-0.5s
    if (t < 0.2) {
        cs.flashAlpha = t / 0.2;
        if (!cs._snd_whiteFlash) {
            cs._snd_whiteFlash = true;
            CommandSFX.play('promoWhiteFlash');
        }
    } else if (t < 0.5) {
        cs.flashAlpha = 1 - (t - 0.2) / 0.3;
    } else {
        cs.flashAlpha = 0;
    }

    // Gold wireframe appears 0.2-0.8s
    if (t >= 0.2) {
        cs.wireframeAlpha = Math.min(1, (t - 0.2) / 0.6);
        if (!cs._snd_wireframe) {
            cs._snd_wireframe = true;
            CommandSFX.play('promoWireframe');
        }
    }

    // Boot sequence starts at 0.5s
    if (t >= 0.5 && !cs.bootStarted) {
        cs.bootStarted = true;
        if (typeof initCommandBoot === 'function') {
            initCommandBoot(1); // First command wave
        }
    }

    // Update boot sequence
    if (cs.bootStarted && typeof updateCommandBoot === 'function') {
        updateCommandBoot(dt);
    }

    // "COMMAND MODE ACTIVATED" text at 1.5s with double pulse
    if (t >= 1.5) {
        const textT = t - 1.5;
        const pulseRate = 0.25;
        cs.activatedPulseCount = Math.floor(textT / pulseRate);
        cs.activatedTextAlpha = cs.activatedPulseCount < 4
            ? Math.abs(Math.sin(textT / pulseRate * Math.PI))
            : Math.max(0, 1 - (textT - 1.0) / 0.5);
        if (!cs._snd_commandActivated) {
            cs._snd_commandActivated = true;
            CommandSFX.play('promoCommandActivated');
        }
    }

    // Transition to Phase D
    if (cs.phaseTimer >= CINE_PHASE_C) {
        cs.phase = 'D';
        cs.phaseTimer = 0;
    }
}

function _updatePhaseD(cs, dt) {
    const t = cs.phaseTimer;

    // Continue boot sequence
    if (typeof updateCommandBoot === 'function') {
        updateCommandBoot(dt);
    }

    // Director panel slides in 0.8-1.0s, out at 1.5-1.8s
    if (t >= 0.8 && t < 1.0) {
        cs.directorPanelSlide = (t - 0.8) / 0.2;
        if (!cs._snd_panelSlideIn) {
            cs._snd_panelSlideIn = true;
            CommandSFX.play('promoDirectorPanelSlide');
        }
    } else if (t >= 1.0 && t < 1.5) {
        cs.directorPanelSlide = 1;
    } else if (t >= 1.5 && t < 1.8) {
        cs.directorPanelSlide = 1 - _easeInCubic((t - 1.5) / 0.3);
        if (!cs._snd_panelSlideOut) {
            cs._snd_panelSlideOut = true;
            CommandSFX.play('promoDirectorPanelSlide');
        }
    } else if (t >= 1.8) {
        cs.directorPanelSlide = 0;
    }

    // Director final line at 1.0s
    if (t >= 1.0) {
        cs.directorFinalProgress = Math.min(CINE_DIRECTOR_FINAL.length, (t - 1.0) * 15);
        if (!cs._snd_finalLine) {
            cs._snd_finalLine = true;
            CommandSFX.play('promoDirectorFinalLine');
        }
    }

    // Cinematic complete at 2.0s
    if (cs.phaseTimer >= CINE_PHASE_D) {
        cs.settlingComplete = true;
        // Transition to COMMAND state
        if (typeof gameState !== 'undefined') {
            gameState = 'COMMAND';
        }
        if (commandState) {
            commandState.subState = 'LIVE';
        }
        cinematicState = null;
    }
}

// ============================================
// RENDER
// ============================================

function renderPromotionCinematic() {
    if (!cinematicState) return;
    const cs = cinematicState;
    const cw = canvas.width;
    const ch = canvas.height;

    switch (cs.phase) {
        case 'A': _renderPhaseA(cs, cw, ch); break;
        case 'B': _renderPhaseB(cs, cw, ch); break;
        case 'C': _renderPhaseC(cs, cw, ch); break;
        case 'D': _renderPhaseD(cs, cw, ch); break;
    }
}

// ---- PHASE A: THE CALL ----

function _renderPhaseA(cs, cw, ch) {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, cw, ch);

    // Commander glitch effect
    if (cs.commanderGlitchIntensity > 0 && cs.commanderDissolve < 1) {
        _renderGlitchOverlay(cw, ch, cs.commanderGlitchIntensity);
    }

    // Commander dissolve to static
    if (cs.commanderDissolve > 0) {
        _renderStaticDissolve(cw, ch, cs.commanderDissolve);
    }

    // Incoming transmission panel (appears at 0.5s)
    if (cs.incomingTextProgress > 0) {
        const panelW = 420;
        const panelH = 36;
        const panelX = (cw - panelW) / 2;
        const panelY = ch * 0.15;

        // Flicker effect
        const flicker = Math.sin(Date.now() / 100 * Math.PI) > 0 ? 1.0 : 0.3;
        ctx.globalAlpha = cs.incomingTextProgress < 1 ? flicker : 1;

        renderNGEPanel(panelX, panelY, panelW, panelH, {
            color: '#a00',
            cutCorners: ['tl', 'br'],
            alpha: 0.85,
            label: ''
        });

        renderHexDecodeText('INCOMING -- PRIORITY: SUPREME', cw / 2, panelY + 22,
            14, cs.incomingTextProgress, {
                unresolvedColor: 'rgba(255, 68, 68, 0.6)',
                resolvedColor: '#f44',
                glowColor: '#a00',
                glowBlur: 6
            });
        ctx.globalAlpha = 1;
    }

    // Director materializing
    if (cs.directorAlpha > 0) {
        _renderDirectorMaterialize(cs, cw, ch);
    }

    // Typewriter text
    if (cs.typewriterProgress > 0) {
        const visibleText = CINE_PROMOTION_TEXT.substring(0, Math.floor(cs.typewriterProgress));
        ctx.font = '13px monospace';
        ctx.fillStyle = '#f44';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(visibleText, cw / 2, ch * 0.65);
    }
}

// ---- PHASE B: THE ZOOM ----

function _renderPhaseB(cs, cw, ch) {
    // Apply zoom transformation
    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.scale(cs.zoomScale, cs.zoomScale);
    ctx.translate(-cw / 2, -ch / 2);

    // Phase 1 HUD fading out
    if (cs.hudFadeAlpha < 1 && cs.hudFadeAlpha > 0) {
        // Gray static noise over HUD areas
        ctx.globalAlpha = 1 - cs.hudFadeAlpha;
        _renderHUDDeathNoise(cw, ch);
        ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Promotion title text
    if (cs.promotionTextAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = cs.promotionTextAlpha;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#d4a017';
        ctx.shadowColor = '#d4a017';
        ctx.shadowBlur = 16;
        ctx.fillText(CINE_PROMOTED_TITLE, cw / 2, ch * 0.35);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // Second zone materializing (right half)
    if (cs.zone2Alpha > 0) {
        _renderZone2Materialize(cs, cw, ch);
    }

    // Director persistent (from Phase A)
    ctx.save();
    ctx.globalAlpha = 1;
    _renderCinematicDirector(cw, ch);
    ctx.restore();
}

// ---- PHASE C: THE FLASH ----

function _renderPhaseC(cs, cw, ch) {
    // Clear to black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);

    // Gold wireframe skeleton
    if (cs.wireframeAlpha > 0 && !cs.flashAlpha) {
        _renderWireframeSkeleton(cs, cw, ch);
    }

    // Boot overlays
    if (cs.bootStarted && typeof renderCommandBoot === 'function') {
        renderCommandBoot();
    }

    // "COMMAND MODE ACTIVATED" text
    if (cs.activatedTextAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = cs.activatedTextAlpha;
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#d4a017';
        ctx.shadowColor = '#d4a017';
        ctx.shadowBlur = 20;
        ctx.fillText(CINE_COMMAND_ACTIVATED, cw / 2, ch / 2);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // White flash on top
    if (cs.flashAlpha > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + cs.flashAlpha + ')';
        ctx.fillRect(0, 0, cw, ch);
    }
}

// ---- PHASE D: THE SETTLING ----

function _renderPhaseD(cs, cw, ch) {
    // Clear to black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);

    // Render command HUD (zones are now live)
    if (typeof renderCommand === 'function') {
        renderCommand();
    } else if (commandState) {
        // Fallback: render boot overlays + wireframe
        _renderWireframeSkeleton(cs, cw, ch);
        if (typeof renderCommandBoot === 'function') {
            renderCommandBoot();
        }
    }

    // Director final transmission panel
    if (cs.directorPanelSlide > 0) {
        _renderDirectorFinalPanel(cs, cw, ch);
    }
}

// ============================================
// VISUAL EFFECT HELPERS
// ============================================

function _renderGlitchOverlay(cw, ch, intensity) {
    // Horizontal tear lines
    const tearCount = Math.floor(intensity * 6);
    for (let i = 0; i < tearCount; i++) {
        const y = Math.random() * ch;
        const h = 2 + Math.random() * 4;
        const shift = (Math.random() - 0.5) * 20 * intensity;
        ctx.fillStyle = 'rgba(0, 255, 0, ' + (0.1 + Math.random() * 0.15) + ')';
        ctx.fillRect(shift, y, cw, h);
    }
}

function _renderStaticDissolve(cw, ch, progress) {
    // Green noise static spreading from center
    const count = Math.floor(progress * 200);
    const radius = progress * Math.max(cw, ch) * 0.5;
    ctx.save();
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const x = cw / 2 + Math.cos(angle) * dist;
        const y = ch / 2 + Math.sin(angle) * dist;
        ctx.fillStyle = 'rgba(0, ' + (150 + Math.floor(Math.random() * 105)) + ', 0, ' + (0.3 + Math.random() * 0.4) + ')';
        ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 2);
    }
    ctx.restore();
}

function _renderDirectorMaterialize(cs, cw, ch) {
    const portraitSize = 80;
    const px = cw / 2 - portraitSize / 2;
    const py = ch * 0.35 - portraitSize / 2;

    ctx.save();
    // Clip to reveal line-by-line from top
    const revealH = cs.directorAlpha * portraitSize;
    ctx.beginPath();
    ctx.rect(px, py, portraitSize, revealH);
    ctx.clip();

    // Red static behind portrait during materialization
    if (cs.directorAlpha < 1) {
        const noiseCount = Math.floor((1 - cs.directorAlpha) * 30);
        for (let i = 0; i < noiseCount; i++) {
            ctx.fillStyle = 'rgba(170, 0, 0, ' + (Math.random() * 0.3) + ')';
            ctx.fillRect(
                px + Math.random() * portraitSize,
                py + Math.random() * revealH,
                1 + Math.random() * 3, 1 + Math.random() * 2
            );
        }
    }

    // Render Director portrait
    if (typeof renderDirectorPortrait === 'function') {
        renderDirectorPortrait(px, py, portraitSize, 'neutral');
    } else {
        // Fallback — simple gray-blue rectangle
        ctx.fillStyle = '#2a3a4a';
        ctx.fillRect(px + 10, py + 10, portraitSize - 20, portraitSize - 20);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(px + portraitSize * 0.35, py + portraitSize * 0.45, 8, 4, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + portraitSize * 0.65, py + portraitSize * 0.45, 8, 4, -1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function _renderCinematicDirector(cw, ch) {
    // Small director portrait in corner during Phase B
    const size = 48;
    const px = cw - size - 16;
    const py = ch - size - 60;

    if (typeof renderDirectorPortrait === 'function') {
        renderDirectorPortrait(px, py, size, 'neutral');
    }
}

function _renderHUDDeathNoise(cw, ch) {
    // Static noise in HUD panel areas
    const panels = [
        { x: 8, y: 8, w: cw - 16, h: 32 },          // top bar area
        { x: 8, y: ch - 130, w: cw * 0.3, h: 120 },  // left sidebar
        { x: cw * 0.35, y: ch - 130, w: cw * 0.3, h: 120 }, // center
        { x: cw * 0.7, y: ch - 130, w: cw * 0.25, h: 120 }  // right
    ];

    for (const p of panels) {
        // Gray out panel
        ctx.fillStyle = 'rgba(40, 40, 40, 0.6)';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // Static noise dots
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = 'rgba(80, 80, 80, ' + (Math.random() * 0.4) + ')';
            ctx.fillRect(
                p.x + Math.random() * p.w,
                p.y + Math.random() * p.h,
                1 + Math.random() * 3, 1
            );
        }
    }
}

function _renderZone2Materialize(cs, cw, ch) {
    // Second zone appears as gold wireframe on right side
    const layout = commandState ? commandState.hudLayout : null;
    const zoneRect = layout && layout.zones && layout.zones[1]
        ? layout.zones[1]
        : { x: cw / 2 + 8, y: 48, w: cw / 2 - 16, h: ch * 0.55 };

    ctx.save();
    ctx.globalAlpha = cs.zone2Alpha;

    // Bayer dither noise during early materialization
    if (cs.zone2Alpha < 0.7) {
        const noiseCount = Math.floor(cs.zone2Alpha * 60);
        for (let i = 0; i < noiseCount; i++) {
            const nx = zoneRect.x + Math.random() * zoneRect.w;
            const ny = zoneRect.y + Math.random() * zoneRect.h;
            ctx.fillStyle = 'rgba(212, 160, 23, ' + (Math.random() * 0.3) + ')';
            ctx.fillRect(nx, ny, 2, 2);
        }
    }

    // Gold wireframe border
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(zoneRect.x, zoneRect.y, zoneRect.w, zoneRect.h);

    // Zone label
    if (cs.zone2Alpha > 0.5) {
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#d4a017';
        ctx.textAlign = 'left';
        ctx.fillText('SECTOR B-3', zoneRect.x + 6, zoneRect.y + 14);
    }

    ctx.restore();
}

function _renderWireframeSkeleton(cs, cw, ch) {
    const alpha = cs.wireframeAlpha || 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 1;

    const layout = commandState ? commandState.hudLayout : null;
    if (layout) {
        // Draw all panel outlines in gold
        const panels = [
            layout.cmdStatus,
            layout.zones[0], layout.zones[1],
            layout.crewRoster, layout.resources, layout.orders,
            layout.dirChannel
        ];
        for (const p of panels) {
            if (p) ctx.strokeRect(p.x, p.y, p.w, p.h);
        }
    } else {
        // Fallback grid
        ctx.strokeRect(8, 8, cw - 16, 32);
        ctx.strokeRect(8, 48, cw / 2 - 12, ch * 0.55);
        ctx.strokeRect(cw / 2 + 4, 48, cw / 2 - 12, ch * 0.55);
        ctx.strokeRect(8, ch - 72, cw - 16, 64);
    }

    ctx.restore();
}

function _renderDirectorFinalPanel(cs, cw, ch) {
    const slideY = (1 - cs.directorPanelSlide) * 80;
    const panelW = 500;
    const panelH = 50;
    const panelX = (cw - panelW) / 2;
    const panelY = ch - panelH - 16 + slideY;

    ctx.save();
    ctx.globalAlpha = cs.directorPanelSlide;

    renderNGEPanel(panelX, panelY, panelW, panelH, {
        color: '#c22',
        cutCorners: ['br'],
        alpha: 0.85,
        label: 'DIR.CHANNEL'
    });

    // Director portrait (small)
    const portraitSize = 36;
    if (typeof renderDirectorPortrait === 'function') {
        renderDirectorPortrait(panelX + 8, panelY + 7, portraitSize, 'neutral');
    }

    // Final line typewriter
    if (cs.directorFinalProgress > 0) {
        const visibleText = CINE_DIRECTOR_FINAL.substring(0, Math.floor(cs.directorFinalProgress));
        ctx.font = '13px monospace';
        ctx.fillStyle = '#f44';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(visibleText, panelX + portraitSize + 20, panelY + panelH / 2);
    }

    ctx.restore();
}
