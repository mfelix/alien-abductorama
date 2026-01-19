# Title Screen Changelog Feature Implementation Plan

## Overview

Add an expandable "Recent Updates" changelog section to the title screen that displays the latest changes to the game. Entries are auto-generated from git commits at build time, with support for manual overrides. The changelog shows 1 entry by default with an option to expand and view up to 5 entries.

## Current State Analysis

The title screen is rendered entirely via Canvas 2D API in `js/game.js:3697-3842`. The current vertical layout has space between the animated title (`canvas.height / 3`) and the activity stats (`canvas.height / 2 - 70`) where the changelog can be placed.

### Key Discoveries:
- `formatRelativeDate()` function already exists at `js/game.js:2727-2750` and implements the exact relative date format needed
- Title screen key handler at `js/game.js:641-690` handles state-specific key presses
- Build system is simple file copy with no build-time injection (`package.json:7`)
- No `scripts/` directory exists yet
- All text rendering uses monospace fonts with consistent styling patterns

## Desired End State

After implementation:
1. A "RECENT UPDATES" section appears below the title on the title screen
2. By default, only the latest entry is shown
3. Pressing `U` expands to show up to 5 entries with fading colors for older items
4. A build script auto-populates changelog from git commits (skipping non-user-facing commits)
5. Manual entries can be added via `npm run changelog:add "message"`
6. Messages over 50 characters are auto-truncated with "..."

### Verification:
- Visual: Changelog appears centered below the title, styled consistently with activity stats
- Interactive: Press `U` to toggle expand/collapse, only works on TITLE screen
- Build: Running `npm run build` or `npm run deploy` updates changelog from git
- Manual: Running `npm run changelog:add "Test message"` adds an entry

## What We're NOT Doing

- Worker/API changes - changelog is purely client-side
- Database storage - changelog persists in `changelog.json` committed to repo
- Real-time updates - changelog only updates at build/deploy time
- Click/touch interaction for expand - keyboard only (U key)

## Implementation Approach

The implementation follows the existing patterns in the codebase:
1. Create a build script that generates `js/changelog.js` from `changelog.json`
2. Add the generated JS file to index.html
3. Add rendering logic to `renderTitleScreen()` matching existing text styling
4. Add key handler for the `U` key toggle

## Phase 1: Build Script and Data Files

### Overview
Create the build infrastructure for generating and managing changelog entries.

### Changes Required:

#### 1.1 Create Build Script

**File**: `scripts/changelog.js` (new file)
**Changes**: Create Node.js script for changelog management

```javascript
const fs = require('fs');
const { execSync } = require('child_process');

const CHANGELOG_FILE = 'changelog.json';
const OUTPUT_FILE = 'js/changelog.js';
const MAX_ENTRIES = 5;
const MAX_MESSAGE_LENGTH = 50;

function truncate(msg) {
    if (msg.length <= MAX_MESSAGE_LENGTH) return msg;
    return msg.slice(0, MAX_MESSAGE_LENGTH - 3) + '...';
}

function loadChangelog() {
    if (fs.existsSync(CHANGELOG_FILE)) {
        return JSON.parse(fs.readFileSync(CHANGELOG_FILE, 'utf8'));
    }
    return [];
}

function saveChangelog(entries) {
    fs.writeFileSync(CHANGELOG_FILE, JSON.stringify(entries, null, 2));
}

function writeOutput(entries) {
    const content = `// Auto-generated changelog - do not edit manually
