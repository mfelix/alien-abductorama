// ============================================
// CREW AI
// AI decision engine that generates virtual key inputs
// for crew-operated UFOs based on traits and zone state
// Agent 2 owns this file
// ============================================

class CrewAI {
    constructor(crewMember) {
        this.crewMember = crewMember;
        this.traits = crewMember.traits;
        this.decisionDelay = this._computeDecisionDelay();
        this.decisionTimer = 0;
        this.lastDecision = {
            ArrowLeft: false, ArrowRight: false, Space: false,
            deployDrone: null, dropBomb: false, fireMissile: false, deployCoordinator: null
        };
        this.mistakeChance = COMMAND_CONFIG.CREW.MISTAKE_CHANCE;
        this.effectiveReckless = this.traits.reckless;
        this._fleetOrder = 'balanced';

        // Weapon cooldown timers
        this._lastDroneDeployTime = 0;
        this._lastBombDropTime = 0;
        this._lastMissileFireTime = 0;
        this._lastCoordDeployTime = 0;
        this._weaponDecisionAge = 0;
    }

    // Compute reaction time based on traits
    // Reckless: fast (200ms), Cautious: slow (500ms), Balanced: moderate (350ms)
    _computeDecisionDelay() {
        var cfg = COMMAND_CONFIG.CREW;
        var r = this.traits.reckless;
        if (r > 0.6) return cfg.DECISION_DELAY_RECKLESS;
        if (r < 0.4) return cfg.DECISION_DELAY_CAUTIOUS;
        return cfg.DECISION_DELAY_BALANCED;
    }

    // Set fleet order and recompute effective recklessness
    setFleetOrder(order) {
        this._fleetOrder = order;
        var modifier = COMMAND_CONFIG.CREW.FLEET_ORDER_MODIFIER;
        switch (order) {
            case 'defensive':
                this.effectiveReckless = Math.max(0, this.traits.reckless - modifier);
                break;
            case 'harvest':
                this.effectiveReckless = Math.min(1, this.traits.reckless + modifier);
                break;
            default: // balanced
                this.effectiveReckless = this.traits.reckless;
                break;
        }
    }

