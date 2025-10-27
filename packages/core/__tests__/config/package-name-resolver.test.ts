/**
 * @file package-name-resolver.test.ts
 * @description Tests for PackageNameResolver
 */

import { describe, it, expect } from 'vitest';
import {
  PackageNameResolver,
  PackageNameStrategy,
} from '../../src/config/package-name-resolver';

describe('PackageNameResolver', () => {
  describe('validate', () => {
    it('should accept valid reverse domain names', () => {
      expect(PackageNameResolver.validate('com.company.app')).toEqual({
        valid: true,
      });
      expect(PackageNameResolver.validate('dev.myorg.project')).toEqual({
        valid: true,
      });
      expect(PackageNameResolver.validate('local.my-app')).toEqual({
        valid: true,
      });
    });

    it('should accept npm package names with warning', () => {
      const result = PackageNameResolver.validate('@envguard/node');
      expect(result.valid).toBe(true);
      expect(result.error).toContain('reverse domain notation');
    });

    it('should reject empty names', () => {
      expect(PackageNameResolver.validate('')).toEqual({
        valid: false,
        error: 'Package name cannot be empty',
      });
      expect(PackageNameResolver.validate('   ')).toEqual({
        valid: false,
        error: 'Package name cannot be empty',
      });
    });

    it('should reject names with spaces', () => {
      expect(PackageNameResolver.validate('my app')).toEqual({
        valid: false,
        error: 'Package name cannot contain spaces',
      });
    });

    it('should reject names with invalid characters', () => {
      const result = PackageNameResolver.validate('my$app');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('letters, numbers');
    });
  });

  describe('isReverseDomain', () => {
    it('should identify reverse domain names', () => {
      expect(PackageNameResolver.isReverseDomain('com.company.app')).toBe(true);
      expect(PackageNameResolver.isReverseDomain('dev.envguard.cli')).toBe(
        true
      );
      expect(PackageNameResolver.isReverseDomain('local.my-app')).toBe(true);
    });

    it('should reject non-reverse domain names', () => {
      expect(PackageNameResolver.isReverseDomain('my-app')).toBe(false);
      expect(PackageNameResolver.isReverseDomain('@envguard/node')).toBe(false);
      expect(PackageNameResolver.isReverseDomain('MyApp')).toBe(false);
    });
  });

  describe('npmToReverseDomain', () => {
    it('should convert scoped npm names', () => {
      expect(PackageNameResolver.npmToReverseDomain('@envguard/node')).toBe(
        'dev.envguard.node'
      );
      expect(PackageNameResolver.npmToReverseDomain('@company/product')).toBe(
        'dev.company.product'
      );
    });

    it('should convert unscoped npm names', () => {
      expect(PackageNameResolver.npmToReverseDomain('my-app')).toBe(
        'local.my-app'
      );
      expect(PackageNameResolver.npmToReverseDomain('express')).toBe(
        'local.express'
      );
    });

    it('should handle empty input', () => {
      expect(PackageNameResolver.npmToReverseDomain('')).toBe('local.my-app');
    });
  });

  describe('gitToReverseDomain', () => {
    it('should convert SSH git URLs', () => {
      expect(
        PackageNameResolver.gitToReverseDomain(
          'git@github.com:company/repo.git'
        )
      ).toBe('com.github.company.repo');
      expect(
        PackageNameResolver.gitToReverseDomain('git@gitlab.com:org/project.git')
      ).toBe('com.gitlab.org.project');
    });

    it('should convert HTTPS git URLs', () => {
      expect(
        PackageNameResolver.gitToReverseDomain(
          'https://github.com/company/repo.git'
        )
      ).toBe('com.github.company.repo');
      expect(
        PackageNameResolver.gitToReverseDomain('http://github.com/org/proj.git')
      ).toBe('com.github.org.proj');
    });

    it('should handle invalid git URLs', () => {
      expect(PackageNameResolver.gitToReverseDomain('invalid-url')).toBe(
        'local.git-project'
      );
    });
  });

  describe('resolve', () => {
    it('should use MANUAL strategy with fallback', async () => {
      const result = await PackageNameResolver.resolve({
        strategy: PackageNameStrategy.MANUAL,
        fallback: 'com.test.app',
      });
      expect(result).toBe('com.test.app');
    });

    it('should default to my-app for MANUAL without fallback', async () => {
      const result = await PackageNameResolver.resolve({
        strategy: PackageNameStrategy.MANUAL,
      });
      expect(result).toBe('my-app');
    });

    it('should throw on invalid MANUAL fallback', async () => {
      await expect(
        PackageNameResolver.resolve({
          strategy: PackageNameStrategy.MANUAL,
          fallback: 'invalid name with spaces',
        })
      ).rejects.toThrow('Package name cannot contain spaces');
    });

    it('should handle unknown strategy', async () => {
      await expect(
        PackageNameResolver.resolve({
          strategy: 'unknown' as PackageNameStrategy,
        })
      ).rejects.toThrow('Unknown strategy');
    });
  });

  describe('suggest', () => {
    it('should return unique suggestions', async () => {
      const suggestions = await PackageNameResolver.suggest(process.cwd());
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);

      // Check for uniqueness
      const uniqueSuggestions = new Set(suggestions);
      expect(uniqueSuggestions.size).toBe(suggestions.length);
    });

    it('should prioritize reverse domain format', async () => {
      const suggestions = await PackageNameResolver.suggest(process.cwd());
      // First suggestion should be reverse domain if possible
      if (suggestions.length > 0) {
        expect(
          PackageNameResolver.isReverseDomain(suggestions[0]) ||
            suggestions[0].startsWith('dev.') ||
            suggestions[0].startsWith('local.')
        ).toBe(true);
      }
    });
  });
});
