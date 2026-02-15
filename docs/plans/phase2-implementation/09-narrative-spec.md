# Phase 2 Narrative Specification
## All Dialogue, Director Lines, and Narrative Content

**Date**: 2026-02-13
**Status**: FINAL

---

## I. THEMATIC FRAMEWORK

### The Thesis

**"This game is about the distance between having power and using it with care."**

Phase 1 is being the hands. Phase 2 is becoming the eyes. The player trades the ability to DO for the obligation to DIRECT. Every piece of dialogue serves this transformation.

### Emotional Beats by Wave

```
Wave 1 (Command):  Disorientation. "What do I do with my hands?"
Wave 2-3:          Growing pains. "Why can't they dodge like I could?"
Wave 4-5:          Competence. "I'm starting to see the whole board."
Wave 6-8:          Rhythm. "Monitor, adjust, respond. I'm a commander."
Wave 9-10:         Mastery/Boredom. "Is this all there is?" -> 4-zone trigger
```

---

## II. THE DIRECTOR -- COMPLETE DIALOGUE BANK

### Director Identity

THE DIRECTOR is a higher-order alien. Cold. Analytical. Not cruel for cruelty's sake -- cruel because efficiency demands it. Speaks in clipped sentences. Never wastes words. Refers to the player as "Commander" with varying degrees of respect/contempt depending on approval.

The Director is what the player might become if they keep ascending. Once flew a ship. Once had two zones. Now reads reports and issues quotas. The abstraction consumed him.

### Promotion Cinematic Lines

```javascript
const PROMOTION_LINES = {
    // Phase A: The Call (director materializes)
    introduction: [
        "Impressive performance, Operator. Your sector results have been... adequate.",
        "You are hereby promoted to ZONE COMMANDER.",
        "You will oversee multiple sectors. Your crew will handle the operational work.",
        "Do not mistake oversight for inaction. Every outcome is YOUR responsibility."
    ],

    // Phase D: The Settling (final line before gameplay)
    dismissal: [
        "Do not disappoint me.",
        "The Board is watching. I am watching. Produce results.",
        "Your first wave begins now. There will be no handholding."
    ]
};
```

### Wave-Start Transmissions

One randomly selected per wave. Delivered via typewriter in Director channel.

```javascript
const WAVE_START_LINES = [
    // Neutral (approval 46-70)
    "Another wave, Commander. Don't waste my time.",
    "Your quota this wave: {quota} per zone. Meet it.",
    "The Board expects consistency. Deliver.",
    "Your sectors await your attention. Or lack thereof.",
    "Wave {wave}. Quotas are set. Get to work.",

    // Displeased (approval 26-45)
    "I'm watching Zone {weakestZone} very closely, Commander.",
    "Your recent performance has been... noted. By the Board.",
    "Improvement is not optional. It is required. Immediately.",
    "I've seen cadets produce better numbers.",
    "Do NOT force me to file another negative report.",

    // Furious (approval 0-25)
    "I am THIS close to recommending your demotion.",
    "The Board is asking questions I cannot answer. PRODUCE RESULTS.",
    "Every wave you underperform costs ME political capital. FIX. THIS.",
    "Your predecessor was removed for less. Remember that.",
    "I don't know how you got promoted. Prove you deserve it.",

    // Satisfied (approval 71-100) -- rare
    "Adequate work last wave. Maintain it.",
    "The Board has... noticed your results. Don't let it go to your head.",
    "...hm. Continue at this pace.",
    "Your numbers are acceptable. I'll mention them in my report. Perhaps."
];
```

### Report Card Dialogue

#### When Quota EXCEEDED (all zones averaged >= 120%)

```javascript
const REPORT_EXCEEDED = [
    "...hm. The Board has noticed. Don't let it go to your head.",
    "Impressive numbers. I'll mention it in my report. Perhaps.",
    "Strong performance. The Board expects this to be your new baseline.",
    "Your zones delivered above expectations. That is... uncommon.",
    "Well done. Now do it again. Consistency is what matters."
];
```

