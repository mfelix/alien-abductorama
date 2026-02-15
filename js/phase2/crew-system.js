// ============================================
// CREW SYSTEM
// CrewMember data model, CrewRoster management, trait definitions
// Agent 2 owns this file
// ============================================

class CrewMember {
    constructor(config) {
        this.id = 'crew_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.name = config.name;
        this.traits = { reckless: config.traits.reckless };
        this.morale = COMMAND_CONFIG.CREW.MORALE_START;
        this.stamina = 1.0;
        this.skills = {
            piloting: 0.5,
            harvesting: 0.5
        };
        this.performance = new Float32Array(20);
        this.performanceIdx = 0;
        this.assignedZone = null;
        this.hireWave = config.hireWave || 0;
        this.consecutiveWavesAssigned = 0;

        // Appearance derived from traits for visual uniqueness
        this.appearance = config.appearance || this._generateAppearance();
    }

    _generateAppearance() {
        var r = this.traits.reckless;
        // Reckless crew: warmer greens, slightly smaller eyes, narrower cranium (angular)
        // Cautious crew: cooler teals, larger eyes, wider cranium (rounded)
        var hue = Math.floor(120 + (1 - r) * 40); // 120 (green) to 160 (teal)
        var sat = 60 + Math.floor(r * 20);
        var light = 25 + Math.floor(Math.random() * 10);
        return {
            skinColor: 'hsl(' + hue + ',' + sat + '%,' + light + '%)',
            eyeSize: 0.85 + (1 - r) * 0.3,       // Cautious: bigger eyes (1.15), Reckless: smaller (0.85)
            craniumWidth: 0.85 + r * 0.3           // Reckless: wider cranium (1.15), Cautious: narrower (0.85)
        };
    }

    // Composite performance multiplier from morale and stamina
    getPerformanceModifier() {
        var moraleFactor = 0.5 + this.morale * 0.5;    // 0.5 - 1.0
        var staminaFactor = 0.6 + this.stamina * 0.4;  // 0.6 - 1.0
        return moraleFactor * staminaFactor;
    }

    // Push a wave performance score (0-1) into the ring buffer
    recordPerformance(score) {
        this.performance[this.performanceIdx] = score;
        this.performanceIdx = (this.performanceIdx + 1) % 20;
    }

    // Analyze the ring buffer to determine trend
    getPerformanceTrend() {
        var recent = this._getLastN(5);
        var previous = this._getLastN(10, 5);

        if (recent.length < 2 || previous.length < 2) return 'stable';

        var recentAvg = this._avg(recent);
        var previousAvg = this._avg(previous);

        if (recentAvg > previousAvg + 0.1) return 'improving';
        if (recentAvg < previousAvg - 0.1) return 'declining';
        return 'stable';
    }

    // Get the last N non-zero entries from ring buffer, optionally skipping some
    _getLastN(count, skip) {
        skip = skip || 0;
        var results = [];
        var idx = (this.performanceIdx - 1 + 20) % 20;
        var skipped = 0;
        var scanned = 0;
        while (results.length < count && scanned < 20) {
            var val = this.performance[idx];
            if (val > 0) {
                if (skipped >= skip) {
                    results.push(val);
                } else {
                    skipped++;
                }
            }
            idx = (idx - 1 + 20) % 20;
            scanned++;
        }
        return results;
    }

    _avg(arr) {
        if (arr.length === 0) return 0;
        var sum = 0;
        for (var i = 0; i < arr.length; i++) sum += arr[i];
        return sum / arr.length;
    }

    // Returns a human-readable trait label
    getTraitLabel() {
        if (this.traits.reckless > 0.6) return 'RECKLESS';
        if (this.traits.reckless < 0.4) return 'CAUTIOUS';
        return 'BALANCED';
    }

    // Returns the morale tier label for HUD display
    getMoraleLabel() {
        if (this.morale >= 0.85) return 'THRIVING';
        if (this.morale >= 0.7) return 'CONTENT';
        if (this.morale >= 0.5) return 'NEUTRAL';
        if (this.morale >= 0.35) return 'STRESSED';
        if (this.morale >= 0.2) return 'STRAINED';
        if (this.morale > 0.05) return 'BREAKING';
        return 'BURNOUT';
    }

    // Returns morale color from COMMAND_CONFIG
    getMoraleColor() {
        var c = COMMAND_CONFIG.COLORS;
        if (this.morale >= 0.85) return c.MORALE_THRIVING;
        if (this.morale >= 0.7) return c.MORALE_CONTENT;
        if (this.morale >= 0.5) return c.MORALE_NEUTRAL;
        if (this.morale >= 0.35) return c.MORALE_STRESSED;
        if (this.morale >= 0.2) return c.MORALE_STRAINED;
        if (this.morale > 0.05) return c.MORALE_BREAKING;
        return c.MORALE_BURNOUT;
    }

    // Returns trait badge color
    getTraitColor() {
        if (this.traits.reckless > 0.6) return COMMAND_CONFIG.COLORS.TRAIT_RECKLESS;
        if (this.traits.reckless < 0.4) return COMMAND_CONFIG.COLORS.TRAIT_CAUTIOUS;
        return '#aaa';
    }
}


class CrewRoster {
    constructor() {
        this.members = [];
        this._usedNames = {};
    }

