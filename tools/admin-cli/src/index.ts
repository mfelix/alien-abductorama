#!/usr/bin/env node

import { Command } from 'commander';
import { registerFeedbackCommands } from './commands/feedback.js';
import { registerScoresCommands } from './commands/scores.js';

const program = new Command();

program
  .name('alien-admin')
  .description('Admin CLI for Alien Abducto-rama')
  .version('1.0.0');

// Register command groups
registerFeedbackCommands(program);
registerScoresCommands(program);

// Parse and execute
program.parse();
