// ============================================
// THE DIRECTOR
// Mood tracking, approval rating, quota demands,
// report cards, dialogue trees, typewriter system
// Agent 2 owns this file
// ============================================

// ---- Dialogue Banks ----

var DIRECTOR_DIALOGUES = {
    promotion: {
        introduction: [
            "Impressive performance, Operator. Your sector results have been... adequate.",
            "You are hereby promoted to ZONE COMMANDER.",
            "You will oversee multiple sectors. Your crew will handle the operational work.",
            "Do not mistake oversight for inaction. Every outcome is YOUR responsibility."
        ],
        dismissal: [
            "Do not disappoint me.",
            "The Board is watching. I am watching. Produce results.",
            "Your first wave begins now. There will be no handholding."
        ]
    },

    waveStart: {
        neutral: [
            "Another wave, Commander. Don't waste my time.",
            "Your quota this wave: {quota} per zone. Meet it.",
            "The Board expects consistency. Deliver.",
            "Your sectors await your attention. Or lack thereof.",
            "Wave {wave}. Quotas are set. Get to work."
        ],
        displeased: [
            "I'm watching Zone {weakestZone} very closely, Commander.",
            "Your recent performance has been... noted. By the Board.",
            "Improvement is not optional. It is required. Immediately.",
            "I've seen cadets produce better numbers.",
            "Do NOT force me to file another negative report."
        ],
        furious: [
            "I am THIS close to recommending your demotion.",
            "The Board is asking questions I cannot answer. PRODUCE RESULTS.",
            "Every wave you underperform costs ME political capital. FIX. THIS.",
            "Your predecessor was removed for less. Remember that.",
            "I don't know how you got promoted. Prove you deserve it."
        ],
        satisfied: [
            "Adequate work last wave. Maintain it.",
            "The Board has... noticed your results. Don't let it go to your head.",
            "...hm. Continue at this pace.",
            "Your numbers are acceptable. I'll mention them in my report. Perhaps."
        ]
    },

    reportCard: {
        exceeded: [
            "...hm. The Board has noticed. Don't let it go to your head.",
            "Impressive numbers. I'll mention it in my report. Perhaps.",
            "Strong performance. The Board expects this to be your new baseline.",
            "Your zones delivered above expectations. That is... uncommon.",
            "Well done. Now do it again. Consistency is what matters."
        ],
        met: [
            "Adequate. The Board expects continued performance at this level.",
            "Your zones performed... within parameters. Barely.",
            "Acceptable. Not remarkable. Not concerning. Just... acceptable.",
            "Quotas met. Equipment intact. No incidents. That's the minimum, Commander.",
            "Your zones hit targets. Try exceeding them next wave."
        ],
        missed: [
            "UNACCEPTABLE. Do you know what this costs the operation?",
            "I've seen INTERNS produce better numbers. What exactly are you DOING?",
            "The Board will want an explanation. I expect a better one than I'm about to hear.",
            "This is a CATASTROPHIC underperformance. My patience is not infinite.",
            "Your zones are hemorrhaging productivity. Fix this or I will find someone who can."
        ]
    },

    zoneSpecific: {
        oneGoodOneBad: [
            "Zone {good} carried you this wave. Zone {bad} is a LIABILITY.",
            "{good} performed. {bad} did not. I don't care about averages, Commander.",
            "Your strong zone masks a serious problem in {bad}. Address it."
        ],
        bothBad: [
            "BOTH zones underperformed. Do I need to spell out what that means?",
            "Not a single zone met expectations. This is systemic failure.",
            "When both zones fail, the problem isn't the zones. It's the COMMANDER."
        ],
        bothExcellent: [
            "Both zones exceeded targets. That's... that's actually good. Don't get used to hearing that.",
            "Across-the-board performance. Exactly what I expect every wave."
        ]
    },

    responses: {
        met: [
            {
                label: "The team executed well. We'll push harder next wave.",
                type: 'spin',
                directorReply: "Words are cheap. Show me numbers.",
                approvalDelta: 1
            },
            {
                label: "We hit targets. I see room for improvement in efficiency.",
                type: 'accountability',
                directorReply: "At least you're honest. Improvement noted.",
                approvalDelta: 3
            },
            {
                label: "Favorable conditions this wave. We capitalized.",
                type: 'deflect',
                directorReply: "Don't credit conditions for your crew's work.",
                approvalDelta: 0
            }
        ],
        missed: [
            {
                label: "We had operational difficulties. We're trending upward.",
                type: 'spin',
                directorReply: "Trending upward from WHAT? The floor?",
                approvalDelta: -2
            },
            {
                label: "I take full responsibility. Adjusting assignments now.",
                type: 'accountability',
                directorReply: "...hmph. Accountability. That's something, at least.",
                approvalDelta: 5
            },
            {
                label: "Unprecedented tank activity in the weak zone.",
                type: 'deflect',
                directorReply: null, // Determined at runtime (40% believed, 60% not)
                approvalDelta: null  // Determined at runtime
            }
        ],
        exceeded: [
            {
                label: "This is what happens when you invest in your people.",
                type: 'spin',
                directorReply: "Save the philosophy. Just keep the numbers coming.",
                approvalDelta: 1
            },
            {
                label: "Strong performance. I'll push for more next wave.",
                type: 'accountability',
                directorReply: "Good. Ambition is acceptable.",
                approvalDelta: 3
            },
            {
                label: "Target density was high this wave. We made the most of it.",
                type: 'deflect',
                directorReply: "If it was easy, your quota will reflect that next time.",
                approvalDelta: 0
            }
        ]
    },

    followUp: {
        spin: {
            positive: "Words are cheap. Show me numbers.",
            negative: "Spinning failure into narrative. I see right through it."
        },
        accountability: {
            positive: "At least you're honest. That counts for something.",
            negative: "Accountability without improvement is just confession."
        },
        deflect: {
            believed: "Fine. But if conditions were truly the cause, they'd better change.",
            notBelieved: "I can READ the reports, Commander. Don't insult my intelligence."
        }
    },

    override: [
        "I didn't promote you to play pilot, Commander.",
        "Manual intervention. Noted. In my report.",
        "Your crew should handle this. That's why they exist.",
        "Every override tells me you don't trust your own team.",
        "Do you miss the cockpit that much? Focus on your JOB.",
        "Override logged. The Board tracks these, you know."
    ],

    recovery: [
        "Board meeting this cycle. Quotas are reduced temporarily. Don't get comfortable.",
        "Administrative pause. Use this wave to fix your messes.",
        "Reduced expectations this wave. Consider it a gift. One you won't get again.",
        "The Board's attention is elsewhere. Breathe while you can."
    ],

    vulnerability: [
        "The Board is... never mind. Your quotas are set.",
        "Do you think I ENJOY these reviews? Just... produce results.",
        "I remember when I had two zones. It was... simpler. But that was a long time ago.",
        "...carry on, Commander. The hierarchy demands it."
    ]
};


