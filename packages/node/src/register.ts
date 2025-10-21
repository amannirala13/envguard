/**
 * @module @envguard/node/register
 * @description Node.js --require hook entry point
 *
 * Usage:
 * ```bash
 * node --require @envguard/node/register app.js
 * ```
 *
 * Environment variables:
 * - ENVGUARD_ENV: Override environment
 * - ENVGUARD_DEBUG: Enable debug logging
 */

import { load } from './loader';
import { logger } from './utils/logger';

// Load secrets before application starts
(async () => {
  logger.debug('Loading secrets via --require hook');

  try {
    const options: any = {
      debug: process.env['ENVGUARD_DEBUG'] === 'true',
    };

    const envVar = process.env['ENVGUARD_ENV'];
    if (envVar) {
      options.environment = envVar;
    }

    const result = await load(options);

    if (!result.success) {
      logger.error('Failed to load secrets via --require hook');
      process.exit(1);
    }

    logger.debug(`Loaded ${result.count} secrets via --require hook`);
  } catch (error) {
    logger.error('Fatal error loading secrets:', error);
    process.exit(1);
  }
})();
