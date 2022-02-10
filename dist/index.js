"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareSingleFileReplaceTscAliasPaths = exports.replaceTscAliasPaths = void 0;
const chokidar_1 = require("chokidar");
const globby_1 = require("globby");
const helpers_1 = require("./helpers");
const config_preparer_1 = require("./helpers/config-preparer");
const DEFAULT_CONFIG = {
    watch: false,
    verbose: false,
    declarationDir: undefined,
    output: undefined,
    aliasTrie: undefined
};
function replaceTscAliasPaths(options = Object.assign({}, DEFAULT_CONFIG)) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield (0, config_preparer_1.prepareConfig)(options);
        const output = config.output;
        const globPattern = [
            `${config.outPath}/**/*.{mjs,cjs,js,jsx,d.{mts,cts,ts,tsx}}`,
            `!${config.outPath}/**/node_modules`
        ];
        const files = (0, globby_1.sync)(globPattern, {
            dot: true,
            onlyFiles: true
        });
        const replaceList = yield Promise.all(files.map((file) => (0, helpers_1.replaceAlias)(config, file, options === null || options === void 0 ? void 0 : options.resolveFullPaths)));
        const replaceCount = replaceList.filter(Boolean).length;
        output.info(`${replaceCount} files were affected!`);
        if (options.watch) {
            output.setVerbose(true);
            output.info('[Watching for file changes...]');
            const filesWatcher = (0, chokidar_1.watch)(globPattern);
            const tsconfigWatcher = (0, chokidar_1.watch)(config.configFile);
            const onFileChange = (file) => __awaiter(this, void 0, void 0, function* () { return yield (0, helpers_1.replaceAlias)(config, file, options === null || options === void 0 ? void 0 : options.resolveFullPaths); });
            filesWatcher.on('add', onFileChange);
            filesWatcher.on('change', onFileChange);
            tsconfigWatcher.on('change', () => {
                output.clear();
                filesWatcher.close();
                tsconfigWatcher.close();
                replaceTscAliasPaths(options);
            });
        }
        if (options.declarationDir) {
            replaceTscAliasPaths(Object.assign(Object.assign({}, options), { outDir: options.declarationDir, declarationDir: undefined, output: config.output, aliasTrie: config.aliasTrie }));
        }
    });
}
exports.replaceTscAliasPaths = replaceTscAliasPaths;
function prepareSingleFileReplaceTscAliasPaths(options = Object.assign({}, DEFAULT_CONFIG)) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield (0, config_preparer_1.prepareConfig)(options);
        return ({ fileContents, filePath }) => {
            return (0, helpers_1.replaceAliasString)(config, filePath, fileContents, options === null || options === void 0 ? void 0 : options.resolveFullPaths);
        };
    });
}
exports.prepareSingleFileReplaceTscAliasPaths = prepareSingleFileReplaceTscAliasPaths;
//# sourceMappingURL=index.js.map