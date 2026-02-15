// ============================================
// ZONE SIMULATION — Simplified Phase 1 loop per zone
// ============================================
// Runs once per frame per zone. Handles targets, tanks,
// UFO movement, beam mechanics, drift, collisions, quota.
// Does NOT render — just updates ZoneState.

// Target type definitions for zone simulation
const ZONE_TARGET_TYPES = [
    { type: 'human', spawnWeight: 0.40, bioValue: 3, color: '#0f0' },
    { type: 'cow',   spawnWeight: 0.25, bioValue: 2, color: '#fa0' },
    { type: 'sheep', spawnWeight: 0.15, bioValue: 2, color: '#fff' },
    { type: 'cat',   spawnWeight: 0.10, bioValue: 1, color: '#f80' },
    { type: 'dog',   spawnWeight: 0.10, bioValue: 1, color: '#a86' }
];

// Temp keyboard input for testing before CrewAI is connected
function getKeyboardInputs() {
    return {
        ArrowLeft: typeof keys !== 'undefined' && keys && keys['ArrowLeft'],
        ArrowRight: typeof keys !== 'undefined' && keys && keys['ArrowRight'],
        Space: typeof keys !== 'undefined' && keys && (keys[' '] || keys['Space'])
    };
}

// ---- MASTER UPDATE ----

function zoneUpdate(zone, dt, playerFocused) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const worldW = cfg.WORLD_W || 480;
    const worldH = cfg.WORLD_H || 300;
    const groundY = cfg.GROUND_Y || 270;

    // Cap dt to prevent spiral of death
    if (dt > 0.1) dt = 0.1;

    // Store dt for CrewAI to read
    zone._lastDt = dt;

    // Handle UFO respawn
    if (zone.ufoRespawnTimer > 0) {
        zone.ufoRespawnTimer -= dt;
        if (zone.ufoRespawnTimer <= 0) {
            zone.ufoRespawnTimer = 0;
            zone.crewUfo.health = 100;
            zone.crewUfo.energy = zone.crewUfo.maxEnergy;
            zone.crewUfo.x = worldW / 2;
            zone.crewUfo.y = worldH * 0.3;
            zone.crewUfo.vx = 0;
            zone.crewUfo.beamActive = false;
            zone.crewUfo.beamTarget = null;
        }
        // Still update other systems while UFO is respawning
        zoneUpdateTargets(zone, dt, worldW, groundY);
        zoneUpdateTanks(zone, dt, worldW, groundY);
        zoneUpdateProjectiles(zone, dt, worldW, worldH);
        zoneUpdateWeapons(zone, dt);
        zoneUpdateDrift(zone, dt, playerFocused);
        zoneUpdateParticles(zone, dt);
        zoneComputeHealth(zone);
        return;
    }

    // 1. Spawn targets
    zoneSpawnTargets(zone, dt, worldW, groundY, cfg);

    // 2. Update target wandering
    zoneUpdateTargets(zone, dt, worldW, groundY);

    // 3. Get AI inputs
    var inputs;
    if (zone.isOverrideActive) {
        inputs = getKeyboardInputs();
    } else if (zone.crewAI && typeof zone.crewAI.getInputs === 'function') {
        inputs = zone.crewAI.getInputs(zone);
    } else {
        inputs = getKeyboardInputs();
    }

    // 4. Update UFO movement from inputs
    zoneUpdateAIUfo(zone, dt, inputs, worldW, worldH, cfg);

    // 5. Update beam system
    zoneUpdateBeam(zone, dt, inputs, cfg);

    // 5.5 Process weapon deployment commands from AI
    if (inputs) {
        if (inputs.deployDrone) zoneSpawnDrone(zone, inputs.deployDrone);
        if (inputs.dropBomb) zoneSpawnBomb(zone);
        if (inputs.fireMissile) zoneFireMissileGroup(zone);
        if (inputs.deployCoordinator) zoneSpawnCoordinator(zone, inputs.deployCoordinator);
    }

    // 6. Spawn/update tanks
    zoneUpdateTanks(zone, dt, worldW, groundY);

    // 7. Update projectiles
    zoneUpdateProjectiles(zone, dt, worldW, worldH);

    // 8. Check collisions
    zoneCheckCollisions(zone);

    // 8.5 Update weapon systems
    zoneUpdateWeapons(zone, dt);

    // 9. Update quota
    zoneUpdateQuota(zone);

    // 10. Update drift
    zoneUpdateDrift(zone, dt, playerFocused);

    // 11. Update particles
    zoneUpdateParticles(zone, dt);

    // 12. Compute zone health + state
    zoneComputeHealth(zone);
}

// ---- TARGET SYSTEM ----

function _pickTargetType() {
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < ZONE_TARGET_TYPES.length; i++) {
        cumulative += ZONE_TARGET_TYPES[i].spawnWeight;
        if (roll <= cumulative) return ZONE_TARGET_TYPES[i];
    }
    return ZONE_TARGET_TYPES[0];
}

function zoneSpawnTargets(zone, dt, worldW, groundY, cfg) {
    const maxTargets = cfg.MAX_TARGETS || 5;
    const spawnMin = cfg.SPAWN_INTERVAL_MIN || 2.5;
    const spawnMax = cfg.SPAWN_INTERVAL_MAX || 4.0;

    zone.targetSpawnTimer -= dt;
    if (zone.targetSpawnTimer <= 0 && zone.targets.length < maxTargets) {
        const typeInfo = _pickTargetType();
        const margin = 20;
        const x = margin + Math.random() * (worldW - margin * 2);

        zone.targets.push({
            x: x,
            y: groundY - 3,
            type: typeInfo.type,
            weight: 1.0,
            bioValue: typeInfo.bioValue,
            color: typeInfo.color,
            alive: true,
            beingAbducted: false,
            abductionProgress: 0,
            wanderVx: (10 + Math.random() * 15) * (Math.random() < 0.5 ? 1 : -1),
            wanderTimer: 1 + Math.random() * 3,
            falling: false,
            vy: 0
        });

        zone.targetSpawnTimer = spawnMin + Math.random() * (spawnMax - spawnMin);
    }
}

