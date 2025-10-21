/**
 * @file environment.test.ts
 * @description Tests for environment detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  detectEnvironment,
  isProduction,
  isDevelopment,
  isTest,
} from '../../../src/config/environment';

describe('detectEnvironment', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return ENVGUARD_ENV if set', () => {
    process.env['ENVGUARD_ENV'] = 'staging';
    process.env['NODE_ENV'] = 'production';

    expect(detectEnvironment()).toBe('staging');
  });

  it('should return NODE_ENV if ENVGUARD_ENV not set', () => {
    delete process.env['ENVGUARD_ENV'];
    process.env['NODE_ENV'] = 'production';

    expect(detectEnvironment()).toBe('production');
  });

  it('should return default if neither set', () => {
    delete process.env['ENVGUARD_ENV'];
    delete process.env['NODE_ENV'];

    expect(detectEnvironment()).toBe('development');
  });

  it('should prioritize ENVGUARD_ENV over NODE_ENV', () => {
    process.env['ENVGUARD_ENV'] = 'custom';
    process.env['NODE_ENV'] = 'production';

    expect(detectEnvironment()).toBe('custom');
  });
});

describe('isProduction', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when environment is production', () => {
    process.env['NODE_ENV'] = 'production';

    expect(isProduction()).toBe(true);
  });

  it('should return false when environment is not production', () => {
    process.env['NODE_ENV'] = 'development';

    expect(isProduction()).toBe(false);
  });
});

describe('isDevelopment', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when environment is development', () => {
    process.env['NODE_ENV'] = 'development';

    expect(isDevelopment()).toBe(true);
  });

  it('should return true when no environment set (default)', () => {
    delete process.env['NODE_ENV'];
    delete process.env['ENVGUARD_ENV'];

    expect(isDevelopment()).toBe(true);
  });

  it('should return false when environment is not development', () => {
    process.env['NODE_ENV'] = 'production';

    expect(isDevelopment()).toBe(false);
  });
});

describe('isTest', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when environment is test', () => {
    process.env['NODE_ENV'] = 'test';

    expect(isTest()).toBe(true);
  });

  it('should return false when environment is not test', () => {
    process.env['NODE_ENV'] = 'development';

    expect(isTest()).toBe(false);
  });
});
