# Phase 2 Sound Engine Architecture

## Overview

`CommandSFX` is Phase 2's independent sound system. It shares the Web Audio API `audioCtx` with Phase 1 but maintains its own gain structure, bus routing, priority management, and polyphony limiting. All synthesized sounds route through a master gain node with three sub-buses (ambient, sfx, ui), enabling independent volume control and ducking for Director transmissions.

## Audio Node Graph

```
audioCtx (shared global from game.js)
  └── CommandSFX._masterGain ─────────────────── [master volume control + duck target]
       ├── CommandSFX._ambientBus ─────────────── [loops, drones, ambient layers]
       │    ├── ambient hum oscillator(s)
       │    └── per-zone ambient layers
       ├── CommandSFX._sfxBus ─────────────────── [one-shot event sounds]
       │    └── individual sound gain nodes (pooled, max 8)
       └── CommandSFX._uiBus ──────────────────── [UI interaction sounds]
            └── individual UI sound gain nodes (pooled, max 4)
```

## Global Object: `CommandSFX`

### Public API

| Method | Description |
|--------|-------------|
| `init()` | Creates gain nodes, connects bus graph. Called once during `initCommandPhase()`. |
| `play(name, opts?)` | Play a one-shot sound by name. Options: `{ priority, bus, volume }`. |
| `startLoop(name)` | Start a named loop on the ambient bus. |
| `stopLoop(name, fadeTime?)` | Stop a named loop with optional fade (default 0.1s). |
| `stopAllLoops(fadeTime?)` | Stop all active loops. |
| `setMasterVolume(level)` | Set master gain (0.0-1.0). |
| `duck(level, rampTime)` | Duck master gain to `level` over `rampTime` seconds. |
| `unduck(rampTime)` | Restore master gain to pre-duck level over `rampTime` seconds. |
| `dispose()` | Disconnect all nodes, stop all sounds, clean up. |

### Priority Levels

```javascript
PRIORITY: { HIGH: 3, MEDIUM: 2, LOW: 1 }
```

- **HIGH (3)**: Always plays. Oldest LOW/MEDIUM sound is evicted if pool is full. Used for: wave start/end, override activation, Director transmission cues.
- **MEDIUM (2)**: Plays if pool is not full, or evicts a LOW sound. Used for: zone state changes, quota events, fleet order confirmations, zone selection.
- **LOW (1)**: Only plays if pool has room. Silently dropped if full. Used for: per-zone ambient details, subtle UI blips, boot panel tones.

### Polyphony Pool

- **SFX bus**: max 8 simultaneous one-shot sounds.
- **UI bus**: max 4 simultaneous one-shot sounds.
- Loops on the ambient bus are unlimited (practically 4-6 max).
- When a pool is full, eviction order: lowest priority first, then oldest first.
- Each pool entry tracks: `{ oscNode, gainNode, priority, startTime, name }`.

## Volume Ducking

When the Director transmits, `command-main.js` calls:
```javascript
CommandSFX.duck(0.4, 0.3);  // Duck to 40% over 300ms
```

When the transmission ends:
```javascript
CommandSFX.unduck(0.5);      // Restore over 500ms
```

Ducking applies to `_masterGain` via `linearRampToValueAtTime`. The pre-duck volume is stored in `_preDuckVolume` so it can be restored. Nested duck calls update the target without stacking.

## Sound Categories (Stubs)

Each category maps a name string to a synthesis function. The actual synthesis is deferred to Task #7 (implementation).

### One-Shot Sounds (sfxBus)
- `waveStart` — ascending tone cluster (HIGH priority)
- `waveEnd` — descending resolution (HIGH priority)
- `overrideActivate` — dramatic power-up sweep (HIGH priority)
- `overrideEnd` — wind-down (HIGH priority)
- `directorTransmit` — incoming transmission ping (HIGH priority)
- `zoneStateChange` — varies by state: stable/stressed/crisis/emergency (MEDIUM)
- `quotaProgress` — subtle progress tick (LOW)
- `quotaMet` — positive confirmation chord (MEDIUM)
- `quotaExceeded` — enhanced confirmation (MEDIUM)

### UI Sounds (uiBus)
- `zoneSelect` — crisp selection click (MEDIUM)
- `fleetOrder` — order confirmation beep (MEDIUM)
- `resourceTransfer` — transfer initiated whoosh (MEDIUM)
- `menuNav` — navigation tick (LOW)
- `bootPanelOnline` — boot completion ping (LOW)

### Loops (ambientBus)
- `commandAmbient` — low drone establishing command presence
- `crisisUndertone` — tension layer when any zone is in crisis/emergency
- `overrideHum` — override mode active buzz

## Integration Points

### command-main.js (primary caller)

```javascript
initCommandPhase()       → CommandSFX.init(), CommandSFX.startLoop('commandAmbient')
updateCommand() BOOT→LIVE → CommandSFX.play('waveStart')
handleCommandInput()     → CommandSFX.play('zoneSelect'), play('fleetOrder'),
                           play('overrideActivate'), play('resourceTransfer')
endCommandWave()         → CommandSFX.play('waveEnd'), CommandSFX.stopAllLoops()
startNextWave()          → CommandSFX.startLoop('commandAmbient')

// Director ducking (in LIVE update):
director.isTransmitting starts → CommandSFX.duck(0.4, 0.3)
director.isTransmitting ends   → CommandSFX.unduck(0.5)

// Zone state change detection (in LIVE update):
zone.state !== zone._prevSoundState → CommandSFX.play('zoneStateChange', {state})
```

### command-boot.js (exception: boot sequence)
```javascript
panel.phase === 'online' → CommandSFX.play('bootPanelOnline')
```
Replaces current `SFX.playTone()` call at line 129-130.

### promotion-cinematic.js (exception: cinematic)
```javascript
// Transition sounds during promotion — called directly
```

## File: `js/phase2/command-sound.js`

### Load Order in index.html

```html
<script src="js/phase2/command-config.js"></script>
<script src="js/phase2/command-sound.js"></script>     <!-- NEW: after config, before everything else -->
<script src="js/phase2/zone-state.js"></script>
...
```

Must load after `command-config.js` (needs COMMAND_CONFIG) and before all other Phase 2 files so it is available when `command-boot.js` and `command-main.js` reference it.

## Design Principles

1. **Fail silently**: If `audioCtx` is null, all methods are no-ops.
2. **No external dependencies**: Pure Web Audio API synthesis, no samples.
3. **Single coupling point**: Only `command-main.js` (plus boot/cinematic exceptions) calls `CommandSFX`.
4. **Resource cleanup**: `dispose()` disconnects everything for clean phase transitions.
5. **Shared AudioContext**: Reuses game.js `audioCtx` — does NOT create a new one.
