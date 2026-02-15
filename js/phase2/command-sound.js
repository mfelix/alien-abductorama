// ============================================
// COMMAND PHASE — SOUND ENGINE
// Independent sound system for Phase 2.
// Shares audioCtx with Phase 1 but owns its
// gain structure, bus routing, and polyphony.
// ============================================

var CommandSFX = (function () {

    // -----------------------------------------
    // CONSTANTS
    // -----------------------------------------

    var MAX_SFX_POOL = 8;
    var MAX_UI_POOL = 4;

    var PRIORITY = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    // -----------------------------------------
    // INTERNAL STATE
    // -----------------------------------------

    var _initialized = false;
    var _masterGain = null;
    var _ambientBus = null;
    var _sfxBus = null;
    var _uiBus = null;

    var _masterVolume = 0.8;
    var _preDuckVolume = 0.8;
    var _isDucked = false;

    // Active one-shot pools: arrays of { osc, gain, priority, startTime, name }
    var _sfxPool = [];
    var _uiPool = [];

    // Active loops: { name: { osc, gain, lfo?, lfoGain? } }
    var _activeLoops = {};
    var _loopsSilenced = false;  // When true, startLoop() is blocked

    // Sound registry: name -> { fn, priority, bus }
    var _sounds = {};

    // -----------------------------------------
    // INITIALIZATION
    // -----------------------------------------

    function init() {
        if (_initialized) return;
        if (typeof audioCtx === 'undefined' || !audioCtx) return;

        _masterGain = audioCtx.createGain();
        _masterGain.gain.setValueAtTime(_masterVolume, audioCtx.currentTime);
        _masterGain.connect(audioCtx.destination);

        _ambientBus = audioCtx.createGain();
        _ambientBus.gain.setValueAtTime(1.0, audioCtx.currentTime);
        _ambientBus.connect(_masterGain);

        _sfxBus = audioCtx.createGain();
        _sfxBus.gain.setValueAtTime(1.0, audioCtx.currentTime);
        _sfxBus.connect(_masterGain);

        _uiBus = audioCtx.createGain();
        _uiBus.gain.setValueAtTime(1.0, audioCtx.currentTime);
        _uiBus.connect(_masterGain);

        _registerAllSounds();

        _initialized = true;
    }

    // -----------------------------------------
    // NOISE BUFFER UTILITY
    // -----------------------------------------

    function _getNoiseBuffer(duration) {
        var sampleRate = audioCtx.sampleRate;
        var length = Math.ceil(sampleRate * duration);
        var buffer = audioCtx.createBuffer(1, length, sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    }

    // -----------------------------------------
    // SOUND REGISTRY
    // -----------------------------------------

    function _registerAllSounds() {
        // -- PROMOTION CINEMATIC (16 sounds, sfxBus) --
        _register('promoIncoming',           PRIORITY.HIGH,   'sfx', _promoIncoming);
        _register('promoCommanderGlitch',    PRIORITY.HIGH,   'sfx', _promoCommanderGlitch);
        _register('promoCommanderDissolve',  PRIORITY.HIGH,   'sfx', _promoCommanderDissolve);
        _register('promoDirectorMaterialize',PRIORITY.HIGH,   'sfx', _promoDirectorMaterialize);
        _register('promoTitleReveal',        PRIORITY.HIGH,   'sfx', _promoTitleReveal);
        _register('promoCameraZoom',         PRIORITY.MEDIUM, 'sfx', _promoCameraZoom);
        _register('promoHudDeath',           PRIORITY.MEDIUM, 'sfx', _promoHudDeath);
        _register('promoZone2Materialize',   PRIORITY.MEDIUM, 'sfx', _promoZone2Materialize);
        _register('promoWhiteFlash',         PRIORITY.HIGH,   'sfx', _promoWhiteFlash);
        _register('promoWireframe',          PRIORITY.MEDIUM, 'sfx', _promoWireframe);
        _register('promoCommandActivated',   PRIORITY.HIGH,   'sfx', _promoCommandActivated);
        _register('promoDirectorTypewriter', PRIORITY.LOW,    'sfx', _promoDirectorTypewriter);
        _register('promoDirectorFinalLine',  PRIORITY.HIGH,   'sfx', _promoDirectorFinalLine);
        _register('promoDirectorPanelSlide', PRIORITY.MEDIUM, 'sfx', _promoDirectorPanelSlide);
        _register('promoBootPanelStart',     PRIORITY.LOW,    'sfx', _bootPanelStart);
        _register('promoBootPanelOnline',    PRIORITY.LOW,    'sfx', _bootPanelOnline);

        // -- BOOT SEQUENCE (3 sounds, sfxBus) --
        _register('bootPanelStart',          PRIORITY.LOW,    'sfx', _bootPanelStart);
        _register('bootPanelOnline',         PRIORITY.LOW,    'sfx', _bootPanelOnline);
        _register('bootAllSystems',          PRIORITY.HIGH,   'sfx', _bootAllSystems);

        // -- COMMAND STATE (7 sounds, sfxBus + uiBus) --
        _register('waveStart',               PRIORITY.HIGH,   'sfx', _waveStart);
        _register('waveEnd',                 PRIORITY.HIGH,   'sfx', _waveEnd);
        _register('directorTransmit',        PRIORITY.HIGH,   'sfx', _directorTransmit);
        _register('waveTimerWarning',        PRIORITY.MEDIUM, 'sfx', _waveTimerWarning);
        _register('countdownBeep',           PRIORITY.HIGH,   'ui',  _countdownBeep);
        _register('quotaMet',                PRIORITY.MEDIUM, 'sfx', _quotaMet);
        _register('quotaExceeded',           PRIORITY.MEDIUM, 'sfx', _quotaExceeded);

        // -- ZONE SIMULATION (15 sounds, sfxBus) --
        _register('zoneStateStable',         PRIORITY.MEDIUM, 'sfx', _zoneStateStable);
        _register('zoneStateStressed',       PRIORITY.MEDIUM, 'sfx', _zoneStateStressed);
        _register('zoneStateCrisis',         PRIORITY.HIGH,   'sfx', _zoneStateCrisis);
        _register('zoneTargetSpawn',         PRIORITY.LOW,    'sfx', _zoneTargetSpawn);
        _register('zoneBeamActive',          PRIORITY.LOW,    'sfx', _zoneBeamActive);
        _register('zoneAbductionComplete',   PRIORITY.LOW,    'sfx', _zoneAbductionComplete);
        _register('zoneTankFire',            PRIORITY.LOW,    'sfx', _zoneTankFire);
        _register('zoneUfoHit',              PRIORITY.MEDIUM, 'sfx', _zoneUfoHit);
        _register('zoneUfoDestroyed',        PRIORITY.MEDIUM, 'sfx', _zoneUfoDestroyed);
        _register('zoneUfoRespawn',          PRIORITY.LOW,    'sfx', _zoneUfoRespawn);
        _register('zoneTargetDropped',       PRIORITY.LOW,    'sfx', _zoneTargetDropped);
        _register('zoneQuotaMilestone',      PRIORITY.MEDIUM, 'sfx', _zoneQuotaMilestone);

        // -- OVERRIDE (4 one-shots, sfxBus) --
        _register('overrideZoomIn',          PRIORITY.HIGH,   'sfx', _overrideZoomIn);
        _register('overrideZoomOut',         PRIORITY.HIGH,   'sfx', _overrideZoomOut);
        _register('overrideTimerWarning',    PRIORITY.HIGH,   'sfx', _overrideTimerWarning);
        _register('overrideForceEnd',        PRIORITY.HIGH,   'sfx', _overrideForceEnd);

        // -- DIRECTOR (6 sounds, sfxBus) --
        _register('dirMoodChange',           PRIORITY.MEDIUM, 'sfx', _dirMoodChange);
        _register('dirApprovalUp',           PRIORITY.MEDIUM, 'sfx', _dirApprovalUp);
        _register('dirApprovalDown',         PRIORITY.MEDIUM, 'sfx', _dirApprovalDown);
        _register('dirDisapproval',          PRIORITY.HIGH,   'sfx', _dirDisapproval);
        _register('dirVulnerability',        PRIORITY.HIGH,   'sfx', _dirVulnerability);
        _register('dirRecovery',             PRIORITY.HIGH,   'sfx', _dirRecovery);

        // -- RESOURCES (2 one-shots, sfxBus) --
        _register('resTransferStart',        PRIORITY.MEDIUM, 'sfx', _resTransferStart);
        _register('resDelivered',            PRIORITY.MEDIUM, 'sfx', _resDelivered);

        // -- WAVE SUMMARY (10 sounds, sfxBus) --
        _register('summaryScreenOpen',       PRIORITY.HIGH,   'sfx', _summaryScreenOpen);
        _register('summaryReportCard',       PRIORITY.HIGH,   'sfx', _summaryReportCard);
        _register('summaryBarReveal',        PRIORITY.LOW,    'sfx', _summaryBarReveal);
        _register('summaryZoneResult',       PRIORITY.LOW,    'sfx', _summaryZoneResult);
        _register('summaryBonusReveal',      PRIORITY.MEDIUM, 'sfx', _summaryBonusReveal);
        _register('summaryPenaltyReveal',    PRIORITY.MEDIUM, 'sfx', _summaryPenaltyReveal);
        _register('summaryDirectorComment',  PRIORITY.HIGH,   'sfx', _summaryDirectorComment);
        _register('summaryOptionSelect',     PRIORITY.MEDIUM, 'sfx', _summaryOptionSelect);
        _register('summaryGradeS',           PRIORITY.HIGH,   'sfx', _summaryGradeS);
        _register('summaryComplete',         PRIORITY.MEDIUM, 'sfx', _summaryComplete);

        // -- CREW (2 sounds, sfxBus) --
        _register('crewMoraleTierChange',    PRIORITY.MEDIUM, 'sfx', _crewMoraleTierChange);
        _register('crewBurnout',             PRIORITY.HIGH,   'sfx', _crewBurnout);

        // -- UI SOUNDS (7 sounds, uiBus) --
        _register('zoneSelect',              PRIORITY.MEDIUM, 'ui',  _uiZoneSelect);
        _register('fleetOrder',              PRIORITY.MEDIUM, 'ui',  _uiFleetOrder);
        _register('overrideActivate',        PRIORITY.HIGH,   'ui',  _uiOverrideActivate);
        _register('overrideEnd',             PRIORITY.HIGH,   'ui',  _uiOverrideEnd);
        _register('resourceRoute',           PRIORITY.MEDIUM, 'ui',  _uiResourceRoute);
        _register('menuNav',                 PRIORITY.LOW,    'ui',  _uiMenuNav);
        _register('errorReject',             PRIORITY.MEDIUM, 'ui',  _uiErrorReject);
    }

    function _register(name, priority, bus, fn) {
        _sounds[name] = { fn: fn, priority: priority, bus: bus };
    }

    // -----------------------------------------
    // INTERNAL TONE HELPER
    // Routes through the specified bus gain node.
    // -----------------------------------------

    function _playTone(busGain, frequency, duration, type, volume, fadeOut) {
        if (!audioCtx) return null;

        var t = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();

        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(frequency, t);
        gain.gain.setValueAtTime(volume || 0.1, t);

        if (fadeOut !== false) {
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        }

        osc.connect(gain);
        gain.connect(busGain);

        osc.start(t);
        osc.stop(t + duration);

        return { osc: osc, gain: gain, duration: duration };
    }

    // =========================================
    // CATEGORY 1: PROMOTION CINEMATIC (16)
    // =========================================

    // promo-incomingTransmission
    // Square through bandpass, 800->600Hz drop then 600-800 alternating at 4Hz, 1.2s
    function _promoIncoming(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.2;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        var gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.2);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(2, t);

        // LFO for gain pulsing at 4Hz during sustain
        var lfo = audioCtx.createOscillator();
        var lfoGain = audioCtx.createGain();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(4, t);
        lfoGain.gain.setValueAtTime(0.015, t);
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        // Freq alternation via LFO on frequency
        var freqLfo = audioCtx.createOscillator();
        var freqLfoGain = audioCtx.createGain();
        freqLfo.type = 'square';
        freqLfo.frequency.setValueAtTime(4, t + 0.2);
        freqLfoGain.gain.setValueAtTime(0, t);
        freqLfoGain.gain.setValueAtTime(100, t + 0.2);
        freqLfo.connect(freqLfoGain);
        freqLfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.005);
        gain.gain.setValueAtTime(0.06, t + 0.2);
        gain.gain.setValueAtTime(0.06, t + dur - 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(busGain);

        osc.start(t);
        osc.stop(t + dur);
        lfo.start(t);
        lfo.stop(t + dur);
        freqLfo.start(t);
        freqLfo.stop(t + dur);

        return { osc: osc, gain: gain, duration: dur };
    }

    // promo-commanderGlitch
    // Noise + square with random frequency jumps, 0.5s
    function _promoCommanderGlitch(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.5;

        // Noise layer
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2000, t);
        noiseFilter.Q.setValueAtTime(1, t);
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.0, t);
        noiseGain.gain.linearRampToValueAtTime(0.04, t + dur);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(busGain);

        // Square layer with random-ish frequency jumps (scheduled)
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, t);
        // Schedule random frequency jumps every 50ms
        var jumpCount = Math.floor(dur / 0.05);
        for (var i = 0; i < jumpCount; i++) {
            var freq = 100 + Math.random() * 300;
            osc.frequency.setValueAtTime(freq, t + i * 0.05);
        }
        oscGain.gain.setValueAtTime(0.0, t);
        oscGain.gain.linearRampToValueAtTime(0.06, t + dur);

        osc.connect(oscGain);
        oscGain.connect(busGain);

        noiseSrc.start(t);
        noiseSrc.stop(t + dur);
        osc.start(t);
        osc.stop(t + dur);

        return { osc: osc, gain: oscGain, duration: dur };
    }

    // promo-commanderDissolve
    // Filtered noise burst + descending sine, 0.8s
    function _promoCommanderDissolve(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.8;

        // Noise with highpass sweep 4000->200Hz
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var hpFilter = audioCtx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(4000, t);
        hpFilter.frequency.exponentialRampToValueAtTime(200, t + dur);
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.001, t);
        noiseGain.gain.linearRampToValueAtTime(0.15, t + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        noiseSrc.connect(hpFilter);
        hpFilter.connect(noiseGain);
        noiseGain.connect(busGain);

        // Descending sine 300->40Hz
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + dur);
        oscGain.gain.setValueAtTime(0.001, t);
        oscGain.gain.linearRampToValueAtTime(0.08, t + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(oscGain);
        oscGain.connect(busGain);

        noiseSrc.start(t);
        noiseSrc.stop(t + dur);
        osc.start(t);
        osc.stop(t + dur);

        return { osc: osc, gain: oscGain, duration: dur };
    }

    // promo-directorMaterialize
    // Sub-bass + detuned saw pair + high harmonics, 1.5s
    function _promoDirectorMaterialize(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.5;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(1.0, t);
        master.connect(busGain);

        // Sub-bass at 55Hz
        var subOsc = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55, t);
        subGain.gain.setValueAtTime(0.0, t);
        subGain.gain.linearRampToValueAtTime(0.08, t + dur - 0.3);
        subGain.gain.setValueAtTime(0.08, t + dur - 0.3);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        subOsc.connect(subGain);
        subGain.connect(master);

        // Detuned sawtooth pair 110Hz/113Hz through lowpass
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(800, t);
        var sawGain = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw2.frequency.setValueAtTime(113, t);
        sawGain.gain.setValueAtTime(0.0, t);
        sawGain.gain.linearRampToValueAtTime(0.04, t + dur - 0.3);
        sawGain.gain.setValueAtTime(0.04, t + dur - 0.3);

        // 0.5Hz tremolo on saw pair
        var lfo = audioCtx.createOscillator();
        var lfoGain = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, t);
        lfoGain.gain.setValueAtTime(0.02, t);
        lfo.connect(lfoGain);
        lfoGain.connect(sawGain.gain);

        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(master);

        // Cold high harmonics 880Hz, 1108Hz
        var harm1 = audioCtx.createOscillator();
        var harm1Gain = audioCtx.createGain();
        harm1.type = 'sine';
        harm1.frequency.setValueAtTime(880, t);
        harm1Gain.gain.setValueAtTime(0.0, t);
        harm1Gain.gain.linearRampToValueAtTime(0.02, t + dur - 0.3);
        harm1.connect(harm1Gain);
        harm1Gain.connect(master);

        var harm2 = audioCtx.createOscillator();
        var harm2Gain = audioCtx.createGain();
        harm2.type = 'sine';
        harm2.frequency.setValueAtTime(1108, t);
        harm2Gain.gain.setValueAtTime(0.0, t);
        harm2Gain.gain.linearRampToValueAtTime(0.02, t + dur - 0.3);
        harm2.connect(harm2Gain);
        harm2Gain.connect(master);

        subOsc.start(t); subOsc.stop(t + dur);
        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        harm1.start(t); harm1.stop(t + dur);
        harm2.start(t); harm2.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);

        return { osc: subOsc, gain: master, duration: dur };
    }

    // promo-titleReveal
    // Authority Fifth sawtooth pair + triangle sub + noise impact, 1.5s
    function _promoTitleReveal(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.5;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(1.0, t);
        master.connect(busGain);

        // Noise impact burst through lowpass 400Hz
        var noiseBuf = _getNoiseBuffer(0.15);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(400, t);
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.001, t);
        noiseGain.gain.linearRampToValueAtTime(0.12, t + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseGain);
        noiseGain.connect(master);

        // Sawtooth pair A2+E3 (110Hz, 165Hz) through lowpass
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(1200, t);
        var sawGain = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw2.frequency.setValueAtTime(165, t);
        sawGain.gain.setValueAtTime(0.001, t);
        sawGain.gain.linearRampToValueAtTime(0.06, t + 0.05);
        sawGain.gain.setValueAtTime(0.06, t + 0.85);
        sawGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // 1Hz tremolo on sawtooths
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(1, t);
        lfoG.gain.setValueAtTime(0.01, t);
        lfo.connect(lfoG);
        lfoG.connect(sawGain.gain);

        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(master);

        // Sub triangle at 55Hz
        var sub = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(55, t);
        subGain.gain.setValueAtTime(0.001, t);
        subGain.gain.linearRampToValueAtTime(0.10, t + 0.05);
        subGain.gain.setValueAtTime(0.10, t + 0.85);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subGain);
        subGain.connect(master);

        noiseSrc.start(t); noiseSrc.stop(t + 0.15);
        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);

        return { osc: saw1, gain: master, duration: dur };
    }

    // promo-cameraZoomOut
    // Descending sine 400->110Hz over 2.5s + triangle drone 55Hz
    function _promoCameraZoom(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 2.5;

        // Descending sine
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + dur);
        oscGain.gain.setValueAtTime(0.0, t);
        oscGain.gain.linearRampToValueAtTime(0.04, t + 0.2);
        oscGain.gain.setValueAtTime(0.04, t + dur);

        // 0.3Hz vibrato on sine freq
        var vib = audioCtx.createOscillator();
        var vibG = audioCtx.createGain();
        vib.type = 'sine';
        vib.frequency.setValueAtTime(0.3, t);
        vibG.gain.setValueAtTime(5, t);
        vib.connect(vibG);
        vibG.connect(osc.frequency);

        osc.connect(oscGain);
        oscGain.connect(busGain);

        // Triangle drone at 55Hz
        var tri = audioCtx.createOscillator();
        var triGain = audioCtx.createGain();
        tri.type = 'triangle';
        tri.frequency.setValueAtTime(55, t);
        triGain.gain.setValueAtTime(0.0, t);
        triGain.gain.linearRampToValueAtTime(0.05, t + 0.2);
        triGain.gain.setValueAtTime(0.05, t + dur);
        tri.connect(triGain);
        triGain.connect(busGain);

        osc.start(t); osc.stop(t + dur);
        vib.start(t); vib.stop(t + dur);
        tri.start(t); tri.stop(t + dur);

        return { osc: osc, gain: oscGain, duration: dur };
    }

    // promo-hudDeath
    // Noise through lowpass sweep + descending square pulses, 1.0s
    function _promoHudDeath(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.0;

        // Noise through lowpass 1000->200Hz
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(1000, t);
        nFilter.frequency.exponentialRampToValueAtTime(200, t + dur);
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.06, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseGain);
        noiseGain.connect(busGain);

        // 4 descending square pulses: 400, 300, 200, 100Hz at 0.25s intervals
        var freqs = [400, 300, 200, 100];
        var firstOsc = null;
        for (var i = 0; i < freqs.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freqs[i], t);
            var pStart = t + i * 0.25;
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(0.04, pStart);
            g.gain.exponentialRampToValueAtTime(0.001, pStart + 0.08);
            g.gain.setValueAtTime(0.0, pStart + 0.1);
            osc.connect(g);
            g.connect(busGain);
            osc.start(pStart);
            osc.stop(pStart + 0.1);
            if (i === 0) firstOsc = osc;
        }

        noiseSrc.start(t);
        noiseSrc.stop(t + dur);

        return { osc: firstOsc, gain: noiseGain, duration: dur };
    }

    // promo-zone2Materialize
    // Triangle ascending 82->165Hz + filtered sawtooth shimmer, 1.0s
    function _promoZone2Materialize(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.0;

        // Ascending triangle
        var tri = audioCtx.createOscillator();
        var triGain = audioCtx.createGain();
        tri.type = 'triangle';
        tri.frequency.setValueAtTime(82, t);
        tri.frequency.linearRampToValueAtTime(165, t + dur);
        triGain.gain.setValueAtTime(0.0, t);
        triGain.gain.linearRampToValueAtTime(0.05, t + dur);
        tri.connect(triGain);
        triGain.connect(busGain);

        // Sawtooth shimmer at 330Hz through bandpass 800Hz Q=3
        var saw = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'bandpass';
        sawFilter.frequency.setValueAtTime(800, t);
        sawFilter.Q.setValueAtTime(3, t);
        var sawGain = audioCtx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(330, t);
        sawGain.gain.setValueAtTime(0.0, t);
        sawGain.gain.linearRampToValueAtTime(0.03, t + dur);

        // 2Hz tremolo on shimmer
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2, t);
        lfoG.gain.setValueAtTime(0.01, t);
        lfo.connect(lfoG);
        lfoG.connect(sawGain.gain);

        saw.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(busGain);

        tri.start(t); tri.stop(t + dur);
        saw.start(t); saw.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);

        return { osc: tri, gain: triGain, duration: dur };
    }

    // promo-whiteFlash
    // Full-spectrum noise burst + sine sub-impact + reverse reverb triangle tail, 1.3s
    function _promoWhiteFlash(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.3;

        // Noise burst (unfiltered)
        var noiseBuf = _getNoiseBuffer(0.5);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.001, t);
        noiseGain.gain.linearRampToValueAtTime(0.20, t + 0.2);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        noiseSrc.connect(noiseGain);
        noiseGain.connect(busGain);

        // Sub sine at 40Hz
        var sub = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(40, t);
        subGain.gain.setValueAtTime(0.001, t);
        subGain.gain.linearRampToValueAtTime(0.15, t + 0.01);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        sub.connect(subGain);
        subGain.connect(busGain);

        // Reverse reverb triangle tail at 110Hz
        var rev = audioCtx.createOscillator();
        var revGain = audioCtx.createGain();
        rev.type = 'triangle';
        rev.frequency.setValueAtTime(110, t);
        revGain.gain.setValueAtTime(0.0, t);
        revGain.gain.setValueAtTime(0.0, t + 0.2);
        revGain.gain.linearRampToValueAtTime(0.06, t + 0.4);
        revGain.gain.setValueAtTime(0.06, t + 1.0);
        revGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        rev.connect(revGain);
        revGain.connect(busGain);

        noiseSrc.start(t); noiseSrc.stop(t + 0.5);
        sub.start(t); sub.stop(t + 0.6);
        rev.start(t); rev.stop(t + dur);

        return { osc: sub, gain: noiseGain, duration: dur };
    }

    // promo-wireframeReveal
    // Sawtooth through lowpass sweep + metallic ping, 0.8s
    function _promoWireframe(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.8;

        // Sawtooth at 110Hz, lowpass 200->1200Hz
        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.linearRampToValueAtTime(1200, t + 0.6);
        var oscGain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        oscGain.gain.setValueAtTime(0.001, t);
        oscGain.gain.linearRampToValueAtTime(0.04, t + 0.1);
        oscGain.gain.setValueAtTime(0.04, t + 0.6);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(busGain);

        // Metallic ping at 1320Hz
        var ping = audioCtx.createOscillator();
        var pingGain = audioCtx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(1320, t);
        pingGain.gain.setValueAtTime(0.0, t);
        pingGain.gain.setValueAtTime(0.05, t + 0.5);
        pingGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        ping.connect(pingGain);
        pingGain.connect(busGain);

        osc.start(t); osc.stop(t + dur);
        ping.start(t + 0.5); ping.stop(t + dur);

        return { osc: osc, gain: oscGain, duration: dur };
    }

    // promo-commandActivated
    // Authority Fifth sawtooth pair + square pulse at 4Hz, 1.5s
    function _promoCommandActivated(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.5;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(1.0, t);
        master.connect(busGain);

        // Sawtooth pair 110Hz + 165Hz
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(1000, t);
        var sawGain = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw2.frequency.setValueAtTime(165, t);
        sawGain.gain.setValueAtTime(0.05, t);
        sawGain.gain.setValueAtTime(0.05, t + 1.0);
        sawGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(master);

        // Square pulse at 220Hz, gated at 4Hz (4 pulses then fade)
        // 4 pulses at 0.25s intervals
        for (var i = 0; i < 4; i++) {
            var pulse = audioCtx.createOscillator();
            var pg = audioCtx.createGain();
            pulse.type = 'square';
            pulse.frequency.setValueAtTime(220, t);
            var pStart = t + i * 0.25;
            pg.gain.setValueAtTime(0.0, t);
            pg.gain.setValueAtTime(0.08, pStart);
            pg.gain.setValueAtTime(0.08, pStart + 0.06);
            pg.gain.exponentialRampToValueAtTime(0.001, pStart + 0.12);
            pg.gain.setValueAtTime(0.0, pStart + 0.13);
            pulse.connect(pg);
            pg.connect(master);
            pulse.start(pStart);
            pulse.stop(pStart + 0.13);
        }

        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);

        return { osc: saw1, gain: master, duration: dur };
    }

    // promo-directorTypewriter
    // Square through bandpass, 100-160Hz randomized, 0.03s per char
    function _promoDirectorTypewriter(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.03;
        var freq = 120 + Math.random() * 40;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, t);
        filter.Q.setValueAtTime(2, t);
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.setValueAtTime(0.04, t + dur * 0.8);
        gain.gain.linearRampToValueAtTime(0.0, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(busGain);

        osc.start(t);
        osc.stop(t + dur);

        return { osc: osc, gain: gain, duration: dur };
    }

    // promo-directorFinalLine
    // Sub-bass + typewriter base + ambient drone, ~1.5s
    function _promoDirectorFinalLine(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.5;

        // Sub-bass at 45Hz with 0.2Hz LFO
        var sub = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(45, t);
        subGain.gain.setValueAtTime(0.0, t);
        subGain.gain.linearRampToValueAtTime(0.06, t + 0.2);
        subGain.gain.setValueAtTime(0.06, t + dur - 0.5);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, t);
        lfoG.gain.setValueAtTime(0.02, t);
        lfo.connect(lfoG);
        lfoG.connect(subGain.gain);

        sub.connect(subGain);
        subGain.connect(busGain);

        // Ambient drone at 55Hz
        var drone = audioCtx.createOscillator();
        var droneGain = audioCtx.createGain();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(55, t);
        droneGain.gain.setValueAtTime(0.04, t);
        droneGain.gain.setValueAtTime(0.04, t + dur - 0.1);
        droneGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        drone.connect(droneGain);
        droneGain.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);
        drone.start(t); drone.stop(t + dur);

        return { osc: sub, gain: subGain, duration: dur };
    }

    // promo-directorPanelSlide
    // Sawtooth through lowpass + servo sine sweep, 0.2s
    function _promoDirectorPanelSlide(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.2;
        var slideIn = opts && opts.slideIn !== false;

        // Sawtooth at 80Hz through lowpass 600Hz
        var saw = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        var sawGain = audioCtx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(80, t);
        sawGain.gain.setValueAtTime(0.001, t);
        sawGain.gain.linearRampToValueAtTime(0.03, t + dur * 0.5);
        sawGain.gain.linearRampToValueAtTime(0.001, t + dur);
        saw.connect(filter);
        filter.connect(sawGain);
        sawGain.connect(busGain);

        // Servo sine sweep
        var servo = audioCtx.createOscillator();
        var servoGain = audioCtx.createGain();
        servo.type = 'sine';
        if (slideIn) {
            servo.frequency.setValueAtTime(200, t);
            servo.frequency.linearRampToValueAtTime(400, t + dur);
        } else {
            servo.frequency.setValueAtTime(400, t);
            servo.frequency.linearRampToValueAtTime(200, t + dur);
        }
        servoGain.gain.setValueAtTime(0.001, t);
        servoGain.gain.linearRampToValueAtTime(0.05, t + dur * 0.5);
        servoGain.gain.linearRampToValueAtTime(0.001, t + dur);
        servo.connect(servoGain);
        servoGain.connect(busGain);

        saw.start(t); saw.stop(t + dur);
        servo.start(t); servo.stop(t + dur);

        return { osc: saw, gain: sawGain, duration: dur };
    }

    // =========================================
    // CATEGORY 2: BOOT SEQUENCE (3)
    // =========================================

    // boot-panelStart
    // Triangle two-note ascending: E3(165Hz) -> A3(220Hz), 0.15s
    function _bootPanelStart(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.15;

        // First note 165Hz
        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(165, t);
        g1.gain.setValueAtTime(0.04, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc1.connect(g1);
        g1.connect(busGain);
        osc1.start(t);
        osc1.stop(t + 0.07);

        // Second note 220Hz
        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.035, t + 0.06);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc2.connect(g2);
        g2.connect(busGain);
        osc2.start(t + 0.06);
        osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // boot-panelOnline
    // Triangle three-note ascending: A3(220) C#4(277) E4(330), 0.25s
    function _bootPanelOnline(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.25;
        var notes = [220, 277, 330];
        var gains = [0.035, 0.04, 0.045];
        var noteLen = 0.07;
        var gap = 0.04;
        var firstOsc = null;

        for (var i = 0; i < notes.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(notes[i], t);
            var nStart = t + i * (noteLen + gap * 0.5);
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(gains[i], nStart);
            g.gain.setValueAtTime(gains[i], nStart + noteLen);
            g.gain.exponentialRampToValueAtTime(0.001, nStart + noteLen + gap);
            osc.connect(g);
            g.connect(busGain);
            osc.start(nStart);
            osc.stop(nStart + noteLen + gap + 0.01);
            if (i === 0) firstOsc = osc;
        }

        return { osc: firstOsc, gain: audioCtx.createGain(), duration: dur };
    }

    // boot-allSystemsGo
    // Authority Fifth chord + ascending confirmation + sub-bass, 1.2s
    function _bootAllSystems(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.2;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(1.0, t);
        master.connect(busGain);

        // Sub triangle at 55Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(55, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.06, t + 0.01);
        subG.gain.setValueAtTime(0.06, t + 0.3);
        subG.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        sub.connect(subG);
        subG.connect(master);

        // Authority Fifth sawtooths 110Hz + 165Hz
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(1000, t);
        var sawGain = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw2.frequency.setValueAtTime(165, t);
        sawGain.gain.setValueAtTime(0.001, t);
        sawGain.gain.linearRampToValueAtTime(0.05, t + 0.05);
        sawGain.gain.setValueAtTime(0.05, t + 0.5);
        sawGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        // 1Hz tremolo
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(1, t);
        lfoG.gain.setValueAtTime(0.01, t);
        lfo.connect(lfoG);
        lfoG.connect(sawGain.gain);

        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(master);

        // Ascending sine notes A3-C#4-E4-A4 at 0.1s intervals
        var ascNotes = [220, 277, 330, 440];
        for (var i = 0; i < ascNotes.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(ascNotes[i], t);
            var nStart = t + 0.2 + i * 0.1;
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(0.04, nStart);
            g.gain.exponentialRampToValueAtTime(0.001, nStart + 0.08);
            osc.connect(g);
            g.connect(master);
            osc.start(nStart);
            osc.stop(nStart + 0.1);
        }

        sub.start(t); sub.stop(t + dur);
        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);

        return { osc: saw1, gain: master, duration: dur };
    }

    // =========================================
    // CATEGORY 3: COMMAND STATE (6)
    // =========================================

    // cmd-waveStart
    // Authority Fifth sawtooths through lowpass sweep + ascending sine, 0.8s
    function _waveStart(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.8;

        // Sawtooth pair through lowpass sweep 400->1600Hz
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.linearRampToValueAtTime(1600, t + 0.6);
        var sawGain = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw2.frequency.setValueAtTime(165, t);
        sawGain.gain.setValueAtTime(0.001, t);
        sawGain.gain.linearRampToValueAtTime(0.05, t + 0.03);
        sawGain.gain.setValueAtTime(0.05, t + 0.6);
        sawGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        saw1.connect(filter);
        saw2.connect(filter);
        filter.connect(sawGain);
        sawGain.connect(busGain);

        // Ascending sine ramp 220->440Hz
        var sine = audioCtx.createOscillator();
        var sineGain = audioCtx.createGain();
        sine.type = 'sine';
        sine.frequency.setValueAtTime(220, t);
        sine.frequency.linearRampToValueAtTime(440, t + 0.4);
        sineGain.gain.setValueAtTime(0.001, t);
        sineGain.gain.linearRampToValueAtTime(0.03, t + 0.1);
        sineGain.gain.setValueAtTime(0.03, t + 0.4);
        sineGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sine.connect(sineGain);
        sineGain.connect(busGain);

        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        sine.start(t); sine.stop(t + dur);

        return { osc: saw1, gain: sawGain, duration: dur };
    }

    // cmd-waveEnd
    // Descending Authority Fifth + resolution chord, 1.0s
    function _waveEnd(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.0;

        // Descending sawtooths 165->110Hz
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(1000, t);
        var sawGain = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(165, t);
        saw1.frequency.linearRampToValueAtTime(110, t + 0.4);
        saw2.frequency.setValueAtTime(247, t);
        saw2.frequency.linearRampToValueAtTime(165, t + 0.4);
        sawGain.gain.setValueAtTime(0.001, t);
        sawGain.gain.linearRampToValueAtTime(0.05, t + 0.02);
        sawGain.gain.setValueAtTime(0.05, t + 0.4);
        sawGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawGain);
        sawGain.connect(busGain);

        // Resolution chord A3+C#4+E4 at 0.4s mark
        var chordNotes = [220, 277, 330];
        for (var i = 0; i < chordNotes.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(chordNotes[i], t);
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(0.001, t + 0.39);
            g.gain.linearRampToValueAtTime(0.04, t + 0.45);
            g.gain.setValueAtTime(0.04, t + 0.8);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.connect(g);
            g.connect(busGain);
            osc.start(t + 0.4);
            osc.stop(t + dur);
        }

        saw1.start(t); saw1.stop(t + 0.65);
        saw2.start(t); saw2.stop(t + 0.65);

        return { osc: saw1, gain: sawGain, duration: dur };
    }

    // cmd-directorTransmit
    // Sub-bass + cold square through bandpass + ring mod artifacts, 0.4s
    function _directorTransmit(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.4;

        // Sub-bass at 50Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(50, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.08, t + 0.01);
        subG.gain.setValueAtTime(0.08, t + 0.2);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subG);
        subG.connect(busGain);

        // Cold square at 800Hz through bandpass 1000Hz Q=5
        var sq = audioCtx.createOscillator();
        var sqFilter = audioCtx.createBiquadFilter();
        sqFilter.type = 'bandpass';
        sqFilter.frequency.setValueAtTime(1000, t);
        sqFilter.Q.setValueAtTime(5, t);
        var sqG = audioCtx.createGain();
        sq.type = 'square';
        sq.frequency.setValueAtTime(800, t);
        sqG.gain.setValueAtTime(0.001, t);
        sqG.gain.linearRampToValueAtTime(0.04, t + 0.01);
        sqG.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        sq.connect(sqFilter);
        sqFilter.connect(sqG);
        sqG.connect(busGain);

        // Ring mod artifacts: multiply sub x square = sidebands
        // Approximate with a sine at difference/sum frequencies
        var ring1 = audioCtx.createOscillator();
        var ring1G = audioCtx.createGain();
        ring1.type = 'sine';
        ring1.frequency.setValueAtTime(750, t); // 800-50
        ring1G.gain.setValueAtTime(0.001, t);
        ring1G.gain.linearRampToValueAtTime(0.02, t + 0.01);
        ring1G.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        ring1.connect(ring1G);
        ring1G.connect(busGain);

        var ring2 = audioCtx.createOscillator();
        var ring2G = audioCtx.createGain();
        ring2.type = 'sine';
        ring2.frequency.setValueAtTime(850, t); // 800+50
        ring2G.gain.setValueAtTime(0.001, t);
        ring2G.gain.linearRampToValueAtTime(0.02, t + 0.01);
        ring2G.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        ring2.connect(ring2G);
        ring2G.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        sq.start(t); sq.stop(t + 0.15);
        ring1.start(t); ring1.stop(t + 0.15);
        ring2.start(t); ring2.stop(t + 0.15);

        return { osc: sub, gain: subG, duration: dur };
    }

    // cmd-waveTimerWarning
    // Square pulse at 220Hz, 0.05s each
    function _waveTimerWarning(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.05;
        var vol = (opts && opts.gain) || 0.04;

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.setValueAtTime(vol, t + dur);
        gain.gain.linearRampToValueAtTime(0.0, t + dur + 0.005);
        osc.connect(gain);
        gain.connect(busGain);
        osc.start(t);
        osc.stop(t + dur + 0.01);

        return { osc: osc, gain: gain, duration: dur + 0.01 };
    }

    // cmd-countdownBeep
    // Ascending pentatonic beep for final 5-second countdown.
    // opts.secondsLeft (5..1) selects pitch — higher pitch as time runs out.
    // Sine tone, soft and musical, ~150ms with gentle fade.
    function _countdownBeep(busGain, opts) {
        if (!audioCtx) return null;
        var secondsLeft = (opts && opts.secondsLeft) || 5;
        // C5 pentatonic ascending: C5, D5, E5, G5, A5
        var freqs = { 5: 523, 4: 587, 3: 659, 2: 784, 1: 880 };
        var freq = freqs[secondsLeft];
        if (!freq) return null;

        var t = audioCtx.currentTime;
        var dur = 0.15;

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain);
        gain.connect(busGain);
        osc.start(t);
        osc.stop(t + dur + 0.01);

        return { osc: osc, gain: gain, duration: dur + 0.01 };
    }

    // cmd-quotaMet
    // Ascending triangle fifth A3(220)->E4(330), 0.2s
    function _quotaMet(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.2;

        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(220, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.04, t + 0.005);
        g1.gain.setValueAtTime(0.04, t + 0.08);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc1.connect(g1);
        g1.connect(busGain);

        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(330, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.001, t + 0.099);
        g2.gain.linearRampToValueAtTime(0.04, t + 0.105);
        g2.gain.setValueAtTime(0.04, t + 0.18);
        g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc2.connect(g2);
        g2.connect(busGain);

        osc1.start(t); osc1.stop(t + 0.11);
        osc2.start(t + 0.1); osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // cmd-quotaExceeded
    // Ascending triangle fifth + sparkle sine at 660Hz, 0.3s
    function _quotaExceeded(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        // Same base as quotaMet
        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(220, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.04, t + 0.005);
        g1.gain.setValueAtTime(0.04, t + 0.08);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc1.connect(g1);
        g1.connect(busGain);

        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(330, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.001, t + 0.099);
        g2.gain.linearRampToValueAtTime(0.04, t + 0.105);
        g2.gain.setValueAtTime(0.04, t + 0.18);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc2.connect(g2);
        g2.connect(busGain);

        // Sparkle sine at 660Hz, delayed 50ms
        var sparkle = audioCtx.createOscillator();
        var sparkleG = audioCtx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(660, t);
        sparkleG.gain.setValueAtTime(0.0, t);
        sparkleG.gain.setValueAtTime(0.001, t + 0.049);
        sparkleG.gain.linearRampToValueAtTime(0.03, t + 0.06);
        sparkleG.gain.exponentialRampToValueAtTime(0.001, t + 0.21);
        sparkle.connect(sparkleG);
        sparkleG.connect(busGain);

        osc1.start(t); osc1.stop(t + 0.11);
        osc2.start(t + 0.1); osc2.stop(t + 0.21);
        sparkle.start(t + 0.05); sparkle.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // =========================================
    // CATEGORY 4: UI SOUNDS (7)
    // =========================================

    // ui-zoneSelect
    // Sine ping 330Hz + triangle undertone 165Hz, 0.08s
    function _uiZoneSelect(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.08;

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);

        var tri = audioCtx.createOscillator();
        var triG = audioCtx.createGain();
        tri.type = 'triangle';
        tri.frequency.setValueAtTime(165, t);
        triG.gain.setValueAtTime(0.02, t);
        triG.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        tri.connect(triG);
        triG.connect(busGain);

        osc.start(t); osc.stop(t + dur);
        tri.start(t); tri.stop(t + 0.07);

        return { osc: osc, gain: g, duration: dur };
    }

    // ui-fleetOrder
    // Two-note sawtooth 165->220Hz through lowpass + click, 0.18s
    function _uiFleetOrder(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.18;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);

        // First note
        var saw1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw1.frequency.setValueAtTime(165, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.04, t + 0.005);
        g1.gain.setValueAtTime(0.04, t + 0.06);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        saw1.connect(filter);
        filter.connect(g1);
        g1.connect(busGain);
        saw1.start(t); saw1.stop(t + 0.08);

        // Second note
        var saw2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        saw2.type = 'sawtooth';
        saw2.frequency.setValueAtTime(220, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.001, t + 0.079);
        g2.gain.linearRampToValueAtTime(0.04, t + 0.085);
        g2.gain.setValueAtTime(0.04, t + 0.14);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        saw2.connect(g2);
        g2.connect(busGain);
        saw2.start(t + 0.08); saw2.stop(t + 0.16);

        // Click at end
        var click = audioCtx.createOscillator();
        var clickG = audioCtx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(600, t);
        clickG.gain.setValueAtTime(0.0, t);
        clickG.gain.setValueAtTime(0.05, t + 0.16);
        clickG.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
        click.connect(clickG);
        clickG.connect(busGain);
        click.start(t + 0.16); click.stop(t + dur);

        return { osc: saw1, gain: g1, duration: dur };
    }

    // ui-overrideActivate
    // Dramatic ascending sawtooth sweep + sub-bass + harmonic ring, 0.5s
    function _uiOverrideActivate(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.5;

        // Ascending sawtooth sweep 55->440Hz
        var sweep = audioCtx.createOscillator();
        var sweepG = audioCtx.createGain();
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(55, t);
        sweep.frequency.exponentialRampToValueAtTime(440, t + 0.3);
        sweepG.gain.setValueAtTime(0.001, t);
        sweepG.gain.linearRampToValueAtTime(0.08, t + 0.01);
        sweepG.gain.setValueAtTime(0.08, t + 0.3);
        sweepG.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        sweep.connect(sweepG);
        sweepG.connect(busGain);

        // Sub-bass at 40Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(40, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.10, t + 0.01);
        subG.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        sub.connect(subG);
        subG.connect(busGain);

        // Harmonic ring at 880Hz, delayed 100ms
        var harm = audioCtx.createOscillator();
        var harmG = audioCtx.createGain();
        harm.type = 'sine';
        harm.frequency.setValueAtTime(880, t);
        harmG.gain.setValueAtTime(0.0, t);
        harmG.gain.setValueAtTime(0.001, t + 0.1);
        harmG.gain.linearRampToValueAtTime(0.04, t + 0.11);
        harmG.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        harm.connect(harmG);
        harmG.connect(busGain);

        sweep.start(t); sweep.stop(t + 0.45);
        sub.start(t); sub.stop(t + 0.25);
        harm.start(t + 0.1); harm.stop(t + dur);

        return { osc: sweep, gain: sweepG, duration: dur };
    }

    // ui-overrideEnd
    // Descending sawtooth sweep + wind-down filtered noise, 0.5s
    function _uiOverrideEnd(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.5;

        // Descending sawtooth 440->110Hz
        var sweep = audioCtx.createOscillator();
        var sweepG = audioCtx.createGain();
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(440, t);
        sweep.frequency.exponentialRampToValueAtTime(110, t + 0.4);
        sweepG.gain.setValueAtTime(0.001, t);
        sweepG.gain.linearRampToValueAtTime(0.06, t + 0.02);
        sweepG.gain.setValueAtTime(0.06, t + 0.3);
        sweepG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sweep.connect(sweepG);
        sweepG.connect(busGain);

        // Wind-down noise through lowpass 2000->200Hz
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(2000, t);
        nFilter.frequency.exponentialRampToValueAtTime(200, t + dur);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.03, t);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(busGain);

        sweep.start(t); sweep.stop(t + dur);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: sweep, gain: sweepG, duration: dur };
    }

    // ui-resourceRoute
    // Sine sweep with vibrato + filtered noise whoosh, 0.2s
    function _uiResourceRoute(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.2;

        // Sine sweep 220->330Hz
        var osc = audioCtx.createOscillator();
        var oscG = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(330, t + 0.15);
        oscG.gain.setValueAtTime(0.001, t);
        oscG.gain.linearRampToValueAtTime(0.04, t + 0.01);
        oscG.gain.setValueAtTime(0.04, t + 0.12);
        oscG.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // 8Hz vibrato
        var vib = audioCtx.createOscillator();
        var vibG = audioCtx.createGain();
        vib.type = 'sine';
        vib.frequency.setValueAtTime(8, t);
        vibG.gain.setValueAtTime(5, t);
        vib.connect(vibG);
        vibG.connect(osc.frequency);

        osc.connect(oscG);
        oscG.connect(busGain);

        // Noise whoosh through bandpass 600Hz Q=2
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.setValueAtTime(600, t);
        nFilter.Q.setValueAtTime(2, t);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.001, t);
        noiseG.gain.linearRampToValueAtTime(0.02, t + 0.01);
        noiseG.gain.setValueAtTime(0.02, t + 0.12);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(busGain);

        osc.start(t); osc.stop(t + dur);
        vib.start(t); vib.stop(t + dur);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: osc, gain: oscG, duration: dur };
    }

    // ui-menuNav
    // Sine blip at 277Hz, 0.03s
    function _uiMenuNav(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.03;

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(277, t);
        g.gain.setValueAtTime(0.025, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);
        osc.start(t);
        osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // ui-errorReject
    // Square two-note descending 220->165Hz, 0.12s
    function _uiErrorReject(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.12;

        // First note 220Hz
        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(220, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.05, t + 0.005);
        g1.gain.setValueAtTime(0.05, t + 0.04);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc1.connect(g1);
        g1.connect(busGain);
        osc1.start(t); osc1.stop(t + 0.06);

        // Second note 165Hz
        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(165, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.001, t + 0.059);
        g2.gain.linearRampToValueAtTime(0.05, t + 0.065);
        g2.gain.setValueAtTime(0.05, t + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        osc2.connect(g2);
        g2.connect(busGain);
        osc2.start(t + 0.06); osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // =========================================
    // CATEGORY 5: ZONE SIMULATION (15)
    // =========================================

    // zone-targetSpawn
    // Sine blip through CCTV bandpass, 0.05s
    function _zoneTargetSpawn(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.05;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(g);
        g.connect(busGain);
        osc.start(t); osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // zone-beamActive
    // Simple sine rising chirp through CCTV bandpass, 0.06s
    function _zoneBeamActive(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.06;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(520, t + dur);
        g.gain.setValueAtTime(0.015, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(g);
        g.connect(busGain);
        osc.start(t); osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // zone-abductionComplete
    // Two-note ascending sine pip through CCTV filter, 0.11s
    function _zoneAbductionComplete(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.11;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        filter.connect(busGain);

        // Note 1: 500Hz, 40ms
        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(500, t);
        g1.gain.setValueAtTime(0.025, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc1.connect(g1);
        g1.connect(filter);
        osc1.start(t); osc1.stop(t + 0.05);

        // Note 2: 700Hz after 30ms gap (starts at 0.07s), 40ms
        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(700, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.025, t + 0.07);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        osc2.connect(g2);
        g2.connect(filter);
        osc2.start(t + 0.07); osc2.stop(t + dur + 0.01);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // zone-tankFire
    // Square descending through CCTV filter, 0.06s
    function _zoneTankFire(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.06;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        var g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + dur);
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(g);
        g.connect(busGain);
        osc.start(t); osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // zone-ufoHit
    // Sawtooth impact through CCTV, pitch drop 150->100Hz, 0.1s
    function _zoneUfoHit(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.1;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        var g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.setValueAtTime(100, t + 0.02);
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(g);
        g.connect(busGain);
        osc.start(t); osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // zone-ufoDestroyed
    // Noise burst through CCTV + descending sine, 0.3s
    function _zoneUfoDestroyed(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        // Noise through bandpass 500Hz
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.setValueAtTime(500, t);
        nFilter.Q.setValueAtTime(1.5, t);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.05, t);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(busGain);

        // Descending sine 200->60Hz
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.04, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);

        noiseSrc.start(t); noiseSrc.stop(t + 0.25);
        osc.start(t); osc.stop(t + dur);

        return { osc: osc, gain: g, duration: dur };
    }

    // zone-ufoRespawn
    // Ascending triangle + tiny sine ping, 0.2s
    function _zoneUfoRespawn(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.2;

        var tri = audioCtx.createOscillator();
        var triG = audioCtx.createGain();
        tri.type = 'triangle';
        tri.frequency.setValueAtTime(110, t);
        tri.frequency.linearRampToValueAtTime(220, t + 0.15);
        triG.gain.setValueAtTime(0.001, t);
        triG.gain.linearRampToValueAtTime(0.03, t + 0.02);
        triG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        tri.connect(triG);
        triG.connect(busGain);

        // Ping at 330Hz delayed 0.1s
        var ping = audioCtx.createOscillator();
        var pingG = audioCtx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(330, t);
        pingG.gain.setValueAtTime(0.0, t);
        pingG.gain.setValueAtTime(0.02, t + 0.1);
        pingG.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        ping.connect(pingG);
        pingG.connect(busGain);

        tri.start(t); tri.stop(t + 0.16);
        ping.start(t + 0.1); ping.stop(t + dur);

        return { osc: tri, gain: triG, duration: dur };
    }

    // zone-stateStable
    // Ascending triangle fifth 165->220Hz through CCTV bandpass, 0.15s
    function _zoneStateStable(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.15;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        filter.connect(busGain);

        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(165, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.03, t + 0.005);
        g1.gain.setValueAtTime(0.03, t + 0.06);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc1.connect(g1);
        g1.connect(filter);

        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.03, t + 0.07);
        g2.gain.setValueAtTime(0.03, t + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc2.connect(g2);
        g2.connect(filter);

        osc1.start(t); osc1.stop(t + 0.08);
        osc2.start(t + 0.07); osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // zone-stateStressed
    // Square two-note dissonant 200->210Hz through CCTV bandpass, 0.15s
    function _zoneStateStressed(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.15;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        filter.connect(busGain);

        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(200, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.035, t + 0.005);
        g1.gain.setValueAtTime(0.035, t + 0.06);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc1.connect(g1);
        g1.connect(filter);

        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(210, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.035, t + 0.07);
        g2.gain.setValueAtTime(0.035, t + 0.12);
        g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc2.connect(g2);
        g2.connect(filter);

        osc1.start(t); osc1.stop(t + 0.08);
        osc2.start(t + 0.07); osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // zone-stateCrisis
    // Square three-pulse alarm + sub-bass through CCTV bandpass, 0.3s
    function _zoneStateCrisis(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        filter.connect(busGain);

        // Three square pulses at 300Hz, 6Hz rate (~0.04s on, 0.04s off)
        var firstOsc = null;
        for (var i = 0; i < 3; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, t);
            var pStart = t + i * 0.08;
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(0.05, pStart);
            g.gain.setValueAtTime(0.05, pStart + 0.04);
            g.gain.linearRampToValueAtTime(0.0, pStart + 0.045);
            osc.connect(g);
            g.connect(filter);
            osc.start(pStart);
            osc.stop(pStart + 0.05);
            if (i === 0) firstOsc = osc;
        }

        // Sub-bass sine at 60Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.03, t + 0.05);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subG);
        subG.connect(busGain);

        sub.start(t); sub.stop(t + dur);

        return { osc: firstOsc, gain: subG, duration: dur };
    }

    // zone-targetDropped
    // Descending sine micro-sweep through CCTV bandpass, 0.06s
    function _zoneTargetDropped(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.06;

        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + dur);
        g.gain.setValueAtTime(0.015, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter);
        filter.connect(g);
        g.connect(busGain);
        osc.start(t); osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // zone-quotaMilestone
    // Two-note triangle pip through CCTV bandpass, 0.14s
    function _zoneQuotaMilestone(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.14;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.5, t);
        filter.connect(busGain);

        // Note 1: 660Hz, 50ms
        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(660, t);
        g1.gain.setValueAtTime(0.03, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc1.connect(g1);
        g1.connect(filter);
        osc1.start(t); osc1.stop(t + 0.06);

        // Note 2: 880Hz after 40ms gap (starts at 0.09s), 50ms
        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.03, t + 0.09);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc2.connect(g2);
        g2.connect(filter);
        osc2.start(t + 0.09); osc2.stop(t + dur + 0.01);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // =========================================
    // CATEGORY 6: OVERRIDE MODE (4 one-shots)
    // =========================================

    // override-zoomIn
    // Ascending sine sweep + highpass noise, 0.3s
    function _overrideZoomIn(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + dur);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.01);
        g.gain.setValueAtTime(0.06, t + dur - 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);

        // Noise through rising highpass
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var hpFilter = audioCtx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(200, t);
        hpFilter.frequency.exponentialRampToValueAtTime(2000, t + dur);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.001, t);
        noiseG.gain.linearRampToValueAtTime(0.04, t + 0.01);
        noiseG.gain.setValueAtTime(0.04, t + dur - 0.05);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(hpFilter);
        hpFilter.connect(noiseG);
        noiseG.connect(busGain);

        osc.start(t); osc.stop(t + dur + 0.01);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: osc, gain: g, duration: dur };
    }

    // override-zoomOut
    // Descending sine sweep + lowpass noise, 0.4s
    function _overrideZoomOut(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.4;

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + dur);
        g.gain.setValueAtTime(0.05, t);
        g.gain.setValueAtTime(0.05, t + dur - 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);

        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var lpFilter = audioCtx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(2000, t);
        lpFilter.frequency.exponentialRampToValueAtTime(400, t + dur);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.03, t);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(lpFilter);
        lpFilter.connect(noiseG);
        noiseG.connect(busGain);

        osc.start(t); osc.stop(t + dur + 0.01);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: osc, gain: g, duration: dur };
    }

    // override-timerWarning
    // Escalating square pulse, single pulse (called repeatedly by timer logic)
    function _overrideTimerWarning(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var vol = (opts && opts.gain) || 0.04;
        var dur = 0.03;

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, t);
        g.gain.setValueAtTime(vol, t);
        g.gain.setValueAtTime(vol, t + dur);
        g.gain.linearRampToValueAtTime(0.0, t + dur + 0.005);
        osc.connect(g);
        g.connect(busGain);
        osc.start(t);
        osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur + 0.01 };
    }

    // override-forceEnd
    // Descending saw + harsh square buzz + noise burst, 0.4s
    function _overrideForceEnd(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.4;

        // Descending sawtooth 330->55Hz
        var saw = audioCtx.createOscillator();
        var sawG = audioCtx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(330, t);
        saw.frequency.exponentialRampToValueAtTime(55, t + 0.3);
        sawG.gain.setValueAtTime(0.08, t);
        sawG.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        saw.connect(sawG);
        sawG.connect(busGain);

        // Square buzz at 100Hz
        var buzz = audioCtx.createOscillator();
        var buzzG = audioCtx.createGain();
        buzz.type = 'square';
        buzz.frequency.setValueAtTime(100, t);
        buzzG.gain.setValueAtTime(0.06, t);
        buzzG.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        buzz.connect(buzzG);
        buzzG.connect(busGain);

        // Noise burst
        var noiseBuf = _getNoiseBuffer(0.2);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.04, t);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noiseSrc.connect(noiseG);
        noiseG.connect(busGain);

        saw.start(t); saw.stop(t + 0.4);
        buzz.start(t); buzz.stop(t + 0.15);
        noiseSrc.start(t); noiseSrc.stop(t + 0.2);

        return { osc: saw, gain: sawG, duration: dur };
    }

    // =========================================
    // CATEGORY 7: DIRECTOR SYSTEM (6)
    // =========================================

    // dir-moodChange
    // Sub-bass glide + cold harmonic, 0.6s. opts.improving = true/false
    function _dirMoodChange(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.6;
        var improving = opts && opts.improving;

        // Sub-bass glide
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        if (improving) {
            sub.frequency.setValueAtTime(45, t);
            sub.frequency.linearRampToValueAtTime(55, t + 0.5);
        } else {
            sub.frequency.setValueAtTime(55, t);
            sub.frequency.linearRampToValueAtTime(45, t + 0.5);
        }
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.05, t + 0.1);
        subG.gain.setValueAtTime(0.05, t + 0.3);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subG);
        subG.connect(busGain);

        // Cold harmonic flash at 1000Hz at 0.2s mark
        var harm = audioCtx.createOscillator();
        var harmG = audioCtx.createGain();
        harm.type = 'sine';
        harm.frequency.setValueAtTime(1000, t);
        harmG.gain.setValueAtTime(0.0, t);
        harmG.gain.setValueAtTime(0.02, t + 0.2);
        harmG.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        harm.connect(harmG);
        harmG.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        harm.start(t + 0.15); harm.stop(t + 0.3);

        return { osc: sub, gain: subG, duration: dur };
    }

    // dir-approvalUp
    // Sub-bass ascending + filtered sawtooth swell, 0.3s
    function _dirApprovalUp(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(50, t);
        sub.frequency.linearRampToValueAtTime(60, t + dur);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.04, t + 0.05);
        subG.gain.setValueAtTime(0.04, t + 0.15);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subG);
        subG.connect(busGain);

        // Filtered sawtooth at 110Hz
        var saw = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(600, t);
        var sawG = audioCtx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(110, t);
        sawG.gain.setValueAtTime(0.001, t);
        sawG.gain.linearRampToValueAtTime(0.03, t + 0.05);
        sawG.gain.setValueAtTime(0.03, t + 0.15);
        sawG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        saw.connect(sawFilter);
        sawFilter.connect(sawG);
        sawG.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        saw.start(t); saw.stop(t + dur);

        return { osc: sub, gain: subG, duration: dur };
    }

    // dir-approvalDown
    // Sub-bass drop + dissonant square flash, 0.3s
    function _dirApprovalDown(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(55, t);
        sub.frequency.linearRampToValueAtTime(40, t + 0.2);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.05, t + 0.02);
        subG.gain.setValueAtTime(0.05, t + 0.2);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subG);
        subG.connect(busGain);

        // Harsh square flash at 800Hz through bandpass 900Hz Q=6
        var sq = audioCtx.createOscillator();
        var sqFilter = audioCtx.createBiquadFilter();
        sqFilter.type = 'bandpass';
        sqFilter.frequency.setValueAtTime(900, t);
        sqFilter.Q.setValueAtTime(6, t);
        var sqG = audioCtx.createGain();
        sq.type = 'square';
        sq.frequency.setValueAtTime(800, t);
        sqG.gain.setValueAtTime(0.0, t);
        sqG.gain.setValueAtTime(0.04, t + 0.1);
        sqG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        sq.connect(sqFilter);
        sqFilter.connect(sqG);
        sqG.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        sq.start(t + 0.08); sq.stop(t + 0.15);

        return { osc: sub, gain: subG, duration: dur };
    }

    // dir-disapproval
    // Sub-bass pressure + dissonant minor second chord + noise, 0.6s
    function _dirDisapproval(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.6;

        // Sub-bass at 40Hz with 2Hz tremolo
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(40, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.07, t + 0.05);
        subG.gain.setValueAtTime(0.07, t + 0.4);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2, t);
        lfoG.gain.setValueAtTime(0.02, t);
        lfo.connect(lfoG);
        lfoG.connect(subG.gain);

        sub.connect(subG);
        subG.connect(busGain);

        // Dissonant squares at 800Hz and 850Hz
        var sq1 = audioCtx.createOscillator();
        var sq1G = audioCtx.createGain();
        sq1.type = 'square';
        sq1.frequency.setValueAtTime(800, t);
        sq1G.gain.setValueAtTime(0.0, t);
        sq1G.gain.setValueAtTime(0.03, t + 0.1);
        sq1G.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        sq1.connect(sq1G);
        sq1G.connect(busGain);

        var sq2 = audioCtx.createOscillator();
        var sq2G = audioCtx.createGain();
        sq2.type = 'square';
        sq2.frequency.setValueAtTime(850, t);
        sq2G.gain.setValueAtTime(0.0, t);
        sq2G.gain.setValueAtTime(0.03, t + 0.1);
        sq2G.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        sq2.connect(sq2G);
        sq2G.connect(busGain);

        // Noise through bandpass 1000Hz
        var noiseBuf = _getNoiseBuffer(0.4);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.setValueAtTime(1000, t);
        nFilter.Q.setValueAtTime(2, t);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.001, t);
        noiseG.gain.linearRampToValueAtTime(0.02, t + 0.05);
        noiseG.gain.setValueAtTime(0.02, t + 0.3);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);
        sq1.start(t + 0.1); sq1.stop(t + 0.35);
        sq2.start(t + 0.1); sq2.stop(t + 0.35);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: sub, gain: subG, duration: dur };
    }

    // dir-vulnerability (one-shot trigger version; loop version in _loopFactories)
    function _dirVulnerability(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.8;

        // Wobbling sub-bass at 50Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(50, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.06, t + 0.2);
        subG.gain.setValueAtTime(0.06, t + 0.6);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(1, t);
        lfoG.gain.setValueAtTime(10, t);
        lfo.connect(lfoG);
        lfoG.connect(sub.frequency);

        sub.connect(subG);
        subG.connect(busGain);

        // Jittery high harmonics
        var harm1 = audioCtx.createOscillator();
        var harm1G = audioCtx.createGain();
        harm1.type = 'sine';
        harm1.frequency.setValueAtTime(900, t);
        // Approximate jitter with rapid scheduled values
        for (var i = 0; i < 16; i++) {
            harm1.frequency.setValueAtTime(900 + (Math.random() * 60 - 30), t + i * 0.05);
        }
        harm1G.gain.setValueAtTime(0.001, t);
        harm1G.gain.linearRampToValueAtTime(0.02, t + 0.2);
        harm1G.gain.exponentialRampToValueAtTime(0.001, t + dur);
        harm1.connect(harm1G);
        harm1G.connect(busGain);

        // Noise through highpass 1500Hz
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var hpFilter = audioCtx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(1500, t);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.001, t);
        noiseG.gain.linearRampToValueAtTime(0.015, t + 0.2);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(hpFilter);
        hpFilter.connect(noiseG);
        noiseG.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);
        harm1.start(t); harm1.stop(t + dur);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: sub, gain: subG, duration: dur };
    }

    // dir-recovery
    // Sub-bass stabilizing + cold chord, 0.8s
    function _dirRecovery(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.8;

        // Sub-bass wobble stabilizing: LFO depth decreasing from 10 to 0
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(50, t);
        sub.frequency.linearRampToValueAtTime(55, t + 0.5);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.07, t + 0.1);
        subG.gain.setValueAtTime(0.07, t + 0.6);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(1, t);
        lfoG.gain.setValueAtTime(10, t);
        lfoG.gain.linearRampToValueAtTime(0, t + 0.5);
        lfo.connect(lfoG);
        lfoG.connect(sub.frequency);

        sub.connect(subG);
        subG.connect(busGain);

        // Cold chord: square 800Hz + 1000Hz
        var sq1 = audioCtx.createOscillator();
        var sq1G = audioCtx.createGain();
        sq1.type = 'square';
        sq1.frequency.setValueAtTime(800, t);
        sq1G.gain.setValueAtTime(0.0, t);
        sq1G.gain.setValueAtTime(0.001, t + 0.2);
        sq1G.gain.linearRampToValueAtTime(0.03, t + 0.3);
        sq1G.gain.setValueAtTime(0.03, t + 0.6);
        sq1G.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sq1.connect(sq1G);
        sq1G.connect(busGain);

        var sq2 = audioCtx.createOscillator();
        var sq2G = audioCtx.createGain();
        sq2.type = 'square';
        sq2.frequency.setValueAtTime(1000, t);
        sq2G.gain.setValueAtTime(0.0, t);
        sq2G.gain.setValueAtTime(0.001, t + 0.2);
        sq2G.gain.linearRampToValueAtTime(0.03, t + 0.3);
        sq2G.gain.setValueAtTime(0.03, t + 0.6);
        sq2G.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sq2.connect(sq2G);
        sq2G.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + 0.55);
        sq1.start(t + 0.2); sq1.stop(t + dur);
        sq2.start(t + 0.2); sq2.stop(t + dur);

        return { osc: sub, gain: subG, duration: dur };
    }

    // =========================================
    // CATEGORY 8: RESOURCES (2 one-shots)
    // =========================================

    // res-transferStart
    // Ping at 330Hz + ascending blips 220/277/330Hz, 0.2s
    function _resTransferStart(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.2;

        // Ping at 330Hz
        var ping = audioCtx.createOscillator();
        var pingG = audioCtx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(330, t);
        pingG.gain.setValueAtTime(0.04, t);
        pingG.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        ping.connect(pingG);
        pingG.connect(busGain);

        // Ascending blips
        var blipFreqs = [220, 277, 330];
        var firstOsc = null;
        for (var i = 0; i < blipFreqs.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(blipFreqs[i], t);
            var bStart = t + 0.05 + i * 0.05;
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(0.03, bStart);
            g.gain.exponentialRampToValueAtTime(0.001, bStart + 0.01);
            g.gain.setValueAtTime(0.0, bStart + 0.015);
            osc.connect(g);
            g.connect(busGain);
            osc.start(bStart);
            osc.stop(bStart + 0.02);
            if (i === 0) firstOsc = osc;
        }

        ping.start(t); ping.stop(t + 0.1);

        return { osc: ping, gain: pingG, duration: dur };
    }

    // res-delivered
    // Descending sine 330->220Hz + triangle ping at 440Hz, 0.15s
    function _resDelivered(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.15;

        // Descending sine
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, t);
        osc.frequency.linearRampToValueAtTime(220, t + 0.1);
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);

        // Confirmation ping at 440Hz delayed 0.08s
        var ping = audioCtx.createOscillator();
        var pingG = audioCtx.createGain();
        ping.type = 'triangle';
        ping.frequency.setValueAtTime(440, t);
        pingG.gain.setValueAtTime(0.0, t);
        pingG.gain.setValueAtTime(0.04, t + 0.08);
        pingG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        ping.connect(pingG);
        pingG.connect(busGain);

        osc.start(t); osc.stop(t + dur);
        ping.start(t + 0.08); ping.stop(t + dur);

        return { osc: osc, gain: g, duration: dur };
    }

    // =========================================
    // CATEGORY 9: WAVE SUMMARY (10)
    // =========================================

    // summary-screenOpen
    // Authority Fifth sawtooths through lowpass + servo, 0.4s
    function _summaryScreenOpen(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.4;

        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(800, t);
        var sawG = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw2.frequency.setValueAtTime(165, t);
        sawG.gain.setValueAtTime(0.001, t);
        sawG.gain.linearRampToValueAtTime(0.04, t + 0.05);
        sawG.gain.setValueAtTime(0.04, t + 0.2);
        sawG.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawG);
        sawG.connect(busGain);

        // Servo sine 200->300Hz
        var servo = audioCtx.createOscillator();
        var servoG = audioCtx.createGain();
        servo.type = 'sine';
        servo.frequency.setValueAtTime(200, t);
        servo.frequency.linearRampToValueAtTime(300, t + 0.2);
        servoG.gain.setValueAtTime(0.001, t);
        servoG.gain.linearRampToValueAtTime(0.03, t + 0.1);
        servoG.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        servo.connect(servoG);
        servoG.connect(busGain);

        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        servo.start(t); servo.stop(t + 0.3);

        return { osc: saw1, gain: sawG, duration: dur };
    }

    // summary-reportCard
    // Chord depends on grade. opts.grade: 'good', 'mediocre', 'poor'
    function _summaryReportCard(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.8;
        var grade = (opts && opts.grade) || 'mediocre';

        var notes, gainPerNote, useTremolo;
        if (grade === 'good') {
            notes = [110, 165, 220]; // A2-E3-A3
            gainPerNote = 0.05;
            useTremolo = false;
        } else if (grade === 'poor') {
            notes = [110, 117]; // A2-Bb2 minor second
            gainPerNote = 0.06;
            useTremolo = true;
        } else {
            notes = [110, 147]; // A2-D3 fourth
            gainPerNote = 0.04;
            useTremolo = false;
        }

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(1.0, t);
        master.connect(busGain);

        var firstOsc = null;
        for (var i = 0; i < notes.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(notes[i], t);
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(gainPerNote, t + 0.03);
            g.gain.setValueAtTime(gainPerNote, t + 0.5);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + dur);
            if (i === 0) firstOsc = osc;
        }

        if (useTremolo) {
            var lfo = audioCtx.createOscillator();
            var lfoG = audioCtx.createGain();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(1, t);
            lfoG.gain.setValueAtTime(0.02, t);
            lfo.connect(lfoG);
            lfoG.connect(master.gain);
            lfo.start(t);
            lfo.stop(t + dur);
        }

        return { osc: firstOsc, gain: master, duration: dur };
    }

    // summary-barReveal
    // Sine sweep matching bar fill, 0.5-1.0s
    function _summaryBarReveal(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var fill = (opts && opts.fill !== undefined) ? opts.fill : 0.5; // 0-1
        var dur = (opts && opts.duration) || 0.6;
        var finalFreq = 165 + fill * (440 - 165);

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(165, t);
        osc.frequency.linearRampToValueAtTime(finalFreq, t + dur - 0.1);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.025, t + 0.05);
        g.gain.setValueAtTime(0.025, t + dur - 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);
        osc.start(t);
        osc.stop(t + dur);

        return { osc: osc, gain: g, duration: dur };
    }

    // summary-zoneResult
    // Triangle blip, pitch based on quality, 0.06s
    function _summaryZoneResult(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.06;
        var quality = (opts && opts.quality) || 'stable';
        var freq = quality === 'exceeded' ? 277 : (quality === 'failed' ? 165 : 220);

        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(busGain);
        osc.start(t);
        osc.stop(t + dur + 0.01);

        return { osc: osc, gain: g, duration: dur };
    }

    // summary-bonusReveal
    // Ascending Authority Fifth + sparkle, 0.3s
    function _summaryBonusReveal(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.3;

        // Sawtooths 110->165Hz
        var saw1 = audioCtx.createOscillator();
        var saw1G = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw1.frequency.setValueAtTime(110, t);
        saw1G.gain.setValueAtTime(0.001, t);
        saw1G.gain.linearRampToValueAtTime(0.04, t + 0.02);
        saw1G.gain.setValueAtTime(0.04, t + 0.15);
        saw1G.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        saw1.connect(saw1G);
        saw1G.connect(busGain);

        var saw2 = audioCtx.createOscillator();
        var saw2G = audioCtx.createGain();
        saw2.type = 'sawtooth';
        saw2.frequency.setValueAtTime(165, t);
        saw2G.gain.setValueAtTime(0.001, t);
        saw2G.gain.linearRampToValueAtTime(0.04, t + 0.02);
        saw2G.gain.setValueAtTime(0.04, t + 0.15);
        saw2G.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        saw2.connect(saw2G);
        saw2G.connect(busGain);

        // Sparkle at 660Hz delayed 0.1s
        var sparkle = audioCtx.createOscillator();
        var sparkleG = audioCtx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(660, t);
        sparkleG.gain.setValueAtTime(0.0, t);
        sparkleG.gain.setValueAtTime(0.03, t + 0.1);
        sparkleG.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        sparkle.connect(sparkleG);
        sparkleG.connect(busGain);

        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        sparkle.start(t + 0.1); sparkle.stop(t + dur);

        return { osc: saw1, gain: saw1G, duration: dur };
    }

    // summary-penaltyReveal
    // Descending square fifth + sub-bass pulse, 0.2s
    function _summaryPenaltyReveal(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.2;

        // Descending square 220->165Hz
        var sq = audioCtx.createOscillator();
        var sqG = audioCtx.createGain();
        sq.type = 'square';
        sq.frequency.setValueAtTime(220, t);
        sq.frequency.linearRampToValueAtTime(165, t + 0.15);
        sqG.gain.setValueAtTime(0.05, t);
        sqG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sq.connect(sqG);
        sqG.connect(busGain);

        // Sub-bass flash 55Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(55, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.06, t + 0.01);
        subG.gain.setValueAtTime(0.06, t + 0.1);
        subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        sub.connect(subG);
        subG.connect(busGain);

        sq.start(t); sq.stop(t + dur);
        sub.start(t); sub.stop(t + dur);

        return { osc: sq, gain: sqG, duration: dur };
    }

    // summary-directorComment
    // Sub-bass + typewriter base drone, ~1.0s
    function _summaryDirectorComment(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = (opts && opts.duration) || 1.0;

        // Sub-bass at 50Hz with 0.3Hz tremolo
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(50, t);
        subG.gain.setValueAtTime(0.0, t);
        subG.gain.linearRampToValueAtTime(0.04, t + 0.2);
        subG.gain.setValueAtTime(0.04, t + dur - 0.2);
        subG.gain.linearRampToValueAtTime(0.0, t + dur);

        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.3, t);
        lfoG.gain.setValueAtTime(0.01, t);
        lfo.connect(lfoG);
        lfoG.connect(subG.gain);

        sub.connect(subG);
        subG.connect(busGain);

        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);

        return { osc: sub, gain: subG, duration: dur };
    }

    // summary-optionSelect
    // Two-note ascending confirmation 165->220Hz, 0.15s (reuses fleet order style)
    function _summaryOptionSelect(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.15;

        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(165, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.04, t + 0.005);
        g1.gain.setValueAtTime(0.04, t + 0.06);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc1.connect(g1);
        g1.connect(busGain);

        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(220, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.001, t + 0.074);
        g2.gain.linearRampToValueAtTime(0.04, t + 0.08);
        g2.gain.setValueAtTime(0.04, t + 0.13);
        g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc2.connect(g2);
        g2.connect(busGain);

        osc1.start(t); osc1.stop(t + 0.08);
        osc2.start(t + 0.075); osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // summary-gradeS
    // Full Authority chord ascending + crystalline harmonics + sub-bass, 1.5s
    function _summaryGradeS(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 1.5;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(1.0, t);
        master.connect(busGain);

        // Sub triangle at 55Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(55, t);
        subG.gain.setValueAtTime(0.001, t);
        subG.gain.linearRampToValueAtTime(0.07, t + 0.05);
        subG.gain.setValueAtTime(0.07, t + 1.0);
        subG.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        sub.connect(subG);
        subG.connect(master);

        // Sequential sawtooths: 110, 165, 220, 330Hz at 0.15s intervals
        var sawNotes = [110, 165, 220, 330];
        var firstOsc = null;
        for (var i = 0; i < sawNotes.length; i++) {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(sawNotes[i], t);
            var nStart = t + i * 0.15;
            g.gain.setValueAtTime(0.0, t);
            g.gain.setValueAtTime(0.001, nStart);
            g.gain.linearRampToValueAtTime(0.05, nStart + 0.03);
            g.gain.setValueAtTime(0.05, nStart + 0.3);
            g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.connect(g);
            g.connect(master);
            osc.start(nStart);
            osc.stop(t + dur);
            if (i === 0) firstOsc = osc;
        }

        // 1Hz tremolo on sawtooths via master
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(1, t);
        lfoG.gain.setValueAtTime(0.01, t);
        lfo.connect(lfoG);
        lfoG.connect(master.gain);

        // Crystalline harmonics at 880Hz and 1320Hz, delayed 0.4s
        var crys1 = audioCtx.createOscillator();
        var crys1G = audioCtx.createGain();
        crys1.type = 'sine';
        crys1.frequency.setValueAtTime(880, t);
        crys1G.gain.setValueAtTime(0.0, t);
        crys1G.gain.setValueAtTime(0.001, t + 0.4);
        crys1G.gain.linearRampToValueAtTime(0.03, t + 0.45);
        crys1G.gain.setValueAtTime(0.03, t + 1.0);
        crys1G.gain.exponentialRampToValueAtTime(0.001, t + dur);
        crys1.connect(crys1G);
        crys1G.connect(master);

        var crys2 = audioCtx.createOscillator();
        var crys2G = audioCtx.createGain();
        crys2.type = 'sine';
        crys2.frequency.setValueAtTime(1320, t);
        crys2G.gain.setValueAtTime(0.0, t);
        crys2G.gain.setValueAtTime(0.001, t + 0.4);
        crys2G.gain.linearRampToValueAtTime(0.03, t + 0.45);
        crys2G.gain.setValueAtTime(0.03, t + 1.0);
        crys2G.gain.exponentialRampToValueAtTime(0.001, t + dur);
        crys2.connect(crys2G);
        crys2G.connect(master);

        sub.start(t); sub.stop(t + dur);
        lfo.start(t); lfo.stop(t + dur);
        crys1.start(t + 0.4); crys1.stop(t + dur);
        crys2.start(t + 0.4); crys2.stop(t + dur);

        return { osc: firstOsc, gain: master, duration: dur };
    }

    // summary-complete
    // Descending Authority Fifth + soft noise whoosh, 0.5s
    function _summaryComplete(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.5;

        // Descending sawtooths
        var saw1 = audioCtx.createOscillator();
        var saw2 = audioCtx.createOscillator();
        var sawFilter = audioCtx.createBiquadFilter();
        sawFilter.type = 'lowpass';
        sawFilter.frequency.setValueAtTime(800, t);
        var sawG = audioCtx.createGain();
        saw1.type = 'sawtooth';
        saw2.type = 'sawtooth';
        saw1.frequency.setValueAtTime(165, t);
        saw1.frequency.linearRampToValueAtTime(110, t + 0.3);
        saw2.frequency.setValueAtTime(247, t);
        saw2.frequency.linearRampToValueAtTime(165, t + 0.3);
        sawG.gain.setValueAtTime(0.04, t);
        sawG.gain.setValueAtTime(0.04, t + 0.3);
        sawG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        saw1.connect(sawFilter);
        saw2.connect(sawFilter);
        sawFilter.connect(sawG);
        sawG.connect(busGain);

        // Noise whoosh through lowpass 800->200Hz
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(800, t);
        nFilter.frequency.exponentialRampToValueAtTime(200, t + dur);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.001, t);
        noiseG.gain.linearRampToValueAtTime(0.02, t + 0.05);
        noiseG.gain.setValueAtTime(0.02, t + 0.3);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(busGain);

        saw1.start(t); saw1.stop(t + dur);
        saw2.start(t); saw2.stop(t + dur);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: saw1, gain: sawG, duration: dur };
    }

    // =========================================
    // CATEGORY 10: CREW (2)
    // =========================================

    // crew-moraleTierChange
    // Triangle two-note interval, ascending or descending. opts.improving = true/false
    function _crewMoraleTierChange(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.15;
        var improving = opts && opts.improving;

        var freq1 = improving ? 220 : 277;
        var freq2 = improving ? 277 : 220;

        var osc1 = audioCtx.createOscillator();
        var g1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq1, t);
        g1.gain.setValueAtTime(0.001, t);
        g1.gain.linearRampToValueAtTime(0.035, t + 0.005);
        g1.gain.setValueAtTime(0.035, t + 0.06);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc1.connect(g1);
        g1.connect(busGain);

        var osc2 = audioCtx.createOscillator();
        var g2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq2, t);
        g2.gain.setValueAtTime(0.0, t);
        g2.gain.setValueAtTime(0.035, t + 0.075);
        g2.gain.setValueAtTime(0.035, t + 0.13);
        g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc2.connect(g2);
        g2.connect(busGain);

        osc1.start(t); osc1.stop(t + 0.08);
        osc2.start(t + 0.075); osc2.stop(t + dur);

        return { osc: osc1, gain: g1, duration: dur };
    }

    // crew-burnout
    // Descending triangle wail with vibrato + noise crackle, 0.5s
    function _crewBurnout(busGain, opts) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;
        var dur = 0.5;

        // Descending triangle 330->165Hz with 3Hz vibrato
        var tri = audioCtx.createOscillator();
        var triG = audioCtx.createGain();
        tri.type = 'triangle';
        tri.frequency.setValueAtTime(330, t);
        tri.frequency.linearRampToValueAtTime(165, t + 0.4);
        triG.gain.setValueAtTime(0.001, t);
        triG.gain.linearRampToValueAtTime(0.05, t + 0.02);
        triG.gain.setValueAtTime(0.05, t + 0.35);
        triG.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var vib = audioCtx.createOscillator();
        var vibG = audioCtx.createGain();
        vib.type = 'sine';
        vib.frequency.setValueAtTime(3, t);
        vibG.gain.setValueAtTime(8, t);
        vib.connect(vibG);
        vibG.connect(tri.frequency);

        tri.connect(triG);
        triG.connect(busGain);

        // Noise crackle through bandpass 400Hz Q=2
        var noiseBuf = _getNoiseBuffer(dur);
        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.setValueAtTime(400, t);
        nFilter.Q.setValueAtTime(2, t);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.001, t);
        noiseG.gain.linearRampToValueAtTime(0.02, t + 0.05);
        noiseG.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(busGain);

        tri.start(t); tri.stop(t + dur);
        vib.start(t); vib.stop(t + dur);
        noiseSrc.start(t); noiseSrc.stop(t + dur);

        return { osc: tri, gain: triG, duration: dur };
    }

    // -----------------------------------------
    // POLYPHONY POOL MANAGEMENT
    // -----------------------------------------

    function _getBus(busName) {
        if (busName === 'ambient') return _ambientBus;
        if (busName === 'ui') return _uiBus;
        return _sfxBus;
    }

    function _getPool(busName) {
        if (busName === 'ui') return _uiPool;
        return _sfxPool;
    }

    function _getPoolMax(busName) {
        if (busName === 'ui') return MAX_UI_POOL;
        return MAX_SFX_POOL;
    }

    function _cleanPool(pool) {
        // Remove entries whose oscillators have ended
        var now = audioCtx.currentTime;
        for (var i = pool.length - 1; i >= 0; i--) {
            var entry = pool[i];
            if (now > entry.endTime) {
                pool.splice(i, 1);
            }
        }
    }

    function _evict(pool, incomingPriority) {
        // Find lowest-priority, oldest entry that is <= incoming priority
        var bestIdx = -1;
        var bestPriority = incomingPriority + 1;
        var bestStart = Infinity;

        for (var i = 0; i < pool.length; i++) {
            var e = pool[i];
            if (e.priority < bestPriority ||
                (e.priority === bestPriority && e.startTime < bestStart)) {
                bestPriority = e.priority;
                bestStart = e.startTime;
                bestIdx = i;
            }
        }

        if (bestIdx >= 0 && bestPriority <= incomingPriority) {
            var evicted = pool[bestIdx];
            try {
                evicted.gain.gain.setValueAtTime(0, audioCtx.currentTime);
                evicted.osc.stop(audioCtx.currentTime + 0.01);
            } catch (e) {}
            pool.splice(bestIdx, 1);
            return true;
        }
        return false;
    }

    // -----------------------------------------
    // PUBLIC: play(name, opts?)
    // -----------------------------------------

    function play(name, opts) {
        if (!_initialized || !audioCtx) return;

        var def = _sounds[name];
        if (!def) return;

        var pool = _getPool(def.bus);
        var maxPool = _getPoolMax(def.bus);
        var busGain = _getBus(def.bus);

        // Clean expired entries
        _cleanPool(pool);

        // Check pool capacity
        if (pool.length >= maxPool) {
            if (def.priority >= PRIORITY.HIGH) {
                // HIGH priority always plays — evict something
                if (!_evict(pool, def.priority)) return;
            } else if (def.priority === PRIORITY.MEDIUM) {
                // MEDIUM can evict LOW
                if (!_evict(pool, def.priority)) return;
            } else {
                // LOW is silently dropped
                return;
            }
        }

        // Synthesize
        var result = def.fn(busGain, opts || {});
        if (!result) return;

        var t = audioCtx.currentTime;
        pool.push({
            osc: result.osc,
            gain: result.gain,
            priority: def.priority,
            startTime: t,
            endTime: t + (result.duration || 0.5),
            name: name
        });
    }

    // -----------------------------------------
    // PUBLIC: startLoop(name) / stopLoop(name)
    // -----------------------------------------

    // Loop registry: name -> factory function
    var _loopFactories = {};

    function _registerLoops() {
        _loopFactories['commandAmbient']   = _commandAmbientLoop;
        _loopFactories['zoneActivity']     = _zoneActivityLoop;
        _loopFactories['driftStatic']      = _driftStaticLoop;
        _loopFactories['overrideTension']  = _overrideTensionLoop;
        _loopFactories['directorPresence'] = _directorPresenceLoop;
        _loopFactories['overrideHum']      = _overrideHumLoop;
        _loopFactories['zoneEmergency']    = _zoneEmergencyLoop;
        _loopFactories['zoneDriftWarning'] = _zoneDriftWarningLoop;
        _loopFactories['resInFlight']      = _resInFlightLoop;
    }

    // =========================================
    // CATEGORY 11: AMBIENT / LOOP FACTORIES (9)
    // =========================================

    // ambient-commandHum
    // Triangle 55Hz + detuned sawtooth 57Hz, very slow LFO
    function _commandAmbientLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(0.001, t);
        master.gain.linearRampToValueAtTime(1.0, t + 2.0);
        master.connect(busGain);

        // Triangle at 55Hz
        var tri = audioCtx.createOscillator();
        var triG = audioCtx.createGain();
        tri.type = 'triangle';
        tri.frequency.setValueAtTime(55, t);
        triG.gain.setValueAtTime(0.012, t);
        tri.connect(triG);
        triG.connect(master);

        // Detuned sawtooth at 57Hz
        var saw = audioCtx.createOscillator();
        var sawG = audioCtx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(57, t);
        sawG.gain.setValueAtTime(0.006, t);
        saw.connect(sawG);
        sawG.connect(master);

        // 0.1Hz LFO on triangle gain
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, t);
        lfoG.gain.setValueAtTime(0.003, t);
        lfo.connect(lfoG);
        lfoG.connect(triG.gain);

        tri.start(t);
        saw.start(t);
        lfo.start(t);

        return { osc: tri, gain: master, lfo: lfo };
    }

    // ambient-zoneActivity
    // Filtered noise, bandpass 500Hz Q=0.5
    function _zoneActivityLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        // Create a long noise buffer for looping
        var sampleRate = audioCtx.sampleRate;
        var length = sampleRate * 2; // 2 second buffer
        var buffer = audioCtx.createBuffer(1, length, sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, t);
        filter.Q.setValueAtTime(0.5, t);

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.002, t);

        noiseSrc.connect(filter);
        filter.connect(gain);
        gain.connect(busGain);

        noiseSrc.start(t);

        return { osc: noiseSrc, gain: gain };
    }

    // ambient-driftStatic
    // Filtered noise with wobbling bandpass center
    function _driftStaticLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var sampleRate = audioCtx.sampleRate;
        var length = sampleRate * 2;
        var buffer = audioCtx.createBuffer(1, length, sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.Q.setValueAtTime(1, t);

        // 0.3Hz LFO on filter center frequency
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.3, t);
        lfoG.gain.setValueAtTime(200, t);
        lfo.connect(lfoG);
        lfoG.connect(filter.frequency);

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.003, t + 0.5);

        noiseSrc.connect(filter);
        filter.connect(gain);
        gain.connect(busGain);

        noiseSrc.start(t);
        lfo.start(t);

        return { osc: noiseSrc, gain: gain, lfo: lfo };
    }

    // ambient-overrideTension
    // Sub-bass sine at 35Hz with very slow pulse
    function _overrideTensionLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(35, t);
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.02, t + 1.0);

        // 0.25Hz LFO on gain
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.25, t);
        lfoG.gain.setValueAtTime(0.0075, t);
        lfo.connect(lfoG);
        lfoG.connect(gain.gain);

        osc.connect(gain);
        gain.connect(busGain);

        osc.start(t);
        lfo.start(t);

        return { osc: osc, gain: gain, lfo: lfo };
    }

    // ambient-directorPresence
    // Sub-bass 40Hz + very faint high square harmonic
    function _directorPresenceLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(0.0, t);
        master.gain.linearRampToValueAtTime(1.0, t + 1.5);
        master.connect(busGain);

        // Sub-bass at 40Hz
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(40, t);
        subG.gain.setValueAtTime(0.015, t);

        // 0.15Hz breathing LFO on sub gain
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, t);
        lfoG.gain.setValueAtTime(0.005, t);
        lfo.connect(lfoG);
        lfoG.connect(subG.gain);

        sub.connect(subG);
        subG.connect(master);

        // High square harmonic at 1000Hz through narrow bandpass
        var harm = audioCtx.createOscillator();
        var harmFilter = audioCtx.createBiquadFilter();
        harmFilter.type = 'bandpass';
        harmFilter.frequency.setValueAtTime(1000, t);
        harmFilter.Q.setValueAtTime(8, t);
        var harmG = audioCtx.createGain();
        harm.type = 'square';
        harm.frequency.setValueAtTime(1000, t);
        harmG.gain.setValueAtTime(0.005, t);
        harm.connect(harmFilter);
        harmFilter.connect(harmG);
        harmG.connect(master);

        sub.start(t);
        harm.start(t);
        lfo.start(t);

        return { osc: sub, gain: master, lfo: lfo };
    }

    // override-activeHum
    // Sawtooth 82Hz through lowpass + sub-bass 41Hz with pulse LFO
    function _overrideHumLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(0.0, t);
        master.gain.linearRampToValueAtTime(1.0, t + 0.5);
        master.connect(busGain);

        // Sawtooth at 82Hz through lowpass 400Hz
        var saw = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        var sawG = audioCtx.createGain();
        saw.type = 'sawtooth';
        saw.frequency.setValueAtTime(82, t);
        sawG.gain.setValueAtTime(0.04, t);

        // 3Hz slow filter sweep LFO
        var filterLfo = audioCtx.createOscillator();
        var filterLfoG = audioCtx.createGain();
        filterLfo.type = 'sine';
        filterLfo.frequency.setValueAtTime(3, t);
        filterLfoG.gain.setValueAtTime(100, t);
        filterLfo.connect(filterLfoG);
        filterLfoG.connect(filter.frequency);

        saw.connect(filter);
        filter.connect(sawG);
        sawG.connect(master);

        // Sub-bass at 41Hz with 0.5Hz pulse
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(41, t);
        subG.gain.setValueAtTime(0.03, t);

        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5, t);
        lfoG.gain.setValueAtTime(0.015, t);
        lfo.connect(lfoG);
        lfoG.connect(subG.gain);

        sub.connect(subG);
        subG.connect(master);

        saw.start(t);
        sub.start(t);
        lfo.start(t);
        filterLfo.start(t);

        return { osc: saw, gain: master, lfo: lfo };
    }

    // zone-stateEmergency loop
    // Square alternating 250/400Hz at 8Hz + noise + sub-bass
    function _zoneEmergencyLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var master = audioCtx.createGain();
        master.gain.setValueAtTime(0.0, t);
        master.gain.linearRampToValueAtTime(0.25, t + 0.3);
        master.connect(busGain);

        // Soft triangle pulse alternating 250/330Hz at 3Hz
        var sq = audioCtx.createOscillator();
        sq.type = 'triangle';
        sq.frequency.setValueAtTime(290, t);

        // 3Hz LFO on frequency — gentle pulse, not telephone trill
        var freqLfo = audioCtx.createOscillator();
        var freqLfoG = audioCtx.createGain();
        freqLfo.type = 'sine';
        freqLfo.frequency.setValueAtTime(3, t);
        freqLfoG.gain.setValueAtTime(40, t); // +-40Hz from 290 = 250-330
        freqLfo.connect(freqLfoG);
        freqLfoG.connect(sq.frequency);

        var sqG = audioCtx.createGain();
        sqG.gain.setValueAtTime(0.015, t);

        // 3Hz amplitude modulation — gentle throb
        var ampLfo = audioCtx.createOscillator();
        var ampLfoG = audioCtx.createGain();
        ampLfo.type = 'sine';
        ampLfo.frequency.setValueAtTime(3, t);
        ampLfoG.gain.setValueAtTime(0.005, t);
        ampLfo.connect(ampLfoG);
        ampLfoG.connect(sqG.gain);

        sq.connect(sqG);
        sqG.connect(master);

        // Noise through lowpass 400Hz — very subtle
        var sampleRate = audioCtx.sampleRate;
        var length = sampleRate * 2;
        var buffer = audioCtx.createBuffer(1, length, sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

        var noiseSrc = audioCtx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;
        var nFilter = audioCtx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(400, t);
        var noiseG = audioCtx.createGain();
        noiseG.gain.setValueAtTime(0.006, t);
        noiseSrc.connect(nFilter);
        nFilter.connect(noiseG);
        noiseG.connect(master);

        // Sub-bass at 45Hz — felt not heard
        var sub = audioCtx.createOscillator();
        var subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(45, t);
        subG.gain.setValueAtTime(0.012, t);
        sub.connect(subG);
        subG.connect(master);

        sq.start(t);
        freqLfo.start(t);
        ampLfo.start(t);
        noiseSrc.start(t);
        sub.start(t);

        return { osc: sq, gain: master, lfo: freqLfo };
    }

    // zone-driftWarning loop
    // Triangle alternating 165/200Hz at 2Hz
    function _zoneDriftWarningLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(182.5, t); // center

        // 2Hz LFO for frequency alternation
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(2, t);
        lfoG.gain.setValueAtTime(17.5, t); // +-17.5 from 182.5 = 165-200
        lfo.connect(lfoG);
        lfoG.connect(osc.frequency);

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.3);

        osc.connect(gain);
        gain.connect(busGain);

        osc.start(t);
        lfo.start(t);

        return { osc: osc, gain: gain, lfo: lfo };
    }

    // res-inFlight loop
    // Very soft sine oscillation at 277Hz +-10Hz
    function _resInFlightLoop(busGain) {
        if (!audioCtx) return null;
        var t = audioCtx.currentTime;

        var osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(277, t);

        // 2Hz wobble on frequency
        var lfo = audioCtx.createOscillator();
        var lfoG = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2, t);
        lfoG.gain.setValueAtTime(10, t);
        lfo.connect(lfoG);
        lfoG.connect(osc.frequency);

        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.015, t + 0.2);

        osc.connect(gain);
        gain.connect(busGain);

        osc.start(t);
        lfo.start(t);

        return { osc: osc, gain: gain, lfo: lfo };
    }

    // -----------------------------------------
    // LOOP START / STOP
    // -----------------------------------------

    function startLoop(name) {
        if (!_initialized || !audioCtx) return;
        if (_loopsSilenced) return;     // blocked after stopAllLoops
        if (_activeLoops[name]) return; // already running

        var factory = _loopFactories[name];
        if (!factory) return;

        var result = factory(_ambientBus);
        if (result) {
            _activeLoops[name] = result;
        }
    }

    function stopLoop(name, fadeTime) {
        if (!audioCtx) return;
        var loop = _activeLoops[name];
        if (!loop) return;

        var ft = fadeTime || 0.1;
        var t = audioCtx.currentTime;

        try {
            loop.gain.gain.cancelScheduledValues(t);
            loop.gain.gain.setValueAtTime(loop.gain.gain.value, t);
            loop.gain.gain.setTargetAtTime(0.001, t, ft / 3);
            loop.osc.stop(t + ft + 0.05);
            if (loop.lfo) loop.lfo.stop(t + ft + 0.05);
        } catch (e) {}

        delete _activeLoops[name];
    }

    function stopAllLoops(fadeTime) {
        _loopsSilenced = true;
        var names = Object.keys(_activeLoops);
        for (var i = 0; i < names.length; i++) {
            stopLoop(names[i], fadeTime);
        }
    }

    function unsilenceLoops() {
        _loopsSilenced = false;
    }

    // -----------------------------------------
    // PUBLIC: setMasterVolume / duck / unduck
    // -----------------------------------------

    function setMasterVolume(level) {
        _masterVolume = Math.max(0, Math.min(1, level));
        if (_masterGain && audioCtx && !_isDucked) {
            _masterGain.gain.setTargetAtTime(_masterVolume, audioCtx.currentTime, 0.02);
        }
        if (!_isDucked) {
            _preDuckVolume = _masterVolume;
        }
    }

    function duck(level, rampTime) {
        if (!_masterGain || !audioCtx) return;
        if (!_isDucked) {
            _preDuckVolume = _masterVolume;
        }
        _isDucked = true;
        var t = audioCtx.currentTime;
        _masterGain.gain.cancelScheduledValues(t);
        _masterGain.gain.setValueAtTime(_masterGain.gain.value, t);
        _masterGain.gain.linearRampToValueAtTime(
            Math.max(0.001, _preDuckVolume * level), t + (rampTime || 0.3)
        );
    }

    function unduck(rampTime) {
        if (!_masterGain || !audioCtx || !_isDucked) return;
        _isDucked = false;
        var t = audioCtx.currentTime;
        _masterGain.gain.cancelScheduledValues(t);
        _masterGain.gain.setValueAtTime(_masterGain.gain.value, t);
        _masterGain.gain.linearRampToValueAtTime(_preDuckVolume, t + (rampTime || 0.5));
    }

    // -----------------------------------------
    // PUBLIC: setZoneScale(zoneCount)
    // Adjusts _sfxBus gain inversely with zone count
    // -----------------------------------------

    function setZoneScale(zoneCount) {
        if (!_sfxBus || !audioCtx) return;
        var count = Math.max(1, zoneCount || 1);
        var scale = 1.0 / Math.pow(count, 0.55);
        _sfxBus.gain.setTargetAtTime(scale, audioCtx.currentTime, 0.1);
    }

    // -----------------------------------------
    // PUBLIC: dispose()
    // -----------------------------------------

    function dispose() {
        stopAllLoops(0.05);

        // Kill all pooled sounds
        var allPools = [_sfxPool, _uiPool];
        for (var p = 0; p < allPools.length; p++) {
            var pool = allPools[p];
            for (var i = 0; i < pool.length; i++) {
                try { pool[i].osc.stop(0); } catch (e) {}
            }
            pool.length = 0;
        }

        // Disconnect buses
        try { if (_uiBus) _uiBus.disconnect(); } catch (e) {}
        try { if (_sfxBus) _sfxBus.disconnect(); } catch (e) {}
        try { if (_ambientBus) _ambientBus.disconnect(); } catch (e) {}
        try { if (_masterGain) _masterGain.disconnect(); } catch (e) {}

        _masterGain = null;
        _ambientBus = null;
        _sfxBus = null;
        _uiBus = null;
        _activeLoops = {};
        _initialized = false;
    }

    // -----------------------------------------
    // BOOTSTRAP LOOP REGISTRY
    // -----------------------------------------
    _registerLoops();

    // -----------------------------------------
    // PUBLIC API
    // -----------------------------------------

    return {
        PRIORITY: PRIORITY,
        init: init,
        play: play,
        startLoop: startLoop,
        stopLoop: stopLoop,
        stopAllLoops: stopAllLoops,
        unsilenceLoops: unsilenceLoops,
        setMasterVolume: setMasterVolume,
        duck: duck,
        unduck: unduck,
        setZoneScale: setZoneScale,
        dispose: dispose,

        // Exposed for command-boot.js and other exceptions
        // that need direct tone access through the bus graph
        playTone: function (frequency, duration, volume, type) {
            if (!_initialized || !audioCtx) return;
            _playTone(_uiBus, frequency, duration || 0.1, type || 'sine', volume || 0.1, true);
        }
    };

})();
