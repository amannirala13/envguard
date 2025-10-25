# EnvGuard v0.3.0 Implementation Specification

**Epic**: Enterprise-Ready Configuration System
**Target Version**: 0.3.0
**Status**: Planning

---

## Table of Contents

1. [Package Name Resolution](#1-package-name-resolution)
2. [Config Schema v2](#2-config-schema-v2)
3. [CLI Config Commands](#3-cli-config-commands)
4. [Environment Management](#4-environment-management)
5. [Manifest Enhancements](#5-manifest-enhancements)
6. [Migration System](#6-migration-system)
7. [Testing Strategy](#7-testing-strategy)

---

## 1. Package Name Resolution

### 1.1 PackageNameResolver

**File**: `packages/core/src/config/package-name-resolver.ts`

```typescript
export enum PackageNameStrategy {
  AUTO = 'auto', // Try all strategies in order
  REVERSE_DOMAIN = 'reverse-domain', // com.company.app
  NPM = 'npm', // @scope/name or name
  MANUAL = 'manual', // User-provided
}

export interface IPackageNameOptions {
  strategy?: PackageNameStrategy;
  projectRoot?: string;
  fallback?: string;
}

export class PackageNameResolver {
  /**
   * Resolve package name using specified strategy
   */
  static async resolve(options: IPackageNameOptions): Promise<string> {
    const strategy = options.strategy || PackageNameStrategy.AUTO;

    switch (strategy) {
      case PackageNameStrategy.REVERSE_DOMAIN:
        return await this.resolveReverseDomain(options);

      case PackageNameStrategy.NPM:
        return await this.resolveFromNpm(options);

      case PackageNameStrategy.AUTO:
        // Try reverse domain first, then npm, then fallback
        return await this.resolveAuto(options);

      case PackageNameStrategy.MANUAL:
        return this.validateAndReturn(options.fallback);

      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Validate package name format
   */
  static validate(name: string): { valid: boolean; error?: string } {
    // No spaces
    if (/\s/.test(name)) {
      return { valid: false, error: 'Package name cannot contain spaces' };
    }

    // Valid characters
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      return { valid: false, error: 'Invalid characters in package name' };
    }

    // Not empty
    if (name.trim().length === 0) {
      return { valid: false, error: 'Package name cannot be empty' };
    }

    // Recommended: reverse domain notation
    if (!/^[a-z]+\.[a-z]+(\.[a-z0-9-]+)*$/i.test(name)) {
      return {
        valid: true,
        error:
          'WARNING: Consider using reverse domain notation (e.g., com.company.app)',
      };
    }

    return { valid: true };
  }

  /**
   * Suggest package name from project context
   */
  static async suggest(projectRoot: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Try to detect from various sources
    const npmName = await this.detectNpmName(projectRoot);
    if (npmName) {
      suggestions.push(this.npmToReverseDomain(npmName));
      suggestions.push(npmName);
    }

    const gitRemote = await this.detectGitRemote(projectRoot);
    if (gitRemote) {
      suggestions.push(this.gitToReverseDomain(gitRemote));
    }

    const dirName = await this.detectDirectoryName(projectRoot);
    if (dirName) {
      suggestions.push(`local.${dirName}`);
    }

    return suggestions;
  }

  private static async resolveFromNpm(
    options: IPackageNameOptions
  ): Promise<string> {
    const projectRoot = options.projectRoot || process.cwd();
    const pkgJsonPath = path.join(projectRoot, 'package.json');

    try {
      const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
      return pkgJson.name || options.fallback || 'my-app';
    } catch {
      return options.fallback || 'my-app';
    }
  }

  private static async resolveReverseDomain(
    options: IPackageNameOptions
  ): Promise<string> {
    // Check if existing config has reverse domain
    const configManager = new ConfigManager(options.projectRoot);
    const config = await configManager.load();

    if (config) {
      const existing = config.getPackage();
      if (this.isReverseDomain(existing)) {
        return existing;
      }
    }

    // No existing reverse domain, return fallback
    return (
      options.fallback ||
      this.npmToReverseDomain(
        await this.detectNpmName(options.projectRoot || process.cwd())
      )
    );
  }

  private static isReverseDomain(name: string): boolean {
    return /^[a-z]+\.[a-z]+(\.[a-z0-9-]+)*$/i.test(name);
  }

  private static npmToReverseDomain(npmName: string): string {
    // @envguard/node → dev.envguard.node
    // my-app → local.my-app

    if (npmName.startsWith('@')) {
      const parts = npmName.slice(1).split('/');
      return `dev.${parts.join('.')}`;
    }

    return `local.${npmName}`;
  }

  // ... additional helper methods
}
```

### 1.2 Update Init Command

**File**: `packages/cli/src/commands/init.action.ts`

```typescript
export async function initAction(options: InitOptions): Promise<void> {
  // ... existing code ...

  // 2. Determine package name
  let packageName: string;

  if (options.package) {
    // Validate provided package name
    const validation = PackageNameResolver.validate(options.package);
    if (!validation.valid) {
      error(validation.error || 'Invalid package name');
      process.exit(1);
    }
    if (validation.error) {
      warn(validation.error); // Show warning for non-reverse-domain
    }
    packageName = options.package;
  } else {
    // Interactive package name selection
    const suggestions = await PackageNameResolver.suggest(process.cwd());

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageName',
        message: 'Select package identifier:',
        choices: [
          ...suggestions.map((s) => ({ name: s, value: s })),
          { name: 'Enter custom name', value: '__custom__' },
        ],
      },
    ]);

    if (answer.packageName === '__custom__') {
      const customAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: 'Enter package name (e.g., com.company.app):',
          validate: (input: string) => {
            const validation = PackageNameResolver.validate(input);
            return validation.valid || validation.error || false;
          },
        },
      ]);
      packageName = customAnswer.customName;
    } else {
      packageName = answer.packageName;
    }
  }

  // ... rest of init logic ...
}
```

---

## 2. Config Schema v2

### 2.1 Enhanced Config Interface

**File**: `packages/core/src/config/config.ts`

```typescript
export interface IPackageConfig {
  name: string;
  displayName?: string;
  type: 'reverse-domain' | 'npm' | 'manual';
}

export interface IEnvironmentConfig {
  allowed: string[];
  default: string;
  naming: 'strict' | 'relaxed';
}

export interface IPathsConfig {
  template: string;
  manifest: string;
}

export interface IValidationConfig {
  enabled: boolean;
  strictMode: boolean;
  enforceRotation: boolean;
}

export interface ISecurityConfig {
  auditLog: boolean;
  requireConfirmation: ('delete' | 'export' | 'migrate')[];
  allowedCommands: string[] | 'all';
}

export interface IManifestConfig {
  version: string;
  autoSync: boolean;
}

export interface IConfigMetadata {
  created: string;
  lastModified: string;
  modifiedBy: string;
}

export interface IEnvGuardConfigV2 {
  $schema: string;
  version: '2.0.0';
  package: IPackageConfig;
  environments: IEnvironmentConfig;
  paths: IPathsConfig;
  validation: IValidationConfig;
  security: ISecurityConfig;
  manifest: IManifestConfig;
  _warnings?: Record<string, string>;
  _metadata?: IConfigMetadata;
}

export class EnvGuardConfigV2 implements IEnvGuardConfigV2 {
  $schema = 'https://envguard.dev/schemas/config/v2.json';
  version = '2.0.0' as const;
  package: IPackageConfig;
  environments: IEnvironmentConfig;
  paths: IPathsConfig;
  validation: IValidationConfig;
  security: ISecurityConfig;
  manifest: IManifestConfig;
  _warnings?: Record<string, string>;
  _metadata?: IConfigMetadata;

  constructor(data: IEnvGuardConfigV2) {
    this.package = data.package;
    this.environments = data.environments;
    this.paths = data.paths;
    this.validation = data.validation;
    this.security = data.security;
    this.manifest = data.manifest;
    this._warnings = data._warnings;
    this._metadata = data._metadata;
  }

  // ... accessor methods ...

  static createDefault(packageName: string): EnvGuardConfigV2 {
    return new EnvGuardConfigV2({
      $schema: 'https://envguard.dev/schemas/config/v2.json',
      version: '2.0.0',
      package: {
        name: packageName,
        type: PackageNameResolver.isReverseDomain(packageName)
          ? 'reverse-domain'
          : 'manual',
      },
      environments: {
        allowed: ['development', 'staging', 'production'],
        default: 'development',
        naming: 'strict',
      },
      paths: {
        template: '.env.template',
        manifest: '.envguard/manifest.json',
      },
      validation: {
        enabled: true,
        strictMode: false,
        enforceRotation: false,
      },
      security: {
        auditLog: false,
        requireConfirmation: ['delete', 'export'],
        allowedCommands: 'all',
      },
      manifest: {
        version: '2.0.0',
        autoSync: true,
      },
      _warnings: {
        manualEdit:
          "Editing this file manually may break EnvGuard. Use 'envg config' commands instead.",
      },
      _metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: `envg-cli@${require('../../package.json').version}`,
      },
    });
  }
}
```

### 2.2 Config Migration

**File**: `packages/core/src/config/config-migrator.ts`

```typescript
export class ConfigMigrator {
  /**
   * Migrate from v1 to v2
   */
  static async migrateV1ToV2(
    v1Config: EnvGuardConfig
  ): Promise<EnvGuardConfigV2> {
    const packageName = v1Config.getPackage();

    // Create v2 config with defaults
    const v2Config = EnvGuardConfigV2.createDefault(packageName);

    // Migrate existing fields
    v2Config.environments.default = v1Config.getDefaultEnvironment();
    v2Config.paths.template = v1Config.getTemplateFile();

    // Save backup of v1
    await this.backupV1Config(v1Config);

    return v2Config;
  }

  /**
   * Detect config version
   */
  static async detectVersion(configPath: string): Promise<'v1' | 'v2' | null> {
    try {
      const raw = JSON.parse(await fs.readFile(configPath, 'utf-8'));

      if (raw.version === '2.0.0') return 'v2';
      if (raw.package && typeof raw.package === 'string') return 'v1';

      return null;
    } catch {
      return null;
    }
  }

  private static async backupV1Config(v1Config: EnvGuardConfig): Promise<void> {
    const backupPath = '.envguard/config.v1.backup.json';
    await fs.writeFile(
      backupPath,
      JSON.stringify(v1Config.toObject(), null, 2)
    );
  }
}
```

---

## 3. CLI Config Commands

### 3.1 Config Command Structure

**File**: `packages/cli/src/commands/config.action.ts`

```typescript
export interface ConfigGetOptions {
  verbose?: boolean;
}

export interface ConfigSetOptions {
  verbose?: boolean;
  validate?: boolean;
}

export interface ConfigListOptions {
  verbose?: boolean;
  format?: 'json' | 'yaml' | 'table';
}

/**
 * Get config value
 */
export async function configGetAction(
  key: string,
  options: ConfigGetOptions
): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized. Run "envg init" first.');
    process.exit(1);
  }

  // Support dot notation: package.name, environments.default
  const value = getNestedValue(config.toObject(), key);

  if (value === undefined) {
    error(`Config key not found: ${key}`);
    process.exit(1);
  }

  console.log(value);
}

/**
 * Set config value
 */
export async function configSetAction(
  key: string,
  value: string,
  options: ConfigSetOptions
): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized. Run "envg init" first.');
    process.exit(1);
  }

  // Validate key is mutable
  const immutableKeys = ['version', '$schema'];
  if (immutableKeys.includes(key)) {
    error(`Cannot modify immutable key: ${key}`);
    process.exit(1);
  }

  // Set value using dot notation
  const updated = setNestedValue(config.toObject(), key, parseValue(value));

  // Validate updated config
  if (options.validate) {
    const validation = ConfigValidator.validate(updated);
    if (!validation.valid) {
      error('Validation failed:');
      validation.errors.forEach((err) => error(`  - ${err}`));
      process.exit(1);
    }
  }

  // Save
  await configManager.save(new EnvGuardConfigV2(updated));
  success(`✓ Config updated: ${key} = ${value}`);
}

/**
 * List all config values
 */
export async function configListAction(
  options: ConfigListOptions
): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized. Run "envg init" first.');
    process.exit(1);
  }

  const configObj = config.toObject();

  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(configObj, null, 2));
      break;

    case 'yaml':
      console.log(yaml.stringify(configObj));
      break;

    case 'table':
    default:
      displayConfigTable(configObj);
      break;
  }
}

/**
 * Validate config
 */
export async function configValidateAction(): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized. Run "envg init" first.');
    process.exit(1);
  }

  const validation = ConfigValidator.validate(config.toObject());

  if (validation.valid) {
    success('✓ Config is valid');
  } else {
    error('✗ Config validation failed:');
    validation.errors.forEach((err) => error(`  - ${err}`));
    process.exit(1);
  }
}

/**
 * Backup config
 */
export async function configBackupAction(): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized. Run "envg init" first.');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `.envguard/backups/config.${timestamp}.json`;

  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.writeFile(backupPath, JSON.stringify(config.toObject(), null, 2));

  success(`✓ Config backed up to: ${backupPath}`);
}

/**
 * Restore config from backup
 */
export async function configRestoreAction(backupFile: string): Promise<void> {
  const configManager = new ConfigManager();

  // Load backup
  const backup = JSON.parse(await fs.readFile(backupFile, 'utf-8'));

  // Validate backup
  const validation = ConfigValidator.validate(backup);
  if (!validation.valid) {
    error('Invalid backup file:');
    validation.errors.forEach((err) => error(`  - ${err}`));
    process.exit(1);
  }

  // Confirm with user
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'This will overwrite the current config. Continue?',
      default: false,
    },
  ]);

  if (!answer.confirm) {
    info('Restore cancelled');
    return;
  }

  // Restore
  await configManager.save(new EnvGuardConfigV2(backup));
  success('✓ Config restored from backup');
}

/**
 * Migrate config
 */
export async function configMigrateAction(): Promise<void> {
  const configManager = new ConfigManager();
  const version = await ConfigMigrator.detectVersion(
    configManager.getConfigPath()
  );

  if (version === 'v2') {
    info('Config is already v2. No migration needed.');
    return;
  }

  if (version === 'v1') {
    const v1Config = await configManager.load();
    const v2Config = await ConfigMigrator.migrateV1ToV2(v1Config!);

    await configManager.save(v2Config);
    success('✓ Config migrated to v2');
    info('  Backup saved to: .envguard/config.v1.backup.json');
    return;
  }

  error('Could not detect config version');
  process.exit(1);
}
```

### 3.2 Register Config Commands

**File**: `packages/cli/src/cli.ts`

```typescript
// Add config commands
program
  .command('config <subcommand>')
  .description('Manage EnvGuard configuration')
  .addCommand(
    new Command('get')
      .argument('<key>', 'Config key (supports dot notation)')
      .option('-v, --verbose', 'Verbose output')
      .action(configGetAction)
  )
  .addCommand(
    new Command('set')
      .argument('<key>', 'Config key')
      .argument('<value>', 'Config value')
      .option('-v, --verbose', 'Verbose output')
      .option('--validate', 'Validate config after update')
      .action(configSetAction)
  )
  .addCommand(
    new Command('list')
      .option('-v, --verbose', 'Verbose output')
      .option(
        '-f, --format <format>',
        'Output format (json|yaml|table)',
        'table'
      )
      .action(configListAction)
  )
  .addCommand(
    new Command('validate')
      .description('Validate configuration')
      .action(configValidateAction)
  )
  .addCommand(
    new Command('backup')
      .description('Backup current configuration')
      .action(configBackupAction)
  )
  .addCommand(
    new Command('restore')
      .argument('<file>', 'Backup file path')
      .description('Restore configuration from backup')
      .action(configRestoreAction)
  )
  .addCommand(
    new Command('migrate')
      .description('Migrate config to latest version')
      .action(configMigrateAction)
  );
```

---

## 4. Environment Management

### 4.1 Environment Commands

**File**: `packages/cli/src/commands/env.action.ts`

```typescript
/**
 * List all configured environments
 */
export async function envListAction(): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized');
    process.exit(1);
  }

  const envs = config.environments.allowed;
  const defaultEnv = config.environments.default;

  console.log('Configured environments:');
  envs.forEach((env) => {
    const isDefault = env === defaultEnv;
    console.log(
      `  ${isDefault ? '●' : '○'} ${env}${isDefault ? ' (default)' : ''}`
    );
  });
}

/**
 * Add new environment
 */
export async function envAddAction(name: string): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized');
    process.exit(1);
  }

  // Validate environment name
  if (!/^[a-z0-9-]+$/i.test(name)) {
    error(
      'Invalid environment name. Use lowercase letters, numbers, and hyphens.'
    );
    process.exit(1);
  }

  // Check if already exists
  if (config.environments.allowed.includes(name)) {
    warn(`Environment "${name}" already exists`);
    return;
  }

  // Add environment
  config.environments.allowed.push(name);
  await configManager.save(config);

  success(`✓ Added environment: ${name}`);
}

/**
 * Remove environment
 */
export async function envRemoveAction(
  name: string,
  options: { force?: boolean }
): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized');
    process.exit(1);
  }

  // Cannot remove default environment
  if (name === config.environments.default) {
    error(
      `Cannot remove default environment "${name}". Set a different default first.`
    );
    process.exit(1);
  }

  // Check if environment exists
  if (!config.environments.allowed.includes(name)) {
    error(`Environment "${name}" not found`);
    process.exit(1);
  }

  // Check if environment has secrets
  const manifestManager = new ManifestManager();
  const keys = await manifestManager.listKeys(config.package.name);

  // Check if any secrets exist for this environment
  const hasSecrets = await this.checkEnvironmentHasSecrets(
    config.package.name,
    name,
    keys
  );

  if (hasSecrets && !options.force) {
    error(`Environment "${name}" has secrets. Use --force to remove anyway.`);
    info('Warning: This will NOT delete the secrets from the keychain.');
    process.exit(1);
  }

  // Remove environment
  config.environments.allowed = config.environments.allowed.filter(
    (e) => e !== name
  );
  await configManager.save(config);

  success(`✓ Removed environment: ${name}`);
  if (hasSecrets) {
    warn('  Note: Secrets for this environment are still in the keychain.');
    info('  Use "envg del <key> --env ' + name + '" to delete them.');
  }
}

/**
 * Set default environment
 */
export async function envDefaultAction(name: string): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized');
    process.exit(1);
  }

  // Check if environment exists
  if (!config.environments.allowed.includes(name)) {
    error(`Environment "${name}" not found`);
    info('Available environments: ' + config.environments.allowed.join(', '));
    process.exit(1);
  }

  // Set default
  config.environments.default = name;
  await configManager.save(config);

  success(`✓ Default environment set to: ${name}`);
}

/**
 * Validate environment name against config
 */
export async function envValidateAction(name: string): Promise<void> {
  const configManager = new ConfigManager();
  const config = await configManager.load();

  if (!config) {
    error('EnvGuard not initialized');
    process.exit(1);
  }

  if (config.environments.naming === 'strict') {
    if (!config.environments.allowed.includes(name)) {
      error(`✗ Invalid environment: "${name}"`);
      info('Allowed environments: ' + config.environments.allowed.join(', '));
      process.exit(1);
    }
  }

  success(`✓ Valid environment: ${name}`);
}
```

---

## 5. Manifest Enhancements

**File**: `packages/core/src/manifest/manifest.ts` (v2)

```typescript
export interface IKeyValidator {
  type: 'url' | 'email' | 'regex' | 'length' | 'number';
  pattern?: string;
  message?: string;
  schemes?: string[]; // For URL validator
  requireCredentials?: boolean; // For URL validator
  minLength?: number; // For length validator
  maxLength?: number; // For length validator
  min?: number; // For number validator
  max?: number; // For number validator
}

export interface IEnvironmentRequirement {
  required?: boolean;
}

export interface IKeyRotation {
  lastRotated: string;
  policy: string; // e.g., "90d", "6m", "1y"
  nextRotation: string;
}

export interface IKeyDeprecation {
  since: string;
  reason: string;
  replacement?: string;
  removeAfter: string;
}

export interface IKeyMetadata {
  addedBy?: string;
  addedOn?: string;
  category?: string;
}

export interface IKeyMetadataV2 {
  name: string;
  required: boolean;
  description?: string;
  validator?: IKeyValidator;
  environments?: Record<string, IEnvironmentRequirement>;
  rotation?: IKeyRotation;
  deprecated?: IKeyDeprecation;
  metadata?: IKeyMetadata;
}

export interface IManifestV2 {
  $schema: string;
  version: '2.0.0';
  packages: Record<string, IPackageEntry>;
}
```

---

## 6. Migration System

### 6.1 Automatic Migration on Commands

All commands should detect and auto-migrate:

```typescript
export abstract class BaseAction {
  protected async ensureConfigV2(): Promise<EnvGuardConfigV2> {
    const configManager = new ConfigManager();
    const version = await ConfigMigrator.detectVersion(
      configManager.getConfigPath()
    );

    if (version === 'v1') {
      info('Migrating config to v2...');
      const v1Config = await configManager.load();
      const v2Config = await ConfigMigrator.migrateV1ToV2(v1Config!);
      await configManager.save(v2Config);
      success('✓ Config migrated');
      return v2Config;
    }

    return (await configManager.load()) as EnvGuardConfigV2;
  }
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
describe('PackageNameResolver', () => {
  it('should validate reverse domain notation', () => {
    expect(PackageNameResolver.validate('com.company.app').valid).toBe(true);
    expect(PackageNameResolver.validate('my app').valid).toBe(false);
  });

  it('should suggest package names', async () => {
    const suggestions = await PackageNameResolver.suggest('/path/to/project');
    expect(suggestions).toContain('local.my-app');
  });
});

describe('ConfigMigrator', () => {
  it('should migrate v1 to v2', async () => {
    const v1 = new EnvGuardConfig({
      package: 'my-app',
      templateFile: '.env.template',
      manifestVersion: '1.0',
      defaultEnvironment: 'development',
    });

    const v2 = await ConfigMigrator.migrateV1ToV2(v1);
    expect(v2.version).toBe('2.0.0');
    expect(v2.package.name).toBe('my-app');
  });
});
```

### 7.2 Integration Tests

```typescript
describe('envg config commands', () => {
  it('should get config value', async () => {
    execSync('envg config get package.name');
    // Assert output
  });

  it('should set config value', async () => {
    execSync('envg config set environments.default staging');
    // Assert config updated
  });
});
```

### 7.3 E2E Tests

```typescript
describe('E2E: Config Management', () => {
  it('should complete full config lifecycle', async () => {
    // 1. Init with custom package name
    execSync('envg init --package com.test.app');

    // 2. List config
    const config = JSON.parse(
      execSync('envg config list --format json').toString()
    );
    expect(config.package.name).toBe('com.test.app');

    // 3. Add environment
    execSync('envg env add test');

    // 4. Set default
    execSync('envg env default test');

    // 5. Validate
    execSync('envg config validate');
  });
});
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Implement `PackageNameResolver`
- [ ] Add package name validation
- [ ] Create `EnvGuardConfigV2` interface
- [ ] Implement `ConfigMigrator`
- [ ] Update `init` command to use new resolver
- [ ] Add unit tests

### Phase 2: Config Commands (Week 2)

- [ ] Implement `config get` command
- [ ] Implement `config set` command
- [ ] Implement `config list` command
- [ ] Implement `config validate` command
- [ ] Implement `config backup` command
- [ ] Implement `config restore` command
- [ ] Implement `config migrate` command
- [ ] Add integration tests

### Phase 3: Environment Management (Week 3)

- [ ] Implement `env list` command
- [ ] Implement `env add` command
- [ ] Implement `env remove` command
- [ ] Implement `env default` command
- [ ] Implement `env validate` command
- [ ] Add environment validation to all commands
- [ ] Add integration tests

### Phase 4: Documentation & Polish (Week 4)

- [ ] Update README with new commands
- [ ] Add migration guide
- [ ] Add configuration reference docs
- [ ] Update CHANGELOG
- [ ] Add E2E tests
- [ ] Performance testing
- [ ] Security audit

---

## Success Criteria

- [ ] All existing tests pass
- [ ] 95%+ code coverage for new code
- [ ] Automatic migration works for 100% of v1 configs
- [ ] All new commands have help text and examples
- [ ] Documentation is complete
- [ ] No breaking changes for users who use CLI only (auto-migration)
- [ ] Performance: Config operations <100ms

---

## Risk Mitigation

1. **Breaking Changes**: Auto-migration on first command run
2. **Data Loss**: Backups created automatically
3. **Complexity**: Progressive disclosure in CLI
4. **Performance**: Config caching
5. **Compatibility**: Support both v1 and v2 during transition period

---

**Next Steps**: Get approval and start Phase 1 implementation.