    // Main AI method — returns virtual key state
    // Called every frame, but only recalculates on decision delay timer
    getInputs(zone) {
        var frameDt = zone._lastDt || (1 / 60);

        // Track elapsed time for weapon cooldowns (before early return)
        this._weaponDecisionAge += frameDt;

        // Advance decision timer
        this.decisionTimer -= frameDt;

        if (this.decisionTimer > 0) {
            // Hold previous decision
            return this.lastDecision;
        }

        // Recalculate decision
        var perfMod = this.crewMember.getPerformanceModifier();
        var driftPenalty = zone.driftLevel * COMMAND_CONFIG.ZONE.DRIFT_PENALTY;
        var effectivePerfMod = Math.max(0.3, perfMod * (1 - driftPenalty));

        // Compute adjusted decision delay: worse performance = slower reactions
        this.decisionTimer = this._computeDecisionDelay() / effectivePerfMod;

        // Compute adjusted mistake chance: worse performance = more mistakes
        var adjustedMistakeChance = this.mistakeChance / effectivePerfMod;

        var r = this.effectiveReckless;
        var ufo = zone.crewUfo;
        var inputs = {
            ArrowLeft: false, ArrowRight: false, Space: false,
            deployDrone: null, dropBomb: false, fireMissile: false, deployCoordinator: null
        };

        // 1. Find best target
        var target = this._findBestTarget(zone, r);

        // 2. Assess threats (nearest projectile or tank)
        var threat = this._findNearestThreat(zone);
        var dangerLevel = 0;
        if (threat) {
            var dx = threat.x - ufo.x;
            var dy = threat.y - ufo.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            dangerLevel = Math.max(0, 1 - (dist / COMMAND_CONFIG.ZONE.WORLD_W));
        }

        // 3. Movement decision
        if (target) {
            var targetDir = target.x < ufo.x ? -1 : (target.x > ufo.x ? 1 : 0);
            var distToTarget = Math.abs(target.x - ufo.x);

            if (dangerLevel > 0.6 && r < 0.5) {
                // Cautious behavior: evade instead of pursue when danger is high
                if (threat) {
                    inputs.ArrowLeft = threat.x > ufo.x;
                    inputs.ArrowRight = threat.x < ufo.x;
                }
            } else if (dangerLevel > 0.4 && r < 0.3) {
                // Very cautious: evade at moderate danger
                if (threat) {
                    inputs.ArrowLeft = threat.x > ufo.x;
                    inputs.ArrowRight = threat.x < ufo.x;
                }
            } else {
                // Move toward target
                if (distToTarget > 10) {
                    inputs.ArrowLeft = targetDir < 0;
                    inputs.ArrowRight = targetDir > 0;
                }
                // else: close enough, hold position
            }
        } else {
            // No target: reckless crews wander, cautious crews hold center
            if (r > 0.6) {
                // Reckless: wander toward a random side
                if (ufo.x < COMMAND_CONFIG.ZONE.WORLD_W * 0.3) {
                    inputs.ArrowRight = true;
                } else if (ufo.x > COMMAND_CONFIG.ZONE.WORLD_W * 0.7) {
                    inputs.ArrowLeft = true;
                } else {
                    // Random drift
                    inputs.ArrowLeft = Math.random() < 0.3;
                    inputs.ArrowRight = !inputs.ArrowLeft && Math.random() < 0.3;
                }
            } else {
                // Cautious/balanced: drift toward center
                var centerX = COMMAND_CONFIG.ZONE.WORLD_W / 2;
                if (Math.abs(ufo.x - centerX) > 30) {
                    inputs.ArrowLeft = ufo.x > centerX;
                    inputs.ArrowRight = ufo.x < centerX;
                }
            }
        }

        // Core mechanic: ship locked while abducting — suppress movement inputs
        if (ufo.beamActive && ufo.beamTarget) {
            inputs.ArrowLeft = false;
            inputs.ArrowRight = false;
        }

        // 4. Beam decision
        var energyRatio = ufo.energy / ufo.maxEnergy;
        var energyThreshold = r > 0.6 ? 0.15 :
                              r < 0.4 ? 0.50 : 0.30;

        if (energyRatio > energyThreshold) {
            inputs.Space = this._hasTargetInBeamRange(zone, ufo);
        }

        // Reckless crews beam even more aggressively
        if (r > 0.7 && energyRatio > 0.05 && !inputs.Space) {
            // Greedily beam if any target is even somewhat close
            inputs.Space = this._hasTargetInLooseRange(zone, ufo);
        }

        // 4.5 Weapon deployment decisions
        this._makeWeaponDecisions(zone, inputs, r);

        // 5. Apply mistake check
        if (Math.random() < adjustedMistakeChance) {
            this._applyMistake(inputs, r);
        }

        this.lastDecision = inputs;
        return inputs;
    }

    // Find the best target to pursue
    _findBestTarget(zone, reckless) {
        var ufo = zone.crewUfo;
        var targets = zone.targets;
        var best = null;
        var bestScore = -Infinity;

        for (var i = 0; i < targets.length; i++) {
            var t = targets[i];
            if (!t.alive || t.beingAbducted) continue;

            var dx = t.x - ufo.x;
            var dy = t.y - ufo.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            // Score: closer targets score higher
            // Reckless crews weight proximity more (aggressive pursuit)
            // Cautious crews weight safe positioning (prefer targets not near tanks)
            var score = 1000 - dist;

            // Bio-value bonus
            score += (t.bioValue || 1) * 50;

            // Cautious crews avoid targets near tanks
            if (reckless < 0.4) {
                var nearTank = false;
                for (var j = 0; j < zone.tanks.length; j++) {
                    if (zone.tanks[j].alive) {
                        var tdx = t.x - zone.tanks[j].x;
                        if (Math.abs(tdx) < 60) {
                            nearTank = true;
                            break;
                        }
                    }
                }
                if (nearTank) score -= 300;
            }

            if (score > bestScore) {
                bestScore = score;
                best = t;
            }
        }
        return best;
    }

