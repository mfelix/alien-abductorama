// ============================================
// COMMAND PHASE — MASTER ORCHESTRATOR
// The ONLY Phase 2 file that reads/writes game.js globals.
// Creates commandState, runs update/render loops,
// handles state machine transitions and input.
// ============================================

let commandState = null;

// --------------------------------------------------
// ZONE SOUND THROTTLING
// --------------------------------------------------

var _zoneSoundCooldowns = {};
var _zoneSoundsThisFrame = 0;
var MAX_ZONE_SOUNDS_PER_FRAME = 2;
var ZONE_SOUND_COOLDOWNS = {
    zoneTargetSpawn: 500,
    zoneBeamActive: 2000,
    zoneAbductionComplete: 300,
    zoneTargetDropped: 500,
    zoneTankFire: 400,
    zoneUfoHit: 300,
    zoneUfoDestroyed: 5000,
    zoneUfoRespawn: 5000,
    zoneQuotaMilestone: 2000,
    zoneStateStable: 3000,
    zoneStateStressed: 3000,
    zoneStateCrisis: 3000
};

function tryPlayZoneSound(zone, soundName, zoneIndex) {
    if (_zoneSoundsThisFrame >= MAX_ZONE_SOUNDS_PER_FRAME) return;
    var cooldown = ZONE_SOUND_COOLDOWNS[soundName] || 500;
    zone._soundCooldowns = zone._soundCooldowns || {};
    var now = performance.now();
    var last = zone._soundCooldowns[soundName] || 0;
    if (now - last < cooldown) return;
    zone._soundCooldowns[soundName] = now;
    _zoneSoundsThisFrame++;
    CommandSFX.play(soundName);
}

// --------------------------------------------------
// INITIALIZATION
// --------------------------------------------------

function initCommandPhase() {
    const CC = COMMAND_CONFIG;
    const zoneCount = (typeof commandPhaseZoneCount !== 'undefined') ? commandPhaseZoneCount : 2;

    // Generate crew — one per zone, alternating reckless/cautious leaning
    const roster = new CrewRoster();
    const usedNames = new Set();

    function pickName() {
        let name;
        do {
            name = CC.NAMES[Math.floor(Math.random() * CC.NAMES.length)];
        } while (usedNames.has(name));
        usedNames.add(name);
        return name;
    }

    function randomAppearance() {
        return {
            skinColor: ['#0a7040', '#0a5060', '#1a8040', '#0a6050'][Math.floor(Math.random() * 4)],
            eyeSize: 0.9 + Math.random() * 0.2,
            craniumWidth: 0.9 + Math.random() * 0.2
        };
    }

    // Create zones and assign one crew member per zone
    const zones = [];
    for (let i = 0; i < zoneCount; i++) {
        const difficulty = 0.2 + (0.6 * i / Math.max(zoneCount - 1, 1));
        const zone = new ZoneState('zone-' + i, difficulty);

        // Create crew member: alternate reckless/cautious
        const isReckless = (i % 2 === 0);
        const crew = new CrewMember({
            name: pickName(),
            traits: { reckless: isReckless ? (0.65 + Math.random() * 0.15) : (0.20 + Math.random() * 0.15) },
            appearance: randomAppearance()
        });
        roster.addMember(crew);
        zone.assignCrew(crew);
        roster.assignToZone(crew.id, zone.id);

        // Randomize tech level (0-15)
        // Weighted distribution: mostly mid-range (5-10), occasional low (2-4) or high (11-14)
        const roll = Math.random();
        if (roll < 0.15) {
            // 15% chance: low tech (2-4)
            zone.techLevel = 2 + Math.floor(Math.random() * 3);
        } else if (roll < 0.85) {
            // 70% chance: mid-range (5-10)
            zone.techLevel = 5 + Math.floor(Math.random() * 6);
        } else {
            // 15% chance: high tech (11-14)
            zone.techLevel = 11 + Math.floor(Math.random() * 4);
        }

        zones.push(zone);
    }

    // Create director
    const director = new Director();

    // Create resource pipeline
    const pipeline = new ResourcePipeline();

    // Get HUD layout
    const hudLayout = getCommandHUDLayout(zoneCount);

    // Set initial quota targets and spawn tanks
    const quotaTarget = director.getQuotaTarget(0);
    for (const zone of zones) {
        zone.quota.target = quotaTarget;
        zoneSpawnTanks(zone);
    }

    // Initialize sound engine before any CommandSFX calls
    CommandSFX.init();

    // Set initial zone volume scaling
    if (typeof CommandSFX.setZoneScale === 'function') {
        CommandSFX.setZoneScale(zoneCount);
    }

    commandState = {
        commandWave: 0,
        waveTimer: CC.ZONE.WAVE_DURATION,
        zones: zones,
        roster: roster,
        director: director,
        pipeline: pipeline,
        commandPoints: 0,
        totalAbductions: typeof harvestCount !== 'undefined' ? harvestCount : 0,
        overrideAvailable: true,
        selectedZone: 0,
        subState: 'BOOT',
        hudLayout: hudLayout
    };

    // Start boot sequence
    if (typeof initCommandBoot === 'function') {
        initCommandBoot(commandState ? commandState.commandWave : 1);
    }
}

