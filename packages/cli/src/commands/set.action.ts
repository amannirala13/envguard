/**
 * @module @envguard/cli/commands
 * @file set.action.ts
 * @description Implementation of the set command
 */

import { SystemKeychain } from '@envguard/core';
import { ConfigManager } from '@envguard/core';
import { error, LogTag, success, verbose } from '../utils/logger';

/**
 * Options for set command
 */
export interface SetOptions {
  verbose?: boolean;
  optional?: boolean;
  env?: string;
}

/**
 * Set command action
 *
 * @param key - The key of the secret to store
 * @param value - The value of the secret to store
 * @param options - Command options
 */
export async function setAction(
  key: string,
  value: string,
  options: SetOptions
): Promise<void> {
  const configManager = new ConfigManager();

  verbose(options.verbose === true, LogTag.LOG, 'options:', options);
  verbose(options.verbose === true, LogTag.LOG, 'key:', key);
  verbose(options.verbose === true, LogTag.LOG, 'value:', value);

  // 1. Check if EnvGuard is initialized
  const config = await configManager.load();
  if (!config) {
    error('EnvGuard not initialized. Run "envg init" first.');
    process.exit(1);
  }

  const packageName = config.getPackage();
  const defaultEnvironment = config.getDefaultEnvironment();
  const environment = options.env || defaultEnvironment;

  verbose(
    options.verbose === true,
    LogTag.LOG,
    `Using package: ${packageName}`
  );
  verbose(
    options.verbose === true,
    LogTag.LOG,
    `Using environment: ${environment}`
  );

  // 2. Store secret in keychain (also updates manifest)
  const keychain = new SystemKeychain(
    packageName,
    process.cwd(),
    defaultEnvironment
  );
  const required = !options.optional; // Convert --optional flag to required boolean

  try {
    await keychain.set(key, value, required, options.env);
    verbose(
      options.verbose === true,
      LogTag.SUCCESS,
      `Stored secret for key: ${key} in ${environment} (${required ? 'required' : 'optional'})`
    );
  } catch (err) {
    error('Failed to store secret:', err);
    process.exit(1);
  }

  // 3. Show success message
  const typeLabel = required ? 'required' : 'optional';
  success(
    `Secret "${key}" stored successfully in ${environment} environment (${typeLabel})`
  );
}
