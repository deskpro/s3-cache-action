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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Archive = exports.State = exports.Outputs = exports.Inputs = void 0;
const os = __importStar(require("os"));
var Inputs;
(function (Inputs) {
    Inputs["FailOnMiss"] = "fail-on-miss";
    Inputs["Restore"] = "restore";
    Inputs["Key"] = "key";
    Inputs["Path"] = "path";
    Inputs["S3Prefix"] = "s3_prefix";
    Inputs["S3Bucket"] = "s3_bucket";
    Inputs["S3AccessKeyId"] = "s3_access_key_id";
    Inputs["S3SecretAccessKey"] = "s3_secret_access_key";
})(Inputs = exports.Inputs || (exports.Inputs = {}));
var Outputs;
(function (Outputs) {
    Outputs["CacheHit"] = "cache-hit";
})(Outputs = exports.Outputs || (exports.Outputs = {}));
var State;
(function (State) {
    State["CacheHit"] = "CACHE_HIT";
    State["CacheKey"] = "CACHE_KEY";
    State["FullCacheKey"] = "FULL_CACHE_KEY";
})(State = exports.State || (exports.State = {}));
const Archive = {
    Path: os.tmpdir(),
    Extension: 'gz',
};
exports.Archive = Archive;
