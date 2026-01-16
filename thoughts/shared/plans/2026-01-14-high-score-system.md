# High Score System Implementation Plan

## Overview

Implement a complete high score system for Alien Abducto-rama featuring:
- Top 10 global leaderboard stored in Cloudflare KV
- 3-letter arcade-style player name entry
- Country flags displayed using Unicode emoji (derived from ISO 3166-1 alpha-2 country codes)
- Game session tracking (score, wave, game length, timestamp)
- Basic anti-cheat validation

## Current State Analysis

The game currently has a minimal single-player high score system:
- Single `highScore` value stored in localStorage (`js/game.js:552`)
- No player names, leaderboard, or server-side storage
- Cloudflare Worker returns 404 for all non-asset requests (`src/worker.js:8`)
- No KV namespace configured

### Key Discoveries:
- Score tracking exists at `js/game.js:551-553` with combo multipliers
- Game over flow at `js/game.js:2535-2594` triggers score save
- Title screen at `js/game.js:2973-3001` has space for leaderboard display
- Canvas uses `monospace` font - emoji flags should render adequately
- CF-IPCountry header available from Cloudflare to detect player country

## Desired End State

After implementation:
1. Players see a "TOP 10" leaderboard on the title screen showing rank, name, score, wave, and country flag
2. When a game ends with a qualifying score, players enter a 3-letter name using keyboard
3. Scores are submitted to the backend with automatic country detection
4. Backend validates scores and maintains the top 10 list in KV storage
5. Country flags display as emoji (e.g., 🇺🇸, 🇬🇧, 🇯🇵) next to player names

### Verification:
- Leaderboard displays on title screen with flags
- Name entry works with arrow keys or typing
- Scores persist across browser sessions and devices
- Invalid scores are rejected by backend

## What We're NOT Doing

- Full replay-based anti-cheat validation
- Client-side code obfuscation
- Hardware fingerprinting
- Custom flag images/sprites (using emoji instead)
- Pagination beyond top 10
- Personal score history per player
- Social features (sharing, challenges)

## Implementation Approach

We'll implement in 4 phases:
1. **Backend first** - KV storage and API endpoints
2. **Frontend data layer** - Fetch leaderboard, submit scores, track game session
3. **UI components** - Name entry screen, leaderboard display with flags
4. **Polish** - Celebration effects, error handling

## Phase 1: Backend API & KV Storage

### Overview
Set up Cloudflare KV namespace and implement GET/POST API endpoints for high scores.

### Changes Required:

#### 1.1 Cloudflare KV Configuration

**File**: `wrangler.toml`
**Changes**: Add KV namespace binding

```toml
[[kv_namespaces]]
binding = "ALIEN_ABDUCTORAMA_HIGH_SCORES"
id = "<will be generated>"
preview_id = "<will be generated>"
```

**Note**: Run `wrangler kv:namespace create ALIEN_ABDUCTORAMA_HIGH_SCORES` and `wrangler kv:namespace create ALIEN_ABDUCTORAMA_HIGH_SCORES --preview` to generate IDs.

#### 1.2 Worker API Implementation

**File**: `src/worker.js`
**Changes**: Complete rewrite to add API routes

