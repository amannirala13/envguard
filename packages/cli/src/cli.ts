#!/usr/bin/env node

import { program } from 'commander';
import { initAction } from './commands/init.action';
import { setAction } from './commands/set.action';
import { getAction } from './commands/get.action';
import { delAction } from './commands/del.action';
import { listAction } from './commands/list.action';
import { checkAction } from './commands/check.action';
import { exportAction } from './commands/export.action';
import { migrateAction } from './commands/migrate.action';
import { templateAction } from './commands/template.action';
import { info, LogTag, verbose, warn } from './utils/logger';

const version = '0.1.0';

// Set up the main program
program
  .name('envg')
  .description('Local-first secret management for developers')
  .version(version)
  .option('-v, --verbose', 'Enable verbose logging')
  .hook('preAction', (thisCommand) => {
    const options: { verbose?: boolean } = thisCommand.opts();
    verbose(
      options.verbose === true,
      LogTag.LOG,
      `[EnvGuard v${version}] Running command: ${thisCommand.name()}`
    );
  });

// Init command
program
  .command('init')
  .description('Initialize EnvGuard in the current directory')
  .option(
    '-t, --template <path>',
    'Path to template file (relative or absolute)'
  )
  .option('-p, --package <name>', 'Package name (skips auto-detection)')
  .option('-f, --force', 'Reinitialize if already initialized')
  .action(async (options) => {
    await initAction(options);
  });

/**
 * Store a secret in the OS keychain
 * @command set <key> <value>
 * @param key - The key of the secret to store
 * @param value - The value of the secret to store
 * @option -v, --verbose - Enable verbose logging
 * @option -o, --optional - Mark this secret as optional (default: required)
 * @example
 * ```bash
 * envg set API_KEY abc123 --verbose
 * envg set OPTIONAL_KEY value --optional
 * ```
 * @remarks
 * This command stores a secret in the OS keychain using the package name from config.
 * By default, secrets are marked as required. Use --optional to mark them as optional.
 *
 * @see {@link SystemKeychain} for the underlying keychain implementation.
 */
program
  .command('set <key> <value>')
  .description('Store a secret in the OS keychain')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option(
    '-o, --optional',
    'Mark this secret as optional (default: required)',
    false
  )
  .option('-e, --env <environment>', 'Environment name (default: development)')
  .action(
    async (
      key: string,
      value: string,
      options: { verbose?: boolean; optional?: boolean; env?: string }
    ) => {
      await setAction(key, value, options);
    }
  );

/**
 * Retrieve a secret from the OS keychain
 * @command get <key>
 * @param key - The key of the secret to retrieve
 * @option -v, --verbose - Enable verbose logging
 * @option -df, --defaultFallback <value> - Default value if secret not found
 * @example
 * ```bash
 * envg get API_KEY --verbose --defaultFallback "default_value"
 * ```
 * @remarks
 * This command retrieves a secret stored in the OS keychain using the package name from config.
 * If the secret is not found, it can return a default fallback value if provided.
 *
 * @see {@link SystemKeychain} for the underlying keychain implementation.
 */
program
  .command('get <key>')
  .description('Retrieve a secret from the OS keychain')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-df, --defaultFallback <value>', 'Default value if secret not found')
  .option('-e, --env <environment>', 'Environment name (default: development)')
  .action(
    async (
      key: string,
      options: { verbose?: boolean; defaultFallback?: unknown; env?: string }
    ) => {
      await getAction(key, options);
    }
  );

program
  .command('del <key>')
  .description('Delete a secret from the OS keychain')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-e, --env <environment>', 'Environment name (default: development)')
  .action(async (key: string, options: { verbose?: boolean; env?: string }) => {
    await delAction(key, options);
  });

program
  .command('list')
  .description('List all stored secrets (keys only)')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .action(async (options: { verbose: boolean }) => {
    await listAction(options);
  });

program
  .command('check')
  .description('Check secrets and security issues')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--secrets', 'Only check secrets')
  .option('--security', 'Only check security issues')
  .action(
    async (options: {
      verbose?: boolean;
      secrets?: boolean;
      security?: boolean;
    }) => {
      await checkAction(options);
    }
  );

program
  .command('migrate')
  .description('Migrate from .env files to EnvGuard')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--auto', 'Auto-accept all prompts')
  .option('--keep-files', 'Keep .env files after migration')
  .option('--from <file>', 'Migrate from specific file')
  .action(
    async (options: {
      verbose?: boolean;
      auto?: boolean;
      keepFiles?: boolean;
      from?: string;
    }) => {
      await migrateAction(options);
    }
  );

program
  .command('export')
  .description('Export secrets to .env file (INSECURE)')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--unsafe', 'Confirm you understand the security risks', false)
  .option('--to <file>', 'Output filename', '.env')
  .option('-e, --env <environment>', 'Environment to export')
  .action(
    async (options: {
      verbose?: boolean;
      unsafe?: boolean;
      to?: string;
      env?: string;
    }) => {
      await exportAction(options);
    }
  );

program
  .command('template')
  .description('Generate .env.template from current secrets')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-f, --force', 'Overwrite existing template')
  .action(async (options: { verbose?: boolean; force?: boolean }) => {
    await templateAction(options);
  });

program
  .command('status')
  .description('Show current EnvGuard status and configuration')
  .action(() => {
    info('EnvGuard Status');
    info(`Version: ${version}`);
    info(`Node.js: ${process.version}`);
    info(`Platform: ${process.platform} ${process.arch}`);
    warn('Full functionality coming soon.');

    info('');
    info('Implementation Progress:');
    info('  • Keychain integration (in progress)');
    info('  • CLI commands');
    info('  • Config validation');
    info('  • Runtime runners');
  });

// Add help examples
program.addHelpText(
  'after',
  `
Examples:
  $ envg status                            Show current status
  $ envg init                              Initialize in current directory
  $ envg set API_KEY abc123                Store a secret in default environment (development)
  $ envg set API_KEY xyz789 --env prod     Store a secret in production environment
  $ envg get API_KEY                       Retrieve a secret from development
  $ envg get API_KEY --env production      Retrieve from production environment
  $ envg del API_KEY --env staging         Delete from staging environment
  $ envg list                              List all secrets

Environment Support:
  Use --env to specify environment (development, staging, production, etc.)
  Default environment is 'development' if not specified.

Development:
  This is a development build. See .plan/implementation-guidebook.md
  for the full implementation roadmap and current progress.
`
);

// Parse CLI arguments
program.parse(process.argv);

// Show help if no arguments provided
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
}
