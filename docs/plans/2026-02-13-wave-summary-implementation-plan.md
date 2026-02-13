# Wave Summary HUD Redesign — Implementation Plan

## Edit Sequence (bottom-to-top to prevent line-shift cascading)

### Edit 8: Sound Fix — SFX.countdownTick (line 1394-1395)
Replace the final resolving tone frequencies for V→I cadence:
- `playTone(400, 0.15, 'triangle', 0.12)` → `playTone(392, 0.15, 'triangle', 0.12)` (G4)
- `playTone(200, 0.2, 'sine', 0.06)` → `playTone(196, 0.2, 'sine', 0.06)` (G3)

### Edit 1: Replace renderWaveSummary() (lines 22592-22904)
Complete function replacement. See design spec for full details.

### Edit 2: Replace renderTargetRow() (lines 22263-22322)
Add diamond indicators, status colors, type labels, mini hex-decode on counts.

### Edit 3: Modify updateWaveSummary() — insert after line 22148
Add border trace, bracket, panel fill, hex-decode, typewriter animation updates.

### Edit 4: Modify finishWaveSummaryAnimations() — insert after line 22112
Add new field resets for skip-to-end.

### Edit 5: Modify startWaveSummary() (lines 22032-22087)
Add borderTraceEnd timing, 6 new state fields.

### Edit 6: Replace WAVE_SUMMARY_TIMING (lines 21888-21897)
Update timing values, add borderTrace field.

### Edit 7: Insert new helper functions before renderRainbowBouncyText (~line 21630)
5 new functions: renderHexDecodeText, renderDotLeader, renderSystemCheckLine, renderCornerBrackets, renderPanelBorderTrace.

## Key Reusable Functions (do NOT modify these)
- renderNGEPanel(x, y, w, h, opts) at line 13196
- renderNGEBar(x, y, w, h, percent, color, opts) at line 13383
- renderNGEIndicator(x, y, shape, color, mode, opts) at line 13638
- easeOutCubic(t) at line 14596
- hexToRgb(hex) at line 13372

## Design Spec
Full visual spec at: /Users/mfelix/code/alien-abductorama/docs/plans/2026-02-13-wave-summary-hud-redesign.md
