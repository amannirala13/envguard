# Changelog

All notable changes to `@envguard/node` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.1.3...@envguard/node@0.2.0
[0.1.3]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.1.2...@envguard/node@0.1.3
[0.1.2]: https://github.com/amannirala13/envguard/compare/@envguard/node@0.1.1...@envguard/node@0.1.2
[0.1.1]: https://github.com/amannirala13/envguard/releases/tag/@envguard/node@0.1.1
