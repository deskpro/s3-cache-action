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
const fs_1 = require("fs");
const constants_1 = require("./constants");
const core = __importStar(require("./xcore"));
const utils = __importStar(require("./utils/actionUtils"));
const cache = __importStar(require("./cache"));
const compression = __importStar(require("./compress"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch and validate inputs
            const failOnMiss = core.getInputAsBoolean(constants_1.Inputs.FailOnMiss);
            const performRestore = core.getInputAsBoolean(constants_1.Inputs.Restore);
            const cacheKey = core.getInput(constants_1.Inputs.Key, { required: true });
            const s3AccessKeyId = core.getEnvInput(constants_1.Inputs.S3AccessKeyId, 'AWS_ACCESS_KEY_ID', { required: true });
            const s3SecretAccessKey = core.getEnvInput(constants_1.Inputs.S3SecretAccessKey, 'AWS_SECRET_ACCESS_KEY', { required: true });
            const s3Bucket = core.getEnvInput(constants_1.Inputs.S3Bucket, 'S3_CACHE_BUCKET', { required: true });
            const s3Prefix = core.getInputAsPath(constants_1.Inputs.S3Prefix);
            // Validate paths by requiring path parameter with required
            // if fail on miss is true
            core.getInputAsArray(constants_1.Inputs.Path, { required: !failOnMiss });
            // Save cache keys to state
            const fullCacheKey = s3Prefix + cacheKey;
            core.saveState(constants_1.State.CacheKey, cacheKey);
            core.saveState(constants_1.State.FullCacheKey, fullCacheKey);
            try {
                let cacheHit;
                if (performRestore) {
                    // Perform a restore
                    core.startGroup('Restoring cache file');
                    const archive = utils.uniqueFilename(constants_1.Archive.Path, constants_1.Archive.Extension);
                    cacheHit = yield cache.restore(fullCacheKey, archive, s3Bucket, s3AccessKeyId, s3SecretAccessKey);
                    core.endGroup();
                    if (cacheHit) {
                        core.startGroup('Decompressing cache archive file');
                        yield compression.decompress(archive);
                        fs_1.unlink(archive, () => { });
                        core.endGroup();
                        core.info(`Cache restored from key: ${cacheKey}`);
                    }
                }
                else {
                    // Only check for a cache hit
                    core.startGroup('Checking for cache file');
                    cacheHit = yield cache.has(fullCacheKey, s3Bucket, s3AccessKeyId, s3SecretAccessKey);
                    core.endGroup();
                    if (cacheHit) {
                        core.info(`Cache hit without restore from key: ${cacheKey}`);
                    }
                }
                if (!cacheHit) {
                    if (failOnMiss) {
                        core.setFailed(`Cache miss occurred from key with fail on miss: ${cacheKey}`);
                        return;
                    }
                    else {
                        core.info(`Cache miss occurred from key: ${cacheKey}`);
                    }
                }
                core.saveState(constants_1.State.CacheHit, cacheHit);
                utils.setCacheHitOutput(cacheHit);
            }
            catch (error) {
                core.logWarning(error.message);
                core.saveState(constants_1.State.CacheHit, false);
                utils.setCacheHitOutput(false);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
