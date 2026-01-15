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
    ENERGY_RECHARGE_RATE: 10,
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

    // Combo System
    COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3],
    COMBO_MAX: 3,

    // Waves
    WAVE_DURATION: 60,
    TANKS_BASE: 1,
    TANKS_INCREMENT: 1,
    WAVE_TRANSITION_DURATION: 3,

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
    }
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

let gameState = 'TITLE'; // TITLE, PLAYING, GAME_OVER, WAVE_TRANSITION
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

// Game session tracking for leaderboard
let gameStartTime = 0;
let leaderboard = [];
let leaderboardLoading = false;
let activityStats = null;
let submissionError = null;
let pendingScoreSubmission = null;
let highlightedEntryId = null; // Track player's newly submitted score for highlighting

// Captured at game over to avoid mutation before submission
let finalScore = 0;
let finalWave = 0;
let finalGameLength = 0;

// Name entry state
let nameEntryChars = ['A', 'A', 'A'];
let nameEntryPosition = 0;
let nameEntryComplete = false;
let newHighScoreRank = null;

// Harvest counter - tracks how many of each target type has been abducted
let harvestCount = {
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
            const name = nameEntryChars.join('');
            submitScore(name).then(rank => {
                newHighScoreRank = rank;
                gameState = 'TITLE';
                fetchLeaderboard(); // Refresh leaderboard after submission
            });
        } else if (/^[A-Za-z]$/.test(e.key)) {
            // Direct letter input
            nameEntryChars[nameEntryPosition] = e.key.toUpperCase();
            nameEntryPosition = Math.min(2, nameEntryPosition + 1);
        }
        return;
    }

    // Handle game state transitions
    if (gameState === 'TITLE' && e.code === 'Space') {
        startGame();
    } else if (gameState === 'GAME_OVER' && e.code === 'Enter') {
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
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
                // Increment harvest counter
                harvestCount[this.type]++;
                // Award points
                const multiplier = CONFIG.COMBO_MULTIPLIERS[Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1)];
                const pointsEarned = Math.floor(this.points * multiplier);
                score += pointsEarned;
                combo++;

                // Heal UFO
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION);

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
}

// ============================================
// FLOATING TEXT (for score popups)
// ============================================

let floatingTexts = [];

