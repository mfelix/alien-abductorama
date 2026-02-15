// ============================================
// ZONE STATE — Per-zone game state container
// ============================================
// Owns all entity arrays, UFO state, quota, drift,
// and status for a single command-phase zone.
// No update logic — that lives in zone-simulation.js.
// No rendering — that lives in zone-renderer.js.

const ZONE_NAMES = [
    'SECTOR A-7', 'SECTOR B-3', 'SECTOR C-9', 'SECTOR D-1',
    'SECTOR E-5', 'SECTOR F-2', 'SECTOR G-8', 'SECTOR H-6',
    'SECTOR J-4', 'SECTOR K-1', 'SECTOR L-7', 'SECTOR M-3',
    'SECTOR N-9', 'SECTOR P-2', 'SECTOR Q-5', 'SECTOR R-8'
];

class ZoneState {
    constructor(zoneId, difficulty) {
        const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
        const worldW = cfg.WORLD_W || 480;
        const worldH = cfg.WORLD_H || 300;

        this.id = zoneId;
        // Extract index from zone ID (e.g. 'zone-0' -> 0, 'zone-a' -> 0, 'zone-b' -> 1)
        const idSuffix = zoneId.replace('zone-', '');
        const zoneIndex = idSuffix === 'a' ? 0 : idSuffix === 'b' ? 1 : (parseInt(idSuffix, 10) || 0);
        this.name = ZONE_NAMES[zoneIndex] || ('SECTOR ' + zoneId.slice(-1).toUpperCase());
        this.difficulty = difficulty;                  // 0.0-1.0

        // Entity arrays
        this.targets = [];
        this.tanks = [];
        this.projectiles = [];
        this.particles = [];

        // Weapon entity arrays (populated by zone-simulation when tech permits)
        this.drones = [];
        this.bombs = [];
        this.missiles = [];
        this.coordinators = [];
        this.explosions = [];

        // Crew UFO
        this.crewUfo = {
            x: worldW / 2,
            y: worldH * 0.3,
            vx: 0,
            vy: 0,
            energy: 100,
            maxEnergy: 100,
            health: 100,
            beamActive: false,
            beamTarget: null,
            hoverOffset: Math.random() * Math.PI * 2,
            width: 30,
            height: 16
        };

        // Crew references
        this.crewMember = null;
        this.crewAI = null;

        // Quota tracking
        this.quota = {
            target: cfg.MAX_TARGETS || 10,
            current: 0
        };

        // Drift system
        this.driftTimer = cfg.DRIFT_BASE_TIME || 25;
        this.driftLevel = 0;
        this.driftAccumulator = 0;
        this.driftRecoverTimer = 0;

        // Computed state
        this.healthScore = 1.0;
        this.state = 'stable';                         // 'stable'|'stressed'|'crisis'|'emergency'
        this.fleetOrder = 'balanced';                  // 'defensive'|'balanced'|'harvest'
        this.isOverrideActive = false;

        // Tech level (0-15, set by command-main.js during init)
        this.techLevel = 0;

        // Starfield
        this.starSeed = Math.random() * 10000;
        this.starPositions = this._generateStarPositions(worldW, worldH);

        // Spawn timers
        this.targetSpawnTimer = 1 + Math.random() * 2;
        this.hoverTime = 0;

        // Weapon system state
        this.bombRechargeTimer = 0;
        this.bombsAvailable = 0;
        this.missileGroups = [];      // { ready: bool, rechargeTimer: number }
        this.droneDeployTimer = 0;
        this.coordinatorDeployTimer = 0;

        // UFO respawn
        this.ufoRespawnTimer = 0;

        // Wave report (filled at wave end)
        this.waveReport = null;

        // Stats for wave report
        this._damagesTaken = 0;
    }

