import { sync } from 'globby';
import { normalize, relative } from 'path';
import {
  AliasPath,
  IProjectConfig,
  PathLike,
  StringReplacer
} from '../interfaces';
import * as normalizePath from 'normalize-path';

export const mapPaths = (paths: PathLike, mapper: StringReplacer): PathLike => {
  const dest = {} as PathLike;
  Object.keys(paths).forEach((key) => {
    dest[key] = paths[key].map(mapper);
  });
  return dest;
};

export function getProjectDirPathInOutDir(
  outDir: string,
  projectDir: string
): string | undefined {
  const dirs = sync(
    [
      `${outDir}/**/${projectDir}`,
      `!${outDir}/**/${projectDir}/**/${projectDir}`,
      `!${outDir}/**/node_modules`
    ],
    {
      dot: true,
      onlyDirectories: true
    }
  );

  // Find the longest path
  return dirs.reduce(
    (prev, curr) =>
      prev.split('/').length > curr.split('/').length ? prev : curr,
    dirs[0]
  );
}

/**
 * relativeOutPathToConfigDir
 * Finds relative path access of configDir in outPath
 */
export function relativeOutPathToConfigDir(config: IProjectConfig) {
  config.configDirInOutPath = getProjectDirPathInOutDir(
    config.outPath,
    config.confDirParentFolderName
  );

  // Find relative path access of configDir in outPath
  if (config.configDirInOutPath) {
    config.hasExtraModule = true;
    const stepsbackPath = relative(config.configDirInOutPath, config.outPath);
    const splitStepBackPath = normalizePath(stepsbackPath).split('/');
    const nbOfStepBack = splitStepBackPath.length;
    const splitConfDirInOutPath = config.configDirInOutPath.split('/');

    let i = 1;
    const splitRelPath: string[] = [];
    while (i <= nbOfStepBack) {
      splitRelPath.unshift(
        splitConfDirInOutPath[splitConfDirInOutPath.length - i]
      );
      i++;
    }
    config.relConfDirPathInOutPath = splitRelPath.join('/');
  }
}

/**
 * findBasePathOfAlias finds a basepath for every AliasPath.
 * And checks if isExtra should be true or false.
 * @param aliasPath The alias path.
 * @param config config object with all config values.
 */
export function findBasePathOfAlias(config: IProjectConfig) {
  return (path: string) => {
    const aliasPath = { path } as AliasPath;
    if (normalize(aliasPath.path).includes('..')) {
      const tempBasePath = normalizePath(
        normalize(
          `${config.configDir}/${config.outDir}/` +
            `${
              config.hasExtraModule && config.relConfDirPathInOutPath
                ? config.relConfDirPathInOutPath
                : ''
            }/${config.baseUrl}`
        )
      );

      const absoluteBasePath = normalizePath(
        normalize(`${tempBasePath}/${aliasPath.path}`)
      );
      if (config.pathCache.existsResolvedAlias(absoluteBasePath)) {
        aliasPath.isExtra = false;
        aliasPath.basePath = tempBasePath;
      } else {
        aliasPath.isExtra = true;
        aliasPath.basePath = absoluteBasePath;
      }
    } else if (config.hasExtraModule) {
      aliasPath.isExtra = false;
      aliasPath.basePath = normalizePath(
        normalize(
          `${config.configDir}/${config.outDir}/` +
            `${config.relConfDirPathInOutPath}/${config.baseUrl}`
        )
      );
    } else {
      aliasPath.basePath = normalizePath(
        normalize(`${config.configDir}/${config.outDir}`)
      );
      aliasPath.isExtra = false;
    }
    return aliasPath;
  };
}
