# Changelog

All notable changes to `@envguard/node` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-10-26

### BREAKING CHANGES

#### 1. Auto-Loading Completely Removed

The auto-load feature has been **removed** due to a critical race condition.

**Removed:**

- `require('@envguard/node/config')` ❌
- `import '@envguard/node/config'` ❌
- `node --require @envguard/node/register` ❌

**Reason:** The async IIFE implementation returned immediately without waiting for secrets to load, causing timing issues where `process.env` secrets were undefined.

**Migration Required:**

```javascript
// ❌ Old (v0.2.x) - NO LONGER WORKS
require('@envguard/node/config');
console.log(process.env.API_KEY); // undefined!

// ✅ New (v0.3.0+) - Explicit async
(async () => {
  await require('@envguard/node').config();
  console.log(process.env.API_KEY); // Works!
})();
```

**For --require users:**

```javascript
// entry.js
(async () => {
  await require('@envguard/node').config({
    env: process.env.ENVGUARD_ENV,
    debug: process.env.ENVGUARD_DEBUG === 'true',
  });
  require('./app'); // Your actual app
})();
```

```bash
# Run: node entry.js (instead of node --require @envguard/node/register app.js)
```

###

Removed

- **config.ts** - Auto-load entry point
- **register.ts** - --require hook
- **Exports**: `./config` and `./register` from package.json
- **Build**: config/register from tsup.config.ts

### Added

- **MIGRATION_GUIDE_V03.md** - Comprehensive migration guide with examples
- **Updated documentation** - All README examples show async usage
- **Framework examples** - Express, Next.js, NestJS updated for v0.3.0

### Fixed

- **Critical race condition** - Secrets now guaranteed to load before app starts
- **Timeout errors** - No more "Timeout waiting for secrets to load"
- **Event loop blocking** - Removed broken synchronous wrapper

### Documentation

- Updated Quick Start with breaking change warning
- Added migration checklist
- Updated all framework integration examples
- Improved error messages and warnings

### Migration Path

See [MIGRATION_GUIDE_V03.md](./MIGRATION_GUIDE_V03.md) for detailed migration instructions.

---

## [0.2.0] - 2025-01-25

### BREAKING CHANGES

- **config() is now async**: The `config()` function now returns a `Promise<LoadResult>` instead of `LoadResult`. This fixes a critical bug where the synchronous implementation caused timeouts.

### Changed

- `config(options?)` now returns `Promise<LoadResult>` (previously returned `LoadResult`)
- Updated all documentation and examples to use `await envguard.config()`

### Fixed

- Fixed critical timeout bug in `config()` function caused by event loop blocking
- Resolved "Timeout waiting for secrets to load" error

### Added

- Added `@napi-rs/keyring` as a runtime dependency (was missing)

### Migration Guide

**Before (v0.1.x):**

```javascript
const result = envguard.config();
```

**After (v0.2.0):**

```javascript
// ES Modules
const result = await envguard.config();

// CommonJS
(async () => {
  const result = await envguard.config();
})();
```

**Note:** Auto-loading via `require('@envguard/node/config')` still works without changes.

## [0.1.3] - 2025-01-21

### Fixed

- Documentation improvements and fixes

## [0.1.2] - 2025-01-20

### Fixed

- Documentation fixes

## [0.1.1] - 2025-01-19

### Added

- Initial release
- OS keychain integration
- Multi-environment support
- Testing utilities
- Full TypeScript support

[Unreleased]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.3.0...HEAD
[0.3.0]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.2.0...@envguard/node@0.3.0
[0.2.0]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.1.3...@envguard/node@0.2.0
[0.1.3]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.1.2...@envguard/node@0.1.3
[0.1.2]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.1.1...@envguard/node@0.1.2
[0.1.1]: https://github.com/amannirala13/envguard/releases/tag/@envguard/node@0.1.1
