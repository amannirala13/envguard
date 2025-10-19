/**
 * @module @envguard/cli/core/config
 * @file config.factory.ts
 * @description Factory pattern for creating EnvGuardConfig instances
 */

import { EnvGuardConfig, IEnvGuardConfig } from './config';

/**
 * Factory for creating EnvGuardConfig instances
 *
 * @remarks
 * Provides various ways to create configuration instances with sensible defaults.
 *
 * @example
 * ```ts
 * // Create with defaults
 * const config = ConfigFactory.createDefault('my-app');
 *
 * // Create from data
 * const config = ConfigFactory.createFromData({
 *   package: 'my-app',
 *   templateFile: '.env.example',
 *   manifestVersion: '1.0'
 * });
 * ```
 */
export class ConfigFactory {
  /**
   * Create a config with default settings
   *
   * @param packageName - Package name
   * @param templateFile - Optional template file (defaults to .env.template)
   * @returns EnvGuardConfig instance
   */
  static createDefault(
    packageName: string,
    templateFile: string = '.env.template'
  ): EnvGuardConfig {
    return new EnvGuardConfig({
      package: packageName,
      templateFile,
      manifestVersion: '1.0',
    });
  }

  /**
   * Create config from raw data
   *
   * @param data - Config data
   * @returns EnvGuardConfig instance
   */
  static createFromData(data: IEnvGuardConfig): EnvGuardConfig {
    return new EnvGuardConfig(data);
  }

  /**
   * Create config with custom template file
   *
   * @param packageName - Package name
   * @param templateFile - Template file path
   * @returns EnvGuardConfig instance
   */
  static createWithTemplate(
    packageName: string,
    templateFile: string
  ): EnvGuardConfig {
    return new EnvGuardConfig({
      package: packageName,
      templateFile,
      manifestVersion: '1.0',
    });
  }

  /**
   * Clone a config instance
   *
   * @param config - Config to clone
   * @returns Cloned config
   */
  static clone(config: EnvGuardConfig): EnvGuardConfig {
    return new EnvGuardConfig(config.toObject());
  }
}