const CHANGELOG = ${JSON.stringify(entries, null, 2)};
`;
    fs.writeFileSync(OUTPUT_FILE, content);
}

const command = process.argv[2];

if (command === 'add') {
    // Manual add: node scripts/changelog.js add "Message here"
    const message = process.argv[3];
    if (!message) {
        console.log('Usage: node scripts/changelog.js add "Your message"');
        process.exit(1);
    }

    const entries = loadChangelog();
    entries.unshift({
        message: truncate(message),
        timestamp: Date.now()
    });

    const trimmed = entries.slice(0, MAX_ENTRIES);
    saveChangelog(trimmed);
    writeOutput(trimmed);
    console.log(`Added: "${truncate(message)}"`);

} else if (command === 'from-git') {
    // Auto from git: node scripts/changelog.js from-git
    const entries = loadChangelog();

    try {
        const gitMessage = execSync('git log -1 --format="%s"', { encoding: 'utf8' }).trim();
        const gitTimestamp = parseInt(execSync('git log -1 --format="%ct"', { encoding: 'utf8' }).trim()) * 1000;

        // Skip if same as current top entry (prevents duplicates on rebuild)
        if (entries.length > 0 && entries[0].message === truncate(gitMessage)) {
            console.log('Changelog already up to date');
            writeOutput(entries);
            return;
        }

        // Skip common non-user-facing commits
        const skipPatterns = [
            /^merge/i,
            /^wip/i,
            /^fixup/i,
            /^squash/i,
            /^revert/i,
            /^chore/i,
            /^docs:/i,
            /^ci:/i,
            /^test:/i
        ];

        if (skipPatterns.some(pattern => pattern.test(gitMessage))) {
            console.log(`Skipping non-user-facing commit: "${gitMessage}"`);
            writeOutput(entries);
            return;
        }

        entries.unshift({
            message: truncate(gitMessage),
            timestamp: gitTimestamp
        });

        const trimmed = entries.slice(0, MAX_ENTRIES);
        saveChangelog(trimmed);
        writeOutput(trimmed);
        console.log(`Added from git: "${truncate(gitMessage)}"`);

    } catch (err) {
        console.log('Could not read git commit, using existing changelog');
        writeOutput(entries);
    }

} else {
    // Just regenerate output from existing changelog.json
    const entries = loadChangelog();
    writeOutput(entries);
    console.log('Regenerated js/changelog.js');
}
```

#### 1.2 Create Initial Changelog Data

**File**: `changelog.json` (new file)
**Changes**: Create empty initial changelog

```json
[]
```

#### 1.3 Update Package Scripts

**File**: `package.json`
**Changes**: Add changelog scripts and update build

```json
{
  "scripts": {
    "changelog:add": "node scripts/changelog.js add",
    "changelog:from-git": "node scripts/changelog.js from-git",
    "changelog:generate": "node scripts/changelog.js",
    "build": "npm run changelog:from-git && mkdir -p dist && cp -r index.html css js assets dist/",
    "dev": "wrangler dev",
    "deploy": "npm run build && wrangler deploy",
    "login": "wrangler login"
  }
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Build script exists and runs: `node scripts/changelog.js`
- [ ] Script generates `js/changelog.js` from `changelog.json`
- [ ] Manual add works: `npm run changelog:add "Test message"`
- [ ] Git import works: `npm run changelog:from-git`
- [ ] Build succeeds: `npm run build`

#### Manual Verification:
- [ ] Verify `js/changelog.js` contains valid JavaScript with CHANGELOG array
- [ ] Verify `changelog.json` persists entries between builds
- [ ] Verify long messages are truncated with "..."

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: HTML and Game Integration

### Overview
Add the generated changelog script to the HTML and implement rendering in the game.

### Changes Required:

#### 2.1 Add Script Include

**File**: `index.html`
**Changes**: Add changelog.js script before game.js

```html
    <script src="js/changelog.js"></script>
    <script src="js/game.js"></script>
</body>
```

#### 2.2 Add Changelog State Variable

**File**: `js/game.js`
**Changes**: Add state variable near other title screen variables (around line 633 after `titleAnimPhase`)

```javascript
let changelogExpanded = false;
```

#### 2.3 Add Key Handler for Expand/Collapse

**File**: `js/game.js`
**Changes**: Add U key handler in the keydown listener, after the TITLE state Space handler (around line 686)

```javascript
    if (gameState === 'TITLE' && e.code === 'Space') {
        startGame();
    } else if (gameState === 'TITLE' && e.code === 'KeyU') {
        changelogExpanded = !changelogExpanded;
    } else if (gameState === 'GAME_OVER' && e.code === 'Enter') {
        startGame();
    }
