#!/usr/bin/env node
import { Command } from 'commander';
import { helloCommand } from './commands/hello.js';

const program = new Command();
program
  .name('convcommit')
  .version('1.0.0')
  .description('A CLI to check and fix Conventional Commits');
program.addCommand(helloCommand());
program.parse(process.argv);
