import * as executor from "@actions/exec";

export async function compress(archive: string, paths: string[]): Promise<boolean> {
  return await executor.exec(`tar`, [
    "-c",
    "-f", archive,
    "-I", "pigz",
    "--ignore-failed-read",
    ...paths
  ], {silent: false}) == 0;
}

export async function decompress(archive: string): Promise<boolean> {
  return await executor.exec(`tar`, [
    "-x",
    "-f", archive,
    "-I", "pigz",
  ], {silent: false}) == 0;
}