function zoneUpdateTargets(zone, dt, worldW, groundY) {
    for (let i = zone.targets.length - 1; i >= 0; i--) {
        const t = zone.targets[i];
        if (!t.alive) {
            zone.targets.splice(i, 1);
            continue;
        }

        // Being abducted — rise toward UFO along beam
        if (t.beingAbducted) {
            const ufo = zone.crewUfo;
            t.abductionProgress += dt;
            // Rise toward UFO at steady speed
            const riseSpeed = 90;
            t.y -= riseSpeed * dt;
            // Lock target X under UFO center — accelerating centering
            // prevents visual drift out of narrowing beam cone
            const dx = ufo.x - t.x;
            if (Math.abs(dx) > 0.5) {
                // Lerp factor increases with abduction progress (faster centering as target rises)
                const lerpStrength = 4 + t.abductionProgress * 6;
                t.x += dx * Math.min(1, lerpStrength * dt);
            }
            // Abduction complete when target reaches UFO Y position
            if (t.y <= ufo.y + 5) {
                t.alive = false;
                zone.quota.current++;
                // Small cyan sparkle at UFO position (NOT explosion)
                _spawnZoneParticles(zone, ufo.x, ufo.y, '#0ff', 3);
            }
            continue;
        }

        // Falling (dropped from beam)
        if (t.falling) {
            t.vy += 400 * dt;
            t.y += t.vy * dt;
            if (t.y >= groundY - 3) {
                t.y = groundY - 3;
                t.falling = false;
                t.vy = 0;
            }
            continue;
        }

        // Wander
        t.wanderTimer -= dt;
        if (t.wanderTimer <= 0) {
            t.wanderVx = (10 + Math.random() * 15) * (Math.random() < 0.5 ? 1 : -1);
            t.wanderTimer = 1 + Math.random() * 3;
        }
        t.x += t.wanderVx * dt;

        // Bounce off zone edges
        const margin = 10;
        if (t.x < margin) {
            t.x = margin;
            t.wanderVx = Math.abs(t.wanderVx);
        } else if (t.x > worldW - margin) {
            t.x = worldW - margin;
            t.wanderVx = -Math.abs(t.wanderVx);
        }
    }
}

// ---- UFO MOVEMENT ----

function zoneUpdateAIUfo(zone, dt, inputs, worldW, worldH, cfg) {
    const ufo = zone.crewUfo;
    const speed = cfg.UFO_SPEED || 100;

    // Phase 1 core mechanic: beam ON with target = ship LOCKED
    const isAbducting = ufo.beamActive && ufo.beamTarget;

    if (!isAbducting) {
        // Horizontal movement from inputs
        if (inputs.ArrowLeft) {
            ufo.vx = -speed;
        } else if (inputs.ArrowRight) {
            ufo.vx = speed;
        } else {
            ufo.vx *= 0.85;
            if (Math.abs(ufo.vx) < 1) ufo.vx = 0;
        }
    } else {
        // Decay velocity during abduction so UFO doesn't lurch when beam ends
        ufo.vx *= Math.exp(-8 * dt);
        if (Math.abs(ufo.vx) < 1) ufo.vx = 0;
    }

    ufo.x += ufo.vx * dt;

    // Clamp to zone bounds
    const halfW = ufo.width / 2;
    if (ufo.x < halfW) {
        ufo.x = halfW;
        ufo.vx = 0;
    } else if (ufo.x > worldW - halfW) {
        ufo.x = worldW - halfW;
        ufo.vx = 0;
    }

    // Gentle vertical hover
    zone.hoverTime += dt;
    ufo.y = worldH * 0.3 + Math.sin(zone.hoverTime * 2 + ufo.hoverOffset) * 3;
}

// ---- BEAM SYSTEM ----

function zoneUpdateBeam(zone, dt, inputs, cfg) {
    const ufo = zone.crewUfo;
    const beamDrain = cfg.BEAM_DRAIN || 20;
    const beamRecharge = cfg.BEAM_RECHARGE || 14;
    const beamRange = cfg.BEAM_RANGE || 210;
    const beamConeAngle = cfg.BEAM_CONE_ANGLE || 0.3;

    if (inputs.Space && ufo.energy > 5) {
        ufo.beamActive = true;
        ufo.energy -= beamDrain * dt;
        if (ufo.energy < 0) ufo.energy = 0;

        // Find nearest target below UFO within cone
        if (!ufo.beamTarget || !ufo.beamTarget.alive || !ufo.beamTarget.beingAbducted) {
            ufo.beamTarget = null;
            let bestTarget = null;
            let bestDist = Infinity;

            for (let i = 0; i < zone.targets.length; i++) {
                const t = zone.targets[i];
                if (!t.alive || t.beingAbducted) continue;
                if (t.y <= ufo.y) continue; // Must be below UFO

                const dx = t.x - ufo.x;
                const dy = t.y - ufo.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.abs(Math.atan2(dx, dy));

                if (dist < beamRange && angle < beamConeAngle && dist < bestDist) {
                    bestTarget = t;
                    bestDist = dist;
                }
            }

            if (bestTarget) {
                ufo.beamTarget = bestTarget;
                bestTarget.beingAbducted = true;
                bestTarget.abductionProgress = 0;
            }
        }

        // Out of energy — drop beam
        if (ufo.energy <= 0) {
            _dropBeamTarget(zone);
            ufo.beamActive = false;
        }
    } else {
        // Beam off — recharge energy
        if (ufo.beamActive) {
            _dropBeamTarget(zone);
        }
        ufo.beamActive = false;
        ufo.energy = Math.min(ufo.maxEnergy, ufo.energy + beamRecharge * dt);
    }
}

function _dropBeamTarget(zone) {
    const ufo = zone.crewUfo;
    if (ufo.beamTarget && ufo.beamTarget.alive) {
        ufo.beamTarget.beingAbducted = false;
        ufo.beamTarget.abductionProgress = 0;
        // If target is in the air, let it fall
        const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
        const groundY = cfg.GROUND_Y || 270;
        if (ufo.beamTarget.y < groundY - 10) {
            ufo.beamTarget.falling = true;
            ufo.beamTarget.vy = 0;
        }
    }
    ufo.beamTarget = null;
}

// ---- TANK SYSTEM ----

function zoneSpawnTanks(zone) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const worldW = cfg.WORLD_W || 480;
    const groundY = cfg.GROUND_Y || 270;

    const tankCount = 1 + Math.floor(zone.difficulty * 0.5);
    zone.tanks = [];

    for (let i = 0; i < tankCount; i++) {
        const fromLeft = Math.random() < 0.5;
        const x = fromLeft ? 20 : worldW - 20;
        const direction = fromLeft ? 1 : -1;
        const speed = 15 + zone.difficulty * 5;
        const fireInterval = 3.0 - zone.difficulty * 0.3;

        zone.tanks.push({
            x: x,
            y: groundY - 6,
            direction: direction,
            speed: speed,
            fireTimer: 1 + Math.random() * fireInterval,
            fireInterval: fireInterval,
            alive: true,
            turretAngle: -Math.PI / 2,
            projectileType: 'shell',
            respawnTimer: 0
        });
    }
}

