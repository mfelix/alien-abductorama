// Matches structures in src/worker.js

export interface Suggestion {
  id: string;
  text: string;
  countryCode: string;
  timestamp: number;
  upvotes: number;
  voterIds: string[];
}

export interface ModerationItem {
  id: string;
  text: string;
  countryCode: string;
  timestamp: number;
  status: 'pending';
}

export interface FeedbackAggregates {
  totalResponses: number;
  ratings: {
    enjoyment: Record<string, number>;
    difficulty: Record<string, number>;
    returnIntent: Record<string, number>;
  };
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  wave: number;
  countryCode: string;
  timestamp: number;
  gameLength: number;
}

export interface ActivityStats {
  totalGames: number;
  recentGames: number[];
  lastPlayedAt?: number;
}

// KV key constants
export const KV_KEYS = {
  LEADERBOARD: 'leaderboard',
  ACTIVITY_STATS: 'activity_stats',
  FEEDBACK_AGGREGATES: 'feedback_aggregates',
  FEEDBACK_SUGGESTIONS: 'feedback_suggestions',
  FEEDBACK_MODERATION_QUEUE: 'feedback_moderation_queue',
} as const;
