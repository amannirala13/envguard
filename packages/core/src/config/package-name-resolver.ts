/**
 * @module @envguard/core/config
 * @file package-name-resolver.ts
 * @description Multi-strategy package name resolution for multi-language support
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Package name resolution strategies
 */
export enum PackageNameStrategy {
  AUTO = 'auto', // Try all strategies in order
  REVERSE_DOMAIN = 'reverse-domain', // com.company.app
  NPM = 'npm', // @scope/name or name
  MANUAL = 'manual', // User-provided
}

/**
 * Options for package name resolution
 */
export interface IPackageNameOptions {
  strategy?: PackageNameStrategy;
  projectRoot?: string;
  fallback?: string;
}

/**
 * Validation result
 */
export interface IValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Multi-strategy package name resolver
 * Supports reverse domain notation, npm names, and multi-language projects
 */
export class PackageNameResolver {
  /**
   * Resolve package name using specified strategy
   *
   * @param options - Resolution options
   * @returns Resolved package name
   */
  static async resolve(options: IPackageNameOptions = {}): Promise<string> {
    const strategy = options.strategy || PackageNameStrategy.AUTO;

    switch (strategy) {
      case PackageNameStrategy.REVERSE_DOMAIN:
        return await this.resolveReverseDomain(options);

      case PackageNameStrategy.NPM:
        return await this.resolveFromNpm(options);

      case PackageNameStrategy.AUTO:
        return await this.resolveAuto(options);

      case PackageNameStrategy.MANUAL:
        return this.validateAndReturn(options.fallback || 'my-app');

      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Validate package name format
   *
   * @param name - Package name to validate
   * @returns Validation result
   */
  static validate(name: string): IValidationResult {
    // Not empty
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Package name cannot be empty' };
    }

    // No spaces
    if (/\s/.test(name)) {
      return { valid: false, error: 'Package name cannot contain spaces' };
    }

    // Valid characters
    if (!/^[@a-zA-Z0-9._/-]+$/.test(name)) {
      return {
        valid: false,
        error:
          'Package name can only contain letters, numbers, dots, hyphens, underscores, and slashes',
      };
    }

    // Check if it's reverse domain notation
    if (this.isReverseDomain(name)) {
      return { valid: true };
    }

    // Valid but not reverse domain - show warning
    return {
      valid: true,
      error:
        'Consider using reverse domain notation (e.g., com.company.app) for global uniqueness',
    };
  }

  /**
   * Suggest package names from project context
   *
   * @param projectRoot - Project root directory
   * @returns Array of suggested package names
   */
  static async suggest(projectRoot: string = process.cwd()): Promise<string[]> {
    const suggestions: string[] = [];

    // Try npm name detection
    const npmName = await this.detectNpmName(projectRoot);
    if (npmName) {
      // Add reverse domain version first (recommended)
      suggestions.push(this.npmToReverseDomain(npmName));
      // Add original npm name
      if (npmName !== this.npmToReverseDomain(npmName)) {
        suggestions.push(npmName);
      }
    }

    // Try git remote detection
    const gitRemote = await this.detectGitRemote(projectRoot);
    if (gitRemote) {
      const gitDomain = this.gitToReverseDomain(gitRemote);
      if (!suggestions.includes(gitDomain)) {
        suggestions.push(gitDomain);
      }
    }

    // Add directory name as last resort
    const dirName = await this.detectDirectoryName(projectRoot);
    if (dirName) {
      const localName = `local.${dirName}`;
      if (!suggestions.includes(localName)) {
        suggestions.push(localName);
      }
    }

    return suggestions;
  }

  /**
   * Check if a name follows reverse domain notation
   *
   * @param name - Name to check
   * @returns True if reverse domain format
   */
  static isReverseDomain(name: string): boolean {
    // Match: com.company.app, dev.myorg.project, local.my-app
    // Pattern: tld.domain.name where each part can have letters, numbers, hyphens
    return /^[a-z]+\.[a-z0-9-]+(\.[a-z0-9-]+)*$/i.test(name);
  }

  /**
   * Convert npm package name to reverse domain notation
   *
   * @param npmName - npm package name
   * @returns Reverse domain format
   */
  static npmToReverseDomain(npmName: string): string {
    if (!npmName) {
      return 'local.my-app';
    }

    // @envguard/node → dev.envguard.node
    if (npmName.startsWith('@')) {
      const parts = npmName.slice(1).split('/');
      return `dev.${parts.join('.')}`;
    }

    // my-app → local.my-app
    return `local.${npmName}`;
  }

  /**
   * Convert git remote URL to reverse domain notation
   *
   * @param gitRemote - Git remote URL
   * @returns Reverse domain format
   */
  static gitToReverseDomain(gitRemote: string): string {
    // Extract org/repo from git URLs:
    // git@github.com:company/repo.git → com.github.company.repo
    // https://github.com/company/repo.git → com.github.company.repo

    const sshMatch = gitRemote.match(/git@([^:]+):([^/]+)\/([^.]+)\.git/);
    if (sshMatch && sshMatch[1] && sshMatch[2] && sshMatch[3]) {
      const [, host, org, repo] = sshMatch;
      const domain = host.split('.').reverse().join('.');
      return `${domain}.${org}.${repo}`;
    }

    const httpsMatch = gitRemote.match(
      /https?:\/\/([^/]+)\/([^/]+)\/([^.]+)\.git/
    );
    if (httpsMatch && httpsMatch[1] && httpsMatch[2] && httpsMatch[3]) {
      const [, host, org, repo] = httpsMatch;
      const domain = host.split('.').reverse().join('.');
      return `${domain}.${org}.${repo}`;
    }

    return 'local.git-project';
  }

  /**
   * Resolve using AUTO strategy - try all methods
   *
   * @param options - Resolution options
   * @returns Resolved package name
   */
  private static async resolveAuto(
    options: IPackageNameOptions
  ): Promise<string> {
    const projectRoot = options.projectRoot || process.cwd();

    // Try npm first
    const npmName = await this.detectNpmName(projectRoot);
    if (npmName) {
      return this.npmToReverseDomain(npmName);
    }

    // Try git remote
    const gitRemote = await this.detectGitRemote(projectRoot);
    if (gitRemote) {
      return this.gitToReverseDomain(gitRemote);
    }

    // Try directory name
    const dirName = await this.detectDirectoryName(projectRoot);
    if (dirName) {
      return `local.${dirName}`;
    }

    // Final fallback
    return options.fallback || 'local.my-app';
  }

  /**
   * Resolve using NPM strategy
   *
   * @param options - Resolution options
   * @returns Package name from package.json
   */
  private static async resolveFromNpm(
    options: IPackageNameOptions
  ): Promise<string> {
    const projectRoot = options.projectRoot || process.cwd();
    const npmName = await this.detectNpmName(projectRoot);
    return npmName || options.fallback || 'my-app';
  }

  /**
   * Resolve using REVERSE_DOMAIN strategy
   *
   * @param options - Resolution options
   * @returns Reverse domain package name
   */
  private static async resolveReverseDomain(
    options: IPackageNameOptions
  ): Promise<string> {
    const projectRoot = options.projectRoot || process.cwd();

    // Try npm to reverse domain
    const npmName = await this.detectNpmName(projectRoot);
    if (npmName) {
      return this.npmToReverseDomain(npmName);
    }

    // Try git to reverse domain
    const gitRemote = await this.detectGitRemote(projectRoot);
    if (gitRemote) {
      return this.gitToReverseDomain(gitRemote);
    }

    // Fallback
    return options.fallback || 'local.my-app';
  }

  /**
   * Validate and return package name
   *
   * @param name - Package name
   * @returns Validated name
   */
  private static validateAndReturn(name: string): string {
    const validation = this.validate(name);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid package name');
    }
    return name;
  }

  /**
   * Detect npm package name from package.json
   *
   * @param projectRoot - Project root directory
   * @returns Package name or null
   */
  private static async detectNpmName(
    projectRoot: string
  ): Promise<string | null> {
    const pkgJsonPath = path.join(projectRoot, 'package.json');

    try {
      const content = await fs.readFile(pkgJsonPath, 'utf-8');
      const pkgJson = JSON.parse(content);
      return pkgJson.name || null;
    } catch {
      return null;
    }
  }

  /**
   * Detect git remote URL
   *
   * @param projectRoot - Project root directory
   * @returns Git remote URL or null
   */
  private static async detectGitRemote(
    projectRoot: string
  ): Promise<string | null> {
    try {
      const { stdout } = await execAsync('git remote get-url origin', {
        cwd: projectRoot,
      });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Detect directory name
   *
   * @param projectRoot - Project root directory
   * @returns Directory name
   */
  private static async detectDirectoryName(
    projectRoot: string
  ): Promise<string> {
    const dirName = path.basename(projectRoot);
    // Sanitize: remove spaces, special chars
    return dirName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
}
