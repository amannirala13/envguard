/**
 * @module @envguard/core/config
 * @file config-migrator.ts
 * @description Config migration utilities for v1 → v2
 */

import fs from 'fs/promises';
import path from 'path';
import { EnvGuardConfig, EnvGuardConfigV2 } from './config';

/**
 * Config version type
 */
export type ConfigVersion = 'v1' | 'v2' | null;

/**
 * Migration result
 */
export interface IMigrationResult {
  success: boolean;
  version: ConfigVersion;
  backupPath?: string;
  error?: string;
}

/**
 * Config migrator - handles version detection and migration
 */
export class ConfigMigrator {
  /**
   * Detect config version from file
   *
   * @param configPath - Path to config.json file
   * @returns Config version or null if file doesn't exist
   */
  static async detectVersion(configPath: string): Promise<ConfigVersion> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const raw = JSON.parse(content);

      // Check for v2 version field
      if (raw.version === '2.0.0') {
        return 'v2';
      }

      // Check for v1 structure (package is a string)
      if (raw.package && typeof raw.package === 'string') {
        return 'v1';
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Migrate v1 config to v2
   *
   * @param v1Config - v1 config instance
   * @param cliVersion - CLI version for metadata
   * @returns v2 config instance
   */
  static migrateV1ToV2(
    v1Config: EnvGuardConfig,
    cliVersion: string = '0.3.0'
  ): EnvGuardConfigV2 {
    const packageName = v1Config.getPackage();

    // Create v2 config with defaults
    const v2Config = EnvGuardConfigV2.createDefault(packageName, cliVersion);

    // Migrate existing fields
    v2Config.environments.default = v1Config.getDefaultEnvironment();
    v2Config.paths.template = v1Config.getTemplateFile();

    // Keep manifest version if it exists
    const manifestVersion = v1Config.getManifestVersion();
    if (manifestVersion) {
      v2Config.manifest.version = manifestVersion;
    }

    return v2Config;
  }

  /**
   * Create backup of v1 config
   *
   * @param v1Config - v1 config instance
   * @param projectRoot - Project root directory
   * @returns Path to backup file
   */
  static async backupV1Config(
    v1Config: EnvGuardConfig,
    projectRoot: string = process.cwd()
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      projectRoot,
      '.envguard',
      `config.v1.backup.${timestamp}.json`
    );

    await fs.writeFile(
      backupPath,
      JSON.stringify(v1Config.toObject(), null, 2)
    );

    return backupPath;
  }

  /**
   * Perform full migration from v1 to v2 with backup
   *
   * @param configPath - Path to config.json
   * @param v1Config - v1 config instance
   * @param cliVersion - CLI version for metadata
   * @returns Migration result
   */
  static async performMigration(
    configPath: string,
    v1Config: EnvGuardConfig,
    cliVersion: string = '0.3.0'
  ): Promise<IMigrationResult> {
    try {
      const projectRoot = path.dirname(path.dirname(configPath));

      // Create backup
      const backupPath = await this.backupV1Config(v1Config, projectRoot);

      // Migrate to v2
      const v2Config = this.migrateV1ToV2(v1Config, cliVersion);

      // Write v2 config
      await fs.writeFile(
        configPath,
        JSON.stringify(v2Config.toObject(), null, 2)
      );

      return {
        success: true,
        version: 'v2',
        backupPath,
      };
    } catch (error) {
      return {
        success: false,
        version: 'v1',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if migration is needed
   *
   * @param configPath - Path to config.json
   * @returns True if migration needed (v1 detected)
   */
  static async needsMigration(configPath: string): Promise<boolean> {
    const version = await this.detectVersion(configPath);
    return version === 'v1';
  }

  /**
   * Load config from file (handles both v1 and v2)
   *
   * @param configPath - Path to config.json
   * @returns Config instance (v1 or v2) or null if not found
   */
  static async loadConfig(
    configPath: string
  ): Promise<EnvGuardConfig | EnvGuardConfigV2 | null> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const raw = JSON.parse(content);

      const version = await this.detectVersion(configPath);

      if (version === 'v2') {
        return new EnvGuardConfigV2(raw);
      } else if (version === 'v1') {
        return new EnvGuardConfig(raw);
      }

      return null;
    } catch {
      return null;
    }
  }
}
