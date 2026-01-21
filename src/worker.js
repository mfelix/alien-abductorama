// Cloudflare Workers entry point
// Static assets are served automatically via the [assets] configuration in wrangler.toml

const LEADERBOARD_KEY = 'leaderboard';
const MAX_ENTRIES = 100;

// Activity tracking constants
const ACTIVITY_KEY = 'activity_stats';
const MAX_RECENT_GAMES = 100; // Keep last 100 timestamps for rolling window

// Feedback constants
const FEEDBACK_SUGGESTIONS_KEY = 'feedback_suggestions';
const FEEDBACK_AGGREGATES_KEY = 'feedback_aggregates';
const FEEDBACK_MODERATION_KEY = 'feedback_moderation_queue';
const MAX_SUGGESTIONS = 500; // Keep last 500 suggestions
const MAX_SUGGESTION_LENGTH = 300;
const MAX_MODERATION_QUEUE = 200; // Keep last 200 pending moderation items

// Basic profanity filter (expandable)
const PROFANITY_LIST = [
	'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'cock',
	'pussy', 'nigger', 'faggot', 'retard', 'slut', 'whore'
];

// Anti-cheat constants
const MAX_SCORE_PER_SECOND = 500; // Reasonable max with combos
const MIN_GAME_LENGTH_SECONDS = 10;

// CORS configuration
const ALLOWED_ORIGINS = [
	'https://alien-abductorama.mfelixstudio.workers.dev',
	'https://studio.mfelix.org',
];

function getCorsHeaders(request) {
	const origin = request.headers.get('Origin');
	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		return {
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};
	}
	return {};
}