#### When Quota MET (all zones averaged 80-119%)

```javascript
const REPORT_MET = [
    "Adequate. The Board expects continued performance at this level.",
    "Your zones performed... within parameters. Barely.",
    "Acceptable. Not remarkable. Not concerning. Just... acceptable.",
    "Quotas met. Equipment intact. No incidents. That's the minimum, Commander.",
    "Your zones hit targets. Try exceeding them next wave."
];
```

#### When Quota MISSED (all zones averaged < 80%)

```javascript
const REPORT_MISSED = [
    "UNACCEPTABLE. Do you know what this costs the operation?",
    "I've seen INTERNS produce better numbers. What exactly are you DOING?",
    "The Board will want an explanation. I expect a better one than I'm about to hear.",
    "This is a CATASTROPHIC underperformance. My patience is not infinite.",
    "Your zones are hemorrhaging productivity. Fix this or I will find someone who can."
];
```

#### When Individual Zone Diverges Significantly

```javascript
const REPORT_ZONE_SPECIFIC = {
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
};
```

### Report Card Response Options

#### Response Templates Per Situation

**Situation: Quota MET**
```javascript
const RESPONSES_MET = [
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
];
```

**Situation: Quota MISSED**
```javascript
const RESPONSES_MISSED = [
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
        approvalDelta: 5  // Director respects owning failure
    },
    {
        label: "Zone {bad} had unprecedented tank activity.",
        type: 'deflect',
        directorReply: random() < 0.4
            ? "Fine. But 'unprecedented' better not become 'regular'."  // Believed
            : "I can READ the activity reports, Commander. Try again.",  // Not believed
        approvalDelta: random() < 0.4 ? 0 : -3
    }
];
```

**Situation: Quota EXCEEDED**
```javascript
const RESPONSES_EXCEEDED = [
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
];
```

### Emergency Override Disapproval

```javascript
const OVERRIDE_LINES = [
    "I didn't promote you to play pilot, Commander.",
    "Manual intervention. Noted. In my report.",
    "Your crew should handle this. That's why they exist.",
    "Every override tells me you don't trust your own team.",
    "Do you miss the cockpit that much? Focus on your JOB.",
    "Override logged. The Board tracks these, you know."
];
```

### Director Recovery Wave Lines

Every 5 waves, quota drops 20%. Director explains:

```javascript
const RECOVERY_LINES = [
    "Board meeting this cycle. Quotas are reduced temporarily. Don't get comfortable.",
    "Administrative pause. Use this wave to fix your messes.",
    "Reduced expectations this wave. Consider it a gift. One you won't get again.",
    "The Board's attention is elsewhere. Breathe while you can."
];
```

### Rare Director Vulnerability Moments

Every 8-10 waves, a 10% chance of a rare line that reveals the Director's own pressures:

```javascript
const DIRECTOR_VULNERABILITY = [
    "The Board is... never mind. Your quotas are set.",
    "Do you think I ENJOY these reviews? Just... produce results.",
    "I remember when I had two zones. It was... simpler. But that was a long time ago.",
    "...carry on, Commander. The hierarchy demands it."
];
```

These should be infrequent and understated. Players who notice them will understand the Director is also trapped.

---

## III. CREW DIALOGUE (Future Slice Preview)

The first slice has NO crew dialogue. Crew members are silent. But the following lines are designed for Slice 2 when crew members gain speech bubbles in their zone panels.

### Crew Zone Chatter (Displayed as Small Text Bubbles in Zone Panel)

