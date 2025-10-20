# @envguard/core

**Core business logic for EnvGuard**

> **Note:** This package is not published to npm. It is bundled into `@envguard/cli` and `@envguard/node`.

## Overview

This package contains all core business logic for EnvGuard, providing shared functionality for keychain management, configuration, and secret handling across all EnvGuard packages.

## Purpose

The core package serves as:

- **Single Source of Truth** - All business logic lives in one place
- **Shared Foundation** - Used by both CLI and runtime packages
- **Internal Abstraction** - No public API, consumed only by workspace packages

## Architecture

```
@envguard/core (internal, bundled)
│
├── keychain/              System keychain integration
│   ├── system-keychain.ts       Keychain provider implementation
│   └── keychain.validator.ts    Input validation
│
├── manifest/              Manifest management
│   ├── manifest.manager.ts      CRUD operations
│   ├── manifest.parser.ts       JSON parsing
│   └── manifest.factory.ts      Manifest creation
│
├── config/                Configuration management
│   ├── config.manager.ts        Config CRUD
│   ├── config.parser.ts         Config parsing
│   └── config.factory.ts        Config initialization
│
└── types/                 Shared type definitions
    └── types.schema.ts          Zod schemas and types
```

## Features

### Keychain Integration

Platform-agnostic OS keychain access:

- **macOS:** Keychain Access via Security.framework
- **Windows:** Credential Manager via DPAPI
- **Linux:** Secret Service (GNOME Keyring / KWallet via libsecret)

### Manifest Management

`.env.tpl` schema handling:

- JSON schema parsing and validation
- Secret definition storage
- Template generation
- Multi-environment support

### Configuration Management

Project configuration handling:

- `.envguard/config.json` management
- Environment configuration
- Package namespace management

### Type System

Comprehensive TypeScript types and Zod schemas for:

- Secret definitions
- Configuration structures
- Keychain operations
- Validation rules

## Why Internal?

This package is marked as `private: true` because:

1. **Simplified Distribution** - Users only install `@envguard/cli` or `@envguard/node`
2. **No Version Conflicts** - Core is always compatible with consuming packages
3. **Implementation Detail** - Internal architecture, not public API
4. **Bundling Strategy** - Reduces dependency tree for end users

## Usage

### Within the Monorepo

Consumed by workspace packages using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@envguard/core": "workspace:*"
  }
}
```

### Bundling

Bundled into output packages using tsup:

```typescript
// tsup.config.ts
export default defineConfig({
  noExternal: ['@envguard/core'],
  external: ['@napi-rs/keyring'],
});
```

## Development

### Build

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev
```

### Type Checking

```bash
pnpm typecheck
```

### Testing

Tests are currently located in the CLI package:

```bash
# From monorepo root
pnpm --filter @envguard/cli test
```

## Package Information

- **Package:** `@envguard/core`
- **Version:** See [package.json](./package.json)
- **Private:** Yes (not published to npm)
- **License:** MIT
- **Repository:** [https://github.com/amannirala13/envguard](https://github.com/amannirala13/envguard)

## Related Packages

- **[@envguard/cli](../cli/README.md)** - CLI application (bundles core)
- **[@envguard/node](../node/README.md)** - Node.js runtime (bundles core)

## Documentation

- **Main Documentation:** [Root README](../../README.md)
- **Development Guide:** [CLAUDE.md](../../CLAUDE.md)
- **Monorepo Structure:** [Root README - Project Structure](../../README.md#project-structure)

## License

MIT © [Aman Nirala](https://github.com/amannirala13)

See [LICENSE](../../LICENSE) for details.
