/**
 * @file config-migrator.test.ts
 * @description Tests for ConfigMigrator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { ConfigMigrator } from '../../src/config/config-migrator';
import { EnvGuardConfig, EnvGuardConfigV2 } from '../../src/config/config';

describe('ConfigMigrator', () => {
  const testDir = path.join(process.cwd(), '__test-config-migrator__');
  const configPath = path.join(testDir, '.envguard', 'config.json');

  beforeEach(async () => {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('detectVersion', () => {
    it('should detect v2 config', async () => {
      const v2Config = EnvGuardConfigV2.createDefault('com.test.app');
      await fs.writeFile(
        configPath,
        JSON.stringify(v2Config.toObject(), null, 2)
      );

      const version = await ConfigMigrator.detectVersion(configPath);
      expect(version).toBe('v2');
    });

    it('should detect v1 config', async () => {
      const v1Config = {
        package: 'my-app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      };
      await fs.writeFile(configPath, JSON.stringify(v1Config, null, 2));

      const version = await ConfigMigrator.detectVersion(configPath);
      expect(version).toBe('v1');
    });

    it('should return null for non-existent file', async () => {
      const version = await ConfigMigrator.detectVersion('non-existent.json');
      expect(version).toBeNull();
    });

    it('should return null for invalid config', async () => {
      await fs.writeFile(
        configPath,
        JSON.stringify({ invalid: 'config' }, null, 2)
      );

      const version = await ConfigMigrator.detectVersion(configPath);
      expect(version).toBeNull();
    });
  });

  describe('migrateV1ToV2', () => {
    it('should migrate v1 config to v2', () => {
      const v1Config = new EnvGuardConfig({
        package: 'my-app',
        templateFile: '.env.example',
        manifestVersion: '1.0',
        defaultEnvironment: 'staging',
      });

      const v2Config = ConfigMigrator.migrateV1ToV2(v1Config);

      expect(v2Config.version).toBe('2.0.0');
      expect(v2Config.package.name).toBe('my-app');
      expect(v2Config.environments.default).toBe('staging');
      expect(v2Config.paths.template).toBe('.env.example');
      expect(v2Config.manifest.version).toBe('1.0');
    });

    it('should preserve template file path', () => {
      const v1Config = new EnvGuardConfig({
        package: 'test-app',
        templateFile: 'config/.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      });

      const v2Config = ConfigMigrator.migrateV1ToV2(v1Config);

      expect(v2Config.paths.template).toBe('config/.env.template');
    });

    it('should detect package type correctly', () => {
      const v1ReverseConfig = new EnvGuardConfig({
        package: 'com.company.app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      });

      const v2Config = ConfigMigrator.migrateV1ToV2(v1ReverseConfig);

      expect(v2Config.package.type).toBe('reverse-domain');
    });
  });

  describe('backupV1Config', () => {
    it('should create backup file', async () => {
      const v1Config = new EnvGuardConfig({
        package: 'my-app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      });

      const backupPath = await ConfigMigrator.backupV1Config(v1Config, testDir);

      expect(backupPath).toContain('.envguard/config.v1.backup');
      expect(backupPath).toContain('.json');

      const backupExists = await fs
        .access(backupPath)
        .then(() => true)
        .catch(() => false);
      expect(backupExists).toBe(true);

      const backupContent = JSON.parse(await fs.readFile(backupPath, 'utf-8'));
      expect(backupContent.package).toBe('my-app');
    });
  });

  describe('performMigration', () => {
    it('should perform full migration with backup', async () => {
      const v1Config = new EnvGuardConfig({
        package: 'my-app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      });

      await fs.writeFile(
        configPath,
        JSON.stringify(v1Config.toObject(), null, 2)
      );

      const result = await ConfigMigrator.performMigration(
        configPath,
        v1Config
      );

      expect(result.success).toBe(true);
      expect(result.version).toBe('v2');
      expect(result.backupPath).toBeDefined();

      // Check that config was actually migrated
      const version = await ConfigMigrator.detectVersion(configPath);
      expect(version).toBe('v2');
    });

    it('should handle migration errors gracefully', async () => {
      const v1Config = new EnvGuardConfig({
        package: 'my-app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      });

      // Use invalid path to trigger error
      const result = await ConfigMigrator.performMigration(
        '/invalid/path/config.json',
        v1Config
      );

      expect(result.success).toBe(false);
      expect(result.version).toBe('v1');
      expect(result.error).toBeDefined();
    });
  });

  describe('needsMigration', () => {
    it('should return true for v1 config', async () => {
      const v1Config = {
        package: 'my-app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      };
      await fs.writeFile(configPath, JSON.stringify(v1Config, null, 2));

      const needsMigration = await ConfigMigrator.needsMigration(configPath);
      expect(needsMigration).toBe(true);
    });

    it('should return false for v2 config', async () => {
      const v2Config = EnvGuardConfigV2.createDefault('com.test.app');
      await fs.writeFile(
        configPath,
        JSON.stringify(v2Config.toObject(), null, 2)
      );

      const needsMigration = await ConfigMigrator.needsMigration(configPath);
      expect(needsMigration).toBe(false);
    });

    it('should return false for non-existent config', async () => {
      const needsMigration =
        await ConfigMigrator.needsMigration('non-existent.json');
      expect(needsMigration).toBe(false);
    });
  });

  describe('loadConfig', () => {
    it('should load v1 config', async () => {
      const v1Config = {
        package: 'my-app',
        templateFile: '.env.template',
        manifestVersion: '1.0',
        defaultEnvironment: 'development',
      };
      await fs.writeFile(configPath, JSON.stringify(v1Config, null, 2));

      const config = await ConfigMigrator.loadConfig(configPath);

      expect(config).toBeInstanceOf(EnvGuardConfig);
      expect((config as EnvGuardConfig).getPackage()).toBe('my-app');
    });

    it('should load v2 config', async () => {
      const v2Config = EnvGuardConfigV2.createDefault('com.test.app');
      await fs.writeFile(
        configPath,
        JSON.stringify(v2Config.toObject(), null, 2)
      );

      const config = await ConfigMigrator.loadConfig(configPath);

      expect(config).toBeInstanceOf(EnvGuardConfigV2);
      expect((config as EnvGuardConfigV2).getPackageName()).toBe(
        'com.test.app'
      );
    });

    it('should return null for non-existent file', async () => {
      const config = await ConfigMigrator.loadConfig('non-existent.json');
      expect(config).toBeNull();
    });
  });
});