function createFloatingText(x, y, text, color) {
    floatingTexts.push({
        x,
        y,
        text,
        color,
        lifetime: 1.0,
        vy: -50
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
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    for (const ft of floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.lifetime);
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
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

class UFO {
    constructor() {
        this.width = 180;
        this.height = 90;
        this.x = canvas.width / 2;
        this.y = canvas.height * CONFIG.UFO_Y_POSITION;
        this.health = CONFIG.UFO_START_HEALTH;
        this.energy = CONFIG.ENERGY_MAX;
        this.beamActive = false;
        this.beamTarget = null;
        this.beamProgress = 0;
        this.hoverOffset = 0;
        this.hoverTime = 0;
        this.beamRotation = 0; // For spiral effect
    }

    update(dt) {
        // Hover animation
        this.hoverTime += dt;
        this.hoverOffset = Math.sin(this.hoverTime * 2) * 3;

        // Beam rotation for spiral effect
        this.beamRotation += dt * 5;

        // Handle beam activation
        const wantsBeam = keys['Space'];
        const canFireBeam = activePowerups.energy_surge.active || this.energy >= CONFIG.ENERGY_MIN_TO_FIRE;

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
            // Beam deactivated
            if (this.beamActive) {
                SFX.stopBeamLoop();
                // Drop current target if any (only if it's still alive - not already abducted)
                if (this.beamTarget && this.beamTarget.alive) {
                    this.beamTarget.beingAbducted = false;
                    this.beamTarget.abductionProgress = 0;
                    // Target falls back to ground
                    this.beamTarget.y = this.beamTarget.groundY;
                    // Create "dropped" text
                    createFloatingText(this.x, this.y + 100, 'DROPPED!', '#f00');
                    SFX.targetDropped();
                }
                this.beamTarget = null;
            }
            this.beamActive = false;

            // Energy recharge when not beaming
            this.energy = Math.min(CONFIG.ENERGY_MAX, this.energy + CONFIG.ENERGY_RECHARGE_RATE * dt);
        }

        // Clamp energy
        this.energy = Math.max(0, this.energy);

        // Auto-deactivate beam if energy depleted
        if (this.energy <= 0) {
            if (this.beamActive) {
                SFX.stopBeamLoop();
            }
            if (this.beamTarget) {
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
            if (keys['ArrowLeft'] || keys['KeyA']) {
                this.x -= CONFIG.UFO_SPEED * dt;
                moved = true;
            }
            if (keys['ArrowRight'] || keys['KeyD']) {
                this.x += CONFIG.UFO_SPEED * dt;
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

    render() {
        const drawX = this.x - this.width / 2;
        const drawY = this.y - this.height / 2 + this.hoverOffset;

        // Render beam first (behind UFO)
        if (this.beamActive) {
            this.renderBeam();
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
        const energyPercent = this.energy / CONFIG.ENERGY_MAX;
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
        this.abductionTime = 1.5; // Tanks are quick to abduct
        this.groundY = this.y;

        this.alive = true;
        this.respawnTimer = 0;
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

                // Award points
                const multiplier = CONFIG.COMBO_MULTIPLIERS[Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1)];
                const pointsEarned = Math.floor(CONFIG.TANK_POINTS * multiplier);
                score += pointsEarned;
                combo++;

                // Heal UFO
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION);

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

        const img = images.tank;
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
            ctx.fillStyle = '#556b2f';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Treads
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y + this.height - 10, this.width, 10);
        }

        // Draw turret
        this.renderTurret();
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

                // Create small explosion at hit point
                createExplosion(this.x, this.y, 'small');

                // Sound and visual effects
                SFX.ufoHit();
                screenShake = 0.2;
                damageFlash = 0.15;
                createFloatingText(ufo.x, ufo.y - 30, `-${this.damage}`, '#f00');

                // Check for game over
                if (ufo.health <= 0) {
                    ufo.health = 0;
                    triggerGameOver();
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

    switch (type) {
        case 'health_pack':
            // Instant heal + beam recharge
            const oldHealth = ufo.health;
            ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + cfg.healAmount);
            const healed = ufo.health - oldHealth;
            ufo.energy = CONFIG.ENERGY_MAX; // Recharge beam to 100%
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
        this.abductionTime = 3.0; // Takes longer to abduct (heavier)
        this.groundY = this.y;

        // More points for heavy tank
        this.points = 75;

        this.alive = true;
        this.respawnTimer = 0;
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

                // Award points (more than regular tank)
                const multiplier = CONFIG.COMBO_MULTIPLIERS[Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1)];
                const pointsEarned = Math.floor(this.points * multiplier);
                score += pointsEarned;
                combo++;

                // Heal UFO (more healing for heavy tank)
                ufo.health = Math.min(CONFIG.UFO_START_HEALTH, ufo.health + CONFIG.HEAL_PER_ABDUCTION * 2);

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
        this.direction = Math.random() < 0.5 ? 1 : -1;
        const randomOffset = Math.random() * 300;
        this.x = this.direction === 1 ? -this.width - randomOffset : canvas.width + randomOffset;
        this.y = this.groundY;
        this.speed = (CONFIG.TANK_BASE_SPEED + (wave - 1) * CONFIG.TANK_SPEED_INCREMENT) * 0.6;
        this.speed = Math.min(this.speed, 60);
    }

    render() {
        if (!this.alive) return;

        const img = images.tank;
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
            ctx.fillStyle = '#3a5a1f';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Treads
            ctx.fillStyle = '#222';
            ctx.fillRect(this.x, this.y + this.height - 20, this.width, 20);
        }

        // Draw both turrets
        this.renderTurrets();
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
// GAME OVER
// ============================================

function triggerGameOver() {
    // Stop beam sound if active
    SFX.stopBeamLoop();

    // Capture final game state FIRST, before any resets can occur
    finalScore = score;
    finalWave = wave;
    finalGameLength = (Date.now() - gameStartTime) / 1000;

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
            gameState = 'NAME_ENTRY';
            createCelebrationEffect();
        } else {
            gameState = 'GAME_OVER';
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

function formatRelativeDate(timestamp) {
    if (!timestamp) return '';

    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days <= 2) return `${days}d ago`;

    // Compact date for older entries
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year !== currentYear) {
        return `${month}/${day}/${String(year).slice(-2)}`;
    }
    return `${month}/${day}`;
}

async function fetchLeaderboard() {
    leaderboardLoading = true;
    try {
        const response = await fetch('/api/scores');
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
        const response = await fetch('/api/scores', {
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
    if (leaderboard.length < 10) return true;
    // Match server-side tie-breaker logic
    const last = leaderboard[leaderboard.length - 1];
    if (finalScore !== last.score) return finalScore > last.score;
    if (finalWave !== last.wave) return finalWave > last.wave;
    return true; // Same score/wave qualifies; sort will keep earlier timestamp first
}

function createCelebrationEffect() {
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
    gameState = 'PLAYING';
    gameStartTime = Date.now();
    ufo = new UFO();
    targets = [];
    tanks = [];
    heavyTanks = [];
    projectiles = [];
    particles = [];
    floatingTexts = [];
    score = 0;
    combo = 0;
    // Reset title screen state for next time
    titleHumans = [];
    highlightedEntryId = null;
    // Reset harvest counters
    harvestCount = { human: 0, cow: 0, sheep: 0, cat: 0, dog: 0, tank: 0 };
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

    // Spawn initial tanks
    spawnTanks();
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
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 40);
    ctx.fillText(`WAVE: ${wave}`, 20, 70);

    // Timer (clamp to 0 to avoid showing -1:-1 when wave ends)
    const displayTime = Math.max(0, waveTimer);
    const minutes = Math.floor(displayTime / 60);
    const seconds = Math.floor(displayTime % 60);

    // Timer warning effect for last 10 seconds
    if (waveTimer <= 10 && gameState === 'PLAYING') {
        // Pulsing red text
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgb(255, ${Math.floor(pulse * 100)}, ${Math.floor(pulse * 100)})`;
        ctx.font = 'bold 28px monospace';
    }
    ctx.fillText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 100);

    // Reset font for subsequent text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px monospace';

    // Health bar (top right)
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthX = canvas.width - healthBarWidth - 20;
    const healthY = 20;

    ctx.fillStyle = '#333';
    ctx.fillRect(healthX, healthY, healthBarWidth, healthBarHeight);

    const healthPercent = ufo ? ufo.health / CONFIG.UFO_START_HEALTH : 1;
    ctx.fillStyle = '#f00';
    ctx.fillRect(healthX, healthY, healthBarWidth * healthPercent, healthBarHeight);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthX, healthY, healthBarWidth, healthBarHeight);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.fillText('SHIELD', healthX - 10, healthY + 16);

    // High score
    ctx.textAlign = 'center';
    ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width / 2, 40);

    // Harvest counter - display icons with counts
    renderHarvestCounter();
}

function renderHarvestCounter() {
    const targetTypes = ['human', 'cow', 'sheep', 'cat', 'dog', 'tank'];
    const iconSize = 28;
    const spacing = 60; // Space between each icon+count pair
    const totalWidth = targetTypes.length * spacing;
    const startX = (canvas.width - totalWidth) / 2 + spacing / 2;
    const y = 58; // Moved up to avoid overlap with UFO energy bar

    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < targetTypes.length; i++) {
        const type = targetTypes[i];
        const x = startX + i * spacing;
        const count = harvestCount[type];

        // Draw the target icon
        const img = images[type];
        if (img && img.complete) {
            // Scale image to fit icon size while maintaining aspect ratio
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
            // Fallback: draw a colored circle/shape
            const colors = { human: '#ffccaa', cow: '#fff', sheep: '#eee', cat: '#ff9944', dog: '#aa7744', tank: '#556b2f' };
            ctx.fillStyle = colors[type];
            if (type === 'tank') {
                // Draw a small tank shape
                ctx.fillRect(x - 10, y - 5, 20, 10);
                ctx.fillRect(x - 3, y - 10, 6, 8);
            } else {
                ctx.beginPath();
                ctx.arc(x, y, iconSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw the count below the icon
        ctx.fillStyle = count > 0 ? '#0f0' : '#666';
        ctx.fillText(count.toString(), x, y + iconSize / 2 + 12);
    }
}

function renderActivePowerups() {
    const barWidth = 140;
    const barHeight = 18;
    const padding = 4;
    const startX = 10;
    let y = 130;

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

        // Background bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(startX, y, barWidth, barHeight);

        // Progress fill
        ctx.fillStyle = cfg.color;
        ctx.fillRect(startX + 2, y + 2, (barWidth - 4) * progress, barHeight - 4);

        // Pulsing effect when low
        if (progress < 0.25 && progress > 0) {
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.4})`;
            ctx.fillRect(startX + 2, y + 2, (barWidth - 4) * progress, barHeight - 4);
        }

        // Border
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, y, barWidth, barHeight);

        // Label (with shadow for readability)
        ctx.fillStyle = '#000';
        ctx.fillText(label, startX + padding + 1, y + barHeight - padding + 1);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, startX + padding, y + barHeight - padding);

        y += barHeight + 4;
    }
}

function updateTitleUfo() {
    const ufoWidth = 120;
    const ufoHeight = 60;

    // Initialize position if needed
    if (titleUfo.baseY === 0) {
        titleUfo.baseY = canvas.height / 6;
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

    // Reset timer while abducting so beam stays on for full duration after abduction completes
    if (humanBeingAbducted && titleUfo.beamActive) {
        titleUfo.beamTimer = 0;
    }

    if (titleUfo.beamTimer > 120) { // Every ~2 seconds at 60fps
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

            // Move upward
            human.y -= riseSpeed / 60; // Assuming ~60fps

            // Move horizontally toward beam center
            const dx = targetX - human.x;
            if (Math.abs(dx) > 1) {
                human.x += Math.sign(dx) * 2;
            }

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
            if (human.direction < 0 && !human.beingAbducted) {
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

function renderNameEntryScreen() {
    renderBackground();

    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 4);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`SCORE: ${finalScore.toLocaleString()}`, canvas.width / 2, canvas.height / 4 + 50);

    // Show potential rank
    const potentialRank = leaderboard.filter(e => e.score > finalScore).length + 1;
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`RANK #${potentialRank}`, canvas.width / 2, canvas.height / 4 + 90);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('ENTER YOUR NAME', canvas.width / 2, canvas.height / 2 - 40);

    // Draw the 3 letter slots
    const slotWidth = 60;
    const startX = canvas.width / 2 - slotWidth;
    const y = canvas.height / 2 + 20;

    for (let i = 0; i < 3; i++) {
        const x = startX + i * slotWidth;

        // Highlight current position
        if (i === nameEntryPosition) {
            ctx.fillStyle = '#0ff';
            // Draw selection arrows
            ctx.font = 'bold 24px monospace';
            ctx.fillText('▲', x, y - 50);
            ctx.fillText('▼', x, y + 60);
        } else {
            ctx.fillStyle = '#fff';
        }

        ctx.font = 'bold 48px monospace';
        ctx.fillText(nameEntryChars[i], x, y);
    }

    // Show submission error if any
    if (submissionError) {
        ctx.fillStyle = '#f55';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(submissionError, canvas.width / 2, canvas.height - 140);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '18px monospace';
    ctx.fillText('↑↓ Change Letter    ←→ Move    ENTER Submit', canvas.width / 2, canvas.height - 100);
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
    const titleY = canvas.height / 3;
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

    // Leaderboard
    if (leaderboardLoading) {
        ctx.fillStyle = '#888';
        ctx.font = '18px monospace';
        ctx.fillText('Loading scores...', canvas.width / 2, canvas.height / 2 + 10);
    } else if (leaderboard.length > 0) {
        // Activity stats (above TOP 10 header)
        if (activityStats) {
            ctx.fillStyle = '#888';
            ctx.font = '14px monospace';
            const lastPlayed = activityStats.lastGamePlayed
                ? `Last played: ${formatRelativeDate(activityStats.lastGamePlayed)}`
                : '';
            const gamesWeek = `${activityStats.gamesThisWeek} ${activityStats.gamesThisWeek === 1 ? 'game' : 'games'} this week`;
            const statsText = lastPlayed ? `${lastPlayed}  •  ${gamesWeek}` : gamesWeek;
            ctx.fillText(statsText, canvas.width / 2, canvas.height / 2 - 70);
        }

        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('LEADERBOARD', canvas.width / 2, canvas.height / 2 - 30);

        ctx.font = '18px monospace';
        const startY = canvas.height / 2 + 10;
        const lineHeight = 26;

        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            const y = startY + i * lineHeight;
            const flag = countryCodeToFlag(entry.countryCode);
            const isHighlighted = entry.id === highlightedEntryId;

            // Apply glow effect for highlighted entry
            if (isHighlighted) {
                ctx.shadowColor = '#0ff';
                ctx.shadowBlur = 10;
            }

            // Rank - highlighted entries use cyan, top 3 use yellow, others white
            ctx.fillStyle = isHighlighted ? '#0ff' : (i < 3 ? '#ff0' : '#fff');
            ctx.textAlign = 'right';
            ctx.fillText(`${i + 1}.`, canvas.width / 2 - 180, y);

            // Flag and Name
            ctx.textAlign = 'left';
            ctx.fillText(`${flag} ${entry.name}`, canvas.width / 2 - 160, y);

            // Score
            ctx.textAlign = 'right';
            ctx.fillText(entry.score.toLocaleString(), canvas.width / 2 + 20, y);

            // Wave - highlighted entries keep the glow with slightly brighter color
            ctx.fillStyle = isHighlighted ? '#0aa' : '#888';
            ctx.fillText(`W${entry.wave}`, canvas.width / 2 + 70, y);

            // Date
            ctx.fillStyle = isHighlighted ? '#088' : '#666';
            ctx.fillText(formatRelativeDate(entry.timestamp), canvas.width / 2 + 180, y);

            // Reset shadow for next entry
            if (isHighlighted) {
                ctx.shadowBlur = 0;
            }
        }
        ctx.textAlign = 'center';
    }

    // Flashing "Press any key" text
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px monospace';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height - 150);
    }

    // Instructions
    ctx.font = '18px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Arrow Keys: Move UFO    |    SPACE: Activate Beam', canvas.width / 2, canvas.height - 100);

    // Dedication message on the ground
    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Built by Ruby, Odessa, & Papa!!! We hope you love it and have fun!', canvas.width / 2, canvas.height - 30);
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
        ctx.fillText('Press ENTER to Play Again', canvas.width / 2, canvas.height / 2 + 120);
    }
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
        waveTimer = CONFIG.WAVE_DURATION;
        lastTimerWarningSecond = -1; // Reset timer warning
        gameState = 'PLAYING';

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

        case 'GAME_OVER':
            renderGameOverScreen();
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

        score += CONFIG.WAVE_COMPLETE_BONUS;
        createFloatingText(canvas.width / 2, canvas.height / 2, `WAVE ${wave} COMPLETE! +${CONFIG.WAVE_COMPLETE_BONUS}`, '#ff0');
        SFX.waveComplete();

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('alienAbductoramaHighScore', highScore);
        }

        // Start wave transition
        wave++;
        waveTransitionTimer = CONFIG.WAVE_TRANSITION_DURATION;
        gameState = 'WAVE_TRANSITION';
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

    // Render combo indicator
    if (combo > 0) {
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'left';
        const multiplier = CONFIG.COMBO_MULTIPLIERS[Math.min(combo, CONFIG.COMBO_MULTIPLIERS.length - 1)];
        ctx.fillText(`COMBO: ${combo} (${multiplier}x)`, 20, 130);
    }

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

// Fetch leaderboard on page load
fetchLeaderboard();

// Start the game loop
requestAnimationFrame(gameLoop);
