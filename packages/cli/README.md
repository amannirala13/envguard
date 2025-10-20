# EnvGuard CLI

**Simple, local secret management using your OS keychain**

EnvGuard is a command-line tool that stores environment variables in your operating system's secure keychain instead of `.env` files. Secrets stay on your machine, encrypted by the OS, and never touch your Git repository.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Status: Alpha](https://img.shields.io/badge/status-alpha-orange.svg)

## What It Does

**Currently Implemented:**

- Store secrets in your OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- Interactive CLI for adding, viewing, and managing secrets
- Support for multiple environments (development, staging, production)
- Copy secrets between environments
- Security checks for `.env` files in your repository
- Migration from existing `.env` files
- Template generation for team onboarding

**In Development:**

- Runtime integration for Node.js applications
- Secret validation and schema enforcement
- Encrypted backup and restore
- Python and Docker runtime support

## 🚀 Quick Start

### Installation

```bash
# Install globally (requires Node.js 18+)
npm install -g @envguard/cli

# Or use without installing
npx @envguard/cli status
```

### Basic Usage (Just Like .env Files!)

```bash
# 1. Initialize in your project (one-time setup)
cd my-project
envg init

# 2. Add your secrets interactively
envg edit
# Opens interactive menu to add/edit secrets - just like editing a .env file!

# Or set them directly
envg set DATABASE_URL postgresql://localhost/mydb
envg set API_KEY sk_live_abc123

# 3. View your secrets (masked by default)
envg show all
# Tip: Use --reveal to see actual values

# 4. That's it! Your secrets are safely stored in your OS keychain
# No .env file, no plaintext secrets in your repo
```

### Migrating from .env Files

Already have a `.env` file? Migrate in seconds:

```bash
envg init
envg migrate          # Reads .env, stores in keychain, secures your repo
# Your secrets are now safe! The .env file can be deleted.
```

## 💡 Common Workflows

### Adding Your First Secret

```bash
# Interactive way (easiest!)
envg edit
# Select "Add new secret" and follow the prompts

# Direct way
envg set API_KEY abc123
```

### Viewing Secrets Safely

```bash
# View all secrets (masked for security)
envg show all
# Output: API_KEY (required): ab***23

# View specific secret
envg show API_KEY

# Reveal actual value (when you need it)
envg show API_KEY --reveal
```

### Editing Multiple Secrets

```bash
# Interactive menu - edit one or many
envg edit

# Options:
# 1. Edit all secrets
# 2. Edit specific secret
# 3. Add new secret
# 4. Cancel
```

### Working with Multiple Environments

```bash
# Set secrets for different environments
envg set DATABASE_URL postgres://localhost/dev
envg set DATABASE_URL postgres://prod-server/db --env production

# Copy development secrets to staging
envg copy --from development --to staging

# Copy specific secret to production (with confirmation)
envg copy API_KEY --from development --to production

# View staging environment secrets
envg show all --env staging
```

### Checking Project Health

```bash
# Full security and secrets check
envg check

# Just check if secrets are configured properly
envg check --secrets

# Just check for security issues (.env files, etc.)
envg check --security
```

### Generating Template for Team

```bash
# Create .env.template for your team
envg template

# Team members can see what secrets they need without seeing values!
```

## 📖 How It Works

EnvGuard stores your secrets in your operating system's secure keychain:

1. **Initialize** - Run `envg init` to set up EnvGuard in your project
2. **Store** - Use `envg set` or `envg edit` to save secrets to your OS keychain
3. **Retrieve** - Use `envg get` or `envg show` to view your secrets
4. **Manage** - Copy between environments, export templates, run security checks

```
my-project/
├── .envguard/
│   ├── config.json        # Project config (gitignored)
│   └── manifest.json      # Secret manifest (gitignored)
└── .env.template          # Team documentation (optional, can commit)
```

**Where secrets are stored:**

- **macOS**: Keychain Access (`Security.framework`)
- **Windows**: Credential Manager
- **Linux**: Secret Service API (GNOME Keyring, KWallet)

Secrets are stored with a namespaced key: `{package-name}:{environment}:{secret-name}`

This ensures no conflicts between different projects on your machine.

## 🛠️ Commands

### Getting Started

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `envg init`    | Initialize EnvGuard in current directory |
| `envg status`  | Show EnvGuard status and configuration   |
| `envg migrate` | Migrate from .env files to EnvGuard      |

### Managing Secrets (Interactive & Easy!)

| Command                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| `envg edit`              | 🎯 Interactive menu to add/edit secrets       |
| `envg edit <key>`        | Edit a specific secret                        |
| `envg set <key> <value>` | Quickly set a secret                          |
| `envg show all`          | View all secrets (masked)                     |
| `envg show <key>`        | View specific secret (use --reveal to unmask) |
| `envg get <key>`         | Retrieve a secret value                       |
| `envg del <key>`         | Delete a secret                               |
| `envg list`              | List all secret keys                          |

### Environment Management

| Command                                   | Description                        |
| ----------------------------------------- | ---------------------------------- |
| `envg copy --from dev --to staging`       | Copy all secrets between envs      |
| `envg copy <key> --from dev --to prod`    | Copy specific secret               |
| `envg set <key> <value> --env production` | Set secret in specific environment |
| `envg show all --env staging`             | View secrets in specific env       |

### Project Health

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `envg check`            | Check secrets and security issues             |
| `envg check --secrets`  | Only check missing/invalid secrets            |
| `envg check --security` | Only check security issues (.env files, etc.) |
| `envg template`         | Generate .env.template from current secrets   |

### Export (Use Sparingly!)

| Command                          | Description                                  |
| -------------------------------- | -------------------------------------------- |
| `envg export --unsafe --to .env` | Export to .env file (INSECURE - be careful!) |

## 🛡️ Security Model

**What EnvGuard Does:**

- Stores secrets in your OS keychain (hardware-encrypted, platform-specific)
- Secrets are bound to your machine and can't easily be copied
- Tracks when secrets were last updated for audit purposes
- Supports marking secrets as required or optional

**What EnvGuard Doesn't Do (Yet):**

- Schema validation of secret values
- Secret rotation automation
- Git hooks for preventing commits
- Encrypted backup/sync between machines

EnvGuard focuses on being a simple, reliable tool for local development. For production secret management, consider dedicated solutions like HashiCorp Vault, AWS Secrets Manager, or similar.

## 🚧 Development Status

EnvGuard is in **alpha**. Core functionality works, but expect bugs and changes.

**What Works:**

- ✅ OS keychain storage (macOS, Windows, Linux)
- ✅ All CLI commands (init, set, get, edit, show, copy, check, migrate, etc.)
- ✅ Multi-environment support
- ✅ Interactive secret management
- ✅ Security checks

**In Progress:**

- ⏳ Runtime integration (Node.js, Python, Docker)
- ⏳ Secret validation and schema enforcement
- ⏳ Encrypted backup/restore
- ⏳ Comprehensive test coverage

## 📁 Project Repository

This is part of the EnvGuard monorepo: https://github.com/amannirala13/envguard

## 🆘 Support

- 📚 [Documentation](https://github.com/amannirala13/envguard#readme)
- 🐛 [Issue Tracker](https://github.com/amannirala13/envguard/issues)
- 💬 [Discussions](https://github.com/amannirala13/envguard/discussions)

## 📄 License

MIT © [Aman Nirala](https://github.com/amannirala13)

---

**Made for developers who care about security**
