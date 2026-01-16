# High Score System Followup Implementation Plan

## Overview

Implement two UX improvements identified in the high score system followup investigation:
1. Change title screen to require space key (instead of any key) to start
2. Return to title screen after high score name entry (instead of game over screen)

## Current State Analysis

The high score system is fully implemented but has two minor UX issues:
- Title screen accepts any key to start, which can lead to accidental game starts
- After submitting a high score, players go to the game over screen instead of seeing their new entry on the leaderboard

### Key Discoveries:
- Title screen text at `js/game.js:3406` says "Press any key to get started"
- Title screen key handler at `js/game.js:656-657` calls `startGame()` on any keydown
- Post high-score submission at `js/game.js:644` sets `gameState = 'GAME_OVER'`

## Desired End State

After implementation:
1. Title screen displays "Press SPACE to start"
2. Only the space key starts the game from the title screen
3. After entering a high score name, players return to the title screen where they can see the leaderboard with their new entry
4. The leaderboard is refreshed after submission so the new entry appears immediately

### Verification:
- Space key starts game from title screen
- Other keys (letters, arrows, etc.) do not start game from title screen
- After high score submission, player sees title screen with updated leaderboard
- New high score entry is visible in the leaderboard immediately

## What We're NOT Doing

- Changing the game over screen behavior (Enter still restarts from there)
- Adding any new visual effects or animations
- Modifying the high score submission logic itself

## Implementation Approach

This is a simple two-edit change to the existing keydown handler and render function.

## Phase 1: Title Screen Space Key Requirement

### Overview
Update the title screen to only start the game when the space key is pressed.

### Changes Required:

#### 1.1 Update Title Screen Text

**File**: `js/game.js`
**Line**: 3406
**Changes**: Change the instruction text from "Press any key" to "Press SPACE"

Current:
```javascript
ctx.fillText('Press any key to get started', canvas.width / 2, canvas.height - 150);
```

New:
```javascript
ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height - 150);
```

#### 1.2 Update Title Screen Key Handler

**File**: `js/game.js`
**Lines**: 656-657
**Changes**: Add space key check before starting game

Current:
```javascript
if (gameState === 'TITLE') {
    startGame();
}
```

New:
```javascript
if (gameState === 'TITLE' && e.code === 'Space') {
    startGame();
}
```

### Success Criteria:

#### Automated Verification:
- [ ] No JavaScript console errors on page load
- [ ] Game loads and displays title screen

#### Manual Verification:
- [ ] Title screen shows "Press SPACE to start"
- [ ] Pressing space key starts the game
- [ ] Pressing other keys (letters, arrows, enter) does NOT start the game

---

## Phase 2: Return to Title After High Score Entry

### Overview
After submitting a high score name, return to the title screen instead of the game over screen so players can immediately see their entry on the leaderboard.

### Changes Required:

#### 2.1 Update Post-Submission State Transition

**File**: `js/game.js`
**Line**: 644
**Changes**: Change state transition from GAME_OVER to TITLE

Current:
```javascript
submitScore(name).then(rank => {
    newHighScoreRank = rank;
    gameState = 'GAME_OVER';
    fetchLeaderboard(); // Refresh leaderboard after submission
});
```

New:
```javascript
submitScore(name).then(rank => {
    newHighScoreRank = rank;
    gameState = 'TITLE';
    fetchLeaderboard(); // Refresh leaderboard after submission
});
```

### Success Criteria:

#### Automated Verification:
- [ ] No JavaScript console errors during gameplay
- [ ] No JavaScript console errors during name entry

#### Manual Verification:
- [ ] After entering high score name and pressing Enter, title screen appears
- [ ] Leaderboard on title screen shows the newly submitted score
- [ ] Player can press SPACE to start a new game from the title screen

---

## Testing Strategy

### Manual Testing Steps:
1. Load game, verify title screen shows "Press SPACE to start"
2. Press various keys (A-Z, Enter, arrows) - game should NOT start
3. Press Space - game should start
4. Play game until game over with a qualifying score
5. Enter name and press Enter
6. Verify title screen appears with your new score in leaderboard
7. Press Space to start new game
8. Play game with non-qualifying score
9. Verify game over screen appears (no name entry)
10. Press Enter to restart - verify game starts

## References

- Research document: `thoughts/shared/research/2026-01-15-high-score-system.md`
- Original implementation plan: `thoughts/shared/plans/2026-01-14-high-score-system.md`