function zoneUpdateTanks(zone, dt, worldW, groundY) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const shellSpeed = cfg.SHELL_SPEED || 120;
    const shellDamage = cfg.SHELL_DAMAGE || 10;
    const ufo = zone.crewUfo;

    for (let i = 0; i < zone.tanks.length; i++) {
        const tank = zone.tanks[i];

        if (!tank.alive) {
            tank.respawnTimer -= dt;
            if (tank.respawnTimer <= 0) {
                // Respawn at edge
                const fromLeft = Math.random() < 0.5;
                tank.x = fromLeft ? 20 : worldW - 20;
                tank.direction = fromLeft ? 1 : -1;
                tank.alive = true;
                tank.fireTimer = 1 + Math.random() * tank.fireInterval;
            }
            continue;
        }

        // Move horizontally
        tank.x += tank.direction * tank.speed * dt;
        if (tank.x < 20) {
            tank.x = 20;
            tank.direction = 1;
        } else if (tank.x > worldW - 20) {
            tank.x = worldW - 20;
            tank.direction = -1;
        }

        // Aim turret at UFO
        if (zone.ufoRespawnTimer <= 0) {
            tank.turretAngle = Math.atan2(ufo.y - tank.y, ufo.x - tank.x);
        }

        // Fire
        tank.fireTimer -= dt;
        if (tank.fireTimer <= 0 && zone.ufoRespawnTimer <= 0) {
            tank.fireTimer = tank.fireInterval;

            // Aim with slight inaccuracy
            const inaccuracy = (Math.random() - 0.5) * 0.15;
            const angle = tank.turretAngle + inaccuracy;

            zone.projectiles.push({
                x: tank.x,
                y: tank.y - 6,
                vx: Math.cos(angle) * shellSpeed,
                vy: Math.sin(angle) * shellSpeed,
                type: 'shell',
                alive: true,
                damage: shellDamage
            });
        }
    }
}

// ---- PROJECTILE SYSTEM ----

function zoneUpdateProjectiles(zone, dt, worldW, worldH) {
    for (let i = zone.projectiles.length - 1; i >= 0; i--) {
        const p = zone.projectiles[i];
        if (!p.alive) {
            zone.projectiles.splice(i, 1);
            continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Remove if out of bounds
        if (p.x < -10 || p.x > worldW + 10 || p.y < -10 || p.y > worldH + 10) {
            zone.projectiles.splice(i, 1);
        }
    }
}

// ---- COLLISION SYSTEM ----

function zoneCheckCollisions(zone) {
    const ufo = zone.crewUfo;
    if (zone.ufoRespawnTimer > 0) return;

    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const respawnTime = cfg.UFO_RESPAWN_TIME || 3.0;

    // Projectile -> UFO
    for (let i = zone.projectiles.length - 1; i >= 0; i--) {
        const p = zone.projectiles[i];
        if (!p.alive) continue;

        if (Math.abs(p.x - ufo.x) < ufo.width / 2 &&
            Math.abs(p.y - ufo.y) < ufo.height / 2) {
            ufo.health -= p.damage;
            p.alive = false;
            zone._damagesTaken++;
            _spawnZoneParticles(zone, p.x, p.y, '#f44', 5);

            // UFO destroyed
            if (ufo.health <= 0) {
                ufo.health = 0;
                _dropBeamTarget(zone);
                ufo.beamActive = false;
                zone.ufoRespawnTimer = respawnTime;
                _spawnZoneParticles(zone, ufo.x, ufo.y, '#ff0', 12);
            }
        }
    }
}

// ---- QUOTA TRACKING ----

function zoneUpdateQuota(zone) {
    // Quota is updated in target abduction completion (in zoneUpdateTargets)
    // This function exists for future expansion
}

// ---- DRIFT SYSTEM ----

function zoneUpdateDrift(zone, dt, focused) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const driftBaseTime = cfg.DRIFT_BASE_TIME || 25;
    const driftRecoverTime = cfg.DRIFT_RECOVER_TIME || 3.0;

    if (focused) {
        // Reset drift timer
        zone.driftTimer = driftBaseTime;
        zone.driftAccumulator = 0;
        // Recover drift level
        if (zone.driftLevel > 0) {
            zone.driftRecoverTimer += dt;
            if (zone.driftRecoverTimer >= driftRecoverTime) {
                zone.driftLevel = Math.max(0, zone.driftLevel - 1);
                zone.driftRecoverTimer = 0;
            }
        } else {
            zone.driftRecoverTimer = 0;
        }
    } else {
        zone.driftRecoverTimer = 0;
        zone.driftTimer -= dt;
        if (zone.driftTimer <= 0) {
            zone.driftTimer = 0;
            zone.driftAccumulator += dt;
            if (zone.driftAccumulator >= 1.0) {
                zone.driftLevel = Math.min(4, zone.driftLevel + 1);
                zone.driftAccumulator = 0;
            }
        }
    }
}

// ---- PARTICLES ----

function _spawnZoneParticles(zone, x, y, color, count) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const budget = cfg.PARTICLE_BUDGET || 30;

    for (let i = 0; i < count; i++) {
        if (zone.particles.length >= budget) {
            // Remove oldest
            zone.particles.shift();
        }
        zone.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 60,
            vy: (Math.random() - 0.5) * 60 - 20,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1.0,
            color: color,
            size: 1 + Math.random() * 2
        });
    }
}

function zoneUpdateParticles(zone, dt) {
    for (let i = zone.particles.length - 1; i >= 0; i--) {
        const p = zone.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) {
            zone.particles.splice(i, 1);
        }
    }
}

// ---- ZONE HEALTH SCORE ----

function zoneComputeHealth(zone) {
    const quotaFactor = zone.quota.target > 0
        ? Math.min(1, zone.quota.current / zone.quota.target)
        : 0;
    const energyFactor = zone.crewUfo.maxEnergy > 0
        ? zone.crewUfo.energy / zone.crewUfo.maxEnergy
        : 0;
    const healthFactor = zone.crewUfo.health / 100;
    const driftFactor = 1 - zone.driftLevel * 0.15;

    zone.healthScore = Math.max(0, Math.min(1,
        quotaFactor * 0.4 + energyFactor * 0.2 + healthFactor * 0.2 + driftFactor * 0.2
    ));

    if (zone.healthScore >= 0.7) zone.state = 'stable';
    else if (zone.healthScore >= 0.4) zone.state = 'stressed';
    else if (zone.healthScore >= 0.15) zone.state = 'crisis';
    else zone.state = 'emergency';
}

