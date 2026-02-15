// ============================================
// COMMAND PHASE CONFIGURATION
// All shared constants for Phase 2 Command Phase
// ============================================

const COMMAND_CONFIG = Object.freeze({
    ZONE: {
        WORLD_W: 480,
        WORLD_H: 300,
        GROUND_Y: 270,
        WAVE_DURATION: 60,
        MAX_TARGETS: 5,
        SPAWN_INTERVAL_MIN: 2.5,
        SPAWN_INTERVAL_MAX: 4.0,
        PARTICLE_BUDGET: 30,
        DRIFT_BASE_TIME: 25,
        DRIFT_PENALTY: 0.05,
        DRIFT_RECOVER_TIME: 3.0,
        UFO_SPEED: 100,
        UFO_VERTICAL_SPEED: 70,
        UFO_RESPAWN_TIME: 3.0,
        BEAM_DRAIN: 20,
        BEAM_RECHARGE: 14,
        BEAM_RANGE: 210,
        BEAM_CONE_ANGLE: 0.3,
        SHELL_SPEED: 120,
        SHELL_DAMAGE: 10
    },

    CREW: {
        MORALE_START: 0.7,
        MORALE_MIN: 0.0,
        MORALE_MAX: 1.0,
        STAMINA_DRAIN: 0.1,
        STAMINA_BENCH_RECOVERY: 0.25,
        DECISION_DELAY_RECKLESS: 0.2,
        DECISION_DELAY_CAUTIOUS: 0.5,
        DECISION_DELAY_BALANCED: 0.35,
        MISTAKE_CHANCE: 0.10,
        FLEET_ORDER_MODIFIER: 0.2
    },

    QUOTA: {
        BASE: 10,
        WAVE_SCALING: 0.02,
        ROLLING_WINDOW: 3,
        SURGE_THRESHOLD: 1.2,
        SURGE_AMOUNT: 0.15,
        SURGE_DURATION: 2,
        RECOVERY_INTERVAL: 5,
        RECOVERY_DISCOUNT: 0.2,
        MET_THRESHOLD: 0.8,
        EXCEEDED_THRESHOLD: 1.2
    },

    DIRECTOR: {
        APPROVAL_START: 50,
        APPROVAL_MIN: 0,
        APPROVAL_MAX: 100,
        MOOD_FURIOUS: 25,
        MOOD_DISPLEASED: 45,
        MOOD_NEUTRAL: 70,
        OVERRIDE_PENALTY: 5,
        TYPEWRITER_SPEED: 15,
        BLINK_INTERVAL: 4000,
        BLINK_DURATION: 200
    },

    OVERRIDE: {
        DURATION: 15,
        ZOOM_TRANSITION: 0.5,
        WARNING_TIME: 3
    },

    RESOURCE: {
        TRANSIT_LOSS: 0.1,
        TRANSIT_DELAY: 3.0,
        MIN_TRANSFER: 10,
        MAX_TRANSFER: 50,
        SAFETY_FLOOR: 20
    },

    CINEMATIC: {
        PHASE_A_DURATION: 3.0,
        PHASE_B_DURATION: 3.0,
        PHASE_C_DURATION: 2.0,
        PHASE_D_DURATION: 2.0,
        TOTAL_DURATION: 10.0
    },

    COLORS: {
        COMMAND_GOLD: '#d4a017',
        COMMAND_GOLD_GLOW: 'rgba(212, 160, 23, 0.3)',
        COMMAND_GOLD_BORDER: '#b8860b',
        COMMAND_GOLD_LABEL: '#daa520',
        DIRECTOR_PRIMARY: '#a00',
        DIRECTOR_GLOW: 'rgba(170, 0, 0, 0.4)',
        DIRECTOR_BORDER: '#c22',
        DIRECTOR_TEXT: '#f33',
        DIRECTOR_SPEECH: '#f44',
        DIRECTOR_SATISFIED: '#a80',
        DIRECTOR_BG: 'rgba(30, 0, 0, 0.85)',
        DIRECTOR_SKIN: '#2a3a4a',
        ZONE_STABLE: '#0f0',
        ZONE_STRESSED: '#fc0',
        ZONE_CRISIS: '#f44',
        ZONE_EMERGENCY: '#f00',
        ZONE_OVERRIDE: '#0ff',
        MORALE_THRIVING: '#4cff4c',
        MORALE_CONTENT: '#0c8',
        MORALE_NEUTRAL: '#0aa',
        MORALE_STRESSED: '#da0',
        MORALE_STRAINED: '#f60',
        MORALE_BREAKING: '#f22',
        MORALE_BURNOUT: '#555',
        TRAIT_RECKLESS: '#f44',
        TRAIT_CAUTIOUS: '#0af'
    },

    NAMES: [
        'KRIX', 'NURP', 'ZYLK', 'BLORT', 'VRENN', 'QUIX', 'DRAAL',
        'SLYTH', 'MORX', 'FENN', 'GLYX', 'THRAK', 'PRYNN', 'VASK',
        'DULK', 'RESH', 'ORNN', 'TRYX', 'KALM', 'ZURR', 'PLEX',
        'NEBB', 'WRIX', 'GORN', 'FLUX', 'SKAB', 'DREL', 'MUXX'
    ],

    SCORE: {
        PER_ABDUCTION_MULTIPLIER: 10,
        QUOTA_MET_BONUS: 100,
        QUOTA_EXCEEDED_BONUS: 200,
        ALL_STABLE_BONUS: 50,
        OVERRIDE_PER_ABDUCTION: 5
    },

    CP: {
        QUOTA_EXCEEDED: 2,
        QUOTA_MET: 1,
        ALL_EXCEEDED_BONUS: 1,
        DIRECTOR_SATISFIED_BONUS: 1
    },

    TARGET_TYPES: Object.freeze([
        { type: 'human', spawnWeight: 0.40, bioValue: 3, color: '#0f0' },
        { type: 'cow',   spawnWeight: 0.25, bioValue: 2, color: '#fa0' },
        { type: 'sheep', spawnWeight: 0.15, bioValue: 2, color: '#fff' },
        { type: 'cat',   spawnWeight: 0.10, bioValue: 1, color: '#f80' },
        { type: 'dog',   spawnWeight: 0.10, bioValue: 1, color: '#a86' }
    ]),

    // ============================================
    // WEAPONS SYSTEMS — Drones, Bombs, Missiles, Coordinators
    // All gated by zone.techLevel (0-15)
    // ============================================

    WEAPONS: {
        // Tech level thresholds for unlocking weapon systems
        TECH_UNLOCK: {
            HARVESTER_DRONE: 3,
            BOMB: 5,
            BATTLE_DRONE: 6,
            MISSILE: 7,
            HARVESTER_COORDINATOR: 8,
            ATTACK_COORDINATOR: 9,
            FLEET_EXPANSION: 11,
            AUTONOMOUS_SWARM: 13
        },

        // Drone parameters (simplified for mini-view)
        DRONE: {
            MAX_PER_ZONE: 4,
            FALL_SPEED: 120,           // px/s descent
            WALK_SPEED: 40,            // px/s ground movement
            ENERGY_TIMER: 30,          // seconds lifespan
            COLLECT_RANGE: 30,         // world-coord horizontal range
            COLLECT_TIME: 2.0,         // seconds to abduct
            BATTLE_RANGE: 60,          // world-coord attack range
            BATTLE_DPS: 8,             // damage per second
            UNFOLD_TIME: 0.5,          // seconds to deploy
            LANDING_DAMAGE: 10,        // battle drone landing impact
            LANDING_RADIUS: 30,        // landing damage area
            WIDTH: 12,                 // mini render width
            HEIGHT: 10                 // mini render height
        },

        // Bomb parameters
        BOMB: {
            MAX_PER_ZONE: 3,
            GRAVITY: 400,              // px/s² downward
            INITIAL_VY: 80,            // px/s initial drop speed
            BOUNCE_DAMPING: 0.5,       // velocity retained per bounce
            MAX_BOUNCES: 2,
            EXPLOSION_RADIUS: 40,      // world-coord blast area
            EXPLOSION_DAMAGE: 30,
            RECHARGE_TIME: 8,          // seconds between bombs
            UFO_VX_INHERIT: 0.6        // fraction of UFO horizontal velocity
        },

        // Missile parameters (simplified 4-phase trajectory)
        MISSILE: {
            GROUP_SIZE: 4,             // missiles per salvo
            MAX_GROUPS: 4,             // max salvos available
            LAUNCH_SPEED: 190,         // px/s initial upward
            DIVE_SPEED: 300,           // px/s terminal
            MAX_SPEED: 360,            // px/s speed cap
            MAX_TURN_RATE: 4.0,        // rad/s steering
            PN_CONSTANT: 3.0,          // proportional navigation gain
            MAX_LIFETIME: 3.5,         // seconds before self-destruct
            DAMAGE: 25,
            RECHARGE_TIME: 5,          // seconds per group
            FAN_SPREAD: Math.PI * 0.5, // launch spread angle
            LAUNCH_DURATION: 0.28,     // seconds — phase 1
            DECEL_DURATION: 0.18,      // seconds — phase 2
            APEX_DURATION: 0.12,       // seconds — phase 3
            DRAG_LAUNCH: 0.5,
            DRAG_DECEL: 2.5,
            DRAG_DIVE: 1.0,
            DECEL_GRAVITY: 190,        // px/s² arc-over pull
            LAUNCH_THRUST: 95,         // px/s² boost during launch
            DIVE_THRUST: 720           // px/s² terminal acceleration
        },

        // Coordinator parameters (manages sub-drones)
        COORDINATOR: {
            MAX_PER_ZONE: 2,
            HOVER_Y_PCT: 0.40,         // hover at 40% of world height
            ENERGY_TIMER: 20,          // seconds lifespan
            SUB_DRONE_COUNT: 3,        // default sub-drones
            EXPANDED_SUB_DRONES: 5,    // with fleet expansion tech
            DEPLOY_SPEED: 100,         // px/s descent to hover position
            FOLLOW_LAG: 0.5,           // lerp factor for UFO tracking
            BOMB_INTERVAL: 5.0,        // auto-bomb cooldown (attack type)
            MISSILE_INTERVAL: 6.0,     // auto-missile cooldown (attack type)
            REDEPLOY_DELAY: 3.0,       // seconds before sub-drone respawn
            WIDTH: 14,                 // mini render width
            HEIGHT: 16,                // mini render height
            BOB_SPEED: 1.5,            // hover oscillation Hz
            BOB_AMP_Y: 5,              // vertical bob pixels
            BOB_AMP_X: 3,              // horizontal bob pixels
            SPIN_SPEED: 1.2            // ring rotation rad/s
        },

        // AI deployment logic thresholds
        AI: {
            BOMB_TANK_CLUSTER_DIST: 60,    // world-coord tank proximity for bomb targeting
            MISSILE_MIN_TANKS: 2,          // minimum tanks before missiles fired
            DRONE_DEPLOY_INTERVAL: 8,      // min seconds between drone deployments
            COORDINATOR_DEPLOY_INTERVAL: 12,// min seconds between coordinator deployments
            BOMB_DROP_INTERVAL: 6,         // min seconds between AI bomb drops
            MISSILE_FIRE_INTERVAL: 8       // min seconds between AI missile salvos
        },

        // Explosion visual parameters
        EXPLOSION: {
            BOMB_RADIUS: 35,           // max visual radius
            MISSILE_RADIUS: 18,        // max visual radius
            DURATION: 0.4,             // seconds
            PARTICLE_COUNT: 6          // particles per explosion
        }
    }
});
