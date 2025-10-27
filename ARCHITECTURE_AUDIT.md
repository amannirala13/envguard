# EnvGuard Architecture Audit & Enterprise Readiness Assessment

**Date**: 2025-10-26
**Version**: Current (pre-0.3.0)
**Status**: Critical Issues Found

---

## Executive Summary

EnvGuard has **critical architectural gaps** that prevent it from being enterprise-ready:

1. ❌ **Package naming relies on package.json** (not multi-language)
2. ❌ **config.json is underutilized** (not source of truth)
3. ❌ **No CLI commands for config management**
4. ❌ **manifest.json lacks metadata** (validators, descriptions)
5. ❌ **Environment management is hardcoded** (not configurable)

---

## 🔴 Critical Issues

### 1. Package Name Resolution

**Current Implementation:**

```typescript
// packages/cli/src/commands/init.action.ts:51-58
async function detectPackageName(): Promise<string> {
  try {
    const pkgJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    return pkgJson.name || 'my-app';
  } catch {
    return 'my-app';
  }
}
```

**Problems:**

- ❌ Requires package.json (not available in Python, Go, Rust, Java projects)
- ❌ npm names are NOT unique identifiers globally
  - Example: `my-app` vs `@company/my-app` vs `other-company/my-app`
- ❌ No reverse domain notation support (like com.company.app)
- ❌ Fallback "my-app" will cause collisions in shared keychains

**Impact:**

- Cannot be used in non-Node.js projects
- Keychain collisions when multiple projects use default name
- Not suitable for enterprise mono repos

---

### 2. Config.json Underutilization

**Current Structure:**

```json
{
  "package": "my-app",
  "templateFile": ".env.template",
  "manifestVersion": "1.0",
  "defaultEnvironment": "development"
}
```

**Problems:**

- ❌ Not treated as source of truth (falls back to package.json)
- ❌ Missing critical enterprise features:
  - No list of available environments
  - No validation mode (strict/relaxed)
  - No custom manifest path
  - No config schema version
  - No documentation/warnings about manual editing
- ❌ No CLI commands to manage config (`envg config get/set`)
- ❌ Config can be corrupted with no recovery mechanism

**Impact:**

- Users manually edit config.json without validation
- No way to programmatically manage configuration
- Breaking changes can't be detected (no schema version)

---

### 3. Environment Management

**Current Implementation:**

```typescript
// Hardcoded in code, not in config
const environment =
  options.environment ||
  process.env.ENVGUARD_ENV ||
  process.env.NODE_ENV ||
  'development';
```

**Problems:**

- ❌ No centralized list of allowed environments
- ❌ Typos create new environments silently (dev vs development)
- ❌ Can't enforce environment naming conventions
- ❌ No per-project environment preferences beyond default

**Impact:**

- Secret sprawl (secrets in unintended environments)
- No environment lifecycle management
- Can't prevent accidental production secret deletion

---

### 4. Manifest Underutilization

**Current Structure:**

```json
{
  "packages": {
    "my-app": {
      "keys": [
        { "name": "API_KEY", "required": true },
        { "name": "PORT", "required": false }
      ],
      "lastUpdated": "2025-10-26T..."
    }
  }
}
```

**Problems:**

- ❌ No validator metadata (url, email, regex, length, number ranges)
- ❌ No descriptions for keys (what is this secret?)
- ❌ No environment-specific requirements
- ❌ No deprecation markers
- ❌ No secret rotation metadata (lastRotated, rotationPolicy)

**Impact:**

- Can't validate secret values before storage
- No documentation for new team members
- Can't enforce security policies (rotation schedules)

---

### 5. Missing CLI Config Commands

**Current Commands:**

```bash
envg init, set, get, del, list, check, migrate,
export, template, edit, show, copy, welcome
```

**Missing:**

```bash
envg config get <key>          # ❌ Not available
envg config set <key> <value>  # ❌ Not available
envg config list               # ❌ Not available
envg config reset              # ❌ Not available
envg config validate           # ❌ Not available
envg env list                  # ❌ Not available
envg env add <name>            # ❌ Not available
envg env remove <name>         # ❌ Not available
```

**Impact:**