// ============================================
// WEAPON SYSTEMS — Bombs, Missiles, Drones, Coordinators, Explosions
// ============================================
// All gated by zone.techLevel. Entities live in zone arrays
// defined in ZoneState. Config from COMMAND_CONFIG.WEAPONS.

// ---- MASTER WEAPON UPDATE ----

function zoneUpdateWeapons(zone, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;

    const tech = cfg.TECH_UNLOCK;

    // Update active entities regardless of tech level (they may already exist)
    zoneUpdateBombs(zone, dt);
    zoneUpdateMissiles(zone, dt);
    zoneUpdateDrones(zone, dt);
    zoneUpdateCoordinators(zone, dt);
    zoneUpdateExplosions(zone, dt);

    // Recharge weapon timers (gated by tech)
    zoneUpdateWeaponTimers(zone, dt);

    // Check projectile hits on drones/coordinators
    zoneCheckWeaponCollisions(zone);
}

// ---- BOMB SYSTEM ----

function zoneSpawnBomb(zone) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const bombCfg = cfg.BOMB;

    if (zone.bombsAvailable <= 0) return;
    if (zone.bombs.length >= bombCfg.MAX_PER_ZONE) return;

    const ufo = zone.crewUfo;
    zone.bombsAvailable--;

    zone.bombs.push({
        x: ufo.x,
        y: ufo.y + 8,
        vx: ufo.vx * bombCfg.UFO_VX_INHERIT,
        vy: bombCfg.INITIAL_VY,
        bounceCount: 0,
        alive: true,
        rotation: 0
    });
}

function zoneUpdateBombs(zone, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const bombCfg = cfg.BOMB;
    const zoneCfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const groundY = zoneCfg.GROUND_Y || 270;
    const worldW = zoneCfg.WORLD_W || 480;

    for (let i = zone.bombs.length - 1; i >= 0; i--) {
        const b = zone.bombs[i];
        if (!b.alive) {
            zone.bombs.splice(i, 1);
            continue;
        }

        // Apply gravity
        b.vy += bombCfg.GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rotation += b.vx * 0.01;

        // Bounce off walls
        if (b.x < 5) {
            b.x = 5;
            b.vx = Math.abs(b.vx);
        } else if (b.x > worldW - 5) {
            b.x = worldW - 5;
            b.vx = -Math.abs(b.vx);
        }

        // Bounce off ground
        if (b.y >= groundY) {
            b.y = groundY;
            b.bounceCount++;

            if (b.bounceCount >= bombCfg.MAX_BOUNCES || Math.abs(b.vy) < 15) {
                // Explode
                _zoneBombExplode(zone, b);
                b.alive = false;
            } else {
                b.vy = -Math.abs(b.vy) * bombCfg.BOUNCE_DAMPING;
                b.vx *= bombCfg.BOUNCE_DAMPING;
            }
        }
    }
}

function _zoneBombExplode(zone, bomb) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const bombCfg = cfg.BOMB;
    const explCfg = cfg.EXPLOSION;

    // Damage tanks in blast radius
    for (let i = 0; i < zone.tanks.length; i++) {
        const tank = zone.tanks[i];
        if (!tank.alive) continue;
        const dx = tank.x - bomb.x;
        const dy = tank.y - bomb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bombCfg.EXPLOSION_RADIUS) {
            _zoneWeaponDamageTank(zone, tank, bombCfg.EXPLOSION_DAMAGE);
        }
    }

    // Spawn explosion entity
    _zoneCreateExplosion(zone, bomb.x, bomb.y, explCfg.BOMB_RADIUS, '#ff0');
    _spawnZoneParticles(zone, bomb.x, bomb.y, '#fa0', explCfg.PARTICLE_COUNT);
}

// ---- MISSILE SYSTEM ----

function zoneFireMissileGroup(zone) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const mCfg = cfg.MISSILE;

    // Find a ready missile group
    let groupIdx = -1;
    for (let i = 0; i < zone.missileGroups.length; i++) {
        if (zone.missileGroups[i].ready) {
            groupIdx = i;
            break;
        }
    }
    if (groupIdx < 0) return;

    zone.missileGroups[groupIdx].ready = false;
    zone.missileGroups[groupIdx].rechargeTimer = mCfg.RECHARGE_TIME;

    const ufo = zone.crewUfo;
    const aliveTanks = zone.tanks.filter(function(t) { return t.alive; });
    // Randomize how many missiles actually fire (between 2 and GROUP_SIZE)
    const salvoCount = Math.floor(Math.random() * (mCfg.GROUP_SIZE - 1)) + 2;
    const fanStep = aliveTanks.length > 0 ? mCfg.FAN_SPREAD / Math.max(1, salvoCount - 1) : 0;
    const fanStart = -mCfg.FAN_SPREAD / 2;

    for (let i = 0; i < salvoCount; i++) {
        // Assign different tank targets where possible
        var target = null;
        if (aliveTanks.length > 0) {
            target = aliveTanks[i % aliveTanks.length];
        }

        var heading = -Math.PI / 2; // straight up
        if (salvoCount > 1) {
            heading += fanStart + fanStep * i;
        }
        // Add small random heading offset so missiles don't launch in perfectly even fan patterns
        heading += (Math.random() - 0.5) * 0.3;

        zone.missiles.push({
            x: ufo.x,
            y: ufo.y + 5,
            vx: Math.cos(heading) * mCfg.LAUNCH_SPEED * 0.3,
            vy: Math.sin(heading) * mCfg.LAUNCH_SPEED * 0.3,
            heading: heading,
            speed: mCfg.LAUNCH_SPEED * 0.3,
            phase: 'LAUNCH',
            age: 0,
            phaseTime: 0,
            targetTank: target,
            prevLosAngle: target ? Math.atan2(target.y - ufo.y, target.x - ufo.x) : 0,
            trail: [],
            alive: true,
            damage: mCfg.DAMAGE,
            launchDelay: 0.03 * i,
            wobbleFreq: 2 + Math.random() * 4,       // how fast it wobbles (2-6 Hz)
            wobbleAmp: 0.3 + Math.random() * 0.7,    // how wide it wobbles (0.3-1.0 rad/s)
            wobblePhase: Math.random() * Math.PI * 2  // starting phase offset
        });
    }
}

