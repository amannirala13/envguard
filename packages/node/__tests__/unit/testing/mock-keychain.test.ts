/**
 * @file mock-keychain.test.ts
 * @description Tests for MockKeychain
 */

import { describe, it, expect } from 'vitest';
import {
  MockKeychain,
  createMockKeychain,
} from '../../../src/testing/mock-keychain';

describe('MockKeychain', () => {
  describe('constructor', () => {
    it('should create empty keychain', () => {
      const keychain = new MockKeychain();

      expect(keychain.getAll()).toEqual({});
    });

    it('should create keychain with initial secrets', () => {
      const initial = {
        API_KEY: 'secret123',
        DATABASE_URL: 'postgres://localhost/db',
      };
      const keychain = new MockKeychain(initial);

      expect(keychain.getAll()).toEqual(initial);
    });
  });

  describe('get()', () => {
    it('should get existing secret', async () => {
      const keychain = new MockKeychain({ API_KEY: 'secret123' });

      const value = await keychain.get('API_KEY');

      expect(value).toBe('secret123');
    });

    it('should return null for non-existent secret', async () => {
      const keychain = new MockKeychain();

      const value = await keychain.get('NONEXISTENT');

      expect(value).toBeNull();
    });

    it('should namespace by environment', async () => {
      const keychain = new MockKeychain();
      await keychain.set('API_KEY', 'dev_secret', undefined, 'development');
      await keychain.set('API_KEY', 'prod_secret', undefined, 'production');

      const devValue = await keychain.get('API_KEY', 'development');
      const prodValue = await keychain.get('API_KEY', 'production');

      expect(devValue).toBe('dev_secret');
      expect(prodValue).toBe('prod_secret');
    });
  });

  describe('set()', () => {
    it('should set secret', async () => {
      const keychain = new MockKeychain();

      await keychain.set('API_KEY', 'secret123');

      expect(await keychain.get('API_KEY')).toBe('secret123');
    });

    it('should overwrite existing secret', async () => {
      const keychain = new MockKeychain({ API_KEY: 'old' });

      await keychain.set('API_KEY', 'new');

      expect(await keychain.get('API_KEY')).toBe('new');
    });

    it('should namespace by environment', async () => {
      const keychain = new MockKeychain();

      await keychain.set('API_KEY', 'secret', undefined, 'production');

      expect(await keychain.get('API_KEY', 'production')).toBe('secret');
      expect(await keychain.get('API_KEY', 'development')).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should delete existing secret', async () => {
      const keychain = new MockKeychain({ API_KEY: 'secret' });

      await keychain.delete('API_KEY');

      expect(await keychain.get('API_KEY')).toBeNull();
    });

    it('should handle deleting non-existent secret', async () => {
      const keychain = new MockKeychain();

      await keychain.delete('NONEXISTENT');

      // Should not throw
      expect(await keychain.get('NONEXISTENT')).toBeNull();
    });

    it('should namespace by environment', async () => {
      const keychain = new MockKeychain();
      await keychain.set('API_KEY', 'dev', undefined, 'development');
      await keychain.set('API_KEY', 'prod', undefined, 'production');

      await keychain.delete('API_KEY', 'development');

      expect(await keychain.get('API_KEY', 'development')).toBeNull();
      expect(await keychain.get('API_KEY', 'production')).toBe('prod');
    });
  });

  describe('list()', () => {
    it('should list all keys', async () => {
      const keychain = new MockKeychain({
        'development:API_KEY': 'secret1',
        'production:API_KEY': 'secret2',
        'development:DB_URL': 'url',
      });

      const keys = await keychain.list();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('development:API_KEY');
      expect(keys).toContain('production:API_KEY');
      expect(keys).toContain('development:DB_URL');
    });

    it('should return empty array for empty keychain', async () => {
      const keychain = new MockKeychain();

      const keys = await keychain.list();

      expect(keys).toEqual([]);
    });
  });

  describe('clear()', () => {
    it('should clear all secrets', async () => {
      const keychain = new MockKeychain({
        API_KEY: 'secret',
        DATABASE_URL: 'url',
      });

      await keychain.clear();

      expect(keychain.getAll()).toEqual({});
      expect(await keychain.list()).toEqual([]);
    });
  });

  describe('getAll()', () => {
    it('should return all secrets', () => {
      const secrets = {
        API_KEY: 'secret',
        DATABASE_URL: 'url',
      };
      const keychain = new MockKeychain(secrets);

      expect(keychain.getAll()).toEqual(secrets);
    });
  });

  describe('setAll()', () => {
    it('should set multiple secrets', () => {
      const keychain = new MockKeychain();
      const secrets = {
        API_KEY: 'secret',
        DATABASE_URL: 'url',
      };

      keychain.setAll(secrets);

      expect(keychain.getAll()).toEqual(secrets);
    });

    it('should namespace by environment', () => {
      const keychain = new MockKeychain();
      const secrets = {
        API_KEY: 'secret',
        DATABASE_URL: 'url',
      };

      keychain.setAll(secrets, 'production');

      expect(keychain.getAll()).toEqual({
        'production:API_KEY': 'secret',
        'production:DATABASE_URL': 'url',
      });
    });
  });
});

describe('createMockKeychain', () => {
  it('should create MockKeychain instance', () => {
    const keychain = createMockKeychain();

    expect(keychain).toBeInstanceOf(MockKeychain);
  });

  it('should pass initial secrets', () => {
    const initial = { API_KEY: 'secret' };
    const keychain = createMockKeychain(initial);

    expect(keychain.getAll()).toEqual(initial);
  });
});
