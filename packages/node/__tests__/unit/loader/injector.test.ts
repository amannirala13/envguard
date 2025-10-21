/**
 * @file injector.test.ts
 * @description Tests for secret injection
 */

import { describe, it, expect } from 'vitest';
import {
  injectSecrets,
  removeInjectedSecrets,
} from '../../../src/loader/injector';

describe('injectSecrets', () => {
  it('should inject secrets into empty target', () => {
    const secrets = {
      API_KEY: 'secret123',
      DATABASE_URL: 'postgres://localhost/db',
    };
    const target: Record<string, string | undefined> = {};

    const result = injectSecrets(secrets, target, false);

    expect(target).toEqual(secrets);
    expect(result.injected).toEqual(['API_KEY', 'DATABASE_URL']);
    expect(result.skipped).toEqual([]);
    expect(result.overridden).toEqual([]);
  });

  it('should skip existing values when override is false', () => {
    const secrets = {
      API_KEY: 'new_secret',
      DATABASE_URL: 'new_url',
    };
    const target: Record<string, string | undefined> = {
      API_KEY: 'existing_secret',
    };

    const result = injectSecrets(secrets, target, false);

    expect(target.API_KEY).toBe('existing_secret'); // Not overridden
    expect(target.DATABASE_URL).toBe('new_url'); // Injected
    expect(result.injected).toEqual(['DATABASE_URL']);
    expect(result.skipped).toEqual(['API_KEY']);
    expect(result.overridden).toEqual([]);
  });

  it('should override existing values when override is true', () => {
    const secrets = {
      API_KEY: 'new_secret',
      DATABASE_URL: 'new_url',
    };
    const target: Record<string, string | undefined> = {
      API_KEY: 'existing_secret',
    };

    const result = injectSecrets(secrets, target, true);

    expect(target.API_KEY).toBe('new_secret'); // Overridden
    expect(target.DATABASE_URL).toBe('new_url'); // Injected
    expect(result.injected).toEqual(['DATABASE_URL']);
    expect(result.skipped).toEqual([]);
    expect(result.overridden).toEqual(['API_KEY']);
  });

  it('should handle empty secrets object', () => {
    const secrets = {};
    const target: Record<string, string | undefined> = {};

    const result = injectSecrets(secrets, target, false);

    expect(target).toEqual({});
    expect(result.injected).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(result.overridden).toEqual([]);
  });

  it('should inject into process.env by default', () => {
    const secrets = { TEST_SECRET: 'test_value' };
    const originalValue = process.env['TEST_SECRET'];

    const result = injectSecrets(secrets);

    expect(process.env['TEST_SECRET']).toBe('test_value');
    expect(result.injected).toContain('TEST_SECRET');

    // Cleanup
    if (originalValue === undefined) {
      delete process.env['TEST_SECRET'];
    } else {
      process.env['TEST_SECRET'] = originalValue;
    }
  });

  it('should handle undefined values in target', () => {
    const secrets = { API_KEY: 'secret' };
    const target: Record<string, string | undefined> = { API_KEY: undefined };

    const result = injectSecrets(secrets, target, false);

    expect(target.API_KEY).toBe('secret');
    expect(result.injected).toEqual(['API_KEY']);
  });
});

describe('removeInjectedSecrets', () => {
  it('should remove secrets from target', () => {
    const target: Record<string, string | undefined> = {
      API_KEY: 'secret',
      DATABASE_URL: 'url',
      OTHER: 'value',
    };

    removeInjectedSecrets(['API_KEY', 'DATABASE_URL'], target);

    expect(target).toEqual({ OTHER: 'value' });
  });

  it('should handle empty keys array', () => {
    const target: Record<string, string | undefined> = {
      API_KEY: 'secret',
    };

    removeInjectedSecrets([], target);

    expect(target).toEqual({ API_KEY: 'secret' });
  });

  it('should handle non-existent keys', () => {
    const target: Record<string, string | undefined> = {
      API_KEY: 'secret',
    };

    removeInjectedSecrets(['NONEXISTENT'], target);

    expect(target).toEqual({ API_KEY: 'secret' });
  });

  it('should remove from process.env by default', () => {
    process.env['TEST_REMOVE'] = 'value';

    removeInjectedSecrets(['TEST_REMOVE']);

    expect(process.env['TEST_REMOVE']).toBeUndefined();
  });
});