function zoneUpdateMissiles(zone, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const mCfg = cfg.MISSILE;
    const zoneCfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const groundY = zoneCfg.GROUND_Y || 270;
    const worldW = zoneCfg.WORLD_W || 480;

    for (let i = zone.missiles.length - 1; i >= 0; i--) {
        const m = zone.missiles[i];
        if (!m.alive) {
            zone.missiles.splice(i, 1);
            continue;
        }

        // Staggered launch delay
        if (m.launchDelay > 0) {
            m.launchDelay -= dt;
            continue;
        }

        m.age += dt;
        m.phaseTime += dt;

        // Retarget if target dead
        if (m.targetTank && !m.targetTank.alive) {
            m.targetTank = _zoneFindNearestAliveTank(zone, m.x, m.y);
        }
        if (!m.targetTank && m.phase === 'DIVE') {
            // No targets — self-destruct
            _zoneMissileExplode(zone, m);
            m.alive = false;
            continue;
        }

        // Phase transitions
        if (m.phase === 'LAUNCH' && m.phaseTime >= mCfg.LAUNCH_DURATION) {
            m.phase = 'DECEL';
            m.phaseTime = 0;
        } else if (m.phase === 'DECEL' && m.phaseTime >= mCfg.DECEL_DURATION) {
            m.phase = 'APEX';
            m.phaseTime = 0;
        } else if (m.phase === 'APEX' && m.phaseTime >= mCfg.APEX_DURATION) {
            m.phase = 'DIVE';
            m.phaseTime = 0;
            // Re-acquire target for dive
            if (!m.targetTank) {
                m.targetTank = _zoneFindNearestAliveTank(zone, m.x, m.y);
            }
            if (m.targetTank) {
                // Point heading directly at target so thrust drives toward it
                m.heading = Math.atan2(m.targetTank.y - m.y, m.targetTank.x - m.x);
                m.prevLosAngle = m.heading;
            }
        }

        // Apply phase physics
        if (m.phase === 'LAUNCH') {
            // Thrust along heading
            m.vx += Math.cos(m.heading) * mCfg.LAUNCH_THRUST * dt;
            m.vy += Math.sin(m.heading) * mCfg.LAUNCH_THRUST * dt;
            // Light drag
            m.vx *= (1 - mCfg.DRAG_LAUNCH * dt);
            m.vy *= (1 - mCfg.DRAG_LAUNCH * dt);
        } else if (m.phase === 'DECEL') {
            // Zero thrust, heavy drag, gravity arc-over
            m.vx *= (1 - mCfg.DRAG_DECEL * dt);
            m.vy *= (1 - mCfg.DRAG_DECEL * dt);
            m.vy += mCfg.DECEL_GRAVITY * dt;
        } else if (m.phase === 'APEX') {
            // Near-motionless
            m.vx *= 0.2;
            m.vy *= 0.2;
        } else if (m.phase === 'DIVE') {
            // Proportional Navigation toward target
            if (m.targetTank) {
                var losAngle = Math.atan2(m.targetTank.y - m.y, m.targetTank.x - m.x);
                var losDelta = losAngle - m.prevLosAngle;
                // Normalize angle delta to [-PI, PI]
                while (losDelta > Math.PI) losDelta -= 2 * Math.PI;
                while (losDelta < -Math.PI) losDelta += 2 * Math.PI;

                var turnRate = mCfg.PN_CONSTANT * losDelta / dt;
                // Clamp turn rate
                if (turnRate > mCfg.MAX_TURN_RATE) turnRate = mCfg.MAX_TURN_RATE;
                if (turnRate < -mCfg.MAX_TURN_RATE) turnRate = -mCfg.MAX_TURN_RATE;

                m.heading += turnRate * dt;
                m.prevLosAngle = losAngle;
            }

            // Thrust along heading
            m.vx += Math.cos(m.heading) * mCfg.DIVE_THRUST * dt;
            m.vy += Math.sin(m.heading) * mCfg.DIVE_THRUST * dt;
            // Drag
            m.vx *= (1 - mCfg.DRAG_DIVE * dt);
            m.vy *= (1 - mCfg.DRAG_DIVE * dt);
        }

        // Wobble: sinusoidal heading perturbation for curly trajectories
        if (m.wobbleAmp && (m.phase === 'LAUNCH' || m.phase === 'DIVE')) {
            var wobble = Math.sin(m.age * m.wobbleFreq * Math.PI * 2 + m.wobblePhase) * m.wobbleAmp;
            // Apply as lateral velocity perpendicular to heading
            var perpX = -Math.sin(m.heading);
            var perpY = Math.cos(m.heading);
            m.vx += perpX * wobble * 60 * dt;
            m.vy += perpY * wobble * 60 * dt;
        }

        // Cap speed
        m.speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        if (m.speed > mCfg.MAX_SPEED) {
            var scale = mCfg.MAX_SPEED / m.speed;
            m.vx *= scale;
            m.vy *= scale;
            m.speed = mCfg.MAX_SPEED;
        }

        // Update heading from velocity (for rendering) — except during DIVE
        // where PN guidance controls heading independently
        if (m.phase !== 'DIVE' && m.speed > 5) {
            m.heading = Math.atan2(m.vy, m.vx);
        }

        // Move
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // Trail
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 8) m.trail.shift();

        // Collision with target tank
        if (m.targetTank && m.targetTank.alive) {
            var tdx = m.targetTank.x - m.x;
            var tdy = m.targetTank.y - m.y;
            if (Math.sqrt(tdx * tdx + tdy * tdy) < 15) {
                _zoneWeaponDamageTank(zone, m.targetTank, m.damage);
                _zoneMissileExplode(zone, m);
                m.alive = false;
                continue;
            }
        }

        // Hit ground
        if (m.y >= groundY) {
            _zoneMissileExplode(zone, m);
            m.alive = false;
            continue;
        }

        // Out of bounds (sides/top)
        if (m.x < -20 || m.x > worldW + 20 || m.y < -50) {
            m.alive = false;
            continue;
        }

        // Lifetime
        if (m.age > mCfg.MAX_LIFETIME) {
            _zoneMissileExplode(zone, m);
            m.alive = false;
        }
    }
}

function _zoneMissileExplode(zone, missile) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const explCfg = cfg.EXPLOSION;

    _zoneCreateExplosion(zone, missile.x, missile.y, explCfg.MISSILE_RADIUS, '#f80');
    _spawnZoneParticles(zone, missile.x, missile.y, '#ff0', explCfg.PARTICLE_COUNT);
}

