import * as executor from "@actions/exec";
import * as crypto from 'crypto';
import * as core from '@actions/core';
import {Archive} from "./constants";

/**
 * Generate the environment variables to pass to the AWS CLI tool
 *
 * @param s3AccessKeyId
 * @param s3SecretAccessKey
 */
function createEnvVars(
  s3AccessKeyId?: string,
  s3SecretAccessKey?: string
) {
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
function encodeKey(key: string): string
{
  const digest = crypto.createHash('sha256').update(key).digest('hex') + '.' + Archive.Extension;
  core.info(`Key ${key} hashed to ${digest}`);
  return digest;
}

/**
 * Return the current epoch time
 */
function currentEpoch(): string
{
  return Math.round(Date.now() / 1000).toString();
}

/**
 * Generate metadata string
 *
 * @param key
 */
function metadata(key: string): string {
  return JSON.stringify({
    'atime': currentEpoch(),
    'key': key,
  });
}

async function touchCacheFile(
  key: string,
  encodedKey: string,
  s3bucket: string,
  s3AccessKeyId?: string,
  s3SecretAccessKey?: string
): Promise<boolean>
{
  return await executor.exec("aws", [
    "s3api", "copy-object",
    "--copy-source", s3bucket + '/' + encodedKey,
    "--bucket", s3bucket,
    "--key", encodedKey,
    '--metadata', metadata(key),
    "--metadata-directive", "REPLACE",
  ], createEnvVars(s3AccessKeyId, s3SecretAccessKey)) == 0;
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
export async function restore(
  key: string,
  path: string,
  s3bucket: string,
  s3AccessKeyId?: string,
  s3SecretAccessKey?: string
): Promise<boolean> {
  const encodedKey = encodeKey(key);

  if (!await touchCacheFile(key, encodedKey, s3bucket, s3AccessKeyId, s3SecretAccessKey)) {
    return false;
  }

  return await executor.exec('aws', [
    "s3api", "get-object",
    "--bucket", s3bucket,
    "--key", encodedKey,
    path
  ], createEnvVars(s3AccessKeyId, s3SecretAccessKey)) == 0;
}

/**
 * Checks if the key exists in the cache. Does not perform a restore.
 *
 * @param key
 * @param s3bucket
 * @param s3AccessKeyId
 * @param s3SecretAccessKey
 */
export async function has(
  key: string,
  s3bucket: string,
  s3AccessKeyId?: string,
  s3SecretAccessKey?: string
): Promise<boolean> {
  return touchCacheFile(key, encodeKey(key), s3bucket, s3AccessKeyId, s3SecretAccessKey);
}

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
export async function save(
  key: string,
  path: string,
  s3bucket: string,
  s3AccessKeyId?: string,
  s3SecretAccessKey?: string
): Promise<boolean> {
  return await executor.exec('aws', [
    's3api', 'put-object',
    '--bucket', s3bucket,
    '--key', encodeKey(key),
    '--body', path,
    '--metadata', metadata(key),
  ], createEnvVars(s3AccessKeyId, s3SecretAccessKey)) == 0;
}
