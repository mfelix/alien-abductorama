import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getKVClient } from '../kv/client.js';
import { KV_KEYS, ScoreEntry, ActivityStats } from '../kv/types.js';
import { formatTimestamp, countryCodeToFlag, formatDuration } from '../utils/format.js';
import { confirm } from '../utils/prompt.js';

export function registerScoresCommands(program: Command) {
  const scores = program
    .command('scores')
    .description('Manage leaderboard scores');

  // List leaderboard
  scores
    .command('list')
    .description('Show the leaderboard')
    .option('--json', 'Output as JSON')
    .option('--limit <n>', 'Number of entries to show', '20')
    .action((options) => {
      const client = getKVClient();
      const leaderboard = client.get<ScoreEntry[]>(KV_KEYS.LEADERBOARD) || [];

      if (options.json) {
        console.log(JSON.stringify(leaderboard, null, 2));
        return;
      }

      if (leaderboard.length === 0) {
        console.log(chalk.yellow('Leaderboard is empty.'));
        return;
      }

      const limit = parseInt(options.limit);
      const entries = leaderboard.slice(0, limit);

      const table = new Table({
        head: ['Rank', 'Name', 'Score', 'Wave', 'Country', 'Time', 'Date'],
        colWidths: [6, 8, 12, 6, 8, 10, 12],
      });

      entries.forEach((entry, i) => {
        table.push([
          i + 1,
          entry.name,
          entry.score.toLocaleString(),
          entry.wave,
          countryCodeToFlag(entry.countryCode),
          formatDuration(entry.gameLength),
          formatTimestamp(entry.timestamp),
        ]);
      });

      console.log(chalk.bold(`\nLeaderboard (${leaderboard.length} total entries)\n`));
      console.log(table.toString());
    });

  // Show activity stats
  scores
    .command('stats')
    .description('Show game activity statistics')
    .option('--json', 'Output as JSON')
    .action((options) => {
      const client = getKVClient();
      const stats = client.get<ActivityStats>(KV_KEYS.ACTIVITY_STATS);

      if (options.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }

      if (!stats) {
        console.log(chalk.yellow('No activity statistics found.'));
        return;
      }

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const gamesLastHour = stats.recentGames.filter(t => t > oneHourAgo).length;
      const gamesLastDay = stats.recentGames.filter(t => t > oneDayAgo).length;
      const gamesLastWeek = stats.recentGames.filter(t => t > oneWeekAgo).length;

      console.log(chalk.bold('\nActivity Statistics\n'));
      console.log(`  Games last hour:  ${chalk.cyan(gamesLastHour)}`);
      console.log(`  Games last 24h:   ${chalk.cyan(gamesLastDay)}`);
      console.log(`  Games last 7d:    ${chalk.cyan(gamesLastWeek)}`);
      console.log(`  Total all time:   ${chalk.cyan(stats.totalGames)}`);
      if (stats.lastPlayedAt) {
        console.log(`  Last played:      ${formatTimestamp(stats.lastPlayedAt)}`);
      }
      console.log();
    });

  // Remove a score (for cheaters)
  scores
    .command('remove <id>')
    .description('Remove a score entry from the leaderboard')
    .option('--dry-run', 'Show what would happen without making changes')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (id: string, options) => {
      const client = getKVClient({ dryRun: options.dryRun });

      const leaderboard = client.get<ScoreEntry[]>(KV_KEYS.LEADERBOARD) || [];
      const entryIndex = leaderboard.findIndex(e => e.id === id);

      if (entryIndex === -1) {
        console.log(chalk.yellow(`Score entry with ID "${id}" not found. Nothing to do.`));
        return; // Idempotent: not an error
      }

      const entry = leaderboard[entryIndex];
      console.log(chalk.bold('\nRemoving score entry:\n'));
      console.log(`  Rank: #${entryIndex + 1}`);
      console.log(`  Name: ${entry.name}`);
      console.log(`  Score: ${entry.score.toLocaleString()}`);
      console.log(`  Wave: ${entry.wave}`);
      console.log(`  Country: ${countryCodeToFlag(entry.countryCode)}`);
      console.log();

      if (!options.yes && !options.dryRun) {
        const confirmed = await confirm('Remove this score? It will be permanently deleted.');
        if (!confirmed) {
          console.log(chalk.yellow('Cancelled.'));
          return;
        }
      }

      const updatedLeaderboard = leaderboard.filter(e => e.id !== id);
      const success = client.put(KV_KEYS.LEADERBOARD, updatedLeaderboard);

      if (success) {
        console.log(chalk.green('✓ Score entry removed from leaderboard.'));
      } else {
        console.error(chalk.red('Failed to update KV storage.'));
        process.exit(1);
      }
    });
}
