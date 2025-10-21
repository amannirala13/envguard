# Contributing to @envguard/node

Thank you for your interest in contributing to EnvGuard Node.js runtime! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/envguard.git
   cd envguard
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/amannirala13/envguard.git
   ```

## Development Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Build the project:**

   ```bash
   pnpm --filter @envguard/node build
   ```

3. **Run tests:**

   ```bash
   pnpm --filter @envguard/node test
   ```

4. **Run tests in watch mode:**
   ```bash
   pnpm --filter @envguard/node test:watch
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Run Validation

Before committing, ensure all checks pass:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Tests
pnpm test

# Build
pnpm build

# Run all checks
pnpm validate
```

### 4. Commit Your Changes

Follow conventional commit format (see [Commit Guidelines](#commit-guidelines)):

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript Guidelines

1. **Strict Type Safety**
   - Use strict TypeScript configuration
   - No `any` types in public APIs
   - Explicit return types for functions
   - Handle all nullable cases

2. **Code Style**

   ```typescript
   // ✅ Good
   export async function loadSecrets(
     options: LoadOptions = {}
   ): Promise<LoadResult> {
     // Implementation
   }

   // ❌ Bad
   export async function loadSecrets(options?: any): Promise<any> {
     // Implementation
   }
   ```

3. **Documentation**
   - JSDoc comments for all public APIs
   - Include `@param`, `@returns`, `@throws`, `@example`
   - Clear, concise descriptions

   ````typescript
   /**
    * Load secrets from keychain into process.env
    *
    * @param options - Configuration options
    * @returns Load result with success status and loaded secrets
    * @throws {NotInitializedError} When project not initialized
    * @throws {ValidationError} When required secrets missing
    *
    * @example
    * ```typescript
    * const result = await load({ environment: 'production' });
    * console.log(result.count); // Number of secrets loaded
    * ```
    */
   export async function load(options?: LoadOptions): Promise<LoadResult> {
     // Implementation
   }
   ````

4. **Error Handling**
   - Use custom error classes
   - Provide helpful error messages
   - Include context in errors

   ```typescript
   // ✅ Good
   throw new ValidationError(
     `Missing ${missing.length} required secret(s): ${missing.join(', ')}`,
     errors
   );

   // ❌ Bad
   throw new Error('Validation failed');
   ```

5. **Imports**
   - Use named imports when possible
   - Group imports: external → internal → types
   - Use path aliases for clarity

   ```typescript
   // ✅ Good
   import { ConfigManager } from '@envguard/core';
   import { logger } from '../utils/logger';
   import type { LoadOptions } from '../types';

   // ❌ Bad
   import { ConfigManager, logger, LoadOptions } from '../..';
   ```

### File Organization

```
src/
├── types/           # Type definitions
├── config/          # Configuration & environment
├── utils/           # Utility functions
├── loader/          # Core loading logic
└── testing/         # Testing utilities
```

### Code Reuse

- **Always check `@envguard/core`** for existing functionality
- Don't duplicate code between packages
- Extract common logic to `@envguard/core`

## Testing Guidelines

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = {
        /* ... */
      };

      // Act
      const result = doSomething(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test Coverage Requirements

- **Overall:** 80%+ coverage
- **New features:** 90%+ coverage
- **Bug fixes:** Add regression test

### Test Types

1. **Unit Tests** (`__tests__/unit/`)
   - Test individual functions
   - Mock external dependencies
   - Fast execution

2. **Integration Tests** (`__tests__/integration/`)
   - Test component interactions
   - Use real dependencies where possible
   - Test happy paths and error cases

3. **Test Utilities** (`src/testing/`)
   - Provide mocks and helpers
   - Make testing easier for users

### Writing Good Tests

```typescript
// ✅ Good - Clear, specific, isolated
it('should skip existing env vars when override is false', () => {
  const secrets = { API_KEY: 'new' };
  const target = { API_KEY: 'existing' };

  const result = injectSecrets(secrets, target, false);

  expect(target.API_KEY).toBe('existing');
  expect(result.skipped).toEqual(['API_KEY']);
});

// ❌ Bad - Vague, tests multiple things
it('should work', () => {
  const result = injectSecrets({ API_KEY: 'test' });
  expect(result).toBeTruthy();
});
```

### Cleanup

Always clean up after tests:

```typescript
describe('Test Suite', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
});
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
# Feature
feat(loader): add support for multi-environment secrets

# Bug fix
fix(injector): handle undefined values in process.env

# Documentation
docs(readme): add migration guide from dotenv

# Breaking change
feat(api)!: rename config() to load()

BREAKING CHANGE: The main API method has been renamed from config() to load()
```

### Scope

Optional scope specifying what's changed:

- `loader` - Loading logic
- `validator` - Validation
- `injector` - Injection logic
- `types` - Type definitions
- `config` - Configuration
- `utils` - Utilities
- `testing` - Test utilities

## Pull Request Process

### Before Submitting

1. **Ensure all checks pass:**

   ```bash
   pnpm validate
   ```

2. **Update documentation:**
   - Update README if API changed
   - Add JSDoc comments
   - Update CHANGELOG if significant

3. **Write clear PR description:**
   - What problem does this solve?
   - What changes were made?
   - How to test it?
   - Any breaking changes?

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass (`pnpm test`)
- [ ] Types are correct (`pnpm typecheck`)
- [ ] Documentation updated
- [ ] CHANGELOG updated (if needed)
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainer(s)
3. **Address feedback** and update PR
4. **Approval** and merge

## Release Process

Releases are handled by maintainers:

1. **Version Bump:**

   ```bash
   pnpm version <major|minor|patch>
   ```

2. **Update CHANGELOG:**
   Document all changes since last release

3. **Build and Test:**

   ```bash
   pnpm build
   pnpm test
   ```

4. **Publish:**

   ```bash
   pnpm publish
   ```

5. **Git Tag:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

## Need Help?

- **Issues:** [GitHub Issues](https://github.com/amannirala13/envguard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/amannirala13/envguard/discussions)
- **Documentation:** Check existing docs in `/docs`

## Recognition

Contributors will be recognized in:

- README contributors section
- GitHub contributors page
- Release notes

Thank you for contributing! 🙏
