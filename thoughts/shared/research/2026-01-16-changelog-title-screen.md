---
date: 2026-01-16T12:00:00-08:00
researcher: mfelix
git_commit: 114d6adaa3a8f9365b91618e31b2e3ea8bea3a17
branch: main
repository: alien-abductorama
topic: "Title Screen Changelog Feature Implementation"
tags: [research, codebase, title-screen, changelog, ui]
status: complete
last_updated: 2026-01-16
last_updated_by: mfelix
---

# Research: Title Screen Changelog Feature Implementation

**Date**: 2026-01-16T12:00:00-08:00
**Researcher**: mfelix
**Git Commit**: 114d6adaa3a8f9365b91618e31b2e3ea8bea3a17
**Branch**: main
**Repository**: alien-abductorama

## Research Question

How can we create a changelog that shows the latest changes on the title page? A short message like "Nerfed tank damage multiplier" with a relative date (e.g., "2 days ago", with full date after 2 days). The implementation should be tasteful, flexible for deployments to include or exclude a message, and potentially default to commit messages.

## Summary

The title screen is rendered entirely via Canvas 2D API in `js/game.js`. The screen has a clear visual hierarchy with several existing text elements that provide good reference points for placement. The codebase already has a `formatRelativeDate()` function that handles relative time formatting. The build system is simple (file copy to dist/) with no build-time variable injection, so the changelog would need to be configured via either:
1. A static JS file/variable that gets updated at deploy time
2. Runtime fetch from an API endpoint
3. Build script enhancement to inject values

## Detailed Findings

### Title Screen Layout

The title screen (`renderTitleScreen()` at line 3697) has the following vertical layout:

| Y Position | Content | Style |
|------------|---------|-------|
| `canvas.height / 3` | "ALIEN ABDUCTO-RAMA" (rainbow animated) | bold 80px monospace |
| `canvas.height / 2 - 70` | Activity stats (if present) | 14px monospace, #888 |
| `canvas.height / 2 - 30` | "LEADERBOARD" | bold 24px monospace, #0ff |
| `canvas.height / 2 + 10` to `+270` | Leaderboard entries (10 rows × 26px) | 18px monospace |
| `canvas.height - 150` | "Press SPACE to start" (flashing) | bold 32px monospace, #fff |
| `canvas.height - 100` | Controls instructions | 18px monospace, #aaa |
| `canvas.height - 30` | Dedication message | 14px monospace, #fff |

**Best placement options for changelog:**
1. **Below title, above activity stats** (~`canvas.height / 2 - 90` to `-100`) - subtle, informational
2. **Below controls, above dedication** (~`canvas.height - 60`) - footer position, easy to spot
3. **Above title** (~`canvas.height / 3 - 40`) - prominent but might feel cluttered

### Existing Date Formatting

The `formatRelativeDate()` function (line 2727) already implements the exact logic requested:

```javascript
function formatRelativeDate(timestamp) {
    if (!timestamp) return '';

    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days <= 2) return `${days}d ago`;

    // Compact date for older entries
    const date = new Date(timestamp);
    // ... returns M/D or M/D/YY format
}
```

**Note:** The current logic shows "Xd ago" for up to 2 days, then switches to full date. This matches the user's requirement.

### UI Styling Patterns

For informational secondary text, the codebase consistently uses:
- **Font**: `14px monospace` (for stats, dates, secondary info)
- **Color**: `#888` (gray) for standard info, `#666` for less important
- **Alignment**: Center-aligned (`ctx.textAlign = 'center'`)

The activity stats line provides a perfect template:
```javascript
ctx.fillStyle = '#888';
ctx.font = '14px monospace';
ctx.fillText(statsText, canvas.width / 2, canvas.height / 2 - 70);
```

### Build/Deploy Configuration Options

The current build system has no build-time configuration injection. Options for changelog injection:

#### Option 1: Static Configuration Variable
Add a changelog config object to `js/game.js`:
```javascript
const CHANGELOG = {
    message: null,      // Set to string to show, null to hide
    timestamp: null     // Unix timestamp or null
};
```

**Pros**: Simple, no API needed
**Cons**: Requires editing source file each deploy

#### Option 2: External JSON File
Create `assets/changelog.json`:
```json
{
    "message": "Nerfed tank damage multiplier",
    "timestamp": 1705420800000
}
```
Fetch at load time alongside leaderboard.

