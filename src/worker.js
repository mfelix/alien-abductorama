// Cloudflare Workers entry point
// Static assets are served automatically via the [assets] configuration in wrangler.toml

const LEADERBOARD_KEY = 'leaderboard';
const MAX_ENTRIES = 10;

// Activity tracking constants
const ACTIVITY_KEY = 'activity_stats';
const MAX_RECENT_GAMES = 100; // Keep last 100 timestamps for rolling window

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

// Activity tracking helpers
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

async function handlePostScore(request, env) {
	try {
		const body = await request.json();
		const { name, score, wave, gameLength } = body;

		// Track this game attempt (before any validation that might reject it)
		const gameTimestamp = Date.now();
		await updateActivityStats(env, gameTimestamp);

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
			timestamp: gameTimestamp,
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
			const stats = {
				lastGamePlayed: gameTimestamp,
				gamesThisWeek: calculateGamesThisWeek((await getActivityStats(env)).recentGames),
			};
			return new Response(JSON.stringify({ success: false, message: 'Score did not qualify', leaderboard, stats }), {
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
		const stats = {
			lastGamePlayed: gameTimestamp,
			gamesThisWeek: calculateGamesThisWeek((await getActivityStats(env)).recentGames),
		};
		return new Response(JSON.stringify({ success: true, rank, leaderboard, stats }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to save score' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