```javascript
const CREW_CHATTER = {
    reckless: {
        success:   ["Got another one!", "Too easy!", "Watch THIS!"],
        danger:    ["Bring it!", "I can take it!", "Dodge? Where's the fun?"],
        failure:   ["Lucky shot...", "Whatever.", "Next time."],
        idle:      ["Come on, come on...", "Where are they?", "Boring."]
    },
    cautious: {
        success:   ["Target secured.", "One more for quota.", "Steady..."],
        danger:    ["Incoming! Repositioning.", "Too hot. Pulling back.", "Careful..."],
        failure:   ["I was right to be cautious.", "Need more cover.", "Noted."],
        idle:      ["Scanning...", "All clear. For now.", "Systems nominal."]
    },
    overrideReaction: [
        "Commander? Is that... you?",
        "Wait -- who's flying this?!",
        "Commander's got our zone!",
        "...are you okay, boss?"
    ],
    postOverride: [
        "Thanks, Commander. I felt... something.",
        "That was weird. Ship moved on its own.",
        "Did you just... take over? Are we allowed to do that?"
    ]
};
```

### Director's Kid Lines (Deferred to Slice 2)

```javascript
const DIRECTORS_KID = {
    // Introduction
    introduction: "I'm sending you someone. My kid. Treat them well.",

    // Kid interview (forced mandatory)
    interview: {
        greeting: "Ugh. Do I have to be here? My dad said I had to come.",
        skill_question: "Skills? I dunno. I'm good at... existing? My dad runs the whole sector.",
        attitude_reveal: "Look, I don't need to be GOOD at this. My last name carries weight.",
        hidden_trait_hint: "...sometimes I watch the operators from the observation deck. They're fast."
    },

    // Path A: Hire and Coach
    pathA: {
        early: [
            "My dad will hear about this.",
            "I don't need YOUR coaching. I know who I am.",
            "This zone is beneath me.",
            "You're not even a real commander. You were just an operator."
        ],
        middle: [
            "...okay, that technique actually worked.",
            "Maybe I could try... harder? Just this once.",
            "The other crew members don't talk to me. Is that normal?",
            "I watched Krix dodge that tank fire. How do they DO that?"
        ],
        late: [
            "I... I think I'm getting better at this.",
            "Commander? Thanks for not giving up on me.",
            "I want to show my dad what I can do. For real this time.",
            "I get it now. The beam, the timing, the focus. I GET it."
        ],
        breakthrough: "Commander... I did it. I actually did it. Tell my dad. No, wait. Let the numbers speak."
    },

    // Path A: Director reaction arc
    directorPathA: {
        early: "Why is my kid COMPLAINING about you?! I didn't send them to be LECTURED!",
        middle: "The kid's numbers are... interesting. What did you do?",
        late: "I don't understand what's happening with my kid. But... continue.",
        breakthrough: "...you did something I couldn't do."
    },

    // Path B: Don't Hire
    pathB: {
        rejection: "You're... not hiring my kid. I see. The Board will hear about this.",
        consequence: "I hope your numbers are EXCEPTIONAL, Commander. Because they'll need to be.",
        ongoing_resentment: "Every missed quota feels personal now, doesn't it?",
        grudging_respect: "You chose your team over my family. I... respect that. Barely."
    },

    // Path C: Hire Then Fire
    pathC: {
        firing_moment: "You're letting my kid go. After I trusted you with them.",
        aftermath: "I can't decide if you tried and failed or never tried at all.",
        mixed_state: "Your numbers are good. Your judgment... I'm not sure about."
    }
};
```

---

## IV. ZONE NAMING SYSTEM

### Sector Names

Zones are named with a letter-number pattern: SECTOR [A-P]-[1-9].

```javascript
const ZONE_NAMES = {
    2: ['SECTOR A-7', 'SECTOR B-3'],
    4: ['SECTOR A-7', 'SECTOR B-3', 'SECTOR C-1', 'SECTOR D-5'],
    16: [
        'SECTOR A-1', 'SECTOR A-2', 'SECTOR A-3', 'SECTOR A-4',
        'SECTOR B-1', 'SECTOR B-2', 'SECTOR B-3', 'SECTOR B-4',
        'SECTOR C-1', 'SECTOR C-2', 'SECTOR C-3', 'SECTOR C-4',
        'SECTOR D-1', 'SECTOR D-2', 'SECTOR D-3', 'SECTOR D-4'
    ]
};
```

