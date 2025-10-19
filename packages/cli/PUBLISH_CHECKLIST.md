# Pre-Publishing Checklist

Use this checklist before publishing @envguard/cli to npm.

## ✅ Code Quality

- [ ] All tests pass: `pnpm test`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## ✅ Documentation

- [ ] README.md is complete and accurate
- [ ] All examples in README work
- [ ] API documentation is up to date
- [ ] CHANGELOG.md is updated (if exists)
- [ ] Comments and JSDoc are current

## ✅ Package Configuration

- [ ] `package.json` version is bumped
- [ ] `package.json` metadata is correct:
  - [ ] name: `@envguard/cli`
  - [ ] description is accurate
  - [ ] keywords are relevant
  - [ ] author information is correct
  - [ ] repository URL is correct
  - [ ] license is MIT
  - [ ] homepage URL is correct
- [ ] `files` array includes: `dist`, `README.md`, `LICENSE`
- [ ] `bin` points to `./dist/cli.js`
- [ ] `main` points to `./dist/index.js`
- [ ] `types` points to `./dist/index.d.ts`
- [ ] `publishConfig.access` is set to `"public"`

## ✅ Build Artifacts

- [ ] `dist/` directory exists
- [ ] `dist/cli.js` has shebang: `#!/usr/bin/env node`
- [ ] `dist/cli.js` is executable
- [ ] `dist/index.js` exists
- [ ] Type definitions exist: `dist/index.d.ts`

## ✅ Files Included

- [ ] LICENSE file exists (not symlink)
- [ ] README.md exists
- [ ] dist/ directory is built
- [ ] No source files (src/) are included
- [ ] No test files are included
- [ ] No .git directory is included

Verify with: `npm pack --dry-run`

## ✅ Git

- [ ] All changes are committed
- [ ] Working directory is clean
- [ ] You're on the correct branch (usually `main`)
- [ ] Branch is up to date with remote

```bash
git status  # Should show "working tree clean"
```

## ✅ npm Account

- [ ] You're logged in to npm: `npm whoami`
- [ ] You have publishing rights (for scoped packages)
- [ ] Two-factor authentication is set up (recommended)

## ✅ Testing

- [ ] Test installation locally:
  ```bash
  npm pack
  npm install -g ./envguard-cli-*.tgz
  envg --version
  envg --help
  ```
- [ ] Binary works: `envg init`, `envg set`, `envg list`
- [ ] Clean up: `npm uninstall -g @envguard/cli`

## ✅ Pre-Publish Validation

```bash
cd packages/cli

# Run all checks
pnpm typecheck && pnpm build && pnpm pack:check

# Verify package contents
npm pack --dry-run

# Should show:
# - LICENSE
# - README.md
# - dist/cli.js
# - dist/cli.d.ts
# - dist/index.js
# - dist/index.d.ts
# - dist/*.js.map
# - package.json
```

## ✅ Version Bump

Choose the appropriate version bump:

- **Patch** (0.1.0 → 0.1.1): Bug fixes only
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

```bash
npm version patch|minor|major
```

Or manually edit `package.json`

## 🚀 Ready to Publish!

If all items are checked, you're ready to publish:

```bash
cd packages/cli
npm publish --access public
```

## Post-Publishing

After successful publish:

- [ ] Verify on npm: https://www.npmjs.com/package/@envguard/cli
- [ ] Test installation: `npm install -g @envguard/cli`
- [ ] Create Git tag: `git tag v0.1.0 && git push origin v0.1.0`
- [ ] Create GitHub release
- [ ] Update main README if needed
- [ ] Announce on social media (optional)

## Rollback (if needed)

If something went wrong within 24 hours and no one installed it:

```bash
npm unpublish @envguard/cli@<version>
```

**Note**: This is only possible if:

- Less than 24 hours since publish
- No downloads occurred
- Better to deprecate and publish a fix instead
