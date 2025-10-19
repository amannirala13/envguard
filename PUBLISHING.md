# Publishing Guide for EnvGuard Monorepo

This guide explains how to publish packages from this monorepo to npm and GitHub Packages.

## Overview

This monorepo contains two packages:

- `@envguard/cli` - Main CLI tool
- `@envguard/runner-node` - Node.js runtime library

## Prerequisites

### 1. npm Account and Token

1. Create an account at [npmjs.com](https://www.npmjs.com/)
2. Generate an access token:
   - Go to Account Settings → Access Tokens
   - Click "Generate New Token" → "Classic Token"
   - Select "Automation" type
   - Copy the token

3. Add to GitHub repository secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

### 2. GitHub Packages (Optional)

GitHub Packages publishing is automatically configured but optional. It uses the built-in `GITHUB_TOKEN` which is automatically available in GitHub Actions.

## Publishing Methods

### Method 1: Automated Publishing via GitHub Release (Recommended)

This is the **recommended** approach as it links GitHub releases with npm packages.

#### Steps:

1. **Bump Version** (choose one):

   **Option A: Using GitHub Actions (UI)**
   - Go to Actions → Version Bump
   - Click "Run workflow"
   - Select package (`cli`, `runner-node`, or `both`)
   - Select version bump type (`patch`, `minor`, or `major`)
   - Click "Run workflow"
   - This will commit the version bump and create a git tag

   **Option B: Manual**

   ```bash
   # Bump CLI version
   cd packages/cli
   pnpm version patch  # or minor, or major

   # Bump runner-node version
   cd packages/runner-node
   pnpm version patch  # or minor, or major

   # Commit and tag
   git add .
   git commit -m "chore: bump version to X.Y.Z"
   git tag "vX.Y.Z"
   git push && git push --tags
   ```

2. **Create GitHub Release**
   - Go to your GitHub repo → Releases
   - Click "Draft a new release"
   - Choose the tag you created (e.g., `v0.1.4`)
   - Title: `EnvGuard CLI v0.1.4` (or appropriate package name)
   - Description: Add release notes (see template below)
   - Click "Publish release"

3. **Automatic Publishing**
   - Publishing workflow triggers automatically
   - Publishes to npm registry
   - Also publishes to GitHub Packages (optional)
   - Check Actions tab for progress

#### Release Notes Template

```markdown
## 🎉 What's New

- Feature: Added interactive edit command with rename support
- Feature: Added show command for viewing secrets with masking
- Feature: Added copy command for environment cloning
- Fix: Audit trail now properly tracks all secret updates

## 📦 Packages

- `@envguard/cli@0.1.4`
- `@envguard/runner-node@0.1.0`

## 📝 Full Changelog

[Link to CHANGELOG.md or comparison view]

## 🔗 Links

- [npm: @envguard/cli](https://www.npmjs.com/package/@envguard/cli)
- [npm: @envguard/runner-node](https://www.npmjs.com/package/@envguard/runner-node)
- [Documentation](https://github.com/amannirala13/envguard#readme)
```

### Method 2: Manual Workflow Dispatch

If you want to publish without creating a release:

1. Go to Actions → Publish Packages
2. Click "Run workflow"
3. Select package to publish (`all`, `cli`, or `runner-node`)
4. Click "Run workflow"

### Method 3: Local Manual Publishing

For quick testing or emergency fixes:

```bash
# Build all packages
pnpm build

# Publish CLI
cd packages/cli
pnpm publish --access public

# Publish runner-node
cd packages/runner-node
pnpm publish --access public
```

## Versioning Strategy

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Independent Versioning

Each package has its own version:

- `@envguard/cli` - Currently at `0.1.3`
- `@envguard/runner-node` - Currently at `0.1.0`

They can be versioned independently based on changes.

### Version Bump Guidelines

**CLI Package:**

- New commands → `minor`
- Bug fixes → `patch`
- Breaking CLI changes → `major`

**Runner-Node Package:**

- New API features → `minor`
- Bug fixes → `patch`
- Breaking API changes → `major`

## Package Distribution

### npm Registry (Primary)

Packages are published to [npmjs.com](https://www.npmjs.com/):

- [@envguard/cli](https://www.npmjs.com/package/@envguard/cli)
- [@envguard/runner-node](https://www.npmjs.com/package/@envguard/runner-node)

**Installation:**

```bash
npm install -g @envguard/cli
npm install @envguard/runner-node
```

### GitHub Packages (Optional Mirror)

Packages are also mirrored to GitHub Packages:

- `https://npm.pkg.github.com/@envguard/cli`
- `https://npm.pkg.github.com/@envguard/runner-node`

**Installation from GitHub Packages:**

1. Create `.npmrc` in your project:

   ```
   @envguard:registry=https://npm.pkg.github.com
   ```

2. Install:
   ```bash
   npm install -g @envguard/cli
   ```

## Linking GitHub Releases to npm

The workflow automatically creates this link:

1. **Git Tag** (`v0.1.4`) → Links commit to release
2. **GitHub Release** → Creates release page with notes
3. **npm Publish** → Publishes package with same version
4. **Release Assets** → Can attach binaries/artifacts

Users can see:

- GitHub Release page shows the exact code version
- npm package page links back to GitHub repo
- Both show the same version number

## Troubleshooting

### Publishing Fails

**Error: "You cannot publish over the previously published versions"**

- Version already exists on npm
- Bump the version and try again

**Error: "Authentication failed"**

- Check `NPM_TOKEN` secret is set correctly
- Verify token hasn't expired

**Error: "EPERM: operation not permitted"**

- Check package access is set to `public`
- Verify you have permissions to publish to `@envguard` scope

### Build Fails

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
pnpm test
```

### Rollback a Release

```bash
# Unpublish within 72 hours (npm policy)
npm unpublish @envguard/cli@X.Y.Z

# Or deprecate (recommended)
npm deprecate @envguard/cli@X.Y.Z "Reason for deprecation"
```

## Pre-Release Checklist

Before publishing:

- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md updated if needed
- [ ] Git committed and tagged
- [ ] Release notes prepared

## Post-Release Checklist

After publishing:

- [ ] Verify packages on npm
- [ ] Test installation: `npx @envguard/cli@latest status`
- [ ] Update documentation links
- [ ] Announce on social media/Discord/etc.
- [ ] Monitor for issues

## Useful Commands

```bash
# Check what will be published
pnpm --filter @envguard/cli pack --dry-run
pnpm --filter @envguard/runner-node pack --dry-run

# View package contents
npm pack
tar -xvzf *.tgz
rm -rf package *.tgz

# Check package info
npm view @envguard/cli
npm view @envguard/runner-node

# List all versions
npm view @envguard/cli versions
npm view @envguard/runner-node versions
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [GitHub Packages npm Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions npm Publishing](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
