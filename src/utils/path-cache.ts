import { existsSync } from 'fs';
import { join } from 'path';

export class PathCache {
  useCache: boolean;
  existsCache: Map<string, boolean>;
  absoluteCache: Map<{ basePath: string; aliasPath: string }, string>;

  constructor(useCache: boolean) {
    this.useCache = useCache;
    if (useCache) {
      this.existsCache = new Map();
      this.absoluteCache = new Map();
    }
  }

  /**
   * exists checks if file exists.
   * @param path the filepath to check.
   * @returns boolean.
   */
  private exists(path: string): boolean {
    return (
      existsSync(`${path}`) ||
      existsSync(`${path}.js`) ||
      existsSync(`${path}.jsx`) ||
      existsSync(`${path}.cjs`) ||
      existsSync(`${path}.mjs`) ||
      existsSync(`${path}.d.ts`) ||
      existsSync(`${path}.d.tsx`) ||
      existsSync(`${path}.d.cts`) ||
      existsSync(`${path}.d.mts`)
    );
  }

  /**
   * checks if file exists, uses cache when possible.
   * @param path the filepath to check.
   * @returns boolean
   */
  public existsResolvedAlias(path: string): boolean {
    if (!this.useCache) return this.exists(path);
    if (this.existsCache.has(path)) {
      return this.existsCache.get(path);
    } else {
      const result = this.exists(path);
      this.existsCache.set(path, result);
      return result;
    }
  }

  /**
   * finds the absolute alias path.
   * @param basePath the basepath of the alias.
   * @param aliasPath the aliaspath of the alias.
   * @returns the absolute alias path.
   */
  private getAAP({
    basePath,
    aliasPath
  }: {
    basePath: string;
    aliasPath: string;
  }): string {
    const aliasPathParts = aliasPath
      .split('/')
      .filter((part) => !part.match(/^\.$|^\s*$/));

    let aliasPathPart = aliasPathParts.shift() || '';

    let pathExists: boolean;
    while (
      !(pathExists = existsSync(join(basePath, aliasPathPart))) &&
      aliasPathParts.length
    ) {
      aliasPathPart = aliasPathParts.shift();
    }

    return join(
      basePath,
      pathExists ? aliasPathPart : '',
      aliasPathParts.join('/')
    );
  }

  /**
   * finds the absolute alias path, uses cache when possible.
   * @param basePath the basepath of the alias.
   * @param aliasPath the aliaspath of the alias.
   * @returns the absolute alias path.
   */
  public getAbsoluteAliasPath(basePath: string, aliasPath: string): string {
    const request = { basePath, aliasPath };
    if (!this.useCache) return this.getAAP(request);
    if (this.absoluteCache.has(request)) {
      return this.absoluteCache.get(request);
    } else {
      const result = this.getAAP(request);
      this.absoluteCache.set(request, result);
      return result;
    }
  }
}
