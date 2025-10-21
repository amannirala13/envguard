/**
 * @file parser.test.ts
 * @description Tests for template file parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseTemplateString,
  getRequiredKeys,
  getOptionalKeys,
} from '../../../src/utils/parser';

describe('parseTemplateString', () => {
  it('should parse simple key=value pairs', () => {
    const template = `
API_KEY=example_key
DATABASE_URL=postgres://localhost/db
    `.trim();

    const result = parseTemplateString(template);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      key: 'API_KEY',
      required: false,
      example: 'example_key',
    });
    expect(result[1]).toEqual({
      key: 'DATABASE_URL',
      required: false,
      example: 'postgres://localhost/db',
    });
  });

  it('should mark keys without values as required', () => {
    const template = `
API_KEY=
DATABASE_URL=value
    `.trim();

    const result = parseTemplateString(template);

    expect(result[0].required).toBe(true);
    expect(result[1].required).toBe(false);
  });

  it('should parse keys with "Required" marker', () => {
    const template = `
# Required
API_KEY=example
DATABASE_URL=example
    `.trim();

    const result = parseTemplateString(template);

    expect(result[0].required).toBe(true);
    expect(result[1].required).toBe(false);
  });

  it('should parse descriptions from comments', () => {
    const template = `
# API key for external service
API_KEY=example

# Database connection string
# Must be PostgreSQL
DATABASE_URL=postgres://localhost/db
    `.trim();

    const result = parseTemplateString(template);

    expect(result[0].description).toBe('API key for external service');
    expect(result[1].description).toBe(
      'Database connection string Must be PostgreSQL'
    );
  });

  it('should handle required marker with description', () => {
    const template = `
# API key for authentication
# Required
API_KEY=

# Optional cache URL
CACHE_URL=redis://localhost
    `.trim();

    const result = parseTemplateString(template);

    expect(result[0]).toMatchObject({
      key: 'API_KEY',
      required: true,
      description: 'API key for authentication',
    });
    expect(result[1]).toMatchObject({
      key: 'CACHE_URL',
      required: false,
      description: 'Optional cache URL',
    });
  });

  it('should skip empty lines', () => {
    const template = `
API_KEY=value


DATABASE_URL=value
    `.trim();

    const result = parseTemplateString(template);

    expect(result).toHaveLength(2);
  });

  it('should skip separator comments', () => {
    const template = `
# --- Section 1 ---
API_KEY=value

# --- Section 2 ---
DATABASE_URL=value
    `.trim();

    const result = parseTemplateString(template);

    expect(result).toHaveLength(2);
    expect(result[0].description).toBeUndefined();
    expect(result[1].description).toBeUndefined();
  });

  it('should reset state between keys', () => {
    const template = `
# Description for API_KEY
# Required
API_KEY=

# This should not affect DATABASE_URL
DATABASE_URL=value
    `.trim();

    const result = parseTemplateString(template);

    expect(result[0].required).toBe(true);
    expect(result[1].required).toBe(false);
    expect(result[1].description).toBe('This should not affect DATABASE_URL');
  });

  it('should handle keys with equals signs in values', () => {
    const template = `
JWT_SECRET=base64==
CONNECTION_STRING=Server=localhost;User=root
    `.trim();

    const result = parseTemplateString(template);

    expect(result[0].example).toBe('base64==');
    expect(result[1].example).toBe('Server=localhost;User=root');
  });

  it('should only match uppercase keys with underscores', () => {
    const template = `
VALID_KEY=value
invalid_key=value
ValidKey=value
ANOTHER_VALID_KEY_123=value
    `.trim();

    const result = parseTemplateString(template);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('VALID_KEY');
    expect(result[1].key).toBe('ANOTHER_VALID_KEY_123');
  });

  it('should handle empty template', () => {
    const result = parseTemplateString('');

    expect(result).toEqual([]);
  });

  it('should handle template with only comments', () => {
    const template = `
# Just a comment
# Another comment
    `.trim();

    const result = parseTemplateString(template);

    expect(result).toEqual([]);
  });
});

describe('getRequiredKeys', () => {
  it('should return only required keys', () => {
    const entries = [
      { key: 'API_KEY', required: true },
      { key: 'DATABASE_URL', required: false },
      { key: 'SECRET', required: true },
    ];

    const result = getRequiredKeys(entries);

    expect(result).toEqual(['API_KEY', 'SECRET']);
  });

  it('should return empty array if no required keys', () => {
    const entries = [
      { key: 'API_KEY', required: false },
      { key: 'DATABASE_URL', required: false },
    ];

    const result = getRequiredKeys(entries);

    expect(result).toEqual([]);
  });
});

describe('getOptionalKeys', () => {
  it('should return only optional keys', () => {
    const entries = [
      { key: 'API_KEY', required: true },
      { key: 'DATABASE_URL', required: false },
      { key: 'SECRET', required: true },
      { key: 'CACHE_URL', required: false },
    ];

    const result = getOptionalKeys(entries);

    expect(result).toEqual(['DATABASE_URL', 'CACHE_URL']);
  });

  it('should return empty array if no optional keys', () => {
    const entries = [
      { key: 'API_KEY', required: true },
      { key: 'DATABASE_URL', required: true },
    ];

    const result = getOptionalKeys(entries);

    expect(result).toEqual([]);
  });
});