```javascript
// Cloudflare Workers entry point
// Static assets are served automatically via the [assets] configuration in wrangler.toml

const LEADERBOARD_KEY = 'leaderboard';
const MAX_ENTRIES = 10;

// Anti-cheat constants
const MAX_SCORE_PER_SECOND = 500; // Reasonable max with combos
const MIN_GAME_LENGTH_SECONDS = 10;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle API routes
        if (url.pathname === '/api/scores') {
            if (request.method === 'GET') {
                return handleGetScores(env);
            }
            if (request.method === 'POST') {
                return handlePostScore(request, env);
            }
            return new Response('Method Not Allowed', { status: 405 });
        }

        // Static assets are handled automatically by the assets configuration
        return new Response('Not Found', { status: 404 });
    },
};

async function handleGetScores(env) {
    try {
        const leaderboard = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(LEADERBOARD_KEY, { type: 'json' });
        return new Response(JSON.stringify(leaderboard || []), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=10', // Short cache for freshness
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch scores' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

async function handlePostScore(request, env) {
    try {
        const body = await request.json();
        const { name, score, wave, gameLength } = body;

        // Validation
        if (!name || typeof name !== 'string' || !/^[A-Z]{3}$/.test(name)) {
            return new Response(JSON.stringify({ error: 'Invalid name: must be 3 uppercase letters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
            return new Response(JSON.stringify({ error: 'Invalid score' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (typeof wave !== 'number' || wave < 1 || !Number.isInteger(wave)) {
            return new Response(JSON.stringify({ error: 'Invalid wave' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (typeof gameLength !== 'number' || gameLength < MIN_GAME_LENGTH_SECONDS) {
            return new Response(JSON.stringify({ error: 'Invalid game length' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Basic anti-cheat: score vs time reasonableness
        const scorePerSecond = score / gameLength;
        if (scorePerSecond > MAX_SCORE_PER_SECOND) {
            return new Response(JSON.stringify({ error: 'Score rejected' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get country from Cloudflare header
        const countryCode = request.headers.get('CF-IPCountry') || 'XX';

        // Create score entry with unique ID to avoid timestamp collisions
        const entryId = crypto.randomUUID();
        const entry = {
            id: entryId,
            name,
            score,
            wave,
            gameLength: Math.round(gameLength),
            countryCode,
            timestamp: Date.now(),
        };

        // Get current leaderboard
        let leaderboard = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(LEADERBOARD_KEY, { type: 'json' }) || [];

        // Check if score qualifies (using same tie-breaker logic as sort)
        const qualifies = leaderboard.length < MAX_ENTRIES || (() => {
            const last = leaderboard[leaderboard.length - 1];
            if (score !== last.score) return score > last.score;
            if (wave !== last.wave) return wave > last.wave;
            return true; // Same score/wave qualifies; sort will keep earlier timestamp first
        })();

        if (!qualifies) {
            return new Response(JSON.stringify({ success: false, message: 'Score did not qualify', leaderboard }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Add and sort with deterministic tie-breaker:
        // 1. Higher score first
        // 2. Higher wave first (if scores equal)
        // 3. Earlier timestamp first (if scores and waves equal)
        leaderboard.push(entry);
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.wave !== a.wave) return b.wave - a.wave;
            return a.timestamp - b.timestamp;
        });
        leaderboard = leaderboard.slice(0, MAX_ENTRIES);

        // Save
        await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(LEADERBOARD_KEY, JSON.stringify(leaderboard));

        // Find rank using unique ID
        const rank = leaderboard.findIndex(e => e.id === entryId) + 1;

        // Return updated leaderboard to avoid cache staleness on client
        return new Response(JSON.stringify({ success: true, rank, leaderboard }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to save score' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
```

### Success Criteria:

#### Automated Verification:
- [ ] KV namespace created: `wrangler kv:namespace list` shows HIGH_SCORES
- [ ] Worker deploys without errors: `npm run deploy`
- [ ] GET /api/scores returns empty array initially: `curl https://alien-abductorama.<your-subdomain>.workers.dev/api/scores`
- [ ] POST /api/scores with valid data returns success

#### Manual Verification:
- [ ] Test POST with invalid name (non-3-letter) returns 400
- [ ] Test POST with suspicious score/time ratio returns 400
- [ ] Verify leaderboard persists across deploys

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 2: Frontend Data Layer

### Overview
Add game session tracking, leaderboard fetching, and score submission to the game client.

### Changes Required:

#### 2.1 Game Session Tracking

**File**: `js/game.js`
**Changes**: Add session variables and tracking

Near line 551-553 (after existing score variables), add:

