// ============================================
// CREW RENDERER — Alien Crew Portraits & Glyphs
// Three scale modes: glyph (24-32px), portrait (48-64px), full (80+px)
// ============================================

// ============================================
// SKIN COLOR MAPPING
// ============================================

function getTraitSkinColor(reckless) {
    if (reckless > 0.7) return '#1a8040';  // warm green (reckless)
    if (reckless > 0.5) return '#0a7040';  // standard alien green
    if (reckless > 0.3) return '#0a6050';  // blue-green
    return '#0a5060';                       // cool teal (cautious)
}

// ============================================
// MORALE COLOR SPECTRUM
// ============================================

function getMoraleColor(morale) {
    if (morale > 0.8) return '#4cff4c';  // Thriving
    if (morale > 0.6) return '#0c8';     // Content
    if (morale > 0.4) return '#0aa';     // Neutral
    if (morale > 0.2) return '#da0';     // Stressed
    return '#f22';                        // Breaking
}

// ============================================
// GLYPH MODE (24-32px) — Zone corner silhouettes
// ============================================

function renderCrewGlyph(x, y, size, crew) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s / 2;
    const reckless = crew.traits ? crew.traits.reckless : 0.5;

    // Morale dot (below silhouette)
    const moraleColor = getMoraleColor(crew.morale || 0.5);
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

// ============================================
// PORTRAIT MODE (48-64px) — Crew roster panel
// ============================================

function renderCrewPortrait(x, y, size, crew) {
    const s = size;
    const cx = x + s / 2;
    const cy = y + s * 0.4;
    const reckless = crew.traits ? crew.traits.reckless : 0.5;

    // Morale aura (soft radial glow behind head)
    const moraleColor = getMoraleColor(crew.morale || 0.5);
    const auraPulse = (crew.morale || 0.5) < 0.3
        ? Math.sin(Date.now() / 150) * 0.3 + 0.4
        : 0.3 + (crew.morale || 0.5) * 0.3;

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
        ctx.fill();
    } else if (reckless < 0.4) {
        // Rounded cranium
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 0.05, s * 0.22, s * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Classic oval
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 0.04, s * 0.18, s * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
    }

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

// ============================================
// FULL MODE (80+px) — Detailed with animations
// ============================================

function renderCrewFull(x, y, size, crew) {
    // Render portrait base
    renderCrewPortrait(x, y, size, crew);

    const s = size;
    const cx = x + s / 2;
    const cy = y + s * 0.4;

    // Breathing animation (subtle scale pulse)
    const breathe = Math.sin(Date.now() / 1500) * 0.005;
    // Applied as slight vertical shift on features above

    // Stress particles (low morale)
    if ((crew.morale || 0.5) < 0.3) {
        for (let i = 0; i < 3; i++) {
            const px = cx + (Math.random() - 0.5) * s * 0.6;
            const py = cy + (Math.random() - 0.5) * s * 0.5;
            const pa = Math.random() * 0.3;
            ctx.fillStyle = `rgba(255, 100, 100, ${pa})`;
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Burnout noise overlay (low stamina)
    if ((crew.stamina || 1) < 0.3) {
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = `rgba(128, 128, 128, ${Math.random() * 0.1})`;
            ctx.fillRect(
                x + Math.random() * s,
                y + Math.random() * s,
                1 + Math.random() * 3,
                1
            );
        }
    }

    // Neck and shoulders hint (only at full size)
    ctx.strokeStyle = getTraitSkinColor(crew.traits ? crew.traits.reckless : 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.15, cy + s * 0.32);
    ctx.lineTo(cx - s * 0.25, cy + s * 0.45);
    ctx.moveTo(cx + s * 0.15, cy + s * 0.32);
    ctx.lineTo(cx + s * 0.25, cy + s * 0.45);
    ctx.stroke();
}

// ============================================
// EYE EXPRESSION SYSTEM
// ============================================

function renderCrewEyes(cx, cy, s, crew) {
    const eyeY = cy;
    const eyeSpacing = s * 0.09;
    let eyeW = s * 0.07;
    let eyeH = s * 0.035;
    let eyeSlant = 0.8;

    // Expression modifiers based on morale
    const morale = crew.morale || 0.5;
    if (morale > 0.8) {
        eyeH *= 1.2;
        eyeSlant = 0.6;
    } else if (morale < 0.2) {
        eyeH *= 0.6;
        eyeSlant = 1.2;
    }

    // Stress jitter
    const stress = crew.stress || (1 - morale);
    if (stress > 0.8) {
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

    // Glassy reflection (green-white)
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
