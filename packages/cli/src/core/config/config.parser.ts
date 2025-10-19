/**
 * @module @envguard/cli/core/config
 * @file config.parser.ts
 * @description Handles file I/O, serialization, and validation for EnvGuardConfig
 */

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { EnvGuardConfig, IEnvGuardConfig } from './config';
import { ConfigFactory } from './config.factory';
import { EnvGuardConfigSchema } from '../../types/types.schema';

/**
 * Handles file I/O and validation for EnvGuardConfig
 *
 * @remarks
 * Responsible for reading/writing config from/to .envguard/config.json
 * and validating the data structure using Zod schemas.
 *
 * @example
 * ```ts
 * const parser = new ConfigParser();
 *
 * // Read config
 * const config = await parser.readFromFile('.envguard/config.json');
 *
 * // Write config
 * await parser.writeToFile('.envguard/config.json', config);
 * ```
 */
export class ConfigParser {
  /**
   * Read config from JSON file
   *
   * @param filePath - Path to config file
   * @returns EnvGuardConfig instance or null if file doesn't exist
   * @throws Error if file exists but is invalid
   */
  async readFromFile(filePath: string): Promise<EnvGuardConfig | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseFromJSON(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist
        return null;
      }
      throw new Error(`Failed to read config: ${(error as Error).message}`);
    }
  }

  /**
   * Write config to JSON file
   *
   * @param filePath - Path to config file
   * @param config - Config instance to write
   * @throws Error if write fails
   */
  async writeToFile(filePath: string, config: EnvGuardConfig): Promise<void> {
    try {
      const json = this.serializeToJSON(config);
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, json);
    } catch (error) {
      throw new Error(`Failed to write config: ${(error as Error).message}`);
    }
  }

  /**
   * Parse and validate JSON string to EnvGuardConfig
   *
   * @param jsonString - JSON string to parse
   * @returns EnvGuardConfig instance
   * @throws Error if JSON is invalid or doesn't match schema
   */
  parseFromJSON(jsonString: string): EnvGuardConfig {
    try {
      const rawData = JSON.parse(jsonString);
      const validated = this.validate(rawData);
      return ConfigFactory.createFromData(validated);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format for config');
      }
      throw error;
    }
  }

  /**
   * Serialize EnvGuardConfig to JSON string
   *
   * @param config - Config instance
   * @returns Formatted JSON string
   */
  serializeToJSON(config: EnvGuardConfig): string {
    const data: IEnvGuardConfig = config.toObject();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Validate config data against schema
   *
   * @param data - Data to validate
   * @returns Validated config data
   * @throws Error if validation fails
   */
  validate(data: unknown): IEnvGuardConfig {
    const result = EnvGuardConfigSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Config validation failed: ${result.error.message}`);
    }
    return result.data;
  }

  /**
   * Check if data is a valid config
   *
   * @param data - Data to check
   * @returns True if data matches config schema
   */
  isValid(data: unknown): data is IEnvGuardConfig {
    return EnvGuardConfigSchema.safeParse(data).success;
  }

  /**
   * Check if a config file exists
   *
   * @param filePath - Path to check
   * @returns True if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export type for validation
export type ValidatedConfig = z.infer<typeof EnvGuardConfigSchema>;
