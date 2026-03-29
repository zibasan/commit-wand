#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { checkCommit } from './commands/check.js';
import { initHusky } from './commands/init.js';
import { error, warn } from './utils/symbols.js';

const currentNodeVersion = process.versions.node;
const majorVersion = parseInt(currentNodeVersion.split('.')[0], 10);

if (majorVersion < 22) {
  console.error(chalk.bgRed.black(`${error} FATAL `) + chalk.red(`This CLI requires Node.js v22 or higher.`));
  console.error(chalk.yellow(`You are currently running Node.js v${currentNodeVersion}.`));
  console.error(chalk.yellow(`Please upgrade your Node.js version (v22 or higher) to use this CLI.`));
  process.exit(1);
}

if (majorVersion > 22) {
  console.warn(
    warn + chalk.yellow(` You are running Node.js v${chalk.red(currentNodeVersion)}.\n` +
    `Due to a known compatibility issue in the underlying prompt library on Node.js v23+,\n` +
    `pressing [Ctrl+C] during a prompt might result in a crash instead of a graceful exit.\n` +
    `For the most stable experience, Node.js v22 (LTS) is highly recommended.\n`) +
    '=================================================================\n'
  );
}

// SIGINT (Ctrl+C) のハンドリング
// questionsFunc.ts で発火したシグナルをここで受け止め、安全に終了します。
process.on('SIGINT', () => {
  console.log(
    chalk.bgYellow.black(' CANCELED ') +
      chalk.yellow(' Processing has been canceled. Abort the commit.')
  );
  process.exit(1);
});

const program = new Command();
program.name('cw').version('1.0.21').description('A CLI to check and fix Conventional Commits');
program.argument('<file>', 'Path to the commit message file').action(async (file) => {
  await checkCommit(file);
});
program
  .command('init')
  .description('Initialize Husky and setup the commit-msg hook automatically')
  .action(async () => {
    await initHusky();
  });

program.parse(process.argv);
