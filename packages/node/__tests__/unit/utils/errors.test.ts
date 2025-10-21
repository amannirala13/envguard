/**
 * @file errors.test.ts
 * @description Tests for custom error classes
 */

import { describe, it, expect } from 'vitest';
import {
  EnvGuardError,
  NotInitializedError,
  ValidationError,
  KeychainError,
  ConfigurationError,
} from '../../../src/utils/errors';

describe('EnvGuardError', () => {
  it('should create an error with message', () => {
    const error = new EnvGuardError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EnvGuardError);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('EnvGuardError');
  });

  it('should include cause if provided', () => {
    const cause = new Error('Original error');
    const error = new EnvGuardError('Wrapper error', cause);

    expect(error.cause).toBe(cause);
  });

  it('should not have cause if not provided', () => {
    const error = new EnvGuardError('Test error');

    expect(error.cause).toBeUndefined();
  });

  it('should maintain stack trace', () => {
    const error = new EnvGuardError('Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('EnvGuardError');
  });
});

describe('NotInitializedError', () => {
  it('should create error with default message', () => {
    const error = new NotInitializedError();

    expect(error).toBeInstanceOf(EnvGuardError);
    expect(error.name).toBe('NotInitializedError');
    expect(error.message).toContain('not initialized');
    expect(error.message).toContain('envguard init');
  });
});

describe('ValidationError', () => {
  it('should create error with message and errors array', () => {
    const errors = [
      { key: 'API_KEY', message: 'Required secret not set' },
      { key: 'DB_URL', message: 'Invalid format' },
    ];
    const error = new ValidationError('Validation failed', errors);

    expect(error).toBeInstanceOf(EnvGuardError);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Validation failed');
    expect(error.errors).toEqual(errors);
  });

  it('should accept empty errors array', () => {
    const error = new ValidationError('Test', []);

    expect(error.errors).toEqual([]);
  });
});

describe('KeychainError', () => {
  it('should create error with message', () => {
    const error = new KeychainError('Keychain access failed');

    expect(error).toBeInstanceOf(EnvGuardError);
    expect(error.name).toBe('KeychainError');
    expect(error.message).toBe('Keychain access failed');
  });

  it('should include cause if provided', () => {
    const cause = new Error('System error');
    const error = new KeychainError('Keychain failed', cause);

    expect(error.cause).toBe(cause);
  });
});

describe('ConfigurationError', () => {
  it('should create error with message', () => {
    const error = new ConfigurationError('Invalid config');

    expect(error).toBeInstanceOf(EnvGuardError);
    expect(error.name).toBe('ConfigurationError');
    expect(error.message).toBe('Invalid config');
  });
});
