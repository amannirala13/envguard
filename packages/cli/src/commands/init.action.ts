/**
 * @module @envguard/cli/commands
 * @file init.action.ts
 * @description Implementation of the init command
 */

import fs from 'fs/promises';
import inquirer from 'inquirer';
import { ConfigManager, PackageNameResolver } from '@envguard/core';
import { TemplateFileFinder } from '../utils/template-finder';
import { error, info, success, warn } from '../utils/logger';

/**
 * Options for init command
 */
export interface InitOptions {
  template?: string; // Path to template file
  package?: string; // Package name
  force?: boolean; // Reinitialize
}

/**
 * Default template content
 */
const DEFAULT_TEMPLATE_CONTENT = `# Environment Variables Template
# Define your secrets here (do not commit actual values)
#
# Format: KEY=value
# Lines starting with # are comments

# Database connection string
DATABASE_URL=postgresql://localhost/mydb

# API keys
API_KEY=

# Optional configuration
PORT=3000
NODE_ENV=development
`;

/**
 * Create a default template file
 */
async function createDefaultTemplateFile(filename: string): Promise<void> {
  await fs.writeFile(filename, DEFAULT_TEMPLATE_CONTENT);
}

/**
 * Prompt user to select or enter package name
 *
 * @returns Selected package name
 */
async function promptPackageName(): Promise<string> {
  // Get suggestions from project context
  const suggestions = await PackageNameResolver.suggest(process.cwd());

  // If we have no suggestions, ask user to enter manually
  if (suggestions.length === 0) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'packageName',
        message: 'Enter package name (e.g., com.company.app):',
        default: 'local.my-app',
        validate: (input: string) => {
          const validation = PackageNameResolver.validate(input);
          if (!validation.valid) {
            return validation.error || 'Invalid package name';
          }
          if (validation.error) {
            warn(validation.error);
          }
          return true;
        },
      },
    ]);
    return answer.packageName;
  }

  // Show suggestions with option for custom input
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageName',
      message: 'Select package identifier:',
      choices: [
        ...suggestions.map((s) => ({
          name: `${s}${PackageNameResolver.isReverseDomain(s) ? ' (recommended)' : ''}`,
          value: s,
        })),
        { name: '→ Enter custom name', value: '__custom__' },
      ],
    },
  ]);

  // If custom selected, prompt for input
  if (answer.packageName === '__custom__') {
    const customAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: 'Enter package name (e.g., com.company.app):',
        validate: (input: string) => {
          const validation = PackageNameResolver.validate(input);
          if (!validation.valid) {
            return validation.error || 'Invalid package name';
          }
          if (validation.error) {
            warn(validation.error);
          }
          return true;
        },
      },
    ]);
    return customAnswer.customName;
  }

  return answer.packageName;
}

/**
 * Init command action
 *
 * @param options - Command options
 */
export async function initAction(options: InitOptions): Promise<void> {
  const configManager = new ConfigManager();
  const templateFinder = new TemplateFileFinder();

  // 1. Check if already initialized
  const existing = await configManager.load();
  if (existing && !options.force) {
    warn('EnvGuard already initialized in this project.');
    info(`  Package: ${existing.getPackage()}`);
    info(`  Template: ${existing.getTemplateFile()}`);
    info('\nUse --force to reinitialize.');
    return;
  }

  if (existing && options.force) {
    warn('Reinitializing EnvGuard configuration...\n');
  }

  // 2. Determine package name
  let packageName: string;

  if (options.package) {
    // Validate provided package name
    const validation = PackageNameResolver.validate(options.package);
    if (!validation.valid) {
      error(validation.error || 'Invalid package name');
      process.exit(1);
    }
    if (validation.error) {
      warn(validation.error); // Show warning for non-reverse-domain names
    }
    packageName = options.package;
    info(`Using package name: ${packageName}`);
  } else {
    // Interactive package name selection
    packageName = await promptPackageName();
    info(`Selected package name: ${packageName}`);
  }

  // 3. Determine template file
  let templateFile: string;

  if (options.template) {
    // Template path provided via flag - validate it
    info(`Validating template path: ${options.template}`);

    const validation = await templateFinder.validatePath(options.template);

    if (!validation.valid) {
      error(validation.error || 'Invalid template path');
      process.exit(1);
    }

    // Check if file is readable
    const isReadable = await templateFinder.isReadable(validation.resolved);
    if (!isReadable) {
      error(`Template file is not readable: ${options.template}`);
      process.exit(1);
    }

    templateFile = validation.relative;
    success(`Using template file: ${templateFile}`);
  } else {
    // Auto-detect template file
    const detected = await templateFinder.autoDetect();

    if (detected) {
      templateFile = detected;
      info(`Found existing template: ${templateFile}`);
    } else {
      // No template found, create default
      templateFile = '.env.template';
      info(`No template file found. Creating: ${templateFile}`);
      await createDefaultTemplateFile(templateFile);
      success(`Created ${templateFile}`);
    }
  }

  // 4. Create config (v2)
  await configManager.createV2(packageName);

  // 5. Show success message
  success('\n✓ EnvGuard initialized successfully!');
  info(`  Config: .envguard/config.json`);
  info(`  Package: ${packageName}`);
  info(`  Template: ${templateFile}`);

  // 6. Show next steps
  info('\nNext steps:');
  info(`  1. Edit ${templateFile} to define your secrets`);
  info('  2. Run: envg set <KEY> <value>');
  info('  3. Run: envg list');
  info(`  4. Commit .envguard/ and ${templateFile} to git`);
}