```javascript
let gameStartTime = 0;
let leaderboard = [];
let pendingScoreSubmission = null;

// Captured at game over to avoid mutation before submission
let finalScore = 0;
let finalWave = 0;
let finalGameLength = 0;
```

In `startGame()` function (around line 2601), add at the start:

```javascript
gameStartTime = Date.now();
```

In `triggerGameOver()` function, capture final values immediately at the START of the function (before explosion sequence):

```javascript
// Capture final game state FIRST, before any resets can occur
finalScore = score;
finalWave = wave;
finalGameLength = (Date.now() - gameStartTime) / 1000;
```

#### 2.2 Leaderboard Fetch Function

**File**: `js/game.js`
**Changes**: Add function to fetch leaderboard

```javascript
async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/scores');
        if (response.ok) {
            leaderboard = await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    }
}
```

Call this on page load and when returning to title screen.

#### 2.3 Score Submission Function

**File**: `js/game.js`
**Changes**: Add function to submit scores

```javascript
async function submitScore(name) {
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                score: finalScore,      // Use captured values
                wave: finalWave,
                gameLength: finalGameLength,
            }),
        });

        const result = await response.json();
        // Use leaderboard from response to avoid cache staleness
        if (result.leaderboard) {
            leaderboard = result.leaderboard;
        }
        if (result.success) {
            return result.rank;
        }
    } catch (error) {
        console.error('Failed to submit score:', error);
    }
    return null;
}
```

#### 2.4 Check if Score Qualifies

**File**: `js/game.js`
**Changes**: Add helper function

```javascript
function scoreQualifiesForLeaderboard() {
    if (finalScore <= 0) return false;
    if (leaderboard.length < 10) return true;
    // Match server-side tie-breaker logic
    const last = leaderboard[leaderboard.length - 1];
    if (finalScore !== last.score) return finalScore > last.score;
    if (finalWave !== last.wave) return finalWave > last.wave;
    return true; // Same score/wave qualifies; sort will keep earlier timestamp first
}
```

### Success Criteria:

#### Automated Verification:
- [ ] No JavaScript console errors on page load
- [ ] `leaderboard` variable populated after fetch (check in browser console)
- [ ] Network tab shows GET /api/scores on page load

#### Manual Verification:
- [ ] Leaderboard data loads correctly from backend
- [ ] Game start time is recorded when game begins

**Implementation Note**: After completing this phase, pause for manual verification before proceeding.

---

## Phase 3: UI Components

### Overview
Implement the 3-letter name entry screen, leaderboard display on title screen, and country flag rendering.

### Changes Required:

#### 3.1 Add New Game State

**File**: `js/game.js`
**Changes**: Add 'NAME_ENTRY' state

Near line 533, update game states:

```javascript
// Add to the states: 'TITLE', 'PLAYING', 'GAME_OVER', 'WAVE_TRANSITION', 'NAME_ENTRY'
```

Add name entry variables:

```javascript
let nameEntryChars = ['A', 'A', 'A'];
let nameEntryPosition = 0;
let nameEntryComplete = false;
let newHighScoreRank = null;
```

#### 3.2 Country Code to Flag Emoji Converter

**File**: `js/game.js`
**Changes**: Add utility function

```javascript
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2 || countryCode === 'XX') {
        return '🌍'; // Globe for unknown
    }
    // Convert country code to regional indicator symbols
    const codePoints = [...countryCode.toUpperCase()].map(
        char => 0x1F1E6 - 65 + char.charCodeAt(0)
    );
    return String.fromCodePoint(...codePoints);
}
```

#### 3.3 Name Entry Screen Rendering

**File**: `js/game.js`
**Changes**: Add render function

