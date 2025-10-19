# Publishing Guide for @envguard/cli

This guide explains how to publish the EnvGuard CLI package to npm.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at https://www.npmjs.com/signup
2. **npm Login**: You must be logged in to npm:
   ```bash
   npm login
   ```
3. **Access Rights**: For scoped packages (@envguard/cli), ensure you have access or the package is public

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass: `pnpm test`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated (if exists)
- [ ] Version number is bumped in package.json
- [ ] Git working directory is clean
- [ ] All changes are committed

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

Update version:

```bash
cd packages/cli

# Automatically bump version
npm version patch   # for bug fixes
npm version minor   # for new features
npm version major   # for breaking changes

# Or manually edit package.json
```

## Dry Run (Test Packaging)

Test what will be published without actually publishing:

```bash
cd packages/cli

# Show what files will be included
pnpm pack:check

# Create actual tarball (without publishing)
npm pack
```

This creates a `.tgz` file you can inspect.

## Publishing Steps

### Step 1: Navigate to CLI Package

```bash
cd packages/cli
```

### Step 2: Verify You're Logged In

```bash
npm whoami
```

If not logged in:

```bash
npm login
```

### Step 3: Run Pre-Publish Checks

```bash
# Type check
pnpm typecheck

# Build
pnpm build

# Verify package contents
pnpm pack:check
```

### Step 4: Publish to npm

```bash
# For first-time publish or public scoped package
npm publish --access public

# For subsequent publishes
npm publish
```

### Step 5: Verify Publication

Check that the package is available:

```bash
# View on npm
open https://www.npmjs.com/package/@envguard/cli

# Or install it globally to test
npm install -g @envguard/cli
envg --version
```

## Publishing with Tags

### Beta/Alpha Releases

For pre-release versions:

```bash
# Update version to beta (e.g., 0.2.0-beta.0)
npm version prerelease --preid=beta

# Publish with beta tag
npm publish --tag beta --access public
```

Users can install beta with:

```bash
npm install -g @envguard/cli@beta
```

### Latest Tag

The `latest` tag is automatically assigned to the most recent stable publish. To explicitly set:

```bash
npm publish --tag latest --access public
```

## Post-Publishing

After publishing:

1. **Create Git Tag**:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Create GitHub Release**:
   - Go to: https://github.com/amannirala13/envguard/releases/new
   - Select the tag you just created
   - Add release notes

3. **Announce**: Share on Twitter, Discord, etc.

4. **Monitor**: Check npm download stats and GitHub issues

## Troubleshooting

### Error: "You do not have permission to publish"

Solution: The package name might be taken, or you need access. For scoped packages, ensure you use `--access public`.

### Error: "Version already exists"

Solution: You forgot to bump the version. Update `package.json` version number.

### Error: "Package not found after publish"

Solution: Wait a few minutes. npm can take time to propagate. Clear npm cache:

```bash
npm cache clean --force
```

### Publishing Wrong Files

If you published wrong files:

1. Unpublish within 24 hours (if no one has installed it):
   ```bash
   npm unpublish @envguard/cli@<version>
   ```
2. Fix the issue
3. Bump version and republish

**Note**: npm does not allow unpublishing after 24 hours or if downloads occurred.

## Automated Publishing (Future)

For automated publishing with GitHub Actions, see the root repository's CI/CD setup using changesets:

```bash
# At monorepo root
pnpm changeset
pnpm changeset:version
pnpm ci:publish
```

## Package Visibility

Check package visibility:

```bash
npm view @envguard/cli
```

Make package public (if it was accidentally private):

```bash
npm access public @envguard/cli
```

## Useful Commands

```bash
# Check what's in your package
npm pack --dry-run

# View package info on npm
npm view @envguard/cli

# View all versions
npm view @envguard/cli versions

# Deprecate a version
npm deprecate @envguard/cli@<version> "Reason for deprecation"

# View download stats
npm info @envguard/cli
```

## Support

If you encounter issues:

- npm documentation: https://docs.npmjs.com/
- GitHub issues: https://github.com/amannirala13/envguard/issues
