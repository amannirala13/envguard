/**
 * @file validator.test.ts
 * @description Tests for secret validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateSecrets,
  validateAgainstManifest,
} from '../../../src/loader/validator';

describe('validateSecrets', () => {
  it('should validate when all required secrets are present', () => {
    const loaded = {
      API_KEY: 'secret123',
      DATABASE_URL: 'postgres://localhost/db',
    };

    const template = [
      { key: 'API_KEY', required: true },
      { key: 'DATABASE_URL', required: true },
    ];

    const result = validateSecrets(loaded, template);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual(['API_KEY', 'DATABASE_URL']);
  });

  it('should fail when required secrets are missing', () => {
    const loaded = {
      API_KEY: 'secret123',
    };

    const template = [
      { key: 'API_KEY', required: true },
      { key: 'DATABASE_URL', required: true },
      { key: 'SECRET', required: true },
    ];

    const result = validateSecrets(loaded, template);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.missing).toEqual(['DATABASE_URL', 'SECRET']);
    expect(result.present).toEqual(['API_KEY']);
  });

  it('should ignore optional secrets that are missing', () => {
    const loaded = {
      API_KEY: 'secret123',
    };

    const template = [
      { key: 'API_KEY', required: true },
      { key: 'CACHE_URL', required: false },
      { key: 'LOG_LEVEL', required: false },
    ];

    const result = validateSecrets(loaded, template);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should include descriptions in error messages', () => {
    const loaded = {};

    const template = [
      {
        key: 'API_KEY',
        required: true,
        description: 'API key for external service',
      },
    ];

    const result = validateSecrets(loaded, template);

    expect(result.errors[0].message).toContain('API key for external service');
  });

  it('should handle empty template', () => {
    const loaded = { API_KEY: 'secret' };
    const template: any[] = [];

    const result = validateSecrets(loaded, template);

    expect(result.valid).toBe(true);
  });

  it('should handle empty loaded secrets', () => {
    const loaded = {};
    const template = [{ key: 'API_KEY', required: true }];

    const result = validateSecrets(loaded, template);

    expect(result.valid).toBe(false);
    expect(result.missing).toEqual(['API_KEY']);
  });
});

describe('validateAgainstManifest', () => {
  it('should validate when all required keys are present', () => {
    const loaded = {
      API_KEY: 'secret123',
      DATABASE_URL: 'postgres://localhost/db',
    };

    const requiredKeys = ['API_KEY', 'DATABASE_URL'];

    const result = validateAgainstManifest(loaded, requiredKeys);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual(['API_KEY', 'DATABASE_URL']);
  });

  it('should fail when required keys are missing', () => {
    const loaded = {
      API_KEY: 'secret123',
    };

    const requiredKeys = ['API_KEY', 'DATABASE_URL', 'SECRET'];

    const result = validateAgainstManifest(loaded, requiredKeys);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.missing).toEqual(['DATABASE_URL', 'SECRET']);
  });

  it('should handle empty required keys', () => {
    const loaded = { API_KEY: 'secret' };
    const requiredKeys: string[] = [];

    const result = validateAgainstManifest(loaded, requiredKeys);

    expect(result.valid).toBe(true);
  });

  it('should create proper error objects', () => {
    const loaded = {};
    const requiredKeys = ['API_KEY'];

    const result = validateAgainstManifest(loaded, requiredKeys);

    expect(result.errors[0]).toMatchObject({
      key: 'API_KEY',
      message: expect.stringContaining('API_KEY'),
      required: true,
    });
  });
});
