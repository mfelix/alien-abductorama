import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getKVClient, KVParseError } from '../kv/client.js';
import {
  KV_KEYS,
  Suggestion,
  ModerationItem,
  FeedbackAggregates
} from '../kv/types.js';
import { formatTimestamp, countryCodeToFlag } from '../utils/format.js';
import { confirm } from '../utils/prompt.js';

export function registerFeedbackCommands(program: Command) {
  const feedback = program
    .command('feedback')
    .description('Manage player feedback and suggestions');

  // List public suggestions
  feedback
    .command('list')
    .description('List all public suggestions')
    .option('--json', 'Output as JSON')
    .option('--verbose', 'Include voter IDs in output')
    .option('--sort <field>', 'Sort by: recent, upvotes', 'recent')
    .option('--limit <n>', 'Maximum entries to show', '50')
    .option('--offset <n>', 'Skip first N entries', '0')
    .option('--search <text>', 'Filter by text content')
    .action((options) => {
      const client = getKVClient();
      let suggestions: Suggestion[];

      try {
        suggestions = client.get<Suggestion[]>(KV_KEYS.FEEDBACK_SUGGESTIONS) || [];
      } catch (error) {
        if (error instanceof KVParseError) {
          console.error(chalk.red(`Data corruption detected in suggestions: ${error.message}`));
          console.error(chalk.yellow('Raw content (first 500 chars):'), error.rawContent.slice(0, 500));
          process.exit(1);
        }
        throw error;
      }

      // Filter by search term if provided
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        suggestions = suggestions.filter(s => s.text.toLowerCase().includes(searchLower));
      }

      if (options.json) {
        // Omit voterIds unless verbose
        const output = options.verbose
          ? suggestions
          : suggestions.map(({ voterIds, ...rest }) => rest);
        console.log(JSON.stringify(output, null, 2));
        return;
      }

      if (suggestions.length === 0) {
        console.log(chalk.yellow('No public suggestions found.'));
        return;
      }

      // Sort
      const sorted = [...suggestions].sort((a, b) => {
        if (options.sort === 'upvotes') {
          return b.upvotes - a.upvotes;
        }
        return b.timestamp - a.timestamp;
      });

      // Paginate
      const offset = parseInt(options.offset);
      const limit = parseInt(options.limit);
      const paginated = sorted.slice(offset, offset + limit);

      const table = new Table({
        head: ['#', 'ID (short)', 'Text', 'Country', 'Upvotes', 'Date'],
        colWidths: [4, 12, 50, 8, 8, 12],
        wordWrap: true,
      });

      paginated.forEach((s, i) => {
        table.push([
          offset + i + 1,
          s.id.slice(0, 8),
          s.text,
          countryCodeToFlag(s.countryCode),
          s.upvotes,
          formatTimestamp(s.timestamp),
        ]);
      });

      console.log(chalk.bold(`\nPublic Suggestions (showing ${paginated.length} of ${suggestions.length})\n`));
      console.log(table.toString());

      if (offset + limit < suggestions.length) {
        console.log(chalk.dim(`\nUse --offset ${offset + limit} to see more`));
      }
    });

  // Show moderation queue
  feedback
    .command('queue')
    .description('Show pending moderation queue')
    .option('--json', 'Output as JSON')
    .option('--limit <n>', 'Maximum entries to show', '50')
    .option('--offset <n>', 'Skip first N entries', '0')
    .action((options) => {
      const client = getKVClient();
      let queue: ModerationItem[];

      try {
        queue = client.get<ModerationItem[]>(KV_KEYS.FEEDBACK_MODERATION_QUEUE) || [];
      } catch (error) {
        if (error instanceof KVParseError) {
          console.error(chalk.red(`Data corruption detected in moderation queue: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }

      if (options.json) {
        console.log(JSON.stringify(queue, null, 2));
        return;
      }

      if (queue.length === 0) {
        console.log(chalk.green('Moderation queue is empty.'));
        return;
      }

      // Paginate
      const offset = parseInt(options.offset);
      const limit = parseInt(options.limit);
      const paginated = queue.slice(offset, offset + limit);

      const table = new Table({
        head: ['#', 'ID', 'Text', 'Country', 'Date', 'Status'],
        colWidths: [4, 38, 45, 8, 12, 10],
        wordWrap: true,
      });

      paginated.forEach((item, i) => {
        table.push([
          offset + i + 1,
          item.id,
          item.text,
          countryCodeToFlag(item.countryCode),
          formatTimestamp(item.timestamp),
          chalk.yellow(item.status),
        ]);
      });

      console.log(chalk.bold(`\nModeration Queue (showing ${paginated.length} of ${queue.length} pending)\n`));
      console.log(table.toString());
    });

  // Show rating statistics
  feedback
    .command('stats')
    .description('Show feedback rating statistics')
    .option('--json', 'Output as JSON')
    .action((options) => {
      const client = getKVClient();
      const aggregates = client.get<FeedbackAggregates>(KV_KEYS.FEEDBACK_AGGREGATES);

      if (options.json) {
        console.log(JSON.stringify(aggregates, null, 2));
        return;
      }

      if (!aggregates) {
        console.log(chalk.yellow('No feedback statistics found.'));
        return;
      }

      console.log(chalk.bold(`\nFeedback Statistics (${aggregates.totalResponses} responses)\n`));

      const categories = [
        { name: 'Enjoyment', key: 'enjoyment' as const },
        { name: 'Difficulty', key: 'difficulty' as const },
        { name: 'Return Intent', key: 'returnIntent' as const },
      ];

      categories.forEach(({ name, key }) => {
        const ratings = aggregates.ratings[key];
        const total = Object.values(ratings).reduce((a, b) => a + b, 0);
        const avg = total > 0
          ? Object.entries(ratings).reduce((sum, [k, v]) => sum + parseInt(k) * v, 0) / total
          : 0;

        console.log(chalk.cyan(`${name}: `) + chalk.bold(avg.toFixed(1)) + '/5');

        for (let i = 5; i >= 1; i--) {
          const count = ratings[i.toString()] || 0;
          const bar = '█'.repeat(Math.round((count / Math.max(total, 1)) * 20));
          console.log(`  ${i}★: ${bar} ${count}`);
        }
        console.log();
      });
    });

  // Approve a moderation item
  feedback
    .command('approve <id>')
    .description('Approve a suggestion from the moderation queue')
    .option('--dry-run', 'Show what would happen without making changes')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (id: string, options) => {
      const client = getKVClient({ dryRun: options.dryRun });

      // Get current queue
      const queue = client.get<ModerationItem[]>(KV_KEYS.FEEDBACK_MODERATION_QUEUE) || [];
      const itemIndex = queue.findIndex(item => item.id === id);

      if (itemIndex === -1) {
        console.error(chalk.red(`Item with ID "${id}" not found in moderation queue.`));
        process.exit(1);
      }

      const item = queue[itemIndex];
      console.log(chalk.bold('\nApproving suggestion:\n'));
      console.log(`  ID: ${item.id}`);
      console.log(`  Text: "${item.text}"`);
      console.log(`  Country: ${countryCodeToFlag(item.countryCode)}`);
      console.log(`  Submitted: ${formatTimestamp(item.timestamp)}\n`);

      if (!options.yes && !options.dryRun) {
        const confirmed = await confirm('Approve this suggestion?');
        if (!confirmed) {
          console.log(chalk.yellow('Cancelled.'));
          return;
        }
      }

      // Get current suggestions
      const suggestions = client.get<Suggestion[]>(KV_KEYS.FEEDBACK_SUGGESTIONS) || [];

      // Create new suggestion from moderation item
      const newSuggestion: Suggestion = {
        id: item.id,
        text: item.text,
        countryCode: item.countryCode,
        timestamp: item.timestamp,
        upvotes: 0,
        voterIds: [],
      };

      // Add to suggestions (at the beginning for recency)
      const updatedSuggestions = [newSuggestion, ...suggestions];

      // Remove from queue
      const updatedQueue = queue.filter(q => q.id !== id);

      // Write in order: add to destination first, then remove from source.
      // This way, if the second write fails, we have a duplicate (easily cleaned up)
      // rather than a lost suggestion.
      const suggestionsOk = client.put(KV_KEYS.FEEDBACK_SUGGESTIONS, updatedSuggestions);
      if (!suggestionsOk) {
        console.error(chalk.red('Failed to add suggestion to public list.'));
        process.exit(1);
      }

      const queueOk = client.put(KV_KEYS.FEEDBACK_MODERATION_QUEUE, updatedQueue);
      if (!queueOk) {
        console.error(chalk.yellow('Warning: Suggestion added to public list but failed to remove from queue.'));
        console.error(chalk.yellow('The item may appear in both places. Re-run reject to clean up.'));
        process.exit(1);
      }

      console.log(chalk.green('✓ Suggestion approved and moved to public list.'));
    });

  // Reject a moderation item
  feedback
    .command('reject <id>')
    .description('Reject and remove a suggestion from the moderation queue')
    .option('--dry-run', 'Show what would happen without making changes')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (id: string, options) => {
      const client = getKVClient({ dryRun: options.dryRun });

      const queue = client.get<ModerationItem[]>(KV_KEYS.FEEDBACK_MODERATION_QUEUE) || [];
      const itemIndex = queue.findIndex(item => item.id === id);

      if (itemIndex === -1) {
        console.log(chalk.yellow(`Item with ID "${id}" not found in moderation queue. Nothing to do.`));
        return; // Idempotent: not an error
      }

      const item = queue[itemIndex];
      console.log(chalk.bold('\nRejecting suggestion:\n'));
      console.log(`  ID: ${item.id}`);
      console.log(`  Text: "${item.text}"`);
      console.log();

      if (!options.yes && !options.dryRun) {
        const confirmed = await confirm('Reject this suggestion? It will be permanently deleted.');
        if (!confirmed) {
          console.log(chalk.yellow('Cancelled.'));
          return;
        }
      }

      const updatedQueue = queue.filter(q => q.id !== id);
      const success = client.put(KV_KEYS.FEEDBACK_MODERATION_QUEUE, updatedQueue);

      if (success) {
        console.log(chalk.green('✓ Suggestion rejected and removed from queue.'));
      } else {
        console.error(chalk.red('Failed to update KV storage.'));
        process.exit(1);
      }
    });

  // Delete a public suggestion
  feedback
    .command('delete <id>')
    .description('Delete a suggestion from the public list')
    .option('--dry-run', 'Show what would happen without making changes')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (id: string, options) => {
      const client = getKVClient({ dryRun: options.dryRun });

      const suggestions = client.get<Suggestion[]>(KV_KEYS.FEEDBACK_SUGGESTIONS) || [];
      const itemIndex = suggestions.findIndex(s => s.id === id);

      if (itemIndex === -1) {
        console.log(chalk.yellow(`Suggestion with ID "${id}" not found in public list. Nothing to do.`));
        return; // Idempotent: not an error
      }

      const item = suggestions[itemIndex];
      console.log(chalk.bold('\nDeleting public suggestion:\n'));
      console.log(`  ID: ${item.id}`);
      console.log(`  Text: "${item.text}"`);
      console.log(`  Upvotes: ${item.upvotes}`);
      console.log();

      if (!options.yes && !options.dryRun) {
        const confirmed = await confirm('Delete this suggestion? It will be permanently removed.');
        if (!confirmed) {
          console.log(chalk.yellow('Cancelled.'));
          return;
        }
      }

      const updatedSuggestions = suggestions.filter(s => s.id !== id);
      const success = client.put(KV_KEYS.FEEDBACK_SUGGESTIONS, updatedSuggestions);

      if (success) {
        console.log(chalk.green('✓ Suggestion deleted from public list.'));
      } else {
        console.error(chalk.red('Failed to update KV storage.'));
        process.exit(1);
      }
    });
}