// --------------------------------------------------
// UPDATE — Master update loop for COMMAND state
// --------------------------------------------------

function updateCommand(dt) {
    if (!commandState) return;

    const CC = COMMAND_CONFIG;
    const cs = commandState;

    // Sub-state machine
    switch (cs.subState) {
        case 'BOOT':
            if (typeof updateCommandBoot === 'function') {
                updateCommandBoot(dt);
            }
            const bootComplete = typeof isCommandBootComplete === 'function'
                ? isCommandBootComplete() : true;
            if (bootComplete) {
                cs.subState = 'LIVE';
                CommandSFX.play('waveStart');
                // Director wave-start transmission
                if (cs.director.getWaveStartDialogue) {
                    const msg = cs.director.getWaveStartDialogue();
                    CommandSFX.play('directorTransmit');
                    CommandSFX.duck(0.4, 0.3);
                    cs.director.isTransmitting = true;
                    cs.director.currentDialogue = msg;
                    cs.director.dialogueProgress = 0;
                }
            }
            // Still update zones during boot (they run in background)
            for (let i = 0; i < cs.zones.length; i++) {
                const zone = cs.zones[i];
                const isFocused = i === cs.selectedZone;
                zoneUpdate(zone, dt, isFocused);
            }
            break;

        case 'LIVE':
            // Update zones with event detection
            _zoneSoundsThisFrame = 0;
            for (var i = 0; i < cs.zones.length; i++) {
                var zone = cs.zones[i];
                var isFocused = i === cs.selectedZone;

                // Snapshot BEFORE update
                var prevQuota = zone.quota.current;
                var prevHealth = zone.crewUfo.health;
                var prevBeam = zone.crewUfo.beamActive;
                var prevRespawnTimer = zone.ufoRespawnTimer;
                var prevTargetCount = zone.targets.length;
                var prevProjectileCount = zone.projectiles.length;
                var prevState = zone.state;

                // Run update
                zoneUpdate(zone, dt, isFocused);

                // --- Event detection by comparing pre/post state ---

                // Abduction complete (quota increased)
                if (zone.quota.current > prevQuota) {
                    tryPlayZoneSound(zone, 'zoneAbductionComplete', i);
                    // Check quota milestones (25%, 50%, 75%, 100%)
                    var quotaPct = zone.quota.current / zone.quota.target;
                    var prevPct = prevQuota / zone.quota.target;
                    if ((quotaPct >= 0.25 && prevPct < 0.25) ||
                        (quotaPct >= 0.50 && prevPct < 0.50) ||
                        (quotaPct >= 0.75 && prevPct < 0.75) ||
                        (quotaPct >= 1.00 && prevPct < 1.00)) {
                        tryPlayZoneSound(zone, 'zoneQuotaMilestone', i);
                    }
                }

                // UFO hit (health decreased but still alive)
                if (zone.crewUfo.health < prevHealth && zone.crewUfo.health > 0) {
                    tryPlayZoneSound(zone, 'zoneUfoHit', i);
                }

                // UFO destroyed (respawn timer just started)
                if (zone.ufoRespawnTimer > 0 && prevRespawnTimer <= 0) {
                    tryPlayZoneSound(zone, 'zoneUfoDestroyed', i);
                }

                // UFO respawned (respawn timer just ended)
                if (zone.ufoRespawnTimer <= 0 && prevRespawnTimer > 0) {
                    tryPlayZoneSound(zone, 'zoneUfoRespawn', i);
                }

                // Beam activated
                if (zone.crewUfo.beamActive && !prevBeam) {
                    tryPlayZoneSound(zone, 'zoneBeamActive', i);
                }

                // Target dropped (beam was active, now not, and beamTarget cleared)
                if (!zone.crewUfo.beamActive && prevBeam && zone.crewUfo.beamTarget === null) {
                    tryPlayZoneSound(zone, 'zoneTargetDropped', i);
                }

                // Tank fired (new projectile appeared)
                if (zone.projectiles.length > prevProjectileCount) {
                    tryPlayZoneSound(zone, 'zoneTankFire', i);
                }

                // Target spawned
                if (zone.targets.length > prevTargetCount) {
                    tryPlayZoneSound(zone, 'zoneTargetSpawn', i);
                }

                // Zone state change (replaces old lines 147-157)
                if (zone.state !== prevState) {
                    if (zone.state === 'stable') tryPlayZoneSound(zone, 'zoneStateStable', i);
                    else if (zone.state === 'stressed') tryPlayZoneSound(zone, 'zoneStateStressed', i);
                    else if (zone.state === 'crisis') tryPlayZoneSound(zone, 'zoneStateCrisis', i);
                    else if (zone.state === 'emergency') CommandSFX.startLoop('zoneEmergency');
                    // Stop emergency loop if leaving emergency
                    if (prevState === 'emergency' && zone.state !== 'emergency') {
                        CommandSFX.stopLoop('zoneEmergency');
                    }
                }
            }

            // Update resource pipeline
            cs.pipeline.update(dt, cs.zones);

            // Update Director typewriter
            if (cs.director.isTransmitting) {
                cs.director.dialogueProgress += CC.DIRECTOR.TYPEWRITER_SPEED * dt;
                if (cs.director.dialogueProgress >= cs.director.currentDialogue.length) {
                    cs.director.dialogueProgress = cs.director.currentDialogue.length;
                    // Auto-dismiss after 3 seconds
                    if (!cs.director._dismissTimer) {
                        cs.director._dismissTimer = 3.0;
                    }
                    cs.director._dismissTimer -= dt;
                    if (cs.director._dismissTimer <= 0) {
                        cs.director.isTransmitting = false;
                        cs.director._dismissTimer = null;
                        CommandSFX.unduck(0.5);
                    }
                }
            }

            // Wave timer countdown
            var _prevTimer = cs.waveTimer;
            cs.waveTimer -= dt;

            // Final 5-second countdown beeps (ascending pentatonic)
            for (var _s = 5; _s >= 1; _s--) {
                if (_prevTimer > _s && cs.waveTimer <= _s) {
                    CommandSFX.play('countdownBeep', { secondsLeft: _s });
                }
            }

            // Wave timer warning at 30 seconds
            if (cs.waveTimer <= 30 && cs.waveTimer > 0 && !cs._timerWarningStarted) {
                cs._timerWarningStarted = true;
                CommandSFX.play('waveTimerWarning');
            }

            // Handle input
            handleCommandInput(cs);

            // Wave end check
            if (cs.waveTimer <= 0) {
                cs.waveTimer = 0;
                endCommandWave();
            }
            break;

        case 'OVERRIDE':
            updateOverride(dt);

            // Update all zones (including non-overridden ones)
            for (let i = 0; i < cs.zones.length; i++) {
                const zone = cs.zones[i];
                // During override, the overridden zone gets player focus
                const isFocused = zone.isOverrideActive;
                zoneUpdate(zone, dt, isFocused);
            }

            // Pipeline continues during override
            cs.pipeline.update(dt, cs.zones);

            // Wave timer still counts during override
            var _prevTimerOvr = cs.waveTimer;
            cs.waveTimer -= dt;

            // Final 5-second countdown beeps during override
            for (var _s2 = 5; _s2 >= 1; _s2--) {
                if (_prevTimerOvr > _s2 && cs.waveTimer <= _s2) {
                    CommandSFX.play('countdownBeep', { secondsLeft: _s2 });
                }
            }

            // Check if override ended
            if (!isOverrideActive()) {
                cs.subState = 'LIVE';
                CommandSFX.play('overrideEnd');
                CommandSFX.stopLoop('overrideHum');
                // Restore multi-zone volume scaling
                if (typeof CommandSFX.setZoneScale === 'function') {
                    CommandSFX.setZoneScale(cs.zones.length);
                }
                // Director disapproval
                CommandSFX.play('dirDisapproval');
                if (cs.director.getOverrideDialogue) {
                    const msg = cs.director.getOverrideDialogue();
                    CommandSFX.play('directorTransmit');
                    CommandSFX.duck(0.4, 0.3);
                    cs.director.isTransmitting = true;
                    cs.director.currentDialogue = msg;
                    cs.director.dialogueProgress = 0;
                    cs.director._dismissTimer = null;
                }
                cs.director.updateApproval(-CC.DIRECTOR.OVERRIDE_PENALTY);
            }

            // Wave end during override
            if (cs.waveTimer <= 0) {
                cs.waveTimer = 0;
                if (isOverrideActive()) {
                    CommandSFX.play('overrideForceEnd');
                    CommandSFX.stopLoop('overrideHum');
                    endOverride();
                }
                cs.subState = 'LIVE';
                endCommandWave();
            }
            break;
    }
}