```javascript
function renderNameEntryScreen() {
    renderBackground();

    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 4);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`SCORE: ${finalScore}`, canvas.width / 2, canvas.height / 4 + 50);

    ctx.fillText('ENTER YOUR NAME', canvas.width / 2, canvas.height / 2 - 40);

    // Draw the 3 letter slots
    const slotWidth = 60;
    const startX = canvas.width / 2 - slotWidth;
    const y = canvas.height / 2 + 20;

    for (let i = 0; i < 3; i++) {
        const x = startX + i * slotWidth;

        // Highlight current position
        if (i === nameEntryPosition) {
            ctx.fillStyle = '#0ff';
            // Draw selection arrows
            ctx.font = 'bold 24px monospace';
            ctx.fillText('▲', x, y - 50);
            ctx.fillText('▼', x, y + 60);
        } else {
            ctx.fillStyle = '#fff';
        }

        ctx.font = 'bold 48px monospace';
        ctx.fillText(nameEntryChars[i], x, y);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '18px monospace';
    ctx.fillText('↑↓ Change Letter    ←→ Move    ENTER Submit', canvas.width / 2, canvas.height - 100);
}
```

#### 3.4 Name Entry Input Handling

**File**: `js/game.js`
**Changes**: Add to keyboard handler (around line 698 in keydown handler)

```javascript
if (gameState === 'NAME_ENTRY') {
    // Prevent arrow keys from scrolling page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'ArrowUp') {
        // Next letter (A-Z wrap)
        const code = nameEntryChars[nameEntryPosition].charCodeAt(0);
        nameEntryChars[nameEntryPosition] = String.fromCharCode(code === 90 ? 65 : code + 1);
    } else if (e.key === 'ArrowDown') {
        // Previous letter
        const code = nameEntryChars[nameEntryPosition].charCodeAt(0);
        nameEntryChars[nameEntryPosition] = String.fromCharCode(code === 65 ? 90 : code - 1);
    } else if (e.key === 'ArrowLeft') {
        nameEntryPosition = Math.max(0, nameEntryPosition - 1);
    } else if (e.key === 'ArrowRight') {
        nameEntryPosition = Math.min(2, nameEntryPosition + 1);
    } else if (e.key === 'Enter') {
        const name = nameEntryChars.join('');
        submitScore(name).then(rank => {
            newHighScoreRank = rank;
            gameState = 'GAME_OVER';
        });
    } else if (/^[A-Za-z]$/.test(e.key)) {
        // Direct letter input
        nameEntryChars[nameEntryPosition] = e.key.toUpperCase();
        nameEntryPosition = Math.min(2, nameEntryPosition + 1);
    }
    return;
}
```

#### 3.5 Update Title Screen with Leaderboard

**File**: `js/game.js`
**Changes**: Modify `renderTitleScreen()` function

```javascript
function renderTitleScreen() {
    renderBackground();

    // Update and render the floating UFO
    updateTitleUfo();
    renderTitleUfo();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALIEN ABDUCTO-RAMA', canvas.width / 2, 80);

    // Leaderboard
    if (leaderboard.length > 0) {
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('TOP 10', canvas.width / 2, 130);

        ctx.font = '18px monospace';
        const startY = 160;
        const lineHeight = 28;

        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            const y = startY + i * lineHeight;
            const flag = countryCodeToFlag(entry.countryCode);

            // Rank
            ctx.fillStyle = i < 3 ? '#ff0' : '#fff';
            ctx.textAlign = 'right';
            ctx.fillText(`${i + 1}.`, canvas.width / 2 - 120, y);

            // Flag and Name
            ctx.textAlign = 'left';
            ctx.fillText(`${flag} ${entry.name}`, canvas.width / 2 - 100, y);

            // Score
            ctx.textAlign = 'right';
            ctx.fillText(entry.score.toLocaleString(), canvas.width / 2 + 80, y);

            // Wave
            ctx.fillStyle = '#888';
            ctx.fillText(`W${entry.wave}`, canvas.width / 2 + 130, y);
        }
    }

    // Flashing "Press ENTER" text
    ctx.textAlign = 'center';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px monospace';
        ctx.fillText('Press ENTER to Start', canvas.width / 2, canvas.height - 150);
    }

    // Instructions
    ctx.font = '18px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Arrow Keys: Move UFO    |    SPACE: Activate Beam', canvas.width / 2, canvas.height - 100);
}
```

