/**
 * @module @envguard/core/config
 * @description Configuration management
 */

export { ConfigManager } from './config.manager';
export { ConfigParser } from './config.parser';
export { ConfigFactory } from './config.factory';
export { EnvGuardConfig } from './config';
export type { IEnvGuardConfig } from './config';
export {
  PackageNameResolver,
  PackageNameStrategy,
} from './package-name-resolver';
export type {
  IPackageNameOptions,
  IValidationResult,
} from './package-name-resolver';
