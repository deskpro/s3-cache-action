import * as core from "@actions/core";
export * from "@actions/core";

export function logWarning(message: string): void {
  const warningPrefix = "[warning]";
  core.info(`${warningPrefix}${message}`);
}

export function getStateAsBoolean(name: string) {
  return core.getState(name) === 'true';
}

export function getEnvInput(
  name: string,
  envName: string,
  options?: core.InputOptions,
): string {
  const input = core.getInput(name, {...options, required: false});

  if (input) {
    return input;
  }

  if (process.env[envName] !== undefined) {
    return process.env[envName] || '';
  }

  if (options?.required) {
    throw new Error(`Required input or environment variable not supplied: ${name}/${envName}`)
  }

  return '';
}

export function getInputAsBoolean(
  name: string,
  options?: core.InputOptions
): boolean {
  return core.getInput(name, options) == 'true';
}

export function getInputAsPath(
  name: string,
  options?: core.InputOptions
): string
{
  let input = core.getInput(name, options);

  if (input.length > 0) {
    if (input == '/') {
      input = '';
    } else if (input.substr(-1) !== '/') {
      input = input + '/';
    }
  }

  return input;
}

export function getInputAsArray(
  name: string,
  options?: core.InputOptions
): string[] {
  return core
    .getInput(name, options)
    .split("\n")
    .map(s => s.trim())
    .filter(x => x !== "");
}

export function getInputAsInt(
  name: string,
  options?: core.InputOptions
): number | undefined {
  const value = parseInt(core.getInput(name, options));
  if (isNaN(value) || value < 0) {
    return undefined;
  }
  return value;
}
