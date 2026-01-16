# Leaderboard Activity Metadata Implementation Plan

## Overview

Add activity metadata to the leaderboard screen: display when each high score was achieved, show when the last game was played (tracking ALL attempts), and display how many games have been played in the last 7 days.

## Current State Analysis

### What Exists
- `timestamp` field is already stored with each leaderboard entry at `src/worker.js:103`
- Leaderboard rendering loop at `js/game.js:3377-3398` displays rank, flag, name, score, and wave
- API returns flat array of entries; client stores in `leaderboard` global variable

### What's Missing
- Score timestamps are not displayed in the UI
- No tracking of non-qualifying game attempts
- No activity stats (last played, games this week)

### Key Constraints
- Breaking API change: response shape changes from array to object
- Need backwards-compatible handling during deployment window
- UI horizontal space is limited (~250px span in current layout)

## Desired End State

After implementation:
1. Each leaderboard entry shows the date it was achieved (relative format for recent, compact for older)
2. Activity stats appear above the "TOP 10" header showing "Last played: Xh ago • Y games this week"
3. Every game attempt (qualifying or not) is tracked for activity stats
4. API response structure: `{ leaderboard: [...], stats: { lastGamePlayed, gamesThisWeek } }`

### Verification
- Visual: Title screen shows activity stats above leaderboard, each row has timestamp
- API: GET `/api/scores` returns object with `leaderboard` array and `stats` object
- Activity tracking: POST `/api/scores` updates activity stats regardless of qualification

## What We're NOT Doing

- Not changing the leaderboard ranking logic
- Not adding historical game analytics beyond 7-day window
- Not persisting detailed per-game statistics
- Not changing the score submission flow or validation

## Implementation Approach

Backend-first approach: add activity tracking infrastructure, then update API responses, then update client data handling, finally update UI rendering. Each phase is independently deployable.

---

## Phase 1: Backend Activity Tracking

### Overview
Add a new KV key to track game activity statistics, updated on every POST request regardless of whether the score qualifies.

### Changes Required:

#### 1.1 Add Constants

**File**: `src/worker.js`
**Changes**: Add new constants for activity tracking after line 5

```javascript
const ACTIVITY_KEY = 'activity_stats';
const MAX_RECENT_GAMES = 100; // Keep last 100 timestamps for rolling window
```

#### 1.2 Add Activity Stats Helper Functions

**File**: `src/worker.js`
**Changes**: Add helper functions before `handleGetScores` (around line 30)

```javascript
async function getActivityStats(env) {
    const stats = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(ACTIVITY_KEY, { type: 'json' });
    return stats || { totalGames: 0, recentGames: [] };
}

async function updateActivityStats(env, timestamp) {
    const stats = await getActivityStats(env);

    // Update total count
    stats.totalGames += 1;

    // Add new timestamp and trim to max size
    stats.recentGames.push(timestamp);
    if (stats.recentGames.length > MAX_RECENT_GAMES) {
        stats.recentGames = stats.recentGames.slice(-MAX_RECENT_GAMES);
    }

    await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(ACTIVITY_KEY, JSON.stringify(stats));
    return stats;
}

function calculateGamesThisWeek(recentGames) {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return recentGames.filter(ts => ts > oneWeekAgo).length;
}
```

#### 1.3 Update handlePostScore to Track Activity

**File**: `src/worker.js`
**Changes**: Add activity tracking at the start of `handlePostScore`, immediately after parsing the request body (after line 51)

```javascript
// Track this game attempt (before any validation that might reject it)
const gameTimestamp = Date.now();
await updateActivityStats(env, gameTimestamp);
```

Also update the entry creation at line 103 to use the captured timestamp:

```javascript
timestamp: gameTimestamp,
```

### Success Criteria:

#### Automated Verification:
- [ ] Worker deploys successfully: `npx wrangler deploy`
- [ ] POST `/api/scores` with valid data returns success
- [ ] KV storage contains `activity_stats` key after a POST

#### Manual Verification:
- [ ] Submit a score via the game, verify `activity_stats` KV key exists in Cloudflare dashboard
- [ ] Submit a non-qualifying score, verify `totalGames` increments

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation that the activity tracking is working before proceeding to the next phase.

---

