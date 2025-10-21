# @envguard/node

> **Secure, local-first secret management for Node.js** - Drop-in replacement for dotenv that stores secrets in OS keychain instead of `.env` files.

[![npm version](https://img.shields.io/npm/v/@envguard/node)](https://www.npmjs.com/package/@envguard/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Auto-Loading](#auto-loading)
  - [Programmatic API](#programmatic-api)
  - [Node.js --require Hook](#nodejs---require-hook)
- [API Reference](#api-reference)
- [Migration from dotenv](#migration-from-dotenv)
- [Environment Management](#environment-management)
- [Testing](#testing)
- [Documentation](#documentation)
- [Examples](#examples)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Features

✨ **Drop-in dotenv replacement** - Change one line of code
🔐 **OS keychain storage** - macOS Keychain, Windows Credential Manager, Linux Secret Service
🌍 **Multi-environment** - Separate secrets for dev/staging/prod
✅ **TypeScript-first** - Full type safety and IntelliSense
🎯 **Zero dependencies** - Bundles all dependencies
⚡ **Fast** - <100ms startup time
🧪 **Testing utilities** - Mock keychain included
📦 **ESM & CJS** - Works everywhere

## Quick Start

### 1. Install

```bash
npm install @envguard/node

# Or with yarn/pnpm
yarn add @envguard/node
pnpm add @envguard/node
```

### 2. Initialize (one-time)

```bash
# Initialize EnvGuard in your project
npx envguard init

# Set your secrets
npx envguard set API_KEY your_secret_key_here
npx envguard set DATABASE_URL postgres://localhost/mydb
```

### 3. Use in your app

**Before (dotenv):**

```javascript
require('dotenv').config();
```

**After (EnvGuard):**

```javascript
require('@envguard/node/config');
```

That's it! Your secrets now come from the OS keychain instead of `.env` files.

## Installation

### npm

```bash
npm install @envguard/node
```

### yarn

```bash
yarn add @envguard/node
```

### pnpm

```bash
pnpm add @envguard/node
```

### Requirements

- **Node.js** >= 18.0.0
- **Operating System:** macOS, Windows, or Linux

## Usage

### Auto-Loading

The simplest way - automatically load secrets on import:

#### CommonJS

```javascript
// Load secrets before anything else
require('@envguard/node/config');

// Secrets are now available
console.log(process.env.API_KEY);
console.log(process.env.DATABASE_URL);

const app = require('./app');
app.start();
```

#### ES Modules

```javascript
// Load secrets first
import '@envguard/node/config';

// Then import your app
import app from './app.js';

app.start();
```

### Programmatic API

For more control over loading:

```typescript
import { load } from '@envguard/node';

async function main() {
  // Load secrets
  const result = await load({
    environment: 'production', // Override environment
    validate: true, // Validate required secrets
    debug: true, // Enable debug logging
  });

  if (!result.success) {
    console.error('Failed to load secrets:', result.errors);
    process.exit(1);
  }

  console.log(`Loaded ${result.count} secrets`);

  // Start your application
  startApp();
}

main().catch(console.error);
```

### Node.js --require Hook

Load secrets before your application starts:

```bash
node --require @envguard/node/register app.js
```

Environment variables:

```bash
# Set environment
ENVGUARD_ENV=production node --require @envguard/node/register app.js

# Enable debug logging
ENVGUARD_DEBUG=true node --require @envguard/node/register app.js
```

## API Reference

### `config(options?: LoadOptions): LoadResult`

Synchronous API (dotenv-compatible):

```typescript
import envguard from '@envguard/node';

const result = envguard.config({
  environment: 'production',
  validate: true,
});

console.log(result.count); // Number of secrets loaded
```

### `async load(options?: LoadOptions): Promise<LoadResult>`

Asynchronous secret loading:

```typescript
import { load } from '@envguard/node';

const result = await load({
  environment: 'production', // Environment to load
  projectRoot: process.cwd(), // Project directory
  packageName: 'my-app', // Override package name
  debug: false, // Debug logging
  override: false, // Override existing env vars
  validate: true, // Validate required secrets
  templatePath: '.env.template', // Template file path
});
```

**LoadResult:**

```typescript
interface LoadResult {
  success: boolean; // Whether loading succeeded
  loaded: Record<string, string>; // Loaded secrets
  errors: ValidationError[]; // Validation errors
  count: number; // Number of secrets loaded
}
```

### `async populate(options?: PopulateOptions): Promise<Record<string, string>>`

Get secrets without injecting into `process.env`:

```typescript
import { populate } from '@envguard/node';

// Get secrets as object
const secrets = await populate({
  environment: 'production',
});

// Use directly without polluting process.env
const apiClient = new APIClient({
  apiKey: secrets.API_KEY,
  baseURL: secrets.API_URL,
});
```

### `reset(options?: ResetOptions): void`

Reset EnvGuard state:

```typescript
import { reset } from '@envguard/node';

// Clear internal state
reset();

// Clear state AND remove from process.env
reset({ cleanEnv: true });
```

### `detectEnvironment(): string`

Get current environment:

```typescript
import { detectEnvironment } from '@envguard/node';

const env = detectEnvironment();
// Returns: ENVGUARD_ENV → NODE_ENV → 'development'
```

### Type Definitions

```typescript
import type {
  LoadOptions,
  LoadResult,
  PopulateOptions,
  ResetOptions,
  ValidationError,
} from '@envguard/node';
```

## Migration from dotenv

### Step-by-Step Guide

**1. Install EnvGuard:**

```bash
npm install @envguard/node
npm uninstall dotenv
```

**2. Initialize:**

```bash
npx envguard init
```

**3. Migrate your secrets:**

**Option A: Manual migration**

```bash
# For each secret in .env
npx envguard set SECRET_NAME secret_value
```

**Option B: Automated script**

```bash
# Read from .env and store in keychain
cat .env | while IFS='=' read -r key value; do
  [ -n "$key" ] && [ -n "$value" ] && \
    npx envguard set "$key" "$value"
done
```

**4. Update your code:**

```diff
// Before
- require('dotenv/config');
+ require('@envguard/node/config');

// Or programmatically
- require('dotenv').config();
+ require('@envguard/node').config();
```

**5. Clean up:**

```bash
# Delete .env file
rm .env

# Remove from git (if committed)
git rm --cached .env

# Add to .gitignore
echo ".envguard/" >> .gitignore
```

### API Compatibility

| dotenv                     | @envguard/node                     | Status                          |
| -------------------------- | ---------------------------------- | ------------------------------- |
| `dotenv.config()`          | `envguard.config()`                | ✅ Compatible                   |
| `dotenv.parse(src)`        | `envguard.parse(src)`              | ⚠️ Returns empty (logs warning) |
| -                          | `await envguard.load()`            | 🆕 New async API                |
| -                          | `await envguard.populate()`        | 🆕 Non-invasive loading         |
| -                          | `envguard.reset()`                 | 🆕 State management             |
| `require('dotenv/config')` | `require('@envguard/node/config')` | ✅ Compatible                   |

## Environment Management

### Environment Priority

```
ENVGUARD_ENV > NODE_ENV > 'development'
```

### Multi-Environment Setup

```bash
# Development secrets (default environment)
npx envguard set API_KEY dev_key_123

# Staging secrets
npx envguard set API_KEY staging_key_456 --env staging

# Production secrets
npx envguard set API_KEY prod_key_789 --env production
```

### Load Specific Environment

```typescript
// Explicit environment
await load({ environment: 'production' });

// Or set via environment variable
process.env.ENVGUARD_ENV = 'staging';
await load(); // Uses 'staging'

// Or via NODE_ENV
process.env.NODE_ENV = 'production';
await load(); // Uses 'production'
```

### Environment Detection

```typescript
import {
  detectEnvironment,
  isProduction,
  isDevelopment,
  isTest,
} from '@envguard/node';

if (isProduction()) {
  // Strict validation in production
  await load({ validate: true });
} else {
  // Relaxed in development
  await load({ validate: false, debug: true });
}
```

## Testing

### Testing Utilities

EnvGuard provides testing utilities for easy mocking:

```typescript
import { createMockKeychain } from '@envguard/node/testing';
import { load } from '@envguard/node';

describe('App Tests', () => {
  it('should load secrets', async () => {
    // Create mock keychain with test data
    const mockKeychain = createMockKeychain({
      API_KEY: 'test_key',
      DATABASE_URL: 'test_db',
    });

    // Load with mock keychain
    const result = await load({
      keychain: mockKeychain,
      validate: false,
    });

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
  });
});
```

### Helper Functions

```typescript
import { withEnvVars, withCleanEnv, withReset } from '@envguard/node/testing';

// Run with temporary env vars
await withEnvVars({ NODE_ENV: 'test' }, async () => {
  // Your test code
});

// Run with clean environment
await withCleanEnv(async () => {
  // No env vars set
});

// Auto-reset after test
await withReset(async () => {
  await load();
  // Automatically reset after
});
```

### MockKeychain API

```typescript
import { MockKeychain } from '@envguard/node/testing';

const keychain = new MockKeychain();

// CRUD operations
await keychain.set('API_KEY', 'value');
await keychain.get('API_KEY'); // 'value'
await keychain.delete('API_KEY');
await keychain.list(); // []

// Batch operations
keychain.setAll(
  {
    API_KEY: 'key1',
    DB_URL: 'url1',
  },
  'production'
);

keychain.getAll(); // Get all secrets
```

## Documentation

### Core Guides

- [**Best Practices**](./docs/BEST-PRACTICES.md) - Recommended patterns and security practices
- [**Contributing Guide**](./CONTRIBUTING.md) - How to contribute to the project
- [**CI/CD Guide**](./docs/CI-CD.md) - Continuous Integration and Deployment setup

### Additional Resources

- [**EnvGuard CLI**](../../README.md#cli-usage) - CLI tool for managing secrets
- [**Architecture**](../../README.md#architecture) - How EnvGuard works
- [**Security**](../../README.md#security) - Security model and considerations

## Examples

### Express.js

```javascript
// Load secrets before Express
require('@envguard/node/config');

const express = require('express');
const app = express();

// Use secrets
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### Next.js

```javascript
// next.config.js
require('@envguard/node/config');

module.exports = {
  env: {
    API_URL: process.env.API_URL,
    // Secrets available during build
  },
};
```

### NestJS

```typescript
// src/main.ts
import '@envguard/node/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

### TypeScript + ESM

```typescript
// src/index.ts
import { load } from '@envguard/node';

async function main() {
  // Load secrets
  await load({
    validate: true,
    debug: process.env.DEBUG === 'true',
  });

  // Import app after secrets loaded
  const { startServer } = await import('./server.js');
  await startServer();
}

main().catch(console.error);
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install EnvGuard CLI globally
RUN npm install -g @envguard/cli

# Copy app
COPY . .
RUN npm install

# Secrets injected at runtime from host keychain
CMD ["node", "--require", "@envguard/node/register", "index.js"]
```

## FAQ

### How is this different from dotenv?

| Feature      | dotenv                  | @envguard/node              |
| ------------ | ----------------------- | --------------------------- |
| Storage      | `.env` files            | OS keychain                 |
| Security     | Files can be committed  | Never in repository         |
| Multi-env    | Multiple `.env.*` files | Single keychain, namespaced |
| Git-safe     | ⚠️ Easy to leak         | ✅ Never committed          |
| Team sharing | Manual file sharing     | Each dev sets own secrets   |

### Is it secure?

Yes! Secrets are stored in:

- **macOS:** Keychain Access (encrypted)
- **Windows:** Credential Manager (encrypted)
- **Linux:** Secret Service/libsecret (encrypted)

Secrets never touch disk in plaintext.

### Can I use this with Docker?

Yes, but secrets must be available in the container's keychain. Options:

1. **Development:** Mount host keychain
2. **Production:** Inject secrets at runtime via env vars or secrets manager
3. **CI/CD:** Use secret management tools

### Does this work with environment variables?

Yes! `process.env` variables take precedence (unless `override: true`).

```typescript
// Shell env var
export API_KEY=shell_value

// EnvGuard secret
envguard set API_KEY keychain_value

// Load
await load({ override: false });

console.log(process.env.API_KEY); // 'shell_value' (env var wins)

await load({ override: true });
console.log(process.env.API_KEY); // 'keychain_value' (keychain wins)
```

### Can I use this in tests?

Yes! Use `MockKeychain`:

```typescript
import { load } from '@envguard/node';
import { createMockKeychain } from '@envguard/node/testing';

test('app loads secrets', async () => {
  const result = await load({
    keychain: createMockKeychain({ API_KEY: 'test' }),
  });

  expect(result.success).toBe(true);
});
```

### What about CI/CD?

In CI/CD, use environment variables or secret management:

```yaml
# GitHub Actions
env:
  API_KEY: ${{ secrets.API_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Or use a mock keychain in tests.

### How do I migrate from dotenv?

See [Migration Guide](#migration-from-dotenv) above. TL;DR:

1. `npm install @envguard/node`
2. `envguard init`
3. Migrate secrets: `envguard set KEY value`
4. Change: `require('dotenv')` → `require('@envguard/node')`
5. Delete `.env` file

### Performance impact?

Minimal! Keychain access is fast:

- **Startup time:** <100ms for 50 secrets
- **Memory:** <1MB additional
- **No runtime overhead** after initial load

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Coding standards
- Testing guidelines
- PR process

## License

[MIT](./LICENSE) © [Aman Nirala](https://github.com/amannirala13)

---

## Related Packages

- [`@envguard/cli`](../cli) - Command-line interface for managing secrets
- [`@envguard/core`](../core) - Core library (internal)

## Support

- 🐛 [Report bugs](https://github.com/amannirala13/envguard/issues)
- 💡 [Request features](https://github.com/amannirala13/envguard/issues)
- 📖 [Read docs](https://github.com/amannirala13/envguard)
- 💬 [Discussions](https://github.com/amannirala13/envguard/discussions)

---

Made with ❤️ by [Aman Nirala](https://github.com/amannirala13)