    _generateStarPositions(w, h) {
        // Deterministic starfield from seed
        let seed = this.starSeed;
        const seededRandom = () => {
            seed = (seed * 16807 + 0) % 2147483647;
            return (seed - 1) / 2147483646;
        };
        const stars = [];
        const count = 25 + Math.floor(seededRandom() * 15);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: seededRandom() * w,
                y: seededRandom() * (h * 0.7),
                size: 0.5 + seededRandom() * 1.5,
                brightness: 0.3 + seededRandom() * 0.7
            });
        }
        return stars;
    }

    reset() {
        const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
        // Clear entities
        this.targets = [];
        this.tanks = [];
        this.projectiles = [];
        this.particles = [];
        this.drones = [];
        this.bombs = [];
        this.missiles = [];
        this.coordinators = [];
        this.explosions = [];

        // Reset UFO
        const worldW = cfg.WORLD_W || 480;
        const worldH = cfg.WORLD_H || 300;
        this.crewUfo.x = worldW / 2;
        this.crewUfo.y = worldH * 0.3;
        this.crewUfo.vx = 0;
        this.crewUfo.vy = 0;
        this.crewUfo.energy = this.crewUfo.maxEnergy;
        this.crewUfo.health = 100;
        this.crewUfo.beamActive = false;
        this.crewUfo.beamTarget = null;

        // Reset quota
        this.quota.current = 0;

        // Reset drift
        this.driftTimer = cfg.DRIFT_BASE_TIME || 25;
        this.driftLevel = 0;
        this.driftAccumulator = 0;
        this.driftRecoverTimer = 0;

        // Reset state
        this.healthScore = 1.0;
        this.state = 'stable';
        this.isOverrideActive = false;

        // Reset timers
        this.targetSpawnTimer = 1 + Math.random() * 2;
        this.hoverTime = 0;
        this.ufoRespawnTimer = 0;

        // Reset weapon state
        this.bombRechargeTimer = 0;
        this.bombsAvailable = 0;
        this.missileGroups = [];
        this.droneDeployTimer = 0;
        this.coordinatorDeployTimer = 0;

        // Reset stats
        this._damagesTaken = 0;
        this.waveReport = null;

        // Reset crew AI if present
        if (this.crewAI && typeof this.crewAI.reset === 'function') {
            this.crewAI.reset();
        }
    }

    getStatus() {
        return {
            quotaProgress: this.quota.target > 0 ? this.quota.current / this.quota.target : 0,
            energy: this.crewUfo.energy,
            health: this.crewUfo.health,
            driftTimer: this.driftTimer,
            driftLevel: this.driftLevel,
            state: this.state
        };
    }

    setFleetOrder(order) {
        if (order === 'defensive' || order === 'balanced' || order === 'harvest') {
            this.fleetOrder = order;
        }
    }

    assignCrew(crewMember) {
        this.crewMember = crewMember;
        crewMember.assignedZone = this.id;
        // CrewAI is created by Agent 2's code — we just store the reference
        if (typeof CrewAI !== 'undefined') {
            this.crewAI = new CrewAI(crewMember);
        }
    }

    unassignCrew() {
        if (this.crewMember) {
            this.crewMember.assignedZone = null;
        }
        this.crewMember = null;
        this.crewAI = null;
    }

    generateWaveReport() {
        const quotaMet = this.quota.current >= this.quota.target * 0.8;
        const quotaPercent = this.quota.target > 0
            ? Math.round((this.quota.current / this.quota.target) * 100)
            : 0;
        this.waveReport = {
            zoneId: this.id,
            abductions: this.quota.current,
            quotaTarget: this.quota.target,
            quotaMet: quotaMet,
            quotaPercent: quotaPercent,
            damagesTaken: this._damagesTaken,
            energyRemaining: Math.round(this.crewUfo.energy),
            crewMember: this.crewMember ? this.crewMember.name : null,
            driftMaxLevel: this.driftLevel,
            fleetOrder: this.fleetOrder
        };
        return this.waveReport;
    }
}
