# EnvGuard

**Simple, local secret management using your OS keychain**

EnvGuard is a command-line tool that stores environment variables in your operating system's secure keychain instead of `.env` files. Secrets stay on your machine, encrypted by the OS, and never touch your Git repository.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Status: Alpha](https://img.shields.io/badge/status-alpha-orange.svg)

## 📚 Documentation

### User Guides

- **[Quick Start](#-quick-start)** - Get started in 5 minutes
- **[Commands Reference](#-commands)** - All available commands
- **[Common Workflows](#-common-workflows)** - Real-world usage examples
- **[How It Works](#-how-it-works)** - Architecture and file structure

### Maintainer Guides

- **[Quick Publish Guide](./QUICK_PUBLISH_GUIDE.md)** - Fast reference for publishing packages
- **[Detailed Publishing Guide](./PUBLISHING.md)** - Complete publishing documentation
- **[GitHub Actions Setup](./GITHUB_ACTIONS_SETUP.md)** - CI/CD configuration
- **[Contributing](#-contributing)** - Development setup and guidelines

### Project Information

- **[Project Structure](#-project-structure)** - Monorepo architecture
- **[Roadmap](#-roadmap)** - Development timeline
- **[Security Model](#-security-model)** - How secrets are protected

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

## 🛠️ Build and Use (Node workflow)

EnvGuard ships as a standard Node.js CLI. Use whichever workflow matches your needs:

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8 (recommended for development)

### Option A — Run without installing

```bash
pnpm dlx @envguard/cli@latest status
```

### Option B — Global install

```bash
npm install -g @envguard/cli
envguard status
```

### Option C — From source (monorepo contributors)

```bash
# Install workspace dependencies
pnpm install

# Build the CLI package
pnpm --filter @envguard/cli run build

# Execute the compiled CLI
device envguard status
node packages/cli/dist/cli.cjs status

# Or use watch mode during development
pnpm --filter @envguard/cli run dev
```

### Local linking for adjacent projects

```bash
# Link the CLI into another project without publishing
pnpm --filter @envguard/cli link --global
cd ../your-app
pnpm link @envguard/cli
envguard status
```

---

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

## 📁 Project Structure

This is a TypeScript monorepo using pnpm workspaces:

```
envguard/
├── packages/
│   ├── cli/                    # Main CLI application
│   └── node/                   # Node.js runtime integration
├── .plan/                      # Development roadmap
├── package.json                # Root workspace config
└── pnpm-workspace.yaml         # Workspace definition
```

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

See [Roadmap](#-roadmap) below for planned features.

## 🤝 Contributing

We welcome contributions! Please see our development workflow:

### Prerequisites

- Node.js ≥18.0.0
- pnpm ≥8.0.0
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/envguard/envguard.git
cd envguard

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development
pnpm dev
```

### Development Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Start CLI in development mode  |
| `pnpm build`     | Build all packages             |
| `pnpm test`      | Run full test suite            |
| `pnpm lint`      | Lint and format code           |
| `pnpm typecheck` | Type check all packages        |
| `pnpm validate`  | Run lint, typecheck, and tests |

### Package Structure

- **`packages/cli/`** - Main EnvGuard CLI application
- **`packages/node/`** - Node.js runtime integration
- **`.plan/`** - Development roadmap and implementation guides

## 📋 Roadmap

### Week 1: Foundation ✅

- [x] Project setup and configuration
- [x] Implementation planning
- [ ] Keychain integration
- [ ] Basic CLI commands

### Week 2: Core Features

- [ ] Config parser and validation
- [ ] Backup/restore system
- [ ] Secret rotation
- [ ] Git integration

### Week 3: Runtime Integration

- [ ] Node.js runner
- [ ] Python runner
- [ ] Docker integration

### Week 4: Release

- [ ] Cross-platform packaging
- [ ] Documentation
- [ ] CI/CD pipeline
- [ ] Public release

## 🆘 Support

- 📚 [Documentation](https://envguard.dev/docs)
- 🐛 [Issue Tracker](https://github.com/envguard/envguard/issues)
- 💬 [Discussions](https://github.com/envguard/envguard/discussions)

## 📄 License

MIT © [EnvGuard Contributors](https://github.com/amannirala13/envguard/graphs/contributors)

---

**Made with ❤️ for developers who care about security**
