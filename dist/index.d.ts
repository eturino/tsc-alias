import { ReplaceTscAliasPathsOptions, IConfig, AliasReplacer, IProjectConfig, AliasReplacerArguments } from './interfaces';
export { ReplaceTscAliasPathsOptions, AliasReplacer, AliasReplacerArguments, IConfig, IProjectConfig };
export declare function replaceTscAliasPaths(options?: ReplaceTscAliasPathsOptions): Promise<void>;
export declare type SingleFileReplacer = (input: {
    fileContents: string;
    filePath: string;
}) => string;
export declare function prepareSingleFileReplaceTscAliasPaths(options?: ReplaceTscAliasPathsOptions): Promise<SingleFileReplacer>;
