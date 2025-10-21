/**
 * @file logger.test.ts
 * @description Tests for logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../../src/utils/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default prefix', () => {
      const logger = new Logger();

      logger.info('test');

      expect(consoleSpy.log).toHaveBeenCalledWith('[@envguard/node]', 'test');
    });

    it('should create logger with custom prefix', () => {
      const logger = new Logger('custom');

      logger.info('test');

      expect(consoleSpy.log).toHaveBeenCalledWith('[custom]', 'test');
    });

    it('should respect enabled flag', () => {
      const logger = new Logger('@envguard/node', true);

      logger.debug('test');

      expect(consoleSpy.log).toHaveBeenCalledWith('[@envguard/node]', 'test');
    });

    it('should check ENVGUARD_DEBUG env var', () => {
      const originalEnv = process.env['ENVGUARD_DEBUG'];
      process.env['ENVGUARD_DEBUG'] = 'true';

      const logger = new Logger();
      logger.debug('test');

      expect(consoleSpy.log).toHaveBeenCalledWith('[@envguard/node]', 'test');

      if (originalEnv === undefined) {
        delete process.env['ENVGUARD_DEBUG'];
      } else {
        process.env['ENVGUARD_DEBUG'] = originalEnv;
      }
    });
  });

  describe('debug()', () => {
    it('should log when enabled', () => {
      const logger = new Logger('@envguard/node', true);

      logger.debug('debug message', 'arg1', 'arg2');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[@envguard/node]',
        'debug message',
        'arg1',
        'arg2'
      );
    });

    it('should not log when disabled', () => {
      const logger = new Logger('@envguard/node', false);

      logger.debug('debug message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('info()', () => {
    it('should always log', () => {
      const logger = new Logger('@envguard/node', false);

      logger.info('info message', 'arg1');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[@envguard/node]',
        'info message',
        'arg1'
      );
    });
  });

  describe('warn()', () => {
    it('should always log', () => {
      const logger = new Logger('@envguard/node', false);

      logger.warn('warning message');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[@envguard/node]',
        'warning message'
      );
    });
  });

  describe('error()', () => {
    it('should always log', () => {
      const logger = new Logger('@envguard/node', false);

      logger.error('error message');

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[@envguard/node]',
        'error message'
      );
    });
  });

  describe('enable/disable', () => {
    it('should enable debug logging', () => {
      const logger = new Logger('@envguard/node', false);

      logger.enable();
      logger.debug('test');

      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should disable debug logging', () => {
      const logger = new Logger('@envguard/node', true);

      logger.disable();
      logger.debug('test');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('isEnabled()', () => {
    it('should return enabled state', () => {
      const logger1 = new Logger('@envguard/node', true);
      const logger2 = new Logger('@envguard/node', false);

      expect(logger1.isEnabled()).toBe(true);
      expect(logger2.isEnabled()).toBe(false);
    });
  });
});
