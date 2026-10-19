import type { PluginInput, PluginOutputError } from "@varavel/vdl-plugin-sdk";
import { getOptionString } from "@varavel/vdl-plugin-sdk/utils/options";
import { isValidGoPackageName } from "../shared/naming";

const defaultPackageName = "policy";
const defaultOutFile = "policies.go";

/**
 * Resolved plugin options used by later generation stages.
 */
export type GeneratorOptions = {
  packageName: string;
  outFile: string;
  typesImport: string;
};

/**
 * Resolves and validates the raw plugin options.
 */
export function resolveGeneratorOptions(input: PluginInput): {
  options?: GeneratorOptions;
  errors: PluginOutputError[];
} {
  const packageName = getOptionString(
    input.options,
    "package",
    defaultPackageName,
  ).trim();
  const outFile = getOptionString(
    input.options,
    "outFile",
    defaultOutFile,
  ).trim();
  const typesImport = getOptionString(input.options, "typesImport", "").trim();

  const errors: PluginOutputError[] = [];

  if (packageName.length === 0) {
    errors.push({ message: 'Option "package" cannot be empty when provided.' });
  } else if (!isValidGoPackageName(packageName)) {
    errors.push({
      message: `Invalid Go package name ${JSON.stringify(packageName)}. Use a lowercase Go identifier.`,
    });
  }

  const finalOutFile = outFile.length === 0 ? defaultOutFile : outFile;
  if (!finalOutFile.endsWith(".go")) {
    errors.push({
      message: `Invalid outFile ${JSON.stringify(finalOutFile)}. The output file must end with .go.`,
    });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors: [],
    options: {
      packageName,
      outFile: finalOutFile,
      typesImport,
    },
  };
}
