# CI/CD Guide for @envguard/node

This guide explains the Continuous Integration and Continuous Deployment setup for the EnvGuard Node.js runtime package.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Local CI Simulation](#local-ci-simulation)
- [Quality Gates](#quality-gates)
- [Deployment Pipeline](#deployment-pipeline)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline ensures code quality, runs tests, and automates releases.

### Pipeline Stages

1. **Validation** - Lint, typecheck, tests
2. **Build** - Compile TypeScript, generate types
3. **Test** - Unit tests with coverage
4. **Release** - Publish to npm (manual/automated)

## GitHub Actions Workflows

### 1. Pull Request Validation

**File:** `.github/workflows/pr-validation.yml`

```yaml
name: PR Validation

on:
  pull_request:
    branches: [main]
    paths:
      - 'packages/node/**'
      - 'packages/core/**'

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm --filter @envguard/node lint

      - name: Type check
        run: pnpm --filter @envguard/node typecheck

      - name: Build
        run: pnpm --filter @envguard/node build

      - name: Test
        run: pnpm --filter @envguard/node test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/node/coverage/coverage-final.json
          flags: node-runtime
```

### 2. Main Branch CI

**File:** `.github/workflows/main-ci.yml`

```yaml
name: Main CI

on:
  push:
    branches: [main]
    paths:
      - 'packages/node/**'
      - 'packages/core/**'

jobs:
  build-and-test:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 21]

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm --filter @envguard/node build

      - name: Test
        run: pnpm --filter @envguard/node test
```

### 3. Release Workflow

**File:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g., 0.1.0)'
        required: true
      tag:
        description: 'npm tag (latest, beta, alpha)'
        required: false
        default: 'latest'

jobs:
  release:
    runs-on: ubuntu-latest

    permissions:
      contents: write
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm --filter @envguard/node build

      - name: Test
        run: pnpm --filter @envguard/node test

      - name: Publish to npm
        run: |
          cd packages/node
          pnpm publish --tag ${{ github.event.inputs.tag }} --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.event.inputs.version }}
          release_name: Release v${{ github.event.inputs.version }}
          draft: false
          prerelease: ${{ github.event.inputs.tag != 'latest' }}
```

## Local CI Simulation

Run the same checks locally before pushing:

### Quick Validation

```bash
# From package directory
pnpm validate

# This runs:
# - pnpm lint
# - pnpm typecheck
# - pnpm test
# - pnpm build
```

### Full CI Simulation

```bash
# Clean install (like CI)
rm -rf node_modules
pnpm install --frozen-lockfile

# Run all checks
pnpm lint
pnpm typecheck
pnpm build
pnpm test:coverage

# Verify build output
ls -la dist/
node -e "require('./dist/index.cjs')"
```

### Multi-Node Testing

Use `nvm` to test multiple Node versions:

```bash
# Test Node 18
nvm use 18
pnpm test

# Test Node 20
nvm use 20
pnpm test

# Test Node 21
nvm use 21
pnpm test
```

## Quality Gates

All PRs must pass these gates:

### 1. Code Quality

- ✅ ESLint passes with no errors
- ✅ Prettier formatting applied
- ✅ No TypeScript errors
- ✅ No console.log in production code

**Check:**

```bash
pnpm lint
pnpm typecheck
```

### 2. Tests

- ✅ All tests pass
- ✅ 80%+ code coverage
- ✅ No skipped tests (unless documented)

**Check:**

```bash
pnpm test:coverage
```

### 3. Build

- ✅ TypeScript compiles successfully
- ✅ All entry points build
- ✅ Type declarations generated

**Check:**

```bash
pnpm build
ls dist/
```

### 4. Compatibility

- ✅ Node 18+ supported
- ✅ Works on Linux, macOS, Windows
- ✅ ESM and CJS exports

## Deployment Pipeline

### Pre-release Checklist

Before publishing a release:

- [ ] All tests passing
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide (if breaking)

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.x) - Bug fixes, no breaking changes
- **Minor** (0.x.0) - New features, backwards compatible
- **Major** (x.0.0) - Breaking changes

### Release Process

#### 1. Automated Release (Recommended)

```bash
# From package root
cd packages/node

# Update version
pnpm version patch  # or minor, major
# This updates package.json and creates git tag

# Push changes
git push origin main --tags

# Trigger release workflow on GitHub
# Go to Actions → Release → Run workflow
```

#### 2. Manual Release

```bash
# Build and test
pnpm build
pnpm test

# Publish to npm
pnpm publish --access public

# Create git tag
git tag v0.1.0
git push origin v0.1.0
```

### Beta/Alpha Releases

For pre-releases:

```bash
# Update version
pnpm version prepatch --preid=beta
# Creates: 0.1.0-beta.0

# Publish with beta tag
pnpm publish --tag beta

# Users install with:
# npm install @envguard/node@beta
```

## Environment Variables

### Required for CI/CD

```bash
# GitHub Secrets
NPM_TOKEN=npm_xxxxxxxxxxxx          # npm publish token
GITHUB_TOKEN=ghp_xxxxxxxxxxxx       # Auto-provided by GitHub
CODECOV_TOKEN=xxxxxxxxxxxxx         # Optional: Code coverage

# Local Development (optional)
ENVGUARD_DEBUG=true                 # Enable debug logging
```

### Setting up npm token

1. Go to [npmjs.com](https://www.npmjs.com)
2. Settings → Access Tokens
3. Generate new token (Automation)
4. Add to GitHub Secrets as `NPM_TOKEN`

## Troubleshooting

### Build Fails in CI but Works Locally

**Cause:** Different Node versions or missing dependencies

**Solution:**

```bash
# Match CI Node version
nvm use 18

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install --frozen-lockfile

# Try build
pnpm build
```

### Tests Pass Locally but Fail in CI

**Cause:** Environment-specific issues or timing

**Solution:**

```bash
# Run tests without cache
pnpm test --no-cache

# Check for environment dependencies
grep -r "process.env" __tests__/

# Ensure proper cleanup
# Check beforeEach/afterEach hooks
```

### Type Errors in CI

**Cause:** Cached type declarations or version mismatch

**Solution:**

```bash
# Clear TypeScript cache
rm -rf dist tsconfig.tsbuildinfo

# Rebuild
pnpm typecheck
pnpm build
```

### Coverage Below Threshold

**Cause:** New code not tested

**Solution:**

```bash
# See what's not covered
pnpm test:coverage

# Add tests for uncovered lines
# Check coverage/index.html for details
```

### Publish Fails

**Cause:** Version already exists or auth issue

**Solution:**

```bash
# Check npm login
npm whoami

# Verify version doesn't exist
npm view @envguard/node versions

# Bump version
pnpm version patch

# Try again
pnpm publish
```

## Best Practices

### 1. Run Validation Before Push

```bash
# Add to git pre-push hook
pnpm validate || exit 1
```

### 2. Use Conventional Commits

Enables automatic changelog generation:

```bash
feat(loader): add caching support
fix(validator): handle edge case
docs(readme): update examples
```

### 3. Keep CI Fast

- Use caching (pnpm cache)
- Run tests in parallel
- Skip unnecessary jobs

### 4. Monitor CI Performance

Track build times and optimize slow steps:

```bash
# Time each step
time pnpm lint
time pnpm typecheck
time pnpm test
time pnpm build
```

### 5. Security Scanning

Add security checks:

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm CI Guide](https://pnpm.io/continuous-integration)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Need help?** Open an issue or check existing CI workflows in `.github/workflows/`