---

## V. BOOT SEQUENCE TEXT

### Promotion Cinematic Boot (Command Mode Initialization)

```javascript
const COMMAND_BOOT_LINES = [
    'QUANTUM-OS v3.7.1 COMMAND MODULE... LOADING',
    'ZONE ARRAY [2]... INITIALIZING',
    'ZONE A-7... SCANNING... STABLE',
    'ZONE B-3... SCANNING... STABLE',
    'PERSONNEL DATABASE... LOADING',
    'CREW ROSTER [2/2]... VERIFIED',
    'RESOURCE PIPELINE... CONNECTING',
    'TRANSIT EFFICIENCY... 90%',
    'DIRECTOR UPLINK... ESTABLISHING',
    'SECURE CHANNEL... ENCRYPTED',
    'QUOTA SYSTEM... CALIBRATING',
    'TARGET BAND... SET',
    '',
    'COMMAND SYSTEMS... ONLINE',
    '',
    '> COMMAND MODE ACTIVATED'
];
```

### Between-Wave Boot (Shorter, Per Panel)

```javascript
const WAVE_BOOT_LINES = {
    cmdStatus: [
        'COMMAND SYSTEMS... INITIALIZING',
        `WAVE {wave}... STANDING BY`
    ],
    zoneA: [
        'ZONE ARRAY [A]... ONLINE',
        'CREW ASSIGNMENT... CONFIRMED'
    ],
    zoneB: [
        'ZONE ARRAY [B]... ONLINE',
        'CREW ASSIGNMENT... CONFIRMED'
    ],
    crewRoster: [
        'PERSONNEL DATABASE... LOADED',
        'ROSTER INTEGRITY... VERIFIED'
    ],
    resources: [
        'RESOURCE PIPELINE... CONNECTED',
        'TRANSIT EFFICIENCY... 90%'
    ],
    dirChannel: [
        'DIRECTOR UPLINK... ESTABLISHED',
        'SECURE CHANNEL... ACTIVE'
    ]
};
```

---

## VI. NARRATIVE TONE GUIDE

### Director Voice Rules

1. **Short sentences.** Never more than 15 words. Usually under 10.
2. **No warmth.** Even praise is backhanded. "Adequate" is the highest compliment.
3. **References hierarchy.** Mentions "the Board" regularly. Uses "report" as a threat.
4. **Clinical language.** Says "performance" not "work." Says "produce results" not "do well."
5. **Rare vulnerability.** Every 8-10 waves, ONE line that hints at his own pressures. Never explicit.
6. **Titles.** Always "Commander." Never uses the player's name. The title IS the identity.

### Crew Voice Rules (For Slice 2)

1. **Personality through speech.** Reckless crew speak in exclamations. Cautious crew speak in measured observations.
2. **Short bubbles.** Zone panel speech is max 5-6 words. It must be readable at glance speed.
3. **Reactive, not proactive.** Crew speak in response to events, not unprompted.
4. **No fourth wall.** Crew don't know they're in a game. They're aliens doing their jobs.

### The Commander Ghost (Deferred to Later Slice)

Behind the Director's transmission panel, at 8% opacity, the old Phase 1 commander occasionally appears. Green holographic static. 1-2 word fragments bleed through:

```javascript
const GHOST_FRAGMENTS = [
    "...careful...",
    "...trust...",
    "...remember...",
    "...still here...",
    "...watching...",
    "...don't forget..."
];
```

This is purely atmospheric. No gameplay effect. Sets up Phase 3 narrative.

---

## VII. REPORT CARD RESPONSE CONSEQUENCES TABLE

### Complete Mechanical Effects

