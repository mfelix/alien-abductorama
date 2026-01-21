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
    TANK_POINTS: 25,
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
    TANKS_INCREMENT: 1,
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
    BOMB_MAX_COUNT: 6,              // Maximum bombs player can hold
    BOMB_RECHARGE_TIME: 12,         // Seconds to recharge one bomb

    // Warp Juke
    WARP_JUKE_DISTANCE: 200,        // Distance to teleport
    WARP_JUKE_DOUBLE_TAP_TIME: 0.4, // Time window for double-tap detection
    WARP_JUKE_GHOST_DURATION: 0.5,  // Ghost trail duration
    WARP_JUKE_ENERGY_COST: 25,      // Energy cost to warp

    // Laser Turret
    TURRET_DAMAGE_PER_SECOND: 32,   // Damage dealt per second to tanks (~1.5s to kill light tank, ~3s for heavy)
    TURRET_ENERGY_COST: 25,         // Energy per second to fire (drains energy slower)
    TURRET_BEAM_WIDTH: 4,           // Visual beam width
    TURRET_RANGE: 800,              // Max range of turret

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
            id: 'laser_turret',
            name: 'LASER TURRET',
            description: 'Anti-tank laser',
            cost: 400,
            color: '#f44',
            effect: 'turret',
            value: 1
        },
        {
            id: 'turret_damage',
            name: 'LASER DAMAGE',
            description: '+25% laser damage',
            cost: 220,
            color: '#ff6666',
            effect: 'turretDamage',
            value: 0.25,
            requiresTurret: true
        }
    ]
};

// ============================================
// AUDIO SYSTEM
// ============================================

let audioCtx = null;
let audioInitialized = false;

function initAudio() {
    if (audioInitialized) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioInitialized = true;
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
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

    abductionSuccess: () => {
        if (!audioCtx) return;
        // Happy ascending jingle
        [400, 500, 600, 800].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 80);
        });
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
        // Satisfying pickup - quick ascending sweep with harmonics
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        osc2.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.2);
        osc2.stop(audioCtx.currentTime + 0.2);
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

    turretStart: () => {
        if (!audioCtx) return;
        // Electric hum that builds up - laser charging
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.15);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(50, audioCtx.currentTime);
        osc2.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.15);

        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.15);
        osc2.stop(audioCtx.currentTime + 0.15);
    },

    turretFiring: () => {
        if (!audioCtx) return;
        // Continuous electric buzz - the laser beam
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300 + Math.random() * 50, audioCtx.currentTime);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(150 + Math.random() * 25, audioCtx.currentTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, audioCtx.currentTime);
        filter.Q.setValueAtTime(2, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.1);
        osc2.stop(audioCtx.currentTime + 0.1);
    },

    turretStop: () => {
        if (!audioCtx) return;
        // Power down sound
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
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
let firstPointTracked = false; // Track if we've recorded last played time for this session

// Game session tracking for leaderboard
let gameStartTime = 0;
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
let waveStats = createWaveStats();
let waveSummary = null;
let waveSummaryState = null;

// Shop state
let shopTimer = 0;
let selectedShopItem = 0;
let shopItemBounds = []; // For click detection on shop items
let shopButtonBounds = { done: null, cancel: null, checkout: null, empty: null }; // For click detection on buttons
let shopCart = []; // Items in shopping cart (array of item ids)
let shopCartBounds = []; // For click detection on cart items (to remove)

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
    energyRechargeBonus: 0,
    turretDamageBonus: 0,
    hasTurret: false // Laser turret ownership
};

// Active bombs in the world
let bombs = [];

// Warp Juke double-tap detection (track last 2 tap times for each direction)
let leftTapHistory = [];
let rightTapHistory = [];

// Easter egg: Triple-T on title screen for free turret
let titleTurretTaps = [];
let titleTurretUnlocked = false;
let titleTurretFlashTimer = 0;

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
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Escape', 'KeyC'].includes(e.code)) {
            e.preventDefault();
        }

        // Grid navigation (3x3)
        const gridCols = 3;
        const maxItems = 9; // Number of actual items in grid
        if (e.code === 'ArrowUp') {
            selectedShopItem = Math.max(0, selectedShopItem - gridCols);
        } else if (e.code === 'ArrowDown') {
            selectedShopItem = Math.min(maxItems - 1, selectedShopItem + gridCols);
        } else if (e.code === 'ArrowLeft') {
            selectedShopItem = Math.max(0, selectedShopItem - 1);
        } else if (e.code === 'ArrowRight') {
            selectedShopItem = Math.min(maxItems - 1, selectedShopItem + 1);
        } else if (e.code === 'Space') {
            // Add selected item to cart
            addToCart(selectedShopItem);
        } else if (e.code === 'KeyC') {
            // Checkout cart
            checkoutCart();
        } else if (e.code === 'Escape') {
            // Empty cart
            emptyCart();
        } else if (e.code === 'Enter') {
            // Checkout and start wave
            checkoutCart();
            SFX.stopShopMusic && SFX.stopShopMusic();
            waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
            gameState = 'WAVE_TRANSITION';
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

    // Handle bomb drop during gameplay (X or B key)
    if (gameState === 'PLAYING' && (e.code === 'KeyX' || e.code === 'KeyB')) {
        dropBomb();
    }

    // Handle warp juke (double-tap left/right arrow OR shift+direction)
    // Only count actual key presses, not key repeats from holding
    if (gameState === 'PLAYING' && !e.repeat) {
        const now = Date.now();
        const tapWindow = CONFIG.WARP_JUKE_DOUBLE_TAP_TIME * 1000;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
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
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
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

        // Easter egg: Triple-T for free turret
        if (e.code === 'KeyT' && !e.repeat && !titleTurretUnlocked) {
            const now = Date.now();
            titleTurretTaps.push(now);
            // Keep only taps from last 1 second
            titleTurretTaps = titleTurretTaps.filter(t => now - t < 1000);

            if (titleTurretTaps.length >= 3) {
                // Unlock the turret!
                titleTurretUnlocked = true;
                titleTurretFlashTimer = 2; // Flash for 2 seconds
                titleTurretTaps = [];
                SFX.powerup && SFX.powerup();
                SFX.turretStart && SFX.turretStart();
            }
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
                    return;
                }
            }
        }

        // Check Send Feedback button clicks
        if (feedbackButtonBounds.submit) {
            const b = feedbackButtonBounds.submit;
            if (mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= b.y + b.height) {
                submitRatingsOnly();
                return;
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
            addToCart(i);
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

    // Check if clicked Done button
    if (shopButtonBounds.done) {
        const b = shopButtonBounds.done;
        if (mouseX >= b.x && mouseX <= b.x + b.width &&
            mouseY >= b.y && mouseY <= b.y + b.height) {
            checkoutCart(); // Auto-checkout when done
            SFX.stopShopMusic && SFX.stopShopMusic();
            waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
            gameState = 'WAVE_TRANSITION';
            return;
        }
    }
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
                this.y = this.groundY;
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

            // Check if abduction complete
            if (this.abductionProgress >= this.abductionTime) {
                this.alive = false;
                SFX.abductionSuccess();
                // Increment harvest counter and trigger bounce
                harvestCount[this.type]++;
                harvestBounce[this.type] = 1.0;
                waveStats.targetsBeamed[this.type]++;
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

                // Track last played time on first point scored
                if (!firstPointTracked) {
                    firstPointTracked = true;
                    trackSession();
                }

                // Heal UFO
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION);

                // Restore energy proportional to points
                const energyRestored = Math.floor(this.points * CONFIG.ENERGY_RESTORE_RATIO);
                ufo.energy = Math.min(ufo.maxEnergy, ufo.energy + energyRestored);

                // Create floating score text
                createFloatingText(this.x, this.y, `+${pointsEarned}`, '#0f0');

                // Update high score
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('alienAbductoramaHighScore', highScore);
                }
            }
            return;
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

            const img = images[this.type];
            if (img && img.complete) {
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = this.getPlaceholderColor();
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            ctx.restore();
            return;
        }

        const img = images[this.type];
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

        // Debug: show flee state
        if (this.fleeing) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
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
        createFloatingText(this.x + this.width / 2, this.y, 'BLASTED!', '#f80');

        // Mark as dead
        this.alive = false;
    }
}

// ============================================
// FLOATING TEXT (for score popups)
// ============================================