## Phase 2: API Response Enhancement

### Overview
Modify GET and POST responses to include activity stats alongside the leaderboard data.

### Changes Required:

#### 2.1 Update handleGetScores Response

**File**: `src/worker.js`
**Changes**: Modify `handleGetScores` function to return object with stats

```javascript
async function handleGetScores(env) {
    try {
        const leaderboard = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(LEADERBOARD_KEY, { type: 'json' });
        const activityStats = await getActivityStats(env);

        const stats = {
            lastGamePlayed: activityStats.recentGames.length > 0
                ? activityStats.recentGames[activityStats.recentGames.length - 1]
                : null,
            gamesThisWeek: calculateGamesThisWeek(activityStats.recentGames),
        };

        return new Response(JSON.stringify({ leaderboard: leaderboard || [], stats }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=10',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch scores' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
```

#### 2.2 Update handlePostScore Response

**File**: `src/worker.js`
**Changes**: Update the success and non-qualifying responses to include stats

For the non-qualifying response (around line 118):
```javascript
const stats = {
    lastGamePlayed: gameTimestamp,
    gamesThisWeek: calculateGamesThisWeek((await getActivityStats(env)).recentGames),
};
return new Response(JSON.stringify({ success: false, message: 'Score did not qualify', leaderboard, stats }), {
    headers: { 'Content-Type': 'application/json' },
});
```

For the success response (around line 142):
```javascript
const stats = {
    lastGamePlayed: gameTimestamp,
    gamesThisWeek: calculateGamesThisWeek((await getActivityStats(env)).recentGames),
};
return new Response(JSON.stringify({ success: true, rank, leaderboard, stats }), {
    headers: { 'Content-Type': 'application/json' },
});
```

### Success Criteria:

#### Automated Verification:
- [ ] Worker deploys successfully: `npx wrangler deploy`
- [ ] GET `/api/scores` returns `{ leaderboard: [...], stats: { lastGamePlayed, gamesThisWeek } }`
- [ ] POST `/api/scores` returns response with `stats` field

#### Manual Verification:
- [ ] Use `curl` to verify GET response shape: `curl https://alien-abductorama.pages.dev/api/scores | jq`
- [ ] Verify `stats.gamesThisWeek` increases after playing a game

**Implementation Note**: After completing this phase, the API contract has changed. The client will break until Phase 3 is deployed. Proceed immediately to Phase 3.

---

## Phase 3: Client Data Handling

### Overview
Update the client to handle the new API response structure and store activity stats.

### Changes Required:

#### 3.1 Add Global Variable for Activity Stats

**File**: `js/game.js`
**Changes**: Add after line 558 (after `leaderboardLoading`)

```javascript
let activityStats = null;
```

#### 3.2 Add formatRelativeDate Utility Function

