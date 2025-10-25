/**
 * @module @envguard/core/config
 * @description Configuration management
 */

export { ConfigManager } from './config.manager';
export { ConfigParser } from './config.parser';
export { ConfigFactory } from './config.factory';
export { EnvGuardConfig, EnvGuardConfigV2 } from './config';
export type {
  IEnvGuardConfig,
  IEnvGuardConfigV2,
  IPackageConfig,
  IEnvironmentConfig,
  IPathsConfig,
  IValidationConfig,
  ISecurityConfig,
  IManifestConfig,
  IConfigMetadata,
} from './config';
export {
  PackageNameResolver,
  PackageNameStrategy,
} from './package-name-resolver';
export type {
  IPackageNameOptions,
  IValidationResult,
} from './package-name-resolver';
export { ConfigMigrator } from './config-migrator';
export type { ConfigVersion, IMigrationResult } from './config-migrator';