    // Generate the starting crew for command phase init
    // One reckless-leaning (0.65-0.80), one cautious-leaning (0.20-0.35)
    generateStartingCrew() {
        var recklessName = this._pickUniqueName();
        var cautiousName = this._pickUniqueName();

        var recklessCrew = new CrewMember({
            name: recklessName,
            traits: { reckless: 0.65 + Math.random() * 0.15 }
        });

        var cautiousCrew = new CrewMember({
            name: cautiousName,
            traits: { reckless: 0.20 + Math.random() * 0.15 }
        });

        this.members.push(recklessCrew);
        this.members.push(cautiousCrew);

        return this.members;
    }

    addMember(crewMember) {
        this.members.push(crewMember);
        this._usedNames[crewMember.name] = true;
    }

    removeMember(id) {
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].id === id) {
                delete this._usedNames[this.members[i].name];
                this.members.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    // Get crew member assigned to a specific zone
    getAssigned(zoneId) {
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].assignedZone === zoneId) return this.members[i];
        }
        return null;
    }

    // Assign a crew member to a zone
    assignToZone(crewId, zoneId) {
        // Unassign anyone currently in this zone
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].assignedZone === zoneId) {
                this.members[i].assignedZone = null;
            }
        }
        // Assign the target crew member
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].id === crewId) {
                this.members[i].assignedZone = zoneId;
                return true;
            }
        }
        return false;
    }

    // Unassign a crew member from their zone
    unassignFromZone(crewId) {
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].id === crewId) {
                this.members[i].assignedZone = null;
                return true;
            }
        }
        return false;
    }

    // Get all crew not assigned to any zone (bench crew)
    getUnassigned() {
        var result = [];
        for (var i = 0; i < this.members.length; i++) {
            if (!this.members[i].assignedZone) result.push(this.members[i]);
        }
        return result;
    }

    // Swap zone assignments between two crew members
    swapAssignments(crewId1, crewId2) {
        var crew1 = null, crew2 = null;
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i].id === crewId1) crew1 = this.members[i];
            if (this.members[i].id === crewId2) crew2 = this.members[i];
        }
        if (!crew1 || !crew2) return false;

        var tempZone = crew1.assignedZone;
        crew1.assignedZone = crew2.assignedZone;
        crew2.assignedZone = tempZone;
        return true;
    }

    getAll() {
        return this.members;
    }

    // Create a random recruit candidate (for future use / roster expansion)
    generateCandidate() {
        return new CrewMember({
            name: this._pickUniqueName(),
            traits: { reckless: 0.2 + Math.random() * 0.6 } // 0.2-0.8 range
        });
    }

    // Pick a name not already in use
    _pickUniqueName() {
        var names = COMMAND_CONFIG.NAMES;
        var available = [];
        for (var i = 0; i < names.length; i++) {
            if (!this._usedNames[names[i]]) available.push(names[i]);
        }
        if (available.length === 0) {
            // Fallback: all names used, generate a suffixed name
            var base = names[Math.floor(Math.random() * names.length)];
            var suffix = Math.floor(Math.random() * 99) + 1;
            return base + '-' + suffix;
        }
        var name = available[Math.floor(Math.random() * available.length)];
        this._usedNames[name] = true;
        return name;
    }

    // Update morale and stamina for all crew between waves
    // Called during startNextWave
    updateBetweenWaves(zoneResults) {
        var cfg = COMMAND_CONFIG.CREW;

        for (var i = 0; i < this.members.length; i++) {
            var crew = this.members[i];
            var moraleChange = 0;

            if (crew.assignedZone) {
                // Find the zone result for this crew member
                var zoneResult = null;
                if (zoneResults) {
                    for (var j = 0; j < zoneResults.length; j++) {
                        if (zoneResults[j].crewMember === crew.name ||
                            zoneResults[j].zoneId === crew.assignedZone) {
                            zoneResult = zoneResults[j];
                            break;
                        }
                    }
                }

                // Stamina drain for active duty
                crew.stamina = Math.max(0, crew.stamina - cfg.STAMINA_DRAIN);
                crew.consecutiveWavesAssigned++;

                if (zoneResult) {
                    // Record performance score
                    var perfScore = zoneResult.quotaMet ?
                        Math.min(1.0, zoneResult.quotaPercent / 100) :
                        zoneResult.quotaPercent / 100 * 0.5;
                    crew.recordPerformance(perfScore);

                    // Morale from quota result
                    if (zoneResult.quotaPercent >= 120) {
                        moraleChange += 0.1;  // Exceeded quota
                    } else if (zoneResult.quotaMet) {
                        moraleChange += 0.05; // Met quota
                    } else {
                        moraleChange -= 0.08; // Missed quota
                    }
                }

                // Overworked penalty
                if (crew.consecutiveWavesAssigned > 3) {
                    moraleChange -= 0.05;
                }

                // Zone stress penalty (if zone result is available)
                if (zoneResult && zoneResult.driftMaxLevel >= 3) {
                    moraleChange -= 0.05;
                }
            } else {
                // On bench: rest and recovery
                crew.stamina = Math.min(1.0, crew.stamina + cfg.STAMINA_BENCH_RECOVERY);
                crew.consecutiveWavesAssigned = 0;
                moraleChange += 0.08; // Rest boost
            }

            // Apply morale change, clamped
            crew.morale = Math.max(cfg.MORALE_MIN,
                Math.min(cfg.MORALE_MAX, crew.morale + moraleChange));

            // Burnout: stamina at 0 forces morale to 0
            if (crew.stamina <= 0) {
                crew.morale = 0;
            }
        }
    }
}
