#!/usr/bin/env node
const { Command } = require('commander');
const pkg = require('../package.json');
const init = require('../src/commands/init');
const check = require('../src/commands/check');
const build = require('../src/commands/build');
const openCmd = require('../src/commands/open');
const preview = require('../src/commands/preview');
const fastlane = require('../src/commands/fastlane');
const doctor = require('../src/commands/doctor');
const skill = require('../src/commands/skill');
const agents = require('../src/commands/agents');
const addLocale = require('../src/commands/addLocale');
const clean = require('../src/commands/clean');

const program = new Command();

program
  .name('ycmeta')
  .description('YCAppStoreMetaKit CLI for Apple App Store metadata management')
  .version(pkg.version);

function handle(action) {
  return async (...args) => {
    try {
      await action(...args);
    } catch (error) {
      const maybeOptions = args[args.length - 1];
      const jsonMode = maybeOptions && typeof maybeOptions.opts === 'function' && maybeOptions.opts().json;
      if (jsonMode) {
        process.stdout.write(JSON.stringify({ ok: false, errors: [error.message], warnings: [], passed: [] }, null, 2) + '\n');
      } else {
        console.error(`Error: ${error.message}`);
      }
      process.exitCode = typeof error.exitCode === 'number' ? error.exitCode : 1;
    }
  };
}

program
  .command('init')
  .alias('i')
  .description('Initialize AppStoreMetadata in the current project')
  .option('--force', 'overwrite existing files')
  .option('--locales <locales>', 'comma-separated locale list (default: en-US,zh-Hans)')
  .action(handle(init));

program
  .command('check')
  .alias('c')
  .description('Check AppStoreMetadata fields, URLs, locales, and App Store limits')
  .option('--json', 'output machine-readable JSON without colored logs')
  .option('--locale <locale>', 'check only the specified locale')
  .action(handle(check));

program
  .command('build')
  .alias('b')
  .description('Build generated/index.html and generated/summary.md')
  .option('--locale <locale>', 'build only the specified locale')
  .action(handle(build));

program
  .command('open')
  .alias('o')
  .description('Open generated/index.html in the default browser')
  .action(handle(openCmd));

program
  .command('preview')
  .alias('p')
  .description('Run check, build, and open')
  .action(handle(preview));

program
  .command('fastlane')
  .alias('f')
  .description('Export fastlane metadata files')
  .action(handle(fastlane));

program
  .command('doctor')
  .alias('d')
  .description('Diagnose AppStoreMetadata structure and configuration')
  .option('--json', 'output machine-readable JSON without colored logs')
  .action(handle(doctor));

program
  .command('skill [target]')
  .alias('s')
  .description('Generate Claude Code and/or Codex project skills. target: claude, codex, all')
  .option('--force', 'overwrite existing skill files')
  .action(handle(skill));

program
  .command('agents')
  .description('Generate or update YCAppStoreMetaKit rules block in AGENTS.md')
  .option('--force', 'accepted for consistency; AGENTS.md managed block is always updated')
  .action(handle(agents));

program
  .command('add-locale <locale>')
  .description('Add a new locale to the project')
  .option('--force', 'overwrite existing locale files')
  .action(handle(addLocale));

program
  .command('clean')
  .description('Remove generated files')
  .action(handle(clean));

program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}`);
  console.error('Run `ycmeta --help` for available commands.');
  process.exit(1);
});

program.parse(process.argv);
