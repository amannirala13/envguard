/**
 * @module @envguard/cli/commands
 * @file config.action.ts
 * @description Implementation of config management commands
 */

import fs from 'fs/promises';
import path from 'path';
import {
  ConfigManager,
  EnvGuardConfigV2,
  ConfigMigrator,
} from '@envguard/core';
import { error, info, success, warn } from '../utils/logger';

/**
 * Options for config get command
 */
export interface ConfigGetOptions {
  verbose?: boolean;
}

/**
 * Options for config set command
 */
export interface ConfigSetOptions {
  verbose?: boolean;
}

/**
 * Options for config list command
 */
export interface ConfigListOptions {
  verbose?: boolean;
}

/**
 * Options for config validate command
 */
export interface ConfigValidateOptions {
  verbose?: boolean;
}

/**
 * Options for config backup command
 */
export interface ConfigBackupOptions {
  output?: string;
  verbose?: boolean;
}

/**
 * Options for config restore command
 */
export interface ConfigRestoreOptions {
  verbose?: boolean;
}

/**
 * Options for config migrate command
 */
export interface ConfigMigrateOptions {
  backup?: boolean;
  verbose?: boolean;
}

/**
 * Get a config value by key (supports dot notation)
 *
 * @param key - Config key (e.g., "package.name", "environments.default")
 * @param options - Command options
 */
