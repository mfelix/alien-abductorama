# Agent Scratchpad

## Current Task: Add cheesy background music to UFO Shopping Mall

### Tasks
- [x] Add `SFX.shopMusic` / `startShopMusic()` / `stopShopMusic()` to SFX object
- [x] Call `startShopMusic()` when entering shop state
- [x] Call `stopShopMusic()` when exiting shop state
- [x] Build passes, syntax valid

### Implementation Summary
Added synthesized "elevator muzak" background music for the UFO Shopping Mall:
- **Pad drones**: C3 and G3 sine waves with lowpass filter for warmth
- **Arpeggio**: 16-note pattern cycling C-E-G-C and D-F#-A-D chords, triangle wave
- **Volume**: Master gain at 0.08 with 0.5s fade-in, smooth fade-out on exit
- Music starts in `enterShopFromSummary()`, stops on all 3 exit paths:
  1. Timer expires (updateShop)
  2. Enter key pressed (keyboard handler)
  3. Done button clicked (mouse handler)
