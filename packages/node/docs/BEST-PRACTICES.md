# Best Practices for @envguard/node

This guide provides best practices, patterns, and recommendations for using EnvGuard Node.js runtime effectively and securely.

## Table of Contents

- [Security Best Practices](#security-best-practices)
- [Development Patterns](#development-patterns)
- [Environment Management](#environment-management)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Performance](#performance)
- [Migration from dotenv](#migration-from-dotenv)
- [Troubleshooting](#troubleshooting)

## Security Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good - Template file (committed)
# .env.template
API_KEY=
DATABASE_URL=

# ❌ Bad - Actual secrets (DO NOT COMMIT!)
# .env
API_KEY=sk_live_abc123
DATABASE_URL=postgres://user:pass@host/db
```

**Always add to `.gitignore`:**

```gitignore
.env
.env.local
.env.*.local
.envguard/
```

### 2. Use Environment-Specific Secrets

```typescript
// ✅ Good - Separate secrets per environment
// Development
envguard set my-app API_KEY dev_key_123 --env development

// Production
envguard set my-app API_KEY prod_key_456 --env production

// Load correct environment
import { load } from '@envguard/node';
await load({ environment: process.env.NODE_ENV });
```

### 3. Validate Required Secrets

```typescript
// ✅ Good - Validate on startup
import { load } from '@envguard/node';

try {
  const result = await load({ validate: true });
  if (!result.success) {
    console.error('Missing required secrets:', result.errors);
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to load secrets:', error);
  process.exit(1);
}

// ❌ Bad - No validation
require('@envguard/node/config');
// App continues with missing secrets!
```

### 4. Protect Keychain Access

```typescript
// ✅ Good - Handle keychain errors gracefully
import { load, KeychainError } from '@envguard/node';

try {
  await load();
} catch (error) {
  if (error instanceof KeychainError) {
    console.error('Keychain access denied. Check system permissions.');
    // Provide fallback or exit
  }
  throw error;
}
```

### 5. Rotate Secrets Regularly

```bash
# Update secret in keychain
envguard set my-app API_KEY new_rotated_key

# Restart application to pick up new value
pm2 restart my-app
```

## Development Patterns

### 1. Auto-Loading (Simplest)

```javascript
// ✅ Best for simple apps
// index.js
require('@envguard/node/config');

// Secrets automatically loaded
console.log(process.env.API_KEY);
```

### 2. Programmatic Loading (Recommended)

```typescript
// ✅ Best for complex apps
// src/config/secrets.ts
import { load } from '@envguard/node';

export async function initSecrets(): Promise<void> {
  const result = await load({
    environment: process.env.NODE_ENV,
    validate: true,
    debug: process.env.DEBUG === 'true',
  });

  if (!result.success) {
    throw new Error(`Failed to load ${result.errors.length} required secrets`);
  }

  console.log(`Loaded ${result.count} secrets`);
}

// src/index.ts
import { initSecrets } from './config/secrets';

async function main() {
  await initSecrets();
  // Start your app
}

main().catch(console.error);
```

### 3. Non-Invasive Pattern (Advanced)

```typescript
// ✅ Best for libraries or testing
import { populate } from '@envguard/node';

// Get secrets without polluting process.env
const secrets = await populate({
  environment: 'production',
});

// Use secrets directly
const apiClient = new APIClient({
  apiKey: secrets.API_KEY,
  baseURL: secrets.API_URL,
});
```

### 4. Conditional Loading

```typescript
// ✅ Load only in certain environments
import { load } from '@envguard/node';

if (process.env.NODE_ENV !== 'test') {
  await load();
} else {
  // Use test fixtures
  process.env.API_KEY = 'test_key';
}
```

## Environment Management

### 1. Environment Hierarchy

```
ENVGUARD_ENV > NODE_ENV > 'development'
```

```typescript
// Set explicit environment
process.env.ENVGUARD_ENV = 'staging';

// Load secrets for staging
await load(); // Uses 'staging'
```

### 2. Multi-Environment Setup

```bash
# Development
envguard set my-app DATABASE_URL postgres://localhost/dev_db --env development

# Staging
envguard set my-app DATABASE_URL postgres://staging.example.com/db --env staging

# Production
envguard set my-app DATABASE_URL postgres://prod.example.com/db --env production
```

### 3. Local Overrides

```typescript
// ✅ Good - Allow local overrides
import { load } from '@envguard/node';

await load({
  override: true, // Override existing env vars
});

// Now process.env from shell takes precedence
// Useful for local development tweaks
```

### 4. Environment-Specific Validation

```typescript
// ✅ Strict validation in production
import { load, isProduction } from '@envguard/node';

await load({
  validate: isProduction(), // Only validate in production
  debug: !isProduction(), // Debug in non-prod
});
```

## Error Handling

### 1. Graceful Degradation

```typescript
// ✅ Good - Provide fallbacks
import { load } from '@envguard/node';

try {
  await load({ validate: false });
} catch (error) {
  console.warn('Using fallback configuration');

  // Fallback to safe defaults
  process.env.LOG_LEVEL = 'info';
  process.env.CACHE_TTL = '3600';
}
```

### 2. Specific Error Handling

```typescript
// ✅ Good - Handle different error types
import {
  load,
  NotInitializedError,
  ValidationError,
  KeychainError,
} from '@envguard/node';

try {
  await load();
} catch (error) {
  if (error instanceof NotInitializedError) {
    console.error('Run "envguard init" first');
    process.exit(1);
  }

  if (error instanceof ValidationError) {
    console.error('Missing secrets:', error.errors);
    // List which secrets are missing
    process.exit(1);
  }

  if (error instanceof KeychainError) {
    console.error('Keychain access failed. Check permissions.');
    process.exit(1);
  }

  throw error; // Unknown error
}
```

### 3. Startup Validation

```typescript
// ✅ Good - Fail fast on startup
async function validateConfig(): Promise<void> {
  const result = await load({ validate: true });

  if (!result.success) {
    console.error('Configuration errors:');
    result.errors.forEach((err) => {
      console.error(`  ❌ ${err.key}: ${err.message}`);
    });
    throw new Error('Invalid configuration');
  }

  console.log(`✅ Loaded ${result.count} secrets`);
}
```

## Testing

### 1. Use MockKeychain

```typescript
// ✅ Good - Mock keychain in tests
import { load } from '@envguard/node';
import { createMockKeychain } from '@envguard/node/testing';

describe('App', () => {
  it('should load secrets', async () => {
    const mockKeychain = createMockKeychain({
      API_KEY: 'test_key',
      DATABASE_URL: 'test_db',
    });

    const result = await load({
      keychain: mockKeychain,
      validate: false,
    });

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
  });
});
```

### 2. Test Environment Isolation

```typescript
// ✅ Good - Clean environment per test
import { withCleanEnv, withReset } from '@envguard/node/testing';

describe('Config', () => {
  it('should load in clean environment', async () => {
    await withCleanEnv(async () => {
      // Test with no env vars
      await load();
      expect(process.env.API_KEY).toBeDefined();
    });
  });

  it('should reset after load', async () => {
    await withReset(async () => {
      await load();
      // Auto-reset after test
    });
  });
});
```

### 3. Integration Testing

```typescript
// ✅ Good - Test actual keychain (opt-in)
describe('Integration', () => {
  // Skip in CI, run manually
  it.skip('should load from real keychain', async () => {
    const result = await load({
      environment: 'test',
    });

    expect(result.success).toBe(true);
  });
});
```

## Performance

### 1. Load Once

```typescript
// ✅ Good - Load secrets once at startup
let secretsLoaded = false;

async function ensureSecrets(): Promise<void> {
  if (!secretsLoaded) {
    await load();
    secretsLoaded = true;
  }
}

// Call once
await ensureSecrets();
```

### 2. Lazy Loading

```typescript
// ✅ Good - Load only when needed
let secrets: Record<string, string> | null = null;

async function getSecrets(): Promise<Record<string, string>> {
  if (!secrets) {
    const result = await populate();
    secrets = result;
  }
  return secrets;
}
```

### 3. Minimize Keychain Access

```typescript
// ✅ Good - Batch load
const result = await load(); // Loads all secrets once

// ❌ Bad - Multiple keychain calls
for (const key of keys) {
  await keychain.get(key); // Slow!
}
```

## Migration from dotenv

### Step-by-Step Migration

**1. Install EnvGuard:**

```bash
npm install @envguard/node
npm uninstall dotenv
```

**2. Initialize project:**

```bash
npx envguard init
```

**3. Migrate secrets:**

```bash
# Read from .env file
cat .env | while IFS='=' read -r key value; do
  envguard set my-app "$key" "$value"
done
```

**4. Update code (one line change!):**

```diff
- require('dotenv/config');
+ require('@envguard/node/config');
```

**5. Delete .env file:**

```bash
rm .env
git rm --cached .env 2>/dev/null || true
```

**6. Update .gitignore:**

```bash
echo ".envguard/" >> .gitignore
```

### API Mapping

| dotenv              | @envguard/node              | Notes                   |
| ------------------- | --------------------------- | ----------------------- |
| `dotenv.config()`   | `envguard.config()`         | ✅ Compatible           |
| `dotenv.parse(str)` | `envguard.parse(str)`       | ⚠️ Returns empty (warn) |
| -                   | `await envguard.load()`     | 🆕 Async version        |
| -                   | `await envguard.populate()` | 🆕 Non-invasive         |
| -                   | `envguard.reset()`          | 🆕 Cleanup              |

## Troubleshooting

### Common Issues

#### 1. "EnvGuard not initialized"

**Cause:** No `.envguard/config.json` file

**Solution:**

```bash
envguard init
```

#### 2. Secrets not loading

**Cause:** Wrong environment or package name

**Solution:**

```typescript
// Enable debug logging
await load({ debug: true });

// Check logs for:
// - Environment detected
// - Package name
// - Keys found in manifest
```

#### 3. Keychain access denied

**Cause:** System keychain permissions

**Solution (macOS):**

```bash
# Grant Terminal/IDE access to keychain
# System Preferences → Privacy & Security → Keychain
```

**Solution (Linux):**

```bash
# Install libsecret
sudo apt-get install libsecret-1-dev
```

#### 4. Tests failing with real keychain

**Cause:** Tests accessing system keychain

**Solution:**

```typescript
// Use MockKeychain in tests
import { createMockKeychain } from '@envguard/node/testing';

const result = await load({
  keychain: createMockKeychain({ API_KEY: 'test' }),
});
```

### Debug Mode

Enable detailed logging:

```bash
# Environment variable
export ENVGUARD_DEBUG=true

# Or programmatically
await load({ debug: true });
```

Output:

```
[@envguard/node] Starting secret load process
[@envguard/node] Environment: production
[@envguard/node] Package: my-app
[@envguard/node] Found 5 keys in manifest
[@envguard/node] Resolved secret: API_KEY
[@envguard/node] Resolved secret: DATABASE_URL
[@envguard/node] Successfully resolved 5 secrets
[@envguard/node] Injection complete: 5 injected, 0 skipped
```

## Additional Resources

- [API Documentation](./README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [CI/CD Guide](./docs/CI-CD.md)
- [GitHub Issues](https://github.com/amannirala13/envguard/issues)

---

**Questions?** Open an issue or check the [FAQ](./docs/FAQ.md).
