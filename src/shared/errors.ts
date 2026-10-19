import type { PluginOutputError, Position } from "@varavel/vdl-plugin-sdk";

/**
 * Error type used for generator failures that can be tied to a source position.
 */
export class GenerationError extends Error {
  readonly position?: Position;

  /**
   * Creates a generation error with an optional VDL source position.
   */
  constructor(message: string, position?: Position) {
    super(message);
    this.name = "GenerationError";
    this.position = position;
  }
}

/**
 * Throws a positioned generation error.
 */
export function fail(message: string, position?: Position): never {
  throw new GenerationError(message, position);
}

/**
 * Converts an unknown runtime error into the plugin output error shape.
 */
export function toPluginOutputError(error: unknown): PluginOutputError {
  if (error instanceof GenerationError) {
    return error.position
      ? { message: error.message, position: error.position }
      : { message: error.message };
  }

  if (error instanceof Error) {
    const position = (error as { position?: Position }).position;
    return position
      ? { message: error.message, position }
      : { message: error.message };
  }

  return { message: "An unknown generation error occurred." };
}
