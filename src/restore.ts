import {unlink} from "fs";

import {Archive, Inputs, State} from "./constants";
import * as core from "./xcore";
import * as utils from "./utils/actionUtils";
import * as cache from "./cache";
import * as compression from "./compress";

async function run(): Promise<void> {
  try {
    // Fetch and validate inputs
    const failOnMiss = core.getInputAsBoolean(Inputs.FailOnMiss)
    const performRestore = core.getInputAsBoolean(Inputs.Restore)
    const cacheKey = core.getInput(Inputs.Key, { required: true });
    const s3AccessKeyId = core.getEnvInput(Inputs.S3AccessKeyId, 'AWS_ACCESS_KEY_ID', {required: true});
    const s3SecretAccessKey = core.getEnvInput(Inputs.S3SecretAccessKey, 'AWS_SECRET_ACCESS_KEY', {required: true});
    const s3Bucket = core.getEnvInput(Inputs.S3Bucket, 'S3_CACHE_BUCKET', {required: true});
    const s3Prefix = core.getInputAsPath(Inputs.S3Prefix);

    // Validate paths by requiring path parameter with required
    // if fail on miss is true
    core.getInputAsArray(Inputs.Path, {required: !failOnMiss});

    // Save cache keys to state
    const fullCacheKey = s3Prefix + cacheKey;
    core.saveState(State.CacheKey, cacheKey);
    core.saveState(State.FullCacheKey, fullCacheKey);

    try {
      let cacheHit: boolean;

      if (performRestore) {
        // Perform a restore
        core.startGroup('Restoring cache file');
        const archive = utils.uniqueFilename(Archive.Path, Archive.Extension);

        cacheHit = await cache.restore(
          fullCacheKey,
          archive,
          s3Bucket,
          s3AccessKeyId,
          s3SecretAccessKey
        );
        core.endGroup();

        if (cacheHit) {
          core.startGroup('Decompressing cache archive file');
          await compression.decompress(archive);
          unlink(archive, () => {});
          core.endGroup();

          core.info(`Cache restored from key: ${cacheKey}`);
        }
      } else {
        // Only check for a cache hit
        core.startGroup('Checking for cache file');
        cacheHit = await cache.has(
          fullCacheKey,
          s3Bucket,
          s3AccessKeyId,
          s3SecretAccessKey
        );
        core.endGroup();

        if (cacheHit) {
          core.info(`Cache hit without restore from key: ${cacheKey}`);
        }
      }

      if (!cacheHit) {
        if (failOnMiss) {
          core.setFailed(`Cache miss occurred from key with fail on miss: ${cacheKey}`);
          return;
        } else {
          core.info(`Cache miss occurred from key: ${cacheKey}`);
        }
      }

      core.saveState(State.CacheHit, cacheHit);
      utils.setCacheHitOutput(cacheHit);
    } catch (error) {
      core.logWarning(error.message);
      core.saveState(State.CacheHit, false);
      utils.setCacheHitOutput(false);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