```

#### 2.4 Add Changelog Rendering Function

**File**: `js/game.js`
**Changes**: Add rendering function before `renderTitleScreen()` (around line 3695)

```javascript
function renderChangelog() {
    if (typeof CHANGELOG === 'undefined' || !CHANGELOG || CHANGELOG.length === 0) {
        return;
    }

    const startY = canvas.height / 3 + 45;
    const lineHeight = 17;
    const maxEntries = 5;
    const maxMessageLength = 50;

    // Header with expand/collapse indicator
    ctx.fillStyle = '#0aa';
    ctx.font = 'bold 12px monospace';
    const hasMore = CHANGELOG.length > 1;
    const indicator = changelogExpanded ? '[-]' : '[+]';
    const headerText = hasMore ? `RECENT UPDATES ${indicator}` : 'RECENT UPDATE';
    ctx.fillText(headerText, canvas.width / 2, startY);

    // Entries
    ctx.font = '13px monospace';
    const entriesToShow = changelogExpanded ? Math.min(CHANGELOG.length, maxEntries) : 1;

    for (let i = 0; i < entriesToShow; i++) {
        const entry = CHANGELOG[i];
        const dateText = formatRelativeDate(entry.timestamp);

        // Truncate message if needed (belt and suspenders - should already be truncated)
        let message = entry.message;
        if (message.length > maxMessageLength) {
            message = message.slice(0, maxMessageLength - 3) + '...';
        }

        const text = `★ ${message} (${dateText})`;

        // Fade older entries
        if (i === 0) {
            ctx.fillStyle = '#888';
        } else if (i === 1) {
            ctx.fillStyle = '#666';
        } else {
            ctx.fillStyle = '#555';
        }

        ctx.fillText(text, canvas.width / 2, startY + 17 + i * lineHeight);
    }

    // Hint for expansion (only in collapsed state with more entries)
    if (!changelogExpanded && CHANGELOG.length > 1) {
        ctx.fillStyle = '#444';
        ctx.font = '11px monospace';
        ctx.fillText('Press U for more', canvas.width / 2, startY + 17 + lineHeight + 5);
    }
}
```

#### 2.5 Call Changelog Rendering from Title Screen

**File**: `js/game.js`
**Changes**: Add call to `renderChangelog()` in `renderTitleScreen()` after the title rendering and before the leaderboard section (around line 3757)

```javascript
    // Reset styles for other text
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';

    // Changelog section
    renderChangelog();

    // Leaderboard
    if (leaderboardLoading) {
```

### Success Criteria:

#### Automated Verification:
- [ ] Build succeeds: `npm run build`
- [ ] No JavaScript errors when loading the page
- [ ] `js/changelog.js` is included in `dist/`

#### Manual Verification:
- [ ] Changelog appears on title screen below the animated title
- [ ] Header shows "RECENT UPDATE" (singular) with 1 entry, "RECENT UPDATES [+]" with multiple
- [ ] Press U toggles expand/collapse
- [ ] Older entries appear progressively more faded when expanded
- [ ] "Press U for more" hint appears when collapsed with multiple entries
- [ ] U key does nothing when not on title screen

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Initial Changelog Population

### Overview
Populate the changelog with recent meaningful commits to seed the feature.

### Changes Required:

#### 3.1 Manually Add Initial Entries

Run these commands to seed the changelog with recent updates:

```bash
npm run changelog:add "Mobile splash screen with animated UFO"
npm run changelog:add "Optimized PNG assets (69% smaller)"
npm run changelog:add "Rainbow wave BUMMER text on mobile"
```

This creates a starting point. Future deploys will auto-add from git commits.

### Success Criteria:

#### Automated Verification:
- [ ] `changelog.json` contains 3 entries
- [ ] `js/changelog.js` is generated with 3 entries
- [ ] Build succeeds: `npm run build`

#### Manual Verification:
- [ ] Title screen shows the latest entry
- [ ] Expanding shows all 3 entries with fading
- [ ] Entries appear in correct order (newest first)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:
- Not applicable - this is a UI feature in a game without a test framework

### Integration Tests:
- Not applicable - manual testing required

### Manual Testing Steps:
1. Load the game and verify changelog appears on title screen
2. Verify only 1 entry shows by default
3. Press U and verify expansion to show all entries
4. Press U again and verify collapse
5. Verify older entries are visually faded
6. Verify "Press U for more" hint disappears when expanded
7. Press Space to start game - verify changelog state resets on next title screen visit
8. Run `npm run changelog:add "Test long message that exceeds fifty characters limit"` and verify truncation
9. Run `npm run build` and verify changelog.json is preserved
10. Make a commit and run `npm run build` - verify new entry is added

## Performance Considerations

- Changelog rendering adds minimal overhead - just a few `fillText` calls per frame
- Build script only runs at build/deploy time, not runtime
- `changelog.json` file is small (<1KB with 5 entries)

## Migration Notes

- No database changes
- No API changes
- Backwards compatible - if `js/changelog.js` is missing, feature is simply hidden

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No changelog.json exists | Build script creates empty array, no UI shown |
| Empty CHANGELOG array | Entire changelog section hidden |
| Single entry | No [+] indicator, no "Press U" hint |
| Message > 50 chars | Auto-truncate with "..." at build time |
| Same commit rebuilt | Skip duplicate (compare messages) |
| Git not available | Use existing changelog.json |
| Non-user-facing commit (merge, chore, etc.) | Skip based on prefix patterns |

## References

- Original research: `thoughts/shared/research/2026-01-16-changelog-title-screen.md`
- Title screen rendering: `js/game.js:3697-3842`
- formatRelativeDate function: `js/game.js:2727-2750`
- Key handler: `js/game.js:641-690`
- Build scripts: `package.json:7`