export async function configGetAction(
  key: string,
  options: ConfigGetOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const config = await configManager.load();

    if (!config) {
      error('EnvGuard not initialized. Run "envg init" first.');
      process.exit(1);
    }

    // Handle both v1 and v2 configs
    const configObj = config.toObject();
    const value = getNestedValue(configObj, key);

    if (value === undefined) {
      warn(`Config key "${key}" not found`);
      process.exit(1);
    }

    // Pretty print the value
    if (typeof value === 'object') {
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log(value);
    }
  } catch (err) {
    error(`Failed to get config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Set a config value by key (supports dot notation)
 *
 * @param key - Config key (e.g., "package.displayName")
 * @param value - Value to set
 * @param options - Command options
 */
export async function configSetAction(
  key: string,
  value: string,
  options: ConfigSetOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    let config = await configManager.load();

    if (!config) {
      error('EnvGuard not initialized. Run "envg init" first.');
      process.exit(1);
    }

    // Auto-migrate to v2 if needed
    if (!(config instanceof EnvGuardConfigV2)) {
      info('Migrating config to v2...');
      config = await configManager.loadOrMigrate();
      if (!config) {
        error('Migration failed');
        process.exit(1);
      }
    }

    // Set the value
    const success = setNestedValue(config, key, value);
    if (!success) {
      error(`Cannot set config key "${key}"`);
      process.exit(1);
    }

    // Update metadata
    config.updateMetadata('envg-cli');

    // Save
    await configManager.save(config);

    info(`✓ Updated ${key} = ${value}`);
  } catch (err) {
    error(`Failed to set config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * List all config values
 *
 * @param options - Command options
 */
export async function configListAction(
  options: ConfigListOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const config = await configManager.load();

    if (!config) {
      error('EnvGuard not initialized. Run "envg init" first.');
      process.exit(1);
    }

    const configObj = config.toObject();

    // Display config
    info('EnvGuard Configuration:');
    console.log(JSON.stringify(configObj, null, 2));
  } catch (err) {
    error(`Failed to list config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Validate current config
 *
 * @param options - Command options
 */
export async function configValidateAction(
  options: ConfigValidateOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const config = await configManager.load();

    if (!config) {
      error('EnvGuard not initialized. Run "envg init" first.');
      process.exit(1);
    }

    const isValid = config.isValid();

    if (isValid) {
      success('✓ Config is valid');
    } else {
      error('✗ Config is invalid');

      // Provide detailed validation errors for v2
      if (config instanceof EnvGuardConfigV2) {
        const issues: string[] = [];

        if (!config.package.name || config.package.name.trim().length === 0) {
          issues.push('- package.name is empty');
        }

        if (
          !config.environments.allowed ||
          config.environments.allowed.length === 0
        ) {
          issues.push('- environments.allowed is empty');
        }

        if (
          !config.environments.allowed.includes(config.environments.default)
        ) {
          issues.push(
            `- environments.default "${config.environments.default}" not in allowed list`
          );
        }

        if (
          !config.paths.template ||
          config.paths.template.trim().length === 0
        ) {
          issues.push('- paths.template is empty');
        }

        if (issues.length > 0) {
          error('Validation issues:');
          issues.forEach((issue) => console.log(issue));
        }
      }

      process.exit(1);
    }
  } catch (err) {
    error(`Failed to validate config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Backup current config
 *
 * @param options - Command options
 */
export async function configBackupAction(
  options: ConfigBackupOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const config = await configManager.load();

    if (!config) {
      error('EnvGuard not initialized. Run "envg init" first.');
      process.exit(1);
    }

    // Determine backup path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultBackupPath = path.join(
      process.cwd(),
      '.envguard',
      `config.backup.${timestamp}.json`
    );
    const backupPath = options.output || defaultBackupPath;

    // Ensure directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });

    // Write backup
    await fs.writeFile(backupPath, JSON.stringify(config.toObject(), null, 2));

    success(`✓ Config backed up to: ${backupPath}`);
  } catch (err) {
    error(`Failed to backup config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Restore config from backup
 *
 * @param backupPath - Path to backup file
 * @param options - Command options
 */
export async function configRestoreAction(
  backupPath: string,
  options: ConfigRestoreOptions
): Promise<void> {
  try {
    // Read backup file
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(backupContent);

    // Validate backup data
    const version = await ConfigMigrator.detectVersion(backupPath);
    if (!version) {
      error('Invalid backup file format');
      process.exit(1);
    }

    // Create current backup before restoring
    info('Creating backup of current config...');
    const configManager = new ConfigManager();
    const currentConfig = await configManager.load();

    if (currentConfig) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const autoBackupPath = path.join(
        process.cwd(),
        '.envguard',
        `config.pre-restore.${timestamp}.json`
      );
      await fs.writeFile(
        autoBackupPath,
        JSON.stringify(currentConfig.toObject(), null, 2)
      );
      info(`Current config backed up to: ${autoBackupPath}`);
    }

    // Write restored config
    const configPath = configManager.getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(backupData, null, 2));

    success(`✓ Config restored from: ${backupPath}`);
    info('Run "envg config validate" to verify the restored config');
  } catch (err) {
    error(`Failed to restore config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Migrate config from v1 to v2
 *
 * @param options - Command options
 */
export async function configMigrateAction(
  options: ConfigMigrateOptions
): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const configPath = configManager.getConfigPath();

    // Check version
    const version = await ConfigMigrator.detectVersion(configPath);

    if (version === 'v2') {
      info('Config is already v2');
      return;
    }

    if (version !== 'v1') {
      error('No valid config found to migrate');
      process.exit(1);
    }

    // Load v1 config
    const config = await configManager.load();
    if (!config) {
      error('Failed to load config');
      process.exit(1);
    }

    info('Migrating config from v1 to v2...');

    // Perform migration
    const result = await ConfigMigrator.performMigration(configPath, config);

    if (!result.success) {
      error(`Migration failed: ${result.error}`);
      process.exit(1);
    }

    success('✓ Config migrated to v2');
    if (result.backupPath) {
      info(`v1 backup saved to: ${result.backupPath}`);
    }
    info('Run "envg config validate" to verify the migrated config');
  } catch (err) {
    error(`Failed to migrate config: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Get nested value from object using dot notation
 *
 * @param obj - Object to get value from
 * @param key - Dot-notation key (e.g., "package.name")
 * @returns Value or undefined
 */
function getNestedValue(obj: any, key: string): any {
  const keys = key.split('.');
  let value = obj;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Set nested value in object using dot notation
 *
 * @param obj - Object to set value in
 * @param key - Dot-notation key
 * @param value - Value to set
 * @returns True if successful
 */
function setNestedValue(obj: any, key: string, value: string): boolean {
  const keys = key.split('.');
  const lastKey = keys.pop();

  if (!lastKey) {
    return false;
  }

  let target = obj;
  for (const k of keys) {
    if (!(k in target) || typeof target[k] !== 'object') {
      return false;
    }
    target = target[k];
  }

  // Type conversion for known fields
  if (lastKey === 'allowed' && Array.isArray(target[lastKey])) {
    // Parse as array
    try {
      target[lastKey] = JSON.parse(value);
    } catch {
      return false;
    }
  } else if (typeof target[lastKey] === 'boolean') {
    target[lastKey] = value === 'true';
  } else if (typeof target[lastKey] === 'number') {
    target[lastKey] = Number(value);
  } else {
    target[lastKey] = value;
  }

  return true;
}