- Users must manually edit config.json
- No validation on config changes
- No audit trail for config modifications

---

## ✅ What's Working Well

1. ✅ Keychain integration (macOS, Windows, Linux)
2. ✅ Multi-environment support (basic)
3. ✅ Secret migration from .env files
4. ✅ Interactive editing (`envg edit`)
5. ✅ Template generation
6. ✅ Required/optional secret marking

---

## 🎯 Enterprise Requirements

### Package Naming

- ✅ Support reverse domain notation (com.company.product)
- ✅ Support multi-language projects (no package.json dependency)
- ✅ Globally unique identifiers
- ✅ Validation on package names
- ✅ Migration path for existing projects

### Config as Source of Truth

- ✅ config.json must be authoritative
- ✅ Schema versioning for migrations
- ✅ CLI commands for all config operations
- ✅ Validation before saving
- ✅ Backup/restore functionality
- ✅ Audit logging for changes

### Environment Management

- ✅ Explicit environment definitions in config
- ✅ Environment naming conventions
- ✅ Prevent typos (staging vs stagin)
- ✅ Per-environment security policies
- ✅ Environment lifecycle (create, deprecate, archive)

### Manifest Enhancement

- ✅ Validator metadata per key
- ✅ Descriptions and documentation
- ✅ Environment-specific requirements
- ✅ Secret rotation tracking
- ✅ Deprecation warnings

### Security & Compliance

- ✅ Audit trail for all operations
- ✅ Secret rotation policies
- ✅ Access control (future: team mode)
- ✅ Compliance reporting
- ✅ Backup encryption

---

## 📐 Proposed Architecture

### Enhanced Config.json

```json
{
  "$schema": "https://envguard.dev/schemas/config/v2.json",
  "version": "2.0.0",
  "package": {
    "name": "com.company.myapp",
    "displayName": "My Application",
    "type": "reverse-domain"
  },
  "environments": {
    "allowed": ["development", "staging", "production"],
    "default": "development",
    "naming": "strict"
  },
  "paths": {
    "template": ".env.template",
    "manifest": ".envguard/manifest.json"
  },
  "validation": {
    "enabled": true,
    "strictMode": true,
    "enforceRotation": false
  },
  "security": {
    "auditLog": true,
    "requireConfirmation": ["delete", "export"],
    "allowedCommands": ["all"]
  },
  "manifest": {
    "version": "2.0.0",
    "autoSync": true
  },
  "_warnings": {
    "manualEdit": "Editing this file manually may break EnvGuard. Use 'envg config' commands instead."
  },
  "_metadata": {
    "created": "2025-10-26T00:00:00.000Z",
    "lastModified": "2025-10-26T00:00:00.000Z",
    "modifiedBy": "envg-cli@0.3.0"
  }
}
```

### Enhanced Manifest.json

```json
{
  "$schema": "https://envguard.dev/schemas/manifest/v2.json",
  "version": "2.0.0",
  "packages": {
    "com.company.myapp": {
      "keys": [
        {
          "name": "DATABASE_URL",
          "required": true,
          "description": "PostgreSQL connection string",
          "validator": {
            "type": "url",
            "schemes": ["postgresql", "postgres"],
            "requireCredentials": true
          },
          "environments": {
            "development": { "required": false },
            "production": { "required": true }
          },
          "rotation": {
            "lastRotated": "2025-10-01T00:00:00.000Z",
            "policy": "90d",
            "nextRotation": "2025-12-30T00:00:00.000Z"
          },
          "metadata": {
            "addedBy": "john@company.com",
            "addedOn": "2025-01-01T00:00:00.000Z",
            "category": "database"
          }
        },
        {
          "name": "API_KEY",
          "required": true,
          "description": "Third-party API authentication key",
          "validator": {
            "type": "regex",
            "pattern": "^[A-Za-z0-9]{32}$",
            "message": "Must be 32 alphanumeric characters"
          },
          "deprecated": {
            "since": "2025-10-01",
            "reason": "Migrating to OAuth2",
            "replacement": "OAUTH_CLIENT_ID",
            "removeAfter": "2026-01-01"
          }
        }
      ],
      "lastUpdated": "2025-10-26T00:00:00.000Z"
    }
  }
}
```

