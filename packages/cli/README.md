# EnvGuard CLI

> Local-first secret management for developers

EnvGuard is a CLI tool that helps you manage environment variables and secrets securely by storing them in your operating system's native keychain (macOS Keychain, Windows Credential Manager, or Linux Secret Service).

## Features

✨ **Local-First**: Secrets never leave your machine
🔐 **Secure Storage**: Uses OS-native keychain services
📦 **Simple CLI**: Easy-to-use command interface
🎯 **Project-Scoped**: Each project has its own isolated secrets
✅ **Validation**: Distinguish between required and optional secrets
🚀 **Zero Config**: Works out of the box with sensible defaults

## Installation

### Global Installation

```bash
npm install -g @envguard/cli
```

### Project Installation

```bash
npm install --save-dev @envguard/cli
# or
pnpm add -D @envguard/cli
# or
yarn add -D @envguard/cli
```

## Quick Start

```bash
# Initialize EnvGuard in your project
envg init

# Store a secret
envg set API_KEY your-secret-key

# Store an optional secret
envg set OPTIONAL_KEY value --optional

# Retrieve a secret
envg get API_KEY

# List all secrets
envg list

# Validate all required secrets are present
envg validate

# Delete a secret
envg del API_KEY
```

## Commands

### `envg init`

Initialize EnvGuard in your project.

```bash
envg init [options]

Options:
  -p, --package <name>     Package name (skips auto-detection)
  -t, --template <path>    Path to template file
  -f, --force              Reinitialize if already initialized
```

### `envg set <key> <value>`

Store a secret in the OS keychain.

```bash
envg set <key> <value> [options]

Options:
  -o, --optional           Mark this secret as optional (default: required)
  -v, --verbose            Enable verbose logging
```

**Examples:**

```bash
envg set DATABASE_URL postgres://localhost/mydb
envg set OPTIONAL_API_KEY key123 --optional
```

### `envg get <key>`

Retrieve a secret from the OS keychain.

```bash
envg get <key> [options]

Options:
  -df, --defaultFallback <value>  Default value if secret not found
  -v, --verbose                   Enable verbose logging
```

**Example:**

```bash
envg get API_KEY
envg get OPTIONAL_KEY --defaultFallback "default-value"
```

### `envg list`

List all stored secrets (keys only, not values).

```bash
envg list [options]

Options:
  -v, --verbose    Enable verbose logging
```

Output shows secrets grouped by required and optional.

### `envg validate`

Validate that all required secrets are present.

```bash
envg validate [options]

Options:
  -v, --verbose    Enable verbose logging
```

- ✅ Passes if all required secrets are present
- ⚠️ Warns if optional secrets are missing (exit code 0)
- ❌ Fails if required secrets are missing (exit code 1)

### `envg del <key>`

Delete a secret from the OS keychain.

```bash
envg del <key> [options]

Options:
  -v, --verbose    Enable verbose logging
```

### `envg status`

Show current EnvGuard status and configuration.

```bash
envg status
```

## How It Works

1. **Initialize**: Run `envg init` to create `.envguard/config.json` in your project
2. **Store Secrets**: Use `envg set` to store secrets in your OS keychain
3. **Track Keys**: EnvGuard maintains a manifest (`.envguard/manifest.json`) to track which keys exist
4. **Retrieve Securely**: Access secrets via `envg get` or programmatically
5. **Validate**: Use `envg validate` in CI/CD to ensure all required secrets are configured

## Project Structure

When you initialize EnvGuard, it creates:

```
your-project/
├── .envguard/
│   ├── config.json       # Project configuration
│   └── manifest.json     # Key inventory (tracks which keys exist)
└── .env.template         # Template file (optional)
```

**Commit to Git**: `.envguard/` directory
**Ignore in Git**: Actual secret values (stored in OS keychain only)

## Required vs Optional Secrets

EnvGuard supports marking secrets as required or optional:

```bash
# Required secrets (default)
envg set DATABASE_URL postgres://localhost/mydb

# Optional secrets
envg set DEBUG_MODE true --optional
```

The `envg validate` command checks:

- ❌ Fails if any required secret is missing
- ⚠️ Warns if any optional secret is missing (but doesn't fail)

This is useful for:

- CI/CD pipelines (ensure all required secrets are configured)
- Team onboarding (help new developers set up their environment)
- Environment-specific configs (production vs development)

## Security

- **No plaintext storage**: Secrets are stored in OS-native keychains only
- **No network requests**: All operations are local
- **Per-project isolation**: Each project has its own namespace
- **OS-level encryption**: Leverages built-in OS security features

## Supported Platforms

- ✅ **macOS**: Uses Keychain Access
- ✅ **Windows**: Uses Credential Manager
- ✅ **Linux**: Uses Secret Service (libsecret)

## Use with npm scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "prestart": "envg validate",
    "secrets:list": "envg list",
    "secrets:validate": "envg validate"
  }
}
```

## Programmatic Usage

You can also use EnvGuard programmatically in Node.js:

```typescript
import { SystemKeychain } from '@envguard/cli';

const keychain = new SystemKeychain('my-app');

// Store a secret
await keychain.set('API_KEY', 'secret-value');

// Retrieve a secret
const apiKey = await keychain.get('API_KEY');

// Delete a secret
await keychain.delete('API_KEY');

// List all keys
const keys = await keychain.list();
```

## Requirements

- **Node.js**: ≥18.0.0
- **Operating System**: macOS, Windows, or Linux with libsecret

## License

MIT © [Aman Nirala](https://github.com/amannirala13)

## Links

- [GitHub Repository](https://github.com/amannirala13/envguard)
- [Issue Tracker](https://github.com/amannirala13/envguard/issues)
- [npm Package](https://www.npmjs.com/package/@envguard/cli)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ by [Aman Nirala](https://github.com/amannirala13)**