#### 3.6 Modify Game Over Flow

**File**: `js/game.js`
**Changes**: Update `triggerGameOver()` to check for high score qualification

In `triggerGameOver()` function (around line 2535), after the explosion sequence, modify the state transition:

```javascript
// Replace the direct transition to 'GAME_OVER' with:
setTimeout(() => {
    if (scoreQualifiesForLeaderboard()) {
        // Reset name entry state
        nameEntryChars = ['A', 'A', 'A'];
        nameEntryPosition = 0;
        gameState = 'NAME_ENTRY';
    } else {
        gameState = 'GAME_OVER';
    }
}, 1200);
```

#### 3.7 Update Main Render Loop

**File**: `js/game.js`
**Changes**: Add NAME_ENTRY state to render switch

In the main render function, add:

```javascript
case 'NAME_ENTRY':
    renderNameEntryScreen();
    break;
```

#### 3.8 Fetch Leaderboard on Load and State Changes

**File**: `js/game.js`
**Changes**: Add initial fetch and refresh on game over

At end of file initialization:

```javascript
// Fetch leaderboard on page load
fetchLeaderboard();
```

In game over transition back to title:

```javascript
// When returning to title screen, refresh leaderboard
fetchLeaderboard();
```

### Success Criteria:

#### Automated Verification:
- [ ] No JavaScript errors in console during gameplay
- [ ] No JavaScript errors during name entry
- [ ] Network request made to POST /api/scores after name entry

#### Manual Verification:
- [ ] Title screen shows leaderboard with flags when scores exist
- [ ] Flag emojis render correctly for common country codes (US, GB, JP, etc.)
- [ ] Unknown country codes show globe emoji 🌍
- [ ] Name entry screen appears after game over with qualifying score
- [ ] Arrow keys change letters correctly (up/down) and position (left/right)
- [ ] Direct letter typing works and advances cursor
- [ ] Enter key submits score
- [ ] Non-qualifying scores skip name entry and go directly to game over

**Implementation Note**: After completing this phase, thoroughly test the full flow before proceeding.

---

## Phase 4: Polish & Error Handling

### Overview
Add celebration effects for new high scores, improve error handling, and polish the user experience.

### Changes Required:

#### 4.1 High Score Celebration Effect

**File**: `js/game.js`
**Changes**: Add celebration particle effect

```javascript
function createCelebrationEffect() {
    // Create rising beam-like particles in cyan/magenta theme
    const colors = [
        'rgb(0, 255, 255)',   // Cyan
        'rgb(255, 0, 255)',   // Magenta
        'rgb(255, 255, 0)',   // Yellow
        'rgb(255, 255, 255)', // White
    ];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const particle = new Particle(
                x,
                canvas.height + 10,
                (Math.random() - 0.5) * 100,  // vx: slight horizontal drift
                -200 - Math.random() * 200,    // vy: upward
                colors[Math.floor(Math.random() * colors.length)],
                3 + Math.random() * 4,
                2 + Math.random()
            );
            particles.push(particle);
        }, i * 30); // Staggered spawn
    }
}
```

Call this when transitioning to NAME_ENTRY state.

#### 4.2 Rank Display on Name Entry

**File**: `js/game.js`
**Changes**: Show potential rank during name entry

Add to `renderNameEntryScreen()`:

```javascript
// Show potential rank
const potentialRank = leaderboard.filter(e => e.score > finalScore).length + 1;
ctx.fillStyle = '#0f0';
ctx.font = 'bold 24px monospace';
ctx.fillText(`RANK #${potentialRank}`, canvas.width / 2, canvas.height / 4 + 90);
```

#### 4.3 Loading State for Leaderboard

**File**: `js/game.js`
**Changes**: Add loading indicator

```javascript
let leaderboardLoading = false;