function _zoneFindNearestAliveTank(zone, x, y) {
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < zone.tanks.length; i++) {
        var t = zone.tanks[i];
        if (!t.alive) continue;
        var dx = t.x - x;
        var dy = t.y - y;
        var dist = dx * dx + dy * dy;
        if (dist < bestDist) {
            bestDist = dist;
            best = t;
        }
    }
    return best;
}

// ---- DRONE SYSTEM ----

function zoneSpawnDrone(zone, type) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const dCfg = cfg.DRONE;

    if (zone.drones.length >= dCfg.MAX_PER_ZONE) return;

    const ufo = zone.crewUfo;
    zone.drones.push({
        x: ufo.x,
        y: ufo.y + 10,
        vx: 0,
        vy: 0,
        type: type,
        state: 'FALLING',
        energy: dCfg.ENERGY_TIMER,
        maxEnergy: dCfg.ENERGY_TIMER,
        direction: Math.random() < 0.5 ? 1 : -1,
        legPhase: 0,
        unfoldProgress: 0,
        unfoldTimer: 0,
        landingTimer: 0,
        target: null,
        collectProgress: 0,
        alive: true,
        coordinatorId: null,
        powerOffTimer: 0
    });
}

function zoneUpdateDrones(zone, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const dCfg = cfg.DRONE;
    const zoneCfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const groundY = zoneCfg.GROUND_Y || 270;
    const worldW = zoneCfg.WORLD_W || 480;

    for (var i = zone.drones.length - 1; i >= 0; i--) {
        var d = zone.drones[i];
        if (!d.alive) {
            zone.drones.splice(i, 1);
            continue;
        }

        // Energy drain
        if (d.state !== 'FALLING' && d.state !== 'LANDING' && d.state !== 'POWER_OFF') {
            d.energy -= dt;
            if (d.energy <= 0) {
                d.energy = 0;
                d.state = 'POWER_OFF';
                d.powerOffTimer = 1.0;
            }
        }

        switch (d.state) {
            case 'FALLING':
                d.vy = dCfg.FALL_SPEED;
                d.y += d.vy * dt;
                if (d.y >= groundY - 3) {
                    d.y = groundY - 3;
                    d.vy = 0;
                    d.state = 'LANDING';
                    d.landingTimer = 0.3;
                    // Battle drone landing damage
                    if (d.type === 'battle') {
                        _zoneDroneLandingDamage(zone, d);
                    }
                }
                break;

            case 'LANDING':
                d.landingTimer -= dt;
                if (d.landingTimer <= 0) {
                    d.state = 'UNFOLDING';
                    d.unfoldTimer = 0;
                }
                break;

            case 'UNFOLDING':
                d.unfoldTimer += dt;
                d.unfoldProgress = Math.min(1, d.unfoldTimer / dCfg.UNFOLD_TIME);
                if (d.unfoldProgress >= 1) {
                    d.state = 'SEEKING';
                }
                break;

            case 'SEEKING':
                d.legPhase += dt * 8;
                if (d.type === 'harvester') {
                    _zoneDroneSeekTarget(zone, d, dt, worldW, dCfg);
                } else {
                    _zoneDroneSeekTank(zone, d, dt, worldW, dCfg);
                }
                break;

            case 'COLLECTING':
                // Harvester collecting a target
                if (!d.target || !d.target.alive) {
                    d.target = null;
                    d.collectProgress = 0;
                    d.state = 'SEEKING';
                    break;
                }
                d.collectProgress += dt / dCfg.COLLECT_TIME;
                if (d.collectProgress >= 1.0) {
                    d.target.alive = false;
                    zone.quota.current++;
                    _spawnZoneParticles(zone, d.target.x, d.target.y, '#0ff', 3);
                    d.target = null;
                    d.collectProgress = 0;
                    d.state = 'SEEKING';
                }
                break;

            case 'ATTACKING':
                // Battle drone attacking a tank
                if (!d.target || !d.target.alive) {
                    d.target = null;
                    d.state = 'SEEKING';
                    break;
                }
                var adx = d.target.x - d.x;
                if (Math.abs(adx) > dCfg.BATTLE_RANGE) {
                    // Target moved out of range
                    d.target = null;
                    d.state = 'SEEKING';
                    break;
                }
                // Deal damage
                _zoneWeaponDamageTank(zone, d.target, dCfg.BATTLE_DPS * dt);
                break;

            case 'POWER_OFF':
                d.powerOffTimer -= dt;
                if (d.powerOffTimer <= 0) {
                    d.alive = false;
                }
                break;
        }

        // Clamp to world bounds
        if (d.x < 5) { d.x = 5; d.direction = 1; }
        if (d.x > worldW - 5) { d.x = worldW - 5; d.direction = -1; }
    }
}

function _zoneDroneSeekTarget(zone, drone, dt, worldW, dCfg) {
    // Find best non-abducted target
    var best = null;
    var bestDist = Infinity;
    for (var j = 0; j < zone.targets.length; j++) {
        var t = zone.targets[j];
        if (!t.alive || t.beingAbducted) continue;
        var dx = Math.abs(t.x - drone.x);
        if (dx < bestDist) {
            bestDist = dx;
            best = t;
        }
    }

    if (best && bestDist < dCfg.COLLECT_RANGE) {
        drone.target = best;
        drone.state = 'COLLECTING';
        drone.collectProgress = 0;
    } else if (best) {
        // Walk toward target
        drone.direction = best.x > drone.x ? 1 : -1;
        drone.x += drone.direction * dCfg.WALK_SPEED * dt;
    } else {
        // Patrol
        drone.x += drone.direction * dCfg.WALK_SPEED * dt;
        if (drone.x < 20 || drone.x > worldW - 20) {
            drone.direction *= -1;
        }
    }
}

function _zoneDroneSeekTank(zone, drone, dt, worldW, dCfg) {
    // Find nearest alive tank
    var best = null;
    var bestDist = Infinity;
    for (var j = 0; j < zone.tanks.length; j++) {
        var t = zone.tanks[j];
        if (!t.alive) continue;
        var dx = Math.abs(t.x - drone.x);
        if (dx < bestDist) {
            bestDist = dx;
            best = t;
        }
    }

    if (best && bestDist < dCfg.BATTLE_RANGE) {
        drone.target = best;
        drone.state = 'ATTACKING';
    } else if (best) {
        // Walk toward tank
        drone.direction = best.x > drone.x ? 1 : -1;
        drone.x += drone.direction * dCfg.WALK_SPEED * dt;
    } else {
        // Patrol
        drone.x += drone.direction * dCfg.WALK_SPEED * dt;
        if (drone.x < 20 || drone.x > worldW - 20) {
            drone.direction *= -1;
        }
    }
}

