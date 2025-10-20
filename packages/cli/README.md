# EnvGuard CLI

**Local-first secret management for development environments**

EnvGuard is a command-line tool that stores environment variables in your operating system's secure keychain instead of `.env` files. Secrets remain on your machine, encrypted by the OS, and never touch your Git repository.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/@envguard/cli)](https://www.npmjs.com/package/@envguard/cli)

**Status:** Alpha - Core functionality stable, API may change

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command Reference](#command-reference)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Development](#development)
- [Publishing](#publishing)
- [Support](#support)

## Installation

### Global Installation

```bash
npm install -g @envguard/cli
```

### Without Installation

```bash
npx @envguard/cli@latest status
```

### Requirements

- Node.js >= 18.0.0
- Supported OS: macOS, Windows, Linux

## Quick Start

### Initialize a Project

```bash
cd your-project
envg init
```

This creates a `.envguard` directory with project configuration.

### Add Secrets

**Interactive mode (recommended):**

```bash
envg edit
```

**Direct mode:**

```bash
envg set DATABASE_URL postgresql://localhost/mydb
envg set API_KEY your-api-key-here
```

### View Secrets

```bash
# View all secrets (masked)
envg show all

# View specific secret
envg show DATABASE_URL

# Reveal value
envg show DATABASE_URL --reveal
```

### Migrate from .env

```bash
envg migrate
```

Reads existing `.env` file and transfers secrets to your OS keychain.

## Command Reference

### Project Initialization

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `envg init`    | Initialize EnvGuard in current directory |
| `envg status`  | Show project status and configuration    |
| `envg migrate` | Import secrets from `.env` file          |

### Secret Management

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `envg edit`              | Interactive secret editor          |
| `envg edit <key>`        | Edit specific secret               |
| `envg set <key> <value>` | Set a secret                       |
| `envg get <key>`         | Retrieve secret value              |
| `envg show <key>`        | Display secret (masked by default) |
| `envg show all`          | Display all secrets                |
| `envg del <key>`         | Delete a secret                    |
| `envg list`              | List all secret keys               |

### Environment Management

| Command                                    | Description                           |
| ------------------------------------------ | ------------------------------------- |
| `envg set <key> <value> --env <name>`      | Set secret for specific environment   |
| `envg show all --env <name>`               | View environment secrets              |
| `envg copy --from <src> --to <dest>`       | Copy all secrets between environments |
| `envg copy <key> --from <src> --to <dest>` | Copy specific secret                  |

### Project Health

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `envg check`            | Run all health checks         |
| `envg check --secrets`  | Validate secret configuration |
| `envg check --security` | Check for security issues     |
| `envg template`         | Generate `.env.template` file |

### Advanced

| Command                          | Description                            |
| -------------------------------- | -------------------------------------- |
| `envg export --unsafe --to .env` | Export to plaintext (use with caution) |

## Configuration

### Project Configuration

Located at `.envguard/config.json`:

```json
{
  "packageName": "my-app",
  "defaultEnvironment": "development",
  "environments": ["development", "staging", "production"]
}
```

### Secret Manifest

Located at `.envguard/manifest.json`:

```json
{
  "secrets": {
    "DATABASE_URL": {
      "required": true,
      "description": "Database connection string"
    },
    "API_KEY": {
      "required": true,
      "description": "External API authentication key"
    }
  }
}
```

### Storage Location

Secrets are stored in your OS keychain with the format:

```
{packageName}:{environment}:{secretKey}
```

**Platform-specific locations:**

- **macOS:** Keychain Access (via Security.framework)
- **Windows:** Credential Manager (via DPAPI)
- **Linux:** Secret Service (GNOME Keyring / KWallet via libsecret)

## Architecture

### File Structure

```
your-project/
├── .envguard/
│   ├── config.json       # Project configuration
│   └── manifest.json     # Secret definitions
├── .env.template         # Team onboarding template (optional)
└── .gitignore            # Excludes .envguard/
```

### Security Model

**What EnvGuard provides:**

- OS-level encryption for secrets
- Per-machine secret isolation
- Audit trails for secret updates
- Namespace isolation between projects

**What EnvGuard does not provide:**

- Secret synchronization across machines
- Schema validation (planned)
- Automatic rotation (planned)
- Production-grade secret management

For production environments, use dedicated solutions like HashiCorp Vault, AWS Secrets Manager, or Google Secret Manager.

### Data Flow

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │ envg set
       ▼
┌────────────────┐      ┌──────────────┐
│ EnvGuard CLI   │─────▶│ OS Keychain  │
└────────────────┘      └──────────────┘
       │                       │
       │ envg get              │
       ▼                       ▼
┌────────────────────────────────┐
│  Application (process.env)     │
└────────────────────────────────┘
```

## Development

### Build from Source

```bash
# Clone the monorepo
git clone https://github.com/amannirala13/envguard.git
cd envguard

# Install dependencies
pnpm install

# Build CLI package
pnpm --filter @envguard/cli build

# Run locally
node packages/cli/dist/cli.js status
```

### Development Commands

```bash
# Start in watch mode
pnpm --filter @envguard/cli dev

# Run tests
pnpm --filter @envguard/cli test

# Type checking
pnpm --filter @envguard/cli typecheck

# Linting
pnpm --filter @envguard/cli lint
```

### Link Locally

```bash
# Link for local development
pnpm --filter @envguard/cli link --global

# Use in another project
cd ../your-app
envg status
```

## Publishing

See:

- [Publishing Guide](./PUBLISHING.md) - Detailed publishing instructions
- [Publish Checklist](./PUBLISH_CHECKLIST.md) - Pre-publish verification steps
- [Root Publishing Guide](../../PUBLISHING.md) - Monorepo publishing workflow

## Package Information

- **Package:** `@envguard/cli`
- **Version:** See [package.json](./package.json)
- **Dependencies:** See [package.json](./package.json)
- **License:** MIT
- **Repository:** [https://github.com/amannirala13/envguard](https://github.com/amannirala13/envguard)

## Related Packages

- **[@envguard/core](../core/README.md)** - Core business logic (internal)
- **[@envguard/node](../node/README.md)** - Node.js runtime integration (planned)

## Support

- **Documentation:** [Main README](../../README.md)
- **Issues:** [GitHub Issues](https://github.com/amannirala13/envguard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/amannirala13/envguard/discussions)
- **npm:** [@envguard/cli](https://www.npmjs.com/package/@envguard/cli)

## License

MIT © [Aman Nirala](https://github.com/amannirala13)

See [LICENSE](../../LICENSE) for details.