---

## 🚀 Implementation Plan

### Phase 1: Config System Overhaul (v0.3.0)

**Priority: CRITICAL**

1. **Package Naming**
   - Add `PackageNameResolver` with multiple strategies
   - Support reverse domain notation
   - Add validation (no spaces, valid chars, uniqueness check)
   - Migration: Detect existing package names and offer upgrade

2. **Config Schema v2**
   - Implement enhanced config structure
   - Add schema version field
   - Add migration system for v1 → v2
   - Add config validation on load

3. **CLI Config Commands**

   ```bash
   envg config get <key>
   envg config set <key> <value>
   envg config list
   envg config validate
   envg config backup
   envg config restore <file>
   envg config migrate
   ```

4. **Environment Management**
   ```bash
   envg env list
   envg env add <name>
   envg env remove <name>
   envg env default <name>
   envg env validate
   ```

### Phase 2: Manifest Enhancement (v0.4.0)

1. **Manifest Schema v2**
   - Add validator metadata
   - Add descriptions
   - Add rotation tracking
   - Add deprecation support

2. **Validation Engine**
   - Implement validators (url, email, regex, length, number)
   - Add validation on `envg set`
   - Add bulk validation command

3. **CLI Secret Commands Enhancement**
   ```bash
   envg set <key> <value> --validate
   envg set <key> <value> --validator=url
   envg set <key> <value> --description="My secret"
   envg check --rotation  # Check rotation policies
   ```

### Phase 3: Enterprise Features (v0.5.0)

1. **Audit Logging**
   - Log all config changes
   - Log all secret operations
   - Export audit logs

2. **Backup/Restore**
   - Encrypted backups
   - Point-in-time restore
   - Automated backup schedules

3. **Compliance**
   - Rotation enforcement
   - Expiry warnings
   - Security policy templates

---

## 🎓 Migration Strategy

### For Existing Users

**Automatic Migration:**

```bash
envg config migrate

# Steps:
# 1. Detect v1 config
# 2. Prompt for package name format (keep or convert)
# 3. Prompt for environment list
# 4. Create v2 config with defaults
# 5. Backup v1 config
# 6. Validate migration
# 7. Update manifest if needed
```

**Manual Migration:**
Users can edit config.json but will see warnings:

```bash
⚠️  WARNING: config.json was manually edited
✓ Running validation...
✓ Config is valid
ℹ Use 'envg config validate' to check configuration
```

---

## 📊 Risk Assessment

| Risk                                | Impact | Mitigation                                   |
| ----------------------------------- | ------ | -------------------------------------------- |
| Breaking changes for existing users | HIGH   | Automatic migration + backward compatibility |
| Package name collisions             | MEDIUM | Validation + uniqueness check + warnings     |
| Config corruption from manual edits | MEDIUM | Validation + backups + schema versioning     |
| Complexity increase                 | LOW    | Good docs + progressive disclosure           |

---

## 🎯 Success Metrics

- ✅ 100% of projects can define unique package names
- ✅ Zero config.json manual edits needed
- ✅ All configuration via CLI commands
- ✅ Secret validation catches 95%+ of typos
- ✅ Migration success rate >99%
- ✅ Enterprise adoption feasible

---

## 📝 Recommendations

### Immediate Actions (Do Now)

1. **Add `envg config` commands** (v0.2.1 patch)
   - Prevents users from manually editing config
   - Quick win, low complexity

2. **Add package name validation** (v0.2.1 patch)
   - Warn on non-unique names
   - Suggest reverse domain notation

3. **Add environment list to config** (v0.2.1 patch)
   - `environments.allowed` field
   - Validation on use

### Short-term (v0.3.0)

4. **Implement full config v2 schema**
5. **Add migration system**
6. **Update all docs**

### Long-term (v0.4.0+)

7. **Manifest v2 with validators**
8. **Audit logging**
9. **Enterprise features**

---

## 🔗 Related Issues

- Race condition in auto-load (see previous audit)
- Package name uniqueness
- Multi-language support
- Enterprise readiness

---

**Next Steps**: Review this audit and decide on implementation priority.
