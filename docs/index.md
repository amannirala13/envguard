---
layout: home

hero:
  name: 'EnvGuard'
  text: 'Local-first secret management'
  tagline: Store secrets in your OS keychain, not in .env files
  actions:
    - theme: brand
      text: Get Started
      link: /#quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/amannirala13/envguard

features:
  - title: OS Keychain Storage
    details: Secrets stored in macOS Keychain, Windows Credential Manager, or Linux Secret Service. Hardware-encrypted, platform-native security.

  - title: Never Commit Secrets
    details: No .env files in your repo. No plaintext secrets on disk. No accidentally committed credentials.

  - title: Drop-in Replacement
    details: Works just like .env files but secure. Simple CLI commands. Interactive secret management. Zero learning curve.

  - title: Multi-Environment
    details: Separate secrets for development, staging, and production. Copy between environments with ease.

  - title: Developer-Friendly
    details: Interactive CLI with masked secret display. Team templates. Migration from existing .env files in seconds.

  - title: Security First
    details: Secrets bound to your machine. Audit trails. Security checks. Built-in protection against common mistakes.
---

## Quick Start

### Installation

```bash
# Install globally
npm install -g @envguard/cli

# Or use without installing
npx @envguard/cli status
```

### Basic Usage

```bash
# Initialize in your project
envg init

# Add secrets interactively
envg edit

# Or set directly
envg set DATABASE_URL postgres://localhost/mydb
envg set API_KEY sk_live_abc123

# View secrets (masked by default)
envg show all

# Reveal when needed
envg show API_KEY --reveal
```

## Documentation

### For Users

- [Command Reference](../README.md#-commands)
- [Common Workflows](../README.md#-common-workflows)
- [How It Works](../README.md#-how-it-works)
- [Security Model](../README.md#-security-model)
- [CLI Package Documentation](../packages/cli/README.md)

### For Contributors

- [Contributing Guide](../README.md#-contributing)
- [Development Scripts](../SCRIPTS.md)
- [Claude AI Guidelines](../CLAUDE.md)
- [Project Structure](../README.md#-project-structure)
- [Core Package Documentation](../packages/core/README.md)

### For Maintainers

- [Quick Publish Guide](../QUICK_PUBLISH_GUIDE.md)
- [Detailed Publishing Guide](../PUBLISHING.md)
- [GitHub Actions Setup](../GITHUB_ACTIONS_SETUP.md)
- [CLI Publishing Checklist](../packages/cli/PUBLISH_CHECKLIST.md)

## Why EnvGuard?

**The Problem:**
`.env` files are plaintext files that developers accidentally commit to Git all the time. Even with `.gitignore`, they're easy to leak through backups, syncs, or simple mistakes.

**The Solution:**
EnvGuard stores secrets in your operating system's secure keychain - the same place your browser passwords and SSH keys are stored. Your secrets never touch disk as plaintext.

**The Result:**

- No more accidentally committed secrets
- No more Slack messages asking "what's the .env file?"
- No more plaintext secrets in backups
- Team members set their own local secrets
- Works exactly like .env files (but secure)

## Features

### Current Features

- **OS Keychain Integration** - macOS, Windows, Linux support
- **Interactive CLI** - Easy-to-use commands with helpful prompts
- **Multi-Environment** - Separate secrets for dev/staging/prod
- **Secret Management** - Add, edit, view, delete, copy secrets
- **Security Checks** - Detect .env files and security issues
- **Migration Tools** - Import from existing .env files
- **Team Templates** - Generate .env.template for onboarding

### Coming Soon

- **Node.js Runtime** - Drop-in dotenv replacement for Node apps
- **Schema Validation** - Enforce secret formats and requirements
- **Encrypted Backup** - Backup and restore secrets securely
- **Secret Rotation** - Automatic credential rotation
- **Python Runtime** - Python application integration
- **Docker Support** - Container secret injection

## Packages

### [@envguard/cli](../packages/cli/README.md)

The main CLI application. Provides the `envg` command for managing secrets.

```bash
npm install -g @envguard/cli
```

### [@envguard/core](../packages/core/README.md) (Internal)

Core business logic shared between packages. Not published separately.

### [@envguard/node](../packages/node/README.md) (Coming Soon)

Node.js runtime integration for loading secrets into your applications.

```javascript
// Drop-in replacement for dotenv
require('@envguard/node/config');
```

## Support

- [Full Documentation](../README.md)
- [Report Issues](https://github.com/amannirala13/envguard/issues)
- [Discussions](https://github.com/amannirala13/envguard/discussions)
- [npm Package](https://www.npmjs.com/package/@envguard/cli)

## License

MIT © [EnvGuard Contributors](https://github.com/amannirala13/envguard/graphs/contributors)
