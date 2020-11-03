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
const constants_1 = require("./constants");
const core = __importStar(require("./xcore"));
const cache = __importStar(require("./cache"));
const utils = __importStar(require("./utils/actionUtils"));
const compression = __importStar(require("./compress"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cacheKey = core.getState(constants_1.State.CacheKey);
            const cacheHit = core.getStateAsBoolean(constants_1.State.CacheHit);
            if (cacheHit) {
                core.info(`Cache hit occurred on key ${cacheKey}, not saving state.`);
                return;
            }
            const cachePaths = core.getInputAsArray(constants_1.Inputs.Path);
            const s3AccessKeyId = core.getEnvInput(constants_1.Inputs.S3AccessKeyId, 'AWS_ACCESS_KEY_ID', { required: true });
            const s3SecretAccessKey = core.getEnvInput(constants_1.Inputs.S3SecretAccessKey, 'AWS_SECRET_ACCESS_KEY', { required: true });
            const s3Bucket = core.getEnvInput(constants_1.Inputs.S3Bucket, 'S3_CACHE_BUCKET', { required: true });
            // Compress paths to archive for caching
            core.startGroup('Compressing paths');
            const archive = utils.uniqueFilename(constants_1.Archive.Path, constants_1.Archive.Extension);
            yield compression.compress(archive, cachePaths);
            core.endGroup();
            // Save archive file to cache store
            core.startGroup('Saving compressed cache file');
            const fullCacheKey = core.getState(constants_1.State.FullCacheKey);
            const saveStatus = yield cache.save(fullCacheKey, archive, s3Bucket, s3AccessKeyId, s3SecretAccessKey);
            core.endGroup();
            if (!saveStatus) {
                core.logWarning('Failed to save cache');
            }
        }
        catch (error) {
            core.logWarning(error.message);
        }
    });
}
run();
