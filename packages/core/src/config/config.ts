/**
 * @module @envguard/cli/core/config
 * @file config.ts
 * @description Pure data model for EnvGuard configuration (v1 and v2)
 */

import { PackageNameResolver } from './package-name-resolver';

/**
 * Interface for EnvGuard configuration v1 (legacy)
 */
export interface IEnvGuardConfig {
  package: string;
  templateFile: string;
  manifestVersion: string;
  defaultEnvironment: string;
}

/**
 * Package configuration for v2
 */
export interface IPackageConfig {
  name: string;
  displayName?: string;
  type: 'reverse-domain' | 'npm' | 'manual';
}

/**
 * Environment configuration for v2
 */
export interface IEnvironmentConfig {
  allowed: string[];
  default: string;
  naming: 'strict' | 'relaxed';
}

/**
 * Paths configuration for v2
 */
export interface IPathsConfig {
  template: string;
  manifest: string;
}

/**
 * Validation configuration for v2
 */
export interface IValidationConfig {
  enabled: boolean;
  strictMode: boolean;
  enforceRotation: boolean;
}

/**
 * Security configuration for v2
 */
export interface ISecurityConfig {
  auditLog: boolean;
  requireConfirmation: ('delete' | 'export' | 'migrate')[];
  allowedCommands: string[] | 'all';
}

/**
 * Manifest configuration for v2
 */
export interface IManifestConfig {
  version: string;
  autoSync: boolean;
}

/**
 * Config metadata for v2
 */
export interface IConfigMetadata {
  created: string;
  lastModified: string;
  modifiedBy: string;
}

/**
 * Interface for EnvGuard configuration v2
 */
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

/**
 * EnvGuard configuration class - pure data model
 *
 * @remarks
 * This class represents the project-level configuration stored in .envguard/config.json
 * It contains only data and basic accessor methods, no business logic.
 *
 * @example
 * ```ts
 * const config = new EnvGuardConfig({
 *   package: 'my-app',
 *   templateFile: '.env.template',
 *   manifestVersion: '1.0'
 * });
 * ```
 */
export class EnvGuardConfig implements IEnvGuardConfig {
  package: string;
  templateFile: string;
  manifestVersion: string;
  defaultEnvironment: string;

  constructor(data: IEnvGuardConfig) {
    this.package = data.package;
    this.templateFile = data.templateFile;
    this.manifestVersion = data.manifestVersion;
    this.defaultEnvironment = data.defaultEnvironment;
  }

  /**
   * Get package name
   *
   * @returns Package name
   */
  getPackage(): string {
    return this.package;
  }

  /**
   * Get template file path
   *
   * @returns Template file path
   */
  getTemplateFile(): string {
    return this.templateFile;
  }

  /**
   * Get manifest version
   *
   * @returns Manifest version
   */
  getManifestVersion(): string {
    return this.manifestVersion;
  }

  /**
   * Get default environment
   *
   * @returns Default environment name
   */
  getDefaultEnvironment(): string {
    return this.defaultEnvironment;
  }

  /**
   * Convert config to plain object
   *
   * @returns Plain object representation
   */
  toObject(): IEnvGuardConfig {
    return {
      package: this.package,
      templateFile: this.templateFile,
      manifestVersion: this.manifestVersion,
      defaultEnvironment: this.defaultEnvironment,
    };
  }

  /**
   * Check if config is valid (has all required fields)
   *
   * @returns True if valid
   */
  isValid(): boolean {
    return (
      !!this.package &&
      this.package.trim().length > 0 &&
      !!this.templateFile &&
      this.templateFile.trim().length > 0 &&
      !!this.manifestVersion &&
      this.manifestVersion.trim().length > 0 &&
      !!this.defaultEnvironment &&
      this.defaultEnvironment.trim().length > 0
    );
  }
}

