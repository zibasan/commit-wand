import fs from 'node:fs';
import parse from '@commitlint/parse';
import chalk from 'chalk';
import { askConfirm, askInput, selectType } from '../utils/questionFunc.js';
import { error, info, success, warn } from '../utils/symbols.js';

export async function checkCommit(filePath: string) {
  try {
    // 1. Read the file passed from Git (.git/COMMIT_EDITMSG)
    const rawMessage = fs.readFileSync(filePath, 'utf-8');
    const message = rawMessage
      .replace(/\r\n/g, '\n') // replace CRLF with LF
      .split('\n') // split into lines
      .filter((line) => !line.startsWith('#')) // remove comment lines
      .join('\n')
      .trim(); // trim leading/trailing whitespace

    const parserOpts = {
      headerPattern: /^(\w*)(?:\((.*)\))?(!?): (.*)$/,
      headerCorrespondence: ['type', 'scope', 'break', 'subject'],
    };

    if (message) {
      const parsed = await parse(message, undefined, parserOpts);

      const hasValidStructure = parsed.type !== null && parsed.subject !== null;
      const isValidType = parsed.type ? /^[a-z]+$/.test(parsed.type) : false;

      if (hasValidStructure && isValidType) {
        // 2. Check
        console.log(
          success + chalk.green(' Commit messages comply with the rules! Continue with the commit.')
        );
        process.exit(0); // Successful completion (committed as is)
      }

      // 3. Display a prompt if the terms are violated
      console.log(
        warn + chalk.yellow(' The commit message is not compliant with Conventional Commits.')
      );
      console.log(chalk.cyan(`Current message: ${message}\n`));
      console.log(chalk.cyan(`Please create a new commit message.\n`));
    } else {
      console.log(info + chalk.blue(" No commit message provided. Let's create one!\n"));
    }

    // Type selection
    const types = [
      'feat',
      'fix',
      'docs',
      'style',
      'refactor',
      'perf',
      'test',
      'build',
      'ci',
      'chore',
      'revert',
      'custom',
    ];
    const selectedType = await selectType('Choose a commit type:', types);
    let customType = '';

    if (selectedType === 'custom') {
      while (true) {
        const inputCustomType = await askInput('Enter your custom type:');

        if (inputCustomType.trim() === '') {
          console.log(error + chalk.red(' Please enter a non-empty string for the custom type.\n'));
        } else if (!/^[a-z]+$/.test(inputCustomType)) {
          console.log(
            error + chalk.red(' Invalid type string. Please enter lowercase letters only.\n')
          );
        } else {
          customType = inputCustomType;
          break;
        }
      }
    }

    // Input scope (optional)
    const scope = await askInput('Please enter scope (optional):', '');
    scope.trim();

    // Enter the summary (subject) (set the original message as the initial value)
    let subject = '';
    while (true) {
      subject = await askInput('Please enter a commit summary (subject):', message);

      if (subject.trim() === '') {
        console.log(
          error + chalk.red(' Please enter a non-empty string for the commit summary.\n')
        );
      } else {
        break;
      }
    }

    console.log('\n');

    // 3.5 Adding body message (optional)
    console.log(
      chalk.bgBlue.white(' NEXT >> ') +
        chalk.cyan(' Enter a longer description (body) (optional).') +
        chalk.gray.italic('\n Press Enter on an empty line to finish.\n')
    );

    const bodyLines: string[] = [];
    while (true) {
      const line = await askInput(`Line ${bodyLines.length + 1}:`, '');
      if (line === '') {
        break; // Exit the loop when a blank line is entered
      }
      bodyLines.push(line);
    }
    const body = bodyLines.join('\n'); // Combine collected lines with newline characters
    console.log('\n');

    // BREAKING CHANGE
    const isBreakingChange = await askConfirm('Are there any BREAKING changes?', false);
    let breakingDesc = '';
    if (isBreakingChange) {
      while (true) {
        breakingDesc = await askInput('Describe the breaking changes:');
        if (breakingDesc.trim() === '') {
          console.log(error + chalk.red(' Breaking change description cannot be empty.\n'));
        } else {
          break;
        }
      }
    }
    console.log('\n');

    // Issue reference
    const issueRef = await askInput(
      'Does this commit close any issues? (e.g., Closes #123) (optional):',
      ''
    );

    // 4. Assembling a new message
    const cleanScope = scope.replace(/[()]/g, '').trim();
    const scopeStr = cleanScope ? `(${cleanScope})` : '';
    const breakingMarker = isBreakingChange ? '!' : '';

    let newMessage = `${customType || selectedType}${scopeStr}${breakingMarker}: ${subject}`;

    if (body.trim() !== '') {
      newMessage += `\n\n${body.trim()}`;
    }

    // Add footers
    const footers = [];
    if (isBreakingChange) {
      footers.push(`BREAKING CHANGE: ${breakingDesc.trim()}`);
    }
    if (issueRef.trim() !== '') {
      footers.push(issueRef.trim());
    }

    if (footers.length > 0) {
      newMessage += `\n\n${footers.join('\n')}`;
    }

    console.log(`\n${chalk.cyan('Generated message:')} \n${chalk.green.bold(newMessage)}\n`);

    // 5. Final confirmation
    const confirm = await askConfirm('Do you want to commit with this message?', true);

    if (confirm) {
      // Save the file
      fs.writeFileSync(filePath, newMessage, 'utf-8');
      console.log(
        '\n' + success + chalk.green(' Modify the commit message and continue with the commit!')
      );
      process.exit(0);
    } else {
      console.log('\n' + error + chalk.red(' Commit has been aborted.'));
      process.exit(1); // Ended with error (aborts commit)
    }
  } catch (err) {
    console.error(error + chalk.red(' An error has occurred:'), err);
    process.exit(1);
  }
}