**Pros**: Separate from code, easy to automate
**Cons**: Extra HTTP request

#### Option 3: Build Script Enhancement
Modify `package.json` build script to inject from environment variable or file:
```json
"scripts": {
    "build": "mkdir -p dist && ./scripts/inject-changelog.sh && cp -r index.html css js assets dist/"
}
```

**Pros**: Automated, no runtime cost
**Cons**: More complex build process

#### Option 4: Worker API Extension
Extend the existing `/api/scores` endpoint or add `/api/changelog`:
```javascript
// In worker.js
if (pathname === '/api/changelog') {
    return json({ message: "...", timestamp: ... });
}
```
Could even store in KV alongside scores.

**Pros**: Centralized, can update without redeploy
**Cons**: Runtime fetch, dependency on worker

### Using Git Commit Messages

To default to commit messages, a build script could:
```bash
# Get latest commit message and timestamp
MESSAGE=$(git log -1 --pretty=%s)
TIMESTAMP=$(git log -1 --pretty=%ct)000  # Convert to milliseconds

# Inject into changelog.json or JS file
echo "{\"message\": \"$MESSAGE\", \"timestamp\": $TIMESTAMP}" > assets/changelog.json
```

This would automatically populate changelog from git on each deploy.

## Code References

- [`js/game.js:3697-3842`](https://github.com/mfelix/alien-abductorama/blob/114d6adaa3a8f9365b91618e31b2e3ea8bea3a17/js/game.js#L3697-L3842) - `renderTitleScreen()` function
- [`js/game.js:2727-2750`](https://github.com/mfelix/alien-abductorama/blob/114d6adaa3a8f9365b91618e31b2e3ea8bea3a17/js/game.js#L2727-L2750) - `formatRelativeDate()` function
- [`js/game.js:3766-3774`](https://github.com/mfelix/alien-abductorama/blob/114d6adaa3a8f9365b91618e31b2e3ea8bea3a17/js/game.js#L3766-L3774) - Activity stats rendering (style template)
- [`package.json`](https://github.com/mfelix/alien-abductorama/blob/114d6adaa3a8f9365b91618e31b2e3ea8bea3a17/package.json) - Build scripts
- [`src/worker.js`](https://github.com/mfelix/alien-abductorama/blob/114d6adaa3a8f9365b91618e31b2e3ea8bea3a17/src/worker.js) - Cloudflare Worker API

## Architecture Documentation

### Current Title Screen Data Flow
1. On game load, `fetchLeaderboard()` calls `/api/scores`
2. Response populates `leaderboard` array and `activityStats` object
3. `renderTitleScreen()` renders UI based on these variables
4. Loading state handled via `leaderboardLoading` boolean

### Proposed Changelog Data Flow
Similar pattern could apply:
1. Add `changelog` variable (object with `message` and `timestamp`)
2. Populate from config file, API, or build-time injection
3. Render in `renderTitleScreen()` if `changelog.message` is truthy
4. Use existing `formatRelativeDate()` for time display

## Related Research

- [2026-01-15-leaderboard-activity-metadata.md](./2026-01-15-leaderboard-activity-metadata.md) - Activity stats on title screen

## Final Design: Expandable Changelog with Auto-Truncation

### Requirements
1. **Automated** - generate from git commits at build time
2. **Show latest only by default** with affordance to expand
3. **"RECENT UPDATES" header**
4. **Fading for older entries** when expanded
5. **Character limit with auto-truncation** (no errors, graceful handling)

### Data Structure

```javascript
// js/changelog.js (auto-generated at build time)
const CHANGELOG = [
    { message: "Nerfed tank damage multiplier", timestamp: 1705420800000 },
    { message: "Added wide beam powerup", timestamp: 1705334400000 },
    { message: "Fixed leaderboard display bug", timestamp: 1705248000000 }
];
// Most recent first. Empty array to hide entirely.
```

### Character Limit & Truncation

**Limit**: 50 characters per message (fits comfortably on most screens with date)

**Auto-truncation at build time**:
```javascript
const MAX_MESSAGE_LENGTH = 50;

function truncateMessage(msg) {
    if (msg.length <= MAX_MESSAGE_LENGTH) return msg;
    return msg.slice(0, MAX_MESSAGE_LENGTH - 3) + '...';
}
```

**Examples**:
- `"Nerfed tank damage multiplier"` → unchanged (29 chars)
- `"Added wide beam powerup with improved targeting system"` → `"Added wide beam powerup with improved targeting..."`

### Display Behavior

**Collapsed State (default)**:
```
RECENT UPDATES [+]
★ Nerfed tank damage multiplier (2d ago)
```

**Expanded State (after pressing key)**:
```
RECENT UPDATES [-]
★ Nerfed tank damage multiplier (2d ago)      ← #888 (bright)
★ Added wide beam powerup (4d ago)            ← #666 (dimmer)
★ Fixed leaderboard display bug (1/12)        ← #555 (dimmest)
```

**Affordance**: `[+]` indicator next to header, press `U` key to toggle (or click on header if touch enabled)

### Rendering Code

```javascript
// State for changelog expansion
let changelogExpanded = false;

// In renderTitleScreen(), after title animation:
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
    const indicator = changelogExpanded ? '[-]' : '[+]';
    const hasMore = CHANGELOG.length > 1;
    const headerText = hasMore ? `RECENT UPDATES ${indicator}` : 'RECENT UPDATE';
    ctx.fillText(headerText, canvas.width / 2, startY);

    // Entries
    ctx.font = '13px monospace';
    const entriesToShow = changelogExpanded ? Math.min(CHANGELOG.length, maxEntries) : 1;

    for (let i = 0; i < entriesToShow; i++) {
        const entry = CHANGELOG[i];
        const dateText = formatRelativeDate(entry.timestamp);

        // Truncate message if needed
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

// In keydown handler (during TITLE state):
if (e.code === 'KeyU' && gameState === 'TITLE') {
    changelogExpanded = !changelogExpanded;
}
```

### Build-Time Automation

**New npm script in package.json**:
```json
{
  "scripts": {
    "changelog:add": "node scripts/changelog.js add",
    "changelog:from-git": "node scripts/changelog.js from-git",
    "build": "npm run changelog:from-git && mkdir -p dist && cp -r index.html css js assets dist/",
    "deploy": "npm run build && wrangler deploy"
  }
}
```

**Build script** (`scripts/changelog.js`):
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
    // Only adds if the latest commit message differs from current top entry

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

### Workflow

**Automatic (default)**:
1. Make commits with user-facing messages: `git commit -m "Nerfed tank damage multiplier"`
2. Run `npm run deploy` - changelog auto-updates from git
3. Non-user-facing commits (merge, wip, chore, etc.) are skipped

**Manual override**:
1. Run `npm run changelog:add "Custom message here"` to add specific entry
2. Message is auto-truncated if > 50 chars
3. Commit the updated `changelog.json`

**Skip changelog update**:
- Use commit prefixes like `chore:`, `docs:`, `ci:`, `test:` to skip auto-add
- Or just don't include `--from-git` in build if you want manual-only

### Title Screen Layout (Updated)

| Y Position | Content |
|------------|---------|
| `canvas.height / 3` | Rainbow animated title |
| `canvas.height / 3 + 45` | "RECENT UPDATES [+]" header |
| `canvas.height / 3 + 62` | Latest changelog entry |
| `canvas.height / 3 + 79` | (expanded) Entry 2, faded |
| `canvas.height / 3 + 96` | (expanded) Entry 3, more faded |
| ... | Up to 5 entries when expanded |
| `canvas.height / 2 - 70` | Activity stats |
| ... | (rest unchanged) |

### Files to Create/Modify

1. **Create** `scripts/changelog.js` - build script
2. **Create** `js/changelog.js` - auto-generated output (add to .gitignore? or commit it)
3. **Create** `changelog.json` - persistent changelog data (commit this)
4. **Modify** `package.json` - add npm scripts
5. **Modify** `js/game.js` - add rendering and key handler
6. **Modify** `index.html` - add `<script src="js/changelog.js"></script>` before game.js

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| No changelog.json exists | Create empty, no updates shown |
| Empty CHANGELOG array | Hide entire section |
| Single entry | Show without [+] indicator, no "Press U" hint |
| Message > 50 chars | Auto-truncate with "..." |
| Same commit rebuilt | Skip duplicate (compare messages) |
| Git not available | Use existing changelog.json |
| Non-user-facing commit | Skip based on prefix patterns |