let floatingTexts = [];
let tutorialTimeouts = [];
let turretHintPending = false;

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

function clearTutorialTimeouts() {
    for (const id of tutorialTimeouts) {
        clearTimeout(id);
    }
    tutorialTimeouts = [];
}

function scheduleTutorialHints() {
    clearTutorialTimeouts();
    const baseY = canvas.height * 0.35;
    const step = 2.6;
    const items = [
        { text: 'MOVE: LEFT / RIGHT ARROWS', color: '#0ff' },
        { text: 'BEAM: SPACEBAR', color: '#ff0' },
        { text: 'BOMB: B OR X', color: '#f80' },
        { text: 'WARP JUKE: DOUBLE-TAP ARROWS OR SHIFT + ARROW', color: '#0f0' },
        { text: 'HAVE FUN!', color: '#fff' }
    ];

    items.forEach((item, index) => {
        const id = setTimeout(() => {
            if (gameState !== 'PLAYING' || wave !== 1) return;
            createFloatingText(
                canvas.width / 2,
                baseY + index * 28,
                item.text,
                item.color,
                { lifetime: 2.5, vy: -10, fontSize: 22 }
            );
        }, index * step * 1000);
        tutorialTimeouts.push(id);
    });
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
        this.hoverOffset = 0;
        this.hoverTime = 0;
        this.beamRotation = 0; // For spiral effect
        this.invincibleTimer = 0; // Invincibility after revive
        this.warpGhosts = []; // Ghost trail positions for visual effect
        this.turretActive = false; // Laser turret active
        this.turretTarget = null; // Current turret target
        this.turretSoundTimer = 0; // Timer for continuous firing sound
        this.turretOutOfEnergy = false; // Flag to prevent repeated stop sound when out of energy
        this.turretStopSoundCooldown = 0; // Cooldown to prevent repeated stop sounds
        this.vx = 0; // Track horizontal velocity for bomb physics
        this.lastX = this.x; // For velocity calculation
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

        // Update invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // Update warp ghosts
        for (let i = this.warpGhosts.length - 1; i >= 0; i--) {
            this.warpGhosts[i].alpha -= dt / CONFIG.WARP_JUKE_GHOST_DURATION;
            if (this.warpGhosts[i].alpha <= 0) {
                this.warpGhosts.splice(i, 1);
            }
        }

        // Handle laser turret (T or Z key) - only if player owns turret
        const wantsTurret = (keys['KeyT'] || keys['KeyZ']) && playerInventory.hasTurret;
        // Require minimum energy to fire; once depleted, need more energy to restart
        const minEnergyToStart = CONFIG.TURRET_ENERGY_COST * 0.5; // Need 0.5 seconds worth to start
        const canFireTurret = this.energy >= minEnergyToStart && !this.turretOutOfEnergy;

        // Update stop sound cooldown
        if (this.turretStopSoundCooldown > 0) {
            this.turretStopSoundCooldown -= dt;
        }

        // Reset out-of-energy state when player releases the turret key
        if (!wantsTurret) {
            this.turretOutOfEnergy = false;
        }

        if (wantsTurret && canFireTurret) {
            if (!this.turretActive) {
                SFX.turretStart && SFX.turretStart();
            }
            this.turretActive = true;
            this.energy -= CONFIG.TURRET_ENERGY_COST * dt;

            // Check if we just ran out of energy
            if (this.energy <= 0) {
                this.energy = 0;
            }

            // Find closest tank in range
            this.turretTarget = this.findTurretTarget();

            // Deal damage to target
            if (this.turretTarget) {
                const damage = CONFIG.TURRET_DAMAGE_PER_SECOND * (1 + playerInventory.turretDamageBonus) * dt;
                this.turretTarget.takeDamage(damage);

                // Play continuous firing sound
                this.turretSoundTimer -= dt;
                if (this.turretSoundTimer <= 0) {
                    SFX.turretFiring && SFX.turretFiring();
                    this.turretSoundTimer = 0.1; // Play sound every 0.1 seconds
                }
            }
        } else {
            // Turret forced off while player wants it - mark as out of energy to prevent
            // rapid on/off cycling when energy hovers near the threshold
            if (wantsTurret) {
                this.turretOutOfEnergy = true;
            }

            // Only play stop sound once when turret was active, with cooldown
            if (this.turretActive && this.turretStopSoundCooldown <= 0) {
                SFX.turretStop && SFX.turretStop();
                this.turretStopSoundCooldown = 1.0; // Don't play stop sound again for 1 second
            }
            this.turretActive = false;
            this.turretTarget = null;
            this.turretSoundTimer = 0;
        }

        // Handle beam activation
        const wantsBeam = keys['Space'];
        const canFireBeam = (activePowerups.energy_surge.active || this.energy >= CONFIG.ENERGY_MIN_TO_FIRE) && !this.beamOutOfEnergy;

        // Reset out-of-energy state when player releases spacebar
        if (!wantsBeam) {
            this.beamOutOfEnergy = false;
        }

        if (wantsBeam && canFireBeam) {
            // Start beam sound on activation
            if (!this.beamActive) {
                SFX.beamOn();
                SFX.startBeamLoop();
            }
            this.beamActive = true;
            if (!activePowerups.energy_surge.active) {
                this.energy -= CONFIG.ENERGY_DRAIN_RATE * dt;
            }

            // Check for target lock
            if (!this.beamTarget) {
                this.beamTarget = this.findTargetInBeam();
                if (this.beamTarget) {
                    this.beamTarget.beingAbducted = true;
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
                    // Target falls back to ground
                    this.beamTarget.y = this.beamTarget.groundY;
                }
                this.beamTarget = null;
            }
            this.beamActive = false;

            // Energy recharge when not beaming
        const rechargeRate = CONFIG.ENERGY_RECHARGE_RATE * (1 + playerInventory.energyRechargeBonus);
        this.energy = Math.min(this.maxEnergy, this.energy + rechargeRate * dt);
        }

        // Clamp energy
        this.energy = Math.max(0, this.energy);

        // Auto-deactivate beam if energy depleted
        if (this.energy <= 0) {
            if (this.beamActive) {
                SFX.stopBeamLoop();
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
                this.beamTarget.y = this.beamTarget.groundY;
                this.beamTarget = null;
            }
            this.beamActive = false;
        }

        // Movement (only if not actively abducting a target)
        const isAbducting = this.beamActive && this.beamTarget;
        if (!isAbducting) {
            let moved = false;
            const effectiveSpeed = CONFIG.UFO_SPEED * (1 + playerInventory.speedBonus);
            if (keys['ArrowLeft'] || keys['KeyA']) {
                this.x -= effectiveSpeed * dt;
                moved = true;
            }
            if (keys['ArrowRight'] || keys['KeyD']) {
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

    findTurretTarget() {
        // Find the closest tank within range
        let closestTarget = null;
        let closestDistance = Infinity;

        // Check regular tanks
        for (const tank of tanks) {
            if (!tank.alive || tank.isStunned) continue;

            const tankCenterX = tank.x + tank.width / 2;
            const tankCenterY = tank.y + tank.height / 2;
            const dx = tankCenterX - this.x;
            const dy = tankCenterY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.TURRET_RANGE && distance < closestDistance) {
                closestDistance = distance;
                closestTarget = tank;
            }
        }

        // Check heavy tanks
        for (const heavyTank of heavyTanks) {
            if (!heavyTank.alive || heavyTank.isStunned) continue;

            const tankCenterX = heavyTank.x + heavyTank.width / 2;
            const tankCenterY = heavyTank.y + heavyTank.height / 2;
            const dx = tankCenterX - this.x;
            const dy = tankCenterY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.TURRET_RANGE && distance < closestDistance) {
                closestDistance = distance;
                closestTarget = heavyTank;
            }
        }

        return closestTarget;
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
            this.renderBeam();
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

        // Render laser turret beam or scanning effect
        if (this.turretActive) {
            if (this.turretTarget) {
                this.renderLaserBeam();
            } else {
                this.renderTurretScanning();
            }
        }
    }

    renderTurretScanning() {
        // Show a scanning effect when turret is active but no target in range
        ctx.save();

        const time = Date.now() / 1000;
        const scanAngle = Math.sin(time * 2) * 0.5; // Sweep back and forth
        const scanLength = CONFIG.TURRET_RANGE;
        const startX = this.x;
        const startY = this.y + this.height / 2;

        // Calculate end point of scan beam
        const baseAngle = Math.PI / 2; // Pointing down
        const angle = baseAngle + scanAngle;
        const endX = startX + Math.cos(angle) * scanLength;
        const endY = startY + Math.sin(angle) * scanLength;

        // Draw gradient trail behind the scan line (shows recent sweep path)
        const trailSteps = 8;
        for (let i = trailSteps; i >= 1; i--) {
            const trailTime = time - i * 0.03;
            const trailAngle = baseAngle + Math.sin(trailTime * 2) * 0.5;
            const trailEndX = startX + Math.cos(trailAngle) * scanLength;
            const trailEndY = startY + Math.sin(trailAngle) * scanLength;
            const alpha = (1 - i / trailSteps) * 0.15;

            ctx.strokeStyle = `rgba(255, 50, 50, ${alpha})`;
            ctx.lineWidth = 6 - i * 0.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(trailEndX, trailEndY);
            ctx.stroke();
        }

        // Draw main scanning beam with gradient
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 50, 50, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw brighter core line
        ctx.strokeStyle = 'rgba(255, 200, 200, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw scanning dot at the end
        const pulse = Math.sin(time * 10) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
        ctx.beginPath();
        ctx.arc(endX, endY, 5 + pulse * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw range arc (bottom half only, where tanks are)
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.arc(startX, startY, scanLength, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();

        ctx.restore();
    }

    renderLaserBeam() {
        const target = this.turretTarget;
        const targetX = target.x + target.width / 2;
        const targetY = target.y + target.height / 2;

        // Draw main laser beam
        ctx.save();

        // Outer glow
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.3)';
        ctx.lineWidth = CONFIG.TURRET_BEAM_WIDTH * 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Middle glow
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.lineWidth = CONFIG.TURRET_BEAM_WIDTH * 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Core beam
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.9)';
        ctx.lineWidth = CONFIG.TURRET_BEAM_WIDTH;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Impact effect at target
        const impactPulse = Math.sin(Date.now() / 30) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 100, 50, ${0.3 + impactPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 15 + impactPulse * 10, 0, Math.PI * 2);
        ctx.fill();

        // Sparks at impact point
        if (Math.random() < 0.3) {
            const sparkAngle = Math.random() * Math.PI * 2;
            const sparkSpeed = 50 + Math.random() * 100;
            particles.push(new Particle(
                targetX + (Math.random() - 0.5) * 20,
                targetY + (Math.random() - 0.5) * 20,
                Math.cos(sparkAngle) * sparkSpeed,
                Math.sin(sparkAngle) * sparkSpeed,
                'rgba(255, 200, 50, 0.8)',
                2 + Math.random() * 2,
                0.15 + Math.random() * 0.1
            ));
        }

        ctx.restore();
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

    renderEnergyBar(y) {
        const barWidth = 120;
        const barHeight = 12;
        const x = this.x - barWidth / 2;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Energy level
        const energyPercent = this.energy / this.maxEnergy;
        let color;
        if (energyPercent > 0.5) {
            color = '#0f0';
        } else if (energyPercent > 0.25) {
            color = '#ff0';
        } else {
            color = '#f00';
            // Pulse effect when low
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth * energyPercent, barHeight);
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
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
        this.speed = CONFIG.TANK_BASE_SPEED + (wave - 1) * CONFIG.TANK_SPEED_INCREMENT;
        this.speed = Math.min(this.speed, 100); // Cap at 100

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

        // Health (for laser turret damage)
        this.health = CONFIG.TANK_HEALTH;
        this.maxHealth = CONFIG.TANK_HEALTH;
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

            // Check if abduction complete
            if (this.abductionProgress >= this.abductionTime) {
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

        // Aim turret at UFO
        if (ufo) {
            const turretX = this.x + this.width / 2;
            const turretY = this.y;
            const dx = ufo.x - turretX;
            const dy = ufo.y - turretY;
            const targetAngle = Math.atan2(dy, dx);

            // Smooth turret rotation
            const angleDiff = targetAngle - this.turretAngle;
            this.turretAngle += angleDiff * 5 * dt;
        }

        // Fire at UFO
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && ufo) {
            this.fire();
            const [minInterval, maxInterval] = CONFIG.TANK_FIRE_INTERVAL;
            // Fire rate increases with wave
            const fireRateMultiplier = 1 + (wave - 1) * 0.1;
            this.fireTimer = (minInterval + Math.random() * (maxInterval - minInterval)) / Math.min(fireRateMultiplier, 1.5);
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

        const img = images.tank;

        // Check if being targeted by turret
        const isBeingLasered = ufo && ufo.turretTarget === this;

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

        // Draw laser damage flash effect (flashes faster as health drops)
        if (isBeingLasered) {
            const healthPercent = this.health / this.maxHealth;
            // Flash speed: 4 Hz at full health, up to 20 Hz near death
            const flashSpeed = 4 + (1 - healthPercent) * 16;
            const flash = Math.sin(Date.now() / 1000 * flashSpeed * Math.PI * 2);

            if (flash > 0) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + (1 - healthPercent) * 0.4})`;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.restore();

                // Also draw an overlay on top
                ctx.fillStyle = `rgba(255, 50, 50, ${(0.2 + (1 - healthPercent) * 0.3) * flash})`;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

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

        // Turret base
        ctx.fillStyle = '#3a4a2f';
        ctx.beginPath();
        ctx.arc(turretX, turretY, 22, 0, Math.PI * 2);
        ctx.fill();

        // Turret barrel
        ctx.strokeStyle = '#2a3a1f';
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
                ufo.health -= this.damage;
                waveStats.hitsTaken++;

                // Create small explosion at hit point
                createExplosion(this.x, this.y, 'small');

                // Sound and visual effects
                SFX.ufoHit();
                screenShake = 0.2;
                damageFlash = 0.15;
                createFloatingText(ufo.x, ufo.y - 30, `-${this.damage}`, '#f00');

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
        const ufoRadius = ufo.width / 2.5; // Approximate collision radius

        const dx = this.x - ufoCenterX;
        const dy = this.y - ufoCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < ufoRadius + this.radius;
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

        if (this.abductionProgress >= this.abductionTime) {
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
                // Green cross/plus shape
                ctx.fillStyle = '#0f0';
                ctx.fillRect(x - 5, y - 15, 10, 30);
                ctx.fillRect(x - 15, y - 5, 30, 10);
                ctx.strokeRect(x - 5, y - 15, 10, 30);
                ctx.strokeRect(x - 15, y - 5, 30, 10);
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
    const types = Object.entries(CONFIG.POWERUPS);
    const totalWeight = types.reduce((sum, [_, cfg]) => sum + cfg.spawnWeight, 0);
    let rand = Math.random() * totalWeight;

    for (const [type, cfg] of types) {
        rand -= cfg.spawnWeight;
        if (rand <= 0) return type;
    }
    return 'health_pack'; // fallback
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
                createFloatingText(ufo.x, ufo.y - 60, `${CONFIG.POWERUPS[key].name} ENDED`, '#888');
            }
        }
    }
}

// ============================================
// HEAVY TANK CLASS (Supertank)
// ============================================

class HeavyTank {
    constructor(x, direction) {
        // 2x the size of regular tank
        this.width = 240;
        this.height = 150;
        this.x = x;
        this.y = canvas.height - 60 - this.height; // On ground
        this.direction = direction; // 1 = right, -1 = left
        // Slower than regular tanks
        this.speed = (CONFIG.TANK_BASE_SPEED + (wave - 1) * CONFIG.TANK_SPEED_INCREMENT) * 0.6;
        this.speed = Math.min(this.speed, 60); // Cap at 60

        // Dual turrets - left and right
        this.turretAngleLeft = 0;
        this.turretAngleRight = 0;
        this.turretLength = 60;
        this.turretSpacing = 70; // Distance from center to each turret

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

        // Health (for laser turret damage)
        this.health = CONFIG.HEAVY_TANK_HEALTH;
        this.maxHealth = CONFIG.HEAVY_TANK_HEALTH;

        // Bomb damage tracking (takes 2 bombs to destroy)
        this.bombHits = 0;
        this.isDamaged = false;
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

            // Check if abduction complete
            if (this.abductionProgress >= this.abductionTime) {
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

        // Aim both turrets at UFO
        if (ufo) {
            // Left turret
            const leftTurretX = this.x + this.width / 2 - this.turretSpacing;
            const leftTurretY = this.y + 20;
            const dxLeft = ufo.x - leftTurretX;
            const dyLeft = ufo.y - leftTurretY;
            const targetAngleLeft = Math.atan2(dyLeft, dxLeft);
            this.turretAngleLeft += (targetAngleLeft - this.turretAngleLeft) * 5 * dt;

            // Right turret
            const rightTurretX = this.x + this.width / 2 + this.turretSpacing;
            const rightTurretY = this.y + 20;
            const dxRight = ufo.x - rightTurretX;
            const dyRight = ufo.y - rightTurretY;
            const targetAngleRight = Math.atan2(dyRight, dxRight);
            this.turretAngleRight += (targetAngleRight - this.turretAngleRight) * 5 * dt;
        }

        // Fire missiles at UFO (alternating turrets)
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && ufo) {
            this.fire();
            // Fire rate increases slightly with wave
            const fireRateMultiplier = 1 + (wave - 3) * 0.1;
            this.fireTimer = 1.5 / Math.min(fireRateMultiplier, 1.5);
        }
    }

    fire() {
        // Determine which turret fires
        const isLeft = this.nextTurret === 'left';
        this.nextTurret = isLeft ? 'right' : 'left';

        const turretX = this.x + this.width / 2 + (isLeft ? -this.turretSpacing : this.turretSpacing);
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

        const img = images.tank;

        // Check if being targeted by turret
        const isBeingLasered = ufo && ufo.turretTarget === this;

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

        // Draw laser damage flash effect (flashes faster as health drops)
        if (isBeingLasered) {
            const healthPercent = this.health / this.maxHealth;
            // Flash speed: 4 Hz at full health, up to 20 Hz near death
            const flashSpeed = 4 + (1 - healthPercent) * 16;
            const flash = Math.sin(Date.now() / 1000 * flashSpeed * Math.PI * 2);

            if (flash > 0) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + (1 - healthPercent) * 0.4})`;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.restore();

                // Also draw an overlay on top
                ctx.fillStyle = `rgba(255, 50, 50, ${(0.2 + (1 - healthPercent) * 0.3) * flash})`;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

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
        const centerX = this.x + this.width / 2;
        const turretY = this.y + 30;

        // Left turret
        const leftTurretX = centerX - this.turretSpacing;
        this.renderSingleTurret(leftTurretX, turretY, this.turretAngleLeft);

        // Right turret
        const rightTurretX = centerX + this.turretSpacing;
        this.renderSingleTurret(rightTurretX, turretY, this.turretAngleRight);
    }

    renderSingleTurret(x, y, angle) {
        // Turret base (larger than regular tank)
        ctx.fillStyle = '#2a3a1f';
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fill();

        // Turret barrel (thicker)
        ctx.strokeStyle = '#1a2a0f';
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
// TANK SPAWNING
// ============================================

let heavyTanks = [];

function spawnTanks() {
    const tankCount = CONFIG.TANKS_BASE + (wave - 1) * CONFIG.TANKS_INCREMENT;

    tanks = [];
    for (let i = 0; i < tankCount; i++) {
        // Spread tanks across the screen width
        // Each tank gets a different starting position
        const margin = 100;
        const availableWidth = canvas.width - margin * 2;
        const x = margin + (i / Math.max(1, tankCount - 1)) * availableWidth;
        // Alternate direction based on which half of screen they're on
        const direction = x < canvas.width / 2 ? 1 : -1;
        tanks.push(new Tank(x, direction));
    }

    // Spawn heavy tanks starting at wave 3
    heavyTanks = [];
    if (wave >= 3) {
        // Wave 3: 1 heavy tank, Wave 4+: 2 heavy tanks
        const heavyTankCount = wave === 3 ? 1 : 2;

        for (let i = 0; i < heavyTankCount; i++) {
            // Spawn heavy tanks from opposite edges
            const direction = i % 2 === 0 ? 1 : -1;
            const x = direction === 1 ? -240 : canvas.width;
            heavyTanks.push(new HeavyTank(x, direction));
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

    // Consume a bomb
    playerInventory.bombs--;
    if (playerInventory.bombs < playerInventory.maxBombs) {
        playerInventory.bombRechargeTimers.push(CONFIG.BOMB_RECHARGE_TIME);
    }

    // Create bomb at UFO position with UFO's horizontal velocity
    bombs.push(new Bomb(ufo.x, ufo.y + ufo.height / 2, ufo.vx));

    // Play bomb drop sound
    SFX.bombDrop && SFX.bombDrop();

    // Visual feedback
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
// WARP JUKE SYSTEM
// ============================================

function triggerWarpJuke(direction) {
    // Check if we have enough beam energy to warp
    if (!ufo || ufo.energy < CONFIG.WARP_JUKE_ENERGY_COST) return;

    // Consume beam energy
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
    const warpDistance = CONFIG.WARP_JUKE_DISTANCE * direction;
    ufo.x = Math.max(ufo.width / 2, Math.min(canvas.width - ufo.width / 2, ufo.x + warpDistance));

    // Create warp effect particles
    // Trail particles from old position to new
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
            // Go directly to feedback screen
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

async function trackSession() {
    try {
        await fetch(`${API_BASE}/api/session`, { method: 'POST' });
    } catch (e) {
        // Silently ignore - session tracking is non-critical
    }
}

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
    gameState = 'TITLE';
    fetchLeaderboard();
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
            // Navigate to title screen with feedback tab after sound plays
            setTimeout(() => {
                resetFeedbackState();
                gameState = 'TITLE';
                titleTab = 'feedback';
                fetchLeaderboard();
                fetchFeedback();
            }, 400);
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
    clearTutorialTimeouts();
    gameState = 'PLAYING';
    gameStartTime = Date.now();
    firstPointTracked = false; // Reset for new game session
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
    wave = 1;
    waveTimer = CONFIG.WAVE_DURATION;
    targetSpawnTimer = 0; // Spawn first target immediately
    screenShake = 0;
    damageFlash = 0;
    lastTimerWarningSecond = -1;

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
        energyRechargeBonus: 0,
        turretDamageBonus: 0,
        hasTurret: titleTurretUnlocked // Easter egg: free turret if unlocked on title screen
    };

    // Reset Easter egg state for next game
    titleTurretUnlocked = false;
    titleTurretFlashTimer = 0;
    titleTurretTaps = [];

    // Clear active bombs
    bombs = [];

    // Spawn initial tanks
    spawnTanks();

    scheduleTutorialHints();
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
    const turretPanelWidth = (() => {
        if (!playerInventory.hasTurret) return 0;
        const iconSize = 22;
        const turretPadding = 8;
        const keyWidth = 20;
        const keyPadding = 6;
        const labelText = 'TURRET';
        const labelGap = 8;
        ctx.font = 'bold 10px monospace';
        const labelWidth = ctx.measureText(labelText).width;
        return labelWidth + labelGap + keyWidth + keyPadding + iconSize + turretPadding * 2;
    })();
    const energyBonusWidth = playerInventory.maxEnergyBonus > 0 ? 110 : 0;
    const speedWidth = playerInventory.speedBonus > 0 ? 90 : 0;
    const rightHudWidth = Math.max(
        shieldPanelWidth,
        energyCellsWidth,
        bombPanelWidth,
        turretPanelWidth,
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

    // ========== TURRET INDICATOR (below bomb count) ==========
    renderTurretIndicator(rightHudPanelX, shieldY + shieldBarHeight + 100);

    // ========== ENERGY BONUS INDICATOR (below turret indicator) ==========
    renderEnergyBonusIndicator(rightHudPanelX, shieldY + shieldBarHeight + 142);

    // ========== SPEED INDICATOR (below energy bonus) ==========
    renderSpeedIndicator(rightHudPanelX, shieldY + shieldBarHeight + 170);

    // ========== TOP CENTER: HARVEST COUNTER ==========
    renderHarvestCounter();
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

function renderTurretIndicator(startX, startY) {
    // Only show turret indicator if player owns the turret
    if (!ufo || !playerInventory.hasTurret) return;

    const iconSize = 22;
    const panelPadding = 8;
    const keyWidth = 20;
    const keyHeight = 18;
    const keyPadding = 6;
    const isActive = ufo.turretActive && ufo.turretTarget;
    const labelText = 'TURRET';
    const labelGap = 8;

    // Calculate total width: label + key + icon
    ctx.font = 'bold 10px monospace';
    const labelWidth = ctx.measureText(labelText).width;
    const panelWidth = labelWidth + labelGap + keyWidth + keyPadding + iconSize + panelPadding * 2;
    const panelHeight = Math.max(iconSize, keyHeight) + panelPadding * 2;

    // Panel background
    ctx.fillStyle = isActive ? 'rgba(255, 100, 100, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(startX, startY, panelWidth, panelHeight, 8);
    ctx.fill();

    // Active indicator with pulse
    if (isActive) {
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(255, 150, 150, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Label text (left of key)
    ctx.fillStyle = isActive ? '#ffb6b6' : '#bbb';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    const labelX = startX + panelPadding;
    ctx.fillText(labelText, labelX, startY + panelHeight / 2 + 4);

    // Keyboard key badge for T/Z (after label)
    const keyX = labelX + labelWidth + labelGap;
    const keyY = startY + (panelHeight - keyHeight) / 2;

    // Key background (raised look)
    ctx.fillStyle = isActive ? '#664444' : '#444';
    ctx.beginPath();
    ctx.roundRect(keyX, keyY, keyWidth, keyHeight, 4);
    ctx.fill();

    // Key top surface
    ctx.fillStyle = isActive ? '#886666' : '#666';
    ctx.beginPath();
    ctx.roundRect(keyX + 1, keyY + 1, keyWidth - 2, keyHeight - 4, 3);
    ctx.fill();

    // Key letter
    ctx.fillStyle = isActive ? '#ffaaaa' : '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('T/Z', keyX + keyWidth / 2, keyY + keyHeight / 2 + 3);

    // Draw turret icon (laser gun shape) - after the key
    const iconX = keyX + keyWidth + keyPadding + iconSize / 2;
    const iconY = startY + panelHeight / 2;
    const iconColor = isActive ? '#ff6666' : '#888';
    const beamColor = isActive ? '#ff4444' : '#666';

    // Turret base (small rectangle)
    ctx.fillStyle = iconColor;
    ctx.beginPath();
    ctx.roundRect(iconX - 5, iconY + 3, 10, 5, 2);
    ctx.fill();

    // Turret body (angled barrel)
    ctx.save();
    ctx.translate(iconX, iconY + 1);
    ctx.rotate(-Math.PI / 6); // Angle upward

    // Barrel
    ctx.fillStyle = iconColor;
    ctx.beginPath();
    ctx.roundRect(-3, -10, 6, 12, 2);
    ctx.fill();

    // Barrel tip / emitter
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.roundRect(-2, -12, 4, 3, 1);
    ctx.fill();

    // Laser beam (when active)
    if (isActive) {
        const beamPulse = Math.sin(Date.now() / 50) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(255, 100, 100, ${beamPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, -18);
        ctx.stroke();

        // Beam glow
        ctx.strokeStyle = `rgba(255, 200, 200, ${beamPulse * 0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, -16);
        ctx.stroke();
    }

    ctx.restore();

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
    const panelY = 12;

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
            walkSpeed: 0.8 + Math.random() * 0.6 // Vary walking speed slightly
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
        const img = images.human;
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

    // Easter egg: Turret unlock visual feedback - red bar at top
    if (titleTurretUnlocked && titleTurretFlashTimer > 0) {
        // Update flash timer
        titleTurretFlashTimer -= 1/60; // Approximate dt

        const barHeight = 36;
        const fadeStart = 1.5; // Start fading in the last 1.5 seconds
        const alpha = titleTurretFlashTimer < fadeStart ? titleTurretFlashTimer / fadeStart : 1;
        const flashIntensity = Math.sin(Date.now() / 80) * 0.3 + 0.7;

        ctx.save();

        // Red bar background
        ctx.fillStyle = `rgba(180, 30, 30, ${alpha * 0.9})`;
        ctx.fillRect(0, 0, canvas.width, barHeight);

        // Bottom border glow
        ctx.strokeStyle = `rgba(255, 100, 100, ${alpha * flashIntensity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, barHeight);
        ctx.lineTo(canvas.width, barHeight);
        ctx.stroke();

        // Text
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TURRET UNLOCKED! Press T or Z to fire during game', canvas.width / 2, barHeight / 2 + 5);

        ctx.restore();
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
        { key: 'difficulty', label: 'Difficulty?', icon: '💪' },
        { key: 'returnIntent', label: 'Play again?', icon: '🔄' }
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
        ctx.fillText('Submitting...', centerX, buttonsY);
        buttonsY += 50;
    } else {
        const allRated = feedbackRatings.enjoyment > 0 && feedbackRatings.difficulty > 0 && feedbackRatings.returnIntent > 0;
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        if (allRated) {
            ctx.fillStyle = '#0ff';
            ctx.fillText('Ready to send! Click Send Feedback below.', centerX, buttonsY);
        } else {
            ctx.fillStyle = '#666';
            ctx.fillText('Rate all three to send feedback', centerX, buttonsY);
        }
        buttonsY += 50;
    }

    // Buttons - three buttons in a row
    const buttonWidth = 160;
    const buttonHeight = 48;
    const buttonGap = 20;
    const totalButtonsWidth = buttonWidth * 3 + buttonGap * 2;
    const buttonsStartX = centerX - totalButtonsWidth / 2;

    const allRated = feedbackRatings.enjoyment > 0 && feedbackRatings.difficulty > 0 && feedbackRatings.returnIntent > 0;
    const canSend = allRated && !ratingsSubmitting && !ratingsSubmitted;

    // Send Feedback button (left)
    const sendBtnX = buttonsStartX;

    ctx.fillStyle = canSend ? '#0aa' : '#444';
    ctx.beginPath();
    ctx.roundRect(sendBtnX, buttonsY, buttonWidth, buttonHeight, 8);
    ctx.fill();
    if (canSend) {
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    feedbackButtonBounds.submit = { x: sendBtnX, y: buttonsY, width: buttonWidth, height: buttonHeight };

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = canSend ? '#fff' : '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Send Feedback', sendBtnX + buttonWidth / 2, buttonsY + 30);

    // Play Again button (center) - prominent green
    const playBtnX = buttonsStartX + buttonWidth + buttonGap;

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
    const menuBtnX = buttonsStartX + (buttonWidth + buttonGap) * 2;

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
        points: 0,
        bonusPoints: 0,
        maxComboHit: false
    };
}

function resetWaveStats() {
    waveStats = createWaveStats();
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
            id: 'combo',
            label: 'COMBO KING',
            earned: stats.maxComboHit,
            detail: '3x combo',
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
        cumulativeScore: score
    };
}

function startWaveSummary(completedWave) {
    waveSummary = buildWaveSummary(completedWave);

    const targetsDuration = TARGET_TYPES.length * WAVE_SUMMARY_TIMING.targetPer;
    const bonusesDuration = waveSummary.bonuses.length * WAVE_SUMMARY_TIMING.bonusPer;
    const titleEnd = WAVE_SUMMARY_TIMING.title;
    const targetsEnd = titleEnd + targetsDuration;
    const pointsEnd = targetsEnd + WAVE_SUMMARY_TIMING.points;
    const bonusesEnd = pointsEnd + bonusesDuration;
    const bucksEnd = bonusesEnd + WAVE_SUMMARY_TIMING.bucks;
    const totalsEnd = bucksEnd + WAVE_SUMMARY_TIMING.totals;

    waveSummaryState = {
        elapsed: 0,
        pointsCount: new CountUpAnimation(0, waveSummary.wavePoints, WAVE_SUMMARY_TIMING.points),
        bucksCount: new CountUpAnimation(0, waveSummary.ufoBucksEarned, WAVE_SUMMARY_TIMING.bucks),
        pointsStarted: false,
        bucksStarted: false,
        targetsRevealed: 0,
        lastTargetsRevealed: 0,
        bonusesRevealed: 0,
        complete: false,
        postCompleteTimer: 0,
        awarded: false,
        pointsTickCooldown: 0,
        bucksTickCooldown: 0,
        lastPointsValue: 0,
        lastBucksValue: 0,
        timings: { titleEnd, targetsEnd, pointsEnd, bonusesEnd, bucksEnd, totalsEnd }
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
    waveSummaryState.pointsCount.finish();
    waveSummaryState.bucksCount.finish();
    waveSummaryState.complete = true;
    waveSummaryState.postCompleteTimer = 0;
    finalizeWaveSummary();
}

function enterShopFromSummary() {
    finalizeWaveSummary();
    shopTimer = CONFIG.SHOP_DURATION;
    selectedShopItem = 0;
    shopCart = [];
    gameState = 'SHOP';
    SFX.startShopMusic && SFX.startShopMusic();
}

function updateWaveSummary(dt) {
    if (!waveSummary || !waveSummaryState) return;

    waveSummaryState.elapsed += dt;
    waveSummaryState.pointsTickCooldown = Math.max(0, waveSummaryState.pointsTickCooldown - dt);
    waveSummaryState.bucksTickCooldown = Math.max(0, waveSummaryState.bucksTickCooldown - dt);

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
    }

    if (waveSummaryState.elapsed >= waveSummaryState.timings.pointsEnd) {
        const revealCount = Math.floor((waveSummaryState.elapsed - waveSummaryState.timings.pointsEnd) / WAVE_SUMMARY_TIMING.bonusPer) + 1;
        waveSummaryState.bonusesRevealed = Math.min(waveSummary.bonuses.length, Math.max(0, revealCount));
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
    }

    if (!waveSummaryState.complete && waveSummaryState.elapsed >= waveSummaryState.timings.totalsEnd) {
        waveSummaryState.complete = true;
        waveSummaryState.postCompleteTimer = 0;
        finalizeWaveSummary();
    }

    if (waveSummaryState.complete) {
        waveSummaryState.postCompleteTimer += dt;
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
    for (let i = 0; i < visibleCount; i++) {
        const type = TARGET_TYPES[i];
        const x = startX + i * spacing;
        const count = counts[type] || 0;
        const total = totals ? (totals[type] || 0) : 0;
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
                ctx.fillRect(x - iconSize / 2, y - 6, iconSize, 12);
                ctx.fillRect(x - 4, y - 12, 8, 10);
            } else {
                ctx.beginPath();
                ctx.arc(x, y, iconSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = count > 0 ? '#0f0' : '#555';
        ctx.font = 'bold 16px monospace';
        const label = totals ? `${count}/${total}` : count.toString();
        ctx.fillText(label, x, y + iconSize / 2 + 18);
    }
}

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
    const panelHeight = Math.min(600, canvas.height * 0.85);
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
    cursorY += 52;

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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + padding, cursorY);
    ctx.lineTo(panelX + panelWidth - padding, cursorY);
    ctx.stroke();
    cursorY += 26;

    // Wave points
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WAVE POINTS', panelX + padding, cursorY);
    ctx.textAlign = 'right';
    const pointsValue = waveSummaryState.pointsStarted ? waveSummaryState.pointsCount.current : 0;
    ctx.fillStyle = '#ff0';
    ctx.fillText(pointsValue.toLocaleString(), panelX + panelWidth - padding, cursorY);
    cursorY += 30;

    if (waveSummary.bonusPoints > 0 && waveSummaryState.pointsStarted) {
        ctx.fillStyle = '#aaa';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BONUS POINTS', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f0';
        ctx.fillText(`+${waveSummary.bonusPoints.toLocaleString()}`, panelX + panelWidth - padding, cursorY);
        cursorY += 26;
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
        ctx.fillStyle = bonus.earned ? '#0f0' : '#555';
        ctx.textAlign = 'left';
        ctx.fillText(bonus.label, panelX + padding, cursorY);
        ctx.fillStyle = bonus.earned ? '#fff' : '#444';
        ctx.font = '14px monospace';
        ctx.fillText(`(${bonus.detail})`, panelX + padding + 210, cursorY);
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = bonus.earned ? '#ff0' : '#444';
        ctx.fillText(bonus.earned ? '+25%' : '--', panelX + panelWidth - padding, cursorY);
        cursorY += 22;
    }
    cursorY += 8;

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(panelX + padding, cursorY);
    ctx.lineTo(panelX + panelWidth - padding, cursorY);
    ctx.stroke();
    cursorY += 24;

    // UFO Bucks calculation
    if (waveSummaryState.bucksStarted) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('UFO BUCKS', panelX + padding, cursorY);
        cursorY += 20;

        ctx.font = '16px monospace';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('BASE', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.fillText(waveSummary.baseUfoBucks.toString(), panelX + panelWidth - padding, cursorY);
        cursorY += 18;

        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('BONUS', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.fillText(waveSummary.bonusUfoBucks.toString(), panelX + panelWidth - padding, cursorY);
        cursorY += 20;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(panelX + padding, cursorY);
        ctx.lineTo(panelX + panelWidth - padding, cursorY);
        ctx.stroke();
        cursorY += 18;

        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#ff0';
        ctx.textAlign = 'left';
        ctx.fillText('UFO BUCKS EARNED', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        const bucksValue = waveSummaryState.bucksCount.current;
        ctx.fillText(bucksValue.toString(), panelX + panelWidth - padding, cursorY);
        cursorY += 28;
    }

    if (waveSummaryState.elapsed >= waveSummaryState.timings.bucksEnd) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL UFO BUCKS', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f0';
        ctx.fillText(waveSummary.ufoBucksAfter.toString(), panelX + panelWidth - padding, cursorY);
        cursorY += 22;

        ctx.fillStyle = '#bbb';
        ctx.textAlign = 'left';
        ctx.fillText('CUMULATIVE SCORE', panelX + padding, cursorY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.fillText(waveSummary.cumulativeScore.toLocaleString(), panelX + panelWidth - padding, cursorY);
        cursorY += 26;
    }

    if (waveSummaryState.complete) {
        const remaining = Math.max(0, Math.ceil(WAVE_SUMMARY_TIMING.autoContinue - waveSummaryState.postCompleteTimer));
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`CONTINUING IN ${remaining}...`, panelX + panelWidth / 2, panelY + panelHeight - 28);
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
        resetWaveStats();
        waveTimer = CONFIG.WAVE_DURATION;
        lastTimerWarningSecond = -1; // Reset timer warning
        gameState = 'PLAYING';

        if (turretHintPending) {
            createFloatingText(canvas.width / 2, canvas.height * 0.35, 'LASER TURRET READY: PRESS T OR Z', '#ffaaaa', {
                lifetime: 2.8,
                vy: -10,
                fontSize: 22
            });
            turretHintPending = false;
        }

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
    const tankCount = CONFIG.TANKS_BASE + (wave - 1) * CONFIG.TANKS_INCREMENT;
    const heavyTankCount = wave >= 3 ? (wave === 3 ? 1 : 2) : 0;
    ctx.font = '24px monospace';
    ctx.fillStyle = '#aaa';
    let waveText = `${tankCount} tank${tankCount > 1 ? 's' : ''}`;
    if (heavyTankCount > 0) {
        waveText += ` + ${heavyTankCount} HEAVY TANK${heavyTankCount > 1 ? 'S' : ''}`;
    }
    waveText += ' incoming!';
    ctx.fillText(waveText, canvas.width / 2, canvas.height / 2 + 100);

    // Render UI
    renderUI();
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

    // Continue updating particles for visual effect
    updateParticles(dt);
    updateFloatingTexts(dt);

    if (shopTimer <= 0) {
        // Shop time is up, start wave transition
        SFX.stopShopMusic && SFX.stopShopMusic();
        waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
        gameState = 'WAVE_TRANSITION';
    }
}

function renderShop() {
    // Render the game scene frozen (dimmed)
    ctx.save();
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
    ctx.restore();

    // Dark overlay for contrast (covers HUD too)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layout constants - grid and cart side by side, centered
    const gridCols = 3;
    const gridRows = 3;
    const cellSize = 130;
    const cellGap = 12;
    const gridWidth = gridCols * cellSize + (gridCols - 1) * cellGap;
    const gridHeight = gridRows * cellSize + (gridRows - 1) * cellGap;

    const cartWidth = 260;
    const cartGap = 40;
    const totalWidth = gridWidth + cartGap + cartWidth;
    const startX = (canvas.width - totalWidth) / 2;

    const gridStartX = startX;

    // ========== PROMINENT TIMER AT TOP ==========
    const secondsLeft = Math.ceil(shopTimer);

    const timerBarWidth = 400;
    const timerBarHeight = 40;
    const timerBarX = (canvas.width - timerBarWidth) / 2;
    const titleHeight = 44;
    const titleToTimerGap = 18;
    const timerToHeaderGap = 45;
    const headerToGridGap = 25;
    const gridToDoneGap = 20;
    const doneHeight = 50;
    const doneToInstructionsGap = 22;
    const instructionsHeight = 16;
    const layoutHeight = titleHeight + titleToTimerGap + timerBarHeight + timerToHeaderGap + headerToGridGap + gridHeight + gridToDoneGap + doneHeight + doneToInstructionsGap + instructionsHeight;
    const layoutTop = (canvas.height - layoutHeight) / 2;

    const titleY = layoutTop + titleHeight;
    const timerY = titleY + titleToTimerGap;
    const headerY = timerY + timerBarHeight + timerToHeaderGap;
    const gridStartY = headerY + headerToGridGap;
    const cartX = gridStartX + gridWidth + cartGap;
    const cartY = gridStartY;

    renderRainbowBouncyText('UFO SHOPPING MALL', canvas.width / 2, titleY - 6, 36);

    // Progress fill (shrinks as time runs out)
    const progress = shopTimer / CONFIG.SHOP_DURATION;
    ctx.fillStyle = secondsLeft <= 5 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.roundRect(timerBarX, timerY, timerBarWidth * progress, timerBarHeight, 6);
    ctx.fill();

    // Timer border
    ctx.strokeStyle = secondsLeft <= 5 ? '#f00' : '#0aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(timerBarX, timerY, timerBarWidth, timerBarHeight, 6);
    ctx.stroke();

    // Timer text
    ctx.fillStyle = secondsLeft <= 5 ? '#f00' : '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    const timerText = secondsLeft <= 5 ? `HURRY! ${secondsLeft}s` : `SHOP TIME: ${secondsLeft}s`;
    ctx.fillText(timerText, canvas.width / 2, timerY + 28);

    // Pulsing effect when low time
    if (secondsLeft <= 5) {
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // ========== HEADER: Title and Points ==========
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${ufoBucks} UFO BUCKS`, gridStartX, headerY);

    // Calculate cart total
    const cartTotal = shopCart.reduce((sum, itemId) => {
        const item = CONFIG.SHOP_ITEMS.find(i => i.id === itemId);
        return sum + (item ? item.cost : 0);
    }, 0);
    const bucksAfter = ufoBucks - cartTotal;

    // Clear bounds arrays
    shopItemBounds = [];
    shopCartBounds = [];

    // Define shop grid items (9 slots, some may be empty/locked)
    const gridItems = [
        'repair', 'shield_single', 'revive_cell',
        'speed_cell', 'max_energy', 'energy_recharge',
        'bomb_single', 'laser_turret', 'turret_damage'
    ];

    // Render 3x3 grid
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const idx = row * gridCols + col;
            const itemId = gridItems[idx];
            const item = itemId ? CONFIG.SHOP_ITEMS.find(i => i.id === itemId) : null;

            const x = gridStartX + col * (cellSize + cellGap);
            const y = gridStartY + row * (cellSize + cellGap);

            // Store bounds for click detection
            if (item) {
                shopItemBounds.push({ x, y, width: cellSize, height: cellSize, itemIndex: CONFIG.SHOP_ITEMS.findIndex(i => i.id === itemId) });
            } else {
                shopItemBounds.push(null); // Locked slot
            }

            if (!item) {
                // Locked/empty slot
                ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 10);
                ctx.fill();

                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Lock icon
                ctx.fillStyle = '#444';
                ctx.font = 'bold 32px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', x + cellSize / 2, y + cellSize / 2 + 10);

                ctx.fillStyle = '#333';
                ctx.font = '12px monospace';
                ctx.fillText('LOCKED', x + cellSize / 2, y + cellSize - 15);
                continue;
            }

            const isOwned = item.effect === 'turret' && playerInventory.hasTurret;
            const isLocked = item.requiresTurret && !playerInventory.hasTurret;
            const inCart = shopCart.filter(id => id === item.id).length;
            const canAfford = !isLocked && ((ufoBucks - cartTotal) >= item.cost || inCart > 0);
            const isSelected = idx === selectedShopItem;

            // Cell background
            if (isOwned) {
                ctx.fillStyle = 'rgba(0, 80, 0, 0.8)';
            } else if (inCart > 0) {
                ctx.fillStyle = 'rgba(0, 100, 100, 0.8)';
            } else if (isLocked) {
                ctx.fillStyle = 'rgba(30, 30, 30, 0.85)';
            } else if (canAfford) {
                ctx.fillStyle = 'rgba(20, 70, 40, 0.9)';
            } else if (isSelected) {
                ctx.fillStyle = 'rgba(60, 60, 80, 0.95)';
            } else {
                ctx.fillStyle = 'rgba(40, 40, 50, 0.9)';
            }
            ctx.beginPath();
            ctx.roundRect(x, y, cellSize, cellSize, 10);
            ctx.fill();

            if (canAfford && !isOwned && inCart === 0) {
                ctx.fillStyle = 'rgba(0, 255, 140, 0.08)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 8);
                ctx.fill();
            }

            // Border
            if (isSelected && !isOwned && !isLocked) {
                ctx.strokeStyle = '#ff0';
                ctx.lineWidth = 3;
            } else if (isOwned) {
                ctx.strokeStyle = '#0a0';
                ctx.lineWidth = 2;
            } else if (inCart > 0) {
                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 3;
            } else if (isLocked) {
                ctx.strokeStyle = '#444';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = canAfford ? '#0f0' : '#333';
                ctx.lineWidth = canAfford ? 3 : 2;
            }
            ctx.stroke();

            // Icon area (top portion)
            const iconY = y + 15;
            const iconSize = 50;
            renderShopIcon(item.id, x + cellSize / 2, iconY + iconSize / 2, iconSize, isOwned ? '#0a0' : item.color);

            // Item name
            ctx.fillStyle = isOwned ? '#0f0' : (canAfford ? '#fff' : '#555');
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(item.name, x + cellSize / 2, y + 78);

            // Cost or status
            if (isOwned) {
                ctx.fillStyle = '#0f0';
                ctx.font = 'bold 14px monospace';
                ctx.fillText('OWNED', x + cellSize / 2, y + 100);
            } else if (isLocked) {
                ctx.fillStyle = '#888';
                ctx.font = 'bold 12px monospace';
                ctx.fillText('REQ TURRET', x + cellSize / 2, y + 100);
            } else {
                ctx.fillStyle = canAfford ? '#ff0' : '#b55';
                ctx.font = 'bold 16px monospace';
                ctx.fillText(`${item.cost}`, x + cellSize / 2, y + 100);
            }

            // In-cart indicator
            if (inCart > 0 && !isOwned) {
                ctx.fillStyle = '#0ff';
                ctx.beginPath();
                ctx.arc(x + cellSize - 18, y + 18, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 14px monospace';
                ctx.fillText(inCart.toString(), x + cellSize - 18, y + 23);
            }

            // Description tooltip area
            if (isOwned) {
                ctx.fillStyle = '#8f8';
            } else if (isSelected) {
                ctx.fillStyle = '#fff';
            } else if (canAfford) {
                ctx.fillStyle = '#ddd';
            } else if (isLocked) {
                ctx.fillStyle = '#888';
            } else {
                ctx.fillStyle = '#bbb';
            }
            ctx.font = '11px monospace';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(item.description, x + cellSize / 2, y + cellSize - 12);
            ctx.shadowBlur = 0;
        }
    }

    // ========== SHOPPING CART (right side) ==========
    const cartHeight = gridHeight;

    // Cart background
    ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
    ctx.beginPath();
    ctx.roundRect(cartX, cartY, cartWidth, cartHeight, 12);
    ctx.fill();

    ctx.strokeStyle = '#0aa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cart title
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHOPPING CART', cartX + cartWidth / 2, cartY + 30);

    // Cart items
    const cartItemHeight = 35;
    const cartItemsStartY = cartY + 50;
    const maxVisibleItems = 8;

    if (shopCart.length === 0) {
        ctx.fillStyle = '#555';
        ctx.font = '14px monospace';
        ctx.fillText('Cart is empty', cartX + cartWidth / 2, cartItemsStartY + 40);
        ctx.fillText('Click items to add', cartX + cartWidth / 2, cartItemsStartY + 60);
    } else {
        // Group cart items by id and count
        const cartGroups = {};
        shopCart.forEach(id => {
            cartGroups[id] = (cartGroups[id] || 0) + 1;
        });

        let cartIdx = 0;
        for (const [itemId, count] of Object.entries(cartGroups)) {
            if (cartIdx >= maxVisibleItems) break;

            const item = CONFIG.SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) continue;

            const itemY = cartItemsStartY + cartIdx * cartItemHeight;

            // Store bounds for removal click
            shopCartBounds.push({
                x: cartX + 10,
                y: itemY,
                width: cartWidth - 20,
                height: cartItemHeight - 5,
                itemId: itemId
            });

            // Item row background (hoverable)
            ctx.fillStyle = 'rgba(50, 50, 60, 0.8)';
            ctx.beginPath();
            ctx.roundRect(cartX + 10, itemY, cartWidth - 20, cartItemHeight - 5, 5);
            ctx.fill();

            // Color dot
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(cartX + 25, itemY + (cartItemHeight - 5) / 2, 6, 0, Math.PI * 2);
            ctx.fill();

            // Item name with count
            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            const displayName = count > 1 ? `${item.name} x${count}` : item.name;
            ctx.fillText(displayName, cartX + 40, itemY + 20);

            // Cost
            ctx.fillStyle = '#ff0';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${item.cost * count}`, cartX + cartWidth - 35, itemY + 20);

            // Remove hint (X)
            ctx.fillStyle = '#f55';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('X', cartX + cartWidth - 18, itemY + 20);

            cartIdx++;
        }
    }

    // Cart total line
    const totalY = cartY + cartHeight - 100;
    ctx.strokeStyle = '#0aa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cartX + 15, totalY);
    ctx.lineTo(cartX + cartWidth - 15, totalY);
    ctx.stroke();

    // Total
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL:', cartX + 20, totalY + 25);

    ctx.fillStyle = bucksAfter >= 0 ? '#ff0' : '#f00';
    ctx.textAlign = 'right';
    ctx.fillText(`${cartTotal}`, cartX + cartWidth - 20, totalY + 25);

    // Cart buttons
    const cartBtnWidth = (cartWidth - 50) / 2;
    const cartBtnHeight = 35;
    const cartBtnY = cartY + cartHeight - 50;

    // Checkout button
    const checkoutX = cartX + 15;
    const canCheckout = shopCart.length > 0 && bucksAfter >= 0;

    ctx.fillStyle = canCheckout ? 'rgba(0, 150, 0, 0.8)' : 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.roundRect(checkoutX, cartBtnY, cartBtnWidth, cartBtnHeight, 6);
    ctx.fill();
    ctx.strokeStyle = canCheckout ? '#0f0' : '#444';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = canCheckout ? '#0f0' : '#555';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHECKOUT', checkoutX + cartBtnWidth / 2, cartBtnY + 23);

    shopButtonBounds.checkout = { x: checkoutX, y: cartBtnY, width: cartBtnWidth, height: cartBtnHeight };

    // Empty cart button
    const emptyX = cartX + cartWidth - cartBtnWidth - 15;
    const canEmpty = shopCart.length > 0;

    ctx.fillStyle = canEmpty ? 'rgba(150, 50, 0, 0.8)' : 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.roundRect(emptyX, cartBtnY, cartBtnWidth, cartBtnHeight, 6);
    ctx.fill();
    ctx.strokeStyle = canEmpty ? '#f80' : '#444';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = canEmpty ? '#f80' : '#555';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EMPTY', emptyX + cartBtnWidth / 2, cartBtnY + 23);

    shopButtonBounds.empty = { x: emptyX, y: cartBtnY, width: cartBtnWidth, height: cartBtnHeight };

    // ========== START WAVE BUTTON (spans full width below both) ==========
    const doneWidth = totalWidth;
    const doneX = gridStartX;
    const doneY = gridStartY + gridHeight + gridToDoneGap;

    ctx.fillStyle = 'rgba(0, 150, 150, 0.8)';
    ctx.beginPath();
    ctx.roundRect(doneX, doneY, doneWidth, doneHeight, 8);
    ctx.fill();
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('START WAVE', doneX + doneWidth / 2, doneY + 32);

    shopButtonBounds.done = { x: doneX, y: doneY, width: doneWidth, height: doneHeight };

    // Instructions
    ctx.fillStyle = '#666';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Click items to add to cart  |  SPACE to add  |  C to checkout  |  ESC to empty cart', canvas.width / 2, doneY + doneHeight + doneToInstructionsGap);

    // Don't render game UI - shop overlay covers everything
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

        case 'laser_turret':
            // Turret/laser icon
            ctx.fillStyle = color;
            // Base
            ctx.beginPath();
            ctx.roundRect(-12 * s, 8 * s, 24 * s, 10 * s, 3 * s);
            ctx.fill();
            // Barrel
            ctx.save();
            ctx.rotate(-Math.PI / 6);
            ctx.fillRect(-4 * s, -25 * s, 8 * s, 28 * s);
            ctx.restore();
            // Beam
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(-8 * s, -18 * s);
            ctx.lineTo(-15 * s, -28 * s);
            ctx.stroke();
            break;

        case 'turret_damage':
            // Power bolt icon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(-6 * s, -18 * s);
            ctx.lineTo(6 * s, -18 * s);
            ctx.lineTo(0 * s, -2 * s);
            ctx.lineTo(10 * s, -2 * s);
            ctx.lineTo(-4 * s, 18 * s);
            ctx.lineTo(-2 * s, 4 * s);
            ctx.lineTo(-12 * s, 4 * s);
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

    // Check if turret already owned
    if (item.effect === 'turret' && playerInventory.hasTurret) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY OWNED!', '#f44');
        return;
    }
    if (item.requiresTurret && !playerInventory.hasTurret) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'REQUIRES TURRET!', '#f44');
        return;
    }

    // Check if turret already in cart
    if (item.effect === 'turret' && shopCart.includes(item.id)) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 300, 'ALREADY IN CART!', '#f44');
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
    SFX.powerupCollect && SFX.powerupCollect();
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
    }

    // Play purchase sound
    SFX.powerup && SFX.powerup();
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
        case 'turret':
            playerInventory.hasTurret = true;
            turretHintPending = true;
            break;
        case 'turretDamage':
            playerInventory.turretDamageBonus += item.value;
            break;
    }
}

function purchaseShopItem() {
    const item = CONFIG.SHOP_ITEMS[selectedShopItem];

    // Check if turret is already owned
    if (item.effect === 'turret' && playerInventory.hasTurret) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 200, 'ALREADY OWNED!', '#f44');
        return false;
    }
    if (item.requiresTurret && !playerInventory.hasTurret) {
        SFX.error && SFX.error();
        createFloatingText(canvas.width / 2, 200, 'REQUIRES TURRET!', '#f44');
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
            renderShop();
            break;

        case 'FEEDBACK':
            updateFeedback(dt);
            renderFeedbackScreen();
            break;
    }

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Update screen shake
    if (screenShake > 0) {
        screenShake -= dt;
    }

    // Update damage flash
    if (damageFlash > 0) {
        damageFlash -= dt;
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

    // Update particles
    updateParticles(dt);

    // Update floating texts
    updateFloatingTexts(dt);

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
        // Wave complete - transition to next wave
        // Stop beam sound if beam is active
        if (ufo && ufo.beamActive) {
            SFX.stopBeamLoop();
            if (ufo.beamTarget) {
                ufo.beamTarget.beingAbducted = false;
                ufo.beamTarget.abductionProgress = 0;
                ufo.beamTarget.y = ufo.beamTarget.groundY;
                ufo.beamTarget = null;
            }
            ufo.beamActive = false;
        }

        const completedWave = wave;
        score += CONFIG.WAVE_COMPLETE_BONUS;
        waveStats.points += CONFIG.WAVE_COMPLETE_BONUS;
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

    // Render UFO (and beam)
    if (ufo) {
        ufo.render();
    }

    // Render particles (on top of everything)
    renderParticles();

    // Render floating texts
    renderFloatingTexts();

    ctx.restore(); // End screen shake

    // Render UI (not affected by shake)
    renderUI();

    // Render active powerup indicators
    renderActivePowerups();


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
}

// Fetch leaderboard and feedback on page load
fetchLeaderboard();
fetchFeedback();

// Start the game loop
requestAnimationFrame(gameLoop);
