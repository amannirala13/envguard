# EnvGuard Scripts Guide

> Enterprise-grade monorepo scripts inspired by FAANG engineering practices

## Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI/CD](#cicd)
- [Maintenance](#maintenance)
- [Advanced Usage](#advanced-usage)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build

# Validate everything
pnpm validate
```

---

## Development

### Start Development Server

```bash
# Start CLI development with hot reload
pnpm dev

# Start all packages in parallel
pnpm dev:all

# Debug mode with Node inspector
cd packages/cli && pnpm dev:debug
```

**Features:**

- 🔥 Hot reload on file changes
- 🐛 Debug support with Chrome DevTools
- 📦 Automatic dependency tracking

---

## Building

### Standard Build

```bash
# Build all packages with Turbo caching
pnpm build

# Force rebuild (skip cache)
pnpm build:force

# Watch mode for development
cd packages/cli && pnpm build:watch
```

**Build Pipeline:**

1. ✅ Pre-build: Type checking + Format validation
2. 📦 Build: Compile TypeScript with tsup
3. ✅ Post-build: Bundle size analysis
4. 🔍 Validation: Ensure build artifacts are valid

### Build Features

- **Turborepo caching**: Incremental builds only rebuild changed packages
- **Parallel execution**: All packages build concurrently
- **Dependency awareness**: Packages build in correct order
- **Output validation**: Automatic smoke tests post-build

---

## Testing

### Test Commands

```bash
# Run all tests
pnpm test

# Watch mode (runs affected tests on change)
pnpm test:watch

# Coverage reports
pnpm test:coverage

# CI mode (optimized for GitHub Actions)
pnpm test:ci

# Interactive UI (Vitest UI)
cd packages/cli && pnpm test:ui

# Debug tests
cd packages/cli && pnpm test:debug
```

### Test Strategy

| Command         | Use Case         | Caching | Parallel                |
| --------------- | ---------------- | ------- | ----------------------- |
| `test`          | Quick validation | ✅ Yes  | ✅ Yes                  |
| `test:watch`    | Development      | ❌ No   | ✅ Yes                  |
| `test:coverage` | Quality gates    | ✅ Yes  | ✅ Yes                  |
| `test:ci`       | CI/CD pipelines  | ✅ Yes  | Limited (concurrency=2) |

**Coverage Requirements:**

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

---

## Code Quality

### Linting

```bash
# Lint all files (fail on warnings)
pnpm lint

# Lint errors only (ignore warnings)
pnpm lint:errors

# Auto-fix issues
pnpm lint:fix
```

### Formatting

```bash
# Format all files
pnpm format

# Check formatting (CI)
pnpm format:check
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck

# Watch mode
cd packages/cli && pnpm typecheck:watch
```

### Combined Validation

```bash
# Full validation (format + lint + types + tests)
pnpm validate

# Quick validation (skip tests)
pnpm validate:quick
```

**Validation Pipeline:**

```
format:check → lint:errors → typecheck → test
```

---

## CI/CD

### Continuous Integration

```bash
# Full CI pipeline
pnpm ci
```

**CI Pipeline Steps:**

1. Format check
2. Lint (errors only)
3. Type checking
4. Test with coverage
5. Build all packages

### Release Management

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm changeset:version

# Publish to npm
pnpm release
```

**Release Process:**

1. Create changeset: `pnpm changeset`
2. Version bump: `pnpm changeset:version`
3. CI validation: `pnpm ci`
4. Publish: `pnpm release` (requires npm auth)

---

## Maintenance

### Cleanup

```bash
# Clean build artifacts
pnpm clean

# Clean everything (including node_modules)
pnpm clean:all

# Clean dependencies only
pnpm clean:deps

# Clean build outputs only
pnpm clean:build

# Full reset (clean + reinstall)
pnpm reset
```

### Bundle Analysis

```bash
# Check bundle sizes
pnpm size

# Size limit checks (if configured)
pnpm size:limit
```

---

## Advanced Usage

### Turborepo Features

**Incremental Builds:**

```bash
# Only rebuild changed packages
pnpm build

# Rebuild everything
pnpm build:force
```

**Filtering:**

```bash
# Build specific package
turbo run build --filter=@envguard/cli

# Build package and dependencies
turbo run build --filter=@envguard/cli...

# Build package and dependents
turbo run build --filter=...@envguard/cli
```

**Cache Management:**

```bash
# View cache stats
turbo run build --summarize

# Clear Turbo cache
rm -rf .turbo

# Disable cache for single run
turbo run build --force
```

### Git Hooks

**Pre-commit Hook:**

- Runs `lint-staged` automatically
- Fixes linting issues
- Formats code
- Runs tests for changed files only

**Setup:**

```bash
# Initialize Husky
pnpm prepare

# Test pre-commit hook
git add . && git commit -m "test"
```

### Package-Specific Scripts

Each package has additional scripts:

```bash
# CLI package
cd packages/cli
pnpm dev          # Hot reload CLI
pnpm dev:debug    # Debug mode
pnpm test:ui      # Test UI
pnpm test:debug   # Debug tests

# Runner package
cd packages/node
pnpm build:watch  # Watch mode build
pnpm typecheck:watch  # Watch type checking
```

---

## Performance Tips

### Maximize Turbo Cache Hits

1. **Consistent environments**: Use same Node/pnpm versions across team
2. **Stable dependencies**: Lock versions in package.json
3. **Cache remote**: Configure remote caching for teams (optional)

### Parallel Execution

```bash
# Maximum parallelism (default)
pnpm test

# Limit concurrency (CI)
turbo run test --concurrency=2

# Fully parallel (watch mode)
pnpm test:watch --parallel
```

### Selective Execution

```bash
# Run only what changed (Git)
turbo run test --filter=[HEAD^1]

# Run specific workspace
pnpm --filter @envguard/cli test
```

---

## Troubleshooting

### Common Issues

**Build failures:**

```bash
# Clear cache and retry
pnpm clean && pnpm build
```

**Test failures:**

```bash
# Run tests without cache
turbo run test --force
```

**Type errors:**

```bash
# Check types in watch mode
pnpm typecheck:watch
```

**Git hooks not working:**

```bash
# Reinitialize Husky
rm -rf .husky && pnpm prepare
```

---

## Best Practices

### Development Workflow

1. **Start with**: `pnpm dev`
2. **Before commit**: `pnpm validate:quick`
3. **Before push**: `pnpm validate`
4. **CI will run**: `pnpm ci`

### Writing Scripts

- Use `turbo run` for cacheable tasks
- Use `pnpm -r` for simple parallel execution
- Add `--stream` for real-time output
- Use `--filter` for targeted execution

### Naming Conventions

- `dev`: Development mode
- `build`: Production build
- `test`: Run tests
- `check:*`: Validation without side effects
- `clean:*`: Cleanup operations
- `ci:*`: CI-specific commands

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Vitest Documentation](https://vitest.dev/)
- [Changesets](https://github.com/changesets/changesets)