// ---- Director Class ----

class Director {
    constructor() {
        var cfg = COMMAND_CONFIG.DIRECTOR;
        this.approval = cfg.APPROVAL_START;
        this.mood = 'neutral';
        this.quotaHistory = [];
        this.consecutiveMisses = 0;
        this.surgeWavesRemaining = 0;
        this.surgeAmount = 0;
        this.lastReportCard = null;
        this.commandWave = 0;

        // Typewriter system
        this.isTransmitting = false;
        this.currentDialogue = '';
        this.dialogueProgress = 0;
        this.dialogueQueue = [];
        this._typewriterSpeed = cfg.TYPEWRITER_SPEED;

        // Vulnerability tracking
        this._wavesSinceVulnerability = 0;
    }

    // ---- Mood System ----

    getMood() {
        var cfg = COMMAND_CONFIG.DIRECTOR;
        if (this.approval <= cfg.MOOD_FURIOUS) return 'furious';
        if (this.approval <= cfg.MOOD_DISPLEASED) return 'displeased';
        if (this.approval <= cfg.MOOD_NEUTRAL) return 'neutral';
        return 'satisfied';
    }

    updateApproval(delta) {
        var cfg = COMMAND_CONFIG.DIRECTOR;
        this.approval = Math.max(cfg.APPROVAL_MIN,
            Math.min(cfg.APPROVAL_MAX, this.approval + delta));
        this.mood = this.getMood();
    }

    // ---- Quota Target Band System ----

    getQuotaTarget(commandWave) {
        var cfg = COMMAND_CONFIG.QUOTA;
        this.commandWave = commandWave;

        // 1. Base scales slightly with wave
        var waveScaling = 1 + commandWave * cfg.WAVE_SCALING;

        // 2. Rolling average from history
        var rollingAvg = cfg.BASE;
        if (this.quotaHistory.length >= cfg.ROLLING_WINDOW) {
            var last = this.quotaHistory.slice(-cfg.ROLLING_WINDOW);
            var sum = 0;
            for (var i = 0; i < last.length; i++) sum += last[i];
            rollingAvg = sum / last.length;
        }

        // 3. Target band: midpoint between base and rolling avg
        var target = (cfg.BASE * waveScaling + rollingAvg) / 2;

        // 4. Surge check: if last wave exceeded threshold
        if (this.quotaHistory.length > 0) {
            var lastResult = this.quotaHistory[this.quotaHistory.length - 1];
            if (lastResult > target * cfg.SURGE_THRESHOLD) {
                if (this.surgeWavesRemaining <= 0) {
                    this.surgeWavesRemaining = cfg.SURGE_DURATION;
                    this.surgeAmount = cfg.SURGE_AMOUNT;
                }
            }
        }

        if (this.surgeWavesRemaining > 0) {
            target *= (1 + this.surgeAmount);
            this.surgeWavesRemaining--;
        }

        // 5. Recovery wave: every N waves, quota drops
        if (commandWave > 0 && commandWave % cfg.RECOVERY_INTERVAL === 0) {
            target *= (1 - cfg.RECOVERY_DISCOUNT);
        }

        return Math.round(target);
    }

