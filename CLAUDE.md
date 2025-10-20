# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EnvGuard is a **local-first secret management tool for developers** that stores secrets in the OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) and uses safe placeholders in Git repositories. The project is built as a TypeScript monorepo using pnpm workspaces.

## Architecture

### Monorepo Structure

This is a **pnpm workspace monorepo** with three main packages:

- **`packages/cli/`** - Main EnvGuard CLI application (`@envguard/cli`)
  - Contains the command-line interface and core logic
  - Binary entry point: `envguard` command
  - Core modules for keychain integration, secret storage, validation, and Git integration

- **`packages/node/`** - Node.js runtime integration (`@envguard/node`)
  - Provides runtime secret injection for Node.js applications
  - Used as `envguard-node app.js` or via Node.js preload module

- **`packages/runner-python/`** - Python runtime integration (planned)
  - Python package for secret injection in Python applications

### Core Concepts

**Secret Storage Flow:**

1. Secrets are defined in `.env.tpl` (JSON schema with validators)
2. Actual values are stored via `envguard set` → OS keychain
3. Safe placeholders are written to `.env.redacted` (Git-safe format: `redacted:KEY:hash`)
4. Runtime runners resolve placeholders from keychain when applications start

**File Types:**

- `.env.tpl` - Committed schema definition with validators (JSON)
- `.env.redacted` - Committed placeholder file (safe for Git)
- `.envguard/` - Local config directory (gitignored)
- `.env` - Never created by EnvGuard (to avoid confusion)

### Development Status

**Current Phase:** Foundation (Week 1 of 4-week roadmap)

- Project structure: ✅ Complete
- Configuration: ✅ Complete
- Keychain integration: 🚧 Not yet implemented
- CLI commands: 🚧 Not yet implemented

See `.plan/implementation-guidebook.md` for the complete 4-week development roadmap with detailed implementation instructions for each module.

## Common Commands

### Development Workflow

```bash
# Install all dependencies (from root)
pnpm install

# Build all packages
pnpm build

# Run type checking across all packages
pnpm typecheck

# Run tests across all packages
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run CLI in development mode (auto-reload)
pnpm dev

# Lint all code
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting without changes
pnpm format:check

# Run full validation (lint + typecheck + test)
pnpm validate

# Clean all build artifacts and node_modules
pnpm clean
```

### Working on Specific Packages

```bash
# Run commands for a specific package
pnpm --filter @envguard/cli build
pnpm --filter @envguard/node test

# Run tests for CLI package only
cd packages/cli && pnpm test

# Watch mode for CLI development
cd packages/cli && pnpm dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for a single file
pnpm --filter @envguard/cli test src/core/keychain.test.ts

# Run with coverage thresholds (80% required)
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Build System

### TypeScript Configuration

- **`tsconfig.base.json`** - Shared base configuration with strict type checking
  - Target: ES2022, CommonJS modules
  - Strict mode enabled with comprehensive checks (`noUnusedLocals`, `noImplicitReturns`, etc.)
  - Each package extends this with `"extends": "../../tsconfig.base.json"`

### Build Tool (tsup)

Both `cli` and `node` use **tsup** for building:

- CLI builds: ESM format with CLI entry point
- Node builds: Both ESM and CJS formats for compatibility
- Generates TypeScript declarations (`.d.ts`)
- Source maps enabled for debugging

Build configs are in `packages/*/tsup.config.ts`

### Testing (Vitest)

- **Test framework:** Vitest with Node environment
- **Coverage:** v8 provider with 80% threshold (lines, functions, branches, statements)
- **Test files:** `**/*.test.ts`, `**/*.spec.ts`, `**/__tests__/**/*.test.ts`
- **Config:** `vitest.config.ts` (root) + `vitest.workspace.ts` (workspace config)

## Code Quality Tools

### ESLint

- Based on Airbnb TypeScript config
- Additional plugins: prettier, security, sonarjs, unicorn, promise
- Config: `.eslintrc.cjs`

### Prettier

- Single quotes, 2-space tabs, semicolons
- Config: `.prettierrc.json`

### Git Hooks (Husky)

- Pre-commit: `lint-staged` (currently not initialized due to no Git repo)
- Commitlint: Conventional commits format

## Key Implementation Notes

### Security Model (Not Yet Implemented)

When implementing security features:

- Secrets must **never** touch disk in plaintext
- Use OS keychain APIs (keytar or similar library)
- Placeholders use format: `redacted:KEY_NAME:short_hash`
- All operations should be defensive (validate inputs, sanitize outputs)

### CLI Command Structure (Planned)

When implementing CLI commands:

- Use Commander.js framework
- Commands should be in `packages/cli/src/commands/`
- Core logic should be in `packages/cli/src/core/`
- Follow the command structure outlined in README.md

### Validators (To Be Implemented)

The `.env.tpl` schema supports validators:

- `url` - Valid URL format
- `email` - Valid email format
- `length` - String length constraints (minLength, maxLength)
- `regex` - Custom regex patterns
- `number` - Numeric range validation

### Cross-Platform Considerations

When implementing keychain integration:

- macOS: Use Keychain Access API
- Windows: Use Credential Manager
- Linux: Use Secret Service (libsecret)
- Must handle platform detection and fallbacks

## Package Dependencies

### CLI Package (`@envguard/cli`)

- `commander` - CLI framework
- `chalk` - Terminal colors
- `inquirer` - Interactive prompts
- `ora` - Loading spinners
- `conf` - Config management
- `dotenv` - Env file parsing

### Node Package (`@envguard/node`)

- `dotenv` - Env file parsing (minimal dependencies)

## Important Patterns

### Workspace Commands

Always use `pnpm -r` (recursive) or `pnpm --filter` to run commands across packages:

```bash
pnpm -r build          # Build all packages
pnpm -r --stream test  # Stream output from all package tests
```

### Type Safety

The codebase uses **strict TypeScript** with comprehensive checks:

- All functions must have explicit return types when not obvious
- No implicit `any` types allowed
- Handle all nullable cases (`noUncheckedIndexedAccess`)
- Use `exactOptionalPropertyTypes` for precise optional property handling

### Module Resolution

- CommonJS modules (`module: "commonjs"`)
- Node module resolution
- ESM interop enabled for modern npm packages

## Reference Documentation

- **Implementation Guide:** `.plan/implementation-guidebook.md` - Complete 28-day roadmap with detailed tasks
- **README:** `README.md` - User-facing documentation and project overview
- **Package Manager:** pnpm ≥8.0.0 required
- **Node Version:** ≥18.0.0 required
