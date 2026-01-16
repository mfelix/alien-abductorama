---
date: 2026-01-15T14:26:56Z
researcher: Claude
git_commit: af715a9126f6b9c2d5d5049aff8c0b665b20153c
branch: main
repository: alien-abductorama
topic: "Leaderboard Activity Metadata - Timestamps and Game Activity Tracking"
tags: [research, codebase, high-score, leaderboard, timestamps, cloudflare-kv]
status: complete
last_updated: 2026-01-15
last_updated_by: Claude
last_updated_note: "Added clarified requirements from user discussion"
---

# Research: Leaderboard Activity Metadata

**Date**: 2026-01-15T14:26:56Z
**Researcher**: Claude
**Git Commit**: af715a9126f6b9c2d5d5049aff8c0b665b20153c
**Branch**: main
**Repository**: alien-abductorama

## Research Question

The user wants to add activity metadata to the leaderboard screen:
1. Display when the last game was played
2. Show how many games have been played in the last week (data freshness indicator)
3. Display the date when each high score was achieved

## Clarified Requirements

After discussion with user:

| Feature | Requirement |
|---------|-------------|
| **Last game played** | Track ALL game attempts (not just qualifying scores) |
| **Games this week** | Rolling 7-day window (not calendar-based) |
| **Date format** | Relative ("2h ago", "1d ago") for ≤2 days, then compact (1/15), include year only if different year |

## Summary

**Good news:** The `timestamp` field already exists in each leaderboard entry - it's stored but not displayed. The date each score was achieved can be rendered by formatting the existing `entry.timestamp` value.

**Consideration:** Tracking "games played in last week" requires additional infrastructure since the current system only persists the top 10 scores. Non-qualifying games are not tracked.

## Detailed Findings

### 1. Current Data Model

Each leaderboard entry stored in Cloudflare KV contains these fields:

| Field | Type | Description | Currently Displayed |
|-------|------|-------------|---------------------|
| `id` | string | UUID | No |
| `name` | string | 3 uppercase letters | Yes |
| `score` | number | Points earned | Yes |
| `wave` | number | Wave reached | Yes |
| `gameLength` | number | Duration in seconds | No |
| `countryCode` | string | 2-letter country code | Yes (as flag emoji) |
| `timestamp` | number | Unix epoch milliseconds | **No** |

**Key finding:** The `timestamp` is already captured at `src/worker.js:103`:
```javascript
timestamp: Date.now()
```

This timestamp is used for tie-breaking in sorting (earlier timestamp wins) but is never shown to users.

### 2. Score Timestamp Display

**What exists:** Every leaderboard entry has a `timestamp` field with milliseconds since Unix epoch.

**Where it's created:** `src/worker.js:103` - set server-side when entry is created.

**Where it's available in UI:** The `leaderboard` array fetched at `js/game.js:2687` contains all fields including `timestamp`.

**Where to display:** The rendering loop at `js/game.js:3377-3398` iterates through entries and could format `entry.timestamp` for display.

**Required formatting logic:**
```javascript
function formatRelativeDate(timestamp) {
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
    return `${month}/${day}/${year % 100}`; // "1/15/25"
  }
  return `${month}/${day}`; // "1/15"
}
```

### 3. "Last Game Played" Display

**Current state:** The most recent game that made the leaderboard can be derived by finding the maximum timestamp in the array.

**Requirement:** Track ALL game attempts, not just qualifying scores.

**Implementation approach:** Store a separate `activity_stats` KV key that gets updated on every POST to `/api/scores`, regardless of whether the score qualifies.

### 4. "Games Played This Week" Tracking

**Current state:** The system only stores the top 10 qualifying scores. Non-qualifying games are validated but not persisted.

**Requirement:** Rolling 7-day window of ALL game attempts.

**Recommended approach:** Separate Activity Counter
Store a separate KV key with game activity statistics:
```javascript
// New KV key: 'activity_stats'
{
  totalGames: 1234,
  recentGames: [1705334567890, 1705334567891, ...]  // Last ~100 timestamps
}
```

Update this on every POST to `/api/scores`, regardless of qualification. Filter `recentGames` to last 7 days when calculating `gamesThisWeek`.

### 5. API Response Structure

**Current GET `/api/scores` response:**
```json
[
  { "id": "...", "name": "AAA", "score": 1000, "wave": 10, "timestamp": 1705334567890, ... }
]
```

**Enhanced response structure:**
```json
{
  "leaderboard": [...],
  "stats": {
    "lastGamePlayed": 1705334567890,
    "gamesThisWeek": 45
  }
}
```

This is a breaking change to the API contract - client code at `js/game.js:2687` will need to handle the new response shape.

## Code References

### Data Model
- `src/worker.js:96-104` - Entry object creation with timestamp
- `src/worker.js:4` - KV key constant `'leaderboard'`
- `src/worker.js:5` - MAX_ENTRIES = 10

### UI Rendering
- `js/game.js:3363-3400` - Title screen leaderboard rendering
- `js/game.js:3377-3398` - Per-entry rendering loop
- `js/game.js:3393` - Score display (could add timestamp nearby)
- `js/game.js:3397` - Wave display in gray (timestamp could follow similar pattern)

### API Handlers
- `src/worker.js:31-46` - GET handler (needs to include activity stats)
- `src/worker.js:48-151` - POST handler (needs to update activity stats on every call)

### Client Data Fetching
- `js/game.js:2682-2694` - `fetchLeaderboard()` function (needs to handle new response shape)
- `js/game.js:557` - `leaderboard` global variable
- New global variables needed: `activityStats` or similar

## Architecture Documentation

### Current Flow
```
Game Over → triggerGameOver() → scoreQualifiesForLeaderboard() → NAME_ENTRY state
    ↓
submitScore() → POST /api/scores → worker.js:handlePostScore()
    ↓
Validate → Create Entry (with timestamp) → Sort → Save to KV → Return rank
    ↓
Client updates local leaderboard → Display on title screen
```

### Enhanced Flow
```
POST /api/scores → handlePostScore()
    ↓
[NEW] Update activity_stats KV (ALWAYS - before validation)
    ↓
Validate → Create Entry → Sort → Save leaderboard to KV → Return with stats
```

```
GET /api/scores → handleGetScores()
    ↓
[NEW] Read activity_stats KV
    ↓
Calculate gamesThisWeek (filter recentGames to last 7 days)
    ↓
Return { leaderboard, stats: { lastGamePlayed, gamesThisWeek } }
```

### KV Storage Keys
- Current: `'leaderboard'` - JSON array of top 10 entries
- New: `'activity_stats'` - JSON object with game counts and recent timestamps

## Implementation Checklist

### Worker (src/worker.js)
- [ ] Add `ACTIVITY_KEY` constant
- [ ] Add `MAX_RECENT_GAMES` constant (~100)
- [ ] Create `updateActivityStats(env, timestamp)` helper
- [ ] Create `getActivityStats(env)` helper
- [ ] Modify `handlePostScore()` to call `updateActivityStats()` early (before validation)
- [ ] Modify `handleGetScores()` to return `{ leaderboard, stats }` object

### Client (js/game.js)
- [ ] Add `activityStats` global variable
- [ ] Add `formatRelativeDate(timestamp)` utility function
- [ ] Modify `fetchLeaderboard()` to destructure new response shape
- [ ] Modify title screen rendering to show activity stats (last played, games this week)
- [ ] Modify leaderboard entry rendering to include score date

### UI Design Considerations
- Activity stats could display below leaderboard: "Last played: 2h ago • 45 games this week"
- Score dates could display after wave number in gray, or on a second line per entry
- Consider horizontal space constraints on title screen