    // Record abductions from a completed wave (aggregate across all zones)
    recordQuotaHistory(totalAbductions) {
        this.quotaHistory.push(totalAbductions);
    }

    // ---- Report Card Generation ----

    generateReportCard(zoneResults) {
        var totalAbductions = 0;
        var totalTarget = 0;

        for (var i = 0; i < zoneResults.length; i++) {
            totalAbductions += zoneResults[i].abductions;
            totalTarget += zoneResults[i].quotaTarget;
        }

        var overallPercent = totalTarget > 0 ? (totalAbductions / totalTarget * 100) : 0;
        var overall = this._evaluatePerformance(overallPercent);

        // Determine zone-specific commentary
        var zoneCommentary = this._getZoneCommentary(zoneResults);

        // Select main dialogue
        var dialoguePool = DIRECTOR_DIALOGUES.reportCard[overall];
        var mainDialogue = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];

        // Combine with zone-specific commentary if applicable
        var fullDialogue = mainDialogue;
        if (zoneCommentary) {
            fullDialogue = zoneCommentary + ' ' + mainDialogue;
        }

        // Generate response options
        var options = this._generateResponseOptions(overall, zoneResults);

        // Apply base approval change from performance
        var perfApprovalDelta = 0;
        if (overall === 'exceeded') {
            perfApprovalDelta = 5;
        } else if (overall === 'met') {
            perfApprovalDelta = 2;
        } else {
            perfApprovalDelta = overallPercent < 50 ? -10 : -5;
        }
        this.updateApproval(perfApprovalDelta);

        // Track consecutive misses
        if (overall === 'missed') {
            this.consecutiveMisses++;
        } else {
            this.consecutiveMisses = 0;
        }

        var reportCard = {
            commandWave: this.commandWave,
            zoneResults: zoneResults,
            overallPerformance: overall,
            overallPercent: Math.round(overallPercent),
            dialogue: fullDialogue,
            options: options,
            mood: this.getMood()
        };

