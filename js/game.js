// ============================================
// ALIEN ABDUCTIO-RAMA
// ============================================

// Configuration constants (from GDD section 11)
const CONFIG = {
    // UFO
    UFO_SPEED: 400,
    UFO_START_HEALTH: 100,
    UFO_Y_POSITION: 0.15, // 15% from top

    // Energy
    ENERGY_MAX: 100,
    ENERGY_DRAIN_RATE: 20,
    ENERGY_RECHARGE_RATE: 14,
    ENERGY_MIN_TO_FIRE: 10,

    // Targets
    TARGET_WEIGHT_MULTIPLIER: 0.5, // seconds per weight unit
    TARGET_MAX_ON_SCREEN: 5,
    TARGET_SPAWN_INTERVAL: [2, 4], // min, max seconds
    TARGET_WANDER_SPEED: 30,
    TARGET_LIFETIME: 10,

    // Target Flee Behavior
    TARGET_FLEE_RADIUS: 150,
    TARGET_FLEE_SPEED_MULTIPLIER: 2,
    FALL_GRAVITY: 500, // pixels/sec² for dropped targets

    TARGET_AWARENESS: {
        human: 0,
        dog: 0,
        cat: 0.3,
        cow: 0.5,
        sheep: 0.5
    },

    // Tanks
    TANK_BASE_SPEED: 60,
    TANK_SPEED_INCREMENT: 10,
    TANK_FIRE_INTERVAL: [2, 3],
    TANK_MISSILE_FREQUENCY: 4,
    TANK_POINTS: 10,
    SHELL_SPEED: 300,
    MISSILE_SPEED: 500,

    // Damage & Healing
    SHELL_DAMAGE: 10,
    MISSILE_DAMAGE: 25,
    HEAL_PER_ABDUCTION: 5,
    ENERGY_RESTORE_RATIO: 0.3, // Energy restored = points * this ratio

    // Combo System
    COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3],
    COMBO_MAX: 3,

    // Waves
    WAVE_DURATION: 60,
    TANKS_BASE: 1,
    TANKS_INCREMENT: 0.5,
    WAVE_TRANSITION_DURATION: 3,

    // Shop
    SHOP_DURATION: 30,

    // Energy Cells (revive mechanic)
    ENERGY_CELL_REVIVE_HEALTH: 50,  // Health restored on revive
    INVINCIBILITY_DURATION: 3,      // Seconds of invincibility after revive
    INVINCIBILITY_FLICKER_RATE: 10, // Flicker frequency during invincibility

    // Bombs
    BOMB_GRAVITY: 600,              // Gravity acceleration (pixels/s²)
    BOMB_INITIAL_VX: 0,             // Initial horizontal velocity
    BOMB_INITIAL_VY: 100,           // Initial downward velocity
    BOMB_BOUNCE_DAMPING: 0.6,       // Velocity retained after bounce
    BOMB_MAX_BOUNCES: 3,            // Max bounces before explosion
    BOMB_EXPLOSION_RADIUS: 120,     // Blast radius
    BOMB_EXPLOSION_DAMAGE: 50,      // Damage to tanks in blast radius
    BOMB_START_COUNT: 1,            // Starting bomb count per game
    BOMB_MAX_COUNT: 9,              // Maximum bombs player can hold
    BOMB_RECHARGE_TIME: 12,         // Seconds to recharge one bomb

    // Warp Juke
    WARP_JUKE_DISTANCE: 200,        // Distance to teleport
    WARP_JUKE_DOUBLE_TAP_TIME: 0.4, // Time window for double-tap detection
    WARP_JUKE_GHOST_DURATION: 0.5,  // Ghost trail duration
    WARP_JUKE_ENERGY_COST: 25,      // Energy cost to warp

    // Tank Health
    TANK_HEALTH: 50,                // Regular tank health
    HEAVY_TANK_HEALTH: 100,         // Heavy tank health

    // Scoring
    WAVE_COMPLETE_BONUS: 100,

    // Target definitions
    TARGETS: {
        human: { points: 50, weight: 5, spawnRate: 0.15 },
        cow: { points: 40, weight: 4, spawnRate: 0.20 },
        sheep: { points: 30, weight: 3, spawnRate: 0.20 },
        cat: { points: 20, weight: 2, spawnRate: 0.22 },
        dog: { points: 20, weight: 2, spawnRate: 0.23 }
    },

    // Powerups
    POWERUP_SPAWN_INTERVAL: [15, 25],
    POWERUP_SPAWN_WAVE_SCALING: 0.1,  // 10% faster per wave
    POWERUP_MAX_ON_SCREEN: 2,
    POWERUP_LIFETIME: 12,
    POWERUP_FIRST_SPAWN_DELAY: 8,
    POWERUP_STACK_MAX_DURATION: 30,
    POWERUP_STACK_MAX_CHARGES: 6,

    POWERUPS: {
        health_pack: {
            name: 'SHIELD+',
            color: '#0f0',
            duration: 0,
            healAmount: 25,
            spawnWeight: 0.25,
            collectionType: 'beam',
            beamEnergyCost: 5,
            abductionTime: 0.5
        },
        rapid_abduct: {
            name: 'RAPID BEAM',
            color: '#ff0',
            duration: 15,
            speedMultiplier: 2,
            spawnWeight: 0.20,
            collectionType: 'collision'
        },
        shield: {
            name: 'SHIELD',
            color: '#0af',
            duration: 0,
            charges: 3,
            spawnWeight: 0.20,
            collectionType: 'collision'
        },
        energy_surge: {
            name: 'ENERGY SURGE',
            color: '#f0f',
            duration: 10,
            spawnWeight: 0.15,
            collectionType: 'beam',
            beamEnergyCost: 5,
            abductionTime: 0.5
        },
        wide_beam: {
            name: 'WIDE BEAM',
            color: '#fa0',
            duration: 12,
            widthMultiplier: 2,
            spawnWeight: 0.20,
            collectionType: 'collision'
        }
    },

    // Shop Items
    SHOP_ITEMS: [
        {
            id: 'repair',
            name: 'REPAIR KIT',
            description: 'Restore 25 shield',
            cost: 25,
            color: '#0f0',
            effect: 'heal',
            value: 25
        },
        {
            id: 'speed_cell',
            name: 'SPEED CELL',
            description: '+20% UFO speed',
            cost: 200,
            color: '#ff0',
            effect: 'speed',
            value: 0.20
        },
        {
            id: 'shield_single',
            name: 'SHIELD CELL',
            description: '+1 shield charge',
            cost: 50,
            color: '#0af',
            effect: 'shield',
            value: 1
        },
        {
            id: 'max_energy',
            name: 'ENERGY CELL',
            description: '+20% max energy',
            cost: 200,
            color: '#f0f',
            effect: 'maxEnergy',
            value: 0.20
        },
        {
            id: 'energy_recharge',
            name: 'RECHARGE CELL',
            description: '+20% recharge rate',
            cost: 200,
            color: '#66ffff',
            effect: 'energyRecharge',
            value: 0.20
        },
        {
            id: 'revive_cell',
            name: 'REVIVE CELL',
            description: 'Auto-revive',
            cost: 300,
            color: '#f55',
            effect: 'energyCell',
            value: 1
        },
        {
            id: 'bomb_single',
            name: 'BOMB AMMO',
            description: '+1 max bomb',
            cost: 100,
            color: '#ff8800',
            effect: 'bombCapacity',
            value: 1
        },
        {
            id: 'harvester_drone',
            name: 'HARVESTER DRONE',
            description: 'Unlock harvester drones (S/H key)',
            cost: 100,
            color: '#0ff',
            effect: 'harvesterDrone',
            value: 1
        },
        {
            id: 'battle_drone',
            name: 'BATTLE DRONE',
            description: 'Unlock attack drones (A key)',
            cost: 100,
            color: '#f44',
            effect: 'battleDrone',
            value: 1
        },
        {
            id: 'missile_swarm',
            name: 'MISSILE SWARM',
            description: 'Homing missiles (X key)',
            cost: 400,
            color: '#ff2200',
            effect: 'missileSwarm',
            value: 1
        },
        {
            id: 'missile_capacity',
            name: 'MISSILE GROUP+',
            description: '+1 MISSILE GROUP (+4 missiles)',
            cost: 200,
            color: '#ff4400',
            effect: 'missileCapacity',
            value: 4,
            requiresMissile: true
        },
        {
            id: 'missile_damage',
            name: 'WARHEAD+',
            description: '+10 missile damage',
            cost: 200,
            color: '#ff6600',
            effect: 'missileDamage',
            value: 10,
            requiresMissile: true
        },
        {
            id: 'bomb_blast',
            name: 'BOMB BLAST+',
            description: 'Bigger explosion radius',
            cost: 150,
            color: '#ffaa00',
            effect: 'bombBlast',
            value: 1
        },
        {
            id: 'bomb_damage',
            name: 'BOMB DAMAGE+',
            description: 'Harder-hitting bombs',
            cost: 150,
            color: '#ff8800',
            effect: 'bombDamage',
            value: 1
        },
    ],

    // === EXPANSION: Missile Swarm ===
    MISSILE_GROUP_SIZE: 4,
    MISSILE_SWARM_DAMAGE: 35,
    MISSILE_SWARM_SPEED: 900,
    MISSILE_GROUP_RECHARGE_TIME: 3.0,
    MISSILE_LAUNCH_UP_SPEED: 500,
    MISSILE_LAUNCH_DURATION: 0.25,
    MISSILE_DECEL_DURATION: 0.15,
    MISSILE_APEX_DURATION: 0.10,
    MISSILE_DIVE_RAMP_SPEED: 950,

    // === EXPANSION: Missile Interceptor & Kinematics ===
    MISSILE_INTERCEPT_RADIUS: 25,
    MISSILE_INTERCEPT_NEAR_RANGE: 200,
    MISSILE_INTERCEPT_PROXIMITY_MAX: 600,
    MISSILE_INTERCEPT_URGENCY_MAX: 400,
    MISSILE_PN_CONSTANT: 3.5,
    MISSILE_MAX_TURN_RATE: 6.0,
    MISSILE_TURN_RESPONSIVENESS: 12.0,
    MISSILE_DIVE_THRUST: 1800,
    MISSILE_DRAG_LAUNCH: 0.5,
    MISSILE_DRAG_DECEL: 3.0,
    MISSILE_DRAG_DIVE: 1.2,
    MISSILE_DECEL_GRAVITY: 400,
    MISSILE_MAX_SPEED: 1100,
    MISSILE_LAUNCH_WOBBLE_FREQ_MIN: 8,
    MISSILE_LAUNCH_WOBBLE_FREQ_MAX: 14,
    MISSILE_LAUNCH_WOBBLE_AMP_MIN: 40,
    MISSILE_LAUNCH_WOBBLE_AMP_MAX: 70,
    MISSILE_DIVE_WOBBLE_AMP: 15,
    MISSILE_TERMINAL_WOBBLE_AMP: 2,
    MISSILE_WOBBLE_DECAY_DIST: 200,
    MISSILE_WOBBLE_DECAY_RATE: 5.0,
    MISSILE_SNAP_ANGLE: Math.PI / 6,
    MISSILE_SNAP_THRESHOLD: Math.PI / 4,
    MISSILE_RETARGET_BOOST: 1.8,
    MISSILE_RETARGET_BOOST_TIME: 0.15,
    MISSILE_FAN_SPREAD: Math.PI * 0.7,
    MISSILE_FAN_JITTER: 0.075,
    MISSILE_LAUNCH_STAGGER_BASE: 0.025,
    MISSILE_LAUNCH_STAGGER_JITTER: 0.04,
    MISSILE_TRAIL_LENGTH: 40,
    MISSILE_SMOKE_INTERVAL: 0.025,
    MISSILE_MAX_LIFETIME: 3.5,
    MISSILE_MAX_GROUPS: 18,
    MISSILE_GROUP_ENERGY_COST: 5,

    // === EXPANSION: Bomb Upgrade Tiers ===
    BOMB_BLAST_TIERS: [120, 160, 200],
    BOMB_DAMAGE_TIERS: [50, 75, 100],

    // === EXPANSION: Drones ===
    DRONE_MAX_SLOTS: 10,
    DRONE_ENERGY_COST: 25,        // Energy drained from UFO per drone deploy
    HARVESTER_TIMER: 45,
    BATTLE_TIMER: 40,
    HARVESTER_BATCH_SIZE: 3,

    // === EXPANSION: Coordinator Charging UX ===
    COORD_CHARGE_SNAP_RANGE: 140,       // Horizontal px range for beam snap
    COORD_CHARGE_BEAM_WIDTH: 10,        // Width of charging beam rod (px)
    COORD_CHARGE_SINE_AMP: 12,          // Sine wave amplitude on charging beam
    COORD_CHARGE_SINE_FREQ: 4,          // Sine wave frequency (cycles along beam)
    COORD_CHARGE_PARTICLE_RATE: 0.08,   // Seconds between energy particles
    COORD_ENERGY_BAR_WIDTH: 60,         // Upgraded energy bar width
    COORD_ENERGY_BAR_HEIGHT: 7,         // Upgraded energy bar height
    COORD_SOS_INTERVAL: 2.0,           // Seconds between SOS beacon pulses
    COORD_SOS_DYING_INTERVAL: 1.0,     // SOS interval when below 10%
    COORD_SOS_RING_MAX_RADIUS: 90,     // Max expansion radius of SOS ring
    COORD_SOS_RING_DURATION: 1.0,      // How long each ring lasts
    COORD_HUD_ARROW_SIZE: 12,          // Size of directional arrow indicator

    // === EXPANSION: Bio-Matter ===
    BIO_MATTER_RATES: { human: 3, cow: 2, sheep: 2, cat: 1, dog: 1, harvester_batch: 2 },

    // === EXPANSION: Abduction Quotas ===
    // Maps wave thresholds to quota targets (use highest threshold <= current wave)
    ABDUCTION_QUOTAS: { 1: 5, 4: 8, 7: 12, 10: 15, 15: 18 },
    QUOTA_MISS_PENALTY: 0.2,  // 20% faster tank fire per consecutive miss
    QUOTA_EXCEED_THRESHOLD: 0.5,  // 50% over quota for bonus

    // === EXPANSION: Tech Tree (3 tracks x 5 tiers) ===
    TECH_TREE: {
        powerGrid: [
            { id: 'pg1', name: 'Beam Conduit', cost: 10, researchTime: 30, tier: 1, track: 'powerGrid',
              description: 'Beam recharges raw drones and coordinators it passes through' },
            { id: 'pg2', name: 'Energy Efficiency', cost: 20, researchTime: 45, tier: 2, track: 'powerGrid',
              description: 'All drone/coordinator energy drain rates reduced by 30%', crossConnect: 'dc2' },
            { id: 'pg3', name: 'Power Broadcast', cost: 30, researchTime: 60, tier: 3, track: 'powerGrid',
              description: 'Beam recharges in wider horizontal radius' },
            { id: 'pg4', name: 'Reactor Amplifier', cost: 45, researchTime: 90, tier: 4, track: 'powerGrid',
              description: 'Beam recharge rate doubled', crossConnect: 'dc4' },
            { id: 'pg5', name: 'Self-Sustaining Grid', cost: 65, researchTime: 120, tier: 5, track: 'powerGrid',
              description: 'Coordinators and drones passively regenerate energy', crossConnect: 'dn5' }
        ],
        droneCommand: [
            { id: 'dc1', name: 'Drone Uplink', cost: 10, researchTime: 30, tier: 1, track: 'droneCommand',
              description: '+1 drone slot, smarter pathfinding' },
            { id: 'dc2', name: 'Harvester Coordinator', cost: 20, researchTime: 45, tier: 2, track: 'droneCommand',
              description: 'Unlocks harvester coordinator deployment', crossConnect: 'pg2' },
            { id: 'dc3', name: 'Attack Coordinator', cost: 30, researchTime: 60, tier: 3, track: 'droneCommand',
              description: 'Unlocks attack coordinator deployment' },
            { id: 'dc4', name: 'Fleet Expansion', cost: 45, researchTime: 90, tier: 4, track: 'droneCommand',
              description: 'Coordinators manage up to 5 sub-drones, allow multiple coordinators', crossConnect: 'pg4' },
            { id: 'dc5', name: 'Autonomous Swarm', cost: 65, researchTime: 120, tier: 5, track: 'droneCommand',
              description: 'Coordinators auto-deploy, full fleet automation' }
        ],
        defenseNetwork: [
            { id: 'dn1', name: 'Thruster Boost', cost: 10, researchTime: 30, tier: 1, track: 'defenseNetwork',
              description: '+30% UFO speed' },
            { id: 'dn2', name: 'Drone Armor', cost: 20, researchTime: 45, tier: 2, track: 'defenseNetwork',
              description: 'Drones and coordinators take 40% less damage' },
            { id: 'dn3', name: 'Shield Transfer', cost: 30, researchTime: 60, tier: 3, track: 'defenseNetwork',
              description: 'Coordinators gain 1 shield charge, regenerates every 30s' },
            { id: 'dn4', name: 'Fleet Resilience', cost: 45, researchTime: 90, tier: 4, track: 'defenseNetwork',
              description: '50% faster drone redeploy, 2x shield regen speed', crossConnect: 'dc4' },
            { id: 'dn5', name: 'Swarm Shield', cost: 65, researchTime: 120, tier: 5, track: 'defenseNetwork',
              description: 'Fleet generates passive damage absorption around UFO', crossConnect: 'pg5' }
        ]
    }
};

// ============================================
// TUTORIAL CONFIG
// ============================================
const TUTORIAL_CONFIG = {
    // Timing
    BOOT_WAIT: 5.0,                  // Seconds after wave start before tutorial begins (boot sequence + breathing room)
    MOVE_HINT_DELAY: 0.5,            // Seconds before move hint appears
    BEAM_HINT_DELAY: 0.3,            // Delay after move dismissal before beam hint
    BEAM_HINT_FALLBACK_TIME: 4.0,    // Show beam hint after this time even if move not done
    WARP_JUKE_HINT_DELAY: 0.3,      // Delay after tank warning before warp juke hint
    BOMB_HINT_DELAY: 0.3,            // Delay after warp juke dismissal before bomb hint
    COMPLETION_DELAY: 0.3,           // Delay after bomb dismissal before celebration
    PHASE1_HARD_CUTOFF: 32,          // Force Phase 2 when waveTimer <= this (28s elapsed)
    MOVE_CUMULATIVE_TIME: 1.0,       // Seconds of movement to complete move hint
    HINT_SLIDE_DURATION: 0.3,        // Entrance slide-in duration
    HINT_DISMISS_DURATION: 0.2,      // Dismissal animation duration
    TANK_WARNING_DURATION: 2.5,      // Total tank entrance sequence
    COMPLETION_DURATION: 2.0,        // Completion celebration duration
    COMPLETION_FADE_START: 1.5,      // When to start fading out completion text
    COORD_CHARGE_HINT_DELAY: 1.0,       // Delay after coordinator enters ACTIVE before hint shows

    // Colors
    COLORS: {
        movement: '#0ff',
        beam: '#ff0',
        warp_juke: '#0f0',
        bomb: '#f80',
        warning: '#f44',
        complete: '#fff',
        coordinator_charge: '#ffa000'
    }
};

// ============================================
// AUDIO SYSTEM
// ============================================

let audioCtx = null;
let audioInitialized = false;

// Loaded sound buffers organized by target type
// Format: { cow: [AudioBuffer, AudioBuffer], human: [AudioBuffer, ...], ... }
let targetSoundBuffers = {};
let soundsLoaded = false;

function initAudio() {
    if (audioInitialized) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioInitialized = true;
        // Load target sounds after audio context is created
        loadTargetSounds();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
}

// Load the sound manifest and preload all target sounds
async function loadTargetSounds() {
    if (!audioCtx) return;

    try {
        const response = await fetch('assets/sounds/manifest.json');
        if (!response.ok) {
            console.warn('Sound manifest not found, using synthesized sounds');
            return;
        }
        const manifest = await response.json();

        // Load all sounds in parallel
        const loadPromises = [];
        for (const [type, files] of Object.entries(manifest)) {
            targetSoundBuffers[type] = [];
            for (const file of files) {
                loadPromises.push(
                    loadSound(file).then(buffer => {
                        if (buffer) {
                            targetSoundBuffers[type].push(buffer);
                        }
                    })
                );
            }
        }

        await Promise.all(loadPromises);
        soundsLoaded = true;
        console.log('Target sounds loaded:', Object.keys(targetSoundBuffers).map(t => `${t}: ${targetSoundBuffers[t].length}`).join(', '));
    } catch (e) {
        console.warn('Failed to load target sounds:', e);
    }
}

// Load a single sound file and decode it
async function loadSound(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.warn(`Failed to load sound: ${url}`, e);
        return null;
    }
}

// Create a bitcrusher curve for the WaveShaper (stair-step quantization)
function createBitcrusherCurve(bits = 4) {
    const samples = 65536;
    const curve = new Float32Array(samples);
    const steps = Math.pow(2, bits);

    for (let i = 0; i < samples; i++) {
        const x = (i / samples) * 2 - 1; // -1 to 1
        // Quantize to discrete steps
        curve[i] = Math.round(x * steps) / steps;
    }
    return curve;
}

// Create distortion curve for extra crunch
function createDistortionCurve(amount = 20) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        const x = (i * 2 / samples) - 1;
        curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

// Play a random sound for the given target type
// Returns an object with source and delay controls for manipulation during abduction
function playTargetSound(type, volume = 0.5) {
    if (!audioCtx || !soundsLoaded) return null;

    const sounds = targetSoundBuffers[type];
    if (!sounds || sounds.length === 0) return null;

    // Pick a random sound
    const buffer = sounds[Math.floor(Math.random() * sounds.length)];

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    // Dry path gain
    const dryGain = audioCtx.createGain();
    dryGain.gain.setValueAtTime(volume, audioCtx.currentTime);

    // Delay effect with feedback
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.12, audioCtx.currentTime);

    const feedback = audioCtx.createGain();
    feedback.gain.setValueAtTime(0.7, audioCtx.currentTime); // Heavy feedback

    const delayFilter = audioCtx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);

    // Delay wet gain (starts at 0, ramps up at end)
    const delayWet = audioCtx.createGain();
    delayWet.gain.setValueAtTime(0, audioCtx.currentTime);

    // Feedback loop: delay -> filter -> feedback -> delay
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);

    // Signal routing
    source.connect(dryGain);
    source.connect(delay);
    delay.connect(delayWet);

    dryGain.connect(audioCtx.destination);
    delayWet.connect(audioCtx.destination);

    source.start();

    return {
        source: source,
        delayWet: delayWet,
        volume: volume
    };
}

// Sound synthesis helper
function playTone(frequency, duration, type = 'sine', volume = 0.3, fadeOut = true) {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

    if (fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    }

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

// Sound effect functions
const SFX = {
    beamOn: () => {
        if (!audioCtx) return;
        // Rising oscillator
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    },

    beamLoop: null,
    beamLoopGain: null,

    startBeamLoop: () => {
        if (!audioCtx || SFX.beamLoop) return;
        // Warbling hum
        SFX.beamLoop = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        SFX.beamLoopGain = audioCtx.createGain();
        const lfoGain = audioCtx.createGain();

        lfo.frequency.setValueAtTime(8, audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(50, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(SFX.beamLoop.frequency);

        SFX.beamLoop.type = 'sawtooth';
        SFX.beamLoop.frequency.setValueAtTime(150, audioCtx.currentTime);
        SFX.beamLoop.connect(SFX.beamLoopGain);
        SFX.beamLoopGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        SFX.beamLoopGain.connect(audioCtx.destination);

        SFX.beamLoop.start();
        lfo.start();
    },

    stopBeamLoop: () => {
        if (SFX.beamLoop) {
            SFX.beamLoopGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            SFX.beamLoop.stop(audioCtx.currentTime + 0.1);
            SFX.beamLoop = null;
            SFX.beamLoopGain = null;
        }
    },

    // Charging beam hum - warm electrical hum, distinct from beam loop
    chargingHumLoop: null,
    chargingHumGain: null,

    startChargingHum: () => {
        if (!audioCtx || SFX.chargingHumLoop) return;
        SFX.chargingHumLoop = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        SFX.chargingHumGain = audioCtx.createGain();
        const lfoGain = audioCtx.createGain();

        lfo.frequency.setValueAtTime(4, audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(15, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(SFX.chargingHumLoop.frequency);

        SFX.chargingHumLoop.type = 'triangle';
        SFX.chargingHumLoop.frequency.setValueAtTime(120, audioCtx.currentTime);
        SFX.chargingHumLoop.connect(SFX.chargingHumGain);
        SFX.chargingHumGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        SFX.chargingHumGain.connect(audioCtx.destination);

        SFX.chargingHumLoop.start();
        lfo.start();
    },

    stopChargingHum: () => {
        if (SFX.chargingHumLoop) {
            SFX.chargingHumGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            SFX.chargingHumLoop.stop(audioCtx.currentTime + 0.15);
            SFX.chargingHumLoop = null;
            SFX.chargingHumGain = null;
        }
    },

    // Rising pitch on charging hum as coordinator approaches full
    setChargingHumPitch: (energyPct) => {
        if (SFX.chargingHumLoop) {
            const freq = 120 + energyPct * 80; // 120Hz at empty -> 200Hz at full
            SFX.chargingHumLoop.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
        }
    },

    chargeFull: () => {
        if (!audioCtx) return;
        // Satisfying "full charge" chime — ascending major chord
        [523, 659, 784].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.2, 'sine', 0.15), i * 60);
        });
    },

    distressBeep: () => {
        if (!audioCtx) return;
        // Two-tone warning beep (short, not annoying)
        const t = audioCtx.currentTime;
        playTone(600, 0.08, 'square', 0.1);
        setTimeout(() => playTone(400, 0.08, 'square', 0.1), 100);
    },

    abductionComplete: (targetType) => {
        if (!audioCtx) return;
        // Quick success jingle when target is fully beamed
        [400, 500, 600, 800].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 80);
        });
    },

    targetPickup: (target) => {
        if (!audioCtx) return;
        // Cooldown to prevent sound spam if target is dropped and re-grabbed quickly
        const now = performance.now();
        const cooldown = 2000; // 2 seconds between sounds for same target
        if (target.lastSoundTime && (now - target.lastSoundTime) < cooldown) {
            return; // Too soon to play again
        }
        // Try to play a custom sound for this target type
        // Store the source node so we can manipulate playback rate as target rises
        const source = playTargetSound(target.type, 0.15);
        if (source) {
            target.lastSoundTime = now;
            target.abductionSound = source;
        }
    },

    countTick: (frequency = 600) => {
        if (!audioCtx) return;
        playTone(frequency, 0.05, 'square', 0.08);
    },

    bucksAward: () => {
        if (!audioCtx) return;
        [500, 700, 900].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.12, 'triangle', 0.12), i * 70);
        });
    },

    targetDropped: () => {
        if (!audioCtx) return;
        // Sad descending tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    },

    shellFire: () => {
        if (!audioCtx) return;
        // Sharp "pew"
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },

    missileFire: () => {
        if (!audioCtx) return;
        // Ominous "fwoosh"
        const osc = audioCtx.createOscillator();
        const noise = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const noiseGain = audioCtx.createGain();

        osc.connect(gain);
        noise.connect(noiseGain);
        gain.connect(audioCtx.destination);
        noiseGain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);

        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(50, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        noiseGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc.start();
        noise.start();
        osc.stop(audioCtx.currentTime + 0.3);
        noise.stop(audioCtx.currentTime + 0.2);
    },

    ufoHit: () => {
        if (!audioCtx) return;
        // Impact + alarm
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.05);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    },

    explosion: (big = false) => {
        if (!audioCtx) return;
        // Noise-based boom
        const bufferSize = audioCtx.sampleRate * (big ? 0.5 : 0.3);
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = audioCtx.createBufferSource();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(big ? 400 : 600, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + (big ? 0.5 : 0.3));

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(big ? 0.4 : 0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (big ? 0.5 : 0.3));

        noise.start();
    },

    waveComplete: () => {
        if (!audioCtx) return;
        // Fanfare
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 150);
        });
    },

    feedbackSuccess: () => {
        if (!audioCtx) return;
        // Cheerful arcade "thank you" jingle - quick ascending with sparkle
        const notes = [523, 659, 784, 880, 1047]; // C5, E5, G5, A5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                playTone(freq, 0.15, 'sine', 0.18);
                // Add a subtle sparkle harmony
                if (i >= 2) {
                    playTone(freq * 1.5, 0.1, 'triangle', 0.08);
                }
            }, i * 60);
        });
    },

    energyLow: () => {
        if (!audioCtx) return;
        playTone(200, 0.1, 'square', 0.15);
    },

    timerWarning: () => {
        if (!audioCtx) return;
        playTone(440, 0.1, 'square', 0.2);
    },

    gameOver: () => {
        if (!audioCtx) return;
        // Sad descending notes
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.4, 'sine', 0.25), i * 200);
        });
    },

    powerupSpawn: () => {
        if (!audioCtx) return;
        // Sparkle/chime - ascending arpeggio
        const notes = [600, 800, 1000, 1200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                playTone(freq, 0.1, 'sine', 0.15);
            }, i * 50);
        });
    },

    powerupCollect: () => {
        if (!audioCtx) return;
        // Boink-boink: two bouncy notes
        const t = audioCtx.currentTime;

        // First boink
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, t);
        osc1.frequency.exponentialRampToValueAtTime(350, t + 0.08);
        gain1.gain.setValueAtTime(0.3, t);
        gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc1.start(t);
        osc1.stop(t + 0.12);

        // Second boink (higher, slightly delayed)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, t + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(480, t + 0.18);
        gain2.gain.setValueAtTime(0.3, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        osc2.start(t + 0.1);
        osc2.stop(t + 0.22);
    },

    shieldHit: () => {
        if (!audioCtx) return;
        // Deflection - metallic ping with quick decay
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
        filter.Q.setValueAtTime(5, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    },

    shieldBreak: () => {
        if (!audioCtx) return;
        // Shatter - descending noise burst
        const bufferSize = audioCtx.sampleRate * 0.4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }

        const noise = audioCtx.createBufferSource();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        noise.start();
    },

    warpJuke: () => {
        if (!audioCtx) return;
        // Sci-fi teleport/warp sound - quick rising sweep with echo
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        // Main warp tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);

        // Sub harmonics
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);

        // High-pass filter for electric feel
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(300, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.25);
        osc2.stop(audioCtx.currentTime + 0.25);
    },

    powerupExpire: () => {
        if (!audioCtx) return;
        // Subtle whoosh - descending filtered noise
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    },

    // Shop sounds
    shopCheckout: () => {
        if (!audioCtx) return;
        // Coin/cash register sound - multiple coin clinks with a final "cha-ching"
        const coinFreqs = [1800, 2200, 2000, 2400, 1600];
        coinFreqs.forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
            }, i * 40);
        });
        // Final "cha-ching" bell
        setTimeout(() => {
            playTone(1200, 0.2, 'sine', 0.2);
            playTone(1500, 0.2, 'sine', 0.15);
        }, 220);
    },

    shopEmpty: () => {
        if (!audioCtx) return;
        // Whoosh/sweep sound for clearing cart
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    },

    shopStartWave: () => {
        if (!audioCtx) return;
        // Energetic "ready go" fanfare - quick ascending with punch
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                playTone(freq, 0.12, 'square', 0.18);
                playTone(freq * 1.5, 0.1, 'sine', 0.08);
            }, i * 60);
        });
    },

    tankStunned: () => {
        if (!audioCtx) return;
        // Heavy impact/crash sound - low thud + metallic clang
        const thud = audioCtx.createOscillator();
        const thudGain = audioCtx.createGain();
        const clang = audioCtx.createOscillator();
        const clangGain = audioCtx.createGain();

        // Low thud
        thud.connect(thudGain);
        thudGain.connect(audioCtx.destination);
        thud.type = 'sine';
        thud.frequency.setValueAtTime(80, audioCtx.currentTime);
        thud.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
        thudGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        thudGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        // Metallic clang
        clang.connect(clangGain);
        clangGain.connect(audioCtx.destination);
        clang.type = 'square';
        clang.frequency.setValueAtTime(300, audioCtx.currentTime);
        clang.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
        clangGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        clangGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        thud.start();
        clang.start();
        thud.stop(audioCtx.currentTime + 0.3);
        clang.stop(audioCtx.currentTime + 0.15);
    },

    tankRecovered: () => {
        if (!audioCtx) return;
        // Power-up/boot sound - ascending tone with electronic whir
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();

        // Main ascending tone
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

        // Electronic whir overlay
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.25);
        osc2.stop(audioCtx.currentTime + 0.2);
    },

    revive: () => {
        if (!audioCtx) return;
        // Dramatic power-up sound - rising sweep with sparkle
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        // Rising sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.4);

        // Harmonic sparkle
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.5);
        osc2.stop(audioCtx.currentTime + 0.5);

        // Additional sparkle notes
        [800, 1000, 1200, 1500].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.15, 'sine', 0.15), 100 + i * 80);
        });
    },

    bombDrop: () => {
        if (!audioCtx) return;
        // Whoosh + thunk
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    },

    bombReady: () => {
        if (!audioCtx) return;
        playTone(900, 0.08, 'triangle', 0.12);
        setTimeout(() => playTone(1200, 0.06, 'triangle', 0.1), 60);
    },

    targetReveal: () => {
        if (!audioCtx) return;
        playTone(600, 0.07, 'square', 0.12);
    },

    targetMax: () => {
        if (!audioCtx) return;
        playTone(900, 0.08, 'square', 0.14);
        setTimeout(() => playTone(1200, 0.08, 'square', 0.12), 70);
    },

    bonusEarned: () => {
        if (!audioCtx) return;
        // Quick two-note pip
        playTone(1000, 0.04, 'square', 0.06);
        setTimeout(() => playTone(1400, 0.04, 'square', 0.06), 40);
    },

    bonusMissed: () => {
        if (!audioCtx) return;
        // Single soft low blip
        playTone(300, 0.04, 'square', 0.06);
    },

    countFinish: () => {
        if (!audioCtx) return;
        // Satisfying "pop" when a count-up completes - bright ascending chime
        playTone(800, 0.08, 'sine', 0.15);
        setTimeout(() => playTone(1200, 0.1, 'sine', 0.12), 50);
    },

    sectionReveal: () => {
        if (!audioCtx) return;
        // Subtle soft whoosh for new section appearing
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },

    summaryComplete: () => {
        if (!audioCtx) return;
        // Bright completion fanfare - ascending major chord resolve
        playTone(523, 0.15, 'sine', 0.12);
        setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 80);
        setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 160);
        setTimeout(() => {
            playTone(1047, 0.3, 'sine', 0.18);
            playTone(1319, 0.25, 'triangle', 0.06);
        }, 260);
    },

    countdownTick: (remaining) => {
        if (!audioCtx) return;
        if (remaining > 0) {
            // Descending pitch as countdown approaches 0
            const freq = 400 + remaining * 100;
            playTone(freq, 0.08, 'triangle', 0.1);
        } else {
            // Final resolving tone — lower octave + brief harmonic
            playTone(400, 0.15, 'triangle', 0.12);
            playTone(200, 0.2, 'sine', 0.06);
        }
    },

    bombBounce: () => {
        if (!audioCtx) return;
        // Short thud
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },

    // Shop music state
    shopMusicNodes: null,
    shopMusicInterval: null,

    startShopMusic: () => {
        if (!audioCtx || SFX.shopMusicNodes) return;

        // Cheesy elevator muzak - arpeggio pattern only (no drone)
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.5);
        masterGain.connect(audioCtx.destination);

        // Store nodes for cleanup
        SFX.shopMusicNodes = { masterGain, arpeggioOscs: [] };

        // Cheesy arpeggio pattern - plays notes in sequence
        const notes = [
            261.63, 329.63, 392.00, 523.25,  // C4, E4, G4, C5
            392.00, 329.63, 261.63, 196.00,  // G4, E4, C4, G3
            293.66, 369.99, 440.00, 587.33,  // D4, F#4, A4, D5
            440.00, 369.99, 293.66, 220.00   // A4, F#4, D4, A3
        ];
        let noteIndex = 0;

        const playNote = () => {
            if (!audioCtx || !SFX.shopMusicNodes) return;

            const osc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(notes[noteIndex], audioCtx.currentTime);

            noteGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);

            osc.connect(noteGain);
            noteGain.connect(SFX.shopMusicNodes.masterGain);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);

            noteIndex = (noteIndex + 1) % notes.length;
        };

        // Start arpeggio
        playNote();
        SFX.shopMusicInterval = setInterval(playNote, 200);
    },

    stopShopMusic: () => {
        if (SFX.shopMusicInterval) {
            clearInterval(SFX.shopMusicInterval);
            SFX.shopMusicInterval = null;
        }

        if (SFX.shopMusicNodes && audioCtx) {
            const { masterGain } = SFX.shopMusicNodes;

            // Fade out
            masterGain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            // Clean up after fade
            setTimeout(() => {
                SFX.shopMusicNodes = null;
            }, 350);
        }
    },

    // Missile Swarm SFX
    missileLockOn: () => {
        if (!audioCtx) return;
        // Soft "pip-pip" lock-on sequence
        [520, 780].forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.05);
            }, i * 70);
        });
    },

    missileLaunch: () => {
        if (!audioCtx) return;
        // Brief soft whoosh
        const osc = audioCtx.createOscillator();
        const noise = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.connect(filter);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.18);

        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(40, audioCtx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, audioCtx.currentTime);
        filter.Q.setValueAtTime(0.8, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);

        osc.start();
        noise.start();
        osc.stop(audioCtx.currentTime + 0.18);
        noise.stop(audioCtx.currentTime + 0.18);
    },

    missileReady: () => {
        if (!audioCtx) return;
        // Soft brief rising chime indicating missiles recharged
        [440, 550, 660].forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.07);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.07);
            }, i * 45);
        });
    },

    missileGroupReady: () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
    },

    researchComplete: () => {
        if (!audioCtx) return;
        // Ascending chime: C5, E5, G5, C6
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.4);
            osc.start(audioCtx.currentTime + i * 0.12);
            osc.stop(audioCtx.currentTime + i * 0.12 + 0.4);
        });
    },

    // Drone SFX
    droneDeploy: (type) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const isHarvester = type === 'harvester';
        // Whoosh + mechanical whir as pod drops
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isHarvester ? 300 : 200, t);
        osc.frequency.exponentialRampToValueAtTime(isHarvester ? 80 : 60, t + 0.25);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        // Metallic clunk
        const clunk = audioCtx.createOscillator();
        const clunkGain = audioCtx.createGain();
        clunk.connect(clunkGain);
        clunkGain.connect(audioCtx.destination);
        clunk.type = 'square';
        clunk.frequency.setValueAtTime(isHarvester ? 180 : 140, t + 0.05);
        clunk.frequency.exponentialRampToValueAtTime(60, t + 0.12);
        clunkGain.gain.setValueAtTime(0.12, t + 0.05);
        clunkGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        clunk.start(t + 0.05);
        clunk.stop(t + 0.12);
    },

    droneUnfold: (type) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const isHarvester = type === 'harvester';
        // Mechanical unfolding: rising servo whir + clicks
        const servo = audioCtx.createOscillator();
        const servoGain = audioCtx.createGain();
        servo.connect(servoGain);
        servoGain.connect(audioCtx.destination);
        servo.type = 'sawtooth';
        servo.frequency.setValueAtTime(isHarvester ? 100 : 80, t);
        servo.frequency.linearRampToValueAtTime(isHarvester ? 400 : 300, t + 0.4);
        servo.frequency.linearRampToValueAtTime(isHarvester ? 200 : 150, t + 0.6);
        servoGain.gain.setValueAtTime(0.08, t);
        servoGain.gain.linearRampToValueAtTime(0.12, t + 0.3);
        servoGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        servo.start(t);
        servo.stop(t + 0.6);
        // Click-click-click
        [0.1, 0.25, 0.4].forEach(delay => {
            const click = audioCtx.createOscillator();
            const clickGain = audioCtx.createGain();
            click.connect(clickGain);
            clickGain.connect(audioCtx.destination);
            click.type = 'square';
            click.frequency.setValueAtTime(isHarvester ? 1200 : 900, t + delay);
            clickGain.gain.setValueAtTime(0.1, t + delay);
            clickGain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.03);
            click.start(t + delay);
            click.stop(t + delay + 0.03);
        });
    },

    droneBeam: () => {
        if (!audioCtx) return;
        // R2D2-style warbling beam - randomized each time
        const t = audioCtx.currentTime;
        const baseFreq = 250 + Math.random() * 150;
        const lfoRate = 8 + Math.random() * 10;
        const lfoDepth = 20 + Math.random() * 40;
        const dur = 0.2 + Math.random() * 0.15;
        const waveTypes = ['sine', 'triangle', 'square'];
        // Main tone with wobble
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(lfoRate, t);
        lfoGain.gain.setValueAtTime(lfoDepth, t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.type = waveTypes[Math.floor(Math.random() * waveTypes.length)];
        osc.frequency.setValueAtTime(baseFreq, t);
        // Random pitch slide up or down
        const slideDir = Math.random() > 0.5 ? 1.3 : 0.7;
        osc.frequency.exponentialRampToValueAtTime(baseFreq * slideDir, t + dur);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
        gain.connect(audioCtx.destination);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + dur);
        lfo.stop(t + dur);
        // Detuned harmonic for thickness
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * (1 + (Math.random() - 0.5) * 0.06), t);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * slideDir * (1 + (Math.random() - 0.5) * 0.06), t + dur);
        osc2.connect(gain2);
        gain2.gain.setValueAtTime(0.05, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + dur);
        gain2.connect(audioCtx.destination);
        osc2.start(t);
        osc2.stop(t + dur);
    },

    droneShoot: () => {
        if (!audioCtx) return;
        // R2D2-style zappy blaster - randomized pitch/sweep/waveform
        const t = audioCtx.currentTime;
        const startFreq = 400 + Math.random() * 500;
        const endFreq = 100 + Math.random() * 200;
        const dur = 0.06 + Math.random() * 0.06;
        const waveTypes = ['sawtooth', 'square'];
        const detune = (Math.random() - 0.5) * 60;
        // Main zap
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = waveTypes[Math.floor(Math.random() * waveTypes.length)];
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
        osc.detune.setValueAtTime(detune, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
        osc.start(t);
        osc.stop(t + dur);
        // Detuned second voice for fatness
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(startFreq * (0.98 + Math.random() * 0.04), t);
        osc2.frequency.exponentialRampToValueAtTime(endFreq * (0.95 + Math.random() * 0.1), t + dur);
        osc2.detune.setValueAtTime(-detune + (Math.random() - 0.5) * 30, t);
        gain2.gain.setValueAtTime(0.06, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + dur);
        osc2.start(t);
        osc2.stop(t + dur);
        // Random chance of a quick chirp after the zap
        if (Math.random() > 0.5) {
            const chirp = audioCtx.createOscillator();
            const chirpGain = audioCtx.createGain();
            chirp.connect(chirpGain);
            chirpGain.connect(audioCtx.destination);
            chirp.type = 'sine';
            const chirpFreq = 800 + Math.random() * 600;
            chirp.frequency.setValueAtTime(chirpFreq, t + dur);
            chirp.frequency.exponentialRampToValueAtTime(chirpFreq * 0.5, t + dur + 0.03);
            chirpGain.gain.setValueAtTime(0.06, t + dur);
            chirpGain.gain.exponentialRampToValueAtTime(0.01, t + dur + 0.03);
            chirp.start(t + dur);
            chirp.stop(t + dur + 0.03);
        }
    },

    droneDeliver: () => {
        if (!audioCtx) return;
        // Glitchy blip-blip: two quick digital chirps
        const t = audioCtx.currentTime;
        for (let i = 0; i < 2; i++) {
            const noteT = t + i * 0.06;
            const freq = 600 + i * 300 + Math.random() * 100;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, noteT);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.3, noteT + 0.04);
            gain.gain.setValueAtTime(0.1, noteT);
            gain.gain.exponentialRampToValueAtTime(0.01, noteT + 0.05);
            osc.start(noteT);
            osc.stop(noteT + 0.05);
        }
    },

    droneOrbReceive: () => {
        if (!audioCtx) return;
        // Glitchy digital "ka-ching" — biomatter received
        const t = audioCtx.currentTime;
        // Quick ascending glitch triplet
        const freqs = [700, 1100, 1500];
        for (let i = 0; i < freqs.length; i++) {
            const noteT = t + i * 0.035;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = i < 2 ? 'square' : 'sine';
            osc.frequency.setValueAtTime(freqs[i], noteT);
            osc.frequency.exponentialRampToValueAtTime(freqs[i] * 0.9, noteT + 0.04);
            gain.gain.setValueAtTime(0.12, noteT);
            gain.gain.exponentialRampToValueAtTime(0.01, noteT + 0.06);
            osc.start(noteT);
            osc.stop(noteT + 0.06);
        }
    },

    dronePickup: () => {
        if (!audioCtx) return;
        // Softer, briefer version of abductionComplete jingle for drone harvests
        const t = audioCtx.currentTime;
        [400, 500, 600, 800].forEach((freq, i) => {
            const noteT = t + i * 0.06;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteT);
            gain.gain.setValueAtTime(0.15, noteT);
            gain.gain.exponentialRampToValueAtTime(0.01, noteT + 0.1);
            osc.start(noteT);
            osc.stop(noteT + 0.1);
        });
    },

    droneDestroy: (type) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const isHarvester = type === 'harvester';
        // R2D2 sad scream: rapid frequency warble descending into static
        const baseFreq = (isHarvester ? 700 : 500) + Math.random() * 300;
        const sweepEnd = 30 + Math.random() * 40;
        const dur = 0.2 + Math.random() * 0.1;
        // Main warbling scream - two detuned oscillators
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        const gain2 = audioCtx.createGain();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        // Fast wobble for that digital scream
        lfo.frequency.setValueAtTime(20 + Math.random() * 20, t);
        lfoGain.gain.setValueAtTime(40 + Math.random() * 60, t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(baseFreq, t);
        osc1.frequency.exponentialRampToValueAtTime(sweepEnd, t + dur);
        osc1.detune.setValueAtTime(Math.random() * 30, t);
        osc1.connect(gain1);
        gain1.gain.setValueAtTime(0.15, t);
        gain1.gain.exponentialRampToValueAtTime(0.01, t + dur);
        gain1.connect(audioCtx.destination);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(baseFreq * (0.97 + Math.random() * 0.06), t);
        osc2.frequency.exponentialRampToValueAtTime(sweepEnd * 1.5, t + dur);
        osc2.detune.setValueAtTime(-20 + Math.random() * -30, t);
        osc2.connect(gain2);
        gain2.gain.setValueAtTime(0.08, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + dur);
        gain2.connect(audioCtx.destination);
        osc1.start(t); osc2.start(t); lfo.start(t);
        osc1.stop(t + dur); osc2.stop(t + dur); lfo.stop(t + dur);
        // Random digital sputters (2-4 quick blips)
        const blipCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < blipCount; i++) {
            const blipT = t + dur * 0.3 + Math.random() * dur * 0.6;
            const blipFreq = 200 + Math.random() * 800;
            const blipDur = 0.02 + Math.random() * 0.03;
            const blip = audioCtx.createOscillator();
            const blipGain = audioCtx.createGain();
            blip.connect(blipGain);
            blipGain.connect(audioCtx.destination);
            blip.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
            blip.frequency.setValueAtTime(blipFreq, blipT);
            blip.detune.setValueAtTime((Math.random() - 0.5) * 80, blipT);
            blipGain.gain.setValueAtTime(0.08, blipT);
            blipGain.gain.exponentialRampToValueAtTime(0.01, blipT + blipDur);
            blip.start(blipT);
            blip.stop(blipT + blipDur);
        }
        // Noise burst for the boom
        const bufferSize = audioCtx.sampleRate * 0.25;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = audioCtx.createBufferSource();
        const noiseGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 + Math.random() * 200, t + 0.05);
        filter.frequency.exponentialRampToValueAtTime(80, t + 0.3);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noiseGain.gain.setValueAtTime(0.14, t + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        noise.start(t + 0.05);
    },

    dronePreExplode: () => {
        if (!audioCtx) return;
        // 5 beeps accelerating in speed and pitch, like a bomb timer
        const t = audioCtx.currentTime;
        const beepCount = 5;
        const startFreq = 800;
        const endFreq = 1600;
        const totalDuration = 0.6;
        let elapsed = 0;
        for (let i = 0; i < beepCount; i++) {
            const progress = i / (beepCount - 1);
            // Accelerating: gaps get shorter
            const gap = (1 - progress * 0.7) / beepCount * totalDuration;
            const freq = startFreq + (endFreq - startFreq) * progress;
            const beepLen = Math.max(0.03, 0.08 - progress * 0.04);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + elapsed);
            gain.gain.setValueAtTime(0.15 + progress * 0.1, t + elapsed);
            gain.gain.exponentialRampToValueAtTime(0.01, t + elapsed + beepLen);
            osc.start(t + elapsed);
            osc.stop(t + elapsed + beepLen);
            elapsed += gap;
        }
    },

    // Commander garbled alien speech - Charlie Brown parent meets robotic glitch
    commanderSpeechGarble: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const baseFreq = 120 + Math.random() * 80; // Low alien voice range
        const duration = 0.04 + Math.random() * 0.03;

        // Primary voice: muffled sawtooth "wah" with pitch wobble
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = Math.random() > 0.3 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * (0.8 + Math.random() * 0.6), t + duration);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400 + Math.random() * 600, t);
        filter.Q.setValueAtTime(2 + Math.random() * 4, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
        osc.start(t);
        osc.stop(t + duration);

        // Occasional robotic chirp overtone
        if (Math.random() > 0.6) {
            const chirp = audioCtx.createOscillator();
            const chirpGain = audioCtx.createGain();
            chirp.connect(chirpGain);
            chirpGain.connect(audioCtx.destination);
            chirp.type = 'square';
            chirp.frequency.setValueAtTime(baseFreq * 3 + Math.random() * 200, t);
            chirp.frequency.exponentialRampToValueAtTime(baseFreq * 2, t + duration * 0.5);
            chirpGain.gain.setValueAtTime(0.02, t);
            chirpGain.gain.exponentialRampToValueAtTime(0.01, t + duration * 0.5);
            chirp.start(t);
            chirp.stop(t + duration * 0.5);
        }
    },

    // HUD boot panel start - short CRT click/blip (square wave, 800Hz -> 200Hz, 50ms)
    // TNG-style panel activation: clean two-note ascending "boo-beep"
    bootPanelStart: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // First tone: warm low note
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, t);
        gain1.gain.setValueAtTime(0.07, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc1.start(t);
        osc1.stop(t + 0.08);
        // Second tone: ascending major third
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(554, t + 0.06);
        gain2.gain.setValueAtTime(0.0001, t);
        gain2.gain.setValueAtTime(0.06, t + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc2.start(t + 0.06);
        osc2.stop(t + 0.15);
    },

    // TNG-style system online: ascending three-note confirmation "bwee-boo-beep"
    bootPanelOnline: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const notes = [523, 659, 784]; // C5, E5, G5 - major triad ascending
        const dur = 0.07;
        for (let i = 0; i < 3; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], t + i * 0.06);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.setValueAtTime(0.06, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + dur + 0.04);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + dur + 0.04);
        }
    },

    // TNG-style data processing blip: soft clean sine bloop at random pleasant pitches
    bootDataChatter: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // Random note from a pentatonic-ish set for pleasant variety
        const pitches = [660, 784, 880, 988, 1047, 1175];
        const freq = pitches[Math.floor(Math.random() * pitches.length)];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
    },

    // Quick descending two-note "boop-bop" when something is not found (skip)
    bootMissileSkip: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;

        // First note: 600Hz, 50ms
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, t);
        gain1.gain.setValueAtTime(0.04, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc1.start(t);
        osc1.stop(t + 0.05);

        // Second note: 400Hz (lower), 50ms, starting 40ms after the first
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, t + 0.04);
        gain2.gain.setValueAtTime(0.04, t + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc2.start(t + 0.04);
        osc2.stop(t + 0.09);
    },

    // Positive confirmation chime: two-tone "bong-BING" doorbell-like sound
    bootAllOnline: () => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;

        // First tone: low, warm sine wave (E4 = 330Hz)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(330, t);
        gain1.gain.setValueAtTime(0.07, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc1.start(t);
        osc1.stop(t + 0.12);

        // Brief gap: 60ms silence between notes
        // Then second tone: high, bright sine wave (E5 = 660Hz, an octave up)
        const t2 = t + 0.18;  // 120ms + 60ms gap
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(660, t2);
        gain2.gain.setValueAtTime(0.08, t2);
        gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.5);  // 200ms attack + 300ms decay
        osc2.start(t2);
        osc2.stop(t2 + 0.5);
    },

    // Research countdown blip - escalating pitch as time runs out
    researchCountdownBlip: (secondsLeft) => {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        // Higher pitch as countdown gets lower
        const baseFreq = 600 + (5 - secondsLeft) * 150;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);

        // Double blip on last 2 seconds
        if (secondsLeft <= 2) {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(baseFreq * 1.5, t + 0.1);
            gain2.gain.setValueAtTime(0.06, t + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc2.start(t + 0.1);
            osc2.stop(t + 0.2);
        }
    }
};

// ============================================
// STAR FIELD
// ============================================

let stars = [];

function initStars() {
    stars = [];
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.7), // Only in sky portion
            size: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 3 + 1,
            twinkleOffset: Math.random() * Math.PI * 2,
            brightness: Math.random() * 0.5 + 0.5
        });
    }
}

function renderStars() {
    const time = Date.now() / 1000;
    for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// CANVAS SETUP
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

window.addEventListener('resize', resize);
resize();

// ============================================
// GAME STATE
// ============================================

let gameState = 'TITLE'; // TITLE, PLAYING, GAME_OVER, WAVE_TRANSITION, WAVE_SUMMARY, SHOP
let ufo = null;
let targets = [];
let tanks = [];
let projectiles = [];
let particles = [];

// Powerup state
let powerups = [];
let powerupSpawnTimer = 0;
let activePowerups = {
    rapid_abduct: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
    shield: { active: false, charges: 0, maxCharges: 0, stacks: 0 },
    energy_surge: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
    wide_beam: { active: false, timer: 0, maxTimer: 0, stacks: 0 }
};

// Scoring
let score = 0;
let highScore = parseInt(localStorage.getItem('alienAbductoramaHighScore')) || 0;
let combo = 0;
let ufoBucks = 0;
// Game session tracking for leaderboard
let gameStartTime = 0;
let activityPingSent = false; // Track if we've pinged activity this session
let leaderboard = [];
let leaderboardLoading = false;
let activityStats = null;
let changelogScrollOffset = 0;
let changelogPanelBounds = null; // { x, y, width, height } for hit testing
let changelogLastViewed = parseInt(localStorage.getItem('alienAbductoramaChangelogLastViewed')) || 0;
let leaderboardScrollOffset = 0;
let leaderboardPanelBounds = null; // { x, y, width, height } for hit testing
let submissionError = null;
let pendingScoreSubmission = null;
let highlightedEntryId = null; // Track player's newly submitted score for highlighting
let hasScrolledToHighlight = false; // Track if we've auto-scrolled to highlighted entry

// Captured at game over to avoid mutation before submission
let finalScore = 0;
let finalWave = 0;
let finalGameLength = 0;
let finalHealth = 0; // For HUD display after UFO is destroyed

// Name entry state
let nameEntryChars = ['A', 'A', 'A'];
let nameEntryPosition = 0;
let nameEntryComplete = false;
let newHighScoreRank = null;
let nameEntrySubmitBounds = null; // { x, y, width, height } for submit button click
let scoreSubmitting = false; // Guard against double submission

// Feedback state
let feedbackRatings = { enjoyment: 0, difficulty: 0, returnIntent: 0 };
let feedbackSuggestion = '';
let feedbackCursorPosition = 0;
let feedbackCursorVisible = true;
let feedbackCursorBlinkTimer = 0;
let feedbackSelectedRow = 0; // 0-2 for ratings, 3 for text, 4 for buttons
let feedbackSelectedButton = 0; // 0 = Submit, 1 = Skip
let feedbackSubmitting = false;
let feedbackError = null;
let feedbackButtonBounds = { submit: null, skip: null, playAgain: null };
let feedbackTextBoxBounds = null; // { x, y, width, height }
let feedbackStarBounds = []; // Array of { row, star, x, y, width, height }

// Feedback screen - suggestions browsing (right column)
let feedbackScreenSuggestions = null; // Suggestions loaded for the feedback screen
let feedbackScreenLoading = false;
let feedbackScreenScrollOffset = 0;
let feedbackScreenSuggestionBounds = []; // For upvote click detection on feedback screen
let feedbackScreenSortBounds = { recent: null, top: null };
let feedbackScreenSort = 'top'; // Default to 'top' so users see popular suggestions first
let feedbackUfoOffset = 0; // For UFO floating animation

// Separate submission states for ratings and suggestions
let ratingsSubmitted = false;
let ratingsSubmitting = false;
let suggestionSubmitting = false;
let suggestionSubmitted = false;
let suggestionError = null;
let feedbackSuggestionSubmitBounds = null; // Submit button for suggestions

// Title screen tabs
let titleTab = 'leaderboard'; // 'leaderboard', 'changelog', 'feedback'
let titleTabBounds = []; // Array of { tab, x, y, width, height }

// Feedback browse state (for title screen feedback tab)
let feedbackData = null;
let feedbackLoading = false;
let feedbackFetchError = null;
let feedbackSort = 'top'; // 'recent' or 'top' - default to top
let feedbackScrollOffset = 0;
let feedbackSuggestionBounds = []; // For upvote click detection
let feedbackSortBounds = { recent: null, top: null };
let feedbackMaxVisible = 5; // Updated during render - how many suggestions fit in the list
let feedbackTotalContentHeight = 0; // Total height of all suggestion items (for scrolling)
let feedbackListHeight = 0; // Visible list height (for scrolling)
let hasPlayedThisSession = false; // Track if user has played a game this session
let titleFeedbackSubmitBounds = null; // Bounds for the submit feedback button on title screen
let titleFeedbackSubmitted = false; // Track if feedback was submitted from title screen

// Feature request modal state
let featureModalOpen = false;
let featureModalText = '';
let featureModalCursorPosition = 0;
let featureModalSubmitting = false;
let featureModalError = null;
let featureModalButtonBounds = { submit: null, cancel: null };

// Harvest counter - tracks how many of each target type has been abducted
const TARGET_TYPES = ['human', 'cow', 'sheep', 'cat', 'dog', 'tank'];
let harvestCount = {
    human: 0,
    cow: 0,
    sheep: 0,
    cat: 0,
    dog: 0,
    tank: 0
};

// Bounce animation for harvest icons when a target is captured
let harvestBounce = {
    human: 0,
    cow: 0,
    sheep: 0,
    cat: 0,
    dog: 0,
    tank: 0
};

// Wave system
let wave = 1;
let waveTimer = CONFIG.WAVE_DURATION;
let waveTransitionTimer = 0;
let lastTimerWarningSecond = -1; // Track when we last played timer warning
let lastShopCountdownSecond = -1; // Track shop timer countdown blips
let waveStats = createWaveStats();
let waveSummary = null;
let waveSummaryState = null;
let waveHistory = []; // Per-wave history for analytics graph

// Warp juke input tracking
let leftTapHistory = [];
let rightTapHistory = [];

// Shop state
let shopTimer = 0;
let shopCheatBuffer = '';
let techCheatActive = false;
let selectedShopItem = 0;
let shopItemBounds = []; // For click detection on shop items
let shopButtonBounds = { done: null, cancel: null, checkout: null, empty: null }; // For click detection on buttons
let shopCart = []; // Items in shopping cart (array of item ids)
let shopNewItems = new Set(); // Items newly unlocked (show NEW badge)
let shopCartBounds = []; // For click detection on cart items (to remove)
let shopMouseX = 0;
let shopMouseY = 0;
let shopState = {
    activeTab: 'weapons',       // 'maintenance', 'weapons', 'systems'
    hoveredItem: null,           // item id being hovered
    hoveredNode: null,           // tech tree node id being hovered
    hoveredQueueBadge: null,     // node id whose queue badge is hovered
    scrollOffset: 0,             // vertical scroll for item list
    scrollToSection: null,       // section to scroll to (from nav buttons)
    techNodeBounds: [],          // click bounds for tech tree nodes
    techQueueBounds: [],         // click bounds for queued research items
    tabBounds: [],               // click bounds for tabs
    cartScrollOffset: 0,         // cart scroll position
    researchIdleTimer: 0,        // seconds since player last queued research (for urgency flashing)
};

// Player inventory (persistent upgrades purchased in shop)
let playerInventory = {
    maxEnergyBonus: 0,
    speedBonus: 0,
    energyCells: 0,  // Revive charges - prevents game over
    bombs: 0,        // Bomb count
    maxBombs: 0,     // Max bomb capacity
    bombRechargeTimers: [],
    bombReadyBounceTimer: 0,
    bombReadyBounceIndex: -1,
    energyRechargeBonus: 0
};

// === EXPANSION: Bio-Matter & Quota ===
let bioMatter = 0;
let quotaTarget = 0;
let quotaProgress = 0;
let consecutiveQuotaMisses = 0;

// === EXPANSION: Tech Tree State ===
let techTree = {
    researched: new Set(),  // Set of tech node IDs that are complete
    queue: [],              // Array of tech node IDs queued for research
    activeResearch: null,   // { nodeId, timeRemaining, totalTime } or null
};

// === EXPANSION: Tech Flags (set by research completion) ===
let techFlags = {
    beamConduit: false,
    energyEfficiency: false,
    powerBroadcast: false,
    reactorAmplifier: false,
    selfSustainingGrid: false,
    droneUplink: false,
    harvesterCoordinator: false,
    attackCoordinator: false,
    fleetExpansion: false,
    autonomousSwarm: false,
    thrusterBoost: false,
    droneArmor: false,
    shieldTransfer: false,
    fleetResilience: false,
    swarmShield: false
};


// === EXPANSION: Missile Swarm State ===
let missileGroups = [];      // Array of { ready: bool, rechargeTimer: float, index: int }
let missileGroupCount = 0;   // How many groups (driven by upgrades)
let missileDamage = 0;     // Upgrade tracking
let playerMissiles = [];   // Active missiles in the world
let missileTargetReticles = []; // Brief targeting reticle visuals
let missileUnlocked = false; // Whether missile swarm is purchased
let claimedThreats = new Set(); // Per-frame threat claiming for missile coordination

function getMissileMaxAmmo() {
    return missileGroupCount * CONFIG.MISSILE_GROUP_SIZE;
}
function getMissileReadyCount() {
    return missileGroups.filter(g => g.ready).length * CONFIG.MISSILE_GROUP_SIZE;
}
function getReadyGroupCount() {
    return missileGroups.filter(g => g.ready).length;
}

// === EXPANSION: Drone State ===
let activeDrones = [];
let activeCoordinators = [];
let droneSlots = 0;
let harvesterUnlocked = false;
let battleDroneUnlocked = false;
let droneCooldownTimer = 0;
const DRONE_DEPLOY_COOLDOWN = 0.5; // seconds between deployments
let autoDeployCooldown = 0; // DC5 Autonomous Swarm auto-deploy timer

// === EXPANSION: Commander Dialogue System ===
const COMMANDER_DIALOGUES = {
    quotaMet: [
        "ACCEPTABLE. The Galactic Specimen Bureau demands MORE next cycle. Do not disappoint me again.",
        "Barely adequate. My predecessor was recycled for results like these.",
        "The Board has noted your... mediocrity. Proceed."
    ],
    quotaExceeded: [
        "Hmm. Perhaps you are not entirely worthless.",
        "IMPRESSIVE. I shall... consider mentioning this in my report.",
        "Outstanding harvest! The Board sends their... lack of displeasure."
    ],
    quotaMissed: [
        "YOU INCOMPETENT DISC-JOCKEY! The Board will hear of this! DO YOU KNOW HOW MUCH SPICE THIS OPERATION COSTS?!",
        "UNACCEPTABLE! I am filing a formal complaint with the Galactic HR Department!",
        "My TENTACLES are LITERALLY SHAKING with rage right now!"
    ],
    shopIdle: [
        "STOP BROWSING AND BUY SOMETHING! We're losing specimens by the SECOND!",
        "This isn't a MUSEUM! SPEND your bucks or LAUNCH!",
        "Every second you waste, another specimen ESCAPES!",
        "I didn't authorize this shopping spree! MOVE IT!"
    ],
    // Contextual guidance: keyed by condition, picked based on game state
    shopGuidance: {
        noHarvester: [
            "You're MANUALLY beaming targets?! Get a HARVESTER DRONE, for spice's sake!",
            "My INTERN could tell you: BUY HARVESTERS! Why are you abducting by hand like a PRIMITIVE?!",
            "A harvester drone automates collection. STOP doing this the hard way!"
        ],
        noBombs: [
            "Heavy tanks giving you trouble? BOMBS clear clusters. Check the weapons tab!",
            "A well-placed BOMB takes out everything nearby. Just saying."
        ],
        noShields: [
            "You have ZERO revive charges?! Buy ENERGY CELLS before you get yourself killed!",
            "One bad hit and it's GAME OVER. Get some ENERGY CELLS for insurance!"
        ],
        noResearch: [
            "The RESEARCH TREE is right there! Queue some upgrades - they research DURING waves!",
            "You have biomatter sitting there doing NOTHING. Queue some RESEARCH!",
            "See those upgrade nodes on the right? CLICK ONE. They research while you play!"
        ],
        moreHarvesters: [
            "Research DRONE UPLINK in the tech tree for more drone slots, commander!",
            "The Drone Command track has upgrades for extra drone slots. Invest that biomatter!"
        ],
        quotaFailed: [
            "You MISSED QUOTA last wave! Maybe if you actually UPGRADED your equipment you'd keep up!",
            "The Board is NOT happy with your numbers. Have you considered buying ANYTHING useful?!",
            "You're falling behind! Upgrades exist for a REASON! SPEND your bucks and RESEARCH!",
            "At this rate they'll replace you with a ROOMBA! Upgrade your gear or get recycled!"
        ],
        quotaBarely: [
            "You BARELY scraped by last wave. Upgrades would make that a LOT easier, you know.",
            "Quota met by a HAIR. If you'd invest in some upgrades you wouldn't be sweating every wave!",
            "Cutting it close out there. Better equipment means better numbers. UPGRADE!"
        ],
        noUpgradesAtAll: [
            "You haven't bought a SINGLE upgrade?! What are you SAVING for, retirement?!",
            "ZERO upgrades purchased! The Board is questioning your SANITY!",
            "You're flying a STOCK UFO into combat! This isn't a budget operation — UPGRADE!"
        ],
        generic: [
            "Upgrade your loadout or LAUNCH. The Board is watching!",
            "Remember: upgrades carry between waves. INVEST in your future!",
            "The longer you wait, the harder the next wave gets. PREPARE yourself!"
        ]
    }
};

let commanderState = {
    currentDialogue: '',
    emotion: 'neutral', // 'neutral', 'angry', 'pleased', 'furious'
    animTimer: 0,
    shopCommentTimer: 0,
    shopCommentInterval: 8,
    typewriterIndex: 0,
    typewriterTimer: 0,
    entranceTimer: 0,
    visible: false
};

// === EXPANSION: Bomb Upgrade Tracking ===
let bombBlastTier = 0;
let bombDamageTier = 0;

// Active bombs in the world
let bombs = [];

let titleCheatBuffer = '';

// Title screen UFO animation state
let titleUfo = {
    x: 0,
    y: 0,
    baseY: 0,
    vx: 1.5,
    hoverPhase: 0,
    beamActive: false,
    beamTimer: 0,
    beamRotation: 0
};

// Name entry screen UFO animation state (celebratory!)
let nameEntryUfo = {
    x: 0,
    y: 0,
    baseY: 0,
    hoverPhase: 0,
    pulsePhase: 0,
    glowIntensity: 0,
    initialized: false
};

// Name entry celebration state
let celebrationTimer = 0;
let confettiSpawnTimer = 0;

// Title screen humans for beam animation
let titleHumans = [];

// Title animation state
let titleAnimPhase = 0;

// ============================================
// INPUT HANDLING
// ============================================

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Initialize audio on first user interaction
    if (!audioInitialized) {
        initAudio();
    }

    // Handle feature modal input
    if (featureModalOpen) {
        e.preventDefault();

        if (e.key === 'Escape') {
            closeFeatureModal();
        } else if (e.key === 'Enter' && !e.shiftKey) {
            submitFeatureRequest();
        } else if (e.key === 'Backspace') {
            if (featureModalCursorPosition > 0) {
                featureModalText = featureModalText.slice(0, featureModalCursorPosition - 1) + featureModalText.slice(featureModalCursorPosition);
                featureModalCursorPosition--;
            }
        } else if (e.key === 'Delete') {
            featureModalText = featureModalText.slice(0, featureModalCursorPosition) + featureModalText.slice(featureModalCursorPosition + 1);
        } else if (e.key === 'ArrowLeft') {
            featureModalCursorPosition = Math.max(0, featureModalCursorPosition - 1);
        } else if (e.key === 'ArrowRight') {
            featureModalCursorPosition = Math.min(featureModalText.length, featureModalCursorPosition + 1);
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            // Insert character at cursor position
            featureModalText = featureModalText.slice(0, featureModalCursorPosition) + e.key + featureModalText.slice(featureModalCursorPosition);
            featureModalCursorPosition++;
        }
        return;
    }

    // Handle name entry input
    if (gameState === 'NAME_ENTRY') {
        // Prevent arrow keys from scrolling page
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === 'ArrowUp') {
            // Next letter (A-Z wrap)
            const code = nameEntryChars[nameEntryPosition].charCodeAt(0);
            nameEntryChars[nameEntryPosition] = String.fromCharCode(code === 90 ? 65 : code + 1);
        } else if (e.key === 'ArrowDown') {
            // Previous letter
            const code = nameEntryChars[nameEntryPosition].charCodeAt(0);
            nameEntryChars[nameEntryPosition] = String.fromCharCode(code === 65 ? 90 : code - 1);
        } else if (e.key === 'ArrowLeft') {
            nameEntryPosition = Math.max(0, nameEntryPosition - 1);
        } else if (e.key === 'ArrowRight') {
            nameEntryPosition = Math.min(2, nameEntryPosition + 1);
        } else if (e.key === 'Enter') {
            if (scoreSubmitting) return; // Prevent double submission
            scoreSubmitting = true;
            const name = nameEntryChars.join('');
            submitScore(name).then(rank => {
                newHighScoreRank = rank;
                nameEntryUfo.initialized = false;  // Reset for next time
                resetFeedbackState();
                gameState = 'FEEDBACK';
                scoreSubmitting = false;
            });
        } else if (/^[A-Za-z]$/.test(e.key)) {
            // Direct letter input
            nameEntryChars[nameEntryPosition] = e.key.toUpperCase();
            nameEntryPosition = Math.min(2, nameEntryPosition + 1);
        }
        return;
    }

    // Handle feedback input
    if (gameState === 'FEEDBACK') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
            e.preventDefault();
        }

        if (feedbackSubmitting) return;

        const ratingKeys = ['enjoyment', 'difficulty', 'returnIntent'];

        if (e.key === 'ArrowUp') {
            feedbackSelectedRow = Math.max(0, feedbackSelectedRow - 1);
        } else if (e.key === 'ArrowDown') {
            feedbackSelectedRow = Math.min(4, feedbackSelectedRow + 1);
        } else if (e.key === 'ArrowLeft') {
            if (feedbackSelectedRow < 3) {
                // Rating row - decrease star
                const key = ratingKeys[feedbackSelectedRow];
                feedbackRatings[key] = Math.max(0, feedbackRatings[key] - 1);
            } else if (feedbackSelectedRow === 3) {
                // Text field - move cursor left
                feedbackCursorPosition = Math.max(0, feedbackCursorPosition - 1);
            } else {
                // Button row
                feedbackSelectedButton = 0;
            }
        } else if (e.key === 'ArrowRight') {
            if (feedbackSelectedRow < 3) {
                // Rating row - increase star
                const key = ratingKeys[feedbackSelectedRow];
                feedbackRatings[key] = Math.min(5, feedbackRatings[key] + 1);
            } else if (feedbackSelectedRow === 3) {
                // Text field - move cursor right
                feedbackCursorPosition = Math.min(feedbackSuggestion.length, feedbackCursorPosition + 1);
            } else {
                // Button row
                feedbackSelectedButton = 1;
            }
        } else if (e.key === 'Enter') {
            if (feedbackSelectedRow === 4) {
                if (feedbackSelectedButton === 0) {
                    submitFeedback();
                } else {
                    skipFeedback();
                }
            } else if (feedbackSelectedRow < 3) {
                // Move to next row on Enter
                feedbackSelectedRow++;
            } else {
                // From text field, move to buttons
                feedbackSelectedRow = 4;
            }
        } else if (e.key === 'Escape') {
            skipFeedback();
        } else if (e.key === 'Tab') {
            // Tab cycles through rows
            feedbackSelectedRow = (feedbackSelectedRow + 1) % 5;
        } else if (feedbackSelectedRow === 3) {
            // Text input for suggestion field
            if (e.key === 'Backspace') {
                if (feedbackCursorPosition > 0) {
                    feedbackSuggestion = feedbackSuggestion.slice(0, feedbackCursorPosition - 1) +
                                         feedbackSuggestion.slice(feedbackCursorPosition);
                    feedbackCursorPosition--;
                }
            } else if (e.key === 'Delete') {
                feedbackSuggestion = feedbackSuggestion.slice(0, feedbackCursorPosition) +
                                     feedbackSuggestion.slice(feedbackCursorPosition + 1);
            } else if (e.key.length === 1 && feedbackSuggestion.length < 300) {
                // Insert character at cursor
                feedbackSuggestion = feedbackSuggestion.slice(0, feedbackCursorPosition) +
                                     e.key +
                                     feedbackSuggestion.slice(feedbackCursorPosition);
                feedbackCursorPosition++;
            }
        } else if (feedbackSelectedRow < 3 && /^[1-5]$/.test(e.key)) {
            // Number keys 1-5 set rating directly
            const key = ratingKeys[feedbackSelectedRow];
            feedbackRatings[key] = parseInt(e.key);
        }
        return;
    }

    // Handle shop input
    if (gameState === 'SHOP') {
        if (['Enter', 'Escape', 'Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
            e.preventDefault();
        }

        if (e.code === 'Escape') {
            // Empty cart
            emptyCart();
        } else if (e.code === 'Enter') {
            // Checkout and launch
            checkoutCart();
            SFX.shopStartWave && SFX.shopStartWave();
            SFX.stopShopMusic && SFX.stopShopMusic();
            waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
            gameState = 'WAVE_TRANSITION';
        }

        // "TECH" cheat code detection
        if (e.key.length === 1 && !techCheatActive) {
            shopCheatBuffer += e.key.toLowerCase();
            if (shopCheatBuffer.length > 4) shopCheatBuffer = shopCheatBuffer.slice(-4);
            if (shopCheatBuffer.endsWith('tech')) {
                techCheatActive = true;
                shopCheatBuffer = '';
                createFloatingText(canvas.width / 2, canvas.height / 2, 'TECH UNLOCKED', '#0ff', { fontSize: 28, duration: 2 });
                SFX.researchComplete && SFX.researchComplete();
                screenShake = 0.3;
            }
        }

        return;
    }

    // Handle wave summary input (unskippable)
    if (gameState === 'WAVE_SUMMARY') {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
        }
        return;
    }

    // Handle bomb drop during gameplay (Z or B key)
    if (gameState === 'PLAYING' && (e.code === 'KeyZ' || e.code === 'KeyB')) {
        dropBomb();
    }

    // Handle missile group during gameplay (X or M key)
    if (gameState === 'PLAYING' && (e.code === 'KeyX' || e.code === 'KeyM')) {
        fireMissileGroup();
    }

    // Handle drone deployment (A = battle drone, S/H = harvester)
    if (gameState === 'PLAYING' && e.code === 'KeyA' && !e.repeat) {
        deployBattleDrone();
    }
    if (gameState === 'PLAYING' && (e.code === 'KeyS' || e.code === 'KeyH') && !e.repeat) {
        deployHarvesterDrone();
    }

    // Handle warp juke (double-tap left/right arrow OR shift+direction)
    // Only count actual key presses, not key repeats from holding
    if (gameState === 'PLAYING' && !e.repeat) {
        const now = Date.now();
        const tapWindow = CONFIG.WARP_JUKE_DOUBLE_TAP_TIME * 1000;

        if (e.code === 'ArrowLeft') {
            // Shift+direction for instant warp
            if (e.shiftKey) {
                triggerWarpJuke(-1);
            } else {
                // Add current tap and filter out old taps
                leftTapHistory.push(now);
                leftTapHistory = leftTapHistory.filter(t => now - t < tapWindow);
                // Check for double-tap (2 taps within window)
                if (leftTapHistory.length >= 2) {
                    triggerWarpJuke(-1); // Warp left
                    leftTapHistory = []; // Reset after successful warp
                }
            }
        } else if (e.code === 'ArrowRight') {
            // Shift+direction for instant warp
            if (e.shiftKey) {
                triggerWarpJuke(1);
            } else {
                // Add current tap and filter out old taps
                rightTapHistory.push(now);
                rightTapHistory = rightTapHistory.filter(t => now - t < tapWindow);
                // Check for double-tap (2 taps within window)
                if (rightTapHistory.length >= 2) {
                    triggerWarpJuke(1); // Warp right
                    rightTapHistory = []; // Reset after successful warp
                }
            }
        }
    }

    // Handle game state transitions
    if (gameState === 'TITLE') {
        if (e.code === 'Space') {
            startGame();
        }

        // Tab key cycles through title screen tabs
        if (e.key === 'Tab') {
            e.preventDefault();
            const tabs = ['leaderboard', 'changelog', 'feedback'];
            const currentIndex = tabs.indexOf(titleTab);
            titleTab = tabs[(currentIndex + 1) % tabs.length];
            feedbackScrollOffset = 0;
            if (titleTab === 'feedback' && !feedbackData && !feedbackLoading) {
                fetchFeedback();
            }
        }

        // Easter egg: W + number + Enter to warp to a wave's shop
        if (e.code === 'KeyW' && !e.repeat) {
            titleCheatBuffer = 'W';
        } else if (titleCheatBuffer.startsWith('W') && titleCheatBuffer.length < 4 && e.key >= '0' && e.key <= '9') {
            titleCheatBuffer += e.key;
        } else if (e.code === 'Enter' && titleCheatBuffer.length >= 2 && titleCheatBuffer.startsWith('W')) {
            const warpWave = parseInt(titleCheatBuffer.substring(1), 10);
            if (warpWave >= 1 && warpWave <= 99) {
                startGame();
                wave = warpWave;
                cleanupTutorial(); // Tutorial was init'd for wave 1, clean up since we're warping
                ufoBucks = 5000;
                bioMatter = 100;
                quotaTarget = getQuotaTarget(wave);
                quotaProgress = 0;
                // Go straight to shop
                shopTimer = CONFIG.SHOP_DURATION;
                selectedShopItem = 0;
                shopCart = [];
                shopState.activeTab = 'weapons';
                shopState.hoveredItem = null;
                shopState.hoveredNode = null;
                shopState.scrollOffset = 0;
                shopState.scrollToSection = null;
                shopState.cartScrollOffset = 0;
                shopState.techNodeBounds = [];
                shopState.techQueueBounds = [];
                shopState.tabBounds = [];
                gameState = 'SHOP';
                SFX.startShopMusic && SFX.startShopMusic();
                createFloatingText(canvas.width / 2, canvas.height / 2, `WARP TO WAVE ${warpWave}!`, '#0ff');
            }
            titleCheatBuffer = '';
        } else if (e.code !== 'ShiftLeft' && e.code !== 'ShiftRight') {
            titleCheatBuffer = '';
        }

    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Changelog and feedback panel scroll support
canvas.addEventListener('wheel', (e) => {
    // Feedback screen (post-game) suggestions scrolling
    if (gameState === 'FEEDBACK' && feedbackScreenSuggestions) {
        const suggestions = feedbackScreenSuggestions.suggestions || [];
        const effectiveItemHeight = 50; // 44px item + 6px gap
        const visibleItems = 4;
        const maxScroll = Math.max(0, (suggestions.length - visibleItems) * effectiveItemHeight);
        feedbackScreenScrollOffset = Math.max(0, Math.min(maxScroll, feedbackScreenScrollOffset + e.deltaY));
        e.preventDefault();
        return;
    }

    // Shop item list scrolling
    if (gameState === 'SHOP') {
        shopState.scrollOffset = Math.max(0, shopState.scrollOffset + e.deltaY * 0.5);
        e.preventDefault();
        return;
    }

    if (gameState !== 'TITLE') return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Feedback tab scrolling
    if (titleTab === 'feedback' && feedbackData) {
        const maxScroll = Math.max(0, feedbackTotalContentHeight - feedbackListHeight);
        feedbackScrollOffset = Math.max(0, Math.min(maxScroll, feedbackScrollOffset + e.deltaY));
        e.preventDefault();
        return;
    }

    // Changelog panel scrolling
    if (titleTab === 'changelog' && changelogPanelBounds) {
        const b = changelogPanelBounds;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            e.preventDefault();
            changelogScrollOffset += e.deltaY * 0.5;
            // Clamp will happen in render function when we know content height
        }
    }

    // Leaderboard panel scrolling
    if (titleTab === 'leaderboard' && leaderboardPanelBounds) {
        const b = leaderboardPanelBounds;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            e.preventDefault();
            leaderboardScrollOffset += e.deltaY * 0.5;
            // Clamp will happen in render function when we know content height
        }
    }
}, { passive: false });

// Mouse click support for Shop, Feedback, and Title screens
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Handle feature modal clicks
    if (featureModalOpen) {
        // Cancel button
        if (featureModalButtonBounds.cancel) {
            const b = featureModalButtonBounds.cancel;
            if (mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= b.y + b.height) {
                closeFeatureModal();
                return;
            }
        }
        // Submit button
        if (featureModalButtonBounds.submit) {
            const b = featureModalButtonBounds.submit;
            if (mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= b.y + b.height) {
                submitFeatureRequest();
                return;
            }
        }
        // Click anywhere else on the modal does nothing (blocks interaction with background)
        return;
    }

    // Handle name entry submit button click
    if (gameState === 'NAME_ENTRY' && nameEntrySubmitBounds) {
        const b = nameEntrySubmitBounds;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            if (scoreSubmitting) return; // Prevent double submission
            scoreSubmitting = true;
            const name = nameEntryChars.join('');
            submitScore(name).then(rank => {
                newHighScoreRank = rank;
                nameEntryUfo.initialized = false;
                resetFeedbackState();
                gameState = 'FEEDBACK';
                scoreSubmitting = false;
            });
            return;
        }
    }

    // Handle feedback clicks
    if (gameState === 'FEEDBACK') {
        // Check star clicks
        if (!ratingsSubmitted && !ratingsSubmitting) {
            for (const bound of feedbackStarBounds) {
                if (mouseX >= bound.x && mouseX <= bound.x + bound.width &&
                    mouseY >= bound.y && mouseY <= bound.y + bound.height) {
                    const keys = ['enjoyment', 'difficulty', 'returnIntent'];
                    feedbackRatings[keys[bound.row]] = bound.star;
                    feedbackSelectedRow = bound.row;
                    // Auto-submit when all 3 dimensions are rated
                    if (feedbackRatings.enjoyment > 0 && feedbackRatings.difficulty > 0 && feedbackRatings.returnIntent > 0) {
                        submitRatingsOnly();
                    }
                    return;
                }
            }
        }

        // Check Play Again button clicks
        if (feedbackButtonBounds.playAgain) {
            const b = feedbackButtonBounds.playAgain;
            if (mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= b.y + b.height) {
                playAgainFromFeedback();
                return;
            }
        }

        // Check Main Menu button clicks
        if (feedbackButtonBounds.skip) {
            const b = feedbackButtonBounds.skip;
            if (mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= b.y + b.height) {
                skipFeedback();
                return;
            }
        }

        return;
    }

    // Title screen tab clicks
    if (gameState === 'TITLE') {
        // Check tab clicks
        for (const bound of titleTabBounds) {
            if (mouseX >= bound.x && mouseX <= bound.x + bound.width &&
                mouseY >= bound.y && mouseY <= bound.y + bound.height) {
                if (titleTab !== bound.tab) {
                    titleTab = bound.tab;
                    feedbackScrollOffset = 0;
                    if (bound.tab === 'feedback' && !feedbackData && !feedbackLoading) {
                        fetchFeedback();
                    }
                    if (bound.tab === 'changelog') {
                        // Mark changelog as viewed - store current time
                        changelogLastViewed = Date.now();
                        localStorage.setItem('alienAbductoramaChangelogLastViewed', changelogLastViewed);
                    }
                }
                return;
            }
        }

        // Feedback tab interactions
        if (titleTab === 'feedback' && feedbackData) {
            // Submit feedback button click
            if (titleFeedbackSubmitBounds && !titleFeedbackSubmitted) {
                const b = titleFeedbackSubmitBounds;
                if (mouseX >= b.x && mouseX <= b.x + b.width &&
                    mouseY >= b.y && mouseY <= b.y + b.height) {
                    handleTitleFeedbackSubmit();
                    return;
                }
            }

            // Upvote clicks
            for (const bound of feedbackSuggestionBounds) {
                if (mouseX >= bound.x && mouseX <= bound.x + bound.width &&
                    mouseY >= bound.y && mouseY <= bound.y + bound.height) {
                    if (!bound.hasVoted) {
                        upvoteSuggestion(bound.id);
                    }
                    return;
                }
            }
        }
        return;
    }

    // Handle shop clicks
    if (gameState !== 'SHOP') return;

    // Check if clicked on a shop item (adds to cart)
    for (let i = 0; i < shopItemBounds.length; i++) {
        const b = shopItemBounds[i];
        if (b && mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            shopAddToCart(b.itemId);
            return;
        }
    }

    // Check if clicked on cart item (removes from cart)
    for (let i = 0; i < shopCartBounds.length; i++) {
        const b = shopCartBounds[i];
        if (b && mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            removeFromCart(i);
            return;
        }
    }

    // Check if clicked Checkout button
    if (shopButtonBounds.checkout) {
        const b = shopButtonBounds.checkout;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            checkoutCart();
            return;
        }
    }

    // Check if clicked Empty Cart button
    if (shopButtonBounds.empty) {
        const b = shopButtonBounds.empty;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            emptyCart();
            return;
        }
    }

    // Check if clicked Done/Launch button
    if (shopButtonBounds.done) {
        const b = shopButtonBounds.done;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            checkoutCart(); // Auto-checkout when done
            SFX.shopStartWave && SFX.shopStartWave();
            SFX.stopShopMusic && SFX.stopShopMusic();
            waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
            gameState = 'WAVE_TRANSITION';
            return;
        }
    }

    // Check queue badge clicks first (cancel research)
    for (let i = 0; i < shopState.techQueueBounds.length; i++) {
        const b = shopState.techQueueBounds[i];
        if (b && mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            if (cancelResearch(b.nodeId)) {
                SFX.powerupCollect && SFX.powerupCollect();
                createFloatingText(mouseX, mouseY - 20, 'CANCELLED', '#f80');
            }
            return;
        }
    }

    // Check tech tree node clicks
    for (let i = 0; i < shopState.techNodeBounds.length; i++) {
        const b = shopState.techNodeBounds[i];
        if (b && mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            // Tech cheat: instantly activate any node
            if (techCheatActive && !techTree.researched.has(b.nodeId)) {
                // Cancel if it was queued or active
                cancelResearch(b.nodeId);
                completeResearch(b.nodeId);
                createFloatingText(mouseX, mouseY - 20, 'ACTIVATED!', '#0ff');
                return;
            }
            // If already queued or active, toggle it off
            const isQueued = techTree.queue.includes(b.nodeId);
            const isActiveNode = techTree.activeResearch && techTree.activeResearch.nodeId === b.nodeId;
            if (isQueued || isActiveNode) {
                if (cancelResearch(b.nodeId)) {
                    SFX.powerupCollect && SFX.powerupCollect();
                    createFloatingText(mouseX, mouseY - 20, 'CANCELLED', '#f80');
                }
            } else if (canResearchNode(b.nodeId)) {
                queueResearch(b.nodeId);
                SFX.powerupCollect && SFX.powerupCollect();
                createFloatingText(mouseX, mouseY - 20, 'QUEUED!', '#0f0');
            } else if (techTree.researched.has(b.nodeId)) {
                createFloatingText(mouseX, mouseY - 20, 'RESEARCHED', '#888');
            } else {
                SFX.error && SFX.error();
                createFloatingText(mouseX, mouseY - 20, 'LOCKED', '#f44');
            }
            return;
        }
    }
});

// Mouse move tracking for shop hover effects
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    shopMouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    shopMouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

// ============================================
// ASSET LOADING
// ============================================

const images = {};
const imageSources = {
    ufo: 'assets/ufo.png',
    human: 'assets/human.png',
    cow: 'assets/cow.png',
    sheep: 'assets/sheep.png',
    cat: 'assets/cat.png',
    dog: 'assets/dog.png',
    tank: 'assets/tanks.png'
};

let imagesLoaded = 0;
const totalImages = Object.keys(imageSources).length;

function loadImages() {
    for (const [name, src] of Object.entries(imageSources)) {
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            imagesLoaded++;
        };
        img.src = src;
        images[name] = img;
    }
}

loadImages();

// ============================================
// ANIMATED SPRITE SYSTEM
// ============================================

// Stores arrays of Image objects keyed by asset name
// e.g. animationFrames['human'] = [Image, Image, ...]
const animationFrames = {};
let animationManifestLoaded = false;

// Animation speed in frames per second
const ANIMATION_FPS = 10;

// When set, animations freeze at this timestamp
let animationPausedAt = null;

async function loadAnimationFrames() {
    try {
        const response = await fetch('assets/sprites-manifest.json');
        if (!response.ok) {
            console.warn('No sprites manifest found, skipping animation loading');
            animationManifestLoaded = true;
            return;
        }
        const manifest = await response.json();

        const loadPromises = [];

        for (const [name, framePaths] of Object.entries(manifest)) {
            animationFrames[name] = new Array(framePaths.length);

            framePaths.forEach((src, index) => {
                const img = new Image();
                const promise = new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = () => {
                        console.warn(`Failed to load animation frame: ${src}`);
                        resolve();
                    };
                });
                img.src = src;
                animationFrames[name][index] = img;
                loadPromises.push(promise);
            });
        }

        await Promise.all(loadPromises);
        console.log('Animation frames loaded:', Object.keys(animationFrames).map(k => `${k}(${animationFrames[k].length})`).join(', '));
    } catch (e) {
        console.warn('Could not load animation frames:', e);
    }
    animationManifestLoaded = true;
}

loadAnimationFrames();

// Returns the correct frame Image for an animated asset, or the static
// image if no animation exists.  `timeOffset` (in ms) lets each instance
// start at a different point in the cycle so they don't all walk in sync.
function getAssetImage(type, timeOffset) {
    const frames = animationFrames[type];
    if (frames && frames.length > 0) {
        const now = animationPausedAt !== null ? animationPausedAt : Date.now();
        const elapsed = (now + (timeOffset || 0)) / 1000;
        const frameIndex = Math.floor(elapsed * ANIMATION_FPS) % frames.length;
        const frame = frames[frameIndex];
        if (frame && frame.complete && frame.naturalWidth > 0) {
            return frame;
        }
    }
    // Fallback to static image
    return images[type];
}

// ============================================
// TARGET CLASS
// ============================================

class Target {
    constructor(type, x) {
        this.type = type;
        const config = CONFIG.TARGETS[type];
        this.points = config.points;
        this.weight = config.weight;
        this.abductionTime = config.weight * CONFIG.TARGET_WEIGHT_MULTIPLIER;

        // Dimensions based on type (scaled up 1.5x)
        this.dimensions = {
            human: { width: 60, height: 90 },
            cow: { width: 90, height: 60 },
            sheep: { width: 75, height: 52 },
            cat: { width: 45, height: 38 },
            dog: { width: 60, height: 45 }
        };

        this.width = this.dimensions[type].width;
        this.height = this.dimensions[type].height;

        // Position (on ground)
        this.x = x;
        this.groundY = canvas.height - 60 - this.height; // Ground is 60px high
        this.y = this.groundY;

        // Movement
        this.wanderDirection = Math.random() < 0.5 ? -1 : 1;
        this.wanderTimer = Math.random() * 3 + 1; // 1-4 seconds before direction change

        // Flee behavior
        this.fleeing = false;
        this.fleeDelay = CONFIG.TARGET_AWARENESS[type];
        this.fleeTimer = 0;

        // Abduction state
        this.beingAbducted = false;
        this.abductionProgress = 0;

        // Falling state (when dropped from beam)
        this.falling = false;
        this.vy = 0; // Vertical velocity

        // Animation offset so targets don't animate in sync
        this.animationOffset = Math.random() * 10000;

        // Harvest drone effects
        this.harvestShake = 0;
        this.harvestShrink = 0;

        // Lifetime
        this.lifetime = CONFIG.TARGET_LIFETIME;
        this.alive = true;
    }

    update(dt, beamActive, beamX) {
        if (!this.alive) return;

        // If being abducted, rise toward UFO (skip lifetime check)
        if (this.beingAbducted) {
            // If UFO was destroyed, drop the target
            if (!ufo) {
                this.beingAbducted = false;
                this.abductionProgress = 0;
                this.falling = true;
                this.vy = 0;
                return;
            }

            // Rise animation - move toward UFO center (both horizontally and vertically)
            const rapidMultiplier = activePowerups.rapid_abduct.active ? CONFIG.POWERUPS.rapid_abduct.speedMultiplier : 1;
            const targetY = ufo.y + ufo.height / 2;
            const targetX = ufo.x - this.width / 2; // Center the target under the UFO
            const riseSpeed = (this.groundY - targetY) / this.abductionTime * rapidMultiplier;
            this.y -= riseSpeed * dt;

            // Move horizontally toward beam center
            const dx = targetX - this.x;
            const horizontalSpeed = Math.abs(dx) / Math.max(0.1, this.abductionTime - this.abductionProgress) * rapidMultiplier;
            if (Math.abs(dx) > 1) {
                this.x += Math.sign(dx) * Math.min(horizontalSpeed * dt, Math.abs(dx));
            }

            // Update abduction progress
            this.abductionProgress += dt * rapidMultiplier;

            // Adjust sound based on rise progress
            if (this.abductionSound && this.abductionSound.source) {
                const progress = Math.min(1, this.abductionProgress / this.abductionTime);

                // Pitch shifts up as target rises (0.7 -> 2.2)
                const playbackRate = 0.7 + progress * 1.5;
                this.abductionSound.source.playbackRate.value = playbackRate;

                // Heavy delay kicks in at the end (last 30% of abduction)
                // Envelope: 0 until 70%, then ramps up quickly to full
                const delayProgress = Math.max(0, (progress - 0.7) / 0.3);
                const delayAmount = delayProgress * delayProgress * this.abductionSound.volume * 1.5;
                this.abductionSound.delayWet.gain.setValueAtTime(delayAmount, audioCtx.currentTime);
            }

            // Check if abduction complete (either time elapsed OR reached UFO position)
            // The position check handles re-beaming a dropped target mid-air
            if (this.abductionProgress >= this.abductionTime || this.y <= targetY) {
                this.alive = false;
                SFX.abductionComplete(this.type);
                // Increment harvest counter and trigger bounce
                harvestCount[this.type]++;
                harvestBounce[this.type] = 1.0;
                waveStats.targetsBeamed[this.type]++;
                pushOpsLogEvent(`+${this.points} BIOMATTER`, '#0f0', { type: 'biomatter' });
                // Award points
                const multiplierIndex = Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1);
                const multiplier = CONFIG.COMBO_MULTIPLIERS[multiplierIndex];
                const pointsEarned = Math.floor(this.points * multiplier);
                score += pointsEarned;
                waveStats.points += pointsEarned;
                if (multiplierIndex === CONFIG.COMBO_MULTIPLIERS.length - 1) {
                    waveStats.maxComboHit = true;
                }
                combo++;

                // Heal UFO
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION);

                // Restore energy proportional to points
                const energyRestored = Math.floor(this.points * CONFIG.ENERGY_RESTORE_RATIO);
                trackEnergyDelta(energyRestored, true);
                ufo.energy = Math.min(ufo.maxEnergy, ufo.energy + energyRestored);

                // Create floating score text
                createFloatingText(this.x, this.y, `+${pointsEarned}`, '#0f0');

                // Award Bio-Matter based on target type
                const bmEarned = CONFIG.BIO_MATTER_RATES[this.type] || 0;
                if (bmEarned > 0) {
                    bioMatter += bmEarned;
                    waveStats.bioMatterEarned += bmEarned;
                    createFloatingText(this.x + 30, this.y - 15, `+${bmEarned} BM`, '#4f4', { fontSize: 18 });
                }

                // Track quota progress
                quotaProgress++;

                // Update high score
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('alienAbductoramaHighScore', highScore);
                }
            }
            return;
        }

        // Handle falling state (when dropped from beam)
        if (this.falling) {
            // Apply gravity
            this.vy += CONFIG.FALL_GRAVITY * dt;
            this.y += this.vy * dt;

            // Check for ground collision
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.falling = false;
                this.vy = 0;
            }
            return; // Don't wander while falling
        }

        // Check for flee behavior
        if (beamActive && !this.beingAbducted) {
            const distToBeam = Math.abs(this.x - beamX);
            if (distToBeam < CONFIG.TARGET_FLEE_RADIUS) {
                this.fleeTimer += dt;
                if (this.fleeTimer >= this.fleeDelay) {
                    this.fleeing = true;
                    // Flee away from beam
                    this.wanderDirection = this.x < beamX ? -1 : 1;
                }
            } else {
                this.fleeing = false;
                this.fleeTimer = 0;
            }
        } else {
            this.fleeing = false;
            this.fleeTimer = 0;
        }

        // Movement
        const speed = this.fleeing
            ? CONFIG.TARGET_WANDER_SPEED * CONFIG.TARGET_FLEE_SPEED_MULTIPLIER
            : CONFIG.TARGET_WANDER_SPEED;

        this.x += this.wanderDirection * speed * dt;

        // Wander direction change (only if not fleeing)
        if (!this.fleeing) {
            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.wanderDirection *= -1;
                this.wanderTimer = Math.random() * 3 + 1;
            }
        }

        // Keep on screen
        const margin = 20;
        if (this.x < margin) {
            this.x = margin;
            this.wanderDirection = 1;
        } else if (this.x > canvas.width - margin - this.width) {
            this.x = canvas.width - margin - this.width;
            this.wanderDirection = -1;
        }
    }

    render() {
        if (!this.alive) return;

        if (this.beingAbducted) {
            const progress = Math.min(1, this.abductionProgress / this.abductionTime);
            const eased = progress * progress;
            const spinSpeed = 0.1 + eased * 0.5;
            const angle = (Date.now() / 1000) * spinSpeed * Math.PI * 2;
            const scale = 1 - eased * 0.35;
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);

            const img = getAssetImage(this.type, this.animationOffset);
            if (img && img.complete) {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = this.getPlaceholderColor();
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            ctx.restore();
            return;
        }

        // Harvest drone tasing/vibration effect
        if (this.harvestShake && this.harvestShake > 0) {
            const intensity = this.harvestShake; // 0 to 1
            const shake = intensity * 8; // Max 8px shake
            const shakeX = (Math.random() - 0.5) * shake * 2;
            const shakeY = (Math.random() - 0.5) * shake;
            const shrink = this.harvestShrink || 0; // 0 to 1
            const scale = 1 - shrink * 0.85; // Shrinks down to 15% size
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            ctx.save();
            ctx.translate(centerX + shakeX, centerY + shakeY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);

            // Tint the target with electric cyan as intensity increases
            const img = getAssetImage(this.type, this.animationOffset);
            if (img && img.complete) {
                if (this.wanderDirection < 0) {
                    ctx.save();
                    ctx.translate(this.x + this.width, this.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, this.width, this.height);
                    ctx.restore();
                } else {
                    ctx.drawImage(img, this.x, this.y, this.width, this.height);
                }
            } else {
                ctx.fillStyle = this.getPlaceholderColor();
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }

            // Electric tint overlay that intensifies
            ctx.globalAlpha = intensity * 0.4;
            ctx.fillStyle = `rgb(0, 255, 255)`;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;

            // Electric arc sparks when intensity is high
            if (intensity > 0.3 && Math.random() < intensity * 0.5) {
                const sparkX = this.x + Math.random() * this.width;
                const sparkY = this.y + Math.random() * this.height;
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.random() * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sparkX, sparkY);
                for (let j = 0; j < 3; j++) {
                    ctx.lineTo(sparkX + (Math.random() - 0.5) * 15, sparkY + (Math.random() - 0.5) * 15);
                }
                ctx.stroke();
            }

            // When shrinking, draw orb glow at center
            if (shrink > 0) {
                const orbRadius = 6 + (1 - scale) * 10;
                const orbAlpha = shrink;
                ctx.fillStyle = `rgba(0, 255, 255, ${orbAlpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
                ctx.fill();
                // Bright core
                ctx.fillStyle = `rgba(255, 255, 255, ${orbAlpha * 0.9})`;
                ctx.beginPath();
                ctx.arc(centerX, centerY, orbRadius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            return;
        }

        // Falling animation - tumble while falling
        if (this.falling) {
            const angle = (Date.now() / 1000) * 3 * Math.PI * 2; // Fast spin
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.translate(-centerX, -centerY);

            const img = getAssetImage(this.type, this.animationOffset);
            if (img && img.complete) {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = this.getPlaceholderColor();
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            ctx.restore();
            return;
        }

        const img = getAssetImage(this.type, this.animationOffset);
        if (img && img.complete) {
            // Flip sprite based on wander direction
            ctx.save();
            if (this.wanderDirection < 0) {
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, this.width, this.height);
            } else {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            // Placeholder
            ctx.fillStyle = this.getPlaceholderColor();
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

    }

    getPlaceholderColor() {
        const colors = {
            human: '#ffccaa',
            cow: '#ffffff',
            sheep: '#eeeeee',
            cat: '#ff9944',
            dog: '#aa7744'
        };
        return colors[this.type] || '#888';
    }

    // Check if point is within this target's bounds
    containsPoint(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

    // Blast away from explosion - target is destroyed
    blastAway(explosionX, explosionY) {
        if (!this.alive) return;

        // Calculate direction away from explosion
        const dx = (this.x + this.width / 2) - explosionX;
        const dy = (this.y + this.height / 2) - explosionY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Normalize direction
        const dirX = dx / dist;
        const dirY = dy / dist;

        // Create flying particles from the target
        const colors = {
            human: ['#ffccaa', '#ff9977', '#ffffff'],
            cow: ['#ffffff', '#333333', '#ffcccc'],
            sheep: ['#eeeeee', '#ffffff', '#cccccc'],
            cat: ['#ff9944', '#ffbb77', '#ffffff'],
            dog: ['#aa7744', '#cc9966', '#ffffff']
        };
        const targetColors = colors[this.type] || ['#888', '#aaa', '#666'];

        // Create debris particles
        for (let i = 0; i < 15; i++) {
            const angle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * Math.PI;
            const speed = 200 + Math.random() * 300;
            const color = targetColors[Math.floor(Math.random() * targetColors.length)];
            particles.push(new Particle(
                this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                this.y + this.height / 2 + (Math.random() - 0.5) * this.height,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 100, // Add upward bias
                color,
                4 + Math.random() * 6,
                0.5 + Math.random() * 0.5
            ));
        }

        // Show floating text
        const blastText = this.type === 'cat' ? 'POOR KITTY' : this.type === 'dog' ? 'POOR DOGGY' : 'BLASTED!';
        createFloatingText(this.x + this.width / 2, this.y, blastText, '#f80');

        // Mark as dead
        this.alive = false;
    }
}

// ============================================
// FLOATING TEXT (for score popups)
// ============================================

let floatingTexts = [];
let tutorialState = null;
let coordChargeTutorialShown = false; // One-time: has the player seen the coordinator charge hint?
let coordChargeTutorialState = null;  // { phase: 'WAITING'|'SHOWING'|'DISMISSED', timer, targetCoord }

function createFloatingText(x, y, text, color, options = {}) {
    const {
        lifetime = 1.0,
        vy = -50,
        fontSize = 24
    } = options;

    floatingTexts.push({
        x,
        y,
        text,
        color,
        lifetime,
        vy,
        fontSize
    });
}

function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.lifetime -= dt;
        if (ft.lifetime <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function renderFloatingTexts() {
    ctx.textAlign = 'center';
    for (const ft of floatingTexts) {
        ctx.font = `bold ${ft.fontSize || 24}px monospace`;
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.lifetime);
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
}

// ============================================
// WAVE 1 TUTORIAL SYSTEM
// ============================================

function initTutorial() {
    if (wave !== 1) {
        tutorialState = null;
        return;
    }
    tutorialState = {
        phase: 'MOVE_BEAM',
        bootWaiting: true,         // Wait for boot sequence + breathing room before starting
        bootWaitTimer: 0,          // Timer for the boot wait period
        moveCompleted: false,
        beamCompleted: false,
        warpCompleted: false,
        bombCompleted: false,
        phaseTimer: 0,
        moveTime: 0,               // Cumulative movement time
        hintVisible: false,         // Is the current hint visible?
        hintTimer: 0,              // Time since hint became visible
        dismissing: false,          // Is a dismiss animation playing?
        dismissTimer: 0,           // Dismiss animation progress
        dismissType: null,         // Which hint is being dismissed
        pendingNextHint: false,     // Waiting to show next hint
        pendingNextTimer: 0,       // Timer for pending next hint
        beamHintShown: false,      // Has beam hint appeared?
        tankWarningTimer: 0,
        tankWarningPhase: 'none',  // 'none' | 'warning' | 'callout' | 'spawning' | 'done'
        completionTimer: 0,
        completionActive: false
    };
}

function cleanupTutorial() {
    tutorialState = null;
}

function notifyTutorialBeamLock() {
    if (!tutorialState || tutorialState.phase !== 'MOVE_BEAM' || tutorialState.beamCompleted) return;
    if (!tutorialState.beamHintShown) return;
    tutorialState.beamCompleted = true;
}

function notifyTutorialWarpJuke() {
    if (!tutorialState || tutorialState.phase !== 'WARP_JUKE' || tutorialState.warpCompleted) return;
    tutorialState.warpCompleted = true;
}

function notifyTutorialBomb() {
    if (!tutorialState || tutorialState.phase !== 'BOMB' || tutorialState.bombCompleted) return;
    tutorialState.bombCompleted = true;
}

function startTutorialDismiss(type) {
    if (!tutorialState) return;
    tutorialState.dismissing = true;
    tutorialState.dismissTimer = 0;
    tutorialState.dismissType = type;
    tutorialState.hintVisible = false;

    // Spawn completion particles
    const hintY = canvas.height * 0.45;
    const hintX = canvas.width / 2;
    const color = TUTORIAL_CONFIG.COLORS[type] || '#fff';
    const r = parseInt(color.length === 4 ? color[1] + color[1] : color.slice(1, 3), 16);
    const g = parseInt(color.length === 4 ? color[2] + color[2] : color.slice(3, 5), 16);
    const b = parseInt(color.length === 4 ? color[3] + color[3] : color.slice(5, 7), 16);
    const particleColor = `rgb(${r}, ${g}, ${b})`;

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 80 + Math.random() * 70;
        particles.push(new Particle(
            hintX + (Math.random() - 0.5) * 40,
            hintY,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            particleColor,
            3 + Math.random() * 2,
            0.3 + Math.random() * 0.2
        ));
    }

    // Sound on dismiss
    SFX.powerupCollect && SFX.powerupCollect();
}

function updateTutorial(dt) {
    if (!tutorialState || tutorialState.phase === 'COMPLETE') return;

    // Wait for boot sequence to finish before starting tutorial
    if (tutorialState.bootWaiting) {
        tutorialState.bootWaitTimer += dt;
        if (tutorialState.bootWaitTimer >= TUTORIAL_CONFIG.BOOT_WAIT) {
            tutorialState.bootWaiting = false;
            tutorialState.phaseTimer = 0;
            triggerTutorialCommander('welcome');
        }
        return;
    }

    tutorialState.phaseTimer += dt;

    // Handle dismissal animations
    if (tutorialState.dismissing) {
        tutorialState.dismissTimer += dt;
        if (tutorialState.dismissTimer >= TUTORIAL_CONFIG.HINT_DISMISS_DURATION) {
            tutorialState.dismissing = false;
            tutorialState.dismissTimer = 0;

            // Transition to next phase/state
            const dismissed = tutorialState.dismissType;
            tutorialState.dismissType = null;

            if (dismissed === 'movement') {
                // Show beam hint next
                tutorialState.pendingNextHint = true;
                tutorialState.pendingNextTimer = 0;
            } else if (dismissed === 'beam') {
                // Start tank entrance, then show warp juke hint
                startTankEntrance();
            } else if (dismissed === 'warp_juke') {
                // Show bomb hint next
                tutorialState.phase = 'BOMB';
                tutorialState.phaseTimer = 0;
                tutorialState.pendingNextHint = true;
                tutorialState.pendingNextTimer = 0;
            } else if (dismissed === 'bomb') {
                // Extra effects for bomb dismiss
                screenShake = 0.15;
                SFX.explosion && SFX.explosion(false);
                // Start completion celebration
                tutorialState.phase = 'CELEBRATION';
                tutorialState.phaseTimer = 0;
                tutorialState.completionActive = false;
                tutorialState.pendingNextHint = true;
                tutorialState.pendingNextTimer = 0;
            }
        }
        return; // Don't process other logic during dismiss animation
    }

    // Handle pending next hint delay
    if (tutorialState.pendingNextHint) {
        tutorialState.pendingNextTimer += dt;
        let delay;
        if (tutorialState.phase === 'CELEBRATION') delay = TUTORIAL_CONFIG.COMPLETION_DELAY;
        else if (tutorialState.phase === 'BOMB') delay = TUTORIAL_CONFIG.BOMB_HINT_DELAY;
        else if (tutorialState.phase === 'WARP_JUKE') delay = TUTORIAL_CONFIG.WARP_JUKE_HINT_DELAY;
        else delay = TUTORIAL_CONFIG.BEAM_HINT_DELAY;
        if (tutorialState.pendingNextTimer >= delay) {
            tutorialState.pendingNextHint = false;
            if (tutorialState.phase === 'MOVE_BEAM' && !tutorialState.beamHintShown) {
                tutorialState.beamHintShown = true;
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                triggerTutorialCommander('beamTargets');
                // Boot the mission panel now (deferred from initial boot on wave 1)
                if (wave === 1) {
                    hudBootState.panels.mission.active = true;
                    hudBootState.panels.mission.phase = 'waiting';
                    hudBootState.panels.mission.progress = 0;
                    hudBootState.panels.mission.startTime = hudBootState.timer; // start from current time
                    hudBootState.panels.mission._lastDiagLine = -1;
                    // Re-enter booting phase if boot was complete
                    if (hudBootState.phase === 'complete') {
                        hudBootState.phase = 'booting';
                        hudBootState.duration = hudBootState.timer + hudBootState.panels.mission.duration + 0.5;
                    }
                }
            } else if (tutorialState.phase === 'WARP_JUKE') {
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
            } else if (tutorialState.phase === 'BOMB') {
                tutorialState.hintVisible = true;
                tutorialState.hintTimer = 0;
                triggerTutorialCommander('useBombs');
            } else if (tutorialState.phase === 'CELEBRATION') {
                tutorialState.completionActive = true;
                tutorialState.completionTimer = 0;
                triggerTutorialCommander('complete');
                // Celebration particles
                const cx = canvas.width / 2;
                const cy = canvas.height * 0.40;
                const celebColors = ['rgb(0, 255, 255)', 'rgb(255, 255, 0)', 'rgb(0, 255, 0)', 'rgb(255, 136, 0)'];
                for (let i = 0; i < 30; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 100 + Math.random() * 150;
                    particles.push(new Particle(
                        cx + (Math.random() - 0.5) * 20,
                        cy + (Math.random() - 0.5) * 20,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        celebColors[Math.floor(Math.random() * celebColors.length)],
                        4 + Math.random() * 4,
                        0.5 + Math.random() * 0.3
                    ));
                }
                SFX.waveComplete && SFX.waveComplete();
            }
        }
        return;
    }

    // Phase-specific logic
    switch (tutorialState.phase) {
        case 'MOVE_BEAM':
            updateTutorialMoveBeam(dt);
            break;
        case 'WARP_JUKE':
            updateTutorialWarpJuke(dt);
            break;
        case 'BOMB':
            updateTutorialBomb(dt);
            break;
        case 'CELEBRATION':
            updateTutorialCelebration(dt);
            break;
    }
}

function updateTutorialMoveBeam(dt) {
    const ts = tutorialState;

    // Show move hint after initial delay
    if (!ts.moveCompleted && !ts.hintVisible && !ts.beamHintShown && ts.phaseTimer >= TUTORIAL_CONFIG.MOVE_HINT_DELAY) {
        ts.hintVisible = true;
        ts.hintTimer = 0;
    }

    if (ts.hintVisible) {
        ts.hintTimer += dt;
    }

    // Track movement
    if (!ts.moveCompleted && (keys['ArrowLeft'] || keys['ArrowRight'])) {
        ts.moveTime += dt;
        if (ts.moveTime >= TUTORIAL_CONFIG.MOVE_CUMULATIVE_TIME) {
            ts.moveCompleted = true;
            startTutorialDismiss('movement');
            return;
        }
    }

    // Show beam hint as fallback if player hasn't moved yet after fallback time
    if (!ts.moveCompleted && !ts.beamHintShown && ts.phaseTimer >= TUTORIAL_CONFIG.BEAM_HINT_FALLBACK_TIME) {
        ts.moveCompleted = true; // Skip move completion
        ts.beamHintShown = true;
        ts.hintVisible = true;
        ts.hintTimer = 0;
        // Boot the mission panel now (deferred from initial boot on wave 1)
        if (wave === 1) {
            hudBootState.panels.mission.active = true;
            hudBootState.panels.mission.phase = 'waiting';
            hudBootState.panels.mission.progress = 0;
            hudBootState.panels.mission.startTime = hudBootState.timer; // start from current time
            hudBootState.panels.mission._lastDiagLine = -1;
            // Re-enter booting phase if boot was complete
            if (hudBootState.phase === 'complete') {
                hudBootState.phase = 'booting';
                hudBootState.duration = hudBootState.timer + hudBootState.panels.mission.duration + 0.5;
            }
        }
    }

    // Beam hint visible - check for beam lock completion
    if (ts.beamHintShown && ts.beamCompleted && !ts.dismissing) {
        startTutorialDismiss('beam');
        return;
    }

    // Hard cutoff: force to Phase 2 if time is running out
    if (waveTimer <= TUTORIAL_CONFIG.PHASE1_HARD_CUTOFF && !ts.beamCompleted) {
        ts.beamCompleted = true;
        ts.moveCompleted = true;
        ts.hintVisible = false;
        startTankEntrance();
    }
}

function startTankEntrance() {
    const ts = tutorialState;
    ts.phase = 'WARP_JUKE';
    ts.phaseTimer = 0;
    ts.hintVisible = false;
    ts.hintTimer = 0;
    ts.tankWarningPhase = 'warning';
    ts.tankWarningTimer = 0;
    triggerTutorialCommander('tankIncoming');
}

function updateTutorialWarpJuke(dt) {
    const ts = tutorialState;

    // Handle tank entrance sequence (plays before warp juke hint)
    if (ts.tankWarningPhase && ts.tankWarningPhase !== 'done') {
        ts.tankWarningTimer += dt;

        if (ts.tankWarningPhase === 'warning' && ts.tankWarningTimer >= 0.8) {
            ts.tankWarningPhase = 'callout';
            screenShake = 0.3;
        }
        if (ts.tankWarningPhase === 'callout' && ts.tankWarningTimer >= 1.5) {
            ts.tankWarningPhase = 'spawning';
            // Spawn a single tank from the side furthest from UFO
            const ufoX = ufo ? ufo.x : canvas.width / 2;
            const direction = ufoX < canvas.width / 2 ? -1 : 1;
            const spawnX = direction === 1 ? -50 : canvas.width + 50;
            tanks = [new Tank(spawnX, direction)];

            // Dust particles at tank entry point
            const dustX = direction === -1 ? canvas.width - 20 : 20;
            const dustY = canvas.height - 60;
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(
                    dustX + (Math.random() - 0.5) * 30,
                    dustY - Math.random() * 10,
                    (Math.random() - 0.5) * 60 - direction * 30,
                    -20 - Math.random() * 40,
                    'rgb(180, 150, 100)',
                    2 + Math.random() * 3,
                    0.3 + Math.random() * 0.3
                ));
            }
        }
        if (ts.tankWarningPhase === 'spawning' && ts.tankWarningTimer >= TUTORIAL_CONFIG.TANK_WARNING_DURATION) {
            ts.tankWarningPhase = 'done';
            ts.pendingNextHint = true;
            ts.pendingNextTimer = 0;
        }
        return;
    }

    if (ts.hintVisible) {
        ts.hintTimer += dt;
    }

    // Check for warp juke completion
    if (ts.warpCompleted && !ts.dismissing) {
        startTutorialDismiss('warp_juke');
    }
}

function updateTutorialBomb(dt) {
    const ts = tutorialState;

    if (ts.hintVisible) {
        ts.hintTimer += dt;
    }

    // Check for bomb completion
    if (ts.bombCompleted && !ts.dismissing) {
        startTutorialDismiss('bomb');
    }
}

function updateTutorialCelebration(dt) {
    const ts = tutorialState;
    if (ts.completionActive) {
        ts.completionTimer += dt;
        if (ts.completionTimer >= TUTORIAL_CONFIG.COMPLETION_DURATION) {
            ts.phase = 'COMPLETE';
        }
    }
}

function updateCoordChargeTutorial(dt) {
    if (!coordChargeTutorialState || coordChargeTutorialState.phase === 'DISMISSED') return;

    const cs = coordChargeTutorialState;
    cs.timer += dt;

    if (cs.phase === 'WAITING') {
        // Wait for coordinator to enter ACTIVE state
        if (cs.targetCoord && cs.targetCoord.state === 'ACTIVE' && cs.timer >= TUTORIAL_CONFIG.COORD_CHARGE_HINT_DELAY) {
            cs.phase = 'SHOWING';
            cs.timer = 0;
        }
    } else if (cs.phase === 'SHOWING') {
        // Dismiss when player charges the coordinator for the first time
        if (cs.targetCoord && cs.targetCoord.isBeingCharged) {
            cs.phase = 'DISMISSED';
            // Particle burst on dismissal
            const cx = cs.targetCoord.x;
            const cy = cs.targetCoord.y;
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                const speed = 80 + Math.random() * 50;
                particles.push(new Particle(
                    cx + (Math.random() - 0.5) * 20, cy,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    'rgb(255, 180, 50)', 3, 0.3
                ));
            }
            SFX.powerupCollect && SFX.powerupCollect();
            coordChargeTutorialState = null;
        }
    }
}

function renderCoordChargeHint() {
    if (!coordChargeTutorialState || coordChargeTutorialState.phase !== 'SHOWING') return;

    const cs = coordChargeTutorialState;
    const coord = cs.targetCoord;
    if (!coord || !coord.alive) {
        coordChargeTutorialState = null;
        return;
    }

    const t = cs.timer;
    const alpha = Math.min(1, t / 0.3); // Fade in

    ctx.save();
    ctx.globalAlpha = alpha;

    // Panel near the coordinator
    const panelW = 340;
    const panelH = 55;
    const panelX = coord.x;
    const panelY = coord.y - coord.height / 2 - 50;

    renderHintPanel(panelX, panelY, panelW, panelH);

    // [SPACE] key badge + text
    const keyW = 60;
    const textLabel = 'RECHARGE COORDINATOR';
    ctx.font = 'bold 18px monospace';
    const textW = ctx.measureText(textLabel).width;
    const totalW = keyW + 12 + textW;
    const startX = panelX - totalW / 2;
    const keyY = panelY - 14;

    renderKeyBadge(startX, keyY, 'SPACE', keyW, 22);

    ctx.fillStyle = TUTORIAL_CONFIG.COLORS.coordinator_charge;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textLabel, startX + keyW + 12, panelY + 2);

    // Arrow pointing at coordinator
    const arrowY = panelY + panelH / 2 + 5;
    const arrowAlpha = 0.5 + Math.sin(t * 5) * 0.3;
    ctx.strokeStyle = `rgba(255, 160, 0, ${arrowAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panelX - 5, arrowY);
    ctx.lineTo(panelX, arrowY + 10);
    ctx.lineTo(panelX + 5, arrowY);
    ctx.stroke();

    ctx.restore();
}

// ---- Tutorial Rendering ----

function renderKeyBadge(x, y, text, width, height) {
    height = height || 22;
    // Outer key shape
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 4);
    ctx.fill();
    // Inner raised surface
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, width - 2, height - 3, 3);
    ctx.fill();
    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2 - 1);
    ctx.textBaseline = 'alphabetic'; // Reset
}

function renderTutorialHints() {
    if (!tutorialState || tutorialState.phase === 'COMPLETE') return;

    const ts = tutorialState;

    // Render tank warning sequence (renders over everything)
    if (ts.phase === 'WARP_JUKE' && ts.tankWarningPhase && ts.tankWarningPhase !== 'done' && ts.tankWarningPhase !== 'none') {
        renderTankWarning();
    }

    // Render completion celebration
    if (ts.phase === 'CELEBRATION' && ts.completionActive) {
        renderTutorialCompletion();
        return;
    }

    // Render dismiss animation
    if (ts.dismissing) {
        renderDismissAnimation();
        return;
    }

    // Render current visible hint
    if (!ts.hintVisible) return;

    const hintY = canvas.height * 0.45;
    const t = ts.hintTimer;

    // Entrance animation: slide in from above + fade
    const slideDuration = TUTORIAL_CONFIG.HINT_SLIDE_DURATION;
    let entranceAlpha = Math.min(1, t / slideDuration);
    let entranceOffsetY = (1 - Math.min(1, t / slideDuration)) * -10;

    ctx.save();
    ctx.globalAlpha = entranceAlpha;

    switch (ts.phase) {
        case 'MOVE_BEAM':
            if (!ts.beamHintShown) {
                renderMoveHint(canvas.width / 2, hintY + entranceOffsetY, t);
            } else {
                renderBeamHint(canvas.width / 2, hintY + entranceOffsetY, t);
            }
            break;
        case 'WARP_JUKE':
            renderWarpJukeHint(canvas.width / 2, hintY + entranceOffsetY, t);
            break;
        case 'BOMB':
            renderBombHint(canvas.width / 2, hintY + entranceOffsetY, t);
            break;
    }

    ctx.restore();
}

function renderHintPanel(cx, cy, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(cx - width / 2, cy - height / 2, width, height, 10);
    ctx.fill();
}

function renderMoveHint(cx, cy, t) {
    const panelW = 220;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH);

    // Key badges: [<] [>]
    const keyY = cy - 11;
    const keyW = 28;
    const keyH = 22;
    const keyGap = 8;
    const totalKeysW = keyW * 2 + keyGap;
    const textLabel = 'MOVE';
    ctx.font = 'bold 22px monospace';
    const textW = ctx.measureText(textLabel).width;
    const totalW = totalKeysW + 12 + textW;
    const startX = cx - totalW / 2;

    renderKeyBadge(startX, keyY, '\u25C0', keyW, keyH);
    renderKeyBadge(startX + keyW + keyGap, keyY, '\u25B6', keyW, keyH);

    // "MOVE" text
    ctx.fillStyle = TUTORIAL_CONFIG.COLORS.movement;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textLabel, startX + totalKeysW + 12, cy + 7);
}

function renderBeamHint(cx, cy, t) {
    const panelW = 320;
    const panelH = 60;
    renderHintPanel(cx, cy, panelW, panelH);

    // [SPACE] key badge
    const keyW = 60;
    const keyH = 22;
    const textLabel = 'BEAM UP TARGETS!';
    ctx.font = 'bold 22px monospace';
    const textW = ctx.measureText(textLabel).width;
    const totalW = keyW + 12 + textW;
    const startX = cx - totalW / 2;
    const keyY = cy - 16;

    renderKeyBadge(startX, keyY, 'SPACE', keyW, keyH);

    // "BEAM UP TARGETS!" text
    ctx.fillStyle = TUTORIAL_CONFIG.COLORS.beam;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textLabel, startX + keyW + 12, cy - 1);

    // Animated chevron arrows pointing down
    const chevronAlpha = 0.3 + Math.sin(t * 4) * 0.25 + 0.25;
    ctx.strokeStyle = `rgba(255, 255, 0, ${chevronAlpha})`;
    ctx.lineWidth = 2;
    const chevronY = cy + 12;
    for (let i = -1; i <= 1; i++) {
        const chevX = cx + i * 20;
        ctx.beginPath();
        ctx.moveTo(chevX - 6, chevronY);
        ctx.lineTo(chevX, chevronY + 7);
        ctx.lineTo(chevX + 6, chevronY);
        ctx.stroke();
    }
}

function renderWarpJukeHint(cx, cy, t) {
    const panelW = 340;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH);

    // Two arrow key badges with jitter effect
    const textLabel = 'DOUBLE-TAP TO DODGE!';
    ctx.font = 'bold 20px monospace';
    const textW = ctx.measureText(textLabel).width;
    const keyW = 22;
    const keyH = 22;
    const keyGap = 6;
    const totalW = keyW + keyGap + keyW + 14 + textW;
    const startX = cx - totalW / 2;
    const keyY = cy - 11;

    // Jittering left/right key badges
    const jitter1 = Math.sin(t * 12) * 2;
    const jitter2 = Math.sin(t * 12 + Math.PI) * 2;
    renderKeyBadge(startX + jitter1, keyY, '\u25C0', keyW, keyH);
    renderKeyBadge(startX + keyW + keyGap + jitter2, keyY, '\u25B6', keyW, keyH);

    // "DOUBLE-TAP TO DODGE!" text
    ctx.fillStyle = TUTORIAL_CONFIG.COLORS.warp_juke;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textLabel, startX + keyW + keyGap + keyW + 14, cy + 7);
}

function renderBombHint(cx, cy, t) {
    const panelW = 280;
    const panelH = 50;
    renderHintPanel(cx, cy, panelW, panelH);

    // [Z/B] key badge
    const keyW = 40;
    const keyH = 22;
    const textLabel = 'DROP A BOMB!';
    ctx.font = 'bold 22px monospace';
    const textW = ctx.measureText(textLabel).width;
    // Bomb icon space
    const bombIconW = 28;
    const totalW = keyW + 12 + textW + 8 + bombIconW;
    const startX = cx - totalW / 2;
    const keyY = cy - 11;

    renderKeyBadge(startX, keyY, 'Z/B', keyW, keyH);

    // "DROP A BOMB!" text
    ctx.fillStyle = TUTORIAL_CONFIG.COLORS.bomb;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(textLabel, startX + keyW + 12, cy + 7);

    // Mini bomb icon
    const bombX = startX + keyW + 12 + textW + 8 + 10;
    const bombY = cy;
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(bombX, bombY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(bombX - 2, bombY - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    // Fuse spark
    const sparkIntensity = Math.sin(t * 10) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, ${Math.floor(150 + sparkIntensity * 100)}, 0, ${0.7 + sparkIntensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(bombX, bombY - 12, 3 + sparkIntensity * 2, 0, Math.PI * 2);
    ctx.fill();
}

function renderTankWarning() {
    const ts = tutorialState;
    const t = ts.tankWarningTimer;

    if (ts.tankWarningPhase === 'warning') {
        // Red edge vignette
        const vignetteAlpha = Math.min(0.4, t * 0.8);
        ctx.fillStyle = `rgba(255, 0, 0, ${vignetteAlpha})`;
        const edgeW = 40;
        ctx.fillRect(0, 0, canvas.width, edgeW); // top
        ctx.fillRect(0, canvas.height - edgeW, canvas.width, edgeW); // bottom
        ctx.fillRect(0, 0, edgeW, canvas.height); // left
        ctx.fillRect(canvas.width - edgeW, 0, edgeW, canvas.height); // right

        // "!! WARNING !!" text
        const warningY = canvas.height * 0.38;
        const pulseScale = 1 + Math.sin(t * 8 * Math.PI * 2) * 0.05;
        ctx.save();
        ctx.translate(canvas.width / 2, warningY);
        ctx.scale(pulseScale, pulseScale);
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#f44';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!! WARNING !!', 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
    } else if (ts.tankWarningPhase === 'callout') {
        // Fade out red vignette
        const fadeProgress = (t - 0.8) / 0.5;
        const vignetteAlpha = Math.max(0, 0.4 * (1 - fadeProgress));
        if (vignetteAlpha > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${vignetteAlpha})`;
            const edgeW = 40;
            ctx.fillRect(0, 0, canvas.width, edgeW);
            ctx.fillRect(0, canvas.height - edgeW, canvas.width, edgeW);
            ctx.fillRect(0, 0, edgeW, canvas.height);
            ctx.fillRect(canvas.width - edgeW, 0, edgeW, canvas.height);
        }

        // "INCOMING TANK!" text
        const calloutY = canvas.height * 0.38;
        ctx.shadowColor = '#f80';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#f80';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INCOMING TANK!', canvas.width / 2, calloutY);
        ctx.shadowBlur = 0;
    } else if (ts.tankWarningPhase === 'spawning') {
        // Brief "INCOMING TANK!" fade out
        const fadeProgress = Math.min(1, (t - 1.5) / 0.5);
        const alpha = 1 - fadeProgress;
        if (alpha > 0) {
            const calloutY = canvas.height * 0.38;
            ctx.globalAlpha = alpha;
            ctx.shadowColor = '#f80';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#f80';
            ctx.font = 'bold 30px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('INCOMING TANK!', canvas.width / 2, calloutY);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }
}

function renderDismissAnimation() {
    const ts = tutorialState;
    const progress = ts.dismissTimer / TUTORIAL_CONFIG.HINT_DISMISS_DURATION;
    const type = ts.dismissType;
    const color = TUTORIAL_CONFIG.COLORS[type] || '#fff';
    const hintY = canvas.height * 0.45;

    ctx.save();

    if (type === 'warp_juke') {
        // Split apart horizontally
        const splitOffset = progress * 50;
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;
        // Left half
        ctx.save();
        ctx.translate(-splitOffset, 0);
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width / 2, canvas.height);
        ctx.clip();
        renderWarpJukeHint(canvas.width / 2, hintY, ts.hintTimer);
        ctx.restore();
        // Right half
        ctx.save();
        ctx.translate(splitOffset, 0);
        ctx.beginPath();
        ctx.rect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        ctx.clip();
        renderWarpJukeHint(canvas.width / 2, hintY, ts.hintTimer);
        ctx.restore();
    } else if (type === 'bomb') {
        // Explode outward
        const scale = 1 + progress * 1.0;
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;
        ctx.translate(canvas.width / 2, hintY);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -hintY);
        renderBombHint(canvas.width / 2, hintY, ts.hintTimer);
    } else {
        // Default: scale up + fade out
        const scale = 1 + progress * 0.15;
        const alpha = 1 - progress;
        ctx.globalAlpha = alpha;
        ctx.translate(canvas.width / 2, hintY);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -hintY);
        if (type === 'movement') {
            renderMoveHint(canvas.width / 2, hintY, ts.hintTimer);
        } else if (type === 'beam') {
            renderBeamHint(canvas.width / 2, hintY, ts.hintTimer);
        }
    }

    ctx.restore();
}

function renderTutorialCompletion() {
    const ts = tutorialState;
    const t = ts.completionTimer;
    const cy = canvas.height * 0.40;

    // Fade out after COMPLETION_FADE_START
    let alpha = 1;
    if (t >= TUTORIAL_CONFIG.COMPLETION_FADE_START) {
        alpha = 1 - (t - TUTORIAL_CONFIG.COMPLETION_FADE_START) / (TUTORIAL_CONFIG.COMPLETION_DURATION - TUTORIAL_CONFIG.COMPLETION_FADE_START);
        alpha = Math.max(0, alpha);
    }

    // Scale bounce entrance
    let scale = 1;
    if (t < 0.3) {
        const bounceT = t / 0.3;
        scale = bounceT * 1.1 - (bounceT > 0.7 ? (bounceT - 0.7) / 0.3 * 0.1 : 0);
        scale = Math.max(0, Math.min(1.1, scale));
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(canvas.width / 2, cy);
    ctx.scale(scale, scale);

    // Background panel with cycling border
    const panelW = 380;
    const panelH = 70;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 10);
    ctx.fill();

    // Cycling border
    const borderColors = [TUTORIAL_CONFIG.COLORS.movement, TUTORIAL_CONFIG.COLORS.beam, TUTORIAL_CONFIG.COLORS.bomb];
    const borderIdx = Math.floor((t * 4) % borderColors.length);
    ctx.strokeStyle = borderColors[borderIdx];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 10);
    ctx.stroke();

    // "ALL SYSTEMS GO!" text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALL SYSTEMS GO!', 0, 12);

    ctx.restore();
}

// Helper function to convert hex color to rgba string
function hexToRgba(hex, alpha) {
    // Handle 3-char hex codes (#rgb) and 6-char hex codes (#rrggbb)
    let r, g, b;
    if (hex.length === 4) {
        // 3-char hex: #rgb -> expand to #rrggbb
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        // 6-char hex: #rrggbb
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================
// TARGET SPAWNING
// ============================================

let targetSpawnTimer = 0;

function getRandomTargetType() {
    const rand = Math.random();
    let cumulative = 0;
    for (const [type, config] of Object.entries(CONFIG.TARGETS)) {
        cumulative += config.spawnRate;
        if (rand < cumulative) {
            return type;
        }
    }
    return 'dog'; // Fallback
}

function spawnTarget() {
    if (targets.length >= CONFIG.TARGET_MAX_ON_SCREEN) return;

    const type = getRandomTargetType();
    const margin = 100;

    // Find a valid spawn position (not too close to other targets)
    let x;
    let attempts = 0;
    const minSpacing = 80;

    do {
        x = margin + Math.random() * (canvas.width - margin * 2);
        attempts++;
    } while (attempts < 10 && targets.some(t =>
        Math.abs(t.x - x) < minSpacing
    ));

    targets.push(new Target(type, x));
    if (waveStats.targetsSpawned[type] !== undefined) {
        waveStats.targetsSpawned[type]++;
    }
}

function updateTargetSpawning(dt) {
    targetSpawnTimer -= dt;
    if (targetSpawnTimer <= 0) {
        spawnTarget();
        const [min, max] = CONFIG.TARGET_SPAWN_INTERVAL;
        targetSpawnTimer = min + Math.random() * (max - min);
    }
}

// ============================================
// UFO CLASS
// ============================================

function applyStunDropDamage(target) {
    const isHeavy = target && target.hasOwnProperty('turretAngleLeft');
    const ratio = isHeavy ? 0.25 : (1 / 3);
    const damage = Math.max(1, Math.floor(target.health * ratio));
    target.health -= damage;
    if (target.health <= 0) {
        target.health = 0;
        if (typeof target.destroy === 'function') {
            target.destroy();
        }
        return true;
    }
    return false;
}

class UFO {
    constructor() {
        this.width = 180;
        this.height = 90;
        this.x = canvas.width / 2;
        this.y = canvas.height * CONFIG.UFO_Y_POSITION;
        this.health = CONFIG.UFO_START_HEALTH;
        this.maxEnergy = CONFIG.ENERGY_MAX * (1 + playerInventory.maxEnergyBonus);
        this.energy = this.maxEnergy;
        this.beamActive = false;
        this.beamTarget = null;
        this.beamProgress = 0;
        this.beamOutOfEnergy = false; // Flag to prevent rapid on/off cycling when out of energy
        this.chargingTarget = null;       // Coordinator being charged via snap beam
        this.chargingParticleTimer = 0;   // Timer for spawning energy particles along charge beam
        this.hoverOffset = 0;
        this.hoverTime = 0;
        this.beamRotation = 0; // For spiral effect
        this.invincibleTimer = 0; // Invincibility after revive
        this.vx = 0; // Track horizontal velocity for bomb physics
        this.lastX = this.x; // For velocity calculation
        this.warpGhosts = []; // Ghost trail positions for warp juke
    }

    update(dt) {
        // Calculate velocity from position change (for bomb physics)
        if (dt > 0) {
            this.vx = (this.x - this.lastX) / dt;
            this.lastX = this.x;
        }

        // Hover animation
        this.hoverTime += dt;
        this.hoverOffset = Math.sin(this.hoverTime * 2) * 3;

        // Beam rotation for spiral effect
        this.beamRotation += dt * 5;

        // Update warp ghosts
        for (let i = this.warpGhosts.length - 1; i >= 0; i--) {
            this.warpGhosts[i].alpha -= dt / CONFIG.WARP_JUKE_GHOST_DURATION;
            if (this.warpGhosts[i].alpha <= 0) {
                this.warpGhosts.splice(i, 1);
            }
        }

        // Update invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }


        // Handle beam activation
        const wantsBeam = keys['Space'];
        const canFireBeam = (activePowerups.energy_surge.active || this.energy >= CONFIG.ENERGY_MIN_TO_FIRE) && !this.beamOutOfEnergy;

        // Reset out-of-energy state when player releases spacebar
        if (!wantsBeam) {
            this.beamOutOfEnergy = false;
        }

        // Mark inSnapRange on all coordinators within snap range (regardless of beam state)
        for (const coord of activeCoordinators) {
            if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
            coord.inSnapRange = Math.abs(coord.x - this.x) <= CONFIG.COORD_CHARGE_SNAP_RANGE;
        }

        if (wantsBeam && canFireBeam) {
            // Check for snap coordinator before normal beam
            const snapCoord = this.findSnapCoordinator();

            if (snapCoord) {
                // === Snap charging mode ===
                // Transition from normal beam to charging if needed
                if (!this.beamActive) {
                    SFX.beamOn();
                }
                if (this.chargingTarget !== snapCoord) {
                    // Switching targets or starting fresh
                    if (this.chargingTarget) {
                        this.chargingTarget.isBeingCharged = false;
                    }
                    // Stop normal beam loop if it was playing
                    SFX.stopBeamLoop();
                    SFX.startChargingHum();
                    this.chargingTarget = snapCoord;
                    this.chargingParticleTimer = 0;
                }
                snapCoord.isBeingCharged = true;
                this.beamActive = true;

                // Drain UFO energy
                if (!activePowerups.energy_surge.active) {
                    trackEnergyDelta(CONFIG.ENERGY_DRAIN_RATE * dt, false);
                    this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;
                }
                this.energy = Math.min(this.energy, this.maxEnergy);

                // Recharge the coordinator
                const rechargeRate = techFlags.reactorAmplifier ? 4.0 : 2.0;
                snapCoord.rechargeEnergy(rechargeRate * dt);

                // Update charging hum pitch based on coordinator energy level
                const energyPct = snapCoord.energyTimer / snapCoord.maxEnergy;
                SFX.setChargingHumPitch(energyPct);

                // Check if coordinator reached full energy
                if (snapCoord.energyTimer >= snapCoord.maxEnergy) {
                    SFX.chargeFull();
                    snapCoord.isBeingCharged = false;
                    this.chargingTarget = null;
                    SFX.stopChargingHum();
                }
            } else {
                // === Normal beam mode ===
                // If we were charging, stop
                if (this.chargingTarget) {
                    this.chargingTarget.isBeingCharged = false;
                    this.chargingTarget = null;
                    SFX.stopChargingHum();
                }

                // Start beam sound on activation
                if (!this.beamActive) {
                    SFX.beamOn();
                    SFX.startBeamLoop();
                }
                this.beamActive = true;
                if (!activePowerups.energy_surge.active) {
                    trackEnergyDelta(CONFIG.ENERGY_DRAIN_RATE * dt, false);
                    this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;
                }
                this.energy = Math.min(this.energy, this.maxEnergy);

                // Check for target lock
                if (!this.beamTarget) {
                    this.beamTarget = this.findTargetInBeam();
                    if (this.beamTarget) {
                        this.beamTarget.beingAbducted = true;
                        notifyTutorialBeamLock();
                        // Play pickup sound (with cooldown to prevent spam)
                        SFX.targetPickup(this.beamTarget);
                        // Reset falling state if re-catching a dropped target
                        if (this.beamTarget.falling) {
                            this.beamTarget.falling = false;
                            this.beamTarget.vy = 0;
                        }
                    }
                }

                // Beam recharges coordinators and drones
                if (this.beamActive) {
                    const beamTop = this.y + this.height / 2;
                    const beamBottom = canvas.height - 60;
                    const widthMult = activePowerups.wide_beam.active ? CONFIG.POWERUPS.wide_beam.widthMultiplier : 1;
                    const beamTopWidth = 30 * widthMult;
                    const beamBottomWidth = 225 * widthMult;

                    const rechargeRate = techFlags.reactorAmplifier ? 4.0 : 2.0;
                    const broadcastExtra = techFlags.powerBroadcast ? 60 : 0;

                    const isInBeam = (ex, ey) => {
                        if (ey < beamTop || ey > beamBottom) return false;
                        const t = (ey - beamTop) / (beamBottom - beamTop);
                        const beamWidth = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
                        const halfWidth = beamWidth / 2 + broadcastExtra;
                        return Math.abs(ex - this.x) <= halfWidth;
                    };

                    // Recharge coordinators (always works, no tech required)
                    for (const coord of activeCoordinators) {
                        if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
                        if (isInBeam(coord.x, coord.y)) {
                            coord.rechargeEnergy(rechargeRate * dt);
                        }
                    }

                    // Recharge raw drones (requires beamConduit / PG1)
                    if (techFlags.beamConduit) {
                        for (const drone of activeDrones) {
                            if (!drone.alive) continue;
                            if (isInBeam(drone.x, drone.y)) {
                                drone.energyTimer = Math.min(drone.maxEnergy, drone.energyTimer + rechargeRate * dt);
                            }
                        }
                        // Also recharge coordinator sub-drones
                        for (const coord of activeCoordinators) {
                            if (!coord.alive) continue;
                            for (const drone of coord.subDrones) {
                                if (!drone.alive) continue;
                                if (isInBeam(drone.x, drone.y)) {
                                    drone.energyTimer = Math.min(drone.maxEnergy, drone.energyTimer + rechargeRate * dt);
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Beam forced off while player wants it - mark as out of energy to prevent
            // rapid on/off cycling when energy hovers near the threshold
            if (wantsBeam) {
                this.beamOutOfEnergy = true;
            }

            // Beam deactivated
            if (this.beamActive) {
                SFX.stopBeamLoop();
                // Clear charging target if snap-charging
                if (this.chargingTarget) {
                    this.chargingTarget.isBeingCharged = false;
                    this.chargingTarget = null;
                    SFX.stopChargingHum();
                }
                // Drop current target if any (only if it's still alive - not already abducted)
                if (this.beamTarget && this.beamTarget.alive) {
                    // Check if this is a tank and was lifted high enough for stun
                    const isTank = this.beamTarget.hasOwnProperty('turretAngle') || this.beamTarget.hasOwnProperty('turretAngleLeft');
                    if (isTank) {
                        const totalLiftDistance = this.beamTarget.groundY - this.y;
                        const actualLiftDistance = this.beamTarget.groundY - this.beamTarget.y;
                        const liftRatio = actualLiftDistance / totalLiftDistance;

                    if (liftRatio > 0.33) {
                        const destroyed = applyStunDropDamage(this.beamTarget);
                        if (!destroyed) {
                            // Stun the tank!
                            this.beamTarget.isStunned = true;
                            this.beamTarget.stunTimer = 4; // 4 second stun
                            this.beamTarget.stunEffectTime = 0;
                            createFloatingText(this.beamTarget.x + this.beamTarget.width / 2, this.beamTarget.groundY - 30, 'STUNNED!', '#ff0');
                            SFX.tankStunned();
                        }
                    } else {
                        createFloatingText(this.x, this.y + 100, 'DROPPED!', '#f00');
                        SFX.targetDropped();
                    }
                    } else {
                        // Regular target dropped
                        createFloatingText(this.x, this.y + 100, 'DROPPED!', '#f00');
                        SFX.targetDropped();
                    }
                    this.beamTarget.beingAbducted = false;
                    this.beamTarget.abductionProgress = 0;
                    this.beamTarget.abductionSound = null; // Clear sound reference on drop
                    // Tank drops instantly to ground, regular targets fall with gravity
                    if (isTank) {
                        this.beamTarget.y = this.beamTarget.groundY;
                    } else {
                        this.beamTarget.falling = true;
                        this.beamTarget.vy = 0;
                    }
                }
                this.beamTarget = null;
            }
            this.beamActive = false;

            // Energy recharge when not beaming
        const rechargeRate = CONFIG.ENERGY_RECHARGE_RATE * (1 + playerInventory.energyRechargeBonus);
        trackEnergyDelta(rechargeRate * dt, true);
        this.energy = Math.min(this.maxEnergy, this.energy + rechargeRate * dt);
        }

        // Clamp energy
        this.energy = Math.max(0, this.energy);

        // Auto-deactivate beam if energy depleted
        if (this.energy <= 0) {
            if (this.beamActive) {
                SFX.stopBeamLoop();
            }
            // Clear charging target if snap-charging
            if (this.chargingTarget) {
                this.chargingTarget.isBeingCharged = false;
                this.chargingTarget = null;
                SFX.stopChargingHum();
            }
            if (this.beamTarget) {
                // Check if this is a tank and was lifted high enough for stun
                const isTank = this.beamTarget.hasOwnProperty('turretAngle') || this.beamTarget.hasOwnProperty('turretAngleLeft');
                if (isTank && this.beamTarget.alive) {
                    const totalLiftDistance = this.beamTarget.groundY - this.y;
                    const actualLiftDistance = this.beamTarget.groundY - this.beamTarget.y;
                    const liftRatio = actualLiftDistance / totalLiftDistance;

                    if (liftRatio > 0.33) {
                        const destroyed = applyStunDropDamage(this.beamTarget);
                        if (!destroyed) {
                            // Stun the tank!
                            this.beamTarget.isStunned = true;
                            this.beamTarget.stunTimer = 4; // 4 second stun
                            this.beamTarget.stunEffectTime = 0;
                            createFloatingText(this.beamTarget.x + this.beamTarget.width / 2, this.beamTarget.groundY - 30, 'STUNNED!', '#ff0');
                            SFX.tankStunned();
                        }
                    }
                }
                this.beamTarget.beingAbducted = false;
                this.beamTarget.abductionProgress = 0;
                // Tank drops instantly to ground, regular targets fall with gravity
                if (isTank) {
                    this.beamTarget.y = this.beamTarget.groundY;
                } else {
                    this.beamTarget.falling = true;
                    this.beamTarget.vy = 0;
                }
                this.beamTarget = null;
            }
            this.beamActive = false;
        }

        // Movement (only if not actively abducting a target)
        const isAbducting = this.beamActive && this.beamTarget;
        if (!isAbducting) {
            let moved = false;
            const thrusterMult = techFlags.thrusterBoost ? 1.3 : 1.0;
            const effectiveSpeed = CONFIG.UFO_SPEED * (1 + playerInventory.speedBonus) * thrusterMult;
            if (keys['ArrowLeft']) {
                this.x -= effectiveSpeed * dt;
                moved = true;
            }
            if (keys['ArrowRight']) {
                this.x += effectiveSpeed * dt;
                moved = true;
            }

            // Reset combo if moved
            if (moved && combo > 0) {
                combo = 0;
            }

            // Clamp to screen edges
            const halfWidth = this.width / 2;
            this.x = Math.max(halfWidth, Math.min(canvas.width - halfWidth, this.x));
        }
    }

    findTargetInBeam() {
        // Get beam cone parameters
        const beamTop = this.y + this.height / 2;
        const beamBottom = canvas.height - 60; // Ground level
        const beamHeight = beamBottom - beamTop;
        const widthMultiplier = activePowerups.wide_beam.active ? CONFIG.POWERUPS.wide_beam.widthMultiplier : 1;
        const beamTopWidth = 30 * widthMultiplier;
        const beamBottomWidth = 225 * widthMultiplier;

        // Check regular targets first
        for (const target of targets) {
            if (!target.alive || target.beingAbducted) continue;

            // Check if target center is within beam cone
            const targetCenterX = target.x + target.width / 2;
            const targetCenterY = target.y + target.height / 2;

            // Calculate beam width at target's Y position
            const t = (targetCenterY - beamTop) / beamHeight;
            if (t < 0 || t > 1) continue;

            const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
            const beamLeftEdge = this.x - beamWidthAtY / 2;
            const beamRightEdge = this.x + beamWidthAtY / 2;

            if (targetCenterX >= beamLeftEdge && targetCenterX <= beamRightEdge) {
                return target;
            }
        }

        // Check tanks (can also be abducted!)
        for (const tank of tanks) {
            if (!tank.alive || tank.beingAbducted) continue;

            const tankCenterX = tank.x + tank.width / 2;
            const tankCenterY = tank.y + tank.height / 2;

            const t = (tankCenterY - beamTop) / beamHeight;
            if (t < 0 || t > 1) continue;

            const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
            const beamLeftEdge = this.x - beamWidthAtY / 2;
            const beamRightEdge = this.x + beamWidthAtY / 2;

            if (tankCenterX >= beamLeftEdge && tankCenterX <= beamRightEdge) {
                return tank;
            }
        }

        // Check heavy tanks (can also be abducted!)
        for (const heavyTank of heavyTanks) {
            if (!heavyTank.alive || heavyTank.beingAbducted) continue;

            const tankCenterX = heavyTank.x + heavyTank.width / 2;
            const tankCenterY = heavyTank.y + heavyTank.height / 2;

            const t = (tankCenterY - beamTop) / beamHeight;
            if (t < 0 || t > 1) continue;

            const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
            const beamLeftEdge = this.x - beamWidthAtY / 2;
            const beamRightEdge = this.x + beamWidthAtY / 2;

            if (tankCenterX >= beamLeftEdge && tankCenterX <= beamRightEdge) {
                return heavyTank;
            }
        }

        // Check beamable powerups
        for (const powerup of powerups) {
            if (!powerup.alive || powerup.beingAbducted) continue;
            const cfg = CONFIG.POWERUPS[powerup.type];
            if (cfg.collectionType !== 'beam') continue;

            if (powerup.isInBeam(this.x, beamTop, beamBottom, beamTopWidth, beamBottomWidth)) {
                powerup.startAbduction();
                // Drain energy for beamable powerups
                if (cfg.beamEnergyCost) {
                    this.energy -= cfg.beamEnergyCost;
                }
            }
        }

        return null;
    }

    // Find the coordinator in snap range with the lowest energy
    findSnapCoordinator() {
        if (activeCoordinators.length === 0) return null;
        let best = null;
        let bestEnergy = Infinity;
        for (const coord of activeCoordinators) {
            if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
            const dx = Math.abs(coord.x - this.x);
            if (dx <= CONFIG.COORD_CHARGE_SNAP_RANGE) {
                if (coord.energyTimer < coord.maxEnergy && coord.energyTimer < bestEnergy) {
                    bestEnergy = coord.energyTimer;
                    best = coord;
                }
            }
        }
        return best;
    }

    render() {
        const drawX = this.x - this.width / 2;
        const drawY = this.y - this.height / 2 + this.hoverOffset;

        // Render warp ghost trail (behind UFO)
        for (const ghost of this.warpGhosts) {
            const ghostX = ghost.x - this.width / 2;
            const ghostY = ghost.y - this.height / 2 + this.hoverOffset;

            // Chromatic aberration effect on ghosts
            ctx.globalAlpha = ghost.alpha * 0.3;

            // Red offset
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            if (images.ufo && images.ufo.complete) {
                ctx.drawImage(images.ufo, ghostX - 5, ghostY, this.width, this.height);
            }

            // Cyan offset
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            if (images.ufo && images.ufo.complete) {
                ctx.drawImage(images.ufo, ghostX + 5, ghostY, this.width, this.height);
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        // Render beam first (behind UFO)
        if (this.beamActive) {
            if (this.chargingTarget) {
                this.renderChargingBeam();
            } else {
                this.renderBeam();
            }
        }

        // Flicker effect during invincibility
        const isInvincible = this.invincibleTimer > 0;
        if (isInvincible) {
            const flicker = Math.sin(Date.now() * CONFIG.INVINCIBILITY_FLICKER_RATE * 0.1) > 0;
            if (!flicker) {
                ctx.globalAlpha = 0.3;
            }
        }

        if (images.ufo && images.ufo.complete) {
            ctx.drawImage(images.ufo, drawX, drawY, this.width, this.height);
        } else {
            // Placeholder rectangle
            ctx.fillStyle = '#888';
            ctx.fillRect(drawX, drawY, this.width, this.height);
            ctx.fillStyle = '#0ff';
            ctx.fillRect(drawX + 20, drawY + 20, this.width - 40, this.height - 40);
        }

        // Reset alpha if we modified it
        if (isInvincible) {
            ctx.globalAlpha = 1;
        }

        // Energy bar above UFO
        this.renderEnergyBar(drawY - 20);

        // Render shield bubble if active
        if (activePowerups.shield.active) {
            const pulseAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
            ctx.strokeStyle = `rgba(0, 170, 255, ${pulseAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 1.5, 0, Math.PI * 2);
            ctx.stroke();

            // Shield charge indicators
            const charges = activePowerups.shield.charges;
            ctx.fillStyle = '#0af';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${charges}`, this.x, this.y - this.height / 2 - 25);
        }

        // Energy surge glow effect
        if (activePowerups.energy_surge.active) {
            const pulseAlpha = 0.3 + Math.sin(Date.now() / 150) * 0.2;
            ctx.strokeStyle = `rgba(255, 0, 255, ${pulseAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

    }

    renderBeam() {
        const beamTop = this.y + this.height / 2 + this.hoverOffset;
        const beamBottom = canvas.height - 60;
        const widthMultiplier = activePowerups.wide_beam.active ? CONFIG.POWERUPS.wide_beam.widthMultiplier : 1;
        const beamTopWidth = 30 * widthMultiplier;
        const beamBottomWidth = 225 * widthMultiplier;

        // Draw cone shape
        ctx.save();

        // Main beam cone with gradient
        const gradient = ctx.createLinearGradient(0, beamTop, 0, beamBottom);
        if (activePowerups.wide_beam.active) {
            // Orange tint when wide beam is active
            gradient.addColorStop(0, 'rgba(255, 170, 0, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 170, 0, 0.2)');
        } else {
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0.2)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.x - beamTopWidth / 2, beamTop);
        ctx.lineTo(this.x + beamTopWidth / 2, beamTop);
        ctx.lineTo(this.x + beamBottomWidth / 2, beamBottom);
        ctx.lineTo(this.x - beamBottomWidth / 2, beamBottom);
        ctx.closePath();
        ctx.fill();

        // Spiral effect
        this.renderBeamSpiral(beamTop, beamBottom, beamTopWidth, beamBottomWidth);

        // Edge glow
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - beamTopWidth / 2, beamTop);
        ctx.lineTo(this.x - beamBottomWidth / 2, beamBottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + beamTopWidth / 2, beamTop);
        ctx.lineTo(this.x + beamBottomWidth / 2, beamBottom);
        ctx.stroke();

        // Energy recharge visual effects
        if (techFlags.beamConduit || activeCoordinators.length > 0) {
            const broadcastExtra = techFlags.powerBroadcast ? 60 : 0;

            const isInBeamVisual = (ex, ey) => {
                if (ey < beamTop || ey > beamBottom) return false;
                const t = (ey - beamTop) / (beamBottom - beamTop);
                const beamWidth = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
                return Math.abs(ex - this.x) <= beamWidth / 2 + broadcastExtra;
            };

            // Coordinator recharge glow
            for (const coord of activeCoordinators) {
                if (!coord.alive || coord.state === 'DEPLOYING') continue;
                if (isInBeamVisual(coord.x, coord.y)) {
                    const pulse = 0.3 + Math.sin(Date.now() / 100) * 0.1;
                    ctx.fillStyle = `rgba(255, 200, 100, ${pulse})`;
                    ctx.beginPath();
                    ctx.ellipse(coord.x, coord.y, 30, 20, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Drone recharge sparkles (only with beamConduit)
            if (techFlags.beamConduit) {
                for (const drone of activeDrones) {
                    if (!drone.alive) continue;
                    if (isInBeamVisual(drone.x, drone.y)) {
                        if (Math.random() < 0.15) {
                            particles.push(new Particle(
                                drone.x + (Math.random() - 0.5) * 20,
                                drone.y - 10,
                                (Math.random() - 0.5) * 30,
                                -20 - Math.random() * 30,
                                'rgb(0, 255, 200)', 2, 0.3
                            ));
                        }
                    }
                }
            }
        }

        ctx.restore();
    }

    renderBeamSpiral(beamTop, beamBottom, beamTopWidth, beamBottomWidth) {
        const beamHeight = beamBottom - beamTop;
        const spiralSegments = 20;
        const spiralTurns = 3;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i <= spiralSegments; i++) {
            const t = i / spiralSegments;
            const y = beamTop + beamHeight * t;
            const widthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
            const angle = t * spiralTurns * Math.PI * 2 + this.beamRotation;
            const x = this.x + Math.sin(angle) * (widthAtY / 2 - 5);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Second spiral (offset)
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        ctx.beginPath();
        for (let i = 0; i <= spiralSegments; i++) {
            const t = i / spiralSegments;
            const y = beamTop + beamHeight * t;
            const widthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
            const angle = t * spiralTurns * Math.PI * 2 + this.beamRotation + Math.PI;
            const x = this.x + Math.sin(angle) * (widthAtY / 2 - 5);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Sparkle particles along edges
        const sparkleCount = 8;
        for (let i = 0; i < sparkleCount; i++) {
            const t = (i / sparkleCount + this.beamRotation * 0.1) % 1;
            const y = beamTop + beamHeight * t;
            const widthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
            const side = Math.sin(this.beamRotation * 3 + i) > 0 ? 1 : -1;
            const x = this.x + side * (widthAtY / 2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderChargingBeam() {
        if (!this.chargingTarget) return;
        const coord = this.chargingTarget;
        const startX = this.x;
        const startY = this.y + this.height / 2 + this.hoverOffset;
        const endX = coord.x;
        const endY = coord.y;

        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;

        const segments = 30;
        const now = Date.now() / 1000;
        const sineAmp = CONFIG.COORD_CHARGE_SINE_AMP;
        const sineFreq = CONFIG.COORD_CHARGE_SINE_FREQ;
        const beamWidth = CONFIG.COORD_CHARGE_BEAM_WIDTH;

        // Perpendicular direction for sine oscillation
        const perpX = -dy / dist;
        const perpY = dx / dist;

        ctx.save();

        // Soft outer glow
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = 'rgba(255, 180, 50, 0.3)';
        ctx.lineWidth = beamWidth * 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Main beam rod
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = 'rgba(255, 200, 80, 0.8)';
        ctx.lineWidth = beamWidth;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Bright center line
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = 'rgba(255, 240, 180, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Energy particles traveling along the sine path toward coordinator
        this.chargingParticleTimer += 0.016; // approximate dt
        if (this.chargingParticleTimer >= CONFIG.COORD_CHARGE_PARTICLE_RATE) {
            this.chargingParticleTimer = 0;
            // Spawn a particle at a random position along the beam, moving toward coord
            const t = Math.random() * 0.7; // spawn in first 70% of beam
            const bx = startX + dx * t;
            const by = startY + dy * t;
            const sine = Math.sin(t * Math.PI * 2 * sineFreq + now * 6) * sineAmp;
            const px = bx + perpX * sine;
            const py = by + perpY * sine;
            const speed = 150 + Math.random() * 100;
            const dirX = (dx / dist) * speed;
            const dirY = (dy / dist) * speed;
            particles.push(new Particle(
                px, py, dirX, dirY,
                `rgb(255, ${200 + Math.floor(Math.random() * 55)}, ${80 + Math.floor(Math.random() * 80)})`,
                2 + Math.random() * 2, 0.3 + Math.random() * 0.2
            ));
        }

        ctx.restore();
    }

    renderEnergyBar(y) {
        const barWidth = 130;
        const barHeight = 14;
        const x = this.x - barWidth / 2;
        const energyPercent = this.energy / this.maxEnergy;

        // NRG micro-label
        ctx.fillStyle = '#556';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('NRG', x - 3, y + barHeight - 2);

        // Segmented energy bar (Metroid style)
        const segments = 12;
        const gap = 1.5;
        const segWidth = (barWidth - gap * (segments - 1)) / segments;
        const filledSegments = Math.ceil(energyPercent * segments);

        // Background
        ctx.fillStyle = '#0a0c14';
        ctx.fillRect(x, y, barWidth, barHeight);

        for (let i = 0; i < segments; i++) {
            const segX = x + i * (segWidth + gap);
            const isFilled = i < filledSegments;

            if (isFilled) {
                // Color based on position in bar
                const segPercent = i / segments;
                let color;
                if (segPercent > 0.5) color = '#0f0';
                else if (segPercent > 0.25) color = '#bf0';
                else color = '#f60';

                // Pulse last filled segments when low
                if (energyPercent < 0.25 && i >= filledSegments - 2) {
                    const pulse = Math.sin(Date.now() / 100) * 0.4 + 0.6;
                    ctx.globalAlpha = pulse;
                    color = '#f00';
                }

                ctx.fillStyle = color;
                ctx.fillRect(segX, y + 1, segWidth, barHeight - 2);
                ctx.globalAlpha = 1;

                // Segment highlight (top edge)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(segX, y + 1, segWidth, 1);
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fillRect(segX, y + 1, segWidth, barHeight - 2);
            }
        }

        // Border with NGE styling
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Angular corner accents
        const accentLen = 4;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + accentLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + accentLen, y);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + barWidth, y + barHeight - accentLen);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.lineTo(x + barWidth - accentLen, y + barHeight);
        ctx.stroke();

        // Energy cubes above bar (Metroid energy tanks)
        const cells = playerInventory.energyCells;
        if (cells > 0) {
            const cubeSize = 8;
            const cubeSpacing = 3;
            const totalCubeWidth = cells * (cubeSize + cubeSpacing) - cubeSpacing;
            const cubeStartX = this.x - totalCubeWidth / 2;
            const cubeY = y - cubeSize - 3;

            for (let i = 0; i < cells; i++) {
                const cx = cubeStartX + i * (cubeSize + cubeSpacing);
                const pulse = Math.sin(Date.now() / 200 + i * 0.8) * 0.3 + 0.7;

                // Glow
                ctx.fillStyle = `rgba(255, 85, 85, ${pulse * 0.2})`;
                ctx.fillRect(cx - 1, cubeY - 1, cubeSize + 2, cubeSize + 2);

                // Cube body
                ctx.fillStyle = `rgba(255, 85, 85, ${pulse})`;
                ctx.fillRect(cx, cubeY, cubeSize, cubeSize);

                // Inner swirl
                const angle = Date.now() / 250 + i;
                ctx.fillStyle = `rgba(255, 200, 200, ${pulse * 0.5})`;
                ctx.beginPath();
                ctx.arc(cx + cubeSize/2 + Math.cos(angle) * 1.5, cubeY + cubeSize/2 + Math.sin(angle) * 1.5, 2, 0, Math.PI * 2);
                ctx.fill();

                // Border
                ctx.strokeStyle = `rgba(255, 120, 120, ${pulse * 0.6})`;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(cx, cubeY, cubeSize, cubeSize);
            }
        }

        // Numerical value
        ctx.fillStyle = '#aab';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.ceil(this.energy)}`, x + barWidth + 3, y + barHeight - 2);
    }
}

// ============================================
// TANK CLASS
// ============================================

function renderTankHealthBar(x, y, width, health, maxHealth) {
    const barWidth = width * 0.8;
    const barHeight = 6;
    const barX = x + (width - barWidth) / 2;
    const barY = y - 10;
    const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#f33');
    gradient.addColorStop(0.5, '#ff0');
    gradient.addColorStop(1, '#0f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

class Tank {
    constructor(x, direction) {
        this.width = 120;
        this.height = 75;
        this.x = x;
        this.y = canvas.height - 60 - this.height; // On ground
        this.direction = direction; // 1 = right, -1 = left
        // Speed scales up to wave 10, then caps
        this.speed = CONFIG.TANK_BASE_SPEED + Math.min(wave - 1, 9) * (CONFIG.TANK_SPEED_INCREMENT * 0.5);

        // Turret
        this.turretAngle = 0;
        this.turretLength = 45;

        // Firing
        const [minInterval, maxInterval] = CONFIG.TANK_FIRE_INTERVAL;
        this.fireTimer = minInterval + Math.random() * (maxInterval - minInterval);
        this.shotCount = 0;

        // Abduction state
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.abductionTime = 2.5; // Tanks take longer to abduct than humans
        this.groundY = this.y;

        this.alive = true;
        this.respawnTimer = 0;

        // Stun state
        this.isStunned = false;
        this.stunTimer = 0;
        this.stunEffectTime = 0; // For visual effect animation

        // Health
        this.health = CONFIG.TANK_HEALTH;
        this.maxHealth = CONFIG.TANK_HEALTH;

        // Animation offset so tanks don't animate in sync
        this.animationOffset = Math.random() * 10000;

        // Progressive AI properties
        this.coordinatorHunter = false; // Set in spawnTanks() based on wave tier
    }

    getTankBehaviorTier() {
        if (wave <= 3) return 0;  // Basic
        if (wave <= 7) return 1;  // Tactical
        if (wave <= 11) return 2; // Strategic
        return 3;                  // Veteran
    }

    takeDamage(amount) {
        if (!this.alive || this.isStunned) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    }

    destroy(pointsMultiplier = 1) {
        this.alive = false;
        this.respawnTimer = 3; // Respawn timer

        // Create explosion
        createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'medium');

        // Award points
        const pointsEarned = Math.floor(CONFIG.TANK_POINTS * pointsMultiplier);
        score += pointsEarned;
        harvestCount.tank++;
        harvestBounce.tank = 1;
        waveStats.targetsBeamed.tank++;
        waveStats.tanksDestroyed++;
        waveStats.points += pointsEarned;

        // Floating text
        createFloatingText(this.x + this.width / 2, this.y, `+${pointsEarned}`, '#ff0');

        // Sound
        SFX.explosion(false);
    }

    update(dt) {
        if (!this.alive) {
            // Handle respawn timer
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // Handle stun state
        if (this.isStunned) {
            this.stunTimer -= dt;
            this.stunEffectTime += dt;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.stunTimer = 0;
                this.stunEffectTime = 0;
                SFX.tankRecovered();
            }
            return; // Skip all movement and shooting while stunned
        }

        // If being abducted, rise toward UFO center
        if (this.beingAbducted) {
            // If UFO was destroyed, drop the tank
            if (!ufo) {
                this.beingAbducted = false;
                this.abductionProgress = 0;
                this.y = this.groundY;
                return;
            }

            const rapidMultiplier = activePowerups.rapid_abduct.active ? CONFIG.POWERUPS.rapid_abduct.speedMultiplier : 1;
            const targetY = ufo.y + ufo.height / 2;
            const targetX = ufo.x - this.width / 2; // Center the tank under the UFO
            const riseSpeed = (this.groundY - targetY) / this.abductionTime * rapidMultiplier;
            this.y -= riseSpeed * dt;

            // Move horizontally toward beam center
            const dx = targetX - this.x;
            const horizontalSpeed = Math.abs(dx) / Math.max(0.1, this.abductionTime - this.abductionProgress) * rapidMultiplier;
            if (Math.abs(dx) > 1) {
                this.x += Math.sign(dx) * Math.min(horizontalSpeed * dt, Math.abs(dx));
            }

            this.abductionProgress += dt * rapidMultiplier;

            // Check if abduction complete (either time elapsed OR reached UFO position)
            // The position check handles re-beaming a dropped target mid-air
            if (this.abductionProgress >= this.abductionTime || this.y <= targetY) {
                // Tank explodes near UFO! Multiple explosions for bigger effect
                const tankCenterX = this.x + this.width / 2;
                const tankCenterY = this.y + this.height / 2;
                createExplosion(tankCenterX, tankCenterY, 'large');
                createExplosion(tankCenterX - 30, tankCenterY + 10, 'large');
                createExplosion(tankCenterX + 30, tankCenterY - 10, 'large');
                // Delayed secondary explosions
                setTimeout(() => createExplosion(tankCenterX + 20, tankCenterY + 20, 'medium'), 100);
                setTimeout(() => createExplosion(tankCenterX - 20, tankCenterY - 15, 'medium'), 150);

                // Screen shake for tank explosion
                screenShake = 0.4;

                // Increment tank harvest counter
                harvestCount.tank++;
                waveStats.targetsBeamed.tank++;
                waveStats.tanksDestroyed++;

                // Award points
                const multiplierIndex = Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1);
                const multiplier = CONFIG.COMBO_MULTIPLIERS[multiplierIndex];
                const pointsEarned = Math.floor(CONFIG.TANK_POINTS * multiplier);
                score += pointsEarned;
                waveStats.points += pointsEarned;
                if (multiplierIndex === CONFIG.COMBO_MULTIPLIERS.length - 1) {
                    waveStats.maxComboHit = true;
                }
                combo++;

                // Heal UFO
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION);

                // Restore energy proportional to points
                const energyRestored = Math.floor(CONFIG.TANK_POINTS * CONFIG.ENERGY_RESTORE_RATIO);
                trackEnergyDelta(energyRestored, true);
                ufo.energy = Math.min(ufo.maxEnergy, ufo.energy + energyRestored);

                createFloatingText(this.x, this.y, `+${pointsEarned}`, '#0f0');

                // Update high score
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('alienAbductoramaHighScore', highScore);
                }

                this.alive = false;
                this.respawnTimer = 3; // Respawn after 3 seconds
            }
            return;
        }

        // Progressive AI tier
        const tier = this.getTankBehaviorTier();

        // Patrol movement
        this.x += this.direction * this.speed * dt;

        // Reverse at screen edges
        const margin = 50;
        if (this.x < margin) {
            this.x = margin;
            this.direction = 1;
        } else if (this.x > canvas.width - margin - this.width) {
            this.x = canvas.width - margin - this.width;
            this.direction = -1;
        }

        // Tactical (tier 1+): spread from other tanks and avoid battle drones
        if (tier >= 1) {
            for (const other of tanks) {
                if (other === this || !other.alive) continue;
                const dist = Math.abs(other.x - this.x);
                if (dist < 100) {
                    const pushDir = this.x < other.x ? -1 : 1;
                    this.x += pushDir * 30 * dt;
                }
            }
            for (const drone of activeDrones) {
                if (!drone.alive || drone.type !== 'battle') continue;
                const dist = Math.abs(drone.x - (this.x + this.width / 2));
                if (dist < 150) {
                    const pushDir = (this.x + this.width / 2) < drone.x ? -1 : 1;
                    this.x += pushDir * 40 * dt;
                }
            }
        }

        // Strategic (tier 2+): bias toward screen edges
        if (tier >= 2) {
            const centerX = canvas.width / 2;
            const fromCenter = (this.x + this.width / 2) - centerX;
            if (Math.abs(fromCenter) < canvas.width * 0.3) {
                this.x += Math.sign(fromCenter || 1) * 15 * dt;
            }
        }

        // Veteran (tier 3): evade bombs and player missiles
        if (tier >= 3) {
            for (const bomb of bombs) {
                if (!bomb.alive) continue;
                const dist = Math.hypot(bomb.x - (this.x + this.width / 2), bomb.y - (this.y + this.height / 2));
                if (dist < 200) {
                    const evadeDir = (this.x + this.width / 2) < bomb.x ? -1 : 1;
                    this.x += evadeDir * 80 * dt;
                }
            }
            for (const missile of playerMissiles) {
                if (!missile.alive) continue;
                const dist = Math.hypot(missile.x - (this.x + this.width / 2), missile.y - (this.y + this.height / 2));
                if (dist < 180) {
                    const evadeDir = (this.x + this.width / 2) < missile.x ? -1 : 1;
                    this.x += evadeDir * 60 * dt;
                }
            }
        }

        // Clamp to screen bounds after all movement modifications
        this.x = Math.max(margin, Math.min(canvas.width - margin - this.width, this.x));

        // Aim turret at priority target
        {
            const turretX = this.x + this.width / 2;
            const turretY = this.y;
            let aimX = ufo ? ufo.x : turretX;
            let aimY = ufo ? ufo.y : turretY - 100;

            let bestTarget = null;
            let bestPriority = Infinity;
            let bestDist = Infinity;

            // Coordinator hunters flip priorities: coordinators (0) > drones (1,2)
            const battlePriority = this.coordinatorHunter ? 2 : 0;
            const harvesterPriority = this.coordinatorHunter ? 3 : 1;
            const coordPriority = this.coordinatorHunter ? 0 : 2;

            for (const drone of activeDrones) {
                if (!drone.alive || drone.state === 'FALLING') continue;
                const ddx = drone.x - turretX;
                const ddy = drone.y - turretY;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                const priority = drone.type === 'battle' ? battlePriority : harvesterPriority;
                if (priority < bestPriority || (priority === bestPriority && dist < bestDist)) {
                    bestTarget = drone;
                    bestPriority = priority;
                    bestDist = dist;
                }
            }
            for (const coord of activeCoordinators) {
                if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
                const ddx = coord.x - turretX;
                const ddy = coord.y - turretY;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (coordPriority < bestPriority || (coordPriority === bestPriority && dist < bestDist)) {
                    bestTarget = coord;
                    bestPriority = coordPriority;
                    bestDist = dist;
                }
            }
            if (bestTarget) { aimX = bestTarget.x; aimY = bestTarget.y; }

            // Tactical+: lead shots by predicting target movement
            if (tier >= 1 && bestTarget) {
                const targetVx = bestTarget.vx || 0;
                const targetVy = bestTarget.vy || 0;
                if (targetVx !== 0 || targetVy !== 0) {
                    const dist = Math.hypot(aimX - turretX, aimY - turretY);
                    const bulletSpeed = CONFIG.SHELL_SPEED;
                    const timeToHit = dist / bulletSpeed;
                    aimX += targetVx * timeToHit;
                    aimY += targetVy * timeToHit;
                }
            }

            const targetAngle = Math.atan2(aimY - turretY, aimX - turretX);
            const angleDiff = targetAngle - this.turretAngle;
            this.turretAngle += angleDiff * 5 * dt;
        }

        // Fire at target
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && ufo) {
            this.fire();
            const [minInterval, maxInterval] = CONFIG.TANK_FIRE_INTERVAL;
            // Fire rate increases with wave
            const fireRateMultiplier = 1 + (wave - 1) * 0.1;
            // Quota miss penalty: tanks fire faster per consecutive miss
            const quotaPenalty = 1 + CONFIG.QUOTA_MISS_PENALTY * consecutiveQuotaMisses;
            this.fireTimer = (minInterval + Math.random() * (maxInterval - minInterval)) / Math.min(fireRateMultiplier * quotaPenalty, 2.5);
        }
    }

    fire() {
        this.shotCount++;
        const isMissile = this.shotCount % CONFIG.TANK_MISSILE_FREQUENCY === 0;

        const turretX = this.x + this.width / 2;
        const turretY = this.y;

        // Calculate velocity toward UFO
        const speed = isMissile ? CONFIG.MISSILE_SPEED : CONFIG.SHELL_SPEED;
        const vx = Math.cos(this.turretAngle) * speed;
        const vy = Math.sin(this.turretAngle) * speed;

        projectiles.push(new Projectile(
            turretX + Math.cos(this.turretAngle) * this.turretLength,
            turretY + Math.sin(this.turretAngle) * this.turretLength,
            vx,
            vy,
            isMissile ? 'missile' : 'shell'
        ));

        // Play fire sound
        if (isMissile) {
            SFX.missileFire();
        } else {
            SFX.shellFire();
        }
    }

    respawn() {
        // Respawn at random edge with random offset to avoid overlapping
        this.alive = true;
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.isStunned = false;
        this.stunTimer = 0;
        this.stunEffectTime = 0;
        this.health = CONFIG.TANK_HEALTH; // Reset health on respawn
        this.direction = Math.random() < 0.5 ? 1 : -1;
        // Add random offset (0-300px) so tanks don't respawn at same spot
        const randomOffset = Math.random() * 300;
        this.x = this.direction === 1 ? -this.width - randomOffset : canvas.width + randomOffset;
        this.y = this.groundY;
        this.speed = CONFIG.TANK_BASE_SPEED + (wave - 1) * CONFIG.TANK_SPEED_INCREMENT;
        this.speed = Math.min(this.speed, 100);
    }

    render() {
        if (!this.alive) return;

        let abductedTransform = false;
        if (this.beingAbducted) {
            const progress = Math.min(1, this.abductionProgress / this.abductionTime);
            const eased = progress * progress;
            const spinSpeed = 0.09 + eased * 0.4;
            const angle = (Date.now() / 1000) * spinSpeed * Math.PI * 2;
            const scale = 1 - eased * 0.3;
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
            abductedTransform = true;
        }

        const img = getAssetImage('tank', this.animationOffset);

        // Apply grayed out effect if stunned
        if (this.isStunned) {
            ctx.save();
            ctx.globalAlpha = 0.6;
        }

        if (img && img.complete) {
            ctx.save();
            if (this.direction < 0) {
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, this.width, this.height);
            } else {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            // Placeholder
            ctx.fillStyle = this.isStunned ? '#666' : '#556b2f';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Treads
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y + this.height - 10, this.width, 10);
        }

        // Draw turret
        this.renderTurret();

        if (this.isStunned) {
            ctx.restore();
        }

        if (this.health < this.maxHealth) {
            renderTankHealthBar(this.x, this.y, this.width, this.health, this.maxHealth);
        }

        if (this.isStunned) {
            // Draw spinning stars effect above tank
            this.renderStunEffect();
        }

        if (abductedTransform) {
            ctx.restore();
        }
    }

    renderStunEffect() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y - 20;
        const numStars = 4;
        const radius = 25;
        const rotationSpeed = 3; // Rotations per second

        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;

        for (let i = 0; i < numStars; i++) {
            const angle = (this.stunEffectTime * rotationSpeed * Math.PI * 2) + (i * Math.PI * 2 / numStars);
            const starX = centerX + Math.cos(angle) * radius;
            const starY = centerY + Math.sin(angle) * radius * 0.4; // Elliptical path

            // Draw a simple star
            this.drawStar(starX, starY, 5, 8, 4);
        }

        ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    renderTurret() {
        const turretX = this.x + this.width / 2;
        const turretY = this.y + 15;

        // Turret barrel
        ctx.strokeStyle = '#b0b0b0';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(turretX, turretY);
        ctx.lineTo(
            turretX + Math.cos(this.turretAngle) * this.turretLength,
            turretY + Math.sin(this.turretAngle) * this.turretLength
        );
        ctx.stroke();
    }
}

// ============================================
// PROJECTILE CLASS
// ============================================

class Projectile {
    constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type; // 'shell' or 'missile'
        this.radius = type === 'missile' ? 6 : 4;
        this.damage = type === 'missile' ? CONFIG.MISSILE_DAMAGE : CONFIG.SHELL_DAMAGE;
        this.alive = true;
        this.trail = []; // For missile trail
    }

    update(dt) {
        if (!this.alive) return;

        // Store trail position for missiles
        if (this.type === 'missile') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) {
                this.trail.shift();
            }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Check if off screen
        if (this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50) {
            this.alive = false;
            return;
        }

        // Check collision with drones (tanks shoot at drones too)
        if (this.checkCollisionWithDrones()) return;

        // Check collision with UFO
        if (ufo && this.checkCollisionWithUFO()) {
            this.alive = false;

            // Check for invincibility first
            if (ufo.invincibleTimer > 0) {
                // Invincible - just show small visual effect
                createExplosion(this.x, this.y, 'small');
                createFloatingText(ufo.x, ufo.y - 30, 'INVINCIBLE!', '#ff0');
                return;
            }

            if (activePowerups.shield.active && activePowerups.shield.charges > 0) {
                // Shield absorbs hit
                activePowerups.shield.charges--;
                SFX.shieldHit();
                createFloatingText(ufo.x, ufo.y - 30, 'BLOCKED!', '#0af');
                createExplosion(this.x, this.y, 'small');

                if (activePowerups.shield.charges <= 0) {
                    activePowerups.shield.active = false;
                    activePowerups.shield.stacks = 0;
                    SFX.shieldBreak();
                    createFloatingText(ufo.x, ufo.y - 50, 'SHIELD DOWN!', '#f00');
                }
            } else {
                // Normal damage
                let finalDamage = this.damage;

                // DN5 Swarm Shield: fleet entities absorb damage
                if (techFlags.swarmShield) {
                    let fleetCount = activeDrones.filter(d => d.alive).length;
                    for (const coord of activeCoordinators) {
                        if (coord.alive) {
                            fleetCount++; // coordinator itself
                            fleetCount += coord.subDrones.filter(d => d.alive).length;
                        }
                    }
                    const absorption = Math.min(fleetCount * 0.02, 0.6); // 2% per entity, max 60%
                    if (absorption > 0) {
                        finalDamage = Math.max(1, Math.round(this.damage * (1 - absorption)));
                    }
                }

                ufo.health -= finalDamage;
                waveStats.hitsTaken++;
                pushOpsLogEvent(`SHIELD HIT -${Math.round(finalDamage)} HP`, '#f44', { type: 'shieldHit' });

                // Create small explosion at hit point
                createExplosion(this.x, this.y, 'small');

                // Sound and visual effects
                SFX.ufoHit();
                screenShake = 0.2;
                damageFlash = 0.15;
                createFloatingText(ufo.x, ufo.y - 30, `-${finalDamage}`, techFlags.swarmShield && finalDamage < this.damage ? '#0af' : '#f00');

                // Check for game over or revive
                if (ufo.health <= 0) {
                    ufo.health = 0;
                    if (playerInventory.energyCells > 0) {
                        // Use energy cell to revive
                        triggerRevive();
                    } else {
                        triggerGameOver();
                    }
                }
            }
        }
    }

    checkCollisionWithUFO() {
        const ufoCenterX = ufo.x;
        const ufoCenterY = ufo.y;
        let ufoRadius = ufo.width / 2.5; // Approximate collision radius

        const dx = this.x - ufoCenterX;
        const dy = this.y - ufoCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < ufoRadius + this.radius;
    }

    checkCollisionWithDrones() {
        for (const drone of activeDrones) {
            if (!drone.alive) continue;
            const dx = this.x - drone.x;
            const dy = this.y - drone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 20 + this.radius) {
                this.alive = false;
                drone.takeDamage(this.damage * 0.2); // Projectiles deal light damage as energy drain
                createExplosion(this.x, this.y, 'small');
                return true;
            }
        }
        // Check collision with coordinators and their sub-drones
        for (const coord of activeCoordinators) {
            if (!coord.alive || coord.state === 'DYING') continue;
            // Coordinator itself
            const cdx = this.x - coord.x;
            const cdy = this.y - coord.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < (coord.width / 2) + this.radius) {
                this.alive = false;
                coord.takeDamage(this.damage * 0.3);
                createExplosion(this.x, this.y, 'small');
                return true;
            }
            // Sub-drones under this coordinator
            for (const drone of coord.subDrones) {
                if (!drone.alive) continue;
                const ddx = this.x - drone.x;
                const ddy = this.y - drone.y;
                const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (ddist < 20 + this.radius) {
                    this.alive = false;
                    drone.takeDamage(this.damage * 0.2);
                    createExplosion(this.x, this.y, 'small');
                    return true;
                }
            }
        }
        return false;
    }

    render() {
        if (!this.alive) return;

        if (this.type === 'missile') {
            // Draw trail
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = i / this.trail.length * 0.5;
                const size = (i / this.trail.length) * 4;
                ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw missile body (elongated)
            ctx.fillStyle = '#ff3333';
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.fillRect(-10, -3, 20, 6);
            // Nose
            ctx.beginPath();
            ctx.moveTo(10, -3);
            ctx.lineTo(15, 0);
            ctx.lineTo(10, 3);
            ctx.fill();
            ctx.restore();
        } else {
            // Shell - simple yellow circle
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ============================================
// BOMB CLASS
// ============================================

class Bomb {
    constructor(x, y, inheritedVx = 0) {
        this.x = x;
        this.y = y;
        // Inherit horizontal velocity from UFO for realistic arc
        this.vx = CONFIG.BOMB_INITIAL_VX + inheritedVx * 0.8; // 80% of UFO velocity
        this.vy = CONFIG.BOMB_INITIAL_VY;
        this.radius = 12;
        this.bounceCount = 0;
        this.alive = true;
        this.rotation = 0;
        this.groundY = canvas.height - 60; // Ground level
    }

    update(dt) {
        if (!this.alive) return;

        // Apply gravity
        this.vy += CONFIG.BOMB_GRAVITY * dt;

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Spin animation
        this.rotation += dt * 10;

        // Check for direct collision with tanks (explode on contact)
        for (const tank of tanks) {
            if (!tank.alive) continue;
            if (this.x > tank.x && this.x < tank.x + tank.width &&
                this.y + this.radius > tank.y && this.y - this.radius < tank.y + tank.height) {
                this.explode();
                return;
            }
        }

        // Check for direct collision with heavy tanks (explode on contact)
        for (const heavyTank of heavyTanks) {
            if (!heavyTank.alive) continue;
            if (this.x > heavyTank.x && this.x < heavyTank.x + heavyTank.width &&
                this.y + this.radius > heavyTank.y && this.y - this.radius < heavyTank.y + heavyTank.height) {
                this.explode();
                return;
            }
        }

        // Check for direct collision with targets (explode on contact)
        for (const target of targets) {
            if (!target.alive) continue;
            if (this.x > target.x && this.x < target.x + target.width &&
                this.y + this.radius > target.y && this.y - this.radius < target.y + target.height) {
                this.explode();
                return;
            }
        }

        // Check for direct collision with drones (explode on contact)
        for (const drone of activeDrones) {
            if (!drone.alive) continue;
            if (this.x > drone.x && this.x < drone.x + drone.width &&
                this.y + this.radius > drone.y && this.y - this.radius < drone.y + drone.height) {
                this.explode();
                return;
            }
        }

        // Check for ground collision (bounce)
        if (this.y + this.radius >= this.groundY) {
            this.y = this.groundY - this.radius;
            this.vy = -this.vy * CONFIG.BOMB_BOUNCE_DAMPING;
            this.vx *= CONFIG.BOMB_BOUNCE_DAMPING;
            this.bounceCount++;

            // Create small dust particles on bounce
            for (let i = 0; i < 5; i++) {
                const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
                const speed = 50 + Math.random() * 50;
                particles.push(new Particle(
                    this.x, this.groundY,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    'rgba(139, 90, 43, 1)', // Brown dust
                    3, 0.3
                ));
            }

            // Play bounce sound
            SFX.bombBounce && SFX.bombBounce();

            // Explode after max bounces
            if (this.bounceCount >= CONFIG.BOMB_MAX_BOUNCES) {
                this.explode();
            }
        }

        // Check for wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * CONFIG.BOMB_BOUNCE_DAMPING;
            this.bounceCount++;
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -this.vx * CONFIG.BOMB_BOUNCE_DAMPING;
            this.bounceCount++;
        }

        // Check if velocity is low enough to explode (stopped bouncing)
        if (this.bounceCount > 0 && Math.abs(this.vy) < 20 && this.y >= this.groundY - this.radius - 5) {
            this.explode();
        }
    }

    explode() {
        if (!this.alive) return;
        this.alive = false;

        // Create explosion visual
        createExplosion(this.x, this.y, 'large');

        // Screen shake
        screenShake = 0.6;

        // Play explosion sound
        SFX.explosion(true);

        // Blast away nearby targets
        for (const target of targets) {
            if (!target.alive) continue;
            const dx = target.x + target.width / 2 - this.x;
            const dy = target.y + target.height / 2 - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.BOMB_EXPLOSION_RADIUS) {
                target.blastAway(this.x, this.y);
            }
        }

        // Destroy tanks in blast radius
        for (const tank of tanks) {
            if (!tank.alive) continue;
            const dx = tank.x + tank.width / 2 - this.x;
            const dy = tank.y + tank.height / 2 - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.BOMB_EXPLOSION_RADIUS) {
                // Destroy the tank
                tank.destroy(3);
                createFloatingText(tank.x + tank.width / 2, tank.groundY - 30, 'DESTROYED!', '#ff4400');
            }
        }

        // Damage heavy tanks in blast radius (takes 2 hits to destroy)
        for (const heavyTank of heavyTanks) {
            if (!heavyTank.alive) continue;
            const dx = heavyTank.x + heavyTank.width / 2 - this.x;
            const dy = heavyTank.y + heavyTank.height / 2 - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.BOMB_EXPLOSION_RADIUS) {
                // Deal bomb damage to heavy tank
                heavyTank.bombHits = (heavyTank.bombHits || 0) + 1;
                if (heavyTank.bombHits >= 2) {
                    // Second hit - destroy it
                    heavyTank.destroy(3);
                    createFloatingText(heavyTank.x + heavyTank.width / 2, heavyTank.groundY - 30, 'DESTROYED!', '#ff4400');
                } else {
                    // First hit - damage visual, brief stun
                    heavyTank.isDamaged = true;
                    heavyTank.isStunned = true;
                    heavyTank.stunTimer = 1; // Brief stun on damage
                    heavyTank.stunEffectTime = 0;
                    createFloatingText(heavyTank.x + heavyTank.width / 2, heavyTank.groundY - 30, 'DAMAGED!', '#ff8800');
                    SFX.tankStunned();
                }
            }
        }

        // Friendly fire: damage own drones in blast radius
        for (const drone of activeDrones) {
            if (!drone.alive) continue;
            const dx = drone.x - this.x;
            const dy = drone.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.BOMB_EXPLOSION_RADIUS) {
                drone.takeDamage(5); // Reduce energy by 5 seconds
                createFloatingText(drone.x, drone.y - 20, 'FRIENDLY FIRE!', '#ff8800');
            }
        }
    }

    render() {
        if (!this.alive) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Bomb body (dark gray sphere)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(-3, -3, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Fuse
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(0, -this.radius - 8);
        ctx.stroke();

        // Fuse spark
        const sparkIntensity = Math.sin(Date.now() / 50) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, ${150 + sparkIntensity * 105}, 0, ${sparkIntensity})`;
        ctx.beginPath();
        ctx.arc(0, -this.radius - 8, 3 + sparkIntensity * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// MISSILE SWARM SYSTEM
// ============================================

function angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return d;
}

function clampValue(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

class Missile {
    constructor(x, y, targetTank, launchAngle, fromCoordinator = false) {
        this.x = x;
        this.y = y;
        this.targetTank = targetTank;
        this.damage = CONFIG.MISSILE_SWARM_DAMAGE + missileDamage;
        this.alive = true;
        this.age = 0;
        this.fromCoordinator = fromCoordinator;

        // Core physics (thrust-steered model)
        this.heading = launchAngle;
        this.speed = 0;
        this.turnRate = 0;
        this.prevLosAngle = 0;

        // Interceptor state
        this.mode = 'offensive';
        this.interceptTarget = null;
        this.interceptReticleCreated = false; // track whether we already created a reticle for current intercept target

        // Retarget boost
        this.turnBoostTimer = 0;

        // Launch stagger
        this.launchDelay = 0;

        // Enhanced wobble
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.launchWobbleFreq = CONFIG.MISSILE_LAUNCH_WOBBLE_FREQ_MIN + Math.random() * (CONFIG.MISSILE_LAUNCH_WOBBLE_FREQ_MAX - CONFIG.MISSILE_LAUNCH_WOBBLE_FREQ_MIN);
        this.launchWobbleAmp = CONFIG.MISSILE_LAUNCH_WOBBLE_AMP_MIN + Math.random() * (CONFIG.MISSILE_LAUNCH_WOBBLE_AMP_MAX - CONFIG.MISSILE_LAUNCH_WOBBLE_AMP_MIN);
        this.diveWobbleFreq = 6 + Math.random() * 4;
        this.diveWobbleAmp = CONFIG.MISSILE_DIVE_WOBBLE_AMP + Math.random() * 5;
        this.currentWobbleAmp = this.launchWobbleAmp;

        if (fromCoordinator) {
            // Four-phase trajectory: launch UP from coordinator
            this.phase = 'LAUNCH';  // LAUNCH -> DECEL -> APEX -> DIVE
            this.launchDuration = CONFIG.MISSILE_LAUNCH_DURATION;
            this.decelDuration = CONFIG.MISSILE_DECEL_DURATION;
            this.apexDuration = CONFIG.MISSILE_APEX_DURATION;
            // Launch velocity: upward + slight horizontal fan
            this.heading = launchAngle;
            this.speed = CONFIG.MISSILE_LAUNCH_UP_SPEED + 50; // 550 px/s
            this.vx = Math.cos(this.heading) * this.speed;
            this.vy = Math.sin(this.heading) * this.speed;
            this.apexFlashed = false;
        } else {
            // Legacy two-phase trajectory: fan downward from UFO
            this.phase = 'LEGACY_LAUNCH';
            this.launchPhase = true;
            this.launchDuration = 0.5;
            this.vx = Math.cos(launchAngle) * 200;
            this.vy = 300;
            this.heading = Math.atan2(this.vy, this.vx);
            this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        }

        // Spiral parameters (legacy compat)
        this.spiralPhase = Math.random() * Math.PI * 2;
        this.spiralFreq = 3 + Math.random() * 2;
        this.spiralAmp = 30 + Math.random() * 20;
        this.trail = [];
        this.maxTrailLength = CONFIG.MISSILE_TRAIL_LENGTH;
        this.smokePuffs = [];
        this.smokeTimer = 0;
    }

    update(dt) {
        // Launch delay (stagger)
        if (this.age < this.launchDelay) {
            this.age += dt;
            return;
        }

        this.age += dt;

        // Store trail position
        this.trail.push({ x: this.x, y: this.y, age: 0 });
        if (this.trail.length > this.maxTrailLength) this.trail.shift();
        this.trail.forEach(t => t.age += dt);

        // Spawn billowy smoke puffs
        this.smokeTimer += dt;
        if (this.smokeTimer >= CONFIG.MISSILE_SMOKE_INTERVAL) {
            this.smokeTimer = 0;
            this.smokePuffs.push({
                x: this.x + (Math.random() - 0.5) * 4,
                y: this.y + (Math.random() - 0.5) * 4,
                radius: 2 + Math.random() * 2,
                age: 0,
                maxAge: 0.8 + Math.random() * 0.4,
                drift: { x: (Math.random() - 0.5) * 30, y: -25 - Math.random() * 20 }
            });
        }
        // Update smoke puffs
        for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
            const p = this.smokePuffs[i];
            p.age += dt;
            p.x += p.drift.x * dt;
            p.y += p.drift.y * dt;
            p.radius += dt * 14; // expand over time
            if (p.age >= p.maxAge) this.smokePuffs.splice(i, 1);
        }

        if (this.phase === 'LEGACY_LAUNCH') {
            // === Legacy UFO launch: fan down + spiral ===
            let spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (spd > 0) {
                let perpX = -this.vy / spd;
                let perpY = this.vx / spd;
                let spiralOffset = Math.sin(this.age * this.spiralFreq + this.spiralPhase) * this.spiralAmp;
                this.x += (this.vx + perpX * spiralOffset * 3) * dt;
                this.y += (this.vy + perpY * spiralOffset * 3) * dt;
            } else {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
            }
            this.vy -= 100 * dt;
            this.heading = Math.atan2(this.vy, this.vx);
            this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (this.age > this.launchDuration) {
                this.phase = 'HOMING';
                // Initialize PN state
                if (this.targetTank && this.targetTank.alive !== false) {
                    let tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
                    let ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
                    this.prevLosAngle = Math.atan2(ty - this.y, tx - this.x);
                } else {
                    this.prevLosAngle = this.heading;
                }
            }

        } else if (this.phase === 'LAUNCH') {
            // === Phase 1: Thrust-steered upward burst ===
            // Apply thrust along heading
            let thrustAccel = 200;
            this.vx += Math.cos(this.heading) * thrustAccel * dt;
            this.vy += Math.sin(this.heading) * thrustAccel * dt;
            // Light drag
            this.vx *= (1 - CONFIG.MISSILE_DRAG_LAUNCH * dt);
            this.vy *= (1 - CONFIG.MISSILE_DRAG_LAUNCH * dt);

            // Dramatic spiral wobble during launch
            this.wobblePhase += this.launchWobbleFreq * dt;
            let wobbleOffset = Math.sin(this.wobblePhase) * this.launchWobbleAmp;
            let perpX = -Math.sin(this.heading);
            let perpY = Math.cos(this.heading);

            this.x += (this.vx + perpX * wobbleOffset) * dt;
            this.y += (this.vy + perpY * wobbleOffset) * dt;

            // Track heading from velocity for smooth transition
            this.heading = Math.atan2(this.vy, this.vx);
            this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            if (this.age > this.launchDuration) {
                this.phase = 'DECEL';
            }

        } else if (this.phase === 'DECEL') {
            // === Phase 2: Zero thrust, heavy drag, gravity arc-over ===
            const phaseAge = this.age - this.launchDuration;
            const t = Math.min(1, phaseAge / this.decelDuration);

            // Heavy drag
            this.vx *= (1 - CONFIG.MISSILE_DRAG_DECEL * dt);
            this.vy *= (1 - CONFIG.MISSILE_DRAG_DECEL * dt);
            // Gravity curves them over
            this.vy += CONFIG.MISSILE_DECEL_GRAVITY * dt;

            // Wobble amplitude grows (widening spiral)
            let activeWobbleAmp = this.launchWobbleAmp * (1 + t * 0.5);
            this.wobblePhase += this.launchWobbleFreq * dt;
            let wobbleOffset = Math.sin(this.wobblePhase) * activeWobbleAmp;
            let spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (spd > 0) {
                let perpX = -this.vy / spd;
                let perpY = this.vx / spd;
                this.x += (this.vx + perpX * wobbleOffset) * dt;
                this.y += (this.vy + perpY * wobbleOffset) * dt;
            } else {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
            }

            // Track heading from velocity
            this.heading = Math.atan2(this.vy, this.vx);
            this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            if (phaseAge > this.decelDuration) {
                this.phase = 'APEX';
                this.apexStart = this.age;
            }

        } else if (this.phase === 'APEX') {
            // === Phase 3: Near-motionless pause, lock-on flash ===
            // Multiply velocity by 0.2 (near-motionless)
            if (!this.apexFlashed) {
                this.apexFlashed = true;
                this.apexFlashTimer = 0.12;
                this.vx *= 0.2;
                this.vy *= 0.2;
                this.speed *= 0.2;
                this.currentWobbleAmp = 5; // subtle trembling
            }
            if (this.apexFlashTimer > 0) {
                this.apexFlashTimer -= dt;
            }

            // Minimal drift
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Subtle wobble
            this.wobblePhase += this.diveWobbleFreq * dt;
            let wobbleOffset = Math.sin(this.wobblePhase) * this.currentWobbleAmp;
            let perpX = -Math.sin(this.heading);
            let perpY = Math.cos(this.heading);
            this.x += perpX * wobbleOffset * dt;
            this.y += perpY * wobbleOffset * dt;

            const apexAge = this.age - this.apexStart;
            if (apexAge > this.apexDuration) {
                // Initialize PN state
                if (this.targetTank && this.targetTank.alive !== false) {
                    let tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
                    let ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
                    this.prevLosAngle = Math.atan2(ty - this.y, tx - this.x);
                    // Heading snap toward target if angle > 45 degrees
                    let angleToTarget = Math.atan2(ty - this.y, tx - this.x);
                    let headingError = angleDiff(angleToTarget, this.heading);
                    if (Math.abs(headingError) > CONFIG.MISSILE_SNAP_THRESHOLD) {
                        this.heading += Math.sign(headingError) * CONFIG.MISSILE_SNAP_ANGLE;
                    }
                } else {
                    this.prevLosAngle = this.heading;
                }
                this.phase = 'DIVE';
            }

        } else if (this.phase === 'DIVE' || this.phase === 'HOMING') {
            // === THE CORE: PN Guidance with Interceptor Scanning ===
            const fuel = Math.max(0, 1 - this.age / CONFIG.MISSILE_MAX_LIFETIME);
            let tx, ty;
            let targetWobbleAmp = this.diveWobbleAmp;

            // PRIMARY: scan for interceptable threats
            this.interceptTarget = this.scanForThreats();

            if (this.interceptTarget) {
                // Create reticle when FIRST acquiring an intercept target
                if (!this.interceptReticleCreated) {
                    this.interceptReticleCreated = true;
                    missileTargetReticles.push({
                        target: this.interceptTarget,  // projectile reference
                        isProjectile: true,
                        timer: 0,
                        maxTimer: 2.5,
                        groupLabel: this.groupLabel || '?',
                        missileIndex: this.missileIndex || 0,
                        designation: this.designation || '?.?',
                        mode: 'intercept',
                        lockPhase: 'acquiring'
                    });
                }
                this.mode = 'interceptor';
                this.targetTank = null;
                // Lead targeting: predict intercept point
                let dist = Math.hypot(this.interceptTarget.x - this.x, this.interceptTarget.y - this.y);
                let timeToIntercept = dist / Math.max(this.speed, 1);
                tx = this.interceptTarget.x + this.interceptTarget.vx * timeToIntercept;
                ty = this.interceptTarget.y + this.interceptTarget.vy * timeToIntercept;
            } else {
                // Lost intercept target — reset reticle flag so a new one can be created for next target
                if (this.interceptReticleCreated) {
                    this.interceptReticleCreated = false;
                }
                this.interceptTarget = null;
                this.retarget();
                if (this.targetTank && this.targetTank.alive !== false) {
                    this.mode = 'offensive';
                    tx = this.targetTank.x + (this.targetTank.width || 0) / 2;
                    ty = this.targetTank.y + (this.targetTank.height || 0) / 2;
                } else {
                    this.mode = 'wander';
                }
            }

            if (this.mode !== 'wander') {
                // === PROPORTIONAL NAVIGATION ===
                let losAngle = Math.atan2(ty - this.y, tx - this.x);
                if (this.prevLosAngle === 0) this.prevLosAngle = losAngle;
                let losRate = angleDiff(losAngle, this.prevLosAngle) / dt;
                this.prevLosAngle = losAngle;

                let commandedAccel = CONFIG.MISSILE_PN_CONSTANT * this.speed * losRate;
                let desiredTurnRate = commandedAccel / Math.max(this.speed, 1);

                // Speed-dependent turn rate (wider arcs at high speed)
                let effectiveMaxTurn = CONFIG.MISSILE_MAX_TURN_RATE * (800 / Math.max(this.speed, 800));
                effectiveMaxTurn *= (0.3 + 0.7 * fuel);

                // Retarget boost
                if (this.turnBoostTimer > 0) {
                    effectiveMaxTurn *= CONFIG.MISSILE_RETARGET_BOOST;
                    this.turnBoostTimer -= dt;
                }

                // Terminal approach adjustments
                let dist = Math.hypot(tx - this.x, ty - this.y);
                if (dist < 150) {
                    effectiveMaxTurn *= 1.5;
                    targetWobbleAmp = CONFIG.MISSILE_TERMINAL_WOBBLE_AMP;
                } else if (dist < CONFIG.MISSILE_WOBBLE_DECAY_DIST) {
                    let t = dist / CONFIG.MISSILE_WOBBLE_DECAY_DIST;
                    targetWobbleAmp = CONFIG.MISSILE_TERMINAL_WOBBLE_AMP + (this.diveWobbleAmp - CONFIG.MISSILE_TERMINAL_WOBBLE_AMP) * t;
                } else {
                    targetWobbleAmp = this.diveWobbleAmp;
                }

                desiredTurnRate = clampValue(desiredTurnRate, -effectiveMaxTurn, effectiveMaxTurn);
                this.turnRate += (desiredTurnRate - this.turnRate) * CONFIG.MISSILE_TURN_RESPONSIVENESS * dt;
                this.turnRate = clampValue(this.turnRate, -effectiveMaxTurn * 1.2, effectiveMaxTurn * 1.2);
                this.heading += this.turnRate * dt;

                // Thrust + drag
                let thrust = CONFIG.MISSILE_DIVE_THRUST * (0.4 + 0.6 * fuel);
                if (dist < 150) thrust *= 1.3; // terminal boost
                this.speed += (thrust - CONFIG.MISSILE_DRAG_DIVE * this.speed * this.speed / 1000) * dt;
                this.speed = clampValue(this.speed, 0, CONFIG.MISSILE_MAX_SPEED);

                // Direct hit check for offensive mode
                if (this.mode === 'offensive' && dist < 30) {
                    this.hit();
                }
            } else {
                // === WANDER: no target — enhanced chaos ===
                let chaos = 1 - fuel;
                if (!this.wanderAngle) this.wanderAngle = this.heading;
                let jitter = 2 + chaos * 14;
                this.wanderAngle += (Math.random() - 0.5) * jitter * dt;
                if (chaos > 0.5 && Math.random() < chaos * 2 * dt) {
                    this.wanderAngle += (Math.random() - 0.5) * Math.PI;
                }

                let dTurn = angleDiff(this.wanderAngle, this.heading);
                this.turnRate += (dTurn * 4 - this.turnRate) * 6 * dt;
                this.heading += this.turnRate * dt;

                let wanderThrust = CONFIG.MISSILE_DIVE_THRUST * (0.3 + 0.7 * fuel) * 0.5;
                this.speed += (wanderThrust - CONFIG.MISSILE_DRAG_DIVE * this.speed * this.speed / 1000) * dt;
                this.speed = clampValue(this.speed, 0, CONFIG.MISSILE_MAX_SPEED * 0.7);

                // Gravity pull — subtle downward bias on heading
                this.heading += chaos * chaos * 0.5 * dt;

                targetWobbleAmp = this.diveWobbleAmp * (1 + chaos * 3);
            }

            // Compute velocity from heading
            this.vx = Math.cos(this.heading) * this.speed;
            this.vy = Math.sin(this.heading) * this.speed;

            // Wobble perpendicular to heading
            this.currentWobbleAmp += (targetWobbleAmp - this.currentWobbleAmp) * CONFIG.MISSILE_WOBBLE_DECAY_RATE * dt;
            this.wobblePhase += this.diveWobbleFreq * dt;
            let wobbleOffset = Math.sin(this.wobblePhase) * this.currentWobbleAmp;
            let perpX = -Math.sin(this.heading);
            let perpY = Math.cos(this.heading);

            this.x += (this.vx + perpX * wobbleOffset) * dt;
            this.y += (this.vy + perpY * wobbleOffset) * dt;
        }

        // Ground collision — explode on impact
        const groundY = canvas.height - 60;
        if (this.y >= groundY) {
            this.alive = false;
            createExplosion(this.x, groundY, 'small');
            screenShake = Math.max(screenShake, 0.12);
        }

        // Off screen check
        if (this.y > canvas.height + 50 || this.x < -100 || this.x > canvas.width + 100 || this.y < -400) {
            this.alive = false;
        }

        // Max lifetime — explode on timeout
        if (this.age > CONFIG.MISSILE_MAX_LIFETIME) {
            this.alive = false;
            createExplosion(this.x, this.y, 'small');
            screenShake = Math.max(screenShake, 0.1);
        }
    }

    retarget() {
        // Find nearest alive tank
        let allTanks = [...tanks, ...heavyTanks].filter(t => t.alive !== false);
        if (allTanks.length === 0) {
            // No targets — fly wild with spiral
            this.targetTank = null;
            return;
        }
        let nearest = null, minDist = Infinity;
        for (let t of allTanks) {
            let cx = t.x + (t.width || 0) / 2;
            let cy = t.y + (t.height || 0) / 2;
            let d = Math.sqrt((cx - this.x) ** 2 + (cy - this.y) ** 2);
            if (d < minDist) { minDist = d; nearest = t; }
        }
        this.targetTank = nearest;
    }

    scanForThreats() {
        let bestTarget = null;
        let bestScore = -1;

        for (const p of projectiles) {
            if (!p.alive) continue;
            if (claimedThreats.has(p)) continue;
            if (p.vy >= 0 && !this.isNearFriendly(p, CONFIG.MISSILE_INTERCEPT_NEAR_RANGE)) continue;

            const distToMe = Math.hypot(p.x - this.x, p.y - this.y);
            const minDistToFriendly = this.minDistanceToAnyFriendly(p);

            const proximityScore = 50 * (1 - Math.min(distToMe / CONFIG.MISSILE_INTERCEPT_PROXIMITY_MAX, 1));
            const urgencyScore = 40 * (1 - Math.min(minDistToFriendly / CONFIG.MISSILE_INTERCEPT_URGENCY_MAX, 1));
            const valueScore = p.type === 'missile' ? 10 : 0;
            const score = proximityScore + urgencyScore + valueScore;

            if (score > bestScore) {
                bestScore = score;
                bestTarget = p;
            }
        }

        if (bestTarget) {
            claimedThreats.add(bestTarget);
        }
        return bestTarget;
    }

    minDistanceToAnyFriendly(p) {
        let minDist = Infinity;
        if (ufo) {
            minDist = Math.min(minDist, Math.hypot(p.x - ufo.x, p.y - ufo.y));
        }
        for (const drone of activeDrones) {
            if (!drone.alive) continue;
            const dx = drone.x + (drone.width || 0) / 2;
            const dy = drone.y + (drone.height || 0) / 2;
            minDist = Math.min(minDist, Math.hypot(p.x - dx, p.y - dy));
        }
        for (const coord of activeCoordinators) {
            if (!coord.alive || coord.state === 'DYING') continue;
            minDist = Math.min(minDist, Math.hypot(p.x - coord.x, p.y - coord.y));
            for (const drone of (coord.subDrones || [])) {
                if (!drone.alive) continue;
                minDist = Math.min(minDist, Math.hypot(p.x - drone.x, p.y - drone.y));
            }
        }
        return minDist;
    }

    isNearFriendly(p, range) {
        return this.minDistanceToAnyFriendly(p) < range;
    }

    hit() {
        if (!this.targetTank) return;
        this.targetTank.health -= this.damage;
        this.alive = false;

        // Create explosion
        createExplosion(this.x, this.y, 'small');
        screenShake = Math.max(screenShake, 0.15);

        if (this.targetTank.health <= 0) {
            this.targetTank.alive = false;
            score += CONFIG.TANK_POINTS;
            pushOpsLogEvent(`TANK.ELIM +${CONFIG.TANK_POINTS}`, '#f80', { type: 'tankMissile' });
            createExplosion(this.targetTank.x + (this.targetTank.width || 0) / 2,
                            this.targetTank.y + (this.targetTank.height || 0) / 2, 'medium');
            createFloatingText(
                this.targetTank.x + (this.targetTank.width || 0) / 2,
                this.targetTank.y - 20,
                'DESTROYED!', '#ff4400'
            );
        } else {
            createFloatingText(
                this.targetTank.x + (this.targetTank.width || 0) / 2,
                this.targetTank.y - 20,
                `HIT! -${this.damage}`, '#ff8800'
            );
        }
    }

    render(ctx) {
        // Billowy smoke puffs (render behind everything)
        for (const p of this.smokePuffs) {
            const life = p.age / p.maxAge;
            const alpha = (1 - life) * 0.35;
            if (alpha <= 0) continue;
            ctx.save();
            ctx.globalAlpha = alpha;
            // Smoke goes from warm grey to cool grey as it ages
            const grey = Math.floor(80 + life * 60);
            ctx.fillStyle = life < 0.3 ? `rgba(180, 120, 60, ${alpha})` : `rgba(${grey}, ${grey}, ${grey + 10}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Hot exhaust trail (core)
        const flickerAlpha = 0.7 + 0.3 * Math.sin(this.age * 40);
        for (let i = 0; i < this.trail.length; i++) {
            let t = this.trail[i];
            let alpha = (1 - t.age * 1.8) * (i / this.trail.length) * flickerAlpha;
            if (alpha <= 0) continue;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = i % 2 === 0 ? '#ff4400' : '#ffaa00';
            const r = 3 + (this.trail.length - i) * 0.1;
            ctx.beginPath();
            ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Missile body
        ctx.save();
        let angle = this.heading;
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        // Body (elongated)
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose glow (cyan when intercepting, orange when offensive)
        ctx.shadowColor = this.mode === 'interceptor' ? '#0088ff' : '#ff4400';
        ctx.shadowBlur = 8;
        ctx.fillStyle = this.mode === 'interceptor' ? '#00ccff' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(4, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Apex lock-on flash (coordinator missiles only)
        if (this.apexFlashTimer > 0) {
            const flashAlpha = (this.apexFlashTimer / 0.12) * 0.9;
            const flashRadius = 8 + (1 - this.apexFlashTimer / 0.12) * 6;
            ctx.save();
            ctx.globalAlpha = flashAlpha;
            ctx.shadowColor = '#ffffaa';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ffffffcc';
            ctx.beginPath();
            ctx.arc(this.x, this.y, flashRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
}

// ============================================
// EXPLOSION/PARTICLE SYSTEM
// ============================================

let screenShake = 0;
let damageFlash = 0; // Red flash on damage

class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxSize = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.alive = true;
    }

    update(dt) {
        if (!this.alive) return;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Slow down
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.lifetime -= dt;

        // Size animation: expand then shrink
        const lifeRatio = this.lifetime / this.maxLifetime;
        if (lifeRatio > 0.7) {
            // Expand phase
            this.size = this.maxSize * (1 + (1 - lifeRatio) * 2);
        } else {
            // Shrink phase
            this.size = this.maxSize * (lifeRatio / 0.7);
        }

        if (this.lifetime <= 0) {
            this.alive = false;
        }
    }

    render() {
        if (!this.alive) return;

        const alpha = Math.max(0, this.lifetime / this.maxLifetime);
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(1, this.size), 0, Math.PI * 2);
        ctx.fill();
    }
}

function createExplosion(x, y, size) {
    const particleCount = size === 'large' ? 30 : size === 'medium' ? 20 : 10;
    const colors = [
        'rgb(255, 102, 0)',   // Orange
        'rgb(255, 255, 0)',   // Yellow
        'rgb(255, 0, 0)',     // Red
        'rgb(255, 255, 255)'  // White
    ];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 150;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const particleSize = size === 'large' ? 5 + Math.random() * 15 : 3 + Math.random() * 8;
        const lifetime = 0.3 + Math.random() * 0.5;

        particles.push(new Particle(x, y, vx, vy, color, particleSize, lifetime));
    }

    // Screen shake for large explosions
    if (size === 'large') {
        screenShake = 0.3;
    }

    // Explosion sound
    SFX.explosion(size === 'large');
}

function updateParticles(dt) {
    for (const particle of particles) {
        particle.update(dt);
    }
    particles = particles.filter(p => p.alive);
}

function renderParticles() {
    for (const particle of particles) {
        particle.render();
    }
}

// ============================================
// POWERUP CLASS
// ============================================

class Powerup {
    constructor(type, x) {
        this.type = type;
        const cfg = CONFIG.POWERUPS[type];

        this.width = 40;
        this.height = 40;
        this.x = x;

        // Position based on collection type
        if (cfg.collectionType === 'beam') {
            // Spawn on ground like targets
            this.y = canvas.height - 60 - this.height / 2;
            this.groundY = this.y;
        } else {
            // Spawn at UFO flight level (centered on UFO Y with some variance)
            // UFO is at 15% from top, so spawn between 10% and 20% for reachability
            this.y = canvas.height * 0.10 + Math.random() * (canvas.height * 0.10);
            this.groundY = null;
        }

        this.alive = true;
        this.lifetime = CONFIG.POWERUP_LIFETIME;
        this.bobOffset = 0;
        this.bobTime = Math.random() * Math.PI * 2;

        // Beamable powerup state
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.abductionTime = cfg.abductionTime || 0.5;
    }

    update(dt) {
        if (!this.alive) return;

        const cfg = CONFIG.POWERUPS[this.type];

        // Floating animation
        this.bobTime += dt * 3;
        this.bobOffset = Math.sin(this.bobTime) * 5;

        // Lifetime countdown (only if not being abducted)
        if (!this.beingAbducted) {
            this.lifetime -= dt;
            if (this.lifetime <= 0) {
                this.alive = false;
                return;
            }
        }

        // Collection logic based on type
        if (cfg.collectionType === 'collision') {
            if (ufo && this.checkCollisionWithUFO()) {
                this.collect();
            }
        } else if (cfg.collectionType === 'beam') {
            if (this.beingAbducted) {
                this.updateAbduction(dt);
            }
        }
    }

    updateAbduction(dt) {
        if (!ufo || !ufo.beamActive) {
            // Beam released - drop back
            this.beingAbducted = false;
            this.abductionProgress = 0;
            if (this.groundY !== null) {
                this.y = this.groundY;
            }
            return;
        }

        // Rise toward UFO
        const targetY = ufo.y + ufo.height / 2;
        const riseSpeed = (this.groundY - targetY) / this.abductionTime;
        this.y -= riseSpeed * dt;

        // Move horizontally toward beam center
        const dx = ufo.x - this.x;
        if (Math.abs(dx) > 1) {
            this.x += Math.sign(dx) * Math.min(200 * dt, Math.abs(dx));
        }

        this.abductionProgress += dt;

        // Check if abduction complete (either time elapsed OR reached UFO position)
        // The position check handles re-beaming a dropped powerup mid-air
        if (this.abductionProgress >= this.abductionTime || this.y <= targetY) {
            this.collect();
        }
    }

    checkCollisionWithUFO() {
        if (!ufo) return false;
        const dx = this.x - ufo.x;
        const dy = (this.y + this.bobOffset) - ufo.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ufo.width / 2.5 + this.width / 2);
    }

    startAbduction() {
        if (this.beingAbducted) return;
        this.beingAbducted = true;
        this.abductionProgress = 0;
    }

    collect() {
        this.alive = false;
        applyPowerup(this.type);
        const cfg = CONFIG.POWERUPS[this.type];
        createFloatingText(this.x, this.y, cfg.name, cfg.color);
        createExplosion(this.x, this.y, 'small');
        SFX.powerupCollect();
    }

    isInBeam(beamX, beamTop, beamBottom, beamTopWidth, beamBottomWidth) {
        const cfg = CONFIG.POWERUPS[this.type];
        if (cfg.collectionType !== 'beam') return false;

        const y = this.y + this.bobOffset;
        const t = (y - beamTop) / (beamBottom - beamTop);
        if (t < 0 || t > 1) return false;

        const beamWidthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
        const beamLeftEdge = beamX - beamWidthAtY / 2;
        const beamRightEdge = beamX + beamWidthAtY / 2;

        return this.x >= beamLeftEdge && this.x <= beamRightEdge;
    }

    render() {
        if (!this.alive) return;

        const cfg = CONFIG.POWERUPS[this.type];
        const drawX = this.x;
        const drawY = this.y + this.bobOffset;

        // Outer glow - use rgba for proper alpha support
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, 30);
        gradient.addColorStop(0, hexToRgba(cfg.color, 0.5));
        gradient.addColorStop(1, hexToRgba(cfg.color, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 30, 0, Math.PI * 2);
        ctx.fill();

        // Blink when expiring
        if (this.lifetime < 3 && Math.floor(this.lifetime * 4) % 2 === 0) {
            return;
        }

        // Draw shape based on type
        this.renderShape(drawX, drawY, cfg.color);

        // Inner shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(drawX - 5, drawY - 5, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    renderShape(x, y, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'health_pack':
                // Metroid-inspired energy tank — cubic green canister with "E"
                const tw = 26, th = 22;
                const tx = x - tw / 2, ty = y - th / 2;

                // Dark fill (tank body)
                ctx.fillStyle = '#062';
                ctx.fillRect(tx, ty, tw, th);

                // Bright green border
                ctx.strokeStyle = '#0f0';
                ctx.lineWidth = 2;
                ctx.strokeRect(tx, ty, tw, th);

                // Inner highlight border (inset 3px)
                ctx.strokeStyle = 'rgba(0, 255, 80, 0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(tx + 3, ty + 3, tw - 6, th - 6);

                // "E" letter
                ctx.fillStyle = '#0f0';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('E', x, y);

                // Top-edge highlight line
                ctx.strokeStyle = 'rgba(180, 255, 180, 0.6)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(tx + 1, ty + 1);
                ctx.lineTo(tx + tw - 1, ty + 1);
                ctx.stroke();
                break;

            case 'rapid_abduct':
                // Yellow lightning bolt
                ctx.fillStyle = '#ff0';
                ctx.beginPath();
                ctx.moveTo(x + 5, y - 18);
                ctx.lineTo(x - 8, y + 2);
                ctx.lineTo(x - 2, y + 2);
                ctx.lineTo(x - 5, y + 18);
                ctx.lineTo(x + 8, y - 2);
                ctx.lineTo(x + 2, y - 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;

            case 'shield':
                // Cyan shield/hexagon
                ctx.fillStyle = '#0af';
                ctx.beginPath();
                ctx.moveTo(x, y - 18);
                ctx.lineTo(x + 15, y - 9);
                ctx.lineTo(x + 15, y + 9);
                ctx.lineTo(x, y + 18);
                ctx.lineTo(x - 15, y + 9);
                ctx.lineTo(x - 15, y - 9);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Inner chevron
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x - 6, y - 4);
                ctx.lineTo(x, y + 6);
                ctx.lineTo(x + 6, y - 4);
                ctx.stroke();
                break;

            case 'energy_surge':
                // Magenta star/burst
                ctx.fillStyle = '#f0f';
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                    const radius = i % 2 === 0 ? 18 : 8;
                    const px = x + Math.cos(angle) * radius;
                    const py = y + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;

            case 'wide_beam':
                // Orange expanding arrows
                ctx.fillStyle = '#fa0';
                // Left arrow
                ctx.beginPath();
                ctx.moveTo(x - 4, y - 12);
                ctx.lineTo(x - 18, y);
                ctx.lineTo(x - 4, y + 12);
                ctx.lineTo(x - 4, y + 6);
                ctx.lineTo(x - 10, y);
                ctx.lineTo(x - 4, y - 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Right arrow
                ctx.beginPath();
                ctx.moveTo(x + 4, y - 12);
                ctx.lineTo(x + 18, y);
                ctx.lineTo(x + 4, y + 12);
                ctx.lineTo(x + 4, y + 6);
                ctx.lineTo(x + 10, y);
                ctx.lineTo(x + 4, y - 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
        }
    }
}

// Powerup spawning functions
function getRandomPowerupType() {
    // Only health_pack spawns as a random drop now.
    // Other powerup effects are handled by the tech tree.
    return 'health_pack';
}

function spawnPowerup() {
    if (powerups.length >= CONFIG.POWERUP_MAX_ON_SCREEN) return;

    const type = getRandomPowerupType();
    const margin = 100;

    // Find valid spawn position (avoid clustering)
    let x;
    let attempts = 0;
    const minSpacing = 100;

    do {
        x = margin + Math.random() * (canvas.width - margin * 2);
        attempts++;
    } while (attempts < 10 && powerups.some(p => Math.abs(p.x - x) < minSpacing));

    powerups.push(new Powerup(type, x));
    SFX.powerupSpawn();
}

function updatePowerupSpawning(dt) {
    if (gameState !== 'PLAYING') return;

    powerupSpawnTimer -= dt;
    if (powerupSpawnTimer <= 0) {
        spawnPowerup();
        // Reset timer with wave scaling (faster spawns in later waves)
        const [min, max] = CONFIG.POWERUP_SPAWN_INTERVAL;
        const waveMultiplier = 1 / (1 + (wave - 1) * CONFIG.POWERUP_SPAWN_WAVE_SCALING);
        const baseInterval = min + Math.random() * (max - min);
        powerupSpawnTimer = baseInterval * waveMultiplier;
    }
}

function applyPowerup(type) {
    const cfg = CONFIG.POWERUPS[type];
    const state = activePowerups[type];

    // All powerups restore beam energy to full
    ufo.energy = ufo.maxEnergy;

    switch (type) {
        case 'health_pack':
            // Instant heal
            const oldHealth = ufo.health;
            ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + cfg.healAmount);
            const healed = ufo.health - oldHealth;
            if (healed > 0) {
                createFloatingText(ufo.x, ufo.y - 50, `SHIELD +${healed}`, '#0f0');
            }
            break;

        case 'shield':
            // Add charges (with cap)
            if (state.active) {
                const newCharges = Math.min(
                    state.charges + cfg.charges,
                    CONFIG.POWERUP_STACK_MAX_CHARGES
                );
                const added = newCharges - state.charges;
                state.charges = newCharges;
                state.maxCharges = newCharges;
                state.stacks++;
                if (added > 0) {
                    createFloatingText(ufo.x, ufo.y - 50, `+${added} SHIELD`, '#0af');
                }
            } else {
                state.active = true;
                state.charges = cfg.charges;
                state.maxCharges = cfg.charges;
                state.stacks = 1;
            }
            break;

        case 'rapid_abduct':
        case 'energy_surge':
        case 'wide_beam':
            // Add duration (with cap)
            if (state.active) {
                const newTimer = Math.min(
                    state.timer + cfg.duration,
                    CONFIG.POWERUP_STACK_MAX_DURATION
                );
                const added = newTimer - state.timer;
                state.timer = newTimer;
                state.maxTimer = newTimer;
                state.stacks++;
                if (added > 0) {
                    createFloatingText(ufo.x, ufo.y - 50, `+${added.toFixed(0)}s`, cfg.color);
                }
            } else {
                state.active = true;
                state.timer = cfg.duration;
                state.maxTimer = cfg.duration;
                state.stacks = 1;
            }
            break;
    }
}

function updateActivePowerups(dt) {
    for (const [key, state] of Object.entries(activePowerups)) {
        if (state.active && state.timer > 0) {
            state.timer -= dt;
            if (state.timer <= 0) {
                state.active = false;
                state.timer = 0;
                state.stacks = 0;
                SFX.powerupExpire();
                if (ufo) {
                    createFloatingText(ufo.x, ufo.y - 60, `${CONFIG.POWERUPS[key].name} ENDED`, '#888');
                }
            }
        }
    }
}

// ============================================
// HEAVY TANK CLASS (Supertank)
// ============================================

class HeavyTank {
    constructor(x, direction) {
        // 1.5x the size of regular tank (reduced from 2x)
        this.width = 180;
        this.height = 113;
        this.x = x;
        this.y = canvas.height - 60 - this.height; // On ground
        this.direction = direction; // 1 = right, -1 = left
        // Slower than regular tanks, speed caps at wave 10
        this.speed = (CONFIG.TANK_BASE_SPEED + Math.min(wave - 1, 9) * (CONFIG.TANK_SPEED_INCREMENT * 0.5)) * 0.6;

        // Dual turrets - left and right
        this.turretAngleLeft = 0;
        this.turretAngleRight = 0;
        this.turretLength = 60;
        this.turretSpacing = 35; // Distance from center to each turret (flanking the hump)

        // Firing - only missiles, alternating turrets
        this.fireTimer = 1.5; // Fires more frequently
        this.nextTurret = 'left'; // Alternates between left and right

        // Abduction state
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.abductionTime = 3.5; // Takes longer to abduct (heavier)
        this.groundY = this.y;

        // More points for heavy tank
        this.points = 75;

        this.alive = true;
        this.respawnTimer = 0;

        // Stun state
        this.isStunned = false;
        this.stunTimer = 0;
        this.stunEffectTime = 0; // For visual effect animation

        // Health
        this.health = CONFIG.HEAVY_TANK_HEALTH;
        this.maxHealth = CONFIG.HEAVY_TANK_HEALTH;

        // Bomb damage tracking (takes 2 bombs to destroy)
        this.bombHits = 0;
        this.isDamaged = false;

        // Animation offset so tanks don't animate in sync
        this.animationOffset = Math.random() * 10000;

        // Progressive AI properties
        this.coordinatorHunter = false; // Set in spawnTanks() based on wave tier
    }

    getTankBehaviorTier() {
        if (wave <= 3) return 0;  // Basic
        if (wave <= 7) return 1;  // Tactical
        if (wave <= 11) return 2; // Strategic
        return 3;                  // Veteran
    }

    takeDamage(amount) {
        if (!this.alive || this.isStunned) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    }

    destroy(pointsMultiplier = 1) {
        this.alive = false;
        this.respawnTimer = 5; // Respawn timer (longer than regular tank)

        // Create explosion
        createExplosion(this.x + this.width / 2, this.y + this.height / 2, 'large');

        // Award points
        const pointsEarned = Math.floor(this.points * pointsMultiplier);
        score += pointsEarned;
        harvestCount.tank++;
        harvestBounce.tank = 1;
        waveStats.targetsBeamed.tank++;
        waveStats.tanksDestroyed++;
        waveStats.points += pointsEarned;

        // Floating text
        createFloatingText(this.x + this.width / 2, this.y, `+${pointsEarned}`, '#ff0');

        // Sound
        SFX.explosion(true);
    }

    update(dt) {
        if (!this.alive) {
            // Handle respawn timer
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // Handle stun state
        if (this.isStunned) {
            this.stunTimer -= dt;
            this.stunEffectTime += dt;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.stunTimer = 0;
                this.stunEffectTime = 0;
                SFX.tankRecovered();
            }
            return; // Skip all movement and shooting while stunned
        }

        // If being abducted, rise toward UFO center
        if (this.beingAbducted) {
            // If UFO was destroyed, drop the tank
            if (!ufo) {
                this.beingAbducted = false;
                this.abductionProgress = 0;
                this.y = this.groundY;
                return;
            }

            const rapidMultiplier = activePowerups.rapid_abduct.active ? CONFIG.POWERUPS.rapid_abduct.speedMultiplier : 1;
            const targetY = ufo.y + ufo.height / 2;
            const targetX = ufo.x - this.width / 2;
            const riseSpeed = (this.groundY - targetY) / this.abductionTime * rapidMultiplier;
            this.y -= riseSpeed * dt;

            // Move horizontally toward beam center
            const dx = targetX - this.x;
            const horizontalSpeed = Math.abs(dx) / Math.max(0.1, this.abductionTime - this.abductionProgress) * rapidMultiplier;
            if (Math.abs(dx) > 1) {
                this.x += Math.sign(dx) * Math.min(horizontalSpeed * dt, Math.abs(dx));
            }

            this.abductionProgress += dt * rapidMultiplier;

            // Check if abduction complete (either time elapsed OR reached UFO position)
            // The position check handles re-beaming a dropped target mid-air
            if (this.abductionProgress >= this.abductionTime || this.y <= targetY) {
                // MASSIVE explosion for heavy tank!
                const tankCenterX = this.x + this.width / 2;
                const tankCenterY = this.y + this.height / 2;

                // Multiple large explosions
                createExplosion(tankCenterX, tankCenterY, 'large');
                createExplosion(tankCenterX - 50, tankCenterY, 'large');
                createExplosion(tankCenterX + 50, tankCenterY, 'large');
                createExplosion(tankCenterX, tankCenterY - 40, 'large');
                createExplosion(tankCenterX, tankCenterY + 40, 'large');

                // Delayed secondary explosions
                setTimeout(() => createExplosion(tankCenterX + 40, tankCenterY + 30, 'large'), 100);
                setTimeout(() => createExplosion(tankCenterX - 40, tankCenterY - 30, 'large'), 150);
                setTimeout(() => createExplosion(tankCenterX + 60, tankCenterY - 20, 'medium'), 200);
                setTimeout(() => createExplosion(tankCenterX - 60, tankCenterY + 20, 'medium'), 250);

                // Big screen shake
                screenShake = 0.6;

                // Increment tank harvest counter
                harvestCount.tank++;
                waveStats.targetsBeamed.tank++;
                waveStats.tanksDestroyed++;

                // Award points (more than regular tank)
                const multiplierIndex = Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1);
                const multiplier = CONFIG.COMBO_MULTIPLIERS[multiplierIndex];
                const pointsEarned = Math.floor(this.points * multiplier);
                score += pointsEarned;
                waveStats.points += pointsEarned;
                if (multiplierIndex === CONFIG.COMBO_MULTIPLIERS.length - 1) {
                    waveStats.maxComboHit = true;
                }
                combo++;

                // Heal UFO (more healing for heavy tank)
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION * 2);

                // Restore energy proportional to points
                const energyRestored = Math.floor(this.points * CONFIG.ENERGY_RESTORE_RATIO);
                trackEnergyDelta(energyRestored, true);
                ufo.energy = Math.min(ufo.maxEnergy, ufo.energy + energyRestored);

                createFloatingText(this.x + this.width / 2, this.y, `+${pointsEarned}`, '#0f0');

                // Update high score
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('alienAbductoramaHighScore', highScore);
                }

                this.alive = false;
                this.respawnTimer = 5; // Longer respawn for heavy tank
            }
            return;
        }

        // Progressive AI tier
        const tier = this.getTankBehaviorTier();

        // Patrol movement
        this.x += this.direction * this.speed * dt;

        // Reverse at screen edges
        const margin = 50;
        if (this.x < margin) {
            this.x = margin;
            this.direction = 1;
        } else if (this.x > canvas.width - margin - this.width) {
            this.x = canvas.width - margin - this.width;
            this.direction = -1;
        }

        // Tactical (tier 1+): spread from other heavy tanks and avoid battle drones
        if (tier >= 1) {
            for (const other of heavyTanks) {
                if (other === this || !other.alive) continue;
                const dist = Math.abs(other.x - this.x);
                if (dist < 150) {
                    const pushDir = this.x < other.x ? -1 : 1;
                    this.x += pushDir * 25 * dt;
                }
            }
            for (const drone of activeDrones) {
                if (!drone.alive || drone.type !== 'battle') continue;
                const dist = Math.abs(drone.x - (this.x + this.width / 2));
                if (dist < 150) {
                    const pushDir = (this.x + this.width / 2) < drone.x ? -1 : 1;
                    this.x += pushDir * 30 * dt;
                }
            }
        }

        // Strategic (tier 2+): bias toward screen edges
        if (tier >= 2) {
            const edgeCenterX = canvas.width / 2;
            const fromCenter = (this.x + this.width / 2) - edgeCenterX;
            if (Math.abs(fromCenter) < canvas.width * 0.3) {
                this.x += Math.sign(fromCenter || 1) * 12 * dt;
            }
        }

        // Veteran (tier 3): evade bombs and player missiles
        if (tier >= 3) {
            for (const bomb of bombs) {
                if (!bomb.alive) continue;
                const dist = Math.hypot(bomb.x - (this.x + this.width / 2), bomb.y - (this.y + this.height / 2));
                if (dist < 200) {
                    const evadeDir = (this.x + this.width / 2) < bomb.x ? -1 : 1;
                    this.x += evadeDir * 60 * dt;
                }
            }
            for (const missile of playerMissiles) {
                if (!missile.alive) continue;
                const dist = Math.hypot(missile.x - (this.x + this.width / 2), missile.y - (this.y + this.height / 2));
                if (dist < 180) {
                    const evadeDir = (this.x + this.width / 2) < missile.x ? -1 : 1;
                    this.x += evadeDir * 45 * dt;
                }
            }
        }

        // Clamp to screen bounds after all movement modifications
        this.x = Math.max(margin, Math.min(canvas.width - margin - this.width, this.x));

        // Aim both turrets at priority target
        {
            let aimX = ufo ? ufo.x : this.x;
            let aimY = ufo ? ufo.y : this.y - 100;

            const centerX = this.x + this.width / 2;
            let bestTarget = null;
            let bestPriority = Infinity;
            let bestDist = Infinity;

            // Coordinator hunters flip priorities: coordinators (0) > drones (1,2)
            const battlePriority = this.coordinatorHunter ? 2 : 0;
            const harvesterPriority = this.coordinatorHunter ? 3 : 1;
            const coordPriority = this.coordinatorHunter ? 0 : 2;

            for (const drone of activeDrones) {
                if (!drone.alive || drone.state === 'FALLING') continue;
                const ddx = drone.x - centerX;
                const ddy = drone.y - this.y;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                const priority = drone.type === 'battle' ? battlePriority : harvesterPriority;
                if (priority < bestPriority || (priority === bestPriority && dist < bestDist)) {
                    bestTarget = drone;
                    bestPriority = priority;
                    bestDist = dist;
                }
            }
            for (const coord of activeCoordinators) {
                if (!coord.alive || coord.state === 'DEPLOYING' || coord.state === 'DYING') continue;
                const ddx = coord.x - centerX;
                const ddy = coord.y - this.y;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (coordPriority < bestPriority || (coordPriority === bestPriority && dist < bestDist)) {
                    bestTarget = coord;
                    bestPriority = coordPriority;
                    bestDist = dist;
                }
            }
            if (bestTarget) { aimX = bestTarget.x; aimY = bestTarget.y; }

            // Tactical+: lead shots by predicting target movement
            if (tier >= 1 && bestTarget) {
                const targetVx = bestTarget.vx || 0;
                const targetVy = bestTarget.vy || 0;
                if (targetVx !== 0 || targetVy !== 0) {
                    const dist = Math.hypot(aimX - centerX, aimY - this.y);
                    const bulletSpeed = CONFIG.MISSILE_SPEED;
                    const timeToHit = dist / bulletSpeed;
                    aimX += targetVx * timeToHit;
                    aimY += targetVy * timeToHit;
                }
            }

            const aimOffset = this.direction < 0 ? -30 : 30;

            // Left turret
            const leftTurretX = this.x + this.width / 2 + aimOffset - this.turretSpacing;
            const leftTurretY = this.y + 20;
            const targetAngleLeft = Math.atan2(aimY - leftTurretY, aimX - leftTurretX);
            this.turretAngleLeft += (targetAngleLeft - this.turretAngleLeft) * 5 * dt;

            // Right turret
            const rightTurretX = this.x + this.width / 2 + aimOffset + this.turretSpacing;
            const rightTurretY = this.y + 20;
            const targetAngleRight = Math.atan2(aimY - rightTurretY, aimX - rightTurretX);
            this.turretAngleRight += (targetAngleRight - this.turretAngleRight) * 5 * dt;
        }

        // Fire missiles at UFO (alternating turrets)
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && ufo) {
            this.fire();
            // Fire rate increases slightly with wave
            const fireRateMultiplier = 1 + (wave - 3) * 0.1;
            // Quota miss penalty: tanks fire faster per consecutive miss
            const quotaPenalty = 1 + CONFIG.QUOTA_MISS_PENALTY * consecutiveQuotaMisses;
            this.fireTimer = 1.5 / Math.min(fireRateMultiplier * quotaPenalty, 2.5);
        }
    }

    fire() {
        // Determine which turret fires
        const isLeft = this.nextTurret === 'left';
        this.nextTurret = isLeft ? 'right' : 'left';

        const fireOffset = this.direction < 0 ? -30 : 30;
        const turretX = this.x + this.width / 2 + fireOffset + (isLeft ? -this.turretSpacing : this.turretSpacing);
        const turretY = this.y + 20;
        const turretAngle = isLeft ? this.turretAngleLeft : this.turretAngleRight;

        // Always fire missiles
        const vx = Math.cos(turretAngle) * CONFIG.MISSILE_SPEED;
        const vy = Math.sin(turretAngle) * CONFIG.MISSILE_SPEED;

        projectiles.push(new Projectile(
            turretX + Math.cos(turretAngle) * this.turretLength,
            turretY + Math.sin(turretAngle) * this.turretLength,
            vx,
            vy,
            'missile'
        ));

        SFX.missileFire();
    }

    respawn() {
        this.alive = true;
        this.beingAbducted = false;
        this.abductionProgress = 0;
        this.isStunned = false;
        this.stunTimer = 0;
        this.stunEffectTime = 0;
        this.bombHits = 0;
        this.isDamaged = false;
        this.health = CONFIG.HEAVY_TANK_HEALTH;
        this.direction = Math.random() < 0.5 ? 1 : -1;
        const randomOffset = Math.random() * 300;
        this.x = this.direction === 1 ? -this.width - randomOffset : canvas.width + randomOffset;
        this.y = this.groundY;
        this.speed = (CONFIG.TANK_BASE_SPEED + (wave - 1) * CONFIG.TANK_SPEED_INCREMENT) * 0.6;
        this.speed = Math.min(this.speed, 60);
    }

    render() {
        if (!this.alive) return;

        let abductedTransform = false;
        if (this.beingAbducted) {
            const progress = Math.min(1, this.abductionProgress / this.abductionTime);
            const eased = progress * progress;
            const spinSpeed = 0.07 + eased * 0.35;
            const angle = (Date.now() / 1000) * spinSpeed * Math.PI * 2;
            const scale = 1 - eased * 0.3;
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
            abductedTransform = true;
        }

        const img = getAssetImage('tank', this.animationOffset);

        // Apply grayed out effect if stunned, reddish tint if damaged
        if (this.isStunned || this.isDamaged) {
            ctx.save();
            ctx.globalAlpha = this.isStunned ? 0.6 : 0.9;
        }

        if (img && img.complete) {
            ctx.save();
            if (this.direction < 0) {
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, this.width, this.height);
            } else {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        } else {
            // Placeholder - darker green for heavy tank
            ctx.fillStyle = this.isStunned ? '#555' : '#3a5a1f';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Treads
            ctx.fillStyle = '#222';
            ctx.fillRect(this.x, this.y + this.height - 20, this.width, 20);
        }

        // Draw both turrets
        this.renderTurrets();

        // Draw damage effects (smoke, cracks, fire)
        if (this.isDamaged) {
            this.renderDamageEffect();
        }

        if (this.isStunned) {
            ctx.restore();
        } else if (this.isDamaged) {
            ctx.restore();
        }

        if (this.health < this.maxHealth) {
            renderTankHealthBar(this.x, this.y, this.width, this.health, this.maxHealth);
        }

        if (this.isStunned) {
            // Draw spinning stars effect above tank
            this.renderStunEffect();
        }

        if (abductedTransform) {
            ctx.restore();
        }
    }

    renderDamageEffect() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height * 0.3;

        // Draw smoke plumes
        const time = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
            const offsetX = (i - 1) * 50;
            const smokeY = centerY - 20 - Math.sin(time * 2 + i) * 10;
            const smokeAlpha = 0.3 + Math.sin(time * 3 + i * 2) * 0.15;
            const smokeSize = 15 + Math.sin(time * 2.5 + i) * 5;

            ctx.fillStyle = `rgba(80, 80, 80, ${smokeAlpha})`;
            ctx.beginPath();
            ctx.arc(centerX + offsetX, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw fire/sparks
        const fireColors = ['#ff4400', '#ff8800', '#ffcc00'];
        for (let i = 0; i < 4; i++) {
            const angle = time * 5 + i * 1.5;
            const fireX = centerX + Math.cos(angle) * 30 + (i - 1.5) * 25;
            const fireY = this.y + this.height * 0.5 + Math.sin(angle * 2) * 5;
            const fireSize = 8 + Math.sin(time * 8 + i * 3) * 4;

            ctx.fillStyle = fireColors[i % 3];
            ctx.beginPath();
            ctx.arc(fireX, fireY, fireSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw crack lines on the tank body
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.2);
        ctx.lineTo(this.x + this.width * 0.4, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.35, this.y + this.height * 0.7);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.7, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.6, this.y + this.height * 0.6);
        ctx.stroke();
    }

    renderStunEffect() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y - 30;
        const numStars = 5; // More stars for heavy tank
        const radius = 40; // Larger radius for heavy tank
        const rotationSpeed = 3;

        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;

        for (let i = 0; i < numStars; i++) {
            const angle = (this.stunEffectTime * rotationSpeed * Math.PI * 2) + (i * Math.PI * 2 / numStars);
            const starX = centerX + Math.cos(angle) * radius;
            const starY = centerY + Math.sin(angle) * radius * 0.4;

            this.drawStar(starX, starY, 5, 10, 5);
        }

        ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    renderTurrets() {
        const turretOffset = this.direction < 0 ? -30 : 30;
        const centerX = this.x + this.width / 2 + turretOffset;
        const turretY = this.y + 30;

        // Left turret
        const leftTurretX = centerX - this.turretSpacing;
        this.renderSingleTurret(leftTurretX, turretY, this.turretAngleLeft);

        // Right turret
        const rightTurretX = centerX + this.turretSpacing;
        this.renderSingleTurret(rightTurretX, turretY, this.turretAngleRight);
    }

    renderSingleTurret(x, y, angle) {
        // Turret barrel
        ctx.strokeStyle = '#b0b0b0';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(angle) * this.turretLength,
            y + Math.sin(angle) * this.turretLength
        );
        ctx.stroke();
    }
}

// ============================================
// DRONE SYSTEM
// ============================================

class HarvesterDrone {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 40; this.vy = 0;
        this.width = 80; this.height = 60;
        this.state = 'FALLING';
        this.energyTimer = CONFIG.HARVESTER_TIMER; this.maxEnergy = CONFIG.HARVESTER_TIMER;
        this.target = null; this.batchCount = 0;
        this.batchSize = CONFIG.HARVESTER_BATCH_SIZE;
        this.collectedTargets = []; this.unfoldProgress = 0;
        this.walkSpeed = 120; this.collectRange = 90;
        this.collectTime = 2; this.collectProgress = 0;
        this.landingTimer = 0; this.direction = 1; this.patrolDirection = 1;
        this.alive = true; this.groundY = canvas.height - 60 - this.height;
        this.type = 'harvester'; this.sparkTimer = 0;
        this.deliverTimer = 0; this.legPhase = 0;
        this.deathBeepPlayed = false;
        this.beamSoundTimer = 0;
        this.orbPhase = 0;
        this.coordinator = null; // Set externally when spawned by HarvesterCoordinator
    }

    update(dt) {
        if (!this.alive) return;

        // Power-off sequence: flickering, then tipping over
        if (this.state === 'POWER_OFF') {
            this.powerOffSparkTimer += dt;
            if (this.powerOffDelay > 0) {
                // Flickering phase - capacitors still running
                this.powerOffDelay -= dt;
                // Sparks at increasing frequency as power drains
                const sparkInterval = 0.08 + this.powerOffDelay * 0.1;
                if (this.powerOffSparkTimer > sparkInterval) {
                    this.powerOffSparkTimer = 0;
                    particles.push(new Particle(this.x + (Math.random() - 0.5) * 30, this.y - 10,
                        (Math.random() - 0.5) * 80, -30 - Math.random() * 60,
                        Math.random() < 0.5 ? 'rgb(0, 255, 255)' : 'rgb(255, 200, 0)', 2, 0.25));
                }
            } else {
                // Tipping over phase
                this.powerOffTiltSpeed += 5 * dt;
                this.powerOffTilt += this.powerOffTiltDir * this.powerOffTiltSpeed * dt;
                // Sparks during fall
                if (this.powerOffSparkTimer > 0.06) {
                    this.powerOffSparkTimer = 0;
                    particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y,
                        (Math.random() - 0.5) * 50, -20 - Math.random() * 40,
                        'rgb(0, 255, 255)', 1.5, 0.2));
                }
                // Tipped over far enough - explode
                if (Math.abs(this.powerOffTilt) > 1.4) {
                    this.die();
                }
            }
            return;
        }

        const drainRate = techFlags.energyEfficiency ? 0.7 : 1.0;
        this.energyTimer -= drainRate * dt;
        if (techFlags.selfSustainingGrid) {
            this.energyTimer = Math.min(this.maxEnergy, this.energyTimer + 0.2 * dt);
        }
        this.legPhase += dt * 6;

        if (this.energyTimer <= 5) {
            this.sparkTimer += dt;
            if (this.sparkTimer > 0.3) {
                this.sparkTimer = 0;
                particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y - 5,
                    (Math.random() - 0.5) * 60, -30 - Math.random() * 40, 'rgb(0, 255, 255)', 2, 0.3));
            }
        }
        if (this.energyTimer <= 1 && !this.deathBeepPlayed) {
            this.deathBeepPlayed = true;
            SFX.dronePreExplode && SFX.dronePreExplode();
        }
        if (this.energyTimer <= 0) { this.die(); return; }

        switch (this.state) {
            case 'FALLING':
                this.vy += 600 * dt; this.y += this.vy * dt; this.x += this.vx * dt;
                if (this.y >= this.groundY) {
                    this.y = this.groundY; this.vy = 0;
                    this.state = 'LANDING'; this.landingTimer = 0.3;
                    screenShake = 0.15;
                    SFX.bombBounce && SFX.bombBounce();
                    for (let i = 0; i < 8; i++) {
                        const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
                        const speed = 30 + Math.random() * 50;
                        particles.push(new Particle(this.x, this.groundY + this.height,
                            Math.cos(angle) * speed, Math.sin(angle) * speed, 'rgb(139, 90, 43)', 3, 0.4));
                    }
                }
                break;
            case 'LANDING':
                this.landingTimer -= dt;
                if (this.landingTimer <= 0) { this.state = 'UNFOLDING'; this.unfoldProgress = 0; SFX.droneUnfold && SFX.droneUnfold('harvester'); }
                break;
            case 'UNFOLDING':
                this.unfoldProgress += dt;
                if (this.unfoldProgress >= 1) { this.unfoldProgress = 1; this.state = 'SEEKING'; }
                break;
            case 'SEEKING': {
                let closestTarget = null, closestDist = Infinity;
                for (const t of targets) {
                    if (!t.alive || t.beingAbducted) continue;
                    let claimed = false;
                    for (const d of activeDrones) {
                        if (d !== this && d.type === 'harvester' && d.target === t) { claimed = true; break; }
                    }
                    if (!claimed) {
                        for (const coord of activeCoordinators) {
                            if (claimed) break;
                            for (const d of coord.subDrones) {
                                if (d !== this && d.type === 'harvester' && d.target === t) { claimed = true; break; }
                            }
                        }
                    }
                    if (claimed) continue;
                    const dx = (t.x + t.width / 2) - this.x;
                    if (Math.abs(dx) < closestDist) { closestDist = Math.abs(dx); closestTarget = t; }
                }
                if (closestTarget) {
                    this.target = closestTarget;
                    const dx = (closestTarget.x + closestTarget.width / 2) - this.x;
                    this.direction = dx > 0 ? 1 : -1;
                    this.x += this.direction * this.walkSpeed * dt;
                    this.x = Math.max(20, Math.min(canvas.width - 20, this.x));
                    if (Math.abs(dx) <= this.collectRange) { this.state = 'COLLECTING'; this.collectProgress = 0; }
                } else {
                    this.target = null;
                    this.x += this.patrolDirection * this.walkSpeed * 0.5 * dt;
                    if (this.x < 40) { this.x = 40; this.patrolDirection = 1; }
                    if (this.x > canvas.width - 40) { this.x = canvas.width - 40; this.patrolDirection = -1; }
                    this.direction = this.patrolDirection;
                }
                break;
            }
            case 'COLLECTING': {
                if (!this.target || !this.target.alive || this.target.beingAbducted) {
                    if (this.target) { this.target.harvestShake = 0; this.target.harvestShrink = 0; }
                    this.state = 'SEEKING'; this.target = null; this.collectProgress = 0; this.orbPhase = 0; break;
                }
                const dx = (this.target.x + this.target.width / 2) - this.x;
                if (Math.abs(dx) > this.collectRange * 1.5) {
                    this.target.harvestShake = 0; this.target.harvestShrink = 0;
                    this.state = 'SEEKING'; this.collectProgress = 0; this.orbPhase = 0; break;
                }
                this.beamSoundTimer -= dt;
                if (this.beamSoundTimer <= 0) { SFX.droneBeam && SFX.droneBeam(); this.beamSoundTimer = 0.8 + Math.random() * 0.4; }
                this.collectProgress += dt / this.collectTime;
                // Set tasing/vibration intensity on target (ramps up as progress increases)
                this.target.harvestShake = this.collectProgress;
                // In last 20% of collection, start shrinking target
                if (this.collectProgress > 0.8) {
                    this.target.harvestShrink = (this.collectProgress - 0.8) / 0.2; // 0 to 1
                } else {
                    this.target.harvestShrink = 0;
                }
                if (this.collectProgress >= 1) {
                    // Target becomes orb - start orb flight phase
                    this.target.harvestShake = 0; this.target.harvestShrink = 0;
                    this.target.alive = false;
                    playTargetSound(this.target.type, 0.08);
                    // Spawn orb-to-harvester particles
                    const tcx = this.target.x + this.target.width / 2;
                    const tcy = this.target.y + this.target.height / 2;
                    for (let i = 0; i < 8; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        particles.push(new Particle(tcx, tcy,
                            (this.x - tcx) * 2 + (Math.random() - 0.5) * 30,
                            (this.y - tcy) * 2 + (Math.random() - 0.5) * 30,
                            'rgb(0, 255, 255)', 3, 0.4));
                    }

                    if (this.coordinator) {
                        // Coordinator mode: award immediately, transfer BM to coordinator
                        const mi = Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1);
                        const mul = CONFIG.COMBO_MULTIPLIERS[mi];
                        const pts = Math.floor(this.target.points * mul);
                        score += pts; waveStats.points += pts;
                        harvestCount[this.target.type]++; harvestBounce[this.target.type] = 1.0;
                        waveStats.targetsBeamed[this.target.type]++; quotaProgress++; combo++;
                        createFloatingText(this.x, this.y - 30, `+${pts}`, '#0f0', { fontSize: 14 });
                        if (ufo) { ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION); }
                        if (score > highScore) { highScore = score; localStorage.setItem('alienAbductoramaHighScore', highScore); }
                        // Transfer 1 BM to coordinator buffer
                        this.coordinator.addBioMatter(1);
                        // Spawn pulse orb traveling from drone to coordinator
                        this.coordinator.spawnBmPulse(this.x, this.y - 20, this.coordinator.x, this.coordinator.y, 'drone-to-coord');
                        this.target = null;
                        this.collectProgress = 0; this.orbPhase = 0;
                        this.state = 'SEEKING'; // No batching, go straight back to seeking
                    } else {
                        // Raw drone mode: batch collection
                        this.collectedTargets.push(this.target);
                        this.batchCount++;
                        this.target = null;
                        this.collectProgress = 0; this.orbPhase = 0;
                        if (this.batchCount >= this.batchSize) { this.state = 'DELIVERING'; this.deliverTimer = 0; SFX.droneDeliver && SFX.droneDeliver(); }
                        else { this.state = 'SEEKING'; }
                    }
                }
                break;
            }
            case 'DELIVERING': {
                // Coordinator-managed drones should never enter DELIVERING; bounce back
                if (this.coordinator) { this.state = 'SEEKING'; break; }
                this.deliverTimer += dt;
                if (this.deliverTimer >= 1.5) {
                    let totalPoints = 0;
                    for (const t of this.collectedTargets) {
                        const mi = Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1);
                        const mul = CONFIG.COMBO_MULTIPLIERS[mi];
                        const pts = Math.floor(t.points * mul);
                        totalPoints += pts; score += pts; waveStats.points += pts;
                        harvestCount[t.type]++; harvestBounce[t.type] = 1.0;
                        waveStats.targetsBeamed[t.type]++; quotaProgress++; combo++;
                    }
                    const bmEarned = CONFIG.BIO_MATTER_RATES.harvester_batch || 2;
                    bioMatter += bmEarned;
                    waveStats.droneHarvests++;
                    waveStats.bioMatterEarned += bmEarned;
                    createFloatingText(this.x, this.y - 30, `+${totalPoints}`, '#0f0');
                    createFloatingText(this.x + 20, this.y - 50, `+${bmEarned} BM`, '#4f4', { fontSize: 18 });
                    if (ufo) { ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION); }
                    if (score > highScore) { highScore = score; localStorage.setItem('alienAbductoramaHighScore', highScore); }
                    SFX.droneOrbReceive && SFX.droneOrbReceive();
                    this.collectedTargets = []; this.batchCount = 0; this.state = 'SEEKING';
                }
                break;
            }
        }
    }

    powerOff() {
        // Drones still deploying just die instantly
        if (this.state === 'FALLING' || this.state === 'LANDING' || this.state === 'UNFOLDING') {
            this.die();
            return;
        }
        if (this.state === 'POWER_OFF') return;
        this.state = 'POWER_OFF';
        // Clear harvest effects on current target
        if (this.target) { this.target.harvestShake = 0; this.target.harvestShrink = 0; this.target = null; }
        // Release collected targets as lost biomatter
        if (this.collectedTargets.length > 0) {
            const bmLost = CONFIG.BIO_MATTER_RATES.harvester_batch || 2;
            waveStats.lostDeliveries += this.collectedTargets.length;
            waveStats.lostBioMatter += bmLost;
            createFloatingText(this.x, this.y - 30, `-${bmLost} BM LOST`, '#f80', { fontSize: 18 });
            this.collectedTargets = [];
        }
        this.powerOffDelay = 0.3 + Math.random() * 1.5;
        this.powerOffTiltDir = Math.random() < 0.5 ? -1 : 1;
        this.powerOffTilt = 0;
        this.powerOffTiltSpeed = 0;
        this.powerOffSparkTimer = 0;
    }

    die() {
        this.alive = false;
        // Clear harvest effects on current target
        if (this.target) { this.target.harvestShake = 0; this.target.harvestShrink = 0; }
        SFX.droneDestroy && SFX.droneDestroy('harvester');
        // Lost deliveries - collected targets are NOT salvaged when drone is destroyed
        if (this.collectedTargets.length > 0) {
            const bmLost = CONFIG.BIO_MATTER_RATES.harvester_batch || 2;
            waveStats.lostDeliveries += this.collectedTargets.length;
            waveStats.lostBioMatter += bmLost;
            createFloatingText(this.x, this.y - 30, `-${bmLost} BM LOST`, '#f80', { fontSize: 18 });
            this.collectedTargets = [];
        }
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 80;
            particles.push(new Particle(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed,
                i % 2 === 0 ? 'rgb(0, 255, 255)' : 'rgb(255, 200, 0)', 3, 0.4));
        }
        createExplosion(this.x, this.y + this.height / 2, 'small');
        triggerMissionCommander('droneDestroyed');
    }

    render() {
        if (!this.alive) return;
        const cx = this.x, cy = this.y;

        if (this.state === 'FALLING') {
            ctx.fillStyle = '#555'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(cx - 24, cy - 32, 48, 64, 8); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#0ff'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx - 12, cy - 8); ctx.lineTo(cx + 12, cy - 8);
            ctx.moveTo(cx - 12, cy + 8); ctx.lineTo(cx + 12, cy + 8); ctx.stroke();
        } else if (this.state === 'LANDING') {
            ctx.fillStyle = '#555'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(cx - 24, cy - 32, 48, 64, 8); ctx.fill(); ctx.stroke();
        } else if (this.state === 'UNFOLDING') {
            const p = this.unfoldProgress;
            ctx.fillStyle = '#555'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
            const sp = p * 20;
            ctx.beginPath(); ctx.roundRect(cx - 24 - sp, cy - 32 + p * 16, 24, 64 - p * 32, 6); ctx.fill();
            ctx.beginPath(); ctx.roundRect(cx + sp, cy - 32 + p * 16, 24, 64 - p * 32, 6); ctx.fill();
            if (p > 0.3) { ctx.globalAlpha = (p - 0.3) / 0.7; this.renderSpiderBody(cx, cy); ctx.globalAlpha = 1; }
            if (p > 0.4) { this.renderLegs(cx, cy, (p - 0.4) / 0.6); }
        } else if (this.state === 'POWER_OFF') {
            ctx.save();
            // Pivot at the drone's feet for tipping over
            const pivotY = cy + this.height / 2;
            ctx.translate(cx, pivotY);
            ctx.rotate(this.powerOffTilt);
            ctx.translate(-cx, -pivotY);
            // Flicker opacity during delay phase
            if (this.powerOffDelay > 0) {
                ctx.globalAlpha = Math.random() < 0.3 ? 0.2 : 0.6 + Math.random() * 0.4;
            } else {
                ctx.globalAlpha = Math.max(0.3, 1 - Math.abs(this.powerOffTilt) * 0.5);
            }
            this.renderSpiderBody(cx, cy);
            this.renderLegs(cx, cy, 1);
            ctx.globalAlpha = 1;
            ctx.restore();
        } else {
            this.renderSpiderBody(cx, cy);
            this.renderLegs(cx, cy, 1);
            if (this.state === 'COLLECTING' && this.target && this.target.alive) {
                const tx = this.target.x + this.target.width / 2, ty = this.target.y + this.target.height / 2;
                const beamOriginY = cy - 20;
                const beamTopW = 16;
                const beamBottomW = 50 + Math.sin(Date.now() / 200) * 8;
                const beamH = ty - beamOriginY;

                ctx.save();
                // Mini tractor beam cone gradient
                const beamGrad = ctx.createLinearGradient(0, beamOriginY, 0, ty);
                beamGrad.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
                beamGrad.addColorStop(0.5, 'rgba(180, 0, 255, 0.3)');
                beamGrad.addColorStop(1, 'rgba(0, 255, 255, 0.15)');
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(cx - beamTopW / 2, beamOriginY);
                ctx.lineTo(cx + beamTopW / 2, beamOriginY);
                ctx.lineTo(tx + beamBottomW / 2, ty);
                ctx.lineTo(tx - beamBottomW / 2, ty);
                ctx.closePath();
                ctx.fill();

                // Edge glow lines
                const edgeAlpha = 0.4 + Math.sin(Date.now() / 100) * 0.2;
                ctx.strokeStyle = `rgba(0, 255, 255, ${edgeAlpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx - beamTopW / 2, beamOriginY);
                ctx.lineTo(tx - beamBottomW / 2, ty);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx + beamTopW / 2, beamOriginY);
                ctx.lineTo(tx + beamBottomW / 2, ty);
                ctx.stroke();

                // Mini spiral inside beam
                const segments = 15;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let si = 0; si <= segments; si++) {
                    const st = si / segments;
                    const sy = beamOriginY + beamH * st;
                    const widthAt = beamTopW + (beamBottomW - beamTopW) * st;
                    const sx = (cx + (tx - cx) * st) + Math.sin(st * Math.PI * 4 + Date.now() / 150) * (widthAt / 2 - 2);
                    if (si === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.stroke();

                // Second spiral (magenta offset) like turret beam
                ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let si = 0; si <= segments; si++) {
                    const st = si / segments;
                    const sy = beamOriginY + beamH * st;
                    const widthAt = beamTopW + (beamBottomW - beamTopW) * st;
                    const sx = (cx + (tx - cx) * st) + Math.sin(st * Math.PI * 4 + Date.now() / 150 + Math.PI) * (widthAt / 2 - 2);
                    if (si === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.stroke();

                // Outer glow layer for beam
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(cx - beamTopW / 2 - 4, beamOriginY);
                ctx.lineTo(cx + beamTopW / 2 + 4, beamOriginY);
                ctx.lineTo(tx + beamBottomW / 2 + 8, ty);
                ctx.lineTo(tx - beamBottomW / 2 - 8, ty);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;

                ctx.restore();

                // Progress ring
                ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(tx, ty - 20, 12, -Math.PI / 2, -Math.PI / 2 + this.collectProgress * Math.PI * 2); ctx.stroke();
            }
            if (this.state === 'DELIVERING' && ufo) {
                const prog = this.deliverTimer / 1.5;
                for (let i = 0; i < 3; i++) {
                    const dp = Math.min(1, prog + i * 0.15);
                    const dotX = cx + (ufo.x - cx) * dp + Math.sin(Date.now() / 100 + i) * 14;
                    const dotY = cy + (ufo.y - cy) * dp;
                    const orbR = 10 - dp * 4; // 10px down to 6px
                    // Outer glow
                    ctx.fillStyle = `rgba(0, 255, 255, ${(1 - dp * 0.5) * 0.25})`;
                    ctx.beginPath(); ctx.arc(dotX, dotY, orbR + 6, 0, Math.PI * 2); ctx.fill();
                    // Main orb
                    ctx.fillStyle = `rgba(0, 255, 255, ${1 - dp * 0.4})`;
                    ctx.beginPath(); ctx.arc(dotX, dotY, orbR, 0, Math.PI * 2); ctx.fill();
                    // Bright core
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - dp * 0.3})`;
                    ctx.beginPath(); ctx.arc(dotX, dotY, orbR * 0.4, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
        if (this.state !== 'FALLING' && this.state !== 'POWER_OFF') {
            const bw = 50, bh = 4, bx = cx - bw / 2, by = cy - 44;
            const ep = this.energyTimer / this.maxEnergy;
            ctx.fillStyle = '#333'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = ep > 0.3 ? '#0ff' : ep > 0.15 ? '#ff0' : '#f00';
            ctx.fillRect(bx, by, bw * ep, bh);
            if (this.state !== 'UNFOLDING' && this.state !== 'LANDING' && !this.coordinator) {
                ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
                ctx.fillText(`${this.batchCount}/${this.batchSize}`, cx, by - 4);
            }
        }
    }

    renderSpiderBody(cx, cy) {
        ctx.fillStyle = '#666'; ctx.beginPath(); ctx.ellipse(cx, cy, 28, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#0aa'; ctx.beginPath(); ctx.arc(cx, cy - 20, 10, Math.PI, 0); ctx.fill();
        const ga = 0.3 + Math.sin(Date.now() / 200) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 255, ${ga})`; ctx.beginPath(); ctx.arc(cx, cy - 24, 6, 0, Math.PI * 2); ctx.fill();
    }

    renderLegs(cx, cy, extend) {
        ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
        const ll = 36 * extend;
        for (let s = -1; s <= 1; s += 2) {
            for (let i = 0; i < 2; i++) {
                const bx = cx + s * (12 + i * 12), by2 = cy + 8;
                const kx = bx + s * ll * 0.6, ky = by2 + ll * 0.3;
                const fx = kx + s * ll * 0.3, fy = this.groundY + this.height;
                const wo = Math.sin(this.legPhase + i * Math.PI + (s > 0 ? 0 : Math.PI / 2)) * 6 * extend;
                ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(kx, ky + wo); ctx.lineTo(fx, fy); ctx.stroke();
            }
        }
    }

    takeDamage(amount) {
        if (techFlags.droneArmor) amount *= 0.6;
        this.energyTimer -= amount;
        if (this.energyTimer <= 0) this.die();
    }
}

class BattleDrone {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 40; this.vy = 0;
        this.width = 88; this.height = 68;
        this.state = 'FALLING';
        this.energyTimer = CONFIG.BATTLE_TIMER; this.maxEnergy = CONFIG.BATTLE_TIMER;
        this.target = null; this.unfoldProgress = 0;
        this.walkSpeed = 130; this.attackRange = 200; this.dps = 15;
        this.landingDamageRadius = 80; this.landingDamage = 20;
        this.landingTimer = 0; this.direction = 1; this.patrolDirection = 1;
        this.alive = true; this.groundY = canvas.height - 60 - this.height;
        this.type = 'battle'; this.sparkTimer = 0; this.legPhase = 0;
        this.deathBeepPlayed = false;
        this.shootSoundTimer = 0;
        this.coordinator = null; // Set externally when spawned by AttackCoordinator
    }

    update(dt) {
        if (!this.alive) return;

        // Power-off sequence: flickering, then tipping over
        if (this.state === 'POWER_OFF') {
            this.powerOffSparkTimer += dt;
            if (this.powerOffDelay > 0) {
                // Flickering phase - capacitors still running
                this.powerOffDelay -= dt;
                const sparkInterval = 0.08 + this.powerOffDelay * 0.1;
                if (this.powerOffSparkTimer > sparkInterval) {
                    this.powerOffSparkTimer = 0;
                    particles.push(new Particle(this.x + (Math.random() - 0.5) * 30, this.y - 10,
                        (Math.random() - 0.5) * 80, -30 - Math.random() * 60,
                        Math.random() < 0.5 ? 'rgb(255, 100, 50)' : 'rgb(255, 200, 0)', 2, 0.25));
                }
            } else {
                // Tipping over phase
                this.powerOffTiltSpeed += 5 * dt;
                this.powerOffTilt += this.powerOffTiltDir * this.powerOffTiltSpeed * dt;
                // Sparks during fall
                if (this.powerOffSparkTimer > 0.06) {
                    this.powerOffSparkTimer = 0;
                    particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y,
                        (Math.random() - 0.5) * 50, -20 - Math.random() * 40,
                        'rgb(255, 100, 50)', 1.5, 0.2));
                }
                if (Math.abs(this.powerOffTilt) > 1.4) {
                    this.die();
                }
            }
            return;
        }

        const drainRate = techFlags.energyEfficiency ? 0.7 : 1.0;
        this.energyTimer -= drainRate * dt;
        if (techFlags.selfSustainingGrid) {
            this.energyTimer = Math.min(this.maxEnergy, this.energyTimer + 0.2 * dt);
        }
        this.legPhase += dt * 8;

        if (this.energyTimer <= 5) {
            this.sparkTimer += dt;
            if (this.sparkTimer > 0.25) {
                this.sparkTimer = 0;
                particles.push(new Particle(this.x + (Math.random() - 0.5) * 24, this.y - 5,
                    (Math.random() - 0.5) * 70, -40 - Math.random() * 40, 'rgb(255, 100, 50)', 2, 0.3));
            }
        }
        if (this.energyTimer <= 1 && !this.deathBeepPlayed) {
            this.deathBeepPlayed = true;
            SFX.dronePreExplode && SFX.dronePreExplode();
        }
        if (this.energyTimer <= 0) { this.die(); return; }

        switch (this.state) {
            case 'FALLING':
                this.vy += 600 * dt; this.y += this.vy * dt; this.x += this.vx * dt;
                if (this.y >= this.groundY) {
                    this.y = this.groundY; this.vy = 0;
                    this.state = 'LANDING'; this.landingTimer = 0.4;
                    screenShake = 0.3; SFX.explosion(false);
                    for (const tank of tanks) {
                        if (!tank.alive) continue;
                        const ddx = (tank.x + tank.width / 2) - this.x, ddy = (tank.y + tank.height / 2) - (this.y + this.height / 2);
                        if (Math.sqrt(ddx * ddx + ddy * ddy) < this.landingDamageRadius) tank.takeDamage(this.landingDamage);
                    }
                    for (const ht of heavyTanks) {
                        if (!ht.alive) continue;
                        const ddx = (ht.x + ht.width / 2) - this.x, ddy = (ht.y + ht.height / 2) - (this.y + this.height / 2);
                        if (Math.sqrt(ddx * ddx + ddy * ddy) < this.landingDamageRadius) ht.takeDamage(this.landingDamage);
                    }
                    for (let i = 0; i < 15; i++) {
                        const angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 80;
                        const color = i % 3 === 0 ? 'rgb(255, 100, 0)' : i % 3 === 1 ? 'rgb(255, 200, 0)' : 'rgb(139, 90, 43)';
                        particles.push(new Particle(this.x, this.groundY + this.height,
                            Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4, 0.5));
                    }
                }
                break;
            case 'LANDING':
                this.landingTimer -= dt;
                if (this.landingTimer <= 0) { this.state = 'UNFOLDING'; this.unfoldProgress = 0; SFX.droneUnfold && SFX.droneUnfold('battle'); }
                break;
            case 'UNFOLDING':
                this.unfoldProgress += dt;
                if (this.unfoldProgress >= 1) { this.unfoldProgress = 1; this.state = 'SEEKING'; }
                break;
            case 'SEEKING': {
                let ct = null, cd = Infinity;
                const allEnemies = [...tanks, ...heavyTanks].filter(t => t.alive);

                for (const t of allEnemies) {
                    const dx = Math.abs((t.x + t.width / 2) - this.x);
                    if (dx < cd) { cd = dx; ct = t; }
                }

                if (ct) {
                    this.target = ct;
                    const dx = (ct.x + ct.width / 2) - this.x;
                    this.direction = dx > 0 ? 1 : -1;
                    if (Math.abs(dx) > this.attackRange) {
                        this.x += this.direction * this.walkSpeed * dt;
                        this.x = Math.max(20, Math.min(canvas.width - 20, this.x));
                    } else { this.state = 'ATTACKING'; }
                } else { this.target = null; this.state = 'PATROLLING'; }
                break;
            }
            case 'ATTACKING': {
                if (!this.target || !this.target.alive) { this.target = null; this.state = 'SEEKING'; break; }
                const dx = (this.target.x + this.target.width / 2) - this.x;
                if (Math.abs(dx) > this.attackRange * 1.3) { this.state = 'SEEKING'; break; }
                this.direction = dx > 0 ? 1 : -1;
                this.shootSoundTimer -= dt;
                if (this.shootSoundTimer <= 0) { SFX.droneShoot && SFX.droneShoot(); this.shootSoundTimer = 0.4 + Math.random() * 0.3; }
                this.target.takeDamage(this.dps * dt);
                break;
            }
            case 'PATROLLING':
                this.x += this.patrolDirection * this.walkSpeed * 0.5 * dt;
                if (this.x < 40) { this.x = 40; this.patrolDirection = 1; }
                if (this.x > canvas.width - 40) { this.x = canvas.width - 40; this.patrolDirection = -1; }
                this.direction = this.patrolDirection;
                if ([...tanks, ...heavyTanks].some(t => t.alive)) this.state = 'SEEKING';
                break;
        }
    }

    powerOff() {
        // Drones still deploying just die instantly
        if (this.state === 'FALLING' || this.state === 'LANDING' || this.state === 'UNFOLDING') {
            this.die();
            return;
        }
        if (this.state === 'POWER_OFF') return;
        this.state = 'POWER_OFF';
        this.target = null;
        this.powerOffDelay = 0.3 + Math.random() * 1.5;
        this.powerOffTiltDir = Math.random() < 0.5 ? -1 : 1;
        this.powerOffTilt = 0;
        this.powerOffTiltSpeed = 0;
        this.powerOffSparkTimer = 0;
    }

    die() {
        this.alive = false;
        SFX.droneDestroy && SFX.droneDestroy('battle');
        createExplosion(this.x, this.y + this.height / 2, 'medium');
        screenShake = 0.2;
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2, speed = 50 + Math.random() * 100;
            particles.push(new Particle(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed,
                i % 2 === 0 ? 'rgb(255, 100, 50)' : 'rgb(255, 200, 0)', 4, 0.5));
        }
        triggerMissionCommander('droneDestroyed');
    }

    render() {
        if (!this.alive) return;
        const cx = this.x, cy = this.y;

        if (this.state === 'FALLING') {
            ctx.fillStyle = '#444'; ctx.strokeStyle = '#f44'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(cx - 28, cy - 36, 56, 72, 8); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#f44'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx - 16, cy - 8); ctx.lineTo(cx + 16, cy - 8);
            ctx.moveTo(cx - 16, cy + 8); ctx.lineTo(cx + 16, cy + 8); ctx.stroke();
        } else if (this.state === 'LANDING') {
            ctx.fillStyle = '#444'; ctx.strokeStyle = '#f44'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(cx - 28, cy - 36, 56, 72, 8); ctx.fill(); ctx.stroke();
        } else if (this.state === 'UNFOLDING') {
            const p = this.unfoldProgress;
            ctx.fillStyle = '#444'; ctx.strokeStyle = '#f44'; ctx.lineWidth = 2;
            const sp = p * 24;
            ctx.beginPath(); ctx.roundRect(cx - 28 - sp, cy - 36 + p * 20, 28, 72 - p * 40, 6); ctx.fill();
            ctx.beginPath(); ctx.roundRect(cx + sp, cy - 36 + p * 20, 28, 72 - p * 40, 6); ctx.fill();
            if (p > 0.3) { ctx.globalAlpha = (p - 0.3) / 0.7; this.renderSpiderBody(cx, cy); ctx.globalAlpha = 1; }
            if (p > 0.4) { this.renderLegs(cx, cy, (p - 0.4) / 0.6); }
        } else if (this.state === 'POWER_OFF') {
            ctx.save();
            const pivotY = cy + this.height / 2;
            ctx.translate(cx, pivotY);
            ctx.rotate(this.powerOffTilt);
            ctx.translate(-cx, -pivotY);
            if (this.powerOffDelay > 0) {
                ctx.globalAlpha = Math.random() < 0.3 ? 0.2 : 0.6 + Math.random() * 0.4;
            } else {
                ctx.globalAlpha = Math.max(0.3, 1 - Math.abs(this.powerOffTilt) * 0.5);
            }
            this.renderSpiderBody(cx, cy);
            this.renderLegs(cx, cy, 1);
            ctx.globalAlpha = 1;
            ctx.restore();
        } else {
            this.renderSpiderBody(cx, cy);
            this.renderLegs(cx, cy, 1);
            if (this.state === 'ATTACKING' && this.target && this.target.alive) {
                const tx = this.target.x + this.target.width / 2, ty = this.target.y + this.target.height / 2;
                const ba = 0.6 + Math.sin(Date.now() / 80) * 0.3;
                const laserOriginY = cy - 28;
                // Outermost soft glow
                ctx.strokeStyle = `rgba(255, 60, 20, ${ba * 0.12})`; ctx.lineWidth = 16;
                ctx.beginPath(); ctx.moveTo(cx, laserOriginY); ctx.lineTo(tx, ty); ctx.stroke();
                // Wide outer glow
                ctx.strokeStyle = `rgba(255, 100, 50, ${ba * 0.25})`; ctx.lineWidth = 10;
                ctx.beginPath(); ctx.moveTo(cx, laserOriginY); ctx.lineTo(tx, ty); ctx.stroke();
                // Mid glow
                ctx.strokeStyle = `rgba(255, 80, 40, ${ba * 0.5})`; ctx.lineWidth = 5;
                ctx.beginPath(); ctx.moveTo(cx, laserOriginY); ctx.lineTo(tx, ty); ctx.stroke();
                // Bright core
                ctx.strokeStyle = `rgba(255, 200, 180, ${ba})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, laserOriginY); ctx.lineTo(tx, ty); ctx.stroke();
                // Impact glow at target
                ctx.fillStyle = `rgba(255, 100, 30, ${ba * 0.4})`;
                ctx.beginPath(); ctx.arc(tx, ty, 12, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = `rgba(255, 200, 100, ${ba * 0.6})`;
                ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fill();
                // Origin glow at cannon
                ctx.fillStyle = `rgba(255, 80, 50, ${ba * 0.5})`;
                ctx.beginPath(); ctx.arc(cx, laserOriginY, 8, 0, Math.PI * 2); ctx.fill();
                if (Math.random() < 0.4) {
                    particles.push(new Particle(tx + (Math.random() - 0.5) * 20, ty + (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, 'rgb(255, 200, 50)', 2, 0.2));
                }
            }
        }
        if (this.state !== 'FALLING' && this.state !== 'POWER_OFF') {
            const bw = 50, bh = 4, bx = cx - bw / 2, by = cy - 48;
            const ep = this.energyTimer / this.maxEnergy;
            ctx.fillStyle = '#333'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = ep > 0.3 ? '#f44' : ep > 0.15 ? '#ff0' : '#f00';
            ctx.fillRect(bx, by, bw * ep, bh);
        }
    }

    renderSpiderBody(cx, cy) {
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.ellipse(cx, cy, 32, 24, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f44'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#c33'; ctx.beginPath(); ctx.arc(cx, cy - 24, 14, Math.PI, 0); ctx.fill();
        ctx.strokeStyle = '#a22'; ctx.lineWidth = 4; ctx.beginPath();
        const ba = this.target && this.target.alive
            ? Math.atan2((this.target.y + this.target.height / 2) - (cy - 28), (this.target.x + this.target.width / 2) - cx)
            : this.direction > 0 ? 0 : Math.PI;
        ctx.moveTo(cx, cy - 28); ctx.lineTo(cx + Math.cos(ba) * 24, cy - 28 + Math.sin(ba) * 24); ctx.stroke();
        const ga = 0.3 + Math.sin(Date.now() / 150) * 0.2;
        ctx.fillStyle = `rgba(255, 80, 50, ${ga})`; ctx.beginPath(); ctx.arc(cx, cy - 28, 8, 0, Math.PI * 2); ctx.fill();
    }

    renderLegs(cx, cy, extend) {
        ctx.strokeStyle = '#777'; ctx.lineWidth = 3.5;
        const ll = 40 * extend;
        for (let s = -1; s <= 1; s += 2) {
            for (let i = 0; i < 2; i++) {
                const bx = cx + s * (14 + i * 14), by2 = cy + 10;
                const kx = bx + s * ll * 0.6, ky = by2 + ll * 0.3;
                const fx = kx + s * ll * 0.3, fy = this.groundY + this.height;
                const wo = Math.sin(this.legPhase + i * Math.PI + (s > 0 ? 0 : Math.PI / 2)) * 8 * extend;
                ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(kx, ky + wo); ctx.lineTo(fx, fy); ctx.stroke();
            }
        }
    }

    takeDamage(amount) {
        if (techFlags.droneArmor) amount *= 0.6;
        this.energyTimer -= amount;
        if (this.energyTimer <= 0) this.die();
    }
}

// --- Coordinator classes ---

class Coordinator {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'harvester' or 'attack'
        this.alive = true;
        this.state = 'DEPLOYING'; // DEPLOYING, ACTIVE, LOW_ENERGY, DYING

        // Energy
        this.maxEnergy = 15; // 15 second timer
        this.energyTimer = this.maxEnergy;

        // Hover target: ~40% from top of canvas
        this.targetY = canvas.height * 0.40;
        this.deploySpeed = 150; // pixels per second during deploy descent

        // Lazy follow UFO
        this.followLag = 0.5; // How slowly it follows (lower = laggier)

        // Bobbing motion
        this.bobPhase = Math.random() * Math.PI * 2;
        this.bobSpeed = 1.5 + Math.random() * 0.5;
        this.bobAmpY = 8 + Math.random() * 4;
        this.bobAmpX = 4 + Math.random() * 2;

        // Visual
        this.spinAngle = Math.random() * Math.PI * 2;
        this.spinSpeed = 1.2; // radians per second
        this.glowPulse = 0;
        this.width = 48; // 1.5x drone size roughly
        this.height = 56; // slightly elongated vertically

        // Shield (from DN3 Shield Transfer)
        this.shieldCharge = techFlags.shieldTransfer ? 1 : 0;
        this.shieldRegenTimer = 0;
        this.shieldRegenTime = 30; // seconds to regen shield

        // Sub-drones
        this.subDrones = [];
        this.maxSubDrones = techFlags.fleetExpansion ? 5 : 3;
        this.redeployTimers = []; // timers for destroyed sub-drones awaiting redeploy
        this.redeployDelay = techFlags.autonomousSwarm ? 0 : (techFlags.fleetResilience ? 1.5 : 3.0);

        // Deploy animation
        this.deployProgress = 0;
        this.unfoldProgress = 0;

        // Dying fall state
        this.dyingTimer = 0;
        this.dyingVy = 0;
        this.dyingTilt = 0;
        this.dyingTiltSpeed = 0;
        this.dyingTiltDir = 0;
        this.dyingSmokeTimer = 0;

        // BM pulse orbs traveling along tether lines
        this.bmPulses = []; // { fromX, fromY, toX, toY, progress, duration, type: 'drone-to-coord' | 'coord-to-ufo' }

        // Charging UX state
        this.isBeingCharged = false;      // Currently receiving charge beam
        this.chargeShimmerPhase = 0;      // Shimmer animation on energy bar
        this.sosTimer = 0;                // Timer for SOS beacon pulses
        this.sosRings = [];               // Active expanding SOS rings [{radius, alpha, maxRadius}]
        this.inSnapRange = false;         // UFO is within snap range
        this.snapHighlightPulse = 0;      // Pulse animation for proximity highlight
    }

    spawnBmPulse(fromX, fromY, toX, toY, type) {
        this.bmPulses.push({
            fromX, fromY, toX, toY,
            progress: 0,
            duration: type === 'drone-to-coord' ? 0.4 : 0.5,
            type
        });
    }

    updateBmPulses(dt) {
        for (let i = this.bmPulses.length - 1; i >= 0; i--) {
            const p = this.bmPulses[i];
            p.progress += dt / p.duration;
            if (p.progress >= 1) {
                // Pulse arrived — play sound and spawn a little flash
                if (p.type === 'drone-to-coord') {
                    SFX.droneDeliver && SFX.droneDeliver();
                    // Small flash at coordinator
                    particles.push(new Particle(this.x, this.y,
                        0, 0, 'rgb(0, 255, 200)', 6, 0.25));
                } else if (p.type === 'coord-to-ufo' && ufo) {
                    SFX.droneOrbReceive && SFX.droneOrbReceive();
                    // Small flash at UFO
                    particles.push(new Particle(ufo.x, ufo.y + ufo.height / 2,
                        0, 0, 'rgb(0, 255, 255)', 8, 0.3));
                }
                this.bmPulses.splice(i, 1);
            }
        }
    }

    update(dt) {
        if (!this.alive) return;

        this.updateBmPulses(dt);
        this.spinAngle += this.spinSpeed * dt;
        this.glowPulse += dt * 3;

        switch (this.state) {
            case 'DEPLOYING':
                // Descend to hover altitude
                this.y += this.deploySpeed * dt;
                if (this.y >= this.targetY) {
                    this.y = this.targetY;
                    this.state = 'ACTIVE';
                    this.spawnSubDrones();
                }
                break;

            case 'ACTIVE':
            case 'LOW_ENERGY':
                // Bobbing motion
                this.bobPhase += this.bobSpeed * dt;

                // Lazy follow UFO horizontally with spacing offset
                if (ufo) {
                    // Fan out coordinators evenly below UFO
                    const aliveCoords = activeCoordinators.filter(c => c.alive && c.state !== 'DYING');
                    const myIndex = aliveCoords.indexOf(this);
                    const total = aliveCoords.length;
                    const spacing = 80;
                    // Center the group: e.g. 3 coordinators -> offsets of -80, 0, +80
                    const offsetX = total <= 1 ? 0 : (myIndex - (total - 1) / 2) * spacing;
                    const targetX = ufo.x + offsetX + Math.sin(this.bobPhase * 0.7) * this.bobAmpX;
                    const dx = targetX - this.x;
                    this.x += dx * this.followLag * dt;
                }

                // Bob vertically around target altitude
                this.y = this.targetY + Math.sin(this.bobPhase) * this.bobAmpY;

                // Energy drain
                let drainRate = 1.0; // 1 energy per second (15s total)
                if (techFlags.energyEfficiency) drainRate *= 0.7; // 30% reduction
                this.energyTimer -= drainRate * dt;

                // Self-sustaining grid passive regen
                if (techFlags.selfSustainingGrid) {
                    this.energyTimer = Math.min(this.maxEnergy, this.energyTimer + 0.2 * dt);
                }

                // Low energy check
                if (this.energyTimer <= this.maxEnergy * 0.25 && this.state !== 'LOW_ENERGY') {
                    this.state = 'LOW_ENERGY';
                }
                if (this.energyTimer > this.maxEnergy * 0.25 && this.state === 'LOW_ENERGY') {
                    this.state = 'ACTIVE'; // recovered
                }

                // Sinking when low energy (raise targetY so it drifts down)
                if (this.state === 'LOW_ENERGY') {
                    this.targetY += 15 * dt;
                }

                // SOS beacon
                if (this.state === 'LOW_ENERGY') {
                    const sosInterval = this.energyTimer <= this.maxEnergy * 0.10 ?
                        CONFIG.COORD_SOS_DYING_INTERVAL : CONFIG.COORD_SOS_INTERVAL;
                    this.sosTimer += dt;
                    if (this.sosTimer >= sosInterval) {
                        this.sosTimer = 0;
                        this.sosRings.push({ radius: this.width * 0.5, alpha: 0.8 });
                        SFX.distressBeep && SFX.distressBeep();
                    }
                }
                // Update SOS rings
                for (let i = this.sosRings.length - 1; i >= 0; i--) {
                    const ring = this.sosRings[i];
                    ring.radius += 60 * dt;
                    ring.alpha -= dt / CONFIG.COORD_SOS_RING_DURATION;
                    if (ring.alpha <= 0 || ring.radius >= CONFIG.COORD_SOS_RING_MAX_RADIUS) {
                        this.sosRings.splice(i, 1);
                    }
                }

                // Death at 0 energy
                if (this.energyTimer <= 0) {
                    this.state = 'DYING';
                    this.energyTimer = 0;
                }

                // Shield regeneration
                if (techFlags.shieldTransfer && this.shieldCharge <= 0) {
                    this.shieldRegenTimer += dt;
                    const regenTime = techFlags.fleetResilience ? 15 : 30;
                    if (this.shieldRegenTimer >= regenTime) {
                        this.shieldCharge = 1;
                        this.shieldRegenTimer = 0;
                    }
                }

                // Update sub-drones
                this.updateSubDrones(dt);

                // Handle redeploy timers
                this.updateRedeployTimers(dt);

                break;

            case 'DYING':
                this.dyingTimer += dt;

                // Pick tilt direction once
                if (this.dyingTiltDir === 0) {
                    this.dyingTiltDir = Math.random() < 0.5 ? -1 : 1;
                }

                if (this.dyingTimer < 0.6) {
                    // Phase 1: Sag — slow drift down, slight tilt beginning
                    this.dyingVy += 40 * dt;
                    this.dyingTiltSpeed += 0.3 * dt;
                } else {
                    // Phase 2: Full tumble — gravity, accelerating spin
                    this.dyingVy += 800 * dt;
                    this.dyingTiltSpeed += 8 * dt;
                }

                this.y += this.dyingVy * dt;
                this.dyingTilt += this.dyingTiltDir * this.dyingTiltSpeed * dt;

                // Smoke and spark trail
                this.dyingSmokeTimer += dt;
                if (this.dyingSmokeTimer >= 0.04) {
                    this.dyingSmokeTimer = 0;
                    // Smoke puff
                    particles.push(new Particle(
                        this.x + (Math.random() - 0.5) * 20,
                        this.y + (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 40,
                        -30 - Math.random() * 40,
                        `rgba(${80 + Math.random() * 60}, ${80 + Math.random() * 60}, ${80 + Math.random() * 60}, 1)`,
                        4 + Math.random() * 4, 0.5 + Math.random() * 0.3
                    ));
                    // Sparks
                    if (Math.random() < 0.5) {
                        const isHarv = this.type === 'harvester';
                        const sparkColor = isHarv ?
                            `rgb(0, ${180 + Math.random() * 75}, ${80 + Math.random() * 70})` :
                            `rgb(255, ${80 + Math.random() * 120}, ${Math.random() * 50})`;
                        particles.push(new Particle(
                            this.x + (Math.random() - 0.5) * 20,
                            this.y + (Math.random() - 0.5) * 10,
                            (Math.random() - 0.5) * 100,
                            -50 - Math.random() * 80,
                            sparkColor, 2, 0.3
                        ));
                    }
                }

                const dyingGroundY = canvas.height - 60;
                if (this.y >= dyingGroundY) {
                    this.explode();
                }
                break;
        }
    }

    // Recharge energy from beam
    rechargeEnergy(amount) {
        this.energyTimer = Math.min(this.maxEnergy, this.energyTimer + amount);
        if (this.state === 'LOW_ENERGY' && this.energyTimer > this.maxEnergy * 0.25) {
            this.state = 'ACTIVE';
            // Float back up to original hover altitude
            this.targetY = canvas.height * 0.40;
        }
    }

    takeDamage(amount) {
        // Shield absorbs first hit
        if (this.shieldCharge > 0) {
            this.shieldCharge = 0;
            this.shieldRegenTimer = 0;
            createFloatingText(this.x, this.y - 30, 'SHIELD!', '#0ff');
            return;
        }

        // Drone armor reduces damage
        if (techFlags.droneArmor) amount *= 0.6;

        this.energyTimer -= amount;
        if (this.energyTimer <= 0) {
            this.state = 'DYING';
            this.energyTimer = 0;
        }
    }

    explode() {
        this.alive = false;
        screenShake = 1.2;

        // Power off sub-drones instead of killing instantly
        // Drones close to the blast get destroyed, others lose power and tip over
        const instantKillRadius = 80;
        for (const drone of this.subDrones) {
            if (!drone.alive) continue;
            const dist = Math.hypot(drone.x - this.x, (drone.y + drone.height / 2) - this.y);
            if (dist < instantKillRadius) {
                // Direct hit from coordinator explosion
                drone.die();
            } else {
                drone.powerOff();
                // Transfer to activeDrones so they keep updating after coordinator is removed
                activeDrones.push(drone);
            }
        }
        this.subDrones = [];

        // Damage nearby entities in larger blast radius
        const blastRadius = 150;
        // Damage tanks
        for (const tank of [...tanks, ...heavyTanks]) {
            if (!tank.alive) continue;
            const dist = Math.hypot(tank.x + tank.width/2 - this.x, tank.y + tank.height/2 - this.y);
            if (dist < blastRadius) {
                tank.takeDamage(30);
            }
        }
        // Damage targets
        for (const target of targets) {
            if (!target.alive) continue;
            const dist = Math.hypot(target.x + target.width/2 - this.x, target.y + target.height/2 - this.y);
            if (dist < blastRadius) {
                target.blastAway(this.x, this.y);
            }
        }
        // Damage drones from other coordinators and activeDrones in blast radius
        for (const coord of activeCoordinators) {
            if (coord === this) continue;
            for (const drone of coord.subDrones) {
                if (!drone.alive) continue;
                const dist = Math.hypot(drone.x - this.x, (drone.y + drone.height / 2) - this.y);
                if (dist < blastRadius) {
                    drone.takeDamage(15);
                }
            }
        }
        for (const drone of activeDrones) {
            if (!drone.alive) continue;
            const dist = Math.hypot(drone.x - this.x, (drone.y + drone.height / 2) - this.y);
            if (dist < blastRadius) {
                drone.takeDamage(15);
            }
        }

        const isHarv = this.type === 'harvester';

        // Big central flash explosion
        createExplosion(this.x, this.y, 'large');

        // Secondary explosions around impact point
        for (let i = 0; i < 4; i++) {
            const delay = 50 + Math.random() * 200;
            const ox = (Math.random() - 0.5) * 100;
            const oy = (Math.random() - 0.5) * 60;
            setTimeout(() => {
                createExplosion(this.x + ox, this.y + oy, 'medium');
                screenShake = Math.max(screenShake, 0.5);
            }, delay);
        }

        // Ring 1: fast hot core particles
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 200 + Math.random() * 250;
            const color = isHarv ?
                `rgb(${Math.random() * 50}, 255, ${120 + Math.random() * 135})` :
                `rgb(255, ${150 + Math.random() * 105}, ${Math.random() * 80})`;
            particles.push(new Particle(this.x, this.y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                color, 4 + Math.random() * 3, 0.6 + Math.random() * 0.3));
        }

        // Ring 2: slower debris chunks
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 120;
            const gray = 40 + Math.random() * 80;
            particles.push(new Particle(this.x, this.y,
                Math.cos(angle) * speed, Math.sin(angle) * speed - 30,
                `rgb(${gray}, ${gray}, ${gray})`, 3 + Math.random() * 4, 0.8 + Math.random() * 0.5));
        }

        // Ring 3: bright energy sparks
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 300 + Math.random() * 200;
            const color = isHarv ? '#0ff' : '#ff0';
            particles.push(new Particle(this.x, this.y,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                color, 1.5 + Math.random(), 0.3 + Math.random() * 0.2));
        }

        // Ground dust cloud (explosion hits ground)
        const groundY = canvas.height - 60;
        for (let i = 0; i < 12; i++) {
            const ox = (Math.random() - 0.5) * 140;
            particles.push(new Particle(this.x + ox, groundY,
                ox * 2, -20 - Math.random() * 40,
                `rgba(139, 90, 43, 1)`, 5 + Math.random() * 4, 0.6 + Math.random() * 0.4));
        }

        SFX.explosion(true);
    }

    spawnSubDrones() {
        // Override in subclasses
    }

    updateSubDrones(dt) {
        for (const drone of this.subDrones) {
            if (drone.alive) drone.update(dt);
        }
        // Check for dead sub-drones, start redeploy timer
        this.subDrones = this.subDrones.filter(d => {
            if (!d.alive) {
                this.redeployTimers.push(this.redeployDelay);
                return false;
            }
            return true;
        });
    }

    updateRedeployTimers(dt) {
        for (let i = this.redeployTimers.length - 1; i >= 0; i--) {
            this.redeployTimers[i] -= dt;
            if (this.redeployTimers[i] <= 0) {
                this.redeployTimers.splice(i, 1);
                if (this.subDrones.length < this.maxSubDrones) {
                    this.spawnSingleSubDrone();
                }
            }
        }
    }

    spawnSingleSubDrone() {
        // Override in subclasses
    }

    render() {
        if (!this.alive) return;

        const cx = this.x;
        const cy = this.y;
        const energyPct = this.energyTimer / this.maxEnergy;

        // Glow color based on type
        const isHarvester = this.type === 'harvester';
        const baseR = isHarvester ? 0 : 255;
        const baseG = isHarvester ? 220 : 120;
        const baseB = isHarvester ? 100 : 30;

        // Glow intensity scales with energy level
        let glowIntensity;
        if (energyPct > 0.5) {
            // Full/healthy: vibrant pulsing
            glowIntensity = (0.5 + energyPct * 0.5) * (0.7 + Math.sin(this.glowPulse) * 0.3);
        } else if (energyPct > 0.25) {
            // Depleting: dimming
            glowIntensity = energyPct * (0.4 + Math.sin(this.glowPulse) * 0.15);
        } else {
            // Critical: washed out, intermittent flicker
            glowIntensity = 0.1 + energyPct * 0.4;
        }

        // Intensify glow while being charged
        if (this.isBeingCharged) {
            glowIntensity = Math.min(1.0, glowIntensity + 0.3 + Math.sin(this.glowPulse * 2) * 0.15);
        }

        // Flicker when low energy
        const flickerAlpha = this.state === 'LOW_ENERGY' ?
            (Math.sin(Date.now() / 50) > 0 ? 0.3 : 0.8) : 1.0;

        ctx.save();
        ctx.translate(cx, cy);

        // Dying tilt
        if (this.state === 'DYING') {
            ctx.rotate(this.dyingTilt);
        }

        // Deploy animation
        if (this.state === 'DEPLOYING') {
            ctx.globalAlpha = 0.7;
        }

        // Outer glow
        ctx.globalAlpha *= glowIntensity * flickerAlpha * 0.3;
        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 0.8, this.height * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main body (ellipsoid, slightly elongated vertically)
        ctx.globalAlpha = flickerAlpha;
        ctx.fillStyle = '#333';
        ctx.strokeStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner detail - spinning ring
        ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${glowIntensity * flickerAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width * 0.35, this.height * 0.2, this.spinAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Center glow dot
        ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${glowIntensity * flickerAlpha * 1.5})`;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Shield indicator
        if (this.shieldCharge > 0) {
            ctx.strokeStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(this.glowPulse * 0.5) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width * 0.65, this.height * 0.65, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Proximity snap highlight (UFO in charge range)
        if (this.inSnapRange && this.state !== 'DYING') {
            this.snapHighlightPulse += 0.04;
            const highlightAlpha = 0.3 + Math.sin(this.snapHighlightPulse * 3) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width * 0.6 + 3, this.height * 0.6 + 3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        // SOS beacon rings
        for (const ring of this.sosRings) {
            ctx.strokeStyle = `rgba(255, 50, 50, ${ring.alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Energy bar above coordinator
        if (this.state !== 'DEPLOYING') {
            const bw = CONFIG.COORD_ENERGY_BAR_WIDTH;
            const bh = CONFIG.COORD_ENERGY_BAR_HEIGHT;
            const bx = cx - bw / 2;
            const by = cy - this.height / 2 - 12;

            // Dark border/background
            ctx.fillStyle = '#111';
            ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
            ctx.fillStyle = '#222';
            ctx.fillRect(bx, by, bw, bh);

            // Color progression: green > yellow > red
            let barR, barG, barB;
            if (energyPct > 0.5) {
                barR = 0; barG = 220; barB = 80;
            } else if (energyPct > 0.25) {
                barR = 255; barG = 220; barB = 0;
            } else {
                barR = 255; barG = 50; barB = 50;
            }

            // Fill bar
            ctx.fillStyle = `rgb(${barR}, ${barG}, ${barB})`;
            ctx.fillRect(bx, by, bw * energyPct, bh);

            // Inner glow (subtle lighter overlay on filled portion)
            const glowGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, 0.25)`);
            glowGrad.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
            glowGrad.addColorStop(1, `rgba(0, 0, 0, 0.15)`);
            ctx.fillStyle = glowGrad;
            ctx.fillRect(bx, by, bw * energyPct, bh);

            // Charging shimmer (bright white highlight sweeping across bar)
            if (this.isBeingCharged) {
                this.chargeShimmerPhase += 0.03;
                const shimmerX = bx + ((this.chargeShimmerPhase % 1) * bw * energyPct);
                const shimmerW = 12;
                const shimmerGrad = ctx.createLinearGradient(shimmerX - shimmerW, by, shimmerX + shimmerW, by);
                shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
                shimmerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = shimmerGrad;
                ctx.fillRect(bx, by, bw * energyPct, bh);
            }
        }

        // Radio control signal line from UFO to coordinator
        if (ufo && this.state !== 'DEPLOYING' && this.state !== 'DYING') {
            const ux = ufo.x;
            const uy = ufo.y + ufo.height / 2;
            const dx = cx - ux;
            const dy = cy - uy;
            const lineLen = Math.sqrt(dx * dx + dy * dy);
            if (lineLen > 1) {
                const now = Date.now() / 1000;
                const segments = 60;
                const perpX = -dy / lineLen;
                const perpY = dx / lineLen;

                // Soft base line (dim, wide)
                ctx.save();
                ctx.globalAlpha = 0.08;
                ctx.strokeStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(ux, uy);
                ctx.lineTo(cx, cy - this.height / 2);
                ctx.stroke();
                ctx.restore();

                // FM radio signal wave — multiple layered frequencies
                ctx.save();
                ctx.lineCap = 'round';

                // Layer 1: slow carrier wave
                ctx.globalAlpha = 0.15;
                ctx.strokeStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const bx = ux + dx * t;
                    const by = uy + (cy - this.height / 2 - uy) * t;
                    // Carrier: slow sine
                    const carrier = Math.sin(t * Math.PI * 4 + now * 2) * 6;
                    // Modulator: faster chattery signal
                    const mod = Math.sin(t * Math.PI * 12 + now * 7) * 3;
                    // Noise burst: intermittent chatter
                    const noise = Math.sin(t * 47 + now * 13) * Math.sin(t * 23 + now * 5) * 4;
                    const offset = carrier + mod + noise;
                    const px = bx + perpX * offset;
                    const py = by + perpY * offset;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();

                // Layer 2: fast data bursts — brighter, thinner
                ctx.globalAlpha = 0.25;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const bx = ux + dx * t;
                    const by = uy + (cy - this.height / 2 - uy) * t;
                    // High-freq data signal
                    const data = Math.sin(t * Math.PI * 20 + now * 15) * 2;
                    // FM modulation — frequency varies along the line
                    const fm = Math.sin(t * Math.PI * 8 + now * 4 + Math.sin(now * 3 + t * 6) * 3) * 3.5;
                    // Packet bursts — intermittent activity zones
                    const burstEnv = Math.max(0, Math.sin(t * Math.PI * 3 + now * 1.5)) ** 3;
                    const offset = (data + fm) * (0.3 + burstEnv * 0.7);
                    const px = bx + perpX * offset;
                    const py = by + perpY * offset;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();

                // Layer 3: bright pulsing data packets traveling down the line
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = `rgb(${Math.min(255, baseR + 100)}, ${Math.min(255, baseG + 100)}, ${Math.min(255, baseB + 100)})`;
                for (let p = 0; p < 3; p++) {
                    const packetT = ((now * 1.2 + p * 0.33) % 1);
                    const bx = ux + dx * packetT;
                    const by = uy + (cy - this.height / 2 - uy) * packetT;
                    const packetPulse = 0.5 + Math.sin(now * 10 + p * 2) * 0.5;
                    const pr = 2 + packetPulse * 1.5;
                    ctx.beginPath();
                    ctx.arc(bx, by, pr, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        // Tether lines to sub-drones
        for (const drone of this.subDrones) {
            if (!drone.alive) continue;
            ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, 0.2)`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(cx, cy + this.height / 2);
            ctx.lineTo(drone.x, drone.y - 10);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Render BM pulse orbs along tether lines
        for (const p of this.bmPulses) {
            const t = p.progress;
            // Lerp position along the line
            let px, py;
            if (p.type === 'drone-to-coord') {
                px = p.fromX + (cx - p.fromX) * t;
                py = p.fromY + ((cy + this.height / 2) - p.fromY) * t;
            } else {
                px = p.fromX + (p.toX - p.fromX) * t;
                py = p.fromY + (p.toY - p.fromY) * t;
            }

            // Pulsing glow radius
            const pulse = 1 + Math.sin(t * Math.PI * 4) * 0.3;
            const radius = 4 * pulse;
            const alpha = 0.8 - t * 0.3;

            // Outer glow
            ctx.save();
            ctx.globalAlpha = alpha * 0.4;
            ctx.fillStyle = isHarvester ? 'rgb(0, 255, 200)' : 'rgb(255, 150, 50)';
            ctx.beginPath();
            ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Core circle
            ctx.globalAlpha = alpha;
            ctx.fillStyle = isHarvester ? 'rgb(150, 255, 230)' : 'rgb(255, 220, 150)';
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();

            // Bright center
            ctx.globalAlpha = alpha * 1.2;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(px, py, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Render sub-drones
        for (const drone of this.subDrones) {
            if (drone.alive) drone.render();
        }
    }
}

class HarvesterCoordinator extends Coordinator {
    constructor(x, y) {
        super(x, y, 'harvester');
        this.bioMatterBuffer = 0; // Accumulated BM from sub-drones
        this.streamTimer = 0; // Timer for streaming BM to UFO
        this.streamInterval = 2.0; // Stream to UFO every 2 seconds
        this.streamParticleTimer = 0; // Visual particle timer
    }

    addBioMatter(amount) {
        this.bioMatterBuffer += amount;
    }

    update(dt) {
        super.update(dt); // Call base Coordinator update

        // Stream accumulated biomatter to UFO periodically
        if (this.bioMatterBuffer > 0 && (this.state === 'ACTIVE' || this.state === 'LOW_ENERGY')) {
            this.streamTimer += dt;
            if (this.streamTimer >= this.streamInterval) {
                this.streamTimer = 0;
                const bmToSend = this.bioMatterBuffer;
                this.bioMatterBuffer = 0;
                bioMatter += bmToSend;
                waveStats.bioMatterEarned += bmToSend;
                waveStats.droneHarvests++;
                createFloatingText(this.x, this.y - 40, `+${bmToSend} BM`, '#4f4', { fontSize: 18 });
                // Spawn pulse orb traveling from coordinator to UFO (sound plays on arrival)
                if (ufo) {
                    this.spawnBmPulse(this.x, this.y - this.height / 2, ufo.x, ufo.y + ufo.height / 2, 'coord-to-ufo');
                }
            }
        }

        // Visual stream particles going up to UFO
        if (this.bioMatterBuffer > 0 && ufo && (this.state === 'ACTIVE' || this.state === 'LOW_ENERGY')) {
            this.streamParticleTimer += dt;
            if (this.streamParticleTimer > 0.15) {
                this.streamParticleTimer = 0;
                const px = this.x + (Math.random() - 0.5) * 10;
                const py = this.y - this.height / 2;
                particles.push(new Particle(px, py,
                    (ufo.x - px) * 0.5, (ufo.y - py) * 0.8,
                    'rgb(0, 255, 200)', 3, 0.6));
            }
        }
    }

    render() {
        super.render(); // Call base Coordinator render (includes tethers, energy bar, sub-drones)

        // Biomatter stream beam from coordinator to UFO
        if (this.bioMatterBuffer > 0 && ufo && (this.state === 'ACTIVE' || this.state === 'LOW_ENERGY')) {
            const alpha = 0.15 + Math.sin(this.glowPulse * 2) * 0.05;
            ctx.strokeStyle = `rgba(0, 255, 180, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.height / 2);
            ctx.lineTo(ufo.x, ufo.y + ufo.height / 2);
            ctx.stroke();

            // Brighter inner beam
            ctx.strokeStyle = `rgba(0, 255, 220, ${alpha * 1.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.height / 2);
            ctx.lineTo(ufo.x, ufo.y + ufo.height / 2);
            ctx.stroke();
        }
    }

    spawnSubDrones() {
        for (let i = 0; i < this.maxSubDrones; i++) {
            this.spawnSingleSubDrone(i, this.maxSubDrones);
        }
    }

    spawnSingleSubDrone(index, total) {
        if (this.subDrones.length >= this.maxSubDrones) return;
        const drone = new HarvesterDrone(this.x, this.y);
        drone.coordinator = this;
        // Fan out: spread drones at angles from coordinator
        if (typeof index === 'number' && total > 1) {
            const spread = 180; // total horizontal spread in px/s
            const t = (index / (total - 1)) - 0.5; // -0.5 to 0.5
            drone.vx = t * spread;
        } else {
            // Single redeploy — pick a random side
            drone.vx = (Math.random() - 0.5) * 120;
        }
        this.subDrones.push(drone);
    }
}

class AttackCoordinator extends Coordinator {
    constructor(x, y) {
        super(x, y, 'attack');
        this.bombTimer = 0;       // Cooldown between bomb drops
        this.bombInterval = 4.0;  // Drop a bomb every 4 seconds
        this.missileTimer = 0;    // Cooldown between missile salvos
        this.missileInterval = 5.0; // Offensive auto-fire every 5 seconds
        this.reactiveInterval = 1.0; // Reactive defense: tempered point-defense
        this.missileLaunchFlash = 0; // Remaining flash duration on launch
        this.reactiveMode = false;  // True when incoming threats detected
    }

    update(dt) {
        super.update(dt);

        // Tick launch flash timer (runs in all states so flash fades even during transitions)
        if (this.missileLaunchFlash > 0) this.missileLaunchFlash -= dt;

        if (this.state !== 'ACTIVE' && this.state !== 'LOW_ENERGY') return;

        // Auto-fire weapons
        this.bombTimer += dt;
        this.missileTimer += dt;

        // Auto-drop bombs at tank clusters
        if (this.bombTimer >= this.bombInterval && playerInventory.bombs > 0) {
            const target = this.findBombTarget();
            if (target) {
                this.autoBomb(target);
                this.bombTimer = 0;
            }
        }

        // Auto-fire missiles — only the first alive attack coordinator drives auto-fire
        // (fireMissileGroup distributes missiles across ALL coordinators regardless)
        const atkCoords = activeCoordinators.filter(c => c.type === 'attack' && c.alive && c.state !== 'DYING');
        const isLeadCoordinator = atkCoords.length > 0 && atkCoords[0] === this;

        if (isLeadCoordinator && missileUnlocked && missileGroups.some(g => g.ready)) {
            // Detect incoming threats: enemy projectiles heading upward toward friendlies
            const hasThreats = projectiles.some(p => p.alive && p.vy < 0);
            this.reactiveMode = hasThreats;

            if (hasThreats) {
                // REACTIVE DEFENSE: fire immediately when groups recharge — point-defense mode
                if (this.missileTimer >= this.reactiveInterval && ufo && ufo.energy >= CONFIG.MISSILE_GROUP_ENERGY_COST) {
                    this.autoMissile();
                    this.missileTimer = 0;
                }
            } else {
                // OFFENSIVE MODE: fire at a moderate pace when tanks exist
                if (this.missileTimer >= this.missileInterval) {
                    const hasTanks = [...tanks, ...heavyTanks].some(t => t.alive);
                    if (hasTanks) {
                        this.autoMissile();
                        this.missileTimer = 0;
                    }
                }
            }
        }
    }

    findBombTarget() {
        const aliveTanks = [...tanks, ...heavyTanks].filter(t => t.alive);
        if (aliveTanks.length === 0) return null;

        // Score positions by number of tanks within blast radius
        let bestTarget = null;
        let bestScore = 0;
        const blastRadius = CONFIG.BOMB_BLAST_TIERS[bombBlastTier] || 120;

        for (const tank of aliveTanks) {
            const tx = tank.x + tank.width / 2;
            let score = 0;
            for (const other of aliveTanks) {
                const ox = other.x + other.width / 2;
                if (Math.abs(tx - ox) < blastRadius) {
                    score++;
                    if (other.constructor.name === 'HeavyTank') score += 0.5;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestTarget = { x: tx, y: tank.y + tank.height / 2 };
            }
        }

        return bestTarget;
    }

    autoBomb(target) {
        playerInventory.bombs--;
        if (playerInventory.bombs < playerInventory.maxBombs) {
            playerInventory.bombRechargeTimers.push(CONFIG.BOMB_RECHARGE_TIME);
        }
        // Create bomb from coordinator position with velocity aimed at target
        const dx = target.x - this.x;
        const vx = dx * 0.3;
        bombs.push(new Bomb(this.x, this.y, vx));
        SFX.bombDrop && SFX.bombDrop();
        createFloatingText(this.x, this.y + 30, 'AUTO BOMB!', '#ff8800');
    }

    autoMissile() {
        // Fire ONE ready group per call — conserve energy for player manual salvos
        if (missileGroups.some(g => g.ready) && ufo && ufo.energy >= CONFIG.MISSILE_GROUP_ENERGY_COST) {
            fireMissileGroup();
            if (this.reactiveMode) {
                createFloatingText(this.x, this.y + 30, 'INTERCEPT!', '#ffcc00');
            } else {
                createFloatingText(this.x, this.y + 30, 'AUTO MISSILES!', '#f44');
            }
        }
    }

    render() {
        super.render();

        // Missile launch flash effect
        if (this.missileLaunchFlash > 0) {
            const flashAlpha = (this.missileLaunchFlash / 0.2) * 0.7;
            const flashRadius = 20 + (1 - this.missileLaunchFlash / 0.2) * 15;
            ctx.save();
            ctx.globalAlpha = flashAlpha;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, flashRadius);
            gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
            gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, flashRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Visual: weapon ready indicators
        if (this.state === 'ACTIVE' || this.state === 'LOW_ENERGY') {
            const cx = this.x;
            const cy = this.y;

            // Bomb ready indicator (small orange dot)
            if (playerInventory.bombs > 0 && this.bombTimer >= this.bombInterval * 0.8) {
                const readyAlpha = 0.4 + Math.sin(this.glowPulse * 3) * 0.3;
                ctx.fillStyle = `rgba(255, 136, 0, ${readyAlpha})`;
                ctx.beginPath();
                ctx.arc(cx - 15, cy + this.height / 2 + 8, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Missile ready indicator (small red dot, or rapid yellow pulse in reactive mode)
            if (missileUnlocked && missileGroups.some(g => g.ready)) {
                const activeInterval = this.reactiveMode ? this.reactiveInterval : this.missileInterval;
                if (this.missileTimer >= activeInterval * 0.8) {
                    if (this.reactiveMode) {
                        // Reactive defense: rapid yellow-white pulse, slightly larger dot
                        const readyAlpha = 0.6 + Math.sin(this.glowPulse * 8) * 0.4;
                        ctx.fillStyle = `rgba(255, 255, 100, ${readyAlpha})`;
                        ctx.beginPath();
                        ctx.arc(cx + 15, cy + this.height / 2 + 8, 5, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Offensive mode: normal red dot
                        const readyAlpha = 0.4 + Math.sin(this.glowPulse * 3) * 0.3;
                        ctx.fillStyle = `rgba(255, 50, 50, ${readyAlpha})`;
                        ctx.beginPath();
                        ctx.arc(cx + 15, cy + this.height / 2 + 8, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    }

    spawnSubDrones() {
        for (let i = 0; i < this.maxSubDrones; i++) {
            this.spawnSingleSubDrone(i, this.maxSubDrones);
        }
    }

    spawnSingleSubDrone(index, total) {
        if (this.subDrones.length >= this.maxSubDrones) return;
        const drone = new BattleDrone(this.x, this.y);
        drone.coordinator = this;
        // Fan out: spread drones at angles from coordinator
        if (typeof index === 'number' && total > 1) {
            const spread = 200; // total horizontal spread in px/s (battle drones spread wider)
            const t = (index / (total - 1)) - 0.5; // -0.5 to 0.5
            drone.vx = t * spread;
        } else {
            // Single redeploy — pick a random side
            drone.vx = (Math.random() - 0.5) * 140;
        }
        this.subDrones.push(drone);
    }
}

// --- Drone deployment functions ---

function deployHarvesterDrone() {
    if (!harvesterUnlocked || !ufo) return;

    // Deploy coordinator instead if tech is researched
    if (techFlags.harvesterCoordinator) {
        const maxCoords = techFlags.fleetExpansion ? 2 : 1;
        const harvCoords = activeCoordinators.filter(c => c.type === 'harvester' && c.alive).length;
        if (harvCoords >= maxCoords) { createFloatingText(ufo.x, ufo.y + 60, 'MAX COORDINATORS!', '#f44'); return; }
        if (droneCooldownTimer > 0) { createFloatingText(ufo.x, ufo.y + 60, 'COOLDOWN!', '#ff0'); return; }
        if (ufo.energy < CONFIG.DRONE_ENERGY_COST) { createFloatingText(ufo.x, ufo.y + 60, 'LOW ENERGY!', '#f44'); return; }
        trackEnergyDelta(CONFIG.DRONE_ENERGY_COST, false);
        ufo.energy -= CONFIG.DRONE_ENERGY_COST;
        const coord = new HarvesterCoordinator(ufo.x, ufo.y + ufo.height / 2);
        activeCoordinators.push(coord);
        pushOpsLogEvent('H.COORD DEPLOYED', '#48f', { type: 'coordDeploy' });
        droneCooldownTimer = DRONE_DEPLOY_COOLDOWN;
        SFX.droneDeploy && SFX.droneDeploy('harvester');
        createFloatingText(ufo.x, ufo.y + 50, 'HARVESTER COORD!', '#0ff');
        // Trigger coordinator charge tutorial on first deploy
        if (!coordChargeTutorialShown) {
            coordChargeTutorialShown = true;
            coordChargeTutorialState = { phase: 'WAITING', timer: 0, targetCoord: coord };
        }
        return;
    }

    if (activeDrones.length >= droneSlots) { createFloatingText(ufo.x, ufo.y + 60, 'NO DRONE SLOTS!', '#f44'); return; }
    if (droneCooldownTimer > 0) { createFloatingText(ufo.x, ufo.y + 60, 'COOLDOWN!', '#ff0'); return; }
    if (ufo.energy < CONFIG.DRONE_ENERGY_COST) { createFloatingText(ufo.x, ufo.y + 60, 'LOW ENERGY!', '#f44'); return; }
    trackEnergyDelta(CONFIG.DRONE_ENERGY_COST, false);
    ufo.energy -= CONFIG.DRONE_ENERGY_COST;
    const drone = new HarvesterDrone(ufo.x, ufo.y + ufo.height / 2);
    activeDrones.push(drone);
    pushOpsLogEvent('HARVESTER DEPLOYED', '#48f', { type: 'droneDeploy' });
    droneCooldownTimer = DRONE_DEPLOY_COOLDOWN;
    SFX.droneDeploy && SFX.droneDeploy('harvester');
    createFloatingText(ufo.x, ufo.y + 50, 'HARVESTER!', '#0ff');
}

function deployBattleDrone() {
    if (!battleDroneUnlocked || !ufo) return;

    // Deploy coordinator instead if tech is researched
    if (techFlags.attackCoordinator) {
        const maxCoords = techFlags.fleetExpansion ? 2 : 1;
        const atkCoords = activeCoordinators.filter(c => c.type === 'attack' && c.alive).length;
        if (atkCoords >= maxCoords) { createFloatingText(ufo.x, ufo.y + 60, 'MAX COORDINATORS!', '#f44'); return; }
        if (droneCooldownTimer > 0) { createFloatingText(ufo.x, ufo.y + 60, 'COOLDOWN!', '#ff0'); return; }
        if (ufo.energy < CONFIG.DRONE_ENERGY_COST) { createFloatingText(ufo.x, ufo.y + 60, 'LOW ENERGY!', '#f44'); return; }
        trackEnergyDelta(CONFIG.DRONE_ENERGY_COST, false);
        ufo.energy -= CONFIG.DRONE_ENERGY_COST;
        const coord = new AttackCoordinator(ufo.x, ufo.y + ufo.height / 2);
        activeCoordinators.push(coord);
        pushOpsLogEvent('A.COORD DEPLOYED', '#48f', { type: 'coordDeploy' });
        droneCooldownTimer = DRONE_DEPLOY_COOLDOWN;
        SFX.droneDeploy && SFX.droneDeploy('battle');
        createFloatingText(ufo.x, ufo.y + 50, 'ATTACK COORD!', '#f44');
        // Trigger coordinator charge tutorial on first deploy
        if (!coordChargeTutorialShown) {
            coordChargeTutorialShown = true;
            coordChargeTutorialState = { phase: 'WAITING', timer: 0, targetCoord: coord };
        }
        return;
    }

    if (activeDrones.length >= droneSlots) { createFloatingText(ufo.x, ufo.y + 60, 'NO DRONE SLOTS!', '#f44'); return; }
    if (droneCooldownTimer > 0) { createFloatingText(ufo.x, ufo.y + 60, 'COOLDOWN!', '#ff0'); return; }
    if (ufo.energy < CONFIG.DRONE_ENERGY_COST) { createFloatingText(ufo.x, ufo.y + 60, 'LOW ENERGY!', '#f44'); return; }
    trackEnergyDelta(CONFIG.DRONE_ENERGY_COST, false);
    ufo.energy -= CONFIG.DRONE_ENERGY_COST;
    const drone = new BattleDrone(ufo.x, ufo.y + ufo.height / 2);
    activeDrones.push(drone);
    pushOpsLogEvent('BATTLE DRONE DEPLOYED', '#48f', { type: 'droneDeploy' });
    droneCooldownTimer = DRONE_DEPLOY_COOLDOWN;
    SFX.droneDeploy && SFX.droneDeploy('battle');
    createFloatingText(ufo.x, ufo.y + 50, 'BATTLE DRONE!', '#f44');
}

// --- Drone update/render functions ---

function updateDrones(dt) {
    if (droneCooldownTimer > 0) droneCooldownTimer -= dt;
    for (const drone of activeDrones) drone.update(dt);
    activeDrones = activeDrones.filter(d => d.alive);
}

function renderDrones() {
    for (const drone of activeDrones) drone.render();
}

// --- Coordinator update/render functions ---

function updateCoordinators(dt) {
    for (const coord of activeCoordinators) coord.update(dt);
    activeCoordinators = activeCoordinators.filter(c => c.alive);

    // DC5 Autonomous Swarm: auto-deploy coordinators
    if (techFlags.autonomousSwarm && ufo && gameState === 'PLAYING') {
        if (autoDeployCooldown > 0) {
            autoDeployCooldown -= dt;
        } else {
            const maxCoords = techFlags.fleetExpansion ? 2 : 1;
            let deployed = false;
            if (techFlags.harvesterCoordinator && harvesterUnlocked) {
                const harvCount = activeCoordinators.filter(c => c.type === 'harvester' && c.alive).length;
                if (harvCount < maxCoords && ufo.energy >= CONFIG.DRONE_ENERGY_COST) {
                    trackEnergyDelta(CONFIG.DRONE_ENERGY_COST, false);
                    ufo.energy -= CONFIG.DRONE_ENERGY_COST;
                    activeCoordinators.push(new HarvesterCoordinator(ufo.x, ufo.y + ufo.height / 2));
                    createFloatingText(ufo.x, ufo.y + 50, 'AUTO-DEPLOY!', '#0ff');
                    deployed = true;
                }
            }
            if (techFlags.attackCoordinator && battleDroneUnlocked) {
                const atkCount = activeCoordinators.filter(c => c.type === 'attack' && c.alive).length;
                if (atkCount < maxCoords && ufo.energy >= CONFIG.DRONE_ENERGY_COST) {
                    trackEnergyDelta(CONFIG.DRONE_ENERGY_COST, false);
                    ufo.energy -= CONFIG.DRONE_ENERGY_COST;
                    activeCoordinators.push(new AttackCoordinator(ufo.x, ufo.y + ufo.height / 2));
                    createFloatingText(ufo.x, ufo.y + 50, 'AUTO-DEPLOY!', '#f44');
                    deployed = true;
                }
            }
            if (deployed) autoDeployCooldown = 5;
        }
    }
}

function renderCoordinators() {
    for (const coord of activeCoordinators) coord.render();
}

// ============================================
// TECH TREE MANAGEMENT
// ============================================

// Lookup a tech node by ID from CONFIG.TECH_TREE
function getTechNode(nodeId) {
    for (const trackName of Object.keys(CONFIG.TECH_TREE)) {
        for (const node of CONFIG.TECH_TREE[trackName]) {
            if (node.id === nodeId) return node;
        }
    }
    return null;
}

// Get all tech nodes as a flat array
function getAllTechNodes() {
    const nodes = [];
    for (const trackName of Object.keys(CONFIG.TECH_TREE)) {
        for (const node of CONFIG.TECH_TREE[trackName]) {
            nodes.push(node);
        }
    }
    return nodes;
}

// Check if prerequisites are met for a tech node
function checkTechPrerequisites(nodeId) {
    const node = getTechNode(nodeId);
    if (!node) return false;

    // Tier 1 nodes have no prerequisites
    if (node.tier === 1) return true;

    // Need previous tier in same track
    const track = CONFIG.TECH_TREE[node.track];
    const prevNode = track.find(n => n.tier === node.tier - 1);
    if (prevNode && techTree.researched.has(prevNode.id)) return true;

    return false;
}

// Check if the player can research a given node
function canResearchNode(nodeId) {
    if (techTree.researched.has(nodeId)) return false;
    // Already in queue or actively being researched
    if (techTree.queue.includes(nodeId)) return false;
    if (techTree.activeResearch && techTree.activeResearch.nodeId === nodeId) return false;

    const node = getTechNode(nodeId);
    if (!node) return false;
    if (bioMatter < node.cost) return false;
    if (!checkTechPrerequisites(nodeId)) return false;

    return true;
}

// Queue a tech node for research
function queueResearch(nodeId) {
    if (!canResearchNode(nodeId)) return false;
    const node = getTechNode(nodeId);
    bioMatter -= node.cost;
    techTree.queue.push(nodeId);
    shopState.researchIdleTimer = 0; // Reset urgency flash on interaction
    // Start research if nothing is currently active
    if (!techTree.activeResearch) {
        startNextResearch();
    }
    return true;
}

// Start the next research in the queue
function startNextResearch() {
    if (techTree.queue.length === 0) {
        techTree.activeResearch = null;
        return;
    }
    const nodeId = techTree.queue.shift();
    const node = getTechNode(nodeId);
    techTree.activeResearch = {
        nodeId: nodeId,
        timeRemaining: node.researchTime,
        totalTime: node.researchTime
    };
}

// Cancel a queued or active research and refund bio-matter
function cancelResearch(nodeId) {
    // Cancel active research
    if (techTree.activeResearch && techTree.activeResearch.nodeId === nodeId) {
        const node = getTechNode(nodeId);
        bioMatter += node.cost;
        techTree.activeResearch = null;
        startNextResearch();
        return true;
    }
    // Cancel queued research
    const idx = techTree.queue.indexOf(nodeId);
    if (idx >= 0) {
        techTree.queue.splice(idx, 1);
        const node = getTechNode(nodeId);
        bioMatter += node.cost;
        return true;
    }
    return false;
}

// Update research timer (called each frame during PLAYING state)
function updateResearch(dt) {
    if (!techTree.activeResearch) return;
    techTree.activeResearch.timeRemaining -= dt;

    // Countdown blip sounds during final 5 seconds
    if (techTree.activeResearch.timeRemaining <= 5 && techTree.activeResearch.timeRemaining > 0) {
        const currentSecond = Math.ceil(techTree.activeResearch.timeRemaining);
        if (currentSecond !== lastResearchCountdownSecond) {
            lastResearchCountdownSecond = currentSecond;
            SFX.researchCountdownBlip(currentSecond);
        }
    }

    if (techTree.activeResearch.timeRemaining <= 0) {
        lastResearchCountdownSecond = -1;
        completeResearch(techTree.activeResearch.nodeId);
        startNextResearch();
    }
}

// Complete a research node
function completeResearch(nodeId) {
    techTree.researched.add(nodeId);
    applyTechEffect(nodeId);

    const node = getTechNode(nodeId);
    pushOpsLogEvent(`RSRCH: ${node.name.toUpperCase()}`, '#0ff', { type: 'research', skipThrottle: true });
    // Show floating text notification
    if (ufo) {
        createFloatingText(canvas.width / 2, canvas.height / 3, 'RESEARCH COMPLETE', '#0f0', { fontSize: 28, duration: 3 });
        createFloatingText(canvas.width / 2, canvas.height / 3 + 35, node.name.toUpperCase(), '#4f4', { fontSize: 22, duration: 3 });
    }

    // Play ascending chime sound
    SFX.researchComplete && SFX.researchComplete();

    // Brief green screen flash
    damageFlash = 0.3; // Reuse damageFlash for visual feedback (green applied in render)
    researchFlashTimer = 0.3;
}

// Green flash timer for research completion (separate from red damage flash)
let researchFlashTimer = 0;
let lastResearchCountdownSecond = -1; // Track blip sounds during final 5s of research

// Apply a tech effect when research completes
function applyTechEffect(nodeId) {
    switch(nodeId) {
        case 'pg1': techFlags.beamConduit = true; break;
        case 'pg2': techFlags.energyEfficiency = true; break;
        case 'pg3': techFlags.powerBroadcast = true; break;
        case 'pg4': techFlags.reactorAmplifier = true; break;
        case 'pg5': techFlags.selfSustainingGrid = true; break;
        case 'dc1':
            techFlags.droneUplink = true;
            droneSlots = Math.max(droneSlots, 3); // Expand from 2 to 3
            break;
        case 'dc2': techFlags.harvesterCoordinator = true; break;
        case 'dc3': techFlags.attackCoordinator = true; break;
        case 'dc4': techFlags.fleetExpansion = true; break;
        case 'dc5': techFlags.autonomousSwarm = true; break;
        case 'dn1':
            techFlags.thrusterBoost = true;
            // +30% speed applied in UFO movement code
            break;
        case 'dn2': techFlags.droneArmor = true; break;
        case 'dn3': techFlags.shieldTransfer = true; break;
        case 'dn4': techFlags.fleetResilience = true; break;
        case 'dn5': techFlags.swarmShield = true; break;
    }
}

// ============================================
// TANK SPAWNING
// ============================================

let heavyTanks = [];

function spawnTanks() {
    // New tank spawn curve: base count with scaling past wave 10
    let tankCount;
    if (wave <= 10) {
        tankCount = Math.floor(CONFIG.TANKS_BASE + (wave - 1) * CONFIG.TANKS_INCREMENT);
    } else {
        // Base count at wave 10, then +1 every 2 waves past wave 10
        const wave10Count = CONFIG.TANKS_BASE + 9 * CONFIG.TANKS_INCREMENT;
        tankCount = wave10Count + Math.floor((wave - 10) / 2);
    }

    // Determine coordinator hunter chance based on wave
    let coordHunterChance = 0;
    if (wave >= 12) {
        coordHunterChance = 0.65; // 65% for veteran waves
    } else if (wave >= 8) {
        coordHunterChance = 0.25; // 25% for strategic waves
    }

    tanks = [];
    for (let i = 0; i < tankCount; i++) {
        // Spread tanks across the screen width
        // Each tank gets a different starting position
        const margin = 100;
        const availableWidth = canvas.width - margin * 2;
        const x = margin + (i / Math.max(1, tankCount - 1)) * availableWidth;
        // Alternate direction based on which half of screen they're on
        const direction = x < canvas.width / 2 ? 1 : -1;
        const tank = new Tank(x, direction);
        if (coordHunterChance > 0 && Math.random() < coordHunterChance) {
            tank.coordinatorHunter = true;
        }
        tanks.push(tank);
    }

    // Spawn heavy tanks starting at wave 5 (pushed from wave 3)
    heavyTanks = [];
    if (wave >= 5) {
        // Wave 5: 1 heavy tank, Wave 6+: 2 heavy tanks, then +1 every 3 waves past 15
        let heavyTankCount = wave === 5 ? 1 : 2;
        if (wave > 15) {
            heavyTankCount += Math.floor((wave - 15) / 3);
        }

        for (let i = 0; i < heavyTankCount; i++) {
            // Spawn heavy tanks from opposite edges
            const direction = i % 2 === 0 ? 1 : -1;
            const x = direction === 1 ? -180 : canvas.width;
            const heavyTank = new HeavyTank(x, direction);
            if (coordHunterChance > 0 && Math.random() < coordHunterChance) {
                heavyTank.coordinatorHunter = true;
            }
            heavyTanks.push(heavyTank);
        }
    }
}

function updateTanks(dt) {
    for (const tank of tanks) {
        tank.update(dt);
    }
    for (const heavyTank of heavyTanks) {
        heavyTank.update(dt);
    }
}

function renderTanks() {
    for (const tank of tanks) {
        tank.render();
    }
    for (const heavyTank of heavyTanks) {
        heavyTank.render();
    }
}

// ============================================
// PROJECTILE MANAGEMENT
// ============================================

function updateProjectiles(dt) {
    for (const projectile of projectiles) {
        projectile.update(dt);
    }
    projectiles = projectiles.filter(p => p.alive);
}

function renderProjectiles() {
    for (const projectile of projectiles) {
        projectile.render();
    }
}

// ============================================
// BOMB MANAGEMENT
// ============================================

function dropBomb() {
    if (!ufo || playerInventory.bombs <= 0) return;

    notifyTutorialBomb();

    // Consume a bomb
    playerInventory.bombs--;
    pushOpsLogEvent('ORD.B DEPLOYED', '#f80', { type: 'bombUse' });
    if (playerInventory.bombs < playerInventory.maxBombs) {
        playerInventory.bombRechargeTimers.push(CONFIG.BOMB_RECHARGE_TIME);
    }

    // Create bomb at UFO position with UFO's horizontal velocity
    bombs.push(new Bomb(ufo.x, ufo.y + ufo.height / 2, ufo.vx));
    SFX.bombDrop && SFX.bombDrop();
    createFloatingText(ufo.x, ufo.y + 50, 'BOMB!', '#ff8800');
}

function updateBombs(dt) {
    for (const bomb of bombs) {
        bomb.update(dt);
    }
    bombs = bombs.filter(b => b.alive);

    if (playerInventory.bombReadyBounceTimer > 0) {
        playerInventory.bombReadyBounceTimer = Math.max(0, playerInventory.bombReadyBounceTimer - dt);
        if (playerInventory.bombReadyBounceTimer === 0) {
            playerInventory.bombReadyBounceIndex = -1;
        }
    }

    if (playerInventory.maxBombs > 0 && playerInventory.bombRechargeTimers.length > 0) {
        for (let i = playerInventory.bombRechargeTimers.length - 1; i >= 0; i--) {
            playerInventory.bombRechargeTimers[i] -= dt;
            if (playerInventory.bombRechargeTimers[i] <= 0) {
                playerInventory.bombRechargeTimers.splice(i, 1);
                playerInventory.bombs = Math.min(playerInventory.maxBombs, playerInventory.bombs + 1);
                playerInventory.bombReadyBounceTimer = 0.6;
                playerInventory.bombReadyBounceIndex = playerInventory.bombs - 1;
                SFX.bombReady && SFX.bombReady();
            }
        }
    } else if (playerInventory.bombRechargeTimers.length === 0) {
        playerInventory.bombRechargeTimers = [];
    }
}

function renderBombs() {
    for (const bomb of bombs) {
        bomb.render();
    }
}

// ============================================
// WARP JUKE
// ============================================

function triggerWarpJuke(direction) {
    // Check if we have enough beam energy to warp
    if (!ufo || ufo.energy < CONFIG.WARP_JUKE_ENERGY_COST) return;

    // Consume beam energy
    trackEnergyDelta(CONFIG.WARP_JUKE_ENERGY_COST, false);
    ufo.energy -= CONFIG.WARP_JUKE_ENERGY_COST;

    // Store old position for ghost trail
    const oldX = ufo.x;
    const oldY = ufo.y;

    // Add ghost at current position
    ufo.warpGhosts.push({
        x: oldX,
        y: oldY,
        alpha: 1.0
    });

    // Calculate new position
    if (techFlags.prescientDash) {
        // sn3: Prescient Jump - find nearest safe position with no projectiles nearby
        const candidates = [];
        const step = 40;
        for (let testX = ufo.width / 2; testX <= canvas.width - ufo.width / 2; testX += step) {
            let minDist = Infinity;
            for (const p of projectiles) {
                if (!p.alive) continue;
                const dx = p.x - testX;
                const dy = p.y - ufo.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) minDist = dist;
            }
            candidates.push({ x: testX, safety: minDist });
        }
        // Pick the safest position that is somewhat in the desired direction
        candidates.sort((a, b) => b.safety - a.safety);
        const best = candidates.find(c => (c.x - ufo.x) * direction >= 0) || candidates[0];
        if (best) {
            ufo.x = best.x;
        } else {
            const warpDistance = CONFIG.WARP_JUKE_DISTANCE * direction;
            ufo.x = Math.max(ufo.width / 2, Math.min(canvas.width - ufo.width / 2, ufo.x + warpDistance));
        }
    } else {
        const warpDistance = CONFIG.WARP_JUKE_DISTANCE * direction;
        ufo.x = Math.max(ufo.width / 2, Math.min(canvas.width - ufo.width / 2, ufo.x + warpDistance));
    }

    // Create warp effect particles
    const steps = 10;
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const px = oldX + (ufo.x - oldX) * t;
        const py = oldY + (ufo.y - oldY) * t + (Math.random() - 0.5) * 20;

        // Chromatic aberration effect - red, green, blue offset particles
        const colors = ['rgba(255, 100, 100, 0.8)', 'rgba(100, 255, 100, 0.8)', 'rgba(100, 100, 255, 0.8)'];
        for (let j = 0; j < 3; j++) {
            particles.push(new Particle(
                px + (j - 1) * 10,
                py,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                colors[j],
                3 + Math.random() * 3,
                0.3 + Math.random() * 0.2
            ));
        }
    }

    // Burst particles at destination
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        particles.push(new Particle(
            ufo.x + (Math.random() - 0.5) * 30,
            ufo.y + (Math.random() - 0.5) * 30,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            'rgba(0, 255, 255, 0.8)',
            2 + Math.random() * 4,
            0.2 + Math.random() * 0.2
        ));
    }

    // Screen shake
    screenShake = 0.2;

    // Play warp sound
    SFX.warpJuke && SFX.warpJuke();

    // Visual feedback
    createFloatingText(ufo.x, ufo.y - 60, 'WARP!', '#0ff');

    // Tutorial notification
    notifyTutorialWarpJuke();
}

// ============================================
// MISSILE SWARM MANAGEMENT
// ============================================

function fireMissileGroup() {
    if (!ufo || !missileUnlocked) return;

    // Find the first ready group
    const group = missileGroups.find(g => g.ready);
    if (!group) return;

    // Energy check
    if (ufo.energy < CONFIG.MISSILE_GROUP_ENERGY_COST) {
        createFloatingText(ufo.x, ufo.y + 60, 'LOW ENERGY!', '#ff4444');
        return;
    }

    // Deduct energy
    trackEnergyDelta(CONFIG.MISSILE_GROUP_ENERGY_COST, false);
    ufo.energy -= CONFIG.MISSILE_GROUP_ENERGY_COST;

    pushOpsLogEvent('MISSILE SALVO AWAY', '#f40', { type: 'missileUse' });

    // Mark group as fired
    group.ready = false;
    group.rechargeTimer = CONFIG.MISSILE_GROUP_RECHARGE_TIME;

    const missileCount = CONFIG.MISSILE_GROUP_SIZE;
    const groupLabel = String.fromCharCode(65 + group.index); // A, B, C, D...

    // Find all alive tanks for target assignment
    let allTanks = [...tanks, ...heavyTanks].filter(t => t.alive !== false);
    if (allTanks.length === 0 && projectiles.filter(p => p.alive).length === 0) return;

    // Assign targets: one missile per unique tank, extras double up on heavy tanks
    let targetAssignments = [];
    if (allTanks.length > 0) {
        let heavyTargets = allTanks.filter(t => heavyTanks.includes(t));
        for (let t of allTanks) {
            if (targetAssignments.length >= missileCount) break;
            targetAssignments.push(t);
        }
        let remaining = missileCount - targetAssignments.length;
        for (let i = 0; i < remaining; i++) {
            if (heavyTargets.length > 0) {
                targetAssignments.push(heavyTargets[i % heavyTargets.length]);
            } else {
                targetAssignments.push(allTanks[i % allTanks.length]);
            }
        }
    } else {
        // No tanks but projectiles exist — missiles will find intercept targets via scanForThreats
        for (let i = 0; i < missileCount; i++) {
            targetAssignments.push(null);
        }
    }

    // Show targeting reticles with group designations
    let uniqueTargets = [...new Set(targetAssignments.filter(t => t !== null))];
    for (let t of uniqueTargets) {
        const missilesOnTarget = targetAssignments.filter(a => a === t);
        for (let mi = 0; mi < missilesOnTarget.length; mi++) {
            missileTargetReticles.push({
                tank: t,
                timer: 0,
                maxTimer: 2.5,
                groupLabel: groupLabel,
                missileIndex: mi + 1,
                designation: groupLabel + '.' + (mi + 1),
                mode: 'offensive',
                lockPhase: 'acquiring'
            });
        }
    }

    // Play lock-on sound
    SFX.missileLockOn && SFX.missileLockOn();

    // Check for alive attack coordinators
    const launchCoords = activeCoordinators.filter(c => c.type === 'attack' && c.alive && c.state !== 'DYING');
    const fanSpread = CONFIG.MISSILE_FAN_SPREAD;

    if (launchCoords.length > 0) {
        // Split missiles across coordinators
        const perCoord = Math.floor(missileCount / launchCoords.length);
        let remainder = missileCount % launchCoords.length;
        let assignmentIndex = 0;

        for (let c = 0; c < launchCoords.length; c++) {
            const coord = launchCoords[c];
            const count = perCoord + (c < remainder ? 1 : 0);
            const centerAngle = -Math.PI / 2;
            const startAngle = centerAngle - fanSpread / 2;

            for (let i = 0; i < count; i++) {
                let launchAngle = count > 1
                    ? startAngle + (fanSpread * i / (count - 1))
                    : centerAngle;
                launchAngle += (Math.random() - 0.5) * CONFIG.MISSILE_FAN_JITTER * 2;
                const missile = new Missile(
                    coord.x, coord.y,
                    targetAssignments[assignmentIndex],
                    launchAngle, true
                );
                missile.launchDelay = assignmentIndex * CONFIG.MISSILE_LAUNCH_STAGGER_BASE + Math.random() * CONFIG.MISSILE_LAUNCH_STAGGER_JITTER;
                missile.groupLabel = groupLabel;
                missile.missileIndex = assignmentIndex + 1;
                missile.designation = groupLabel + '.' + (assignmentIndex + 1);
                playerMissiles.push(missile);
                assignmentIndex++;
            }
            coord.missileLaunchFlash = 0.2;
        }

        const centroidX = launchCoords.reduce((sum, c) => sum + c.x, 0) / launchCoords.length;
        const centroidY = launchCoords.reduce((sum, c) => sum + c.y, 0) / launchCoords.length;
        createFloatingText(centroidX, centroidY + 30, 'MISSILES!', '#ff2200');
    } else {
        // UFO fallback
        const startAngle = Math.PI / 2 - fanSpread / 2;
        for (let i = 0; i < missileCount; i++) {
            let launchAngle = startAngle + (fanSpread * i / Math.max(1, missileCount - 1));
            launchAngle += (Math.random() - 0.5) * CONFIG.MISSILE_FAN_JITTER * 2;
            const missile = new Missile(
                ufo.x, ufo.y + ufo.height / 2,
                targetAssignments[i],
                launchAngle, false
            );
            missile.launchDelay = i * CONFIG.MISSILE_LAUNCH_STAGGER_BASE + Math.random() * CONFIG.MISSILE_LAUNCH_STAGGER_JITTER;
            missile.groupLabel = groupLabel;
            missile.missileIndex = i + 1;
            missile.designation = groupLabel + '.' + (i + 1);
            playerMissiles.push(missile);
        }
        createFloatingText(ufo.x, ufo.y + 50, 'MISSILES!', '#ff2200');
    }

    SFX.missileLaunch && SFX.missileLaunch();
}

function updateMissiles(dt) {
    claimedThreats.clear();

    for (const missile of playerMissiles) {
        missile.update(dt);
    }

    // Intercept collision: player missiles vs enemy projectiles
    for (const missile of playerMissiles) {
        if (!missile.alive) continue;
        if (missile.phase === 'LAUNCH' || missile.phase === 'DECEL' || missile.phase === 'APEX') continue;
        if (!missile.interceptTarget || !missile.interceptTarget.alive) continue;

        const dist = Math.hypot(missile.x - missile.interceptTarget.x, missile.y - missile.interceptTarget.y);
        if (dist < CONFIG.MISSILE_INTERCEPT_RADIUS) {
            missile.alive = false;
            missile.interceptTarget.alive = false;
            createExplosion(missile.x, missile.y, 'small');
            screenShake = Math.max(screenShake, 0.1);
            createFloatingText(missile.x, missile.y, 'INTERCEPTED!', '#00ccff');
        }
    }

    // Collision with ANY enemy — missiles explode and deal damage on contact
    const allEnemies = [...tanks, ...heavyTanks];
    for (const missile of playerMissiles) {
        if (!missile.alive) continue;
        // Skip during upward launch phases
        if (missile.phase === 'LAUNCH' || missile.phase === 'DECEL' || missile.phase === 'APEX') continue;

        for (const enemy of allEnemies) {
            if (enemy.alive === false) continue;
            const cx = enemy.x + (enemy.width || 0) / 2;
            const cy = enemy.y + (enemy.height || 0) / 2;
            const dist = Math.hypot(missile.x - cx, missile.y - cy);
            const hitRadius = Math.max(30, (enemy.width || 0) / 3);
            if (dist < hitRadius) {
                // Use the missile's own hit logic for scoring/effects
                missile.targetTank = enemy;
                missile.hit();
                break;
            }
        }
    }

    // Collision with friendly units (drones, coordinators) — missiles explode on contact
    for (const missile of playerMissiles) {
        if (!missile.alive) continue;
        if (missile.phase === 'LAUNCH' || missile.phase === 'DECEL' || missile.phase === 'APEX') continue;

        for (const drone of activeDrones) {
            if (!drone.alive) continue;
            const cx = drone.x + (drone.width || 0) / 2;
            const cy = drone.y + (drone.height || 0) / 2;
            const dist = Math.hypot(missile.x - cx, missile.y - cy);
            if (dist < 30) {
                missile.alive = false;
                createExplosion(missile.x, missile.y, 'small');
                screenShake = Math.max(screenShake, 0.15);
                drone.takeDamage(missile.damage * 0.5);
                break;
            }
        }
        if (!missile.alive) continue;

        for (const coord of activeCoordinators) {
            if (!coord.alive || coord.state === 'DYING') continue;
            const dist = Math.hypot(missile.x - coord.x, missile.y - coord.y);
            if (dist < 35) {
                missile.alive = false;
                createExplosion(missile.x, missile.y, 'small');
                screenShake = Math.max(screenShake, 0.15);
                coord.takeDamage(missile.damage * 0.3);
                break;
            }
        }
    }

    playerMissiles = playerMissiles.filter(m => m.alive);

    // Update targeting reticles (timer counts UP)
    for (const reticle of missileTargetReticles) {
        reticle.timer += dt;
        // Update lock phase
        if (reticle.lockPhase === 'acquiring' && reticle.timer >= 0.4) {
            reticle.lockPhase = 'tracking';
        }
        // If the target died (intercepted projectile, destroyed tank), jump to fadeout phase
        const tgt = reticle.tank || reticle.target;
        if (tgt && tgt.alive === false && reticle.timer < reticle.maxTimer - 0.5) {
            reticle.timer = reticle.maxTimer - 0.5; // enter terminal fadeout
        }
    }
    missileTargetReticles = missileTargetReticles.filter(r => r.timer < r.maxTimer);

    // Recharge missile groups independently
    if (missileUnlocked) {
        for (const group of missileGroups) {
            if (!group.ready && group.rechargeTimer > 0) {
                group.rechargeTimer -= dt;
                if (group.rechargeTimer <= 0) {
                    group.ready = true;
                    group.rechargeTimer = 0;
                    SFX.missileGroupReady && SFX.missileGroupReady();
                    // Check if ALL groups are now ready
                    if (missileGroups.every(g => g.ready)) {
                        SFX.missileReady && SFX.missileReady();
                        createFloatingText(
                            ufo ? ufo.x : canvas.width / 2,
                            ufo ? ufo.y + 30 : 100,
                            'ALL GROUPS READY', '#ff4400'
                        );
                    }
                }
            }
        }
    }
}

function renderMissiles() {
    for (const missile of playerMissiles) {
        missile.render(ctx);
    }

    // Render Evangelion-style targeting reticles
    // Group reticles by target for label stacking
    const reticlesByTarget = new Map();
    for (const reticle of missileTargetReticles) {
        // Support both tank targets and projectile targets
        const tgt = reticle.tank || reticle.target;
        if (!tgt || tgt.alive === false) continue;
        if (!reticlesByTarget.has(tgt)) reticlesByTarget.set(tgt, []);
        reticlesByTarget.get(tgt).push(reticle);
    }

    for (const [target, reticles] of reticlesByTarget) {
        // Projectiles use x,y directly; tanks use center of bounding box
        const isProjectile = reticles[0] && reticles[0].isProjectile;
        const tcx = isProjectile ? target.x : target.x + (target.width || 0) / 2;
        const tcy = isProjectile ? target.y : target.y + (target.height || 0) / 2;

        for (let ri = 0; ri < reticles.length; ri++) {
            const reticle = reticles[ri];
            const t = reticle.timer; // time elapsed
            const maxT = reticle.maxTimer;
            const mode = reticle.mode || 'offensive';
            const primaryColor = mode === 'intercept' ? '#00ccff' : '#ff4400';
            const highlightColor = mode === 'intercept' ? '#88eeff' : '#ff8844';

            // Diamond size (center-to-vertex) — smaller for projectile intercepts
            const baseSize = isProjectile ? 20 : 32;

            // Phase calculations
            const isAcquiring = t < 0.4;
            const isConfirming = t >= 0.4 && t < 0.8;
            const isTracking = t >= 0.8 && t < maxT - 0.5;
            const isFading = t >= maxT - 0.5;

            // Alpha
            let alpha = 1.0;
            if (isFading) {
                alpha = Math.max(0, (maxT - t) / 0.5);
            }
            if (isTracking) {
                alpha = 0.7 + Math.sin(t * 4) * 0.15;
            }

            // Acquiring scale (2x -> 1x)
            let scale = 1.0;
            if (isAcquiring) {
                scale = 2.0 - (t / 0.4);
            }

            // Flash phase for acquiring
            const flashOn = isAcquiring ? Math.floor(Date.now() / 83) % 2 === 0 : true;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(tcx, tcy);

            // Rotating diamond (45-deg rotated square)
            const rotation = t * 0.8; // 0.8 rad/s
            const diamondSize = baseSize * scale;

            ctx.save();
            ctx.rotate(Math.PI / 4 + rotation);

            // Confirmation flash at t=0.4
            if (isConfirming && t < 0.5) {
                const flashAlpha = 1.0 - (t - 0.4) / 0.1;
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 3;
                ctx.globalAlpha = alpha * flashAlpha;
                ctx.strokeRect(-diamondSize, -diamondSize, diamondSize * 2, diamondSize * 2);
                ctx.globalAlpha = alpha;
            }

            // Diamond stroke
            ctx.strokeStyle = (isAcquiring && !flashOn) ? highlightColor : primaryColor;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-diamondSize, -diamondSize, diamondSize * 2, diamondSize * 2);

            // Corner brackets at diamond vertices
            let bracketLen = 6;
            if (isConfirming && t < 0.5) {
                bracketLen = 6 + (12 - 6) * Math.max(0, 1 - (t - 0.4) / 0.1);
            }
            const corners = [
                [-diamondSize, -diamondSize],
                [diamondSize, -diamondSize],
                [diamondSize, diamondSize],
                [-diamondSize, diamondSize]
            ];
            ctx.beginPath();
            for (const [bx, by] of corners) {
                const dx = bx > 0 ? -1 : 1;
                const dy = by > 0 ? -1 : 1;
                ctx.moveTo(bx + dx * bracketLen, by);
                ctx.lineTo(bx, by);
                ctx.lineTo(bx, by + dy * bracketLen);
            }
            ctx.stroke();

            ctx.restore(); // undo diamond rotation

            // Static crosshair (no rotation)
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * 0.7;
            const crossLen = 12;
            const gap = 2;
            ctx.beginPath();
            ctx.moveTo(-crossLen, 0); ctx.lineTo(-gap, 0);
            ctx.moveTo(gap, 0); ctx.lineTo(crossLen, 0);
            ctx.moveTo(0, -crossLen); ctx.lineTo(0, -gap);
            ctx.moveTo(0, gap); ctx.lineTo(0, crossLen);
            ctx.stroke();
            ctx.globalAlpha = alpha;

            // Center dot (pulsing)
            const dotPulse = Math.sin(t * 8) * 0.3 + 0.7;
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = alpha * dotPulse;
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = alpha;

            // Designation label
            if (reticle.designation) {
                const labelVisible = isAcquiring ? flashOn : true;
                if (labelVisible) {
                    const labelX = 22;
                    const labelY = -22 + ri * 14; // stack labels for same target
                    const labelText = reticle.designation;

                    ctx.font = 'bold 11px monospace';
                    const textW = ctx.measureText(labelText).width;

                    // Background rect
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                    ctx.fillRect(labelX - 2, labelY - 10, textW + 4, 14);
                    ctx.strokeStyle = primaryColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(labelX - 2, labelY - 10, textW + 4, 14);

                    // Label text
                    ctx.fillStyle = primaryColor;
                    ctx.textAlign = 'left';
                    ctx.fillText(labelText, labelX, labelY);
                }
            }

            ctx.restore();
        }
    }
}

function renderMissileCount(startX, startY) {
    if (!missileUnlocked || missileGroupCount <= 0) return 0;

    const mW = 5;        // missile silhouette width (compact for 3-col grid)
    const mH = 14;       // missile silhouette height
    const mSpacing = 2;  // spacing between missiles in a group
    const groupSpacing = 5; // vertical spacing between group rows
    const panelPadding = 8;
    const keyWidth = 20;
    const keyHeight = 18;
    const labelGap = 6;
    const labelCharW = 8; // approximate width for group label letter
    const groupSize = CONFIG.MISSILE_GROUP_SIZE;
    const colGap = 8;    // gap between grid columns

    // Up to 3-column grid: groups split across columns
    const numCols = missileGroupCount > 6 ? 3 : (missileGroupCount > 3 ? 2 : 1);
    const rowsPerCol = Math.ceil(missileGroupCount / numCols);
    const colW = labelCharW + groupSize * (mW + mSpacing); // width of one column

    // Panel dimensions
    ctx.font = 'bold 10px monospace';
    const headerLabelW = ctx.measureText('SALVO').width;
    const headerW = headerLabelW + labelGap + keyWidth + 4;
    const gridW = numCols > 1 ? colW * numCols + colGap * (numCols - 1) : colW;
    const panelWidth = Math.max(headerW, gridW) + panelPadding * 2;
    const headerHeight = keyHeight + 2;
    const groupsHeight = rowsPerCol * (mH + groupSpacing) - groupSpacing;
    const panelHeight = headerHeight + groupsHeight + panelPadding * 2 + 4;

    const allReady = missileGroups.every(g => g.ready);

    // Panel background
    ctx.fillStyle = allReady ? 'rgba(80, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Header label
    const headerY = startY + panelPadding;
    ctx.fillStyle = allReady ? '#ff4400' : '#888';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SALVO', startX + panelPadding, headerY + keyHeight / 2 + 4);

    // Key badge (X)
    const keyX = startX + panelPadding + headerLabelW + labelGap;
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.roundRect(keyX, headerY, keyWidth, keyHeight, 4);
    ctx.fill();
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.roundRect(keyX + 1, headerY + 1, keyWidth - 2, keyHeight - 4, 3);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('X', keyX + keyWidth / 2, headerY + keyHeight / 2 + 3);

    // SALVO RDY text
    if (allReady) {
        const pulse = Math.sin(Date.now() / 200) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(255, 68, 0, ${pulse})`;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('SALVO RDY', startX + panelWidth - panelPadding, headerY + keyHeight / 2 + 4);
        ctx.textAlign = 'left';
    }

    // Draw groups in up to 3-column grid
    const groupsStartY = headerY + headerHeight + 4;
    for (let gi = 0; gi < missileGroupCount; gi++) {
        const group = missileGroups[gi];
        const col = Math.floor(gi / rowsPerCol);  // column 0, 1, or 2
        const row = gi % rowsPerCol;               // row within column
        const colX = startX + panelPadding + col * (colW + colGap);
        const rowY = groupsStartY + row * (mH + groupSpacing);
        const groupLabel = String.fromCharCode(65 + gi);

        // Recharge progress (0 = empty, 1 = full/ready)
        const rechargeProgress = group.ready ? 1.0 :
            1.0 - (group.rechargeTimer / CONFIG.MISSILE_GROUP_RECHARGE_TIME);

        // Group label
        const labelPulse = group.ready ? (Math.sin(Date.now() / 300 + gi) * 0.3 + 0.7) : 0.4;
        ctx.fillStyle = group.ready ? `rgba(255, 68, 0, ${labelPulse})` : '#555';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(groupLabel, colX, rowY + mH / 2 + 3);

        // Draw 4 missile silhouettes
        for (let mi = 0; mi < groupSize; mi++) {
            const mx = colX + labelCharW + mi * (mW + mSpacing);
            const my = rowY;

            if (group.ready) {
                // Full fill
                ctx.fillStyle = '#cc2200';
                ctx.fillRect(mx, my + 2, mW, mH - 2);
                // Nose cone
                ctx.beginPath();
                ctx.moveTo(mx, my + 2);
                ctx.lineTo(mx + mW / 2, my);
                ctx.lineTo(mx + mW, my + 2);
                ctx.closePath();
                ctx.fill();
                // Fins
                ctx.fillStyle = '#881100';
                ctx.fillRect(mx - 1, my + mH - 2, mW + 2, 2);
                // Pulsing nose glow
                const pulse = Math.sin(Date.now() / 150 + mi + gi * 4) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255, 170, 0, ${pulse})`;
                ctx.beginPath();
                ctx.arc(mx + mW / 2, my + 1, 1.2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Empty outline
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 0.8;
                ctx.strokeRect(mx, my + 2, mW, mH - 2);
                ctx.beginPath();
                ctx.moveTo(mx, my + 2);
                ctx.lineTo(mx + mW / 2, my);
                ctx.lineTo(mx + mW, my + 2);
                ctx.closePath();
                ctx.stroke();

                // Fill-from-bottom based on recharge progress
                if (rechargeProgress > 0) {
                    const fillH = (mH - 2) * rechargeProgress;
                    const fillY = my + mH - fillH;

                    // Fill color based on progress
                    let fillColor;
                    if (rechargeProgress < 0.5) fillColor = '#661100';
                    else if (rechargeProgress < 0.9) fillColor = '#cc2200';
                    else fillColor = '#ff4400';

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(mx, fillY, mW, fillH);
                    ctx.clip();

                    ctx.fillStyle = fillColor;
                    ctx.fillRect(mx, my + 2, mW, mH - 2);
                    // Nose cone in clip
                    ctx.beginPath();
                    ctx.moveTo(mx, my + 2);
                    ctx.lineTo(mx + mW / 2, my);
                    ctx.lineTo(mx + mW, my + 2);
                    ctx.closePath();
                    ctx.fill();

                    ctx.restore();

                    // Meniscus line at fill level
                    ctx.strokeStyle = 'rgba(255, 170, 0, 0.6)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(mx, fillY);
                    ctx.lineTo(mx + mW, fillY);
                    ctx.stroke();
                }
            }
        }
    }

    return panelHeight;
}

// ============================================
// REVIVE SYSTEM
// ============================================

function triggerRevive() {
    // Consume an energy cell
    playerInventory.energyCells--;

    // Restore health
    ufo.health = CONFIG.ENERGY_CELL_REVIVE_HEALTH;

    // Grant invincibility
    ufo.invincibleTimer = CONFIG.INVINCIBILITY_DURATION;

    // Visual feedback - ring of explosions around UFO (celebratory, not destructive)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 80;
        setTimeout(() => {
            if (ufo) {
                createExplosion(ufo.x + Math.cos(angle) * dist, ufo.y + Math.sin(angle) * dist, 'medium');
            }
        }, i * 50);
    }

    // Screen shake and flash for feedback
    screenShake = 0.5;

    // Floating text
    createFloatingText(ufo.x, ufo.y - 50, 'REVIVED!', '#f55');
    createFloatingText(ufo.x, ufo.y - 80, `${playerInventory.energyCells} CELLS LEFT`, '#ff0');

    // Play revive sound
    SFX.revive && SFX.revive();
}

// ============================================
// GAME OVER
// ============================================

function triggerGameOver() {
    // Clean up tutorial if active
    cleanupTutorial();

    // Freeze sprite animations
    animationPausedAt = Date.now();

    // Stop beam sound if active
    SFX.stopBeamLoop();

    // Mark that user has played a game this session
    hasPlayedThisSession = true;
    titleFeedbackSubmitted = false; // Reset so they can submit new feedback

    // Capture final game state FIRST, before any resets can occur
    finalScore = score;
    finalWave = wave;
    finalGameLength = (Date.now() - gameStartTime) / 1000;
    finalHealth = ufo.health;

    // Store UFO position before hiding it
    const ufoX = ufo.x;
    const ufoY = ufo.y;

    // Hide the UFO immediately
    ufo = null;

    // Kill all coordinators — fast crash sequence (must finish before game over screen at 1200ms)
    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        coord.state = 'DYING';
        coord.dyingTimer = 0.6; // Skip the sag phase, go straight to fast tumble
        coord.dyingVy = 300;    // Start with high downward velocity
        coord.dyingTiltSpeed = 4;
        coord.dyingTiltDir = Math.random() < 0.5 ? -1 : 1;
        // Kill sub-drones immediately
        for (const drone of coord.subDrones) {
            if (drone.alive) drone.die();
        }
        coord.subDrones = [];
    }

    // MASSIVE explosion at UFO position - multiple waves of explosions
    // Initial central explosion
    createExplosion(ufoX, ufoY, 'large');

    // Ring of explosions around the UFO
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 50;
        setTimeout(() => {
            createExplosion(ufoX + Math.cos(angle) * dist, ufoY + Math.sin(angle) * dist, 'large');
        }, 50 + i * 30);
    }

    // Second wave - larger ring
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + 0.2;
        const dist = 100;
        setTimeout(() => {
            createExplosion(ufoX + Math.cos(angle) * dist, ufoY + Math.sin(angle) * dist, 'medium');
        }, 150 + i * 25);
    }

    // Third wave - debris explosions scattered further out
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const randAngle = Math.random() * Math.PI * 2;
            const randDist = 80 + Math.random() * 80;
            createExplosion(ufoX + Math.cos(randAngle) * randDist, ufoY + Math.sin(randAngle) * randDist, 'medium');
        }, 300 + i * 50);
    }

    // Extended screen shake for dramatic effect
    screenShake = 1.0;

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('alienAbductoramaHighScore', highScore);
    }

    // Play game over sound after explosions
    setTimeout(() => {
        SFX.gameOver();
    }, 600);

    // Delay game over screen longer to see the full explosion
    setTimeout(() => {
        if (scoreQualifiesForLeaderboard()) {
            // Reset name entry state
            nameEntryChars = ['A', 'A', 'A'];
            nameEntryPosition = 0;
            submissionError = null;
            scoreSubmitting = false;
            gameState = 'NAME_ENTRY';
            createCelebrationEffect();
        } else {
            // Activity already tracked during gameplay via /api/activity
            resetFeedbackState();
            gameState = 'FEEDBACK';
        }
    }, 1200);
}

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2 || countryCode === 'XX') {
        return '🌍'; // Globe for unknown
    }
    // Convert country code to regional indicator symbols
    const codePoints = [...countryCode.toUpperCase()].map(
        char => 0x1F1E6 - 65 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
}

function getOrCreateVoterId() {
    let voterId = localStorage.getItem('alienAbductoramaVoterId');
    if (!voterId) {
        voterId = crypto.randomUUID();
        localStorage.setItem('alienAbductoramaVoterId', voterId);
    }
    return voterId;
}

function formatRelativeDate(timestamp) {
    if (!timestamp) return '';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days <= 2) return `${days}d ago`;

    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}

// API base URL - use full URL when proxied through studio.mfelix.org
const API_BASE = window.location.hostname === 'studio.mfelix.org'
    ? 'https://alien-abductorama.mfelixstudio.workers.dev'
    : '';

async function fetchLeaderboard() {
    leaderboardLoading = true;
    try {
        const response = await fetch(`${API_BASE}/api/scores`);
        if (response.ok) {
            const data = await response.json();
            // Handle both old (array) and new (object) response shapes
            if (Array.isArray(data)) {
                leaderboard = data;
                activityStats = null;
            } else {
                leaderboard = data.leaderboard || [];
                activityStats = data.stats || null;
            }
        }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    } finally {
        leaderboardLoading = false;
    }
}

async function submitScore(name) {
    submissionError = null;
    try {
        const response = await fetch(`${API_BASE}/api/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                score: finalScore,
                wave: finalWave,
                gameLength: finalGameLength,
            }),
        });

        const result = await response.json();
        // Use leaderboard from response to avoid cache staleness
        if (result.leaderboard) {
            leaderboard = result.leaderboard;
        }
        if (result.stats) {
            activityStats = result.stats;
        }
        if (result.success) {
            // Store entry ID for highlighting on leaderboard
            if (result.rank && result.leaderboard && result.leaderboard[result.rank - 1]) {
                highlightedEntryId = result.leaderboard[result.rank - 1].id;
                hasScrolledToHighlight = false; // Reset so we auto-scroll when viewing leaderboard
            }
            return result.rank;
        }
        // Server returned but submission didn't succeed
        if (result.error || result.message) {
            submissionError = result.error || result.message;
        }
    } catch (error) {
        console.error('Failed to submit score:', error);
        submissionError = 'Failed to save score. Try again!';
    }
    return null;
}

function scoreQualifiesForLeaderboard() {
    if (finalScore <= 0) return false;
    if (leaderboard.length < 100) return true;
    // Match server-side tie-breaker logic
    const last = leaderboard[leaderboard.length - 1];
    if (finalScore !== last.score) return finalScore > last.score;
    if (finalWave !== last.wave) return finalWave > last.wave;
    return true; // Same score/wave qualifies; sort will keep earlier timestamp first
}

// Send activity ping to register that someone is playing
// Called once per game session after 10 seconds OR when first point is scored
async function sendActivityPing() {
    if (activityPingSent) return;
    activityPingSent = true;

    try {
        const response = await fetch(`${API_BASE}/api/activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.stats) {
                activityStats = result.stats;
            }
        }
    } catch (error) {
        // Silently fail - activity tracking is non-critical
        console.error('Failed to send activity ping:', error);
    }
}

// ============================================
// FEEDBACK FUNCTIONS
// ============================================

function resetFeedbackState() {
    feedbackRatings = { enjoyment: 0, difficulty: 0, returnIntent: 0 };
    feedbackSuggestion = '';
    feedbackCursorPosition = 0;
    feedbackSelectedRow = 0;
    feedbackSelectedButton = 0;
    feedbackSubmitting = false;
    feedbackError = null;
    feedbackButtonBounds = { submit: null, skip: null, playAgain: null };
    feedbackTextBoxBounds = null;
    feedbackStarBounds = [];
    // Reset feedback screen suggestions state
    feedbackScreenSuggestions = null;
    feedbackScreenLoading = false;
    feedbackScreenScrollOffset = 0;
    feedbackScreenSuggestionBounds = [];
    feedbackScreenSort = 'top';
    feedbackUfoOffset = 0;
    // Reset separate submission states
    ratingsSubmitted = false;
    ratingsSubmitting = false;
    suggestionSubmitting = false;
    suggestionSubmitted = false;
    suggestionError = null;
    feedbackSuggestionSubmitBounds = null;
}

async function submitFeedback() {
    if (feedbackSubmitting) return;

    // Validate all ratings are filled
    if (feedbackRatings.enjoyment === 0 || feedbackRatings.difficulty === 0 || feedbackRatings.returnIntent === 0) {
        feedbackError = 'Please rate all three questions';
        return;
    }

    feedbackSubmitting = true;
    feedbackError = null;

    try {
        const response = await fetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enjoymentRating: feedbackRatings.enjoyment,
                difficultyRating: feedbackRatings.difficulty,
                returnIntentRating: feedbackRatings.returnIntent,
                suggestion: feedbackSuggestion || null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            feedbackError = data.error || 'Failed to submit feedback';
            feedbackSubmitting = false;
            return;
        }

        // Success - go to title
        resetFeedbackState();
        animationPausedAt = null;
        gameState = 'TITLE';
        fetchLeaderboard();
        fetchFeedback(); // Refresh feedback data
    } catch (error) {
        feedbackError = 'Network error - please try again';
        feedbackSubmitting = false;
    }
}

function skipFeedback() {
    resetFeedbackState();
    animationPausedAt = null;
    gameState = 'TITLE';
    titleTab = 'feedback';
    fetchLeaderboard();
    fetchFeedback();
}

function playAgainFromFeedback() {
    resetFeedbackState();
    startGame();
}

// Auto-submit ratings when all three are filled
async function submitRatingsOnly() {
    if (ratingsSubmitting || ratingsSubmitted) return;

    // Check if all ratings are filled
    if (feedbackRatings.enjoyment === 0 || feedbackRatings.difficulty === 0 || feedbackRatings.returnIntent === 0) {
        return; // Not all filled yet
    }

    ratingsSubmitting = true;

    try {
        const response = await fetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enjoymentRating: feedbackRatings.enjoyment,
                difficultyRating: feedbackRatings.difficulty,
                returnIntentRating: feedbackRatings.returnIntent,
                suggestion: null // Ratings only, no suggestion
            })
        });

        if (response.ok) {
            ratingsSubmitted = true;
            SFX.feedbackSuccess();
        }
    } catch (error) {
        console.error('Failed to submit ratings:', error);
    }
    ratingsSubmitting = false;
}

// Submit a feature suggestion separately
async function submitSuggestionOnly() {
    if (suggestionSubmitting || suggestionSubmitted) return;
    if (!feedbackSuggestion.trim()) {
        suggestionError = 'Please enter a suggestion';
        return;
    }

    suggestionSubmitting = true;
    suggestionError = null;

    try {
        const response = await fetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enjoymentRating: feedbackRatings.enjoyment || null,
                difficultyRating: feedbackRatings.difficulty || null,
                returnIntentRating: feedbackRatings.returnIntent || null,
                suggestion: feedbackSuggestion.trim()
            })
        });

        const data = await response.json();

        if (response.ok) {
            suggestionSubmitted = true;
            feedbackSuggestion = '';
            feedbackCursorPosition = 0;
            SFX.feedbackSuccess();
            // Navigate to title screen with feedback tab after sound plays
            setTimeout(() => {
                resetFeedbackState();
                animationPausedAt = null;
                gameState = 'TITLE';
                titleTab = 'feedback';
                fetchLeaderboard();
                fetchFeedback();
            }, 400);
        } else {
            suggestionError = data.error || 'Failed to submit suggestion';
        }
    } catch (error) {
        suggestionError = 'Network error - please try again';
    }
    suggestionSubmitting = false;
}

async function fetchFeedback() {
    feedbackLoading = true;
    feedbackFetchError = null;
    try {
        const response = await fetch(`${API_BASE}/api/feedback?sort=${feedbackSort}&limit=50`);
        const data = await response.json();
        feedbackData = data;
    } catch (error) {
        console.error('Failed to fetch feedback:', error);
        feedbackFetchError = 'Failed to load - click to retry';
        feedbackData = null;
    }
    feedbackLoading = false;
}

// Fetch suggestions for the feedback submission screen (right column)
async function fetchFeedbackScreenSuggestions() {
    feedbackScreenLoading = true;
    try {
        const response = await fetch(`${API_BASE}/api/feedback?sort=${feedbackScreenSort}&limit=50`);
        const data = await response.json();
        feedbackScreenSuggestions = data;
    } catch (error) {
        console.error('Failed to fetch suggestions for feedback screen:', error);
        feedbackScreenSuggestions = null;
    }
    feedbackScreenLoading = false;
}

async function upvoteSuggestion(suggestionId) {
    const voterId = getOrCreateVoterId();

    try {
        const response = await fetch(`${API_BASE}/api/feedback/${suggestionId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voterId })
        });

        const data = await response.json();

        if (data.success) {
            // Update title screen feedback tab state
            if (feedbackData) {
                const suggestion = feedbackData.suggestions.find(s => s.id === suggestionId);
                if (suggestion) {
                    suggestion.upvotes = data.upvotes;
                    suggestion.voterIds = suggestion.voterIds || [];
                    suggestion.voterIds.push(voterId);
                }
            }
            // Update feedback screen state (right column)
            if (feedbackScreenSuggestions) {
                const suggestion = feedbackScreenSuggestions.suggestions.find(s => s.id === suggestionId);
                if (suggestion) {
                    suggestion.upvotes = data.upvotes;
                    suggestion.voterIds = suggestion.voterIds || [];
                    suggestion.voterIds.push(voterId);
                }
            }
        }
    } catch (error) {
        console.error('Failed to upvote:', error);
    }
}

function handleTitleFeedbackSubmit() {
    // Open the custom modal
    featureModalOpen = true;
    featureModalText = '';
    featureModalCursorPosition = 0;
    featureModalSubmitting = false;
    featureModalError = null;
}

async function submitFeatureRequest() {
    if (featureModalSubmitting) return;

    const trimmed = featureModalText.trim();
    if (!trimmed) {
        featureModalError = 'Please enter a feature request';
        return;
    }

    if (trimmed.length > 300) {
        featureModalError = 'Too long! Max 300 characters.';
        return;
    }

    featureModalSubmitting = true;
    featureModalError = null;

    try {
        const response = await fetch(`${API_BASE}/api/feedback/moderation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suggestion: trimmed })
        });

        if (response.ok) {
            titleFeedbackSubmitted = true;
            featureModalOpen = false;
            SFX.feedbackSuccess();
        } else {
            const data = await response.json();
            featureModalError = data.error || 'Failed to submit';
        }
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        featureModalError = 'Network error - try again';
    }
    featureModalSubmitting = false;
}

function closeFeatureModal() {
    featureModalOpen = false;
    featureModalText = '';
    featureModalError = null;
}

function createCelebrationEffect() {
    // Initialize the celebratory UFO for name entry screen
    initNameEntryUfo();

    // Create rising beam-like particles in cyan/magenta theme
    const colors = [
        'rgb(0, 255, 255)',   // Cyan
        'rgb(255, 0, 255)',   // Magenta
        'rgb(255, 255, 0)',   // Yellow
        'rgb(255, 255, 255)', // White
    ];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const particle = new Particle(
                x,
                canvas.height + 10,
                (Math.random() - 0.5) * 100,  // vx: slight horizontal drift
                -200 - Math.random() * 200,    // vy: upward
                colors[Math.floor(Math.random() * colors.length)],
                3 + Math.random() * 4,
                2 + Math.random()
            );
            particles.push(particle);
        }, i * 30); // Staggered spawn
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

function startGame() {
    cleanupTutorial();
    animationPausedAt = null;
    gameState = 'PLAYING';
    gameStartTime = Date.now();
    activityPingSent = false;
    ufo = new UFO();
    targets = [];
    tanks = [];
    heavyTanks = [];
    projectiles = [];
    particles = [];
    floatingTexts = [];
    score = 0;
    combo = 0;
    ufoBucks = 0;
    // Reset title screen state for next time
    titleHumans = [];
    highlightedEntryId = null;
    // Reset harvest counters
    harvestCount = { human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0 };
    harvestBounce = { human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0 };
    resetWaveStats();
    waveSummary = null;
    waveSummaryState = null;
    waveHistory = [];
    wave = 1;
    waveTimer = CONFIG.WAVE_DURATION;
    targetSpawnTimer = 0; // Spawn first target immediately
    screenShake = 0;
    damageFlash = 0;
    lastTimerWarningSecond = -1;
    lastShopCountdownSecond = -1;

    // Reset powerups
    powerups = [];
    powerupSpawnTimer = CONFIG.POWERUP_FIRST_SPAWN_DELAY;
    activePowerups = {
        rapid_abduct: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
        shield: { active: false, charges: 0, maxCharges: 0, stacks: 0 },
        energy_surge: { active: false, timer: 0, maxTimer: 0, stacks: 0 },
        wide_beam: { active: false, timer: 0, maxTimer: 0, stacks: 0 }
    };

    // Reset player inventory (shop upgrades)
    playerInventory = {
        maxEnergyBonus: 0,
        speedBonus: 0,
        energyCells: 0,
        bombs: CONFIG.BOMB_START_COUNT,
        maxBombs: CONFIG.BOMB_START_COUNT,
        bombRechargeTimers: [],
        bombReadyBounceTimer: 0,
        bombReadyBounceIndex: -1,
        energyRechargeBonus: 0
    };

    // Clear active bombs
    bombs = [];

    // === EXPANSION: Reset new state ===
    bioMatter = 0;
    quotaTarget = getQuotaTarget(1);
    quotaProgress = 0;
    consecutiveQuotaMisses = 0;

    // Reset commander state
    commanderState.currentDialogue = '';
    commanderState.emotion = 'neutral';
    commanderState.animTimer = 0;
    commanderState.shopCommentTimer = 0;
    commanderState.typewriterIndex = 0;
    commanderState.typewriterTimer = 0;
    commanderState.entranceTimer = 0;
    commanderState.visible = false;

    // Reset NGE HUD state
    hudAnimState = {
        weaponsPanelVisible: false,
        weaponsPanelSlide: 0,
        fleetPanelVisible: false,
        fleetPanelSlide: 0,
        commanderPanelSlide: 0,
        diagPanelVisible: false,
        diagPanelSlide: 0,
        opsLogPanelVisible: false,
        opsLogPanelSlide: 0,
        energyFlowPhase: 0,
        scanlineOffset: 0,
        energyPulseTimer: 0,
        energyPulseActive: false,
        energyPulseY: 0
    };
    diagnosticsState = {
        scrollOffset: 0, scrollDirection: 1, scrollPauseTimer: 0
    };
    opsLogState = {
        events: [], maxEvents: 20, throttle: {}, throttleWindow: 500
    };
    missionCommanderState = {
        visible: false,
        dialogue: '',
        typewriterIndex: 0,
        typewriterTimer: 0,
        displayTimer: 0,
        displayDuration: 6,
        slideProgress: 0,
        emotion: 'neutral',
        cooldownTimer: 15,
        minCooldown: 20,
        maxCooldown: 40,
        triggeredThisWave: false
    };
    energyTimeSeries = {
        buffer: new Float32Array(180),
        intakeBuffer: new Float32Array(180),
        outputBuffer: new Float32Array(180),
        writeIndex: 0, sampleTimer: 0, sampleInterval: 1/6,
        frameIntake: 0, frameOutput: 0,
        peakValue: 100, smoothPeak: 100
    };

    techTree = {
        researched: new Set(),
        queue: [],
        activeResearch: null
    };

    // Reset tech flags
    techFlags = {
        beamConduit: false,
        energyEfficiency: false,
        powerBroadcast: false,
        reactorAmplifier: false,
        selfSustainingGrid: false,
        droneUplink: false,
        harvesterCoordinator: false,
        attackCoordinator: false,
        fleetExpansion: false,
        autonomousSwarm: false,
        thrusterBoost: false,
        droneArmor: false,
        shieldTransfer: false,
        fleetResilience: false,
        swarmShield: false
    };
    researchFlashTimer = 0;
    lastResearchCountdownSecond = -1;

    missileGroups = [];
    missileGroupCount = 0;
    missileDamage = 0;
    playerMissiles = [];
    claimedThreats.clear();
    missileTargetReticles = [];
    missileUnlocked = false;

    activeDrones = [];
    activeCoordinators = [];
    coordChargeTutorialShown = false;
    coordChargeTutorialState = null;
    droneSlots = 0;
    harvesterUnlocked = false;
    battleDroneUnlocked = false;
    droneCooldownTimer = 0;
    autoDeployCooldown = 0;

    bombBlastTier = 0;
    bombDamageTier = 0;
    shopNewItems = new Set();

    // Spawn initial tanks (skip on wave 1 — tutorial handles tank entrance)
    if (wave !== 1) {
        spawnTanks();
    }

    initHUDBoot();
    initTutorial();
}

// ============================================
// NGE HUD RENDERING UTILITIES
// ============================================

// Evangelion-inspired angular panel with cut corners
function renderNGEPanel(x, y, w, h, opts = {}) {
    const {
        color = '#0ff',
        alpha = 0.65,
        cutCorners = [],
        label = '',
        labelColor = null,
        filled = true,
        borderOnly = false
    } = opts;

    const cut = 10; // 45-degree corner cut size

    ctx.save();

    // Build angular path with cut corners
    ctx.beginPath();
    if (cutCorners.includes('tl')) {
        ctx.moveTo(x + cut, y);
    } else {
        ctx.moveTo(x, y);
    }

    if (cutCorners.includes('tr')) {
        ctx.lineTo(x + w - cut, y);
        ctx.lineTo(x + w, y + cut);
    } else {
        ctx.lineTo(x + w, y);
    }

    if (cutCorners.includes('br')) {
        ctx.lineTo(x + w, y + h - cut);
        ctx.lineTo(x + w - cut, y + h);
    } else {
        ctx.lineTo(x + w, y + h);
    }

    if (cutCorners.includes('bl')) {
        ctx.lineTo(x + cut, y + h);
        ctx.lineTo(x, y + h - cut);
    } else {
        ctx.lineTo(x, y + h);
    }

    if (cutCorners.includes('tl')) {
        ctx.lineTo(x, y + cut);
        ctx.lineTo(x + cut, y);
    } else {
        ctx.lineTo(x, y);
    }

    ctx.closePath();

    // Fill
    if (filled && !borderOnly) {
        ctx.fillStyle = `rgba(5, 8, 18, ${alpha})`;
        ctx.fill();

        // Inner hex-grid texture (subtle)
        ctx.save();
        ctx.clip();
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        const hexSize = 12;
        for (let hx = x; hx < x + w + hexSize; hx += hexSize * 1.5) {
            for (let hy = y; hy < y + h + hexSize; hy += hexSize * 1.7) {
                const offsetX = (Math.floor((hy - y) / (hexSize * 1.7)) % 2) * hexSize * 0.75;
                renderHexagon(hx + offsetX, hy, hexSize * 0.5);
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    // Rebuild path for stroke
    ctx.beginPath();
    if (cutCorners.includes('tl')) {
        ctx.moveTo(x + cut, y);
    } else {
        ctx.moveTo(x, y);
    }
    if (cutCorners.includes('tr')) {
        ctx.lineTo(x + w - cut, y);
        ctx.lineTo(x + w, y + cut);
    } else {
        ctx.lineTo(x + w, y);
    }
    if (cutCorners.includes('br')) {
        ctx.lineTo(x + w, y + h - cut);
        ctx.lineTo(x + w - cut, y + h);
    } else {
        ctx.lineTo(x + w, y + h);
    }
    if (cutCorners.includes('bl')) {
        ctx.lineTo(x + cut, y + h);
        ctx.lineTo(x, y + h - cut);
    } else {
        ctx.lineTo(x, y + h);
    }
    if (cutCorners.includes('tl')) {
        ctx.lineTo(x, y + cut);
        ctx.lineTo(x + cut, y);
    } else {
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner glow line (1px inset, dimmer)
    ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const inset = 2;
    if (cutCorners.includes('tl')) {
        ctx.moveTo(x + cut + inset, y + inset);
    } else {
        ctx.moveTo(x + inset, y + inset);
    }
    if (cutCorners.includes('tr')) {
        ctx.lineTo(x + w - cut - inset, y + inset);
        ctx.lineTo(x + w - inset, y + cut + inset);
    } else {
        ctx.lineTo(x + w - inset, y + inset);
    }
    if (cutCorners.includes('br')) {
        ctx.lineTo(x + w - inset, y + h - cut - inset);
        ctx.lineTo(x + w - cut - inset, y + h - inset);
    } else {
        ctx.lineTo(x + w - inset, y + h - inset);
    }
    if (cutCorners.includes('bl')) {
        ctx.lineTo(x + cut + inset, y + h - inset);
        ctx.lineTo(x + inset, y + h - cut - inset);
    } else {
        ctx.lineTo(x + inset, y + h - inset);
    }
    if (cutCorners.includes('tl')) {
        ctx.lineTo(x + inset, y + cut + inset);
        ctx.lineTo(x + cut + inset, y + inset);
    } else {
        ctx.lineTo(x + inset, y + inset);
    }
    ctx.closePath();
    ctx.stroke();

    // Label in top-left
    if (label) {
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = labelColor || color;
        ctx.textAlign = 'left';
        const labelX = x + (cutCorners.includes('tl') ? cut + 4 : 6);
        ctx.fillText(label, labelX, y + 13);
    }

    ctx.restore();
}

// Helper: draw a small hexagon
function renderHexagon(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
}

// Helper: convert hex color to "r, g, b" string
function hexToRgb(hex) {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return '0, 255, 255';
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

// NGE-style segmented progress bar
function renderNGEBar(x, y, w, h, percent, color, opts = {}) {
    const {
        segments = 10,
        glow = false,
        pulse = false,
        showValue = false,
        valueText = '',
        bgColor = '#0a0c14'
    } = opts;

    percent = Math.max(0, Math.min(1, percent));
    const gap = 2;
    const segWidth = (w - gap * (segments - 1)) / segments;
    const filledSegments = Math.ceil(percent * segments);
    const partialFill = (percent * segments) % 1;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    // Segments
    for (let i = 0; i < segments; i++) {
        const segX = x + i * (segWidth + gap);
        const isFilled = i < filledSegments;
        const isPartial = i === filledSegments - 1 && partialFill > 0 && partialFill < 1;

        if (isFilled) {
            // Color gradient across bar
            const segPercent = i / segments;
            let segColor = color;
            if (typeof color === 'string') {
                segColor = color;
            }

            if (pulse && i >= filledSegments - 2) {
                const p = Math.sin(Date.now() / 150) * 0.3 + 0.7;
                ctx.globalAlpha = p;
            }

            if (glow) {
                ctx.shadowColor = segColor;
                ctx.shadowBlur = 4;
            }

            ctx.fillStyle = segColor;
            if (isPartial) {
                ctx.fillRect(segX, y, segWidth * partialFill, h);
            } else {
                ctx.fillRect(segX, y, segWidth, h);
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Segment highlight (top edge shine)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(segX, y, segWidth, 1);
        } else {
            // Empty segment
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(segX, y, segWidth, h);
        }
    }

    // Border
    ctx.strokeStyle = `rgba(${hexToRgb(typeof color === 'string' ? color : '#0ff')}, 0.4)`;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, w, h);

    // Value text
    if (showValue && valueText) {
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(valueText, x + w - 2, y + h - 2);
    }
}

// NGE status indicator dot
function renderNGEStatusDot(x, y, status, size = 4) {
    const colors = {
        nominal: '#0f0',
        caution: '#fc0',
        critical: '#f33',
        offline: '#333'
    };
    const color = colors[status] || colors.nominal;

    let alpha = 1;
    if (status === 'caution') {
        alpha = Math.sin(Date.now() / 400) * 0.3 + 0.7;
    } else if (status === 'critical') {
        alpha = Math.sin(Date.now() / 120) * 0.5 + 0.5;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// NGE-style label with dot separators
function renderNGELabel(x, y, text, color = '#888') {
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
}

// NGE-style value display
function renderNGEValue(x, y, text, color = '#0ff', align = 'left') {
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

// Horizontal scanline overlay with glitch
function renderNGEScanlines(x, y, w, h, alpha = 0.015) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const offset = hudAnimState.scanlineOffset;
    const now = Date.now();

    // Scrolling scanlines
    for (let sy = -4; sy < h + 4; sy += 3) {
        const lineY = y + ((sy + offset) % (h + 4));
        if (lineY < y || lineY >= y + h) continue;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(x, lineY, w, 1);
    }

    // Glitch bands — fast-moving bright bars that appear intermittently
    const glitchSeed = Math.floor(now / 60);
    const glitchCount = ((glitchSeed * 7) % 5 === 0) ? 1 + ((glitchSeed * 3) % 3) : 0;
    for (let g = 0; g < glitchCount; g++) {
        const gy = y + (((glitchSeed * 13 + g * 47) % 97) / 97) * h;
        const gh = 1 + ((glitchSeed + g * 11) % 3);
        const gAlpha = 0.04 + ((glitchSeed + g * 7) % 10) * 0.006;
        ctx.fillStyle = `rgba(255, 255, 255, ${gAlpha})`;
        ctx.fillRect(x, gy, w, gh);
        // Occasional horizontal tear
        if ((glitchSeed + g) % 3 === 0) {
            const tearShift = (((glitchSeed * 3 + g) % 7) - 3) * 2;
            ctx.fillStyle = `rgba(255, 255, 255, ${gAlpha * 0.7})`;
            ctx.fillRect(x + tearShift, gy + gh, w, 1);
        }
    }

    ctx.restore();
}

// Scrolling hex data stream background
function renderNGEDataStream(x, y, w, h, color = '#0ff') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.font = '8px monospace';
    ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.08)`;
    ctx.textAlign = 'left';

    const offset = (Date.now() / 50) % 20;
    const chars = '0123456789ABCDEF';
    for (let dy = -20; dy < h + 20; dy += 10) {
        let line = '';
        for (let dx = 0; dx < w; dx += 7) {
            line += chars[Math.floor(Math.random() * 16 + (dy * 3 + dx + Date.now() / 1000)) % 16];
        }
        ctx.fillText(line, x, y + dy + offset);
    }
    ctx.restore();
}

// Animated chevron pattern (>>> scrolling)
function renderNGEChevrons(x, y, w, color = '#0ff', speed = 1) {
    ctx.save();
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    const offset = (Date.now() / (300 / speed)) % 20;
    ctx.beginPath();
    ctx.rect(x, y - 6, w, 12);
    ctx.clip();
    for (let cx = x - 20 + offset; cx < x + w; cx += 20) {
        ctx.fillText('\u00BB', cx, y + 4); // » character
    }
    ctx.restore();
}

// Blinking status light
function renderNGEBlinkLight(x, y, color = '#0f0', rate = 500) {
    const on = Math.floor(Date.now() / rate) % 2 === 0;
    if (on) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.fillRect(x, y, 4, 4);
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, 4, 4);
    }
}

// Unified indicator renderer with multiple shapes and blink modes
function renderNGEIndicator(x, y, shape, color, mode, opts = {}) {
    const rate = opts.rate || 600;
    const phaseOffset = opts.phaseOffset || 0;
    const now = Date.now() + phaseOffset;

    // Determine on/off state based on mode
    let isOn = true;
    switch (mode) {
        case 'steady':
            isOn = Math.floor(now / rate) % 2 === 0;
            break;
        case 'double': {
            const cycle = now % 820;
            isOn = (cycle < 80) || (cycle >= 140 && cycle < 220);
            break;
        }
        case 'cascade': {
            const ci = opts.cascadeIndex || 0;
            const ct = opts.cascadeTotal || 3;
            const cascadeCycle = (now + ci * 100) % (ct * 100 + 600);
            isOn = cascadeCycle < 200;
            break;
        }
        case 'reactive': {
            const rv = opts.reactiveValue || 0;
            const thresholds = opts.reactiveThresholds || [];
            let rRate = rate;
            let matchedColor = null;
            for (const t of thresholds) {
                if (rv >= t.threshold) { rRate = t.rate; matchedColor = t.color; break; }
            }
            if (matchedColor) color = matchedColor;
            isOn = rRate === 0 ? true : Math.floor(now / rRate) % 2 === 0;
            break;
        }
        case 'random': {
            const seed = (x * 7 + y * 13) | 0;
            const randomPeriod = 200 + (seed % 600);
            isOn = Math.floor(now / randomPeriod) % 2 === 0;
            break;
        }
    }

    // Set style
    const glowIntensity = opts.glowIntensity || 4;
    if (isOn) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = glowIntensity;
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.shadowBlur = 0;
    }

    // Draw shape
    switch (shape) {
        case 'square':
            ctx.fillRect(x, y, 4, 4);
            break;
        case 'diamond':
            ctx.beginPath();
            ctx.moveTo(x + 2.5, y);
            ctx.lineTo(x + 5, y + 2.5);
            ctx.lineTo(x + 2.5, y + 5);
            ctx.lineTo(x, y + 2.5);
            ctx.closePath();
            ctx.fill();
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(x + 2.5, y);
            ctx.lineTo(x + 5, y + 4);
            ctx.lineTo(x, y + 4);
            ctx.closePath();
            ctx.fill();
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(x + 2, y + 2, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'cross':
            ctx.fillRect(x, y + 1, 5, 1);
            ctx.fillRect(x + 2, y, 1, 3);
            break;
    }

    ctx.shadowBlur = 0;
}

// Energy flow animated line between two points
function renderEnergyFlowLine(fromX, fromY, toX, toY, color = '#0ff', active = false) {
    ctx.save();
    const alpha = active ? 0.35 : 0.12;
    ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
    ctx.lineWidth = active ? 1.5 : 0.8;
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -(Date.now() / 40) % 20;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// Key badge renderer (used for weapon hotkeys)
function renderNGEKeyBadge(x, y, text, width = 20, height = 18) {
    // Key background (raised look)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 3);
    ctx.fill();

    // Key top surface
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, width - 2, height - 3, 2);
    ctx.fill();

    // Key letter
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + width / 2, y + height / 2 + 3);
}

// ============================================
// HUD STATE
// ============================================

let hudAnimState = {
    weaponsPanelVisible: false,
    weaponsPanelSlide: 0,
    fleetPanelVisible: false,
    fleetPanelSlide: 0,
    commanderPanelSlide: 0,
    diagPanelVisible: false,
    diagPanelSlide: 0,
    opsLogPanelVisible: false,
    opsLogPanelSlide: 0,
    energyFlowPhase: 0,
    scanlineOffset: 0,
    energyPulseTimer: 0,
    energyPulseActive: false,
    energyPulseY: 0
};

let hudBootState = {
    phase: 'idle',       // 'idle' | 'booting' | 'complete'
    timer: 0,
    duration: 3.5,

    panels: {
        status:    { active: false, startTime: 0.0,  duration: 1.2, progress: 0, phase: 'waiting' },
        mission:   { active: false, startTime: 0.15, duration: 1.0, progress: 0, phase: 'waiting' },
        systems:   { active: false, startTime: 0.3,  duration: 1.0, progress: 0, phase: 'waiting' },
        weapons:   { active: false, startTime: 0.6,  duration: 1.4, progress: 0, phase: 'waiting' },
        fleet:     { active: false, startTime: 0.9,  duration: 1.4, progress: 0, phase: 'waiting' },
        commander: { active: false, startTime: 1.2,  duration: 1.0, progress: 0, phase: 'waiting' },
        diagnostics: { active: false, startTime: 0.45, duration: 1.3, progress: 0, phase: 'waiting' },
        opslog:    { active: false, startTime: 1.1,  duration: 1.0, progress: 0, phase: 'waiting' }
    },

    techSnapshot: {
        hasBombs: false,
        hasMissiles: false,
        missileGroupCount: 0,
        hasHarvesters: false,
        hasBattleDrones: false,
        droneSlots: 0,
        hasCoordinators: false,
        wave: 1,
        quotaTarget: 0,
        maxHealth: 0,
        hasEnergyCells: false,
        techResearched: []
    },

    bootLines: {
        status: [],
        mission: [],
        systems: [],
        weapons: [],
        fleet: [],
        commander: [],
        diagnostics: [],
        opslog: []
    }
};

let missionCommanderState = {
    visible: false,
    dialogue: '',
    typewriterIndex: 0,
    typewriterTimer: 0,
    displayTimer: 0,
    displayDuration: 6,
    slideProgress: 0,
    emotion: 'neutral',
    cooldownTimer: 15,
    minCooldown: 20,
    maxCooldown: 40,
    triggeredThisWave: false
};

let energyTimeSeries = {
    buffer: new Float32Array(180),
    intakeBuffer: new Float32Array(180),
    outputBuffer: new Float32Array(180),
    writeIndex: 0,
    sampleTimer: 0,
    sampleInterval: 1/6,  // ~166ms = 6 samples/sec, 30s history
    frameIntake: 0,
    frameOutput: 0,
    peakValue: 100,
    smoothPeak: 100
};

let diagnosticsState = {
    scrollOffset: 0,
    scrollDirection: 1,
    scrollPauseTimer: 0
};

let opsLogState = {
    events: [],
    maxEvents: 20,
    throttle: {},
    throttleWindow: 500
};

function pushOpsLogEvent(text, color, opts = {}) {
    const now = Date.now();
    const type = opts.type || text;
    if (!opts.skipThrottle && opsLogState.throttle[type] && now - opsLogState.throttle[type] < opsLogState.throttleWindow) {
        return;
    }
    opsLogState.throttle[type] = now;
    opsLogState.events.push({ text, color, age: 0, bold: opts.bold || false, timestamp: now });
    if (opsLogState.events.length > opsLogState.maxEvents) {
        opsLogState.events.shift();
    }
}

function updateOpsLog(dt) {
    for (let i = opsLogState.events.length - 1; i >= 0; i--) {
        opsLogState.events[i].age += dt;
        if (opsLogState.events[i].age > 15) {
            opsLogState.events.splice(i, 1);
        }
    }
}

function trackEnergyDelta(amount, isIntake) {
    if (isIntake) energyTimeSeries.frameIntake += amount;
    else energyTimeSeries.frameOutput += amount;
}

function updateEnergyTimeSeries(dt) {
    if (!ufo) return;
    energyTimeSeries.sampleTimer += dt;
    if (energyTimeSeries.sampleTimer >= energyTimeSeries.sampleInterval) {
        energyTimeSeries.sampleTimer -= energyTimeSeries.sampleInterval;
        const idx = energyTimeSeries.writeIndex;
        energyTimeSeries.buffer[idx] = ufo.energy;
        energyTimeSeries.intakeBuffer[idx] = energyTimeSeries.frameIntake;
        energyTimeSeries.outputBuffer[idx] = energyTimeSeries.frameOutput;
        energyTimeSeries.frameIntake = 0;
        energyTimeSeries.frameOutput = 0;
        energyTimeSeries.writeIndex = (idx + 1) % 180;

        // Auto-scale Y axis
        let peak = ufo.maxEnergy;
        for (let i = 0; i < 180; i++) {
            peak = Math.max(peak, energyTimeSeries.intakeBuffer[i], energyTimeSeries.outputBuffer[i]);
        }
        energyTimeSeries.peakValue = peak;
        energyTimeSeries.smoothPeak += (peak - energyTimeSeries.smoothPeak) * 0.05;
    }
}

const MISSION_COMMANDER_DIALOGUES = {
    quotaBehind: [
        "You're falling behind on quota. The mothership is watching.",
        "At this rate, we'll be reassigned to asteroid mining.",
        "QUOTA DEFICIT DETECTED. Pick up the pace.",
        "Command is not pleased with your collection rate.",
    ],
    quotaOnTrack: [
        "Adequate progress. Don't get complacent.",
        "Bio-matter collection within parameters.",
        "Harvest rate... acceptable. For now.",
    ],
    droneDestroyed: [
        "We lost a drone! Those aren't cheap to fabricate.",
        "Drone down. Requisition a replacement when able.",
        "Another drone destroyed. Try to keep them alive.",
    ],
    coordinatorLowEnergy: [
        "Coordinator energy critical! Get over there!",
        "Your coordinator is dying. CHARGE IT. NOW.",
        "Coordinator power failure imminent. Move!",
    ],
    killStreak: [
        "Impressive tank elimination rate. Continue.",
        "The humans' defenses crumble before us.",
        "Excellent combat performance. Noted in your file.",
    ],
    lowShield: [
        "Shield integrity failing! Evade!",
        "WARNING: Hull breach imminent! Take cover!",
        "You're taking too much damage. FLY BETTER.",
    ],
    waveStart: [
        "New wave. Stay focused.",
        "Sensors detecting increased surface resistance.",
        "Fresh targets deploying. Harvest everything.",
    ],
    energyLow: [
        "Energy reserves critical. Conserve beam.",
        "Power levels dropping. Manage your output.",
        "You're burning through energy too fast.",
    ],
    idle: [
        "Status report: I'm still here. Watching.",
        "Don't forget, I see everything you do.",
        "Efficiency metrics are being recorded.",
        "The mothership expects results, not excuses.",
        "Just checking in. Don't mind me.",
        "I've filed seventeen reports on you today.",
    ]
};

const TUTORIAL_COMMANDER_DIALOGUES = {
    welcome: "Welcome aboard! We need BIOMATTER. Follow instructions. HIT YOUR QUOTA.",
    beamTargets: "Those are biomatter. BEAM THEM UP! Every one counts.",
    tankIncoming: "HOSTILE! DODGE it or you're SCRAP!",
    useBombs: "Nice moves! DROP A BOMB on that pest!",
    complete: "Not bad! Hit quota EVERY wave or you're FIRED. GO!"
};

// ============================================
// HUD LAYOUT ENGINE
// ============================================

function getHUDLayout() {
    const margin = 10;
    const leftW = Math.min(210, canvas.width * 0.18);
    const rightW = Math.min(195, canvas.width * 0.16);
    const centerW = 280;
    const centerX = (canvas.width - centerW) / 2;

    return {
        statusZone: { x: margin, y: margin, w: leftW, h: 120 },
        missionZone: { x: centerX, y: 4, w: centerW, h: 110 },
        systemsZone: { x: canvas.width - rightW - margin, y: margin, w: rightW, h: 90 },
        weaponsZone: { x: margin, y: 140, w: leftW, h: 200 },
        fleetZone: { x: canvas.width - rightW - margin, y: 108, w: rightW, h: 300 },
        commanderZone: { x: margin, y: canvas.height - 110, w: Math.min(260, canvas.width * 0.22), h: 100 },
        diagnosticsZone: { x: margin, y: canvas.height - 330, w: leftW, h: 100 },
        opsLogZone: { x: margin, y: canvas.height - 220, w: Math.min(240, canvas.width * 0.20), h: 100 }
    };
}

// Energy pulse sweep animation across HUD panels
function renderHUDEnergyPulse(layout) {
    if (!hudAnimState.energyPulseActive) return;

    const pulseY = hudAnimState.energyPulseY;
    const pulseHeight = 3;

    ctx.save();

    // Helper: draw pulse line across a zone if the sweep is currently passing through it
    function drawPulseOnZone(zone, color) {
        if (!zone) return;
        const zy = zone.y;
        const zh = zone.h || 120; // fallback height
        const localY = pulseY - zy;
        if (localY < -10 || localY > zh + 10) return;

        // Clamp drawing to zone bounds
        const drawY = Math.max(zy, Math.min(zy + zh, pulseY));

        ctx.beginPath();
        ctx.moveTo(zone.x + 2, drawY);
        ctx.lineTo(zone.x + zone.w - 2, drawY);

        // Bright core line
        ctx.strokeStyle = 'rgba(180, 255, 255, 0.7)';
        ctx.lineWidth = pulseHeight;
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Inner white-hot line
        ctx.beginPath();
        ctx.moveTo(zone.x + 4, drawY);
        ctx.lineTo(zone.x + zone.w - 4, drawY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 6;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Brief brightness on panel border as pulse passes
        const proximity = Math.max(0, 1 - Math.abs(localY - zh / 2) / (zh / 2));
        if (proximity > 0.5) {
            const borderAlpha = (proximity - 0.5) * 0.4;
            ctx.strokeStyle = `rgba(180, 255, 255, ${borderAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(zone.x, zone.y, zone.w, zh);
        }
    }

    // Apply pulse to Status zone (top-left, 120px tall)
    drawPulseOnZone({ x: layout.statusZone.x, y: layout.statusZone.y, w: layout.statusZone.w, h: 120 }, '#0ff');

    // Apply pulse to Systems zone (top-right, 88px tall)
    drawPulseOnZone({ x: layout.systemsZone.x, y: layout.systemsZone.y, w: layout.systemsZone.w, h: 88 }, '#f80');

    // Apply pulse to Weapons zone (left side)
    if (hudAnimState.weaponsPanelVisible) {
        drawPulseOnZone({ x: layout.weaponsZone.x, y: layout.weaponsZone.y, w: layout.weaponsZone.w, h: layout.weaponsZone.h }, '#f44');
    }

    // Apply pulse to Fleet zone (right side)
    if (hudAnimState.fleetPanelVisible) {
        drawPulseOnZone({ x: layout.fleetZone.x, y: layout.fleetZone.y, w: layout.fleetZone.w, h: layout.fleetZone.h }, '#48f');
    }

    ctx.restore();
}

function renderHUDFrame() {
    const layout = getHUDLayout();
    const booting = hudBootState.phase === 'booting';

    // Helper: true if a panel's boot is done and real content should render
    const panelReady = (key) => !booting || !hudBootState.panels[key].active || hudBootState.panels[key].phase === 'online';

    // Status zone: only render real content after boot completes
    if (panelReady('status')) {
        renderStatusZone(layout.statusZone);
    }
    if (booting && hudBootState.panels.status.phase !== 'waiting') {
        renderPanelBootOverlay(layout.statusZone, 120, '#0ff', 'SYS.STATUS', hudBootState.panels.status, hudBootState.bootLines.status);
    }

    // Mission zone: deferred on wave 1 until beam tutorial, hidden during boot
    const missionVisible = wave !== 1 || !tutorialState || tutorialState.beamHintShown;
    if (missionVisible && panelReady('mission')) {
        renderMissionZone(layout.missionZone);
    }
    if (missionVisible && booting && hudBootState.panels.mission.phase !== 'waiting') {
        renderPanelBootOverlay(layout.missionZone, 110, '#0a0', 'MISSION.CTL', hudBootState.panels.mission, hudBootState.bootLines.mission);
    }

    // Tech readout chips in top-center gap
    if (!booting) {
        renderTechChips(layout);
    }

    // Systems zone
    if (panelReady('systems')) {
        renderSystemsZone(layout.systemsZone);
    }
    if (booting && hudBootState.panels.systems.phase !== 'waiting') {
        renderPanelBootOverlay(layout.systemsZone, 88, '#f80', 'SYS.INTG', hudBootState.panels.systems, hudBootState.bootLines.systems);
    }

    // Energy graph (below systems zone)
    if (panelReady('systems') && !booting) {
        renderEnergyGraph(layout.systemsZone);
    }

    // Weapons zone: slide in when weapons are unlocked
    const hasWeapons = playerInventory.maxBombs > 0 || missileUnlocked;
    if (hasWeapons) {
        hudAnimState.weaponsPanelVisible = true;
    }
    let weaponsPanelH = layout.weaponsZone.h;
    if (hudAnimState.weaponsPanelVisible) {
        if (hudAnimState.weaponsPanelSlide < 1) {
            hudAnimState.weaponsPanelSlide = Math.min(1, hudAnimState.weaponsPanelSlide + 0.04);
        }
        ctx.save();
        const slideOffset = (1 - easeOutCubic(hudAnimState.weaponsPanelSlide)) * -layout.weaponsZone.w;
        ctx.translate(slideOffset, 0);
        if (panelReady('weapons')) {
            weaponsPanelH = renderWeaponsZone(layout.weaponsZone) || layout.weaponsZone.h;
        }
        if (booting && hudBootState.panels.weapons.active && hudBootState.panels.weapons.phase !== 'waiting') {
            renderPanelBootOverlay(layout.weaponsZone, layout.weaponsZone.h, '#f44', 'ORD.SYS', hudBootState.panels.weapons, hudBootState.bootLines.weapons);
        }
        ctx.restore();
    }

    // Research progress bar: render below weapons zone (suppress during boot)
    if (techTree.activeResearch && !booting) {
        const node = getTechNode(techTree.activeResearch.nodeId);
        if (node) {
            const rX = layout.weaponsZone.x;
            const rW = layout.weaponsZone.w;
            const rY = layout.weaponsZone.y + weaponsPanelH + 6;
            const rH = 28;
            const progress = 1 - (techTree.activeResearch.timeRemaining / techTree.activeResearch.totalTime);
            const timeLeft = Math.ceil(techTree.activeResearch.timeRemaining);

            if (hudAnimState.weaponsPanelVisible) {
                ctx.save();
                const slideOffset = (1 - easeOutCubic(hudAnimState.weaponsPanelSlide)) * -layout.weaponsZone.w;
                ctx.translate(slideOffset, 0);
            }

            renderNGEPanel(rX, rY, rW, rH, { color: '#0a4', cutCorners: [], alpha: 0.6 });
            renderNGEBar(rX + 4, rY + 4, rW - 8, rH - 8, progress, '#0a4', { segments: 15 });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`RSRCH: ${node.name} ${timeLeft}s`, rX + rW / 2, rY + rH / 2 + 4);

            renderNGEBlinkLight(rX + rW - 10, rY + 6, '#0f0', 300);

            if (hudAnimState.weaponsPanelVisible) {
                ctx.restore();
            }
        }
    }

    // Fleet zone: slide in when drones/coordinators unlocked
    const hasFleet = harvesterUnlocked || battleDroneUnlocked || activeCoordinators.length > 0;
    if (hasFleet) {
        hudAnimState.fleetPanelVisible = true;
    }
    if (hudAnimState.fleetPanelVisible) {
        if (hudAnimState.fleetPanelSlide < 1) {
            hudAnimState.fleetPanelSlide = Math.min(1, hudAnimState.fleetPanelSlide + 0.04);
        }
        ctx.save();
        const slideOffset = (1 - easeOutCubic(hudAnimState.fleetPanelSlide)) * layout.fleetZone.w;
        ctx.translate(slideOffset, 0);
        if (panelReady('fleet')) {
            renderFleetZone(layout.fleetZone);
        }
        if (booting && hudBootState.panels.fleet.active && hudBootState.panels.fleet.phase !== 'waiting') {
            renderPanelBootOverlay(layout.fleetZone, layout.fleetZone.h, '#48f', 'FLEET.CMD', hudBootState.panels.fleet, hudBootState.bootLines.fleet);
        }
        ctx.restore();
    }

    // Diagnostics zone: visible after Beam Conduit (pg1) research
    if (techFlags.beamConduit) {
        hudAnimState.diagPanelVisible = true;
    }
    if (hudAnimState.diagPanelVisible && canvas.height >= 500) {
        if (hudAnimState.diagPanelSlide < 1) {
            hudAnimState.diagPanelSlide = Math.min(1, hudAnimState.diagPanelSlide + 0.04);
        }
        ctx.save();
        const diagSlideOffset = (1 - easeOutCubic(hudAnimState.diagPanelSlide)) * -layout.diagnosticsZone.w;
        ctx.translate(diagSlideOffset, 0);
        if (panelReady('diagnostics')) {
            renderDiagnosticsZone(layout.diagnosticsZone);
        }
        if (booting && hudBootState.panels.diagnostics && hudBootState.panels.diagnostics.active && hudBootState.panels.diagnostics.phase !== 'waiting') {
            renderPanelBootOverlay(layout.diagnosticsZone, layout.diagnosticsZone.h, '#0af', 'DIAG.SYS', hudBootState.panels.diagnostics, hudBootState.bootLines.diagnostics);
        }
        ctx.restore();
    }

    // OPS.LOG zone: visible after wave 1
    if (wave >= 2) {
        hudAnimState.opsLogPanelVisible = true;
    }
    if (hudAnimState.opsLogPanelVisible && canvas.height >= 500) {
        if (hudAnimState.opsLogPanelSlide < 1) {
            hudAnimState.opsLogPanelSlide = Math.min(1, hudAnimState.opsLogPanelSlide + 0.04);
        }
        ctx.save();
        const opsSlideOffset = (1 - easeOutCubic(hudAnimState.opsLogPanelSlide)) * -layout.opsLogZone.w;
        ctx.translate(opsSlideOffset, 0);
        if (panelReady('opslog')) {
            renderOpsLogZone(layout.opsLogZone);
        }
        if (booting && hudBootState.panels.opslog && hudBootState.panels.opslog.active && hudBootState.panels.opslog.phase !== 'waiting') {
            renderPanelBootOverlay(layout.opsLogZone, layout.opsLogZone.h, '#8af', 'OPS.LOG', hudBootState.panels.opslog, hudBootState.bootLines.opslog);
        }
        ctx.restore();
    }

    // Commander zone: slide in when active
    const commanderBooting = booting && hudBootState.panels.commander.active && hudBootState.panels.commander.phase !== 'waiting';
    if (missionCommanderState.visible && (wave >= 2 || tutorialState)) {
        if (hudAnimState.commanderPanelSlide < 1) {
            hudAnimState.commanderPanelSlide = Math.min(1, hudAnimState.commanderPanelSlide + 0.05);
        }
        ctx.save();
        const slideOffset = (1 - easeOutCubic(hudAnimState.commanderPanelSlide)) * -layout.commanderZone.w;
        ctx.translate(slideOffset, 0);
        if (panelReady('commander')) {
            renderCommanderZone(layout.commanderZone);
        }
        if (commanderBooting) {
            renderPanelBootOverlay(layout.commanderZone, layout.commanderZone.h, '#0f0', 'COMMS.SYS', hudBootState.panels.commander, hudBootState.bootLines.commander);
        }
        ctx.restore();
    } else if (commanderBooting) {
        // Commander not visible yet but boot overlay should still render
        renderPanelBootOverlay(layout.commanderZone, layout.commanderZone.h, '#0f0', 'COMMS.SYS', hudBootState.panels.commander, hudBootState.bootLines.commander);
    } else {
        if (hudAnimState.commanderPanelSlide > 0) {
            hudAnimState.commanderPanelSlide = Math.max(0, hudAnimState.commanderPanelSlide - 0.05);
            if (hudAnimState.commanderPanelSlide > 0.01) {
                ctx.save();
                const slideOffset = (1 - easeOutCubic(hudAnimState.commanderPanelSlide)) * -layout.commanderZone.w;
                ctx.translate(slideOffset, 0);
                renderCommanderZone(layout.commanderZone);
                ctx.restore();
            }
        }
    }

    // Energy flow lines (when beam conduit researched) - suppress during boot
    if (techFlags.beamConduit && ufo && !booting) {
        renderEnergyFlows(layout);
    }

    // Energy pulse sweep effect across HUD panels - suppress during boot
    if (!booting) {
        renderHUDEnergyPulse(layout);
    }

    // Coordinator distress arrows (kept separate - they're world-space indicators)
    renderCoordDistressArrows();
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================
// ZONE RENDERERS
// ============================================

function renderStatusZone(zone) {
    const { x, y, w } = zone;
    const pad = 8;

    // Panel
    renderNGEPanel(x, y, w, 120, { color: '#0ff', cutCorners: ['tl'], label: 'SYS.STATUS' });

    // Subtle scanlines
    renderNGEScanlines(x, y, w, 120, 0.012);

    // Score
    const scoreText = score.toLocaleString();
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(scoreText, x + pad + 4, y + 36);

    // High score
    ctx.fillStyle = '#445';
    ctx.font = '11px monospace';
    ctx.fillText(`HI ${highScore.toLocaleString()}`, x + pad + 4, y + 50);

    // Wave + Timer line
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`WAVE ${wave}`, x + pad + 4, y + 70);

    // Timer
    const displayTime = Math.max(0, waveTimer);
    const minutes = Math.floor(displayTime / 60);
    const seconds = Math.floor(displayTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (waveTimer <= 10 && gameState === 'PLAYING') {
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgb(255, ${Math.floor(pulse * 80)}, ${Math.floor(pulse * 80)})`;
        ctx.font = 'bold 18px monospace';
    } else {
        ctx.fillStyle = '#8899aa';
        ctx.font = '16px monospace';
    }
    ctx.fillText(timeStr, x + pad + 100, y + 70);

    // Combo
    if (combo > 0) {
        const multiplier = CONFIG.COMBO_MULTIPLIERS[Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1)];
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`${combo}x`, x + pad + 4, y + 88);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#aa8800';
        ctx.font = '11px monospace';
        ctx.fillText(`(${multiplier}x)`, x + pad + 40, y + 88);
    }

    // Bio-matter
    if (bioMatter > 0 || (techTree.activeResearch || techTree.researched.size > 0)) {
        renderNGELabel(x + pad + 4, y + 104, 'B.MTR:', '#0a0');
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(bioMatter.toString(), x + pad + 58, y + 104);
    }

    // Blinking status light
    renderNGEBlinkLight(x + w - 12, y + 8, '#0ff', 800);

    // Panel indicators
    renderNGEIndicator(x + 4, y + 120 - 8, 'diamond', '#0ff', 'steady', { rate: 1200 });
    renderNGEIndicator(x + w - 8, y + 120 - 8, 'circle', '#0ff', 'reactive', {
        reactiveValue: waveTimer,
        reactiveThresholds: [
            { threshold: 30, rate: 1500 },
            { threshold: 10, rate: 600 },
            { threshold: 0, rate: 200 }
        ]
    });

    // Active powerups (below status panel)
    renderPowerupsInStatus(x, y + 120 + 4);
}

function renderPowerupsInStatus(startX, startY) {
    const barWidth = 170;
    const barHeight = 14;
    const barSpacing = 3;
    let y = startY;

    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';

    for (const [key, state] of Object.entries(activePowerups)) {
        if (!state.active) continue;

        const cfg = CONFIG.POWERUPS[key];
        let progress = 0;
        let label = '';

        if (state.timer > 0) {
            progress = state.timer / state.maxTimer;
            label = `${cfg.name} ${state.timer.toFixed(1)}s`;
        } else if (state.charges > 0) {
            progress = state.charges / state.maxCharges;
            label = `${cfg.name} x${state.charges}`;
        }

        if (progress <= 0) continue;

        renderNGEBar(startX + 8, y, barWidth, barHeight, progress, cfg.color, { segments: 8 });
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(label, startX + 12, y + barHeight - 3);

        y += barHeight + barSpacing;
    }
}

function renderMissionZone(zone) {
    const { x, y, w } = zone;

    // Quota bar (enlarged, better contrast)
    if (quotaTarget > 0) {
        const barH = 26;
        const barY = y;

        renderNGEPanel(x, barY, w, barH, { color: '#0a0', cutCorners: [], alpha: 0.7 });

        const progress = Math.min(1, quotaProgress / quotaTarget);
        const waveElapsed = CONFIG.WAVE_DURATION - waveTimer;
        const expectedProgress = waveElapsed / CONFIG.WAVE_DURATION;

        let barColor;
        if (quotaProgress >= quotaTarget) {
            barColor = '#0f0';
        } else if (progress >= expectedProgress * 0.7) {
            barColor = '#0a0';
        } else if (progress >= expectedProgress * 0.4) {
            barColor = '#ca0';
        } else {
            barColor = '#f44';
        }

        // Progress fill with chevron pattern
        const fillW = (w - 8) * progress;
        if (fillW > 0) {
            ctx.fillStyle = barColor;
            ctx.fillRect(x + 4, barY + 4, fillW, barH - 8);

            // Animated chevron overlay on fill
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 4, barY + 4, fillW, barH - 8);
            ctx.clip();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#fff';
            const chevOffset = (Date.now() / 100) % 16;
            for (let cx = x - 16 + chevOffset; cx < x + fillW + 16; cx += 16) {
                ctx.font = 'bold 14px monospace';
                ctx.fillText('\u00BB', cx, barY + barH - 7);
            }
            ctx.restore();
        }

        // Quota text (high contrast)
        const quotaText = quotaProgress >= quotaTarget
            ? `QUOTA MET ${quotaProgress}/${quotaTarget}`
            : `QUOTA ${quotaProgress}/${quotaTarget}`;

        ctx.fillStyle = '#000';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(quotaText, x + w / 2 + 1, barY + barH / 2 + 5);
        ctx.fillStyle = '#fff';
        ctx.fillText(quotaText, x + w / 2, barY + barH / 2 + 4);

        // Warning pulsing border when behind
        if (progress < expectedProgress * 0.4 && quotaProgress < quotaTarget) {
            const pulse = Math.sin(Date.now() / 150) * 0.4 + 0.6;
            ctx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, barY + 1, w - 2, barH - 2);
        }

        // Celebration when met
        if (quotaProgress >= quotaTarget && quotaProgress > 0) {
            const pulse = Math.sin(Date.now() / 80) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(0, 255, 0, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, barY - 1, w, barH + 2);
        }
    }

    // Harvest counter
    const harvestY = y + 30;
    renderHarvestCounterNGE(x, harvestY, w);

    // Panel indicators
    renderNGEIndicator(x + 4, y + 4, 'triangle', '#0a0', 'steady', { rate: 700 });
    const quotaPct = quotaTarget > 0 ? quotaProgress / quotaTarget : 0;
    const missionEColor = quotaPct > 0.8 ? '#0f0' : (quotaPct < 0.5 ? '#ff0' : '#0a0');
    const missionERate = quotaPct > 0.8 ? 9999 : (quotaPct < 0.5 ? 400 : 1000);
    renderNGEIndicator(x + w - 8, y + 4, 'square', missionEColor, 'steady', { rate: missionERate });
    renderNGEIndicator(x + 4, y + 110 - 6, 'circle', '#0a0', 'steady', { rate: 900 });
    renderNGEIndicator(x + 12, y + 110 - 6, 'circle', '#0a0', 'steady', { rate: 900, phaseOffset: 450 });
    renderNGEIndicator(x + w - 8, y + 110 - 6, 'diamond', '#0a0', 'steady', { rate: 1100 });

}

function renderHarvestCounterNGE(x, y, w) {
    const baseIconSize = 22;
    const spacing = w / (TARGET_TYPES.length + 0.5);
    const panelH = 48;

    renderNGEPanel(x, y, w, panelH, { color: '#0aa', cutCorners: [], alpha: 0.5 });

    const startX = x + spacing / 2;
    const baseY = y + 18;

    ctx.textAlign = 'center';

    for (let i = 0; i < TARGET_TYPES.length; i++) {
        const type = TARGET_TYPES[i];
        const ix = startX + i * spacing;
        const count = harvestCount[type];

        const bounce = harvestBounce[type];
        const bounceScale = 1 + bounce * 0.5;
        const bounceY = -bounce * 8;
        const iconSize = baseIconSize * bounceScale;
        const iy = baseY + bounceY;

        if (harvestBounce[type] > 0) {
            harvestBounce[type] = Math.max(0, harvestBounce[type] - 0.05);
        }

        const img = images[type];
        if (img && img.complete) {
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight;
            if (aspectRatio > 1) {
                drawWidth = iconSize;
                drawHeight = iconSize / aspectRatio;
            } else {
                drawHeight = iconSize;
                drawWidth = iconSize * aspectRatio;
            }
            ctx.drawImage(img, ix - drawWidth / 2, iy - drawHeight / 2, drawWidth, drawHeight);
        } else {
            const colors = { human: '#ffccaa', cow: '#fff', sheep: '#eee', cat: '#ff9944', dog: '#aa7744', tank: '#556b2f' };
            ctx.fillStyle = colors[type];
            if (type === 'tank') {
                ctx.fillRect(ix - 8, iy - 4, 16, 8);
            } else {
                ctx.beginPath();
                ctx.arc(ix, iy, iconSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (bounce > 0.3) {
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 8;
        }
        ctx.fillStyle = count > 0 ? '#0f0' : '#334';
        ctx.font = bounce > 0.3 ? 'bold 15px monospace' : 'bold 13px monospace';
        ctx.fillText(count.toString(), ix, baseY + baseIconSize / 2 + 10);
        ctx.shadowBlur = 0;
    }
}

function renderSystemsZone(zone) {
    const { x, y, w } = zone;
    const pad = 6;

    renderNGEPanel(x, y, w, 88, { color: '#f80', cutCorners: ['tr'], label: 'SYS.INTG' });

    // Shield bar (segmented)
    const shieldY = y + 22;
    const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;

    let shieldColor;
    if (healthPercent > 0.5) shieldColor = '#0f6';
    else if (healthPercent > 0.25) shieldColor = '#fc0';
    else shieldColor = '#f33';

    renderNGELabel(x + pad, shieldY, 'SHLD', '#f80');
    const shieldVal = ufo ? Math.ceil(ufo.health) : Math.ceil(finalHealth);
    ctx.fillStyle = shieldColor;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${shieldVal}/${CONFIG.UFO_START_HEALTH}`, x + w - pad, shieldY);
    ctx.textAlign = 'left';

    renderNGEBar(x + pad, shieldY + 6, w - pad * 2, 16, healthPercent, shieldColor, {
        segments: 10,
        pulse: healthPercent < 0.25,
        glow: true
    });

    // Status dot
    const shieldStatus = healthPercent > 0.5 ? 'nominal' : healthPercent > 0.25 ? 'caution' : 'critical';
    renderNGEStatusDot(x + w - pad - 2, shieldY + 14, shieldStatus);

    // Energy Cubes (revive cells)
    const cells = playerInventory.energyCells;
    const cellY = shieldY + 28;

    if (cells > 0) {
        renderNGELabel(x + pad, cellY + 4, 'REVIVE', '#f55');
        const cellSize = 14;
        const cellSpacing = 4;
        const cellStartX = x + pad + 52;

        for (let i = 0; i < cells; i++) {
            const cx = cellStartX + i * (cellSize + cellSpacing);
            const cy = cellY - 2;
            const pulse = Math.sin(Date.now() / 200 + i * 0.8) * 0.3 + 0.7;

            // Glow
            ctx.fillStyle = `rgba(255, 85, 85, ${pulse * 0.25})`;
            ctx.fillRect(cx - 2, cy - 2, cellSize + 4, cellSize + 4);

            // Cube body
            ctx.fillStyle = `rgba(255, 85, 85, ${pulse})`;
            ctx.fillRect(cx, cy, cellSize, cellSize);

            // Inner energy swirl
            ctx.save();
            ctx.beginPath();
            ctx.rect(cx, cy, cellSize, cellSize);
            ctx.clip();
            const angle = Date.now() / 300 + i;
            ctx.fillStyle = `rgba(255, 200, 200, ${pulse * 0.5})`;
            ctx.beginPath();
            ctx.arc(cx + cellSize/2 + Math.cos(angle) * 2, cy + cellSize/2 + Math.sin(angle) * 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Border
            ctx.strokeStyle = `rgba(255, 120, 120, ${pulse * 0.8})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, cellSize, cellSize);
        }
    }

    // Speed indicator (compact)
    if (playerInventory.speedBonus > 0) {
        const speedY = cellY + 22;
        const bonusPercent = Math.round(playerInventory.speedBonus * 100);
        renderNGELabel(x + pad, speedY, `SPD +${bonusPercent}%`, '#ff0');
        renderNGEStatusDot(x + w - pad - 2, speedY - 3, 'nominal');
    }

    // Energy bonus indicator (compact)
    if (playerInventory.maxEnergyBonus > 0) {
        const enY = cellY + (playerInventory.speedBonus > 0 ? 36 : 22);
        renderNGELabel(x + pad, enY, `NRG +${playerInventory.maxEnergyBonus}`, '#7ff');
        renderNGEStatusDot(x + w - pad - 2, enY - 3, 'nominal');
    }

    // Panel indicators
    renderNGEIndicator(x + 4, y + 4, 'square', '#f80', 'steady', { rate: 600 });
    const shldPct = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;
    const sysJColor = shldPct > 0.5 ? '#f80' : (shldPct > 0.25 ? '#fc0' : '#f44');
    const sysJGlow = shldPct < 0.25 ? 8 : 4;
    renderNGEIndicator(x + 4, y + 88 - 8, 'cross', sysJColor, 'reactive', {
        reactiveValue: shldPct, reactiveThresholds: [
            { threshold: 0.5, rate: 1000 },
            { threshold: 0.25, rate: 500 },
            { threshold: 0, rate: 150 }
        ], glowIntensity: sysJGlow
    });
    renderNGEIndicator(x + w - 8, y + 88 - 8, 'diamond', '#f80', 'steady', { rate: 800 });
}

function renderEnergyGraph(systemsZone) {
    if (!techFlags.beamConduit) return;

    const { x, y, w } = systemsZone;

    // Calculate Y position below systems zone content
    let graphY = y + 88 + 8;
    if (playerInventory.speedBonus > 0) graphY += 22;
    if (playerInventory.maxEnergyBonus > 0) graphY += 14;

    const graphW = w;
    const graphH = 72;

    // Panel
    renderNGEPanel(x, graphY, graphW, graphH, { color: '#f80', cutCorners: ['tr'], alpha: 0.5 });

    // Header
    ctx.fillStyle = '#f80';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NRG.FLOW', x + 6, graphY + 10);

    // Legend
    ctx.font = '7px monospace';
    ctx.fillStyle = '#f44';
    ctx.textAlign = 'right';
    ctx.fillText('OUT', x + graphW - 28, graphY + 10);
    ctx.fillStyle = '#0f0';
    ctx.fillText('IN', x + graphW - 8, graphY + 10);

    // Blink light
    renderNGEBlinkLight(x + graphW - 42, graphY + 4, '#f80', 600);

    // Graph area
    const gx = x + 28;
    const gy = graphY + 14;
    const gw = graphW - 28 - 6;
    const gh = 48;

    // Grid lines (horizontal)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 2; i++) {
        const ly = gy + gh - (i / 2) * gh;
        ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx + gw, ly); ctx.stroke();
    }

    // Grid lines (vertical, every 5s = 30 samples)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 1; i < 6; i++) {
        const lx = gx + (i / 6) * gw;
        ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx, gy + gh); ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '7px monospace';
    ctx.textAlign = 'right';
    const yMax = Math.max(10, energyTimeSeries.smoothPeak * 1.2);
    ctx.fillText(Math.round(yMax).toString(), gx - 2, gy + 4);
    ctx.fillText(Math.round(yMax / 2).toString(), gx - 2, gy + gh / 2 + 2);
    ctx.fillText('0', gx - 2, gy + gh);
    ctx.textAlign = 'left';

    // X-axis labels
    ctx.fillStyle = '#555';
    ctx.fillText('-30s', gx, gy + gh + 8);
    ctx.textAlign = 'right';
    ctx.fillText('now', gx + gw, gy + gh + 8);
    ctx.textAlign = 'left';

    // Draw lines from ring buffer
    const idx = energyTimeSeries.writeIndex;
    const mapY = (val) => gy + gh - (Math.min(val, yMax) / yMax) * gh;

    // OUTPUT line (red) with fill
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 68, 68, 0.8)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.outputBuffer[bufIdx]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Output fill
    const outGrad = ctx.createLinearGradient(0, gy, 0, gy + gh);
    outGrad.addColorStop(0, 'rgba(255, 68, 68, 0.15)');
    outGrad.addColorStop(1, 'rgba(255, 68, 68, 0)');
    ctx.lineTo(gx + gw, gy + gh);
    ctx.lineTo(gx, gy + gh);
    ctx.closePath();
    ctx.fillStyle = outGrad;
    ctx.fill();

    // INTAKE line (green) with fill
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 180; i++) {
        const bufIdx = (idx + i) % 180;
        const px = gx + (i / 179) * gw;
        const py = mapY(energyTimeSeries.intakeBuffer[bufIdx]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Intake fill
    const inGrad = ctx.createLinearGradient(0, gy, 0, gy + gh);
    inGrad.addColorStop(0, 'rgba(0, 255, 0, 0.12)');
    inGrad.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.lineTo(gx + gw, gy + gh);
    ctx.lineTo(gx, gy + gh);
    ctx.closePath();
    ctx.fillStyle = inGrad;
    ctx.fill();
}

function renderWeaponsZone(zone) {
    const { x, y, w } = zone;
    const pad = 8;
    const gridStartX = x + pad + 70;
    const availableGridW = (x + w - pad) - gridStartX;

    // Bomb dimensions
    const bombSize = 16;
    const bombSpacing = 6;

    // Missile dimensions for grouped layout (up to 3-column grid)
    const missileW = 5;
    const missileH = 12;
    const missileSpacing = 2;
    const groupRowH = missileH + 5;
    const groupLabelW = 9;
    const missileColGap = 6;
    const missileNumCols = missileGroupCount > 6 ? 3 : (missileGroupCount > 3 ? 2 : 1);
    const missileRowsPerCol = Math.ceil(missileGroupCount / missileNumCols);

    // Fixed 3-column grid for bombs
    const bombCols = 3;

    // Calculate panel height dynamically from actual content
    let panelH = 22; // header
    if (playerInventory.maxBombs > 0) {
        const bombRows = Math.ceil(playerInventory.maxBombs / bombCols);
        panelH += 4 + bombRows * (bombSize + bombSpacing) + 18;
    }
    if (missileUnlocked && missileGroupCount > 0) {
        panelH += 4 + missileRowsPerCol * groupRowH + 8;
    }
    panelH += 8; // bottom pad

    renderNGEPanel(x, y, w, panelH, { color: '#f44', cutCorners: ['bl'], label: 'ORD.SYS' });

    // Panel indicators
    renderNGEIndicator(x + 4, y + 4, 'triangle', '#f44', 'steady', { rate: 500 });
    const anyRecharging = (playerInventory.bombRechargeTimers && playerInventory.bombRechargeTimers.length > 0) ||
        (missileGroups && missileGroups.some(g => !g.ready));
    renderNGEIndicator(x + w - 8, y + 4, 'square', '#f44', anyRecharging ? 'double' : 'steady', { rate: 800 });
    renderNGEIndicator(x + 14, y + panelH - 8, 'cross', '#f44', 'random', { seedId: 'wep_n' });
    renderNGEIndicator(x + w - 8, y + panelH - 8, 'circle', '#f44', 'steady', { rate: 400 });

    let curY = y + 22;

    // Bombs section
    if (playerInventory.maxBombs > 0) {
        const bombCount = playerInventory.bombs;
        const maxBombs = playerInventory.maxBombs;
        const rechargeTimers = playerInventory.bombRechargeTimers || [];

        renderNGELabel(x + pad, curY, 'BOMBS', '#f80');
        renderNGEKeyBadge(x + pad + 44, curY - 10, 'Z');
        curY += 4;

        for (let i = 0; i < maxBombs; i++) {
            const col = i % bombCols;
            const row = Math.floor(i / bombCols);
            const bx = gridStartX + col * (bombSize + bombSpacing) + bombSize / 2;
            const by = curY + row * (bombSize + bombSpacing) + bombSize / 2;
            const filled = i < bombCount;

            // Bomb body
            ctx.fillStyle = filled ? '#444' : '#1a1a1a';
            ctx.beginPath();
            ctx.arc(bx, by, bombSize / 2, 0, Math.PI * 2);
            ctx.fill();

            if (filled) {
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.arc(bx - 2, by - 2, bombSize / 4, 0, Math.PI * 2);
                ctx.fill();

                // Fuse spark
                const sparkIntensity = Math.sin(Date.now() / 100 + i) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, ${150 + sparkIntensity * 100}, 0, ${0.7 + sparkIntensity * 0.3})`;
                ctx.beginPath();
                ctx.arc(bx, by - bombSize / 2 - 2, 2 + sparkIntensity, 0, Math.PI * 2);
                ctx.fill();
            }

            // Recharge arc
            const missingIndex = i - bombCount;
            if (missingIndex >= 0 && missingIndex < rechargeTimers.length) {
                const progress = 1 - (rechargeTimers[missingIndex] / CONFIG.BOMB_RECHARGE_TIME);
                ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(bx, by, bombSize / 2 + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
                ctx.stroke();
            }
        }

        const bombRows = Math.ceil(maxBombs / bombCols);
        curY += bombRows * (bombSize + bombSpacing) + 18;
    }

    // Missiles section (grouped layout)
    if (missileUnlocked && missileGroupCount > 0) {
        renderNGELabel(x + pad, curY, 'MISSILES', '#f40');
        renderNGEKeyBadge(x + pad + 68, curY - 10, 'X');

        // SALVO RDY indicator
        const allGroupsReady = missileGroups.every(g => g.ready);
        if (allGroupsReady) {
            const pulse = Math.sin(Date.now() / 200) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 68, 0, ${pulse})`;
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('SALVO RDY', x + w - pad, curY);
            ctx.textAlign = 'left';
        }

        curY += 4;

        // Up to 3-column grid layout for missile groups
        const mColW = groupLabelW + CONFIG.MISSILE_GROUP_SIZE * (missileW + missileSpacing);
        const mGridStartX = gridStartX;

        for (let gi = 0; gi < missileGroupCount; gi++) {
            const group = missileGroups[gi];
            const col = Math.floor(gi / missileRowsPerCol);  // column 0, 1, or 2
            const row = gi % missileRowsPerCol;               // row within column
            const colX = mGridStartX + col * (mColW + missileColGap);
            const rowY = curY + row * groupRowH;
            const groupLabel = String.fromCharCode(65 + gi);
            const rechargeProgress = group.ready ? 1.0 :
                1.0 - (group.rechargeTimer / CONFIG.MISSILE_GROUP_RECHARGE_TIME);

            // Group label
            const labelAlpha = group.ready ? (Math.sin(Date.now() / 300 + gi) * 0.3 + 0.7) : 0.4;
            ctx.fillStyle = group.ready ? `rgba(255, 68, 0, ${labelAlpha})` : '#555';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(groupLabel, colX, rowY + missileH / 2 + 3);

            // Draw 4 missile silhouettes per group
            const missilesStartX = colX + groupLabelW;
            for (let mi = 0; mi < CONFIG.MISSILE_GROUP_SIZE; mi++) {
                const mx = missilesStartX + mi * (missileW + missileSpacing);
                const my = rowY;

                if (group.ready) {
                    ctx.fillStyle = '#cc2200';
                    ctx.fillRect(mx, my + 2, missileW, missileH - 2);
                    ctx.beginPath();
                    ctx.moveTo(mx, my + 2);
                    ctx.lineTo(mx + missileW / 2, my);
                    ctx.lineTo(mx + missileW, my + 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#881100';
                    ctx.fillRect(mx - 1, my + missileH - 2, missileW + 2, 2);
                    const pulse = Math.sin(Date.now() / 150 + mi + gi * 4) * 0.3 + 0.7;
                    ctx.fillStyle = `rgba(255, 170, 0, ${pulse})`;
                    ctx.beginPath();
                    ctx.arc(mx + missileW / 2, my + 1, 1, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Empty outline
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 0.8;
                    ctx.strokeRect(mx, my + 2, missileW, missileH - 2);
                    ctx.beginPath();
                    ctx.moveTo(mx, my + 2);
                    ctx.lineTo(mx + missileW / 2, my);
                    ctx.lineTo(mx + missileW, my + 2);
                    ctx.closePath();
                    ctx.stroke();

                    // Fill-from-bottom recharge
                    if (rechargeProgress > 0) {
                        const fillH = (missileH - 2) * rechargeProgress;
                        const fillY = my + missileH - fillH;

                        let fillColor;
                        if (rechargeProgress < 0.5) fillColor = '#661100';
                        else if (rechargeProgress < 0.9) fillColor = '#cc2200';
                        else fillColor = '#ff4400';

                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(mx, fillY, missileW, fillH);
                        ctx.clip();
                        ctx.fillStyle = fillColor;
                        ctx.fillRect(mx, my + 2, missileW, missileH - 2);
                        ctx.beginPath();
                        ctx.moveTo(mx, my + 2);
                        ctx.lineTo(mx + missileW / 2, my);
                        ctx.lineTo(mx + missileW, my + 2);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();

                        // Meniscus line
                        ctx.strokeStyle = 'rgba(255, 170, 0, 0.6)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(mx, fillY);
                        ctx.lineTo(mx + missileW, fillY);
                        ctx.stroke();
                    }
                }
            }

            // Per-group recharge bar
            if (!group.ready) {
                const barY = rowY + missileH + 1;
                const barW = CONFIG.MISSILE_GROUP_SIZE * (missileW + missileSpacing) - missileSpacing;
                renderNGEBar(missilesStartX, barY, barW, 2, rechargeProgress, '#f40', { segments: 4 });
            }
        }
    }

    return panelH;
}

function renderFleetZone(zone) {
    const { x, y, w } = zone;
    const pad = 6;

    if (!harvesterUnlocked && !battleDroneUnlocked && activeCoordinators.length === 0) return;
    if (droneSlots <= 0 && activeCoordinators.length === 0) return;

    // Calculate dynamic height
    let totalRows = 0;
    const rowH = 18;
    const headerH = 22;
    const coordHeaderH = 16;

    // Count coordinator entries + their sub-drones
    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        totalRows++; // coordinator itself
        if (coord.subDrones) {
            totalRows += coord.subDrones.filter(d => d.alive).length;
        }
    }

    // Count raw drones (not attached to coordinators)
    const rawDrones = activeDrones.length;
    if (rawDrones > 0) {
        totalRows++; // "RAW DRONES" header
        totalRows += rawDrones;
    }

    const panelH = headerH + totalRows * rowH + pad * 2 + 4;

    renderNGEPanel(x, y, w, Math.max(panelH, 50), { color: '#48f', cutCorners: ['tr'], label: 'FLEET.CMD' });

    // Panel indicators
    const fleetPanelH = Math.max(panelH, 50);
    renderNGEIndicator(x + 4, y + 4, 'diamond', '#48f', 'steady', { rate: 700 });
    renderNGEIndicator(x + 4, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 0, cascadeTotal: 3 });
    renderNGEIndicator(x + 12, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 1, cascadeTotal: 3 });
    renderNGEIndicator(x + 20, y + fleetPanelH - 8, 'square', '#48f', 'cascade', { cascadeIndex: 2, cascadeTotal: 3 });
    renderNGEIndicator(x + w - 8, y + fleetPanelH - 8, 'circle', '#48f', 'steady', { rate: 1000 });

    // Slot counter
    const subDroneCount = activeCoordinators.reduce((sum, c) => sum + (c.subDrones ? c.subDrones.filter(d => d.alive).length : 0), 0);
    const totalDrones = activeDrones.length + subDroneCount;
    ctx.fillStyle = '#8af';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${totalDrones}/${droneSlots}`, x + w - pad, y + 18);
    ctx.textAlign = 'left';

    let curY = y + headerH + pad + 4;
    const barW = 40;
    const barH = 5;

    // Render coordinator trees
    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;

        const isLast = activeCoordinators.filter(c => c.alive && c.state !== 'DYING').indexOf(coord) ===
                       activeCoordinators.filter(c => c.alive && c.state !== 'DYING').length - 1 && rawDrones === 0;
        const treeChar = isLast ? '\u2514' : '\u251C'; // └ or ├

        const isHarvester = coord.type === 'harvester';
        const coordLabel = isHarvester ? 'COORD.H' : 'COORD.A';
        const coordColor = isHarvester ? '#0dc' : '#fa0';
        const energyPercent = coord.energyTimer / coord.maxEnergy;
        const timeLeft = Math.ceil(coord.energyTimer);

        // Tree connector
        ctx.fillStyle = '#445';
        ctx.font = '10px monospace';
        ctx.fillText(treeChar + '\u2500', x + pad, curY + 4);

        // Coordinator label
        ctx.fillStyle = coordColor;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(coordLabel, x + pad + 20, curY + 4);

        // Energy bar
        const coordBarX = x + pad + 66;
        renderNGEBar(coordBarX, curY - 2, barW, barH, energyPercent, coordColor, {
            segments: 6,
            pulse: energyPercent < 0.25
        });

        // Time
        ctx.fillStyle = energyPercent < 0.25 ? '#f44' : '#889';
        ctx.font = '10px monospace';
        ctx.fillText(`${timeLeft}s`, coordBarX + barW + 4, curY + 4);

        // Status dot
        const status = energyPercent > 0.5 ? 'nominal' : energyPercent > 0.25 ? 'caution' : 'critical';
        renderNGEStatusDot(x + w - pad - 4, curY, status, 3);

        curY += rowH;

        // Sub-drones
        const aliveSubDrones = coord.subDrones ? coord.subDrones.filter(d => d.alive) : [];
        for (let si = 0; si < aliveSubDrones.length; si++) {
            const sub = aliveSubDrones[si];
            const isLastSub = si === aliveSubDrones.length - 1;
            const subTreeChar = isLastSub ? '\u2514' : '\u251C';

            // Vertical connector
            if (!isLast || !isLastSub) {
                ctx.fillStyle = '#334';
                ctx.fillRect(x + pad + 4, curY - rowH + 6, 1, rowH);
            }

            // Sub tree connector
            ctx.fillStyle = '#334';
            ctx.font = '10px monospace';
            ctx.fillText('\u2502  ' + subTreeChar + '\u2500', x + pad, curY + 3);

            // Drone label
            const subIsHarvester = sub.type === 'harvester';
            const subLabel = subIsHarvester ? `H-${String(si + 1).padStart(2, '0')}` : `A-${String(si + 1).padStart(2, '0')}`;
            ctx.fillStyle = subIsHarvester ? '#0a0' : '#a44';
            ctx.font = '9px monospace';
            ctx.fillText(subLabel, x + pad + 28, curY + 3);

            // Sub energy bar
            const subEnergyPercent = sub.energyTimer / sub.maxEnergy;
            renderNGEBar(coordBarX, curY - 3, barW * 0.7, 4, subEnergyPercent, subIsHarvester ? '#0a0' : '#a44', {
                segments: 4
            });

            // Sub time
            ctx.fillStyle = '#667';
            ctx.font = '9px monospace';
            ctx.fillText(`${Math.ceil(sub.energyTimer)}s`, coordBarX + barW * 0.7 + 3, curY + 3);

            curY += rowH;
        }
    }

    // Raw drones (not attached to coordinators)
    if (rawDrones > 0) {
        const isLast = true;
        const treeChar = '\u2514';

        ctx.fillStyle = '#445';
        ctx.font = '10px monospace';
        ctx.fillText(treeChar + '\u2500', x + pad, curY + 4);

        ctx.fillStyle = '#889';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`DRONES: ${rawDrones}`, x + pad + 20, curY + 4);

        curY += rowH;

        for (let i = 0; i < activeDrones.length; i++) {
            const drone = activeDrones[i];
            const isLastDrone = i === activeDrones.length - 1;
            const droneTreeChar = isLastDrone ? '\u2514' : '\u251C';

            ctx.fillStyle = '#334';
            ctx.font = '10px monospace';
            ctx.fillText('   ' + droneTreeChar + '\u2500', x + pad, curY + 3);

            const isHarvester = drone.type === 'harvester';
            const droneLabel = isHarvester ? `H-${String(i + 1).padStart(2, '0')}` : `B-${String(i + 1).padStart(2, '0')}`;
            ctx.fillStyle = isHarvester ? '#0a0' : '#a44';
            ctx.font = '9px monospace';
            ctx.fillText(droneLabel, x + pad + 28, curY + 3);

            const droneEnergyPercent = drone.energyTimer / drone.maxEnergy;
            const droneBarX = x + pad + 66;
            renderNGEBar(droneBarX, curY - 3, barW * 0.7, 4, droneEnergyPercent, isHarvester ? '#0a0' : '#a44', {
                segments: 4
            });

            ctx.fillStyle = '#667';
            ctx.font = '9px monospace';
            ctx.fillText(`${Math.ceil(drone.energyTimer)}s`, droneBarX + barW * 0.7 + 3, curY + 3);

            // Warning flash for low energy
            if (drone.energyTimer < 5 && Math.floor(Date.now() / 300) % 2 === 0) {
                renderNGEStatusDot(x + w - pad - 4, curY, 'critical', 2);
            }

            curY += rowH;
        }
    }
}

function renderCommanderZone(zone) {
    const { x, y, w, h } = zone;

    renderNGEPanel(x, y, w, h, { color: '#0f0', cutCorners: ['tl', 'br'], alpha: 0.75 });

    // "INCOMING TRANSMISSION" header with blinking light
    renderNGEBlinkLight(x + 8, y + 6, '#0f0', 250);
    // Bottom-left indicator
    renderNGEIndicator(x + 4, y + h - 8, 'triangle', '#0f0', 'double', {});
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INCOMING TRANSMISSION', x + 16, y + 12);

    // Scanline effect over entire panel
    renderNGEScanlines(x, y, w, h, 0.025);

    // Commander portrait (left side)
    const portraitSize = h - 24;
    const portraitX = x + 6;
    const portraitY = y + 18;
    renderCommanderPortrait(portraitX, portraitY, portraitSize, missionCommanderState.emotion);

    // Dialogue (right of portrait)
    const dialogueX = portraitX + portraitSize + 6;
    const dialogueW = w - portraitSize - 18;
    if (missionCommanderState.dialogue) {
        const displayed = missionCommanderState.dialogue.substring(0, missionCommanderState.typewriterIndex);
        if (displayed.length > 0) {
            ctx.fillStyle = '#0f0';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left';

            // Word wrap
            const words = displayed.split(' ');
            const lines = [];
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                if (ctx.measureText(testLine).width > dialogueW - 4) {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);

            for (let i = 0; i < Math.min(lines.length, 4); i++) {
                ctx.fillText(lines[i], dialogueX, portraitY + 10 + i * 13);
            }
        }
    }
}

function renderDiagnosticsZone(zone) {
    const { x, y, w, h } = zone;
    const pad = 6;
    const lineH = 12;

    renderNGEPanel(x, y, w, h, { color: '#0af', cutCorners: ['tl'], alpha: 0.5 });

    // Header
    ctx.fillStyle = '#0af';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIAG.SYS', x + 6, y + 11);

    // Blink lights
    renderNGEIndicator(x + w - 18, y + 4, 'square', '#0af', 'steady', { rate: 700 });
    renderNGEIndicator(x + w - 10, y + 4, 'square', '#0af', 'steady', { rate: 700, phaseOffset: 350 });

    // Build diagnostic lines dynamically
    const lines = [];

    if (ufo) {
        const energyPct = ufo.energy / ufo.maxEnergy;
        const energyStatus = energyPct > 0.25 ? 'nominal' : (energyPct > 0.1 ? 'caution' : 'critical');
        lines.push({ label: 'NRG.MAIN', value: `${Math.ceil(ufo.energy)}/${ufo.maxEnergy}`, status: energyStatus });
    }

    // Beam status
    const beamStatus = ufo ? (ufo.beamActive ? 'ACTIVE' : (ufo.energy < CONFIG.ENERGY_MIN_TO_FIRE ? 'DEPLETED' : 'IDLE')) : 'OFFLINE';
    const beamSt = beamStatus === 'DEPLETED' ? 'critical' : 'nominal';
    lines.push({ label: 'BEAM.SYS', value: beamStatus, status: beamSt });

    // Shield
    const shldVal = ufo ? ufo.health : finalHealth;
    const shldPct = shldVal / CONFIG.UFO_START_HEALTH;
    lines.push({ label: 'SHLD.INTG', value: `${Math.ceil(shldVal)}/${CONFIG.UFO_START_HEALTH}`, status: shldPct > 0.25 ? 'nominal' : 'critical' });

    // Drones
    if (harvesterUnlocked) {
        const aliveH = activeDrones.filter(d => d.type === 'harvester' && d.alive).length +
            activeCoordinators.filter(c => c.type === 'harvester').reduce((s, c) => s + (c.subDrones ? c.subDrones.filter(d => d.alive).length : 0), 0);
        const totalH = activeDrones.filter(d => d.type === 'harvester').length +
            activeCoordinators.filter(c => c.type === 'harvester').reduce((s, c) => s + (c.subDrones ? c.subDrones.length : 0), 0);
        lines.push({ label: 'DRN.HARV', value: `${aliveH}/${totalH} ACTIVE`, status: aliveH === totalH ? 'nominal' : 'caution' });
    }

    if (battleDroneUnlocked) {
        const aliveB = activeDrones.filter(d => d.type === 'battle' && d.alive).length +
            activeCoordinators.filter(c => c.type === 'attack').reduce((s, c) => s + (c.subDrones ? c.subDrones.filter(d => d.alive).length : 0), 0);
        const totalB = activeDrones.filter(d => d.type === 'battle').length +
            activeCoordinators.filter(c => c.type === 'attack').reduce((s, c) => s + (c.subDrones ? c.subDrones.length : 0), 0);
        lines.push({ label: 'DRN.ATTK', value: `${aliveB}/${totalB} ACTIVE`, status: aliveB === totalB ? 'nominal' : 'caution' });
    }

    for (const coord of activeCoordinators) {
        if (!coord.alive || coord.state === 'DYING') continue;
        const cLabel = coord.type === 'harvester' ? 'COORD.H' : 'COORD.A';
        const cPct = coord.energyTimer / coord.maxEnergy;
        lines.push({ label: cLabel, value: `NRG ${Math.round(cPct * 100)}%`, status: cPct > 0.25 ? 'nominal' : 'critical' });
    }

    if (missileUnlocked && missileGroupCount > 0) {
        const ready = missileGroups.filter(g => g.ready).length;
        lines.push({ label: 'ORD.MSL', value: `${ready}/${missileGroupCount} RDY`, status: ready > 0 ? 'nominal' : 'caution' });
    }

    if (playerInventory.maxBombs > 0) {
        lines.push({ label: 'ORD.BMB', value: `${playerInventory.bombs}/${playerInventory.maxBombs}`, status: playerInventory.bombs > 0 ? 'nominal' : 'caution' });
    }

    // Threat counter
    const tankCount = tanks ? tanks.filter(t => t.alive).length : 0;
    const thrStatus = tankCount > 5 ? 'critical' : (tankCount > 3 ? 'caution' : 'nominal');
    lines.push({ label: 'THR.PROX', value: `${tankCount} HOSTILE`, status: thrStatus });

    // Render lines with scroll
    const startY = y + 20;
    const viewH = h - 24;
    const totalLineH = lines.length * lineH;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, startY, w - 4, viewH);
    ctx.clip();

    let scrollY = 0;
    if (totalLineH > viewH) {
        diagnosticsState.scrollPauseTimer -= 1/60;
        if (diagnosticsState.scrollPauseTimer <= 0) {
            diagnosticsState.scrollOffset += diagnosticsState.scrollDirection * 0.4;
            const maxScroll = totalLineH - viewH;
            if (diagnosticsState.scrollOffset >= maxScroll) {
                diagnosticsState.scrollOffset = maxScroll;
                diagnosticsState.scrollDirection = -1;
                diagnosticsState.scrollPauseTimer = 2;
            } else if (diagnosticsState.scrollOffset <= 0) {
                diagnosticsState.scrollOffset = 0;
                diagnosticsState.scrollDirection = 1;
                diagnosticsState.scrollPauseTimer = 2;
            }
        }
        scrollY = diagnosticsState.scrollOffset;
    }

    for (let i = 0; i < lines.length; i++) {
        const ly = startY + i * lineH - scrollY;
        if (ly < startY - lineH || ly > startY + viewH) continue;

        const line = lines[i];
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = line.status === 'critical' ? '#f44' : '#8af';
        ctx.fillText(line.label, x + pad, ly + 9);
        ctx.fillStyle = line.status === 'critical' ? '#f44' : '#ccc';
        ctx.textAlign = 'right';
        ctx.fillText(line.value, x + w - pad - 12, ly + 9);
        ctx.textAlign = 'left';

        // Status dot
        renderNGEStatusDot(x + w - pad - 4, ly + 6, line.status, 2);
    }

    ctx.restore();
}

function renderOpsLogZone(zone) {
    const { x, y, w, h } = zone;
    const pad = 6;
    const lineH = 12;
    const maxVisibleLines = 6;

    renderNGEPanel(x, y, w, h, { color: '#8af', cutCorners: ['bl'], alpha: 0.45 });

    // Header
    ctx.fillStyle = '#8af';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('OPS.LOG', x + 6, y + 11);

    // Blink lights (alternating pair)
    renderNGEIndicator(x + w - 18, y + 4, 'square', '#8af', 'steady', { rate: 500 });
    renderNGEIndicator(x + w - 10, y + 4, 'square', '#8af', 'steady', { rate: 500, phaseOffset: 250 });

    // Render events (newest at bottom)
    const startY = y + 20;
    const events = opsLogState.events;
    const visibleStart = Math.max(0, events.length - maxVisibleLines);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, startY, w - 4, h - 24);
    ctx.clip();

    for (let i = visibleStart; i < events.length; i++) {
        const ev = events[i];
        const lineIdx = i - visibleStart;
        const ly = startY + lineIdx * lineH;

        const alpha = Math.max(0.15, 1 - (ev.age / 15));
        const isNew = ev.age < 0.3;

        ctx.font = ev.bold ? 'bold 9px monospace' : '9px monospace';

        // Prefix
        ctx.fillStyle = `rgba(85, 85, 85, ${alpha})`;
        ctx.textAlign = 'left';
        ctx.fillText('> ', x + pad, ly + 9);

        // Text
        if (isNew) {
            ctx.shadowColor = ev.color;
            ctx.shadowBlur = 4;
        }
        ctx.fillStyle = `rgba(${hexToRgb(ev.color)}, ${alpha})`;
        ctx.fillText(ev.text, x + pad + 12, ly + 9);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

// Tech readout chip definitions
const TECH_CHIP_DEFS = [
    { id: 'pg1', text: 'PG1 CONDUIT', width: 58, track: 'powerGrid' },
    { id: 'pg2', text: 'PG2 EFFIC', width: 44, track: 'powerGrid' },
    { id: 'pg3', text: 'PG3 BCAST', width: 44, track: 'powerGrid' },
    { id: 'pg4', text: 'PG4 REACT', width: 44, track: 'powerGrid' },
    { id: 'pg5', text: 'PG5 S.GRID', width: 52, track: 'powerGrid' },
    { id: 'dc1', text: 'DC1 UPLINK', width: 52, track: 'droneCommand' },
    { id: 'dc2', text: 'DC2 H.CORD', width: 52, track: 'droneCommand' },
    { id: 'dc3', text: 'DC3 A.CORD', width: 52, track: 'droneCommand' },
    { id: 'dc4', text: 'DC4 EXPND', width: 44, track: 'droneCommand' },
    { id: 'dc5', text: 'DC5 SWARM', width: 44, track: 'droneCommand' },
    { id: 'dn1', text: 'DN1 THRST', width: 44, track: 'defenseNetwork' },
    { id: 'dn2', text: 'DN2 ARMOR', width: 44, track: 'defenseNetwork' },
    { id: 'dn3', text: 'DN3 SHLD.T', width: 52, track: 'defenseNetwork' },
    { id: 'dn4', text: 'DN4 RESIL', width: 44, track: 'defenseNetwork' },
    { id: 'dn5', text: 'DN5 S.SHLD', width: 52, track: 'defenseNetwork' }
];

const TRACK_COLORS = {
    powerGrid: '#ff0',
    droneCommand: '#48f',
    defenseNetwork: '#f80'
};

function renderTechChips(layout) {
    const researched = techTree.researched;
    if (researched.size === 0) return;

    const statusEnd = layout.statusZone.x + layout.statusZone.w;
    const missionStart = layout.missionZone.x;
    const gapStartX = statusEnd + 4;
    const gapEndX = missionStart - 4;
    const gapW = gapEndX - gapStartX;
    if (gapW < 44) return;

    let curX = gapStartX;
    let curY = 6;
    let lastTrack = null;

    for (const chipDef of TECH_CHIP_DEFS) {
        if (!researched.has(chipDef.id)) continue;

        const chipW = chipDef.width;
        const trackColor = TRACK_COLORS[chipDef.track];

        // Track separator
        if (lastTrack && lastTrack !== chipDef.track) {
            if (curX + 2 <= gapEndX) {
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(curX, curY + 2);
                ctx.lineTo(curX, curY + 16);
                ctx.stroke();
                curX += 4;
            }
        }

        // Wrap to next row if needed
        if (curX + chipW > gapEndX) {
            curX = gapStartX;
            curY += 21;
        }

        // Chip background with cut corner
        ctx.fillStyle = 'rgba(5, 8, 18, 0.5)';
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX + chipW - 4, curY);
        ctx.lineTo(curX + chipW, curY + 4);
        ctx.lineTo(curX + chipW, curY + 18);
        ctx.lineTo(curX, curY + 18);
        ctx.closePath();
        ctx.fill();

        // Chip border
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Chip text - prefix in track color
        ctx.fillStyle = trackColor;
        ctx.globalAlpha = 0.7;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(chipDef.text.substring(0, 3), curX + 2, curY + 11);
        // Suffix in white
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.globalAlpha = 1;
        ctx.font = '7px monospace';
        ctx.fillText(chipDef.text.substring(4), curX + 20, curY + 11);

        // Status blink light (2x2)
        const blinkOn = Math.floor(Date.now() / 1200) % 2 === 0;
        ctx.fillStyle = blinkOn ? trackColor : 'rgba(255,255,255,0.08)';
        if (blinkOn) { ctx.shadowColor = trackColor; ctx.shadowBlur = 3; }
        ctx.fillRect(curX + chipW - 5, curY + 8, 2, 2);
        ctx.shadowBlur = 0;

        lastTrack = chipDef.track;
        curX += chipW + 3;
    }
}

function renderEnergyFlows(layout) {
    if (!ufo) return;

    const ufoX = ufo.x;
    const ufoY = ufo.y - 20;

    // Flow to fleet zone (drone power)
    // Always draw as inactive (subtle) — the bright active state created a
    // distracting dashed line across the viewport toward the sidebar when beaming.
    // Beam-active feedback is already provided by in-beam sparkles and glow.
    if (hudAnimState.fleetPanelVisible) {
        const fz = layout.fleetZone;
        renderEnergyFlowLine(ufoX + 60, ufoY, fz.x, fz.y + fz.h / 2, '#48f', false);
    }

    // Flow to weapons zone (ordnance power)
    if (hudAnimState.weaponsPanelVisible) {
        const wz = layout.weaponsZone;
        const active = false; // weapons don't drain continuous energy
        renderEnergyFlowLine(ufoX - 60, ufoY, wz.x + wz.w, wz.y + wz.h / 2, '#f44', active);
    }
}

// Commander in-mission update
function updateMissionCommander(dt) {
    if (gameState !== 'PLAYING') return;

    // Update typewriter (works during wave 1 tutorial too)
    if (missionCommanderState.visible && missionCommanderState.dialogue) {
        missionCommanderState.typewriterTimer += dt;
        missionCommanderState.typewriterIndex = Math.min(
            Math.floor(missionCommanderState.typewriterTimer * 25),
            missionCommanderState.dialogue.length
        );

        // Garbled speech
        if (missionCommanderState.typewriterIndex > 0 &&
            missionCommanderState.typewriterIndex < missionCommanderState.dialogue.length &&
            missionCommanderState.typewriterIndex % 3 === 0) {
            SFX.commanderSpeechGarble && SFX.commanderSpeechGarble();
        }

        missionCommanderState.displayTimer += dt;
        if (missionCommanderState.displayTimer >= missionCommanderState.displayDuration) {
            missionCommanderState.visible = false;
        }
    }

    // Cooldown and auto-trigger (wave 2+ only)
    if (wave >= 2 && !missionCommanderState.visible) {
        missionCommanderState.cooldownTimer -= dt;
        if (missionCommanderState.cooldownTimer <= 0) {
            triggerMissionCommander();
        }
    }
}

function triggerMissionCommander(category = null) {
    if (missionCommanderState.visible) return;

    // Pick category based on game state if not specified
    if (!category) {
        const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : 1;
        const energyPercent = ufo ? ufo.energy / ufo.maxEnergy : 1;
        const quotaPercent = quotaTarget > 0 ? quotaProgress / quotaTarget : 1;
        const waveElapsed = CONFIG.WAVE_DURATION - waveTimer;
        const expectedProgress = waveElapsed / CONFIG.WAVE_DURATION;

        if (healthPercent < 0.25) category = 'lowShield';
        else if (energyPercent < 0.15) category = 'energyLow';
        else if (quotaTarget > 0 && quotaPercent < expectedProgress * 0.5) category = 'quotaBehind';
        else if (Math.random() < 0.4) category = 'idle';
        else category = 'quotaOnTrack';
    }

    const dialogues = MISSION_COMMANDER_DIALOGUES[category];
    if (!dialogues || dialogues.length === 0) return;

    missionCommanderState.visible = true;
    missionCommanderState.dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    missionCommanderState.typewriterIndex = 0;
    missionCommanderState.typewriterTimer = 0;
    missionCommanderState.displayTimer = 0;
    missionCommanderState.emotion = category === 'lowShield' || category === 'quotaBehind' ? 'angry' :
                                     category === 'killStreak' ? 'pleased' : 'neutral';
    missionCommanderState.cooldownTimer = missionCommanderState.minCooldown +
        Math.random() * (missionCommanderState.maxCooldown - missionCommanderState.minCooldown);
}

function triggerTutorialCommander(phase) {
    const dialogue = TUTORIAL_COMMANDER_DIALOGUES[phase];
    if (!dialogue) return;

    missionCommanderState.visible = true;
    missionCommanderState.dialogue = dialogue;
    missionCommanderState.typewriterIndex = 0;
    missionCommanderState.typewriterTimer = 0;
    missionCommanderState.displayTimer = 0;
    missionCommanderState.displayDuration = phase === 'welcome' || phase === 'complete' ? 10 : 7;
    missionCommanderState.emotion = phase === 'tankIncoming' ? 'angry' :
                                     phase === 'complete' ? 'pleased' : 'neutral';
}

// Update HUD animations each frame
function updateHUDAnimations(dt) {
    hudAnimState.energyFlowPhase += dt;
    hudAnimState.scanlineOffset = (hudAnimState.scanlineOffset + dt * 120) % 300;

    // Energy pulse animation (~3.5 second cycle)
    hudAnimState.energyPulseTimer += dt;
    if (!hudAnimState.energyPulseActive && hudAnimState.energyPulseTimer >= 3.5) {
        hudAnimState.energyPulseActive = true;
        hudAnimState.energyPulseY = 0;
        hudAnimState.energyPulseTimer = 0;
    }
    if (hudAnimState.energyPulseActive) {
        hudAnimState.energyPulseY += dt * 220; // pixels per second sweep speed
        if (hudAnimState.energyPulseY > canvas.height) {
            hudAnimState.energyPulseActive = false;
        }
    }

    // Energy time series sampling + ops log aging
    if (gameState === 'PLAYING') {
        updateEnergyTimeSeries(dt);
        updateOpsLog(dt);
    }

    // Update boot sequence
    if (hudBootState.phase === 'booting') {
        updateHUDBoot(dt);
    }
}

function initHUDBoot() {
    hudBootState.phase = 'booting';
    hudBootState.timer = 0;
    hudBootState.duration = 3.5;
    hudBootState._allOnlinePlayed = false;
    pushOpsLogEvent(`-- WAVE ${wave} --`, '#fff', { type: 'waveStart', bold: true, skipThrottle: true });

    // Snapshot current tech state
    hudBootState.techSnapshot = {
        hasBombs: playerInventory.maxBombs > 0,
        hasMissiles: missileUnlocked,
        missileGroupCount: missileGroupCount,
        hasHarvesters: harvesterUnlocked,
        hasBattleDrones: battleDroneUnlocked,
        droneSlots: droneSlots,
        hasCoordinators: activeCoordinators.length > 0,
        wave: wave,
        quotaTarget: quotaTarget,
        maxHealth: CONFIG.UFO_START_HEALTH,
        hasEnergyCells: playerInventory.energyCells > 0,
        techResearched: [...techTree.researched]
    };

    // Activate relevant panels
    const p = hudBootState.panels;
    p.status.active = true;
    p.mission.active = wave !== 1;  // deferred on wave 1 — boots when beam tutorial starts
    p.systems.active = true;

    const hasWeapons = hudBootState.techSnapshot.hasBombs || hudBootState.techSnapshot.hasMissiles;
    p.weapons.active = hasWeapons;

    const hasFleet = hudBootState.techSnapshot.hasHarvesters || hudBootState.techSnapshot.hasBattleDrones || hudBootState.techSnapshot.hasCoordinators;
    p.fleet.active = hasFleet;

    p.commander.active = wave >= 2;
    p.diagnostics.active = techFlags.beamConduit;
    p.opslog.active = wave >= 2;

    // Reset all panel states and restore default stagger times
    const defaultStartTimes = { status: 0.0, mission: 0.15, systems: 0.3, diagnostics: 0.45, weapons: 0.6, fleet: 0.9, opslog: 1.1, commander: 1.2 };
    for (const key of Object.keys(p)) {
        p[key].progress = 0;
        p[key].phase = 'waiting';
        p[key].startTime = defaultStartTimes[key] || 0;
    }

    // Generate boot text lines for each active panel
    generateBootLines();

    // Reset panel slide animations to 0 so they re-slide during boot
    hudAnimState.weaponsPanelSlide = 0;
    hudAnimState.fleetPanelSlide = 0;
    hudAnimState.commanderPanelSlide = 0;
    hudAnimState.diagPanelSlide = 0;
    hudAnimState.opsLogPanelSlide = 0;
}

function updateHUDBoot(dt) {
    hudBootState.timer += dt;

    const p = hudBootState.panels;
    let allOnline = true;

    for (const [key, panel] of Object.entries(p)) {
        if (!panel.active) continue;

        const elapsed = hudBootState.timer - panel.startTime;
        if (elapsed < 0) {
            allOnline = false;
            continue;
        }

        if (panel.phase === 'waiting') {
            panel.phase = 'booting';
            panel._lastDiagLine = -1;
            SFX.bootPanelStart && SFX.bootPanelStart();
        }

        panel.progress = Math.min(1, elapsed / panel.duration);

        // Play data chatter when a new diagnostic line becomes visible
        if (panel.phase === 'booting' && hudBootState.bootLines[key]) {
            const visibleLine = Math.floor(panel.progress * hudBootState.bootLines[key].length);
            if (visibleLine > (panel._lastDiagLine || -1)) {
                panel._lastDiagLine = visibleLine;
                const lineText = hudBootState.bootLines[key][visibleLine] || '';
                if (lineText.startsWith('[SKIP]')) {
                    SFX.bootMissileSkip && SFX.bootMissileSkip();
                } else {
                    SFX.bootDataChatter && SFX.bootDataChatter();
                }
            }
        }

        if (panel.progress >= 1 && panel.phase === 'booting') {
            panel.phase = 'online';
            SFX.bootPanelOnline && SFX.bootPanelOnline();
        }

        if (panel.phase !== 'online') {
            allOnline = false;
        }
    }

    // Play confirmation chord once when all panels come online
    if (allOnline && !hudBootState._allOnlinePlayed) {
        hudBootState._allOnlinePlayed = true;
        SFX.bootAllOnline && SFX.bootAllOnline();
    }

    if (hudBootState.timer >= hudBootState.duration) {
        hudBootState.phase = 'complete';
    }
}

function generateBootLines() {
    const snap = hudBootState.techSnapshot;
    const lines = hudBootState.bootLines;

    // STATUS panel
    lines.status = [
        `>> INIT SYS.STATUS v${snap.wave}.0`,
        `WAVE ${snap.wave} DEPLOYMENT`,
        `[OK] SCORE TELEMETRY ONLINE`,
        `[OK] COMBO TRACKER LINKED`,
        snap.techResearched.length > 0 ?
            `[OK] BIO.MATTER MONITOR (${snap.techResearched.length} TECH)` :
            `[OK] BIO.MATTER MONITOR`,
        `>> STATUS NOMINAL`
    ];

    // MISSION panel
    lines.mission = [
        `>> INIT MISSION.CTL`,
        `TARGET QUOTA: ${snap.quotaTarget}`,
        `[OK] HARVEST SENSORS CALIBRATED`,
        `[OK] QUOTA TRACKING ACTIVE`,
        `>> MISSION PARAMETERS SET`
    ];

    // SYSTEMS panel
    lines.systems = [
        `>> INIT SYS.INTEGRITY`,
        `HULL: ${snap.maxHealth} HP`,
        snap.hasEnergyCells ? `[OK] REVIVE CELLS: CHARGED` : `[SKIP] NO REVIVE CELLS`,
        `[OK] SHIELD MONITOR ONLINE`,
        `>> INTEGRITY CHECK PASS`
    ];

    // WEAPONS panel (if active)
    if (hudBootState.panels.weapons.active) {
        lines.weapons = [`>> INIT ORD.SYS`];
        if (snap.hasBombs) {
            lines.weapons.push(`[OK] ORD.BOMB ARMED`);
        }
        // Always check for missiles, show different text based on availability
        lines.weapons.push(`SCANNING MISSILE.SYS...`);
        if (snap.hasMissiles) {
            lines.weapons.push(`[OK] MISSILE GROUPS: ${snap.missileGroupCount}`);
            lines.weapons.push(`LOADING SALVO PATTERNS...`);
        } else {
            lines.weapons.push(`[SKIP] MISSILE.SYS NOT FOUND`);
        }
        lines.weapons.push(`[OK] ORDNANCE SYSTEMS HOT`);
        lines.weapons.push(`>> WEAPONS FREE`);
    } else {
        lines.weapons = [];
    }

    // FLEET panel (if active)
    if (hudBootState.panels.fleet.active) {
        lines.fleet = [`>> INIT FLEET.CMD`];
        lines.fleet.push(`DRONE SLOTS: ${snap.droneSlots}`);
        if (snap.hasHarvesters) lines.fleet.push(`[OK] HARVESTER UPLINK`);
        if (snap.hasBattleDrones) lines.fleet.push(`[OK] BATTLE DRONE UPLINK`);
        if (snap.hasCoordinators) lines.fleet.push(`[OK] COORDINATOR NET`);
        lines.fleet.push(`[OK] FLEET TELEMETRY`);
        lines.fleet.push(`>> FLEET STANDING BY`);
    } else {
        lines.fleet = [];
    }

    // COMMANDER panel (if active)
    if (hudBootState.panels.commander.active) {
        lines.commander = [
            `>> INIT COMMS.SYS`,
            `FREQ: 147.30 MHz`,
            `[OK] ENCRYPTION HANDSHAKE`,
            `[OK] COMMANDER LINK`,
            `>> AWAITING TRANSMISSION`
        ];
    } else {
        lines.commander = [];
    }

    // DIAGNOSTICS panel (if active)
    if (hudBootState.panels.diagnostics && hudBootState.panels.diagnostics.active) {
        lines.diagnostics = [
            `>> INIT DIAG.SYS`,
            `[OK] SCANNING ACTIVE MODULES`,
            `[OK] LINKING TELEMETRY FEEDS`,
            `[OK] SUBSYSTEM MONITOR ONLINE`,
            `>> DIAG.SYS READY`
        ];
    } else {
        lines.diagnostics = [];
    }

    // OPS.LOG panel (if active)
    if (hudBootState.panels.opslog && hudBootState.panels.opslog.active) {
        lines.opslog = [
            `>> INIT OPS.LOG`,
            `[OK] EVENT BUFFER ALLOC`,
            `[OK] LOG STREAM ACTIVE`,
            `>> OPS.LOG ONLINE`
        ];
    } else {
        lines.opslog = [];
    }
}

// ============================================
// BOOT RENDERING (Panel Overlays + Global Effects)
// ============================================

function renderPanelBootOverlay(zone, h, color, label, panelState, bootLines) {
    if (panelState.phase === 'waiting') return;

    const { x, y, w } = zone;
    const progress = panelState.progress;

    // Online phase: brief flash then nothing
    if (panelState.phase === 'online') {
        if (hudBootState.timer - (panelState.startTime + panelState.duration) < 0.2) {
            const flashAlpha = 0.15 * (1 - (hudBootState.timer - panelState.startTime - panelState.duration) / 0.2);
            if (flashAlpha > 0) {
                ctx.fillStyle = `rgba(${hexToRgb(color)}, ${flashAlpha})`;
                ctx.fillRect(x, y, w, h);
            }
        }
        return;
    }

    // Booting phase: full overlay
    ctx.save();

    // Dark background that fades as progress increases
    const bgAlpha = 0.9 * (1 - progress * 0.8);
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.fillRect(x, y, w, h);

    // Panel border with alpha based on progress
    const borderAlpha = 0.3 + progress * 0.5;
    ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${borderAlpha})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Border trace effect (progress 0 - 0.3)
    if (progress < 0.3) {
        const traceT = progress / 0.3; // 0..1 within trace phase
        const perimeter = 2 * (w + h);
        const tracePos = traceT * perimeter;

        // Compute x,y position along border perimeter (clockwise from top-left)
        let tx, ty;
        if (tracePos < w) {
            tx = x + tracePos; ty = y;
        } else if (tracePos < w + h) {
            tx = x + w; ty = y + (tracePos - w);
        } else if (tracePos < 2 * w + h) {
            tx = x + w - (tracePos - w - h); ty = y + h;
        } else {
            tx = x; ty = y + h - (tracePos - 2 * w - h);
        }

        // Glowing dot
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Short gradient trail behind the dot
        const trailLen = Math.min(60, tracePos);
        if (trailLen > 2) {
            const trailStartPos = Math.max(0, tracePos - trailLen);
            let tsx, tsy;
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
            // Draw through intermediate corners if trail wraps a corner
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = `rgba(${hexToRgb(color)}, 0.4)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Clip to panel bounds for text rendering
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, y + 2, w - 4, h - 4);
    ctx.clip();

    // Label typewriter effect (first 20% of boot)
    if (progress < 0.2) {
        const charCount = Math.floor((progress / 0.2) * label.length);
        const labelText = label.substring(0, charCount);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.fillText(labelText, x + 4, y + 12);
    } else {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 4, y + 12);
    }

    // Diagnostic text lines
    if (bootLines && bootLines.length > 0) {
        const lineH = 11;
        const textStartY = y + 24;
        const visibleLines = Math.floor(progress * bootLines.length);

        ctx.font = '9px monospace';
        ctx.textAlign = 'left';

        for (let i = 0; i <= visibleLines && i < bootLines.length; i++) {
            const isCurrent = (i === visibleLines);
            const lineAlpha = isCurrent ?
                (progress * bootLines.length - i) :
                Math.min(1, 0.5 + (i / bootLines.length) * 0.4);

            const line = bootLines[i];
            const ly = textStartY + i * lineH;
            if (ly > y + h - 10) break;

            // Color-code based on prefix
            if (line.startsWith('>>')) {
                ctx.fillStyle = `rgba(${hexToRgb(color)}, ${lineAlpha})`;
            } else if (line.startsWith('[OK]')) {
                ctx.fillStyle = `rgba(0, 255, 100, ${lineAlpha})`;
            } else if (line.startsWith('[SKIP]') || line.startsWith('[WARN]')) {
                ctx.fillStyle = `rgba(255, 200, 0, ${lineAlpha})`;
            } else {
                ctx.fillStyle = `rgba(180, 200, 220, ${lineAlpha * 0.7})`;
            }

            // Typewriter effect for current line
            if (isCurrent) {
                const partialProgress = progress * bootLines.length - i;
                const charsToShow = Math.floor(partialProgress * line.length);
                ctx.fillText(line.substring(0, charsToShow), x + 4, ly);
            } else {
                ctx.fillText(line, x + 4, ly);
            }
        }

        // Blinking cursor after last visible line
        const cursorLineIdx = Math.min(visibleLines, bootLines.length - 1);
        const cursorY = textStartY + cursorLineIdx * lineH;
        if (cursorY < y + h - 10) {
            const cursorLine = bootLines[cursorLineIdx] || '';
            const blink = Math.floor(Date.now() / 400) % 2 === 0;
            if (blink) {
                ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.8)`;
                const cursorX = x + 4 + ctx.measureText(cursorLine).width + 2;
                ctx.fillText('_', Math.min(cursorX, x + w - 10), cursorY);
            }
        }
    }

    ctx.restore(); // end clip

    // Progress bar at bottom of panel (3px tall)
    const barPad = 4;
    const barY = y + h - barPad - 3;
    const barW = w - barPad * 2;
    ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.2)`;
    ctx.fillRect(x + barPad, barY, barW, 3);
    ctx.fillStyle = color;
    ctx.fillRect(x + barPad, barY, barW * progress, 3);

    // Scanline overlay for CRT feel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let sy = y; sy < y + h; sy += 3) {
        ctx.fillRect(x, sy, w, 1);
    }

    // Static/noise during early boot (progress < 0.4)
    if (progress < 0.4) {
        const noiseCount = Math.floor(30 * (1 - progress / 0.4));
        for (let n = 0; n < noiseCount; n++) {
            const nx = x + Math.random() * w;
            const ny = y + Math.random() * h;
            const gray = Math.floor(Math.random() * 200);
            const noiseAlpha = 0.03 + Math.random() * 0.05;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${noiseAlpha})`;
            ctx.fillRect(nx, ny, 2 + Math.random() * 2, 2 + Math.random() * 2);
        }
    }

    ctx.restore();
}

function renderHUDBootGlobalEffects() {
    if (hudBootState.phase !== 'booting') return;

    const timer = hudBootState.timer;

    // CRT power-on flash (first 200ms)
    if (timer < 0.2) {
        const halfH = canvas.height / 2;
        if (timer < 0.1) {
            // Expanding white line from center
            const expandProgress = timer / 0.1;
            const lineH = Math.max(1, expandProgress * canvas.height);
            const lineY = halfH - lineH / 2;
            const alpha = 0.7 * (1 - expandProgress * 0.3);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, lineY, canvas.width, lineH);
        } else {
            // Fading out
            const fadeProgress = (timer - 0.1) / 0.1;
            const alpha = 0.5 * (1 - fadeProgress);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    // "ALL SYSTEMS NOMINAL" text (timer 3.0 - 3.5s)
    if (timer >= 3.0 && timer <= 3.5) {
        // Check if all active panels are online
        let allOnline = true;
        for (const [key, panel] of Object.entries(hudBootState.panels)) {
            if (panel.active && panel.phase !== 'online') {
                allOnline = false;
                break;
            }
        }

        if (allOnline) {
            const textProgress = (timer - 3.0) / 0.5;
            const alpha = textProgress < 0.3 ? textProgress / 0.3 :
                         textProgress < 0.7 ? 1.0 :
                         1.0 - (textProgress - 0.7) / 0.3;
            const scale = 1.0 + (1 - textProgress) * 0.1;

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale, scale);
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 12;
            ctx.fillText('ALL SYSTEMS NOMINAL', 0, 0);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
}

// ============================================
// RENDERING
// ============================================

function renderBackground() {
    // Night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(1, '#1a1a4e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Twinkling stars
    renderStars();

    // Ground
    const groundHeight = 60;
    ctx.fillStyle = '#2d4a2d';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function renderUI() {
    const panelPadding = 15;
    const panelMargin = 12;

    // ========== TOP LEFT: SCORE PANEL ==========
    const scoreText = score.toLocaleString();
    const hiText = highScore.toLocaleString();

    // Score panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const scorePanelWidth = 200;
    const scorePanelHeight = 70;
    ctx.beginPath();
    ctx.roundRect(panelMargin, panelMargin, scorePanelWidth, scorePanelHeight, 8);
    ctx.fill();

    // Main score
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(scoreText, panelMargin + panelPadding, panelMargin + 32);

    // High score label and value
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText('HI', panelMargin + panelPadding, panelMargin + 55);
    ctx.fillStyle = '#888';
    ctx.fillText(hiText, panelMargin + panelPadding + 30, panelMargin + 55);

    // ========== TOP LEFT: WAVE, TIMER & COMBO (below score panel) ==========
    const infoY = panelMargin + scorePanelHeight + 10;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`WAVE ${wave}`, panelMargin + panelPadding, infoY + 18);

    // Timer
    const displayTime = Math.max(0, waveTimer);
    const minutes = Math.floor(displayTime / 60);
    const seconds = Math.floor(displayTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Timer warning effect for last 10 seconds
    if (waveTimer <= 10 && gameState === 'PLAYING') {
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgb(255, ${Math.floor(pulse * 100)}, ${Math.floor(pulse * 100)})`;
        ctx.font = 'bold 22px monospace';
    } else {
        ctx.fillStyle = '#aaa';
        ctx.font = '18px monospace';
    }
    ctx.fillText(timeStr, panelMargin + panelPadding + 90, infoY + 18);

    // Combo indicator (on same line as wave/timer)
    if (combo > 0) {
        const multiplier = CONFIG.COMBO_MULTIPLIERS[Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1)];

        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${combo}x`, panelMargin + panelPadding + 155, infoY + 18);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ca0';
        ctx.font = '14px monospace';
        ctx.fillText(`(${multiplier}x)`, panelMargin + panelPadding + 190, infoY + 18);
    }

    // ========== TOP RIGHT: SHIELD BAR ==========
    const shieldBarWidth = 180;
    const shieldBarHeight = 24;
    const shieldPanelWidth = shieldBarWidth + panelPadding * 2;
    const energyCellsWidth = (() => {
        const cells = playerInventory.energyCells;
        if (cells <= 0) return 0;
        const cellSize = 18;
        const spacing = 6;
        const cellPadding = 8;
        return (cellSize + spacing) * cells - spacing + cellPadding * 2;
    })();
    const bombPanelWidth = (() => {
        const maxBombs = playerInventory.maxBombs;
        if (maxBombs <= 0) return 0;
        const bombSize = 18;
        const spacing = 8;
        const bombPadding = 8;
        const keyWidth = 20;
        const keyPadding = 6;
        const labelText = 'BOMBS';
        const labelGap = 8;
        ctx.font = 'bold 10px monospace';
        const labelWidth = ctx.measureText(labelText).width;
        const bombsWidth = (bombSize + spacing) * maxBombs - spacing;
        return labelWidth + labelGap + keyWidth + keyPadding + bombsWidth + bombPadding * 2;
    })();
    const missilePanelWidth = (() => {
        if (!missileUnlocked || missileGroupCount <= 0) return 0;
        const mW = 8;
        const mSpacing = 4;
        const missilePadding = 8;
        const keyWidth = 20;
        const labelText = 'SALVO';
        const labelGap = 6;
        const labelCharW = 10;
        ctx.font = 'bold 10px monospace';
        const labelWidth = ctx.measureText(labelText).width;
        const missilesRowW = labelCharW + CONFIG.MISSILE_GROUP_SIZE * (mW + mSpacing);
        const headerW = labelWidth + labelGap + keyWidth + 4;
        return Math.max(headerW, missilesRowW) + missilePadding * 2;
    })();
    const energyBonusWidth = playerInventory.maxEnergyBonus > 0 ? 110 : 0;
    const speedWidth = playerInventory.speedBonus > 0 ? 90 : 0;
    const rightHudWidth = Math.max(
        shieldPanelWidth,
        energyCellsWidth,
        bombPanelWidth,
        missilePanelWidth,
        energyBonusWidth,
        speedWidth
    );
    const rightHudPanelX = Math.max(panelMargin, canvas.width - rightHudWidth - panelMargin);
    const shieldX = rightHudPanelX + panelPadding;
    const shieldY = panelMargin + panelPadding;

    // Shield panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(rightHudPanelX, panelMargin, shieldBarWidth + panelPadding * 2, shieldBarHeight + panelPadding * 2, 8);
    ctx.fill();

    // Shield bar background
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.roundRect(shieldX, shieldY, shieldBarWidth, shieldBarHeight, 4);
    ctx.fill();

    // Shield bar fill with gradient
    const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : finalHealth / CONFIG.UFO_START_HEALTH;
    const shieldGradient = ctx.createLinearGradient(shieldX, 0, shieldX + shieldBarWidth * healthPercent, 0);
    if (healthPercent > 0.5) {
        shieldGradient.addColorStop(0, '#0a4');
        shieldGradient.addColorStop(1, '#0f6');
    } else if (healthPercent > 0.25) {
        shieldGradient.addColorStop(0, '#a80');
        shieldGradient.addColorStop(1, '#fc0');
    } else {
        shieldGradient.addColorStop(0, '#800');
        shieldGradient.addColorStop(1, '#f33');
    }
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.roundRect(shieldX, shieldY, shieldBarWidth * healthPercent, shieldBarHeight, 4);
    ctx.fill();

    // Shield text inside bar
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHIELD', shieldX + shieldBarWidth / 2, shieldY + shieldBarHeight / 2 + 5);

    // ========== ENERGY CELLS (below shield bar) ==========
    renderEnergyCells(rightHudPanelX, shieldY + shieldBarHeight + 10);

    // ========== BOMB COUNT (below energy cells) ==========
    renderBombCount(rightHudPanelX, shieldY + shieldBarHeight + 60);

    // ========== MISSILE SWARM (below bomb count) ==========
    const missileStartY = shieldY + shieldBarHeight + 100;
    const missilePanelH = renderMissileCount(rightHudPanelX, missileStartY) || 0;
    let nextY = missileStartY + missilePanelH + 6;

    // ========== ENERGY BONUS INDICATOR (below missile count) ==========
    renderEnergyBonusIndicator(rightHudPanelX, nextY);
    nextY += 28;

    // ========== SPEED INDICATOR (below energy bonus) ==========
    renderSpeedIndicator(rightHudPanelX, nextY);
    nextY += 30;

    // ========== TOP CENTER: QUOTA PROGRESS (above harvest counter) ==========
    renderQuotaProgress();

    // ========== TOP CENTER: HARVEST COUNTER ==========
    renderHarvestCounter();

    // ========== BIO-MATTER COUNTER (below score panel) ==========
    renderBioMatterCounter(panelMargin, panelMargin + scorePanelHeight + 38);

    // ========== DRONE STATUS (below right HUD panels) ==========
    renderDroneStatus(rightHudPanelX, nextY);

    // ========== RESEARCH PROGRESS (below quota) ==========
    renderResearchProgress();

    // ========== COORDINATOR DISTRESS ARROWS ==========
    renderCoordDistressArrows();
}

function renderBioMatterCounter(startX, startY) {
    if (bioMatter <= 0 && !techTree.activeResearch && techTree.researched.size === 0) return;
    const panelPadding = 15;
    const label = `BM: ${bioMatter}`;
    ctx.font = 'bold 14px monospace';

    ctx.fillStyle = '#0a0';
    ctx.textAlign = 'left';
    ctx.fillText(label, startX + panelPadding, startY + 22);
}

function renderQuotaProgress() {
    if (quotaTarget <= 0) return;

    const panelWidth = 200;
    const panelHeight = 20;
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = 4; // Above harvest counter

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 4);
    ctx.fill();

    // Progress bar
    const barX = panelX + 3;
    const barY = panelY + 3;
    const barWidth = panelWidth - 6;
    const barHeight = panelHeight - 6;
    const progress = Math.min(1, quotaProgress / quotaTarget);

    // Color based on how on-track we are
    const waveElapsed = CONFIG.WAVE_DURATION - waveTimer;
    const expectedProgress = waveElapsed / CONFIG.WAVE_DURATION;
    let barColor;
    if (quotaProgress >= quotaTarget) {
        barColor = '#0f0'; // Met
    } else if (progress >= expectedProgress * 0.7) {
        barColor = '#0a0'; // On track
    } else if (progress >= expectedProgress * 0.4) {
        barColor = '#ca0'; // Behind
    } else {
        barColor = '#f44'; // Far behind
    }

    // Bar background
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 2);
    ctx.fill();

    // Bar fill
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * progress, barHeight, 2);
    ctx.fill();

    // Text with shadow for contrast
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    const quotaText = quotaProgress >= quotaTarget ? `QUOTA MET! ${quotaProgress}/${quotaTarget}` : `QUOTA: ${quotaProgress}/${quotaTarget}`;
    ctx.fillText(quotaText, panelX + panelWidth / 2 + 1, panelY + panelHeight / 2 + 4);
    ctx.fillStyle = '#fff';
    ctx.fillText(quotaText, panelX + panelWidth / 2, panelY + panelHeight / 2 + 3);

    // Celebration effect when quota just met
    if (quotaProgress === quotaTarget && quotaProgress > 0) {
        const pulse = Math.sin(Date.now() / 80) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(0, 255, 0, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(panelX - 1, panelY - 1, panelWidth + 2, panelHeight + 2, 5);
        ctx.stroke();
    }
}

function renderDroneStatus(startX, startY) {
    if (!harvesterUnlocked && !battleDroneUnlocked) return;
    if (droneSlots <= 0) return;

    const panelPadding = 8;
    const iconSize = 16;
    const barWidth = 50;
    const barHeight = 6;
    const rowHeight = 22;
    const headerHeight = 18;
    const rows = activeDrones.length;
    const panelWidth = iconSize + 8 + barWidth + panelPadding * 2 + 30;
    const panelHeight = headerHeight + Math.max(rows, 0) * rowHeight + panelPadding * 2;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Header
    ctx.fillStyle = '#aaa';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    const subDroneCount = activeCoordinators.reduce((sum, c) => sum + (c.subDrones ? c.subDrones.length : 0), 0);
    const totalDrones = activeDrones.length + subDroneCount;
    ctx.fillText(`DRONES: ${totalDrones}/${droneSlots}`, startX + panelPadding, startY + panelPadding + 10);

    // Each active drone
    for (let i = 0; i < activeDrones.length; i++) {
        const drone = activeDrones[i];
        const rowY = startY + panelPadding + headerHeight + i * rowHeight;

        // Drone icon (colored circle)
        const isHarvester = drone.type === 'harvester';
        const droneColor = isHarvester ? '#0f0' : '#f44';
        ctx.fillStyle = droneColor;
        ctx.beginPath();
        ctx.arc(startX + panelPadding + iconSize / 2, rowY + iconSize / 2, iconSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ccc';
        ctx.font = '9px monospace';
        ctx.fillText(isHarvester ? 'H' : 'B', startX + panelPadding + iconSize / 2 - 3, rowY + iconSize / 2 + 3);

        // Energy bar
        const energyPercent = drone.energyTimer / drone.maxEnergy;
        const ebX = startX + panelPadding + iconSize + 8;
        const ebY = rowY + iconSize / 2 - barHeight / 2;

        ctx.fillStyle = '#333';
        ctx.fillRect(ebX, ebY, barWidth, barHeight);

        let eColor;
        if (energyPercent > 0.5) eColor = '#0a0';
        else if (energyPercent > 0.2) eColor = '#ca0';
        else eColor = '#f44';

        // Flash when energy low
        if (drone.energyTimer < 5 && Math.floor(Date.now() / 300) % 2 === 0) {
            eColor = '#f00';
        }

        ctx.fillStyle = eColor;
        ctx.fillRect(ebX, ebY, barWidth * energyPercent, barHeight);

        // Time remaining
        ctx.fillStyle = '#888';
        ctx.font = '9px monospace';
        ctx.fillText(`${Math.ceil(drone.energyTimer)}s`, ebX + barWidth + 4, rowY + iconSize / 2 + 3);
    }
}

function renderCoordDistressArrows() {
    if (!ufo || activeCoordinators.length === 0) return;

    for (const coord of activeCoordinators) {
        if (!coord.alive || (coord.state !== 'LOW_ENERGY' && coord.energyTimer > coord.maxEnergy * 0.25)) continue;

        const dx = coord.x - ufo.x;
        const dy = coord.y - ufo.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) continue;

        const angle = Math.atan2(dy, dx);
        const arrowDist = 70; // Distance from UFO center
        const isHarvester = coord.type === 'harvester';
        const typeColor = isHarvester ? '0, 220, 255' : '255, 160, 50';

        // Arrow position (clamped to screen edges if coord is off-screen)
        let ax = ufo.x + Math.cos(angle) * arrowDist;
        let ay = ufo.y + Math.sin(angle) * arrowDist;
        ax = Math.max(20, Math.min(canvas.width - 20, ax));
        ay = Math.max(20, Math.min(canvas.height - 20, ay));

        const size = CONFIG.COORD_HUD_ARROW_SIZE;
        const dying = coord.energyTimer <= coord.maxEnergy * 0.10;
        const pulse = dying ? (Math.sin(Date.now() / 100) * 0.5 + 0.5) : (Math.sin(Date.now() / 300) * 0.3 + 0.7);

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);

        // Red pulsing outline
        ctx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.6, -size * 0.6);
        ctx.lineTo(-size * 0.3, 0);
        ctx.lineTo(-size * 0.6, size * 0.6);
        ctx.closePath();
        ctx.stroke();

        // Type-colored fill
        ctx.fillStyle = `rgba(${typeColor}, ${pulse * 0.8})`;
        ctx.fill();

        ctx.restore();
    }
}

function renderResearchProgress() {
    if (!techTree.activeResearch) return;

    const node = getTechNode(techTree.activeResearch.nodeId);
    if (!node) return;

    const barWidth = 260;
    const barHeight = 18;
    const panelX = (canvas.width - barWidth) / 2;
    const panelY = 100; // Below quota bar

    const progress = 1 - (techTree.activeResearch.timeRemaining / techTree.activeResearch.totalTime);
    const timeLeft = Math.ceil(techTree.activeResearch.timeRemaining);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(panelX - 4, panelY - 2, barWidth + 8, barHeight + 4, 4);
    ctx.fill();

    // Bar background
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(panelX, panelY, barWidth, barHeight);

    // Bar fill
    ctx.fillStyle = '#0a4';
    ctx.fillRect(panelX, panelY, barWidth * progress, barHeight);

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`RESEARCHING: ${node.name} ${timeLeft}s`, panelX + barWidth / 2, panelY + barHeight / 2 + 4);
}

function renderEnergyCells(startX, startY) {
    const cells = playerInventory.energyCells;
    if (cells <= 0) return; // Don't show if no cells

    const cellSize = 18;
    const spacing = 6;
    const panelPadding = 8;
    const panelWidth = (cellSize + spacing) * cells + panelPadding * 2 - spacing;
    const panelHeight = cellSize + panelPadding * 2;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 6);
    ctx.fill();

    // Draw cell icons
    for (let i = 0; i < cells; i++) {
        const x = startX + panelPadding + i * (cellSize + spacing) + cellSize / 2;
        const y = startY + panelPadding + cellSize / 2;

        // Pulsing glow effect
        const pulse = Math.sin(Date.now() / 200 + i * 0.5) * 0.3 + 0.7;

        // Outer glow
        ctx.fillStyle = `rgba(255, 85, 85, ${pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, cellSize / 2 + 3, 0, Math.PI * 2);
        ctx.fill();

        // Cell body (battery/crystal shape)
        ctx.fillStyle = `rgba(255, 85, 85, ${pulse})`;
        ctx.beginPath();
        ctx.arc(x, y, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = `rgba(255, 200, 200, ${pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, cellSize / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Label
    ctx.fillStyle = '#f55';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('REVIVE', startX + panelWidth + 5, startY + panelHeight / 2 + 4);
}

function renderBombCount(startX, startY) {
    const bombCount = playerInventory.bombs;
    const maxBombs = playerInventory.maxBombs;
    const rechargeTimers = playerInventory.bombRechargeTimers || [];
    if (maxBombs <= 0) return; // Don't show if no bombs

    const bombSize = 18;
    const spacing = 8;
    const panelPadding = 8;
    const keyWidth = 20;
    const keyHeight = 18;
    const keyPadding = 6;
    const labelText = 'BOMBS';
    const labelGap = 8;

    // Calculate total width: label + key + bombs
    const bombsWidth = (bombSize + spacing) * maxBombs - spacing;
    ctx.font = 'bold 10px monospace';
    const labelWidth = ctx.measureText(labelText).width;
    const panelWidth = labelWidth + labelGap + keyWidth + keyPadding + bombsWidth + panelPadding * 2;
    const panelHeight = Math.max(bombSize, keyHeight) + panelPadding * 2;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Label text (left of key)
    ctx.fillStyle = '#bbb';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    const labelX = startX + panelPadding;
    ctx.fillText(labelText, labelX, startY + panelHeight / 2 + 4);

    // Keyboard key badge for X (after label)
    const keyX = labelX + labelWidth + labelGap;
    const keyY = startY + (panelHeight - keyHeight) / 2;

    // Key background (raised look)
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.roundRect(keyX, keyY, keyWidth, keyHeight, 4);
    ctx.fill();

    // Key top surface
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.roundRect(keyX + 1, keyY + 1, keyWidth - 2, keyHeight - 4, 3);
    ctx.fill();

    // Key letter
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('X', keyX + keyWidth / 2, keyY + keyHeight / 2 + 3);

    // Draw bomb icons (after the key)
    const bombsStartX = keyX + keyWidth + keyPadding;
    for (let i = 0; i < maxBombs; i++) {
        const x = bombsStartX + i * (bombSize + spacing) + bombSize / 2;
        const y = startY + panelHeight / 2;
        const filled = i < bombCount;

        let scale = 1;
        if (i === playerInventory.bombReadyBounceIndex && playerInventory.bombReadyBounceTimer > 0) {
            scale = 1 + Math.sin(playerInventory.bombReadyBounceTimer * 12) * 0.18;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Bomb body
        ctx.fillStyle = filled ? '#333' : '#1a1a1a';
        ctx.beginPath();
        ctx.arc(0, 0, bombSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = filled ? '#555' : '#2a2a2a';
        ctx.beginPath();
        ctx.arc(-2, -2, bombSize / 4, 0, Math.PI * 2);
        ctx.fill();

        // Fuse spark
        if (filled) {
            const sparkIntensity = Math.sin(Date.now() / 100 + i) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, ${150 + sparkIntensity * 100}, 0, ${0.7 + sparkIntensity * 0.3})`;
            ctx.beginPath();
            ctx.arc(0, -bombSize / 2 - 2, 2 + sparkIntensity, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        const missingIndex = i - bombCount;
        if (missingIndex >= 0 && missingIndex < rechargeTimers.length) {
            const progress = 1 - (rechargeTimers[missingIndex] / CONFIG.BOMB_RECHARGE_TIME);
            ctx.strokeStyle = 'rgba(255, 200, 0, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, bombSize / 2 + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
            ctx.stroke();
        }
    }

}

function renderSpeedIndicator(startX, startY) {
    const speedBonus = playerInventory.speedBonus;
    if (speedBonus <= 0) return; // Don't show if no speed upgrades

    const panelWidth = 90;
    const panelHeight = 24;
    const bonusPercent = Math.round(speedBonus * 100);

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 4);
    ctx.fill();

    // Speed bar background
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(startX + 4, startY + 4, panelWidth - 8, panelHeight - 8, 2);
    ctx.fill();

    // Speed bar fill (proportional to bonus, max at 100% bonus for visual)
    const fillPercent = Math.min(speedBonus, 1.0);
    const gradient = ctx.createLinearGradient(startX, 0, startX + panelWidth, 0);
    gradient.addColorStop(0, '#cc0');
    gradient.addColorStop(1, '#ff0');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(startX + 4, startY + 4, (panelWidth - 8) * fillPercent, panelHeight - 8, 2);
    ctx.fill();

    // Label showing percentage
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SPEED +${bonusPercent}%`, startX + panelWidth / 2, startY + panelHeight / 2 + 4);
}

function renderEnergyBonusIndicator(startX, startY) {
    const energyBonus = playerInventory.maxEnergyBonus;
    if (energyBonus <= 0) return; // Don't show if no energy upgrades

    const panelWidth = 110;
    const panelHeight = 24;
    const bonusText = `ENERGY +${energyBonus}`;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 4);
    ctx.fill();

    // Energy bar background
    ctx.fillStyle = 'rgba(0, 200, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(startX + 4, startY + 4, panelWidth - 8, panelHeight - 8, 2);
    ctx.fill();

    // Energy bar fill (scale to 100 bonus for display)
    const fillPercent = Math.min(energyBonus / 100, 1);
    const gradient = ctx.createLinearGradient(startX, 0, startX + panelWidth, 0);
    gradient.addColorStop(0, '#0cc');
    gradient.addColorStop(1, '#6ff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(startX + 4, startY + 4, (panelWidth - 8) * fillPercent, panelHeight - 8, 2);
    ctx.fill();

    // Label showing bonus
    ctx.fillStyle = '#7ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bonusText, startX + panelWidth / 2, startY + panelHeight / 2 + 4);
}

function renderHarvestCounter() {
    const baseIconSize = 24;
    const spacing = 50;
    const totalWidth = TARGET_TYPES.length * spacing;
    const panelWidth = totalWidth + 20;
    const panelHeight = 50;
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = 26; // Below quota bar

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
    ctx.fill();

    const startX = panelX + 10 + spacing / 2;
    const baseY = panelY + 20;

    ctx.textAlign = 'center';

    for (let i = 0; i < TARGET_TYPES.length; i++) {
        const type = TARGET_TYPES[i];
        const x = startX + i * spacing;
        const count = harvestCount[type];

        // Calculate bounce effect (scale and vertical offset)
        const bounce = harvestBounce[type];
        const bounceScale = 1 + bounce * 0.5; // Scale up to 1.5x
        const bounceY = -bounce * 8; // Move up slightly
        const iconSize = baseIconSize * bounceScale;
        const y = baseY + bounceY;

        // Decay the bounce
        if (harvestBounce[type] > 0) {
            harvestBounce[type] = Math.max(0, harvestBounce[type] - 0.05);
        }

        // Draw the target icon
        const img = images[type];
        if (img && img.complete) {
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight;
            if (aspectRatio > 1) {
                drawWidth = iconSize;
                drawHeight = iconSize / aspectRatio;
            } else {
                drawHeight = iconSize;
                drawWidth = iconSize * aspectRatio;
            }
            ctx.drawImage(img, x - drawWidth / 2, y - drawHeight / 2, drawWidth, drawHeight);
        } else {
            const colors = { human: '#ffccaa', cow: '#fff', sheep: '#eee', cat: '#ff9944', dog: '#aa7744', tank: '#556b2f' };
            ctx.fillStyle = colors[type];
            if (type === 'tank') {
                ctx.fillRect(x - 10, y - 5, 20, 10);
                ctx.fillRect(x - 3, y - 10, 6, 8);
            } else {
                ctx.beginPath();
                ctx.arc(x, y, iconSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw the count below the icon (with glow when bouncing)
        if (bounce > 0.3) {
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = count > 0 ? '#0f0' : '#555';
        ctx.font = bounce > 0.3 ? 'bold 14px monospace' : 'bold 12px monospace';
        ctx.fillText(count.toString(), x, baseY + baseIconSize / 2 + 10);
        ctx.shadowBlur = 0;
    }
}

function renderActivePowerups() {
    // Match the margins from renderUI for consistent alignment
    const panelMargin = 12;
    const panelPadding = 15;
    const scorePanelHeight = 70;

    const barWidth = 175;
    const barHeight = 18;
    const barSpacing = 4;
    const startX = panelMargin + panelPadding; // Align with score text (27px)

    // Start below wave/timer line: panelMargin(12) + scorePanelHeight(70) + gap(10) + line height(~20) + gap(8)
    let y = panelMargin + scorePanelHeight + 38;

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';

    for (const [key, state] of Object.entries(activePowerups)) {
        if (!state.active) continue;

        const cfg = CONFIG.POWERUPS[key];
        let progress = 0;
        let label = '';

        if (state.timer > 0) {
            progress = state.timer / state.maxTimer;
            label = `${cfg.name} ${state.timer.toFixed(1)}s`;
        } else if (state.charges > 0) {
            progress = state.charges / state.maxCharges;
            label = `${cfg.name} x${state.charges}`;
        }

        // Background bar with rounded corners
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(startX, y, barWidth, barHeight, 4);
        ctx.fill();

        // Progress fill with rounded corners
        if (progress > 0) {
            ctx.fillStyle = cfg.color;
            ctx.beginPath();
            ctx.roundRect(startX + 2, y + 2, (barWidth - 4) * progress, barHeight - 4, 3);
            ctx.fill();

            // Pulsing effect when low
            if (progress < 0.25) {
                const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
                ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.4})`;
                ctx.beginPath();
                ctx.roundRect(startX + 2, y + 2, (barWidth - 4) * progress, barHeight - 4, 3);
                ctx.fill();
            }
        }

        // Label (with shadow for readability)
        ctx.fillStyle = '#000';
        ctx.fillText(label, startX + 6, y + barHeight - 5);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, startX + 5, y + barHeight - 6);

        y += barHeight + barSpacing;
    }
}

function updateTitleUfo() {
    const ufoWidth = 120;
    const ufoHeight = 60;

    // Initialize position if needed
    if (titleUfo.baseY === 0) {
        titleUfo.baseY = canvas.height * 0.08;  // Move UFO higher (was /6 = 16.7%, now 8%)
        titleUfo.x = canvas.width / 2;  // Start centered so humans have time to walk before abduction
        titleUfo.y = titleUfo.baseY;
    }

    // Horizontal movement - drift side to side
    titleUfo.x += titleUfo.vx;
    if (titleUfo.x > canvas.width - ufoWidth / 2 - 50) {
        titleUfo.vx = -Math.abs(titleUfo.vx);
    } else if (titleUfo.x < ufoWidth / 2 + 50) {
        titleUfo.vx = Math.abs(titleUfo.vx);
    }

    // Vertical floating (bobbing up and down)
    titleUfo.hoverPhase += 0.03;
    titleUfo.y = titleUfo.baseY + Math.sin(titleUfo.hoverPhase) * 15;

    // Beam rotation for spiral effect
    titleUfo.beamRotation += 0.05;

    // Toggle beam on/off periodically
    titleUfo.beamTimer++;
    const humanBeingAbducted = titleHumans.some(h => h.beingAbducted);

    if (humanBeingAbducted) {
        // Force beam on during abduction to prevent flickering
        titleUfo.beamActive = true;
        titleUfo.beamTimer = 0;
    } else if (titleUfo.beamTimer > 120) { // Every ~2 seconds at 60fps
        titleUfo.beamActive = !titleUfo.beamActive;
        titleUfo.beamTimer = 0;
    }
}

function updateTitleHumans() {
    const groundY = canvas.height - 60;
    const humanWidth = 60;
    const humanHeight = 90;
    const ufoHeight = 60;
    const beamBottomWidth = 150;

    // Spawn humans from sides periodically (keep 2-4 humans on screen)
    const activeHumans = titleHumans.filter(h => !h.beingAbducted).length;
    if (activeHumans < 3 && Math.random() < 0.01) {
        // Spawn from left or right edge
        const fromLeft = Math.random() < 0.5;
        titleHumans.push({
            x: fromLeft ? -humanWidth : canvas.width,
            y: groundY - humanHeight,
            width: humanWidth,
            height: humanHeight,
            beingAbducted: false,
            abductionProgress: 0,
            direction: fromLeft ? 1 : -1,
            walkSpeed: 0.8 + Math.random() * 0.6, // Vary walking speed slightly
            animationOffset: Math.random() * 10000
        });
    }

    // Update each human
    for (let i = titleHumans.length - 1; i >= 0; i--) {
        const human = titleHumans[i];

        if (human.beingAbducted) {
            // Rise toward UFO
            const targetY = titleUfo.y + ufoHeight / 2;
            const targetX = titleUfo.x - human.width / 2;
            const riseSpeed = 120; // pixels per second equivalent

            // Store starting Y position when first abducted
            if (human.startY === undefined) {
                human.startY = human.y;
            }

            // Move upward
            human.y -= riseSpeed / 60; // Assuming ~60fps

            // Move horizontally toward beam center
            const dx = targetX - human.x;
            if (Math.abs(dx) > 1) {
                human.x += Math.sign(dx) * 2;
            }

            // Calculate abduction progress (0 to 1) based on vertical position
            const totalDistance = human.startY - targetY;
            const traveled = human.startY - human.y;
            human.abductionProgress = Math.min(1, traveled / totalDistance);

            // Remove when reached UFO
            if (human.y <= targetY) {
                titleHumans.splice(i, 1);
            }
        } else {
            // Walk across the screen
            const speed = human.walkSpeed || 1;
            human.x += human.direction * speed;

            // Remove human when they walk off the opposite edge
            if (human.direction > 0 && human.x > canvas.width + human.width) {
                titleHumans.splice(i, 1);
                continue;
            } else if (human.direction < 0 && human.x < -human.width * 2) {
                titleHumans.splice(i, 1);
                continue;
            }

            // Check if under the beam and beam is active
            if (titleUfo.beamActive) {
                const humanCenterX = human.x + human.width / 2;
                const beamLeft = titleUfo.x - beamBottomWidth / 2;
                const beamRight = titleUfo.x + beamBottomWidth / 2;

                if (humanCenterX > beamLeft && humanCenterX < beamRight) {
                    human.beingAbducted = true;
                }
            }
        }
    }
}

function renderTitleHumans() {
    for (const human of titleHumans) {
        const img = getAssetImage('human', human.animationOffset);
        if (img && img.complete) {
            ctx.save();

            if (human.beingAbducted) {
                // Apply spin and shrink effect (same as game mode)
                const progress = human.abductionProgress || 0;
                const eased = progress * progress;
                const spinSpeed = 0.1 + eased * 0.5;
                const angle = (Date.now() / 1000) * spinSpeed * Math.PI * 2;
                const scale = 1 - eased * 0.35;
                const centerX = human.x + human.width / 2;
                const centerY = human.y + human.height / 2;

                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                ctx.scale(scale, scale);
                ctx.translate(-centerX, -centerY);
                ctx.drawImage(img, human.x, human.y, human.width, human.height);
            } else if (human.direction < 0) {
                ctx.translate(human.x + human.width, human.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, human.width, human.height);
            } else {
                ctx.drawImage(img, human.x, human.y, human.width, human.height);
            }
            ctx.restore();
        } else {
            // Fallback placeholder
            ctx.fillStyle = '#ffccaa';
            ctx.fillRect(human.x, human.y, human.width, human.height);
        }
    }
}

function renderTitleUfoBeam() {
    const ufoHeight = 60;
    const beamTop = titleUfo.y + ufoHeight / 2;
    const beamBottom = canvas.height - 60;
    const beamTopWidth = 20;
    const beamBottomWidth = 150;
    const beamHeight = beamBottom - beamTop;

    ctx.save();

    // Main beam cone with gradient
    const gradient = ctx.createLinearGradient(0, beamTop, 0, beamBottom);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.2)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(titleUfo.x - beamTopWidth / 2, beamTop);
    ctx.lineTo(titleUfo.x + beamTopWidth / 2, beamTop);
    ctx.lineTo(titleUfo.x + beamBottomWidth / 2, beamBottom);
    ctx.lineTo(titleUfo.x - beamBottomWidth / 2, beamBottom);
    ctx.closePath();
    ctx.fill();

    // Spiral effect
    const spiralSegments = 20;
    const spiralTurns = 3;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= spiralSegments; i++) {
        const t = i / spiralSegments;
        const y = beamTop + beamHeight * t;
        const widthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
        const angle = t * spiralTurns * Math.PI * 2 + titleUfo.beamRotation;
        const x = titleUfo.x + Math.sin(angle) * (widthAtY / 2 - 5);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Second spiral (offset)
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
    ctx.beginPath();
    for (let i = 0; i <= spiralSegments; i++) {
        const t = i / spiralSegments;
        const y = beamTop + beamHeight * t;
        const widthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
        const angle = t * spiralTurns * Math.PI * 2 + titleUfo.beamRotation + Math.PI;
        const x = titleUfo.x + Math.sin(angle) * (widthAtY / 2 - 5);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Sparkle particles along edges
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
        const t = (i / sparkleCount + titleUfo.beamRotation * 0.1) % 1;
        const y = beamTop + beamHeight * t;
        const widthAtY = beamTopWidth + (beamBottomWidth - beamTopWidth) * t;
        const side = Math.sin(titleUfo.beamRotation * 3 + i) > 0 ? 1 : -1;
        const x = titleUfo.x + side * (widthAtY / 2);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Edge glow
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(titleUfo.x - beamTopWidth / 2, beamTop);
    ctx.lineTo(titleUfo.x - beamBottomWidth / 2, beamBottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(titleUfo.x + beamTopWidth / 2, beamTop);
    ctx.lineTo(titleUfo.x + beamBottomWidth / 2, beamBottom);
    ctx.stroke();

    ctx.restore();
}

function renderTitleUfo() {
    const ufoWidth = 120;
    const ufoHeight = 60;
    const drawX = titleUfo.x - ufoWidth / 2;
    const drawY = titleUfo.y - ufoHeight / 2;

    // Render beam first (behind UFO)
    if (titleUfo.beamActive) {
        renderTitleUfoBeam();
    }

    // Render UFO with slight glow
    ctx.save();
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 20;

    if (images.ufo && images.ufo.complete) {
        ctx.drawImage(images.ufo, drawX, drawY, ufoWidth, ufoHeight);
    } else {
        // Fallback placeholder
        ctx.fillStyle = '#888';
        ctx.fillRect(drawX, drawY, ufoWidth, ufoHeight);
        ctx.fillStyle = '#0ff';
        ctx.fillRect(drawX + 10, drawY + 10, ufoWidth - 20, ufoHeight - 20);
    }
    ctx.restore();
}

// ============================================
// NAME ENTRY CELEBRATION SYSTEM
// ============================================

function initNameEntryUfo() {
    nameEntryUfo.x = canvas.width / 2;
    nameEntryUfo.baseY = canvas.height / 8;
    nameEntryUfo.y = nameEntryUfo.baseY;
    nameEntryUfo.hoverPhase = 0;
    nameEntryUfo.pulsePhase = 0;
    nameEntryUfo.glowIntensity = 0;
    nameEntryUfo.initialized = true;
    celebrationTimer = 0;
    confettiSpawnTimer = 0;
}

function updateNameEntryUfo(dt) {
    if (!nameEntryUfo.initialized) {
        initNameEntryUfo();
    }

    // Gentle hovering motion
    nameEntryUfo.hoverPhase += 2 * dt;
    nameEntryUfo.y = nameEntryUfo.baseY + Math.sin(nameEntryUfo.hoverPhase) * 12;

    // Pulsing glow effect
    nameEntryUfo.pulsePhase += 4 * dt;
    nameEntryUfo.glowIntensity = 0.5 + Math.sin(nameEntryUfo.pulsePhase) * 0.3;

    // Update celebration timer
    celebrationTimer += dt;
    confettiSpawnTimer += dt;

    // Spawn confetti periodically
    if (confettiSpawnTimer > 0.08) {
        confettiSpawnTimer = 0;
        spawnCelebrationConfetti();
    }
}

function spawnCelebrationConfetti() {
    // Confetti colors - bright and joyful
    const confettiColors = [
        'rgb(255, 215, 0)',   // Gold
        'rgb(255, 0, 128)',   // Hot pink
        'rgb(0, 255, 255)',   // Cyan
        'rgb(255, 255, 0)',   // Yellow
        'rgb(128, 0, 255)',   // Purple
        'rgb(0, 255, 128)',   // Mint
        'rgb(255, 128, 0)',   // Orange
    ];

    // Spawn from random positions along the top
    const x = Math.random() * canvas.width;
    const y = -10;

    // Gentle falling with some horizontal drift
    const vx = (Math.random() - 0.5) * 60;
    const vy = 80 + Math.random() * 60;

    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const size = 3 + Math.random() * 5;
    const lifetime = 3 + Math.random() * 2;

    particles.push(new Particle(x, y, vx, vy, color, size, lifetime));

    // Also spawn some sparkles around the UFO
    if (Math.random() < 0.3 && nameEntryUfo.initialized) {
        const sparkleX = nameEntryUfo.x + (Math.random() - 0.5) * 200;
        const sparkleY = nameEntryUfo.y + (Math.random() - 0.5) * 80;
        const sparkleVx = (Math.random() - 0.5) * 40;
        const sparkleVy = -20 - Math.random() * 30;
        const sparkleColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        particles.push(new Particle(sparkleX, sparkleY, sparkleVx, sparkleVy, sparkleColor, 2 + Math.random() * 3, 0.8));
    }
}

function renderNameEntryUfo() {
    if (!nameEntryUfo.initialized) return;

    const ufoWidth = 180;  // Bigger than title UFO!
    const ufoHeight = 90;
    const drawX = nameEntryUfo.x - ufoWidth / 2;
    const drawY = nameEntryUfo.y - ufoHeight / 2;

    ctx.save();

    // Rainbow cycling glow effect
    const hue = (celebrationTimer * 60) % 360;
    const glowColor = `hsla(${hue}, 100%, 60%, ${nameEntryUfo.glowIntensity})`;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 40 + Math.sin(nameEntryUfo.pulsePhase * 2) * 15;

    // Draw the UFO
    if (images.ufo && images.ufo.complete) {
        ctx.drawImage(images.ufo, drawX, drawY, ufoWidth, ufoHeight);
    } else {
        // Fallback placeholder
        ctx.fillStyle = '#888';
        ctx.fillRect(drawX, drawY, ufoWidth, ufoHeight);
        ctx.fillStyle = '#0ff';
        ctx.fillRect(drawX + 10, drawY + 10, ufoWidth - 20, ufoHeight - 20);
    }

    ctx.restore();

    // Draw celebratory light beams emanating from UFO
    renderCelebrationBeams();
}

function renderCelebrationBeams() {
    const beamCount = 8;
    const centerX = nameEntryUfo.x;
    const centerY = nameEntryUfo.y + 30;

    ctx.save();

    for (let i = 0; i < beamCount; i++) {
        const baseAngle = (i / beamCount) * Math.PI * 2;
        const angle = baseAngle + celebrationTimer * 0.5;
        const length = 60 + Math.sin(celebrationTimer * 3 + i) * 20;

        const hue = (celebrationTimer * 50 + i * 45) % 360;
        const alpha = 0.3 + Math.sin(celebrationTimer * 4 + i * 0.5) * 0.2;

        const gradient = ctx.createLinearGradient(
            centerX, centerY,
            centerX + Math.cos(angle) * length,
            centerY + Math.sin(angle) * length
        );
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
        ctx.stroke();
    }

    ctx.restore();
}

function renderNameEntryScreen() {
    renderBackground();

    // Update and render the celebratory UFO
    updateNameEntryUfo(1/60);  // Approximate dt

    // Render the big celebratory UFO floating above the text
    renderNameEntryUfo();

    // Animated "NEW HIGH SCORE!" text with rainbow colors and wave effect
    const titleText = 'NEW HIGH SCORE!';
    const titleY = canvas.height / 4 + 30;  // Positioned below UFO
    const titleX = canvas.width / 2;

    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';

    // Measure total width to center letters
    const totalWidth = ctx.measureText(titleText).width;
    let currentX = titleX - totalWidth / 2;

    // Draw pulsing glow behind text
    const glowPulse = Math.sin(celebrationTimer * 3) * 0.3 + 0.7;
    ctx.save();
    ctx.shadowColor = `rgba(255, 215, 0, ${glowPulse})`;
    ctx.shadowBlur = 30 + Math.sin(celebrationTimer * 2) * 10;
    ctx.fillStyle = 'transparent';
    ctx.fillText(titleText, titleX, titleY);
    ctx.restore();

    // Draw each letter with rainbow color and wave effect
    ctx.textAlign = 'left';
    for (let i = 0; i < titleText.length; i++) {
        const char = titleText[i];
        const charWidth = ctx.measureText(char).width;

        // Rainbow color cycling
        const hue = (celebrationTimer * 80 + i * 25) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;

        // Wavy vertical offset
        const waveOffset = Math.sin(celebrationTimer * 4 + i * 0.5) * 8;

        // Add glow matching letter color
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 15;

        ctx.fillText(char, currentX, titleY + waveOffset);
        currentX += charWidth;
    }

    // Reset styles
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';

    // Score display with golden glow
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`SCORE: ${finalScore.toLocaleString()}`, canvas.width / 2, canvas.height / 4 + 85);
    ctx.restore();

    // Show potential rank with pulsing effect
    const potentialRank = leaderboard.filter(e => e.score > finalScore).length + 1;
    const rankPulse = 0.8 + Math.sin(celebrationTimer * 5) * 0.2;
    ctx.save();
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 15 * rankPulse;
    ctx.fillStyle = `rgba(0, 255, 0, ${rankPulse})`;
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`RANK #${potentialRank}`, canvas.width / 2, canvas.height / 4 + 125);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('ENTER YOUR NAME', canvas.width / 2, canvas.height / 2 - 70);

    // Draw the 3 letter slots
    const slotWidth = 60;
    const startX = canvas.width / 2 - slotWidth;
    const y = canvas.height / 2 + 20;

    for (let i = 0; i < 3; i++) {
        const x = startX + i * slotWidth;

        // Highlight current position
        if (i === nameEntryPosition) {
            ctx.fillStyle = '#0ff';
            // Draw selection arrows (vertically centered around letter)
            ctx.font = 'bold 24px monospace';
            ctx.fillText('▲', x, y - 50);
            ctx.fillText('▼', x, y + 28);
        } else {
            ctx.fillStyle = '#fff';
        }

        ctx.font = 'bold 48px monospace';
        ctx.fillText(nameEntryChars[i], x, y);
    }

    // Big SUBMIT button below letter slots
    const submitButtonY = canvas.height / 2 + 100;
    const submitButtonWidth = 180;
    const submitButtonHeight = 50;
    const submitButtonX = canvas.width / 2 - submitButtonWidth / 2;

    // Store bounds for click detection
    nameEntrySubmitBounds = { x: submitButtonX, y: submitButtonY, width: submitButtonWidth, height: submitButtonHeight };

    // Button background with gradient effect (dimmed when submitting)
    ctx.fillStyle = scoreSubmitting ? '#064' : '#0a0';
    ctx.beginPath();
    ctx.roundRect(submitButtonX, submitButtonY, submitButtonWidth, submitButtonHeight, 8);
    ctx.fill();

    // Button border
    ctx.strokeStyle = scoreSubmitting ? '#088' : '#0f0';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Button highlight (top edge for 3D effect)
    ctx.strokeStyle = scoreSubmitting ? '#0aa' : '#4f4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(submitButtonX + 8, submitButtonY + 2);
    ctx.lineTo(submitButtonX + submitButtonWidth - 8, submitButtonY + 2);
    ctx.stroke();

    // Button text
    ctx.fillStyle = scoreSubmitting ? '#aaa' : '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(scoreSubmitting ? 'SUBMITTING...' : 'SUBMIT', canvas.width / 2, submitButtonY + 33);

    // Show submission error if any
    if (submissionError) {
        ctx.fillStyle = '#f55';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(submissionError, canvas.width / 2, canvas.height - 140);
    }

    // Instructions with styled keyboard keys
    const instructY = canvas.height - 100;
    const fontSize = 18;
    const keyPadding = 6;
    const keyHeight = fontSize + keyPadding * 2;
    const keyRadius = 5;

    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'middle';

    // Helper function to draw a keyboard key
    function drawKey(text, centerX, centerY) {
        const textWidth = ctx.measureText(text).width;
        const keyWidth = textWidth + keyPadding * 2;
        const keyX = centerX - keyWidth / 2;
        const keyY = centerY - keyHeight / 2;

        // Key background
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(keyX, keyY, keyWidth, keyHeight, keyRadius);
        ctx.fill();

        // Key border
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Key highlight (top edge for 3D effect)
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(keyX + keyRadius, keyY + 1);
        ctx.lineTo(keyX + keyWidth - keyRadius, keyY + 1);
        ctx.stroke();

        // Key text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(text, centerX, centerY);

        return keyWidth;
    }

    // Calculate total width for centering
    const keyGap = 8; // Padding around keyboard keys
    const sectionGap = 24; // Gap between instruction sections

    const upDownWidth = ctx.measureText('↑↓').width + keyPadding * 2;
    const changeLetterText = 'Change Letter';
    const changeLetterWidth = ctx.measureText(changeLetterText).width;
    const leftRightWidth = ctx.measureText('←→').width + keyPadding * 2;
    const moveText = 'Move';
    const moveWidth = ctx.measureText(moveText).width;
    const enterWidth = ctx.measureText('ENTER').width + keyPadding * 2;
    const submitText = 'Submit';
    const submitWidth = ctx.measureText(submitText).width;

    const instructTotalWidth = upDownWidth + keyGap + changeLetterWidth + sectionGap +
                               leftRightWidth + keyGap + moveWidth + sectionGap +
                               enterWidth + keyGap + submitWidth;
    let instructX = canvas.width / 2 - instructTotalWidth / 2;

    // Draw ↑↓ key
    instructX += upDownWidth / 2;
    drawKey('↑↓', instructX, instructY);
    instructX += upDownWidth / 2 + keyGap;

    // Draw "Change Letter"
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(changeLetterText, instructX, instructY);
    instructX += changeLetterWidth + sectionGap;

    // Draw ←→ key
    instructX += leftRightWidth / 2;
    drawKey('←→', instructX, instructY);
    instructX += leftRightWidth / 2 + keyGap;

    // Draw "Move"
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(moveText, instructX, instructY);
    instructX += moveWidth + sectionGap;

    // Draw ENTER key
    instructX += enterWidth / 2;
    drawKey('ENTER', instructX, instructY);
    instructX += enterWidth / 2 + keyGap;

    // Draw "Submit"
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(submitText, instructX, instructY);

    ctx.textBaseline = 'alphabetic';
}

function getChangelogSorted() {
    if (typeof CHANGELOG === 'undefined' || !CHANGELOG || CHANGELOG.length === 0) {
        return [];
    }
    // Sort by timestamp descending (newest first)
    return [...CHANGELOG].sort((a, b) => b.timestamp - a.timestamp);
}

function wrapTextToLines(text, maxWidth, font) {
    ctx.font = font;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

function getDayLabel(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);

    // Reset to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const entryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - entryDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    // Format as "Jan 15, 2025" (always show year)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[date.getMonth()];
    const day = date.getDate();

    return `${monthName} ${day}, ${date.getFullYear()}`;
}

function renderChangelogPanel() {
    // Content starts below tabs (tabs at canvas.height * 0.20 + 80, height 32)
    const contentStartY = canvas.height * 0.20 + 130;

    const entries = getChangelogSorted();
    if (entries.length === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No changelog entries yet', canvas.width / 2, contentStartY + 50);
        return;
    }

    // Panel dimensions and position (centered, same width as leaderboard)
    const panelWidth = 500;
    const panelPadding = 16;
    const messageFont = '14px monospace';
    const lineHeight = 18;
    const entryVerticalPadding = 8; // Padding added to each entry's height
    const dayHeaderHeight = 42; // Space for date label + padding above and below

    // Calculate panel position and max height to avoid overlapping green ground area
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = contentStartY;
    const groundHeight = 60;
    const bottomPadding = 20; // Gap between panel bottom and green ground area
    const maxPanelBottom = canvas.height - groundHeight - bottomPadding;
    const maxContentHeight = maxPanelBottom - panelY - panelPadding;

    // Group entries by day
    const contentWidth = panelWidth - (panelPadding * 2);
    const dayGroups = [];
    let currentDayLabel = null;

    for (const entry of entries) {
        const dayLabel = getDayLabel(entry.timestamp);
        const lines = wrapTextToLines(`★ ${entry.message}`, contentWidth, messageFont);
        const entryHeight = (lines.length * lineHeight) + entryVerticalPadding;

        if (dayLabel !== currentDayLabel) {
            dayGroups.push({
                type: 'header',
                label: dayLabel,
                height: dayHeaderHeight
            });
            currentDayLabel = dayLabel;
        }

        dayGroups.push({
            type: 'entry',
            entry: { ...entry, lines },
            height: entryHeight
        });
    }

    // Calculate total content height
    const totalContentHeight = dayGroups.reduce((sum, item) => sum + item.height, 0);
    const panelHeight = Math.min(maxContentHeight, totalContentHeight) + panelPadding;

    // Store panel bounds for mouse wheel hit testing
    changelogPanelBounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };

    // Clamp scroll offset
    const maxScroll = Math.max(0, totalContentHeight - maxContentHeight);
    changelogScrollOffset = Math.max(0, Math.min(changelogScrollOffset, maxScroll));

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Panel border
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Set up clipping region for scrollable content
    const contentTop = panelY;
    const contentBottom = panelY + panelHeight;
    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX, contentTop, panelWidth, contentBottom - contentTop);
    ctx.clip();

    // Render grouped entries with scroll offset
    const initialTopPadding = 8; // Padding above first date header
    let currentY = contentTop + initialTopPadding - changelogScrollOffset;
    let entryIndex = 0;

    let isFirstHeader = true;
    for (const item of dayGroups) {
        if (item.type === 'header') {
            // Day header
            if (currentY + item.height > contentTop - 20 && currentY < contentBottom + 20) {
                // Draw horizontal divider line above day section (edge to edge)
                if (!isFirstHeader) {
                    ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(panelX, currentY);
                    ctx.lineTo(panelX + panelWidth, currentY);
                    ctx.stroke();
                }

                // Day label - positioned consistently within the header height
                ctx.fillStyle = '#0aa';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(item.label, panelX + panelPadding, currentY + 22);
            }
            currentY += item.height;
            isFirstHeader = false;
        } else {
            // Entry
            const entry = item.entry;

            // Only render if visible
            if (currentY + item.height > contentTop - 20 && currentY < contentBottom + 20) {
                // Entry text color based on index
                if (entryIndex === 0) {
                    ctx.fillStyle = '#ddd';
                } else if (entryIndex < 3) {
                    ctx.fillStyle = '#aaa';
                } else if (entryIndex < 6) {
                    ctx.fillStyle = '#888';
                } else {
                    ctx.fillStyle = '#666';
                }

                // Draw wrapped message lines
                ctx.font = messageFont;
                ctx.textAlign = 'left';
                for (let j = 0; j < entry.lines.length; j++) {
                    ctx.fillText(entry.lines[j], panelX + panelPadding, currentY + (j * lineHeight) + 12);
                }
            }

            currentY += item.height;
            entryIndex++;
        }
    }

    ctx.restore();

    // Scroll indicator (if scrollable)
    if (maxScroll > 0) {
        const scrollbarHeight = Math.max(30, (maxContentHeight / totalContentHeight) * maxContentHeight);
        const scrollbarY = contentTop + (changelogScrollOffset / maxScroll) * (maxContentHeight - scrollbarHeight);

        ctx.fillStyle = 'rgba(0, 200, 200, 0.3)';
        ctx.fillRect(panelX + panelWidth - 6, scrollbarY, 4, scrollbarHeight);
    }

    // Reset text align
    ctx.textAlign = 'center';
}

function renderTitleScreen() {
    renderBackground();

    // Update UFO first so humans use correct position for spawning and beam detection
    updateTitleUfo();

    // Update and render title screen humans
    updateTitleHumans();
    renderTitleHumans();

    // Render UFO (after humans so it appears on top)
    renderTitleUfo();

    // Animated title rendering
    titleAnimPhase += 0.05;

    const titleText = 'ALIEN ABDUCTO-RAMA';
    const titleY = canvas.height * 0.20;  // Move title higher (was /3 = 33%, now 20%)
    const titleX = canvas.width / 2;

    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';

    // Measure total width to center letters properly
    const totalWidth = ctx.measureText(titleText).width;
    let currentX = titleX - totalWidth / 2;

    // Pulsing glow effect behind title
    const glowPulse = Math.sin(titleAnimPhase * 0.5) * 0.3 + 0.7;
    ctx.save();
    ctx.shadowColor = `rgba(0, 255, 255, ${glowPulse})`;
    ctx.shadowBlur = 30 + Math.sin(titleAnimPhase) * 15;
    ctx.fillStyle = 'transparent';
    ctx.fillText(titleText, titleX, titleY);
    ctx.restore();

    // Draw each letter with rainbow color and wave effect
    ctx.textAlign = 'left';
    for (let i = 0; i < titleText.length; i++) {
        const char = titleText[i];
        const charWidth = ctx.measureText(char).width;

        // Rainbow color cycling - each letter offset in hue
        const hue = (titleAnimPhase * 50 + i * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;

        // Wavy vertical offset - each letter bobs at different phase
        const waveOffset = Math.sin(titleAnimPhase * 2 + i * 0.4) * 12;

        // Add glow matching letter color
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 20;

        ctx.fillText(char, currentX, titleY + waveOffset);
        currentX += charWidth;
    }

    // Reset styles for other text
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';

    // Activity stats (below title, visible on all tabs)
    const activityStatsY = titleY + 55;
    if (activityStats) {
        ctx.fillStyle = '#888';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        const lastPlayed = activityStats.lastGamePlayed
            ? `Last played: ${formatRelativeDate(activityStats.lastGamePlayed)}`
            : '';
        const gamesWeek = `${activityStats.gamesThisWeek} ${activityStats.gamesThisWeek === 1 ? 'game' : 'games'} played this week`;
        const statsText = lastPlayed ? `${lastPlayed}  •  ${gamesWeek}` : gamesWeek;
        ctx.fillText(statsText, canvas.width / 2, activityStatsY);
    }

    // Render tabs
    renderTitleTabs();

    // Render content based on active tab
    switch (titleTab) {
        case 'leaderboard':
            renderLeaderboardContent();
            break;
        case 'changelog':
            renderChangelogPanel();
            break;
        case 'feedback':
            renderFeedbackTabContent();
            break;
    }

    // Press SPACE to start (at bottom) - with flashing effect
    const flashAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.5; // Flash between 0 and 1
    ctx.save();
    ctx.globalAlpha = flashAlpha;

    const fontSize = 20;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = canvas.width / 2;
    const groundHeight = 60;
    const centerY = canvas.height - groundHeight / 2; // Center vertically in the green ground area

    // Measure text parts
    const pressText = 'Press ';
    const spaceText = 'SPACE';
    const toStartText = ' to start';

    ctx.font = `bold ${fontSize}px monospace`;
    const pressWidth = ctx.measureText(pressText).width;
    const spaceWidth = ctx.measureText(spaceText).width;
    const toStartWidth = ctx.measureText(toStartText).width;
    const promptWidth = pressWidth + spaceWidth + toStartWidth;

    // Calculate starting X position
    const startX = centerX - promptWidth / 2;

    // Draw "Press "
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(pressText, startX, centerY);

    // Draw rounded rectangle around SPACE (like a spacebar key)
    const keyPadding = 8;
    const keyHeight = fontSize + keyPadding * 2;
    const keyWidth = spaceWidth + keyPadding * 2;
    const keyX = startX + pressWidth - keyPadding;
    const keyY = centerY - keyHeight / 2;
    const keyRadius = 6;

    // Key background
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(keyX, keyY, keyWidth, keyHeight, keyRadius);
    ctx.fill();

    // Key border
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Key highlight (top edge for 3D effect)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(keyX + keyRadius, keyY + 1);
    ctx.lineTo(keyX + keyWidth - keyRadius, keyY + 1);
    ctx.stroke();

    // Draw "SPACE" text
    ctx.fillStyle = '#fff';
    ctx.fillText(spaceText, startX + pressWidth, centerY);

    // Draw " to start"
    ctx.fillText(toStartText, startX + pressWidth + spaceWidth, centerY);

    ctx.restore();

    // Render feature request modal on top if open
    if (featureModalOpen) {
        renderFeatureModal();
    }
}

function renderFeatureModal() {
    // Dark overlay across entire screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Modal dimensions
    const modalWidth = 450;
    const modalHeight = 220;
    const modalX = (canvas.width - modalWidth) / 2;
    const modalY = (canvas.height - modalHeight) / 2;
    const padding = 20;

    // Modal background (same style as feedback panels)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.beginPath();
    ctx.roundRect(modalX, modalY, modalWidth, modalHeight, 8);
    ctx.fill();

    // Modal border (cyan like other panels)
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Request a Feature', canvas.width / 2, modalY + padding + 14);

    // Divider below title
    const dividerY = modalY + padding + 28;
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(modalX, dividerY);
    ctx.lineTo(modalX + modalWidth, dividerY);
    ctx.stroke();

    // Text input area
    const inputX = modalX + padding;
    const inputY = dividerY + 15;
    const inputWidth = modalWidth - padding * 2;
    const inputHeight = 70;

    // Input background
    ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
    ctx.beginPath();
    ctx.roundRect(inputX, inputY, inputWidth, inputHeight, 4);
    ctx.fill();

    // Input border
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Input text with word wrap
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    const maxCharsPerLine = Math.floor((inputWidth - 16) / 8.4);
    const lines = [];
    let remainingText = featureModalText;
    while (remainingText.length > 0) {
        lines.push(remainingText.substring(0, maxCharsPerLine));
        remainingText = remainingText.substring(maxCharsPerLine);
    }
    if (lines.length === 0) lines.push('');

    for (let i = 0; i < Math.min(lines.length, 3); i++) {
        ctx.fillText(lines[i], inputX + 8, inputY + 20 + i * 18);
    }

    // Blinking cursor
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        const cursorLine = Math.floor(featureModalCursorPosition / maxCharsPerLine);
        const cursorCol = featureModalCursorPosition % maxCharsPerLine;
        const cursorX = inputX + 8 + cursorCol * 8.4;
        const cursorY = inputY + 8 + cursorLine * 18;
        ctx.fillStyle = '#0ff';
        ctx.fillRect(cursorX, cursorY, 2, 16);
    }

    // Character count
    ctx.fillStyle = featureModalText.length > 300 ? '#f44' : '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${featureModalText.length}/300`, modalX + modalWidth - padding, inputY + inputHeight + 16);

    // Error message
    if (featureModalError) {
        ctx.fillStyle = '#f44';
        ctx.font = '13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(featureModalError, canvas.width / 2, inputY + inputHeight + 16);
    }

    // Buttons
    const buttonY = modalY + modalHeight - padding - 32;
    const buttonHeight = 32;
    const buttonWidth = 120;
    const buttonGap = 20;

    // Cancel button (left)
    const cancelX = canvas.width / 2 - buttonGap / 2 - buttonWidth;
    featureModalButtonBounds.cancel = { x: cancelX, y: buttonY, width: buttonWidth, height: buttonHeight };

    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.roundRect(cancelX, buttonY, buttonWidth, buttonHeight, 6);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#aaa';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Cancel', cancelX + buttonWidth / 2, buttonY + 21);

    // Submit button (right)
    const submitX = canvas.width / 2 + buttonGap / 2;
    featureModalButtonBounds.submit = { x: submitX, y: buttonY, width: buttonWidth, height: buttonHeight };

    ctx.fillStyle = featureModalSubmitting ? 'rgba(0, 80, 0, 0.8)' : 'rgba(0, 50, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(submitX, buttonY, buttonWidth, buttonHeight, 6);
    ctx.fill();
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(featureModalSubmitting ? 'Sending...' : 'Submit', submitX + buttonWidth / 2, buttonY + 21);
}

function renderTitleTabs() {
    titleTabBounds = [];

    const tabs = [
        { id: 'leaderboard', label: 'Leaderboard' },
        { id: 'changelog', label: 'Changelog' },
        { id: 'feedback', label: 'Feedback' }
    ];

    const tabHeight = 36;
    const tabGap = 10;
    const tabPadding = 16; // Horizontal padding inside tab
    const labelFont = 'bold 15px monospace';
    const badgeFont = 'bold 11px monospace';
    const badgeHeight = 18;
    const badgePadding = 8; // Horizontal padding inside badge
    const labelBadgeGap = 8; // Space between label and badge

    // Position tabs below title (20%) and activity stats, with spacing
    const tabY = canvas.height * 0.20 + 80;

    // Determine badges for each tab
    const tabBadges = tabs.map(tab => {
        if (tab.id === 'changelog') {
            const hasNewChangelog = typeof CHANGELOG !== 'undefined' && CHANGELOG.length > 0 &&
                CHANGELOG.some(entry => entry.timestamp > changelogLastViewed);
            if (hasNewChangelog) {
                return { text: 'NEW!', bgColor: '#0f0', textColor: '#000' };
            }
        }
        if (tab.id === 'feedback' && feedbackData && feedbackData.stats && feedbackData.stats.averageRatings) {
            const ratings = feedbackData.stats.averageRatings;
            const enjoyment = parseFloat(ratings.enjoyment) || 0;
            const difficulty = parseFloat(ratings.difficulty) || 0;
            const returnIntent = parseFloat(ratings.returnIntent) || 0;
            const avgScore = (enjoyment + difficulty + returnIntent) / 3;
            if (avgScore > 0) {
                return { text: avgScore.toFixed(1), bgColor: '#ff0', textColor: '#000' };
            }
        }
        return null;
    });

    // Calculate widths for each tab
    const tabWidths = tabs.map((tab, i) => {
        ctx.font = labelFont;
        let width = ctx.measureText(tab.label).width + tabPadding * 2;
        const badge = tabBadges[i];
        if (badge) {
            ctx.font = badgeFont;
            const badgeWidth = ctx.measureText(badge.text).width + badgePadding;
            width += labelBadgeGap + badgeWidth;
        }
        return width;
    });

    const totalWidth = tabWidths.reduce((sum, w) => sum + w, 0) + (tabs.length - 1) * tabGap;
    let currentX = canvas.width / 2 - totalWidth / 2;

    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabWidth = tabWidths[i];
        const badge = tabBadges[i];
        const isActive = titleTab === tab.id;

        // Store bounds
        titleTabBounds.push({
            tab: tab.id,
            x: currentX, y: tabY,
            width: tabWidth,
            height: tabHeight
        });

        // Draw tab background
        ctx.fillStyle = isActive ? '#0aa' : '#333';
        ctx.beginPath();
        ctx.roundRect(currentX, tabY, tabWidth, tabHeight, 6);
        ctx.fill();

        if (isActive) {
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Calculate content positioning
        ctx.font = labelFont;
        const labelWidth = ctx.measureText(tab.label).width;
        let badgeWidth = 0;
        if (badge) {
            ctx.font = badgeFont;
            badgeWidth = ctx.measureText(badge.text).width + badgePadding;
        }
        const totalContentWidth = labelWidth + (badge ? labelBadgeGap + badgeWidth : 0);
        const contentStartX = currentX + (tabWidth - totalContentWidth) / 2;

        // Draw tab label
        ctx.font = labelFont;
        ctx.fillStyle = isActive ? '#fff' : '#888';
        ctx.textAlign = 'left';
        ctx.fillText(tab.label, contentStartX, tabY + 24);

        // Draw inline badge if present
        if (badge) {
            const badgeX = contentStartX + labelWidth + labelBadgeGap;
            const badgeY = tabY + (tabHeight - badgeHeight) / 2;

            ctx.fillStyle = badge.bgColor;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4);
            ctx.fill();

            ctx.font = badgeFont;
            ctx.fillStyle = badge.textColor;
            ctx.textAlign = 'center';
            ctx.fillText(badge.text, badgeX + badgeWidth / 2, badgeY + 13);
        }

        currentX += tabWidth + tabGap;
    }
}

function renderLeaderboardContent() {
    // Content starts below tabs (tabs at canvas.height * 0.20 + 80, height 32)
    const contentStartY = canvas.height * 0.20 + 130;

    // Panel dimensions (same as changelog)
    const panelWidth = 500;
    const panelPadding = 16;
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = contentStartY;
    const rowHeight = 32;
    const headerHeight = 40;

    // Calculate max panel height to avoid overlapping "Press SPACE to start" green area
    const groundHeight = 60;
    const bottomPadding = 20;
    const maxPanelHeight = (canvas.height - groundHeight) - panelY - bottomPadding;

    if (leaderboardLoading) {
        // Draw panel background even when loading
        const loadingPanelHeight = Math.min(100, maxPanelHeight);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelWidth, loadingPanelHeight, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Loading scores...', canvas.width / 2, panelY + 55);
        return;
    }

    if (leaderboard.length === 0) {
        // Draw panel background even when empty
        const emptyPanelHeight = Math.min(100, maxPanelHeight);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelWidth, emptyPanelHeight, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No scores yet - be the first!', canvas.width / 2, panelY + 55);
        return;
    }

    // Calculate total content height (all rows)
    const totalRowsHeight = leaderboard.length * rowHeight;

    // Panel fills all available space
    const panelHeight = maxPanelHeight;

    // Calculate scrollable area
    const scrollableContentHeight = panelHeight - headerHeight - panelPadding * 2;
    const maxScroll = Math.max(0, totalRowsHeight - scrollableContentHeight);

    // Auto-scroll to highlighted entry if we haven't already
    if (highlightedEntryId && !hasScrolledToHighlight) {
        const highlightIndex = leaderboard.findIndex(entry => entry.id === highlightedEntryId);
        if (highlightIndex !== -1) {
            // Scroll so highlighted entry is centered in the visible area
            const targetScrollY = highlightIndex * rowHeight - scrollableContentHeight / 2 + rowHeight / 2;
            leaderboardScrollOffset = Math.max(0, Math.min(targetScrollY, maxScroll));
            hasScrolledToHighlight = true;
        }
    }

    // Clamp scroll offset
    leaderboardScrollOffset = Math.max(0, Math.min(leaderboardScrollOffset, maxScroll));

    // Store panel bounds for mouse wheel hit testing
    leaderboardPanelBounds = { x: panelX, y: panelY, width: panelWidth, height: panelHeight };

    // Draw main panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Panel border
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Header
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOP 100 GLOBAL ABDUCTORS', canvas.width / 2, panelY + panelPadding + 14);

    // Divider below header
    const dividerY = panelY + panelPadding + headerHeight - 8;
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX, dividerY);
    ctx.lineTo(panelX + panelWidth, dividerY);
    ctx.stroke();

    // Entry rows - with clipping for scrolling (start right at the divider)
    const rowStartY = dividerY;
    const clipBottom = panelY + panelHeight - panelPadding;

    // Set up clipping region for scrollable content
    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX, rowStartY, panelWidth, clipBottom - rowStartY);
    ctx.clip();

    ctx.font = '14px monospace';

    for (let i = 0; i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        const rowY = rowStartY + i * rowHeight - leaderboardScrollOffset;
        const flag = countryCodeToFlag(entry.countryCode);
        const isHighlighted = entry.id === highlightedEntryId;
        const isTop3 = i < 3;

        // Skip rows that are completely outside visible area
        if (rowY + rowHeight < rowStartY || rowY > clipBottom) continue;

        // Draw divider line above this row (except first row)
        if (i > 0 || leaderboardScrollOffset > 0) {
            ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(panelX, rowY);
            ctx.lineTo(panelX + panelWidth, rowY);
            ctx.stroke();
        }

        // Highlight background for top 3 or current player
        if (isHighlighted) {
            ctx.fillStyle = 'rgba(0, 200, 200, 0.15)';
            ctx.fillRect(panelX + 1, rowY, panelWidth - 2, rowHeight);
        } else if (isTop3) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.06)';
            ctx.fillRect(panelX + 1, rowY, panelWidth - 2, rowHeight);
        }

        // Text baseline centered in row
        const textY = rowY + rowHeight / 2 + 4;

        // Rank
        ctx.fillStyle = isHighlighted ? '#0ff' : (isTop3 ? '#ff0' : '#fff');
        ctx.textAlign = 'right';
        ctx.fillText(`${i + 1}.`, panelX + panelPadding + 24, textY);

        // Flag and name
        ctx.textAlign = 'left';
        ctx.fillText(`${flag} ${entry.name}`, panelX + panelPadding + 32, textY);

        // Score
        ctx.textAlign = 'right';
        ctx.fillText(entry.score.toLocaleString(), panelX + panelWidth - 240, textY);

        // Wave
        ctx.fillStyle = isHighlighted ? '#0aa' : '#888';
        ctx.fillText(`Wave ${entry.wave}`, panelX + panelWidth - 130, textY);

        // Date
        ctx.fillStyle = isHighlighted ? '#088' : '#666';
        ctx.fillText(formatRelativeDate(entry.timestamp), panelX + panelWidth - panelPadding, textY);
    }

    ctx.restore();

    // Scroll indicator (if scrollable)
    if (maxScroll > 0) {
        const scrollbarHeight = Math.max(30, (scrollableContentHeight / totalRowsHeight) * scrollableContentHeight);
        const scrollbarY = rowStartY + (leaderboardScrollOffset / maxScroll) * (scrollableContentHeight - scrollbarHeight);

        ctx.fillStyle = 'rgba(0, 200, 200, 0.3)';
        ctx.fillRect(panelX + panelWidth - 6, scrollbarY, 4, scrollbarHeight);
    }

    ctx.textAlign = 'center';
}

function renderFeedbackTabContent() {
    feedbackSuggestionBounds = [];

    // Content starts below tabs (tabs at canvas.height * 0.20 + 80, height 32)
    const contentStartY = canvas.height * 0.20 + 130;

    const centerX = canvas.width / 2;
    const panelWidth = 500;
    const panelX = centerX - panelWidth / 2;
    const panelPadding = 16;

    // Calculate panel position and max height (same as changelog/leaderboard)
    const panelStartY = contentStartY;
    const groundHeight = 60;
    const bottomPadding = 20;
    const maxPanelHeight = (canvas.height - groundHeight) - panelStartY - bottomPadding;

    if (feedbackLoading) {
        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Loading feedback...', centerX, panelStartY + 50);
        return;
    }

    if (feedbackFetchError) {
        ctx.fillStyle = '#f55';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackFetchError, centerX, panelStartY + 50);
        return;
    }

    if (!feedbackData) {
        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No feedback yet', centerX, panelStartY + 50);
        return;
    }

    const stats = feedbackData.stats;
    const suggestions = feedbackData.suggestions || [];

    // Calculate panel heights
    const ratingsRowHeight = 68;
    const ratingsPanelHeight = panelPadding + 28 + 8 + ratingsRowHeight + panelPadding;
    const panelGap = 12;

    // ========== PANEL 1: RATINGS ==========
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelStartY, panelWidth, ratingsPanelHeight, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    let y = panelStartY + panelPadding;

    // Stats summary
    ctx.font = '14px monospace';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText(`Received ${stats.totalResponses} ratings so far`, centerX, y + 12);

    y += 28;

    // Horizontal divider under stats header (edge to edge)
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX, y);
    ctx.lineTo(panelX + panelWidth, y);
    ctx.stroke();

    y += 8;

    // Average ratings in 3 columns with dividers
    const ratingLabels = [
        { key: 'enjoyment', label: 'Fun' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'returnIntent', label: 'Replayability' }
    ];

    const columnWidth = panelWidth / 3;
    const ratingsStartX = panelX;

    // Track where the ratings section starts (after the top divider) and ends (bottom of panel)
    const ratingsSectionTop = y - 8;
    const ratingsSectionBottom = panelStartY + ratingsPanelHeight;

    for (let i = 0; i < ratingLabels.length; i++) {
        const r = ratingLabels[i];
        const colX = ratingsStartX + i * columnWidth + columnWidth / 2;
        const avg = parseFloat(stats.averageRatings[r.key]) || 0;

        // Draw column divider (from top divider to bottom divider)
        if (i > 0) {
            ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ratingsStartX + i * columnWidth, ratingsSectionTop);
            ctx.lineTo(ratingsStartX + i * columnWidth, ratingsSectionBottom);
            ctx.stroke();
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        ctx.fillText(r.label, colX, y + 14);

        // Star display
        ctx.fillStyle = '#ff0';
        ctx.font = '22px monospace';
        const fullStars = Math.floor(avg);
        let starText = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
        ctx.fillText(starText, colX, y + 38);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText(avg.toFixed(1), colX, y + 56);
    }

    // ========== PANEL 2: SUGGESTIONS ==========
    const suggestionLineHeight = 18;
    const suggestionPadding = 10; // vertical padding per item
    const sortHeight = 45;
    const suggestionsPanelY = panelStartY + ratingsPanelHeight + panelGap;
    // Extend panel to fill available space (to just above green section)
    const maxSuggestionsPanelBottom = canvas.height - groundHeight - bottomPadding;
    const suggestionsPanelHeight = maxSuggestionsPanelBottom - suggestionsPanelY;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(panelX, suggestionsPanelY, panelWidth, suggestionsPanelHeight, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    y = suggestionsPanelY + panelPadding;

    // Submit feedback button or message
    const submitButtonHeight = 28;
    titleFeedbackSubmitBounds = null; // Reset bounds

    if (titleFeedbackSubmitted) {
        // Show "feedback under review" message
        ctx.font = '14px monospace';
        ctx.fillStyle = '#0aa';
        ctx.textAlign = 'center';
        ctx.fillText('Your feedback is under review', centerX, y + 19);
    } else if (hasPlayedThisSession) {
        // Left side: "What Should We Add Next?" text
        ctx.font = '14px monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'left';
        ctx.fillText('What Should We Add Next?', panelX + panelPadding, y + 19);

        // Right side: "Request a Feature" button with green border, clear background
        const buttonWidth = 150;
        const buttonX = panelX + panelWidth - panelPadding - buttonWidth;
        titleFeedbackSubmitBounds = { x: buttonX, y: y, width: buttonWidth, height: submitButtonHeight };

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(buttonX, y, buttonWidth, submitButtonHeight, 6);
        ctx.fill();
        ctx.strokeStyle = '#0a0';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#0f0';
        ctx.textAlign = 'center';
        ctx.fillText('Request a Feature', buttonX + buttonWidth / 2, y + 19);
    } else {
        // Show header text
        ctx.font = '14px monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText('What Should We Add Next?', centerX, y + 19);
    }

    y += submitButtonHeight + 12;

    // Horizontal divider before suggestions (edge to edge)
    ctx.strokeStyle = 'rgba(0, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX, y);
    ctx.lineTo(panelX + panelWidth, y);
    ctx.stroke();

    y += 2;

    // Suggestions list - use remaining panel space
    const listHeight = suggestionsPanelY + suggestionsPanelHeight - y - panelPadding;

    if (suggestions.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('No suggestions yet - be the first!', centerX, y + 30);
        return;
    }

    const voterId = getOrCreateVoterId();
    const listStartX = panelX + 10;
    const listWidth = panelWidth - 20;
    const maxTextWidth = listWidth - 90; // Leave room for flag and upvote button

    // Helper to wrap text into lines
    function wrapText(text, maxWidth) {
        ctx.font = '14px monospace';
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    // Pre-calculate wrapped lines and heights for all suggestions
    const suggestionLayouts = suggestions.map(s => {
        const lines = wrapText(s.text, maxTextWidth);
        const height = suggestionPadding * 2 + lines.length * suggestionLineHeight;
        return { suggestion: s, lines, height };
    });

    // Calculate cumulative positions
    let totalContentHeight = 0;
    const itemPositions = [];
    for (const layout of suggestionLayouts) {
        itemPositions.push(totalContentHeight);
        totalContentHeight += layout.height;
    }

    // Update globals for scroll handler
    feedbackTotalContentHeight = totalContentHeight;
    feedbackListHeight = listHeight;
    feedbackMaxVisible = Math.floor(listHeight / (suggestionPadding * 2 + suggestionLineHeight));

    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX, y, panelWidth, listHeight);
    ctx.clip();

    // Render visible suggestions
    for (let i = 0; i < suggestionLayouts.length; i++) {
        const { suggestion: s, lines, height } = suggestionLayouts[i];
        const itemY = y + itemPositions[i] - feedbackScrollOffset;

        // Skip if completely outside visible area
        if (itemY + height < y || itemY > y + listHeight) continue;

        // Draw divider between items (edge to edge)
        if (i > 0) {
            ctx.strokeStyle = 'rgba(0, 200, 200, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(panelX, itemY);
            ctx.lineTo(panelX + panelWidth, itemY);
            ctx.stroke();
        }

        // Flag
        const flag = countryCodeToFlag(s.countryCode);
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillText(flag, listStartX + 5, itemY + suggestionPadding + suggestionLineHeight - 2);

        // Wrapped text lines
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ccc';
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            ctx.fillText(lines[lineIdx], listStartX + 35, itemY + suggestionPadding + (lineIdx + 1) * suggestionLineHeight - 2);
        }

        // Upvote button (vertically centered in the item)
        const hasVoted = s.voterIds && s.voterIds.includes(voterId);
        const upvoteX = panelX + panelWidth - 60;
        const upvoteTextY = itemY + height / 2 + 5;

        feedbackSuggestionBounds.push({
            id: s.id,
            x: upvoteX,
            y: itemY,
            width: 50,
            height: height,
            hasVoted
        });

        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = hasVoted ? '#0a0' : '#888';
        ctx.fillText(`▲ ${s.upvotes}`, upvoteX + 25, upvoteTextY);
    }

    ctx.restore();

    // Scroll hint if content exceeds visible area
    if (totalContentHeight > listHeight) {
        ctx.font = '11px monospace';
        ctx.fillStyle = '#555';
        ctx.textAlign = 'center';
        ctx.fillText('↕ scroll for more', centerX, y + listHeight + 12);
    }
}

function renderRainbowBouncyText(text, centerX, baselineY, fontSize) {
    const phase = (Date.now() / 1000) * 3;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';

    const totalWidth = ctx.measureText(text).width;
    let currentX = centerX - totalWidth / 2;

    const glowPulse = Math.sin(phase * 0.5) * 0.3 + 0.7;
    ctx.shadowColor = `rgba(0, 255, 255, ${glowPulse})`;
    ctx.shadowBlur = 30 + Math.sin(phase) * 15;
    ctx.fillStyle = 'transparent';
    ctx.fillText(text, centerX, baselineY);

    ctx.textAlign = 'left';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const hue = (phase * 50 + i * 20) % 360;
        const waveOffset = Math.sin(phase * 2 + i * 0.4) * 12;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.strokeText(char, currentX, baselineY + waveOffset);

        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 20;
        ctx.fillText(char, currentX, baselineY + waveOffset);
        currentX += charWidth;
    }

    ctx.restore();
}

function renderGameOverScreen() {
    renderBackground();

    ctx.fillStyle = '#f00';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 3);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2);

    if (score >= highScore && score > 0) {
        ctx.fillStyle = '#ff0';
        ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2 + 50);
    }

    // Flashing "Press ENTER" text
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('Press ENTER to continue', canvas.width / 2, canvas.height / 2 + 120);
    }
}

// ============================================
// FEEDBACK SCREEN
// ============================================

function updateFeedback(dt) {
    // Blink cursor
    feedbackCursorBlinkTimer += dt;
    if (feedbackCursorBlinkTimer >= 0.5) {
        feedbackCursorBlinkTimer = 0;
        feedbackCursorVisible = !feedbackCursorVisible;
    }
}

function renderFeedbackScreen() {
    renderBackground();

    // Clear bounds for this frame
    feedbackStarBounds = [];

    // Update UFO floating animation
    feedbackUfoOffset = Math.sin(Date.now() / 500) * 6;

    const centerX = canvas.width / 2;

    // ============================================
    // UFO at top center with floating animation
    // ============================================
    const ufoWidth = 120;
    const ufoHeight = 60;
    const ufoX = centerX - ufoWidth / 2;
    const ufoBaseY = 35;
    const ufoY = ufoBaseY + feedbackUfoOffset;

    if (images.ufo && images.ufo.complete) {
        ctx.drawImage(images.ufo, ufoX, ufoY, ufoWidth, ufoHeight);
    }

    // ============================================
    // Title below UFO
    // ============================================
    const headerY = ufoBaseY + ufoHeight + 35;

    renderRainbowBouncyText('HOW WAS YOUR GAME?', centerX, headerY, 30);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('Your feedback helps us improve!', centerX, headerY + 50);

    // ============================================
    // Three columns for the three rating questions
    // ============================================
    const contentStartY = headerY + 130;
    const columnWidth = 200;
    const columnGap = 40;
    const totalColumnsWidth = columnWidth * 3 + columnGap * 2;
    const columnsStartX = centerX - totalColumnsWidth / 2;

    const questions = [
        { key: 'enjoyment', label: 'How fun was it?', icon: '🎮' },
        { key: 'difficulty', label: 'Was it hard enough?', icon: '💪' },
        { key: 'returnIntent', label: 'Would you play it again?', icon: '🔄' }
    ];

    const starSize = 32;
    const starGap = 4;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const colX = columnsStartX + i * (columnWidth + columnGap);
        const colCenterX = colX + columnWidth / 2;
        const isSelected = feedbackSelectedRow === i;
        let y = contentStartY;

        // Icon
        ctx.font = '36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(q.icon, colCenterX, y);
        y += 45;

        // Question label
        ctx.font = isSelected ? 'bold 16px monospace' : '16px monospace';
        ctx.fillStyle = isSelected ? '#0ff' : '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(q.label, colCenterX, y);
        y += 35;

        // Stars (vertical stack for compact display)
        const totalStarWidth = 5 * starSize + 4 * starGap;
        const starsStartX = colCenterX - totalStarWidth / 2;

        for (let s = 1; s <= 5; s++) {
            const starX = starsStartX + (s - 1) * (starSize + starGap);
            const filled = s <= feedbackRatings[q.key];

            feedbackStarBounds.push({
                row: i,
                star: s,
                x: starX,
                y: y - starSize / 2,
                width: starSize,
                height: starSize
            });

            ctx.font = `${starSize}px monospace`;
            ctx.textAlign = 'left';
            if (filled) {
                ctx.fillStyle = '#ff0';
                ctx.shadowColor = '#ff0';
                ctx.shadowBlur = isSelected ? 12 : 6;
            } else {
                ctx.fillStyle = isSelected ? '#666' : '#444';
                ctx.shadowBlur = 0;
            }
            ctx.fillText('★', starX, y + starSize / 4);
            ctx.shadowBlur = 0;
        }
    }

    // ============================================
    // Status message and buttons below columns
    // ============================================
    let buttonsY = contentStartY + 180;

    // Status message
    if (ratingsSubmitted) {
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#0f0';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0f0';
        ctx.shadowBlur = 15;
        ctx.fillText('Thanks so much for your feedback!', centerX, buttonsY);
        ctx.shadowBlur = 0;
        buttonsY += 50;
    } else if (ratingsSubmitting) {
        ctx.font = '16px monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText('Sending...', centerX, buttonsY);
        buttonsY += 50;
    } else {
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.fillText('Rate all three to send feedback', centerX, buttonsY);
        buttonsY += 50;
    }

    // Buttons - two buttons in a row
    const buttonWidth = 160;
    const buttonHeight = 48;
    const buttonGap = 20;
    const totalButtonsWidth = buttonWidth * 2 + buttonGap;
    const buttonsStartX = centerX - totalButtonsWidth / 2;

    // Play Again button (left) - prominent green
    const playBtnX = buttonsStartX;

    ctx.fillStyle = '#080';
    ctx.beginPath();
    ctx.roundRect(playBtnX, buttonsY, buttonWidth, buttonHeight, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    feedbackButtonBounds.playAgain = { x: playBtnX, y: buttonsY, width: buttonWidth, height: buttonHeight };

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Play Again', playBtnX + buttonWidth / 2, buttonsY + 30);

    // Main Menu button (right) - subtle
    const menuBtnX = buttonsStartX + buttonWidth + buttonGap;

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(menuBtnX, buttonsY, buttonWidth, buttonHeight, 8);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();

    feedbackButtonBounds.skip = { x: menuBtnX, y: buttonsY, width: buttonWidth, height: buttonHeight };

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    ctx.fillText('Main Menu', menuBtnX + buttonWidth / 2, buttonsY + 30);
}

// ============================================
// WAVE SUMMARY
// ============================================

const WAVE_SUMMARY_TIMING = {
    title: 0.5,
    targetPer: 0.3,
    points: 1.2,
    bonusPer: 0.4,
    bucks: 0.8,
    bioDelay: 0.3,
    totals: 0.5,
    autoContinue: 4.0
};

const UFO_BUCKS_RATE = 10;

class CountUpAnimation {
    constructor(startValue, endValue, duration) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = Math.max(0.1, duration);
        this.elapsed = 0;
        this.current = startValue;
        this.complete = false;
    }

    update(dt) {
        if (this.complete) return;
        this.elapsed += dt;
        const progress = Math.min(1, this.elapsed / this.duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.current = Math.floor(this.startValue + (this.endValue - this.startValue) * eased);
        if (progress >= 1) {
            this.current = this.endValue;
            this.complete = true;
        }
    }

    finish() {
        this.current = this.endValue;
        this.complete = true;
    }
}

function createWaveStats() {
    return {
        targetsBeamed: { human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0 },
        targetsSpawned: { human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0 },
        hitsTaken: 0,
        tanksDestroyed: 0,
        droneHarvests: 0,
        bioMatterEarned: 0,
        lostDeliveries: 0,
        lostBioMatter: 0,
        points: 0,
        bonusPoints: 0,
        maxComboHit: false
    };
}

function resetWaveStats() {
    waveStats = createWaveStats();
}

// Get the abduction quota target for a given wave number
function getQuotaTarget(waveNum) {
    const thresholds = Object.keys(CONFIG.ABDUCTION_QUOTAS).map(Number).sort((a, b) => a - b);
    let target = CONFIG.ABDUCTION_QUOTAS[thresholds[0]];
    for (const t of thresholds) {
        if (waveNum >= t) {
            target = CONFIG.ABDUCTION_QUOTAS[t];
        }
    }
    return target;
}

function getTotalTargets(targetsMap) {
    return TARGET_TYPES.reduce((sum, type) => sum + (targetsMap[type] || 0), 0);
}

function getWaveBonuses(stats) {
    const totalTargets = getTotalTargets(stats.targetsBeamed);
    const bonuses = [
        {
            id: 'abduction',
            label: 'ABDUCTION MASTER',
            earned: totalTargets >= 10,
            detail: `${totalTargets} targets`,
            multiplier: 0.25
        },
        {
            id: 'tank',
            label: 'TANK HUNTER',
            earned: stats.tanksDestroyed >= 3,
            detail: `${stats.tanksDestroyed} tanks`,
            multiplier: 0.25
        },
        {
            id: 'quota',
            label: quotaTarget > 0 && quotaProgress >= Math.ceil(quotaTarget * (1 + CONFIG.QUOTA_EXCEED_THRESHOLD))
                ? 'QUOTA EXCEEDED' : quotaProgress >= quotaTarget ? 'QUOTA MET' : 'QUOTA MISSED',
            earned: quotaTarget > 0 && quotaProgress >= Math.ceil(quotaTarget * (1 + CONFIG.QUOTA_EXCEED_THRESHOLD)),
            detail: `${quotaProgress}/${quotaTarget} beamed`,
            multiplier: 0.25
        }
    ];
    const earnedBonusCount = bonuses.filter(bonus => bonus.earned).length;
    const bonusMultiplier = earnedBonusCount * 0.25;
    return { bonuses, bonusMultiplier, totalTargets };
}

function buildWaveSummary(completedWave) {
    const { bonuses, bonusMultiplier, totalTargets } = getWaveBonuses(waveStats);
    const wavePoints = waveStats.points;
    const baseUfoBucks = Math.floor(wavePoints / UFO_BUCKS_RATE);
    const bonusUfoBucks = Math.floor(baseUfoBucks * bonusMultiplier);
    const ufoBucksEarned = baseUfoBucks + bonusUfoBucks;

    return {
        wave: completedWave,
        wavePoints,
        bonusPoints: waveStats.bonusPoints,
        targets: { ...waveStats.targetsBeamed },
        targetsSpawned: { ...waveStats.targetsSpawned },
        totalTargets,
        cumulativeTargets: { ...harvestCount },
        bonuses,
        baseUfoBucks,
        bonusUfoBucks,
        ufoBucksEarned,
        ufoBucksBefore: ufoBucks,
        ufoBucksAfter: ufoBucks + ufoBucksEarned,
        cumulativeScore: score,
        // Expansion: quota and bio-matter info
        quotaTarget,
        quotaProgress,
        quotaMet: quotaProgress >= quotaTarget,
        quotaExceeded: quotaTarget > 0 && quotaProgress >= Math.ceil(quotaTarget * (1 + CONFIG.QUOTA_EXCEED_THRESHOLD)),
        bioMatter,
        tanksDestroyed: waveStats.tanksDestroyed,
        droneHarvests: waveStats.droneHarvests,
        bioMatterEarned: waveStats.bioMatterEarned,
        lostDeliveries: waveStats.lostDeliveries,
        lostBioMatter: waveStats.lostBioMatter
    };
}

function startWaveSummary(completedWave) {
    // Freeze sprite animations while stats overlay is shown
    animationPausedAt = Date.now();

    waveSummary = buildWaveSummary(completedWave);

    // Record wave history for analytics graph
    waveHistory.push({
        wave: completedWave,
        score: waveSummary.cumulativeScore,
        bioMatter: waveSummary.bioMatter,
        bioMatterEarned: waveSummary.bioMatterEarned,
        ufoBucks: waveSummary.ufoBucksAfter,
        quotaTarget: waveSummary.quotaTarget,
        quotaProgress: waveSummary.quotaProgress
    });

    // Commander reaction reserved for shop only

    const targetsDuration = TARGET_TYPES.length * WAVE_SUMMARY_TIMING.targetPer;
    const bonusesDuration = waveSummary.bonuses.length * WAVE_SUMMARY_TIMING.bonusPer;
    const titleEnd = WAVE_SUMMARY_TIMING.title;
    const targetsEnd = titleEnd + targetsDuration;
    const pointsEnd = targetsEnd + WAVE_SUMMARY_TIMING.points;
    const bonusesEnd = pointsEnd + bonusesDuration;
    const bucksEnd = bonusesEnd + WAVE_SUMMARY_TIMING.bucks;
    const bioEnd = bucksEnd + WAVE_SUMMARY_TIMING.bioDelay;
    const totalsEnd = bioEnd + WAVE_SUMMARY_TIMING.totals;

    waveSummaryState = {
        elapsed: 0,
        pointsCount: new CountUpAnimation(0, waveSummary.wavePoints, WAVE_SUMMARY_TIMING.points),
        bucksCount: new CountUpAnimation(0, waveSummary.ufoBucksEarned, WAVE_SUMMARY_TIMING.bucks),
        pointsStarted: false,
        bucksStarted: false,
        pointsFinished: false,
        bucksFinished: false,
        targetsRevealed: 0,
        lastTargetsRevealed: 0,
        bonusesRevealed: 0,
        lastBonusesRevealed: 0,
        bioRevealed: false,
        complete: false,
        postCompleteTimer: 0,
        awarded: false,
        pointsTickCooldown: 0,
        bucksTickCooldown: 0,
        lastPointsValue: 0,
        lastBucksValue: 0,
        lastCountdownSecond: -1,
        pointsFinishTime: -1,
        bucksFinishTime: -1,
        completionSoundPlayed: false,
        timings: { titleEnd, targetsEnd, pointsEnd, bonusesEnd, bucksEnd, bioEnd, totalsEnd }
    };
}

function finalizeWaveSummary() {
    if (!waveSummary || !waveSummaryState || waveSummaryState.awarded) return;
    if (waveSummary.ufoBucksEarned > 0) {
        SFX.bucksAward();
    }
    ufoBucks += waveSummary.ufoBucksEarned;
    waveSummaryState.awarded = true;
}

function finishWaveSummaryAnimations() {
    if (!waveSummaryState) return;
    waveSummaryState.elapsed = waveSummaryState.timings.totalsEnd;
    waveSummaryState.targetsRevealed = TARGET_TYPES.length;
    waveSummaryState.bonusesRevealed = waveSummary.bonuses.length;
    waveSummaryState.pointsStarted = true;
    waveSummaryState.bucksStarted = true;
    waveSummaryState.pointsFinished = true;
    waveSummaryState.bucksFinished = true;
    waveSummaryState.bioRevealed = true;
    waveSummaryState.pointsCount.finish();
    waveSummaryState.bucksCount.finish();
    waveSummaryState.pointsFinishTime = 0;
    waveSummaryState.bucksFinishTime = 0;
    waveSummaryState.completionSoundPlayed = true;
    waveSummaryState.complete = true;
    waveSummaryState.postCompleteTimer = 0;
    finalizeWaveSummary();
}

function enterShopFromSummary() {
    finalizeWaveSummary();
    shopTimer = CONFIG.SHOP_DURATION;
    selectedShopItem = 0;
    shopCart = [];
    shopState.activeTab = 'weapons';
    shopState.hoveredItem = null;
    shopState.hoveredNode = null;
    shopState.scrollOffset = 0;
    shopState.scrollToSection = null;
    shopState.cartScrollOffset = 0;
    shopState.techNodeBounds = [];
    shopState.techQueueBounds = [];
    shopState.tabBounds = [];
    shopState.researchIdleTimer = 0;
    lastShopCountdownSecond = -1;
    gameState = 'SHOP';
    SFX.startShopMusic && SFX.startShopMusic();

    // Contextual guidance on shop entry - commander speaks after a brief delay
    commanderState.shopCommentTimer = Math.max(0, commanderState.shopCommentInterval - 2); // First comment after ~2s
    commanderState.visible = false;
    commanderState.currentDialogue = '';
}

function updateWaveSummary(dt) {
    if (!waveSummary || !waveSummaryState) return;

    waveSummaryState.elapsed += dt;
    waveSummaryState.pointsTickCooldown = Math.max(0, waveSummaryState.pointsTickCooldown - dt);
    waveSummaryState.bucksTickCooldown = Math.max(0, waveSummaryState.bucksTickCooldown - dt);

    // Update commander typewriter during wave summary
    updateCommanderTypewriter(dt);

    if (waveSummaryState.elapsed >= waveSummaryState.timings.titleEnd) {
        const revealCount = Math.floor((waveSummaryState.elapsed - waveSummaryState.timings.titleEnd) / WAVE_SUMMARY_TIMING.targetPer) + 1;
        const nextRevealed = Math.min(TARGET_TYPES.length, Math.max(0, revealCount));
        if (nextRevealed > waveSummaryState.targetsRevealed) {
            for (let i = waveSummaryState.targetsRevealed; i < nextRevealed; i++) {
                const type = TARGET_TYPES[i];
                const beamed = waveSummary.targets[type] || 0;
                const spawned = waveSummary.targetsSpawned[type] || 0;
                const gotAll = spawned > 0 && beamed >= spawned;
                if (gotAll) {
                    SFX.targetMax && SFX.targetMax();
                } else {
                    SFX.targetReveal && SFX.targetReveal();
                }
            }
            waveSummaryState.targetsRevealed = nextRevealed;
        }
    }

    if (waveSummaryState.elapsed >= waveSummaryState.timings.targetsEnd) {
        waveSummaryState.pointsStarted = true;
    }
    if (waveSummaryState.pointsStarted) {
        waveSummaryState.pointsCount.update(dt);
        if (waveSummaryState.pointsCount.current !== waveSummaryState.lastPointsValue && waveSummaryState.pointsTickCooldown <= 0) {
            const progress = waveSummary.wavePoints > 0 ? waveSummaryState.pointsCount.current / waveSummary.wavePoints : 0;
            SFX.countTick(500 + Math.floor(progress * 300));
            waveSummaryState.lastPointsValue = waveSummaryState.pointsCount.current;
            waveSummaryState.pointsTickCooldown = 0.03;
        }
        // Pop sound when points count finishes
        if (waveSummaryState.pointsCount.complete && !waveSummaryState.pointsFinished) {
            waveSummaryState.pointsFinished = true;
            waveSummaryState.pointsFinishTime = waveSummaryState.elapsed;
            SFX.countFinish && SFX.countFinish();
        }
    }

    if (waveSummaryState.elapsed >= waveSummaryState.timings.pointsEnd) {
        const revealCount = Math.floor((waveSummaryState.elapsed - waveSummaryState.timings.pointsEnd) / WAVE_SUMMARY_TIMING.bonusPer) + 1;
        waveSummaryState.bonusesRevealed = Math.min(waveSummary.bonuses.length, Math.max(0, revealCount));
        // Play plinky sound for each newly revealed bonus
        if (waveSummaryState.bonusesRevealed > waveSummaryState.lastBonusesRevealed) {
            for (let i = waveSummaryState.lastBonusesRevealed; i < waveSummaryState.bonusesRevealed; i++) {
                const bonus = waveSummary.bonuses[i];
                if (bonus.earned) {
                    SFX.bonusEarned && SFX.bonusEarned();
                } else {
                    SFX.bonusMissed && SFX.bonusMissed();
                }
            }
            waveSummaryState.lastBonusesRevealed = waveSummaryState.bonusesRevealed;
        }
    }

    if (waveSummaryState.elapsed >= waveSummaryState.timings.bonusesEnd) {
        waveSummaryState.bucksStarted = true;
    }
    if (waveSummaryState.bucksStarted) {
        waveSummaryState.bucksCount.update(dt);
        if (waveSummaryState.bucksCount.current !== waveSummaryState.lastBucksValue && waveSummaryState.bucksTickCooldown <= 0) {
            const progress = waveSummary.ufoBucksEarned > 0 ? waveSummaryState.bucksCount.current / waveSummary.ufoBucksEarned : 0;
            SFX.countTick(650 + Math.floor(progress * 250));
            waveSummaryState.lastBucksValue = waveSummaryState.bucksCount.current;
            waveSummaryState.bucksTickCooldown = 0.05;
        }
        // Pop sound when bucks count finishes
        if (waveSummaryState.bucksCount.complete && !waveSummaryState.bucksFinished) {
            waveSummaryState.bucksFinished = true;
            waveSummaryState.bucksFinishTime = waveSummaryState.elapsed;
            SFX.countFinish && SFX.countFinish();
        }
    }

    // Bio matter section reveal sound
    if (!waveSummaryState.bioRevealed && waveSummaryState.elapsed >= waveSummaryState.timings.bioEnd) {
        waveSummaryState.bioRevealed = true;
        if (waveSummary.droneHarvests > 0 || waveSummary.bioMatterEarned > 0 || waveSummary.lostDeliveries > 0) {
            SFX.sectionReveal && SFX.sectionReveal();
        }
    }

    if (!waveSummaryState.complete && waveSummaryState.elapsed >= waveSummaryState.timings.totalsEnd) {
        waveSummaryState.complete = true;
        waveSummaryState.postCompleteTimer = 0;
        finalizeWaveSummary();
        // Play summary completion fanfare
        if (!waveSummaryState.completionSoundPlayed) {
            waveSummaryState.completionSoundPlayed = true;
            SFX.summaryComplete && SFX.summaryComplete();
        }
    }

    if (waveSummaryState.complete) {
        waveSummaryState.postCompleteTimer += dt;
        // Countdown tick sounds
        const remaining = Math.max(0, Math.ceil(WAVE_SUMMARY_TIMING.autoContinue - waveSummaryState.postCompleteTimer));
        if (remaining !== waveSummaryState.lastCountdownSecond && remaining >= 0 && remaining < WAVE_SUMMARY_TIMING.autoContinue) {
            waveSummaryState.lastCountdownSecond = remaining;
            SFX.countdownTick && SFX.countdownTick(remaining);
        }
        if (waveSummaryState.postCompleteTimer >= WAVE_SUMMARY_TIMING.autoContinue) {
            enterShopFromSummary();
        }
    }

    updateParticles(dt);
    updateFloatingTexts(dt);
}

function renderTargetRow(counts, totals, startX, y, iconSize, spacing, revealCount) {
    ctx.textAlign = 'center';
    const visibleCount = Math.min(TARGET_TYPES.length, revealCount);
    // Compute fractional reveal for smooth pop-in animation
    const elapsed = waveSummaryState ? waveSummaryState.elapsed : 999;
    const titleEnd = waveSummaryState ? waveSummaryState.timings.titleEnd : 0;
    for (let i = 0; i < visibleCount; i++) {
        const type = TARGET_TYPES[i];
        const x = startX + i * spacing;
        const count = counts[type] || 0;
        const total = totals ? (totals[type] || 0) : 0;

        // Per-target pop-in: compute how long since this target was revealed
        const revealTime = titleEnd + i * WAVE_SUMMARY_TIMING.targetPer;
        const timeSinceReveal = Math.max(0, elapsed - revealTime);
        const popDuration = 0.15;
        const popProgress = Math.min(1, timeSinceReveal / popDuration);
        // Overshoot easing for a satisfying pop: goes slightly above 1.0 then settles
        const overshoot = popProgress < 1 ? 1 + 0.15 * Math.sin(popProgress * Math.PI) : 1;
        const scaleAnim = popProgress * overshoot;
        const alphaAnim = Math.min(1, popProgress * 2); // Fade in quickly

        ctx.save();
        ctx.globalAlpha = alphaAnim;
        ctx.translate(x, y);
        ctx.scale(scaleAnim, scaleAnim);

        const img = images[type];
        if (img && img.complete) {
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight;
            if (aspectRatio > 1) {
                drawWidth = iconSize;
                drawHeight = iconSize / aspectRatio;
            } else {
                drawHeight = iconSize;
                drawWidth = iconSize * aspectRatio;
            }
            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        } else {
            const colors = { human: '#ffccaa', cow: '#fff', sheep: '#eee', cat: '#ff9944', dog: '#aa7744', tank: '#556b2f' };
            ctx.fillStyle = colors[type];
            if (type === 'tank') {
                ctx.fillRect(-iconSize / 2, -6, iconSize, 12);
                ctx.fillRect(-4, -12, 8, 10);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, iconSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = count > 0 ? '#0f0' : '#555';
        ctx.font = 'bold 16px monospace';
        const label = totals ? `${count}/${total}` : count.toString();
        ctx.fillText(label, 0, iconSize / 2 + 18);

        ctx.restore();
    }
}

// Commander portrait rendering
function renderCommanderPortrait(x, y, size, emotion) {
    const s = size;

    // Holographic screen background with scanlines
    ctx.fillStyle = '#0a2a0a';
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 4);
    ctx.fill();

    // Scanline effect
    ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
    for (let i = 0; i < s; i += 3) {
        ctx.fillRect(x, y + i, s, 1);
    }

    // Holographic flicker (occasional frame skip)
    const flicker = Math.random() < 0.05;
    if (flicker) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.fillRect(x, y, s, s);
        // Still draw border on flicker
        ctx.strokeStyle = emotion === 'furious' ? '#f44' : emotion === 'angry' ? '#fa0' : '#0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 4);
        ctx.stroke();
        return;
    }

    // Shake effect for angry/furious
    const now = Date.now();
    let shakeX = 0, shakeY = 0;
    if (emotion === 'furious') {
        shakeX = Math.sin(now * 0.04) * s * 0.03;
        shakeY = Math.cos(now * 0.05) * s * 0.02;
    } else if (emotion === 'angry') {
        shakeX = Math.sin(now * 0.025) * s * 0.015;
        shakeY = Math.cos(now * 0.03) * s * 0.01;
    }

    const cx = x + s / 2 + shakeX;
    const cy = y + s / 2 + shakeY;

    // Clip to portrait bounds so shake doesn't overflow
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, s - 2, s - 2, 3);
    ctx.clip();

    // Head: elongated cranium (tall top, narrow pointed chin) - classic gray alien
    const headCenterY = cy - s * 0.02;
    ctx.fillStyle = '#0a5';
    ctx.beginPath();
    // Cranium (large upper ellipse)
    ctx.ellipse(cx, headCenterY - s * 0.06, s * 0.28, s * 0.32, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Lower face / chin (narrower, tapers down)
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.28, headCenterY - s * 0.06);
    ctx.quadraticCurveTo(cx - s * 0.2, headCenterY + s * 0.18, cx, headCenterY + s * 0.28);
    ctx.quadraticCurveTo(cx + s * 0.2, headCenterY + s * 0.18, cx + s * 0.28, headCenterY - s * 0.06);
    ctx.fill();

    // Subtle cranium highlight
    ctx.fillStyle = 'rgba(0, 220, 120, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, headCenterY - s * 0.16, s * 0.14, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes: classic alien silhouette - large wrap-around black almonds, ~60° inward slant
    const eyeY = headCenterY + s * 0.02;
    const eyeSpacing = s * 0.12;
    const eyeW = s * 0.15;  // elongated horizontal radius
    const eyeH = s * 0.07;  // narrow vertical radius
    const eyeSlant = 1.05;  // ~60 degrees inward rotation

    // Emotion-tinted glow behind the eyes
    if (emotion === 'furious' || emotion === 'angry') {
        const glowColor = emotion === 'furious' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 170, 0, 0.3)';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.2, eyeH * 1.4, eyeSlant, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.2, eyeH * 1.4, -eyeSlant, 0, Math.PI * 2);
        ctx.fill();
    } else if (emotion === 'pleased') {
        ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
        ctx.beginPath();
        ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.15, eyeH * 1.3, eyeSlant, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + eyeSpacing, eyeY, eyeW * 1.15, eyeH * 1.3, -eyeSlant, 0, Math.PI * 2);
        ctx.fill();
    }

    // Solid black alien eyes - the iconic void
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing, eyeY, eyeW, eyeH, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing, eyeY, eyeW, eyeH, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Glassy reflection - single highlight per eye
    ctx.fillStyle = 'rgba(180, 255, 200, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing - eyeW * 0.25, eyeY - eyeH * 0.15, s * 0.02, s * 0.012, eyeSlant, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing + eyeW * 0.25, eyeY - eyeH * 0.15, s * 0.02, s * 0.012, -eyeSlant, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils (two small dots)
    ctx.fillStyle = '#073';
    ctx.beginPath();
    ctx.arc(cx - s * 0.025, headCenterY + s * 0.12, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + s * 0.025, headCenterY + s * 0.12, s * 0.015, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // End clip

    // Static/noise overlay
    for (let i = 0; i < 8; i++) {
        const nx = x + Math.random() * s;
        const ny = y + Math.random() * s;
        ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.3})`;
        ctx.fillRect(nx, ny, 2, 2);
    }

    // Border
    ctx.strokeStyle = emotion === 'furious' ? '#f44' : emotion === 'angry' ? '#fa0' : '#0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, 4);
    ctx.stroke();
}

function renderCommanderDialogue(x, y, maxWidth, text, charIndex) {
    if (!text) return;
    const displayed = text.substring(0, charIndex);
    if (displayed.length === 0) return;

    ctx.fillStyle = 'rgba(0, 20, 0, 0.8)';
    ctx.font = '13px monospace';
    // Word wrap
    const words = displayed.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(testLine).width > maxWidth - 20) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 16;
    const bubbleHeight = lines.length * lineHeight + 14;
    const bubbleWidth = maxWidth;

    // Speech bubble (no border)
    ctx.fillStyle = 'rgba(0, 20, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, y, bubbleWidth, bubbleHeight, 6);
    ctx.fill();

    // Text
    ctx.fillStyle = '#0f0';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x + 10, y + 14 + i * lineHeight);
    }
}

function setCommanderReaction(quotaMet, quotaExceeded) {
    if (quotaExceeded) {
        commanderState.emotion = 'pleased';
        commanderState.currentDialogue = COMMANDER_DIALOGUES.quotaExceeded[Math.floor(Math.random() * COMMANDER_DIALOGUES.quotaExceeded.length)];
    } else if (quotaMet) {
        commanderState.emotion = 'neutral';
        commanderState.currentDialogue = COMMANDER_DIALOGUES.quotaMet[Math.floor(Math.random() * COMMANDER_DIALOGUES.quotaMet.length)];
    } else {
        commanderState.emotion = 'furious';
        commanderState.currentDialogue = COMMANDER_DIALOGUES.quotaMissed[Math.floor(Math.random() * COMMANDER_DIALOGUES.quotaMissed.length)];
    }
    commanderState.typewriterIndex = 0;
    commanderState.typewriterTimer = 0;
    commanderState.entranceTimer = 0;
    commanderState.visible = true;
}

function updateCommanderTypewriter(dt) {
    if (!commanderState.visible || !commanderState.currentDialogue) return;
    commanderState.entranceTimer += dt;
    commanderState.typewriterTimer += dt;
    // Reveal ~30 characters per second
    const prevIndex = commanderState.typewriterIndex;
    const targetIndex = Math.floor(commanderState.typewriterTimer * 30);
    commanderState.typewriterIndex = Math.min(targetIndex, commanderState.currentDialogue.length);

    // Garbled alien speech sounds - fire every ~2 chars for choppy cadence
    if (commanderState.typewriterIndex > prevIndex && commanderState.typewriterIndex < commanderState.currentDialogue.length) {
        const char = commanderState.currentDialogue[commanderState.typewriterIndex - 1];
        if (char !== ' ' && commanderState.typewriterIndex % 2 === 0) {
            SFX.commanderSpeechGarble();
        }
    }
}

function getContextualShopGuidance() {
    // Priority-ordered: returns first matching category, most critical first
    const guidance = COMMANDER_DIALOGUES.shopGuidance;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const missedQuota = quotaTarget > 0 && quotaProgress < quotaTarget;
    const barelyMetQuota = quotaTarget > 0 && quotaProgress >= quotaTarget && quotaProgress < Math.ceil(quotaTarget * 1.2);
    const hasNoUpgrades = !harvesterUnlocked && !battleDroneUnlocked && playerInventory.bombs <= 0 && techTree.researched.size === 0;

    // Absolutely nothing purchased and we're past wave 1 - maximum nagging
    if (hasNoUpgrades && wave >= 2) return pick(guidance.noUpgradesAtAll);
    // Missed quota - you need to hear about it
    if (missedQuota && wave >= 2) return pick(guidance.quotaFailed);
    // No harvester by wave 2+ - this is the "stop doing it manually" moment
    if (!harvesterUnlocked && wave >= 2) return pick(guidance.noHarvester);
    // No revive charges - existential threat
    if (playerInventory.energyCells <= 0 && wave >= 2) return pick(guidance.noShields);
    // Has biomatter but no queued research
    if (bioMatter > 0 && !techTree.activeResearch && techTree.queue.length === 0) {
        const availableResearch = getAllTechNodes().filter(n => canResearchNode(n.id));
        if (availableResearch.length > 0) return pick(guidance.noResearch);
    }
    // Barely met quota - gentle nudge about upgrading
    if (barelyMetQuota) return pick(guidance.quotaBarely);
    // Has harvester but could use more slots - suggest Drone Uplink research
    if (harvesterUnlocked && droneSlots < 3 && wave >= 3 && !techTree.researched.includes('dc1')) return pick(guidance.moreHarvesters);
    // No bombs by wave 4+
    if (playerInventory.bombs <= 0 && wave >= 4) return pick(guidance.noBombs);

    // No critical advice - alternate between generic guidance and shopIdle
    return Math.random() > 0.4 ? pick(guidance.generic) : pick(COMMANDER_DIALOGUES.shopIdle);
}

function updateCommanderShopComments(dt) {
    if (gameState !== 'SHOP') return;
    commanderState.shopCommentTimer += dt;
    if (commanderState.shopCommentTimer >= commanderState.shopCommentInterval) {
        commanderState.shopCommentTimer = 0;
        commanderState.emotion = 'angry';
        commanderState.currentDialogue = getContextualShopGuidance();
        commanderState.typewriterIndex = 0;
        commanderState.typewriterTimer = 0;
        commanderState.visible = true;
    }
    updateCommanderTypewriter(dt);
}

// Commander is now rendered inline in the shop bottom bar (see renderShop)

function renderWaveSummary() {
    if (!waveSummary || !waveSummaryState) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;

    // Render the game scene frozen (dimmed)
    renderBackground();
    for (const target of targets) {
        target.render();
    }
    renderTanks();
    if (ufo) {
        ufo.render();
    }
    renderParticles();
    renderFloatingTexts();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const panelWidth = Math.min(760, canvas.width * 0.88);
    const panelHeight = Math.min(620, canvas.height * 0.88);
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = (canvas.height - panelHeight) / 2;
    const padding = 30;

    ctx.fillStyle = 'rgba(15, 15, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    let cursorY = panelY + padding;

    // Title
    renderRainbowBouncyText(`WAVE ${waveSummary.wave} COMPLETE!`, panelX + panelWidth / 2, cursorY + 10, 38);
    cursorY += 50;

    // Targets beamed (wave/total)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TARGETS BEAMED (WAVE/TOTAL)', panelX + padding, cursorY);
    cursorY += 22;

    const iconSpacing = (panelWidth - padding * 2) / TARGET_TYPES.length;
    const iconStartX = panelX + padding + iconSpacing / 2;
    renderTargetRow(waveSummary.targets, waveSummary.cumulativeTargets, iconStartX, cursorY + 16, 54, iconSpacing, waveSummaryState.targetsRevealed);
    cursorY += 82;

    // Divider
    cursorY += 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + padding, cursorY);
    ctx.lineTo(panelX + panelWidth - padding, cursorY);
    ctx.stroke();
    cursorY += 18;

    // Wave points
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WAVE POINTS', panelX + padding, cursorY);
    ctx.textAlign = 'right';
    const pointsValue = waveSummaryState.pointsStarted ? waveSummaryState.pointsCount.current : 0;
    // Pop effect when points count finishes
    if (waveSummaryState.pointsFinished && waveSummaryState.pointsFinishTime >= 0) {
        const popAge = waveSummaryState.elapsed - waveSummaryState.pointsFinishTime;
        const popScale = popAge < 0.2 ? 1 + 0.15 * Math.sin(Math.min(1, popAge / 0.2) * Math.PI) : 1;
        const popGlow = popAge < 0.3 ? (1 - popAge / 0.3) * 0.6 : 0;
        ctx.save();
        const textX = panelX + panelWidth - padding;
        ctx.translate(textX, cursorY);
        ctx.scale(popScale, popScale);
        ctx.shadowColor = 'rgba(255, 255, 0, ' + popGlow + ')';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff0';
        ctx.fillText(pointsValue.toLocaleString(), 0, 0);
        ctx.restore();
    } else {
        ctx.fillStyle = '#ff0';
        ctx.fillText(pointsValue.toLocaleString(), panelX + panelWidth - padding, cursorY);
    }
    cursorY += 24;

    if (waveSummary.bonusPoints > 0 && waveSummaryState.pointsStarted) {
        ctx.fillStyle = '#aaa';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BONUS POINTS', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f0';
        ctx.fillText(`+${waveSummary.bonusPoints.toLocaleString()}`, panelX + panelWidth - padding, cursorY);
        cursorY += 24;
    }

    // Bonuses
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('BONUSES', panelX + padding, cursorY);
    cursorY += 22;

    ctx.font = 'bold 16px monospace';
    for (let i = 0; i < waveSummary.bonuses.length; i++) {
        if (waveSummaryState.bonusesRevealed <= i) break;
        const bonus = waveSummary.bonuses[i];

        // Per-bonus fade-in and slide-in from left
        const bonusRevealTime = waveSummaryState.timings.pointsEnd + i * WAVE_SUMMARY_TIMING.bonusPer;
        const bonusAge = Math.max(0, waveSummaryState.elapsed - bonusRevealTime);
        const bonusFadeDur = 0.2;
        const bonusAlpha = Math.min(1, bonusAge / bonusFadeDur);
        const bonusSlide = (1 - bonusAlpha) * 15; // Slide in from left

        ctx.save();
        ctx.globalAlpha = bonusAlpha;
        ctx.translate(-bonusSlide, 0);

        ctx.fillStyle = bonus.earned ? '#0f0' : '#555';
        ctx.textAlign = 'left';
        ctx.fillText(bonus.label, panelX + padding, cursorY);
        ctx.fillStyle = bonus.earned ? '#fff' : '#444';
        ctx.font = '14px monospace';
        ctx.fillText(`(${bonus.detail})`, panelX + padding + 210, cursorY);
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'right';
        // Glow on earned bonuses for emphasis
        if (bonus.earned && bonusAge < 0.4) {
            ctx.shadowColor = 'rgba(255, 255, 0, ' + (0.5 * (1 - bonusAge / 0.4)) + ')';
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = bonus.earned ? '#ff0' : '#444';
        ctx.fillText(bonus.earned ? '+25%' : '--', panelX + panelWidth - padding, cursorY);
        ctx.shadowBlur = 0;

        ctx.restore();
        cursorY += 22;
    }
    cursorY += 10;

    // UFO Bucks calculation
    if (waveSummaryState.bucksStarted) {
        // Divider
        cursorY += 6;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(panelX + padding, cursorY);
        ctx.lineTo(panelX + panelWidth - padding, cursorY);
        ctx.stroke();
        cursorY += 18;
        // Fade-in for UFO Bucks section header
        const bucksAge = Math.max(0, waveSummaryState.elapsed - waveSummaryState.timings.bonusesEnd);
        const bucksSectionAlpha = Math.min(1, bucksAge / 0.2);
        ctx.save();
        ctx.globalAlpha = bucksSectionAlpha;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('UFO BUCKS', panelX + padding, cursorY);
        ctx.restore();
        cursorY += 22;

        ctx.font = '16px monospace';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('BASE', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.fillText(waveSummary.baseUfoBucks.toString(), panelX + panelWidth - padding, cursorY);
        cursorY += 20;

        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('BONUS', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.fillText(waveSummary.bonusUfoBucks.toString(), panelX + panelWidth - padding, cursorY);
        cursorY += 20;

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#ff0';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        // Pop effect when bucks count finishes
        if (waveSummaryState.bucksFinished && waveSummaryState.bucksFinishTime >= 0) {
            const bPopAge = waveSummaryState.elapsed - waveSummaryState.bucksFinishTime;
            const bPopScale = bPopAge < 0.2 ? 1 + 0.15 * Math.sin(Math.min(1, bPopAge / 0.2) * Math.PI) : 1;
            const bPopGlow = bPopAge < 0.3 ? (1 - bPopAge / 0.3) * 0.6 : 0;
            ctx.save();
            const bTextX = panelX + panelWidth - padding;
            ctx.translate(bTextX, cursorY);
            ctx.scale(bPopScale, bPopScale);
            ctx.shadowColor = 'rgba(255, 255, 0, ' + bPopGlow + ')';
            ctx.shadowBlur = 15;
            ctx.fillText(waveSummary.ufoBucksAfter.toString(), 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(waveSummary.ufoBucksAfter.toString(), panelX + panelWidth - padding, cursorY);
        }
        cursorY += 22;
    }

    // === BIO MATTER section ===
    if (waveSummaryState.elapsed >= waveSummaryState.timings.bioEnd && (waveSummary.droneHarvests > 0 || waveSummary.bioMatterEarned > 0 || waveSummary.lostDeliveries > 0)) {
        // Fade-in for bio matter section
        const bioAge = Math.max(0, waveSummaryState.elapsed - waveSummaryState.timings.bioEnd);
        const bioAlpha = Math.min(1, bioAge / 0.25);
        ctx.save();
        ctx.globalAlpha = bioAlpha;

        // Divider
        cursorY += 14;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(panelX + padding, cursorY);
        ctx.lineTo(panelX + panelWidth - padding, cursorY);
        ctx.stroke();
        cursorY += 18;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BIO MATTER', panelX + padding, cursorY);
        cursorY += 22;

        ctx.font = '16px monospace';
        if (waveSummary.droneHarvests > 0) {
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'left';
            ctx.fillText('BM DELIVERED', panelX + padding, cursorY);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.fillText(waveSummary.droneHarvests.toString(), panelX + panelWidth - padding, cursorY);
            cursorY += 20;
        }
        if (waveSummary.lostDeliveries > 0) {
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'left';
            ctx.fillText('BM LOST', panelX + padding, cursorY);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.fillText(waveSummary.lostDeliveries.toString(), panelX + panelWidth - padding, cursorY);
            cursorY += 20;
        }
        if (waveSummary.bioMatterEarned > 0) {
            ctx.font = 'bold 18px monospace';
            ctx.fillStyle = '#0f0';
            ctx.textAlign = 'left';
            ctx.fillText('EARNED', panelX + padding, cursorY);
            ctx.textAlign = 'right';
            ctx.fillText(`+${waveSummary.bioMatterEarned}`, panelX + panelWidth - padding, cursorY);
            ctx.font = '16px monospace';
            cursorY += 20;
        }
        cursorY += 10;
        ctx.restore();
    }

    if (waveSummaryState.elapsed >= waveSummaryState.timings.totalsEnd) {
        // Fade-in for cumulative score
        const scoreAge = Math.max(0, waveSummaryState.elapsed - waveSummaryState.timings.totalsEnd);
        const scoreAlpha = Math.min(1, scoreAge / 0.25);
        ctx.save();
        ctx.globalAlpha = scoreAlpha;
        ctx.fillStyle = '#bbb';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CUMULATIVE SCORE', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        // Brief glow when it first appears
        if (scoreAge < 0.4) {
            ctx.shadowColor = 'rgba(255, 255, 255, ' + (0.4 * (1 - scoreAge / 0.4)) + ')';
            ctx.shadowBlur = 12;
        }
        ctx.fillStyle = '#fff';
        ctx.fillText(waveSummary.cumulativeScore.toLocaleString(), panelX + panelWidth - padding, cursorY);
        ctx.restore();
    }

    if (waveSummaryState.complete) {
        const remaining = Math.max(0, Math.ceil(WAVE_SUMMARY_TIMING.autoContinue - waveSummaryState.postCompleteTimer));
        // Pulsing countdown text
        const pulse = 0.6 + 0.4 * Math.sin(waveSummaryState.postCompleteTimer * Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        // Subtle scale bounce on each new second
        const secondFrac = waveSummaryState.postCompleteTimer % 1;
        const countScale = secondFrac < 0.1 ? 1 + 0.08 * (1 - secondFrac / 0.1) : 1;
        ctx.save();
        ctx.translate(panelX + panelWidth / 2, panelY + panelHeight + 30);
        ctx.scale(countScale, countScale);
        ctx.fillText(`CONTINUING IN ${remaining}...`, 0, 0);
        ctx.restore();
    }

    ctx.restore();
}

// ============================================
// WAVE TRANSITION
// ============================================

function updateWaveTransition(dt) {
    waveTransitionTimer -= dt;

    // Continue updating particles for visual effect
    updateParticles(dt);
    updateFloatingTexts(dt);

    if (waveTransitionTimer <= 0) {
        // Start the new wave
        animationPausedAt = null;
        resetWaveStats();
        waveTimer = CONFIG.WAVE_DURATION;
        lastTimerWarningSecond = -1; // Reset timer warning
        gameState = 'PLAYING';
        // Reset commander state so it doesn't carry over from previous wave
        missionCommanderState.visible = false;
        missionCommanderState.dialogue = '';
        missionCommanderState.typewriterIndex = 0;
        missionCommanderState.typewriterTimer = 0;
        missionCommanderState.displayTimer = 0;
        missionCommanderState.cooldownTimer = 15;
        initHUDBoot();

        // Reset auto-deploy cooldown so coordinators deploy immediately
        autoDeployCooldown = 0;

        // Spawn tanks for new wave
        spawnTanks();

        // Clear any remaining projectiles
        projectiles = [];
    }
}

function renderWaveTransition() {
    // Render the game scene frozen (background, targets, tanks, UFO)
    ctx.save();

    renderBackground();

    // Render targets
    for (const target of targets) {
        target.render();
    }

    // Render tanks
    renderTanks();

    // Render UFO
    if (ufo) {
        ufo.render();
    }

    // Render particles
    renderParticles();

    // Render floating texts
    renderFloatingTexts();

    ctx.restore();

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wave announcement
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';

    // Pulsing effect
    const pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(pulse, pulse);
    ctx.fillText(`WAVE ${wave}`, 0, 0);
    ctx.restore();

    // Countdown
    const secondsLeft = Math.ceil(waveTransitionTimer);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`Starting in ${secondsLeft}...`, canvas.width / 2, canvas.height / 2 + 60);

    // Display wave info
    const tankCount = Math.floor(CONFIG.TANKS_BASE + (wave - 1) * CONFIG.TANKS_INCREMENT);
    let heavyTankCount = wave >= 5 ? (wave === 5 ? 1 : 2) : 0;
    if (wave > 15) {
        heavyTankCount += Math.floor((wave - 15) / 3);
    }
    ctx.font = '24px monospace';
    ctx.fillStyle = '#aaa';
    let waveText = `${tankCount} tank${tankCount > 1 ? 's' : ''}`;
    if (heavyTankCount > 0) {
        waveText += ` + ${heavyTankCount} HEAVY TANK${heavyTankCount > 1 ? 'S' : ''}`;
    }
    waveText += ' incoming!';
    ctx.fillText(waveText, canvas.width / 2, canvas.height / 2 + 100);

    // Render HUD (NGE style overlays wave transition)
    renderHUDFrame();
}

// ============================================
// SHOP SYSTEM
// ============================================

function updateShop(dt) {
    if (waveSummary || waveSummaryState) {
        waveSummary = null;
        waveSummaryState = null;
    }
    shopTimer -= dt;
    shopState.researchIdleTimer += dt;

    // Countdown blip sounds during final 5 seconds of shop timer
    if (shopTimer <= 5 && shopTimer > 0) {
        const currentSecond = Math.ceil(shopTimer);
        if (currentSecond !== lastShopCountdownSecond) {
            lastShopCountdownSecond = currentSecond;
            SFX.researchCountdownBlip(currentSecond);
        }
    }

    // Continue updating particles for visual effect
    updateParticles(dt);
    updateFloatingTexts(dt);

    // Update hover states based on mouse position
    shopState.hoveredItem = null;
    shopState.hoveredNode = null;
    shopState.hoveredQueueBadge = null;
    for (let i = 0; i < shopItemBounds.length; i++) {
        const b = shopItemBounds[i];
        if (b && shopMouseX >= b.x && shopMouseX <= b.x + b.width &&
            shopMouseY >= b.y && shopMouseY <= b.y + b.height) {
            shopState.hoveredItem = b.itemId;
            break;
        }
    }
    // Check queue badge hover first (takes priority over node hover)
    for (let i = 0; i < shopState.techQueueBounds.length; i++) {
        const b = shopState.techQueueBounds[i];
        if (b && shopMouseX >= b.x && shopMouseX <= b.x + b.width &&
            shopMouseY >= b.y && shopMouseY <= b.y + b.height) {
            shopState.hoveredQueueBadge = b.nodeId;
            break;
        }
    }
    for (let i = 0; i < shopState.techNodeBounds.length; i++) {
        const b = shopState.techNodeBounds[i];
        if (b && shopMouseX >= b.x && shopMouseX <= b.x + b.width &&
            shopMouseY >= b.y && shopMouseY <= b.y + b.height) {
            shopState.hoveredNode = b.nodeId;
            break;
        }
    }

    if (shopTimer <= 0) {
        // Shop time is up, start wave transition
        checkoutCart();
        SFX.stopShopMusic && SFX.stopShopMusic();
        waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
        gameState = 'WAVE_TRANSITION';
    }
}

// Get items for the active shop tab
function getShopTabItems(tab) {
    const maintenance = ['repair', 'shield_single', 'revive_cell'];
    const weapons = ['bomb_single', 'bomb_blast', 'bomb_damage', 'missile_swarm', 'missile_capacity', 'missile_damage', 'harvester_drone', 'battle_drone'];
    const systems = ['speed_cell', 'max_energy', 'energy_recharge'];

    let ids;
    if (tab === 'maintenance') ids = maintenance;
    else if (tab === 'systems') ids = systems;
    else ids = weapons;

    return ids.map(id => CONFIG.SHOP_ITEMS.find(i => i.id === id)).filter(Boolean);
}

// Check if a shop item is owned/maxed
function getShopItemStatus(item) {
    if (item.effect === 'missileSwarm' && missileUnlocked) return 'owned';
    if (item.effect === 'harvesterDrone' && harvesterUnlocked) return 'owned';
    if (item.effect === 'battleDrone' && battleDroneUnlocked) return 'owned';
    if (item.effect === 'bombBlast' && bombBlastTier >= CONFIG.BOMB_BLAST_TIERS.length - 1) return 'maxed';
    if (item.effect === 'bombDamage' && bombDamageTier >= CONFIG.BOMB_DAMAGE_TIERS.length - 1) return 'maxed';
    if (item.effect === 'bombCapacity' && playerInventory.maxBombs >= CONFIG.BOMB_MAX_COUNT) return 'maxed';
    if (item.effect === 'missileCapacity' && missileGroupCount >= CONFIG.MISSILE_MAX_GROUPS) return 'maxed';
    if (item.requiresMissile && !missileUnlocked && !shopCart.includes('missile_swarm')) return 'locked';
    return 'available';
}

function renderShop() {
    // Dark background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle starfield background
    ctx.save();
    const starSeed = 42;
    for (let i = 0; i < 80; i++) {
        const sx = ((i * 7919 + starSeed) % canvas.width);
        const sy = ((i * 6271 + starSeed) % canvas.height);
        const brightness = 0.15 + (i % 5) * 0.05;
        ctx.fillStyle = `rgba(150, 180, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // ===== LAYOUT CALCULATIONS =====
    const W = canvas.width;
    const H = canvas.height;
    const pad = Math.max(12, W * 0.015);
    const bottomBarH = Math.max(60, H * 0.085);
    const colGap = Math.max(8, W * 0.01);
    const leftW = Math.floor((W - pad * 3 - colGap) * 0.38);
    const rightW = W - pad * 3 - colGap - leftW;
    const leftX = pad;
    const rightX = leftX + leftW + colGap + pad;
    const topY = pad;
    const mainH = H - bottomBarH - pad * 2 - 4;
    const bottomY = topY + mainH + 4;

    // Clear bounds each frame
    shopItemBounds = [];
    shopCartBounds = [];
    shopState.techNodeBounds = [];
    shopState.techQueueBounds = [];
    shopState.tabBounds = [];

    // Calculate cart total
    const cartTotal = shopCart.reduce((sum, id) => {
        const item = CONFIG.SHOP_ITEMS.find(i => i.id === id);
        return sum + (item ? item.cost : 0);
    }, 0);
    const bucksAfter = ufoBucks - cartTotal;

    // ===== UNIFIED OUTER CONTAINER =====
    const outerX = pad;
    const outerY = topY;
    const outerW = W - pad * 2;
    const outerH = mainH + 4 + bottomBarH;
    ctx.fillStyle = 'rgba(15, 15, 30, 0.95)';
    ctx.beginPath();
    ctx.roundRect(outerX, outerY, outerW, outerH, 8);
    ctx.fill();
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ===== ANIMATED BORDER DOT TIMER =====
    {
        const r = 8; // corner radius matching roundRect
        const dotProgress = (CONFIG.SHOP_DURATION - shopTimer) / CONFIG.SHOP_DURATION;
        // Perimeter: 4 straight edges + 4 quarter-circle arcs
        const straightH = outerH - r * 2;
        const straightW = outerW - r * 2;
        const arcLen = Math.PI * r / 2; // quarter circle
        const totalPerimeter = straightW * 2 + straightH * 2 + arcLen * 4;
        const dist = dotProgress * totalPerimeter;

        // Map distance to (x, y) on the rounded rect, starting top-left after corner, clockwise
        // Segments: top edge, top-right arc, right edge, bottom-right arc, bottom edge, bottom-left arc, left edge, top-left arc
        const segments = [
            straightW,  // top edge
            arcLen,     // top-right arc
            straightH,  // right edge
            arcLen,     // bottom-right arc
            straightW,  // bottom edge
            arcLen,     // bottom-left arc
            straightH,  // left edge
            arcLen      // top-left arc
        ];

        let remaining = dist;
        let dotX = 0, dotY = 0;
        let segIdx = 0;
        for (let si = 0; si < segments.length; si++) {
            if (remaining <= segments[si]) {
                segIdx = si;
                break;
            }
            remaining -= segments[si];
            if (si === segments.length - 1) {
                segIdx = si;
                remaining = segments[si];
            }
        }

        const t = remaining / segments[segIdx]; // 0..1 within segment
        switch (segIdx) {
            case 0: // top edge (left to right)
                dotX = outerX + r + t * straightW;
                dotY = outerY;
                break;
            case 1: { // top-right arc
                const angle = -Math.PI / 2 + t * Math.PI / 2;
                dotX = outerX + outerW - r + Math.cos(angle) * r;
                dotY = outerY + r + Math.sin(angle) * r;
                break;
            }
            case 2: // right edge (top to bottom)
                dotX = outerX + outerW;
                dotY = outerY + r + t * straightH;
                break;
            case 3: { // bottom-right arc
                const angle = 0 + t * Math.PI / 2;
                dotX = outerX + outerW - r + Math.cos(angle) * r;
                dotY = outerY + outerH - r + Math.sin(angle) * r;
                break;
            }
            case 4: // bottom edge (right to left)
                dotX = outerX + outerW - r - t * straightW;
                dotY = outerY + outerH;
                break;
            case 5: { // bottom-left arc
                const angle = Math.PI / 2 + t * Math.PI / 2;
                dotX = outerX + r + Math.cos(angle) * r;
                dotY = outerY + outerH - r + Math.sin(angle) * r;
                break;
            }
            case 6: // left edge (bottom to top)
                dotX = outerX;
                dotY = outerY + outerH - r - t * straightH;
                break;
            case 7: { // top-left arc
                const angle = Math.PI + t * Math.PI / 2;
                dotX = outerX + r + Math.cos(angle) * r;
                dotY = outerY + r + Math.sin(angle) * r;
                break;
            }
        }

        // Helper to compute position at a given distance along the perimeter
        function perimeterPos(d) {
            let rem = ((d % totalPerimeter) + totalPerimeter) % totalPerimeter;
            let px = 0, py = 0;
            for (let si = 0; si < segments.length; si++) {
                if (rem <= segments[si]) {
                    const st = rem / segments[si];
                    switch (si) {
                        case 0: px = outerX + r + st * straightW; py = outerY; break;
                        case 1: { const a = -Math.PI/2 + st * Math.PI/2; px = outerX+outerW-r+Math.cos(a)*r; py = outerY+r+Math.sin(a)*r; break; }
                        case 2: px = outerX+outerW; py = outerY+r+st*straightH; break;
                        case 3: { const a = st * Math.PI/2; px = outerX+outerW-r+Math.cos(a)*r; py = outerY+outerH-r+Math.sin(a)*r; break; }
                        case 4: px = outerX+outerW-r-st*straightW; py = outerY+outerH; break;
                        case 5: { const a = Math.PI/2+st*Math.PI/2; px = outerX+r+Math.cos(a)*r; py = outerY+outerH-r+Math.sin(a)*r; break; }
                        case 6: px = outerX; py = outerY+outerH-r-st*straightH; break;
                        case 7: { const a = Math.PI+st*Math.PI/2; px = outerX+r+Math.cos(a)*r; py = outerY+r+Math.sin(a)*r; break; }
                    }
                    break;
                }
                rem -= segments[si];
            }
            return { x: px, y: py };
        }

        // Draw fading trail (4 dots behind the main dot)
        const trailCount = 4;
        const trailSpacing = 10;
        for (let ti = trailCount; ti >= 1; ti--) {
            const trailDist = dist - ti * trailSpacing;
            if (trailDist < 0) continue;
            const tp = perimeterPos(trailDist);
            const trailAlpha = 0.15 + 0.1 * (trailCount - ti) / trailCount;
            const trailR = 2 + (trailCount - ti) * 0.3;
            ctx.fillStyle = `rgba(0, 220, 220, ${trailAlpha})`;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, trailR, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw main glowing dot (brighter/larger past 80% progress)
        const lateBoost = dotProgress > 0.8 ? 1 + (dotProgress - 0.8) * 5 : 1;
        const mainDotR = 3.5 * lateBoost;
        const mainGlow = 10 + (lateBoost - 1) * 8;
        ctx.save();
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = mainGlow;
        ctx.fillStyle = '#0ff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, mainDotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // Vertical divider between left and right columns
    const dividerX = leftX + leftW + (rightX - leftX - leftW) / 2;
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dividerX, topY + 1);
    ctx.lineTo(dividerX, topY + mainH);
    ctx.stroke();

    // Horizontal divider between columns and bottom bar
    ctx.beginPath();
    ctx.moveTo(outerX + 1, bottomY - 2);
    ctx.lineTo(outerX + outerW - 1, bottomY - 2);
    ctx.stroke();

    // ===== LEFT COLUMN - UFO SHOPPING MALL =====
    const titleH = 40;
    const titleCenterY = topY + titleH / 2;
    const badgeH = 24;
    const badgeY = titleCenterY - badgeH / 2;

    const leftInnerPad = 12;
    const leftContentLeft = outerX + leftInnerPad;
    const leftContentRight = dividerX - leftInnerPad;
    const leftContentW = leftContentRight - leftContentLeft;

    // Title left-aligned, vertically centered in title row
    ctx.fillStyle = '#0ff';
    ctx.font = `bold ${Math.min(18, leftW * 0.05)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('UFO SHOPPING MALL', leftContentLeft, titleCenterY + 5);

    // UFO Bucks badge (right-aligned, with colored background)
    const bucksText = `$${ufoBucks}`;
    ctx.font = `bold ${Math.min(16, leftW * 0.045)}px monospace`;
    const bucksTextW = ctx.measureText(bucksText).width;
    const bucksBadgeW = bucksTextW + 16;
    const bucksBadgeX = leftContentRight - bucksBadgeW;
    ctx.fillStyle = 'rgba(200, 170, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(bucksBadgeX, badgeY, bucksBadgeW, badgeH, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ff0';
    ctx.textAlign = 'center';
    ctx.fillText(bucksText, bucksBadgeX + bucksBadgeW / 2, badgeY + badgeH / 2 + 5);
    // Underline beneath heading (extends to vertical divider)
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(outerX + 1, topY + titleH);
    ctx.lineTo(dividerX, topY + titleH);
    ctx.stroke();

    const tabPad = 6;

    // ===== UNIFIED ITEM LIST =====
    const bucksDisplayY = topY + titleH;
    const itemListY = bucksDisplayY + 6;
    const cartAreaH = Math.max(130, mainH * 0.28);
    const itemListH = mainH - (itemListY - topY) - cartAreaH - 8;
    const allSections = [
        { id: 'weapons', label: 'WEAPONS' },
        { id: 'maintenance', label: 'MAINTENANCE' },
        { id: 'systems', label: 'SYSTEMS' }
    ];
    const sectionHeadingH = 28;
    const itemCardH = Math.max(44, Math.min(56, itemListH / 6));
    const itemCardGap = 4;
    const itemInnerPad = leftInnerPad;

    // Build unified list of items with section headings
    const allEntries = [];
    const sectionOffsets = {};
    let runningOffset = 0;
    for (const section of allSections) {
        sectionOffsets[section.id] = runningOffset;
        allEntries.push({ type: 'heading', label: section.label });
        runningOffset += sectionHeadingH;
        const sectionItems = getShopTabItems(section.id);
        for (const item of sectionItems) {
            if (getShopItemStatus(item) === 'locked') continue;
            allEntries.push({ type: 'item', item });
            runningOffset += itemCardH + itemCardGap;
        }
    }
    const totalListContentH = runningOffset;

    // Handle scroll-to-section from nav buttons
    if (shopState.scrollToSection && sectionOffsets[shopState.scrollToSection] !== undefined) {
        shopState.scrollOffset = sectionOffsets[shopState.scrollToSection];
        shopState.scrollToSection = null;
    }
    // Clamp scroll
    shopState.scrollOffset = Math.max(0, Math.min(shopState.scrollOffset, Math.max(0, totalListContentH - itemListH)));

    // Clip the item list area
    ctx.save();
    ctx.beginPath();
    ctx.rect(outerX + 2, itemListY, dividerX - outerX - 4, itemListH);
    ctx.clip();

    let entryY = 0;
    for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i];
        const iy = itemListY + entryY - shopState.scrollOffset;

        if (entry.type === 'heading') {
            // Section heading
            if (iy + sectionHeadingH >= itemListY && iy <= itemListY + itemListH) {
                ctx.fillStyle = '#0ff';
                ctx.font = `bold ${Math.min(11, leftW * 0.035)}px monospace`;
                ctx.textAlign = 'left';
                ctx.fillText(entry.label, leftContentLeft + 4, iy + 14);
            }
            entryY += sectionHeadingH;
            continue;
        }

        const item = entry.item;

        if (iy + itemCardH < itemListY || iy > itemListY + itemListH) {
            entryY += itemCardH + itemCardGap;
            continue;
        }

        const status = getShopItemStatus(item);
        const inCart = shopCart.filter(id => id === item.id).length;
        const isItemHovered = shopState.hoveredItem === item.id;
        const canAfford = bucksAfter >= item.cost || inCart > 0;

        // Card background
        if (status === 'owned' || status === 'maxed') {
            ctx.fillStyle = isItemHovered ? 'rgba(0, 80, 0, 0.7)' : 'rgba(0, 60, 0, 0.5)';
        } else if (inCart > 0) {
            ctx.fillStyle = 'rgba(0, 80, 100, 0.7)';
        } else if (status === 'locked') {
            ctx.fillStyle = 'rgba(25, 25, 35, 0.8)';
        } else if (isItemHovered) {
            ctx.fillStyle = 'rgba(40, 80, 60, 0.9)';
        } else {
            ctx.fillStyle = 'rgba(25, 35, 45, 0.85)';
        }
        ctx.beginPath();
        ctx.roundRect(leftContentLeft, iy, leftContentW, itemCardH, 6);
        ctx.fill();

        // Border
        if (inCart > 0) {
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
        } else if (status === 'owned' || status === 'maxed') {
            ctx.strokeStyle = '#0a0';
            ctx.lineWidth = 1;
        } else if (status === 'locked') {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
        } else if (isItemHovered && canAfford) {
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = '#334';
            ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Icon
        const iconSize = Math.min(30, itemCardH - 12);
        renderShopIcon(item.id, leftContentLeft + 22, iy + itemCardH / 2, iconSize,
            (status === 'owned' || status === 'maxed') ? '#0a0' : (status === 'locked' ? '#555' : item.color));

        // Item name
        ctx.fillStyle = (status === 'owned' || status === 'maxed') ? '#0f0' : (status === 'locked' ? '#555' : '#fff');
        ctx.font = `bold ${Math.min(13, leftW * 0.03)}px monospace`;
        ctx.textAlign = 'left';
        let displayName = item.name;
        if ((item.effect === 'harvesterDrone' || item.effect === 'battleDrone') && (status === 'owned' || status === 'maxed')) {
            displayName += ' [UNLOCKED]';
        }
        ctx.fillText(displayName, leftContentLeft + 42, iy + itemCardH / 2 - 4);

        // Description
        ctx.fillStyle = (status === 'owned' || status === 'maxed') ? '#8a8' : (status === 'locked' ? '#444' : '#aaa');
        ctx.font = `${Math.min(10, leftW * 0.022)}px monospace`;
        ctx.fillText(item.description, leftContentLeft + 42, iy + itemCardH / 2 + 10);

        // Right side: cost/status + buy button
        const rightEdge = leftContentRight;
        const btnW = Math.min(60, leftW * 0.14);
        const btnH = Math.min(26, itemCardH - 14);
        const btnX = rightEdge - btnW - 4;
        const btnBuyY = iy + (itemCardH - btnH) / 2;

        if (status === 'owned') {
            ctx.fillStyle = '#0a0';
            ctx.font = `bold ${Math.min(12, leftW * 0.025)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('OWNED', btnX + btnW / 2, iy + itemCardH / 2 + 4);
        } else if (status === 'maxed') {
            ctx.fillStyle = '#0a0';
            ctx.font = `bold ${Math.min(12, leftW * 0.025)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('MAXED', btnX + btnW / 2, iy + itemCardH / 2 + 4);
        } else if (status === 'locked') {
            ctx.fillStyle = '#666';
            ctx.font = `${Math.min(10, leftW * 0.022)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('LOCKED', btnX + btnW / 2, iy + itemCardH / 2 + 4);
        } else {
            // Cost
            ctx.fillStyle = canAfford ? '#ff0' : '#a44';
            ctx.font = `bold ${Math.min(13, leftW * 0.028)}px monospace`;
            ctx.textAlign = 'right';
            ctx.fillText(`$${item.cost}`, btnX - 6, iy + itemCardH / 2 + 5);

            // NEW badge for newly unlocked items
            if (shopNewItems.has(item.id)) {
                const costTextW = ctx.measureText(`$${item.cost}`).width;
                const nbW = 34, nbH = 15;
                const nbX = btnX - 6 - costTextW - 6 - nbW;
                const nbY = iy + itemCardH / 2 - nbH / 2;
                const pulse = 0.7 + 0.3 * Math.sin(performance.now() * 0.004);
                ctx.fillStyle = `rgba(255, 136, 0, ${pulse})`;
                ctx.beginPath();
                ctx.roundRect(nbX, nbY, nbW, nbH, 3);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = `bold ${Math.min(10, leftW * 0.022)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('NEW', nbX + nbW / 2, nbY + nbH / 2 + 3);
            }

            // BUY button
            const buyHover = isItemHovered && shopMouseX >= btnX && shopMouseX <= btnX + btnW &&
                             shopMouseY >= btnBuyY && shopMouseY <= btnBuyY + btnH;
            ctx.fillStyle = canAfford ? (buyHover ? 'rgba(0, 200, 100, 0.8)' : 'rgba(0, 150, 70, 0.6)') : 'rgba(60, 40, 40, 0.6)';
            ctx.beginPath();
            ctx.roundRect(btnX, btnBuyY, btnW, btnH, 4);
            ctx.fill();
            ctx.strokeStyle = canAfford ? '#0f0' : '#533';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = canAfford ? '#fff' : '#666';
            ctx.font = `bold ${Math.min(12, leftW * 0.025)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(inCart > 0 ? `+${inCart}` : 'BUY', btnX + btnW / 2, btnBuyY + btnH / 2 + 4);
        }

        // Store bounds for click
        shopItemBounds.push({
            x: leftContentLeft,
            y: iy,
            width: leftContentW,
            height: itemCardH,
            itemId: item.id
        });
        entryY += itemCardH + itemCardGap;
    }
    ctx.restore(); // End item list clip

    // ===== CART AREA (seamless bottom section of left column) =====
    const cartY = topY + mainH - cartAreaH;
    const cartX = leftX;
    const cartW = leftW;

    // Divider line between items and cart
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(outerX + 1, cartY);
    ctx.lineTo(dividerX, cartY);
    ctx.stroke();

    // Cart header
    ctx.fillStyle = '#0ff';
    ctx.font = `bold ${Math.min(14, cartW * 0.035)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('CART', leftContentLeft, cartY + 18);
    ctx.fillStyle = '#ff0';
    ctx.textAlign = 'right';
    ctx.fillText(`TOTAL: $${cartTotal}`, leftContentRight, cartY + 18);

    // Cart items
    const cartItemH = 22;
    const cartStartY = cartY + 28;
    const maxCartVisible = Math.floor((cartAreaH - 75) / cartItemH);

    if (shopCart.length === 0) {
        ctx.fillStyle = '#555';
        ctx.font = `${Math.min(12, cartW * 0.028)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('Click items to add', leftContentLeft + leftContentW / 2, cartStartY + 20);
    } else {
        const cartGroups = {};
        shopCart.forEach(id => { cartGroups[id] = (cartGroups[id] || 0) + 1; });

        let ci = 0;
        for (const [itemId, count] of Object.entries(cartGroups)) {
            if (ci >= maxCartVisible) break;
            const item = CONFIG.SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) continue;

            const ciy = cartStartY + ci * cartItemH;
            const isCartHover = shopMouseX >= leftContentLeft && shopMouseX <= leftContentRight &&
                                shopMouseY >= ciy && shopMouseY <= ciy + cartItemH - 2;

            ctx.fillStyle = isCartHover ? 'rgba(80, 40, 40, 0.6)' : 'rgba(40, 40, 50, 0.5)';
            ctx.beginPath();
            ctx.roundRect(leftContentLeft, ciy, leftContentW, cartItemH - 2, 3);
            ctx.fill();

            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(leftContentLeft + 10, ciy + (cartItemH - 2) / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ddd';
            ctx.font = `${Math.min(11, cartW * 0.025)}px monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(count > 1 ? `${item.name} x${count}` : item.name, leftContentLeft + 20, ciy + cartItemH / 2 + 3);

            ctx.fillStyle = '#ff0';
            ctx.font = `bold ${Math.min(11, cartW * 0.025)}px monospace`;
            ctx.textAlign = 'right';
            ctx.fillText(`$${item.cost * count}`, leftContentRight - 20, ciy + cartItemH / 2 + 3);

            ctx.fillStyle = isCartHover ? '#f55' : '#844';
            ctx.fillText('X', leftContentRight - 6, ciy + cartItemH / 2 + 3);

            shopCartBounds.push({
                x: leftContentLeft, y: ciy,
                width: leftContentW, height: cartItemH - 2,
                itemId: itemId
            });
            ci++;
        }
    }

    // Cart buttons
    const cartBtnAreaY = cartY + cartAreaH - 38;
    const cbtnW = (leftContentW - 14) / 2;
    const cbtnH = 28;
    const checkoutBtnX = leftContentLeft;
    const canCheckout = shopCart.length > 0 && bucksAfter >= 0;
    const checkoutHover = shopMouseX >= checkoutBtnX && shopMouseX <= checkoutBtnX + cbtnW &&
                          shopMouseY >= cartBtnAreaY && shopMouseY <= cartBtnAreaY + cbtnH;

    ctx.fillStyle = canCheckout ? (checkoutHover ? 'rgba(0, 200, 0, 0.8)' : 'rgba(0, 140, 0, 0.7)') : 'rgba(40, 40, 40, 0.7)';
    ctx.beginPath();
    ctx.roundRect(checkoutBtnX, cartBtnAreaY, cbtnW, cbtnH, 5);
    ctx.fill();
    ctx.strokeStyle = canCheckout ? '#0f0' : '#444';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = canCheckout ? '#0f0' : '#555';
    ctx.font = `bold ${Math.min(12, cbtnW * 0.1)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('CHECKOUT', checkoutBtnX + cbtnW / 2, cartBtnAreaY + cbtnH / 2 + 4);
    shopButtonBounds.checkout = { x: checkoutBtnX, y: cartBtnAreaY, width: cbtnW, height: cbtnH };

    const emptyBtnX = leftContentRight - cbtnW;
    const canEmpty = shopCart.length > 0;
    const emptyHover = shopMouseX >= emptyBtnX && shopMouseX <= emptyBtnX + cbtnW &&
                       shopMouseY >= cartBtnAreaY && shopMouseY <= cartBtnAreaY + cbtnH;

    ctx.fillStyle = canEmpty ? (emptyHover ? 'rgba(200, 80, 0, 0.8)' : 'rgba(140, 50, 0, 0.7)') : 'rgba(40, 40, 40, 0.7)';
    ctx.beginPath();
    ctx.roundRect(emptyBtnX, cartBtnAreaY, cbtnW, cbtnH, 5);
    ctx.fill();
    ctx.strokeStyle = canEmpty ? '#f80' : '#444';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = canEmpty ? '#f80' : '#555';
    ctx.font = `bold ${Math.min(12, cbtnW * 0.1)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('CLEAR', emptyBtnX + cbtnW / 2, cartBtnAreaY + cbtnH / 2 + 4);
    shopButtonBounds.empty = { x: emptyBtnX, y: cartBtnAreaY, width: cbtnW, height: cbtnH };

    // ===== RIGHT COLUMN - TECHNOLOGY RESEARCH =====
    const rightInnerPad = 12;
    const rightContentLeft = dividerX + rightInnerPad;
    const rightContentRight = outerX + outerW - rightInnerPad;
    const rightColumnW = outerX + outerW - dividerX;

    // --- Guidance panel state ---
    const allNodes = getAllTechNodes();
    const allResearched = allNodes.every(n => techTree.researched.has(n.id));
    const hasActiveOrQueued = techTree.activeResearch !== null || techTree.queue.length > 0;
    const availableCount = allNodes.filter(n => canResearchNode(n.id)).length;
    const hasAvailable = availableCount > 0;

    let guidanceState = 'HIDDEN';
    let guidanceMessage = '';
    if (allResearched) {
        guidanceState = 'HIDDEN';
    } else if (allNodes.every(n => techTree.researched.has(n.id) || techTree.queue.includes(n.id) || (techTree.activeResearch && techTree.activeResearch.nodeId === n.id))) {
        guidanceState = 'ALL_SET';
        guidanceMessage = 'ALL RESEARCH QUEUED \u2014 LAUNCH WHEN READY';
    } else if (bioMatter === 0 && !hasActiveOrQueued) {
        guidanceState = 'NO_BM';
        guidanceMessage = 'NO BIOMATTER THIS ROUND \u2014 EARN MORE NEXT WAVE';
    } else if (bioMatter > 0 && !hasAvailable && !hasActiveOrQueued) {
        guidanceState = 'CANT_AFFORD';
        guidanceMessage = 'NOT ENOUGH BIOMATTER \u2014 EARN MORE NEXT WAVE';
    } else if (hasActiveOrQueued && hasAvailable) {
        guidanceState = 'HAS_QUEUED_MORE_AVAIL';
        guidanceMessage = `RESEARCH QUEUED \u2014 ${availableCount} MORE UPGRADE${availableCount === 1 ? '' : 'S'} AVAILABLE`;
    } else if (hasActiveOrQueued && !hasAvailable) {
        guidanceState = 'HAS_QUEUED_DONE';
        guidanceMessage = 'RESEARCH QUEUED \u2014 LAUNCH WHEN READY';
    } else if (bioMatter > 0 && hasAvailable && !hasActiveOrQueued) {
        guidanceState = 'INTRO';
        guidanceMessage = `${availableCount} UPGRADE${availableCount === 1 ? '' : 'S'} AVAILABLE \u2014 CLICK ONE BELOW TO RESEARCH`;
    }
    const showGuidance = guidanceState !== 'HIDDEN';
    const guidancePanelH = showGuidance ? 36 : 0;

    // Title left-aligned, vertically centered in title row
    ctx.fillStyle = '#8af';
    ctx.font = `bold ${Math.min(18, rightW * 0.038)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('TECHNOLOGY RESEARCH', rightContentLeft, titleCenterY + 5);

    // Biomatter badge (right-aligned, with colored background)
    const bmText = `${bioMatter}`;
    ctx.font = `bold ${Math.min(16, rightW * 0.032)}px monospace`;
    const bmLabel = 'BIOMATTER ';
    const bmLabelW = ctx.measureText(bmLabel).width;
    const bmNumW = ctx.measureText(bmText).width;
    const bmBadgeW = bmLabelW + bmNumW + 16;
    const bmBadgeX = rightContentRight - bmBadgeW;
    ctx.fillStyle = 'rgba(0, 140, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(bmBadgeX, badgeY, bmBadgeW, badgeH, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8a8';
    ctx.fillText(bmLabel, bmBadgeX + 8, badgeY + badgeH / 2 + 5);
    ctx.fillStyle = '#0f0';
    ctx.fillText(bmText, bmBadgeX + 8 + bmLabelW, badgeY + badgeH / 2 + 5);

    // Underline beneath heading (extends to vertical divider)
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dividerX, topY + titleH);
    ctx.lineTo(outerX + outerW - 1, topY + titleH);
    ctx.stroke();

    // --- Guidance alert panel ---
    if (showGuidance) {
        let panelBg, panelBorder, panelText, iconChar;
        // Urgency flash for guidance panel when player is idle
        const guidanceUrgency = (guidanceState === 'INTRO' || guidanceState === 'HAS_QUEUED_MORE_AVAIL')
            ? Math.min(1, Math.max(0, (shopState.researchIdleTimer - 3) / 5)) : 0;
        const guidanceFlash = guidanceUrgency > 0 ? Math.sin(Date.now() / (200 - guidanceUrgency * 120)) * 0.5 + 0.5 : 0;

        if (guidanceState === 'INTRO' || guidanceState === 'ALL_SET') {
            const flashBright = guidanceUrgency > 0 ? 0.08 + guidanceFlash * guidanceUrgency * 0.25 : 0.08;
            panelBg = `rgba(0, 200, 0, ${flashBright})`;
            panelBorder = `rgba(0, 200, 0, ${0.35 + guidanceFlash * guidanceUrgency * 0.5})`;
            panelText = '#0c0';
            iconChar = guidanceState === 'INTRO' ? '\u25B8' : '\u2713';
        } else if (guidanceState === 'HAS_QUEUED_MORE_AVAIL' || guidanceState === 'HAS_QUEUED_DONE') {
            const flashBright = guidanceUrgency > 0 ? 0.08 + guidanceFlash * guidanceUrgency * 0.2 : 0.08;
            panelBg = `rgba(68, 170, 255, ${flashBright})`;
            panelBorder = `rgba(68, 170, 255, ${0.35 + guidanceFlash * guidanceUrgency * 0.4})`;
            panelText = '#4af';
            iconChar = guidanceState === 'HAS_QUEUED_DONE' ? '\u2713' : '\u25B8';
        } else {
            panelBg = 'rgba(255, 170, 0, 0.08)';
            panelBorder = 'rgba(255, 170, 0, 0.35)';
            panelText = '#fa0';
            iconChar = '\u26A0';
        }
        const gpX = rightContentLeft;
        const gpW = rightContentRight - rightContentLeft;
        const gpY = topY + titleH + 8;
        const gpH = 24;
        ctx.fillStyle = panelBg;
        ctx.beginPath();
        ctx.roundRect(gpX, gpY, gpW, gpH, 4);
        ctx.fill();
        ctx.strokeStyle = panelBorder;
        ctx.lineWidth = 1 + guidanceUrgency * 1.5;
        ctx.stroke();
        ctx.fillStyle = panelText;
        ctx.font = `bold ${Math.min(12, gpW * 0.022)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${iconChar}  ${guidanceMessage}`, gpX + gpW / 2, gpY + gpH / 2 + 4);
    }

    // Track config
    const trackNames = ['powerGrid', 'droneCommand', 'defenseNetwork'];
    const trackLabels = ['POWER GRID', 'DRONE COMMAND', 'DEFENSE NETWORK'];
    const trackColors = ['#0ff', '#0f0', '#f80'];
    const treeTopY = topY + titleH + 38 + guidancePanelH;
    const treeBottomPad = 10;
    const treeH = mainH - (treeTopY - topY) - treeBottomPad;
    const treePadX = rightInnerPad; // horizontal padding inside the right column
    const nodeGap = 24; // gap between node columns
    const totalGap = nodeGap * (trackNames.length - 1) + treePadX * 2;
    const nodeW = Math.floor((rightColumnW - totalGap) / trackNames.length);
    const trackGap = nodeW + nodeGap;

    // Track labels
    for (let t = 0; t < trackNames.length; t++) {
        const ttx = dividerX + treePadX + t * trackGap + nodeW / 2;
        ctx.fillStyle = trackColors[t];
        ctx.font = `bold ${Math.min(14, rightW * 0.028)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(trackLabels[t], ttx, treeTopY);
    }

    // Tech tree nodes - info cards (nodeTopY = center of first tier row)
    const tierCount = 5;
    const treePadTop = 14;
    const availableH = treeH - treePadTop;
    const tierSpacing = availableH / (tierCount - 1 + 1);
    const nodeH = Math.min(tierSpacing - 12, 88);
    const nodeTopY = treeTopY + treePadTop + nodeH / 2;
    const nodeR = 6;
    const nodePad = 10;

    // Text wrap helper: splits text into lines that fit within maxWidth
    function wrapText(text, maxWidth, font) {
        ctx.font = font;
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    // First pass: connections
    for (let t = 0; t < trackNames.length; t++) {
        const track = CONFIG.TECH_TREE[trackNames[t]];
        const ttx = dividerX + treePadX + t * trackGap + nodeW / 2;

        // Vertical connections
        for (let tier = 0; tier < track.length - 1; tier++) {
            const y1 = nodeTopY + tier * tierSpacing;
            const y2 = nodeTopY + (tier + 1) * tierSpacing;
            const isResearched = techTree.researched.has(track[tier].id);
            ctx.strokeStyle = isResearched ? trackColors[t] : 'rgba(140, 150, 180, 0.7)';
            ctx.lineWidth = isResearched ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(ttx, y1 + nodeH / 2);
            ctx.lineTo(ttx, y2 - nodeH / 2);
            ctx.stroke();
        }

        // Cross-connections
        for (const node of track) {
            if (!node.crossConnect) continue;
            const targetNode = getTechNode(node.crossConnect);
            if (!targetNode) continue;

            const fromT = trackNames.indexOf(node.track);
            const toT = trackNames.indexOf(targetNode.track);
            if (fromT < 0 || toT < 0) continue;

            const fromTX = dividerX + treePadX + fromT * trackGap + nodeW / 2;
            const toTX = dividerX + treePadX + toT * trackGap + nodeW / 2;
            const ny = nodeTopY + (node.tier - 1) * tierSpacing;

            const bothResearched = techTree.researched.has(node.id) && techTree.researched.has(targetNode.id);
            ctx.strokeStyle = bothResearched ? 'rgba(200, 200, 255, 0.7)' : 'rgba(130, 140, 170, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(fromTX + nodeW / 2 + 2, ny);
            ctx.lineTo(toTX - nodeW / 2 - 2, ny);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // Second pass: info card nodes
    const titleFont = `bold ${Math.min(15, nodeW * 0.07)}px monospace`;
    const descFont = `${Math.min(13, nodeW * 0.058)}px monospace`;
    const costFont = `bold ${Math.min(13, nodeW * 0.058)}px monospace`;
    const innerW = nodeW - nodePad * 2;

    for (let t = 0; t < trackNames.length; t++) {
        const track = CONFIG.TECH_TREE[trackNames[t]];
        const ttx = dividerX + treePadX + t * trackGap + nodeW / 2;

        for (let tier = 0; tier < track.length; tier++) {
            const node = track[tier];
            const ny = nodeTopY + tier * tierSpacing;
            const rx = ttx - nodeW / 2;
            const ry = ny - nodeH / 2;
            const isResearched = techTree.researched.has(node.id);
            const isAvailable = canResearchNode(node.id);
            const isInQueue = techTree.queue.includes(node.id);
            const isActive = techTree.activeResearch && techTree.activeResearch.nodeId === node.id;
            const isNodeHovered = shopState.hoveredNode === node.id;

            // --- Card background ---
            if (isResearched) {
                ctx.shadowColor = trackColors[t];
                ctx.shadowBlur = 6;
                ctx.fillStyle = trackColors[t];
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (isActive) {
                // Active research: bright glow + tinted background
                ctx.shadowColor = trackColors[t];
                ctx.shadowBlur = 12;
                ctx.fillStyle = 'rgb(30, 35, 60)';
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Tinted inner fill
                ctx.fillStyle = `${trackColors[t]}20`;
                ctx.beginPath();
                ctx.roundRect(rx + 1, ry + 1, nodeW - 2, nodeH - 2, nodeR - 1);
                ctx.fill();
                // Dim base border (progress trace overlays this)
                ctx.globalAlpha = 0.25;
                ctx.strokeStyle = trackColors[t];
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.stroke();
                ctx.globalAlpha = 1;
            } else if (isInQueue) {
                // Queued: slightly tinted background, solid border
                ctx.fillStyle = 'rgb(28, 32, 55)';
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.fill();
                ctx.fillStyle = `${trackColors[t]}15`;
                ctx.beginPath();
                ctx.roundRect(rx + 1, ry + 1, nodeW - 2, nodeH - 2, nodeR - 1);
                ctx.fill();
                ctx.strokeStyle = trackColors[t];
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (isAvailable) {
                // Available: escalating urgency flash when player hasn't queued research
                const idleTime = shopState.researchIdleTimer;
                const urgency = Math.min(1, Math.max(0, (idleTime - 3) / 5)); // ramp 0→1 over 3s-8s
                const baseSpeed = 400 - urgency * 300; // pulse faster as urgency increases
                const pulseAmp = 0.12 + urgency * 0.4; // pulse harder
                const pulse = Math.sin(Date.now() / baseSpeed) * pulseAmp + (1 - pulseAmp);
                ctx.globalAlpha = pulse;
                ctx.fillStyle = 'rgb(25, 28, 50)';
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.fill();
                ctx.strokeStyle = trackColors[t];
                ctx.lineWidth = 2 + urgency * 2;
                ctx.stroke();
                // Urgency glow when flashing hard
                if (urgency > 0.3) {
                    ctx.shadowColor = trackColors[t];
                    ctx.shadowBlur = urgency * 12;
                    ctx.strokeStyle = trackColors[t];
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = 'rgb(28, 30, 48)';
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.fill();
                ctx.strokeStyle = 'rgba(90, 95, 120, 0.6)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // --- Active research progress border trace ---
            if (isActive && techTree.activeResearch) {
                const prog = 1 - (techTree.activeResearch.timeRemaining / techTree.activeResearch.totalTime);
                const straightW = nodeW - 2 * nodeR;
                const straightH = nodeH - 2 * nodeR;
                const perimeter = 2 * straightW + 2 * straightH + 2 * Math.PI * nodeR;
                const drawLen = Math.max(1, prog * perimeter);
                const gapLen = perimeter;
                ctx.save();
                ctx.strokeStyle = trackColors[t];
                ctx.lineWidth = 3;
                ctx.shadowColor = trackColors[t];
                ctx.shadowBlur = 8;
                ctx.setLineDash([drawLen, gapLen]);
                ctx.beginPath();
                ctx.roundRect(rx, ry, nodeW, nodeH, nodeR);
                ctx.stroke();
                ctx.restore();
            }

            // --- Text content ---
            const textX = rx + nodePad;
            let textY = ry + nodePad + 13;

            // Title
            const titleColor = isResearched ? '#000' : (isAvailable || isInQueue || isActive ? trackColors[t] : '#cccdd8');
            ctx.fillStyle = titleColor;
            ctx.font = titleFont;
            ctx.textAlign = 'left';
            const titleLines = wrapText(node.name, innerW, titleFont);
            for (const line of titleLines) {
                ctx.fillText(line, textX, textY);
                textY += 15;
            }

            // Description
            textY += 3;
            const descColor = isResearched ? 'rgba(0,0,0,0.7)' : (isAvailable || isInQueue || isActive ? '#ddd' : '#a8a8b8');
            ctx.fillStyle = descColor;
            ctx.font = descFont;
            const descLines = wrapText(node.description, innerW, descFont);
            const maxDescLines = Math.max(1, Math.floor((ry + nodeH - textY - 18) / 13));
            for (let dl = 0; dl < Math.min(descLines.length, maxDescLines); dl++) {
                ctx.fillText(descLines[dl], textX, textY);
                textY += 13;
            }

            // Cost + Research time at bottom
            const bottomTextY = ry + nodeH - nodePad - 1;
            if (isResearched) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.font = costFont;
                ctx.textAlign = 'center';
                ctx.fillText('COMPLETE', ttx, bottomTextY);
            } else if (isActive && techTree.activeResearch) {
                ctx.font = costFont;
                ctx.textAlign = 'center';
                ctx.fillStyle = trackColors[t];
                const secs = Math.ceil(techTree.activeResearch.timeRemaining);
                ctx.fillText(`RESEARCHING... ${secs}s`, ttx, bottomTextY);
            } else {
                ctx.font = costFont;
                ctx.textAlign = 'left';
                ctx.fillStyle = isAvailable || isInQueue ? '#8f8' : '#7a9a7a';
                ctx.fillText(`${node.cost} BM`, textX, bottomTextY);
                ctx.textAlign = 'right';
                ctx.fillStyle = isAvailable || isInQueue ? '#aaf' : '#7a7a9a';
                ctx.fillText(`${node.researchTime}s`, rx + nodeW - nodePad, bottomTextY);
            }

            // --- Hover / click highlight ---
            if (isNodeHovered && !isResearched) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.roundRect(rx - 2, ry - 2, nodeW + 4, nodeH + 4, nodeR + 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // --- Queue number badge ---
            let queueNum = 0;
            if (isActive) {
                queueNum = 1;
            } else if (isInQueue) {
                queueNum = (techTree.activeResearch ? 1 : 0) + techTree.queue.indexOf(node.id) + 1;
            }
            if (queueNum > 0) {
                const badgeR = 14;
                const badgeCX = rx + nodeW - 2;
                const badgeCY = ry - 2;
                const isBadgeHovered = shopState.hoveredQueueBadge === node.id;

                // Badge circle
                ctx.fillStyle = isBadgeHovered ? '#c33' : trackColors[t];
                ctx.beginPath();
                ctx.arc(badgeCX, badgeCY, badgeR, 0, Math.PI * 2);
                ctx.fill();

                // Number or X
                ctx.fillStyle = '#000';
                ctx.font = `bold 14px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(isBadgeHovered ? 'X' : `${queueNum}`, badgeCX, badgeCY + 5);

                // Store badge bounds for hover/click
                shopState.techQueueBounds.push({
                    x: badgeCX - badgeR, y: badgeCY - badgeR,
                    width: badgeR * 2, height: badgeR * 2,
                    nodeId: node.id
                });
            }

            shopState.techNodeBounds.push({
                x: rx, y: ry,
                width: nodeW, height: nodeH,
                nodeId: node.id
            });
        }
    }

    // ===== BOTTOM BAR (darker overlay, split into two columns) =====
    ctx.fillStyle = 'rgba(5, 7, 15, 0.6)';
    ctx.beginPath();
    ctx.roundRect(outerX + 1, bottomY, outerW - 2, bottomBarH - 1, [0, 0, 7, 7]);
    ctx.fill();

    // Vertical divider in bottom bar (aligned with main divider)
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dividerX, bottomY);
    ctx.lineTo(dividerX, bottomY + bottomBarH - 8);
    ctx.stroke();

    // --- LEFT BOTTOM: Commander portrait + nameplate + dialogue (full width) ---
    const portraitSize = Math.min(bottomBarH - 16, 46);
    const portraitX = leftContentLeft;
    const portraitY = bottomY + (bottomBarH - portraitSize) / 2;
    const commDialogueX = portraitX + portraitSize + 10;
    const commDialogueRight = leftContentRight;

    // Nameplate bar
    const nameplateH = 14;
    const nameplateY = bottomY + 4;
    ctx.fillStyle = 'rgba(0, 40, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(commDialogueX, nameplateY, commDialogueRight - commDialogueX, nameplateH, 2);
    ctx.fill();
    ctx.fillStyle = '#0a0';
    ctx.font = `bold ${Math.min(9, nameplateH - 3)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('GLM GX-5  //  GALACTIC LOGISTICS MANAGER', commDialogueX + 4, nameplateY + nameplateH - 3);

    if (commanderState.visible && commanderState.currentDialogue) {
        renderCommanderPortrait(portraitX, portraitY, portraitSize, commanderState.emotion);
        const dialogueTopY = nameplateY + nameplateH + 2;
        const dialogueMaxW = commDialogueRight - commDialogueX;
        renderCommanderDialogue(commDialogueX, dialogueTopY, dialogueMaxW, commanderState.currentDialogue, commanderState.typewriterIndex);
    } else {
        renderCommanderPortrait(portraitX, portraitY, portraitSize, 'neutral');
        ctx.fillStyle = '#555';
        ctx.font = `${Math.min(11, bottomBarH * 0.18)}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('Awaiting orders...', commDialogueX + 4, bottomY + bottomBarH / 2 + 4);
    }

    // --- RIGHT BOTTOM: Wave analytics graph (left ~2/3) + LAUNCH button (right ~1/3) ---
    const bottomRightLeft = dividerX + rightInnerPad;
    const bottomRightRight = outerX + outerW - rightInnerPad;
    const bottomRightW = bottomRightRight - bottomRightLeft;
    const launchSectionW = Math.max(100, bottomRightW * 0.32);
    const graphSectionW = bottomRightW - launchSectionW - 8;

    // Wave analytics graph
    const graphX = bottomRightLeft;
    const graphW = graphSectionW;
    const graphY = bottomY + 4;
    const graphLabelH = 12;
    const graphH = bottomBarH - 8 - graphLabelH;
    const graphBaseY = graphY + graphH;

    if (waveHistory.length > 0) {
        let maxScore = 0;
        // Find unified scale for quota bars and lines
        let maxQuotaScale = 0;
        for (let i = 0; i < waveHistory.length; i++) {
            if (waveHistory[i].score > maxScore) maxScore = waveHistory[i].score;
            const qt = waveHistory[i].quotaTarget || 0;
            const qp = waveHistory[i].quotaProgress || 0;
            if (qt > maxQuotaScale) maxQuotaScale = qt;
            if (qp > maxQuotaScale) maxQuotaScale = qp;
        }

        const numWaves = waveHistory.length;
        const barAreaW = graphW - 8;
        const barWidth = Math.min(28, Math.max(6, barAreaW / numWaves - 2));
        const barGap = Math.max(1, Math.min(3, (barAreaW - barWidth * numWaves) / Math.max(1, numWaves)));
        const totalBarsW = numWaves * barWidth + (numWaves - 1) * barGap;
        const barsStartX = graphX + 4 + Math.max(0, (barAreaW - totalBarsW) / 2);

        for (let i = 0; i < numWaves; i++) {
            const bx = barsStartX + i * (barWidth + barGap);
            const halfBar = barWidth / 2;

            // BLUE SCORE BAR (left half) - scaled against maxScore
            const scoreH = maxScore > 0 ? (waveHistory[i].score / maxScore) * (graphH - 4) : 0;
            ctx.fillStyle = 'rgba(0, 180, 255, 0.5)';
            ctx.fillRect(bx, graphBaseY - scoreH, halfBar - 1, scoreH);

            // GREEN BEAMED BAR (right half) - quotaProgress on same scale as quota line
            const qp = waveHistory[i].quotaProgress || 0;
            const beamedH = maxQuotaScale > 0 ? (qp / maxQuotaScale) * (graphH - 4) : 0;
            ctx.fillStyle = 'rgba(0, 200, 0, 0.5)';
            ctx.fillRect(bx + halfBar, graphBaseY - beamedH, halfBar - 1, beamedH);

            // Quota line - horizontal dash at quota target level (same scale as green bar)
            const qt = waveHistory[i].quotaTarget || 0;
            if (qt > 0 && maxQuotaScale > 0) {
                const quotaY = graphBaseY - (qt / maxQuotaScale) * (graphH - 4);
                const metQuota = qp >= qt;
                ctx.strokeStyle = metQuota ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 60, 60, 0.8)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(bx - 1, quotaY);
                ctx.lineTo(bx + barWidth + 1, quotaY);
                ctx.stroke();
            }

            ctx.fillStyle = '#556';
            ctx.font = `${Math.min(8, barWidth)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(`${waveHistory[i].wave}`, bx + barWidth / 2, graphBaseY + graphLabelH - 1);
        }

        ctx.strokeStyle = '#334';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(barsStartX - 2, graphBaseY);
        ctx.lineTo(barsStartX + totalBarsW + 2, graphBaseY);
        ctx.stroke();

        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(0, 180, 255, 0.7)';
        ctx.fillText('SCORE', graphX + graphW - 2, graphY + 9);
        ctx.fillStyle = 'rgba(0, 200, 0, 0.7)';
        ctx.fillText('BEAMED', graphX + graphW - 2, graphY + 19);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.fillText('QUOTA', graphX + graphW - 2, graphY + 29);
    } else {
        ctx.fillStyle = '#334';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WAVE ANALYTICS', graphX + graphW / 2, bottomY + bottomBarH / 2 + 4);
    }

    // LAUNCH button with integrated timer (right ~1/3 of right bottom)
    const secondsLeft = Math.ceil(shopTimer);
    const launchBtnPad = 6;
    const launchX = bottomRightRight - launchSectionW;
    const launchBtnY = bottomY + launchBtnPad;
    const launchW = launchSectionW;
    const launchH = bottomBarH - launchBtnPad * 2 - 1;
    const launchHover = shopMouseX >= launchX && shopMouseX <= launchX + launchW &&
                        shopMouseY >= launchBtnY && shopMouseY <= launchBtnY + launchH;

    // Urgency-based colors and effects
    const isUrgent = secondsLeft <= 10;
    const isCritical = secondsLeft <= 5;
    const now = Date.now();

    ctx.save();
    if (isCritical) {
        const pulse = Math.sin(now / 80) * 0.35 + 0.65;
        ctx.globalAlpha = pulse;
        ctx.shadowColor = '#f44';
        ctx.shadowBlur = 16 + Math.sin(now / 120) * 8;
    } else if (isUrgent) {
        const pulse = Math.sin(now / 150) * 0.15 + 0.85;
        ctx.globalAlpha = pulse;
        ctx.shadowColor = '#fa0';
        ctx.shadowBlur = 10;
    } else if (launchHover) {
        ctx.shadowColor = '#0f0';
        ctx.shadowBlur = 14;
    } else {
        ctx.shadowColor = '#0f0';
        ctx.shadowBlur = 6;
    }

    // Button background
    let btnFill, btnStroke;
    if (isCritical) {
        btnFill = launchHover ? 'rgba(220, 50, 30, 0.95)' : 'rgba(180, 40, 20, 0.9)';
        btnStroke = '#f44';
    } else if (isUrgent) {
        btnFill = launchHover ? 'rgba(220, 160, 0, 0.9)' : 'rgba(180, 120, 0, 0.85)';
        btnStroke = '#fa0';
    } else {
        btnFill = launchHover ? 'rgba(0, 210, 60, 0.95)' : 'rgba(0, 160, 50, 0.85)';
        btnStroke = '#0f0';
    }

    ctx.fillStyle = btnFill;
    ctx.beginPath();
    ctx.roundRect(launchX, launchBtnY, launchW, launchH, 6);
    ctx.fill();
    ctx.strokeStyle = btnStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();

    // LAUNCH text
    const launchFontSize = Math.min(18, launchW * 0.18, launchH * 0.32);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${launchFontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('LAUNCH', launchX + launchW / 2, launchBtnY + launchH * 0.4 + 2);

    // Timer text integrated into button
    const timerStr = `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
    const timerFontSize = Math.min(22, launchW * 0.2, launchH * 0.36);
    let timerColor;
    if (isCritical) {
        timerColor = '#fff';
    } else if (isUrgent) {
        timerColor = '#fff';
    } else {
        timerColor = 'rgba(200, 255, 200, 0.9)';
    }
    ctx.fillStyle = timerColor;
    ctx.font = `bold ${timerFontSize}px monospace`;
    ctx.fillText(timerStr, launchX + launchW / 2, launchBtnY + launchH * 0.78);

    shopButtonBounds.done = { x: launchX, y: launchBtnY, width: launchW, height: launchH };

    // Render floating texts on top
    renderFloatingTexts();

}

// Render shop item icons
function renderShopIcon(itemId, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);

    const s = size / 50; // Scale factor

    switch (itemId) {
        case 'repair':
            // Wrench icon
            ctx.strokeStyle = color;
            ctx.lineWidth = 4 * s;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-15 * s, 15 * s);
            ctx.lineTo(10 * s, -10 * s);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(12 * s, -12 * s, 8 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(12 * s, -12 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'shield_single':
            // Shield icon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -20 * s);
            ctx.lineTo(18 * s, -10 * s);
            ctx.lineTo(18 * s, 5 * s);
            ctx.quadraticCurveTo(18 * s, 20 * s, 0, 25 * s);
            ctx.quadraticCurveTo(-18 * s, 20 * s, -18 * s, 5 * s);
            ctx.lineTo(-18 * s, -10 * s);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.moveTo(0, -15 * s);
            ctx.lineTo(12 * s, -7 * s);
            ctx.lineTo(12 * s, 3 * s);
            ctx.quadraticCurveTo(12 * s, 12 * s, 0, 17 * s);
            ctx.closePath();
            ctx.fill();
            break;

        case 'max_energy':
            // Battery/energy icon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(-12 * s, -18 * s, 24 * s, 36 * s, 4 * s);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.roundRect(-8 * s, -14 * s, 16 * s, 28 * s, 2 * s);
            ctx.fill();
            ctx.fillStyle = color;
            ctx.fillRect(-6 * s, -2 * s, 12 * s, 14 * s);
            // Cap
            ctx.fillStyle = color;
            ctx.fillRect(-5 * s, -22 * s, 10 * s, 5 * s);
            break;

        case 'energy_recharge':
            // Lightning/charge icon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(-6 * s, -20 * s);
            ctx.lineTo(6 * s, -20 * s);
            ctx.lineTo(0 * s, -4 * s);
            ctx.lineTo(10 * s, -4 * s);
            ctx.lineTo(-4 * s, 20 * s);
            ctx.lineTo(-2 * s, 4 * s);
            ctx.lineTo(-12 * s, 4 * s);
            ctx.closePath();
            ctx.fill();
            break;

        case 'speed_cell':
            // Speed arrow icon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -20 * s);
            ctx.lineTo(10 * s, 5 * s);
            ctx.lineTo(8 * s, 5 * s);
            ctx.lineTo(8 * s, 15 * s);
            ctx.lineTo(-8 * s, 15 * s);
            ctx.lineTo(-8 * s, 5 * s);
            ctx.lineTo(-10 * s, 5 * s);
            ctx.closePath();
            ctx.fill();
            // Flame
            ctx.fillStyle = '#f80';
            ctx.beginPath();
            ctx.moveTo(-5 * s, 15 * s);
            ctx.lineTo(0, 25 * s);
            ctx.lineTo(5 * s, 15 * s);
            ctx.closePath();
            ctx.fill();
            break;

        case 'revive_cell':
            // Heart/life icon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, 8 * s);
            ctx.bezierCurveTo(-20 * s, -5 * s, -20 * s, -20 * s, 0, -12 * s);
            ctx.bezierCurveTo(20 * s, -20 * s, 20 * s, -5 * s, 0, 8 * s);
            ctx.fill();
            // Plus sign
            ctx.fillStyle = '#fff';
            ctx.fillRect(-2 * s, -10 * s, 4 * s, 12 * s);
            ctx.fillRect(-6 * s, -6 * s, 12 * s, 4 * s);
            break;

        case 'bomb_single':
            // Bomb icon
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(0, 3 * s, 16 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(-5 * s, -2 * s, 6 * s, 0, Math.PI * 2);
            ctx.fill();
            // Fuse
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.moveTo(0, -13 * s);
            ctx.lineTo(0, -20 * s);
            ctx.stroke();
            // Spark
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, -22 * s, 5 * s, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'missile_swarm':
            // Missile icon - small rocket shape
            ctx.fillStyle = color;
            // Rocket body
            ctx.beginPath();
            ctx.ellipse(0, 0, 8 * s, 16 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            // Nose cone
            ctx.beginPath();
            ctx.moveTo(-5 * s, -14 * s);
            ctx.lineTo(0, -22 * s);
            ctx.lineTo(5 * s, -14 * s);
            ctx.closePath();
            ctx.fill();
            // Fins
            ctx.beginPath();
            ctx.moveTo(-8 * s, 12 * s);
            ctx.lineTo(-14 * s, 20 * s);
            ctx.lineTo(-4 * s, 14 * s);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(8 * s, 12 * s);
            ctx.lineTo(14 * s, 20 * s);
            ctx.lineTo(4 * s, 14 * s);
            ctx.closePath();
            ctx.fill();
            // Exhaust glow
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(0, 18 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'missile_capacity':
        case 'missile_damage':
            // Small missile with + sign
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(-4 * s, 0, 5 * s, 12 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            // Plus sign
            ctx.fillStyle = '#fff';
            ctx.fillRect(6 * s, -8 * s, 12 * s, 4 * s);
            ctx.fillRect(10 * s, -12 * s, 4 * s, 12 * s);
            break;

        case 'bomb_blast':
            // Explosion ring icon
            ctx.strokeStyle = color;
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.arc(0, 0, 14 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, 8 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 4 * s, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'bomb_damage':
            // Bomb with impact lines
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(0, 3 * s, 12 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3 * s;
            ctx.lineCap = 'round';
            for (let a = 0; a < 6; a++) {
                const angle = (a / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * 14 * s, Math.sin(angle) * 14 * s + 3 * s);
                ctx.lineTo(Math.cos(angle) * 20 * s, Math.sin(angle) * 20 * s + 3 * s);
                ctx.stroke();
            }
            break;

        case 'harvester_drone':
            // Small drone shape with tractor beam
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, -5 * s, 10 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `${color}44`;
            ctx.beginPath();
            ctx.moveTo(-6 * s, 2 * s);
            ctx.lineTo(6 * s, 2 * s);
            ctx.lineTo(10 * s, 18 * s);
            ctx.lineTo(-10 * s, 18 * s);
            ctx.closePath();
            ctx.fill();
            break;

        case 'battle_drone':
            // Aggressive drone shape
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, -16 * s);
            ctx.lineTo(14 * s, 0);
            ctx.lineTo(8 * s, 4 * s);
            ctx.lineTo(14 * s, 16 * s);
            ctx.lineTo(0, 8 * s);
            ctx.lineTo(-14 * s, 16 * s);
            ctx.lineTo(-8 * s, 4 * s);
            ctx.lineTo(-14 * s, 0);
            ctx.closePath();
            ctx.fill();
            break;

        default:
            // Default circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 15 * s, 0, Math.PI * 2);
            ctx.fill();
    }

    ctx.restore();
}

// Cart helper functions
function addToCart(gridIndex) {
    const bounds = shopItemBounds[gridIndex];
    if (!bounds) return; // Locked slot

    const item = CONFIG.SHOP_ITEMS[bounds.itemIndex];
    if (!item) return;

    // Check if missile swarm already owned or in cart
    if (item.effect === 'missileSwarm' && missileUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY OWNED!', '#f44');
        return;
    }
    if (item.effect === 'missileSwarm' && shopCart.includes(item.id)) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY IN CART!', '#f44');
        return;
    }
    if (item.requiresMissile && !missileUnlocked && !shopCart.includes('missile_swarm')) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'REQUIRES MISSILES!', '#f44');
        return;
    }

    // Check drone already unlocked
    if (item.effect === 'harvesterDrone' && harvesterUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY OWNED!', '#f44');
        return;
    }
    if (item.effect === 'battleDrone' && battleDroneUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY OWNED!', '#f44');
        return;
    }

    // Calculate cart total with this item
    const currentCartTotal = shopCart.reduce((sum, itemId) => {
        const i = CONFIG.SHOP_ITEMS.find(x => x.id === itemId);
        return sum + (i ? i.cost : 0);
    }, 0);

    if (ufoBucks < currentCartTotal + item.cost) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'NOT ENOUGH BUCKS!', '#f44');
        return;
    }

    // Add to cart
    shopCart.push(item.id);

    // Mark dependent items as newly available
    if (item.id === 'missile_swarm') {
        CONFIG.SHOP_ITEMS.filter(i => i.requiresMissile).forEach(i => shopNewItems.add(i.id));
    }

    SFX.powerupCollect && SFX.powerupCollect();
    createFloatingText(canvas.width / 2, 300, `+${item.name}`, item.color);
}

// New cart function that works with item IDs directly (for new shop UI)
function shopAddToCart(itemId) {
    const item = CONFIG.SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    // Check one-time items already owned
    const isOwned = (item.effect === 'missileSwarm' && missileUnlocked) ||
                    (item.effect === 'harvesterDrone' && harvesterUnlocked) ||
                    (item.effect === 'battleDrone' && battleDroneUnlocked);
    if (isOwned) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY OWNED!', '#f44');
        return;
    }
    if (item.effect === 'bombBlast' && bombBlastTier >= CONFIG.BOMB_BLAST_TIERS.length - 1) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'MAXED OUT!', '#f44');
        return;
    }
    if (item.effect === 'bombDamage' && bombDamageTier >= CONFIG.BOMB_DAMAGE_TIERS.length - 1) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'MAXED OUT!', '#f44');
        return;
    }
    if (item.effect === 'bombCapacity' && playerInventory.maxBombs >= CONFIG.BOMB_MAX_COUNT) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'MAXED OUT!', '#f44');
        return;
    }

    // Check requirements
    if (item.requiresMissile && !missileUnlocked && !shopCart.includes('missile_swarm')) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'REQUIRES MISSILES!', '#f44');
        return;
    }

    // One-time items already in cart
    const oneTimeEffects = ['missileSwarm', 'harvesterDrone', 'battleDrone'];
    if (oneTimeEffects.includes(item.effect) && shopCart.includes(item.id)) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY IN CART!', '#f44');
        return;
    }

    // Check affordability
    const currentCartTotal = shopCart.reduce((sum, id) => {
        const i = CONFIG.SHOP_ITEMS.find(x => x.id === id);
        return sum + (i ? i.cost : 0);
    }, 0);
    if (ufoBucks < currentCartTotal + item.cost) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'NOT ENOUGH BUCKS!', '#f44');
        return;
    }

    shopCart.push(item.id);

    // Mark dependent items as newly available
    if (item.id === 'missile_swarm') {
        CONFIG.SHOP_ITEMS.filter(i => i.requiresMissile).forEach(i => shopNewItems.add(i.id));
    }

    SFX.powerupCollect && SFX.powerupCollect();
    createFloatingText(canvas.width / 2, 300, `+${item.name}`, item.color);
}

function removeFromCart(cartIndex) {
    const bounds = shopCartBounds[cartIndex];
    if (!bounds) return;

    // Find and remove one instance of this item
    const idx = shopCart.indexOf(bounds.itemId);
    if (idx !== -1) {
        shopCart.splice(idx, 1);
        SFX.powerupCollect && SFX.powerupCollect();
    }
}

function emptyCart() {
    if (shopCart.length === 0) return;
    shopCart = [];
    SFX.shopEmpty && SFX.shopEmpty();
    createFloatingText(canvas.width / 2, 300, 'CART EMPTIED', '#f80');
}

function checkoutCart() {
    if (shopCart.length === 0) return;

    // Calculate total
    const total = shopCart.reduce((sum, itemId) => {
        const item = CONFIG.SHOP_ITEMS.find(i => i.id === itemId);
        return sum + (item ? item.cost : 0);
    }, 0);

    if (ufoBucks < total) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'NOT ENOUGH BUCKS!', '#f44');
        return;
    }

    // Process each item in cart
    for (const itemId of shopCart) {
        const item = CONFIG.SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) continue;

        // Deduct cost
        ufoBucks -= item.cost;

        // Apply effect
        applyShopItemEffect(item);

        // Clear NEW badge for purchased items
        shopNewItems.delete(itemId);
    }

    // Play purchase sound
    SFX.shopCheckout && SFX.shopCheckout();
    createFloatingText(canvas.width / 2, 300, 'PURCHASED!', '#0f0');

    // Clear cart
    shopCart = [];
}

function applyShopItemEffect(item) {
    switch (item.effect) {
        case 'heal':
            if (ufo) {
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + item.value);
            }
            break;
        case 'shield':
            if (activePowerups.shield.active) {
                activePowerups.shield.charges += item.value;
                activePowerups.shield.maxCharges = Math.max(activePowerups.shield.maxCharges, activePowerups.shield.charges);
            } else {
                activePowerups.shield.active = true;
                activePowerups.shield.charges = item.value;
                activePowerups.shield.maxCharges = item.value;
                activePowerups.shield.stacks = 1;
            }
            break;
        case 'maxEnergy':
            playerInventory.maxEnergyBonus += item.value;
            if (ufo) {
                ufo.maxEnergy = CONFIG.ENERGY_MAX * (1 + playerInventory.maxEnergyBonus);
            }
            break;
        case 'energyRecharge':
            playerInventory.energyRechargeBonus += item.value;
            break;
        case 'speed':
            playerInventory.speedBonus += item.value;
            break;
        case 'energyCell':
            playerInventory.energyCells += item.value;
            break;
        case 'bombCapacity':
            playerInventory.maxBombs = Math.min(CONFIG.BOMB_MAX_COUNT, playerInventory.maxBombs + item.value);
            playerInventory.bombs = Math.min(playerInventory.maxBombs, playerInventory.bombs + item.value);
            if (playerInventory.bombRechargeTimers.length > playerInventory.maxBombs - playerInventory.bombs) {
                playerInventory.bombRechargeTimers.splice(playerInventory.maxBombs - playerInventory.bombs);
            }
            break;
        case 'harvesterDrone':
            harvesterUnlocked = true;
            if (droneSlots <= 0) droneSlots = 2;
            break;
        case 'battleDrone':
            battleDroneUnlocked = true;
            if (droneSlots <= 0) droneSlots = 2;
            break;
        case 'missileSwarm':
            missileUnlocked = true;
            missileGroupCount = 1;
            missileGroups = [{ ready: true, rechargeTimer: 0, index: 0 }];
            break;
        case 'missileCapacity':
            if (missileGroupCount < CONFIG.MISSILE_MAX_GROUPS) {
                missileGroupCount++;
                missileGroups.push({ ready: true, rechargeTimer: 0, index: missileGroupCount - 1 });
            }
            break;
        case 'missileDamage':
            missileDamage += item.value;
            break;
        case 'bombBlast':
            bombBlastTier = Math.min(CONFIG.BOMB_BLAST_TIERS.length - 1, bombBlastTier + 1);
            break;
        case 'bombDamage':
            bombDamageTier = Math.min(CONFIG.BOMB_DAMAGE_TIERS.length - 1, bombDamageTier + 1);
            break;
    }
}

function purchaseShopItem() {
    const item = CONFIG.SHOP_ITEMS[selectedShopItem];

    if (item.effect === 'harvesterDrone' && harvesterUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 200, 'ALREADY OWNED!', '#f44');
        return false;
    }
    if (item.effect === 'battleDrone' && battleDroneUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 200, 'ALREADY OWNED!', '#f44');
        return false;
    }
    if (item.effect === 'missileSwarm' && missileUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 200, 'ALREADY OWNED!', '#f44');
        return false;
    }
    if (item.requiresMissile && !missileUnlocked) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 200, 'REQUIRES MISSILES!', '#f44');
        return false;
    }

    if (ufoBucks < item.cost) {
        SFX.error && SFX.error();
        return false;
    }

    // Deduct cost
    ufoBucks -= item.cost;

    // Apply effect
    applyShopItemEffect(item);

    // Play purchase sound
    SFX.powerup && SFX.powerup();

    // Create floating text
    createFloatingText(canvas.width / 2, 200, `${item.name}!`, item.color);

    return true;
}

// ============================================
// GAME LOOP
// ============================================

let lastTimestamp = 0;

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // Cap delta time
    lastTimestamp = timestamp;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (gameState) {
        case 'TITLE':
            renderTitleScreen();
            break;

        case 'PLAYING':
            update(dt);
            render();
            break;

        case 'NAME_ENTRY':
            updateParticles(dt);
            renderNameEntryScreen();
            renderParticles();
            break;

        case 'WAVE_TRANSITION':
            updateWaveTransition(dt);
            renderWaveTransition();
            break;

        case 'WAVE_SUMMARY':
            updateWaveSummary(dt);
            renderWaveSummary();
            break;

        case 'SHOP':
            updateShop(dt);
            updateCommanderShopComments(dt);
            renderShop();
            // Urgency flash during final 5 seconds of shop timer
            if (shopTimer <= 5 && shopTimer > 0) {
                const urgency = 1 - (shopTimer / 5);
                const pulse = Math.sin(Date.now() / (100 - urgency * 50)) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, 50, 50, ${pulse * (0.08 + urgency * 0.2)})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            break;

        case 'FEEDBACK':
            updateFeedback(dt);
            renderFeedbackScreen();
            break;
    }

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Send activity ping after 10 seconds of gameplay OR when first point is scored
    if (!activityPingSent && ((Date.now() - gameStartTime) >= 10000 || score > 0)) {
        sendActivityPing();
    }

    // Update screen shake
    if (screenShake > 0) {
        screenShake -= dt;
    }

    // Update damage flash
    if (damageFlash > 0) {
        damageFlash -= dt;
    }

    // Clear coordinator charging flags (re-set each frame by UFO.update)
    for (const coord of activeCoordinators) {
        coord.isBeingCharged = false;
        coord.inSnapRange = false;
    }

    if (ufo) {
        ufo.update(dt);
    }

    // Update target spawning
    updateTargetSpawning(dt);

    // Update targets
    const beamX = ufo ? ufo.x : 0;
    const beamActive = ufo ? ufo.beamActive : false;
    for (const target of targets) {
        target.update(dt, beamActive, beamX);
    }

    // Remove dead targets
    targets = targets.filter(t => t.alive);

    // Update tanks
    updateTanks(dt);

    // Update projectiles
    updateProjectiles(dt);

    // Update bombs
    updateBombs(dt);

    // Update drones
    updateDrones(dt);

    // Update coordinators
    updateCoordinators(dt);

    // Update missiles
    updateMissiles(dt);

    // Update tech tree research
    updateResearch(dt);

    // Update HUD systems
    updateMissionCommander(dt);
    updateHUDAnimations(dt);

    // Update research flash timer
    if (researchFlashTimer > 0) {
        researchFlashTimer -= dt;
    }

    // Update particles
    updateParticles(dt);

    // Update floating texts
    updateFloatingTexts(dt);

    // Update tutorial state machine (wave 1 only)
    if (tutorialState && tutorialState.phase !== 'COMPLETE') {
        updateTutorial(dt);
    }

    // Update coordinator charge tutorial
    updateCoordChargeTutorial(dt);

    // Update powerups
    updatePowerupSpawning(dt);
    updateActivePowerups(dt);
    for (const powerup of powerups) {
        powerup.update(dt);
    }
    powerups = powerups.filter(p => p.alive);

    // Update wave timer
    waveTimer -= dt;

    // Timer warning sound for last 10 seconds
    if (waveTimer <= 10 && waveTimer > 0) {
        const currentSecond = Math.ceil(waveTimer);
        if (currentSecond !== lastTimerWarningSecond) {
            lastTimerWarningSecond = currentSecond;
            SFX.timerWarning();
        }
    }

    if (waveTimer <= 0) {
        // Clean up tutorial on wave end
        cleanupTutorial();

        // Wave complete - transition to next wave
        // Stop beam sound if beam is active
        if (ufo && ufo.beamActive) {
            SFX.stopBeamLoop();
            // Clear charging target if snap-charging
            if (ufo.chargingTarget) {
                ufo.chargingTarget.isBeingCharged = false;
                ufo.chargingTarget = null;
                SFX.stopChargingHum();
            }
            if (ufo.beamTarget) {
                ufo.beamTarget.beingAbducted = false;
                ufo.beamTarget.abductionProgress = 0;
                // Check if tank or regular target
                const isTank = ufo.beamTarget.hasOwnProperty('turretAngle') || ufo.beamTarget.hasOwnProperty('turretAngleLeft');
                if (isTank) {
                    ufo.beamTarget.y = ufo.beamTarget.groundY;
                } else {
                    ufo.beamTarget.falling = true;
                    ufo.beamTarget.vy = 0;
                }
                ufo.beamTarget = null;
            }
            ufo.beamActive = false;
        }

        const completedWave = wave;
        score += CONFIG.WAVE_COMPLETE_BONUS;
        waveStats.points += CONFIG.WAVE_COMPLETE_BONUS;

        // Clear harvest effects on all targets
        for (const t of targets) {
            t.harvestShake = 0;
            t.harvestShrink = 0;
        }

        // === Lost deliveries from active drones at wave end ===
        for (const drone of activeDrones) {
            if (drone.collectedTargets && drone.collectedTargets.length > 0) {
                const bmLost = CONFIG.BIO_MATTER_RATES.harvester_batch || 2;
                waveStats.lostDeliveries += drone.collectedTargets.length;
                waveStats.lostBioMatter += bmLost;
                createFloatingText(drone.x, drone.y - 30, `-${bmLost} BM LOST`, '#f80', { fontSize: 18 });
                drone.collectedTargets = [];
                drone.batchCount = 0;
            }
        }
        activeDrones = [];

        // === Lost deliveries from coordinator sub-drones at wave end ===
        for (const coord of activeCoordinators) {
            for (const drone of coord.subDrones) {
                if (drone.collectedTargets && drone.collectedTargets.length > 0) {
                    const bmLost = CONFIG.BIO_MATTER_RATES.harvester_batch || 2;
                    waveStats.lostDeliveries += drone.collectedTargets.length;
                    waveStats.lostBioMatter += bmLost;
                    createFloatingText(drone.x, drone.y - 30, `-${bmLost} BM LOST`, '#f80', { fontSize: 18 });
                    drone.collectedTargets = [];
                    drone.batchCount = 0;
                }
            }
        }
        activeCoordinators = [];

        // === EXPANSION: Quota check at wave end ===
        const quotaExceeded = quotaTarget > 0 && quotaProgress >= Math.ceil(quotaTarget * (1 + CONFIG.QUOTA_EXCEED_THRESHOLD));
        const quotaMet = quotaProgress >= quotaTarget;
        if (quotaMet) {
            consecutiveQuotaMisses = 0;
            if (quotaExceeded) {
                // Bonus Bio-Matter for exceeding quota by 50%+
                const bonusBM = Math.floor(quotaTarget * 0.5);
                bioMatter += bonusBM;
                createFloatingText(canvas.width / 2, canvas.height / 2 + 80, `QUOTA EXCEEDED! +${bonusBM} BM`, '#4f4');
            }
        } else {
            consecutiveQuotaMisses++;
            createFloatingText(canvas.width / 2, canvas.height / 2 + 80, `QUOTA MISSED! (${quotaProgress}/${quotaTarget})`, '#f44');
        }

        const { bonusMultiplier } = getWaveBonuses(waveStats);
        const bonusPoints = Math.floor(waveStats.points * bonusMultiplier);
        if (bonusPoints > 0) {
            score += bonusPoints;
            waveStats.points += bonusPoints;
            waveStats.bonusPoints = bonusPoints;
            createFloatingText(canvas.width / 2, canvas.height / 2 + 40, `BONUS +${bonusPoints}`, '#0f0');
        }
        createFloatingText(canvas.width / 2, canvas.height / 2, `WAVE ${completedWave} COMPLETE! +${CONFIG.WAVE_COMPLETE_BONUS}`, '#ff0');
        SFX.waveComplete();

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('alienAbductoramaHighScore', highScore);
        }

        wave++;

        startWaveSummary(completedWave);

        // Set quota for next wave AFTER building summary (so summary captures completed wave's data)
        quotaTarget = getQuotaTarget(wave);
        quotaProgress = 0;
        gameState = 'WAVE_SUMMARY';
    }
}

function render() {
    // Apply screen shake
    ctx.save();
    if (screenShake > 0) {
        const shakeAmount = screenShake * 20;
        ctx.translate(
            (Math.random() - 0.5) * shakeAmount,
            (Math.random() - 0.5) * shakeAmount
        );
    }

    renderBackground();

    // Render targets
    for (const target of targets) {
        target.render();
    }

    // Render powerups
    for (const powerup of powerups) {
        powerup.render();
    }

    // Render tanks
    renderTanks();

    // Render projectiles
    renderProjectiles();

    // Render bombs
    renderBombs();

    // Render missiles
    renderMissiles();

    // Render coordinators (above drones in altitude, render first)
    renderCoordinators();

    // Render drones (after targets/tanks, before UFO)
    renderDrones();

    // Render UFO (and beam)
    if (ufo) {
        ufo.render();
    }

    // Render particles (on top of everything)
    renderParticles();

    // Render floating texts
    renderFloatingTexts();

    ctx.restore(); // End screen shake

    // Render UI (not affected by shake) - NGE Evangelion HUD
    renderHUDFrame();

    // Boot sequence global effects (CRT flash, ALL SYSTEMS NOMINAL)
    renderHUDBootGlobalEffects();

    // Render tutorial hints (wave 1 only, above UI, below full-screen overlays)
    if (tutorialState && tutorialState.phase !== 'COMPLETE') {
        renderTutorialHints();
    }

    // Render coordinator charge hint (above tutorial hints)
    renderCoordChargeHint();

    // Timer critical warning (last 5 seconds)
    if (waveTimer <= 5 && waveTimer > 0) {
        const pulse = Math.sin(Date.now() / 80) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Large timer in center
        ctx.fillStyle = `rgba(255, 50, 50, ${0.5 + pulse * 0.5})`;
        ctx.font = 'bold 120px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(waveTimer).toString(), canvas.width / 2, canvas.height / 2);
    }

    // Damage flash effect (red screen flash when hit)
    if (damageFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash * 2})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Research complete flash effect (green)
    if (researchFlashTimer > 0) {
        ctx.fillStyle = `rgba(0, 255, 100, ${researchFlashTimer * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

}

// Fetch leaderboard and feedback on page load
fetchLeaderboard();
fetchFeedback();

// Start the game loop
requestAnimationFrame(gameLoop);
