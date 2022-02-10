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
exports.prepareConfig = void 0;
const normalizePath = require("normalize-path");
const utils_1 = require("../utils");
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = require("./config");
const replacers_1 = require("./replacers");
function prepareConfig(options = {
    watch: false,
    verbose: false,
    declarationDir: undefined,
    output: undefined,
    aliasTrie: undefined
}) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const output = (_a = options.output) !== null && _a !== void 0 ? _a : new utils_1.Output(options.verbose);
        const configFile = !options.configFile
            ? (0, path_1.resolve)(process.cwd(), 'tsconfig.json')
            : !(0, path_1.isAbsolute)(options.configFile)
                ? (0, path_1.resolve)(process.cwd(), options.configFile)
                : options.configFile;
        output.assert((0, fs_1.existsSync)(configFile), `Invalid file path => ${configFile}`);
        const { baseUrl = './', outDir, declarationDir, paths, replacers, resolveFullPaths, verbose } = (0, config_1.loadConfig)(configFile);
        output.setVerbose(verbose);
        if (options.resolveFullPaths || resolveFullPaths) {
            options.resolveFullPaths = true;
        }
        const _outDir = (_b = options.outDir) !== null && _b !== void 0 ? _b : outDir;
        if (declarationDir && _outDir !== declarationDir) {
            (_c = options.declarationDir) !== null && _c !== void 0 ? _c : (options.declarationDir = declarationDir);
        }
        output.assert(_outDir, 'compilerOptions.outDir is not set');
        const configDir = normalizePath((0, path_1.dirname)(configFile));
        const projectConfig = {
            configFile: configFile,
            baseUrl: baseUrl,
            outDir: _outDir,
            configDir: configDir,
            outPath: normalizePath((0, path_1.normalize)(configDir + '/' + _outDir)),
            confDirParentFolderName: (0, path_1.basename)(configDir),
            hasExtraModule: false,
            configDirInOutPath: null,
            relConfDirPathInOutPath: null,
            pathCache: new utils_1.PathCache(!options.watch)
        };
        const config = Object.assign(Object.assign({}, projectConfig), { output: output, aliasTrie: (_d = options.aliasTrie) !== null && _d !== void 0 ? _d : utils_1.TrieNode.buildAliasTrie(projectConfig, paths), replacers: [] });
        yield (0, replacers_1.importReplacers)(config, replacers, options.replacers);
        return config;
    });
}
exports.prepareConfig = prepareConfig;
//# sourceMappingURL=config-preparer.js.map