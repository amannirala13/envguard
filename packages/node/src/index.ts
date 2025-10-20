/**
 * @module @envguard/node
 * @description Node.js runtime integration for EnvGuard
 */

// Re-export core functionality for convenience
export { SystemKeychain } from '@envguard/core';
export type { IKeychainProvider } from '@envguard/core';

// TODO: Implement EnvGuardRuntime class
// TODO: Implement preload hook for --require flag
// TODO: Implement environment variable resolution

/**
 * Placeholder for Node.js runtime integration
 *
 * @example
 * ```typescript
 * import { EnvGuardRuntime } from '@envguard/node';
 *
 * const runtime = new EnvGuardRuntime();
 * await runtime.resolveAll();
 * ```
 */
export class EnvGuardRuntime {
  constructor() {
    // TODO: Implement constructor
    throw new Error(
      'EnvGuardRuntime not yet implemented. Please implement this class.'
    );
  }
}

export const version = '0.1.0';