    // Find the nearest threat (projectile or tank) to the UFO
    _findNearestThreat(zone) {
        var ufo = zone.crewUfo;
        var nearest = null;
        var nearestDist = Infinity;

        // Check projectiles
        for (var i = 0; i < zone.projectiles.length; i++) {
            var p = zone.projectiles[i];
            if (!p.alive) continue;
            var dx = p.x - ufo.x;
            var dy = p.y - ufo.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            // Only consider projectiles moving toward the UFO
            if (dy < 0 && dist < nearestDist) { // vy negative = moving upward toward UFO
                nearestDist = dist;
                nearest = p;
            }
        }

        // Check tanks (as positional threats)
        for (var i = 0; i < zone.tanks.length; i++) {
            var t = zone.tanks[i];
            if (!t.alive) continue;
            var dx = t.x - ufo.x;
            var dist = Math.abs(dx);
            // Tanks are threats when UFO is directly above them
            if (dist < 50 && dist < nearestDist) {
                nearestDist = dist;
                nearest = t;
            }
        }

        return nearest;
    }

    // Check if any target is within beam range (standard cone)
    _hasTargetInBeamRange(zone, ufo) {
        var beamRange = COMMAND_CONFIG.ZONE.BEAM_RANGE;
        var coneAngle = COMMAND_CONFIG.ZONE.BEAM_CONE_ANGLE;

        for (var i = 0; i < zone.targets.length; i++) {
            var t = zone.targets[i];
            if (!t.alive) continue;
            if (t.y <= ufo.y) continue; // Must be below UFO

            var dx = t.x - ufo.x;
            var dy = t.y - ufo.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.abs(Math.atan2(dx, dy));

            if (dist < beamRange && angle < coneAngle) {
                return true;
            }
        }
        return false;
    }

    // Loose range check for reckless beaming (wider cone, longer range)
    _hasTargetInLooseRange(zone, ufo) {
        var beamRange = COMMAND_CONFIG.ZONE.BEAM_RANGE * 1.3;
        var coneAngle = COMMAND_CONFIG.ZONE.BEAM_CONE_ANGLE * 2.0;

        for (var i = 0; i < zone.targets.length; i++) {
            var t = zone.targets[i];
            if (!t.alive) continue;
            if (t.y <= ufo.y) continue;

            var dx = t.x - ufo.x;
            var dy = t.y - ufo.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.abs(Math.atan2(dx, dy));

            if (dist < beamRange && angle < coneAngle) {
                return true;
            }
        }
        return false;
    }

    // Apply a mistake to the current decision
    // Reckless crew: more Type 1 (ignore threat) mistakes
    // Cautious crew: more Type 3 (hesitate) mistakes
    _applyMistake(inputs, reckless) {
        var roll = Math.random();

        // Weight mistake types by trait
        var type1Threshold = reckless > 0.6 ? 0.5 : 0.25;  // Ignore threat
        var type2Threshold = type1Threshold + 0.25;          // Miss beam opportunity
        // Remainder = Type 3: hesitate

        if (roll < type1Threshold) {
            // Type 1: Ignore threat — move wrong direction
            var temp = inputs.ArrowLeft;
            inputs.ArrowLeft = inputs.ArrowRight;
            inputs.ArrowRight = temp;
        } else if (roll < type2Threshold) {
            // Type 2: Miss a beam opportunity
            inputs.Space = false;
        } else {
            // Type 3: Hesitate — freeze movement
            inputs.ArrowLeft = false;
            inputs.ArrowRight = false;
        }

        // Weapon mistakes (10% chance when already making a mistake)
        if (Math.random() < 0.10) {
            var wroll = Math.random();
            if (wroll < 0.4) {
                // Hesitate on weapons — cancel weapon action
                inputs.dropBomb = false;
                inputs.fireMissile = false;
                inputs.deployDrone = null;
                inputs.deployCoordinator = null;
            } else if (wroll < 0.7 && inputs.deployDrone) {
                // Deploy wrong drone type
                inputs.deployDrone = inputs.deployDrone === 'harvester' ? 'battle' : 'harvester';
            } else if (wroll < 1.0 && inputs.deployCoordinator) {
                // Deploy wrong coordinator type
                inputs.deployCoordinator = inputs.deployCoordinator === 'harvester' ? 'attack' : 'harvester';
            }
        }
    }

