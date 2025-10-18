# EnvGuard 🔒

**Local-first secret management for developers**

Keep your `.env` files secure without the complexity of enterprise secret managers. EnvGuard stores secrets in your OS keychain and uses safe placeholders in your repository.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## ✨ Features

- 🔐 **OS Keychain Integration** - Secrets stored in macOS Keychain, Windows Credential Manager, or Linux Secret Service
- 🔄 **Git-Friendly** - Commit placeholder files, never plaintext secrets
- ⚡ **Zero Config** - Works out of the box, no servers required
- 🛡️ **Type Validation** - Validate secrets against custom schemas
- 🔄 **Secret Rotation** - Track and rotate secrets with automatic placeholder updates
- 📦 **Encrypted Backups** - Securely transfer secrets between machines
- 🏃 **Multi-Runtime** - Support for Node.js, Python, and Docker environments
- 🪝 **Git Hooks** - Prevent accidental secret commits

## 🚀 Quick Start

### Installation

```bash
# Run the CLI without installing (pnpm required)
pnpm dlx @envguard/cli@latest status

# Or install globally (requires Node.js 18+)
npm install -g @envguard/cli
```

### Basic Usage

```bash
# 1. Initialize in your project
cd my-project
envguard init

# 2. Store secrets securely
envguard set DATABASE_URL postgresql://localhost/mydb
envguard set API_KEY sk_live_abc123

# 3. Your app automatically gets real values
pnpm dev  # Environment variables are auto-resolved
```

## 📖 How It Works

EnvGuard follows a simple but powerful workflow:

1. **Define** secrets in `.env.tpl` (JSON schema)
2. **Store** actual values with `envguard set` (goes to OS keychain)
3. **Commit** safe `.env.redacted` with placeholders to Git
4. **Share** - teammates sync secrets without exposing values

```
my-project/
├── .env.tpl           # Schema definition (committed) ✅
├── .env.redacted      # Safe placeholders (committed) ✅
├── .envguard/         # Local config (gitignored) 🚫
└── .env               # Never created by EnvGuard 🚫
```

### Example Files

**.env.tpl** (defines your secrets schema):

```json
{
  "version": "1.0",
  "secrets": [
    {
      "name": "DATABASE_URL",
      "description": "PostgreSQL connection string",
      "required": true,
      "validator": "url"
    },
    {
      "name": "API_KEY",
      "description": "Stripe API key",
      "required": true,
      "validator": "length",
      "minLength": 32
    }
  ]
}
```

**.env.redacted** (safe placeholders for Git):

```
DATABASE_URL=redacted:DATABASE_URL:a1b2c3
API_KEY=redacted:API_KEY:d4e5f6
```

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

### Core Commands

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `envguard init`              | Initialize EnvGuard in current directory |
| `envguard set <key> <value>` | Store a secret in OS keychain            |
| `envguard get <key>`         | Retrieve a secret (for debugging)        |
| `envguard list`              | List all stored secret keys              |

### Management Commands

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `envguard diff`         | Show which secrets are missing/out of sync |
| `envguard validate`     | Validate all secrets against `.env.tpl`    |
| `envguard rotate <key>` | Generate new value for a secret            |
| `envguard delete <key>` | Remove a secret from keychain              |
| `envguard clean`        | Remove secrets not in `.env.tpl`           |

### Backup & Sync Commands

| Command                         | Description                            |
| ------------------------------- | -------------------------------------- |
| `envguard export`               | Create encrypted backup of all secrets |
| `envguard import <backup-file>` | Restore secrets from backup            |

### Git Integration

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `envguard install-hooks` | Install Git pre-commit hooks |

## 🏃 Runtime Integration

### Node.js

```bash
# Option 1: Use the runner
envguard-node app.js

# Option 2: Require the preload module
node --require @envguard/runner-node/preload app.js

# Option 3: Package.json script
{
  "scripts": {
    "dev": "envguard-node src/index.js",
    "start": "node --require @envguard/runner-node/preload dist/app.js"
  }
}
```

### Python

```bash
# Install Python runner
pip install envguard-runner

# Run your app
envguard-python app.py

# Or use directly
python -c "import envguard; envguard.setup()" app.py
```

### Docker

```dockerfile
FROM node:18

# Install EnvGuard CLI
RUN npm install -g envguard

# Copy your redacted env file
COPY .env.redacted /app/.env.redacted

# Use EnvGuard entrypoint
ENTRYPOINT ["envguard-entrypoint"]
CMD ["npm", "start"]
```

## 🛡️ Security Model

- **Machine-bound**: Secrets stored in OS keychain, can't be copied to another device
- **Encrypted at rest**: OS keychain provides hardware-level encryption
- **Git-safe**: Only safe placeholders ever touch your repository
- **Audit trail**: Track when secrets were created and rotated
- **Validation**: Prevent weak or malformed secrets

## 📁 Project Structure

This is a TypeScript monorepo using pnpm workspaces:

```
envguard/
├── packages/
│   ├── cli/                    # Main CLI application
│   └── runner-node/            # Node.js runtime integration
├── .plan/                      # Development roadmap
├── package.json                # Root workspace config
└── pnpm-workspace.yaml         # Workspace definition
```

## 🚧 Development Status

EnvGuard is currently in **active development**.

**Current Phase**: Foundation (Week 1 of 4-week roadmap)

- ✅ Project structure and configuration
- ✅ Comprehensive implementation plan
- 🚧 Core keychain integration (in progress)
- ⏳ CLI commands implementation
- ⏳ Runtime runners
- ⏳ Cross-platform packaging

See [Implementation Guidebook](.plan/implementation-guidebook.md) for detailed development roadmap.

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
- **`packages/runner-node/`** - Node.js runtime integration
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

MIT © [EnvGuard Contributors](https://github.com/envguard/envguard/graphs/contributors)

---

**Made with ❤️ for developers who care about security**

# Temporary change for testing