| Situation | Response | Approval Delta | Secondary Effect |
|-----------|----------|---------------|-----------------|
| Exceeded + Spin | +1 | None |
| Exceeded + Accountability | +3 | Director notes ambition positively |
| Exceeded + Deflect | 0 | Director warns about complacency |
| Met + Spin | +1 | None |
| Met + Accountability | +3 | None |
| Met + Deflect | 0 | None |
| Missed + Spin | -2 | Director's next wave-start line is harsher |
| Missed + Accountability | +5 | Director respects honesty on bad results |
| Missed + Deflect (believed) | 0 | 40% chance |
| Missed + Deflect (not believed) | -3 | 60% chance, Director follow-up line is angry |

### Director Follow-Up Lines Per Response

```javascript
const FOLLOWUP_LINES = {
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
};
```

---

## VIII. AUDIO NARRATIVE

### Voice Synthesis Parameters

| Character | Waveform | Base Frequency | LFO Rate | LFO Depth | Speed |
|-----------|----------|---------------|---------|-----------|-------|
| Commander (Phase 1) | Sawtooth | 150 Hz | 8 Hz | 0.3 | 25 chars/sec |
| Director | Sawtooth | 90 Hz | 4 Hz | 0.4 | 15 chars/sec |
| Crew (Slice 2) | Triangle | 200-300 Hz | 6 Hz | 0.2 | 20 chars/sec |
| Board hint (subsonic) | Sine | 30 Hz | 1 Hz | 0.8 | N/A (felt, not heard) |

### Sound Effect Moments

| Moment | Sound Design |
|--------|-------------|
| Director appears | Deep bass drone, 200ms. Subsonic 15Hz pulse. |
| Director speaks | Sawtooth garble per character (reuse SFX.commanderSpeechGarble at 60% pitch) |
| Director leaves | Red overlay fade + soft release tone |
| Override activated | Impact: capacitor discharge + alarm klaxon, 300ms |
| Override timer warning (3s) | Rising tone, 150ms intervals |
| Override end | Whoosh + ascending tone (pulled back up) |
| Promotion flash | Thunderclap + capacitor discharge |
| Boot tone (gold) | Warmer frequency than Phase 1 boot (amber register) |
| Quota met | Satisfying double-tone (ascending major third) |
| Quota exceeded | Triple-tone (ascending major chord) |
| Quota missed | Descending minor tone, 500ms |
| Report card reveal | Per-bar: tick sound, pitch ascending |
| Wave start | Contemplative chime (singing bowl, single strike) |

---

## IX. FIRST SLICE NARRATIVE SCOPE

### Included

| Content | Description |
|---------|-------------|
| Promotion cinematic dialogue | Director introduction + dismissal lines |
| Wave-start transmissions | 15+ lines across 4 mood categories |
| Report card dialogue | 5+ lines per performance tier |
| Response options | 3 per tier (Spin/Accountability/Deflect) |
| Director follow-ups | Reaction to each response type |
| Override disapproval | 6 lines |
| Recovery wave lines | 4 lines |
| Director vulnerability | 4 rare lines |
| Boot sequence text | Promotion + between-wave diagnostic lines |
| Zone names | 2 sector names |
| Crew names | 28 name pool |

### Excluded (Deferred)

| Content | Reason |
|---------|--------|
| Crew dialogue | Crew are silent in first slice |
| Director's Kid arc | Full narrative deferred to Slice 2 |
| Commander ghost | Atmospheric feature, not first slice |
| Crisis-specific dialogue | No crisis system in first slice |
| Coaching dialogue | No coaching in first slice |
| Inter-commander dialogue | No NPC commanders in first slice |
| Board transmissions | Never direct, only referenced |

---

*This document contains every line of dialogue and narrative content needed for the first slice. An agent implementing the Director system, the report card, or the promotion cinematic should find all text content here. The tone guide ensures consistency across all implementations.*