    // Reset per-wave state
    reset() {
        this.decisionTimer = 0;
        this.lastDecision = {
            ArrowLeft: false, ArrowRight: false, Space: false,
            deployDrone: null, dropBomb: false, fireMissile: false, deployCoordinator: null
        };
        // Reset weapon cooldown timers
        this._lastDroneDeployTime = 0;
        this._lastBombDropTime = 0;
        this._lastMissileFireTime = 0;
        this._lastCoordDeployTime = 0;
        this._weaponDecisionAge = 0;
        // Recompute effective reckless in case fleet order changed
        this.setFleetOrder(this._fleetOrder);
    }

    // ============================================
    // WEAPON DEPLOYMENT DECISIONS
    // ============================================

    // Main weapon decision method — picks at most one weapon action per cycle
    // Uses priority: coordinator > drone > missile > bomb
    _makeWeaponDecisions(zone, inputs, reckless) {
        var wcfg = COMMAND_CONFIG.WEAPONS;
        var acfg = wcfg.AI;
        var tech = zone.techLevel || 0;
        var age = this._weaponDecisionAge;

        // 1. Deploy Coordinator
        if (tech >= wcfg.TECH_UNLOCK.HARVESTER_COORDINATOR &&
            age - this._lastCoordDeployTime >= acfg.COORDINATOR_DEPLOY_INTERVAL) {

            var coordType = this._pickCoordinatorType(zone, tech, reckless, wcfg);
            if (coordType) {
                inputs.deployCoordinator = coordType;
                this._lastCoordDeployTime = age;
                return;
            }
        }

        // 2. Deploy Drone
        if (tech >= wcfg.TECH_UNLOCK.HARVESTER_DRONE &&
            age - this._lastDroneDeployTime >= acfg.DRONE_DEPLOY_INTERVAL) {

            var droneType = this._pickDroneType(zone, tech, reckless, wcfg);
            if (droneType) {
                inputs.deployDrone = droneType;
                this._lastDroneDeployTime = age;
                return;
            }
        }

        // 3. Fire Missiles
        if (tech >= wcfg.TECH_UNLOCK.MISSILE &&
            age - this._lastMissileFireTime >= acfg.MISSILE_FIRE_INTERVAL) {

            var minTanks = reckless > 0.6 ? acfg.MISSILE_MIN_TANKS : acfg.MISSILE_MIN_TANKS + 1;
            var aliveTanks = this._countAliveTanks(zone);
            if (aliveTanks >= minTanks && this._hasReadyMissileGroup(zone)) {
                inputs.fireMissile = true;
                this._lastMissileFireTime = age;
                return;
            }
        }

        // 4. Drop Bomb
        if (tech >= wcfg.TECH_UNLOCK.BOMB &&
            age - this._lastBombDropTime >= acfg.BOMB_DROP_INTERVAL) {

            if (zone.bombsAvailable > 0 && this._findBombTarget(zone, reckless, wcfg)) {
                inputs.dropBomb = true;
                this._lastBombDropTime = age;
                return;
            }
        }
    }

    // Pick coordinator type to deploy, or null if none appropriate
    _pickCoordinatorType(zone, tech, reckless, wcfg) {
        var maxCoords = wcfg.COORDINATOR.MAX_PER_ZONE;
        var canHarvester = tech >= wcfg.TECH_UNLOCK.HARVESTER_COORDINATOR;
        var canAttack = tech >= wcfg.TECH_UNLOCK.ATTACK_COORDINATOR;

        // Check cooldown timer on zone
        if (zone.coordinatorDeployTimer > 0) return null;

        // Don't deploy if any coordinator is currently deploying (still descending)
        var coords = zone.coordinators || [];
        for (var i = 0; i < coords.length; i++) {
            if (coords[i].alive && coords[i].state === 'DEPLOYING') return null;
        }

        var harvCount = this._countCoordinatorsByType(zone, 'harvester');
        var atkCount = this._countCoordinatorsByType(zone, 'attack');

        // Reckless prefers attack, cautious prefers harvester
        if (reckless > 0.6) {
            // Try attack first
            if (canAttack && atkCount < maxCoords) return 'attack';
            if (canHarvester && harvCount < maxCoords) return 'harvester';
        } else {
            // Try harvester first
            if (canHarvester && harvCount < maxCoords) return 'harvester';
            if (canAttack && atkCount < maxCoords) return 'attack';
        }

        return null;
    }

