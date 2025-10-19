# GitHub Actions Setup Guide

Quick guide to set up automated publishing for EnvGuard monorepo.

## 🚀 Quick Start (5 minutes)

### Step 1: Create npm Token

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click your profile → Access Tokens
3. Click "Generate New Token" → "Classic Token"
4. Select **"Automation"** type
5. Copy the token (starts with `npm_`)

### Step 2: Add Token to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name**: `NPM_TOKEN`
5. **Value**: Paste your npm token
6. Click **"Add secret"**

### Step 3: Commit and Push Workflows

```bash
# Add all new files
git add .github/workflows/
git add PUBLISHING.md GITHUB_ACTIONS_SETUP.md .npmrc.example
git commit -m "feat: add automated publishing workflows"
git push
```

### Step 4: Test the Setup

**Option A: Automated (via GitHub Release)**

1. Bump version:

   ```bash
   cd packages/cli
   pnpm version patch
   git add package.json
   git commit -m "chore: bump version to 0.1.4"
   git tag "v0.1.4"
   git push && git push --tags
   ```

2. Create GitHub Release:
   - Go to repository → **Releases** → **Draft a new release**
   - Choose tag: `v0.1.4`
   - Title: `EnvGuard CLI v0.1.4`
   - Description: "Test release"
   - Click **Publish release**

3. Check Actions tab - publish workflow should run automatically!

**Option B: Manual Test**

1. Go to **Actions** → **Publish Packages**
2. Click **"Run workflow"**
3. Select package: `cli`
4. Click **"Run workflow"**
5. Monitor the run for any errors

## 📋 What Gets Published

When you create a GitHub Release:

1. ✅ Workflow triggers automatically
2. ✅ Builds all packages
3. ✅ Runs tests
4. ✅ Publishes to npm registry
5. ✅ Optionally publishes to GitHub Packages

## 🔧 Workflows Explained

### 1. `publish.yml` - Automated Publishing

**Triggers:**

- On GitHub Release (automatic)
- Manual workflow dispatch

**What it does:**

- Installs dependencies
- Builds packages
- Runs tests
- Publishes to npm
- Optionally publishes to GitHub Packages

### 2. `version-bump.yml` - Version Management

**Triggers:**

- Manual workflow dispatch only

**What it does:**

- Bumps package version(s)
- Commits the change
- Creates a git tag
- Pushes to repository

## 🎯 Recommended Workflow

For regular releases:

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Use GitHub Actions to bump version
# Go to Actions → Version Bump → Run workflow
# Select: package=cli, version=patch

# 3. Create GitHub Release (this auto-publishes to npm)
# Go to Releases → Draft new release → Choose tag → Publish
```

For hotfixes:

```bash
# Manual publish
pnpm build
cd packages/cli
pnpm publish --access public
```

## ✅ Verification Checklist

After publishing, verify:

- [ ] Package appears on [npmjs.com](https://www.npmjs.com/package/@envguard/cli)
- [ ] Version number matches
- [ ] Installation works: `npx @envguard/cli@latest status`
- [ ] GitHub Release shows in Releases tab
- [ ] GitHub Actions workflow succeeded (green checkmark)

## 🐛 Troubleshooting

### "NPM_TOKEN secret not found"

→ Go to Settings → Secrets → Add `NPM_TOKEN`

### "You cannot publish over existing version"

→ Bump the version number first

### "EPERM: operation not permitted"

→ Check `publishConfig.access` is set to `"public"`

### "Authentication failed"

→ Regenerate npm token and update secret

## 📚 Resources

- Full guide: See [PUBLISHING.md](./PUBLISHING.md)
- [GitHub Packages docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [npm publish docs](https://docs.npmjs.com/cli/v9/commands/npm-publish)

## 🔐 Security Notes

- ✅ `NPM_TOKEN` is a secret - never commit it
- ✅ `GITHUB_TOKEN` is auto-provided by GitHub Actions
- ✅ Tokens are only accessible in Actions, not in repo code
- ✅ Use "Automation" token type for CI/CD (not "Publish")

## 🎉 You're Ready!

Your monorepo is now configured for automated publishing. Every GitHub Release will automatically publish to npm!
