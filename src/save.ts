import {Inputs, State, Archive} from "./constants";
import * as core from "./xcore";
import * as cache from "./cache";
import * as utils from './utils/actionUtils';
import * as compression from "./compress";

async function run(): Promise<void> {
  try {
    const noSave = core.getInputAsBoolean(Inputs.NoSave);
    const cacheKey = core.getState(State.CacheKey);
    const cacheHit = core.getStateAsBoolean(State.CacheHit);

    if (noSave) {
      core.info(`no-save mode - not saving state`);
      return;
    }

    if (cacheHit) {
      core.info(`Cache hit occurred on key ${cacheKey}, not saving state.`);
      return;
    }

    const cachePaths = core.getInputAsArray(Inputs.Path);
    const s3AccessKeyId = core.getEnvInput(Inputs.S3AccessKeyId, 'AWS_ACCESS_KEY_ID', {required: true});
    const s3SecretAccessKey = core.getEnvInput(Inputs.S3SecretAccessKey, 'AWS_SECRET_ACCESS_KEY', {required: true});
    const s3Bucket = core.getEnvInput(Inputs.S3Bucket, 'S3_CACHE_BUCKET', {required: true});

    // Compress paths to archive for caching
    core.startGroup('Compressing paths');
    const archive = utils.uniqueFilename(Archive.Path, Archive.Extension);
    await compression.compress(archive, cachePaths);
    core.endGroup();

    // Save archive file to cache store
    core.startGroup('Saving compressed cache file');
    const fullCacheKey = core.getState(State.FullCacheKey);

    const saveStatus = await cache.save(
      fullCacheKey,
      archive,
      s3Bucket,
      s3AccessKeyId,
      s3SecretAccessKey
    );
    core.endGroup();

    if (!saveStatus) {
      core.logWarning('Failed to save cache');
    }
  } catch (error) {
    core.logWarning(error.message);
  }
}

run();