    // Pick drone type to deploy, or null if none appropriate
    _pickDroneType(zone, tech, reckless, wcfg) {
        var maxDrones = wcfg.DRONE.MAX_PER_ZONE;

        // Check cooldown timer on zone
        if (zone.droneDeployTimer > 0) return null;

        var canHarvester = tech >= wcfg.TECH_UNLOCK.HARVESTER_DRONE;
        var canBattle = tech >= wcfg.TECH_UNLOCK.BATTLE_DRONE;
        var harvCount = this._countDronesByType(zone, 'harvester');
        var battleCount = this._countDronesByType(zone, 'battle');
        var hasTargets = this._hasAliveTargets(zone);
        var hasTanks = this._countAliveTanks(zone) > 0;

        // Reckless favors battle (70%), cautious favors harvester (70%)
        var preferBattle = reckless > 0.5 ? Math.random() < 0.7 : Math.random() < 0.3;

        if (preferBattle && canBattle && battleCount < maxDrones && hasTanks) {
            return 'battle';
        }
        if (canHarvester && harvCount < maxDrones && hasTargets) {
            return 'harvester';
        }
        // Fallback: try the other type
        if (canBattle && battleCount < maxDrones && hasTanks) {
            return 'battle';
        }

        return null;
    }

    // Check if there's a good bomb target (tank cluster or tank below UFO)
    _findBombTarget(zone, reckless, wcfg) {
        var ufo = zone.crewUfo;
        var tanks = zone.tanks;
        var clusterDist = wcfg.AI.BOMB_TANK_CLUSTER_DIST;
        // Reckless crews bomb more aggressively (wider aim)
        var directRange = reckless > 0.6 ? 80 : 40;

        // Check for a tank directly below UFO
        for (var i = 0; i < tanks.length; i++) {
            if (!tanks[i].alive) continue;
            if (Math.abs(tanks[i].x - ufo.x) < directRange) return true;
        }

        // Check for tank cluster (2+ tanks close together)
        for (var i = 0; i < tanks.length; i++) {
            if (!tanks[i].alive) continue;
            for (var j = i + 1; j < tanks.length; j++) {
                if (!tanks[j].alive) continue;
                if (Math.abs(tanks[i].x - tanks[j].x) < clusterDist) return true;
            }
        }

        return false;
    }

    // Check if any missile group is ready to fire
    _hasReadyMissileGroup(zone) {
        var groups = zone.missileGroups || [];
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].ready) return true;
        }
        return false;
    }

    // Count alive drones of given type in zone
    _countDronesByType(zone, type) {
        var drones = zone.drones || [];
        var count = 0;
        for (var i = 0; i < drones.length; i++) {
            if (drones[i].alive && drones[i].type === type) count++;
        }
        return count;
    }

    // Count alive coordinators of given type in zone
    _countCoordinatorsByType(zone, type) {
        var coords = zone.coordinators || [];
        var count = 0;
        for (var i = 0; i < coords.length; i++) {
            if (coords[i].alive && coords[i].type === type) count++;
        }
        return count;
    }

    // Count alive tanks in zone
    _countAliveTanks(zone) {
        var tanks = zone.tanks;
        var count = 0;
        for (var i = 0; i < tanks.length; i++) {
            if (tanks[i].alive) count++;
        }
        return count;
    }

    // Check if there are alive abduction targets
    _hasAliveTargets(zone) {
        var targets = zone.targets;
        for (var i = 0; i < targets.length; i++) {
            if (targets[i].alive && !targets[i].beingAbducted) return true;
        }
        return false;
    }
}
