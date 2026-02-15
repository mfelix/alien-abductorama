// ============================================
// COMMAND SUMMARY — Between-Wave Report Card
// Two phases: report card (mandatory) + crew management (optional)
// ============================================

// Summary state
var commandSummaryState = {
    active: false,
    elapsed: 0,
    phase: 'report',        // 'report' | 'crew_swap' | 'done'
    reportCard: null,
    selectedOption: -1,
    optionsAvailable: false,
    responseChosen: false,
    directorReply: '',
    directorReplyElapsed: 0,
    crewSwapHighlight: 0,   // Index for crew swap selection
    readyToContinue: false,
    waveData: null
};

// ============================================
// INIT
// ============================================

function startCommandSummary(waveData) {
    commandSummaryState.active = true;
    commandSummaryState.elapsed = 0;
    commandSummaryState.phase = 'report';
    commandSummaryState.reportCard = waveData.reportCard || null;
    commandSummaryState.selectedOption = -1;
    commandSummaryState.optionsAvailable = false;
    commandSummaryState.responseChosen = false;
    commandSummaryState.directorReply = '';
    commandSummaryState.directorReplyElapsed = 0;
    commandSummaryState.crewSwapHighlight = 0;
    commandSummaryState.readyToContinue = false;
    commandSummaryState.waveData = waveData;
    commandSummaryState._snd_screenOpen = false;
    commandSummaryState._snd_reportCard = false;
    commandSummaryState._snd_gradeS = false;
    commandSummaryState._snd_complete = false;

    CommandSFX.play('summaryScreenOpen');

    // Also set reportCardState for the renderer
    reportCardState.active = true;
    reportCardState.elapsed = 0;
    reportCardState.reportCard = waveData.reportCard || null;
    reportCardState.selectedOption = -1;
    reportCardState.phase = 'reveal';
    reportCardState.directorReply = '';
    reportCardState.directorReplyProgress = 0;
}

// ============================================
// UPDATE
// ============================================

function updateCommandSummary(dt) {
    if (!commandSummaryState.active) return;

    commandSummaryState.elapsed += dt;
    reportCardState.elapsed = commandSummaryState.elapsed;

    var state = commandSummaryState;

    if (state.phase === 'report') {
        // Report card reveal sound at 1.5s
        if (state.elapsed >= 1.5 && !state._snd_reportCard) {
            state._snd_reportCard = true;
            CommandSFX.play('summaryReportCard');
            // Check for S-grade
            if (state.reportCard && state.reportCard.grade === 'S') {
                state._snd_gradeS = true;
                CommandSFX.play('summaryGradeS');
            }
        }

        // Options become available at 3.5s + fade time
        if (state.elapsed >= 4.0 && !state.optionsAvailable) {
            state.optionsAvailable = true;
        }

        // Handle input for option selection
        if (state.optionsAvailable && !state.responseChosen) {
            if (typeof keys !== 'undefined') {
                if (keys['1'] || keys['Digit1']) {
                    selectSummaryOption(0);
                } else if (keys['2'] || keys['Digit2']) {
                    selectSummaryOption(1);
                } else if (keys['3'] || keys['Digit3']) {
                    selectSummaryOption(2);
                }
            }
        }

        // Advance Director reply typewriter
        if (state.responseChosen && state.directorReply) {
            state.directorReplyElapsed += dt;
            var charsToShow = state.directorReplyElapsed * COMMAND_CONFIG.DIRECTOR.TYPEWRITER_SPEED;
            reportCardState.directorReplyProgress = charsToShow;

            // After reply finishes, allow continue
            if (charsToShow >= state.directorReply.length && !state.readyToContinue) {
                state.readyToContinue = true;
                reportCardState.phase = 'done';
            }
        }

        // Handle continue/crew swap transition
        if (state.readyToContinue && typeof keys !== 'undefined') {
            if (keys['Enter'] || keys[' ']) {
                // Transition to crew swap phase
                state.phase = 'crew_swap';
                state.elapsed = 0;
                // Debounce: clear key
                if (keys['Enter']) keys['Enter'] = false;
                if (keys[' ']) keys[' '] = false;
            }
        }

    } else if (state.phase === 'crew_swap') {
        // Handle crew swap input
        if (typeof keys !== 'undefined') {
            // S key to swap crew assignments
            if (keys['s'] || keys['S'] || keys['KeyS']) {
                performCrewSwap();
                keys['s'] = false;
                keys['S'] = false;
                keys['KeyS'] = false;
            }

            // Enter/Space to proceed to next wave
            if (keys['Enter'] || keys[' ']) {
                state.phase = 'done';
                state.active = false;
                CommandSFX.play('summaryComplete');
                keys['Enter'] = false;
                keys[' '] = false;

                // Signal to command-main that summary is complete
                if (typeof startNextCommandWave === 'function') {
                    startNextCommandWave();
                }
            }
        }

    } else if (state.phase === 'done') {
        state.active = false;
    }
}

// ============================================
// OPTION SELECTION
// ============================================

