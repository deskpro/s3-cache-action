import * as core from "@actions/core";
import {Outputs} from "../constants";
import path from "path";

export function setCacheHitOutput(isCacheHit: boolean): void {
  core.setOutput(Outputs.CacheHit, isCacheHit.toString());
}

export function uniqueFilename(filepath: string, extension: string) {
  return path.join(filepath, (Math.random().toString(16) + '0000000').substr(2, 8) + '.' + extension);
}
