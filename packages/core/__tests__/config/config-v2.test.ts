/**
 * @file config-v2.test.ts
 * @description Tests for EnvGuardConfigV2
 */

import { describe, it, expect } from 'vitest';
import { EnvGuardConfigV2 } from '../../src/config/config';

describe('EnvGuardConfigV2', () => {
  describe('createDefault', () => {
    it('should create default v2 config with reverse domain package', () => {
      const config = EnvGuardConfigV2.createDefault('com.company.app');

      expect(config.version).toBe('2.0.0');
      expect(config.package.name).toBe('com.company.app');
      expect(config.package.type).toBe('reverse-domain');
      expect(config.environments.allowed).toEqual([
        'development',
        'staging',
        'production',
      ]);
      expect(config.environments.default).toBe('development');
      expect(config.paths.template).toBe('.env.template');
      expect(config.paths.manifest).toBe('.envguard/manifest.json');
    });

    it('should create default v2 config with npm package', () => {
      const config = EnvGuardConfigV2.createDefault('@company/app');

      expect(config.package.name).toBe('@company/app');
      expect(config.package.type).toBe('npm');
    });

    it('should create default v2 config with manual package', () => {
      const config = EnvGuardConfigV2.createDefault('my-app');

      expect(config.package.name).toBe('my-app');
      expect(config.package.type).toBe('manual');
    });

    it('should include metadata', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');

      expect(config._metadata).toBeDefined();
      expect(config._metadata?.created).toBeDefined();
      expect(config._metadata?.lastModified).toBeDefined();
      expect(config._metadata?.modifiedBy).toContain('envg-cli');
    });

    it('should include warnings', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');

      expect(config._warnings).toBeDefined();
      expect(config._warnings?.manualEdit).toContain('envg config');
    });
  });

  describe('getters', () => {
    const config = EnvGuardConfigV2.createDefault('com.test.app');

    it('should get package name', () => {
      expect(config.getPackageName()).toBe('com.test.app');
    });

    it('should get display name or package name', () => {
      expect(config.getPackageDisplayName()).toBe('com.test.app');

      config.package.displayName = 'Test App';
      expect(config.getPackageDisplayName()).toBe('Test App');
    });

    it('should get template file', () => {
      expect(config.getTemplateFile()).toBe('.env.template');
    });

    it('should get manifest file', () => {
      expect(config.getManifestFile()).toBe('.envguard/manifest.json');
    });

    it('should get default environment', () => {
      expect(config.getDefaultEnvironment()).toBe('development');
    });

    it('should get allowed environments', () => {
      expect(config.getAllowedEnvironments()).toEqual([
        'development',
        'staging',
        'production',
      ]);
    });

    it('should get manifest version', () => {
      expect(config.getManifestVersion()).toBe('2.0.0');
    });
  });

  describe('isEnvironmentAllowed', () => {
    const config = EnvGuardConfigV2.createDefault('com.test.app');

    it('should return true for allowed environments', () => {
      expect(config.isEnvironmentAllowed('development')).toBe(true);
      expect(config.isEnvironmentAllowed('staging')).toBe(true);
      expect(config.isEnvironmentAllowed('production')).toBe(true);
    });

    it('should return false for non-allowed environments', () => {
      expect(config.isEnvironmentAllowed('test')).toBe(false);
      expect(config.isEnvironmentAllowed('qa')).toBe(false);
    });
  });

  describe('updateMetadata', () => {
    it('should update existing metadata', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      const originalModified = config._metadata?.lastModified;

      // Wait a tiny bit to ensure timestamp changes
      setTimeout(() => {
        config.updateMetadata('envg-cli@0.3.1');

        expect(config._metadata?.modifiedBy).toBe('envg-cli@0.3.1');
        expect(config._metadata?.lastModified).not.toBe(originalModified);
      }, 10);
    });

    it('should create metadata if not exists', () => {
      const config = new EnvGuardConfigV2({
        $schema: 'https://envguard.dev/schemas/config/v2.json',
        version: '2.0.0',
        package: { name: 'test', type: 'manual' },
        environments: {
          allowed: ['development'],
          default: 'development',
          naming: 'strict',
        },
        paths: {
          template: '.env.template',
          manifest: '.envguard/manifest.json',
        },
        validation: {
          enabled: true,
          strictMode: false,
          enforceRotation: false,
        },
        security: {
          auditLog: false,
          requireConfirmation: [],
          allowedCommands: 'all',
        },
        manifest: { version: '2.0.0', autoSync: true },
      });

      expect(config._metadata).toBeUndefined();

      config.updateMetadata('envg-cli@0.3.0');

      expect(config._metadata).toBeDefined();
      expect(config._metadata?.created).toBeDefined();
      expect(config._metadata?.modifiedBy).toBe('envg-cli@0.3.0');
    });
  });

  describe('isValid', () => {
    it('should validate complete config', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      expect(config.isValid()).toBe(true);
    });

    it('should reject config with empty package name', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      config.package.name = '';
      expect(config.isValid()).toBe(false);
    });

    it('should reject config with empty allowed environments', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      config.environments.allowed = [];
      expect(config.isValid()).toBe(false);
    });

    it('should reject config with default env not in allowed', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      config.environments.default = 'test';
      expect(config.isValid()).toBe(false);
    });

    it('should reject config with empty template path', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      config.paths.template = '';
      expect(config.isValid()).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should convert to plain object', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      const obj = config.toObject();

      expect(obj.$schema).toBe('https://envguard.dev/schemas/config/v2.json');
      expect(obj.version).toBe('2.0.0');
      expect(obj.package.name).toBe('com.test.app');
      expect(obj.environments).toBeDefined();
      expect(obj.paths).toBeDefined();
      expect(obj.validation).toBeDefined();
      expect(obj.security).toBeDefined();
      expect(obj.manifest).toBeDefined();
    });

    it('should include optional fields if present', () => {
      const config = EnvGuardConfigV2.createDefault('com.test.app');
      const obj = config.toObject();

      expect(obj._warnings).toBeDefined();
      expect(obj._metadata).toBeDefined();
    });
  });
});