        this.lastReportCard = reportCard;
        return reportCard;
    }

    _evaluatePerformance(overallPercent) {
        var cfg = COMMAND_CONFIG.QUOTA;
        if (overallPercent >= cfg.EXCEEDED_THRESHOLD * 100) return 'exceeded';
        if (overallPercent >= cfg.MET_THRESHOLD * 100) return 'met';
        return 'missed';
    }

    _getZoneCommentary(zoneResults) {
        if (zoneResults.length < 2) return null;

        var metThreshold = COMMAND_CONFIG.QUOTA.MET_THRESHOLD * 100;
        var exceededThreshold = COMMAND_CONFIG.QUOTA.EXCEEDED_THRESHOLD * 100;

        var zone0Pct = zoneResults[0].quotaTarget > 0 ?
            (zoneResults[0].abductions / zoneResults[0].quotaTarget * 100) : 0;
        var zone1Pct = zoneResults[1].quotaTarget > 0 ?
            (zoneResults[1].abductions / zoneResults[1].quotaTarget * 100) : 0;

        var zone0Met = zone0Pct >= metThreshold;
        var zone1Met = zone1Pct >= metThreshold;
        var zone0Exc = zone0Pct >= exceededThreshold;
        var zone1Exc = zone1Pct >= exceededThreshold;

        // Both excellent
        if (zone0Exc && zone1Exc) {
            var pool = DIRECTOR_DIALOGUES.zoneSpecific.bothExcellent;
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Both bad
        if (!zone0Met && !zone1Met) {
            var pool = DIRECTOR_DIALOGUES.zoneSpecific.bothBad;
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // One good, one bad
        if ((zone0Met && !zone1Met) || (!zone0Met && zone1Met)) {
            var goodZone = zone0Met ? zoneResults[0] : zoneResults[1];
            var badZone = zone0Met ? zoneResults[1] : zoneResults[0];
            var pool = DIRECTOR_DIALOGUES.zoneSpecific.oneGoodOneBad;
            var line = pool[Math.floor(Math.random() * pool.length)];
            return line.replace(/\{good\}/g, goodZone.zoneId.toUpperCase().replace('-', ' '))
                       .replace(/\{bad\}/g, badZone.zoneId.toUpperCase().replace('-', ' '));
        }

        return null;
    }

    _generateResponseOptions(overall, zoneResults) {
        var templates = DIRECTOR_DIALOGUES.responses[overall];
        var options = [];

        for (var i = 0; i < templates.length; i++) {
            var tmpl = templates[i];
            var option = {
                label: tmpl.label,
                type: tmpl.type,
                approvalDelta: tmpl.approvalDelta,
                directorReply: tmpl.directorReply
            };

            // Handle deflect for missed: 40% believed, 60% not
            if (overall === 'missed' && tmpl.type === 'deflect') {
                var believed = Math.random() < 0.4;
                option.approvalDelta = believed ? 0 : -3;
                option.directorReply = believed ?
                    DIRECTOR_DIALOGUES.followUp.deflect.believed :
                    DIRECTOR_DIALOGUES.followUp.deflect.notBelieved;
            }

            // Substitute zone names into labels
            if (zoneResults.length >= 2) {
                var weakest = zoneResults[0];
                for (var j = 1; j < zoneResults.length; j++) {
                    if ((zoneResults[j].abductions / Math.max(1, zoneResults[j].quotaTarget)) <
                        (weakest.abductions / Math.max(1, weakest.quotaTarget))) {
                        weakest = zoneResults[j];
                    }
                }
                option.label = option.label.replace(/\{bad\}/g,
                    weakest.zoneId.toUpperCase().replace('-', ' '));
            }

            options.push(option);
        }

        return options;
    }

    // Apply the player's chosen response
    applyDialogueChoice(choiceIndex, reportCard) {
        if (!reportCard || !reportCard.options || choiceIndex < 0 || choiceIndex >= reportCard.options.length) {
            return;
        }

        var option = reportCard.options[choiceIndex];
        this.updateApproval(option.approvalDelta);

        // Queue Director's reply
        if (option.directorReply) {
            this.queueDialogue(option.directorReply);
        }
    }

    // ---- Wave Dialogue ----

    getWaveStartDialogue() {
        var mood = this.getMood();
        var pool;

        // Check for recovery wave
        if (this.commandWave > 0 && this.commandWave % COMMAND_CONFIG.QUOTA.RECOVERY_INTERVAL === 0) {
            pool = DIRECTOR_DIALOGUES.recovery;
            return this._pickAndFormat(pool);
        }

        // Check for rare vulnerability moment (every 8-10 waves, 10% chance)
        this._wavesSinceVulnerability++;
        if (this._wavesSinceVulnerability >= 8 && Math.random() < 0.1) {
            this._wavesSinceVulnerability = 0;
            pool = DIRECTOR_DIALOGUES.vulnerability;
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Normal mood-based selection
        pool = DIRECTOR_DIALOGUES.waveStart[mood] || DIRECTOR_DIALOGUES.waveStart.neutral;
        return this._pickAndFormat(pool);
    }

    getOverrideDialogue() {
        var pool = DIRECTOR_DIALOGUES.override;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    _pickAndFormat(pool) {
        var line = pool[Math.floor(Math.random() * pool.length)];
        var quota = this.getQuotaTarget(this.commandWave);
        line = line.replace(/\{quota\}/g, quota);
        line = line.replace(/\{wave\}/g, this.commandWave + 1);
        line = line.replace(/\{weakestZone\}/g, 'B'); // Default; updated by caller if needed
        return line;
    }

    // ---- Typewriter / Dialogue Queue System ----

    queueDialogue(text) {
        this.dialogueQueue.push(text);
        if (!this.isTransmitting) {
            this._advanceDialogueQueue();
        }
    }

    _advanceDialogueQueue() {
        if (this.dialogueQueue.length === 0) {
            this.isTransmitting = false;
            this.currentDialogue = '';
            this.dialogueProgress = 0;
            return;
        }

        this.currentDialogue = this.dialogueQueue.shift();
        this.dialogueProgress = 0;
        this.isTransmitting = true;
    }

    // Get the visible portion of the current dialogue (typewriter effect)
    getVisibleDialogue() {
        if (!this.currentDialogue) return '';
        var chars = Math.floor(this.dialogueProgress);
        return this.currentDialogue.substring(0, Math.min(chars, this.currentDialogue.length));
    }

    // Is the current dialogue fully revealed?
    isDialogueComplete() {
        if (!this.currentDialogue) return true;
        return this.dialogueProgress >= this.currentDialogue.length;
    }

    // ---- Update (called every frame) ----

    update(dt) {
        // Advance typewriter
        if (this.isTransmitting && this.currentDialogue) {
            this.dialogueProgress += this._typewriterSpeed * dt;

            // When current dialogue completes, wait a beat then advance queue
            if (this.dialogueProgress >= this.currentDialogue.length + this._typewriterSpeed * 1.5) {
                this._advanceDialogueQueue();
            }
        }

        // Keep mood in sync
        this.mood = this.getMood();
    }
}