// --------------------------------------------------
// RENDER — Master render loop for COMMAND state
// --------------------------------------------------

function renderCommand() {
    if (!commandState) return;

    const cs = commandState;

    // Clear canvas (already done in gameLoop, but ensure black bg)
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render zone panels
    for (let i = 0; i < cs.zones.length; i++) {
        const zone = cs.zones[i];
        const layout = cs.hudLayout.zones[i];
        const isFocused = i === cs.selectedZone;
        const isOverride = zone.isOverrideActive;
        if (typeof renderZonePanel === 'function') {
            renderZonePanel(layout.x, layout.y, layout.w, layout.h, zone, isFocused, isOverride);
        }
    }

    // Render command HUD (status bar, crew roster, resources, orders, director channel)
    renderCommandHUD(cs);

    // Render boot overlays if booting
    if (cs.subState === 'BOOT' && typeof renderCommandBoot === 'function') {
        renderCommandBoot(ctx, cs.hudLayout);
    }

    // Render override transition if in override
    if (cs.subState === 'OVERRIDE') {
        renderOverrideTransition();
    }
}

// --------------------------------------------------
// INPUT HANDLING
// --------------------------------------------------

// Key state tracking for edge detection (press, not hold)
// game.js uses e.code strings: 'Tab', 'Digit1', 'KeyD', 'KeyO', etc.
const _commandKeyPrev = {};

