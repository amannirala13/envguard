import { program } from 'commander';

/**
 * Welcome Action
 * @command
 * @description Display a welcome message for EnvGuard CLI
 * @example
 * ```bash
 * envguard
 * ```
 * @remarks
 * This command displays a welcome message and brief information about the EnvGuard CLI.
 *
 */
export function welcomeAction() {
  return program
    .command('')
    .description('Display a welcome message for EnvGuard CLI')
    .action(() => {
      console.log('Welcome to EnvGuard CLI!');
      console.log('Your secure environment variable manager.');
      console.log('Use --help to see available commands.');
    });
}
