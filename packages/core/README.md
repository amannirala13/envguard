# @envguard/core

**Internal Package** - Core business logic for EnvGuard

> ⚠️ This package is NOT published to npm. It is bundled into `@envguard/cli` and `@envguard/node` packages.

## Purpose

This package contains all the core business logic for EnvGuard, including:

- **Keychain Management** - System keychain integration (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **Manifest Management** - `.env.tpl` schema parsing and validation
- **Configuration** - Project configuration management
- **Types & Schemas** - Shared type definitions and Zod schemas

## Architecture

```
@envguard/core (internal, bundled)
├── keychain/          - System keychain integration
│   ├── system-keychain.ts
│   └── keychain.validator.ts
├── manifest/          - Manifest (.env.tpl) management
│   ├── manifest.manager.ts
│   ├── manifest.parser.ts
│   └── manifest.factory.ts
├── config/            - Configuration management
│   ├── config.manager.ts
│   ├── config.parser.ts
│   └── config.factory.ts
└── types/             - Shared type definitions
    └── types.schema.ts

Used by:
├── @envguard/cli      - CLI application (bundles core)
└── @envguard/node     - Node.js runtime (bundles core)
```

## Why Internal?

This package is marked as `private: true` and not published separately because:

1. **Single Source of Truth** - All business logic lives in one place
2. **No Duplication** - CLI and Node packages bundle the same code
3. **Simplified Updates** - Changes to core logic automatically propagate
4. **No Version Management** - Users don't need to worry about core version compatibility

## Development

```bash
# Build the package
pnpm build

# Run type checking
pnpm typecheck

# Run tests (currently in CLI package)
pnpm test

# Watch mode
pnpm dev
```

## Usage

This package is consumed internally by workspace packages using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@envguard/core": "workspace:*"
  }
}
```

And bundled using tsup:

```typescript
// tsup.config.ts
export default defineConfig({
  noExternal: ['@envguard/core'], // Bundle core into output
});
```

## License

MIT - See root LICENSE file