function _zoneDroneLandingDamage(zone, drone) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    var dCfg = cfg.DRONE;

    for (var i = 0; i < zone.tanks.length; i++) {
        var tank = zone.tanks[i];
        if (!tank.alive) continue;
        var dx = tank.x - drone.x;
        var dy = tank.y - drone.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < dCfg.LANDING_RADIUS) {
            _zoneWeaponDamageTank(zone, tank, dCfg.LANDING_DAMAGE);
        }
    }
    _spawnZoneParticles(zone, drone.x, drone.y, '#f80', 4);
}

// ---- COORDINATOR SYSTEM ----

function zoneSpawnCoordinator(zone, type) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const cCfg = cfg.COORDINATOR;

    if (zone.coordinators.length >= cCfg.MAX_PER_ZONE) return;

    const ufo = zone.crewUfo;
    var id = zone.id + '-coord-' + Date.now();

    zone.coordinators.push({
        id: id,
        x: ufo.x,
        y: ufo.y,
        type: type,
        state: 'DEPLOYING',
        energy: cCfg.ENERGY_TIMER,
        maxEnergy: cCfg.ENERGY_TIMER,
        subDroneIds: [],
        spinAngle: 0,
        bobPhase: Math.random() * Math.PI * 2,
        bombTimer: cCfg.BOMB_INTERVAL,
        missileTimer: cCfg.MISSILE_INTERVAL,
        alive: true,
        _redeployTimers: []
    });
}

function zoneUpdateCoordinators(zone, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const cCfg = cfg.COORDINATOR;
    const zoneCfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.ZONE : {};
    const worldH = zoneCfg.WORLD_H || 300;
    const groundY = zoneCfg.GROUND_Y || 270;
    const hoverY = worldH * cCfg.HOVER_Y_PCT;
    const ufo = zone.crewUfo;

    for (var i = zone.coordinators.length - 1; i >= 0; i--) {
        var c = zone.coordinators[i];
        if (!c.alive) {
            zone.coordinators.splice(i, 1);
            continue;
        }

        c.spinAngle += cCfg.SPIN_SPEED * dt;
        c.bobPhase += cCfg.BOB_SPEED * dt;

        switch (c.state) {
            case 'DEPLOYING':
                // Descend to hover position
                c.y += cCfg.DEPLOY_SPEED * dt;
                if (c.y >= hoverY) {
                    c.y = hoverY;
                    c.state = 'ACTIVE';
                    // Spawn sub-drones
                    _zoneCoordinatorSpawnSubDrones(zone, c);
                }
                break;

            case 'ACTIVE':
            case 'LOW_ENERGY':
                // Energy drain
                c.energy -= dt;

                // Check for low energy
                if (c.energy < cCfg.ENERGY_TIMER * 0.25 && c.state === 'ACTIVE') {
                    c.state = 'LOW_ENERGY';
                }

                // Dying transition
                if (c.energy <= 0) {
                    c.energy = 0;
                    c.state = 'DYING';
                    // Power off all sub-drones
                    _zoneCoordinatorPowerOffDrones(zone, c);
                    break;
                }

                // Follow UFO x with lag
                c.x += (ufo.x - c.x) * cCfg.FOLLOW_LAG * dt;

                // Bob motion
                c.y = hoverY + Math.sin(c.bobPhase) * cCfg.BOB_AMP_Y;

                // Low energy: sink slowly
                if (c.state === 'LOW_ENERGY') {
                    c.y += 5 * dt;
                }

                // Manage sub-drones: redeploy destroyed ones
                _zoneCoordinatorManageSubDrones(zone, c, dt);

                // Attack coordinator auto-fire
                if (c.type === 'attack') {
                    c.bombTimer -= dt;
                    if (c.bombTimer <= 0 && zone.bombsAvailable > 0) {
                        zoneSpawnBomb(zone);
                        c.bombTimer = cCfg.BOMB_INTERVAL;
                    }

                    c.missileTimer -= dt;
                    if (c.missileTimer <= 0) {
                        var hasReady = zone.missileGroups.some(function(g) { return g.ready; });
                        if (hasReady) {
                            zoneFireMissileGroup(zone);
                            c.missileTimer = cCfg.MISSILE_INTERVAL;
                        }
                    }
                }
                break;

            case 'DYING':
                // Fall with gravity
                c.y += 100 * dt;
                if (c.y >= groundY) {
                    c.alive = false;
                    _spawnZoneParticles(zone, c.x, c.y, '#fa0', 6);
                    _zoneCreateExplosion(zone, c.x, c.y, 25, '#f80');
                }
                break;
        }
    }
}

function _zoneCoordinatorSpawnSubDrones(zone, coordinator) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const cCfg = cfg.COORDINATOR;
    const dCfg = cfg.DRONE;

    var tech = cfg.TECH_UNLOCK;
    var count = (zone.techLevel >= tech.FLEET_EXPANSION)
        ? cCfg.EXPANDED_SUB_DRONES
        : cCfg.SUB_DRONE_COUNT;

    // Cap total drones
    var available = dCfg.MAX_PER_ZONE - zone.drones.length;
    if (count > available) count = available;

    var droneType = coordinator.type === 'attack' ? 'battle' : 'harvester';
    var fanSpread = 60;
    var startX = coordinator.x - fanSpread / 2;
    var step = count > 1 ? fanSpread / (count - 1) : 0;

    for (var i = 0; i < count; i++) {
        var spawnX = count > 1 ? startX + step * i : coordinator.x;
        zone.drones.push({
            x: spawnX,
            y: coordinator.y,
            vx: 0,
            vy: 0,
            type: droneType,
            state: 'FALLING',
            energy: dCfg.ENERGY_TIMER,
            maxEnergy: dCfg.ENERGY_TIMER,
            direction: (i % 2 === 0) ? 1 : -1,
            legPhase: 0,
            unfoldProgress: 0,
            unfoldTimer: 0,
            landingTimer: 0,
            target: null,
            collectProgress: 0,
            alive: true,
            coordinatorId: coordinator.id,
            powerOffTimer: 0
        });
        coordinator.subDroneIds.push(zone.drones.length - 1);
    }
}