function _commandKeyPressed(code) {
    const current = keys[code];
    const prev = _commandKeyPrev[code] || false;
    _commandKeyPrev[code] = current;
    return current && !prev;
}

function handleCommandInput(cs) {
    // Zone selection: Tab to cycle, 1/2 to select directly
    if (_commandKeyPressed('Tab')) {
        cs.selectedZone = (cs.selectedZone + 1) % cs.zones.length;
        CommandSFX.play('zoneSelect');
    }
    if (_commandKeyPressed('Digit1')) {
        cs.selectedZone = 0;
        CommandSFX.play('zoneSelect');
    }
    if (_commandKeyPressed('Digit2')) {
        if (cs.zones.length > 1) { cs.selectedZone = 1; CommandSFX.play('zoneSelect'); }
    }
    if (_commandKeyPressed('Digit3')) {
        if (cs.zones.length > 2) { cs.selectedZone = 2; CommandSFX.play('zoneSelect'); }
    }
    if (_commandKeyPressed('Digit4')) {
        if (cs.zones.length > 3) { cs.selectedZone = 3; CommandSFX.play('zoneSelect'); }
    }

    // Fleet orders for selected zone: D=defensive, H=harvest, B=balanced
    const selectedZone = cs.zones[cs.selectedZone];
    if (selectedZone) {
        if (_commandKeyPressed('KeyD')) {
            selectedZone.setFleetOrder('defensive');
            CommandSFX.play('fleetOrder');
        }
        if (_commandKeyPressed('KeyH')) {
            selectedZone.setFleetOrder('harvest');
            CommandSFX.play('fleetOrder');
        }
        if (_commandKeyPressed('KeyB')) {
            selectedZone.setFleetOrder('balanced');
            CommandSFX.play('fleetOrder');
        }
    }

    // Emergency Override: O key
    if (_commandKeyPressed('KeyO')) {
        if (cs.overrideAvailable && cs.subState === 'LIVE') {
            cs.overrideAvailable = false;
            cs.subState = 'OVERRIDE';
            CommandSFX.play('overrideActivate');
            // Single zone focus — full volume
            if (typeof CommandSFX.setZoneScale === 'function') {
                CommandSFX.setZoneScale(1);
            }
            const zone = cs.zones[cs.selectedZone];
            initOverride(zone, cs.director);
        } else {
            CommandSFX.play('errorReject');
        }
    }

    // Resource routing: R key (simplified: transfer 30 energy from non-selected to selected zone)
    if (_commandKeyPressed('KeyR')) {
        if (cs.zones.length >= 2) {
            const fromIdx = cs.selectedZone === 0 ? 1 : 0;
            const toIdx = cs.selectedZone;
            const fromZone = cs.zones[fromIdx];
            const toZone = cs.zones[toIdx];
            const CC = COMMAND_CONFIG;
            const maxTransfer = Math.min(
                CC.RESOURCE.MAX_TRANSFER,
                fromZone.crewUfo.energy - CC.RESOURCE.SAFETY_FLOOR
            );
            if (maxTransfer >= CC.RESOURCE.MIN_TRANSFER) {
                const amount = Math.min(30, maxTransfer);
                cs.pipeline.routeResources(fromZone, toZone, 'energy', amount);
                CommandSFX.play('resTransferStart');
            } else {
                CommandSFX.play('errorReject');
            }
        }
    }
}