function handleCorsPreflightRequest(request) {
	const origin = request.headers.get('Origin');
	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		return new Response(null, {
			status: 204,
			headers: getCorsHeaders(request),
		});
	}
	return new Response('Forbidden', { status: 403 });
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return handleCorsPreflightRequest(request);
		}

		// Handle API routes
		if (url.pathname === '/api/scores') {
			if (request.method === 'GET') {
				return handleGetScores(request, env);
			}
			if (request.method === 'POST') {
				return handlePostScore(request, env);
			}
			return new Response('Method Not Allowed', { status: 405 });
		}

		if (url.pathname === '/api/session') {
			if (request.method === 'POST') {
				return handlePostSession(request, env);
			}
			return new Response('Method Not Allowed', { status: 405 });
		}

		if (url.pathname === '/api/feedback') {
			if (request.method === 'GET') {
				return handleGetFeedback(request, env, url);
			}
			if (request.method === 'POST') {
				return handlePostFeedback(request, env);
			}
			return new Response('Method Not Allowed', { status: 405 });
		}

		// Match /api/feedback/{id}/vote
		const voteMatch = url.pathname.match(/^\/api\/feedback\/([^/]+)\/vote$/);
		if (voteMatch) {
			if (request.method === 'POST') {
				return handlePostVote(request, env, voteMatch[1]);
			}
			return new Response('Method Not Allowed', { status: 405 });
		}

		if (url.pathname === '/api/feedback/moderation') {
			if (request.method === 'POST') {
				return handlePostModerationFeedback(request, env);
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

	// Update lastPlayedAt (score submission counts as playing)
	stats.lastPlayedAt = timestamp;

	// Add new timestamp and trim to max size
	stats.recentGames.push(timestamp);
	if (stats.recentGames.length > MAX_RECENT_GAMES) {
		stats.recentGames = stats.recentGames.slice(-MAX_RECENT_GAMES);
	}

	await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(ACTIVITY_KEY, JSON.stringify(stats));
	return stats;
}

async function updateLastPlayedAt(env, timestamp) {
	const stats = await getActivityStats(env);
	stats.lastPlayedAt = timestamp;
	await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(ACTIVITY_KEY, JSON.stringify(stats));
	return stats;
}

function calculateGamesThisWeek(recentGames) {
	const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
	return recentGames.filter(ts => ts > oneWeekAgo).length;
}

// Feedback helpers
function containsProfanity(text) {
	const lower = text.toLowerCase();
	return PROFANITY_LIST.some(word => {
		// Match whole words or word boundaries
		const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
		return regex.test(lower);
	});
}

async function getFeedbackAggregates(env) {
	const aggregates = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(FEEDBACK_AGGREGATES_KEY, { type: 'json' });
	return aggregates || {
		totalResponses: 0,
		ratings: {
			enjoyment: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
			difficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
			returnIntent: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
		}
	};
}

async function getFeedbackSuggestions(env) {
	const suggestions = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(FEEDBACK_SUGGESTIONS_KEY, { type: 'json' });
	return suggestions || [];
}

async function handleGetScores(request, env) {
	const corsHeaders = getCorsHeaders(request);
	try {
		const leaderboard = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(LEADERBOARD_KEY, { type: 'json' });
		const activityStats = await getActivityStats(env);

		const stats = {
			lastGamePlayed: activityStats.lastPlayedAt
				?? (activityStats.recentGames.length > 0
					? activityStats.recentGames[activityStats.recentGames.length - 1]
					: null),
			gamesThisWeek: calculateGamesThisWeek(activityStats.recentGames),
		};

		return new Response(JSON.stringify({ leaderboard: leaderboard || [], stats }), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=10',
				...corsHeaders,
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch scores' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}

async function handlePostScore(request, env) {
	const corsHeaders = getCorsHeaders(request);
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
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
			return new Response(JSON.stringify({ error: 'Invalid score' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		if (typeof wave !== 'number' || wave < 1 || !Number.isInteger(wave)) {
			return new Response(JSON.stringify({ error: 'Invalid wave' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		if (typeof gameLength !== 'number' || gameLength < MIN_GAME_LENGTH_SECONDS) {
			return new Response(JSON.stringify({ error: 'Invalid game length' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		// Basic anti-cheat: score vs time reasonableness
		const scorePerSecond = score / gameLength;
		if (scorePerSecond > MAX_SCORE_PER_SECOND) {
			return new Response(JSON.stringify({ error: 'Score rejected' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to save score' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}

async function handlePostSession(request, env) {
	const corsHeaders = getCorsHeaders(request);
	try {
		const timestamp = Date.now();
		await updateLastPlayedAt(env, timestamp);

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to update session' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}

async function handleGetFeedback(request, env, url) {
	const corsHeaders = getCorsHeaders(request);
	try {
		const sort = url.searchParams.get('sort') || 'recent';
		const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
		const offset = parseInt(url.searchParams.get('offset')) || 0;

		const [aggregates, allSuggestions] = await Promise.all([
			getFeedbackAggregates(env),
			getFeedbackSuggestions(env)
		]);

		// Sort suggestions
		let sorted = [...allSuggestions];
		if (sort === 'top') {
			sorted.sort((a, b) => b.upvotes - a.upvotes);
		} else {
			sorted.sort((a, b) => b.timestamp - a.timestamp);
		}

		// Paginate
		const suggestions = sorted.slice(offset, offset + limit);

		// Calculate average ratings
		const avgRatings = {};
		for (const [key, counts] of Object.entries(aggregates.ratings)) {
			let sum = 0, total = 0;
			for (const [rating, count] of Object.entries(counts)) {
				sum += parseInt(rating) * count;
				total += count;
			}
			avgRatings[key] = total > 0 ? (sum / total).toFixed(1) : '0.0';
		}

		return new Response(JSON.stringify({
			suggestions,
			stats: {
				totalResponses: aggregates.totalResponses,
				averageRatings: avgRatings,
				totalSuggestions: allSuggestions.length
			},
			pagination: {
				offset,
				limit,
				total: allSuggestions.length
			}
		}), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch feedback' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	}
}

async function handlePostFeedback(request, env) {
	const corsHeaders = getCorsHeaders(request);
	try {
		const body = await request.json();
		const { enjoymentRating, difficultyRating, returnIntentRating, suggestion } = body;

		// Validate ratings (1-5)
		for (const [name, rating] of [
			['enjoymentRating', enjoymentRating],
			['difficultyRating', difficultyRating],
			['returnIntentRating', returnIntentRating]
		]) {
			if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
				return new Response(JSON.stringify({ error: `Invalid ${name}: must be integer 1-5` }), {
					status: 400,
					headers: { 'Content-Type': 'application/json', ...corsHeaders }
				});
			}
		}

		// Validate suggestion if provided
		let cleanSuggestion = null;
		if (suggestion && typeof suggestion === 'string') {
			const trimmed = suggestion.trim();
			if (trimmed.length > 0) {
				if (trimmed.length > MAX_SUGGESTION_LENGTH) {
					return new Response(JSON.stringify({ error: `Suggestion too long: max ${MAX_SUGGESTION_LENGTH} characters` }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				if (containsProfanity(trimmed)) {
					return new Response(JSON.stringify({ error: 'Suggestion contains inappropriate language' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', ...corsHeaders }
					});
				}
				cleanSuggestion = trimmed;
			}
		}

		const countryCode = request.headers.get('CF-IPCountry') || 'XX';
		const timestamp = Date.now();

		// Update aggregates
		const aggregates = await getFeedbackAggregates(env);
		aggregates.totalResponses += 1;
		aggregates.ratings.enjoyment[enjoymentRating] += 1;
		aggregates.ratings.difficulty[difficultyRating] += 1;
		aggregates.ratings.returnIntent[returnIntentRating] += 1;
		await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(FEEDBACK_AGGREGATES_KEY, JSON.stringify(aggregates));

		// Add suggestion if provided
		let suggestionId = null;
		if (cleanSuggestion) {
			suggestionId = crypto.randomUUID();
			const suggestions = await getFeedbackSuggestions(env);
			suggestions.push({
				id: suggestionId,
				text: cleanSuggestion,
				countryCode,
				timestamp,
				upvotes: 0,
				voterIds: []
			});

			// Keep only the most recent suggestions
			const trimmed = suggestions.slice(-MAX_SUGGESTIONS);
			await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(FEEDBACK_SUGGESTIONS_KEY, JSON.stringify(trimmed));
		}

		return new Response(JSON.stringify({
			success: true,
			suggestionId
		}), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to submit feedback' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	}
}

async function handlePostVote(request, env, suggestionId) {
	const corsHeaders = getCorsHeaders(request);
	try {
		const body = await request.json();
		const { voterId } = body;

		if (!voterId || typeof voterId !== 'string') {
			return new Response(JSON.stringify({ error: 'Invalid voterId' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		const suggestions = await getFeedbackSuggestions(env);
		const suggestion = suggestions.find(s => s.id === suggestionId);

		if (!suggestion) {
			return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		// Check if already voted
		if (suggestion.voterIds.includes(voterId)) {
			return new Response(JSON.stringify({
				success: false,
				error: 'Already voted',
				upvotes: suggestion.upvotes
			}), {
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		// Add vote
		suggestion.voterIds.push(voterId);
		suggestion.upvotes += 1;

		await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(FEEDBACK_SUGGESTIONS_KEY, JSON.stringify(suggestions));

		return new Response(JSON.stringify({
			success: true,
			upvotes: suggestion.upvotes
		}), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to submit vote' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	}
}

async function handlePostModerationFeedback(request, env) {
	const corsHeaders = getCorsHeaders(request);
	try {
		const body = await request.json();
		const { suggestion } = body;

		// Validate suggestion
		if (!suggestion || typeof suggestion !== 'string') {
			return new Response(JSON.stringify({ error: 'Suggestion is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		const trimmed = suggestion.trim();
		if (trimmed.length === 0) {
			return new Response(JSON.stringify({ error: 'Suggestion cannot be empty' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		if (trimmed.length > MAX_SUGGESTION_LENGTH) {
			return new Response(JSON.stringify({ error: `Suggestion too long: max ${MAX_SUGGESTION_LENGTH} characters` }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders }
			});
		}

		const countryCode = request.headers.get('CF-IPCountry') || 'XX';
		const timestamp = Date.now();
		const id = crypto.randomUUID();

		// Get current moderation queue
		const queue = await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.get(FEEDBACK_MODERATION_KEY, { type: 'json' }) || [];

		// Add to queue
		queue.push({
			id,
			text: trimmed,
			countryCode,
			timestamp,
			status: 'pending'
		});

		// Keep only the most recent items
		const trimmedQueue = queue.slice(-MAX_MODERATION_QUEUE);
		await env.ALIEN_ABDUCTORAMA_HIGH_SCORES.put(FEEDBACK_MODERATION_KEY, JSON.stringify(trimmedQueue));

		return new Response(JSON.stringify({
			success: true,
			id
		}), {
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to submit feedback' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders }
		});
	}
}