**File**: `js/game.js`
**Changes**: Add before `fetchLeaderboard` function (around line 2680)

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
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    if (year !== currentYear) {
        return `${month}/${day}/${String(year).slice(-2)}`;
    }
    return `${month}/${day}`;
}
```

#### 3.3 Update fetchLeaderboard Function

**File**: `js/game.js`
**Changes**: Modify `fetchLeaderboard` to handle new response shape (lines 2682-2694)

```javascript
async function fetchLeaderboard() {
    leaderboardLoading = true;
    try {
        const response = await fetch('/api/scores');
        if (response.ok) {
            const data = await response.json();
            // Handle both old (array) and new (object) response shapes
            if (Array.isArray(data)) {
                leaderboard = data;
                activityStats = null;
            } else {
                leaderboard = data.leaderboard || [];
                activityStats = data.stats || null;
            }
        }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    } finally {
        leaderboardLoading = false;
    }
}
```

#### 3.4 Update submitScore Function

**File**: `js/game.js`
**Changes**: Modify `submitScore` to extract stats from response (around lines 2710-2714)

```javascript
const result = await response.json();
// Use leaderboard from response to avoid cache staleness
if (result.leaderboard) {
    leaderboard = result.leaderboard;
}
if (result.stats) {
    activityStats = result.stats;
}
```

### Success Criteria:

#### Automated Verification:
- [ ] No JavaScript syntax errors: open browser console on title screen
- [ ] `leaderboard` variable contains array of entries
- [ ] `activityStats` variable contains `{ lastGamePlayed, gamesThisWeek }` or null

#### Manual Verification:
- [ ] Load the game, open browser console, type `leaderboard` - should be array
- [ ] Type `activityStats` - should be object with stats or null
- [ ] Leaderboard still displays correctly (no visual regression)

**Implementation Note**: After completing this phase, the client handles the new data but doesn't display it yet. Verify no regressions before proceeding.

---

## Phase 4: UI Rendering

### Overview
Update the title screen to display activity stats above the leaderboard and score dates in each row.

### Changes Required:

#### 4.1 Add Activity Stats Display Above Leaderboard

**File**: `js/game.js`
**Changes**: In `renderTitleScreen`, add activity stats display before the "TOP 10" header (after line 3368, before the leaderboard rendering)

Insert this block right after the `} else if (leaderboard.length > 0) {` line (line 3368):

```javascript
    // Activity stats (above TOP 10 header)
    if (activityStats) {
        ctx.fillStyle = '#888';
        ctx.font = '14px monospace';
        const lastPlayed = activityStats.lastGamePlayed
            ? `Last played: ${formatRelativeDate(activityStats.lastGamePlayed)}`
            : '';
        const gamesWeek = `${activityStats.gamesThisWeek} games this week`;
        const statsText = lastPlayed ? `${lastPlayed}  •  ${gamesWeek}` : gamesWeek;
        ctx.fillText(statsText, canvas.width / 2, canvas.height / 2 - 50);
    }
```

#### 4.2 Add Score Date to Each Leaderboard Entry

**File**: `js/game.js`
**Changes**: In the leaderboard entry rendering loop, add timestamp display after the wave (after line 3397)

```javascript
        // Date
        ctx.fillStyle = '#666';
        ctx.fillText(formatRelativeDate(entry.timestamp), canvas.width / 2 + 200, y);
```

#### 4.3 Adjust Layout for New Column

**File**: `js/game.js`
**Changes**: The current layout positions are:
- Rank: center - 120
- Flag/Name: center - 100
- Score: center + 80
- Wave: center + 130
- Date (new): center + 200

This should fit within the canvas. If needed, compress the score column slightly.

### Success Criteria:

#### Automated Verification:
- [ ] No JavaScript errors in browser console
- [ ] Game loads and displays title screen

#### Manual Verification:
- [ ] Activity stats visible above "TOP 10" header (e.g., "Last played: 2h ago • 45 games this week")
- [ ] Each leaderboard entry shows date in the rightmost column
- [ ] Recent scores show relative format ("2h ago", "1d ago")
- [ ] Older scores show compact date format ("1/15" or "12/25/25")
- [ ] Layout looks balanced, no text overlap
- [ ] Stats update after playing a game

**Implementation Note**: This is the final phase. After manual verification, the feature is complete.

---

## Testing Strategy

### Unit Tests:
- `formatRelativeDate()` with various timestamps (just now, hours ago, days ago, different year)
- Edge cases: null/undefined timestamp, future timestamp, exactly 24 hours ago

### Integration Tests:
- POST `/api/scores` updates activity stats
- GET `/api/scores` returns correct response shape
- Non-qualifying scores still update activity stats

### Manual Testing Steps:
1. Load game fresh - verify activity stats display (may be 0 games if new)
2. Play a game to completion - verify "Last played" updates to "just now"
3. Refresh page - verify stats persist
4. Check leaderboard dates match when scores were achieved
5. Test on different screen sizes to verify layout doesn't break

## Performance Considerations

- Activity stats add one additional KV read on GET requests
- `recentGames` array capped at 100 entries to prevent unbounded growth
- 7-day filter is O(n) where n ≤ 100, negligible performance impact

## Migration Notes

- No data migration needed; existing leaderboard entries already have `timestamp`
- New `activity_stats` KV key will be created on first POST after deployment
- Client handles both old (array) and new (object) API response shapes during rollout

## References

- Research document: `thoughts/shared/research/2026-01-15-leaderboard-activity-metadata.md`
- Worker implementation: `src/worker.js`
- Client leaderboard code: `js/game.js:2682-2737` (data), `js/game.js:3363-3400` (rendering)