// --------------------------------------------------
// WAVE LIFECYCLE
// --------------------------------------------------

function endCommandWave() {
    const cs = commandState;
    const CC = COMMAND_CONFIG;

    CommandSFX.play('waveEnd');
    CommandSFX.stopAllLoops(1.0);

    // Reset timer warning flag for next wave
    cs._timerWarningStarted = false;

    // Generate wave reports for each zone
    const zoneResults = [];
    for (const zone of cs.zones) {
        zone.generateWaveReport();
        zoneResults.push(zone.waveReport);
    }

    // Update game.js globals
    let waveAbductions = 0;
    let waveBioMatter = 0;
    let waveScore = 0;

    for (const report of zoneResults) {
        waveAbductions += report.abductions;
        waveBioMatter += report.abductions * 3; // Average bio value
        waveScore += report.abductions * CC.SCORE.PER_ABDUCTION_MULTIPLIER;

        if (report.quotaMet) {
            waveScore += CC.SCORE.QUOTA_MET_BONUS;
        }
        if (report.quotaPercent >= CC.QUOTA.EXCEEDED_THRESHOLD * 100) {
            waveScore += CC.SCORE.QUOTA_EXCEEDED_BONUS;
        }
    }

    // All zones stable bonus
    if (cs.zones.every(z => z.state === 'stable')) {
        waveScore += CC.SCORE.ALL_STABLE_BONUS;
    }

    // Sync to game.js globals
    if (typeof harvestCount !== 'undefined') harvestCount += waveAbductions;
    if (typeof score !== 'undefined') score += waveScore;
    if (typeof bioMatter !== 'undefined') bioMatter += waveBioMatter;
    cs.totalAbductions += waveAbductions;

    // Command Points
    const overallPct = zoneResults.reduce((sum, r) => sum + r.quotaPercent, 0) / zoneResults.length;
    if (overallPct >= CC.QUOTA.EXCEEDED_THRESHOLD * 100) {
        cs.commandPoints += CC.CP.QUOTA_EXCEEDED;
    } else if (overallPct >= CC.QUOTA.MET_THRESHOLD * 100) {
        cs.commandPoints += CC.CP.QUOTA_MET;
    }
    // Bonuses
    if (zoneResults.every(r => r.quotaPercent >= CC.QUOTA.EXCEEDED_THRESHOLD * 100)) {
        cs.commandPoints += CC.CP.ALL_EXCEEDED_BONUS;
    }
    if (cs.director.getMood() === 'satisfied') {
        cs.commandPoints += CC.CP.DIRECTOR_SATISFIED_BONUS;
    }

    // Director generates report card
    const reportCard = cs.director.generateReportCard(zoneResults);

    // Record quota history (total abductions this wave across zones)
    cs.director.quotaHistory.push(waveAbductions);

    // Increment wave
    cs.commandWave++;

    // Reset override availability
    cs.overrideAvailable = true;

    // Transition to summary
    gameState = 'COMMAND_SUMMARY';
    // command-summary.js expects startCommandSummary(waveData)
    if (typeof startCommandSummary === 'function') {
        startCommandSummary({ reportCard: reportCard, commandState: cs });
    }
}