function selectSummaryOption(index) {
    var state = commandSummaryState;
    var reportCard = state.reportCard;

    if (!reportCard || !reportCard.options || index >= reportCard.options.length) return;
    if (state.responseChosen) return;

    state.selectedOption = index;
    state.responseChosen = true;
    CommandSFX.play('summaryOptionSelect');
    reportCardState.selectedOption = index;
    reportCardState.phase = 'response';

    var option = reportCard.options[index];
    state.directorReply = option.directorReply || '';
    state.directorReplyElapsed = 0;
    reportCardState.directorReply = state.directorReply;
    reportCardState.directorReplyProgress = 0;

    // Apply approval change via Director (if available)
    if (typeof commandState !== 'undefined' && commandState.director) {
        var director = commandState.director;
        if (director.applyDialogueChoice) {
            director.applyDialogueChoice(index, reportCard);
        } else if (director.updateApproval && option.approvalDelta !== undefined) {
            director.updateApproval(option.approvalDelta);
        }
    }

    // Debounce keys
    if (typeof keys !== 'undefined') {
        keys['1'] = false; keys['2'] = false; keys['3'] = false;
        keys['Digit1'] = false; keys['Digit2'] = false; keys['Digit3'] = false;
    }
}

// ============================================
// CREW SWAP
// ============================================

function performCrewSwap() {
    if (typeof commandState === 'undefined' || !commandState.roster) return;
    var roster = commandState.roster;
    var zones = commandState.zones;

    if (!zones || zones.length < 2) return;

    // Get crew assigned to each zone
    var crew0 = roster.getAssigned ? roster.getAssigned(zones[0].id) : null;
    var crew1 = roster.getAssigned ? roster.getAssigned(zones[1].id) : null;

    if (crew0 && crew1 && roster.swapAssignments) {
        roster.swapAssignments(crew0.id, crew1.id);
    }
}

// ============================================
// RENDER
// ============================================

function renderCommandSummary() {
    if (!commandSummaryState.active) return;

    var state = commandSummaryState;

    if (state.phase === 'report') {
        // Use the report card renderer from director-renderer.js
        renderReportCardPanel(state.reportCard, state.selectedOption);

    } else if (state.phase === 'crew_swap') {
        renderCrewSwapScreen();
    }
}

// ============================================
// CREW SWAP SCREEN
// ============================================

function renderCrewSwapScreen() {
    var cw = canvas.width;
    var ch = canvas.height;

    // Full screen dim
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, cw, ch);

    // Panel
    var pw = Math.min(cw - 60, 500);
    var ph = 220;
    var px = (cw - pw) / 2;
    var py = (ch - ph) / 2;

    renderNGEPanel(px, py, pw, ph, {
        color: COMMAND_CONFIG.COLORS.COMMAND_GOLD,
        cutCorners: ['tl'],
        alpha: 0.85,
        label: 'CREW MANAGEMENT'
    });

    // Header
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
    ctx.fillText('CREW ASSIGNMENTS', px + pw / 2, py + 30);

    // Current assignments
    if (typeof commandState !== 'undefined' && commandState.zones) {
        var zones = commandState.zones;
        var roster = commandState.roster;

        for (var i = 0; i < zones.length; i++) {
            var zone = zones[i];
            var crew = roster && roster.getAssigned ? roster.getAssigned(zone.id) : zone.crewMember;
            var rowY = py + 50 + i * 55;

            // Zone label
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#888';
            ctx.fillText(zone.name || ('ZONE ' + String.fromCharCode(65 + i)), px + 16, rowY + 12);

            // Crew portrait + name
            if (crew) {
                if (typeof renderCrewPortrait === 'function') {
                    renderCrewPortrait(px + 120, rowY - 8, 36, crew);
                }
                ctx.font = 'bold 13px monospace';
                ctx.fillStyle = '#0f0';
                ctx.fillText(crew.name || '???', px + 164, rowY + 12);

                // Trait
                var traitLabel = crew.getTraitLabel ? crew.getTraitLabel() :
                    (crew.traits && crew.traits.reckless > 0.6 ? 'RECKLESS' :
                     crew.traits && crew.traits.reckless < 0.4 ? 'CAUTIOUS' : 'BALANCED');
                ctx.font = 'bold 9px monospace';
                ctx.fillStyle = crew.traits && crew.traits.reckless > 0.6 ?
                    COMMAND_CONFIG.COLORS.TRAIT_RECKLESS : COMMAND_CONFIG.COLORS.TRAIT_CAUTIOUS;
                ctx.fillText(traitLabel, px + 164, rowY + 26);

                // Morale bar
                var moraleColor = getMoraleColor(crew.morale || 0.5);
                renderNGEBar(px + 260, rowY + 4, 60, 8, crew.morale || 0.5, moraleColor);
                ctx.font = 'bold 7px monospace';
                ctx.fillStyle = '#888';
                ctx.fillText('MRL', px + 260, rowY + 24);
            }
        }

        // Swap arrow indicator
        if (zones.length >= 2) {
            var arrowY = py + 50 + 27;
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
            ctx.fillText('\u21C5', px + pw / 2, arrowY + 5);
        }
    }

    // Controls
    var controlY = py + ph - 40;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';

    renderNGEKeyBadge(px + 16, controlY - 4, 'S', 16, 16);
    ctx.fillStyle = '#aaa';
    ctx.fillText('SWAP CREW', px + 38, controlY + 8);

    renderNGEKeyBadge(px + pw - 100, controlY - 4, '\u21B5', 22, 16);
    ctx.fillStyle = COMMAND_CONFIG.COLORS.COMMAND_GOLD;
    ctx.fillText('CONTINUE', px + pw - 74, controlY + 8);
}