/**
 * EnvGuard configuration v2 class - enhanced data model
 *
 * @remarks
 * This class represents the v2 project-level configuration with enhanced features:
 * - Structured package configuration with type detection
 * - Environment management with allowed list
 * - Validation and security policies
 * - Metadata tracking
 *
 * @example
 * ```ts
 * const config = EnvGuardConfigV2.createDefault('com.company.app');
 * config.environments.allowed.push('staging');
 * ```
 */
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
    if (data._warnings !== undefined) {
      this._warnings = data._warnings;
    }
    if (data._metadata !== undefined) {
      this._metadata = data._metadata;
    }
  }

  /**
   * Get package name
   *
   * @returns Package name
   */
  getPackageName(): string {
    return this.package.name;
  }

  /**
   * Get package display name
   *
   * @returns Display name or package name if not set
   */
  getPackageDisplayName(): string {
    return this.package.displayName || this.package.name;
  }

  /**
   * Get template file path
   *
   * @returns Template file path
   */
  getTemplateFile(): string {
    return this.paths.template;
  }

  /**
   * Get manifest file path
   *
   * @returns Manifest file path
   */
  getManifestFile(): string {
    return this.paths.manifest;
  }

  /**
   * Get default environment
   *
   * @returns Default environment name
   */
  getDefaultEnvironment(): string {
    return this.environments.default;
  }

  /**
   * Get allowed environments
   *
   * @returns Array of allowed environment names
   */
  getAllowedEnvironments(): string[] {
    return this.environments.allowed;
  }

  /**
   * Check if an environment is allowed
   *
   * @param env - Environment name
   * @returns True if allowed
   */
  isEnvironmentAllowed(env: string): boolean {
    return this.environments.allowed.includes(env);
  }

  /**
   * Get manifest version
   *
   * @returns Manifest version
   */
  getManifestVersion(): string {
    return this.manifest.version;
  }

  /**
   * Convert config to plain object
   *
   * @returns Plain object representation
   */
  toObject(): IEnvGuardConfigV2 {
    const obj: IEnvGuardConfigV2 = {
      $schema: this.$schema,
      version: this.version,
      package: this.package,
      environments: this.environments,
      paths: this.paths,
      validation: this.validation,
      security: this.security,
      manifest: this.manifest,
    };

    if (this._warnings !== undefined) {
      obj._warnings = this._warnings;
    }
    if (this._metadata !== undefined) {
      obj._metadata = this._metadata;
    }

    return obj;
  }

  /**
   * Update metadata timestamps
   */
  updateMetadata(modifiedBy: string): void {
    if (!this._metadata) {
      this._metadata = {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy,
      };
    } else {
      this._metadata.lastModified = new Date().toISOString();
      this._metadata.modifiedBy = modifiedBy;
    }
  }

  /**
   * Check if config is valid (has all required fields)
   *
   * @returns True if valid
   */
  isValid(): boolean {
    return (
      !!this.package &&
      !!this.package.name &&
      this.package.name.trim().length > 0 &&
      !!this.environments &&
      Array.isArray(this.environments.allowed) &&
      this.environments.allowed.length > 0 &&
      !!this.environments.default &&
      this.environments.allowed.includes(this.environments.default) &&
      !!this.paths &&
      !!this.paths.template &&
      this.paths.template.trim().length > 0
    );
  }

  /**
   * Create a default v2 config
   *
   * @param packageName - Package name
   * @param cliVersion - CLI version for metadata (optional)
   * @returns New EnvGuardConfigV2 instance
   */
  static createDefault(
    packageName: string,
    cliVersion: string = '0.3.0'
  ): EnvGuardConfigV2 {
    // Detect package type
    let packageType: 'reverse-domain' | 'npm' | 'manual' = 'manual';
    if (PackageNameResolver.isReverseDomain(packageName)) {
      packageType = 'reverse-domain';
    } else if (packageName.startsWith('@') || packageName.includes('/')) {
      packageType = 'npm';
    }

    return new EnvGuardConfigV2({
      $schema: 'https://envguard.dev/schemas/config/v2.json',
      version: '2.0.0',
      package: {
        name: packageName,
        type: packageType,
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
        modifiedBy: `envg-cli@${cliVersion}`,
      },
    });
  }
}