async function fetchLeaderboard() {
    leaderboardLoading = true;
    try {
        const response = await fetch('/api/scores');
        if (response.ok) {
            leaderboard = await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    } finally {
        leaderboardLoading = false;
    }
}
```

In title screen render, show loading state:

```javascript
if (leaderboardLoading) {
    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Loading scores...', canvas.width / 2, 160);
} else if (leaderboard.length > 0) {
    // ... existing leaderboard render
}
```

#### 4.4 Submission Error Handling

**File**: `js/game.js`
**Changes**: Handle failed submissions gracefully

```javascript
let submissionError = null;

async function submitScore(name) {
    submissionError = null;
    // ... existing code
    } catch (error) {
        console.error('Failed to submit score:', error);
        submissionError = 'Failed to save score. Try again!';
    }
    return null;
}
```

Show error in name entry or game over screen if submission fails.

#### 4.5 Fallback for Emoji Rendering

**File**: `js/game.js`
**Changes**: Add fallback for systems without emoji support

The current `countryCodeToFlag()` function should work, but we can add the country code as a tooltip/fallback in the leaderboard display if needed.

### Success Criteria:

#### Automated Verification:
- [ ] No console errors during any game state
- [ ] Network requests have appropriate error handling

#### Manual Verification:
- [ ] Celebration particles appear when qualifying for leaderboard
- [ ] Loading indicator shows while fetching leaderboard
- [ ] Error message appears if score submission fails
- [ ] Game remains playable even if backend is unavailable

**Implementation Note**: This phase adds polish - ensure core functionality from Phase 3 is solid before implementing.

---

## Testing Strategy

### Unit Tests:
- `countryCodeToFlag()` returns correct emoji for known codes (US → 🇺🇸, GB → 🇬🇧)
- `countryCodeToFlag()` returns globe for invalid/unknown codes
- `scoreQualifiesForLeaderboard()` correctly determines qualification

### Integration Tests:
- POST /api/scores with valid data returns success and rank
- POST /api/scores with invalid data returns 400
- GET /api/scores returns array (empty or populated)
- Leaderboard correctly sorts by score descending
- Only top 10 scores are retained

### Manual Testing Steps:
1. Fresh deploy: verify empty leaderboard shows nothing or "No scores yet"
2. Play game, get score, enter name → verify appears in leaderboard
3. Play again, get lower score → verify no name entry prompt
4. Play again, beat a top 10 score → verify name entry and correct ranking
5. Test on different browsers (Chrome, Firefox, Safari) for emoji rendering
6. Test on mobile device for touch input (if applicable)

## Performance Considerations

- Leaderboard fetch is cached for 10 seconds (Cache-Control header)
- KV reads are fast but writes have ~60 second propagation delay
- Particle effects are limited to 50 particles to avoid performance issues
- No polling - fetch on page load and after score submission only

## Concurrency Note

The KV read-modify-write pattern has no built-in concurrency control. Simultaneous submissions could theoretically cause a score to be dropped or misordered. For this casual game with low traffic, this is an acceptable tradeoff. If contention becomes an issue, consider:
- Using Cloudflare Durable Objects for atomic updates
- Adding optimistic locking with a version field

For now, the POST response returns the updated leaderboard directly, so clients always see consistent state after their own submission.

## Migration Notes

No migration needed - this is a new feature. Existing localStorage high score can be preserved as a personal best display if desired, separate from the global leaderboard.

## References

- Research document: `thoughts/shared/research/2026-01-14-high-score-system.md`
- Cloudflare KV documentation: https://developers.cloudflare.com/kv/
- Regional indicator symbols (flag emoji): Unicode 6.0, range U+1F1E6 to U+1F1FF
- CF-IPCountry header: https://developers.cloudflare.com/fundamentals/reference/http-headers/