function startNextWave() {
    const cs = commandState;
    const CC = COMMAND_CONFIG;

    // Re-enable loops for the new wave
    CommandSFX.unsilenceLoops();

    // Set zone volume scaling for the new wave
    if (typeof CommandSFX.setZoneScale === 'function') {
        CommandSFX.setZoneScale(cs.zones.length);
    }

    // Reset zones
    for (const zone of cs.zones) {
        zone.reset();
    }

    // Update quota targets
    const quotaTarget = cs.director.getQuotaTarget(cs.commandWave);
    for (const zone of cs.zones) {
        zone.quota.target = quotaTarget;
    }

    // Spawn initial tanks for new wave
    for (const zone of cs.zones) {
        zoneSpawnTanks(zone);
    }

    // Update crew morale and stamina
    for (const member of cs.roster.members) {
        if (member.assignedZone) {
            // Active crew: drain stamina, adjust morale based on zone performance
            member.stamina = Math.max(CC.CREW.MORALE_MIN, member.stamina - CC.CREW.STAMINA_DRAIN);
            member.consecutiveWavesAssigned++;

            const zone = cs.zones.find(z => z.id === member.assignedZone);
            if (zone && zone.waveReport) {
                if (zone.waveReport.quotaMet) {
                    member.morale = Math.min(CC.CREW.MORALE_MAX, member.morale + 0.05);
                    if (zone.waveReport.quotaPercent >= CC.QUOTA.EXCEEDED_THRESHOLD * 100) {
                        member.morale = Math.min(CC.CREW.MORALE_MAX, member.morale + 0.05);
                    }
                } else {
                    member.morale = Math.max(CC.CREW.MORALE_MIN, member.morale - 0.08);
                }
                // Overwork penalty
                if (member.consecutiveWavesAssigned > 3) {
                    member.morale = Math.max(CC.CREW.MORALE_MIN, member.morale - 0.05);
                }
                // Crisis stress
                if (zone.state === 'crisis' || zone.state === 'emergency') {
                    member.morale = Math.max(CC.CREW.MORALE_MIN, member.morale - 0.05);
                }
                // Record performance
                member.recordPerformance(zone.waveReport.quotaPercent / 100);
            }
        } else {
            // Benched crew: recover stamina and morale
            member.stamina = Math.min(CC.CREW.MORALE_MAX, member.stamina + CC.CREW.STAMINA_BENCH_RECOVERY);
            member.morale = Math.min(CC.CREW.MORALE_MAX, member.morale + 0.08);
            member.consecutiveWavesAssigned = 0;
        }

        // Burnout check
        if (member.stamina <= 0) {
            member.morale = 0;
        }
    }

    // Reassign crew AI (morale/stamina may have changed performance modifiers)
    for (const zone of cs.zones) {
        if (zone.crewMember) {
            zone.crewAI = new CrewAI(zone.crewMember);
        }
    }

    // Reset wave timer
    cs.waveTimer = CC.ZONE.WAVE_DURATION;
    cs.overrideAvailable = true;

    // Start boot sequence
    cs.subState = 'BOOT';
    gameState = 'COMMAND';
    if (typeof initCommandBoot === 'function') {
        initCommandBoot(commandState ? commandState.commandWave : 1);
    }
}

// --------------------------------------------------
// PROMOTION CINEMATIC
// promotion-cinematic.js defines initPromotionCinematic(),
// updatePromotionCinematic(dt), and renderPromotionCinematic()
// which are called directly from game.js gameLoop.
// It calls initCommandPhase() internally to set up commandState.
// When cinematic completes, it sets gameState = 'COMMAND'.
// --------------------------------------------------

// --------------------------------------------------
// COMMAND SUMMARY BRIDGE
// command-summary.js defines updateCommandSummary/renderCommandSummary
// which are called directly from game.js gameLoop.
// It calls startNextCommandWave() which we alias here.
// --------------------------------------------------

function startNextCommandWave() {
    startNextWave();
}
