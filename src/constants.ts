import * as os from "os";

export enum Inputs {
  FailOnMiss = "fail-on-miss",
  Restore = "restore",
  NoSave = "no-save",
  Key = "key",
  Path = "path",

  S3Prefix = "s3_prefix",
  S3Bucket = "s3_bucket",
  S3AccessKeyId = "s3_access_key_id",
  S3SecretAccessKey = "s3_secret_access_key"
}

export enum Outputs {
  CacheHit = "cache-hit"
}

export enum State {
  CacheHit = "CACHE_HIT",
  CacheKey = "CACHE_KEY",
  FullCacheKey = "FULL_CACHE_KEY"
}

const Archive = {
  Path: os.tmpdir(),
  Extension: 'gz',
};

export {Archive};
