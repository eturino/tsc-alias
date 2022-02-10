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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAliasString = exports.replaceAlias = exports.importReplacers = void 0;
const normalizePath = require("normalize-path");
const findNodeModulesPath = require("find-node-modules");
const path_1 = require("path");
const fs_1 = require("fs");
const utils_1 = require("../utils");
function importReplacers(config, replacers, cmdReplacers) {
    var e_1, _a;
    var _b;
    return __awaiter(this, void 0, void 0, function* () {
        const dir = process.cwd();
        const node_modules = findNodeModulesPath({ cwd: dir });
        const defaultReplacers = {
            default: {
                enabled: true
            },
            BaseUrl: {
                enabled: true
            }
        };
        let merged = Object.assign(Object.assign({}, defaultReplacers), replacers);
        cmdReplacers === null || cmdReplacers === void 0 ? void 0 : cmdReplacers.forEach((v) => {
            merged[v] = {
                enabled: true,
                file: v
            };
        });
        const entries = Object.entries(merged);
        try {
            for (var entries_1 = __asyncValues(entries), entries_1_1; entries_1_1 = yield entries_1.next(), !entries_1_1.done;) {
                const replacer = entries_1_1.value;
                if (replacer[1].enabled) {
                    if (Object.keys(defaultReplacers).includes(replacer[0])) {
                        const replacerModule = yield Promise.resolve().then(() => require(`../replacers/${replacer[0]}.replacer`));
                        config.replacers.push(replacerModule.default);
                    }
                    const file = (_b = replacer[1]) === null || _b === void 0 ? void 0 : _b.file;
                    if (!file) {
                        continue;
                    }
                    const tryImportReplacer = (targetPath) => __awaiter(this, void 0, void 0, function* () {
                        const replacerModule = yield Promise.resolve().then(() => require(targetPath));
                        config.replacers.push(replacerModule.default);
                        config.output.info(`Added replacer "${file}"`);
                    });
                    const path = normalizePath(dir + '/' + file);
                    if ((0, fs_1.existsSync)(path)) {
                        try {
                            yield tryImportReplacer(path);
                            continue;
                        }
                        catch (_c) { }
                    }
                    for (const targetPath of node_modules.map((v) => (0, path_1.join)(dir, v, file))) {
                        try {
                            yield tryImportReplacer(targetPath);
                            continue;
                        }
                        catch (_d) { }
                    }
                    config.output.error(`Failed to import replacer "${file}"`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) yield _a.call(entries_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.importReplacers = importReplacers;
function replaceAlias(config, file, resolveFullPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = yield fs_1.promises.readFile(file, 'utf8');
        const tempCode = replaceAliasString(config, file, code, resolveFullPath);
        if (code !== tempCode) {
            yield fs_1.promises.writeFile(file, tempCode, 'utf8');
            return true;
        }
        return false;
    });
}
exports.replaceAlias = replaceAlias;
function replaceAliasString(config, file, code, resolveFullPath) {
    let tempCode = code;
    config.replacers.forEach((replacer) => {
        tempCode = (0, utils_1.replaceSourceImportPaths)(tempCode, file, (orig) => replacer({
            orig,
            file,
            config
        }));
    });
    if (resolveFullPath) {
        tempCode = (0, utils_1.resolveFullImportPaths)(tempCode, file);
    }
    return tempCode;
}
exports.replaceAliasString = replaceAliasString;
//# sourceMappingURL=replacers.js.map