function _zoneCoordinatorManageSubDrones(zone, coordinator, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const cCfg = cfg.COORDINATOR;
    const dCfg = cfg.DRONE;

    // Count alive sub-drones
    var aliveCount = 0;
    for (var j = 0; j < zone.drones.length; j++) {
        if (zone.drones[j].coordinatorId === coordinator.id && zone.drones[j].alive) {
            aliveCount++;
        }
    }

    var tech = cfg.TECH_UNLOCK;
    var targetCount = (zone.techLevel >= tech.FLEET_EXPANSION)
        ? cCfg.EXPANDED_SUB_DRONES
        : cCfg.SUB_DRONE_COUNT;

    // Decrement redeploy timers and spawn replacement drones
    for (var k = coordinator._redeployTimers.length - 1; k >= 0; k--) {
        coordinator._redeployTimers[k] -= dt;
        if (coordinator._redeployTimers[k] <= 0) {
            coordinator._redeployTimers.splice(k, 1);
            // Spawn a replacement if under cap
            if (aliveCount < targetCount && zone.drones.length < dCfg.MAX_PER_ZONE) {
                var droneType = coordinator.type === 'attack' ? 'battle' : 'harvester';
                zone.drones.push({
                    x: coordinator.x,
                    y: coordinator.y,
                    vx: 0,
                    vy: 0,
                    type: droneType,
                    state: 'FALLING',
                    energy: dCfg.ENERGY_TIMER,
                    maxEnergy: dCfg.ENERGY_TIMER,
                    direction: Math.random() < 0.5 ? 1 : -1,
                    legPhase: 0,
                    unfoldProgress: 0,
                    unfoldTimer: 0,
                    landingTimer: 0,
                    target: null,
                    collectProgress: 0,
                    alive: true,
                    coordinatorId: coordinator.id,
                    powerOffTimer: 0
                });
                aliveCount++;
            }
        }
    }

    // Queue redeploy for missing drones
    var pendingRedeploys = coordinator._redeployTimers.length;
    var deficit = targetCount - aliveCount - pendingRedeploys;
    for (var d = 0; d < deficit; d++) {
        coordinator._redeployTimers.push(cCfg.REDEPLOY_DELAY);
    }
}

function _zoneCoordinatorPowerOffDrones(zone, coordinator) {
    for (var j = 0; j < zone.drones.length; j++) {
        if (zone.drones[j].coordinatorId === coordinator.id && zone.drones[j].alive) {
            zone.drones[j].state = 'POWER_OFF';
            zone.drones[j].powerOffTimer = 1.0;
        }
    }
}

// ---- EXPLOSION SYSTEM ----

function _zoneCreateExplosion(zone, x, y, maxRadius, color) {
    zone.explosions.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: maxRadius,
        age: 0,
        duration: 0.4,
        color: color || '#ff0',
        alive: true
    });
}

function zoneUpdateExplosions(zone, dt) {
    for (var i = zone.explosions.length - 1; i >= 0; i--) {
        var e = zone.explosions[i];
        e.age += dt;
        e.radius = e.maxRadius * (e.age / e.duration);
        if (e.age >= e.duration) {
            e.alive = false;
            zone.explosions.splice(i, 1);
        }
    }
}

// ---- WEAPON TIMER MANAGEMENT ----

function zoneUpdateWeaponTimers(zone, dt) {
    const cfg = typeof COMMAND_CONFIG !== 'undefined' ? COMMAND_CONFIG.WEAPONS : null;
    if (!cfg) return;
    const tech = cfg.TECH_UNLOCK;
    const bombCfg = cfg.BOMB;
    const mCfg = cfg.MISSILE;

    // Bomb recharge
    if (zone.techLevel >= tech.BOMB) {
        if (zone.bombsAvailable < bombCfg.MAX_PER_ZONE) {
            zone.bombRechargeTimer -= dt;
            if (zone.bombRechargeTimer <= 0) {
                zone.bombsAvailable++;
                zone.bombRechargeTimer = bombCfg.RECHARGE_TIME;
            }
        }
    }

    // Missile group initialization (lazy — only set up groups when tech allows)
    if (zone.techLevel >= tech.MISSILE && zone.missileGroups.length === 0) {
        for (var i = 0; i < mCfg.MAX_GROUPS; i++) {
            zone.missileGroups.push({ ready: true, rechargeTimer: 0 });
        }
    }

    // Missile group recharge
    for (var j = 0; j < zone.missileGroups.length; j++) {
        var g = zone.missileGroups[j];
        if (!g.ready) {
            g.rechargeTimer -= dt;
            if (g.rechargeTimer <= 0) {
                g.ready = true;
                g.rechargeTimer = 0;
            }
        }
    }
}

// ---- WEAPON COLLISION (projectile hits on drones/coordinators) ----

function zoneCheckWeaponCollisions(zone) {
    // Projectiles hitting drones
    for (var i = zone.projectiles.length - 1; i >= 0; i--) {
        var p = zone.projectiles[i];
        if (!p.alive) continue;

        // Check drones
        for (var j = 0; j < zone.drones.length; j++) {
            var d = zone.drones[j];
            if (!d.alive || d.state === 'POWER_OFF') continue;
            var dx = p.x - d.x;
            var dy = p.y - d.y;
            if (dx * dx + dy * dy < 100) { // 10px radius
                d.alive = false;
                p.alive = false;
                _spawnZoneParticles(zone, d.x, d.y, '#f80', 4);
                break;
            }
        }
        if (!p.alive) continue;

        // Check coordinators
        for (var k = 0; k < zone.coordinators.length; k++) {
            var c = zone.coordinators[k];
            if (!c.alive || c.state === 'DYING') continue;
            var cdx = p.x - c.x;
            var cdy = p.y - c.y;
            if (cdx * cdx + cdy * cdy < 100) { // 10px radius
                c.energy -= p.damage;
                p.alive = false;
                _spawnZoneParticles(zone, c.x, c.y, '#fa0', 3);
                if (c.energy <= 0) {
                    c.energy = 0;
                    c.state = 'DYING';
                    _zoneCoordinatorPowerOffDrones(zone, c);
                }
                break;
            }
        }
    }
}

// ---- SHARED WEAPON HELPERS ----

function _zoneWeaponDamageTank(zone, tank, damage) {
    if (!tank.alive) return;

    // Tanks don't have HP in current implementation — one hit kills under threshold
    // Use damage accumulator pattern
    if (typeof tank.weaponDamage === 'undefined') tank.weaponDamage = 0;
    tank.weaponDamage += damage;

    // Tank destruction threshold (approx 1 bomb or ~3s of battle drone)
    if (tank.weaponDamage >= 25) {
        tank.alive = false;
        tank.respawnTimer = 5 + Math.random() * 3;
        tank.weaponDamage = 0;
        _zoneCreateExplosion(zone, tank.x, tank.y, 20, '#f80');
        _spawnZoneParticles(zone, tank.x, tank.y, '#fa0', 6);
    }
}
