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
exports.save = exports.has = exports.restore = void 0;
const executor = __importStar(require("@actions/exec"));
const crypto = __importStar(require("crypto"));
const core = __importStar(require("@actions/core"));
const constants_1 = require("./constants");
/**
 * Generate the environment variables to pass to the AWS CLI tool
 *
 * @param s3AccessKeyId
 * @param s3SecretAccessKey
 */
function createEnvVars(s3AccessKeyId, s3SecretAccessKey) {
    return {
        ignoreReturnCode: true,
        silent: false,
        env: {
            'AWS_ACCESS_KEY_ID': s3AccessKeyId || "",
            'AWS_SECRET_ACCESS_KEY': s3SecretAccessKey || "",
            'AWS_DEFAULT_REGION': 'us-east-1',
        }
    };
}
/**
 * Convert a cache key in to a sha digest for safe use in S3
 *
 * @param key
 */
function encodeKey(key) {
    const digest = crypto.createHash('sha256').update(key).digest('hex') + '.' + constants_1.Archive.Extension;
    core.info(`Key ${key} hashed to ${digest}`);
    return digest;
}
/**
 * Return the current epoch time
 */
function currentEpoch() {
    return Math.round(Date.now() / 1000).toString();
}
/**
 * Generate metadata string
 *
 * @param key
 */
function metadata(key) {
    return JSON.stringify({
        'atime': currentEpoch(),
        'key': key,
    });
}
function touchCacheFile(key, encodedKey, s3bucket, s3AccessKeyId, s3SecretAccessKey) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield executor.exec("aws", [
            "s3api", "copy-object",
            "--copy-source", s3bucket + '/' + encodedKey,
            "--bucket", s3bucket,
            "--key", encodedKey,
            '--metadata', metadata(key),
            "--metadata-directive", "REPLACE",
        ], createEnvVars(s3AccessKeyId, s3SecretAccessKey))) == 0;
    });
}
/**
 * Restores an item from the cache for the key ${key}
 *
 * @param key
 * @param path
 * @param s3bucket
 * @param s3AccessKeyId
 * @param s3SecretAccessKey
 */
function restore(key, path, s3bucket, s3AccessKeyId, s3SecretAccessKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const encodedKey = encodeKey(key);
        if (!(yield touchCacheFile(key, encodedKey, s3bucket, s3AccessKeyId, s3SecretAccessKey))) {
            return false;
        }
        return (yield executor.exec('aws', [
            "s3api", "get-object",
            "--bucket", s3bucket,
            "--key", encodedKey,
            path
        ], createEnvVars(s3AccessKeyId, s3SecretAccessKey))) == 0;
    });
}
exports.restore = restore;
/**
 * Checks if the key exists in the cache. Does not perform a restore.
 *
 * @param key
 * @param s3bucket
 * @param s3AccessKeyId
 * @param s3SecretAccessKey
 */
function has(key, s3bucket, s3AccessKeyId, s3SecretAccessKey) {
    return __awaiter(this, void 0, void 0, function* () {
        return touchCacheFile(key, encodeKey(key), s3bucket, s3AccessKeyId, s3SecretAccessKey);
    });
}
exports.has = has;
/**
 * Save the file at path ${path} under the key ${key}
 * in the S3 bucket ${bucket}, regardless of whether
 * it already exists.
 *
 * @param key
 * @param path
 * @param s3bucket
 * @param s3AccessKeyId
 * @param s3SecretAccessKey
 */
function save(key, path, s3bucket, s3AccessKeyId, s3SecretAccessKey) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield executor.exec('aws', [
            's3api', 'put-object',
            '--bucket', s3bucket,
            '--key', encodeKey(key),
            '--body', path,
            '--metadata', metadata(key),
        ], createEnvVars(s3AccessKeyId, s3SecretAccessKey))) == 0;
    });
}
exports.save = save;
