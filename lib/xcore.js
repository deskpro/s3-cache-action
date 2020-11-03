"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputAsInt = exports.getInputAsArray = exports.getInputAsPath = exports.getInputAsBoolean = exports.getEnvInput = exports.getStateAsBoolean = exports.logWarning = void 0;
const core = __importStar(require("@actions/core"));
__exportStar(require("@actions/core"), exports);
function logWarning(message) {
    const warningPrefix = "[warning]";
    core.info(`${warningPrefix}${message}`);
}
exports.logWarning = logWarning;
function getStateAsBoolean(name) {
    return core.getState(name) === 'true';
}
exports.getStateAsBoolean = getStateAsBoolean;
function getEnvInput(name, envName, options) {
    const input = core.getInput(name, Object.assign(Object.assign({}, options), { required: false }));
    if (input) {
        return input;
    }
    if (process.env[envName] !== undefined) {
        return process.env[envName] || '';
    }
    if (options === null || options === void 0 ? void 0 : options.required) {
        throw new Error(`Required input or environment variable not supplied: ${name}/${envName}`);
    }
    return '';
}
exports.getEnvInput = getEnvInput;
function getInputAsBoolean(name, options) {
    return core.getInput(name, options) == 'true';
}
exports.getInputAsBoolean = getInputAsBoolean;
function getInputAsPath(name, options) {
    let input = core.getInput(name, options);
    if (input.length > 0) {
        if (input == '/') {
            input = '';
        }
        else if (input.substr(-1) !== '/') {
            input = input + '/';
        }
    }
    return input;
}
exports.getInputAsPath = getInputAsPath;
function getInputAsArray(name, options) {
    return core
        .getInput(name, options)
        .split("\n")
        .map(s => s.trim())
        .filter(x => x !== "");
}
exports.getInputAsArray = getInputAsArray;
function getInputAsInt(name, options) {
    const value = parseInt(core.getInput(name, options));
    if (isNaN(value) || value < 0) {
        return undefined;
    }
    return value;
}
exports.getInputAsInt = getInputAsInt;
