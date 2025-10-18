import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SystemKeychain } from '../../src';

describe('SystemKeychain', () => {
  let keychain: SystemKeychain;
  const packageName = 'com.amannirala.test-repo';

  // Define the structure for key-value pair tests
  interface kvPairTest {
    key: string;
    value: string;
    result: boolean;
  }

  // Define key-value pairs for testing
  const kvPairs: kvPairTest[] = [
    // -------------------- Passing cases --------------------
    { key: 'username', value: 'testuser', result: true },
    { key: 'password', value: 'testpass', result: true },
    { key: 'token', value: 'abcd1234', result: true },
    { key: 'empty', value: '', result: true },

    // -------------------- Failing cases --------------------
    { key: 'nullbyte', value: '\u0000', result: false },
    { key: '', value: 'novalue', result: false },
    { key: 'verylongkey'.repeat(50), value: 'longvalue', result: false },
    { key: 'invalid/chars', value: 'badvalue', result: false },
    { key: 'binaryvalue', value: '\u0001\u0002\u0003', result: false },
    { key: 'whitespace', value: '   ', result: false },
  ];
  const validPairs = kvPairs.filter((pair) => pair.result);
  const invalidPairs = kvPairs.filter((pair) => !pair.result);

  // Initialize the SystemKeychain before tests
  beforeAll(() => {
    keychain = new SystemKeychain(packageName);
  });

  // Clean up all keys after tests
  afterAll(async () => {
    for (const pair of kvPairs) {
      if (pair.result) {
        await keychain.delete(pair.key);
      }
    }
  });

  describe('Initialization', () => {
    it('should create an instance of SystemKeychain', () => {
      expect(keychain).toBeInstanceOf(SystemKeychain);
    });
  });

  describe('Basic Keychain CRUD operations', () => {
    it('should set, get, and delete a key-value pair', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      // Set the key-value pair
      await keychain.set(testKey, testValue);

      // Get the value for the key
      const retrievedValue = await keychain.get(testKey);
      expect(retrievedValue).toBe(testValue);

      // Delete the key-value pair
      await keychain.delete(testKey);

      // Try to get the deleted key
      const deletedValue = await keychain.get(testKey);
      expect(deletedValue).toBeNull();
    });
  });

  // Test basic key-value pair operations
  describe('Basic key-value operations', () => {
    describe('valid key/value pairs', () => {
      for (const { key, value } of validPairs) {
        it(`should set and retrieve key "${key}" with value "${value}"`, async () => {
          await keychain.set(key, value);
          const retrievedValue = await keychain.get(key);
          expect(retrievedValue).toBe(value);
        });
      }
    });

    describe('invalid key/value pairs', () => {
      for (const { key, value } of invalidPairs) {
        it(`should reject key "${key}" with value "${value}"`, async () => {
          await expect(keychain.set(key, value)).rejects.toThrow();
        });
      }
    });
  });
});
