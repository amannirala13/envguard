# Quick Publish Guide - Both Packages

## ✅ What's Already Configured

Both packages are ready to publish:

- ✅ `@envguard/cli` - Version 0.1.3
- ✅ `@envguard/runner-node` - Version 0.1.0

## 🚀 Publishing Both Packages Together

### Method 1: Via GitHub Release (Automated - Recommended)

```bash
# 1. Bump versions for both packages
cd packages/cli
pnpm version patch  # 0.1.3 → 0.1.4

cd ../runner-node
pnpm version patch  # 0.1.0 → 0.1.1

# 2. Commit and tag
cd ../..
git add packages/*/package.json
git commit -m "chore: bump versions - cli@0.1.4, runner-node@0.1.1"
git tag "v0.1.4"
git push && git push --tags

# 3. Create GitHub Release
# Go to: https://github.com/amannirala13/envguard/releases/new
# - Choose tag: v0.1.4
# - Title: EnvGuard v0.1.4
# - Description: Release notes
# - Click "Publish release"

# 4. Both packages publish automatically! ✨
```

### Method 2: Manual Workflow Dispatch

**Go to:** https://github.com/amannirala13/envguard/actions/workflows/publish.yml

1. Click **"Run workflow"**
2. Select **"all"** to publish both packages
3. Click **"Run workflow"**

### Method 3: Publish Individually

**CLI only:**

```bash
pnpm build
cd packages/cli
pnpm publish --access public
```

**Runner-node only:**

```bash
pnpm build
cd packages/runner-node
pnpm publish --access public
```

## 📦 Package Details

### @envguard/cli

- **Current:** 0.1.3
- **Published to:** npm registry
- **Install:** `npm install -g @envguard/cli`
- **Link:** https://www.npmjs.com/package/@envguard/cli

### @envguard/runner-node

- **Current:** 0.1.0
- **Published to:** npm registry
- **Install:** `npm install @envguard/runner-node`
- **Link:** https://www.npmjs.com/package/@envguard/runner-node

## 🔄 Version Bump Workflow

**Via GitHub UI:**

1. Go to: https://github.com/amannirala13/envguard/actions/workflows/version-bump.yml
2. Click **"Run workflow"**
3. Select:
   - **Package:** `both` (or `cli` / `runner-node`)
   - **Version:** `patch` (or `minor` / `major`)
4. Click **"Run workflow"**
5. Creates commit + tag automatically

## 📋 Publishing Checklist

Before publishing:

- [ ] Tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Version bumped in both package.json files
- [ ] Changes documented in commit message
- [ ] NPM_TOKEN added to GitHub secrets

After publishing:

- [ ] Verify on npm: https://www.npmjs.com/package/@envguard/cli
- [ ] Verify on npm: https://www.npmjs.com/package/@envguard/runner-node
- [ ] Test installation: `npx @envguard/cli@latest status`
- [ ] Test runner: `npm install @envguard/runner-node@latest`

## 💡 Common Scenarios

### Scenario 1: Only CLI Changed

```bash
cd packages/cli
pnpm version patch
# Create release for CLI only
```

### Scenario 2: Only Runner Changed

```bash
cd packages/runner-node
pnpm version patch
# Use manual workflow dispatch with package=runner-node
```

### Scenario 3: Both Changed (Most Common)

```bash
# Bump both versions
cd packages/cli && pnpm version patch
cd ../runner-node && pnpm version patch

# Create single release - both publish automatically
```

## 🎯 One-Command Publish (After Setup)

```bash
# This publishes both packages to npm
pnpm build && \
  cd packages/cli && pnpm publish --access public && \
  cd ../runner-node && pnpm publish --access public
```

## 📚 Full Documentation

See detailed guides:

- **PUBLISHING.md** - Complete publishing documentation
- **GITHUB_ACTIONS_SETUP.md** - GitHub Actions setup
- **.github/workflows/publish.yml** - Automated workflow
- **.github/workflows/version-bump.yml** - Version management

## 🔗 Quick Links

- **Workflows:** https://github.com/amannirala13/envguard/actions
- **Releases:** https://github.com/amannirala13/envguard/releases
- **npm CLI:** https://www.npmjs.com/package/@envguard/cli
- **npm Runner:** https://www.npmjs.com/package/@envguard/runner-node
